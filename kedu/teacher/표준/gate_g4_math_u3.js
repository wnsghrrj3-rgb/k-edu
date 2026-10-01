/* gate_g4_math_u3.js — 4학년 1학기 수학 3단원 「곱셈과 나눗셈」 케이티처 2세대 게이트 (60차, 베프 — u2 각도 게이트 틀 + 곱·몫·나머지 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4 u2_l10 → l01 → … → l09)
   E 문제 정답 재계산 — 글 문제(× 곱 · ÷ 몫·나머지 · 「~씩 ~」 생활 문제 · 뜻 묻기) + 그림 문제(답 칸 비운 vmul·vdiv 에서 곱·몫 셈 · 문제 수 = 그림 수)
   F 식 전수(+ − × ÷ · 「a ÷ b = q … r」 몫·나머지 · 나머지 < 나누는 수)
   G 그림(vmul data-r = a×b · 부분 곱 · vdiv 몫·나머지·확인 식 · 문제 장은 답 칸 비움 · brem · range 안 · eq 식)
   H 재료 충실(자기주도 원문 계승) · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(나머지 l04 · 검산·부분곱 l09, 원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g4_math_u3.js'));
const U2 = load(path.join(TDIR, 'data/g4_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '곱셈과 나눗셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;

console.log('═══ A. 로드 ═══');
T('9차시 키 u3_l01~l09', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · 3단원 곱셈과 나눗셈 · 성취기준 표시 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 3 && m.unit_title === '곱셈과 나눗셈' && /곱셈/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex08 = U2.u2_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4 u2_l10') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex08;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u2_l10'), 'from ' + rv.from); }));

/* ── 게이트 자체 셈 ── */
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const flat0 = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const FACT = [ // 뜻을 묻는 문항 — 단원 정본 답(바뀌면 문장도 함께 봐야 한다)
  [/새로 배우는/, '곱하는 수와 나누는 수가 두 자리인 계산'], [/\(세 자리 수\)×\(몇십\)은 어떻게 계산/, '(세 자리 수)×(몇)을 구한 뒤 10배 해요'],
  [/\(세 자리 수\)×\(몇십몇\)은 어떻게 계산/, '(세 자리 수)×(몇십)과 (세 자리 수)×(몇)을 구해 더해요'], [/나머지는 어떤 수일까요/, '나누는 수보다 작아야 해요'],
  [/곱한 값이 나누어지는 수보다 컸어요/, '몫을 1 작게 해서 다시 곱해 봐요'], [/어림한 몫이 서로 달랐어요/, '어느 방법으로 어림했든 곱셈으로 확인해 알맞은 몫을 찾으면 돼요'],
  [/몫을 어림하면\?/, null], [/몇십과 몇으로 쪼개면/, null], [/곱하는 수가 10배가 되면 곱은/, '10배가 돼요'], [/십의 자리를 곱한 값은 어떻게 쓸까요/, '한 칸 밀어 써요'],
  [/나머지는 어떤 수보다 작아야/, '나누는 수'], [/몫을 어떻게 고칠까요/, '1 작게 해요'], [/나눗셈을 검산하는 식은/, '(나누는 수)×(몫)+(나머지)'],
  [/오늘 점심 세 반찬의 탄소 발자국을 모두 더하면/, { from: '136 + 460 + 76' }]];
function leadA(q0) { const q = flat0(q0); let m;
  for (const [re, a] of FACT) if (re.test(q)) { if (a === null) break; if (a && a.from) return Function('return ' + a.from.replace(/\s/g, ''))(); return a; }
  if ((m = q.match(/(\d+) ÷ (\d+) ?의 몫을 어림하면/))) { const v = Math.floor(m[1] / m[2]); const lo = Math.floor(v / 10) * 10; return lo + '보다 크고 ' + (lo + 10) + '보다 작아요'; }
  if ((m = q.match(/^(\d+)를 몇십과 몇으로 쪼개면/)) || (m = q.match(/(\d+) 를 몇십과 몇으로 쪼개면/))) return (Math.floor(m[1] / 10) * 10) + ' 과 ' + (m[1] % 10);
  if ((m = q.match(/(\d+) ?÷ ?(\d+) ?의 몫은 \*?\*?(\d+)\*?\*?이었어요\. 나머지는/)) || (m = q.match(/(\d+) ÷ (\d+) 의 몫은 (\d+)이었어요\. 나머지는/))) return m[1] - m[2] * m[3];
  if ((m = q.match(/(\d+) ?× ?(\d+) ?(?:은|는)? ?얼마/))) return m[1] * m[2];
  if ((m = q.match(/(\d+) ?÷ ?(\d+) ?의 몫은/))) return Math.floor(m[1] / m[2]);
  if ((m = q.match(/(\d+) ?÷ ?(\d+) ?의 나머지는/))) return m[1] % m[2];
  if ((m = q.match(/(\d+) ?÷ ?(\d+) ?는 얼마/))) return m[1] % m[2] === 0 ? m[1] / m[2] : null;
  if ((m = q.match(/하루에 (\d+)개씩 (?:땁니다\. )?(\d+)일 동안/))) return m[1] * m[2];
  if ((m = q.match(/한 줄에 (\d+)포기씩 (\d+)줄/))) return m[1] * m[2];
  if ((m = q.match(/(\d+)포기를 상자 (\d+)개에 똑같이/))) return m[1] / m[2];
  if ((m = q.match(/(\d+)원씩 돌려받아요\. (\d+)원을 받았다면/))) return m[2] / m[1];
  if ((m = q.match(/(\d+) g이에요\. (\d+)명이 모두 먹으면/))) return m[1] * m[2];
  if ((m = q.match(/(\d+)개씩 든 사과 (\d+)상자/))) return m[1] * m[2];
  if ((m = q.match(/(\d+) mL씩 (\d+)명이 마시면/))) return m[1] * m[2];
  return null; }
