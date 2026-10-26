/* gate_g4s2_math_u6.js — 4학년 2학기 수학 6단원 「평면도형의 이동」 케이티처 2세대 게이트 (193차, 베프 — u5 게이트 틀 + 이동 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다. 부품의 data-op·data-st 를 믿지 않고, 렌더된 점·다각형 좌표를 칸으로 되돌려
   게이트 자체 이동 셈(밀기 = 칸 더하기 · 뒤집기·돌리기 = 감싸는 정사각형 한가운데 기준 · 돌리기는 회전 행렬)과 대조한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4s2 u5_l09 → l01 → … → l07)
   E 문제 정답 재계산 — 글 셈(방향별 칸 합·되돌리기·cm↔칸·직각·90°×n·360−x·뒤집기 홀짝·뒤집은 횟수·무늬 칸 곱·n−1) +
     그림 셈(렌더된 점·다각형·「?」 자리를 다시 재어: 둘레 자리 · 옮긴 방향·칸 · 바르게 말한 사람 · 옮긴 점 찾기 · 자동차 보기 글대로 밀기 ·
     퍼즐 튀어나온 쪽 · 가~라 고르기 · 돌린 각 · 잘못 말한 사람 · 무늬 줄 만든 방법 · 빈칸 = 윗칸을 어떻게 한 것) · 뜻 낱말은 개념 글에서 만든 사전
   F 식 전수
   G 그림(점·다각형 = 게이트 셈 · 이동 전 = 재료 · wrong 그림은 신고 이동과 다름 · 모눈 안 · 자동차 겹침 0 · 무늬 칸 = 밑모양에 줄·칸 이동을 게이트가 거듭 적용
     · 글자 변환 · 개념 글 주장(둘레 자리 · 옮긴 칸 · 깃발 천 · 창문 · 같은 모양 두 말 · 뒤집기≠돌리기))
   H 재료 충실(차단 어휘 「결과」→「모양」 같은 표로 원문을 바꿔 대조) · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_math_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g4s2_math_u6.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u6.json'), 'utf8'));
const KEYS = Array.from({ length: 7 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
/* 생성기와 같은 차단 어휘 표 — 원문을 이 표로 바꿔 대조(H) */
const FIX = [['결과가 **같습니다**', '모양이 **같습니다**'], ['결과가 같습니다', '모양이 같습니다'], ['결과가 달라져요', '모양이 달라져요'], ['결과가 같고', '모양이 같고'], ['결과가 같아 보이는', '모양이 같아 보이는'], ['결과가 서로 달라요', '모양이 서로 달라요'], ['같은 결과를', '같은 모양을']];
const fix = (t) => FIX.reduce((s, [a, b]) => s.split(a).join(b), String(t));

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '평면도형의 이동', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const R2 = (v) => Math.round(v * 100) / 100 + 0;

/* ══ 게이트 자체 이동 셈 (부품 코드와 따로 짬) ══ */
const DIR = { 위쪽: [0, -1], 아래쪽: [0, 1], 왼쪽: [-1, 0], 오른쪽: [1, 0] };
const EN = { up: '위쪽', down: '아래쪽', left: '왼쪽', right: '오른쪽' };
const OPP = { 위쪽: '아래쪽', 아래쪽: '위쪽', 왼쪽: '오른쪽', 오른쪽: '왼쪽' };
const allPts = (parts) => [].concat(...parts.map(p => p.p));
function sq(parts) { const P = allPts(parts); const xs = P.map(q => q[0]), ys = P.map(q => q[1]); const x0 = Math.min(...xs), y0 = Math.min(...ys); const s = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0); return { x0, y0, s, cx: x0 + s / 2, cy: y0 + s / 2 }; }
const mapP = (parts, f) => parts.map(p => ({ p: p.p.map(q => f(q[0], q[1]).map(R2)), c: p.c || 'a' }));
/* 돌리기: 화면(아래쪽이 +y)에서 시계 방향 θ = 회전 행렬 [[cos −sin],[sin cos]] */
function rotCW(parts, deg) { const B = sq(parts), t = deg * Math.PI / 180, c = Math.round(Math.cos(t)), s = Math.round(Math.sin(t)); return mapP(parts, (x, y) => { const dx = x - B.cx, dy = y - B.cy; return [B.cx + dx * c - dy * s, B.cy + dx * s + dy * c]; }); }
const cwOf = (op) => (op.dir === 'cw' ? op.deg : 360 - op.deg) % 360;
function gApply(parts, op) {
  if (!op || op.t === 'none') return mapP(parts, (x, y) => [x, y]);
  if (op.t === 'slide') { let dx = 0, dy = 0; op.steps.forEach(([d, n]) => { const v = DIR[EN[d]]; dx += v[0] * n; dy += v[1] * n; }); return mapP(parts, (x, y) => [x + dx, y + dy]); }
  const B = sq(parts);
  if (op.t === 'flip') return (op.dir === 'left' || op.dir === 'right') ? mapP(parts, (x, y) => [2 * B.cx - x, y]) : mapP(parts, (x, y) => [x, 2 * B.cy - y]);
  if (op.t === 'turn') return rotCW(parts, cwOf(op));
  throw new Error('이동 ' + op.t);
}
const key = (parts) => JSON.stringify(parts.map(p => [p.c, p.p.map(q => q.map(R2).join(',')).sort()]));
const exact = (a, b) => key(a) === key(b);
function normP(parts) { const P = allPts(parts); const x0 = Math.min(...P.map(q => q[0])), y0 = Math.min(...P.map(q => q[1])); return mapP(parts, (x, y) => [x - x0, y - y0]); }
const sameShape = (a, b) => key(normP(a)) === key(normP(b));
const inGrid = (parts, cols, rows) => allPts(parts).every(q => q[0] >= 0 && q[1] >= 0 && q[0] <= cols && q[1] <= rows);

/* ══ 렌더된 그림을 다시 잼 ══ */
const num = (el, a) => +el.getAttribute(a);
const polyOf = (el, px, py, C) => ({ p: el.getAttribute('points').trim().split(/\s+/).map(s => s.split(',').map(Number)).map(([x, y]) => [R2((x - px) / C), R2((y - py) / C)]), c: el.getAttribute('data-col') });
function measurePt(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-mvpt'); ok(svg, '점 이동 svg 없음'); const C = num(svg, 'data-c'); const [px, py] = svg.getAttribute('data-pan').split(',').map(Number); const at = (el, ax, ay, oy) => [R2((num(el, ax) - px) / C), R2((num(el, ay) - (oy || 0) - py) / C)];
  const dots = {}; svg.querySelectorAll('circle.mvd').forEach(c => { dots[c.getAttribute('data-k')] = at(c, 'cx', 'cy'); });
  const marks = [...svg.querySelectorAll('circle.mvm')].map(c => ({ name: c.getAttribute('data-name'), at: at(c, 'cx', 'cy') }));
  const q = svg.querySelector('text.mvq'); const texts = [...svg.querySelectorAll('text')].map(t => t.textContent);
  return { C, before: dots[0], after: dots[1], marks, q: q ? at(q, 'x', 'y', 10) : null, arrows: svg.querySelectorAll('g.mva').length, texts, svg }; }
