/* gate_g3s2_korean_u2.js — 3학년 2학기 국어 2단원 「유창하게 읽고 발표해요」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g3s2_korean_u1 틀 + 국어 사전 대조).
   옛 게이트(36차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u2.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 2단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 8종 서로 다름 · 3-2 국어 다른 단원과 겹침 0
   D 복습 계보(l01 = 1단원 g3s2_korean u1_l13 출구 — 파일에서 동적으로 읽어 대조 → 이후 = 직전 차시 출구) · 마지막 = 3단원 「정확하게 글을 써요」 예고
   E 정답 다시 풀기 — 게이트 자체 사전으로 푼다: 낱말 뜻 사전(지도서 133·137·139·143·145쪽 낱말 풀이 · 94쪽 품새) 역찾기 · 뜻이 비슷한 말 표(86쪽)
       · 띄어 읽기 예시 답안(69쪽 — ∨ 를 지운 글로 줄을 찾아 냄) · 유창하게 읽는 방법 표(73쪽 — 「길면」·「사이는」 뒤를 잘라 다시 만듦) · 녹음 차례(134쪽)
       · 세 칸 → 읽는 방법 표(81쪽) · 흥부와 제비 장면 → 목소리 표(국어활동 23쪽) · 색 크기 모양 표(93쪽) · 색 느낌 표(국어활동 24쪽) · 태권도 표(94쪽)
       · 네 칸 표(96쪽) · 축구 표(지도서 161쪽 — 한 팀 = 22 ÷ 2) · 것 수 줄 글(104쪽 — 정규식으로 ‘수’·‘줄’ 앞말을 뽑음 · 띄어쓰기 고침) → 기본 24 · 수준별 16 · 출구 24 · 넓히기 8 = 72
   F 차례 사슬 — 녹음 차례 · 세 칸 → 읽는 방법 · 「신기한 구슬」·「박에스더」 사건 차례 · 발표 자료 네 칸 · 창의성 계발 학습 모형 네 단계 · 짧은 이야기 소개 세 단계 · 평가 자료 1 차례
   G 그림 — 렌더 · 쓰는 부품만(text·pause·mood·sort2·note·link·tools·chain · panels 안쪽) · 띄어 읽기 줄 = 69쪽 예시 · 소단원 차시 이름 = 지도서 차시 표 · 1211 = 첫째 자리 출발지·둘째 자리 도착지
       · 색 크기 모양 표 · 세 칸 분위기 · 축구 표 · 것 수 줄 글 · 스탠드 이름 · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침)
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 29장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80 · 120분 90~120) · 물음 끝 「요?」 · 지도서 유의점이 교사 층에
   L 선행(누가/무엇이·녹음 l02 · 분위기·인물이 처한 상황 l03 · 묻고 답하기 l05 · 픽토그램·색, 크기, 모양 l07 · 얼개·오방색 l08 · 이런 활동 어때요 l11 · 것·수·줄 l13 — l01 단원 도입 예외)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 작품·인물 0
   N 제재 — 작품마다 제목·지은이 · 교과서 쪽 안내 · 작품별 인용 줄 ≤ 4(그림 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고)
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장(사람마다·여러 답 + 까닭·근거) ≥ 4차시
   R 역검증 레드 — 망가뜨린 사본(정답 · 낱말 뜻 · 뜻이 비슷한 말 · 복습 · 「결」 · b_ 카드 · 보탬 낱말 · 교과서 낱말 · 인용 줄 · 지은이 · 차례 · 띄어 읽기 · 1211 · 문제 그림 · 인물 · 선행)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u2.js */
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

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g3s2_korean_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u2.json'), 'utf8'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l05', 'u2_l07', 'u2_l08', 'u2_l11', 'u2_l13'];
const COV = { u2_l01: [1, 1], u2_l02: [2, 2], u2_l03: [3, 4], u2_l05: [5, 6], u2_l07: [7, 7], u2_l08: [8, 10], u2_l11: [11, 12], u2_l13: [13, 13] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '유창하게 읽고 발표해요';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
/* 낱말 뜻 — 국어 70쪽(지도서 133) · 74~79쪽(137~139) · 82·84쪽(143·145) 낱말 풀이 · 94쪽 글 라(품새 — 「결」 차단으로 「연결하는」 → 「잇는」) */
const WORDS = { 대들보: '지붕을 떠받치기 위해 나무 기둥과 나무 기둥 사이에 가로놓은 나무', 서까래: '지붕의 비스듬한 면의 뼈대를 이루는 나무', 삽시간: '매우 짧은 시간',
  대수: '대단한 것', 병세: '병의 상태', 처량했다: '초라하고 가여웠다', 부리나케: '서둘러서 아주 급하게', 옭아매는: '자유롭지 못하게 하는', 불호령: '몹시 심하게 하는 꾸지람',
  야속했다: '언짢고 섭섭했다', 부아: '분한 마음', 영롱한: '구슬 따위의 울리는 소리가 맑고 아름다운', 예사롭게: '흔히 있을 만하게',
  보구녀관: '한국 최초의 여성 병원이자 여성 의학 교육 기관', 왕진: '의사가 병원 밖의 환자가 있는 곳으로 가서 진료함', 미신: '과학적이지 않다고 여겨지는 믿음', 품새: '기본 동작과 기술을 자연스럽게 잇는 연습' };
/* 뜻이 비슷한 말 — 국어 86쪽 낱말 알기(예시 답안 · 다짐하다의 교과서 정답 낱말은 「결」 차단이라 뜻풀이로) · 오답 보기 = 교과서 보기 */
const SYN = { 다짐하다: '마음을 굳게 먹다', 되새기다: '곱씹다', 치료하다: '낫게 하다' };
const SYN_DIST = { 되새기다: ['벗어나다', '말하다'], 치료하다: ['활용하다', '풀어내다'] };
/* 띄어 읽기 예시 답안 — 국어 69쪽(줄 끝 ∨∨ = 더 길게 쉬어 읽기) */
const PAUSE69 = ['우리는∨길을 걸을 때∨주의 표지판을 자주 봅니다.', '주의 표지판은∨노란색 배경에∨진한 빨간색 선이 둘려 있습니다.', '그래서 사람들은∨주의할 점을∨바로 파악할 수 있습니다.'];
const MARKS = { '∨': '쉬어 읽는 표시', '∨∨': '더 길게 쉬어 읽는 표시' };
/* 글을 유창하게 읽는 방법(국어 73쪽 · 지도서 134쪽) · 녹음하고 다시 듣는 방법(지도서 134쪽) */
const FLUENT73 = ['‘누가/무엇이’ 다음에 조금 띄어 읽는다', '‘누가/무엇이’에 해당하는 말이 길면 한 번 더 띄어 읽는다', '문장과 문장 사이는 조금 더 길게 띄어 읽는다', '정확한 발음과 적절한 속도로 읽는다'];
const RECORD134 = ['녹음 시작 기호를 누른 뒤 글을 유창하게 소리 내어 읽는다', '정지 기호를 눌러서 녹음을 마친다', '녹음한 파일을 찾아 재생 기호를 누르고 자신이 어떻게 읽는지 확인한다', '아쉬운 부분을 찾아 어떻게 읽어야 할지 생각한다', '위 과정을 반복한다'];
const LINK72 = [['나무로 만든 집에서 잔 적이 있는데', '아는 점이나 관련 있는 경험'], ['과일의 종류', '더 알고 싶거나 궁금한 점'], ['은행나무를 왜 심었는지 알았어', '새롭게 안 점']];
/* 세 칸 → 읽는 방법(국어 81쪽 3번 (2)) · 흥부와 제비 장면 → 목소리(국어활동 23쪽 예시 답안) */
const READ81 = [['인물이 처한 상황', '실감 나게'], ['인물의 말이나 행동', '표정과 몸짓'], ['인물의 마음', '목소리']];
const CELLS = READ81.map(r => r[0]).concat('분위기');
const VOICES = ['명랑하다', '반갑다', '울먹이다', '슬프다', '놀라다', '속상하다'];
const HEUNG23 = [['치료', ['슬프다', '속상하다']], ['남쪽으로 떠', ['울먹이다']], ['다시 날아', ['반갑다']], ['박씨를 떨어뜨', ['놀라다']]];
/* 색 크기 모양(국어 93쪽 4번 예시 답안) · 색 느낌(국어활동 24쪽 더 알아보기) */
const CSS93 = { 색: ['제목에서 강조할 부분의 색을 다르게', '지역마다 다른 색'], 크기: ['제목 글자를 크게', '승용차보다 번호판을 크게'], 모양: ['제목의 글자 모양을 다르게', '지역 번호를 지도로'] };
const COLOR24 = [['따뜻한 느낌', ['빨강', '노랑']], ['차가운 느낌', ['파랑', '청록']]];
/* 태권도(국어 94쪽 글 가~라) · 발표 자료 네 칸(96쪽) · 보완 예(지도서 157쪽) · 창의성 계발 학습 모형(지도서 153쪽) */
const STANCE94 = { 앞서기: '한쪽 발을 앞으로 내디딘 자세', 주춤서기: '말을 타는 것처럼 다리를 넓게 벌리고 무릎을 살짝 구부린 자세', '앞굽이 서기': '앞다리를 굽혀서 무게를 앞다리에 싣는 자세' };
const MOVES94 = ['얼굴 막기', '몸통막기', '아래 막기', '앞 차기', '돌려차기', '옆 차기'];
const BELT94 = ['흰색', '노란색', '빨간색', '파란색', '검은색'];
const FOUR96 = ['제목과 내용', '그림', '색, 크기, 모양', '발표 자료 얼개 짜기'];
const EX96 = { '색, 크기, 모양': '제목은 파란색으로 본문보다 크게' };
const FIX157 = [['제목이', '제목을 더 크게'], ['설명이', '그림 옆에 설명을 추가'], ['낱말이', '중요한 낱말에 색']];
const CREATIVE = ['문제 발견', '아이디어 생성', '아이디어 선택', '아이디어 적용'];
/* 축구(지도서 161쪽 예시 2) · 가수(국어 101쪽) · 짧은 이야기 소개(100쪽) */
const SOCCER = { 글: ['상대편의 골에 공을 넣는 운동', '발을 사용하는 운동'], 그림: ['전반전과 후반전 90분을 나타내는 시계', '두 팀 22명이 운동장 안에 있는 모습'], time: 90, two: 22 };
const SINGER = { 글: '가수가 하는 일', 그림: ['노래할 때의 모습', '마이크와 음표'] };
const STEPS100 = ['정하기', '그림', '소개'];
/* 스스로 확인(103쪽) · 생활 속으로 · 단풍 구경(104쪽) · 스탠드 이름(104쪽 예시 답안 — 이름에 담긴 특징) */
const CHECK103 = { ok: ['적절한 부분에서 띄어 가며 읽는다', '글의 분위기에 어울리는 목소리와 말투로 읽는다'], no: ['정확한 발음으로 무조건 빠르게 읽는다', '슬픈 이야기도 밝은 목소리로 읽는다'] };
const LIFE103 = ['글을 읽을 때 함께 있는 그림도 꼼꼼히 살펴볼 거야', '글과 그림을 활용해서 더 이해하기 쉽게 발표할 거야', '발표를 들을 때 그림에도 집중할 거야'];
const DANPUNG = ['단풍이 든 산에 오르면 우리는 가을이 온 것을 느낄 수 있습니다.', '붉은 것, 노란 것, 그리고 계속해서 푸른 것까지.', '알록달록 가을 풍경을 구경하다 보면 시간 가는 줄 모릅니다.', '날이 어둑어둑해지고 나서야 집에 갈 시간이 된 줄 압니다.'];
const NAME104 = { 끄덕끄덕등: ['빛을 낸다', '목이 움직인다'], 책짝꿍: ['주로 책을 읽을 때 쓰인다'] };
const FEAT104 = ['빛을 낸다', '목이 움직인다', '주로 책을 읽을 때 쓰인다'];
/* 그 밖의 지도서 사실 표 — 쪽마다 예시 답안 */
const S = {
  sign68: '사람이 건너는 신호와 남은 시간', arrow68: '방향에 상관없이 건너 사람들끼리 부딪칠 수 있다', arrowDir: '오른쪽', sign69: '공사 중입니다. 조심히 지나가세요!',      // 68~69쪽
  unitParts: ['글을 유창하게 소리 내어 읽기', '글과 그림을 활용하여 표현하기'], aut22: ['고은', '승우', '혜윤'], willow: '열을 내리고 통증을 달래 줌',                      // 69쪽 · 국어활동 22쪽 · 72쪽
  tone22: { '‘요’': '말하듯이', '‘-ㅂ니다’': '조금 더 공손하게' }, bigEvent: '할아버지께서 큰 병에 걸리셨다', moodDef: '분위기', scene81: { 아침: '조용하고 우울하다', 선물: '행복하고 즐겁다' }, // 80~81쪽
  cat86: '고양이 그림을 걸면 쥐가 무서운 병을 집으로 못 가지고 온다고 생각해서', mood87: '답답하고 혼란스럽다', mind87: { 사람들: '병에 걸릴까 봐 두려운 마음', 박에스더: '미신으로 건강을 지키려는 사람들이 안타까운 마음' },
  teach84: '위생과 건강 상식', research89: ['인터넷에서 찾아보기', '책이나 자료에서 찾아보기', '주변 사람들에게 질문하기'], eval1: ['분위기가 잘 느껴지는 장면 고르기', '장면을 유창하게 읽을 방법을 계획', '장면을 떠올리며 유창하게 글을 읽었는지 확인'], // 84~89쪽 · 평가 자료 1
  car92: '자동차 주인이 누구인지 알기 위해서', phone92: '지역 번호', rrn92: '태어난 연도, 날짜, 남자인지 여자인지', role92: { 글은: '간략하게', 그림은: '한눈에' }, bus92: { '첫 번째': '출발지', '두 번째': '도착지' }, // 92쪽
  belt: '오방색', sticky98: '붙임쪽지', story100: '이야기에서 중요하거나 감동적인 장면', tiger160: '호랑이 모양의 지우개', media: '매체', newly: '새롭게 안 점', depRule: '띄어 써요' // 94~104쪽 · 지도서 159~160쪽
};
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|한다|다|요)$/, '');
const sameStem = (a, b) => { const x = stem(a), y = stem(b); return x === y || (x.length >= 6 && y.indexOf(x) === 0); };

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const WORD = (q) => { const m = clean(q).match(/「(.+?)」(?:이)?라는 뜻의 낱말/); ok(m, '낱말 뜻 물음 꼴 아님 ' + q); const ws = Object.keys(WORDS).filter(k => WORDS[k] === m[1]); ok(ws.length === 1, '사전에 없는 뜻 ' + m[1]); return ws[0]; };
const SYNQ = (q) => { const m = clean(q).match(/^「(.+?)」와 뜻이 비슷한 (?:낱말|표현)은 무엇일까요\?$/); ok(m && SYN[m[1]], '뜻이 비슷한 말 물음 꼴 아님 ' + q); return SYN[m[1]]; };
const optsT = (d) => d.options.map(o => clean(o.text));
const SYN_OPT = (d) => { const a = SYNQ(d.question), w0 = clean(d.question).match(/^「(.+?)」/)[1]; optsT(d).filter(t => t !== a).forEach(t => ok((SYN_DIST[w0] || []).indexOf(t) >= 0, '오답 보기가 교과서 보기에 없음 ' + t)); return a; };
const NOT_IN = (keysIn, others) => (d) => { const out = optsT(d).filter(t => keysIn.indexOf(t) < 0); ok(out.length === 1, '표에 없는 보기 ' + out.length); if (others) ok(others.indexOf(out[0]) >= 0, '「아닌 것」이 진짜 다른 갈래가 아님 ' + out[0]); return out[0]; };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
const PAUSEQ = (d) => { const m = clean(d.question).match(/^「(.+?)」를 알맞게 띄어 읽은/); ok(m, '띄어 읽기 물음 꼴'); const line = PAUSE69.find(l => l.replace(/∨/g, '') === m[1].replace(/\s+/g, ' ').replace(/∨/g, '') || l.replace(/∨/g, ' ').replace(/\s+/g, ' ') === m[1]); ok(line, '69쪽 예시에 없는 문장 ' + m[1]); return line.replace(/∨/g, '∨'); };
const LINKQ = (d) => { const r = LINK72.find(x => clean(d.question).indexOf(x[0]) >= 0); ok(r, '72쪽 친구 말 못 찾음'); return r[1]; };
const READQ = (q) => { const r = READ81.find(x => clean(q).indexOf(x[0]) >= 0); ok(r, '81쪽 세 칸 못 찾음 ' + q); return r[1]; };
const HEUNGQ = (txt, d) => { const r = HEUNG23.find(x => clean(txt).indexOf(x[0]) >= 0); ok(r && r[1].length === 1, '국어활동 23쪽 장면 못 찾음'); if (d) optsT(d).forEach(t => ok(VOICES.indexOf(t) >= 0, '보기 목소리 아님 ' + t)); return r[1][0]; };
const CSSQ = (q) => { const k = Object.keys(CSS93).filter(x => CSS93[x].some(it => nsp(q).indexOf(nsp(it)) >= 0)); ok(k.length === 1, '93쪽 표에서 ' + k.length); return k[0]; };
const COLORQ = (q) => { const g = COLOR24.find(x => x[1].every(c => clean(q).indexOf(c) >= 0)); ok(g, '색 이름 못 찾음'); return g[0]; };
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const EXP = {
  basic: {
    u2_l01: [S.sign68, S.arrow68, PAUSEQ],
    u2_l02: [LINKQ, AMONG(FLUENT73), AMONG(S.aut22)],
    u2_l03: [S.bigEvent, (d) => READQ(d.question), (d) => HEUNGQ(d.question, d)],
    u2_l05: [S.cat86, SYN_OPT, S.mood87],
    u2_l07: [S.car92, S.phone92, (d) => CSSQ(d.question)],
    u2_l08: [NOT_IN(Object.keys(STANCE94), MOVES94), S.belt, (d) => { const k = Object.keys(EX96).find(x => clean(d.question).indexOf(EX96[x]) >= 0); ok(k, '96쪽 예 못 찾음'); optsT(d).forEach(t => ok(FOUR96.indexOf(t) >= 0, '네 칸 밖 보기 ' + t)); return k; }],
    u2_l11: [S.story100, (d) => { const c = optsT(d).filter(t => SOCCER.그림.some(g => t.indexOf(g.match(/\d+[가-힣]+/)[0]) >= 0)); ok(c.length === 1, '그림 칸 보기 ' + c.length); optsT(d).filter(t => t !== c[0]).forEach(t => ok(SOCCER.글.some(g => t.indexOf(g) === 0), '오답이 글 칸에 없음 ' + t)); return c[0]; },
      (d) => { optsT(d).filter(t => t !== SINGER.글).forEach(t => ok(SINGER.그림.indexOf(t) >= 0, '오답이 그림 칸에 없음 ' + t)); return SINGER.글; }],
    u2_l13: [AMONG(CHECK103.ok), (d) => { const all = DANPUNG.join(' '); const c = optsT(d).filter(t => all.indexOf(t) >= 0); ok(c.length === 1, '104쪽 글과 같은 보기 ' + c.length); return c[0]; },
      (d) => { const k = Object.keys(NAME104).find(x => d.question.indexOf('「' + x + '」') >= 0); ok(k, '이름 못 찾음'); optsT(d).forEach(t => ok(FEAT104.indexOf(t) >= 0, '특징 밖 보기 ' + t)); return NAME104[k]; }]
  },
  lev: {
    u2_l01: [(q) => MARKS[clean(q).match(/표시 (∨+)는/)[1]], S.sign69], u2_l02: [S.willow, (q) => S.tone22[Object.keys(S.tone22).find(k => clean(q).indexOf(k + '로 끝나는 문장은 어떻게') >= 0)]],
    u2_l03: [S.moodDef, (q) => WORD(q)], u2_l05: [S.teach84, (q) => WORD(q)], u2_l07: [S.rrn92, (q) => COLORQ(q)], u2_l08: [BELT94[0] + ' 띠', (q) => WORD(q)],
    u2_l11: [S.tiger160, (q) => { const m = clean(q).match(/두 팀 (\d+)명/); ok(m && +m[1] === SOCCER.two, '22명'); return (+m[1] / 2) + '명'; }],
    u2_l13: [S.depRule, () => (DANPUNG.join(' ').match(/\S+ 줄(?= )/g) || []).join(', ')]
  },
  exit: {
    u2_l01: [(q) => Object.keys(MARKS).find(k => MARKS[k] === '쉬어 읽는 표시' && /쉬어 읽는 곳/.test(q)), S.arrowDir, (q) => S.unitParts.find(p => clean(q).indexOf(p) < 0)],
    u2_l02: [() => FLUENT73[1].split('길면 ')[1].replace(/는다$/, '어요'), () => FLUENT73[2].split('사이는 ')[1].replace(/는다$/, '어요'), (q) => WORD(q)],
    u2_l03: [(q) => S.scene81[Object.keys(S.scene81).find(k => clean(q).indexOf(k + ' 장면') >= 0)], (q) => READQ(q), (q) => WORD(q)],
    u2_l05: [(q) => S.mind87[Object.keys(S.mind87).find(k => clean(q).indexOf(k + '의 마음') >= 0)], (q) => SYNQ(q), (q) => S.research89.find(r => clean(q).indexOf(r) < 0)],
    u2_l07: [(q) => S.role92[Object.keys(S.role92).find(k => clean(q).indexOf(k) === 0)], (q) => S.bus92[Object.keys(S.bus92).find(k => clean(q).indexOf(k + ' 번호') >= 0)], (q) => CSSQ(q)],
    u2_l08: [(q) => Object.keys(STANCE94).find(k => clean(q).indexOf(STANCE94[k]) >= 0), FOUR96[3], S.sticky98],
    u2_l11: [S.media, S.newly, () => SOCCER.time + '분'],
    u2_l13: [() => DANPUNG.join(' ').match(/\S+ 수(?= )/)[0], (q) => Object.keys(NAME104).find(k => NAME104[k].some(f => clean(q).indexOf(f) >= 0)), (q) => { const r = LIFE103.find(x => clean(q).indexOf(x.slice(0, 8)) >= 0); ok(r, '생활 속으로 못 찾음'); return r.match(/(\S+)에도 집중/)[1]; }]
  },
  /* 넓히기 — 맥락에서 다시 푼다 */
  adv: {
    u2_l01: () => PAUSE69[0],
    u2_l02: (d) => { ok(/녹음해 들어 보니/.test(d.context), '녹음해 들은 뒤'); return RECORD134[3]; },
    u2_l03: (d) => HEUNGQ(d.challenge),
    u2_l05: (d) => { ok(/고르고/.test(d.context), '장면을 고른 뒤'); return S.eval1[1]; },
    u2_l07: (d) => { const g = COLOR24.find(x => clean(d.challenge).indexOf(x[0]) >= 0); ok(g, '느낌 못 찾음'); return g[1].join('·'); },
    u2_l08: (d) => { const r = FIX157.find(x => d.context.indexOf(x[0]) >= 0); ok(r, '의견 못 찾음'); return r[1]; },
    u2_l11: (d) => ['곰이', '펭이'].find(n => { const seg = d.context.split(/[.]/).find(x => x.indexOf(n) >= 0) || ''; return seg.indexOf('유창하게') >= 0; }),
    u2_l13: (d) => { const m = d.context.match(/「(.+?)」/); ok(m, '잘못 쓴 말'); return { exact: m[1].replace(/([가-힣])(것|수|줄)(?=[ 을를이가도]|$)/g, '$1 $2') }; }
  }
};

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { const d = s.data, at = k + ' ' + s.id; n++;
      let exp; try { exp = fx(EXP.basic[k][i])(d); } catch (e) { er.push(at + ' 풀이기 ' + e.message); return; }
      const cor = d.options.filter(o => o.correct).map(o => clean(o.text));
      if (Array.isArray(exp)) { if (!d.multi || !SAME(cor.slice().sort(), exp.slice().sort())) er.push(at + ' 모두 고르기 ' + cor.join('/') + ' ≠ ' + exp.join('/')); if (d.note.indexOf('**' + exp.length + '개**') < 0) er.push(at + ' 개수 풀이'); if (!/모두 고르세요\.$/.test(d.question)) er.push(at + ' 모두 고르기 물음 꼴'); if (exp.length >= d.options.length) er.push(at + ' 오답 보기 없음'); }
      else { if (d.multi || cor.length !== 1 || cor[0] !== clean(exp)) er.push(at + ' 정답 「' + cor.join('/') + '」 ≠ 사전 「' + exp + '」'); if (!new RegExp('\\*\\*' + String(exp).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note)) er.push(at + ' 풀이 끝 ≠ 정답'); }
      if (new Set(optsT(d)).size !== d.options.length) er.push(at + ' 같은 보기 둘'); });
    const lv = sl[11].data.levels; if (!(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true)) er.push(k + ' 수준 셋·심화 open');
    ['기본', '도전'].forEach((t, i) => { n++; let exp; try { exp = fx(EXP.lev[k][i])(lv[t].q); } catch (e) { er.push(k + ' ' + t + ' 풀이기 ' + e.message); return; }
      if (clean(lv[t].a) !== clean(exp)) er.push(k + ' ' + t + ' 「' + lv[t].a + '」 ≠ 사전 「' + exp + '」'); if (!(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a))) er.push(k + ' ' + t + ' 풀이 끝'); });
    sl[15].data.items.forEach((x, i) => { n++; let exp; try { exp = fx(EXP.exit[k][i])(x.q); } catch (e) { er.push(k + ' 출구 ' + (i + 1) + ' 풀이기 ' + e.message); return; } if (exp == null || clean(x.a) !== clean(exp)) er.push(k + ' 출구 ' + (i + 1) + ' 「' + x.a + '」 ≠ 사전 「' + exp + '」'); });
    const ad = sl[14].data, ae = EXP.adv[k]; n++;
    if (ae === OPEN) { if (!/^풀이: 여러 답/.test(ad.note) || !/까닭|근거/.test(ad.note)) er.push(k + ' 열린 넓히기 꼴'); }
    else { let exp; try { exp = fx(ae)(ad); } catch (e) { er.push(k + ' 넓히기 풀이기 ' + e.message); return; } const first = ((ad.note.match(/\*\*([^*]+)\*\*/) || [])[1]) || '';
      if (exp && exp.exact != null) { if (clean(first).replace(/[.]$/, '') !== clean(exp.exact).replace(/[.]$/, '')) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 고친 글 「' + exp.exact + '」(띄어쓰기까지)'); }
      else if (!exp || !sameStem(first, exp)) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 사전 「' + exp + '」'); } });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== 'g3s2_korean:u1_l13') er.push('l01 from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 1단원 u1_l13 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
function errBan(LX) { const er = [], all = JSON.stringify(LX); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); }); return er; }
/* 옛 덱(36차) 창작 장면·인물 — 새 덱에 남으면 안 됨 */
const OLD_NAMES = ['한슬', '예하', '우담', '다올', '나겸', '한울', '윤성', '태경', '빠른 읽기 대회', '날마다 같은 자리', '도서관은 어디에', '우산 안내문', '우산꽂이', '비 오는 날, 갠 날'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 작품·인물 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u2_l01: ['자전거 전용 도로', '그림을 보여 주면서 발표하니까 이해가 잘돼', '또박또박', '신호등', '남은 시간', '노란색 화살표', '오른쪽', '부딪칠', '∨', '∨∨', '주의 표지판', '노란색 배경', '진한 빨간색 선', '공사 중입니다. 조심히 지나가세요!', '지시', '주의', '학습 계획'],
  u2_l02: ['재미난책보', '가구', '살림 도구', '장난감', '종이', '악기', '기둥', '대들보', '서까래', '버드나무', '열을 내리고 통증을 달래', '은행나무', '플라타너스', '공해에 강하고', '잔털', '나무로 만든 집에서 잔 적이', '과일의 종류', '은행나무를 왜 심었는지', '감나무잎', '누가/무엇이', '녹음 시작', '정지', '재생', '아쉬운 부분', '반복', '나무로 집도 만듭니까?', '가을 나들이에 주의합시다', '고은', '승우', '혜윤', '말하듯이', '공손하게', '정확한 발음과 적절한 속도'],
  u2_l03: ['신기한 구슬', '원유순', '환상적이다', '신비롭다', '할아버지', '큰 병', '미역국', '괜찮아. 생일은 뭐 내년에도 있잖아.', '터덜터덜', '송이', '노란 보자기', '애걔', '뾰로롱', '불호령', '야속했다', '서운', '고마', '장면에서 느껴지는 기분', '인물이 처한 상황', '인물의 말이나 행동', '인물의 마음', '조용하고 우울', '행복하고 즐거', '실감 나게', '표정과 몸짓', '목소리', '어찌하다', '문장 부호', '꾸며 주는 말', '흥부', '제비', '명랑하다', '반갑다', '울먹이다', '슬프다', '놀라다', '속상하다', '강토에게 마음을 전하는 글', '성격'],
  u2_l05: ['박에스더', '보구녀관', '로제타', '외딴곳', '여자 환자', '당나귀', '왕진 가방', '1902년', '콜레라', '선생님은 콜레라가 무섭지도 않으세요?', '고양이 그림', '미신', '깨끗한 물', '손을 자주 씻', '위생과 건강 상식', '묻고 답하기', '한겨울에 무엇을 타고', '다짐하다', '되새기다', '곱씹다', '치료하다', '낫게 하다', '답답하고 혼란스러', '존경스러', '안타깝', '인터넷', '책이나 자료', '주변 사람', '유현민', '학급 신문', '윤희순', '이순신', '손기정', '소방관', '환경미화원', '위인에게만', '평가 자료 1', '꿈이나 목표'],
  u2_l07: ['픽토그램', '양궁', '배드민턴', '태권도', '탁구', '이름처럼 쓰는 숫자', '황지영', '구별', '자동차 번호판', '버스 번호', '출발지', '도착지', '1211', '전화번호', '지역 번호', '서울', '주민 등록 번호', '태어난 연도', '초록색', '간략하게', '한눈에', '색, 크기, 모양', '승용차보다 번호판을 크게', '지도', '주목', '별', '사탕', '낙엽', '빨강', '노랑', '파랑', '청록', '유현민', '취미', '좋아하는 음식', '생일', '꿈'],
  u2_l08: ['창의성 계발 학습 모형', '일기 예보', '6도', '19도', '7도', '18도', '단풍', '파란 숫자', '빨간 숫자', '앞서기', '주춤서기', '앞굽이 서기', '얼굴 막기', '몸통막기', '아래 막기', '앞 차기', '돌려차기', '옆 차기', '흰색', '검은색', '오방색', '품새', '겨루기', '집중력', '상대를 존중', '제목과 내용', '색, 크기, 모양', '얼개', '파란색으로 본문보다 크게', '화살표', '밑줄', '표현과 배치', '알림판', '붙임쪽지', '잘한 점', '비빔밥', '환경', '올림픽', '평가 자료 2', '제목을 더 크게'],
  u2_l11: ['이런 활동 어때요', '짧은 이야기', '감동적인', '차례', '전우치전', '새롭게 안 점', '직업', '적성', '가수', '마이크와 음표', '컴퓨터', '호랑이 모양의 지우개', '생일', '동물원', '필통', '축구', '90분', '22명', '11명', '성취기준', '긍정적'],
  u2_l13: ['스스로 확인하기', '띄어 가며', '목소리와 말투', '무조건 빠르게', '밝은 목소리', '그림도 꼼꼼히', '그림에도 집중', '단풍 구경', '온 것', '느낄 수', '붉은 것', '노란 것', '푸른 것', '가는 줄', '된 줄', '스탠드', '빛을 낸다', '목이 움직인다', '끄덕끄덕등', '책짝꿍', '도구', '속도', '교가', '용기', '구슬', '눈물', '우유', '교육', 'ㅗ·ㅛ·ㅜ·ㅠ', '나무는 다른 나무와 풀, 온갖 동물과 어우러져 숲을 이룹니다.', '달빛 조각', '윤강미']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u2.js 407~437줄) 29장의 핵심 낱말 — 본류 장(그림 포함 · extras 아님)에 있어야 한다 */
