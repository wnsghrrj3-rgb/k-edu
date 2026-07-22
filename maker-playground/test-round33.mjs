/* Round 33 — User Journey (MK_JOURNEY) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/journey' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const J = window.MK_JOURNEY, S = window.MK_SIMPLE, I = window.MK_INVIS, C = window.MK_CONST;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 표면·철학 (§0) ============ */
sec('1. 표면·철학');
T('공개 표면', ['journeyAudit', 'journeySpecAudit', 'walk', 'painAudit', 'painSpecAudit', 'aiAudit', 'aiSpecAudit', 'reviewRun', 'quickWin', 'successAudit', 'microAudit', 'microSpecAudit', 'dropAudit', 'hiddenAudit', 'hiddenSpecAudit', 'emotionAudit', 'optimizeAudit', 'deviceWalk', 'deviceAudit', 'record', 'metrics', 'deliverables', 'deliverablesAudit', 'memoryTest', 'complete'].every((k) => typeof J[k] === 'function'));
T('철학 — Job 수행', J.PHILOSOPHY.role.includes('작업(Job)을 수행'));
T('철학 — 흐름 추종', J.PHILOSOPHY.rule.includes('작업 흐름'));
T('철학 — 화면부터 설계 금지', J.PHILOSOPHY.design.includes('화면부터 설계하지 않는다'));

/* ============ 2. 대표 사용자·작업 (§1·§2) ============ */
sec('2. 대표 사용자·작업');
T('페르소나 4 — 지시서 그대로', JSON.stringify(J.PERSONAS.map((p) => p.name)) === JSON.stringify(['교사', '학생', '일반 직장인', '콘텐츠 크리에이터']));
T('대표 작업 4 — 지시서 그대로', JSON.stringify(J.PERSONAS.map((p) => p.job)) === JSON.stringify(['수업자료 만들기', '발표 만들기', '제안서 만들기', '썸네일 만들기']));
T('personaOf 실조회·미지 null', J.personaOf('teacher').job === '수업자료 만들기' && J.personaOf('nope') === null);

/* ============ 3. Journey (§3) ============ */
sec('3. Journey');
T('7단계 지시서 순서', JSON.stringify(J.STAGES) === JSON.stringify(['start', 'ai', 'template', 'edit', 'review', 'share', 'done']));
const ja = J.journeyAudit();
T('4×7 = 28단계 전수 통과', ja.ok && ja.total === 28, JSON.stringify(ja.violations));
T('전 단계 실라우트 존재', J.PERSONAS.every((p) => J.JOURNEYS[p.id].every((s) => !!window.MK_SCREENS[s.route])));
T('메뉴 전이 0', J.PERSONAS.every((p) => J.JOURNEYS[p.id].every((s) => s.trigger !== 'menu')));
T('메뉴 전이 스펙 실거부', !J.journeySpecAudit({ stages: J.STAGES.map((s) => ({ stage: s, trigger: s === 'edit' ? 'menu' : 'action' })) }).ok);
T('단계 누락 스펙 실거부', !J.journeySpecAudit({ stages: [{ stage: 'start' }, { stage: 'edit' }] }).ok);
T('순서 붕괴 스펙 실거부', !J.journeySpecAudit({ stages: [...J.STAGES].reverse().map((s) => ({ stage: s, trigger: 'action' })) }).ok);
T('정상 스펙 통과', J.journeySpecAudit({ stages: J.STAGES.map((s) => ({ stage: s, trigger: 'action' })) }).ok);

/* walk — PG.go 실호출로 화면이 정말 이동 */
const w = J.walk('teacher');
T('walk 실이동 7단계', w.ok && w.visited.length === 7);
T('종착 = 홈(다음 프로젝트 시작)', w.endsAtHome && window.PG.state.screen === 'home');
T('중간 단계 editor 실도달', w.visited.some((x) => x.route === 'editor' && x.at === 'editor'));
T('공유 단계 export 실도달', w.visited.some((x) => x.route === 'export' && x.at === 'export'));
window.PG.go('journey');

/* ============ 4. Pain Point (§4) ============ */
sec('4. Pain Point');
const pa = J.painAudit();
T('28단계 전수 분석', pa.ok && pa.total === 28, JSON.stringify(pa.violations));
T('3질문 분포 — 세 축 모두 존재', J.PAIN_Q.every((q) => pa.byQ[q] > 0));
T('해소 엔진 실명 귀속', pa.rows.every((r) => J.ENGINES.includes(r.by)));
T('미답 스펙 실거부', !J.painSpecAudit({ what: '어렵다' }).ok);
T('해소 없는 스펙 실거부', !J.painSpecAudit({ q: 'hard', what: '어렵다' }).ok);
T('완전한 Pain 통과', J.painSpecAudit({ q: 'tedious', what: 'x', fix: 'y', by: 'MK_AI' }).ok);

