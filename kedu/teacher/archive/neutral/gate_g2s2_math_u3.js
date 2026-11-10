/* gate_g2s2_math_u3.js — 2학년 2학기 수학 3단원 「길이 재기」 케이티처 2세대 게이트 (142차, 베프). u2 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u2_l12 → u3_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(「몇/얼마」 덧붙인 두 곳은 생성기 QOVR) · 두 칸 답(two) = 원문 a 두 칸 · 개념 글 줄 · 정리·예고·스스로 점검 줄 = 원문 · 정리 화살표 = 원문 목표(있을 때)
   E 재계산 — 출구·수준별·기본 문제 물음을 게이트가 다시 셈(길이는 cm 로 바꾸어): 「L는 몇 m 몇 cm / 몇 cm / 몇 m일까요?」 · 「L ± L (± L) 는 얼마일까요?」(받아올림·받아내림 없음)
     · 「N cm는 1 cm로 몇 번일까요?」 · 「1 m가 약 a걸음(뼘)이면 약 b m는 약 몇 걸음(뼘)일까요?」 · 「1 m를 N번 이은 길이는 몇 m일까요?」 · 「약 a m 간격이 b개면 약 몇 m일까요?」 · 「약 a m, 약 b m, … 를 모두 더하면 약 몇 m일까요?」
     + 풀이 steps 안 등식(길이·수 섞임 「… = …」) 다시 셈 + 수 뒤 조사
   F 그림 — lbar = 원문 막대(이어 붙인 줄 = 원문 pair, 전체 글 = 부분 합 · 막대 글 = 막대 길이 · 잘라 낸 칸 ≤ 막대) · ltape = 원문 자(끝 눈금 강조 = len, 문제 그림엔 없음 · 곧은자 s1−s0 = len)
         · tvert = 원문 세로셈(부품이 셈한 답 = 원문 r, 빈칸 = 원문 「?」) · eqt = 원문 식(길이 식 셈) · lpw 전체 = 부분 합 · lch 모두 = 부분 합 · lcard·ngrid 표·objs1 = 원문
         · 빈칸 답(기본 문제) = 그림에서 다시 낸 값
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u3.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u3.json'), 'utf8'));
const FIX = (s) => s.replace(/해결해 볼까요/g, '풀어 볼까요').replace(/해결해요/g, '풀어요').replace(/해결할 수/g, '풀 수').replace(/해결했어요/g, '풀었어요');
const QOVR = { '자로 잰 두 물건의 길이를 차례로 쓰세요': '자로 잰 연필과 클립의 길이는 각각 몇 cm일까요?', '바다거북과 돌고래의 몸길이의 합은?': '바다거북과 돌고래의 몸길이의 합은 얼마일까요?' };
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC);
const KEYS = Array.from({ length: 9 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 길이 ── 「a m b cm」·「a m」·「b cm」 → cm(약 떼고) · cm → 글 */
function len(s) { s = String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').replace(/^약 /, '').trim(); let m;
  if ((m = s.match(/^(\d+) m (\d+) cm$/))) return +m[1] * 100 + +m[2]; if ((m = s.match(/^(\d+) m$/))) return +m[1] * 100; if ((m = s.match(/^(\d+) cm$/))) return +m[1]; return null; }
