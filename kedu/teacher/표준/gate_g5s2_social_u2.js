/* gate_g5s2_social_u2.js — 5학년 2학기 사회 2단원 「달라지는 시대, 변화하는 생활 모습」 케이티처 2세대 게이트 (170차, 베프 — u1 게이트 틀 복제 · u2_l01 단원 도입 · u2_l02 유교를 바탕으로 건국한 조선 · 171차 u2_l04 유교 질서에 따른 조선 사회의 모습 · 172차 u2_l06 조선의 발전에 따른 사람들의 생활 모습 · 173차 u2_l07 조선과 주변 나라들의 관계 · 1주제 마무리 · 174차 u2_l08 조선 후기의 경제적 변화 · 2주제 시작 · 175차 u2_l09 조선 후기 달라진 사회 모습).
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
const KEYS = ['u2_l01', 'u2_l02', 'u2_l04', 'u2_l06', 'u2_l07', 'u2_l08', 'u2_l09'];
const COV = { u2_l01: [1, 1], u2_l02: [2, 3], u2_l04: [4, 5], u2_l06: [6, 6], u2_l07: [7, 7], u2_l08: [8, 8], u2_l09: [9, 9] };
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
T('키 = 지도서 1·2~3·4~5·6·7·8·9차시', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 사회 · unit 2 · 단원명 · n·covers·분 = 지도서 차시 · [6사05-0x] · 목표·교과서 쪽', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers'); ok(/^(\[6사05-0[12]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4 && /^p\.\d/.test(m.textbook), k + ' 목표·쪽'); }));
T('topic: 1주제(l01~l07) = 유교 문화의 영향으로 달라진 조선 사회 · [6사05-01]', () => KEYS.forEach(k => { if (L[k].meta.n <= 7) ok(L[k].meta.topic === '유교 문화의 영향으로 달라진 조선 사회' && L[k].meta.std === '[6사05-01]', k); }));
T('topic: 2주제(l08~l12) = 조선 후기 사회 변화와 달라진 생활 모습 · [6사05-02]', () => KEYS.forEach(k => { const n = L[k].meta.n; if (n >= 8 && n <= 12) ok(L[k].meta.topic === '조선 후기 사회 변화와 달라진 생활 모습' && L[k].meta.std === '[6사05-02]', k); }));

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
T('분 합계 = 360 (지금까지 9차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 360, n); });

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

T('l04 그날의 선택 → 다음 차시 「조선의 발전에 따른 사람들의 생활 모습」', () => ok(/\*\*백성의 생활\*\*/.test(L.u2_l04.slides[14].data.note) && /\*\*조선의 발전에 따른 사람들의 생활 모습\*\*/.test(L.u2_l04.slides[18].data.preview), 'l04→l06'));
T('l04 지도서 핵심(176~180쪽): 동기 = 그림 많은 책(실사 자리 samgang_haengsildo) · 『삼강행실도』 충신·효자·열녀 · 글을 모르는 백성 · 그림 · 『경국대전』 유교 중심 통치 질서 · 일상생활 영향 · 관혼상제(관례·혼례·상례·제례) · 법 = 양인·천인 / 실제 = 양반·중인·상민·천민 · 신분에 맞게 · 오개념 = 여성의 지위 전기 → 후기 낮아짐(꼭 기억해요 2)·삼종지도 · 기본 ① 『삼강행실도』(꼭 기억해요 1 · 『경국대전』 함정) ② 관혼상제 3개(연등회 함정) ③ 중인 · 활동 = 가상 일기(과정 중심 평가) · 실생활 = 궁중떡볶이 · 그날의 선택 = 땅·집 100일 안 관청 신고', () => { const d = L.u2_l04.slides, s = txt(L.u2_l04); ok(/samgang_haengsildo/.test(d[2].data.img) && /\*\*그림\*\*/.test(d[2].data.question), '동기'); ok(/\*\*『삼강행실도』\*\*/.test(d[3].data.content) && /\*\*충신·효자·열녀\*\*/.test(d[3].data.content) && /\*\*글을 모르는 백성\*\*/.test(d[3].data.content), '삼강행실도'); ok(/\*\*『경국대전』\*\*/.test(d[4].data.content) && /\*\*유교 중심\*\*/.test(d[4].data.content) && /\*\*백성의 일상생활\*\*/.test(d[4].data.content), '경국대전'); ok(['관례', '혼례', '상례', '제례'].every(x => d[5].data.fig.items.some(i => i.name === x)) && /\*\*관혼상제\*\*/.test(d[5].data.content), '관혼상제'); ok(/\*\*양인\*\*/.test(d[6].data.content) && /\*\*천인\*\*/.test(d[6].data.content) && ['양반', '중인', '상민', '천민'].every(x => d[6].data.fig.items.some(i => i.name === x)) && /\*\*신분에 맞게\*\*/.test(d[6].data.content), '신분'); ok(/여성/.test(d[7].data.wrong) && /후기로 갈수록 여성의 지위가 낮아졌다/.test(d[7].data.right) && /\*\*삼종지도\*\*/.test(d[7].data.hint), '오개념 = 꼭 기억해요 2'); ok(d[8].data.options.filter(o => o.correct)[0].text === '『삼강행실도』' && d[8].data.options.some(o => o.text === '『경국대전』' && !o.correct), '기본 ①'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => o.text === '연등회' && !o.correct), '기본 ②'); ok(d[10].data.options.filter(o => o.correct)[0].text === '중인', '기본 ③'); ok(/가상 일기/.test(d[12].data.title), '활동 = 가상 일기'); ok(/궁중떡볶이/.test(JSON.stringify(d[13].data)), '실생활'); ok(/100일 안에 관청/.test(d[14].data.note) && /\*\*다툼이 줄고\*\*/.test(d[14].data.note), '그날의 선택'); ok(L.u2_l04.meta.textbook === 'p.82~86' && L.u2_l04.meta.duration_min === 80 && L.u2_l04.meta.covers === '4·5차시', '쪽·80분'); });

