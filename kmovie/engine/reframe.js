/* ============================================================
   케이무비 스마트 리프레임 (KMV_REFRAME)
   ------------------------------------------------------------
   화면비가 원본과 다를 때(가로 촬영본 → 세로 9:16 같은) 위아래·좌우로
   시커먼 띠가 생기는 대신 화면을 꽉 채우고 "볼거리"가 있는 쪽을 남긴다.

   초점 찾기는 원본 썸네일(160×90)만 본다 — 분석 때 이미 만들어 둔 것이라
   추가 디코드가 없고, 값이 항상 같다(결정적).
     1. 썸네일 한 장 → 32×18 로 줄여 밝기·가장자리(디테일) 에너지
     2. 열/행 에너지의 무게중심 → 그 시각의 초점 (cx, cy)
     3. 썸네일 사이를 넓게 평균 내어 흔들림 제거 (카메라가 천천히 따라가는 느낌)
   원본이 16:9 가 아니면 썸네일 안의 레터박스를 빼고 원본 좌표로 되돌린다.

   자동이 마음에 안 들면 클립 「채우기」로 가운데·앞쪽·뒤쪽·안 채움을 고르면 된다.
   ============================================================ */
(function (g) {
  'use strict';

  const GW = 32, GH = 18;             // 분석 격자
  const SMOOTH = 5;                   // 썸네일 몇 장을 함께 평균 낼지 (양쪽 ±2)
  const track = new Map();            // mediaId → { cx:[], cy:[], every }
  let cv = null, cx2 = null;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function grid(img) {
    if (!cv) {
      cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(GW, GH) : Object.assign(document.createElement('canvas'), { width: GW, height: GH });
      cx2 = cv.getContext('2d', { willReadFrequently: true });
    }
    cx2.clearRect(0, 0, GW, GH);
    try { cx2.drawImage(img, 0, 0, GW, GH); } catch (e) { return null; }
    let d; try { d = cx2.getImageData(0, 0, GW, GH).data; } catch (e) { return null; }
    const L = new Float32Array(GW * GH);
    for (let i = 0, p = 0; i < L.length; i++, p += 4) L[i] = (d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114) / 255;
    return L;
  }

  /* 한 장의 초점 — 에너지 = 옆·아래 칸과의 차이(디테일) + 밝기 조금. 가장자리는 살짝 덜 본다(가운데 편향). */
  function focusOf(L, box) {
    const colE = new Float32Array(GW), rowE = new Float32Array(GH);
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const i = y * GW + x, v = L[i];
        const gx = x + 1 < GW ? Math.abs(L[i + 1] - v) : 0;
        const gy = y + 1 < GH ? Math.abs(L[i + GW] - v) : 0;
        const e = (gx + gy) * 3 + v * 0.35;
        colE[x] += e; rowE[y] += e;
      }
    }
    const mid = (E, n) => {
      let s = 0, m = 0;
      for (let i = 0; i < n; i++) { const w = Math.pow(E[i], 2) * (1 - 0.25 * Math.abs((i + 0.5) / n - 0.5) * 2); s += w * (i + 0.5) / n; m += w; }
      return m > 0 ? clamp(s / m, 0, 1) : 0.5;
    };
    let fx = mid(colE, GW), fy = mid(rowE, GH);
    if (box) {                                   // 썸네일 안의 원본 자리(레터박스 제외) → 원본 좌표
      fx = box.w > 0 ? clamp((fx - box.x) / box.w, 0, 1) : 0.5;
      fy = box.h > 0 ? clamp((fy - box.y) / box.h, 0, 1) : 0.5;
    }
    return [fx, fy];
  }

  /* 썸네일 안에서 원본 그림이 차지하는 자리(0~1) — drawFit(contain) 과 같은 계산 */
  function letterbox(src) {
    const M = g.KMV_MEDIA, TW = M ? M.THUMB_W : 160, TH = M ? M.THUMB_H : 90;
    const rotated = src.rot === 90 || src.rot === 270;
    const dw = rotated ? src.h : src.w, dh = rotated ? src.w : src.h;
    if (!dw || !dh) return null;
    const sc = Math.min(TW / dw, TH / dh), w = dw * sc / TW, h = dh * sc / TH;
    if (w > 0.995 && h > 0.995) return null;
    return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
  }

  function build(src) {
    const th = src && src.thumbs ? src.thumbs.filter(Boolean) : [];
    if (!th.length) return null;
    const box = letterbox(src), rx = [], ry = [];
    for (const t of th) { const L = grid(t); const f = L ? focusOf(L, box) : [0.5, 0.5]; rx.push(f[0]); ry.push(f[1]); }
    const smooth = a => a.map((_, i) => {
      let s = 0, n = 0;
      for (let k = -((SMOOTH - 1) / 2 | 0); k <= ((SMOOTH - 1) / 2 | 0); k++) { const j = i + k; if (j >= 0 && j < a.length) { s += a[j]; n++; } }
      return s / n;
    });
    return { cx: smooth(rx), cy: smooth(ry), every: src.thumbEvery || 1 };
  }

  /* 원본 프레임 idx 에서의 초점 — 썸네일 사이는 이어 준다(부드럽게 옮겨 간다) */
  function focus(src, idx) {
    if (!src || !src.id) return { cx: 0.5, cy: 0.5 };
    let t = track.get(src.id);
    if (t === undefined) { t = build(src); if (t) track.set(src.id, t); else return { cx: 0.5, cy: 0.5 }; }
    const n = t.cx.length; if (!n) return { cx: 0.5, cy: 0.5 };
    const u = clamp((idx || 0) / t.every, 0, n - 1), i = Math.floor(u), j = Math.min(n - 1, i + 1), f = u - i;
    return { cx: t.cx[i] * (1 - f) + t.cx[j] * f, cy: t.cy[i] * (1 - f) + t.cy[j] * f };
  }
  function forget(mediaId) { if (mediaId) track.delete(mediaId); else track.clear(); }

  /* 잘리는 축 — 화면이 원본보다 홀쭉하면 좌우를 자르고(axis 'x'), 납작하면 위아래를 자른다('y'). 같으면 null */
  function axis(W, H, src) {
    if (!src || !src.w || !src.h) return null;
    const rotated = src.rot === 90 || src.rot === 270;
    const dw = rotated ? src.h : src.w, dh = rotated ? src.w : src.h;
    const a = W / H, b = dw / dh;
    if (Math.abs(a - b) < 0.02) return null;
    return a < b ? 'x' : 'y';
  }

  /* 이 클립을 이 화면에 어떻게 채울지 — drawFit 의 fill 인자. 채울 필요가 없으면 null(예전 그대로) */
  function fill(c, W, H, src, idx) {
    if (!src || !c) return null;
    const mode = c.fill || 'auto';
    if (mode === 'none') return null;
    const ax = axis(W, H, src); if (!ax) return null;
    let cx = 0.5, cy = 0.5;
    if (mode === 'auto') { const f = focus(src, idx); cx = f.cx; cy = f.cy; }
    else if (mode === 'a') { if (ax === 'x') cx = 0.16; else cy = 0.16; }
    else if (mode === 'b') { if (ax === 'x') cx = 0.84; else cy = 0.84; }
    return { cover: true, cx, cy, axis: ax };
  }

  g.KMV_REFRAME = { focus, fill, axis, forget, GW, GH };
})(typeof window !== 'undefined' ? window : globalThis);
