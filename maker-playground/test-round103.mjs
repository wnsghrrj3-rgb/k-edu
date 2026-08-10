/* ============================================================
   test-round103.mjs — R103 다중 선택 + 정렬·동일 간격 (§10)
   ------------------------------------------------------------
   Shift+클릭 = 다중 선택(제스처 억제·토글), 일반 클릭 = 해제.
   2개+ = 정렬 패널, 3개+ = 간격 버튼. 전부 % 좌표 제자리 수정 —
   export 는 좌표를 읽으므로 일치 문제가 원천 부재.

   계약:
     ① MK_ARRANGE 순수 — verify + 1개 정렬·2개 간격 거부
     ② Shift+클릭 2개 → 패널 「선택 2개」 + 정렬 6버튼·간격 없음
     ③ 3개 → 간격 버튼 등장
     ④ 왼쪽 정렬 → 전 요소 x = 그룹 최솟값 + undo 1번 원복
     ⑤ 가로 간격 동일 → 첫·끝 고정, 사이 여백 균등
     ⑥ Shift 재클릭 = 제외, 일반 클릭 = 전체 해제(단일 복귀)
     ⑦ 드래그 억제 — Shift 클릭이 요소를 움직이지 않는다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R103_ROOT || path.resolve('.');
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
T('T1 MK_ARRANGE verify', () => {
  const AR = w.MK_ARRANGE; if (!AR) return '모듈 없음';
  const a = AR.verify(); return a.ok ? true : a.violations.join(', ');
});

const H = w.MK_VIDHUB;
T('T2 사진 3장 빌드 → workspace (기반 회귀)', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '정렬'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  return !!w.document.querySelector('.ws-canvas') ? true : w.location.hash;
});

/* Shift 클릭 헬퍼 — pointerdown(shiftKey) */
const undoBtn = () => [...w.document.querySelectorAll('[data-ws="undo"]')][0];
const shiftClick = (node) => node.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, shiftKey: true, cancelable: true }));
const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const docEls = () => { /* 표시 씬 특정 — DOM left/top % 와 문서 x/y 전요소 대조 */
  const nodes = allEls(); if (!nodes.length) return null;
  const list = w.MK_PROJ.list();
  for (const p of list) for (const sc of (p.doc && p.doc.scenes) || []) {
    const map = nodes.map((n) => sc.elements && sc.elements[+n.dataset.wsEl]);
    if (!map.every(Boolean)) continue;
    const hit = nodes.every((n, k) => {
      const st = n.getAttribute('style') || '';
      const mx = st.match(/left:([-\d.]+)%/), my = st.match(/top:([-\d.]+)%/);
      return mx && my && Math.abs(parseFloat(mx[1]) - (map[k].x || 0)) < 0.01 && Math.abs(parseFloat(my[1]) - (map[k].y || 0)) < 0.01;
    });
    if (hit) return map;
  }
  return null;
};

