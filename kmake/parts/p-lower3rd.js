/* 로워서드 — 사람 이름·직함 자막. 좌하단 금 막대 → 네이비 패널 닦임 (5초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;

  K.register({
    id: 'lower3rd',
    name: '로워서드 (이름 자막)',
    dur: 5,
    fields: [
      { k: 'name', label: '이름', def: '김금성' },
      { k: 'role', label: '직함', def: '금성초등학교 교장' },
      { k: 'backing', label: '어두운 받침', def: 'none', opts: ['none', 'bottom'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080;
      var OUT_A = 4.3, OUT_B = 5.0;
      var open = life(t, 0.15, 0.9, OUT_A, OUT_B, E.outExpo, E.inCubic);

      if (p.backing !== 'none') K.backing(ctx, W, H, life(t, 0, 0.6, OUT_A, OUT_B) * 0.7, p.backing);

      var x = 120 * s, panelH = 132 * s, y = H - 262 * s;
      var nameSize = 54 * s, roleSize = 27 * s;

      ctx.save();
      ctx.font = K.font(800, nameSize); var w1 = K.textWidth(ctx, p.name, 0);
      ctx.font = K.font(500, roleSize); var w2 = K.textWidth(ctx, p.role, 1 * s);
      ctx.restore();
      var padX = 34 * s, panelW = Math.max(w1, w2) + padX * 2;

      /* 금 세로 막대 — 위→아래 */
      var barU = life(t, 0, 0.4, OUT_A, OUT_B, E.outQuint, E.inCubic);
      ctx.fillStyle = T.accent;
      ctx.fillRect(x, y, 6 * s, panelH * barU);

      /* 네이비 패널 + 글자 (닦임) */
      ctx.save();
      ctx.beginPath(); ctx.rect(x + 6 * s, y, panelW * open, panelH); ctx.clip();
      ctx.fillStyle = K.rgba(T.primary, 0.92);
      ctx.fillRect(x + 6 * s, y, panelW, panelH);
      var tx = x + 6 * s + padX, slide = (1 - seg(t, 0.3, 1.0, E.outExpo)) * -24 * s;
      K.drawText(ctx, p.name, tx + slide, y + 58 * s, { size: nameSize, weight: 800, color: T.text });
      K.drawText(ctx, p.role, tx + slide, y + 101 * s, { size: roleSize, weight: 500, ls: 1 * s, color: T.accent });
      ctx.restore();

      /* 패널 아래 얇은 금선 — 패널보다 살짝 늦게 */
      var lu = life(t, 0.5, 1.3, OUT_A, OUT_B);
      ctx.fillStyle = K.rgba(T.accent, 0.85);
      ctx.fillRect(x + 6 * s, y + panelH + 6 * s, panelW * lu, 2 * s);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
