/* gate_g5s2_math_u3.js — 5학년 2학기 수학 3단원 「합동과 대칭」 케이티처 2세대 게이트 (218차, 베프 — gate_g5s2_math_u2 틀 + 게이트 자체 기하).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(cgf·syf·sgd·fpk·crr·lcut) · 잘못된 인자는 던짐 · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음)
   D 복습 계보(l01 = 2단원 u2_l09 출구 → l02 … l11 = 직전 출구) · 2단원 마지막 장 예고 = 합동과 대칭
   E 정답 다시 셈 — 게이트 자체 기하(부품과 따로 짬: 꼭짓점 차례 비교 · 대칭축은 반정수 선 전수 · 대칭의 중심은 반정수 점 전수 · 안쪽 각은 돌아감 방향으로)
     기본 문제 33(변 길이·각·대칭축 수·점대칭 개수·둘레·lcut 어긋난 조각 수는 그림에서 셈) · 수준별 기본·도전 22 · 출구 33 · 넓히기 11
   F 글 속 「… = …」 사슬 다시 셈 · G 그림 — cgf 짝 변·각 · 길이·각 이름표 = 기하 · hide 가림 / syf 갈래·그은 축·가운데 점 = 기하 · fake 는 돌리면 어긋남
     / sgd 완성 도형 = 축·중심 대칭 · ask 는 나머지 반 안 그림 / fpk 칸 갈래 = 기하 / crr 「두 점 사이 = 한쪽 × 2」 / lcut 조각 합동·나무 수 = 기하
     · 문제 그림은 답을 그리지 않음(대칭축 수 물음 = 축 안 그림 · 길이·각 물음 = 가림 · crr 물음 칸 = ?) · 검사기 자체 확인
   H 원문 충실 · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원(4단원 소수의 곱셈)
   L 선행(합동 l02 · 대응 l03 · 선대칭·대칭축 l04 · 수직이등분 l05 · 점대칭·대칭의 중심 l07 — l01 예외) · M 차단 어휘 · 「결」 0 · 인물 0(원문 달곰이·여울이·순달이·현주)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u3.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u3.js'));
const L2 = load(path.join(TDIR, 'data/g5s2_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '합동과 대칭', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 기하 (부품과 따로 짬 — 부품은 변 모음 비교, 여기는 꼭짓점 차례 비교) ── */
const R = (v) => Math.round(v * 1e6) / 1e6;
const P = (q) => R(q[0]) + ',' + R(q[1]);
function dedupe(p) { // 한 줄 위 꼭짓점(곧은 각)은 빼고 비교
  const n = p.length, out = []; for (let i = 0; i < n; i++) { const a = p[(i + n - 1) % n], o = p[i], b = p[(i + 1) % n]; const cr = (o[0] - a[0]) * (b[1] - o[1]) - (o[1] - a[1]) * (b[0] - o[0]); if (Math.abs(cr) > 1e-9) out.push(o); } return out; }
