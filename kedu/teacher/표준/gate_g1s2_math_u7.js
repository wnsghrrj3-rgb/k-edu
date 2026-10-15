/* gate_g1s2_math_u7.js — 1학년 2학기 수학 7단원 「수학이랑 안전」 케이티처 2세대 게이트 (132차, 베프).
   A 로드 · B 19장 골격·단계·성취기준(임시 셋) · C 복습 계보(g1s2_math u6_l09 → u7_l01 → l02 → l03)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문 · 개념 글 줄 = 원문 줄·장 제목 · 정리·예고·자기 평가·정리 화살표 = 원문
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(「A ± B 은/는 얼마일까요?」 · 「…모두 몇 □일까요?」 · 「…몇 □ 더 많을까요?」
     · 「10개씩 묶음 N개와 낱개 M개인 수는?」 · 「A, B, C 가 되풀이돼요. X 다음에 올 모양은 무엇일까요?」
     · 「짧은바늘이 N 과 N+1 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?」) + 풀이 steps 작은 식 + 조사(수 뒤 · 되풀이 모양 뒤 이/가)
   F 그림 — sign1 = 원문 표지판(모양·색·수·글·꼬리표) · 수 표지판은 빨강 동그라미 · tally1 = 원문 줄(이름·수·on) · 원문 diff 식 = 줄 수의 차
         · pat1(모양 규칙) = 원문 칸 · 칸 모양 = data-pat 차례 · 「?」 칸 = 원문 ask(「다음에 올」은 끝 칸) · 묶음 테 = 원문 묶음 크기(개념 장만, 문제 그림엔 없음)
         · clk1·tcard = 원문 시각 · shp1·objs1 = 원문 · eqt 식 셈 · 문제 식 강조 없음
         · 기본 문제 답 = 그림에서 다시 낸 값(점 줄 차 · 수 표지판 수 · 한 표지판 모양 · 시계 시각 · 규칙 「?」 모양 · 식 「?」)
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(성취기준 원문은 빼고 봄) + 지도서 금지 말
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u7.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u7.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u7.json'), 'utf8'));
const KEYS = ['u7_l01', 'u7_l02', 'u7_l03'];
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const SHN = { t: '세모', o: '동그라미', q: '네모' }, NSH = { 세모: 't', 동그라미: 'o', 네모: 'q' };

/* ── E 셈 ── */
const calc = (a, op, b) => (op === '+' ? a + b : a - b);
const opOf = (t) => (t === '-' || t === '−' ? '-' : t);
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/^(\d+) ([+−]) (\d+) ?(?:은|는) 얼마일까요\?$/))) { const r = calc(+m[1], opOf(m[2]), +m[3]); ok(r >= 0, q + ' 작은 수에서 큰 수'); return String(r); }
  if ((m = q.match(/^10개씩 묶음 (\d+)개와 낱개 (\d+)개인 수는\?$/))) return String(+m[1] * 10 + +m[2]);
  if ((m = q.match(/^([가-힣]+(?:, [가-힣]+)+)(이|가) 되풀이돼요\. ([가-힣]+) 다음에 올 모양은 무엇일까요\?$/))) { const u = m[1].split(', '); ok(josaWord(u[u.length - 1], m[2]), q + ' 조사 ' + m[2]); const i = u.indexOf(m[3]); ok(i >= 0, q + ' 묶음에 없는 모양'); return u[(i + 1) % u.length]; }
  if ((m = q.match(/^짧은바늘이 (\d+) (과|와) (\d+) 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요\?$/))) { ok(+m[3] === +m[1] % 12 + 1, q + ' 사이 두 수'); return m[1] + '시 30분'; }
  const ns = (q.match(/\d+/g) || []).map(Number);
  if ((m = q.match(/모두 몇 (개|명)일까요\?$/))) { ok(ns.length === 2, q + ' 수 두 개'); return (ns[0] + ns[1]) + m[1]; }
  if ((m = q.match(/몇 (개|명) 더 많을까요\?$/))) { ok(ns.length === 2, q + ' 수 두 개'); ok(ns[0] > ns[1], q + ' 물은 쪽이 많은 쪽'); return (ns[0] - ns[1]) + m[1]; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
function stepEq(s) { let n = 0; for (const m of String(s).matchAll(/(\d+) ([+−]) (\d+) = (\d+)/g)) { ok(calc(+m[1], opOf(m[2]), +m[3]) === +m[4], '풀이 식 ' + m[0]); n++; } return n; }
/* 낱말 뒤 이/가 — 받침 */
function josaWord(wd, j) { const c = wd.charCodeAt(wd.length - 1) - 0xAC00; const has = c >= 0 && c < 11172 && c % 28 !== 0; return (has ? '이' : '가') === j; }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); if (d === 0) return 1; return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }


