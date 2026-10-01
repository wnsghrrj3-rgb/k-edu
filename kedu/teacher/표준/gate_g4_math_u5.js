/* gate_g4_math_u5.js — 4학년 1학기 수학 5단원 「막대그래프」 케이티처 2세대 게이트 (62차, 베프 — u4 삼각형 게이트 틀 + 막대그래프 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4 u4_l08 → l01 → … → l09)
   E 문제 정답 재계산 — 글 문제(합계·몇 명 더·몇 배·늘어난 수·눈금 한 칸 ↔ 칸 수·가장 큰 수와 눈금 끝·그림그래프 큰·작은 그림·조사 합계와 인원)
     + 그림 문제 — 렌더된 SVG 막대 길이를 눈금선 간격으로 다시 재어 셈(막대 읽기·가장 적은·가장 많은 − 가장 적은·두 자료 늘어난 수·몇 배 · 표 칸 · 그림그래프 그림 수
       · 표 ↔ 그래프 틀린 막대 · 굵기만 다른 두 그래프 · 눈금이 다른 두 그래프의 길이 함정 · 알맞은 눈금 고르기)
   F 식 전수
   G 그림(bar 눈금선 수 = 눈금 끝 ÷ 한 칸 + 1 · 눈금 글자 = 칸 × 한 칸 · 막대 길이 = 데이터 · 빈 막대 「?」 · 범례 · 항목 이름 · 막대가 눈금 끝 안
     · 읽기 문제 그림엔 막대 끝 수 없음 · ptable 합계 · pgraph 그림 수 · 개념 글 속 「항목 N명」·「합계 N명」 = 그림 자료
     · 자료가 자기주도 원문 renderModels 자료와 같음)
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u5.js */
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
const L = load(path.join(TDIR, 'data/g4_math_u5.js'));
const U4 = load(path.join(TDIR, 'data/g4_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u5.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '막대그래프', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const nums = (t) => [...String(t).matchAll(/(\d+)(?:명|점|kg)/g)].map(m => +m[1]);

/* ── 렌더된 그림에서 다시 잼 ── */
function measureBar(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-bar'); ok(svg, '막대그래프 svg 없음'); const hz = svg.getAttribute('data-horiz') === '1';
  const pos = [...svg.querySelectorAll('line.bg')].map(l => +(hz ? l.getAttribute('x1') : l.getAttribute('y1'))); const gap = Math.abs(pos[pos.length - 1] - pos[0]) / (pos.length - 1); const step = +svg.getAttribute('data-step');
  const ns = f.sets ? f.sets.length : 1; const v = Array.from({ length: ns }, () => f.x.map(() => null)), px = Array.from({ length: ns }, () => f.x.map(() => 0));
  svg.querySelectorAll('rect.bb').forEach(r => { const i = +r.getAttribute('data-i'), s = +r.getAttribute('data-s'); const len = +(hz ? r.getAttribute('width') : r.getAttribute('height')); px[s][i] = len; const raw = len / gap * step; v[s][i] = Math.abs(raw - Math.round(raw)) < 0.25 ? Math.round(raw) : Math.round(raw * 100) / 100; });
  return { v, px, gap, step, hz, d, svg, pos, hidden: [...svg.querySelectorAll('rect.bq')].map(r => +r.getAttribute('data-i')) }; }
function readTable(f) { const d = docOf(FIG.render(f)); const rows = d.querySelectorAll('table.pt tr'); const names = [...rows[0].querySelectorAll('td')].map(t => t.textContent); const vals = [...rows[1].querySelectorAll('td')].map(t => t.textContent);
  const out = { items: [], total: null, totalQ: false }; names.forEach((n, i) => { if (n === '합계') { out.totalQ = vals[i] === '?'; out.total = vals[i] === '?' ? null : +vals[i]; } else out.items.push({ name: n, v: vals[i] === '?' ? null : +vals[i] }); }); return out; }
function readPg(f) { const d = docOf(FIG.render(f)); const units = d.querySelector('.fig-pgraph').getAttribute('data-units').split(',').map(Number); const sz = units.length === 2 ? ['l', 's'] : ['s'];
  return [...d.querySelectorAll('table.pg tr')].slice(1).map(tr => ({ name: tr.querySelector('th').textContent, v: sz.reduce((a, c, k) => a + tr.querySelectorAll('i.pg-ic.' + c).length * units[k], 0) })); }
const posOf = (n, t) => { const f = t.indexOf(nsp(n)); if (f >= 0) return f; const last = String(n).split(' ').pop(); return last.length >= 2 && last !== n ? t.indexOf(last) : -1; }; // 「범죄 과학 수사관」 → 글에선 「수사관」
const itemIn = (names, t) => names.map((n, i) => [nsp(n), i]).filter(([n, i]) => posOf(names[i], t) >= 0).sort((a, b) => b[0].length - a[0].length).map(x => x[1]);
const panelsOf = (f) => (f && f.k === 'panels' ? f.items.map(p => p.fig || p) : null);

/* 그림에서 답을 셈 (undefined = 그림으로 셀 문제 아님 · null = 하나로 안 정해짐) */
function figAns(f, q, d) { if (!f) return undefined; const t = nsp(q); const pn = panelsOf(f);
  const stepTxt = (t.match(/눈금한칸이(\d+)(?:명|점|kg)/) || [])[1];
  if (f.k === 'bar') { const m = measureBar(f); const it = itemIn(f.x, t); const sn = f.sets ? f.sets.map(s => nsp(s.name)) : []; const sOf = sn.map((n, i) => [t.indexOf(n), i]).filter(([p]) => p >= 0).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    if (f.sets && it.length === 1 && /늘었/.test(t)) return m.v[1][it[0]] - m.v[0][it[0]];
    if (f.sets && it.length === 1 && /몇배/.test(t)) return m.v[1][it[0]] / m.v[0][it[0]];
    const vv = m.v[sOf.length === 1 ? sOf[0] : 0];
    if (/가장많은.*가장적은.*차/.test(t)) { const a = vv.filter(x => x != null); return Math.max(...a) - Math.min(...a); }
    if (/가장적은/.test(t) && /무엇|어디|어느/.test(t)) { const mn = Math.min(...vv.filter(x => x != null)); const ix = vv.map((x, i) => (x === mn ? i : -1)).filter(i => i >= 0); return ix.length === 1 ? f.x[ix[0]] : null; }
    if (/가장많은/.test(t) && /무엇|어디|어느/.test(t)) { const mx = Math.max(...vv.filter(x => x != null)); const ix = vv.map((x, i) => (x === mx ? i : -1)).filter(i => i >= 0); return ix.length === 1 ? f.x[ix[0]] : null; }
    if (it.length === 1 && /몇칸/.test(t)) { const val = vv[it[0]] != null ? vv[it[0]] : (nums(t)[stepTxt ? 1 : 0]); return val / m.step; }
    if (it.length === 1 && /몇(명|점|kg)/.test(t) && !f.sets) return vv[it[0]];
    if (it.length === 1 && /몇(명|점|kg)/.test(t) && sOf.length === 1) return vv[it[0]];
    return undefined; }
  if (f.k === 'pgraph') { const rows = readPg(f); const it = itemIn(rows.map(r => r.name), t); if (it.length === 1 && /몇명/.test(t)) return rows[it[0]].v; return undefined; }
  if (f.k === 'ptable') { const tb = readTable(f); const names = tb.items.map(r => r.name); const it = itemIn(names, t); const known = tb.items.filter(r => r.v != null);
    if (tb.totalQ && /합계/.test(t)) return tb.items.reduce((a, r) => a + r.v, 0);
    if (tb.items.some(r => r.v == null) && tb.total != null) { const hid = tb.items.find(r => r.v == null); if (it.indexOf(names.indexOf(hid.name)) >= 0 || /몇명/.test(t)) return tb.total - known.reduce((a, r) => a + r.v, 0); }
    if (/적어도얼마까지/.test(t)) return Math.max(...known.map(r => r.v));
    if (it.length >= 2 && /모두몇/.test(t)) return it.reduce((a, i) => a + tb.items[i].v, 0);
    if (it.length === 1 && /몇칸/.test(t) && stepTxt) return tb.items[it[0]].v / +stepTxt;
    if (/가장큰수가(\d+)/.test(t) && /눈금한칸으로가장알맞은/.test(t) && d && d.options) { const mx = Math.max(...known.map(r => r.v)); const good = d.options.map(o => +(o.text.match(/^(\d+)\s*—/) || [])[1]).map(s => (s ? (Math.ceil(mx / s) >= 4 && Math.ceil(mx / s) <= 12 ? s : 0) : 0)).filter(Boolean); return good.length === 1 ? { has: good[0] + ' —' } : null; }
    return undefined; }
  if (pn && pn.length === 2 && pn[0].k === 'ptable' && pn[1].k === 'bar') { const tb = readTable(pn[0]); const m = measureBar(pn[1]); const it = itemIn(pn[1].x, t);
    if (/틀렸/.test(t)) { const bad = pn[1].x.filter((n, i) => m.v[0][i] != null && tb.items.find(r => r.name === n).v !== m.v[0][i]); return bad.length === 1 ? bad[0] : null; }
    if (/몇칸/.test(t) && m.hidden.length === 1) { const n = pn[1].x[m.hidden[0]]; if (it.indexOf(m.hidden[0]) < 0) return null; return tb.items.find(r => r.name === n).v / m.step; }
    return undefined; }
  if (pn && pn.length === 2 && pn.every(g => g.k === 'bar')) { const ms = pn.map(measureBar);
    if (/굵기/.test(t)) return JSON.stringify(ms[0].v) === JSON.stringify(ms[1].v) ? { has: '같아요' } : null;
    if (/길어/.test(t)) { const a = itemIn(pn[0].x, t), b = itemIn(pn[1].x, t); const ia = a.filter(i => posOf(pn[0].x[i], t) < t.indexOf('보다'))[0]; if (ia == null) return null; const ib = b.filter(i => posOf(pn[1].x[i], t) > posOf(pn[0].x[ia], t) && posOf(pn[1].x[i], t) < t.indexOf('보다'))[0]; if (ia == null || ib == null) return null;
      const longer = ms[0].px[0][ia] > ms[1].px[0][ib], fewer = ms[0].v[0][ia] < ms[1].v[0][ib]; return longer && fewer ? { has: '눈금', n: [ms[0].v[0][ia], ms[1].v[0][ib]] } : null; }
    return undefined; }
  return undefined; }
const FACT = [[/수량을막대모양으로나타낸그래프를무엇/, '막대그래프'], [/막대그래프에서수량은막대의무엇/, '길이'], [/막대그래프를그릴때막대의굵기/, '모두 같게'], [/눈금한칸의크기를바꾸면막대가나타내는수/, '그대로예요'],
  [/읽는세걸음가운데첫번째/, '바로 답 찾기'], [/자료를조사할때가장먼저할일/, '조사할 주제 정하기'], [/합계가반인원보다적으면/, '빠진 친구가 있어요'], [/4학년전체100명을조사할때가장알맞은방법/, '온라인 설문'],
  [/모둠신문을만드는차례에서표다음/, '막대그래프'], [/그래프에없는것을지어내면/, '소문'], [/어느색이어느자료인지알려주는것/, '범례'], [/묶는방법을바꾸면막대가나타내는수/, '그대로예요'], [/두자료는무엇으로구분/, '막대의 색']];
function leadA(q0) { const t = nsp(q0); let m; const N = nums(t);
  for (const [re, a] of FACT) if (re.test(t)) return a;
  if ((m = t.match(/큰그림이(\d+)명,작은그림이(\d+)명.*큰그림(\d+)개,작은그림(\d+)개/))) return m[1] * m[3] + m[2] * m[4];
  if ((m = t.match(/가장큰수가(\d+)명.*눈금한칸을(\d+)명.*적어도몇칸/))) return Math.ceil(m[1] / m[2]);
  if ((m = t.match(/가장큰수가(\d+)명이면.*적어도몇명까지/))) return +m[1];
  if ((m = t.match(/우리반은(\d+)명.*합계가(\d+)명.*몇명이더/))) return m[2] - m[1];
  if ((m = t.match(/합계가(\d+)명이에요\.(.*)몇명/))) { const r = nums(m[2]); return m[1] - r.reduce((a, b) => a + b, 0); }
  const st = t.match(/눈금한칸이(\d+)(?:명|점|kg)/);
  if (st) { const s = +st[1], rest = t.slice(st.index + st[0].length); const cells = [...rest.matchAll(/(\d+)칸/g)].map(x => +x[1]);
    if (/몇칸/.test(t)) { const v = nums(rest)[0]; return v == null ? null : v / s; }
    if (cells.length === 2 && /차/.test(t)) return (cells[0] - cells[1]) * s;
    if (cells.length === 1 && /몇(명|점|kg)/.test(t)) return cells[0] * s; }
  if (/몇배/.test(t) && N.length >= 2) return /에서/.test(t) ? N[1] / N[0] : N[0] / N[1];
  if (/몇(명|점)늘/.test(t) && N.length === 2) return N[1] - N[0];
  if (/몇명더많/.test(t) && N.length >= 2) return Math.abs(N[0] - N[1]);
  if (/합계는몇|모두더하면몇|모두몇/.test(t) && N.length >= 2) return N.reduce((a, b) => a + b, 0);
  return null; }
function same(a, v) { if (v && typeof v === 'object' && v.has) return String(a).indexOf(v.has) >= 0 && (!v.n || v.n.every(x => new RegExp(x + '명').test(a) || !/\d+명/.test(a)));
  if (typeof v === 'number') { const d = String(a).replace(/\(.*?\)/g, '').match(/\d+(\.\d+)?/); return !!d && +d[0] === v; }
  const A = nsp(String(a).replace(/\(.*?\)/g, '')), V = nsp(v); return A === V || A.indexOf(V) === 0 || V.indexOf(A) === 0; }

console.log('═══ A. 로드 ═══');
T('9차시 키 u5_l01~l09', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · 5단원 막대그래프 · 성취기준 표시 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 5 && m.unit_title === '막대그래프' && /막대그래프/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex08 = U4.u4_l08.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4 u4_l08') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex08;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u4_l08'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const fa = figAns(d.fig, d.question, d); const la = leadA(d.question);
    if (d.fig) { const h = FIG.render(d.fig); ok(!/NaN|undefined/.test(h), s.id + ' 그림 깨짐'); const walk = (g) => (g.k === 'panels' ? g.items.map(p => p.fig || p) : [g]); walk(d.fig).forEach(g => ok(!g.vals, s.id + ' 문제 그림에 막대 끝 수 — 답이 보임')); }
    ok(fa !== null, s.id + ' 그림에서 답이 하나로 안 정해짐'); if (fa !== undefined) nFigQ++; if (fa !== undefined && la != null) { nBoth++; ok(JSON.stringify(fa) === JSON.stringify(la), s.id + ' 그림 셈 ' + JSON.stringify(fa) + ' ≠ 글 셈 ' + JSON.stringify(la)); }
    const v = fa !== undefined ? fa : la;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const cor = d.options.find(o => o.correct).text;
      if (v != null) { nCheck++; ok(same(cor, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v) + ' ≠ ' + cor); d.options.filter(o => !o.correct).forEach(o => ok(!same(o.text, v) || typeof v === 'number', s.id + ' 오답 보기도 맞음: ' + o.text)); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id);
      ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadA(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[t].a); } else unread.push(k + ' ' + t); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadA(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 ≥ 72 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 22', () => ok(nCheck >= 72 && !unread.length && nFigQ >= 22, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 칸 수·몇 배·차·합·그림 재기', () => {
  ok(leadA('눈금 한 칸이 **5명**일 때, **35명**은 몇 칸일까요?') === 7 && leadA('눈금 한 칸이 **25점**인 그래프에서 막대가 **4칸**이에요. 몇 점일까요?') === 100, '칸');
  ok(leadA('독일은 10점에서 20점이 되었어요. 몇 배가 되었을까요?') === 2 && leadA('8명은 4명의 몇 배일까요?') === 2 && leadA('미국은 20점에서 40점이 되었어요. 몇 점 늘었을까요?') === 20, '배·늘어남');
  ok(figAns({ k: 'bar', x: ['가', '나', '다'], v: [3, 7, 5], step: 1 }, '나를 고른 학생은 몇 명일까요?') === 7, '막대 읽기');
  ok(figAns({ k: 'bar', x: ['가', '나', '다'], v: [4, 14, 10], step: 2, max: 16 }, '가장 적은 것은 무엇일까요?') === '가', '가장 적은');
  ok(figAns({ k: 'panels', items: [{ fig: { k: 'ptable', items: [{ name: '가', v: 3 }, { name: '나', v: 5 }] } }, { fig: { k: 'bar', x: ['가', '나'], v: [3, 6], step: 1 } }] }, '한 곳이 틀렸어요. 어느 것일까요?') === '나', '틀린 막대');
  ok(figAns({ k: 'panels', items: [{ fig: { k: 'bar', x: ['떡볶이', '김밥'], v: [9, 2], step: 1, max: 10 } }, { fig: { k: 'bar', x: ['과일', '빵'], v: [5, 15], step: 5, max: 40 } }] }, '1반 떡볶이(9명) 막대가 학년 빵(15명) 막대보다 길어요.').has === '눈금', '길이 함정'); ok(figAns({ k: 'panels', items: [{ fig: { k: 'bar', x: ['떡볶이', '김밥'], v: [9, 2], step: 1, max: 10 } }, { fig: { k: 'bar', x: ['과일', '빵'], v: [5, 15], step: 1, max: 15 } }] }, '1반 떡볶이(9명) 막대가 학년 빵(15명) 막대보다 길어요.') === null, '눈금 같으면 함정 아님'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'); if (!/^[\d\s*+\-/()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = ' ' + String(s0).replace(/\*\*/g, ''); let m; const re = /(\d+(?:\s*[×÷+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×÷+−])/g;
  while ((m = re.exec(s))) { const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재계산 (' + nEq + '개) 틀림 0', () => ok(bad.length === 0 && nEq >= 40, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 셋 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['13 + 7 + 10 + 5 = 36', '220 ÷ 20 = 12', '60 − 30 = 20'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('7 + 6 + 8 + 4 = 25 · 126 ÷ 25 = 5 아님', 'ok'); ok(bad.length === b0 + 1, '정수 나눗셈 오탐 기대 1'); bad.length = b0; eqcheck('180 ÷ 20 = 9 · 13 × 2 = 26', 'ok'); ok(bad.length === b0, '오탐'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k])));
T('개념 36장 모두 그림 · 기본 문제 그림 ≥ 24 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 24, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
let nG = { bar: 0, bars: 0, table: 0, pg: 0, txt: 0, src: 0 };
T('bar — 눈금선 수·눈금 글자·막대 길이 = 자료·빈 막대 「?」·범례·항목 이름·막대가 눈금 끝 안', () => parts.filter(([, g]) => g.k === 'bar').forEach(([w0, g]) => { nG.bar++; const m = measureBar(g); const tx = [...m.d.querySelectorAll('text')].map(t => t.textContent); const top = +m.svg.getAttribute('data-max');
  ok(top % m.step === 0, w0 + ' 눈금 끝이 한 칸의 배수 아님'); ok(m.pos.length === top / m.step + 1, w0 + ' 눈금선 ' + m.pos.length + ' ≠ ' + (top / m.step + 1)); ok(m.pos.every((p, i) => !i || Math.abs(Math.abs(p - m.pos[i - 1]) - m.gap) < 0.15), w0 + ' 눈금 간격 고르지 않음');
  const every = m.pos.length - 1 <= 12 ? 1 : null; if (every) for (let i = 0; i < m.pos.length; i++) ok(tx.indexOf(String(i * m.step)) >= 0, w0 + ' 눈금 글자 ' + i * m.step);
  ok(tx.indexOf(String(top)) >= 0, w0 + ' 눈금 끝 글자 ' + top);
  const sets = g.sets ? g.sets.map(s => s.v) : [g.v]; const hide = g.hide === true ? g.x.map((_, i) => i) : [].concat(g.hide || []);
  sets.forEach((vs, s) => vs.forEach((v, i) => { ok(v <= top, w0 + ' 막대가 눈금 끝 밖 ' + v); if (hide.indexOf(i) >= 0) { ok(m.v[s][i] == null, w0 + ' 숨긴 막대가 그려짐 ' + g.x[i]); return; } nG.bars++; ok(Math.abs(m.v[s][i] - v) < 0.02, w0 + ' ' + g.x[i] + ' 그린 길이 ' + m.v[s][i] + ' ≠ ' + v); }));
  if (g.hide && g.hide !== true) ok(m.hidden.length === hide.length && tx.filter(t => t === '?').length === hide.length, w0 + ' 빈 막대 「?」');
  if (g.hide === true) ok(!m.d.querySelector('rect.bb') && m.hidden.length === g.x.length, w0 + ' 틀만');
  if (g.sets) g.sets.forEach(s => ok(tx.indexOf(s.name) >= 0, w0 + ' 범례 ' + s.name)); else ok(!m.d.querySelector('rect[y="12"]'), w0);
  const all = nsp(tx.join('')); g.x.forEach(n => ok(all.indexOf(nsp(n)) >= 0, w0 + ' 항목 이름 ' + n));
  if (g.vals) sets[0].forEach((v, i) => ok(tx.filter(t => t === String(v)).length >= 1, w0 + ' 막대 끝 수 ' + v)); }));
T('ptable 합계 = 칸의 합(주어진 합계면 숨긴 칸까지 맞음) · pgraph 그림 수 = 자료', () => { parts.filter(([, g]) => g.k === 'ptable').forEach(([w0, g]) => { nG.table++; const tb = readTable(g); const sum = g.items.reduce((a, r) => a + r.v, 0); if (typeof g.total === 'number') ok(g.total === sum, w0 + ' 주어진 합계 ' + g.total + ' ≠ ' + sum); if (tb.total != null) ok(tb.total === sum, w0 + ' 합계 칸 ' + tb.total + ' ≠ ' + sum); g.items.forEach((r, i) => ok(r.q ? tb.items[i].v == null : tb.items[i].v === r.v, w0 + ' 칸 ' + r.name)); });
  parts.filter(([, g]) => g.k === 'pgraph').forEach(([w0, g]) => { nG.pg++; readPg(g).forEach((r, i) => ok(r.v === g.rows[i].v, w0 + ' 그림 수 ' + r.name + ' ' + r.v + ' ≠ ' + g.rows[i].v)); }); });
T('개념 글 속 「항목 N명」·「합계 N명」 = 그 장 그림 자료', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const t = nsp(s.data.content); const pairs = []; flat(s.data.fig).forEach(([g]) => { if (g.k === 'bar' && !g.sets) g.x.forEach((n, i) => pairs.push([n, g.v[i]])); if (g.k === 'ptable') g.items.forEach(r => pairs.push([r.name, r.v])); if (g.k === 'pgraph') g.rows.forEach(r => pairs.push([r.name, r.v])); });
  pairs.forEach(([n, v]) => { const re = new RegExp(nsp(n) + '(?:은|는|이|가|의)?(\\d+)(?:명|점|kg)', 'g'); let m; while ((m = re.exec(t))) { nG.txt++; ok(+m[1] === v, k + ' ' + s.id + ' 글 「' + n + ' ' + m[1] + '」 ≠ 그림 ' + v); } });
  const tot = t.match(/합계(\d+)명/); const tb = flat(s.data.fig).map(([g]) => g).find(g => g.k === 'ptable'); if (tot && tb) { nG.txt++; ok(+tot[1] === tb.items.reduce((a, r) => a + r.v, 0), k + ' ' + s.id + ' 글 합계'); } })));
/* 자기주도 원문 renderModels 자료와 같음 — 일부러 틀리게 그린 그래프(l03 성실이 5칸)만 예외 */
const MODEL = {}; KEYS.forEach(k => { const html = fs.readFileSync(path.join(TDIR, L[k].meta.live_url), 'utf8'); const i = html.indexOf('(function renderModels'); const body = html.slice(i, html.indexOf('})();', i)); MODEL[k] = new Set([...body.matchAll(/\{label:'([^']+)',\s*value:(\d+)\}/g)].map(m => m[1] + '=' + m[2])); });
T('그림 자료(항목=수)가 자기주도 원문 자료와 같음 (일부러 틀린 그래프 1곳 제외)', () => { const off = []; parts.forEach(([w0, g, , , k]) => { const pr = []; if (g.k === 'bar') (g.sets ? g.sets : [{ v: g.v }]).forEach(s => g.x.forEach((n, i) => pr.push(n + '=' + s.v[i]))); if (g.k === 'ptable') g.items.forEach(r => pr.push(r.name + '=' + r.v)); if (g.k === 'pgraph') g.rows.forEach(r => pr.push(r.name + '=' + r.v));
  pr.forEach(p => { nG.src++; if (!MODEL[k].has(p)) off.push(w0 + ' ' + p); }); }); ok(off.length === 1 && /u5_l03 s11#1 성실이=5/.test(off[0]), '원문에 없는 자료 ' + off.join(' | ')); ok(MODEL.u5_l01.size >= 4, 'renderModels 못 읽음'); });
T('막대그래프 부품 수 — bar ≥ 40 · 막대 ≥ 200 · 표 ≥ 15 · 그림그래프 ≥ 4 · 글↔그림 ≥ 4 · 원문 대조 ≥ 300 · 차시마다 막대그래프(l06 자료 수집은 원문도 표만)', () => { ok(nG.bar >= 40 && nG.bars >= 200 && nG.table >= 15 && nG.pg >= 4 && nG.txt >= 4 && nG.src >= 300, JSON.stringify(nG)); KEYS.filter(k => k !== 'u5_l06').forEach(k => ok(L[k].slides.some(s => /"k":"bar"/.test(JSON.stringify(s.data.fig || {}))), k)); /* l06 자료 수집은 원문도 표만(renderModels 에 barChart 없음) */ ok(!/barChart\(/.test(fs.readFileSync(path.join(TDIR, L.u5_l06.meta.live_url), 'utf8').split('(function renderModels')[1].split('})();')[0]), 'l06 원문에 막대그래프가 있으면 예외 풀 것'); });
T('그림 검사기 자체 확인 — 틀린 막대 잡음', () => { const m = measureBar({ k: 'bar', x: ['가', '나'], v: [4, 9], step: 1, max: 10 }); ok(m.v[0][0] === 4 && m.v[0][1] === 9, '재기'); const h = measureBar({ k: 'bar', x: ['가', '나'], v: [4, 9], step: 2, max: 10, horiz: true }); ok(h.v[0][1] === 9 && h.hz, '가로 재기'); const s = measureBar({ k: 'bar', x: ['가'], sets: [{ name: 'A', v: [10] }, { name: 'B', v: [30] }], step: 10, max: 40, by: 'set' }); ok(s.v[1][0] === 30, '두 자료 재기'); });

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
const FIRST = [['온라인 설문', 6], ['두 자료', 8], ['범례', 8]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u5_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('범례') < 0, 'l01 개념 장 깨끗'); probe.content += ' 범례'; ok(JSON.stringify(probe).indexOf('범례') >= 0, '심은 낱말'); });

console.log('\n게이트 g4 수학 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
