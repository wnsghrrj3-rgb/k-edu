/* gate_g4s2_math_u5.js — 4학년 2학기 수학 5단원 「꺾은선그래프」 케이티처 2세대 게이트 (191차, 베프 — u4 다각형 게이트 틀 + 꺾은선 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4s2 u4_l09 → l01 → … → l09)
   E 문제 정답 재계산 — 글 셈(두 값의 차 · 합 · 가장 큰−작은 · 눈금 한 칸 ↔ 칸 수 · 물결선 자리) + 그림 셈(렌더된 점 높이를 눈금선으로 다시 재어
     값 읽기 · 두 때의 차 · 가장 많이 변한/늘어난/줄어든 때·정도 · 변하지 않은 때 · 처음으로 줄어든 때 · 두 자료의 차 · 차가 가장 적은 때 · 짐작 점
     · 막대 차 · 표 합계·가장 큰 값 · 잘못 그린 그래프 찾기) · 뜻 낱말은 뜻 사전 셈 · 그 밖은 원문 보기·정답 대조(수를 셀 수 없는 판단 문항만)
   F 식 전수
   G 그림(lg 점 높이 다시 잼 = 자료 · 눈금선 수 · 물결선은 가장 작은 값 아래(잘못 그린 그림만 예외) · 문제 그림엔 점 위 수 없음 · 짐작 점·범례·짚는 점
     · bar 막대 길이 = 자료 · 자료가 자기주도 원문 renderModels 자료와 같음 · 개념 글 속 「N월은 X일」 = 그림)
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_math_u5.js */
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
const L = load(path.join(TDIR, 'data/g4s2_math_u5.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u5.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '꺾은선그래프', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const R6 = (v) => Math.round(v * 1e6) / 1e6;

/* ── 렌더된 그림에서 다시 잼 (게이트 자체 셈 — 부품의 data-v 를 믿지 않는다) ── */
function measureLg(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-lg'); ok(svg, '꺾은선 svg 없음');
  const gl = [...svg.querySelectorAll('line.lgl')].map(l => ({ v: +l.getAttribute('data-val'), y: +l.getAttribute('y1') }));
  const wave = svg.getAttribute('data-wave') === '1'; const use = wave ? gl.slice(1) : gl; ok(use.length >= 2, '눈금선 모자람');
  const a = use[0], b = use[use.length - 1]; const per = (b.v - a.v) / (a.y - b.y); // 값/픽셀
  const gaps = use.slice(1).map((g, i) => R6(g.v - use[i].v)); const step = gaps[0]; ok(gaps.every(x => Math.abs(x - step) < 1e-6), '눈금 간격 고르지 않음 ' + gaps.join(','));
  const pix = use.slice(1).map((g, i) => use[i].y - g.y); ok(pix.every(p => Math.abs(p - pix[0]) < 0.25), '눈금선 픽셀 간격 고르지 않음');
  const unit = Math.pow(10, Math.ceil(Math.log10(per * 0.15))); // 0.1 px 반올림을 넘지 않는 가장 작은 자릿값으로 맞춤
  const ns = (f.sets || [0]).length, n = f.x.length; const v = Array.from({ length: ns }, () => Array(n).fill(null)); const q = [];
  svg.querySelectorAll('circle.lp').forEach(c => { const i = +c.getAttribute('data-i'), s = +c.getAttribute('data-s'); const raw = a.v + (a.y - +c.getAttribute('cy')) * per; v[s][i] = R6(Math.round(raw / unit) * unit); if (c.classList.contains('lq')) q.push(i); });
  const names = [...svg.querySelectorAll('text')].map(t => t.textContent);
  return { v, q, step, wave, gl, svg, d, base: wave ? gl[1].v : 0, top: gl[gl.length - 1].v, labels: f.x, hidden: [...svg.querySelectorAll('rect.lh')].map(r => +r.getAttribute('data-i')), names, per, unit }; }
function measureBar(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-bar'); ok(svg, '막대그래프 svg 없음');
  const pos = [...svg.querySelectorAll('line.bg')].map(l => +l.getAttribute('y1')); const gap = Math.abs(pos[pos.length - 1] - pos[0]) / (pos.length - 1); const step = +svg.getAttribute('data-step');
  const v = f.x.map(() => null); svg.querySelectorAll('rect.bb').forEach(r => { const i = +r.getAttribute('data-i'); const raw = +r.getAttribute('height') / gap * step; v[i] = Math.abs(raw - Math.round(raw)) < 0.25 ? Math.round(raw) : Math.round(raw * 100) / 100; }); return { v, step }; }
function readTable(f) { const d = docOf(FIG.render(f)); const rows = d.querySelectorAll('table.pt tr'); const names = [...rows[0].querySelectorAll('td')].map(t => t.textContent); const vals = [...rows[1].querySelectorAll('td')].map(t => t.textContent);
  const out = { items: [], totalQ: false }; names.forEach((n, i) => { if (n === '합계') out.totalQ = vals[i] === '?'; else out.items.push({ name: n, v: vals[i] === '?' ? null : +vals[i] }); }); return out; }

/* 질문 속 가로 이름 찾기 — 「2018년」「7월」「7시」 꼴 */
const labIn = (labels, t) => labels.map((x, i) => [i, t.indexOf(/^\d{4}$/.test(x) ? x + '년' : x)]).filter(([, p]) => p >= 0).sort((a, b) => a[1] - b[1]).map(([i]) => i);
const diffs = (v) => v.slice(1).map((x, i) => R6(x - v[i]));
const pick = (opts, fn) => { if (!opts) return null; const hit = opts.map((o, i) => (fn(clean(o.text)) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };
const yl = (x) => (/^\d{4}$/.test(x) ? x + '년' : x);

/* 그림에서 답을 셈 (undefined = 그림으로 셀 문제 아님 · null = 하나로 안 정해짐) */
function figAns(f, q0, d) { if (!f) return undefined; const t = clean(q0); let m;
  if (f.k === 'lg') { const M = measureLg(f); const X = f.x; const li = labIn(X, t);
    let si = 0; if (f.sets) { const hit = f.sets.map((s, j) => [j, t.indexOf(s.name.split(' ')[0])]).filter(([, p]) => p >= 0); if (hit.length === 1) si = hit[0][0]; }
    const V = M.v[si];
    if (/세로 눈금 한 칸은 몇/.test(t)) return { num: M.step };
    if (f.sets && /차가 가장 적은 때/.test(t)) { const df = X.map((_, i) => Math.abs(M.v[1][i] - M.v[0][i])); const mn = Math.min(...df); const ix = df.map((x, i) => (x === mn ? i : -1)).filter(i => i >= 0); return ix.length === 1 && d ? pick(d.options, o => o.startsWith(yl(X[ix[0]]))) : null; }
    if (f.sets && li.length === 1 && /차는/.test(t)) return { num: R6(Math.abs(M.v[1][li[0]] - M.v[0][li[0]])) };
    const D = diffs(V);
    if (/(이웃한 두 (해|달) 사이에서|전년도와 비교하여) 가장 많이 변한 정도/.test(t)) return { num: Math.max(...D.map(Math.abs)) };
    if (/가장 많이 (늘어난|자란) 정도/.test(t)) return { num: Math.max(...D) };
    if (/가장 많이 늘어난 때/.test(t)) { const mx = Math.max(...D); const ix = D.map((x, i) => (x === mx ? i + 1 : -1)).filter(i => i >= 0); return ix.length === 1 && d ? pick(d.options, o => o.startsWith(yl(X[ix[0]]))) : null; }
    if (/가장 많이 줄어든 때/.test(t)) { const mn = Math.min(...D); const ix = D.map((x, i) => (x === mn ? i + 1 : -1)).filter(i => i >= 0); return mn < 0 && ix.length === 1 && d ? pick(d.options, o => o.startsWith(yl(X[ix[0]]))) : null; }
    if (/가장 많이 변한 때/.test(t)) { const ab = D.map(Math.abs); const mx = Math.max(...ab); const ix = ab.map((x, i) => (x === mx ? i : -1)).filter(i => i >= 0); return ix.length === 1 && d ? pick(d.options, o => o.indexOf(yl(X[ix[0]]) + '과 ' + yl(X[ix[0] + 1])) === 0 || o.indexOf(yl(X[ix[0]]) + '와 ' + yl(X[ix[0] + 1])) === 0) : null; }
    if (/변하지 않은 때/.test(t)) { let best = null, i = 0; while (i < D.length) { if (D[i] === 0) { let j = i; while (j < D.length && D[j] === 0) j++; if (!best || j - i > best[1] - best[0]) best = [i, j]; i = j; } else i++; } return best && d ? pick(d.options, o => o === yl(X[best[0]]) + '부터 ' + yl(X[best[1]]) + '까지') : null; }
    if (/처음으로 줄어든 때/.test(t)) { const i = D.findIndex(x => x < 0); return i >= 0 && d ? pick(d.options, o => o === yl(X[i + 1])) : null; }
    if (/가장 높은 때/.test(t)) { const mx = Math.max(...V); const ix = V.map((x, i) => (x === mx ? i : -1)).filter(i => i >= 0); return ix.length === 1 && d ? pick(d.options, o => o.endsWith(X[ix[0]])) : null; }
    if (/가장 많았던 해/.test(t) && /며칠|몇/.test(t)) return { num: Math.max(...V) };
    if (li.length === 2 && /(부터|에서).*(까지|에)? ?.*(늘어|줄어|자랐)/.test(t)) return { num: R6(Math.abs(V[li[1]] - V[li[0]])) };
    if (li.length === 1 && /약 몇/.test(t)) { ok(M.q.indexOf(li[0]) >= 0, '짐작 문제인데 짐작 점 없음'); const val = V[li[0]]; return d ? pick(d.options, o => o === '약 ' + val + ' ' + f.unit) : { num: val }; }
    if (li.length === 1 && /몇|며칠/.test(t)) { ok(M.q.indexOf(li[0]) < 0 && M.hidden.indexOf(li[0]) < 0, '읽기 문제인데 그 점이 비었음'); return { num: V[li[0]] }; }
    return undefined; }
  if (f.k === 'bar') { const M = measureBar(f); const it = f.x.map((x, i) => [i, t.indexOf(x)]).filter(([, p]) => p >= 0).sort((a, b) => a[1] - b[1]).map(([i]) => i);
    if (/가장 많은 .*가장 적은 .*차/.test(t)) return { num: Math.max(...M.v) - Math.min(...M.v) };
    if (it.length === 2 && /더 많은/.test(t)) return { num: M.v[it[0]] - M.v[it[1]] };
    return undefined; }
  if (f.k === 'ptable') { const tb = readTable(f); const vals = tb.items.map(r => r.v);
    if (tb.totalQ && /모두 몇/.test(t)) return { num: vals.reduce((a, b) => a + b, 0) };
    if (/얼마까지/.test(t) || /가장 많았던/.test(t)) return { num: Math.max(...vals) };
    if (/물결선/.test(t) && /어디에/.test(t) && d) { const mn = Math.min(...vals); return pick(d.options, o => o.indexOf('0과 ' + mn) === 0); }
    if (vals.length === 2 && /(줄어|늘어)/.test(t)) return { num: Math.abs(vals[1] - vals[0]) };
    return undefined; }
  if (f.k === 'panels' && /잘못 그린/.test(t) && d) { const bads = f.items.filter(p => (p.fig || p).k === 'lg' && measureLg(p.fig || p).svg.getAttribute('data-bad')); return bads.length === 1 ? pick(d.options, o => o.indexOf(bads[0].label + ' —') === 0) : null; }
  return undefined; }

/* 글에서 답을 셈 — 연도·월·시각은 떼고 남은 수로 */
const KN = { 한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9, 열: 10 };
const DEF = [[/점으로 표시하고 그 점들을 선분으로 이어 그린 그래프/, '꺾은선그래프'], [/수량을 막대 모양으로 나타낸 그래프/, '막대그래프'], [/(시간에 따른 자료의 변화를?|어떻게 달라졌는지) 알아보기 좋은 그래프/, '꺾은선그래프'], [/점들을 순서대로 무엇으로/, '선분'], [/쉽고 빠르게 그래프로 나타낼 수 있게 돕는 것/, '공학 도구'], [/평평하게 가는 곳은 값이 어떻게 된 때/, '변하지 않은 때'], [/어디에서 가져왔는지 함께 적는 것/, '출처'], [/어느 선이 무엇인지 알려 주는 이름표/, '범례']];
let nDef = 0;
function textAns(q0, d) { const t = clean(q0); let m;
  for (const [re, wd] of DEF) if (re.test(t) && /무엇|어떻게 된 때/.test(t)) { nDef++; return d && d.options ? pick(d.options, o => o === wd) : { word: wd }; }
  const tt = t.replace(/(두|세|네|다섯|여섯|일곱|여덟|아홉|열) 칸/g, (a, k) => KN[k] + '칸'); // 「한 칸」은 「한 칸의 크기」라는 뜻이라 수로 바꾸지 않는다
  if ((m = tt.match(/눈금 (\d+)칸[은이] ([\d.]+)/)) && /한 칸은 몇/.test(tt)) return { num: R6(+m[2] / +m[1]) };
  if ((m = tt.match(/한 칸이 ([\d.]+)[^0-9]*?그래프에서 .*?0에서 (\d+)칸 위/))) return { num: R6(+m[1] * +m[2]) };
  if ((m = tt.match(/한 칸이 ([\d.]+)/)) && /몇째 눈금/.test(tt)) { const v = +(tt.match(/([\d.]+) ?\S* 는 0에서 몇째/) || [])[1]; return { num: R6(v / +m[1]) }; }
  if ((m = tt.match(/가장 큰 값이 ([\d.]+)/)) && (m[2] = (tt.match(/한 칸을 ([\d.]+)/) || [])[1]) && /몇 칸/.test(tt)) return { num: R6(+m[1] / +m[2]) };
  const rest = tt.replace(/\d{4}년/g, ' ').replace(/\d+월/g, ' ').replace(/\d+시/g, ' ').replace(/1인당/g, ' ').replace(/0(에서|과)/g, ' ');
  const N = [...rest.matchAll(/\d+(?:\.\d+)?/g)].map(x => +x[0]);
  if (/물결선을 넣으려면 0과 몇/.test(t)) return { num: Math.min(...N) };
  if (/(가장 큰 값과 가장 작은 값|가장 많은 (해|종목)[과와] 가장 적은 (해|종목))의 (학생 수의 )?차/.test(t)) return { num: Math.max(...N) - Math.min(...N) };
  if (/모두 몇/.test(t) && N.length >= 2) return { num: N.reduce((a, b) => a + b, 0) };
  if (/(늘어났|줄어들었|자랐|높아졌|낮아졌|차는|더 많)/.test(t) && N.length === 2) return { num: R6(Math.abs(N[1] - N[0])) };
  return undefined; }
function optOf(res, d) { if (!res || res.opt != null || !d || !d.options) return res; if (res.word != null) return pick(d.options, o => o === res.word) || res; if (res.num != null) return pick(d.options, o => parseFloat(o) === res.num) || res; return res; }
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(got === res.num, where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('9차시 키 u5_l01~l09 · 파일 data/g4s2_math_u5.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 5단원 꺾은선그래프 · 성취기준 표시 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 5 && m.unit_title === '꺾은선그래프' && /꺾은선그래프/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\/5단원_꺾은선그래프\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소 · 곰이·펭이(4학년)', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); ok(/곰이/.test(JSON.stringify(sl[2].data)) && /펭이/.test(JSON.stringify(sl[2].data)), '동기 곰이·펭이'); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u4_l09.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4s2_math u4_l09(4단원 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_math:u4_l09'), 'from ' + rv.from); }));
T('u4_l09 「다음 단원엔」 = 꺾은선그래프', () => { const nx = PREV.u4_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /꺾은선그래프/.test(nx.preview), nx.preview); });

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0, nSrc = 0; const unread = []; const srcOnly = [];
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
const srcP = (k, q) => SRC[k].problems.find(p => normT(p.q.replace(/인가요\?$/, '일까요?')) === normT(q));
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question, d); if (ta) ta = optOf(ta, d); let fa = d.fig ? figAns(d.fig, d.question, d) : undefined; if (fa) fa = optOf(fa, d);
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; if (r === undefined) { const p = srcP(k, d.question); ok(p && p.opts, s.id + ' 셀 수 없는데 원문 보기도 없음'); nSrc++; srcOnly.push(k + ' ' + s.id); return; }
    nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 ≥ 70 (못 읽는 문항 0 · 원문 대조는 셀 수 없는 판단 문항 ≤ 2) · 그림에서 셈한 문항 ≥ 24 · 글·그림 둘 다 셈해 대조 ≥ 1', () => ok(nCheck >= 70 && nSrc <= 2 && !unread.length && nFigQ >= 24 && nBoth >= 1, 'nCheck ' + nCheck + ' · 원문 대조 ' + nSrc + ' ' + srcOnly.join(',') + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 뜻 사전 ' + nDef + ' · 못 읽음 ' + unread.join(' | ')));
T('셈기 자체 확인 — 틀린 그림·틀린 답 잡음', () => { let caught = 0;
  const f = { k: 'lg', x: ['4월', '5월', '6월', '7월', '8월'], v: [4, 15, 18, 22, 17], step: 1, max: 25, every: 5, unit: '일' };
  ok(SAME(figAns(f, '7월의 일수는 며칠인가요?'), { num: 22 }), '읽기'); ok(SAME(figAns(f, '4월부터 7월까지 며칠 늘어났나요?'), { num: 18 }), '두 때');
  ok(SAME(figAns(f, '이웃한 두 달 사이에서 가장 많이 변한 정도는 몇 일인가요?'), { num: 11 }), '변한 정도');
  const f2 = JSON.parse(JSON.stringify(f)); f2.v[3] = 21; if (!SAME(figAns(f2, '7월의 일수는 며칠인가요?'), { num: 22 })) caught++;
  const d = { options: [{ text: '5월' }, { text: '6월', correct: true }, { text: '7월' }, { text: '8월' }] }; try { checkAns('probe', optOf(figAns(f, '가장 많이 늘어난 때는 몇 월인가요?', d), d), d); } catch (e) { caught++; }
  try { checkAns('probe', textAns('해수면 높이는 2018년에 27 cm, 2022년에 32 cm 였어요. 몇 cm 높아졌을까요?'), null, '6'); } catch (e) { caught++; }
  ok(SAME(textAns('세로 눈금 다섯 칸이 25 cm 를 나타내요. 세로 눈금 한 칸은 몇 cm 일까요?'), { num: 5 }), '다섯 칸');
  ok(caught === 3, '잡은 수 ' + caught); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u5_l01\.slides\.1\.data\.items\./.test(where);
const CH = /(?<![\d.])(\(?\d+(?:\.\d+)?(?:\s*[+\-×÷]\s*\(?\d+(?:\.\d+)?\)?)+\)?)\s*=\s*(\d+(?:\.\d+)?)(?![\d.])/g;
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)\s*(cm|개|°|도|명|일|권|회|관|가구|만|톤|L)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { let lhs = m[1]; const o = (lhs.match(/\(/g) || []).length, c = (lhs.match(/\)/g) || []).length; if (o !== c) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const e = lhs.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(e)) continue; const v = Function('return (' + e + ')')(); nEq++; if (Math.abs(v - +m[2]) > 1e-9) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 30, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['25 − 15 = 11', '26 ÷ 2 = 12', '353803 − 334856 = 18946'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('830 − 630 = **200** 만 명 · 10 × 17 = 170', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k, s]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k, s])));
T('개념 36장 모두 그림 · 기본 문제 그림 27 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length === 27, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { lg: 0, pts: 0, wave: 0, sets2: 0, bar: 0, bars: 0, table: 0, src: 0, claim: 0 };
function checkLg(w0, g, b) { const M = measureLg(g); nG.lg++; const sets = g.sets || [{ v: g.v }];
  sets.forEach((s, j) => s.v.forEach((v, i) => { if (i >= (g.upto == null ? 99 : g.upto) || (g.hide || []).indexOf(i) >= 0) return; nG.pts++; ok(Math.abs(M.v[j][i] - v) <= Math.max(1e-6, M.per * 0.1 + M.unit / 2) || g.bad === 'wavein' && v < (g.base || 0), w0 + ' 점 ' + g.x[i] + ' 다시 잰 값 ' + M.v[j][i] + ' ≠ ' + v); }));
  ok(Math.abs(M.step - g.step) < 1e-9, w0 + ' 눈금 한 칸 ' + M.step + ' ≠ ' + g.step);
  const nc = Math.round(((g.max) - (g.base || 0)) / g.step); ok(M.gl.length === nc + 1 + (g.base ? 1 : 0), w0 + ' 눈금선 수 ' + M.gl.length);
  const all = [].concat(...sets.map(s => s.v)); ok(Math.max(...all) <= M.top + 1e-9, w0 + ' 가장 큰 값이 눈금 끝 밖');
  if (g.base) { nG.wave++; ok(M.wave && M.svg.querySelector('rect.lgw'), w0 + ' 물결선 없음'); if (g.bad !== 'wavein') ok(Math.min(...all) >= g.base, w0 + ' 물결선이 자료 범위 안(가장 작은 값 ' + Math.min(...all) + ' < ' + g.base + ')'); else ok(Math.min(...all) < g.base, w0 + ' 잘못 그린 그림인데 범위 밖'); } else ok(!M.wave, w0 + ' 물결선 있음');
  if (b === 'basic_problem') ok(!g.vals && !g.mark, w0 + ' 문제 그림에 점 위 수·짚는 점');
  if (g.vals) { const txts = M.names; sets.forEach(s => s.v.forEach(v => ok(txts.indexOf(String(v)) >= 0, w0 + ' 점 위 수 ' + v))); }
  (g.q || []).forEach(i => ok(M.q.indexOf(i) >= 0, w0 + ' 짐작 점 ' + i));
  if (g.sets) { nG.sets2++; ok(g.sets.every(s => M.names.indexOf(s.name) >= 0), w0 + ' 범례 이름'); ok(M.svg.querySelectorAll('path.ll').length === 2, w0 + ' 선 둘'); }
  if (g.title) ok(M.names.indexOf(g.title) >= 0, w0 + ' 제목');
  g.x.forEach(x => ok(M.names.indexOf(x) >= 0, w0 + ' 가로 이름 ' + x));
  if (g.at) { const xs = [...M.svg.querySelectorAll('circle.lp')].map(c => +c.getAttribute('cx')); const dx = xs.slice(1).map((x, i) => x - xs[i]); const da = g.at.slice(1).map((a, i) => a - g.at[i]); dx.forEach((v, i) => ok(Math.abs(v / da[i] - dx[0] / da[0]) < 0.2, w0 + ' 가로 자리 비율')); }
  if (g.bad === 'curve') ok(/ C/.test(M.svg.querySelector('path.ll').getAttribute('d')), w0 + ' 곡선 아님'); else if (!g.dots) ok(!/ C/.test(M.svg.querySelector('path.ll').getAttribute('d')), w0 + ' 곧은 선분 아님');
  if (g.bad === 'order') { const d0 = M.svg.querySelector('path.ll').getAttribute('d'); const xs = [...d0.matchAll(/[ML]([\d.]+) /g)].map(m => +m[1]); ok(xs.some((x, i) => i && x < xs[i - 1]), w0 + ' 차례 건너뜀 아님'); }
  else if (!g.bad && !g.dots) { const d0 = M.svg.querySelector('path.ll').getAttribute('d'); const xs = [...d0.matchAll(/[ML]([\d.]+) /g)].map(m => +m[1]); ok(xs.every((x, i) => !i || x > xs[i - 1]), w0 + ' 점을 순서대로 잇지 않음'); } }
parts.forEach(([w0, g, b]) => { if (g.k === 'lg') T(w0 + ' 꺾은선 — 점 높이 다시 잼 = 자료 · 눈금 · 물결선 · 문제 그림 수 없음', () => checkLg(w0, g, b)); });
T('막대그래프·표 — 막대 길이 다시 잼 = 자료 · 표 값 = 자료', () => parts.forEach(([w0, g]) => { if (g.k === 'bar') { nG.bar++; const M = measureBar(g); g.v.forEach((v, i) => { nG.bars++; ok(Math.abs(M.v[i] - v) < 0.05, w0 + ' 막대 ' + g.x[i] + ' ' + M.v[i] + ' ≠ ' + v); }); } if (g.k === 'ptable') { nG.table++; const tb = readTable(g); g.items.forEach((r, i) => ok(tb.items[i].v === r.v || tb.items[i].v === null && g.q, w0 + ' 표 ' + r.name)); } }));
/* 자기주도 원문 renderModels 자료와 같음 — 제목이 같은 원문 그래프·표의 수 차례와 같아야 함 */
const MODEL = []; KEYS.forEach(k => { const html = fs.readFileSync(path.join(TDIR, L[k].meta.live_url), 'utf8'); const i = html.indexOf('(function renderModels'); const body = html.slice(i, html.indexOf('})();', i));
  [...body.matchAll(/(lineChart|barChart)\(\[(\[[^\]]*\](?:,\[[^\]]*\])*)\],\s*\{title:'([^']+)'/g)].forEach(m => { const rows = [...m[2].matchAll(/\['[^']*',([\d.,]+)\]/g)].map(r => r[1].split(',').map(Number)); MODEL.push({ title: m[3], cols: rows[0].map((_, j) => rows.map(r => r[j]).join(',')) }); });
  [...body.matchAll(/dataTable\(\[\[[^\]]*\](,\[[^\]]*\])+\],\{title:'([^']+)'/g)].forEach(m => { const rows = [...m[0].matchAll(/\['([^']*)'((?:,'[^']*')+)\]/g)].slice(1).map(r => r[2].slice(1).split(',').map(x => x.replace(/'/g, ''))); rows.forEach(r => MODEL.push({ title: m[2], cols: [r.join(',')], table: true })); }); });
