/* 섹션 타이틀 — "PART 01 · 교육과정" 좌측에서 네이비 패널이 닦이며 열린다 (4초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;

  K.register({
    id: 'section',
    name: '섹션 타이틀',
    dur: 4,
    fields: [
      { k: 'num',   label: '번호',   def: '01' },
      { k: 'label', label: '작은 표기', def: 'PART' },
      { k: 'title', label: '장 제목', def: '교육과정' },
      { k: 'backing', label: '어두운 받침', def: 'left', opts: ['left', 'bottom', 'none'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080;
      var OUT_A = 3.35, OUT_B = 4.0;
      var gone = seg(t, OUT_A, OUT_B, E.inCubic);

      if (p.backing !== 'none') K.backing(ctx, W, H, life(t, 0, 0.7, OUT_A, OUT_B) * 0.8, p.backing);

      var x = 150 * s, baseY = H * 0.5 + 40 * s;
      var titleSize = 108 * s;

      // 패널 폭 = 제목 폭 + 여백
      ctx.save();
      ctx.font = K.font(900, titleSize);
      var tw = K.textWidth(ctx, p.title, -1.5 * s);
      ctx.restore();
      var padX = 54 * s, panelW = tw + padX * 2, panelH = titleSize * 1.28;
      var panelY = baseY - titleSize * 0.98;

      // 열림 폭: 0→1 (퇴장 시 왼쪽으로 닫힘)
      var open = life(t, 0.1, 0.95, OUT_A, OUT_B, E.outExpo, E.inCubic);

      /* 금 세로 막대 — 먼저 위→아래로 자란다 */
      var barU = life(t, 0, 0.45, OUT_A, OUT_B, E.outQuint, E.inCubic);
      ctx.fillStyle = T.accent;
      ctx.fillRect(x - 18 * s, panelY, 7 * s, panelH * barU);

      /* 네이비 패널 (왼쪽에서 닦임) */
      ctx.save();
      ctx.beginPath(); ctx.rect(x, panelY, panelW * open, panelH); ctx.clip();
      ctx.fillStyle = K.rgba(T.primary, 0.94);
      ctx.fillRect(x, panelY, panelW, panelH);
      // 패널 안 제목 — 닦임 뒤에 살짝 늦게 따라 들어옴
      var tU = seg(t, 0.3, 1.1, E.outExpo);
      K.drawText(ctx, p.title, x + padX + (1 - tU) * -40 * s, baseY, {
        size: titleSize, weight: 900, ls: -1.5 * s, color: T.text, alpha: 1,
      });
      ctx.restore();

      /* 위 작은 표기: PART · 01 */
      var eA = life(t, 0.55, 1.15, OUT_A, OUT_B);
      if (eA > 0.002) {
        var ey = panelY - 26 * s;
        var r = K.drawText(ctx, p.label, x + 4 * s, ey, { size: 24 * s, weight: 700, ls: 6 * s, color: T.accent, alpha: eA });
        K.drawText(ctx, p.num, x + 4 * s + r.w + 22 * s, ey, { size: 24 * s, weight: 700, ls: 6 * s, color: T.text, alpha: eA });
        // 작은 표기 밑 금 점선 — 제목 폭만큼
        var lu = life(t, 0.7, 1.5, OUT_A, OUT_B);
        ctx.fillStyle = K.rgba(T.accent, 0.9 * eA);
        ctx.fillRect(x + 4 * s, ey + 11 * s, (panelW - 8 * s) * lu, 3 * s);
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
