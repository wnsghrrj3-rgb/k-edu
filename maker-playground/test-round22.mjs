/* Round 22 — AI Agent Studio 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/agent' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const AG = window.MK_AGENT, BR = window.MK_BRAND;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);
const mkDoc = () => ({ title: 't', scenes: JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES[0].scenes)) });
BR.seed(); BR.setActive(BR.list()[0].brandId);

/* ============ 1. 기반·클록·메모리(§0·§3) ============ */
sec('1. 기반·클록·메모리');
T('MK_AGENT 존재·공개 표면', typeof AG.request === 'function' && typeof AG.invoke === 'function' && typeof AG.state === 'function');
T('내부 클록 정오 앵커', new Date(AG._now()).getUTCHours() === 3);
const c0 = AG._now(); AG._tick(AG.HOUR);
T('_tick 전진', AG._now() - c0 === AG.HOUR);
const mm = AG.mem();
T('Workspace Memory 7요소', 'project' in mm && 'brand' in mm && mm.templates >= 20 && mm.assets === 56 && 'prefs' in mm && 'favorites' in mm && 'worklog' in mm);
T('활성 브랜드 인지', mm.brand && mm.brand.name === 'K-MAKER');

/* ============ 2. Project Understanding(§4) ============ */
sec('2. Project Understanding');
const und = AG.understand(mkDoc());
T('6요소 분석', und.purpose && und.audience && und.style && 'brand' in und && und.layout && und.tone);
T('수업 doc → 수업·교육/학생', und.purpose === '수업·교육' && und.audience === '학생' && und.tone === 'student');
T('통계 정합', und.stats.scenes === 4 && und.stats.elements > 20);
T('빈 doc → null', AG.understand({ scenes: [] }) === null);
const dk = mkDoc(); dk.scenes.forEach((s) => { s.background = '#101418'; });
T('다크 스타일 판정', AG.understand(dk).style === '다크·시네마틱');

/* ============ 3. Planning·Build(§5) ============ */
sec('3. Design Planning');
T('종류 판정 4종', AG.planKind('피치덱 만들어줘') === '피치덱' && AG.planKind('수업 자료') === '수업 자료' && AG.planKind('주간 보고서') === '보고서' && AG.planKind('회사 소개서') === '회사 소개서');
const pl = AG.plan('회사 소개서 「금성초 이야기」 만들어줘');
T('제목 추출(「」)', pl.title === '금성초 이야기');
T('목차 6항목·페이지 정합', pl.outline.length === 6 && pl.pages.length === 6 && pl.outline[0].sec === 'cover');
const built = AG.build(pl);
T('MK_SEC 실조립 6장', built.scenes.length === 6 && built.scenes.every((s) => (s.elements || []).length > 0));
T('order 부여', built.scenes.every((s, i) => s.order === i));
for (const k of ['수업 자료', '피치덱', '보고서'])
  T(`플랜 「${k}」 조립 가능`, AG.build(AG.plan(k + ' 만들어줘')).scenes.length >= 4);

/* ============ 4. Orchestrator·의도 분류(§1) ============ */
sec('4. Orchestrator');
T('분류 12의도', ['sns', 'brand', 'summarize', 'translate', 'proof', 'tone', 'asset', 'flow', 'animate', 'review', 'layout', 'create']
  .every((i) => AG.classify({ sns: 'SNS 버전', brand: '브랜드 정렬', summarize: '요약해줘', translate: '영어로 번역', proof: '오탈자 교정', tone: '톤 바꿔줘', asset: '이미지 추천', flow: '순서 정리', animate: '애니메이션', review: '검사해줘', layout: '레이아웃', create: '만들어줘' }[i]).intent === i));
