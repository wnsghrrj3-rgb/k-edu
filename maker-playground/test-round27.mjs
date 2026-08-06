/* Round 27 — Radical Simplification (MK_SIMPLE) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/simple' });
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

const S = window.MK_SIMPLE;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 철학·원칙 (§0·§1·§17) ============ */
sec('1. 철학·목표·원칙');
T('공개 표면', typeof S.register === 'function' && typeof S.complete === 'function' && typeof S.threeSecTest === 'function');
T('철학 — 결과물 우선', S.PHILOSOPHY.user.includes('결과물') && S.PHILOSOPHY.hero.includes('콘텐츠'));
T('목표 — 3초·5분', S.GOALS.threeSec === 3 && S.GOALS.firstOutputMin === 5);
T('원칙 4종', S.PRINCIPLES.length === 4 && S.PRINCIPLES.map((p) => p.id).join(',') === 'hide-complexity,show-purpose,reduce-decisions,keep-flow');

/* ============ 2. 메뉴 5분류 (§2) ============ */
sec('2. 메뉴 5분류');
T('분류 5종', JSON.stringify(S.CLASSES) === '["essential","hidden","deleted","ai","expert"]');
T('필수 4종만', S.byClass('essential').map((m) => m.id).sort().join(',') === 'ai,editor,home,library');
T('숨김 목록 — Brand·Asset·Video·Photo (§7)', ['brand', 'assets', 'videoMode', 'photoTools'].every((id) => S.MENU[id] && S.MENU[id].cls === 'hidden'));
T('삭제 목록 — 자리표시 화면들 (§12)', ['patterns', 'video', 'photo', 'templates'].every((id) => S.MENU[id].cls === 'deleted'));
T('AI 대체 — 깔때기·애니 스튜디오 (§10)', S.MENU.create.cls === 'ai' && S.MENU.animation.cls === 'ai');
T('전문가 — Export·Plugin·Admin·Dev 포함 (§6)', ['export', 'plugins', 'admin', 'dev', 'workspace', 'ops'].every((id) => S.MENU[id].cls === 'expert'));
T('중복 등록 거부', S.register('home', { cls: 'essential' }).reason === 'duplicate');
T('미지 분류 거부', S.register('zzz', { cls: '몰라' }).reason === 'unknown_class');
T('숨김 항목은 minUsage 보유', S.byClass('hidden').every((m) => typeof m.minUsage === 'number' && m.minUsage > 0));
/* 전 NAV 화면이 분류표에 존재 — 미분류 화면 없음 */
const NAV_IDS = ['foundations', 'components', 'patterns', 'screens', 'home', 'library', 'templates', 'assets', 'brand', 'team', 'editor', 'video', 'photo', 'ai', 'export', 'plugins', 'market', 'admin', 'dev', 'mobile', 'agent', 'flow', 'dls', 'ops'];
T('전 NAV 화면 분류 완료(전수)', NAV_IDS.every((id) => !!S.MENU[id]), NAV_IDS.filter((id) => !S.MENU[id]).join(','));

/* ============ 3. Progressive Disclosure (§5~§8) ============ */
sec('3. 단계 공개');
T('레벨 3종', JSON.stringify(S.LEVELS) === '["beginner","intermediate","expert"]');
T('편집 4회 = beginner', S.levelOf({ edits: 4 }) === 'beginner');
T('편집 5회 = intermediate (Flow PRO_THRESHOLD 동일 축)', S.levelOf({ edits: 5 }) === 'intermediate' && S.INTERMEDIATE_AT === window.MK_FLOW.PRO_THRESHOLD);
T('자동 승격 없음 — 편집 999회도 expert 아님 (§8)', S.levelOf({ edits: 999 }) === 'intermediate');
T('옵트인만 expert', S.levelOf({ edits: 0, expertOptIn: true }) === 'expert');
T('초보자 내비 = 필수 4개뿐', S.navFor({ edits: 0 }).sort().join(',') === 'ai,editor,home,library');
T('편집 5회 → 브랜드 노출', S.visibleFeatures({ edits: 5 }).includes('brand') && !S.visibleFeatures({ edits: 5 }).includes('assets'));
T('편집 8회 → 에셋 추가', S.visibleFeatures({ edits: 8 }).includes('assets'));
T('편집 16회 → 영상·사진(화면 밖 기능)', S.visibleFeatures({ edits: 16 }).includes('videoMode') && S.visibleFeatures({ edits: 16 }).includes('photoTools'));
T('화면 밖 기능은 내비 미등재', !S.navFor({ edits: 20 }).includes('videoMode'));
T('expert 내비에 전문가 도구 포함·삭제 항목 제외', (() => { const n = S.navFor({ edits: 20, expertOptIn: true }); return n.includes('admin') && n.includes('dev') && !n.includes('patterns') && !n.includes('video'); })());
T('nextReveal — 임계 순서', S.nextReveal({ edits: 0 }).id === 'brand' && S.nextReveal({ edits: 6 }).id === 'assets' && S.nextReveal({ edits: 100 }) === null);
T('초보자 금지 감사 — 누출 0 (§6)', S.beginnerAudit().ok && S.beginnerAudit().leaked.length === 0);
T('금지 목록에 지시 항목 전부', ['export', 'plugins', 'admin', 'dev', 'workspace'].every((b) => S.BEGINNER_BANNED.includes(b)));

