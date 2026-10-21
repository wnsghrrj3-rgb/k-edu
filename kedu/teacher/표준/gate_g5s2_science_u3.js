/* gate_g5s2_science_u3.js — 5학년 2학기 과학 3단원 「열과 우리 생활」 케이티처 2세대 게이트 (157차, 베프 — u2 게이트 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계 520
   G 선행 용어(온도계 l02 · 전도 l04 · 대류 l05 · 복사 l07 · 단열 l09 · 단열재 l10 · 열평형·분자·플라즈마·진공 0 · 냉기 오개념은 오개념 장에서만) · H 실렌더 · I 차단 어휘 0 · J 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_science_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_science_u3.js'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l07', 'u3_l08', 'u3_l09', 'u3_l10', 'u3_l12'];
const U2 = load(path.join(TDIR, 'data/g5s2_science_u2.js'));
const COV = { u3_l01: [1, 1], u3_l02: [2, 2], u3_l03: [3, 3], u3_l04: [4, 4], u3_l05: [5, 6], u3_l07: [7, 7], u3_l08: [8, 8], u3_l09: [9, 9], u3_l10: [10, 11], u3_l12: [12, 13] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '열과 우리 생활';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('10차시 키(5·6 → l05 · 10·11 → l10 · 12·13 → l12)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 과학 · unit 3 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6과07-0N] · 목표 있음', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '과학' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6과07-0[1234]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); }));
T('단원이 [6과07-01]~[6과07-04] 넷을 모두 덮음', () => ['[6과07-01]', '[6과07-02]', '[6과07-03]', '[6과07-04]'].forEach(x => ok(KEYS.some(k => L[k].meta.std.indexOf(x) >= 0), x)));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length), '④활동'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2단원 u2_l10') + ' 출구', () => { const rv = L[k].slides[1].data;
  const ex = i ? L[KEYS[i - 1]].slides[15].data.items : U2.u2_l10.slides[15].data.items; ok(rv.from === (i ? KEYS[i - 1] : 'g5s2_science:u2_l10'), 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('2단원 마지막 예고 → 3단원 이름', () => ok(/열과 우리 생활/.test(U2.u2_l10.slides[18].data.preview), U2.u2_l10.slides[18].data.preview));

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
T('분 합계 = 520 (13차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 520, n); });

console.log('═══ G. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['온도계', /온도계/, 'u3_l02'], ['전도', /전도/, 'u3_l04'], ['대류', /대류/, 'u3_l05'], ['복사', /복사/, 'u3_l07'], ['단열', /단열/, 'u3_l09'], ['단열재', /단열재/, 'u3_l10']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(열평형·분자·플라즈마·진공·비열·열전도율 · 핵융합은 연구원 이름만)', () => KEYS.forEach(k => { const s = txt(L[k]); ok(!/열평형|분자|플라즈마|진공|비열|열전도율/.test(s), k + ' ' + (s.match(/.{10}(열평형|분자|플라즈마|진공|비열|열전도율).{10}/) || [''])[0]); ok(!/핵융합(?!에너지연구원)/.test(s), k + ' 핵융합'); }));
T('「냉기」는 오개념 장(wrong·hint)·오개념 발문에서만', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'misconception') return; const d = Object.assign({}, s.data); delete d.tnote; ok(!/냉기/.test(JSON.stringify(d)), k + ' ' + s.id); })));
T('열의 이동 방향 = 높은 → 낮은 (「낮은 물체에서 높은 물체로」는 틀린 보기에서만)', () => KEYS.forEach(k => L[k].slides.forEach(s => { const d = Object.assign({}, s.data); delete d.tnote; let j = JSON.stringify(d);
  if (s.block === 'basic_problem') j = JSON.stringify(Object.assign({}, d, { options: d.options.filter(o => o.correct) }));
  ok(!/낮은 물체에서[^"]{0,6}높은 물체로/.test(j), k + ' ' + s.id); })));
T('복사 = 빛에 의해 (l07 정의)', () => ok(/빛에 의해 열이 이동하는 방식을 \*\*복사\*\*/.test(txt(L.u3_l07)), 'l07'));
T('단열 = 열의 이동을 막는 것 (l09 정의)', () => ok(/열의 이동을 막는 것\*\*을 \*\*단열\*\*/.test(txt(L.u3_l09)), 'l09'));

console.log('═══ H. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson 마지막 = 「이 단원을 마쳐요」, 나머지 = 「다음 시간엔」', () => KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ I. 차단 어휘 ═══');
T('결·결로·박음·빵꾸·갈아엎 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/(^|[^가-힣])결([^가-힣]|$)|결과|결로|박음|빵꾸|갈아엎/.test(s.replace(/결정|해결|연결|결합|결국|결심|마결/g, '')), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ J. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_science_u3: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
