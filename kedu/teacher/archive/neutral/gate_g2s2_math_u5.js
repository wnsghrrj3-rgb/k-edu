/* gate_g2s2_math_u5.js — 2학년 2학기 수학 5단원 「표와 그래프」 케이티처 2세대 게이트 (144차, 베프). u4 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u4_l10 → u5_l01 → … → l08)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(이름꼴 물음은 생성기 QOVR) · 두 칸 답(two) = 「a0단위, a1단위」 · 개념 글 줄 · 정리·예고·스스로 점검 줄 = 원문 · 정리 화살표 = 원문 목표(있을 때)
   E 재계산 — 출구·수준별·기본 문제 물음을 게이트가 다시 셈: 모두 더한 합계 · 「A는 B보다 몇 더 많을까요」 차 · 합계에서 다른 항목을 뺀 남은 항목
     · 그래프 세로 칸 수 = 가장 많은 수 · / 다섯씩 묶음 + 낱개 · 쌓인 ◯ 칸 = 명 + 풀이 steps 안 등식 다시 셈 + 수 뒤 조사
   F 그림 — tbl2 = 원문 표(합계 = 항목 합 · 빈칸 「?」 자리 = 원문) · cg2 = 원문 그래프(grid ◯ 수 = 표 수, 바르게 그린 그래프는 맨 아래부터 빈틈없이 ·
         잘못 그린 그래프(bad top/gap/mixed/over)는 원문 그대로 그 잘못이 실제로 보임) · tly2 / 수 = 같은 차시 표 · srt2 이름 수 = 같은 차시 표
         · dc2 = 원문 낱장 · wcl2 날씨 일수 = 같은 차시 표 · 31일 · △ 친 날 = 그 날씨 · nte2 = 원문 쪽지(빈칸 「?」 답 = 그래프 가장 많은 항목)
         · 같은 차시 안 같은 항목 표·그래프·세기·분류 수가 서로 같음 · 빈칸 답(기본 문제) = 그림에서 다시 낸 값
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u5.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u5.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u5.json'), 'utf8'));
const FIX = (s) => s.replace(/누가 나누어도 결과가 같아지는/g, '누가 나누어도 똑같이 나뉘는').replace(/바른 결과가 나오지 않아요/g, '바르게 조사할 수 없어요').replace(/조사한 결과/g, '조사한 것').replace(/연결 모형/g, '모형 블록')
  .replace(/\*\*문제를 해결\*\*해 봐요/g, '**문제를 풀어** 봐요').replace(/해결해 볼까요/g, '풀어 볼까요').replace(/해결해요/g, '풀어요');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC);
const QOVR = {
  '좋아하는 동물을 세어 보세요': '개와 고양이를 좋아하는 학생은 각각 몇 명일까요?', '모형 블록 수를 표로 나타냈어요': '모형 블록은 모두 몇 개일까요?',
  '세면서 표시한 것을 보고 수를 적어요': '봄에 태어난 학생은 몇 명일까요?', '표를 보고 그래프에서 빠진 칸을 채워요': '금붕어 칸에 그릴 ◯는 몇 개일까요?',
  '표를 보고 그래프의 빈칸을 채워요': '공기놀이 칸에 그릴 ◯는 몇 개일까요?', '두 가지 기준으로 나눈 단추': '두 표의 합계는 같은데 항목이 서로 다른 까닭은 무엇일까요?',
  '모양 조각을 세어 표로 나타냈어요': '조각은 모두 몇 개일까요?', '제기차기를 가장 많이 한 모둠의 횟수는?': '제기차기를 가장 많이 한 모둠은 몇 회 찼을까요?'
};
const N = 8, KEYS = Array.from({ length: N }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const twoText = (p) => p.a[0] + p.unit + ', ' + p.a[1] + p.unit;
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 자료 셈 ── 단위 명·개·일(「며칠」)·칸 */
const U = '(명|개|일|회)', ASK = (u) => (u === '일' ? '며칠' : '몇 ' + u);
const OBJ = { 명: '을', 개: '를', 일: '을', 회: '를' };
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(new RegExp('^((?:\\d+' + U + ', )+\\d+\\2)([을를]) 모두 더하면 (몇 (?:명|개)|며칠)일까요\\?$')))) { ok(m[3] === OBJ[m[2]] && m[4] === ASK(m[2]), '조사·물음 ' + q); return m[1].split(', ').reduce((a, t) => a + parseInt(t, 10), 0) + m[2]; }
  if ((m = q.match(new RegExp('^\\S.*? (\\d+)' + U + '[은는] \\S.*? (\\d+)\\2보다 (몇 (?:명|개|회)|며칠) 더 많을까요\\?$')))) { ok(m[4] === ASK(m[2]), '물음 ' + q); const d = +m[1] - +m[3]; ok(d > 0, '차 ' + q); return d + m[2]; }
  if ((m = q.match(new RegExp('^합계가 (\\d+)' + U + '이고 다른 항목이 ((?:\\d+\\2, )*\\d+\\2)이면 남은 항목은 (몇 (?:명|개)|며칠)일까요\\?$')))) { ok(m[4] === ASK(m[2]), '물음 ' + q); const r = +m[1] - m[3].split(', ').reduce((a, t) => a + parseInt(t, 10), 0); ok(r > 0, '남은 ' + q); return r + m[2]; }
  if ((m = q.match(/^가장 많은 항목이 (\d+)(명|개|일)이면 그래프의 세로는 적어도 몇 칸이어야 할까요\?$/))) return m[1] + '칸';
  if ((m = q.match(/^\/ 표시를 다섯씩 묶은 것이 (\d+)묶음이고 (\d+)개가 더 있으면 \/ 표시는 모두 몇 개일까요\?$/))) { ok(+m[2] >= 1 && +m[2] <= 4, '낱개 ' + q); return 5 * +m[1] + +m[2] + '개'; }
  if ((m = q.match(/^◯가 맨 아래부터 (\d+)칸까지 쌓였으면 몇 명일까요\?$/))) return m[1] + '명';
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 등식 — 수 식(+ − ×)이면 양쪽이 같아야 */
function numExpr(e) { e = String(e).replace(/\s+/g, ''); if (!/^\d+([×+−]\d+)*$/.test(e)) return null; return e.split(/(?=[+−])/).reduce((acc, t) => { const sg = t[0] === '−' ? -1 : 1; return acc + sg * t.replace(/^[+−]/, '').split('×').reduce((a, b) => a * +b, 1); }, 0); }
function stepEq(s) { let n = 0; String(s).split(' | ').forEach(st => { const sides = st.split(' = '); if (sides.length < 2) return; const v = sides.map(numExpr); if (v.some(x => x == null)) return; ok(v.every(x => x === v[0]), '풀이 식 ' + st); n++; }); return n; }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

