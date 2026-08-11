/* ============================================================
   test-round109.mjs — R109 회전이 손잡이와 다중 선택에까지 미친다
   ------------------------------------------------------------
   R108 이 정직하게 남긴 두 빚:
   ① 리사이즈 손잡이(터치 근접 폴백)와 다중 선택 경계는 아직
      회전 안 된 박스를 읽는다
   ② 회전 인지 스냅은 호출부 옵트인이라, 새 호출자가 ar 을 잊으면
      조용히 옛 길로 간다 — 하니스가 알려진 두 곳만 지킨다

   R109 가 갚는 방식:
   - MK_LIVE.handleAtPts — 손잡이 실좌표(브라우저가 돌려놓은 자리)
     최근접이 정본, handleAt 은 그 무회전 특수형
   - MK_ARRANGE 정렬·간격이 ar 옵트인으로 외접 박스를 잰다
     (스냅과 같은 규약 — 무ar = 종전 수치 그대로)
   - 옵트인 침묵 경로를 소스 전수 스캔으로 기계 감시: screens/ 의
     모든 snap·align·distribute 호출이 ar 을 넘기는지 잣대가 세어 본다

   계약:
     ① MK_LIVE audit (R109 확장 포함)
     ② handleAtPts — 최근접·반경 밖 null·무효점 건너뜀
     ③ handleAt — 위임 후에도 R95 이래 결과 동일 (공식 대조)
     ④ MK_ARRANGE verify (R109 확장 포함)
     ⑤ align 무ar — 회전 요소에도 종전 수치 그대로 (옛 길 보존)
     ⑥ align ar — 90° 회전 요소가 외접 왼변으로 정렬 (+무ar 대조군)
     ⑦ align ar — 회전한 텍스트가 실높이 외접으로 아래변 정렬
     ⑧ distribute ar — 외접 크기·자리로 간격 균등 (+무ar 대조군)
     ⑨ 옵트인 전수 감시 — screens/ 소스의 snap·align·distribute
        호출 전량이 ar 인자를 넘긴다 (잊으면 여기서 빨간불)
     ⑩ workspace 배선 — 정렬 버튼이 씬 ar 을 MK_ARRANGE 에 넘긴다
     ⑪ workspace 터치 폴백 — 회전 요소는 손잡이 실좌표로 판정
        (외접 모서리 판정이면 다른 손잡이가 잡히는 배치로 대조)
     ⑫ workspace 터치 폴백 — rot=0 은 종전 handleAt 경로 그대로
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R109_ROOT || path.resolve('.');
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
let clock = 1e6;
w.Date.now = () => clock;
const wait = (ms) => { clock += ms; };
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const L = w.MK_LIVE, A = w.MK_ARRANGE;
const near = (a, b, e) => Math.abs(a - b) <= (e || 1e-9);

console.log('--- ①~④ 순수 층 ---');

T('T1 MK_LIVE audit (R109 확장 포함)', () => {
  if (!L || !L.handleAtPts) return 'handleAtPts 없음';
  const a = L.liveAudit(); return a.ok ? true : a.violations.join(', ');
});

T('T2 handleAtPts — 최근접·반경 밖 null·무효점 건너뜀', () => {
  const pts = { tl: [10, 10], br: [110, 60], mid: [60, 35] };
  if (L.handleAtPts(pts, 12, 13, 22) !== 'tl') return '최근접 오류';
  if (L.handleAtPts(pts, 62, 36, 22) !== 'mid') return '가운데 점 미인식';
  if (L.handleAtPts(pts, 300, 300, 22) !== null) return '반경 밖이 잡힘';
  if (L.handleAtPts({ a: [NaN, 0], b: [5, undefined], c: [7, 7] }, 7, 8, 22) !== 'c') return '무효점 건너뜀 실패';
  if (L.handleAtPts({}, 0, 0, 22) !== null) return '빈 점집합이 null 아님';
  return true;
});

T('T3 handleAt — 위임 후에도 종전 결과 동일 (공식 대조)', () => {
  /* R95 원공식을 잣대로 그대로 복원해 무작위 표본과 대조 */
  const legacy = (rect, px, py, radius) => {
    if (!rect || !(rect.width > 0) || !(rect.height > 0)) return null;
    const r = radius == null ? 22 : radius;
    const pts = {
      tl: [rect.left, rect.top], tr: [rect.right, rect.top],
      bl: [rect.left, rect.bottom], br: [rect.right, rect.bottom],
      ml: [rect.left, rect.top + rect.height / 2], mr: [rect.right, rect.top + rect.height / 2],
    };
    let best = null, bd = r + 1e-9;
    for (const k in pts) {
      const d = Math.hypot(px - pts[k][0], py - pts[k][1]);
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  };
  let seed = 41;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 300; i++) {
    const rect = { left: rnd() * 200, top: rnd() * 200, width: 40 + rnd() * 300, height: 30 + rnd() * 200 };
    rect.right = rect.left + rect.width; rect.bottom = rect.top + rect.height;
    const px = rect.left - 30 + rnd() * (rect.width + 60), py = rect.top - 30 + rnd() * (rect.height + 60);
    if (L.handleAt(rect, px, py) !== legacy(rect, px, py)) return `표본 ${i} 불일치`;
  }
  if (L.handleAt(null, 0, 0) !== null || L.handleAt({ width: 0, height: 0 }, 0, 0) !== null) return '무효 rect 규약 변형';
  return true;
});

