/* gate_g4_math_u6.js — 4학년 1학기 수학 6단원 「관계와 규칙」 케이티처 2세대 게이트 (64차, 베프 — u5 막대그래프 게이트 틀 + 관계·규칙 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4 u5_l09 → l01 → … → l10)
   E 문제 정답 재계산 — 렌더된 그림을 다시 읽어 셈: 수 배열표의 「?」(같은 줄·칸의 규칙 — 더하기·빼기·곱하기·나누기 자동 판별)
       · 모양의 배열 「?」(그려진 모양 수를 세어 계차로 다음·N째) · 계산식 배열의 「?」·「□」(식을 풀어) · 저울의 「?」 블록·「□」(양쪽을 같게)
       · 「N개는 몇째」·「결과 N 은 몇째」 + 글 문제(수열 다음 수·N째 · □ 식 풀기 · 옳은 식 판정 · 부품 무게)
   F 식 전수 — 「식 = 수」 + **「식 = 식」(양쪽 모두 계산식, 이어 쓴 등호도 쌍마다)** · 일부러 틀린 식은 목록으로만 허용
   G 그림 — bal(블록 합 = 식 · 기울기 = 두 값 · 모르는 블록 접시엔 식 없음) · eqc(○/× = 실제) · ngrid(줄·칸 규칙 일관 · 「?」)
       · eqs(보이는 식 모두 참 · 구할 식엔 ?/□ 하나) · shapes(모양 수 = 규칙 공식 · 변하지 않는 부분 수 일정 · 「N개」 글자) · 원문 renderModels 대조
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u6.js */
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
const L = load(path.join(TDIR, 'data/g4_math_u6.js'));
const U5 = load(path.join(TDIR, 'data/g4_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u6.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열두째'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '관계와 규칙', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');

/* ── 게이트 자체 셈(부품의 calc 와 따로 짬) ── */
function ev(e) { const x = String(e).replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/\s+/g, ''); if (!x || !/^[\d*+\-/()]+$/.test(x) || /^[*/+]|[*+\-/]$/.test(x)) return NaN; try { const v = Function('return (' + x + ')')(); return Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : NaN; } catch (er) { return NaN; } }
/* □·? 하나가 든 등식 풀기(일차) */
function solve(eq) { const s = String(eq).replace(/\s+/g, ''); const parts = s.split('='); if (parts.length !== 2) return null; const hole = /[□?]/; const n = (s.match(/[□?]/g) || []).length; if (n !== 1) return null;
  const f = (x) => ev(parts[0].replace(hole, '(' + x + ')')) - ev(parts[1].replace(hole, '(' + x + ')')); const f0 = f(0), f1 = f(1); if (!Number.isFinite(f0) || !Number.isFinite(f1) || f1 === f0) {
    const g = (x) => ev(parts[0].replace(hole, x)) - ev(parts[1].replace(hole, x)); for (let x = 0; x <= 100000; x++) if (g(x) === 0) return x; return null; }
  const x = -f0 / (f1 - f0); return Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x) : x; }
/* 수열 모형: 같은 차 · 같은 비 · 계차(2단) — 알려진 값과 자리로 */
function model(pts, three) { // pts [[i, v]] (i 오름차순 · 이웃 i 차 1 인 쌍으로 판단) · three: 계차 모형을 세 점으로도(문제 그림이 셋째까지만 보일 때)
  const pairs = []; for (let k = 1; k < pts.length; k++) if (pts[k][0] - pts[k - 1][0] === 1) pairs.push([pts[k - 1][1], pts[k][1]]);
  if (!pairs.length) return null;
  const ds = pairs.map(([a, b]) => b - a); if (ds.every(d => d === ds[0])) { const [i0, v0] = pts[0]; return (i) => v0 + ds[0] * (i - i0); }
  const rs = pairs.map(([a, b]) => b / a); if (rs.every(r => Math.abs(r - rs[0]) < 1e-9) && rs[0] !== 1) { const [i0, v0] = pts[0]; return (i) => Math.round(v0 * Math.pow(rs[0], i - i0) * 1e6) / 1e6; }
  const run = pts.every((p, k) => !k || p[0] - pts[k - 1][0] === 1); if (run && pts.length >= (three ? 3 : 4)) { const d1 = ds, d2 = d1.slice(1).map((d, k) => d - d1[k]); if (d2.every(d => d === d2[0])) { const i0 = pts[0][0], v0 = pts[0][1]; return (i) => { let v = v0, d = d1[0]; for (let t = i0; t < i; t++) { v += d; d += d2[0]; } return v; }; } }
  return null; }
