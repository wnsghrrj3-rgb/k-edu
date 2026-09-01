/* ============================================================
   케이무비 흔들림 잡기 (KMV_STAB)
   ------------------------------------------------------------
   손으로 든 카메라의 잔떨림을 줄인다. 프리미어의 워프 스태빌라이저,
   리졸브의 스태빌라이저와 같은 자리 — 다만 여기서는 **추가 디코드가 0** 이다.
   분석(media.analyze)이 원본을 한 번 훑을 때 이미 96×54 회색 그림을 만들고
   있으므로, 그 자리에서 프레임 사이 이동량만 같이 재 둔다.

     1. 한 프레임 → 세로줄 합·가로줄 합 (적분 투영, 1차원 두 줄)
     2. 앞 프레임의 투영과 ±8칸 맞춰 보아 가장 잘 겹치는 자리 = 그 프레임의 이동량
        (포물선 보간으로 소수점까지, 자신 없으면 ok=0 → 그 자리에서 끊는다)
     3. 이동량을 쌓아 카메라 궤적 → 넓게 평균 내어 부드러운 궤적
     4. 보정 = 부드러운 궤적 − 실제 궤적. 화면을 조금 키워(zoom) 그만큼 밀면
        떨림이 사라지고, 밀 수 있는 한계(margin)를 넘지 않게 부드럽게 눌러 준다.

   순수 계산이다 — DOM·디코더·프로젝트를 건드리지 않고, 같은 입력이면 값이 항상 같다.
   컷(장면 경계)·큰 팬처럼 자신 없는 자리에서는 궤적을 끊어, 컷을 넘어 밀려가지 않는다.
   ============================================================ */
