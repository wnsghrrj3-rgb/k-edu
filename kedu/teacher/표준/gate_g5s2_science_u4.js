/* gate_g5s2_science_u4.js — 5학년 2학기 과학 4단원 「자원과 에너지」 케이티처 2세대 게이트 (189차, 베프 — u3 게이트 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계 440
   G 선행 용어(자원 정의 l02 · 재생 에너지 l03 · 지속가능 l05 · 효율 l06 · 하베스팅 l10 · 에너지 전환·화석연료·패시브·액티브·무한 0 · 효율 1등급 방향) · H 실렌더 · I 차단 어휘 0 · J 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_science_u4.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_science_u4.js'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l03', 'u4_l05', 'u4_l06', 'u4_l08', 'u4_l10'];
const U3 = load(path.join(TDIR, 'data/g5s2_science_u3.js'));
const COV = { u4_l01: [1, 1], u4_l02: [2, 2], u4_l03: [3, 4], u4_l05: [5, 5], u4_l06: [6, 7], u4_l08: [8, 9], u4_l10: [10, 11] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '자원과 에너지';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('7차시 키(3·4 → l03 · 6·7 → l06 · 8·9 → l08 · 10·11 → l10 — 케이학습지 _lesson_map 과 같음)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 과학 · unit 4 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6과08-0N] · 목표 있음', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 4 && m.unit_title === UT && m.subject === '과학' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6과08-0[123]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); }));
T('단원이 [6과08-01]~[6과08-03] 셋을 모두 덮음', () => ['[6과08-01]', '[6과08-02]', '[6과08-03]'].forEach(x => ok(KEYS.some(k => L[k].meta.std.indexOf(x) >= 0), x)));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length), '④활동'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '3단원 u3_l12') + ' 출구', () => { const rv = L[k].slides[1].data;
  const ex = i ? L[KEYS[i - 1]].slides[15].data.items : U3.u3_l12.slides[15].data.items; ok(rv.from === (i ? KEYS[i - 1] : 'g5s2_science:u3_l12'), 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('3단원 마지막 예고 → 4단원 이름', () => ok(/자원과 에너지/.test(U3.u3_l12.slides[18].data.preview), U3.u3_l12.slides[18].data.preview));
T('키 = 케이학습지 _lesson_map 이 건 케이티처 차시 키', () => { const m = JSON.parse(fs.readFileSync(path.resolve(TDIR, '..', 'worksheet/data/_lesson_map.json'), 'utf8')); const want = new Set(); const walk = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o.teacher)) o.teacher.forEach(t => { if (/^g5s2_science\/u4_/.test(t)) want.add(t.split('/')[1]); }); Object.values(o).forEach(walk); }; walk(m); ok(want.size >= 1, '맵 없음'); want.forEach(k => ok(KEYS.indexOf(k) >= 0, '맵 키 ' + k + ' 없음')); });

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
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['재생 에너지', /재생 에너지/, 'u4_l03'], ['지속가능', /지속가능/, 'u4_l05'], ['효율', /효율/, 'u4_l06'], ['하베스팅', /하베스팅/, 'u4_l10']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('자원 = 생활·생산에 이용하는 원료 (l02 정의)', () => ok(/원료를 \*\*자원\*\*/.test(txt(L.u4_l02)), 'l02'));
T('재생 에너지 = 자연에서 얻고 계속 이용 (l03 정의)', () => ok(/계속 이용할 수 있는\*\* 에너지를 \*\*재생 에너지\*\*/.test(txt(L.u4_l03)), 'l03'));
T('재생 에너지 여섯 가지 모두 l03 에', () => ['태양 에너지', '풍력', '수력', '해양 에너지', '지열 에너지', '바이오 에너지'].forEach(x => ok(txt(L.u4_l03).indexOf(x) >= 0, x)));
T('다루지 않는 것 0(에너지 전환·화석연료·패시브·액티브·무한·고갈)', () => KEYS.forEach(k => { const s = txt(L[k]); ok(!/에너지 전환|화석연료|패시브|액티브|무한|고갈/.test(s), k + ' ' + (s.match(/.{10}(에너지 전환|화석연료|패시브|액티브|무한|고갈).{10}/) || [''])[0]); }));
T('효율 등급 방향 = 1등급에 가까울수록 높음 (「5등급이 좋다」는 오개념 wrong 에서만)', () => KEYS.forEach(k => L[k].slides.forEach(s => { const d = Object.assign({}, s.data); delete d.tnote; if (s.block === 'misconception') delete d.wrong; let j = JSON.stringify(d);
  if (s.block === 'basic_problem') j = JSON.stringify(Object.assign({}, d, { options: d.options.filter(o => o.correct) }));
  ok(!/5등급[^"]{0,6}(가장 )?(좋|높)/.test(j), k + ' ' + s.id); })));
T('l06 에 「1등급에 가까울수록」', () => ok(/1등급에 가까울수록/.test(txt(L.u4_l06)), 'l06'));
T('물 오개념 = 총량은 그대로 · 깨끗한 물이 줄어듦 (l02)', () => { const m = L.u4_l02.slides[7].data; ok(/줄지 않/.test(m.wrong) && /깨끗한 물/.test(m.right), 'l02 mis'); });

console.log('═══ H. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson 마지막 = 「이 단원을 마쳐요」, 나머지 = 「다음 시간엔」', () => KEYS.forEach((k, i) => ok(L[k].slides[18].data.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ I. 차단 어휘 ═══');
T('결·결로·박음·빵꾸·갈아엎 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/(^|[^가-힣])결([^가-힣]|$)|결과|결로|박음|빵꾸|갈아엎/.test(s.replace(/결정|해결|연결|결합|결국|결심|마결/g, '')), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ J. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_science_u4: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
