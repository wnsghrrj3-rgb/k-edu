/* ============================================================
   test-round98.mjs — R98 장면 데코 레이어: 안이 꾸며진다
   ------------------------------------------------------------
   준호: 「사진·길이 구성 말고 안(장면)도 좀 꾸며지면 좋겠다」.
   종전 장면 = 단색 배경 + 글자 + 사진 사각형. R98 = MK_DECOR가
   buildScene 완성 요소 「앞」에 테마×역할별 장식 fill을 깐다.
   신규 렌더 코드 0 — fill 박스(자막 바 관례)·원(shape:'ellipse'
   + radius:999 이중 표기)은 4개 렌더 경로가 기왕 그릴 줄 안다.

   계약:
     ① MK_DECOR 순수 — audit(알파·풀블리드 무장식·원 이중표기·
        비율 보정·결정성·번호 배지)
     ② 빌드 통합 — 카드뉴스 빌드의 카드·표지 장면에 decor:true
        요소가 실린다 · 테마별 상이(미니멀 vs 볼드)
     ③ z순서 — 장식은 전부 콘텐츠(텍스트·src 미디어) 앞 인덱스
     ④ 정직 — 풀블리드 슬라이드쇼 사진 장면 = 장식 0
     ⑤ 이스케이프 — input decor:false → 장식 0 (종전 바이트)
     ⑥ 전 렌더러 관통 — play sceneHTML: fill 박스 + 원 50% ·
        render toSVG: ellipse 경로 · workspace: fill div 렌더
     ⑦ R94 공존 — 장식 있는 장면에서도 진짜 사진의 초점 피커가
        뜨고 fill 장식엔 안 뜬다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R98_ROOT || path.resolve('.');
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
for (const f of [...read('index.html').matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const D = w.MK_DECOR, C = w.MK_COMPOSE;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const decorsOf = (sc) => sc.elements.filter((e) => e.decor === true);
const contentIdx = (sc) => sc.elements.findIndex((e) => e.kind === 'text' || e.src);

console.log('--- ① MK_DECOR 순수 ---');
T('T1 모듈 존재 + audit 통과', () => {
  if (!D) return 'MK_DECOR 없음';
  const a = D.audit(); return a.ok ? true : a.violations.join(', ');
});

console.log('--- ②~⑤ 빌드 통합 ---');
const buildCN = (theme, extra) => C.buildProject('cx-cardnews', theme, {
  medias: [], texts: { title: '꾸밈', cta: '마무리' },
  items: [{ body: '첫 카드' }, { body: '둘째 카드' }], ...(extra || {}) });
T('T2 카드뉴스 빌드 — 표지·카드 장면에 decor 요소 존재', () => {
  const r = buildCN('th-minimal');
  if (!r.ok) return r.why;
  const cover = r.doc.scenes[0], card = r.doc.scenes.find((s) => s.role === 'list-item');
  return decorsOf(cover).length > 0 && card && decorsOf(card).length > 0 ? true
    : JSON.stringify({ cover: decorsOf(cover).length, card: card ? decorsOf(card).length : null });
});
T('T3 테마별 상이 — 미니멀 vs 볼드 장식 구성이 다르다 (볼드에 원 존재)', () => {
  const a = buildCN('th-minimal'), b = buildCN('th-bold');
  if (!a.ok || !b.ok) return 'build 실패';
  const da = JSON.stringify(a.doc.scenes[0].elements.filter((e) => e.decor));
  const db = JSON.stringify(b.doc.scenes[0].elements.filter((e) => e.decor));
  const boldCircle = b.doc.scenes[0].elements.some((e) => e.decor && e.shape === 'ellipse');
  return da !== db && boldCircle ? true : JSON.stringify({ same: da === db, boldCircle });
});
T('T4 z순서 — 모든 장식 인덱스 < 첫 콘텐츠 인덱스 (전 장면)', () => {
  const r = buildCN('th-bold');
  for (const sc of r.doc.scenes) {
    const ci = contentIdx(sc);
    const bad = sc.elements.findIndex((e, i) => e.decor && ci >= 0 && i > ci);
    if (bad >= 0) return sc.name + ' 인덱스 ' + bad;
  }
  return true;
});
T('T5 정직 — 풀블리드 슬라이드쇼 사진 장면 = 장식 0', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: [img(1), img(2), img(3)], texts: { title: '여행' } });
  if (!r.ok) return r.why;
  const full = r.doc.scenes.filter((s) => s.elements.some((e) => e.src && e.w >= 99 && e.h >= 99));
  if (!full.length) return '풀블리드 장면 표본 없음';
  const bad = full.find((s) => decorsOf(s).length);
  return !bad ? true : bad.name + ' 에 장식 ' + decorsOf(bad).length;
});
T('T6 이스케이프 — decor:false 빌드 = 장식 0', () => {
  const r = buildCN('th-bold', { decor: false });
  if (!r.ok) return r.why;
  const total = r.doc.scenes.reduce((n, s) => n + decorsOf(s).length, 0);
  return total === 0 ? true : '장식 ' + total;
});
T('T7 번호 배지 — 랭킹 순위 장면에 원 배지', () => {
  const r = C.buildProject('cx-ranking', 'th-minimal', {
    texts: { title: '탑3' }, items: [{ head: '삼' }, { head: '이' }, { head: '일' }] });
  if (!r.ok) return r.why;
  const item = r.doc.scenes.find((s) => s.role === 'list-item');
  return item && item.elements.some((e) => e.decor && e.shape === 'ellipse') ? true : '배지 없음';
});

console.log('--- ⑥ 전 렌더러 관통 ---');
T('T8 play sceneHTML — 장식 fill 박스 렌더 + 원은 border-radius 50%', () => {
  const r = buildCN('th-bold');
  const cover = r.doc.scenes[0];
  const h = w.MK_PLAY.sceneHTML(cover, { still: true });
  const fills = (h.match(/background:rgba|background:#/g) || []).length;
  return fills >= 2 && /border-radius:50%/.test(h) ? true : JSON.stringify({ fills, circle: /border-radius:50%/.test(h) });
});
T('T9 render toSVG — shape ellipse가 실제 타원 경로로', () => {
  const r = buildCN('th-bold');
  const dl = w.MK_RENDER.renderScene(r.doc.scenes[0], { noCache: true });
  const svg = w.MK_RENDER.toSVG(dl, {});
  /* VEC.ellipse는 arc 경로(A) — 장식 원이 사각형이 아니라 곡선으로 */
  return /<path d="[^"]*A[^"]*"/.test(svg) ? true : 'arc 경로 없음';
});
T('T10 workspace — 장식 fill div가 캔버스에 렌더', () => {
  const H = w.MK_VIDHUB;
  w.PG.go('video');
  H.select('cx-cardnews');
  H.st.title = '꾸밈'; H.st.itemsRaw = '첫 카드\n둘째 카드';
  const r = H.startBuild([]);
  if (!r.ok) return r.why;
  const fills = [...w.document.querySelectorAll('.ws-el.media')].filter((n) => !n.querySelector('.ws-media') && /background:/.test(n.getAttribute('style')));
  return fills.length > 0 ? true : 'fill div 없음';
});

