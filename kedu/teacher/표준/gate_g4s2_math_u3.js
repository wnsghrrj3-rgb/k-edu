/* gate_g4s2_math_u3.js — 4학년 2학기 수학 3단원 「소수의 덧셈과 뺄셈」 케이티처 2세대 게이트 (83차, 베프 — u2 게이트 틀 A~L + 소수 셈).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드(4학년 2학기 · slug g4s2_math 파일) · B 19장 골격 · C 7요소 · D 복습 계보(g4s2_math u2_l10 → l01 → … → l11, 단원을 넘는 계보)
   E 문제 정답 재계산 — 게이트 자체 소수 셈(수를 10^6 배 정수로 바꾸어 셈 · 부동소수 어긋남 0): 글에서 셈한 답(식 · 0.01이 몇 개 · 1이 a개… 인 수 · 10배·10분의 1
       · 몇 배·얼마 · 크기 비교 · 차례 · 자리 숫자 · 자리 값 · 단위 바꾸기 · 읽기 · 더 빠른 기록)과 그림에서 셈한 답(모눈 칸을 다시 셈 · 세로셈 두 줄을 다시 읽어 셈
       · 자릿값판 칸 숫자 · 수직선 점 좌표를 눈금으로 다시 잼)을 따로 내어 서로 같고 정답과 같음 — 88문항 전부, 원문 대조로 넘기는 문항 0
   F 식 전수 — 화면·교사 층·extras 의 셈 식 「a + b − c = d」 값이 맞음(kg·L·m·km·cm·초 떼고 · 소수는 정수 셈)
   G 그림 — dgrid(파랑·초록·✕ 칸 수 = 데이터 · 캡션 개수·값) · dline(눈금 수·간격 · 눈금 글자 · 점이 눈금 위 · 점 값 · 뛰기 글자 = 도착 − 출발)
       · dpv(칸 숫자 · 풀어 쓴 식 합 · 「0.01이 N개」 · 부등호 · 처음 달라지는 자리 · 숫자 옮김 줄) · dvert(답 = a ± b · 답 줄 · 받아올림·받아내림 표시 수
       · 오른쪽 끝 맞춤 꼴은 틀린 답) · rtab(합 · 가장 빠른 칸) · 문제 그림엔 답 없음(캡션·답 줄·받아 표시·풀어 쓴 식 0) · 개념 글 셈 주장
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음 · 요약 「다음:」 포함)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_math_u3.js */
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
const L = load(path.join(TDIR, 'data/g4s2_math_u3.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '소수의 덧셈과 뺄셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const near = (a, b, e) => Math.abs(a - b) < (e || 1e-6);

/* ── 게이트 자체 소수 셈(부품의 셈과 따로 짬) — 수를 10^6 배 정수로 바꾸어 셈한다 ── */
const SC = 1e6;
const I = (x) => Math.round(+x * SC);                 // 소수 → 정수
const V = (n) => +(n / SC).toFixed(6);                // 정수 → 소수(끝자리 0 없는 꼴)
const S = (n) => String(V(n));
const NUMR = '\\d+(?:\\.\\d+)?';
const EXPR = new RegExp('(' + NUMR + ')((?:\\s*[+−-]\\s*' + NUMR + ')+)');
function evalExpr(t) { const m = String(t).replace(/\*\*/g, '').match(EXPR); if (!m) return null; let acc = I(m[1]); const re = new RegExp('([+−-])\\s*(' + NUMR + ')', 'g'); let k; while ((k = re.exec(m[2]))) acc += (k[1] === '+' ? 1 : -1) * I(k[2]); return acc; }
const UNITS = { '0.1': 1e5, '0.01': 1e4, '0.001': 1e3 };
const DG = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
function readDec(x) { const [a, b] = String(x).split('.'); const n = +a; let ip = n === 0 ? '영' : ''; if (n >= 10) ip += (Math.floor(n / 10) > 1 ? DG[Math.floor(n / 10)] : '') + '십'; if (n % 10) ip += DG[n % 10]; return ip + (b ? ' 점 ' + b.split('').map(d => DG[+d]).join('') : ''); }
const PLACE = { '일의': 0, '십의': 1, '백의': 2, '소수 첫째': -1, '소수 둘째': -2, '소수 셋째': -3 };
function digitAt(x, p) { const [a, b = ''] = String(x).split('.'); return p >= 0 ? +(a[a.length - 1 - p] || 0) : +(b[-p - 1] || 0); }
function placeVal(x, d) { const [a, b = ''] = String(x).split('.'); const hits = []; a.split('').forEach((c, i) => { if (c === d) hits.push(+(d + '0'.repeat(a.length - 1 - i))); }); b.split('').forEach((c, i) => { if (c === d) hits.push(+('0.' + '0'.repeat(i) + d)); }); return hits.length === 1 ? hits[0] : null; }
const KN = { 한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5 };
const numOf = (t) => { const m = String(t).replace(/\*\*/g, '').match(/^(\d+(?:\.\d+)?)/); return m ? +m[1] : NaN; };

/* 글에서 셈 — 반환: {num} | {word} | {opt} | undefined(셀 수 없는 꼴) */
function textAns(q0, d) { const t = clean(q0); let m;
  if ((m = t.match(/^(.+?)(?:은|는) (\d+(?:\.\d+)?)초, (.+?)(?:은|는) (\d+(?:\.\d+)?)초입니다\. 더 빠른/))) return { word: I(m[2]) < I(m[4]) ? m[1] : m[3] };
  const cntU = (m = t.match(/(0\.0*1)이 (?:모두 )?몇 개인 수/)) ? m[1] : null;
  const pairs = []; const pr = /(?:^|[ ,])(\d+(?:\.\d+)?)이 (\d+)개/g; while ((m = pr.exec(t))) pairs.push([m[1], +m[2]]);
  if (pairs.length && /인 수는/.test(t)) { const tot = pairs.reduce((a, [u, n]) => a + I(u) * n, 0); if (cntU) return { num: tot / I(cntU) }; if (/얼마/.test(t)) return { num: V(tot) }; }
  if ((m = t.match(/1인 모눈종이 ([한두세네]) 장과 (0\.0*1)인 칸 (\d+)개/)) && cntU) return { num: (KN[m[1]] * SC + I(m[2]) * +m[3]) / I(cntU) };
  if (cntU) { const e = evalExpr(t); if (e != null && /그 (합|차)는|계산하면/.test(t)) return { num: e / I(cntU) }; if ((m = t.match(/(\d+(?:\.\d+)?)(?:은|는) 0\.0*1이 (?:모두 )?몇 개인 수/))) return { num: I(m[1]) / I(cntU) }; return undefined; }
  if ((m = t.match(/^(\d+(?:\.\d+)?)(?:을|를) 바르게 읽/))) return { word: readDec(m[1]) };
  if ((m = t.match(/^([\d., ]+?)(?:을|를) (큰|작은) 수부터 차례로 놓은 것/))) { const xs = m[1].split(', '); xs.sort((a, b) => (m[2] === '큰' ? I(b) - I(a) : I(a) - I(b))); return { word: xs.join(', ') }; }
  if (/크기를 바르게 비교한 것/.test(t) && d && d.options) { const tr = d.options.map(o => { const k = o.text.match(/^(\d+(?:\.\d+)?) ([<>=]) (\d+(?:\.\d+)?)$/); if (!k) return false; const a = I(k[1]), b = I(k[3]); return k[2] === '>' ? a > b : k[2] === '<' ? a < b : a === b; }); const hit = tr.map((x, i) => (x ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
  if ((m = t.match(/(\d+(?:\.\d+)?)(?:과|와) (\d+(?:\.\d+)?) 중 더 (큰|작은) 수/))) return { num: (m[3] === '큰') === (I(m[1]) > I(m[2])) ? +m[1] : +m[2] };
  if ((m = t.match(/(소수 첫째|소수 둘째|소수 셋째|일의|십의) 자리 숫자는 몇/))) { const p = PLACE[m[1]]; let x; const k = t.match(/더 큰 수의/) ? (t.match(/\d+(?:\.\d+)?/g) || []).sort((a, b) => I(b) - I(a))[0] : ((t.match(/(\d+(?:\.\d+)?)의 (?:소수|일의|십의)/) || [])[1]); x = k; if (x == null) return undefined; return { num: digitAt(x, p) }; }
  if ((m = t.match(/(\d+(?:\.\d+)?)에서 (\d)(?:은|는) (?:무엇|얼마)(?:을|를) 나타(?:내|낼)/))) { const v = placeVal(m[1], m[2]); return v == null ? null : { num: v }; }
  if ((m = t.match(/어떤 수의 (10|100|1000)배가 (\d+(?:\.\d+)?)입니다/))) return { num: V(I(m[2]) / +m[1]) };
  if ((m = t.match(/^(\d+(?:\.\d+)?)(?:은|는) (\d+(?:\.\d+)?)의 몇 배/))) return { num: I(m[1]) / I(m[2]) };
  if ((m = t.match(/(\d+(?:\.\d+)?)의 몇 배가 (\d+(?:\.\d+)?)/))) return { num: I(m[2]) / I(m[1]) };
  if ((m = t.match(/^(\d+(?:\.\d+)?)(?:은|는) (\d+(?:\.\d+)?)의 얼마/))) { const r = I(m[1]) / I(m[2]); return r >= 1 ? { word: r + '배' } : { word: Math.round(1 / r) + '분의 1' }; }
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|g|L|m|km|cm|초)?의 (10|100|1000)배는/))) return { num: V(I(m[1]) * +m[2]) };
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|g|L|m|km|cm|초)?의 (10|100|1000)분의 1은/))) return { num: V(I(m[1]) / +m[2]) };
  if ((m = t.match(/^(\d+) (cm|m|g|mL)(?:는|은) 몇 (m|km|kg|L)일까요/))) { const div = m[2] === 'cm' ? 100 : 1000; return { num: V(I(m[1]) / div) }; }
  if (/얼마|몇 (kg|L|m|km|초|cm)일까요/.test(t)) { const e = evalExpr(t); if (e != null) return { num: V(e) }; }
  return undefined; }