function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const svgOf = (f, sel) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document.querySelector(sel);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 그림 하나 점검 — 문제 그림이면 구할 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, q) {
  if (f.k === 'sign1') { const g = srcFigs.find(x => x.k === 'sign' && same(x.items.map(i => [i.s, i.c, i.n || '', i.t || '', i.tag || '']), f.items.map(i => [i.s, i.c, i.n || '', i.t || '', i.tag || '']))); ok(g, at + ' 원문 표지판');
    f.items.forEach(i => { ok(SHN[i.s] && ['blue', 'red', 'yellow', 'green'].includes(i.c), at + ' 모양·색 ' + i.s + i.c); if (i.n) ok(/^\d+$/.test(i.n) && i.s === 'o' && i.c === 'red', at + ' 수 표지판 = 빨강 동그라미'); });
    const sv = svgOf(f, 'svg.fig-sign1'); ok(sv && sv.getAttribute('data-signs') === f.items.map(i => [i.s, i.c, i.n || '', i.t || ''].join('|')).join(';'), at + ' 렌더');
    if (!prob || f.items.length !== 1) return []; const it = f.items[0]; if (/수/.test(q || '') && it.n) return [String(it.n)]; if (/모양/.test(q || '')) return [SHN[it.s]]; return []; }
  if (f.k === 'tally1') { const g = srcFigs.find(x => x.k === 'tally' && same(x.rows.map(r => [r.lab, r.n, !!r.on]), f.rows.map(r => [r.lab, r.n, r.on]))); ok(g, at + ' 원문 점 줄'); ok(g.unit === f.unit, at + ' 단위');
    if (g.diff) { const m = g.diff.match(/^(\d+)-(\d+)=(\d+)$/); ok(m && +m[1] === f.rows[0].n && +m[2] === f.rows[1].n && +m[1] - +m[2] === +m[3], at + ' 원문 견준 식 ' + g.diff); }
    ok(f.rows.filter(r => r.on).length === 1 && f.rows.find(r => r.on).n === Math.max(...f.rows.map(r => r.n)), at + ' on = 많은 줄');
    ok(svgOf(f, 'svg.fig-tally1').getAttribute('data-tally') === f.rows.map(r => r.lab + ':' + r.n).join(';'), at + ' 렌더');
    return prob && /더 많/.test(q || '') && f.rows.length === 2 ? [String(Math.abs(f.rows[0].n - f.rows[1].n))] : []; }
  if (f.k === 'pat1') { const g = srcFigs.find(x => x.k === 'patc' && x.toks.length >= f.toks.length - 1 && same(x.toks.map(t => t.h ? '?' : t.p), f.toks.slice(0, x.toks.length).map(t => t.h ? '?' : t.p))); ok(g, at + ' 원문 모양 규칙 줄');
    const extra = f.toks.length - g.toks.length; ok(extra === 0 || (extra === 1 && prob && f.toks[f.toks.length - 1].h && /다음에 올/.test(q || '')), at + ' 덧붙인 칸은 「다음에 올」 문제 끝 「?」만');
    const unit = g.seq.slice(0, g.n); ok(g.seq.split('').every((c, i) => c === unit[i % g.n]), at + ' data-pat 되풀이 ' + g.seq);
    f.toks.forEach((t, i) => { if (!t.h) ok(t.p === unit[i % g.n], at + ' 칸 ' + i + ' 모양'); });
    const holes = f.toks.map((t, i) => (t.h ? i : -1)).filter(i => i >= 0); if (g.ask != null) ok(same(holes, [g.ask]), at + ' 「?」 = 원문 ask');
    if (prob) ok(!f.pu, at + ' 문제 그림 묶음 테'); else ok(same(f.pu, Array(Math.floor(f.toks.length / g.n)).fill(g.n)), at + ' 묶음 테 = 원문 묶음 크기');
    ok(svgOf(f, 'svg.fig-pat1').getAttribute('data-toks') === f.toks.map(t => (t.h ? '?' : 'p:' + t.p)).join(','), at + ' 렌더');
    return prob && holes.length === 1 ? [SHN[unit[holes[0] % g.n]]] : []; }
  if (f.k === 'clk1') { const g = srcFigs.find(x => x.k === 'clock' && x.h === f.h && x.m === f.m); ok(g, at + ' 원문 시계'); ok(f.h >= 1 && f.h <= 12 && (f.m === 0 || f.m === 30), at + ' 시각');
    return prob && /몇 시/.test(q || '') ? [f.h + '시' + (f.m ? ' ' + f.m + '분' : '')] : []; }
  if (f.k === 'tcard') { ok(srcFigs.some(x => x.k === 'tc' && x.h === f.h && (x.m == null ? f.m == null : x.m === f.m)), at + ' 원문 시각 카드'); return []; }
  if (f.k === 'shp1') { ok(srcFigs.some(x => x.k === 'shp' && same(x.items, f.items)), at + ' 원문 모양 줄'); return []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && same(x.items, f.items)), at + ' 원문 물건 카드'); return []; }
  if (f.k === 'eqt') { const want = []; f.rows.forEach(r => { const t = r.toks; ok(srcFigs.some(x => x.k === 'eqt' && same(x.toks, t)), at + ' 원문 식 ' + t.join(' '));
    if (t.length === 5 && t[3] === '=') { if (t[4] === '?') want.push(String(calc(+t[0], opOf(t[1]), +t[2]))); else ok(calc(+t[0], opOf(t[1]), +t[2]) === +t[4], at + ' 식 ' + t.join(' ')); }
    if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); }); return prob ? want : []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length) return 0; const A = d.options ? d.options.find(o => o.correct).text : String(d.answer) + (d.unit || '');
  ok(want.every(x => x === want[0]), at + ' 그림끼리 값이 다름 ' + want); ok(/^\d+$/.test(want[0]) ? nsp(A).replace(/[^\d]/g, '') === want[0] : nsp(A) === nsp(want[0]), at + ' 답 「' + A + '」 ≠ 그림 ' + want[0]); return 1;
}

