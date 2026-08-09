/* ============================================================
   test-round95.mjs — R95 터치 리사이즈: 손가락이 핸들을 잡는다
   ------------------------------------------------------------
   준호 실기기(태블릿): 사진 크기 조절이 안 된다. 해부 —
   리사이즈 수학(MK_LIVE.resizeTo)은 멀쩡했고, 죽은 건 입구였다:
   시각 핸들이 8×8px(±4px 오프셋)라 손가락(~40px 접촉면)이 핸들을
   못 짚고 요소 본체에 닿아 「이동」으로 판정된다. 게다가 비율
   고정이 shift 전용 — 터치엔 shift가 없어 어렵게 잡아도 사진이
   일그러진다.

   처방 3층:
     A. CSS — 핸들 touch-action:none + ::after 34px 히트 패드,
        pointer:coarse에선 시각 핸들 자체 확대(모서리 14px·변 8×24)
     B. 근접 폴백 — 터치·펜이 「이미 선택된」 요소의 핸들 22px 안을
        짚으면 핸들 미명중이어도 리사이즈 (MK_LIVE.handleAt 순수 판정,
        rect 폭 0이면 판정 안 함 — jsdom·미배치 안전)
     C. 비율 기본값 — 사진·영상 모서리 리사이즈는 기본 비율 고정,
        shift = 자유 (MK_LIVE.aspectDefault). 이 부류 도구의 표준.

   계약:
     ① handleAt — 각 핸들 근접 판정·반경 밖 null·rect 0 null·최근접 선택
     ② aspectDefault — 미디어 모서리 반전·변/비미디어 종전 유지
     ③ CSS — 히트 패드·coarse 블록·touch-action 존재
     ④ 제스처 통합(jsdom) — 핸들 pointerdown → 리사이즈 실작동·undo 적재
     ⑤ 미디어 모서리 드래그가 shift 없이 비율 유지 (resizeTo 합성 검증)
     ⑥ 마우스 세계 회귀 — pointerType mouse + 본체 짚기 = 종전대로 이동
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R95_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const L = w.MK_LIVE;
const css = read('playground.css');
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });

console.log('--- ① handleAt 순수 ---');
const RC = { left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100 };
T('T1 각 핸들 근접 판정 — 6핸들 전부 자기 자리', () => {
  if (!L.handleAt) return 'handleAt 없음';
  const want = { tl: [104, 96], tr: [296, 105], bl: [98, 198], br: [305, 205], ml: [95, 150], mr: [304, 148] };
  for (const k in want) {
    const got = L.handleAt(RC, want[k][0], want[k][1]);
    if (got !== k) return `${k} 자리에서 ${got}`;
  }
  return true;
});
T('T2 반경 밖(중앙·먼 곳) = null · 반경 인자 존중', () => {
  const a = L.handleAt(RC, 200, 150);          /* 정중앙 */
  const b = L.handleAt(RC, 100, 60);           /* tl 위 40px */
  const c = L.handleAt(RC, 100, 60, 45);       /* 반경 45면 잡힘 */
  return a === null && b === null && c === 'tl' ? true : JSON.stringify([a, b, c]);
});
T('T3 rect 폭 0(jsdom·미배치) = 판정 안 함', () => {
  const z = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  return L.handleAt(z, 0, 0) === null ? true : '0-rect에서 판정함';
});
T('T4 경합 시 최근접 — tl 6px vs ml 44px', () => {
  return L.handleAt(RC, 106, 100) === 'tl' ? true : L.handleAt(RC, 106, 100);
});

console.log('--- ② aspectDefault 순수 ---');
T('T5 미디어 모서리 = shift 반전 · 변 = 종전 · 비미디어 = 종전', () => {
  if (!L.aspectDefault) return 'aspectDefault 없음';
  const m = { src: 'x' }, t = { kind: 'text' };
  const rows = [
    [L.aspectDefault(m, 'br', false), true], [L.aspectDefault(m, 'br', true), false],
    [L.aspectDefault(m, 'mr', false), false], [L.aspectDefault(m, 'mr', true), true],
    [L.aspectDefault(t, 'br', false), false], [L.aspectDefault(t, 'br', true), true],
    [L.aspectDefault(null, 'br', true), true],
  ];
  const bad = rows.findIndex(([g, e]) => g !== e);
  return bad === -1 ? true : '행 ' + bad + ' 불일치';
});

