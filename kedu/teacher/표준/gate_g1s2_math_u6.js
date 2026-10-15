/* gate_g1s2_math_u6.js — 1학년 2학기 수학 6단원 「덧셈과 뺄셈(3)」 케이티처 2세대 게이트 (130차, 베프).
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g1s2_math u5_l09 → u6_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문 · 개념 글 줄 = 원문 줄·장 제목 · 정리·예고·자기 평가 = 원문(생성기와 같은 차단 어휘 치환 뒤)
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(네 꼴: 「A ± B 은/는 얼마일까요?」 · 「…모두 몇 □일까요?」 · 「…몇 □ 더 많을까요?」 · 「…남은 …몇 □일까요?」 · 「10개씩 묶음 N개와 낱개 M개인 수는?」)
     + 수준별 풀이 steps 안 작은 식(「2 + 5 = 7」)도 다시 셈 + 조사(수 뒤 은/는·이/가·을/를·과/와·이에요/예요)
   F 그림 — nbrow1 묶음·낱개 = 원문 nb 수 · 결과 칸 = 앞 두 칸 셈(+/−) · 문제 그림은 결과 「?」
         · vcalc1 칸 = 원문 칸 글자 그대로 · 결과 줄(res) = 위 두 줄 셈(같은 자리끼리) · bad(일부러 자리 틀리게 쓴 셈)은 재계산에서 빼고 「낱개 자리가 비었는지」만 봄
         · tops1 바름 표시 = 다시 셈 · paint = 바른 카드(개념 장만, 문제 그림엔 없음) · pairup1 짝 없는 수 = a − b · board1 칸 = 원문 · cmds1 = 원문 shown
         · 빈칸 답(기본 문제) = 그림·식에서 다시 낸 값(eqt 「?」 · nbrow 결과 · vcalc 「?」 줄 · board 고른 두 칸 합 · 틀린 팽이 바른 답 · 물건 카드 두 수와 물음의 「모두/더 많」)
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(성취기준 원문은 빼고 봄) + 지도서 금지 말(십의 자리·일의 자리·자릿값·받아올림·받아내림·첨가·합병·제거)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u6.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u6.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u6.json'), 'utf8'));
const FIX = (s) => s.replace(/연결 모형/g, '블록').replace(/결과는/g, '답은').replace(/결과도/g, '답도').replace(/결과가/g, '답이');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC); // 생성기와 같은 치환
const KEYS = Array.from({ length: 9 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── E 셈 ── */
const calc = (a, op, b) => (op === '+' ? a + b : a - b);
const opOf = (t) => (t === '-' || t === '−' ? '-' : t);
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/^(\d+) ([+−]) (\d+) ?(?:은|는) 얼마일까요\?$/))) { const r = calc(+m[1], opOf(m[2]), +m[3]); ok(r >= 0, q + ' 작은 수에서 큰 수'); return String(r); }
  if ((m = q.match(/^10개씩 묶음 (\d+)개와 낱개 (\d+)개인 수는\?$/))) return String(+m[1] * 10 + +m[2]);
  const ns = (q.match(/\d+/g) || []).map(Number);
  if ((m = q.match(/모두 몇 (개|장|쪽|가지)일까요\?$/))) { ok(ns.length === 2, q + ' 수 두 개'); return (ns[0] + ns[1]) + m[1]; }
  if ((m = q.match(/몇 (개|장|쪽|가지) 더 많을까요\?$/))) { ok(ns.length === 2, q + ' 수 두 개'); return Math.abs(ns[0] - ns[1]) + m[1]; }
  if ((m = q.match(/남은 .*몇 (개|장|쪽|가지)일까요\?$/))) { ok(ns.length === 2 && ns[0] >= ns[1], q + ' 처음 수 ≥ 뺀 수'); return (ns[0] - ns[1]) + m[1]; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 steps 안 작은 식 「a ± b = c」 */
function stepEq(s) { let n = 0; for (const m of String(s).matchAll(/(\d+) ([+−]) (\d+) = (\d+)/g)) { ok(calc(+m[1], opOf(m[2]), +m[3]) === +m[4], '풀이 식 ' + m[0]); n++; } return n; }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); if (d === 0) return 1; return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const svgOf = (f, sel) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document.querySelector(sel);
const vnum = (r) => (r[0] === '' ? 0 : +r[0]) * 10 + (r[1] === '' ? 0 : +r[1]);