const ordIx = (t) => { let best = -1, at = -1; ORD.forEach((o, i) => { const p = t.indexOf(o); if (p >= 0 && (o.length > (best >= 0 ? ORD[best].length : 0) || at < 0)) { if (best < 0 || o.length > ORD[best].length) { best = i; at = p; } } }); return best; };
const bolds = (q) => [...String(q).matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]);
const listOf = (q) => { const b = bolds(q).find(x => /\d[\d\s]*,\s*\d/.test(x)); return b ? b.split(',').map(x => +x.replace(/[^\d]/g, '')) : null; };
const eqsIn = (t) => [...String(t).replace(/\*\*/g, '').matchAll(/[\d□?][\d□?+×÷−\-()\s]*=[\d□?+×÷−\-()\s]*[\d□?]/g)].map(m => m[0].replace(/\s+/g, ''));

/* ── 렌더된 그림 읽기 ── */
function readGrid(f) { const d = docOf(FIG.render(f)); const tb = d.querySelector('table.ng'); const head = tb.classList.contains('head');
  return { head, rows: [...tb.querySelectorAll('tr')].map((tr, r) => [...tr.querySelectorAll('td')].map((td, c) => ({ t: td.textContent, q: td.getAttribute('data-q') === '1', hd: head && (r === 0 || c === 0) }))) }; }
function gridQ(g) { // 「?」 칸 값: 같은 줄 → 안 되면 같은 칸
  const out = []; g.rows.forEach((row, r) => row.forEach((c, i) => { if (!c.q) return;
    const line = (cells) => cells.map((x, k) => [k, x]).filter(([, x]) => !x.q && !x.hd && /^\d+$/.test(x.t)).map(([k, x]) => [k, +x.t]);
    let m = model(line(row)); let v = m ? m(i) : null;
    if (v == null) { const col = g.rows.map(rr => rr[i]); m = model(line(col)); v = m ? m(r) : null; }
    out.push(v); })); return out; }
function readShapes(f) { const d = docOf(FIG.render(f)); const its = [...d.querySelectorAll('g.sh-it')].map(g => ({ n: +g.getAttribute('data-n'), c: g.querySelectorAll('.sc').length, f: g.querySelectorAll('.sc.f').length, lab: [...g.querySelectorAll('text')].map(t => t.textContent) }));
  const q = d.querySelector('g.sh-q'); return { its, q: q ? q.querySelector('text').textContent : null, d }; }
function shapesAt(sh, n) { const m = model(sh.its.map(it => [it.n, it.c]), true); return m ? m(n) : null; }
function readEqs(f) { const d = docOf(FIG.render(f)); return [...d.querySelectorAll('.eqs-row')].map(r => ({ eq: r.querySelector('.ee').textContent, ord: r.querySelector('.eo').textContent, blank: r.getAttribute('data-blank') === '1' })); }
function readBal(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-bal'); const side = (cls) => { const g = svg.querySelector('g.' + cls); const blocks = [...g.querySelectorAll('rect.blk')].map(r => r.nextSibling.textContent); const tx = [...g.querySelectorAll('text')].map(t => t.textContent).filter(t => blocks.indexOf(t) < 0); return { blocks, expr: tx.length ? tx[tx.length - 1] : null }; };
  return { l: side('pan-l'), r: side('pan-r'), tilt: +svg.getAttribute('data-tilt'), dl: svg.getAttribute('data-l'), dr: svg.getAttribute('data-r'), d }; }
const bnum = (b) => (/[?□]/.test(b) ? null : +String(b).replace(/[^\d]/g, ''));

