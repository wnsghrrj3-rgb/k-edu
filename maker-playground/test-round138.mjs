/* ============================================================
   test-round138.mjs — R135 속성 패널 위치·크기·글자 크기·굵기 직접 편집
   ------------------------------------------------------------
   준호: 「글씨 크기·비율·위치 변경이 안 된다 — 모든 템플릿에서 되게」.
   종전 패널은 크기·굵기·폭을 읽기전용으로만 보여줬다. 이 라운드는
   · 텍스트: 글자 크기 슬라이더 · 굵기 select · X/Y/폭 숫자 입력이 있고 모델에 닿는가
   · 사진·도형·영상: X/Y/폭/높이 입력이 있는가
   · SVG 템플릿(tplsvg)에서 온 텍스트도 같은 패널을 받는가 (모든 템플릿)
   · undo 적재 — 숫자 한 번 바꾸면 되돌리기 1칸
   · 빈 사진 자리에도 「사진 올리기」 버튼 (R134)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/workspace', pretendToBeVisual: true });
const w = dom.window; w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) { try { w.eval(read(f)); } catch (e) {} }
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
let pass = 0, fail = 0;
const T = (name, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + '  → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); } };
const q = (s) => w.document.querySelector(s);
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const P = w.MK_PROJ;
const WSS = () => w.MK_WS.state;
const curDoc = () => { const p = P.get(WSS().projectId); return p && p.doc; };

w.PG.go('workspace');
const select = (sel) => { const n = q(sel); if (!n) return null; pe('pointerdown', n, { pointerType: 'mouse', button: 0, clientX: 0, clientY: 0 }); pe('pointerup', n, { pointerType: 'mouse' }); return n; };
const model = (i) => { const d = curDoc(); const sc = d && d.scenes[WSS().sceneIdx]; return sc && sc.elements[i]; };

console.log('--- ① 텍스트 ---');
let ti = null;
T('T1 텍스트 선택 → 패널에 글자 크기·굵기·X/Y/폭 입력', () => {
  const n = select('.ws-el.text[data-ws-el]'); if (!n) return '텍스트 요소 없음';
  ti = +n.dataset.wsEl;
  const need = ['[data-ws-tsize]', '[data-ws-tweight]', '[data-ws-num="x"]', '[data-ws-num="y"]', '[data-ws-num="w"]'];
  const miss = need.filter((s) => !q(s)); if (miss.length) return '없음: ' + miss.join(' ');
  if (q('[data-ws-num="h"]')) return '텍스트에 높이 입력이 있으면 안 됨';
  return true;
});
T('T2 X 숫자 → 모델 x 갱신 + 캔버스 left', () => {
  const inp = q('[data-ws-num="x"]'); inp.value = '33.5'; fire(inp, 'input'); fire(inp, 'change');
  const el = model(ti); if (!el) return '모델 없음';
  if (el.x !== 33.5) return 'x=' + el.x;
  const dom2 = q(`.ws-el[data-ws-el="${ti}"]`); return dom2 && /left:33.5%/.test(dom2.getAttribute('style')) ? true : dom2.getAttribute('style');
});
T('T3 글자 크기 슬라이더 → el.size', () => {
  select(`.ws-el[data-ws-el="${ti}"]`);
  const s = q('[data-ws-tsize]'); if (!s) return '슬라이더 없음'; s.value = '7.5'; fire(s, 'input'); fire(s, 'change');
  const el = model(ti); return el.size === 7.5 ? true : 'size=' + el.size;
});
T('T4 굵기 select → el.weight', () => {
  select(`.ws-el[data-ws-el="${ti}"]`);
  const s = q('[data-ws-tweight]'); if (!s) return 'select 없음'; s.value = '900'; fire(s, 'change');
  const el = model(ti); return el.weight === 900 ? true : 'weight=' + el.weight;
});
T('T5 범위 밖 값은 클램프 (폭 500 → 200)', () => {
  select(`.ws-el[data-ws-el="${ti}"]`);
  const inp = q('[data-ws-num="w"]'); inp.value = '500'; fire(inp, 'change');
  const el = model(ti); return el.w === 200 ? true : 'w=' + el.w;
});
T('T6 되돌리기 — 마지막 변경(폭)이 원복', () => {
  const u = q('[data-ws="undo"]'); if (!u) return 'undo 버튼 없음'; u.click();
  const el = model(ti); return el.w !== 200 ? true : '원복 안 됨 w=' + el.w;
});

console.log('--- ② 사진·빈 자리 ---');
T('T7 빈 사진 자리(src 없음) 선택 → 사진 올리기 버튼 + 높이 입력', () => {
  const d = curDoc(); const sc = d.scenes[WSS().sceneIdx];
  sc.elements.push({ kind: 'image', x: 60, y: 10, w: 26, h: 64, label: '인물/사진' });
  w.PG.go('workspace');
  const n = select(`.ws-el.box[data-ws-el="${sc.elements.length - 1}"]`); if (!n) return '빈 자리 없음';
  const b = q('[data-ws-preplace]'); if (!b) return '사진 올리기 버튼 없음';
  if (!/사진 올리기/.test(b.textContent)) return b.textContent;
  if (q('[data-ws-padj]')) return '사진 없는데 보정 슬라이더가 보임';
  return q('[data-ws-num="h"]') ? true : '높이 입력 없음';
});
T('T8 사진 있는 요소는 「사진 바꾸기」 + 보정 슬라이더', () => {
  const d = curDoc(); const sc = d.scenes[WSS().sceneIdx];
  sc.elements.push({ kind: 'image', x: 5, y: 5, w: 30, h: 30, src: 'data:image/png;base64,X' });
  w.PG.go('workspace');
  select(`.ws-el.media[data-ws-el="${sc.elements.length - 1}"]`);
  const b = q('[data-ws-preplace]'); if (!b || !/사진 바꾸기/.test(b.textContent)) return b ? b.textContent : '버튼 없음';
  return q('[data-ws-padj]') ? true : '보정 슬라이더 없음';
});

console.log('--- ③ SVG 템플릿 텍스트도 같은 패널 ---');
T('T9 tplsvg 로 푼 텍스트 선택 → 크기·위치 입력', () => {
  const TS = w.MK_TPLSVG; if (!TS) return 'MK_TPLSVG 없음';
  const t = TS.CATALOG.find((c) => !c.slides); if (!t) return '카탈로그 없음';
  const f = 'assets/templates/' + t.pack + '/' + t.file;
  const p = TS.parse(read(f), { DOMParser: w.DOMParser, XMLSerializer: w.XMLSerializer });
  const d = curDoc();
  d.scenes.push({ id: 'tpl', width: 1280, height: 720, background: '#fff', elements: [] });
  const r = TS.applyTo(d, d.scenes.length - 1, p, t); if (!r.ok) return '적용 실패';
  w.PG.go('workspace');
  for (let g = 0; g < 40 && !(q('.ws-el.text[data-ws-el]') && q('.page span') && new RegExp('^' + d.scenes.length + ' / ').test(q('.page span').textContent)); g++) { const nx = q('[data-ws="next"]'); if (!nx) break; nx.click(); }
  const n = select('.ws-el.text[data-ws-el]'); if (!n) return '템플릿 텍스트 없음';
  return q('[data-ws-tsize]') && q('[data-ws-num="x"]') ? true : '입력 없음';
});

console.log(`\n${fail ? '❌' : '✅'} R138  ${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