T('T4 MK_ARRANGE verify (R109 확장 포함)', () => {
  if (!A || !A.vbox) return 'vbox 없음';
  const v = A.verify(); return v.ok ? true : v.violations.join(', ');
});

console.log('--- ⑤~⑧ 정렬·간격의 회전 인지 (대조군 동봉) ---');

const AR = 16 / 9;
const rotSet = () => [{ x: 10, y: 10, w: 20, h: 10, rot: 90 }, { x: 60, y: 40, w: 10, h: 10 }];

T('T5 align 무ar — 회전 요소에도 종전 수치 그대로 (옛 길 보존)', () => {
  const e = rotSet(); const r = A.align(e, 'left');
  if (!r.ok) return 'align 실패';
  /* 종전 규약: 회전 무시, 모델 x 최소값(10)으로 — R103 수치와 동일해야 한다 */
  return e[0].x === 10 && e[1].x === 10 ? true : `옛 수치 이탈: ${e[0].x}, ${e[1].x}`;
});

T('T6 align ar — 90° 회전 요소가 외접 왼변으로 정렬 (+무ar 대조군)', () => {
  const e = rotSet(); const r = A.align(e, 'left', AR);
  if (!r.ok) return 'align 실패';
  const va = L.aabb(e[0], AR), vb = L.aabb(e[1], AR);
  if (!near(va.x, vb.x, 0.11)) return `외접 왼변 불일치: ${va.x.toFixed(2)} ≠ ${vb.x.toFixed(2)}`;
  /* 대조군 — 무ar 결과(T5: 둘 다 모델 x=10)와 달라야 변화가 실재 */
  const c = rotSet(); A.align(c, 'left');
  if (e[0].x === c[0].x && e[1].x === c[1].x) return 'ar 유무가 같은 결과 — 변화가 가짜';
  return true;
});

T('T7 align ar — 회전한 텍스트가 실높이 외접으로 아래변 정렬', () => {
  const t = { kind: 'text', x: 10, y: 10, w: 30, size: 4, text: '가\n나', rot: 30 };
  const b = { x: 50, y: 60, w: 10, h: 10 };
  const r = A.align([t, b], 'bottom', AR);
  if (!r.ok) return 'align 실패';
  const vt = L.aabb(t, AR), vb = L.aabb(b, AR);
  if (!near(vt.y + vt.h, vb.y + vb.h, 0.11)) return `외접 아래변 불일치: ${(vt.y + vt.h).toFixed(2)} ≠ ${(vb.y + vb.h).toFixed(2)}`;
  /* 외접 높이가 textH 를 실제로 먹었는지 — 8% 가장 아님을 확인 */
  const th = L.textH(t);
  return vt.h > th - 1e-9 ? true : `외접 높이 ${vt.h.toFixed(2)} < textH ${th.toFixed(2)} — 실높이 미사용`;
});

T('T8 distribute ar — 외접 크기·자리로 간격 균등 (+무ar 대조군)', () => {
  const mk = () => [{ x: 0, y: 0, w: 20, h: 10, rot: 90 }, { x: 40, y: 0, w: 10, h: 10 }, { x: 80, y: 0, w: 10, h: 10 }];
  const e = mk(); const r = A.distribute(e, 'h', AR);
  if (!r.ok) return 'distribute 실패';
  const bs = e.map((el) => L.aabb(el, AR));
  const g1 = bs[1].x - (bs[0].x + bs[0].w), g2 = bs[2].x - (bs[1].x + bs[1].w);
  if (!near(g1, g2, 0.25)) return `외접 간격 불균등: ${g1.toFixed(2)}, ${g2.toFixed(2)}`;
  const c = mk(); A.distribute(c, 'h');
  if (e[1].x === c[1].x) return 'ar 유무가 같은 가운데 배치 — 변화가 가짜';
  return true;
});

console.log('--- ⑨ 옵트인 전수 감시 ---');

