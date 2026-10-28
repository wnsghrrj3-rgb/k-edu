/* gate_g5s2_math_u2.js — 5학년 2학기 수학 2단원 「분수의 곱셈」 케이티처 2세대 게이트 (217차, 베프 — gate_g5s2_math_u1 틀 + 분수 계산기 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록 · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 4학년 분수의 덧셈·5-1 약분 되짚기 → l02 … l09 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 분수 계산기(정수 분자·분모, 기약)로 기본 문제 27·수준별 기본·도전 18·출구 27·되짚기 3·넓히기 9 를 식에서 다시 셈
     (분자·분모·자연수 부분·대분수·가분수·칸 수·「5보다 큰 것」은 cmm 부등호로) — 보기 정답·수 입력 답·풀이 끝 대조
   F 식 전수 — 개념 글·요약·교사 층 글 속 「… = …」 사슬을 분수 계산기로 다시 셈(오개념 「틀린 생각」 칸만 뺌) · 검산기 자체 확인
   G 그림 — mcc·fln·wyc 계산 줄 사슬(bad 줄은 틀려야 함) · cmm 부등호 = 셈 · opb 묶음 값·끝 이름표 = 전체×n/d · agr 빗금 칸 = an×bn · 전체 = ad×bd
     · mln 끝 이름표 = 걸음×횟수 · mxr 칸 · ask 그림은 답(끝 이름표·칸 수·묶음 값·부등호)을 그리지 않음 · 검사기 자체 확인
   H 원문 충실(개념 글 = 원문 · 기본 문제 = 원문 앞머리·수·보기·정답) · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원
   L 선행(「가분수로 고쳐」 l03 · 「분모끼리」 l06 — l01 예외) · M 차단 어휘 · 「결」 0 · 곰이·펭이 0(원문 「달곰이」 빼고)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u2.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u2.js'));
const L1 = load(path.join(TDIR, 'data/g5s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '분수의 곱셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 분수 계산기 (부품·생성기와 따로 짬) ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (!d) throw new Error('0으로 나눔'); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]), div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
const eqQ = (a, b) => a[0] === b[0] && a[1] === b[1];
function ev(s0) { // 「w n/d」 대분수 · n/d · + − × ÷ ( ) — 대분수는 먼저 한 덩이로
  let s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d+)\s+(\d+)\/(\d+)/g, '[$1+$2/$3]').replace(/\[/g, '(').replace(/\]/g, ')');
  const tk = s.match(/\d+|[-+×÷*/()]|\S/g) || []; let i = 0;
  const peek = () => tk[i], next = () => tk[i++];
  function atom() { const t = next(); if (t === '(') { const v = expr(); ok(next() === ')', '괄호'); return v; } if (/^\d+$/.test(t)) return Q(+t, 1); throw new Error('모르는 글자 ' + t + ' in ' + s0); }
  function term() { let v = atom(); while (['×', '*', '/', '÷'].indexOf(peek()) >= 0) { const o = next(), r = atom(); v = (o === '/' || o === '÷') ? div(v, r) : mul(v, r); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? add(v, r) : sub(v, r); } return v; }
  const v = expr(); ok(i === tk.length, '남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return v;
}
const fstr = (q) => q[1] === 1 ? String(q[0]) : q[0] + '/' + q[1];
const mix = (q) => { const wv = Math.floor(q[0] / q[1]), r = q[0] - wv * q[1]; return r === 0 ? String(wv) : (wv ? wv + ' ' : '') + r + '/' + q[1]; };
const whole = (q) => Math.floor(q[0] / q[1]);
// 사슬 검사 — 「a = b = c」 모두 같은가 · cont 면 앞 줄 값과도 같아야
function chain(expr, prev) { const parts = String(expr).split('=').map(x => x.trim()); const vals = parts.filter(Boolean).map(ev); let okv = vals.every(v => eqQ(v, vals[0])); if (parts[0] === '' && prev) okv = okv && eqQ(prev, vals[0]); return { ok: okv, last: vals[vals.length - 1], n: parts.length - 1 }; }