/* 그림에서 셈 — 게이트가 그려진 모양을 다시 읽는다 */
function figAns(f, q0, d) { const t = clean(q0); const h = FIG.render(f); const D = docOf(h); let m; const cntU = (m = t.match(/(0\.0*1)이 (?:모두 )?몇 개인 수/)) ? m[1] : null;
  const asCount = (val) => (cntU ? { num: val / I(cntU) } : undefined);
  if (f.k === 'dgrid') { const svg = D.querySelector('svg'); const u = svg.getAttribute('data-unit'); let on;
    if (u === '0.001') on = Array.from(svg.querySelectorAll('rect.o-dc.on')).reduce((a, r) => a + +r.getAttribute('data-s'), 0); else on = svg.querySelectorAll('rect.o-dc.on').length;
    const xs = svg.querySelectorAll('path.o-dx').length; return asCount((on - xs) * I(u)); }
  if (f.k === 'dvert') { const rd = (cl) => { const row = D.querySelector('.' + cl); return Array.from(row.querySelectorAll('span')).map(s => (s.className === 'dp' ? '.' : s.textContent || (s.className === 'pz' ? '0' : ''))).join('').replace(/^\s+/, ''); };
    const a = rd('dv-a'), b = rd('dv-b'), op = D.querySelector('.dv-b em').textContent; const r = I(a) + (op === '+' ? 1 : -1) * I(b);
    if (cntU) return asCount(r); return optOf({ num: V(r) }, d); }
  if (f.k === 'dpv') { const ths = Array.from(D.querySelectorAll('tr.pv-head th')).filter(x => x.className !== 'dp' && x.textContent).map(x => x.innerHTML.replace('<br>', ' ')); const rows = Array.from(D.querySelectorAll('tr.pv-row'));
    const valOf = (tr) => { const tds = Array.from(tr.querySelectorAll('td')); return tds.map(td => (td.className.indexOf('dp') >= 0 ? '.' : td.textContent)).join(''); };
    if (rows.length !== 1) return undefined; const v = valOf(rows[0]);
    if (cntU) return asCount(I(v));
    if ((m = t.match(/(소수 첫째|소수 둘째|소수 셋째|일의) 자리 숫자는 몇/))) { const nm = m[1].replace('의', ''); const tds = Array.from(rows[0].querySelectorAll('td')).filter(td => td.className.indexOf('dp') < 0); const ci = ths.indexOf(nm === '일' ? '일' : nm); return ci >= 0 ? { num: +tds[ci].textContent } : null; }
    if ((m = t.match(/에서 (\d)(?:은|는) (?:무엇|얼마)(?:을|를) 나타(?:내|낼)/))) { const pv = placeVal(v, m[1]); return pv == null ? null : optOf({ num: pv }, d); }
    return undefined; }
  if (f.k === 'dline') { const svg = D.querySelector('svg'); const tk = Array.from(svg.querySelectorAll('line.o-tk')).map(l => +l.getAttribute('x1')); const x0 = tk[0], x1 = tk[tk.length - 1], n = tk.length - 1;
    const texts = Array.from(svg.querySelectorAll('text')).map(e => [+e.getAttribute('x'), e.textContent]); const lab = (x) => texts.find(([tx, s]) => Math.abs(tx - x) < 0.6 && /^\d+(\.\d+)?$/.test(s));
    const lo = I(lab(x0)[1]), hi = I(lab(x1)[1]); const valAt = (cx) => lo + Math.round((cx - x0) / (x1 - x0) * n) * (hi - lo) / n;
    const marks = Array.from(svg.querySelectorAll('circle.o-mark')).map(c => valAt(+c.getAttribute('cx')));
    const qx = texts.find(([, s]) => s === '?'); if (qx) { const cs = Array.from(svg.querySelectorAll('circle.o-mark')); const c = cs.reduce((a, c2) => (Math.abs(+c2.getAttribute('cx') - qx[0]) < Math.abs(+a.getAttribute('cx') - qx[0]) ? c2 : a)); return optOf({ num: V(valAt(+c.getAttribute('cx'))) }, d); }
    if ((m = t.match(/더 큰 수의 (소수 첫째|일의) 자리 숫자/))) return { num: digitAt(S(Math.max(...marks)), PLACE[m[1]]) };
    return undefined; }
  return undefined; }
