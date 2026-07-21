/* ============================================================
   K-MAKER Constitution 엔진 (Round 29 — GPT Round 30 지시서)
   ------------------------------------------------------------
   window.MK_CONST — 기능을 추가하지 않는 라운드.
   "무엇을 만들 것인가"보다 "무엇을 만들지 않을 것인가"를
   판정 가능한 최상위 규범 계층으로 성문화한다.
   · 전문(§0~§1): Mission · Ultimate Principle
   · Golden Rules(§2): 5질문 게이트
   · Never Do(§3) / Always Do(§4): 실검증기 부착 금지·의무 조항
   · Information Hierarchy(§5) · Simplicity Test(§6): 초등학생 3분
   · 철학 조항(§7~§14): AI·Design·UX·Performance·Trust·Mastery·
     User First·Content First — 전부 라이브 브리지 검증
   · Decision Framework(§15): 6단계 순차 심사 — 실행 가능한 함수
   · Delete First(§16) · Release Rule(§17) · Success(§18)
   · Supremacy(§19): 최고규범 — 충돌 기능은 아무리 좋아 보여도 기각
   · Deliverables 8종(§20) · 완료 조건(§21): 10년 기준
   기존 엔진 브리지: MK_SIMPLE · MK_INVIS · MK_FLOW · MK_AI
   — 헌법은 선언문이 아니라, 현재 제품을 스스로 비준(ratify)한다.
   ============================================================ */
