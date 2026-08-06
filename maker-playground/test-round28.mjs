/* Round 28 — Invisible UX (MK_INVIS) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/invisible' });
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

const V = window.MK_INVIS, S = window.MK_SIMPLE;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 철학 (§0) ============ */
sec('1. 철학');
T('공개 표면', typeof V.auditReport === 'function' && typeof V.complete === 'function' && typeof V.designReview === 'function');
T('철학 — notice·주인공', V.PHILOSOPHY.best.includes('notice') && V.PHILOSOPHY.hero.includes('콘텐츠') === false ? false : V.PHILOSOPHY.hero.includes('주인공'));
T('철학 — 결과물 집중', V.PHILOSOPHY.user.includes('결과물'));

/* ============ 2. Interface Audit (§1) ============ */
sec('2. UI 감사');
const ar = V.auditReport();
T('요소 16종 전수', ar.total === 16);
T('4질문 전답', ar.allAnswered);
T('4질문 미답 등록 거부', V.auditEl('zzz', { q: { needed: true } }).reason === 'four_questions_required');
T('중복 등록 거부', V.auditEl('palette', { q: { needed: true, removable: false, automatable: false, aiReplaceable: false } }).reason === 'dup_or_no_id');
T('평결 4분류 — 유지·제거·자동화·AI', ar.keep.length > 0 && ar.remove.length > 0 && ar.automate.length > 0 && ar.ai.length > 0);
T('저장 버튼 = 자동화 평결', V.AUDIT.find((a) => a.id === 'save-button').verdict === 'automate');
T('고정 AI 패널 = 제거 평결(§7 근거)', V.AUDIT.find((a) => a.id === 'ai-panel-fixed').verdict === 'remove');
T('스마트 툴바·팔레트 = 유지', ['toolbar-smart', 'palette', 'home-question'].every((id) => V.AUDIT.find((a) => a.id === id).verdict === 'keep'));
T('축소율 ≥ 50%', ar.reducedRatio >= 0.5, String(ar.reducedRatio));

/* ============ 3. Decision Reduction (§2) ============ */
sec('3. 결정 감축');
const dr = V.decisionReduction();
T('종전 14 → 현재 2', dr.before === 14 && dr.after === 2);
T('감축률 ≥ 50%', dr.rate >= 0.5 && dr.ok, String(dr.rate));
T('제거된 결정 전부 처리 방식 명시', dr.unresolved.length === 0);
T('남긴 결정 = 한 문장 + 고르기', dr.kept.map((k) => k.id).join(',') === 'what,pick');

/* ============ 4. Default First (§3) ============ */
sec('4. 기본값 우선');
const da = V.defaultAudit();
T('default 지정 전 항목 기본값 보유', da.ok && da.missing.length === 0);
T('기본값 전부 수정 가능(잠금 0)', da.locked.length === 0);
T('폰트 기본값 = 장식 0 근거', V.DEFAULTS.font.why.includes('장식'));

/* ============ 5. Context First (§4) ============ */
sec('5. 컨텍스트 우선');
const ca = V.contextAudit();
T('전 컨텍스트 ≤6항목 · full 금지', ca.ok && ca.leaked.length === 0);
T('전문 기능 컨텍스트 누출 0', !ca.expertLeak);
T('무선택 = 추가만', ca.rows.find((r) => r.type === 'none').items.join(',') === 'add');

/* ============ 6. One Goal (§5) · Workflow (§6) ============ */
sec('6. 한 화면 한 목표 · 자연 흐름');
T('전 화면 목표 정확히 1개', V.oneGoalAudit().ok);
const wf = V.workflowAudit();
T('arrive→done 도달 ≤5홉', wf.ok && wf.chain[0] === 'arrive' && wf.chain.includes('done'));
T('전 단계 다음 준비물 보유', wf.allPrepared);
T('predictNext — intent 다음은 candidates', V.predictNext('intent').next === 'candidates');
T('미지 상태는 null', V.predictNext('없는상태') === null);

/* ============ 7. AI Companion (§7) ============ */
sec('7. AI 동반자');
T('평상시 숨김', !V.companion({}).visible);
T('20초 멈춤에 등장', V.companion({ idleSec: 25 }).visible && V.companion({ idleSec: 25 }).triggers.includes('stuck'));
T('19초는 아직 아님', !V.companion({ idleSec: 19 }).visible);
T('오류·호출·빈 문서 트리거', V.companion({ error: true }).visible && V.companion({ asked: true }).visible && V.companion({ elements: 0 }).visible);
T('패널이 아니다', V.companion({ error: true }).isPanel === false);
T('동반자 감사 통과', V.companionAudit().ok);

/* ============ 8. Smart Toolbar (§8) · Empty Space (§9) ============ */
sec('8. 스마트 툴바 · 여백');
const ta = V.toolbarAudit();
T('text ≠ image 툴바 실차이', ta.ok && ta.differs);
T('무선택 툴바 ≤ text 툴바', ta.sizes.none <= ta.sizes.text);
T('홈 여백 ≥ 40%', V.spaceBudget().ok && V.spaceBudget().whitespace >= 0.4);
T('과밀 스펙은 실패', !V.spaceBudget({ items: ['a', 'b', 'c', 'd', 'e'], menuCount: 25, question: 'q' }).ok);

