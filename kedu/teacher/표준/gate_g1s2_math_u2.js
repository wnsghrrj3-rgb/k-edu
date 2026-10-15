/* gate_g1s2_math_u2.js — 1학년 2학기 수학 2단원 「덧셈과 뺄셈(1)」 케이티처 2세대 게이트 (124차, 베프).
   A 로드 · B 19장 골격·단계 · C 복습 계보(g1s2_math u1_l10 → u2_l01 → … → l10)
   D 원문 충실 — 기본 문제 물음·정답·보기가 자기주도 원문과 같음 · 개념 글 줄이 원문 글 줄(이어 붙임 포함) 또는 원문 장 제목
   E 셈 재계산 — 출구·수준별 물음을 게이트가 다시 셈(세 수 덧셈·뺄셈 · 10 + n · 10 − n · 「n과 더해서 10」)
   F 그림 — 식 띠(eqt) 모든 줄이 셈으로 맞음 · 문제 식의 「?」 자리에 정답을 넣으면 맞음 · 문제 그림엔 강조·층 수 글자 없음 · 「모두 몇 개」 = 컵·연결 모형 수 · 십 배열판 칸 수 10
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴(cv2·pa2…) 받음 · H 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u2.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u2.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* 식 셈 — 「a + b − c」 꼴만(왼쪽부터) */
function ev(s) { const t = String(s).replace(/−/g, '-').replace(/\s+/g, ''); if (!/^\d+([+-]\d+)*$/.test(t)) return null; let v = 0, sg = 1; for (const m of t.match(/[+-]|\d+/g)) { if (m === '+') sg = 1; else if (m === '-') sg = -1; else v += sg * +m; } return v; }
/* 게이트 셈 — 물음 글에서 답을 다시 낸다(모르는 꼴은 null) */
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/(\d+)(?:과|와) 더해서 10이 되는 수/))) return String(10 - m[1]);
  if ((m = q.match(/^(\d+(?:\s*[+−-]\s*\d+)+)(?:은|는) 얼마/))) return String(ev(m[1]));
  if ((m = q.match(/(\d+) − (\d+) = (\d+)이에요\. 뺀 수와 남은 수를 맞바꾼 식/))) return '10 − ' + m[3] + ' = ' + m[2];
  if ((m = q.match(/(\d+) \+ (\d+) = 10이에요\. 두 수를 바꾸어 쓴 덧셈식/))) return m[2] + ' + ' + m[1] + ' = 10';
  return null;
}
const rowOk = (toks, put) => { const t = toks.map(x => (x === '?' ? put : x)); const i = t.indexOf('='); if (i < 0) return true; const l = ev(t.slice(0, i).join('')), r = ev(t.slice(i + 1).join('')); return l != null && l === r; };
function eqtRows(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => eqtRows(p.fig || p)); return f.k === 'eqt' ? f.rows : []; }
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }

T('A 로드 10차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 10); });
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 2 && les.meta.n === i + 1); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u1_l10.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u1_l10' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 9) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const a = solve(it.q); if (a == null) return; n++; ok(nsp(a) === nsp(it.a), it.q + ' → ' + it.a + ' (셈 ' + a + ')'); });
    Object.values(sl[11].data.levels).forEach(lv => { const a = solve(lv.q); if (a == null) return; n++; ok(nsp(a) === nsp(lv.a).replace(/개$/, ''), lv.q + ' → ' + lv.a + ' (셈 ' + a + ')'); }); ok(n >= 2, '셈한 물음 ' + n); });
  T(k + ' F 식 띠 셈', () => { sl.forEach((s, j) => { const d = s.data; eqtRows(d.fig).forEach(r => { const toks = r.toks.map((t, x) => ((r.q || []).indexOf(x) >= 0 ? '?' : t)); if (toks.indexOf('?') >= 0) { ok(s.block === 'basic_problem' || s.block === 'concept', 's' + (j + 1) + ' 「?」 는 문제·개념(물음) 장에만'); if (s.block === 'basic_problem' && d.answer != null) ok(rowOk(toks, String(d.answer)), 's' + (j + 1) + ' ' + toks.join(' ') + ' ← ' + d.answer); else if (s.block === 'basic_problem') ok((d.options || []).length >= 2, 's' + (j + 1) + ' 보기 문제'); } else ok(rowOk(toks), 's' + (j + 1) + ' 틀린 식 ' + toks.join(' ')); }); }); });
  T(k + ' F 문제 그림에 답 없음', () => { sl.slice(8, 11).forEach(s => { const d = s.data; if (!d.fig) return; figsOf(d.fig).forEach(f => { if (f.k === 'eqt') f.rows.forEach(r => ok(!(r.hi || []).length, '문제 식 강조')); if (f.k === 'cstack' || f.k === 'lcube') ok(!f.num, '문제 그림 수 글자'); });
    const h = FIG.render(d.fig); const doc = new JSDOM('<body>' + h + '</body>').window.document; const n = doc.querySelector('svg.fig-cstack, svg.fig-lcube');
    if (n && /모두 몇/.test(d.question) && d.answer != null) ok(+n.getAttribute('data-n') === +d.answer, '그림 ' + n.getAttribute('data-n') + ' ≠ ' + d.answer);
    doc.querySelectorAll('svg.fig-cstack, svg.fig-lcube').forEach(sv => ok(sv.querySelectorAll('text').length === 0, '문제 그림에 글자')); }); });
  T(k + ' F 십 배열판 10칸', () => { sl.forEach(s => figsOf(s.data.fig).filter(f => f.k === 'tf2').forEach(f => { ok(f.a + f.b + (f.g || 0) <= 10, 'tf 넘침'); const doc = new JSDOM('<body>' + FIG.render(f) + '</body>').window.document; ok(doc.querySelectorAll('rect.o-tf').length === 10, '칸 ≠ 10'); })); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(1)', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(1)', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(1)', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u2.js'), 'utf8');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로', () => ['박음', '빵꾸', '갈아엎', '결로'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(ev('4 + 3 + 1') === 8 && ev('9 − 2 − 3') === 4 && solve('6과 더해서 10이 되는 수는?') === '4' && solve('10 − 6은 얼마일까요?') === '4'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈', () => { ok(!rowOk(['4', '+', '3', '=', '8'])); ok(!rowOk(['9', '-', '?', '=', '2'], '6')); ok(solve('7 − 2 − 1은 얼마일까요?') !== '6'); });
console.log('gate_g1s2_math_u2: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
