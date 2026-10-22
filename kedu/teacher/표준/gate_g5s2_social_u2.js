/* gate_g5s2_social_u2.js — 5학년 2학기 사회 2단원 「달라지는 시대, 변화하는 생활 모습」 케이티처 2세대 게이트 (170차, 베프 — u1 게이트 틀 복제 · u2_l01 단원 도입 · u2_l02 유교를 바탕으로 건국한 조선).
   지도서 직행(자기주도 원문 없음) — T 표 자체 규칙을 잰다. 역사 원칙: 인과 중심 · 연도 묻기 0 · s15 = 「그날의 선택」.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계
   G 역사 원칙(연도·숫자 연대 0 · 그날의 선택 = 고르기 둘 → 그때 실제로는 → 다음 이야기) · H 선행 용어 · I 실렌더 · J 차단 어휘 · K 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_social_u2.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_social_u2.js'));
const KEYS = ['u2_l01', 'u2_l02'];
const COV = { u2_l01: [1, 1], u2_l02: [2, 3] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '달라지는 시대, 변화하는 생활 모습';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });


console.log('═══ A. 로드·meta ═══');
T('키 = 지도서 1·2~3차시', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 사회 · unit 2 · 단원명 · n·covers·분 = 지도서 차시 · [6사05-0x] · 목표·교과서 쪽', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers'); ok(/^(\[6사05-0[12]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4 && /^p\.\d/.test(m.textbook), k + ' 목표·쪽'); }));
T('topic: 1주제(l01~l07) = 유교 문화의 영향으로 달라진 조선 사회 · [6사05-01]', () => KEYS.forEach(k => { if (L[k].meta.n <= 7) ok(L[k].meta.topic === '유교 문화의 영향으로 달라진 조선 사회' && L[k].meta.std === '[6사05-01]', k); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
KEYS.forEach(k => T(k + ' extras — 장이 가리키는 id 모두 있음 · id 겹침 0', () => { const ids = L[k].extras.map(e => e.id); ok(new Set(ids).size === ids.length, '겹침'); L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x => ok(ids.indexOf(x) >= 0, s.id + ' ' + x))); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length), '④활동(1인 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));

console.log('═══ D. 복습 계보 ═══');
T('u2_l01 = 단원 첫 차시(from 비움 · 회상 셋 = 지난 단원 고려 → 마지막 답 조선)', () => { const rv = L.u2_l01.slides[1].data; ok(rv.from === '' && rv.items.length === 3 && rv.items[2].a === '조선' && rv.items[0].a === '불교', rv.from); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data, ex = L[KEYS[i]].slides[15].data.items;
  ok(rv.from === 'g5s2_social:' + KEYS[i], 'from ' + rv.from); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('수준별 세 계단 각 문항·답 있음 · 심화 = 열린 답', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; Object.entries(lv).forEach(([n, x]) => ok(x && x.q && x.a, k + ' 계단 ' + n)); ok(lv.심화.open, k + ' 심화 open'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 120 (지금까지 3차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 120, n); });

console.log('═══ G. 역사 원칙 ═══');
T('연도·연대 숫자 0 (○○년·기원전·세기 — 교사 메모 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k].slides); ok(!/\d+\s*(만\s*)?년|기원전|기원후|세기/.test(s), k + ' ' + (s.match(/.{12}(\d+\s*(만\s*)?년|기원전|기원후|세기).{8}/) || [''])[0]); }));
T('문제·출구에 「언제」 묻기 0', () => KEYS.forEach(k => L[k].slides.filter(s => /basic_problem|exit_ticket|leveled_problem/.test(s.block)).forEach(s => ok(!/언제|몇 년|연도/.test(JSON.stringify(s.data)), k + ' ' + s.id))));
KEYS.forEach(k => T(k + ' s15 그날의 선택 = 상황 · ①② 고르기 · 그때 실제로는 · 다음 이야기', () => { const d = L[k].slides[14].data;
  ok(d.title === '그날의 선택', d.title); ok(d.context && d.context.length > 30, 'context'); ok(/①[^②]+②/.test(d.challenge) && /까닭/.test(d.challenge), 'challenge');
  ok(/^그때 실제로는:/.test(d.note) && /→ 다음 이야기:/.test(d.note), 'note'); }));
T('그날의 선택 「다음 이야기」 → 다음 차시 주제로 이어짐', () => { ok(/\*\*유교\*\*/.test(L.u2_l01.slides[14].data.note) && /조선/.test(L.u2_l01.slides[14].data.note) && /\*\*유교를 바탕으로 건국한 조선\*\*/.test(L.u2_l01.slides[18].data.preview) && L.u2_l02.meta.title === '유교를 바탕으로 건국한 조선', 'l01→l02'); ok(/\*\*유교 질서\*\*/.test(L.u2_l02.slides[14].data.note) && /\*\*유교 질서에 따른 조선 사회의 모습\*\*/.test(L.u2_l02.slides[18].data.preview), 'l02→l04'); });
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음', () => KEYS.forEach(k => { const a = L[k].slides[16].data.arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); }));
T('l01 지도서 핵심(160~162쪽): 축제 그림 → 두 주제 · 중요 낱말(유교·조선 후기·사회 변화) · 미션 = 사라진 동생 · 실마리 셋 · 파란 옷·혼례·서당 → 서당 체험관 · 오개념 = 고려와 같다(불교 → 유교) · 탐구 질문 「왜·어떻게」', () => { const d = L.u2_l01.slides, s = txt(L.u2_l01); ok(/유교 문화 축제/.test(d[2].data.scene_title) && /혼례·과거·서당·활쏘기/.test(d[2].data.desc), '동기 = 축제'); ok(/\*\*유교 문화의 영향으로 달라진 조선 사회\*\*/.test(d[4].data.content) && /\*\*조선 후기 사회 변화와 달라진 생활 모습\*\*/.test(d[4].data.content), '두 주제'); ok(/사라진 동생/.test(d[5].data.title) && d[5].data.fig.items.length === 3, '미션·실마리 셋'); ok(/과거를 감독하는 관리/.test(d[6].data.content) && /혼례 체험/.test(d[6].data.content) && /\*\*서당 체험관\*\*/.test(d[6].data.content), '가족의 말'); ok(d[10].data.options.filter(o => o.correct)[0].text === '서당 체험관', '기본 ③ = 서당'); ok(d[8].data.options.filter(o => o.correct)[0].text === '유교' && d[8].data.options.some(o => o.text === '불교'), '기본 ① 유교(불교 함정)'); ok(d[9].data.options.filter(o => o.correct).length === 3, '중요 낱말 셋'); ok(/고려/.test(d[7].data.wrong) && /유교/.test(d[7].data.right), '오개념'); ok(/왜·어떻게/.test(s), '탐구 질문'); ok(L.u2_l01.meta.textbook === 'p.70~75', '쪽'); });
T('l02 지도서 핵심(168~171쪽): 동기 = 「노상알현도」 장면(나귀·허리 굽혀 인사) · 고려 말 외적의 잦은 침입·지배층의 횡포·불교의 부패 → 이성계·일부 신진 사대부 → 조선 · 한양(한강 북쪽)·인의예지·흥인지문 인·돈의문 의·숭례문 예 · 까닭 = 유교의 가르침을 널리 알리려고 · 충성·효도·질서·믿음·역할에 맞게 · 성균관(한양 최고)·향교(지방)·서원·서당 → 배운 백성이 점차 늘어남 · 오개념 = 향교 ≠ 최고(꼭 기억해요 3) · 기본 ① 이성계(꼭 기억해요 1) ③ 유교(꼭 기억해요 2) · 그날의 선택 = 근정전 박석·어도', () => { const d = L.u2_l02.slides, s = txt(L.u2_l02); ok(/나귀를 탄 사람/.test(d[2].data.desc) && /허리를 깊이 굽혀/.test(d[2].data.desc), '동기'); ok(/\*\*외적의 잦은 침입\*\*/.test(s) && /\*\*지배층의 횡포\*\*/.test(s) && /\*\*불교의 부패\*\*/.test(s) && /\*\*이성계\*\*/.test(s) && /\*\*신진 사대부\*\*/.test(s), '건국 배경'); ok(/\*\*한양\*\*\(오늘날 서울의 한강 북쪽\)/.test(s) && /\*\*인의예지\*\*/.test(s) && ['흥인지문', '돈의문', '숭례문'].every(x => d[4].data.fig.items.some(i => i.name === x)) && /널리 알리려고/.test(d[4].data.content), '한양·덕목'); ok(/충성·효도·질서·믿음/.test(d[5].data.content) && /\*\*자신의 역할에 맞게\*\*/.test(d[5].data.content), '기본 정신'); ok(['성균관', '향교', '서원', '서당'].every(x => d[6].data.fig.items.some(i => i.name === x)) && /점차 늘어났어요/.test(d[6].data.content), '교육 기관'); ok(/향교/.test(d[7].data.wrong) && /성균관/.test(d[7].data.right), '오개념 = 꼭 기억해요 3'); ok(d[8].data.options.filter(o => o.correct)[0].text === '이성계' && d[10].data.options.filter(o => o.correct)[0].text === '유교', '기본 ①③'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => o.text === '숙정문' && !o.correct), '기본 ② 숙정문 함정'); ok(/근정전/.test(d[14].data.context) && /박석/.test(d[14].data.note) && /어도/.test(d[14].data.note), '그날의 선택 = 근정전 박석'); ok(L.u2_l02.meta.textbook === 'p.76~81' && L.u2_l02.meta.duration_min === 80, '쪽·80분'); });

