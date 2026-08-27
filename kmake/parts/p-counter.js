/* 숫자 카운트업 — "재학생 380명" 처럼 숫자가 올라가며 자리잡는다 (4초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'counter',
    name: '숫자 카운트업',
    dur: 4,
    fields: [
      { k: 'label', label: '설명', def: '재학생' },
      { k: 'num',   label: '숫자', def: '380' },
      { k: 'unit',  label: '단위', def: '명' },
      { k: 'pos',   label: '위치', def: 'left', opts: ['left', 'center', 'right'] },
      { k: 'backing', label: '어두운 받침', def: 'none', opts: ['none', 'bottom', 'left'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 3.35, OUT_B = 4;
      var a = life(t, 0, 0.5, OUT_A, OUT_B), gone = seg(t, OUT_A, OUT_B, E.inCubic);
      if (a <= 0.002) return;
      if (p.backing !== 'none') K.backing(ctx, W, H, a * 0.7, p.backing);
      var target = parseFloat(String(p.num).replace(/[^\d.]/g, '')) || 0;
      var u = seg(t, 0.2, 2.0, E.outExpo);
      var cur = Math.round(target * u);
      var numStr = String(cur).replace(/\B(?=(\d{3})+(?!\d))/g, target >= 1000 && /,/.test(p.num) ? ',' : '');
      var ax = p.pos === 'center' ? W / 2 : p.pos === 'right' ? W - 150 * s : 150 * s;
      var align = p.pos === 'center' ? 'center' : p.pos === 'right' ? 'right' : 'left';
      var y = H * 0.5 + 60 * s - 20 * s * gone;
      // 설명 (위, 금색 작은 자간)
      K.drawText(ctx, p.label, ax, y - 150 * s, { size: 30 * s, weight: 700, ls: 6 * s, color: T.accent, align: align, alpha: a });
      // 숫자 + 단위
      ctx.save(); ctx.font = K.font(900, 190 * s); var nw = K.textWidth(ctx, numStr, -4 * s); ctx.font = K.font(700, 56 * s); var uw = K.textWidth(ctx, p.unit, 0); ctx.restore();
      var total = nw + 14 * s + uw;
      var x0 = align === 'center' ? ax - total / 2 : align === 'right' ? ax - total : ax;
      var pop = 1 + 0.04 * Math.sin(Math.min(1, seg(t, 1.9, 2.4, E.lin)) * Math.PI);  // 도착 순간 살짝 튐
      ctx.save(); ctx.translate(x0 + nw / 2, y); ctx.scale(pop, pop); ctx.translate(-(x0 + nw / 2), -y);
      K.drawText(ctx, numStr, x0, y, { size: 190 * s, weight: 900, ls: -4 * s, color: T.text, alpha: a, shadow: { color: 'rgba(0,0,0,0.3)', blur: 20 * s, dy: 5 * s } });
      ctx.restore();
      K.drawText(ctx, p.unit, x0 + nw + 14 * s, y, { size: 56 * s, weight: 700, color: T.sub, alpha: a });
      // 밑 금선
      var lu = life(t, 0.3, 1.2, OUT_A, OUT_B);
      ctx.fillStyle = K.rgba(T.accent, 0.9 * a);
      ctx.fillRect(align === 'right' ? ax - total * lu : align === 'center' ? ax - total * lu / 2 : ax, y + 34 * s, total * lu, 4 * s);
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
