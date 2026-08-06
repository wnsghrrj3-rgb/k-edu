/* Round 30 — Ruthless Simplification Audit (MK_TEN) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/audit' });
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

const T10 = window.MK_TEN, S = window.MK_SIMPLE, F = window.MK_FLOW;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 철학·표면 (§0) ============ */
sec('1. 철학·표면');
T('공개 표면', ['take', 'verdict', 'inventoryAudit', 'deliverables', 'complete', 'uiFor', 'fiveSecTest'].every((k) => typeof T10[k] === 'function'));
T('철학 — 전부 보여줘서 생긴다', T10.PHILOSOPHY.cause.includes('모두 보여줘서') || T10.PHILOSOPHY.cause.includes('전부'));
T('철학 — 결과물', T10.PHILOSOPHY.user.includes('결과물'));
T('목표 — 100→10', T10.PHILOSOPHY.goal.includes('100') && T10.PHILOSOPHY.goal.includes('10'));

/* ============ 2. Zero-based 전수 (§1) ============ */
sec('2. Zero-based 전수');
const inv = T10.inventoryAudit();
T('정확히 100개', inv.total === 100, String(inv.total));
T('라이브 대비 누락 0 (MENU·CMDS·CTX)', inv.ok && inv.missing.length === 0, JSON.stringify(inv.missing));
T('감사 화면 자신도 등재 — 예외 없음', T10.FEATURES.some((f) => f.id === 'scr-audit'));
T('"이미 있으니까 유지" 사유 등재 거부', !T10.take('zz1', { label: 'x', src: 'cap', exp: 'edit', reason: '이미 있으니까 유지', a: { freq: 'rare', beginner: false, ai: false, auto: false, hide: true, del: false } }).ok);
T('legacy 거부 사유 명시', T10.take('zz2', { label: 'x', src: 'cap', exp: 'edit', reason: '기존 유지', a: { freq: 'rare', beginner: false, ai: false, auto: false, hide: true, del: false } }).reason === 'legacy_reason_banned');
T('중복 등재 거부', !T10.take('scr-home', { src: 'cap', exp: 'ask', a: { freq: 'daily', beginner: true, ai: false, auto: false, hide: false, del: false } }).ok);
T('출처 없는 등재 거부', T10.take('zz3', { exp: 'edit', a: { freq: 'rare', beginner: false, ai: false, auto: false, hide: true, del: false } }).reason === 'no_source');

/* ============ 3. 6질문 (§2) ============ */
sec('3. 6질문 평가');
T('6질문 정의', T10.SIX.join(',') === 'freq,beginner,ai,auto,hide,del');
const miss = T10.take('zz4', { src: 'cap', exp: 'edit', a: { freq: 'rare', beginner: false } });
T('미답 등재 거부', !miss.ok && miss.reason === 'six_questions_required' && miss.missing.length === 4, JSON.stringify(miss.missing));
T('빈도 미지값 거부', !T10.take('zz5', { src: 'cap', exp: 'edit', a: { freq: 'always', beginner: true, ai: false, auto: false, hide: false, del: false } }).ok);
const ea = T10.evalAudit();
T('100개 전건 완답', ea.ok && ea.unanswered.length === 0, JSON.stringify(ea.unanswered));
T('평결 유도 — 삭제 최우선', T10.verdict({ del: true, ai: true, auto: true, hide: true, beginner: true }) === 'delete');
T('평결 유도 — AI > 자동 > 숨김', T10.verdict({ ai: true, auto: true, hide: true }) === 'ai' && T10.verdict({ auto: true, hide: true }) === 'auto' && T10.verdict({ hide: true, beginner: true }) === 'hide');
T('평결 유도 — 비초보자는 자동 숨김', T10.verdict({ beginner: false, freq: 'rare' }) === 'hide');
T('평결 유도 — 유지', T10.verdict({ beginner: true, freq: 'daily' }) === 'keep');
T('생존 기능은 경험 귀속 필수', T10.take('zz6', { src: 'cap', a: { freq: 'rare', beginner: false, ai: false, auto: false, hide: true, del: false } }).reason === 'experience_required');
T('삭제 평결은 경험 불요', T10.FEATURES.filter((f) => f.verdict === 'delete').every((f) => f.exp === null));

/* ============ 4. 10경험 ============ */
sec('4. 10경험');
const xa = T10.experienceAudit();
T('경험 정확히 10개', T10.EXPERIENCES.length === 10);
T('빈 경험 0 — 전 경험 ≥1 기능', xa.ok && xa.empty.length === 0, JSON.stringify(xa.empty));
T('경험 이름은 사용자 문장(기능 언어 아님)', T10.EXPERIENCES.every((e) => !/Assets|Export|Brand|Library/i.test(e.label)));
T('생존 기능 전부 1개 경험 귀속', ea.unmapped.length === 0, JSON.stringify(ea.unmapped));
T('IA 뿌리 = 질문 하나', T10.ia().root === '무엇을 만들까요?' && T10.ia().branches.length === 10);

