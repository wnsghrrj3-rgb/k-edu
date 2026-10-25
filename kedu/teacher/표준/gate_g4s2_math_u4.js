/* gate_g4s2_math_u4.js — 4학년 2학기 수학 4단원 「다각형」 케이티처 2세대 게이트 (190차, 베프 — u3 게이트 틀 A~L + 도형 셈).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4s2_math u3_l11 → l01 → … → l09)
   E 문제 정답 재계산 — 게이트 자체 도형 셈: 글에서 셈한 답(이름 ↔ 변 수 · 정N각형 둘레 n×a · 둘레÷n · 대각선 n(n−3)÷2 · 한 꼭짓점 n−3
       · 조각 넓이(정삼각형 단위 hex6·trap3·rhom2·tri1·sq) · 마름모 N개 → 2N · 뜻 낱말 · 「잘못된」 문장 판정)과
       그림에서 셈한 답(path 를 다시 읽어 변 수 · 좌표로 정다각형 여부 · 둘러싸임 · 조각 꼴을 좌표로 다시 가름 · 바깥쪽 변을 게이트가 따로 셈 · 목표 넓이 ÷ 조각 넓이)을
       따로 내어 서로 같고 정답과 같음 — 원문 대조로 넘기는 문항 0
   F 식 전수 — 「a × b = c」「a ÷ b = c」「a + b = c」 값이 맞음(cm·개·° 떼고)
   G 그림 — pg(변 수 = 점 수 = path 조각 수 · 정다각형 = 좌표 재계산 · 대각선 수·끝점 이웃 아님 · 변 가운데 선 · 직각 표시 = 90° 꼭짓점 · 같은 변 눈금)
       · pgs(이름 ↔ 변 수 · 「정」 ↔ 정다각형 · 주황 칸 = 다각형) · blk(조각 꼴 합동 · 겹침 0 · 목표 안 · 넓이 같음 · 바깥쪽 변) · panels 캡션 = 그림 · 문제 그림엔 답 없음
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/node_modules node kedu/teacher/표준/gate_g4s2_math_u4.js */
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
const L = load(path.join(TDIR, 'data/g4s2_math_u4.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u4.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '다각형', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 도형 셈(부품의 셈과 따로 짬) ── */
const NAMES = ['', '', '', '삼각형', '사각형', '오각형', '육각형', '칠각형', '팔각형', '구각형', '십각형'];
const nOfName = (s) => { const m = String(s).match(/(삼|사|오|육|칠|팔|구|십)각형/); return m ? NAMES.indexOf(m[1] + '각형') : NaN; };
const DIAG = (n) => n * (n - 3) / 2;
const TRI = Math.sqrt(3) / 4;                                 // 한 변 1 정삼각형 넓이
const AREA_T = { 정육각형: 6, 사다리꼴: 3, 마름모: 2, 정삼각형: 1 }; // 정삼각형 단위
const DEF = [[/두 점을 곧게 이은 선/, '선분'], [/두 변이 만나는 점/, '꼭짓점'], [/선분으로만 둘러싸인 도형/, '다각형'], [/서로 이웃하지 않는 두 꼭짓점을 이은 선분/, '대각선'],
  [/변의 길이가 모두 같고 각의 크기도 모두 같은 다각형/, '정다각형'], [/겹치지 않으면서 빈틈없이 평면을 전부 채우는 일/, '쪽매맞춤']];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], len = (v) => Math.hypot(v[0], v[1]), crs = (a, b) => a[0] * b[1] - a[1] * b[0], dt = (a, b) => a[0] * b[0] + a[1] * b[1];
const shoe = (P) => { let a = 0; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; }); return a / 2; };
const ptsOf = (s) => String(s).split(',').map(x => x.trim().split(' ').map(Number));
function geo(P) { // 변 길이·안쪽 각(좌표에서 다시 셈)
  const n = P.length, sg = Math.sign(shoe(P)); const Ls = P.map((p, i) => len(sub(P[(i + 1) % n], p)));
  const As = P.map((p, i) => { const a = sub(P[(i + n - 1) % n], p), b = sub(P[(i + 1) % n], p); let t = Math.atan2(crs(b, a), dt(b, a)) * 180 / Math.PI * sg; return (t + 360) % 360; });
  const eqL = Ls.every(x => Math.abs(x - Ls[0]) < 3e-3 * Math.max(1, Ls[0])), eqA = As.every(x => Math.abs(x - As[0]) < 0.2); return { n, Ls, As, eqL, eqA, reg: eqL && eqA }; }
