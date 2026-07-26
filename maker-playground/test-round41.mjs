/* R41 — 에디터 좌측 패널 실배선: 텍스트·요소·배경 실동작 + 사진·영상 파일 삽입 경로 + 미연결 정직 표기 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);
const D = window.document, PG = window.PG;
const ed = () => PG.state.editor;
const scene = () => ed().doc.scenes[ed().sceneIdx];
const openMenu = (m) => { const b = D.querySelector(`[data-menu="${m}"]`); b.click(); };

PG.go('editor');
T('에디터 문서 열림', !!(ed() && ed().doc && scene()), '전제');

/* ============ 1. 텍스트 패널 — 제목·부제목·본문 실추가 ============ */
sec('1. 텍스트 패널');
{
  openMenu('text');
  const n0 = scene().elements.length;
  D.querySelector('[data-pane="add-title"]').click();
  const t = scene().elements[scene().elements.length - 1];
  T('제목 실추가 (kind text·weight 800)', scene().elements.length === n0 + 1 && t.kind === 'text' && t.weight === 800 && /제목/.test(t.text));
  T('추가 요소 자동 선택', ed().selEl === scene().elements.length - 1);
  D.querySelector('[data-pane="add-sub"]').click();
  D.querySelector('[data-pane="add-body"]').click();
  T('부제목·본문 실추가', scene().elements.length === n0 + 3 && scene().elements[n0 + 1].weight === 600 && scene().elements[n0 + 2].weight === 400);
  const ys = scene().elements.slice(n0).map((el) => el.y);
  T('계단 배치 — 완전 겹침 없음', new Set(ys).size === ys.length, JSON.stringify(ys));
  T('Undo 스택 실적재', window.MK_HIST ? window.MK_HIST.list().some((h) => /제목 추가/.test(h)) : ed().hist && ed().hist.length >= 3);
}

/* ============ 2. 요소 패널 — 도형·표·차트 실추가 ============ */
sec('2. 요소 패널');
{
  openMenu('el');
  const n0 = scene().elements.length;
  D.querySelector('[data-pane="add-box"]').click();
  openMenu('el'); D.querySelector('[data-pane="add-table"]').click();
  openMenu('el'); D.querySelector('[data-pane="add-chart"]').click();
  const [bx, tb, ch] = scene().elements.slice(n0);
  T('도형 = fill 상자', bx && bx.kind === 'image' && bx.fill === '#2E8C7F' && bx.label === '');
  T('표 = rows·cols 실장', tb && tb.kind === 'table' && tb.cols.length === 2 && tb.rows.length === 3);
  T('차트 = bar·series 실장', ch && ch.kind === 'chart' && ch.chartType === 'bar' && ch.series.length === 3);
  /* 캔버스 실렌더 — 표·차트가 DOM에 등장 */
  const cvHtml = D.querySelector('.ed-canvas').innerHTML;
  T('표·차트 캔버스 실렌더', /<table|ed-tbl|<svg/.test(cvHtml));
}

/* ============ 3. 배경 패널 — 색 실변경 ============ */
sec('3. 배경 패널');
{
  openMenu('bg');
  const sw = D.querySelector('[data-pane="bg-set"][data-c="#1F2733"]');
  T('색 스와치 렌더', !!sw);
  sw.click();
  T('스와치 → scene.background 실변경', scene().background === '#1F2733');
  openMenu('bg');
  const ci = D.querySelector('[data-pane="bg-color"]');
  T('컬러 입력 = 현재값 반영', ci && ci.value.toUpperCase() === '#1F2733');
  ci.value = '#FFF7E8'; ci.dispatchEvent(new window.Event('change'));
  T('컬러 입력 → 실변경', scene().background.toUpperCase() === '#FFF7E8');
}

/* ============ 4. 사진·영상·업로드 — 파일 삽입 경로 ============ */
sec('4. 파일 삽입 경로');
{
  openMenu('photo');
  T('사진 패널 실버튼', !!D.querySelector('[data-pane="ins-image"]'));
  openMenu('video');
  T('영상 패널 실버튼', !!D.querySelector('[data-pane="ins-video"]'));
  openMenu('up');
  T('업로드 실버튼 + 저장 위치 정직 안내', !!D.querySelector('[data-pane="ins-any"]') && /localStorage/.test(D.querySelector('.ed-detail').textContent));
  /* 실삽입 계약 — insertWithSrc 경로 (파일 다이얼로그는 브라우저 몫, 계약은 순수 검증) */
  const n0 = scene().elements.length;
  const r = window.MK_LIVE.insertWithSrc(ed().doc, ed().sceneIdx, { name: '테스트', kind: 'image', src: 'data:image/png;base64,AAAA' });
  T('insertWithSrc 실삽입 + src 탑재', r.ok && scene().elements.length === n0 + 1 && scene().elements[n0].src === 'data:image/png;base64,AAAA');
  const src = fs.readFileSync('screens/editor.js', 'utf8');
  T('핸들러 = fileToSrc→insertWithSrc 실경로', /paneFile/.test(src) && /insertWithSrc\(doc, e\.sceneIdx/.test(src));
}

/* ============ 5. 정직 표기 — 가짜 버튼 0 ============ */
sec('5. 정직 표기');
{
  openMenu('photo');
  const off = [...D.querySelectorAll('.ed-detail button[disabled]')];
  T('미연결 항목 = disabled + 사유', off.length >= 1 && off.every((b) => /미연결|미입고|다음 몫/.test(b.textContent)));
  openMenu('text');
  const live = [...D.querySelectorAll('.ed-detail button:not([disabled])')];
  T('활성 버튼 전량 data-pane 배선(반응 없는 버튼 0)', live.every((b) => b.dataset.pane));
  T('"콘텐츠 연결 예정" 문구 — 문서 열린 패널에서 소멸', !D.querySelector('.ed-detail').textContent.includes('콘텐츠 연결 예정'));
  const src = fs.readFileSync('screens/editor.js', 'utf8');
  T('낡은 오디오 문구(R39 이전) 소멸', !/MP4 오디오 트랙은 다음 몫/.test(src) && /소리 트랙으로 실려요/.test(src));
}

/* ============ 6. 템플릿 패널 — 실이동 ============ */
sec('6. 템플릿 패널');
{
  PG.go('editor'); openMenu('tpl');
  const ai = D.querySelector('[data-pane="go-ai"]');
  ai.click();
  T('스타일 바꾸기 → AI 패널 전환', ed().menu === 'ai' && !!D.querySelector('.ed-aidock'));
  openMenu('tpl');
  D.querySelector('[data-pane="go-templates"]').click();
  T('템플릿 둘러보기 → Templates 실이동', PG.state.screen === 'templates');
  PG.go('editor');
}

/* ============ 결과 ============ */
console.log(`\nR41 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
