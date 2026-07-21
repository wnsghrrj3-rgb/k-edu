/* ============================================================
   K-MAKER Radical Simplification 엔진 (Round 27 — GPT Round 28)
   ------------------------------------------------------------
   window.MK_SIMPLE — "보이는 기능 최소화" 를 판정 가능한 계층으로.
   · 철학(§0): 사용자는 기능을 배우러 오지 않는다 — 결과물을 만들러 온다.
   · 메뉴 5분류(§2): essential / hidden / deleted / ai / expert
   · 첫 화면(§3·§4): 질문 하나 + 허용 4요소 밖은 감사가 거부
   · Progressive Disclosure(§5~§8): beginner→intermediate 자동,
     expert 는 옵트인만(자동 승격 경로 없음)
   · Context UI(§9)·Palette(§11)·3초(§13)·30초(§14)·클릭 예산(§15)
   · Deliverables(§18) 7종 → complete(§19)
   기존 엔진 브리지: MK_FLOW(툴바·명령·검색·여정) · MK_AI(30초 실생성)
   ============================================================ */
window.MK_SIMPLE = (() => {
  const FLOW = () => window.MK_FLOW, AI = () => window.MK_AI;

  /* ============================================================
     §0·§1·§17 — 철학·목표·원칙 (상수가 아니라 판정 입력)
     ============================================================ */
  const PHILOSOPHY = {
    user: '사용자는 기능을 배우러 오지 않는다 — 결과물을 만들러 온다',
    hero: 'UI는 절대 주인공이 아니다 — 콘텐츠가 주인공이다',
  };
  const GOALS = { threeSec: 3, firstOutputMin: 5 };  /* 3초 이해 · 5분 첫 결과물 */
  const PRINCIPLES = [
    { id: 'hide-complexity', text: 'Always Hide Complexity' },
    { id: 'show-purpose', text: 'Always Show Purpose' },
    { id: 'reduce-decisions', text: 'Always Reduce Decisions' },
    { id: 'keep-flow', text: 'Always Keep Flow' },
  ];

  /* ============================================================
     §2 — 메뉴 전수 분류: 필수/숨김/삭제/AI 대체/전문가
     · deleted 는 "노출 삭제" — 라우트·코드는 살아 있다(Bible §0).
     · minUsage 는 hidden 항목의 자연 노출 임계(§7).
     ============================================================ */
  const CLASSES = ['essential', 'hidden', 'deleted', 'ai', 'expert'];
  const MENU = {};
  function register(id, def) {
    if (!id || MENU[id]) return { ok: false, reason: MENU[id] ? 'duplicate' : 'no_id' };
    if (!CLASSES.includes(def.cls)) return { ok: false, reason: 'unknown_class' };
    MENU[id] = { id, label: def.label || id, cls: def.cls, reason: def.reason || '',
                 minUsage: def.cls === 'hidden' ? (def.minUsage || 5) : null, nav: def.nav !== false };
    return { ok: true, item: MENU[id] };
  }
  /* --- 필수: 초보자 첫 화면부터 --- */
  register('home', { label: '홈', cls: 'essential', reason: '시작점 — 질문 하나' });
  register('library', { label: '템플릿', cls: 'essential', reason: '추천 템플릿 = 첫 결과물 최단 경로' });
  register('editor', { label: '편집', cls: 'essential', reason: '결과물을 만드는 자리' });
  register('ai', { label: 'AI', cls: 'essential', reason: '별도 기능이 아니라 전 과정의 파트너(§10)' });
  /* --- 숨김: 숙련도에 따라 자연 노출(§7 — Brand·Asset·Video·Photo) --- */
  register('brand', { label: '브랜드', cls: 'hidden', minUsage: 5, reason: '반복 제작이 시작될 때' });
  register('assets', { label: '에셋', cls: 'hidden', minUsage: 8, reason: '재료를 직접 고르기 시작할 때' });
  register('projects', { label: '내 작업', cls: 'hidden', minUsage: 12, reason: '작업이 쌓였을 때 관리 필요' });
  register('videoMode', { label: '영상 모드', cls: 'hidden', minUsage: 16, nav: false, reason: 'Editor 내 모드 — 정적 제작 숙련 후' });
  register('photoTools', { label: '사진 도구', cls: 'hidden', minUsage: 16, nav: false, reason: 'Editor 내 도구 — 사진 편집 문맥에서만' });
  /* --- 삭제(노출): 없어도 문제가 없음을 확인한 것들(§12) --- */
  register('patterns', { label: 'Patterns', cls: 'deleted', reason: '빈 자리표시 — 내용 없음' });
  register('templates', { label: 'Templates(구)', cls: 'deleted', reason: 'Library 로 대체 — 엔진 메타 검토 전용 라우트만 유지' });
  register('video', { label: 'Video(자리표시)', cls: 'deleted', reason: '기능은 Editor Video 모드에 실존 — 껍데기 화면 불필요' });
  register('photo', { label: 'Photo(자리표시)', cls: 'deleted', reason: '기능은 사진 도구로 실존 — 껍데기 화면 불필요' });
  /* --- AI 대체: 메뉴를 없애고 자연어로(§10) --- */
  register('create', { label: '4단계 만들기 깔때기', cls: 'ai', nav: false, reason: '"4학년 과학 물의 여행 발표 만들어줘" 한 문장이 4클릭을 대체' });
  register('animation', { label: '애니메이션 스튜디오', cls: 'ai', reason: '"애니메이션 더 차분하게" — 프리셋 교체는 AI 명령으로' });
  /* --- 전문가: 원할 때만(§6·§8) --- */
  const EXPERT_IDS = ['export', 'plugins', 'market', 'admin', 'dev', 'team', 'workspace', 'builder',
    'agent', 'flow', 'dls', 'ops', 'mobile', 'foundations', 'components', 'screens'];
  const EXPERT_LABELS = { export: 'Export Studio', plugins: 'Plugin', market: 'Market', admin: 'Admin', dev: 'Developer API', team: 'Team', workspace: 'Workspace', builder: 'Template Builder', agent: 'Agent Studio', flow: 'Flow', dls: 'DLS', ops: 'Ops', mobile: 'Mobile Lab', foundations: 'Foundations', components: 'Components', screens: 'Screens Index' };
  EXPERT_IDS.forEach((id) => register(id, { label: EXPERT_LABELS[id], cls: 'expert', reason: '운영·개발·검수 도구 — 결과물 제작에 불필요' }));

  const byClass = (cls) => Object.values(MENU).filter((m) => m.cls === cls);
  /* §6 — 초보자가 절대 보면 안 되는 것들 */
  const BEGINNER_BANNED = ['export', 'plugins', 'admin', 'dev', 'workspace', 'ops', 'agent', 'market', 'builder'];

  /* ============================================================
     §5~§8 — Progressive Disclosure
     usage = { edits, expertOptIn } — 편집 횟수가 숙련도의 단일 축.
     expert 는 오직 옵트인(§8: "원할 때만 활성화") — 자동 승격 없음.
     ============================================================ */
  const LEVELS = ['beginner', 'intermediate', 'expert'];
  const INTERMEDIATE_AT = 5;                      /* MK_FLOW.PRO_THRESHOLD 와 동일 축 */
  function levelOf(usage) {
    const u = usage || {};
    if (u.expertOptIn === true) return 'expert';
    return (u.edits || 0) >= INTERMEDIATE_AT ? 'intermediate' : 'beginner';
  }
  /* usage 에 따라 이 순간 보이는 기능 전체 */
  function visibleFeatures(usage) {
    const lv = levelOf(usage), edits = (usage && usage.edits) || 0;
    const out = byClass('essential').map((m) => m.id);
    if (lv !== 'beginner') byClass('hidden').forEach((m) => { if (edits >= m.minUsage) out.push(m.id); });
    if (lv === 'expert') byClass('expert').forEach((m) => out.push(m.id));
    return out;
  }
  /* 내비에 실제로 그릴 목록 (nav:false 는 화면 밖 기능) */
  function navFor(usage) {
    const vis = visibleFeatures(usage);
    return vis.filter((id) => MENU[id] && MENU[id].nav);
  }
  /* 다음에 열릴 기능 예고 — "이런 기능도 있었어?" 의 경로(§19) */
  function nextReveal(usage) {
    const edits = (usage && usage.edits) || 0;
    const pend = byClass('hidden').filter((m) => edits < m.minUsage).sort((a, b) => a.minUsage - b.minUsage);
    return pend.length ? { id: pend[0].id, label: pend[0].label, at: pend[0].minUsage, remain: pend[0].minUsage - edits } : null;
  }
  function beginnerAudit() {
    const nav = navFor({ edits: 0 });
    const leaked = BEGINNER_BANNED.filter((b) => nav.includes(b));
    return { ok: leaked.length === 0, nav, leaked };
  }

  /* ============================================================
     §3·§4 — 첫 화면: 질문 하나 + 허용 4요소
     ============================================================ */
  const FIRST_SCREEN = {
    question: '무엇을 만들까요?',
    allowed: ['ai-make', 'recent', 'templates', 'new-project'],
    labels: { 'ai-make': 'AI에게 만들기', recent: '최근 작업', templates: '추천 템플릿', 'new-project': '새 프로젝트' },
  };
  function firstScreenAudit(spec) {
    const s = spec || {};
    const v = [];
    const qs = Array.isArray(s.questions) ? s.questions : (s.question ? [s.question] : []);
    if (qs.length !== 1) v.push('질문은 정확히 하나여야 한다 (현재 ' + qs.length + ')');
    const extra = (s.items || []).filter((i) => !FIRST_SCREEN.allowed.includes(i));
    if (extra.length) v.push('허용 밖 요소: ' + extra.join(', '));
    if ((s.menuCount || 0) > 0) v.push('첫 화면에 메뉴 ' + s.menuCount + '개 노출 — 전부 숨겨야 한다');
    return { ok: v.length === 0, violations: v };
  }
  /* 신규 홈 화면 스펙 — 레벨별 내용물 가변, 레이아웃 단일(§18 산출물 5) */
  function homeSpec(level) {
    const lv = level || 'beginner';
    const base = { question: FIRST_SCREEN.question, items: ['ai-make', 'recent', 'templates', 'new-project'], menuCount: 0, primary: 'ai-make' };
    if (lv !== 'beginner') base.quickCreate = true;      /* 종류 칩은 중급부터 */
    return base;
  }

  /* ============================================================
     §9 — Context UI: 선택한 것에 따라 필요한 메뉴만
     ============================================================ */
  const CTX_MENUS = {
    none: ['add'],                                              /* 아무것도 선택 안 함 = 추가만 */
    text: ['font', 'size', 'color', 'align', 'ai-rewrite'],
    image: ['replace', 'crop', 'filter', 'ai-similar'],
    table: ['rows', 'style', 'to-chart'],
    multi: ['align-group', 'distribute', 'group'],
    scene: ['duration', 'transition', 'ai-anim'],
  };
  function contextMenu(selType) {
    const items = CTX_MENUS[selType] || CTX_MENUS.none;
    const tb = FLOW() ? FLOW().toolbarFor(selType === 'none' ? null : { type: selType }) : null;
    return { selType, items, toolbar: tb ? tb.tools : null, full: false };      /* full=false — 전체 메뉴 상시 노출 금지 */
  }

  /* ============================================================
     §11 — 검색 중심: Command Palette 가 모든 기능의 진입점
     숨김·전문가 기능도 검색으로는 도달 — 발견의 통로.
     ============================================================ */
  function paletteSearch(q, usage) {
    q = String(q || '').trim().toLowerCase();
    if (!q) return { q, items: [], total: 0 };
    const vis = new Set(visibleFeatures(usage || { edits: 0 }));
    const items = Object.values(MENU)
      .filter((m) => m.cls !== 'deleted')
      .filter((m) => (m.label + ' ' + m.id + ' ' + m.reason).toLowerCase().includes(q))
      .map((m) => ({ id: m.id, label: m.label, cls: m.cls, hidden: !vis.has(m.id) }));
    const flowHits = FLOW() ? FLOW().search(q).total : 0;
    return { q, items, total: items.length, flowTotal: flowHits };
  }
  function discovery(usage) {
    const vis = new Set(visibleFeatures(usage || { edits: 0 }));
    const reach = Object.values(MENU).filter((m) => m.cls !== 'deleted' && !vis.has(m.id))
      .filter((m) => paletteSearch(m.label, usage).items.some((i) => i.id === m.id));
    return { hiddenReachable: reach.length, ids: reach.map((m) => m.id) };
  }

  /* ============================================================
     §13 — 3초 테스트: 처음 보는 화면이 세 질문에 답하는가
     ============================================================ */
  function threeSecTest(spec) {
    const s = spec || homeSpec('beginner');
    const what = !!s.question;                                  /* 무엇을 하는 프로그램인가 */
    const where = !!s.primary;                                  /* 어디를 눌러야 하는가 */
    const how = (s.menuCount || 0) === 0 && (s.items || []).length <= 4;  /* 어떻게 시작하는가 — 선택지 과잉 없음 */
    return { pass: what && where && how,
      answers: { what: { ok: what, evidence: s.question || '질문 없음' },
                 where: { ok: where, evidence: s.primary ? '주 행동 = ' + s.primary : '주 행동 불명' },
                 how: { ok: how, evidence: '메뉴 ' + (s.menuCount || 0) + '개 · 선택지 ' + (s.items || []).length + '개' } } };
  }

  /* ============================================================
     §14 — 30초 테스트: 회원가입 없이 첫 결과물
     MK_AI.buildDoc 실호출로 결과물이 실제로 생기는지까지 판정.
     ============================================================ */
  const T30_STEPS = [
    { id: 'open', label: '열기', sec: 1, auth: false },
    { id: 'read', label: '질문 읽기', sec: 3, auth: false },
    { id: 'type', label: '한 문장 입력', sec: 9, auth: false },
    { id: 'build', label: 'AI 생성', sec: 6, auth: false },
    { id: 'see', label: '결과 확인', sec: 3, auth: false },
  ];
  function thirtySecTest(prompt) {
    const total = T30_STEPS.reduce((s, x) => s + x.sec, 0);
    const hasAuth = T30_STEPS.some((x) => x.auth);
    let doc = null, scenes = 0;
    if (AI()) {
      try {
        const a = AI().analyze(prompt || '4학년 과학 물의 여행 발표');
        doc = AI().buildDoc(a); scenes = (doc && doc.scenes ? doc.scenes.length : 0);
      } catch (e) { /* 판정은 아래에서 */ }
    }
    return { steps: T30_STEPS, totalSec: total, within: total <= 30, noSignup: !hasAuth,
             produced: scenes > 0, scenes, pass: total <= 30 && !hasAuth && scenes > 0 };
  }

  /* ============================================================
     §15 — 클릭 예산: 주요 작업 ≤3 · AI = 1클릭/자연어
     ============================================================ */
  function clickAudit() {
    const F = FLOW();
    if (!F) return { ok: false, reason: 'no_flow' };
    const over = F.CMDS.filter((c) => c.clicks > 3).map((c) => c.id);
    const aiNatural = typeof (AI() && AI().analyze) === 'function';   /* 자연어 1입력 경로 실존 */
    return { ok: over.length === 0 && aiNatural, over, max: Math.max(...F.CMDS.map((c) => c.clicks)),
             oneClick: F.CMDS.filter((c) => c.clicks === 1).length + '/' + F.CMDS.length, aiNatural };
  }

  /* ============================================================
     §16 — 시각적 계층: 중요한 것은 크게, 전문 기능은 숨김(=0)
     ============================================================ */
  const HIERARCHY = [
    { role: 'question', size: 34 }, { role: 'ai-input', size: 18 },
    { role: 'cards', size: 14 }, { role: 'meta', size: 12 }, { role: 'expert', size: 0 },
  ];
  function hierarchyAudit() {
    let ok = true;
    for (let i = 1; i < HIERARCHY.length; i++) if (HIERARCHY[i].size > HIERARCHY[i - 1].size) ok = false;
    return { ok, monotonic: ok, expertHidden: HIERARCHY[HIERARCHY.length - 1].size === 0 };
  }

  /* ============================================================
     §18 산출물 4·6 — 신규 메뉴 구조 · 사용자 여정
     ============================================================ */
  function menuStructure() {
    return {
      beginner: navFor({ edits: 0 }),
      intermediate: navFor({ edits: 20 }),
      expert: navFor({ edits: 20, expertOptIn: true }),
      deleted: byClass('deleted').map((m) => m.id),
    };
  }
  const JOURNEY = [
    { id: 'first', label: '첫 방문', spec: '질문 읽기 → 한 문장 → 첫 결과물 (5분 안)', judge: () => thirtySecTest().pass },
    { id: 'return', label: '재방문', spec: '이어서 만들기 1클릭', judge: () => !FLOW() || FLOW().CMDS.some((c) => c.clicks === 1) },
    { id: 'grow', label: '성장', spec: '편집이 쌓이면 기능이 자연히 열린다', judge: () => visibleFeatures({ edits: 20 }).length > visibleFeatures({ edits: 0 }).length },
    { id: 'expert', label: '전문가', spec: '원할 때만 전체 활성화 — 자동 승격 없음', judge: () => levelOf({ edits: 999 }) !== 'expert' && levelOf({ edits: 0, expertOptIn: true }) === 'expert' },
  ];
  function journey() { return JOURNEY.map((j) => ({ id: j.id, label: j.label, spec: j.spec, ok: j.judge() })); }

  /* ============================================================
     §18·§19 — Deliverables 7종 · 완료 조건
     ============================================================ */
  function deliverables() {
    const t3 = threeSecTest();
    return [
      { id: 'delete-list', name: '삭제 목록', data: byClass('deleted'), ready: byClass('deleted').length > 0 },
      { id: 'hidden-list', name: '숨김 목록', data: byClass('hidden'), ready: byClass('hidden').length > 0 },
      { id: 'expert-list', name: '전문가 모드 목록', data: byClass('expert'), ready: byClass('expert').length > 0 },
      { id: 'menu-structure', name: '신규 메뉴 구조', data: menuStructure(), ready: menuStructure().beginner.length <= 5 },
      { id: 'home-screen', name: '신규 홈 화면', data: homeSpec('beginner'), ready: firstScreenAudit(homeSpec('beginner')).ok },
      { id: 'journey', name: '사용자 여정', data: journey(), ready: journey().every((j) => j.ok) },
      { id: 'three-sec', name: '3초 UX 테스트 결과', data: t3, ready: t3.pass },
    ];
  }
  function complete() {
    return deliverables().every((d) => d.ready)
      && beginnerAudit().ok && clickAudit().ok && hierarchyAudit().ok
      && thirtySecTest().pass && discovery({ edits: 0 }).hiddenReachable >= 10;
  }

  /* ============================================================
     공개 표면
     ============================================================ */
  return {
    /* §0·§1·§17 */ PHILOSOPHY, GOALS, PRINCIPLES,
    /* §2 */ CLASSES, MENU, register, byClass, BEGINNER_BANNED, beginnerAudit,
    /* §5~§8 */ LEVELS, INTERMEDIATE_AT, levelOf, visibleFeatures, navFor, nextReveal,
    /* §3·§4 */ FIRST_SCREEN, firstScreenAudit, homeSpec,
    /* §9 */ CTX_MENUS, contextMenu,
    /* §11 */ paletteSearch, discovery,
    /* §13~§16 */ threeSecTest, T30_STEPS, thirtySecTest, clickAudit, HIERARCHY, hierarchyAudit,
    /* §18·§19 */ menuStructure, journey, deliverables, complete,
  };
})();
