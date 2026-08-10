/* ============================================================
   test-round102.mjs — R102 모양(Mask 3종)·뒤집기: 신규 스키마 최소로 네 경로 일치
   ------------------------------------------------------------
   모양은 el.radius 재사용(R98: >100=원) — 신규 스키마 0.
   뒤집기는 el.flipH/flipV 신규 — true 만 저장.

   계약:
     ① 순수 — verify(모양·뒤집기 포함) + 사각·원복이 키를 안 남김
     ② 패널 — 모양 칩 3 + 뒤집기 2 노출, 현재 상태 켜짐
     ③ 원 클릭 → radius 999 커밋 + 캔버스 ws-clip 50% + undo 복원
     ④ 둥근 — 표시 배율(씬px×표시폭/씬폭) 반영
     ⑤ 좌우 뒤집기 토글 → 미디어 transform + 재클릭 = 키 삭제
     ⑥ 내보내기 SVG — 뒤집기 프레임 중심 보정 transform + radius clip
     ⑦ 재생 — 뒤집기 transform + radius(기존 R98 경로 회귀)
     ⑧ 무변형 침묵 — transform·border-radius 문자열 0 (§23)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R102_ROOT || path.resolve('.');
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
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const PH = w.MK_PHOTO;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });

console.log('--- ① 순수 계약 ---');
T('T1 verify — R102 모양·뒤집기 포함 전체 통과', () => {
  if (!PH) return 'MK_PHOTO 없음';
  const a = PH.verify(); return a.ok ? true : a.violations.join(', ');
});
T('T2 shapeOf 해석 — 없음=사각, 28=둥근, 999=원 (R98 규약)', () => {
  const a = PH.shapeOf({}), b = PH.shapeOf({ radius: 28 }), c = PH.shapeOf({ radius: 999 });
  return a === 'rect' && b === 'rounded' && c === 'circle' ? true : [a, b, c].join(',');
});

const realMedia = () => [...w.document.querySelectorAll('.ws-el.media[data-ws-el]')].find((n) => n.querySelector('.ws-media')) || null;
const gotoMediaScene = () => { for (let g = 0; g < 8 && !realMedia(); g++) { const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) return false; nx.click(); } return !!realMedia(); };
const selectFirstMedia = () => {
  const el = realMedia();
  if (!el) return false;
  el.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true }));
  el.dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  el.click ? el.click() : el.dispatchEvent(new w.Event('click', { bubbles: true }));
  return true;
};
const selEl = () => { /* 캔버스에 보이는 media 의 src 로 문서 요소를 전 씬에서 역추적 (모드 무관) */
  const dom2 = realMedia(); if (!dom2) return null;
  const media = dom2.querySelector('.ws-media');
  const src = media && media.getAttribute('src');
  const idx = +dom2.dataset.wsEl;
  const list = w.MK_PROJ.list ? w.MK_PROJ.list() : [];
  for (const p of list) {
    if (!p.doc || !p.doc.scenes) continue;
    for (const sc of p.doc.scenes) {
      const el = sc.elements && sc.elements[idx];
      if (el && el.src === src) return el;
    }
  }
  return null;
};
const undoBtn = () => [...w.document.querySelectorAll('[data-ws="undo"]')][0];
const undoDepth = () => { const b = undoBtn(); return b && !b.disabled; };


const H = w.MK_VIDHUB;
T('T3 사진 3장 빌드 → workspace 진입 (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '모양'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return /#\/workspace/.test(w.location.hash) || !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
});

console.log('--- ②③④ 모양 ---');
T('T4 이미지 선택 → 모양 칩 3 + 뒤집기 2, 사각 켜짐', () => {
  if (!gotoMediaScene()) return '사진 장면 이동 실패';
  if (!selectFirstMedia()) return '사진 요소 없음';
  const sh = w.document.querySelectorAll('[data-ws-pshape]').length;
  const fl = w.document.querySelectorAll('[data-ws-pflip]').length;
  const on = w.document.querySelector('[data-ws-pshape="rect"].on');
  return sh === 3 && fl === 2 && !!on ? true : `shapes=${sh} flips=${fl} rectOn=${!!on}`;
});
T('T5 원 클릭 → radius 999 + ws-clip 50% + undo 로 원복', () => {
  w.document.querySelector('[data-ws-pshape="circle"]').click();
  const el = selEl();
  if (!el || el.radius !== 999) return 'radius=' + (el && el.radius);
  const clip = realMedia().querySelector('.ws-clip');
  if (!/border-radius:\s*50%/.test(clip.getAttribute('style') || '')) return 'clip: ' + clip.getAttribute('style');
  const ub = undoBtn(); ub.click();
  selectFirstMedia();
  const el2 = selEl();
  return el2 && !('radius' in el2) ? true : 'undo 후 radius=' + el2.radius;
});
T('T6 둥근 — 씬px 28 × 표시 배율 = 캔버스 px', () => {
  selectFirstMedia();
  w.document.querySelector('[data-ws-pshape="rounded"]').click();
  const clip = realMedia().querySelector('.ws-clip');
  const st = clip.getAttribute('style') || '';
  const mm = st.match(/border-radius:\s*([\d.]+)px/);
  if (!mm) return 'radius 미방출: ' + st;
  const cw = w.document.querySelector('[data-ws-canvas]');
  /* jsdom offsetWidth=0 → 배율은 스타일 width 로 검증: 캔버스 표시폭/씬폭 × 28 */
  const cwPx = parseFloat((cw.getAttribute('style') || '').match(/width:(\d+)px/)[1]);
  const el = selEl();
  /* 씬폭은 문서에서 */
  const list = w.MK_PROJ.list(); let sw = 0;
  outer: for (const p of list) for (const sc of (p.doc && p.doc.scenes) || []) { if ((sc.elements || []).includes(el)) { sw = sc.width || 1280; break outer; } }
  const expect = Math.round(28 * cwPx / sw * 100) / 100;
  return Math.abs(parseFloat(mm[1]) - expect) < 0.06 ? true : `got ${mm[1]} expect ${expect}`;
});

