/* ============================================================
   test-round108.mjs — R108 회전이 스냅과 글자에까지 미친다
   ------------------------------------------------------------
   R107 이 회전을 workspace 의 1급 시민으로 만들면서 두 빚을 정직하게
   적어 두었다: ① 스냅·정렬은 여전히 회전 안 된 박스를 잰다 ② 텍스트는
   모델에 높이가 없어 회전 중심이 근사된다. R108 이 둘을 갚는다.

   한 주제: **화면·모델·export 가 회전 앞에서 갈라지지 않게 한다.**
     - 스냅은 사람이 실제로 보는 자리(외접 박스)를 잰다
     - 회전한 글자는 화면과 export 가 같은 축을 쓴다

   무회귀 근거: ar 을 받지 않은 snap 은 R107 과 완전히 같은 길,
   rot=0 인 텍스트는 transform-origin 자체가 출력되지 않는다.

   계약:
     ① MK_LIVE audit (R108 확장 포함)
     ② textH — render.js frameOf 추정식과 같은 값 (정본 일치 기계 교차검증)
     ③ boxOf — 텍스트만 높이를 얻고 나머지는 종전 규약
     ④ aabb — 무회전 항등 · 90° 축 교환 · 중심 불변
     ⑤ aabb — 종횡비가 축 배율을 가른다 (% 공간의 진짜 어려움)
     ⑥ snap — ar 없으면 R107 과 결과 동일 (옛 길 보존)
     ⑦ snap — 회전 요소가 외접 박스로 흡착 (자기 쪽)
     ⑧ snap — 회전한 이웃도 외접 박스로 잡힌다 (타깃 쪽)
     ⑨ snap — 텍스트 이웃의 아래변이 실높이로 잡힌다
     ⑩ workspace — 회전한 텍스트에 transform-origin, rot=0 이면 미출력
     ⑪ 화면 회전축 == export 회전축 (같은 점을 가리키는지 수치 대조)
     ⑫ 실제 드래그 경로 — workspace 이동이 외접 박스로 자석 붙는다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R108_ROOT || path.resolve('.');
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
/* R106 더블탭(350ms) 판정이 살아 있어 연속 탭이 초점 모드로 새는 것을 막는 가상 시계 */
let clock = 1e6;
const realNow = w.Date.now.bind(w.Date);
w.Date.now = () => clock;
const wait = (ms) => { clock += ms; };
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const L = w.MK_LIVE;
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-9);

console.log('--- ①~⑤ 순수 기하 ---');

T('T1 MK_LIVE audit (R108 확장 포함)', () => {
  if (!L || !L.aabb || !L.textH || !L.boxOf) return 'R108 API 없음';
  const a = L.liveAudit(); return a.ok ? true : a.violations.join(', ');
});

T('T2 textH == render.js frameOf 텍스트 추정 (정본 일치)', () => {
  const R = w.MK_RENDER;
  if (!R || !R.renderScene) return 'MK_RENDER 없음';
  /* frameOf 는 비공개라 실렌더 결과로 되짚는다:
     회전 op 의 transform=rotate(deg cx cy) 에서 cy − frame.y = h/2 */
  const H = 720, W = 1280;
  const cases = [
    { size: 4, text: '한 줄' }, { size: 4, text: 'a\nb' },
    { size: 6, text: 'a\nb\nc' }, { size: 3, text: '' },
  ];
  for (const c of cases) {
    const el = { kind: 'text', x: 10, y: 20, w: 30, size: c.size, text: c.text, rot: 30 };
    const dl = R.renderScene({ id: 't' + c.size + c.text.length, width: W, height: H, duration: 3, elements: [el] }, { noCache: true });
    const op = (dl.ops || []).find((o) => o.op === 'text');
    if (!op) return '텍스트 op 없음';
    const m = /rotate\(30 [\d.-]+ ([\d.-]+)\)/.exec((op.style || {}).transform || '');
    if (!m) return '회전 transform 없음';
    const hFromExport = (+m[1] - op.frame.y) * 2 / H * 100;
    const mine = L.textH(el);
    if (!near(hFromExport, mine, 0.02)) return `size ${c.size}/${c.text.split('\n').length}줄: export ${hFromExport.toFixed(3)} vs textH ${mine}`;
  }
  return true;
});