const ABSORB = {
  u2_l01: [['생각 열기 — 자전거 전용 도로 표지판 발표', ['자전거 전용 도로', '그림을 보여 주면서', '또박또박', '유창하게 읽']], ['횡단보도 근처의 기호', ['신호등', '남은 시간', '노란색 화살표', '오른쪽', '부딪칠']], ['주의 표지판 글 띄어 읽기', ['∨', '노란색 배경', '진한 빨간색 선', '공사 중입니다', '지시', '주의', '안전 교육']]],
  u2_l02: [['「나무」 소리 내어 읽고 묻고 답하기', ['재미난책보', '가구', '살림 도구', '장난감', '종이', '악기', '열을 내리고 통증을 달래', '공해에 강하고']], ['아는 점·궁금한 점·새롭게 안 점으로 읽기', ['나무로 만든 집에서 잔 적이', '과일의 종류', '은행나무를 왜 심었는지', '감나무잎', '누가/무엇이']], ['녹음하고 다시 듣기 · 스스로 확인', ['녹음 시작', '정지', '재생', '아쉬운 부분', '정확한 발음과 적절한 속도', '나무로 집도 만듭니까?', '사람마다']], ['국어활동 22쪽 — 「가을 나들이에 주의합시다」', ['가을 나들이에 주의합시다', '고은', '승우', '혜윤', '말하듯이', '공손하게']]],
  u2_l03: [['「신기한 구슬」 읽기 전·내용 알기', ['원유순', '환상적이다', '신비롭다', '할아버지', '큰 병', '서운', '고마']], ['장면의 분위기 세 칸 정리', ['인물이 처한 상황', '인물의 말이나 행동', '인물의 마음', '조용하고 우울', '아이고, 내 정신 좀 봐', '행복하고 즐거', '성격']], ['분위기를 살려 읽는 방법 정리', ['실감 나게', '표정과 몸짓', '목소리', '어찌하다', '문장 부호', '꾸며 주는 말', '동영상']], ['국어활동 23쪽 — 장면에 어울리는 목소리와 표정', ['흥부', '제비', '명랑하다', '반갑다', '울먹이다', '놀라다', '속상하다', '강토에게 마음을 전하는 글']]],
  u2_l05: [['「박에스더」 묻고 답하기 놀이', ['꿈이나 목표', '고양이 그림', '당나귀', '묻고 답하기', '주요 내용']], ['낱말 알기 · 장면의 분위기', ['다짐하다', '곱씹다', '낫게 하다', '답답하고 혼란스러', '미신']], ['글과 잇기 · 자신과 관련짓기', ['존경스러', '위생 교육', '로제타', '편지']], ['세상과 잇기 — 인물 모으기', ['인터넷', '책이나 자료', '주변 사람', '유현민', '윤희순', '이순신', '손기정', '소방관', '환경미화원', '평가 자료 1']]],
  u2_l07: [['픽토그램 알아맞히기 · 「이름처럼 쓰는 숫자」', ['양궁', '배드민턴', '태권도', '탁구', '황지영', '자동차', '지역 번호', '주민 등록 번호']], ['버스 번호 — 글과 그림을 이어 읽기', ['초록색', '출발지', '도착지', '1211', '간략하게', '한눈에']], ['색·크기·모양 표 · 바꾸어 표현하기', ['색', '크기', '모양', '번호판', '지도', '주목']], ['국어활동 24~25쪽 — 그림 보고 문장 쓰기 · 유현민 소개', ['별', '사탕', '낙엽', '빨강', '파랑', '유현민', '취미', '생일']]],
  u2_l08: [['일기 예보로 본 글과 그림', ['일기 예보', '파란', '빨간', '한눈에', '6도', '19도']], ['태권도 글 가~라 읽고 발표할 내용 정하기', ['앞서기', '주춤서기', '앞굽이 서기', '얼굴 막기', '돌려차기', '오방색', '흰색 띠', '품새', '겨루기']], ['발표 자료 네 칸과 얼개 짜기', ['제목과 내용', '그림', '색, 크기, 모양', '얼개', '파란색', '화살표', '밑줄', '표현과 배치']], ['알림판 전시·붙임쪽지 · 스스로 확인 · 더 나아가기', ['알림판', '붙임쪽지', '잘한 점', '중심 내용', '비빔밥', '환경', '올림픽', '평가 자료 2']]],
  u2_l11: [['글과 그림을 활용해 짧은 이야기 소개하기', ['짧은 이야기', '감동적인', '차례', '전우치전', '새롭게 안 점']], ['관심 있는 직업 발표하기', ['직업', '적성', '가수', '마이크와 음표', '컴퓨터']], ['우리 반 활동 예시 — 물건 소개 · 올림픽 종목', ['호랑이 모양', '지우개', '동물원', '축구', '90분', '22명', '성취기준']]],
  u2_l13: [['스스로 확인하기 · 생활 속으로', ['띄어 가며', '목소리와 말투', '무조건 빠르게', '밝은 목소리', '그림도 꼼꼼히', '그림에도 집중']], ['「단풍 구경」 것·수·줄 · 사물 이름 짓기', ['온 것', '느낄 수', '붉은 것', '가는 줄', '된 줄', '끄덕끄덕등', '책짝꿍', '빛을 낸다']], ['글씨 쓰기 · 「국어활동」 스스로 읽기 「달빛 조각」', ['도구', '속도', '교가', '용기', '구슬', '눈물', '우유', '교육', '달빛 조각', '윤강미']]]
};
const OLD_FILES = { u2_l01: 'g3_kor_u2_l01.html', u2_l02: 'g3_kor_u2_l02.html', u2_l03: 'g3_kor_u2_l03_04.html', u2_l05: 'g3_kor_u2_l05_06.html', u2_l07: 'g3_kor_u2_l07.html', u2_l08: 'g3_kor_u2_l08_10.html', u2_l11: 'g3_kor_u2_l11_12.html', u2_l13: 'g3_kor_u2_l13.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u2_l01: '배울 내용 살펴보기', u2_l02: '글을 유창하게 읽을 수 있는지 점검하기', u2_l03: '분위기를 살려 유창하게 읽는 방법 알기', u2_l05: '장면을 떠올리며 유창하게 글 읽기', u2_l07: '글과 그림을 활용하여 설명하는 방법 알기', u2_l08: '글과 그림을 활용하여 발표하기', u2_l11: '배운 내용 실천하기', u2_l13: '마무리하기' };
const PAGES = { u2_l01: '130~131', u2_l02: '132~135', u2_l03: '136~141', u2_l05: '142~147', u2_l07: '148~151', u2_l08: '152~157', u2_l11: '158~161', u2_l13: '162~163' };
const GOAL = { u2_l01: '배울 내용을 살펴볼 수 있다.', u2_l02: '글을 유창하게 읽을 수 있는지 점검할 수 있다.', u2_l03: '분위기를 살려 유창하게 읽는 방법을 안다.', u2_l05: '장면을 떠올리며 유창하게 글을 읽을 수 있다.', u2_l07: '글과 그림을 활용하여 설명하는 방법을 안다.', u2_l08: '글과 그림을 활용하여 발표할 수 있다.', u2_l11: '배운 내용을 실천할 수 있다.', u2_l13: '배운 내용을 마무리할 수 있다.' };
const STDT = { '02-01': '글의 의미를 파악하며 유창하게 글을 읽는다.', '01-05': '목적과 주제에 알맞게 자료를 정리하여 자신감 있게 발표한다.', '06-02': '매체를 활용하여 간단한 발표 자료를 만든다.' };
const STDC = { u2_l01: ['02-01', '01-05', '06-02'], u2_l02: ['02-01'], u2_l03: ['02-01'], u2_l05: ['02-01'], u2_l07: ['01-05', '06-02'], u2_l08: ['01-05', '06-02'], u2_l11: ['02-01', '01-05', '06-02'], u2_l13: ['02-01', '01-05', '06-02'] };

/* 1단원 마지막 차시 — 파일에서 동적으로 읽음 */
const P1 = load(path.join(TDIR, 'data/g3s2_korean_u1.js'));
const PEXIT = P1.u1_l13.slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => s.data))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 ── */
const inOrder = (txt, kws) => { let p = -1; return kws.every(kw => { const q = txt.indexOf(kw, p + 1); if (q < 0) return false; p = q; return true; }); };
const figLines = (f) => (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).join(' | ');
function errOrder(LX) { const er = [];
  const rc = LX.u2_l02.slides[6].data.fig; if (!(rc && rc.k === 'chain' && rc.items.length === 4)) er.push('l02 녹음 차례 그림'); else rc.items.forEach((it, i) => { if (RECORD134[i].indexOf(it.name) < 0) er.push('l02 녹음 차례 ' + (i + 1) + ' 「' + it.name + '」 ≠ 134쪽 ' + (i + 1) + '단계'); });
  const rd = LX.u2_l03.slides[6].data.fig; if (!(rd && rd.k === 'tools' && SAME(rd.items.map(x => x.name), READ81.map(r => r[0])) && rd.items.every((x, i) => x.kind.indexOf(READ81[i][1]) === 0))) er.push('l03 세 칸 → 읽는 방법 ≠ 81쪽');
  if (!inOrder(figLines(LX.u2_l03.slides[3].data.fig), ['손꼽아', '큰 병', '괜찮아', '터덜터덜'])) er.push('l03 「신기한 구슬」 ① 사건 차례');
  if (!inOrder(figLines(LX.u2_l03.slides[4].data.fig), ['할머니', '아이고', '애걔', '뾰로롱'])) er.push('l03 「신기한 구슬」 ② 사건 차례');
  if (!inOrder(figLines(LX.u2_l05.slides[3].data.fig) + figLines(LX.u2_l05.slides[4].data.fig), ['의사가 되어서', '1902년', '무섭지도', '두려워요', '고양이 그림', '손을 자주 씻'])) er.push('l05 「박에스더」 사건 차례');
  const fo = LX.u2_l08.slides[5].data.fig; if (!(fo && fo.k === 'chain' && fo.items.length === 4 && fo.items.every((x, i) => FOUR96[i].indexOf(x.name) === 0))) er.push('l08 발표 자료 네 칸 차례 ≠ 96쪽');
  if (LX.u2_l08.slides[16].data.arrows[0] !== CREATIVE.join(' → ')) er.push('l08 창의성 계발 학습 모형 네 단계');
  const sc = LX.u2_l11.slides[3].data.fig; if (!(sc && sc.k === 'chain' && sc.items.length === 3 && sc.items.every((x, i) => x.name.indexOf(STEPS100[i]) >= 0))) er.push('l11 짧은 이야기 소개 세 단계 ≠ 100쪽 ①②③');
  if (!inOrder(LX.u2_l05.slides[14].data.note, ['읽을 방법을 계획', '마음을 짐작', '목소리', '확인'])) er.push('l05 평가 자료 1 차례');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'pause', 'mood', 'sort2', 'note', 'link', 'tools', 'chain'];