// 바깥쪽 변 — 게이트 셈: 모든 조각 변을 길이 1 토막으로 쪼개 같은 토막(방향 무시)이 두 번 나오면 안쪽 → 한 번 나온 토막만 남겨 고리로 잇고 꺾이는 점을 셈
function outerSides(polys) {
  const key = (p) => p.map(v => (Math.round(v * 1000) / 1000).toFixed(3)).join(':'); const cnt = new Map();
  polys.forEach(P => P.forEach((a, i) => { const b = P[(i + 1) % P.length], m = Math.max(1, Math.round(len(sub(b, a)))); for (let k = 0; k < m; k++) { const p = [a[0] + (b[0] - a[0]) * k / m, a[1] + (b[1] - a[1]) * k / m], q = [a[0] + (b[0] - a[0]) * (k + 1) / m, a[1] + (b[1] - a[1]) * (k + 1) / m]; const kk = [key(p), key(q)].sort().join('|'); const e = cnt.get(kk) || { n: 0, p, q }; e.n++; cnt.set(kk, e); } }));
  const segs = Array.from(cnt.values()).filter(e => e.n === 1); if (Array.from(cnt.values()).some(e => e.n > 2)) return -1;
  const adj = new Map(); segs.forEach((e, i) => [e.p, e.q].forEach(v => { const k = key(v); if (!adj.has(k)) adj.set(k, []); adj.get(k).push(i); }));
  if (Array.from(adj.values()).some(a => a.length !== 2)) return -1;
  // 고리 하나로 이어지는지 + 꺾이는 점(두 토막 방향이 다른 점)
  const seen = new Set(); let i = 0, at = key(segs[0].p), corners = 0; const order = [];
  while (!seen.has(i)) { seen.add(i); const e = segs[i]; const from = key(e.p) === at ? e.p : e.q, to = key(e.p) === at ? e.q : e.p; order.push(sub(to, from)); at = key(to); const nx = adj.get(at).find(j => j !== i); i = nx; }
  if (seen.size !== segs.length) return -1;
  order.forEach((v, j) => { const u = order[(j + 1) % order.length]; if (Math.abs(crs(v, u)) > 1e-6 || dt(v, u) < 0) corners++; }); return corners; }
function inside(p, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function onEdge(p, P) { for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if (Math.abs(crs(sub(b, a), sub(p, a))) < 1e-3 && dt(sub(p, a), sub(p, b)) <= 1e-3) return true; } return false; }
function overlap(A, B) { // 두 조각을 촘촘히 찍어 둘 다의 속(변 위 제외)에 드는 점이 있으면 겹침
  const xs = A.concat(B).map(p => p[0]), ys = A.concat(B).map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let x = x0 + 0.013; x < x1; x += 0.037) for (let y = y0 + 0.011; y < y1; y += 0.037) { const p = [x, y]; if (inside(p, A) && inside(p, B) && !onEdge(p, A) && !onEdge(p, B)) return true; } return false; }
function pieceKind(P) { // 좌표로 조각 꼴을 다시 가름(한 변 1)
  const g = geo(P), Ls = g.Ls.map(x => Math.round(x * 1000) / 1000), As = g.As.map(a => Math.round(a));
  if (g.n === 6 && g.reg && Math.abs(Ls[0] - 1) < 1e-3) return '정육각형'; if (g.n === 3 && g.reg && Math.abs(Ls[0] - 1) < 1e-3) return '정삼각형';
  if (g.n === 4 && g.reg && Math.abs(Ls[0] - 1) < 1e-3) return '정사각형';
  if (g.n === 4 && g.eqL && Math.abs(Ls[0] - 1) < 1e-3) return As.some(a => a === 30 || a === 150) ? '얇은 마름모' : As.some(a => a === 60) ? '마름모' : '?';
  if (g.n === 4 && Ls.slice().sort().join() === '1,1,1,2') return '사다리꼴'; return '?'; }
// 그림 읽기
function pathSides(D) { const p = D.querySelector('path.o-pg'), pl = D.querySelector('polyline.o-pg'); if (pl) return { kind: 'open', n: pl.getAttribute('points').trim().split(/\s+/).length - 1 }; if (!p) return null; const d = p.getAttribute('d'); return { kind: /Q/.test(d) ? 'curve' : 'poly', n: (d.match(/[LQ]/g) || []).length }; }
function readPg(svg) { const D = svg.ownerDocument; const P = ptsOf(svg.getAttribute('data-pts')); const g = geo(P); const ps = pathSides({ querySelector: (q) => svg.querySelector(q) }) || {};
  return { P, g, kind: ps.kind, nPath: ps.n, dataN: +svg.getAttribute('data-n'), dataReg: svg.getAttribute('data-reg'), dgs: Array.from(svg.querySelectorAll('line.o-dg')), dots: svg.querySelectorAll('circle.o-v').length, hiDot: Array.from(svg.querySelectorAll('circle.o-v')).some(c => c.getAttribute('fill') !== '#3B4252' && /F|f/.test(c.getAttribute('fill')) && c.getAttribute('fill') !== svg.querySelector('circle.o-v').getAttribute('fill') || false) }; }
function readBlk(svg) { const polys = Array.from(svg.querySelectorAll('polygon.o-blk')).map(e => ({ t: e.getAttribute('data-t'), P: ptsOf(e.getAttribute('data-pts')) })); const out = svg.getAttribute('data-out') ? ptsOf(svg.getAttribute('data-out')) : null;
  const kinds = {}; polys.forEach(x => { const k = pieceKind(x.P); kinds[k] = (kinds[k] || 0) + 1; }); return { polys, out, kinds, total: polys.length, outer: polys.length ? outerSides(polys.map(x => x.P)) : -1 }; }

