/* gate_g2s2_math_u2.js — 2학년 2학기 수학 2단원 「곱셈구구」 케이티처 2세대 게이트 (139차, 베프). u1 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u1_l09 → u2_l01 → … → l12)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(물음 제목이 지시문·답과 어긋난 l04 한 곳은 생성기 QOVR) · 개념 글 줄 · 정리·예고·스스로 점검 줄 = 원문 · 정리 화살표 = 원문 목표(있을 때)
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈: 「식(×·+·−) 은/는 얼마일까요?」 · 「a×b는 a×c보다 얼마나 더 클까요?」 · 「… □ … 에서 □에 알맞은 수는?」(□ 좌·우, 0~9 에서 하나뿐)
     · 「a × b 은 c × □ 와 같아요. □에 …」 · 「a씩 b묶음은 모두 몇 개일까요?」 · 「곱셈표에서 r 이 적힌 줄과 c 가 적힌 칸이 만나는 곳의 수는?」 · 「a×b의 곱의 일의 자리 숫자는?」
     + 풀이 steps 안 식(×·+·− 섞인 「… = n」) 다시 셈 + 조사
   F 그림 — mgrp = 원문 묶음(문제 그림 누적 수 없음) · mdan = 원문 단 줄(빈칸·짚는 줄) · mjump = 원문 뛰기(문제 그림 도착 「?」) · marr = 원문 배열(나눔·빈 자리)
         · mring = 원문 무늬, 차례 = 단의 일의 자리 셈(문제 그림 빈 판) · 곱셈표 ngrid = 원문 표, 칸마다 줄×칸 · 점수판 ngrid 식 셈 · eqt = 원문 식, 식 셈
         · 빈칸 답(기본 문제) = 그림에서 다시 낸 값
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u2.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u2.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u2.json'), 'utf8'));
const FIX = (s) => s.replace(/해결해 볼까요/g, '풀어 볼까요').replace(/해결해요/g, '풀어요').replace(/해결할 수/g, '풀 수').replace(/해결했어요/g, '풀었어요').replace(/해결하여/g, '이용하여').replace(/연결 모형/g, '블록').replace(/결과는/g, '답은').replace(/결과도/g, '답도').replace(/결과가/g, '답이');
const QOVR = { '6×4는 6×3보다 얼마나 더 클까요?': '6×4는 얼마일까요?' };
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC); // 생성기와 같은 치환
const KEYS = Array.from({ length: 12 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── E 셈 ── 식: ×·+·− (×가 먼저) */
function evalExpr(e) { e = String(e).replace(/\s+/g, ''); ok(/^\d+([×+−-]\d+)*$/.test(e), '식 ' + e);
  const terms = e.split(/(?=[+−-])/); return terms.reduce((acc, t) => { const sg = /^[−-]/.test(t) ? -1 : 1; const v = t.replace(/^[+−-]/, '').split('×').reduce((a, b) => a * +b, 1); return acc + sg * v; }, 0); }
/* □ 하나 — 0~9 대입해 등식이 서는 값이 하나뿐 */
function boxSolve(lhs, rhs) { const sols = []; for (let x = 0; x <= 9; x++) { if (evalExpr(lhs.replace('□', x)) === evalExpr(rhs.replace('□', x))) sols.push(x); } ok(sols.length === 1, '□ 풀이 ' + lhs + ' = ' + rhs + ' → ' + sols); return String(sols[0]); }
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^(\d+)씩 (\d+)묶음은 모두 몇 개일까요\?$/))) return String(+m[1] * +m[2]);
  if ((m = q.match(/^([\d ×+−]+?) ?(?:은|는) 얼마일까요\?$/))) return String(evalExpr(m[1]));
  if ((m = q.match(/^(\d+)×(\d+)(?:은|는) (\d+)×(\d+)보다 얼마나 더 클까요\?$/))) { ok(m[1] === m[3] && +m[2] > +m[4], q + ' 꼴'); return String(+m[1] * +m[2] - +m[3] * +m[4]); }
  if ((m = q.match(/^([\d ×+−□]+) = ([\d ×+−□]+) 에서 □에 알맞은 수는\?$/))) return boxSolve(m[1], m[2]);
  if ((m = q.match(/^([\d ×+−]+) (?:은|는) ([\d ×+−□]+) (?:와|과) 같아요\. □에 알맞은 수는\?$/))) return boxSolve(m[1], m[2]);
  if ((m = q.match(/^곱셈표에서 (\d) (?:이|가) 적힌 줄과 (\d) (?:이|가) 적힌 칸이 만나는 곳의 수는\?$/))) return String(+m[1] * +m[2]);
  if ((m = q.match(/^(\d)×(\d)의 곱의 일의 자리 숫자는\?$/))) return String((+m[1] * +m[2]) % 10);
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 steps 안 식 — 「a op b (op …) = c」 */
function stepEq(s) { let n = 0; s = String(s);
  for (const m of s.matchAll(/(?<![\d×+−] ?)(\d+(?: [×+−] \d+)+) = (\d+)/g)) { ok(evalExpr(m[1]) === +m[2], '풀이 식 ' + m[0]); n++; }
  for (const m of s.matchAll(/(\d+) = (\d+(?: [×+−] \d+)+)/g)) { ok(evalExpr(m[2]) === +m[1], '풀이 식 ' + m[0]); n++; }
  return n; }
