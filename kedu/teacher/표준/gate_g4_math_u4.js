/* gate_g4_math_u4.js — 4학년 1학기 수학 4단원 「삼각형」 케이티처 2세대 게이트 (61차, 베프 — u2 각도 게이트 틀 + 삼각형 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4 u3_l09 → l01 → … → l08)
   E 문제 정답 재계산 — 글 문제(세 각 180°·삼각형 이름(각·변)·이름 개수·이등변 같은 두 각·꼭대기 각·정삼각형 60°·둘레와 한 변·뜻 묻기)
     + 그림 문제 — 렌더된 SVG 꼭짓점에서 각·변을 다시 재어 셈(가·나·다·라 고르기 · 개수 세기 · 모르는 각 · 모르는 변 · 예각 개수 · 이름 개수 · 색종이 조각 이름·조건)
   F 식 전수 · 「N°는 예각/직각/둔각」 판정 전수 · 문장 속 「세 각이 A°, B°, C°」 합 180(일부러 틀린 예는 「그릴 수 없」 장만)
   G 그림(tri 그린 꼴의 각 = 데이터 · 세 변 = len 비율 · 같은 변 눈금 수 · 각 글자·물음표 · 이름 글자 ↔ 실제 이름 · paper 조각 넓이 합 = 색종이 · 조각 이름)
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u4.js */
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
const L = load(path.join(TDIR, 'data/g4_math_u4.js'));
const U3 = load(path.join(TDIR, 'data/g4_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u4.json'), 'utf8'));
const KEYS = Array.from({ length: 8 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '삼각형', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;

/* ── 게이트 자체 삼각형 셈 ── */
const kindA = (d) => (d < 89.4 ? '예각' : d <= 90.6 ? '직각' : '둔각');
const kindName = (A) => { const m = Math.max(...A); return m > 90.6 ? '둔각삼각형' : m >= 89.4 ? '직각삼각형' : '예각삼각형'; };
const sideName = (S) => { const e = (x, y) => Math.abs(x - y) <= 0.012 * Math.max(x, y); const n = [e(S[0], S[1]), e(S[1], S[2]), e(S[2], S[0])].filter(Boolean).length; return n === 3 ? '정삼각형' : n ? '이등변삼각형' : ''; };
const namesOf = (A, S) => [kindName(A)].concat(sideName(S) ? [sideName(S)] : []);
const sidesFromAngs = (A) => [Math.sin(A[2] * Math.PI / 180), Math.sin(A[0] * Math.PI / 180), Math.sin(A[1] * Math.PI / 180)];
const degs = (s) => [...String(s).matchAll(/(\d+)\s*°/g)].map(m => +m[1]);
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
/* 렌더된 SVG 에서 다시 잼 */
const ptsOf = (el) => el.getAttribute('points').split(' ').map(t => t.split(',').map(Number));
const angOf = (P) => P.map((p, i) => { const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length]; const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]]; return Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)) * 180 / Math.PI; });
const lenOf = (P) => P.map((p, i) => Math.hypot(P[(i + 1) % 3][0] - p[0], P[(i + 1) % 3][1] - p[1]));
const area = (P) => Math.abs(P.reduce((a, p, i) => a + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0)) / 2;
function measureTri(f) { const d = docOf(FIG.render(f)); const P = ptsOf(d.querySelector('svg.fig-tri polygon')); const A = angOf([P[0], P[1], P[2]]); const S = lenOf(P); return { A, S, names: namesOf(A, S), d }; }
function measurePaper(f) { const d = docOf(FIG.render(f)); const pcs = [...d.querySelectorAll('polygon.pp-piece')].map(ptsOf); const rest = [...d.querySelectorAll('polygon.pp-rest')].map(ptsOf); return { pcs, rest, kinds: pcs.map(P => (P.length === 3 ? kindName(angOf(P)) : '')), d }; }
const panelsOf = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig, p.label]) : null);
const WANT = [[/직각삼각형/, m => m.names[0] === '직각삼각형'], [/세각이모두예각|예각삼각형/, m => m.names[0] === '예각삼각형'], [/둔각삼각형/, m => m.names[0] === '둔각삼각형'], [/정삼각형/, m => m.names.indexOf('정삼각형') >= 0], [/이등변삼각형/, m => m.names.indexOf('이등변삼각형') >= 0 && m.names.indexOf('정삼각형') < 0]];
const pick = (q) => { const t = nsp(q); for (const [re, fn] of WANT) if (re.test(t)) return fn; return null; };
/* 그림에서 답을 셈 */
function figAns(f, q) { if (!f) return undefined; const t = nsp(q); const pn = panelsOf(f);
  if (f.k === 'tri' && f.q != null) { const m = measureTri(f); return Math.round(m.A[f.q]); }
  if (f.k === 'tri' && f.lq != null) return +f.len[f.lq];
  if (f.k === 'tri' && /예각은몇개/.test(t)) return measureTri(f).A.filter(a => kindA(a) === '예각').length;
  if (f.k === 'tri' && /이름은몇개|이름은몇개|붙일수있는이름은몇개|이름이몇개/.test(t)) return measureTri(f).names.length;
  if (f.k === 'tri' && /이름을모두/.test(t)) return { names: measureTri(f).names };
  if (f.k === 'paper') { const m = measurePaper(f); if (/둔각삼각형은몇번/.test(t)) { const i = m.kinds.filter(k => k === '둔각삼각형').length === 1 ? m.kinds.indexOf('둔각삼각형') : -1; return i < 0 ? null : '①②③④⑤⑥'[i] + '번'; } if (/직각삼각형조각은모두몇개/.test(t)) return m.kinds.filter(k => k === '직각삼각형').length; }
  if (pn && pn.every(([g]) => g.k === 'paper') && /조건을모두만족/.test(t)) { const good = pn.filter(([g]) => { const m = measurePaper(g); const tot = m.pcs.reduce((a, P) => a + area(P), 0) + m.rest.reduce((a, P) => a + area(P), 0); return !m.rest.length && m.pcs.every(P => P.length === 3) && ['예각삼각형', '직각삼각형', '둔각삼각형'].every(k => m.kinds.indexOf(k) >= 0) && tot > 0; }); return good.length === 1 ? good[0][1] : good.length === pn.length ? '둘 다 만족해요' : good.length ? null : '둘 다 만족하지 못해요'; }
  if (pn && pn.every(([g]) => g.k === 'tri')) { const ms = pn.map(([g]) => measureTri(g)); let fn = null;
    if (/크기가같은두각이있는|이등변삼각형은어느것/.test(t) && /각도기/.test(t)) fn = m => m.A.some((a, i) => m.A.some((b, j) => i !== j && Math.abs(a - b) < 0.6)) && !m.A.every(a => Math.abs(a - m.A[0]) < 0.6);
    if (/정삼각형은어느것/.test(t) && /각도기/.test(t)) fn = m => m.A.every(a => Math.abs(a - 60) < 0.6);
    if (!fn) fn = pick(q); if (!fn) return undefined; const hit = ms.map(fn);
    if (/어느것/.test(t)) return hit.filter(Boolean).length === 1 ? pn[hit.indexOf(true)][1] : null; if (/모두몇개/.test(t)) return hit.filter(Boolean).length; }
  return undefined; }
