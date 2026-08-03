/* ============================================================
   MK_SVAR (R65) — Smart Variant · Auto Balance (P1-3 전반부)
   ------------------------------------------------------------
   지시서 P1-3 §1~§8·§13~§21: 미디어 수·유형·방향에 따라 같은
   템플릿이 스스로 자연스러운 구성을 고르는 규칙 기반 계층.
   AI 없음 — 전부 결정론(같은 입력 = 같은 결과), 재현 가능.

   원칙(§2):
   · 기존 엔진 무교체 — MK_MANIFEST.build → MK_COMPOSE.buildProject
     경로를 그대로 태운다. 배치 계획만 input._planOverride 훅
     (compose.js add-only)으로 주입한다.
   · Variant 정의는 데이터 — defineVariants() 로 등록 (R66 에서
     Template Builder 가 이 API 로 연결된다).
   · 미디어 전량 사용·빈 슬롯 0·필수 씬 유지 — 엔진 규약 준수.
   · 사용자 역할(mediaRoles)만 반영: highlight(중요)·start(시작)·
     end(마지막)·exclude(제외). 제외해도 원본 목록은 무손상.

   Randomize·seed·잠금·source 추적·Builder UI 연결은 R66.
   ============================================================ */
window.MK_SVAR = (() => {
  'use strict';
  const C = () => window.MK_COMPOSE;
  const M = () => window.MK_MANIFEST;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const R1 = (x) => Math.round(x * 10) / 10;

  /* ================= 공통 상수 (§14 — 기준값 단일 관리) ================= */
  /* 방향 분류는 기존 정규화(analyzeMedia, w/h 1.15)를 그대로 쓴다 — 이중 기준 금지 */
  const CONST = {
    DOMINANT: 0.6,          /* 방향 우세 판정 비율 */
    HL_BONUS: 1.0,          /* Highlight duration 가산(초) — §21 0.5~1.5 범위 내 고정값 */
    DUR_FLOOR: 1.5,         /* 길이 압축 하한(초) — 가독성 보호 */
    SHRINK_FLOOR: 0.6,      /* 압축 최대 비율 */
  };

  /* ================= 입력 미디어 통계 (§13 분석 범위) ================= */
  function mediaStats(input) {
    const inp = input || {};
    const media = C().analyzeMedia(inp.medias);
    const texts = inp.texts || {};
    const caps = inp.mediaCaptions || [];
    const o = { portrait: 0, landscape: 0, square: 0, unknown: 0 };
    let videos = 0, videoDuration = 0;
    for (const it of media.items) {
      o[it.orient] = (o[it.orient] || 0) + 1;
      if (it.kind === 'video') { videos++; videoDuration += it.duration || 0; }
    }
    const n = media.count, known = n - o.unknown;
    const dom = !known ? 'mixedOrientation'
      : o.portrait / known >= CONST.DOMINANT ? 'portraitDominant'
      : o.landscape / known >= CONST.DOMINANT ? 'landscapeDominant'
      : o.square / known >= CONST.DOMINANT ? 'squareDominant' : 'mixedOrientation';
    const kind = n === 0 ? 'none' : videos === n ? 'videoOnly' : videos === 0 ? 'imageOnly' : 'mixed';
    const captionCount = caps.filter((c) => String(c || '').trim()).length;
    const has = (k) => !!(texts[k] != null && String(texts[k]).trim());
    const pairCount = Array.isArray(inp.pairs)
      ? inp.pairs.filter((p) => p && (p.before || p.after)).length
      : Math.ceil(n / 2);
    return { count: n, images: n - videos, videos, videoDuration: R1(videoDuration),
      kind, orient: o, orientation: dom,
      hasTitle: has('title'), hasSubtitle: has('subtitle'), hasCaptions: captionCount > 0,
      captionCount, textDensity: n ? R1(captionCount / n) : 0, pairCount, items: media.items };
  }

  /* ================= Variant 정의 레지스트리 ================= */
  /* 스키마(§5): { id, name, priority, conditions, sceneStrategy,
     layoutPool, animationPool, transitionPool, duration } */
  const VARS = {};
  function defineVariants(templateId, list) {
    if (!templateId || !Array.isArray(list) || !list.length) return false;
    VARS[templateId] = clone(list);
    return true;
  }
  const listVariants = (tid) => clone(VARS[tid] || []);
  const getVariant = (tid, vid) => (VARS[tid] || []).find((v) => v.id === vid) || null;

  /* ================= Variant 조건 판정 (§6) ================= */
  /* 반환: { declared, matched, fail:[…] } — 선언한 조건 수와 일치 수 */
  function matchConditions(cond, s, ratio) {
    let declared = 0, matched = 0; const fail = [], why = [];
    const chk = (label, cnd, ok, note) => { declared++; if (ok) { matched++; why.push(note); } else fail.push(label); };
    const c = cond || {};
    if (c.mediaCountMin != null || c.mediaCountMax != null) {
      const lo = c.mediaCountMin != null ? c.mediaCountMin : 0;
      const hi = c.mediaCountMax != null ? c.mediaCountMax : Infinity;
      chk('mediaCount', c, s.count >= lo && s.count <= hi,
        'mediaCount ' + s.count + ' matched ' + lo + '–' + (hi === Infinity ? '∞' : hi));
    }
    if (c.pairCountMin != null || c.pairCountMax != null) {
      const lo = c.pairCountMin != null ? c.pairCountMin : 0;
      const hi = c.pairCountMax != null ? c.pairCountMax : Infinity;
      chk('pairCount', c, s.pairCount >= lo && s.pairCount <= hi,
        'pairCount ' + s.pairCount + ' matched ' + lo + '–' + (hi === Infinity ? '∞' : hi));
    }
    if (c.mediaKind) chk('mediaKind', c, c.mediaKind === s.kind, 'mediaKind ' + s.kind + ' matched');
    if (c.orientation) chk('orientation', c, c.orientation === s.orientation, 'orientation ' + s.orientation + ' matched');
    if (Array.isArray(c.ratio) && c.ratio.length) chk('ratio', c, c.ratio.includes(ratio), 'output ratio ' + ratio + ' matched');
    if (c.hasTitle != null) chk('hasTitle', c, c.hasTitle === s.hasTitle, 'hasTitle=' + s.hasTitle + ' matched');
    if (c.hasCaptions != null) chk('hasCaptions', c, c.hasCaptions === s.hasCaptions, 'hasCaptions=' + s.hasCaptions + ' matched');
    return { declared, matched, fail, why };
  }

  /* ================= Variant 선택 (§7 — 결정론, 무작위 금지) ================= */
  /* 순서: ① 사용자 지정 → ② 조건 전부 일치 → ③ 최고 점수 → ④ priority → ⑤ 기본 */
  function selectVariant(templateId, stats, opt) {
    const defs = VARS[templateId] || [];
    if (!defs.length) return { id: 'default', def: null, reason: ['템플릿에 Variant 정의 없음 — 기본 구성'] };
    const ratio = (opt && opt.ratio) || '16:9';
    if (opt && opt.variant) {
      const u = defs.find((v) => v.id === opt.variant);
      if (u) return { id: u.id, def: clone(u), reason: ['사용자가 직접 선택: ' + u.id] };
    }
    const scored = defs.map((v, order) => {
      const m = matchConditions(v.conditions, stats, ratio);
      return { v, order, ...m, exact: m.declared > 0 && m.fail.length === 0 };
    });
    /* 결정론적 정렬 키: exact > matched > priority > 정의 순서 */
    const pick = (arr) => arr.slice().sort((a, b) =>
      (b.exact - a.exact) || (b.matched - a.matched) || ((b.v.priority || 0) - (a.v.priority || 0)) || (a.order - b.order))[0];
    const exacts = scored.filter((x) => x.exact);
    const best = exacts.length ? pick(exacts)
      : scored.some((x) => x.matched > 0) ? pick(scored)
      : scored.find((x) => x.v.id === 'default') || scored[0];
    const reason = ['Selected Variant: ' + best.v.id,
      ...(best.why || []).map((w) => '- ' + w),
      ...(!best.exact && best.fail && best.fail.length ? ['- (부분 일치 — 미충족: ' + best.fail.join(', ') + ')'] : [])];
    return { id: best.v.id, def: clone(best.v), reason };
  }

  /* ================= 기본 Variant 세트 (§8) ================= */
  const SS_ANIMS = ['fade', 'zoom', 'slide'];
  const SS_TRANS = ['fade', 'dissolve', 'push'];
  function seedDefaults() {
    defineVariants('tm-slideshow', [
      { id: 'compact', name: '컴팩트', priority: 10,
        conditions: { mediaCountMin: 1, mediaCountMax: 4 },
        sceneStrategy: { intro: 'auto', title: 'auto', outro: 'include', maxSceneCount: 8, allowCollage: false, allowPair: false },
        layoutPool: ['full-media', 'framed-center', 'media-left', 'media-right', 'hero'],
        animationPool: SS_ANIMS, transitionPool: SS_TRANS,
        duration: { maxTotal: 30 } },
      { id: 'standard', name: '스탠다드', priority: 10,
        conditions: { mediaCountMin: 5, mediaCountMax: 10 },
        sceneStrategy: { intro: 'include', title: 'auto', outro: 'include', maxSceneCount: 14, allowCollage: false, allowPair: true, maxHighlight: 1 },
        layoutPool: ['full-media', 'framed-center', 'media-left', 'media-right', 'hero', 'split', 'stack'],
        animationPool: SS_ANIMS, transitionPool: SS_TRANS,
        duration: { maxTotal: 60 } },
      { id: 'extended', name: '익스텐디드', priority: 10,
        conditions: { mediaCountMin: 11, mediaCountMax: 20 },
        sceneStrategy: { intro: 'include', title: 'auto', outro: 'include', maxSceneCount: 18, allowCollage: true, collageThreshold: 11, allowPair: true, maxHighlight: 2 },
        layoutPool: ['full-media', 'framed-center', 'media-left', 'media-right', 'hero', 'split', 'stack', 'collage'],
        animationPool: SS_ANIMS, transitionPool: SS_TRANS,
        duration: { maxTotal: 90 } },
      { id: 'large', name: '라지 세트', priority: 10,
        conditions: { mediaCountMin: 21 },
        sceneStrategy: { intro: 'include', title: 'auto', outro: 'include', maxSceneCount: 20, allowCollage: true, collageThreshold: 1, allowPair: true, maxHighlight: 2 },
        layoutPool: ['full-media', 'framed-center', 'hero', 'split', 'stack', 'collage'],
        animationPool: SS_ANIMS, transitionPool: SS_TRANS,
        duration: { maxTotal: 90, overLimitNote: true } },
    ]);
    defineVariants('tm-beforeafter', [
      { id: 'single-pair', name: '싱글 페어', priority: 10,
        conditions: { pairCountMin: 1, pairCountMax: 1 },
        sceneStrategy: {}, layoutPool: [], animationPool: SS_ANIMS, transitionPool: ['fade', 'wipe'],
        duration: { maxTotal: 30 } },
      { id: 'multi-pair', name: '멀티 페어', priority: 10,
        conditions: { pairCountMin: 2, pairCountMax: 4 },
        sceneStrategy: {}, layoutPool: [], animationPool: SS_ANIMS, transitionPool: ['fade', 'wipe'],
        duration: { maxTotal: 60 } },
      { id: 'extended-comparison', name: '익스텐디드 비교', priority: 10,
        conditions: { pairCountMin: 5 },
        sceneStrategy: { pairScale: true }, layoutPool: [], animationPool: SS_ANIMS, transitionPool: ['fade', 'wipe'],
        duration: { maxTotal: 60, overLimitNote: true } },
    ]);
  }

  /* ================= 방향 ↔ 레이아웃 매칭표 (§15 — Registry 실존만) ================= */
  /* 단일 미디어 씬의 선호 순서. 캡션형(media-left/right)은 캡션 있을 때만 승격. */
  const SINGLE_PREF = {
    '16:9': { landscape: ['full-media', 'media-left', 'media-right', 'framed-center'],
              portrait: ['framed-center', 'hero', 'media-left', 'media-right'],
              square: ['framed-center', 'full-media'], unknown: ['full-media', 'framed-center'] },
    '9:16': { portrait: ['full-media', 'framed-center', 'hero'],
              landscape: ['framed-center', 'hero'],
              square: ['framed-center', 'full-media'], unknown: ['full-media', 'framed-center'] },
    '1:1':  { landscape: ['framed-center', 'full-media'], portrait: ['framed-center', 'full-media'],
              square: ['full-media', 'framed-center'], unknown: ['framed-center', 'full-media'] },
    '4:5':  { portrait: ['full-media', 'framed-center'], landscape: ['framed-center'],
              square: ['framed-center', 'full-media'], unknown: ['framed-center', 'full-media'] },
  };
  /* 2장 묶음: 방향쌍 → split/stack (비율 기본은 R63 pairByRatio 와 동일) */
  function pairLayout(ratio, oa, ob) {
    if (oa === 'landscape' && ob === 'landscape') return 'stack';
    if (oa === 'portrait' && ob === 'portrait') return 'split';
    return (ratio === '9:16' || ratio === '4:5') ? 'stack' : 'split';
  }

  /* ================= 역할 정규화 (§19) ================= */
  /* mediaRoles: { 원본인덱스: 'highlight'|'start'|'end'|'exclude' } — 미디어당 1역할(충돌 원천 차단) */
  const ROLE_SET = ['highlight', 'start', 'end', 'exclude'];
  function normRoles(roles, n) {
    const out = {};
    for (const [k, v] of Object.entries(roles || {})) {
      const i = +k;
      if (!Number.isInteger(i) || i < 0 || i >= n) continue;
      if (ROLE_SET.includes(v)) out[i] = v;
    }
    return out;
  }

  /* ================= Auto Balance 플래너 (§13~§20) ================= */
  /* items(제외 반영 전 원본 인덱스 포함) → { order:[원본 idx…], steps:[{variant, take, hl?}], notes, warnings }
     불변식: order 는 배치분 전량(중복 0·누락 0), steps 의 take 합 = order.length - reserve. */
  function balancePlan(items, vdef, ratio, captions, roles) {
    const notes = [], warnings = [];
    const st = (vdef && vdef.sceneStrategy) || {};
    const pool = new Set((vdef && vdef.layoutPool) || ['full-media', 'framed-center']);
    const M0 = M();
    const alias = (id) => { const L = M0.getLayout(id); return (L && L.alias) || id; };

    /* ① 역할 반영 순서 — start 앞·end 뒤·highlight 표식 (그 외 원순서 유지 = 결정론) */
    const starts = [], mids = [], ends = [];
    for (const it of items) {
      const r = roles[it._i];
      if (r === 'start') starts.push(it);
      else if (r === 'end') ends.push(it);
      else mids.push(it);
    }
    let seqItems = [...starts, ...mids, ...ends];
    const n = seqItems.length;
    if (!n) return { order: [], steps: [], notes, warnings };

    /* ② reserve — 마지막 1장은 하이라이트 씬(ss-high) 몫 (comp.reserveTail 규약).
       end 역할이 있으면 그 마지막 장이, 없고 highlight 역할이 있으면 첫 highlight 를 끝으로 이동. */
    const reserve = n >= 2 ? 1 : 0;
    let hlTail = false;
    if (reserve && !ends.length) {
      const hi = seqItems.findIndex((it) => roles[it._i] === 'highlight');
      if (hi >= 0 && hi < n - 1) { const [h] = seqItems.splice(hi, 1); seqItems.push(h); hlTail = true; }
      else if (hi === n - 1) hlTail = true;
    }
    if (reserve && ends.length && roles[seqItems[n - 1]._i] === 'highlight') hlTail = true;
    const body = seqItems.slice(0, n - reserve);

    /* ③ 스텝 예산 — maxSceneCount 안에서 전량 소화 (§18 미디어 과다) */
    const overhead = 4; /* intro·title·highlight·outro 대략치 — 예산 계산용 */
    const maxContent = Math.max(1, (st.maxSceneCount || 99) - overhead);
    const allowPair = st.allowPair !== false && (pool.has('split') || pool.has('stack'));
    const allowCollage = !!st.allowCollage && pool.has('collage') && items.length >= (st.collageThreshold || 1);
    const maxHl = st.maxHighlight != null ? st.maxHighlight : 2;

    const steps = [];
    const order = [];
    let cursor = [...body];
    let last = null, run = 0, capDir = 0, hlUsed = 0, collageRun = 0;

    const takeMatching = (k) => {
      /* 방향이 맞는 k장을 앞에서부터 결정론적으로 뽑는다 */
      const first = cursor[0];
      const picked = [first];
      let scan = 1;
      while (picked.length < k && scan < cursor.length) {
        if (picked.length < k && cursor[scan].orient === first.orient) picked.push(cursor[scan]);
        scan++;
      }
      let scan2 = 1;
      while (picked.length < k && scan2 < cursor.length) {
        if (!picked.includes(cursor[scan2])) picked.push(cursor[scan2]);
        scan2++;
      }
      cursor = cursor.filter((it) => !picked.includes(it));
      return picked;
    };
    const push = (layoutId, picked, hl) => {
      const v = alias(layoutId);
      if (v === last) run++; else { last = v; run = 1; }
      collageRun = layoutId === 'collage' ? collageRun + 1 : 0;
      steps.push({ variant: v, take: picked.length, ...(hl ? { hl: true } : {}) });
      for (const it of picked) order.push(it._i);
    };

    while (cursor.length) {
      const left = cursor.length;
      const remaining = maxContent - steps.length;
      const head = cursor[0];
      const headRole = roles[head._i];

      /* Highlight 미디어 — 단독 hero 씬 우선 배치 (§19 중요) */
      if (headRole === 'highlight' && hlUsed < maxHl) {
        const lay = pool.has('hero') ? 'hero' : 'framed-center';
        push(lay, takeMatching(1), true); hlUsed++;
        continue;
      }

      /* take 결정 — 남은 예산으로 전량 소화가 최우선 (§16·§18) */
      let take = 1;
      if (remaining <= 1 && left > 1) {
        take = allowCollage ? Math.min(3, left) : allowPair ? Math.min(2, left) : 1;
      } else {
        const need = Math.ceil(left / Math.max(1, remaining));
        take = Math.min(3, Math.max(1, need));
        if (take === 1 && allowPair && left >= 3 && steps.length % 3 === 2) take = 2;
        if (take === 1 && allowCollage && left >= 4 && steps.length % 6 === 5) take = 3;
        if (take === 2 && allowCollage && left >= 4 && steps.length % 3 === 2) take = 3; /* 2·2·3 순환 리듬 */
      }
      if (take === 3 && (!allowCollage || collageRun >= 1)) take = allowPair && left >= 2 ? 2 : 1; /* 콜라주 연속 제한 (§20) */
      if (take === 2 && !allowPair) take = 1;
      if (take > left) take = left;

      if (take === 3) { const p3 = takeMatching(3); push('collage', p3); continue; }
      if (take === 2) { const p2 = takeMatching(2); push(pairLayout(ratio, p2[0].orient, p2[1].orient), p2); continue; }

      /* 단일 — 방향 선호 × pool 교집합 × 캡션 승격/강등 × 3연속 금지 × 좌우 교차 (§15·§20) */
      const pref = (SINGLE_PREF[ratio] || SINGLE_PREF['16:9'])[head.orient] || SINGLE_PREF['16:9'].unknown;
      const hasCap = !!String((captions || [])[head._i] || '').trim();
      let cand = pref.filter((l) => pool.has(l));
      if (!cand.length) cand = ['full-media', 'framed-center'];
      const isCapLay = (l) => l === 'media-left' || l === 'media-right';
      cand = cand.filter((l) => hasCap || !isCapLay(l));
      if (hasCap && cand.some(isCapLay)) cand = [cand.find(isCapLay), ...cand.filter((l) => !isCapLay(l))];
      let lay = cand[0] || 'full-media';
      if (isCapLay(lay)) { lay = capDir % 2 ? 'media-right' : 'media-left'; capDir++; } /* 좌우 분할 방향 교차 */
      if (alias(lay) === last && run >= 2) lay = cand.find((l) => alias(l) !== last) || (lay === 'full-media' ? 'framed-center' : 'full-media');
      push(lay, takeMatching(1));
    }

    /* reserve 장 — order 끝에 부착 (ss-high 소비) */
    for (const it of seqItems.slice(n - reserve)) order.push(it._i);

    const contentScenes = steps.length + reserve;
    if (st.maxSceneCount && contentScenes + overhead > st.maxSceneCount + 2)
      warnings.push('장면 수가 권장 상한을 넘었어요 — 미디어를 줄이면 더 정돈된 영상이 돼요.');
    return { order, steps, notes, warnings, hlTail };
  }

  /* ================= 듀레이션 균형 후처리 (§21) ================= */
  /* built doc 에 대해: highlight 가산 → 총길이 상한 압축(하한·가독성 보호) → 정직 안내 */
  function balanceDurations(doc, steps, vdef, warnings, hlTail) {
    const dur = (vdef && vdef.duration) || {};
    if (hlTail) { const hs = doc.scenes.find((s) => s.role === 'highlight'); if (hs) hs.duration = R1(hs.duration + CONST.HL_BONUS); }
    const mediaScenes = doc.scenes.filter((s) => s.role === 'media');
    /* hl 스텝 가산 — 씬 순서 = 스텝 순서 (usePlan 규약) */
    let si = 0;
    for (const s of mediaScenes) {
      const step = steps[si++];
      if (step && step.hl) s.duration = R1(Math.min(s.duration + CONST.HL_BONUS, s.duration + 1.5));
    }
    const total = () => R1(doc.scenes.reduce((a, s) => a + s.duration, 0));
    const maxT = dur.maxTotal || 0;
    if (maxT && total() > maxT) {
      const shrinkable = doc.scenes.filter((s) => s.role === 'media' || s.role === 'highlight');
      const fixed = total() - shrinkable.reduce((a, s) => a + s.duration, 0);
      const want = Math.max(maxT - fixed, shrinkable.length * CONST.DUR_FLOOR);
      const cur = shrinkable.reduce((a, s) => a + s.duration, 0);
      const k = Math.max(CONST.SHRINK_FLOOR, Math.min(1, want / cur));
      for (const s of shrinkable) s.duration = R1(Math.max(CONST.DUR_FLOOR, s.duration * k));
      if (total() > maxT) warnings.push('권장 길이(' + maxT + '초)를 넘어요 — 현재 약 ' + Math.round(total()) + '초예요.');
      else warnings.push('권장 길이에 맞춰 장면 길이를 살짝 줄였어요.');
    }
    return R1(total());
  }

  /* ================= 비포애프터 정책 (§8 BA Variants) ================= */
  function applyPairPolicy(doc, vdef, warnings) {
    const dur = (vdef && vdef.duration) || {};
    const maxT = dur.maxTotal || 0;
    const total = () => R1(doc.scenes.reduce((a, s) => a + s.duration, 0));
    if (!maxT || total() <= maxT) return R1(total());
    /* Extended Comparison — Pair 씬 길이 축소·전체 제한·인트로/결과 유지 (§8) */
    const pairScenes = doc.scenes.filter((s) => ['media', 'transform', 'comparison'].includes(s.role));
    const fixed = total() - pairScenes.reduce((a, s) => a + s.duration, 0);
    const want = Math.max(maxT - fixed, pairScenes.length * CONST.DUR_FLOOR);
    const cur = pairScenes.reduce((a, s) => a + s.duration, 0);
    const k = Math.max(CONST.SHRINK_FLOOR, Math.min(1, want / cur));
    for (const s of pairScenes) s.duration = R1(Math.max(CONST.DUR_FLOOR, s.duration * k));
    if (total() > maxT) warnings.push('비교 쌍이 많아 권장 길이(' + maxT + '초)를 넘어요 — 현재 약 ' + Math.round(total()) + '초예요.');
    else warnings.push('비교 쌍이 많아 장면 길이를 줄여 권장 길이에 맞췄어요.');
    return R1(total());
  }

  /* ================= buildSmart — 통합 진입점 (§26 사용자 흐름 1~12) ================= */
  /* MK_MANIFEST.build 위임 + 역할 전처리 + Variant 선택 + 배치 주입 + 길이 균형.
     반환에 smart:{variant, reason, stats, roles} 를 실어 저장·재진입(§28 T14) 근거를 남긴다. */
  function buildSmart(templateId, input, opt) {
    const t = M().getTemplate(templateId);
    if (!t) return { ok: false, why: 'no-template', guide: '등록되지 않은 템플릿이에요: ' + templateId };
    const comp = C().getComposition(t._compId);
    if (!comp) return { ok: false, why: 'no-composition' };
    const inp = clone(input || {});
    const ratio = C().RATIOS[inp.ratio] ? inp.ratio : (comp.defaultRatio || '16:9');
    const stats = mediaStats(inp);
    const sel = selectVariant(templateId, stats, { ...(opt || {}), ratio, variant: (opt && opt.variant) || inp.variantId });
    const warnings = [];

    /* ---- Pair 모드(비포애프터) — 쌍 구조는 엔진 planPairs 그대로, 길이 정책만 ---- */
    if (comp.pairMode) {
      const r = M().build(templateId, inp, { theme: opt && opt.theme });
      if (!r.ok) return r;
      const totalAfter = applyPairPolicy(r.doc, sel.def, warnings);
      r.doc.meta = { ...(r.doc.meta || {}), svar: { templateId, variant: sel.id } };
      return { ...r, total: totalAfter, warnings: [...(r.warnings || []), ...warnings],
        smart: { variant: sel.id, reason: sel.reason, stats: statsSummary(stats) } };
    }

    /* ---- 역할 전처리 (§19) — 제외는 빌드 입력에서만 빠지고 원본은 무손상 ---- */
    const roles = normRoles(inp.mediaRoles, stats.count);
    const excluded = Object.entries(roles).filter(([, v]) => v === 'exclude').map(([k]) => +k);
    const keptItems = stats.items.filter((it) => roles[it._i] !== 'exclude');
    if (!keptItems.length) return { ok: false, why: 'no-media', guide: '전부 제외됐어요 — 사용할 사진을 한 장 이상 남겨 주세요.' };
    if (excluded.length) warnings.push('제외 ' + excluded.length + '장은 이번 구성에서 빠졌어요 (원본 목록엔 그대로 있어요).');

    /* ---- Auto Balance — 순서 + 배치 계획 ---- */
    const bal = balancePlan(keptItems, sel.def, ratio, inp.mediaCaptions || [], roles);
    warnings.push(...bal.warnings);
    const medias2 = bal.order.map((i) => inp.medias[i]);
    const caps2 = bal.order.map((i) => (inp.mediaCaptions || [])[i] || '');
    const planned = bal.steps;
    const planFn = () => clone(planned); /* (r,ratio,caps,start) 무시 — 전량 사전 계산 (결정론) */

    const inp2 = { ...inp, medias: medias2, mediaCaptions: caps2, _planOverride: planned.length ? planFn : undefined };
    const r = M().build(templateId, inp2, { theme: opt && opt.theme });
    if (!r.ok) return r;

    /* ---- 검증 (§17 빈 슬롯 · §16 누락) ---- */
    const placed = r.doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
    if (placed < keptItems.length) return { ok: false, why: 'media-dropped', guide: '내부 오류 — 미디어 ' + (keptItems.length - placed) + '장이 배치되지 않았어요.' };
    for (const s of r.doc.scenes) for (const e of s.elements)
      if (e.kind === 'image' && !e.src && !e.fill) return { ok: false, why: 'empty-slot', guide: '내부 오류 — 빈 미디어 슬롯이 남았어요: ' + s.id };

    /* ---- 길이 균형 (§21) ---- */
    const totalAfter = balanceDurations(r.doc, planned, sel.def, warnings, bal.hlTail);
    r.doc.meta = { ...(r.doc.meta || {}), svar: { templateId, variant: sel.id, order: bal.order, roles } };
    return { ...r, total: totalAfter, warnings: [...(r.warnings || []), ...warnings],
      smart: { variant: sel.id, reason: sel.reason, stats: statsSummary(stats),
        plan: planned.map((s) => s.variant + 'x' + s.take + (s.hl ? '*' : '')), excluded } };
  }

  const statsSummary = (s) => ({ count: s.count, kind: s.kind, orientation: s.orientation,
    portrait: s.orient.portrait, landscape: s.orient.landscape, square: s.orient.square,
    videos: s.videos, captions: s.captionCount, pairs: s.pairCount });

  /* ================= 감사 — 결정론·전량 사용·Variant 경계 ================= */
  function audit() {
    const violations = [];
    const mk = (k, w, h) => ({ name: 'p' + k, kind: 'image', src: 'data:image/png;base64,' + k, w, h });
    const land = (c) => Array.from({ length: c }, (_, i) => mk(i, 800, 600));
    for (const [n, expect] of [[3, 'compact'], [8, 'standard'], [16, 'extended'], [25, 'large']]) {
      const inp = { medias: land(n), texts: { title: '감사' } };
      const a = buildSmart('tm-slideshow', inp);
      const b = buildSmart('tm-slideshow', clone(inp));
      if (!a.ok) { violations.push('ss:' + n + ':build-fail:' + a.why); continue; }
      if (a.smart.variant !== expect) violations.push('ss:' + n + ':variant:' + a.smart.variant);
      if (JSON.stringify(a.doc) !== JSON.stringify(b.doc)) violations.push('ss:' + n + ':nondeterministic');
      const placed = a.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
      if (placed !== n) violations.push('ss:' + n + ':placed:' + placed);
    }
    return { ok: !violations.length, templates: Object.keys(VARS).length, violations };
  }

  seedDefaults();

  return { CONST, mediaStats, defineVariants, listVariants, getVariant,
    matchConditions, selectVariant, balancePlan, buildSmart, audit,
    _internals: { SINGLE_PREF, pairLayout, normRoles } };
})();
