/* ============================================================
   K-MAKER Left Navigation 엔진 (Round 32 — GPT Round 33 지시서)
   ------------------------------------------------------------
   window.MK_NAV — 기능 추가 0 라운드. "메뉴를 배우지 않아도 되는 길."
   · 철학(§0·§1): 메뉴는 기능 목록이 아니라 목적의 최단 경로.
   · Menu Audit(§2): 레거시 표면 전수(MK_SIMPLE.MENU) 를 유지/통합/
     숨김/삭제/AI 대체로 분류 — 누락 0 기계검증, 미분류 스펙 거부.
   · 수 제한(§3): 기본 메뉴 행 ≤6 — 7행 스펙 실거부.
   · 기본 구조(§4): 홈·프로젝트·템플릿·내 파일 4행 + AI 입구 = 5.
     ※ 헌법 조정 — 지시서는 AI 를 메뉴로 추천하나 MK_TEN·헌법이
     "AI 단독 메뉴 금지"를 이미 성문화(§7 지시서 자신도 'AI 는
     이동 방식'이라 말한다). AI 는 행(row)이 아니라 입구(entrance).
   · 전문가 격리(§5): Brand·Plugin·Automation·Developer·Marketplace·
     Workflow·Admin·API 토큰 = 기본 표면 0 실측.
   · Progressive(§6): 첫 가입 5(4행+입구) → 자연 노출 → 전문가 옵트인.
     자동 승격 없음 — MK_SIMPLE.navFor 브리지.
   · AI Navigation(§7): "영상 만들어줘"→editor(video) 실라우팅.
     exec() 는 PG.go 를 실제로 호출 — 화면이 정말 이동한다.
   · Search First(§8): Ctrl+K — 숨김·전문가 포함 전 메뉴 검색 도달
     커버리지 기계검증. 옛 용어(에셋·Export)도 동의어로 도달.
   · Context(§9): 프로젝트 유형별 메뉴 — 교차 소음 0 판정.
   · Naming(§10): renameJudge 가 BANNED_NAMES 로 개명 자체를 심사 —
     지시서 예시 "브랜드"도 실거부, '우리 반 스타일' 유지(MK_TEN 계보).
   · Visual Priority(§11): usage 가중치 → tier 단조 판정.
   · Mobile(§12) Bottom ≤5 + 검색 통로 · Tablet(§13) Collapsible.
   · Expert Workspace(§14): 전문가만 추가/삭제/재배치 — 홈 삭제 불가,
     6행 초과 불가, 초보자 커스텀 실거부.
   · 지표(§15): 4종 레지스트리 record() 유일 경로, 미실측 = null.
   · 5초 테스트(§16): 3질문 — 답이 구조에서 유도.
   · Deliverables 8종(§17) → complete(§18)
   브리지: MK_SIMPLE(MENU·navFor·paletteSearch) · MK_TEN(BANNED_NAMES·
   RENAMES 계보) · MK_AI(발표 실생성 통로) · PG(실이동)
   ============================================================ */
