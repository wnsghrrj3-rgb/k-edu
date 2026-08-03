/* ============================================================
   MK_MANIFEST (R63) — Template Manifest Engine
   ------------------------------------------------------------
   지시서 3단계: "템플릿을 코드가 아니라 데이터로 정의하는 시스템".
   Template → Composition → Scene → Layout → Animation → Theme → Project
   계층을 유지하고, 모든 요소는 Registry 참조로만 잇는다.

   · Layout / Animation / Transition Registry 신설 (전역 공유 — 컴포지션
     안에 갇혀 있던 variantDefs 를 승격)
   · Rules 컴파일러 — "미디어 N장 → 씬 구성" 규칙을 데이터로 선언하면
     mediaPlan 함수로 컴파일된다. if(media>10) 하드코딩 금지.
   · Template Manifest 하나(registerTemplate) 추가 → MK_COMPOSE 에
     Composition 으로 컴파일 등록 → 허브 갤러리 카드 자동 노출 →
     기존 buildProject·에디터·재생·MP4 파이프라인이 그대로 먹는다.
   · Smart Variant — 같은 Manifest 에 variants 를 선언하면 씬 구성·
     레이아웃 순환이 달라진 파생 Composition(hidden)이 함께 등록된다.
   · validate() — 없는 Layout/Theme/Animation/Transition·Scene ID 중복·
     Rule 충돌을 명확한 코드로 보고. 잘못된 Manifest 는 등록 거부.
   · takeover() — 기존 Composition(슬라이드쇼·비포애프터)을 Manifest
     정의로 이관(Migration). 이관 전 함수는 _legacy* 로 보존해
     동일성(플랜 일치)을 기계검증할 수 있다.
   ============================================================ */