const FACT = [[/한각이직각인삼각형을무엇/, '직각삼각형'], [/세각이모두예각인삼각형을무엇/, '예각삼각형'], [/한각이둔각인삼각형을무엇/, '둔각삼각형'], [/두변의길이가같은삼각형을무엇/, '이등변삼각형'], [/세변의길이가같은삼각형을무엇/, '정삼각형'],
  [/이등변삼각형은두각의크기가어떤/, '같아요'], [/이등변삼각형의성질은어떻게/, '반으로 접어 두 각을 포개 봤어요'], [/정삼각형은세각의크기가어떤/, '모두 같아요'], [/삼각형을나누는두잣대/, '각의 크기와 변의 길이'], [/각으로붙이는이름은몇개/, 1],
  [/색종이를자를때첫번째조건/, '남김없이 모두 자르기'], [/색종이모서리의각은몇도/, 90], [/둔각삼각형에는둔각이몇개/, 1], [/한각이직각이고두변의길이가같은삼각형.*이름을모두/, { names: ['직각삼각형', '이등변삼각형'] }],
  [/대각선으로한번자른조각에서직각이아닌두각/, 45], [/정삼각형을반으로접었어요.*나뉜한각/, 30], [/세각의크기의합은몇도/, 180], [/정삼각형의한각은몇도|세변의길이가같은삼각형의한각은몇도/, 60]];