/* ── 그림 ── */
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const ones = (g) => (String(g).match(/1/g) || []).length;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const unbr = (c) => String(c).replace(/<br\s*\/?>|\n/g, '');
const catRe = (c) => new RegExp('(?:^|\\s)' + unbr(c).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=[와과은는을를이가의에]|\\s|$)');
/* 물음이 이름을 대는 항목들(차례대로) */
function named(cats, txt) { const hits = []; cats.forEach((c, i) => { const m = txt.match(catRe(c)); if (m) hits.push([m.index, i]); }); return hits.sort((a, b) => a[0] - b[0]).map(h => h[1]); }
const ASKNUM = /몇 (명|개|회)|며칠/, CALC = /보다|합하면|더하면|아닌|가장|모두|합계/;
/* 그림 하나 점검 — 문제 그림이면 그림에서 다시 낸 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, txt) {
  if (f.k === 'tbl2') { const sf = srcFigs.find(x => x.k === 'tbl' && x.title === f.title && same(x.head, f.head) && same(x.cats.map(unbr), f.cats.map(unbr)) && same(x.vals, f.vals) && x.total === f.total && !!x.total_hole === !!f.total_hole && same(x.holes || [], f.holes || [])); ok(sf, at + ' 원문 표 ' + f.title);
    const textVals = f.vals.every(v => v === 0) && (f.holes || []).length === f.cats.length; // 「달을 계절로 묶어요」처럼 칸을 채우는 표
    if (f.total != null) ok(f.total === sum(f.vals), at + ' 합계 ' + f.total + ' ≠ ' + sum(f.vals));
    ok(textVals || f.vals.every(v => Number.isInteger(v) && v >= 0), at + ' 수');
    const el = htmlOf(f).querySelector('svg[data-tbl]'); ok(el, at + ' 렌더'); ok((el.getAttribute('data-tbl').match(/\?/g) || []).length === (f.holes || []).length + (f.total_hole ? 1 : 0), at + ' 렌더 빈칸 수');
    if (!prob) return [];
    if (f.total_hole && /모두 몇/.test(txt)) return [{ n: f.total }];
    const nm = named(f.cats, txt), hs = f.holes || [];
    if (hs.length === 1 && ASKNUM.test(txt) && !CALC.test(txt)) { ok(nm.length === 1 && nm[0] === hs[0], at + ' 빈칸 항목 ≠ 물음 항목'); return [{ n: f.vals[hs[0]] }]; }
    if (hs.length === 0 && nm.length === 1 && ASKNUM.test(txt) && !CALC.test(txt)) return [{ n: f.vals[nm[0]] }];
    return []; }
  if (f.k === 'cg2') { const sf = srcFigs.find(x => x.k === 'graph' && x.title === f.title && x.sym === f.sym && x.vert === f.vert && same(x.cats, f.cats) && x.max === f.max && same(x.grid, f.grid) && same(x.ax, f.ax) && same(x.holes || [], f.holes || []) && same(x.odd || null, f.odd || null)); ok(sf, at + ' 원문 그래프 ' + f.title);
    const hs = f.holes || [], bad = sf.bad;
    ok(f.grid.length === f.cats.length && f.grid.every(g => g.length === f.max && /^[01]+$/.test(g)), at + ' 칸 수 = 세로 ' + f.max);
    f.grid.forEach((g, i) => { if (hs.indexOf(i) >= 0) { ok(ones(g) === 0, at + ' 채울 칸 ' + f.cats[i] + ' 비어 있어야'); return; }
      if (!bad) { ok(g === '1'.repeat(sf.vals[i]) + '0'.repeat(f.max - sf.vals[i]), at + ' ' + f.cats[i] + ' 맨 아래부터 ' + sf.vals[i] + '칸'); } });
    if (!bad) ok(Math.max(...sf.vals) === f.max || sf.vals.every(v => v === 0) || hs.length, at + ' 세로 = 가장 많은 수'); // 칸 나누기 장(빈 그래프)은 세로만
    if (bad === 'top') ok(f.grid.some((g, i) => hs.indexOf(i) < 0 && ones(g) === sf.vals[i] && g !== '1'.repeat(ones(g)) + '0'.repeat(f.max - ones(g)) && g === '0'.repeat(f.max - ones(g)) + '1'.repeat(ones(g))), at + ' 위에서부터 그린 칸이 보여야');
    if (bad === 'gap') ok(f.grid.some(g => /01/.test(g)), at + ' 건너뛴 칸이 보여야');
    if (bad === 'over') ok(f.grid.filter((g, i) => ones(g) !== sf.vals[i]).length === 1 && f.grid.every((g, i) => ones(g) - sf.vals[i] >= 0 && ones(g) - sf.vals[i] <= 1), at + ' 한 칸만 하나 더');
    if (bad === 'mixed') ok(f.odd && f.odd.some(o => o.length), at + ' 섞인 기호가 보여야');
    if (bad !== 'over' && bad !== 'gap') f.grid.forEach((g, i) => { if (hs.indexOf(i) < 0 && sf.vals[i]) ok(ones(g) === sf.vals[i], at + ' ◯ 수 = 표 ' + f.cats[i]); });
    const el = htmlOf(f).querySelector('svg[data-graph]') || htmlOf(f).querySelector('svg.fig-cg2'); ok(el, at + ' 렌더');
    if (!prob) return [];
    const nm = named(f.cats, txt);
    if (hs.length === 1) { if (/몇 개/.test(txt)) { ok(nm.length === 1 && nm[0] === hs[0], at + ' 채울 칸 항목 ≠ 물음'); return [{ n: sf.vals[hs[0]] }]; } return []; }
    if (!bad && nm.length === 1 && ASKNUM.test(txt) && !CALC.test(txt)) return [{ n: ones(f.grid[nm[0]]) }];
    return []; }
  if (f.k === 'tly2') { ok(srcFigs.some(x => x.k === 'tally' && x.name === f.name && same(x.cats, f.cats) && same(x.counts, f.counts)), at + ' 원문 세기'); ok(htmlOf(f).querySelectorAll('svg[data-tally] path').length === sum(f.counts), at + ' 렌더 / 수 = ' + sum(f.counts));
    if (!prob) return []; const nm = named(f.cats, txt); return nm.length === 1 && ASKNUM.test(txt) && !CALC.test(txt) ? [{ n: f.counts[nm[0]] }] : []; }
  if (f.k === 'dc2') { ok(srcFigs.some(x => x.k === 'dc' && same(x.items, f.items) && same(x.on || [], f.on)), at + ' 원문 낱장'); ok(htmlOf(f).querySelector('svg[data-dc]'), at + ' 렌더');
    if (!prob) return []; const cats = [...new Set(f.items.map(t => t[1]))], nm = named(cats, txt);
    if (nm.length === 2 && /각각 몇 명/.test(txt)) return [{ s: nm.map(i => f.items.filter(t => t[1] === cats[i]).length + '명').join(', ') }]; return []; }
  if (f.k === 'srt2') { ok(srcFigs.some(x => x.k === 'sort' && same(x.groups, f.groups)), at + ' 원문 분류'); const names = f.groups.flatMap(g => g[1]); ok(new Set(names).size === names.length, at + ' 이름 겹침'); ok(htmlOf(f).querySelector('svg[data-sort]'), at + ' 렌더'); return []; }
  if (f.k === 'wcl2') { ok(f.m === 12 && srcFigs.some(x => x.k === 'wcal' && x.first === f.first && same(x.days, f.days) && same(x.mark || [], f.mark) && same(x.ring || [], f.ring)), at + ' 원문 날씨 달력');
    ok(f.days.length === 31 && f.first >= 0 && f.first <= 6, at + ' 12월 31일'); ok(f.days.every(d => ['맑음', '흐림', '비', '눈'].includes(d)), at + ' 날씨 이름');
    if (f.mark.length) { const w0 = f.days[f.mark[0] - 1]; ok(f.mark.every(d => f.days[d - 1] === w0) && f.mark.length === f.days.filter(d => d === w0).length, at + ' △ = ' + w0 + ' 전부'); }
    ok(htmlOf(f).querySelector('svg[data-wcal]'), at + ' 렌더');
    if (!prob) return []; if (f.mark.length && /며칠/.test(txt)) { const w0 = f.days[f.mark[0] - 1]; ok(txt.indexOf(w0 === '눈' ? '눈' : w0) >= 0, at + ' △ 날씨 = 물음'); return [{ n: f.mark.length }]; } return []; }
  if (f.k === 'nte2') { ok(srcFigs.some(x => x.k === 'note' && x.hd === f.hd && x.body === f.body && (x.sg || undefined) === f.sg), at + ' 원문 쪽지'); ok(htmlOf(f).querySelector('svg[data-note], svg.fig-nte2'), at + ' 렌더'); return []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => (x.k === 'objs' || x.k === 'ways') && same(x.items, f.items)), at + ' 원문 카드'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length || d.options) return 0; ok(want.every(x => same(x, want[0])), at + ' 그림 답이 서로 다름 ' + JSON.stringify(want));
  const w0 = want[0];
  if (w0.n != null) { ok(d.input && +d.answer === w0.n, at + ' 답 ' + d.answer + ' ≠ ' + w0.n); return 1; }
  ok(nsp(d.answer) === nsp(w0.s), at + ' 답 「' + d.answer + '」 ≠ ' + w0.s); return 1;
}
/* 같은 차시 안 같은 항목 — 표·그래프·세기·분류·날씨 달력 수가 서로 같아야 */
function crossCheck(figs, at) { const tbls = figs.filter(f => f.k === 'tbl' && !f.holes.length || (f.k === 'tbl' && f.vals.some(v => v))); let n = 0;
  figs.forEach(f => { let cats, vals;
    if (f.k === 'graph' && !f.bad && !(f.holes || []).length && f.vals.some(v => v)) { cats = f.cats; vals = f.vals; }
    else if (f.k === 'tally') { cats = f.cats; vals = f.counts; }
    else if (f.k === 'sort') { cats = f.groups.map(g => g[0].split('\n')[0]); vals = f.groups.map(g => g[1].length); }
    else if (f.k === 'wcal') { cats = ['맑음', '흐림', '비', '눈']; vals = cats.map(c => f.days.filter(d => d === c).length); }
    else if (f.k === 'graph' && f.vals.some(v => v)) { cats = f.cats; vals = f.vals; }
    if (!cats) return; const t = tbls.find(x => same(x.cats, cats)); if (!t) return; const fh = f.k === 'graph' ? (f.holes || []) : [];
    cats.forEach((c, i) => { if ((t.holes || []).indexOf(i) < 0 && fh.indexOf(i) < 0 && t.vals[i]) ok(t.vals[i] === vals[i], at + ' ' + f.k + ' ' + c + ' ' + vals[i] + ' ≠ 표 ' + t.vals[i]); }); n++; });
  return n; }

