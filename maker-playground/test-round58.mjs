/* R58 — 타임라인 씬 길이 그 자리 조절 검증 (Animation + Workspace Footer) */
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
const ev = () => ({ stopPropagation() {}, target: null });

const C = window.MK_COMPOSE;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));
window.MK_START.open(C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: '시간 조절' } }).doc);
const doc2 = () => window.MK_PROJ.current().doc;

/* ---------- 1. Workspace Footer ---------- */
T('Workspace 선택 칩에만 −/입력/+ 컨트롤 렌더', () => {
  PG.render();
  A(document.querySelector('.ws-timeline'), '타임라인 없음');
  const on = document.querySelector('.ws-timeline .tl.on .mk-durctl');
  A(on, '선택 칩 컨트롤 없음');
  A(document.querySelectorAll('.ws-timeline .mk-durctl').length === 1, '비선택 칩에도 렌더');
  A(on.querySelector('[data-ws-dm]') && on.querySelector('[data-ws-dp]') && on.querySelector('[data-ws-dv]'), '−/입력/+ 누락');
});

T('+ 클릭 → 0.5초 증가 + doc 실반영 + flex 폭 변화 + undo 적립', () => {
  const i = 0;
  /* 씬 0 선택 상태 확인 */
  const t0 = doc2().scenes[i].duration || 3;
  document.querySelector(`[data-ws-dp="${i}"]`).onclick(ev());
  A(doc2().scenes[i].duration === Math.round((t0 + 0.5) * 10) / 10, '증가 미반영: ' + doc2().scenes[i].duration);
  PG.render();
  const chip = document.querySelector(`.ws-timeline [data-ws-sc="${i}"]`);
  A(chip.getAttribute('style').includes(`flex:${doc2().scenes[i].duration}`), 'flex 폭 미반영');
  document.querySelector('[data-ws="undo"]').onclick();
  A((doc2().scenes[i].duration || 3) === t0, 'undo 미동작');
  document.querySelector('[data-ws="redo"]').onclick();
  PG.render();
});

T('− 클릭 반복 → 1초 하한 클램프', () => {
  const i = 0;
  for (let k = 0; k < 20; k++) { document.querySelector(`[data-ws-dm="${i}"]`).onclick(ev()); PG.render(); }
  A(doc2().scenes[i].duration === 1, '하한: ' + doc2().scenes[i].duration);
});

T('입력 직접 변경 → 반영 + 30초 상한 클램프', () => {
  const i = 0;
  const inp = document.querySelector(`[data-ws-dv="${i}"]`);
  inp.value = '4.5'; inp.onchange(ev());
  A(doc2().scenes[i].duration === 4.5, '입력 미반영');
  PG.render();
  const inp2 = document.querySelector(`[data-ws-dv="${i}"]`);
  inp2.value = '99'; inp2.onchange(ev());
  A(doc2().scenes[i].duration === 30, '상한: ' + doc2().scenes[i].duration);
  PG.render();
});

T('컨트롤 클릭은 씬 선택으로 번지지 않음 (data-stop 가드)', () => {
  /* 씬 1 선택 후, 칩 onclick에 컨트롤 target 이벤트 전달 → 선택 유지돼야 */
  document.querySelectorAll('.ws-timeline [data-ws-sc]')[1].onclick();
  PG.render();
  const before = document.querySelector('.ws-timeline .tl.on [data-ws-dv]').dataset.wsDv;
  const chip0 = document.querySelectorAll('.ws-timeline [data-ws-sc]')[0];
  const fakeTarget = { closest: (sel) => sel === '[data-stop]' ? {} : null };
  chip0.onclick({ target: fakeTarget, stopPropagation() {} });
  PG.render();
  A(document.querySelector('.ws-timeline .tl.on [data-ws-dv]').dataset.wsDv === before, '선택이 번짐');
});

/* ---------- 2. Animation Timeline ---------- */
T('Animation 선택 칩에만 −/입력/+ 렌더', () => {
  PG.go('animation'); PG.render();
  const on = document.querySelector('.an-timeline .tl.on .mk-durctl');
  A(on, '선택 칩 컨트롤 없음');
  A(document.querySelectorAll('.an-timeline .mk-durctl').length === 1, '비선택 칩에도 렌더');
});

T('Animation +/−/입력 → doc 실반영 + 클램프 (Workspace와 동일 doc)', () => {
  const si = [...document.querySelectorAll('.an-timeline [data-an-sc]')].findIndex((b) => b.className.includes('on'));
  /* 앞 테스트가 상한(30)으로 만들었을 수 있어 중간값으로 리셋 */
  const inp0 = document.querySelector(`[data-an-dv="${si}"]`);
  inp0.value = '5'; inp0.onchange(ev()); PG.render();
  const t0 = doc2().scenes[si].duration;
  document.querySelector(`[data-an-dp="${si}"]`).onclick(ev());
  A(doc2().scenes[si].duration === Math.round((t0 + 0.5) * 10) / 10, '+ 미반영');
  PG.render();
  const inp = document.querySelector(`[data-an-dv="${si}"]`);
  inp.value = '0.2'; inp.onchange(ev());
  A(doc2().scenes[si].duration === 1, '하한 클램프');
  PG.render();
  A(document.querySelector(`.an-timeline [data-an-sc="${si}"]`).getAttribute('style').includes('flex:1'), 'flex 미반영');
});

T('Enter·Idle·Exit 구간 표시가 새 길이 기준으로 재계산', () => {
  const si = [...document.querySelectorAll('.an-timeline [data-an-sc]')].findIndex((b) => b.className.includes('on'));
  const inp = document.querySelector(`[data-an-dv="${si}"]`);
  inp.value = '10'; inp.onchange(ev());
  PG.render();
  const sc2 = doc2().scenes[si];
  const chip = document.querySelector(`.an-timeline [data-an-sc="${si}"]`);
  const inW = parseFloat(chip.querySelector('.seg.in').style.width);
  A(Math.abs(inW - Math.min(90, sc2.anim.enter.duration / 10 * 100)) < 0.5, 'Enter 구간 재계산: ' + inW);
});

console.log(`\nR58: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