function measureFig(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-mvfig'); ok(svg, '도형 이동 svg 없음'); const C = num(svg, 'data-c'); const pan = svg.getAttribute('data-pan').split(';').map(s => s.split(',').map(Number)); const two = svg.getAttribute('data-mode') === 'two';
  const side = (sd, P) => [...svg.querySelectorAll('polygon.mvp[data-side="' + sd + '"]')].map(el => polyOf(el, P[0], P[1], C));
  const before = side('before', pan[0]), after = side('after', two ? pan[1] : pan[0]);
  const q = svg.querySelector('text.mvq'); const qP = two ? pan[1] : pan[0]; const qa = q ? [R2((num(q, 'x') - qP[0]) / C), R2((num(q, 'y') - (two ? 14 : 13) - qP[1]) / C)] : null;
  const ex = svg.querySelector('rect.mvx'); return { C, two, before, after, q: qa, exit: ex ? +ex.getAttribute('data-row') : null, texts: [...svg.querySelectorAll('text')].map(t => t.textContent), arrows: svg.querySelectorAll('g.mva').length, svg }; }
function measureRow(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-mvrow'); ok(svg, '고르기 판 svg 없음');
  return [...svg.querySelectorAll('g.mvri')].map(g => { const C = num(g, 'data-c'); const [px, py] = g.getAttribute('data-pan').split(',').map(Number); return { name: g.getAttribute('data-name'), parts: [...g.querySelectorAll('polygon.mvp')].map(el => polyOf(el, px, py, C)) }; }); }
function measurePat(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-mvpat'); ok(svg, '무늬 svg 없음'); const C = num(svg, 'data-c'); const [px, py] = svg.getAttribute('data-pan').split(',').map(Number);
  const cell = {}; svg.querySelectorAll('polygon.mvpc').forEach(el => { const r = num(el, 'data-r'), c = num(el, 'data-c'); cell[r + ',' + c] = polyOf(el, px + c * C, py + r * C, C).p; });
  return { R: num(svg, 'data-rows'), Cn: num(svg, 'data-cols'), cell, blank: [...svg.querySelectorAll('rect.mvb')].map(b => [num(b, 'data-r'), num(b, 'data-c')]) }; }
function measureChr(f) { const d = docOf(FIG.render(f)); return [...d.querySelectorAll('g.mvc')].map(g => ({ txt: g.getAttribute('data-txt'), tf: g.getAttribute('transform').replace(/translate\([^)]*\)\s*/, '').trim() })); }
const TF = { '': 'none', 'scale(-1 1)': 'flipX', 'scale(1 -1)': 'flipY', 'rotate(90)': 'turn90', 'rotate(180)': 'turn180', 'rotate(270)': 'turn270' };

/* 무늬 칸: 한 칸 안(0~1)에서의 이동 — 게이트 자체 */
const U = { slide: (x, y) => [x, y], none: (x, y) => [x, y], flipX: (x, y) => [1 - x, y], flipY: (x, y) => [x, 1 - y], turn90: (x, y) => [1 - y, x], turn180: (x, y) => [1 - x, 1 - y], turn270: (x, y) => [y, 1 - x] };
const uAp = (pts, op) => pts.map(q => U[op](q[0], q[1]).map(R2));
const uKey = (pts) => pts.map(q => q.map(v => R2(v)).join(',')).sort().join(' ');
const WING = [[0.08, 0.08], [0.92, 0.5], [0.42, 0.5], [0.42, 0.92], [0.08, 0.92]]; // 원문 patGrid 밑모양(날개)
function patExpect(f, r, c) { let p = WING.map(q => q.slice()); for (let i = 0; i < r; i++) p = uAp(p, f.rowOp || 'slide'); for (let i = 0; i < c; i++) p = uAp(p, f.colOp || 'slide'); return p; }

/* 낱말 → 이동 */
function opOfText(o) { if (/크기|색/.test(o)) return null; if (/뒤집지 않고 밀었|밀기|밀어/.test(o)) return 'slide'; if (/그대로/.test(o)) return 'none';
  if (/(위쪽|아래쪽)(으로만|으로)? ?뒤집|위쪽이나 아래쪽으로 뒤집/.test(o)) return 'flipY'; if (/(왼쪽|오른쪽)(이나 오른쪽)?으로 뒤집/.test(o)) return 'flipX';
  const m = o.match(/시계 (반대 )?방향으로 (\d+)°/); if (m) { const d = +m[2] % 360; return 'turn' + ((m[1] ? 360 - d : d) % 360); } return undefined; }
