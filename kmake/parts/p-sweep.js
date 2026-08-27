/* 인물 뒤 흐르는 글자 — 큰 글자가 오른쪽→왼쪽으로 천천히 지나간다 (8초).
   쓰는 법: 필모라에서 촬영 클립 복제 → AI 인물(컷아웃) → 맨 위 트랙. 이 부품은 그 아래 트랙. */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'sweep',
    name: '인물 뒤 흐르는 글자',
    dur: 8,
    fields: [
      { k: 'text',  label: '글자', def: '금성초등학교' },
      { k: 'style', label: '스타일', def: 'solid', opts: ['solid', 'outline', 'accent'] },
      { k: 'y',     label: '세로 위치', def: 'middle', opts: ['top', 'middle', 'bottom'] },
      { k: 'speed', label: '속도', def: 'slow', opts: ['slow', 'normal'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, size = 300 * s;
      var a = life(t, 0, 0.9, 7.1, 8, E.outCubic, E.inCubic);
      if (a <= 0.002) return;
      ctx.save();
      ctx.font = K.font(900, size);
      var tw = K.textWidth(ctx, p.text, -6 * s);
      var travel = (p.speed === 'normal' ? 1.0 : 0.62) * (W + tw); // 전체 길이 동안 이동 거리
      var x0 = W / 2 - tw / 2 + travel / 2;                          // t=4초에 글자 중앙이 화면 중앙
      var x = x0 - travel * (t / 8);
      var y = p.y === 'top' ? H * 0.30 : p.y === 'bottom' ? H * 0.82 : H * 0.5 + size * 0.36;
      var color = p.style === 'accent' ? T.accent : T.text;
      if (p.style === 'outline') {
        ctx.globalAlpha = a * 0.9; ctx.strokeStyle = color; ctx.lineWidth = 3 * s; ctx.lineJoin = 'round';
        var cx = x; ctx.textBaseline = 'alphabetic';
        for (var i = 0; i < p.text.length; i++) { ctx.strokeText(p.text[i], cx, y); cx += ctx.measureText(p.text[i]).width - 6 * s; }
      } else {
        K.drawText(ctx, p.text, x, y, { size: size, weight: 900, ls: -6 * s, color: color, alpha: a * 0.92,
          shadow: { color: 'rgba(0,0,0,0.28)', blur: 30 * s, dy: 8 * s } });
      }
      ctx.restore();
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
