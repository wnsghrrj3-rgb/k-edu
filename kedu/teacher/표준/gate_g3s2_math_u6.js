/* gate_g3s2_math_u6.js — 3학년 2학기 수학 6단원 「그림그래프」 케이티처 2세대 게이트 (34차, 베프 — u5 게이트 복제 + 그림그래프 검산).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(u5_l10 → l01 → … → l07) · E 문제 정답(큰·작은 그림 N·M → 수 · 수를 a·1 그림으로 나눌 때 그림 몇 개 · 합계·나머지·차)
   F 산수 전수(× + − 식) · 그림 식(「N명 = 10명 그림 a개 + 1명 그림 b개」·「a명 + b명 = c명」) 전수
   G 그림(pgraph data-vals = rows v · 잘못 그린 줄은 정말 틀림 · ptable 합계 · ograph · area2 · 캡션 합)
   H 재료 충실(자기주도 원문 계승 · 자료가 필요한 기본 문제는 상황 칸에 수) — 선행 용어 L 은 없음(l01 제목부터 그림그래프)
   I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_math_u6.js */
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
const L = load(path.join(TDIR, 'data/g3s2_math_u6.js'));
const U5 = load(path.join(TDIR, 'data/g3s2_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u6.json'), 'utf8'));
const KEYS = Array.from({ length: 7 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

// 2세대 무대 부팅(jsdom)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '그림그래프', classNames: [] });

console.log('═══ A. 로드 ═══');
T('7차시 키 u6_l01~l07', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit_title 그림그래프 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 6 && m.unit_title === '그림그래프' && m.std === '[4수04-01]' && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex10 = U5.u5_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u5_l10') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex10;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u5_l10'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
// 그림그래프 수 읽기 — 큰·작은 그림 단위(N·M), 그림 개수(a·b), 나눌 수, 합계
const UN = '(?:명|회|건|송이|개|마리)';
const split = (v, us) => { let r = v; return us.map(u => { const n = Math.floor(r / u); r -= n * u; return n; }); };
const unitsOf = (t) => { let m;
  if ((m = t.match(new RegExp('((?:\\d+' + UN + '\\s*(?:그림)?\\s*(?:과|와|·|,)\\s*)+\\d+' + UN + ')\\s*그림')))) return [...m[1].matchAll(/(\d+)/g)].map(x => +x[1]);
  const b = t.match(new RegExp('큰 그림(?:이|은|는)?\\s*(?:\\S+\\s*는\\s*)?(\\d+)' + UN + '(?=,|이에요|예요|\\s*·|로|일 때|이고)')), s = t.match(new RegExp('작은 그림(?:이|은|는)?\\s*(\\d+)' + UN + '(?=,|이에요|예요|\\s*·|로|일 때|이고|\\s)'));
  return b ? (s ? [+b[1], +s[1]] : [+b[1]]) : null; };
const leadP = (q, sc) => { const t = (String(q) + ' ' + String(sc || '')).replace(/\*\*/g, ''); let m;
  // D 두 그림그래프의 그림 수 차이
  if ((m = t.match(new RegExp('(\\d+)' + UN + '을\\s*([\\d\\S·\\s]+?)\\s*그림으로 나타낼 때와\\s*([\\d\\S·\\s]+?)\\s*그림으로 나타낼 때 그림 수의 차이')))) { const a = [...m[2].matchAll(/(\d+)/g)].map(x => +x[1]), b = [...m[3].matchAll(/(\d+)/g)].map(x => +x[1]); const s1 = split(+m[1], a).reduce((x, y) => x + y, 0), s2 = split(+m[1], b).reduce((x, y) => x + y, 0); return Math.abs(s1 - s2); }
  const us = unitsOf(t);
  // A 그림 개수 → 수
  if (us && !/몇 개/.test(q)) { let a = null, b = 0;
    if ((m = t.match(/큰 그림 (\d+)개(?:와|과|,)\s*작은 그림 (\d+)개(?=는|면|\)|예요)/))) { a = +m[1]; b = +m[2]; } else if ((m = t.match(/큰 그림 (\d+)개예요/))) a = +m[1];
    if (a != null) { let v = a * us[0] + b * (us[1] || 0); if ((m = t.match(new RegExp('\\)과 [가-힣]+ (\\d+)' + UN + '를 합하면')))) v += +m[1]; return v; } }
  // B 수 → 그림 몇 개
  if (us && /몇 개/.test(q)) { const tg = [...String(q).matchAll(new RegExp('(\\d+)' + UN + '(?:을|를)\\s*(?:그림그래프로\\s*)?나타낼', 'g'))].pop(); if (!tg) return null; const c = split(+tg[1], us);
    if (/그림은 모두 몇 개/.test(q)) return c.reduce((x, y) => x + y, 0);
    if ((m = String(q).match(new RegExp('(\\d+)' + UN + ' 그림은 몇 개')))) { const i = us.indexOf(+m[1]); return i < 0 ? null : c[i]; }
    if (/큰 그림은 몇 개/.test(q)) return c[0]; if (/작은 그림은 몇 개/.test(q)) return c[c.length - 1]; return null; }
  // C 합계·나머지·차
  if ((m = t.match(/합이 (\d+)이고 표의 합계가 (\d+)/))) return m[2] - m[1];
  const nums = [...t.matchAll(new RegExp('(\\d+)' + UN, 'g'))].map(x => +x[1]);
  if (/몇 명 더 많|두 번 셌/.test(q) && nums.length === 2) return Math.abs(nums[0] - nums[1]);
  if ((m = t.match(new RegExp('합계(?:가|는)?\\s*(\\d+)' + UN)))) { const T0 = +m[1]; const rest = nums.slice(); rest.splice(rest.indexOf(T0), 1); if (/몇/.test(q) && !/합계는 몇/.test(q)) return T0 - rest.reduce((x, y) => x + y, 0); }
  if (/합계는 몇|모두 몇|합하면 몇/.test(q) && nums.length >= 2) return nums.reduce((x, y) => x + y, 0);
  return null; };
const nsp = (s) => String(s).replace(/\s+/g, '');
const same = (a, v) => typeof v === 'number' ? parseInt(String(a).replace(/[^\d]/g, ''), 10) === v : nsp(a) === nsp(v);
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, sc = d.scenario && d.scenario.body;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const v = leadP(d.question, sc); if (v != null) { nCheck++; ok(same(d.options.find(o => o.correct).text, v), s.id + ' ' + d.question + ' → ' + v); } }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = leadP(d.question, sc); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadP(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + v + ' ≠ ' + lv[t].a); } ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadP(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + v + ' ≠ ' + it.a); } }); }));
T('다시 계산한 정답 수 ≥ 35', () => ok(nCheck >= 35, 'nCheck ' + nCheck));
T('재계산기 자체 확인 — 그림 → 수 · 수 → 그림 · 합계·나머지 · 두 그래프 차이', () => {
  ok(leadP('큰 그림이 10명, 작은 그림이 1명이에요. 큰 그림 4개와 작은 그림 2개는 몇 명일까요?') === 42 && leadP('지유는 몇 회 했나요?', '큰 그림은 5회, 작은 그림은 1회 · 지유는 큰 그림 2개와 작은 그림 2개예요.') === 12 && leadP('자전거 타기는 몇 명인지 구하세요.', '큰 그림 🙂 는 10명 · 자전거 타기는 큰 그림 2개예요.') === 20, '그림 → 수');
  ok(leadP('100명 · 10명 · 1명 그림으로 145명을 나타낼 때 10명 그림은 몇 개인가요?') === 4 && leadP('큰 그림 5회, 작은 그림 1회로 건우 11회를 나타낼 때 작은 그림은 몇 개일까요?') === 1 && leadP('100명 · 10명 · 1명 그림으로 불고기 112명을 나타낼 때 그림은 모두 몇 개일까요?') === 4, '수 → 그림');
  ok(leadP('합계 40명 가운데 강아지 15명, 고양이 12명이면 나머지 햄스터는 몇 명인가요?') === 13 && leadP('봄 7명, 여름 8명, 가을 6명, 겨울 4명이면 합계는 몇 명인가요?') === 25, '합계·나머지');
  ok(leadP('봄 377건을 10건·1건 그림으로 나타낼 때와 100건·10건·1건 그림으로 나타낼 때 그림 수의 차이는 몇 개일까요?') === 27, '두 그래프 차이'); });

