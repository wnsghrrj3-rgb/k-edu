/* gate_g4s2_math_u2.js — 4학년 2학기 수학 2단원 「사각형」 케이티처 2세대 게이트 (82차, 베프 — u1 게이트 틀 A~L + 기하 셈).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드(4학년 2학기 · slug g4s2_math 파일) · B 19장 골격 · C 7요소 · D 복습 계보(g4s2_math u1_l10 → l01 → … → l10, 단원을 넘는 계보)
   E 문제 정답 재계산 — 게이트 자체 기하 셈: 글에서 셈한 답(세 각 → 360 − 합 · 삼각자 90 − a · 이웃한 각 180 − a · 네 변 합 ÷ 4 · 둘레 ÷ 2 − 한 변
       · 세 선분 → 가장 짧은 것 · 반지름 r → 한 변 r …)과 그림에서 셈한 답(lines 각으로 수직·평행 집합 · quad/quads 좌표를 게이트가 다시 재어
       평행 쌍·같은 변·직각·각·사각형 이름 · pdist·circ2·polyang·asum)을 따로 내어 서로 같고 정답과 같음 · 셀 수 없는 말 문항은 원문 정답 보기 대조
   F 식 전수 — 화면·교사 층·extras 의 셈 식 「a + b − c × d ÷ e = f」 값이 맞음(°·cm·m 떼고)
   G 그림 — lines(ㄱ자·꺾쇠 = 실제 수직·평행) · quad/quads(data-kinds·data-par = 게이트 좌표 셈 · 직각 표시 수 · 꺾쇠 수 · 눈금 · lens/angs 숫자 = 실측)
       · pdist(거리 = 가장 짧은 선분 · plain 은 ㄱ자 없음) · circ2(변 = 반지름) · 문제 그림 꺾쇠·눈금·수선 ㄱ자는 원문 풀이가 「표시」를 말할 때만
       · 개념 글 「가, 라, 마, 바」 주장 = 그림 좌표 셈
   H 재료 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음 · 요약 「다음:」 포함)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4s2_math_u2.js */
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
const L = load(path.join(TDIR, 'data/g4s2_math_u2.js'));
const PREV = load(path.join(TDIR, 'data/g4s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4s2_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '사각형', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const near = (a, b, e) => Math.abs(a - b) < (e || 1e-6);

/* ── 게이트 자체 기하 셈(부품의 셈과 따로 짬) ── */
const KOV = 'ㄱㄴㄷㄹ';
function geo(P) { // P 수학 좌표 [ㄱ,ㄴ,ㄷ,ㄹ]
  const S = [0, 1, 2, 3].map(i => [P[(i + 1) % 4][0] - P[i][0], P[(i + 1) % 4][1] - P[i][1]]); const len = S.map(v => Math.hypot(v[0], v[1]));
  const par = (i, j) => Math.abs(S[i][0] * S[j][1] - S[i][1] * S[j][0]) / (len[i] * len[j]) < 1e-3; // data-pts 는 소수 셋째 자리
  const pairs = [[0, 2], [1, 3]].filter(([i, j]) => par(i, j));
  const ang = [0, 1, 2, 3].map(i => { const a = [P[(i + 3) % 4][0] - P[i][0], P[(i + 3) % 4][1] - P[i][1]], b = [P[(i + 1) % 4][0] - P[i][0], P[(i + 1) % 4][1] - P[i][1]]; return Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))))) * 180 / Math.PI; });
  const eq4 = len.every(x => near(x, len[0], 2e-3)), r4 = ang.every(a => near(a, 90, 0.05));
  const kinds = []; if (pairs.length) kinds.push('사다리꼴'); if (pairs.length === 2) kinds.push('평행사변형'); if (eq4) kinds.push('마름모'); if (r4) kinds.push('직사각형'); if (eq4 && r4) kinds.push('정사각형');
  return { S, len, pairs, ang, kinds, eq4, r4 };
}
const ptsOf = (el) => el.getAttribute('data-pts').split(',').map(p => p.trim().split(/\s+/).map(Number));
const sideName = (i) => [KOV[i], KOV[(i + 1) % 4]].sort().join('');
const sideOf = (t) => { const m = String(t).match(/변 ([ㄱㄴㄷㄹ])([ㄱㄴㄷㄹ])/g) || []; return m.map(x => x.replace('변 ', '').split('').sort().join('')); };
const linesOf = (svg) => svg.getAttribute('data-lines').split(',').map(x => { const [n, a] = x.split(':'); return { n, a: +a }; });
const angD = (a, b) => ((a - b) % 180 + 180) % 180;
const isPerp = (A, B) => near(angD(A.a, B.a), 90);
const isPar = (A, B) => { const d = angD(A.a, B.a); return d < 1e-6 || d > 180 - 1e-6; };
const namesIn = (t) => (String(t).match(/직선 ([가-힣])/g) || []).map(x => x.slice(-1)).sort().join(',');
const qnames = (t) => (String(t).replace(/\*\*/g, '').match(/^[가-바](?:, [가-바])*$/) ? t.split(', ').sort().join(',') : null);
const WN = { 한: 1, 두: 2, 세: 3, 네: 4 };
const numOf = (t) => { const s = String(t).replace(/\*\*/g, ''); let m = s.match(/^(\d+(?:\.\d+)?)/); if (m) return +m[1]; m = s.match(/^([한두세네]) 쌍/); if (m) return WN[m[1]]; return NaN; };