/* ── 정답 표 — 게이트가 식에서 다시 셈 (mode: n 분자 · d 분모 · w 자연수 부분 · mix 대분수 · frac 기약 분수 · v 값 · raw 그대로) ── */
const n_ = (e) => ev(e)[0], d_ = (e) => ev(e)[1], w_ = (e) => whole(ev(e)), m_ = (e) => mix(ev(e)), f_ = (e) => fstr(ev(e)), v_ = (e) => fstr(ev(e));
const EXP = {
  basic: {
    u2_l01: [f_('5/30'), m_('3/7 + 6/7'), n_('3/10 + 3/10 + 3/10')],
    u2_l02: [n_('1/4 × 3'), f_('2/5 × 4'), d_('7/12 × 8')],
    u2_l03: [f_('1 1/4'), m_('2 1/3 × 5'), 'WORD:대분수를 가분수로 나타내지 않고 먼저 약분했다'],
    u2_l04: [v_('6 × 1/3'), m_('9 × 5/6'), v_('60 × 1/5')],
    u2_l05: [m_('2 × 1 2/5'), m_('8 × 1 5/6'), 'CMM5'],
    u2_l06: [String(5 * 3), f_('4/5 × 2/3'), d_('3/8 × 5/9')],
    u2_l07: [m_('2 2/5 × 1 3/4'), f_('1/2 × 2/3 × 5/7'), v_('160 × 5/8 × 3/5')],
    u2_l08: ['WORD:전체 주민 수', v_('270 × 2/3'), v_('430 × 3/5 - 195')],
    u2_l09: [m_('5 × 1 2/9'), f_('2/3 × 9/14'), v_('24 × 1/8')]
  },
  lev: {
    u2_l01: [n_('1/7 + 1/7 + 1/7 + 1/7'), n_('20/24')], u2_l02: [n_('2/9 × 4'), d_('5/8 × 6')], u2_l03: [n_('1 2/5 × 3'), w_('2 3/4 × 6')],
    u2_l04: [v_('10 × 1/5'), v_('14 × 3/7')], u2_l05: [w_('3 × 1 1/2'), w_('6 × 2 3/4')], u2_l06: [d_('1/3 × 1/6'), d_('4/9 × 3/8')],
    u2_l07: [v_('1 1/2 × 1 1/3'), n_('2/3 × 3/4 × 4/5')], u2_l08: [v_('120 × 3/4'), v_('350 × 4/7 - 150')], u2_l09: [d_('3/8 × 4'), v_('1 3/4 × 2 2/7')]
  },
  exit: {
    u2_l01: [n_('2/9 + 5/9'), d_('12/18'), '곱셈'], u2_l02: [n_('3/7 × 2'), d_('4/9 × 3'), '분모'], u2_l03: [n_('1 1/3 × 2'), v_('2 1/5 × 5'), '가분수'],
    u2_l04: [v_('15 × 1/3'), v_('12 × 3/4'), v_('20 × 2/5')], u2_l05: [n_('2 × 1 1/3'), v_('4 × 2 1/2'), 'BIG:7 × 3/5|7'], u2_l06: [d_('1/2 × 1/5'), n_('2/3 × 4/5'), d_('3/4 × 2/9')],
    u2_l07: [w_('1 1/4 × 1 1/5'), d_('3 × 1/4 × 2/3'), n_('4/1')], u2_l08: [v_('180 × 2/3'), v_('90 - 74'), '곱셈'], u2_l09: [v_('2/5 × 10'), v_('18 × 5/6'), d_('1/3 × 3/7')]
  },
  review1: [f_('2/7 + 3/7'), f_('6/8'), '4 × 3'],
  adv: { u2_l01: m_('2/9 × 5'), u2_l02: m_('5/6 × 5'), u2_l03: m_('1 3/8 × 12'), u2_l04: v_('28 - 28 × 3/7'), u2_l05: m_('5 × 2 3/10'), u2_l06: f_('5/6 × 3/10'), u2_l07: v_('480 × 3/4 × 5/9'), u2_l08: v_('540 × 5/9 - 540 × 1/3'), u2_l09: v_('(24 - 24 × 1/3) × 3/8') }
};
const BIG = (spec) => { const [e, b] = spec.split('|'); const a = ev(e), c = ev(b); return fstr(sub(a, c)[0] > 0 ? a : c); };

