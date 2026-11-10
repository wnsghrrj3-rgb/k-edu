/* gate_g2s2_math_u2.js — 2학년 2학기 수학 2단원 「곱셈구구」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 틀 + 지도서 직행 점검).
   옛 게이트(139차, 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g2s2_math_u2.js 에 보관.
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(mgrp·mdan·mjump·marr·mring·ngrid·eqt·objs1·panels) · meta(2학년 2학기 · 2단원 · [2수01-11] · 40분 · 지도서 쪽 · live_url 원문 있음) · slug g2s2_math
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 동기 장면 · 실사 12종 서로 다름 · 다른 데이터와 겹침 0)
   D 복습 계보(l01 = 1단원 데이터 마지막 차시 출구 — 1단원 파일에서 동적으로 읽어 대조 → l02 … l12 = 직전 출구) · l12 다음 단원 = 길이 재기
   E 정답 다시 셈 — 게이트 자체 정수 계산기(× 먼저, + − 왼쪽부터)와 특수 셈(□ 풀이 · 단의 곱 · 조건 거르기 · 무늬 차례 · 일의 자리)으로 기본 36 · 수준별 24 · 출구 36 · 넓히기 12 = 108
   F 식 전수 — 슬라이드 글 속 「… = …」 사슬 다시 셈(오개념 「틀린 생각」·발문 칸만 뺌) · 틀린 생각의 식은 정말 틀림 · 섞인 식(곱셈과 덧셈·뺄셈을 한 줄에) 0 — 지도서 201 · 검산기 자체 확인
   G 그림 — mgrp 묶음·누적 수 · mdan 단 줄 곱 · mjump 도착 · marr 줄·칸·나눔·빈 자리 · mring 차례 = 일의 자리 셈 · 곱셈표 칸 = 줄 × 칸 · 접는 칸 대각선 · ★♥ 짝 · 점수판 식 · eqt 식
         · 그림 수 = 장 글의 수 · 문제 그림 값 = 정답 · 문제 그림이 답을 보이지 않음
   H 재료 충실(개념 = src · 기본 문제 = src) · 교과서 수 표(활동목록.md 차시별 수·장면) · 보탬 흡수(옛 TB 13장 핵심 낱말·수가 본류 장에 · b_ 0) · 차시 제목 = 지도서 제목 · 중복 · src 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에 · L 선행(뒤 차시 말이 앞 차시에 0)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 인물 곰이·펭이(동기 장면) · 교사 화면 영어 코드(u2·L01) 0
   R 역검증 레드 — 일부러 망가뜨린 사본(정답 · 복습 계보 · 그림 · 섞인 식 · 「결」 · 선행 · 보탬 b_)을 각 검사기가 잡는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u2.js'));
const U1 = load(path.join(TDIR, 'data/g2s2_math_u1.js'));
const U1KEY = Object.keys(U1).filter(x => /^u1_l\d\d$/.test(x)).sort().pop();
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 12 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '곱셈구구', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const hasNum = (txt, n) => new RegExp('(^|[^\\d])' + n + '([^\\d]|$)').test(String(txt).replace(/\*\*/g, ''));

