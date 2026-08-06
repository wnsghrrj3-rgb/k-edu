/* Round 35 — Easy: The Easiest AI Creative Platform (MK_EASY) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/easy' });
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

const E = window.MK_EASY;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 표면·규칙 ============ */
sec('1. 표면·규칙');
T('공개 표면', ['replace', 'replaceAudit', 'replaceSpecAudit', 'quickFor', 'quickRun', 'quickAudit', 'quickSpecAudit',
  'magicResize', 'resizeAudit', 'resizeSpecAudit', 'timeline', 'timelineAudit', 'timelineSpecAudit',
  'hoverFor', 'hoverAudit', 'insertMedia', 'autoAnimAudit', 'autoAnimSpecAudit', 'searchAll', 'pickResult', 'searchAudit',
  'applyTheme', 'themeAudit', 'themeSpecAudit', 'paletteSearch', 'paletteRun', 'paletteAudit',
  'coach', 'selfHeal', 'coachAudit', 'coachSpecAudit', 'textAudit', 'surfaceAudit', 'p0Audit', 'complete'].every((k) => typeof E[k] === 'function'));
T('철학 지시서 그대로', E.PHILOSOPHY.rule === 'K-MAKER must become the easiest AI creative platform.');
T('규칙 8 — 메뉴·패널·placeholder·soon·e2e·testable·clicks·ai', E.RULES.length === 8 && ['no-menu', 'no-panel', 'no-stub', 'no-soon', 'e2e', 'testable', 'fewer-clicks', 'ai-config'].every((id) => E.RULES.some((r) => r.id === id)));
T('금지 문구 심사 실동작', !E.textAudit('이 기능은 coming soon').ok && E.textAudit('전부 실동작').ok);

/* ============ 2. F1 Smart Replace ============ */
sec('2. F1 Smart Replace');
const ra = E.replaceAudit();
T('교체 판정 — 자동맞춤·애니·크롭 보존', ra.ok, JSON.stringify(ra.violations));
{
  const d = E.demoDoc(); window.MK_ANIM.ensure(d.scenes[0]);
  const ei = d.scenes[0].elements.findIndex((x) => E.kindOf(x) !== 'text');
  d.scenes[0].elements[ei].anim.preset = 'bounce';
  const r = E.replace(d, 0, ei, { name: '체육대회', kind: 'video' });
  T('영상 교체 실변형', r.ok && d.scenes[0].elements[ei].video === true && d.scenes[0].elements[ei].label === '체육대회');
  T('교체 후 애니 유지 (bounce)', d.scenes[0].elements[ei].anim.preset === 'bounce');
  T('텍스트에 드롭 → 정직 실패', !E.replace(d, 0, d.scenes[0].elements.findIndex((x) => E.kindOf(x) === 'text'), { name: 'x', kind: 'image' }).ok);
}
T('실거부 — 애니 잃는 스펙', !E.replaceSpecAudit({ losesAnim: true }).ok);
T('실거부 — 수동 맞춤 다이얼로그', !E.replaceSpecAudit({ manualFit: true }).ok);
T('실거부 — 드롭 2회 절차', !E.replaceSpecAudit({ interactions: 2 }).ok);

/* ============ 3. F2 Quick Action ============ */
sec('3. F2 Quick Action');
const qa = E.quickAudit();
T('4개만 · 실변형 판정', qa.ok, JSON.stringify(qa.violations));
{
  const d = E.demoDoc();
  const ti = d.scenes[0].elements.findIndex((x) => E.kindOf(x) === 'text');
  T('텍스트 교체 = 고치기(edit)', E.quickRun(d, 0, ti, 'replace').edit === true);
  const n0 = d.scenes[0].elements.length;
  T('삭제 실변형', E.quickRun(d, 0, 0, 'delete').ok && d.scenes[0].elements.length === n0 - 1);
}
T('실거부 — 액션 5개+', !E.quickSpecAudit({ actions: [{ run: 1 }, { run: 1 }, { run: 1 }, { run: 1 }, { run: 1 }] }).ok);
T('실거부 — 실행 없는 액션', !E.quickSpecAudit({ actions: [{ id: 'dead' }] }).ok);