/* ============ 5. 삭제·숨김·통합 (§8·§9·§10) ============ */
sec('5. Delete·Hide·Merge');
const dr = T10.deleteReport();
T('삭제 ≥30%', dr.ok && dr.share >= 0.30, dr.count + '/' + T10.FEATURES.length);
T('삭제 전건 사유 문서화', dr.undocumented.length === 0, JSON.stringify(dr.undocumented));
T('노출 삭제 원칙 명시(Bible §0)', dr.note.includes('코드') && dr.note.includes('생존'));
T('settings 명령 삭제 — 헌법 §3 정합', dr.rows.some((r) => r.id === 'cmd-settings'));
T('숨김 리포트 실존', T10.hideReport().ok && T10.hideReport().count > 0);
const mr = T10.mergeReport();
T('통합 ≥3그룹', mr.ok && mr.groups.length >= 3);
T('통합 참조 무결 — 전 항목 인벤토리 실존', mr.badRef.length === 0, JSON.stringify(mr.badRef));
T('공유 5버튼 → 1 통합', mr.groups.some((g) => g.into === '공유하기' && g.from.length === 5));

/* ============ 6. 메뉴 다이어트 (§3) ============ */
sec('6. 메뉴 다이어트');
const da = T10.dietAudit();
T('현행 내비 실측(제품 표면)', da.current >= 20, String(da.current));
T('새 메뉴 ≤ 절반', da.ok && da.next <= da.allowed, da.next + '/' + da.allowed);
T('새 메뉴 ≤5 — 5초 이해', da.next <= 5);
T('새 메뉴는 경험에서 파생', da.menu.every((m) => T10.EXPERIENCES.some((e) => e.id === m.id && e.menu)));

/* ============ 7. 홈·이름·시선 (§4·§5·§11·§12) ============ */
sec('7. 홈·이름·시선');
T('홈 = 질문 하나·메뉴 0', T10.homeAudit().ok);
const na = T10.nameAudit();
T('개명 5쌍 이상(Library·Assets·Brand·Workflow·Export)', Object.keys(T10.RENAMES).length >= 5 && ['Library', 'Assets', 'Brand', 'Workflow'].every((k) => T10.RENAMES[k]));
T('새 표면 금지 용어 0', na.ok && na.hits.length === 0, JSON.stringify(na.hits));
const ga = T10.gazeAudit();
T('시선 스펙 4화면 — 1번 버튼 확정', ga.ok && ga.screens === 4, JSON.stringify(ga.bad));
T('홈 1번 시선 = homeSpec.primary 일치', ga.homeMatch);

/* ============ 8. Mastery 5레벨 (§6) ============ */
sec('8. 5레벨');
T('레벨 5단계 정의(첫날~Power)', T10.LEVELS.length === 5 && T10.LEVELS[0].label === '첫날' && T10.LEVELS[4].label === 'Power User');
T('레벨 판정 — 첫날', T10.levelOf({ edits: 0 }) === 1);
T('레벨 판정 — 1주·1개월·6개월', T10.levelOf({ edits: 5 }) === 2 && T10.levelOf({ edits: 20 }) === 3 && T10.levelOf({ edits: 100 }) === 4);
T('편집 9999회도 L5 자동 승격 없음', T10.levelOf({ edits: 9999 }) === 4);
T('L5 는 옵트인만', T10.levelOf({ powerOptIn: true }) === 5);
const ma = T10.masteryAudit();
T('레벨별 UI 단조 확장', ma.mono);
T('L1 노출 기능 ≤10', ma.l1Count <= 10, String(ma.l1Count));
T('L5 = 경험 10 전부', T10.uiFor(5).experiences.length === 10);
T('L1 < L3 < L5 노출량', T10.uiFor(1).features.length < T10.uiFor(3).features.length && T10.uiFor(3).features.length < T10.uiFor(5).features.length);
T('마스터리 감사 통과', ma.ok);

/* ============ 9. AI 용해 (§7) ============ */
sec('9. AI 용해');
const aa = T10.aiAudit();
T('새 메뉴에 AI 단독 항목 없음', !aa.menuHasAI);
T('글·사진·장면 문맥마다 AI 실존', aa.ctxAI);
T('홈 1번 시선 = AI 입력', aa.homeAI);
T('동반자 트리거 기반', aa.companionTriggered);
T('AI 감사 종합 통과', aa.ok);

/* ============ 10. 결정·여백·클릭 (§13·§14·§15) ============ */
sec('10. 결정·여백·클릭');
const dc = T10.decisionAudit();
T('사용자 결정 ≤2 (라이브)', dc.ok && dc.after <= 2, dc.before + '→' + dc.after);
const spx = T10.spaceAudit();
T('여백 예산 준수', spx.ok);
T('"빈 공간 채우기" 추가는 리뷰 거부', spx.addOnlyRejected);
T('전 명령 ≤3클릭', T10.clickAudit().ok, JSON.stringify(T10.clickAudit().over));

