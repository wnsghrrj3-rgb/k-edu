/* 오프닝 타이틀 — 학교 이름이 중앙에서 한 글자씩 떠오르고 금선이 열린다 (6초) */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;

  K.register({
    id: 'opening',
    name: '오프닝 타이틀',
    dur: 6,
    fields: [
      { k: 'eyebrow', label: '작은 영문', def: 'GEUMSEONG ELEMENTARY SCHOOL' },
      { k: 'title',   label: '학교 이름', def: '금성초등학교' },
      { k: 'tagline', label: '한 줄 문구', def: '함께 배우고, 함께 빛나는' },
      { k: 'backing', label: '어두운 받침', def: 'center', opts: ['center', 'bottom', 'none'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, cx = W / 2, cy = H / 2;
      var OUT_A = 5.2, OUT_B = 6.0;
      var gone = seg(t, OUT_A, OUT_B, E.inCubic);       // 0→1 퇴장 진행
      var lift = -26 * s * gone;                          // 퇴장 시 살짝 떠오르며 사라짐

      if (p.backing !== 'none') K.backing(ctx, W, H, life(t, 0, 0.8, OUT_A, OUT_B) * 0.9, p.backing);

      /* 금선 — 중앙에서 좌우로 열림 → 퇴장 시 다시 닫힘 */
      var lineW = 620 * s * life(t, 0.15, 1.15, OUT_A, OUT_B, E.outExpo, E.inCubic);
      if (lineW > 1) {
        ctx.save();
        ctx.globalAlpha = 1;
        var gy = cy + 62 * s + lift;
        var grd = ctx.createLinearGradient(cx - lineW / 2, 0, cx + lineW / 2, 0);
        grd.addColorStop(0, K.rgba(T.accent, 0));
        grd.addColorStop(0.18, K.rgba(T.accent, 1));
        grd.addColorStop(0.82, K.rgba(T.accent, 1));
        grd.addColorStop(1, K.rgba(T.accent, 0));
        ctx.fillStyle = grd;
        ctx.fillRect(cx - lineW / 2, gy - 1.5 * s, lineW, 3 * s);
        // 가운데 작은 금점(별)
        var dot = seg(t, 0.05, 0.5, E.outBack) * (1 - gone);
        ctx.fillStyle = T.accent;
        ctx.beginPath(); ctx.arc(cx, gy, 4.5 * s * dot, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      /* 작은 영문 — 넓은 자간, 위에서 스르륵 */
      var eyA = life(t, 1.15, 1.9, OUT_A, OUT_B);
      if (eyA > 0.002) {
        K.drawText(ctx, p.eyebrow, cx, cy - 118 * s + lift + (1 - seg(t, 1.15, 1.9)) * -10 * s, {
          size: 22 * s, weight: 600, ls: 7 * s, color: T.accent, align: 'center', alpha: eyA,
        });
      }

      /* 학교 이름 — 글자별 스태거, 아래→위 + 페이드 */
      var title = p.title, n = title.length;
      var titleAlpha = 1 - gone;
      K.drawText(ctx, title, cx, cy + 22 * s + lift, {
        size: 132 * s, weight: 900, ls: -2 * s, color: T.text, align: 'center', alpha: titleAlpha,
        shadow: { color: 'rgba(0,0,0,0.35)', blur: 24 * s, dy: 6 * s },
        perChar: function (i) {
          var a = 0.55 + i * 0.07, u = seg(t, a, a + 0.75, E.outExpo);
          return { alpha: u, dy: (1 - u) * 46 * s };
        },
      });

      /* 한 줄 문구 */
      var tgU = seg(t, 1.7, 2.5, E.outExpo), tgA = life(t, 1.7, 2.5, OUT_A, OUT_B);
      if (tgA > 0.002) {
        K.drawText(ctx, p.tagline, cx, cy + 128 * s + lift + (1 - tgU) * 16 * s, {
          size: 34 * s, weight: 500, ls: 2 * s, color: T.sub, align: 'center', alpha: tgA,
        });
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