const opToFig = (o) => (o === 'flipX' ? { t: 'flip', dir: 'left' } : o === 'flipY' ? { t: 'flip', dir: 'up' } : /^turn/.test(o) ? { t: 'turn', dir: 'cw', deg: +o.slice(4) } : { t: 'none' });
const pick = (opts, fn) => { if (!opts) return null; const hit = opts.map((o, i) => (fn(clean(o.text)) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };
const movesIn = (t) => [...t.matchAll(/(위쪽|아래쪽|왼쪽|오른쪽)으로 (\d+) ?(칸|cm)/g)].map(m => [m[1], +m[2]]);
const netOf = (mv) => mv.reduce((a, [d, n]) => [a[0] + DIR[d][0] * n, a[1] + DIR[d][1] * n], [0, 0]);
const dirSay = (dx, dy, u) => [dx ? (dx > 0 ? '오른쪽' : '왼쪽') + '으로 ' + Math.abs(dx) + u : '', dy ? (dy > 0 ? '아래쪽' : '위쪽') + '으로 ' + Math.abs(dy) + u : ''].filter(Boolean);
const KO_CAR = { c: '노란색', p: '파란색', g: '초록색', v: '보라색' };
const boxOf = (pt) => { const xs = pt.p.map(q => q[0]), ys = pt.p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
const hitB = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
/* 자동차 탈출: 보기 글대로 한 칸씩 밀어 보고 출구 길이 열리는지 */
function carsRun(M, cols, rows, text) { const cars = {}; M.after.forEach(pt => { cars[pt.c] = boxOf(pt); }); const name2c = {}; Object.keys(KO_CAR).forEach(c => { name2c[KO_CAR[c]] = c; });
  const mv = [...text.matchAll(/(\S+색) 자동차를 (위쪽|아래쪽|왼쪽|오른쪽)으로 (\d+)칸/g)]; if (!mv.length) return false;
  for (const [, nm, d, n] of mv) { const c = name2c[nm]; if (!cars[c]) return false; for (let i = 0; i < +n; i++) { const b = cars[c], v = DIR[d]; const nb = [b[0] + v[0], b[1] + v[1], b[2] + v[0], b[3] + v[1]]; if (nb[0] < 0 || nb[1] < 0 || nb[2] > cols || nb[3] > rows) return false; if (Object.keys(cars).some(o => o !== c && hitB(nb, cars[o]))) return false; cars[c] = nb; } }
  const y = cars.c; if (!(y[1] === M.exit && y[3] === M.exit + 1)) return false; const lane = [y[2], M.exit, cols, M.exit + 1]; return !Object.keys(cars).some(o => o !== 'c' && hitB(lane, cars[o])); }
/* 퍼즐 조각: 튀어나온 쪽 = 그 쪽 끝 꼭짓점들이 차지하는 폭이 가장 좁은 쪽 */
function bumpSide(parts) { const P = allPts(parts); const xs = P.map(q => q[0]), ys = P.map(q => q[1]); const span = (sel, ax) => { const v = P.filter(sel).map(q => q[ax]); return Math.max(...v) - Math.min(...v); };
  const S = { 왼쪽: span(q => q[0] === Math.min(...xs), 1), 오른쪽: span(q => q[0] === Math.max(...xs), 1), 위쪽: span(q => q[1] === Math.min(...ys), 0), 아래쪽: span(q => q[1] === Math.max(...ys), 0) }; const mn = Math.min(...Object.values(S)); const hit = Object.keys(S).filter(k => S[k] === mn); return hit.length === 1 ? hit[0] : null; }

/* 그림에서 답을 셈 (undefined = 그림으로 셀 문제 아님 · null = 하나로 안 정해짐) */
function figAns(f, q0, d) { if (!f) return undefined; const t = clean(q0); let m;
  if (f.k === 'mvpt') { const M = measurePt(f);
    if ((m = t.match(/점 (\S+)의 (위쪽|아래쪽|왼쪽|오른쪽)에 있는 것은/))) { const v = DIR[m[2]]; const hit = M.marks.filter(k => { const dx = k.at[0] - M.before[0], dy = k.at[1] - M.before[1]; return (v[0] ? Math.sign(dx) === v[0] && dy === 0 : Math.sign(dy) === v[1] && dx === 0); }); return hit.length === 1 && d ? pick(d.options, o => o === hit[0].name) : null; }
    if ((m = t.match(/(위쪽|아래쪽|왼쪽|오른쪽)으로 몇 칸 떨어진/))) { ok(M.q, '「?」 없음'); const dx = M.q[0] - M.before[0], dy = M.q[1] - M.before[1]; const v = DIR[m[1]]; return { num: v[0] ? dx * v[0] : dy * v[1] }; }
    if (/어떻게 옮겼나요/.test(t) && d) { ok(M.after, '이동 후 점 없음'); const say = dirSay(M.after[0] - M.before[0], M.after[1] - M.before[1], /cm/.test(t) ? ' cm' : '칸'); return say.length === 1 ? pick(d.options, o => o === say[0]) : null; }
    if (/바르게 설명한 사람을 모두/.test(t) && d) { ok(M.after, '이동 후 점 없음'); const net = [M.after[0] - M.before[0], M.after[1] - M.before[1]]; const good = [...t.matchAll(/(\S+) 「([^」]+)」/g)].filter(x => SAME(netOf(movesIn(x[2])), net)).map(x => x[1]);
      return pick(d.options, o => SAME(o.split(/이?와 /).map(s => s.replace(/이$/, '')).sort(), good.slice().sort())); }
    if ((m = t.match(/점 (\S+)을 (.+?)을? 때의 점은 어느 것/)) && d) { const n = netOf(movesIn(m[2])); const to = [M.before[0] + n[0], M.before[1] + n[1]]; const hit = M.marks.filter(k => SAME(k.at, to)); return hit.length === 1 ? pick(d.options, o => o === '점 ' + hit[0].name) : null; }
    return undefined; }
  if (f.k === 'mvfig') { const M = measureFig(f); const cols = f.cols, rows = f.rows;
    if (/자동차를 출구로/.test(t) && d) return pick(d.options, o => carsRun(M, cols, rows, o));
    if (/조각을 어떻게 해야 빈 곳에 맞을/.test(t) && d) { const piece = M.before; ok(piece.length, '조각 없음'); const want = (t.match(/튀어나온 부분이 (위쪽|아래쪽|왼쪽|오른쪽)/) || [])[1]; ok(bumpSide(piece) === (t.match(/조각은 (위쪽|아래쪽|왼쪽|오른쪽)/) || [])[1], '조각 튀어나온 쪽 ≠ 글');
      const CLS = { slide: [{ t: 'none' }], flip: [{ t: 'flip', dir: 'left' }, { t: 'flip', dir: 'up' }], turn: [90, 180, 270].map(g => ({ t: 'turn', dir: 'cw', deg: g })) }; const fits = Object.keys(CLS).filter(k => CLS[k].some(op => bumpSide(gApply(piece, op)) === want));
      return fits.length === 1 ? pick(d.options, o => (fits[0] === 'slide' ? /밀어/ : fits[0] === 'flip' ? /뒤집/ : /돌려/).test(o)) : null; }
    if ((m = t.match(/처음 자리보다 (위쪽|아래쪽|왼쪽|오른쪽)으로 몇 칸/)) && M.q && M.before.length) { const B = sq(M.before); const v = DIR[m[1]]; const dx = M.q[0] - B.cx, dy = M.q[1] - B.cy; return { num: R2(v[0] ? dx * v[0] : dy * v[1]) }; }
    if (/어느 쪽으로 밀었는지/.test(t) && d) { const B = sq(M.before), A = sq(M.after); ok(sameShape(M.before, M.after), '민 도형 모양이 다름'); const say = dirSay(A.x0 - B.x0, A.y0 - B.y0, '칸'); return say.length === 1 ? pick(d.options, o => say[0].indexOf(o + '으로') === 0) : null; }
    if (/어느 쪽으로 뒤집었는지/.test(t) && d) return pick(d.options, o => { const op = opOfText(o); return op !== undefined && op !== null && sameShape(op === 'slide' ? M.before : gApply(M.before, opToFig(op)), M.after); });
    if (/어떻게 돌렸나요/.test(t) && d) return pick(d.options, o => { const op = opOfText(o); return op && /^turn/.test(op) && sameShape(gApply(M.before, opToFig(op)), M.after); });
    if (/시계 방향으로는 몇 도/.test(t)) { const hit = [90, 180, 270].filter(g => sameShape(rotCW(M.before, g), M.after)); return hit.length === 1 ? { num: hit[0] } : null; }
    if ((m = t.match(/시계 방향으로 (\d+)°만큼 몇 번/))) { let p = M.before; for (let n = 1; n <= 4; n++) { p = rotCW(p, +m[1]); if (sameShape(p, M.after)) return { num: n }; } return null; }
    if (/잘못 설명한 사람/.test(t) && d) { const bad = [...t.matchAll(/(\S+) 「([^」]+)」/g)].filter(x => { const op = opOfText(x[2]); return !(op && sameShape(gApply(M.before, opToFig(op)), M.after)); }).map(x => x[1]);
      return pick(d.options, o => (bad.length === 0 ? /모두 바르게/.test(o) : bad.length === 2 ? /모두 잘못/.test(o) : o === bad[0])); }
    return undefined; }
  if (f.k === 'mvrow' && d) { const R = measureRow(f); const base = R[0].parts; let want;
    if ((m = t.match(/(위쪽|아래쪽|왼쪽|오른쪽)으로 (\d+)칸 민 도형/))) { want = gApply(base, { t: 'slide', steps: [[Object.keys(EN).find(k => EN[k] === m[1]), +m[2]]] }); const hit = R.slice(1).filter(x => exact(x.parts, want)); return hit.length === 1 ? pick(d.options, o => o === hit[0].name) : null; }
    if (/위쪽이나 아래쪽으로 뒤집었을 때/.test(t)) { want = gApply(base, { t: 'flip', dir: 'up' }); const hit = R.slice(1).filter(x => sameShape(x.parts, want)); return hit.length === 1 ? pick(d.options, o => o === hit[0].name) : null; }
    return undefined; }
  if (f.k === 'mvchr' && d && /교실 밖에서/.test(t)) { const C = measureChr(f); ok(C.length === 2 && TF[C[0].tf] === 'none', '글자 판'); const rel = TF[C[1].tf]; return pick(d.options, o => opOfText(o) === rel); }
  if (f.k === 'mvpat' && d) { const P = measurePat(f); const opsOk = (pairs) => (o) => { const op = opOfText(o); return op != null && pairs.every(([a, b]) => uKey(uAp(a, op === 'none' ? 'slide' : op)) === uKey(b)); };
    if (/(이 한 줄|첫 줄)은 어떻게 만들었/.test(t)) { const pr = []; for (let c = 1; c < P.Cn; c++) pr.push([P.cell['0,' + (c - 1)], P.cell['0,' + c]]); ok(pr.every(x => x[0] && x[1]), '첫 줄 칸 빔'); return pick(d.options, opsOk(pr)); }
    if (/빈칸에 들어갈 모양은 바로 윗칸/.test(t)) { ok(P.blank.length === 1, '빈칸 수'); const [r, c] = P.blank[0]; const above = P.cell[(r - 1) + ',' + c]; ok(above, '윗칸 없음'); return pick(d.options, opsOk([[above, patExpect(f, r, c)]])); }
    return undefined; }
  return undefined; }

/* 글에서 답을 셈 */
const KN = { 한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5 };
/* 뜻 사전 — 이 단원 개념 글(「도형을 ~면 모양은 변하지 않고 ~이 변합니다」 · 「점을 옮기면 자리가 변해요」)에서 만든다 */
const MEAN = {}; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const t = clean(s.data.title + ' ' + s.data.content); let m; const re = /도형을 (밀|뒤집으|돌리)면 모양은 변하지 않고 (자리|방향)[이가] 변합니다/g; while ((m = re.exec(t))) MEAN[m[1]] = m[2]; if ((m = t.match(/점을 옮기면 (자리)가 변해요/))) MEAN.옮기 = m[1]; }));
let nDef = 0;
function textAns(q0, d) { const t = clean(q0); let m;
  if ((m = t.match(/(점|도형|자동차)[을를] (옆으로 )?(옮기|밀|뒤집으|돌리)면 \S+ 무엇이 (변할|바뀔)/))) { nDef++; return MEAN[m[3]] ? { word: MEAN[m[3]] } : null; }
  if ((m = t.match(/직각 (두|세|네) 개를 합한 크기/))) return { num: KN[m[1]] * 90 };
  if (/직각의 크기는 몇 도/.test(t)) return { num: 90 };
  if ((m = t.match(/한 칸이 (\d+) cm인 모눈에서 .*?(\d+) cm 옮겼.*몇 칸/))) return { num: +m[2] / +m[1] };
  if ((m = t.match(/(위쪽|아래쪽|왼쪽|오른쪽)으로 (\d+)번 뒤집었어요\. 한 번만 뒤집은 것과 같으면 1/))) return { num: +m[2] % 2 };
  if (/모두 몇 번 뒤집었/.test(t)) { const n = [...t.matchAll(/(한|두|세|네) 번/g)].reduce((a, x) => a + KN[x[1]], 0); return n ? { num: n } : null; }
  if ((m = t.match(/시계 (반대 )?방향으로 (\d+)°만큼 돌리기를 (\d+)번 하면 모두 몇 도/))) return { num: +m[2] * +m[3] };
  if ((m = t.match(/(\d+)°만큼 돌리는 것은 시계 방향으로 (\d+)°만큼 몇 번/))) return { num: +m[1] / +m[2] };
  if ((m = t.match(/시계 (반대 )?방향으로 (\d+)°만큼 돌(린 것은|리면).*시계 (반대 )?방향으로(는)? 몇 도/))) { const d0 = +m[2] % 360; return { num: (!!m[1] === !!m[4] ? d0 : (360 - d0) % 360) }; }
  if ((m = t.match(/한 줄에 모양이 (\d+)개씩 있고 줄이 (\d+)개/))) return { num: +m[1] * +m[2] };
  if ((m = t.match(/(\d+)칸짜리 한 줄을 만들었어요\. (돌리기|뒤집기)를 몇 번/))) return { num: +m[1] - 1 };
  if ((m = t.match(/(\d+)°씩 돌리기를 되풀이하면 몇 번 만에 처음 모양/))) return { num: 360 / +m[1] };
  const mv = movesIn(t), n = netOf(mv);
  if ((m = t.match(/(위쪽|아래쪽|왼쪽|오른쪽)으로 몇 칸 밀면 처음 자리로/))) { const v = DIR[m[1]]; const back = -(v[0] ? n[0] * v[0] : n[1] * v[1]); return back > 0 && (v[0] ? n[1] === 0 : n[0] === 0) ? { num: back } : null; }
  if ((m = t.match(/처음 자리(보다|에서) (위쪽|아래쪽|왼쪽|오른쪽)으로 (모두 )?몇 칸/))) { const v = DIR[m[2]]; const r = v[0] ? n[0] * v[0] : n[1] * v[1]; return r > 0 ? { num: r } : null; }
  if (/모두 몇 칸/.test(t) && mv.length >= 2) return { num: mv.reduce((a, x) => a + x[1], 0) };
  return undefined; }