/* ============ 11. 5초·5분·전문가 (§16·§17·§18) ============ */
sec('11. 3대 테스트');
const f5 = T10.fiveSecTest();
T('5초 3질문 전답', f5.ok && f5.answers.what && f5.answers.canMake && f5.answers.start);
const bad5 = T10.fiveSecTest({ question: '시작할까요?', items: [], menuCount: 12, primary: null });
T('불량 스펙(메뉴 12) 실패 실연', !bad5.ok);
const fm = T10.fiveMinTest();
T('5분 예산 내 첫 결과물(실생성 경로)', fm.ok && fm.actualSec <= 300, String(fm.actualSec));
T('가입 단계 0', (fm.route.signupSteps || 0) === 0);
const ex = T10.expertTest();
T('팔레트 도달 ≥15 — 숨겨도 전부 발견', ex.ok && ex.paletteReach >= 15, String(ex.paletteReach));
T('전 명령 단축키 보유', ex.shortcutsAll);
T('옵트인 시 내비 확장 — 전문가는 넓게', ex.optInWider);

/* ============ 12. Before/After·산출물·완료 (§19·§20) ============ */
sec('12. 산출물·완료');
const ba = T10.beforeAfter();
T('메뉴 절반 이하 축소 수치', ba.menus.after <= Math.floor(ba.menus.before / 2), JSON.stringify(ba.menus));
T('첫날 노출 100 → ≤10', ba.visibleDay1.after <= 10);
T('결정 14→2 수치 연동', ba.decisions.before === 14 && ba.decisions.after === 2);
T('여정 5단계 — 30초 첫 결과물 포함', T10.journey().steps.length === 5 && T10.journey().steps.some((s) => s.do.includes('첫 결과물')));
const ds = T10.deliverables();
T('Deliverables 8종', ds.length === 8);
T('8종 전부 ready', ds.every((d) => d.ready), JSON.stringify(ds.filter((d) => !d.ready).map((d) => d.id)));
T('완료 조건(§20) 충족', T10.complete());

/* ============ 13. 통합 — 기존 계층 정합 ============ */
sec('13. 계층 정합');
T('감사 화면 expert 등록 — 초보자 내비 불증가', S.MENU.audit && S.MENU.audit.cls === 'expert' && !S.navFor({ edits: 0 }).includes('audit'));
T('초보자 내비 ≤5 유지(헌법 CAPS)', S.navFor({ edits: 0 }).length <= 5);
T('헌법 20개조 비준 유지', window.MK_CONST.ratify().ok);
T('MK_SIMPLE complete 유지', S.complete());
T('MK_INVIS 기억 테스트 유지', window.MK_INVIS.complete ? window.MK_INVIS.complete() : true);

/* ============ 14. 화면 (#/audit) ============ */
sec('14. 화면');
const scr = window.MK_SCREENS.audit;
T('화면 등록', !!scr && typeof scr.render === 'function');
window.PG.go('audit');
const body = window.document.getElementById('pgBody');
T('8탭', body.querySelectorAll('[data-au-tab]').length === 8);
T('개요 — 100·10·삭제% 표기', body.textContent.includes('100') && body.textContent.includes('삭제'));
/* legacy 거부 실연 버튼 */
body.querySelector('[data-au-try="legacy"]').click();
T('legacy 등재 거부 화면 실연', window.document.getElementById('pgBody').textContent.includes('legacy_reason_banned'));
window.document.querySelector('[data-au-try="six"]').click();
T('6질문 미답 거부 화면 실연', window.document.getElementById('pgBody').textContent.includes('six_questions_required'));
/* 레벨 탭 실연 */
window.document.querySelector('[data-au-tab="lv"]').click();
const lvBtns = window.document.querySelectorAll('[data-au-lv]');
T('레벨 버튼 5개', lvBtns.length === 5);
window.document.querySelector('[data-au-lv="5"]').click();
T('L5 전환 — 경험 10/10 표기', window.document.getElementById('pgBody').textContent.includes('10/10'));
/* 테스트 탭 — 불량 스펙 실패 실연 */
window.document.querySelector('[data-au-tab="test"]').click();
window.document.querySelector('[data-au-bad]').click();
T('불량 스펙 5초 실패 실연', window.document.getElementById('pgBody').textContent.includes('실패'));
/* 산출물 탭 */
window.document.querySelector('[data-au-tab="out"]').click();
T('산출물 탭 — 완료 조건 표기', window.document.getElementById('pgBody').textContent.includes('너무 쉽다'));

console.log(`\nRound30: ${pass}/${pass + fail} ${fail ? '❌' : '✅'}`);
process.exit(fail ? 1 : 0);