T('그림 자료가 자기주도 원문 renderModels 자료와 같음 (같은 제목의 원문 그래프·표 수 차례)', () => { const off = []; parts.forEach(([w0, g]) => { const ttl = g.title; if (!ttl || ['lg', 'bar', 'ptable'].indexOf(g.k) < 0) return; const vs = g.k === 'ptable' ? [g.items.map(r => r.v).join(',')] : (g.sets || [{ v: g.v }]).map(s => s.v.join(','));
  vs.forEach(v => { nG.src++; const hit = MODEL.some(mo => (mo.title === ttl || mo.title.replace('의 인구수', ' 인구수') === ttl.replace('의 인구수', ' 인구수') || ttl.indexOf(mo.title) >= 0 || mo.title.indexOf(ttl.split(' ')[0]) >= 0 && g.k === 'ptable') && mo.cols.some(c => c === v || c.indexOf(v) >= 0)); if (!hit) off.push(w0 + ' 「' + ttl + '」 ' + v); }); });
  ok(!off.length, '원문에 없는 자료 ' + off.join(' | ')); ok(MODEL.length >= 40, 'renderModels 못 읽음 ' + MODEL.length); });
T('개념 글 속 「N월은 X일」·「가장 많았던 때」 = 그림 셈', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept' && s.data.fig && s.data.fig.k === 'lg' && !s.data.fig.sets).forEach(s => { const g = s.data.fig, M = measureLg(g), t = clean(s.data.content); let m;
  const re = /(\d+)월은 (\d+)일/g; while ((m = re.exec(t))) { const i = g.x.indexOf(m[1] + '월'); if (i < 0) continue; nG.claim++; ok(M.v[0][i] === +m[2], k + ' ' + s.id + ' ' + m[0]); }
  if ((m = t.match(/가장 많았던 때는 (\d{4})년, 가장 적었던 때는 (\d{4})년/))) { nG.claim++; const V = M.v[0]; ok(g.x[V.indexOf(Math.max(...V))] === m[1] && g.x[V.indexOf(Math.min(...V))] === m[2], k + ' ' + s.id + ' 많고 적은 때'); }
  if ((m = t.match(/가장 많이 늘어난 때는 (\d{4})년/))) { nG.claim++; const D = diffs(M.v[0]); ok(g.x[D.indexOf(Math.max(...D)) + 1] === m[1], k + ' ' + s.id + ' 늘어난 때'); }
  if ((m = t.match(/가장 많이 줄어든 때는 (\d{4})년/))) { nG.claim++; const D = diffs(M.v[0]); ok(g.x[D.indexOf(Math.min(...D)) + 1] === m[1], k + ' ' + s.id + ' 줄어든 때'); }
  if ((m = t.match(/(\d{4})년부터 (\d{4})년까지가 그래요/))) { nG.claim++; const a = g.x.indexOf(m[1]), b = g.x.indexOf(m[2]); ok(M.v[0].slice(a, b + 1).every(v => v === M.v[0][a]), k + ' ' + s.id + ' 변하지 않은 때'); }
  if ((m = t.match(/6월은 \*?\*?약 (\d+)/)) || (m = t.match(/6월은 약 (\d+)/))) { nG.claim++; ok(M.v[0][g.x.indexOf('6월')] === +m[1], k + ' 짐작 점'); }
  if ((m = t.match(/세로 눈금 한 칸이 (\d+)(?:일|cm)이므로 (\d+)월은 (\d+)/))) { nG.claim++; ok(M.step === +m[1] && M.v[0][g.x.indexOf(m[2] + '월')] === +m[3], k + ' 한 칸·값'); } }));
  ok(nG.claim >= 4, '대조 ' + nG.claim); });