/* ============ 4. 첫 화면 (§3·§4) ============ */
sec('4. 첫 화면');
T('질문 = 무엇을 만들까요?', S.FIRST_SCREEN.question === '무엇을 만들까요?');
T('허용 4요소 (§4)', JSON.stringify(S.FIRST_SCREEN.allowed) === '["ai-make","recent","templates","new-project"]');
T('단순화 홈 스펙 감사 통과', S.firstScreenAudit(S.homeSpec('beginner')).ok);
T('질문 2개 거부', !S.firstScreenAudit({ questions: ['a', 'b'], items: ['ai-make'] }).ok);
T('허용 밖 요소 거부', S.firstScreenAudit({ question: 'q', items: ['ai-make', 'export-panel'] }).violations.some((v) => v.includes('export-panel')));
T('메뉴 노출 거부', S.firstScreenAudit({ question: 'q', items: [], menuCount: 25 }).violations.some((v) => v.includes('25')));
T('초보자 홈에 종류 칩 없음 · 중급부터', !S.homeSpec('beginner').quickCreate && S.homeSpec('intermediate').quickCreate === true);

/* ============ 5. Context UI (§9) ============ */
sec('5. Context UI');
T('무선택 = 추가만', JSON.stringify(S.contextMenu('none').items) === '["add"]');
T('텍스트 ≠ 이미지 메뉴', S.contextMenu('text').items.join() !== S.contextMenu('image').items.join());
T('상시 전체 노출 금지', S.contextMenu('text').full === false);
T('MK_FLOW 툴바 브리지', Array.isArray(S.contextMenu('text').toolbar) && S.contextMenu('text').toolbar.length > 0);
T('미지 타입 = 최소 폴백', JSON.stringify(S.contextMenu('알수없음').items) === '["add"]');

/* ============ 6. 팔레트·발견 (§11·§19) ============ */
sec('6. 팔레트·발견');
T('숨김 기능 검색 도달 — Admin', (() => { const r = S.paletteSearch('admin', { edits: 0 }); return r.items.some((i) => i.id === 'admin' && i.hidden === true); })());
T('노출 중 기능은 hidden=false', S.paletteSearch('홈', { edits: 0 }).items.some((i) => i.id === 'home' && i.hidden === false));
T('삭제 항목은 검색에도 없음', !S.paletteSearch('Patterns', { edits: 0 }).items.some((i) => i.id === 'patterns'));
T('빈 질의 무결과', S.paletteSearch('', { edits: 0 }).total === 0);
T('MK_FLOW 검색 연동 카운트', typeof S.paletteSearch('brand', { edits: 0 }).flowTotal === 'number');
T('발견 — 숨겨도 도달 ≥10 (§19)', S.discovery({ edits: 0 }).hiddenReachable >= 10, String(S.discovery({ edits: 0 }).hiddenReachable));

/* ============ 7. 3초·30초·클릭·계층 (§13~§16) ============ */
sec('7. 3초·30초·클릭·계층');
const t3 = S.threeSecTest();
T('3초 테스트 통과 — 세 질문 전부', t3.pass && t3.answers.what.ok && t3.answers.where.ok && t3.answers.how.ok);
T('불량 스펙은 3초 실패', !S.threeSecTest({ questions: [], items: NAV_IDS, menuCount: 25 }).pass);
const t30 = S.thirtySecTest();
T('30초 — 합계 ≤30s', t30.within && t30.totalSec <= 30);
T('30초 — 가입 단계 0', t30.noSignup);
T('30초 — AI 실생성(씬 ≥1)', t30.produced && t30.scenes >= 1, 'scenes=' + t30.scenes);
T('30초 — 종합 통과', t30.pass);
const ca = S.clickAudit();
T('클릭 예산 — 전 명령 ≤3', ca.ok && ca.over.length === 0 && ca.max <= 3);
T('AI 자연어 1입력 경로', ca.aiNatural === true);
T('시각 계층 — 단조 감소·전문 기능 0', S.hierarchyAudit().ok && S.hierarchyAudit().expertHidden);