T('l06 그날의 선택 → 다음 차시 「조선과 주변 나라들의 관계」', () => ok(/\*\*주변 나라\*\*/.test(L.u2_l06.slides[14].data.note) && /\*\*조선과 주변 나라들의 관계\*\*/.test(L.u2_l06.slides[18].data.preview), 'l06→l07'));
T('l06 지도서 핵심(189~191쪽): 동기 = 거리의 앙부일구(실사 자리 angbuilgu_street) · 농업을 중요하게 여김 → 중국 농사책 안 맞음 → 농부들의 경험 → 『농사직설』 · 혼천의·측우기 = 농사 / 앙부일구·자격루 = 일상생활(꼭 기억해요 1) · 앙부일구 그림·거리 · 자격루 날씨와 상관없이 · 한자 불편 → 훈민정음(꼭 기억해요 2) → 유교의 가르침·문화 · 기본 ① 『농사직설』(『삼강행실도』 함정) ② 앙부일구·자격루 2개(측우기·혼천의 함정) ③ 훈민정음(한자 함정) · 활동 = 질문 카드 놀이(과정 중심 평가) · 실생활 = 한글 · 그날의 선택 = 새 글자 반대', () => { const d = L.u2_l06.slides, s = txt(L.u2_l06); ok(/angbuilgu_street/.test(d[2].data.img) && /\*\*그림\*\*/.test(d[2].data.desc), '동기'); ok(/\*\*농사\*\*/.test(d[3].data.content) && /중국 농사책/.test(d[3].data.content) && /\*\*경험\*\*/.test(d[3].data.content) && /\*\*『농사직설』\*\*/.test(d[3].data.content), '농업'); ok(['혼천의', '측우기', '앙부일구', '자격루'].every(x => d[4].data.fig.items.some(i => i.name === x)) && /\*\*혼천의\*\*와 \*\*측우기\*\*는 \*\*농사\*\*/.test(d[4].data.content) && /\*\*앙부일구\*\*와 \*\*자격루\*\*는 백성의 \*\*일상생활\*\*/.test(d[4].data.content), '과학 = 꼭 기억해요 1'); ok(/\*\*글을 모르는 백성\*\*/.test(d[5].data.content) && /\*\*거리\*\*/.test(d[5].data.content) && /\*\*날씨와 상관없이\*\*/.test(d[5].data.content), '앙부일구·자격루'); ok(/\*\*한자\*\*/.test(d[6].data.content) && /\*\*훈민정음\*\*/.test(d[6].data.content) && /\*\*유교의 가르침\*\*/.test(d[6].data.content) && /\*\*문화\*\*/.test(d[6].data.content), '훈민정음 = 꼭 기억해요 2'); ok(/임금만/.test(d[7].data.wrong) && /백성/.test(d[7].data.right), '오개념'); ok(d[8].data.options.filter(o => o.correct)[0].text === '『농사직설』' && d[8].data.options.some(o => o.text === '『삼강행실도』' && !o.correct), '기본 ①'); ok(JSON.stringify(d[9].data.options.filter(o => o.correct).map(o => o.text)) === '["앙부일구","자격루"]', '기본 ②'); ok(d[10].data.options.filter(o => o.correct)[0].text === '훈민정음' && d[10].data.options.some(o => o.text === '한자' && !o.correct), '기본 ③'); ok(/질문 카드/.test(d[12].data.title) && /194쪽/.test(JSON.stringify(d[12].data.materials)), '활동 = 질문 카드'); ok(/한글/.test(JSON.stringify(d[13].data)), '실생활'); ok(/반대/.test(d[14].data.context) && /\*\*훈민정음\*\*/.test(d[14].data.note), '그날의 선택'); ok(L.u2_l06.meta.textbook === 'p.87~89' && L.u2_l06.meta.duration_min === 40 && L.u2_l06.meta.covers === '6차시', '쪽·40분'); });