function pick(opts, fn) { if (!opts) return null; const hit = opts.map((o, i) => (fn(o) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
function optOf(res, d) {
  if (!res || res.opt != null || !d || !d.options) return res; const opts = d.options.map(o => o.text);
  if (res.num != null) { const r = pick(opts, (o) => near(numOf(o), res.num, 1e-9)); return r || res; }
  if (res.word != null) { const r = pick(opts, (o) => clean(o) === res.word); return r || res; }
  return res; }
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(near(got, res.num, 1e-9), where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('11차시 키 u3_l01~l11 · 파일 data/g4s2_math_u3.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 3단원 소수의 덧셈과 뺄셈 · 성취기준 표시 · live_url 실파일 · 40분', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 3 && m.unit_title === '소수의 덧셈과 뺄셈' && /소수/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\/3단원_소수의덧셈과뺄셈\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u2_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4s2_math u2_l10(2단원 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_math:u2_l10'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0, nSrc = 0; const unread = [];
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
const srcP = (k, q) => SRC[k].problems.find(p => normT(p.q.replace(/인가요\?$/, '일까요?')) === normT(q));
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈 · 셀 수 없는 말 문항은 원문 정답 보기)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question, d); if (ta) ta = optOf(ta, d); const fa = d.fig ? figAns(d.fig, d.question, d) : undefined;
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; if (r === undefined) { const p = srcP(k, d.question); ok(p && d.options && d.options[p.ci] && d.options[p.ci].correct, s.id + ' 원문 정답 보기와 다름'); nSrc++; return; }
    nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 = 88 (못 읽는 문항 0 · 원문 대조 0) · 그림에서 셈한 문항 ≥ 20 · 글·그림 둘 다 셈해 대조 ≥ 12', () => ok(nCheck === 88 && nSrc === 0 && !unread.length && nFigQ >= 20 && nBoth >= 12, 'nCheck ' + nCheck + ' · 원문 대조 ' + nSrc + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 못 읽음 ' + unread.join(' | ')));
T('소수 셈기 자체 확인 — 부동소수 어긋남 0 · 읽기 · 자리 · 틀린 그림 잡음', () => {
  ok(SAME(textAns('0.1 + 0.2 는 얼마일까요?'), { num: 0.3 }), '0.1 + 0.2 = 0.3'); ok(SAME(textAns('7.1 − 2.99 는 얼마일까요?'), { num: 4.11 }), '7.1 − 2.99');
  ok(readDec('12.05') === '십이 점 영오' && readDec('0.814') === '영 점 팔일사', '읽기'); ok(SAME(textAns('0.24는 2.4의 얼마일까요?'), { word: '10분의 1' }), '얼마');
  ok(SAME(textAns('4.275에서 7은 무엇을 나타내나요?'), { num: 0.07 }), '자리 값'); ok(SAME(textAns('1이 3개, 0.1이 5개, 0.01이 6개인 수는 0.01이 모두 몇 개인 수일까요?'), { num: 356 }), '개수');
  const bad = figAns({ k: 'dgrid', unit: 0.01, v: '0.73', b: '0.25' }, '0.73 + 0.24 를 모눈종이에 나타냈습니다. 그 합은 0.01이 몇 개인 수일까요?', {}); ok(!SAME(bad, textAns('0.73 + 0.24 를 모눈종이에 나타냈습니다. 그 합은 0.01이 몇 개인 수일까요?')), '틀린 모눈 잡음'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u3_l01\.slides\.1\.data\.items\./.test(where); // l01 복습 = u2_l10 출구(그 게이트가 검산)
const NUM = '\\d+(?:\\.\\d+)?';
const CH = new RegExp('(?<![\\d.])(\\(?' + NUM + '(?:\\s*[+\\-×÷]\\s*\\(?' + NUM + '\\)?)+\\)?)\\s*=\\s*(' + NUM + ')(?![\\d.])', 'g');
function calc(e) { const s = e.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(s)) return NaN; if (/[*/()]/.test(s)) return Function('return (' + s + ')')(); return V(evalExpr(s)); }
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)\s*(cm|km|kg|mL|m|g|L|초)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { let lhs = m[1]; const open = (lhs.match(/\(/g) || []).length, close = (lhs.match(/\)/g) || []).length; if (open !== close) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const v = calc(lhs); if (!Number.isFinite(v)) continue; nEq++; if (!near(v, +m[2], 1e-9)) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 40, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['0.9 + 0.7 = 0.16', '35.7 − 11.92 = 23.82', '1.6 + 0.52 = 1.68'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('0.1 + 0.2 = 0.3 · 150.21 − 148.89 = **1.32초** · 1.35 + 0.9 = **2.25** L', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k, s]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k, s])));
T('개념 44장 모두 그림 · 기본 문제 그림 33 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length === 33, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { dgrid: 0, dline: 0, dpv: 0, dvert: 0, rtab: 0, cap: 0, marks: 0 };
function checkPart(w0, f, blk) { const h = FIG.render(f); const D = docOf(h);
  if (f.k === 'dgrid') { nG.dgrid++; const svg = D.querySelector('svg'); const u = svg.getAttribute('data-unit'); const k = u === '0.1' ? 1 : u === '0.01' ? 2 : 3; const per = Math.pow(10, k);
    const a = I(f.v) / I(u), b = f.b ? I(f.b) / I(u) : 0, x = f.x ? I(f.x) / I(u) : 0;
    const blue = k === 3 ? Array.from(svg.querySelectorAll('rect.o-dc.on')).reduce((s, r) => s + +r.getAttribute('data-s'), 0) : svg.querySelectorAll('rect.o-dc.on:not(.b)').length, green = svg.querySelectorAll('rect.o-dc.on.b').length, cr = svg.querySelectorAll('path.o-dx').length;
    ok(blue === a && green === b && cr === x, w0 + ' 칸 수 ' + [blue, green, cr] + ' ≠ ' + [a, b, x]); ok(k === 3 || svg.querySelectorAll('rect.o-dc').length === per * +svg.getAttribute('data-sheets'), w0 + ' 판 칸 수');
    const cap = Array.from(svg.querySelectorAll('text')).map(e => e.textContent).find(s => /개/.test(s));
    if (blk === 'basic_problem') ok(!cap, w0 + ' 문제 그림에 캡션(답)'); else if (cap) { nG.cap++; const nums = cap.match(/\d+(?:\.\d+)?/g); const cnt = b ? a + b : x ? a - x : a; const shown = +nums[nums.length - 2]; ok(shown === cnt, w0 + ' 캡션 개수 ' + cap); ok(I(nums[nums.length - 1]) === cnt * I(u), w0 + ' 캡션 값 ' + cap); if (b) ok(cap.indexOf(a + ' + ' + b) >= 0, w0 + ' 캡션 식'); if (x) ok(cap.indexOf(a + ' − ' + x) >= 0, w0 + ' 캡션 식'); } }
  if (f.k === 'dline') { nG.dline++; const svg = D.querySelector('svg'); const tk = Array.from(svg.querySelectorAll('line.o-tk')).map(l => +l.getAttribute('x1')); ok(tk.length === f.n + 1, w0 + ' 눈금 ' + tk.length); const gaps = tk.slice(1).map((v, i) => v - tk[i]); ok(Math.max(...gaps) - Math.min(...gaps) < 0.3, w0 + ' 눈금 간격 고르지 않음');
    const texts = Array.from(svg.querySelectorAll('text')).map(e => [+e.getAttribute('x'), e.textContent, +e.getAttribute('y')]); const lab = (x) => texts.find(([tx, s]) => Math.abs(tx - x) < 0.6 && /^\d+(\.\d+)?$/.test(s));
    ok(lab(tk[0]) && I(lab(tk[0])[1]) === I(f.lo) && lab(tk[tk.length - 1]) && I(lab(tk[tk.length - 1])[1]) === I(f.hi), w0 + ' 양 끝 글자'); const lo = I(f.lo), hi = I(f.hi);
    texts.filter(([tx, s, y]) => /^\d+(\.\d+)?$/.test(s) && y > 160).forEach(([tx, s]) => { const i = tk.findIndex(x => Math.abs(x - tx) < 0.6); ok(i >= 0 && I(s) === lo + i * (hi - lo) / f.n, w0 + ' 눈금 글자 ' + s); });
    const cs = Array.from(svg.querySelectorAll('circle.o-mark')); (f.marks || []).forEach((mk, j) => { nG.marks++; const cx = +cs[j].getAttribute('cx'); const i = Math.round((cx - tk[0]) / (tk[tk.length - 1] - tk[0]) * f.n); ok(Math.abs(tk[i] - cx) < 0.6, w0 + ' 점이 눈금 위 아님'); ok(lo + i * (hi - lo) / f.n === I(mk.at), w0 + ' 점 위치 ' + mk.at); });
    if (f.hop) { const hl = texts.find(([, s]) => /^[+−]/.test(s)); ok(hl && (hl[1][0] === '+' ? 1 : -1) * I(hl[1].slice(1)) === I(f.hop.to) - I(f.hop.from), w0 + ' 뛰기 글자 ' + (hl && hl[1])); } }
  if (f.k === 'dpv') { nG.dpv++; const rows = Array.from(D.querySelectorAll('tr.pv-row')); const vals = (f.rows || [{ v: f.v }]).map(r => r.v);
    ok(rows.length === vals.length, w0 + ' 줄 수'); rows.forEach((tr, i) => { const s = Array.from(tr.querySelectorAll('td')).map(td => (td.className.indexOf('dp') >= 0 ? '.' : td.className.indexOf('pz') >= 0 ? '' : td.textContent)).join(''); ok(/^\d*\.\d*$/.test(s) && I(s) === I(vals[i]), w0 + ' 칸 숫자 ' + s + ' ≠ ' + vals[i]); });
    D.querySelectorAll('.pv-eq').forEach(e => { const tx = e.textContent; let m2; if ((m2 = tx.match(/^(\S+) = (.+)$/))) ok(m2[2].split(' + ').reduce((a, p) => a + I(p), 0) === I(m2[1]), w0 + ' 풀어 쓴 식 ' + tx); else if ((m2 = tx.match(/^(\S+) ([<>=]) (\S+)$/))) { const a = I(m2[1]), b = I(m2[3]); ok(m2[2] === (a > b ? '>' : a < b ? '<' : '='), w0 + ' 부등호 ' + tx); } });
    D.querySelectorAll('.pv-read').forEach(e => { const m2 = e.textContent.match(/^(\S+?)(?:은|는) (0\.0*1)이 (\d+)개/); ok(m2 && I(m2[1]) === +m2[3] * I(m2[2]), w0 + ' 개수 ' + e.textContent); });
    const df = D.querySelector('.fig-dpv').getAttribute('data-diff'); if (f.cmp) { const a = vals[0], b = vals[1]; const P = ['일', '소수 첫째', '소수 둘째', '소수 셋째']; const first = P.find((p, i) => digitAt(a, i ? -i : 0) !== digitAt(b, i ? -i : 0)); ok(df === first, w0 + ' 처음 달라지는 자리 ' + df + ' ≠ ' + first); }
    const sh = D.querySelector('.pv-shift'); if (sh) { const r = I(vals[1]) / I(vals[0]); const want = r > 1 ? '×' + r + ' → 숫자가 왼쪽으로 ' + ['', '한', '두', '세'][Math.round(Math.log10(r))] + ' 자리' : Math.round(1 / r) + '분의 1 → 숫자가 오른쪽으로 ' + ['', '한', '두', '세'][Math.round(Math.log10(1 / r))] + ' 자리'; ok(sh.textContent === want, w0 + ' 옮김 ' + sh.textContent + ' ≠ ' + want); }
    if (blk === 'basic_problem') ok(!sh && !D.querySelector('.pv-read') && !D.querySelector('.pv-eq'), w0 + ' 문제 그림에 답 줄'); }
  if (f.k === 'dvert') { nG.dvert++; const el = D.querySelector('.fig-dvert');
    if (f.bad) { ok(I(el.getAttribute('data-r')) !== I(f.a) + I(f.b), w0 + ' 틀린 꼴이 맞는 답'); ok(el.getAttribute('data-r') === S((+String(f.a).replace('.', '') + +String(f.b).replace('.', '')) * Math.pow(10, -String(f.b).split('.')[1].length) * SC), w0 + ' 오른쪽 끝 맞춤 답'); return; }
    const op = f.op === '+' ? 1 : -1, r = I(f.a) + op * I(f.b);
    if (f.answer === false) { ok(!D.querySelector('.dv-r') && !D.querySelector('.dv-carry'), w0 + ' 문제 그림에 답·받아 표시'); return; }
    ok(I(el.getAttribute('data-r')) === r, w0 + ' 답 ' + el.getAttribute('data-r'));
    const rr = Array.from(D.querySelector('.dv-r').querySelectorAll('span')).map(s => (s.className === 'dp' ? '.' : s.textContent)).join(''); ok(I(rr) === r, w0 + ' 답 줄 ' + rr);
    const nf = Math.max((String(f.a).split('.')[1] || '').length, (String(f.b).split('.')[1] || '').length); const dg = (x, i) => digitAt(x, i); let c = 0, cnt = 0; const top = Math.max(String(f.a).split('.')[0].length, String(f.b).split('.')[0].length) - 1;
    if (op > 0) { for (let i = -nf; i <= top; i++) { const s2 = dg(f.a, i) + dg(f.b, i) + c; c = s2 >= 10 ? 1 : 0; if (c && i < top) cnt++; } } else { let br = 0; for (let i = -nf; i <= top; i++) { let w2 = dg(f.a, i) - br; br = 0; if (w2 < dg(f.b, i)) { w2 += 10; br = 1; } if (w2 !== dg(f.a, i)) cnt++; } }
    const shown = Array.from(D.querySelector('.dv-carry').querySelectorAll('span')).filter(s => s.textContent.trim()).length; ok(shown === cnt, w0 + ' 받아 표시 ' + shown + ' ≠ ' + cnt); }
  if (f.k === 'rtab') { nG.rtab++; if (f.sum) { const sums = D.querySelector('.fig-rtab').getAttribute('data-sums').split(','); f.rows.forEach((r, i) => ok(I(sums[i]) === r.v.reduce((a, x) => a + I(x), 0), w0 + ' 합 ' + sums[i])); }
    (f.hi || []).forEach(([ri, ci]) => { const col = SWIM.map(s => I(s.v[ci])); ok(I(f.rows[ri].v[ci]) === Math.min(...col), w0 + ' 가장 빠른 칸 표시가 가장 작은 기록이 아님'); }); } }
const SWIM = L.u3_l10.slides[6].data.fig.rows;
T('그림 부품 전수 — 모눈 칸 수·캡션 · 수직선 눈금·점·뛰기 · 자릿값판 숫자·풀어 쓴 식·개수·부등호·옮김 · 세로셈 답·받아 표시 · 기록표 합·가장 빠른 칸', () => { parts.forEach(([w0, g, b]) => checkPart(w0, g, b)); ok(nG.dgrid >= 20 && nG.dline >= 9 && nG.dpv >= 18 && nG.dvert >= 20 && nG.rtab >= 4 && nG.cap >= 8 && nG.marks >= 14, JSON.stringify(nG)); });
T('개념 글 속 소수 셈 주장 = 게이트 셈 (「0.73 + 0.24 = 0.97」·「0.01이 95개 … 43개 … 52개」 등)', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const t = clean(s.data.content); let m; const re = /0\.(0*)1이 (\d+)개/g; const cs = []; while ((m = re.exec(t))) cs.push(+m[2]); const e = t.match(/(\d+(?:\.\d+)?) ([+−]) (\d+(?:\.\d+)?) = (\d+(?:\.\d+)?)/); if (e) { n++; ok(I(e[1]) + (e[2] === '+' ? 1 : -1) * I(e[3]) === I(e[4]), k + ' ' + s.id + ' ' + e[0]); } })); ok(n >= 8, '주장 ' + n); });
T('개념 그림의 수 = 그 차시 개념 글의 수 (모눈·수직선·자릿값판·세로셈)', () => { let n = 0; KEYS.forEach(k => { const con = L[k].slides.filter(s => s.block === 'concept'); const txt0 = con.map(s => clean(s.data.title + ' ' + s.data.content)).join(' '); const nums = new Set((txt0.match(/\d+(?:\.\d+)?/g) || []).map(x => I(x)));
  con.forEach(s => flat(s.data.fig).forEach(([g]) => { const want = g.k === 'dgrid' ? [g.v, g.b, g.x] : g.k === 'dvert' ? [g.a, g.b] : g.k === 'dpv' ? (g.rows || [{ v: g.v }]).map(r => r.v) : g.k === 'dline' ? (g.marks || []).map(mk => mk.at) : []; want.filter(x => x != null).forEach(x => { n++; ok(nums.has(I(x)), k + ' ' + s.id + ' 그림의 ' + x + ' 가 개념 글에 없음'); }); })); }); ok(n >= 50, '대조 ' + n); });