console.log('═══ A. 로드 ═══');
T('9차시 키 u2_l01~l09 · 파일 data/g5s2_math_u2.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 2단원 분수의 곱셈 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 2 && m.subject === '수학' && m.unit_title === '분수의 곱셈' && /분수의 곱셈/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/2단원_분수의곱셈\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
T('그림 부품 fch·fln·mln·mcc·wyc·opb·cmm·mxr·agr 등록 · 잘못된 인자는 던짐', () => { [{ k: 'fch', items: ['1/2'] }, { k: 'fln', rows: [{ expr: '1/2 = 2/4' }] }, { k: 'mln', n: 1, d: 3, times: 2, to: 1 }, { k: 'mcc', rows: [{ expr: '1/2 × 2 = 1' }] }, { k: 'wyc', items: [{ name: 'a', lines: ['1/2 × 2 = 1'] }] }, { k: 'opb', whole: 6, n: 1, d: 3 }, { k: 'cmm', base: 5, items: [{ v: '2/3' }] }, { k: 'mxr', cols: 2, w: 1, n: 2, d: 5 }, { k: 'agr', an: 1, ad: 4, bn: 1, bd: 3 }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'mln', n: 2, d: 3, times: 5, to: 1 }, { k: 'opb', whole: 7, n: 1, d: 3 }, { k: 'agr', an: 5, ad: 4, bn: 1, bd: 3 }, { k: 'cmm', base: 5, items: [{ v: '두 배' }] }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 4, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 1단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); const u1 = Object.values(L1).map(l => l.slides[2].data.img); ok(!im.some(x => u1.indexOf(x) >= 0), '1단원과 겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '분수의 덧셈·약분 되짚기'), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(rv.from === '' && rv.items.length === 3 && /전에 배운/.test(rv.title), 'l01 되짚기'); ok(/분수의 덧셈/.test(rv.content) && /약분/.test(rv.content), 'l01 되짚기 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('1단원 마지막 장 예고 = 분수의 곱셈', () => ok(/분수의 곱셈/.test(L1.u1_l10.slides[18].data.preview), '1단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
const cmmPick = (d) => { const f = d.fig; ok(f && f.k === 'cmm', 'cmm 그림 없음'); const big = d.options.filter(o => { const m = clean(o.text).match(/^(\d+) × (.+)$/); ok(m, '보기 꼴 ' + o.text); return sub(ev(m[1] + ' × ' + m[2]), ev(m[1]))[0] > 0; }); ok(big.length === 1, '5보다 큰 보기 ' + big.length); return clean(big[0].text); };
function want(d, exp) { // 보기면 정답 보기 글 = exp · 수 입력이면 answer = exp
  if (exp === 'CMM5') exp = cmmPick(d); else if (/^WORD:/.test(exp)) exp = exp.slice(5);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u2_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(EXP.lev[k][i]), t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { let e = EXP.exit[k][i]; if (/^BIG:/.test(e)) e = BIG(e.slice(4)); ok(String(x.a) === String(e), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  if (k === 'u2_l01') sl[1].data.items.forEach((x, i) => { ok(String(x.a) === EXP.review1[i], '되짚기 ' + x.a); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); nCheck++; }));
T('다시 셈한 정답 = 84', () => ok(nCheck === 84, nCheck));
T('셈기 자체 확인 — 대분수·가분수·약분·틀린 답 잡음', () => { ok(m_('2 × 1 2/5') === '2 4/5' && f_('7/12 × 8') === '14/3' && w_('3 2/9 × 6') === 19 && v_('480 × 3/4 × 5/9') === '200', '셈'); let c = 0; try { want({ options: [{ text: '8/20', correct: true }, { text: '8/5' }] }, f_('2/5 × 4')); } catch (e) { c++; } try { want({ input: 'count_input', answer: 4, note: '**4**' }, d_('7/12 × 8')); } catch (e) { c++; } ok(c === 2, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d\s/×÷+\-−()]*=[\d\s/×÷+\-−()=]*\d\)?/g;
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim(); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (!/[×÷+\-−/]/.test(t)) continue; try { const r = chain(t); nEq++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 60', () => ok(!badEq.length && nEq >= 60, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('오개념 「틀린 생각」 칸의 식은 정말 틀림(바른 식이면 오개념이 아님)', () => { let n = 0; KEYS.forEach(k => { const wr = clean(L[k].slides[7].data.wrong); const m = wr.match(/(\d[\d\s/×+\-]*=[\d\s/×+\-]*\d)/); if (!m) return; n++; ok(!chain(m[1]).ok, k + ' 틀린 생각이 맞는 식 ' + m[1]); }); ok(n >= 2, '식 있는 틀린 생각 ' + n); });
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['3/10 + 3/10 = 6/20', '1 1/4 × 3 = 3 1/4', '270 × 2/3 = 190'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('2 × 1 2/5 = 14/5 = 2 4/5', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block]); }));
const nG = { row: 0, bad: 0, cmm: 0, opb: 0, agr: 0, mln: 0, mxr: 0, ask: 0 };
const valOf = (t) => ev(String(t).trim());
function checkFig(w0, f, b) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'mcc' || f.k === 'fln') { let prev = null; [...d.querySelectorAll('.mcc-r')].forEach(r => { const e = r.getAttribute('data-calc'); if (!/=/.test(e)) { prev = null; return; } const c = chain(e, prev); nG.row++; if (r.classList.contains('bad')) { nG.bad++; ok(!c.ok, w0 + ' 잘못한 줄이 맞음 ' + e); prev = null; } else { ok(c.ok, w0 + ' 계산 줄 ' + e); prev = c.last; } }); }
  if (f.k === 'wyc') [...d.querySelectorAll('.wyc-c')].forEach(c => { let prev = null; const ls = [...c.querySelectorAll('.wyc-l')].map(x => x.getAttribute('data-calc')); ls.forEach(e => { const r = chain(e, prev); nG.row++; ok(r.ok, w0 + ' 방법 줄 ' + e); prev = r.last; }); ok(c.getAttribute('data-way').endsWith('|' + ls[ls.length - 1]), w0 + ' 마지막 줄'); });
  if (f.k === 'wyc') { const ends = [...d.querySelectorAll('.wyc-c')].map(c => fstr(chain(c.getAttribute('data-way').split('|')[1]).last)); ok(new Set(ends).size === 1, w0 + ' 세 방법 값 다름 ' + ends); }
  if (f.k === 'cmm') [...d.querySelectorAll('.cmm-c')].forEach(c => { const [bs, v] = c.getAttribute('data-cmp').split('|'); const s = sub(mul(valOf(bs), valOf(v)), valOf(bs))[0]; const rel = s > 0 ? '>' : s < 0 ? '<' : '='; nG.cmm++; const shown = c.querySelector('.cmm-r').textContent; if (f.ask) { nG.ask++; ok(shown === '?' && c.getAttribute('data-rel') === '', w0 + ' ask 부등호 보임'); } else ok(shown === rel && c.getAttribute('data-rel') === rel, w0 + ' 부등호 ' + shown + ' ≠ ' + rel); });
  if (f.k === 'opb') { nG.opb++; const [wh, n, dd] = d.querySelector('svg').getAttribute('data-opbar').split(',').map(Number); ok(wh === f.whole && n === f.n && dd === f.d, w0 + ' 명세'); ok(d.querySelectorAll('rect.opb-p').length === dd && d.querySelectorAll('rect.opb-p.on').length === n, w0 + ' 칸·색'); const lab = [...d.querySelectorAll('text.opb-t')].map(t => +t.getAttribute('data-v')); const r = d.querySelector('.opb-res'), ans = fstr(mul(Q(wh), Q(n, dd)));
    if (f.ask) { nG.ask++; ok(SAME(lab, [0, wh]), w0 + ' ask 인데 경계 값 보임 ' + lab); ok(!r || r.getAttribute('data-res') === '?', w0 + ' ask 값 보임'); } else { lab.forEach((v, i) => ok(v === wh * (dd <= 12 ? i : (i ? dd : 0)) / dd, w0 + ' 경계 값')); if (f.res != null) ok(String(f.res) === ans && r.getAttribute('data-res') === ans, w0 + ' 값 ' + f.res + ' ≠ ' + ans); } }
  if (f.k === 'agr') { nG.agr++; const svg = d.querySelector('svg'); const hat = d.querySelectorAll('rect.agr-c.h').length; ok(+svg.getAttribute('data-hat') === hat && d.querySelectorAll('rect.agr-c').length === f.ad * f.bd, w0 + ' 칸'); ok(hat === (f.only === 'a' ? 0 : f.an * f.bn), w0 + ' 빗금 ' + hat); const cap = d.querySelector('.agr-cap'); if (f.only === 'a') ok(!cap, w0 + ' only a 칸 수'); else if (f.ask) { nG.ask++; ok(/\?칸 중에서 \?칸/.test(cap.textContent), w0 + ' ask 칸 수 보임'); } else ok(cap.textContent === '전체 ' + f.ad * f.bd + '칸 중에서 ' + f.an * f.bn + '칸', w0 + ' 칸 수 글'); if (f.cap && /=/.test(f.cap)) { const c = chain(f.cap); ok(c.ok && eqQ(c.last, Q(f.an * f.bn, f.ad * f.bd)), w0 + ' cap 식 ' + f.cap); } }
  if (f.k === 'mln') { nG.mln++; const sn = (f.w || 0) * f.d + f.n; ok(d.querySelectorAll('g.mln-j').length === f.times, w0 + ' 걸음 수'); [...d.querySelectorAll('g.mln-j')].forEach((g, i) => ok(eqQ(ev(g.getAttribute('data-b')), Q(sn * (i + 1), f.d)), w0 + ' 걸음 끝')); const res = d.querySelector('.mln-res'); if (f.ask) { nG.ask++; ok(res && res.textContent === '?', w0 + ' ask 끝 보임'); } else if (f.res) ok(eqQ(valOf(f.res), Q(sn * f.times, f.d)), w0 + ' 끝 ' + f.res); }
  if (f.k === 'mxr') { nG.mxr++; ok(d.querySelector('svg').getAttribute('data-mixrect') === [f.cols, f.w, f.n, f.d].join(','), w0 + ' mxr'); ok(f.cols > 0 && f.w >= 1, w0 + ' 가로·세로'); }
  if (b === 'basic_problem' && f.k !== 'mcc' && f.k !== 'cmm') ok(!(/mln|opb|agr/.test(f.k)) || f.ask || f.only === 'a', w0 + ' 문제 그림이 답을 보임');
}
T('그림 ' + figs.length + '개 — 계산 줄 사슬 · 부등호 · 묶음 값 · 칸 수 · 뛰어 세기 · ask 가림', () => figs.forEach(([w0, f, b]) => checkFig(w0, f, b)));
T('cmm 개념 장 — 글 「5보다 큰 것은 하나뿐」 = 그림 > 카드 1장 · 「1보다 작은 수를 곱하면 작아지고」 = < 카드 곱하는 수 모두 1 미만', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept' && s.data.fig.k === 'cmm').forEach(s => { n++; const d = docOf(FIG.render(s.data.fig)); const up = d.querySelectorAll('.cmm-c.up').length; if (/큰 것은 하나뿐/.test(clean(s.data.content))) ok(up === 1, k + ' ' + s.id + ' > 카드 ' + up); [...d.querySelectorAll('.cmm-c.dn')].forEach(c => ok(sub(valOf(c.getAttribute('data-cmp').split('|')[1]), Q(1))[0] < 0, k + ' 작아짐 카드')); })); ok(n >= 2, 'cmm 개념 ' + n); });
T('개념 36장 모두 그림 · 기본 문제 27 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('그림 부품 수 — 계산 줄 ≥ 40 · 잘못한 줄 ≥ 1 · cmm ≥ 8 · opb ≥ 6 · agr ≥ 4 · mln ≥ 4 · mxr ≥ 1 · ask ≥ 10', () => ok(nG.row >= 40 && nG.bad >= 1 && nG.cmm >= 8 && nG.opb >= 6 && nG.agr >= 4 && nG.mln >= 4 && nG.mxr >= 1 && nG.ask >= 10, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 계산 줄 · 바른 bad 줄 · 부등호 · 묶음 값 · 빗금 · 끝 이름표 잡음', () => { let c = 0; const tr = (f) => { try { checkFig('probe', f, 'concept'); } catch (e) { c++; } };
  tr({ k: 'mcc', rows: [{ expr: '1/4 × 3 = 3/12' }] }); tr({ k: 'mcc', rows: [{ expr: '1/4 × 3 = 3/4', cls: 'bad' }] }); tr({ k: 'opb', whole: 6, n: 2, d: 3, res: '3' }); tr({ k: 'mln', n: 1, d: 4, times: 3, to: 1, res: '3/12' }); tr({ k: 'agr', an: 4, ad: 5, bn: 2, bd: 3, cap: '4/5 × 2/3 = 6/15' }); tr({ k: 'wyc', items: [{ name: 'a', lines: ['3/4 × 2 = 6/4'] }, { name: 'b', lines: ['3/4 × 2 = 3/4'] }] });
  ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 개념 장 · 기본 문제 = 원문(앞머리·수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ps = src.problems.filter(p => normT(nk(p.q)).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); const p = ps[0]; if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts.map(nk)) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u2_l09') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); ['기본', '도전'].forEach(t => ok(e.map(numsOf).indexOf(numsOf(lv[t].q)) < 0, k + ' ' + t + ' 수 같음')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~면?」「~은?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 3단원 합동과 대칭 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u2_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /합동과 대칭/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
// 원문 문제의 보기(헷갈리는 보기로 다음 차시 말을 쓴 것 — 예: l03 「분모끼리 곱하지 않았다」)는 원문 그대로라 뺀다
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['가분수로 고쳐', 3], ['분모끼리', 6], ['분모는 분모끼리', 6]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('선행 검사기 자체 확인', () => { ok(teach('u2_l02').indexOf('분모끼리') < 0, 'l02 깨끗'); ok(teach('u2_l07').indexOf('분모끼리') >= 0, 'l07 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 곰이·펭이 0(원문 「달곰이」는 사람 이름이라 뺌)', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b)); ok(!/(^|[^달])곰이|펭이/.test(all), '곰이·펭이'); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));

console.log('\n게이트 g5s2 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