/* 뛰어 세기 풀이 「5, 10, 15, …」 = 단 차례 */
function stepSeq(lv) { lv.steps.forEach(x => { if (/^\d+(, \d+)+$/.test(x)) { const v = x.split(', ').map(Number), d = v[0]; ok(v.every((y, i) => y === d * (i + 1)), '뛰어 세기 풀이 ' + x); } }); }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const ringSeq = (d) => { const s = [0]; for (let k = 1; k <= 10; k++) { const u = (d * k) % 10; s.push(u); if (u === 0) break; } return s; };
const cellV = (c) => (c && typeof c === 'object' ? (c.q ? '?' : c.v) : String(c));
const COUNT = /모두 몇|몇 개일까요|몇 마리|몇 대|인형은\?|몇 cm/;
/* 그림 하나 점검 — 문제 그림이면 구할 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, txt) {
  if (f.k === 'mgrp') { ok(srcFigs.some(x => x.k === 'grp' && x.per === f.per && x.n === f.n && !!x.new === !!f.new && (x.emoji || '') === (f.emoji || '')), at + ' 원문 묶음 ' + f.per + '×' + f.n);
    if (prob) ok(!f.tally, at + ' 문제 그림 누적 수'); const d = htmlOf(f); ok(d.querySelector('svg').getAttribute('data-grp') === f.per + '|' + f.n, at + ' 렌더');
    return prob && COUNT.test(txt) ? [String(f.per * f.n)] : []; }
  if (f.k === 'mdan') { ok(srcFigs.some(x => x.k === 'dan' && x.dan === f.dan && x.from === f.from && x.to === f.to && JSON.stringify(x.q) === JSON.stringify(f.q || []) && JSON.stringify(x.hi) === JSON.stringify(f.hi || [])), at + ' 원문 단 줄');
    const d = htmlOf(f), tx = d.body.textContent.replace(/\s/g, ''); (f.q || []).forEach(k => ok(tx.indexOf(String(f.dan * k)) < 0 || f.dan * k === f.dan * (k - 1) + f.dan && !new RegExp('=' + f.dan * k + '(?!\\d)').test(tx), at + ' 빈칸 답이 그려짐 ' + f.dan * k));
    return prob && (f.q || []).length === 1 ? [String(f.dan * f.q[0])] : []; }
  if (f.k === 'mjump') { ok(srcFigs.some(x => x.k === 'mj' && x.step === f.step && x.n === f.n), at + ' 원문 뛰기'); ok(!!f.q === !!prob, at + ' 문제 그림 도착 「?」');
    if (prob) ok(htmlOf(f).body.textContent.indexOf(String(f.step * f.n)) < 0, at + ' 도착 수가 그려짐');
    return prob && !/더 가야/.test(txt) ? [String(f.step * f.n)] : []; }
  if (f.k === 'marr') { ok(srcFigs.some(x => x.k === 'arr' && x.r === f.r && x.c === f.c && JSON.stringify(x.rs) === JSON.stringify(f.rs || []) && JSON.stringify(x.cs) === JSON.stringify(f.cs || []) && JSON.stringify(x.miss) === JSON.stringify(f.miss || []) && (x.emoji || '') === (f.emoji || '')), at + ' 원문 배열');
    if (f.rs) ok(f.rs.reduce((a, b) => a + b, 0) === f.r, at + ' 줄 나눔 합'); if (f.cs) ok(f.cs.reduce((a, b) => a + b, 0) === f.c, at + ' 칸 나눔 합');
    ok(htmlOf(f).querySelector('svg').getAttribute('data-arr') === f.r + '|' + f.c + '|' + (f.miss || []).length, at + ' 렌더');
    return prob && COUNT.test(txt) ? [String(f.r * f.c - (f.miss || []).length)] : []; }
  if (f.k === 'mring') { const sf = srcFigs.find(x => x.k === 'ring' && x.dan === f.dan && JSON.stringify(x.seq) === JSON.stringify(f.seq)); ok(sf, at + ' 원문 무늬 ' + f.dan);
    if (f.seq.length) ok(JSON.stringify(f.seq) === JSON.stringify(ringSeq(f.dan)), at + ' 무늬 차례 셈 ' + f.seq); ok(!!f.hide === !f.seq.length, at + ' 빈 판');
    if (prob) ok(f.hide, at + ' 문제 그림 무늬가 그려짐');
    return prob ? [ringSeq(f.dan).join(' → ')] : []; }
  if (f.k === 'ngrid') { const rows = f.rows.map(r => r.map(cellV));
    if (rows[0][0] === '×') { const cols = rows[0].slice(1); let want = [];
      ok(srcFigs.some(x => x.k === 'mt' && JSON.stringify(x.cols) === JSON.stringify(cols) && JSON.stringify(x.rows) === JSON.stringify(rows.slice(1).map(r => r[0]))), at + ' 원문 곱셈표');
      const sfms = srcFigs.filter(x => x.k === 'mt' && JSON.stringify(x.cols) === JSON.stringify(cols) && JSON.stringify(x.rows) === JSON.stringify(rows.slice(1).map(r => r[0])));
      const sfm = sfms.find(x => !x.cells || JSON.stringify(x.cells) === JSON.stringify(rows.slice(1).map(r => r.slice(1)))) || sfms[0] || {}; // 같은 머리 표가 여럿이면 칸 값까지 같은 것
      f.rows.slice(1).forEach((r, i) => r.slice(1).forEach((c, j) => { const hl = c && typeof c === 'object' ? c.hl : ''; // 139차: 접는 칸 = 원문 fold 이고 대각선(줄=칸), 표시 칸 = 원문 mark
        ok((hl === 'fold') === !!(sfm.fold && sfm.fold[i][j]), at + ' 접는 칸 원문 ' + rows[i + 1][0] + '×' + cols[j]);
        if (hl === 'fold') ok(rows[i + 1][0] === cols[j], at + ' 접는 칸 대각선 아님 ' + rows[i + 1][0] + '×' + cols[j]);
        ok((hl === 'mark') === !!(sfm.mark && sfm.mark[i][j]), at + ' 표시 칸 원문 ' + rows[i + 1][0] + '×' + cols[j]); }));
      if (/초록 칸|점선/.test(txt)) ok(f.rows.some(r => r.some(c => c && c.hl === 'fold')), at + ' 「초록 칸(점선)」인데 접는 칸 없음');
      rows.slice(1).forEach(r => r.slice(1).forEach((v, j) => { const p = +r[0] * +cols[j]; if (v === '?') want.push(String(p)); else if (!/^\d+$/.test(v)) { /* ★·♥ 같은 표시 칸 */ } else ok(+v === p, at + ' 곱셈표 ' + r[0] + '×' + cols[j] + ' = ' + v); }));
      if (/★/.test(txt)) want = want.filter((x, i, a) => a.indexOf(x) === i).slice(0, 1).concat([]);
      const star = []; rows.slice(1).forEach(r => r.slice(1).forEach((v, j) => { if (v === '★') star.push(String(+r[0] * +cols[j])); }));
      return prob ? (/★/.test(txt) ? star : (want.length === 1 ? want : [])) : []; }
    if (rows.length === 3 && rows[2].slice(1).every(v => /^\d+ × \d+ = \d+$/.test(v))) { // 점수판
      ok(srcFigs.some(x => x.k === 'score' && JSON.stringify(x.nums) === JSON.stringify(rows[0].slice(1)) && JSON.stringify(x.eqs) === JSON.stringify(rows[2].slice(1))), at + ' 원문 점수판');
      let t = 0; rows[2].slice(1).forEach((v, j) => { const [, a, b, c] = v.match(/^(\d+) × (\d+) = (\d+)$/); ok(+a * +b === +c, at + ' 점수 식 ' + v); t += +c; });
      return prob && /모두 몇 점/.test(txt) ? [String(t)] : []; }
    if (!prob && rows.every(r => r.length === 2 && /=/.test(r[1]))) { // 개념 장 식 표(생성기 덮어쓰기) — 식마다 셈
      rows.forEach(r => r[1].split(' · ').forEach(e => { const v = e.split(' = ').map(evalExpr); ok(v.length > 1 && v.every(x => x === v[0]), at + ' 식 표 ' + e); })); return []; }
    if (!prob && rows.every(r => r.length === 2 && /^\d+(, \d+)*$/.test(r[1]))) { // 조건 거르기 표 — 줄마다 앞 줄에서 조건대로 남김
      let prev = null; rows.forEach(r => { const v = r[1].split(', ').map(Number), c = r[0]; let m, cond;
        if ((m = c.match(/^(\d)단$/))) cond = (x) => x % +m[1] === 0 && x / +m[1] >= 1 && x / +m[1] <= 9; else if (c === '홀수') cond = (x) => x % 2 === 1; else if (c === '짝수') cond = (x) => x % 2 === 0;
        else if ((m = c.match(/^(\d+)보다 (큰|작은) 수$/))) cond = (x) => (m[2] === '큰' ? x > +m[1] : x < +m[1]); else ok(0, at + ' 모르는 조건 ' + c);
        const base = prev || Array.from({ length: 90 }, (_, i) => i + 1); ok(JSON.stringify(base.filter(cond)) === JSON.stringify(v), at + ' 조건 ' + c + ' → ' + v); prev = v; }); return []; }
    if (rows.length === 1) { ok(srcFigs.some(x => x.k === 'numline' && JSON.stringify(x.items.map(i => i.v)) === JSON.stringify(rows[0])), at + ' 원문 수 줄'); return []; }
    ok(0, at + ' 모르는 표'); return []; }
  if (f.k === 'eqt') { const want = []; f.rows.forEach(r => { const t = r.toks.map(String);
      ok(srcFigs.some(x => (x.k === 'eqt' && JSON.stringify(x.toks) === JSON.stringify(t)) || (x.k === 'steps' && x.rows.some(y => JSON.stringify(y.toks) === JSON.stringify(t)))), at + ' 원문 식 ' + t.join(' '));
      const eqs = t.map((y, i) => y === '=' ? i : -1).filter(i => i >= 0); const qs = t.filter(y => y === '?').length;
      if (eqs.length && t.every(y => /^(\d+|[×+−=?])$/.test(y))) { const parts = []; let cur = []; t.forEach(y => { if (y === '=') { parts.push(cur); cur = []; } else cur.push(y); }); parts.push(cur);
        if (!qs) { const v = parts.map(p => evalExpr(p.join(''))); ok(v.every(x => x === v[0]), at + ' 식 ' + t.join(' ')); }
        else if (qs === 1 && parts.length === 2 && parts[1].join('') === '?') want.push(String(evalExpr(parts[0].join('')))); }
      if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); }); return prob ? want : []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && JSON.stringify(x.items) === JSON.stringify(f.items)), at + ' 원문 물건 카드'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length) return 0; const A = (d.options ? d.options.find(o => o.correct).text : String(d.answer)).replace(/\*\*/g, '').trim();
  ok(want.every(x => x === want[0]), at + ' 그림끼리 값이 다름 ' + want);
  if (/→/.test(want[0])) { ok(nsp(A) === nsp(want[0]), at + ' 답 「' + A + '」 ≠ 무늬 ' + want[0]); return 1; }
  if (!/^\d+\s*[가-힣]{0,2}$/.test(A)) return 0;
  ok(A.replace(/[^\d]/g, '') === want[0], at + ' 답 「' + A + '」 ≠ 셈 ' + want[0]); return 1;
}

