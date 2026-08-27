/* ============================================================
   케이무비 인물 컷아웃 (KMV_SEG) — 설계서 v1 §1 "인물 뒤 글자"
   ------------------------------------------------------------
   MediaPipe Selfie Segmentation 을 케이메이커 R134 가 자체 호스팅한 자리
   (maker-playground/vendor/selfie-seg/) 에서 지연 로드한다. 외부 API 0 · 영상 반출 0.
   · mask(mediaId, idx, img) → 사람 확률이 알파인 캔버스(SW×SH). 프레임별 LRU 캐시.
   · nearest(mediaId, idx) → 캐시에 가까운 프레임이 있으면 그것(재생 중 미리보기용).
   · 모델은 한 번에 한 장 — 요청은 줄 세운다. 실패하면 null(부품이 그냥 앞에 그려진다).
   프레임별 결과는 결정적이라 미리보기 = 내보내기.
   ============================================================ */
(function (g) {
  'use strict';
  const VENDOR = '../maker-playground/vendor/selfie-seg/';
  const SW = 640, SH = 360;         // 작업 해상도 (모델 내부는 256×144 — 더 키워도 정밀도가 안 오른다)
  const CACHE_MAX = 300;
  const cache = new Map();          // key → canvas
  let state = 'idle', inst = null, loadP = null, chain = Promise.resolve();
  let inCv = null, inCtx = null;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function load() {
    if (state === 'ready') return Promise.resolve(true);
    if (state === 'fail') return Promise.resolve(false);
    if (loadP) return loadP;
    state = 'loading';
    loadP = new Promise(res => {
      const fail = e => { console.warn('[KMV seg] 로드 실패', e); state = 'fail'; res(false); };
      const boot = () => {
        try {
          if (!g.SelfieSegmentation) return fail('no SelfieSegmentation');
          inst = new g.SelfieSegmentation({ locateFile: f => VENDOR + f });
          inst.setOptions({ modelSelection: 1, selfieMode: false });
          (inst.initialize ? inst.initialize() : Promise.resolve()).then(() => { state = 'ready'; res(true); }).catch(fail);
        } catch (e) { fail(e); }
      };
      if (g.SelfieSegmentation) return boot();
      const s = document.createElement('script'); s.src = VENDOR + 'selfie_segmentation.js'; s.onload = boot; s.onerror = fail; document.head.appendChild(s);
    });
    return loadP;
  }

  function key(mediaId, idx) { return mediaId + ':' + idx; }
  function cached(mediaId, idx) { const c = cache.get(key(mediaId, idx)); if (c) { cache.delete(key(mediaId, idx)); cache.set(key(mediaId, idx), c); } return c || null; }
  function nearest(mediaId, idx, tol) {
    tol = tol == null ? 4 : tol;
    let best = null, bd = tol + 1;
    for (const [k, v] of cache) { const i = k.lastIndexOf(':'); if (k.slice(0, i) !== mediaId) continue; const d = Math.abs(+k.slice(i + 1) - idx); if (d < bd) { bd = d; best = v; } }
    return best;
  }

  /* 한 장 추론 — 사람 확률 → 알파. 살짝 단단하게(0.3→0.75 구간을 0→1) 해서 배경 얼룩을 없앤다 */
  function infer(img, rot) {
    return new Promise(resolve => {
      if (!inCv) { inCv = document.createElement('canvas'); inCv.width = SW; inCv.height = SH; inCtx = inCv.getContext('2d', { willReadFrequently: true }); }
      inCtx.fillStyle = '#000'; inCtx.fillRect(0, 0, SW, SH);
      g.KMV_MEDIA.drawFit(inCtx, img, SW, SH, rot);
      let done = false;
      const finish = v => { if (!done) { done = true; resolve(v); } };
      try {
        inst.onResults(res => {
          try {
            const mc = document.createElement('canvas'); mc.width = SW; mc.height = SH;
            const mx = mc.getContext('2d', { willReadFrequently: true });
            mx.drawImage(res.segmentationMask, 0, 0, SW, SH);
            const id = mx.getImageData(0, 0, SW, SH), d = id.data;
            for (let i = 0; i < d.length; i += 4) { const p = d[i] / 255, a = clamp((p - 0.3) / 0.45, 0, 1); d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(a * 255); }
            mx.putImageData(id, 0, 0);
            finish(mc);
          } catch (e) { finish(null); }
        });
        const p = inst.send({ image: inCv }); if (p && p.catch) p.catch(() => finish(null));
        setTimeout(() => finish(null), 8000);
      } catch (e) { finish(null); }
    });
  }

  /* 정확 프레임 마스크(await). img 는 이 idx 의 원본 프레임(VideoFrame/ImageBitmap). */
  function mask(mediaId, idx, img) {
    const c = cached(mediaId, idx); if (c) return Promise.resolve(c);
    if (!img) return Promise.resolve(null);
    const src = g.KMV_MEDIA.get(mediaId), rot = src ? src.rot : 0;
    const job = chain.then(async () => {
      if (!(await load())) return null;
      const again = cached(mediaId, idx); if (again) return again;
      const m = await infer(img, rot);
      if (m) { cache.set(key(mediaId, idx), m); if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value); }
      return m;
    });
    chain = job.catch(() => null);
    return job;
  }
  function pending() { return state === 'loading'; }
  function status() { return state; }
  function clear(mediaId) { for (const k of Array.from(cache.keys())) if (!mediaId || k.startsWith(mediaId + ':')) cache.delete(k); }

  g.KMV_SEG = { SW, SH, load, mask, cached, nearest, clear, status, pending };
})(typeof window !== 'undefined' ? window : globalThis);