T('SNS가 create 에 안 먹힘', AG.classify('SNS 버전 만들어줘').intent === 'sns');
T('브랜드가 layout 에 안 먹힘', AG.classify('브랜드 정렬해줘').intent === 'brand');
T('미지 의도 → unknown', AG.classify('오늘 날씨 어때').intent === 'unknown');
const d1 = mkDoc();
const rc = AG.request(d1, '회사 소개서 「금성초 이야기」 만들어줘');
T('create 실행 — doc 교체', rc.ok && d1.scenes.length === 6 && d1.title === '금성초 이야기');
T('create 후 브랜드 자동 정렬(표지 워드마크)', d1.scenes[0].elements.some((e) => e.brandLogo));
const ru = AG.request(d1, '오늘 날씨 어때');
T('unknown → ok:false + 힌트', ru.ok === false && /못 알아듣는/.test(ru.msg));

/* ============ 5. Layout Agent(§6) ============ */
sec('5. Layout Agent');
const dl = mkDoc();
dl.scenes[0].elements.push({ kind: 'text', x: 10.5, y: 60, w: 30, size: 3, text: '이탈 텍스트' });
dl.scenes.push({ id: 'x', name: '무제목', width: 1280, height: 720, background: '#fff', order: 4, elements: [
  { kind: 'text', x: 8, y: 40, w: 40, size: 4, text: '큰 글자' }, { kind: 'text', x: 8, y: 20, w: 40, size: 2, text: '위 본문' }] });
const rl = AG.layoutOptimize(dl);
T('그리드 스냅 실행', dl.scenes[0].elements.find((e) => e.text === '이탈 텍스트').x === 8);
T('제목 승격(무헤드 씬)', dl.scenes[4].elements.find((e) => e.text === '큰 글자').weight === 700);
T('제목 상단 이동', dl.scenes[4].elements.find((e) => e.text === '큰 글자').y <= 14);
T('수정 내역 보고', rl.fixes.length >= 3);

/* ============ 6. Writing Agent(§7) ============ */
sec('6. Writing Agent');
T('요약', AG.W.summarize('첫 문장이 핵심. 뒤는 부연 설명이 길게 이어진다').startsWith('첫 문장이 핵심'));
T('확장', AG.W.expand('짧은 말').includes('근거'));
T('톤 student', AG.W.tone('시작합니다', 'student') === '시작해요');
T('톤 investor', AG.W.tone('시작해요', 'investor') === '시작합니다');
T('교정 사전', AG.W.proof('그렇게 됬다 몇일 뒤').text.includes('됐다') && AG.W.proof('몇일').text === '며칠');
T('용어 번역', AG.W.translate('표지 그리고 팀').includes('Cover') && AG.W.translate('표지 그리고 팀').includes('Team'));

/* ============ 7. Brand Agent(§8) ============ */
sec('7. Brand Agent');
const db = mkDoc();
db.scenes[0].elements.push({ kind: 'text', x: 8, y: 70, w: 30, size: 3, text: '외부색', color: '#FF00AA' });
const rb = AG.brandEnforce(db);
T('허용 외 색 재배정', db.scenes[0].elements.find((e) => e.text === '외부색').color === BR.active().color.primary);
T('표지 워드마크 보장', db.scenes[0].elements.some((e) => e.brandLogo));
T('변경 수 보고', rb.changes >= 2 && rb.brand === 'K-MAKER');
const bc = AG.brandCheck(mkDoc());
T('brandCheck 이슈 구조', 'ok' in bc && Array.isArray(bc.issues));

/* ============ 8. Asset Agent(§9) ============ */
sec('8. Asset Agent');
const ra = AG.assetRecommend('교실 발표');
T('키워드 추천', ra.length > 0 && ra.length <= 4);
const rf = AG.assetRecommend('이미지 추천해줘');
T('일반어 폴백 — 이미지 풀', rf.length === 4);
AG.favAsset(rf[1].id);
T('즐겨찾기 가산 반영', AG.assetRecommend('이미지 추천해줘')[0].id === rf[1].id || AG.assetRecommend('이미지')[0].id === rf[1].id);

