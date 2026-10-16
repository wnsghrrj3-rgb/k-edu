/* gate_g2s2_math_u1.js — 2학년 2학기 수학 1단원 「네 자리 수」 케이티처 2세대 게이트 (138차, 베프).
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2_math u6_l09 → u1_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문 · 개념 글 줄 = 원문 줄·장 제목 · 정리·예고·스스로 점검 줄 = 원문(생성기와 같은 치환 뒤) · 정리 화살표 = 원문 목표(있을 때)
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(일곱 꼴: 「1000이 a개, 100이 b개 …인 수는?」 · 「N에서 ○의 자리 숫자는?」 · 「… 숫자가 나타내는 값은?」
     · 「A부터 S씩 (거꾸로) k번 뛰어 센 수는?」 · 「A보다 S만큼 더 큰 수는?」 · 「A와 B (, C) 중 더/가장 큰·작은 수는?」 · 「N을 읽으면?」(부품 readKo) · 「a + b + … 는 얼마일까요?」 · 돈 「1000원짜리 a장과 100원짜리 b개」)
     + 풀이 steps 안 식(「300 + 7 = 307」·「6980 → 6990」 뛰는 크기 일정)도 다시 셈 + 조사(수 뒤 은/는·이/가·을/를·과/와·이에요/예요)
   F 그림 — bt4 = 원문 수 모형 개수 · pvt = 원문 자리값 표 수(문제 그림은 풀어 쓴 식 없음, 「빨간 테두리」 짚는 자리 = 물음 숫자 자리) · 비교 표 줄 = 원문 수
         · jump = 원문 뛰어 세기(문제 그림은 bare — 뛰는 크기·자리 알림 없음 · 빈칸 = 원문 hole) · notes = 원문 돈(문제 그림 합계 줄 없음) · ngrid 묶음 칸 = 원문 tiles 개수
         · eqt 식 = 원문 식(자릿값 카드 식은 합이 맞는지) · objs1 = 원문 물건 카드 · tools = 원문 이야기 조각
         · 빈칸 답(기본 문제) = 그림에서 다시 낸 값(eqt 「?」 · jump 「?」 하나 · 문제 그림 bt4·tiles 합 「모두 몇 개」)
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(박음·빵꾸·갈아엎·결로·결)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u1.js')), PREV = load(path.join(TDIR, 'data/g2_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u1.json'), 'utf8'));
const FIX = (s) => s.replace(/해결해 볼까요/g, '풀어 볼까요').replace(/연결 모형/g, '블록').replace(/결과는/g, '답은').replace(/결과도/g, '답도').replace(/결과가/g, '답이');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC); // 생성기와 같은 치환
const KEYS = Array.from({ length: 9 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── E 셈 ── */
const PV = { 천: 1000, 백: 100, 십: 10, 일: 1 };
const digitAt = (n, pl) => { const s = String(n), i = s.length - 1 - ['일', '십', '백', '천'].indexOf(pl); ok(i >= 0, n + ' 에 ' + pl + '의 자리 없음'); return +s[i]; };
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^((?:\d+이 \d+개, )*\d+이 \d+개)인 수는\?$/))) { let t = 0; for (const x of m[1].split(', ')) { const [, u, n] = x.match(/^(\d+)이 (\d+)개$/); ok([1, 10, 100, 1000].includes(+u), q + ' 단위'); t += +u * +n; } return String(t); }
  if ((m = q.match(/^(\d+)에서 (천|백|십|일)의 자리 숫자는\?$/))) return String(digitAt(m[1], m[2]));
  if ((m = q.match(/^(\d+)에서 (천|백|십|일)의 자리 숫자가 나타내는 값은\?$/))) return String(digitAt(m[1], m[2]) * PV[m[2]]);
  if ((m = q.match(/^(\d+)부터 (\d+)씩 (거꾸로 )?(\d+)번 뛰어 센 수는\?$/))) { const r = +m[1] + (m[3] ? -1 : 1) * +m[2] * +m[4]; ok(r >= 0 && r <= 9999, q + ' 범위'); return String(r); }
  if ((m = q.match(/^(\d+)보다 (\d+)만큼 더 큰 수는\?$/))) return String(+m[1] + +m[2]);
  if ((m = q.match(/^(\d+)(?:과|와) (\d+) 중 더 (큰|작은) 수는\?$/))) { ok(m[1] !== m[2]); return String(m[3] === '큰' ? Math.max(+m[1], +m[2]) : Math.min(+m[1], +m[2])); }
  if ((m = q.match(/^((?:\d+, )+\d+) 중 가장 (큰|작은) 수는\?$/))) { const ns = m[1].split(', ').map(Number); return String(m[2] === '큰' ? Math.max(...ns) : Math.min(...ns)); }
  if ((m = q.match(/^(\d+)(?:을|를) 읽으면\?$/))) return FIG.readKo(m[1]);
  if ((m = q.match(/^(\d+(?: \+ \d+)+) ?(?:은|는) 얼마일까요\?$/))) return String(m[1].split(' + ').reduce((a, b) => a + +b, 0));
  if ((m = q.match(/^1000원짜리 (\d+)장과 100원짜리 (\d+)개는 모두 얼마일까요\?$/))) return (+m[1] * 1000 + +m[2] * 100) + '원';
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 steps 안 식 — 「a + b (+ …) = c」 · 「a → b → …」 뛰는 크기 일정 */
function stepEq(s) { let n = 0; s = String(s);
  for (const m of s.matchAll(/(\d+(?: \+ \d+)+) = (\d+)/g)) { ok(m[1].split(' + ').reduce((a, b) => a + +b, 0) === +m[2], '풀이 식 ' + m[0]); n++; }
  return n; }
