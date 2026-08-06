/* Round 32 — Left Navigation (MK_NAV) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/nav' });
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

const N = window.MK_NAV, S = window.MK_SIMPLE, T10 = window.MK_TEN;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 표면·철학 (§0·§1) ============ */
sec('1. 표면·철학');
T('공개 표면', ['menuAudit', 'countAudit', 'defaultAudit', 'expertAudit', 'progressiveAudit', 'aiNavAudit', 'searchAudit', 'contextAudit', 'nameAudit', 'priorityAudit', 'mobileAudit', 'tabletAudit', 'workspaceAudit', 'fiveSecTest', 'deliverables', 'complete'].every((k) => typeof N[k] === 'function'));
T('철학 — 최단 경로', N.PHILOSOPHY.role.includes('가장 짧은 길'));
T('철학 — 규칙 4', N.PHILOSOPHY.rules.length === 4 && N.PHILOSOPHY.rules.some((r) => r.includes('5초')));
T('철학 — 길 안내', N.PHILOSOPHY.guide.includes('길을 안내'));

/* ============ 2. Menu Audit (§2) ============ */
sec('2. Menu Audit');
const ma = N.menuAudit();
T('전수 분류 누락 0', ma.ok, JSON.stringify(ma.violations));
T('대상 = MK_SIMPLE.MENU 전 키', ma.total === Object.keys(S.MENU).length);
T('클래스 5종 지시서 그대로', JSON.stringify(N.AUDIT_CLASSES) === JSON.stringify(['keep', 'merge', 'hide', 'delete', 'ai']));
T('유지에 기본 4행+ai', ['home', 'projects', 'library', 'assets', 'ai'].every((id) => ma.by.keep.some((r) => r.id === id)));
T('통합 — editor 는 경로', ma.by.merge.some((r) => r.id === 'editor' && /경로/.test(r.reason)));
T('삭제 — patterns', ma.by.delete.some((r) => r.id === 'patterns'));
T('AI 대체 — create·animation', ['create', 'animation'].every((id) => ma.by.ai.some((r) => r.id === id)));
T('expert 전부 숨김 귀속', Object.values(S.MENU).filter((m) => m.cls === 'expert').every((m) => ma.by.hide.some((r) => r.id === m.id)));
T('일부만 분류한 스펙 거부', !N.menuSpecAudit({ classified: { home: 'keep' } }).ok);
T('전부 분류한 스펙 통과', N.menuSpecAudit({ classified: Object.fromEntries(Object.keys(S.MENU).map((k) => [k, 'keep'])) }).ok);
T('미등록 id 평결 null', N.verdictOf('no_such_menu') === null);

/* ============ 3. 수 제한 (§3) ============ */
sec('3. 수 제한');
T('행 ≤6 실측', N.countAudit().ok && N.rows().length <= 6);
T('7행 스펙 거부', !N.countSpecAudit(['a', 'b', 'c', 'd', 'e', 'f', 'g']).ok);
T('2행 스펙 거부', !N.countSpecAudit(['a', 'b']).ok);
T('경계 — 정확히 6 허용', N.countSpecAudit(['a', 'b', 'c', 'd', 'e', 'f']).ok);

/* ============ 4. 기본 구조 (§4) ============ */
sec('4. 기본 구조');
const da = N.defaultAudit();
T('기본 구조 감사 통과', da.ok, JSON.stringify(da.violations));
T('4행 = 홈·프로젝트·템플릿·내 파일', JSON.stringify(da.rows) === JSON.stringify(['홈', '프로젝트', '템플릿', '내 파일']));
T('AI = 입구, 행 아님', N.entrance().id === 'ai' && !N.rows().some((r) => r.id === 'ai'));
T('첫 화면 항목 5 (지시서 §6)', N.rows().length + 1 === 5);
T('전 항목 실라우트 존재', N.DEFAULT_NAV.every((m) => !!window.MK_SCREENS[m.route]));

/* ============ 5. 전문가 격리 (§5) ============ */
sec('5. 전문가 격리');
const ea = N.expertAudit();
T('8토큰 표면 0', ea.ok, JSON.stringify(ea.violations));
T('토큰 목록 지시서 그대로', JSON.stringify(ea.tokens) === JSON.stringify(['Brand', 'Plugin', 'Automation', 'Developer', 'Marketplace', 'Workflow', 'Admin', 'API']));

/* ============ 6. Progressive (§6) ============ */
sec('6. Progressive');
const pa = N.progressiveAudit();
T('단계 감사 통과', pa.ok, JSON.stringify(pa.violations));
T('첫 가입 4행', pa.first.length === 4);
T('자연 노출 — 20편집에 brand·projects·assets', N.navFor({ edits: 20 }).rows.includes('brand'));
T('옵트인 > 자연', pa.power > pa.grown.length);
T('9999편집 옵트인 없이 전문가 0', !N.navFor({ edits: 9999 }).rows.includes('admin'));