window.MK_MANIFEST = (() => {
  'use strict';
  const C = () => window.MK_COMPOSE;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ================= Layout Registry ================= */
  /* 프레임 데이터만 가진다 — Theme·Animation 을 모른다 (계층 원칙).
     스키마 = { name, base:{ m:[frames], cap? }, byRatio?, bg?, needsCaption? } */
  const LAYOUTS = {};
  function registerLayout(id, def) {
    if (!id || LAYOUTS[id]) return null;
    LAYOUTS[id] = { id, ...clone(def) };
    return LAYOUTS[id];
  }
  const getLayout = (id) => LAYOUTS[id] || null;
  const listLayouts = () => Object.keys(LAYOUTS);

  /* 전역 시드 — cx-slideshow 안에 갇혀 있던 variant 8종을 공유 자산으로 승격.
     legacy 별칭(alias)은 Migration 동일성 검증용. */
  const seedLayouts = () => {
    registerLayout('full-media', { name: '풀 미디어', alias: 'full-bleed',
      base: { m: [{ x: 0, y: 0, w: 100, h: 100 }] } });
    registerLayout('framed-center', { name: '가운데 프레임', alias: 'framed-center',
      base: { m: [{ x: 8, y: 8, w: 84, h: 66, radius: 12 }], cap: { x: 8, y: 80, w: 84, align: 'center', maxCh: 20, maxLines: 1 } },
      byRatio: {
        '9:16': { m: [{ x: 6, y: 14, w: 88, h: 54, radius: 12 }], cap: { x: 8, y: 72, w: 84, align: 'center', maxCh: 16, maxLines: 1 } },
        '1:1': { m: [{ x: 8, y: 8, w: 84, h: 62, radius: 12 }], cap: { x: 8, y: 76, w: 84, align: 'center', maxCh: 18, maxLines: 1 } },
        '4:5': { m: [{ x: 7, y: 8, w: 86, h: 60, radius: 12 }], cap: { x: 8, y: 73, w: 84, align: 'center', maxCh: 18, maxLines: 1 } },
      } });
    registerLayout('media-left', { name: '미디어 좌 · 글 우', alias: 'media-left-caption-right', needsCaption: true,
      base: { m: [{ x: 0, y: 0, w: 58, h: 100 }], cap: { x: 62, y: 42, w: 33, align: 'left', maxCh: 11, maxLines: 3 } } });
    registerLayout('media-right', { name: '미디어 우 · 글 좌', alias: 'media-right-caption-left', needsCaption: true,
      base: { m: [{ x: 42, y: 0, w: 58, h: 100 }], cap: { x: 5, y: 42, w: 33, align: 'left', maxCh: 11, maxLines: 3 } } });
    registerLayout('hero', { name: '히어로 강조', alias: 'highlight-zoom', bg: 'dark',
      base: { m: [{ x: 10, y: 16, w: 80, h: 52, radius: 14 }], cap: { x: 8, y: 72, w: 84, align: 'center', maxCh: 16, maxLines: 1 } } });
    registerLayout('split', { name: '좌우 2분할', alias: 'split-two',
      base: { m: [{ x: 0, y: 0, w: 49.5, h: 100 }, { x: 50.5, y: 0, w: 49.5, h: 100 }] } });
    registerLayout('stack', { name: '상하 2분할', alias: 'stacked-two',
      base: { m: [{ x: 0, y: 0, w: 100, h: 49.5 }, { x: 0, y: 50.5, w: 100, h: 49.5 }] } });
    registerLayout('collage', { name: '3장 콜라주', alias: 'collage-three',
      base: { m: [{ x: 0, y: 0, w: 58, h: 100 }, { x: 59, y: 0, w: 41, h: 49 }, { x: 59, y: 51, w: 41, h: 49 }] },
      byRatio: {
        '9:16': { m: [{ x: 0, y: 0, w: 100, h: 49 }, { x: 0, y: 51, w: 49, h: 49 }, { x: 51, y: 51, w: 49, h: 49 }] },
        '4:5': { m: [{ x: 0, y: 0, w: 100, h: 49 }, { x: 0, y: 51, w: 49, h: 49 }, { x: 51, y: 51, w: 49, h: 49 }] },
      } });
    registerLayout('gallery', { name: '4장 갤러리',
      base: { m: [{ x: 0, y: 0, w: 49.5, h: 49 }, { x: 50.5, y: 0, w: 49.5, h: 49 },
                   { x: 0, y: 51, w: 49.5, h: 49 }, { x: 50.5, y: 51, w: 49.5, h: 49 }] } });
  };

  /* ================= Animation Registry ================= */
  /* MK_PLAY·MK_VIDEO 가 실지원하는 프리셋만 등재 — 없는 이름은 검증에서 거부 */
  const ANIMS = {};
  const registerAnimation = (id, def) => { if (!id || ANIMS[id]) return null; ANIMS[id] = { id, ...def }; return ANIMS[id]; };
  const getAnimation = (id) => ANIMS[id] || null;
  const seedAnims = () => {
    registerAnimation('fade', { preset: 'fade', name: '페이드' });
    registerAnimation('slide', { preset: 'slide', name: '슬라이드' });
    registerAnimation('zoom', { preset: 'zoom', name: '줌' });
    registerAnimation('scale', { preset: 'scale', name: '스케일' });
    registerAnimation('pop', { preset: 'pop', name: '팝' });
    registerAnimation('mask', { preset: 'wipe', name: '마스크(닦아내기)' });
    registerAnimation('blur', { preset: 'blur', name: '블러' });
    registerAnimation('kenburns', { idle: true, name: 'Ken Burns', note: '등장이 아니라 idle — assignKenburns 가 배정' });
  };

  /* ================= Transition Registry ================= */
  /* 씬 전환 — 테마 transitions 값 검증용. MP4 는 크로스페이드 렌더(정직 표기) */
  const TRANSITIONS = {};
  const registerTransition = (id, def) => { if (!id || TRANSITIONS[id]) return null; TRANSITIONS[id] = { id, ...def }; return TRANSITIONS[id]; };
  const getTransition = (id) => TRANSITIONS[id] || null;
  const seedTransitions = () => {
    registerTransition('fade', { name: '페이드' });
    registerTransition('dissolve', { name: '디졸브' });
    registerTransition('slide', { name: '슬라이드' });
    registerTransition('push', { name: '푸시' });
    registerTransition('wipe', { name: '와이프' });
    registerTransition('zoom', { name: '줌' });
  };

  /* ================= Theme / Composition — MK_COMPOSE 위임 ================= */
  /* Theme 는 색·타이포·전환만 가진다. Scene 을 모른다 (계층 원칙 — 기존 구조 그대로) */
  const registerTheme = (t) => C().registerTheme(t);
  const listThemes = () => C().listThemes();
  const listCompositions = () => C().listCompositions();

  /* ================= Rules 컴파일러 ================= */
  /* 규칙 데이터 → mediaPlan(r, ratio, captions, start) 함수.
     지원 규칙:
       { when:{ratio}, cycle:[layoutId…] }        — 단일 미디어 레이아웃 순환(비율별)
       { when:{minMedia}, mix:[{slot,layout,take,minLeft}…], cycleLen } — 다장 리듬
       { pairByRatio:{ratio:layoutId}, default }   — 2장 묶음 레이아웃(리듬 slot 'pair')
       { caption:{ demoteWithout, promoteWith } }  — 캡션 없으면 캡션형 회피·있으면 승격
       { noRepeatRun:N }                           — 같은 레이아웃 N회 연속 금지
     레이아웃 id 는 Layout Registry 참조. resolve(alias) 로 기존 variantDefs 이름과 호환. */
  function layoutRef(id, aliasMode) {
    const L = getLayout(id);
    if (!L) return id;
    return aliasMode && L.alias ? L.alias : id;
  }
  function compileRules(rules, opt) {
    const aliasMode = !!(opt && opt.alias);
    const cycles = {}; let defCycle = null;
    let mix = null, mixMin = Infinity, cycleLen = 6;
    let pairBy = null, pairDef = 'split';
    let cap = { demoteWithout: true, promoteWith: true };
    let noRun = 2;
    for (const rule of rules || []) {
      if (rule.cycle) {
        const cyc = rule.cycle.map((l) => layoutRef(l, aliasMode));
        if (rule.when && rule.when.ratio) cycles[rule.when.ratio] = cyc; else defCycle = cyc;
      }
      if (rule.mix) { mix = rule.mix; mixMin = (rule.when && rule.when.minMedia) || 0; cycleLen = rule.cycleLen || 6; }
      if (rule.pairByRatio) { pairBy = rule.pairByRatio; pairDef = rule.default || pairDef; }
      if (rule.caption) cap = { ...cap, ...rule.caption };
      if (rule.noRepeatRun) noRun = rule.noRepeatRun;
    }
    const isCap = (v) => { const L = Object.values(LAYOUTS).find((x) => x.id === v || x.alias === v); return !!(L && L.needsCaption); };
    return function mediaPlan(r, ratio, captions, start) {
      const capAt = (k) => String((captions || [])[start + k] || '').trim();
      const singles = cycles[ratio] || defCycle || [layoutRef('full-media', aliasMode)];
      const two = layoutRef((pairBy && pairBy[ratio]) || pairDef, aliasMode);
      const seq = [];
      let used = 0, si = 0, lastV = null, run = 0;
      while (used < r) {
        const left = r - used;
        if (mix && r >= mixMin) {
          const pos = seq.length % cycleLen;
          const step = mix.find((s) => s.slot === pos && left >= (s.minLeft || s.take + 1));
          if (step) {
            const v = step.layout === 'pair' ? two : layoutRef(step.layout, aliasMode);
            seq.push({ variant: v, take: step.take }); used += step.take; lastV = v; run = 1; continue;
          }
        }
        let v = singles[si % singles.length]; si++;
        const hasCap = !!capAt(used);
        if (cap.demoteWithout && isCap(v) && !hasCap) v = singles.find((x) => !isCap(x)) || layoutRef('full-media', aliasMode);
        if (cap.promoteWith && hasCap && v === layoutRef('full-media', aliasMode))
          v = singles.find((x) => isCap(x)) || singles.find((x) => x !== v) || v;
        if (v === lastV && run >= noRun)
          v = singles.find((x) => x !== lastV && (!isCap(x) || capAt(used)))
            || (lastV === layoutRef('full-media', aliasMode) ? layoutRef('framed-center', aliasMode) : layoutRef('full-media', aliasMode));
        if (v === lastV) run++; else { lastV = v; run = 1; }
        seq.push({ variant: v, take: 1 }); used++;
      }
      return seq;
    };
  }

  /* ================= Manifest 검증 ================= */
  /* 잘못된 Manifest 는 명확한 오류 목록으로 거부 — 조용한 실패 0 */
  const ERR = (code, msg) => ({ code, msg });
  function validate(mf) {
    const errors = [];
    if (!mf || !mf.id) return { ok: false, errors: [ERR('E_NO_ID', 'Manifest 에 id 가 없습니다')] };
    if (TPLS.some((t) => t.id === mf.id)) errors.push(ERR('E_DUP_TEMPLATE', '이미 등록된 Template id: ' + mf.id));
    if (!mf.meta || !mf.meta.name) errors.push(ERR('E_NO_META', 'meta.name 이 없습니다'));
    if (!mf.version) errors.push(ERR('E_NO_VERSION', 'version 이 없습니다'));
    /* Theme 참조 */
    if (mf.theme && !C().getTheme(mf.theme)) errors.push(ERR('E_UNKNOWN_THEME', '없는 Theme: ' + mf.theme));
    /* 비율 */
    for (const rt of mf.supportedRatios || []) if (!C().RATIOS[rt]) errors.push(ERR('E_BAD_RATIO', '없는 비율: ' + rt));
    /* Composition — 참조 모드 or 씬 정의 모드 */
    const refMode = typeof mf.composition === 'string';
    if (refMode) {
      if (!C().getComposition(mf.composition)) errors.push(ERR('E_UNKNOWN_COMPOSITION', '없는 Composition: ' + mf.composition));
    } else {
      const scenes = (mf.composition && mf.composition.scenes) || mf.scenes;
      if (!Array.isArray(scenes) || !scenes.length) errors.push(ERR('E_NO_SCENES', 'Scene 정의가 없습니다'));
      else {
        const ids = new Set();
        for (const sc of scenes) {
          if (!sc.id) { errors.push(ERR('E_NO_SCENE_ID', 'id 없는 Scene')); continue; }
          if (ids.has(sc.id)) errors.push(ERR('E_DUP_SCENE_ID', 'Scene ID 중복: ' + sc.id));
          ids.add(sc.id);
          if (sc.layout && !getLayout(sc.layout)) errors.push(ERR('E_UNKNOWN_LAYOUT', sc.id + ': 없는 Layout: ' + sc.layout));
          if (sc.animation && !getAnimation(sc.animation)) errors.push(ERR('E_UNKNOWN_ANIMATION', sc.id + ': 없는 Animation: ' + sc.animation));
          if (sc.animation && getAnimation(sc.animation) && getAnimation(sc.animation).idle)
            errors.push(ERR('E_ANIM_IDLE_AS_ENTER', sc.id + ': ' + sc.animation + ' 은 등장 애니가 아닙니다'));
          if (sc.transition && !getTransition(sc.transition)) errors.push(ERR('E_UNKNOWN_TRANSITION', sc.id + ': 없는 Transition: ' + sc.transition));
        }
      }
    }
    /* Rules — 레이아웃 참조 + 충돌(같은 조건에 cycle 2개) */
    const seen = {};
    for (const rule of mf.rules || []) {
      for (const l of rule.cycle || []) if (!getLayout(l)) errors.push(ERR('E_UNKNOWN_LAYOUT', 'rules: 없는 Layout: ' + l));
      for (const s of rule.mix || []) if (s.layout !== 'pair' && !getLayout(s.layout)) errors.push(ERR('E_UNKNOWN_LAYOUT', 'rules.mix: 없는 Layout: ' + s.layout));
      for (const l of Object.values(rule.pairByRatio || {})) if (!getLayout(l)) errors.push(ERR('E_UNKNOWN_LAYOUT', 'rules.pair: 없는 Layout: ' + l));
      if (rule.cycle) {
        const key = 'cycle:' + ((rule.when && rule.when.ratio) || '*');
        if (seen[key]) errors.push(ERR('E_RULE_CONFLICT', '같은 조건(' + key + ')에 cycle 규칙이 2개'));
        seen[key] = true;
      }
      if (rule.mix) { if (seen.mix) errors.push(ERR('E_RULE_CONFLICT', 'mix 규칙이 2개')); seen.mix = true; }
    }
    /* Variants */
    for (const [vid, v] of Object.entries(mf.variants || {})) {
      for (const rule of v.rules || []) for (const l of rule.cycle || [])
        if (!getLayout(l)) errors.push(ERR('E_UNKNOWN_LAYOUT', 'variant ' + vid + ': 없는 Layout: ' + l));
      for (const sid of v.skipScenes || []) {
        const scenes = refMode ? (C().getComposition(mf.composition) || {}).scenes || [] : ((mf.composition && mf.composition.scenes) || mf.scenes || []);
        if (!scenes.some((s) => s.id === sid)) errors.push(ERR('E_UNKNOWN_SCENE', 'variant ' + vid + ': 없는 Scene: ' + sid));
      }
    }
    return { ok: !errors.length, errors };
  }

  /* ================= Scene 컴파일 — Manifest Scene → 엔진 spec ================= */
  /* Scene 은 Layout·Animation·Transition 을 참조만 한다. Theme 은 모른다. */
  function compileScene(sc) {
    const spec = { id: sc.id, role: sc.role || 'media', name: sc.name || sc.id,
      required: sc.required !== false, ...(sc.repeatable ? { repeatable: true } : {}),
      ...(sc.usePlan ? { usePlan: true } : {}), ...(sc.needs ? { needs: sc.needs } : {}),
      ...(sc.consumes ? { consumes: sc.consumes } : {}), bg: sc.bg || 'paper',
      duration: sc.duration || { default: 3, min: 2, max: 5, mode: 'fixed' } };
    if (sc.layout) {
      const L = getLayout(sc.layout);
      spec.mediaSlots = (L.base.m || []).map((f, j) => ({ id: 'm' + (j + 1), frame: clone(f), ...(j > 0 ? { required: false } : {}) }));
      if (L.byRatio) spec.layoutByRatio = Object.fromEntries(Object.entries(L.byRatio).map(([rt, d]) =>
        [rt, { mediaSlots: (d.m || []).map((f, j) => ({ id: 'm' + (j + 1), frame: clone(f), ...(j > 0 ? { required: false } : {}) })),
               ...(sc.texts ? { textSlots: sc.texts.map((t) => clone(t)) } : {}) }]));
      if (L.bg && !sc.bg) spec.bg = L.bg;
    }
    if (!sc.layout) {
      /* R64 — Builder 씬은 원본 comp 스펙의 슬롯 데이터를 그대로 실어 나를 수 있다
         (비포애프터 ba-* 씬처럼 Layout Registry 밖의 정밀 프레임 — 좌표는 데이터일 뿐, 코드 아님) */
      if (sc.mediaSlots) spec.mediaSlots = sc.mediaSlots.map((s) => clone(s));
      if (sc.layoutByRatio) spec.layoutByRatio = clone(sc.layoutByRatio);
      if (sc.singleFrame) spec.singleFrame = clone(sc.singleFrame);
    }
    if (sc.pairOnly) spec.pairOnly = true;
    if (sc.texts) spec.textSlots = sc.texts.map((t) => clone(t));
    if (sc.animation) { const A = getAnimation(sc.animation); if (A && A.preset) spec.mediaAnim = A.preset; }
    if (sc.fallback) spec.fallback = sc.fallback;
    return spec;
  }

  /* usePlan 씬이 있는 comp 의 variantDefs — 사용된 레이아웃을 Registry 에서 조립 */
  function variantDefsFromRegistry(layoutIds) {
    const defs = {};
    for (const id of layoutIds) {
      const L = getLayout(id); if (!L) continue;
      defs[id] = { ...(L.bg ? { bg: L.bg } : {}), ...(L.needsCaption ? { needsCaption: true } : {}),
        base: clone(L.base), ...(L.byRatio ? { byRatio: clone(L.byRatio) } : {}) };
    }
    /* 캡션 대체(빈 캡션 → full-media)와 run 대체가 참조하는 기본 2종은 항상 포함 */
    for (const must of ['full-media', 'framed-center']) if (!defs[must] && getLayout(must))
      defs[must] = { base: clone(getLayout(must).base), ...(getLayout(must).byRatio ? { byRatio: clone(getLayout(must).byRatio) } : {}) };
    /* buildScene 의 needsCaption 대체 경로는 'full-bleed' 키를 본다 — 별칭 유지 */
    if (!defs['full-bleed'] && defs['full-media']) defs['full-bleed'] = defs['full-media'];
    return defs;
  }
  function layoutsUsedBy(mf) {
    const set = new Set();
    for (const rule of mf.rules || []) {
      for (const l of rule.cycle || []) set.add(l);
      for (const s of rule.mix || []) if (s.layout !== 'pair') set.add(s.layout);
      for (const l of Object.values(rule.pairByRatio || {})) set.add(l);
      if (rule.pairByRatio && rule.default) set.add(rule.default); /* R64 — pair 기본 레이아웃도 variantDefs 에 */
    }
    for (const [, v] of Object.entries(mf.variants || {}))
      for (const rule of v.rules || []) for (const l of rule.cycle || []) set.add(l);
    return [...set];
  }

  /* ================= Template Registry + 컴파일 등록 ================= */
  const TPLS = [];
  function compileComposition(mf, variantId, variant) {
    const scenesSrc = (mf.composition && mf.composition.scenes) || mf.scenes || [];
    const skip = new Set((variant && variant.skipScenes) || []);
    const scenes = scenesSrc.filter((s) => !skip.has(s.id)).map(compileScene);
    const rules = (variant && variant.rules) || mf.rules || null;
    const comp = {
      id: variantId === 'default' ? mf.id : mf.id + '--' + variantId,
      name: mf.meta.name + (variantId === 'default' ? '' : ' · ' + ((variant && variant.name) || variantId)),
      category: mf.meta.category || '영상', purpose: mf.meta.purpose || '',
      recommendedMediaCount: mf.meta.recommendedMediaCount || { min: 1, max: 20, ideal: 6 },
      recommendedDuration: mf.meta.recommendedDuration || { min: 10, max: 90, default: 30 },
      defaultRatio: mf.defaultRatio || '16:9',
      ...(mf.audio ? { audio: clone(mf.audio) } : {}),
      ...(mf.pairMode ? { pairMode: true } : {}),
      ...(mf.reserveTail ? { reserveTail: mf.reserveTail } : {}),
      ...(variantId !== 'default' ? { hidden: true } : {}),
      manifestId: mf.id, manifestVersion: mf.version, variantId,
      scenes,
    };
    if (rules) { comp.variantDefs = variantDefsFromRegistry(layoutsUsedBy(mf)); comp.mediaPlan = compileRules(rules); }
    return comp;
  }
  function registerTemplate(mf) {
    const v = validate(mf);
    if (!v.ok) return { ok: false, errors: v.errors };
    const manifest = clone(mf);
    const registered = [];
    if (typeof mf.composition === 'string') {
      /* 참조 모드 — 기존 Composition 을 Template 이 감싼다 (Migration 경로는 takeover 사용) */
      manifest._mode = 'reference'; manifest._compId = mf.composition;
    } else {
      manifest._mode = 'scenes';
      const variants = { default: {}, ...(mf.variants || {}) };
      for (const [vid, vdef] of Object.entries(variants)) {
        const comp = compileComposition(mf, vid, vdef);
        if (!C().registerComposition(comp)) return { ok: false, errors: [ERR('E_COMP_DUP', 'Composition id 충돌: ' + comp.id)] };
        registered.push(comp.id);
      }
      manifest._compId = mf.id;
    }
    TPLS.push(manifest);
    return { ok: true, id: mf.id, compositions: registered };
  }
  const getTemplate = (id) => TPLS.find((t) => t.id === id) || null;
  const listTemplates = () => TPLS.map((t) => ({ id: t.id, name: t.meta.name, category: t.meta.category,
    version: t.version, tags: t.tags || [], mode: t._mode, compositionId: t._compId,
    variants: ['default', ...Object.keys(t.variants || {})],
    thumbnail: t.meta.thumbnail || null, preview: t.meta.preview || null }));

  /* ================= build — Template 로 Project 생성 ================= */
  /* Manifest 의 defaults(테마·비율·문구)를 채워 buildProject 로 위임.
     variant 지정 시 파생 Composition 사용. 결정론·순수성은 buildProject 가 보장. */
  function build(templateId, input, opt) {
    const t = getTemplate(templateId);
    if (!t) return { ok: false, why: 'no-template', guide: '등록되지 않은 템플릿이에요: ' + templateId };
    const variant = (opt && opt.variant) || 'default';
    if (variant !== 'default' && !(t.variants || {})[variant])
      return { ok: false, why: 'no-variant', guide: '없는 variant: ' + variant };
    const compId = variant === 'default' ? t._compId : t._compId + '--' + variant;
    const themeId = (opt && opt.theme) || (input && input.themeId) || t.theme || (listThemes()[0] || {}).id;
    const merged = { ...(t.defaults || {}), ...(input || {}),
      texts: { ...((t.defaults || {}).texts || {}), ...((input || {}).texts || {}) },
      ratio: (input && input.ratio) || t.defaultRatio || undefined };
    const r = C().buildProject(compId, themeId, merged);
    return r.ok ? { ...r, templateId, variant, manifestVersion: t.version } : r;
  }

  /* ================= buildDraft — 미등록 Manifest 즉시 빌드 (R64 Builder 미리보기) ================= */
  /* Builder 초안은 Registry 에 없다 — 같은 컴파일러(compileComposition)로 휘발성
     Composition(hidden)을 만들어 buildProject 전 경로를 그대로 태운다.
     Builder 전용 렌더러·별도 포맷 없음 — 실행 포맷 하나만 존재한다는 §19 원칙 준수. */
  let draftSeq = 0;
  function buildDraft(mf, input, opt) {
    const v = validate({ ...mf, id: '__tbd-' + (++draftSeq) }); /* 원본 id 중복검사 회피용 휘발 id 로 구조만 검증 */
    if (!v.ok) return { ok: false, why: 'invalid', errors: v.errors };
    const variant = (opt && opt.variant) || 'default';
    const vdef = variant === 'default' ? {} : (mf.variants || {})[variant];
    if (variant !== 'default' && !vdef) return { ok: false, why: 'no-variant' };
    const comp = compileComposition({ ...clone(mf), id: '__tbd-' + draftSeq }, variant, vdef);
    comp.hidden = true; /* 갤러리 오염 0 */
    if (!C().registerComposition(comp)) return { ok: false, why: 'comp-register-fail' };
    const themeId = (opt && opt.theme) || (input && input.themeId) || mf.theme || (listThemes()[0] || {}).id;
    const merged = { ...(mf.defaults || {}), ...(input || {}),
      texts: { ...((mf.defaults || {}).texts || {}), ...((input || {}).texts || {}) },
      ratio: (input && input.ratio) || mf.defaultRatio || undefined };
    const r = C().buildProject(comp.id, themeId, merged);
    if (C().unregisterComposition) C().unregisterComposition(comp.id); /* 휘발 comp 즉시 회수 */
    return r.ok ? { ...r, draft: true } : r;
  }

  /* ================= unregisterTemplate — 재게시·비활성 지원 (R64) ================= */
  function unregisterTemplate(id) {
    const i = TPLS.findIndex((t) => t.id === id);
    if (i < 0) return false;
    const t = TPLS[i];
    if (t._mode === 'scenes' && C().unregisterComposition) {
      const vids = ['default', ...Object.keys(t.variants || {})];
      for (const vid of vids) C().unregisterComposition(vid === 'default' ? t.id : t.id + '--' + vid);
    }
    TPLS.splice(i, 1);
    return true;
  }

  /* ================= takeover — 기존 Composition 을 Manifest 로 Migration ================= */
  /* 기존 comp 는 살아 있는 객체 — mediaPlan(코드)을 Manifest rules(데이터) 컴파일로
     교체하고, 원본 함수는 _legacyMediaPlan 으로 보존해 동일성 검증에 쓴다.
     기존 씬 스펙·id·갤러리 카드·buildProject 경로 전부 무손상. */
  function takeover(mf) {
    const comp = C().getComposition(mf.composition);
    if (!comp) return { ok: false, errors: [ERR('E_UNKNOWN_COMPOSITION', '없는 Composition: ' + mf.composition)] };
    const v = validate(mf);
    if (!v.ok) return { ok: false, errors: v.errors };
    const manifest = clone(mf);
    manifest._mode = 'takeover'; manifest._compId = mf.composition;
    if (mf.rules && mf.rules.length) {
      if (comp.mediaPlan && !comp._legacyMediaPlan) comp._legacyMediaPlan = comp.mediaPlan;
      comp.mediaPlan = compileRules(mf.rules, { alias: true }); /* 기존 variantDefs 이름 그대로 */
    }
    comp.manifestId = mf.id; comp.manifestVersion = mf.version;
    TPLS.push(manifest);
    return { ok: true, id: mf.id, compositions: [comp.id] };
  }

  /* ================= 감사 ================= */
  function audit() {
    const violations = [];
    if (!Object.keys(LAYOUTS).length) violations.push('no-layouts');
    if (!Object.keys(ANIMS).length) violations.push('no-animations');
    if (!Object.keys(TRANSITIONS).length) violations.push('no-transitions');
    /* 등록 Template 전수 — 검증 재통과 + build 결정론 + Migration 동일성 */
    for (const t of TPLS) {
      if (t._mode === 'takeover') {
        const comp = C().getComposition(t._compId);
        if (!comp) { violations.push(t.id + ':comp-missing'); continue; }
        if (comp._legacyMediaPlan) {
          for (const ratio of Object.keys(C().RATIOS)) for (const n of [1, 3, 8, 16, 24]) {
            const caps = Array.from({ length: n }, (_, i) => (i % 3 === 0 ? '캡션' + i : ''));
            const a = JSON.stringify(comp.mediaPlan(n, ratio, caps, 0));
            const b = JSON.stringify(comp._legacyMediaPlan(n, ratio, caps, 0));
            if (a !== b) violations.push(t.id + ':' + ratio + ':' + n + ':plan-mismatch');
          }
        }
      }
      if (t._mode === 'scenes') {
        const mk = (k) => ({ name: 'p' + k, kind: 'image', src: 'data:image/png;base64,' + k, w: 800, h: 600 });
        const inp = { medias: [mk(1), mk(2), mk(3), mk(4)], texts: { title: '감사' } };
        const a = build(t.id, inp), b = build(t.id, clone(inp));
        if (!a.ok) violations.push(t.id + ':build-fail:' + a.why);
        else if (JSON.stringify(a.doc) !== JSON.stringify(b.doc)) violations.push(t.id + ':nondeterministic');
      }
    }
    return { ok: !violations.length, templates: TPLS.length,
      layouts: Object.keys(LAYOUTS).length, animations: Object.keys(ANIMS).length,
      transitions: Object.keys(TRANSITIONS).length, violations };
  }

  seedLayouts(); seedAnims(); seedTransitions();

  return { registerLayout, getLayout, listLayouts,
    registerAnimation, getAnimation, listAnimations: () => Object.keys(ANIMS),
    registerTransition, getTransition, listTransitions: () => Object.keys(TRANSITIONS),
    registerTheme, listThemes, listCompositions,
    compileRules, validate, registerTemplate, unregisterTemplate, takeover, getTemplate, listTemplates, build, buildDraft, audit };
})();