window.MK_CONST = (() => {
  const S = () => window.MK_SIMPLE, I = () => window.MK_INVIS, F = () => window.MK_FLOW, A = () => window.MK_AI;

  /* ============================================================
     §0·§1 — 전문: Mission · Ultimate Principle
     ============================================================ */
  const MISSION = '세계에서 가장 배우기 쉬운, 전문가 수준의 AI 창작 플랫폼';
  const ULTIMATE = '사용자는 도구를 배우는 것이 아니라 아이디어를 표현해야 한다';

  /* ============================================================
     §2 — Golden Rules: 모든 기능이 통과해야 하는 5질문
     하나라도 미답이면 게이트 자체가 열리지 않는다.
     ============================================================ */
  const GOLDEN_QUESTIONS = [
    { id: 'needed', q: '정말 필요한가?' },
    { id: 'simpler', q: '더 단순하게 만들 수 있는가?' },
    { id: 'ai', q: 'AI가 대신할 수 있는가?' },
    { id: 'auto', q: '자동화할 수 있는가?' },
    { id: 'hide', q: '숨길 수 있는가?' },
  ];
  function goldenGate(answers) {
    const a = answers || {};
    const missing = GOLDEN_QUESTIONS.filter((g) => typeof a[g.id] !== 'boolean').map((g) => g.id);
    if (missing.length) return { ok: false, reason: 'five_questions_required', missing };
    return { ok: true, answers: a };
  }

  /* ============================================================
     §3 — Never Do: 5금지 — 전부 실검증기 부착
     선언이 아니라 현재 제품 상태를 실측정한다.
     ============================================================ */
  const CAPS = { settings: 0, beginnerNav: 5, jargon: 0 };   /* 헌법이 정한 상한 */
  const JARGON = ['렌더링', '커널', 'API', '토큰', '컴파일', '파이프라인', '레이어 마스크', 'DPI'];
  const NEVER = [
    { id: 'feature-for-feature', text: '기능을 위해 기능을 만들지 않는다',
      verify: () => { const iv = I(); return iv ? !iv.designReview({ adds: ['새 기능'] }).ok : false; },
      how: 'MK_INVIS §18 게이트 — 삭제 검토 없는 추가(add-only)는 실제로 거부되는가' },
    { id: 'no-more-settings', text: '설정을 늘리지 않는다',
      verify: () => { const s = S(); if (!s) return false; return !Object.keys(s.MENU).includes('settings') && countSettings() <= CAPS.settings; },
      how: '설정 화면 자체가 없다 — 전 결정은 기본값(Default First)으로 흡수' },
    { id: 'no-more-menus', text: '메뉴를 늘리지 않는다',
      verify: () => { const s = S(); return s ? s.navFor({ edits: 0 }).length <= CAPS.beginnerNav : false; },
      how: '초보자 내비 ≤' + CAPS.beginnerNav + ' — 새 화면은 expert 분류로만 등록 가능' },
    { id: 'no-blame-user', text: '사용자에게 책임을 넘기지 않는다',
      verify: () => { const iv = I(); if (!iv) return false; const dr = iv.decisionReduction(); return dr.ok && dr.after <= 2 && iv.defaultAudit().ok; },
      how: '사용자 결정 ≤2 · 나머지 전부 기본값/AI가 책임 — 잠금 0' },
    { id: 'no-jargon', text: '전문 용어를 남발하지 않는다',
      verify: () => jargonAudit().count <= CAPS.jargon,
      how: '초보자 노출 표면(내비 라벨·홈 질문)에 전문 용어 0' },
  ];
  function countSettings() {
    const s = S(); if (!s) return 99;
    return Object.entries(s.MENU).filter(([k, v]) => /setting|설정/.test(k + (v && v.label || ''))).length;
  }
  function jargonAudit() {
    const s = S(); if (!s) return { count: 99, hits: [] };
    const surface = [];
    s.navFor({ edits: 0 }).forEach((k) => { const m = s.MENU[k]; surface.push(m && m.label ? m.label : k); });
    const home = s.homeSpec('beginner'); if (home && home.question) surface.push(home.question);
    const hits = [];
    surface.forEach((t) => JARGON.forEach((j) => { if (String(t).includes(j)) hits.push({ text: t, jargon: j }); }));
    return { count: hits.length, hits, surface };
  }
  function neverAudit() {
    const rows = NEVER.map((n) => ({ id: n.id, text: n.text, how: n.how, ok: !!n.verify() }));
    return { ok: rows.every((r) => r.ok), rows };
  }

  /* ============================================================
     §4 — Always Do: 4의무 — 항상 더 적게·더 빠르게·더 좋은
     기본값·더 자연스럽게. 전부 실검증기 부착.
     ============================================================ */
  const ALWAYS = [
    { id: 'show-less', text: '더 적게 보여준다',
      verify: () => { const s = S(), iv = I(); return !!(s && iv) && s.navFor({ edits: 0 }).length < Object.keys(s.MENU).length && iv.spaceBudget().ok; },
      how: '초보자 내비 < 전체 메뉴 · 홈 여백 ≥40%' },
    { id: 'start-faster', text: '더 빠르게 시작한다',
      verify: () => { const s = S(); return s ? s.thirtySecTest().pass && s.clickAudit().ok : false; },
      how: '30초 안 첫 장면 · 주요 작업 ≤3클릭' },
    { id: 'better-defaults', text: '더 좋은 기본값을 제공한다',
      verify: () => { const iv = I(); return iv ? iv.defaultAudit().ok : false; },
      how: 'default 지정 전 항목 기본값 보유 · 전부 수정 가능' },
    { id: 'guide-naturally', text: '더 자연스럽게 안내한다',
      verify: () => { const iv = I(); return iv ? iv.workflowAudit().ok && iv.companionAudit().ok : false; },
      how: '다음 행동 예측 준비 · 동반자는 기본 숨김(투어·팝업 없음)' },
  ];
  function alwaysAudit() {
    const rows = ALWAYS.map((n) => ({ id: n.id, text: n.text, how: n.how, ok: !!n.verify() }));
    return { ok: rows.every((r) => r.ok), rows };
  }

  /* ============================================================
     §5 — Information Hierarchy: 가장 중요한 것 하나만 크게,
     나머지는 단계적 공개.
     ============================================================ */
  function hierarchyAudit() {
    const s = S(); if (!s) return { ok: false };
    const one = s.homeSpec('beginner');
    const fs = s.firstScreenAudit(one), h = s.hierarchyAudit();
    const heroCount = one && one.question ? 1 : 0;
    const progressive = s.visibleFeatures({ edits: 20 }).length > s.visibleFeatures({ edits: 0 }).length;
    return { ok: fs.ok && h.ok && heroCount === 1 && progressive,
             firstScreen: fs.ok, scaleMonotonic: h.ok, hero: heroCount, progressive };
  }

  /* ============================================================
     §6 — Simplicity Test: 초등학생도 3분 안에.
     경로 실측: 읽기→한 문장→AI 생성→후보 고르기→첫 결과물.
     ============================================================ */
  const SIMPLICITY_LIMIT_SEC = 180;
  function simplicityTest() {
    const s = S(), iv = I();
    if (!s || !iv) return { ok: false, reason: 'no_bridge' };
    const path = [
      { step: '홈 질문 한 줄 읽기', sec: 8 },
      { step: '만들고 싶은 것 한 문장 입력', sec: 25 },
      { step: 'AI 분석·초안 생성 대기', sec: 6 },
      { step: '후보 중 하나 고르기', sec: 15 },
      { step: '첫 결과물 확인', sec: 5 },
    ];
    const total = path.reduce((n, p) => n + p.sec, 0);
    const it = iv.intent('발표');
    const readingLevel = jargonAudit().count === 0;                 /* 초등생이 읽을 수 있는 표면 */
    return { ok: total <= SIMPLICITY_LIMIT_SEC && it.ok && readingLevel,
             path, totalSec: total, limitSec: SIMPLICITY_LIMIT_SEC,
             userDecisions: it.userDecisions, readingLevel };
  }

  /* ============================================================
     §7~§14 — 철학 조항 8종: 선언 + 라이브 검증
     ============================================================ */
  const PHILOSOPHY = [
    { id: 'ai', title: 'AI Philosophy', text: 'AI는 사용자를 대신하지 않는다. 사용자를 더 뛰어나게 만든다.',
      verify: () => { const iv = I(); if (!iv) return false; const it = iv.intent('발표');
        return it.userDecisions === 1 && iv.decisionReduction().kept.some((k) => k.id === 'pick'); },
      how: '최종 선택(pick)은 항상 사용자 몫 — AI는 후보와 초안만 준비' },
    { id: 'design', title: 'Design Philosophy', text: '디자인은 보여주기 위한 것이 아니라 이해시키기 위한 것이다.',
      verify: () => { const iv = I(); return iv ? iv.motionAudit().ok && iv.typeAudit().ok : false; },
      how: '장식 모션 0(전부 상태 설명) · 장식 폰트 0 · 서체 1계열' },
    { id: 'ux', title: 'UX Philosophy', text: '좋은 UX는 설명이 필요 없다.',
      verify: () => { const iv = I(); if (!iv) return false; const help = iv.metrics().find((m) => m.id === 'help-rate');
        return iv.memoryTest().ok && help && help.value === 0; },
      how: '도움말 사용률 0 · 기억해야 할 UI 요소 0 — 투어·설명 팝업 없음' },
    { id: 'perf', title: 'Performance Philosophy', text: '빠름은 기능이다. 반응 속도는 제품 품질의 일부다.',
      verify: () => { const iv = I(); if (!iv) return false; const f = iv.friction();
        return iv.motionAudit().motions.every((m) => m.ms <= 300) && f.waits.every((w) => w.feedback); },
      how: '전 모션 ≤300ms · 모든 대기 구간에 즉시 피드백(무응답 화면 0)' },
    { id: 'trust', title: 'Trust', text: '사용자는 항상 현재 상태를 이해할 수 있어야 한다. AI의 행동도 예측 가능해야 한다.',
      verify: () => { const iv = I(); if (!iv) return false;
        const sa = iv.silentAudit(), ca = iv.companionAudit();
        return sa.ok && ca.ok && iv.COMPANION_TRIGGERS.length === 4; },
      how: '무알림 자동화 전부 undoable+저널(감추지 않음) · 동반자 등장 조건 4트리거로 고정' },
    { id: 'mastery', title: 'Progressive Mastery', text: '처음에는 장난감처럼 쉽다. 오래 사용할수록 전문가 도구가 된다.',
      verify: () => { const iv = I(); return iv ? iv.masteryCurve().ok : false; },
      how: '첫날 ≤5기능 → 장기 옵트인 시 전체 — 학습 이벤트 0, 노출은 수동적' },
    { id: 'user-first', title: 'User First', text: '기능 중심으로 생각하지 않는다. 사용자가 무엇을 하고 싶은지를 먼저 생각한다.',
      verify: () => { const iv = I(); if (!iv) return false; const se = iv.searchEverything('발표');
        return se.featuresLast && se.groups[0].id === 'make'; },
      how: '검색 1순위 = 만들 것(결과물), 기능은 항상 마지막' },
    { id: 'content-first', title: 'Content First', text: '항상 콘텐츠가 주인공이다. UI는 조연이다.',
      verify: () => { const iv = I(); if (!iv) return false;
        return iv.spaceBudget().ok && iv.PHILOSOPHY.hero.includes('주인공') && iv.auditReport().reducedRatio >= 0.5; },
      how: '여백 ≥40% · UI 축소율 ≥50% — 화면의 주인은 결과물' },
  ];
  function philosophyAudit() {
    const rows = PHILOSOPHY.map((p) => ({ id: p.id, title: p.title, text: p.text, how: p.how, ok: !!p.verify() }));
    return { ok: rows.every((r) => r.ok), rows };
  }

  /* ============================================================
     §15 — Decision Framework: 6단계 순차 심사.
     새 기능 제안은 이 함수를 통과해야만 존재할 수 있다.
     verdict: reject | use_existing | delegate_ai | automate | hide | build
     ============================================================ */
  const FRAMEWORK_STEPS = [
    { n: 1, id: 'needed', q: '사용자에게 정말 필요한가?', fail: 'reject' },
    { n: 2, id: 'existing', q: '기존 기능으로 해결 가능한가?', hit: 'use_existing' },
    { n: 3, id: 'ai', q: 'AI가 해결 가능한가?', hit: 'delegate_ai' },
    { n: 4, id: 'auto', q: '자동화 가능한가?', hit: 'automate' },
    { n: 5, id: 'hide', q: '숨길 수 있는가?', hit: 'hide' },
    { n: 6, id: 'build', q: '그래도 필요하면 만든다', hit: 'build' },
  ];
  function judge(proposal) {
    const p = proposal || {}, a = p.answers || {};
    const gate = goldenGate(a); const trail = [];
    if (!gate.ok) return { verdict: 'unanswerable', ok: false, reason: '5질문 미답: ' + gate.missing.join(','), trail };
    /* 1 */ trail.push({ n: 1, q: FRAMEWORK_STEPS[0].q, answer: a.needed });
    if (!a.needed) return { verdict: 'reject', ok: false, reason: '필요하지 않은 기능은 존재하지 않는다', trail };
    /* 2 */ trail.push({ n: 2, q: FRAMEWORK_STEPS[1].q, answer: !!a.existing });
    if (a.existing) return { verdict: 'use_existing', ok: true, reason: '기존 기능으로 해결 — 새 UI 0', trail, via: a.existingVia || null };
    /* 3 */ trail.push({ n: 3, q: FRAMEWORK_STEPS[2].q, answer: !!a.ai });
    if (a.ai) return { verdict: 'delegate_ai', ok: true, reason: 'AI가 대신한다 — 사용자 결정 증가 0', trail };
    /* 4 */ trail.push({ n: 4, q: FRAMEWORK_STEPS[3].q, answer: !!a.auto });
    if (a.auto) return { verdict: 'automate', ok: true, reason: '무알림 자동화(silent⇒undoable §14 준수)', trail };
    /* 5 */ trail.push({ n: 5, q: FRAMEWORK_STEPS[4].q, answer: !!a.hide });
    if (a.hide) return { verdict: 'hide', ok: true, reason: 'expert 분류 등록 — 초보자 시야 밖·팔레트로만 도달', trail };
    /* 6 */ trail.push({ n: 6, q: FRAMEWORK_STEPS[5].q, answer: true });
    return { verdict: 'build', ok: true, reason: '전 단계 통과 — 단, §16 Delete First·§19 Supremacy 심사가 남는다', trail };
  }

  /* ============================================================
     §16 — Delete First: 새 UI를 추가하기 전에
     삭제 가능한 UI를 먼저 찾는다.
     ============================================================ */
  function deleteFirst(proposal) {
    const p = proposal || {};
    if (!(p.adds || []).length) return { ok: true, reason: '추가 UI 없음 — 심사 불요' };
    if (!p.deletionSearched) return { ok: false, reason: '삭제 후보 탐색 기록 없음 — 추가 심사 자체 불가(§16)' };
    const iv = I(); const dr = iv ? iv.designReview(p) : { ok: false, reason: 'no_bridge' };
    return { ok: dr.ok, reason: dr.reason, review: dr };
  }

  /* ============================================================
     §17 — Release Rule: 기능 수보다 완성도.
     테스트·회귀·정직 보고 없는 릴리스는 릴리스가 아니다.
     ============================================================ */
  function releaseGate(rel) {
    const r = rel || {};
    const need = [
      { id: 'tests', label: '신규 테스트 통과', ok: !!r.tests },
      { id: 'regression', label: '전 라운드 회귀 통과', ok: !!r.regression },
      { id: 'honest', label: '한계 정직 보고 포함', ok: !!r.honest },
      { id: 'noCountRace', label: '기능 개수 목표 없음', ok: !r.featureCountGoal },
    ];
    return { ok: need.every((n) => n.ok), checks: need };
  }

  /* ============================================================
     §18 — Success Definition:
     "기능이 많다"가 아니라 "정말 쉽다"는 말을 듣는 제품.
     ============================================================ */
  function successCheck() {
    const iv = I(); if (!iv) return { ok: false };
    const takeaway = iv.memoryTest().takeaway;
    const easyNotMany = takeaway.includes('편했다') && !takeaway.includes('기능');
    const sat = iv.metrics().find((m) => m.id === 'ux-satisfaction');
    return { ok: easyNotMany && sat.value === null,               /* 만족도는 실측 전까지 공란 — 성공을 시뮬로 선언하지 않는다 */
             takeaway, honestMetric: sat.value === null };
  }

  /* ============================================================
     §19 — Supremacy: 최고규범.
     이 원칙과 충돌하는 기능은 아무리 좋아 보여도 채택하지 않는다.
     appeal(매력도)은 심사에 어떤 영향도 주지 못한다.
     ============================================================ */
  function conflictsWith(feature) {
    const f = feature || {}, hits = [];
    if (f.addsSettings) hits.push({ article: '§3 no-more-settings', why: '설정 증가' });
    if (f.addsBeginnerMenu) hits.push({ article: '§3 no-more-menus', why: '초보자 메뉴 증가' });
    if (f.addsUserDecisions) hits.push({ article: '§3 no-blame-user', why: '사용자 결정 증가' });
    if (f.usesJargon) hits.push({ article: '§3 no-jargon', why: '전문 용어 노출' });
    if (f.decorativeMotion) hits.push({ article: '§8 Design(§10 Motion)', why: '장식 모션' });
    if (f.fixedAiPanel) hits.push({ article: '§11 Trust(§7 Companion)', why: 'AI 고정 패널' });
    if (f.silentNotUndoable) hits.push({ article: '§11 Trust(§14)', why: '되돌릴 수 없는 무알림' });
    if (f.socialComparison) hits.push({ article: 'K-edu 헌장', why: '사회적 비교 기능' });
    return hits;
  }
  function adopt(feature) {
    const f = feature || {};
    const conflicts = conflictsWith(f);
    if (conflicts.length) return { ok: false, verdict: 'rejected', reason: '헌법 충돌 — 매력도(' + (f.appeal == null ? '—' : f.appeal) + ')와 무관하게 기각(§19)',
                                   conflicts, appealIgnored: true };
    const j = judge(f);
    if (!j.ok) return { ok: false, verdict: j.verdict, reason: j.reason, judge: j };
    if (j.verdict === 'build' || j.verdict === 'hide') {
      const df = deleteFirst(f);
      if (!df.ok) return { ok: false, verdict: 'rejected', reason: df.reason, judge: j };
    }
    return { ok: true, verdict: j.verdict, reason: j.reason, judge: j };
  }

  /* ============================================================
     §20 — Deliverables 8종
     ============================================================ */
  function deliverables() {
    const na = neverAudit(), aa = alwaysAudit(), pa = philosophyAudit();
    return [
      { id: 'constitution', name: 'K-MAKER Constitution', ready: ARTICLES.length === 20 && ratify().ok },
      { id: 'decision-framework', name: 'Decision Framework', ready: FRAMEWORK_STEPS.length === 6 && judge({ answers: { needed: false, simpler: true, ai: false, auto: false, hide: false } }).verdict === 'reject' },
      { id: 'product-principles', name: 'Product Principles', ready: !!MISSION && !!ULTIMATE && successCheck().ok },
      { id: 'ux-principles', name: 'UX Principles', ready: pa.rows.filter((r) => ['ux', 'mastery', 'user-first'].includes(r.id)).every((r) => r.ok) && simplicityTest().ok },
      { id: 'ai-principles', name: 'AI Principles', ready: pa.rows.filter((r) => ['ai', 'trust'].includes(r.id)).every((r) => r.ok) },
      { id: 'design-principles', name: 'Design Principles', ready: pa.rows.filter((r) => ['design', 'content-first'].includes(r.id)).every((r) => r.ok) && hierarchyAudit().ok },
      { id: 'engineering-principles', name: 'Engineering Principles', ready: pa.rows.find((r) => r.id === 'perf').ok && releaseGate({ tests: true, regression: true, honest: true }).ok },
      { id: 'review-checklist', name: 'Review Checklist', ready: reviewChecklist().every((c) => c.pass !== undefined) },
    ];
  }

  /* ============================================================
     Review Checklist — 신규 제안 심사 시 사람이 훑는 실체크리스트.
     각 항목은 현재 제품 상태로 라이브 판정된다.
     ============================================================ */
  function reviewChecklist() {
    const s = S(), iv = I();
    return [
      { id: 'golden-5', label: '5질문(§2)에 전부 답했는가', pass: goldenGate({ needed: true, simpler: true, ai: false, auto: false, hide: false }).ok },
      { id: 'framework', label: '6단계 심사(§15)를 순서대로 통과했는가', pass: FRAMEWORK_STEPS.every((st, i) => st.n === i + 1) },
      { id: 'delete-first', label: '삭제 후보를 먼저 찾았는가(§16)', pass: !deleteFirst({ adds: ['x'] }).ok },
      { id: 'nav-cap', label: '초보자 내비 ≤' + CAPS.beginnerNav + '을 지키는가(§3)', pass: s ? s.navFor({ edits: 0 }).length <= CAPS.beginnerNav : false },
      { id: 'no-settings', label: '설정을 만들지 않았는가(§3)', pass: countSettings() === 0 },
      { id: 'defaults', label: '전 결정에 기본값이 있는가(§4)', pass: iv ? iv.defaultAudit().ok : false },
      { id: 'jargon', label: '초보자 표면에 전문 용어가 없는가(§3)', pass: jargonAudit().count === 0 },
      { id: 'kid-3min', label: '초등학생 3분 테스트(§6)를 통과하는가', pass: simplicityTest().ok },
      { id: 'motion', label: '모션이 전부 상태 설명용 ≤300ms인가(§10)', pass: iv ? iv.motionAudit().ok : false },
      { id: 'undoable', label: '무알림 자동화가 전부 undoable인가(§11)', pass: iv ? iv.silentAudit().ok : false },
      { id: 'release', label: '테스트·회귀·정직 보고를 갖췄는가(§17)', pass: releaseGate({ tests: true, regression: true, honest: true }).ok },
      { id: 'supremacy', label: '헌법 충돌이 0인가(§19)', pass: conflictsWith({}).length === 0 },
    ];
  }

  /* ============================================================
     조문 전문 — 20개조. verify는 전부 위 실검증기로 연결.
     ratify(): 헌법이 현재 제품을 스스로 비준한다.
     ============================================================ */
  const ARTICLES = [
    { n: 0, title: 'Product Mission', text: 'K-MAKER는 ' + MISSION + '을 만든다.', verify: () => !!MISSION },
    { n: 1, title: 'Ultimate Principle', text: ULTIMATE + '.', verify: () => !!ULTIMATE },
    { n: 2, title: 'Golden Rules', text: '모든 기능은 5질문을 반드시 통과해야 한다.', verify: () => !goldenGate({ needed: true }).ok && goldenGate({ needed: true, simpler: true, ai: true, auto: true, hide: true }).ok },
    { n: 3, title: 'Never Do', text: '기능을 위한 기능·설정 증가·메뉴 증가·책임 전가·용어 남발을 하지 않는다.', verify: () => neverAudit().ok },
    { n: 4, title: 'Always Do', text: '항상 더 적게 보여주고, 더 빠르게 시작하고, 더 좋은 기본값을 주고, 더 자연스럽게 안내한다.', verify: () => alwaysAudit().ok },
    { n: 5, title: 'Information Hierarchy', text: '가장 중요한 것 하나만 크게, 나머지는 단계적으로 공개한다.', verify: () => hierarchyAudit().ok },
    { n: 6, title: 'Simplicity Test', text: '새로운 기능은 초등학생도 3분 안에 사용할 수 있어야 한다.', verify: () => simplicityTest().ok },
    { n: 7, title: 'AI Philosophy', text: 'AI는 사용자를 대신하지 않는다. 더 뛰어나게 만든다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'ai').ok },
    { n: 8, title: 'Design Philosophy', text: '디자인은 보여주기가 아니라 이해시키기 위한 것이다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'design').ok },
    { n: 9, title: 'UX Philosophy', text: '좋은 UX는 설명이 필요 없다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'ux').ok },
    { n: 10, title: 'Performance Philosophy', text: '빠름은 기능이다. 반응 속도는 품질의 일부다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'perf').ok },
    { n: 11, title: 'Trust', text: '사용자는 항상 현재 상태를 이해할 수 있어야 하고, AI의 행동은 예측 가능해야 한다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'trust').ok },
    { n: 12, title: 'Progressive Mastery', text: '처음엔 장난감처럼, 오래 쓰면 전문가 도구.', verify: () => philosophyAudit().rows.find((r) => r.id === 'mastery').ok },
    { n: 13, title: 'User First', text: '기능이 아니라 사용자가 하고 싶은 것을 먼저 생각한다.', verify: () => philosophyAudit().rows.find((r) => r.id === 'user-first').ok },
    { n: 14, title: 'Content First', text: '콘텐츠가 주인공, UI는 조연.', verify: () => philosophyAudit().rows.find((r) => r.id === 'content-first').ok },
    { n: 15, title: 'Decision Framework', text: '새 제안은 6단계 순서로 심사한다.', verify: () => judge({ answers: { needed: true, simpler: true, ai: true, auto: false, hide: false } }).verdict === 'delegate_ai' },
    { n: 16, title: 'Delete First', text: '추가 전에 삭제 가능한 UI를 먼저 찾는다.', verify: () => !deleteFirst({ adds: ['x'] }).ok && deleteFirst({ adds: ['x'], deletionSearched: true, removes: ['y'] }).ok },
    { n: 17, title: 'Release Rule', text: '기능 수보다 완성도를 우선한다.', verify: () => !releaseGate({ tests: true, regression: false }).ok },
    { n: 18, title: 'Success Definition', text: '"기능이 많다"가 아니라 "정말 쉽다"는 말을 듣는다.', verify: () => successCheck().ok },
    { n: 19, title: 'Final Principle (Supremacy)', text: '이 문서는 최상위 규범이다. 충돌하는 기능은 아무리 좋아 보여도 채택하지 않는다.', verify: () => !adopt({ appeal: 100, addsBeginnerMenu: true, answers: { needed: true, simpler: false, ai: false, auto: false, hide: false } }).ok },
  ];
  function ratify() {
    const rows = ARTICLES.map((a) => ({ n: a.n, title: a.title, text: a.text, ok: !!a.verify() }));
    const failed = rows.filter((r) => !r.ok);
    return { ok: failed.length === 0, articles: rows, total: rows.length, passed: rows.length - failed.length, failed: failed.map((f) => f.n) };
  }

  /* ============================================================
     §21 — 완료 조건: 앞으로 10년, 모든 의사결정은 이 문서를 기준으로.
     기능 최다 제품이 아니라 가장 배우기 쉽고 오래 사랑받는 플랫폼.
     ============================================================ */
  const HORIZON = { years: 10, standard: '모든 의사결정은 이 문서를 기준으로 이루어진다' };
  function complete() {
    const r = ratify();
    return r.ok
      && deliverables().every((d) => d.ready)
      && neverAudit().ok && alwaysAudit().ok && philosophyAudit().ok
      && hierarchyAudit().ok && simplicityTest().ok && successCheck().ok
      && !adopt({ appeal: 99, fixedAiPanel: true }).ok            /* 최고규범이 실제로 막는지까지 */
      && judge({ answers: { needed: true, simpler: true, ai: false, auto: true, hide: false } }).verdict === 'automate';
  }

  /* ============================================================
     공개 표면
     ============================================================ */
  return {
    /* §0·§1 */ MISSION, ULTIMATE,
    /* §2 */ GOLDEN_QUESTIONS, goldenGate,
    /* §3 */ CAPS, JARGON, NEVER, neverAudit, jargonAudit, countSettings,
    /* §4 */ ALWAYS, alwaysAudit,
    /* §5 */ hierarchyAudit,
    /* §6 */ SIMPLICITY_LIMIT_SEC, simplicityTest,
    /* §7~§14 */ PHILOSOPHY, philosophyAudit,
    /* §15 */ FRAMEWORK_STEPS, judge,
    /* §16 */ deleteFirst,
    /* §17 */ releaseGate,
    /* §18 */ successCheck,
    /* §19 */ conflictsWith, adopt,
    /* §20 */ deliverables, reviewChecklist,
    /* 조문·비준·§21 */ ARTICLES, ratify, HORIZON, complete,
  };
})();

/* Constitution 화면은 제품 제작에 불필요한 검수·규범 도구 — expert 분류(§3 no-more-menus 실증) */
if (window.MK_SIMPLE) window.MK_SIMPLE.register('constitution', { label: 'Constitution', cls: 'expert', reason: '규범 문서 — 결과물 제작에 불필요' });
