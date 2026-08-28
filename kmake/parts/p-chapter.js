/* 챕터 — 왼쪽 큰 번호 + 세로 금선 + 제목. 코너(장) 시작 표시 (5초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'chapter',
    name: '챕터 번호',
    dur: 5,
    fields: [
      { k: 'num',   label: '번호', def: '01' },
      { k: 'title', label: '제목', def: '우리 학교 소개' },
      { k: 'sub',   label: '부제', def: '금성초등학교' },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 4.2, OUT_B = 5;
      var a = life(t, 0, 0.7, OUT_A, OUT_B); if (a <= 0.002) return;
      K.backing(ctx, W, H, a * 0.55, 'left');
      var x0 = 130 * s, cy = H / 2;
      // 세로 금선 — 가운데서 위아래로 자람
      var lg = life(t, 0.05, 0.75, OUT_A, OUT_B, E.outExpo, E.inCubic), lineH = 200 * s * lg;
      ctx.fillStyle = K.rgba(T.accent, a);
      ctx.fillRect(x0, cy - lineH / 2, 3 * s, lineH);
      // 번호 — 왼쪽에서 살짝 밀려 들어옴
      var na = life(t, 0.15, 0.95, OUT_A, OUT_B), ndx = (1 - E.outExpo(seg(t, 0.15, 0.95))) * -30 * s;
      ctx.save();
      ctx.font = K.font(800, Math.round(150 * s)); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.globalAlpha = na;
      ctx.strokeStyle = K.rgba(T.accent, 0.9); ctx.lineWidth = 2 * s;
      ctx.strokeText(String(p.num || ''), x0 + 40 * s + ndx, cy - 6 * s);
      ctx.restore();
      // 제목·부제
      var tx = x0 + 40 * s + (String(p.num || '').length * 92 * s) + 46 * s;
      var ta = life(t, 0.4, 1.2, OUT_A, OUT_B), tdx = (1 - E.outExpo(seg(t, 0.4, 1.2))) * 24 * s;
      K.drawText(ctx, p.title || '', tx + tdx, cy + 2 * s, { size: 60 * s, weight: 800, ls: 1 * s, color: T.text, alpha: ta, shadow: { color: 'rgba(0,0,0,0.5)', blur: 10 * s, dy: 2 * s } });
      if (p.sub) K.drawText(ctx, p.sub, tx + tdx, cy + 52 * s, { size: 26 * s, weight: 500, ls: 3 * s, color: T.sub, alpha: life(t, 0.6, 1.4, OUT_A, OUT_B) });
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