/* ============ 5. AI 개입 (§5) ============ */
sec('5. AI 개입');
const aa = J.aiAudit();
T('3순간 < 7단계 — 항상 아님', aa.ok && aa.moments === 3 && aa.moments < aa.stages, JSON.stringify(aa.violations));
T('지시서 3순간 그대로', JSON.stringify(J.AI_MOMENTS.map((m) => m.at)) === JSON.stringify(['빈 화면', '레이아웃 막힘', '마무리']));
T('MK_INVIS 트리거 라이브 브리지', J.AI_MOMENTS[0].live() && J.AI_MOMENTS[1].live());
T('상시 등장 스펙 실거부', !J.aiSpecAudit({ always: true }).ok);
T('7단계 전부 AI 스펙 실거부', !J.aiSpecAudit({ moments: J.STAGES.map((s) => ({ stage: s })) }).ok);
T('3순간 스펙 통과', J.aiSpecAudit({ moments: [1, 2, 3] }).ok);
const rv = J.reviewRun();
T('검토 AI 실동작 — 실생성 문서 점검', rv.ok && rv.scenes > 0);
T('검토 결과 구조(findings 배열)', Array.isArray(rv.findings));

/* ============ 6. Quick Win (§6) ============ */
sec('6. Quick Win');
const q = J.quickWin();
T('30초 예산 통과·실생성', q.ok && q.sec <= 30 && q.produced && q.scenes > 0);
T('가입 0', q.noSignup === true);
T('"오, 쉽네" 순간 명시', q.moment.includes('쉽네'));

/* ============ 7. Success Moment (§7) ============ */
sec('7. Success Moment');
const sa = J.successAudit();
T('4명 전원 첫 성공 정의·여정 내 실존', sa.ok, JSON.stringify(sa.violations));
T('첫 Export·첫 발표·첫 공유 전부 포함', ['첫 Export', '첫 발표', '첫 공유'].every((k) => sa.kinds.includes(k)));

/* ============ 8. Micro Journey (§8) ============ */
sec('8. Micro Journey');
const ma = J.microAudit();
T('버튼 5 전부 4상 완비', ma.ok && ma.buttons === 5, JSON.stringify(ma.violations));
T('다음 추천 없는 스펙 실거부', !J.microSpecAudit({ click: 'c', feedback: 'f', done: 'd' }).ok);
T('피드백 없는 스펙 실거부', !J.microSpecAudit({ click: 'c', done: 'd', next: 'n' }).ok);
T('4상 완비 스펙 통과', J.microSpecAudit({ click: 'c', feedback: 'f', done: 'd', next: 'n' }).ok);

/* ============ 9. Drop-off (§9) ============ */
sec('9. Drop-off');
const da = J.dropAudit();
T('5지점 지시서 그대로', JSON.stringify(J.DROPS.map((d) => d.where)) === JSON.stringify(['가입', 'AI', '편집', 'Export', '공유']));
T('5지점 해소 전부 실측 통과', da.ok, JSON.stringify(da.open));
T('편집 이탈 해소 = 결정 ≤2 라이브', I.decisionReduction().after <= 2);

/* ============ 10. Hidden Complexity (§10) ============ */
sec('10. Hidden Complexity');
const ha = J.hiddenAudit();
T('설정 0·결정 ≤2 통과', ha.ok, JSON.stringify(ha.violations));
T('라이브 설정 수 = 0 (헌법 브리지)', ha.settingsLive === 0 && C.countSettings() === 0);
T('설정 단계 스펙 실거부', !J.hiddenSpecAudit({ stages: [{ settings: true }] }).ok);
T('결정 3 스펙 실거부', !J.hiddenSpecAudit({ stages: [{ decisions: 2 }, { decisions: 1 }] }).ok);
T('결정 2 스펙 통과', J.hiddenSpecAudit({ stages: [{ decisions: 1 }, { decisions: 1 }] }).ok);

/* ============ 11. Emotional Journey (§11) ============ */
sec('11. Emotional Journey');
const ea = J.emotionAudit();
T('5감정 사상 단조·장치 실명', ea.ok, JSON.stringify(ea.violations));
T('지시서 곡선 그대로', JSON.stringify(ea.arc) === JSON.stringify(['궁금함', '기대', '몰입', '성취감', '다음 프로젝트 시작']));
T('부정 감정 해소 선행(MK_INVIS)', I.emotionAudit().ok);

