/* Round 26 — K-MAKER Product Operating System (MK_OPS) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/ops' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const O = window.MK_OPS;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 의사결정 원칙 (§0) ============ */
sec('1. 의사결정 원칙');
T('공개 표면', typeof O.decide === 'function' && typeof O.gatesAll === 'function' && typeof O.complete === 'function');
T('근거 3종', JSON.stringify(O.BASIS) === '["data","user","philosophy"]');
T('감(느낌) 근거 거부', O.decide({ title: 'x', basis: '감', evidence: 'y' }).ok === false);
T('evidence 없는 결정 거부', O.decide({ title: 'x', basis: 'data', evidence: '' }).reason === 'no_evidence');
const decN0 = O.decisionLog().length;
T('유효 결정 등록', O.decide({ title: '큐레이션 유지', basis: 'data', evidence: 'FST 단축 실측' }).ok && O.decisionLog().length === decN0 + 1);
T('결정 → KB decision 자동 유입', O.kbByCat('decision').some((k) => k.title.includes('큐레이션')));

/* ============ 2. Product Lifecycle (§1) ============ */
sec('2. Product Lifecycle');
T('10단계', O.PRODUCT_CYCLE.length === 10 && O.PRODUCT_CYCLE[0] === 'idea' && O.PRODUCT_CYCLE[9] === 'improve');
T('순환 — improve→idea', O.cycleNext('improve') === 'idea' && O.cycleNext('qa') === 'release');
T('미지 단계 null', O.cycleNext('ship') === null);
const lap0 = O.productState().laps;
const adv = O.cycleAdvance();
T('전이 기록', adv.ok && O.productState().history.length > 0);
let guard = 0; while (O.productState().laps === lap0 && guard++ < 12) O.cycleAdvance();
T('한 바퀴 후 laps 증가', O.productState().laps === lap0 + 1);

/* ============ 3. Feature FSM + Review 게이트 (§2·§3) ============ */
sec('3. Feature FSM·Review');
T('상태 8종', O.FEATURE_STATES.length === 8 && O.FEATURE_STATES.includes('deprecation'));
const ft = O.featureCreate('테스트 기능').feature;
T('생성 → idea', ft.state === 'idea');
T('불법 전이 차단(idea→development)', O.featureAdvance(ft.id, 'development').reason === 'illegal_transition');
O.featureAdvance(ft.id, 'spec'); O.featureAdvance(ft.id, 'prototype'); O.featureAdvance(ft.id, 'validation');
T('리뷰 없이 development 거부', O.featureAdvance(ft.id, 'development').reason === 'review_required');
T('리뷰 — 문항 누락 거부', O.reviewSubmit(ft.id, { why: 'a', who: 'b', problem: 'c' }).missing.includes('metric'));
T('리뷰 — 미등록 지표 거부(측정 가능성 강제)', O.reviewSubmit(ft.id, { why: 'a', who: 'b', problem: 'c', metric: 'vibes' }).reason === 'not_measurable');
T('리뷰 통과', O.reviewSubmit(ft.id, { why: 'a', who: 'b', problem: 'c', metric: 'export_count' }).ok);
T('리뷰 후 development 허용', O.featureAdvance(ft.id, 'development').ok);
T('deprecation 은 종착', O.FEAT_EDGES.deprecation.length === 0);

/* ============ 4. Metrics (§4~6) ============ */
sec('4. Metrics');
T('지표 20종 — 3그룹', Object.keys(O.METRICS).length === 20 && O.metricsByGroup('product').length === 9 && O.metricsByGroup('ux').length === 6 && O.metricsByGroup('ai').length === 5);
T('미등록 지표 기록 거부', O.record('vibes', 1).ok === false);
T('숫자 아닌 값 거부', O.record('dau', 'many').reason === 'not_a_number');
const n0 = O.seriesOf('dau').length;
T('기록·최근값', O.record('dau', 15).ok && O.latest('dau') === 15 && O.seriesOf('dau').length === n0 + 1);
const bx = O.bridgeUx();
T('UX 브리지 — MK_FLOW 원천', bx.ok && O.latest('click_count') != null && O.latest('click_count') <= 3);
T('브리지 — 미실측 완주율은 기록하지 않음(정직)', bx.measured.task_completion === null ? O.latest('task_completion') === null : O.latest('task_completion') != null);
T('AI 브리지', O.bridgeAi().ok && O.latest('agent_success') === 100);
T('North Star 등재', O.METRICS.export_count.group === 'product');