window.MK_NAV = (() => {
  const S = () => window.MK_SIMPLE, T10 = () => window.MK_TEN;

  /* ============================================================
     §0·§1 — 핵심 철학
     ============================================================ */
  const PHILOSOPHY = {
    role: '메뉴는 기능 목록이 아니다 — 사용자가 목적을 이루기 위한 가장 짧은 길이다',
    rules: ['메뉴 수를 줄인다', '전문 용어를 제거한다', '기능보다 목적을 보여준다', '항상 5초 안에 이해되어야 한다'],
    guide: 'Navigation 은 보여주는 것이 아니라 길을 안내하는 역할만 수행한다',
  };

  /* ============================================================
     §4 — 기본 Navigation 구조 (헌법 조정 반영)
     kind: 'menu' = 행 · 'entrance' = 상시 입구(AI — 메뉴 아님)
     usage: 상대 사용 빈도(§11 Visual Priority 의 단일 축)
     ============================================================ */
  const MAX_ROWS = 6;                                   /* §3 — 그 이상은 금지 */
  const DEFAULT_NAV = [
    { id: 'home',     label: '홈',     kind: 'menu',     route: 'home',     usage: 100, why: '시작점 — 질문 하나' },
    { id: 'projects', label: '프로젝트', kind: 'menu',   route: 'projects', usage: 80,  why: '이어서 만들기 — 재방문 1클릭' },
    { id: 'library',  label: '템플릿', kind: 'menu',     route: 'library',  usage: 60,  why: '첫 결과물 최단 경로' },
    { id: 'assets',   label: '내 파일', kind: 'menu',    route: 'assets',   usage: 40,  why: '내가 올린 사진·그림' },
    { id: 'ai',       label: 'AI',    kind: 'entrance', route: 'home',     usage: 90,  why: '메뉴가 아니라 이동 방식(§7) — 홈 Hero 입력이 입구' },
  ];
  const rows = () => DEFAULT_NAV.filter((m) => m.kind === 'menu');
  const entrance = () => DEFAULT_NAV.find((m) => m.kind === 'entrance');

  /* ============================================================
     §2 — Menu Audit: 레거시 표면 전수 분류
     클래스 5종(지시서 그대로): keep/merge/hide/delete/ai
     대상 = MK_SIMPLE.MENU 전 키 — 누락 0 이 기계로 증명돼야 한다.
     ============================================================ */
  const AUDIT_CLASSES = ['keep', 'merge', 'hide', 'delete', 'ai'];
  const VERDICTS = {
    /* 유지 — 기본 4행 + 입구 */
    home:      { v: 'keep',   reason: '기본 행 1 — 시작점' },
    projects:  { v: 'keep',   reason: '기본 행 2 — 프로젝트(구 내 작업)' },
    library:   { v: 'keep',   reason: '기본 행 3 — 템플릿' },
    assets:    { v: 'keep',   reason: '기본 행 4 — 내 파일(구 에셋)' },
    ai:        { v: 'keep',   reason: '입구로 유지 — 행 아님(헌법 §, MK_TEN aiAudit)' },
    /* 통합 — 메뉴가 아니라 경로로 */
    editor:    { v: 'merge',  into: 'path', reason: '메뉴가 아니라 경로 — 프로젝트·템플릿·AI 에서 도달. "편집하러 간다"는 목적이 아니다' },
    templates: { v: 'merge',  into: 'library', reason: 'Templates(구) → 템플릿 한 행으로' },
    video:     { v: 'merge',  into: 'editor', reason: '자리표시 껍데기 → Editor Video 모드' },
    photo:     { v: 'merge',  into: 'editor', reason: '자리표시 껍데기 → 사진 도구' },
    videoMode: { v: 'merge',  into: 'editor', reason: 'Editor 내 모드' },
    photoTools:{ v: 'merge',  into: 'editor', reason: 'Editor 내 도구' },
    /* 숨김 — 숙련 자연 노출 or 전문가 옵트인 */
    brand:     { v: 'hide',  reason: '반복 제작 시작 시 자연 노출(minUsage)' },
    team:      { v: 'hide',  reason: '협업 시작 시 — 기본 화면 비노출(§5)' },
    /* 삭제 — 노출 삭제(코드 생존, Bible §0) */
    patterns:  { v: 'delete', reason: '빈 자리표시 — 내용 없음' },
    /* AI 대체 */
    create:    { v: 'ai', reason: '"…만들어줘" 한 문장이 4클릭 깔때기를 대체' },
    animation: { v: 'ai', reason: '"애니메이션 더 차분하게" — 프리셋 교체는 명령으로' },
  };
  const EXPERT_HIDE_REASON = '전문가 팔레트 전용(§5) — 기본 Navigation 제거, 검색·옵트인으로만';
  function verdictOf(id) {
    if (VERDICTS[id]) return { id, verdict: VERDICTS[id].v, into: VERDICTS[id].into || null, reason: VERDICTS[id].reason };
    const s = S();
    if (s && s.MENU[id] && s.MENU[id].cls === 'expert') return { id, verdict: 'hide', into: null, reason: EXPERT_HIDE_REASON };
    return null;                                        /* 미분류 — 감사 실패 사유 */
  }
  function menuAudit() {
    const s = S();
    if (!s) return { ok: false, violations: ['MK_SIMPLE 미로드'] };
    const ids = Object.keys(s.MENU);
    const missing = ids.filter((id) => !verdictOf(id));
    const list = ids.map(verdictOf).filter(Boolean);
    const badClass = list.filter((r) => !AUDIT_CLASSES.includes(r.verdict));
    const v = [];
    if (missing.length) v.push('미분류 ' + missing.length + ': ' + missing.join(','));
    if (badClass.length) v.push('허용 밖 클래스: ' + badClass.map((b) => b.verdict).join(','));
    const by = {}; AUDIT_CLASSES.forEach((c) => by[c] = list.filter((r) => r.verdict === c));
    return { ok: v.length === 0, total: ids.length, by, list, violations: v };
  }
  /* 스펙 판정형 — 일부만 분류한 스펙은 심사 자체가 안 된다 */
  function menuSpecAudit(spec) {
    const s = S();
    const ids = s ? Object.keys(s.MENU) : [];
    const cls = (spec && spec.classified) || {};
    const missing = ids.filter((id) => !cls[id]);
    return { ok: missing.length === 0, missing };
  }

  /* ============================================================
     §3 — 메뉴 수 제한: 행 ≤6
     ============================================================ */
  function countAudit() {
    const n = rows().length;
    const v = [];
    if (n > MAX_ROWS) v.push('행 ' + n + ' — 최대 ' + MAX_ROWS + '(§3)');
    if (n < 3) v.push('행 ' + n + ' — 길 안내가 성립하지 않는다');
    return { ok: v.length === 0, rows: n, max: MAX_ROWS, violations: v };
  }
  function countSpecAudit(labels) {
    const n = (labels || []).length;
    return { ok: n >= 3 && n <= MAX_ROWS, n, violations: n > MAX_ROWS ? [n + '행 — 그 이상은 금지(§3)'] : n < 3 ? [n + '행 — 부족'] : [] };
  }

  /* ============================================================
     §4 — 기본 구조 감사: 추천 구성 + 실라우트 존재
     ============================================================ */
  function defaultAudit() {
    const v = [];
    const need = ['home', 'projects', 'library', 'assets'];
    need.forEach((id) => { if (!rows().some((r) => r.id === id)) v.push('기본 행 누락: ' + id); });
    const e = entrance();
    if (!e || e.id !== 'ai') v.push('AI 입구 없음(§4·§7)');
    if (rows().some((r) => r.id === 'ai')) v.push('AI 가 메뉴 행 — 헌법·MK_TEN aiAudit 위반');
    const scr = window.MK_SCREENS || {};
    DEFAULT_NAV.forEach((m) => { if (!scr[m.route]) v.push('실라우트 없음: ' + m.route); });
    const total = rows().length + 1;                     /* 지시서 "처음 가입자는 5개" */
    if (total !== 5) v.push('첫 화면 항목 ' + total + ' — 5 여야 한다(4행+입구)');
    return { ok: v.length === 0, rows: rows().map((r) => r.label), entrance: e ? e.label : null, violations: v };
  }

  /* ============================================================
     §5 — 전문가 기능 격리: 8토큰 기본 표면 0
     ============================================================ */
  const EXPERT_TOKENS = ['Brand', 'Plugin', 'Automation', 'Developer', 'Marketplace', 'Workflow', 'Admin', 'API'];
  function expertAudit() {
    const surface = DEFAULT_NAV.map((m) => m.label + ' ' + m.id).join(' ');
    const hits = EXPERT_TOKENS.filter((t) => new RegExp(t, 'i').test(surface));
    const s = S();
    const leaked = s ? rows().filter((r) => s.MENU[r.id] && s.MENU[r.id].cls === 'expert').map((r) => r.id) : [];
    const v = [];
    if (hits.length) v.push('전문가 토큰 노출: ' + hits.join(','));
    if (leaked.length) v.push('expert 클래스가 기본 행에: ' + leaked.join(','));
    return { ok: v.length === 0, tokens: EXPERT_TOKENS, hits, violations: v };
  }

  /* ============================================================
     §6 — Progressive Navigation
     첫 가입 4행+입구 → minUsage 자연 노출 → 전문가 옵트인.
     자동 승격 없음(MK_SIMPLE 축 그대로).
     ============================================================ */
  function navFor(usage) {
    const u = usage || {};
    const base = rows().map((r) => r.id);
    const out = base.slice();
    const s = S();
    if (s) s.navFor(u).forEach((id) => { if (!out.includes(id) && id !== 'editor' && id !== 'ai') out.push(id); });
    return { rows: out, entrance: 'ai' };
  }
  function progressiveAudit() {
    const first = navFor({ edits: 0 });
    const grown = navFor({ edits: 20 });
    const power = navFor({ edits: 20, expertOptIn: true });
    const heavy = navFor({ edits: 9999 });               /* 옵트인 없는 헤비 유저 */
    const v = [];
    if (first.rows.length !== 4) v.push('첫 가입 행 ' + first.rows.length + ' — 4 여야(입구 포함 5)');
    if (!(grown.rows.length >= first.rows.length)) v.push('자연 노출이 줄어든다');
    if (!(power.rows.length > grown.rows.length)) v.push('옵트인이 아무것도 열지 않는다');
    if (heavy.rows.length >= power.rows.length) v.push('자동 승격 발생 — 옵트인 없이 전문가 노출');
    return { ok: v.length === 0, first: first.rows, grown: grown.rows, power: power.rows.length, violations: v };
  }

  /* ============================================================
     §7 — AI Navigation: 말하면 이동한다
     ============================================================ */
  const INTENTS = [
    { re: /영상|비디오|동영상/,               target: 'editor', mode: 'video', label: '영상 만들기' },
    { re: /(스타일|색|색깔).*(바꾸|바꿔|변경)/, target: 'brand',  label: '우리 반 스타일 바꾸기' },
    { re: /브랜드/,                           target: 'brand',  label: '우리 반 스타일 바꾸기' },   /* 사용자 발화는 금지어 아님 */
    { re: /발표|프레젠|피피티|ppt/i,          target: 'editor', gen: true, label: '발표 만들기' },
    { re: /공유|내보내|보내줘/,               target: 'export', label: '공유하기' },
    { re: /사진|이미지|그림/,                 target: 'assets', label: '내 파일' },
    { re: /템플릿|틀/,                        target: 'library', label: '템플릿' },
  ];
  function routeByIntent(text) {
    const t = String(text || '').trim();
    if (!t) return { ok: false, fallback: 'search' };
    const hit = INTENTS.find((i) => i.re.test(t));
    if (!hit) return { ok: false, fallback: 'search', text: t };
    return { ok: true, target: hit.target, mode: hit.mode || null, gen: !!hit.gen, label: hit.label, text: t };
  }
  /* 실이동 — PG 가 있으면 화면이 정말 바뀐다 */
  function exec(text) {
    const r = routeByIntent(text);
    if (!r.ok || !window.PG) return r;
    if (r.target === 'editor') {
      const sample = window.MK_SAMPLE && window.MK_SAMPLE.TEMPLATES.find((t) => r.mode === 'video' ? t.contentType === 'video' : t.contentType !== 'video');
      if (sample) window.PG.openEditor(sample.templateId); else window.PG.go('editor');
    } else window.PG.go(r.target);
    r.moved = window.PG.state.screen;
    return r;
  }
  function aiNavAudit() {
    const a = routeByIntent('영상 만들어줘');
    const b = routeByIntent('브랜드 색 바꿔줘');
    const v = [];
    if (!(a.ok && a.target === 'editor' && a.mode === 'video')) v.push('"영상 만들어줘" 라우팅 실패');
    if (!(b.ok && b.target === 'brand')) v.push('"브랜드 색 바꿔줘" 라우팅 실패');
    if (routeByIntent('알 수 없는 말').fallback !== 'search') v.push('미인식 → 검색 낙하 없음');
    return { ok: v.length === 0, examples: [a, b], violations: v };
  }

  /* ============================================================
     §8 — Search First: Ctrl+K — 전 메뉴 검색 도달
     ============================================================ */
  const SHORTCUT = 'Ctrl+K';
  const SYNONYMS = { assets: ['에셋', 'asset', '파일'], library: ['라이브러리', 'library', '틀'], brand: ['브랜드', 'brand', '스타일'], 'export': ['내보내기', 'export', '공유'], projects: ['내 작업', '작업'], admin: ['관리'], dev: ['api', 'developer'] };
  function searchIndex() {
    const s = S();
    const idx = [];
    if (s) Object.values(s.MENU).forEach((m) => idx.push({ id: m.id, label: m.label, syn: SYNONYMS[m.id] || [] }));
    DEFAULT_NAV.forEach((m) => { if (!idx.some((x) => x.id === m.id)) idx.push({ id: m.id, label: m.label, syn: SYNONYMS[m.id] || [] }); });
    return idx;
  }
  function search(q) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return [];
    return searchIndex().filter((x) => (x.id + ' ' + x.label + ' ' + x.syn.join(' ')).toLowerCase().includes(q));
  }
  function searchAudit() {
    const idx = searchIndex();
    const unreachable = idx.filter((x) => !search(x.label).some((h) => h.id === x.id)).map((x) => x.id);
    const legacy = ['에셋', 'Export'].every((t) => search(t).length > 0);   /* 옛 용어로도 도달 */
    const hiddenReach = ['admin', 'plugins', 'market'].every((id) => search(id).some((h) => h.id === id));
    const v = [];
    if (unreachable.length) v.push('검색 불가 메뉴: ' + unreachable.join(','));
    if (!legacy) v.push('옛 용어 동의어 낙하 없음');
    if (!hiddenReach) v.push('숨김·전문가가 검색으로 안 열린다(§8·§12)');
    return { ok: v.length === 0, shortcut: SHORTCUT, indexed: idx.length, violations: v };
  }

  /* ============================================================
     §9 — Context Navigation: 프로젝트 유형이 메뉴를 정한다
     ============================================================ */
  const CONTEXT_NAV = {
    video:        ['장면', '자막', '음악', '애니메이션', '공유하기'],
    presentation: ['슬라이드', '발표 노트', '디자인', '공유하기'],
    doc:          ['쪽', '표', '디자인', '공유하기'],
  };
  const CTX_ONLY = { video: ['장면', '자막', '음악', '애니메이션'], presentation: ['슬라이드', '발표 노트'], doc: ['쪽', '표'] };
  function contextNav(type) {
    return { type, items: CONTEXT_NAV[type] || CONTEXT_NAV.presentation };
  }
  function contextAudit() {
    const v = [];
    Object.keys(CONTEXT_NAV).forEach((t) => {
      const items = CONTEXT_NAV[t];
      Object.keys(CTX_ONLY).forEach((o) => {
        if (o === t) return;
        CTX_ONLY[o].forEach((x) => { if (items.includes(x)) v.push(t + ' 문맥에 ' + o + ' 전용 「' + x + '」 소음'); });
      });
      if (items.length > MAX_ROWS) v.push(t + ' 문맥 ' + items.length + '개 — ≤' + MAX_ROWS);
    });
    const elemCtx = S() ? Object.keys(S().CTX_MENUS).length >= 5 : false;   /* 요소 문맥은 R27 계보 */
    if (!elemCtx) v.push('요소 문맥(MK_SIMPLE.CTX_MENUS) 브리지 끊김');
    return { ok: v.length === 0, contexts: Object.keys(CONTEXT_NAV), violations: v };
  }

  /* ============================================================
     §10 — Naming Audit: 개명 자체를 심사한다
     ============================================================ */
  const banned = () => (T10() && T10().BANNED_NAMES) || [];
  function renameJudge(from, to) {
    const b = banned();
    const hit = b.find((x) => String(to).toLowerCase() === String(x).toLowerCase() || String(to).includes(x));
    if (hit) return { ok: false, from, to, reason: '개명 결과가 금지어(§10 — MK_TEN.BANNED_NAMES): ' + hit };
    if (!to || /[A-Za-z]{4,}/.test(to)) return { ok: false, from, to, reason: '전문 영문 용어 잔존' };
    return { ok: true, from, to };
  }
  /* 지시서 예시 "Brand Kit → 브랜드" 는 renameJudge 가 거부 → 계보 유지 */
  const RENAMES = { 'Assets': '내 파일', 'Brand Kit': '우리 반 스타일', 'Export': '공유하기', 'Workflow': '자동화' };
  function nameAudit() {
    const v = [];
    Object.entries(RENAMES).forEach(([f, t]) => { const j = renameJudge(f, t); if (!j.ok) v.push(f + '→' + t + ' 거부: ' + j.reason); });
    const directiveBrand = renameJudge('Brand Kit', '브랜드');
    if (directiveBrand.ok) v.push('금지어 「브랜드」 개명이 통과 — 심사기 고장');
    const surface = DEFAULT_NAV.map((m) => m.label);
    const hits = [];
    surface.forEach((t) => banned().forEach((b) => { if (t.toLowerCase().includes(String(b).toLowerCase())) hits.push(t + '⊃' + b); }));
    if (hits.length) v.push('기본 표면 금지어: ' + hits.join(','));
    return { ok: v.length === 0, renames: RENAMES, rejected: { from: 'Brand Kit', to: '브랜드', why: directiveBrand.reason }, violations: v };
  }

  /* ============================================================
     §11 — Visual Priority: usage → tier 단조
     ============================================================ */
  const TIERS = { 1: 'lg', 2: 'md' };
  const tierOf = (m) => m.usage >= 75 ? 1 : 2;
  function priorityAudit() {
    const sorted = rows().slice().sort((a, b) => b.usage - a.usage);
    const tiers = sorted.map(tierOf);
    const mono = tiers.every((t, i) => i === 0 || t >= tiers[i - 1]);
    const topIsHome = sorted[0].id === 'home';
    const v = [];
    if (!mono) v.push('사용 빈도와 크기 역전(§11)');
    if (!topIsHome) v.push('최다 사용 메뉴가 최우선이 아니다');
    return { ok: v.length === 0, order: sorted.map((m) => m.label + '(' + TIERS[tierOf(m)] + ')'), violations: v };
  }

  /* ============================================================
     §12·§13 — Mobile Bottom / Tablet Collapsible
     ============================================================ */
  const MOBILE_NAV = { position: 'bottom', items: ['홈', '만들기', '프로젝트', '검색'], hiddenVia: 'search' };
  const TABLET_NAV = { type: 'collapsible-sidebar', collapsed: true, expandOn: 'tap', rows: rows().map((r) => r.label) };
  function mobileAudit() {
    const v = [];
    if (MOBILE_NAV.position !== 'bottom') v.push('Bottom Navigation 아님(§12)');
    if (MOBILE_NAV.items.length > 5) v.push('모바일 ' + MOBILE_NAV.items.length + '개 — ≤5');
    if (!MOBILE_NAV.items.includes('검색')) v.push('숨김 접근 통로(검색) 없음');
    const hits = EXPERT_TOKENS.filter((t) => new RegExp(t, 'i').test(MOBILE_NAV.items.join(' ')));
    if (hits.length) v.push('모바일에 전문가 토큰: ' + hits.join(','));
    return { ok: v.length === 0, nav: MOBILE_NAV, violations: v };
  }
  function tabletAudit() {
    const v = [];
    if (TABLET_NAV.type !== 'collapsible-sidebar') v.push('Collapsible Sidebar 아님(§13)');
    if (TABLET_NAV.collapsed !== true) v.push('기본이 펼침 — 필요할 때만 확장(§13)');
    const same = JSON.stringify(TABLET_NAV.rows) === JSON.stringify(rows().map((r) => r.label));
    if (!same) v.push('태블릿 행이 데스크톱과 다르다 — 일관성 위반');
    return { ok: v.length === 0, nav: TABLET_NAV, violations: v };
  }

  /* ============================================================
     §14 — Expert Workspace: 전문가만 손댄다
     ============================================================ */
  const custom = { rows: null };                          /* null = 기본 구조 사용 */
  const customRows = () => custom.rows ? custom.rows.slice() : rows().map((r) => r.id);
  function customize(usage, op) {
    const lv = S() ? S().levelOf(usage || {}) : 'beginner';
    if (lv !== 'expert') return { ok: false, reason: '전문가(옵트인)만 커스텀 가능(§14)' };
    const cur = customRows();
    const o = op || {};
    if (o.add) {
      if (!S() || !S().MENU[o.add]) return { ok: false, reason: '존재하지 않는 메뉴: ' + o.add };
      if (cur.includes(o.add)) return { ok: false, reason: '이미 있음' };
      if (cur.length >= MAX_ROWS) return { ok: false, reason: '행 ' + MAX_ROWS + ' 초과 불가(§3은 커스텀에도 적용)' };
      custom.rows = cur.concat(o.add);
    } else if (o.remove) {
      if (o.remove === 'home') return { ok: false, reason: '홈은 삭제 불가 — 길의 시작점' };
      if (!cur.includes(o.remove)) return { ok: false, reason: '행에 없음' };
      custom.rows = cur.filter((x) => x !== o.remove);
      if (custom.rows.length < 1) { custom.rows = cur; return { ok: false, reason: '행 0 불가' }; }
    } else if (o.reorder) {
      const re = o.reorder;
      if (re.slice().sort().join() !== cur.slice().sort().join()) return { ok: false, reason: '재배치는 같은 구성 안에서만' };
      custom.rows = re.slice();
    } else return { ok: false, reason: '연산 없음' };
    return { ok: true, rows: custom.rows.slice() };
  }
  const resetCustom = () => { custom.rows = null; };
  function workspaceAudit() {
    resetCustom();
    const v = [];
    if (customize({ edits: 0 }, { add: 'brand' }).ok) v.push('초보자 커스텀이 통과');
    const P = { edits: 20, expertOptIn: true };
    if (!customize(P, { add: 'brand' }).ok) v.push('전문가 추가 실패');
    if (customize(P, { remove: 'home' }).ok) v.push('홈 삭제가 통과');
    if (customize(P, { add: 'dev' }).ok || customRows().length > MAX_ROWS) { if (customRows().length > MAX_ROWS) v.push('6행 초과 허용'); }
    const cur = customRows();
    const rev = cur.slice().reverse();
    if (!customize(P, { reorder: rev }).ok) v.push('재배치 실패');
    if (JSON.stringify(customRows()) !== JSON.stringify(rev)) v.push('재배치 미반영');
    resetCustom();
    return { ok: v.length === 0, violations: v };
  }

  /* ============================================================
     §15 — Navigation Metrics: 4종 · record 유일 경로 · 미실측 null
     ============================================================ */
  const METRIC_KEYS = ['navTime', 'searchRate', 'misclickRate', 'revisitRate'];
  const METRICS = {}; METRIC_KEYS.forEach((k) => METRICS[k] = null);
  function record(key, value) {
    if (!METRIC_KEYS.includes(key)) return { ok: false, reason: '등록 밖 지표: ' + key };
    if (typeof value !== 'number' || !(value >= 0)) return { ok: false, reason: '실측값만' };
    METRICS[key] = value;
    return { ok: true, key, value };
  }
  const metrics = () => ({ ...METRICS });

  /* ============================================================
     §16 — 5초 사용자 테스트: 답이 구조에서 유도된다
     ============================================================ */
  function fiveSecTest() {
    const sorted = rows().slice().sort((a, b) => b.usage - a.usage);
    const firstClick = sorted[0].label;
    const canDo = rows().map((r) => r.why.split(' — ')[0]);
    const confusing = DEFAULT_NAV.filter((m) => banned().some((b) => m.label.toLowerCase().includes(String(b).toLowerCase()))
      || /[A-Za-z]{4,}/.test(m.label)).map((m) => m.label);
    const ok = confusing.length === 0 && rows().length <= MAX_ROWS && countAudit().ok;
    return { ok, questions: ['어떤 메뉴를 먼저 누르겠는가?', '무엇을 할 수 있을 것 같은가?', '혼란스러운 메뉴는 무엇인가?'],
             answers: { firstClick, canDo, confusing } };
  }

  /* ============================================================
     §17 — Deliverables 8종 · Before/After
     ============================================================ */
  function beforeAfter() {
    const s = S();
    const before = s ? Object.values(s.MENU).filter((m) => m.nav).length : 0;
    return {
      before: { rows: before, naming: 'Assets·Export·Workflow…', grasp: '메뉴를 배워야 한다', ai: '메뉴 중 하나' },
      after:  { rows: rows().length, entrance: 1, naming: '내 파일·공유하기·자동화', grasp: '5초 — 읽지 않아도 안다', ai: '이동 방식 그 자체(§7)' },
    };
  }
  function deliverables() {
    const a = menuAudit();
    return {
      structure: { desktop: DEFAULT_NAV, mobile: MOBILE_NAV, tablet: TABLET_NAV },
      deleteList: a.ok ? a.by.delete : [],
      mergeList: a.ok ? a.by.merge : [],
      hideList: a.ok ? a.by.hide : [],
      desktopNav: rows().map((r) => r.label).concat(['(입구) AI']),
      tabletNav: TABLET_NAV,
      mobileNav: MOBILE_NAV,
      beforeAfter: beforeAfter(),
    };
  }
  function deliverablesAudit() {
    const d = deliverables();
    const keys = ['structure', 'deleteList', 'mergeList', 'hideList', 'desktopNav', 'tabletNav', 'mobileNav', 'beforeAfter'];
    const empty = keys.filter((k) => { const x = d[k]; return x == null || (Array.isArray(x) && x.length === 0) || (typeof x === 'object' && !Array.isArray(x) && Object.keys(x).length === 0); });
    return { ok: empty.length === 0, keys, empty };
  }

  /* ============================================================
     §18 — 완료 조건
     ============================================================ */
  function complete() {
    return [menuAudit(), countAudit(), defaultAudit(), expertAudit(), progressiveAudit(),
            aiNavAudit(), searchAudit(), contextAudit(), nameAudit(), priorityAudit(),
            mobileAudit(), tabletAudit(), workspaceAudit(), fiveSecTest(), deliverablesAudit()]
      .every((a) => a.ok);
  }

  return {
    PHILOSOPHY, MAX_ROWS, DEFAULT_NAV, rows, entrance,
    AUDIT_CLASSES, VERDICTS, verdictOf, menuAudit, menuSpecAudit,
    countAudit, countSpecAudit, defaultAudit,
    EXPERT_TOKENS, expertAudit,
    navFor, progressiveAudit,
    INTENTS, routeByIntent, exec, aiNavAudit,
    SHORTCUT, SYNONYMS, searchIndex, search, searchAudit,
    CONTEXT_NAV, contextNav, contextAudit,
    RENAMES, renameJudge, nameAudit,
    TIERS, tierOf, priorityAudit,
    MOBILE_NAV, TABLET_NAV, mobileAudit, tabletAudit,
    customize, customRows, resetCustom, workspaceAudit,
    METRIC_KEYS, record, metrics,
    fiveSecTest, beforeAfter, deliverables, deliverablesAudit, complete,
  };
})();
