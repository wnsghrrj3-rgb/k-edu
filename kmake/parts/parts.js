/* ============================================================
   케이메이커 영상 부품 코어 (KM_PARTS) — 2026-08-27 · 사진 칸 2026-09-11
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

  var SERIF_STACK = '"Noto Serif KR", "Noto Serif CJK KR", "KoPubWorld Batang", "Apple Myungjo", "Batang", serif';   // 사진 틀 부품(명조)
  var FONT_OVERRIDE = null;                                   // 케이무비 카드 글꼴(p._font = 패밀리명) — frame() 동안만
  function font(weight, size, serif) { return weight + ' ' + size + 'px ' + (FONT_OVERRIDE ? '"' + FONT_OVERRIDE + '", ' : '') + (serif ? SERIF_STACK : FONT_STACK); }

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
    ctx.font = font(o.weight || 700, o.size || 40, o.serif);
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

  /* ---------- 그림 자산 (assets/) — 부품이 쓰는 PNG. 브라우저는 처음 부를 때 알아서 읽고(읽히기 전엔 null → 그 프레임엔 안 그림),
     node(render.mjs) 는 부품의 assets 목록을 미리 읽어 setAsset 으로 넣는다. draw 는 여전히 순수 — 같은 t·같은 자산이면 같은 그림. ---------- */
  var ASSETS = {};
  var ASSET_BASE = (function () {
    try { var src = typeof document !== 'undefined' && document.currentScript && document.currentScript.src; return src ? src.replace(/[^\/]*$/, '') : ''; } catch (e) { return ''; }
  })();
  function asset(name) {
    var a = ASSETS[name];
    if (!a) {
      a = ASSETS[name] = { name: name, src: ASSET_BASE + 'assets/' + name, img: null, ready: null };
      if (typeof Image !== 'undefined') {
        a.ready = new Promise(function (res) { var im = new Image(); im.onload = function () { a.img = im; res(im); }; im.onerror = function () { res(null); }; im.src = a.src; });
      }
    }
    return a.img;
  }
  function setAsset(name, img) { (ASSETS[name] = ASSETS[name] || { name: name, src: name, img: null, ready: null }).img = img; }
  /* 브라우저: 부품(들)이 쓰는 자산이 다 읽힐 때까지 기다림 — 내보내기 전에 한 번 */
  function preload(ids) {
    var names = [];
    (ids || Object.keys(REG)).forEach(function (id) { (REG[id] && REG[id].assets || []).forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); }); });
    names.forEach(asset);
    return Promise.all(names.map(function (n) { return ASSETS[n].ready || Promise.resolve(ASSETS[n].img); }));
  }
  /* 스프라이트 시트에서 idx 번째 칸을 (x,y) 중심·너비 w 로 그림 */
  function sprite(ctx, img, cols, cell, idx, x, y, w, alpha) {
    if (!img || alpha <= 0.002) return;
    var sx = (idx % cols) * cell, sy = Math.floor(idx / cols) * cell;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, cell, cell, x - w / 2, y - w / 2, w, w);
    ctx.restore();
  }
  function image(ctx, img, x, y, w, alpha) {
    if (!img || alpha <= 0.002) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(img, x - w / 2, y - w / 2, w, w);
    ctx.restore();
  }

  /* ---------- 사진 칸 (2026-09-11, 사진 틀 부품) ----------
     필드 { k, label, type:'img', def:'' } — 값은 문자열 열쇠. 열쇠 → 그림 찾기 순서:
       ① photoResolver(열쇠)  — 케이무비가 미디어 id 로 등록(ImageBitmap)
       ② PHOTOS[열쇠]         — setPhoto 로 넣은 것(node 는 파일, 미리보기는 objectURL)
       ③ 열쇠가 주소(http·data·blob)면 브라우저가 직접 읽음(읽히기 전엔 null → 그 프레임엔 자리표시)
     draw 는 여전히 순수 — 같은 t·같은 그림이면 같은 바이트. */
  var PHOTOS = {}, photoResolver = null;
  function setPhoto(key, img) { PHOTOS[key] = img || null; }
  function setPhotoResolver(fn) { photoResolver = fn; }
  function photo(key) {
    if (!key) return null;
    if (photoResolver) { var r = photoResolver(key); if (r) return r; }
    if (key in PHOTOS) return PHOTOS[key];
    if (/^(https?:|data:|blob:|\/|\.)/.test(key) && typeof Image !== 'undefined') {
      PHOTOS[key] = null;
      var im = new Image(); im.onload = function () { PHOTOS[key] = im; }; im.onerror = function () { PHOTOS[key] = null; }; im.src = key;
    }
    return null;
  }
  /* 사진을 (x,y,w,h) 안에 꽉 채워(cover) 그림. zoom 은 1 이상(가운데 기준 확대), 그림이 없으면 조용한 자리표시 */
  function drawCover(ctx, img, x, y, w, h, zoom, alpha) {
    if (alpha != null && alpha <= 0.002) return;
    zoom = zoom || 1;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (alpha != null) ctx.globalAlpha *= alpha;
    if (img && (img.width || img.naturalWidth)) {
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      var k = Math.max(w / iw, h / ih) * zoom, dw = iw * k, dh = ih * k;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      var g2 = ctx.createLinearGradient(x, y, x + w, y + h);
      g2.addColorStop(0, '#E9E4DA'); g2.addColorStop(1, '#D3CCC0');
      ctx.fillStyle = g2; ctx.fillRect(x, y, w, h);
      var r = Math.min(w, h) * 0.11;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(1.5, r * 0.09);
      rrect(ctx, x + w / 2 - r * 1.3, y + h / 2 - r * 0.9, r * 2.6, r * 1.8, r * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 + r * 0.05, r * 0.5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- 레지스트리 ---------- */
  var REG = {};
  function register(def) {
    if (!def || !def.id || typeof def.draw !== 'function') throw new Error('부품 정의 불량');
    def.dur = def.dur || 5;
    def.fields = def.fields || [];
    def.assets = def.assets || [];
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
    var prevFont = FONT_OVERRIDE; FONT_OVERRIDE = P._font || null;
    ctx.save();
    try { d.draw(ctx, W, H, t, P, T); } finally { ctx.restore(); FONT_OVERRIDE = prevFont; }
  }

  g.KM_PARTS = {
    E: E, seg: seg, life: life, mix: mix, clamp: clamp,
    rgba: rgba, hexToRgb: hexToRgb,
    font: font, drawText: drawText, textWidth: textWidth, rrect: rrect, backing: backing,
    asset: asset, setAsset: setAsset, preload: preload, sprite: sprite, image: image,
    photo: photo, setPhoto: setPhoto, setPhotoResolver: setPhotoResolver, drawCover: drawCover,
    THEMES: THEMES, register: register, defaults: defaults, list: list, get: function (id) { return REG[id]; }, frame: frame,
  };
})(typeof window !== 'undefined' ? window : globalThis);
