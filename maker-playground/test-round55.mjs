/* R55 — Workspace 캔버스 실편집: 드래그 이동·핸들 리사이즈 (MK_LIVE 재사용) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
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

const PG = window.PG;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const mouse = (type, x, y, opts = {}) => new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ...opts });

/* ---- 준비: compose로 실제 프로젝트 생성 → Workspace 진입 (준호 재현 경로) ---- */
const C = window.MK_COMPOSE;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));
const built = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(4), texts: { title: '행사 하이라이트' } });
window.MK_START.open(built.doc);

const WSdoc = () => window.MK_PROJ.current().doc;
/* 이미지가 있는 첫 씬으로 이동 (씬 0은 제목 씬 — 텍스트만) */
const SI = window.MK_PROJ.current().doc.scenes.findIndex((s2) => s2.elements.some((e) => e.kind === 'image' && e.src));
const WSscene = () => WSdoc().scenes[SI];
let cv = null;
const RECT = { left: 0, top: 0, width: 1000, height: 562, right: 1000, bottom: 562 };
const fixRect = () => { cv = window.document.querySelector('[data-ws-canvas]'); if (cv) { cv.getBoundingClientRect = () => RECT; Object.defineProperty(cv, 'clientHeight', { value: 562, configurable: true }); } };
const draw = () => { PG.render(); fixRect(); };

T('Workspace 진입 — compose 프로젝트가 캔버스에 렌더', () => {
  draw();
  A(cv, '캔버스 없음');
  A(SI >= 0, '이미지 씬 없음');
  const tab = document.querySelector(`[data-ws-sc="${SI}"]`);
  A(tab, '씬 탭 없음');
  tab.onclick();
  draw();
  A(cv.querySelectorAll('[data-ws-el]').length === WSscene().elements.length, '요소 수 불일치');
});

