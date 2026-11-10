/* gate_g2s2_math_u4.js — 2학년 2학기 수학 4단원 「시각과 시간」 케이티처 2세대 게이트 (143차, 베프). u3 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u3_l09 → u4_l01 → … → l10)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(이름꼴 물음은 생성기 QOVR) · 두 칸 답(two) = 원문 a + labels · 개념 글 줄 · 정리·예고·스스로 점검 줄 = 원문 · 정리 화살표 = 원문 목표(있을 때)
   E 재계산 — 출구·수준별·기본 문제 물음을 게이트가 다시 셈: 「몇 시 몇 분 전」 ↔ 「몇 시 몇 분」 · 긴바늘 숫자 → 분 · 작은 눈금 칸 · 시간 ↔ 분 · 「~부터 ~까지」 걸린 시간
     · 일 → 시간 · 주일 → 일 · 년 → 개월 · 오전/오후 몇 시간 뒤 · 며칠 후 · 년·개월·주 후 날짜 · 바퀴 → 시간 · 시간 띠 칸 → 분
     + 풀이 steps 안 등식(수 식 · 단위 붙은 양 「1시간 = 60분」) 다시 셈 + 수 뒤 조사
   F 그림 — clk1 = 원문 시계(바늘 각도 = 시·분에서 다시 셈 · 시계 글 「H시 M분」·「H시 M분 전」 = 바늘 시각 · 문제 그림 글에 답 없음)
         · dclk2 = 원문 디지털시계 · tbnd2 켠 칸 = from 부터 to 까지 이어진 칸(칸 수 × step = 걸린 분) · kcal2 1일 요일·날수 = 실제 달력
         · grow2 문제 그림 = 원문 카드 가운데 이어진 두 장(묻는 화살표 하나) · d24 칸이 0~24시를 빈틈없이 · upr2 짝 = 단위 사이 참 · grow2 「몇 ○ 후」 = 두 날짜 차 · ngrid 시간표·달 날수 = 원문(날수 = 실제)
         · 개념 장 CFIG(원문 장에 그림 없는 곳) = 같은 단원 원문 그림 · 빈칸 답(기본 문제) = 그림에서 다시 낸 값
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u4.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u4.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u4.json'), 'utf8'));
const FIX = (s) => s.replace(/해결해 볼까요/g, '풀어 볼까요').replace(/해결해요/g, '풀어요').replace(/해결할 수/g, '풀 수').replace(/해결했어요/g, '풀었어요');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC);
const QOVR = {
  '시각을 써 보세요': '몇 시 몇 분일까요?', '9시 5분 전은?': '9시 5분 전은 몇 시 몇 분일까요?',
  '긴바늘이 한 바퀴 도는 시간': '긴바늘이 한 바퀴 도는 시간은 몇 분일까요?', '공연을 본 시간': '공연을 본 시간은 몇 분일까요?',
  '등산하는 데 걸린 시간': '등산하는 데 걸린 시간은 몇 분일까요?', '서울에서 부산까지 걸린 시간': '서울에서 부산까지 걸린 시간은 몇 분일까요?',
  '11월에 음악 줄넘기를 하는 날은 모두 며칠?': '11월에 음악 줄넘기를 하는 날은 모두 며칠일까요?', '11월 둘째 토요일은 며칠?': '11월 둘째 토요일은 며칠일까요?',
  '세발자전거에서 줄넘기까지': '세발자전거를 탄 날에서 줄넘기를 성공한 날까지는 몇 년 후일까요?', '줄넘기에서 두발자전거까지': '줄넘기를 성공한 날에서 두발자전거를 탄 날까지는 몇 개월 후일까요?',
  '두발자전거에서 수영까지': '두발자전거를 탄 날에서 혼자서 수영한 날까지는 몇 주 후일까요?'
};
const N = 10, KEYS = Array.from({ length: N }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 시각·시간 셈 ── */
const fmtDur = (m) => (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + (m % 60) + '분' : '') : m + '분');
const h12 = (h) => ((h - 1 + 12) % 12) + 1;
function tod(s) { s = s.trim(); const m = s.match(/^(?:(오전|오후) )?(\d+)시(?: (\d+)분)?$/); if (!m) return null; let h = +m[2]; if (m[1] === '오후' && h < 12) h += 12; if (m[1] === '오전' && h === 12) h = 0; return h * 60 + (m[3] ? +m[3] : 0); }
function durOf(s) { s = String(s).trim(); const m = s.match(/^(?:(\d+)시간)?(?: ?(\d+)분)?$/); if (!m || (!m[1] && !m[2])) return null; return (m[1] ? +m[1] * 60 : 0) + (m[2] ? +m[2] : 0); }
const MDAYS = (y, m) => new Date(y, m, 0).getDate();
function addDate(y, m, d, n, u) { if (u === '년') return [y + n, m, d]; if (u === '개월') { const t = m - 1 + n; return [y + Math.floor(t / 12), (t % 12) + 1, d]; } const dt = new Date(y, m - 1, d + (u === '주' ? 7 * n : n)); return [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()]; }
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^(\d+)시 (\d+)분은 몇 시 몇 분 전일까요\?$/))) { ok(+m[2] > 0 && +m[2] < 60, q); return h12(+m[1] + 1) + '시 ' + (60 - +m[2]) + '분 전'; }
  if ((m = q.match(/^(\d+)시 (\d+)분 전은 몇 시 몇 분일까요\?$/))) return h12(+m[1] - 1) + '시 ' + (60 - +m[2]) + '분';
  if ((m = q.match(/^긴바늘이 (\d+)[을를] 가리키면 몇 분일까요\?$/))) { ok(+m[1] >= 1 && +m[1] <= 11, q); return +m[1] * 5 + '분'; }
  if ((m = q.match(/^긴바늘이 숫자 (\d+)에서 작은 눈금 (\d+)칸 더 간 곳은 몇 분일까요\?$/))) { ok(+m[2] >= 1 && +m[2] <= 4, q); return +m[1] * 5 + +m[2] + '분'; }
  if ((m = q.match(/^(\d+)분은 몇 시간( 몇 분)?일까요\?$/))) { const v = +m[1]; if (!m[2]) ok(v % 60 === 0, q); else ok(v % 60, q); return fmtDur(v); }
  if ((m = q.match(/^(.+?)[은는] 몇 분일까요\?$/)) && durOf(m[1]) != null && /시간/.test(m[1])) return durOf(m[1]) + '분';
  if ((m = q.match(/^(.+?)부터 (.+?)까지는 몇 (분|시간|시간 몇 분)일까요\?$/)) && tod(m[1]) != null && tod(m[2]) != null) { const d = tod(m[2]) - tod(m[1]); ok(d > 0, q);
    if (m[3] === '분') return d + '분'; if (m[3] === '시간') { ok(d % 60 === 0, q); return d / 60 + '시간'; } ok(d >= 60 && d % 60, q); return fmtDur(d); }
  if ((m = q.match(/^(\d+)일은 몇 시간일까요\?$/))) return +m[1] * 24 + '시간';
  if (/^하루는 몇 시간일까요\?$/.test(q)) return '24시간';
  if ((m = q.match(/^(\d+)주일은 며칠일까요\?$/))) return +m[1] * 7 + '일';
  if ((m = q.match(/^(\d+)년은 몇 개월일까요\?$/))) return +m[1] * 12 + '개월';
  if ((m = q.match(/^(오전|오후) (\d+)시에서 (\d+)시간 뒤는 몇 시일까요\?$/))) { const t = (tod(m[1] + ' ' + m[2] + '시') / 60 + +m[3]) % 24; ok(t !== 0 && t !== 12, '낮·밤 12시 ' + q); return (t < 12 ? '오전 ' : '오후 ') + h12(t) + '시'; }
  if ((m = q.match(/^(\d+)월 (\d+)일에서 (\d+)일 후는 며칠일까요\?$/))) { const r = addDate(2026, +m[1], +m[2], +m[3], '일'); return r[1] + '월 ' + r[2] + '일'; }
  if ((m = q.match(/^긴바늘이 (\d+)바퀴 돌면 몇 시간일까요\?$/))) return m[1] + '시간';
  if ((m = q.match(/^시간 띠 한 칸이 (\d+)분이면 (\d+)칸은 몇 분일까요\?$/))) return +m[1] * +m[2] + '분';
  if ((m = q.match(/^(\d+)년 (\d+)월 (\d+)일에서 (\d+)(년|개월|주) 후는 언제일까요\?$/))) { const r = addDate(+m[1], +m[2], +m[3], +m[4], m[5]); return r[0] + '년 ' + r[1] + '월 ' + r[2] + '일'; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
/* 풀이 등식 — 수 식이거나 단위 붙은 양(시간·분·일·주(일)·개월·년)이면 양쪽이 같아야 */
const UB = { 분: ['t', 1], 시간: ['t', 60], 일: ['t', 1440], 주일: ['t', 10080], 주: ['t', 10080], 개월: ['o', 1], 년: ['o', 12] };
function numExpr(e) { e = String(e).replace(/\s+/g, ''); if (!/^\d+([×+−]\d+)*$/.test(e)) return null; return e.split(/(?=[+−])/).reduce((acc, t) => { const sg = t[0] === '−' ? -1 : 1; return acc + sg * t.replace(/^[+−]/, '').split('×').reduce((a, b) => a * +b, 1); }, 0); }
function qty(t) { t = t.trim(); if (!/^(\d+(분|시간|일|주일|주|개월|년) ?)+$/.test(t)) return null; let dim = null, v = 0; for (const m of t.matchAll(/(\d+)(주일|시간|개월|분|일|주|년)/g)) { const [d, b] = UB[m[2]]; if (dim && dim !== d) return null; dim = d; v += +m[1] * b; } return { k: dim, v }; }
function sideVal(s) { s = s.trim(); const n = numExpr(s); if (n != null) return { k: 'n', v: n }; const terms = s.split(/ (?=[+−] )/); let k = null, v = 0;
  for (let i = 0; i < terms.length; i++) { let t = terms[i], sg = 1; if (i) { sg = t[0] === '−' ? -1 : 1; t = t.slice(2); } const q = qty(t); if (!q || (k && k !== q.k)) return null; k = q.k; v += sg * q.v; } return { k, v }; }
function stepEq(s) { let n = 0; String(s).split(' | ').forEach(st => { const sides = st.split(' = '); if (sides.length < 2) return; const v = sides.map(sideVal); if (v.some(x => !x)) return;
  ok(v.every(x => x.k === v[0].k && x.v === v[0].v), '풀이 식 ' + st); n++; }); return n; }
/* 조사 — 수 뒤 */
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

/* ── 그림 ── */
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const strip = (o) => JSON.parse(JSON.stringify(o));
const TRUE_PAIR = { '1시간': ['t', 60], '60분': ['t', 60], '1일': ['t', 1440], '24시간': ['t', 1440], '1주일': ['t', 10080], '7일': ['t', 10080], '1년': ['o', 12], '12개월': ['o', 12] };
const ymd = (s) => { const m = String(s).match(/^(\d+)년 (\d+)월 (\d+)일$/); return m ? [+m[1], +m[2], +m[3]] : null; };
function legDiff(a, b, u) { if (u === '년') { if (a[1] !== b[1] || a[2] !== b[2]) return null; return b[0] - a[0]; } if (u === '개월') { if (a[2] !== b[2]) return null; return (b[0] - a[0]) * 12 + b[1] - a[1]; }
  const dd = (new Date(b[0], b[1] - 1, b[2]) - new Date(a[0], a[1] - 1, a[2])) / 864e5; return dd % 7 ? null : dd / 7; }
/* 그림 하나 점검 — 문제 그림이면 그림에서 다시 낸 값(있으면)을 돌려준다 */
function figCheck(f, srcFigs, at, prob, txt) {
  if (f.k === 'clk1') { const sf = srcFigs.find(x => x.k === 'clock' && x.h === f.h && x.m === f.m && (x.hands || 'hm') === f.hands && (x.tag || undefined) === f.tag && (x.hl || undefined) === f.hl); ok(sf, at + ' 원문 시계 ' + f.h + ':' + f.m);
    const sv = htmlOf(f).querySelector('svg.fig-clk1, .fig-clk1 svg, svg[data-hd]'); ok(sv, at + ' 렌더');
    ok(Math.abs(+sv.getAttribute('data-hd') - ((f.h % 12) * 30 + f.m * 0.5)) < 0.05 && Math.abs(+sv.getAttribute('data-md') - f.m * 6) < 0.05, at + ' 바늘 각도');
    ok(f.h >= 1 && f.h <= 12 && f.m >= 0 && f.m < 60, at + ' 시각 범위');
    if (f.tag) { const t = f.tag.replace(/^(도착|낮|어제|오늘|오전|오후) ?/g, ''); let m;
      if ((m = t.match(/(\d+)시 (\d+)분 전/))) ok(h12(+m[1] - 1) === f.h && 60 - +m[2] === f.m, at + ' 시계 글 ' + f.tag);
      else if ((m = t.match(/(?:^|[^\d])(\d+)시 (\d+)분/) || t.match(/^(\d+)시 (\d+)분/))) ok(+m[1] === f.h && +m[2] === f.m, at + ' 시계 글 ' + f.tag);
      else if ((m = t.match(/(?:오전|오후|낮)? ?(\d+)시$/))) ok(+m[1] === f.h && f.m === 0, at + ' 시계 글 ' + f.tag);
      if (prob) ok(!/\d+시 \d+분/.test(f.tag), at + ' 문제 시계 글에 답'); }
    if (!prob || f.hands !== 'hm') return [];
    if (/몇 시 몇 분 전일까요/.test(txt)) return f.m ? [{ s: h12(f.h + 1) + '시 ' + (60 - f.m) + '분 전' }] : [];
    if (/(\d+)시 몇 분 전일까요/.test(txt)) { const H = +txt.match(/(\d+)시 몇 분 전일까요/)[1]; ok(H === h12(f.h + 1), at + ' 곧 될 정각'); return [{ n: 60 - f.m }]; }
    if (/몇 시 몇 분일까요/.test(txt)) return [{ s: f.h + '시 ' + f.m + '분' }];
    if (/몇 시일까요/.test(txt)) { ok(f.m === 0, at + ' 정각 아님'); return [{ n: f.h }]; }
    return []; }
  if (f.k === 'dclk2') { ok(srcFigs.some(x => x.k === 'dclock' && x.h === f.h && x.m === f.m && (x.pre || undefined) === f.pre), at + ' 원문 디지털시계'); ok(htmlOf(f).querySelector('svg[data-t="' + (f.pre ? f.pre + ' ' : '') + f.h + ':' + String(f.m).padStart(2, '0') + '"]'), at + ' 렌더'); return []; }
  if (f.k === 'tbnd2') { ok(srcFigs.some(x => x.k === 'tband' && same(strip({ title: x.title, from: x.from, to: x.to, h0: x.h0, h1: x.h1, step: x.step, on: x.on }), strip({ title: f.title, from: f.from, to: f.to, h0: f.h0, h1: f.h1, step: f.step, on: f.on }))), at + ' 원문 시간 띠');
    const a = f.from[0] * 60 + f.from[1], b = f.to[0] * 60 + f.to[1], want = []; for (let t = a; t < b; t += f.step) want.push(t);
    ok(same(f.on, want), at + ' 켠 칸 ≠ ' + f.from.join(':') + '~' + f.to.join(':')); ok(f.h0 * 60 <= a && b <= f.h1 * 60, at + ' 띠 범위');
    ok(htmlOf(f).querySelectorAll('.o-tb.on').length === f.on.length, at + ' 렌더 켠 칸');
    return prob && /몇 분/.test(txt) ? [{ n: f.on.length * f.step }] : []; }
  if (f.k === 'kcal2') { ok(srcFigs.some(x => x.k === 'kcal' && x.y === f.y && x.m === f.m && x.first === f.first && x.days === f.days && x.upto === f.upto && same(x.ring || [], f.ring) && same(x.marks || null, f.marks || null)), at + ' 원문 달력');
    ok(new Date(f.y, f.m - 1, 1).getDay() === f.first, at + ' 1일 요일 ' + f.y + '.' + f.m); ok(MDAYS(f.y, f.m) === f.days, at + ' 날수'); ok(f.upto <= f.days, at + ' upto');
    Object.keys(f.marks || {}).forEach(d => ok(+d >= 1 && +d <= f.upto, at + ' 표시 날 ' + d)); ok(htmlOf(f).querySelector('svg[data-cal]'), at + ' 렌더');
    if (!prob) return []; let m;
    if (/모두 며칠/.test(txt) && f.marks) { const em = Object.values(f.marks); ok(em.every(e => e === em[0]), at + ' 표시 하나로'); return [{ n: em.length }]; }
    if ((m = txt.match(/(첫째|둘째|셋째|넷째) (일|월|화|수|목|금|토)요일은 며칠/))) { const k = ['첫째', '둘째', '셋째', '넷째'].indexOf(m[1]), wd = '일월화수목금토'.indexOf(m[2]); const d1 = ((wd - f.first + 7) % 7) + 1; return [{ n: d1 + 7 * k }]; }
    return []; }
  if (f.k === 'd24') { ok(srcFigs.some(x => x.k === 'day24' && same(x.segs, f.segs) && same(x.cols, f.cols) && same(x.legs, f.legs)), at + ' 원문 하루 띠');
    ok(f.segs[0][0] === 0 && f.segs[f.segs.length - 1][1] === 24 && f.segs.every((g, i) => g[1] > g[0] && (!i || g[0] === f.segs[i - 1][1])), at + ' 0~24시 빈틈');
    ok(f.cols.length === f.segs.length && f.cols.every(c => f.legs.some(g => g.col === c)), at + ' 칸 색 = 범례'); ok(htmlOf(f).querySelector('svg[data-d24]'), at + ' 렌더'); return []; }
  if (f.k === 'upr2') { ok(srcFigs.some(x => x.k === 'upair' && f.items.every(it => x.items.some(y => same(y, it)))), at + ' 원문 짝 카드');
    f.items.forEach(it => { const a = TRUE_PAIR[it[0]], b = TRUE_PAIR[it[1]]; ok(a && b && a[0] === b[0] && a[1] === b[1], at + ' 짝 ' + it.join('=')); }); ok(htmlOf(f).querySelector('svg[data-pairs]'), at + ' 렌더'); return []; }
  if (f.k === 'grow2') { ok(srcFigs.some(x => x.k === 'grow' && x.nodes.some((_, i) => same(x.nodes.slice(i, i + f.nodes.length), f.nodes) && same(x.legs.slice(i, i + f.legs.length), f.legs))), at + ' 원문 성장 카드'); ok(f.legs.length === f.nodes.length - 1, at + ' 화살표 수'); const want = [];
    f.legs.forEach((g, i) => { const a = ymd(f.nodes[i].date), b = ymd(f.nodes[i + 1].date); ok(a && b, at + ' 날짜 꼴'); const dv = legDiff(a, b, g.u); ok(dv != null && dv > 0, at + ' ' + g.u + ' 차 ' + f.nodes[i].date + '→' + f.nodes[i + 1].date); if (g.n === '?') want.push({ u: g.u, n: dv }); else ok(+g.n === dv, at + ' ' + g.n + g.u + ' ≠ ' + dv); });
    ok(htmlOf(f).querySelector('svg[data-grow]'), at + ' 렌더');
    if (!prob) return []; const u = (txt.match(/몇 (년|개월|주) 후/) || [])[1]; const hit = want.filter(x => x.u === u); return hit.length === 1 ? [{ n: hit[0].n }] : []; }
  if (f.k === 'ngrid') { const rows = f.rows.map(r => r.map(c => (c && typeof c === 'object' ? (c.q ? '?' : c.v) : c)));
    const plan = srcFigs.find(x => x.k === 'plan' && same(x.rows, rows));
    if (plan) { rows.slice(1).forEach(r => { const m = String(r[0]).match(/^(\d+):(\d+)~(\d+):(\d+)$/); ok(m && +m[3] * 60 + +m[4] > +m[1] * 60 + +m[2], at + ' 시간표 ' + r[0]); }); return []; }
    const md = srcFigs.find(x => x.k === 'mdays' && same([['달'].concat([1, 2, 3, 4, 5, 6].map(i => i + '월')), ['날수'].concat([0, 1, 2, 3, 4, 5].map(i => (x.hide.indexOf(i + 1) >= 0 ? '?' : x.days[i]))), ['달'].concat([7, 8, 9, 10, 11, 12].map(i => i + '월')), ['날수'].concat([6, 7, 8, 9, 10, 11].map(i => (x.hide.indexOf(i + 1) >= 0 ? '?' : x.days[i])))], rows));
    ok(md, at + ' 원문 표'); md.days.forEach((d, i) => ok(d === MDAYS(2026, i + 1), at + ' ' + (i + 1) + '월 날수 ' + d)); return []; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && same(x.items, f.items)), at + ' 원문 물건 카드'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
function ansCheck(want, d, at) {
  if (!want.length || d.options) return 0; ok(want.length === 1, at + ' 그림 답 여럿');
  const w0 = want[0];
  if (w0.n != null) { ok(d.input && +d.answer === w0.n, at + ' 답 ' + d.answer + ' ≠ ' + w0.n); return 1; }
  ok(nsp(d.answer) === nsp(w0.s), at + ' 답 「' + d.answer + '」 ≠ ' + w0.s); return 1;
}

/* 기본 문제 ↔ 원문 문제 — 물음(QOVR 거친)과 답이 같은 것 */
const srcProb = (src, d) => src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : p.part === 'two' ? d.answer === p.a[0] + p.labels[0] + ' ' + p.a[1] + p.labels[1] : String(d.answer) === String(p.a)));
T('A 로드 10차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === N); });
const unitFigs = Object.values(SRC).flatMap(s => s.slides.flatMap(x => x.figs || []).concat(s.problems.flatMap(p => p.figs || [])));
let holeChecked = 0, eChecked = 0, stepChecked = 0, basicSolved = 0, cfigN = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 4 && les.meta.n === i + 1 && les.meta.unit_title === '시각과 시간'); ok(/^\[2수03-08\] .* · \[2수03-09\] .* · \[2수03-10\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u3_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u3_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data;
    const p = srcProb(src, d); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question);
    if (p.part === 'two') { ok(d.input === undefined, '두 칸 답에 input'); ok(/몇|얼마/.test(d.question), '두 칸 물음에 「몇/얼마」 없음 ' + d.question); }
    else if (!d.options) { ok(d.unit === (p.unit || undefined), '단위 ' + d.unit); ok(/몇|얼마|며칠/.test(d.question), '수 답 물음에 「몇/얼마/며칠」 없음 ' + d.question); }
    ok(['pad', 'mcq', 'two'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => { ok(titles.includes(nsp(s.data.title)), '원문에 없는 장 제목 ' + s.data.title); s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); }); }); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < N - 1) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/표와 그래프/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); n += c; }); Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); n += c; stepChecked += stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); eChecked += n; });
  T(k + ' E 기본 문제 재계산', () => { sl.slice(8, 11).forEach(s => { const d = s.data; if (d.options) return; basicSolved += check(d.question, d.input ? d.answer + (d.unit || '') : d.answer); }); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.context, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => { const prob = j >= 8 && j <= 10, con = j >= 3 && j <= 6, tx = prob ? (s.data.scenario.body + ' ' + s.data.question + ' ') : '';
    let pool = srcFigs;
    if (con) { const si = src.slides.findIndex(x => nsp(x.title) === nsp(s.data.title)), own = (src.slides[si] || {}).figs || []; if (!own.length) { pool = unitFigs; cfigN++; } else pool = own; }
    if (prob) { const p = srcProb(src, s.data); pool = (p && p.figs) || []; if (!pool.length) ok(!s.data.fig, 's' + (j + 1) + ' 원문 문제에 없는 그림'); }
    figsOf(s.data.fig).forEach(f => figCheck(f, pool, 's' + (j + 1) + (con ? ' 개념' : '') + ' ' + f.k, prob, tx)); }); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, tx = d.scenario.body + ' ' + d.question + ' ';
    const want = figsOf(d.fig).flatMap(f => figCheck(f, unitFigs, 's' + (j + 9) + ' ' + f.k, true, tx)); holeChecked += ansCheck(want, d, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '시각과 시간', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '시각과 시간', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); ok(s.data.fig, 'concept s' + (j + 4) + ' 그림 없음'); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '시각과 시간', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const EXP = { e: 60, basic: 2, hole: 17, cfig: 5 };
T('E 셈한 물음 수', () => { console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 기본 문제 ' + basicSolved + ' · 풀이 식 ' + stepChecked); ok(eChecked === EXP.e, '셈 ' + eChecked); ok(basicSolved === EXP.basic, '기본 ' + basicSolved); });
T('F 빈칸 답 대조한 문제 수 · 옮긴 개념 그림', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제 · 옮긴 개념 그림 ' + cfigN); ok(holeChecked === EXP.hole, '대조 ' + holeChecked); ok(cfigN === EXP.cfig, '옮긴 그림 ' + cfigN); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u4.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('8시 55분은 몇 시 몇 분 전일까요?') === '9시 5분 전' && solve('12시 10분 전은 몇 시 몇 분일까요?') === '11시 50분' && solve('11시 55분은 몇 시 몇 분 전일까요?') === '12시 5분 전', '몇 분 전');
  ok(solve('1시간 20분은 몇 분일까요?') === '80분' && solve('70분은 몇 시간 몇 분일까요?') === '1시간 10분' && solve('오전 8시부터 오후 5시까지는 몇 시간일까요?') === '9시간', '걸린 시간');
  ok(solve('오전 10시에서 4시간 뒤는 몇 시일까요?') === '오후 2시' && solve('2024년 7월 12일에서 2주 후는 언제일까요?') === '2024년 7월 26일' && solve('2024년 12월 22일에서 4개월 후는 언제일까요?') === '2025년 4월 22일', '날짜'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('5시 55분은 몇 시 몇 분 전일까요?', '5시 5분 전'); } catch (_) { e++; }
  try { check('1시간 10분은 몇 분일까요?', '110분'); } catch (_) { e++; }
  try { check('긴바늘이 4를 가리키면 몇 분일까요?', '4분'); } catch (_) { e++; }
  try { check('긴바늘이 숫자 4에서 작은 눈금 2칸 더 간 곳은 몇 분일까요?', '20분'); } catch (_) { e++; }
  try { check('오전 11시에서 2시간 뒤는 몇 시일까요?', '오전 1시'); } catch (_) { e++; }
  try { check('2024년 7월 12일에서 2주 후는 언제일까요?', '2024년 7월 14일'); } catch (_) { e++; }
  try { check('오전 9시에서 3시간 뒤는 몇 시일까요?', '오후 12시'); } catch (_) { e++; } // 낮 12시 — 쓰지 않는다
  try { stepEq('1시간 = 100분'); } catch (_) { e++; }
  try { stepEq('60 + 20 = 70'); } catch (_) { e++; }
  ok(e === 9, '틀린 답 못 잡음 ' + e);
  ok(josa('4 가').length === 0 && josa('4 이').length === 1 && josa('6은').length === 0, '조사 역검증');
  let c = 0;
  try { figCheck({ k: 'clk1', h: 5, m: 55, hands: 'hm', tag: '5시 5분 전' }, [{ k: 'clock', h: 5, m: 55, hands: 'hm', tag: '5시 5분 전' }], 'x', false, ''); } catch (_) { c++; } // 시계 글 틀림
  try { figCheck({ k: 'tbnd2', title: 't', from: [5, 0], to: [6, 0], h0: 5, h1: 6, step: 10, on: [300, 310, 320] }, [{ k: 'tband', title: 't', from: [5, 0], to: [6, 0], h0: 5, h1: 6, step: 10, on: [300, 310, 320] }], 'x', false, ''); } catch (_) { c++; } // 켠 칸 모자람
  try { figCheck({ k: 'kcal2', y: 2026, m: 11, first: 1, days: 30, upto: 30, ring: [] }, [{ k: 'kcal', y: 2026, m: 11, first: 1, days: 30, upto: 30, ring: [] }], 'x', false, ''); } catch (_) { c++; } // 1일 요일 틀림
  try { figCheck({ k: 'upr2', items: [['1일', '12시간']] }, [{ k: 'upair', items: [['1일', '12시간']] }], 'x', false, ''); } catch (_) { c++; }
  try { const g = { k: 'grow2', nodes: [{ date: '2024년 7월 12일', label: 'a' }, { date: '2024년 7월 26일', label: 'b' }], legs: [{ n: 3, u: '주' }] }; figCheck(g, [{ k: 'grow', nodes: g.nodes, legs: g.legs }], 'x', false, ''); } catch (_) { c++; }
  try { const d = { k: 'd24', segs: [[0, 7], [8, 24]], cols: ['a', 'b'], legs: [{ col: 'a', name: 'x' }, { col: 'b', name: 'y' }] }; figCheck(d, [{ k: 'day24', segs: d.segs, cols: d.cols, legs: d.legs }], 'x', false, ''); } catch (_) { c++; } // 7~8시 빈틈
  ok(c === 6, '그림 역검증 ' + c); });
console.log('gate_g2s2_math_u4: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