function leadA(q0) { const t = nsp(q0); let m;
  for (const [re, a] of FACT) if (re.test(t)) return a;
  if ((m = t.match(/삼각형의두각이(\d+)°,(\d+)°.*나머지한각은몇도이고,어떤각/))) return 180 - m[1] - m[2];
  if ((m = t.match(/삼각형의두각이(\d+)°,(\d+)°.*어떤삼각형/))) return kindName([+m[1], +m[2], 180 - m[1] - m[2]]);
  if ((m = t.match(/삼각형의두각이(\d+)°,(\d+)°.*나머지한각/))) return 180 - m[1] - m[2];
  if ((m = t.match(/세각이(\d+)°,(\d+)°,(\d+)°인삼각형/))) { const A = [+m[1], +m[2], +m[3]]; if (A[0] + A[1] + A[2] !== 180) return 'X'; const N = namesOf(A, sidesFromAngs(A)); if (/이름을모두/.test(t)) return { names: N }; if (/이름은몇개/.test(t)) return N.length; if (/어떤삼각형/.test(t)) return N[0]; }
  if ((m = t.match(/이등변삼각형에서크기가같은두각이각각(\d+)°/))) return 180 - 2 * m[1];
  if ((m = t.match(/이등변삼각형의꼭대기각이(\d+)°/))) return (180 - m[1]) / 2;
  if ((m = t.match(/한변이(\d+)cm인정삼각형.*세변의길이의합/))) return 3 * m[1];
  if ((m = t.match(/세변의길이의합이(\d+)cm인정삼각형.*한변/))) return m[1] / 3;
  if ((m = t.match(/세변의길이의합이(\d+)cm인이등변삼각형.*같은두변이각각(\d+)cm.*나머지한변/))) return m[1] - 2 * m[2];
  if ((m = t.match(/세변의길이가(\d+)cm,(\d+)cm,(\d+)cm인삼각형은어떤/))) return sideName([+m[1], +m[2], +m[3]]) || '세 변의 길이가 모두 다른 삼각형';
  if ((m = t.match(/정삼각형(세|두)개의한각씩을한점에모으면/))) return 60 * (m[1] === '세' ? 3 : 2);
  if ((m = t.match(/직각삼각형(\d+)개,예각삼각형(\d+)개,둔각삼각형(\d+)개.*모두몇개/))) return +m[1] + +m[2] + +m[3];
  return null; }
function same(a, v) { if (v && typeof v === 'object' && v.names) { const got = String(a).replace(/\*\*/g, '').split(/[,·]/).map(x => x.trim()).filter(Boolean); return got.length === v.names.length && v.names.every(n => got.indexOf(n) >= 0); }
  if (typeof v === 'number') { const d = String(a).replace(/\(.*?\)/g, '').match(/\d+/); return !!d && +d[0] === v; }
  const A = nsp(String(a).replace(/\(.*?\)/g, '')), V = nsp(v); return A === V || A.indexOf(V) === 0 || V.indexOf(A) === 0; }

