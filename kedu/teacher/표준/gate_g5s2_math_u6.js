/* gate_g5s2_math_u6.js — 5학년 2학기 수학 6단원 「평균과 가능성」 케이티처 2세대 게이트 (221차, 베프 — gate_g5s2_math_u5 틀 + 평균·가능성 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(잘못된 인자는 던짐) · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 5단원 마지막 차시 u5_l09 출구 → l02 … l09 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 계산기(분수로 평균 · 빠진 값 = 평균 × 자료 수 − 나머지 합 · 반올림 · 「…」 버림 · 가능성 말·수 판정 · 기록과 회전판 견주기)로
     기본 문제 27·수준별 기본·도전 18·출구 27·넓히기 9 를 다시 셈 — 그림이 있으면 그림의 자료에서 셈
   F 식 전수 — 「… = …」 사슬 · 「= 49.3…」(버림 확인) · 「→ 약 49」(반올림 확인) 다시 셈 · 검산기 자체 확인
   G 그림 — abr 평균 눈금·덜어 낸 칸 = 채운 칸·고르게 한 칸 · sfd 자른 선 · bch 막대 값 · bbx·spn 가능성 말 = 게이트 판정 · chl 자리·수 · cll 식 줄 · dtb 표 · 문제 그림 속 정답(문제 글에 없는 수) 0
   H 원문 충실 · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원(6-1 분수의 나눗셈)
   L 선행(「평균」 l02 · 「가능성」 l05 — l01 예외) · M 차단 어휘 · 「결」 0(파일 주소 빼고) · 인물 0(원문 태오·지우·수호·서준·수현·정아·세호·준희·아현·지호·하람 · 곰이·펭이)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u6.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u6.js'));
const L5 = load(path.join(TDIR, 'data/g5s2_math_u5.js'));
const LP = [1, 2, 3, 4, 5].map(u => load(path.join(TDIR, 'data/g5s2_math_u' + u + '.js')));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u6.json'), 'utf8'));
const FJA = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g5s2_math_u6.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '평균과 가능성', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 계산기 — 정수 분자·분모 (부품·생성기와 따로 짬) ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (!d) throw new Error('0으로 나눔'); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]), div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
const eqQ = (a, b) => a[0] === b[0] && a[1] === b[1];
const cmpQ = (a, b) => Math.sign(sub(a, b)[0]);
const numQ = (t) => { const m = String(t).match(/^(\d+)(?:\.(\d+))?$/); if (!m) throw new Error('수 아님 ' + t); const k = m[2] ? m[2].length : 0; return Q(+(m[1] + (m[2] || '')), Math.pow(10, k)); };
function ev(s0) {
  const s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-');
  const tk = s.match(/\d+(?:\.\d+)?|[-+×÷*/()]|\S/g) || []; let i = 0;
  const peek = () => tk[i], next = () => tk[i++];
  function atom() { const t = next(); if (t === '(') { const v = expr(); ok(next() === ')', '괄호'); return v; } if (/^\d/.test(String(t))) return numQ(t); throw new Error('모르는 글자 ' + t + ' in ' + s0); }
  function term() { let v = atom(); while (['×', '*', '/', '÷'].indexOf(peek()) >= 0) { const o = next(), r = atom(); v = (o === '/' || o === '÷') ? div(v, r) : mul(v, r); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? add(v, r) : sub(v, r); } return v; }
  const v = expr(); ok(i === tk.length, '남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return v;
}
function dstr(q) { const [n, d] = q; let dd = d; while (dd % 2 === 0) dd /= 2; while (dd % 5 === 0) dd /= 5; if (dd !== 1) return n + '/' + d; let k = 0; while (Math.pow(10, k) % d !== 0) k++; const v = n * (Math.pow(10, k) / d); if (!k) return String(v); let s = String(Math.abs(v)); while (s.length <= k) s = '0' + s; return (v < 0 ? '-' : '') + s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
const v_ = (e) => dstr(ev(e));
// 반올림(일의 자리) · 버림(k 자리) — 0 이상만
const rnd = (q) => Math.floor((2 * q[0] + q[1]) / (2 * q[1]));
const trunc = (q, k) => { const p = Math.pow(10, k), t = Math.floor(q[0] * p / q[1]); if (!k) return String(t); let s = String(t); while (s.length <= k) s = '0' + s; return s.slice(0, s.length - k) + '.' + s.slice(s.length - k); };
const sumQ = (xs) => xs.reduce((a, x) => add(a, Array.isArray(x) ? x : numQ(String(x))), Q(0));
const avgQ = (xs) => div(sumQ(xs), Q(xs.length));
const AVG = (xs) => dstr(avgQ(xs));
const MISS = (a, n, known) => dstr(sub(mul(numQ(String(a)), Q(n)), sumQ(known)));
// 가능성 — 전체 n 중 t 개(칸) · 말 다섯 칸 · 수는 0 · 1/2 · 1 만
function cword(t, n) { ok(Number.isInteger(t) && Number.isInteger(n) && n > 0 && t >= 0 && t <= n, '가능성 개수'); const r = Q(t, n), h = Q(1, 2); if (!r[0]) return '불가능하다'; if (eqQ(r, Q(1))) return '확실하다'; const c = cmpQ(r, h); return c === 0 ? '반반이다' : c < 0 ? '~아닐 것 같다' : '~일 것 같다'; }
function cnum(t, n) { const w0 = cword(t, n); const m = { '불가능하다': '0', '반반이다': '1/2', '확실하다': '1' }; ok(w0 in m, '0 · 1/2 · 1 로 못 나타냄 ' + t + '/' + n); return m[w0]; }
const lst = (x) => Array.isArray(x) ? x : String(x).split(',').map(s => s.trim()).filter(Boolean);
const cnt = (arr, c) => lst(arr).filter(x => x === c).length;
const pick = (d, test) => { const c = d.options.filter(o => test(clean(o.text))); ok(c.length === 1, '고를 보기 ' + c.length); return clean(c[0].text); };
const rowNums = (fig, r) => fig.rows[r].slice(1).filter(x => /^\d+$/.test(x)).map(Number);

/* ── 정답 표 — 게이트가 셈(그림이 있으면 그림 자료에서) ── */
const EXP = {
  basic: {
    u6_l01: [(d, f) => { const m = Math.max(...f.vals); ok(f.vals.filter(v => v === m).length === 1, '가장 많은 막대 하나'); return f.cats[f.vals.indexOf(m)]; },
      (d, f) => { const xs = rowNums(f, 0); return String(Math.max(...xs) - Math.min(...xs)); },
      (d) => pick(d, t => t === '내년에 세 친구가 같은 반이 된다')],
    u6_l02: [(d, f) => AVG(f.vals), (d, f) => { const a = avgQ(f.vals); ok(eqQ(a, Q(21)), '고르게 한 값 21'); return dstr(sub(a, Q(f.vals[f.names.indexOf('4반')]))); },
      (d, f) => { ok(eqQ(sumQ(f.vals), mul(avgQ(f.vals), Q(f.vals.length))), '전체 양 그대로'); return pick(d, t => /전체 양은 그대로/.test(t)); }],
    u6_l03: [(d, f) => dstr(sumQ(rowNums(f, 0))),
      (d, f) => { const a = avgQ(rowNums(f, 0)), b = avgQ(rowNums(f, 1)); ok(rowNums(f, 0).length === 4 && rowNums(f, 1).length === 5, '모둠 사람 수'); const c = cmpQ(a, b); ok(c !== 0, '같음'); return c > 0 ? '가 모둠' : '나 모둠'; },
      (d, f) => MISS(3000, 4, rowNums(f, 0))],
    u6_l04: [(d) => pick(d, t => /몇 회 하나요\?$/.test(t)), (d, f) => AVG(f.vals),
      (d, f) => { const g = f.vals[f.cats.indexOf('나')]; ok(g === 10, '나 모둠 10'); return pick(d, t => cmpQ(Q(g), numQ('12.8')) < 0 ? /더 적게/.test(t) : /더 많이/.test(t)); }],
    u6_l05: [(d, f) => cword(cnt(f.balls, '파랑'), lst(f.balls).length),
      (d, f) => String(f.items.filter(s => { const w0 = cword(cnt(s.seq, '연두'), lst(s.seq).length); return w0 === '불가능하다' || w0 === '~아닐 것 같다'; }).length),
      (d, f) => { const s = f.items[0]; const w0 = cword(cnt(s.seq, '연두'), lst(s.seq).length); ok(w0 === '~아닐 것 같다', '연두 ' + w0); return pick(d, t => /않을 것 같다$/.test(t)); }],
    u6_l06: [(d, f) => cnum(cnt(f.balls, '파랑'), lst(f.balls).length), (d, f) => { const n = lst(f.items[0].seq).length; ok(n === 8, '8칸'); return dstr(div(Q(n), Q(2))); },
      (d, f) => { const c = f.items.filter(s => cmpQ(Q(cnt(s.seq, '검정'), lst(s.seq).length), Q(1, 2)) > 0); ok(c.length === 1, '1/2 보다 큰 판 ' + c.length); return '회전판 ' + c[0].name; }],
    u6_l07: [(d, f) => { const p = rowNums(f, 0), y = rowNums(f, 1); p.forEach((v, i) => ok(v + y[i] === 100, '100회')); const r = Q(p.reduce((a, b) => a + b, 0), 300); ok(Math.abs(r[0] / r[1] - 0.5) < 0.05, '반반 근처 ' + r); return pick(d, t => /^보라색 카드를 뽑을 가능성은 반반이다$/.test(t)); },
      (d, f) => { const a = rowNums(f, 0), b = rowNums(f, 1); const ra = Q(a[0], a.reduce((x, y) => x + y, 0)), rb = Q(b[0], b.reduce((x, y) => x + y, 0)); const c = cmpQ(ra, rb); ok(c !== 0, '같음'); return pick(d, t => t.indexOf('회전판 ' + (c > 0 ? '가' : '나') + ' —') === 0); },
      (d, f) => { const rec = { 빨강: 20, 노랑: 21, 파랑: 39 }, N = 80; const dist = f.items.map(s => { const n = lst(s.seq).length; return Object.keys(rec).reduce((a, c) => a + Math.abs(cnt(s.seq, c) / n - rec[c] / N), 0); }); const m = Math.min(...dist); ok(dist.filter(x => x === m).length === 1, '가장 비슷한 판 하나'); return '회전판 ' + f.items[dist.indexOf(m)].name; }],
    u6_l08: [(d, f) => { ok(f.rows[0][5] === '?', '합계 칸 ?'); return dstr(sumQ(rowNums(f, 0))); }, (d, f) => String(rnd(avgQ(rowNums(f, 0)))),
      (d, f) => { const n = rowNums(f, 0), s = rowNums(f, 1); const a = Q(s[0], n[0]), b = Q(s[1], n[1]); ok(eqQ(a, Q(35)) && rnd(b) === 48, '평일 35 · 주말 약 48'); return pick(d, t => cmpQ(b, a) > 0 ? /주말에 더 많이/.test(t) : /평일에 더 많이/.test(t)); }],
    u6_l09: [(d, f) => AVG(rowNums(f, 0)),
      (d, f) => { const r = f.items.map(b => [b.name, Q(cnt(b.balls, '빨강'), lst(b.balls).length)]); r.sort((x, y) => cmpQ(y[1], x[1])); ok(new Set(r.map(x => x[1].join('/'))).size === r.length, '같은 가능성'); return r.map(x => x[0]).join(', '); },
      (d, f) => MISS(263, 5, rowNums(f, 0))]
  },
  lev: {
    u6_l01: [v_('25 + 27'), v_('5 + 8 + 4 + 3')], u6_l02: [AVG([4, 2, 3]), AVG([6, 2, 5, 3])], u6_l03: [AVG([200, 250, 300]), MISS(30, 4, [28, 35, 25])],
    u6_l04: [AVG([3, 5, 4, 8]), dstr([ev('52 ÷ 4'), ev('60 ÷ 5')].sort((a, b) => cmpQ(b, a))[0])], u6_l05: [cword(3, 3), cword(5, 6)], u6_l06: [cnum(5, 5), v_('10 ÷ 2')],
    u6_l07: [v_('200 - 98'), String(rnd(mul(Q(76, 100), Q(4))))], u6_l08: [String(rnd(avgQ([82, 40, 26]))), String(rnd(avgQ([268, 174, 60])) - 25)], u6_l09: [AVG([18, 22, 20, 24]), v_('6 ÷ 2')]
  },
  exit: {
    u6_l01: ['많아요', v_('8 - 5'), v_('24 + 25')], u6_l02: ['평균', AVG([3, 5, 4]), AVG([200, 400])], u6_l03: ['자료 수', AVG([6, 8, 7]), v_('5 × 4')],
    u6_l04: ['약속', AVG([9, 11, 10]), cmpQ(Q(10), numQ('12.8')) < 0 ? '더 적게' : '더 많이'], u6_l05: [cword(1, 2), cword(0, 3), cword(3, 4)], u6_l06: [cnum(1, 1), cnum(1, 2), cnum(0, 6)],
    u6_l07: ['아니요', v_('8 ÷ 2'), cmpQ(Q(3, 30), Q(1, 2)) < 0 ? '작아요' : '커요'], u6_l08: ['일의 자리', String(rnd(avgQ([29, 12, 35]))), '평균'], u6_l09: ['자룟값의 합', AVG([10, 14, 12]), cnum(2, 4)]
  },
  adv: { u6_l01: v_('24 + 25 + 27 + 28 + (28 - 3)'), u6_l02: AVG([500, 300, 400, 400]), u6_l03: MISS(8, 5, [9, 7, 10, 7]), u6_l04: MISS(6, 6, [4, 6, 5, 3, 7]), u6_l05: v_('5 - 8 ÷ 2'), u6_l06: v_('12 ÷ 2 - 4'), u6_l07: cnum(150, 300), u6_l08: MISS(120, 4, [230, 30, 70]), u6_l09: MISS(6, 5, [5, 7, 6, 4]) }
};
// 넓히기 맥락 속 수 = 게이트가 셈에 쓴 수(맥락이 바뀌면 잡음)
const ADVCTX = { u6_l01: [8, 24, 9, 25, 10, 27, 11, 28, 12, 11, 3], u6_l02: [500, 300, 400, 400], u6_l03: [8, 9, 7, 10, 7], u6_l04: [4, 6, 5, 3, 7, 6], u6_l05: [8, 3, 5], u6_l06: [12, 4], u6_l07: [300, 150, 75, 75], u6_l08: [120, 230, 30, 70], u6_l09: [6, 5, 7, 6, 4] };

console.log('═══ A. 로드 ═══');
T('9차시 키 u6_l01~l09 · 파일 data/g5s2_math_u6.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 6단원 평균과 가능성 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 6 && m.subject === '수학' && m.unit_title === '평균과 가능성' && /평균/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/6단원_평균과가능성\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
T('그림 부품 abr·sfd·bch·bbx·spn·chl·u6r 등록 · 잘못된 인자는 던짐(11)', () => {
  [{ k: 'abr', vals: [4, 2, 3] }, { k: 'abr', vals: [4, 2, 3], mode: 'move', line: true }, { k: 'sfd', vals: [3, 5], n: 2 }, { k: 'bch', cats: ['가', '나'], vals: [3, 5], max: 6 }, { k: 'bbx', balls: '파랑,빨강', tgt: '파랑', want: '반반이다' }, { k: 'spn', seq: '연두,보라,보라,보라', tgt: '연두', want: '~아닐 것 같다' }, { k: 'chl', nums: true, marks: [{ at: 'high', label: '가' }] }, { k: 'u6r', items: [{ k: 'spn', seq: '파랑,노랑' }] }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'abr', vals: [1, 2] }, { k: 'abr', vals: [1, 3], names: ['가'] }, { k: 'abr', vals: [150, 250], step: 100 }, { k: 'abr', vals: [1, 3], mode: 'x' }, { k: 'sfd', vals: [3, 2], n: 2 }, { k: 'bch', cats: ['가'], vals: [5], max: 4 }, { k: 'bbx', balls: '분홍' }, { k: 'bbx', balls: '파랑,빨강', tgt: '파랑', want: '확실하다' }, { k: 'spn', seq: '연두,보라,보라', tgt: '연두', want: '반반이다' }, { k: 'spn', seq: '연두' }, { k: 'chl', marks: [{ at: 'low', label: '1/4' }] }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 11, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 1~5단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); const prev = LP.flatMap(P => Object.values(P).map(l => l.slides[2].data.img)); ok(!im.some(x => prev.indexOf(x) >= 0), '앞 단원과 겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '5단원 u5_l09 출구'), () => { const rv = L[k].slides[1].data;
  if (!i) { const ex = L5.u5_l09.slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g5s2_math:u5_l09' && /지난 단원/.test(rv.title), 'l01 from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '5단원 출구 어긋남'); ok(/직육면체/.test(rv.content), 'l01 복습 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('5단원 마지막 장 예고 = 평균과 가능성', () => ok(/평균과 가능성/.test(L5.u5_l09.slides[18].data.preview), '5단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
function want(d, exp) {
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); ok(new Set(d.options.map(o => clean(o.text))).size === d.options.length, '보기 중복'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + String(d.answer).replace('.', '\\.') + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i](s.data, s.data.fig)); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { const e = EXP.lev[k][i]; ok(String(lv[t].a) === String(e), t + ' ' + lv[t].a + ' ≠ ' + e); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { const e = EXP.exit[k][i]; ok(String(x.a) === String(e), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  const ad = sl[14].data, last = (ad.note.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]);
  ok(SAME((clean(ad.context).match(/\d+(?:\.\d+)?/g) || []).map(Number), ADVCTX[k]), '넓히기 맥락 수 ' + ad.context); nCheck++; }));
T('다시 셈한 정답 = 81', () => ok(nCheck === 81, nCheck));
T('계산기 자체 확인 — 평균·빠진 값·반올림·버림·가능성 말/수 · 틀린 답 잡음', () => {
  ok(AVG([300, 200, 500, 200, 300]) === '300' && AVG([6, 3, 5, 6]) === '5' && MISS(263, 5, [270, 257, 300, 250]) === '238', '평균·빠진 값');
  ok(rnd(avgQ([756, 596, 279])) === 544 && rnd(Q(95, 2)) === 48 && rnd(Q(148, 3)) === 49 && trunc(Q(1631, 3), 1) === '543.6' && trunc(Q(76, 3), 1) === '25.3', '반올림·버림');
  ok(cword(0, 4) === '불가능하다' && cword(1, 4) === '~아닐 것 같다' && cword(2, 4) === '반반이다' && cword(3, 4) === '~일 것 같다' && cword(4, 4) === '확실하다' && cnum(3, 6) === '1/2', '가능성');
  let c = 0; try { cnum(1, 4); } catch (e) { c++; } try { want({ input: 'count_input', answer: 24, note: '**24**' }, '25'); } catch (e) { c++; } try { want({ options: [{ text: '반반이다', correct: true }, { text: '확실하다' }] }, cword(3, 4)); } catch (e) { c++; } ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d. /×÷+\-−()]*=[\d. /×÷+\-−()=…→약]*[\d…]\)?/g;
// 사슬 — 부분마다: 식 · 「49.3…」(앞 값을 버림한 글) · 「… → 약 49」(앞 값을 반올림)
function chain(expr, prev) {
  const parts = String(expr).split('=').map(x => x.trim()); let cur = null, okv = true, n = 0;
  if (parts[0] === '' && prev) cur = prev;
  parts.forEach(p0 => { if (!p0) return; let p = p0, about = null; const ab = p.match(/^(.*?)\s*→\s*약\s*(\d+)$/); if (ab) { p = ab[1].trim(); about = +ab[2]; }
    const tr = p.match(/^(\d+)(?:\.(\d+))?…$/); let v;
    if (tr) { ok(cur, '「…」 앞 값 없음'); const k = tr[2] ? tr[2].length : 0; okv = okv && trunc(cur, k) === (tr[1] + (k ? '.' + tr[2] : '')) && !eqQ(cur, numQ(tr[1] + (k ? '.' + tr[2] : ''))); v = cur; }
    else { v = ev(p); if (cur) okv = okv && eqQ(v, cur); }
    if (about !== null) okv = okv && rnd(v) === about;
    cur = v; n++; });
  return { ok: okv, last: cur, n };
}
let nEq = 0, nAbout = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, '').replace(/\s+→\s*약/g, ' →약').replace(/→약/g, '→ 약'); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim().replace(/\.$/, ''); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (/^\([^()]*\)$/.test(t)) t = t.slice(1, -1); if (!/[×÷+\-−/…]/.test(t)) continue; try { const r = chain(t); nEq++; if (/…|약/.test(t)) nAbout++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ', 버림·반올림 ' + nAbout + ') 틀림 0 · ≥ 30', () => ok(!badEq.length && nEq >= 30, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식·틀린 버림·틀린 반올림 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['56 ÷ 4 = 15', '148 ÷ 3 = 49.4…', '1631 ÷ 3 = 543.6… → 약 543', '95 ÷ 2 = 47.5 → 약 47'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 4, '틀린 식 못 잡음 ' + (badEq.length - b0)); badEq.length = b0; ['502 ÷ 3 = 167.3… → 약 167', '1315 − 270 − 257 − 300 − 250 = 238'].forEach(t => eqText(t, 'probe')); ok(badEq.length === b0, '맞는 식을 틀렸다 함 ' + badEq.slice(b0).join('|')); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = { abr: 0, move: 0, even: 0, sfd: 0, bch: 0, bbx: 0, spn: 0, judged: 0, chl: 0, row: 0, dtb: 0 };
const leaves = (f) => f.k === 'u6r' ? f.items : f.k === 'panels' ? (f.items || []).map(p => p.fig || p) : [f];
function checkOne(w0, f, d) {
  if (f.k === 'abr') { nG.abr++; const svg = d.querySelector('svg.ab-svg'), step = f.step || 1, mode = f.mode || 'raw', a = avgQ(f.vals); ok(a[1] === 1 && (a[0] % step) === 0, w0 + ' 평균이 칸에 맞지 않음');
    const av = a[0] / step, at = svg.getAttribute('data-avg').split('|'); ok(at[3] === String(a[0]) && at[2] === mode, w0 + ' 평균 ' + at[3] + ' ≠ ' + a[0]);
    const cs = [...svg.querySelectorAll('rect.ab-c')], per = f.vals.map((_, i) => cs.filter(c => c.getAttribute('data-i') === String(i)));
    if (mode === 'raw') per.forEach((p, i) => ok(p.length === f.vals[i] / step && p.every(c => c.getAttribute('data-s') === 'keep'), w0 + ' raw 칸 ' + i));
    if (mode === 'even') { nG.even++; per.forEach((p, i) => ok(p.length === av, w0 + ' even 칸 ' + i)); }
    if (mode === 'move') { nG.move++; const out = f.vals.reduce((s, v) => s + Math.max(0, v / step - av), 0); ok(cs.filter(c => c.getAttribute('data-s') === 'out').length === out && cs.filter(c => c.getAttribute('data-s') === 'in').length === out, w0 + ' 덜어 낸 칸 = 채운 칸 = ' + out); per.forEach((p, i) => ok(p.filter(c => c.getAttribute('data-s') !== 'out').length === av, w0 + ' 옮긴 뒤 ' + i)); }
    if (f.line) ok(svg.querySelectorAll('line.ab-line').length === 1, w0 + ' 평균 선');
    if (f.ask) ok(![...svg.querySelectorAll('text.ab-tick')].some(t => t.textContent === String(a[0])), w0 + ' ask 평균 눈금 보임');
    ok(SAME([...svg.querySelectorAll('text.ab-name')].map(t => t.textContent), f.names || f.vals.map((_, i) => String(i + 1))), w0 + ' 이름');
    if (f.show && mode !== 'even') ok(SAME([...svg.querySelectorAll('text.ab-val')].map(t => +t.textContent), f.vals), w0 + ' 값 글자'); }
  if (f.k === 'sfd') { nG.sfd++; const svg = d.querySelector('svg.sf-svg'), tot = f.vals.reduce((a, b) => a + b, 0), n = f.n || f.vals.length; ok(tot % n === 0, w0 + ' 나누어떨어짐'); ok(svg.querySelectorAll('rect.sf-c').length === tot && svg.querySelectorAll('line.sf-cut').length === (f.hideFold ? 0 : n - 1), w0 + ' 칸·자른 선'); ok(svg.getAttribute('data-strip').split('|')[2] === String(tot / n), w0 + ' 한 몫'); if (f.cap && /칸을 (\d+)등분 — 한 칸에 (\d+)/.test(f.cap)) { const m = f.cap.match(/(\d+)칸을 (\d+)등분 — 한 칸에 (\d+)/); ok(+m[1] === tot && +m[2] === n && +m[3] === tot / n, w0 + ' 캡션 ' + f.cap); } }
  if (f.k === 'bch') { nG.bch++; const bs = [...d.querySelectorAll('rect.bc-b')]; ok(SAME(bs.map(b => +b.getAttribute('data-v')), f.vals), w0 + ' 막대 값'); const top = f.max || Math.max(...f.vals); ok(top % (f.tick || 1) === 0, w0 + ' 눈금'); const h = bs.map(b => +b.getAttribute('height')); f.vals.forEach((v, i) => ok(Math.abs(h[i] - h[0] * (f.vals[0] ? v / f.vals[0] : 0)) < 0.6 || !f.vals[0], w0 + ' 막대 높이 비'));
    if (f.show) ok(SAME([...d.querySelectorAll('text.bc-val')].map(t => t.textContent), f.vals.map((v, i) => (f.ask || []).indexOf(i) >= 0 ? '?' : String(v))), w0 + ' 값 글자'); ok(SAME([...d.querySelectorAll('text.bc-cat')].map(t => t.textContent), f.cats), w0 + ' 항목'); }
  if (f.k === 'bbx' || f.k === 'spn') { nG[f.k]++; const arr = lst(f.k === 'bbx' ? f.balls : f.seq), svg = d.querySelector(f.k === 'bbx' ? 'svg.bb-svg' : 'svg.sp-svg'); ok(SAME([...svg.querySelectorAll(f.k === 'bbx' ? 'circle.bb-b' : 'path.sp-s')].map(x => x.getAttribute('data-c')), arr), w0 + ' 공·칸 색');
    if (f.tgt) { nG.judged++; const g0 = cword(cnt(arr, f.tgt), arr.length); ok(svg.getAttribute(f.k === 'bbx' ? 'data-balls' : 'data-spin').split('|')[2] === g0, w0 + ' 부품 판정 ≠ 게이트 ' + g0); if (f.want !== undefined) ok(f.want === g0, w0 + ' 신고 ' + f.want + ' ≠ ' + g0); } }
  if (f.k === 'chl') { nG.chl++; const b = d.querySelector('.cl-band'); ok(SAME([...b.querySelectorAll('.cl-word')].map(x => x.textContent), ['불가능하다', '~아닐 것 같다', '반반이다', '~일 것 같다', '확실하다']), w0 + ' 말 다섯 칸'); ok(b.querySelectorAll('.cl-num').length === (f.nums ? 3 : 0), w0 + ' 수 눈금'); ok(SAME([...b.querySelectorAll('.cl-mark')].map(x => x.getAttribute('data-at')), (f.marks || []).map(m => String(m.at))), w0 + ' 표시 자리'); (f.marks || []).forEach(m => { if (m.at === 'low' || m.at === 'high') ok(!/\d+\s*\/\s*\d+|^\s*\d+(\.\d+)?\s*$|0\.\d/.test(m.label || ''), w0 + ' 「~것 같다」 자리에 수 ' + m.label); }); }
  if (f.k === 'cll') { let prev = null; [...d.querySelectorAll('.mcc-r')].forEach(r => { const e = r.getAttribute('data-calc'); if (!/=/.test(e) || !/\d/.test(e)) { prev = null; return; } const c = chain(e, prev); nG.row++; ok(c.ok, w0 + ' 식 줄 ' + e); prev = c.last; }); }
  if (f.k === 'dtb') { nG.dtb++; const tr = [...d.querySelectorAll('tr')].slice(1).map(r => [...r.querySelectorAll('td')].map(x => x.textContent)); ok(SAME(tr, f.rows), w0 + ' 표'); }
}
const tokensOf = (h) => { const d = docOf(h); [...d.querySelectorAll('.cl-num, text.ab-name, text.bc-cat, .u6-n')].forEach(e => e.remove()); /* 이름표(2반·1번)는 수량이 아님 */ const t = [...d.querySelectorAll('*')].filter(e => !e.children.length).map(e => e.textContent).join(' '); return t.match(/\d+(?:\.\d+)?/g) || []; };
function checkFig(w0, f, b, data) {
  const h = FIG.render(f); ok(h && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'u6r') { const it = [...d.querySelectorAll('.u6-item, .fig-bch, .fig-abr')].filter(x => !x.parentElement.closest('.u6-item')); ok(it.length === f.items.length, w0 + ' 나란히 수'); }
  leaves(f).forEach((x, i) => checkOne(w0 + (leaves(f).length > 1 ? '#' + i : ''), x, docOf(FIG.render(x))));
  if (b === 'basic_problem') { const ans = data.options ? clean(data.options.find(o => o.correct).text).match(/^\d+(?:\.\d+)?$/) : [String(data.answer)]; if (ans) { const inQ = (clean(data.question).match(/\d+(?:\.\d+)?/g) || []).indexOf(ans[0]) >= 0; ok(inQ || tokensOf(h).indexOf(ans[0]) < 0, w0 + ' 그림 속에 정답 ' + ans[0]); } }
}
T('그림 ' + figs.length + '개 — 평균 눈금·덜어 낸 칸 = 채운 칸 · 띠 자른 선 · 막대 값 · 공·회전판 가능성 말 · 가능성 띠 · 식 줄 · 표 · 문제 그림 속 정답 0', () => figs.forEach(([w0, f, b, data]) => checkFig(w0, f, b, data)));
T('개념 36장 모두 그림 · 기본 문제 27 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('그림 부품 수 — abr ≥ 8(move ≥ 4 · even ≥ 1) · sfd ≥ 2 · bch ≥ 6 · bbx ≥ 6 · spn ≥ 15 · 판정 ≥ 10 · chl ≥ 4 · 식 줄 ≥ 10 · 표 ≥ 10', () => ok(nG.abr >= 8 && nG.move >= 4 && nG.even >= 1 && nG.sfd >= 2 && nG.bch >= 6 && nG.bbx >= 6 && nG.spn >= 15 && nG.judged >= 10 && nG.chl >= 4 && nG.row >= 10 && nG.dtb >= 10, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 평균 눈금 · 덜어 낸 칸 · 가능성 판정 · 문제 그림 정답 잡음', () => { let c = 0; const tr = (fn) => { try { fn(); } catch (e) { c++; } };
  const a = docOf(FIG.render({ k: 'abr', vals: [4, 2, 3], mode: 'move' })); a.querySelector('svg').setAttribute('data-avg', '4,2,3|1|move|4|0'); tr(() => checkOne('p1', { k: 'abr', vals: [4, 2, 3], mode: 'move' }, a));
  const b = docOf(FIG.render({ k: 'abr', vals: [4, 2, 3], mode: 'move' })); b.querySelector('rect.ab-c[data-s="in"]').setAttribute('data-s', 'keep'); tr(() => checkOne('p2', { k: 'abr', vals: [4, 2, 3], mode: 'move' }, b));
  const s = docOf(FIG.render({ k: 'spn', seq: '연두,보라,보라,보라', tgt: '연두' })); s.querySelector('svg').setAttribute('data-spin', '연두,보라,보라,보라|연두|반반이다'); tr(() => checkOne('p3', { k: 'spn', seq: '연두,보라,보라,보라', tgt: '연두' }, s));
  tr(() => checkFig('p4', { k: 'dtb', head: ['', '가'], rows: [['합', '238']] }, 'basic_problem', { question: '목요일은 몇 g 일까요?', answer: 238 }));
  ok(c === 4, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 ═══');
const NK = [[/결정하는/g, '정하는'], [/이 결과와/g, '이 기록과'], [/뽑은 결과/g, '뽑은 기록'], [/잰 결과/g, '잰 기록'], [/차례 결과가/g, '차례 기록이'], [/굴린 결과/g, '굴린 기록'], [/계산 결과가/g, '계산한 값이'], [/계산 결과 /g, '계산한 값 '], [/결과/g, '기록'], [/해결/g, '풀이'],
  [/태오가 /g, '한 친구가 '], [/태오는 /g, '이 친구는 '], [/지우의 /g, '한 친구의 '], [/수호가 /g, '한 친구가 '], [/수호의 /g, '한 친구의 '], [/수호네 집의/g, '어느 집의'], [/서준이가 /g, '한 친구가 '], [/수현이가 /g, '한 친구가 '],
  [/정아네 모둠/g, '가 모둠'], [/세호네 모둠/g, '나 모둠'], [/정아네/g, '가 모둠'], [/세호네/g, '나 모둠'],
  [/"이름","준희","아현","지호","하람"/g, '"번호","1번","2번","3번","4번"'], [/\["준희","아현","지호","하람"\]/g, '["1번","2번","3번","4번"]'], [/준희 (\d+)회, 아현 (\d+)회, 지호 (\d+)회, 하람 (\d+)회/g, '1번 $1회, 2번 $2회, 3번 $3회, 4번 $4회']];
const nk = (s) => NK.reduce((a, [r, b]) => a.replace(r, b), String(s));
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
const own = { con: 0, prob: 0 };
KEYS.forEach(k => T(k + ' 개념 = 원문 개념 장 · 기본 문제 = 원문(앞머리·수·보기·정답) · 그림 = 원문 또는 2세대 바꿈 · 다음 시간 = 원문 다음', () => { const src = SRC[k], FJ = FJA[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const i = src.slides.findIndex(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title); ok(i >= 0, s.id + ' 원문 아님'); if (!SAME(s.data.fig, JSON.parse(nk(JSON.stringify(FJ.slides[i] || null))))) own.con++; });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ps = src.problems.map((p, i) => [p, i]).filter(([p]) => normT(nk(p.q)).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(nk(p.q)) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); const [p, pi] = ps[0]; if (p.opts) ok(d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); if (!SAME(d.fig, JSON.parse(nk(JSON.stringify(FJ.problems[pi] || null))))) own.prob++; });
  const nx = L[k].slides[18].data; if (k !== 'u6_l09') ok(nx.preview.indexOf(nk(src.next)) === 0, '다음 ' + nx.preview); }));
T('2세대가 바꾼 그림 수 기록 — 개념 ' + own.con + ' · 문제 ' + own.prob + ' (바꾼 그림도 위 G 검산을 모두 통과)', () => ok(own.con <= 36 && own.prob <= 27, JSON.stringify(own)));
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
  const badQ = qs.filter(([, q]) => { const t = clean(q).replace(/\s*\(계산기를 써도 돼요\)$/, ''); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t.replace(/“[^”]*”/g, '')); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 5학년 2학기 수학 끝 · 6-1 분수의 나눗셈 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u6_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /분수의 나눗셈/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['평균', 2], ['가능성', 5]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('선행 검사기 자체 확인', () => { ok(teach('u6_l03').indexOf('가능성') < 0, 'l03 깨끗'); ok(teach('u6_l09').indexOf('가능성') >= 0, 'l09 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
const noPath = (o) => JSON.stringify(o, (k, v) => (k === 'live_url' || k === 'source') ? undefined : v);
const PEOPLE = [/태오/, /지우/, /수호/, /서준/, /수현/, /정아/, /세호/, /준희/, /아현/, /지호/, /하람/, /달곰/, /곰이/, /펭이/];
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0(파일 주소 빼고) · 인물(원문 이름 11 · 달곰·곰이·펭이) 0', () => { const all = noPath(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b + ' @' + all.slice(Math.max(0, all.indexOf(b) - 30), all.indexOf(b) + 10))); PEOPLE.forEach(b => ok(!b.test(all), String(b) + ' @' + (all.match(new RegExp('.{0,20}' + b.source + '.{0,10}')) || [''])[0])); });
T('렌더된 그림 속 「결」·인물 0', () => figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h.indexOf('결') < 0 && !PEOPLE.some(b => b.test(h)), w0); }));

console.log('\n게이트 g5s2 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