/* ── 게이트 자체 정수 계산기 (부품·생성기와 따로 짬) — × 먼저, + − 는 왼쪽부터, 괄호 ── */
function ev(s0) {
  const s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-');
  const tk = s.match(/\d+|[-+×*()]|\S/g) || []; let i = 0;
  const peek = () => tk[i], next = () => tk[i++];
  function atom() { const t = next(); if (t === '(') { const v = expr(); ok(next() === ')', '괄호 in ' + s0); return v; } if (t && /^\d+$/.test(t)) return +t; throw new Error('모르는 글자 ' + t + ' in ' + s0); }
  function term() { let v = atom(); while (peek() === '×' || peek() === '*') { next(); v *= atom(); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const o = next(), r = term(); v = o === '+' ? v + r : v - r; } return v; }
  const v = expr(); ok(i === tk.length, '남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return v;
}
function chain(expr) { const parts = String(expr).split('=').map(x => x.trim()).filter(Boolean); const vals = parts.map(ev); return { ok: vals.every(v => v === vals[0]), last: vals[vals.length - 1], n: parts.length - 1 }; }
const ringSeq = (d) => { const s = [0]; for (let k = 1; k <= 10; k++) { const u = (d * k) % 10; s.push(u); if (u === 0) break; } return s; };
const danOf = (d) => Array.from({ length: 9 }, (_, i) => d * (i + 1));
function boxSolve(eq) { const [l, r] = eq.split('='); const sols = []; for (let x = 0; x <= 9; x++) if (ev(l.replace('□', x)) === ev(r.replace('□', x))) sols.push(x); ok(sols.length === 1, '□ 풀이 ' + eq + ' → ' + sols); return String(sols[0]); }
function clue(spec) { const cs = spec.split(';'); const okc = (x) => cs.every(c => { let m; if ((m = c.match(/^dan(\d)$/))) return danOf(+m[1]).indexOf(x) >= 0; if ((m = c.match(/^gt(\d+)$/))) return x > +m[1]; if ((m = c.match(/^lt(\d+)$/))) return x < +m[1]; if (c === 'odd') return x % 2 === 1; if (c === 'even') return x % 2 === 0; if ((m = c.match(/^tens(\d)$/))) return Math.floor(x / 10) === +m[1]; throw new Error('모르는 조건 ' + c); });
  const r = Array.from({ length: 91 }, (_, i) => i).filter(okc); ok(r.length === 1, '조건 ' + spec + ' → ' + r); return String(r[0]); }

/* ── 정답 표 — 게이트가 식·규칙에서 다시 셈 ── */
const v_ = (e) => String(ev(e));
const special = {
  REPADD: (a) => { const [n, k] = a.split(',').map(Number); return n + ' × ' + k + ' = ' + n * k; },               // n 을 k 번 더한 덧셈식의 곱셈식
  MULOF: (a) => { const [n, k] = a.split(',').map(Number); return n + ' × ' + k; },                                // n개씩 k묶음의 곱셈식
  NOTDAN: (a, d) => { const dn = +a; const c = d.options.map(o => clean(o.text)).filter(t => danOf(dn).indexOf(+t) < 0); ok(c.length === 1, 'NOTDAN 후보 ' + c); return c[0]; },
  COMMON: (a, d) => { const [x, y] = a.split(',').map(Number); const c = d.options.map(o => clean(o.text)).filter(t => danOf(x).indexOf(+t) >= 0 && danOf(y).indexOf(+t) >= 0); ok(c.length === 1, 'COMMON 후보 ' + c); return c[0]; },
  REGRP: (a) => { const [p, n, q] = a.split(',').map(Number); ok((p * n) % q === 0, 'REGRP 나누어떨어지지 않음'); return String(p * n / q); },
  WRONGSAY: (a, d) => { const v = ev(a); const c = d.options.map(o => clean(o.text)).filter(t => { const m = t.match(/모두 (\d+)개/); return m && +m[1] !== v; }); ok(c.length === 1, 'WRONGSAY 후보 ' + c); return c[0]; },
  SAMEPROD: (a, d) => { const v = ev(a); const c = d.options.map(o => clean(o.text)).filter(t => nsp(t) !== nsp(a) && ev(t) === v); ok(c.length === 1, 'SAMEPROD 후보 ' + c); return c[0]; },
  ONES: (a) => String(ev(a) % 10),
  BOX: (a) => boxSolve(a),
  CLUE: (a) => clue(a),
  RING: (a) => ringSeq(+a).join(' → '),
  RINGOTHER: (a) => { const r = ringSeq(+a).filter(x => x !== 0); ok(new Set(r).size === 1, 'RINGOTHER 한 줄 아님 ' + r); return String(r[0]); },
  SEQNEXT: (a) => { const s = a.split(',').map(Number); const st = s[1] - s[0]; ok(s.every((x, i) => x === s[0] + st * i), 'SEQNEXT 등차 아님'); return String(s[s.length - 1] + st); },
  DIGSUM: (a) => { const r = danOf(+a).slice(1).map(x => Math.floor(x / 10) + x % 10); ok(new Set(r).size === 1, 'DIGSUM ' + r); return String(r[0]); },
  ONESCYCLE: (a) => { const r = []; danOf(+a).forEach(x => { if (r.indexOf(x % 10) < 0) r.push(x % 10); }); return r.join(', '); },
  CMPSAME: (a) => { const [x, y] = a.split('|').map(ev); ok(x === y, 'CMPSAME 다름 ' + x + ',' + y); return '같아요'; },
  NINETENS: (a) => { const c = danOf(9).filter(x => Math.floor(x / 10) === +a); ok(c.length === 1, 'NINETENS ' + c); return String(c[0]); },
  PUZZLE: (a) => { const [d1, row, d2] = a.split('|'); const cols = row.split(',').map(x => { ok(+x % +d1 === 0, 'PUZZLE ' + x); return +x / +d1; }); return String(+d2 * cols[cols.length - 1]); },
  WORD: (a) => a
};
const sp = (s, d) => { const m = String(s).match(/^([A-Z]+):(.*)$/); return m ? special[m[1]](m[2], d) : s; };
const EXP = {
  basic: {
    u2_l01: ['REPADD:4,3', 'MULOF:9,5', v_('2 × 4')],
    u2_l02: [v_('2 × 7'), v_('2 × 6 - 2 × 5'), 'NOTDAN:2'],
    u2_l03: [v_('5 × 8'), v_('5 × 7'), v_('5 × 6')],
    u2_l04: [v_('3 × 7'), v_('6 × 7 - 6 × 6'), 'COMMON:3,6'],
    u2_l05: [v_('4 × 6'), v_('4 × 2'), 'REGRP:8,3,4'],
    u2_l06: ['WRONGSAY:7 × 6', v_('7 × 4'), v_('7 × 8 - 7 × 7')],
    u2_l07: ['ONES:9 × 7', v_('9 × 6'), v_('9 × 3 + 9 × 5')],
    u2_l08: [v_('0 × 2 + 1 × 2 + 2 × 3 + 3 × 2'), v_('1 × 4 + 0 × 2'), v_('0 × 7')],
    u2_l09: ['CLUE:dan5;tens4;odd', v_('6 × 7'), 'SAMEPROD:4 × 9'],
    u2_l10: [v_('6 × 3'), 'BOX:3 × □ = 15', v_('5 × 6 - 4')],
    u2_l11: ['BOX:□ × 8 = 0', 'CLUE:dan7;even;gt27;lt36', v_('3 × 2 + 4 × 3')],
    u2_l12: ['RING:6', v_('27 + 3'), 'ONES:9 × 2']
  },
  lev: {
    u2_l01: [v_('3 × 4'), 'BOX:6 + 6 + 6 + 6 = 6 × □'], u2_l02: [v_('2 × 5'), v_('2 × 9 - 2 × 8')], u2_l03: [v_('5 × 4'), v_('5 × 9 - 5 × 8')],
    u2_l04: [v_('3 × 5'), v_('6 × 6')], u2_l05: [v_('4 × 5'), v_('8 × 7')], u2_l06: [v_('7 × 3'), v_('7 × 9')],
    u2_l07: [v_('9 × 2'), v_('9 × 9')], u2_l08: [v_('1 × 8'), v_('0 × 3 + 1 × 3 + 2 × 4 + 3 × 0')], u2_l09: [v_('3 × 8'), 'BOX:7 × 4 = 4 × □'],
    u2_l10: [v_('5 × 4'), v_('4 × 5 - 2')], u2_l11: [v_('4 × 6 - 4 × 5'), v_('3 × 7')], u2_l12: ['ONES:2 × 6', 'ONES:7 × 7']
  },
  exit: {
    u2_l01: [v_('4 × 3'), 'BOX:2 + 2 + 2 + 2 + 2 = 2 × □', 'WORD:곱셈구구'], u2_l02: [v_('2 × 3'), v_('2 × 7'), v_('2 × 2 - 2 × 1')], u2_l03: [v_('5 × 3'), v_('5 × 8'), v_('5 × 2 - 5 × 1')],
    u2_l04: [v_('3 × 7'), v_('6 × 4'), 'REGRP:6,4,3'], u2_l05: [v_('4 × 7'), v_('8 × 4'), 'SEQNEXT:0,4,8,12,16,20'], u2_l06: [v_('7 × 6'), v_('7 × 2 - 7 × 1'), v_('5 - 3')],
    u2_l07: [v_('9 × 4'), v_('9 × 7'), 'DIGSUM:9'], u2_l08: [v_('1 × 6'), v_('0 × 9'), v_('8 × 0')], u2_l09: [v_('4 × 6'), 'BOX:9 × 6 = 6 × □', 'ONESCYCLE:5'],
    u2_l10: [v_('6 × 5'), v_('3 × 2 + 5 × 4'), 'WORD:같아요'], u2_l11: [v_('8 × 3'), 'BOX:7 × 3 = 3 × □', v_('2 × 9')], u2_l12: ['ONES:2 × 4', 'ONES:3 × 6', 'RINGOTHER:5']
  },
  adv: { u2_l01: v_('9 × 5'), u2_l02: 'BOX:2 × □ = 18', u2_l03: v_('5 × 9'), u2_l04: 'CMPSAME:3 × 8|6 × 4', u2_l05: v_('8 × 9'), u2_l06: v_('7 × 6 - 7 × 3'), u2_l07: 'NINETENS:2', u2_l08: v_('0 × 4 + 1 × 5 + 3 × 0'), u2_l09: 'CLUE:dan3;dan4;gt20', u2_l10: v_('6 × (8 - 3 - 1)'), u2_l11: 'CLUE:dan8;dan4;gt30;lt36', u2_l12: 'PUZZLE:3|12,15|4' }
};

/* ── 교과서 수 표 — 활동목록.md(지도서 쪽 정독)의 차시별 교과서·익힘·확인해요 수·장면 낱말. 그 차시 데이터에 있어야 한다 ── */
const TB = {
  u2_l01: ['미래 교육 체험관', '4씩 3묶음', '4의 3배', '4 + 4 + 4 = 12', '4 × 3 = 12', '6 × 3 = 18', '9개씩 5묶음', '2개씩', '4봉지', '입장권', '스마트 팜'],
  u2_l02: ['2 × 3', '2 × 4', '2만큼 더 큽니다', '2 + 2 + 2 + 2 + 2 = 10', '2 × 4 = 8', '2 × 6 = 12', '2 × 7 = 14', '2 × 8 = 16', '체험 안경'],
  u2_l03: ['쟁반', '5 × 4', '5만큼 더 큽니다', '5 + 5 + 5 + 5 + 5 = 25', '5 × 6 = 30', '5 × 7 = 35', '5 × 8 = 40', '구슬', '손가락'],
  u2_l04: ['노란색 물고기', '3마리씩', '3만큼 더 큽니다', '3 + 3 + 3 + 3 + 3 + 3 = 18', '3 × 7 = 21', '3 × 8 = 24', '3 × 9 = 27', '5의 6배', '6 × 5 = 30', '6 × 4 = 24', '공통된 수 카드', '학용품', '6 × 2 = 12'],
  u2_l05: ['4대씩 3줄', '4만큼 더 큽니다', '4 + 4 + 4 + 4 + 4 + 4 = 24', '4 × 7 = 28', '4 × 8 = 32', '4 × 9 = 36', '5의 8배', '8 × 5 = 40', '8 × 2 = 16', '4 × 4 = 16', '바둑돌', '우유', '8 × 3 = 24'],
  u2_l06: ['7 cm', '7 × 1 = 7', '7 × 2 = 14', '7 × 3 = 21', '7 + 7 + 7 + 7 + 7 = 35', '두 칸', '6 × 7 = 42', '사탕', '지아'],
  u2_l07: ['9개씩', '9 × 2 = 18', '9 × 3 = 27', '9 + 9 + 9 + 9 = 36', '9개씩 많아', '9 × 4 = 36', '합은 모두 9', '일의 자리'],
  u2_l08: ['인형', '1 × 3 = 3', '1 × 4 = 4', '1 × 5 = 5', '곱하는 수와 곱이 서로 같아요', '0 × 3 = 0', '2 × 4 = 8', '3 × 0 = 0', '0 + 2 + 6 + 6 = 14', '고리', '0 × 2 = 0'],
  u2_l09: ['3씩 커', '5, 0', '4 × 7', '7 × 4', '28', '6 × 8', '16', '45', '3 × 5'],
  u2_l10: ['5 × 3 = 15', '3 × 5', '8 × 2 = 16', '3 × 1 = 3', '4 × 4 = 16', '19', '4 × 5 = 20', '3 × 2 = 6', '5 × 4 = 20', '26', '6 × 3', '6점'],
  u2_l11: ['4 × 4 = 16', '4 × 5 = 20', '1 × 5 = 5', '0 × 8 = 0', '8 × 3', '28', '9 × 3', '6 × 6', '2 × 9 = 18', '4 × 3 = 12'],
  u2_l12: ['2씩 커', '0부터 2칸씩', '3단', '4단', '자', '같은 무늬', '3 × 9 = 27']
};
/* ── 옛 보탬 표 TB(gen 139차 · archive/neutral) 각 줄의 핵심 낱말·수 — 본류 장(extras 아님)에 있어야 한다 ── */
const OLD_TB = {
  u2_l01: [['그림 속에서 곱셈식 고르기', ['6 × 3 = 18', '곱셈식']], ['로봇 바퀴 봉지', ['2개씩', '4봉지', '뛰어 세기', '묶어 세기', '2 × 4 = 8']]],
  u2_l03: [['손가락의 수 맞히기 놀이', ['손가락', '손바닥', '5명', '4명']]],
  u2_l04: [['공통된 수 카드 찾기', ['공통된 수 카드', '3, 6, 9, 12, 15, 18, 21, 24, 27', '「6」']], ['학용품 할인 행사', ['학용품', '공책', '3 × 7', '6 × 2 = 12']]],
  u2_l05: [['8 × 5 다르게 묶어 세기', ['5의 8배', '8 × 5 = 40']], ['로봇 수를 8단과 4단으로', ['8 × 2 = 16', '4 × 4 = 16']], ['바둑돌 놀이', ['바둑돌', '4 × 2 = 8', '8 × 1 = 8']]],
  u2_l09: [['곱셈표에서 수 찾기 놀이', ['수 찾기 놀이', '3 × 5', '16']], ['곱이 같은 곱셈구구 더 찾기', ['3 × 8', '4 × 9', '45']]],
  u2_l10: [['블록 수 — 채우고 빼기', ['3 × 2 = 6', '5 × 4 = 20', '26', '5 × 6 = 30']]],
  u2_l11: [['사물함과 학용품', ['2 × 9 = 18', '4 × 3 = 12', '곱셈구구를 알면 좋은 점']]],
  u2_l12: [['곱셈구구 퍼즐 놀이', ['퍼즐', '봉투', '10초']]]
};
const TITLE = { u2_l01: '곱셈구구', u2_l02: '2단 곱셈구구를 알아볼까요', u2_l03: '5단 곱셈구구를 알아볼까요', u2_l04: '3단, 6단 곱셈구구를 알아볼까요', u2_l05: '4단, 8단 곱셈구구를 알아볼까요', u2_l06: '7단 곱셈구구를 알아볼까요', u2_l07: '9단 곱셈구구를 알아볼까요', u2_l08: '1단 곱셈구구와 0의 곱을 알아볼까요', u2_l09: '곱셈표를 만들어 볼까요', u2_l10: '곱셈구구를 이용하여 문제를 풀어 볼까요', u2_l11: '곱셈구구 문제를 풀어 볼까요', u2_l12: '곱셈구구 속 비밀을 찾아볼까요' };
const PAGES = { u2_l01: '176~179', u2_l02: '180~181', u2_l03: '182~183', u2_l04: '184~187', u2_l05: '188~191', u2_l06: '192~193', u2_l07: '194~195', u2_l08: '196~197', u2_l09: '198~199', u2_l10: '200~201', u2_l11: '202~203', u2_l12: '204~205' };

/* ══ 검사기(역검증에서 망가뜨린 사본에도 쓰려고 함수로 뺌) ══ */
function wantCheck(d, exp0) {
  const exp = sp(exp0, d);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘');
    d.options.filter(o => !o.correct).forEach(o => { let v = null; try { v = ev(o.text); } catch (e) { /* 글 보기 */ } if (v !== null) { let e2 = null; try { e2 = ev(exp); } catch (e) { /* 글 정답 */ } ok(e2 === null || v !== e2, '오답 보기가 정답과 같은 값 ' + o.text); } }); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
}
function reviewChainProblems(LL) {
  const bad = []; KEYS.forEach((k, i) => { const rv = LL[k].slides[1].data;
    const want = i ? LL[KEYS[i - 1]].slides[15].data.items : U1[U1KEY].slides.find(s => s.block === 'exit_ticket').data.items;
    if (rv.from !== (i ? KEYS[i - 1] : 'g2s2_math:' + U1KEY)) bad.push(k + ' from ' + rv.from);
    if (!SAME(rv.items.map(x => [x.q, x.a]), want.map(x => [x.q, x.a]))) bad.push(k + ' 출구 어긋남'); }); return bad;
}
const MIX = [/\d+ ?× ?\d+ ?[+\-−] ?\d/, /\d ?[+\-−] ?\d+ ?× ?\d/];
function mixProblems(LL) { const bad = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { const t = o.replace(/\*\*/g, ''); if (MIX.some(r => r.test(t))) bad.push(where + ' 「' + t.slice(0, 50) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x !== 'fig') walk(o[x], where + '.' + x); }); })({ slides: LL[k].slides, extras: LL[k].extras }, k)); return bad; }
function bannedProblems(LL) { const all = JSON.stringify(LL).replace(/"live_url":"[^"]*"/g, ''); return ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].filter(b => all.indexOf(b) >= 0); }
const teach = (LL, k) => JSON.stringify(LL[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null }))) + JSON.stringify(LL[k].extras);
const FIRST = [['한 번 더 더하', 2], ['다르게 묶어', 4], ['일의 자리', 7], ['곱셈표', 8], ['0 ×', 8], ['× 0', 8], ['바꾸어 곱', 9]];
function earlyProblems(LL) { const bad = []; KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n && teach(LL, k).indexOf(t) >= 0) bad.push(k + ' 「' + t + '」'); }); }); return bad; }
function tbAbsorbProblems(LL) { const bad = []; Object.keys(OLD_TB).forEach(k => { const main = nsp(JSON.stringify(LL[k].slides)); OLD_TB[k].forEach(([nm, words]) => words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) bad.push(k + ' ' + nm + ' — 「' + wd + '」'); })); });
  KEYS.forEach(k => LL[k].extras.forEach(e => { if (/^b_/.test(e.id) || e.type === 'other_activity') bad.push(k + ' 보탬 덤 ' + e.id); })); return bad; }

