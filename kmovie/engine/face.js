/* ============================================================
   케이무비 얼굴 가리기 (KMV_FACE) — 초상권
   ------------------------------------------------------------
   학교 영상엔 찍히면 안 되는 얼굴이 꼭 하나씩 있다. 클립에 「얼굴 가리기」를 켜면
   그 클립의 모든 프레임에서 얼굴을 찾아 모자이크 또는 흐리게 덮는다.
   · 탐지: MediaPipe Face Detection(full range, 5m) 을 kmovie/vendor/face-det/ 에서 지연 로드.
     외부 API 0 · 영상 반출 0 (브라우저 안에서만 돈다). 모델은 한 번에 한 장 — 요청은 줄 세운다.
   · 좌표: 인물 컷아웃(KMV_SEG)과 같은 640×360 "fit" 작업 좌표(0~1 비율). 렌더는 마스크 캔버스를
     켄 번즈·리프레임과 같은 변환으로 그려 덮으므로 위치가 어긋나지 않는다.
   · 흔들림·깜빡임: 한 장의 탐지는 프레임마다 조금씩 튀고 가끔 한 장을 놓친다 — 놓친 한 장이
     곧 얼굴 노출이다. 그래서 덮개는 idx±HOLD(6프레임) 안에서 캐시된 탐지를 전부 합쳐 쓴다.
     내보내기는 idx 와 idx+HOLD 를 미리 탐지해 두므로 창 안이 전부 차 있다(결정적).
     미리보기(정지)는 idx 만 정확히 기다리고 창 안 나머지는 있는 만큼, 재생 중엔 캐시에 가까운 것.
   · 덮개는 얼굴 상자보다 넉넉히(가로 1.5·세로 1.8, 위로 당김) — 머리카락·턱까지.
   · 직접 가리기 칸(rects)은 화면 좌표(0~1) 고정 사각형 — 명찰·번호판·뒤 사람처럼 얼굴이 아닌 것.
   ============================================================ */
