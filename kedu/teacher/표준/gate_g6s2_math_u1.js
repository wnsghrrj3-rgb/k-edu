/* gate_g6s2_math_u1.js — 6학년 2학기 수학 1단원 「분수의 나눗셈」 케이티처 2세대 게이트 (N61, 2026-11-09 — gate_g5s2_math_u2 틀 + 지도서 직행 점검).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(fdv·dnl 새 부품 + mln·mcc·wyc·fch·dtb) · meta(6학년 2학기 · 1단원 · [6수01-11] · 40분 · 지도서 쪽) · slug g6s2_math
   B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음 · 실사 11종 서로 다름 · 5-2 수학 1~6단원과 겹침 0)
   D 복습 계보(l01 = 6학년 1학기 분수의 나눗셈 되짚기 → l02 … l11 = 직전 출구) · l11 다음 단원 = 공간과 입체
   E 정답 다시 셈 — 게이트 자체 분수 계산기(분수 덩이를 한 수로 읽음: 「a/b ÷ c/d」 = (a/b)÷(c/d))로 기본 33 · 수준별 22 · 출구 33 · 되짚기 3 · 넓히기 11 = 102
   F 식 전수 — 슬라이드 글 속 「… = …」 사슬을 다시 셈(오개념 「틀린 생각」·발문 칸만 뺌) · 틀린 생각의 식은 정말 틀림 · 검산기 자체 확인
   G 그림 — fdv 칸·묶음 이름표·몫 = 게이트 셈 · dnl 위 값 = 1에 해당하는 양 × 자리 · 화살표 ×n ÷n · ask 가림 · mcc·wyc 계산 줄 · mln 끝 · 문제 그림이 답을 보이지 않음
   H 재료 충실(개념 = src · 기본 문제 = src) · 교과서 수 표(활동목록.md 의 차시별 교과서·익힘·형성 수가 그 차시에 있음) · 차시 제목 = 지도서 제목 · 중복
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · L 선행(단위분수의 분모를 곱해 l05 · 분모와 분자를 바꾸어 l06 · 통분하여 분자끼리 l04)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 곰이·펭이 0 · 교사 화면 영어 코드(u1·L01) 0
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g6s2_math_u1.js */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g6s2_math_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '분수의 나눗셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 분수 계산기 (부품·생성기와 따로 짬) — 「n/d」「w n/d」 는 한 덩이 수, ÷ × 는 왼쪽부터 ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d = 1) => { if (!d) throw new Error('0으로 나눔'); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]), div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
const eqQ = (a, b) => a[0] === b[0] && a[1] === b[1];
const cmpQ = (a, b) => a[0] * b[1] - b[0] * a[1];
function ev(s0) {
  const s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-');
  const tk = s.match(/\d+\s+\d+\/\d+|\d+\/\d+|\d+|[-+×÷*()]|\S/g) || []; let i = 0;
  const peek = () => tk[i], next = () => tk[i++];
  function atom() { const t = next(); if (t === '(') { const v = expr(); ok(next() === ')', '괄호 in ' + s0); return v; } let m;
    if (t && (m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return Q(+m[1] * +m[3] + +m[2], +m[3]);
    if (t && (m = t.match(/^(\d+)\/(\d+)$/))) return Q(+m[1], +m[2]);
    if (t && /^\d+$/.test(t)) return Q(+t, 1); throw new Error('모르는 글자 ' + t + ' in ' + s0); }
  function term() { let v = atom(); while (['×', '*', '÷'].indexOf(peek()) >= 0) { const o = next(), r = atom(); v = o === '÷' ? div(v, r) : mul(v, r); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? add(v, r) : sub(v, r); } return v; }
  const v = expr(); ok(i === tk.length, '남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return v;
}
const fstr = (q) => q[1] === 1 ? String(q[0]) : q[0] + '/' + q[1];
const mix = (q) => { const wv = Math.floor(q[0] / q[1]), r = q[0] - wv * q[1]; return r === 0 ? String(wv) : (wv ? wv + ' ' + r + '/' + q[1] : r + '/' + q[1]); };
function chain(expr, prev) { const parts = String(expr).split('=').map(x => x.trim()); const vals = parts.filter(Boolean).map(ev); let okv = vals.every(v => eqQ(v, vals[0])); if (parts[0] === '' && prev) okv = okv && eqQ(prev, vals[0]); return { ok: okv, last: vals[vals.length - 1], n: parts.length - 1 }; }

/* ── 정답 표 — 게이트가 식에서 다시 셈 (m 대분수꼴 · f 가분수꼴 · v 정수) ── */
const m_ = (e) => mix(ev(e)), f_ = (e) => fstr(ev(e)), v_ = (e) => { const q = ev(e); ok(q[1] === 1, '정수 아님 ' + e); return String(q[0]); };
const special = {
  DIVN: (a) => { const [n, cs] = a.split('|'); const c = cs.split(',').filter(x => +n % +x === 0); ok(c.length === 1, 'DIVN 후보 ' + c); return c[0]; },
  LT: (a) => { const q = ev(a); return Array.from({ length: Math.ceil(q[0] / q[1]) - 1 }, (_, i) => i + 1).filter(x => cmpQ(Q(x), q) < 0).join(', '); },
  MINQ: (a) => { const es = a.split('|'); return es.reduce((b, e) => (cmpQ(ev(e), ev(b)) < 0 ? e : b)); },
  MAXMIN: (a) => { const v = a.split(',').map(ev); const mx = v.reduce((p, c) => (cmpQ(c, p) > 0 ? c : p)), mn = v.reduce((p, c) => (cmpQ(c, p) < 0 ? c : p)); return mix(div(mx, mn)); },
  MAXV: (a) => mix(a.split('|').map(ev).reduce((p, c) => (cmpQ(c, p) > 0 ? c : p))),
  SORTWORD: (a) => a.split('|').map(x => x.split('=')).map(([e, ch]) => [ev(e), ch]).sort((p, q) => cmpQ(p[0], q[0])).map(x => x[1]).join(''),
  WORD: (a) => a
};
const sp = (s) => { const m = String(s).match(/^([A-Z]+):(.*)$/); return m ? special[m[1]](m[2]) : s; };
const EXP = {
  basic: {
    u1_l01: [v_('3/4 × 16'), m_('9 ÷ 7'), m_('2 2/7 ÷ 4')],
    u1_l02: [v_('3/4 ÷ 1/4'), m_('6/7 ÷ 3/7'), 'DIVN:14|5,6,7'],
    u1_l03: [m_('4/13 ÷ 11/13'), m_('8/11 ÷ 3/11'), m_('7/8 ÷ 5/8')],
    u1_l04: [m_('3/7 ÷ 5/8'), m_('2/7 ÷ 9/10'), m_('3/5 ÷ 2/9')],
    u1_l05: [v_('2 ÷ 1/3'), v_('8 ÷ 1/4'), 'LT:2 ÷ 1/3'],
    u1_l06: [m_('5 ÷ 2/3'), v_('9 ÷ 3/7'), 'MINQ:4 ÷ 5/9|5 ÷ 4/9'],
    u1_l07: [m_('3/10 ÷ 5/8'), m_('4/5 ÷ 2/11'), m_('7/9 ÷ 2/5')],
    u1_l08: [m_('2 3/5 ÷ 1 2/5'), m_('7 ÷ 2 5/8'), m_('3/4 ÷ 3 1/6')],
    u1_l09: [v_('4 ÷ 1/2'), m_('1/2 ÷ 1/9'), v_('4 1/2 ÷ 3/4')],
    u1_l10: ['WORD:타일 100개로 벽을 겹치지 않게 가득 붙일 수 있는지', v_('350 ÷ 8 3/4'), v_('140 ÷ 8 3/4')],
    u1_l11: [v_('8 ÷ 2/3'), 'MAXMIN:10/11,7/11,4/11,3/11,5/11', m_('2 3/4 ÷ 5 1/2')]
  },
  lev: {
    u1_l01: [m_('2 ÷ 9'), m_('9/14 ÷ 3')], u1_l02: [v_('5/8 ÷ 1/8'), v_('6/11 ÷ 2/11')], u1_l03: [m_('9/14 ÷ 11/14'), m_('12/13 ÷ 5/13')],
    u1_l04: [v_('7/9 ÷ 7/18'), m_('5/8 ÷ 3/16')], u1_l05: [v_('5 ÷ 1/2'), v_('3 ÷ 1/7')], u1_l06: [v_('6 ÷ 2/5'), v_('15 ÷ 3/20')],
    u1_l07: [m_('5/11 ÷ 6/7'), m_('4/7 ÷ 11/14')], u1_l08: [m_('1 2/5 ÷ 4 1/3'), m_('4 2/5 ÷ 2 2/5')], u1_l09: [m_('1 1/4 ÷ 1/6'), m_('4/5 ÷ 1 3/5')],
    u1_l10: [v_('52 1/2 ÷ 8 3/4'), v_('(52 1/2 ÷ 8 3/4) × (52 1/2 ÷ 8 3/4)')], u1_l11: [v_('15/16 ÷ 5/16'), m_('6 2/9 ÷ 2 1/3 ÷ 4/5')]
  },
  exit: {
    u1_l01: [m_('11 ÷ 7'), 'WORD:곱셈', 'WORD:(자연수)÷(분수)'], u1_l02: [v_('4/7 ÷ 2/7'), v_('8/9 ÷ 2/9'), 'WORD:단위분수'], u1_l03: [m_('7/16 ÷ 9/16'), m_('17/19 ÷ 7/19'), m_('8/11 ÷ 5/11')],
    u1_l04: [m_('5/6 ÷ 4/7'), m_('5/6 ÷ 3/8'), m_('5/6 ÷ 3/4')], u1_l05: [v_('6 ÷ 1/7'), v_('8 ÷ 1/7'), 'WORD:분모'], u1_l06: [m_('3 ÷ 5/6'), m_('9 ÷ 6/7'), v_('8 ÷ 4/9')],
    u1_l07: [m_('4/9 ÷ 5/13'), m_('5/12 ÷ 7/18'), m_('7/8 ÷ 2/3')], u1_l08: [m_('5/14 ÷ 1 3/7'), m_('2 2/5 ÷ 3 1/5'), m_('2 2/9 ÷ 4/5')], u1_l09: [v_('6 ÷ 1 1/2'), m_('1/11 ÷ 1/6'), 'WORD:가분수'],
    u1_l10: [v_('8 × 11'), v_('82 1/2 ÷ 7 1/2'), 'WORD:곱셈'], u1_l11: [m_('7/18 ÷ 8/9'), v_('7 1/2 ÷ 5/6'), v_('2/5 ÷ 1/10')]
  },
  review1: [m_('4 ÷ 5'), m_('7 ÷ 3'), m_('6/7 ÷ 3')],
  adv: { u1_l01: m_('3/5 ÷ 4'), u1_l02: 'MAXV:9/14 ÷ 3/14|10/11 ÷ 5/11', u1_l03: 'MAXMIN:7/19,8/19,9/19,10/19,11/19', u1_l04: m_('7/9 ÷ 7/12'), u1_l05: v_('18 ÷ 1/6'), u1_l06: 'MAXV:8 ÷ 4/7|9 ÷ 3/5|7 ÷ 3/7|10 ÷ 5/8|12 ÷ 9/11', u1_l07: 'SORTWORD:7/10 ÷ 4/5=포|12/13 ÷ 2/7=교|5/12 ÷ 3/4=관|14/15 ÷ 4/5=지', u1_l08: v_('5 3/5 ÷ 7/10'), u1_l09: v_('6 ÷ 1/6 ÷ 9/10 ÷ 4/5'), u1_l10: v_('(350 ÷ 8 3/4) × (140 ÷ 8 3/4)'), u1_l11: v_('3 1/3 ÷ 5/18 + 1') }
};

/* ── 교과서 수 표 — 활동목록.md(지도서 쪽 그림으로 다시 읽은 수)의 차시별 교과서·익힘·형성 수. 그 차시 데이터에 있어야 한다 ── */
const TB = {
  u1_l01: ['2/3 × 3 = 2', '3/5 ÷ 1/5', '4 ÷ 5 = 4 × 1/5 = 4/5', '7 ÷ 3 = 7 × 1/3 = 7/3 = 2 1/3', '6/7 ÷ 3 = 2/7', '5/9 ÷ 4 = 5/9 × 1/4 = 5/36', '9 ÷ 7', '11 ÷ 7', '2 2/7', '3/4 = 6/8 = 9/12'],
  u1_l02: ['4/5 ÷ 1/5', '9/10 ÷ 3/10 = 9 ÷ 3 = 3', '3/4 ÷ 1/4', '6/7 ÷ 3/7', '10/11 ÷ 2/11', '14/15', '10/17 ÷ 2/17', '4/7 ÷ 2/7', '6/11', '5/8 ÷ 1/8'],
  u1_l03: ['5/6 ÷ 2/6', '2 1/2', '4/9 ÷ 7/9 = 4 ÷ 7 = 4/7', '3/10 ÷ 7/10', '4/13 ÷ 11/13', '5/7 ÷ 4/7', '8/11 ÷ 3/11', '7/8', '5/8', '11/19 ÷ 7/19', '12/13', '9/14 ÷ 11/14'],
  u1_l04: ['3/4 ÷ 3/8', '15/20 ÷ 8/20', '2/5 ÷ 2/15', '1/3 ÷ 5/6', '3/7 ÷ 5/8', '2/7 ÷ 9/10', '3/5', '2/9', '8/9 ÷ 5/8', '7/9 ÷ 7/12', '5/6 ÷ 4/7'],
  u1_l05: ['5 ÷ 1/3 = 5 × 3 = 15', '4 ÷ 1/2', '6 ÷ 1/5', '11 ÷ 1/4', '18', '2 ÷ 1/3', '6 ÷ 1/7', '8 kg'],
  u1_l06: ['4 ÷ 2/3 = 4 ÷ 2 × 3 = 4 × 1/2 × 3 = 4 × 3/2 = 6', '4 ÷ 3/4', '5 ÷ 2/3', '7 ÷ 7/9', '9 ÷ 3/7', '4 ÷ 5/9', '15 kg', '3/20', '10 ÷ 3/5', '7 ÷ 3/7'],
  u1_l07: ['2/5 ÷ 3/4', '2/15', '8/15', '1/6 ÷ 4/7', '3/10 ÷ 5/8', '5/8 ÷ 5/9', '4/5 ÷ 2/11', '8/15 ÷ 4/5', '관포지교', '7/9 ÷ 2/5', '5/11 ÷ 6/7'],
  u1_l08: ['1 4/5 ÷ 1 1/2', '9/5 ÷ 3/2', '18/10 ÷ 15/10', '9/5 × 2/3', '2 5/6 ÷ 2/3', '1 1/3 ÷ 2/7', '2 3/5 ÷ 1 2/5', '7 ÷ 2 5/8', '3 1/6', '9/38', '4 2/5', '5 3/5'],
  u1_l09: ['5/9 ÷ 2/9', '4 ÷ 2/9 = 18', '18 ÷ 2 1/4 = 8', '1/6 ÷ 6', '6 ÷ 1/6', '36 ÷ 9/10', '40 ÷ 4/5', '4 1/2 ÷ 3/4', '1 1/4 ÷ 1/6', '4/5 ÷ 1 3/5'],
  u1_l10: ['7 1/2', '82 1/2', '60 ÷ 7 1/2', '8 × 11 = 88', '8 3/4', '350', '140', '52 1/2', '100개'],
  u1_l11: ['5/6 ÷ 1/6', '4/7 ÷ 2/7', '2/3 ÷ 2/7', '9 ÷ 1/6', '6 ÷ 5/8', '4 ÷ 1 5/9', '8/27', '21/40', '5/12', '8 ÷ 2/3', '10/11', '3/4 ÷ 8/9', '5 1/2', '6 2/9', '3 1/3']
};
/* ── 지도서 차시 제목(교과서 차시 이름) ── */
const TITLE = { u1_l01: '분수의 나눗셈', u1_l02: '(분수)÷(분수)를 계산해요 ⑴', u1_l03: '(분수)÷(분수)를 계산해요 ⑵', u1_l04: '(분수)÷(분수)를 계산해요 ⑶', u1_l05: '(자연수)÷(분수)를 계산해요 ⑴', u1_l06: '(자연수)÷(분수)를 계산해요 ⑵', u1_l07: '(분수)÷(분수)를 분수의 곱셈으로 나타내어 계산해요', u1_l08: '대분수의 나눗셈을 해요', u1_l09: '알쏭달쏭 가로세로 나눗셈', u1_l10: '조각조각 타일로 학교 꾸미기', u1_l11: '문제로 마무리' };
const PAGES = { u1_l01: '126~127', u1_l02: '128~131', u1_l03: '132~135', u1_l04: '136~139', u1_l05: '140~143', u1_l06: '144~147', u1_l07: '148~151', u1_l08: '152~155', u1_l09: '156~157', u1_l10: '158~159', u1_l11: '160~162' };

console.log('═══ A. 로드 ═══');
T('11차시 키 u1_l01~l11 · 파일 data/g6s2_math_u1.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 수학 · 1단원 분수의 나눗셈 · [6수01-11] · 40분 · 지도서 쪽 · n', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 6 && m.term === 2 && m.unit === 1 && m.subject === '수학' && m.unit_title === '분수의 나눗셈' && m.n === +k.slice(-2), k); ok(/^\[6수01-11\]/.test(m.std), k + ' 성취기준'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 1단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); }));
T('차시 제목 = 지도서 차시 이름 · 합계 440분', () => { KEYS.forEach(k => ok(L[k].meta.title.indexOf(TITLE[k]) >= 0, k + ' ' + L[k].meta.title)); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 440, '분'); });
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math · 6학년 = tier-high', () => { ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 fdv·dnl(새) · mln·mcc·wyc·fch·dtb 등록 · 잘못된 인자는 던짐', () => { [{ k: 'fdv', a: 5, b: 2, d: 6 }, { k: 'dnl', d: 3, at: '1/3', val: '5', marks: ['1/3', '1'] }, { k: 'mln', n: 1, d: 5, times: 4, to: 1 }, { k: 'mcc', rows: [{ expr: '4/5 ÷ 1/5 = 4' }] }, { k: 'wyc', items: [{ name: 'a', lines: ['1/2 ÷ 1/4 = 2'] }] }, { k: 'fch', items: ['3/4'] }, { k: 'dtb', head: ['a', 'b'], rows: [['1', '2']] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'fdv', a: 0, b: 2, d: 6 }, { k: 'fdv', a: 5, b: 2, d: 6, ta: '5/7' }, { k: 'fdv', a: 6, b: 3, d: 8, coarse: 3 }, { k: 'dnl', d: 3, at: '1/3', val: '5', marks: ['1/3', '1'], ops: [['1/3', '1', '×2']] }, { k: 'dnl', d: 3, at: '1/2', val: '5', marks: ['1/2', '1'] }, { k: 'dnl', d: 3, at: '1/3', val: '5', marks: ['1'] }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 6, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 209장 (11 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 209, '장 수'));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 11종 서로 다름 · 5-2 수학 1~6단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 11, im.join(',')); let other = []; for (let u = 1; u <= 6; u++) { const f = path.join(TDIR, 'data/g5s2_math_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => l.slides[2].data.img)); } ok(other.length >= 50, '5-2 수학 데이터 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '6학년 1학기 분수의 나눗셈 되짚기'), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(rv.from === '' && rv.items.length === 3 && /전에 배운/.test(rv.title), 'l01 되짚기'); ok(/6학년 1학기/.test(rv.content), 'l01 되짚기 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 차시 「다음 단원엔」 = 2단원 공간과 입체 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u1_l11.slides[18].data; ok(nx.title === '다음 단원엔' && /공간과 입체/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]].replace(/ ⑴| ⑵| ⑶/, '')) >= 0 || (i === 0 && /계산해요 ⑴/.test(d.preview)), k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
function want(d, exp) {
  exp = sp(exp);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘');
    d.options.filter(o => !o.correct).forEach(o => { try { const v = ev(o.text); ok(!eqQ(v, ev(exp)), '오답 보기가 정답과 같은 값 ' + o.text); } catch (e) { if (/정답과 같은/.test(e.message)) throw e; } }); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
  nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u1_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(sp(EXP.lev[k][i])), t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { const e = sp(EXP.exit[k][i]); ok(String(x.a) === String(e), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  if (k === 'u1_l01') sl[1].data.items.forEach((x, i) => { ok(String(x.a) === EXP.review1[i], '되짚기 ' + x.a); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === sp(EXP.adv[k]), '넓히기 끝 ' + last + ' ≠ ' + sp(EXP.adv[k])); nCheck++; }));
T('다시 셈한 정답 = 102', () => ok(nCheck === 102, nCheck));
T('셈기 자체 확인 — 분수 덩이 · 대분수 · 왼쪽부터 · 특수 셈 · 틀린 답 잡음', () => { ok(m_('4/5 ÷ 2/11') === '4 2/5' && f_('2/5 ÷ 3/4') === '8/15' && v_('4 ÷ 2 × 3') === '6' && m_('2 5/6 ÷ 2/3') === '4 1/4' && v_('6 ÷ 1/6 ÷ 9/10 ÷ 4/5') === '50', '셈'); ok(sp('LT:2 ÷ 1/3') === '1, 2, 3, 4, 5' && sp('MINQ:4 ÷ 5/9|5 ÷ 4/9') === '4 ÷ 5/9' && sp('MAXMIN:10/11,3/11,5/11') === '3 1/3' && sp('SORTWORD:7/10 ÷ 4/5=포|5/12 ÷ 3/4=관') === '관포', '특수'); let c = 0; try { want({ options: [{ text: '18/49', correct: true }, { text: '2' }] }, m_('6/7 ÷ 3/7')); } catch (e) { c++; } try { want({ input: 'count_input', answer: 5, note: '**5**' }, v_('3/4 ÷ 1/4')); } catch (e) { c++; } try { want({ options: [{ text: '2', correct: true }, { text: '4/2' }] }, '2'); } catch (e) { c++; } ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d \t/×÷+\-−()]*=[\d \t/×÷+\-−()=]*\d\)?/g; // 줄을 넘지 않음
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim(); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (!/[×÷+\-−/]/.test(t)) continue; try { const r = chain(t); nEq++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 150', () => ok(!badEq.length && nEq >= 150, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('오개념 「틀린 생각」 칸의 식은 정말 틀림 · 식 있는 틀린 생각 ≥ 7', () => { let n = 0; KEYS.forEach(k => { const wr = clean(L[k].slides[7].data.wrong); const ms = wr.match(/\d[\d\s/×÷+\-]*=[\d\s/×÷+\-=]*\d/g) || []; ms.forEach(t => { n++; ok(!chain(t).ok, k + ' 틀린 생각이 맞는 식 ' + t); }); }); ok(n >= 7, '식 있는 틀린 생각 ' + n); });
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['10/17 ÷ 2/17 = 5/17', '8/15 ÷ 4/5 = 8/15 × 4/5', '60 ÷ 7 1/2 = 9'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('2 5/6 ÷ 2/3 = 17/6 × 3/2 = 17/4 = 4 1/4', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s]); }));
const nG = { row: 0, bad: 0, fdv: 0, dnl: 0, op: 0, wyc: 0, mln: 0, ask: 0 };
function checkFig(w0, f, b) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'mcc' || f.k === 'fln') { let prev = null; [...d.querySelectorAll('.mcc-r')].forEach(r => { const e = r.getAttribute('data-calc'); if (!/=/.test(e)) { prev = null; return; } const c = chain(e, prev); nG.row++; if (r.classList.contains('bad')) { nG.bad++; ok(!c.ok, w0 + ' 잘못한 줄이 맞음 ' + e); prev = null; } else { ok(c.ok, w0 + ' 계산 줄 ' + e); prev = c.last; } }); }
  if (f.k === 'wyc') { nG.wyc++; const ends = []; [...d.querySelectorAll('.wyc-c')].forEach(c => { let prev = null; const ls = [...c.querySelectorAll('.wyc-l')].map(x => x.getAttribute('data-calc')); ls.forEach(e => { const r = chain(e, prev); nG.row++; ok(r.ok, w0 + ' 방법 줄 ' + e); prev = r.last; }); ends.push(fstr(prev)); }); ok(new Set(ends).size === 1, w0 + ' 방법마다 몫 다름 ' + ends); }
  if (f.k === 'fdv') { nG.fdv++; const svg = d.querySelector('svg'); const [a, bb, dd] = svg.getAttribute('data-fdv').split(',').map(Number); ok(a === f.a && bb === f.b && dd === f.d, w0 + ' 명세');
    ok(d.querySelectorAll('rect.fdv-c.on').length === a, w0 + ' 색칠 칸 ' + d.querySelectorAll('rect.fdv-c.on').length);
    const q = Q(a, bb); if (f.ask) { nG.ask++; ok(svg.getAttribute('data-q') === '' && d.querySelectorAll('g.fdv-g').length === 0, w0 + ' ask 인데 몫·묶음 보임'); ok(d.querySelector('g.fdv-eq') ? d.querySelector('g.fdv-eq').textContent.indexOf('?') >= 0 : true, w0 + ' ask 「?」'); }
    else { ok(svg.getAttribute('data-q') === mix(q), w0 + ' 몫 ' + svg.getAttribute('data-q') + ' ≠ ' + mix(q)); const gl = [...d.querySelectorAll('g.fdv-g')].map(g => g.getAttribute('data-lab')); const full = Math.floor(a / bb), r = a - full * bb; const wantG = Array.from({ length: full }, (_, i) => String(i + 1)).concat(r ? [mix(Q(r, bb))] : []); ok(SAME(gl, wantG), w0 + ' 묶음 ' + gl + ' ≠ ' + wantG); }
    if (f.ta) ok(eqQ(ev(f.ta), Q(a, dd)), w0 + ' ta'); if (f.tb) ok(eqQ(ev(f.tb), Q(bb, dd)), w0 + ' tb'); }
  if (f.k === 'dnl') { nG.dnl++; const svg = d.querySelector('svg'); const key = svg.getAttribute('data-dnl').split('|'); const unit = div(ev(f.val), ev(f.at));
    const shown = key[2].split(';').map(x => x.split(':')); ok(shown.length === f.marks.length, w0 + ' 자리 수');
    shown.forEach(([m, v]) => { if (f.ask === m) { nG.ask++; ok(v === '?', w0 + ' ask 자리 값 보임'); } else ok(eqQ(ev(v), mul(unit, ev(m))), w0 + ' 위 값 ' + m + '→' + v); });
    ok(f.marks.indexOf(f.at) >= 0 && eqQ(ev(shown.find(x => x[0] === f.at)[1]), ev(f.val)), w0 + ' 아는 짝');
    if (f.ask) ok(svg.getAttribute('data-unit') === '' && [...d.querySelectorAll('.dnl-top')].map(t => t.textContent).indexOf(mix(mul(unit, ev(f.ask)))) < 0, w0 + ' ask 인데 1의 양 보임');
    (f.ops || []).forEach(([a, b2, op]) => { nG.op++; const m = op.match(/^([×÷])(\d+)$/); const r = m[1] === '×' ? mul(ev(a), Q(+m[2])) : div(ev(a), Q(+m[2])); ok(eqQ(r, ev(b2)), w0 + ' 화살표 ' + a + op + '≠' + b2); }); }
  if (f.k === 'mln') { nG.mln++; const sn = (f.w || 0) * f.d + f.n; ok(d.querySelectorAll('g.mln-j').length === f.times, w0 + ' 걸음 수'); const res = d.querySelector('.mln-res'); if (f.ask) { nG.ask++; ok(res && res.textContent === '?', w0 + ' ask 끝 보임'); } else if (f.res) ok(eqQ(ev(f.res), Q(sn * f.times, f.d)), w0 + ' 끝 ' + f.res); }
}
T('그림 ' + figs.length + '개 — 띠 칸·묶음·몫 · 이중수직선 값·화살표 · 계산 줄 · 방법 카드 · ask 가림', () => figs.forEach(([w0, f, b]) => checkFig(w0, f, b)));
T('그림 수 = 장 글의 수 — dnl 아는 값(값+단위)·아는 자리, fdv 나누어지는 수·나누는 수가 그 장의 글(개념 글·물음)에 있음', () => { let n = 0; figs.forEach(([w0, f, b, s]) => { const tx = nsp((s.data.content || '') + ' ' + (s.data.question || '') + ' ' + (s.data.title || ''));
  if (f.k === 'dnl') { n++; const unit = (String(f.tl).match(/\(([^)]+)\)/) || [])[1]; ok(tx.indexOf(nsp(f.val + ' ' + unit)) >= 0, w0 + ' 아는 값 「' + f.val + ' ' + unit + '」 이 글에 없음'); ok(tx.indexOf(nsp(f.at)) >= 0, w0 + ' 아는 자리 ' + f.at); }
  if (f.k === 'fdv') { n++; [f.ta || f.a + '/' + f.d, f.tb || f.b + '/' + f.d].forEach(v => ok(tx.indexOf(nsp(v)) >= 0, w0 + ' 띠 수 ' + v + ' 이 글에 없음')); } }); ok(n >= 15, '대조한 그림 ' + n); });