/* ============ 12. Optimization (§12) ============ */
sec('12. Optimization');
const oa = J.optimizeAudit();
T('4여정 전부 예산 내', oa.ok, JSON.stringify(oa.violations));
T('클릭 ≤8 · 결정 ≤2 · 설정 0', oa.rows.every((r) => r.clicks <= 8 && r.decisions <= 2 && r.settings === 0));
T('optimizeSpecAudit = 헌법 축 공유', !J.optimizeSpecAudit({ stages: [{ decisions: 3 }] }).ok);

/* ============ 13. Cross Device (§13) ============ */
sec('13. Cross Device');
const dv = J.deviceAudit();
T('PC→태블릿→모바일 순서', dv.order);
T('전 기기 라이브 + 연속성', dv.ok, JSON.stringify(dv.walk));
T('같은 docId 끝까지 운반', dv.walk.continuity && new Set(dv.walk.hops.map((h) => h.docId)).size === 1);

/* ============ 14. 지표 (§14) ============ */
sec('14. 지표');
T('5종 지시서 그대로', JSON.stringify(J.METRIC_KEYS) === JSON.stringify(['firstSuccessSec', 'dropRate', 'aiUsage', 'returnRate', 'completionRate']));
T('미실측 = null', J.metrics().every((m) => m.value === null && !m.measured));
T('미등록 지표 거부', !J.record('vanity', 1).ok);
T('비수치 거부', !J.record('aiUsage', 'many').ok);
T('record 유일 경로 실기록', J.record('aiUsage', 0.5).ok && J.metrics().find((m) => m.key === 'aiUsage').value === 0.5);

/* ============ 15. 산출물·완료 (§15·§16) ============ */
sec('15. 산출물·완료');
const d = J.deliverables();
T('8종 전부 준비', J.deliverablesAudit().ok && d.length === 8, JSON.stringify(J.deliverablesAudit().open));
T('4 여정 산출물 개별 실존', ['teacher-journey', 'student-journey', 'business-journey', 'creator-journey'].every((id) => d.find((x) => x.id === id && x.ready)));
const mt = J.memoryTest();
T('메뉴 전이 0 — 메뉴를 기억하지 않는다', mt.ok && mt.menuTransitions === 0);
T('전 여정 완료로 종결', mt.endsDone);
T('complete() 충족', J.complete());

/* ============ 16. 회귀 가드 ============ */
sec('16. 회귀 가드');
T('journey 화면 등재·8탭 렌더', typeof window.MK_SCREENS.journey.render === 'function' && (window.MK_SCREENS.journey.render().match(/data-jr-tab/g) || []).length === 8);
T('초보자 내비 불변(MK_SIMPLE)', S.navFor('beginner').length === 4);
T('MK_NAV 기본 구조 불변', window.MK_NAV.defaultAudit().ok && window.MK_NAV.rows().length === 4);

/* 화면 스모크 — 8탭 실렌더 + 실연 버튼 */
const root = window.document.createElement('div');
window.document.body.appendChild(root);
window.PG.state.screen = 'journey';
const scr = window.MK_SCREENS.journey;
for (const tab of ['over', 'map', 'pain', 'win', 'micro', 'emo', 'dev', 'out']) {
  root.innerHTML = ''; scr.render && (root.innerHTML = scr.render());
  const btn = root.querySelector(`[data-jr-tab="${tab}"]`);
  T('탭 실렌더 — ' + tab, !!btn);
  // 탭 상태 전환 후 본문 렌더 확인
  scr.mount(root);
  if (btn) { btn.onclick(); T('탭 본문 — ' + tab, root.innerHTML.length > 200); }
}
scr.mount(root);
const menuBtn = root.querySelector('[data-jr-menu]') || (root.innerHTML = scr.render(), scr.mount(root), root.querySelector('[data-jr-menu]'));
T('여정 지도 탭에서 메뉴 전이 실거부 실연', (() => {
  // map 탭으로 이동 후 버튼 실행
  root.innerHTML = scr.render(); scr.mount(root);
  const t = root.querySelector('[data-jr-tab="map"]'); if (t) t.onclick();
  const b = root.querySelector('[data-jr-menu]'); if (!b) return false;
  b.onclick();
  return root.innerHTML.includes('거부');
})());

console.log(`\nRound 33: ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);   /* walk 실이동이 home 타이머를 남기므로 명시 종료 */