const fmt = (c) => (c % 100 ? (c >= 100 ? Math.floor(c / 100) + ' m ' + (c % 100) + ' cm' : c + ' cm') : c / 100 + ' m');
/* 길이 식 「L + L − L」 — 항마다 m·cm 따로(받아올림·받아내림이 없어야 2-2 범위) */
function lenExpr(e) { const terms = String(e).trim().split(/ (?=[+−] )/); let mm = 0, cc = 0, allCm = true;
  terms.forEach((t, i) => { let sg = 1; if (i) { sg = t[0] === '−' ? -1 : 1; t = t.slice(2); } const v = len(t); ok(v != null, '길이 항 ' + t); if (/ m/.test(' ' + t) && / m( |$)/.test(t)) allCm = false;
    const m = /(\d+) m/.test(t) ? +t.match(/(\d+) m/)[1] : 0, c = /(\d+) cm/.test(t) ? +t.match(/(\d+) cm/)[1] : 0; mm += sg * m; cc += sg * c; });
  if (!allCm) ok(cc >= 0 && cc < 100 && mm >= 0, '받아올림·받아내림 ' + e); return { cm: mm * 100 + cc, allCm }; }
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^(.+?)는 몇 m 몇 cm일까요\?$/))) { const v = len(m[1]); ok(v != null && v % 100, q); return fmt(v); }
  if ((m = q.match(/^(.+?)는 몇 cm일까요\?$/)) && len(m[1]) != null) return len(m[1]) + ' cm';
  if ((m = q.match(/^(.+?)는 몇 m일까요\?$/)) && len(m[1]) != null) { const v = len(m[1]); ok(v % 100 === 0, q); return v / 100 + ' m'; }
  if ((m = q.match(/^(.+[+−].+?)는 얼마일까요\?$/))) { const r = lenExpr(m[1]); return r.allCm ? r.cm + ' cm' : fmt(r.cm); }
  if ((m = q.match(/^(\d+) cm는 1 cm로 몇 번일까요\?$/))) return m[1] + '번';
  if ((m = q.match(/^1 m가 약 (\d+)(걸음|뼘)이면 약 (\d+) m는 약 몇 \2일까요\?$/))) return '약 ' + (+m[1] * +m[3]) + m[2];
  if ((m = q.match(/^1 m를 (\d+)번 이은 길이는 몇 m일까요\?$/))) return m[1] + ' m';
  if ((m = q.match(/^약 (\d+) m 간격이 (\d+)개면 약 몇 m일까요\?$/))) return '약 ' + (+m[1] * +m[2]) + ' m';
  if ((m = q.match(/^(약 \d+ m(?:, 약 \d+ m)+)를 모두 더하면 약 몇 m일까요\?$/))) return '약 ' + m[1].split(', ').reduce((a, x) => a + len(x), 0) / 100 + ' m';
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 등식 — 「…  = …」 양쪽이 길이 식이거나 수 식이면 같아야 */
function numExpr(e) { e = String(e).replace(/\s+/g, ''); if (!/^\d+([×+−]\d+)*$/.test(e)) return null; return e.split(/(?=[+−])/).reduce((acc, t) => { const sg = t[0] === '−' ? -1 : 1; return acc + sg * t.replace(/^[+−]/, '').split('×').reduce((a, b) => a * +b, 1); }, 0); }
function sideVal(s) { s = s.trim(); const n = numExpr(s); if (n != null) return { k: 'n', v: n }; try { return { k: 'l', v: lenExpr(s).cm }; } catch (_) { return null; } }
function stepEq(s) { let n = 0; String(s).split(' | ').forEach(st => { const sides = st.split(' = '); if (sides.length < 2) return; const v = sides.map(sideVal); if (v.some(x => !x)) return;
  ok(v.every(x => x.k === v[0].k && x.v === v[0].v), '풀이 식 ' + st); n++; }); return n; }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rowOf = (x) => x.join ? { join: true, segs: x.bars.map((b, i) => ({ cm: b.cm, col: b.col, lb: (x.pair || [])[i] || '' })), lb: x.lb } : { cm: x.bars[0].cm, col: x.bars[0].col, lb: x.lb, name: x.name || undefined, cut: x.bars[0].cut || undefined, m100: x.bars[0].m100 || undefined };