T('T9 screens/ 의 snap·align·distribute 호출 전량이 ar 을 넘긴다', () => {
  /* R108 정직 보고의 구멍: 「하니스가 알려진 두 곳만 지킨다」.
     이제 소스 전체를 세어 본다 — 새 호출자가 ar 을 잊으면 여기서 빨간불. */
  const argCount = (src, at) => {
    let i = src.indexOf('(', at); if (i < 0) return 0;
    let depth = 1, args = 1, empty = true;
    for (i++; i < src.length && depth > 0; i++) {
      const ch = src[i];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      else if (ch === ',' && depth === 1) args++;
      else if (!/\s/.test(ch)) empty = false;
    }
    return empty ? 0 : args;
  };
  const bad = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'screens')).filter((x) => x.endsWith('.js'))) {
    const src = read('screens/' + f);
    for (const m of src.matchAll(/(?:L|window\.MK_LIVE|MK_LIVE)\.snap\(/g)) {
      const n = argCount(src, m.index + m[0].length - 1);
      if (n < 4) bad.push(`${f}: snap ${n}인자 (ar 누락)`);
    }
    for (const m of src.matchAll(/(?:AR|window\.MK_ARRANGE|MK_ARRANGE)\.(align|distribute)\(/g)) {
      const n = argCount(src, m.index + m[0].length - 1);
      if (n < 3) bad.push(`${f}: ${m[1]} ${n}인자 (ar 누락)`);
    }
  }
  /* 잣대의 잣대 — 세는 기계 자체가 인자를 제대로 세는지 */
  const probe = "L.snap(el, xs.filter((_, j) => j !== i), 1.2, (sc.width||16)/(sc.height||9)); AR.align(els, m2);";
  if (argCount(probe, probe.indexOf('(')) !== 4) return '인자 세기 오작동(4)';
  if (argCount(probe, probe.indexOf('AR.align') + 8) !== 2) return '인자 세기 오작동(2)';
  return bad.length ? bad.join(' · ') : true;
});

console.log('--- ⑩~⑫ workspace 실경로 ---');

const H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const curDoc = () => w.MK_PROJ && w.MK_PROJ.current && w.MK_PROJ.current().doc;
const pageNo = () => (w.MK_WS && w.MK_WS.state ? w.MK_WS.state.sceneIdx : 0);
const curScene = () => { const d = curDoc(); return d && d.scenes[pageNo()]; };
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
let built = false;
const build = () => {
  if (built) return true;
  w.PG.go('video');
  H.st.comp = 'cx-slideshow'; H.st.title = '회전 손잡이'; H.st.sub = '';
  const r = H.startBuild([img(1), img(2), img(3)]);
  built = !!r.ok; return built ? true : (r.why || '빌드 실패');
};
const redraw = () => { wait(600); const n = w.document.querySelector('.ws-el[data-ws-el]'); if (n) pe('pointerdown', n, { clientX: 2, clientY: 2 }), pe('pointerup', n, {}); };

const allEls = () => [...w.document.querySelectorAll('.ws-el[data-ws-el]')];
const shiftClick = (n) => n.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, shiftKey: true, cancelable: true }));

T('T10 정렬 버튼이 씬 ar 을 MK_ARRANGE 에 넘긴다', () => {
  const b = build(); if (b !== true) return b;
  wait(600);
  const ns = allEls(); if (ns.length < 2) return '요소 부족';
  pe('pointerdown', ns[0], { cancelable: true }); pe('pointerup', w.document.querySelector('[data-ws-canvas]'), {});
  wait(600);
  shiftClick(allEls()[1]);
  const sc = curScene();
  const btn = w.document.querySelector('[data-ws-arr="left"]');
  if (!btn) return '정렬 버튼 미렌더 (Shift 다중 선택 후)';
  const seen = [];
  const orig = A.align;
  A.align = function (els, mode, ar) { seen.push(ar); return orig.apply(this, arguments); };
  try { btn.click(); } finally { A.align = orig; }
  if (!seen.length) return 'align 미호출';
  const want = (sc.width || 16) / (sc.height || 9);
  return seen.some((a) => a && near(a, want)) ? true : `넘어온 ar ${JSON.stringify(seen)} (기대 ${want.toFixed(4)})`;
});

/* T11·T12 — 터치 근접 폴백. 조건: 이미 선택된 요소(wasSel) + pointerType touch +
   손잡이 밖 본체. 회전 요소는 .ws-hd 실좌표(우리가 스텁으로 돌려놓은 자리)로 재야 하고,
   외접 모서리(getBoundingClientRect)로 재면 다른 손잡이가 잡히도록 배치한다. */
