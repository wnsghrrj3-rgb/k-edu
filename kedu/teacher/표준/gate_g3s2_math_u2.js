/* gate_g3s2_math_u2.js — 3학년 2학기 수학 2단원 「나눗셈」 케이티처 2세대 게이트 (30차, 베프 — u1 게이트 복제 + ÷ 검산).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(u1_l10 → l01 → … → l11) · E 문제 정답(식 재계산·보기 정답 1개)
   F 산수 전수(× + − 식 · ÷ 식 「a ÷ b = q … r」 재계산) · G 그림(fig 전수 렌더·vdiv 몫·나머지·brem·range 안) · H 재료 충실(자기주도 원문 계승)
   I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_math_u2.js */
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
const L = load(path.join(TDIR, 'data/g3s2_math_u2.js'));
const U1 = load(path.join(TDIR, 'data/g3s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

// 2세대 무대 부팅(jsdom)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '나눗셈', classNames: [] });

console.log('═══ A. 로드 ═══');
T('11차시 키 u2_l01~l11', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit_title 나눗셈 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 2 && m.unit_title === '나눗셈' && m.std === '[4수01-10]' && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex7 = U1.u1_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u1_l10') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex7;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u1_l10'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
const lead = (q) => { const t = String(q).replace(/\*\*/g, '');
  let d = t.match(/^(\d+)\s*÷\s*(\d+)\s*(?:는|은)\s*얼마/); if (d) { const a = +d[1], b = +d[2]; if (a % b) throw new Error('나누어떨어지지 않는데 「얼마」: ' + t); return a / b; }
  d = t.match(/^(\d+)\s*÷\s*(\d+)\s*의 몫(?:은|는)/); if (d) return Math.floor(+d[1] / +d[2]);
  d = t.match(/^(\d+)\s*÷\s*(\d+)\s*의 나머지(?:는|은)/); if (d) return +d[1] % +d[2];
  const m = t.match(/^(\d+(?:\s*[×+−]\s*\d+)+)\s*(?:는|은|을|를)\s*(?:얼마|계산)/); return m ? calc(m[1]) : null; };
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = lead(d.question); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' ≠ ' + d.answer); } ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = lead(lv[t].q); if (v != null) { nCheck++; ok(parseInt(String(lv[t].a).replace(/,/g, ''), 10) === v, t + ' ' + lv[t].q + ' ≠ ' + lv[t].a); } ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = lead(it.q); if (v != null) { nCheck++; ok(+it.a === v, '출구 ' + it.q + ' ≠ ' + it.a); } }); }));
T('식으로 다시 계산한 정답 수 ≥ 40', () => ok(nCheck >= 40, nCheck));

console.log('═══ F. 산수 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
let nEq = 0; const bad = [];
allStr.forEach(([s0, where]) => { const s = s0.replace(/\*\*/g, ''); const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d]|\s*[×+−])/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); const pc = before.slice(-1); if (/[\d×+−=□)]/.test(pc)) continue; const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } });
let nDiv = 0;
allStr.forEach(([s0, where]) => { const s = s0.replace(/\*\*/g, ''); const re = /(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)(?:\s*…\s*(\d+))?/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); if (/[\d×+−=□)]/.test(before.slice(-1))) continue; const a = +m[1], b = +m[2], q = +m[3], r = m[4] == null ? 0 : +m[4]; nDiv++;
    if (b * q + r !== a || r >= b || (m[4] == null && a % b)) bad.push(where + ': ' + m[0] + ' (→' + Math.floor(a / b) + ' … ' + a % b + ')'); } });
T('식 전수 재계산 (× + − ' + nEq + '개 · ÷ ' + nDiv + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
T('식 재계산 ≥ 150개 · ÷ 식 ≥ 60개', () => ok(nEq + nDiv >= 150 && nDiv >= 60, nEq + '·' + nDiv));

console.log('═══ G. 그림 ═══');
KEYS.forEach(k => T(k + ' 개념 4장 fig 렌더 · vdiv 몫·나머지 · brem · range 안', () => { L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(s.data.fig, s.id + ' fig 없음'); const h = FIG.render(s.data.fig); ok(h && h.length > 200, s.id + ' 빈 그림');
  ok(!/NaN|undefined/.test(h), s.id + ' NaN/undefined'); (h.match(/data-r="(\d+)"/g) || []).forEach(x => nCheck++);
  const walkF = (f) => { if (!f) return; if (f.k === 'panels') return f.items.forEach(p => walkF(p.fig || p)); if (f.k === 'vmul') ok(h.indexOf('data-r="' + f.a * f.b + '"') >= 0, s.id + ' vmul ' + f.a + '×' + f.b); if (f.k === 'vdiv') { nCheck++; ok(h.indexOf('data-q="' + Math.floor(f.a / f.d) + '" data-rem="' + (f.a % f.d) + '"') >= 0, s.id + ' vdiv ' + f.a + '÷' + f.d); } if (f.k === 'brem') ok(h.indexOf('data-g="' + Math.floor(f.total / f.per) + '" data-r="' + (f.total % f.per) + '"') >= 0, s.id + ' brem'); if (f.k === 'range' && f.at != null) ok(f.at >= f.lo && f.at <= f.hi, s.id + ' range 밖'); if (f.k === 'grid') { const sw = f.sw || [f.w], sh = f.sh || [f.h]; ok(sw.reduce((a, b) => a + b) === f.w && sh.reduce((a, b) => a + b) === f.h, s.id + ' grid 가르기 합'); } };
  walkF(s.data.fig); }); }));

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('한 차시 안에서 같은 식 문제 중복 0 (기본·수준별·응용)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = []; sl.filter(s => s.block === 'basic_problem').forEach(s => e.push(s.data.question)); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); e.push(sl[14].data.context + sl[14].data.challenge);
  const exprs = e.map(q => (String(q).match(/\d+\s*÷\s*\d+/) || [''])[0].replace(/\s/g, '')).filter(Boolean); const dup = exprs.filter((x, i) => exprs.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('\n게이트 g3s2 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