console.log('═══ H. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['유교', /유교/, 'u2_l01'], ['조선 후기', /조선 후기/, 'u2_l01'], ['서당', /서당/, 'u2_l01'], ['혼례', /혼례/, 'u2_l01'], ['이성계', /이성계/, 'u2_l02'], ['신진 사대부', /신진 사대부/, 'u2_l02'], ['한양', /한양/, 'u2_l02'], ['인의예지', /인의예지/, 'u2_l02'], ['흥인지문', /흥인지문/, 'u2_l02'], ['숭례문', /숭례문/, 'u2_l02'], ['성균관', /성균관/, 'u2_l02'], ['향교', /향교/, 'u2_l02'], ['서원', /서원/, 'u2_l02'], ['충성', /충성/, 'u2_l02'], ['효도', /효도/, 'u2_l02']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(l01: 이성계·신진 사대부·한양·성균관·향교·양반·중인·상민·삼강행실도·경국대전·세종·훈민정음·임진왜란·병자호란·실학·천주교·동학·개항 · l02: 양반·중인·상민·삼강행실도·경국대전·관혼상제·세종·훈민정음·임진왜란·병자호란·실학·천주교·동학·개항·정몽주·정도전·위화도·과전법·태조·성리학·권문세족·왜구·홍건적)', () => KEYS.forEach(k => { const s = txt(L[k]), re = k === 'u2_l01' ? /이성계|신진 사대부|한양|성균관|향교|양반|중인|상민|삼강행실도|경국대전|세종|훈민정음|임진왜란|병자호란|실학|천주교|동학|개항/ : /양반|중인|상민|삼강행실도|경국대전|관혼상제|세종|훈민정음|임진왜란|병자호란|실학|천주교|동학|개항|정몽주|정도전|위화도|과전법|태조|성리학|권문세족|왜구|홍건적/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{10}(' + re.source + ').{10}')) || [''])[0]); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson = 「다음 시간엔」 · 단원 끝(14차시 단원 마무리) = 「이 단원을 마쳐요」', () => KEYS.forEach(k => ok(L[k].slides[18].data.title === (L[k].meta.n === 14 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ J. 차단 어휘 ═══');
T('결·박음·빵꾸·갈아엎 0 (결정·해결 같은 낱말 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ K. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_social_u2: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