(function (g) {
  'use strict';

  const PW = 96, PH = 54;              // 분석 격자 (media.js analyze 와 같은 크기)
  const RANGE = 8;                     // 흔들림 탐색 범위(격자 칸) — 폭의 8.3%
  const LEVELS = {                     // 세기: 창(초) = 얼마나 넓게 부드럽게, 여백 = 밀 수 있는 한계(원본 폭 비율)
    a: { win: 0.7, margin: 0.045 },
    b: { win: 1.8, margin: 0.10 },
  };

  const cache = new Map();             // mediaId|level → { sx:Float32Array, sy:Float32Array, zoom }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* 회색 그림(Uint8Array W*H) → 평균을 뺀 세로줄·가로줄 합 */
  function profile(gray, W, H) {
    W = W || PW; H = H || PH;
    const col = new Float32Array(W), row = new Float32Array(H);
    for (let y = 0, i = 0; y < H; y++) {
      let rs = 0;
      for (let x = 0; x < W; x++, i++) { const v = gray[i]; col[x] += v; rs += v; }
      row[y] = rs / W;
    }
    for (let x = 0; x < W; x++) col[x] /= H;
    const mean = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
    const mc = mean(col), mr = mean(row);
    for (let x = 0; x < W; x++) col[x] -= mc;
    for (let y = 0; y < H; y++) row[y] -= mr;
    return { col, row };
  }

  /* 1차원 맞추기 — cur[i+d] ≈ prev[i] 인 d 를 찾는다(d>0 = 그림이 오른쪽/아래로 감).
     돌려주는 것: { d(소수점), ok } — 자신 없으면 ok=false */
  function match(prev, cur, range) {
    range = range || RANGE;
    const n = prev.length, lim = Math.min(range, Math.floor(n / 3));
    if (n < 8) return { d: 0, ok: false };
    let energy = 0; for (let i = 0; i < n; i++) energy += Math.abs(prev[i]);
    energy /= n;
    const cost = new Float32Array(lim * 2 + 1);
    for (let k = -lim; k <= lim; k++) {
      const i0 = Math.max(0, -k), i1 = Math.min(n, n - k);
      let s = 0, cnt = 0;
      for (let i = i0; i < i1; i++) { s += Math.abs(prev[i] - cur[i + k]); cnt++; }
      cost[k + lim] = cnt ? s / cnt : Infinity;
    }
    let bi = 0; for (let i = 1; i < cost.length; i++) if (cost[i] < cost[bi]) bi = i;
    const best = cost[bi];
    // 자신감: 그림에 무늬가 있고(에너지), 최소가 나머지보다 뚜렷하게 낮고, 벽(±lim)에 붙지 않아야 한다
    const sorted = Array.from(cost).sort((a, b) => a - b);
    const med = sorted[sorted.length >> 1];
    const okConf = energy > 1.2 && med > 0 && best < med * 0.75 && bi > 0 && bi < cost.length - 1;
    let d = bi - lim;
    if (okConf) {                                   // 포물선 보간 (소수점 자리)
      const a = cost[bi - 1], b = best, c = cost[bi + 1], den = a - 2 * b + c;
      if (den > 1e-6) d += clamp((a - c) / (2 * den), -1, 1);
    }
    return { d: okConf ? d : 0, ok: okConf };
  }

  /* 앞 프레임 → 이 프레임의 이동량 (격자 칸) */
  function estimate(prev, cur) {
    if (!prev || !cur) return { dx: 0, dy: 0, ok: false };
    const mx = match(prev.col, cur.col), my = match(prev.row, cur.row);
    return { dx: mx.d, dy: my.d, ok: mx.ok && my.ok };
  }

  /* 한 축: 이동량 → 보정량.
     ok=0 (자신 없는 프레임: 흐릿함·무늬 없음) 은 "안 움직였다"로 보아 궤적을 잇고,
     cut=1 (장면 경계) 에서만 궤적을 끊는다 — 컷을 넘어 밀려가지 않게. */
  function correct(d, ok, cut, win, margin, W) {
    const n = d.length, out = new Float32Array(n);
    const lim = margin * W, half = Math.max(1, Math.round(win / 2));
    let s = 0;
    while (s < n) {
      let e = s + 1;
      while (e < n && !(cut && cut[e])) e++;               // [s, e) 가 한 토막
      const m = e - s, pos = new Float32Array(m);
      for (let i = 1; i < m; i++) pos[i] = pos[i - 1] + (ok && !ok[s + i] ? 0 : d[s + i]);
      // 넓은 이동평균 = 부드러운 궤적 (가장자리는 있는 만큼만)
      const acc = new Float64Array(m + 1);
      for (let i = 0; i < m; i++) acc[i + 1] = acc[i] + pos[i];
      for (let i = 0; i < m; i++) {
        const a = Math.max(0, i - half), b = Math.min(m, i + half + 1);
        const c = (acc[b] - acc[a]) / (b - a) - pos[i];
        out[s + i] = lim > 0 ? lim * Math.tanh(c / lim) : 0;   // 한계에 부드럽게 붙는다(딱 잘리지 않게)
      }
      s = e;
    }
    return out;
  }

  function zoomOf(margin) { return 1 / (1 - 2 * margin); }

  /* 이 원본·이 세기의 보정 표 — 분석이 남긴 src.shake 만 본다(추가 디코드 0) */
  function build(shake, level, fps) {
    const L = LEVELS[level]; if (!L || !shake || !shake.x || !shake.x.length) return null;
    const win = Math.max(3, Math.round(L.win * (fps || 30)));
    return {
      sx: correct(shake.x, shake.ok, shake.cut, win, L.margin, PW),
      sy: correct(shake.y, shake.ok, shake.cut, win, L.margin, PH),
      zoom: zoomOf(L.margin),
    };
  }

  /* 원본 프레임 idx 에서 어떻게 밀지 — { zoom, sx, sy } (sx·sy 는 화면 크기 대비 비율) */
  function offset(src, level, idx) {
    if (!src || !LEVELS[level] || !src.shake || !src.analyzed) return null;   // 훑기가 끝나기 전엔 아무것도 하지 않는다(반쯤 만든 표로 밀지 않게)
    const key = src.id + '|' + level;
    let t = cache.get(key);
    if (t === undefined) { t = build(src.shake, level, src.fps); cache.set(key, t); }
    if (!t) return null;
    const i = clamp(Math.round(idx || 0), 0, t.sx.length - 1);
    return { zoom: t.zoom, sx: t.sx[i] / PW, sy: t.sy[i] / PH };
  }

  function forget(mediaId) {
    if (!mediaId) { cache.clear(); return; }
    for (const k of Array.from(cache.keys())) if (k.slice(0, k.lastIndexOf('|')) === mediaId) cache.delete(k);
  }

  g.KMV_STAB = { PW, PH, RANGE, LEVELS, profile, match, estimate, correct, build, offset, forget, zoomOf };
})(typeof window !== 'undefined' ? window : globalThis);