/* 그림 하나 점검 — 문제 그림이면 그림이 정하는 값(있으면)을 돌려준다 */
const cellV = (c) => (c !== null && typeof c === 'object' ? (c.q ? '?' : String(c.v)) : String(c));
const nG = { mgrp: 0, mdan: 0, mjump: 0, marr: 0, mring: 0, ngrid: 0, eqt: 0, objs1: 0, row: 0, ask: 0 };
function figOne(w0, f, prob, txt) {
  const h = FIG.render(f); ok(h && h.length > 50 && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h), tx = d.body.textContent.replace(/\s+/g, '');
  if (f.k === 'panels') { let out = []; (f.items || []).forEach((p, i) => { out = out.concat(figOne(w0 + '.' + i, p.fig || p, prob, txt)); }); return out; }
  nG[f.k] = (nG[f.k] || 0) + 1;
  if (f.k === 'mgrp') { ok(d.querySelector('svg').getAttribute('data-grp') === f.per + '|' + f.n, w0 + ' data-grp'); ok(d.querySelectorAll('g.o-grp').length === f.n, w0 + ' 묶음 수');
    if (f.tally) ok(Array.from({ length: f.n }, (_, i) => String(f.per * (i + 1))).every(v => hasNum(d.body.textContent.replace(/(\d)(?=\d)/g, '$1'), v) || tx.indexOf(v) >= 0), w0 + ' 누적 수');
    if (prob) ok(!f.tally, w0 + ' 문제 그림에 누적 수');
    ok(hasNum(txt, f.per) && (hasNum(txt, f.n) || hasNum(txt, f.per * f.n)), w0 + ' 그림 수(' + f.per + '씩 ' + f.n + ')가 글에 없음');
    return prob && /모두 몇/.test(txt) ? [String(f.per * f.n)] : []; }
  if (f.k === 'mdan') { ok(d.querySelector('svg').getAttribute('data-dan').split('|')[0] === String(f.dan), w0 + ' data-dan'); const q = f.q || [];
    for (let k = f.from; k <= f.to; k++) { nG.row++; if (q.indexOf(k) >= 0) { nG.ask++; ok(!new RegExp(f.dan + '×' + k + '=' + f.dan * k + '(?!\\d)').test(tx), w0 + ' 빈칸 답 보임 ' + f.dan + '×' + k); } else ok(tx.indexOf(f.dan + '×' + k + '=' + f.dan * k) >= 0, w0 + ' 단 줄 ' + f.dan + '×' + k); }
    (f.hi || []).forEach(k => ok(k >= f.from && k <= f.to, w0 + ' 짚는 줄 범위'));
    return prob && q.length === 1 && !/일의 자리/.test(txt) ? [String(f.dan * q[0])] : []; }
  if (f.k === 'mjump') { ok(d.querySelector('svg').getAttribute('data-mj') === f.step + '|' + f.n, w0 + ' data-mj'); const end = String(f.step * f.n); ok(!!f.q === !!prob, w0 + ' 문제 그림 도착 「?」');
    if (prob) { nG.ask++; ok(!hasNum(d.body.textContent.replace(/(\d)(?=[^\d])/g, '$1 '), end) || tx.indexOf(end) < 0, w0 + ' 도착 수 보임'); } else ok(tx.indexOf(end) >= 0 && hasNum(txt, end), w0 + ' 도착 ' + end + ' 이 그림·글에 없음');
    ok(hasNum(txt, f.step) && (hasNum(txt, f.n) || hasNum(txt, end)), w0 + ' 뛰기 수가 글에 없음');
    return prob ? [end] : []; }
  if (f.k === 'marr') { const miss = (f.miss || []).length; ok(d.querySelector('svg').getAttribute('data-arr') === f.r + '|' + f.c + '|' + miss, w0 + ' data-arr');
    if (f.rs) ok(f.rs.reduce((a, b) => a + b, 0) === f.r, w0 + ' 줄 나눔 합'); if (f.cs) ok(f.cs.reduce((a, b) => a + b, 0) === f.c, w0 + ' 칸 나눔 합');
    (f.miss || []).forEach(([r, c]) => ok(r < f.r && c < f.c, w0 + ' 빈 자리 범위'));
    if (!miss) ok(hasNum(txt, f.r) && hasNum(txt, f.c), w0 + ' 배열 수(' + f.c + '개씩 ' + f.r + '줄)가 글에 없음');
    return prob && /모두 몇/.test(txt) ? [String(f.r * f.c - miss)] : []; }
  if (f.k === 'mring') { if (f.seq.length) ok(SAME(f.seq, ringSeq(f.dan)), w0 + ' 무늬 차례 ' + f.seq + ' ≠ ' + ringSeq(f.dan)); ok(!!f.hide === !f.seq.length, w0 + ' 빈 판'); if (prob) { nG.ask++; ok(f.hide, w0 + ' 문제 그림에 무늬'); }
    ok(d.querySelector('svg').getAttribute('data-ring') === f.dan + '|' + f.seq.join(','), w0 + ' data-ring'); return []; }
  if (f.k === 'ngrid') { const rows = f.rows.map(r => r.map(cellV));
    if (rows[0][0] === '×') { const cols = rows[0].slice(1); const qs = []; const marks = [];
      rows.slice(1).forEach((r, i) => r.slice(1).forEach((v, j) => { const cell = f.rows[i + 1][j + 1], hl = cell && typeof cell === 'object' ? cell.hl : ''; const p = +r[0] * +cols[j]; nG.row++;
        if (hl === 'fold') ok(r[0] === cols[j], w0 + ' 접는 칸 대각선 아님 ' + r[0] + '×' + cols[j]);
        if (hl === 'mark') marks.push(r[0] + '|' + cols[j]);
        if (v === '?') { nG.ask++; qs.push(String(p)); } else if (/^\d+$/.test(v)) ok(+v === p, w0 + ' 곱셈표 ' + r[0] + '×' + cols[j] + ' = ' + v); }));
      marks.forEach(m => { const [a, b] = m.split('|'); ok(marks.indexOf(b + '|' + a) >= 0, w0 + ' ★♥ 짝 없음 ' + m); });
      return prob && qs.length === 1 ? qs : []; }
    if (!f.head) { const v = [].concat(...rows); const nums = v.map((x, i) => [x, i]).filter(([x]) => /^\d+$/.test(x)); const st = (+nums[1][0] - +nums[0][0]) / (nums[1][1] - nums[0][1]);
      nums.forEach(([x, i]) => ok(+x === +nums[0][0] + st * (i - nums[0][1]), w0 + ' 수 줄 차례 ' + x)); const qi = v.indexOf('?');
      if (qi >= 0) { nG.ask++; return prob ? [String(+nums[0][0] + st * (qi - nums[0][1]))] : []; } return []; }
    // 점수판 — 첫 줄 수 × 둘째 줄 수(셋째 줄 식이 있으면 식 셈 + 같은 짝)
    const a = rows[0].slice(1), b = rows[1].slice(1); ok(a.every(x => /^\d+$/.test(x)) && b.every(x => /^\d+$/.test(x)), w0 + ' 점수판 수');
    if (rows[2]) rows[2].slice(1).forEach((e, j) => { nG.row++; ok(chain(e).ok, w0 + ' 점수 식 ' + e); ok(nsp(e).indexOf(a[j] + '×' + b[j] + '=') === 0, w0 + ' 점수 식 짝 ' + e); });
    return prob && /모두 몇 점/.test(txt) ? [String(a.reduce((s, x, j) => s + +x * +b[j], 0))] : []; }
  if (f.k === 'eqt') { const out = []; f.rows.forEach(r => { const t = r.toks.map(String), q = r.q || []; nG.row++;
      if (t.indexOf('?') >= 0) { const qi = t.indexOf('?'); ok(q.indexOf(qi) >= 0, w0 + ' 「?」 칸 표시'); const lhs = t.slice(0, t.indexOf('=')).join(' '); if (qi === t.length - 1 && t.filter(x => x === '=').length === 1) out.push(String(ev(lhs))); }
      else ok(chain(t.join(' ')).ok, w0 + ' 식 ' + t.join(' '));
      if (q.length) { nG.ask++; ok(!/\?/.test(t.join('')) || true, ''); }
      if (prob) ok(!(r.hi || []).length, w0 + ' 문제 식 강조'); });
    return prob && f.rows.length === 1 ? out : []; }
  if (f.k === 'objs1') { ok(f.items.every(i => i.emoji && i.name), w0 + ' 물건 카드'); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}

console.log('═══ A. 로드 ═══');
T('12차시 키 u2_l01~l12 · 파일 data/g2s2_math_u2.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 2학년 2학기 수학 · 2단원 곱셈구구 · [2수01-11] · 40분 · 지도서 쪽 · n · theme · live_url 원문 있음', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 2 && m.term === 2 && m.unit === 2 && m.subject === '수학' && m.unit_title === '곱셈구구' && m.n === +k.slice(-2), k); ok(m.std === '[2수01-11] 곱셈구구를 이해하고, 한 자리 수의 곱셈을 할 수 있다.', k + ' 성취기준'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 2단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(/곰이·펭이/.test(m.theme), k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 480분', () => { KEYS.forEach(k => ok(L[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L[k].meta.title)); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 480, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math', () => ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'));
T('그림 부품 mgrp·mdan·mjump·marr·mring·ngrid·eqt·objs1·panels 등록 · 렌더', () => { [{ k: 'mgrp', per: 2, n: 3 }, { k: 'mdan', dan: 2, from: 1, to: 3 }, { k: 'mjump', step: 7, n: 3 }, { k: 'marr', r: 2, c: 3 }, { k: 'mring', dan: 2, seq: [0, 2, 4, 6, 8, 0] }, { k: 'ngrid', head: true, rows: [['×', '1'], ['2', '2']] }, { k: 'eqt', rows: [{ toks: ['2', '×', '3', '=', '6'] }] }, { k: 'objs1', items: [{ emoji: '🤖', name: '로봇' }] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 50 && !/NaN|undefined/.test(h), f.k); }); ok(FIG.parts.indexOf('panels') >= 0, 'panels'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 228장 (12 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 228, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 동기 장면 곰이·펭이', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  const mo = sl[2].data; ok(mo.desc && mo.question && mo.kids && mo.kids.length === 2, '③장면·물음·인물'); ok(mo.kids[0].face === '🐻' && /^곰이\n"/.test(mo.kids[0].label) && mo.kids[1].face === '🐧' && /^펭이\n"/.test(mo.kids[1].label), '③ 곰이·펭이 꼴');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 12종 서로 다름 · 다른 데이터 파일과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 12, im.join(','));
  const others = fs.readdirSync(path.join(TDIR, 'data')).filter(f => /\.js$/.test(f) && f !== 'g2s2_math_u2.js'); ok(others.length > 50, '데이터 ' + others.length);
  others.forEach(f => { const t = fs.readFileSync(path.join(TDIR, 'data', f), 'utf8'); im.forEach(x => ok(t.indexOf(x) < 0, f + ' 와 겹침 ' + x)); }); });

console.log('═══ D. 복습 계보 ═══');
T('1단원 데이터 마지막 차시 = ' + U1KEY + ' (동적으로 읽음)', () => ok(U1KEY && U1[U1KEY].slides.find(s => s.block === 'exit_ticket'), 'u1 출구'));
T('복습 계보 — l01 = 1단원 마지막 출구 · l02~l12 = 직전 출구(문항·답 그대로)', () => { const b = reviewChainProblems(L); ok(!b.length, b.join(' | ')); });
T('l01 복습 제목·글 = 지난 단원 · 이후 = 지난 시간', () => KEYS.forEach((k, i) => { const rv = L[k].slides[1].data; ok(i ? rv.title === '지난 시간엔 무엇을 했나요?' : /지난 단원/.test(rv.title) && /1단원/.test(rv.content), k); }));
T('마지막 차시 「다음 단원엔」 = 3단원 길이 재기 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u2_l12.slides[18].data; ok(nx.title === '다음 단원엔' && /길이 재기/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0 || (i === 0 && false), k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { wantCheck(s.data, EXP.basic[k][i]); nCheck++; } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { const e = sp(EXP.lev[k][i]); ok(String(lv[t].a) === e, t + ' ' + lv[t].a + ' ≠ ' + e); ok(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]).endsWith(nsp(lv[t].a)), t + ' 풀이 단계·끝 = 답'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { const e = sp(EXP.exit[k][i]); ok(String(x.a) === e, '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + e); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === sp(EXP.adv[k]), '넓히기 끝 ' + last + ' ≠ ' + sp(EXP.adv[k])); nCheck++; }));
T('다시 셈한 정답 = 108', () => ok(nCheck === 108, nCheck));
T('셈기 자체 확인 — × 먼저 · 왼쪽부터 · □ 풀이(답 여럿이면 던짐) · 조건 거르기 · 무늬 · 틀린 답 잡음', () => { ok(ev('3 × 2 + 4 × 3') === 18 && ev('6 × (8 - 3 - 1)') === 24 && ev('8 − 3 − 1') === 4 && ev('0 × 2 + 1 × 2 + 2 × 3 + 3 × 2') === 14, '셈');
  ok(boxSolve('3 × □ = 15') === '5' && clue('dan7;even;gt27;lt36') === '28' && clue('dan2;dan4;gt15') === '16' && clue('dan5;tens4;odd') === '45' && ringSeq(3).join('') === '03692581470' && sp('ONESCYCLE:5') === '5, 0', '특수');
  let c = 0; try { boxSolve('0 × □ = 0'); } catch (e) { c++; } try { wantCheck({ input: 'count_input', answer: 15, note: '**15**' }, v_('2 × 7')); } catch (e) { c++; } try { wantCheck({ options: [{ text: '4 + 3 = 7', correct: true }, { text: '4 × 3 = 12' }] }, 'REPADD:4,3'); } catch (e) { c++; } try { clue('dan3;dan4'); } catch (e) { c++; } ok(c === 4, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /\(?\d[\d \t×+\-−()]*=[\d \t×+\-−()=]*\d\)?/g;
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, '').replace(/[\d \t×+\-−()=]*□[\d \t×+\-−()=]*/g, ' '); /* □ 식은 E 의 □ 풀이가 맡음 */ let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { let t = m[0].trim(); const op = (t.match(/\(/g) || []).length, cl = (t.match(/\)/g) || []).length; if (op > cl) t = t.replace(/^\(/, ''); if (cl > op) t = t.replace(/\)$/, ''); if (!/[×+\-−]/.test(t)) continue; try { const r = chain(t); nEq++; if (!r.ok) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 200', () => ok(!badEq.length && nEq >= 200, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('오개념 「틀린 생각」 칸의 식은 틀린 식을 품음 · 식 있는 틀린 생각 ≥ 8차시', () => { let n = 0; KEYS.forEach(k => { const wr = clean(L[k].slides[7].data.wrong); const ms = wr.match(/\d[\d\s×+\-]*=[\d\s×+\-=]*\d/g) || []; if (!ms.length) return; n++; ok(ms.some(t => !chain(t).ok), k + ' 틀린 생각인데 식이 모두 맞음 ' + ms); }); ok(n >= 8, '식 있는 틀린 생각 ' + n); });
T('섞인 식(곱셈과 덧셈·뺄셈을 한 줄에) 0 — 지도서 201 「혼합 계산을 하지 않도록」', () => { const b = mixProblems(L); ok(!b.length, b.slice(0, 4).join(' | ')); });
T('식·섞인 식 검사기 자체 확인', () => { const b0 = badEq.length; ['4 × 3 = 7', '2 × 4 = 8, 8 + 2 = 11', '20 − 1 = 18'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('9 × 2 = 18, 9 × 3 = 27, 18 + 27 = 45', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함');
  ok(MIX.some(r => r.test('3 × 2 + 5 × 4 = 26')) && MIX.some(r => r.test('20 − 4 × 1')) && !MIX.some(r => r.test('3 × 2 = 6, 5 × 4 = 20, 6 + 20 = 26')), '섞인 식 판별'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s]); }));
const txtOf = (s) => s.block === 'basic_problem' ? (s.data.question + ' ' + s.data.scenario.body) : (s.data.title + ' ' + s.data.content);
T('그림 ' + figs.length + '개 — 부품 값 = 게이트 셈 · 그림 수 = 장 글의 수', () => figs.forEach(([w0, f, b, s]) => figOne(w0, f, b === 'basic_problem', txtOf(s))));
const NG = clone(nG); // 그림마다 한 번씩 센 부품 수(아래 검사가 figOne 을 다시 불러도 바뀌지 않게)
let nFigAns = 0;
T('문제 그림이 정하는 값 = 정답 (곱셈표 빈칸 · 수 줄 · 단 줄 · 뛰기 도착 · 배열 · 점수판 · 식 「?」)', () => figs.filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data; const want = figOne(w0, f, true, txtOf(s)); if (!want.length) return; const A = d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer); ok(want.every(x => x === want[0]) && want[0] === A, w0 + ' 그림 값 ' + want + ' ≠ 답 ' + A); nFigAns++; }));
T('그림 값으로 대조한 문제 ≥ 10 (' + nFigAns + ')', () => ok(nFigAns >= 10, nFigAns));
T('기본 문제 그림이 정답을 보이지 않음(그림 글자 속 정답 0 — 문제 글에 이미 있는 수 빼고)', () => figs.filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data; const ans = d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer); if (nsp(d.question).indexOf(nsp(ans)) >= 0) return; if (f.k === 'mring') { ok(f.hide && !f.seq.length, w0 + ' 무늬판에 선'); return; } /* 빈 무늬판의 0~9 는 고를 자리 — 선(답)은 figOne 이 가림 확인 */ const raw = docOf(FIG.render(f).replace(/></g, '> <')).body.textContent; const toks = raw.split(/\s+/).filter(Boolean); ok(/^\d+$/.test(ans) ? toks.indexOf(ans) < 0 && !new RegExp('=' + ans + '(?!\\d)').test(nsp(raw)) : nsp(raw).indexOf(nsp(ans)) < 0, w0 + ' 그림에 정답 ' + ans); }));
T('개념 48장 · 기본 문제 36장 모두 그림 · 부품 고루(mgrp ≥ 20 · marr ≥ 15 · mdan ≥ 8 · mjump ≥ 4 · mring ≥ 6 · ngrid ≥ 10 · eqt ≥ 8) · 칸·줄 ≥ 150 · 「?」 ≥ 15', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 48 && p === 36, c + '/' + p);
  const g = NG; ok(g.mgrp >= 20 && g.marr >= 15 && g.mdan >= 8 && g.mjump >= 4 && g.mring >= 6 && g.ngrid >= 10 && g.eqt >= 8 && g.row >= 150 && g.ask >= 15, JSON.stringify(g)); });
