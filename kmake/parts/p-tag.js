/* 장소·시간 태그 — 화면 구석 작은 표기 "📍 금성초 운동장 · 2026.09" (5초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'tag',
    name: '장소·시간 태그',
    dur: 5,
    fields: [
      { k: 'text', label: '내용', def: '금성초등학교 운동장' },
      { k: 'sub',  label: '보조(날짜 등)', def: '2026.09' },
      { k: 'pos',  label: '위치', def: 'topleft', opts: ['topleft', 'topright', 'bottomright'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 4.3, OUT_B = 5;
      var a = life(t, 0, 0.6, OUT_A, OUT_B), open = life(t, 0.1, 0.8, OUT_A, OUT_B, E.outExpo, E.inCubic);
      if (a <= 0.002) return;
      ctx.save(); ctx.font = K.font(700, 30 * s); var w1 = K.textWidth(ctx, p.text, 0.5 * s); ctx.font = K.font(500, 22 * s); var w2 = p.sub ? K.textWidth(ctx, p.sub, 1.5 * s) : 0; ctx.restore();
      var padX = 26 * s, gap = p.sub ? 22 * s : 0, panelW = padX * 2 + w1 + gap + w2 + 14 * s, panelH = 64 * s;
      var x = p.pos === 'topleft' ? 90 * s : W - 90 * s - panelW;
      var y = p.pos === 'bottomright' ? H - 90 * s - panelH : 90 * s;
      // 유리 느낌 패널
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, panelW * open, panelH); ctx.clip();
      K.rrect(ctx, x, y, panelW, panelH, panelH / 2); ctx.fillStyle = K.rgba(T.primary, 0.78 * a); ctx.fill();
      ctx.strokeStyle = K.rgba(T.accent, 0.6 * a); ctx.lineWidth = 1.5 * s; ctx.stroke();
      // 금점
      ctx.fillStyle = K.rgba(T.accent, a); ctx.beginPath(); ctx.arc(x + padX, y + panelH / 2, 5 * s, 0, Math.PI * 2); ctx.fill();
      var tx = x + padX + 14 * s, ty = y + panelH / 2 + 10 * s;
      K.drawText(ctx, p.text, tx, ty, { size: 30 * s, weight: 700, ls: 0.5 * s, color: T.text, alpha: a });
      if (p.sub) K.drawText(ctx, p.sub, tx + w1 + gap, ty - 1 * s, { size: 22 * s, weight: 500, ls: 1.5 * s, color: T.accent, alpha: a });
      ctx.restore();
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