T('A 로드 3차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 3); });
let holeChecked = 0, eChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 7 && les.meta.n === i + 1 && les.meta.unit_title === '수학이랑 안전' && les.meta.duration_min === 40); ok(/^\[2수01-05\] .* · \[2수03-03\] .* · \[2수02-01\] /.test(les.meta.std), '성취기준 ' + les.meta.std); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u6_l09' : KEYS[i - 1])); if (i > 0) ok(L[KEYS[i - 1]].slides[18].data.emoji === sl[0].data.emoji, '예고 그림 = 다음 표지 그림'); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); if (p.unit) ok(d.unit === p.unit, '단위 ' + d.question); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가·화살표 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); if (i === 2) ok(/모두 마쳤어요/.test(sl[18].data.preview) && sl[18].data.title === '한 학기를 마쳤어요', '마지막 차시 = 한 학기 끝'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { n += check(it.q, it.a); }); Object.values(sl[11].data.levels).forEach(lv => { n += check(lv.q, lv.a); stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); ok(n >= 4, '셈한 물음 ' + n); eChecked += n; });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data, sl[15].data, sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + ' ' + f.k, j >= 8 && j <= 10, (s.data.question || '') + ' ' + (s.data.scenario && s.data.scenario.body || '')))); });
  T(k + ' F 기본 문제 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, q = d.question + ' ' + (d.scenario && d.scenario.body || '');
    const want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true, q)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' F 응용 = 원문 응용문제', () => { const d = sl[14].data; ok(d.context && d.challenge && /^풀이: /.test(d.note) && !d.fig, '응용 장 꼴'); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '수학이랑 안전', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '수학이랑 안전', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '수학이랑 안전', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음'); ok(eChecked >= 13, '셈 ' + eChecked); });
T('F 기본 문제 답 대조 수', () => { console.log('  · 기본 문제 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked >= 8, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u7.js'), 'utf8').split(L.u7_l01.meta.std).join('');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('H 지도서 금지 말 0', () => ['십의 자리', '일의 자리', '자릿값', '받아올림', '받아내림', '첨가', '합병', '제거'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('4 + 8 은 얼마일까요?') === '12' && solve('10개씩 묶음 3개와 낱개 0개인 수는?') === '30', '식·묶음');
  ok(solve('세모, 동그라미, 네모가 되풀이돼요. 네모 다음에 올 모양은 무엇일까요?') === '세모' && solve('세모, 동그라미, 네모가 되풀이돼요. 세모 다음에 올 모양은 무엇일까요?') === '동그라미', '되풀이');
  ok(solve('짧은바늘이 10 과 11 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?') === '10시 30분' && solve('짧은바늘이 12 와 1 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?') === '12시 30분', '시각');
  ok(solve('복도 지킴이는 8명, 계단 지킴이는 4명이에요. 복도 지킴이가 몇 명 더 많을까요?') === '4명' && solve('계단 지킴이는 9명, 복도 지킴이는 6명이에요. 지킴이는 모두 몇 명일까요?') === '15명', '이야기'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('4 + 8 은 얼마일까요?', '13'); } catch (_) { e++; }
  try { check('세모, 동그라미, 네모가 되풀이돼요. 동그라미 다음에 올 모양은 무엇일까요?', '세모'); } catch (_) { e++; }
  try { check('세모, 동그라미, 네모이 되풀이돼요. 동그라미 다음에 올 모양은 무엇일까요?', '네모'); } catch (_) { e++; }
  try { check('짧은바늘이 10 과 11 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?', '11시 30분'); } catch (_) { e++; }
  try { check('짧은바늘이 10 과 12 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?', '10시 30분'); } catch (_) { e++; }
  try { check('계단 지킴이는 4명, 복도 지킴이는 8명이에요. 계단 지킴이가 몇 명 더 많을까요?', '4명'); } catch (_) { e++; }
  try { stepEq('9 + 1 = 11'); } catch (_) { e++; }
  ok(e === 7, '틀린 답 못 잡음 ' + e);
  ok(josa('14 − 8 = 6 이에요').length === 0 && josa('6 예요').length === 1 && josa('30 은').length === 0 && josa('100 를').length === 1, '조사 역검증');
  const sf = SRC.u7_l03.slides.flatMap(s => s.figs || []).concat(SRC.u7_l03.problems.flatMap(p => p.figs || [])); let c = 0;
  try { figCheck({ k: 'pat1', toks: [{ p: 't' }, { p: 'o' }, { p: 'o' }, { p: 't' }, { p: 'o' }, { p: 'q' }, { p: 't' }, { p: 'o' }, { p: 'q' }], pu: [3, 3, 3] }, sf, 'x', false, ''); } catch (_) { c++; }
  try { figCheck({ k: 'pat1', toks: [{ p: 't' }, { p: 'o' }, { p: 'q' }, { p: 't' }, { p: 'o' }, { p: 'q' }, { p: 't' }, { p: 'o' }, { p: 'q' }], pu: [3, 3, 3] }, sf, 'x', true, '한 묶음은'); } catch (_) { c++; }
  const s1 = SRC.u7_l01.problems.flatMap(p => p.figs || []);
  try { figCheck({ k: 'tally1', rows: [{ lab: '복도에서 걸어 다녀요', n: 15, on: true }, { lab: '계단을 한 칸씩 올라가요', n: 8, on: false }], unit: '명' }, s1, 'x', true, '몇 명 더 많을까요'); } catch (_) { c++; }
  try { ansCheck(['6'], { answer: 7 }, 'x'); } catch (_) { c++; }
  try { ansCheck(['네모'], { options: [{ text: '세모', correct: true }, { text: '네모' }] }, 'x'); } catch (_) { c++; }
  const s2 = SRC.u7_l02.slides.flatMap(s => s.figs || []);
  try { figCheck({ k: 'sign1', items: [{ s: 'q', c: 'red', n: '30' }] }, [{ k: 'sign', items: [{ s: 'q', c: 'red', n: '30' }] }], 'x', false, ''); } catch (_) { c++; }
  ok(c === 6, '그림 역검증 ' + c); });
console.log('gate_g1s2_math_u7: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
