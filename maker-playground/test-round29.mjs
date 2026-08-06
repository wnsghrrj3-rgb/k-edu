/* Round 29 — The K-MAKER Constitution (MK_CONST) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/constitution' });
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

const C = window.MK_CONST, S = window.MK_SIMPLE, I = window.MK_INVIS;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 전문 (§0·§1) ============ */
sec('1. 전문');
T('공개 표면', typeof C.ratify === 'function' && typeof C.judge === 'function' && typeof C.adopt === 'function' && typeof C.complete === 'function');
T('Mission — 배우기 쉬운 + 전문가 수준', C.MISSION.includes('배우기 쉬운') && C.MISSION.includes('전문가'));
T('Ultimate — 도구가 아니라 아이디어', C.ULTIMATE.includes('아이디어') && C.ULTIMATE.includes('도구'));

/* ============ 2. Golden Rules (§2) ============ */
sec('2. 5질문 게이트');
T('5질문 정의', C.GOLDEN_QUESTIONS.length === 5 && C.GOLDEN_QUESTIONS.map((g) => g.id).join(',') === 'needed,simpler,ai,auto,hide');
T('미답 게이트 차단', !C.goldenGate({ needed: true }).ok && C.goldenGate({ needed: true }).missing.length === 4);
T('전답 게이트 개방', C.goldenGate({ needed: true, simpler: false, ai: false, auto: false, hide: false }).ok);

/* ============ 3. Never Do (§3) ============ */
sec('3. 5금지');
const na = C.neverAudit();
T('금지 5개조', na.rows.length === 5);
T('5금지 전부 현재 제품 준수', na.ok, JSON.stringify(na.rows.filter((r) => !r.ok).map((r) => r.id)));
T('설정 화면 0', C.countSettings() === 0);
T('초보자 내비 ≤5 상한', S.navFor({ edits: 0 }).length <= C.CAPS.beginnerNav);
T('전문 용어 노출 0', C.jargonAudit().count === 0, JSON.stringify(C.jargonAudit().hits));
T('용어 감사 표면 실존(내비+홈 질문)', C.jargonAudit().surface.length >= 4);

/* ============ 4. Always Do (§4) ============ */
sec('4. 4의무');
const aa = C.alwaysAudit();
T('의무 4개조', aa.rows.length === 4);
T('4의무 전부 이행', aa.ok, JSON.stringify(aa.rows.filter((r) => !r.ok).map((r) => r.id)));

/* ============ 5. Hierarchy (§5) · Simplicity (§6) ============ */
sec('5. 위계·단순성');
const h = C.hierarchyAudit();
T('첫 화면 최소·hero 1·스케일 단조·단계 공개', h.ok && h.hero === 1);
const t3 = C.simplicityTest();
T('초등학생 경로 5단계', t3.path.length === 5);
T('3분 한도 통과', t3.ok && t3.totalSec <= 180, String(t3.totalSec));
T('사용자 결정 1회(입력 한 문장)', t3.userDecisions === 1);
T('읽기 수준 — 용어 0', t3.readingLevel);

/* ============ 6. 철학 8종 (§7~§14) ============ */
sec('6. 철학');
const pa = C.philosophyAudit();
T('철학 8개조', pa.rows.length === 8);
T('8철학 전부 실측 통과', pa.ok, JSON.stringify(pa.rows.filter((r) => !r.ok).map((r) => r.id)));
T('AI 철학 — 최종 선택은 사용자(pick)', pa.rows.find((r) => r.id === 'ai').ok);
T('Trust — silent⇒undoable·트리거 4 고정', pa.rows.find((r) => r.id === 'trust').ok);
T('User First — 검색 1순위 결과물', pa.rows.find((r) => r.id === 'user-first').ok);

/* ============ 7. Decision Framework (§15) ============ */
sec('7. 6단계 심사');
T('6단계 순서 고정', C.FRAMEWORK_STEPS.length === 6 && C.FRAMEWORK_STEPS.every((s, i) => s.n === i + 1));
T('미답 제안 = 심사 불가', C.judge({ answers: { needed: true } }).verdict === 'unanswerable');
T('불필요 = 1단 기각', C.judge({ answers: { needed: false, simpler: true, ai: false, auto: false, hide: false } }).verdict === 'reject');
T('기존 기능 = 2단 종결', C.judge({ answers: { needed: true, simpler: true, ai: true, auto: true, hide: true, existing: true } }).verdict === 'use_existing');
T('AI 해결 = 3단 종결', C.judge({ answers: { needed: true, simpler: true, ai: true, auto: true, hide: true } }).verdict === 'delegate_ai');
T('자동화 = 4단 종결', C.judge({ answers: { needed: true, simpler: true, ai: false, auto: true, hide: true } }).verdict === 'automate');
T('숨김 = 5단 종결', C.judge({ answers: { needed: true, simpler: true, ai: false, auto: false, hide: true } }).verdict === 'hide');
T('전 단계 통과 = 6단 제작(최후 수단)', C.judge({ answers: { needed: true, simpler: false, ai: false, auto: false, hide: false } }).verdict === 'build');
T('심사 경로(trail) 기록', C.judge({ answers: { needed: true, simpler: true, ai: false, auto: true, hide: false } }).trail.length === 4);

