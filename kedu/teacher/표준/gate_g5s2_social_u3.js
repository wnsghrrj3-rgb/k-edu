/* gate_g5s2_social_u3.js — 5학년 2학기 사회 3단원 「식민 통치와 저항, 전쟁이 바꾼 사회와 생활」 케이티처 2세대 게이트 (179차, 베프 — u2 게이트 틀 복제 · u3_l01 단원 도입 · 180차 u3_l02 을사늑약·의병 · 181차 u3_l03 총독부·헌병·토지 조사 · 182차 u3_l04 3·1 운동·임시 정부 · 183차 u3_l05 3·1 운동 이후 민족 운동 · 184차 u3_l06 일제 통치 시기 달라진 사회와 생활(80분 · 1주제 마무리) · 185차 u3_l08 8·15 광복 이후 달라진 사회와 생활(80분 · 2주제 시작) · 186차 u3_l10 6·25 전쟁과 사람들의 생활 모습(80분) · 187차 u3_l12 6·25 전쟁 이후 달라진 사회와 생활(2주제 마무리)).
   지도서 직행(자기주도 원문 없음) — T 표 자체 규칙을 잰다. 역사 원칙: 인과 중심 · 연도 묻기 0 · s15 = 「그날의 선택」.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보 · E 기본 문제 정답 표시 · F 분 합계
   G 역사 원칙(연도·숫자 연대 0 · 그날의 선택 = 고르기 둘 → 그때 실제로는 → 다음 이야기) · H 선행 용어 · I 실렌더 · J 차단 어휘 · K 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_social_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_social_u3.js'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l06', 'u3_l08', 'u3_l10', 'u3_l12'];
const COV = { u3_l01: [1, 1], u3_l02: [2, 2], u3_l03: [3, 3], u3_l04: [4, 4], u3_l05: [5, 5], u3_l06: [6, 7], u3_l08: [8, 9], u3_l10: [10, 11], u3_l12: [12, 12] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '식민 통치와 저항, 전쟁이 바꾼 사회와 생활';
const T1 = '식민 통치와 저항으로 달라진 사회와 생활 모습', T2 = '8·15 광복과 6·25 전쟁으로 달라진 사회와 생활 모습';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });


console.log('═══ A. 로드·meta ═══');
T('키 = 지도서 1차시(이어서 2·3·4·5·6~7·8~9·10~11·12·13·14)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 사회 · unit 3 · 단원명 · n·covers·분 = 지도서 차시 · [6사06-0x] · 목표·교과서 쪽', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 3 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers'); ok(/^(\[6사06-0[12]\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4 && /^p\.\d/.test(m.textbook), k + ' 목표·쪽'); }));
T('topic: 1주제(l01~l07) = 식민 통치와 저항으로 달라진 사회와 생활 모습 · [6사06-01]', () => KEYS.forEach(k => { if (L[k].meta.n <= 7) ok(L[k].meta.topic === T1 && L[k].meta.std === '[6사06-01]', k); }));
T('topic: 2주제(l08~l12) = 8·15 광복과 6·25 전쟁으로 달라진 사회와 생활 모습 · [6사06-02]', () => KEYS.forEach(k => { const n = L[k].meta.n; if (n >= 8 && n <= 12) ok(L[k].meta.topic === T2 && L[k].meta.std === '[6사06-02]', k); }));

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
T('u3_l01 = 단원 첫 차시(from 비움 · 회상 셋 = 지난 단원 개항 이후 → 마지막 답 일본)', () => { const rv = L.u3_l01.slides[1].data; ok(rv.from === '' && rv.items.length === 3 && rv.items[0].a === '강화도 조약' && rv.items[1].a === '전차' && rv.items[2].a === '일본', rv.from); });
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
T('분 합계 = 480 (지금까지 12차시 × 40 · 단원 끝 560)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 480, n); });

console.log('═══ G. 역사 원칙 ═══');
T('연도·연대 숫자 0 (○○년·○○년대·기원전·세기 — 교사 메모 포함 전부 · 3·1·8·15·6·25 이름은 허용)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k].slides); ok(!/\d+\s*(만\s*)?년|기원전|기원후|세기/.test(s), k + ' ' + (s.match(/.{12}(\d+\s*(만\s*)?년|기원전|기원후|세기).{8}/) || [''])[0]); }));
T('문제·출구에 「언제」 묻기 0', () => KEYS.forEach(k => L[k].slides.filter(s => /basic_problem|exit_ticket|leveled_problem/.test(s.block)).forEach(s => ok(!/언제|몇 년|연도/.test(JSON.stringify(s.data)), k + ' ' + s.id))));
KEYS.forEach(k => T(k + ' s15 그날의 선택 = 상황 · ①② 고르기 · 그때 실제로는 · 다음 이야기', () => { const d = L[k].slides[14].data;
  ok(d.title === '그날의 선택', d.title); ok(d.context && d.context.length > 30, 'context'); ok(/①[^②]+②/.test(d.challenge) && /까닭/.test(d.challenge), 'challenge');
  ok(/^그때 실제로는:/.test(d.note) && /→ 다음 이야기:/.test(d.note), 'note'); }));
T('l01 그날의 선택 「다음 이야기」 → 다음 차시 「일제에 맞서 나라를 지키려고 저항한 사람들의 노력」', () => ok(/\*\*저항\*\*/.test(L.u3_l01.slides[14].data.note) && /나라를 지키려고/.test(L.u3_l01.slides[14].data.note) && /\*\*일제에 맞서 나라를 지키려고 저항한 사람들의 노력\*\*/.test(L.u3_l01.slides[18].data.preview), 'l01→l02'));
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음', () => KEYS.forEach(k => { const a = L[k].slides[16].data.arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); }));
T('l01 지도서 핵심(256~258쪽): 동기 = 전차 거리(실사 자리 dongji_street · 태극기·쌀가마·한복과 서양식 옷) · 중요 용어 = 식민 통치·저항·8·15 광복·6·25 전쟁 · 두 주제 · 미션 = 독립운동가의 동지 · 실마리 셋 · 편지(감시·평범한 여성의 옷) · 네 사람의 말(가로등·서양 물건·쌀가마) → 양복 가게 앞 · 오개념 = 당하기만 ✗ → 저항 · 기본 ① 식민 ② 용어 3개(모내기법 함정) ③ 양복 가게 앞(자전거 가게 함정) · 활동 = 탐구 질문(120~121쪽 · 1인 포함) · 그날의 선택 = 감시 속 몰래 돕기', () => { const d = L.u3_l01.slides;
  ok(/dongji_street/.test(d[2].data.img) && ['전차', '태극기', '쌀가마', '한복', '서양식 옷'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '동기');
  ok(['식민 통치', '저항', '8·15 광복', '6·25 전쟁'].every(x => d[3].data.fig.items.some(i => i.name === x) && d[3].data.content.indexOf('**' + x + '**') >= 0) && /\*\*광복\*\*/.test(d[3].data.content), '중요 용어');
  ok(d[4].data.content.indexOf('**' + T1 + '**') >= 0 && d[4].data.content.indexOf('**' + T2 + '**') >= 0, '두 주제');
  ok(/독립운동가의 동지/.test(d[5].data.title) && d[5].data.fig.items.length === 3 && /\*\*감시\*\*/.test(d[5].data.content) && /\*\*평범한 여성의 옷\*\*/.test(d[5].data.content) && /\*\*네 사람의 말\*\*/.test(d[5].data.content), '미션·실마리 셋·편지');
  ok(['가로등 근처', '서양 물건', '쌀가마 수레'].every(x => d[6].data.fig.items.some(i => i.name === x)) && /\*\*자전거 가게\*\*/.test(d[6].data.content) && /\*\*양복 가게 앞\*\*/.test(d[6].data.content), '네 사람의 말');
  ok(/당하기만/.test(d[7].data.wrong) && /저항/.test(d[7].data.right) && /당당히 맞설/.test(d[7].data.hint), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '식민', '기본 ①'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => o.text === '모내기법' && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '양복 가게 앞' && d[10].data.options.some(o => /자전거 가게/.test(o.text) && !o.correct), '기본 ③');
  ok(/탐구 질문/.test(d[12].data.title) && /120~121쪽/.test(JSON.stringify(d[12].data.materials)), '활동');
  ok(/감시|경찰/.test(d[14].data.context) && /\*\*평범한 차림\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items[2].a === '광복' && d[15].data.items[1].a === T1, '출구');
  ok(L.u3_l01.meta.textbook === 'p.116~121' && L.u3_l01.meta.duration_min === 40 && L.u3_l01.meta.covers === '1차시', '쪽·40분'); });

T('l02 그날의 선택 「다음 이야기」 → 다음 차시 「일제 통치 시기 우리 민족의 고통과 저항」', () => ok(/나라를 빼앗겼/.test(L.u3_l02.slides[14].data.note) && /고통/.test(L.u3_l02.slides[14].data.note) && /\*\*일제 통치 시기 우리 민족의 고통과 저항\*\*/.test(L.u3_l02.slides[18].data.preview), 'l02→l03'));
T('l02 지도서 핵심(264~266쪽): 동기 = 생각을 열어요 시상대 장면(실사 자리 marathon_podium · 이름은 팁에만) · 나라 밖 다툼·러시아·대한 제국 · 을사늑약 = 외교권·늑약 뜻 · 헤이그 특사 = 무효 · 의병 = 상인·학생 반발·군대 해산·만주·연해주 · 오개념 = 군인만 ✗ → 다양한 사람 · 기본 ① 외교권 ② 맞선 모습 3개(잔치 함정) ③ 군대 해산 · 활동 = 「안사람 의병가」(활동지 269쪽 · 1인 포함) · 실생활 = 중명전 · 그날의 선택 = 군대 해산 명령', () => { const d = L.u3_l02.slides;
  ok(/marathon_podium/.test(d[2].data.img) && ['일장기', '금메달', '고개를 숙였어요'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0) && !/손기정/.test(JSON.stringify(d[2].data)), '동기');
  ok(/손기정/.test(JSON.stringify(L.u3_l02.extras)), '팁에 이름');
  ok(['대한 제국', '러시아', '일제'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0), '침략');
  ok(['을사늑약', '외교권', '늑약'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0) && /억지로/.test(d[4].data.content), '을사늑약');
  ok(['헤이그', '특사', '무효'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '헤이그 특사');
  ok(['상인', '학생', '의병', '군대가 해산', '만주', '연해주'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0), '의병');
  ok(/군인들만/.test(d[7].data.wrong) && /다양한 사람/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '외교권', '기본 ①'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /잔치/.test(o.text) && !o.correct), '기본 ②');
  ok(/해산된 군인/.test(d[10].data.options.filter(o => o.correct)[0].text) && /군대가 해산/.test(d[10].data.note), '기본 ③');
  ok(/안사람 의병가/.test(d[12].data.title) && /269쪽/.test(JSON.stringify(d[12].data.materials)), '활동');
  ok(/중명전/.test(d[13].data.scenario.body), '실생활'); ok(/해산/.test(d[14].data.context) && /\*\*의병\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '을사늑약,헤이그 특사,의병', '출구');
  ok(L.u3_l02.meta.textbook === 'p.122~124' && L.u3_l02.meta.covers === '2차시', '쪽'); });

T('l03 그날의 선택 「다음 이야기」 → 다음 차시 「3·1 운동과 대한민국 임시 정부의 노력」', () => ok(/한목소리/.test(L.u3_l03.slides[14].data.note) && /정부/.test(L.u3_l03.slides[14].data.note) && /\*\*3·1 운동과 대한민국 임시 정부의 노력\*\*/.test(L.u3_l03.slides[18].data.preview), 'l03→l04'));
T('l03 지도서 핵심(271~273쪽): 동기 = 칼을 찬 선생님의 교실(실사 자리 botong_classroom · 제복·칼·일본어 교과서) · 조선 총독부(군인 출신·강압적) · 헌병 경찰(감시·탄압)·칼을 찬 교사 · 토지 조사 사업(땅을 잃음·남의 땅을 빌림) · 나라 밖 독립운동(만주 신흥 무관 학교·독립군 · 미국 흥사단 · 이름은 팁에만) · 오개념 = 토지 조사 사업이 땅을 지켜 줌 ✗ · 기본 ① 조선 총독부 ② 강압 통치 3개(우리말 교과서 함정) ③ 신흥 무관 학교(흥사단 함정) · 활동 = 자료로 농민의 삶 추론(활동지 276쪽 · 1인 포함) · 실생활 = 남겨진 기록(서간도 시종기 · 팁) · 그날의 선택 = 재산을 팔고 만주로', () => { const d = L.u3_l03.slides;
  ok(/botong_classroom/.test(d[2].data.img) && ['제복', '칼', '일본어'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '동기');
  ok(['조선 총독부', '군인', '강압적으로'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0), '총독부');
  ok(['헌병', '감시', '탄압', '교사', '칼'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0) && /군대에서 경찰 역할/.test(d[4].data.content), '헌병 경찰');
  ok(['토지 조사 사업', '농민', '잃거나', '남의 땅을 빌려'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '토지 조사');
  ok(['만주', '신흥 무관 학교', '독립군', '미국', '흥사단'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0), '나라 밖');
  ok(/이회영/.test(JSON.stringify(L.u3_l03.extras)) && /안창호/.test(JSON.stringify(L.u3_l03.extras)) && /서간도 시종기/.test(JSON.stringify(L.u3_l03.extras)), '팁에 이름·기록');
  ok(/토지 조사 사업/.test(d[7].data.wrong) && /땅을 잃/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '조선 총독부', '기본 ①'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /우리말 교과서/.test(o.text) && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '신흥 무관 학교' && d[10].data.options.some(o => o.text === '흥사단' && !o.correct), '기본 ③');
  ok(/농민의 삶/.test(d[12].data.title) && /276쪽/.test(JSON.stringify(d[12].data.materials)), '활동');
  ok(/기록/.test(d[13].data.scenario.body), '실생활'); ok(/만주/.test(d[14].data.context) && /\*\*신흥 무관 학교\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '조선 총독부,헌병,토지 조사 사업', '출구');
  ok(L.u3_l03.meta.textbook === 'p.125~127' && L.u3_l03.meta.covers === '3차시', '쪽'); });

T('l04 그날의 선택 「다음 이야기」 → 다음 차시 「3·1 운동 이후 일어난 다양한 민족 운동」', () => ok(/방법을 바꿨/.test(L.u3_l04.slides[14].data.note) && /민족 운동/.test(L.u3_l04.slides[14].data.note) && /\*\*3·1 운동 이후 일어난 다양한 민족 운동\*\*/.test(L.u3_l04.slides[18].data.preview), 'l04→l05'));
T('l04 지도서 핵심(278~280쪽): 동기 = 삼일절 아침(실사 자리 samiljeol_flags · 태극기) · 3·1 운동(독립 선언서·탑골 공원·학생·시민·만세 시위) · 전국·석 달·농민·상인·폭력적 진압 · 임시 정부(힘을 하나로·상하이·탄압 피함·외교) · 한 일(비밀 연락망·신문·외교 활동) + 한인 애국단 · 오개념 = 서울 하루 ✗ → 전국 석 달 · 기본 ① 3·1 운동 ② 임시 정부가 한 일 3개(토지 조사 함정) ③ 한인 애국단(흥사단 함정) · 활동 = 우리 지역 3·1 운동(활동지 283쪽 · 1인 포함) · 실생활 = 임시 정부 기념관·VR · 그날의 선택 = 장날 만세 · 유관순·김구·윤봉길·이봉창 이름은 팁에만', () => { const d = L.u3_l04.slides;
  ok(/samiljeol_flags/.test(d[2].data.img) && ['3월 1일', '태극기'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '동기');
  ok(['독립 선언서', '학생', '시민', '탑골 공원', '만세 시위', '3·1 운동'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0), '3·1 운동');
  ok(['전국', '석 달', '농민', '상인', '폭력적으로'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0), '전국·진압');
  ok(['힘을 하나로 모아야', '상하이', '대한민국 임시 정부', '탄압을 피하기', '외교 활동'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '임시 정부 수립');
  ok(['비밀 연락망', '신문', '외교 활동', '한인 애국단'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0 && d[6].data.fig.items.some(i => i.name === x)), '임시 정부가 한 일');
  ok(['유관순', '김구', '윤봉길', '이봉창'].every(x => JSON.stringify(L.u3_l04.extras).indexOf(x) >= 0), '팁에 이름');
  ok(/하루/.test(d[7].data.wrong) && /전국/.test(d[7].data.right) && /석 달/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '3·1 운동', '기본 ①'); ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /토지 조사/.test(o.text) && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '한인 애국단' && d[10].data.options.some(o => o.text === '흥사단' && !o.correct), '기본 ③');
  ok(/3·1 운동/.test(d[12].data.title) && /283쪽/.test(JSON.stringify(d[12].data.materials)), '활동');
  ok(/임시 정부 기념관/.test(d[13].data.scenario.body) && /VR/.test(d[13].data.scenario.body), '실생활'); ok(/장날/.test(d[14].data.context) && /\*\*장날\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '3·1 운동,대한민국 임시 정부,한인 애국단', '출구');
  ok(L.u3_l04.meta.textbook === 'p.128~130' && L.u3_l04.meta.covers === '4차시', '쪽'); });

T('l05 그날의 선택 「다음 이야기」 → 다음 차시 「일제 통치 시기 달라진 사회와 사람들의 생활 모습」', () => ok(/철도/.test(L.u3_l05.slides[14].data.note) && /달라졌/.test(L.u3_l05.slides[14].data.note) && /\*\*일제 통치 시기 달라진 사회와 사람들의 생활 모습\*\*/.test(L.u3_l05.slides[18].data.preview), 'l05→l06'));
T('l05 지도서 핵심(285~287쪽): 동기 = 군산항 쌀가마(실사 자리 gunsan_rice) · 다스리는 방법을 바꿈(친일 세력·분열·쌀을 더 가져감) · 나라 안(물산 장려·토산품·절약·농촌 계몽·한글·조선어 학회·우리말 사전) · 학생(6·10 만세·장례식·광주 학생 항일·한국 학생만·차별·전국) · 나라 밖(만주·연해주·독립군·봉오동·청산리) · 오개념 = 생활이 나아짐 ✗ · 기본 ① 물산 장려(농촌 계몽 함정) ② 나라 안 3개(청산리 함정) ③ 광주 학생 항일(6·10 함정) · 활동 = 인물 카드(활동지 290쪽 · 1인 포함) · 실생활 = 11월 3일 · 그날의 선택 = 옷감 · 홍범도·김좌진·순종·박준채·남자현은 팁에만', () => { const d = L.u3_l05.slides;
  ok(/gunsan_rice/.test(d[2].data.img) && ['항구', '쌀가마', '일본'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '동기');
  ok(['친일 세력', '분열', '쌀을 더 많이 생산해 가져가'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0) && /모자라자/.test(d[3].data.content), '통치 변화');
  ok(['물산 장려 운동', '토산품', '절약', '농촌 계몽 운동', '한글', '조선어 학회', '우리말 사전'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0), '나라 안');
  ok(['장례식', '6·10 만세 운동', '한국 학생만', '차별', '전국', '광주 학생 항일 운동'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '학생');
  ok(['만주', '연해주', '독립군', '봉오동', '청산리'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0), '나라 밖');
  ok(['홍범도', '김좌진', '순종', '박준채', '남자현'].every(x => JSON.stringify(L.u3_l05.extras).indexOf(x) >= 0), '팁에 이름');
  ok(/나아졌다/.test(d[7].data.wrong) && /어려워졌다/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '물산 장려 운동' && d[8].data.options.some(o => o.text === '농촌 계몽 운동' && !o.correct), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /청산리/.test(o.text) && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '광주 학생 항일 운동' && d[10].data.options.some(o => o.text === '6·10 만세 운동' && !o.correct), '기본 ③');
  ok(/인물 카드/.test(d[12].data.title) && /290쪽/.test(JSON.stringify(d[12].data.materials)), '활동');
  ok(/11월 3일/.test(d[13].data.scenario.body), '실생활'); ok(/옷감/.test(d[14].data.context) && /\*\*우리 물건\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '물산 장려 운동,광주 학생 항일 운동,청산리', '출구');
  ok(L.u3_l05.meta.textbook === 'p.131~133' && L.u3_l05.meta.covers === '5차시', '쪽'); });

T('l06 그날의 선택 「다음 이야기」 → 다음 차시 「8·15 광복 이후 달라진 사회와 사람들의 생활 모습」(2주제)', () => ok(/광복/.test(L.u3_l06.slides[14].data.note) && /만세/.test(L.u3_l06.slides[14].data.note) && /\*\*8·15 광복 이후 달라진 사회와 사람들의 생활 모습\*\*/.test(L.u3_l06.slides[18].data.preview), 'l06→l08'));
T('l06 지도서 핵심(292~297쪽 · 80분 · 1주제 마무리): 동기 = 들판의 작은 기차역(실사 자리 imphi_station) · 철도(도로·항구·철도·사람과 물자·군대·자원·일본·강제로 동원) · 도시(도시·고층 건물·일본인·백화점·한국인·공동 우물·토막집 + 문화 주택) · 민족정신(침략 전쟁·민족정신·신사·성과 이름·일본어·우리말과 역사) · 강제 동원과 저항(사람과 물자·놋그릇·일본군 ‘위안부’·우리 역사·한국광복군) · 오개념 = 잘살게 되었다 ✗ · 기본 ① 철도 목적 ② 민족정신 3개(물산 장려 함정) ③ 한국광복군(독립군 연합 부대 함정) · 활동 = 피해 조사·발표(평가지 302쪽 · 20분 · 1인 포함) · 실생활 = 냉면 배달·인공 조미료 · 그날의 선택 = 놋그릇 · 얼마나 잘했을까 · 신채호·윤동주·미쓰코시·혼마치는 팁에만', () => { const d = L.u3_l06.slides;
  ok(/imphi_station/.test(d[2].data.img) && ['기차역', '철도', '평야', '항구'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '동기');
  ok(['도로', '항구', '철도', '사람과 물자', '군대', '자원', '일본', '강제로 동원'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0), '철도');
  ok(['도시', '고층 건물', '일본인', '백화점', '한국인', '공동 우물', '토막집'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0) && /문화 주택/.test(JSON.stringify(d[4].data.fig)), '도시');
  ok(['침략 전쟁', '민족정신', '신사', '성과 이름', '일본어', '우리말과 역사'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '민족정신');
  ok(['사람과 물자', '강제로 동원', '놋그릇', '일본군 ‘위안부’', '우리 역사', '한국광복군'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0), '동원·저항');
  ok(['신채호', '윤동주', '미쓰코시', '혼마치', '임피역', '평화의 소녀상'].every(x => JSON.stringify(L.u3_l06.extras).indexOf(x) >= 0), '팁');
  ok(/잘살게 되었다/.test(d[7].data.wrong) && /누리지 못했다/.test(d[7].data.right), '오개념');
  ok(/자원을 일본으로/.test(d[8].data.options.filter(o => o.correct)[0].text), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /물산 장려/.test(o.text) && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '한국광복군' && d[10].data.options.some(o => o.text === '독립군 연합 부대' && !o.correct), '기본 ③');
  ok(/피해/.test(d[12].data.title) && /302쪽/.test(JSON.stringify(d[12].data.materials)) && d[12].data.minutes === 20, '활동');
  ok(/냉면/.test(d[13].data.scenario.body) && /인공 조미료/.test(d[13].data.content), '실생활'); ok(/놋그릇/.test(d[14].data.context) && /\*\*놋그릇\*\*/.test(d[14].data.note), '그날의 선택');
  ok(/주제 마무리/.test(d[17].data.title), '얼마나 잘했을까');
  ok(d[15].data.items.map(x => x.a).join() === '철도,신사,한국광복군', '출구');
  ok(L.u3_l06.meta.textbook === 'p.134~139' && L.u3_l06.meta.covers === '6·7차시' && L.u3_l06.meta.duration_min === 80, '쪽·분'); });


T('l08 그날의 선택 「다음 이야기」 → 다음 차시 「6·25 전쟁과 사람들의 생활 모습」', () => ok(/\*\*전쟁\*\*/.test(L.u3_l08.slides[14].data.note) && /6·25 전쟁/.test(L.u3_l08.slides[14].data.note) && /\*\*6·25 전쟁과 사람들의 생활 모습\*\*/.test(L.u3_l08.slides[18].data.preview), 'l08→l10'));
T('l08 지도서 핵심(310~315쪽 · 80분 · 2주제 시작): 동기 = 생각을 열어요 만세 거리(실사 자리 gwangbok_manse · 전차·태극기·만세) · 광복(임시 정부·독립운동가·연합국·광복·동포) · 학교와 생활(우리말·우리글·우리 역사·원래 성과 이름·한글 신문) · 38도선(미군·소련군·통일 정부·국제 연합·총선거) · 정부 수립(5·10 총선거·제헌 국회·헌법·첫 번째 대통령·대한민국 정부) · 오개념 = 저절로 찾아온 광복 ✗ · 기본 ① 원래 성과 이름(일본어 함정) ② 정부 수립 과정 3개(남북이 함께 치른 총선거 함정) ③ 미군(소련군 함정) · 활동 = 5·10 총선거 가상 인터뷰(144쪽 · 20분 · 1인 포함) · 실생활 = 광복절 · 그날의 선택 = 처음 하는 투표(막대기 기호) · 김구·이승만·니시하라·이종환·유종호는 팁에만', () => { const d = L.u3_l08.slides;
  ok(/gwangbok_manse/.test(d[2].data.img) && ['전차', '태극기', '만세'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0) && /만세를 부르는 까닭/.test(d[2].data.question), '동기');
  ok(['임시 정부', '독립운동가', '연합국', '광복', '동포'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0), '광복');
  ok(['우리말', '우리글', '우리 역사', '원래 성과 이름', '한글 신문'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0), '학교와 생활');
  ok(['38도선', '미군', '소련군', '통일 정부', '국제 연합', '총선거'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '38도선');
  ok(['5·10 총선거', '제헌 국회', '헌법', '첫 번째 대통령', '대한민국 정부'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0) && /정부 수립/.test(d[6].data.title), '정부 수립');
  ok(['김구', '이승만', '니시하라', '이종환', '유종호'].every(x => JSON.stringify(L.u3_l08.extras).indexOf(x) >= 0), '팁에 이름');
  ok(/저절로/.test(d[7].data.wrong) && /독립운동/.test(d[7].data.right) && /연합국/.test(d[7].data.right), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '원래 성과 이름을 쓰게 되었다' && d[8].data.options.some(o => /일본어/.test(o.text) && !o.correct), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /남북이 함께/.test(o.text) && !o.correct), '기본 ②');
  ok(d[10].data.options.filter(o => o.correct)[0].text === '미군' && d[10].data.options.some(o => o.text === '소련군' && !o.correct), '기본 ③');
  ok(/가상 인터뷰/.test(d[12].data.title) && /144쪽/.test(JSON.stringify(d[12].data.materials)) && d[12].data.minutes === 20, '활동');
  ok(/광복절/.test(d[13].data.scenario.body), '실생활'); ok(/총선거/.test(d[14].data.context) && /\*\*막대기 기호\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '8·15 광복,38도선,5·10 총선거', '출구');
  ok(L.u3_l08.meta.topic === T2 && L.u3_l08.meta.std === '[6사06-02]', '2주제');
  ok(L.u3_l08.meta.textbook === 'p.140~145' && L.u3_l08.meta.covers === '8·9차시' && L.u3_l08.meta.duration_min === 80, '쪽·분'); });

T('l10 그날의 선택 「다음 이야기」 → 다음 차시 「6·25 전쟁 이후 달라진 사회와 사람들의 생활 모습」', () => ok(/\*\*전쟁 뒤\*\*/.test(L.u3_l10.slides[14].data.note) && /황폐/.test(L.u3_l10.slides[14].data.note) && /\*\*6·25 전쟁 이후 달라진 사회와 사람들의 생활 모습\*\*/.test(L.u3_l10.slides[18].data.preview), 'l10→l12'));
T('l10 지도서 핵심(320~324쪽 · 80분): 동기 = 한겨울 강을 건너는 피란 행렬(실사 자리 piran_winter_river · 인물 없음 · 지도서 영화 「포화 속으로」는 팁에만) · 전쟁 시작(소련·무력 통일·북한군·기습·38도선·서울·피란길·국군·낙동강) · 국제 연합군(불법·국제 연합군·물자·인천 상륙 작전·서울·압록강) · 중국군·정전(중국군·다시 서울을 빼앗김·다시 피란·38도선·치열한 전투·회담·정전 협정·휴전선) · 생활(피란민·임시 수도·부산·움막·판자·마실 물·먹을 음식·천막 학교·배움의 뜻) · 오개념 = 정전으로 전쟁이 끝남 ✗ → 멈춘 것 · 기본 ① 인천 상륙 작전(흥남 철수 함정 · 꼭 기억해요 1) ② 생활 3개(고향 집 편안 함정) ③ 정전 뜻(완전히 끝남 함정) · 활동 = 생활 모습 조사·발표(과정 중심 평가 329쪽 · 20분 · 1인 포함) · 실생활 = 밀면(밀가루·고구마 전분) · 그날의 선택 = 흥남 부두의 배(군수 물자·1만 4천여 명·아기 5명·크리스마스의 기적) · 맥아더·레너드 라루·이우근·포화 속으로는 팁에만 · 연도 0', () => { const d = L.u3_l10.slides;
  ok(/piran_winter_river/.test(d[2].data.img) && ['한겨울', '껴입고', '강', '우마차', '남쪽'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0) && /왜 떠나는/.test(d[2].data.question) && !/포화 속으로|학도병/.test(JSON.stringify(d[2].data)), '동기');
  ok(['소련', '무력으로 통일', '북한군', '기습적으로', '38도선', '6·25 전쟁', '서울', '피란길', '국군', '낙동강'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0) && /3일 만에/.test(d[3].data.content), '전쟁 시작');
  ok(['국제 연합', '불법', '국제 연합군', '물자', '인천 상륙 작전', '서울', '압록강'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0), '국제 연합군');
  ok(['중국군', '다시 서울을 빼앗기고', '다시 피란', '38도선', '치열한 전투', '회담', '정전 협정', '휴전선'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0), '중국군·정전');
  ok(['피란민', '임시 수도', '부산', '움막', '판자', '마실 물', '먹을 음식', '천막 학교', '배움의 뜻'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0) && d[6].data.fig.items.length === 4 && d[6].data.fig.items.some(i => i.name === '천막 학교'), '생활');
  ok(['맥아더', '레너드 라루', '이우근', '포화 속으로', '메러디스 빅토리호', '16개 나라'].every(x => JSON.stringify(L.u3_l10.extras).indexOf(x) >= 0), '팁에 이름');
  ok(/완전히 끝났다/.test(d[7].data.wrong) && /일시적으로/.test(d[7].data.right) && /오늘날까지/.test(d[7].data.right) && /\*\*휴전선\*\*/.test(d[7].data.hint), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '인천 상륙 작전' && d[8].data.options.some(o => o.text === '흥남 철수 작전' && !o.correct), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /고향 집/.test(o.text) && !o.correct), '기본 ②');
  ok(/잠시 멈추기로/.test(d[10].data.options.filter(o => o.correct)[0].text) && d[10].data.options.some(o => /완전히 끝났다/.test(o.text) && !o.correct), '기본 ③');
  ok(/조사하여 발표/.test(d[12].data.title) && /329쪽/.test(JSON.stringify(d[12].data.materials)) && d[12].data.minutes === 20 && /출처/.test(JSON.stringify(d[12].data.steps)), '활동');
  ok(/\*\*밀면\*\*/.test(d[13].data.scenario.body) && /\*\*밀가루\*\*/.test(d[13].data.content) && /\*\*고구마 전분\*\*/.test(d[13].data.content), '실생활');
  ok(/흥남 부두/.test(d[14].data.context) && /59명/.test(d[14].data.context) && /\*\*군수 물자를 버리고\*\*/.test(d[14].data.note) && /\*\*1만 4천여 명\*\*/.test(d[14].data.note) && /\*\*아기 5명\*\*/.test(d[14].data.note) && /크리스마스의 기적/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '인천 상륙 작전,정전 협정,천막 학교', '출구');
  ok(d[16].data.arrows.some(a => /정전 협정$/.test(a)) && /멈춘 것/.test(JSON.stringify(d[16].data.points)), '요약');
  ok(L.u3_l10.meta.topic === T2 && L.u3_l10.meta.std === '[6사06-02]', '2주제');
  ok(L.u3_l10.meta.textbook === 'p.146~150' && L.u3_l10.meta.covers === '10·11차시' && L.u3_l10.meta.duration_min === 80, '쪽·분'); });

T('l12 그날의 선택 「다음 이야기」 → 다음 차시 「생각을 펼쳐요」(기념일)', () => ok(/\*\*기념일\*\*/.test(L.u3_l12.slides[14].data.note) && /생각을 펼쳐/.test(L.u3_l12.slides[14].data.note) && /\*\*생각을 펼쳐요\*\*/.test(L.u3_l12.slides[18].data.preview) && /\*\*기념일\*\*/.test(L.u3_l12.slides[18].data.preview), 'l12→l13'));
T('l12 지도서 핵심(333~335쪽 · 40분 · 2주제 마무리): 동기 = 포탄 자국이 남은 성벽(실사 자리 hwaseong_ruins · 인물 없음) · 피해(피해·고통·민간인·군인·전 국토가 황폐·산업 시설·건물·도로·철도·다리·수원 화성·국가유산·훼손) · 그래프(남한·북한·중국군·국제 연합군·군인·민간인·희생·160만 명) · 이산가족·전쟁고아(피란·헤어져·이산가족·전쟁고아·생활필수품·먹을 것·오랫동안) · 영향(남한·북한·적·군사적으로 대립·분단·휴전선·오갈 수 없어·생사·그리워하며) · 오개념 = 정전으로 피해 끝남 ✗ → 오늘날까지 · 기본 ① 이산가족(전쟁고아 함정) ② 피해 3개(나라를 빼앗김 함정) ③ 오갈 수 없어서(교통 함정) · 활동 = 이산가족 편지 쓰기(활동지 338쪽 · 혼자 · solo) · 실생활 = 앙카라 길(튀르키예·고아원·형제의 나라) · 그날의 선택 = 고향에 잠깐 다녀올까(중국군의 참전·돌아오지 못함·이산가족 찾기 방송) · s18 = 얼마나 잘했을까 주제 마무리 · 장기려·이기환은 팁에만 · 연도 0', () => { const d = L.u3_l12.slides;
  ok(/hwaseong_ruins/.test(d[2].data.img) && ['성벽', '포탄 자국', '무너져', '다리', '굴뚝'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0) && /무엇이 남아/.test(d[2].data.question) && !/수원 화성/.test(JSON.stringify(d[2].data)), '동기');
  ok(['피해', '고통', '민간인', '군인', '전 국토가 황폐', '산업 시설', '건물', '도로', '철도', '다리', '수원 화성', '국가유산', '훼손'].every(x => d[3].data.content.indexOf('**' + x + '**') >= 0) && d[3].data.fig.items.length === 4, '피해');
  ok(['그래프', '남한', '북한', '중국군', '국제 연합군', '군인', '민간인', '희생', '160만 명'].every(x => d[4].data.content.indexOf('**' + x + '**') >= 0), '그래프');
  ok(['피란', '헤어져', '이산가족', '전쟁고아', '생활필수품', '먹을 것', '오랫동안'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0) && d[5].data.fig.items.some(i => i.name === '이산가족') && d[5].data.fig.items.some(i => i.name === '전쟁고아'), '이산가족·전쟁고아');
  ok(['남한', '북한', '적', '군사적으로 대립', '분단', '휴전선', '오갈 수 없어', '생사', '그리워하며'].every(x => d[6].data.content.indexOf('**' + x + '**') >= 0), '영향');
  ok(['장기려', '이기환', '138일', '앙카라 고아원', '640여 명'].every(x => JSON.stringify(L.u3_l12.extras).indexOf(x) >= 0), '팁에 이름');
  ok(/그때 모두 끝났다/.test(d[7].data.wrong) && /오늘날까지/.test(d[7].data.right) && /이산가족/.test(d[7].data.right) && /\*\*오갈 수 없는\*\*/.test(d[7].data.hint), '오개념');
  ok(d[8].data.options.filter(o => o.correct)[0].text === '이산가족' && d[8].data.options.some(o => o.text === '전쟁고아' && !o.correct), '기본 ①');
  ok(d[9].data.options.filter(o => o.correct).length === 3 && d[9].data.options.some(o => /나라를 빼앗겼다/.test(o.text) && !o.correct), '기본 ②');
  ok(/오갈 수 없어서/.test(d[10].data.options.filter(o => o.correct)[0].text) && d[10].data.options.some(o => /교통/.test(o.text) && !o.correct), '기본 ③');
  ok(/편지 쓰기/.test(d[12].data.title) && d[12].data.type === 'solo' && /338쪽/.test(JSON.stringify(d[12].data.materials)) && /흥남 부두/.test(JSON.stringify(d[12].data.solo)), '활동');
  ok(/\*\*앙카라 길\*\*/.test(d[13].data.scenario.body) && /\*\*튀르키예\*\*/.test(d[13].data.content) && /\*\*고아원\*\*/.test(d[13].data.content) && /형제의 나라/.test(d[13].data.content), '실생활');
  ok(/고향/.test(d[14].data.context) && /인천 상륙 작전/.test(d[14].data.context) && /\*\*중국군의 참전\*\*/.test(d[14].data.note) && /\*\*돌아오지 못했어요\*\*/.test(d[14].data.note) && /\*\*이산가족 찾기 방송\*\*/.test(d[14].data.note) && /\*\*만 명이 넘는\*\*/.test(d[14].data.note), '그날의 선택');
  ok(d[15].data.items.map(x => x.a).join() === '이산가족,전쟁고아,분단', '출구');
  ok(d[16].data.arrows.some(a => /이산가족·전쟁고아$/.test(a)) && /오늘날까지/.test(JSON.stringify(d[16].data.points)), '요약');
  ok(/얼마나 잘했을까 — 주제 마무리/.test(d[17].data.title) && d[17].data.items.length === 3 && /8·15 광복과 6·25 전쟁/.test(d[17].data.items[0]), '얼마나 잘했을까');
  ok(L.u3_l12.meta.topic === T2 && L.u3_l12.meta.std === '[6사06-02]', '2주제');
  ok(L.u3_l12.meta.textbook === 'p.151~153' && L.u3_l12.meta.covers === '12차시' && L.u3_l12.meta.duration_min === 40, '쪽·분'); });

console.log('═══ H. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['식민 통치', /식민 통치/, 'u3_l01'], ['저항', /저항/, 'u3_l01'], ['광복', /광복/, 'u3_l01'], ['6·25 전쟁', /6·25 전쟁/, 'u3_l01'], ['일제', /일제/, 'u3_l01'], ['독립운동가', /독립운동가/, 'u3_l01'], ['태극기', /태극기/, 'u3_l01'], ['을사늑약', /을사늑약/, 'u3_l02'], ['헤이그 특사', /헤이그/, 'u3_l02'], ['의병', /의병/, 'u3_l02'], ['대한 제국', /대한 제국/, 'u3_l02'], ['외교권', /외교권/, 'u3_l02'], ['조선 총독부', /총독부/, 'u3_l03'], ['헌병', /헌병/, 'u3_l03'], ['토지 조사 사업', /토지 조사/, 'u3_l03'], ['신흥 무관 학교', /신흥 무관 학교/, 'u3_l03'], ['흥사단', /흥사단/, 'u3_l03'], ['3·1 운동', /3·1/, 'u3_l04'], ['독립 선언서', /독립 선언/, 'u3_l04'], ['만세', /만세/, 'u3_l04'], ['대한민국 임시 정부', /임시 정부/, 'u3_l04'], ['상하이', /상하이/, 'u3_l04'], ['한인 애국단', /애국단/, 'u3_l04'], ['탑골 공원', /탑골/, 'u3_l04'], ['친일 세력', /친일/, 'u3_l05'], ['물산 장려 운동', /물산/, 'u3_l05'], ['농촌 계몽 운동', /계몽/, 'u3_l05'], ['조선어 학회', /조선어 학회/, 'u3_l05'], ['6·10 만세 운동', /6·10/, 'u3_l05'], ['광주 학생 항일 운동', /광주 학생/, 'u3_l05'], ['봉오동', /봉오동/, 'u3_l05'], ['청산리', /청산리/, 'u3_l05'], ['연해주', /연해주/, 'u3_l02'], ['신사', /신사/, 'u3_l06'], ['일본식 성과 이름', /일본식/, 'u3_l06'], ['민족정신', /민족정신/, 'u3_l06'], ['강제 동원', /동원/, 'u3_l06'], ['일본군 ‘위안부’', /위안부/, 'u3_l06'], ['한국광복군', /광복군/, 'u3_l06'], ['토막집', /토막집/, 'u3_l06'], ['공동 우물', /공동 우물/, 'u3_l06'], ['인공 조미료', /조미료/, 'u3_l06'], ['놋그릇', /놋그릇/, 'u3_l06'], ['정부 수립', /정부 수립/, 'u3_l08'], ['총선거', /총선거/, 'u3_l08'], ['38도선', /38도선/, 'u3_l08'], ['제헌 국회', /제헌/, 'u3_l08'], ['소련군', /소련/, 'u3_l08'], ['국제 연합', /국제 연합/, 'u3_l08'], ['연합국', /연합국/, 'u3_l08'], ['헌법', /헌법/, 'u3_l08'], ['대통령', /대통령/, 'u3_l08'], ['피란', /피란/, 'u3_l10'], ['낙동강', /낙동강/, 'u3_l10'], ['인천 상륙 작전', /인천 상륙/, 'u3_l10'], ['중국군', /중국군/, 'u3_l10'], ['정전 협정', /정전/, 'u3_l10'], ['휴전선', /휴전/, 'u3_l10'], ['천막 학교', /천막 학교/, 'u3_l10'], ['움막', /움막/, 'u3_l10'], ['임시 수도', /임시 수도/, 'u3_l10'], ['흥남', /흥남/, 'u3_l10'], ['밀면', /밀면/, 'u3_l10'], ['이산가족', /이산가족/, 'u3_l12'], ['전쟁고아', /전쟁고아/, 'u3_l12'], ['국가유산', /국가유산/, 'u3_l12'], ['분단', /분단/, 'u3_l12'], ['수원 화성', /수원 화성/, 'u3_l12'], ['앙카라 길', /앙카라/, 'u3_l12']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(l01: 을사늑약·의병·헌병·토지 조사·3·1 운동·임시 정부·한인 애국단·광주 학생·청산리·대한 제국·고종·손기정·유관순·안중근·김구·윤봉길·이회영·창씨·신사 참배·위안부·광복군·정부 수립·피란·휴전·이산가족)', () => { const s = JSON.stringify(L.u3_l01); ['을사', '늑약', '의병', '헌병', '토지 조사', '3·1', '임시 정부', '애국단', '광주 학생', '청산리', '대한 제국', '고종', '손기정', '유관순', '안중근', '김구', '윤봉길', '이회영', '창씨', '신사 참배', '위안부', '광복군', '정부 수립', '피란', '휴전', '이산가족'].forEach(x => ok(s.indexOf(x) < 0, 'l01 ' + x)); });

T('다루지 않는 것 0(l02 장: 헌병·토지 조사·3·1·임시 정부·애국단·광주 학생·청산리·유관순·김구·윤봉길·이회영·창씨·신사 참배·위안부·광복군·정부 수립·피란·휴전·이산가족 · 손기정·안중근·윤희순은 팁에만)', () => { const s = JSON.stringify(L.u3_l02.slides); ['헌병', '토지 조사', '3·1', '임시 정부', '애국단', '광주 학생', '청산리', '유관순', '김구', '윤봉길', '이회영', '창씨', '신사 참배', '위안부', '광복군', '정부 수립', '피란', '휴전', '이산가족', '손기정', '안중근', '윤희순', '이토'].forEach(x => ok(s.indexOf(x) < 0, 'l02 ' + x)); });

T('다루지 않는 것 0(l03 장 · s19 예고·다음 이야기 빼고: 3·1·임시 정부·독립 선언·만세·애국단·광주 학생·청산리·유관순·김구·윤봉길·창씨·신사 참배·위안부·광복군·정부 수립·피란·휴전·이산가족·병합·공진회 · 이회영·안창호·이은숙·김동삼·이해동·이완용·데라우치는 팁에만)', () => { const sl = L.u3_l03.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['3·1', '임시 정부', '독립 선언', '만세', '애국단', '광주 학생', '청산리', '유관순', '김구', '윤봉길', '창씨', '신사 참배', '위안부', '광복군', '정부 수립', '피란', '휴전', '이산가족', '병합', '공진회', '이회영', '안창호', '이은숙', '김동삼', '이해동', '이완용', '데라우치', '손기정', '안중근', '윤희순'].forEach(x => ok(s.indexOf(x) < 0, 'l03 ' + x)); });

T('다루지 않는 것 0(l04 장 · s19 예고·다음 이야기 빼고: 물산 장려·조선어 학회·실력 양성·산미·문화 통치·광주 학생·청산리·봉오동·의열단·창씨·신사 참배·위안부·광복군·정부 수립·피란·휴전·이산가족 · 유관순·김구·윤봉길·이봉창·이승만·안창호·스코필드·제암리·훙커우·김상득·한봉삼은 팁에만)', () => { const sl = L.u3_l04.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['물산', '조선어 학회', '실력 양성', '산미', '문화 통치', '광주 학생', '청산리', '봉오동', '의열단', '창씨', '신사 참배', '위안부', '광복군', '정부 수립', '피란', '휴전', '이산가족', '유관순', '김구', '윤봉길', '이봉창', '이승만', '안창호', '스코필드', '제암리', '훙커우', '김상득', '한봉삼', '이회영', '손기정', '안중근'].forEach(x => ok(s.indexOf(x) < 0, 'l04 ' + x)); });

T('다루지 않는 것 0(l05 장 · s19 예고·다음 이야기 빼고: 산미·문화 통치·실력 양성·의열단·창씨·신사 참배·위안부·광복군·정부 수립·피란·휴전·이산가족·징용·철도 · 홍범도·김좌진·순종·박준채·남자현·이선호·유관순·김구·윤봉길·안창호는 팁에만)', () => { const sl = L.u3_l05.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['산미', '문화 통치', '실력 양성', '의열단', '창씨', '신사 참배', '위안부', '광복군', '정부 수립', '피란', '휴전', '이산가족', '징용', '철도', '홍범도', '김좌진', '순종', '박준채', '남자현', '이선호', '유관순', '김구', '윤봉길', '안창호', '브나로드'].forEach(x => ok(s.indexOf(x) < 0, 'l05 ' + x)); });

T('다루지 않는 것 0(l06 장 · s19 예고·다음 이야기 빼고: 정부 수립·피란·휴전·이산가족·38도선·총선거 · 신채호·윤동주·문웅명·미쓰코시·아지노모도·혼마치·임피·군산·유관순·김구·윤봉길은 팁에만)', () => { const sl = L.u3_l06.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['정부 수립', '피란', '휴전', '이산가족', '38도선', '총선거', '신채호', '윤동주', '문웅명', '미쓰코시', '아지노모도', '혼마치', '임피', '군산', '유관순', '김구', '윤봉길', '종군'].forEach(x => ok(s.indexOf(x) < 0, 'l06 ' + x)); });


T('다루지 않는 것 0(l08 장 · s19 예고·다음 이야기 빼고: 피란·휴전·이산가족·전쟁고아·인천 상륙·낙동강·중국군·판문점·분단·신탁·반탁·결렬 · 김구·이승만·니시하라·이종환·유종호·똘똘이·별나라는 팁에만)', () => { const sl = L.u3_l08.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['피란', '휴전', '이산가족', '전쟁고아', '인천', '낙동강', '중국군', '판문점', '분단', '신탁', '반탁', '김구', '이승만', '니시하라', '이종환', '유종호', '똘똘이', '별나라', '종군'].forEach(x => ok(s.indexOf(x) < 0, 'l08 ' + x)); });

T('다루지 않는 것 0(l10 장 · s19 예고·다음 이야기 빼고: 이산가족·전쟁고아·국가유산·수원 화성·황폐·새마을·1·4 후퇴·학도병·판문점·개성·장사 상륙·거제도 장승포 · 맥아더·레너드 라루·이우근·김일성·포화 속으로는 팁에만)', () => { const sl = L.u3_l10.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['이산가족', '전쟁고아', '국가유산', '수원 화성', '황폐', '새마을', '1·4 후퇴', '학도병', '판문점', '개성', '장사 상륙', '장승포', '맥아더', '라루', '이우근', '김일성', '포화 속으로', '종군'].forEach(x => ok(s.indexOf(x) < 0, 'l10 ' + x)); });

T('다루지 않는 것 0(l12 장 · s19 예고·다음 이야기 빼고: 새마을·판문점·개성·학도병·흥남 철수 작전·실향민·군사 분계선·월남·월북·납북·반공·KBS·여의도·유네스코·현충일·삼일절·광복절 · 장기려·이기환·튀르키예군 수·이산가족 찾기 방송 날수는 팁에만)', () => { const sl = L.u3_l12.slides.slice(0, 18).map(x => { const d = Object.assign({}, x.data); if (d.note) d.note = d.note.split('→ 다음 이야기')[0]; if (d.arrows) d.arrows = d.arrows.filter(a => !/^다음:/.test(a)); return d; }); const s = JSON.stringify(sl); ['새마을', '판문점', '개성', '학도병', '흥남 철수 작전', '실향민', '군사 분계선', '월남', '월북', '납북', '반공', 'KBS', '여의도', '유네스코', '현충일', '삼일절', '광복절', '장기려', '이기환', '138일', '640', '맥아더', '라루', '김일성', '종군'].forEach(x => ok(s.indexOf(x) < 0, 'l12 ' + x)); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('next_lesson = 「다음 시간엔」 · 단원 끝(14차시 단원 마무리) = 「이 단원을 마쳐요」', () => KEYS.forEach(k => ok(L[k].slides[18].data.title === (L[k].meta.n === 14 ? '이 단원을 마쳐요' : '다음 시간엔'), k)));

console.log('═══ J. 차단 어휘 ═══');
T('결·박음·빵꾸·갈아엎 0 (결정·해결 같은 낱말 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));

console.log('═══ K. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_social_u3: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
