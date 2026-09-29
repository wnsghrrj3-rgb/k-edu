/* gate_g3s2_math_u5.js — 3학년 2학기 수학 5단원 「들이와 무게」 케이티처 2세대 게이트 (33차, 베프 — u4 게이트 복제 + 들이·무게 검산).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(u4_l11 → l01 → … → l10) · E 문제 정답(L·mL / kg·g·t 바꾸기 · 들이·무게 덧셈과 뺄셈 □ 채우기 · 통에 담은 양 재계산)
   F 산수·단위 전수(× + − ÷ 식 · 「Q + Q = Q」·「Q = Q」 들이·무게 식 — L·mL / kg·g·t 을 mL·g 로 바꾸어 전수 재계산)
   G 그림(beaker·dial 눈금·읽은 값 · tvert base 1000 결과 · tubs 합 = 목표 · show 식 재계산)
   H 재료 충실(자기주도 원문 계승) · L 선행 용어(L·mL·리터 l02 전 · kg·g·t·킬로그램·톤 l06 전 학생 화면 0)
   I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_math_u5.js */
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
const L = load(path.join(TDIR, 'data/g3s2_math_u5.js'));
const U4 = load(path.join(TDIR, 'data/g3s2_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u5.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

// 2세대 무대 부팅(jsdom)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '들이와 무게', classNames: [] });

console.log('═══ A. 로드 ═══');
T('10차시 키 u5_l01~l10', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit_title 들이와 무게 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 5 && m.unit_title === '들이와 무게' && m.std === '[4수03-04]' && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex11 = U4.u4_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u4_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex11;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u4_l11'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
// 들이·무게 수 = 「a 단위 (b 단위)」 — 들이는 mL, 무게는 g 로 바꾸어 센다
const UB = { mL: ['v', 1], L: ['v', 1000], g: ['w', 1], kg: ['w', 1000], t: ['w', 1000000] };
const QRE = '\\d+\\s*(?:kg|mL|t|g|L)(?![A-Za-z])(?:\\s+\\d+\\s*(?:kg|mL|t|g|L)(?![A-Za-z]))*';
const qv = (t) => { const toks = [...String(t).matchAll(/(\d+)\s*(kg|mL|t|g|L)(?![A-Za-z])/g)]; if (!toks.length) return null; const dim = UB[toks[0][2]][0]; let v = 0; for (const m of toks) { if (UB[m[2]][0] !== dim) return null; v += m[1] * UB[m[2]][1]; } return { v, dim }; };
const fmtQ = (v, dim) => { const big = dim === 'v' ? 'L' : 'kg', sm = dim === 'v' ? 'mL' : 'g', a = Math.floor(v / 1000), b = v % 1000; return a && b ? a + ' ' + big + ' ' + b + ' ' + sm : a ? a + ' ' + big : b + ' ' + sm; };
const exprQ = (e) => { const parts = String(e).split(/\s*([+−])\s*/); let tot = 0, dim = null, sign = 1; for (let i = 0; i < parts.length; i++) { if (i % 2) { sign = parts[i] === '+' ? 1 : -1; continue; } const q = qv(parts[i]); if (!q || (dim && q.dim !== dim)) return null; if (!new RegExp('^\\s*' + QRE + '\\s*$').test(parts[i])) return null; dim = q.dim; tot += sign * q.v; } return { v: tot, dim }; };
const nsp = (s) => String(s).replace(/\s+/g, '').replace(/^약/, '');
const leadU = (q) => { const t = String(q).replace(/\*\*/g, ''); let m;
  if ((m = t.match(new RegExp('(' + QRE + ')\\s*(?:은|는)\\s*몇\\s*(mL|g|kg)(?:인가요|일까요)')))) { const x = qv(m[1]); if (x) return x.v / UB[m[2]][1]; }
  if ((m = t.match(/^(\d+)\s*(mL|g)\s*(?:은|는)\s*몇\s*(?:L 몇 mL|kg 몇 g)(?:인가요|일까요)\?\s*(?:L|kg) 앞/))) return Math.floor(m[1] / 1000);
  if ((m = t.match(/^(\d+)\s*(mL|g)\s*(?:은|는)\s*몇\s*(?:L 몇 mL|kg 몇 g)(?:인가요|일까요)\??$/))) return fmtQ(+m[1], UB[m[2]][0]);
  if ((m = t.match(new RegExp('^(' + QRE + '(?:\\s*[+−]\\s*' + QRE + ')+)\\s*(?:은|는)\\s*몇\\s*(?:L 몇 mL|kg 몇 g)')))) { const x = exprQ(m[1]); if (x) return fmtQ(x.v, x.dim); }
  if ((m = t.match(/^(.+?)\s*=\s*(.+?)\s*에서\s*\?\s*에 알맞은 수/))) { const x = exprQ(m[1]); const toks = [...m[2].matchAll(/(\d+|\?)\s*(kg|mL|t|g|L)(?![A-Za-z])/g)]; if (x && toks.length) { const big = Math.floor(x.v / 1000), sm = x.v % 1000; const hit = toks.findIndex(k => k[1] === '?'); if (toks.length === 2 && hit >= 0) { const other = toks[1 - hit][1]; ok(+other === (hit === 0 ? sm : big), '□ 식 다른 칸 틀림: ' + t); return hit === 0 ? big : sm; } } }
  if ((m = t.match(/(\d+)\s*(?:L|kg)\s*(?:통|봉지)\s*(\d+)개에 담은[^?]*모두 몇/))) return m[1] * m[2];
  if ((m = t.match(/(\d+)\s*(?:L|kg)를\s*(\d+)\s*(?:L|kg)\s*(?:통|봉지)에 남김없이 담으려면[^?]*몇 개/))) { if (m[1] % m[2]) throw new Error('나누어떨어지지 않음: ' + t); return m[1] / m[2]; }
  if ((m = t.match(/(\d+)\s*cm\s*(\d+)\s*mm는 몇 mm/))) return m[1] * 10 + +m[2];
  if ((m = t.match(/(\d+)\s*km\s*(\d+)\s*m는 몇 m/))) return m[1] * 1000 + +m[2];
  if ((m = t.match(/(\d+)\s*g인\s*[^\d]*?(\d+)(?:개|권)의 무게는 몇 g/))) return m[1] * m[2];
  if ((m = t.match(/(\d+)\s*mL 비커 (?:두|세|네|\d+) ?개가 가득/)) && /모두 몇 mL/.test(t)) { const n = { 두: 2, 세: 3, 네: 4 }[(t.match(/비커 (두|세|네)/) || [])[1]]; const extra = (t.match(/(\d+)\s*mL가 더/) || [0, 0])[1]; if (n) return m[1] * n + +extra; }
  return null; };
const same = (a, v) => typeof v === 'number' ? parseInt(String(a).replace(/[^\d]/g, ''), 10) === v : nsp(a) === nsp(v);
let nCheck = 0, nOpt = 0;
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const v = leadU(d.question); if (v != null) { nCheck++; nOpt++; ok(same(d.options.find(o => o.correct).text, v), s.id + ' ' + d.question + ' → ' + v); } }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = leadU(d.question); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' ≠ ' + d.answer); } ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadU(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + v + ' ≠ ' + lv[t].a); } ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadU(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + v + ' ≠ ' + it.a); } }); }));
T('다시 계산한 정답 수 ≥ 45', () => ok(nCheck >= 45, 'nCheck ' + nCheck));
T('재계산기 자체 확인 — 바꾸기·□ 채우기·몇 L 몇 mL·통 담기', () => { ok(leadU('3 L 150 mL는 몇 mL일까요?') === 3150 && leadU('4900 g은 몇 kg 몇 g인가요? kg 앞에 올 수를 쓰세요.') === 4 && leadU('4 t은 몇 kg인가요?') === 4000, '바꾸기');
  ok(leadU('3 L 200 mL + 2 L 500 mL = ? L 700 mL 에서 ? 에 알맞은 수는 무엇인가요?') === 5 && leadU('8 L 900 mL − 4 L 400 mL = 4 L ? mL 에서 ? 에 알맞은 수는 무엇인가요?') === 500, '□ 채우기');
  ok(leadU('6040 g은 몇 kg 몇 g일까요?') === '6 kg 40 g' && leadU('7 L 850 mL − 4 L 320 mL는 몇 L 몇 mL일까요?') === '3 L 530 mL' && leadU('10 L 통 7개에 담은 우유는 모두 몇 L인가요?') === 70, '몇 L 몇 mL·통');
  let bad = false; try { leadU('3 L 200 mL + 2 L 500 mL = ? L 900 mL 에서 ? 에 알맞은 수는 무엇인가요?'); } catch (e) { bad = true; } ok(bad, '□ 식 다른 칸 틀림을 못 잡음'); });