T('l07 그날의 선택 → 다음 차시 새 주제 「조선 후기의 경제적 변화」(2주제 · [6사05-02])', () => ok(/\*\*농사와 장사\*\*/.test(L.u2_l07.slides[14].data.note) && /\*\*조선 후기의 경제적 변화\*\*/.test(L.u2_l07.slides[18].data.preview) && /새 주제/.test(L.u2_l07.slides[18].data.preview), 'l07→l08'));
T('l07 지도서 핵심(196~199쪽): 동기 = 외교에 필요한 사람(실사 자리 sasin_haengnyeol) · 명·일본·여진 · 명 = 좋은 관계·사신·문물 · 일본·여진 = 무역 + 무력 · 왜구·쓰시마섬·4군·6진 · 임진왜란 = 조총 → 이순신 수군·의병·명군 · 병자호란 = 여진 → 청 · 임금과 신하의 관계 요구 · 거절 · 인조 · 남한산성(항복은 s15 에서 처음) · 오개념 = 꼭 기억해요 1(명과 무역·무력 ✗) · 기본 ① 4군 6진(쓰시마섬 함정) ② 수군·의병·명군 3개(청군 함정) ③ 병자호란(임진왜란 함정 · 꼭 기억해요 2) · 활동 = 남한산성 안 말풍선(활동지 202쪽 · 과정 중심 평가) · 실생활 = 남한산성 · 그날의 선택 = 남한산성 안 두 갈래 → 항복 → 청의 영향 · s18 = 얼마나 잘했을까(주제 마무리 세 영역)', () => { const d = L.u2_l07.slides, s = txt(L.u2_l07);
  ok(/sasin_haengnyeol/.test(d[2].data.img) && /\*\*편지\*\*/.test(d[2].data.desc) && /\*\*선물\*\*/.test(d[2].data.desc), '동기'); ok(['명', '일본', '여진'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0) && /\*\*좋은 관계\*\*/.test(d[3].data.content) && /\*\*사신\*\*/.test(d[3].data.content) && /\*\*문물\*\*/.test(d[3].data.content), '명');
  ok(/\*\*무역\*\*/.test(d[4].data.content) && /\*\*무력\*\*/.test(d[4].data.content) && /\*\*왜구\*\*/.test(d[4].data.content) && /\*\*쓰시마섬\*\*/.test(d[4].data.content) && ['4군', '6진'].every(x => d[4].data.fig.items.some(i => i.name === x)), '일본·여진');
  ok(/\*\*임진왜란\*\*/.test(d[5].data.content) && /\*\*조총\*\*/.test(d[5].data.content) && /\*\*이순신\*\*/.test(d[5].data.content) && /\*\*의병\*\*/.test(d[5].data.content) && /\*\*명군\*\*/.test(d[5].data.content), '임진왜란');
  ok(/\*\*여진\*\*/.test(d[6].data.content) && /\*\*청\*\*/.test(d[6].data.content) && /\*\*임금과 신하의 관계\*\*/.test(d[6].data.content) && /거절/.test(d[6].data.content) && /\*\*병자호란\*\*/.test(d[6].data.content) && /\*\*남한산성\*\*/.test(d[6].data.content), '병자호란');
  ok(!/항복/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 항복 0(그날의 선택 답 미리 드러나지 않게)');
  ok(/명과 무역/.test(d[7].data.wrong) && /명과는 좋은 관계/.test(d[7].data.right), '오개념 = 꼭 기억해요 1');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '4군 6진' && d[8].data.options.some(o => o.text === '쓰시마섬' && !o.correct), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => o.text === '청군의 도움' && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '병자호란' && d[10].data.options.some(o => o.text === '임진왜란' && !o.correct), '기본 ③ = 꼭 기억해요 2');
  ok(/남한산성/.test(d[12].data.title) && /202쪽/.test(JSON.stringify(d[12].data.materials)), '활동 = 말풍선'); ok(/남한산성/.test(JSON.stringify(d[13].data)), '실생활');
  ok(/남한산성/.test(d[14].data.context) && /\*\*항복\*\*/.test(d[14].data.note) && /\*\*청\*\*의 영향/.test(d[14].data.note), '그날의 선택');
  ok(/주제 마무리/.test(d[17].data.title) && d[17].data.items.length === 3 && /^📚/.test(d[17].data.items[0]) && /^🔧/.test(d[17].data.items[1]) && /^💛/.test(d[17].data.items[2]), '얼마나 잘했을까');
  ok(L.u2_l07.meta.textbook === 'p.90~93' && L.u2_l07.meta.duration_min === 40 && L.u2_l07.meta.covers === '7차시', '쪽·40분'); });

