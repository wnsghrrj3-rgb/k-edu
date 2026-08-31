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
    knockout:  { cat: 'title',  hold: [1.7, 3.2],  thumbT: 2.2 },
    lower3rd:  { cat: 'info',   hold: [1.4, 4.3],  thumbT: 2.2, anchor: [0.06, 0.9] },
    counter:   { cat: 'info',   hold: [2.5, 3.35], thumbT: 2.6, anchor: [0.08, 0.5] },
    tag:       { cat: 'info',   hold: [0.9, 4.3],  thumbT: 2.0, anchor: [0.05, 0.09] },
    quote:     { cat: 'title',  hold: [1.8, 5.7],  thumbT: 3.2 },
    chapter:   { cat: 'title',  hold: [1.5, 4.1],  thumbT: 2.4 },
    credits:   { cat: 'title',  hold: [3.4, 6.9],  thumbT: 4.0 },
    list:      { cat: 'info',   hold: [2.6, 6.9],  thumbT: 4.0 },
    sweep:     { cat: 'behind', hold: null,        thumbT: 4.0, behind: true },
    lightleak: { cat: 'fx',     hold: null,        thumbT: 0.7 },
    // 방송 자막 부품 16종 (p-broadcast.js) — font 는 카드 글꼴 기본값(카드에서 바꿀 수 있음)
    extrude:   { cat: 'bc', hold: [1.4, 4.1], thumbT: 2.0, font: 'blackhan' },
    glass:     { cat: 'bc', hold: [1.2, 4.2], thumbT: 2.2, font: 'pretendard' },
    headline:  { cat: 'bc', hold: [1.1, 5.2], thumbT: 2.0, font: 'notosans' },
    ticker:    { cat: 'bc', hold: null,       thumbT: 3.0, font: 'gothica1' },
    nameplate: { cat: 'bc', hold: [1.3, 4.2], thumbT: 2.2, font: 'notoserif' },
    stamp:     { cat: 'bc', hold: [0.5, 3.3], thumbT: 1.2, font: 'dohyeon' },
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
  };
  const CATS = [
    { id: 'title',  name: '타이틀' },
    { id: 'info',   name: '정보 표시' },
    { id: 'behind', name: '인물 뒤 글자' },
    { id: 'bc',     name: '방송 자막' },
    { id: 'fx',     name: '화면 효과' },
    { id: 'etc',    name: '기타' },
  ];
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

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
    const hold = meta(card.part).hold;
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
  /* 카드 설정(글꼴·크기·세로 위치·등장/퇴장 효과)을 부품 그리기 바깥에서 씌운다 — 부품 정의는 손대지 않는다. */
  function drawCard(ctx, W, H, card, t, theme) {
    const k = K(); if (!k || !def(card.part)) return;
    const lf = t - card.at; if (lf < 0 || lf >= card.dur) return;
    const FX = g.KMV_FX, s = H / 1080;
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
    const sizeK = clamp((card.size == null ? 100 : card.size) / 100, 0.4, 2.5), dy = (card.y || 0) / 100 * H;
    const an = (META[card.part] && META[card.part].anchor) || [0.5, 0.5], ax = W * an[0], ay = H * an[1];   // 크기는 부품이 붙어 있는 자리를 축으로(모서리 부품이 화면 밖으로 안 밀리게)
    ctx.save();
    if (sizeK !== 1 || dy || fx) {
      let sc = sizeK * (fx ? (fx.scale || 1) * (fx.breathe ? 1 + 0.015 * Math.sin(2 * Math.PI * (lf / 30) / 6) : 1) : 1);
      ctx.translate(ax, ay + dy + (fx ? fx.dy || 0 : 0)); ctx.scale(sc, sc);
      if (fx && fx.skew) ctx.transform(1, 0, fx.skew, 1, 0, 0);
      ctx.translate(-ax, -ay);
      if (fx) { ctx.globalAlpha *= clamp(fx.alpha, 0, 1); if (fx.blur > 0.2 && 'filter' in ctx) ctx.filter = 'blur(' + fx.blur.toFixed(1) + 'px)'; }
    }
    try { if (!fx || fx.alpha > 0.003) k.frame(card.part, ctx, W, H, remap(card, lf, g.KMV_PROJECT.FPS), p, theme); }
    catch (e) { console.warn('[KMV parts]', card.part, e); }
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
  function thumb(partId, p, themeId, w, h, t) {
    const k = K(); if (!k) return null;
    w = w || 240; h = h || 135;
    const m = meta(partId), tt = t == null ? m.thumbT : t;
    const key = partId + '|' + JSON.stringify(p || {}) + '|' + themeId + '|' + w + 'x' + h + '|' + tt;
    if (thumbCache.has(key)) return thumbCache.get(key);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    // 촬영본을 대신하는 조용한 배경 — 하늘·운동장 느낌의 두 톤
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#5a6f92'); grd.addColorStop(0.55, '#8a9ab5'); grd.addColorStop(0.56, '#6d7a5e'); grd.addColorStop(1, '#4a5440');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    if (m.behind) { // 인물 실루엣 (뒤에 글자가 지나가는 걸 보여 준다)
      ctx.fillStyle = 'rgba(30,34,44,0.9)';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, h * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.34, h); ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.66, h); ctx.closePath(); ctx.fill();
    }
    try { k.frame(partId, ctx, w, h, tt, p || k.defaults(partId), themeId); } catch (e) {}
    if (m.behind) { ctx.fillStyle = 'rgba(30,34,44,0.9)'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, h * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.34, h); ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.66, h); ctx.closePath(); ctx.fill(); }
    if (thumbCache.size > 120) thumbCache.delete(thumbCache.keys().next().value);
    thumbCache.set(key, cv);
    return cv;
  }

  g.KMV_PARTS = { CATS, META, ready, list, def, meta, behind, canBehind, remap, drawCard, label, thumb, clamp };
})(typeof window !== 'undefined' ? window : globalThis);