T('그림 검사기 자체 확인 — 틀린 모눈·틀린 세로셈·틀린 부등호 잡음', () => { let caught = 0; const tries = [() => checkPart('p', Object.assign({ k: 'dgrid', unit: 0.01, v: '0.73', b: '0.24' }, { __bad: 1 }), 'concept'), () => { const D = docOf(FIG.render({ k: 'dpv', rows: [{ v: '1.642' }, { v: '1.648' }], cmp: true }).replace('&lt;', '&gt;')); const tx = D.querySelector('.pv-eq').textContent.match(/^(\S+) ([<>=]) (\S+)$/); ok(tx[2] === (I(tx[1]) > I(tx[3]) ? '>' : '<'), 'x'); }, () => { const D = docOf(FIG.render({ k: 'dvert', a: '0.84', op: '+', b: '0.3' }).replace('data-r="1.14"', 'data-r="0.87"')); ok(I(D.querySelector('.fig-dvert').getAttribute('data-r')) === I('0.84') + I('0.3'), 'x'); }];
  tries.forEach((fn, i) => { try { fn(); } catch (e) { caught++; } }); ok(caught === 2, '잡은 수 ' + caught + ' (첫째는 맞는 그림이라 통과해야 함)'); });

console.log('═══ H. 재료 충실 ═══');
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제(보기·정답 그대로)', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(x.text));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(normT(s.data.content)) >= 0, s.id + ' 원문 아님'));
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
T('마지막 차시 「다음 단원엔」 = 4단원 다각형 · 다른 차시는 「다음 시간엔」 · 차단 어휘 0', () => { const nx = L.u3_l11.slides[18].data; ok(nx.title === '다음 단원엔' && /다각형/.test(nx.preview), '다음 단원'); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로'].forEach(b => ok(all.indexOf(b) < 0, '차단 어휘 ' + b)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary;
const FIRST = [['소수 둘째 자리', 2], ['소수 셋째 자리', 3], ['10배', 3], ['10분의 1', 4], ['100배', 4], ['받아올림', 6], ['세로로', 6], ['자릿수', 7], ['받아내림', 8], ['혼계영', 10]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(srcTxt(KEYS[n - 1]).indexOf(w0) >= 0, '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('요약 「다음」 줄·arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { const nx = FIRST.filter(([, n]) => n > i + 1).map(([w0]) => w0); const ar = JSON.stringify(L[k].slides[16].data); nx.forEach(w0 => ok(ar.indexOf(w0) < 0, k + ' 요약에 「' + w0 + '」')); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u3_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('받아내림') < 0, 'l01 개념 장 깨끗'); probe.content += ' 받아내림'; ok(JSON.stringify(probe).indexOf('받아내림') >= 0, '심은 낱말'); });

console.log('\n게이트 g4s2 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
