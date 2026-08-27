/* 뚫린 글자 (마블식) — 화면 전체를 덮고 글자 모양만 뚫려 촬영본이 글자 안에 보인다.
   끝에 글자 속으로 줌인하며 덮개가 사라진다 (5초). 이 부품은 촬영본 "위" 트랙에 그냥 얹으면 된다. */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'knockout',
    name: '뚫린 글자 (마블식)',
    dur: 5,
    fields: [
      { k: 'text',  label: '글자', def: '금성초' },
      { k: 'sub',   label: '아래 작은 글자', def: 'GEUMSEONG ELEMENTARY SCHOOL' },
      { k: 'cover', label: '덮개 색', def: 'navy', opts: ['navy', 'black', 'white'] },
      { k: 'exit',  label: '퇴장', def: 'zoom', opts: ['zoom', 'fade'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, cx = W / 2, cy = H / 2;
      var cov = p.cover === 'black' ? '#07090f' : p.cover === 'white' ? '#F4F1EA' : T.primary;
      var subCol = p.cover === 'white' ? T.primary : T.accent;
      var inU = seg(t, 0, 0.9, E.outExpo);
      var alpha = life(t, 0, 0.5, 4.25, 5.0, E.outCubic, E.inCubic);
      if (alpha <= 0.002) return;
      // 퇴장 줌: 3.2s 부터 글자 속으로 파고든다
      var z = 1;
      if (p.exit === 'zoom') z = 1 + 14 * seg(t, 3.2, 5.0, E.inExpo);
      var scale = z * (1.12 - 0.12 * inU); // 등장 시 아주 살짝 축소되며 자리잡음
      var size = 340 * s;

      ctx.save();
      // 덮개 (전면)
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cov;
      ctx.fillRect(0, 0, W, H);
      // 글자를 뚫는다
      ctx.globalCompositeOperation = 'destination-out';
      ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
      ctx.globalAlpha = 1;
      K.drawText(ctx, p.text, cx, cy + size * 0.36, { size: size, weight: 900, ls: -8 * s, color: '#000', align: 'center' });
      ctx.restore();

      // 작은 영문 (덮개 위, 줌에 같이 딸려감 — 뚫지 않음)
      if (p.sub) {
        var sa = alpha * life(t, 0.6, 1.3, 3.2, 3.9);
        if (sa > 0.002) {
          ctx.save();
          ctx.translate(cx, cy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
          K.drawText(ctx, p.sub, cx, cy + size * 0.36 + 70 * s, { size: 22 * s, weight: 600, ls: 8 * s, color: subCol, align: 'center', alpha: sa });
          // 글자 위·아래 얇은 금선
          ctx.fillStyle = K.rgba(subCol, 0.8 * sa);
          var lw = 560 * s * seg(t, 0.7, 1.6, E.outExpo);
          ctx.fillRect(cx - lw / 2, cy - size * 0.62, lw, 2 * s);
          ctx.restore();
        }
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