console.log('═══ F. 산수·단위 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where); // 틀린 생각·「이런 경우」·오답 보기는 틀린 식을 일부러 적는다
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
allStr.forEach(([s0, where]) => { if (skip(where)) return; const s = s0.replace(/\*\*/g, ''); const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×+−])/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); const pc = before.slice(-1); if (/[\d×+−=□).·\/]/.test(pc)) continue; const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } });
T('수 식 전수 재계산 (× + − ' + nEq + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
// 단위 식 — 「Q (± Q)* = Q (± Q)* (= …)」 사슬: 칸마다 mL·g 로 바꾸어 모두 같아야 한다
const QB = []; let nQ = 0;
const reChain = new RegExp('(?<![\\d.])(' + QRE + '(?:\\s*[+−]\\s*' + QRE + ')*)((?:\\s*=\\s*' + QRE + '(?:\\s*[+−]\\s*' + QRE + ')*)+)', 'g');
const qcheck = (s, where) => { reChain.lastIndex = 0; let m; while ((m = reChain.exec(s))) { if (/^\s*\?/.test(s.slice(m.index + m[0].length))) continue; const segs = (m[1] + m[2]).split(/\s*=\s*/); const vals = segs.map(exprQ); if (vals.some(x => !x)) { QB.push(where + ': 해석 못함 ' + m[0]); continue; } nQ++; if (vals.some(x => x.v !== vals[0].v || x.dim !== vals[0].dim)) QB.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (skip(where)) return; qcheck(s0.replace(/\*\*/g, ''), where); });
T('들이·무게 식 전수 틀림 0 (' + nQ + '개 — 덧셈·뺄셈·바꾸기 사슬)', () => ok(QB.length === 0, QB.slice(0, 6).join(' | ')));
T('단위 식 검산 넉넉히 ≥ 40', () => ok(nQ >= 40, 'nQ ' + nQ));
T('검산기 자체 확인 — 틀린 값 다섯 가지를 심으면 모두 잡는다 · 맞는 식은 통과', () => { const before = QB.length; ['1 L 300 mL + 2 L 500 mL = 3 L 700 mL', '3 kg 40 g = 3400 g', '1 t = 100 kg', '5 kg 800 g − 4 kg 100 g = 1 kg 600 g', '10 kg − 7 kg 700 g = 3 kg 300 g'].forEach((t, i) => qcheck(t, 'probe' + i)); ok(QB.length - before === 5, '잡은 수 ' + (QB.length - before)); QB.length = before;
  qcheck('1050 g = 1 kg 50 g · 50 L + 30 L + 10 L = 90 L · 10 kg − 7 kg 700 g = 9 kg 1000 g − 7 kg 700 g = 2 kg 300 g', 'probe-ok'); ok(QB.length === before, '오탐 ' + QB.slice(before).join(',')); QB.length = before; });

console.log('═══ G. 그림 ═══');
const nfmt = (v) => String(+(+v).toFixed(3));
KEYS.forEach(k => T(k + ' 개념 4장 fig 렌더 · 비커·저울 눈금 · tvert 결과 · tubs 합 · show 식', () => { L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(s.data.fig, s.id + ' fig 없음'); const h = FIG.render(s.data.fig); ok(h && h.length > 200, s.id + ' 빈 그림'); ok(!/NaN|undefined/.test(h), s.id + ' NaN/undefined');
  const walkF = (f) => { if (!f) return; if (f.k === 'panels') return f.items.forEach(p => { walkF(p.fig || p); if (p.label) qcheck(p.label, s.id + ' 캡션'); });
    if (f.k === 'beaker' || f.k === 'dial') { nCheck++; const hh = FIG.render(f); ok(hh.indexOf('data-max="' + f.max + '" data-step="' + f.step + '" data-v="' + nfmt(f.v) + '"') >= 0, s.id + ' ' + f.k + ' data'); ok(f.v >= 0 && f.v <= f.max, s.id + ' 눈금 밖'); ok(Math.abs(f.max / f.step - Math.round(f.max / f.step)) < 1e-9, s.id + ' 칸 수 정수 아님');
      const unit = f.unit || (f.k === 'beaker' ? 'mL' : 'g');
      if (f.show) { const before = QB.length; if (/=/.test(f.show)) { qcheck(f.show, s.id + ' show'); ok(QB.length === before, s.id + ' 그림 식 ' + f.show); } const q = qv(f.show.split('=')[0]); if (q) ok(q.v === f.v * UB[unit][1], s.id + ' 읽은 값 ' + f.show + ' ≠ ' + f.v + ' ' + unit); }
      else if (f.read !== false && !f.q) ok(hh.indexOf('>' + nfmt(f.v) + ' ' + unit + '<') >= 0, s.id + ' 읽은 값 글자'); }
    if (f.k === 'tvert') { nCheck++; const B = f.base || 60, sgn = f.op === '+' ? 1 : -1, av = f.a[0] * B + f.a[1], bv = f.b[0] * B + f.b[1], r = av + sgn * bv; ok(r >= 0, s.id + ' 음수'); ok(FIG.render(f).indexOf('data-r="' + Math.floor(r / B) + ',' + (r % B) + '"') >= 0, s.id + ' tvert 결과 ' + r); }
    if (f.k === 'tubs') { nCheck++; const sum = f.rows.reduce((a, r) => a + r.size * r.n, 0); ok(sum === f.total, s.id + ' tubs 합 ' + sum + ' ≠ ' + f.total); ok(h.indexOf('data-sum="' + sum + '" data-total="' + f.total + '"') >= 0, s.id + ' tubs data'); f.rows.forEach(r => ok(r.n <= 7, s.id + ' 통 7개 넘음')); }
    if (f.k === 'tilt') ok(['l', 'r', 'eq'].indexOf(f.down) >= 0, s.id + ' tilt down');
    if (f.k === 'eq') f.lines.forEach(t => qcheck(t, s.id + ' eq')); };
  walkF(s.data.fig); }); }));

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('기본 문제는 그림 없이 풀린다 — 「보고」·「비커에 담긴」·「저울이 가리키는」·「눈금 한 칸」·「그릇을 작은 컵」·「친구」 꼴 0', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(!/보고|비커에 담긴|저울이 가리키|눈금 한 칸|작은 컵으로 재|수조에 옮겨|친구는 누구|쌓기나무 몇 개만큼|바둑돌로 재었|두 그릇의 물을|가장 무거운 채소|들이가 많은 것부터/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question))));
T('한 차시 안에서 같은 문제 식 중복 0 (기본·수준별·응용)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = []; sl.filter(s => s.block === 'basic_problem').forEach(s => e.push(s.data.question)); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); e.push(sl[14].data.context + sl[14].data.challenge);
  const exprs = e.map(q => (String(q).match(new RegExp(QRE)) || [''])[0].replace(/\s/g, '')).filter(Boolean); const dup = exprs.filter((x, i) => exprs.indexOf(x) !== i && !/^\d+(L|kg|mL|g)$/.test(x)); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => { const out = []; (function walk(o, key) { if (key === 'tnote' || key === 'from' || key === 'img') return; if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') Object.keys(o).forEach(kk => walk(o[kk], kk)); })(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => s.data), ''); return out.join(' '); };
const figTxt = (k) => L[k].slides.filter(s => s.data.fig).map(s => FIG.render(s.data.fig)).join(' ');
const reVol = /\d\s*(?:mL|L)(?![A-Za-z])|리터/, reWt = /\d\s*(?:kg|g|t)(?![A-Za-z])|킬로그램|(?<![프])그램|톤/;
T('「L·mL·리터」는 l02 전 · 「kg·g·t·킬로그램·톤」은 l06 전 학생 화면·그림 0 · 도입 차시엔 실제로 나온다', () => { KEYS.forEach((k, i) => { const t = stud(k) + ' ' + figTxt(k).replace(/<[^>]+>/g, ' '), n = i + 1;
  if (n < 2) ok(!reVol.test(t), k + ' 들이 단위 선행 ' + (t.match(reVol) || [''])[0]); if (n < 6) { const mm = t.match(new RegExp('.{0,30}(?:' + reWt.source + ').{0,10}')); ok(!mm, k + ' 무게 단위 선행 ' + (mm || [''])[0]); } });
  ok(/1 L = 1000 mL/.test(stud('u5_l02')) && /1 kg = 1000 g/.test(stud('u5_l06')) && /1 t = 1000 kg/.test(stud('u5_l06')), '도입 차시엔 실제로 나온다'); });

console.log('\n게이트 g3s2 수학 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
