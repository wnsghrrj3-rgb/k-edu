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

  /* ================= 레지스트리 ================= */
  const COMPS = [];   /* Composition — 영상 구조 */
  const THEMES = [];  /* Theme — 시각 디자인 */
  const registerComposition = (c) => { if (!c || !c.id || COMPS.some((x) => x.id === c.id)) return null; COMPS.push(c); return c; };
  const registerTheme = (t) => { if (!t || !t.id || THEMES.some((x) => x.id === t.id)) return null; THEMES.push(t); return t; };
  const getComposition = (id) => COMPS.find((c) => c.id === id) || null;
  const getTheme = (id) => THEMES.find((t) => t.id === id) || null;

  /* ================= 미디어 분석 ================= */
  /* medias: [{name, kind:'image'|'video', src, w?, h?, duration?}] */
  function analyzeMedia(medias) {
    const list = Array.isArray(medias) ? medias.filter((m) => m && m.src) : [];
    return {
      count: list.length,
      items: list.map((m) => {
        const w = +m.w || 0, h = +m.h || 0;
        const orient = w && h ? (w / h > 1.15 ? 'landscape' : h / w > 1.15 ? 'portrait' : 'square') : 'unknown';
        return { name: m.name || '', kind: m.kind === 'video' ? 'video' : 'image', src: m.src, orient,
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

  /* ================= 씬 계획(automationRules 실행기) ================= */
  /* 지시서 §6·§7 — 필수/반복/선택 씬 · 복제·생략·분할 · 부족/과다 우선순위 */
  function planScenes(comp, input) {
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
        const has = spec.needs === 'title' ? !!(texts.title && String(texts.title).trim())
          : spec.needs === 'cta' ? !!(texts.cta && String(texts.cta).trim())
          : spec.needs === 'media' ? mi < n
          : spec.needs === 'items' ? !!(items && items.length)
          : true;
        if (!has) { notes.push('생략: ' + spec.id + ' (' + spec.needs + ' 없음)'); continue; }
      }
      /* ② 반복 씬 복제 */
      if (spec.repeatable) {
        const source = spec.consumes === 'items' && items ? items : null;
        const total = source ? source.length : Math.max(0, n - mi - (comp.reserveTail || 0));
        const per = spec.mediaPerScene || 1;
        /* 과다 대응 — multiThreshold 이상이면 분할 레이아웃 variant 사용 */
        const useMulti = !source && spec.multiSlots && spec.multiThreshold && total >= spec.multiThreshold;
        let idx = 0;
        while (source ? idx < total : mi < n - (comp.reserveTail || 0) || (idx === 0 && spec.required)) {
          const take = useMulti && (idx % 3 === 2) ? Math.min(spec.multiSlots || 2, n - mi) : per;
          const slice = source ? [source[idx]] : media.items.slice(mi, mi + Math.max(1, take));
          if (!source && !slice.length) break;
          plan.push({ spec, variantIdx: idx, medias: slice, item: source ? source[idx] : null });
          if (!source) mi += slice.length;
          idx++;
          if (idx > 200) break; /* 안전핀 */
        }
        continue;
      }
      /* ③ 단일 씬 — 미디어 슬롯 요구 시 소비 */
      const need = (spec.mediaSlots || []).filter((s) => s.required !== false).length;
      const slice = need ? media.items.slice(mi, mi + need) : [];
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
      const rep = [...comp.scenes].reverse().find((s) => s.repeatable && s.consumes !== 'items');
      if (rep) {
        let idx = plan.filter((p) => p.spec === rep).length;
        while (mi < n) { plan.push({ spec: rep, variantIdx: idx++, medias: [media.items[mi++]], item: null }); }
        notes.push('잔여 미디어 ' + (n - mi + plan.length) + '건 흡수');
      } else notes.push('경고: 잔여 미디어 ' + (n - mi) + '건 미배치');
    }
    return { ok: true, plan, media, notes };
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

  /* ================= 씬 빌드 → 기존 doc 씬 스키마 ================= */
  function buildScene(p, theme, comp, ratio, seq) {
    const spec = p.spec, T2 = theme.tokens;
    const R = RATIOS[ratio] || RATIOS['16:9'];
    const layout = (spec.layoutByRatio && spec.layoutByRatio[ratio]) || null;
    const els = [];
    const textsUsed = [];
    /* 배경 */
    const bg = spec.bg === 'accent' ? T2.accent : spec.bg === 'dark' ? T2.dark : T2.paper;
    /* 미디어 슬롯 */
    let slots = (layout && layout.mediaSlots) || spec.mediaSlots || [];
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
        ...(f.frame.radius ? { radius: f.frame.radius } : {}),
        anim: { preset: spec.mediaAnim || 'fade', delay: 0.05 + i * 0.12, duration: 0.5,
          direction: ALT_DIR[(p.variantIdx + i) % ALT_DIR.length], ease: 'ease-out', repeat: 1 } });
    });
    /* 텍스트 슬롯 */
    let tslots = (layout && layout.textSlots) || spec.textSlots || [];
    tslots = applyVariant(tslots.map((s) => ({ slot: s, frame: s.frame })), spec, p.variantIdx).map((f) => ({ ...f.slot, frame: f.frame }));
    const overflowRest = [];
    tslots.forEach((s, i) => {
      const raw = p.item && p.item[s.bind] != null ? p.item[s.bind]
        : s.bind && p.texts && p.texts[s.bind] != null ? p.texts[s.bind]
        : (s.seq && seq != null ? String(seq) : s.defaultText || '');
      if (!String(raw).trim() && s.required === false) return; /* 선택 텍스트 생략 */
      const fit = fitText(raw, s);
      if (fit.rest) overflowRest.push({ slot: s, rest: fit.rest });
      textsUsed.push(fit.text);
      const roleT = T2.type[s.role] || T2.type.body;
      els.push({ kind: 'text', x: s.frame.x, y: s.frame.y, w: s.frame.w,
        size: R1(roleT.size * fit.scale), text: fit.text, weight: roleT.weight,
        color: spec.bg === 'dark' || spec.bg === 'accent' ? T2.onDark : roleT.color || T2.ink,
        ...(s.align ? { align: s.align } : {}),
        anim: { preset: 'fade', delay: 0.25 + i * 0.15, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } });
    });
    const built = { medias: p.medias, textsUsed };
    const scene = {
      id: 'cp' + seq, name: spec.name + (p.variantIdx ? ' ' + (p.variantIdx + 1) : ''),
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
    const doc = {
      templateId: 'compose:' + comp.id + ':' + theme.id,
      title: (input.texts && input.texts.title) || input.title || comp.name,
      contentType: 'video', category: comp.category || '영상',
      ratio, compositionId: comp.id, themeId: theme.id,
      scenes,
    };
    const total = scenes.reduce((a, s) => a + s.duration, 0);
    return { ok: true, doc, total: R1(total), notes: planned.notes, sceneCount: scenes.length };
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
        /* 전 미디어 배치 (버림 금지) */
        const placed = a.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
        if (placed < n) violations.push(comp.id + ':' + n + ':media-dropped:' + placed);
      }
    }
    return { ok: !violations.length, compositions: COMPS.length, themes: THEMES.length, violations };
  }

  return { RATIOS, registerComposition, registerTheme, getComposition, getTheme,
    listCompositions: () => COMPS.map((c) => ({ id: c.id, name: c.name, purpose: c.purpose, category: c.category,
      recommendedMediaCount: c.recommendedMediaCount, recommendedDuration: c.recommendedDuration,
      supportedRatios: Object.keys(RATIOS), defaultRatio: c.defaultRatio || '16:9' })),
    listThemes: () => THEMES.map((t) => ({ id: t.id, name: t.name, mood: t.mood })),
    analyzeMedia, fitText, textLen, planScenes, buildProject, audit };
})();