/* ============ 7. AI Navigation (§7) ============ */
sec('7. AI Navigation');
const aa = N.aiNavAudit();
T('AI 라우팅 감사 통과', aa.ok, JSON.stringify(aa.violations));
T('"영상 만들어줘" → editor(video)', (() => { const r = N.routeByIntent('영상 만들어줘'); return r.ok && r.target === 'editor' && r.mode === 'video'; })());
T('"브랜드 색 바꿔줘" → brand', N.routeByIntent('브랜드 색 바꿔줘').target === 'brand');
T('"발표 만들어줘" → editor+gen', (() => { const r = N.routeByIntent('발표 만들어줘'); return r.ok && r.target === 'editor' && r.gen; })());
T('미인식 → 검색 낙하', N.routeByIntent('무슨 말인지 모르겠음').fallback === 'search');
T('빈 문자열 → 검색 낙하', N.routeByIntent('').fallback === 'search');
T('exec 실이동 — PG.state 가 실제로 바뀐다', (() => { const before = window.PG.state.screen; const r = N.exec('브랜드 색 바꿔줘'); const moved = window.PG.state.screen === 'brand'; window.PG.go(before); return r.ok && moved; })());
T('exec 영상 — Editor Video 모드 실진입', (() => { const before = window.PG.state.screen; const r = N.exec('영상 만들어줘'); const ok = window.PG.state.screen === 'editor' && window.PG.state.editor.mode === 'video'; window.PG.go(before); return r.ok && ok; })());

/* ============ 8. Search First (§8) ============ */
sec('8. Search First');
const sa = N.searchAudit();
T('검색 감사 통과', sa.ok, JSON.stringify(sa.violations));
T('Ctrl+K', N.SHORTCUT === 'Ctrl+K');
T('색인이 레거시 표면 전체 포함', N.searchIndex().length >= Object.keys(S.MENU).length);
T('숨김·전문가 검색 도달', ['admin', 'plugins', 'market'].every((id) => N.search(id).some((h) => h.id === id)));
T('옛 용어 「에셋」 → 내 파일(assets)', N.search('에셋').some((h) => h.id === 'assets'));
T('옛 용어 「Export」 → 공유', N.search('export').some((h) => h.id === 'export'));
T('빈 질의 = 결과 0', N.search('').length === 0);

/* ============ 9. Context (§9) ============ */
sec('9. Context');
const ca = N.contextAudit();
T('문맥 감사 통과', ca.ok, JSON.stringify(ca.violations));
T('영상 문맥에 발표 전용 0', !N.contextNav('video').items.includes('슬라이드'));
T('발표 문맥에 영상 전용 0', !N.contextNav('presentation').items.includes('자막'));
T('공통(공유하기)은 양쪽 허용', N.contextNav('video').items.includes('공유하기') && N.contextNav('presentation').items.includes('공유하기'));
T('미지정 유형 → 발표 기본', N.contextNav('unknown').items === N.CONTEXT_NAV.presentation);
T('요소 문맥 브리지(R27 계보)', Object.keys(S.CTX_MENUS).length >= 5);

/* ============ 10. Naming (§10) ============ */
sec('10. Naming');
const na = N.nameAudit();
T('개명 감사 통과', na.ok, JSON.stringify(na.violations));
T('지시서 예시 「브랜드」 실기각', !N.renameJudge('Brand Kit', '브랜드').ok);
T('「우리 반 스타일」 통과 — MK_TEN 계보', N.renameJudge('Brand Kit', '우리 반 스타일').ok);
T('Assets → 내 파일', N.RENAMES['Assets'] === '내 파일');
T('Export → 공유하기 · Workflow → 자동화', N.RENAMES['Export'] === '공유하기' && N.RENAMES['Workflow'] === '자동화');
T('영문 전문 용어 개명 거부', !N.renameJudge('Assets', 'Resources').ok);
T('기본 표면 금지어 0', N.DEFAULT_NAV.every((m) => !T10.BANNED_NAMES.some((b) => m.label.toLowerCase().includes(String(b).toLowerCase()))));

/* ============ 11. Visual Priority (§11) ============ */
sec('11. Visual Priority');
const pr = N.priorityAudit();
T('우선순위 감사 통과', pr.ok, JSON.stringify(pr.violations));
T('홈 = 최다 사용 tier 1', N.tierOf(N.DEFAULT_NAV[0]) === 1);
T('내 파일 = tier 2', N.tierOf(N.DEFAULT_NAV.find((m) => m.id === 'assets')) === 2);

