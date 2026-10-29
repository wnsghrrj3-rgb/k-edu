/* gate_g5s2_math_u4.js — 5학년 2학기 수학 4단원 「소수의 곱셈」 케이티처 2세대 게이트 (219차, 베프 — gate_g5s2_math_u2 틀 + 소수 계산기 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(잘못된 인자는 던짐) · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 3단원 마지막 차시 u3_l11 출구 → l02 … l10 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 계산기(소수·분수를 정수 분자·분모로, 기약)로 기본 문제 30·수준별 기본·도전 20·출구 30·넓히기 10 을 식에서 다시 셈
     (곱·배·0.1/0.01 의 개수·어림값·소수점 옮긴 자리 수·곱의 소수 자리 수·커질까 작아질까) — 보기 정답·수 입력 답·풀이 끝 대조
   F 식 전수 — 개념 글·요약·교사 층 글 속 「… = …」 사슬(소수·분수)을 다시 셈(오개념 「틀린 생각」 칸만 뺌 — 그 칸의 식은 정말 틀려야 함) · 검산기 자체 확인
   G 그림 — cll 식 줄 사슬 · tnc 배율 이름표 = 두 수에서 셈 · mch 곱·배율 = 셈 · ecd 어림값·계산 값·크기 견주기 = 셈 · jml 끝 = 걸음×횟수
     · pbr 칠한 칸·끝 값 = 전체×n/10 · dar 칠한 칸 = 가로칸×세로칸 · 값 · vml 세로셈 곱 줄 숫자·소수점 = 셈(bug 는 숫자 같고 소수점만 틀림) · dtb 표
     · ask 그림은 답(곱·끝·칸 수·배율·어림값)을 그리지 않음 · 기본 문제 그림 속 수에 정답 0 · 검사기 자체 확인
   H 원문 충실(개념 글 = 원문 · 기본 문제 = 원문 앞머리·수·보기·정답) · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원
   L 선행(「1/100배」 l03 · 「넓이 모델」 l06 · 「1/1000배」 l07 · 「소수점 아래 숫자의 개수」 l08 — l01 예외) · M 차단 어휘 · 「결」 0 · 인물 0(원문 민주·다을·봄·주연·예건 · 곰이·펭이)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u4.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u4.js'));
const L3 = load(path.join(TDIR, 'data/g5s2_math_u3.js'));
const LP = [1, 2, 3].map(u => load(path.join(TDIR, 'data/g5s2_math_u' + u + '.js')));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u4.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '소수의 곱셈', classNames: [] });
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
// 10의 거듭제곱 배율 이름(게이트 셈)
function ratioG(a, b) { const qa = numQ(a), qb = numQ(b); if (eqQ(qa, qb)) return ''; const r = div(qb, qa); const up = cmpQ(qb, qa) > 0; const big = up ? r : div(Q(1), r); ok(big[1] === 1 && /^10+$/.test(String(big[0])), '10의 거듭제곱 배 아님 ' + a + '→' + b); return up ? big[0] + '배' : '1/' + big[0] + '배'; }

/* ── 정답 표 — 게이트가 식에서 다시 셈 ── */
// REL:식|기준 = 곱이 기준보다 작으면 「작」, 크면 「크」로 시작하는 보기 · DP:식 = 두 수 소수 자리 수의 합(곱의 실제 소수 자리 수와도 같아야) · SHIFT:a|b = a 에서 b 로 소수점을 옮긴 자리 수 · RATIO:a|b · ROUND:식 = 곱해지는 수를 가장 가까운 자연수로 · WORD: 그대로
const EXP = {
  basic: {
    u4_l01: [v_('0.034 × 10'), v_('3.4 ÷ 0.034'), 'WORD:1.5 × 3'],
    u4_l02: [v_('0.3 × 5'), v_('0.3 × 4 ÷ 0.1'), v_('0.9 × 8')],
    u4_l03: [v_('0.24 × 3'), v_('4 × 5'), v_('259 × 13')],
    u4_l04: ['REL:2 × 0.8|2', v_('0.8 × 10'), v_('7 × 1.6')],
    u4_l05: [v_('6 × 0.38'), v_('8 × 3'), v_('8 × 3.16')],
    u4_l06: [v_('0.6 × 0.9'), v_('0.6 × 0.8 ÷ 0.01'), v_('1.9 × 3.6')],
    u4_l07: [v_('0.47 × 0.3'), v_('51 × 112'), v_('5.1 × 1.12')],
    u4_l08: [v_('2.38 × 100'), 'SHIFT:16|0.016', v_('3.7 × 2.1')],
    u4_l09: ['ROUND:1.9 × 15', v_('0.5 × 22'), v_('1.9 × 15')],
    u4_l10: [v_('9 × 7'), v_('0.9 × 0.7'), v_('1.9 × 32')]
  },
  lev: {
    u4_l01: [v_('0.27 × 10'), v_('5.6 × 0.01')], u4_l02: [v_('0.4 × 6 ÷ 0.1'), v_('2.6 × 7')], u4_l03: [v_('0.36 × 2'), v_('3.15 × 6')], u4_l04: [v_('5 × 0.6'), v_('9 × 2.3')], u4_l05: [v_('4 × 0.25'), v_('15 × 1.08')],
    u4_l06: [v_('4 × 7'), v_('2.3 × 1.4')], u4_l07: [v_('0.24 × 0.2'), v_('2.05 × 1.4')], u4_l08: [v_('5.73 × 1000'), v_('0.23 × 0.017')], u4_l09: [v_('1.2 × 16'), v_('1.9 × 15 + 0.4 × 22 + 1.2 × 16 + 13.3 × 2')], u4_l10: [v_('0.8 × 0.6'), v_('85 × 2.5')]
  },
  exit: {
    u4_l01: [v_('0.56 × 10'), v_('7.2 ÷ 0.072'), '곱셈'], u4_l02: [v_('0.7 × 4'), v_('0.5 × 9 ÷ 0.1'), 'RATIO:16|1.6'], u4_l03: [v_('0.12 × 4'), v_('3 × 5'), v_('2.25 × 4')], u4_l04: [v_('3 × 0.7'), v_('4 × 1.5'), '작아진다'], u4_l05: [v_('5 × 0.24'), v_('7 × 2'), v_('30 × 0.15')],
    u4_l06: [v_('0.3 × 0.8'), v_('5 × 9'), v_('1.2 × 2.5')], u4_l07: [v_('0.15 × 0.3'), v_('1.6 × 2.05'), v_('4 × 1')], u4_l08: [v_('6.2 × 100'), v_('45 × 0.01'), 'DP:0.6 × 0.08'], u4_l09: [v_('0.4 × 22'), v_('13 × 2'), '실천한 학생 수'], u4_l10: [v_('0.7 × 0.4'), v_('3.25 × 100'), 'DP:1.3 × 0.05']
  },
  adv: { u4_l01: v_('2.4 × 4'), u4_l02: v_('3.6 × 5'), u4_l03: v_('0.45 × 2 × 7'), u4_l04: v_('30 × 0.8 × 0.8'), u4_l05: v_('40 × 0.38 - 40 × 0.17'), u4_l06: v_('1.5 × 0.8 - 0.5 × 0.4'), u4_l07: v_('0.9 × 0.25 × 2.4'), u4_l08: v_('912.5 ÷ 0.25'), u4_l09: v_('1.9 × 20 - 1.9 × 15'), u4_l10: v_('25.2 × 1.4 × 0.5') }
};
function special(e, d) {
  if (/^DP:/.test(e)) { const x = e.slice(3), [a, b] = x.split('×').map(s => s.trim()), want = dpOf(a) + dpOf(b); ok(dpOf(v_(x)) === want, 'DP 문제의 곱이 끝자리 0 으로 줄어듦 ' + x + ' = ' + v_(x)); return String(want); }
  if (/^SHIFT:/.test(e)) { const [a, b] = e.slice(6).split('|'); const r = ratioG(a, b); return String(r.replace(/^1\//, '').replace('배', '').length - 1); }
  if (/^RATIO:/.test(e)) { const [a, b] = e.slice(6).split('|'); return ratioG(a, b); }
  if (/^ROUND:/.test(e)) { const [a, b] = e.slice(6).split('×').map(s => s.trim()); return Math.round(Number(a)) + ' × ' + b; }
  if (/^REL:/.test(e)) { const [x, base] = e.slice(4).split('|'); const c = cmpQ(ev(x), ev(base)); const lead = c < 0 ? '작' : c > 0 ? '크' : '같'; const cs = d.options.filter(o => o.correct); ok(cs.length === 1 && clean(cs[0].text).startsWith(lead), 'REL 정답 보기 「' + (cs[0] || {}).text + '」 ≠ ' + lead); ok(d.options.filter(o => clean(o.text).startsWith(lead)).length === 1, 'REL 같은 첫 글자 보기 둘'); return clean(cs[0].text); }
  if (/^WORD:/.test(e)) return e.slice(5);
  return e;
}

console.log('═══ A. 로드 ═══');
T('10차시 키 u4_l01~l10 · 파일 data/g5s2_math_u4.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 4단원 소수의 곱셈 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 4 && m.subject === '수학' && m.unit_title === '소수의 곱셈' && /소수의 곱셈/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/4단원_소수의곱셈\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
T('그림 부품 cll·tnc·ecd·jml·mch·vml·pbr·dar·dtb 등록 · 잘못된 인자는 던짐', () => {
  [{ k: 'cll', rows: [{ expr: '0.3 × 2 = 0.6' }] }, { k: 'tnc', items: ['0.3', '3'] }, { k: 'ecd', expr: '1.2 × 4', round: '1 × 4' }, { k: 'jml', step: '0.3', times: 2, to: 1 }, { k: 'mch', rows: [{ a: '3', b: '2' }, { a: '0.3', b: '2' }] }, { k: 'vml', a: '1.2', b: '3' }, { k: 'pbr', whole: 2, n: 3 }, { k: 'dar', a: '0.3', b: '0.4' }, { k: 'dtb', head: ['a', 'b'], rows: [['x', '1']] }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'jml', step: '0.6', times: 5, to: 2 }, { k: 'tnc', items: ['0.3', '0.6'] }, { k: 'mch', rows: [{ a: '3', b: '2' }, { a: '0.6', b: '2' }] }, { k: 'ecd', expr: '1.2 × 4', round: '1 × 4', est: '5' }, { k: 'ecd', expr: '1.2 × 4', round: '1 × 4', exact: '48' }, { k: 'ecd', expr: '6 × 0.9', round: '6 × 1', ref: '6', rel: '>' }, { k: 'vml', a: '1.35', b: '4', bug: 'dot', shown: '5.40' }, { k: 'vml', a: '1.35', b: '4', bug: 'dot', shown: '0.541' }, { k: 'dar', a: '1.2', b: '0.4' }, { k: 'pbr', whole: 2, n: 11 }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 10, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 10종 서로 다름 · 1~3단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); const prev = LP.flatMap(P => Object.values(P).map(l => l.slides[2].data.img)); ok(!im.some(x => prev.indexOf(x) >= 0), '앞 단원과 겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '3단원 u3_l11 출구'), () => { const rv = L[k].slides[1].data;
  if (!i) { const ex = L3.u3_l11.slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g5s2_math:u3_l11' && /지난 단원/.test(rv.title), 'l01 from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '3단원 출구 어긋남'); ok(/합동과 대칭/.test(rv.content), 'l01 복습 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('3단원 마지막 장 예고 = 소수의 곱셈', () => ok(/소수의 곱셈/.test(L3.u3_l11.slides[18].data.preview), '3단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
function want(d, exp) {
  exp = special(exp, d);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + String(d.answer).replace('.', '\\.') + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(EXP.lev[k][i]), t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { const e = special(EXP.exit[k][i], {}); ok(String(x.a) === String(e), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); nCheck++; }));
T('다시 셈한 정답 = 90', () => ok(nCheck === 90, nCheck));
T('셈기 자체 확인 — 소수 곱·나눗셈·끝자리 0·배율·틀린 답 잡음', () => { ok(v_('0.23 × 0.017') === '0.00391' && v_('0.32 × 4.5') === '1.44' && v_('912.5 ÷ 0.25') === '3650' && v_('12/10 × 4') === '4.8' && ratioG('4810', '4.81') === '1/1000배' && special('SHIFT:16|0.016') === '3' && special('DP:0.6 × 0.08') === '3', '셈'); let c = 0; try { want({ options: [{ text: '48', correct: true }, { text: '4.8' }] }, v_('1.2 × 4')); } catch (e) { c++; } try { want({ input: 'count_input', answer: 4, note: '**4**' }, v_('0.3 × 4 ÷ 0.1')); } catch (e) { c++; } try { special('DP:1.2 × 0.05'); } catch (e) { c++; } ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d. /×÷+\-−()]*=[\d. /×÷+\-−()=]*\d\)?/g;
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim().replace(/\.$/, ''); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (/^\([^()]*\)$/.test(t)) t = t.slice(1, -1); if (!/[×÷+\-−/]/.test(t)) continue; try { const r = chain(t); nEq++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 80', () => ok(!badEq.length && nEq >= 80, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('오개념 「틀린 생각」 칸의 식은 정말 틀림(바른 식이면 오개념이 아님)', () => { let n = 0; KEYS.forEach(k => { const wr = clean(L[k].slides[7].data.wrong); const m = wr.match(/(\d[\d.\s/×+\-]*=[\d.\s/×+\-]*\d)/); if (!m) return; n++; ok(!chain(m[1]).ok, k + ' 틀린 생각이 맞는 식 ' + m[1]); }); ok(n >= 6, '식 있는 틀린 생각 ' + n); });
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['1.2 × 4 = 48', '0.6 × 0.9 = 5.4', '0.47 × 0.3 = 1.41'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('0.24 × 3 = 24/100 × 3 = 72/100 = 0.72', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = { row: 0, tnc: 0, mch: 0, ecd: 0, jml: 0, pbr: 0, dar: 0, vml: 0, bug: 0, dtb: 0, ask: 0 };
const leaves = (f) => { if (f.k === 'panels') return (f.items || []).map(p => p.fig || p); return [f]; };
const labOf = (el) => { el = el.querySelector('.tnc-l') || el; const fq = el.querySelector('.fq'); if (!fq) return el.textContent.replace(/\s+/g, ''); return '1/' + fq.querySelector('.fq-d').textContent + '배'; };
function checkOne(w0, f) {
  const h = FIG.render(f); ok(h && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'cll') { let prev = null; [...d.querySelectorAll('.mcc-r')].forEach(r => { const e = r.getAttribute('data-calc'); if (!/=/.test(e)) { prev = null; return; } const c = chain(e, prev); nG.row++; if (r.classList.contains('bad')) { ok(!c.ok, w0 + ' 잘못한 줄이 맞음 ' + e); prev = null; } else { ok(c.ok, w0 + ' 식 줄 ' + e); prev = c.last; } }); }
  if (f.k === 'tnc') { nG.tnc++; const v = f.items.map(String); const labs = [...d.querySelectorAll('.tnc-a')].map(labOf); ok(labs.length === v.length - 1, w0 + ' 화살표 수'); labs.forEach((l, i) => ok(l === ratioG(v[i], v[i + 1]), w0 + ' 배율 ' + l + ' ≠ ' + ratioG(v[i], v[i + 1]))); const nums = [...d.querySelectorAll('.tnc-n')].map(x => x.textContent); v.forEach((x, i) => ok(nums[i] === (f.ask === i ? '?' : x), w0 + ' 수 ' + nums[i])); if (f.ask != null) nG.ask++; }
  if (f.k === 'mch') { nG.mch++; const R = f.rows.map(r => ({ a: String(r.a), b: String(r.b), p: v_(r.a + ' × ' + r.b) })); const ps = [...d.querySelectorAll('.mch-p')].map(x => x.textContent); R.forEach((r, i) => ok(ps[i] === (f.ask === i ? '?' : r.p), w0 + ' 곱 ' + ps[i] + ' ≠ ' + r.p)); const rp = [...d.querySelectorAll('.mch-r.rp')], ra = [...d.querySelectorAll('.mch-r.ra')], rb = [...d.querySelectorAll('.mch-r.rb')];
    R.slice(1).forEach((r, j) => { const i = j + 1; ok(labOf(ra[j]).replace('↓', '') === ratioG(R[i - 1].a, r.a), w0 + ' a 배율'); ok(labOf(rb[j]).replace('↓', '') === ratioG(R[i - 1].b, r.b), w0 + ' b 배율'); ok(f.ask === i ? rp[j].textContent === '?' : labOf(rp[j]).replace('↓', '') === ratioG(R[i - 1].p, r.p), w0 + ' 곱 배율'); }); if (f.ask != null) nG.ask++; }
  if (f.k === 'ecd') { nG.ecd++; const b = [...d.querySelectorAll('.ecd-b')].map(x => clean(x.textContent)); const est = v_(f.round), ex = v_(f.expr); ok(b[0] === f.round + ' = ' + (f.ask === 'est' ? '?' : est), w0 + ' 어림 ' + b[0]); if (f.exact != null || f.ask === 'exact') ok(b[1] === f.expr + ' = ' + (f.ask === 'exact' ? '?' : ex), w0 + ' 계산 ' + b[1]); const t = d.querySelector('.ecd-t'); if (f.ref) { const c = cmpQ(ev(ex), ev(f.ref)); ok(t && t.textContent === f.ref + (c > 0 ? '보다 커요' : '보다 작아요'), w0 + ' 견주기'); } if (f.ask) nG.ask++; }
  if (f.k === 'jml') { nG.jml++; const end = v_(f.step + ' × ' + f.times); const js = [...d.querySelectorAll('g.jml-j')]; ok(js.length === f.times, w0 + ' 걸음 수'); js.forEach((g, i) => ok(eqQ(ev(g.getAttribute('data-b')), ev(f.step + ' × ' + (i + 1))), w0 + ' 걸음 끝')); const r = d.querySelector('.jml-res').textContent; ok(r === (f.ask ? '?' : end), w0 + ' 끝 ' + r); if (f.ask) nG.ask++; }
  if (f.k === 'pbr') { nG.pbr++; ok(d.querySelectorAll('rect.pbr-p').length === 10 && d.querySelectorAll('rect.pbr-p.on').length === f.n, w0 + ' 칸'); const r = d.querySelector('.pbr-res').textContent; ok(r === (f.ask ? '?' : v_(f.whole + ' × ' + f.n + ' ÷ 10')), w0 + ' 끝 ' + r); if (f.ask) nG.ask++; }
  if (f.k === 'dar') { nG.dar++; const on = d.querySelectorAll('rect.dar-c.on').length, want0 = Math.round(Number(f.a) * 10) * Math.round(Number(f.b) * 10); ok(d.querySelectorAll('rect.dar-c').length === 100 && on === want0, w0 + ' 칸 ' + on); ok(v_(on + ' × 0.01') === v_(f.a + ' × ' + f.b), w0 + ' 칸 = 곱'); const r = d.querySelector('.dar-res').textContent; ok(r === f.a + ' × ' + f.b + ' = ' + (f.ask ? '?' : v_(f.a + ' × ' + f.b)), w0 + ' 값 ' + r); if (f.ask) nG.ask++; }
  if (f.k === 'vml') { nG.vml++; const rows = {}; [...d.querySelectorAll('text.vml-d, text.vml-dot, text.vml-q')].forEach(t => { const r = t.getAttribute('data-r'); (rows[r] = rows[r] || []).push([+t.getAttribute('x'), t.textContent]); }); const keys = Object.keys(rows).map(Number).sort((a, b) => a - b); const rowStr = (r) => rows[r].sort((a, b) => a[0] - b[0]).map(x => x[1]).join('');
    ok(rowStr(keys[0]) === f.a && rowStr(keys[1]) === f.b, w0 + ' 두 수 ' + rowStr(keys[0]) + ',' + rowStr(keys[1])); const last = rowStr(keys[keys.length - 1]);
    if (f.ask) { nG.ask++; ok(last === '?', w0 + ' ask 곱 보임'); }
    else if (f.bug) { nG.bug++; ok(last === f.shown && !eqQ(numQ(last), ev(f.a + ' × ' + f.b)) && last.replace('.', '').replace(/^0+/, '') === String(Math.round(Number(f.a.replace('.', '')) * Number(f.b.replace('.', '')))), w0 + ' bug 줄 ' + last); }
    else { ok(eqQ(numQ(last), ev(f.a + ' × ' + f.b)) && dpOf(last) === dpOf(f.a) + dpOf(f.b), w0 + ' 곱 줄 ' + last + ' (소수 자리 = 두 수 자리 합)'); }
    if (f.part) { const B = f.b.replace('.', ''); ok(keys.length === 3 + B.length, w0 + ' 부분곱 줄 수'); } }
  if (f.k === 'dtb') { nG.dtb++; const tr = [...d.querySelectorAll('tr')].slice(1).map(r => [...r.querySelectorAll('td')].map(x => x.textContent)); ok(SAME(tr, f.rows), w0 + ' 표'); ok(!/민주/.test(h), w0 + ' 표 제목 인물'); }
}
const tokensOf = (f) => { const h = FIG.render(f); const d = docOf(h); const t = [...d.querySelectorAll('*')].filter(e => !e.children.length).map(e => e.textContent).join(' '); return t.match(/\d+(?:\.\d+)?/g) || []; };
function checkFig(w0, f, b, data) {
  leaves(f).forEach((x, i) => checkOne(w0 + (f.k === 'panels' ? '#' + i : ''), x));
  if (b === 'basic_problem') {
    leaves(f).forEach(x => { if (['jml', 'pbr', 'dar'].indexOf(x.k) >= 0) ok(x.ask, w0 + ' 문제 그림 ' + x.k + ' ask 아님'); if (x.k === 'vml') ok(x.ask || x.bug, w0 + ' 문제 세로셈이 곱을 보임'); });
    const ans = data.options ? clean(data.options.find(o => o.correct).text).match(/^\d+(?:\.\d+)?$/) : [String(data.answer)];
    if (ans) ok(tokensOf(f).indexOf(ans[0]) < 0, w0 + ' 그림 속에 정답 ' + ans[0]);
  }
}
T('그림 ' + figs.length + '개 — 식 줄 · 배율 · 곱 · 어림 · 뛰어 세기 · 띠 · 넓이 칸 · 세로셈 · 표 · ask 가림 · 문제 그림 속 정답 0', () => figs.forEach(([w0, f, b, data]) => checkFig(w0, f, b, data)));
T('개념 40장 모두 그림 · 기본 문제 30 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 40 && p === 30, c + '/' + p); });
T('그림 부품 수 — 식 줄 ≥ 18 · tnc ≥ 2 · mch ≥ 10 · ecd ≥ 6 · jml ≥ 2 · pbr ≥ 2 · dar ≥ 3 · vml ≥ 15 · bug ≥ 3 · dtb ≥ 2 · ask ≥ 15', () => ok(nG.row >= 18 && nG.tnc >= 2 && nG.mch >= 10 && nG.ecd >= 6 && nG.jml >= 2 && nG.pbr >= 2 && nG.dar >= 3 && nG.vml >= 15 && nG.bug >= 3 && nG.dtb >= 2 && nG.ask >= 15, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 식 줄 · 배율 · ask 곱 · 문제 그림 정답 · 세로셈 곱 보임 잡음', () => { let c = 0; const tr = (f, b, d) => { try { checkFig('probe', f, b || 'concept', d); } catch (e) { c++; } };
  tr({ k: 'cll', rows: [{ expr: '1.2 × 4 = 48' }] }); tr({ k: 'jml', step: '0.3', times: 5, to: 2 }, 'basic_problem', { answer: 1.5 }); tr({ k: 'vml', a: '0.9', b: '8' }, 'basic_problem', { answer: 7.2 }); tr({ k: 'fch', items: ['0.3', '1.5'] }, 'basic_problem', { answer: 1.5 }); tr({ k: 'tnc', items: ['0.3', '3'], ask: 1 }, 'basic_problem', { answer: 3 });
  ok(c === 4, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/민주네 반/g, '우리 반').replace(/계산 결과 /g, '계산한 값 ').replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 개념 장 · 기본 문제 = 원문(앞머리·수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ps = src.problems.filter(p => normT(nk(p.q)).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); const p = ps[0]; if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts.map(nk)) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u4_l10') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
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
T('학생이 읽는 물음 끝 = 「요?」(「~인가?」「~면?」「~은?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 5단원 직육면체 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u4_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /직육면체/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['1/100배', 3], ['넓이 모델', 6], ['1/1000배', 7], ['소수점 아래 숫자의 개수', 8]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('선행 검사기 자체 확인', () => { ok(teach('u4_l02').indexOf('넓이 모델') < 0, 'l02 깨끗'); ok(teach('u4_l10').indexOf('넓이 모델') >= 0, 'l10 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 인물(민주·다을·봄이·주연·예건·곰이·펭이) 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b)); ['민주', '다을', '봄이', '주연', '예건', '곰이', '펭이'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」·인물 0', () => figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h.indexOf('결') < 0 && !/민주|다을|주연|예건/.test(h), w0); }));

console.log('\n게이트 g5s2 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