/* 기본 문제 ↔ 원문 문제 — 물음(QOVR 거친)과 답이 같은 것 */
const srcProb = (src, d) => src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : p.part === 'two' ? d.answer === twoText(p) : String(d.answer) === String(p.a)));

T('A 로드 8차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === N); });
const unitFigs = Object.values(SRC).flatMap(s => s.slides.flatMap(x => x.figs || []).concat(s.problems.flatMap(p => p.figs || [])));
let holeChecked = 0, eChecked = 0, stepChecked = 0, basicSolved = 0, crossN = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 5 && les.meta.n === i + 1 && les.meta.unit_title === '표와 그래프'); ok(/^\[2수04-01\] .* · \[2수04-02\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u4_l10.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u4_l10' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data;
    const p = srcProb(src, d); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question);
    if (p.part === 'two') { ok(d.input === undefined, '두 칸 답에 input'); ok(/몇|얼마/.test(d.question), '두 칸 물음에 「몇/얼마」 없음 ' + d.question); }
    else if (!d.options) { ok(d.unit === (p.unit || undefined), '단위 ' + d.unit); ok(/몇|얼마|며칠/.test(d.question), '수 답 물음에 「몇/얼마/며칠」 없음 ' + d.question); }
    ok(['pad', 'mcq', 'two'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => { ok(titles.includes(nsp(s.data.title)), '원문에 없는 장 제목 ' + s.data.title); s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); }); }); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < N - 1) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/규칙 찾기/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); n += c; }); Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); n += c; stepChecked += stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); eChecked += n; });
  T(k + ' E 기본 문제 재계산', () => { sl.slice(8, 11).forEach(s => { const d = s.data; if (d.options) return; basicSolved += check(d.question, d.input ? d.answer + (d.unit || '') : d.answer); }); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.context, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => { const prob = j >= 8 && j <= 10, con = j >= 3 && j <= 6, tx = prob ? (s.data.scenario.body + ' ' + s.data.question + ' ') : '';
    let pool = srcFigs;
    if (con) { const si = src.slides.findIndex(x => nsp(x.title) === nsp(s.data.title)); pool = (src.slides[si] || {}).figs || []; ok(pool.length, 's' + (j + 1) + ' 원문 개념 장에 그림 없음'); }
    if (prob) { const p = srcProb(src, s.data); pool = (p && p.figs) || []; if (!pool.length) ok(!s.data.fig, 's' + (j + 1) + ' 원문 문제에 없는 그림'); }
    figsOf(s.data.fig).forEach(f => figCheck(f, pool, 's' + (j + 1) + (con ? ' 개념' : '') + ' ' + f.k, prob, tx)); }); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, tx = d.scenario.body + ' ' + d.question + ' ';
    const want = figsOf(d.fig).flatMap(f => figCheck(f, unitFigs, 's' + (j + 9) + ' ' + f.k, true, tx)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' F 같은 차시 표·그래프·세기 수 맞음(원문 전부)', () => { crossN += crossCheck(srcFigs, k); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '표와 그래프', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '표와 그래프', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); ok(s.data.fig, 'concept s' + (j + 4) + ' 그림 없음'); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '표와 그래프', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const EXP = { e: 48, basic: 0, hole: 16, cross: 42 }; // 기본 문제 24 = 보기 7 · 그림 빈칸·읽기 16 · 「흐린 날은 맑은 날보다」 1(그림에 수가 다 보임)
console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 기본 문제 ' + basicSolved + ' · 풀이 식 ' + stepChecked + ' · 빈칸 답 대조 ' + holeChecked + ' 문제 · 같은 차시 수 대조 ' + crossN + ' 그림');
T('E 셈한 물음 수', () => { ok(eChecked === EXP.e, '셈 ' + eChecked); ok(basicSolved === EXP.basic, '기본 ' + basicSolved); });
T('F 빈칸 답 대조한 문제 수 · 수 대조 그림 수', () => { ok(holeChecked === EXP.hole, '대조 ' + holeChecked); ok(crossN === EXP.cross, '수 대조 ' + crossN); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u5.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('7명, 3명, 5명을 모두 더하면 몇 명일까요?') === '15명' && solve('8일, 11일, 7일, 5일을 모두 더하면 며칠일까요?') === '31일', '합');
  ok(solve('개 6명은 토끼 2명보다 몇 명 더 많을까요?') === '4명' && solve('흐림 11일은 비 7일보다 며칠 더 많을까요?') === '4일', '차');
  ok(solve('합계가 20명이고 다른 항목이 7명, 4명, 3명이면 남은 항목은 몇 명일까요?') === '6명' && solve('/ 표시를 다섯씩 묶은 것이 2묶음이고 3개가 더 있으면 / 표시는 모두 몇 개일까요?') === '13개', '남은·묶음'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('7명, 3명, 5명을 모두 더하면 몇 명일까요?', '14명'); } catch (_) { e++; }
  try { check('7개, 3개을 모두 더하면 몇 개일까요?', '10개'); } catch (_) { e++; } // 「개를」이어야
  try { check('개 2명은 토끼 6명보다 몇 명 더 많을까요?', '4명'); } catch (_) { e++; } // 차가 음수
  try { check('합계가 20명이고 다른 항목이 7명, 4명, 3명이면 남은 항목은 몇 명일까요?', '14명'); } catch (_) { e++; }
  try { check('/ 표시를 다섯씩 묶은 것이 1묶음이고 2개가 더 있으면 / 표시는 모두 몇 개일까요?', '3개'); } catch (_) { e++; }
  try { check('가장 많은 항목이 6명이면 그래프의 세로는 적어도 몇 칸이어야 할까요?', '5칸'); } catch (_) { e++; }
  try { stepEq('7 + 3 + 2 + 3 = 16'); } catch (_) { e++; }
  try { stepEq('20 − 15 = 6'); } catch (_) { e++; }
  ok(e === 8, '틀린 답 못 잡음 ' + e);
  ok(josa('4 가').length === 0 && josa('4 이').length === 1 && josa('6은').length === 0, '조사 역검증');
  let c = 0;
  const T0 = { k: 'tbl', title: 't', head: ['a', 'b'], cats: ['x', 'y'], vals: [3, 4], total: 8, total_hole: false, holes: [] };
  try { figCheck({ k: 'tbl2', title: 't', head: ['a', 'b'], cats: ['x', 'y'], vals: [3, 4], total: 8 }, [T0], 'x', false, ''); } catch (_) { c++; } // 합계 틀림
  const G0 = { k: 'graph', title: 'g', sym: 'O', vert: true, cats: ['x', 'y'], vals: [3, 2], max: 3, holes: [], bad: null, ax: ['수(개)', '이름'], grid: ['111', '011'] };
  try { figCheck({ k: 'cg2', title: 'g', sym: 'O', vert: true, cats: ['x', 'y'], max: 3, grid: ['111', '011'], ax: ['수(개)', '이름'] }, [G0], 'x', false, ''); } catch (_) { c++; } // 위에서부터 그린 칸을 바른 그래프로
  const G1 = Object.assign({}, G0, { grid: ['111', '111'] });
  try { figCheck({ k: 'cg2', title: 'g', sym: 'O', vert: true, cats: ['x', 'y'], max: 3, grid: ['111', '111'], ax: ['수(개)', '이름'] }, [G1], 'x', false, ''); } catch (_) { c++; } // ◯ 수 ≠ 표
  const W0 = { k: 'wcal', first: 0, days: Array(31).fill('맑음').map((d, i) => (i === 3 || i === 9 ? '눈' : d)), mark: [4], ring: [] };
  try { figCheck({ k: 'wcl2', m: 12, first: 0, days: W0.days, mark: [4], ring: [] }, [W0], 'x', false, ''); } catch (_) { c++; } // 눈 온 날 하나 빠짐
  try { crossCheck([T0, { k: 'tally', name: 'n', cats: ['x', 'y'], counts: [3, 5] }], 'x'); } catch (_) { c++; } // 세기 ≠ 표
  try { ansCheck([{ n: 5 }], { input: 'count_input', answer: 4 }, 'x'); } catch (_) { c++; }
  ok(c === 6, '그림 역검증 ' + c); });
console.log('gate_g2s2_math_u5: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