/* ============ 9. Presenter(§10)·Animator(§11) ============ */
sec('9. Presenter·Animator');
const dp = mkDoc();
dp.scenes.reverse(); dp.scenes.forEach((s, i) => { s.order = i; });
const sf = AG.storyFlow(dp);
T('이상 순서 계산(표지 첫)', sf.ideal[0].includes('표지'));
const mv = sf.apply();
T('재정렬 적용', mv > 0 && dp.scenes[0].name.includes('표지') && dp.scenes.every((s, i) => s.order === i));
const da = mkDoc();
const an = AG.animateSuggest(da);
T('전 요소 애니 배정', an.applied > 20 && da.scenes.flatMap((s) => s.elements).every((e) => e.anim));
T('규칙 — 제목 fade-up·이미지 zoom-in', da.scenes[0].elements.find((e) => (e.weight || 0) >= 700).anim.name === 'fade-up' && da.scenes.flatMap((s) => s.elements).find((e) => e.kind === 'image').anim.name === 'zoom-in');
T('순차 지연 상한 540', Math.max(...da.scenes.flatMap((s) => s.elements).map((e) => e.anim.delay)) <= 540);

/* ============ 10. Review Agent(§12) ============ */
sec('10. Review Agent');
const dr = mkDoc();
dr.scenes[0].elements.push(
  { kind: 'text', x: 8, y: 60, w: 40, size: 1.2, text: '너무 작은 글씨' },
  { kind: 'text', x: 8, y: 66, w: 40, size: 3, text: '그렇게 됬다' },
  { kind: 'text', x: 8, y: 72, w: 40, size: 3, text: '저대비', color: '#FEFEFE' });
const rv = AG.review(dr);
T('접근성(작은 글씨) 검출', rv.issues.some((i) => i.cat === '접근성'));
T('오탈자 검출', rv.issues.some((i) => i.cat === '오탈자'));
T('색 대비 검출(3:1 미만)', rv.issues.some((i) => i.cat === '색상'));
T('점수 감점', rv.score < 100);
T('깨끗한 doc 100점', AG.review(mkDoc()).score === 100);

/* ============ 11. Collaboration(§13) ============ */
sec('11. Collaboration Agent');
const base = mkDoc(), mine = mkDoc(), theirs = mkDoc();
theirs.scenes[0].elements.push({ kind: 'text', x: 8, y: 88, w: 30, size: 2, text: '팀원 메모' });
theirs.scenes[1].elements[0].text = '수정된 흐름';
const se = AG.summarizeEdits(base, theirs, '동료');
T('변경 요약 — 추가·수정 집계', se.diff.elsAdded === 1 && se.diff.textEdits === 1 && /추가.*수정|수정.*추가/.test(se.summary));
mine.scenes[0].name = '내 표지'; theirs.scenes[0].name = '팀 표지'; theirs.scenes[0].background = '#000000';
const cf = AG.resolveConflict(base, mine, theirs);
T('한쪽 변경 자동 채택', cf.merged.scenes[0].background === '#000000');
T('양쪽 변경 → 제안', cf.proposals.length === 1 && cf.proposals[0].field === 'name' && !cf.clean);
T('무충돌 clean', AG.resolveConflict(base, mkDoc(), mkDoc()).clean === true);

/* ============ 12. 대화 기억(§14) ============ */
sec('12. Conversation Memory');
const d2 = mkDoc();
AG.request(d2, '피치덱 「시그널」 만들어줘', { projectId: 'p2' });
T('대화 기록 적재', AG.convo('p2').msgs.length >= 2 && AG.convo('p2').lastTarget === '시그널');
T('지시 대명사 해소', AG.resolveRef('p2', '그거 검사해줘').startsWith('시그널'));
T('타 프로젝트 격리', AG.convo('p-없음').msgs.length === 0);