T('T3 boxOf — 텍스트만 높이를 얻고 나머지는 종전', () => {
  const t = L.boxOf({ kind: 'text', x: 1, y: 2, w: 30, size: 4, text: 'a\nb' });
  if (!near(t.h, 11.2)) return '텍스트 h ' + t.h;
  const m = L.boxOf({ kind: 'image', x: 1, y: 2, w: 30, h: 25 });
  if (m.h !== 25 || m.w !== 30) return '실높이 요소 변형';
  const d = L.boxOf({ x: 0, y: 0 });
  if (d.w !== 10 || d.h !== 8) return `기본값 ${d.w}/${d.h} — 종전 규약 이탈`;
  return true;
});

T('T4 aabb — 무회전 항등 · 90° 축 교환 · 중심 불변', () => {
  const b = { x: 10, y: 12, w: 20, h: 10 };
  const same = L.aabb(b, 16 / 9);
  if (same.x !== 10 || same.w !== 20 || same.h !== 10) return '무회전에서 박스가 변형됨';
  const r = L.aabb({ ...b, rot: 90 }, 1);
  if (!near(r.w, 10) || !near(r.h, 20)) return `90° 교환 실패 ${r.w}/${r.h}`;
  if (!near(r.x + r.w / 2, 20) || !near(r.y + r.h / 2, 17)) return '중심이 움직였다';
  /* 45° 는 둘 다 커진다 */
  const d = L.aabb({ ...b, rot: 45 }, 1);
  return (d.w > 20 && d.h > 10) ? true : `45° 외접이 안 커짐 ${d.w}/${d.h}`;
});

T('T5 aabb — 종횡비가 축 배율을 가른다', () => {
  const el = { x: 0, y: 0, w: 20, h: 10, rot: 90 };
  const a1 = L.aabb(el, 1), a2 = L.aabb(el, 2);
  if (near(a1.w, a2.w) && near(a1.h, a2.h)) return 'ar 을 무시한다 — % 공간 축 배율 미반영';
  if (!near(a2.w, 5) || !near(a2.h, 40)) return `ar=2 에서 ${a2.w}/${a2.h} (기대 5/40)`;
  /* ar 없이 부르면 회전을 모르는 옛 길 */
  const none = L.aabb(el);
  return (none.w === 20 && none.h === 10) ? true : 'ar 없는 호출이 옛 길이 아니다';
});

console.log('--- ⑥~⑨ 스냅 ---');

const mkOthers = () => ([{ kind: 'image', x: 60, y: 10, w: 20, h: 20 }]);

T('T6 snap — ar 없으면 회전 전 박스로 잰다 (옛 길 보존)', () => {
  /* 20x10 을 90° 회전. 이웃의 변은 60/70/80.
     옛 길 후보선 69.4/79.4/89.4 → 70 에 붙고, 새 길(외접 10) 후보선 74.4/79.4/84.4 → 80 에 붙는다. */
  const a = { kind: 'image', x: 69.4, y: 50, w: 20, h: 10, rot: 90 };
  const g = L.snap(a, mkOthers());
  if (g.v !== 70) return `옛 길 가이드 ${g.v} (기대 70 = 회전 전 중앙)`;
  if (!near(a.x, 70, 1e-9)) return 'x ' + a.x;
  const b = { kind: 'image', x: 69.4, y: 50, w: 20, h: 10, rot: 90 };
  const g2 = L.snap(b, mkOthers(), 1.2, 1);
  return (g2.v === 80) ? true : `새 길이 외접 우변 80 을 못 봄 (${g2.v})`;
});

