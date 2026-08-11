/* ============================================================
   test-round107.mjs — R107 회전을 workspace 의 1급 시민으로
   ------------------------------------------------------------
   el.rot 은 R36·R37 이래 editor·play·export 에 다 살아 있었는데
   정작 제작 화면인 workspace 에만 없었다 — 표시도, 설정도, 제스처 수학도.
   R107 은 셋을 한꺼번에 닫는다. 핵심 규약: rot=0 이면 회전 이전과
   완전히 같은 경로(바이트 동일) — 기존 스위트 무회귀의 근거.

   계약:
     ① MK_LIVE audit (R107 회전 기하 포함)
     ② rotOf·setRot — 0~359 정규화·음수·무효값·0° 키 삭제(§23)
     ③ rotVec·unrotVec — 90° 정확·왕복 항등
     ④ recenter — (I−R)(c−c')·0°는 무보정
     ⑤ framePos — 중심 불변·회전 좌표계
     ⑥ workspace 렌더 — rot 있으면 transform:rotate, 없으면 미출력
     ⑦ 회전 손잡이 존재 · .ws-hd 6개 계약(R55) 불변
     ⑧ 손잡이 드래그 → rot 커밋 + undo 1번 원복
     ⑨ 패널 ↺/↻ 15° · 회전 없음
     ⑩ 슬라이더 — 한 번 끌면 undo 한 칸
     ⑪ 회전 리사이즈 — 반대 모서리가 화면에서 제자리
     ⑫ 회전 요소의 초점 좌표 — 역회전 경로 (문서 무변형)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R107_ROOT || path.resolve('.');
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
/* R106 더블탭 판정(350ms)이 걸려 있어 같은 요소를 연달아 치면 초점 모드로 샌다.
   가상 시계로 탭 사이 시간을 실제와 같게 만든다 — 더블탭은 의도할 때만. */
let clock = 1e6;
const realNow = w.Date.now.bind(w.Date);
w.Date.now = () => clock;
const wait = (ms) => { clock += ms; };
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const L = w.MK_LIVE;
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-9);

console.log('--- ①②③④⑤ 순수 기하 ---');
T('T1 MK_LIVE audit (R107 확장 포함)', () => {
  if (!L || !L.rotOf || !L.recenter || !L.framePos) return 'R107 API 없음';
  const a = L.liveAudit(); return a.ok ? true : a.violations.join(', ');
});
T('T2 rotOf·setRot — 정규화·무효값·0° 키 삭제', () => {
  if (L.rotOf({ rot: 450 }) !== 90) return '450→' + L.rotOf({ rot: 450 });
  if (L.rotOf({ rot: -30 }) !== 330) return '-30→' + L.rotOf({ rot: -30 });
  if (L.rotOf({ rot: NaN }) !== 0 || L.rotOf(null) !== 0) return '무효값 통과';
  const e = {}; L.setRot(e, 720);
  if ('rot' in e) return '720°(=0) 키 잔존';
  L.setRot(e, 45.4); if (e.rot !== 45) return '반올림 오류 ' + e.rot;
  L.setRot(e, 0); return !('rot' in e) ? true : '0° 키 미삭제';
});
T('T3 rotVec·unrotVec — 90° 정확·왕복 항등', () => {
  const a = L.rotVec(10, 0, 90);                       /* 화면 좌표계: +y 아래 = 시계 방향 */
  if (!near(a.x, 0) || !near(a.y, 10)) return JSON.stringify(a);
  const b = L.unrotVec(3, 7, 37), c = L.rotVec(b.x, b.y, 37);
  return near(c.x, 3) && near(c.y, 7) ? true : '왕복 실패 ' + JSON.stringify(c);
});
T('T4 recenter — (I−R)(c−cx) 정의·0° 무보정', () => {
  if (!near(L.recenter(5, 9, 1, 2, 0).x, 0) || !near(L.recenter(5, 9, 1, 2, 0).y, 0)) return '0°에서 보정 발생';
  const r = L.recenter(0, 0, 10, 0, 180);              /* I−R180 = 2I */
  if (!near(r.x, -20) || !near(r.y, 0)) return '180° ' + JSON.stringify(r);
  const q = L.recenter(0, 0, 10, 0, 90);               /* Δ = (c−c') − R90(c−c') = (−10,0) − (0,−10) */
  return near(q.x, -10) && near(q.y, 10) ? true : '90° ' + JSON.stringify(q);
});
T('T5 framePos — 중심 불변·회전 좌표계·클램프', () => {
  const c = L.framePos(100, 100, 40, 20, 100, 100, 77);
  if (!near(c.x, 0.5) || !near(c.y, 0.5)) return '중심 ' + JSON.stringify(c);
  const p = L.framePos(0, 0, 40, 20, 10, 0, 0);        /* 회전 0 = 종전 정의 */
  if (!near(p.x, 0.75) || !near(p.y, 0.5)) return '무회전 ' + JSON.stringify(p);
  const g = L.framePos(0, 0, 40, 20, 0, 10, 90);       /* 90°: 화면 아래 = 요소의 오른쪽(+x) */
  if (!near(g.x, 0.75) || !near(g.y, 0.5)) return '90° ' + JSON.stringify(g);
  const cl = L.framePos(0, 0, 4, 4, 999, 999, 0);
  return cl.x === 1 && cl.y === 1 ? true : '클램프 실패';
});

