/* gate_g1s2_math_u3.js — 1학년 2학기 수학 3단원 「모양과 시각」 케이티처 2세대 게이트 (126차, 베프).
   A 로드 · B 19장 골격·단계 · C 복습 계보(g1s2_math u2_l10 → u3_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기가 원문과 같음(시계 그림 보기는 가/나/다) · 개념 글 줄 = 원문 줄 또는 장 제목 · 정리·예고·자기 평가 = 원문
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(뾰족한 곳 수 · 몇 시 · 몇 시 30분 · 바늘 자리 · 모양 수 모으기·견주기)
   F 그림 — 시계 바늘 각도 = h·m 셈(잘못 놓은 시계 bad 는 원문 각도) · 모양 판 data-q/t/o = 원문 수 · 문제 그림엔 센 수(cnt) 없음 · 시각 카드 = 원문 시각 · 그림 보기 그림 수 = 보기 수
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u3.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* 식 셈 — 「a + b − c」 꼴만(왼쪽부터) */
function ev(s) { const t = String(s).replace(/−/g, '-').replace(/\s+/g, ''); if (!/^\d+([+-]\d+)*$/.test(t)) return null; let v = 0, sg = 1; for (const m of t.match(/[+-]|\d+/g)) { if (m === '+') sg = 1; else if (m === '-') sg = -1; else v += sg * +m; } return v; }
const CORN = { 네모: 4, 세모: 3, 동그라미: 0 };
const jo = (n, a, b) => { const d = String(n).slice(-1); return n + ('2459'.indexOf(d) >= 0 && !(+n === 10 || +n === 11) ? b : a); }; // 받침 있음 = a (일·삼·육·칠·팔·십·십일)
const cw = (n) => (n ? n + '군데' : '없어요');
/* 게이트 셈 — 물음 글에서 답을 다시 낸다(모르는 꼴은 null) */
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/^(네모|세모|동그라미)의 뾰족한 곳은 몇 군데/))) return cw(CORN[m[1]]);
  if ((m = q.match(/^(네모|세모|동그라미) (\d+)개(?:와|과) (네모|세모|동그라미) (\d+)개의 뾰족한 곳은 모두 몇 군데/))) return cw(CORN[m[1]] * m[2] + CORN[m[3]] * m[4]);
  if ((m = q.match(/짧은바늘이 (\d+)(?:을|를) 가리키고 긴바늘이 12를 가리키면 몇 시/))) { ok(q.indexOf(jo(m[1], '을', '를')) >= 0, '조사 ' + q); return m[1] + '시'; }
  if ((m = q.match(/짧은바늘이 (\d+)(?:과|와) (\d+)의 가운데, 긴바늘이 6을 가리키면 몇 시 몇 분/))) { ok(+m[2] === +m[1] % 12 + 1, '이웃한 수 아님 ' + q); ok(q.indexOf(jo(m[1], '과', '와')) >= 0, '조사 ' + q); return m[1] + '시 30분'; }
  if ((m = q.match(/^(\d+)시 30분을 나타내려면 긴바늘은/))) return '6';
  if ((m = q.match(/^(\d+)시 30분을 나타내려면 짧은바늘은/))) return jo(m[1], '과', '와') + ' ' + (+m[1] % 12 + 1) + '의 가운데';
  if ((m = q.match(/(네모|세모|동그라미) (\d+)개(?:와|과) (네모|세모|동그라미) (\d+)개(?:를|가)? (?:썼어요|있어요)\. (?:모두 몇 개|(?:\1)는 (?:\3)보다 몇 개 더 많)/))) { ok(m[1] !== m[3], '같은 모양 ' + q); return /모두/.test(q) ? String(+m[2] + +m[4]) : String(m[2] - m[4]); }
  return null;
}
const rowOk = (toks, put) => { const t = toks.map(x => (x === '?' ? put : x)); const i = t.indexOf('='); if (i < 0) return true; const l = ev(t.slice(0, i).join('')), r = ev(t.slice(i + 1).join('')); return l != null && l === r; };
function eqtRows(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => eqtRows(p.fig || p)); return f.k === 'eqt' ? f.rows : []; }
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 9); });
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 3 && les.meta.n === i + 1); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u2_l10.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u2_l10' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.optfigs && p.optfigs[0].h != null ? p.opts.map((_, j) => '가나다라'[j]) : p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 8) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const a = solve(it.q); if (a == null) return; n++; ok(nsp(a) === nsp(it.a).replace(/개$/, ''), it.q + ' → ' + it.a + ' (셈 ' + a + ')'); });
    Object.values(sl[11].data.levels).forEach(lv => { const a = solve(lv.q); if (a == null) return; n++; ok(nsp(a) === nsp(lv.a).replace(/개$/, ''), lv.q + ' → ' + lv.a + ' (셈 ' + a + ')'); }); ok(n >= 2, '셈한 물음 ' + n); });
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' F 시계 바늘 각도', () => { let n = 0; sl.forEach((s, j) => figsOf(s.data.fig).filter(f => f.k === 'clk1').forEach(f => { n++; const doc = new JSDOM('<body>' + FIG.render(f) + '</body>').window.document, sv = doc.querySelector('svg.fig-clk1'); ok(sv, 's' + (j + 1) + ' 시계 안 그림');
    const hd = +sv.getAttribute('data-hd'), md = +sv.getAttribute('data-md');
    if (f.deg) { ok(sv.getAttribute('data-bad') === '1', '잘못 놓은 시계 표시'); ok(srcFigs.some(g => g.k === 'clock' && g.bad && g.deg.h === hd && g.deg.m === md), 's' + (j + 1) + ' 잘못 놓은 시계 각도 ≠ 원문'); }
    else { ok(Math.abs(hd - ((f.h % 12) * 30 + f.m * 0.5)) < 0.05, 's' + (j + 1) + ' 짧은바늘 ' + hd + ' ≠ ' + f.h + ':' + f.m); ok(Math.abs(md - f.m * 6) < 0.05, 's' + (j + 1) + ' 긴바늘'); ok(f.m === 0 || f.m === 30, 's' + (j + 1) + ' 1학년은 몇 시·몇 시 30분만'); }
    const hs = sv.querySelectorAll('line.o-hand'); ok(hs.length === String(f.hands).length, 's' + (j + 1) + ' 바늘 수'); })); });
  T(k + ' F 모양 판·시각 카드 = 원문', () => { sl.forEach((s, j) => figsOf(s.data.fig).forEach(f => {
    if (f.k === 'mosaic1') { const g = srcFigs.find(x => x.k === 'mosaic' && x.cells === f.cells); ok(g, 's' + (j + 1) + ' 원문에 없는 모양 판'); const sv = new JSDOM('<body>' + FIG.render(f) + '</body>').window.document.querySelector('svg.fig-mosaic1'); ['q', 't', 'o'].forEach(c => ok(+sv.getAttribute('data-' + c) === g[c], 's' + (j + 1) + ' ' + c + ' ' + sv.getAttribute('data-' + c) + ' ≠ 원문 ' + g[c])); if (f.cnt) ok(s.block === 'concept', 's' + (j + 1) + ' 센 수는 개념 장만'); }
    if (f.k === 'tcard') ok(srcFigs.some(x => x.k === 'tc' && x.h === f.h && (x.m == null ? f.m == null : x.m === f.m)), 's' + (j + 1) + ' 원문에 없는 시각 카드 ' + f.h + ':' + f.m);
    if (f.k === 'shp1') ok(f.items.every(x => x.s || x.sym || x.emo), 's' + (j + 1) + ' 모양 줄'); })); });
  T(k + ' F 문제 그림에 답 없음', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data; figsOf(d.fig).forEach(f => { ok(!f.cnt, 's' + (j + 9) + ' 문제 모양 판에 센 수'); ok(!f.corners, 's' + (j + 9) + ' 문제 그림에 뾰족한 곳 점'); if (f.k === 'tcard') ok(f.amber, 's' + (j + 9) + ' 문제 시각 카드는 「나타낼 시각」(amber)만'); });
    const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '')); if (p && p.optfigs) { const fs2 = figsOf(d.fig); ok(fs2.length === p.optfigs.length || (fs2.length === 1 && fs2[0].items.length === p.optfigs.length), 's' + (j + 9) + ' 그림 보기 수'); }
    if (p && p.part === 'pad' && /몇 시/.test(p.q)) { const c = figsOf(d.fig).find(f => f.k === 'clk1'); ok(c && c.h === +d.answer, 's' + (j + 9) + ' 시계 ' + (c && c.h) + ' ≠ 답 ' + d.answer); }
    if (p && p.part === 'pad' && /개일까요/.test(p.q)) { const mz = figsOf(d.fig).find(f => f.k === 'mosaic1'); const c = /세모/.test(p.q) ? 't' : /동그라미/.test(p.q) ? 'o' : 'q'; ok(mz && mz.cells.split('').filter(x => x === c).length === +d.answer, 's' + (j + 9) + ' 모양 수 ≠ 답'); } }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '모양과 시각', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '모양과 시각', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '모양과 시각', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u3.js'), 'utf8');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('네모의 뾰족한 곳은 몇 군데일까요?') === '4군데' && solve('동그라미의 뾰족한 곳은 몇 군데일까요?') === '없어요' && solve('짧은바늘이 9를 가리키고 긴바늘이 12를 가리키면 몇 시일까요?') === '9시' && solve('짧은바늘이 4와 5의 가운데, 긴바늘이 6을 가리키면 몇 시 몇 분일까요?') === '4시 30분' && solve('8시 30분을 나타내려면 짧은바늘은 어디에 놓을까요?') === '8과 9의 가운데' && solve('세모 2개와 네모 1개의 뾰족한 곳은 모두 몇 군데일까요?') === '10군데' && solve('로켓에 네모 6개와 세모 3개를 썼어요. 네모는 세모보다 몇 개 더 많을까요?') === '3'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·그림', () => { let e = 0; try { solve('짧은바늘이 4와 6의 가운데, 긴바늘이 6을 가리키면 몇 시 몇 분일까요?'); } catch (_) { e++; } try { solve('짧은바늘이 9을 가리키고 긴바늘이 12를 가리키면 몇 시일까요?'); } catch (_) { e++; } ok(e === 2, '이웃 수·조사 못 잡음');
  ok(solve('짧은바늘이 10과 11의 가운데, 긴바늘이 6을 가리키면 몇 시 몇 분일까요?') !== '11시 30분');
  const sv = new JSDOM('<body>' + FIG.render({ k: 'clk1', h: 10, m: 30 }) + '</body>').window.document.querySelector('svg'); ok(+sv.getAttribute('data-hd') === 315 && +sv.getAttribute('data-md') === 180, '10:30 각도'); });
console.log('gate_g1s2_math_u3: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
