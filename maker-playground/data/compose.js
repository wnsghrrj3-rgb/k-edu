/* ============================================================
   MK_COMPOSE (R50) — 비디오 템플릿 엔진 코어
   ------------------------------------------------------------
   비디오 템플릿 = Composition(영상 구조) × Theme(시각 디자인).
   미디어 수·텍스트 길이·비율에 따라 씬을 자동 구성한다.
   · 순수 함수 — buildProject(입력) → 기존 doc 스키마 (add-only 호환:
     MK_TPL.load·MK_PLAY·MK_VIDEO·MK_CAPTION·에디터가 그대로 먹는다)
   · 결정론 — 같은 입력 = 같은 doc (기계검증 가능)
   · 가짜 성공 0 — 미디어 0장 = 빈 doc이 아니라 명시적 안내 반환
   ============================================================ */
window.MK_COMPOSE = (() => {
  'use strict';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R1 = (v) => Math.round(v * 10) / 10;

  /* ================= 비율 ================= */
  const RATIOS = {
    '16:9': { w: 1280, h: 720 }, '9:16': { w: 1080, h: 1920 },
    '1:1': { w: 1080, h: 1080 }, '4:5': { w: 1080, h: 1350 },
  };

  /* ================= 안전영역 (R54) =================
     9:16 세로(쇼츠)에서 플랫폼 UI(상단 상태·하단 자막/버튼)에 텍스트가
     가리지 않도록 텍스트 요소만 안전영역 안으로 클램프한다.
     이미지·영상은 풀블리드 유지(배경은 가려져도 된다). */
  const SAFE = { '9:16': { x: 6, y: 12, w: 88, h: 74 } }; /* x 6~94 · y 12~86 (%) */
  function applySafeZone(scenes, ratio) {
    const z = SAFE[ratio];
    if (!z) return scenes; /* 안전영역 미정의 비율은 무변 통과 — 정직 */
    for (const sc of scenes) {
      for (const el of (sc.elements || [])) {
        if (el.kind !== 'text') continue;
        if (el.w > z.w) el.w = z.w;
        if (el.x < z.x) el.x = z.x;
        if (el.x + el.w > z.x + z.w) el.x = z.x + z.w - el.w;
        if (el.y < z.y) el.y = z.y;
        if (el.y > z.y + z.h) el.y = z.y + z.h;
      }
    }
    return scenes;
  }

  /* ================= 레지스트리 ================= */
  const COMPS = [];   /* Composition — 영상 구조 */
  const THEMES = [];  /* Theme — 시각 디자인 */
  const registerComposition = (c) => { if (!c || !c.id || COMPS.some((x) => x.id === c.id)) return null; COMPS.push(c); return c; };
  const unregisterComposition = (id) => { const i = COMPS.findIndex((c) => c.id === id); if (i < 0) return false; COMPS.splice(i, 1); return true; }; /* R64 Builder 재게시 */
  const registerTheme = (t) => { if (!t || !t.id || THEMES.some((x) => x.id === t.id)) return null; THEMES.push(t); return t; };
  const getComposition = (id) => COMPS.find((c) => c.id === id) || null;
  const getTheme = (id) => THEMES.find((t) => t.id === id) || null;

  /* ================= 미디어 분석 ================= */
  /* medias: [{name, kind:'image'|'video', src, w?, h?, duration?}] */
  function analyzeMedia(medias) {
    const list = Array.isArray(medias) ? medias.filter((m) => m && m.src) : [];
    return {
      count: list.length,
      items: list.map((m, i) => {
        const w = +m.w || 0, h = +m.h || 0;
        const orient = w && h ? (w / h > 1.15 ? 'landscape' : h / w > 1.15 ? 'portrait' : 'square') : 'unknown';
        return { name: m.name || '', kind: m.kind === 'video' ? 'video' : 'image', src: m.src, orient, _i: i,
          ...(m._oi != null ? { _oi: m._oi } : {}), /* R66 — 원본 인덱스 통과 */
          ...(m.duration ? { duration: +m.duration } : {}) };
      }),
    };
  }

  /* ================= 텍스트 fit ================= */
  /* 한글 1 · 영숫자 0.55 · 공백 0.4 가중 길이 → 글자 크기 축소 → 분할 */
  const textLen = (s) => [...String(s || '')].reduce((a, ch) =>
    a + (/[가-힣]/.test(ch) ? 1 : /\s/.test(ch) ? 0.4 : 0.55), 0);
  function fitText(text, slot) {
    const maxCh = slot.maxCh || 20, maxLines = slot.maxLines || 2, minScale = 0.6;
    const L = textLen(text);
    const cap = maxCh * maxLines;
    if (L <= cap) return { text, scale: 1, rest: null };
    const scaled = cap / L;
    if (scaled >= minScale) return { text, scale: R1(Math.max(scaled, minScale) * 100) / 100, rest: null };
    /* 분할 — 공백·문장부호 경계 우선 */
    const hardCap = Math.floor(cap / minScale * 1.1);
    const str = String(text);
    let cut = 0, acc = 0, lastBreak = -1;
    for (let i = 0; i < str.length; i++) {
      acc += /[가-힣]/.test(str[i]) ? 1 : /\s/.test(str[i]) ? 0.4 : 0.55;
      if (/[\s.,!?·]/.test(str[i])) lastBreak = i;
      if (acc >= hardCap) { cut = lastBreak > hardCap * 0.4 ? lastBreak + 1 : i + 1; break; }
    }
    if (!cut) cut = str.length;
    return { text: str.slice(0, cut).trim(), scale: minScale, rest: str.slice(cut).trim() || null };
  }

  /* ================= R60 — 전후 비교 Pair 플래너 ================= */
  /* 지시서 §9 — Before/After는 평면 배열 순서 추론이 아니라 쌍 단위로 관리.
     비교 방식은 비율별 실작동분만 (slider-reveal = 영상 비대화형이라 정직 미지원 — wipe가 그 역할) */
  const METHODS_BY_RATIO = {
    '16:9': ['side-by-side', 'wipe-horizontal', 'sequential', 'fade-between'],
    '9:16': ['top-bottom', 'wipe-vertical', 'sequential', 'fade-between'],
    '1:1':  ['side-by-side', 'fade-between', 'sequential', 'wipe-horizontal'],
    '4:5':  ['top-bottom', 'wipe-vertical', 'sequential', 'fade-between'],
  };
  const METHOD_NAMES = { 'side-by-side': '좌우 비교', 'top-bottom': '상하 비교', 'sequential': '차례로',
    'wipe-horizontal': '가로 닦아내기', 'wipe-vertical': '세로 닦아내기', 'fade-between': '서서히 겹침' };
  const normPairMedia = (m) => (!m || !m.src) ? null
    : { name: m.name || '', kind: m.kind === 'video' ? 'video' : 'image', src: m.src, orient: 'unknown',
        ...(m._oi != null ? { _oi: m._oi } : {}), /* R67 — 쌍 미디어도 원본 인덱스 통과(문서만으로 쌍 복원) */
        ...(m.duration ? { duration: +m.duration } : {}) };

  function planPairs(comp, input) {
    const notes = [], warnings = [];
    const ratio = RATIOS[input.ratio] ? input.ratio : (comp.defaultRatio || '16:9');
    /* ① Pair 입력 — 없으면 평면 미디어를 순서대로 2장씩 묶되 정직하게 알린다 */
    let pairs;
    if (Array.isArray(input.pairs) && input.pairs.length) {
      pairs = input.pairs.map((p) => ({ before: normPairMedia(p.before), after: normPairMedia(p.after),
        title: String(p.title || '').trim(), resultText: String(p.resultText || p.result || '').trim() }));
    } else {
      const media = analyzeMedia(input.medias);
      if (!media.count) return { ok: false, why: 'no-media', guide: '전·후 사진을 먼저 골라 주세요 — 쌍을 지어 비교 영상이 만들어져요.', notes };
      pairs = [];
      for (let i = 0; i < media.count; i += 2) pairs.push({ before: media.items[i], after: media.items[i + 1] || null, title: '', resultText: '' });
      notes.push('업로드 순서대로 전·후 쌍을 묶었어요 — 만들기 화면에서 쌍을 직접 지정할 수 있어요');
    }
    pairs = pairs.filter((p) => p.before || p.after);
    if (!pairs.length) return { ok: false, why: 'no-media', guide: '전·후 사진을 먼저 골라 주세요.', notes };
    /* ② 비교 방식 — 비율별 지원 목록 검증 (억지 적용 금지 — 지시서 §9-5) */
    const allow = METHODS_BY_RATIO[ratio] || METHODS_BY_RATIO['16:9'];
    const method = input.method && allow.includes(input.method) ? input.method : allow[0];
    if (input.method && method !== input.method)
      notes.push('「' + (METHOD_NAMES[input.method] || input.method) + '」는 ' + ratio + '에서 지원하지 않아 「' + METHOD_NAMES[method] + '」로 만들었어요');
    /* ③ 씬 묶음 조립 */
    const specOf = (id) => comp.scenes.find((s) => s.id === id) || null;
    const plan = [];
    const push = (id, medias, item, vi, slotAnims) => {
      const sp = specOf(id); if (!sp) return;
      plan.push({ spec: sp, variantIdx: vi || 0, medias, item: item || null, totalItems: pairs.length, ...(slotAnims ? { slotAnims } : {}) });
    };
    const texts = input.texts || {};
    if (specOf('ba-intro') && String(texts.title || '').trim()) push('ba-intro', [], null, 0);
    else if (specOf('ba-intro')) notes.push('생략: ba-intro (title 없음)');
    const splitId = /vertical|top-bottom/.test(method) || (method !== 'side-by-side' && /^(9:16|4:5)$/.test(ratio)) ? 'ba-split-v' : 'ba-split-h';
    const A_REVEAL = {
      'wipe-horizontal': { preset: 'wipe', direction: 'right', delay: 0.5, duration: 1.6, ease: 'ease-in-out', repeat: 1 },
      'wipe-vertical':   { preset: 'wipe', direction: 'down',  delay: 0.5, duration: 1.6, ease: 'ease-in-out', repeat: 1 },
      'fade-between':    { preset: 'fade', delay: 0.5, duration: 1.8, ease: 'ease-in-out', repeat: 1 },
    };
    const A_BASE = { preset: 'fade', delay: 0, duration: 0.05, ease: 'linear', repeat: 1 };
    pairs.forEach((pr, pi) => {
      if (!pr.before || !pr.after) {
        /* 미디어 누락 — 완성 비교로 위장하지 않는다 (지시서 §9-4) */
        const side = pr.before ? '전' : '후', missing = pr.before ? '후' : '전';
        warnings.push('쌍 ' + (pi + 1) + ': ' + missing + ' 사진이 없어요 — 추가하면 비교 장면이 완성돼요');
        push('ba-solo', [pr.before || pr.after], { label: side, pairTitle: pr.title, incomplete: '(' + missing + ' 없음)' }, pi * 4);
        return;
      }
      push('ba-solo', [pr.before], { label: '전', pairTitle: pr.title }, pi * 4);
      if (method === 'sequential' || method === 'side-by-side' || method === 'top-bottom') {
        push('ba-solo', [pr.after], { label: '후' }, pi * 4 + 1);
      } else {
        push('ba-transform', [pr.before, pr.after], { label: '후' }, pi * 4 + 1, [A_BASE, A_REVEAL[method]]);
      }
      if (method !== 'sequential' && method !== 'fade-between')
        push(splitId, [pr.before, pr.after], { pairResult: pr.resultText }, pi * 4 + 2);
    });
    if (specOf('ba-result') && String(texts.result || '').trim()) push('ba-result', [], null, 0);
    if (specOf('ba-outro')) push('ba-outro', [], null, 0);
    if (!plan.some((p) => p.medias.length)) return { ok: false, why: 'no-media', guide: '전·후 사진을 먼저 골라 주세요.', notes };
    return { ok: true, plan, media: { count: pairs.length * 2 }, notes, warnings, unusedMedia: 0, method };
  }

  /* ================= 씬 계획(automationRules 실행기) ================= */
  /* 지시서 §6·§7 — 필수/반복/선택 씬 · 복제·생략·분할 · 부족/과다 우선순위 */
  function planScenes(comp, input) {
    if (comp.pairMode) return planPairs(comp, input); /* R60 — 전후 비교는 쌍 단위 */
    const media = analyzeMedia(input.medias);
    const n = media.count;
    const texts = input.texts || {};
    const notes = [];
    if (n === 0 && comp.needsMedia !== false) {
      return { ok: false, why: 'no-media', guide: '사진이나 영상을 먼저 골라 주세요 — 고르는 수만큼 장면이 자동으로 만들어져요.', notes };
    }
    const plan = [];
    let mi = 0; /* 미디어 커서 */
    const items = input.items || null; /* 반복 데이터(리스트·QA·카드 등) — 없으면 미디어 기반 */

    for (const spec of comp.scenes) {
      /* ① 선택 씬 생략 — 콘텐츠 없으면 */
      if (!spec.required && spec.needs) {
        const has = spec.needs === 'media' ? mi < n
          : spec.needs === 'items' ? !!(items && items.length)
          : !!(texts[spec.needs] != null && String(texts[spec.needs]).trim());
        if (!has) { notes.push('생략: ' + spec.id + ' (' + spec.needs + ' 없음)'); continue; }
      }
      /* ② 반복 씬 복제 */
      if (spec.repeatable) {
        /* R60 — 구조가 자체 배치 계획을 갖는 경우 (variant 8종·미디어 수별 규칙) */
        if (spec.usePlan && (typeof comp.mediaPlan === 'function' || typeof input._planOverride === 'function')) {
          const reserve = comp.reserveTail || 0;
          const r = Math.max(spec.required ? Math.min(1, n - mi) : 0, Math.min(n - mi - reserve, n - mi));
          const ratio2 = RATIOS[input.ratio] ? input.ratio : (comp.defaultRatio || '16:9');
          /* R65 — MK_SVAR Auto Balance 가 사전 계산한 배치를 주입 (없으면 기존 경로 그대로) */
          const planFn2 = typeof input._planOverride === 'function' ? input._planOverride : comp.mediaPlan;
          const seq2 = planFn2(r, ratio2, input.mediaCaptions || [], mi) || [];
          let idx2 = 0;
          for (const step of seq2) {
            if (mi >= n) break;
            const take = Math.max(1, Math.min(step.take || 1, n - mi));
            const slice = media.items.slice(mi, mi + take); mi += slice.length;
            plan.push({ spec, variantIdx: idx2++, medias: slice, item: null, totalItems: 0, variant: step.variant });
          }
          continue;
        }
        const source = spec.consumes === 'items' && items ? items : null;
        const total = source ? source.length : Math.max(0, n - mi - (comp.reserveTail || 0));
        const per = spec.mediaPerScene || 1;
        /* 과다 대응 — multiThreshold 이상이면 분할 레이아웃 variant 사용 */
        const useMulti = !source && spec.multiSlots && spec.multiThreshold && total >= spec.multiThreshold;
        const normM = (m) => ({ name: m.name || '', kind: m.kind === 'video' ? 'video' : 'image', src: m.src, orient: 'unknown', ...(m.duration ? { duration: +m.duration } : {}) });
        let idx = 0;
        while (source ? idx < total : mi < n - (comp.reserveTail || 0) || (idx === 0 && spec.required)) {
          let slice;
          if (source) {
            const it = source[idx];
            if (it && it.media && it.media.src) slice = [normM(it.media)];
            else if ((spec.mediaSlots || []).length && mi < n) slice = [media.items[mi++]];
            else slice = []; /* 미디어 없는 항목 = 그래픽 중심 (지시서 §5-2) */
          } else {
            const take = useMulti && (idx % 3 === 2) ? Math.min(spec.multiSlots || 2, n - mi) : per;
            slice = media.items.slice(mi, mi + Math.max(1, take));
            if (!slice.length) break;
            mi += slice.length;
          }
          plan.push({ spec, variantIdx: idx, medias: slice, item: source ? source[idx] : null, totalItems: source ? total : 0 });
          idx++;
          if (idx > 200) break; /* 안전핀 */
        }
        continue;
      }
      /* ③ 단일 씬 — 미디어 슬롯 요구 시 소비 */
      const capSlots = (spec.mediaSlots || []).length;
      const need = (spec.mediaSlots || []).filter((s) => s.required !== false).length;
      const slice = capSlots ? media.items.slice(mi, mi + capSlots) : [];
      if (need && slice.length < need && spec.required) {
        /* 부족 우선순위: 다슬롯→단일 축소 (지시서 §7) */
        if (slice.length > 0) { notes.push('축소: ' + spec.id + ' 슬롯 ' + need + '→' + slice.length); }
        else if (spec.fallback === 'graphic') { notes.push('대체: ' + spec.id + ' 그래픽 중심'); plan.push({ spec, variantIdx: 0, medias: [], item: null }); continue; }
        else { notes.push('생략: ' + spec.id + ' (미디어 부족)'); continue; }
      }
      if (need && !slice.length && !spec.required) { notes.push('생략: ' + spec.id + ' (미디어 부족)'); continue; }
      plan.push({ spec, variantIdx: 0, medias: slice, item: null });
      mi += slice.length;
    }
    /* 잔여 미디어 → 마지막 반복 스펙에 흡수 (버리지 않는다 — 지시서 §7) */
    if (mi < n) {
      const rep = [...comp.scenes].reverse().find((s) => s.repeatable && s.consumes !== 'items')
        || [...comp.scenes].reverse().find((s) => s.repeatable && (s.mediaSlots || []).length);
      if (rep) {
        const absorbed = n - mi;
        let idx = plan.filter((p2) => p2.spec === rep).length;
        let at = -1; plan.forEach((p2, i2) => { if (p2.spec === rep) at = i2; });
        const extra = [];
        while (mi < n) { extra.push({ spec: rep, variantIdx: idx++, medias: [media.items[mi++]], item: null, totalItems: 0 }); }
        plan.splice(at + 1, 0, ...extra); /* 같은 흐름 자리에 삽입 — 구조 순서 유지 */
        notes.push('잔여 미디어 ' + absorbed + '건 흡수');
      } else { notes.push('초과: 미디어 ' + (n - mi) + '장은 이 구조에 자리가 없어 사용되지 않아요 — 편집 화면에서 직접 추가할 수 있어요'); }
    }
    const used = plan.reduce((a, p2) => a + p2.medias.length, 0);
    return { ok: true, plan, media, notes, unusedMedia: Math.max(0, n - used) };
  }

  /* ================= 씬 duration ================= */
  function sceneDuration(spec, built) {
    const d = spec.duration || { default: 3, min: 2, max: 5, mode: 'fixed' };
    if (d.mode === 'media-aware') {
      const v = (built.medias || []).find((m) => m.kind === 'video' && m.duration);
      if (v) return clamp(Math.round(v.duration * 10) / 10, d.min, d.max);
    }
    if (d.mode === 'content-aware') {
      const tl = (built.textsUsed || []).reduce((a, t2) => a + textLen(t2), 0);
      return clamp(R1(d.default + tl / 22), d.min, d.max);
    }
    /* R60 — 다중 미디어 씬은 볼 시간을 더 준다 (§11: 2장 3~5s · 3장 3.5~5.5s) */
    const mc = (built.medias || []).length;
    if (mc >= 2 && d.mode === 'media-aware') return clamp(R1(d.default + (mc >= 3 ? 1 : 0.5)), d.min, (d.max || 5) + (mc >= 3 ? 1.5 : 1));
    return d.default;
  }

  /* ================= variant 변형 (지시서 §6 복제 시 주의) ================= */
  const mirrorX = (f) => ({ ...f, x: R1(100 - f.x - f.w) });
  function applyVariant(frames, spec, variantIdx) {
    const vs = spec.variants || ['base'];
    const v = vs[variantIdx % vs.length];
    if (v === 'mirror') return frames.map((f) => ({ ...f, frame: mirrorX(f.frame) }));
    return frames;
  }
  const ALT_DIR = ['up', 'left', 'right', 'down']; /* 애니 방향 교차 */

  /* ================= R52 — Ken Burns idle 8종 ================= */
  /* 과도 확대 금지: scale 최대 1.1 · pan 이동은 scale 여유 안(빈 가장자리 0) */
  const KENBURNS = [
    { id: 'kb-zoom-in',  scale: [1, 1.08],    dx: [0, 0],    dy: [0, 0] },
    { id: 'kb-zoom-out', scale: [1.08, 1],    dx: [0, 0],    dy: [0, 0] },
    { id: 'kb-pan-left', scale: [1.06, 1.06], dx: [12, -12], dy: [0, 0] },
    { id: 'kb-pan-right',scale: [1.06, 1.06], dx: [-12, 12], dy: [0, 0] },
    { id: 'kb-pan-up',   scale: [1.06, 1.06], dx: [0, 0],    dy: [12, -12] },
    { id: 'kb-pan-down', scale: [1.06, 1.06], dx: [0, 0],    dy: [-12, 12] },
    { id: 'kb-diagonal', scale: [1.04, 1.1],  dx: [-8, 8],   dy: [-8, 8] },
    { id: 'kb-static',   scale: [1, 1],       dx: [0, 0],    dy: [0, 0] },
  ];
  const KB_SMALL = ['kb-zoom-in', 'kb-zoom-out', 'kb-static']; /* 작은 슬롯 = 이동 없는 것만 */
  const kbSpec = (id) => KENBURNS.find((k) => k.id === id) || null;
  /* 진행률 p(0~1) → {scale, dx, dy}(px@720) — play·video 공용 수치 정의 */
  function kbState(id, p) {
    const k = kbSpec(id);
    if (!k) return { scale: 1, dx: 0, dy: 0 };
    const q = Math.max(0, Math.min(1, p)), L = (a) => a[0] + (a[1] - a[0]) * q;
    return { scale: L(k.scale), dx: L(k.dx), dy: L(k.dy) };
  }
  /* 씬 배열 후처리 — 미디어(이미지)에 KB 배정. 인접 씬 같은 종류 반복 금지 · 영상 제외 · 끄기 가능 */
  function assignKenburns(scenes, on) {
    if (on === false) return scenes;
    const ROT = ['kb-zoom-in', 'kb-pan-left', 'kb-zoom-out', 'kb-pan-right', 'kb-diagonal', 'kb-pan-up', 'kb-pan-down'];
    const ROT_S = ['kb-zoom-in', 'kb-zoom-out']; /* 작은 슬롯 씬 = 이동 없는 것만(빈 가장자리 0) */
    let cursor = 0, prev = null;
    scenes.forEach((sc) => {
      if (sc.role === 'transform') { prev = null; return; } /* R60 — 리빌 연출 씬은 KB 제외 */
      const imgs = (sc.elements || []).filter((e) => e.kind === 'image' && e.src && !e.video);
      if (!imgs.length) { prev = null; return; }
      const small = imgs.some((el) => !((el.w || 0) >= 60 && (el.h || 0) >= 60));
      const pool = small ? ROT_S : ROT;
      let pick = pool[cursor % pool.length];
      if (pick === prev) pick = pool[(cursor + 1) % pool.length]; /* 인접 반복 금지 — 실배정 기준 */
      cursor++;
      imgs.forEach((el) => { el.anim = { ...(el.anim || {}), idle: pick, idleDur: sc.duration }; });
      prev = pick;
    });
    return scenes;
  }
  /* 전환 변형 — 인접 씬 동일 전환 교체(테마 전환이 1종뿐이면 정직하게 그대로) */
  function varyTransitions(scenes, theme) {
    const list = (theme.transitions || []).filter((t, i, a) => a.indexOf(t) === i);
    if (list.length < 2) return scenes;
    for (let i = 1; i < scenes.length; i++) {
      if (scenes[i].transition === scenes[i - 1].transition) {
        const alt = list.find((t) => t !== scenes[i - 1].transition);
        if (alt) scenes[i].transition = alt;
      }
    }
    return scenes;
  }

  /* ================= 씬 빌드 → 기존 doc 씬 스키마 ================= */
  function buildScene(p, theme, comp, ratio, seq) {
    const spec = p.spec, T2 = theme.tokens;
    const R = RATIOS[ratio] || RATIOS['16:9'];
    const layout = (spec.layoutByRatio && spec.layoutByRatio[ratio]) || null;
    const els = [];
    const textsUsed = [];
    /* R60 — 이름 있는 variant 레이아웃 (full-bleed·framed-center·캡션형·분할형…) */
    let vdef = p.variant && comp.variantDefs ? comp.variantDefs[p.variant] || null : null;
    let capText = '';
    if (vdef) {
      const gi = p.medias[0] ? p.medias[0]._i : -1;
      capText = gi >= 0 && p.captions ? String(p.captions[gi] || '').trim() : '';
      if (vdef.needsCaption && !capText) vdef = comp.variantDefs['full-bleed'] || vdef; /* 빈 캡션 박스 미노출 — 대체 */
    }
    const vfr = vdef ? (vdef.byRatio && vdef.byRatio[ratio]) || vdef.base : null;
    /* 배경 */
    const bgKey = (vdef && vdef.bg) || spec.bg;
    const bg = bgKey === 'accent' ? T2.accent : bgKey === 'dark' ? T2.dark : T2.paper;
    /* 미디어 슬롯 */
    let slots = (vfr && vfr.m && vfr.m.map((f, j) => ({ id: 'm' + (j + 1), frame: f, ...(j > 0 ? { required: false } : {}) })))
      || (layout && layout.mediaSlots) || spec.mediaSlots || [];
    /* 미디어 수 < 슬롯 수 → 있는 만큼만, 1개면 풀블리드 축소 */
    if (p.medias.length && p.medias.length < slots.filter((s) => s.required !== false).length) {
      slots = p.medias.length === 1 ? [{ id: slots[0].id, frame: spec.singleFrame || { x: 0, y: 0, w: 100, h: 100 } }] : slots.slice(0, p.medias.length);
    }
    const framed = applyVariant(slots.map((s) => ({ slot: s, frame: s.frame })), spec, p.variantIdx);
    framed.forEach((f, i) => {
      const m = p.medias[i];
      if (!m && f.slot.required !== false) return; /* 빈 프레임 노출 금지 — 지시서 §24 */
      if (!m) return;
      els.push({ kind: 'image', x: f.frame.x, y: f.frame.y, w: f.frame.w, h: f.frame.h,
        label: m.name || '사진', src: m.src, ...(m.kind === 'video' ? { video: true } : {}),
        ...(m._oi != null ? { oi: m._oi } : {}), /* R66 — 원본 미디어 인덱스 통과 (렌더러는 무시) */
        ...(f.frame.radius ? { radius: f.frame.radius } : {}),
        anim: (p.slotAnims && p.slotAnims[i]) ? { ...p.slotAnims[i] }
          : { preset: spec.mediaAnim || 'fade', delay: 0.05 + i * 0.12, duration: 0.5,
              direction: ALT_DIR[(p.variantIdx + i) % ALT_DIR.length], ease: 'ease-out', repeat: 1 } });
    });
    /* R60 — variant 캡션 (미디어별 문구 — 없으면 슬롯 자체를 그리지 않는다) */
    if (vfr && vfr.cap && capText) {
      const fit = fitText(capText, { maxCh: vfr.cap.maxCh || 18, maxLines: vfr.cap.maxLines || 2 });
      textsUsed.push(fit.text);
      const roleT = T2.type.caption || T2.type.body;
      els.push({ kind: 'text', x: vfr.cap.x, y: vfr.cap.y, w: vfr.cap.w,
        size: R1(roleT.size * fit.scale), text: fit.text, weight: roleT.weight,
        color: bgKey === 'dark' || bgKey === 'accent' ? T2.onDark : roleT.color || T2.ink,
        ...(vfr.cap.align ? { align: vfr.cap.align } : {}),
        anim: { preset: 'fade', delay: 0.4, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } });
    }
    /* 텍스트 슬롯 */
    let tslots = (layout && layout.textSlots) || spec.textSlots || [];
    tslots = applyVariant(tslots.map((s) => ({ slot: s, frame: s.frame })), spec, p.variantIdx).map((f) => ({ ...f.slot, frame: f.frame }));
    const overflowRest = [];
    tslots.forEach((s, i) => {
      const raw = s.autoNum ? String(s.autoNum === 'desc' ? (p.totalItems || 0) - p.variantIdx : p.variantIdx + 1)
        : p.item && p.item[s.bind] != null ? p.item[s.bind]
        : s.bind && p.texts && p.texts[s.bind] != null ? p.texts[s.bind]
        : s.defaultText || '';
      if (!String(raw).trim()) return; /* 빈 텍스트 노출 금지 — 내용 없으면 그 슬롯은 그리지 않는다 */
      const fit = fitText(raw, s);
      if (fit.rest) overflowRest.push({ slot: s, rest: fit.rest });
      textsUsed.push(fit.text);
      const roleT = T2.type[s.role] || T2.type.body;
      els.push({ kind: 'text', x: s.frame.x, y: s.frame.y, w: s.frame.w,
        size: R1(roleT.size * fit.scale), text: fit.text, weight: roleT.weight,
        color: bgKey === 'dark' || bgKey === 'accent' ? T2.onDark : roleT.color || T2.ink,
        ...(s.align ? { align: s.align } : {}),
        anim: { preset: 'fade', delay: 0.25 + i * 0.15, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } });
    });
    const built = { medias: p.medias, textsUsed };
    const scene = {
      id: 'cp' + seq, specId: spec.id, name: spec.name + (p.variantIdx ? ' ' + (p.variantIdx + 1) : ''),
      width: R.w, height: R.h, duration: sceneDuration(spec, built),
      background: bg, transition: theme.transitions[seq % theme.transitions.length] || 'fade',
      order: seq, role: spec.role,
      ...(comp.audio ? { music: { name: theme.musicName || comp.audio.name || '배경음', synth: comp.audio.synth || 'beat' } } : {}),
      elements: els,
    };
    return { scene, overflowRest };
  }

  /* ================= buildProject — 본체 ================= */
  /* input: {medias, texts:{title,subtitle,cta,...}, items, ratio, title} */
  function buildProject(compositionId, themeId, input) {
    const comp = getComposition(compositionId);
    const theme = getTheme(themeId) || THEMES[0];
    if (!comp) return { ok: false, why: 'no-composition' };
    if (!theme) return { ok: false, why: 'no-theme' };
    const ratio = RATIOS[input.ratio] ? input.ratio : (comp.defaultRatio || '16:9');
    const planned = planScenes(comp, input);
    if (!planned.ok) return planned;
    const scenes = [];
    let seq = 0;
    for (const p of planned.plan) {
      p.texts = input.texts || {};
      p.captions = input.mediaCaptions || null; /* R60 — 미디어별 캡션 */
      let cur = p;
      let guard = 0;
      while (cur && guard++ < 6) { /* 텍스트 overflow → 다음 씬 분리 (지시서 §8-4) */
        const r = buildScene(cur, theme, comp, ratio, seq++);
        scenes.push(r.scene);
        cur = r.overflowRest.length
          ? { ...p, variantIdx: p.variantIdx + guard, item: { ...(p.item || {}), [r.overflowRest[0].slot.bind]: r.overflowRest[0].rest }, medias: [] }
          : null;
      }
    }
    if (!scenes.length) return { ok: false, why: 'empty-plan', guide: '만들 장면이 없어요 — 내용을 추가해 주세요.' };
    assignKenburns(scenes, input.kenburns); /* R52 — 기본 켬, input.kenburns === false 로 끄기 */
    varyTransitions(scenes, theme);
    applySafeZone(scenes, ratio); /* R54 — 9:16 텍스트 안전영역 */
    const doc = {
      templateId: 'compose:' + comp.id + ':' + theme.id,
      title: (input.texts && input.texts.title) || input.title || comp.name,
      contentType: 'video', category: comp.category || '영상',
      ratio, compositionId: comp.id, themeId: theme.id,
      scenes,
    };
    const total = scenes.reduce((a, s) => a + s.duration, 0);
    return { ok: true, doc, total: R1(total), notes: planned.notes, sceneCount: scenes.length,
      unusedMedia: planned.unusedMedia || 0, warnings: planned.warnings || [], ...(planned.method ? { method: planned.method } : {}) };
  }

  /* ================= R60 — 예상치 사전 계산 (지시서 §8-1: 미디어 N → 예상 씬·길이) ================= */
  /* buildProject가 순수 함수라 그대로 드라이런한다 — UI가 만들기 전에 정직한 예상치를 보여준다 */
  function estimate(compositionId, themeId, input) {
    const r = buildProject(compositionId, themeId, input);
    return r.ok ? { ok: true, sceneCount: r.sceneCount, total: r.total, notes: r.notes, warnings: r.warnings || [] }
      : { ok: false, why: r.why, guide: r.guide, warnings: r.warnings || [] };
  }

  /* ================= 감사 — 결정론·스키마 호환·규칙 실동작 ================= */
  function audit() {
    const violations = [];
    const mk = (k) => ({ name: 'p' + k, kind: 'image', src: 'data:image/png;base64,' + k, w: k % 2 ? 800 : 600, h: k % 2 ? 600 : 800 });
    for (const comp of COMPS) {
      const theme = THEMES[0]; if (!theme) { violations.push('no-theme'); break; }
      /* 0장 = 정직 안내 */
      if (comp.needsMedia !== false) {
        const z = buildProject(comp.id, theme.id, { medias: [] });
        if (z.ok || !z.guide) violations.push(comp.id + ':zero-media-fake-success');
      }
      /* 결정론 + 미디어 수별 씬 수 단조 + 스키마 */
      let prev = 0;
      for (const n of [1, 3, 5, 10]) {
        const inp = { medias: Array.from({ length: n }, (_, i) => mk(i)), texts: { title: '제목' }, items: comp.sampleItems || null };
        const a = buildProject(comp.id, theme.id, inp);
        const b = buildProject(comp.id, theme.id, clone(inp));
        if (!a.ok) { violations.push(comp.id + ':' + n + ':build-fail:' + a.why); continue; }
        if (JSON.stringify(a.doc) !== JSON.stringify(b.doc)) violations.push(comp.id + ':' + n + ':nondeterministic');
        if (!comp.sampleItems && a.sceneCount < prev) violations.push(comp.id + ':' + n + ':scene-shrink');
        prev = a.sceneCount;
        for (const s of a.doc.scenes) {
          if (!s.id || !s.duration || !Array.isArray(s.elements)) { violations.push(comp.id + ':bad-scene'); break; }
          for (const el of s.elements) {
            if (el.kind === 'image' && !el.src && !el.fill) violations.push(comp.id + ':empty-frame');
            if (el.kind === 'text' && !String(el.text).trim() && el.required !== false) violations.push(comp.id + ':empty-text');
          }
        }
        /* R52 — KB 배정: 인접 씬 종류 중복 0 · 영상 요소 미배정 · 끄기 시 0 */
        let pv = null;
        for (const s2 of a.doc.scenes) {
          const ks = s2.elements.filter((e) => e.kind === 'image' && e.src && !e.video).map((e) => e.anim && e.anim.idle).filter((x) => x && /^kb-/.test(x));
          if (ks.length) { if (ks[0] === pv) violations.push(comp.id + ':' + n + ':kb-adjacent-repeat'); pv = ks[0]; } else pv = null;
          if (s2.elements.some((e) => e.video && e.anim && /^kb-/.test(e.anim.idle || ''))) violations.push(comp.id + ':kb-on-video');
        }
        const off = buildProject(comp.id, theme.id, { ...clone(inp), kenburns: false });
        if (off.ok && off.doc.scenes.some((s2) => s2.elements.some((e) => e.anim && /^kb-/.test(e.anim.idle || '')))) violations.push(comp.id + ':kb-off-fail');
        /* 전 미디어 배치 (버림 금지) */
        const placed = a.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
        if (placed < n) {
          const honest = a.unusedMedia === n - placed && a.notes.some((x) => /초과/.test(x));
          if (!honest) violations.push(comp.id + ':' + n + ':media-dropped:' + placed);
        }
      }
    }
    return { ok: !violations.length, compositions: COMPS.length, themes: THEMES.length, violations };
  }

  return { RATIOS, registerComposition, unregisterComposition, registerTheme, getComposition, getTheme,
    listCompositions: () => COMPS.filter((c) => !c.hidden).map((c) => ({ id: c.id, name: c.name, purpose: c.purpose, category: c.category,
      recommendedMediaCount: c.recommendedMediaCount, recommendedDuration: c.recommendedDuration,
      supportedRatios: Object.keys(RATIOS), defaultRatio: c.defaultRatio || '16:9' })),
    listThemes: () => THEMES.map((t) => ({ id: t.id, name: t.name, mood: t.mood })),
    KENBURNS, kbState, assignKenburns, varyTransitions, SAFE, applySafeZone,
    METHODS_BY_RATIO, METHOD_NAMES, estimate,
    analyzeMedia, fitText, textLen, planScenes, buildProject, audit };
})();