T('T7 snap — 회전 요소가 외접 박스로 흡착 (자기 쪽)', () => {
  /* 90° 회전 + ar=1 → 외접 폭 10. 중심 x=50 인 요소의 외접 우변은 55.
     55.4 에 두면 옛 길(폭 20, 우변 65.4)은 아무 데도 안 닿고,
     새 길은 우변 55.4 를 이웃 좌변 60 이 아니라 씬 중앙 50 …이 아닌
     자기 중심 정렬로 확인한다 — 아래는 외접 좌변이 이웃 우변에 닿는 배치. */
  const el = { kind: 'image', x: 74.6, y: 50, w: 20, h: 10, rot: 90 };  /* 중심 84.6 · 외접 좌변 79.6 */
  const others = [{ kind: 'image', x: 60, y: 10, w: 20, h: 20 }];       /* 우변 80 */
  const g = L.snap(el, others, 1.2, 1);
  if (g.v !== 80) return '외접 좌변이 이웃 우변에 안 붙음 (가이드 ' + g.v + ')';
  if (!near(el.x, 75, 1e-9)) return 'x ' + el.x + ' (기대 75)';
  /* 옛 길로 같은 배치를 부르면 흡착 대상이 다르다 = 계약이 실제로 새것 */
  const el2 = { kind: 'image', x: 74.6, y: 50, w: 20, h: 10, rot: 90 };
  const g2 = L.snap(el2, others);
  return (g2.v !== 80) ? true : '옛 길도 같은 결과 — 계약이 아무것도 안 바꾼다';
});

T('T8 snap — 회전한 이웃도 외접 박스로 잡힌다 (타깃 쪽)', () => {
  /* 이웃: 20×10 을 90° 회전, ar=1 → 외접 10×20, 중심 (70,20) → 좌변 65 */
  const others = [{ kind: 'image', x: 60, y: 15, w: 20, h: 10, rot: 90 }];
  const el = { kind: 'image', x: 64.3, y: 60, w: 10, h: 10 };
  const g = L.snap(el, others, 1.2, 1);
  if (g.v !== 65) return '이웃 외접 좌변 65 를 못 봄 (가이드 ' + g.v + ')';
  if (!near(el.x, 65, 1e-9)) return 'x ' + el.x;
  const el2 = { kind: 'image', x: 64.3, y: 60, w: 10, h: 10 };
  const g2 = L.snap(el2, others);
  return (g2.v !== 65) ? true : '옛 길도 65 를 본다 — 타깃 계약이 새것이 아님';
});

T('T9 snap — 텍스트 이웃의 아래변이 실높이로 잡힌다', () => {
  /* size 6 · 3줄 → textH 25.2. y=10 이면 아래변 35.2 (옛 길은 h=8 → 18) */
  const others = [{ kind: 'text', x: 5, y: 10, w: 40, size: 6, text: 'a\nb\nc' }];
  const el = { kind: 'image', x: 5, y: 34.5, w: 10, h: 10 };
  const g = L.snap(el, others, 1.2, 16 / 9);
  if (g.h == null || !near(g.h, 35.2, 1e-9)) return '텍스트 아래변 35.2 미검출 (가이드 ' + g.h + ')';
  const el2 = { kind: 'image', x: 5, y: 34.5, w: 10, h: 10 };
  const g2 = L.snap(el2, others);
  return (g2.h == null || !near(g2.h, 35.2, 1e-9)) ? true : '옛 길도 실높이를 안다';
});

console.log('--- ⑩~⑫ 화면·export 축 일치 ---');