T('l08 그날의 선택 → 다음 차시 「조선 후기 달라진 사회 모습」', () => ok(/\*\*신분\*\*/.test(L.u2_l08.slides[14].data.note) && /\*\*조선 후기 달라진 사회 모습\*\*/.test(L.u2_l08.slides[18].data.preview), 'l08→l09'));
T('l08 지도서 핵심(208~214쪽): 2주제 첫 차시 · 동기 = 「천하도」와 지구의(실사 자리 cheonhado_jiguui) · 전쟁 뒤 농민 → 모내기법(모판·어린 모·옮겨 심기) 전국 확산(꼭 기억해요 1) · 잡초·일손·쌀 생산량·보리·잘사는 농민 · 외국 작물: 고구마·감자 = 배고픔 / 고추·인삼·담배 = 이익 · 장시·보부상·상업·상평통보 전국(꼭 기억해요 2) · 오개념 = 처음부터 돈(쌀·옷감) · 기본 ① 모내기법(『농사직설』 함정) ② 고구마·감자 2개 ③ 상평통보(보부상 함정) · 활동 = 「경직도」 인터뷰(활동지 213쪽 · 과정 중심 평가) · 실생활 = 오일장 · 그날의 선택 = 무엇을 기를까 → 두 길 → 신분', () => { const d = L.u2_l08.slides, s = txt(L.u2_l08);
  ok(/cheonhado_jiguui/.test(d[2].data.img) && /\*\*지구의\*\*/.test(d[2].data.desc) && /천하도/.test(d[2].data.question), '동기');
  ok(/\*\*모내기법\*\*/.test(d[3].data.content) && /모판/.test(d[3].data.content) && /어린 모/.test(d[3].data.content) && /\*\*전국\*\*/.test(d[3].data.content), '모내기법 = 꼭 기억해요 1');
  ok(['쌀', '보리', '일손', '잘사는 농민'].every(x => d[4].data.fig.items.some(i => i.name === x)) && /\*\*잡초\*\*/.test(d[4].data.content) && /\*\*쌀 생산량\*\*/.test(d[4].data.content), '모내기법이 바꾼 농촌');
  ok(/\*\*외국\*\*/.test(d[5].data.content) && /\*\*배고픔\*\*/.test(d[5].data.content) && /\*\*이익\*\*/.test(d[5].data.content) && ['고구마', '감자', '고추', '인삼'].every(x => d[5].data.fig.items.some(i => i.name === x)), '작물');
  ok(['장시', '보부상', '상평통보'].every(x => d[6].data.fig.items.some(i => i.name === x)) && /\*\*상업\*\*/.test(d[6].data.content) && /\*\*상평통보\*\*/.test(d[6].data.content) && /\*\*전국\*\*/.test(d[6].data.content), '상업 = 꼭 기억해요 2');
  ok(/처음부터 돈/.test(d[7].data.wrong) && /쌀과 옷감/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '모내기법' && d[8].data.options.some(o => o.text === '『농사직설』' && !o.correct), '기본 ①');
  ok(JSON.stringify(d[9].data.options.filter(o => o.correct).map(o => o.text)) === '["기르기 쉬웠다","거친 땅에서도 잘 자랐다"]', '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '상평통보' && d[10].data.options.some(o => o.text === '보부상' && !o.correct), '기본 ③');
  ok(/경직도/.test(d[12].data.title) && /213쪽/.test(JSON.stringify(d[12].data.materials)), '활동 = 인터뷰'); ok(/오일장/.test(JSON.stringify(d[13].data)), '실생활');
  ok(/고구마/.test(d[14].data.context) && /\*\*두 길을 함께\*\*/.test(d[14].data.note), '그날의 선택');
  ok(L.u2_l08.meta.textbook === 'p.94~96' && L.u2_l08.meta.duration_min === 40 && L.u2_l08.meta.covers === '8차시', '쪽·40분'); });

T('l09 그날의 선택 → 다음 차시 「서민 문화에 나타난 사람들의 생활 모습」', () => ok(/\*\*문화\*\*/.test(L.u2_l09.slides[14].data.note) && /\*\*서민 문화에 나타난 사람들의 생활 모습\*\*/.test(L.u2_l09.slides[18].data.preview), 'l09→l10'));
T('l09 지도서 핵심(215~217쪽): 동기 = 돈으로 무엇을 할까 · 큰돈 모은 상민과 족보(실사 자리 yangban_jokbo) · 농업·상업 발달 → 돈으로 양반 신분 → 양반 늘고 상민·천민 줄어 신분제 흔들림 · 서양 문물(자명종·천리경·세계지도·서양 책) · 사신 · 세계의 중심 · 실학 = 현실의 사회 문제(꼭 기억해요 1) · 농업·상업·수공업·우리 역사와 지리 · 천주교·동학 = 모든 사람이 평등(꼭 기억해요 2) · 새로운 세상 · 탄압은 s15 에서 처음 · 오개념 = 상민 세금 부담 커짐(핵심 질문) · 기본 ① 실학(유교 함정) ② 서양 문물 3개(앙부일구 함정) ③ 동학(천주교 함정) · 활동 = 서양 문물 첫 만남(활동지 220쪽 · 과정 중심 평가) · 실생활 = 알람 시계(자명종) · 그날의 선택 = 퍼지는 동학 → 탄압 → 더욱 퍼짐 → 사회의 변화', () => { const d = L.u2_l09.slides;
  ok(/yangban_jokbo/.test(d[2].data.img) && /\*\*족보\*\*/.test(d[2].data.desc) && /돈/.test(d[2].data.question), '동기');
  ok(/\*\*양반 신분\*\*/.test(d[3].data.content) && /\*\*상민\*\*과 \*\*천민\*\*은 줄어/.test(d[3].data.content) && /\*\*신분제\*\*가 흔들렸어요/.test(d[3].data.content), '신분제');
  ok(['자명종', '천리경', '세계지도'].every(x => d[4].data.fig.items.some(i => i.name === x)) && /\*\*사신\*\*/.test(d[4].data.content) && /\*\*서양 문물\*\*/.test(d[4].data.content) && /\*\*세계의 중심\*\*/.test(d[4].data.content), '서양 문물');
  ok(/\*\*현실의 사회 문제\*\*/.test(d[5].data.content) && /\*\*실학\*\*/.test(d[5].data.content) && ['농업', '상업·수공업', '우리 것'].every(x => d[5].data.fig.items.some(i => i.name === x)), '실학 = 꼭 기억해요 1');
  ok(/\*\*천주교\*\*/.test(d[6].data.content) && /\*\*동학\*\*/.test(d[6].data.content) && /\*\*모든 사람이 평등하다\*\*/.test(d[6].data.content) && /\*\*새로운 세상\*\*/.test(d[6].data.content), '천주교·동학 = 꼭 기억해요 2');
  ok(!/탄압/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 탄압 0(그날의 선택 답 미리 드러나지 않게)');
  ok(/가벼워/.test(d[7].data.wrong) && /부담은 오히려 커졌다/.test(d[7].data.right), '오개념 = 핵심 질문');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '실학' && d[8].data.options.some(o => o.text === '유교' && !o.correct), '기본 ①');
  ok(JSON.stringify(d[9].data.options.filter(o => o.correct).map(o => o.text)) === '["자명종","천리경","세계지도"]' && d[9].data.options.some(o => o.text === '앙부일구' && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '동학' && d[10].data.options.some(o => o.text === '천주교' && !o.correct), '기본 ③');
  ok(/서양 문물/.test(d[12].data.title) && /220쪽/.test(JSON.stringify(d[12].data.materials)), '활동 = 서양 문물 첫 만남'); ok(/자명종/.test(JSON.stringify(d[13].data)), '실생활');
  ok(/동학/.test(d[14].data.context) && /\*\*탄압\*\*/.test(d[14].data.note) && /\*\*더욱 퍼져\*\*/.test(d[14].data.note) && /\*\*사회의 변화\*\*/.test(d[14].data.note), '그날의 선택');
  ok(L.u2_l09.meta.textbook === 'p.97~99' && L.u2_l09.meta.duration_min === 40 && L.u2_l09.meta.covers === '9차시', '쪽·40분'); });

console.log('═══ H. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['유교', /유교/, 'u2_l01'], ['조선 후기', /조선 후기/, 'u2_l01'], ['서당', /서당/, 'u2_l01'], ['혼례', /혼례/, 'u2_l01'], ['이성계', /이성계/, 'u2_l02'], ['신진 사대부', /신진 사대부/, 'u2_l02'], ['한양', /한양/, 'u2_l02'], ['인의예지', /인의예지/, 'u2_l02'], ['흥인지문', /흥인지문/, 'u2_l02'], ['숭례문', /숭례문/, 'u2_l02'], ['성균관', /성균관/, 'u2_l02'], ['향교', /향교/, 'u2_l02'], ['서원', /서원/, 'u2_l02'], ['충성', /충성/, 'u2_l02'], ['효도', /효도/, 'u2_l02'], ['삼강행실도', /삼강행실도/, 'u2_l04'], ['경국대전', /경국대전/, 'u2_l04'], ['관혼상제', /관혼상제/, 'u2_l04'], ['양반', /양반/, 'u2_l04'], ['중인', /중인/, 'u2_l04'], ['상민', /상민/, 'u2_l04'], ['천민', /천민/, 'u2_l04'], ['삼종지도', /삼종지도/, 'u2_l04'], ['세종', /세종/, 'u2_l06'], ['농사직설', /농사직설/, 'u2_l06'], ['혼천의', /혼천의/, 'u2_l06'], ['측우기', /측우기/, 'u2_l06'], ['앙부일구', /앙부일구/, 'u2_l06'], ['자격루', /자격루/, 'u2_l06'], ['훈민정음', /훈민정음/, 'u2_l06'], ['한글', /한글/, 'u2_l06'], ['일본', /일본/, 'u2_l07'], ['여진', /여진/, 'u2_l07'], ['왜구', /왜구/, 'u2_l07'], ['쓰시마섬', /쓰시마/, 'u2_l07'], ['4군', /4군/, 'u2_l07'], ['6진', /6진/, 'u2_l07'], ['임진왜란', /임진왜란/, 'u2_l07'], ['조총', /조총/, 'u2_l07'], ['이순신', /이순신/, 'u2_l07'], ['의병', /의병/, 'u2_l07'], ['병자호란', /병자호란/, 'u2_l07'], ['남한산성', /남한산성/, 'u2_l07'], ['인조', /인조/, 'u2_l07'], ['천하도', /「천하도」/, 'u2_l08'], ['지구의', /지구의/, 'u2_l08'], ['모내기법', /모내기법/, 'u2_l08'], ['고구마', /고구마/, 'u2_l08'], ['감자', /감자/, 'u2_l08'], ['인삼', /인삼/, 'u2_l08'], ['장시', /장시/, 'u2_l08'], ['보부상', /보부상/, 'u2_l08'], ['상평통보', /상평통보/, 'u2_l08'], ['족보', /족보/, 'u2_l09'], ['신분제', /신분제/, 'u2_l09'], ['자명종', /자명종/, 'u2_l09'], ['천리경', /천리경/, 'u2_l09'], ['실학', /실학/, 'u2_l09'], ['천주교', /천주교/, 'u2_l09'], ['동학', /동학/, 'u2_l09'], ['평등', /평등/, 'u2_l09']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(l01: 이성계·신진 사대부·한양·성균관·향교·양반·중인·상민·삼강행실도·경국대전·세종·훈민정음·임진왜란·병자호란·실학·천주교·동학·개항 · l02: 양반·중인·상민·삼강행실도·경국대전·관혼상제·세종·훈민정음·임진왜란·병자호란·실학·천주교·동학·개항·정몽주·정도전·위화도·과전법·태조·성리학·권문세족·왜구·홍건적 · l04: 세종·훈민정음·농사직설·측우기·앙부일구·임진왜란·병자호란·의병·실학·천주교·동학·개항·세조·성종·정도전·정몽주·성리학 · l06: 임진왜란·병자호란·의병·실학·천주교·동학·개항·여진·쓰시마·왜구·4군·6진·장영실·집현전·정인지·문종·세조·성종·성리학·이두·향찰 · l07: 실학·천주교·동학·개항·모내기법·상평통보·광해군·인조반정·정묘호란·중립 외교·척화·주화·김상헌·최명길·고경명·도요토미·히데요시·판옥선·학익진·이종무·태종·계해약조·삼포·왜관·오랑캐·조공·사대 · l08: 실학·천주교·동학·개항·신분제·대동법·공납·김육·숙종·조엄·통신사·이앙법·직파법·두락·풍속화·김홍도·한글 소설·판소리·탈놀이·서민 문화 · l09: 개항·강화도 조약·흥선 대원군·한글 소설·풍속화·민화·판소리·탈놀이·김홍도·홍길동전·심청전·전기수·정약용·박지원·박제가·유형원·김정호·대동여지도·최제우·마테오 리치·곤여·공명첩·납속·세도·서학·천주실의·순교·시천주·인내천·북학·중농·중상)', () => KEYS.forEach(k => { const s = txt(L[k]), re = k === 'u2_l09' ? /개항|강화도 조약|흥선 대원군|한글 소설|풍속화|민화|판소리|탈놀이|김홍도|홍길동전|심청전|전기수|정약용|박지원|박제가|유형원|김정호|대동여지도|최제우|마테오 리치|곤여|공명첩|납속|세도|서학|천주실의|순교|시천주|인내천|북학|중농|중상/ : k === 'u2_l08' ? /실학|천주교|동학|개항|신분제|대동법|공납|김육|숙종|조엄|통신사|이앙법|직파법|두락|풍속화|김홍도|한글 소설|판소리|탈놀이|서민 문화/ : k === 'u2_l07' ? /실학|천주교|동학|개항|모내기법|상평통보|광해군|인조반정|정묘호란|중립 외교|척화|주화|김상헌|최명길|고경명|도요토미|히데요시|판옥선|학익진|이종무|태종|계해약조|삼포|왜관|오랑캐|조공|사대/ : k === 'u2_l06' ? /임진왜란|병자호란|의병|실학|천주교|동학|개항|여진|쓰시마|왜구|4군|6진|장영실|집현전|정인지|문종|세조|성종|성리학|이두|향찰/ : k === 'u2_l04' ? /세종|훈민정음|농사직설|측우기|앙부일구|임진왜란|병자호란|의병|실학|천주교|동학|개항|세조|성종|정도전|정몽주|성리학/ : k === 'u2_l01' ? /이성계|신진 사대부|한양|성균관|향교|양반|중인|상민|삼강행실도|경국대전|세종|훈민정음|임진왜란|병자호란|실학|천주교|동학|개항/ : /양반|중인|상민|삼강행실도|경국대전|관혼상제|세종|훈민정음|임진왜란|병자호란|실학|천주교|동학|개항|정몽주|정도전|위화도|과전법|태조|성리학|권문세족|왜구|홍건적/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{10}(' + re.source + ').{10}')) || [''])[0]); }));

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
