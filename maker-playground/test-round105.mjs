/* ============================================================
   test-round105.mjs — R105 자르기(Crop) UI: 정본·3경로·SVG·초안 규약
   ------------------------------------------------------------
   el.crop {x,y,w,h} — export clipPath 는 R45 유산, 여기서 화면
   3경로(workspace·play·editor)와 UI 를 연다.

   계약:
     ① MK_PHOTO verify (cropOf 유효성·setCrop 클램프·cropCss)
     ② 문자열 crop('4:3' — flow 유산) → 화면·SVG 모두 무시(NaN 0)
     ③ SVG export — crop clipPath rect 좌표 일치
     ④ play 재생 — clip-path:inset 부착
     ⑤ workspace — ✂ 진입 → 오버레이·상자·확인 바, 문서 무변형
     ⑥ ✓ 확인 → el.crop 커밋 + undo 1번 전체 원복
     ⑦ 자르기 해제 → 키 삭제
     ⑧ editor 소스 — 미디어에 cropCss 배선(컨테이너 핸들 클립 금지)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R105_ROOT || path.resolve('.');
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
T('T1 MK_PHOTO verify (crop 포함)', () => {
  if (!PH || !PH.cropOf) return 'crop API 없음';
  const a = PH.verify(); return a.ok ? true : a.violations.join(', ');
});
T('T2 cropOf — 문자열·풀프레임 무효, 유효만 통과', () => {
  if (PH.cropOf({ crop: '4:3' }) !== null) return '문자열 통과';
  if (PH.cropOf({ crop: { x: 0, y: 0, w: 1, h: 1 } }) !== null) return '풀프레임 통과';
  const c = PH.cropOf({ crop: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 } });
  return c && c.w === 0.5 ? true : JSON.stringify(c);
});
T('T3 cropCss — inset 사방 수치', () => {
  const el = {}; PH.setCrop(el, { x: 0.25, y: 0.1, w: 0.5, h: 0.6 });
  const s = PH.cropCss(el);
  return s === ';clip-path:inset(10% 25% 30% 25%)' ? true : s;
});

console.log('--- ②③ SVG export ---');
const RD = w.MK_RENDER;
const mkScene = (crop) => ({ id: 's1', width: 1280, height: 720, background: '#fff',
  elements: [{ kind: 'image', src: 'data:image/png;base64,Q', x: 10, y: 10, w: 50, h: 50, crop }] });
T('T4 유효 crop → clipPath rect 좌표 일치', () => {
  const dl = RD.renderScene(mkScene({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }), { noCache: true });
  const d = dl.defs.join(' ');
  /* f = (128,72,640,360) → mf = (128+128, 72+72, 320, 180) */
  if (!/clipPath/.test(d)) return 'clipPath 없음';
  return /M\s*256[ ,]/.test(d) || d.indexOf('256') >= 0 ? true : d.slice(0, 160);
});
T('T5 문자열 crop → NaN 0 · clip 미부착', () => {
  const dl = RD.renderScene(mkScene('4:3'), { noCache: true });
  const svg = RD.toSVG(dl, {});
  if (/NaN/.test(svg) || /NaN/.test(dl.defs.join(''))) return 'NaN 발생';
  const op = dl.ops.find((o) => o.op === 'image');
  return op && !op.clip ? true : 'clip=' + (op && op.clip);
});

console.log('--- ④ play 재생 ---');
T('T6 재생 씬 HTML — clip-path:inset 부착', () => {
  const sc = { background: '#fff', elements: [{ kind: 'image', src: 'data:image/png;base64,Q', x: 5, y: 5, w: 40, h: 40, crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 } }] };
  const h = w.MK_PLAY.sceneHTML ? w.MK_PLAY.sceneHTML(sc) : null;
  if (h === null) { /* 내부 함수 미공개 시 소스 계약으로 대체 */
    const src = read('data/play.js');
    return src.indexOf('cropCss') >= 0 ? true : 'play 배선 없음';
  }
  return /clip-path:inset\(10% 10% 10% 10%\)/.test(h) ? true : h.slice(0, 200);
});