/* ============ 5. Design·Engineering Review (§7·§8) ============ */
sec('5. Design·Engineering Review');
const drOk = O.designReview({ spacings: [16, 24], durations: [180, 220], contrastPairs: [['#3A3F8F', '#FFFFFF']], maxClicks: 3, renderMs: 40 });
T('정합 시안 전축 통과', drOk.ok && drOk.axes.kdls && drOk.axes.a11y);
const drBad = O.designReview({ spacings: [14], durations: [300], contrastPairs: [['#AAAAAA', '#FFFFFF']], maxClicks: 5, renderMs: 200 });
T('위반 시안 — 4축 전부 검출', !drBad.ok && !drBad.axes.kdls && !drBad.axes.flow && !drBad.axes.a11y && !drBad.axes.perf);
T('K-DLS 실판정(14px off-grid)', drBad.detail.spacings[0].ok === false);
const er = O.engineeringReview({ singleEntry: true, hotPathMs: 9, authPath: 'rls', testedScale: 100000, targetScale: 100000, tests: 116, honestyNote: 'x' });
T('엔지니어링 5축 통과', er.ok);
T('정직 보고 없으면 유지보수성 실패', O.engineeringReview({ singleEntry: true, hotPathMs: 9, authPath: 'rls', testedScale: 1, targetScale: 1, tests: 5 }).axes.maintainability === false);
T('보안 — authPath 강제', O.engineeringReview({ singleEntry: true, hotPathMs: 9, authPath: 'trust_me', testedScale: 1, targetScale: 1, tests: 1, honestyNote: 'x' }).axes.security === false);

/* ============ 6. Quality Gates (§17) ============ */
sec('6. Quality Gates');
T('게이트 6종', O.GATES.length === 6);
const g = O.gatesAll();
T('전 게이트 판정 반환', g.results.length === 6 && g.results.every((r) => typeof r.ok === 'boolean' && r.note));
T('현재 전 게이트 통과(시드 기준)', g.ok, JSON.stringify(g.failed));
O.declareCode({ tests: 0 });
T('코드 선언 철회 시 code 게이트 실패', O.gateRun('code').ok === false);
O.declareCode({ tests: 116, regressions: true, honesty: true });
T('재선언 후 복구', O.gateRun('code').ok);

/* ============ 7. Release FSM (§9) ============ */
sec('7. Release FSM');
T('5단계', O.RELEASE_STAGES.length === 5);
T('중복 버전 거부', O.releaseCreate('v0.9').reason === 'duplicate');
T('alpha→internal_qa 졸업(게이트 통과 상태)', O.releaseAdvance('v0.9').ok && O.releaseOf('v0.9').stage === 'internal_qa');
T('release 전 hotfix 거부', O.hotfix('v0.9', 'x').reason === 'hotfix_only_after_release');
const p1 = O.incCreate({ title: '치명 결함', sev: 'P1' }).incident;
T('열린 P1 → 졸업 차단', O.releaseAdvance('v0.9').reason === 'open_p1_incident' || O.releaseAdvance('v0.9').reason === 'gates_failed');
O.incAdvance(p1.id, 'triaged', { owner: '베프' }); O.incAdvance(p1.id, 'fixing'); O.incAdvance(p1.id, 'verifying');
O.incAdvance(p1.id, 'closed', { verified: true, postmortem: { cause: 'c', action: 'a' } });
T('P1 종결 후 졸업 재개', O.releaseAdvance('v0.9').ok);
O.releaseAdvance('v0.9'); O.releaseAdvance('v0.9');
T('release 도달 후 추가 졸업 거부', O.releaseOf('v0.9').stage === 'release' && O.releaseAdvance('v0.9').reason === 'already_released');
const inc2 = O.incCreate({ title: '핫픽스 대상', sev: 'P3' }).incident;
T('hotfix — 인시던트 연결 의무', O.hotfix('v0.9', 'no_such').reason === 'incident_required' && O.hotfix('v0.9', inc2.id).ok);