/* ============ 8. 산출물·여정·완료 (§18·§19) ============ */
sec('8. 산출물·완료');
const del = S.deliverables();
T('산출물 7종 전부 ready', del.length === 7 && del.every((d) => d.ready), del.filter((d) => !d.ready).map((d) => d.id).join(','));
T('신규 메뉴 구조 — 초보 4·삭제 4', S.menuStructure().beginner.length === 4 && S.menuStructure().deleted.length === 4);
const jn = S.journey();
T('사용자 여정 4단계 전부 OK', jn.length === 4 && jn.every((j) => j.ok), jn.filter((j) => !j.ok).map((j) => j.id).join(','));
T('완료 조건 충족', S.complete() === true);

/* ============ 9. 실내비 통합 — 🌱 단순 모드 ============ */
sec('9. 실내비 통합');
window.PG.go('simple');
const navCount = () => window.document.querySelectorAll('#pgNav [data-nav]').length;
const fullN = navCount();
T('기본값 full — 전체 내비', window.PG.state.navMode === 'full' && fullN >= 25, String(fullN));
window.PG.toggleNavMode();
const simpleN = navCount();
T('단순 모드 — 필수 4 + Simple 화면', window.PG.state.navMode === 'simple' && simpleN === 5, String(simpleN));
T('단순 내비에 admin 없음', !window.document.querySelector('#pgNav [data-nav="admin"]'));
T('모드 토글 버튼 실존', !!window.document.querySelector('[data-navmode]'));
window.PG.toggleNavMode();
T('전체 복귀', window.PG.state.navMode === 'full' && navCount() === fullN);

/* ============ 10. 삭제 = 노출 삭제 — 라우트 생존(Bible §0) ============ */
sec('10. 노출 삭제·라우트 생존');
T('patterns 화면 렌더 생존', typeof window.MK_SCREENS.patterns.render === 'function' && window.MK_SCREENS.patterns.render('A').length > 0);
T('templates(구) 화면 렌더 생존', window.MK_SCREENS.templates.render(window.MK_SCREENS.templates.variants[0]).length > 0);
T('video·photo 자리표시 렌더 생존', window.MK_SCREENS.video.render('A').length > 0 && window.MK_SCREENS.photo.render('A').length > 0);

/* ============ 11. 화면 8탭 + 버튼 실연 ============ */
sec('11. Simple 화면');
window.PG.go('simple');
const body = () => window.document.getElementById('pgBody');
const click = (sel) => { const el = body().querySelector(sel); if (el) el.click(); return !!el; };
T('개요 렌더', body().innerHTML.includes('결과물을 만들러 온다'));
for (const [k, n] of [['menu', '메뉴'], ['first', '첫 화면'], ['level', '단계'], ['ctx', '컨텍스트'], ['pal', '팔레트'], ['t30', '30초'], ['out', '산출물']]) {
  click(`[data-sp-tab="${k}"]`);
  T(`탭 ${n} 렌더`, body().innerHTML.length > 400);
}
click('[data-sp-tab="first"]');
T('불량 스펙 전환 → 위반 표시', click('[data-sp-bad]') && body().innerHTML.includes('허용 밖 요소'));
T('단순 스펙 복귀 → 통과', click('[data-sp-good]') && body().innerHTML.includes('3초 테스트 통과'));
click('[data-sp-tab="level"]');
click('[data-sp-edit]'); /* +5 */
T('편집 +5 → 브랜드 노출', body().innerHTML.includes('브랜드'));
click('[data-sp-tab="pal"]');
const qi = body().querySelector('[data-sp-q]'); if (qi) qi.value = 'admin';
T('팔레트 검색 실연', click('[data-sp-search]') && body().innerHTML.includes('검색으로 도달'));
click('[data-sp-tab="t30"]');
T('30초 실행 실연', click('[data-sp-t30]') && body().innerHTML.includes('AI 실생성'));
click('[data-sp-tab="out"]');
T('산출물 탭 — complete true', body().innerHTML.includes('complete() = true'));

console.log(`\nRound 27: ${pass}/${pass + fail} ${fail ? '❌' : '✅'}`);
process.exit(fail ? 1 : 0);
