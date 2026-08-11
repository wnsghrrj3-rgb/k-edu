/* ============================================================
   test-round110.mjs — R110 텍스트 상자가 모델과 하나가 되고,
                        회전 축이 DOM 을 떠난다
   ------------------------------------------------------------
   R109 가 정직하게 남긴 빚:
     「회전 손잡이 제스처의 중심과 회전 텍스트의 손잡이 실좌표는
      DOM 박스를 쓰는데, 텍스트는 DOM 높이가 모델 textH 와 다를 수 있다」

   파고 보니 뿌리는 하나 더 깊었다. 텍스트 div 는 브라우저 자동 높이로
   서 있었다 — CSS line-height 1.3 · 자동 줄바꿈. 반면 리사이즈·스냅·
   정렬·간격·export(render.js frameOf)는 전부 모델 높이 textH
   (= max(1.5·size, 1.4·size·줄수))를 쓴다. 즉 근사가 아니라 두 개의
   상자가 있었다: 1줄 size 6 글자에서 DOM 7.8% vs 모델 9.0%.
     · 손잡이는 DOM 상자 모서리에 앉는데 끌면 모델 상자가 움직였고
     · 회전 제스처는 DOM 중심으로 각을 쟀는데 글자는 textH 중심으로 돌았다

   R110 이 갚는 방식 — 상자를 하나로:
     - 화면의 텍스트 div 가 모델 높이를 입는다 (height:textH%,
       overflow:visible = export 의 기본 overflow 규약과 동일).
       그러면 R109 의 손잡이 실좌표 기계는 한 줄도 안 고치고 정확해진다.
     - MK_LIVE.boxPx·pivotPx — 회전 불변점을 모델에서 직접 뽑는다.
       회전 제스처가 DOM 측정에 의존하기를 그만둔다.

   계약:
     ① MK_LIVE audit (R110 확장 포함)
     ② boxPx — % → px 환산, 텍스트는 textH 로 높이를 받는다
     ③ pivotPx — 회전 불변점 (각도를 바꿔도 같은 점)
     ④ pivotPx — 사진·도형은 외접 상자 중심과 일치 (무회귀 증명)
     ⑤ 텍스트 렌더가 모델 높이를 입는다 (height:textH% · overflow:visible)
     ⑥ 새 상자의 기하 중심 == R108 이 심은 transform-origin (같은 점)
     ⑦ 비텍스트 렌더는 무변형 — height/overflow 를 얻지 않았다
     ⑧ 회전 제스처가 모델 축을 쓴다 — 텍스트에서 DOM 중심 축과
        다른 각이 나오는 배치로 대조 (옛 세계면 다른 값)
     ⑨ 회전 제스처 — 사진은 종전과 같은 각 (무회귀)
     ⑩ epiv 실측 불가 폴백 — pivotPx 가 없으면 erect 중심으로 되돌아감
     ⑪ 손잡이 CSS 계약 — .ws-hd 6종이 요소 상자 변에 못박혀 있다
        (⑤와 합쳐 「보이는 손잡이 == 모델 모서리」가 성립)
     ⑫ focalAt 프레임 — 사진은 종전 수치 그대로 (boxPx 경유 무변형)
   ============================================================ */
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
let clock = 1e6;
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

console.log('--- ①~④ 순수 층: 모델 박스와 회전 불변점 ---');

T('T1 MK_LIVE audit (R110 확장 포함)', () => {
  if (!L) return 'MK_LIVE 없음';
  if (!L.boxPx || !L.pivotPx) return 'boxPx/pivotPx 미노출';
  const a = L.liveAudit(); return a.ok ? true : a.violations.join(', ');
});

T('T2 boxPx — % 환산, 텍스트는 textH 로 높이를 받는다', () => {
  const CW = 560, CH = 315;
  const p = L.boxPx({ kind: 'image', x: 10, y: 20, w: 30, h: 40 }, CW, CH);
  if (!near(p.x, 56) || !near(p.y, 63) || !near(p.w, 168) || !near(p.h, 126)) return `사진 환산 오류 ${JSON.stringify(p)}`;
  /* 텍스트는 모델에 h 가 없다 — 여기서 0 이 나오면 옛 세계 */
  const t2 = { kind: 'text', x: 0, y: 0, w: 40, size: 6, text: '한 줄' };
  const tp = L.boxPx(t2, CW, CH);
  const want = L.textH(t2) / 100 * CH;
  if (!near(tp.h, want)) return `텍스트 높이 ${tp.h.toFixed(3)} ≠ textH ${want.toFixed(3)}`;
  if (near(tp.h, 0)) return '텍스트 높이가 0 (h 없음을 그대로 씀)';
  /* 2줄이면 정확히 1.4·size·2 */
  const t3 = { kind: 'text', x: 0, y: 0, w: 40, size: 6, text: 'ㄱ\nㄴ' };
  if (!near(L.boxPx(t3, CW, CH).h, 6 * 1.4 * 2 / 100 * CH)) return '2줄 높이 규약 위반';
  return true;
});