function sameCycle(p, q) { p = dedupe(p); q = dedupe(q); if (p.length !== q.length) return false; const A = p.map(P), n = A.length; for (const B0 of [q.map(P), q.map(P).reverse()]) for (let s = 0; s < n; s++) { let m = true; for (let i = 0; i < n && m; i++) if (A[i] !== B0[(i + s) % n]) m = false; if (m) return true; } return false; }
const bb = (p) => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
function axesG(p) { // 반정수 선 전수: 세로 x=c · 가로 y=c · y=x+c · y=−x+c
  const [x0, y0, x1, y1] = bb(p), out = [];
  for (let c2 = 2 * x0; c2 <= 2 * x1; c2++) { const c = c2 / 2; if (sameCycle(p, p.map(q => [2 * c - q[0], q[1]]))) out.push('v' + c); }
  for (let c2 = 2 * y0; c2 <= 2 * y1; c2++) { const c = c2 / 2; if (sameCycle(p, p.map(q => [q[0], 2 * c - q[1]]))) out.push('h' + c); }
  for (let c2 = 2 * (y0 - x1); c2 <= 2 * (y1 - x0); c2++) { const c = c2 / 2; if (sameCycle(p, p.map(q => [q[1] - c, q[0] + c]))) out.push('d' + c); }
  for (let c2 = 2 * (x0 + y0); c2 <= 2 * (x1 + y1); c2++) { const c = c2 / 2; if (sameCycle(p, p.map(q => [c - q[1], c - q[0]]))) out.push('n' + c); }
  return out;
}
function ctrsG(p) { const [x0, y0, x1, y1] = bb(p), out = []; for (let a = 2 * x0; a <= 2 * x1; a++) for (let b = 2 * y0; b <= 2 * y1; b++) if (sameCycle(p, p.map(q => [a - q[0], b - q[1]]))) out.push([a / 2, b / 2]); return out; }
const kindG = (p) => { const l = axesG(p).length > 0, c = ctrsG(p).length > 0; return l && c ? 'both' : l ? 'line' : c ? 'point' : 'none'; };
function areaS(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function inAng(p, i) { // 안쪽 각(0~360) — 돌아감 방향으로
  const n = p.length, a = p[(i + n - 1) % n], o = p[i], b = p[(i + 1) % n], sg = Math.sign(areaS(p));
  const u = [o[0] - a[0], o[1] - a[1]], v = [b[0] - o[0], b[1] - o[1]], turnA = Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180 / Math.PI; return R(180 - sg * turnA); }
const sideL = (p, i) => { const a = p[i], b = p[(i + 1) % p.length]; return R(Math.hypot(a[0] - b[0], a[1] - b[1])); };
const perim = (p) => R(p.reduce((s, _, i) => s + sideL(p, i), 0));
const T8 = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
const mv0 = (p) => { const b = bb(p); return p.map(q => [q[0] - b[0], q[1] - b[1]]); };
const congG = (p, q) => T8.some(t => sameCycle(mv0(p), mv0(q.map(z => t(z[0], z[1])))));
const polyoKey = (cs) => T8.map(t => { const m = mv0(cs.map(q => t(q[0], q[1]))); return m.map(P).sort().join(';'); }).sort()[0];
const ptsOf = (s) => s.trim().split(/\s+/).map(z => z.split(',').map(Number));
const keyMap = (s) => { const o = {}; String(s).split('|').forEach(kv => { const i = kv.indexOf('='); o[kv.slice(0, i)] = kv.slice(i + 1); }); return o; };

/* ── 정답 표 — 기하 문제는 그림에서 다시 셈, 말 문제는 정답 보기 글 ── */
const figOf = (k, sid) => L[k].slides.find(s => s.id === sid).data.fig;
const cgfB = (k, sid) => { const f = figOf(k, sid); const kk = keyMap(docOf(FIG.render(f)).querySelector('svg').getAttribute('data-cong')); return { A: ptsOf(kk.A), B: ptsOf(kk.B), f }; };
const W = (t) => 'WORD:' + t;
const EXP = {
  basic: {
    u3_l01: [W('도형의 자리'), W('한쪽을 오려 다른 쪽에 포개어 본다'), () => { const f = figOf('u3_l01', 's11'); ok(congG(f.items[0].p, f.items[1].p), '딱지 둘이 합동 아님'); return f.items.reduce((s, it) => s + perim(it.p), 0); }],
    u3_l02: [W('포개었을 때 완전히 겹친다'), () => { const g = cgfB('u3_l02', 's10'); return sideL(g.B, g.f.sides[0]) * g.f.unit; }, () => { const f = figOf('u3_l02', 's11'); ok(!congG(f.items[0].p, f.items[1].p), '가·나 합동'); return '합동이 아니다'; }],
    u3_l03: [() => { const g = cgfB('u3_l03', 's09'); return sideL(g.B, g.f.sides[0]) * g.f.unit; }, () => { const g = cgfB('u3_l03', 's10'); return inAng(g.B, g.f.angles[0]); }, W('포개었을 때 겹치는 점끼리 짝을 짓는다')],
    u3_l04: [W('선대칭도형'), () => axesG(figOf('u3_l04', 's10').p).length, (d) => { const f = d.fig, no = f.items.map((it, i) => axesG(it.p).length ? -1 : i).filter(i => i >= 0); ok(no.length === 1, '대칭축 없는 칸 ' + no.length); return clean(d.options[no[0]].text); }],
    u3_l05: [W('수직으로 만난다'), () => 3 * 2, () => 10 / 2],
    u3_l06: [() => { const f = figOf('u3_l06', 's09'); return Math.max(...f.half.map(q => Math.abs(q[0] - f.axis.k))); }, W('제자리에 그대로 둔다'), W('대칭축과 수직인 방향')],
    u3_l07: [W('점대칭도형'), () => { ok(!ctrsG(figOf('u3_l07', 's10').p).length, '이등변삼각형이 돌려서 겹침'); return '반 바퀴 돌리면 어긋나므로 점대칭도형이 아니다'; }, () => figOf('u3_l07', 's11').items.filter(it => ctrsG(it.p).length).length],
    u3_l08: [W('선분을 이등분한다'), () => 4 * 2, W('모두 대칭의 중심 한 점에서 만난다')],
    u3_l09: [W('중심을 지나 같은 거리만큼 더 간다'), () => 3 * 2, W('오른쪽 2칸, 아래 1칸')],
    u3_l10: [() => { const f = figOf('u3_l10', 's09'); ok(f.cells.length === 12 && f.trees.length === 4, '땅 칸·나무'); return f.cells.length / f.trees.length; }, () => perim(figOf('u3_l10', 's10').items[0].p) * 5, () => figOf('u3_l10', 's11').cut.filter(pc => f11trees(pc) !== 1).length],
    u3_l11: [() => axesG(figOf('u3_l11', 's09').p).length, () => { ok(kindG(figOf('u3_l11', 's10').p) === 'line', 'ㄱ자 갈래'); return '선대칭도형이지만 점대칭도형은 아니다'; }, () => 18 / 2]
  },
  lev: { u3_l01: [6 * 4, (7 + 4) * 2], u3_l02: [5 * 3, (8 + 3) * 2 * 2], u3_l03: [8, 360 - 90 - 90 - 135], u3_l04: [3, 2 * 3 + 4 * 2], u3_l05: [7 * 2, 16 / 2], u3_l06: [3 * 2, (2 + 4 + 6) * 2],
    u3_l07: [1, 4 + 1 + 0 + 1], u3_l08: [6 * 2, 22 / 2], u3_l09: [4 * 2, (3 + 5 + 4) * 2], u3_l10: [18 / 6, 24 / 6], u3_l11: [2 + 1, 14 / 2 + 9 * 2] },
  exit: { u3_l01: ['각의 크기', 2 * 4 * 3, '포개어 보기'], u3_l02: ['합동', '예', 9 * 4], u3_l03: ['대응각', 11, 45], u3_l04: ['대칭축', 1, 4], u3_l05: ['수직으로', 5 * 2, 45], u3_l06: ['점', 5, '대칭축'],
    u3_l07: ['대칭의 중심', '돌려서', 1], u3_l08: ['이등분', 9 * 2, 6], u3_l09: [5 * 2, '반 바퀴', '오른쪽 1칸, 위 3칸'], u3_l10: ['합동', 15 / 5, '아니요'], u3_l11: ['점대칭도형', '수직이등분', 135] },
  adv: { u3_l01: 3 * 5 * 2 + 3 * 2, u3_l02: (4 + 5 + 6) * 3, u3_l03: 3 + 4 + 7 + 4, u3_l04: 4, u3_l05: 9 * 2, u3_l06: (1 + 3 + 5 + 2) * 2, u3_l07: 2 + 1, u3_l08: 10 / 2 * 2 + 16 / 2 * 2, u3_l09: 3 * 2, u3_l10: (16 / 4) * (2 * 2), u3_l11: 28 / 4 }
};
function f11trees(pc) { const f = figOf('u3_l10', 's11'); return f.trees.filter(t => pc.some(q => q[0] === t[0] && q[1] === t[1])).length; }
// 지식 문제의 기하 받침 — 출구·수준별 수가 도형에서 맞는지
const SQ = [[0, 0], [4, 0], [4, 4], [0, 4]], RECT = [[0, 0], [6, 0], [6, 3], [0, 3]], ISO = [[3, 0], [6, 3], [0, 3]], EQT_AX = 3, PARA = [[0, 0], [4, 0], [7, 3], [3, 3]];

console.log('═══ A. 로드 ═══');
T('11차시 키 u3_l01~l11 · 파일 data/g5s2_math_u3.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 3단원 합동과 대칭 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 3 && m.subject === '수학' && m.unit_title === '합동과 대칭' && /합동과 대칭/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/3단원_합동과대칭\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
T('그림 부품 cgf·syf·sgd·fpk·crr·lcut 등록 · 잘못된 인자는 던짐', () => {
  [{ k: 'cgf', p: ISO, op: { slide: [7, 0] } }, { k: 'syf', p: SQ, show: 'line', all: true, want: 'both' }, { k: 'sgd', half: [[5, 0], [2, 3], [5, 6]], axis: { t: 'v', k: 5 }, cols: 10, rows: 7 }, { k: 'fpk', items: [{ p: SQ }, { p: PARA }] }, { k: 'crr', rows: [{ lead: 'a', a: 'b', b: 'c' }] }, { k: 'lcut', cells: [[0, 0], [1, 0]], trees: [[0, 0]] }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'syf', p: PARA, want: 'line' }, { k: 'syf', p: ISO, show: 'point', fake: false }, { k: 'syf', p: PARA, show: 'point', fake: true }, { k: 'syf', p: PARA, show: 'line' }, { k: 'sgd', half: [[4, 0], [2, 3], [5, 6]], axis: { t: 'v', k: 5 } }, { k: 'cgf', p: [[0, 0], [3, 0], [0, 2]] }, { k: 'fpk', items: [{ p: ISO, want: 'point' }] },
    { k: 'lcut', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], trees: [], cut: [[[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1]], [[2, 1]]] }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 8, '던짐 ' + th + '/8'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 11종 서로 다름 · 2단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 11, im.join(',')); const u2 = Object.values(L2).map(l => l.slides[2].data.img); ok(!im.some(x => u2.indexOf(x) >= 0), '2단원과 겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2단원 u2_l09') + ' 출구', () => { const rv = L[k].slides[1].data;
  const ex = i ? L[KEYS[i - 1]].slides[15].data.items : L2.u2_l09.slides[15].data.items; ok(rv.from === (i ? KEYS[i - 1] : 'g5s2_math:u2_l09'), 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); if (!i) ok(/지난 단원/.test(rv.title), 'l01 제목'); }));