console.log('═══ A. 로드 ═══');
T('8차시 키 u4_l01~l08', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · 4단원 삼각형 · 성취기준 표시 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 4 && m.unit_title === '삼각형' && /삼각형/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex09 = U3.u3_l09.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4 u3_l09') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex09;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u3_l09'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const fa = figAns(d.fig, d.question); const la = leadA(d.question);
    if (d.fig) { const h = FIG.render(d.fig); ok(!/NaN|undefined/.test(h), s.id + ' 그림 깨짐'); if (d.fig.k === 'tri' && (d.fig.q != null || d.fig.lq != null)) ok([...docOf(h).querySelectorAll('text')].some(t => /\?/.test(t.textContent)), s.id + ' 그림에 물음표 칸 없음 — 답이 보임'); }
    ok(fa !== null, s.id + ' 그림에서 답이 하나로 안 정해짐'); if (fa !== undefined) nFigQ++; if (fa !== undefined && la != null) { nBoth++; ok(JSON.stringify(fa) === JSON.stringify(la), s.id + ' 그림 셈 ' + JSON.stringify(fa) + ' ≠ 글 셈 ' + JSON.stringify(la)); }
    const v = fa !== undefined ? fa : la;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const cor = d.options.find(o => o.correct).text;
      if (v != null) { nCheck++; ok(same(cor, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v) + ' ≠ ' + cor); d.options.filter(o => !o.correct).forEach(o => ok(!same(o.text, v) || typeof v === 'number', s.id + ' 오답 보기도 맞음: ' + o.text)); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id);
      ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadA(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[t].a); } else unread.push(k + ' ' + t); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadA(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 ≥ 64 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 18', () => ok(nCheck >= 64 && !unread.length && nFigQ >= 18, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 180°·이름·이등변·정삼각형·변', () => {
  ok(leadA('삼각형의 두 각이 **40°**, **30°**예요. 나머지 한 각은 몇 도일까요?') === 110 && leadA('삼각형의 두 각이 35°, 45°예요. 이 삼각형은 어떤 삼각형일까요?') === '둔각삼각형', '180°·각 이름');
  ok(same('예각삼각형, 이등변삼각형', leadA('세 각이 30°, 75°, 75°인 삼각형이에요. 이름을 모두 말해 볼까요?')) && !same('예각삼각형', leadA('세 각이 30°, 75°, 75°인 삼각형이에요. 이름을 모두 말해 볼까요?')) && leadA('세 각이 30°, 75°, 75°인 삼각형이에요. 이름은 몇 개일까요?') === 2, '이름');
  ok(leadA('이등변삼각형의 꼭대기 각이 40°예요.') === 70 && leadA('이등변삼각형에서 크기가 같은 두 각이 각각 70°예요.') === 40 && leadA('세 변의 길이의 합이 20 cm인 이등변삼각형이에요. 길이가 같은 두 변이 각각 7 cm일 때, 나머지 한 변은 몇 cm일까요?') === 6, '이등변');
  ok(figAns({ k: 'panels', items: [{ fig: { k: 'tri', len: [7, 7, 7] }, label: '가' }, { fig: { k: 'tri', len: [5, 5, 8] }, label: '나' }, { fig: { k: 'tri', len: [6, 6, 6] }, label: '다' }] }, '정삼각형은 모두 몇 개일까요?') === 2, '그림 세기');
  ok(figAns({ k: 'panels', items: [{ fig: { k: 'tri', angs: [90, 40, 50] }, label: '가' }, { fig: { k: 'tri', angs: [70, 60, 50] }, label: '나' }] }, '세 각이 모두 예각인 삼각형은 어느 것일까요?') === '나', '그림 고르기');
  ok(figAns({ k: 'paper', pieces: [[[0, 4], [0, 0], [1, 0]], [[0, 4], [3, 4], [1, 0]], [[3, 4], [4, 4], [1, 0]], [[1, 0], [4, 4], [4, 0]]] }, '둔각삼각형은 몇 번 조각일까요?') === '③번', '색종이'); });

