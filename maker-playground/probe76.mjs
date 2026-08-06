/* ============================================================
   probe76.mjs (R76) — 순서만 바뀌면 무엇이 따라 바뀌나
   ------------------------------------------------------------
   R76 은 사진 순서 변경을 「목록 통째 재렌더」에서 「노드 이동 +
   번호 재부여」로 바꾸려 한다. 그러려면 **순서에 딸려 바뀌는 것**을
   먼저 알아야 한다. 안 세고 넘어가면 화면이 거짓말을 한다.

   재는 것:
     ① estimateNow()  — 「예상: 장면 N개 · 약 S초」
     ② smartPeek()    — 자동 구성 줄
     ③ costSig()      — 캐시 서명 (순서를 보는가)
   ============================================================ */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="pgBody"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', virtualConsole: vc });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
window.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = __res(u.split('?')[0]);
  if (!f) continue;
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) {}
}

const H = window.MK_VIDHUB, C = window.MK_COMPOSE;
const img = (n) => ({ name: 'p' + n + '.jpg', kind: 'image', src: 'data:image/png;base64,AAA' + n, w: 800, h: 600 });
const N = 10;

H.resetStage();
H.st.comp = 'cx-slideshow';
H.st.theme = C.listThemes()[0].id;
H.st.title = '봄 소풍';
H.st.seed = 'probe76';
H.stageMedias(Array.from({ length: N }, (_, i) => img(i)));
/* 짝수 자리에만 문구 — 문구 유무가 배치에 영향을 준다고 화면이 말한다 */
H.st.captions = H.st.medias.map((m, i) => (i % 2 ? '' : '봄 소풍 ' + (i + 1)));
if (H.st.roles) { H.st.roles = H.st.medias.map((m, i) => (i === 2 ? 'highlight' : i === 5 ? 'exclude' : '')); }

const snap = () => {
  const e = H.estimateNow();
  let peek = null;
  try { peek = typeof H.smartPeek === 'function' ? H.smartPeek() : null; } catch (x) { peek = 'ERR ' + x.message; }
  return {
    order: H.st.medias.map((m) => m.name).join(','),
    roles: (H.st.roles || []).join(','),
    est: e ? JSON.stringify({ ok: e.ok, scenes: e.sceneCount, total: e.total, warn: (e.warnings || []).length }) : null,
    sig: typeof H.costSig === 'function' ? H.costSig() : null,
    line: typeof H.smartLineHTML === 'function' ? H.smartLineHTML() : null,
    peekScenes: peek && peek.doc && peek.doc.scenes ? peek.doc.scenes.length : (peek && peek.sceneCount) || null,
  };
};

const a = snap();

/* 0 → 3 이동 (실화면 드래그와 같은 뜻) */
const m = H.st.medias.splice(0, 1)[0], c = H.st.captions.splice(0, 1)[0];
H.st.medias.splice(3, 0, m); H.st.captions.splice(3, 0, c);
if (typeof H.dragRole === 'function') H.dragRole(0, 3);
if (typeof H.costFlush === 'function') H.costFlush();

const b = snap();

const line = (k) => `${k.padEnd(11)} ${String(a[k]).slice(0, 90)}\n${''.padEnd(11)} ${String(b[k]).slice(0, 90)}   ${a[k] === b[k] ? '= 그대로' : '≠ 바뀜'}`;
console.log('--- 0 → 3 이동 전 / 후 ---');
for (const k of ['order', 'roles', 'est', 'peekScenes', 'sig']) console.log(line(k), '\n');
console.log('자동 구성 줄 바뀜:', a.line !== b.line);
console.log('\n판정');
console.log('  예상치(장면·초)  :', a.est === b.est ? '순서에 안 흔들림' : '순서에 흔들림 → 다시 세야 함');
console.log('  자동 구성 줄     :', a.line === b.line ? '순서에 안 흔들림' : '순서에 흔들림 → 다시 세야 함');
console.log('  캐시 서명        :', a.sig === b.sig ? '순서를 못 봄 ← 구멍' : '순서를 봄');