T('T3 pivotPx — 회전 불변점 (각을 바꿔도 같은 점)', () => {
  const CW = 560, CH = 315;
  const base = { kind: 'text', x: 12, y: 7, w: 30, size: 5, text: '가나다\n라마' };
  const p0 = L.pivotPx(base, CW, CH);
  for (const d of [1, 37, 90, 137, 180, 271, 359]) {
    const p = L.pivotPx({ ...base, rot: d }, CW, CH);
    if (!near(p.x, p0.x) || !near(p.y, p0.y)) return `${d}° 에서 축 이동 (${p.x.toFixed(3)},${p.y.toFixed(3)})`;
  }
  /* 값 자체도 모델 정의와 일치해야 한다 */
  const b = L.boxOf(base);
  if (!near(p0.x, (b.x + b.w / 2) / 100 * CW) || !near(p0.y, (b.y + b.h / 2) / 100 * CH)) return '축이 모델 박스 중심이 아님';
  return true;
});

T('T4 pivotPx — 사진·도형은 외접 상자 중심과 일치 (무회귀)', () => {
  const CW = 560, CH = 315;
  /* aabb 는 중심 불변이 설계 — 새 축이 옛 DOM 축(=외접 중심)과 같음을 기계로 못박는다 */
  for (const d of [0, 30, 90, 210]) {
    for (const el of [{ kind: 'image', x: 5, y: 5, w: 24, h: 18, rot: d },
      { kind: 'shape', x: 40, y: 33, w: 12, h: 12, rot: d }]) {
      const p = L.pivotPx(el, CW, CH);
      const ab = L.aabb(el, CW / CH);
      const cx = (ab.x + ab.w / 2) / 100 * CW, cy = (ab.y + ab.h / 2) / 100 * CH;
      if (!near(p.x, cx, 1e-6) || !near(p.y, cy, 1e-6)) return `${el.kind} ${d}° 축이 외접 중심과 어긋남`;
    }
  }
  return true;
});

console.log('--- ⑤~⑦ 렌더 층: 상자가 하나가 되었는가 ---');

const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const curDoc = () => w.MK_PROJ && w.MK_PROJ.current && w.MK_PROJ.current().doc;
const pageNo = () => (w.MK_WS && w.MK_WS.state ? w.MK_WS.state.sceneIdx : 0);
const curScene = () => { const d = curDoc(); return d && d.scenes[pageNo()]; };
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
let built = false;
const build = () => {
  if (built) return true;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '회전 축'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  built = !!r.ok; return built ? true : (r.why || '빌드 실패');
};
const styOf = (n) => n.getAttribute('style') || '';
const textNode = () => w.document.querySelector('.ws-el.text[data-ws-el]');
const mediaNode = () => w.document.querySelector('.ws-el.media[data-ws-el]');

T('T5 텍스트 렌더가 모델 높이를 입는다 (height:textH% · overflow:visible)', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  const n = textNode(); if (!n) return '텍스트 요소 없음';
  const el = curScene().elements[+n.dataset.wsEl];
  const s = styOf(n);
  const m = s.match(/height:([\d.]+)%/);
  if (!m) return `height 미지정 — 여전히 브라우저 자동 높이 (style: ${s.slice(0, 120)})`;
  const want = +L.textH(el).toFixed(3);
  if (!near(+m[1], want, 1e-3)) return `height ${m[1]}% ≠ textH ${want}%`;
  if (!/overflow:visible/.test(s)) return 'overflow:visible 없음 — 넘치는 글자가 잘려 export 와 다른 그림이 된다';
  return true;
});

