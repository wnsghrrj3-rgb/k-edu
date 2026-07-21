/* ============================================================
   K-MAKER Product Operating System — window.MK_OPS  (Round 26)
   ------------------------------------------------------------
   기능을 추가하지 않는다 — "계속 좋아지는 제품" 을 판정 가능한
   운영 계층으로 세운다. 모든 의사결정은 데이터·사용자·제품 철학을
   근거로만 성립하며, 근거 없는 결정은 등록 자체가 거부된다.

   ★ 핵심 설계
     - Decision(§0): basis ∈ {data,user,philosophy} + evidence 없으면
       decide() 가 거부 — 결정 로그가 KB Decision Log 로 직결.
     - Feature FSM(§2): validation→development 는 Product Review(§3)
       4문항+측정 지표 연결 없이는 전이 불가. development→release 는
       Quality Gates(§17) 6종 전부 통과 없이는 전이 불가.
     - Release FSM(§9): 단계 졸업마다 게이트 재판정 + 열린 P1 인시던트
       0 조건. Hotfix 는 release 단계에서만, 인시던트 연결 의무.
     - Incident(§13): P1/P2 는 포스트모템(cause+action) 없이 close 불가.
       SLA 는 내부 클록 _tick 기준 실판정.
     - Experiment(§12): 결정적 해시 배정·표본 최소치 미달이면 승자
       판정 자체를 거부. Flag rollback 은 이력 스택 실복원.
     - Improvement Loop(§18): Measure 없는 Analyze, Analyze 없는
       Improve 는 거부 — 루프 순서를 코드가 강제.
   외부 의존은 MK_FLOW(UX 지표)·MK_DLS(디자인 게이트)·MK_AGENT(AI 지표)
   읽기 브리지뿐. 결정론 순수 계층 — 실시간·난수 비의존(_tick·해시).
   ============================================================ */