/* ============ 8. Delete First (§16) · Release (§17) ============ */
sec('8. 삭제 우선·릴리스');
T('삭제 탐색 없는 추가 = 심사 불가', !C.deleteFirst({ adds: ['x'] }).ok);
T('탐색 완료 + 삭제≥추가 = 승인', C.deleteFirst({ adds: ['x'], deletionSearched: true, removes: ['a', 'b'] }).ok);
T('탐색 완료라도 add-only = MK_INVIS 게이트 기각', !C.deleteFirst({ adds: ['x'], deletionSearched: true }).ok);
T('회귀 없는 릴리스 불가', !C.releaseGate({ tests: true, regression: false, honest: true }).ok);
T('기능 개수 목표 릴리스 불가', !C.releaseGate({ tests: true, regression: true, honest: true, featureCountGoal: 50 }).ok);
T('완비 릴리스 가능', C.releaseGate({ tests: true, regression: true, honest: true }).ok);

/* ============ 9. Success (§18) · Supremacy (§19) ============ */
sec('9. 성공 정의·최고규범');
T('성공 = "편했다" · 만족도 실측 전 공란', C.successCheck().ok && C.successCheck().honestMetric);
T('매력 100 + 메뉴 증가 = 기각·매력 무시', (() => { const r = C.adopt({ appeal: 100, addsBeginnerMenu: true, answers: { needed: true, simpler: false, ai: false, auto: false, hide: false } }); return !r.ok && r.appealIgnored && r.conflicts.length === 1; })());
T('AI 고정 패널 = 기각', !C.adopt({ appeal: 95, fixedAiPanel: true }).ok);
T('사회적 비교 기능 = K-edu 헌장 충돌 기각', (() => { const r = C.adopt({ socialComparison: true }); return !r.ok && r.conflicts[0].article.includes('헌장'); })());
T('충돌 0 + AI 해결 = 채택(delegate_ai)', (() => { const r = C.adopt({ appeal: 40, answers: { needed: true, simpler: true, ai: true, auto: false, hide: false } }); return r.ok && r.verdict === 'delegate_ai'; })());
T('build 판정도 삭제 탐색 없으면 최종 기각', (() => { const r = C.adopt({ adds: ['패널'], answers: { needed: true, simpler: false, ai: false, auto: false, hide: false } }); return !r.ok && r.verdict === 'rejected'; })());

/* ============ 10. 조문·비준 ============ */
sec('10. 조문·비준');
const r = C.ratify();
T('조문 20개조(§0~§19)', r.total === 20 && C.ARTICLES.every((a, i) => a.n === i));
T('전조 비준 통과', r.ok, JSON.stringify(r.failed));
T('§19 최고규범 조문 자체가 실검증(매력 기능 기각)', C.ARTICLES[19].verify());
T('§16 조문 — 양방향(차단·승인) 검증', C.ARTICLES[16].verify());

/* ============ 11. 산출물·체크리스트·완료 (§20·§21) ============ */
sec('11. 산출물·완료');
const d = C.deliverables();
T('Deliverables 8종', d.length === 8);
T('8종 전부 ready', d.every((x) => x.ready), JSON.stringify(d.filter((x) => !x.ready).map((x) => x.id)));
const cl = C.reviewChecklist();
T('체크리스트 12항 전부 판정값 보유', cl.length === 12 && cl.every((c) => typeof c.pass === 'boolean'));
T('체크리스트 전항 통과', cl.every((c) => c.pass), JSON.stringify(cl.filter((c) => !c.pass).map((c) => c.id)));
T('효력 10년', C.HORIZON.years === 10);
T('complete() = true', C.complete());

/* ============ 12. 화면·등록 ============ */
sec('12. 화면·등록');
T('#/constitution 화면 등록', !!window.MK_SCREENS.constitution && typeof window.MK_SCREENS.constitution.mount === 'function');
T('화면 8탭', (window.MK_SCREENS.constitution.render().match(/data-ct-tab=/g) || []).length === 8);
T('MK_SIMPLE expert 분류 등록(§3 실증 — 초보자 내비 불증가)', S.MENU.constitution && S.MENU.constitution.cls === 'expert' && !S.navFor({ edits: 0 }).includes('constitution'));
T('기능 추가 0 — 이 라운드가 초보자 표면을 바꾸지 않음', S.navFor({ edits: 0 }).length <= 5);

console.log(`\nRound 29: ${pass}/${pass + fail} ${fail === 0 ? 'ALL PASS' : 'FAIL ' + fail}`);
process.exit(fail === 0 ? 0 : 1);