console.log('--- ⑥⑦⑧⑨⑩⑫ workspace ---');
const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const curScene = () => {
  const no = +(w.document.querySelector('.page span') || { textContent: '1 /' }).textContent.split('/')[0].trim() - 1;
  const p0 = w.MK_PROJ.list()[0]; return p0 && p0.doc.scenes[no];
};
const RECT = { left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0 };
const stub = (n, r) => { n.getBoundingClientRect = () => (r || RECT); return n; };
let idx = -1;
const node = () => w.document.querySelector(`[data-ws-el="${idx}"]`);
const tapAt = (n, x, y) => {
  n.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: x, clientY: y }));
  n.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
};
/* 같은 요소를 350ms 안에 두 번 치면 R106 세밀 초점 — 평시 탭은 간격을 둔다 */
const tap = () => { wait(600); tapAt(node(), 10, 10); };
const draw = () => tap();

T('T6 렌더 — rot 있으면 transform:rotate, 없으면 미출력', () => {
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '회전'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why;
  for (let g = 0; g < 8 && !allEls().find((n) => n.querySelector('.ws-media')); g++) {
    const nx = w.document.querySelector('[data-ws="next"]'); if (!nx) break; nx.click();
  }
  const n0 = allEls().find((n) => n.querySelector('.ws-media'));
  if (!n0) return '사진 요소 없음';
  idx = +n0.dataset.wsEl;
  if (/rotate\(/.test(n0.getAttribute('style') || '')) return '무회전인데 transform 출력';
  curScene().elements[idx].rot = 30;
  draw();
  const st = node().getAttribute('style') || '';
  if (!/transform:rotate\(30deg\)/.test(st)) return 'style=' + st.slice(-60);
  delete curScene().elements[idx].rot; draw();
  return !/rotate\(/.test(node().getAttribute('style') || '') ? true : '해제 후 잔존';
});
T('T7 회전 손잡이 존재 · .ws-hd 6개 계약 불변', () => {
  tap();
  const sel = w.document.querySelector('.ws-el.sel');
  if (!sel) return '선택 없음';
  const hd = sel.querySelectorAll('.ws-hd').length;
  if (hd !== 6) return 'ws-hd 수 변동: ' + hd;
  return sel.querySelector('[data-ws-rh]') ? true : '회전 손잡이 없음';
});
T('T8 손잡이 드래그 → rot 커밋 + undo 1번 원복', () => {
  const WSs = w.MK_WS.state;
  tap();
  const pre = WSs.undo.length;
  const n = stub(node());
  const rh = n.querySelector('[data-ws-rh]');
  if (!rh) return '손잡이 없음';
  rh.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 0 }));
  n.dispatchEvent(new w.MouseEvent('pointermove', { bubbles: true, clientX: 300, clientY: 100 })); /* 중심(100,100) 오른쪽 = 90° */
  n.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  const el = curScene().elements[idx];
  if (el.rot !== 90) return 'rot=' + el.rot;
  if (WSs.undo.length !== pre + 1) return 'undo ' + pre + '→' + WSs.undo.length;
  const ub = [...w.document.querySelectorAll('[data-ws="undo"]')][0];
  if (!ub) return 'undo 버튼 없음';
  ub.click();
  return curScene().elements[idx].rot === undefined ? true : '원복 실패 ' + curScene().elements[idx].rot;
});
T('T9 패널 ↺/↻ 15° · 회전 없음', () => {
  tap();
  const by = (v) => w.document.querySelector(`[data-ws-rotby="${v}"]`);
  if (!by('15') || !by('-15')) return '회전 버튼 없음';
  by('15').click();
  if (curScene().elements[idx].rot !== 15) return '↻ ' + curScene().elements[idx].rot;
  by('-15').click();
  if (curScene().elements[idx].rot !== undefined) return '↺ 복귀 실패(0°는 키 삭제)';
  by('-15').click();
  if (curScene().elements[idx].rot !== 345) return '음수 정규화 ' + curScene().elements[idx].rot;
  const r0 = w.document.querySelector('[data-ws-rot0]');
  if (!r0) return '회전 없음 버튼 미노출';
  r0.click();
  return curScene().elements[idx].rot === undefined ? true : '해제 실패';
});
T('T10 슬라이더 — 한 번 끌면 undo 한 칸', () => {
  const WSs = w.MK_WS.state;
  tap();
  const sl = w.document.querySelector('[data-ws-rotr]');
  if (!sl) return '슬라이더 없음';
  const pre = WSs.undo.length;
  sl.value = '20'; sl.dispatchEvent(new w.Event('input', { bubbles: true }));
  sl.value = '40'; sl.dispatchEvent(new w.Event('input', { bubbles: true }));
  sl.value = '60'; sl.dispatchEvent(new w.Event('input', { bubbles: true }));
  sl.dispatchEvent(new w.Event('change', { bubbles: true }));
  if (curScene().elements[idx].rot !== 60) return 'rot=' + curScene().elements[idx].rot;
  if (WSs.undo.length !== pre + 1) return 'undo ' + (WSs.undo.length - pre) + '칸';
  const ub = [...w.document.querySelectorAll('[data-ws="undo"]')][0];
  ub.click();
  return curScene().elements[idx].rot === undefined ? true : '원복 실패';
});
T('T12 회전 요소의 초점 — 역회전 좌표 (문서 무변형)', () => {
  const WSs = w.MK_WS.state;
  tap();
  const el = curScene().elements[idx];
  el.rot = 90; el.nar = 1.6; el.w = 50; el.h = 50; draw();
  const before = JSON.stringify(curScene().elements[idx]);
  wait(600); tapAt(node(), 10, 10); tapAt(node(), 10, 10);  /* 붙여 치면 더블탭 = 세밀 초점 */
  if (!WSs.focal) return '초점 진입 실패';
  const host = stub(node());
  const lay = host.querySelector('[data-ws-folay]');
  if (!lay) return '초점 레이어 없음';
  /* 중심(100,100)에서 화면 아래로 → 90° 회전이면 요소의 오른쪽(+x) */
  lay.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 140 }));
  lay.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  const d = WSs.focal.d;
  if (!(d.x > 0.5 && near(d.y, 0.5, 0.02))) return '역회전 미적용 d=' + JSON.stringify(d);
  if (near(d.x, 0.5, 1e-6) || near(d.y, 0.7, 1e-6)) return '무회전 경로와 동일 d=' + JSON.stringify(d);
  const no = w.document.querySelector('[data-ws-fono]'); if (no) no.click();
  if (JSON.stringify(curScene().elements[idx]) !== before) return '초점 조작이 문서 변형';
  delete curScene().elements[idx].rot; draw();
  return true;
});