console.log('═══ F. 산수·그림 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
allStr.forEach(([s0, where]) => { if (skip(where)) return; const s = s0.replace(/\*\*/g, ''); const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×+−])/g; let m;
  while ((m = re.exec(s))) { const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } });
T('수 식 전수 재계산 (× + − ' + nEq + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
const GB = []; let nG = 0;
const gcheck = (s, where) => { let m; const r1 = new RegExp('(\\d+)(' + UN + ')\\s*=\\s*((?:\\d+' + UN + ' 그림 \\d+개\\s*\\+?\\s*)+)', 'g');
  while ((m = r1.exec(s))) { nG++; const v = [...m[3].matchAll(new RegExp('(\\d+)' + UN + ' 그림 (\\d+)개', 'g'))].reduce((a, x) => a + x[1] * x[2], 0); if (v !== +m[1]) GB.push(where + ': ' + m[0]); }
  const r2 = new RegExp('(\\d+)' + UN + '((?:\\s*\\+\\s*\\d+' + UN + ')+)\\s*=\\s*(\\d+)' + UN, 'g');
  while ((m = r2.exec(s))) { nG++; const v = +m[1] + [...m[2].matchAll(/(\d+)/g)].reduce((a, x) => a + +x[1], 0); if (v !== +m[3]) GB.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) gcheck(s0.replace(/\*\*/g, ''), where); });
