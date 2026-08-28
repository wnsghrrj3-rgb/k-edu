/* 인용구 — 큰 금색 따옴표 + 문구 + 출처. 인터뷰 한 마디·교훈 (7초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'quote',
    name: '인용구',
    dur: 7,
    fields: [
      { k: 'text', label: '문구 (/ 로 줄바꿈)', def: '학교는 아이들이 처음 만나는/가장 큰 세상입니다' },
      { k: 'who',  label: '출처', def: '금성초등학교' },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 5.8, OUT_B = 7;
      var a = life(t, 0, 0.9, OUT_A, OUT_B); if (a <= 0.002) return;
      K.backing(ctx, W, H, a * 0.5, 'center');
      var lines = String(p.text || '').split('/').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 3);
      var size = 58 * s, lh = size * 1.5, cy = H / 2 - (lines.length - 1) * lh / 2 + 10 * s;
      // 따옴표 — 살짝 내려앉으며 등장
      var qa = life(t, 0, 0.7, OUT_A, OUT_B, E.outCubic, E.inCubic);
      ctx.save();
      ctx.font = 'italic 700 ' + Math.round(150 * s) + 'px Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = K.rgba(T.accent, qa * 0.92);
      ctx.fillText('\u201C', W / 2, cy - lh * 0.9 + (1 - E.outCubic(seg(t, 0, 0.7))) * -26 * s);
      ctx.restore();
      // 문구 — 줄 순차
      lines.forEach(function (ln, i) {
        var la = life(t, 0.35 + i * 0.28, 1.15 + i * 0.28, OUT_A, OUT_B);
        if (la <= 0.002) return;
        K.drawText(ctx, ln, W / 2, cy + i * lh, { align: 'center', size: size, weight: 600, ls: 1.5 * s, color: T.text, alpha: la, shadow: { color: 'rgba(0,0,0,0.5)', blur: 12 * s, dy: 2 * s } });
      });
      // 금선 + 출처
      var wa = life(t, 0.9, 1.7, OUT_A, OUT_B, E.outExpo, E.inCubic);
      var lw = 110 * s * wa, ly = cy + (lines.length - 1) * lh + 54 * s;
      ctx.fillStyle = K.rgba(T.accent, a); ctx.fillRect(W / 2 - lw / 2, ly, lw, 2.5 * s);
      if (p.who) K.drawText(ctx, '— ' + p.who, W / 2, ly + 46 * s, { align: 'center', size: 26 * s, weight: 500, ls: 2 * s, color: T.sub, alpha: wa });
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