console.log('--- ⑪ 회전 리사이즈 앵커 ---');
T('T11 회전 리사이즈 — 반대 모서리가 화면에서 제자리', () => {
  const DEG = 40, CW = 1000, CH = 500;
  const start = { x: 20, y: 20, w: 30, h: 20 };
  const el = { kind: 'image', ...start };
  const px = (o) => ({ x: o.x / 100 * CW, y: o.y / 100 * CH });
  const anchor0 = px({ x: start.x, y: start.y });      /* br 을 끌면 tl 이 앵커 */
  const c0 = px({ x: start.x + start.w / 2, y: start.y + start.h / 2 });
  const scr = (p, c) => { const v = L.rotVec(p.x - c.x, p.y - c.y, DEG); return { x: c.x + v.x, y: c.y + v.y }; };
  const before = scr(anchor0, c0);
  L.resizeTo(el, 'br', start, 8, 6);
  const c1 = px({ x: el.x + el.w / 2, y: el.y + el.h / 2 });
  const d = L.recenter(c0.x, c0.y, c1.x, c1.y, DEG);
  el.x = Math.round((el.x + d.x / CW * 100) * 10) / 10;
  el.y = Math.round((el.y + d.y / CH * 100) * 10) / 10;
  const c2 = px({ x: el.x + el.w / 2, y: el.y + el.h / 2 });
  const after = scr(px({ x: el.x, y: el.y }), c2);
  if (!near(after.x, before.x, 1) || !near(after.y, before.y, 1))
    return `앵커 이동 ${JSON.stringify(before)} → ${JSON.stringify(after)}`;
  /* 보정을 빼면 실제로 어긋나야 한다 — 보정이 일하고 있다는 증거 */
  const el2 = { kind: 'image', ...start };
  L.resizeTo(el2, 'br', start, 8, 6);
  const cn = px({ x: el2.x + el2.w / 2, y: el2.y + el2.h / 2 });
  const naive = scr(px({ x: el2.x, y: el2.y }), cn);
  return (Math.abs(naive.x - before.x) > 1 || Math.abs(naive.y - before.y) > 1)
    ? true : '무보정도 같은 결과 — 계약이 아무것도 안 지킨다';
});

if (realNow() < 0) console.log('unreachable');
console.log(`\nR107: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
