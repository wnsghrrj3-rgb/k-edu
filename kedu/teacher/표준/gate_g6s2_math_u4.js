/* gate_g6s2_math_u4.js — 6학년 2학기 수학 4단원 「비례식과 비례배분」 케이티처 2세대 게이트 (2026-11-09 준비본, 오푸스 5.5 — gate_g6s2_math_u2 틀 + 비·비례식 셈기).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품(tools·chain·eq·eqt·rtab·lbar·panels — 있는 부품만, 무대 엔진 무개변) · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음)
   D 복습 계보(l01 = 3단원 u3_l10 출구 → l02 … l10 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 셈기(분수 셈 · 간단한 자연수의 비 · 비례식 □ · 외항·내항 · 비례배분)로
     기본 문제 30 · 수준별 기본·도전 20 · 출구 30 · 넓히기 10 · 되짚기 3 을 교과서 수에서 다시 셈해 대조
   F 글 속 식 다시 셈 — 「a × b = c」(분수·소수 포함) 사슬 · 「a：b = c：d」 비례식이 참인지(거짓이라 밝힌 자리만 뺌) · 「a：b → … → c：d」 비율 보존 · 검산기 자체 확인
   G 그림 — 렌더 · rtab 「?」 칸 값 = 정답 · lbar 띠의 수 합 = 전체 · 띠 길이 비 = 수의 비 · 문제 그림이 답을 그리지 않음(? 또는 □ · 보기에서 고르는 문제만 예외)
   H 교과서 충실 — 글에 쓴 비(a：b)는 모두 교과서·『수학익힘』·지도서 쪽에 있는 비이거나 그 비를 간단히 한 비(ANCHOR 표, 쪽 표시) · 지어낸 비 0 · 교과서 열쇠 수 있음
   I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원(5단원 원의 둘레와 넓이) · L 선행(비례식·외항 l04 · 비례식의 성질 l05 · 비례배분 l07 — l01 예외)
   M 차단 어휘 · 「결」 0 · 곰이·펭이 0 · 교사 화면 영어 차시 코드 0
   키 = 지도서 차시 번호 1~10(8 = 함께하는 수학 · 9 = 생각이 반짝 수학 · 10 = 문제로 마무리)
   실행: NODE_PATH=<jsdom>/node_modules node kedu/teacher/표준/gate_g6s2_math_u4.js   (3단원 데이터가 다른 곳이면 KT_U3=<g6s2_math_u3.js>) */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u4.js'));