(function (g) {
  'use strict';
  const VENDOR = 'vendor/face-det/';
  const SW = 640, SH = 360;                 // 작업 해상도 (fit 좌표계 — KMV_SEG 와 같음)
  const HOLD = 6;                           // 앞뒤로 합칠 프레임 수
  const CACHE_MAX = 2400;                   // 상자 배열은 작다 — 80초 분량
  const MARGIN_W = 1.5, MARGIN_H = 1.8, LIFT = 0.12;   // 덮개 여유 (얼굴 상자 대비), 위로 당기는 비율(세로 높이 기준)
  const LEVEL = { a: { block: 0.035, blur: 0.010 }, b: { block: 0.055, blur: 0.018 }, c: { block: 0.085, blur: 0.030 } };   // 화면 너비 비율
  const cache = new Map();                  // key → [{x,y,w,h}] (fit 좌표 0~1, 탐지 원본 상자)
  let state = 'idle', inst = null, loadP = null, chain = Promise.resolve();
  let inCv = null, inCtx = null, maskCv = null, maskCtx = null, workCv = null, workCtx = null, smallCv = null, smallCtx = null;
  let detector = null;                      // 테스트·대체용 — (canvas SW×SH) → Promise<[{x,y,w,h}]>
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function load() {
    if (state === 'ready') return Promise.resolve(true);
    if (state === 'fail') return Promise.resolve(false);
    if (loadP) return loadP;
    state = 'loading';
    loadP = new Promise(res => {
      if (detector) { state = 'ready'; return res(true); }
      const fail = e => { console.warn('[KMV face] 로드 실패', e); state = 'fail'; res(false); };
      const boot = () => {
        try {
          if (!g.FaceDetection) return fail('no FaceDetection');
          inst = new g.FaceDetection({ locateFile: f => VENDOR + f });
          inst.setOptions({ model: 'full', selfieMode: false, minDetectionConfidence: 0.45 });
          (inst.initialize ? inst.initialize() : Promise.resolve()).then(() => { state = 'ready'; res(true); }).catch(fail);
        } catch (e) { fail(e); }
      };
      if (g.FaceDetection) return boot();
      const s = document.createElement('script'); s.src = VENDOR + 'face_detection.js'; s.onload = boot; s.onerror = fail; document.head.appendChild(s);
    });
    return loadP;
  }

  function key(mediaId, idx) { return mediaId + ':' + idx; }
  function touch(k) { const v = cache.get(k); if (v) { cache.delete(k); cache.set(k, v); } return v; }
  function cached(mediaId, idx) { return touch(key(mediaId, idx)) || null; }
  function nearest(mediaId, idx, tol) {
    tol = tol == null ? 15 : tol;
    let best = null, bd = tol + 1;
    for (const [k, v] of cache) { const i = k.lastIndexOf(':'); if (k.slice(0, i) !== mediaId) continue; const d = Math.abs(+k.slice(i + 1) - idx); if (d < bd) { bd = d; best = v; } }
    return best;
  }

  /* 한 장 추론 — 얼굴 상자(fit 좌표 0~1) 배열. 실패하면 null(캐시 안 함). */
  function infer(img, rot) {
    if (!inCv) { inCv = document.createElement('canvas'); inCv.width = SW; inCv.height = SH; inCtx = inCv.getContext('2d', { willReadFrequently: true }); }
    inCtx.setTransform(1, 0, 0, 1, 0, 0); inCtx.fillStyle = '#000'; inCtx.fillRect(0, 0, SW, SH);
    g.KMV_MEDIA.drawFit(inCtx, img, SW, SH, rot);
    if (detector) return Promise.resolve().then(() => detector(inCv)).then(b => Array.isArray(b) ? b.map(norm) : null).catch(() => null);
    return new Promise(resolve => {
      let done = false;
      const finish = v => { if (!done) { done = true; resolve(v); } };
      try {
        inst.onResults(res => {
          try {
            const out = [];
            for (const d of (res.detections || [])) {
              const bb = d.boundingBox; if (!bb) continue;
              out.push(norm({ x: bb.xCenter - bb.width / 2, y: bb.yCenter - bb.height / 2, w: bb.width, h: bb.height }));
            }
            finish(out);
          } catch (e) { finish(null); }
        });
        const p = inst.send({ image: inCv }); if (p && p.catch) p.catch(() => finish(null));
        setTimeout(() => finish(null), 8000);
      } catch (e) { finish(null); }
    });
  }
  function norm(b) { const x = clamp(+b.x || 0, 0, 1), y = clamp(+b.y || 0, 0, 1); return { x, y, w: clamp(+b.w || 0, 0, 1 - x), h: clamp(+b.h || 0, 0, 1 - y) }; }

  /* 정확 프레임 탐지(await). img 는 이 idx 의 원본 프레임. 결과는 캐시에 남는다. */
  function detect(mediaId, idx, img) {
    const c = cached(mediaId, idx); if (c) return Promise.resolve(c);
    if (!img) return Promise.resolve(null);
    const src = g.KMV_MEDIA.get(mediaId), rot = src ? src.rot : 0;
    const job = chain.then(async () => {
      if (!(await load())) return null;
      const again = cached(mediaId, idx); if (again) return again;
      const b = await infer(img, rot);
      if (b) { cache.set(key(mediaId, idx), b); if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value); }
      return b;
    });
    chain = job.catch(() => null);
    return job;
  }

  /* 덮개 상자(fit 좌표) — idx±HOLD 안의 캐시된 탐지를 전부 모아 겹치는 것끼리 합친다.
     창 안에 캐시가 하나도 없으면 가까운 프레임(tol) 것. 상자는 MARGIN 만큼 넉넉히. */
  function boxesAt(mediaId, idx, opts) {
    const tol = opts && opts.tol != null ? opts.tol : 15;
    let raw = [], any = false;
    for (let i = idx - HOLD; i <= idx + HOLD; i++) { const b = cache.get(key(mediaId, i)); if (b) { any = true; raw = raw.concat(b); } }
    if (!any) { const nb = nearest(mediaId, idx, tol); if (nb) raw = nb.slice(); }
    return merge(raw.map(grow));
  }
  function grow(b) {
    const w = b.w * MARGIN_W, h = b.h * MARGIN_H, cx = b.x + b.w / 2, cy = b.y + b.h / 2 - b.h * LIFT;
    return norm({ x: cx - w / 2, y: cy - h / 2, w, h });
  }
  function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function merge(list) {
    const out = [];
    for (const b of list) {
      let cur = { x: b.x, y: b.y, w: b.w, h: b.h }, again = true;
      while (again) {
        again = false;
        for (let i = 0; i < out.length; i++) {
          if (!overlap(out[i], cur)) continue;
          const o = out.splice(i, 1)[0];
          const x0 = Math.min(o.x, cur.x), y0 = Math.min(o.y, cur.y), x1 = Math.max(o.x + o.w, cur.x + cur.w), y1 = Math.max(o.y + o.h, cur.y + cur.h);
          cur = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; again = true; break;
        }
      }
      out.push(cur);
    }
    return out;
  }
  /* 창 안에 빠진 프레임이 있나 (정지 미리보기가 정확해지려면 idx 자체는 있어야 한다) */
  function pending(mediaId, idx) { return !cache.has(key(mediaId, idx)); }

  /* ---------- 그리기 ----------
     ctx 에 이미 클립 프레임이 그려진 뒤(룩 전) 부른다.
     boxes = fit 좌표 상자(자동), rects = 화면 좌표 상자(직접), face = 클립 설정 {mode, level}.
     fitMask(mctx, maskCanvas) = 마스크 캔버스(SW×SH)를 켄 번즈·리프레임 변환으로 mctx 에 그려 주는 함수(렌더가 준다). */
  function cover(ctx, W, H, face, boxes, rects, fitMask) {
    if (!boxes.length && !rects.length) return;
    const lv = LEVEL[face.level] || LEVEL.b;
    if (!workCv) { workCv = mk(W, H); workCtx = workCv.getContext('2d'); }
    if (workCv.width !== W || workCv.height !== H) { workCv.width = W; workCv.height = H; }
    const wx = workCtx; wx.setTransform(1, 0, 0, 1, 0, 0); wx.globalCompositeOperation = 'source-over'; wx.globalAlpha = 1; wx.filter = 'none';
    wx.clearRect(0, 0, W, H);
    // 1. 프레임 전체를 모자이크/흐리게 → workCv
    if (face.mode === 'blur') {
      const r = Math.max(4, Math.round(W * lv.blur));
      wx.filter = 'blur(' + r + 'px)'; wx.drawImage(ctx.canvas, 0, 0); wx.filter = 'none';
    } else {
      const bs = Math.max(4, Math.round(W * lv.block)), sw = Math.max(1, Math.round(W / bs)), sh = Math.max(1, Math.round(H / bs));
      if (!smallCv) { smallCv = mk(sw, sh); smallCtx = smallCv.getContext('2d'); }
      if (smallCv.width !== sw || smallCv.height !== sh) { smallCv.width = sw; smallCv.height = sh; }
      smallCtx.imageSmoothingEnabled = true; smallCtx.clearRect(0, 0, sw, sh); smallCtx.drawImage(ctx.canvas, 0, 0, sw, sh);
      wx.imageSmoothingEnabled = false; wx.drawImage(smallCv, 0, 0, sw, sh, 0, 0, W, H); wx.imageSmoothingEnabled = true;
    }
    // 2. 마스크 — 자동 상자는 fit 좌표(변환 태움), 직접 칸은 화면 좌표 그대로
    if (!maskCv) { maskCv = mk(SW, SH); maskCtx = maskCv.getContext('2d'); }
    const mx = maskCtx; mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, SW, SH); mx.fillStyle = '#fff';
    for (const b of boxes) { mx.beginPath(); mx.ellipse((b.x + b.w / 2) * SW, (b.y + b.h / 2) * SH, Math.max(2, b.w * SW / 2), Math.max(2, b.h * SH / 2), 0, 0, Math.PI * 2); mx.fill(); }
    wx.globalCompositeOperation = 'destination-in';
    if (!tmpCv) { tmpCv = mk(W, H); tmpCtx = tmpCv.getContext('2d'); }
    if (tmpCv.width !== W || tmpCv.height !== H) { tmpCv.width = W; tmpCv.height = H; }
    const tx = tmpCtx; tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-over'; tx.globalAlpha = 1; tx.clearRect(0, 0, W, H);
    if (boxes.length) { if (fitMask) fitMask(tx, maskCv); else tx.drawImage(maskCv, 0, 0, W, H); }
    tx.setTransform(1, 0, 0, 1, 0, 0); tx.fillStyle = '#fff';
    for (const r of rects) tx.fillRect(Math.round(r.x * W), Math.round(r.y * H), Math.round(r.w * W), Math.round(r.h * H));
    wx.drawImage(tmpCv, 0, 0);
    wx.globalCompositeOperation = 'source-over';
    // 3. 덮기
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(workCv, 0, 0); ctx.restore();
  }
  let tmpCv = null, tmpCtx = null;
  function mk(w, h) { return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h }); }

  function status() { return state; }
  function clear(mediaId) { for (const k of Array.from(cache.keys())) if (!mediaId || k.startsWith(mediaId + ':')) cache.delete(k); }
  /* 테스트·대체 탐지기 끼우기 — fn(canvas SW×SH) → [{x,y,w,h}] (fit 0~1) */
  function setDetector(fn) { detector = fn || null; if (fn) { state = 'ready'; loadP = null; } }

  g.KMV_FACE = { SW, SH, HOLD, LEVEL, load, detect, cached, nearest, boxesAt, pending, cover, grow, merge, clear, status, setDetector, cacheSize: () => cache.size };
})(typeof window !== 'undefined' ? window : globalThis);