T('2단원 마지막 장 예고 = 합동과 대칭', () => ok(/합동과 대칭/.test(L2.u2_l09.slides[18].data.preview), '2단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
function want(d, exp) {
  if (typeof exp === 'function') exp = exp(d); if (typeof exp === 'string' && /^WORD:/.test(exp)) exp = exp.slice(5);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === String(exp), '정답 보기 「' + c[0].text + '」 ≠ 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === String(exp)).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(EXP.lev[k][i]), t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === String(EXP.exit[k][i]), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === String(EXP.adv[k]), '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); nCheck++; }));
T('다시 셈한 정답 = 99', () => ok(nCheck === 99, nCheck));
T('지식 답의 기하 받침 — 정사각형 축 4·중심 1 · 직사각형 축 2·중심 1 · 이등변삼각형 축 1·중심 0 · 평행사변형 축 0·중심 1 · 정삼각형 축 3', () => {
  ok(axesG(SQ).length === 4 && ctrsG(SQ).length === 1, '정사각형 ' + axesG(SQ)); ok(axesG(RECT).length === 2 && ctrsG(RECT).length === 1, '직사각형'); ok(axesG(ISO).length === 1 && !ctrsG(ISO).length, '이등변'); ok(!axesG(PARA).length && ctrsG(PARA).length === 1, '평행사변형');
  const s3 = Math.sqrt(3), EQ = [[0, 0], [2, 0], [1, s3]]; let n = 0; const c = [1, s3 / 3]; for (let t = 0; t < 3; t++) { const th = t * Math.PI / 3 + Math.PI / 2, d = [Math.cos(th), Math.sin(th)]; const ref = EQ.map(q => { const v = [q[0] - c[0], q[1] - c[1]], dp = v[0] * d[0] + v[1] * d[1]; return [c[0] + 2 * dp * d[0] - v[0], c[1] + 2 * dp * d[1] - v[1]]; }); if (sameCycle(EQ, ref)) n++; } ok(n === EQT_AX, '정삼각형 축 ' + n);
  const L7 = [[1, 0], [3, 0], [3, 1], [4, 1], [4, 3], [3, 3], [3, 4], [1, 4], [1, 3], [0, 3], [0, 1], [1, 1]]; ok(axesG(L7).length === 4 && ctrsG(L7).length === 1, '십자'); });