T('T6 새 상자의 기하 중심 == R108 이 심은 transform-origin', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  let n = textNode(); if (!n) return '텍스트 요소 없음';
  const i = +n.dataset.wsEl;
  curScene().elements[i].rot = 40;
  wait(600);
  /* 재렌더 유도 — 요소 선택 경로 (캔버스 여백 탭은 요소 렌더를 안 건드린다) */
  pe('pointerdown', n, { clientX: 0, clientY: 0 }); pe('pointerup', n, {});
  wait(600);
  n = w.document.querySelector(`.ws-el.text[data-ws-el="${i}"]`);
  if (!n) return '재렌더 소실';
  const el = curScene().elements[i];
  const s = styOf(n);
  const mo = s.match(/transform-origin:50% ([\d.]+)px/);
  const mh = s.match(/height:([\d.]+)%/);
  delete curScene().elements[i].rot;
  if (!mo) return 'transform-origin 없음 (R108 축 소실)';
  if (!mh) return 'height 없음';
  /* origin(px) 은 CH 기준, height(%) 도 CH 기준 — 상자 절반과 같은 점이어야 한다 */
  const sc = curScene();
  const CW = Math.round(560 * (w.MK_WS.state.zoom) / 100);
  const CH = Math.round(CW * (sc.height || 9) / (sc.width || 16));
  const halfBox = +mh[1] / 100 * CH / 2;
  return near(+mo[1], +halfBox.toFixed(1), 0.15) ? true
    : `축 ${mo[1]}px ≠ 상자 절반 ${halfBox.toFixed(1)}px — 화면 상자와 회전축이 아직 두 개`;
});

T('T7 비텍스트 렌더는 무변형 (height/overflow 를 얻지 않았다)', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  const n = mediaNode(); if (!n) return '미디어 요소 없음';
  const s = styOf(n);
  if (/overflow:visible/.test(s)) return '사진이 텍스트 전용 스타일을 얻음';
  const el = curScene().elements[+n.dataset.wsEl];
  const m = s.match(/height:([\d.]+)%/);
  if (!m) return true;                       /* 원래 height 를 안 쓰는 경로면 그대로 */
  return near(+m[1], el.h, 1e-3) ? true : `사진 height ${m[1]}% ≠ 모델 h ${el.h}% (오염)`;
});

console.log('--- ⑧~⑫ 제스처 실경로 ---');

/* 회전 제스처를 실제로 굴려 el.rot 을 읽는다. jsdom 은 레이아웃이 없어
   getBoundingClientRect 이 전부 0 이다 — 그래서 옛 세계(DOM 중심)의 축은
   원점 (0,0) 이 되고, 새 세계(모델)의 축은 캔버스 좌표계의 실제 점이 된다.
   두 축은 같은 손끝에 대해 다른 각을 낸다: 이 차이가 계약의 증거다. */
const spinTo = (n, cx, cy) => {
  const rh = n.querySelector('[data-ws-rh]');
  if (!rh) return null;
  pe('pointerdown', rh, { clientX: 0, clientY: -20 });
  pe('pointermove', rh, { clientX: cx, clientY: cy });
  pe('pointerup', rh, {});
  return true;
};

T('T8 회전 제스처가 모델 축을 쓴다 (DOM 중심 축과 대조)', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  let n = textNode(); if (!n) return '텍스트 요소 없음';
  const i = +n.dataset.wsEl;
  const el = curScene().elements[i];
  el.x = 10; el.y = 10; el.w = 30; el.size = 6; el.text = '두 줄\n글자';
  /* 선택시켜 손잡이를 띄운다 */
  pe('pointerdown', n, { clientX: 0, clientY: 0 }); pe('pointerup', n, {});
  wait(600);
  n = w.document.querySelector(`.ws-el.text[data-ws-el="${i}"]`);
  if (!n) return '재렌더 소실';
  const sc = curScene();
  const CW = Math.round(560 * w.MK_WS.state.zoom / 100);
  const CH = Math.round(CW * (sc.height || 9) / (sc.width || 16));
  const pv = L.pivotPx(el, CW, CH);
  if (!(pv.x > 1 && pv.y > 1)) return '모델 축이 원점 부근이라 대조가 성립 안 함';
  /* 손끝을 모델 축의 정확히 오른쪽에 둔다 → 모델 축이면 90°.
     옛 세계(원점 축)라면 같은 손끝이 다른 각을 낸다. */
  const TX = pv.x + 120, TY = pv.y;
  const legacyDeg = Math.round((Math.atan2(TY - 0, TX - 0) * 180 / Math.PI + 90 + 360) % 360);
  if (legacyDeg === 90) return '대조 배치 오류: 옛 축도 90° — 계약이 아무것도 증명 못 함';
  if (spinTo(n, TX, TY) !== true) return '회전 손잡이 미렌더';
  const got = L.rotOf(curScene().elements[i]);
  delete curScene().elements[i].rot;
  return got === 90 ? true : `모델 축이면 90° 인데 ${got}° (옛 DOM 축이면 ${legacyDeg}°)`;
});

