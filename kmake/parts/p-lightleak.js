/* 광누출 전환 — 따뜻한 빛이 화면을 쓸고 지나간다 (1.4초). 컷 경계에 걸쳐 놓으면 전환이 된다. */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg;
  K.register({
    id: 'lightleak',
    name: '광누출',
    dur: 1.4,
    fields: [
      { k: 'tone', label: '색', def: 'warm', opts: ['warm', 'gold', 'cool'] },
      { k: 'dir',  label: '방향', def: 'ltr', opts: ['ltr', 'rtl'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var u = t / 1.4;                              // 0..1
      var env = Math.sin(Math.PI * Math.min(1, u)); // 밝기 봉우리 (중간 최고)
      if (env <= 0.002) return;
      var col = p.tone === 'gold' ? [217, 182, 92] : p.tone === 'cool' ? [170, 205, 255] : [255, 190, 120];
      var dirx = p.dir === 'rtl' ? -1 : 1;
      var cx = W * (dirx > 0 ? -0.3 + 1.6 * E.inOutCubic(u) : 1.3 - 1.6 * E.inOutCubic(u));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // 넓은 빛 덩어리 3개 (크기·위치 다르게)
      var blobs = [[0, H * 0.4, H * 1.1, 0.55], [-W * 0.18 * dirx, H * 0.75, H * 0.7, 0.45], [W * 0.14 * dirx, H * 0.15, H * 0.55, 0.5]];
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i], x = cx + b[0], y = b[1], r = b[2];
        var grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(' + col.join(',') + ',' + (b[3] * env) + ')');
        grd.addColorStop(0.45, 'rgba(' + col.join(',') + ',' + (b[3] * env * 0.35) + ')');
        grd.addColorStop(1, 'rgba(' + col.join(',') + ',0)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      }
      // 중앙 화이트 플래시 (아주 짧게)
      var fl = Math.pow(Math.max(0, 1 - Math.abs(u - 0.5) / 0.18), 2) * 0.55;
      if (fl > 0.002) { ctx.fillStyle = 'rgba(255,248,235,' + fl + ')'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
