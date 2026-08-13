/* ============================================================
   test-round106.mjs — R106 Smart Frame 세밀 초점: 연속 focal + export 크롭 수학
   ------------------------------------------------------------
   R94의 focal 은 모델은 연속인데 UI(3×3)와 export(preserveAspectRatio
   9칸)가 이산이었다. R106은 그 간극을 닫는다.

   계약:
     ① MK_FOCAL audit (coverRect·setFine 포함)
     ② coverRect — cover 넘침 수학 (가로·세로·동일비·null 게이트)
     ③ setFine — 연속 좌표 3자리·nar 동반 기록·가운데 청소·nar 보존
     ④ SVG export — nar 있으면 <image> 실좌표 + preserveAspectRatio="none"
     ⑤ SVG export — nar 없으면 종전 9칸 정렬 폴백 (바이트 동일)
     ⑥ SVG export — crop·mask 클립이 실이미지에 실제로 걸린다 (R105 갭 폐쇄)
     ⑦ workspace — 더블탭 → 세밀 초점 모드 (마커·확인 바·문서 무변형)
     ⑧ 드래그 초안 — WS.focal.d 만 갱신, 문서·undo 무변형
     ⑨ ✓ 확인 → el.focal 연속 커밋 + nar 기록 + undo 1번 원복
     ⑩ ✕ 취소 → 변화 0
     ⑪ 장면 이동 → 자동 종료
     ⑫ 자르기 진입 → 초점 모드 상호배타
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R106_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
/* R115.1 — 가상 시계. 종전엔 tapMedia() 두 번 사이의 "실제 벽시계 경과"가 350ms 안이길
   빌었고, 병렬 부하에선 그 기도가 무너져 이 스위트만 간헐 실패했다(R115 정직 보고의 부채).
   Date.now 를 호출당 +1ms 자동 증가 가상 시계로 교체 — 제품 코드는 무변형이다:
   workspace.js 는 w.eval 로 로드되므로 여기서 바꾼 w.Date.now 를 그대로 읽는다.
   자동 +1ms 는 's'+Date.now() 류 id 유일성도 지킨다. vtAdvance(ms)로 임의 경과 주입. */
let VT = 1700000000000;
w.Date.now = () => ++VT;
const vtAdvance = (ms) => { VT += ms; };
Object.defineProperty(w, 'performance', { value: { now: () => VT } });
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

const FO = w.MK_FOCAL, RD = w.MK_RENDER;
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-9);

console.log('--- ①②③ 순수 계약 ---');
T('T1 MK_FOCAL audit (R106 확장 포함)', () => {
  if (!FO || !FO.coverRect || !FO.setFine) return 'R106 API 없음';
  const a = FO.audit(); return a.ok ? true : a.violations.join(', ');
});
T('T2 coverRect — 넘침 수학 (가로·세로·동일비·경계)', () => {
  const h = FO.coverRect({ x: 100, y: 50, w: 500, h: 250 }, 3, { x: 0.3, y: 0.9 });
  /* fa=2, nar=3 가로 넘침: dw=250*3=750, x=100-(750-500)*0.3=25, y=50 */
  if (!h || !near(h.w, 750) || !near(h.x, 25) || !near(h.y, 50) || !near(h.h, 250)) return 'H ' + JSON.stringify(h);
  const v = FO.coverRect({ x: 0, y: 0, w: 300, h: 300 }, 0.75, { x: 0.5, y: 0.25 });
  /* dh=300/0.75=400, y=-(400-300)*0.25=-25 */
  if (!v || !near(v.h, 400) || !near(v.y, -25) || !near(v.x, 0)) return 'V ' + JSON.stringify(v);
  const s = FO.coverRect({ x: 7, y: 7, w: 200, h: 100 }, 2, { x: 1, y: 1 });
  if (!s || !near(s.x, 7) || !near(s.y, 7) || !near(s.w, 200)) return '동일비 ' + JSON.stringify(s);
  const f1 = FO.coverRect({ x: 0, y: 0, w: 100, h: 100 }, 2, { x: 1, y: 0.5 });
  if (!near(f1.x, -100)) return 'focal=1 경계 ' + JSON.stringify(f1);
  return true;
});
T('T3 setFine — 3자리 반올림·nar 기록·가운데 청소·측정실패 보존', () => {
  const e = {}; FO.setFine(e, 0.123456, 0.87654, 16 / 9);
  if (!e.focal || e.focal.x !== 0.123 || e.focal.y !== 0.877) return 'focal=' + JSON.stringify(e.focal);
  if (e.nar !== Math.round(16 / 9 * 1000) / 1000) return 'nar=' + e.nar;
  FO.setFine(e, 0.4, 0.4, 0);
  if (e.nar !== Math.round(16 / 9 * 1000) / 1000) return '측정실패에 nar 소실';
  FO.setFine(e, 0.5, 0.5, 2);
  return !('focal' in e) && !('nar' in e) ? true : '가운데 청소 실패 ' + JSON.stringify(e);
});