function optOf(res, d) { if (!res || res.opt != null || !d || !d.options) return res; if (res.num != null) return pick(d.options, o => parseFloat(o) === res.num) || res; return res; }
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(got === res.num, where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('7차시 키 u6_l01~l07 · 파일 data/g4s2_math_u6.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 6단원 평면도형의 이동 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 6 && m.unit_title === '평면도형의 이동' && /평면도형의 이동/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\/6단원_평면도형의이동\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소 · 곰이·펭이(4학년)', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); ok(/곰이/.test(JSON.stringify(sl[2].data)) && /펭이/.test(JSON.stringify(sl[2].data)), '동기 곰이·펭이'); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u5_l09.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4s2_math u5_l09(5단원 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_math:u5_l09'), 'from ' + rv.from); }));
T('u5_l09 「다음 단원엔」 = 평면도형의 이동', () => { const nx = PREV.u5_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /평면도형의 이동/.test(nx.preview), nx.preview); });

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question, d); if (ta) ta = optOf(ta, d); let fa = d.fig ? figAns(d.fig, d.question, d) : undefined; if (fa) fa = optOf(fa, d);
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; ok(r !== undefined, s.id + ' 셀 수 없음 「' + d.question.slice(0, 30) + '」'); nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 56 전부(원문 대조 0 · 못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 19 · 글·그림 둘 다 셈해 대조 ≥ 2 · 뜻 사전 ≥ 5', () => ok(nCheck === 56 && !unread.length && nFigQ >= 19 && nBoth >= 2 && nDef >= 5 && Object.keys(MEAN).length === 4, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 뜻 사전 ' + nDef + ' ' + JSON.stringify(MEAN) + ' · 못 읽음 ' + unread.join(' | ')));
T('셈기 자체 확인 — 틀린 그림·틀린 답 잡음', () => { let caught = 0;
  const pt = { k: 'mvpt', cols: 9, rows: 8, pt: [4, 6], name: 'ㄴ', steps: [['up', 4]], cell: '1 cm' }; const dd = { options: [{ text: '위쪽으로 4 cm', correct: true }, { text: '아래쪽으로 4 cm' }] };
  ok(SAME(figAns(pt, '점 ㄴ을 어떻게 옮겼나요? (모눈 한 칸은 1 cm 예요)', dd), { opt: 0 }), '점 이동 읽기');
  const pt2 = Object.assign({}, pt, { steps: [['up', 3]] }); if (!SAME(figAns(pt2, '점 ㄴ을 어떻게 옮겼나요? (모눈 한 칸은 1 cm 예요)', dd), { opt: 0 })) caught++;
  const quad = [{ p: [[2, 2], [5, 2], [6, 5], [2, 5]], c: 'a' }]; const tw = { k: 'mvfig', cols: 8, rows: 7, op: { t: 'turn', dir: 'cw', deg: 90 }, sh: quad }; const d2 = { options: [{ text: '시계 방향으로 90°', correct: true }, { text: '시계 반대 방향으로 90°' }] };
  ok(SAME(figAns(tw, '사각형을 어떻게 돌렸나요?', d2), { opt: 0 }), '돌린 각');
  if (!SAME(figAns(Object.assign({}, tw, { op: { t: 'turn', dir: 'ccw', deg: 90 } }), '사각형을 어떻게 돌렸나요?', d2), { opt: 0 })) caught++;
  try { checkAns('probe', textAns('시계 반대 방향으로 270°만큼 돌린 것은 시계 방향으로 몇 도만큼 돌린 것과 같을까요?'), null, '270'); } catch (e) { caught++; }
  try { checkAns('probe', textAns('도형을 아래쪽으로 3번 뒤집었어요. 한 번만 뒤집은 것과 같으면 1, 뒤집지 않은 것과 같으면 0을 써 볼까요?'), null, '0'); } catch (e) { caught++; }
  ok(caught === 4, '잡은 수 ' + caught); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key2 => walk(o[key2], where + '.' + key2)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u6_l01\.slides\.1\.data\.items\./.test(where);
const CHR = /(?<![\d.])(\(?\d+(?:\.\d+)?(?:\s*[+\-×÷]\s*\(?\d+(?:\.\d+)?\)?)+\)?)\s*=\s*(\d+(?:\.\d+)?)(?![\d.])/g;
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)\s*(cm|개|°|도|칸|번|명)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CHR.lastIndex = 0; while ((m = CHR.exec(s))) { let lhs = m[1]; const o = (lhs.match(/\(/g) || []).length, c = (lhs.match(/\)/g) || []).length; if (o !== c) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const e = lhs.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(e)) continue; const v = Function('return (' + e + ')')(); nEq++; if (Math.abs(v - +m[2]) > 1e-9) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 15, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['6 + 2 = 9', '360 − 270 = 80', '90 + 180 = 260'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('6 + 2 = **8** 칸 · 360 − 270 = **90**', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
T('개념 28장 모두 그림 · 기본 문제 그림 21 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length === 21, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { pt: 0, fig: 0, poly: 0, wrong: 0, row: 0, cell: 0, chr: 0, cars: 0, claim: 0 };
function checkPt(w0, f, b) { const M = measurePt(f); nG.pt++; ok(SAME(M.before, f.pt), w0 + ' 이동 전 점 ' + M.before + ' ≠ ' + f.pt);
  const mv = (f.steps || []).map(([d, n]) => [EN[d], n]); const n = netOf(mv); const to = [f.pt[0] + n[0], f.pt[1] + n[1]]; ok(to[0] >= 0 && to[1] >= 0 && to[0] <= f.cols && to[1] <= f.rows, w0 + ' 모눈 밖');
  const show = f.show || (mv.length ? 'both' : 'before');
  if (show === 'both') { if (f.ask) { ok(!M.after && SAME(M.q, to), w0 + ' 「?」 자리 ' + M.q + ' ≠ ' + to); ok(M.arrows === 0, w0 + ' 찾을 문제에 화살표'); } else { ok(SAME(M.after, to), w0 + ' 이동 후 점 ' + M.after + ' ≠ 게이트 셈 ' + to); ok(M.arrows === mv.length, w0 + ' 화살표 ' + M.arrows); } } else ok(!M.after && !M.q, w0 + ' 이동 전만인데 이동 후 있음');
  (f.mark || []).forEach(([x, y, nm]) => ok(M.marks.some(k => k.name === nm && SAME(k.at, [x, y])), w0 + ' 표시 ' + nm));
  if (f.cell) ok(M.texts.indexOf(f.cell) >= 0, w0 + ' 한 칸 길이 표시'); return M; }
function checkFig(w0, f) { const M = measureFig(f); nG.fig++; const op = f.op || { t: 'none' }, drawn = f.wrong || op; const want = gApply(f.sh, drawn); nG.poly += f.sh.length;
  ok(inGrid(f.sh, f.cols, f.rows) && inGrid(want, f.cols, f.rows), w0 + ' 모눈 밖');
  const mode = f.mode || 'two', only = f.only === 'after';
  if (mode === 'two' || !only) ok(exact(M.before, f.sh), w0 + ' 이동 전 ≠ 재료'); else ok(!M.before.length, w0 + ' 이동 후만인데 이동 전 있음');
  if (f.ask) { ok(!M.after.length && M.q, w0 + ' 찾을 문제인데 이동 후 그림 · 「?」 없음'); const A = sq(want); const at = mode === 'two' ? [f.cols / 2, f.rows / 2] : [A.cx, A.cy]; ok(SAME(M.q, at), w0 + ' 「?」 자리 ' + M.q + ' ≠ ' + at); }
  else ok(exact(M.after, want), w0 + ' 이동 후 ≠ 게이트 셈 ' + key(M.after) + ' / ' + key(want));
  if (f.wrong) { nG.wrong++; ok(!sameShape(gApply(f.sh, op), want), w0 + ' 잘못 그린 그림이 신고한 이동과 같음'); }
  ok(M.svg.getAttribute('data-op') && M.svg.getAttribute('data-drawn'), w0 + ' data-op');
  if (f.exit != null) { nG.cars++; ok(M.exit === f.exit, w0 + ' 출구 줄'); const B = M.after.map(boxOf); B.forEach((a, i) => B.forEach((b2, j) => { if (i < j) ok(!hitB(a, b2), w0 + ' 자동차 겹침 ' + i + '·' + j); })); const yc = M.after.find(p => p.c === 'c'); ok(yc && boxOf(yc)[1] === f.exit, w0 + ' 노란 차가 출구 줄에 없음'); ok(!carsRun(M, f.cols, f.rows, '노란색 자동차를 오른쪽으로 0칸'), w0 + ' 처음부터 길이 열림'); }
  if (f.title) ok(M.texts.indexOf(f.title) >= 0, w0 + ' 제목'); (f.labels || []).forEach(lb => ok(M.texts.indexOf(lb) >= 0, w0 + ' 이름표 ' + lb)); return M; }
figs.forEach(([w0, f, b]) => { if (f.k === 'mvpt') T(w0 + ' 점 이동 — 렌더 점 = 게이트 셈 · 표시 · 「?」 자리', () => checkPt(w0, f, b)); if (f.k === 'mvfig') T(w0 + ' 도형 이동 — 렌더 다각형 = 게이트 셈 · 이동 전 = 재료 · 모눈 안' + (f.wrong ? ' · 잘못 그린 그림 ≠ 신고' : '') + (f.exit != null ? ' · 자동차' : ''), () => checkFig(w0, f)); });
T('고르기 판 — 각 칸 다각형 = 게이트 셈(기준 칸 = 재료) · 같은 모양 칸 중복 0', () => figs.forEach(([w0, f]) => { if (f.k !== 'mvrow') return; nG.row++; const R = measureRow(f); ok(R.length === f.items.length, w0 + ' 칸 수'); R.forEach((x, i) => { const it = f.items[i]; ok(x.name === it.name, w0 + ' 이름'); ok(exact(x.parts, gApply(it.fig.sh, it.fig.op)), w0 + ' ' + x.name + ' 그림 ≠ 게이트 셈'); }); const ks = R.slice(1).map(x => key(x.parts)); ok(new Set(ks).size === ks.length, w0 + ' 보기 그림 겹침'); }));
T('무늬 판 — 칸마다 렌더 모양 = 밑모양(날개)에 줄 이동·칸 이동을 게이트가 거듭 적용 · 빈칸 자리', () => figs.forEach(([w0, f]) => { if (f.k !== 'mvpat') return; const P = measurePat(f); ok(P.R === f.rows && P.Cn === f.cols, w0 + ' 판 크기'); ok(uKey(P.cell['0,0']) === uKey(WING), w0 + ' 첫 칸 ≠ 밑모양');
  for (let r = 0; r < P.R; r++) for (let c = 0; c < P.Cn; c++) { const bl = (f.blank || []).some(b => b[0] === r && b[1] === c); if (bl) { ok(!P.cell[r + ',' + c], w0 + ' 빈칸에 모양'); continue; } nG.cell++; ok(uKey(P.cell[r + ',' + c]) === uKey(patExpect(f, r, c)), w0 + ' 칸 ' + r + ',' + c); }
  ok(SAME(P.blank, f.blank || []), w0 + ' 빈칸'); }));
T('글자·도장 — 렌더 변환 = 신고 이동', () => figs.forEach(([w0, f]) => { if (f.k !== 'mvchr') return; const C = measureChr(f); ok(C.length === f.items.length, w0 + ' 수'); C.forEach((x, i) => { nG.chr++; ok(x.txt === f.items[i].txt && TF[x.tf] === (f.items[i].op || 'none'), w0 + ' ' + x.txt + ' ' + x.tf); }); }));
/* 개념 글 주장 = 그림 */
const cOf = (k, n) => L[k].slides[2 + n].data; const cent = (pts) => [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
const sideOf = (part, all) => { const B = sq(all), [x, y] = cent(part.p); const dx = x - B.cx, dy = y - B.cy; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '오른쪽' : '왼쪽') : (dy > 0 ? '아래쪽' : '위쪽'); };
T('개념 글 주장 = 그림 — 둘레 자리 · 옮긴 방향·칸 · 자동차 막힘 · 깃발 천 · 창문 · 같은 모양 두 말 · 뒤집기≠돌리기', () => {
  { const d = cOf('u6_l01', 1), M = measurePt(d.fig), t = clean(d.content); [...t.matchAll(/(왼쪽|오른쪽|위쪽|아래쪽)에는 (\S)/g)].forEach(([, sd, nm]) => { nG.claim++; const k = M.marks.find(x => x.name === nm); const v = DIR[sd]; ok(k && Math.sign(k.at[0] - M.before[0]) === v[0] && Math.sign(k.at[1] - M.before[1]) === v[1], 'l01 ' + sd + ' ' + nm); }); }
  { const d = cOf('u6_l01', 4), M = measureFig(d.fig), t = clean(d.content); const Y = boxOf(M.after.find(p => p.c === 'c')); const lane = M.after.filter(p => p.c !== 'c').map(p => [p.c, boxOf(p)]).filter(([, b]) => b[1] < Y[3] && Y[1] < b[3] && b[0] >= Y[2]).sort((a, b) => a[1][0] - b[1][0]); nG.claim++; ok(lane.length && KO_CAR[lane[0][0]] + ' 자동차가 막고' === (t.match(/(\S+색 자동차)가 막고/) || [])[1] + '가 막고', 'l01 막는 차');
    const bl = lane[0][1]; const under = M.after.filter(p => { const b = boxOf(p); return b[1] === bl[3] && b[0] < bl[2] && bl[0] < b[2]; }); nG.claim++; ok(under.length === 1 && t.indexOf('그 아래를 ' + KO_CAR[under[0].c] + ' 자동차') >= 0, 'l01 아래 차'); }
  [['u6_l02', 1], ['u6_l02', 2], ['u6_l02', 3], ['u6_l02', 4], ['u6_l07', 1]].forEach(([k, n]) => { const d = cOf(k, n), t = clean(d.content), M = measurePt(d.fig); const say = dirSay(M.after[0] - M.before[0], M.after[1] - M.before[1], /cm/.test(d.fig.cell || '') && /cm/.test(t) ? ' cm' : '칸'); say.forEach(sy => { nG.claim++; ok(t.indexOf(sy) >= 0, k + ' s0' + (3 + n) + ' 글에 「' + sy + '」 없음'); }); });
  [['u6_l03', 3], ['u6_l03', 4], ['u6_l07', 2]].forEach(([k, n]) => { const d = cOf(k, n), t = clean(d.content), M = measureFig(d.fig); const B = sq(M.before), A = sq(M.after); dirSay(A.x0 - B.x0, A.y0 - B.y0, '칸').forEach(sy => { nG.claim++; ok(t.indexOf(sy) >= 0, k + ' 글에 「' + sy + '」 없음'); }); });
  [['u6_l03', 1, '오른쪽'], ['u6_l03', 2, '아래쪽']].forEach(([k, n, sd]) => { const d = cOf(k, n), M = measureFig(d.fig); const B = sq(M.before), A = sq(M.after); nG.claim++; ok(dirSay(A.x0 - B.x0, A.y0 - B.y0, '칸').length === 1 && dirSay(A.x0 - B.x0, A.y0 - B.y0, '칸')[0].indexOf(sd) === 0 && clean(d.content).indexOf(sd + '으로') >= 0, k + ' 민 쪽'); });
  { const d = cOf('u6_l04', 1), M = measureFig(d.fig), t = clean(d.content); const m = t.match(/깃발이 달린 쪽이 (왼쪽|오른쪽)에서 (왼쪽|오른쪽)으로/); ok(m, '깃발 글'); const pole = (ps) => ps.find(p => p.c === 'a'), cloth = (ps) => ps.find(p => p.c === 'b');
    const sideC = (ps) => (cent(cloth(ps).p)[0] < cent(pole(ps).p)[0] ? '왼쪽' : '오른쪽'); nG.claim++; ok(sideC(M.before) === m[1] && sideC(M.after) === m[2], 'l04 깃발 천 ' + sideC(M.before) + '→' + sideC(M.after) + ' ≠ 글 ' + m[1] + '→' + m[2]); }
  { const d = cOf('u6_l04', 2), M = measureFig(d.fig); const pole = (ps) => ps.find(p => p.c === 'a'), cloth = (ps) => ps.find(p => p.c === 'b'); nG.claim++; ok((cent(cloth(M.before).p)[0] < cent(pole(M.before).p)[0]) === (cent(cloth(M.after).p)[0] < cent(pole(M.after).p)[0]) && Math.sign(cent(cloth(M.before).p)[1] - cent(pole(M.before).p)[1]) === -Math.sign(cent(cloth(M.after).p)[1] - cent(pole(M.after).p)[1]), 'l04 아래쪽 뒤집기 = 위아래만 바뀜'); }
  { nG.claim++; const q = cOf('u6_l04', 3).fig.sh; ok(exact(gApply(q, { t: 'flip', dir: 'up' }), gApply(q, { t: 'flip', dir: 'down' })) && exact(gApply(q, { t: 'flip', dir: 'left' }), gApply(q, { t: 'flip', dir: 'right' })), 'l04 위쪽 = 아래쪽 뒤집기'); }
  [['u6_l05', 1, '왼쪽'], ['u6_l05', 2, '오른쪽']].forEach(([k, n, sd]) => { const d = cOf(k, n), M = measureFig(d.fig), t = clean(d.content); const win = (ps) => ps.find(p => p.c === 'b'); nG.claim++; ok(/위쪽에 있던 창문/.test(t) && sideOf(win(M.before), M.before) === '위쪽' && sideOf(win(M.after), M.after) === sd && t.indexOf(sd) >= 0, k + ' 창문 ' + sideOf(win(M.before), M.before) + '→' + sideOf(win(M.after), M.after)); });
  { const d = cOf('u6_l05', 3), sh = d.fig.sh; nG.claim++; ok(exact(gApply(sh, { t: 'turn', dir: 'ccw', deg: 90 }), gApply(sh, { t: 'turn', dir: 'cw', deg: 270 })) && exact(gApply(sh, { t: 'turn', dir: 'cw', deg: 180 }), gApply(sh, { t: 'turn', dir: 'ccw', deg: 180 })) && exact(gApply(sh, { t: 'turn', dir: 'cw', deg: 360 }), sh), 'l05 반대 90 = 270 · 180 · 360'); }
  { const d = cOf('u6_l05', 4); nG.claim++; ok(/시계 방향으로 180°만큼 돌린/.test(clean(d.content)) && d.fig.wrong && cwOf(d.fig.wrong) === 180 && !sameShape(gApply(d.fig.sh, { t: 'flip', dir: 'down' }), gApply(d.fig.sh, d.fig.wrong)) && exact(measureFig(d.fig).after, gApply(d.fig.sh, { t: 'turn', dir: 'cw', deg: 180 })), 'l05 친구 그림 = 180° · 뒤집기와 다름'); }
  { const d = cOf('u6_l07', 4), M = measureFig(d.fig); nG.claim++; ok(sameShape(M.after, rotCW(M.before, 270)) && sameShape(M.after, gApply(M.before, { t: 'turn', dir: 'ccw', deg: 90 })), 'l07 270 = 반대 90'); }
  { const d = cOf('u6_l07', 3), C = measureChr(d.fig); nG.claim++; ok(TF[C[0].tf] === 'flipX' && TF[C[1].tf] === 'none' && /좌우를 뒤집어 새겨야/.test(clean(d.content)), 'l07 도장'); }
  { const d = cOf('u6_l04', 4), C = measureChr(d.fig); nG.claim++; ok(TF[C[1].tf] === 'flipX' && /곰/.test(d.content), 'l04 글자'); }
  { const d = cOf('u6_l06', 3), t = clean(d.content); nG.claim++; ok(/네 번 돌리면 처음 모양/.test(t) && uKey(patExpect(d.fig, 0, 4)) === uKey(WING) && [1, 2, 3].every(c => uKey(patExpect(d.fig, 0, c)) !== uKey(WING)), 'l06 네 번 돌리면 처음'); }
  { const d = cOf('u6_l06', 1), t = clean(d.content); nG.claim++; ok(/두 모양이 번갈아/.test(t) && uKey(patExpect(d.fig, 0, 2)) === uKey(WING) && uKey(patExpect(d.fig, 0, 1)) !== uKey(WING), 'l06 번갈아'); }
  ok(nG.claim >= 25, '대조 ' + nG.claim); });
T('퍼즐 — 밀기·뒤집기로는 안 맞고 돌리기로만 맞음 (l01 s11 · l05 s10 같은 조각)', () => { const a = L.u6_l01.slides[10].data.fig, b = L.u6_l05.slides[9].data.fig; ok(exact(a.sh, b.sh), '조각 다름'); const want = bumpSide(gApply(a.sh, a.op)); ok(want === '위쪽', '빈 곳 튀어나온 쪽 ' + want); ok(bumpSide(a.sh) === '오른쪽' && bumpSide(gApply(a.sh, { t: 'flip', dir: 'left' })) !== want && bumpSide(gApply(a.sh, { t: 'flip', dir: 'up' })) !== want, '밀기·뒤집기로 맞음'); ok(bumpSide(measureFig(b).after) === want, 'l05 돌린 조각'); });
T('자동차 — 정답 보기만 길이 열림 · 나머지 보기는 막힘(모눈 밖 · 길 막힘 · 출구 줄 벗어남)', () => { const s = L.u6_l03.slides[9]; const M = measureFig(s.data.fig); s.data.options.forEach(o => ok(carsRun(M, 6, 6, o.text) === !!o.correct, o.text)); });
T('그림 부품 수 — 점 ≥ 10 · 도형 판 ≥ 25 · 잘못 그린 그림 1 · 고르기 판 3 · 무늬 칸 ≥ 60 · 글자 ≥ 6 · 자동차 2', () => ok(nG.pt >= 10 && nG.fig >= 25 && nG.wrong === 1 && nG.row === 3 && nG.cell >= 60 && nG.chr >= 6 && nG.cars === 2, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 점·틀린 다각형·신고와 같은 잘못 그린 그림·겹친 자동차 잡음', () => { let caught = 0; const quad = [{ p: [[2, 2], [5, 2], [6, 5], [2, 5]], c: 'a' }];
  const keep = FIG.render;
  try { const f = { k: 'mvpt', cols: 9, rows: 8, pt: [4, 6], steps: [['up', 4]] }; const h = keep(f).replace(/(<circle class="mvd" data-k="1" cx="[\d.]+" cy=")([\d.]+)/, (a, p, y) => p + (+y + 40)); FIG.render = () => h; checkPt('probe', f); } catch (e) { caught++; } FIG.render = keep;
  try { const f = { k: 'mvfig', cols: 8, rows: 7, op: { t: 'turn', dir: 'cw', deg: 90 }, sh: quad }; const h = keep(Object.assign({}, f, { op: { t: 'turn', dir: 'ccw', deg: 90 } })).replace('data-op="turn:ccw:90"', 'data-op="turn:cw:90"'); FIG.render = () => h; checkFig('probe', f); } catch (e) { caught++; } FIG.render = keep;
  try { checkFig('probe', { k: 'mvfig', cols: 8, rows: 7, op: { t: 'flip', dir: 'up' }, wrong: { t: 'flip', dir: 'down' }, sh: quad }); } catch (e) { caught++; }
  try { checkFig('probe', { k: 'mvfig', cols: 6, rows: 6, mode: 'one', only: 'after', op: { t: 'none' }, exit: 2, sh: [{ p: [[0, 2], [2, 2], [2, 3], [0, 3]], c: 'c' }, { p: [[1, 0], [2, 0], [2, 3], [1, 3]], c: 'p' }] }); } catch (e) { caught++; }
  ok(caught === 4, '잡은 수 ' + caught); });

console.log('═══ H. 재료 충실 ═══');
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
const srcP = (k, q) => SRC[k].problems.find(p => normT(fix(p.q).replace(/인가요\?$/, '일까요?')) === normT(q));
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문(차단 어휘 표만) · 기본 문제 = 자기주도 문제(보기·정답 그대로)', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(fix(x.text)));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(src.slides.some(x => fix(x.title) === s.data.title), s.id + ' 제목 원문 아님'); ok(texts.indexOf(normT(s.data.content)) >= 0 || src.slides.some(x => { const full = normT(fix(x.text)); let at = 0; return String(s.data.content).split('\n').every(ln => { const q = normT(ln); const j = q ? full.indexOf(q, at) : -1; if (j < 0) return false; at = j + q.length; return true; }); }), s.id + ' 원문 아님(원문 문장 순서 부분열도 아님)'); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const p = srcP(k, s.data.question); ok(p, s.id + ' 문제 원문 아님'); if (p.opts) ok(JSON.stringify(s.data.options.map(o => o.text)) === JSON.stringify(p.opts) && s.data.options[p.ci].correct, s.id + ' 보기·정답'); else ok(s.data.answer === +p.a, s.id + ' 답'); }); }));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(nsp); const dup = n.filter((x, j) => n.indexOf(x) !== j); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));
T('기본 문제는 「결과」 든 원문 문제를 고르지 않음 · 고친 개념 글은 표에 있는 것만', () => KEYS.forEach(k => { L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const p = srcP(k, s.data.question); ok(JSON.stringify(p).indexOf('결과') < 0, k + ' ' + s.id + ' 「결과」 든 문제'); }); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('마지막 차시 「2학기를 마치며」(학기 끝) · 다른 차시는 「다음 시간엔」 · 차단 어휘 0', () => { const nx = L.u6_l07.slides[18].data; ok(nx.title === '2학기를 마치며' && /2학기/.test(nx.preview), '학기 끝'); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b0 => ok(all.indexOf(b0) < 0, '차단 어휘 ' + b0)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary + SRC[k].title;
/* [낱말, 첫 차시, 원문도 같은 차례인지] — l01(단원 도입)은 원문처럼 밀기·뒤집기·돌리기를 미리 보여 주므로 l02 부터 본다
   · 「뒤집」: 원문 l03 은 고르지 않은 문제의 틀린 보기(「뒤집힌 모양」)에만 있어 원문 대조는 빼고 케이티처만 본다 */
const FIRST = [['밀기', 3, true], ['뒤집', 4, false], ['돌려', 5, true], ['시계 방향', 5, true], ['시계 반대 방향', 5, true], ['180°', 5, true], ['270°', 5, false], ['360°', 5, true], ['무늬', 6, false]];
FIRST.forEach(([w0, n, both]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0' + (both ? ' · 원문도 같은 차례' : '') + ' · 그 차시엔 나옴', () => { KEYS.forEach((k, i) => { if (i + 1 < n && (i > 0 || ['밀기', '뒤집', '돌려'].indexOf(w0) < 0)) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); if (both && i > 0) ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('요약 arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { const nx = FIRST.filter(([, n]) => n > i + 1 && i > 0).map(([w0]) => w0); const ar = JSON.stringify(L[k].slides[16].data); nx.forEach(w0 => ok(ar.indexOf(w0) < 0, k + ' 요약에 「' + w0 + '」')); }));

console.log('\n게이트 g4s2 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