function errFigs(LX) { const er = []; let nF = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품'); /* panels 한 칸 = 글 상자 min-width 풀기(실렌더 — 정답 공개 때 480 칸) */
    let h = ''; try { h = FIG.render(f); } catch (e) { er.push(at + ' 렌더 예외 ' + e.message); return; } if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); });
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)');
      if (f.k === 'text' || f.k === 'letter' || f.k === 'sort2') er.push(at + ' 기본 문제의 글 상자·두 갈래 통은 panels 로 감싸기(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'note' && f.items.length > 7) er.push(at + ' 메모 ' + f.items.length + '줄'); } }));
  /* 띄어 읽기 줄 = 69쪽 예시(줄 끝 ∨∨) */
  const pz = LX.u2_l01.slides[6].data.fig; if (!(pz.k === 'pause' && pz.lines.length === 3 && pz.lines.every((l, i) => l === PAUSE69[i] + '∨∨'))) er.push('l01 띄어 읽기 줄 ≠ 69쪽 예시 답안');
  /* 소단원 차시 이름 = 지도서 차시 표 */
  const un = LX.u2_l01.slides[4].data.fig; if (!(un.k === 'sort2' && SAME(un.a.items, ['u2_l02', 'u2_l03', 'u2_l05'].map(k => TITLE[k])) && SAME(un.b.items, ['u2_l07', 'u2_l08'].map(k => TITLE[k])) && un.a.name.indexOf(S.unitParts[0]) >= 0 && un.b.name.indexOf(S.unitParts[1]) >= 0)) er.push('l01 소단원 차시 이름 ≠ 지도서 128쪽 차시 표');
  /* 1211 = 첫째 자리 출발지 · 둘째 자리 도착지(게이트가 숫자를 쪼개 셈) */
  const bus = LX.u2_l07.slides[4].data.fig; const row = (bus.rows || []).find(r => /1211/.test(r[1])); if (!row) er.push('l07 1211 줄 없음'); else { const d = '1211'.split(''); if (row[1].indexOf(d[0] + '번 지역에서 ' + d[1] + '번 지역으로') < 0) er.push('l07 1211 ≠ ' + d[0] + '번 → ' + d[1] + '번 「' + row[1] + '」'); }
  /* 색 크기 모양 표 · 세 칸 분위기 · 축구 · 단풍 구경 · 스탠드 · 스스로 확인 */
  const cs = LX.u2_l07.slides[6].data.fig; Object.keys(CSS93).forEach((key, i) => { const r = cs.rows[i]; if (!r || r[0].indexOf(key) < 0 || CSS93[key].some(it => r[1].indexOf(it) < 0)) er.push('l07 색 크기 모양 표 「' + key + '」 ≠ 93쪽'); });
  [['u2_l03', 5, S.scene81.아침], ['u2_l05', 6, S.mood87]].forEach(([k, si, md]) => { const f = LX[k].slides[si].data.fig; if (!(f.k === 'link' && SAME(f.rows.map(r => r[0]), CELLS) && f.rows[3][1] === md)) er.push(k + ' 세 칸 표 · 분위기 ≠ ' + md); });
  const sc = LX.u2_l11.slides[6].data.fig; if (!(sc.k === 'sort2' && SAME(sc.a.items, SOCCER.글) && SAME(sc.b.items, SOCCER.그림))) er.push('l11 축구 글·그림 표 ≠ 지도서 161쪽');
  const dp = LX.u2_l13.slides[5].data.fig; if (!(dp.k === 'text' && SAME(dp.lines.map(l => String(l).replace(/\*\*/g, '')), DANPUNG))) er.push('l13 「단풍 구경」 ≠ 104쪽'); else if ((figLines(dp).match(/\*\*(것|수|줄)\*\*/g) || []).length !== 7) er.push('l13 파란 글자(것·수·줄) 7개');
  const st = LX.u2_l13.slides[6].data.fig; if (!(st.k === 'link' && st.rows.every(r => { const nmn = clean(r[1]); return NAME104[nmn] && NAME104[nmn].every(f => r[0].indexOf(f) >= 0); }))) er.push('l13 스탠드 이름 ≠ 104쪽');
  const ck = LX.u2_l13.slides[3].data.fig; if (!(ck.k === 'sort2' && SAME(ck.a.items, CHECK103.ok) && SAME(ck.b.items, CHECK103.no))) er.push('l13 스스로 확인 ○2 ✕2 ≠ 103쪽');
  return { er, nF }; }