console.log('═══ F. 식·판정 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'); if (!/^[\d\s*+\-/()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = ' ' + String(s0).replace(/\*\*/g, '').replace(/°/g, ''); let m; const re = /(\d+(?:\s*[×÷+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×÷+−])/g;
  while ((m = re.exec(s))) { const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재계산 (' + nEq + '개) 틀림 0', () => ok(bad.length === 0 && nEq >= 30, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 셋 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['70° + 60° + 50° = 190°', '180 ÷ 3 = 50', '180 − 40 = 150'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('180 − 70 − 70 = 40 · 140 ÷ 2 = 70 · 60 × 6 = 360', 'ok'); ok(bad.length === b0, '오탐'); bad.length = b0; });
const KB2 = []; let nKind = 0;
const kcheck = (s0, where) => { const s = String(s0).replace(/\*\*/g, ''); let m; const re = /((?:\d+°\s*[·,]?\s*)+)(?:는|은|가|이|→)?\s*(예각|직각|둔각)(?!\s*\d|의|을|를|과|와|보다|삼각형|\(|\s*[·,]?\s*\d)/g;
  while ((m = re.exec(s))) { const ds = degs(m[1]); if (!ds.length) continue; if (/보다|가운데|중/.test(s.slice(m.index + m[0].length, m.index + m[0].length + 3))) continue; ds.forEach(d => { nKind++; if (kindA(d) !== m[2]) KB2.push(where + ': ' + d + '° ' + m[2]); }); } };
allStr.forEach(([s0, where]) => { if (!skip(where) && !/\.q$/.test(where)) kcheck(s0, where); });
T('「N°는 예각·직각·둔각」 판정 전수 (' + nKind + '건) 틀림 0', () => ok(KB2.length === 0 && nKind >= 4, 'nKind ' + nKind + ' ' + KB2.slice(0, 6).join(' | ')));
T('「세 각이 A°, B°, C°」 문장 합 180 전수 (일부러 틀린 예는 「그릴 수 없」 장만)', () => { let n = 0; KEYS.forEach(k => L[k].slides.forEach(s => { const j = JSON.stringify(s.data); [...j.matchAll(/세 각이 (?:\*\*)?(\d+)°, (\d+)°, (\d+)°/g)].forEach(m => { n++; const t = +m[1] + +m[2] + +m[3]; ok(t === 180 || /그릴 수 없/.test(j), k + ' ' + s.id + ' ' + m[0] + ' 합 ' + t); }); [...j.matchAll(/(\d+)°, (\d+)°, (\d+)°인 삼각형/g)].forEach(m => { n++; const t = +m[1] + +m[2] + +m[3]; ok(t === 180 || /그릴 수 없/.test(j), k + ' ' + s.id + ' ' + m[0] + ' 합 ' + t); }); })); ok(n >= 8, 'n ' + n); });
T('이름 문장 — 「A°, B°, C°인 삼각형 … 예각/직각/둔각삼각형」 보기 정답 전수', () => KEYS.forEach(k => L[k].slides.filter(s => s.data.options && /세 각이/.test(s.data.question)).forEach(s => { const ds = degs(s.data.question); if (ds.length !== 3) return; const nm = kindName(ds); const cor = s.data.options.find(o => o.correct).text; if (/어떤 삼각형/.test(s.data.question)) ok(cor.indexOf(nm) >= 0, s.id + ' ' + nm + ' ≠ ' + cor); })));

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab])));
T('개념 32장 모두 그림 · 기본 문제 그림 ≥ 18 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 18, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const NAME_RE = /(예각|직각|둔각)삼각형|이등변삼각형|정삼각형/g;
let nG = { tri: 0, paper: 0, named: 0 };
T('tri — 그린 꼴의 각 = 데이터 · 세 변 = len 비율 · 같은 변 눈금 수 · 각 글자·물음표 · 이름 글자 ↔ 실제 이름', () => parts.filter(([, g]) => g.k === 'tri').forEach(([w0, g, , lab]) => { nG.tri++; const m = measureTri(g); const tx = [...m.d.querySelectorAll('text')].map(t => t.textContent);
  ok(Math.abs(m.A.reduce((a, b) => a + b, 0) - 180) < 0.5, w0 + ' 각 합');
  if (g.angs) { ok(g.angs.reduce((a, b) => a + b, 0) === 180, w0 + ' 데이터 합 ' + g.angs.join('+')); g.angs.forEach((a, i) => ok(Math.abs(m.A[i] - a) < 0.8, w0 + ' 꼭짓점 ' + i + ' ' + m.A[i].toFixed(1) + ' ≠ ' + a)); }
  if (g.len) { const r = m.S.map((s, i) => s / g.len[i]); ok(r.every(x => Math.abs(x - r[0]) / r[0] < 0.01), w0 + ' 변 비율 ' + m.S.map(x => x.toFixed(0)).join(',') + ' ≠ ' + g.len.join(',')); const [a, b, c] = g.len.map(Number); ok(a + b > c && b + c > a && c + a > b, w0 + ' 삼각형이 안 됨'); if (g.cm !== false) g.len.forEach((v, i) => ok(tx.indexOf(g.lq === i ? '? cm' : v + ' cm') >= 0, w0 + ' 변 글자 ' + v)); }
  const ticks = m.d.querySelectorAll('line.t-tick').length; const eqSides = [0, 1, 2].filter(i => [0, 1, 2].some(j => j !== i && Math.abs(m.S[i] - m.S[j]) <= 0.012 * Math.max(m.S[i], m.S[j]))).length; ok(ticks === (g.ticks === false ? 0 : eqSides), w0 + ' 눈금 ' + ticks + ' ≠ 같은 변 ' + eqSides);
  ok(m.d.querySelector('svg').getAttribute('data-kind') === m.names[0], w0 + ' data-kind');
  const sh = g.show === false ? [] : g.show == null ? ((g.mark || 'kind') === 'deg' ? [0, 1, 2] : []) : [].concat(g.show); sh.forEach(i => { if (i !== g.q) ok(tx.indexOf(Math.round(m.A[i]) + '°') >= 0, w0 + ' 각 글자 ' + i); });
  if (g.q != null) { ok(tx.indexOf('?') >= 0, w0 + ' 물음표'); const hid = Math.round(m.A[g.q]) + '°'; ok(!tx.some(t => t === hid) || sh.some(i => i !== g.q && Math.round(m.A[i]) + '°' === hid), w0 + ' 모르는 각이 보임'); }
  [g.label, lab].filter(Boolean).forEach(t => { const nm = String(t).match(NAME_RE) || []; nm.forEach(n => { nG.named++; ok(m.names.indexOf(n) >= 0 || (n === '이등변삼각형' && m.names.indexOf('정삼각형') >= 0), w0 + ' 글자 「' + n + '」 ≠ 실제 ' + m.names.join('·')); }); if (nm.length && /·/.test(t)) ok(nm.length === m.names.length, w0 + ' 이름 수 ' + nm.length + ' ≠ ' + m.names.length); });
  if (g.mark === 'kind') { const reds = (m.d.body.innerHTML.match(/stroke="#F2545B"/g) || []).length, blues = (m.d.body.innerHTML.match(/stroke="#3E6FCF" stroke-width="5"/g) || []).length; ok(reds === m.A.filter(a => kindA(a) === '예각').length && blues === m.A.filter(a => kindA(a) === '둔각').length, w0 + ' 색 표시 빨강 ' + reds + ' 파랑 ' + blues); } }));
T('paper — 조각 넓이 합 = 색종이 · 겹침 없음 · 조각 이름 · 글자 ↔ 실제', () => parts.filter(([, g]) => g.k === 'paper').forEach(([w0, g]) => { nG.paper++; const m = measurePaper(g); const tot = m.pcs.concat(m.rest).reduce((a, P) => a + area(P), 0); ok(Math.abs(tot - 196 * 196) < 50, w0 + ' 넓이 ' + tot.toFixed(0));
  if (g.label) { const want = {}; (g.label.match(/(예각|직각|둔각)삼각형 (\d+)/g) || []).forEach(x => { const mm = x.match(/(\S+) (\d+)/); want[mm[1]] = +mm[2]; }); Object.keys(want).forEach(n => ok(m.kinds.filter(x => x === n).length === want[n], w0 + ' ' + n + ' 수')); } }));
T('삼각형 그림 부품 수 — tri ≥ 90 · paper ≥ 7 · 이름 글자 대조 ≥ 20 · 차시마다 삼각형 그림', () => { ok(nG.tri >= 90 && nG.paper >= 7 && nG.named >= 20, JSON.stringify(nG)); KEYS.forEach(k => ok(L[k].slides.some(s => /"k":"(tri|paper)"/.test(JSON.stringify(s.data.fig || {}))), k)); });
T('그림 검사기 자체 확인 — 틀린 그림 잡음', () => { const m1 = measureTri({ k: 'tri', len: [5, 5, 8] }); ok(m1.names.join() === '둔각삼각형,이등변삼각형', '5·5·8 ' + m1.names); const m2 = measureTri({ k: 'tri', angs: [60, 60, 60] }); ok(m2.names.indexOf('정삼각형') >= 0, '정삼각형'); const m3 = measureTri({ k: 'tri', angs: [50, 70, 60] }); ok(m3.names.length === 1, '이름 하나'); });

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
const FIRST = [['예각삼각형', 2], ['둔각삼각형', 2], ['이등변삼각형', 3], ['정삼각형', 3], ['성질', 4]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u4_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('이등변') < 0, 'l01 개념 장 깨끗'); probe.content += ' 이등변삼각형'; ok(JSON.stringify(probe).indexOf('이등변') >= 0, '심은 낱말'); });

console.log('\n게이트 g4 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