/* ============ 9. Motion (§10) · Typography (§11) ============ */
sec('9. 모션 · 타이포');
T('장식 모션 등록 거부', V.registerMotion('sparkle', 'decoration', 100).reason === 'decorative_rejected');
T('300ms 초과 거부', V.registerMotion('slow', 'feedback', 900).reason === 'too_long');
T('등록 모션 전부 목적·≤300ms', V.motionAudit().ok && V.MOTIONS.length === 4);
T('서체 ≤2계열 · 장식 0 · 스케일 단조', V.typeAudit().ok);

/* ============ 10. Search (§12) · Intent (§13) ============ */
sec('10. 검색 · 의도');
const se = V.searchEverything('발표');
T('그룹 순서 — 만들 것·템플릿·기능', se.groups.map((g) => g.id).join(',') === 'make,templates,features');
T('기능이 마지막', se.featuresLast);
T('"발표" → 만들 것 그룹 실채움', se.groups[0].items.length > 0);
const it = V.intent('발표');
T('사용자 결정 = 입력 1회', it.userDecisions === 1);
T('MK_AI 실생성 — 씬 > 0', it.produced && it.scenes > 0, String(it.scenes));
T('단계 5 — input만 수동', it.steps.length === 5 && it.steps.filter((s) => s.auto).length === 4);
T('의도 판정 통과', it.ok);

/* ============ 11. Silent Automation (§14) ============ */
sec('11. 무알림 자동화');
T('5종 — 저장·정렬·그룹·이름·추천', V.AUTOS.map((a) => a.id).join(',') === 'auto-save,auto-align,auto-group,auto-name,auto-recommend');
T('silent ⇒ undoable 전부', V.silentAudit().ok && V.silentAudit().dangerous.length === 0);
const ra = V.runAuto('auto-save');
T('실행 — 무알림·저널 기록', ra.ok && ra.toast === null && ra.entry.notified === false && V.journal.length === 1);
T('미지 자동화 거부', V.runAuto('auto-hack').reason === 'unknown');

/* ============ 12. Mastery (§15) · Emotion (§16) · Friction (§17) ============ */
sec('12. 숙련 · 감정 · 마찰');
const mc = V.masteryCurve();
T('첫날 ≤5 → 장기 3배 이상 · 단조', mc.ok, JSON.stringify(mc.points.map((p) => p.features)));
T('학습 이벤트 0 · 수동 노출', mc.learningEvents === 0 && mc.passiveReveal);
T('기능 우주 집계 — 메뉴+명령+컨텍스트', mc.universe.total === mc.universe.menu + mc.universe.cmds + mc.universe.ctx && mc.universe.total > 30);
T('감정 6순간 전부 해소', V.emotionAudit().ok && V.EMOTIONS.length === 6);
const fr = V.friction();
T('클릭 ≤3 · 첫 결과물 입력 1회', fr.ok && fr.inputs.firstOutput === 1);
T('대기 구간 전부 피드백', fr.waits.every((w) => !!w.feedback));

/* ============ 13. Design Review 게이트 (§18) ============ */
sec('13. 디자인 리뷰 게이트');
T('추가만 제안 = 거부', !V.designReview({ adds: ['새 패널'] }).ok);
T('삭제 미달 제안 = 거부', !V.designReview({ adds: ['a', 'b'], removes: ['c'] }).ok);
T('삭제 ≥ 추가 = 승인', V.designReview({ adds: ['a'], removes: ['b', 'c'] }).ok);
T('추가 없음 = 통과', V.designReview({ removes: ['x'] }).ok);

/* ============ 14. Metrics (§19) · Deliverables (§20) · 완료 (§21) ============ */
sec('14. 지표 · 산출물 · 완료');
const mt = V.metrics();
T('지표 6종', mt.length === 6);
T('클릭·검색·AI 지표 실측 통과', ['clicks', 'search-rate', 'ai-rate'].every((id) => mt.find((m) => m.id === id).pass === true));
T('만족도는 시뮬 금지 — 실측 대기', mt.find((m) => m.id === 'ux-satisfaction').pass === null);
const del = V.deliverables();
T('산출물 7종 전부 ready', del.length === 7 && del.every((d) => d.ready), del.filter((d) => !d.ready).map((d) => d.id).join(','));
T('기억 테스트 — UI 기억 0 · 한 문장만', V.memoryTest().ok && V.memoryTest().takeaway.includes('편했다'));
T('complete() = true', V.complete());

/* ============ 15. 통합 — 화면·내비·회귀 접점 ============ */
sec('15. 통합');
T('화면 등록 — #/invisible', !!window.MK_SCREENS.invisible && typeof window.MK_SCREENS.invisible.mount === 'function');
T('화면 렌더 — 8탭', (window.MK_SCREENS.invisible.render().match(/data-iv-tab/g) || []).length === 8);
T('MK_SIMPLE 등재 — expert 분류', S.MENU.invisible && S.MENU.invisible.cls === 'expert');
T('초보자 시야에 없음(§4 실증)', !S.navFor({ edits: 0 }).includes('invisible'));
T('초보자 금지 감사 여전히 누출 0', S.beginnerAudit().ok);
T('팔레트로는 도달(§12)', S.paletteSearch('invisible', { edits: 0 }).items.some((i) => i.id === 'invisible'));
T('MK_SIMPLE 회귀 — complete 유지', S.complete());
T('app.js 내비 등재', fs.readFileSync('app.js', 'utf8').includes("['invisible', '🫥', 'Invisible']"));

console.log(`\nRound 28 — pass ${pass} / fail ${fail} / total ${pass + fail}`);
process.exit(fail ? 1 : 0);
