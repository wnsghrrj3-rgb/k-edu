/* ============================================================
   케이메이커 영상 부품 코어 (KM_PARTS) — 2026-08-27
   ------------------------------------------------------------
   부품 = 순수 함수 draw(ctx, W, H, t, p, theme).
   같은 t 면 같은 그림(결정적). DOM·타이머 접촉 0.
   브라우저(미리보기·향후 내보내기)와 node(render.mjs → 알파 MOV)
   양쪽에서 이 파일 그대로 돈다.

   헌법(영상확장 설계서) 준수: 타임라인·컷 편집 없음.
   부품은 "템플릿 렌더러"의 최소 단위다.
   ============================================================ */
(function (g) {
  'use strict';

  /* ---------- 이징 ---------- */
  var E = {
    lin: function (t) { return t; },
    outExpo: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    inExpo: function (t) { return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1)); },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inCubic: function (t) { return t * t * t; },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); },
    outBack: function (t) { var c = 1.70158, d = c + 1; return 1 + d * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* seg(t, a, b, ease) — t 가 a→b 구간을 지나는 동안 0→1 (이징 적용, 밖은 클램프) */
  function seg(t, a, b, ease) {
    var u = clamp((t - a) / (b - a), 0, 1);
    return (ease || E.outExpo)(u);
  }

  /* 등장 in 구간, 퇴장 out 구간을 가진 표준 생명주기 → 0..1 (퇴장은 1→0) */
  function life(t, inA, inB, outA, outB, easeIn, easeOut) {
    if (t < outA) return seg(t, inA, inB, easeIn || E.outExpo);
    return 1 - seg(t, outA, outB, easeOut || E.inCubic);
  }

  function mix(a, b, u) { return a + (b - a) * u; }

  /* ---------- 색 ---------- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1) + ')'; }

  /* ---------- 텍스트 (자간 수동 — node-canvas 는 letterSpacing 미지원) ---------- */
  var FONT_STACK = '"Pretendard", "Noto Sans CJK KR", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  function font(weight, size) { return weight + ' ' + size + 'px ' + FONT_STACK; }

  function textWidth(ctx, text, ls) {
    ls = ls || 0;
    var w = 0;
    for (var i = 0; i < text.length; i++) w += ctx.measureText(text[i]).width + (i < text.length - 1 ? ls : 0);
    return w;
  }

  /* 한 글자씩 그린다. align: 'left'|'center'|'right'. perChar(i, n) → {alpha, dy, dx} 로 글자별 연출.
     반환: {x0, w} (배치 계산용) */
  function drawText(ctx, text, x, y, o) {
    o = o || {};
    var ls = o.ls || 0;
    ctx.save();
    ctx.font = font(o.weight || 700, o.size || 40);
    ctx.textBaseline = o.baseline || 'alphabetic';
    ctx.textAlign = 'left';
    var w = textWidth(ctx, text, ls);
    var x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    var cx = x0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], cw = ctx.measureText(ch).width;
      var pc = o.perChar ? o.perChar(i, text.length) : null;
      var a = pc && pc.alpha != null ? pc.alpha : 1;
      if (a > 0.002) {
        ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * a;
        ctx.fillStyle = o.color || '#fff';
        if (o.shadow) { ctx.shadowColor = o.shadow.color; ctx.shadowBlur = o.shadow.blur; ctx.shadowOffsetY = o.shadow.dy || 0; }
        ctx.fillText(ch, cx + (pc && pc.dx || 0), y + (pc && pc.dy || 0));
      }
      cx += cw + ls;
    }
    ctx.restore();
    return { x0: x0, w: w };
  }

  /* 둥근 사각 경로 */
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* 영상 위 가독성용 어두운 받침 — 좌하 방사형 (알파 MOV 에 같이 담긴다) */
  function backing(ctx, W, H, a, mode) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = a;
    var grd;
    if (mode === 'bottom') {
      grd = ctx.createLinearGradient(0, H * 0.45, 0, H);
      grd.addColorStop(0, 'rgba(6,14,32,0)');
      grd.addColorStop(1, 'rgba(6,14,32,0.72)');
    } else if (mode === 'left') {
      grd = ctx.createLinearGradient(0, 0, W * 0.7, 0);
      grd.addColorStop(0, 'rgba(6,14,32,0.66)');
      grd.addColorStop(1, 'rgba(6,14,32,0)');
    } else { // center vignette
      grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.95);
      grd.addColorStop(0, 'rgba(6,14,32,0.62)');
      grd.addColorStop(1, 'rgba(6,14,32,0.15)');
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---------- 테마 ---------- */
  var THEMES = {
    // 금성초 — 로고 네이비 + 금성(金星)의 금
    geumseong: { id: 'geumseong', name: '금성초 네이비', primary: '#0B2545', accent: '#D9B65C', text: '#FFFFFF', sub: '#C9D3E3' },
    // 범용 예비
    forest:    { id: 'forest',    name: '숲 초록',        primary: '#1B4332', accent: '#E9C46A', text: '#FFFFFF', sub: '#D5E5DB' },
    wine:      { id: 'wine',      name: '와인',           primary: '#5A1E2B', accent: '#E8C39E', text: '#FFFFFF', sub: '#EBD9D9' },
  };

  /* ---------- 레지스트리 ---------- */
  var REG = {};
  function register(def) {
    if (!def || !def.id || typeof def.draw !== 'function') throw new Error('부품 정의 불량');
    def.dur = def.dur || 5;
    def.fields = def.fields || [];
    REG[def.id] = def;
    return def;
  }
  function defaults(id) {
    var d = REG[id], p = {};
    (d.fields || []).forEach(function (f) { p[f.k] = f.def; });
    return p;
  }
  function list() { return Object.keys(REG).map(function (k) { return REG[k]; }); }

  /* 한 프레임 그리기 — 투명 캔버스에 부품만. 호출자가 clearRect 책임. */
  function frame(id, ctx, W, H, t, p, theme) {
    var d = REG[id];
    if (!d) throw new Error('없는 부품: ' + id);
    var P = Object.assign(defaults(id), p || {});
    var T = typeof theme === 'string' ? THEMES[theme] : (theme || THEMES.geumseong);
    ctx.save();
    d.draw(ctx, W, H, t, P, T);
    ctx.restore();
  }

  g.KM_PARTS = {
    E: E, seg: seg, life: life, mix: mix, clamp: clamp,
    rgba: rgba, hexToRgb: hexToRgb,
    font: font, drawText: drawText, textWidth: textWidth, rrect: rrect, backing: backing,
    THEMES: THEMES, register: register, defaults: defaults, list: list, get: function (id) { return REG[id]; }, frame: frame,
  };
})(typeof window !== 'undefined' ? window : globalThis);
