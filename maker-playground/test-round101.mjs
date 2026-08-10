/* ============================================================
   test-round101.mjs — R101 사진 보정·필터: 화면과 내보내기가 같은 그림
   ------------------------------------------------------------
   el.filters 는 스키마·SVG 내보내기에 있었지만 UI 도 화면 반영도
   없었다. R101 은 MK_PHOTO 한 곳에 정의를 모아 워크스페이스·재생·
   내보내기 세 경로가 같은 문자열을 쓰게 하고, 이미지 패널에
   사진 바꾸기·필터 8종·보정 슬라이더 4종·원래대로를 연다.

   계약:
     ① MK_PHOTO 순수 — verify + 기본값 미방출 + blur 씬px×배율
     ② 캔버스 실반영 — filters 를 가진 사진의 style.filter 에
        blur 가 표시폭/씬폭 배율로 방출
     ③ 프리셋 칩 — 클릭 = el.filters 커밋 + undo 스택 1 증가
     ④ 슬라이더 세션 — input N번 = snap 1회(히스토리 1건) +
        캔버스 DOM 직갱신, change 후 undo 한 번으로 전체 원복
     ⑤ 원래대로 — filters 삭제 + 버튼 소멸
     ⑥ 사진 바꾸기 — src 만 교체, 위치·크기·초점 보존
     ⑦ 내보내기 — render.js SVG 에 같은 필터(blur 씬px 그대로)
     ⑧ 재생 — MK_PLAY sceneHTML 에 같은 필터
     ⑨ 무보정 침묵 — 캔버스·SVG·재생 어디에도 filter 문자열 0
        (기존 프로젝트 바이트 보존 §23)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R101_ROOT || path.resolve('.');
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

console.log('--- ① MK_PHOTO 순수 계약 ---');
T('T1 모듈 존재 + verify 통과', () => {
  if (!PH) return 'MK_PHOTO 없음';
  const a = PH.verify(); return a.ok ? true : a.violations.join(', ');
});
T('T2 기본값 미방출 — brightness 1·blur 0 은 null, 부분 편집만 생존', () => {
  const a = PH.norm({ brightness: 1, blur: 0 });
  const b = PH.norm({ brightness: 1.2, saturate: 1 });
  return a === null && b && b.brightness === 1.2 && !('saturate' in b) ? true : JSON.stringify([a, b]);
});
T('T3 blur 씬px 정본 — 배율 0.4375(560/1280) 반영, styleOf 무보정 침묵', () => {
  const el = { filters: { blur: 8 } };
  const scaled = PH.css(el, 560 / 1280);
  return scaled === 'blur(3.5px)' && PH.css(el, 1) === 'blur(8px)' && PH.styleOf({}) === '' ? true : scaled;
});

/* 프로젝트를 실제 경로로 만든다 — 영상 허브 startBuild → workspace */
const H = w.MK_VIDHUB;
T('T4 사진 3장 빌드 → workspace 진입 (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '보정'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return /#\/workspace/.test(w.location.hash) || !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
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

console.log('--- ②③ 캔버스 반영 + 프리셋 커밋 ---');
T('T5 이미지 선택 → 패널에 필터 칩 8종·슬라이더 4종·사진 바꾸기', () => {
  if (!gotoMediaScene()) return '사진 장면 이동 실패';
  if (!selectFirstMedia()) return '사진 요소 없음';
  const chips = w.document.querySelectorAll('[data-ws-pfilter]').length;
  const sl = w.document.querySelectorAll('[data-ws-padj]').length;
  const rp = !!w.document.querySelector('[data-ws-preplace]');
  return chips === 8 && sl === 4 && rp ? true : `chips=${chips} sliders=${sl} replace=${rp}`;
});
let el0 = null;
T('T6 프리셋 「선명하게」 클릭 → filters 커밋 + 캔버스 style.filter 방출 + undo 활성', () => {
  const before = undoDepth();
  const chip = w.document.querySelector('[data-ws-pfilter="crisp"]');
  if (!chip) return '칩 없음';
  chip.click();
  el0 = selEl();
  if (!el0 || !el0.filters || el0.filters.contrast !== 1.18) return 'filters=' + JSON.stringify(el0 && el0.filters);
  const media = realMedia() && realMedia().querySelector('.ws-media');
  const f = media && (media.getAttribute('style') || '');
  if (!/filter:[^;]*contrast\(1\.18\)/.test(f)) return '캔버스 미방출: ' + f;
  return !before || undoDepth() ? true : 'undo 비활성';
});
T('T7 프리셋 「원본」 → filters 키 자체 삭제(§23 바이트 보존)', () => {
  const chip = w.document.querySelector('[data-ws-pfilter="original"]');
  chip.click();
  const el = selEl();
  return el && !('filters' in el) ? true : JSON.stringify(el && el.filters);
});

console.log('--- ④ 슬라이더 세션 = 히스토리 1건 ---');
T('T8 input×4 → 캔버스 직갱신 + change → 커밋, undo 1번에 전체 원복', () => {
  selectFirstMedia();
  const s = w.document.querySelector('[data-ws-padj="brightness"]');
  if (!s) return '슬라이더 없음';
  const media = () => realMedia().querySelector('.ws-media');
  [1.1, 1.2, 1.3, 1.4].forEach((v) => { s.value = String(v); s.dispatchEvent(new w.Event('input', { bubbles: true })); });
  if (!/brightness\(1\.4\)/.test(media().style.filter || '')) return '직갱신 실패: ' + media().style.filter;
  s.dispatchEvent(new w.Event('change', { bubbles: true }));
  let el = selEl();
  if (!el.filters || el.filters.brightness !== 1.4) return '커밋 실패: ' + JSON.stringify(el.filters);
  const ub = undoBtn(); ub.click();                    /* 세션 = 1건 → 한 번에 원복 */
  selectFirstMedia();
  el = selEl();
  return !el.filters || el.filters.brightness == null ? true : 'undo 1회 원복 실패: ' + JSON.stringify(el.filters);
});

console.log('--- ⑤⑥ 원래대로 + 사진 바꾸기 ---');
T('T9 보정 후 「원래대로」 → filters 삭제 + 버튼 소멸', () => {
  selectFirstMedia();
  w.document.querySelector('[data-ws-pfilter="vintage"]').click();
  const rz = w.document.querySelector('[data-ws-preset0]');
  if (!rz) return '원래대로 버튼 없음';
  rz.click();
  const el = selEl();
  const gone = !w.document.querySelector('[data-ws-preset0]');
  return el && !('filters' in el) && gone ? true : JSON.stringify({ f: el && el.filters, gone });
});
T('T10 사진 바꾸기 — src 만 교체, x·y·w·h·초점 보존', () => {
  selectFirstMedia();
  const el = selEl();
  w.MK_FOCAL.set(el, 1, 0);                            /* 초점을 심어 보존 검증 */
  const keep = { x: el.x, y: el.y, w: el.w, h: el.h };
  const origCreate = w.document.createElement.bind(w.document);
  let cap = null;
  w.document.createElement = (tag) => { const n = origCreate(tag); if (tag === 'input') cap = n; return n; };
  const origF2S = w.MK_LIVE.fileToSrc;
  w.MK_LIVE.fileToSrc = (file, cb) => cb('data:image/png;base64,NEW', null);
  w.document.querySelector('[data-ws-preplace]').click();
  w.document.createElement = origCreate;
  if (!cap) { w.MK_LIVE.fileToSrc = origF2S; return 'file input 미생성'; }
  Object.defineProperty(cap, 'files', { value: [{ name: '새사진.png' }] });
  cap.onchange();
  w.MK_LIVE.fileToSrc = origF2S;
  const el2 = el; /* 같은 문서 요소 — 제자리 교체 검증 */
  const ok = el2.src === 'data:image/png;base64,NEW' && el2.label === '새사진' &&
    el2.x === keep.x && el2.y === keep.y && el2.w === keep.w && el2.h === keep.h &&
    el2.focal && el2.focal.x === 1;
  return ok ? true : JSON.stringify({ src: el2.src.slice(0, 30), label: el2.label, focal: el2.focal });
});

console.log('--- ⑦⑧⑨ 내보내기·재생 일치 + 무보정 침묵 ---');
T('T11 내보내기 SVG — 확장 키(sepia) 포함 같은 필터, blur 는 씬px 그대로', () => {
  const sc = { name: 't', width: 1280, height: 720, background: '#fff',
    elements: [{ kind: 'image', x: 5, y: 5, w: 50, h: 50, src: 'data:image/png;base64,Q', filters: { contrast: 1.18, saturate: 1.16, sepia: 0.28, blur: 8 } }] };
  const svg = w.MK_RENDER.toSVG(w.MK_RENDER.renderScene(sc));
  return /filter:contrast\(1\.18\) saturate\(1\.16\) sepia\(0\.28\) blur\(8px\)/.test(svg) ? true : (svg.match(/filter:[^"]*/) || ['필터 없음'])[0];
});
T('T12 재생 — MK_PLAY sceneHTML 에 같은 필터', () => {
  const h = w.MK_PLAY.sceneHTML({ duration: 3, elements: [{ kind: 'image', x: 0, y: 0, w: 100, h: 100, src: 'data:image/png;base64,Q', filters: { grayscale: 1, contrast: 1.05 } }] });
  return /filter:contrast\(1\.05\) grayscale\(1\)/.test(h) ? true : (h.match(/filter:[^;"]*/) || ['필터 없음'])[0];
});
T('T13 무보정 침묵 — 캔버스·SVG·재생 어디에도 filter 문자열 0', () => {
  const el = { kind: 'image', x: 0, y: 0, w: 50, h: 50, src: 'data:image/png;base64,Q' };
  const svg = w.MK_RENDER.toSVG(w.MK_RENDER.renderScene({ name: 't', width: 1280, height: 720, background: '#fff', elements: [el] }));
  const ply = w.MK_PLAY.sceneHTML({ duration: 3, elements: [el] });
  selectFirstMedia();
  w.document.querySelector('[data-ws-pfilter="original"]').click();
  const media = realMedia().querySelector('.ws-media');
  const cs = media.getAttribute('style') || '';
  const bad = [/filter:/.test(svg) && 'svg', /filter:/.test(ply) && 'play', /filter:/.test(cs) && 'canvas'].filter(Boolean);
  return bad.length === 0 ? true : bad.join(',');
});

console.log(`\nR101: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