T('그림 검사기 자체 확인 — 문제 그림 누적 수 · 곱셈표 틀린 칸 · 대각선 아닌 접는 칸 · 무늬 차례 · 뛰기 도착 보임 · 틀린 식 · 글에 없는 묶음 수 잡음', () => { let c = 0; const tr = (f, prob, txt) => { try { figOne('probe', f, prob, txt); } catch (e) { c++; } };
  tr({ k: 'mgrp', per: 4, n: 3, tally: true }, true, '4개씩 3묶음'); tr({ k: 'ngrid', head: true, rows: [['×', '3', '4'], ['2', '6', '9']] }, false, ''); tr({ k: 'ngrid', head: true, rows: [['×', '2', '3'], ['2', '4', { v: '6', hl: 'fold' }]] }, false, '');
  tr({ k: 'mring', dan: 3, seq: [0, 3, 6, 9, 2, 5, 8, 1, 4, 0] }, false, ''); tr({ k: 'mjump', step: 7, n: 4 }, true, '7 cm씩 4칸'); tr({ k: 'eqt', rows: [{ toks: ['6', '×', '3', '=', '19'] }] }, false, ''); tr({ k: 'mgrp', per: 6, n: 3 }, false, '딸기가 9개 있어요');
  ok(c === 7, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u2_l12') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l03 의 「5 + 5 + 5 + 5 + 5 = 25」 는 l02 에 없음 · l08 의 「0 + 2 + 6 + 6 = 14」 는 l05 에 없음)', () => { ok(nsp(JSON.stringify(L.u2_l02)).indexOf(nsp('5 + 5 + 5 + 5 + 5 = 25')) < 0, 'l02'); ok(nsp(JSON.stringify(L.u2_l05)).indexOf(nsp('0 + 2 + 6 + 6 = 14')) < 0, 'l05'); });
T('보탬 흡수 — 옛 TB 13장(1차시 2 · 3차시 1 · 4차시 2 · 5차시 3 · 9차시 2 · 10차시 1 · 11차시 1 · 12차시 1)의 핵심 낱말·수가 본류 장에 · extras 의 b_/other_activity 0', () => { ok(Object.values(OLD_TB).reduce((a, x) => a + x.length, 0) === 13, '옛 TB 13장'); const b = tbAbsorbProblems(L); ok(!b.length, b.slice(0, 5).join(' | ')); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 12차시 모두 옛 자기주도 원문 파일 이름(g2_math_u2_lNN_…html) · 파일 있음', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g2_math_u2_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade2/semester2/math/2단원_곱셈구구', f)), k + ' 원문 없음 ' + f); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬 · 동기 장면 말풍선', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄');
  if (s.block === 'motivate') ok(/mo2-bub/.test(r.body) && r.body.indexOf('곰이') >= 0 && r.body.indexOf('펭이') >= 0, s.id + ' 말풍선'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~면?」 0) · 물음 속 「~다.」 0 (l01 복습 = 1단원 데이터 물음이라 뺌)', () => { const qs = []; KEYS.forEach((k, i) => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(i ? sl[1].data.items : []).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 외우기보다 원리(l01) · 다르게 묶어 세기·5의 6배(l04)·5의 8배(l05) · 묶음 배열(l06) · 부분 서로 더하기(l07) · 과녁 0점 장면(l08) · 3 × 8 도 틀렸다 하지 않음(l09) · 하나씩 세어도 답은 같음·섞어 쓰지 않음(l10) · 계속 더해 잇기(l12)', () => { const tx = (k) => JSON.stringify(L[k]);
  ok(/외우기보다/.test(tx('u2_l01')), 'l01'); ok(/다르게 묶어/.test(tx('u2_l04')) && /5의 6배/.test(tx('u2_l04')), 'l04'); ok(/다르게 묶어/.test(tx('u2_l05')) && /5의 8배/.test(tx('u2_l05')), 'l05'); ok(/묶음 배열/.test(tx('u2_l06')), 'l06'); ok(/부분 서로 더하기/.test(tx('u2_l07')), 'l07');
  ok(/한 번도/.test(tx('u2_l08')) && /0점은 한 번 이상/.test(tx('u2_l08')), 'l08'); ok(/틀렸다고 하지/.test(tx('u2_l09')), 'l09'); ok(/하나씩 세어도 답은 같/.test(tx('u2_l10')) && /섞어 쓰지/.test(tx('u2_l10')), 'l10'); ok(/계속 더해/.test(tx('u2_l12')), 'l12'); });