/* 글에서 셈 — 반환: {num} | {word} | {opt} | undefined(셀 수 없는 꼴) */
const DEF = [[/아무리 늘여도 서로 만나지 않는 두 직선의 관계|서로 만나지 않는 두 직선을 무엇/, '평행', '평행선'], [/평행한 변이 한 쌍이라도 있는 사각형을 무엇/, '사다리꼴'], [/마주 보는 두 쌍의 변이 서로 평행한 사각형을 무엇/, '평행사변형'], [/네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형/, '정사각형'], [/네 각이 모두 직각인 사각형을 무엇/, '직사각형'], [/네 변의 길이가 모두 같은 사각형을 무엇/, '마름모'], [/만나서 이루는 각이 직각일 때, 두 직선의 관계/, '수직'], [/양쪽으로 끝없이 늘인 곧은 선/, '직선']];
function textAns(q0) { const t = clean(q0); let m; const N = (x) => +x;
  for (const [re, w1, w2] of DEF) if (re.test(t)) return { word: /두 직선을 무엇/.test(t) && w2 ? w2 : w1 };
  if ((m = t.match(/세 각이 각각 (\d+)°, (\d+)°, (\d+)° 일 때 나머지 한 각/))) return { num: 360 - N(m[1]) - N(m[2]) - N(m[3]) };
  if ((m = t.match(/삼각자에서 직각이 아닌 두 각 중 한 각이 (\d+)°/))) return { num: 90 - N(m[1]) };
  if ((m = t.match(/수직으로 만나 이루는 각을 한 선분이 (\d+)°와 몇 도/))) return { num: 90 - N(m[1]) };
  if (/수직으로 만날 때 이루는 각의 크기|수직인 직선 .+만나서 이루는 각은 몇 도|꼭짓점끼리 이은 두 선분이 만나서 이루는 각|거리를 재는 선분은 두 직선과 몇 도|직각일 때, 그 각의 크기|직사각형의 한 각의 크기/.test(t)) return { num: 90 };
  if (/사각형의 네 각의 크기의 합은 몇 도/.test(t)) return { num: 360 };
  if ((m = t.match(/(평행사변형|마름모)에서 한 각이 (\d+)° 일 때 이웃한 각/))) return { num: 180 - N(m[2]) };
  if ((m = t.match(/(평행사변형|마름모)에서 한 각이 (\d+)° 일 때 마주 보는 각/))) return { num: N(m[2]) };
  if (/(직사각형|정사각형|평행사변형|마름모)에서 이웃한 두 각의 크기의 합/.test(t)) return { num: 180 };
  if ((m = t.match(/한 변의 길이가 (\d+) cm 인 정사각형의 네 변의 길이의 합/)) || (m = t.match(/마름모의 한 변이 (\d+) cm 일 때 네 변의 길이의 합/))) return { num: 4 * N(m[1]) };
  if ((m = t.match(/(마름모|정사각형)의 한 변이 (\d+) cm 일 때, 다른 한 변/)) || (m = t.match(/(평행사변형|직사각형)의 한 변이 (\d+) cm 일 때,? 마주 보는 변/))) return { num: N(m[2]) };
  if ((m = t.match(/평행사변형의 네 변의 길이의 합이 (\d+) cm 이고 한 변이 (\d+) cm 일 때, 이웃한 변/))) return { num: N(m[1]) / 2 - N(m[2]) };
  if ((m = t.match(/평행사변형의 두 변이 (\d+) cm 와 (\d+) cm 일 때 마름모의 한 변/))) return { num: (N(m[1]) + N(m[2])) * 2 / 4 };
  if ((m = t.match(/(직사각형|평행사변형)의 두 변이 (\d+) cm 와 (\d+) cm 일 때 네 변의 길이의 합/))) return { num: (N(m[2]) + N(m[3])) * 2 };
  if ((m = t.match(/두 원으로 그린 마름모의 네 변의 길이의 합이 (\d+) cm 일 때, 원의 반지름/))) return { num: N(m[1]) / 4 };
  if ((m = t.match(/(마름모|정사각형)의 네 변의 길이의 합이 (\d+) cm 일 때 한 변의 길이/))) return { num: N(m[2]) / 4 };
  if ((m = t.match(/반지름이 (\d+) cm 인 두 원으로 그린 마름모의 (한 변의 길이|네 변의 길이의 합)/))) return { num: m[2] === '한 변의 길이' ? N(m[1]) : 4 * N(m[1]) };
  if ((m = t.match(/세 선분의 길이가 ([\d.]+) cm, ([\d.]+) cm, ([\d.]+) cm 일 때 평행선 사이의 거리/))) return { num: Math.min(N(m[1]), N(m[2]), N(m[3])) };
  if ((m = t.match(/비스듬한 선분을 재어 ([\d.]+) cm .*수직인 선분을 재면 ([\d.]+) cm 일 때, 평행선 사이의 거리/))) return { num: N(m[2]) };
  if ((m = t.match(/평행선 사이의 거리가 ([\d.]+) cm .*수직인 선분을 그어 재면 몇 cm/))) return { num: N(m[1]) };
  if ((m = t.match(/거리를 나타내는 변의 길이가 (\d+) cm 일 때, 평행선 사이의 거리/))) return { num: N(m[1]) };
  if ((m = t.match(/한 선분의 길이가 (\d+) cm 입니다. 다른 선분이 이 선분을 반으로 나눌 때 한쪽/))) return { num: N(m[1]) / 2 };
  if (/(직사각형|정사각형|평행사변형|마름모)에서 서로 평행한 변은 몇 쌍/.test(t)) return { num: 2 };
  if (/사다리꼴에는 평행한 변이 적어도 몇 쌍/.test(t)) return { num: 1 };
  if (/평행선을 (?:그을 때|긋는 데) 필요한 삼각자/.test(t)) return { num: 2 };
  return undefined; }