/* 그림에서 답을 셈 (undefined = 그림으로 셀 문제 아님 · null = 하나로 안 정해짐) */
function figAns(f, q, d) { if (!f) return undefined; const t = nsp(q);
  if (f.k === 'ngrid') { const g = readGrid(f); const qs = gridQ(g);
    if (qs.length) return qs.length === 1 && qs[0] != null ? qs[0] : null;
    const nums = g.rows.map(row => row.filter(c => !c.hd && /^\d+$/.test(c.t)).map(c => +c.t));
    const mm = t.match(/(\d+)개로만든모양은몇째/); if (mm) { const s = nums[0]; const m = model(s.map((v, i) => [i, v])); if (!m) return null; for (let i = 0; i < 40; i++) if (m(i) === +mm[1]) return { has: ORD[i] }; return null; }
    if (/규칙/.test(t) && /오른쪽/.test(t)) { const row = nums.find(r => r.length >= 3) || []; const ds = row.slice(1).map((v, i) => v - row[i]); return ds.every(x => x === ds[0]) ? { has: Math.abs(ds[0]) + '씩' + (ds[0] > 0 ? '커져요' : '작아져요') } : null; }
    return undefined; }
  if (f.k === 'shapes') { const sh = readShapes(f); if (!sh.q) return undefined; const n = ORD.indexOf(sh.q) + 1; if (n < 1) return null; const tn = ordIx(t); if (tn >= 0 && tn + 1 !== n) return null; return shapesAt(sh, n); }
  if (f.k === 'eqs') { const rows = readEqs(f); const bl = rows.filter(r => r.blank);
    if (bl.length === 1) { const e = bl[0].eq; if (/\?/.test(e) && !/□/.test(e)) { const [a, b] = e.split('='); return /\?/.test(b) ? ev(a) : ev(b); } return solve(e); }
    const mm = t.match(/결과가(\d+)이?되는식은몇째/); if (mm) { const res = rows.map(r => ev(r.eq.split('=')[1])); const m = model(res.map((v, i) => [i, v])); if (!m) return null; for (let i = 0; i < 40; i++) if (m(i) === +mm[1]) return { has: ORD[i] }; return null; }
    return undefined; }
  if (f.k === 'bal') { const b = readBal(f);
    if (f.hideR && d && d.options) { const lv = ev(b.l.expr); const hit = d.options.filter(o => ev(o.text) === lv); return hit.length === 1 ? { has: hit[0].text } : null; }
    const unk = (s) => s.blocks.length && s.blocks.every(x => bnum(x) == null), known = (s) => s.blocks.length && s.blocks.every(x => bnum(x) != null);
    if (unk(b.r) && known(b.l)) return b.l.blocks.reduce((a, x) => a + bnum(x), 0) / b.r.blocks.length;
    if (unk(b.l) && known(b.r)) return b.r.blocks.reduce((a, x) => a + bnum(x), 0) / b.l.blocks.length;
    if (b.l.expr && b.r.expr && /□/.test(b.l.expr + b.r.expr)) return solve(b.l.expr + '=' + b.r.expr);
    return undefined; }
  if (f.k === 'eqc') return undefined;
  return undefined; }

const W8 = ['팔', '바퀴', '날개', '안테나'];
function leadA(q0, d) { const t = nsp(q0); let m;
  if (d && d.options && /옳(은|지않은)식은/.test(t)) { const want = /옳지않은/.test(t) ? false : true; const hit = d.options.filter(o => { const e = o.text.split('='); return e.length === 2 && (ev(e[0]) === ev(e[1])) === want && !isNaN(ev(e[0])); }); return hit.length === 1 ? { has: hit[0].text } : null; }
  if (/옳은식일까요/.test(t)) { const e = eqsIn(q0)[0]; if (!e) return null; const [a, b] = e.split('='); return ev(a) === ev(b) ? '옳아요' : '옳지 않아요'; }
  const eqq = eqsIn(q0).filter(e => /[□?]/.test(e)); if (eqq.length === 1 && /알맞은수|□를구하면/.test(t)) return solve(eqq[0]);
  if ((m = t.match(/([\d+×÷−\-]+)(?:을|를)계산하면얼마/))) return ev(m[1]);
  const w1 = {}; W8.forEach(n => { const r = new RegExp(n + '1개(?:는|가)?(\\d+)g'); const x = t.match(r); if (x) w1[n] = +x[1]; });
  if (Object.keys(w1).length && /몇g/.test(t)) { let s = 0, any = 0; W8.forEach(n => { const r = new RegExp(n + '(\\d+)개', 'g'); let x; while ((x = r.exec(t))) { if (x[1] === '1' && t.slice(x.index + x[0].length).match(/^(?:는|가)?\d+g/)) continue; if (w1[n] == null) return; s += w1[n] * +x[1]; any++; } }); return any ? s : null; }
  const sym = bolds(q0).find(b => /[★●▲■◆]/.test(b)); if (sym && /다음에올모양/.test(t)) { const a = sym.split(',').map(x => x.trim()); for (let p = 1; p < a.length; p++) if (a.every((x, i) => x === a[i % p])) return a[a.length % p]; return null; }
  const L0 = listOf(q0); if (L0) { const mdl = model(L0.map((v, i) => [i, v])); if (!mdl) return null;
    if ((m = t.match(/(\d+)개로만든모양은몇째/))) { for (let i = 0; i < 40; i++) if (mdl(i) === +m[1]) return ORD[i]; return null; }
    if (/다음에올수/.test(t)) return mdl(L0.length);
    const k = ordIx(t.split(/[.?]/).slice(1).join('') || t); if (k >= 0) return mdl(k); return null; }
  return null; }