/* 글에서 셈 — 반환: {num} | {word} | {opt} | undefined(셀 수 없는 꼴) */
const pick = (opts, fn) => { if (!opts) return null; const hit = opts.map((o, i) => (fn(o.text) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };
function textAns(q0, d) { const t = clean(q0); let m;
  for (const [re, wd] of DEF) if (re.test(t) && /무엇이라고/.test(t)) return d && d.options ? pick(d.options, o => o === wd) : { word: wd };
  if (/^아래|^다음 도형|아래 /.test(t)) return undefined;
  if ((m = t.match(/한 변의 길이가 (\d+) cm 인 정(.각형)의 (?:세|네|모든) 변의 길이의 합/))) return { num: +m[1] * nOfName(m[2]) };
  if ((m = t.match(/(?:(?:세|네) 변의 길이의 합이 (\d+) cm 인 정(.각형)|정(.각형)의 모든 변의 길이의 합이 (\d+) cm)/)) && /한 변의 길이는/.test(t)) { const S0 = +(m[1] || m[4]), n = nOfName(m[2] || m[3]); return { num: S0 / n }; }
  if ((m = t.match(/정(.각형)의 한 각의 크기가 (\d+)° 입니다\. 다른 한 각/))) return { num: +m[2] };
  if ((m = t.match(/(.각형)의 (변|꼭짓점)의 수와 (.각형)의 (변|꼭짓점)의 수를 더하면/))) return { num: nOfName(m[1]) + nOfName(m[3]) };
  if ((m = t.match(/(.각형)의 변의 수와 꼭짓점의 수를 더하면/))) return { num: 2 * nOfName(m[1]) };
  if ((m = t.match(/(.각형)의 변의 수와 \1에 그을 수 있는 대각선의 수를 더하면/))) { const n = nOfName(m[1]); return { num: n + DIAG(n) }; }
  if ((m = t.match(/(.각형)(?:에서 \*?\*?한 꼭짓점\*?\*?에서|의 한 꼭짓점에서|에서 한 꼭짓점에서) 그을 수 있는 대각선/))) return { num: nOfName(m[1]) - 3 };
  if ((m = t.match(/(.각형)에 그을 수 있는 대각선은 모두/))) return { num: DIAG(nOfName(m[1])) };
  if ((m = t.match(/^(.각형)의 (꼭짓점|변)은 몇 개/))) return { num: nOfName(m[1]) };
  if ((m = t.match(/변이 (\d+)개(?:, 꼭짓점이 \1개)?인 다각형의 이름/))) return { word: NAMES[+m[1]] };
  if (/대각선을 가장 많이 그을 수 있는 다각형/.test(t) && d && d.options) { const vs = d.options.map(o => (isNaN(nOfName(o.text)) ? -1 : DIAG(nOfName(o.text)))); const mx = Math.max(...vs); return vs.filter(v => v === mx).length === 1 ? { opt: vs.indexOf(mx) } : null; }
  if ((m = t.match(/도형이 (\d+)개 있고 그중 다각형이 (\d+)개/)) || (m = t.match(/도형 (\d+)개 가운데 다각형이 (\d+)개/))) return { num: +m[1] - +m[2] };
  if ((m = t.match(/변을 세었더니 각각 ([\d개, ]+?)였어요\. 변은 모두/))) return { num: (m[1].match(/\d+/g) || []).reduce((a, x) => a + +x, 0) };
  if ((m = t.match(/정삼각형 조각 2개(?:로|를 이어 붙이면) 마름모(?:가 됩니다| 1개를 만들어요)\. 마름모를 (\d+)개 만들려면/))) return { num: 2 * +m[1] };
  if ((m = t.match(/조각 (\d+)개로 만든 오각형과 조각 (\d+)개로 만든 오각형에 쓴 조각을 모두/))) return { num: +m[1] + +m[2] };
  if (/쓴 조각은 모두 몇 개/.test(t)) { const ns = (t.match(/조각 (\d+)개/g) || []).map(x => +x.match(/\d+/)[0]); return ns.length ? { num: ns.reduce((a, b) => a + b, 0) } : undefined; }
  if ((m = t.match(/^(정육각형|사다리꼴|마름모) 모양(?: (\d+)개를)?(?:을|를)? (?:\*\*)?(정삼각형|사다리꼴|마름모)(?:\*\*)? 조각(?:으로|만으로)/))) { const a = AREA_T[m[1]] * (+m[2] || 1), b = AREA_T[m[3]]; return Number.isInteger(a / b) ? { num: a / b } : null; }
  if ((m = t.match(/사다리꼴 조각 2개를 맞대어 (?:붙여 )?만든 도형(?:은 몇 각형|의 이름)/))) { const n = outerSides([[[0, 0], [2, 0], [1.5, Math.sqrt(3) / 2], [0.5, Math.sqrt(3) / 2]], [[0.5, Math.sqrt(3) / 2], [1.5, Math.sqrt(3) / 2], [2, Math.sqrt(3)], [0, Math.sqrt(3)]]]); const r = { word: NAMES[n] }; return d && d.options ? pick(d.options, o => o === r.word) : r; }
  if (/네 변의 길이가 모두 같지만 네 각의 크기는 같지 않은 사각형.*정사각형일까요/.test(t) && d && d.options) return pick(d.options, o => /아니에요/.test(o) && /각의 크기/.test(o));
  return undefined; }

/* 그림에서 셈 — 게이트가 그려진 모양을 다시 읽는다 */
function figAns(f, q0, d) { const t = clean(q0); const h = FIG.render(f); const D = docOf(h); const svg = D.querySelector('svg'); let m;
  const nameOpt = (n) => (d && d.options ? pick(d.options, o => o === NAMES[n]) : { word: NAMES[n] });
  if (f.k === 'pg') { const R = readPg(svg); const n = R.nPath;
    if (/두 변이 만나는 점/.test(t)) { const hi = Array.from(svg.querySelectorAll('circle.o-v')).filter(c => c.getAttribute('fill') !== svg.querySelectorAll('circle.o-v')[1].getAttribute('fill')); return hi.length === 1 ? pick(d.options, o => o === '꼭짓점') : null; }
    if (/변이 몇 개/.test(t)) return { num: n };
    if (/다각형이 아닌 까닭/.test(t)) return R.kind === 'open' ? pick(d.options, o => /열려/.test(o)) : R.kind === 'curve' ? pick(d.options, o => /둥근|곡선/.test(o)) : null;
    if (/도형의 이름/.test(t)) return nameOpt(n);
    if (/꼭짓점은 몇 개/.test(t)) return { num: R.dots || n };
    if (/변의 수와 꼭짓점의 수를 더하면/.test(t)) return { num: 2 * n };
    if (/변의 수와 .각형에 그을 수 있는 대각선의 수를 더하면/.test(t)) return { num: n + DIAG(n) };
    if (/한 꼭짓점\*?\*?에서 그을 수 있는 대각선/.test(t)) return { num: n - 3 };
    if (/대각선은 모두/.test(t)) return { num: DIAG(n) };
    if (/세 변의 길이의 합|모든 변의 길이의 합은/.test(t)) { const lb = Array.from(svg.querySelectorAll('text')).map(e => e.textContent).filter(s => /^\d+/.test(s)); ok(R.g.eqL, '둘레 문제 그림 변이 같지 않음'); return lb.length === 1 ? { num: n * parseFloat(lb[0]) } : undefined; }
    if (/다른 한 각의 크기/.test(t)) { ok(R.g.eqA, '각 문제 그림 각이 같지 않음'); return { num: Math.round(R.g.As[0]) }; }
    if (/정사각형일까요/.test(t)) return R.g.reg ? pick(d.options, o => /정사각형이에요/.test(o)) : pick(d.options, o => /아니에요/.test(o) && /각의 크기/.test(o));
    if (/\*\*잘못된\*\*|잘못된 것/.test(q0)) { const judge = (o) => { if ((m = o.match(/변이 (\d+)개인 다각형이다/))) return +m[1] === n && R.kind === 'poly'; if (/정다각형이다/.test(o)) return R.g.reg; if ((m = o.match(/대각선을 (\d+)개 그을 수 있다/))) return +m[1] === DIAG(n); if (/선분으로만 둘러싸여/.test(o)) return R.kind === 'poly'; return null; };
      const js = d.options.map(o => judge(o.text)); if (js.some(x => x === null)) return null; const bad = js.map((x, i) => (x ? -1 : i)).filter(i => i >= 0); return bad.length === 1 ? { opt: bad[0] } : null; }
    if (/한 변의 길이는/.test(t)) return undefined; // 둘레는 글에만 있음
    return undefined; }
  if (f.k === 'pgs') { const gs = Array.from(svg.querySelectorAll('g.o-pi')); const kindOf = (g) => (g.querySelector('polyline.o-pg') ? 'open' : g.querySelector('circle.o-pg,ellipse.o-pg') ? 'circle' : /Q/.test(g.querySelector('path.o-pg').getAttribute('d')) ? 'curve' : 'poly');
    if (/다각형은 모두 몇 개/.test(t)) return { num: gs.filter(g => kindOf(g) === 'poly').length };
    if (/대각선을 가장 많이/.test(t)) { const vs = gs.map(g => DIAG((g.querySelector('path.o-pg').getAttribute('d').match(/L/g) || []).length)); const mx = Math.max(...vs); if (vs.filter(v => v === mx).length !== 1) return null; return pick(d.options, o => o === gs[vs.indexOf(mx)].getAttribute('data-name')); }
    return undefined; }
  if (f.k === 'blk') { const B = readBlk(svg);
    if ((m = t.match(/(정삼각형|정사각형) 조각은 몇 개/)) && !f.ghost) return { num: B.kinds[m[1]] || 0 };
    if (/마름모를 (\d+)개 만들려면/.test(t)) { const k = +t.match(/마름모를 (\d+)개/)[1]; return B.outer === 4 && Object.keys(B.kinds).join() === '정삼각형' ? { num: k * B.total } : null; }
    if (/도형의 이름/.test(t)) return B.outer > 0 ? nameOpt(B.outer) : null;
    if ((m = t.match(/(정삼각형|사다리꼴|마름모) 조각(?:으로|만으로)/)) && f.ghost) { ok(B.out, '채우기 그림에 목표 없음'); const A = Math.abs(shoe(B.out)) / TRI; const r = A / AREA_T[m[1]]; return Math.abs(r - Math.round(r)) < 1e-3 ? { num: Math.round(r) } : null; }
    return undefined; }
  return undefined; }
function optOf(res, d) { if (!res || res.opt != null || !d || !d.options) return res; if (res.word != null) return pick(d.options, o => clean(o) === res.word) || res; if (res.num != null) return pick(d.options, o => parseFloat(o) === res.num) || res; return res; }
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(got === res.num, where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('9차시 키 u4_l01~l09 · 파일 data/g4s2_math_u4.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 4단원 다각형 · 성취기준 표시 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 4 && m.unit_title === '다각형' && /다각형/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\/4단원_다각형\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소 · 곰이·펭이(4학년)', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); ok(/곰이/.test(JSON.stringify(sl[2].data)) && /펭이/.test(JSON.stringify(sl[2].data)), '동기 곰이·펭이'); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u3_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4s2_math u3_l11(3단원 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_math:u3_l11'), 'from ' + rv.from); }));
T('u3_l11 「다음 단원엔」 = 다각형', () => { const nx = PREV.u3_l11.slides[18].data; ok(nx.title === '다음 단원엔' && /다각형/.test(nx.preview), nx.preview); });

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0, nSrc = 0; const unread = [];
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
const srcP = (k, q) => SRC[k].problems.find(p => normT(p.q.replace(/인가요\?$/, '일까요?')) === normT(q));
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question, d); if (ta) ta = optOf(ta, d); let fa = d.fig ? figAns(d.fig, d.question, d) : undefined; if (fa) fa = optOf(fa, d);
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; if (r === undefined) { unread.push(k + ' ' + s.id); nSrc++; return; }
    nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 = 72 (못 읽는 문항 0 · 원문 대조 0) · 그림에서 셈한 문항 ≥ 20 · 글·그림 둘 다 셈해 대조 ≥ 10', () => ok(nCheck === 72 && nSrc === 0 && !unread.length && nFigQ >= 20 && nBoth >= 10, 'nCheck ' + nCheck + ' · 원문 대조 ' + nSrc + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 못 읽음 ' + unread.join(' | ')));
T('도형 셈기 자체 확인 — 대각선 · 이름 · 둘레 · 채우기 · 바깥쪽 변 · 틀린 그림 잡음', () => {
  ok(DIAG(4) === 2 && DIAG(5) === 5 && DIAG(6) === 9 && DIAG(7) === 14 && DIAG(8) === 20 && DIAG(3) === 0, 'n(n−3)÷2');
  ok(SAME(textAns('구각형의 한 꼭짓점에서 그을 수 있는 대각선은 몇 개일까요?'), { num: 6 }), '구각형'); ok(SAME(textAns('변이 7개인 다각형의 이름은 무엇일까요?'), { word: '칠각형' }), '이름');
  ok(SAME(textAns('정육각형 모양 3개를 마름모 조각으로 빈틈없이 채우면 조각이 모두 몇 개 필요할까요?'), { num: 9 }), '채우기');
  ok(outerSides([[[0, 0], [1, 0], [1, 1], [0, 1]], [[0, 1], [1, 1], [1, 2], [0, 2]], [[0, 2], [1, 2], [0.5, 2 + Math.sqrt(3) / 2]]]) === 5, '집 오각형 5');
  ok(outerSides([[[0, 0], [1, 0], [1, 1], [0, 1]], [[1, 0], [2, 0], [2, 1], [1, 1]]]) === 4, '정사각형 2개 = 사각형 4');
  ok(outerSides([[[0, 0], [1, 0], [1, 1], [0, 1]], [[0.5, 0], [1.5, 0], [1.5, 1], [0.5, 1]]]) !== 4 || overlap([[0, 0], [1, 0], [1, 1], [0, 1]], [[0.5, 0], [1.5, 0], [1.5, 1], [0.5, 1]]), '겹친 조각 잡음');
  const bad = figAns({ k: 'pg', reg: 6 }, '아래 도형의 이름은 무엇일까요?', { options: [{ text: '오각형' }, { text: '육각형' }, { text: '칠각형', correct: true }, { text: '팔각형' }] }); ok(bad && bad.opt === 1, '틀린 칠각형 그림은 육각형으로 읽힘'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u4_l01\.slides\.1\.data\.items\./.test(where);
const CH = /(?<![\d.])(\(?\d+(?:\.\d+)?(?:\s*[+\-×÷]\s*\(?\d+(?:\.\d+)?\)?)+\)?)\s*=\s*(\d+(?:\.\d+)?)(?![\d.])/g;
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)\s*(cm|개|°|도)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { let lhs = m[1]; const o = (lhs.match(/\(/g) || []).length, c = (lhs.match(/\)/g) || []).length; if (o !== c) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const e = lhs.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(e)) continue; const v = Function('return (' + e + ')')(); nEq++; if (Math.abs(v - +m[2]) > 1e-9) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 15, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['6 × 3 = 19', '56 ÷ 8 = 6', '7 × (7 − 3) ÷ 2 = 15'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('6 × 3 = **18** cm · 8 × 5 ÷ 2 = 20 · 9 − 3 = 6개', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k, s]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k, s])));
T('개념 36장 모두 그림 · 기본 문제 그림 27 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length === 27, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { pg: 0, pgItem: 0, blk: 0, diag: 0, cap: 0, fill: 0, outer: 0 };
function checkPgSvg(w0, svg, spec, blkName) { const R = readPg(svg);
  ok(R.P.length === R.dataN && (R.kind === 'open' ? R.nPath === R.dataN - 1 : R.nPath === R.dataN), w0 + ' 변 수 ' + [R.P.length, R.dataN, R.nPath]);
  ok(svg.getAttribute('data-kind') === R.kind, w0 + ' kind ' + svg.getAttribute('data-kind') + ' ≠ ' + R.kind); ok(R.kind === 'open' ? !!spec.open : R.kind === 'curve' ? (spec.curve || []).length > 0 : !spec.open && !(spec.curve || []).length, w0 + ' 둘러싸임/곡선이 스펙과 다름');
  ok(String(R.dataReg) === (R.kind === 'poly' && R.g.reg ? '1' : '0'), w0 + ' 정다각형 표시 ' + R.dataReg + ' ≠ 좌표 셈'); if (spec.reg) ok(R.g.reg && R.g.n === spec.reg, w0 + ' reg ' + spec.reg + ' 인데 정다각형 아님');
  R.dgs.forEach(l => { nG.diag++; const a = +l.getAttribute('data-a'), b = +l.getAttribute('data-b'), n = R.g.n; ok(a !== b && Math.abs(a - b) !== 1 && Math.abs(a - b) !== n - 1, w0 + ' 이웃한 꼭짓점 대각선 ' + a + '-' + b); });
  if (spec.diag === 'all') ok(R.dgs.length === DIAG(R.g.n), w0 + ' 대각선 ' + R.dgs.length + ' ≠ ' + DIAG(R.g.n)); if (typeof spec.diag === 'number') ok(R.dgs.length === R.g.n - 3, w0 + ' 한 꼭짓점 대각선');
  ok(svg.getAttribute('data-diag') === String(R.dgs.length), w0 + ' data-diag');
  const rm = svg.querySelectorAll('path').length - 1; if (spec.right && R.kind === 'poly') ok(R.g.As.filter(a => Math.abs(a - 90) < 1e-3).length >= 1, w0 + ' 직각 표시인데 직각 없음');
  if (spec.eq && R.kind === 'poly') { ok(spec.reg || R.g.eqL || spec.pts, w0); }
  (spec.angs || []).forEach((t0, i) => { if (t0 && t0 !== '?') ok(Math.abs(R.g.As[i] - +t0) < 0.5, w0 + ' 각 글자 ' + t0 + ' ≠ ' + R.g.As[i].toFixed(1)); });
  (spec.lens || []).forEach((t0, i) => { if (t0 && t0 !== '?' && spec.lens.filter(x => x && x !== '?').length > 1) { const ref = spec.lens.findIndex(x => x && x !== '?'); ok(Math.abs(R.g.Ls[i] / R.g.Ls[ref] - +t0 / +spec.lens[ref]) < 1e-3, w0 + ' 변 글자 비 ' + t0); } });
  if (blkName) { const n = nOfName(blkName); if (!isNaN(n)) { nG.cap++; ok(R.g.n === n && R.kind === 'poly', w0 + ' 이름 「' + blkName + '」 ≠ 변 ' + R.g.n); } if (/정[삼사오육칠팔]각형/.test(blkName)) ok(R.g.reg, w0 + ' 「' + blkName + '」 인데 정다각형 아님'); if (/정다각형 아님/.test(blkName)) { nG.cap++; ok(!R.g.reg, w0 + ' 정다각형 아님인데 정다각형'); }
    let m; if ((m = blkName.match(/— (\d+)개$/))) { nG.cap++; ok(R.dgs.length === +m[1], w0 + ' 캡션 대각선 ' + blkName + ' ≠ ' + R.dgs.length); }
    if ((m = blkName.match(/변 (\d+)개 · 꼭짓점 (\d+)개/))) { nG.cap++; ok(R.g.n === +m[1] && R.dots === +m[2], w0 + ' ' + blkName); }
    if ((m = blkName.match(/곧은 선 (\d+)개/))) { nG.cap++; ok(R.g.n === +m[1] && R.kind === 'poly', w0 + ' ' + blkName); }
    if (/이어지지 않/.test(blkName)) { nG.cap++; ok(R.kind === 'open', w0 + ' 열림 캡션'); } if (/둘러싸였/.test(blkName)) { nG.cap++; ok(R.kind === 'poly', w0 + ' 둘러싸임 캡션'); } }
  return R; }
function checkPart(w0, f, blk, lab) { const h = FIG.render(f); const D = docOf(h); const svg = D.querySelector('svg');
  if (f.k === 'pg') { nG.pg++; const R = checkPgSvg(w0, svg, f, lab);
    if (blk === 'basic_problem') { ok(!R.dgs.length, w0 + ' 문제 그림에 대각선(답)'); ok(!svg.querySelector('line.o-mid'), w0 + ' 문제 그림에 가운데 선'); }
    (f.mid || []).forEach(([v, si]) => { const l = svg.querySelector('line.o-mid'); ok(l && +l.getAttribute('data-v') === v && +l.getAttribute('data-side') === si && si !== v && (si + 1) % R.g.n !== v, w0 + ' 가운데 선이 그 꼭짓점의 변'); }); }
  if (f.k === 'pgs') { svg.querySelectorAll('g.o-pi').forEach((g, i) => { nG.pgItem++; const it = f.items[i]; const nm = g.getAttribute('data-name');
      if (it.circle) { ok(g.querySelector('circle.o-pg,ellipse.o-pg'), w0 + ' 원'); return; }
      const fake = { getAttribute: (a) => g.getAttribute(a), querySelector: (q) => g.querySelector(q), querySelectorAll: (q) => g.querySelectorAll(q), ownerDocument: D };
      const R = checkPgSvg(w0 + '#' + nm, fake, it, nm); if (it.on) ok(R.kind === 'poly', w0 + '#' + nm + ' 주황 칸인데 다각형 아님'); });
    if (f.items.some(x => x.on)) f.items.forEach((it, i) => { const g = svg.querySelectorAll('g.o-pi')[i]; const poly = !it.circle && g.getAttribute('data-kind') === 'poly'; ok(!!it.on === poly, w0 + ' 주황 칸 ↔ 다각형 ' + it.name); });
    if (blk === 'basic_problem') ok(!svg.querySelector('line.o-dg') && !f.items.some(x => x.on), w0 + ' 문제 그림에 답 표시'); }
  if (f.k === 'blk') { nG.blk++; const B = readBlk(svg);
    ok(+svg.getAttribute('data-total') === B.total && B.total === (f.ghost ? 0 : f.pieces.length), w0 + ' 조각 수');
    const KO = { hex: '정육각형', tri: '정삼각형', sq: '정사각형', trap: '사다리꼴', rhom: '마름모', thin: '얇은 마름모' };
    B.polys.forEach((x, i) => ok(pieceKind(x.P) === KO[x.t], w0 + ' 조각 ' + i + ' ' + x.t + ' 꼴 아님 → ' + pieceKind(x.P)));
    for (let i = 0; i < B.polys.length; i++) for (let j = i + 1; j < B.polys.length; j++) ok(!overlap(B.polys[i].P, B.polys[j].P), w0 + ' 조각 ' + i + '·' + j + ' 겹침');
    if (B.total) { if (B.outer > 0) nG.outer++; ok(+svg.getAttribute('data-outn') === B.outer && (B.outer > 0 || (blk === 'concept' && w0.indexOf('u4_l01 s07') === 0)), w0 + ' 바깥쪽 변 ' + svg.getAttribute('data-outn') + ' ≠ 게이트 ' + B.outer); }
    if (B.out && B.total) { nG.fill++; B.polys.forEach(x => x.P.forEach(p => ok(inside(p, B.out) || onEdge(p, B.out), w0 + ' 목표 밖 조각'))); const a = B.polys.reduce((s, x) => s + Math.abs(shoe(x.P)), 0); ok(Math.abs(a - Math.abs(shoe(B.out))) < 1e-3, w0 + ' 빈틈 — 조각 넓이 ' + a.toFixed(3) + ' ≠ 목표 ' + Math.abs(shoe(B.out)).toFixed(3)); }
    if (f.ghost) ok(!svg.querySelector('polygon.o-blk') && svg.querySelectorAll('circle.o-lat').length > 0, w0 + ' 빈 목표 + 격자 점');
    if (f.count) { const tx = Array.from(svg.querySelectorAll('text')).map(e => e.textContent).join(' '); Object.keys(B.kinds).forEach(k => ok(tx.indexOf(k + ' ' + B.kinds[k]) >= 0, w0 + ' 조각 수 글자 ' + k)); }
    if (blk === 'basic_problem') ok(!f.count, w0 + ' 문제 그림에 조각 수 글자');
    if (lab) { let m; if ((m = lab.match(/^(정삼각형|마름모|사다리꼴|정사각형) (\d+)개$/))) { nG.cap++; ok(B.kinds[m[1]] === +m[2] && B.total === +m[2], w0 + ' 캡션 ' + lab); } if ((m = lab.match(/^조각 (\d+)개$/))) { nG.cap++; ok(B.total === +m[1], w0 + ' 캡션 ' + lab); } if (/채우기/.test(lab)) ok(B.out, w0 + ' 채우기 캡션인데 목표 없음'); } }
  if (f.k !== 'pg' && f.k !== 'pgs' && f.k !== 'blk') ok(blk === 'concept' && /^(geo|tools)$/.test(f.k), w0 + ' 모르는 부품 ' + f.k); }
T('그림 부품 전수 — 변 수·둘러싸임·정다각형·대각선·가운데 선·각/변 글자 · 여러 도형 이름·주황 칸 · 조각 꼴·겹침·목표·넓이·바깥쪽 변 · 캡션', () => { parts.forEach(([w0, g, b, lab]) => checkPart(w0, g, b, lab)); ok(nG.pg >= 42 && nG.pgItem >= 30 && nG.blk >= 27 && nG.diag >= 39 && nG.cap >= 50 && nG.fill >= 6 && nG.outer >= 23, JSON.stringify(nG)); });
T('개념 글 속 도형 주장 = 게이트 셈 (대각선 수 · 바깥쪽 변 · 조각 수)', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const t = clean(s.data.content); let m;
  const re = /(삼각형|사각형|오각형|육각형) (\d+)개/g; if (/대각선/.test(t + s.data.title)) while ((m = re.exec(t))) { n++; ok(DIAG(nOfName(m[1])) === +m[2], k + ' ' + s.id + ' ' + m[0]); }
  if ((m = t.match(/(?:대각선을|육각형에는 대각선을) (\d+)개 그을 수/)) && /육각형/.test(t)) { n++; ok(+m[1] === DIAG(6), k + ' ' + s.id + ' 육각형 대각선'); }
  if ((m = t.match(/바깥쪽 변(?:이|을 세면) \*?\*?(\d+)개/)) || (m = t.match(/바깥쪽 변을 세면 (\d+)개/))) { n++; const B = readBlk(docOf(FIG.render(s.data.fig)).querySelector('svg')); ok(B.outer === +m[1], k + ' ' + s.id + ' 바깥쪽 변 ' + m[1] + ' ≠ ' + B.outer); }
  const fl = flat(s.data.fig).map(([g]) => g).filter(g => g.k === 'blk').map(g => readBlk(docOf(FIG.render(g)).querySelector('svg')));
  if ((m = t.match(/조각을 모두 (\d+)개/))) { n++; ok(fl.some(B => B.total === +m[1]), k + ' ' + s.id + ' 조각 모두 ' + m[1]); }
  const rk = /(정삼각형|정사각형|사다리꼴|마름모|정육각형) 조각 (\d+)개/g; while ((m = rk.exec(t))) { if (!fl.length) break; n++; const kk = m[1], c = +m[2]; ok(fl.some(B => (B.kinds[kk] || 0) === c), k + ' ' + s.id + ' 「' + m[0] + '」 그림에 없음'); }
  if (/변이 6개인 도형|육각형\*?\*?이 됩니다/.test(t) && s.data.fig.k === 'blk') { n++; ok(readBlk(docOf(FIG.render(s.data.fig)).querySelector('svg')).outer === 6, k + ' ' + s.id + ' 육각형 주장'); } })); ok(n >= 10, '주장 ' + n); });