/* ============ 8. Incident (§13) ============ */
sec('8. Incident');
T('SLA 4단', O.SEV.P1 === 2 * O.HOUR && O.SEV.P4 === 168 * O.HOUR);
T('심각도 검증', O.incCreate({ title: 'x', sev: 'P9' }).reason === 'invalid_severity');
const i3 = O.incCreate({ title: 'FSM 검증', sev: 'P2' }).incident;
T('불법 전이 차단(detected→fixing)', O.incAdvance(i3.id, 'fixing').reason === 'illegal_transition');
T('트리아지 — 담당자 의무', O.incAdvance(i3.id, 'triaged', {}).reason === 'owner_required');
O.incAdvance(i3.id, 'triaged', { owner: '베프' }); O.incAdvance(i3.id, 'fixing'); O.incAdvance(i3.id, 'verifying');
T('검증 없는 close 거부', O.incAdvance(i3.id, 'closed', {}).reason === 'verification_required');
T('P2 포스트모템 없는 close 거부', O.incAdvance(i3.id, 'closed', { verified: true }).reason === 'postmortem_required');
T('cause만으로 거부', O.incAdvance(i3.id, 'closed', { verified: true, postmortem: { cause: 'c' } }).reason === 'postmortem_required');
const kbN = O.kbByCat('faq').length;
T('포스트모템 close + KB 축적', O.incAdvance(i3.id, 'closed', { verified: true, postmortem: { cause: 'c', action: 'a' } }).ok && O.kbByCat('faq').length === kbN + 1);
const i4 = O.incCreate({ title: 'SLA 클록', sev: 'P1' }).incident;
T('SLA — 기한 내', O.slaOf(i4.id).breached === false);
O._tick(3 * O.HOUR);
T('SLA — _tick 3h 후 P1 위반 실판정', O.slaOf(i4.id).breached === true);
O.incAdvance(i4.id, 'triaged', { owner: '베프' }); O.incAdvance(i4.id, 'fixing'); O.incAdvance(i4.id, 'verifying');
O.incAdvance(i4.id, 'closed', { verified: true, postmortem: { cause: 'c', action: 'a' } });

/* ============ 9. Feedback (§10) ============ */
sec('9. Feedback');
T('채널 7종', O.FB_TYPES.length === 7);
T('유형 검증', O.fbSubmit({ type: 'rant', text: 'x' }).ok === false);
const fb1 = O.fbSubmit({ type: 'suggestion', text: '표 컴포넌트 추가', user: 'u1' });
T('신규 등록', fb1.ok && !fb1.merged);
const fb2 = O.fbSubmit({ type: 'suggestion', text: '  표  컴포넌트   추가 ', user: 'u2' });
T('중복 → 투표 병합(정규화)', fb2.merged === true && fb2.votes === 2);
T('투표', O.fbVote(fb1.id).votes === 3);
const bug = O.fbSubmit({ type: 'bug', text: '줌 중 크래시', user: 'u3' });
const tr = O.fbTriage(bug.id);
T('bug 트리아지 → 인시던트 생성', tr.ok && tr.triage.to === 'incident' && O.incidentOf(tr.triage.id) !== null);
T('재트리아지 거부', O.fbTriage(bug.id).reason === 'already_triaged');
const tr2 = O.fbTriage(fb1.id);
T('suggestion 트리아지 → 기능 idea', tr2.ok && tr2.triage.to === 'feature' && O.featureOf(tr2.triage.id).state === 'idea');
T('상위 정렬', O.fbTop(1)[0].votes >= 3);

/* ============ 10. Experiment·Flag (§12) ============ */
sec('10. Experiment·Flag');
T('지표 없는 실험 거부', O.expCreate({ id: 'x1', metric: 'vibes' }).reason === 'metric_required');
T('결정적 배정 — 동일 입력 동일 결과', O.expAssign('home_hero', 'u9') === O.expAssign('home_hero', 'u9'));
T('표본 미달 — 승자 판정 거부', O.expResult('home_hero').decided === false && O.expResult('home_hero').reason === 'insufficient_sample');
for (let i = 0; i < 80; i++) { const v = i % 2 ? 'A' : 'B'; O.expRecord('home_hero', v, v === 'A' ? i % 10 < 7 : i % 10 < 3); }
const res = O.expResult('home_hero');
T('표본 충족 후 승자 A', res.decided && res.winner === 'A' && res.A.n >= 30);
T('rollout 범위 검증', O.flagSet('f1', true, 150).ok === false);
O.flagSet('new_editor', true, 25);
const users = Array.from({ length: 40 }, (_, i) => 'u' + i);
const exposed25 = users.filter((u) => O.flagFor('new_editor', u)).length;
O.flagSet('new_editor', true, 100);
T('rollout 25% < 100% 노출 단조', exposed25 < users.filter((u) => O.flagFor('new_editor', u)).length && users.every((u) => O.flagFor('new_editor', u)));
T('rollback — 이전 상태 실복원', O.flagRollback('new_editor').flag.rollout === 25);
T('off 플래그 미노출', (O.flagSet('dark', false, 100), O.flagFor('dark', 'u1') === false));

/* ============ 11. Dashboard (§11) ============ */
sec('11. Dashboard');
const db = O.dashboard();
T('사용자·기능·지표·인시던트·게이트 집계', db.users.stickiness != null && typeof db.features.idea === 'number' && db.metrics.product.length === 9 && typeof db.incidents.open === 'number' && db.gates.results.length === 6);
T('미실측 지표 null 정직 표기', db.metrics.ux.some((m) => m.latest === null));

