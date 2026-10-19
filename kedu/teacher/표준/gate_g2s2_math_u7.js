/* gate_g2s2_math_u7.js — 2학년 2학기 수학 7단원 「수학이랑 함께해요」(바른 식습관 프로젝트) 케이티처 2세대 게이트 (146차, 베프). u6 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u6_l09 → u7_l01 → … → l04)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(「~하면」꼴 물음은 생성기 QOVR) · 개념 글 줄 = 원문 문장 · 정리·예고·스스로 점검 = 원문(l04 예고는 2학기 마침)
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈: N점씩 M번(곱셈구구 범위) · ◯ M번 × 점수 · 날짜 세기(첫날 포함) · 카드 N장 × cm
     · 두 항목 합·차 · 모두 더하면 · 가장 많은 것 · 되풀이 n번째·다음 카드 · 같은 수 덧셈 → 곱셈식 + 풀이 식 · 수 뒤 조사
   F 그림 — 원문 그림 그대로(부품 잇기) · tbl2 합계 = 항목 합 · cg2 칸 수 = 같은 차시 표 값(빈 줄 빼고) · rtb2 ◯ 줄 같은 점수·× 줄 0점·모은 점수 = 합
         · pcrw2 식습관 되풀이 묶음 · pcd2 점수 2~9 · pln2 기간 날짜 · clk1 시각 = 꼬리표
         · 원문 그림 없는 개념 장(T.figs)은 nstr2 같은 점수 띠(「N점씩 M번」이면 N 이 M 칸) · objs1 · chain 만
         · 기본·심화 문제 답 = 그림(또는 원문 문제 글)에서 다시 낸 값
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u7.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u7.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u7.json'), 'utf8'));
const QOVR = {
  '수찬이가 2번 실천하면': '수찬이가 2번 실천하면 모두 몇 점일까요?', '연우가 3번 실천하면': '연우가 3번 실천하면 모두 몇 점일까요?',
  '지아가 4번 실천하면': '지아가 4번 실천하면 모두 몇 점일까요?', '세미가 6번 실천하면': '세미가 6번 실천하면 모두 몇 점일까요?',
  '8점씩 5번을 모으면': '8점씩 5번을 모으면 모두 몇 점일까요?', '슬기의 점수는?': '슬기의 점수는 모두 몇 점일까요?',
  '재이의 실천 기록': '재이가 모은 점수는 모두 몇 점일까요?', '수찬이의 실천 기록': '수찬이가 모은 점수는 모두 몇 점일까요?',
  '카드 6장을 이으면': '카드 6장을 이으면 모두 몇 cm일까요?', '카드 9장을 걸려면': '카드 9장을 이으면 모두 몇 cm일까요?',
  '◯를 몇 개 그릴까요?': '「음식 골고루 먹기」 줄에 ◯를 몇 개 그려야 할까요?', '조사에 참여한 학생은 모두 몇 명?': '조사에 참여한 학생은 모두 몇 명일까요?',
  '가장 많은 학생이 생각한 바른 식습관은?': '가장 많은 학생이 생각한 바른 식습관은 무엇일까요?', '두 번째로 많은 것은?': '두 번째로 많은 학생이 생각한 식습관은 무엇일까요?',
  '빈자리에 올 카드는?': '빈자리에 올 카드는 무엇일까요?', '점수를 정하는 방법': '점수를 정하는 바른 방법은 무엇일까요?'
};
const N = 4, KEYS = Array.from({ length: N }, (_, i) => 'u7_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const FMT = ['준비해요', '계획해요', '해 봐요', '마무리해요'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 되풀이 ── */
function periodOf(seq) { const n = seq.length; for (let p = 1; p < n; p++) { let good = true; for (let i = p; i < n && good; i++) { const a = seq[i], b = seq[i - p]; if (a != null && b != null && a !== b) good = false; } if (good) { for (let r = 0; r < p; r++) if (!seq.some((x, i) => i % p === r && x != null)) good = false; if (good) return p; } } return null; }
const atP = (seq, p, i) => seq.find((x, j) => j % p === i % p && x != null);
/* ── 셈 ── */
const mul9 = (a, b, q) => { ok(a >= 2 && a <= 10 && b >= 1 && b <= 9, '곱셈구구 범위 밖 ' + q); return a * b; };
const days = (a, b, q) => { ok(b >= a, '날짜 차례 ' + q); return b - a + 1; };
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^(?:[가-힣]+(?:이|가) )?(\d+)점씩 (\d+)번(?:을)? (?:실천하면|모으면) 모두 몇 점일까요\?$/))) { ok(+m[1] >= 2 && +m[1] <= 9, '점수 2~9 ' + q); return mul9(+m[1], +m[2], q) + '점'; }
  if ((m = q.match(/^(\d+)점씩 주기로 했는데 ◯가 (\d+)번, ×가 (\d+)번이에요\. 모은 점수는 모두 몇 점일까요\?$/))) return mul9(+m[1], +m[2], q) + '점';
  if ((m = q.match(/^(\d+)월 (\d+)일부터 (\d+)월 (\d+)일까지 날마다 실천하면 모두 며칠일까요\?$/))) { ok(m[1] === m[3], '같은 달 ' + q); return days(+m[2], +m[4], q) + '일'; }
  if ((m = q.match(/^((?:\d+ \+ )+\d+) ?을 곱셈식으로 나타내면 무엇일까요\?$/))) { const t = m[1].split(' + '); ok(t.every(x => x === t[0]), '같은 수 덧셈 ' + q); return t[0] + ' × ' + t.length; }
  if ((m = q.match(/^카드 한 장이 (\d+) cm예요\. 카드 (\d+)장을 이으면 모두 몇 cm일까요\?$/))) return mul9(+m[1], +m[2], q) + ' cm';
  if ((m = q.match(/^(.+) 카드가 차례로 되풀이돼요\. (\d+)번째에 올 카드는 무엇일까요\?$/))) { const t = m[1].split(', '); return t[(+m[2] - 1) % t.length]; }
  if ((m = q.match(/^(.+) 다음에 올 카드는 무엇일까요\?$/))) { const t = m[1].split(', '), p = periodOf(t); ok(p && t.length >= p + 2, '되풀이 ' + q); return atP(t, p, t.length); }
  if ((m = q.match(/^(.+)는 (\d+)명, (.+)는 (\d+)명이에요\. (?:두 식습관(?:을 생각한 학생)?은 모두 몇 명일까요|(.+)는 (.+)보다 몇 명 더 많을까요)\?$/))) {
    if (!m[5]) return (+m[2] + +m[4]) + '명';
    const big = [[m[1], +m[2]], [m[3], +m[4]]].find(x => x[0].indexOf(m[5]) >= 0), small = [[m[1], +m[2]], [m[3], +m[4]]].find(x => x[0].indexOf(m[6]) >= 0);
    ok(big && small && big !== small && big[1] > small[1], '더 많은 쪽 ' + q); return (big[1] - small[1]) + '명'; }
  if ((m = q.match(/^((?:\d+명, )+\d+명)을 모두 더하면 몇 명일까요\?$/))) return m[1].split(', ').reduce((a, x) => a + parseInt(x, 10), 0) + '명';
  if ((m = q.match(/^◯가 (.+)예요\. 가장 많은 식습관은 무엇일까요\?$/))) { const t = m[1].split(', ').map(x => { const k = x.match(/^(.+) (\d+)개$/); ok(k, '꼴 ' + x); return [k[1], +k[2]]; }); const mx = Math.max(...t.map(x => x[1])); ok(t.filter(x => x[1] === mx).length === 1, '가장 많은 것 하나 ' + q); return t.find(x => x[1] === mx)[0]; }
  if (q === '분류하기 어려운 카드는 어디로 모을까요?') { ok(/「기타」\*\*로 모아요/.test(SRC.u7_l01.slides[4].text), '원문 「기타」'); return '기타'; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
function numExpr(e) { e = String(e).replace(/\s+/g, '').replace(/-/g, '−'); if (!/^\d+([×+−]\d+)*$/.test(e)) return null; return e.split(/(?=[+−])/).reduce((acc, t) => { const sg = t[0] === '−' ? -1 : 1; return acc + sg * t.replace(/^[+−]/, '').split('×').reduce((a, b) => a * +b, 1); }, 0); }
function stepEq(s) { let n = 0; String(s).split(' | ').forEach(st => { const sides = st.split(' = '); if (sides.length < 2) return; const v = sides.map(numExpr); if (v.some(x => x == null)) return; ok(v.every(x => x === v[0]), '풀이 식 ' + st); n++; }); return n; }
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

/* ── 그림 ── */
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const PK = { tbl: 'tbl2', graph: 'cg2', plan: 'pln2', pcard: 'pcd2', pcrow: 'pcrw2', rtab: 'rtb2', clock: 'clk1', hcard: 'objs1' };
const card = (c) => c ? { name: c.name, habit: c.habit, score: c.score, emoji: c.emoji } : null;
/* 원문 그림 → 부품이 지녀야 할 값(생성기와 따로 적음) */
function want(f) {
  if (f.k === 'tbl') return { title: f.title, head: f.head, cats: f.cats, vals: f.vals, total: f.total, total_hole: f.total_hole || undefined, holes: f.holes && f.holes.length ? f.holes : undefined };
  if (f.k === 'graph') return { title: f.title, sym: f.sym, vert: f.vert, cats: f.cats, max: f.max, grid: f.grid, ax: f.ax, holes: f.holes && f.holes.length ? f.holes : undefined, odd: f.odd || undefined };
  if (f.k === 'plan') return { rows: f.rows };
  if (f.k === 'pcard') return card(f);
  if (f.k === 'pcrow') return { cards: f.cards.map(card), cm: f.cm || undefined };
  if (f.k === 'rtab') return { title: f.title || undefined, rows: f.rows, sum: f.sum };
  if (f.k === 'clock') return { h: f.h, m: f.m, tag: f.tag || undefined };
  if (f.k === 'hcard') return { items: f.items.map(i => ({ emoji: i.emoji, name: i.name + (i.sub ? '\n' + i.sub : '') })) };
  return null;
}
function srcMatch(f, pool) { return pool.find(x => { if (PK[x.k] !== f.k) return false; const wv = want(x); return Object.keys(wv).every(key => wv[key] === undefined ? f[key] === undefined || f[key] === null || f[key] === false : same(wv[key], f[key])); }); }
const lessonTbl = (src, cats) => src.slides.concat(src.problems).flatMap(x => x.figs || []).find(f => f.k === 'tbl' && same(f.cats, cats) && f.vals.every(v => v != null));
const rank = (cats, vals, i) => { const o = cats.map((c, j) => [c, vals[j]]).sort((a, b) => b[1] - a[1]); ok(o[i] && (!o[i + 1] || o[i][1] > o[i + 1][1]) && (!i || o[i - 1][1] > o[i][1]), '순위 ' + i + ' 겹침'); return o[i][0]; };
/* 그림 하나 점검 — prob 이면 그림에서 다시 낸 답({n} 또는 {o: 정답 보기 글})을 돌려준다 */
function figCheck(f, pool, at, src, prob, q) {
  const sf = srcMatch(f, pool); ok(sf, at + ' 원문 그림과 다름 ' + f.k);
  const out = [], el = () => htmlOf(f);
  if (f.k === 'tbl2') { const d = el().querySelector('svg[data-tbl]'); ok(d, at + ' 렌더'); ok(f.total == null || f.total === f.vals.reduce((a, b) => a + b, 0), at + ' 합계 = 항목 합');
    ok(d.getAttribute('data-tbl').split('|')[0].split(';').length === f.cats.length, at + ' 렌더 칸 수');
    if (prob) { const hs = f.holes || []; if (hs.length === 1 && /몇 명/.test(q)) { ok(q.indexOf(f.cats[hs[0]].replace(/^식사 (전|후) /, '')) >= 0, at + ' 물음 항목 ≠ 빈칸'); out.push({ n: f.vals[hs[0]] }); } else if (f.total_hole && /모두 몇 명/.test(q)) out.push({ n: f.total }); } }
  if (f.k === 'cg2') { const d = el().querySelector('svg[data-graph]'); ok(d, at + ' 렌더'); ok(f.grid.length === f.cats.length && f.grid.every(g => g.length === f.max), at + ' 칸 꼴');
    ok(f.grid.every(g => /^1*0*$/.test(g)), at + ' ◯ 아래부터 빈틈없이'); const cnt = f.grid.map(g => g.split('').filter(x => x === '1').length);
    const t = lessonTbl(src, f.cats); ok(t, at + ' 같은 차시 표 없음'); const empty = cnt.map((c, i) => c === 0 && t.vals[i] > 0);
    cnt.forEach((c, i) => ok(empty[i] || c === t.vals[i], at + ' ' + f.cats[i] + ' ◯ ' + c + ' ≠ 표 ' + t.vals[i])); ok(Math.max(...t.vals) <= f.max, at + ' 눈금');
    ok(d.getAttribute('data-graph') === f.cats.map((c, i) => c + ':' + cnt[i]).join(';'), at + ' 렌더 수');
    if (prob) { if (/가장 많은/.test(q)) out.push({ o: rank(f.cats, t.vals, 0) }); else if (/두 번째로 많은/.test(q)) out.push({ o: rank(f.cats, t.vals, 1) });
      else if (/◯를 몇 개/.test(q)) { const i = empty.indexOf(true); ok(i >= 0 && empty.filter(Boolean).length === 1 && q.indexOf(f.cats[i]) >= 0, at + ' 빈 줄 = 물음 항목'); out.push({ n: t.vals[i] }); } } }
  if (f.k === 'pln2') { ok(el().querySelector('svg[data-plan]'), at + ' 렌더'); f.rows.forEach(r => { for (const m of r[1].matchAll(/(\d+)월 (\d+)일 ~ (\d+)월 (\d+)일/g)) ok(m[1] === m[3] && +m[4] > +m[2] && +m[4] <= 31, at + ' 기간 ' + m[0]); });
    if (f.head) ok(f.rows[0][0] === '바른 식습관' && same(f.rows.slice(1).map(r => r[0]), ['언제', '어디에서', '어떻게']), at + ' 계획표 머리'); }
  if (f.k === 'pcd2') { const d = el().querySelector('svg[data-pcard]'); ok(d && d.getAttribute('data-pcard') === [f.name, f.habit, f.score].join('|'), at + ' 렌더'); ok(f.score >= 2 && f.score <= 9, at + ' 점수 2~9');
    if (prob) { const m = q.match(/^([가-힣]+)(?:이가|가) (\d+)번 실천하면 모두 몇 점일까요\?$/); ok(m && f.name.indexOf(m[1].replace(/이$/, '')) === 0, at + ' 물음 이름 ' + q); out.push({ n: mul9(f.score, +m[2], q) }); } }
  if (f.k === 'pcrw2') { const d = el().querySelector('svg[data-pcrow]'); ok(d, at + ' 렌더'); const hb = f.cards.map(c => c && c.habit); ok(d.getAttribute('data-pcrow') === hb.map(x => x || '?').join(','), at + ' 렌더 차례');
    const p = periodOf(hb); ok(p && p <= hb.length - 2, at + ' 식습관 되풀이 묶음 없음'); f.cards.forEach(c => c && ok(c.score >= 2 && c.score <= 9, at + ' 점수 2~9'));
    if (prob) { const h = hb.indexOf(null); if (h >= 0 && /빈자리/.test(q)) out.push({ o: atP(hb, p, h) });
      else if (/카드 (\d+)장을 이으면/.test(q)) { ok(f.cm, at + ' cm 없음'); const n = +q.match(/카드 (\d+)장/)[1]; ok(n === f.cards.length || n > f.cards.length, at + ' 카드 수'); out.push({ n: mul9(f.cm, n, q) }); }
      else if (/규칙/.test(q)) out.push({ o: (t) => /되풀이/.test(t) && hb.slice(0, p).every(x => t.indexOf(x.split(' ').pop().replace(/^손$/, '손 씻기')) >= 0 || t.indexOf(x) >= 0 || t.indexOf(x.replace(/^(식사 (전|후)|음식) /, '')) >= 0) }); } }
  if (f.k === 'rtb2') { const d = el().querySelector('svg[data-rtab]'); ok(d, at + ' 렌더'); ok(d.getAttribute('data-rtab').split('|')[1] === '?', at + ' 모은 점수 「?」');
    const on = f.rows.filter(r => r[1] === '◯'), off = f.rows.filter(r => r[1] === '×'); ok(on.length + off.length === f.rows.length, at + ' ◯·× 말고 다른 표시');
    ok(on.length && on.every(r => r[2] === on[0][2]) && on[0][2] >= 2 && on[0][2] <= 9, at + ' ◯ 줄 같은 점수 2~9'); ok(off.every(r => r[2] === 0), at + ' × 줄 0점');
    ok(f.sum === on.length * on[0][2] && f.sum === f.rows.reduce((a, r) => a + r[2], 0), at + ' 모은 점수 = ◯ 수 × 점수');
    const dd = f.rows.map(r => +r[0].match(/(\d+)일$/)[1]); ok(dd.every((x, i) => !i || x === dd[i - 1] + 1), at + ' 날짜 하루씩');
    if (prob) { if (/◯는 몇 번/.test(q)) out.push({ n: on.length }); else if (/모은 점수/.test(q)) out.push({ n: f.sum }); } }
  if (f.k === 'clk1') { ok(FIG.render(f).length > 100, at + ' 렌더'); ok(f.m === 0 && (!/점심/.test(f.tag || '') || f.h === 12), at + ' 시각 = 꼬리표 ' + f.tag); }
  if (f.k === 'objs1') ok(same(want(sf).items, f.items), at + ' 원문 카드');
  return out;
}
function ansCheck(wants, d, at) {
  if (!wants.length) return 0; ok(wants.length === 1, at + ' 그림 답 둘 이상'); const w0 = wants[0];
  if (w0.n != null) { ok(!d.options && +d.answer === w0.n, at + ' 답 ' + d.answer + ' ≠ ' + w0.n); return 1; }
  const opts = d.options, ci = opts.findIndex(o => o.correct); ok(ci >= 0, at + ' 정답 없음'); const hit = (t) => typeof w0.o === 'function' ? w0.o(t) : t === w0.o;
  ok(hit(opts[ci].text.replace(/\*\*/g, '')), at + ' 정답 「' + opts[ci].text + '」 ≠ 그림'); ok(opts.filter((o, i) => i !== ci && hit(o.text.replace(/\*\*/g, ''))).length === 0, at + ' 다른 보기도 맞음'); return 1;
}
/* 그림 없는 원문 문제 — 원문 문제 글(prompt)과 물음에서 다시 셈 */
function promptAns(p, q) { const pr = String(p.prompt || '').replace(/\*\*/g, ''); let m;
  if ((m = pr.match(/(\d+)월 (\d+)일부터 (\d+)월 (\d+)일까지/)) && /며칠/.test(q)) return { n: days(+m[2], +m[4], q) };
  if ((m = pr.match(/(\d+)점씩 (\d+)번/)) && /몇 점/.test(q)) return { n: mul9(+m[1], +m[2], q) };
  if ((m = q.match(/^(\d+)점씩 (\d+)번을 모으면 모두 몇 점일까요\?$/))) return { o: (t) => t === mul9(+m[1], +m[2], q) + '점' };
  if (/점수를 정하는/.test(q)) return { o: (t) => /같은 점수/.test(t) };
  return null; }
const srcProb = (src, d) => src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : String(d.answer) === String(p.a)));