T('T9 회전 제스처 — 사진은 종전과 같은 각 (무회귀)', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  let n = mediaNode(); if (!n) return '미디어 요소 없음';
  const i = +n.dataset.wsEl;
  const el = curScene().elements[i];
  el.x = 20; el.y = 20; el.w = 30; el.h = 30;
  pe('pointerdown', n, { clientX: 0, clientY: 0 }); pe('pointerup', n, {});
  wait(600);
  n = w.document.querySelector(`.ws-el.media[data-ws-el="${i}"]`);
  if (!n) return '재렌더 소실';
  const sc = curScene();
  const CW = Math.round(560 * w.MK_WS.state.zoom / 100);
  const CH = Math.round(CW * (sc.height || 9) / (sc.width || 16));
  const pv = L.pivotPx(el, CW, CH);
  /* 사진은 모델 축 == 외접 중심. 레이아웃이 살아 있었다면 옛 경로도 같은 점을
     찍었을 것 — 여기서는 「모델 축으로 잰 각이 기하학적으로 맞다」를 확인한다. */
  if (spinTo(n, pv.x, pv.y - 150) !== true) return '회전 손잡이 미렌더';
  const up = L.rotOf(curScene().elements[i]);
  if (up !== 0) return `축 바로 위 = 0° 여야 하는데 ${up}°`;
  if (spinTo(n, pv.x + 150, pv.y) !== true) return '두 번째 회전 실패';
  const right = L.rotOf(curScene().elements[i]);
  delete curScene().elements[i].rot;
  return right === 90 ? true : `축 오른쪽 = 90° 여야 하는데 ${right}°`;
});

T('T10 폴백 — pivotPx 가 없으면 erect 중심으로 되돌아간다', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  let n = mediaNode(); if (!n) return '미디어 요소 없음';
  const i = +n.dataset.wsEl;
  pe('pointerdown', n, { clientX: 0, clientY: 0 }); pe('pointerup', n, {});
  wait(600);
  n = w.document.querySelector(`.ws-el.media[data-ws-el="${i}"]`);
  if (!n) return '재렌더 소실';
  n.getBoundingClientRect = () => ({ left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300, x: 100, y: 100 });
  const orig = L.pivotPx;
  delete L.pivotPx;                            /* 실측 불가 환경 모사 */
  let ok;
  try {
    /* erect 중심 (200,200) 의 오른쪽 → 90° */
    ok = spinTo(n, 350, 200) === true;
  } finally { L.pivotPx = orig; }
  if (!ok) return '회전 손잡이 미렌더';
  const got = L.rotOf(curScene().elements[i]);
  delete curScene().elements[i].rot;
  return got === 90 ? true : `폴백 축으로 90° 여야 하는데 ${got}° (폴백 소실)`;
});

T('T11 손잡이 CSS 계약 — .ws-hd 6종이 요소 상자 변에 못박혀 있다', () => {
  const css = read('playground.css');
  const want = [/\.ws-el \.ws-hd\.tl\{[^}]*left:-?[\d.]+px;top:-?[\d.]+px/,
    /\.ws-el \.ws-hd\.tr\{[^}]*right:-?[\d.]+px;top:-?[\d.]+px/,
    /\.ws-el \.ws-hd\.bl\{[^}]*left:-?[\d.]+px;bottom:-?[\d.]+px/,
    /\.ws-el \.ws-hd\.br\{[^}]*right:-?[\d.]+px;bottom:-?[\d.]+px/];
  for (const r of want) if (!r.test(css)) return `손잡이 앵커 계약 이탈: ${r}`;
  if (!/\.ws-el \.ws-hd\.ml,\.ws-el \.ws-hd\.mr\{[^}]*top:50%/.test(css)) return '좌우 손잡이가 상자 중앙에 안 붙음';
  if (!/\.ws-el \.ws-hd\{position:absolute/.test(css)) return '손잡이가 요소 상자 기준이 아님';
  /* 이 앵커 + T5(상자 == 모델) ⇒ 보이는 손잡이 == 모델 모서리 */
  return true;
});

T('T12 focalAt 프레임 — 사진은 boxPx 경유해도 종전 수치 그대로', () => {
  const src = read('screens/workspace.js');
  if (!/L\.boxPx \? L\.boxPx\(el0/.test(src)) return 'focalAt 이 boxPx 를 안 씀';
  if (!/bp\.w, bp\.h, ev\.clientX/.test(src)) return 'framePos 에 모델 프레임 미전달';
  /* 수치 동일성: h 가 있는 종류에서 boxPx == 옛 식 */
  const CW = 560, CH = 315;
  for (const el of [{ kind: 'image', x: 3, y: 4, w: 22, h: 17 }, { kind: 'shape', x: 0, y: 0, w: 9, h: 6 }]) {
    const bp = L.boxPx(el, CW, CH);
    if (!near(bp.w, (el.w || 0) / 100 * CW) || !near(bp.h, (el.h || 0) / 100 * CH)) return `${el.kind} 프레임 수치 변형`;
  }
  return true;
});

console.log(`\nR110: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