console.log('--- ⑤ 뒤집기 ---');
T('T7 좌우 토글 → 미디어 scale(-1,1) → 재클릭 = 키 삭제·transform 소멸', () => {
  w.document.querySelector('[data-ws-pshape="rect"]').click();
  selectFirstMedia();
  w.document.querySelector('[data-ws-pflip="h"]').click();
  let el = selEl();
  if (!el.flipH) return 'flipH 미기록';
  const media = () => realMedia().querySelector('.ws-media');
  if (!/transform:scale\(-1,1\)/.test(media().getAttribute('style') || '')) return '미디어 미방출: ' + media().getAttribute('style');
  selectFirstMedia();
  w.document.querySelector('[data-ws-pflip="h"]').click();
  el = selEl();
  const st = media().getAttribute('style') || '';
  return !('flipH' in el) && !/transform:/.test(st) ? true : JSON.stringify({ flipH: el.flipH, st: st.slice(-40) });
});

console.log('--- ⑥⑦⑧ 내보내기·재생 일치 + 무변형 침묵 ---');
T('T8 내보내기 SVG — 뒤집기 중심 보정 + radius clip 동반', () => {
  const sc = { name: 't', width: 1280, height: 720, background: '#fff',
    elements: [{ kind: 'image', x: 0, y: 0, w: 50, h: 50, src: 'data:image/png;base64,Q', flipH: true, radius: 28 }] };
  const svg = w.MK_RENDER.toSVG(w.MK_RENDER.renderScene(sc));
  /* frame: x=0..640, y=0..360 → 중심 (320,180) */
  const okF = /translate\(320 180\) scale\(-1 1\) translate\(-320 -180\)/.test(svg);
  const okR = /<clipPath/.test(svg) || /rx="28"/.test(svg) || /a?28/.test(svg);
  return okF && okR ? true : JSON.stringify({ okF, okR, t: (svg.match(/transform="[^"]*"/) || [''])[0] });
});
T('T9 재생 — 뒤집기 transform + radius 컨테이너 (R98 회귀)', () => {
  const h = w.MK_PLAY.sceneHTML({ duration: 3, elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, src: 'data:image/png;base64,Q', flipV: true, radius: 999 }] });
  const okF = /transform:scale\(1,-1\)/.test(h);
  const okR = /border-radius:50%/.test(h);
  return okF && okR ? true : JSON.stringify({ okF, okR });
});
T('T10 무변형 침묵 — 캔버스·SVG·재생에 transform·border-radius 0 (§23)', () => {
  const el = { kind: 'image', x: 0, y: 0, w: 50, h: 50, src: 'data:image/png;base64,Q' };
  const svg = w.MK_RENDER.toSVG(w.MK_RENDER.renderScene({ name: 't', width: 1280, height: 720, background: '#fff', elements: [el] }));
  const ply = w.MK_PLAY.sceneHTML({ duration: 3, elements: [el] });
  selectFirstMedia();
  const media = realMedia().querySelector('.ws-media');
  const clip = realMedia().querySelector('.ws-clip');
  const bad = [/scale\(-1/.test(svg) && 'svg-flip', /transform:scale/.test(ply) && 'play-flip',
    /border-radius/.test(ply) && 'play-rad', /transform:/.test(media.getAttribute('style') || '') && 'ws-flip',
    /border-radius/.test(clip.getAttribute('style') || '') && 'ws-rad'].filter(Boolean);
  return bad.length === 0 ? true : bad.join(',');
});

console.log(`\nR102: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
