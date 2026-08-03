/* ============================================================
   K-MAKER Template Builder Engine (R64)  —  window.MK_TBUILD
   ------------------------------------------------------------
   GPT 4단계 지시서(P1-2) — 코드를 고치지 않고 Registry·Manifest 조합으로
   실작동 템플릿을 만들고·미리보고·저장하고·다시 고치는 제작 도구의 순수 로직.

   원칙(§1·§19·§26):
   · 새 렌더러·새 타임라인·새 엔진 0 — MK_MANIFEST·MK_COMPOSE·MK_RENDER·
     MK_PLAY 를 그대로 재사용한다.
   · 저장 포맷 = registerTemplate 이 그대로 받는 Manifest 하나뿐.
     Builder 전용 실행 포맷 없음. 상태(status 등)는 봉투(envelope)에만 둔다.
   · 미리보기 = MK_MANIFEST.buildDraft → buildProject 실빌드.
   · 게시 = 실빌드 테스트 통과 → registerTemplate → #/video 갤러리 실노출.
   ============================================================ */
(() => {
  'use strict';
  const M = () => window.MK_MANIFEST;
  const C = () => window.MK_COMPOSE;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const KEY = 'mk_tbuild_v1';
  const now = () => Date.now();

  /* ---------------- 저장소 (localStorage — 새로고침 왕복 §19) ---------------- */
  let STORE = [];
  function load() {
    try { STORE = JSON.parse((window.localStorage && localStorage.getItem(KEY)) || '[]') || []; }
    catch (e) { STORE = []; }
  }
  function save() {
    try { if (window.localStorage) localStorage.setItem(KEY, JSON.stringify(STORE)); } catch (e) { /* 저장 불가 환경 — 세션만 */ }
  }
  const get = (id) => STORE.find((e) => e.manifest.id === id) || null;
  function list(f) {
    let out = STORE.slice();
    if (f && f.status) out = out.filter((e) => e.status === f.status);
    if (f && f.composition) out = out.filter((e) => baseOf(e.manifest) === f.composition);
    if (f && f.theme) out = out.filter((e) => e.manifest.theme === f.theme);
    if (f && f.q) { const q = String(f.q).toLowerCase(); out = out.filter((e) => (e.manifest.meta.name || '').toLowerCase().includes(q)); }
    out.sort((a, b) => b.updatedAt - a.updatedAt); /* 최근 수정 순 §3 */
    return out.map((e) => ({ id: e.manifest.id, name: e.manifest.meta.name, status: e.status,
      composition: baseOf(e.manifest), theme: e.manifest.theme,
      ratios: (e.manifest.supportedRatios || []).join('·'), sceneCount: (e.manifest.scenes || []).length,
      gallery: !!e.gallery, updatedAt: e.updatedAt, thumbnail: e.manifest.meta.thumbnail || null }));
  }
  const baseOf = (mf) => mf.pairMode ? 'beforeafter' : 'slideshow';

  /* ---------------- 역할·레이아웃 호환 (§6·§7 — 데이터) ---------------- */
  const ROLES = ['intro', 'title', 'media', 'media-text', 'comparison', 'card', 'list-item',
    'timeline-item', 'highlight', 'quote', 'cta', 'outro', 'section', 'transform'];
  const ROLE_LAYOUTS = {
    intro: ['framed-center', 'full-media', 'hero'], title: ['framed-center', 'hero'],
    media: ['full-media', 'framed-center', 'media-left', 'media-right', 'hero', 'split', 'stack', 'collage', 'gallery'],
    'media-text': ['media-left', 'media-right'], comparison: ['split', 'stack'],
    card: ['framed-center'], 'list-item': ['media-left', 'media-right'], 'timeline-item': ['media-left'],
    highlight: ['hero', 'framed-center'], quote: [], cta: [], outro: [], section: [], transform: ['overlay-two'],
  };
  const layoutsForRole = (role) => (ROLE_LAYOUTS[role] || []).filter((l) => M().getLayout(l));
  const layoutMeta = (id) => {
    const L = M().getLayout(id); if (!L) return null;
    return { id, name: L.name, mediaSlots: (L.base && L.base.m || []).length,
      needsCaption: !!L.needsCaption, ratios: L.byRatio ? Object.keys(L.byRatio) : [],
      roles: Object.keys(ROLE_LAYOUTS).filter((r) => (ROLE_LAYOUTS[r] || []).includes(id)) };
  };

  /* ---------------- 기본 씬 구조 (§5 — Composition 별) ---------------- */
  function baseScenes(kind) {
    if (kind === 'beforeafter') {
      /* 실동작 계약: planPairs 는 ba-* 정본 id 를 본다 — 씬 스펙을 데이터로 그대로 싣는다 */
      const src = C().getComposition('cx-beforeafter');
      return clone(src.scenes).map((s) => {
        const sc = { id: s.id, role: s.role, name: s.name, required: s.required !== false,
          ...(s.pairOnly ? { pairOnly: true } : {}), ...(s.needs ? { needs: s.needs } : {}),
          bg: s.bg || 'paper', duration: clone(s.duration) };
        if (s.singleFrame) sc.singleFrame = clone(s.singleFrame);
        if (s.mediaSlots) sc.mediaSlots = clone(s.mediaSlots);
        if (s.layoutByRatio) sc.layoutByRatio = clone(s.layoutByRatio);
        if (s.textSlots) sc.texts = clone(s.textSlots);
        return sc;
      });
    }
    /* Photo Slideshow — Title / Media(반복) / Highlight / Outro */
    return [
      { id: 'sc-title', role: 'intro', name: '타이틀', required: true, bg: 'dark', layout: 'framed-center', animation: 'pop',
        duration: { default: 3, min: 2, max: 5, mode: 'fixed' },
        texts: [
          { id: 't1', role: 'headline', bind: 'title', defaultText: '나의 이야기', maxCh: 12, maxLines: 2, frame: { x: 8, y: 36, w: 84 }, align: 'center' },
          { id: 't2', role: 'caption', bind: 'subtitle', required: false, maxCh: 18, maxLines: 1, frame: { x: 8, y: 62, w: 84 }, align: 'center' },
        ] },
      { id: 'sc-media', role: 'media', name: '사진', required: true, repeatable: true, usePlan: true, animation: 'fade',
        duration: { default: 3.2, min: 2.5, max: 6, mode: 'media-aware' } },
      { id: 'sc-high', role: 'highlight', name: '하이라이트', required: false, needs: 'highlight', bg: 'accent', animation: 'mask',
        duration: { default: 3, min: 2, max: 5, mode: 'content-aware' },
        texts: [{ id: 't1', role: 'subheadline', bind: 'highlight', maxCh: 14, maxLines: 2, frame: { x: 10, y: 42, w: 80 }, align: 'center' }] },
      { id: 'sc-outro', role: 'outro', name: '아웃트로', required: true, bg: 'dark', animation: 'fade',
        duration: { default: 2.5, min: 2, max: 4, mode: 'fixed' },
        texts: [{ id: 't1', role: 'caption', bind: 'outro', defaultText: 'K-MAKER로 만들었어요', maxCh: 20, maxLines: 1, frame: { x: 8, y: 46, w: 84 }, align: 'center' }] },
    ];
  }
  const baseRules = (kind) => kind === 'beforeafter' ? [] : [
    { when: { ratio: '16:9' }, cycle: ['full-media', 'framed-center', 'media-left'] },
    { when: { ratio: '9:16' }, cycle: ['framed-center', 'full-media'] },
    { when: {}, cycle: ['full-media', 'framed-center'] },
    { caption: { demoteWithout: true, promoteWith: true } },
    { noRepeatRun: 2 },
  ];

  /* ---------------- 생성·복제·기본 정보 (§5·§21) ---------------- */
  let seq = 0;
  const newId = () => 'tb-' + now().toString(36) + '-' + (++seq);
  function create(opt) {
    const kind = opt.composition === 'beforeafter' ? 'beforeafter' : 'slideshow';
    const mf = {
      id: newId(), version: '1.0.0',
      meta: { name: String(opt.name || '새 템플릿').trim() || '새 템플릿',
        category: kind === 'beforeafter' ? '비교' : '앨범', purpose: '', tags: [],
        recommendedMediaCount: kind === 'beforeafter' ? { min: 2, max: 12, ideal: 6 } : { min: 1, max: 24, ideal: 8 },
        recommendedDuration: { min: 10, max: 90, default: 30 }, thumbnail: null, preview: '#/video' },
      theme: opt.theme || (C().listThemes()[0] || {}).id,
      supportedRatios: ['16:9', '9:16', '1:1', '4:5'],
      defaultRatio: opt.ratio && C().RATIOS[opt.ratio] ? opt.ratio : '16:9',
      audio: { synth: 'beat' },
      ...(kind === 'beforeafter' ? { pairMode: true } : {}),
      scenes: baseScenes(kind),
    };
    const rules = baseRules(kind);
    if (rules.length) mf.rules = rules; /* pairMode 는 planPairs 경로 — 빈 rules 로 mediaPlan 오염 금지 */
    const e = { manifest: mf, status: 'draft', gallery: false, createdAt: now(), updatedAt: now() };
    STORE.push(e); save();
    return mf.id;
  }
  function duplicate(id) {
    const e = get(id); if (!e) return null;
    const mf = clone(e.manifest);
    mf.id = newId(); /* 새 templateId — 원본 무변경, Composition id 도 분리되어 충돌 0 (§21) */
    mf.meta.name = (mf.meta.name || '') + ' 복사본';
    const ne = { manifest: mf, status: 'draft', gallery: false, createdAt: now(), updatedAt: now() };
    STORE.push(ne); save();
    return mf.id;
  }
  function remove(id) {
    const e = get(id); if (!e) return false;
    if (e.registered) M().unregisterTemplate(e.manifest.id);
    STORE.splice(STORE.indexOf(e), 1); save(); return true;
  }
  function setInfo(id, patch) {
    const e = get(id); if (!e) return false;
    const mf = e.manifest, meta = ['name', 'description', 'category', 'purpose', 'tags', 'thumbnail',
      'recommendedMediaCount', 'recommendedDuration'];
    for (const [k, v] of Object.entries(patch || {})) {
      if (meta.includes(k)) mf.meta[k] = v;
      else if (['theme', 'supportedRatios', 'defaultRatio', 'defaults'].includes(k)) mf[k] = v;
      else if (k === 'gallery') e.gallery = !!v;
    }
    touch(e); return true;
  }
  function touch(e) { e.updatedAt = now(); if (e.status === 'ready') e.status = 'draft'; /* 수정 → 재검증 필요 */ save(); }

  /* ---------------- Scene 조작 (§6 — 추가·삭제·복제·순서·속성) ---------------- */
  const scOf = (e, sid) => (e.manifest.scenes || []).find((s) => s.id === sid) || null;
  function addScene(id, opt) {
    const e = get(id); if (!e) return { ok: false, msg: '없는 템플릿' };
    const role = ROLES.includes(opt && opt.role) ? opt.role : 'media';
    const layout = opt && opt.layout;
    if (layout && !layoutsForRole(role).includes(layout))
      return { ok: false, msg: '역할 「' + role + '」과 Layout 「' + layout + '」은 호환되지 않아요' }; /* §6 호환 거부 */
    let sn = 0; let sid;
    do { sid = 'sc-' + role + '-' + (++sn); } while (scOf(e, sid));
    const sc = { id: sid, role, name: opt && opt.name || role, required: false,
      ...(layout ? { layout } : {}),
      ...(opt && opt.animation ? { animation: opt.animation } : { animation: 'fade' }),
      duration: { default: 3, min: 2, max: 5, mode: 'fixed' } };
    if (!layout) sc.texts = [{ id: 't1', role: 'subheadline', bind: sid, defaultText: opt && opt.name || role,
      maxCh: 16, maxLines: 2, frame: { x: 10, y: 40, w: 80 }, align: 'center' }];
    const after = opt && opt.after ? e.manifest.scenes.findIndex((s) => s.id === opt.after) : e.manifest.scenes.length - 1;
    e.manifest.scenes.splice(after + 1, 0, sc);
    touch(e); return { ok: true, sceneId: sid };
  }
  function removeScene(id, sid, force) {
    const e = get(id); const sc = e && scOf(e, sid);
    if (!sc) return { ok: false, msg: '없는 Scene' };
    if (sc.required && !force) return { ok: false, warn: true, msg: '「' + (sc.name || sid) + '」은 필수 Scene 이에요 — 정말 삭제할까요?' }; /* §4-2 경고 */
    e.manifest.scenes.splice(e.manifest.scenes.indexOf(sc), 1);
    touch(e); return { ok: true };
  }
  function dupScene(id, sid) {
    const e = get(id); const sc = e && scOf(e, sid);
    if (!sc) return { ok: false, msg: '없는 Scene' };
    const c = clone(sc); let n = 0;
    do { c.id = sid + '-c' + (++n); } while (scOf(e, c.id)); /* 고유 Scene ID (§4-2) */
    c.name = (sc.name || sid) + ' 복사';
    e.manifest.scenes.splice(e.manifest.scenes.indexOf(sc) + 1, 0, c);
    touch(e); return { ok: true, sceneId: c.id };
  }
  function moveScene(id, sid, dir) {
    const e = get(id); if (!e) return false;
    const arr = e.manifest.scenes, i = arr.findIndex((s) => s.id === sid), j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return false;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    touch(e); return true;
  }
  function setScene(id, sid, patch) {
    const e = get(id); const sc = e && scOf(e, sid);
    if (!sc) return { ok: false, msg: '없는 Scene' };
    let note = null;
    for (const [k, v] of Object.entries(patch || {})) {
      if (k === 'layout') {
        if (v && !M().getLayout(v)) return { ok: false, msg: '없는 Layout: ' + v };
        if (v && !layoutsForRole(sc.role).includes(v))
          return { ok: false, msg: '역할 「' + sc.role + '」에는 「' + v + '」 Layout 을 쓸 수 없어요' };
        const before = sc.layout ? (M().getLayout(sc.layout).base.m || []).length : (sc.mediaSlots || []).length;
        const afterN = v ? (M().getLayout(v).base.m || []).length : 0;
        if (v) { sc.layout = v; delete sc.mediaSlots; delete sc.layoutByRatio; delete sc.singleFrame; }
        else delete sc.layout;
        if (before && afterN && afterN < before)
          note = '슬롯이 ' + before + '개 → ' + afterN + '개로 줄어요 — 넘치는 샘플 미디어는 빠져요'; /* §9 안내 */
      }
      else if (['role', 'name', 'bg', 'animation', 'transition', 'required', 'repeatable', 'removable', 'optional', 'usePlan', 'needs', 'consumes', 'texts'].includes(k)) {
        if (k === 'animation' && v && !M().getAnimation(v)) return { ok: false, msg: '없는 Animation: ' + v };
        if (k === 'transition' && v && !M().getTransition(v)) return { ok: false, msg: '없는 Transition: ' + v };
        if (v === null || v === undefined || v === false) delete sc[k]; else sc[k] = v;
        if (k === 'required' && v === true) sc.required = true;
        if (k === 'required' && v === false) sc.required = false;
      }
      else if (k === 'duration') sc.duration = { ...sc.duration, ...v };
      else if (k === 'repeatBasis') { /* §14 — 반복 기준 선택 */
        if (v === 'media-item') { sc.usePlan = true; delete sc.consumes; sc.repeatable = true; }
        else if (v === 'comparison-pair') { sc.pairOnly = true; delete sc.usePlan; }
        else { delete sc.usePlan; delete sc.repeatable; }
      }
    }
    touch(e); return { ok: true, ...(note ? { note } : {}) };
  }

  /* ---------------- 반복 규칙 (§14 — 기존 엔진이 지원하는 규칙의 「선택」 수준) ---------------- */
  function setRules(id, rules) {
    const e = get(id); if (!e) return { ok: false, msg: '없는 템플릿' };
    for (const rule of rules || []) {
      for (const l of rule.cycle || []) if (!M().getLayout(l)) return { ok: false, msg: '없는 Layout: ' + l };
      for (const s of rule.mix || []) if (s.layout !== 'pair' && !M().getLayout(s.layout)) return { ok: false, msg: '없는 Layout: ' + s.layout };
      for (const l of Object.values(rule.pairByRatio || {})) if (!M().getLayout(l)) return { ok: false, msg: '없는 Layout: ' + l };
    }
    e.manifest.rules = clone(rules || []);
    touch(e); return { ok: true };
  }

  /* ---------------- 텍스트 슬롯 (§10) ---------------- */
  function addTextSlot(id, sid, slot) {
    const e = get(id); const sc = e && scOf(e, sid);
    if (!sc) return { ok: false, msg: '없는 Scene' };
    sc.texts = sc.texts || [];
    let n = sc.texts.length; let tid;
    do { tid = 't' + (++n); } while (sc.texts.some((t) => t.id === tid));
    sc.texts.push({ id: tid, role: slot && slot.role || 'body', bind: slot && slot.bind || tid,
      defaultText: slot && slot.defaultText || '', required: false, maxCh: slot && slot.maxCh || 16,
      maxLines: slot && slot.maxLines || 2, frame: slot && slot.frame || { x: 10, y: 40, w: 80 }, align: 'center' });
    touch(e); return { ok: true, slotId: tid };
  }
  function setTextSlot(id, sid, tid, patch) {
    const e = get(id); const sc = e && scOf(e, sid);
    const t = sc && (sc.texts || []).find((x) => x.id === tid);
    if (!t) return { ok: false, msg: '없는 텍스트 슬롯' };
    Object.assign(t, patch || {});
    touch(e); return { ok: true };
  }
  function removeTextSlot(id, sid, tid) {
    const e = get(id); const sc = e && scOf(e, sid);
    if (!sc || !sc.texts) return { ok: false };
    const i = sc.texts.findIndex((x) => x.id === tid);
    if (i < 0) return { ok: false };
    sc.texts.splice(i, 1); touch(e); return { ok: true };
  }

  /* ---------------- 검증 (§17 — Error/Warning, 위치·이유 표기) ---------------- */
  function validateDraft(id, opt) {
    const e = get(id); if (!e) return { ok: false, errors: [{ code: 'E_NO_TPL', msg: '없는 템플릿' }], warnings: [] };
    const mf = e.manifest, errors = [], warnings = [], where = (s) => (s.name || s.id);
    if (!mf.meta.name || !mf.meta.name.trim()) errors.push({ code: 'E_NO_NAME', msg: '템플릿 이름이 비어 있어요 — 상단 이름 칸에 입력하세요' });
    if (!mf.theme || !C().getTheme(mf.theme)) errors.push({ code: 'E_NO_THEME', msg: '기본 Theme 가 없어요 — 우측 속성에서 Theme 를 고르세요' });
    if (!(mf.supportedRatios || []).length) errors.push({ code: 'E_NO_RATIO', msg: '지원 비율이 없어요' });
    if (!(mf.supportedRatios || []).includes(mf.defaultRatio))
      errors.push({ code: 'E_BAD_DEFAULT_RATIO', msg: '기본 비율 ' + mf.defaultRatio + ' 이 지원 비율 목록에 없어요' });
    const scenes = mf.scenes || [];
    if (!scenes.length) errors.push({ code: 'E_NO_SCENES', msg: 'Scene 이 하나도 없어요 — 좌측에서 Scene 을 추가하세요' });
    const ids = new Set();
    scenes.forEach((s, i) => {
      const at = 'Scene ' + (i + 1) + ' · ' + where(s);
      if (ids.has(s.id)) errors.push({ code: 'E_DUP_SCENE_ID', msg: at + ': Scene ID 「' + s.id + '」가 중복이에요' });
      ids.add(s.id);
      if (s.layout && !M().getLayout(s.layout)) errors.push({ code: 'E_UNKNOWN_LAYOUT', msg: at + ': 없는 Layout 「' + s.layout + '」' });
      if (s.animation && !M().getAnimation(s.animation)) errors.push({ code: 'E_UNKNOWN_ANIMATION', msg: at + ': 없는 Animation 「' + s.animation + '」' });
      if (s.transition && !M().getTransition(s.transition)) errors.push({ code: 'E_UNKNOWN_TRANSITION', msg: at + ': 없는 Transition 「' + s.transition + '」' });
      const d = s.duration || {};
      if (!(d.default > 0)) errors.push({ code: 'E_BAD_DURATION', msg: at + ': 기본 길이가 0 이하예요' });
      if (d.min > d.default) errors.push({ code: 'E_BAD_DURATION', msg: at + ': 최소 길이(' + d.min + 's)가 기본 길이(' + d.default + 's)보다 커요' });
      if (d.default > d.max) errors.push({ code: 'E_BAD_DURATION', msg: at + ': 기본 길이(' + d.default + 's)가 최대 길이(' + d.max + 's)보다 커요' });
      if (s.layout && M().getLayout(s.layout)) {
        const need = (M().getLayout(s.layout).base.m || []).length;
        const tids = new Set();
        for (const t of s.texts || []) {
          if (tids.has(t.id)) errors.push({ code: 'E_DUP_SLOT_ID', msg: at + ': 텍스트 슬롯 ID 「' + t.id + '」 중복' });
          tids.add(t.id);
        }
        if (M().getLayout(s.layout).needsCaption && !(s.texts || []).length && !s.usePlan)
          warnings.push({ code: 'W_NO_CAPTION', msg: at + ': 「' + s.layout + '」 Layout 은 캡션이 어울려요 — 텍스트 슬롯이 없어요' });
        if (need === 0 && s.role === 'media')
          warnings.push({ code: 'W_NO_MEDIA_SLOT', msg: at + ': 미디어 역할인데 Layout 에 미디어 슬롯이 없어요' });
      }
      if (s.repeatable && !s.usePlan && !mf.pairMode)
        errors.push({ code: 'E_NO_REPEAT_BASIS', msg: at + ': 반복 Scene 인데 반복 기준(media-item)이 없어요 — 반복 설정에서 고르세요' });
    });
    if (mf.pairMode && !scenes.some((s) => s.pairOnly))
      errors.push({ code: 'E_NO_PAIR_SCENE', msg: '비교 템플릿인데 쌍(pair) Scene 이 하나도 없어요' });
    if (!mf.pairMode && !scenes.some((s) => s.usePlan))
      warnings.push({ code: 'W_NO_PLAN_SCENE', msg: '반복 미디어 Scene 이 없어요 — 사진 수와 무관하게 고정 길이 영상이 돼요' });
    if (e.gallery && !mf.meta.thumbnail)
      (opt && opt.forReady ? errors : warnings).push({ code: 'E_NO_THUMBNAIL', msg: 'Gallery 공개 템플릿인데 썸네일(대표 Layout)이 없어요 — 우측 속성에서 고르세요' });
    /* 구조 검증(엔진) — 중복 id 검사는 재게시 케이스라 제외 */
    const sv = M().validate({ ...clone(mf), id: '__vd-' + mf.id });
    for (const er of sv.errors || []) if (er.code !== 'E_DUP_TEMPLATE') errors.push(er);
    return { ok: !errors.length, errors, warnings };
  }

  /* ---------------- 샘플 콘텐츠 (§15 — MK_STOCK 재사용) ---------------- */
  function sampleMedias(n) {
    const S = window.MK_STOCK;
    const lib = S ? S.LIB.filter((x) => x.cat !== '배경').concat(S.LIB) : [];
    return Array.from({ length: Math.max(1, n | 0) }, (_, i) => {
      const it = lib[i % Math.max(lib.length, 1)];
      return it && S ? { name: it.name, kind: 'image', src: S.srcOf(it.id), w: S.size.w, h: S.size.h }
        : { name: 's' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 };
    });
  }
  const samplePairs = (n) => { const ms = sampleMedias(n * 2);
    return Array.from({ length: n }, (_, i) => ({ before: ms[i * 2], after: ms[i * 2 + 1], title: '변화 ' + (i + 1) })); };
  const sampleTexts = () => ({ title: '샘플 제목', subtitle: '부제', highlight: '가장 빛나는 순간', quote: '기록은 힘이 세다', outro: '고마워요', result: '이렇게 달라졌어요' });

  /* ---------------- 미리보기 실빌드 (§4-3·§16 — buildDraft 재사용) ---------------- */
  function previewBuild(id, opt) {
    const e = get(id); if (!e) return { ok: false, why: 'no-template' };
    const mf = e.manifest;
    const ratio = opt && opt.ratio && (mf.supportedRatios || []).includes(opt.ratio) ? opt.ratio : mf.defaultRatio;
    const input = { ratio, texts: { ...sampleTexts(), ...(opt && opt.texts || {}) } };
    if (mf.pairMode) input.pairs = opt && opt.pairs || samplePairs(opt && opt.pairCount || 2);
    else input.medias = opt && opt.medias || sampleMedias(opt && opt.mediaCount || 5);
    if (opt && opt.method) input.method = opt.method;
    return M().buildDraft(mf, input, { theme: opt && opt.theme });
  }

  /* ---------------- 상태·게시 (§18·§20) ---------------- */
  function publish(id) {
    const e = get(id); if (!e) return { ok: false, errors: [{ msg: '없는 템플릿' }] };
    const v = validateDraft(id, { forReady: true });
    if (!v.ok) return { ok: false, errors: v.errors, warnings: v.warnings };
    /* 실제 프로젝트 생성 테스트 — 통과 못 하면 Ready 불가 (§18) */
    const t = previewBuild(id, {});
    if (!t.ok) return { ok: false, errors: [{ code: 'E_BUILD_FAIL', msg: '실빌드 테스트 실패: ' + (t.why || '') + ' ' + (t.guide || '') }] };
    if (e.registered) M().unregisterTemplate(e.manifest.id);
    const r = M().registerTemplate(clone(e.manifest));
    if (!r.ok) return { ok: false, errors: r.errors };
    e.status = 'ready'; e.registered = true; e.updatedAt = now(); save();
    return { ok: true, warnings: v.warnings, compositions: r.compositions };
  }
  function setStatus(id, st) {
    const e = get(id); if (!e) return false;
    if (st === 'inactive') { if (e.registered) { M().unregisterTemplate(e.manifest.id); e.registered = false; } e.status = 'inactive'; }
    else if (st === 'draft') { e.status = 'draft'; }
    else return false;
    e.updatedAt = now(); save(); return true;
  }
  /* 부팅 시 — 저장돼 있던 Ready 템플릿 재등록 (§20 새로고침 왕복) */
  function restore() {
    let n = 0;
    for (const e of STORE) {
      e.registered = false;
      if (e.status !== 'ready') continue;
      const r = M().registerTemplate(clone(e.manifest));
      if (r.ok) { e.registered = true; n++; }
      else { e.status = 'draft'; } /* 정직 — 재등록 실패면 Ready 로 위장하지 않는다 */
    }
    return n;
  }

  /* ---------------- 감사 ---------------- */
  function audit() {
    const violations = [];
    for (const e of STORE) {
      /* 저장 포맷 = 실행 포맷 하나 — registerTemplate 이 그대로 받는 구조인지 상시 검증 (§19) */
      const sv = M().validate({ ...clone(e.manifest), id: '__au-' + e.manifest.id });
      const hard = (sv.errors || []).filter((x) => x.code !== 'E_DUP_TEMPLATE');
      if (e.status === 'ready' && hard.length) violations.push(e.manifest.id + ':ready-but-invalid');
      if (e.status === 'ready' && !e.registered) violations.push(e.manifest.id + ':ready-not-registered');
    }
    return { ok: !violations.length, drafts: STORE.length, violations };
  }

  load();

  window.MK_TBUILD = { list, get: (id) => { const e = get(id); return e ? { manifest: e.manifest, status: e.status, gallery: e.gallery, updatedAt: e.updatedAt } : null; },
    create, duplicate, remove, setInfo,
    addScene, removeScene, dupScene, moveScene, setScene,
    addTextSlot, setTextSlot, removeTextSlot,
    setRules, validateDraft, previewBuild, publish, setStatus, restore,
    sampleMedias, samplePairs, sampleTexts,
    ROLES, layoutsForRole, layoutMeta, audit,
    _reload: load };
})();