T('A 로드 12차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 12); });
let holeChecked = 0, eChecked = 0, stepChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 2 && les.meta.n === i + 1 && les.meta.unit_title === '곱셈구구'); ok(/^\[2수01-10\] .* · \[2수01-11\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u1_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u1_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 11) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/길이/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(JSON.stringify(sl[16].data.arrows) === JSON.stringify(src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); n += c; }); Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); n += c; stepChecked += stepEq(lv.steps.join(' | ')); stepSeq(lv); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); eChecked += n; });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => { const prob = j >= 8 && j <= 10, tx = prob ? (s.data.scenario.body + ' ' + s.data.question + ' ') : ''; figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + (j >= 3 && j <= 6 ? ' 개념' : '') + ' ' + f.k, prob, tx)); }); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, tx = d.scenario.body + ' ' + d.question + ' ';
    const want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true, tx)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '곱셈구구', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '곱셈구구', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); ok(s.data.fig, 'concept s' + (j + 4) + ' 그림 없음'); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '곱셈구구', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 풀이 식 ' + stepChecked); ok(eChecked === 72, '셈 ' + eChecked); });
T('F 빈칸 답 대조한 문제 수', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked >= 12, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u2.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('4씩 3묶음은 모두 몇 개일까요?') === '12' && solve('6 × 3 − 1 은 얼마일까요?') === '17' && solve('3 × 5 + 2 × 4 는 얼마일까요?') === '23', '곱·섞인 식');
  ok(solve('2×6은 2×5보다 얼마나 더 클까요?') === '2' && solve('5 × □ = 30 에서 □에 알맞은 수는?') === '6' && solve('7 × 4 = 4 × □ 에서 □에 알맞은 수는?') === '7' && solve('8 × 3 은 4 × □ 와 같아요. □에 알맞은 수는?') === '6', '차·□');
  ok(solve('곱셈표에서 8 이 적힌 줄과 7 이 적힌 칸이 만나는 곳의 수는?') === '56' && solve('7×7의 곱의 일의 자리 숫자는?') === '9' && ringSeq(6).join(',') === '0,6,2,8,4,0' && ringSeq(5).join(',') === '0,5,0', '곱셈표·일의 자리·무늬'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('6 × 3 − 1 은 얼마일까요?', '19'); } catch (_) { e++; }
  try { check('8×6은 8×5보다 얼마나 더 클까요?', '6'); } catch (_) { e++; }
  try { check('2 × □ = 18 에서 □에 알맞은 수는?', '8'); } catch (_) { e++; }
  try { check('곱셈표에서 3 이 적힌 줄과 6 이 적힌 칸이 만나는 곳의 수는?', '16'); } catch (_) { e++; }
  try { stepEq('7 × 3 = 24'); } catch (_) { e++; }
  try { stepSeq({ steps: ['5, 10, 16, 20'] }); } catch (_) { e++; }
  try { boxSolve('0 × □', '0'); } catch (_) { e++; } // 답이 여럿
  ok(e === 7, '틀린 답 못 잡음 ' + e);
  ok(josa('4 가').length === 0 && josa('4 이').length === 1 && josa('3 이').length === 0 && josa('2×6는').length === 1, '조사 역검증');
  let c = 0;
  try { figCheck({ k: 'mgrp', per: 4, n: 3, tally: true }, [{ k: 'grp', per: 4, n: 3 }], 'x', true, ''); } catch (_) { c++; }
  try { figCheck({ k: 'mjump', step: 7, n: 4 }, [{ k: 'mj', step: 7, n: 4 }], 'x', true, ''); } catch (_) { c++; }
  try { figCheck({ k: 'mring', dan: 2, seq: [0, 2, 4, 6, 8, 0] }, [{ k: 'ring', dan: 2, seq: [0, 2, 4, 6, 8, 0] }], 'x', true, ''); } catch (_) { c++; }
  try { figCheck({ k: 'ngrid', head: true, rows: [['×', '3', '4'], ['2', '6', '9']] }, [{ k: 'mt', rows: ['2'], cols: ['3', '4'] }], 'x', false, ''); } catch (_) { c++; }
  try { figCheck({ k: 'eqt', rows: [{ toks: ['6', '×', '3', '=', '19'] }] }, [{ k: 'eqt', toks: ['6', '×', '3', '=', '19'] }], 'x', false, ''); } catch (_) { c++; }
  try { figCheck({ k: 'ngrid', head: true, rows: [['×', '2', '3'], ['2', '4', { v: '6', hl: 'fold' }]] }, [{ k: 'mt', rows: ['2'], cols: ['2', '3'], fold: [[false, true]] }], 'x', false, ''); } catch (_) { c++; } // 대각선 아닌 접는 칸
  try { figCheck({ k: 'ngrid', head: true, rows: [['×', '2', '3'], ['2', '4', '6']] }, [{ k: 'mt', rows: ['2'], cols: ['2', '3'], fold: [[true, false]] }], 'x', false, '초록 칸(점선)을 따라 접으면?'); } catch (_) { c++; } // 접는 칸 빠짐
  ok(c === 7, '그림 역검증 ' + c); });
console.log('gate_g2s2_math_u2: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
