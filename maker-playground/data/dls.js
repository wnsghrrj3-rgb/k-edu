/* ============================================================
   K-MAKER Design Language System — window.MK_DLS  (Round 24)
   ------------------------------------------------------------
   기능을 추가하지 않는다 — 디자인 언어를 판정 가능한 계층으로 세운다.
   "모든 화면이 같은 원칙으로 설계된다" 를 코드가 강제한다.

   ★ 핵심 설계
     - Token(§21): Color·Spacing·Radius·Shadow·Motion·Typography 6종
       전부 단일 레지스트리 — CSS/JSON/Figma 3형 내보내기 동일 원천.
     - Color(§4): WCAG 대비 실계산. 모든 semantic 색은 text-safe(≥4.5)
       ·ui-safe(≥3.0) 변형을 **알고리즘 파생으로 보장**(수동 예외 없음).
     - Spacing(§6): 4px 그리드 위반 값은 lint 가 거부. 실 tokens.css 를
       auditCss() 가 파싱해 그리드·모션 밴드·색 형식을 검사한다.
     - Motion(§9·§10): hover150/click180/transition220/dialog250 —
       MK_FLOW 의 150~250ms 밴드와 정합(위반 등록 거부).
     - Component(§12): 10종 스펙 전부 린트 통과 필수 — 높이 4px 그리드·
       radius/motion 토큰 참조·5상태·포커스 링 의무.
     - Dark(§19): semantic 매핑으로 다크 팔레트 파생 → 대비 재검증.
   결정론 순수 계층 — 외부 의존은 MK_FLOW 브리지(키보드·모션 밴드)뿐.
   ============================================================ */