console.log('--- ④⑤⑥ SVG export ---');
const mkScene = (el) => ({ id: 's1', width: 1000, height: 500, background: '#fff',
  elements: [{ kind: 'image', src: 'data:image/png;base64,Q', x: 10, y: 10, w: 50, h: 50, ...el }] });
T('T4 nar 있음 → <image> 실좌표 + preserveAspectRatio="none"', () => {
  /* f=(100,50,500,250), nar=1(fa=2보다 세로) → dh=500, y=50-(500-250)*0.7=-125 */
  const svg = RD.toSVG(RD.renderScene(mkScene({ focal: { x: 0.3, y: 0.7 }, nar: 1 }), { noCache: true }), {});
  const im = (svg.match(/<image[^>]+>/) || [''])[0];
  if (!/preserveAspectRatio="none"/.test(im)) return im;
  if (!/y="-125"/.test(im) || !/height="500"/.test(im) || !/x="100"/.test(im) || !/width="500"/.test(im)) return im;
  return true;
});
T('T5 nar 없음 → 종전 9칸 정렬 폴백 (연속값도 안전)', () => {
  const svg = RD.toSVG(RD.renderScene(mkScene({ focal: { x: 0.3, y: 0.7 } }), { noCache: true }), {});
  const im = (svg.match(/<image[^>]+>/) || [''])[0];
  if (!/preserveAspectRatio="xMinYMax slice"/.test(im)) return im;
  const s2 = RD.toSVG(RD.renderScene(mkScene({}), { noCache: true }), {});
  return /preserveAspectRatio="xMidYMid slice"/.test(s2) ? true : '기본 폴백 파손';
});
T('T6 crop 클립 — 실이미지 <g>에 실제 부착 (R105 갭 폐쇄)', () => {
  const dl = RD.renderScene(mkScene({ crop: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 } }), { noCache: true });
  const svg = RD.toSVG(dl, {});
  const op = dl.ops.find((o) => o.op === 'image');
  if (!op || !op.clip) return 'op.clip 없음';
  const g = (svg.match(/<g[^>]*clip-path="url\(#c\d+\)"[^>]*>/) || [''])[0];
  if (!g) return '실이미지 g 에 crop 클립 미부착: ' + svg.slice(0, 200);
  const mk = RD.toSVG(RD.renderScene(mkScene({ mask: 'circle' }), { noCache: true }), {});
  return /<g[^>]*clip-path="url\(#c\d+\)"/.test(mk) ? true : 'mask 클립 미부착';
});

