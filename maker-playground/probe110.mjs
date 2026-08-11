/* probe110.mjs — 두 세계에 같은 손끝을 넣고 글자가 도는 각을 잰다.
   MK_LIVE 의 새 API 를 일절 쓰지 않는다(옛 세계에서도 돌아야 하므로):
   모델 축은 textH 공식을 탐침이 직접 계산한다.
   손끝은 「모델 축의 정확히 오른쪽」 — 모델 축이 참이면 90°. */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R110_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
let clock = 1e6; w.Date.now = () => clock;
const wait = (ms) => { clock += ms; };
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

const pe = (t, n, o) => n.dispatchEvent(new w.PointerEvent(t, { bubbles: true, ...o }));
const H = w.MK_VIDHUB;
w.PG.go('video');
H.st.comp = 'cx-slideshow'; H.st.title = 'probe'; H.st.sub = '';
H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n })));
wait(600);

const sc = () => w.MK_PROJ.current().doc.scenes[w.MK_WS.state.sceneIdx];
let n = w.document.querySelector('.ws-el.text[data-ws-el]');
const i = +n.dataset.wsEl;
const el = sc().elements[i];
el.x = 10; el.y = 10; el.w = 30; el.size = 6; el.text = '두 줄\n글자';
pe('pointerdown', n, { clientX: 0, clientY: 0 }); pe('pointerup', n, {});
wait(600);
n = w.document.querySelector(`.ws-el.text[data-ws-el="${i}"]`);

/* 탐침이 직접 계산하는 모델 축 — textH = max(1.5s, 1.4s·줄수) */
const CW = Math.round(560 * w.MK_WS.state.zoom / 100);
const CH = Math.round(CW * (sc().height || 9) / (sc().width || 16));
const textH = Math.max(el.size * 1.5, el.size * 1.4 * el.text.split('\n').length);
const PX = (el.x + el.w / 2) / 100 * CW;
const PY = (el.y + textH / 2) / 100 * CH;

const rh = n.querySelector('[data-ws-rh]');
pe('pointerdown', rh, { clientX: 0, clientY: -20 });
pe('pointermove', rh, { clientX: PX + 120, clientY: PY });
pe('pointerup', rh, {});

console.log(`모델 축 = (${PX.toFixed(1)}, ${PY.toFixed(1)}) · 손끝 = 축의 정확히 오른쪽`);
console.log(`글자가 돈 각 = ${sc().elements[i].rot || 0}°   (참이면 90°)`);