/* ============ 13. Timeline·Explain(§15·§20) ============ */
sec('13. Timeline');
const jn0 = AG.jobs().length;
const d3 = mkDoc();
AG.request(d3, '애니메이션 넣어줘', { previewShown: true });
AG.request(d3, '레이아웃 정리해줘', { previewShown: true });
const js = AG.jobs();
T('Job 적재·스냅 보유', js.length === jn0 + 2 && js[js.length - 1].hasSnap);
T('전 Job 설명 보유(§20)', js.every((j) => j.explain && j.explain.length > 0));
T('explain(id) 조회', typeof AG.explain(js[js.length - 1].id) === 'string');
const hadAnim = d3.scenes.flatMap((s) => s.elements).some((e) => e.anim);
AG.undo(d3); AG.undo(d3);
T('undo ×2 → 애니 제거', hadAnim && !d3.scenes.flatMap((s) => s.elements).some((e) => e.anim));
AG.redo(d3);
T('redo → 복원', d3.scenes.flatMap((s) => s.elements).some((e) => e.anim));
T('restore(jobId)', AG.restore(d3, js[js.length - 1].id) === true);
const cmp = AG.compare(js[js.length - 2].id, js[js.length - 1].id);
T('compare — diff 구조', cmp && 'total' in cmp && 'textEdits' in cmp);
T('rollback — 변경 전 복귀', AG.rollback(d3, js[js.length - 1].id) === true && AG.job(js[js.length - 1].id).status === 'rolledback');
AG.request(d3, '검사해줘');
T('undo 후 새 Job → redo 꼬리 절단', AG.jobs()[AG.jobs().length - 1].intent === 'review');

/* ============ 14. Safety(§21) ============ */
sec('14. Safety');
const d4 = mkDoc();
T('파괴 판정', AG.isDestructive('전부 지워줘') && !AG.isDestructive('검사해줘'));
const rd = AG.request(d4, '모두 지워줘');
T('파괴 게이트 — 확인 요구', rd.ok === false && rd.needsConfirm === true);
const pv = AG.preview(d4, '애니메이션 넣어줘');
T('Preview — 커밋 없음', pv.wouldChange > 0 && !d4.scenes.flatMap((s) => s.elements).some((e) => e.anim));
const big = AG.request(d4, '애니메이션 넣어줘');
T('대규모 변경 게이트', big.needsPreview === true && big.wouldChange > 20);
T('previewShown 후 실행', AG.request(d4, '애니메이션 넣어줘', { previewShown: true }).ok === true);

/* ============ 15. Suggestions(§16) ============ */
sec('15. Suggestions');
const d5 = mkDoc();
d5.scenes[0].elements.find((e) => (e.weight || 0) >= 700).text = '아주아주아주 길고 긴 제목이 여기 있습니다';
const sg = AG.suggestions(d5);
T('제안 생성·상한 5', sg.length > 0 && sg.length <= 5);
T('"제목이 너무 깁니다" 규칙', sg.some((s) => s.msg === '제목이 너무 깁니다.'));
T('전 제안 fix 프롬프트 보유', sg.every((s) => s.fix));
T('빈 doc → 제안 없음', AG.suggestions(null).length === 0);

/* ============ 16. Tasks·Automation(§17·§23) ============ */
sec('16. Tasks·Automation');
const d6 = mkDoc(); AG.bind(d6);
const t1 = AG.taskCreate({ title: '즉시', prompt: '브랜드 검사해줘' });
AG._runDue();
T('즉시 작업 실행', t1.status === 'done' && t1.runs === 1 && t1.log[0].ok);
const t2 = AG.taskCreate({ title: '예약', prompt: '오탈자 교정해줘', at: AG._now() + AG.HOUR });
AG._tick(AG.HOUR + 1);
T('예약 작업 — 시각 도달 시 실행', t2.runs === 1);
const at = AG.automationEnable('auto-brand');
T('자동화 켜기(중복 방지)', at && at.everyMs === AG.DAY && AG.automationEnable('auto-brand') === null);
AG._tick(AG.DAY + 1);
T('자동화 1주기 실행', at.runs === 1);
AG._tick(AG.DAY + 1);
T('자동화 반복 실행', at.runs === 2 && at.status === 'scheduled');
T('AUTOMATIONS 4종', AG.AUTOMATIONS.length === 4);

/* ============ 17. Palette·Voice(§18·§19) ============ */
sec('17. Palette·Voice');
T('명령 12종', AG.COMMANDS.length === 12);
T('빈 검색 → 전체', AG.palette('').length === 12);
T('검색 매칭', AG.palette('브랜드').length >= 1 && AG.palette('undo').some((c) => c.id === 'cmd-undo'));
const d7 = mkDoc();
const rv2 = AG.voice(d7, '순서 정리해줘');
T('음성 → 동일 판정 계층', rv2.ok === true && AG.jobs()[AG.jobs().length - 1].voice === true);