/* ── 제재(작품) — 제목·지은이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [
  { t: '나무', a: '재미난책보', page: '「국어」 교과서 70', cap: 4 }, { t: '신기한 구슬', a: '원유순', page: '「국어」 교과서 74', cap: 4 }, { t: '박에스더', page: '「국어」 교과서 82', cap: 4 },
  { t: '이름처럼 쓰는 숫자', a: '황지영', page: '「국어」 교과서 90', cap: 4 }, { t: '가을 나들이에 주의합시다', page: '「국어활동」 22쪽', cap: 4 }, { t: '달빛 조각', a: '윤강미', cap: 4 }];
function quotedOf(LX, t) { const set = new Set(); KEYS.forEach(k => LX[k].slides.forEach(s => { const figs = []; const f0 = s.data.fig; if (!f0) return; if (f0.k === 'panels') f0.items.forEach(it => figs.push(it.fig)); else figs.push(f0);
  figs.forEach(f => { if (f.k !== 'text' || String(f.title || '').indexOf('「' + t + '」') < 0) return; (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); }); })); return set; }
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { if (all.indexOf('「' + wk.t + '」') < 0) er.push('「' + wk.t + '」 제목 없음');
    if (wk.a) { const re = new RegExp('「' + wk.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '」[^「」]{0,6}' + wk.a.split(' ')[0]); if (!re.test(all)) er.push('「' + wk.t + '」 지은이 ' + wk.a + ' 함께 없음'); }
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk.t); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  return er; }

/* ── 선행 ── */
const FIRST = [['누가/무엇이', 'u2_l02'], ['녹음', 'u2_l02'], ['분위기', 'u2_l03'], ['인물이 처한 상황', 'u2_l03'], ['신기한 구슬', 'u2_l03'], ['박에스더', 'u2_l05'], ['묻고 답하기', 'u2_l05'],
  ['픽토그램', 'u2_l07'], ['색, 크기, 모양', 'u2_l07'], ['얼개', 'u2_l08'], ['오방색', 'u2_l08'], ['이런 활동 어때요', 'u2_l11'], ['것·수·줄', 'u2_l13'], ['끄덕끄덕등', 'u2_l13']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = teach(LX, k).indexOf(t) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('8차시 키(지도서 묶음 첫 번호 1·2·3·5·7·8·11·13) · 파일 data/g3s2_korean_u2.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 2단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 127쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 2 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 2단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/2단원_유창하게읽고발표해요/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 낭독 발표회', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 520분(8~10차시 120분)', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); if (a !== b) ok(m.title.indexOf(a + '~' + b + '차시') >= 0, k + ' 묶음 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 520 && L.u2_l08.meta.duration_min === 120, '분'); });