function stepJump(lv) { const m = lv.q.match(/^(\d+)부터 (\d+)씩 (거꾸로 )?(\d+)번/); if (!m) return; const st = (m[3] ? -1 : 1) * +m[2]; let cur = +m[1];
  lv.steps.forEach(x => { const p = x.match(/^(\d+) → (\d+)$/); if (p) { ok(+p[1] === cur && +p[2] === cur + st, '뛰기 풀이 ' + x); cur = +p[2]; } }); }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); if (d === 0) return 1; return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const PLACE = ['일', '십', '백', '천'];
/* 그림 하나 점검 — 문제 그림이면 구할 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, txt) {
  if (f.k === 'bt4') { ok(srcFigs.some(x => x.k === 'pvb' && x.th === f.th && x.h === f.h && x.t === f.t && x.o === f.o), at + ' 원문 수 모형');
    const d = htmlOf(f); ok(d.querySelector('svg.fig-bt4, svg[data-n]') || d.querySelector('svg'), at + ' 렌더'); ok(!/\d/.test((d.body.textContent || '').replace(/\s/g, '')), at + ' 모형 개수·수를 쓰지 않음');
    return prob && /모두 몇|나타내는 수/.test(txt) ? [String(f.th * 1000 + f.h * 100 + f.t * 10 + f.o)] : []; }
  if (f.k === 'pvt') { const rows = (f.rows || [{ v: f.v }]).map(r => String(r.v));
    ok(rows.length === 1 ? srcFigs.some(x => (x.k === 'plt' || x.k === 'vstack') && x.v === rows[0]) || at.indexOf('개념') >= 0 : srcFigs.some(x => x.k === 'pltcmp' && JSON.stringify(x.vs) === JSON.stringify(rows)), at + ' 원문 자리값 표 ' + rows);
    if (prob) { ok(!f.expand && !f.read, at + ' 문제 그림 풀어 쓴 식·읽는 말'); if (f.hi) { const m = String(txt).match(/에서 (\d)(?:는|은|가|이) /); ok(m && PLACE[rows[0].length - 1 - rows[0].indexOf(m[1])] === f.hi, at + ' 짚는 자리 ' + f.hi); } }
    const d = htmlOf(f); ok(d.querySelector('.fig-pvt').getAttribute('data-vals') === rows.join(','), at + ' 렌더');
    if (f.expand) ok(d.querySelector('.pv-eq').textContent.replace(/\s/g, '').split('=')[1].split('+').reduce((a, b) => a + +b, 0) === +rows[0], at + ' 풀어 쓴 식 합');
    return []; }
  if (f.k === 'jump') { const gs = srcFigs.filter(x => x.k === 'jl' && x.start === f.start && x.step === f.step && x.n === f.n), g = gs.find(x => JSON.stringify(x.hole || []) === JSON.stringify(f.q || [])) || gs[0]; ok(g, at + ' 원문 뛰어 세기 ' + f.start + '/' + f.step);
    ok(JSON.stringify(f.q || []) === JSON.stringify(g.hole || []), at + ' 빈칸 = 원문 hole'); ok(!!f.bare === !!prob, at + ' 문제 그림 bare');
    const d = htmlOf(f), tx = d.body.textContent; if (prob) { ok(!/[+−]\d/.test(tx) && !d.querySelector('.jp-key'), at + ' 문제 그림에 뛰는 크기'); }
    const seq = Array.from({ length: f.n }, (_, i) => f.start + f.step * i); ok(seq.every(v => v >= 0 && v <= 9999), at + ' 범위');
    ok(d.querySelectorAll('.jp-b.q').length === (f.q || []).length, at + ' 「?」 칸 수');
    return prob && (f.q || []).length === 1 ? [String(seq[f.q[0]])] : []; }
  if (f.k === 'notes') { const g = srcFigs.find(x => x.k === 'money' && JSON.stringify([[1000, x.th], [100, x.h], [10, x.t], [1, x.o]].filter(y => y[1] > 0).map(([v, n]) => ({ v, n }))) === JSON.stringify(f.items)); ok(g, at + ' 원문 돈');
    if (prob) ok(f.total === false && !/모두/.test(htmlOf(f).body.textContent), at + ' 문제 그림 합계 줄'); return []; }
  if (f.k === 'ngrid') { const flat = [].concat(...f.rows).map(c => (c && typeof c === 'object' ? c.v : c));
    if (flat.every(v => /^(1000|100|10|1)$/.test(v))) { const cnt = (u) => flat.filter(v => v === u).length; ok(srcFigs.some(x => x.k === 'tiles' && x.th === cnt('1000') && x.h === cnt('100') && x.t === cnt('10') && x.o === cnt('1')), at + ' 원문 묶음 칸'); return prob && /모두 몇/.test(txt) ? [String(flat.reduce((a, b) => a + +b, 0))] : []; }
    return []; }
  if (f.k === 'eqt') { const want = []; f.rows.forEach(r => { const t = r.toks.map(String);
      const src = srcFigs.find(x => x.k === 'eqt' && JSON.stringify(x.toks) === JSON.stringify(t)), vc = srcFigs.find(x => x.k === 'vcards' && t[t.length - 1] === x.v && JSON.stringify(t.filter(y => /^\d+$/.test(y)).slice(0, -1)) === JSON.stringify(x.parts));
      ok(src || vc, at + ' 원문 식 ' + t.join(' '));
      const eqI = t.indexOf('='); if (eqI > 0 && t.every(y => /^(\d+|\+|=|\?)$/.test(y))) { const L = t.slice(0, eqI), R = t.slice(eqI + 1); const qs = L.concat(R).filter(y => y === '?').length;
        const sum = (a) => a.filter(y => /^\d+$/.test(y)).reduce((p, y) => p + +y, 0);
        if (!qs) ok(sum(L) === sum(R), at + ' 식 ' + t.join(' ')); else if (qs === 1) want.push(String(Math.abs(sum(L) - sum(R)))); }
      if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); }); return prob ? want : []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && JSON.stringify(x.items) === JSON.stringify(f.items)), at + ' 원문 물건 카드'); return []; }
  if (f.k === 'tools') { ok(srcFigs.some(x => x.k === 'story' && JSON.stringify(x.items.map(i => [i.y + '년', i.t])) === JSON.stringify(f.items.map(i => [i.name, i.kind]))), at + ' 원문 이야기 조각'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length) return 0; const A = d.options ? d.options.find(o => o.correct).text : String(d.answer); if (!/^\d+\s*[가-힣]{0,2}$/.test(A.trim())) return 0;
  ok(want.every(x => x === want[0]), at + ' 그림끼리 값이 다름 ' + want); ok(nsp(A).replace(/[^\d]/g, '') === want[0], at + ' 답 「' + A + '」 ≠ 셈 ' + want[0]); return 1;
}

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 9); });
let holeChecked = 0, eChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 1 && les.meta.n === i + 1 && les.meta.unit_title === '네 자리 수'); ok(/^\[2수01-02\] .* · \[2수01-03\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2_math:u6_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 8) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/곱셈구구/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(JSON.stringify(sl[16].data.arrows) === JSON.stringify(src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); n += c; }); Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); n += c; stepEq(lv.steps.join(' | ')); stepJump(lv); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); eChecked += n; });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => { const prob = j >= 8 && j <= 10, tx = prob ? (s.data.scenario.body + ' ' + s.data.question + ' ') : ''; figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + (j >= 3 && j <= 6 ? ' 개념' : '') + ' ' + f.k, prob, tx)); }); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, tx = d.scenario.body + ' ' + d.question + ' ';
    const want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true, tx)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '네 자리 수', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '네 자리 수', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); ok(s.data.fig, 'concept s' + (j + 4) + ' 그림 없음'); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '네 자리 수', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음'); ok(eChecked === 54, '셈 ' + eChecked); });
T('F 빈칸 답 대조한 문제 수', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked >= 6, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u1.js'), 'utf8');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('1000이 5개, 100이 0개, 10이 4개, 1이 7개인 수는?') === '5047' && solve('8305에서 천의 자리 숫자가 나타내는 값은?') === '8000' && solve('307에서 십의 자리 숫자는?') === '0', '쓰기·자리');
  ok(solve('6980부터 10씩 3번 뛰어 센 수는?') === '7010' && solve('8305부터 1000씩 거꾸로 3번 뛰어 센 수는?') === '5305' && solve('2999와 3001 중 더 큰 수는?') === '3001' && solve('8264, 8246, 8462 중 가장 작은 수는?') === '8246', '뛰기·비교');
  ok(solve('5708을 읽으면?') === '오천칠백팔' && solve('3027을 읽으면?') === '삼천이십칠' && solve('1000을 읽으면?') === '천' && solve('7000 + 80 은 얼마일까요?') === '7080', '읽기·합'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('5708을 읽으면?', '오천칠백영팔'); } catch (_) { e++; }
  try { check('3990부터 10씩 1번 뛰어 센 수는?', '39100'); } catch (_) { e++; }
  try { check('1999와 2005 중 더 큰 수는?', '1999'); } catch (_) { e++; }
  try { check('5591에서 백의 자리 숫자가 나타내는 값은?', '5'); } catch (_) { e++; }
  try { stepEq('300 + 7 = 370'); } catch (_) { e++; }
  try { stepJump({ q: '6980부터 10씩 3번 뛰어 센 수는?', steps: ['6980 → 6990', '6990 → 6100'] }); } catch (_) { e++; }
  ok(e === 6, '틀린 답 못 잡음 ' + e);
  ok(josa('1000 을').length === 0 && josa('1000 를').length === 1 && josa('425 는').length === 0 && josa('3027 는').length === 1, '조사 역검증');
  const sf = SRC.u1_l06.problems[1].figs; let c = 0;
  try { figCheck({ k: 'jump', start: 9200, step: 100, n: 4 }, sf, 'x', true, ''); } catch (_) { c++; } // 문제 그림인데 bare 아님
  try { figCheck({ k: 'bt4', th: 1, h: 5, t: 3, o: 6 }, [{ k: 'pvb', th: 1, h: 5, t: 3, o: 5 }], 'x', false, ''); } catch (_) { c++; }
  try { figCheck({ k: 'notes', items: [{ v: 100, n: 9 }] }, [{ k: 'money', th: 0, h: 9, t: 0, o: 0 }], 'x', true, ''); } catch (_) { c++; } // 문제 그림 합계 줄
  try { figCheck({ k: 'pvt', v: '5836', expand: true }, [{ k: 'plt', v: '5836' }], 'x', true, ''); } catch (_) { c++; }
  ok(c === 4, '그림 역검증 ' + c); });
console.log('gate_g2s2_math_u1: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
