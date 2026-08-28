/* 엔딩 카드 — "함께 만들었습니다" + 이름 줄 순차 + 금선 + 학교명. 영상 마무리 (8초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'credits',
    name: '엔딩 카드',
    dur: 8,
    fields: [
      { k: 'title', label: '머리 문구', def: '함께 만들었습니다' },
      { k: 'names', label: '이름·역할 (/ 로 줄바꿈)', def: '기획·촬영  금성초 방송부/출연  금성 어린이들' },
      { k: 'sub',   label: '맺음(학교·연도)', def: '금성초등학교 · 2026' },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 7, OUT_B = 8;
      var a = life(t, 0, 0.8, OUT_A, OUT_B); if (a <= 0.002) return;
      // 엔딩은 화면을 조용히 덮는다 — 짙은 네이비 장막
      ctx.fillStyle = K.rgba(T.primary, a * 0.94); ctx.fillRect(0, 0, W, H);
      var lines = String(p.names || '').split('/').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 6);
      var lh = 58 * s, blockH = 120 * s + lines.length * lh + 110 * s, top = H / 2 - blockH / 2;
      // 머리 문구
      var ta = life(t, 0.3, 1.2, OUT_A, OUT_B);
      K.drawText(ctx, p.title || '', W / 2, top + 40 * s, { align: 'center', size: 46 * s, weight: 700, ls: 3 * s, color: T.text, alpha: ta });
      var ug = life(t, 0.6, 1.5, OUT_A, OUT_B, E.outExpo, E.inCubic), lw = 84 * s * ug;
      ctx.fillStyle = K.rgba(T.accent, a); ctx.fillRect(W / 2 - lw / 2, top + 76 * s, lw, 2.5 * s);
      // 이름 줄 — 순차
      lines.forEach(function (ln, i) {
        var la = life(t, 1.0 + i * 0.35, 1.7 + i * 0.35, OUT_A, OUT_B);
        if (la <= 0.002) return;
        K.drawText(ctx, ln, W / 2, top + 150 * s + i * lh, { align: 'center', size: 30 * s, weight: 500, ls: 1.5 * s, color: T.sub, alpha: la });
      });
      // 맺음 — 금색, 마지막에
      if (p.sub) {
        var sa = life(t, 1.4 + lines.length * 0.35, 2.1 + lines.length * 0.35, OUT_A, OUT_B);
        K.drawText(ctx, p.sub, W / 2, top + 150 * s + lines.length * lh + 64 * s, { align: 'center', size: 30 * s, weight: 700, ls: 4 * s, color: T.accent, alpha: sa });
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