/* 그림 하나 점검 — 문제 그림이면 구할 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob) {
  if (f.k === 'nbrow1') { const g = srcFigs.find(x => x.k === 'nbrow' && JSON.stringify(x.items.map(i => [i.t, i.o])) === JSON.stringify(f.items.map(i => [i.t, i.o]))); ok(g, at + ' 원문 수 모형 줄');
    ok(g.nb.slice(0, 2).every((v, i) => +v === f.items[i].t * 10 + f.items[i].o), at + ' 묶음·낱개 = 원문 수 ' + g.nb); const op = opOf(f.ops[0]), a = f.items[0].t * 10 + f.items[0].o, b = f.items[1].t * 10 + f.items[1].o, r = f.items[2].t * 10 + f.items[2].o;
    ok(calc(a, op, b) === r && +g.nb[3] === r, at + ' 결과 칸 ' + a + op + b + '=' + r); ok(f.items.every(i => i.o < 10), at + ' 낱개 10 넘음'); ok(!!f.hole === !!prob, at + ' 문제 그림 결과 「?」');
    const sv = svgOf(f, 'svg.fig-nbrow1'); ok(sv && (sv.getAttribute('data-nb').split(';').pop() === '?') === !!prob, at + ' 렌더'); return prob ? [String(r)] : []; }
  if (f.k === 'vcalc1') { const g = srcFigs.find(x => x.k === 'vcalc' && JSON.stringify(x.rows) === JSON.stringify(f.rows) && (x.mode || '') === (f.mode || '')); ok(g, at + ' 원문 세로 셈(칸 그대로)'); ok(g.op === f.op, at + ' 기호');
    const want = []; if (f.mode === 'bad') { ok(f.rows[1][1] === '' && f.rows[1][0] !== '', at + ' bad = 낱개를 묶음 자리에 쓴 셈'); return want; }
    const a = vnum(f.rows[0]), b = vnum(f.rows[1]), r = calc(a, opOf(f.op), b); ok(r >= 0, at + ' 큰 수에서');
    if (f.rows[2].every(v => v === '?')) want.push(String(r)); else if (f.rows[2].some(v => v !== '')) ok(vnum(f.rows[2]) === r, at + ' 결과 줄 ' + f.rows[2] + ' ≠ ' + r);
    ok(svgOf(f, 'svg.fig-vcalc1').getAttribute('data-rows') === f.rows.map(x => x.join(',')).join('|'), at + ' 렌더'); return prob ? want : []; }
  if (f.k === 'pairup1') { const g = srcFigs.find(x => x.k === 'pairup' && x.a === f.a && x.b === f.b); ok(g, at + ' 원문 짝짓기'); ok(g.solo === f.a - f.b && g.cols === f.a, at + ' 짝 없는 수 = a − b'); ok(+svgOf(f, 'svg.fig-pairup1').getAttribute('data-solo') === f.a - f.b, at + ' 렌더'); return prob ? [String(f.a - f.b)] : []; }
  if (f.k === 'board1') { const g = srcFigs.find(x => x.k === 'board' && JSON.stringify(x.rows) === JSON.stringify(f.rows)); ok(g, at + ' 원문 놀이판'); const flat = [].concat(...f.rows);
    flat.forEach((t, i) => { const m = t.match(/^(\d+)-(\d+)=(\d+)$/); if (m) ok(+m[1] - +m[2] === +m[3], at + ' 말판 칸 ' + t); else ok(/^\d+$/.test(t) || (f.word || []).includes(i), at + ' 글자 칸 ' + t); });
    if (prob && (f.on || []).length === 2) return [String(f.on.reduce((a, i) => a + +flat[i], 0))]; return []; }
  if (f.k === 'tops1') { const g = srcFigs.find(x => x.k === 'tops' && JSON.stringify(x.cards) === JSON.stringify(f.cards)); ok(g, at + ' 원문 팽이 카드');
    const good = []; f.cards.forEach((c, i) => { const r = calc(+c[0], opOf(c[1]), +c[2]); ok((r === +c[3]) === (c[4] === '1'), at + ' 바름 표시 ' + c.join(' ')); if (r === +c[3]) good.push(i); });
    if (prob) ok(!(f.paint || []).length, at + ' 문제 그림 색칠'); else if ((f.paint || []).length) ok(JSON.stringify(f.paint) === JSON.stringify(good), at + ' 색칠 = 바른 카드 ' + good);
    return prob && f.cards.length === 1 && f.cards[0][4] === '0' ? [String(calc(+f.cards[0][0], opOf(f.cards[0][1]), +f.cards[0][2]))] : []; }
  if (f.k === 'cmds1') { ok(srcFigs.some(x => x.k === 'cmds' && JSON.stringify(x.shown) === JSON.stringify(f.shown)), at + ' 원문 명령어'); ok(f.shown.every((t, i) => (t === '?') === (f.hole || []).includes(i)), at + ' 빈 명령어 표시'); ok(!f.shown.some(t => /십의|일의|자릿값/.test(t)), at + ' 지도서 말'); return []; }
  if (f.k === 'eqt') { const want = []; f.rows.forEach(r => { const t = r.toks; if (t.length === 5 && t[3] === '=') { if (t[4] === '?') want.push(String(calc(+t[0], opOf(t[1]), +t[2]))); else if (/^\d+$/.test(t[0]) && /^\d+$/.test(t[2]) && /^\d+$/.test(t[4]) && /^[+\-]$/.test(t[1])) { if (/^\d+$/.test(t[4]) && !(t[1] === '-' && +t[0] < +t[2])) ok(calc(+t[0], opOf(t[1]), +t[2]) === +t[4] || /^\d+$/.test(t[0]) && t[1] === '=' , at + ' 식 ' + t.join(' ')); } } if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); }); return prob ? want : []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && JSON.stringify(x.items) === JSON.stringify(f.items)), at + ' 원문 물건 카드'); return []; }
  if (f.k === 'tf2' || f.k === 'lcube' || f.k === 'ngrid') { if (prob && f.k === 'lcube') ok(!f.num, at + ' 문제 그림 묶음 수'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
/* 물건 카드 두 수 + 물음의 「모두/더 많/남은」 → 답 */
function objsWant(d) { const f = figsOf(d.fig).find(x => x.k === 'objs1' && x.items.length === 2 && x.items.every(i => i.n != null)); if (!f) return []; const q = d.question + ' ' + (d.scenario && d.scenario.body || ''); const [a, b] = f.items.map(i => i.n);
  if (/모두/.test(q) && /몇/.test(d.question)) return [String(a + b)]; if (/더 많|남은|앞으로/.test(q) && /몇/.test(d.question)) return [String(Math.abs(a - b))]; return []; }