T('기하 검사기 자체 확인 — 마름모(정사각형 아님) 축 2 · ㄱ자 점대칭 아님 · 직각사다리꼴 축 0 · 안쪽 각 · 합동', () => {
  const RH = [[2, 0], [4, 3], [2, 6], [0, 3]]; ok(axesG(RH).length === 2 && ctrsG(RH).length === 1, '마름모 축 ' + axesG(RH)); ok(kindG([[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]]) === 'line', 'ㄱ자'); ok(kindG([[0, 0], [5, 0], [5, 3], [3, 3]]) === 'none', '직각사다리꼴');
  ok(inAng([[2, 0], [5, 0], [7, 2], [0, 2]], 0) === 135 && inAng([[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]], 3) === 270, '안쪽 각'); ok(congG(ISO, ISO.map(q => [q[1] + 9, q[0]])) && !congG(SQ, [[0, 0], [2, 0], [2, 2], [0, 2]]), '합동'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
function evA(s0) { const s = String(s0).replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/'); ok(/^[\d\s+\-*/().]+$/.test(s), '모르는 글자 ' + s0); return Function('return (' + s + ')')(); }
const EQ = /\(?\d[\d\s×÷+\-−()]*=[\d\s×÷+\-−()=]*\d\)?/g; let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, '').replace(/\((cm|m²|m|칸|개|도)\)/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim(); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (!/[×÷+\-−]/.test(t)) continue; try { const bal = (x) => { x = x.trim(); while ((x.match(/\(/g) || []).length > (x.match(/\)/g) || []).length) x = x.replace(/^\(/, '').trim(); while ((x.match(/\)/g) || []).length > (x.match(/\(/g) || []).length) x = x.replace(/\)$/, '').trim(); return x; }; const v = t.split('=').map(bal).filter(Boolean).map(evA); nEq++; if (!v.every(x => Math.abs(x - v[0]) < 1e-9)) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 15', () => ok(!badEq.length && nEq >= 15, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음)', () => { const b0 = badEq.length; ['15 + 3 + 15 + 3 = 33', '4 + 5 + 6 = 14'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 2, '틀린 식 못 잡음'); badEq.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = { cgf: 0, syf: 0, sgd: 0, fpk: 0, crr: 0, lcut: 0, ax: 0, ctr: 0, fake: 0, ask: 0, hide: 0, bad: 0 };
const num = (v) => { const m = String(v).match(/^(\d+(?:\.\d+)?)\s*cm$/); return m ? +m[1] : null; };
function checkFig(w0, f, b, d) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const doc = docOf(h);
  if (f.k === 'cgf') { nG.cgf++; const kk = keyMap(doc.querySelector('svg').getAttribute('data-cong')), A = ptsOf(kk.A), B = ptsOf(kk.B); ok(A.length === B.length, w0 + ' 꼭짓점 수');
    ok(congG(A, B), w0 + ' 두 도형 합동 아님'); A.forEach((_, i) => { ok(sideL(A, i) === sideL(B, i), w0 + ' 짝 변 ' + i); ok(inAng(A, i) === inAng(B, i), w0 + ' 짝 각 ' + i); ok(Math.abs(inAng(A, i) / 45 - Math.round(inAng(A, i) / 45)) < 1e-6, w0 + ' 45° 배수'); });
    [...doc.querySelectorAll('.cg-len')].forEach(t => { const side = t.getAttribute('data-side'), i = +t.getAttribute('data-i'), P0 = side === 'a' ? A : B; if (f.hide === 'b' && side === 'b') { nG.hide++; ok(t.textContent === '?', w0 + ' 가린 길이 보임'); } else ok(t.textContent === R(sideL(P0, i) * f.unit) + ' cm', w0 + ' 길이 ' + t.textContent); });
    [...doc.querySelectorAll('.cg-ang')].forEach(t => { const side = t.getAttribute('data-side'), i = +t.getAttribute('data-i'), P0 = side === 'a' ? A : B; if (f.hide === 'b' && side === 'b') { nG.hide++; ok(t.textContent === '?', w0 + ' 가린 각 보임'); } else ok(t.textContent === inAng(P0, i) + '°', w0 + ' 각 ' + t.textContent + ' ≠ ' + inAng(P0, i)); });
    ok(doc.querySelectorAll('.cg-lab').length === A.length * 2, w0 + ' 이름'); }
  if (f.k === 'syf') { nG.syf++; const kk = keyMap(doc.querySelector('svg').getAttribute('data-sym')), ax = axesG(f.p), cs = ctrsG(f.p);
    ok(kk.kind === kindG(f.p), w0 + ' 갈래 ' + kk.kind + ' ≠ ' + kindG(f.p)); if (f.want) ok(f.want === kindG(f.p), w0 + ' want');
    const drawn = [...doc.querySelectorAll('.sy-axis')]; drawn.forEach(l => { nG.ax++; const [t, v] = l.getAttribute('data-ax').split(':'); let id; if (t === 'v' || t === 'h') id = t + (+v); else { const [a, b0] = v.split(',').map(Number); id = t === 'd' ? 'd' + (b0 - a) : 'n' + (a + b0); } ok(ax.indexOf(id) >= 0, w0 + ' 축 아닌 선을 그음 ' + id); });
    if (f.all) ok(drawn.length === ax.length, w0 + ' 축 다 그림 ' + drawn.length + '/' + ax.length);
    const dot = doc.querySelector('.sy-ctr'); if (f.fake) { nG.fake++; ok(!cs.length && dot, w0 + ' fake 인데 돌리면 겹침'); } else if (dot) { nG.ctr++; const c = dot.getAttribute('data-c').split(',').map(Number); ok(cs.some(z => z[0] === c[0] && z[1] === c[1]), w0 + ' 가운데 점이 대칭의 중심 아님'); }
    if (f.fold === 'fold') ok(ax.length && doc.querySelector('.sy-fold'), w0 + ' 접는 장면'); }
  if (f.k === 'sgd') { nG.sgd++; const svg = doc.querySelector('svg'), kk = keyMap(svg.getAttribute('data-sg')), full = ptsOf(kk.full);
    if (f.axis) { const ax = axesG(full), id = f.axis.t === 'v' || f.axis.t === 'h' ? f.axis.t + f.axis.k : f.axis.t === 'd' ? 'd' + (f.axis.b - f.axis.a) : 'n' + (f.axis.a + f.axis.b); ok(ax.indexOf(id) >= 0, w0 + ' 완성 도형이 축 대칭 아님 ' + ax); ok(f.half.every(q => full.some(z => z[0] === q[0] && z[1] === q[1])), w0 + ' 반쪽'); }
    if (f.ctr) { const cs = ctrsG(full); ok(cs.some(z => z[0] === f.ctr[0] && z[1] === f.ctr[1]), w0 + ' 완성 도형이 점대칭 아님'); }
    full.forEach(q => ok(q[0] >= 0 && q[1] >= 0 && q[0] <= (f.cols || 10) && q[1] <= (f.rows || 8), w0 + ' 모눈 밖'));
    if (f.ask || f.only === 'half') { if (f.ask) nG.ask++; ok(svg.getAttribute('data-part') === 'half' && !doc.querySelector('polygon[data-part="full"]'), w0 + ' 나머지 반을 그림'); } else ok(doc.querySelector('polygon[data-part="full"]'), w0 + ' 완성 도형 없음'); }
  if (f.k === 'fpk') { nG.fpk++; const cells = [...doc.querySelectorAll('.fpk-c')]; ok(cells.length === f.items.length, w0 + ' 칸 수'); cells.forEach((c, i) => ok(c.getAttribute('data-kind') === kindG(f.items[i].p), w0 + ' 칸 ' + i + ' 갈래 ' + c.getAttribute('data-kind') + ' ≠ ' + kindG(f.items[i].p)));
    if (f.ask) { nG.ask++; ok(!doc.querySelector('.fpk-t') && !doc.querySelector('.fpk-c.pick') && !doc.querySelector('.fpk-c.no'), w0 + ' ask 인데 갈래 보임'); } }
  if (f.k === 'crr') { nG.crr++; const rows = f.rows; const pair = rows.find(r => r.a === '대응점' && r.b === '대응점'), halfs = rows.filter(r => /^(대칭축|중심)$/.test(r.a) && r.b === '대응점');
    if (pair && num(pair.v) != null) halfs.filter(r => num(r.v) != null).forEach(r => ok(num(pair.v) === num(r.v) * 2, w0 + ' 두 점 사이 ≠ 한쪽 × 2'));
    if (halfs.length === 2 && halfs.every(r => num(r.v) != null)) ok(num(halfs[0].v) === num(halfs[1].v), w0 + ' 양쪽 거리 다름');
    rows.forEach(r => { if (r.cls === 'bad') nG.bad++; });
    if (b === 'basic_problem' && d.input) { nG.ask++; ok(rows.some(r => r.v === '?'), w0 + ' 물음 칸 ? 없음'); ok(!rows.some(r => num(r.v) === d.answer), w0 + ' 그림이 답을 보임'); } }
  if (f.k === 'lcut') { nG.lcut++; const svg = doc.querySelector('svg');
    if (f.cut && !f.ask) { const cong = f.cut.every(pc => polyoKey(pc) === polyoKey(f.cut[0])), tc = f.cut.map(pc => f.trees.filter(t => pc.some(q => q[0] === t[0] && q[1] === t[1])).length); const cover = new Set(f.cut.flat().map(P));
      ok(cover.size === f.cells.length && f.cells.every(q => cover.has(P(q))), w0 + ' 땅을 다 덮지 않음'); ok(svg.getAttribute('data-cong') === (cong ? '1' : '0'), w0 + ' 합동 판정'); ok(svg.getAttribute('data-trees') === tc.join(','), w0 + ' 나무 수 ' + tc);
      if (f.bad) { nG.bad++; ok(f.bad === 'shape' ? !cong : (cong && tc.some(c => c !== 1)), w0 + ' bad 신고 어긋남'); } else ok(cong && tc.every(c => c === 1), w0 + ' 바른 나눔 아님'); }
    else { nG.ask++; ok(!svg.querySelector('.lc-edge'), w0 + ' ask 인데 나눔 보임'); } }
  if (b === 'basic_problem' && d.input && f.k === 'syf') ok(!/대칭축/.test(d.question) || f.show === '', w0 + ' 축 개수 물음인데 축을 그림');
  if (b === 'basic_problem' && d.input && f.k === 'cgf') ok(f.hide === 'b', w0 + ' 길이·각 물음인데 안 가림');
  if (b === 'basic_problem' && d.input && f.k === 'sgd') ok(f.ask || f.only === 'half', w0 + ' 칸 물음인데 완성 도형');
  if (b === 'basic_problem' && f.k === 'fpk') ok(f.ask, w0 + ' 분류 물음인데 갈래 보임');
}
T('그림 ' + figs.length + '개 — 짝 변·각 · 이름표 = 기하 · 갈래·축·중심 · 반쪽 완성 · 칸 갈래 · 대응 거리 · 땅 나눔 · 답 가림', () => figs.forEach(([w0, f, b, d]) => checkFig(w0, f, b, d)));
T('개념 44장 모두 그림 · 기본 문제 33 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 44 && p === 33, c + '/' + p); });
T('그림 부품 수 — cgf ≥ 15 · syf ≥ 15 · sgd ≥ 8 · fpk ≥ 8 · crr ≥ 6 · lcut ≥ 4 · 그은 축 ≥ 10 · 중심 ≥ 5 · fake ≥ 2 · 가림 ≥ 3 · ask ≥ 10 · 어긋난 판 ≥ 2', () => ok(nG.cgf >= 15 && nG.syf >= 15 && nG.sgd >= 8 && nG.fpk >= 8 && nG.crr >= 6 && nG.lcut >= 4 && nG.ax >= 10 && nG.ctr >= 5 && nG.fake >= 2 && nG.hide >= 3 && nG.ask >= 10 && nG.bad >= 2, JSON.stringify(nG)));
T('개념 글 ↔ 그림 — 「대칭축 n개」 cap 은 기하 축 수 · 「직각사다리꼴·ㄱ자」 글은 점대칭 아님', () => { let n = 0; figs.forEach(([w0, f]) => { if (f.k !== 'syf' || !f.cap) return; const m = f.cap.match(/대칭축 (\d+)개/); if (m) { n++; ok(+m[1] === axesG(f.p).length, w0 + ' cap 축 ' + m[1]); } if (/점대칭도형이 아니다|돌리면 어긋난다/.test(f.cap)) ok(!ctrsG(f.p).length, w0 + ' 돌리면 겹침'); }); ok(n >= 3, '축 cap ' + n); });
T('그림 검사기 자체 확인 — 바른 그림 통과 · 부품이 거짓말하면(갈래·중심·나무 수·합동 판정 바꿔치기) 잡음 · 두 점 사이 · 답 보이는 문제 그림 잡음', () => { let c = 0; const tr = (f, b, d) => { try { checkFig('probe', f, b || 'concept', d || {}); } catch (e) { c++; } };
  const lie = (f, from, to) => { const R0 = FIG.render; FIG.render = (x) => R0(x).replace(from, to); try { tr(f); } finally { FIG.render = R0; } };
  checkFig('probe', { k: 'fpk', items: [{ p: SQ }], ask: true }, 'basic_problem', { input: 'x' }); checkFig('probe', { k: 'syf', p: PARA, show: 'point', want: 'point' }, 'concept', {});
  lie({ k: 'syf', p: PARA, show: 'point' }, 'kind=point', 'kind=both'); lie({ k: 'fpk', items: [{ p: ISO }] }, 'data-kind="line"', 'data-kind="both"'); lie({ k: 'syf', p: PARA, show: 'point' }, /data-c="[^"]+"/, 'data-c="2,1"');
  lie({ k: 'lcut', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], trees: [[0, 0], [1, 1]], cut: [[[0, 0], [1, 0]], [[0, 1], [1, 1]]] }, 'data-trees="1,1"', 'data-trees="2,0"');
  lie({ k: 'cgf', p: ISO, op: { slide: [7, 0] }, unit: 1, sides: [1] }, '>6 cm<', '>5 cm<');
  tr({ k: 'crr', rows: [{ lead: '두 점 사이', a: '대응점', b: '대응점', v: '7 cm' }, { lead: '왼쪽', a: '대칭축', b: '대응점', v: '3 cm' }] });
  tr({ k: 'crr', rows: [{ lead: '왼쪽', a: '대칭축', b: '대응점', v: '3 cm' }, { lead: '사이', a: '대응점', b: '대응점', v: '6 cm' }] }, 'basic_problem', { input: 'count_input', answer: 6 });
  tr({ k: 'syf', p: RECT, show: 'line', all: true }, 'basic_problem', { input: 'count_input', question: '대칭축은 몇 개', answer: 2 });
  tr({ k: 'cgf', p: ISO, op: { slide: [7, 0] }, unit: 1, sides: [1] }, 'basic_problem', { input: 'count_input', answer: 4 });
  ok(c === 9, '잡은 수 ' + c + '/9'); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 개념 장 · 기본 문제 = 원문(앞머리·수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ps = src.problems.filter(p => normT(nk(p.q)).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); const p = ps[0]; if (p.opts) ok(d.options[p.ci].correct, s.id + ' 보기·정답'); });
  const nx = L[k].slides[18].data; if (k !== 'u3_l11') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
T('원문 오류 피함 — 「마름모」 기본 문제 0(원문 그림이 정사각형이라 축 4개로 답이 적힘)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(!/마름모/.test(s.data.question), k + ' ' + s.id))));
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~은?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 4단원 소수의 곱셈 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u3_l11.slides[18].data; ok(nx.title === '다음 단원엔' && /소수의 곱셈/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['합동', 2], ['대응', 3], ['선대칭', 4], ['대칭축', 4], ['수직이등분', 5], ['점대칭', 7], ['대칭의 중심', 7]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('선행 검사기 자체 확인', () => { ok(teach('u3_l03').indexOf('점대칭') < 0, 'l03 깨끗'); ok(teach('u3_l08').indexOf('점대칭') >= 0, 'l08 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 곰이·펭이·달곰이·여울이·순달이·현주 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결', '곰이', '펭이', '여울이', '순달이', '현주'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));

console.log('\n게이트 g5s2 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