console.log('--- ⑦⑧⑨⑩⑪⑫ workspace UI ---');
const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const undoBtn = () => [...w.document.querySelectorAll('[data-ws="undo"]')][0];
const curScene = () => {
  const no = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const p0 = w.MK_PROJ.list()[0]; return p0 && p0.doc.scenes[no];
};
let mediaIdx = -1;
const tapMedia = () => {
  const node = w.document.querySelector(`[data-ws-el="${mediaIdx}"]`);
  node.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }));
  node.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
};
T('T7 더블탭 → 세밀 초점 모드 (마커·확인 바·문서 무변형)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '초점'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  for (let g = 0; g < 8 && !allEls().find((n) => n.querySelector('.ws-media')); g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  const node = allEls().find((n) => n.querySelector('.ws-media'));
  if (!node) return '사진 요소 없음';
  mediaIdx = +node.dataset.wsEl;
  const sc = curScene();
  sc.elements[mediaIdx].nar = 1.6;                     /* jsdom naturalWidth=0 — 기존 nar 보존 계약 검증용 */
  const before = JSON.stringify(sc.elements[mediaIdx]);
  /* R115.1 — 창 법칙 양방향을 가상 시계로 결정론 증명:
     ① 첫 탭 후 400ms 경과 → 두 번째 탭은 진입 아님(늦은 탭 거부)
     ② 그 탭에서 350ms 안에 다시 탭 → 진입 */
  tapMedia(); vtAdvance(400); tapMedia();
  if (w.document.querySelector('.ws-folay')) return '400ms 지난 탭이 진입됨 — 창 법칙 위반';
  tapMedia();                                          /* 직전 탭에서 수 ms — 창 안 */
  const lay = w.document.querySelector('.ws-folay');
  const pt = w.document.querySelector('[data-ws-fopt]');
  const ok = w.document.querySelector('[data-ws-fook]');
  if (!lay || !pt || !ok) return `lay=${!!lay} pt=${!!pt} ok=${!!ok}`;
  if (!w.MK_WS.state.focal || w.MK_WS.state.focal.idx !== mediaIdx) return 'WS.focal 미설정';
  if (w.MK_WS.state.focal.nar !== 1.6) return 'nar 미복원: ' + w.MK_WS.state.focal.nar;
  return JSON.stringify(curScene().elements[mediaIdx]) === before ? true : '진입만으로 문서 변형';
});
T('T8 드래그 초안 — d 만 갱신 · 문서·undo 무변형', () => {
  const WSs = w.MK_WS.state;
  const preDoc = JSON.stringify(curScene().elements[mediaIdx]);
  const preUndo = WSs.undo.length;
  const host = w.document.querySelector(`[data-ws-el="${mediaIdx}"]`);
  const lay = host.querySelector('[data-ws-folay]');
  lay.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 30, clientY: 70 }));
  lay.dispatchEvent(new w.MouseEvent('pointermove', { bubbles: true, clientX: 31, clientY: 71 }));
  lay.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  if (!WSs.focal) return '모드 이탈';
  if (JSON.stringify(curScene().elements[mediaIdx]) !== preDoc) return '드래그가 문서 변형';
  return WSs.undo.length === preUndo ? true : '드래그가 undo 적재';
});
T('T9 ✓ 확인 → 연속 focal + nar 커밋 · undo 1번 원복', () => {
  const WSs = w.MK_WS.state;
  WSs.focal.d = { x: 0.31234, y: 0.7 };                /* 드래그 결과 초안 */
  w.document.querySelector('[data-ws-fook]').click();
  const el = curScene().elements[mediaIdx];
  if (!el.focal || el.focal.x !== 0.312 || el.focal.y !== 0.7) return '커밋 안 됨: ' + JSON.stringify(el.focal);
  if (el.nar !== 1.6) return 'nar 소실: ' + el.nar;
  if (w.document.querySelector('.ws-folay')) return '모드 미종료';
  const md = w.document.querySelector(`[data-ws-el="${mediaIdx}"] .ws-media`);
  if (!md || !/object-position:31\.2% 70%/.test(md.getAttribute('style') || '')) return '화면 반영 없음: ' + (md && md.getAttribute('style'));
  undoBtn().click();
  const el2 = curScene().elements[mediaIdx];
  return el2.focal == null ? true : 'undo 후 잔존: ' + JSON.stringify(el2.focal);
});
T('T10 ✕ 취소 → 변화 0', () => {
  const before = JSON.stringify(curScene().elements[mediaIdx]);
  tapMedia(); tapMedia();
  w.MK_WS.state.focal.d = { x: 0.9, y: 0.9 };
  w.document.querySelector('[data-ws-fono]').click();
  if (w.MK_WS.state.focal) return '모드 미종료';
  return JSON.stringify(curScene().elements[mediaIdx]) === before ? true : '취소가 문서 변형';
});
T('T11 장면 이동 → 자동 종료', () => {
  tapMedia(); tapMedia();
  if (!w.MK_WS.state.focal) return '진입 실패';
  const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) return 'next 없음';
  nx.click();
  const r = !w.MK_WS.state.focal;
  const pv = w.document.querySelector('[data-ws="prev"]'); if (pv) pv.click();
  return r ? true : '장면 이동에도 잔존';
});
T('T12 ✂ 자르기 진입 → 초점 모드 상호배타', () => {
  tapMedia(); tapMedia();
  if (!w.MK_WS.state.focal) return '진입 실패';
  tapMedia();                                          /* 단일 탭 = 잠금(모드 유지) — 여기서 패널 ✂ 클릭 */
  const cb = w.document.querySelector('[data-ws-pcrop]');
  if (!cb) return '✂ 버튼 없음';
  cb.click();
  if (w.MK_WS.state.focal) return 'focal 잔존';
  if (!w.MK_WS.state.crop) return 'crop 미진입';
  const cno = w.document.querySelector('[data-ws-crno]'); if (cno) cno.click();
  return true;
});

console.log(`\nR106: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