function ansCheck(want, d, p, at) {
  if (!want.length) return 0; const A = d.options ? d.options.find(o => o.correct).text : String(d.answer); if (!/^\d+\s*[가-힣]{0,2}$/.test(A.trim())) return 0; // 방법·까닭을 고르는 보기는 셈 대조에서 뺌
  ok(want.every(x => x === want[0]), at + ' 그림끼리 값이 다름 ' + want); ok(nsp(A).replace(/[^\d]/g, '') === want[0], at + ' 답 「' + A + '」 ≠ 셈 ' + want[0]); return 1;
}

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 9); });
let holeChecked = 0, eChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 6 && les.meta.n === i + 1 && les.meta.unit_title === '덧셈과 뺄셈(3)'); ok(/^\[2수01-05\] .* · \[2수01-06\] 두 자리 수의 범위에서/.test(les.meta.std), '성취기준 ' + les.meta.std); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u5_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u5_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 8) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/수학이랑 안전/.test(sl[18].data.preview), '다음 단원 예고'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(!selfL.length || sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); if (i > 0) ok(JSON.stringify(sl[16].data.arrows) === JSON.stringify(src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { n += check(it.q, it.a); }); Object.values(sl[11].data.levels).forEach(lv => { n += check(lv.q, lv.a); stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); ok(n >= 4, '셈한 물음 ' + n); eChecked += n; });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + ' ' + f.k, j >= 8 && j <= 10))); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, ''));
    let want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true)); if (!want.length) want = objsWant(d); holeChecked += ansCheck(want, d, p, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(3)', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(3)', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(3)', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음'); ok(eChecked >= 45, '셈 ' + eChecked); });