/* ============ 12. Improvement Loop (§18) ============ */
sec('12. Improvement Loop');
T('시작 전 분석 거부', O.loopAnalyze('x').reason === 'start_first');
O.loopStart();
T('중복 시작 거부', O.loopStart().reason === 'cycle_open');
T('측정 없는 분석 거부', O.loopAnalyze('x').reason === 'measure_first');
T('분석 없는 개선 거부', O.loopImprove('x').reason === 'analyze_first');
O.record('export_count', 61);
T('측정 후 분석 허용', O.loopAnalyze('Export 상승').ok);
const it0 = O.loopState().iterations;
T('개선 완주 — 반복 증가·사이클 닫힘', O.loopImprove('유지').ok && O.loopState().iterations === it0 + 1 && O.loopState().open === false);

/* ============ 13. CS·KB·Comms (§14~16) ============ */
sec('13. CS·KB·Comms');
T('온보딩 5단계', O.ONBOARD_STEPS.length === 5);
T('미지 스텝 거부', O.onboardStep('u1', 'first_dance').ok === false);
['signup', 'first_template', 'first_edit', 'first_ai', 'first_export'].forEach((s) => O.onboardStep('u5', s));
T('완주 판정', O.onboardOf('u5').done === true && O.onboardOf('t01').done === false);
T('KB 6분류·검증', O.KB_CATS.length === 6 && O.kbAdd({ cat: 'gossip', title: 'x', body: 'y' }).ok === false);
T('KB 등록', O.kbAdd({ cat: 'architecture', title: '단일 진입점 8표', body: '우회=버그' }).ok);
const rfc = O.rfcCreate('요금제 Education 무상').rfc;
T('RFC — draft→accepted 불법 전이 차단', O.rfcAdvance(rfc.id, 'accepted').reason === 'illegal_transition');
O.rfcAdvance(rfc.id, 'review');
const decN = O.decisionLog().length;
T('RFC 채택 = 결정 로그 경유(ADR)', O.rfcAdvance(rfc.id, 'accepted').ok && O.decisionLog().length === decN + 1);
T('케이던스 3종', O.CADENCE.length === 3 && O.cadenceDue().every((c) => typeof c.cycles === 'number'));

/* ============ 14. Governance (§19) ============ */
sec('14. Governance');
T('결정 매트릭스 4영역', O.DECISION_MATRIX.length === 4 && O.DECISION_MATRIX.find((d) => d.area === 'release').decides === '준호');
T('RICE — 숫자 의무', O.priorityScore({ reach: 5, impact: 3 }).ok === false);
T('RICE 계산', O.priorityScore({ reach: 5, impact: 3, confidence: 0.9, effort: 2 }).score === 6.75);
const rank = O.priorityRank([{ name: 'a', reach: 1, impact: 1, confidence: 1, effort: 1 }, { name: 'b', reach: 5, impact: 3, confidence: 1, effort: 1 }]);
T('랭킹 내림차순', rank[0].name === 'b');
T('승인 — 권한자 강제', O.approve('release', '베프').reason === 'wrong_approver' && O.approve('release', '준호').ok);
T('미지 항목 거부', O.approve('vibes', '준호').ok === false);

/* ============ 15. Deliverables·완료 (§20·§21) ============ */
sec('15. Deliverables·완료');
const del = O.deliverables();
T('산출물 8종 전부 ready', del.length === 8 && del.every((d) => d.ready), JSON.stringify(del.filter((d) => !d.ready)));
T('완료 조건 충족', O.complete() === true);

/* ============ 16. 화면 (#/ops) ============ */
sec('16. 화면');
const scr = window.MK_SCREENS.ops;
T('화면 등록', scr && typeof scr.render === 'function' && typeof scr.mount === 'function');
const hostEl = window.document.createElement('div');
hostEl.className = 'pg-screen';
window.document.body.appendChild(hostEl);
hostEl.innerHTML = scr.render();
scr.mount(hostEl);
T('8탭', hostEl.querySelectorAll('[data-ops-tab]').length === 8);
T('개요 — 산출물 8/8 표기', hostEl.textContent.includes('8/8'));
hostEl.querySelector('[data-ops-tab="inc"]').click();
T('인시던트 탭 — 테이블·포스트모템 열', hostEl.textContent.includes('포스트모템'));
hostEl.querySelector('[data-ops-tab="gov"]').click();
T('거버넌스 탭 — RICE 랭킹 렌더', hostEl.textContent.includes('RICE'));
T('NAV 등재', fs.readFileSync('app.js', 'utf8').includes("['ops', '⚙️', 'Ops']"));
T('index 스크립트 등재', html.includes('data/ops.js') && html.includes('screens/ops.js'));

console.log(`\nRound 26 — pass ${pass} / fail ${fail} (total ${pass + fail})`);
process.exit(fail ? 1 : 0);