T('그림 검사기 자체 확인 — 겹친 조각·목표 밖·틀린 캡션·틀린 대각선 잡음', () => { let caught = 0; const tries = [
  () => checkPart('ok', { k: 'blk', pieces: [['rhom', 0, 0, 0], ['rhom', 1, 0, 0]], out: [[0, 0], [2, 0], [2.5, 0.866025], [0.5, 0.866025]] }, 'concept', '마름모 2개'),
  () => checkPart('겹침', { k: 'blk', pieces: [['sq', 0, 0, 0], ['sq', 0.5, 0, 0]] }, 'concept'),
  () => checkPart('빈틈', { k: 'blk', pieces: [['rhom', 0, 0, 0]], out: [[0, 0], [2, 0], [2.5, 0.866025], [0.5, 0.866025]] }, 'concept'),
  () => checkPart('캡션', { k: 'pg', reg: 5, diag: 'all' }, 'concept', '오각형 — 6개'),
  () => checkPart('문제 대각선', { k: 'pg', reg: 6, diag: 'all' }, 'basic_problem')];
  tries.forEach(fn => { try { fn(); } catch (e) { caught++; } }); ok(caught === 4, '잡은 수 ' + caught + ' (첫째는 맞는 그림이라 통과해야 함)'); });

console.log('═══ H. 재료 충실 ═══');
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제(보기·정답 그대로)', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(x.text));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(normT(s.data.content)) >= 0 || src.slides.some(x => { const full = normT(x.text); let at = 0; return String(s.data.content).split('\n').every(ln => { const q = normT(ln); const j = q ? full.indexOf(q, at) : -1; if (j < 0) return false; at = j + q.length; return true; }); }), s.id + ' 원문 아님(원문 문장 순서 부분열도 아님)'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const p = srcP(k, s.data.question); ok(p, s.id + ' 문제 원문 아님'); if (p.opts) ok(JSON.stringify(s.data.options.map(o => o.text)) === JSON.stringify(p.opts) && s.data.options[p.ci].correct, s.id + ' 보기·정답'); else ok(s.data.answer === +p.a, s.id + ' 답'); }); }));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(nsp); const dup = n.filter((x, j) => n.indexOf(x) !== j); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('마지막 차시 「다음 단원엔」 = 5단원 꺾은선그래프 · 다른 차시는 「다음 시간엔」 · 차단 어휘 0', () => { const nx = L.u4_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /꺾은선그래프/.test(nx.preview), '다음 단원'); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, '차단 어휘 ' + b)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k, noCover) => L[k].slides.filter(s => s.block !== 'next_lesson' && !(noCover && s.block === 'cover')).map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k, noTitle) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary + (noTitle ? '' : SRC[k].title);
const FIRST = [['다각형', 2], ['오각형', 3], ['육각형', 3], ['칠각형', 3], ['팔각형', 3], ['정다각형', 4], ['대각선', 5], ['이웃하지 않는', 5], ['겹치지 않게', 6], ['빈틈없이', 7], ['쪽매맞춤', 7]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { const nc = w0 === '다각형'; KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k, nc).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k, nc).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(srcTxt(KEYS[n - 1]).indexOf(w0) >= 0, '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('l01 「다각형」은 표지 제목에만', () => { ok(/다각형/.test(L.u4_l01.slides[0].data.title), '표지'); ok(stud('u4_l01', true).indexOf('다각형') < 0, '표지 밖'); });
T('요약 「다음」 줄·arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { const nx = FIRST.filter(([, n]) => n > i + 1).map(([w0]) => w0); const ar = JSON.stringify(L[k].slides[16].data); nx.forEach(w0 => ok(ar.indexOf(w0) < 0, k + ' 요약에 「' + w0 + '」')); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u4_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('대각선') < 0, 'l01 개념 장 깨끗'); probe.content += ' 대각선'; ok(JSON.stringify(probe).indexOf('대각선') >= 0, '심은 낱말'); });

console.log('\n게이트 g4s2 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
