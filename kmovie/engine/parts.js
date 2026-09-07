/* ============================================================
   케이무비 부품 레인 (KMV_PARTS) — 설계서 v1 §1 P 레인 · §4 6번
   ------------------------------------------------------------
   kmake/parts 의 KM_PARTS 를 그대로 부른다(복사 0). 이 파일이 더하는 것 셋:
   1. 메타 — 부품마다 분류·홀드 구간·썸네일 시각·"인물 뒤" 여부. 부품 정의는 손대지 않는다.
   2. 시간 재매핑 — 부품은 고정 길이(오프닝 6초 등)로 만들어졌다. 카드를 늘이면
      등장·퇴장은 원래 속도 그대로, 가운데 "홀드" 만 늘어난다(프리미어 템플릿의 hold 와 같은 원리).
      줄이면 홀드부터 줄고, 그래도 모자라면 전체를 비례로 빨리 돈다. 홀드가 없는 부품(흐르는 글자·광누출)은 항상 비례.
   3. 썸네일 — 부품 목록·패널용 작은 그림(결정적, 캐시).
   같은 (카드, t) 면 같은 그림 — 미리보기 = 내보내기.
   ============================================================ */
(function (g) {
  'use strict';

  /* 홀드 [시작, 끝](초) — 등장이 끝나 자리잡은 뒤 ~ 퇴장이 시작되기 전 */
  const META = {
    opening:   { cat: 'title',  hold: [2.6, 5.2],  thumbT: 3.0 },
    section:   { cat: 'title',  hold: [1.6, 3.35], thumbT: 2.0 },
    knockout:  { cat: 'title',  hold: [1.7, 3.2],  thumbT: 2.2, layer: true, self: true },   // 덮개를 뚫는 부품 — 제 층에서 그려야 촬영본이 글자 안에 남는다; 크기·초점은 부품이 직접(덮개는 항상 꽉)
    lower3rd:  { cat: 'info',   hold: [1.4, 4.3],  thumbT: 2.2, anchor: [0.06, 0.9] },
    counter:   { cat: 'info',   hold: [2.5, 3.35], thumbT: 2.6, anchor: [0.08, 0.5] },
    tag:       { cat: 'info',   hold: [0.9, 4.3],  thumbT: 2.0, anchor: [0.05, 0.09] },
    quote:     { cat: 'title',  hold: [1.8, 5.7],  thumbT: 3.2 },
    chapter:   { cat: 'title',  hold: [1.5, 4.1],  thumbT: 2.4 },
    credits:   { cat: 'title',  hold: [3.4, 6.9],  thumbT: 4.0 },
    list:      { cat: 'info',   hold: [2.6, 6.9],  thumbT: 4.0 },
    sweep:     { cat: 'behind', hold: null,        thumbT: 4.0, behind: true, self: true },   // 흐르는 경로는 그대로, 글자 크기·초점만 부품이 직접
    lightleak: { cat: 'fx',     hold: null,        thumbT: 0.7 },
    // 방송 자막 부품 16종 (p-broadcast.js) — font 는 카드 글꼴 기본값(카드에서 바꿀 수 있음)
    extrude:   { cat: 'bc', hold: [1.4, 4.1], thumbT: 2.0, font: 'blackhan' },
    glass:     { cat: 'bc', hold: [1.2, 4.2], thumbT: 2.2, font: 'pretendard' },
    headline:  { cat: 'bc', hold: [1.1, 5.2], thumbT: 2.0, font: 'notosans' },
    ticker:    { cat: 'bc', hold: null,       thumbT: 3.0, font: 'gothica1' },
    nameplate: { cat: 'bc', hold: [1.3, 4.2], thumbT: 2.2, font: 'notoserif' },
    stamp:     { cat: 'bc', hold: [0.5, 3.3], thumbT: 1.2, font: 'dohyeon', layer: true },   // 잉크 뜯김이 destination-out — 제 층에서
    flip:      { cat: 'bc', hold: [1.2, 4.3], thumbT: 2.4, font: 'montserrat' },
    vertical:  { cat: 'bc', hold: [1.8, 5.2], thumbT: 3.0, font: 'songmyung' },
    marker:    { cat: 'bc', hold: [1.1, 4.2], thumbT: 2.0, font: 'nanumpen' },
    countdown: { cat: 'bc', hold: null,       thumbT: 0.5, font: 'bebas' },
    ribbon:    { cat: 'bc', hold: [0.9, 4.2], thumbT: 2.0, font: 'jua' },
    bubble:    { cat: 'bc', hold: [0.6, 3.3], thumbT: 1.5, font: 'gaegu' },
    live:      { cat: 'bc', hold: [1.0, 7.5], thumbT: 2.0, font: 'inter' },
    split:     { cat: 'bc', hold: [1.2, 4.2], thumbT: 2.2, font: 'pretendard' },
    reflect:   { cat: 'bc', hold: [1.5, 4.2], thumbT: 2.4, font: 'playfair' },
    outline:   { cat: 'bc', hold: [0.8, 4.3], thumbT: 1.6, font: 'jua' },
    // 화면 효과 21종 (engine/vfx.js) — self: 화면 전체를 쓴다(축 변환·무대 없음), loop: 카드를 늘여도 시간 재매핑 없이 그대로 흐른다(봉투는 p._len)
    vfxGrain:     { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxVignette:  { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxFlare:     { cat: 'fx', hold: null, thumbT: 1.2, self: true, loop: true },
    vfxSweep:     { cat: 'fx', hold: null, thumbT: 0.6, self: true },
    vfxRays:      { cat: 'fx', hold: null, thumbT: 1.5, self: true, loop: true },
    vfxGlow:      { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxSoft:      { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxTilt:      { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxGlitch:    { cat: 'fx', hold: null, thumbT: 0.05, self: true, loop: true },
    vfxRgb:       { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxPunch:     { cat: 'fx', hold: null, thumbT: 0.08, self: true },
    vfxShake:     { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxFlash:     { cat: 'fx', hold: null, thumbT: 0.05, self: true },
    vfxOldFilm:   { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxDuotone:   { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxLetterbox: { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxFrame:     { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
    vfxDust:      { cat: 'fx', hold: null, thumbT: 1.5, self: true, loop: true },
    vfxParticles: { cat: 'fx', hold: null, thumbT: 2.0, self: true, loop: true },
    vfxBokeh:     { cat: 'fx', hold: null, thumbT: 1.5, self: true, loop: true },
    vfxSpot:      { cat: 'fx', hold: null, thumbT: 1.0, self: true, loop: true },
  };
  const CATS = [
    { id: 'title',  name: '타이틀' },
    { id: 'info',   name: '정보 표시' },
    { id: 'behind', name: '인물 뒤 글자' },
    { id: 'bc',     name: '방송 자막' },
    { id: 'fx',     name: '화면 효과' },
    { id: 'etc',    name: '기타' },
  ];
  /* 초점(기준점) 9곳 — 크기를 키울 때의 축이자, 스스로 자리를 정하는 부품(뚫린 글자·흐르는 글자)엔 글자가 놓이는 자리 */
  const ANCHORS = [
    { id: 'tl', name: '↖', ax: 0.12, ay: 0.16 }, { id: 't', name: '↑', ax: 0.5, ay: 0.16 }, { id: 'tr', name: '↗', ax: 0.88, ay: 0.16 },
    { id: 'l',  name: '←', ax: 0.12, ay: 0.5  }, { id: 'c', name: '·', ax: 0.5, ay: 0.5  }, { id: 'r',  name: '→', ax: 0.88, ay: 0.5  },
    { id: 'bl', name: '↙', ax: 0.12, ay: 0.84 }, { id: 'b', name: '↓', ax: 0.5, ay: 0.84 }, { id: 'br', name: '↘', ax: 0.88, ay: 0.84 },
  ];
  function anchorOf(card) { if (!card.anchor) return null; const a = ANCHORS.find(x => x.id === card.anchor); return a ? [a.ax, a.ay] : null; }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const SIZE_MIN = 0.25, SIZE_MAX = 3;
  /* 제 층(투명 캔버스) — destination-out 같은 뚫기 연산이 아래 촬영본을 지우지 않게 */
  let layerCv = null;
  function layerCanvas(W, H) {
    if (!layerCv) layerCv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    if (layerCv.width !== W || layerCv.height !== H) { layerCv.width = W; layerCv.height = H; }
    const c = layerCv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H);
    return layerCv;
  }

  function K() { return g.KM_PARTS || null; }
  function def(id) { const k = K(); return k ? k.get(id) : null; }
  function meta(id) { const d = def(id); return META[id] || { cat: 'etc', hold: null, thumbT: d ? d.dur / 2 : 1 }; }
  function ready() { return !!K(); }

  /* 부품 목록 (분류 순) — [{def, meta}] */
  function list() {
    const k = K(); if (!k) return [];
    const order = {}; CATS.forEach((c, i) => order[c.id] = i);
    return k.list().map(d => ({ def: d, meta: meta(d.id) })).sort((a, b) => (order[a.meta.cat] - order[b.meta.cat]) || a.def.name.localeCompare(b.def.name, 'ko'));
  }
  /* 카드가 "인물 뒤" 로 그려지는가 — 카드의 cut 이 있으면 그것, 없으면 메타 */
  function behind(card) { return card.cut != null ? !!card.cut : !!meta(card.part).behind; }
  function canBehind(partId) { return !!meta(partId).behind; }

  /* 카드 안 로컬 프레임(lf, 0..dur-1) → 부품 시각(초). */
  function remap(card, lf, FPS) {
    const d = def(card.part); if (!d) return lf / FPS;
    const N = d.dur, D = card.dur / FPS, t = lf / FPS;
    const mt = meta(card.part), hold = mt.hold;
    if (mt.loop) return t;                                        // 화면 효과: 늘여도 같은 속도로 흐른다
    if (Math.abs(D - N) < 1 / FPS) return t;
    if (!hold) return t * N / D;                                 // 비례
    const ha = hold[0], hb = hold[1], intro = ha, outro = N - hb, holdN = hb - ha;
    if (D < intro + outro) return t * N / D;                     // 너무 짧으면 비례
    const holdD = D - intro - outro;
    if (t < intro) return t;
    if (t < intro + holdD) return ha + (holdD > 0 ? (t - intro) / holdD * holdN : 0);
    return hb + (t - intro - holdD);
  }

  /* 한 카드 그리기 — 호출자가 transform·alpha 를 초기화해 둔다 */
  /* 카드 설정(글꼴·크기·초점·가로/세로·등장/퇴장 효과)을 부품 그리기 바깥에서 씌운다.
     - 보통 부품: 초점(기준점)을 축으로 크기, 가로/세로 만큼 평행 이동.
     - self 부품(뚫린 글자·흐르는 글자): 축 변환 대신 p._size/_ax/_ay/_dx/_dy 를 넘겨 부품이 스스로 자리·크기를 정한다
       (뚫린 글자의 덮개는 항상 화면 꽉 — 바깥에서 축소하면 가장자리가 비어 버린다).
     - layer 부품(뚫기 연산): 제 층에 그린 뒤 얹는다 — 아래 촬영본이 글자 안에 남는다. */
  function geom(card, W, H) {
    const m = META[card.part] || {};
    const sizeK = clamp((card.size == null ? 100 : card.size) / 100, SIZE_MIN, SIZE_MAX);
    const an = anchorOf(card) || m.anchor || [0.5, 0.5];
    return { sizeK, ax: an[0], ay: an[1], dx: (card.x || 0) / 100, dy: (card.y || 0) / 100, set: !!card.anchor, self: !!m.self, layer: !!m.layer };
  }
  /* 부품 무대 — 부품은 16:9(짧은 변 1080) 기준으로 그려져 있다. 세로·정사각 화면에서는
     짧은 변 크기의 무대를 만들어 그 안에 그리고, 기준점(위/가운데/아래)에 맞춰 무대를 화면에 붙인다.
     가로 16:9 에서는 무대 = 화면이라 예전과 완전히 같다. (뚫린 글자 같은 self·layer 부품은 화면 전체를 쓴다) */
  function stage(W, H, ay, full) {
    const bh = full ? H : Math.min(H, W);
    const y = bh >= H ? 0 : ay < 0.34 ? 0 : ay > 0.66 ? H - bh : Math.round((H - bh) / 2);
    return { h: bh, y };
  }
  function drawCard(ctx, W, H, card, t, theme) {
    const k = K(); if (!k || !def(card.part)) return;
    const lf = t - card.at; if (lf < 0 || lf >= card.dur) return;
    const gm0 = geom(card, W, H), st = stage(W, H, gm0.ay, gm0.self || gm0.layer);
    const BH = st.h, BY = st.y;
    const FX = g.KMV_FX, s = BH / 1080;
    let p = card.p;
    const fontId = card.font || (META[card.part] && META[card.part].font) || null;
    if (fontId && FX) { const fam = FX.family(fontId); if (fam) p = Object.assign({}, card.p, { _font: fam }); FX.loadFont(fontId); }
    let fx = null;
    if (FX && (card.fxIn || card.fxOut)) {
      const dIn = card.fxIn ? Math.min(FX.durF(card.fxIn.dur), card.dur) : 0, dOut = card.fxOut ? Math.min(FX.durF(card.fxOut.dur), card.dur) : 0;
      if (card.fxIn && lf < dIn) fx = FX.text(card.fxIn.type, (lf + 0.5) / dIn, 1, { s });
      else if (card.fxOut && card.dur - lf <= dOut) fx = FX.textOut(card.fxOut.type, card.fxIn ? card.fxIn.type : 'fade', 1 - (card.dur - lf - 0.5) / dOut, 1, { s });
      else if (card.fxIn && card.fxIn.type === 'breathe') fx = FX.text('breathe', 1, 1, { s });
      if (fx && fx.per) { const q = fx.per(0, 1, {}); fx.alpha *= q.alpha; fx.dy += q.dy; }   // 글자 단위 효과는 카드 전체로
      if (fx && fx.reveal < 1) fx.alpha *= fx.reveal;
    }
    if (fx && fx.alpha <= 0.003) return;
    const gm = gm0, ax = W * gm.ax, ay = BH * gm.ay;
    if (gm.self) p = Object.assign({}, p, { _size: gm.sizeK, _ax: gm.set ? gm.ax : null, _ay: gm.set ? gm.ay : null, _dx: gm.dx, _dy: gm.dy, _len: card.dur / g.KMV_PROJECT.FPS });
    const outerK = gm.self ? 1 : gm.sizeK, odx = gm.self ? 0 : gm.dx * W, ody = gm.self ? 0 : gm.dy * BH;
    const paint = c2 => {
      c2.save();
      if (outerK !== 1 || odx || ody || fx) {
        let sc = outerK * (fx ? (fx.scale || 1) * (fx.breathe ? 1 + 0.015 * Math.sin(2 * Math.PI * (lf / 30) / 6) : 1) : 1);
        c2.translate(ax + odx, ay + ody + (fx ? fx.dy || 0 : 0)); c2.scale(sc, sc);
        if (fx && fx.skew) c2.transform(1, 0, fx.skew, 1, 0, 0);
        c2.translate(-ax, -ay);
      }
      try { k.frame(card.part, c2, W, BH, remap(card, lf, g.KMV_PROJECT.FPS), p, theme); }
      catch (e) { console.warn('[KMV parts]', card.part, e); }
      c2.restore();
    };
    ctx.save();
    if (BY) ctx.translate(0, BY);
    if (fx) { ctx.globalAlpha *= clamp(fx.alpha, 0, 1); if (fx.blur > 0.2 && 'filter' in ctx) ctx.filter = 'blur(' + fx.blur.toFixed(1) + 'px)'; }
    if (gm.layer) { const cv = layerCanvas(W, BH); paint(cv.getContext('2d')); ctx.drawImage(cv, 0, 0); }
    else paint(ctx);
    ctx.filter = 'none';
    ctx.restore();
  }

  /* 카드 이름표(타임라인·목록용) — 대표 문구 */
  function label(card) {
    const d = def(card.part); if (!d) return card.part;
    const p = card.p || {};
    const key = ['title', 'text', 'name', 'num', 'tone'].find(k => p[k] != null && String(p[k]).trim());
    return d.name + (key ? ' · ' + (key === 'num' && p.label ? p.label + ' ' + p.num + (p.unit || '') : String(p[key])) : '');
  }

  /* ---------- 썸네일 (결정적·캐시) ---------- */
  const thumbCache = new Map();
  /* 썸네일 한 장을 ctx 에 그린다 — bg 가 있으면 그 그림(현재 미리보기 프레임) 위에, 없으면 조용한 두 톤 배경 위에 */
  function paintThumb(ctx, w, h, partId, p, themeId, tt, bg) {
    const k = K(); if (!k) return;
    const m = meta(partId);
    if (bg) { try { ctx.drawImage(bg, 0, 0, w, h); } catch (e) { bg = null; } }
    if (!bg) {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#5a6f92'); grd.addColorStop(0.55, '#8a9ab5'); grd.addColorStop(0.56, '#6d7a5e'); grd.addColorStop(1, '#4a5440');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    }
    if (m.behind && !bg) { // 인물 실루엣 (뒤에 글자가 지나가는 걸 보여 준다)
      ctx.fillStyle = 'rgba(30,34,44,0.9)';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, h * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.34, h); ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.66, h); ctx.closePath(); ctx.fill();
    }
    const FX = g.KMV_FX, fid = m.font, fam = FX && fid ? FX.family(fid) : null;
    const pp = Object.assign({}, p || k.defaults(partId), fam ? { _font: fam } : {});
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (m.layer) { const cv = layerCanvas(w, h); try { k.frame(partId, cv.getContext('2d'), w, h, tt, pp, themeId); } catch (e) {} ctx.drawImage(cv, 0, 0); }
    else { try { k.frame(partId, ctx, w, h, tt, pp, themeId); } catch (e) {} }
    ctx.restore();
    if (m.behind && !bg) { ctx.fillStyle = 'rgba(30,34,44,0.9)'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, h * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.34, h); ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.66, h); ctx.closePath(); ctx.fill(); }
  }
  function thumb(partId, p, themeId, w, h, t) {
    const k = K(); if (!k) return null;
    w = w || 240; h = h || 135;
    const m = meta(partId), tt = t == null ? m.thumbT : t;
    const key = partId + '|' + JSON.stringify(p || {}) + '|' + themeId + '|' + w + 'x' + h + '|' + tt;
    if (thumbCache.has(key)) return thumbCache.get(key);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    paintThumb(cv.getContext('2d'), w, h, partId, p, themeId, tt, null);
    if (thumbCache.size > 120) thumbCache.delete(thumbCache.keys().next().value);
    thumbCache.set(key, cv);
    return cv;
  }

  g.KMV_PARTS = { CATS, META, ANCHORS, SIZE_MIN, SIZE_MAX, ready, list, def, meta, behind, canBehind, remap, geom, stage, drawCard, label, thumb, paintThumb, clamp };
})(typeof window !== 'undefined' ? window : globalThis);