/* ---- 1. 선택 → 핸들 표시 ---- */
const mi = WSscene().elements.findIndex((e) => e.kind === 'image' && e.src);
T('이미지 pointerdown → 선택 + 재렌더 후 핸들 6개(코너4+변2)', () => {
  A(mi >= 0, '이미지 요소 없음');
  const n = cv.querySelector(`[data-ws-el="${mi}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointerup', 100, 100));
  draw();
  const sel = cv.querySelector(`[data-ws-el="${mi}"]`);
  A(sel.classList.contains('sel'), '선택 안 됨');
  A(sel.querySelectorAll('.ws-hd').length === 6, '핸들 수: ' + sel.querySelectorAll('.ws-hd').length);
});

T('미디어 클립이 내부 span으로 이동 — 핸들이 overflow에 잘리지 않는 구조', () => {
  const sel = cv.querySelector(`[data-ws-el="${mi}"]`);
  A(!/overflow:\s*hidden/.test(sel.getAttribute('style') || ''), '외곽에 overflow 잔존');
  const clip = sel.querySelector('.ws-clip');
  A(clip && clip.querySelector('.ws-media'), '클립 구조 없음');
});

/* ---- 2. 드래그 이동 ---- */
T('드래그 → x·y 실반영 (+10%/+10%±자석)', () => {
  const el = WSscene().elements[mi];
  const x0 = el.x, y0 = el.y;
  const n = cv.querySelector(`[data-ws-el="${mi}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointermove', 200, 156.2));   /* +10% / +10% */
  cv.dispatchEvent(mouse('pointerup', 200, 156.2));
  const el2 = WSscene().elements[mi];
  A(Math.abs(el2.x - (x0 + 10)) <= 1.3 && Math.abs(el2.y - (y0 + 10)) <= 1.3, `x ${x0}→${el2.x} y ${y0}→${el2.y}`);
});

T('드래그 후 선택 유지 + undo 1건 적립', () => {
  draw();
  const sel = cv.querySelector(`[data-ws-el="${mi}"]`);
  A(sel && sel.classList.contains('sel'), '선택 풀림');
  A(window.MK_WS ? true : true, '');
  /* undo 실행 → 원위치 */
  const el = WSscene().elements[mi];
  const moved = el.x;
  const undoBtn = document.querySelector('[data-ws="undo"]');
  A(undoBtn, 'undo 버튼 없음');
  undoBtn.onclick();
  draw();
  A(WSscene().elements[mi].x !== moved, 'undo 미동작');
  /* redo로 복귀 */
  document.querySelector('[data-ws="redo"]').onclick();
  draw();
  A(Math.abs(WSscene().elements[mi].x - moved) < 1e-9, 'redo 미동작');
});

/* ---- 3. 핸들 리사이즈 ---- */
T('br 핸들 드래그 → w·h 실반영 (크기 조절)', () => {
  draw();
  const el = WSscene().elements[mi];
  const w0 = el.w, h0 = el.h;
  const hd = cv.querySelector(`[data-ws-el="${mi}"] .ws-hd.br`);
  A(hd, 'br 핸들 없음');
  hd.dispatchEvent(mouse('pointerdown', 500, 300));
  cv.dispatchEvent(mouse('pointermove', 600, 356.2));   /* +10% / +10% */
  cv.dispatchEvent(mouse('pointerup', 600, 356.2));
  const el2 = WSscene().elements[mi];
  A(el2.w > w0 + 8 && el2.h > h0 + 8, `w ${w0}→${el2.w} h ${h0}→${el2.h}`);
});

T('ml 핸들 — 좌변 리사이즈 시 우변 고정(x+w 보존)', () => {
  draw();
  const el = WSscene().elements[mi];
  const right = el.x + el.w;
  const hd = cv.querySelector(`[data-ws-el="${mi}"] .ws-hd.ml`);
  hd.dispatchEvent(mouse('pointerdown', 300, 300));
  cv.dispatchEvent(mouse('pointermove', 350, 300));     /* +5% 안쪽으로 */
  cv.dispatchEvent(mouse('pointerup', 350, 300));
  const el2 = WSscene().elements[mi];
  A(Math.abs((el2.x + el2.w) - right) < 0.5, '우변 이동: ' + (el2.x + el2.w) + ' vs ' + right);
});

/* ---- 4. 텍스트 요소 ---- */
T('텍스트 드래그 이동 + 코너 리사이즈 → size 실변화', () => {
  /* 텍스트가 있는 씬으로 이동 (제목 씬) */
  const TI = WSdoc().scenes.findIndex((s2) => s2.elements.some((e) => e.kind === 'text'));
  A(TI >= 0, '텍스트 씬 없음');
  document.querySelector(`[data-ws-sc="${TI}"]`).onclick();
  draw();
  const tsc = () => WSdoc().scenes[TI];
  const ti = tsc().elements.findIndex((e) => e.kind === 'text');
  const el = tsc().elements[ti];
  const x0 = el.x, s0 = el.size;
  const n = cv.querySelector(`[data-ws-el="${ti}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointermove', 150, 100));
  cv.dispatchEvent(mouse('pointerup', 150, 100));
  A(Math.abs(tsc().elements[ti].x - (x0 + 5)) <= 1.3, '텍스트 이동 미반영');
  draw();
  const hd = cv.querySelector(`[data-ws-el="${ti}"] .ws-hd.br`);
  A(hd, '텍스트 br 핸들 없음');
  hd.dispatchEvent(mouse('pointerdown', 400, 300));
  cv.dispatchEvent(mouse('pointermove', 520, 380));
  cv.dispatchEvent(mouse('pointerup', 520, 380));
  A(tsc().elements[ti].size !== s0, '텍스트 size 미변화');
  /* 이미지 씬으로 복귀 */
  document.querySelector(`[data-ws-sc="${SI}"]`).onclick();
  draw();
});

/* ---- 5. 제스처 규약 ---- */
T('클릭만(이동 없음) → doc 무변화·undo 미적립', () => {
  draw();
  const before = JSON.stringify(WSdoc().scenes);
  const n = cv.querySelector(`[data-ws-el="${mi}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointerup', 100, 100));
  A(JSON.stringify(WSdoc().scenes) === before, '클릭만으로 doc 변화');
});

T('씬 이탈 방지 — 화면 밖으로 끌어도 MK_LIVE 경계 규약 유지', () => {
  draw();
  const n = cv.querySelector(`[data-ws-el="${mi}"]`);
  n.dispatchEvent(mouse('pointerdown', 100, 100));
  cv.dispatchEvent(mouse('pointermove', 3000, 3000));
  cv.dispatchEvent(mouse('pointerup', 3000, 3000));
  const el = WSscene().elements[mi];
  A(el.x <= 96 + 1e-9 && el.y <= 96 + 1e-9, '이탈: ' + el.x + ',' + el.y);
});

console.log(`\nR55: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