T('[4국02-01] 차시 = 1·2·3~4·5~6(평가 자료 1)·11~12·13 · [4국01-05]·[4국06-02] = 1·7·8~10(평가 자료 2)·11~12·13', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join(); ok(has('02-01') === 'u2_l01,u2_l02,u2_l03,u2_l05,u2_l11,u2_l13', has('02-01')); ok(has('06-02') === 'u2_l01,u2_l07,u2_l08,u2_l11,u2_l13' && has('01-05') === has('06-02'), has('06-02')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·pause·mood·sort2·note·link·tools·chain·panels)', () => PARTS_USED.concat('panels').forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 152장 (8 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 152, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 8종 서로 다름 · 3-2 국어 다른 단원(1·3~6단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 8, im.join(',')); let other = []; [1, 3, 4, 5, 6].forEach(u => { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); }); ok(other.length > 20 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자 · 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 1단원 마지막 차시(g3s2_korean u1_l13) 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 3단원 정확하게 글을 써요 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u2_l13.slides[18].data; ok(nx.title === '다음 단원엔' && /정확하게 글을 써요/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표) ═══');
const EA = errAnswers(L);
T('기본 24 · 수준별 기본·도전 16 · 출구 24 · 넓히기 8 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 72', () => ok(EA.n === 72, EA.n));
T('모두 고르기 ≥ 3 · 낱말 뜻 물음 ≥ 5 · 뜻이 비슷한 말 물음 ≥ 2(사전이 실제로 쓰임)', () => { let ms = 0, wq = 0, sq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/라는 뜻의 낱말/.test(q)) wq++; if (/와 뜻이 비슷한/.test(q)) sq++; }); ok(ms >= 3 && wq >= 5 && sq >= 2, ms + '/' + wq + '/' + sq); });
T('풀이기 자체 확인 — 뜻 역찾기 · 뜻이 비슷한 말 · 띄어 읽기 줄 찾기 · 띄어쓰기 고침 · 틀린 것 잡음', () => { ok(WORD('「분한 마음」이라는 뜻의 낱말은 무엇일까요?') === '부아' && SYNQ('「되새기다」와 뜻이 비슷한 낱말은 무엇일까요?') === '곱씹다', '역찾기');
  ok(PAUSEQ({ question: '「우리는 길을 걸을 때 주의 표지판을 자주 봅니다.」를 알맞게 띄어 읽은 것은 무엇일까요?' }) === PAUSE69[0], '띄어 읽기 줄'); ok(EXP.adv.u2_l13({ context: '「느낄수 있는 것」' }).exact === '느낄 수 있는 것', '띄어쓰기 고침');
  let c = 0; try { WORD('「아주 빠르게」라는 뜻의 낱말은 무엇일까요?'); } catch (e) { c++; } try { SYNQ('「달리다」와 뜻이 비슷한 낱말은 무엇일까요?'); } catch (e) { c++; } try { PAUSEQ({ question: '「나는 학교에 갑니다.」를 알맞게 띄어 읽은 것은 무엇일까요?' }); } catch (e) { c++; } ok(c === 3, '안 걸리는 것 못 잡음'); });

