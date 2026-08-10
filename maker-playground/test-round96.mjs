/* ============================================================
   test-round96.mjs — R96 centered-overflow 함정 해제
   ------------------------------------------------------------
   R95 실크롬 계측 중 발견: 1280px 뷰포트에서 캔버스(560px)가
   래퍼(488px)를 넘치는데, justify/align center + overflow:auto
   조합은 넘친 「시작쪽」 조각을 스크롤 원점 앞에 둔다 —
   scrollLeft=0인데 canvas.left < wrap.left. 그 띠는 보이지도
   눌리지도 않아, 좁은 폭·높은 줌에서 캔버스 좌우 끝의 요소와
   리사이즈 핸들이 조용히 죽는다. 워크스페이스·에디터·템플릿
   빌더 세 편집 표면이 같은 패턴이었다.

   처방 = 정석 한 수: 래퍼의 center 정렬 제거, 자식에 margin:auto.
   공간이 남으면 종전과 똑같이 가운데, 넘치면 전 구간이 스크롤로
   닿는다. (미리보기·썸네일의 센터크롭은 의도라 불변.)

   계약 (CSS 문자열 — 기하는 probe96 실크롬 몫):
     ① .ws-canvaswrap에서 center 정렬 소거 + .ws-canvas margin:auto
     ② .ed-canvaswrap 동일 + .ed-canvas margin:auto·flex:none
     ③ .tb-stage 동일 + 자식 margin:auto
     ④ 의도 센터크롭(.lb-card .th 등)은 불변 회귀
     ⑤ 워크스페이스 렌더·제스처 회귀 — R95 하니스 기반 재주행
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R96_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const css = read('playground.css');

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

console.log('--- CSS 계약 ---');
const rule = (sel) => {
  const m = css.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*\\}'));
  return m ? m[0] : '';
};
T('T1 .ws-canvaswrap — center 정렬 소거·overflow:auto 유지', () => {
  const r = rule('.ws-canvaswrap');
  return r && !/justify-content:\s*center/.test(r) && !/align-items:\s*center/.test(r)
    && /overflow:\s*auto/.test(r) ? true : r || '규칙 없음';
});
T('T2 .ws-canvas — margin:auto', () => {
  const r = rule('.ws-canvas');
  return /margin:\s*auto/.test(r) ? true : r;
});
T('T3 .ed-canvaswrap — center 정렬 소거 · .ed-canvas margin:auto + flex:none', () => {
  const a = rule('.ed-canvaswrap'), b = rule('.ed-canvas');
  return a && !/justify-content:\s*center/.test(a) && !/align-items:\s*center/.test(a)
    && /margin:\s*auto/.test(b) && /flex:\s*none/.test(b) ? true : JSON.stringify([a.slice(0, 80), b.slice(0, 80)]);
});
T('T4 .tb-stage — center 정렬 소거 + 자식 margin:auto', () => {
  const a = rule('.tb-stage');
  return a && !/justify-content:\s*center/.test(a) && /\.tb-stage>\*\{margin:auto\}/.test(css)
    ? true : a;
});
T('T5 의도 센터크롭 불변 — .lb-card .th·.an-stagebg 종전 유지', () => {
  return /\.lb-card \.th\{[^}]*justify-content:center/.test(css)
    && /\.an-stagebg\{[^}]*justify-content:center/.test(css) ? true : '의도 크롭이 변형됨';
});

console.log('--- 워크스페이스 회귀 (R95 제스처 재주행) ---');
const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
for (const f of [...read('index.html').matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
T('T6 빌드→선택→br 핸들 리사이즈 실작동 (R95 계약 생존)', () => {
  const H = w.MK_VIDHUB;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = 'r96'; H.st.sub = '';
  const r = H.startBuild([1, 2, 3].map((n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n })));
  if (!r.ok) return r.why;
  for (let g = 0; g < 8 && !w.document.querySelector('.ws-el.media[data-ws-el]'); g++)
    w.document.querySelector('[data-ws="next"]').click();
  const node = w.document.querySelector('.ws-el.media[data-ws-el]');
  if (!node) return '미디어 없음';
  pe('pointerdown', node, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointerup', node, { pointerType: 'touch' });
  const cv = w.document.querySelector('[data-ws-canvas]');
  const sel = w.document.querySelector('.ws-el.media.sel');
  if (!sel) return '선택 실패';
  const hd = sel.querySelector('.ws-hd.br');
  if (!hd) return 'br 핸들 미렌더';
  const wBefore = parseFloat((sel.getAttribute('style').match(/width:([\d.]+)%/) || [])[1]);
  pe('pointerdown', hd, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointermove', cv, { pointerType: 'touch', clientX: 10, clientY: 5 });
  pe('pointerup', cv, { pointerType: 'touch' });
  const after = w.document.querySelector('.ws-el.media[data-ws-el]');
  const wAfter = parseFloat((after.getAttribute('style').match(/width:([\d.]+)%/) || [])[1]);
  return wAfter > wBefore ? true : JSON.stringify({ wBefore, wAfter });
});

console.log(`\n=== R96: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