/* ============ 18. Learning(§22) ============ */
sec('18. Learning');
const d8 = mkDoc();
const rj = AG.request(d8, '피치덱 만들어줘');
const pf = AG.feedback(rj.jobId, true);
T('수용 카운트', pf.accepted.create >= 1);
T('팔레트 선호 학습', pf.palette === 'pl-noir');
T('학습 반영 — 다음 plan 기본 팔레트', AG.plan('회사 소개서 만들어줘').palette === 'pl-noir');
AG.feedback(rj.jobId, false);
T('거부 → 선호 해제', AG.prefs().palette === null && AG.prefs().rejected.create >= 1);

/* ============ 19. API·Inspector(§24·§25) ============ */
sec('19. API·Inspector');
const d9 = mkDoc();
const iv = AG.invoke('reviewer', d9, '검사해줘');
T('invoke 공개 경로', iv.ok === true && 'score' in iv);
T('없는 Agent 거부', AG.invoke('없음', d9, 'x').ok === false);
T('Agent 레지스트리 10종', AG.AGENTS.length === 10 && AG.agent('planner') && AG.agent('publisher'));
const stt = AG.state();
T('Inspector 상태 구조', 'running' in stt && 'scheduled' in stt && 'jobs' in stt && stt.lastJob && 'memory' in stt);

/* ============ 20. 화면(#/agent) 8탭 실렌더 ============ */
sec('20. 화면 8탭');
const SCR = window.MK_SCREENS.agent;
const host = window.document.createElement('div');
const R = () => { host.innerHTML = SCR.render(); SCR.bind(host, R); };
for (const tab of ['over', 'studio', 'agents', 'timeline', 'review', 'tasks', 'palette', 'inspector']) {
  host.innerHTML = SCR.render(); SCR.bind(host, R);
  const btn = [...host.querySelectorAll('[data-ag-tab]')].find((b) => b.dataset.agTab === tab);
  btn.onclick();
  T(`탭 ${tab} 렌더`, host.innerHTML.length > 500 && host.querySelector('.mk-tab.active').dataset.agTab === tab);
}
/* 스튜디오 실행 버튼 실동작 */
const stab = [...host.querySelectorAll('[data-ag-tab]')].find((b) => b.dataset.agTab === 'studio'); stab.onclick();
host.querySelector('[data-ag-prompt]').value = '수업 자료 「빛과 그림자」 만들어줘';
host.querySelector('[data-ag-run]').onclick();
T('스튜디오 실행 → 배너·플랜 표시', host.innerHTML.includes('mk-banner') && host.innerHTML.includes('빛과 그림자'));
host.querySelector('[data-ag-preview]').onclick();
T('Preview 버튼 → 커밋 없는 미리보기', host.innerHTML.includes('Preview'));
/* 팔레트 명령 실행 */
const ptab = [...host.querySelectorAll('[data-ag-tab]')].find((b) => b.dataset.agTab === 'palette'); ptab.onclick();
[...host.querySelectorAll('[data-ag-cmd]')].find((b) => b.dataset.agCmd === 'cmd-review').onclick();
T('팔레트 명령 실행', host.innerHTML.includes('검사 점수'));
/* 타임라인 undo */
const ttab = [...host.querySelectorAll('[data-ag-tab]')].find((b) => b.dataset.agTab === 'timeline'); ttab.onclick();
host.querySelector('[data-ag-undo]').onclick();
T('타임라인 Undo 버튼', host.innerHTML.includes('되돌림') || host.innerHTML.includes('되돌릴'));
/* NAV 등재 */
T('NAV 에 Agent 등재', fs.readFileSync('app.js', 'utf8').includes("['agent', '🧠', 'Agent']"));
T('index.html 스크립트 배선', html.includes('data/agent.js') === false ? fs.readFileSync('index.html', 'utf8').includes('data/agent.js') : true);

console.log(`\nRound 22: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
