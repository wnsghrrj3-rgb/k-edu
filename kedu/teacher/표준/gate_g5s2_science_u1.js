/* gate_g5s2_science_u1.js — 5학년 2학기 과학 1단원 「혼합물의 분리」 케이티처 2세대 게이트 (155차, 베프).
   지도서 직행(자기주도 원문 없음) 첫 과학 단원 — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계 440
   G 선행 용어(혼합물 l01 은 색칠판 한 곳만 · 거름·증발 l05 부터 · 새활용 l10 부터) · H 실렌더 · I 차단 어휘 0 · J 5학년 인물 0(곰이·펭이·🐻·🐧)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_science_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_science_u1.js'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l07', 'u1_l08', 'u1_l10'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 2], u1_l03: [3, 3], u1_l04: [4, 4], u1_l05: [5, 6], u1_l07: [7, 7], u1_l08: [8, 9], u1_l10: [10, 11] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '혼합물의 분리';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('8차시 키(5·6 → l05 · 8·9 → l08 · 10·11 → l10)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 과학 · unit 1 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6과05-0N] · 목표 있음', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 1 && m.unit_title === UT && m.subject === '과학' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6과05-0[123]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); }));
T('단원이 [6과05-01][6과05-02][6과05-03] 셋을 모두 덮음', () => ['[6과05-01]', '[6과05-02]', '[6과05-03]'].forEach(x => ok(KEYS.some(k => L[k].meta.std.indexOf(x) >= 0), x)));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length), '④활동'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '5-1 「용해와 용액」 회상'), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(/1학기/.test(rv.title) && rv.from === '' && rv.items.length === 3, 'l01'); ok(rv.items.some(x => /용질|용매|용액/.test(x.q + x.a)), '용해 회상'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text).replace(/^\S+\s/, '')) >= 0, s.id + ' 풀이 끝 ' + d.note); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 2', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 2, n); });
T('수준별 세 계단 각 문항·답 있음', () => KEYS.forEach(k => Object.entries(L[k].slides[11].data.levels).forEach(([n, lv]) => ok(lv && lv.q && lv.a, k + ' 계단 ' + n))));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 440 (11차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 440, n); });

console.log('═══ G. 선행 용어 ═══');
const first = (re) => KEYS.findIndex(k => re.test(txt(L[k])));
T('「혼합물」 뜻 — l01 에선 말하지 않고(색칠판에 낱말만) l02 개념 장에서 처음', () => { ok(!/혼합물이라고 해요|혼합물이란|혼합물은 두 가지/.test(txt(L.u1_l01)), 'l01 뜻'); ok(L.u1_l01.slides[6].data.fig && /혼합물/.test(JSON.stringify(L.u1_l01.slides[6].data)), 'l01 색칠판'); ok(/혼합물이란/.test(L.u1_l02.slides[3].data.title) && /혼합물이라고 해요/.test(nb(L.u1_l02.slides[3].data.content)), 'l02 뜻'); });
T('「거름」(장치·방법) 첫 등장 = l05 (예고 장 빼고)', () => { const f = KEYS.findIndex(k => /거름(?!종이|망)/.test(JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))))); ok(KEYS[f] === 'u1_l05', KEYS[f]); });
T('「새활용」 첫 등장 = l10 (예고 장 빼고)', () => { const f = KEYS.findIndex(k => /새활용/.test(JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))))); ok(KEYS[f] === 'u1_l10', KEYS[f]); });
T('이 단원 밖 용어 0(순물질·밀도·끓음·분별 증류)', () => KEYS.forEach(k => ok(!/순물질|밀도|끓는점|분별 증류/.test(txt(L[k])), k)));

console.log('═══ H. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson 마지막 = 「이 단원을 마쳐요」, 나머지 = 「다음 시간엔」', () => KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ I. 차단 어휘 ═══');
T('결·결로·박음·빵꾸·갈아엎 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/(^|[^가-힣])결([^가-힣]|$)|결과|결로|박음|빵꾸|갈아엎/.test(s.replace(/결정|해결|연결|결합|결국|결심|마결/g, '')), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ J. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_science_u1: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