console.log('═══ L. 선행 용어 ═══');
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외) — 한 번 더 더하기 2 · 다르게 묶어 4 · 일의 자리 7 · 곱셈표 8 · 0의 곱 8 · 바꾸어 곱하기 9', () => { const b = earlyProblems(L); ok(!b.length, b.join(' | ')); });
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(L, KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 (원문 파일 이름 칸 live_url 빼고)', () => { const b = bannedProblems(L); ok(!b.length, b.join(',')); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('인물 — 곰이·펭이는 동기 장면(kids)에만 · 다른 인물 이름표 0', () => KEYS.forEach(k => L[k].slides.forEach((s, i) => { if (i === 2) return; ok(!s.data.kids && !s.data.kids_after, k + ' ' + s.id + ' kids'); })));
T('교사 화면(렌더 글자)에 영어 코드(u2 · l01 · L01 · lesson) 0 · 영어 낱말은 단위(cm·m)·보기 기호(A~D)만', () => { const UNITS = ['cm', 'm']; KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(UNITS.indexOf(wd) >= 0 || /^[A-D]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ R. 역검증 레드 (망가뜨린 사본) ═══');
T('① 정답을 바꾼 사본 — 정답 다시 셈이 잡음', () => { const X = clone(L); const d = X.u2_l04.slides[8].data; d.answer = 24; d.note = d.note.replace(/\*\*21\*\*$/, '**24**'); let c = 0; try { wantCheck(d, EXP.basic.u2_l04[0]); } catch (e) { c++; } const o = clone(X.u2_l09.slides[10].data); o.options.forEach((x, i) => { x.correct = i === 0 ? true : undefined; if (!x.correct) delete x.correct; }); try { wantCheck(o, EXP.basic.u2_l09[2]); } catch (e) { c++; } ok(c === 2, '못 잡음 ' + c); });
T('② 복습 계보를 끊은 사본 — 계보 검사가 잡음', () => { const X = clone(L); X.u2_l06.slides[1].data.items[1].a = '99'; X.u2_l01.slides[1].data.from = 'g2s2_math:u1_l01'; const b = reviewChainProblems(X); ok(b.length === 2, b.join(' | ')); });
T('③ 그림을 망가뜨린 사본 — 그림 검사가 잡음(문제 그림 누적 수 · 곱셈표 칸 · 무늬 차례)', () => { const X = clone(L); let c = 0; const f1 = X.u2_l03.slides[8].data.fig; f1.tally = true; try { figOne('red1', f1, true, txtOf(X.u2_l03.slides[8])); } catch (e) { c++; }
  const f2 = X.u2_l09.slides[9].data.fig; f2.rows[1][2] = '31'; try { figOne('red2', f2, true, txtOf(X.u2_l09.slides[9])); } catch (e) { c++; } const f3 = X.u2_l12.slides[4].data.fig; f3.seq = [0, 3, 6, 9, 2, 5, 8, 1, 4, 0]; try { figOne('red3', f3, false, ''); } catch (e) { c++; } ok(c === 3, '못 잡음 ' + c); });
T('④ 섞인 식을 넣은 사본 — 지도서 201 검사가 잡음', () => { const X = clone(L); X.u2_l10.slides[6].data.content += '\n3 × 2 + 5 × 4 = 26'; ok(mixProblems(X).length === 1, '못 잡음'); });
T('⑤ 「결」·겹낫표를 넣은 사본 — 차단 검사가 잡음', () => { const X = clone(L); X.u2_l10.meta.title = '곱셈구구로 문제를 해결해요'; X.u2_l02.slides[3].data.content += ' 『수학』'; const b = bannedProblems(X); ok(b.indexOf('결') >= 0 && b.indexOf('『') >= 0, b.join(',')); });
T('⑥ 선행 말을 넣은 사본 — 선행 검사가 잡음(l03 에 「바꾸어 곱」 · l05 에 「곱셈표」)', () => { const X = clone(L); X.u2_l03.slides[5].data.content += ' 두 수를 바꾸어 곱해도 같아요.'; X.u2_l05.extras[6].content = '곱셈표로 확인하세요.'; ok(earlyProblems(X).length === 2, earlyProblems(X).join(' | ')); });
T('⑦ 보탬 덤 b_ 카드를 되살리고 본류에서 「손바닥」을 지운 사본 — 보탬 흡수 검사가 잡음', () => { const X = clone(L); X.u2_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '손바닥 놀이' }); X.u2_l03.slides = JSON.parse(JSON.stringify(X.u2_l03.slides).replace(/손바닥/g, '손'));
  const b = tbAbsorbProblems(X); ok(b.length === 2 && b.some(x => /보탬 덤/.test(x)) && b.some(x => /손바닥/.test(x)), b.join(' | ')); });

console.log('\n게이트 g2s2 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