console.log('--- ⑦ R94 공존 ---');
T('T11 진짜 사진엔 초점 피커, fill 장식엔 미노출', () => {
  const H = w.MK_VIDHUB;
  w.PG.go('video');
  H.select('cx-cardnews'); H.select('cx-story');
  H.st.title = '공존'; H.st.itemsRaw = '항목: 설명';
  const r = H.startBuild([img(1)]);
  if (!r.ok) return r.why;
  /* 표지(사진 없음)를 지나 사진 장면으로 */
  for (let g = 0; g < 8 && ![...w.document.querySelectorAll('.ws-el.media[data-ws-el]')].some((n) => n.querySelector('.ws-media')); g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) return '다음 버튼 없음'; nx.click();
  }
  /* 장식 fill 클릭 → 피커 없음 */
  const fill = [...w.document.querySelectorAll('.ws-el.media[data-ws-el]')].find((n) => !n.querySelector('.ws-media'));
  if (fill) { fill.click(); if (w.document.querySelector('[data-ws-focal]')) return 'fill에 피커 노출'; }
  /* 진짜 사진 클릭 → 피커 9칸 */
  const real = [...w.document.querySelectorAll('.ws-el.media[data-ws-el]')].find((n) => n.querySelector('.ws-media'));
  if (!real) return '사진 요소 없음';
  real.click();
  return w.document.querySelectorAll('[data-ws-focal]').length === 9 ? true : '사진 피커 미노출';
});

console.log(`\n=== R98: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
