/* R44 — 내장 생성 그래픽 재료 검색: MK_STOCK 감사·한국어 검색·요소 삽입·배경층·렌더 호환 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);
const SK = window.MK_STOCK, PG = window.PG, D = window.document;
const ed = () => PG.state.editor;
const scene = () => ed().doc.scenes[ed().sceneIdx];

/* ============ 1. 라이브러리 감사 ============ */
sec('1. MK_STOCK 감사');
{
  const a = SK.audit();
  T('전 재료 감사 통과 (결정론·SVG·메타)', a.ok, JSON.stringify(a.violations.slice(0, 4)));
  T('36종 · 4카테고리', a.count === 36 && new Set(SK.LIB.map((x) => x.cat)).size === 4, 'n=' + a.count);
  T('srcOf = SVG dataURL', SK.LIB.every((x) => (SK.srcOf(x.id) || '').startsWith('data:image/svg+xml')));
  T('없는 id → null (거짓 성공 없음)', SK.get('없음') === null && SK.srcOf('없음') === null);
}

/* ============ 2. 한국어 검색 ============ */
sec('2. 검색');
{
  T('벚꽃 검색 적중', SK.search('벚꽃').some((x) => x.id === 'ss-sakura'));
  T('별 검색 → 별밤 포함', SK.search('별').some((x) => x.id === 'ss-star'));
  T('카테고리 검색 (배경 = 12)', SK.search('배경').length >= 12);
  T('빈 검색 = 전체', SK.search('').length === 36 && SK.search(null).length === 36);
  T('없는 말 = 0건 (가짜 결과 없음)', SK.search('공룡').length === 0);
}

/* ============ 3. 에디터 실배선 — 삽입·배경층 ============ */
sec('3. 에디터 실배선');
{
  PG.go('editor');
  D.querySelector('[data-menu="photo"]').click();
  T('사진 패널 = 검색 입력 + 그리드', !!D.querySelector('[data-stockq="P"]') && D.querySelectorAll('[data-stock]').length === 12);
  /* 검색 부분 갱신 */
  const inp = D.querySelector('[data-stockq="P"]');
  inp.value = '벚꽃'; inp.dispatchEvent(new window.Event('input'));
  const hits = [...D.querySelectorAll('[data-stockgrid="P"] [data-stock]')];
  T('검색 → 그리드 부분 갱신 (벚꽃 1건)', hits.length === 1 && hits[0].dataset.stock === 'ss-sakura');
  /* 클릭 = 요소 실삽입 */
  const n0 = scene().elements.length;
  hits[0].click();
  const el = scene().elements[scene().elements.length - 1];
  T('재료 클릭 → 요소 실삽입 + 선택 + Undo', scene().elements.length === n0 + 1 && el.src.startsWith('data:image/svg+xml') && ed().selEl === scene().elements.length - 1 && window.MK_HIST.list().some((h2) => /재료 넣기 — 벚꽃/.test(h2)));
  /* 배경 패널 — 배경층 */
  D.querySelector('[data-menu="bg"]').click();
  T('배경 패널 = 재료 그리드 실장', D.querySelectorAll('[data-stockgrid="B"] [data-stock]').length >= 1);
  const inpB = D.querySelector('[data-stockq="B"]');
  inpB.value = '별밤'; inpB.dispatchEvent(new window.Event('input'));
  const star = D.querySelector('[data-stockgrid="B"] [data-stock="ss-star"]');
  const n1 = scene().elements.length;
  star.click();
  T('배경 클릭 → 맨 뒤 층(unshift) + 풀블리드', scene().elements.length === n1 + 1 && scene().elements[0].src && scene().elements[0].w === 100 && scene().elements[0].x === 0);
  T('미연결 정직 = 실사 스톡만 남음', (() => { D.querySelector('[data-menu="photo"]').click(); const off = [...D.querySelectorAll('.ed-detail button[disabled]')]; return off.length === 1 && /실사 스톡/.test(off[0].textContent); })());
}

/* ============ 4. 렌더 호환 — SVG src 실출력 ============ */
sec('4. 렌더 호환');
{
  const R = window.MK_RENDER;
  const sc = { name: 'S', width: 1280, height: 720, duration: 3, background: '#FFFFFF', transition: 'fade', order: 0,
    elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, label: '별밤', src: SK.srcOf('ss-star') }, { kind: 'text', x: 10, y: 40, w: 80, size: 6, text: '한글 자막', weight: 800, color: '#FFFFFF' }] };
  const svg = R.toSVG(R.renderScene(sc, {}));
  T('MK_RENDER — SVG src <image href> 실출력', /<image[^>]+href="data:image\/svg\+xml/.test(svg) && /<text|<tspan/.test(svg));
  const plan = R.toRaster(R.renderScene(sc, {}), { format: 'jpg', scale: 2, planOnly: true });
  T('래스터 플랜 성립 (PDF·PNG 경로)', plan.plan && plan.plan.width === 2560);
  /* 미니씬·플레이어 경로 — 이미지로 취급(video 아님) */
  T('video 오판 없음', !window.MK_VIDEO.isVideoEl(sc.elements[0]));
}

/* ============ 결과 ============ */
console.log(`\nR44 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