const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const curDoc = () => { const p0 = w.MK_PROJ.list()[0]; return p0 && p0.doc; };
const pageNo = () => +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
const curScene = () => { const d = curDoc(); return d && d.scenes[pageNo()]; };
const tapAt = (n, x, y) => {
  n.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: x, clientY: y }));
  n.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
};
let built = false;
const build = () => {
  if (built) return true;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '회전하는 제목'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  built = !!r.ok; return built ? true : (r.why || '빌드 실패');
};
const findText = () => {
  for (let g = 0; g < 8; g++) {
    const n = w.document.querySelector('.ws-el.text[data-ws-el]');
    if (n) return n;
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  return null;
};
const redraw = () => { wait(600); const n = w.document.querySelector('.ws-el[data-ws-el]'); if (n) tapAt(n, 5, 5); };

T('T10 workspace — 회전한 텍스트에 transform-origin, rot=0 이면 미출력', () => {
  const b = build(); if (b !== true) return b;
  const n0 = findText(); if (!n0) return '텍스트 요소 없음';
  const ti = +n0.dataset.wsEl;
  if (/transform/.test(n0.getAttribute('style') || '')) return '무회전인데 transform 계열 출력(바이트 동일 깨짐)';
  curScene().elements[ti].rot = 30;
  redraw();
  const st = (w.document.querySelector(`.ws-el.text[data-ws-el="${ti}"]`) || { getAttribute: () => '' }).getAttribute('style') || '';
  if (!/transform:rotate\(30deg\)/.test(st)) return '회전 미출력: ' + st.slice(-70);
  if (!/transform-origin:\s*50%\s*[\d.]+px/.test(st)) return 'R108 축 지정 없음: ' + st.slice(-70);
  delete curScene().elements[ti].rot; redraw();
  const st2 = (w.document.querySelector(`.ws-el.text[data-ws-el="${ti}"]`) || { getAttribute: () => '' }).getAttribute('style') || '';
  return /transform/.test(st2) ? '해제 후 잔존' : true;
});

T('T11 화면 회전축 == export 회전축 (같은 점)', () => {
  const b = build(); if (b !== true) return b;
  const n0 = findText(); if (!n0) return '텍스트 요소 없음';
  const ti = +n0.dataset.wsEl;
  const sc = curScene();
  sc.elements[ti].rot = 30;
  redraw();
  const st = (w.document.querySelector(`.ws-el.text[data-ws-el="${ti}"]`) || { getAttribute: () => '' }).getAttribute('style') || '';
  const mo = /transform-origin:\s*50%\s*([\d.]+)px/.exec(st);
  if (!mo) return 'origin 없음';
  const originY = +mo[1];
  const CW = Math.round(560 * (w.MK_WS.state.zoom || 100) / 100);
  const CH = Math.round(CW * sc.height / sc.width);
  const dl = w.MK_RENDER.renderScene(sc, { noCache: true });
  const op = (dl.ops || []).find((o) => o.op === 'text' && /rotate\(30/.test(((o.style || {}).transform) || ''));
  if (!op) return 'export 회전 텍스트 없음';
  const m = /rotate\(30 [\d.-]+ ([\d.-]+)\)/.exec(op.style.transform);
  const expRatio = (+m[1] - op.frame.y) / sc.height;   /* 요소 상단으로부터의 축, 씬 높이 비율 */
  const scrRatio = originY / CH;
  delete sc.elements[ti].rot; redraw();
  return near(expRatio, scrRatio, 0.002) ? true
    : `축 불일치 — 화면 ${scrRatio.toFixed(4)} vs export ${expRatio.toFixed(4)}`;
});

T('T12 workspace 이동 제스처가 씬 종횡비를 스냅에 넘긴다', () => {
  const b = build(); if (b !== true) return b;
  const n0 = w.document.querySelector('.ws-el[data-ws-el]'); if (!n0) return '요소 없음';
  const sc = curScene();
  const seen = [];
  const orig = L.snap;
  L.snap = function (el, others, thr, ar) { seen.push(ar); return orig.apply(this, arguments); };
  try {
    n0.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0 });
    wait(600);
    n0.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 20, clientY: 20 }));
    n0.dispatchEvent(new w.MouseEvent('pointermove', { bubbles: true, clientX: 34, clientY: 30 }));
    n0.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true, clientX: 34, clientY: 30 }));
  } finally { L.snap = orig; }
  if (!seen.length) return '이동 중 snap 미호출';
  const want = sc.width / sc.height;
  return seen.some((a) => a && Math.abs(a - want) < 1e-9) ? true
    : `넘어온 ar ${JSON.stringify(seen)} (기대 ${want.toFixed(4)}) — 배선 없음`;
});

if (realNow() < 0) console.log('unreachable');
console.log(`\nR108: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
