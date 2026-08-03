/* ============================================================
   MK_SVARX (R66) — Randomize · 잠금 · source 추적 · 재진입
   ------------------------------------------------------------
   지시서 P1-3 후반부(§12·§22~§25·§28 T9~T14). R65 의 MK_SVAR
   (Variant 선택 + Auto Balance)를 사용자 손이 닿는 층으로 끌어올린다.

   원칙:
   · 무작위도 재현 가능 — seed 하나로 같은 구성이 다시 나온다(§22).
     "다시 눌러서 달라짐" = seed 가 바뀐 것이지 결과가 불안정한 게 아니다.
   · 사용자가 손댄 것은 자동이 덮지 않는다(§23) — source 추적 + 잠금.
     auto/variant/random 은 재구성 대상, user 는 잠금 후보이자 보호 대상.
   · 되돌리기는 항상 있다(§12) — 「다른 구성」은 실험이지 손실이 아니다.
   · 저장 = 실행 포맷 하나 — 근거(variant·seed·roles·locks·source)를
     doc.meta.svar 에 실어 재진입 때 그대로 이어간다(§28 T14).
   ============================================================ */
window.MK_SVARX = (() => {
  'use strict';
  const S = () => window.MK_SVAR;
  const M = () => window.MK_MANIFEST;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ================= source 추적 (§23) ================= */
  /* 씬마다 svar:{ source, locked, seed? } — 저장 포맷에 그대로 남는다. */
  const SOURCES = ['auto', 'variant', 'random', 'user'];
  function markSources(doc, source, seed) {
    if (!doc || !Array.isArray(doc.scenes)) return doc;
    const src = SOURCES.includes(source) ? source : 'auto';
    for (const sc of doc.scenes) {
      const prev = sc.svar || {};
      if (prev.locked || prev.source === 'user') continue; /* 보호 — 자동이 사용자 것을 덮지 않는다 */
      sc.svar = { source: src, locked: false, ...(seed ? { seed: String(seed) } : {}) };
    }
    return doc;
  }
  /* 사용자가 이 씬을 직접 고쳤다 — 이후 자동 재구성에서 보호된다 */
  function markEdited(doc, sceneId) {
    const sc = (doc.scenes || []).find((x) => x.id === sceneId);
    if (!sc) return false;
    sc.svar = { ...(sc.svar || {}), source: 'user', locked: true };
    return true;
  }
  function setLock(doc, sceneId, on) {
    const sc = (doc.scenes || []).find((x) => x.id === sceneId);
    if (!sc) return false;
    sc.svar = { ...(sc.svar || {}), source: (sc.svar || {}).source || 'auto', locked: !!on };
    return true;
  }
  const lockedScenes = (doc) => (doc && doc.scenes || []).filter((s) => s.svar && s.svar.locked);
  function lockSummary(doc) {
    const sc = (doc && doc.scenes) || [];
    const by = { auto: 0, variant: 0, random: 0, user: 0 };
    for (const s of sc) by[(s.svar && s.svar.source) || 'auto']++;
    return { total: sc.length, locked: sc.filter((s) => s.svar && s.svar.locked).length, by };
  }

  /* ================= 잠긴 씬이 쓰는 미디어 고정 (§23) ================= */
  /* 잠금 = 그 장면 통째 보존. 그 안의 사진이 다른 자리로 튀면 잠금이 아니다.
     → 재구성 입력에서 그 사진들을 빼고(핀), 완성 후 원래 자리에 씬을 도로 끼운다. */
  function srcsOf(scene) {
    return (scene.elements || []).filter((e) => e.kind === 'image' && e.src).map((e) => e.src);
  }
  function pinnedIndexes(doc, medias) {
    const want = new Set();
    for (const sc of lockedScenes(doc)) for (const s of srcsOf(sc)) want.add(s);
    const out = [];
    (medias || []).forEach((m, i) => { if (m && m.src && want.has(m.src)) out.push(i); });
    return out;
  }

  /* ================= 재구성 (§12 「다른 구성」) ================= */
  /* opt: { seed, theme, ratio, variant, prevDoc, key }
     seed 미지정 = 자동 다음 seed(이전과 다른 값 보장). key 지정 시 History 적립. */
  let seedSeq = 0;
  function nextSeed(prevSeed) {
    seedSeq++;
    const base = 'k' + (Date.now() % 1e7) + '-' + seedSeq;
    return base === String(prevSeed) ? base + 'x' : base;
  }

  function recompose(templateId, input, opt) {
    const o = opt || {};
    const prev = o.prevDoc || null;
    const seed = o.seed != null && o.seed !== '' ? String(o.seed)
      : nextSeed(prev && prev.meta && prev.meta.svar && prev.meta.svar.seed);
    const inp = clone(input || {});

    /* ---- R67 쌍 모드 — 쌍 자체는 고정, 순서·비교 방식만 다시 고른다 (§12) ---- */
    if (Array.isArray(inp.pairs) && inp.pairs.length) {
      /* 잠금은 장면 단위인데 쌍은 한 쌍이 2~3장면으로 흩어진다. 순서가 바뀌면
         잠긴 장면만 제자리에 두는 게 성립하지 않으므로 정직하게 막는다(위장 금지). */
      const held = prev ? (prev.scenes || []).filter((s) => s.svar && (s.svar.locked || s.svar.source === 'user')) : [];
      if (held.length) {
        return { ok: false, why: 'pair-locked',
          guide: '잠그거나 직접 고친 장면 ' + held.length + '개가 있어요 — 쌍 구조는 그 장면을 지키면서 순서를 바꿀 수 없어요. 잠금을 풀면 순서와 비교 방식을 다시 골라요.' };
      }
      const r = S().buildSmart(templateId, inp, { ...o, seed });
      if (!r.ok) return r;
      markSources(r.doc, 'random', seed);
      const sv = r.doc.meta.svar || {};
      sv.seed = seed; r.doc.meta.svar = sv;
      const warnings = [...(r.warnings || [])];
      if (o.key) pushHistory(o.key, r.doc, { seed, variant: r.smart && r.smart.variant });
      return { ...r, warnings, seed, pinned: [], lockedKept: 0 };
    }

    const medias = inp.medias || [];
    const pins = prev ? pinnedIndexes(prev, medias) : [];
    const locks = prev ? lockedScenes(prev) : [];

    /* 잠긴 씬이 쓰는 사진을 빼고 남은 것만 다시 배치 */
    const keepIdx = medias.map((_, i) => i).filter((i) => !pins.includes(i));
    if (!keepIdx.length) {
      return { ok: false, why: 'all-locked',
        guide: '모든 장면이 잠겨 있어요 — 잠금을 하나 이상 풀면 다른 구성을 만들 수 있어요.' };
    }
    const remap = {};
    keepIdx.forEach((orig, i) => { remap[i] = orig; });
    const inp2 = { ...inp,
      medias: keepIdx.map((i) => medias[i]),
      mediaCaptions: keepIdx.map((i) => (inp.mediaCaptions || [])[i] || ''),
      mediaRoles: (() => { /* 역할은 원본 인덱스 기준 — 축소 인덱스로 옮긴다 */
        const r = {}; keepIdx.forEach((orig, i) => { const v = (inp.mediaRoles || {})[orig]; if (v) r[i] = v; }); return r;
      })() };

    const r = S().buildSmart(templateId, inp2, { ...o, seed });
    if (!r.ok) return r;
    markSources(r.doc, 'random', seed);

    /* 잠긴 씬 원위치 복원 — 인덱스가 새 길이를 넘으면 뒤에 붙인다(손실 0) */
    if (locks.length) {
      const restored = [];
      const byIdx = new Map();
      for (const sc of locks) byIdx.set((prev.scenes || []).indexOf(sc), sc);
      const rest = r.doc.scenes.slice();
      const total = rest.length + locks.length;
      for (let i = 0; i < total; i++) {
        if (byIdx.has(i)) restored.push(clone(byIdx.get(i)));
        else if (rest.length) restored.push(rest.shift());
      }
      while (rest.length) restored.push(rest.shift());
      for (const [i, sc] of byIdx) if (i >= total) restored.push(clone(sc)); /* 안전핀 */
      r.doc.scenes = restored;
      r.doc.scenes.forEach((s, i) => { s.order = i; });
    }

    /* 근거 갱신 — order 는 원본 인덱스로 되돌려 저장(§28 T14 재진입) */
    const sv = r.doc.meta.svar || {};
    if (Array.isArray(sv.order)) sv.order = sv.order.map((i) => (remap[i] != null ? remap[i] : i));
    sv.seed = seed;
    sv.pinned = pins;
    sv.locks = locks.map((s) => s.id);
    sv.roles = (inp.mediaRoles || {});
    r.doc.meta.svar = sv;

    const warnings = [...(r.warnings || [])];
    if (pins.length) warnings.push('잠긴 장면 ' + locks.length + '개(사진 ' + pins.length + '장)는 그대로 뒀어요.');
    if (o.key) pushHistory(o.key, r.doc, { seed, variant: r.smart && r.smart.variant });
    return { ...r, warnings, seed, pinned: pins, lockedKept: locks.length };
  }

  /* ================= History — 되돌리기 (§12) ================= */
  const HIST = {};
  const MAXH = 20;
  function pushHistory(key, doc, meta) {
    if (!key) return 0;
    const h = HIST[key] || (HIST[key] = []);
    h.push({ doc: clone(doc), at: Date.now(), ...(meta || {}) });
    while (h.length > MAXH) h.shift();
    return h.length;
  }
  /* 현재를 버리고 직전 구성을 돌려준다 — 스택 끝이 '현재'라는 규약 */
  function previous(key) {
    const h = HIST[key] || [];
    if (h.length < 2) return null;
    h.pop();
    return clone(h[h.length - 1]);
  }
  const historyDepth = (key) => (HIST[key] || []).length;
  const clearHistory = (key) => { if (key) delete HIST[key]; else for (const k of Object.keys(HIST)) delete HIST[k]; };

  /* ================= 저장·재진입 (§28 T9~T14) ================= */
  /* doc.meta.svar + scene.svar 만으로 다음 구성을 그대로 이어갈 수 있어야 한다.
     별도 사이드카 저장 금지 — 저장 포맷 = 실행 포맷 하나(§19). */
  function readState(doc) {
    const sv = (doc && doc.meta && doc.meta.svar) || null;
    if (!sv) return null;
    return { templateId: sv.templateId || null, variant: sv.variant || null,
      seed: sv.seed || null, order: sv.order || null, roles: sv.roles || {},
      pinned: sv.pinned || [], locks: (doc.scenes || []).filter((s) => s.svar && s.svar.locked).map((s) => s.id),
      sources: lockSummary(doc) };
  }
  /* 재진입 검증 — 저장된 seed 로 다시 만들면 같은 구성이 나오는가 */
  function reproduce(doc, input, opt) {
    const st = readState(doc);
    if (!st || !st.templateId) return { ok: false, why: 'no-state', guide: '이 문서에는 자동 구성 근거가 없어요.' };
    return S().buildSmart(st.templateId, { ...(input || {}), mediaRoles: st.roles },
      { ...(opt || {}), seed: st.seed || undefined, variant: st.variant || undefined });
  }

  /* ================= 문서 → 재구성 입력 (§12·§28) ================= */
  /* 「다른 구성」은 문서만 열려 있는 상태에서 눌린다. 원본 사진은 이미 문서 안에
     있으므로(전량 배치 보장), 거기서 되찾고 계획 메타는 doc.meta.svar 에서 읽는다.
     사이드카 저장 없이 재진입이 성립하는 근거(§19 저장=실행 포맷 하나). */
  /* R67 — 쌍 문서 → 쌍 입력. 사진 원본은 문서 안에 있으므로(전·후 전량 배치)
     원본 인덱스(oi)로 되찾고, 쌍 묶음·제목·방식은 doc.meta.svar 에서 읽는다. */
  function pairInputFromDoc(doc, sv) {
    const byOi = new Map();
    for (const sc of (doc.scenes || [])) for (const e of (sc.elements || [])) {
      if (e.kind !== 'image' || !e.src) continue;
      if (e.oi != null && !byOi.has(e.oi)) byOi.set(e.oi, { src: e.src, video: !!e.video, label: e.label });
    }
    const meta = sv.media || [];
    const mk = (oi) => {
      const f = oi == null ? null : byOi.get(oi);
      if (!f) return null;
      const m = meta[oi] || {};
      return { name: m.n || f.label || ('사진 ' + (oi + 1)), kind: f.video ? 'video' : (m.k || 'image'),
        src: f.src, w: m.w || 800, h: m.h || 600 };
    };
    const defs = Array.isArray(sv.pairs) ? sv.pairs : [];
    if (!defs.length) return { ok: false, why: 'no-pairs', guide: '이 문서에는 쌍 근거가 없어요 — 예전 방식으로 만든 문서예요.' };
    const pairs = [], missing = [];
    defs.forEach((d, i) => {
      const b = mk(d.b), a = mk(d.a);
      if (!b && !a) { missing.push(i); return; }
      pairs.push({ before: b, after: a, title: d.t || '', resultText: d.r || '' });
    });
    if (!pairs.length) return { ok: false, why: 'no-media', guide: '문서에서 전·후 사진을 찾지 못했어요.' };
    return { ok: true, missing,
      input: { pairs, texts: clone(sv.texts || {}), ratio: sv.ratio || undefined },
      templateId: sv.templateId };
  }

  function inputFromDoc(doc) {
    const sv = (doc && doc.meta && doc.meta.svar) || null;
    if (!sv || !sv.templateId) return { ok: false, why: 'no-state', guide: '이 문서에는 자동 구성 근거가 없어요.' };
    if (sv.pairMode) return pairInputFromDoc(doc, sv);
    const meta = sv.media || [];
    const found = new Map(); /* 원본 인덱스 → {src, kind} */
    let order = 0;
    const noIdx = [];
    for (const sc of (doc.scenes || [])) {
      for (const e of (sc.elements || [])) {
        if (e.kind !== 'image' || !e.src) continue;
        if (e.oi != null && !found.has(e.oi)) found.set(e.oi, { src: e.src, video: !!e.video, label: e.label });
        else if (e.oi == null) noIdx.push({ src: e.src, video: !!e.video, label: e.label, at: order });
        order++;
      }
    }
    /* 구버전 문서 — 원본 인덱스가 없으면 배치 순서를 원본 순서로 본다(정직한 근사) */
    if (!found.size && noIdx.length) noIdx.forEach((x, i) => found.set(i, x));

    const n = Math.max(meta.length, found.size ? Math.max(...found.keys()) + 1 : 0);
    const medias = [], caps = [], missing = [];
    const roles = {}, srcRoles = sv.roles || {};
    let k = 0;
    for (let i = 0; i < n; i++) {
      const f = found.get(i);
      const m = meta[i] || {};
      if (!f) { missing.push(i); continue; } /* 제외됐던 사진은 문서에 없다 — 정직하게 빠진다 */
      medias.push({ name: m.n || f.label || ('사진 ' + (i + 1)), kind: f.video ? 'video' : (m.k || 'image'),
        src: f.src, w: m.w || 800, h: m.h || 600 });
      caps.push(m.c || '');
      const rv = srcRoles[i];
      if (rv && rv !== 'exclude') roles[k] = rv;
      k++;
    }
    if (!medias.length) return { ok: false, why: 'no-media', guide: '문서에서 사진을 찾지 못했어요.' };
    return { ok: true, missing,
      input: { medias, mediaCaptions: caps, mediaRoles: roles,
        texts: clone(sv.texts || {}), ratio: sv.ratio || undefined },
      templateId: sv.templateId };
  }

  /* 문서 하나로 「다른 구성」 — UI 가 부르는 한 점 (§12) */
  function recomposeDoc(doc, opt) {
    const f = inputFromDoc(doc);
    if (!f.ok) return f;
    const o = opt || {};
    const r = recompose(f.templateId, f.input, { ...o, prevDoc: doc,
      theme: o.theme || (doc.meta && doc.meta.theme) || undefined,
      ratio: f.input.ratio, variant: o.variant });
    if (!r.ok) return r;
    if (f.missing.length) r.warnings = [...(r.warnings || []),
      '이전에 제외한 사진 ' + f.missing.length + '장은 문서에 없어서 이번 구성에도 빠졌어요.'];
    return r;
  }

  /* ================= Variant 정의 검증 (§24 Builder 설정) ================= */
  /* Builder 가 만든 Variant 목록이 실제로 쓸 수 있는지 — 저장 전에 정직하게 막는다. */
  function validateVariants(list, opt) {
    const errors = [], warnings = [];
    const arr = Array.isArray(list) ? list : [];
    const pairMode = !!(opt && opt.pairMode);
    if (!arr.length) return { ok: true, errors, warnings: ['Variant 가 없어요 — 기본 구성 하나로만 만들어져요.'] };
    const seen = new Set();
    for (const v of arr) {
      const tag = '「' + (v.name || v.id || '이름 없음') + '」';
      if (!v.id) { errors.push({ msg: tag + ' id 가 비었어요' }); continue; }
      if (seen.has(v.id)) errors.push({ msg: tag + ' id 가 중복이에요: ' + v.id });
      seen.add(v.id);
      for (const l of (v.layoutPool || [])) if (!M().getLayout(l)) errors.push({ msg: tag + ' 없는 Layout: ' + l });
      for (const a of (v.animationPool || [])) if (!M().getAnimation(a)) errors.push({ msg: tag + ' 없는 Animation: ' + a });
      for (const t of (v.transitionPool || [])) if (!M().getTransition(t)) errors.push({ msg: tag + ' 없는 Transition: ' + t });
      if (!pairMode && !(v.layoutPool || []).length) warnings.push(tag + ' Layout 풀이 비어 기본값으로 만들어져요.');
      const c = v.conditions || {};
      if (c.mediaCountMin != null && c.mediaCountMax != null && c.mediaCountMin > c.mediaCountMax)
        errors.push({ msg: tag + ' 미디어 수 범위가 거꾸로예요' });
      const d = v.duration || {};
      if (d.maxTotal != null && d.maxTotal <= 0) errors.push({ msg: tag + ' 권장 길이는 0보다 커야 해요' });
    }
    /* 커버리지 — 1~30장 중 어떤 Variant 도 완전 일치하지 않는 구간 (구멍 = 기본 구성으로 떨어짐) */
    const key = pairMode ? 'pairCount' : 'mediaCount';
    const holes = [];
    for (let n = 1; n <= 30; n++) {
      const hit = arr.some((v) => {
        const c = v.conditions || {};
        const lo = c[key + 'Min'], hi = c[key + 'Max'];
        if (lo == null && hi == null) return false;
        return n >= (lo != null ? lo : 0) && n <= (hi != null ? hi : Infinity);
      });
      if (!hit) holes.push(n);
    }
    if (holes.length) warnings.push((pairMode ? '쌍' : '사진') + ' ' + rangeText(holes) + '장 구간엔 조건이 맞는 Variant 가 없어요 — 기본 구성으로 만들어져요.');
    return { ok: !errors.length, errors, warnings };
  }
  function rangeText(nums) {
    const out = []; let a = nums[0], b = nums[0];
    for (let i = 1; i <= nums.length; i++) {
      if (nums[i] === b + 1) { b = nums[i]; continue; }
      out.push(a === b ? String(a) : a + '~' + b); a = nums[i]; b = nums[i];
    }
    return out.join(', ');
  }

  /* ================= 미리보기 테스트 모드 (§25) ================= */
  /* 만든 사람이 "사진 3장일 때 / 30장일 때 / 세로만일 때" 를 즉시 확인한다.
     실제 buildSmart 를 돌린 결과만 표기 — 예측값·추정치 금지(정직). */
  const CASES = [
    { id: 'l1', label: '가로 1장', n: 1, orient: 'landscape' },
    { id: 'l3', label: '가로 3장', n: 3, orient: 'landscape' },
    { id: 'l5', label: '가로 5장', n: 5, orient: 'landscape' },
    { id: 'l10', label: '가로 10장', n: 10, orient: 'landscape' },
    { id: 'l20', label: '가로 20장', n: 20, orient: 'landscape' },
    { id: 'l30', label: '가로 30장', n: 30, orient: 'landscape' },
    { id: 'p8', label: '세로 8장', n: 8, orient: 'portrait' },
    { id: 'm12', label: '혼합 12장', n: 12, orient: 'mixed' },
    { id: 'c6', label: '캡션 6장', n: 6, orient: 'landscape', captions: true },
  ];
  function sampleMedias(n, orient) {
    return Array.from({ length: n }, (_, i) => {
      const port = orient === 'portrait' || (orient === 'mixed' && i % 2 === 1);
      return { name: 'p' + i, kind: 'image', src: 'data:image/png;base64,TM' + i,
        w: port ? 600 : 800, h: port ? 900 : 600 };
    });
  }
  function testMatrix(templateId, opt) {
    const o = opt || {};
    const pairMode = !!o.pairMode;
    const cases = o.cases || (pairMode
      ? [1, 2, 3, 5, 8].map((n) => ({ id: 'pr' + n, label: '쌍 ' + n + '개', pairs: n }))
      : CASES);
    const rows = [];
    for (const cs of cases) {
      const input = { texts: { title: '테스트', subtitle: '자동 구성 확인' }, ratio: o.ratio || undefined };
      if (cs.pairs) {
        input.pairs = Array.from({ length: cs.pairs }, (_, i) => ({
          before: { name: 'b' + i, kind: 'image', src: 'data:image/png;base64,B' + i, w: 800, h: 600 },
          after: { name: 'a' + i, kind: 'image', src: 'data:image/png;base64,A' + i, w: 800, h: 600 } }));
        input.medias = input.pairs.flatMap((p) => [p.before, p.after]);
      } else {
        input.medias = sampleMedias(cs.n, cs.orient);
        if (cs.captions) input.mediaCaptions = input.medias.map((_, i) => (i % 2 ? '' : '설명 ' + (i + 1)));
      }
      const r = S().buildSmart(templateId, input,
        { ...(o.seed != null ? { seed: o.seed } : {}), ...(o._draft ? { _draft: o._draft } : {}), theme: o.theme });
      if (!r.ok) { rows.push({ id: cs.id, label: cs.label, ok: false, why: r.guide || r.why || '빌드 실패' }); continue; }
      const placed = r.doc.scenes.reduce((a, s) => a + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
      rows.push({ id: cs.id, label: cs.label, ok: true,
        variant: r.smart.variant, scenes: r.doc.scenes.length,
        total: r.total != null ? r.total : Math.round(r.doc.scenes.reduce((a, s) => a + (s.duration || 0), 0)),
        placed, expected: cs.pairs ? cs.pairs * 2 : cs.n,
        plan: (r.smart.plan || []).join(' · '),
        warnings: (r.warnings || []).filter((w) => String(w).trim()) });
    }
    const problems = rows.filter((r) => !r.ok || r.placed !== r.expected);
    return { ok: !problems.length, rows, problems: problems.length };
  }

  /* ================= 감사 ================= */
  function audit() {
    const v = [];
    const med = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,X' + i, w: 800, h: 600 }));
    const inp = { medias: med(9), texts: { title: '감사' } };
    /* ① 같은 seed = 같은 결과 */
    const a = recompose('tm-slideshow', inp, { seed: 'audit-1' });
    const b = recompose('tm-slideshow', inp, { seed: 'audit-1' });
    if (!a.ok || !b.ok) v.push('recompose-fail');
    else {
      if (JSON.stringify(a.doc) !== JSON.stringify(b.doc)) v.push('seed-nondeterministic');
      /* ② 전량 배치 */
      const placed = a.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
      if (placed !== 9) v.push('placed:' + placed);
      /* ③ 다른 seed = 다른 구성(최소 하나는 달라야 '다른 구성'이 성립) */
      const c2 = recompose('tm-slideshow', inp, { seed: 'audit-2' });
      if (c2.ok && JSON.stringify(c2.doc.scenes.map((s) => s.name)) === JSON.stringify(a.doc.scenes.map((s) => s.name))
        && JSON.stringify(c2.smart.plan) === JSON.stringify(a.smart.plan)) v.push('seed-no-effect');
    }
    /* ④ 잠금 보존 */
    if (a.ok) {
      const d = clone(a.doc);
      const target = d.scenes.find((s) => s.elements.some((e) => e.kind === 'image' && e.src));
      setLock(d, target.id, true);
      const r2 = recompose('tm-slideshow', inp, { seed: 'audit-3', prevDoc: d });
      if (!r2.ok) v.push('lock-recompose-fail:' + r2.why);
      else {
        const kept = r2.doc.scenes.find((s) => s.id === target.id);
        if (!kept || JSON.stringify(kept.elements) !== JSON.stringify(target.elements)) v.push('lock-broken');
        const placed2 = r2.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.kind === 'image' && e.src).length, 0);
        if (placed2 !== 9) v.push('lock-placed:' + placed2);
      }
    }
    return { ok: !v.length, violations: v };
  }

  return { SOURCES, markSources, markEdited, setLock, lockedScenes, lockSummary,
    pinnedIndexes, recompose, recomposeDoc, inputFromDoc, pairInputFromDoc, nextSeed,
    pushHistory, previous, historyDepth, clearHistory,
    readState, reproduce, validateVariants, testMatrix, CASES, audit };
})();