/* 그림에서 셈 */
function figAns(f, q0, d) { const t = clean(q0); const h = FIG.render(f); const D = docOf(h); const svg = D.querySelector('svg'); if (!svg) return null; let m;
  const opts = d && d.options ? d.options.map(o => o.text) : null;
  if (f.k === 'lines') { const ls = linesOf(svg); const by = (n) => ls.find(x => x.n === n);
    if ((m = t.match(/직선 ([가-힣])에 대한 수선이 \*?\*?아닌/)) || (m = t.match(/직선 ([가-힣])에 대한 수선이 아닌/))) { const base = by(m[1]); const want = ls.filter(x => x.n !== m[1] && !isPerp(x, base)).map(x => x.n).sort().join(','); return pick(opts, (o) => namesIn(o) === want); }
    if ((m = t.match(/직선 ([가-힣])에 대한 수선을 모두/))) { const base = by(m[1]); const want = ls.filter(x => isPerp(x, base)).map(x => x.n).sort().join(','); return pick(opts, (o) => (want ? namesIn(o) === want : /없다/.test(o))); }
    if (/서로 평행한 (?:두 )?직선/.test(t)) { const pr = []; ls.forEach((a, i) => ls.forEach((b, j) => { if (i < j && isPar(a, b)) pr.push([a.n, b.n].sort().join(',')); })); return pr.length === 1 ? pick(opts, (o) => namesIn(o) === pr[0]) : pr.length === 0 ? pick(opts, (o) => /없다/.test(o)) : null; }
    return undefined; }
  if (f.k === 'quad') { const G = geo(ptsOf(svg));
    if ((m = t.match(/변 ([ㄱㄴㄷㄹ]{2})과 평행한 변을 모두/))) { const key = m[1].split('').sort().join(''); const i = [0, 1, 2, 3].find(k => sideName(k) === key); const want = G.pairs.filter(p => p.indexOf(i) >= 0).map(p => sideName(p[0] === i ? p[1] : p[0])).sort().join(','); return pick(opts, (o) => (want ? sideOf(o).sort().join(',') === want : /없다/.test(o))); }
    if (/서로 평행한 변은 어느 것/.test(t)) { const want = G.pairs.map(p => [sideName(p[0]), sideName(p[1])].sort().join('|')); return want.length === 1 ? pick(opts, (o) => sideOf(o).sort().join('|') === want[0]) : null; }
    if (/서로 평행한 변은 몇 쌍/.test(t)) return opts ? pick(opts, (o) => numOf(o) === G.pairs.length) : { num: G.pairs.length };
    if (/평행사변형인가요|평행사변형일까요/.test(t)) return pick(opts, (o) => (G.kinds.indexOf('평행사변형') >= 0 ? /^그렇다/.test(o) : /^아니다/.test(o)));
    const rd = (v, e) => (near(v, Math.round(v * 10) / 10, e) ? Math.round(v * 10) / 10 : v); // 실측 — 좌표 소수 셋째 자리만큼만 허용
    const qi = (f.lens || []).indexOf('?'); if (qi >= 0) return { num: rd(G.len[qi], 2e-3) };
    const ai = (f.angs || []).indexOf('?'); if (ai >= 0) return { num: rd(G.ang[ai], 0.05) };
    return undefined; }
  if (f.k === 'quads') { const items = [...svg.querySelectorAll('g.o-qi')].map(g => ({ n: g.getAttribute('data-name'), G: geo(ptsOf(g)) }));
    const KIND = [[/사다리꼴을 모두/, '사다리꼴'], [/네 각이 모두 직각/, '직사각형'], [/마름모\*?\*? ?를 모두/, '마름모']];
    for (const [re, kd] of KIND) if (re.test(q0)) { const want = items.filter(x => x.G.kinds.indexOf(kd) >= 0).map(x => x.n).sort().join(','); return pick(opts, (o) => qnames(o) === want); }
    if (/마름모가 \*?\*?아닌\*?\*? 것과 그 까닭/.test(q0) || /마름모가 아닌 것과 그 까닭/.test(t)) { const RS = [[/길이가 다른 변이 있다/, (G) => !G.eq4], [/평행한 변이 없다/, (G) => G.pairs.length === 0], [/네 각이 직각이 아니다/, (G) => !G.r4], [/변이 네 개가 아니다/, () => false]];
      return pick(opts, (o) => { const mm = o.match(/^([가-바]) — (.+)$/); if (!mm) return false; const it = items.find(x => x.n === mm[1]); if (!it || it.G.eq4) return false; const r = RS.find(([re]) => re.test(mm[2])); return !!r && r[1](it.G); }); }
    return undefined; }
  if (f.k === 'pdist') { if (/평행선 사이의 거리/.test(t)) { const dd = +svg.getAttribute('data-d'); return opts ? pick(opts, (o) => numOf(o) === dd) : { num: dd }; } return undefined; }
  if (f.k === 'circ2') { const r1 = +svg.getAttribute('data-r1'), r2 = +svg.getAttribute('data-r2'), c = +svg.getAttribute('data-c'); const x = (c * c + r1 * r1 - r2 * r2) / (2 * c), hh = Math.sqrt(r1 * r1 - x * x); const P = [[0, 0], [x, hh], [c, 0], [x, -hh]]; const len = [0, 1, 2, 3].map(i => Math.hypot(P[(i + 1) % 4][0] - P[i][0], P[(i + 1) % 4][1] - P[i][1])); const eq = len.every(l => near(l, len[0], 1e-9));
    if (/아닌 까닭/.test(t)) return eq ? null : pick(opts, (o) => /길이가 다른 변/.test(o));
    if (/한 변의 길이/.test(t)) return eq ? { num: Math.round(len[0] * 1000) / 1000 } : null;
    if (/원의 반지름은/.test(t)) return eq && near(r1, r2) ? { num: r1 } : null;
    if (/네 변의 길이의 합은/.test(t)) return { num: Math.round(len.reduce((a, b) => a + b, 0) * 1000) / 1000 };
    return undefined; }
  if (f.k === 'polyang') { const A = svg.getAttribute('data-angs').split(',').map(Number); const qi = +svg.getAttribute('data-q'); const tot = 180 * (A.length - 2); return { num: tot - A.reduce((a, b, i) => a + (i === qi ? 0 : b), 0) }; }
  if (f.k === 'asum') { const P = svg.getAttribute('data-parts').split(',').map(Number); const qi = +svg.getAttribute('data-q'); if (/수직/.test(t)) return { num: 90 - P.reduce((a, b, i) => a + (i === qi ? 0 : b), 0) }; return undefined; }
  return undefined; }