const strip = (o) => JSON.parse(JSON.stringify(o));
/* 그림 하나 점검 — 문제 그림이면 구할 값(cm·수, 있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, txt) {
  if (f.k === 'lbar') { const want = [];
    f.rows.forEach(r => { ok(srcFigs.some(x => x.k === 'mbar' && same(strip(rowOf(x)), strip(r))), at + ' 원문 막대 ' + JSON.stringify(r));
      const tot = r.join ? r.segs.reduce((a, g) => a + g.cm, 0) : r.cm;
      if (r.join) r.segs.forEach(g => { if (len(g.lb) != null) ok(len(g.lb) === g.cm, at + ' 부분 글 ' + g.lb); });
      if (r.lb === '?') want.push(tot); else if (len(r.lb) != null && !r.cut) ok(len(r.lb) === tot, at + ' 막대 글 ' + r.lb + ' ≠ ' + tot);
      if (r.cut) { ok(r.cut < r.cm, at + ' 잘라 낸 칸'); if (len(r.lb) != null) ok(len(r.lb) === r.cm, at + ' 막대 글 ' + r.lb); } });
    ok(f.max === Math.max(...f.rows.map(r => (r.join ? r.segs.reduce((a, g) => a + g.cm, 0) : r.cm))), at + ' 공통 눈금');
    ok(htmlOf(f).querySelector('svg[data-bars]'), at + ' 렌더');
    if (!prob || want.length !== 1) return [];
    if (/번/.test(txt)) { const ref = f.rows.find(r => r.lb === '1 m'); return ref ? [{ n: want[0] / 100 }] : []; }
    return [{ cm: want[0] }]; }
  if (f.k === 'ltape') { ok(srcFigs.some(x => x.k === 'rul' && x.name === f.name && x.len === f.len && same(x.ticks, f.ticks) && !!x.brk === !!f.brk && !!x.shift === !!f.shift), at + ' 원문 자 ' + f.name);
    if (f.on != null) ok(f.on === f.len, at + ' 끝 눈금 강조 ≠ 길이'); if (prob) ok(f.on == null, at + ' 문제 그림 끝 눈금 강조');
    if (!f.brk) ok(f.s1 - f.s0 === f.len || f.s0, at + ' 곧은자 s1−s0');
    ok(f.ticks.indexOf(f.len) >= 0, at + ' 끝 눈금이 자에 없음'); ok(htmlOf(f).querySelector('svg[data-rul]'), at + ' 렌더');
    return prob && f.ticks[0] === 0 && !(f.s0) && !f.shift ? [{ cm: f.len }] : []; }
  if (f.k === 'tvert') { const qOf = (x) => x.r.map((v, i) => (v === '?' ? i : -1)).filter(i => i >= 0); const cand = srcFigs.filter(x => x.k === 'mc' && same(x.a, f.a) && same(x.b, f.b) && (x.op === '-' ? '−' : '+') === f.op); const sf = cand.find(x => same(qOf(x), f.q || [])) || cand[0]; ok(sf, at + ' 원문 세로셈');
    const R = htmlOf(f).querySelector('.fig-tvert').getAttribute('data-r').split(',').map(Number);
    ok(R[1] < 100 && R[1] >= 0, at + ' 받아올림·받아내림'); sf.r.forEach((v, i) => { if (v !== '?') ok(+v === R[i], at + ' 세로셈 답 ' + v + ' ≠ ' + R[i]); });
    const q = sf.r.map((v, i) => (v === '?' ? i : -1)).filter(i => i >= 0); ok(same(q, f.q || []), at + ' 빈칸 자리');
    const d = htmlOf(f); if (q.length) ok(d.querySelectorAll('.tv-q').length === q.length, at + ' 빈칸 「?」 렌더');
    return prob && q.length === 1 ? [q[0] === 0 ? { cm: R[0] * 100, part: 'm' } : { cm: R[1], part: 'cm' }] : []; }
  if (f.k === 'eqt') { const want = []; f.rows.forEach(r => { const t0 = r.toks.map(String), t = t0.map(x => x.replace(/^-$/, '−'));
      const inSrc = srcFigs.some(x => (x.k === 'eqt' && same(x.toks, t0)) || (x.k === 'steps' && x.rows.some(y => same(y.toks, t0))));
      const mr = srcFigs.find(x => x.k === 'mr' && t[0] === String(x.a[0]) && t[2] === String(x.a[1]) && t[5] === String(x.b[0]) && t[7] === String(x.b[1]) && t[4] === (x.op === '-' ? '−' : '+'));
      ok(inSrc || mr, at + ' 원문 식 ' + t.join(' '));
      const sides = t.join(' ').replace(/\s+/g, ' ').split(' = ');
      const toLen = (s) => s.replace(/(\d+) m (\d+) cm/g, '$1 m $2 cm').trim();
      if (sides.indexOf('?') >= 0) { ok(sides.length === 2 && sides[1] === '?', at + ' 빈칸 식'); want.push({ cm: lenExpr(toLen(sides[0])).cm }); }
      else { const v = sides.map(s => lenExpr(toLen(s)).cm); ok(v.every(x => x === v[0]), at + ' 식 ' + t.join(' ')); }
      if (mr && mr.r !== '?') ok(lenExpr(toLen(sides[1])).cm === mr.r[0] * 100 + mr.r[1], at + ' 원문 식 답');
      if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); }); return prob ? want : []; }
  if (f.k === 'lpw') { ok(srcFigs.some(x => x.k === 'pw' && x.t === f.t && x.a === f.a && x.b === f.b && same(x.cm, f.cm)), at + ' 원문 가지');
    ok(f.cm[0] === f.cm[1] + f.cm[2], at + ' 전체 = 부분 합'); [[f.t, f.cm[0]], [f.a, f.cm[1]], [f.b, f.cm[2]]].forEach(([s, c]) => { if (s !== '?') ok(len(s) === c, at + ' 가지 글 ' + s); });
    return prob && f.t === '?' ? [{ cm: f.cm[0] }] : []; }
  if (f.k === 'lch') { ok(srcFigs.some(x => x.k === 'ch' && same(x.segs, f.segs) && same(x.cm, f.cm) && x.tot === f.tot), at + ' 원문 나누어 어림');
    const sum = f.segs.reduce((a, g) => a + len(g.lab), 0); f.segs.forEach((g, i) => ok(len(g.lab) === f.cm[i], at + ' 부분 ' + g.lab)); if (f.tot !== '?') ok(len(f.tot) === sum, at + ' 모두 ' + f.tot + ' ≠ ' + sum);
    return prob && f.tot === '?' && !/학생|사이/.test(txt) ? [{ cm: sum }] : []; }
  if (f.k === 'lcard') { ok(srcFigs.some(x => (x.k === 'body' || x.k === 'uc') && same(x.items, f.items)), at + ' 원문 카드'); return []; }
  if (f.k === 'ngrid') { ok(srcFigs.some(x => x.k === 'est' && same([x.heads].concat(x.rows.map(r => r.map(v => (v === '?' ? { q: true } : v)))), f.rows)), at + ' 원문 표'); return []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && same(x.items, f.items)), at + ' 원문 물건 카드'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length || d.options) return 0;
  const A = d.input ? String(d.answer) + (d.unit ? ' ' + d.unit : '') : String(d.answer);
  if (want[0].n != null) { ok(+d.answer === want[0].n, at + ' 답 ' + A + ' ≠ ' + want[0].n); return 1; }
  if (want.length > 1) { const as = A.split(', ').map(len); ok(same(as, want.map(x => x.cm)), at + ' 답 ' + A + ' ≠ ' + want.map(x => x.cm)); return 1; }
  const w0 = want[0]; if (w0.part === 'm') { ok(len(A) === w0.cm, at + ' m 칸 ' + A); return 1; } if (w0.part === 'cm') { ok(len(A) === w0.cm, at + ' cm 칸 ' + A); return 1; }
  ok(len(A) === w0.cm, at + ' 답 「' + A + '」 ≠ ' + fmt(w0.cm)); return 1;
}

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 9); });
let holeChecked = 0, eChecked = 0, stepChecked = 0, basicSolved = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 3 && les.meta.n === i + 1 && les.meta.unit_title === '길이 재기'); ok(/^\[2수03-11\] .* · \[2수03-12\] .* · \[2수03-13\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u2_l12.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u2_l12' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data;
    const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : p.part === 'two' ? len(String(d.answer).split(', ')[0]) != null : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question);
    if (p.part === 'two') { ok(d.input === undefined, '두 칸 답에 input'); const exp = p.unit === 'cm' ? p.a.map(x => x + ' cm').join(', ') : fmt(+p.a[0] * 100 + +p.a[1]); ok(d.answer === exp, '두 칸 답 ' + d.answer + ' ≠ ' + exp); ok(/몇|얼마/.test(d.question), '두 칸 물음에 「몇/얼마」 없음 ' + d.question); }
    else if (!d.options) ok(d.unit === (p.unit || undefined), '단위 ' + d.unit);
    ok(['pad', 'mcq', 'two'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 8) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/시각/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); n += c; }); Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); n += c; stepChecked += stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); eChecked += n; });
  T(k + ' E 기본 문제 재계산', () => { sl.slice(8, 11).forEach(s => { const d = s.data; if (d.options) return; const A = d.input ? d.answer + (d.unit ? ' ' + d.unit : '') : d.answer; basicSolved += check(d.question, A); }); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.context, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => { const prob = j >= 8 && j <= 10, tx = prob ? (s.data.scenario.body + ' ' + s.data.question + ' ') : ''; figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + (j >= 3 && j <= 6 ? ' 개념' : '') + ' ' + f.k, prob, tx)); }); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, tx = d.scenario.body + ' ' + d.question + ' ';
    const want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true, tx)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '길이 재기', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '길이 재기', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); ok(s.data.fig, 'concept s' + (j + 4) + ' 그림 없음'); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '길이 재기', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 기본 문제 ' + basicSolved + ' · 풀이 식 ' + stepChecked); ok(eChecked === 54, '셈 ' + eChecked); ok(basicSolved === 8, '기본 ' + basicSolved); });
T('F 빈칸 답 대조한 문제 수', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked === 18, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u3.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('135 cm는 몇 m 몇 cm일까요?') === '1 m 35 cm' && solve('4 m 7 cm는 몇 cm일까요?') === '407 cm' && solve('300 cm는 몇 m일까요?') === '3 m', '바꾸기');
  ok(solve('2 m 10 cm + 1 m 50 cm는 얼마일까요?') === '3 m 60 cm' && solve('4 m 30 cm − 1 m 30 cm는 얼마일까요?') === '3 m' && solve('8 cm + 5 cm는 얼마일까요?') === '13 cm', '합·차');
  ok(solve('1 m가 약 7뼘이면 약 2 m는 약 몇 뼘일까요?') === '약 14뼘' && solve('약 10 m, 약 5 m, 약 10 m를 모두 더하면 약 몇 m일까요?') === '약 25 m' && solve('약 3 m 간격이 6개면 약 몇 m일까요?') === '약 18 m', '어림'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('2 m 30 cm + 1 m 40 cm는 얼마일까요?', '3 m 7 cm'); } catch (_) { e++; }
  try { check('5 m 64 cm − 3 m 22 cm는 얼마일까요?', '8 m 86 cm'); } catch (_) { e++; }
  try { check('120 cm는 몇 m 몇 cm일까요?', '12 m'); } catch (_) { e++; }
  try { check('3 m 52 cm는 몇 cm일까요?', '55 cm'); } catch (_) { e++; }
  try { check('1 m 80 cm + 1 m 30 cm는 얼마일까요?', '3 m 10 cm'); } catch (_) { e++; } // 받아올림 — 범위 밖
  try { stepEq('70 cm + 20 cm = 80 cm'); } catch (_) { e++; }
  try { stepEq('3 × 6 = 16'); } catch (_) { e++; }
  ok(e === 7, '틀린 답 못 잡음 ' + e);
  ok(josa('4 가').length === 0 && josa('4 이').length === 1 && josa('3 이').length === 0, '조사 역검증');
  let c = 0;
  try { figCheck({ k: 'lbar', rows: [{ join: true, segs: [{ cm: 170, col: 'a', lb: '1 m 70 cm' }, { cm: 120, col: 'b', lb: '1 m 20 cm' }], lb: '2 m 80 cm' }], max: 290 }, [{ k: 'mbar', name: '', bars: [{ cm: 170, col: 'a' }, { cm: 120, col: 'b' }], lb: '2 m 80 cm', join: true, pair: ['1 m 70 cm', '1 m 20 cm'] }], 'x', false, ''); } catch (_) { c++; } // 합이 틀린 전체 글
  try { figCheck({ k: 'ltape', name: '책장', len: 130, ticks: [0, 127, 128, 129, 130, 131], brk: true, on: 130 }, [{ k: 'rul', name: '책장', len: 130, ticks: [0, 127, 128, 129, 130, 131], brk: true }], 'x', true, ''); } catch (_) { c++; } // 문제 그림 끝 눈금 강조
  try { figCheck({ k: 'tvert', units: ['m', 'cm'], base: 100, a: [2, 30], b: [1, 40], op: '+' }, [{ k: 'mc', a: [2, 30], op: '+', b: [1, 40], r: [3, 7] }], 'x', false, ''); } catch (_) { c++; } // 원문 답과 다름
  try { figCheck({ k: 'lpw', t: '130 cm', a: '1 m', b: '20 cm', cm: [130, 100, 20] }, [{ k: 'pw', t: '130 cm', a: '1 m', b: '20 cm', cm: [130, 100, 20] }], 'x', false, ''); } catch (_) { c++; } // 전체 ≠ 부분 합
  try { figCheck({ k: 'lch', segs: [{ name: '①', lab: '약 2 m' }, { name: '②', lab: '약 2 m' }], cm: [200, 200], tot: '약 5 m' }, [{ k: 'ch', segs: [{ name: '①', lab: '약 2 m' }, { name: '②', lab: '약 2 m' }], cm: [200, 200], tot: '약 5 m' }], 'x', false, ''); } catch (_) { c++; }
  try { figCheck({ k: 'eqt', rows: [{ toks: ['1', 'm', '70', 'cm', '+', '1', 'm', '20', 'cm', '=', '2', 'm', '80', 'cm'], hi: [], q: [] }] }, [{ k: 'mr', a: [1, 70], op: '+', b: [1, 20], r: [2, 80] }], 'x', false, ''); } catch (_) { c++; }
  ok(c === 6, '그림 역검증 ' + c); });
console.log('gate_g2s2_math_u3: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