const prepSel = () => {
  wait(600);
  const n0 = w.document.querySelector('.ws-el.media[data-ws-el]'); if (!n0) return null;
  pe('pointerdown', n0, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointerup', n0, { pointerType: 'touch' });
  wait(600);
  return w.document.querySelector(`.ws-el.media[data-ws-el="${n0.dataset.wsEl}"]`);
};

T('T11 터치 폴백 — 회전 요소는 손잡이 실좌표로 판정 (외접 판정 대조)', () => {
  const b = build(); if (b !== true) return b;
  let n0 = prepSel(); if (!n0) return '미디어 요소 없음';
  const ti = +n0.dataset.wsEl;
  curScene().elements[ti].rot = 90;
  wait(600);
  pe('pointerdown', n0, { pointerType: 'touch', clientX: 0, clientY: 0 });
  pe('pointerup', n0, { pointerType: 'touch' });
  wait(600);
  n0 = w.document.querySelector(`.ws-el.media[data-ws-el="${ti}"]`);
  if (!n0) return '재렌더 소실';
  /* 90° 회전한 200×100 상자: 레이아웃 중심 (100,50), 화면 점유는 50×... 세로로 선다.
     실좌표 스텁 — tl 손잡이는 회전해 (150,0) 부근으로 이동. 외접 rect 는 중심 고정
     세로 상자 (75,-25)~(125,125). 탐침을 (148,2) 에 두면:
       실좌표 판정 → tl (거리 ~2.8)
       외접 모서리 판정 → tr(125,-25) 거리 ~35 > tl'? 외접 tl(75,-25) 거리 ~77 →
       반경 22 밖이라 null — 어느 쪽이든 tl 이 아니다. */
  const HPTS = { tl: [150, 0], tr: [150, 100], br: [50, 100], bl: [50, 0], ml: [100, 0], mr: [100, 100] };
  n0.getBoundingClientRect = () => ({ left: 75, top: -25, width: 50, height: 150, right: 125, bottom: 125, x: 75, y: -25 });
  n0.querySelectorAll('.ws-hd').forEach((h2) => {
    const k = [...h2.classList].find((c) => c !== 'ws-hd');
    const p = HPTS[k] || [0, 0];
    h2.getBoundingClientRect = () => ({ left: p[0] - 4, top: p[1] - 4, width: 8, height: 8, right: p[0] + 4, bottom: p[1] + 4, x: p[0] - 4, y: p[1] - 4 });
  });
  /* 대조군 먼저 — 외접 모서리 판정이었다면 무엇이 나오는가 */
  const legacyPick = L.handleAt(n0.getBoundingClientRect(), 148, 2);
  if (legacyPick === 'tl') return '대조 배치 오류: 외접 판정도 tl — 계약이 아무것도 증명 못 함';
  let got = null;
  const origR = L.resizeTo;
  L.resizeTo = function (el, handle) { got = handle; return origR.apply(this, arguments); };
  try {
    pe('pointerdown', n0, { pointerType: 'touch', clientX: 148, clientY: 2 });
    pe('pointermove', n0, { pointerType: 'touch', clientX: 152, clientY: 8 });
    pe('pointerup', n0, { pointerType: 'touch' });
  } finally { L.resizeTo = origR; }
  delete curScene().elements[ti].rot;
  if (got == null) return `리사이즈 미발동 (판정 결과 없음 — 외접 판정이면 ${legacyPick === null ? 'null=이동' : legacyPick})`;
  return got === 'tl' ? true : `실좌표 tl 이어야 하는데 ${got} (외접 판정 잔존: ${legacyPick})`;
});

T('T12 터치 폴백 — rot=0 은 종전 handleAt 경로 그대로', () => {
  const b = build(); if (b !== true) return b;
  let n0 = prepSel(); if (!n0) return '미디어 요소 없음';
  n0.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0 });
  let ptsUsed = 0, atUsed = 0;
  const oP = L.handleAtPts, oA = L.handleAt;
  L.handleAtPts = function () { ptsUsed++; return oP.apply(this, arguments); };
  L.handleAt = function () { atUsed++; return oA.apply(this, arguments); };
  try {
    pe('pointerdown', n0, { pointerType: 'touch', clientX: 3, clientY: 3 });
    pe('pointerup', n0, { pointerType: 'touch' });
  } finally { L.handleAtPts = oP; L.handleAt = oA; }
  if (!atUsed) return 'handleAt 미호출 — 폴백 자체가 사라짐';
  /* handleAt 이 내부적으로 handleAtPts 에 위임하므로, 「직접 호출 0」이 아니라
     「handleAt 경유 없이 단독 호출된 적 없음」을 잰다: pts 호출수 ≤ at 호출수 */
  return ptsUsed <= atUsed ? true : `rot=0 인데 handleAtPts 단독 경로 사용 (${ptsUsed} > ${atUsed})`;
});

console.log(`\nR109: ${pass}/${pass + fail} PASS${fail ? ' · ' + fail + ' FAIL' : ''}`);
process.exit(fail ? 1 : 0);