function same(a, v) { if (typeof v === 'number') { const d = String(a).replace(/\(.*?\)/g, '').replace(/,/g, '').match(/\d+/); return !!d && +d[0] === v; }
  const A = nsp(a), V = nsp(v); return A === V || A.indexOf(V) === 0 || V.indexOf(A) === 0; }
/* 그림 문제 — 답 칸을 비운 세로셈에서 답을 따로 셈 */
function figAns(f) { if (!f) return undefined; if (f.k === 'vmul' && f.answer === false) return f.a * f.b; if (f.k === 'vdiv' && f.answer === false) return Math.floor(f.a / f.d); return undefined; }

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 · 그림 = 문제 수 · 답 칸 비움', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const fa = figAns(d.fig);
    if (d.fig) { const h = FIG.render(d.fig); ok(h && !/NaN|undefined/.test(h), s.id + ' 그림 깨짐');
      if (d.fig.k === 'vmul' || d.fig.k === 'vdiv') { const a = d.fig.a, b = d.fig.b || d.fig.d; const q = flat0(d.question); ok(q.indexOf(String(a)) >= 0 && q.indexOf(String(b)) >= 0, s.id + ' 그림 수 ' + a + '·' + b + ' ↔ 문제 ' + q);
        ok(d.fig.answer === false, s.id + ' 문제 그림은 답 칸 비움'); const doc = docOf(h);
        if (d.fig.k === 'vmul') { const r = doc.querySelector('.vt-r'); ok(r && !/\d/.test(r.textContent), s.id + ' 곱 칸에 숫자가 보임'); if (d.fig.parts === false) doc.querySelectorAll('.vm-p').forEach(p => ok(!/\d/.test(p.textContent), s.id + ' 부분 곱이 보임')); ok(!doc.querySelector('.vm-side') || d.fig.b < 10 || d.fig.b % 10 === 0, s.id + ' 옆 칸 식이 보임'); }
        if (d.fig.k === 'vdiv') { ok(!/\d/.test(doc.querySelector('.vd-q').textContent) && !doc.querySelector('.vd-side') && !doc.querySelector('.vd-p'), s.id + ' 몫·단계가 보임'); } } }
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const cor = d.options.find(o => o.correct).text; const v = leadA(d.question);
      if (v != null) { nCheck++; ok(same(cor, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v) + ' ≠ ' + cor); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = fa !== undefined ? fa : leadA(d.question); if (fa !== undefined) { nFigQ++; const v2 = leadA(d.question); if (v2 != null) ok(v2 === fa, s.id + ' 글 셈 ' + v2 + ' ≠ 그림 셈 ' + fa); }
      if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id);
      ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadA(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[t].a); } else unread.push(k + ' ' + t); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadA(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 ≥ 70 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 15', () => ok(nCheck >= 70 && !unread.length && nFigQ >= 15, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 곱·몫·나머지·생활 문제·어림 범위', () => {
  ok(leadA('**313 × 40**은 얼마일까요?') === 12520 && leadA('**597 ÷ 80**의 몫은 얼마일까요?') === 7 && leadA('**275 ÷ 30** 의 나머지는 얼마일까요?') === 5, '곱·몫·나머지');
  ok(leadA('597 ÷ 80 의 몫은 **7**이었어요.\n**나머지**는 얼마일까요?') === 37 && leadA('빈 병 한 개에 **70원**씩 돌려받아요.\n**980원**을 받았다면 빈 병은 몇 개일까요?') === 14, '나머지·생활');
  ok(same('30보다 크고 40보다 작아요', leadA('**915 ÷ 23**의 몫을 어림하면?')) && !same('40보다 크고 50보다 작아요', leadA('**915 ÷ 23**의 몫을 어림하면?')), '어림 범위');
  ok(figAns({ k: 'vmul', a: 217, b: 35, answer: false }) === 7595 && figAns({ k: 'vdiv', a: 817, d: 19, answer: false }) === 43 && figAns({ k: 'vdiv', a: 817, d: 19 }) === undefined, '그림 셈'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'); if (!/^[\d\s*+\-/()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0, nRem = 0; const bad = [];
const eqcheck = (s0, where) => { const s = ' ' + String(s0).replace(/\*\*/g, '').replace(/,(?=\d{3})/g, ''); let m; const re = /(\d+(?:\s*[×÷+−]\s*\d+)+)\s*=\s*(\d+)(\s*…\s*(\d+))?(?![\d.·\/]|\s*[×÷+−]|의)/g; // 「= 268의 10배」 처럼 뒤에 이어지는 말은 식 끝이 아님
  while ((m = re.exec(s))) { if (m[3]) { const p = m[1].match(/^(\d+)\s*÷\s*(\d+)$/); nEq++; nRem++; if (!p) { bad.push(where + ': … 앞이 a ÷ b 가 아님 ' + m[0]); continue; } const a = +p[1], b = +p[2]; if (Math.floor(a / b) !== +m[2] || a % b !== +m[4] || +m[4] >= b) bad.push(where + ': ' + m[0] + ' (→' + Math.floor(a / b) + ' … ' + (a % b) + ')'); continue; }
    const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('곱·몫 식 전수 재계산 (' + nEq + '개 · 몫…나머지 ' + nRem + '개) 틀림 0', () => ok(bad.length === 0 && nEq >= 80 && nRem >= 3, 'nEq ' + nEq + ' nRem ' + nRem + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 넷 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['134 × 20 = 2690', '453 ÷ 60 = 7 … 23', '98 ÷ 16 = 5 … 18', '150 ÷ 30 = 6'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 4, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('152 × 24 = 3648 · 289 ÷ 52 = 5 … 29 · 40 × 6 + 8 = 248 · 136 + 460 + 76 = 672', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });
T('「몫 … 나머지」 생활 문제 풀이 — 남는 양 < 나누는 양', () => KEYS.forEach(k => { const adv = L[k].slides[14].data; const s = flat0(adv.context + ' ' + adv.note); let m; const re = /(\d+) − (\d+) = (\d+)/g; while ((m = re.exec(s))) ok(+m[1] - +m[2] === +m[3], k + ' ' + m[0]); }));

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block]); }));
const flatF = (f) => (f.k === 'panels' ? f.items.map(p => p.fig || p) : [f]);
const parts = []; figs.forEach(([w0, f, b]) => flatF(f).forEach((g, i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b])));
T('개념 36장 모두 그림 · 기본 문제 그림 ≥ 15 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 15, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); }); });
let nG = { vmul: 0, vdiv: 0, brem: 0, range: 0, eq: 0, chain: 0 };
T('vmul — data-r = a×b · 두 자리면 부분 곱 = a×일의 자리 · a×몇십 · 그린 숫자 = 데이터', () => parts.filter(([, g]) => g.k === 'vmul').forEach(([w0, g]) => { nG.vmul++; const h = FIG.render(g); ok(h.indexOf('data-r="' + g.a * g.b + '"') >= 0, w0 + ' 곱'); const two = g.b >= 10 && g.b % 10 !== 0; if (two) ok(h.indexOf('data-p="' + g.a * (g.b % 10) + ',' + g.a * (g.b - g.b % 10) + '"') >= 0, w0 + ' 부분 곱');
  const doc = docOf(h); const txt = (sel) => (doc.querySelector(sel) || { textContent: '' }).textContent.replace(/\s/g, ''); ok(txt('.vt-a') === String(g.a) && txt('.vt-b').replace('×', '') === String(g.b), w0 + ' 곱하는 두 수'); if (g.answer !== false) ok(txt('.vt-r') === String(g.a * g.b), w0 + ' 답 줄 ' + txt('.vt-r'));
  if (two && g.answer !== false) { const ps = [...doc.querySelectorAll('.vm-p')].map(p => p.textContent.replace(/\s/g, '')); ok(ps[0] === String(g.a * (g.b % 10)) && ps[1] === String(g.a * Math.floor(g.b / 10)), w0 + ' 부분 곱 줄 ' + ps.join(',')); } }));
T('vdiv — data-q·rem = 몫·나머지 · 나머지 < 나누는 수 · 몫 줄 = 몫 · 확인 식', () => parts.filter(([, g]) => g.k === 'vdiv').forEach(([w0, g]) => { nG.vdiv++; const h = FIG.render(g); const q = Math.floor(g.a / g.d), r = g.a % g.d; ok(h.indexOf('data-q="' + q + '" data-rem="' + r + '"') >= 0, w0 + ' ' + g.a + '÷' + g.d); ok(r < g.d, w0 + ' 나머지');
  const doc = docOf(h); if (g.answer !== false) { ok(doc.querySelector('.vd-q').textContent.replace(/\s/g, '') === String(q), w0 + ' 몫 줄'); const last = [...doc.querySelectorAll('.vd-r')].pop(); ok(last && last.textContent.replace(/\s/g, '') === String(r), w0 + ' 나머지 줄'); }
  if (g.check) { const ck = doc.querySelector('.vd-ck').textContent; eqcheck(ck, w0 + ' 확인 식'); ok(new RegExp('= ' + g.a + '$').test(ck.trim()), w0 + ' 확인 식 끝'); } }));
T('brem·range·eq·chain — 묶음·나머지 · 계산한 값이 어림 사이 · 식 글자 재계산', () => parts.forEach(([w0, g]) => { const h = FIG.render(g);
  if (g.k === 'brem') { nG.brem++; ok(h.indexOf('data-g="' + Math.floor(g.total / g.per) + '" data-r="' + (g.total % g.per) + '"') >= 0, w0 + ' brem'); }
  if (g.k === 'range') { nG.range++; ok(/data-in="1"/.test(h), w0 + ' 어림 사이 밖'); }
  if (g.k === 'eq') { nG.eq++; g.lines.forEach(t => eqcheck(t, w0)); }
  if (g.k === 'chain') { nG.chain++; g.items.forEach(t => eqcheck(t.name, w0)); } }));
T('부품 수 — vmul ≥ 15 · vdiv ≥ 20 · 차시마다 세로셈 그림', () => { ok(nG.vmul >= 15 && nG.vdiv >= 20, JSON.stringify(nG)); KEYS.forEach(k => ok(L[k].slides.some(s => /"k":"(vmul|vdiv)"/.test(JSON.stringify(s.data.fig || {}))), k)); });
T('그림 검사기 자체 확인 — 답 칸 비움·부분 곱 비움·확인 식', () => { const d1 = docOf(FIG.render({ k: 'vmul', a: 217, b: 35, answer: false, parts: false })); ok(![...d1.querySelectorAll('.vm-p,.vt-r')].some(p => /\d/.test(p.textContent)) && !d1.querySelector('.vm-side'), 'parts:false');
  const d2 = docOf(FIG.render({ k: 'vmul', a: 217, b: 35, answer: false })); ok([...d2.querySelectorAll('.vm-p')].some(p => /\d/.test(p.textContent)), 'parts 기본은 보임'); const d3 = docOf(FIG.render({ k: 'vdiv', a: 675, d: 28, check: true })); ok(/28 × 24 \+ 3 = 675/.test(d3.querySelector('.vd-ck').textContent), '확인 식'); });

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문(원문이 빈 장만 교사 글) · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const titles = src.slides.map(x => x.title); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const i = texts.indexOf(norm(s.data.content)); if (i < 0) { const j = titles.indexOf(s.data.title); ok(j >= 0 && !src.slides[j].text && s.data.content.length > 20, s.id + ' 원문 아님 (원문 장이 비어 있을 때만 교사 글)'); } });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('추출기: 자기주도 문제 답이 모두 읽힘(답 없는 문제 0)', () => KEYS.forEach(k => SRC[k].problems.forEach((p, i) => ok('a' in p || p.opts, k + ' P' + i))));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(norm); const dup = n.filter((x, i) => n.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 문제 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary;
const FIRST = [['나머지', 4], ['검산', 9], ['부분곱', 9]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('l01~l03 나눗셈 그림은 옆 칸(「나머지」 글자) 숨김 · 렌더에도 「나머지」 0', () => KEYS.slice(0, 3).forEach(k => L[k].slides.forEach(s => { const r = render(s, L[k], true); ok(r.body.indexOf('나머지') < 0, k + ' ' + s.id + ' 렌더에 「나머지」'); })));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u3_l02.slides[3].data)); ok(JSON.stringify(probe).indexOf('나머지') < 0, 'l02 개념 장 깨끗'); probe.content += ' 나머지'; ok(JSON.stringify(probe).indexOf('나머지') >= 0, '심은 낱말'); });

console.log('\n게이트 g4 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
