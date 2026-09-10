/* 엠블럼 — 금성초 3D 엠블럼(블렌더 굽기)이 옆에서 돌아 들어와 멈추고, 아래 금선·문구 (5초)
   자산: assets/emblem-in.png (등장 63프레임 스프라이트, 24fps, 8열×384px) · assets/emblem.png (정면 1024px, 멈춘 뒤)
   다른 부품도 K.drawEmblem 으로 같은 엠블럼을 얹는다(오프닝·섹션·로워서드). */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life;

  var SPRITE = { file: 'emblem-in.png', cols: 8, cell: 384, frames: 63, fps: 24 };   // hero_emblem.py --sec 2.6 → make-sprite.py
  var STILL = 'emblem.png';
  var IN_SEC = SPRITE.frames / SPRITE.fps;                                            // 2.625s — 등장이 끝나는 시각

  /* K.drawEmblem(ctx, tIn, x, y, size, alpha)
     tIn  = 등장을 시작한 뒤 지난 초. 0~2.6 은 돌아 들어오는 스프라이트, 그 뒤엔 정면 PNG(고화질)로 살짝 바꿔 얹음.
            Infinity 를 주면 처음부터 정면 그림(배지용).
     size = 그림 한 변(px). 엠블럼 본체는 그림의 가운데 약 78% 폭. */
  K.drawEmblem = function (ctx, tIn, x, y, size, alpha) {
    if (alpha == null) alpha = 1;
    if (alpha <= 0.002 || tIn < 0) return;
    var still = K.asset(STILL);
    if (tIn >= IN_SEC || tIn === Infinity) {
      var swap = tIn === Infinity ? 1 : seg(tIn, IN_SEC, IN_SEC + 0.25, E.lin);      // 스프라이트 마지막 칸 → 정면 PNG 크로스페이드
      if (swap < 1) K.sprite(ctx, K.asset(SPRITE.file), SPRITE.cols, SPRITE.cell, SPRITE.frames - 1, x, y, size, alpha * (1 - swap));
      K.image(ctx, still, x, y, size, alpha * swap);
      return;
    }
    var idx = Math.min(SPRITE.frames - 1, Math.floor(tIn * SPRITE.fps));
    K.sprite(ctx, K.asset(SPRITE.file), SPRITE.cols, SPRITE.cell, idx, x, y, size, alpha);
  };
  /* 배지 — 남색 엠블럼은 밝은 바탕용이라 어두운 패널 위엔 크림 원판을 깔고 얹는다 (d = 원판 지름) */
  K.drawEmblemBadge = function (ctx, x, y, d, alpha) {
    if (alpha == null) alpha = 1;
    if (alpha <= 0.002) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#F4EFE4'; ctx.beginPath(); ctx.arc(x, y, d / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    K.drawEmblem(ctx, Infinity, x, y + d * 0.02, d * 1.12, alpha);
  };
  K.EMBLEM_ASSETS = [SPRITE.file, STILL];
  K.EMBLEM_IN_SEC = IN_SEC;

  K.register({
    id: 'emblem',
    name: '엠블럼 등장',
    dur: 5,
    assets: K.EMBLEM_ASSETS,
    fields: [
      { k: 'caption', label: '아래 문구 (비우면 없음)', def: '금성초등학교' },
      { k: 'size',    label: '크기', def: 'large', opts: ['large', 'medium', 'small'] },
      { k: 'pos',     label: '자리', def: 'center', opts: ['center', 'top', 'left-top', 'right-top'] },
      { k: 'line',    label: '금선', def: 'on', opts: ['on', 'off'] },
      { k: 'backing', label: '어두운 받침', def: 'center', opts: ['center', 'none'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080;
      var OUT_A = 4.35, OUT_B = 5.0;
      var gone = seg(t, OUT_A, OUT_B, E.inCubic);
      var lift = -22 * s * gone;
      var size = ({ large: 560, medium: 400, small: 260 })[p.size] * s;
      var x = W / 2, y = H / 2 - (p.caption ? 40 * s : 0);
      if (p.pos === 'top') y = 90 * s + size / 2;
      else if (p.pos === 'left-top') { x = 90 * s + size / 2; y = 70 * s + size / 2; }
      else if (p.pos === 'right-top') { x = W - 90 * s - size / 2; y = 70 * s + size / 2; }

      if (p.backing !== 'none') K.backing(ctx, W, H, life(t, 0, 0.8, OUT_A, OUT_B) * 0.9, 'center');

      /* 엠블럼 — 0.2초 뒤 돌아 들어옴, 퇴장은 페이드 + 살짝 뜸 */
      K.drawEmblem(ctx, t - 0.2, x, y + lift, size, 1 - gone);

      var ly = y + size * 0.40 + lift;
      /* 금선 — 엠블럼이 멈추는 순간 가운데서 열림 */
      if (p.line !== 'off') {
        var lineW = size * 0.9 * life(t, 2.4, 3.3, OUT_A, OUT_B, E.outExpo, E.inCubic);
        if (lineW > 1) {
          var grd = ctx.createLinearGradient(x - lineW / 2, 0, x + lineW / 2, 0);
          grd.addColorStop(0, K.rgba(T.accent, 0)); grd.addColorStop(0.2, K.rgba(T.accent, 1));
          grd.addColorStop(0.8, K.rgba(T.accent, 1)); grd.addColorStop(1, K.rgba(T.accent, 0));
          ctx.save(); ctx.fillStyle = grd; ctx.fillRect(x - lineW / 2, ly - 1.2 * s, lineW, 2.4 * s); ctx.restore();
        }
      }
      /* 문구 — 금선 뒤에 아래에서 떠오름 */
      if (p.caption) {
        var cU = seg(t, 2.7, 3.5, E.outExpo), cA = life(t, 2.7, 3.5, OUT_A, OUT_B);
        if (cA > 0.002) {
          K.drawText(ctx, p.caption, x, ly + size * 0.085 + (1 - cU) * 14 * s, {
            size: size * 0.10, weight: 800, ls: size * 0.012, color: T.text, align: 'center', alpha: cA,
            shadow: { color: 'rgba(0,0,0,0.35)', blur: 18 * s, dy: 4 * s },
          });
        }
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