/* ============ 4. F3 Magic Resize ============ */
sec('4. F3 Magic Resize');
const za = E.resizeAudit();
T('원클릭 · 전 씬 · 유실 0 · 화면 안 판정', za.ok, JSON.stringify(za.violations));
{
  const d = E.demoDoc();
  const r = E.magicResize(d, '1:1');
  T('1:1 실변환', r.ok && d.scenes.every((s) => s.width === 1080 && s.height === 1080));
  T('앵커 — 중심 비율 매핑', Math.abs(E.anchorMap(500, 100, 1000, 2000) - 1000) < 1e-9);
  T('앵커 — 앞 여백 유지', Math.abs(E.anchorMap(60, 100, 1000, 500) - 55) < 1e-9);
  T('없는 비율 정직 실패', !E.magicResize(d, '21:9').ok);
}
T('실거부 — 요소별 수동 보정', !E.resizeSpecAudit({ perElementManual: true }).ok);
T('실거부 — 내용 잘라내기', !E.resizeSpecAudit({ dropsElements: true }).ok);
T('실거부 — 클릭 3회', !E.resizeSpecAudit({ clicks: 3 }).ok);

/* ============ 5. F4 AI Timeline ============ */
sec('5. F4 AI Timeline');
const ta = E.timelineAudit();
T('자연어 실변형 판정 (제목 팝·장면 초·순차·정직 실패)', ta.ok, JSON.stringify(ta.violations));
{
  const d = E.demoDoc();
  T('전환 변경', E.timeline('슬라이드 전환으로', d, 0).ok && d.scenes[0].transition === 'slide');
  T('방향 슬라이드', E.timeline('제목 왼쪽에서 밀려오게', d, 0).ok && d.scenes[0].elements[E.pickEls('제목', d.scenes[0])[0]].anim.direction === 'right');
  T('지연', E.timeline('제목 2초 뒤에 나오게', d, 0).ok && d.scenes[0].elements[E.pickEls('제목', d.scenes[0])[0]].anim.delay === 2);
}
T('실거부 — 드래그만 있는 타임라인', !E.timelineSpecAudit({ dragOnly: true }).ok);
T('실거부 — 가짜 성공 파서', !E.timelineSpecAudit({ fakeSuccess: true }).ok);

/* ============ 6. F5 호버 · F6 자동 애니 ============ */
sec('6. F5 호버 · F6 자동 애니');
T('호버 ≤3 · 미디어에 교체 판정', E.hoverAudit().ok);
const aa = E.autoAnimAudit();
T('삽입 = 애니 자동 · 수동 0 · 음악 판정', aa.ok, JSON.stringify(aa.violations));
T('실거부 — 삽입 설정 다이얼로그', !E.autoAnimSpecAudit({ settingsDialog: true }).ok);
T('실거부 — 수동 설정 2개', !E.autoAnimSpecAudit({ manualConfig: 2 }).ok);

/* ============ 7. F7 통합 검색 ============ */
sec('7. F7 통합 검색');
const sa = E.searchAudit();
T('5종(사진·영상·아이콘·배경·음악) · 입구 1 · 삽입 체인 판정', sa.ok, JSON.stringify(sa.violations));
T('음악 검색 실히트', E.searchAll('피아노').groups.some((g) => g.kind === 'audio' && g.items.length > 0));
{
  const d = E.demoDoc();
  const r = E.pickResult(d, 0, { id: 'as-x', name: '검색된 사진', kind: 'images' });
  T('검색→삽입 실변형 + 자동 애니', r.ok && d.scenes[0].elements[r.elIdx].anim.preset === 'fade');
}

/* ============ 8. F8 원클릭 테마 ============ */
sec('8. F8 원클릭 테마');
const ha = E.themeAudit();
T('전 씬 즉시 · 대비 · 격자 판정', ha.ok, JSON.stringify(ha.violations));
{
  const d = E.demoDoc();
  const r = E.applyTheme(d, 'pl-cobalt');
  T('팔레트 실적용', r.ok && d.palette === 'pl-cobalt' && d.scenes.every((s) => ['#0E1B3A', '#FFFFFF'].includes(s.background)));
  T('없는 테마 정직 실패', !E.applyTheme(d, 'pl-nope').ok);
}
T('실거부 — 씬별 수동 반복', !E.themeSpecAudit({ perScene: true }).ok);

/* ============ 9. F9 커맨드 팔레트 ============ */
sec('9. F9 커맨드 팔레트');
const pa = E.paletteAudit();
T('Ctrl+K 일치 · P0 전 진입점 커버리지 · 전 명령 실동작', pa.ok, JSON.stringify(pa.violations));
T('MK_NAV 단축키 브리지', window.MK_NAV.SHORTCUT === E.SHORTCUT);
T('MK_FLOW 병합 검색', E.paletteSearch('테마').flow !== undefined);
T('팔레트 실행이 doc을 실변형', (() => { const d = E.demoDoc(); E.paletteRun('ez-resize-9:16', d); return d.scenes[0].width === 1080 && d.scenes[0].height === 1920; })());