T('그림 부품 수 — lg ≥ 50 · 점 ≥ 250 · 물결선 ≥ 14 · 두 자료 ≥ 5 · 막대 ≥ 10 · 표 ≥ 8 · 원문 대조 ≥ 60', () => ok(nG.lg >= 50 && nG.pts >= 250 && nG.wave >= 14 && nG.sets2 >= 5 && nG.bar >= 10 && nG.table >= 8 && nG.src >= 60, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 점·물결선 범위 안·문제 그림 수·차례 어긋남 잡음', () => { let caught = 0; const base = { k: 'lg', x: ['2018', '2019', '2020', '2021', '2022'], v: [31, 34, 36, 37, 38], step: 1, base: 30, max: 40 };
  const tries = [Object.assign({}, base, { base: 33 }), Object.assign({}, base, { vals: true }), Object.assign({}, base, { bad: 'order' })];
  tries.forEach((g, i) => { try { checkLg('probe' + i, g, 'basic_problem'); if (i === 2) { const d0 = measureLg(g).svg.querySelector('path.ll').getAttribute('d'); const xs = [...d0.matchAll(/[ML]([\d.]+) /g)].map(m => +m[1]); if (!xs.every((x, j) => !j || x > xs[j - 1])) caught++; } } catch (e) { caught++; } });
  const wrong = JSON.parse(JSON.stringify(base)); const h = FIG.render(wrong).replace(/(<circle class="lp" data-i="2" data-s="0" cx="[\d.]+" cy=")([\d.]+)/, (a, p, y) => p + (+y - 30)); const d = docOf(h); const fake = { render: () => h };
  const keep = FIG.render; FIG.render = fake.render; try { checkLg('probe-move', base, 'concept'); } catch (e) { caught++; } FIG.render = keep;
  ok(caught === 4, '잡은 수 ' + caught); });

console.log('═══ H. 재료 충실 ═══');
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제(보기·정답 그대로)', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(x.text));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(normT(s.data.content)) >= 0 || src.slides.some(x => { const full = normT(x.text); let at = 0; return String(s.data.content).split('\n').every(ln => { const q = normT(ln); const j = q ? full.indexOf(q, at) : -1; if (j < 0) return false; at = j + q.length; return true; }); }), s.id + ' 원문 아님(원문 문장 순서 부분열도 아님)'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const p = srcP(k, s.data.question); ok(p, s.id + ' 문제 원문 아님'); if (p.opts) ok(JSON.stringify(s.data.options.map(o => o.text)) === JSON.stringify(p.opts) && s.data.options[p.ci].correct, s.id + ' 보기·정답'); else ok(s.data.answer === +p.a, s.id + ' 답'); }); }));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(nsp); const dup = n.filter((x, j) => n.indexOf(x) !== j); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('마지막 차시 「다음 단원엔」 = 6단원 평면도형의 이동 · 다른 차시는 「다음 시간엔」 · 차단 어휘 0(교과 용어 「물결선」만 예외)', () => { const nx = L.u5_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /평면도형의 이동/.test(nx.preview), '다음 단원'); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); const all = JSON.stringify(L).replace(/물결선/g, ''); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, '차단 어휘 ' + b)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k, noCover) => L[k].slides.filter(s => s.block !== 'next_lesson' && !(noCover && s.block === 'cover')).map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k, noTitle) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary + (noTitle ? '' : SRC[k].title);
const FIRST = [['꺾은선그래프', 2], ['물결선', 2], ['공학 도구', 4], ['이지통계', 4], ['범례', 8]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { const nc = w0 === '꺾은선그래프'; KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k, nc).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k, nc).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(srcTxt(KEYS[n - 1]).indexOf(w0) >= 0, '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('l01 「꺾은선그래프」는 표지 제목에만', () => { ok(/꺾은선그래프/.test(L.u5_l01.slides[0].data.title), '표지'); ok(stud('u5_l01', true).indexOf('꺾은선그래프') < 0, '표지 밖'); });
T('요약 「다음」 줄·arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { const nx = FIRST.filter(([, n]) => n > i + 1).map(([w0]) => w0); const ar = JSON.stringify(L[k].slides[16].data); nx.forEach(w0 => ok(ar.indexOf(w0) < 0, k + ' 요약에 「' + w0 + '」')); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u5_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('물결선') < 0, 'l01 개념 장 깨끗'); probe.content += ' 물결선'; ok(JSON.stringify(probe).indexOf('물결선') >= 0, '심은 낱말'); });

console.log('\n게이트 g4s2 수학 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