console.log('═══ F. 차례 사슬 ═══');
T('녹음 차례(134쪽) · 세 칸 → 읽는 방법(81쪽) · 「신기한 구슬」·「박에스더」 사건 차례 · 발표 자료 네 칸(96쪽) · 창의성 계발 네 단계 · 짧은 이야기 세 단계 · 평가 자료 1 차례', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });
T('유창하게 읽는 방법 출구 = 73쪽 방법 문장을 잘라 다시 만든 말(「길면」·「사이는」 뒤 + 「어요」)', () => { const ex = L.u2_l02.slides[15].data.items; ok(ex[0].a === FLUENT73[1].split('길면 ')[1].replace(/는다$/, '어요') && ex[1].a === FLUENT73[2].split('사이는 ')[1].replace(/는다$/, '어요'), ex[0].a + ' / ' + ex[1].a); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 띄어 읽기 줄 = 69쪽 · 소단원 차시 이름 · 1211 · 색 크기 모양 표 · 세 칸 · 축구 · 단풍 구경 · 스탠드 · 스스로 확인 · 문제 그림 정답 숨김 · 문제 카드 ≤ 3', () => ok(!EF.er.length, EF.er.slice(0, 6).join(' | ')));
T('개념 32장 · 기본 문제 24장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 32 && p === 24, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 · 기본 문제 글 상자 잡음', () => { const X = clone(L); X.u2_l07.slides[9].data.fig = { k: 'tools', items: [{ name: '지역 번호' }] }; X.u2_l01.slides[8].data.fig.items.push({ name: 'a' }, { name: 'b' }); X.u2_l02.slides[3].data.fig = { k: 'zzz' }; X.u2_l05.slides[9].data.fig = X.u2_l05.slides[9].data.fig.items[0].fig;
  const e = errFigs(X).er.join(' | '); ok(/정답 「지역 번호」/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e) && /panels 로 감싸기/.test(e), e.slice(0, 240)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u2_l13') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「태권도」 · l11 에 「신기한 구슬」 없음)', () => { ok(nsp(JSON.stringify(L.u2_l02)).indexOf('태권도') < 0, 'l02'); ok(nsp(JSON.stringify(L.u2_l11)).indexOf('신기한구슬') < 0, 'l11'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 29, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
T('한 차시 안에서 같은 물음 중복 0 · 수준별 기본·도전 물음 ≠ 기본 문제·출구 물음', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));
T('src 회수 키 = 옛 src file 칸(자기주도 파일 이름) 그대로 — 투영 지도 바뀜 0', () => KEYS.forEach(k => ok(SRC[k].file === OLD_FILES[k], k + ' ' + SRC[k].file)));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 분 · 물음 끝맺음 · 지도서 유의점 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 — 40분 차시 30~45 · 80분 묶음 60~80 · 120분 묶음 90~120', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0), d = L[k].meta.duration_min; ok(d === 40 ? m >= 30 && m <= 45 : d === 80 ? m >= 60 && m <= 80 : m >= 90 && m <= 120, k + ' ' + m + '분/' + d); }));
T('학생이 읽는 물음 끝 = 「요?」(모두 고르기만 「세요.」) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question, s.data.multi])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach(x => qs.push([k + ' 출구', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q, ms]) => { const t = clean(q); return ms ? !/모두 고르세요\.$/.test(t) : !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의점이 교사 층에 — 호기심·정답 제시보다·지시·안전 교육(l01) · 사람마다·목소리와 말투·시범·기기·문장의 짜임(l02) · 성격에 따라·밝은 분위기·까닭을 함께·3학년 1학기(l03) · 사소해 보이는·위인에게만·주요 내용과 장면의 분위기·위인전의 갈래(l05) · 이어서·순서를 달리·주목·교실 안내 문구(l07) · 창의성 계발·표현과 배치가 다를·충분한 시간·존중(l08) · 성취기준·긍정적(l11) · 모든 것 수 줄·보조선·스스로(l13)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u2_l01', [/호기심/, /정답을 제시하기보다/, /지시/, /안전 교육/]], ['u2_l02', [/사람마다/, /목소리와 말투/, /시범/, /기기/, /문장의 짜임/]], ['u2_l03', [/성격에 따라/, /밝은 분위기/, /까닭을 함께/, /3학년 1학기/]], ['u2_l05', [/사소해 보이는/, /위인에게만/, /주요 내용과 장면의 분위기/, /위인전의 갈래/]],
   ['u2_l07', [/이어서/, /순서를 달리/, /주목/, /교실 안내 문구/]], ['u2_l08', [/창의성 계발/, /표현과 배치가 다를/, /충분한 시간/, /존중/]], ['u2_l11', [/성취기준/, /긍정적/]], ['u2_l13', [/모든 ‘것’, ‘수’, ‘줄’을 띄어 쓰는 것이 아니/, /보조선/, /스스로/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u2 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ N. 제재 — 제목·지은이 · 쪽 안내 · 인용 줄 ═══');
T('작품 ' + WORKS.length + '편 — 제목 · 제목 곁에 지은이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판 전부 · [간추림]·→ 빼고)', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('이야기·설명 글 판(「나무」·「신기한 구슬」·「박에스더」·「이름처럼 쓰는 숫자」)에는 [간추림] 줄과 「→ 「국어」 교과서 ○○쪽」 안내가 함께 있음', () => { [['u2_l02', 3], ['u2_l03', 3], ['u2_l03', 4], ['u2_l05', 3], ['u2_l05', 4], ['u2_l07', 3]].forEach(([k, si]) => { const f = L[k].slides[si].data.fig; ok(f.k === 'text' && f.lines.some(l => /^\[간추림\]/.test(l)) && f.lines.some(l => /^→ 「국어」 교과서 \d+/.test(l)), k + ' ' + si); }); });
T('인용 셈 자체 확인 — 「신기한 구슬」 지금 4줄 · 한 줄 더하면 5', () => { ok(quotedOf(L, '신기한 구슬').size === 4, quotedOf(L, '신기한 구슬').size); const X = clone(L); X.u2_l03.slides[3].data.fig.lines.splice(1, 0, '강토의 가슴속에는 촛불 하나가 환하게 밝혀졌다.'); ok(quotedOf(X, '신기한 구슬').size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l02 오개념 = 띄어 읽는 곳은 사람마다 달라도 됨 · l08 = 표현과 배치가 다를 수 있음', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/사람마다/.test(L.u2_l02.slides[7].data.right) && /표현과 배치가 다를/.test(L.u2_l08.slides[7].data.right), '오개념'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l07 ② 지역 번호 → 태어난 날짜)', X => { const d = X.u2_l07.slides[9].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('출구 낱말 뜻 정답 바꿈(l03 야속했다 → 부아)', X => { X.u2_l03.slides[15].data.items[2].a = '부아'; }, X => errAnswers(X).er);
red('뜻이 비슷한 말 정답 바꿈(l05 출구 낫게 하다 → 활용하다)', X => { X.u2_l05.slides[15].data.items[1].a = '활용하다'; }, X => errAnswers(X).er);
red('축구 한 팀 셈 틀림(l08·l11 도전 11명 → 22명)', X => { X.u2_l11.slides[11].data.levels.도전.a = '22명'; }, X => errAnswers(X).er);
red('흥부와 제비 목소리 틀림(l03 넓히기 놀라다 → 반갑다)', X => { X.u2_l03.slides[14].data.note = X.u2_l03.slides[14].data.note.replace('**놀라다**', '**반갑다**'); }, X => errAnswers(X).er);
red('띄어쓰기 고친 글 틀림(l13 넓히기 「가는 줄」 → 「가는줄」)', X => { X.u2_l13.slides[14].data.note = X.u2_l13.slides[14].data.note.replace('**시간 가는 줄 모르고 놀았다**', '**시간 가는줄 모르고 놀았다**'); }, X => errAnswers(X).er);
red('복습 계보 끊음(l05 복습 한 줄 바꿈)', X => { X.u2_l05.slides[1].data.items[0].a = '기쁘다'; }, errReview);
red('l01 복습을 1단원 아닌 것으로', X => { X.u2_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l05 개념 「다짐하다는 결심하다」)', X => { X.u2_l05.slides[5].data.content += ' 다짐하다는 결심하다와 뜻이 비슷해요.'; }, errBan);
red('보탬 카드 b_l3_1 되살림', X => { X.u2_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '신기한 구슬' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지우고 extras 로만(l11 전우치전)', X => { X.u2_l11.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/전우치전/g, '옛이야기')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l07 1211)', X => { X.u2_l07 = JSON.parse(JSON.stringify(X.u2_l07).replace(/1211/g, '버스')); }, errTB);
red('인용 줄 넘침(「신기한 구슬」 원문 한 줄 더함)', X => { X.u2_l03.slides[4].data.fig.lines.splice(1, 0, '“오빠, 생일 축하해.”'); }, errWorks);
red('지은이 지움(「신기한 구슬」 원유순)', X => { X.u2_l03 = JSON.parse(JSON.stringify(X.u2_l03).replace(/원유순/g, '')); }, errWorks);
red('발표 자료 네 칸 차례 바꿈(l08 그림 ↔ 색, 크기, 모양)', X => { const it = X.u2_l08.slides[5].data.fig.items; [it[1], it[2]] = [it[2], it[1]]; }, errOrder);
red('띄어 읽기 줄 틀림(l01 「주의 표지판은∨」 → 「주의∨표지판은」)', X => { X.u2_l01.slides[6].data.fig.lines[1] = '주의∨표지판은 노란색 배경에∨진한 빨간색 선이 둘려 있습니다.∨∨'; }, X => errFigs(X).er);
red('1211 풀이 거꾸로(l07 「2번 지역에서 1번 지역으로」)', X => { const r = X.u2_l07.slides[4].data.fig.rows[2]; r[1] = '1211번은 2번 지역에서 1번 지역으로'; }, X => errFigs(X).er);
red('문제 그림에 정답 보임(l13 ③ 스탠드 카드에 「목이 움직인다」)', X => { X.u2_l13.slides[10].data.fig.items[0].kind = '목이 움직인다'; }, X => errFigs(X).er);
red('인물 바꿈(l07 곰이 → 한슬)', X => { X.u2_l07.slides[2].data.kids[0].label = '한슬\n"어?"'; }, errPeople);
red('선행 말 앞당김(l02 개념에 「분위기」)', X => { X.u2_l02.slides[3].data.content += ' 분위기를 살려 읽어요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