/* ============ 12. Mobile·Tablet (§12·§13) ============ */
sec('12. Mobile·Tablet');
const mo = N.mobileAudit(), ta = N.tabletAudit();
T('모바일 Bottom ≤5', mo.ok, JSON.stringify(mo.violations));
T('모바일에 검색 통로', N.MOBILE_NAV.items.includes('검색'));
T('태블릿 Collapsible·기본 접힘', ta.ok, JSON.stringify(ta.violations));
T('태블릿 행 = 데스크톱 행', JSON.stringify(N.TABLET_NAV.rows) === JSON.stringify(N.rows().map((r) => r.label)));

/* ============ 13. Expert Workspace (§14) ============ */
sec('13. Expert Workspace');
T('공방 감사 통과', N.workspaceAudit().ok, JSON.stringify(N.workspaceAudit().violations));
N.resetCustom();
T('초보자 커스텀 거부', !N.customize({ edits: 0 }, { add: 'brand' }).ok);
T('중급(옵트인 없음) 커스텀 거부', !N.customize({ edits: 20 }, { add: 'brand' }).ok);
const P = { edits: 20, expertOptIn: true };
T('전문가 추가', N.customize(P, { add: 'brand' }).ok && N.customRows().includes('brand'));
T('존재하지 않는 메뉴 거부', !N.customize(P, { add: 'ghost' }).ok);
T('중복 추가 거부', !N.customize(P, { add: 'brand' }).ok);
T('홈 삭제 거부', !N.customize(P, { remove: 'home' }).ok);
T('6행 초과 거부', (() => { N.customize(P, { add: 'team' }); const r = N.customize(P, { add: 'dev' }); return !r.ok && N.customRows().length <= 6; })());
T('삭제 후 행 유지', N.customize(P, { remove: 'brand' }).ok && !N.customRows().includes('brand'));
T('재배치 — 같은 구성만', (() => { const cur = N.customRows(); const bad = cur.slice(1); return !N.customize(P, { reorder: bad }).ok; })());
T('재배치 실반영', (() => { const rev = N.customRows().reverse(); N.customize(P, { reorder: rev }); return JSON.stringify(N.customRows()) === JSON.stringify(rev); })());
N.resetCustom();
T('리셋 후 기본 구조', JSON.stringify(N.customRows()) === JSON.stringify(N.rows().map((r) => r.id)));

/* ============ 14. 지표 (§15) ============ */
sec('14. 지표');
T('4종 등록', JSON.stringify(N.METRIC_KEYS) === JSON.stringify(['navTime', 'searchRate', 'misclickRate', 'revisitRate']));
T('미실측 = null', Object.values(N.metrics()).every((v) => v === null));
T('등록 밖 지표 거부', !N.record('clicksPerDay', 3).ok);
T('비수치 거부', !N.record('navTime', '빠름').ok);
T('record 유일 경로', (() => { const r = N.record('navTime', 4.2); return r.ok && N.metrics().navTime === 4.2; })());

/* ============ 15. 5초 테스트·산출물·완료 (§16~§18) ============ */
sec('15. 5초 테스트·산출물·완료');
const ft = N.fiveSecTest();
T('5초 테스트 통과', ft.ok);
T('3질문 지시서 그대로', ft.questions.length === 3 && ft.questions[0].includes('먼저'));
T('첫 클릭 = 홈 (최다 사용)', ft.answers.firstClick === '홈');
T('혼란 메뉴 0', ft.answers.confusing.length === 0);
const dv = N.deliverablesAudit();
T('Deliverables 8종 실존', dv.ok, JSON.stringify(dv.empty));
T('Before/After — 행 감소', (() => { const b = N.beforeAfter(); return b.after.rows < b.before.rows; })());
T('완료 조건 §18', N.complete());

/* ============ 16. 화면·통합 ============ */
sec('16. 화면·통합');
T('#/nav 화면 등록', !!window.MK_SCREENS.nav);
T('8탭 렌더', (() => { const h = window.MK_SCREENS.nav.render(); return (h.match(/data-nv-tab/g) || []).length === 8; })());
T('검수 내비에 nav 실존', window.document.getElementById('pgNav') !== null && /data-nav="nav"/.test(window.document.getElementById('pgNav').innerHTML));
T('nav 화면은 검수 전용 — MK_SIMPLE 초보자 내비 불변', !S.navFor({ edits: 0 }).includes('nav'));
T('MK_TEN 회귀 무영향 — 커버리지 유지', T10.coverage ? T10.coverage().ok !== false : true);

console.log('');
console.log(fail === 0 ? `Round32: ${pass}/${pass} ALL PASS` : `Round32: ${pass} pass, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