T('기본 문제 그림이 정답을 보이지 않음(그림 글자 속 정답 0 — 문제 글에 이미 있는 수 빼고)', () => figs.filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data; const ans = d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer); const txt = docOf(FIG.render(f)).body.textContent.replace(/\s+/g, ''); if (nsp(d.question).indexOf(nsp(ans)) >= 0) return; const fx = String(ans).replace(/\s+/g, ''); ok(txt.indexOf(fx) < 0 || /^\d$/.test(fx) && !new RegExp('(^|[^\\d/])' + fx + '([^\\d/]|$)').test(docOf(FIG.render(f)).body.textContent), w0 + ' 그림에 정답 ' + ans); }));
T('개념 44장 · 기본 문제 33장 모두 그림 · 새 부품 fdv ≥ 8 · dnl ≥ 7 · 화살표 ≥ 5 · ask ≥ 9 · 계산 줄 ≥ 60', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 44 && p === 33, c + '/' + p); ok(nG.fdv >= 8 && nG.dnl >= 7 && nG.op >= 5 && nG.ask >= 9 && nG.row >= 60 && nG.wyc >= 3, JSON.stringify(nG)); });
T('그림 검사기 자체 확인 — 틀린 계산 줄 · 방법 카드 몫 다름 · 띠 묶음 · 이중수직선 값·ask 잡음', () => { let c = 0; const tr = (f) => { try { checkFig('probe', f, 'concept'); } catch (e) { c++; } };
  tr({ k: 'mcc', rows: [{ expr: '3/4 ÷ 2/5 = 15/8 = 1 5/8' }] }); tr({ k: 'wyc', items: [{ name: 'a', lines: ['9/5 ÷ 3/2 = 6/5'] }, { name: 'b', lines: ['9/5 ÷ 3/2 = 18/15 = 6/5', '= 1 1/5'] }, { name: 'c', lines: ['9/5 × 3/2 = 27/10'] }] }); tr({ k: 'mln', n: 1, d: 5, times: 4, to: 1, res: '3/5' });
  const realFdv = FIG.render; FIG.render = (f) => realFdv(f).replace(/data-q="2 1\/2"/, 'data-q="2"'); tr({ k: 'fdv', a: 5, b: 2, d: 6 }); FIG.render = realFdv;
  FIG.render = (f) => realFdv(f).replace(/1:15/, '1:16'); tr({ k: 'dnl', d: 3, at: '1/3', val: '5', marks: ['1/3', '1'] }); FIG.render = realFdv;
  FIG.render = (f) => realFdv(f).replace(/1:\?/, '1:15'); tr({ k: 'dnl', d: 3, at: '1/3', val: '5', marks: ['1/3', '1'], ask: '1' }); FIG.render = realFdv;
  ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u1_l11') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l02 표의 「10/17 ÷ 2/17」는 l05 에 없음)', () => { ok(nsp(JSON.stringify(L.u1_l05)).indexOf(nsp('10/17 ÷ 2/17')) < 0, 'l05'); ok(nsp(JSON.stringify(L.u1_l02)).indexOf(nsp('5 ÷ 1/3 = 5 × 3 = 15')) < 0, 'l02'); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 원문 있는 차시는 file 이름 꼴 g6_math_u1_lNN_ · 9차시(함께하는 수학)는 원문 없음(null)', () => KEYS.forEach(k => { const f = SRC[k].file; if (k === 'u1_l09') ok(f === null, 'l09'); else ok(/^g6_math_u1_l\d\d_.+\.html$/.test(f), k + ' ' + f); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~면?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 「나누면 작아진다」 l05 · 몫의 분수 부분 ≠ 나머지 l03 · 이중수직선 보조 도구 l05~l07 · 자연수로 바꾸어 유추 l04·l05·l07 · 기약분수 허용 l07·l11', () => { const tx = (k) => JSON.stringify(L[k]);
  ok(/나누면 작아진다|작아진다/.test(L.u1_l05.slides[7].data.wrong), 'l05 오개념'); ok(/나머지/.test(L.u1_l03.slides[7].data.right), 'l03 나머지'); ['u1_l05', 'u1_l06', 'u1_l07'].forEach(k => ok(/보조 도구/.test(tx(k)), k + ' 보조 도구')); ['u1_l04', 'u1_l05', 'u1_l07'].forEach(k => ok(/자연수로 바꾸어/.test(tx(k)), k + ' 자연수로')); ['u1_l07', 'u1_l11'].forEach(k => ok(/기약분수/.test(tx(k)), k + ' 기약분수')); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['통분하여 분자끼리', 4], ['단위분수의 분모를 곱해', 5], ['분모와 분자를 바꾸어', 6], ['가분수로 나타내어', 8]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));
T('선행 검사기 자체 확인 — 역수 알고리즘은 단원 초기(l02~l05)에 0', () => { ['u1_l02', 'u1_l03', 'u1_l04', 'u1_l05'].forEach(k => ok(teach(k).indexOf('분모와 분자를 바꾸어') < 0, k)); ok(teach('u1_l07').indexOf('분모와 분자를 바꾸어') >= 0, 'l07 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 · 곰이·펭이 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => ok(all.indexOf(b) < 0, b)); ok(!/곰이|펭이/.test(all), '곰이·펭이'); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면(렌더 글자)에 영어 코드(u1 · l01 · L01 · lesson) 0 · 영어 낱말은 단위(kg·km·cm·m·L)·보기 기호(A~D)만', () => { const UNITS = ['kg', 'km', 'cm', 'm', 'L']; KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); /* 그림 글자 조각(SVG text)이 붙어 「L26」처럼 읽히지 않게 */ const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(UNITS.indexOf(wd) >= 0 || /^[A-D]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });

T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('\n게이트 g6s2 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