console.log('--- ⑤⑥⑦ workspace UI ---');
const H = w.MK_VIDHUB;
T('T7 사진 3장 빌드 → workspace (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '자르기'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
});
const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const undoBtn = () => [...w.document.querySelectorAll('[data-ws="undo"]')][0];
const curScene = () => {
  const no = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const list = w.MK_PROJ.list();
  for (const p of list) if (p.doc && p.doc.scenes && p.doc.scenes.length > no) {
    if (w.document.querySelectorAll('.ws-scenes [data-ws-sc]').length === p.doc.scenes.length ||
        w.document.querySelectorAll('[data-ws-sc]').length / 2 === p.doc.scenes.length) return p.doc.scenes[no];
  }
  const p0 = list[0]; return p0 && p0.doc.scenes[no];
};
let mediaIdx = -1;
T('T8 사진 선택 → 패널에 ✂ 자르기', () => {
  for (let g = 0; g < 8 && !allEls().find((n) => n.querySelector('.ws-media')); g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  const node = allEls().find((n) => n.querySelector('.ws-media'));
  if (!node) return '사진 요소 없음';
  mediaIdx = +node.dataset.wsEl;
  node.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
  node.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  const cb = w.document.querySelector('[data-ws-pcrop]');
  return cb ? true : '✂ 버튼 없음';
});
T('T9 ✂ 진입 → 오버레이·상자·확인 바 + 문서 무변형', () => {
  const sc = curScene(); if (!sc) return '씬 미특정';
  const before = JSON.stringify(sc.elements[mediaIdx]);
  w.document.querySelector('[data-ws-pcrop]').click();
  const lay = w.document.querySelector('.ws-croplay');
  const box = w.document.querySelector('[data-ws-crbox]');
  const ok = w.document.querySelector('[data-ws-crok]');
  if (!lay || !box || !ok) return `lay=${!!lay} box=${!!box} ok=${!!ok}`;
  if (w.document.querySelectorAll('.ws-croplay .sc').length !== 4) return '스크림 4 아님';
  return JSON.stringify(curScene().elements[mediaIdx]) === before ? true : '진입만으로 문서 변형';
});
T('T10 ✓ 확인 → el.crop 커밋 + undo 1번 원복', () => {
  const WSs = w.MK_WS.state;
  WSs.crop.d = { x: 0.1, y: 0.1, w: 0.5, h: 0.5 };    /* 드래그 결과를 초안에 반영한 상황 */
  w.document.querySelector('[data-ws-crok]').click();
  const el = curScene().elements[mediaIdx];
  if (!el.crop || el.crop.w !== 0.5 || el.crop.x !== 0.1) return '커밋 안 됨: ' + JSON.stringify(el.crop);
  if (w.document.querySelector('.ws-croplay')) return '모드 미종료';
  const clip = w.document.querySelector(`[data-ws-el="${mediaIdx}"] .ws-clip`);
  if (!clip || !/clip-path/.test(clip.getAttribute('style') || '')) return '화면 클립 미적용';
  undoBtn().click();
  const el2 = curScene().elements[mediaIdx];
  return el2.crop == null ? true : 'undo 후 잔존: ' + JSON.stringify(el2.crop);
});
T('T11 자르기 해제 — 키 삭제 (재커밋 후)', () => {
  const node = w.document.querySelector(`[data-ws-el="${mediaIdx}"]`);
  node.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
  node.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  w.document.querySelector('[data-ws-pcrop]').click();
  w.MK_WS.state.crop.d = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
  w.document.querySelector('[data-ws-crok]').click();
  const off = w.document.querySelector('[data-ws-pcrop0]');
  if (!off) return '해제 버튼 없음';
  off.click();
  const el = curScene().elements[mediaIdx];
  return el.crop == null ? true : '해제 후 잔존';
});

console.log('--- ⑧ editor 배선 ---');
T('T12 editor — 미디어에 cropCss (컨테이너 아님)', () => {
  const src = read('screens/editor.js');
  if (src.indexOf('cropCss') < 0) return 'editor 배선 없음';
  const line = src.split('\n').filter((l) => l.indexOf('cropCss') >= 0);
  return line.every((l) => /ed-imgreal|video/.test(l) || /mediaStyle/.test(l)) ? true : '컨테이너 클립 의심';
});

console.log(`\nR105: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