function pick(opts, fn) { if (!opts) return null; const hit = opts.map((o, i) => (fn(o) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; }
function optOf(res, d) { // 글 셈 {num}/{word} → 보기 번호
  if (res.opt != null || !d || !d.options) return res; const opts = d.options.map(o => o.text);
  if (res.num != null) { const r = pick(opts, (o) => numOf(o) === res.num); return r || res; }
  if (res.word != null) { const r = pick(opts, (o) => clean(o) === res.word); return r || res; }
  return res; }
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(near(got, res.num, 1e-9), where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('10차시 키 u2_l01~l10 · 파일 data/g4s2_math_u2.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 2학기 · 2단원 사각형 · 성취기준 표시 · live_url 실파일 · 40분', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 2 && m.unit === 2 && m.unit_title === '사각형' && /사각형/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade4\/semester2\/math\/2단원_사각형\//.test(m.source), k + ' source'); }));
T('slug — KT2.slugOf({g:4,s:math,t:2}) = g4s2_math', () => ok(KT2.slugOf({ g: 4, s: 'math', t: '2' }) === 'g4s2_math', 'slug'));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const exPrev = PREV.u1_l10.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4s2_math u1_l10(1단원 마지막)') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : exPrev;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4s2_math:u1_l10'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0, nSrc = 0; const unread = [];
const normT = (t) => String(t).replace(/\s+/g, ' ').trim();
const srcP = (k, q) => SRC[k].problems.find(p => normT(p.q.replace(/인가요\?$/, '일까요?')) === normT(q));
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답 (글 셈 · 그림 셈 · 말 문항은 원문 정답 보기)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question); if (ta) ta = optOf(ta, d); const fa = d.fig ? figAns(d.fig, d.question, d) : undefined;
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; if (r === undefined) { const p = srcP(k, d.question); ok(p && d.options && d.options[p.ci] && d.options[p.ci].correct, s.id + ' 원문 정답 보기와 다름'); nSrc++; return; }
    nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' 출구 ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('출구 ' + it.q, r, null, it.a); }); }));
T('다시 셈한 정답 = 80 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 25 · 글·그림 둘 다 셈해 대조 ≥ 12', () => ok(nCheck === 80 && !unread.length && nFigQ >= 25 && nBoth >= 12, 'nCheck ' + nCheck + ' · 원문 대조 ' + nSrc + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 못 읽음 ' + unread.join(' | ')));
T('기하 셈기 자체 확인 — 사각형 이름 · 수선 집합 · 틀린 그림 잡음', () => {
  ok(SAME(geo([[0, 2], [0, 0], [2, 0], [2, 2]]).kinds, ['사다리꼴', '평행사변형', '마름모', '직사각형', '정사각형']), '정사각형 이름 다섯');
  ok(SAME(geo([[0.4, 2.4], [0, 0], [4.2, 0.5], [3.2, 2.9]]).kinds, []), '평행한 변 없음');
  const d = { options: [{ text: '직선 나, 직선 라' }, { text: '직선 다, 직선 마' }] }; ok(SAME(figAns({ k: 'lines', items: [{ name: '가', ang: 0, at: [230, 200] }, { name: '나', ang: 90, at: [100, 140] }, { name: '라', ang: 90, at: [300, 140] }, { name: '다', ang: 70, at: [200, 200] }] }, '직선 가에 대한 수선을 모두 고른 것은 어느 것일까요?', d), { opt: 0 }), '수선 집합');
  ok(figAns({ k: 'quad', para: [5, 3, 60], lens: ['', '?', '', ''] }, 'x', {}).num === 5, '변 실측');
  ok(SAME(textAns('사각형에서 세 각이 각각 90°, 90°, 100° 일 때 나머지 한 각은 몇 도일까요?'), { num: 80 }) && SAME(textAns('평행사변형의 네 변의 길이의 합이 40 cm 이고 한 변이 15 cm 일 때, 이웃한 변은 몇 cm 일까요?'), { num: 5 }), '글 셈'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$|^L\.u2_l01\.slides\.1\.data\.items\./.test(where); // l01 복습 = u1_l10 출구(그 게이트가 검산)
const NUM = '\\d+(?:\\.\\d+)?';
const CH = new RegExp('(?<![\\d.])(\\(?' + NUM + '(?:\\s*[+\\-×÷]\\s*\\(?' + NUM + '\\)?)+\\)?)\\s*=\\s*(' + NUM + ')(?![\\d.])', 'g');
function calc(e) { const s = e.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(s)) return NaN; return Function('return (' + s + ')')(); }
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/°/g, '').replace(/(\d)\s*(cm|m)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { let lhs = m[1]; const open = (lhs.match(/\(/g) || []).length, close = (lhs.match(/\)/g) || []).length; if (open !== close) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const v = calc(lhs); if (!Number.isFinite(v)) continue; nEq++; if (!near(v, +m[2], 1e-9)) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 30, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['360 − 75 − 75 = 200', '44 ÷ 4 = 12', '(9 + 5) × 2 = 26'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('100° + 85° + 95° + 80° = 360° · 0.8 × 5 = **4** cm · (9 + 5) × 2 = 28', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => [p.fig || p, p.label]) : [[f, null]]);
const parts = []; figs.forEach(([w0, f, b, k, s]) => flat(f).forEach(([g, lab], i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b, lab, k, s])));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 25 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 25, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const nG = { lines: 0, quad: 0, quads: 0, qi: 0, pdist: 0, circ2: 0, lens: 0, angs: 0 };
function checkQuad(el, spec, w0, small) { const G = geo(ptsOf(el)); ok(el.getAttribute('data-kinds') === G.kinds.join(','), w0 + ' 이름 ' + el.getAttribute('data-kinds') + ' ≠ ' + G.kinds); ok(+el.getAttribute('data-par') === G.pairs.length, w0 + ' 평행 쌍');
  const nR = el.querySelectorAll('.o-right').length - (spec.diag ? el.querySelectorAll('.o-diag').length && 1 : 0); const wantR = (small ? spec.right === true : spec.right !== false) ? G.ang.filter(a => near(a, 90, 0.05)).length : 0; if (!spec.diag) ok(nR === wantR, w0 + ' 직각 표시 ' + nR + ' ≠ ' + wantR);
  const nP = el.querySelectorAll('.o-par').length; const wantP = spec.par ? G.pairs.reduce((a, p, k) => a + 2 * (k + 1), 0) : 0; ok(nP === wantP, w0 + ' 꺾쇠 ' + nP + ' ≠ ' + wantP);
  if (spec.eq) { const grp = []; G.len.forEach(l => { const g = grp.find(x => near(x.l, l, 2e-3)); if (g) g.n++; else grp.push({ l, n: 1 }); }); const want = grp.filter(g => g.n > 1).reduce((a, g, k) => a + g.n * (k + 1), 0); ok(el.querySelectorAll('.o-tick').length === want, w0 + ' 눈금 ' + el.querySelectorAll('.o-tick').length + ' ≠ ' + want); } else ok(!el.querySelectorAll('.o-tick').length, w0 + ' eq 없는데 눈금');
  (spec.lens || []).forEach((v, i) => { if (/^[\d.]+$/.test(String(v))) { nG.lens++; ok(near(+v, G.len[i], 1e-3), w0 + ' 변 글자 ' + v + ' ≠ 실측 ' + G.len[i].toFixed(3)); } });
  (spec.angs || []).forEach((v, i) => { if (/^[\d.]+$/.test(String(v))) { nG.angs++; ok(near(+v, G.ang[i], 0.05), w0 + ' 각 글자 ' + v + ' ≠ 실측 ' + G.ang[i].toFixed(2)); } });
  return G; }
const markOK = (s) => s.block !== 'basic_problem' || /표시/.test(s.data.note || '');
T('lines — ㄱ자·꺾쇠는 실제 수직·평행일 때만 · 데이터가 주장한 수직·평행 = 참 · 문제 그림 ㄱ자는 원문 풀이가 「표시」를 말할 때만', () => parts.filter(([, g]) => g.k === 'lines').forEach(([w0, g, , , , s]) => { nG.lines++; const D = docOf(FIG.render(g)); const ls = linesOf(D.querySelector('svg')); const by = (n) => ls.find(x => x.n === n);
  (g.right || []).forEach(([a, b]) => ok(isPerp(by(a), by(b)), w0 + ' 수직 주장 거짓 ' + a + b)); (g.par || []).forEach(([a, b]) => ok(isPar(by(a), by(b)), w0 + ' 평행 주장 거짓 ' + a + b));
  ok(D.querySelectorAll('.o-right').length === (g.right || []).length, w0 + ' ㄱ자 수'); ok(D.querySelectorAll('.o-par').length === (g.par || []).reduce((a, p, k) => a + 2 * (k + 1), 0), w0 + ' 꺾쇠 수');
  if (!markOK(s)) ok(!(g.right || []).length && !(g.par || []).length, w0 + ' 문제 그림에 답 표시'); }));
T('quad · quads — data-kinds·data-par = 게이트 좌표 셈 · 직각·꺾쇠·눈금 수 · lens/angs 숫자 = 실측 · 문제 그림 꺾쇠·눈금은 「표시」 문항만', () => parts.forEach(([w0, g, , , , s]) => {
  if (g.k === 'quad') { nG.quad++; const D = docOf(FIG.render(g)); checkQuad(D.querySelector('svg'), g, w0, false); if (!markOK(s)) ok(!g.par, w0 + ' 문제 그림에 꺾쇠'); }
  if (g.k === 'quads') { nG.quads++; const D = docOf(FIG.render(g)); const els = [...D.querySelectorAll('g.o-qi')]; ok(els.length === g.items.length, w0 + ' 칸 수'); els.forEach((el, i) => { nG.qi++; ok(el.getAttribute('data-name') === g.items[i].name, w0 + ' 이름표'); checkQuad(el, g.items[i], w0 + ' ' + g.items[i].name, true); if (!markOK(s)) ok(!g.items[i].par && !g.items[i].eq && !g.items[i].right, w0 + ' 문제 그림에 표시'); }); } }));
T('pdist — 거리 = 가장 짧은 선분 · 선분 ≥ 거리 · plain 은 ㄱ자 없음 · 문제 글 수 = 그림 선분', () => parts.filter(([, g]) => g.k === 'pdist').forEach(([w0, g, b, , , s]) => { nG.pdist++; const D = docOf(FIG.render(g)); const svg = D.querySelector('svg'); const dd = +svg.getAttribute('data-d'), segs = svg.getAttribute('data-segs').split(',').map(Number);
  ok(segs.indexOf(dd) >= 0 && Math.min(...segs) === dd, w0 + ' 거리 ≠ 가장 짧은 선분'); if (g.plain) ok(!D.querySelectorAll('.o-right').length, w0 + ' plain 인데 ㄱ자'); if (b === 'basic_problem') { ok(g.plain, w0 + ' 문제 그림은 plain'); const nums = (clean(s.data.question).match(/\d+(?:\.\d+)?(?= cm)/g) || []).map(Number); nums.forEach(n => ok(segs.indexOf(n) >= 0, w0 + ' 글의 ' + n + ' cm 가 그림에 없음')); } }));
T('circ2 — 변 = 반지름(크기가 같으면 네 변 같음 · 다르면 두 가지) · data-lens = 게이트 셈', () => parts.filter(([, g]) => g.k === 'circ2').forEach(([w0, g]) => { nG.circ2++; const svg = docOf(FIG.render(g)).querySelector('svg'); const r1 = +g.r1, r2 = +(g.r2 != null ? g.r2 : g.r1); const lens = svg.getAttribute('data-lens').split(',').map(Number);
  ok(near(lens[0], r1, 1e-3) && near(lens[3], r1, 1e-3) && near(lens[1], r2, 1e-3) && near(lens[2], r2, 1e-3), w0 + ' 변 ≠ 반지름 ' + lens); ok(g.c < r1 + r2 && g.c > Math.abs(r1 - r2), w0 + ' 두 원이 안 만남'); }));
/* 개념 글 「가, 라, 마, 바」 주장 = 그림 좌표 셈 */
const CLAIMS = { u2_l05: [[/평행한 변이 있는 사각형은 \*\*([^*]+)\*\*/, (G) => G.pairs.length > 0], [/평행한 변이 없는 사각형은 \*\*([^*]+)\*\*/, (G) => G.pairs.length === 0]], u2_l06: [[/없는 것은 \*\*([^*]+)\*\*/, (G) => G.pairs.length === 0], [/한 쌍인 것은 \*\*([^*]+)\*\*/, (G) => G.pairs.length === 1], [/두 쌍인 것은 \*\*([^*]+)\*\*/, (G) => G.pairs.length === 2]], u2_l07: [[/모두 같은 사각형은 \*\*([^*]+)\*\*/, (G) => G.eq4], [/길이가 다른 변이 있는 사각형은 \*\*([^*]+)\*\*/, (G) => !G.eq4]] };
T('개념 글의 「가, 라, 마, 바」 주장 = 그림 좌표 셈 (l05 평행한 변 · l06 몇 쌍 · l07 네 변)', () => Object.keys(CLAIMS).forEach(k => { const s = L[k].slides[3]; ok(s.data.fig.k === 'quads', k + ' s04 quads 아님'); const D = docOf(FIG.render(s.data.fig)); const items = [...D.querySelectorAll('g.o-qi')].map(g => ({ n: g.getAttribute('data-name'), G: geo(ptsOf(g)) }));
  CLAIMS[k].forEach(([re, fn]) => { const m = s.data.content.match(re); ok(m, k + ' 글에서 주장 못 찾음 ' + re); const said = m[1].split(',').map(x => x.trim()).sort().join(','); const real = items.filter(x => fn(x.G)).map(x => x.n).sort().join(','); ok(said === real, k + ' 글 ' + said + ' ≠ 그림 ' + real); }); }));
T('사각형 부품 수 — lines ≥ 8 · quad ≥ 15 · quads ≥ 10(칸 ≥ 40) · pdist ≥ 8 · circ2 ≥ 6 · lens/angs 실측 ≥ 15', () => ok(nG.lines >= 8 && nG.quad >= 15 && nG.quads >= 10 && nG.qi >= 40 && nG.pdist >= 8 && nG.circ2 >= 6 && nG.lens + nG.angs >= 15, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 변 글자·거짓 수직 잡음', () => { let caught = 0; try { const D = docOf(FIG.render({ k: 'quad', rect: [5, 3], lens: ['4', '', '', ''] })); checkQuad(D.querySelector('svg'), { rect: [5, 3], lens: ['4', '', '', ''] }, 'p', false); } catch (e) { caught++; } try { const g = { k: 'lines', items: [{ name: '가', ang: 0, at: [230, 200] }, { name: '나', ang: 80, at: [230, 140] }], right: [['가', '나']] }; const ls = linesOf(docOf(FIG.render(g)).querySelector('svg')); ok(isPerp(ls[0], ls[1]), 'x'); } catch (e) { caught++; } ok(caught === 2, '잡은 수 ' + caught); });

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
T('마지막 차시 「다음 단원엔」 = 3단원 소수의 덧셈과 뺄셈 · 차단 어휘 0', () => { const nx = L.u2_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /소수의 덧셈과 뺄셈/.test(nx.preview), '다음 단원'); const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로'].forEach(b => ok(all.indexOf(b) < 0, '차단 어휘 ' + b)); });

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary;
const FIRST = [['수선', 2], ['평행선', 3], ['공통의 수선', 3], ['사이의 거리', 4], ['사다리꼴', 5], ['평행사변형', 6], ['이웃한', 6], ['마름모', 7], ['꼭짓점끼리', 7], ['컴퍼스', 9], ['반지름', 9]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(srcTxt(KEYS[n - 1]).indexOf(w0) >= 0, '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('요약 「다음」 줄·arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { const nx = FIRST.filter(([, n]) => n > i + 1).map(([w0]) => w0); const ar = JSON.stringify(L[k].slides[16].data); nx.forEach(w0 => ok(ar.indexOf(w0) < 0, k + ' 요약에 「' + w0 + '」')); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u2_l01.slides[3].data)); ok(JSON.stringify(probe).indexOf('마름모') < 0, 'l01 개념 장 깨끗'); probe.content += ' 마름모'; ok(JSON.stringify(probe).indexOf('마름모') >= 0, '심은 낱말'); });

console.log('\n게이트 g4s2 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
