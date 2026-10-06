/* gate_g4s2_math_u1.js — 4학년 2학기 수학 1단원 「분수의 덧셈과 뺄셈」 케이티처 2세대 게이트 (80차, 베프 — 4-1 수학 u6 게이트 틀 + 분수 셈 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드(4학년 2학기 · slug g4s2_math 파일) · B 19장 골격 · C 7요소 · D 복습 계보(g4_math u6_l10 → l01 → … → l10, 학기를 넘는 계보)
   E 문제 정답 재계산 — 게이트 자체 분수 셈(분모를 줄이지 않는 분수 · 대분수 「진분수 부분 < 분모」 · 분모 0 무효)으로
       글에서 셈한 답 · 그림(fop 띠의 결과 · frac/fmix 색칠 칸)에서 셈한 답을 따로 내어 서로 같고 정답과 같음 · 오답 보기는 모두 틀림
   F 식 전수 — 화면·교사 층·extras 의 분수 식 「A = B = C …」 쌍마다 값이 같음(대분수·가분수·자연수 · kg·L·km 단위 떼고)
   G 그림 — fop(파랑·초록·덜어 낸 칸 수 = 식 · 통 칸 = 자연수 · 아래 식 글자 참) · fmix(칸 수·식 글자) · frac(칸 수) · fracs · nline(점 자리)
       · 띠 식의 두 수가 원문 차시 글에 있음(말로 쓴 것은 목록)
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_math_u1.js */
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
const L = load(path.join(TDIR, 'data/g4s2_math_u1.js'));
const PREV = load(path.join(TDIR, 'data/g4_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '분수의 덧셈과 뺄셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');

/* ── 게이트 자체 분수 셈(부품의 셈과 따로 짬) — 값 {n, d} 는 분모를 줄이지 않는다 ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
const lcm = (a, b) => a / gcd(a, b) * b;
const TS = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+)';
const ES = TS + '(?:\\s*[+\\-]\\s*' + TS + ')*';
function term(t) { t = String(t).trim(); let m; if ((m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[3] ? { n: +m[1] * +m[3] + +m[2], d: +m[3], w: +m[1], p: +m[2], kind: 'mix' } : null; if ((m = t.match(/^(\d+)\/(\d+)$/))) return +m[2] ? { n: +m[1], d: +m[2], kind: 'frac' } : null; if (/^\d+$/.test(t)) return { n: +t, d: 1, kind: 'int' }; return null; }
function addQ(a, b, sg) { const d = lcm(a.d, b.d); return { n: a.n * (d / a.d) + sg * b.n * (d / b.d), d }; }
function expr(s) { s = norm0(s).trim(); if (!new RegExp('^' + ES + '$').test(s)) return null; const toks = s.match(new RegExp(TS + '|[+\\-]', 'g')); let v = term(toks[0]); if (!v) return null; v = { n: v.n, d: v.d }; for (let i = 1; i < toks.length; i += 2) { const b = term(toks[i + 1]); if (!b) return null; v = addQ(v, b, toks[i] === '+' ? 1 : -1); } return v; }
const eqQ = (a, b) => !!a && !!b && a.n * b.d === b.n * a.d;
function norm0(s) { return String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)·(\d)/g, '$1 $2').replace(/(\d)\s*(kg|km|L|m)(?![a-zA-Z])/g, '$1'); }
/* 답 글자가 값과 같은가 — 대분수는 진분수 부분 < 분모 · 분수는 분모가 셈의 분모와 같음 · 자연수는 나누어떨어질 때 · form 'mix'|'imp' */
function sameQ(text, v, form) {
  const t0 = norm0(text).trim(); const paren = (t0.match(/\(([^)]*)\)/) || [])[1]; const main = t0.replace(/\(.*?\)/g, '').replace(/\s*(L|kg|km|m)$/, '').trim();
  const one = (s, fm) => { const a = term(s); if (!a || !eqQ(a, v)) return false; if (a.kind === 'mix' && !(a.p < a.d && a.p > 0)) return false; if (a.kind !== 'int' && a.d !== v.d) return false; if (a.kind === 'int' && v.n % v.d) return false;
    if (fm === 'mix') return a.kind === 'mix' || a.kind === 'int' || a.n < a.d; if (fm === 'imp') return a.kind === 'frac'; return true; };
  if (!one(main, form)) return false; if (paren != null && !one(paren.trim(), null)) return false; return true; }
/* 여러 갈래 문항 셈 — 반환: {num} | {opt: 보기 번호} | {q: 값, form} | undefined(셀 수 없는 꼴) | null(하나로 안 정해짐) */
const TERMRE = new RegExp('(' + TS + ')');
function textAns(q0, d) { const t = norm0(q0).replace(/\s+/g, ' '); let m; const opts = d && d.options ? d.options.map(o => o.text) : null;
  const pickVal = (v, form) => { const hit = opts.map((o, i) => sameQ(o, v, form) ? i : -1).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };
  if ((m = t.match(/큰 것부터 차례로 쓴 것은.*?㉠\s*(.+?)\s*㉡\s*(.+?)\s*㉢\s*(.+)$/))) { const vs = [m[1], m[2], m[3]].map(x => expr(x)); if (vs.some(x => !x)) return null; const ord = ['㉠', '㉡', '㉢'].map((k, i) => [k, vs[i].n / vs[i].d]).sort((a, b) => b[1] - a[1]).map(x => x[0]).join(' '); const hit = opts.map((o, i) => nsp(o) === nsp(ord) ? i : -1).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
  if (opts && /잘못 계산한 것/.test(t)) { const hit = opts.map((o, i) => { const s = norm0(o).split('='); if (s.length !== 2) return -1; const a = expr(s[0]), b = expr(s[1]); return a && b && eqQ(a, b) ? -1 : i; }).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
  if (opts && /계산 결과가 1보다 큰 것/.test(t)) { const hit = opts.map((o, i) => { const v = expr(o); return v && v.n > v.d ? i : -1; }).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
  if (opts && (m = t.match(/계산 결과가 (\d+) ?가? 되는 뺄셈식/))) { const hit = opts.map((o, i) => { const v = expr(o); return /-/.test(norm0(o)) && v && v.n === +m[1] * v.d ? i : -1; }).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
  if (opts && (m = t.match(new RegExp('(' + TS + ') ?[과와] 더해서 (\\d+) ?가? 되는')))) { const a = term(m[1]); return pickVal(addQ({ n: +m[2], d: 1 }, a, -1)); }
  if (opts && (m = t.match(new RegExp('(' + TS + ') ?에서 빼서 (\\d+) ?가? 되는')))) { const a = term(m[1]); return pickVal(addQ(a, { n: +m[2], d: 1 }, -1)); }
  if ((m = t.match(/^1 ?을 분모가 (\d+)인 분수로 나타내면 (분자|무엇)/))) return m[2] === '분자' ? { num: +m[1] } : { q: { n: +m[1], d: +m[1] }, form: 'imp' };
  if ((m = t.match(/^1을 1\/(\d+) 이 (\d+)개인 분수와 1\/(\d+) 이 □개인 분수로/))) return +m[1] === +m[3] ? { num: +m[1] - +m[2] } : null;
  if ((m = t.match(new RegExp('(' + TS + ') ?[을를] (\\d+) □\\/(\\d+) ?로 바꾸')))) { const a = term(m[1]); const r = a.n - +m[2] * +m[3]; return a.d === +m[3] ? { num: r } : null; }
  if ((m = t.match(new RegExp('(' + TS + ') ?[과와] 모(?:으면|아서) 1이 되는 분수(의 분자)?')))) { const a = term(m[1]); const v = { n: a.d - a.n, d: a.d }; if (m[2]) return { num: v.n }; return opts ? pickVal(v) : { q: v, form: 'imp' }; }
  if ((m = t.match(new RegExp('(' + TS + ') ?[을를] 분모가 (\\d+)인 가분수로 (?:나타내면|바꾸면) 분자')))) { const a = term(m[1]); const n = +m[2]; if (a.d !== 1 && a.d !== n) return null; return { num: a.d === 1 ? a.n * n : a.n }; }
  if ((m = t.match(new RegExp('(' + TS + ') ?[을를] (대분수|가분수)로 나타내면 무엇')))) { const a = term(m[1]); return { q: { n: a.n, d: a.d }, form: m[2] === '대분수' ? 'mix' : 'imp' }; }
  if ((m = t.match(new RegExp('대분수 (' + TS + ') ?의 자연수 부분')))) { const a = term(m[1]); return { num: Math.floor(a.n / a.d) }; }
  const em = t.match(new RegExp('(?<![\\d/])(' + TS + '\\s*[+\\-]\\s*' + ES + ')'));
  const sm = t.match(new RegExp('^(' + TS + ') ?[은는] 단위분수'));
  const v = em ? expr(em[1]) : sm ? term(sm[1]) : null; if (!v) return undefined; const V = { n: v.n, d: v.d };
  if ((m = t.match(/1\/(\d+) ?(?:L|kg|km|m)? ?[이가] 몇 개/))) return V.d === +m[1] ? { num: V.n } : null;
  if (/자연수 부분/.test(t)) return { num: Math.floor(V.n / V.d) };
  if (/분수 부분의 분자/.test(t)) return { num: V.n % V.d };
  if ((m = t.match(/분모가 (\d+)인 가분수로 나타내면 분자/))) return V.d === +m[1] ? { num: V.n } : null;
  if (opts) return pickVal(V);
  if (/계산하면 얼마/.test(t)) return { q: V, form: null };
  return undefined; }
/* 그림에서 셈 — fop 결과 · frac/fmix 색칠 칸 */
function figVal(f) { if (!f) return null; const d = docOf(FIG.render(f)); const svg = d.querySelector('svg'); if (!svg) return null;
  if (f.k === 'fop') return { n: +svg.getAttribute('data-r'), d: +svg.getAttribute('data-n'), A: +svg.getAttribute('data-a'), B: +svg.getAttribute('data-b'), op: svg.getAttribute('data-op') };
  if (f.k === 'frac') return { n: d.querySelectorAll('.o-slice.on').length, d: f.n };
  if (f.k === 'fmix') return { n: d.querySelectorAll('.o-slice.on').length, d: +svg.getAttribute('data-n') };
  return null; }
function figAns(f, q0, d) { const V = figVal(f); if (!V) return undefined; const t = norm0(q0).replace(/\s+/g, ' '); let m; const opts = d && d.options ? d.options.map(o => o.text) : null;
  const pickVal = (v) => { const hit = opts.map((o, i) => sameQ(o, v) ? i : -1).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };
  if (opts && /색칠한 부분을 분수로/.test(t)) return pickVal(V);
  if (/^1을 1\/\d+ 이 \d+개인 분수와/.test(t)) return { num: V.d - V.n };
  if (/모(?:으면|아서) 1이 되는 분수/.test(t)) return opts ? pickVal({ n: V.d - V.n, d: V.d }) : { num: V.d - V.n };
  if ((m = t.match(/(\d+) □\/(\d+) ?로 바꾸/))) return V.d === +m[2] ? { num: V.n - +m[1] * V.d } : null;
  if (/^1을 분모가 \d+인 분수로 나타내면 분자/.test(t) || /가분수로 (?:나타내면|바꾸면) 분자/.test(t) || (m = t.match(/1\/(\d+) ?(?:L|kg|km|m)? ?[이가] 몇 개/))) return { num: V.n };
  if (/자연수 부분/.test(t)) return { num: Math.floor(V.n / V.d) };
  if (opts) return pickVal(V);
  return undefined; }
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function checkAns(where, res, d, ansText) { // res 를 정답과 대조
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).replace(/\(.*?\)/g, '').match(/\d+/)[0]; ok(got === res.num, where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(sameQ(ansText, { n: res.num, d: 1 }), where + ' 답 글자 ' + ansText); return; }
  if (res.q) { ok(sameQ(ansText, res.q, res.form), where + ' ' + JSON.stringify(res) + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('10차시 키 u1_l01~l10 · 파일 data/g4s2_math_u1.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 1단원 분수의 덧셈과 뺄셈 · 성취기준 표시 · live_url 실파일 · 40분', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 1 && m.unit_title === '분수의 덧셈과 뺄셈' && /분수의 덧셈과 뺄셈/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math (4-1 g4_math 와 따로)', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math' && KT2.slugOf({ g: 4, s: 'math' }) === 'g4_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u6_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4_math u6_l10(4-1 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u6_l10'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈 · 오답 보기)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ta = textAns(d.question, d); const fa = d.fig ? figAns(d.fig, d.question, d) : undefined;
    if (d.fig) { const h = FIG.render(d.fig); ok(h && !/NaN|undefined/.test(h), s.id + ' 그림 깨짐'); const sh = d.fig.show; ok(sh === false || (Array.isArray(sh) && sh.indexOf('?') >= 0), s.id + ' 문제 그림에 식 결과가 보임'); }
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    const r = ta !== undefined ? ta : fa; if (r === undefined) { unread.push(k + ' ' + s.id); return; } nCheck++;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); checkAns(s.id, r, d); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); checkAns(s.id, r, d); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); }
    if (d.fig && d.fig.k === 'fop' && d.fig.b !== '0') { const em = norm0(d.question).match(new RegExp('(?<![\\d/])(' + TS + '\\s*[+\\-]\\s*' + ES + ')')); if (em) { const fv = figVal(d.fig); ok(eqQ(expr(em[1]), { n: fv.n, d: fv.d }), s.id + ' 띠 식 ≠ 문제 식'); } } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 = 80 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 20 · 글·그림 둘 다 셈해 대조 ≥ 15', () => ok(nCheck === 80 && !unread.length && nFigQ >= 20 && nBoth >= 15, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 못 읽음 ' + unread.join(' | ')));
T('분수 셈기 자체 확인 — 대분수·가분수·자연수 · 꼴 · 분모 0 · 잘못 계산 · 차례', () => {
  ok(eqQ(expr('2 1/4 - 3/4'), { n: 6, d: 4 }) && eqQ(expr('3 - 1 3/4'), { n: 5, d: 4 }) && eqQ(expr('1/3 + 3 1/3 + 2 1/3'), { n: 6, d: 1 }) && expr('8/9 - 3/9') && !term('5/0'), '셈');
  ok(sameQ('4 1/4', { n: 17, d: 4 }) && !sameQ('3 5/4', { n: 17, d: 4 }) && sameQ('17/4', { n: 17, d: 4 }) && !sameQ('17/4', { n: 17, d: 4 }, 'mix') && !sameQ('6/18', { n: 6, d: 9 }) && sameQ('4', { n: 20, d: 5 }) && sameQ('1 3/9 (12/9)', { n: 12, d: 9 }) && !sameQ('1 3/9 (13/9)', { n: 12, d: 9 }), '꼴');
  const d1 = { options: [{ text: '2 - 2/3 = 1 1/3' }, { text: '3 - 2/7 = 1/7' }, { text: '8/9 - 3/9 = 5/0' }] }; ok(textAns('잘못 계산한 것은 어느 것일까요?', d1) === null, '잘못 둘이면 null');
  ok(SAME(textAns('**3 1/3** 을 2 □/3 로 바꾸려고 합니다.'), { num: 4 }) && SAME(textAns('**5 1/6 - 3 5/6** 을 바르게 계산하면 단위분수 1/6 이 몇 개인 수일까요?'), { num: 8 }) && SAME(textAns('**2** 를 분모가 5인 가분수로 나타내면 분자는 얼마일까요?'), { num: 10 }), '갈래'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u1_l01\.slides\.1\.data\.items\./.test(where); // l01 복습 문항 = 4-1 u6_l10 출구(그 게이트가 검산)
const FALSE_OK = ['8/9-3/9=5/0', '3-2/7=1/7']; // 「잘못 계산한 것」 문항 풀이 끝의 정답 보기(일부러 틀린 식) — 오개념 장 wrong·보기는 건너뜀
let nEq = 0; const bad = [];
const CH = new RegExp('(?<![\\d/.])(' + ES + ')((?:\\s*=\\s*' + ES + ')+)(?![\\d/]|\\s*[□?])', 'g');
const eqcheck = (s0, where) => { const s = norm0(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { const sides = m[0].split('=').map(x => x.trim()); const vs = sides.map(expr); if (vs.some(x => !x)) { if (sides.some(x => /\/0(?!\d)/.test(x)) && FALSE_OK.indexOf(nsp(m[0])) < 0) { bad.push(where + ': 분모 0 ' + m[0]); } continue; } for (let i = 1; i < vs.length; i++) { nEq++; if (!eqQ(vs[i - 1], vs[i]) && FALSE_OK.indexOf(nsp(sides[i - 1] + '=' + sides[i])) < 0) bad.push(where + ': ' + sides[i - 1] + ' = ' + sides[i]); } } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 쌍 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 120, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과 · 단위 뗌)', () => { const b0 = bad.length; ['2/6 + 3/6 = 5/12', '3 1/3 - 1 2/3 = 2 1/3', '1 = 4/4 = 5/6'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('1 2/7 km + 6/7 km = 2 1/7 km · 4 = 20/5, 2 = 10/5 · 3 1/3 = 2 4/3', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k, s]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k, s])));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 20 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 20, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const fcnt = (v, n) => { const t = term(norm0(v)); if (!t) return NaN; if (t.d !== 1 && t.d !== n) return NaN; return t.d === 1 ? t.n * n : t.n; };
const toksOk = (toks, want, where) => { if (!Array.isArray(toks)) return; if (toks.indexOf('?') >= 0) return; const s = norm0(toks.join(' ').replace(/\s*=\s*/g, ' = ')); const sides = s.split('=').map(x => x.trim()); const vs = sides.map(expr); ok(vs.every(Boolean), where + ' 식 글자 못 읽음 ' + s); for (let i = 1; i < vs.length; i++) ok(eqQ(vs[i - 1], vs[i]), where + ' 식 글자 틀림 ' + s); if (want && sides.length > 1) ok(eqQ(vs[vs.length - 1], want), where + ' 식 결과 ≠ 그림 ' + s); };
const nG = { fop: 0, add: 0, sub: 0, solid: 0, fmix: 0, frac: 0, fracs: 0, nline: 0, src: 0 };
T('fop — 파랑·초록·덜어 낸 칸 수 = 식 · 통 칸 = 자연수(나누지 않은 1) · 아래 식 글자 참 · 결과 = 셈', () => parts.filter(([, g]) => g.k === 'fop').forEach(([w0, g]) => { nG.fop++; const d = docOf(FIG.render(g)); const svg = d.querySelector('svg.fig-fop'); ok(svg, w0 + ' 렌더'); const n = g.n, A = fcnt(g.a, n), B = fcnt(g.b, n), R = g.op === '+' ? A + B : A - B;
  ok(+svg.getAttribute('data-a') === A && +svg.getAttribute('data-b') === B && +svg.getAttribute('data-r') === R, w0 + ' data ' + [A, B, R]);
  const solid = d.querySelectorAll('rect.o-slice.solid').length, blue = d.querySelectorAll('rect.o-slice.on').length - solid + solid * n, green = d.querySelectorAll('rect.o-slice.on2').length, cut = d.querySelectorAll('g.o-slice.cut').length;
  if (g.op === '+') { nG.add++; ok(blue === A && green === B && cut === 0, w0 + ' 덧셈 칸 ' + [blue, green, cut]); } else { nG.sub++; ok(blue === R && cut === B && green === 0, w0 + ' 뺄셈 칸 ' + [blue, cut, green]); }
  if (solid) { nG.solid++; ok(solid <= Math.floor((g.op === '+' ? A : R) / n), w0 + ' 통 칸이 너무 많음'); ok(/·/.test(String(g.a)) || /^\d+$/.test(String(g.a)), w0 + ' 통 칸인데 앞의 수가 대분수·자연수 아님'); }
  const want = { n: R, d: n }; if (g.show === undefined) { const txt = [...svg.querySelectorAll('text')].map(t => t.textContent).join(' '); ok(/=/.test(txt), w0 + ' 기본 식 없음'); } toksOk(g.show, want, w0); }));
T('fmix · frac · fracs — 색칠 칸 수 = 분수 · 식 글자 참', () => parts.forEach(([w0, g]) => {
  if (g.k === 'fmix') { nG.fmix++; const d = docOf(FIG.render(g)); ok(d.querySelectorAll('.o-slice.on').length === g.m, w0 + ' 칸'); if (Array.isArray(g.show)) { if (g.show.some(x => /[가-힣]/.test(x))) ok(sameQ(String(g.show[g.show.length - 1]).replace('·', ' '), { n: g.m, d: g.n }), w0 + ' 식 끝 글자'); else toksOk(g.show, { n: g.m, d: g.n }, w0); } }
  if (g.k === 'frac') { nG.frac++; const d = docOf(FIG.render(g)); ok(d.querySelectorAll('.o-slice.on').length === g.m, w0 + ' 칸'); if (typeof g.show === 'string') ok(sameQ(g.show, { n: g.m, d: g.n }), w0 + ' 글자'); }
  if (g.k === 'fracs') { nG.fracs++; const d = docOf(FIG.render(g)); g.items.forEach(it => { ok(sameQ(it.show, { n: it.m, d: it.n }), w0 + ' 줄 글자 ' + it.show); }); ok(d.querySelectorAll('.o-slice.on').length === g.items.reduce((a, it) => a + it.m, 0), w0 + ' 칸 합'); }
  if (g.k === 'nline') { nG.nline++; const d = docOf(FIG.render(g)); const at = d.querySelector('svg').getAttribute('data-at').split(',').map(Number); g.marks.forEach((mk, i) => { const v = term(norm0(mk.at)); ok(v && Math.abs(v.n / v.d - at[i]) < 1e-3 && at[i] >= g.lo && at[i] <= g.hi, w0 + ' 점 ' + mk.at); if (mk.label) ok(nsp(mk.label) === nsp(mk.at), w0 + ' 점 글자'); }); } }));
/* 띠 식의 두 수가 원문 차시 글에 있음 — 원문이 「1/3 이 1개·2개인 분수」처럼 말로 쓴 것은 목록 */
const WORDED = ['u1_l02 1/3+2/3', 'u1_l02 2/6+4/6', 'u1_l02 1/5+4/5', 'u1_l02 2/5+3/5'];
const SRCTXT = {}; KEYS.forEach(k => { SRCTXT[k] = norm0(JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems)).replace(/\s+/g, ''); });
T('띠 식의 두 수가 원문 차시 글에 있음(말로 쓴 넷은 목록)', () => { const off = []; parts.filter(([, g]) => g.k === 'fop' && g.b !== '0').forEach(([w0, g, , , k]) => { nG.src++; const a = norm0(g.a).replace(/\s+/g, ''), b = norm0(g.b).replace(/\s+/g, ''); const key = k + ' ' + a + (g.op === '+' ? '+' : '-') + b; if (WORDED.indexOf(key.replace('-', '−')) >= 0 || WORDED.indexOf(key) >= 0) return; if (SRCTXT[k].indexOf(a) < 0 || SRCTXT[k].indexOf(b) < 0) off.push(w0 + ' ' + key); }); ok(!off.length, '원문에 없는 수 ' + off.join(' | ')); });
T('분수 부품 수 — fop ≥ 40(덧셈 ≥ 15 · 뺄셈 ≥ 20 · 통 칸 ≥ 20) · fmix ≥ 6 · frac ≥ 6 · nline ≥ 2', () => ok(nG.fop >= 40 && nG.add >= 15 && nG.sub >= 20 && nG.solid >= 20 && nG.fmix >= 6 && nG.frac >= 6 && nG.nline >= 2, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 띠 식·칸 잡음', () => { let caught = 0; try { toksOk(['2/6', '+', '3/6', '=', '5/12'], null, 'p'); } catch (e) { caught++; } try { toksOk(['3·1/3', '−', '1·2/3', '=', '1·2/3'], { n: 6, d: 3 }, 'p'); } catch (e) { caught++; } ok(caught === 2, '잡은 수 ' + caught); const d = docOf(FIG.render({ k: 'fop', n: 4, a: '2·1/4', b: '3/4', op: '−', solid: true })); ok(d.querySelectorAll('g.o-slice.cut').length === 3 && d.querySelectorAll('rect.o-slice.solid').length === 1, '뺄셈 띠 칸'); });

console.log('═══ H. 재료 충실 ═══');
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(x.text)); const qs = src.problems.map(p => normT(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(normT(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(normT(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('추출기: 자기주도 문제 답이 모두 읽힘(답 없는 문제 0)', () => KEYS.forEach(k => SRC[k].problems.forEach((p, i) => ok('a' in p || p.opts, k + ' P' + i))));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구) · 출구가 다음 차시 기본 문제와도 다름', () => KEYS.forEach((k, i) => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(nsp); const dup = n.filter((x, j) => n.indexOf(x) !== j); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('마지막 차시 「다음 단원엔」 = 2단원 사각형 · 차단 어휘 0', () => { const nx = L.u1_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /사각형/.test(nx.preview) && !/삼각형/.test(nx.preview), '다음 단원'); const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로'].forEach(b => ok(all.indexOf(b) < 0, '차단 어휘 ' + b)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary;
const FIRST = [['분수 띠', 2], ['가르', 2], ['수직선', 4], ['방법 1', 5], ['1만큼', 7], ['빌려', 8], ['어림', 9]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(srcTxt(KEYS[n - 1]).indexOf(w0) >= 0, '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u1_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('수직선') < 0, 'l01 개념 장 깨끗'); probe.content += ' 수직선'; ok(JSON.stringify(probe).indexOf('수직선') >= 0, '심은 낱말'); });

console.log('\n게이트 g4s2 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