T('그림 식 전수 틀림 0 (' + nG + '개 — 「N = 큰 그림 a개 + 작은 그림 b개」·「a명 + b명 = c명」)', () => ok(GB.length === 0, GB.slice(0, 6).join(' | ')));
T('그림 식 검산 ≥ 3 · 검산기 자체 확인(틀린 식 셋 잡음 · 맞는 식 통과)', () => { ok(nG >= 3, 'nG ' + nG); const b0 = GB.length; ['당근 18명 = 10명 그림 1개 + 1명 그림 7개', '장미 23송이 = 5송이 그림 3개 + 1송이 그림 3개', '축구 = 10명 + 1명 = 12명'].forEach((t, i) => gcheck(t, 'probe' + i)); ok(GB.length - b0 === 3, '잡은 수 ' + (GB.length - b0)); GB.length = b0; gcheck('콩나물 35명 = 10명 그림 3개 + 1명 그림 5개 · 10명 + 1명 = 11명', 'ok'); ok(GB.length === b0, '오탐'); GB.length = b0; });

console.log('═══ G. 그림 ═══');
const pgv = (r, us) => (r.c || split(+r.v, us)).reduce((a, n, i) => a + n * us[i], 0);
KEYS.forEach(k => T(k + ' 개념 4장 fig 렌더 · 그림그래프 data = 자료 · 표 합계 · 캡션 합', () => { L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(s.data.fig, s.id + ' fig 없음'); const h = FIG.render(s.data.fig); ok(h && h.length > 200, s.id + ' 빈 그림'); ok(!/NaN|undefined/.test(h), s.id + ' NaN/undefined');
  const walkF = (f, cap) => { if (!f) return; if (f.k === 'panels') return f.items.forEach(p => walkF(p.fig || p, p.label));
    const hh = FIG.render(f); if (f.label) gcheck(f.label, s.id + ' 캡션'); if (cap) gcheck(cap, s.id + ' 칸 캡션');
    if (f.k === 'pgraph') { nCheck++; const us = (f.units || [10, 1]).map(Number); ok(us[us.length - 1] === 1, s.id + ' 가장 작은 그림이 1 아님'); ok(us.every((u, i) => !i || us[i - 1] > u), s.id + ' 단위 순서');
      const want = f.rows.map(r => r.blank ? '' : pgv(r, us)); ok(hh.indexOf('data-vals="' + want.join(',') + '" data-units="' + us.join(',') + '"') >= 0, s.id + ' pgraph data');
      f.rows.forEach(r => { if (r.bad) ok(r.c && pgv(r, us) !== +r.v, s.id + ' ' + r.name + ' 잘못 그린 줄이 맞게 그려짐'); else if (!r.blank) ok(pgv(r, us) === +r.v, s.id + ' ' + r.name + ' 그림 ≠ ' + r.v); if (r.c) ok(r.c.length === us.length, s.id + ' c 길이'); });
      const sumDrawn = f.rows.filter(r => !r.blank).reduce((a, r) => a + pgv(r, us), 0); const cm = String(cap || '').match(/그림의 합 (\d+)/); if (cm) ok(+cm[1] === sumDrawn, s.id + ' 그림의 합 ' + cm[1] + ' ≠ ' + sumDrawn);
      if (f.hi != null && f.label && /가장 많은/.test(f.label)) { const his = [].concat(f.hi); const mx = Math.max.apply(null, f.rows.map(r => +r.v)); ok(f.rows.some(r => his.indexOf(r.name) >= 0 && +r.v === mx), s.id + ' 가장 많은 항목 표시'); }
      if (f.hi != null && f.label && /가장 적은/.test(f.label)) { const his = [].concat(f.hi); const mn = Math.min.apply(null, f.rows.map(r => +r.v)); ok(f.rows.some(r => his.indexOf(r.name) >= 0 && +r.v === mn), s.id + ' 가장 적은 항목 표시'); }
      const cn = String(f.label || '').match(/큰 그림이 가장 많은 (\S+)/); if (cn) { const bigs = f.rows.map(r => split(+r.v, us)[0]); const mx = Math.max.apply(null, bigs); ok(bigs[f.rows.findIndex(r => r.name === cn[1])] === mx, s.id + ' 큰 그림 최다'); } }
    if (f.k === 'ptable') { nCheck++; const sum = f.items.reduce((a, r) => a + (+r.v || 0), 0); if (typeof f.total === 'number') ok(f.total === sum, s.id + ' 주어진 합계 ' + f.total + ' ≠ ' + sum); ok(hh.indexOf('data-sum="' + sum + '"') >= 0, s.id + ' ptable data-sum');
      const cm = String(cap || '').match(/합계 (\d+)/); if (cm) ok(+cm[1] === sum, s.id + ' 캡션 합계 ' + cm[1] + ' ≠ ' + sum); }
    if (f.k === 'ograph') { nCheck++; ok(hh.indexOf('data-vals="' + f.items.map(r => r.v).join(',') + '"') >= 0, s.id + ' ograph data'); ok((hh.match(/og-c on/g) || []).length === f.items.reduce((a, r) => a + r.v, 0), s.id + ' ◯ 개수'); }
    if (f.k === 'area2') { const kk = +f.k2 || 2; ok(hh.indexOf('data-k="' + kk + '" data-area="' + kk * kk + '"') >= 0, s.id + ' area2'); }
    if (f.k === 'eq') f.lines.forEach(t => gcheck(t, s.id + ' eq')); };
  walkF(s.data.fig); }); }));
T('그림그래프가 단원에 넉넉히 — pgraph 차시 5개↑', () => ok(KEYS.filter(k => L[k].slides.some(s => /"k":"pgraph"/.test(JSON.stringify(s.data.fig || {})))).length >= 5));

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('자료가 필요한 기본 문제(「보고」·「~에서」·「~표예요」·「~수예요」)는 상황 칸에 수가 있다', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const q = s.data.question; if (/보고|그림그래프에서|표예요|수예요|횟수예요/.test(q)) ok(s.data.scenario && /\d/.test(s.data.scenario.body), k + ' ' + s.id + ' ' + q); })));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); const n = e.map(norm); const dup = n.filter((x, i) => n.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('\n게이트 g3s2 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
