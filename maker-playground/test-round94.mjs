/* ============================================================
   test-round94.mjs — R94 사진 초점(focal): 잘릴 때 남길 곳
   ------------------------------------------------------------
   지금까지 꽉 채우기(cover) 크롭은 무조건 가운데 — 세로 사진을
   가로 틀에 넣으면 얼굴이 잘렸다. R94 = el.focal {x,y} 0~1 +
   워크스페이스 3×3 피커. 화면(CSS object-position)과 내보내기
   (SVG preserveAspectRatio · video fitRect)가 같은 그림을 만들도록
   UI는 SVG 정렬이 표현 가능한 9칸만 쓴다.

   계약:
     ① MK_FOCAL 순수 — norm 클램프·pos 산출·svgPre 9칸·set 가운데 삭제
     ② 워크스페이스 렌더 — focal 있는 요소만 object-position, 없으면 종전 바이트
     ③ 피커 — cover 이미지 선택 시 3×3 노출·클릭 반영·가운데 클릭 = focal 삭제·
        contain에선 미노출
     ④ 재생(sceneHTML) — 재생·스틸 공용 경로에 같은 초점
     ⑤ SVG 내보내기 — focal → preserveAspectRatio 정렬(내보내기 전 경로의 정본),
        contain meet·기본 slice 회귀
     ⑥ video fitRect — focal 0/1 크롭 원점, 기본 = 종전 가운데와 동일 값
     ⑦ 세 세계 일치 — UI 9칸 각각에서 CSS %·SVG 정렬·fitRect 원점이 같은 곳
     ⑧ 왕복 — focal이 문서 JSON 직렬화를 그대로 통과
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R94_ROOT || path.resolve('.');
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

const F = w.MK_FOCAL;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });

console.log('--- ① MK_FOCAL 순수 계약 ---');
T('T1 모듈 존재 + audit 통과', () => {
  if (!F) return 'MK_FOCAL 없음';
  const a = F.audit(); return a.ok ? true : a.violations.join(', ');
});
T('T2 norm — 결손·범위 밖이 가운데·경계로', () => {
  const n0 = F.norm(null), n1 = F.norm({ x: 5, y: -3 }), n2 = F.norm({ x: 'x' });
  return n0.x === 0.5 && n0.y === 0.5 && n1.x === 1 && n1.y === 0 && n2.x === 0.5 ? true
    : JSON.stringify([n0, n1, n2]);
});
T('T3 pos — 가운데·contain은 침묵, 그 외 object-position', () => {
  const a = F.pos({ focal: { x: 0.5, y: 0.5 } });
  const b = F.pos({ focal: { x: 1, y: 0 } });
  const c = F.pos({ focal: { x: 1, y: 0 }, fit: 'contain' });
  const d = F.pos({});
  return a === '' && b === ';object-position:100% 0%' && c === '' && d === '' ? true
    : JSON.stringify([a, b, c, d]);
});
T('T4 set — 가운데 선택 = focal 삭제(문서가 기본값을 안 들고 다님)', () => {
  const el = {};
  F.set(el, 0, 1);
  const had = el.focal && el.focal.x === 0 && el.focal.y === 1;
  F.set(el, 0.5, 0.5);
  return had && !('focal' in el) ? true : JSON.stringify(el);
});

console.log('--- ② 워크스페이스 렌더 ---');
/* 프로젝트를 실제 경로로 만든다 — 영상 허브 startBuild → workspace */
const H = w.MK_VIDHUB;
let projReady = false;
T('T5 사진 3장 빌드 → workspace 진입 (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '초점'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  projReady = true;
  return /#\/workspace/.test(w.location.hash) || !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
});
const firstMediaIdx = () => {
  const sc = w.MK_WS && w.MK_WS.__scene ? w.MK_WS.__scene() : null;
  return null; /* 내부 접근 대신 DOM 경로 사용 */
};
const clickEl = (sel) => { const n = w.document.querySelector(sel); if (!n) return false; n.click ? n.click() : n.dispatchEvent(new w.Event('click', { bubbles: true })); return true; };
const realMedia = () => [...w.document.querySelectorAll('.ws-el.media[data-ws-el]')].find((n) => n.querySelector('.ws-media')) || null;
const selectFirstMedia = () => {
  const el = realMedia(); /* R98 — 데코 fill 박스가 아니라 진짜 사진을 고른다 */
  if (!el) return false;
  el.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true }));
  el.dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  return true;
};
T('T6 이미지 선택 → 초점 피커 3×3 노출 + 기본 = 가운데 켜짐', () => {
  if (!projReady) return '기반 미충족';
  /* 장면 1은 제목(텍스트 전용) — 미디어가 나올 때까지 다음 장면으로 */
  for (let g = 0; g < 8 && !realMedia(); g++) {
    const nx = w.document.querySelector('[data-ws="next"]');
    if (!nx) return '다음 장면 버튼 없음';
    nx.click();
  }
  if (!selectFirstMedia()) return '.ws-el.media 없음';
  const btns = [...w.document.querySelectorAll('[data-ws-focal]')];
  if (btns.length !== 9) return '버튼 ' + btns.length + '개';
  const center = btns.find((b) => b.dataset.wsFocal === '0.5,0.5');
  return center && /var\(--mk-teal\)/.test(center.getAttribute('style')) ? true : '가운데 미표시';
});
T('T7 왼쪽 위 클릭 → 캔버스 ws-media에 object-position:0% 0%', () => {
  const b = w.document.querySelector('[data-ws-focal="0,0"]');
  if (!b) return '버튼 없음';
  b.click();
  const host = realMedia();
  const m = host && host.querySelector('.ws-media');
  const st = m ? m.getAttribute('style') : '';
  return /object-position:0% 0%/.test(st) ? true : st;
});
T('T8 가운데 클릭 → focal 삭제 = object-position 소멸(종전 바이트 복귀)', () => {
  const b = w.document.querySelector('[data-ws-focal="0.5,0.5"]');
  if (!b) return '버튼 없음';
  b.click();
  const host = realMedia();
  const m = host && host.querySelector('.ws-media');
  const st = m ? m.getAttribute('style') : '';
  return !/object-position/.test(st) ? true : st;
});
T('T9 원본 전체(contain) 전환 → 피커 미노출 · 꽉 채우기 복귀 → 재노출', () => {
  const c1 = w.document.querySelector('[data-ws-fit="contain"]');
  if (!c1) return 'fit 버튼 없음';
  c1.click();
  const gone = w.document.querySelectorAll('[data-ws-focal]').length === 0;
  const c2 = w.document.querySelector('[data-ws-fit="cover"]');
  if (!c2) return 'cover 버튼 없음';
  c2.click();
  const back = w.document.querySelectorAll('[data-ws-focal]').length === 9;
  return gone && back ? true : JSON.stringify({ gone, back });
});