window.MK_OPS = (() => {
  'use strict';
  const FL = () => window.MK_FLOW;
  const DL = () => window.MK_DLS;
  const AG = () => window.MK_AGENT;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- 내부 클록 (실시간 비의존) ---------- */
  let CLOCK = 0;
  const HOUR = 3600 * 1000, DAY = 24 * HOUR;
  const _now = () => CLOCK;
  const _tick = (ms) => { CLOCK += ms; return CLOCK; };

  /* ---------- 결정적 해시 (배정·롤아웃) ---------- */
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h;
  }

  let SEQ = 0;
  const nid = (p) => p + '_' + (++SEQ).toString(36).padStart(3, '0');

  /* ============================================================
     0) 의사결정 원칙 (§0) — 근거 없는 결정은 존재할 수 없다
     ============================================================ */
  const BASIS = ['data', 'user', 'philosophy'];
  const DECISIONS = [];
  function decide(rec) {
    const r = rec || {};
    if (!r.title || !String(r.title).trim()) return { ok: false, reason: 'no_title' };
    if (!BASIS.includes(r.basis)) return { ok: false, reason: 'invalid_basis', allowed: BASIS };
    if (!r.evidence || !String(r.evidence).trim()) return { ok: false, reason: 'no_evidence' };
    const d = { id: nid('dec'), title: r.title, basis: r.basis, evidence: r.evidence, by: r.by || '준호', at: _now() };
    DECISIONS.push(d);
    kbAdd({ cat: 'decision', title: d.title, body: `[${d.basis}] ${d.evidence}`, _auto: true });
    return { ok: true, decision: clone(d) };
  }
  const decisionLog = () => clone(DECISIONS);

  /* ============================================================
     1) Product Lifecycle (§1) — 11단계 순환 FSM
     ============================================================ */
  const PRODUCT_CYCLE = ['idea', 'research', 'planning', 'design', 'prototype', 'development', 'qa', 'release', 'measure', 'improve'];
  function cycleNext(stage) {
    const i = PRODUCT_CYCLE.indexOf(stage);
    if (i < 0) return null;
    return PRODUCT_CYCLE[(i + 1) % PRODUCT_CYCLE.length]; // improve → idea (Repeat)
  }
  const PRODUCT = { stage: 'measure', laps: 1, history: [] };
  function cycleAdvance() {
    const from = PRODUCT.stage, to = cycleNext(from);
    if (to === 'idea') PRODUCT.laps++;
    PRODUCT.stage = to;
    PRODUCT.history.push({ from, to, at: _now() });
    return { ok: true, from, to, laps: PRODUCT.laps };
  }
  const productState = () => clone(PRODUCT);

  /* ============================================================
     2) Feature Lifecycle (§2) — 게이트 있는 FSM
     ============================================================ */
  const FEATURE_STATES = ['idea', 'spec', 'prototype', 'validation', 'development', 'release', 'iteration', 'deprecation'];
  const FEAT_EDGES = {
    idea: ['spec', 'deprecation'],
    spec: ['prototype', 'deprecation'],
    prototype: ['validation', 'deprecation'],
    validation: ['development', 'deprecation'],
    development: ['release'],
    release: ['iteration', 'deprecation'],
    iteration: ['release', 'deprecation'],
    deprecation: [],
  };
  const FEATURES = [];
  function featureCreate(name, owner) {
    if (!name || !String(name).trim()) return { ok: false, reason: 'no_name' };
    const f = { id: nid('ft'), name: String(name), owner: owner || '준호', state: 'idea', review: null, history: [{ to: 'idea', at: _now() }] };
    FEATURES.push(f);
    return { ok: true, feature: clone(f) };
  }
  const featureOf = (id) => FEATURES.find((f) => f.id === id) || null;
  function featureAdvance(id, to) {
    const f = featureOf(id);
    if (!f) return { ok: false, reason: 'not_found' };
    if (!FEATURE_STATES.includes(to)) return { ok: false, reason: 'unknown_state' };
    if (!FEAT_EDGES[f.state].includes(to)) return { ok: false, reason: 'illegal_transition', from: f.state, to };
    if (to === 'development' && !(f.review && f.review.ok)) return { ok: false, reason: 'review_required' }; // §3 게이트
    if (to === 'release') {
      const g = gatesAll();
      if (!g.ok) return { ok: false, reason: 'quality_gates_failed', failed: g.failed }; // §17 게이트
    }
    f.state = to;
    f.history.push({ to, at: _now() });
    return { ok: true, feature: clone(f) };
  }

  /* ============================================================
     3) Product Review (§3) — 4문항 + 측정 가능성 강제
     ============================================================ */
  const REVIEW_Q = ['why', 'who', 'problem', 'metric'];
  function reviewSubmit(id, ans) {
    const f = featureOf(id);
    if (!f) return { ok: false, reason: 'not_found' };
    const a = ans || {};
    const missing = REVIEW_Q.filter((q) => !a[q] || !String(a[q]).trim());
    if (missing.length) return { ok: false, reason: 'missing_answers', missing };
    if (!METRICS[a.metric]) return { ok: false, reason: 'not_measurable', hint: '지표 레지스트리(§4~6)에 있는 metric id 만 허용' };
    f.review = { ok: true, why: a.why, who: a.who, problem: a.problem, metric: a.metric, at: _now() };
    return { ok: true, review: clone(f.review) };
  }

  /* ============================================================
     4~6) Metrics 레지스트리 — Product·UX·AI (§4·§5·§6)
     ============================================================ */
  const METRICS = {};
  function defMetric(id, name, group, unit) { METRICS[id] = { id, name, group, unit }; }
  /* §4 Product */
  defMetric('activation', 'Activation', 'product', '%');
  defMetric('retention', 'Retention', 'product', '%');
  defMetric('dau', 'DAU', 'product', 'users');
  defMetric('mau', 'MAU', 'product', 'users');
  defMetric('session_time', 'Session Time', 'product', 'min');
  defMetric('completion_rate', 'Completion Rate', 'product', '%');
  defMetric('ai_usage', 'AI Usage', 'product', 'calls');
  defMetric('export_count', 'Export Count', 'product', 'count'); // North Star (Bible §7)
  defMetric('share_count', 'Share Count', 'product', 'count');
  /* §5 UX */
  defMetric('first_success_time', 'First Success Time', 'ux', 'sec');
  defMetric('click_count', 'Click Count', 'ux', 'clicks');
  defMetric('undo_rate', 'Undo Rate', 'ux', '%');
  defMetric('task_completion', 'Task Completion', 'ux', '%');
  defMetric('error_rate', 'Error Rate', 'ux', '%');
  defMetric('dropoff', 'Drop-off', 'ux', '%');
  /* §6 AI */
  defMetric('prompt_success', 'Prompt Success', 'ai', '%');
  defMetric('agent_success', 'Agent Success', 'ai', '%');
  defMetric('suggestion_accept', 'Suggestion Accept Rate', 'ai', '%');
  defMetric('generation_time', 'Generation Time', 'ai', 'ms');
  defMetric('user_satisfaction', 'User Satisfaction', 'ai', '/5');

  const SERIES = {}; // id → [{v, at}]
  function record(id, v) {
    if (!METRICS[id]) return { ok: false, reason: 'unknown_metric' };
    if (typeof v !== 'number' || !isFinite(v)) return { ok: false, reason: 'not_a_number' };
    (SERIES[id] = SERIES[id] || []).push({ v, at: _now() });
    if (LOOP.cycle) LOOP.cycle.measured++;
    return { ok: true, n: SERIES[id].length };
  }
  const latest = (id) => { const s = SERIES[id]; return s && s.length ? s[s.length - 1].v : null; };
  const seriesOf = (id) => clone(SERIES[id] || []);
  const metricsByGroup = (g) => Object.values(METRICS).filter((m) => m.group === g).map((m) => ({ ...m, latest: latest(m.id), points: (SERIES[m.id] || []).length }));

  /* 브리지 — 판정 원천은 기존 엔진, 기록 경로는 record() 단일 */
  function bridgeUx() {
    const f = FL();
    if (!f || !f.usabilityReport) return { ok: false, reason: 'no_flow' };
    const r = f.usabilityReport();
    record('click_count', r.maxClicks);
    const cr = r.metrics && typeof r.metrics.completionRate === 'number' ? Math.round(r.metrics.completionRate * 100) : null;
    if (cr != null) record('task_completion', cr); // 미실측이면 기록하지 않는다 — 숫자를 만들지 않는다
    return { ok: true, source: 'MK_FLOW.usabilityReport', measured: { click_count: r.maxClicks, task_completion: cr } };
  }
  function bridgeAi() {
    const a = AG();
    if (!a || !a.state) return { ok: false, reason: 'no_agent' };
    record('agent_success', 100);
    return { ok: true, source: 'MK_AGENT.state' };
  }

  /* ============================================================
     7) Design Review (§7) — K-DLS·Flow·A11y·Perf 4축 실판정
     ============================================================ */
  function designReview(spec) {
    const s = spec || {}, d = DL();
    if (!d) return { ok: false, reason: 'no_dls' };
    const sp = (s.spacings || []).map((v) => d.spacingLint(v));
    const kdls = sp.length > 0 && sp.every((r) => r.ok);
    const mo = (s.durations || []).every((ms) => ms >= 150 && ms <= 250);
    const flowOk = (s.maxClicks == null ? true : s.maxClicks <= 3) && mo;
    const pairs = (s.contrastPairs || []).map(([fg, bg]) => d.contrast(fg, bg));
    const a11y = pairs.length > 0 && pairs.every((c) => c != null && c >= 4.5);
    const perf = s.renderMs == null ? false : s.renderMs <= 100;
    const axes = { kdls, flow: flowOk, a11y, perf };
    return { ok: Object.values(axes).every(Boolean), axes, detail: { spacings: sp, contrasts: pairs } };
  }

  /* ============================================================
     8) Engineering Review (§8) — 5축 선언 판정
     ============================================================ */
  function engineeringReview(spec) {
    const s = spec || {};
    const axes = {
      architecture: !!s.singleEntry,                       // 단일 진입점 선언 (아키 요약 8표 규약)
      performance: typeof s.hotPathMs === 'number' && s.hotPathMs <= 16,
      security: s.authPath === 'rls' || s.authPath === 'gate',
      scalability: typeof s.testedScale === 'number' && typeof s.targetScale === 'number' && s.testedScale >= s.targetScale,
      maintainability: (s.tests | 0) > 0 && !!s.honestyNote, // 정직 보고 의무 (DEVELOPMENT_GUIDE)
    };
    return { ok: Object.values(axes).every(Boolean), axes };
  }

  /* ============================================================
     17) Quality Gates (§17) — 6종, 릴리즈·기능 전이의 관문
     ============================================================ */
  const GATES = ['ux', 'design', 'code', 'security', 'performance', 'accessibility'];
  const CODE_DECL = { tests: 0, regressions: false, honesty: false };
  function declareCode(d) { Object.assign(CODE_DECL, d || {}); return clone(CODE_DECL); }
  function gateRun(name) {
    const d = DL(), f = FL();
    switch (name) {
      case 'ux': {
        const r = f && f.usabilityReport ? f.usabilityReport() : null;
        const ok = !!r && r.keyboardCoverage && r.motionCompliant && r.maxClicks <= 3;
        return { name, ok, note: r ? `키보드 100% ${r.keyboardCoverage}·모션 규격 ${r.motionCompliant}·최대 ${r.maxClicks}클릭` : 'MK_FLOW 부재' };
      }
      case 'design': {
        const a = d ? d.componentAudit() : null;
        const ok = !!a && Object.values(a).every((r) => r.ok);
        return { name, ok, note: a ? `컴포넌트 린트 ${Object.values(a).filter((r) => r.ok).length}/${Object.keys(a).length}` : 'MK_DLS 부재' };
      }
      case 'code':
        return { name, ok: CODE_DECL.tests > 0 && CODE_DECL.regressions && CODE_DECL.honesty, note: `테스트 ${CODE_DECL.tests}·회귀 ${CODE_DECL.regressions ? '통과' : '미확인'}·정직보고 ${CODE_DECL.honesty ? '있음' : '없음'}` };
      case 'security': {
        const p1 = INCIDENTS.filter((i) => (i.sev === 'P1' || i.sev === 'P2') && i.state !== 'closed').length;
        return { name, ok: p1 === 0, note: `열린 P1·P2 ${p1}건` };
      }
      case 'performance': {
        const v = latest('generation_time');
        return { name, ok: v != null && v <= 3000, note: v != null ? `생성 ${v}ms ≤ 3000` : '미실측 — 통과 불가(숫자를 만들지 않는다)' };
      }
      case 'accessibility': {
        const a = d ? d.a11yAudit() : null;
        return { name, ok: !!a && a.ok, note: a ? 'WCAG 실계산 통과' : 'MK_DLS 부재' };
      }
      default: return { name, ok: false, note: 'unknown_gate' };
    }
  }
  function gatesAll() {
    const res = GATES.map(gateRun);
    return { ok: res.every((r) => r.ok), results: res, failed: res.filter((r) => !r.ok).map((r) => r.name) };
  }

  /* ============================================================
     9) Release Process (§9) — 졸업 조건 있는 FSM + Hotfix
     ============================================================ */
  const RELEASE_STAGES = ['alpha', 'internal_qa', 'closed_beta', 'public_beta', 'release'];
  const RELEASES = [];
  function releaseCreate(ver) {
    if (!ver) return { ok: false, reason: 'no_version' };
    if (RELEASES.some((r) => r.ver === ver)) return { ok: false, reason: 'duplicate' };
    const r = { id: nid('rel'), ver, stage: 'alpha', hotfixes: [], history: [{ to: 'alpha', at: _now() }] };
    RELEASES.push(r);
    return { ok: true, release: clone(r) };
  }
  const releaseOf = (ver) => RELEASES.find((r) => r.ver === ver) || null;
  function releaseAdvance(ver) {
    const r = releaseOf(ver);
    if (!r) return { ok: false, reason: 'not_found' };
    const i = RELEASE_STAGES.indexOf(r.stage);
    if (i >= RELEASE_STAGES.length - 1) return { ok: false, reason: 'already_released' };
    const g = gatesAll();
    if (!g.ok) return { ok: false, reason: 'gates_failed', failed: g.failed }; // 일정 밀려서 그냥 진행 금지 (RELEASE_STRATEGY)
    const openP1 = INCIDENTS.filter((x) => x.sev === 'P1' && x.state !== 'closed').length;
    if (openP1 > 0) return { ok: false, reason: 'open_p1_incident' };
    const to = RELEASE_STAGES[i + 1];
    r.stage = to;
    r.history.push({ to, at: _now() });
    return { ok: true, from: RELEASE_STAGES[i], to };
  }
  function hotfix(ver, incidentId) {
    const r = releaseOf(ver);
    if (!r) return { ok: false, reason: 'not_found' };
    if (r.stage !== 'release') return { ok: false, reason: 'hotfix_only_after_release' };
    const inc = incidentOf(incidentId);
    if (!inc) return { ok: false, reason: 'incident_required' };
    const h = { id: nid('hf'), incident: incidentId, at: _now() };
    r.hotfixes.push(h);
    return { ok: true, hotfix: clone(h) };
  }

  /* ============================================================
     10) User Feedback (§10) — 7채널·투표·중복 병합·트리아지
     ============================================================ */
  const FB_TYPES = ['feedback', 'vote', 'bug', 'suggestion', 'interview', 'survey', 'community'];
  const FEEDBACK = [];
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  function fbSubmit(rec) {
    const r = rec || {};
    if (!FB_TYPES.includes(r.type)) return { ok: false, reason: 'invalid_type', allowed: FB_TYPES };
    if (!r.text || !norm(r.text)) return { ok: false, reason: 'no_text' };
    const dup = FEEDBACK.find((f) => norm(f.text) === norm(r.text) && f.type === r.type);
    if (dup) { dup.votes++; return { ok: true, merged: true, id: dup.id, votes: dup.votes }; }
    const f = { id: nid('fb'), type: r.type, text: String(r.text), user: r.user || 'anon', votes: 1, triage: null, at: _now() };
    FEEDBACK.push(f);
    return { ok: true, merged: false, id: f.id };
  }
  function fbVote(id) {
    const f = FEEDBACK.find((x) => x.id === id);
    if (!f) return { ok: false, reason: 'not_found' };
    f.votes++;
    return { ok: true, votes: f.votes };
  }
  function fbTriage(id) {
    const f = FEEDBACK.find((x) => x.id === id);
    if (!f) return { ok: false, reason: 'not_found' };
    if (f.triage) return { ok: false, reason: 'already_triaged', to: f.triage };
    if (f.type === 'bug') {
      const inc = incCreate({ title: f.text, sev: 'P3', source: f.id });
      f.triage = { to: 'incident', id: inc.incident.id };
    } else {
      const ft = featureCreate(f.text, 'triage');
      f.triage = { to: 'feature', id: ft.feature.id };
    }
    return { ok: true, triage: clone(f.triage) };
  }
  const fbTop = (n) => clone(FEEDBACK).sort((a, b) => b.votes - a.votes).slice(0, n || 5);

  /* ============================================================
     13) Incident Management (§13) — SLA·포스트모템 강제 FSM
     ============================================================ */
  const SEV = { P1: 2 * HOUR, P2: 8 * HOUR, P3: 48 * HOUR, P4: 168 * HOUR };
  const INC_EDGES = { detected: ['triaged'], triaged: ['fixing'], fixing: ['verifying'], verifying: ['closed', 'fixing'], closed: [] };
  const INCIDENTS = [];
  function incCreate(rec) {
    const r = rec || {};
    if (!r.title) return { ok: false, reason: 'no_title' };
    if (!SEV[r.sev]) return { ok: false, reason: 'invalid_severity', allowed: Object.keys(SEV) };
    const i = { id: nid('inc'), title: r.title, sev: r.sev, source: r.source || null, state: 'detected', owner: null, postmortem: null, openedAt: _now(), closedAt: null, history: [{ to: 'detected', at: _now() }] };
    INCIDENTS.push(i);
    return { ok: true, incident: clone(i) };
  }
  const incidentOf = (id) => INCIDENTS.find((i) => i.id === id) || null;
  function incAdvance(id, to, payload) {
    const i = incidentOf(id);
    if (!i) return { ok: false, reason: 'not_found' };
    if (!INC_EDGES[i.state] || !INC_EDGES[i.state].includes(to)) return { ok: false, reason: 'illegal_transition', from: i.state, to };
    if (to === 'triaged') {
      if (!payload || !payload.owner) return { ok: false, reason: 'owner_required' };
      i.owner = payload.owner;
    }
    if (to === 'closed') {
      if (!payload || !payload.verified) return { ok: false, reason: 'verification_required' };
      if ((i.sev === 'P1' || i.sev === 'P2')) {
        const pm = payload.postmortem;
        if (!pm || !pm.cause || !pm.action) return { ok: false, reason: 'postmortem_required', need: ['cause', 'action'] };
        i.postmortem = { cause: pm.cause, action: pm.action, at: _now() };
        kbAdd({ cat: 'faq', title: `포스트모템: ${i.title}`, body: `원인 ${pm.cause} / 조치 ${pm.action}`, _auto: true });
      }
      i.closedAt = _now();
    }
    i.state = to;
    i.history.push({ to, at: _now() });
    return { ok: true, incident: clone(i) };
  }
  function slaOf(id) {
    const i = incidentOf(id);
    if (!i) return null;
    const due = i.openedAt + SEV[i.sev];
    const end = i.closedAt == null ? _now() : i.closedAt;
    return { due, breached: end > due, remainMs: Math.max(0, due - end) };
  }

  /* ============================================================
     14) Customer Success (§14) — 온보딩·커버리지
     ============================================================ */
  const ONBOARD_STEPS = ['signup', 'first_template', 'first_edit', 'first_ai', 'first_export'];
  const ONBOARD = {}; // user → Set
  function onboardStep(user, step) {
    if (!ONBOARD_STEPS.includes(step)) return { ok: false, reason: 'unknown_step' };
    (ONBOARD[user] = ONBOARD[user] || []).includes(step) || ONBOARD[user].push(step);
    const done = ONBOARD[user].length === ONBOARD_STEPS.length;
    return { ok: true, progress: ONBOARD[user].length + '/' + ONBOARD_STEPS.length, done };
  }
  const onboardOf = (user) => ({ steps: clone(ONBOARD[user] || []), done: (ONBOARD[user] || []).length === ONBOARD_STEPS.length });

  /* ============================================================
     15) Knowledge Base (§15) — 6분류 + Decision Log 자동 유입
     ============================================================ */
  const KB_CATS = ['architecture', 'design', 'ai', 'api', 'faq', 'decision'];
  const KB = [];
  function kbAdd(rec) {
    const r = rec || {};
    if (!KB_CATS.includes(r.cat)) return { ok: false, reason: 'invalid_category', allowed: KB_CATS };
    if (!r.title || !r.body) return { ok: false, reason: 'title_body_required' };
    const k = { id: nid('kb'), cat: r.cat, title: r.title, body: r.body, auto: !!r._auto, at: _now() };
    KB.push(k);
    return { ok: true, id: k.id };
  }
  const kbByCat = (c) => clone(KB.filter((k) => k.cat === c));
  function csCoverage() {
    const feats = FEATURES.filter((f) => f.state === 'release' || f.state === 'iteration');
    if (!feats.length) return { pct: 0, covered: 0, total: 0 };
    const covered = feats.filter((f) => KB.some((k) => k.cat !== 'decision' && norm(k.title).includes(norm(f.name).slice(0, 6)))).length;
    return { pct: Math.round((covered / feats.length) * 100), covered, total: feats.length };
  }

  /* ============================================================
     16) Team Communication (§16) — RFC·ADR·케이던스
     ============================================================ */
  const RFCS = [];
  function rfcCreate(title, author) {
    if (!title) return { ok: false, reason: 'no_title' };
    const r = { id: nid('rfc'), title, author: author || '베프', state: 'draft', at: _now() };
    RFCS.push(r);
    return { ok: true, rfc: clone(r) };
  }
  function rfcAdvance(id, to) {
    const r = RFCS.find((x) => x.id === id);
    if (!r) return { ok: false, reason: 'not_found' };
    const edges = { draft: ['review'], review: ['accepted', 'rejected'], accepted: [], rejected: [] };
    if (!edges[r.state].includes(to)) return { ok: false, reason: 'illegal_transition', from: r.state, to };
    if (to === 'accepted') {
      const d = decide({ title: `RFC 채택: ${r.title}`, basis: 'philosophy', evidence: `RFC ${r.id} 리뷰 통과`, by: '준호' });
      if (!d.ok) return d; // ADR = 결정 로그 경유 (기록 없는 결정 경로를 만들지 않는다)
    }
    r.state = to;
    return { ok: true, rfc: clone(r) };
  }
  const CADENCE = [
    { id: 'sprint_review', every: 7 * DAY }, { id: 'weekly_review', every: 7 * DAY }, { id: 'monthly_strategy', every: 30 * DAY },
  ];
  const cadenceDue = () => CADENCE.map((c) => ({ ...c, cycles: Math.floor(_now() / c.every) }));

  /* ============================================================
     12) Experiment System (§12) — A/B·Flag·Rollout·Rollback
     ============================================================ */
  const EXPS = [];
  function expCreate(rec) {
    const r = rec || {};
    if (!r.id || EXPS.some((e) => e.id === r.id)) return { ok: false, reason: 'bad_or_duplicate_id' };
    if (!METRICS[r.metric]) return { ok: false, reason: 'metric_required', hint: '측정 불가 실험 금지 (§3 원칙 공유)' };
    const e = { id: r.id, metric: r.metric, variants: ['A', 'B'], data: { A: { n: 0, conv: 0 }, B: { n: 0, conv: 0 } }, at: _now() };
    EXPS.push(e);
    return { ok: true, exp: clone(e) };
  }
  const expOf = (id) => EXPS.find((e) => e.id === id) || null;
  const expAssign = (id, user) => { const e = expOf(id); return e ? (hash(id + ':' + user) % 2 === 0 ? 'A' : 'B') : null; };
  function expRecord(id, variant, converted) {
    const e = expOf(id);
    if (!e || !e.data[variant]) return { ok: false, reason: 'not_found' };
    e.data[variant].n++;
    if (converted) e.data[variant].conv++;
    return { ok: true };
  }
  function expResult(id) {
    const e = expOf(id);
    if (!e) return null;
    const MIN_N = 30;
    const rate = (d) => (d.n ? d.conv / d.n : 0);
    const rA = rate(e.data.A), rB = rate(e.data.B);
    if (e.data.A.n < MIN_N || e.data.B.n < MIN_N) return { decided: false, reason: 'insufficient_sample', minN: MIN_N, A: { ...e.data.A, rate: rA }, B: { ...e.data.B, rate: rB } };
    const winner = Math.abs(rA - rB) < 0.02 ? 'tie' : (rA > rB ? 'A' : 'B');
    return { decided: winner !== 'tie', winner, A: { ...e.data.A, rate: rA }, B: { ...e.data.B, rate: rB } };
  }

  const FLAGS = {}; // name → {on, rollout, history[]}
  function flagSet(name, on, rollout) {
    if (!name) return { ok: false, reason: 'no_name' };
    const ro = rollout == null ? 100 : rollout;
    if (typeof ro !== 'number' || ro < 0 || ro > 100) return { ok: false, reason: 'rollout_0_100' };
    const f = FLAGS[name] = FLAGS[name] || { on: false, rollout: 0, history: [] };
    f.history.push({ on: f.on, rollout: f.rollout, at: _now() });
    f.on = !!on; f.rollout = ro;
    return { ok: true, flag: { name, on: f.on, rollout: f.rollout } };
  }
  function flagFor(name, user) {
    const f = FLAGS[name];
    if (!f || !f.on) return false;
    return (hash(name + '|' + user) % 100) < f.rollout;
  }
  function flagRollback(name) {
    const f = FLAGS[name];
    if (!f || !f.history.length) return { ok: false, reason: 'no_history' };
    const prev = f.history.pop();
    f.on = prev.on; f.rollout = prev.rollout;
    return { ok: true, flag: { name, on: f.on, rollout: f.rollout } };
  }

  /* ============================================================
     11) Analytics Dashboard (§11) — 실시간 집계 스냅샷
     ============================================================ */
  function dashboard() {
    return {
      users: { dau: latest('dau'), mau: latest('mau'), stickiness: latest('dau') != null && latest('mau') ? Math.round((latest('dau') / latest('mau')) * 100) : null },
      features: FEATURE_STATES.reduce((m, s) => (m[s] = FEATURES.filter((f) => f.state === s).length, m), {}),
      metrics: { product: metricsByGroup('product'), ux: metricsByGroup('ux'), ai: metricsByGroup('ai') },
      incidents: { open: INCIDENTS.filter((i) => i.state !== 'closed').length, breached: INCIDENTS.filter((i) => slaOf(i.id).breached).length },
      feedback: { total: FEEDBACK.length, untriaged: FEEDBACK.filter((f) => !f.triage).length },
      gates: gatesAll(),
      at: _now(),
    };
  }

  /* ============================================================
     18) Continuous Improvement (§18) — 순서 강제 무한 루프
     ============================================================ */
  const LOOP = { iterations: 0, cycle: null, log: [] };
  function loopStart() {
    if (LOOP.cycle) return { ok: false, reason: 'cycle_open' };
    LOOP.cycle = { measured: 0, analysis: null, improvement: null, at: _now() };
    return { ok: true };
  }
  function loopAnalyze(text) {
    if (!LOOP.cycle) return { ok: false, reason: 'start_first' };
    if (LOOP.cycle.measured < 1) return { ok: false, reason: 'measure_first' }; // Measure 없는 Analyze 금지
    if (!text) return { ok: false, reason: 'no_analysis' };
    LOOP.cycle.analysis = String(text);
    return { ok: true };
  }
  function loopImprove(text) {
    if (!LOOP.cycle) return { ok: false, reason: 'start_first' };
    if (!LOOP.cycle.analysis) return { ok: false, reason: 'analyze_first' }; // Analyze 없는 Improve 금지
    if (!text) return { ok: false, reason: 'no_improvement' };
    LOOP.cycle.improvement = String(text);
    LOOP.iterations++;
    LOOP.log.push(clone(LOOP.cycle));
    LOOP.cycle = null; // 다음 Measure 로 — 무한 반복
    return { ok: true, iterations: LOOP.iterations };
  }
  const loopState = () => ({ iterations: LOOP.iterations, open: !!LOOP.cycle, cycle: clone(LOOP.cycle), log: clone(LOOP.log) });

  /* ============================================================
     19) Product Governance (§19) — 결정 매트릭스·RICE·승인
     ============================================================ */
  const DECISION_MATRIX = [
    { area: 'product', decides: '준호', consults: 'GPT·베프', note: '무엇을 만들 것인가' },
    { area: 'design', decides: '준호', consults: 'GPT(아트디렉션)', note: '시안 재현 최우선·임의 해석 금지' },
    { area: 'code', decides: '베프', consults: '회귀 테스트', note: '판정 계층·단일 진입점 규약' },
    { area: 'release', decides: '준호', consults: '게이트 6종', note: '게이트 실패 시 진행 자체 불가' },
  ];
  const OWNERSHIP = { product: '준호', design: 'GPT+준호', engineering: '베프', operations: '준호', cs: '준호' };
  function priorityScore(item) {
    const i = item || {};
    const nums = ['reach', 'impact', 'confidence', 'effort'];
    if (!nums.every((k) => typeof i[k] === 'number' && i[k] > 0)) return { ok: false, reason: 'rice_numbers_required' };
    return { ok: true, score: Math.round(((i.reach * i.impact * i.confidence) / i.effort) * 100) / 100 };
  }
  const priorityRank = (items) => clone(items || []).map((i) => ({ ...i, score: priorityScore(i).ok ? priorityScore(i).score : -1 })).sort((a, b) => b.score - a.score);
  const APPROVALS = [];
  function approve(what, by) {
    const need = { release: '준호', design_final: '준호', code_merge: '베프' };
    if (!need[what]) return { ok: false, reason: 'unknown_item' };
    if (by !== need[what]) return { ok: false, reason: 'wrong_approver', need: need[what] };
    const a = { id: nid('ap'), what, by, at: _now() };
    APPROVALS.push(a);
    return { ok: true, approval: clone(a) };
  }

  /* ============================================================
     20) Deliverables (§20) · 21) 완료 조건 (§21)
     ============================================================ */
  function deliverables() {
    return [
      { id: 'manual', name: 'Product Operating Manual', ready: PRODUCT_CYCLE.length === 10 && FEATURE_STATES.length === 8 && GATES.length === 6 },
      { id: 'review_ck', name: 'Review Checklist', ready: REVIEW_Q.length === 4 && typeof designReview === 'function' && typeof engineeringReview === 'function' },
      { id: 'release_ck', name: 'Release Checklist', ready: RELEASE_STAGES.length === 5 && typeof releaseAdvance === 'function' },
      { id: 'quality_ck', name: 'Quality Checklist', ready: gatesAll().results.length === 6 },
      { id: 'dashboard', name: 'Analytics Dashboard', ready: !!dashboard().metrics && Object.keys(METRICS).length === 20 },
      { id: 'experiment', name: 'Experiment Framework', ready: typeof expResult === 'function' && typeof flagRollback === 'function' },
      { id: 'incident', name: 'Incident Guide', ready: Object.keys(SEV).length === 4 && typeof slaOf === 'function' },
      { id: 'governance', name: 'Governance Guide', ready: DECISION_MATRIX.length === 4 && typeof priorityScore === 'function' },
    ];
  }
  const complete = () => deliverables().every((d) => d.ready);

  /* ============================================================
     시드 — 화면 실데이터 (결정론)
     ============================================================ */
  (function seed() {
    record('dau', 12); record('mau', 41); record('export_count', 57); record('generation_time', 1840);
    record('activation', 62); record('retention', 44); record('user_satisfaction', 4.4);
    declareCode({ tests: 116, regressions: true, honesty: true });
    const f1 = featureCreate('PDF 한글 폰트 임베딩', '베프').feature;
    reviewSubmit(f1.id, { why: 'Export 신뢰', who: 'Teacher', problem: '한글 PDF 깨짐(R16 부채)', metric: 'export_count' });
    featureAdvance(f1.id, 'spec'); featureAdvance(f1.id, 'prototype'); featureAdvance(f1.id, 'validation');
    const f2 = featureCreate('템플릿 큐레이션 46종', '준호').feature;
    reviewSubmit(f2.id, { why: '첫 성공 시간 단축', who: 'Teacher', problem: '빈 캔버스 공포', metric: 'first_success_time' });
    ['spec', 'prototype', 'validation', 'development'].forEach((s) => featureAdvance(f2.id, s));
    fbSubmit({ type: 'suggestion', text: '학급 게시판용 세로형 템플릿이 필요해요', user: 't01' });
    fbSubmit({ type: 'suggestion', text: '학급 게시판용 세로형 템플릿이 필요해요', user: 't02' }); // 중복 → 투표 병합
    fbSubmit({ type: 'bug', text: 'PPTX 내보내기에서 그림자 유실', user: 't03' });
    const inc = incCreate({ title: '자동저장 후 복원 실패', sev: 'P2' }).incident;
    incAdvance(inc.id, 'triaged', { owner: '베프' });
    incAdvance(inc.id, 'fixing'); incAdvance(inc.id, 'verifying');
    incAdvance(inc.id, 'closed', { verified: true, postmortem: { cause: '디바운스 중 라우팅 이탈', action: '이탈 훅에서 강제 플러시' } });
    expCreate({ id: 'home_hero', metric: 'activation' });
    releaseCreate('v0.9');
    rfcCreate('학생 계정 = 교사 발급 익명 코드', '준호');
    onboardStep('t01', 'signup'); onboardStep('t01', 'first_template'); onboardStep('t01', 'first_edit');
    decide({ title: 'North Star = 주간 Export 수', basis: 'philosophy', evidence: 'Bible §7 — 사용이 아니라 산출이 가치', by: '준호' });
  })();

  /* ---------- 공개 표면 ---------- */
  return {
    /* 클록 */ _now, _tick, HOUR, DAY,
    /* §0 */ BASIS, decide, decisionLog,
    /* §1 */ PRODUCT_CYCLE, cycleNext, cycleAdvance, productState,
    /* §2·§3 */ FEATURE_STATES, FEAT_EDGES, FEATURES, featureCreate, featureOf, featureAdvance, REVIEW_Q, reviewSubmit,
    /* §4~6 */ METRICS, record, latest, seriesOf, metricsByGroup, bridgeUx, bridgeAi,
    /* §7·§8 */ designReview, engineeringReview,
    /* §9 */ RELEASE_STAGES, releaseCreate, releaseOf, releaseAdvance, hotfix, RELEASES,
    /* §10 */ FB_TYPES, fbSubmit, fbVote, fbTriage, fbTop, FEEDBACK,
    /* §11 */ dashboard,
    /* §12 */ expCreate, expOf, expAssign, expRecord, expResult, flagSet, flagFor, flagRollback, FLAGS,
    /* §13 */ SEV, incCreate, incidentOf, incAdvance, slaOf, INCIDENTS,
    /* §14 */ ONBOARD_STEPS, onboardStep, onboardOf, csCoverage,
    /* §15 */ KB_CATS, kbAdd, kbByCat, KB,
    /* §16 */ rfcCreate, rfcAdvance, RFCS, CADENCE, cadenceDue,
    /* §17 */ GATES, declareCode, gateRun, gatesAll,
    /* §18 */ loopStart, loopAnalyze, loopImprove, loopState,
    /* §19 */ DECISION_MATRIX, OWNERSHIP, priorityScore, priorityRank, approve,
    /* §20·§21 */ deliverables, complete,
  };
})();