window.MK_DLS = (() => {
  'use strict';
  const FL = () => window.MK_FLOW;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ============================================================
     1) Philosophy(§1) · Principles(§2) · Visual Language(§3)
     ============================================================ */
  const PHILOSOPHY = ['Simple', 'Invisible', 'Professional', 'Warm', 'Creative', 'Confident', 'Predictable', 'Fast'];
  const PRINCIPLES = [
    { less: 'Interface', more: 'Content' },
    { less: 'Click', more: 'Flow' },
    { less: 'Noise', more: 'Focus' },
    { less: 'Decoration', more: 'Meaning' },
  ];
  const VISUAL = ['Whitespace', 'Hierarchy', 'Rhythm', 'Alignment', 'Contrast', 'Balance', 'Consistency'];

  /* ============================================================
     2) 색 수학 — WCAG 2.x 상대 휘도·대비 (§4·§18)
     ============================================================ */
  const hexRe = /^#[0-9a-fA-F]{6}$/;
  function hexRgb(hex) {
    if (!hexRe.test(hex)) return null;
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  function rgbHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  function luminance(hex) {
    const rgb = hexRgb(hex);
    if (!rgb) return null;
    const lin = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    if (la == null || lb == null) return null;
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
  }
  /* 배경 대비 목표치까지 알고리즘 다크닝 — 종결 보장(최대 40스텝) */
  function deriveSafe(hex, bg, target) {
    let [r, g, b] = hexRgb(hex);
    let out = hex, steps = 0;
    while (contrast(out, bg) < target && steps < 40) {
      r *= 0.94; g *= 0.94; b *= 0.94; steps++;
      out = rgbHex(r, g, b);
    }
    return { hex: out, steps, ok: contrast(out, bg) >= target };
  }

  /* ============================================================
     3) Color System (§4) — Primary·Secondary·Neutral·Semantic·Surface
     ============================================================ */
  const BG = '#FFFFFF';
  const RAW = {
    primary:   { base: '#2E8C7F', role: '활성·포커스·브랜드 CTA' },
    secondary: { base: '#E8735A', role: '선택·타임라인·하이라이트' },
    success:   { base: '#2F9E5F', role: '완료·통과' },
    warning:   { base: '#D98E1F', role: '주의·검토 필요' },
    danger:    { base: '#D6453A', role: '파괴 작업·오류' },
    info:      { base: '#3B7BD4', role: '안내·중립 알림' },
  };
  const COLOR = {
    background: '#F6F7F9', surface: '#FFFFFF', surfaceMuted: '#F0F2F5',
    textPrimary: '#1F2733', textSecondary: '#6B7480', textDisabled: '#9CA3AF',
    border: '#E2E6EC', overlay: 'rgba(21,25,31,.44)',
    neutral: ['#F6F7F9', '#F0F2F5', '#E2E6EC', '#C7CDD6', '#9CA3AF', '#6B7480', '#3A4453', '#1F2733'],
  };
  /* semantic 전부 text-safe(4.5)·ui-safe(3.0) 파생 — 파생 실패는 존재하지 않는다 */
  const SEMANTIC = {};
  Object.keys(RAW).forEach((k) => {
    const t = deriveSafe(RAW[k].base, BG, 4.5), u = deriveSafe(RAW[k].base, BG, 3.0);
    SEMANTIC[k] = { base: RAW[k].base, text: t.hex, ui: u.hex, role: RAW[k].role,
      derived: { textSteps: t.steps, uiSteps: u.steps, textOk: t.ok, uiOk: u.ok } };
  });

  /* ============================================================
     4) Typography (§5) — 8역할 스케일
     ============================================================ */
  const TYPE = {
    display: { size: 30, weight: 700, lh: 1.25 },
    heading: { size: 22, weight: 700, lh: 1.3 },
    title:   { size: 17, weight: 700, lh: 1.35 },
    body:    { size: 14.5, weight: 400, lh: 1.6 },
    caption: { size: 11.5, weight: 500, lh: 1.4 },
    label:   { size: 12.5, weight: 600, lh: 1.35 },
    button:  { size: 13.5, weight: 600, lh: 1 },
    code:    { size: 13, weight: 500, lh: 1.55, mono: true },
  };
  function typeAudit() {
    const order = ['display', 'heading', 'title', 'body', 'button', 'code', 'label', 'caption'];
    const desc = order.every((k, i) => i === 0 || TYPE[order[i - 1]].size >= TYPE[k].size);
    const lhOk = Object.entries(TYPE).every(([k, t]) => k === 'button' ? t.lh === 1 : (t.lh >= 1.2 && t.lh <= 1.7));
    const bodyReadable = TYPE.body.lh >= 1.5;
    return { ok: desc && lhOk && bodyReadable, descending: desc, lineHeights: lhOk, bodyReadable };
  }

  /* ============================================================
     5) Spacing (§6) — 4px Grid · 8px Rhythm · 16px Base
     ============================================================ */
  const SPACING = { grid: 4, rhythm: 8, base: 16, scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] };
  const onGrid = (px) => Number.isFinite(px) && px >= 0 && px % SPACING.grid === 0;
  function spacingLint(px) {
    if (!Number.isFinite(px)) return { ok: false, reason: 'not_a_number' };
    if (!onGrid(px)) return { ok: false, reason: 'off_grid(4px)', nearest: Math.round(px / 4) * 4 };
    return { ok: true, inScale: SPACING.scale.includes(px), rhythm: px % SPACING.rhythm === 0 };
  }

  /* ============================================================
     6) Radius (§7) · Elevation (§8)
     ============================================================ */
  const RADIUS = { small: 6, medium: 10, large: 16, xlarge: 24, pill: 999 };
  const ELEVATION = {
    surface:  { level: 0, y: 0,  blur: 0,  alpha: 0 },
    card:     { level: 1, y: 1,  blur: 2,  alpha: 0.06 },
    floating: { level: 2, y: 6,  blur: 20, alpha: 0.10 },
    dialog:   { level: 3, y: 16, blur: 48, alpha: 0.22 },
    overlay:  { level: 4, y: 24, blur: 64, alpha: 0.30 },
  };
  const shadowCss = (name) => {
    const e = ELEVATION[name];
    if (!e) return null;
    return e.level === 0 ? 'none' : `0 ${e.y}px ${e.blur}px rgba(20,28,40,${e.alpha})`;
  };
  function elevationAudit() {
    const ks = Object.keys(ELEVATION);
    const mono = ks.every((k, i) => {
      if (i === 0) return true;
      const p = ELEVATION[ks[i - 1]], c = ELEVATION[k];
      return c.level === p.level + 1 && c.y >= p.y && c.blur >= p.blur && c.alpha >= p.alpha;
    });
    return { ok: mono, levels: ks.length };
  }

  /* ============================================================
     7) Motion (§9·§10) — 원칙 4 + 지속시간 토큰 (150~250 밴드 강제)
     ============================================================ */
  const MOTION_PRINCIPLES = ['Fast', 'Natural', 'Purposeful', 'Minimal'];
  const MOTION = {
    hover:      { ms: 150, easing: 'cubic-bezier(.2,.8,.2,1)' },
    click:      { ms: 180, easing: 'cubic-bezier(.2,.8,.2,1)' },
    transition: { ms: 220, easing: 'cubic-bezier(.22,.68,.3,1)' },
    dialog:     { ms: 250, easing: 'cubic-bezier(.22,.68,.3,1)' },
  };
  function motionRegister(name, ms, easing) {
    if (!name) return { ok: false, reason: 'no_name' };
    if (ms < 150 || ms > 250) return { ok: false, reason: 'duration_out_of_range(150~250ms)' };
    MOTION[name] = { ms, easing: easing || MOTION.hover.easing };
    return { ok: true, spec: MOTION[name] };
  }
  function motionAudit() {
    const band = Object.values(MOTION).every((m) => m.ms >= 150 && m.ms <= 250);
    const fl = FL();
    const flowAligned = !fl || Object.values(fl.MOTION || {}).every((m) => m.ms >= 150 && m.ms <= 250);
    return { ok: band && flowAligned, band, flowAligned, count: Object.keys(MOTION).length };
  }

  /* ============================================================
     8) Icon System (§11)
     ============================================================ */
  const ICON = { grid: 24, stroke: 1.75, corner: 2, variants: ['outlined', 'filled'], opticalTolerance: 1 };
  function iconValidate(icon) {
    const errs = [];
    if (icon.grid !== ICON.grid) errs.push('grid_must_be_24');
    if (![1.5, 1.75, 2].includes(icon.stroke)) errs.push('stroke_out_of_set');
    if (!ICON.variants.includes(icon.variant)) errs.push('unknown_variant');
    const pts = icon.points || [];
    if (pts.some((p) => p[0] < 0 || p[0] > ICON.grid || p[1] < 0 || p[1] > ICON.grid)) errs.push('point_out_of_grid');
    if (pts.length) {
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      if (Math.abs(cx - 12) > ICON.opticalTolerance || Math.abs(cy - 12) > ICON.opticalTolerance) errs.push('optical_misaligned');
    }
    return { ok: errs.length === 0, errors: errs };
  }

  /* ============================================================
     9) Component Rules (§12) — 10종 스펙 + 린트
     ============================================================ */
  const STATES = ['default', 'hover', 'active', 'disabled', 'focus'];
  const COMPONENTS = {
    button:   { height: 36, radius: 'small',  type: 'button',  motion: 'hover',      states: STATES, focusRing: true },
    input:    { height: 36, radius: 'small',  type: 'body',    motion: 'hover',      states: STATES, focusRing: true },
    dropdown: { height: 36, radius: 'small',  type: 'body',    motion: 'transition', states: STATES, focusRing: true, elevation: 'floating' },
    checkbox: { height: 20, radius: 'small',  type: 'label',   motion: 'click',      states: STATES, focusRing: true },
    radio:    { height: 20, radius: 'pill',   type: 'label',   motion: 'click',      states: STATES, focusRing: true },
    switch:   { height: 24, radius: 'pill',   type: 'label',   motion: 'transition', states: STATES, focusRing: true },
    slider:   { height: 24, radius: 'pill',   type: 'label',   motion: 'hover',      states: STATES, focusRing: true },
    tooltip:  { height: 28, radius: 'small',  type: 'caption', motion: 'hover',      states: ['default'], focusRing: false, elevation: 'floating', transient: true },
    dialog:   { height: 0,  radius: 'large',  type: 'title',   motion: 'dialog',     states: ['default'], focusRing: true, elevation: 'dialog', fluid: true },
    sheet:    { height: 0,  radius: 'large',  type: 'title',   motion: 'dialog',     states: ['default'], focusRing: true, elevation: 'overlay', fluid: true },
  };
  function lintComponent(spec) {
    const errs = [];
    if (!spec.fluid && !onGrid(spec.height)) errs.push('height_off_grid');
    if (!(spec.radius in RADIUS)) errs.push('radius_not_token');
    if (!(spec.type in TYPE)) errs.push('type_not_token');
    if (!(spec.motion in MOTION)) errs.push('motion_not_token');
    if (spec.elevation && !(spec.elevation in ELEVATION)) errs.push('elevation_not_token');
    if (!spec.transient && !spec.fluid && !STATES.every((s) => (spec.states || []).includes(s))) errs.push('states_incomplete');
    if (!spec.transient && spec.focusRing !== true) errs.push('focus_ring_required');
    return { ok: errs.length === 0, errors: errs };
  }
  const componentAudit = () => Object.fromEntries(Object.entries(COMPONENTS).map(([k, v]) => [k, lintComponent(v)]));

  /* ============================================================
     10) Card System (§13) · Navigation (§14)
     ============================================================ */
  const CARDS = {
    information: { slots: ['icon', 'title', 'body'], elevation: 'card' },
    project:     { slots: ['thumbnail', 'title', 'meta', 'actions'], elevation: 'card' },
    asset:       { slots: ['preview', 'label', 'favorite'], elevation: 'card' },
    template:    { slots: ['preview', 'title', 'tags', 'use'], elevation: 'card' },
    plugin:      { slots: ['icon', 'title', 'publisher', 'install'], elevation: 'card' },
  };
  const NAVIGATION = {
    primary:   { kind: 'rail', items: 'screens' },
    secondary: { kind: 'tabs', items: 'screen-sections' },
    context:   { kind: 'menu', items: 'selection-actions' },
    breadcrumb:{ kind: 'path', items: 'hierarchy' },
    palette:   { kind: 'command', bridge: 'MK_FLOW.search', shortcut: 'Ctrl+K' },
  };

  /* ============================================================
     11) Empty State (§15) · Loading (§16) · Feedback (§17)
     ============================================================ */
  const EMPTY_TRAITS = ['friendly', 'helpful', 'aiSuggestion', 'quickAction'];
  function emptyFor(context) {
    const map = {
      projects:  { title: '아직 프로젝트가 없어요', help: '첫 디자인을 3분 안에 만들 수 있어요', ai: 'AI 로 초안 만들기', action: '새 프로젝트' },
      assets:    { title: '에셋 보관함이 비어 있어요', help: '이미지를 끌어다 놓으면 바로 등록돼요', ai: 'AI 이미지 생성', action: '업로드' },
      templates: { title: '조건에 맞는 템플릿이 없어요', help: '검색어를 줄이거나 태그를 바꿔 보세요', ai: 'AI 에게 추천받기', action: '전체 보기' },
      search:    { title: '검색 결과가 없어요', help: '짧은 단어로 다시 검색해 보세요', ai: 'AI 에게 물어보기', action: '필터 초기화' },
    };
    const e = map[context] || map.search;
    return { ...e, traits: EMPTY_TRAITS };
  }
  const LOADING = { skeleton: 'card-shape', progress: 'determinate-first', lazy: '4-per-step', placeholder: 'never-blank' };
  function skeletonFor(cardType) {
    const c = CARDS[cardType];
    return c ? c.slots.map((s) => ({ slot: s, shape: /thumbnail|preview/.test(s) ? 'rect' : 'line' })) : null;
  }
  function feedbackRoute(severity, blocking) {
    if (blocking) return severity === 'danger' ? 'modal' : 'banner';
    return severity === 'info' || severity === 'success' ? 'toast' : 'inline';
  }

  /* ============================================================
     12) Accessibility (§18) — 대비 감사 · 포커스 링 · 키보드 브리지
     ============================================================ */
  const FOCUS_RING = { width: 2, offset: 2, color: 'primary.base', style: 'solid' };
  function a11yAudit() {
    const textPairs = [
      ['textPrimary', COLOR.textPrimary, COLOR.surface, 4.5],
      ['textPrimary/bg', COLOR.textPrimary, COLOR.background, 4.5],
      ['textSecondary', COLOR.textSecondary, COLOR.surface, 4.5],
      ...Object.keys(SEMANTIC).map((k) => [k + '.text', SEMANTIC[k].text, COLOR.surface, 4.5]),
    ];
    const uiPairs = Object.keys(SEMANTIC).map((k) => [k + '.ui', SEMANTIC[k].ui, COLOR.surface, 3.0]);
    const check = (pairs) => pairs.map(([name, fg, bg, min]) => ({ name, ratio: +contrast(fg, bg).toFixed(2), min, ok: contrast(fg, bg) >= min }));
    const text = check(textPairs), ui = check(uiPairs);
    const fl = FL();
    const keyboard = !fl || !!(fl.usabilityReport && fl.usabilityReport().keyboardCoverage);
    const focus = FOCUS_RING.width >= 2 && FOCUS_RING.offset >= 1;
    return { ok: text.every((p) => p.ok) && ui.every((p) => p.ok) && keyboard && focus, text, ui, keyboard, focusRing: focus };
  }

  /* ============================================================
     13) Dark Mode (§19) — semantic 매핑 파생 + 대비 재검증
     ============================================================ */
  const DARK = {
    background: '#12161D', surface: '#1A2029', surfaceMuted: '#212934',
    textPrimary: '#E8ECF2', textSecondary: '#A6AFBC', border: '#2C3540',
    elevation: ['#1A2029', '#212934', '#28313E', '#2F3948', '#374253'],
  };
  function darkSemantic() {
    /* 다크에서는 밝히기 방향 파생 — 어두운 surface 대비 확보 */
    const lift = (hex, f) => { const [r, g, b] = hexRgb(hex); return rgbHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };
    const out = {};
    Object.keys(SEMANTIC).forEach((k) => {
      let t = SEMANTIC[k].base, steps = 0;
      while (contrast(t, DARK.surface) < 4.5 && steps < 40) { t = lift(t, 0.12); steps++; }
      out[k] = { base: SEMANTIC[k].base, text: t, steps };
    });
    return out;
  }
  function darkAudit() {
    const ds = darkSemantic();
    const pairs = [
      { name: 'textPrimary', ratio: contrast(DARK.textPrimary, DARK.surface), min: 4.5 },
      { name: 'textSecondary', ratio: contrast(DARK.textSecondary, DARK.surface), min: 4.5 },
      ...Object.keys(ds).map((k) => ({ name: k + '.text', ratio: contrast(ds[k].text, DARK.surface), min: 4.5 })),
    ].map((p) => ({ ...p, ratio: +p.ratio.toFixed(2), ok: p.ratio >= p.min }));
    const lums = DARK.elevation.map(luminance);
    const elevMono = lums.every((l, i) => i === 0 || l > lums[i - 1]);
    return { ok: pairs.every((p) => p.ok) && elevMono, pairs, elevationLightens: elevMono };
  }

  /* ============================================================
     14) Responsive (§20) — 4분기
     ============================================================ */
  const BREAKPOINTS = { mobile: [0, 767], tablet: [768, 1199], desktop: [1200, Infinity] };
  function layoutFor(width, folded) {
    if (folded === 'closed') return { device: 'foldable', layout: 'mobile-narrow' };
    if (folded === 'open') return { device: 'foldable', layout: 'tablet-split' };
    if (width >= 1200) return { device: 'desktop', layout: 'three-panel' };
    if (width >= 768) return { device: 'tablet', layout: 'two-panel' };
    return { device: 'mobile', layout: 'single-stack' };
  }

  /* ============================================================
     15) Design Tokens (§21) — 6종 통합 내보내기 + 실 CSS 감사
     ============================================================ */
  function tokens() {
    return clone({
      color: { ...COLOR, semantic: Object.fromEntries(Object.entries(SEMANTIC).map(([k, v]) => [k, { base: v.base, text: v.text, ui: v.ui }])) },
      spacing: SPACING, radius: RADIUS,
      shadow: Object.fromEntries(Object.keys(ELEVATION).map((k) => [k, shadowCss(k)])),
      motion: MOTION, typography: TYPE,
    });
  }
  function exportCss() {
    const L = [':root {'];
    L.push(`  --mk-background: ${COLOR.background};`, `  --mk-surface: ${COLOR.surface};`, `  --mk-text-primary: ${COLOR.textPrimary};`, `  --mk-text-secondary: ${COLOR.textSecondary};`, `  --mk-border: ${COLOR.border};`);
    Object.entries(SEMANTIC).forEach(([k, v]) => L.push(`  --mk-${k}: ${v.base};`, `  --mk-${k}-text: ${v.text};`, `  --mk-${k}-ui: ${v.ui};`));
    SPACING.scale.forEach((v, i) => L.push(`  --mk-sp-${i + 1}: ${v}px;`));
    Object.entries(RADIUS).forEach(([k, v]) => L.push(`  --mk-r-${k}: ${v === 999 ? '999px' : v + 'px'};`));
    Object.keys(ELEVATION).forEach((k) => L.push(`  --mk-sh-${k}: ${shadowCss(k)};`));
    Object.entries(MOTION).forEach(([k, v]) => L.push(`  --mk-mo-${k}: ${v.ms}ms ${v.easing};`));
    Object.entries(TYPE).forEach(([k, v]) => L.push(`  --mk-t-${k}: ${v.weight} ${v.size}px/${v.lh} var(--mk-font);`));
    L.push('}');
    return L.join('\n');
  }
  const exportJson = () => JSON.stringify(tokens(), null, 2);
  function figmaStructure() {
    return {
      library: 'K-MAKER DLS',
      pages: [
        { name: '00 Cover', contents: ['philosophy', 'principles'] },
        { name: '01 Foundation', contents: ['color', 'typography', 'spacing', 'radius', 'elevation', 'motion', 'icon'] },
        { name: '02 Primitives', contents: Object.keys(COMPONENTS) },
        { name: '03 Composites', contents: Object.keys(CARDS).map((k) => k + '-card') },
        { name: '04 Patterns', contents: ['navigation', 'empty-state', 'loading', 'feedback'] },
        { name: '05 Templates', contents: ['home', 'editor', 'workspace'] },
      ],
      variableCollections: ['color', 'spacing', 'radius', 'shadow', 'motion', 'typography'],
      modes: ['light', 'dark'],
    };
  }
  /* 실 CSS 텍스트 감사 — 그리드·모션 밴드·hex 형식 */
  function auditCss(cssText) {
    const viol = [];
    for (const m of cssText.matchAll(/--mk-sp-\w+:\s*([\d.]+)px/g)) {
      const v = parseFloat(m[1]);
      if (!onGrid(v)) viol.push({ token: m[0], reason: 'off_grid' });
    }
    for (const m of cssText.matchAll(/--mk-(background|surface|surface-muted|text-primary|text-secondary|border|coral|teal|danger|success)\w*:\s*(#\w+)/g)) {
      if (!hexRe.test(m[2])) viol.push({ token: m[0], reason: 'bad_hex' });
    }
    for (const m of cssText.matchAll(/--mk-mo-\w+:\s*(\d+)ms/g)) {
      const v = parseInt(m[1], 10);
      if (v < 150 || v > 250) viol.push({ token: m[0], reason: 'motion_out_of_band' });
    }
    return { ok: viol.length === 0, violations: viol };
  }

  /* ============================================================
     16) Component Library (§22) — Atomic 계층
     ============================================================ */
  const LIBRARY = {
    foundation: ['color', 'typography', 'spacing', 'radius', 'elevation', 'motion', 'icon'],
    primitive: Object.keys(COMPONENTS),
    composite: Object.keys(CARDS).map((k) => k + '-card'),
    pattern: ['navigation', 'empty-state', 'loading', 'feedback', 'command-palette'],
    template: ['home', 'editor', 'workspace', 'review'],
  };
  const libraryTree = () => clone(LIBRARY);
  function levelOf(name) {
    for (const [lv, items] of Object.entries(LIBRARY)) if (items.includes(name)) return lv;
    return null;
  }

  /* ============================================================
     17) Documentation (§23) — Do/Don't 전 컴포넌트 커버
     ============================================================ */
  const DOCS = {};
  Object.keys(COMPONENTS).forEach((k) => {
    DOCS[k] = {
      usage: `${k} 는 ${COMPONENTS[k].type} 타이포·${COMPONENTS[k].radius} 반경 토큰만 사용한다.`,
      do: ['토큰 참조만 사용', '5상태 전부 구현', '포커스 링 유지'],
      dont: ['하드코딩 색·픽셀 금지', '그리드 밖 높이 금지', '모션 밴드 이탈 금지'],
      example: `MK.${k}()`,
      a11y: '키보드 도달·포커스 가시성·대비 기준 충족',
      best: '변형이 필요하면 토큰을 추가하고 컴포넌트는 참조만 한다',
    };
  });
  const docFor = (id) => DOCS[id] ? clone(DOCS[id]) : null;
  const docsCoverage = () => {
    const total = Object.keys(COMPONENTS).length;
    const covered = Object.keys(COMPONENTS).filter((k) => DOCS[k] && DOCS[k].do.length && DOCS[k].dont.length).length;
    return { total, covered, pct: Math.round((covered / total) * 100) };
  };

  /* ============================================================
     18) Testing (§24) — 일관성 감사 (오프토큰 검출)
     ============================================================ */
  function consistencyAudit(decls) {
    const colorSet = new Set([COLOR.background, COLOR.surface, COLOR.surfaceMuted, COLOR.textPrimary,
      COLOR.textSecondary, COLOR.textDisabled, COLOR.border, ...COLOR.neutral,
      ...Object.values(SEMANTIC).flatMap((s) => [s.base, s.text, s.ui])].map((c) => c.toUpperCase()));
    const viol = [];
    (decls || []).forEach((d) => {
      if (d.prop === 'color' || d.prop === 'background') {
        if (hexRe.test(d.value) && !colorSet.has(d.value.toUpperCase())) viol.push({ ...d, reason: 'off_token_color' });
      } else if (/padding|margin|gap/.test(d.prop)) {
        const v = parseFloat(d.value);
        if (!onGrid(v)) viol.push({ ...d, reason: 'off_grid_spacing' });
      } else if (d.prop === 'border-radius') {
        const v = parseFloat(d.value);
        if (!Object.values(RADIUS).includes(v)) viol.push({ ...d, reason: 'off_token_radius' });
      } else if (d.prop === 'transition-duration') {
        const v = parseFloat(d.value);
        if (v < 150 || v > 250) viol.push({ ...d, reason: 'motion_out_of_band' });
      }
    });
    return { ok: viol.length === 0, checked: (decls || []).length, violations: viol };
  }

  /* ============================================================
     19) Deliverables (§25) — 9종 산출물 전부 생성 가능해야 완료
     ============================================================ */
  function deliverables() {
    return [
      { id: 'principles', name: 'Design Principles', ready: PHILOSOPHY.length === 8 && PRINCIPLES.length === 4 },
      { id: 'visual', name: 'Visual Language', ready: VISUAL.length === 7 },
      { id: 'library', name: 'Component Library', ready: Object.values(componentAudit()).every((r) => r.ok) },
      { id: 'tokens', name: 'Design Tokens', ready: exportCss().includes('--mk-sp-1') && !!exportJson() },
      { id: 'motion', name: 'Motion Guide', ready: motionAudit().ok },
      { id: 'icon', name: 'Icon Guide', ready: ICON.grid === 24 },
      { id: 'a11y', name: 'Accessibility Guide', ready: a11yAudit().ok },
      { id: 'figma', name: 'Figma Library Structure', ready: figmaStructure().pages.length === 6 },
      { id: 'impl', name: 'Implementation Guide', ready: docsCoverage().pct === 100 },
    ];
  }
  const complete = () => deliverables().every((d) => d.ready);

  return {
    PHILOSOPHY, PRINCIPLES, VISUAL,
    COLOR, SEMANTIC, TYPE, SPACING, RADIUS, ELEVATION, MOTION, MOTION_PRINCIPLES, ICON,
    COMPONENTS, STATES, CARDS, NAVIGATION, LOADING, FOCUS_RING, DARK, BREAKPOINTS, LIBRARY,
    hexRgb, rgbHex, luminance, contrast, deriveSafe,
    typeAudit, onGrid, spacingLint, shadowCss, elevationAudit,
    motionRegister, motionAudit, iconValidate,
    lintComponent, componentAudit, emptyFor, skeletonFor, feedbackRoute,
    a11yAudit, darkSemantic, darkAudit, layoutFor,
    tokens, exportCss, exportJson, figmaStructure, auditCss,
    libraryTree, levelOf, docFor, docsCoverage, consistencyAudit,
    deliverables, complete,
  };
})();