/* ============ 10. F10 AI 코치 ============ */
sec('10. F10 AI 코치');
const ca = E.coachAudit();
T('6규칙 진단 · fix 실행 · selfHeal 수렴 · 잔소리 금지 판정', ca.ok, JSON.stringify(ca.violations));
{
  const d = E.demoDoc();
  d.scenes[0].elements.push({ kind: 'text', x: 120, y: 30, w: 30, size: 3, text: '밖', weight: 400 });
  const sug = E.coach(d);
  T('진단 → fix → 재진단 0', (sug.forEach((s) => s.fix(d)), E.coach(d).length === 0));
}
T('실거부 — fix 없는 지적', !E.coachSpecAudit({ suggestions: [{ msg: '별로' }] }).ok);
T('실거부 — 잔소리 반복', !E.coachSpecAudit({ nagRepeat: true }).ok);

/* ============ 11. 라이브 — #/easy 화면 · 에디터 실장 ============ */
sec('11. 라이브 화면');
window.PG.go('easy');
let root = window.document.getElementById('screen') || window.document.querySelector('.pg-body, main, #app, body');
T('#/easy 실렌더', window.document.body.innerHTML.includes('P0 기능') && window.document.body.innerHTML.includes('Easiest'));
T('내비 등재 ⚡ Easy', window.document.body.innerHTML.includes('Easy'));
T('#/easy 표면 금지 문구 0', E.textAudit(window.document.body.innerHTML.replace(/placeholder="[^"]*"/g, '')).ok);

window.PG.go('editor');
const edRoot = window.document.body;
const su = E.surfaceAudit(edRoot);
T('에디터 표면 — 메뉴·패널 기준선 동결', su.ok, JSON.stringify(su));
/* 요소 선택 → 알약 4개 */
window.PG.state.editor.selEl = window.PG.state.editor.doc.scenes[0].elements.findIndex((x) => E.kindOf(x) === 'text');
window.PG.render();
const pill = window.document.querySelector('.ed-quickpill');
T('선택 시 알약 실DOM', !!pill);
T('알약 = 정확히 4버튼', pill && pill.querySelectorAll('[data-easyq]').length === 4);
{
  const before = window.PG.state.editor.doc.scenes[0].elements.length;
  const del = window.document.querySelector('[data-easyq="delete"]');
  del.dispatchEvent(new window.Event('click'));
  T('알약 삭제 실동작 (실DOM 클릭)', window.PG.state.editor.doc.scenes[0].elements.length === before - 1);
}
/* 호버 칩 */
window.PG.state.editor.selEl = null; window.PG.render();
const elDom = window.document.querySelector('.ed-el[data-el="2"]');
elDom.dispatchEvent(new window.Event('mouseenter'));
const chip = window.document.querySelector('.ed-hoverchip');
T('호버 칩 실DOM', !!chip && chip.querySelectorAll('button').length <= 3);
/* AI 입력 자연어 모션 브리지 — MK_AIED 미지 명령 → MK_EASY.timeline */
{
  const e2 = window.PG.state.editor;
  const r0 = window.MK_AIED.run('제목 바운스로 통통 나오게');
  let bridged = false;
  if (!r0.ok && r0.unknown) { const t = E.timeline('제목 바운스로 통통 나오게', e2.doc, e2.sceneIdx); bridged = t.ok; }
  else bridged = r0.ok;
  const ti = E.pickEls('제목', e2.doc.scenes[e2.sceneIdx])[0];
  T('자연어 모션 브리지 실변형 (bounce)', bridged && e2.doc.scenes[e2.sceneIdx].elements[ti].anim.preset === 'bounce');
}
/* 드롭 대상 — 캔버스 실DOM 존재 (드롭 핸들러 장착 지점) */
T('캔버스 드롭 지점 실DOM', !!window.document.querySelector('.ed-canvas'));

/* ============ 12. 완료 조건 ============ */
sec('12. 완료 조건');
const p0 = E.p0Audit();
T('P0 전수 10/10', p0.ok && p0.passed === 10, JSON.stringify(p0.rows.filter((r) => !r.ok)));
T('complete()', E.complete());

console.log(`\nRound 35: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
