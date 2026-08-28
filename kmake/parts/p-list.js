/* 핵심 목록 — 소제목 + 항목이 금점과 함께 순차 등장. 특색 사업·안내 (8초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;
  K.register({
    id: 'list',
    name: '핵심 목록',
    dur: 8,
    fields: [
      { k: 'title', label: '소제목', def: '금성 교육의 세 가지 약속' },
      { k: 'items', label: '항목 (/ 로 구분)', def: '바른 인성/즐거운 배움/건강한 몸' },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, OUT_A = 7, OUT_B = 8;
      var a = life(t, 0, 0.7, OUT_A, OUT_B); if (a <= 0.002) return;
      K.backing(ctx, W, H, a * 0.6, 'left');
      var items = String(p.items || '').split('/').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 5);
      var x0 = 150 * s, lh = 92 * s, top = H / 2 - (items.length * lh + 90 * s) / 2 + 30 * s;
      // 소제목 + 밑금선
      var ta = life(t, 0.1, 0.9, OUT_A, OUT_B);
      K.drawText(ctx, p.title || '', x0, top, { size: 44 * s, weight: 800, ls: 1.5 * s, color: T.text, alpha: ta, shadow: { color: 'rgba(0,0,0,0.5)', blur: 10 * s, dy: 2 * s } });
      var ug = life(t, 0.3, 1.1, OUT_A, OUT_B, E.outExpo, E.inCubic);
      ctx.save(); ctx.font = K.font(800, 44 * s); var tw = K.textWidth(ctx, p.title || '', 1.5 * s); ctx.restore();
      ctx.fillStyle = K.rgba(T.accent, a); ctx.fillRect(x0, top + 20 * s, tw * ug, 2.5 * s);
      // 항목 — 0.45초 간격 순차 (금점 → 글자)
      items.forEach(function (it, i) {
        var t0 = 0.9 + i * 0.45;
        var ia = life(t, t0, t0 + 0.6, OUT_A, OUT_B);
        if (ia <= 0.002) return;
        var y = top + 78 * s + i * lh, dx = (1 - E.outExpo(seg(t, t0, t0 + 0.6))) * 26 * s;
        ctx.fillStyle = K.rgba(T.accent, ia);
        ctx.beginPath(); ctx.arc(x0 + 10 * s + dx, y + 12 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
        K.drawText(ctx, it, x0 + 40 * s + dx, y + 24 * s, { size: 42 * s, weight: 600, ls: 1 * s, color: T.text, alpha: ia, shadow: { color: 'rgba(0,0,0,0.45)', blur: 8 * s, dy: 2 * s } });
      });
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