console.log('--- ②③ 다중 선택 패널 ---');
let n1, n2, n3;
T('T3 요소 3개 이상 존재하는 장면 확보', () => {
  for (let g = 0; g < 8 && allEls().length < 3; g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  [n1, n2, n3] = allEls();
  return allEls().length >= 3 ? true : '요소 ' + allEls().length + '개';
});
T('T4 클릭+Shift클릭 → 「선택 2개」 + 정렬 6 + 간격 0', () => {
  n1.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  w.document.querySelector('[data-ws-canvas]').dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  shiftClick(allEls()[1]);
  const h3 = [...w.document.querySelectorAll('.ws-context h3')].map((x) => x.textContent).join(' ');
  const arr = w.document.querySelectorAll('[data-ws-arr]').length;
  return /선택 2개/.test(h3) && arr === 6 ? true : `h3=${h3} arr=${arr}`;
});
T('T5 Shift 세 번째 → 간격 버튼 2 등장 (합 8)', () => {
  shiftClick(allEls()[2]);
  const arr = w.document.querySelectorAll('[data-ws-arr]').length;
  return arr === 8 ? true : 'arr=' + arr;
});

console.log('--- ④⑤ 정렬·간격 실행 ---');
T('T6 왼쪽 정렬 → x 전부 그룹 최솟값 + undo 1번 원복', () => {
  const els = docEls(); if (!els) return '문서 대조 실패';
  const sel = [0, 1, 2].map((i) => els[i]);
  const min = Math.min(...sel.map((e) => e.x || 0));
  const orig = sel.map((e) => e.x);
  w.document.querySelector('[data-ws-arr="left"]').click();
  if (!sel.every((e) => Math.abs((e.x || 0) - min) < 0.11)) return 'x=' + sel.map((e) => e.x).join(',');
  undoBtn().click();
  const fresh = docEls();                              /* undo = 씬 배열 교체 → 참조 재취득 */
  if (!fresh) return 'undo 후 대조 실패';
  const s3 = [0, 1, 2].map((i) => fresh[i]);
  return s3.every((e, i) => e.x === orig[i]) ? true : '원복 실패: ' + s3.map((e) => e.x).join(',');
});
T('T7 가로 간격 동일 — 심은 카드 3개: 첫·끝 고정 + 여백 균등', () => {
  /* 표시 씬에 알려진 카드 3개를 심는다 (10/40/74, w=10) → 씬 왕복으로 재렌더 */
  const seed = (() => { const list = w.MK_PROJ.list();
    for (const p of list) for (const sc of (p.doc && p.doc.scenes) || []) {
      const nodes = allEls(); if (!nodes.length) return null;
      const el = sc.elements && sc.elements[+nodes[0].dataset.wsEl];
      const st = nodes[0].getAttribute('style') || '';
      const mx = st.match(/left:([-\d.]+)%/);
      if (el && mx && Math.abs(parseFloat(mx[1]) - (el.x || 0)) < 0.01) return sc.elements;
    } return null; })();
  if (!seed) return '표시 씬 미특정';
  const base = seed.length;
  seed.push({ kind: 'image', x: 10, y: 80, w: 10, h: 10, label: 'A' },
            { kind: 'image', x: 40, y: 80, w: 10, h: 10, label: 'B' },
            { kind: 'image', x: 74, y: 80, w: 10, h: 10, label: 'C' });
  /* 재렌더마다 참조가 죽으므로 씬 카드 직행으로 왕복 — 현재 씬 번호는 Footer 표기에서 */
  const curNo = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const goSc = (i) => { const b = w.document.querySelector(`[data-ws-sc="${i}"]`); if (b) (b.click ? b.click() : b.dispatchEvent(new w.Event('click', { bubbles: true }))); };
  goSc(curNo === 0 ? 1 : 0); goSc(curNo);
  const nodes = allEls().filter((n) => +n.dataset.wsEl >= base);
  if (nodes.length !== 3) return '심은 카드 DOM ' + nodes.length + '개';
  nodes[0].dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  w.document.querySelector('[data-ws-canvas]').dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  shiftClick(allEls().filter((n) => +n.dataset.wsEl >= base)[1]);
  shiftClick(allEls().filter((n) => +n.dataset.wsEl >= base)[2]);
  const btn = w.document.querySelector('[data-ws-arr="dist-h"]');
  if (!btn) return '간격 버튼 없음';
  btn.click();
  const [A, B, C] = seed.slice(base);
  if (A.x !== 10) return '첫 고정 실패: ' + A.x;
  if (Math.abs(C.x + 10 - 84) > 0.11) return '끝 고정 실패: ' + C.x;
  const g1 = B.x - (A.x + 10), g2 = C.x - (B.x + 10);
  return Math.abs(g1 - g2) < 0.15 && Math.abs(B.x - 42) < 0.11 ? true : `B=${B.x} gap ${g1}/${g2}`; /* (84-10-30)/2=22 → B=42 */
});

console.log('--- ⑥⑦ 해제·드래그 억제 ---');
T('T8 Shift 재클릭 = 제외(2개), 일반 클릭 = 단일 복귀', () => {
  /* T7 이 심은 카드 3개를 선택 중 — 그중 마지막을 재클릭해 제외 */
  const cards = allEls().slice(-3);
  shiftClick(cards[2]);
  let arr = w.document.querySelectorAll('[data-ws-arr]').length;
  if (arr !== 6) return '제외 후 arr=' + arr;
  allEls()[0].dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  w.document.querySelector('[data-ws-canvas]').dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  arr = w.document.querySelectorAll('[data-ws-arr]').length;
  const single = !!w.document.querySelector('.ws-el.sel .ws-hd');
  return arr === 0 && single ? true : `arr=${arr} single=${single}`;
});
T('T9 Shift 클릭이 요소를 안 움직인다 (제스처 억제)', () => {
  const els = docEls(); const el0 = els[1];
  const before = { x: el0.x, y: el0.y };
  const node = allEls()[1];
  shiftClick(node);
  /* 억제 실패 시 move 가 좌표를 바꿀 것 — 가짜 move 흘려보기 */
  w.document.querySelector('[data-ws-canvas]').dispatchEvent(new w.PointerEvent('pointermove', { bubbles: true, clientX: 400, clientY: 300 }));
  w.document.querySelector('[data-ws-canvas]').dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true }));
  return el0.x === before.x && el0.y === before.y ? true : JSON.stringify({ before, after: { x: el0.x, y: el0.y } });
});

console.log(`\nR103: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