T('A 로드 4차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === N); });
let eChecked = 0, stepChecked = 0, holeChecked = 0, advChecked = 0, tfigChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 7 && les.meta.n === i + 1 && les.meta.unit_title === '수학이랑 함께해요'); ok(/^\[2수01-11\] .* · \[2수04-01\] .* · \[2수02-02\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url);
    ok(les.meta.lesson_format === '수학이랑 프로젝트 ' + FMT[i] + ' · 2세대 19장(7요소)', 'lesson_format ' + les.meta.lesson_format); ok(les.meta.duration_min === 40); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u6_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = srcProb(src, d); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); else { ok(d.input === 'count_input' && d.unit === (p.unit || undefined), '단위 ' + d.unit); ok(/몇|얼마|며칠/.test(d.question), '수 답 물음에 「몇/얼마/며칠」 없음 ' + d.question); }
    ok(['pad', 'mcq'].includes(p.part)); ok(/[?]$/.test(d.question) || !d.options, '물음 꼴 ' + d.question); }); });
  T(k + ' D 개념 글 = 원문 문장', () => { const titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => { const si = titles.indexOf(nsp(s.data.title)); ok(si >= 0, '원문에 없는 장 제목 ' + s.data.title); const lines = src.slides[si].text.split('\n').map(nsp);
    const cl = s.data.content.split('\n'); ok(cl.length <= 4, '글 줄 ' + cl.length); cl.forEach(line => ok(lines.includes(nsp(line)), '원문에 없는 줄: ' + line)); }); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < N - 1) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(sl[18].data.title === '2학기를 마쳤어요' && /2학년 2학기 수학/.test(sl[18].data.preview) && /모두 마쳤어요/.test(src.next), '2학기 마침');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); });
  T(k + ' E 출구·수준별 재계산', () => { sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); eChecked += c; }); ok(sl[15].data.items.length === 3, '출구 셋');
    Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); eChecked += c; stepChecked += stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).indexOf(nsp(lv.a)) >= 0, '풀이 끝 = 답 ' + lv.q); }); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.context, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 개념 장 그림', () => { sl.slice(3, 7).forEach((s, j) => { const ss = src.slides.find(x => nsp(x.title) === nsp(s.data.title)), pool = ss.figs || []; ok(s.data.fig, 's' + (j + 4) + ' 그림 없음');
    const fs2 = figsOf(s.data.fig);
    if (pool.length) { ok(fs2.length === pool.length, 's' + (j + 4) + ' 그림 수 ' + fs2.length + ' ≠ ' + pool.length); fs2.forEach(f => figCheck(f, pool, 's' + (j + 4) + ' 개념 ' + f.k, src, false)); return; }
    /* 원문 장에 그림 없음 → T.figs */
    ok(fs2.length === 1 && ['nstr2', 'objs1', 'chain'].includes(fs2[0].k), 's' + (j + 4) + ' T.figs 꼴 ' + fs2[0].k); const f = fs2[0]; ok(FIG.render(f).length > 100, 's' + (j + 4) + ' 렌더');
    if (f.k === 'nstr2') { ok(f.vals.length >= 3 && f.vals.every(v => v === f.vals[0]) && f.vals[0] >= 2 && f.vals[0] <= 9, 's' + (j + 4) + ' 같은 점수 띠'); const m = (f.lab || '').match(/(\d+)점씩 (\d+)번 → \1 × \2/); if (m) ok(+m[1] === f.vals[0] && +m[2] === f.vals.length, 's' + (j + 4) + ' 띠 ≠ ' + f.lab);
      const cm = nsp(s.data.content).match(/(\d+)×(\d+)=(\d+)/); if (cm) ok(+cm[1] === f.vals[0] && +cm[2] === f.vals.length, 's' + (j + 4) + ' 띠 ≠ 글 식'); }
    if (f.k === 'chain') f.items.forEach(it => ok(nsp(s.data.content).indexOf(nsp(it.name).replace(/^반찬을/, '')) >= 0 || nsp(s.data.content).indexOf(nsp(it.name)) >= 0 || /가리지않고/.test(nsp(it.name)), 's' + (j + 4) + ' 고리 ≠ 글 ' + it.name));
    if (f.k === 'objs1') f.items.forEach(it => { const nm = it.name.split('\n')[0]; ok(/^[가-힣]{2,3}$/.test(nm) ? nsp(s.data.content).indexOf(nm) >= 0 : nsp(s.data.content).indexOf(nsp(nm).slice(0, 2)) >= 0 || /곱셈구구/.test(nsp(it.name)), 's' + (j + 4) + ' 카드 ≠ 글 ' + nm); });
    tfigChecked++; }); });
  T(k + ' F 기본 문제 답 = 그림·원문 글에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, p = srcProb(src, d), pool = (p && p.figs) || [], at = k + ' s' + (j + 9) + ' ' + d.question;
    if (!pool.length) { ok(!d.fig, at + ' 원문 문제에 없는 그림'); const pa = promptAns(p, d.question); ok(pa, at + ' 다시 낼 길 없음'); holeChecked += ansCheck([pa], d, at); return; }
    ok(figsOf(d.fig).length === pool.length, at + ' 그림 수'); const wv = figsOf(d.fig).flatMap(f => figCheck(f, pool, at + ' ' + f.k, src, true, d.question)); const c0 = ansCheck(wv, d, at); ok(c0, at + ' 그림 답 없음'); holeChecked += c0; }); });
  T(k + ' F 심화 문제 답 = 원문 그림·글에서 다시 낸 값', () => { const d = sl[14].data, p = src.problems.find(x => nsp(d.challenge).indexOf(nsp(QOVR[x.q] || x.q)) === 0); ok(p, '원문 응용 문제 없음 ' + d.challenge); const q = QOVR[p.q] || p.q, ans = p.opts ? p.opts[p.ci] : p.a + (p.unit ? ' ' + p.unit : '');
    ok(nsp(d.note).endsWith(nsp(ans)), '심화 풀이 끝 = 원문 답'); const opts = p.opts ? p.opts.map((t, x) => ({ text: t, correct: x === p.ci })) : null, dd = { answer: p.a, options: opts };
    let wv = (p.figs || []).flatMap(f => { const g = Object.assign(JSON.parse(JSON.stringify(want(f))), { k: PK[f.k] }); Object.keys(g).forEach(x => g[x] === undefined && delete g[x]); return figCheck(g, [f], '심화 ' + g.k, src, true, q); });
    if (!wv.length) { const pa = promptAns(p, q); ok(pa, '심화 다시 낼 길 없음 ' + q); wv = [pa]; } advChecked += ansCheck(wv, dd, '심화 ' + q);
    /* 교사 층 상황 글이 원문 그림과 맞음 */
    (p.figs || []).forEach(f => { if (f.k === 'rtab') { const x = f.rows.filter(r => r[1] === '×').map(r => r[0]); ok(x.every(t => d.context.indexOf(t) >= 0), '심화 글에 × 날 없음 ' + x); ok(d.context.indexOf(f.rows[0][0] + '부터 ' + f.rows[f.rows.length - 1][0] + '까지') >= 0, '심화 글 기간'); ok(d.context.indexOf(f.rows.find(r => r[1] === '◯')[2] + '점') >= 0, '심화 글 점수'); }
      if (f.k === 'graph') { const t = lessonTbl(src, f.cats), e = f.grid.findIndex(g => !/1/.test(g)); ok(d.context.indexOf(f.cats[e]) >= 0 && d.context.indexOf(t.vals[e] + '명') >= 0, '심화 글 빈 줄·표 수'); }
      if (f.k === 'pcrow') ok(d.context.indexOf(f.cm + ' cm') >= 0, '심화 글 cm'); }); });
  T(k + ' F 원문 그림 전부 = 규칙', () => { srcFigs.forEach((f, j) => { ok(PK[f.k], '모르는 원문 그림 ' + f.k); const g = Object.assign(JSON.parse(JSON.stringify(want(f))), { k: PK[f.k] }); Object.keys(g).forEach(x => g[x] === undefined && delete g[x]); figCheck(g, [f], 'src#' + j + ' ' + g.k, src, false); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '수학이랑 함께해요', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '수학이랑 함께해요', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '수학이랑 함께해요', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const EXP = { e: 24, hole: 12, adv: 4, tfig: 5 };
console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 풀이 식 ' + stepChecked + ' · 기본 문제 답 ' + holeChecked + ' · 심화 답 ' + advChecked + ' · 원문 그림 없는 개념 장 ' + tfigChecked);
T('E·F 셈·대조 수', () => { ok(eChecked === EXP.e, '셈 ' + eChecked); ok(holeChecked === EXP.hole, '기본 ' + holeChecked); ok(advChecked === EXP.adv, '심화 ' + advChecked); ok(tfigChecked === EXP.tfig, 'T.figs ' + tfigChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u7.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('5점씩 2번 실천하면 모두 몇 점일까요?') === '10점' && solve('세미가 5점씩 6번 실천하면 모두 몇 점일까요?') === '30점' && solve('8점씩 5번을 모으면 모두 몇 점일까요?') === '40점', '점수');
  ok(solve('12월 26일부터 12월 30일까지 날마다 실천하면 모두 며칠일까요?') === '5일' && solve('8 + 8 + 8 을 곱셈식으로 나타내면 무엇일까요?') === '8 × 3', '날짜·곱셈식');
  ok(solve('음식, 손 씻기, 이 닦기 카드가 차례로 되풀이돼요. 7번째에 올 카드는 무엇일까요?') === '음식' && solve('음식, 손 씻기, 이 닦기, 음식, 손 씻기 다음에 올 카드는 무엇일까요?') === '이 닦기', '되풀이');
  ok(solve('꼭꼭 씹어 먹기는 2명, 식사 후 이 닦기는 3명이에요. 이 닦기는 씹어 먹기보다 몇 명 더 많을까요?') === '1명', '차'); });
T('역검증 셈·조사·그림', () => { let e = 0;
  const bad = [['5점씩 2번 실천하면 모두 몇 점일까요?', '7점'], ['12월 26일부터 12월 30일까지 날마다 실천하면 모두 며칠일까요?', '4일'], ['7점씩 주기로 했는데 ◯가 5번, ×가 2번이에요. 모은 점수는 모두 몇 점일까요?', '49점'],
    ['카드 한 장이 10 cm예요. 카드 4장을 이으면 모두 몇 cm일까요?', '14 cm'], ['음식, 손 씻기, 이 닦기 카드가 차례로 되풀이돼요. 7번째에 올 카드는 무엇일까요?', '손 씻기'], ['8 + 8 + 8 을 곱셈식으로 나타내면 무엇일까요?', '8 × 8'],
    ['음식 골고루 먹기는 5명, 꼭꼭 씹어 먹기는 2명이에요. 두 식습관은 모두 몇 명일까요?', '3명'], ['◯가 손 씻기 6개, 음식 남기지 않기 7개, 이 닦기 3개예요. 가장 많은 식습관은 무엇일까요?', '손 씻기'],
    ['12점씩 2번 실천하면 모두 몇 점일까요?', '24점'], ['8 + 8 + 9 을 곱셈식으로 나타내면 무엇일까요?', '8 × 3']];
  bad.forEach(([q, a]) => { try { check(q, a); if (process.env.DBG) console.log('    · 못 잡음 ' + q); } catch (_) { e++; } });
  try { stepEq('3 - 2 = 2'); } catch (_) { e++; }
  ok(e === 11, '틀린 것 못 잡음 ' + e + '/11');
  ok(josa('8 을').length === 0 && josa('8 를').length === 1 && josa('5를').length === 0, '조사 역검증');
  let c = 0; const S = SRC.u7_l01, TB = S.slides[5].figs[0], G0 = S.slides[6].figs[0], R0 = SRC.u7_l03.problems[0].figs[0], W0 = SRC.u7_l04.problems[0].figs[0], C0 = SRC.u7_l02.slides[5].figs[0];
  const g = (f, x) => Object.assign(JSON.parse(JSON.stringify(want(f))), { k: PK[f.k] }, x);
  const strip = (o) => { Object.keys(o).forEach(x => o[x] === undefined && delete o[x]); return o; };
  try { const f = strip(g(TB, { total: 24 })); figCheck(f, [Object.assign({}, TB, { total: 24 })], 'x', S, false); } catch (_) { c++; } // 합계 ≠ 항목 합
  try { const G1 = Object.assign({}, G0, { grid: G0.grid.map((x, i) => i ? x : '1111100') }); figCheck(strip(g(G1)), [G1], 'x', S, false); } catch (_) { c++; } // ◯ 수 ≠ 표
  try { const G1 = Object.assign({}, G0, { grid: G0.grid.map((x, i) => i ? x : '0111111') }); figCheck(strip(g(G1)), [G1], 'x', S, false); } catch (_) { c++; } // 위에서부터 그림
  try { const R1 = Object.assign({}, R0, { rows: R0.rows.map((r, i) => i === 2 ? [r[0], '×', 5] : r), sum: 25 }); figCheck(strip(g(R1)), [R1], 'x', SRC.u7_l03, false); } catch (_) { c++; } // × 날 점수
  try { const W1 = Object.assign({}, W0, { cards: W0.cards.map((x, i) => i === 3 ? W0.cards[1] : x) }); figCheck(strip(g(W1)), [W1], 'x', SRC.u7_l04, false); } catch (_) { c++; } // 되풀이 깨짐
  try { const w1 = figCheck(strip(g(W0)), [W0], 'x', SRC.u7_l04, true, '빈자리에 올 카드는 무엇일까요?'); ansCheck(w1, { options: [{ text: '식사 전 손 씻기', correct: true }, { text: '식사 후 이 닦기' }] }, 'x'); } catch (_) { c++; } // 빈자리 답 틀림
  try { const w1 = figCheck(strip(g(C0)), [C0], 'x', SRC.u7_l02, true, '수찬이가 2번 실천하면 모두 몇 점일까요?'); ansCheck(w1, { answer: 10 }, 'x'); } catch (_) { c++; } // 8 × 2 ≠ 10
  try { figCheck(strip(g(C0, { score: 7 })), [C0], 'x', SRC.u7_l02, false); } catch (_) { c++; } // 원문과 다름
  ok(c === 8, '그림 역검증 ' + c + '/8'); });
console.log('gate_g2s2_math_u7: PASS ' + pass + ' · FAIL ' + fail);