T('F 빈칸 답 대조한 문제 수', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked >= 15, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u6.js'), 'utf8').split(L.u6_l01.meta.std).join('');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('H 지도서 금지 말 0', () => ['십의 자리', '일의 자리', '자릿값', '받아올림', '받아내림', '첨가', '합병', '제거'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('46 + 11 은 얼마일까요?') === '57' && solve('34 − 12 는 얼마일까요?') === '22' && solve('10개씩 묶음 5개와 낱개 7개인 수는?') === '57', '식·묶음');
  ok(solve('구슬 30개와 14개를 모으면 모두 몇 개일까요?') === '44개' && solve('파란 딱지는 15장, 빨간 딱지는 4장이에요. 파란 딱지가 몇 장 더 많을까요?') === '11장' && solve('책은 38쪽이고 24쪽을 읽었어요. 남은 쪽수는 몇 쪽일까요?') === '14쪽', '이야기'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('46 + 11 은 얼마일까요?', '56'); } catch (_) { e++; }
  try { check('파란 딱지는 26장, 빨간 딱지는 3장이에요. 파란 딱지가 몇 장 더 많을까요?', '29장'); } catch (_) { e++; }
  try { check('3 − 26 은 얼마일까요?', '23'); } catch (_) { e++; }
  try { stepEq('낱개끼리 2 + 5 = 8'); } catch (_) { e++; }
  ok(e === 4, '틀린 답 못 잡음 ' + e);
  ok(josa('46 + 11 는').length === 1 && josa('46 + 11 은').length === 0 && josa('34 − 12 은').length === 1 && josa('20 이에요').length === 0 && josa('22 이에요').length === 1 && josa('3 과 2 를').length === 0 && josa('4 과').length === 1, '조사 역검증');
  let c = 0; const sf = SRC.u6_l03.slides[5].figs; try { figCheck({ k: 'vcalc1', op: '+', rows: [['4', '6'], ['1', '1'], ['5', '8']], hole: [], mode: 'res' }, [Object.assign({}, sf[0], { rows: [['4', '6'], ['1', '1'], ['5', '8']] })], 'x', false); } catch (_) { c++; }
  try { figCheck({ k: 'tops1', em: '🪀', cards: [['59', '-', '23', '33', '1']] }, [{ k: 'tops', cards: [['59', '-', '23', '33', '1']] }], 'x', false); } catch (_) { c++; }
  try { figCheck({ k: 'nbrow1', items: [{ t: 2, o: 1 }, { t: 0, o: 7 }, { t: 2, o: 9 }], ops: ['+', '='] }, [{ k: 'nbrow', nb: ['21', '7', '+', '29'], items: [{ t: 2, o: 1 }, { t: 0, o: 7 }, { t: 2, o: 9 }] }], 'x', false); } catch (_) { c++; }
  ok(c === 3, '그림 역검증 ' + c); });
console.log('gate_g1s2_math_u6: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