console.log('--- ③ CSS 계약 ---');
T('T6 히트 패드 34px + 핸들 touch-action:none', () => {
  return /\.ws-el \.ws-hd\{touch-action:none\}/.test(css)
    && /\.ws-el \.ws-hd::after\{[^}]*width:34px;height:34px/.test(css) ? true : 'CSS 미존재';
});
T('T7 pointer:coarse — 모서리 14px·변 8×24 확대 블록', () => {
  const blk = css.split('@media (pointer:coarse)')[1] || '';
  return /width:14px;height:14px/.test(blk) && /width:8px;height:24px/.test(blk) ? true : blk.slice(0, 120) || '블록 없음';
});

console.log('--- ④~⑥ 제스처 통합 ---');
const H = w.MK_VIDHUB;
let ready = false;
T('T8 사진 빌드 → 미디어 장면 진입 (기반)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '크기'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  for (let g = 0; g < 8 && !w.document.querySelector('.ws-el.media[data-ws-el]'); g++) {
    const nx = w.document.querySelector('[data-ws="next"]');
    if (!nx) return '다음 버튼 없음'; nx.click();
  }
  ready = !!w.document.querySelector('.ws-el.media[data-ws-el]');
  return ready ? true : '.ws-el.media 없음';
});
const curScene = () => {
  const d = w.MK_PROJ.get(w.location.hash.match(/#\/workspace\/?([^/]*)/) ? undefined : undefined);
  return null;
};
const elGeo = () => {
  const n = w.document.querySelector('.ws-el.media[data-ws-el]');
  return n ? { i: +n.dataset.wsEl, style: n.getAttribute('style') } : null;
};
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
T('T9 br 핸들 pointerdown→move→up = 리사이즈 실작동 + undo 적재', () => {
  if (!ready) return '기반 미충족';
  const node = w.document.querySelector('.ws-el.media[data-ws-el]');
  /* 선택 → 핸들 렌더 (R()가 캔버스를 갈아끼우므로 cv는 이 뒤에 잡는다) */
  pe('pointerdown', node, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointerup', node, { pointerType: 'touch' });
  const cv = w.document.querySelector('[data-ws-canvas]');
  const undoBefore = (w.MK_WS && w.MK_WS.undoDepth) ? w.MK_WS.undoDepth() : null;
  const sel = w.document.querySelector('.ws-el.media.sel');
  if (!sel) return '선택 실패';
  const hd = sel.querySelector('.ws-hd.br');
  if (!hd) return 'br 핸들 미렌더';
  const before = sel.getAttribute('style');
  const wBefore = parseFloat((before.match(/width:([\d.]+)%/) || [])[1]);
  pe('pointerdown', hd, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointermove', cv, { pointerType: 'touch', clientX: 10, clientY: 5 });   /* rect 0 → ||1 → 1000%/500% 요구 → 클램프 */
  pe('pointerup', cv, { pointerType: 'touch' });
  const after = w.document.querySelector('.ws-el.media.sel') || w.document.querySelector(`[data-ws-el]`);
  const st = after.getAttribute('style');
  const wAfter = parseFloat((st.match(/width:([\d.]+)%/) || [])[1]);
  return wAfter > wBefore ? true : JSON.stringify({ before, st });
});
T('T10 미디어 모서리 = shift 없이 비율 유지 (resizeTo 합성)', () => {
  const el = { kind: 'image', src: 'x', x: 10, y: 10, w: 20, h: 10 };
  L.resizeTo(el, 'br', { x: 10, y: 10, w: 20, h: 10 }, 10, 3,
    { aspect: L.aspectDefault(el, 'br', false) });
  return el.w === 30 && el.h === 15 ? true : JSON.stringify(el);
});
T('T11 마우스 세계 회귀 — 본체 짚기 = 이동(근접 폴백 미발동 경로)', () => {
  /* pointerType mouse + 본체: handleAt 경로를 타지 않아야 한다.
     jsdom rect 0이라 폴백 자체가 T3로 봉인 — 여기선 소스 계약을 본다. */
  const src = read('screens/workspace.js');
  return /pointerType && ev\.pointerType !== 'mouse'/.test(src)
    && /wasSel/.test(src) ? true : '폴백 가드 미존재';
});
T('T12 근접 폴백은 「이미 선택된」 요소에서만 (첫 탭 = 선택 계약)', () => {
  const src = read('screens/workspace.js');
  const m = src.match(/if \(!handle && wasSel[^)]*\)/);
  return m ? true : '선행선택 가드 미존재';
});

console.log(`\n=== R95: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
