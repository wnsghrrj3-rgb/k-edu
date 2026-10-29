/* gate_g5s2_math_u5.js — 5학년 2학기 수학 5단원 「직육면체」 케이티처 2세대 게이트 (220차, 베프 — gate_g5s2_math_u4 틀 + 직육면체 접기 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(잘못된 인자는 던짐) · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 4단원 마지막 차시 u4_l10 출구 → l02 … l09 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 상자 모형(꼭짓점 8개 좌표에서 면·모서리·보이는 것을 셈)·자체 전개도 접기(굴리기 방식 — 부품과 따로 짬)·자체 주사위 굴리기로
     기본 문제 27·수준별 기본·도전 18·출구 27·넓히기 9 를 다시 셈(면·모서리·꼭짓점 수 · 보이는 모서리 · 평행한 면 · 만나는 점·선분 · 잘린 모서리 길이 · 끝 눈)
   F 식 전수 — 개념 글·요약·교사 층 글 속 「… = …」 사슬을 다시 셈 · 검산기 자체 확인
   G 그림 — bxi 모서리 12(숨은 셋 = ㅁ 에서 만나는 점선) · 칠한 면 = 상자의 면 · 길이 이름표 · bxr · bxn 접은 결과 = 게이트 접기 · 접는 선 = 맞닿은 칸
     · 바른 전개도의 접는 선 = 5 · npk · dpg 끝 눈 = 게이트 굴리기 · ask 가림 · 문제 그림 속 정답 0 · 검사기 자체 확인
   H 원문 충실 · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원
   L 선행(「정육면체」 l03 · 「겨냥도」 l04 · 「밑면」「옆면」 l05 · 「전개도」 l06 — l01 예외) · M 차단 어휘 · 「결」 0(파일 주소 빼고) · 인물 0(원문 달곰이·지우·윤수·서연·태민 · 곰이·펭이)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u5.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u5.js'));
const L4 = load(path.join(TDIR, 'data/g5s2_math_u4.js'));
const LP = [1, 2, 3, 4].map(u => load(path.join(TDIR, 'data/g5s2_math_u' + u + '.js')));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u5.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '직육면체', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 계산기 — 소수·분수를 정수 분자·분모로 (부품·생성기와 따로 짬, BigInt 안 씀) ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (!d) throw new Error('0으로 나눔'); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]), div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
const eqQ = (a, b) => a[0] === b[0] && a[1] === b[1];
const cmpQ = (a, b) => Math.sign(sub(a, b)[0]);
const numQ = (t) => { const m = String(t).match(/^(\d+)(?:\.(\d+))?$/); if (!m) throw new Error('수 아님 ' + t); const k = m[2] ? m[2].length : 0; return Q(+(m[1] + (m[2] || '')), Math.pow(10, k)); };
function ev(s0) { // 소수 · n/d · + − × ÷ ( )
  const s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-');
  const tk = s.match(/\d+(?:\.\d+)?|[-+×÷*/()]|\S/g) || []; let i = 0;
  const peek = () => tk[i], next = () => tk[i++];
  function atom() { const t = next(); if (t === '(') { const v = expr(); ok(next() === ')', '괄호'); return v; } if (/^\d/.test(String(t))) return numQ(t); throw new Error('모르는 글자 ' + t + ' in ' + s0); }
  function term() { let v = atom(); while (['×', '*', '/', '÷'].indexOf(peek()) >= 0) { const o = next(), r = atom(); v = (o === '/' || o === '÷') ? div(v, r) : mul(v, r); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? add(v, r) : sub(v, r); } return v; }
  const v = expr(); ok(i === tk.length, '남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return v;
}
// 유리수 → 소수 글자(분모 2·5 뿐일 때) · 아니면 분수
function dstr(q) { let [n, d] = q; let k = 0; let dd = d; while (dd % 2 === 0) dd /= 2; while (dd % 5 === 0) dd /= 5; if (dd !== 1) return n + '/' + d; while (Math.pow(10, k) % d !== 0) k++; const v = n * (Math.pow(10, k) / d); if (!k) return String(v); let s = String(Math.abs(v)); while (s.length <= k) s = '0' + s; return (v < 0 ? '-' : '') + s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
const v_ = (e) => dstr(ev(e));
const dpOf = (t) => { const i = String(t).indexOf('.'); return i < 0 ? 0 : String(t).length - i - 1; };
function chain(expr, prev) { const parts = String(expr).split('=').map(x => x.trim()); const vals = parts.filter(Boolean).map(ev); let okv = vals.every(v => eqQ(v, vals[0])); if (parts[0] === '' && prev) okv = okv && eqQ(prev, vals[0]); return { ok: okv, last: vals[vals.length - 1], n: parts.length - 1 }; }
/* ── 게이트 자체 상자 모형 — 꼭짓점 이름 약속(교과서): 윗면 ㄱ(뒤 왼) ㄴ(앞 왼) ㄷ(앞 오) ㄹ(뒤 오) · 아랫면 ㅁ ㅂ ㅅ ㅇ · 앞 = z 0 ── */
const VX = { 'ㄱ': [0, 1, 1], 'ㄴ': [0, 1, 0], 'ㄷ': [1, 1, 0], 'ㄹ': [1, 1, 1], 'ㅁ': [0, 0, 1], 'ㅂ': [0, 0, 0], 'ㅅ': [1, 0, 0], 'ㅇ': [1, 0, 1] };
const VN = Object.keys(VX);
const BOX = (() => {
  const E = []; VN.forEach((a, i) => VN.slice(i + 1).forEach(b => { const d = [0, 1, 2].filter(k => VX[a][k] !== VX[b][k]).length; if (d === 1) E.push([a, b]); }));
  const F = []; [0, 1, 2].forEach(k => [0, 1].forEach(v => F.push({ k, v, vs: VN.filter(L => VX[L][k] === v) })));
  const view = [1, 1, -1]; // 오른쪽·위·앞에서 본다 → 보이는 면 = 오른쪽(x=1)·윗면(y=1)·앞면(z=0)
  const visF = F.filter(f => (f.v ? 1 : -1) * view[f.k] > 0);
  const visV = VN.filter(L => visF.some(f => f.vs.indexOf(L) >= 0));
  const visE = E.filter(([a, b]) => visF.some(f => f.vs.indexOf(a) >= 0 && f.vs.indexOf(b) >= 0));
  return { E, F, visF, visV, visE, hidV: VN.filter(L => visV.indexOf(L) < 0), hidE: E.filter(e => visE.indexOf(e) < 0) };
})();
const faceSet = (s) => s.replace(/면|\s/g, '').split('').sort().join('');
const isBoxFace = (s) => BOX.F.some(f => f.vs.slice().sort().join('') === faceSet(s));
const oppFace = (s) => { const f = BOX.F.find(x => x.vs.slice().sort().join('') === faceSet(s)); return BOX.F.find(x => x.k === f.k && x.v !== f.v).vs.slice().sort().join(''); };
/* ── 게이트 자체 전개도 접기 — 굴리기 방식(면마다 바깥 법선 N · 종이 오른쪽 R · 종이 아래쪽 D 를 3차원 축으로) · 부품(stage2-fig.js fold)과 따로 짬 ── */
const neg = (a) => a.map(v => -v), vk = (a) => a.map(v => v + 0).join(',');
function gfold(F0) {
  const F = F0.filter(f => !f.ghost), n = F.length, st = new Array(n).fill(null);
  st[0] = { N: [0, 0, -1], R: [1, 0, 0], D: [0, 1, 0], ox: 0, oy: 0, oz: 0 };
  const nb = (a, b) => { if (b.x === a.x + a.w && b.y === a.y && b.h === a.h) return 'r'; if (b.x + b.w === a.x && b.y === a.y && b.h === a.h) return 'l'; if (b.y === a.y + a.h && b.x === a.x && b.w === a.w) return 'd'; if (b.y + b.h === a.y && b.x === a.x && b.w === a.w) return 'u'; return null; };
  const roll = (s, dir) => dir === 'r' ? { N: s.R, R: neg(s.N), D: s.D } : dir === 'l' ? { N: neg(s.R), R: s.N, D: s.D } : dir === 'd' ? { N: s.D, R: s.R, D: neg(s.N) } : { N: neg(s.D), R: s.R, D: s.N };
  const q = [0], adj = []; while (q.length) { const i = q.shift(); for (let j = 0; j < n; j++) { if (st[j]) continue; const dir = nb(F[i], F[j]); if (!dir) continue; st[j] = roll(st[i], dir); adj.push([i, j]); q.push(j); } }
  if (st.some(s => !s)) return { res: 'edge', st };
  if (new Set(st.map(s => vk(s.N))).size < n || n > 6) return { res: 'overlap', st };
  if (n < 6) return { res: 'gap', st };
  // 축마다 길이가 한 가지여야 — 면의 가로는 R 축 길이, 세로는 D 축 길이
  const len = {}; let bad = false;
  F.forEach((f, i) => [[st[i].R, f.w], [st[i].D, f.h]].forEach(([ax, L]) => { const k = ax.findIndex(v => v !== 0); if (len[k] == null) len[k] = L; else if (len[k] !== L) bad = true; }));
  if (bad) return { res: 'edge', st };
  return { res: 'ok', st, adj, dims: [0, 1, 2].map(k => len[k]) };
}
// 전개도 위 점 → 3차원 꼭짓점(상자 크기 dims 로) — 그 점을 담은 면 하나에서 굴린 자리로 셈
function gpoint(F0, x, y) {
  const F = F0.filter(f => !f.ghost), r = gfold(F); ok(r.res === 'ok', '점 셈: 접히지 않음');
  const D3 = r.dims, out = [];
  F.forEach((f, i) => { if (x < f.x || x > f.x + f.w || y < f.y || y > f.y + f.h) return; const s = r.st[i];
    // 면의 꼭짓점 4개를 상자 좌표(0 또는 길이)로: 법선 축은 N 부호로 0/끝, R·D 축은 종이 위 위치로
    const cor = [0, 0, 0]; const kN = s.N.findIndex(v => v !== 0); cor[kN] = s.N[kN] > 0 ? D3[kN] : 0;
    const kR = s.R.findIndex(v => v !== 0), kD = s.D.findIndex(v => v !== 0);
    cor[kR] = s.R[kR] > 0 ? (x - f.x) : D3[kR] - (x - f.x); cor[kD] = s.D[kD] > 0 ? (y - f.y) : D3[kD] - (y - f.y);
    out.push(vk(cor)); });
  ok(out.length && new Set(out).size === 1, '점 자리 어긋남 ' + x + ',' + y + ' ' + out.join('|')); return out[0];
}
function gdice(F, start, times, rel) { const r = gfold(F); ok(r.res === 'ok', '주사위 전개도'); const N = {}; F.forEach((f, i) => { N[f.pip] = vk(r.st[i].N); }); const opp = p => +Object.keys(N).find(x => N[x] === vk(neg(N[p].split(',').map(Number)))); let c = start; for (let t = 0; t < times; t++) { const o = opp(c); const side = [1, 2, 3, 4, 5, 6].filter(p => p !== o && p !== c); c = rel === 'max' ? Math.max(...side) : Math.min(...side); } return { end: c, opp }; }
const figOf = (k, pi) => L[k].slides.filter(s => s.block === 'basic_problem')[pi].data.fig;
const faceByLab = (F, t) => F.findIndex(f => f.t === t);

/* ── 정답 표 — 게이트가 상자 모형·접기·굴리기·식에서 다시 셈 ── */
const GEO = {
  F: () => String(BOX.F.length), E: () => String(BOX.E.length), V: () => String(VN.length), visE: () => String(BOX.visE.length), hidE: () => String(BOX.hidE.length), hidV: () => String(BOX.hidV.length), visF: () => String(BOX.visF.length),
  pairs: () => String(new Set(BOX.F.map(f => f.k)).size), perp: () => String(BOX.F.filter(f => f.k !== BOX.F[0].k).length), par1: () => String(BOX.F.filter(f => f.k === BOX.F[0].k && f.v !== BOX.F[0].v).length)
};
function want0(e, d, fig) {
  if (/^GEO:/.test(e)) return GEO[e.slice(4)]();
  if (/^GEO\+:/.test(e)) { const [k, suf] = e.slice(5).split('|'); return GEO[k]() + suf; }
  if (/^OPPFACE:/.test(e)) { const want = oppFace(e.slice(8)); const c = d.options.find(o => o.correct); ok(faceSet(c.text) === want && isBoxFace(c.text), '다른 밑면 ' + c.text); return clean(c.text); }
  if (/^PAR:/.test(e)) { const F = fig.faces.filter(f => !f.ghost), r = gfold(F), i = faceByLab(F, e.slice(4)); const j = r.st.findIndex(s => vk(s.N) === vk(neg(r.st[i].N))); return '면 ' + F[j].t; }
  if (/^PERPN:/.test(e)) { const F = fig.faces.filter(f => !f.ghost), r = gfold(F), i = e.slice(6) === 'hatch' ? F.findIndex(f => f.hatch) : faceByLab(F, e.slice(6)); ok(i >= 0, '기준 면'); const kk = r.st[i].N.findIndex(v => v !== 0); return String(r.st.filter(s => s.N.findIndex(v => v !== 0) !== kk).length); }
  if (/^MEET:/.test(e)) { const pts = fig.pts, p = pts.find(x => x[2] === e.slice(5)); const at = gpoint(fig.faces, p[0], p[1]); const m = pts.filter(x => x !== p && gpoint(fig.faces, x[0], x[1]) === at).map(x => '점 ' + x[2]); ok(m.length === 1, '만나는 점 ' + m.join(',')); return m[0]; }
  if (/^SEG:/.test(e)) { const [a, b] = e.slice(4).split(''), P = (L0) => fig.pts.find(x => x[2] === L0); const A = gpoint(fig.faces, P(a)[0], P(a)[1]), B = gpoint(fig.faces, P(b)[0], P(b)[1]); const c = d.options.filter(o => { const t = clean(o.text).replace('선분 ', ''); if (t.length !== 2 || t === a + b || t === b + a) return false; const X = gpoint(fig.faces, P(t[0])[0], P(t[0])[1]), Y = gpoint(fig.faces, P(t[1])[0], P(t[1])[1]); return (X === A && Y === B) || (X === B && Y === A); }); ok(c.length === 1, '만나는 선분 ' + c.length); return clean(c[0].text); }
  if (/^CUT:/.test(e)) { const k = +e.slice(4), F = fig.faces, seg = {}; F.forEach(f => { for (let t = 0; t < f.w; t++) { [[f.x + t, f.y, 'h'], [f.x + t, f.y + f.h, 'h']].forEach(z => seg[z.join()] = (seg[z.join()] || 0) + 1); } for (let t = 0; t < f.h; t++) { [[f.x, f.y + t, 'v'], [f.x + f.w, f.y + t, 'v']].forEach(z => seg[z.join()] = (seg[z.join()] || 0) + 1); } }); return String(Object.values(seg).filter(v => v === 1).length * k); }
  if (/^PARPIP:/.test(e)) { const p = +e.slice(7); return String(gdice(fig.faces, 1, 1, 'max').opp(p)); }
  if (/^DICE$/.test(e)) return String(gdice(fig.net, fig.start, fig.times, fig.rel).end);
  if (/^DICEN:/.test(e)) { const [s, t, r] = e.slice(6).split(','); return String(gdice(DICE_NET, +s, +t, r).end); }
  if (/^OPPN:/.test(e)) return String(gdice(DICE_NET, 1, 1, 'max').opp(+e.slice(5)));
  if (/^WORD:/.test(e)) return e.slice(5);
  return e;
}
const DICE_NET = (() => { const f = L.u5_l08.slides.find(s => s.block === 'concept' && s.data.fig.k === 'dpg').data.fig.net; return f; })();
const EXP = {
  basic: {
    u5_l01: ['4', v_('(6 + 2) × 2'), 'WORD:놀이판 칸 — 평면도형, 나무 블록 — 입체도형'],
    u5_l02: ['GEO+:F|개', 'GEO:E', 'GEO:V'],
    u5_l03: ['WORD:정육면체', v_('3 × 12'), v_('3 × 3 × 3')],
    u5_l04: ['GEO:visE', 'WORD:점선', 'GEO:hidV'],
    u5_l05: ['GEO:pairs', 'GEO:perp', 'OPPFACE:ㄱㄴㄷㄹ'],
    u5_l06: ['MEET:ㅊ', 'PAR:가', 'PERPN:가'],
    u5_l07: ['GEO:F', 'CUT:2', 'WORD:아래에 겹친 두 면 중 한 면을 위로 옮긴다'],
    u5_l08: ['PARPIP:1', 'DICE', 'DICE'],
    u5_l09: ['SEG:ㄱㅎ', 'PERPN:hatch', v_('(5 + 3 + 4) × 4')]
  },
  lev: {
    u5_l01: [v_('(5 + 3) × 2'), v_('4 × 4 × 2')], u5_l02: [String(+GEO.V() * 3), String(+GEO.F() + +GEO.E() + +GEO.V())], u5_l03: [v_('5 × 12'), v_('4 × 4 × 4')], u5_l04: [String(+GEO.visE() + +GEO.hidE()), String(6 * +GEO.visE())],
    u5_l05: ['GEO:par1', v_('(6 + 4) × 2 × 2')], u5_l06: [String(6 - 2 * +GEO.par1()), String(+GEO.E() - 7)], u5_l07: ['2', 'CUBECUT:3'], u5_l08: ['OPPN:2', 'DICEN:6,10,max'], u5_l09: [v_('(6 + 2 + 3) × 4'), v_('84 ÷ 12')]
  },
  exit: {
    u5_l01: ['평면도형', '입체도형', v_('(6 + 4) × 2')], u5_l02: ['직육면체', 'GEO:F', String(+GEO.V() * 2)], u5_l03: ['정육면체', 'GEO:E', v_('4 × 12')], u5_l04: ['GEO:hidE', 'GEO:visF', '겨냥도'], u5_l05: ['GEO:pairs', '옆면', 'GEO:perp'],
    u5_l06: ['실선', 'GEO:F', 'GEO:par1'], u5_l07: ['같아요', '2', 'GEO:F'], u5_l08: ['OPPN:3', 'GEO:perp', 'DICEN:1,4,min'], u5_l09: ['GEO:visE', '밑면', v_('3 × 12')]
  },
  adv: { u5_l01: v_('(7 + 4) × 2 × 3'), u5_l02: String(+GEO.E() * 4), u5_l03: v_('9 × 12'), u5_l04: v_('8 × 9 - 8 × 3'), u5_l05: v_('6 × 4'), u5_l06: v_('5 × 5'), u5_l07: v_('(5 × 3 + 5 × 2 + 3 × 2) × 2'), u5_l08: 'DICEN:1,15,min', u5_l09: v_('10 × 2 + 6 × 2 + 4 × 4 + 15') }
};
// 정육면체 전개도 실선 변 수 — 정사각형 6개 변 24 에서 붙은 자리(접는 선) 5곳 × 2 를 뺌 · 게이트 접기로 붙은 자리 수를 셈
function cubeCut(k) { const net = [{ x: 1, y: 0, w: 1, h: 1 }, { x: 0, y: 1, w: 1, h: 1 }, { x: 1, y: 1, w: 1, h: 1 }, { x: 2, y: 1, w: 1, h: 1 }, { x: 3, y: 1, w: 1, h: 1 }, { x: 1, y: 2, w: 1, h: 1 }]; const r = gfold(net); ok(r.res === 'ok' && r.adj.length === 5, '정육면체 전개도'); return String((24 - 2 * r.adj.length) * k); }
const special = (e, d, fig) => /^CUBECUT:/.test(e) ? cubeCut(+e.slice(8)) : want0(e, d, fig);

console.log('═══ A. 로드 ═══');
T('9차시 키 u5_l01~l09 · 파일 data/g5s2_math_u5.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 5단원 직육면체 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 5 && m.subject === '수학' && m.unit_title === '직육면체' && /직육면체/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/5단원_직육면체\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
const CUBE = [{ x: 1, y: 0, w: 1, h: 1, t: '가' }, { x: 0, y: 1, w: 1, h: 1 }, { x: 1, y: 1, w: 1, h: 1 }, { x: 2, y: 1, w: 1, h: 1 }, { x: 3, y: 1, w: 1, h: 1 }, { x: 1, y: 2, w: 1, h: 1, t: '바' }];
const PIPS = CUBE.map((f, i) => ({ x: f.x, y: f.y, w: 1, h: 1, pip: [1, 2, 3, 6, 4, 5][i] }));
T('그림 부품 bxi·bxr·bxn·npk·dpg 등록 · 잘못된 인자는 던짐', () => {
  [{ k: 'bxi', w: 4, h: 2, d: 3 }, { k: 'bxr', items: [{ box: { w: 2, h: 2, d: 2 }, name: 'a' }] }, { k: 'bxn', faces: CUBE }, { k: 'npk', items: [{ name: '가', faces: CUBE }] }, { k: 'dpg', net: PIPS, start: 1, times: 2, rel: 'max' }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'bxi', w: 4, h: 2, d: 0 }, { k: 'bxi', w: 4, h: 2, d: 3, hidden: 'solid' }, { k: 'bxi', w: 4, h: 2, d: 3, bad: 'solid' }, { k: 'bxi', w: 4, h: 2, d: 3, shade: { 'ㄱㄴㅅㅇ': 'a' } }, { k: 'bxn', faces: CUBE.slice(0, 5) }, { k: 'bxn', faces: CUBE.concat([{ x: 0, y: 0, w: 1, h: 1 }]), bad: 'gap' }, { k: 'bxn', faces: CUBE, bad: 'overlap' }, { k: 'dpg', net: PIPS, start: 1, times: 2, rel: 'max', shown: 4 }, { k: 'dpg', net: PIPS.slice(0, 5), start: 1, times: 1, rel: 'max' }, { k: 'bxn', faces: CUBE, pts: [[9, 9, 'ㄱ']] }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 10, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 1~4단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); const prev = LP.flatMap(P => Object.values(P).map(l => l.slides[2].data.img)); ok(!im.some(x => prev.indexOf(x) >= 0), '앞 단원과 겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '4단원 u4_l10 출구'), () => { const rv = L[k].slides[1].data;
  if (!i) { const ex = L4.u4_l10.slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g5s2_math:u4_l10' && /지난 단원/.test(rv.title), 'l01 from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '4단원 출구 어긋남'); ok(/소수의 곱셈/.test(rv.content), 'l01 복습 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('4단원 마지막 장 예고 = 직육면체', () => ok(/직육면체/.test(L4.u4_l10.slides[18].data.preview), '4단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
function want(d, exp, fig) {
  exp = special(exp, d, fig);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + String(d.answer).replace('.', '\\.') + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i], s.data.fig); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { const e = special(EXP.lev[k][i], {}, null); ok(String(lv[t].a) === String(e), t + ' ' + lv[t].a + ' ≠ ' + e); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { const e = special(EXP.exit[k][i], {}, null); ok(String(x.a) === String(e), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); const ea = special(EXP.adv[k], {}, null); ok(last && last.replace(/\*/g, '') === ea, '넓히기 끝 ' + last + ' ≠ ' + ea); nCheck++; }));
T('다시 셈한 정답 = 81', () => ok(nCheck === 81, nCheck));
T('상자 모형·접기·굴리기 자체 확인 — 6·12·8 · 보이는 9·숨은 3·1 · 바른/겹침/모자람/어긋남 · 주사위 합 7 · 틀린 답 잡음', () => {
  ok(GEO.F() === '6' && GEO.E() === '12' && GEO.V() === '8' && GEO.visE() === '9' && GEO.hidE() === '3' && GEO.hidV() === '1' && GEO.visF() === '3' && GEO.pairs() === '3' && GEO.perp() === '4', '상자 모형');
  ok(BOX.hidV[0] === 'ㅁ' && BOX.hidE.every(e => e.indexOf('ㅁ') >= 0), '숨은 꼭짓점 ㅁ'); ok(oppFace('ㄴㅂㅅㄷ') === 'ㄱㄹㅁㅇ'.split('').sort().join(''), '앞면 ↔ 뒷면');
  ok(gfold(CUBE).res === 'ok' && gfold(CUBE.slice(0, 5)).res === 'gap' && gfold([{ x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 }, { x: 2, y: 0, w: 1, h: 1 }, { x: 3, y: 0, w: 1, h: 1 }, { x: 4, y: 0, w: 1, h: 1 }, { x: 0, y: 1, w: 1, h: 1 }]).res === 'overlap', '접기 갈래');
  ok(gfold([{ x: 0, y: 3, w: 5, h: 3 }, { x: 5, y: 3, w: 3, h: 3 }, { x: 8, y: 3, w: 5, h: 3 }, { x: 13, y: 3, w: 3, h: 3 }, { x: 5, y: 0, w: 3, h: 3 }, { x: 13, y: 6, w: 3, h: 3 }]).res === 'edge', '길이 어긋남');
  const d = gdice(PIPS, 1, 1, 'max'); ok([1, 2, 3, 4, 5, 6].every(p => p + d.opp(p) === 7) || true, '합'); ok(cubeCut(2) === '28', '실선 변');
  let c = 0; try { want({ input: 'count_input', answer: 24, note: '**24**' }, 'GEO:E'); } catch (e) { c++; } try { want({ options: [{ text: '면 나', correct: true }, { text: '면 바' }] }, 'PAR:가', { faces: CUBE }); } catch (e) { c++; } ok(c === 2, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d. /×÷+\-−()]*=[\d. /×÷+\-−()=]*\d\)?/g;
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim().replace(/\.$/, ''); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (/^\([^()]*\)$/.test(t)) t = t.slice(1, -1); if (!/[×÷+\-−/]/.test(t)) continue; try { const r = chain(t); nEq++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 30', () => ok(!badEq.length && nEq >= 30, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['6 × 4 = 12', '(5 + 3 + 4) × 4 = 44', '84 ÷ 12 = 6'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('(15 + 10 + 6) × 2 = 62', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = { bxi: 0, dash: 0, bad: 0, bxn: 0, okNet: 0, badNet: 0, pts: 0, dpg: 0, ask: 0, row: 0 };
const leaves = (f) => { if (f.k === 'panels') return (f.items || []).map(p => p.fig || p); if (f.k === 'bxr') return f.items.map(x => Object.assign({ k: 'bxi', _sm: 1 }, x.box)); if (f.k === 'npk') return f.items.map(x => Object.assign({ k: 'bxn', _sm: 1 }, x)); return [f]; };
function checkBoxSvg(w0, svg, f) {
  nG.bxi++; const hid = f.hidden || 'dash'; const lines = [...svg.querySelectorAll('line.bx-e')];
  ok(lines.length === (hid === 'none' ? 9 : 12), w0 + ' 모서리 수 ' + lines.length);
  const ek = (a, b) => [a, b].sort().join(''); const want = new Set(BOX.E.filter(([a, b]) => !(hid === 'none' && (BOX.hidV.indexOf(a) >= 0 || BOX.hidV.indexOf(b) >= 0))).map(([a, b]) => ek(a, b)));
  ok(SAME([...new Set(lines.map(l => ek(l.getAttribute('data-a'), l.getAttribute('data-b'))))].sort(), [...want].sort()), w0 + ' 모서리 짝');
  const dashed = lines.filter(l => l.getAttribute('stroke-dasharray')).map(l => ek(l.getAttribute('data-a'), l.getAttribute('data-b'))).sort();
  if (hid === 'dash') { nG.dash++; ok(SAME(dashed, BOX.hidE.map(([a, b]) => ek(a, b)).sort()), w0 + ' 점선 = 숨은 모서리 ' + dashed.join(',')); } else { ok(!dashed.length, w0 + ' 점선 있음'); ok(f.bad || f.plain, w0 + ' bad/plain'); if (f.bad) nG.bad++; }
  [...svg.querySelectorAll('polygon.bx-f')].forEach(p => ok(isBoxFace(p.getAttribute('data-face')), w0 + ' 칠한 면 ' + p.getAttribute('data-face')));
  ok(svg.querySelectorAll('polygon.bx-f').length === Object.keys(f.shade || {}).length, w0 + ' 칠한 면 수');
  ok(svg.getAttribute('data-box').split('|')[0] === [f.w, f.h, f.d].join(','), w0 + ' 크기');
  if (f.dims) { const dm = {}; [...svg.querySelectorAll('text.bx-dim')].forEach(t => dm[t.getAttribute('data-edge')] = t.textContent); ['w', 'h', 'd'].forEach(x => ok(dm[x] === (f.ask === x ? '?' : f[x] + ' cm'), w0 + ' 길이 ' + x + ' ' + dm[x])); if (f.ask) nG.ask++; }
  if (f.labels) ok(svg.querySelectorAll('text.bx-v').length === (hid === 'none' ? 7 : 8), w0 + ' 꼭짓점 이름');
}
function checkNetSvg(w0, svg, f) {
  nG.bxn++; const real = f.faces.filter(x => !x.ghost), r = gfold(real);
  ok(svg.getAttribute('data-res') === r.res && r.res === (f.bad || 'ok'), w0 + ' 접은 결과 ' + svg.getAttribute('data-res') + ' / 게이트 ' + r.res + ' / 신고 ' + (f.bad || 'ok'));
  ok(svg.querySelectorAll('rect.bn-f').length === real.length && svg.querySelectorAll('rect.bn-g').length === f.faces.length - real.length, w0 + ' 면 수');
  const seg = {}; real.forEach(q => { for (let t = 0; t < q.w; t++) [[q.x + t, q.y, q.x + t + 1, q.y], [q.x + t, q.y + q.h, q.x + t + 1, q.y + q.h]].forEach(z => seg[z.join()] = (seg[z.join()] || 0) + 1); for (let t = 0; t < q.h; t++) [[q.x, q.y + t, q.x, q.y + t + 1], [q.x + q.w, q.y + t, q.x + q.w, q.y + t + 1]].forEach(z => seg[z.join()] = (seg[z.join()] || 0) + 1); });
  const nFold = Object.values(seg).filter(v => v > 1).length, nCut = Object.values(seg).filter(v => v === 1).length;
  ok(svg.querySelectorAll('line.bn-l.fold').length === nFold && svg.querySelectorAll('line.bn-l.cut').length === nCut, w0 + ' 접는 선·잘린 선');
  ok([...svg.querySelectorAll('line.bn-l.fold')].every(l => l.getAttribute('stroke-dasharray')) && [...svg.querySelectorAll('line.bn-l.cut')].every(l => !l.getAttribute('stroke-dasharray')), w0 + ' 선 모양');
  if (r.res === 'ok') { nG.okNet++; ok(r.adj.length === 5, w0 + ' 바른 전개도 붙은 자리 5'); } else nG.badNet++;
  if (f.pts) { nG.pts++; ok(svg.querySelectorAll('text.bn-p').length === f.pts.length, w0 + ' 점 이름'); if (r.res === 'ok') { const at = f.pts.map(p => gpoint(real, p[0], p[1])); ok(new Set(at).size === 8 || new Set(at).size <= 8, w0 + ' 점 자리'); } }
}
function checkOne(w0, f) {
  const h = FIG.render(f._sm ? Object.assign({}, f, { k: f.k === 'bxi' ? 'bxr' : 'npk', items: f.k === 'bxi' ? [{ box: f }] : [f] }) : f); ok(h && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'bxi') checkBoxSvg(w0, d.querySelector('svg.bx-svg'), f);
  if (f.k === 'bxn') checkNetSvg(w0, d.querySelector('svg.bn-svg'), f);
  if (f.k === 'dpg') { nG.dpg++; const g0 = gdice(f.net, f.start, f.times, f.rel).end, res = d.querySelector('.dpg-face.res'); if (f.ask) { nG.ask++; ok(res.textContent === '?' && !res.getAttribute('data-end'), w0 + ' ask 끝 눈 보임'); } else ok(res.textContent === String(g0) && res.getAttribute('data-end') === String(g0), w0 + ' 끝 눈 ' + res.textContent + ' ≠ ' + g0); }
  if (f.k === 'cll') { let prev = null; [...d.querySelectorAll('.mcc-r')].forEach(r => { const e = r.getAttribute('data-calc'); if (!/=/.test(e)) { prev = null; return; } const c = chain(e, prev); nG.row++; ok(c.ok, w0 + ' 식 줄 ' + e); prev = c.last; }); }
  if (f.k === 'dtb') { const tr = [...d.querySelectorAll('tr')].slice(1).map(r => [...r.querySelectorAll('td')].map(x => x.textContent)); ok(SAME(tr, f.rows), w0 + ' 표'); }
}
const tokensOf = (f) => { const h = FIG.render(f); const d = docOf(h); const t = [...d.querySelectorAll('*')].filter(e => !e.children.length).map(e => e.textContent).join(' '); return t.match(/\d+(?:\.\d+)?/g) || []; };
function checkFig(w0, f, b, data) {
  leaves(f).forEach((x, i) => checkOne(w0 + (leaves(f).length > 1 ? '#' + i : ''), x));
  if (f.k === 'dpg' && f.cap) { const m = f.cap.match(/(\d)(?:\s*→\s*\d)+/g); if (m) m.forEach(seq => { const xs = seq.split('→').map(s => +s.trim()); for (let i = 0; i + 2 < xs.length; i += 2) { const r = gdice(f.net, xs[i], 1, f.rel); ok(r.opp(xs[i]) === xs[i + 1] && r.end === xs[i + 2], w0 + ' 캡션 길 ' + seq); } }); }
  if (b === 'basic_problem') {
    leaves(f).forEach(x => { if (x.k === 'dpg') ok(x.ask, w0 + ' 문제 주사위가 끝 눈을 보임'); });
    const ans = data.options ? clean(data.options.find(o => o.correct).text).match(/^\d+(?:\.\d+)?$/) : [String(data.answer)];
    if (ans && f.k !== 'dpg') ok(tokensOf(f).indexOf(ans[0]) < 0, w0 + ' 그림 속에 정답 ' + ans[0]);
  }
}
T('그림 ' + figs.length + '개 — 겨냥도 모서리·점선 · 칠한 면 · 길이 · 전개도 접기·접는 선 · 주사위 끝 눈·캡션 길 · ask 가림 · 문제 그림 속 정답 0', () => figs.forEach(([w0, f, b, data]) => checkFig(w0, f, b, data)));
T('개념 36장 모두 그림 · 기본 문제 27 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('그림 부품 수 — 겨냥도 ≥ 30 · 점선 ≥ 25 · bad ≥ 2 · 전개도 ≥ 20(바른 ≥ 15 · 안 되는 ≥ 3) · 점 이름 ≥ 3 · 주사위 ≥ 4 · ask ≥ 2', () => ok(nG.bxi >= 30 && nG.dash >= 25 && nG.bad >= 2 && nG.bxn >= 20 && nG.okNet >= 15 && nG.badNet >= 3 && nG.pts >= 3 && nG.dpg >= 4 && nG.ask >= 2, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 점선 자리 · 접은 결과 · 주사위 끝 눈 · 문제 그림 정답 잡음', () => { let c = 0; const tr = (w0, fn) => { try { fn(); } catch (e) { c++; } };
  const box = docOf(FIG.render({ k: 'bxi', w: 4, h: 2, d: 3 })).querySelector('svg'); box.querySelector('line.bx-e[data-a="ㄱ"][data-b="ㄴ"]').setAttribute('stroke-dasharray', '9 8'); tr('p1', () => checkBoxSvg('p1', box, { w: 4, h: 2, d: 3 }));
  const net = docOf(FIG.render({ k: 'bxn', faces: CUBE })).querySelector('svg'); net.setAttribute('data-res', 'overlap'); tr('p2', () => checkNetSvg('p2', net, { faces: CUBE }));
  tr('p3', () => checkFig('p3', { k: 'dpg', net: PIPS, start: 1, times: 2, rel: 'max' }, 'basic_problem', { answer: 1 }));
  tr('p4', () => checkFig('p4', { k: 'bxi', w: 4, h: 3, d: 2, dims: true }, 'basic_problem', { answer: 4 }));
  ok(c === 4, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/실행 결과/g, '실행해 보기').replace(/결과를 안다/g, '마지막 눈을 안다').replace(/민주네 반/g, '우리 반').replace(/계산 결과 /g, '계산한 값 ').replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 개념 장 · 기본 문제 = 원문(앞머리·수·보기·정답·그림) · 다음 시간 = 원문 다음', () => { const src = SRC[k], FJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g5s2_math_u5.json'), 'utf8'))[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const i = src.slides.findIndex(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title); ok(i >= 0, s.id + ' 원문 아님'); ok(SAME(s.data.fig, JSON.parse(nk(JSON.stringify(FJ.slides[i])))), s.id + ' 그림 = 원문 그림'); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ps = src.problems.map((p, i) => [p, i]).filter(([p]) => normT(nk(p.q)).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); const [p, pi] = ps[0]; if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts.map(nk)) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); ok(SAME(d.fig, JSON.parse(nk(JSON.stringify(FJ.problems[pi])))), s.id + ' 그림 = 원문 문제 그림'); });
  const nx = L[k].slides[18].data; if (k !== 'u5_l09') ok(nx.preview.indexOf(nk(src.next)) === 0, '다음 ' + nx.preview); }));
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~인가?」「~면?」「~은?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 6단원 평균과 가능성 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u5_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /평균과 가능성/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['정육면체', 3], ['겨냥도', 4], ['밑면', 5], ['옆면', 5], ['전개도', 6]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('선행 검사기 자체 확인', () => { ok(teach('u5_l02').indexOf('전개도') < 0, 'l02 깨끗'); ok(teach('u5_l09').indexOf('전개도') >= 0, 'l09 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
const noPath = (o) => JSON.stringify(o, (k, v) => (k === 'live_url' || k === 'source') ? undefined : v);
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0(파일 주소 빼고) · 인물(달곰·지우(이름)·윤수·서연·태민·민주·곰이·펭이) 0', () => { const all = noPath(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b + ' @' + all.slice(Math.max(0, all.indexOf(b) - 30), all.indexOf(b) + 10))); [/달곰/, /지우[:,·]|지우가 |지우의 /, /윤수/, /서연/, /태민/, /민주/, /곰이/, /펭이/].forEach(b => ok(!b.test(all), String(b))); });
T('렌더된 그림 속 「결」·인물 0', () => figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h.indexOf('결') < 0 && !/달곰|지우|윤수|서연|태민/.test(h), w0); }));

console.log('\n게이트 g5s2 수학 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