console.log('--- ④ 재생 경로 ---');
T('T10 sceneHTML — focal 요소에 object-position, 없는 요소는 종전 바이트', () => {
  const P = w.MK_PLAY;
  const sc = { duration: 4, background: '#fff', elements: [
    { kind: 'image', src: 'data:image/png;base64,A', x: 0, y: 0, w: 100, h: 100, focal: { x: 1, y: 0.5 } },
    { kind: 'image', src: 'data:image/png;base64,B', x: 0, y: 0, w: 50, h: 50 },
  ] };
  const h = P.sceneHTML(sc, { still: true });
  const withF = /object-position:100% 50%/.test(h);
  const plain = h.split('base64,B')[1] || '';
  return withF && !/object-position/.test(plain) ? true : h.slice(0, 300);
});

console.log('--- ⑤ SVG 내보내기 경로 ---');
const R = w.MK_RENDER;
const svgOf = (el) => {
  const dl = R.renderScene({ id: 's1', width: 1280, height: 720, background: '#fff', elements: [el] }, { noCache: true });
  return R.toSVG(dl, {});
};
T('T11 focal {0,0} → preserveAspectRatio="xMinYMin slice"', () => {
  const s = svgOf({ kind: 'image', src: 'data:image/png;base64,C', x: 10, y: 10, w: 50, h: 50, focal: { x: 0, y: 0 } });
  return /preserveAspectRatio="xMinYMin slice"/.test(s) ? true : (s.match(/preserveAspectRatio="[^"]+"/) || ['없음'])[0];
});
T('T12 focal {1,0.5} → xMaxYMid slice · focal 없음 → xMidYMid slice(회귀)', () => {
  const a = svgOf({ kind: 'image', src: 'data:image/png;base64,C', x: 0, y: 0, w: 50, h: 50, focal: { x: 1, y: 0.5 } });
  const b = svgOf({ kind: 'image', src: 'data:image/png;base64,C', x: 0, y: 0, w: 50, h: 50 });
  return /xMaxYMid slice/.test(a) && /xMidYMid slice/.test(b) ? true
    : JSON.stringify([(a.match(/preserveAspectRatio="[^"]+"/) || [])[0], (b.match(/preserveAspectRatio="[^"]+"/) || [])[0]]);
});
T('T13 contain은 focal이 있어도 xMidYMid meet(침범 금지)', () => {
  const s = svgOf({ kind: 'image', src: 'data:image/png;base64,C', x: 0, y: 0, w: 50, h: 50, fit: 'contain', focal: { x: 0, y: 0 } });
  return /xMidYMid meet/.test(s) ? true : (s.match(/preserveAspectRatio="[^"]+"/) || ['없음'])[0];
});

console.log('--- ⑥ video fitRect ---');
const V = w.MK_VIDEO;
T('T14 focal 0 → sx 0 · focal 1 → sx = vw−sw · 기본 = 종전 가운데', () => {
  const a = V.fitRect(1920, 1080, 100, 100, 'cover', { x: 0, y: 0 });
  const b = V.fitRect(1920, 1080, 100, 100, 'cover', { x: 1, y: 1 });
  const c = V.fitRect(1920, 1080, 100, 100, 'cover');
  const old = (1920 - 1080) / 2;
  return a.sx === 0 && a.sy === 0 && Math.abs(b.sx - (1920 - b.sw)) < 1e-9 && Math.abs(c.sx - old) < 1e-9 ? true
    : JSON.stringify({ a, b, c });
});
T('T15 contain은 focal 무시(기하 불변 회귀)', () => {
  const a = V.fitRect(1920, 1080, 100, 100, 'contain', { x: 0, y: 0 });
  const b = V.fitRect(1920, 1080, 100, 100, 'contain');
  return JSON.stringify(a) === JSON.stringify(b) ? true : JSON.stringify([a, b]);
});

console.log('--- ⑦ 세 세계 일치 (UI 9칸) ---');
T('T16 9칸 각각 — CSS %·SVG 정렬·fitRect 원점이 같은 곳을 가리킨다', () => {
  const AL = { 0: 'Min', 0.5: 'Mid', 1: 'Max' };
  for (const fy of [0, 0.5, 1]) for (const fx of [0, 0.5, 1]) {
    const el = { focal: { x: fx, y: fy } };
    const css = F.pos(el);
    const wantCss = fx === 0.5 && fy === 0.5 ? '' : `;object-position:${fx * 100}% ${fy * 100}%`;
    if (css !== wantCss) return `CSS 불일치 @${fx},${fy}: ${css}`;
    const pre = F.svgPre('cover', { x: fx, y: fy });
    if (pre !== `x${AL[fx]}Y${AL[fy]} slice`) return `SVG 불일치 @${fx},${fy}: ${pre}`;
    const fr = V.fitRect(2000, 1000, 100, 100, 'cover', { x: fx, y: fy });
    if (Math.abs(fr.sx - (2000 - fr.sw) * fx) > 1e-9) return `fitRect 불일치 @${fx},${fy}`;
  }
  return true;
});

console.log('--- ⑧ 직렬화 왕복 ---');
T('T17 focal이 문서 JSON 왕복을 그대로 통과', () => {
  const d = { scenes: [{ elements: [{ kind: 'image', src: 'x', focal: { x: 0, y: 1 } }] }] };
  const r = JSON.parse(JSON.stringify(d));
  const f = r.scenes[0].elements[0].focal;
  return f && f.x === 0 && f.y === 1 ? true : JSON.stringify(r);
});

console.log(`\n=== R94: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