function same(a, v) { if (v && typeof v === 'object' && v.has) return nsp(a) === nsp(v.has) || nsp(a).indexOf(nsp(v.has)) >= 0;
  if (typeof v === 'number') { const dd = String(a).replace(/\(.*?\)/g, '').match(/\d+(\.\d+)?/); return !!dd && +dd[0] === v; }
  const A = nsp(String(a).replace(/\(.*?\)/g, '')), V = nsp(v); return A === V || A.indexOf(V) === 0 || V.indexOf(A) === 0; }

console.log('═══ A. 로드 ═══');
T('10차시 키 u6_l01~l10', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · 6단원 관계와 규칙 · 성취기준 표시 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 6 && m.unit_title === '관계와 규칙' && /관계와 규칙/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex09 = U5.u5_l09.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4 u5_l09') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex09;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u5_l09'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const fa = figAns(d.fig, d.question, d); const la = leadA(d.question, d);
    if (d.fig) { const h = FIG.render(d.fig); ok(!/NaN|undefined/.test(h), s.id + ' 그림 깨짐'); }
    ok(fa !== null, s.id + ' 그림에서 답이 하나로 안 정해짐'); if (fa !== undefined) nFigQ++;
    if (fa !== undefined && la != null) ok(JSON.stringify(fa) === JSON.stringify(la), s.id + ' 그림 셈 ' + JSON.stringify(fa) + ' ≠ 글 셈 ' + JSON.stringify(la));
    const v = fa !== undefined ? fa : la;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const cor = d.options.find(o => o.correct).text;
      if (v != null) { nCheck++; ok(same(cor, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v) + ' ≠ ' + cor); d.options.filter(o => !o.correct).forEach(o => ok(!same(o.text, v), s.id + ' 오답 보기도 맞음: ' + o.text)); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id);
      ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답');
      if (d.fig) { const h = FIG.render(d.fig).replace(/<[^>]+>/g, ' '); ok(!new RegExp('(^|[^\\d])' + d.answer + '([^\\d]|$)').test(h) || /eqs|ngrid/.test(d.fig.k) && /101/.test(String(d.answer)), s.id + ' 그림에 답 ' + d.answer + ' 이 보임'); } } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const v = leadA(lv[tt].q); if (v != null) { nCheck++; ok(same(lv[tt].a, v), tt + ' ' + lv[tt].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[tt].a); } else unread.push(k + ' ' + tt); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadA(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 = 80 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 26', () => ok(nCheck >= 80 && !unread.length && nFigQ >= 26, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 수열·□·저울·모양', () => {
  ok(leadA('**3, 9, 27, 81** 다음에 올 수는 무엇일까요?') === 243 && leadA('**1, 3, 6, 10** 다음에 올 수는 무엇일까요?') === 15 && leadA('모양이 **2, 5, 8, 11**개로 늘어나는 배열에서 **20개**로 만든 모양은 몇째일까요?') === '일곱째', '수열');
  ok(leadA('**□+15=20×3**에서 □에 알맞은 수는 무엇일까요?') === 45 && leadA('**783−322=□**에서 □에 알맞은 수는 무엇일까요?') === 461 && leadA('**24×8=12×□**에서 □에 알맞은 수는 무엇일까요?') === 16, '□');
  ok(leadA('**90÷3=27÷9**는 옳은 식일까요?') === '옳지 않아요' && leadA('바퀴 1개는 **15g**, 날개 1개는 **5g**이에요. 바퀴 **2개**와 날개 **4개**는 모두 몇 g일까요?') === 50, '판정·무게');
  ok(figAns({ k: 'ngrid', rows: [[128, { q: true }, 32, 16, 8]] }, '') === 64 && figAns({ k: 'ngrid', rows: [[1, 2], [4, 5], [{ q: true }, 8]] }, '') === 7, '수 배열 ? (나누기·칸)');
  ok(figAns({ k: 'shapes', pat: 'straw', ns: [1, 2, 3], q: '넷째' }, '') === 30 && figAns({ k: 'shapes', pat: 'stair', ns: [2, 3, 4], q: '여섯째' }, '') === 36, '모양 ?');
  ok(figAns({ k: 'bal', l: { expr: '10+10+10', blocks: ['10', '10', '10'] }, r: { expr: '15+15', blocks: ['?', '?'] }, level: true }, '') === 15 && figAns({ k: 'bal', l: '17+54', r: '□+4', level: true }, '') === 67, '저울'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const FALSE_OK = ['36+25=61+3', '90÷3=27÷9']; // 일부러 보여 주는 틀린 식(옳은지 묻는 물음 · 「등호 잇기」 오개념 extras)
let nEq = 0, nEE = 0; const bad = [];
const eqcheck = (s0, where) => { const s = ' ' + String(s0).replace(/\*\*/g, ''); let m; const re = /(?<![□?\d×÷+−]\s*)(\d+(?:\s*[×÷+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×÷+−]|\s*[□?])/g;
  while ((m = re.exec(s))) { const v = ev(m[1]); if (isNaN(v)) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); }
  /* 식 = 식(이어 쓴 등호는 쌍마다) */
  const re2 = /(?<![□?\d×÷+−]\s*)\d[\d\s×÷+−()]*(?:=\s*\d[\d\s×÷+−()]*)+(?![□?])/g; while ((m = re2.exec(s))) { const sides = m[0].split('=').map(x => x.trim()); if (sides.length < 2) continue;
    for (let i = 1; i < sides.length; i++) { const a = sides[i - 1], b = sides[i]; if (!/[×÷+−]/.test(a) || !/[×÷+−]/.test(b)) continue; /* 식 = 수 는 위에서 */ const va = ev(a), vb = ev(b); if (isNaN(va) || isNaN(vb)) continue; nEE++; if (va !== vb && FALSE_OK.indexOf((a + '=' + b).replace(/\s+/g, '')) < 0) bad.push(where + ': ' + a + ' = ' + b + ' (' + va + '≠' + vb + ')'); } } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재계산 (식=수 ' + nEq + ' · 식=식 쌍 ' + nEE + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 60 && nEE >= 40, 'nEq ' + nEq + ' nEE ' + nEE + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['12221×4=48844', '15×6=3×31', '58+26=60+25'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('40+20=20×3 · 80=40+40 · 9999÷99=101', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k])));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 26 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 26, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { bal: 0, blk: 0, eqc: 0, grid: 0, line: 0, eqs: 0, eqrow: 0, shapes: 0, items: 0, src: 0 };
T('bal — 블록 합 = 식 · 기울기 = 두 값(무거운 쪽이 내려감) · 수평 표시는 같거나 모를 때만 · 모르는 블록 접시엔 식 글자 없음', () => parts.filter(([, g]) => g.k === 'bal').forEach(([w0, g]) => { nG.bal++; const b = readBal(g); const lv = b.dl === '' ? NaN : +b.dl, rv = b.dr === '' ? NaN : +b.dr;
  [['l', b.l, g.l], ['r', b.r, g.r]].forEach(([nm, s, src]) => { const e = typeof src === 'object' ? src.expr : src; if (s.blocks.length) { nG.blk += s.blocks.length; const unk = s.blocks.some(x => bnum(x) == null); if (unk) ok(!s.expr || !/\d[+×÷−]\d/.test(s.expr), w0 + ' ' + nm + ' 모르는 블록인데 식이 보임 ' + s.expr); else ok(s.blocks.reduce((a, x) => a + bnum(x), 0) === ev(e), w0 + ' ' + nm + ' 블록 합 ≠ 식 ' + e); } });
  if (!isNaN(lv) && !isNaN(rv)) { if (g.level) ok(lv === rv, w0 + ' 수평으로 그렸는데 두 값이 다름 ' + lv + '/' + rv); else ok(b.tilt === (lv === rv ? 0 : lv > rv ? -7 : 7), w0 + ' 기울기 ' + b.tilt); }
  else ok(b.tilt === 0 && (g.level || g.hideR), w0 + ' 모르는 값인데 기울기'); }));
T('eqc — ○/× 표시 = 양쪽 실제 값 · ngrid — 줄·칸마다 같은 규칙(더하기·곱하기) · 「?」 칸', () => { parts.filter(([, g]) => g.k === 'eqc').forEach(([w0, g]) => { const d = docOf(FIG.render(g)); [...d.querySelectorAll('.ec-row')].forEach((r, i) => { nG.eqc++; const it = g.items[i]; const tr = ev(it.l) === ev(it.r); ok(r.getAttribute('data-ok') === String(tr), w0 + ' data-ok'); const j = r.querySelector('.ec-j'); if (it.judge) ok(j && j.textContent === (tr ? '옳아요 ○' : '옳지 않아요 ×'), w0 + ' 판정 글자'); else ok(!j, w0 + ' 판정 안 하는 카드에 판정'); }); });
  parts.filter(([, g]) => g.k === 'ngrid').forEach(([w0, g]) => { nG.grid++; const R = readGrid(g); const nq = g.rows.reduce((a, r) => a + r.filter(c => c && typeof c === 'object' && c.q).length, 0); ok(R.rows.reduce((a, r) => a + r.filter(c => c.q && c.t === '?').length, 0) === nq, w0 + ' 「?」 칸 수');
    const lines = R.rows.map(r => r).concat(R.rows[0].map((_, i) => R.rows.map(r => r[i]).filter(Boolean)));
    lines.forEach(line => { const pts = line.map((c, k) => [k, c]).filter(([, c]) => !c.hd && !c.q && /^\d+$/.test(c.t)).map(([k, c]) => [k, +c.t]); if (pts.length < 3) return; nG.line++; const m = model(pts); ok(m && pts.every(([k, v]) => m(k) === v), w0 + ' 규칙 없는 줄 ' + pts.map(p => p[1]).join(',')); }); }); });
T('eqs — 보이는 식 모두 참 · 구할 식엔 ?/□ 하나 · 화면 글자 = 데이터', () => parts.filter(([, g]) => g.k === 'eqs').forEach(([w0, g]) => { nG.eqs++; const rows = readEqs(g); ok(rows.length === g.items.length, w0 + ' 줄 수'); rows.forEach((r, i) => { nG.eqrow++; const it = g.items[i]; ok(r.ord === it.ord, w0 + ' 순서 ' + r.ord); ok(r.eq === it.eq, w0 + ' 글자 ' + r.eq + ' ≠ ' + it.eq);
  if (r.blank) ok((r.eq.match(/[?□]/g) || []).length === 1, w0 + ' 구할 식 ' + r.eq); else { const [a, b] = r.eq.split('='); ok(ev(a) === ev(b), w0 + ' 틀린 식 ' + r.eq); } }); }));
const FORM = { cross: n => 4 * n, stair: n => n * n, square: n => n * n, tstair: n => n * (n + 1) / 2, row3: n => 2 * n + 1, vert3: n => 2 * n + 1, wing: n => 2 * n, mid3: n => 2 * n + 6, straw: n => 3 * n * (n + 1) / 2 };
const FIXED = { cross: 0, stair: 1, square: 0, tstair: 0, row3: 3, vert3: 3, wing: 2, mid3: 6, straw: 3 };
T('shapes — 모양 수 = 규칙 공식 · 변하지 않는 부분(노랑) 수 일정 · 「N개」 글자 = 센 수 · 식 글자 = 개수', () => parts.filter(([, g]) => g.k === 'shapes').forEach(([w0, g]) => { nG.shapes++; const sh = readShapes(g); ok(sh.its.length === g.ns.length, w0 + ' 모양 수'); sh.its.forEach((it, i) => { nG.items++; ok(it.c === FORM[g.pat](it.n), w0 + ' ' + it.n + '째 ' + it.c + ' ≠ ' + FORM[g.pat](it.n)); ok(it.f === FIXED[g.pat], w0 + ' 노랑 ' + it.f); ok(it.lab.indexOf(ORD[it.n - 1]) >= 0, w0 + ' 순서 글자'); if (g.cnt !== false) ok(it.lab.indexOf(it.c + '개') >= 0, w0 + ' 개수 글자'); if (g.eq) ok(ev(g.eq[i]) === it.c, w0 + ' 식 ' + g.eq[i] + ' ≠ ' + it.c); }); if (g.q) ok(sh.q && ORD.indexOf(sh.q) > ORD.indexOf(ORD[g.ns[g.ns.length - 1] - 1]), w0 + ' 「?」 순서'); }));
/* 자기주도 원문 renderModels 대조 — 식·수·저울 식이 원문에 있음(원문 개념 글에서 온 식만 예외 목록) */
const MODEL = {}; KEYS.forEach(k => { const html = fs.readFileSync(path.join(TDIR, L[k].meta.live_url), 'utf8'); const i = html.indexOf('(function renderModels'); MODEL[k] = html.slice(i, html.indexOf('})();', i)).replace(/-/g, '−').replace(/\s+/g, ''); });
const SRCTXT = {}; KEYS.forEach(k => { SRCTXT[k] = nsp(JSON.stringify(SRC[k])).replace(/-/g, '−'); });
T('그림 자료가 자기주도 원문과 같음 — 식은 renderModels 또는 원문 개념 글 · 수 배열 수는 renderModels', () => { const off = [];
  parts.forEach(([w0, g, , , k]) => { const M = MODEL[k], S = SRCTXT[k]; const has = (e) => { const x = String(e).replace(/\s+/g, ''); return M.indexOf(x) >= 0 || S.indexOf(x) >= 0; };
    if (g.k === 'eqs') g.items.forEach(it => { nG.src++; if (!has(it.eq) && !it.eq.split('=').every(x => /[?□]/.test(x) || has(x))) off.push(w0 + ' ' + it.eq); }); // 원문 개념 글의 「1222221×4 … 4888884」처럼 양쪽이 따로 나온 식도 원문
    if (g.k === 'eqc') g.items.forEach(it => { nG.src++; if (!has(it.l) || !has(it.r)) off.push(w0 + ' ' + it.l + '=' + it.r); });
    if (g.k === 'bal') [g.l, g.r].forEach(sd => { const e = typeof sd === 'object' ? sd.expr : sd; if (e === '?') return; nG.src++; if (!has(e)) off.push(w0 + ' 저울 ' + e); });
    if (g.k === 'ngrid') g.rows.forEach(r => r.forEach(c => { const v = c && typeof c === 'object' ? c.v : c; if (typeof v === 'number') { nG.src++; if (M.indexOf(String(v)) < 0) off.push(w0 + ' 수 ' + v); } })); });
  ok(!off.length, '원문에 없는 자료 ' + off.slice(0, 8).join(' | ')); ok(nG.src >= 250, '대조 ' + nG.src); });
T('관계·규칙 부품 수 — 저울 ≥ 14 · 등호 카드 ≥ 10 · 수 배열 ≥ 12 · 계산식 배열 ≥ 12(식 ≥ 60) · 모양 배열 ≥ 18(모양 ≥ 50) · 줄 규칙 ≥ 20', () => ok(nG.bal >= 14 && nG.eqc >= 10 && nG.grid >= 12 && nG.eqs >= 12 && nG.eqrow >= 60 && nG.shapes >= 18 && nG.items >= 50 && nG.line >= 20, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 식·틀린 기울기·틀린 수 배열 잡음', () => { ok(model([[0, 3], [1, 5], [2, 8]]) === null, '규칙 없는 줄'); const d = docOf(FIG.render({ k: 'eqc', items: [{ l: '24×8', r: '12×8', judge: true }] })); ok(d.querySelector('.ec-j').textContent === '옳지 않아요 ×', '판정'); const b = readBal({ k: 'bal', l: '58+26', r: '60+20' }); ok(b.tilt === -7, '무거운 쪽'); ok(readShapes({ k: 'shapes', pat: 'cross', ns: [3] }).its[0].c === 12, '모양 세기'); });

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
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
const FIRST = [['등호', 2], ['계산기', 7], ['짝수', 8]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u6_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('등호') < 0, 'l01 개념 장 깨끗'); probe.content += ' 등호'; ok(JSON.stringify(probe).indexOf('등호') >= 0, '심은 낱말'); });

console.log('\n게이트 g4 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