const U3F = [path.join(TDIR, 'data/g6s2_math_u3.js'), process.env.KT_U3 || ''].find(f => f && fs.existsSync(f));
const L3 = U3F ? load(U3F) : null;
const KEYS = Array.from({ length: 10 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '비례식과 비례배분', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const figText = (f) => { const d = docOf(FIG.render(f)); const out = []; const tw = d.createTreeWalker(d.body, 4); let n; while ((n = tw.nextNode())) { const t = n.nodeValue.trim(); if (t) out.push(t); } return out.join(' ¦ ').replace(/\s+/g, ' '); };

/* ── 게이트 자체 셈기 (생성기와 따로 짬 — 분수는 [분자, 분모] 정수 쌍) ── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (n, d) => { if (d === undefined) d = 1; ok(d !== 0, '0으로 나눔'); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
const qp = (s) => { s = String(s).trim(); let m;
  if ((m = s.match(/^(\d+) (\d+)\/(\d+)$/))) return Q(+m[1] * +m[3] + +m[2], +m[3]);
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return Q(+m[1], +m[2]);
  if ((m = s.match(/^(\d+)\.(\d+)$/))) return Q(+(m[1] + m[2]), Math.pow(10, m[2].length));
  if (/^\d+$/.test(s)) return Q(+s, 1); throw new Error('수 모름: ' + s); };
const qm = (a, b) => Q(a[0] * b[0], a[1] * b[1]), qd = (a, b) => Q(a[0] * b[1], a[1] * b[0]), qa = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), qs = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const qeq = (a, b) => a[0] === b[0] && a[1] === b[1];
const qstr = (a) => { if (a[1] === 1) return String(a[0]); let t = a[1]; while (t % 2 === 0) t /= 2; while (t % 5 === 0) t /= 5; if (t === 1) return String(a[0] / a[1]); return a[0] + '/' + a[1]; };
const gSimp = (a, b) => { const r = qd(qp(a), qp(b)); return r[0] + '：' + r[1]; };                       // 간단한 자연수의 비
const gRatioOf = (t) => { const m = String(t).match(/^(.+?)：(.+)$/); return qd(qp(m[1]), qp(m[2])); };
const gSolve = (t) => { const i = t.indexOf(null); ok(i >= 0 && t.filter(x => x === null).length === 1, '□ 하나'); const v = t.map(x => (x === null ? null : qp(x)));   // 외항의 곱 = 내항의 곱
  const r = i === 0 ? qd(qm(v[1], v[2]), v[3]) : i === 3 ? qd(qm(v[1], v[2]), v[0]) : i === 1 ? qd(qm(v[0], v[3]), v[2]) : qd(qm(v[0], v[3]), v[1]); return qstr(r); };
const gIsProp = (t) => { const v = t.map(qp); return qeq(qm(v[0], v[3]), qm(v[1], v[2])); };
const pairJ = (a, b) => a + (/[2459]$/.test(String(a)) || /\/[0-9]+$/.test(String(a)) && /[2459]$/.test(String(a).split('/')[0]) ? '와 ' : '과 ') + b;
const gOuter = (t) => pairJ(t[0], t[3]), gInner = (t) => pairJ(t[1], t[2]);
const gDist = (T0, a, b, who) => { const r = qd(qm(qp(T0), Q(who ? b : a)), Q(a + b)); ok(r[1] === 1, '비례배분 몫이 자연수가 아님'); return r[0]; };
const propOf = (s) => { const m = clean(s).replace(/□/g, 'X').match(/^([\dX./ ]+)：([\dX./ ]+) = ([\dX./ ]+)：([\dX./ ]+)$/); ok(m, '비례식 모양 아님: ' + s); return [1, 2, 3, 4].map(i => (m[i].trim() === 'X' ? null : m[i].trim())); };

console.log('═══ A. 로드 ═══');
T('10차시 키 u4_l01~l10 · 파일 data/g6s2_math_u4.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 · 4단원 비례식과 비례배분 · 성취기준 번호 · 40분 · src_key · source(지도서 직행 · 투영 회수 키)', () => KEYS.forEach(k => { const m = L[k].meta;
  ok(m.grade === 6 && m.term === 2 && m.unit === 4 && m.subject === '수학' && m.unit_title === '비례식과 비례배분' && m.n === +k.slice(-2) && m.src_key === k, k); ok(/6수02-0[45]/.test(m.std), k + ' std'); ok(m.duration_min === 40, k + ' 40분'); ok(!('live_url' in m), k + ' live_url 없음');
  ok(/지도서 4단원/.test(m.source) && (k === 'u4_l08' ? /원문 없는 차시/.test(m.source) : /grade6\/semester2\/math\/4단원_비례식과비례배분\/g6_math_u4_l\d\d_/.test(m.source)), k + ' source'); }));
T('자기주도 원문 회수 키 차례 — 지도서 1~7차시 = 원문 l01~l07 · 9차시 = 원문 l08 · 10차시 = 원문 l09', () => { const want = { u4_l01: 'l01', u4_l07: 'l07', u4_l09: 'l08', u4_l10: 'l09' }; Object.keys(want).forEach(k => ok(L[k].meta.source.indexOf('g6_math_u4_' + want[k] + '_') > 0, k)); });
T('성취기준 — l01·l10 둘 다 · l02~l06·l08 6수02-04 · l07·l09 6수02-05', () => KEYS.forEach((k, i) => { const s = L[k].meta.std; const n = i + 1; const want = n === 1 || n === 10 ? ['04', '05'] : n === 7 || n === 9 ? ['05'] : ['04'];
  ok(want.every(x => s.indexOf('6수02-' + x) >= 0) && s.match(/6수02-\d\d/g).length === want.length, k + ' ' + s); }));
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math', () => ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'));
T('쓰는 그림 부품이 모두 무대에 등록(tools·chain·eq·eqt·rtab·lbar·panels)', () => { const used = new Set(); KEYS.forEach(k => L[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; used.add(f.k); (f.items || []).forEach(x => x.fig && used.add(x.fig.k)); }));
  [...used].forEach(k => ok(FIG.parts.indexOf(k) >= 0, k + ' 미등록')); ok([...used].every(k => ['tools', 'chain', 'eq', 'eqt', 'rtab', 'lbar', 'panels'].indexOf(k) >= 0), [...used].join(',')); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 10종 서로 다름', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); });

console.log('═══ D. 복습 계보 ═══');
const U3EXIT = [['192÷4 = 48일 때 19.2÷0.4는 얼마일까요?', '48'], ['91÷3.5는 얼마일까요?', '26'], ['11÷3의 몫을 반올림하여 소수 첫째 자리까지 나타내면 얼마일까요?', '3.7']];
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? '직전 차시 출구' : '3단원 마지막 차시(u3_l10) 출구' + (L3 ? ' — 3단원 데이터와 대조' : ' — 3단원 데이터 없음, 적어 둔 출구와 대조')), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(rv.from === 'u3_l10' && rv.items.length === 3, 'l01 from ' + rv.from); const src = L3 ? L3.u3_l10.slides[15].data.items.map(x => [x.q, x.a]) : U3EXIT; ok(SAME(rv.items.map(x => [x.q, x.a]), src), 'l01 ≠ 3단원 출구');
    ok(/소수의 나눗셈/.test(rv.content) && /비와 비율/.test(rv.content) && /약분과 통분/.test(rv.content) && /대응 관계/.test(rv.content), 'l01 되짚기 글(3단원 · 선수 학습)'); if (L3) ok(/비례식과 비례배분/.test(L3.u3_l10.slides[18].data.preview), '3단원 마지막 장 예고 = 비례식과 비례배분'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
const optProp = (d) => { const hits = d.options.filter(o => gIsProp(propOf(o.text))); ok(hits.length === 1, '비례식인 보기 수 ' + hits.length); return hits[0].text; };
const optIsland = (d, ref) => { const want = gSolve(ref); const hits = d.options.filter(o => gSolve(propOf(o.text)) === want); ok(hits.length === 1, '같은 □ 섬 수 ' + hits.length); return hits[0].text; };
const optRatio = (d, r) => { const hits = d.options.filter(o => qeq(gRatioOf(o.text), r)); ok(hits.length === 1, '비율이 같은 보기 수 ' + hits.length); return hits[0].text; };
const scr = (d) => { const f = d.fig; ok(f.k === 'rtab', '화면 표'); const hit = f.rows.filter(r => qeq(qd(qp(r.v[0]), qp(r.v[1])), Q(16, 9))); ok(hit.length === 1, '16：9 화면 수'); return hit[0].name; };
const honeyCmp = () => (qeq(gRatioOf('0.1：0.8'), gRatioOf('3/40：3/5')) ? '두 꿀물의 진하기가 같다' : '?');
const lcm = (a, b) => a * b / gcd(a, b);
const BASIC = {
  u4_l01: [() => '3：4', () => qstr(Q(2, 7)), () => qstr(qm(qp('1'), Q(4, 2)))],
  u4_l02: [() => qstr(Q(4, 2)), () => (7 * 5) + '：' + (2 * 5), d => scr(d)],
  u4_l03: [() => gSimp('2.1', '5.6'), () => lcm(6, 4), () => honeyCmp()],
  u4_l04: [() => gOuter([8, 5, 16, 10]), () => gInner([56, 21, 8, 3]), d => optRatio(d, Q(4, 3))],
  u4_l05: [() => gSolve([10, 8, 15, null]), d => optProp(d), () => gSolve([3, 11, null, 22])],
  u4_l06: [() => gSolve([6, 40, 21, null]), () => gSolve([4, 48, null, 60]), () => gSolve([57000, 300, 38000, null])],
  u4_l07: [() => gDist(28, 3, 4, 1), () => gDist(10000, 3, 2, 0) + '원', () => gDist(60, 7, 5, 0)],
  u4_l08: [() => gSolve(['0.6', '1.8', null, 9]), () => gSolve([27, null, 1, '1/3']), d => optIsland(d, [2, 3, null, 6])],
  u4_l09: [() => gDist(500000, 7, 3, 0) + '원', () => { const r = gRatioOf(gSimp(12000, 8000)); return gDist(gDist(500000, 7, 3, 1), r[0], r[1], 1) + '원'; }, () => { const r = gRatioOf(gSimp(4, 2)); return gDist(gDist(500000, 7, 3, 1), r[0], r[1], 0) + '원'; }],
  u4_l10: [() => gSolve([36, 9, null, 2]), () => gDist(420, 3, 4, 1) + ' g', () => gSolve([15, 24, 50, null])]
};
const r56 = gRatioOf(gSimp(1500, 600));
const LEV = {
  u4_l01: ['1', '6：7'], u4_l02: [gSimp(6, 9), String(18 * (90 / 45))], u4_l03: [gSimp(28, 63), gSimp('2/3', '3/7')], u4_l04: [String(9 * 2), qstr(qd(qp(6), Q(3, 4)))],
  u4_l05: [gSolve([4, null, 1, 25]), gSolve([14, 8, 21, null])], u4_l06: [gSolve([2, 180, 5, null]), gSolve([5, 3, 15, null])], u4_l07: [String(gDist(9, 2, 1, 1)), String(gDist(64 / 2, 9, 7, 0))],
  u4_l08: [gSolve([30, 36, null, 18]), gSolve([null, 5, '2/5', '2/9'])], u4_l09: [gSimp(12000, 8000), String(gDist(150000, 2, 1, 0) - gDist(150000, 3, 2, 0))], u4_l10: [gSimp(54, 27), String(gDist(35, r56[0], r56[1], 0))]
};
const EXIT = {
  u4_l01: ['2：1', '2', qstr(qm(Q(1), Q(4, 2)))], u4_l02: [(2 * 3) + '：' + (3 * 3), '같아요', (12 / 4) + '：' + (20 / 4)], u4_l03: [gSimp('2.5', 3), gSimp('1/6', '1/4'), gSimp('0.7', '2/5')],
  u4_l04: ['비례식', gOuter([7, 9, 14, 18]), gInner([48, 32, 3, 2])], u4_l05: [String(5 * 14), gSolve([8, 6, 12, null]), gIsProp(['9', '12', '3', '4']) ? '예' : '아니요'],
  u4_l06: [gSolve([2, 8000, null, 40000]), gSolve([6, 40, 21, null]), gSolve([1, 6, '1.5', null])], u4_l07: [String(gDist(9, 2, 1, 0)), String(gDist(28, 3, 4, 0)), '비례배분'],
  u4_l08: [gSolve([3, 15, null, 30]), gSolve(['2.4', 18, '0.4', null]), gSolve([8, null, 2, 1])], u4_l09: [gDist(500000, 7, 3, 1) + '원', gDist(150000, 3, 2, 0) + '원', gDist(150000, 2, 1, 1) + '원'],
  u4_l10: [qstr(qd(qp(9), qp(3))), gSolve([3, null, 12, 56]), gSimp(1500, 600)]
};
const REVIEW1 = U3EXIT.map(x => x[1]);
const ADV = { u4_l01: '물도 ' + qstr(qm(Q(1), Q(4, 2))) + '컵이어야 해요', u4_l02: '2를 더해 8：6을 구한 방법', u4_l03: '두 방법 모두 ' + gSimp('1.4', '1 1/5') + '이에요', u4_l04: '두 항에 같은 수를 더하면 비율이 달라져요',
  u4_l05: '외항의 곱과 내항의 곱이 다르기 때문이에요', u4_l06: '비례식으로 모르는 높이를 구할 수 있기 때문이에요', u4_l07: '가로가 ' + (gDist(32, 9, 7, 0) - gDist(32, 9, 7, 1)) + ' cm 더 길어요',
  u4_l08: '두 섬 모두 □ = ' + gSolve(['2/3', 2, 5, null]) + '예요', u4_l09: '다현 ' + gDist(35, 5, 2, 0) + '장, 윤수 ' + gDist(35, 5, 2, 1) + '장', u4_l10: '두 방법 모두 ' + gSimp('3/4', '0.8') + '이에요' };
function want(d, exp) {
  exp = String(exp);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); ok(new Set(d.options.map(o => clean(o.text))).size === d.options.length, '보기 겹침');
    const rv = (() => { try { return gRatioOf(exp); } catch (e) { return null; } })(); if (rv && /：/.test(exp) && !/=/.test(exp)) d.options.forEach(o => { if (!o.correct && /^[\d./ ]+：[\d./ ]+$/.test(o.text)) ok(!qeq(gRatioOf(o.text), rv), '비율이 같은 오답 보기 「' + o.text + '」(지도서 273)'); }); }
  else { ok(d.input === 'count_input' && String(d.answer) === exp, '답 ' + d.answer + ' ≠ 셈 ' + exp); }
  ok(new RegExp('\\*\\*' + exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note), '풀이 끝 = 답'); nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u4_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, BASIC[k][i](s.data)); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(LEV[k][i]), t + ' ' + lv[t].a + ' ≠ ' + LEV[k][i]); ok(lv[t].steps.length >= 3 && String(lv[t].steps[lv[t].steps.length - 1]).indexOf(String(LEV[k][i])) >= 0, t + ' 풀이 단계 끝 = 답'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === String(EXIT[k][i]), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXIT[k][i]); nCheck++; });
  if (k === 'u4_l01') sl[1].data.items.forEach((x, i) => { ok(String(x.a) === REVIEW1[i], '되짚기 ' + x.a); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === ADV[k], '넓히기 끝 ' + last + ' ≠ ' + ADV[k]); nCheck++; }));
T('다시 셈한 정답 = 93(기본 30 · 수준별 20 · 출구 30 · 넓히기 10 · 되짚기 3)', () => ok(nCheck === 93, nCheck));
T('셈기 자체 확인 — 간단한 비 · □ · 비례배분 · 외항·내항 조사 · 틀린 답 잡음', () => {
  ok(gSimp('2.1', '5.6') === '3：8' && gSimp('1/6', '1/4') === '2：3' && gSimp('0.7', '2/5') === '7：4' && gSimp('3/4', '0.8') === '15：16' && gSimp('1.4', '1 1/5') === '7：6', '간단한 비');
  ok(gSolve([8, 6, 12, null]) === '9' && gSolve([4, null, 1, 25]) === '100' && gSolve(['2/3', 2, 5, null]) === '15' && gSolve([null, '1/6', 18, '1/2']) === '6', '□');
  ok(gDist(9, 2, 1, 0) === 6 && gDist(420, 3, 4, 1) === 240 && gDist(500000, 7, 3, 1) === 150000, '비례배분'); ok(gOuter([8, 5, 16, 10]) === '8과 10' && gInner([48, 32, 3, 2]) === '32와 3' && gOuter([9, 11, 18, 22]) === '9와 22', '조사');
  ok(gIsProp(['5', '2', '10', '4']) && !gIsProp(['7', '14', '6', '13']), '비례식 판정');
  let c = 0; try { want({ input: 'count_input', answer: 10, note: '**10**' }, gSolve([8, 6, 12, null])); } catch (e) { c++; } try { want({ options: [{ text: '21：56', correct: true }, { text: '3：8' }], note: '**21：56**' }, gSimp('2.1', '5.6')); } catch (e) { c++; }
  try { want({ options: [{ text: '3：8', correct: true }, { text: '21：56' }, { text: '8：3' }], note: '**3：8**' }, '3：8'); } catch (e) { c++; } ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 글 속 식 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
KEYS.forEach(k => L[k].extras.forEach(e => allStr.push([e.content || e.description || '', k + '.extras.' + e.id])));
const NUM = '(?:\\d+ \\d+/\\d+|\\d+/\\d+|\\d+(?:\\.\\d+)?)';
const EQ = new RegExp('(?<![\\d./])(' + NUM + '(?: [+−×÷] ' + NUM + ')+) = (' + NUM + ')(?![\\d./]| [+−×÷] |：)', 'g');
const PROP = new RegExp('(?<![\\d./])(' + NUM + ')：(' + NUM + ') = (' + NUM + ')：(' + NUM + ')(?![\\d./])', 'g');
const CHAIN = new RegExp('(' + NUM + ')：(' + NUM + ')(?: → [^：]*?)? → (?:[×÷] ' + NUM + ' → )?(' + NUM + ')：(' + NUM + ')', 'g');
let nEq = 0, nProp = 0, nChain = 0; const badEq = [];
const evq = (s) => { const tk = s.match(/\d+ \d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[+−×÷]/g); const vals = [qp(tk[0])], ops = [];
  for (let i = 1; i < tk.length; i += 2) { const op = tk[i], v = qp(tk[i + 1]); if (op === '×') vals[vals.length - 1] = qm(vals[vals.length - 1], v); else if (op === '÷') vals[vals.length - 1] = qd(vals[vals.length - 1], v); else { ops.push(op); vals.push(v); } }
  let r = vals[0]; ops.forEach((op, i) => { r = op === '+' ? qa(r, vals[i + 1]) : qs(r, vals[i + 1]); }); return r; };
const FALSE_MARK = /아니|아닐|달라|다른|틀|어긋|오류|덧셈|더한|더하|\?/;
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m;
  EQ.lastIndex = 0; while ((m = EQ.exec(s))) { nEq++; if (!qeq(evq(m[1]), qp(m[2]))) badEq.push(where + ' 「' + m[0] + '」'); }
  PROP.lastIndex = 0; while ((m = PROP.exec(s))) { const after = s.slice(m.index + m[0].length, m.index + m[0].length + 40), before = s.slice(Math.max(0, m.index - 24), m.index); if (FALSE_MARK.test(after) || /틀린|잘못/.test(before)) continue; nProp++; if (!gIsProp([m[1], m[2], m[3], m[4]])) badEq.push(where + ' 비례식 「' + m[0] + '」'); }
  CHAIN.lastIndex = 0; while ((m = CHAIN.exec(s))) { nChain++; if (!qeq(qd(qp(m[1]), qp(m[2])), qd(qp(m[3]), qp(m[4])))) badEq.push(where + ' 사슬 「' + m[0] + '」'); } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$/.test(where) || /\.fig\./.test(where)) return; if (/\.options\./.test(where)) { const b0 = PROP.lastIndex; const s2 = String(s).replace(/：/g, ':'); eqText(s2, where); return; } eqText(s, where); });
let nProdTab = 0;
KEYS.forEach(k => L[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; const where = k + ' ' + s.id + ' 그림';
  if (f.k === 'rtab' && SAME(f.head, ['외항의 곱', '내항의 곱'])) { f.rows.forEach(r => { const t = propOf(r.name); const v = t.map(qp); ok(qeq(qm(v[0], v[3]), qp(r.v[0])) && qeq(qm(v[1], v[2]), qp(r.v[1])), where + ' 곱 표 ' + r.name); nProdTab++; }); return; }
  if (s.block === 'basic_problem' && s.data.options) { eqText(figText(f).replace(/：/g, ':'), where); return; }   // 보기 그대로인 후보 카드 — 거짓 비례식이 섞여 있다
  eqText(figText(f), where); }));
T('글·그림 속 「… = …」 식 다시 셈 (' + nEq + ') · 비례식 참 (' + nProp + ') · 비율 사슬 (' + nChain + ') · 외항·내항 곱 표 (' + nProdTab + ') 틀림 0 · 식 ≥ 60 · 비례식 ≥ 25 · 사슬 ≥ 8 · 곱 표 ≥ 3', () => ok(!badEq.length && nEq >= 60 && nProp >= 25 && nChain >= 8 && nProdTab >= 3, 'nEq ' + nEq + ' nProp ' + nProp + ' nChain ' + nChain + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식·거짓 비례식·비율 깨진 사슬 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['9 × 2/3 = 5', '5：7 = 10：15 입니다', '2.1：5.6 → × 10 → 21：50'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음 ' + (badEq.length - b0));
  badEq.length = b0; eqText('1200 × 3/8 = 450 · 500000 × 3/10 = 150000 · 8：5 = 16：10 · 0.7：0.4 → × 10 → 7：4 · 2：5 = 4：15는 비례식이 아니에요', 'probeOK'); ok(badEq.length === b0, '맞는 식을 틀렸다고 함 ' + badEq.slice(b0).join(' | ')); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s]); }));
const nG = { render: 0, rtabQ: 0, lbar: 0, lbarSum: 0 };
const leaves = (f) => (f.k === 'panels' ? (f.items || []).map(x => x.fig) : [f]);
function checkFig(w0, f, b, s) {
  const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); nG.render++;
  leaves(f).forEach(x => {
    if (x.k === 'rtab' && x.q) { const t = docOf(FIG.render(x)); const qs2 = t.querySelectorAll('td.q'); ok(qs2.length === x.q.length && [...qs2].every(td => td.textContent === '?'), w0 + ' ? 칸'); nG.rtabQ++;
      if (b === 'basic_problem' && s.data.input === 'count_input') ok(x.q.length === 1 && String(x.rows[x.q[0][0]].v[x.q[0][1]]) === String(s.data.answer), w0 + ' ? 칸 값 ≠ 정답');
      if (b === 'basic_problem') ok(t.body.textContent.indexOf(String(s.data.answer || '@@')) < 0 || x.q.length, w0 + ' 답 보임'); }
    if (x.k === 'lbar') { nG.lbar++; x.rows.forEach(r => { if (!r.join) return; const tot = (String(r.lb).match(/^(\d+)/) || [])[1]; const nums = r.segs.map(g => { const m = String(g.lb).match(/(?:^|\s)(\d+)(?:\s?[a-zA-Z가-힣]*)?$/); return m && !/\//.test(g.lb) ? +m[1] : null; });
      if (tot && nums.every(v => v !== null)) { ok(nums.reduce((a, v) => a + v, 0) === +tot, w0 + ' 띠의 수 합 ' + nums.join('+') + ' ≠ ' + tot); r.segs.forEach((g, i) => ok(qeq(Q(g.cm * nums[0], 1), Q(r.segs[0].cm * nums[i], 1)), w0 + ' 띠 길이 비 ≠ 수의 비')); nG.lbarSum++; } }); }
  });
}
T('그림 ' + figs.length + '개 — 렌더 · rtab ? 칸 · lbar 띠 합·비', () => figs.forEach(([w0, f, b, s]) => checkFig(w0, f, b, s)));
T('문제 그림이 답을 그리지 않음 — 수를 묻는 문제는 그림에 ? 또는 □ · 보기 문제는 정답 보기가 그림에 없음(보기에서 고르는 문제·한 글자 보기만 예외)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, t = figText(d.fig);
  if (d.input === 'count_input') ok(/\?|□/.test(t), k + ' ' + s.id + ' 그림에 ? 없음');
  else { const cor = clean(d.options.find(o => o.correct).text), allShown = d.options.every(o => t.indexOf(clean(o.text)) >= 0); if (!allShown && cor.length > 1) ok(t.indexOf(cor) < 0, k + ' ' + s.id + ' 정답 「' + cor + '」이 그림에 보임'); } })));
T('그림 부품 수 — 렌더 ≥ 70 · rtab ? 칸 ≥ 4 · lbar ≥ 12 · 띠 합 검사 ≥ 3', () => ok(nG.render >= 70 && nG.rtabQ >= 4 && nG.lbar >= 12 && nG.lbarSum >= 3, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 띠 합 · ? 칸 값 어긋남 잡음', () => { let c = 0; const tr = (fn) => { try { fn(); } catch (e) { c++; } };
  tr(() => checkFig('probe', { k: 'lbar', rows: [{ join: true, name: '떡', segs: [{ cm: 2, lb: '리엘 6' }, { cm: 1, lb: '동생 4' }], lb: '9개' }] }, 'concept'));
  tr(() => checkFig('probe', { k: 'rtab', head: ['a', 'b'], rows: [{ name: 'x', v: ['2', '1'] }, { name: 'y', v: ['4', '3'] }], q: [[1, 1]] }, 'basic_problem', { data: { input: 'count_input', answer: 2 } }));
  tr(() => checkFig('probe', { k: 'lbar', rows: [{ join: true, name: '떡', segs: [{ cm: 2, lb: '리엘 6' }, { cm: 1, lb: '동생 3' }], lb: '9개' }] }, 'concept'));   // 통과해야 함
  ok(c === 2, '잡은 수 ' + c); });

console.log('═══ H. 교과서 충실 ═══');
/* 교과서 비 표 — 『수학』 77~98 · 『수학익힘』 55~70 · 지도서 251~296(수업 전 확인 문제·읽기 자료·이론적 배경) 에 있는 비와, 그 비를 간단히 하거나 교과서가 적은 대로 늘린 비 */
const ANCHOR = {
  '2：1': '77~79 비눗방울 용액·96 마무리 2(54：27)', '4：2': '79 용액 4컵', '3：4': '익힘 55 당근·토마토 · 90~91 정후네·연아네 · 98 찰흙', '6：7': '지도서 267 수업 전(7에 대한 6의 비)', '10：3': '지도서 267 수업 전',
  '9：20': '지도서 267 수업 전', '27：15': '지도서 267 수업 전', '2：3': '80 꽃다발 · 82 분수의 비 1/6：1/4 · 92 섬', '4：6': '80 꽃다발 2개', '6：9': '80 꽃다발 3개 · 지도서 277 오류 유형', '7：2': '81 문제 2', '35：10': '81 문제 2',
  '12：20': '81 문제 2 · 지도서 275 수업 전', '3：5': '81 문제 2 · 90~91 용돈 학용품：장난감(3：2) 반대 아님 — 남학생：여학생(지도서 289)', '45：18': '81 문제 3', '5：2': '81 문제 3 · 96 마무리 1(35：14) · 98 마무리 7(1500：600)', '90：36': '81 문제 3 예',
  '6：4': '익힘 57 5번', '12：8': '익힘 57 5번', '8：6': '익힘 57 5번(잘못된 방법) · 86 8：6 = 12：□', '3：2': '익힘 57 5번 · 84 48：32 = 3：2 · 94 사용료 12000：8000 · 90 용돈', '16：9': '익힘 57 6번 화면', '4：3': '익힘 57 6번 가 화면 · 85 퀴즈 4', '20：15': '익힘 57 6번 나', '32：18': '익힘 57 6번 다',
  '16：10': '지도서 269 범교과 화면 · 84 확대한 후 사진', '2.1：5.6': '82 해바라기씨', '21：56': '82', '3：8': '82', '1/6：1/4': '82', '28：63': '83 문제 3', '4：9': '83', '0.8：0.4': '83', '2.5：3': '83', '5：6': '83 · 96 마무리 3', '2/3：3/7': '83', '14：9': '83',
  '0.7：2/5': '83 문제 4', '0.7：0.4': '83 문제 4', '7/10：2/5': '83 문제 4', '7：4': '83 문제 4', '1.4：1 1/5': '익힘 59 5번', '1.4：1.2': '지도서 273 풀이', '14：12': '지도서 273 풀이', '7：6': '익힘 59 5번', '0.1：0.8': '익힘 59 6번 희우', '3/40：3/5': '익힘 59 6번 준기', '1：8': '익힘 59 6번', '3：24': '지도서 273 풀이',
  '8：5': '84 철새 사진', '7：9': '84 문제 2', '14：18': '84 문제 2', '48：32': '84 문제 2', '56：21': '85 문제 3', '8：3': '85 문제 3', '6：8': '85 퀴즈 4 · 익힘 61 5번', '1/8：1/20': '85 퀴즈 4', '1/9：1/12': '85 퀴즈 4', '1.4：3.5': '85 퀴즈 4', '2：5': '85 퀴즈 4 · 익힘 61 6번',
  '4：15': '익힘 61 6번', '6：3': '익힘 61 6번', '24：12': '익힘 61 6번', '9：12': '익힘 61 5번 · 87 퀴즈 3', '9：11': '지도서 279 수업 전', '18：22': '지도서 279 수업 전', '5：7': '86 태양 고도 · 96 마무리 2(3.5：4.9)', '10：14': '86',
  '12：9': '86 8：6 = 12：9', '10：4': '87 퀴즈 3', '7：14': '87 퀴즈 3', '6：13': '87 퀴즈 3', '13：8': '87 퀴즈 3', '10：8': '87 퀴즈 4', '15：12': '87 퀴즈 4', '3：11': '87 퀴즈 4 · 96 마무리 1', '21：28': '익힘 63 6번', '3：7': '익힘 63 6번', '14：8': '익힘 63 5번',
  '7：22': '지도서 283 수업 전', '500：40': '지도서 283 수업 전', '150：12': '지도서 283 수업 전', '2：8000': '88 쌀', '8000：40000': '지도서 283 유의', '6：40': '89 전기차', '2.5：15': '89 첨성대', '1：6': '89 첨성대', '1：1.5': '지도서 284 유의', '57000：300': '익힘 65 7번 환전',
  '4：48': '익힘 65 6번', '1：1.2': '지도서 285 읽기 자료(탈레스)', '5：3': '지도서 287 수업 전 직사각형', '9：4': '98 마무리 8', '7：3': '94 수익 회사：사용자', '12000：8000': '94 사용료', '4：2': '94 그림 수', '7：5': '익힘 67 5번 운동', '9：7': '익힘 67 6번 철사', '1500：600': '98 마무리 7',
  '54：27': '96 마무리 2', '3.5：4.9': '96 마무리 2', '1/3：3/11': '96 마무리 2', '11：9': '96 마무리 2', '3/4：0.8': '96 마무리 2', '0.75：0.8': '지도서 295 풀이', '75：80': '지도서 295 풀이', '15：16': '96 마무리 2', '3/4：4/5': '지도서 295 풀이(0.8 = 4/5)',
  '8：7': '96 마무리 3', '2.4：2.1': '96 마무리 3', '1/5：1/6': '96 마무리 3', '4：5': '96 마무리 4', '20：25': '96 마무리 4', '36：9': '96 마무리 4', '8：2': '96 마무리 4', '3：14': '96 마무리 4', '12：56': '96 마무리 4', '15：24': '97 마무리 5', '4：7': '지도서 279 수업 전', '2.8：4.9': '지도서 279 수업 전', '14：21': '지도서 279 수업 전',
  '3：15': '92 섬', '30：36': '92 섬', '15：18': '지도서 291 풀이', '0.6：1.8': '92 섬', '2.4：18': '92 섬', '0.4：3': '92 섬', '8：4': '92 섬(8：□ = 2：1)', '27：9': '92 섬(27：□ = 1：1/3)', '2/5：2/9': '92 섬', '9：5': '92 섬(□：5)', '1：1/3': '92 섬', '18：1/2': '92 섬', '2/3：2': '92 섬', '5：15': '92 섬', '6：30': '92 섬', '3：9': '92 섬', '6：1/6': '92 섬',
  '9：33': '96 마무리 1', '35：14': '96 마무리 1', '0：0': '지도서 268(0을 곱하면 0：0)', '20：9': '지도서 269 범교과 화면', '1：1': '82 분수의 비 1/6：1/4 — 분자끼리 쓰면 안 되는 예', '25：30': '83 문제 3 풀이(2.5：3 × 10)', '1：25': '87 퀴즈 4(4：□ = 1：25)', '2：180': '지도서 287 수업 전(떡볶이 2인분 180 g)'
};
const RAT = new RegExp('(' + NUM + ')：(' + NUM + ')', 'g');
const textOf = (k) => { const out = []; L[k].slides.forEach(s => { const d = s.data; (function walk(o, kk) { if (typeof o === 'string') { if (kk !== 'img' && kk !== 'wrong' && kk !== 'watch') out.push(o); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'options') return; walk(o[x], x); }); })(d, ''); if (d.fig) out.push(figText(d.fig)); }); L[k].extras.forEach(e => out.push(e.title + ' ' + (e.content || ''))); return out.join(' \n '); };
const anchorKeys = new Set(Object.keys(ANCHOR).filter(x => ANCHOR[x] && !/ = /.test(x)));
T('글·그림에 쓴 비(a：b)는 모두 교과서 비 표(ANCHOR — 쪽 표시) 안 — 지어낸 비 0 (보기 오답은 셈한 오개념 비라 뺌)', () => { const miss = new Set(); KEYS.forEach(k => { const t = textOf(k).replace(/\*\*/g, ''); let m; RAT.lastIndex = 0; while ((m = RAT.exec(t))) { const r = m[1] + '：' + m[2]; if (!anchorKeys.has(r)) miss.add(k + ' ' + r); } }); ok(!miss.size, [...miss].slice(0, 12).join(' | ')); });
T('교과서 비 표의 짝 대조 — 교과서가 같다고 한 비끼리 비율이 같음', () => { [['2：1', '4：2'], ['2：3', '4：6'], ['2：3', '6：9'], ['7：2', '35：10'], ['12：20', '3：5'], ['45：18', '5：2'], ['45：18', '90：36'], ['16：9', '32：18'], ['2.1：5.6', '3：8'], ['1/6：1/4', '2：3'], ['28：63', '4：9'], ['0.8：0.4', '2：1'], ['2.5：3', '5：6'], ['2/3：3/7', '14：9'], ['0.7：2/5', '7：4'], ['1.4：1 1/5', '7：6'], ['0.1：0.8', '1：8'], ['3/40：3/5', '1：8'], ['8：5', '16：10'], ['56：21', '8：3'], ['4：3', '1/9：1/12'], ['2：5', '1.4：3.5'], ['6：8', '9：12'], ['2.5：15', '1：6'], ['12000：8000', '3：2'], ['4：2', '2：1'], ['1500：600', '5：2'], ['54：27', '2：1'], ['3.5：4.9', '5：7'], ['1/3：3/11', '11：9'], ['3/4：0.8', '15：16'], ['8：7', '2.4：2.1'], ['4：7', '2.8：4.9'], ['3：11', '9：33'], ['35：14', '5：2']].forEach(([a, b]) => ok(qeq(gRatioOf(a), gRatioOf(b)), a + ' ≠ ' + b)); });
T('교과서 열쇠 수 — 글에 교과서 값이 그대로(3：8 · 2：3 · 7：4 · 15：16 · 8：7 = 2.4：2.1 · 140 · 9 m · 6000 · 150000 · 90000 · 27 · 240 · 25)', () => { const all = clean(KEYS.map(textOf).join(' ')); ['3：8', '2：3', '7：4', '15：16', '8：7 = 2.4：2.1', '140', '9(m)', '6000', '150000', '90000', '27개', '240', '25장', '5：7 = 10：14', '8：5 = 16：10'].forEach(t => ok(all.indexOf(t) >= 0, t)); });
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question + JSON.stringify(s.data.fig)).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object/.test(r.body), s.id + ' 깨진 글');
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재 · 갈래 수(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·점검1)', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용'));
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt)); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」 · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach((x, i) => qs.push([k + ' 출구' + (i + 1), x.q])); qs.push([k + ' 동기', sl[2].data.question]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 5단원 원의 둘레와 넓이 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u4_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /원의 둘레와 넓이/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null }))) + JSON.stringify(L[k].slides.filter(s => s.data.fig && s.block !== 'next_lesson').map(s => figText(s.data.fig))) + JSON.stringify(L[k].extras);
const FIRST = [['비례식', 4], ['외항', 4], ['내항', 4], ['비례식의 성질', 5], ['비례배분', 7]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));
T('선행 검사기 자체 확인', () => { ok(teach('u4_l03').indexOf('비례식') < 0, 'l03 깨끗'); ok(teach('u4_l06').indexOf('비례배분') < 0, 'l06 깨끗'); ok(teach('u4_l09').indexOf('비례배분') >= 0, 'l09 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 곰이·펭이 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b)); ok(!/(^|[^달])곰이|펭이/.test(all), '곰이·펭이'); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면에 영어 차시 코드(u4_l03·L03 꼴) 0', () => KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const txt = docOf(r.body).body.textContent + ' ' + (r.cover || ''); ok(!/\bu\d_l\d\d\b|\bL\d\d\b|\bl\d\d\b/.test(txt.replace(/<[^>]+>/g, '')), k + ' ' + s.id); }))));

console.log('\n게이트 g6s2 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
