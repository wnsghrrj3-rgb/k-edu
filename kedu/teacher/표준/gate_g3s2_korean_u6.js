/* gate_g3s2_korean_u6.js — 3학년 2학기 국어 6단원 「감상과 표현의 즐거움」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g3s2_korean_u1·u2 틀 + 국어 사전 대조).
   옛 게이트(40차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u6.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 6단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 9종 서로 다름 · 3-2 국어 다른 단원과 겹침 0
   D 복습 계보(l01 = 5단원 마지막 차시 출구 — 파일에서 동적으로 읽어 대조(마지막 키도 파일에서) → 이후 = 직전 차시 출구) · 마지막 = 「2학기 국어를 마쳐요」(옛 덱과 같음 · 3학년 2학기 국어 끝)
   E 정답 다시 풀기 — 게이트 자체 사전으로 푼다: 낱말 뜻 사전(265쪽 낱말 알기) 역찾기 · 감상 방법 선 잇기(263쪽 — 349쪽 그림 판독) · 「국어활동」 85쪽 선 잇기(377쪽 그림 판독)
       · 「건전지 엄마」 장면 차례(261쪽 — 「타는 냄새」 다음 장면을 표에서 찾아 냄) · 레오 세 친구 표(259쪽) · 257쪽 경험 갈래 · 사실/의견 끝맺음 규칙(272쪽 의견 표현)
       · 쓰는 방법 표(269쪽) · 네 가지 방법 빈칸(271쪽 보기를 넣어 문장을 다시 만듦) · 고쳐 쓰는 방법 빈칸(274쪽) · 고쳐 쓴 문장(275쪽 — 정규식으로 몸의 부분을 뽑음)
       · 스마트 기기 글(「국어활동」 87쪽 — 알맞지 않은 이유가 있으면 고쳐 쓸 의견 = 「이유」가 든 번호) · 손 팻말 짝(280쪽) · 역할놀이 차례(281쪽) · 카드 놀이(지도서 368쪽 — 「때문이다.」 끝맺음)
       · 맞춤법 제53항 규칙(묻는 말이면 까·꼬, 아니면 게·걸 — 문장을 보고 게이트가 고름 · 쪽지 고쳐 쓰기) · 낱말 잇기(첫음절·끝음절) → 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 = 81
   F 차례 사슬 — 장면 차례 5 · 쓰는 방법 3 · 의견 글 쓰는 차례 6(지도서 362쪽 수업의 흐름) · 가치 탐구 네 단계 · 손 팻말 네 단계 · 역할놀이 네 단계
   G 그림 — 렌더 · 쓰는 부품만(text·mood·sort2·note·link·tools·chain·sound · panels 안쪽) · 소단원 차시 이름 = 지도서 340쪽 차시 표 · 장면 차례 · 표정 → 마음 · 감상 방법 선 잇기
       · 인물 가치 · 네 가지 방법 · 쓰는 방법 · 고쳐 쓰는 방법 · 어색한 줄 · 고치기 전/뒤 · 문제 파악 판 · 손 팻말 · 스스로 확인 · 맞춤법 ○✕ · 낱말 잇기 음절 · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침)
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 33장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80) · 물음 끝 「요?」 · 지도서 유의점이 교사 층에
   L 선행(레오 l02 · 건전지 엄마·배경 음악·눈사람 넷 l03 · 공익 광고·신통방통·뜨거운 의자 l05 · 뒷받침·급식 글 l07 · 보드게임·바꾸어 읽기 l09 · 옐로 카펫·안전 지킴이 l10 · 손 팻말·한 줄 평·만약 이랬더라면 l12 · 갈게·낱말 잇기 l14 — l01 단원 도입 예외)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 장면 0
   N 제재 — 작품마다 제목·지은이 · 교과서 쪽 안내 · 작품별 인용 줄 ≤ 4(그림 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고)
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장(사람마다·여러 답 + 까닭·근거) ≥ 4차시 · 「감상은 사람마다 다르되 까닭은 작품에서」(l02·l05 오개념)
   R 역검증 레드 — 망가뜨린 사본(정답 · 낱말 뜻 · 감상 방법 · 장면 차례 · 맞춤법 · 복습 · 「결」 · b_ 카드 · 보탬 낱말 · 교과서 낱말 · 인용 줄 · 지은이 · 차례 · 낱말 잇기 · 문제 그림 · 인물 · 선행)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u6.js */
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
const L = load(path.join(TDIR, 'data/g3s2_korean_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u6.json'), 'utf8'));
const KEYS = ['u6_l01', 'u6_l02', 'u6_l03', 'u6_l05', 'u6_l07', 'u6_l09', 'u6_l10', 'u6_l12', 'u6_l14'];
const COV = { u6_l01: [1, 1], u6_l02: [2, 2], u6_l03: [3, 4], u6_l05: [5, 6], u6_l07: [7, 8], u6_l09: [9, 9], u6_l10: [10, 11], u6_l12: [12, 13], u6_l14: [14, 14] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '감상과 표현의 즐거움';

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
const dot = (s) => String(s).replace(/[.]$/, '');

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
/* 1차시 — 국어 255~257쪽 · 지도서 342~343쪽 듣기 자료 */
const S256 = { movie: '세종 대왕님께서 만드신 한글', feel: '세종 대왕님이 백성을 사랑하는 마음에 감동을 느꼈다', opin: '세종 대왕님께서 만드신 소중한 한글을 바르게 사용하자', reason: '요즘 우리가 사용하는 말에 외국어나 바람직하지 않은 말이 많은 것 같다' };
const TEXT256 = { feel: '작품을 감상한 사람이 느낀 재미나 감동', opin: '문제 상황에 대한 글쓴이의 의견과 그 이유' };
const EXP257 = { opin: ['학교에서 열린 글짓기 대회에 쓰레기를 아무 데나 버리지 말자는 글을 써서 낸 적이 있어.'], feel: ['이순신 장군님이 나오는 영화를 감명 깊게 본 적이 있어.', '아기 오리들의 모험을 담은 만화를 재미있게 본 경험이 있어.'] };
const UNITP = ['재미나 감동을 느끼며 작품 감상하기', '의견을 제시하는 글 쓰기'], COMP = '문화 향유 역량';
/* 2차시 — 국어 258~259쪽 · 제재 소개(지도서 345쪽) */
const DEL = { made: '모양', notMade: '능력', name: '델', end: '진짜 델', lesson: '기다림과 인내' };
const LEO259 = [['델 모양만이라도 만들어 달라고 조르는 레오', '부모님께 물건을 사 달라고 부탁하는 내 모습', '재미'], ['가짜 ‘델’을 달고 있다고 놀림받은 레오', '나도 친구들에게 놀림받았을 때 무척 속상했기 때문', '안쓰러움'], ['진짜 델이 생긴 장면', '나도 꿈을 이루기 위해 열심히 노력해야겠다고 생각해서', '감동']];
const REAL259 = '같은 작품을 보고도 재미나 감동을 느낀 부분이 다를 수 있다', DIFF344 = ['처한 환경', '경험'];
/* 3~4차시 — 국어 260~263쪽 · 국어활동 85쪽 */
const ORDER261 = ['어린이집에서 낮잠 시간에 아이들이 모두 잠들었다', '건전지 엄마는 타는 냄새가 나는 것을 느꼈다', '건전지 엄마는 위험을 무릅쓰고 아이들을 구하려고 나섰다', '건전지 엄마는 있는 힘껏 비상벨을 울렸다', '비상벨을 들은 아이들은 무사히 대피하고, 건전지 엄마도 집에 와서 행복하게 잠들었다'];
const MIND262 = ['아이들에게 도움이 되도록 열심히 일해야지.', '여기서 포기할 수 없어. 어떻게든 아이들을 구해야 해.', '얘들아, 제발 일어나!', '오늘도 참 뿌듯한 하루였어.'];
const WAY263 = { 하준: '인물의 실감 나는 표정이나 말투에 주의하며 보았다', 예서: '분위기를 생생하게 해 주는 배경 음악이나 효과음에 집중하며 보았다', 시윤: '이야기의 주제나 인물에게서 얻을 수 있는 교훈을 떠올리며 보았다' };
const SNOW85 = { 정운: '펑펑', 유연: '눈사람', 단우: '눈 세상' }, SNOW_LINES = ['눈사람 넷, 집에 간다', '눈 세상 데리고 간다.'];
const SOUND349 = '배경 음악이나 효과음';
/* 5~6차시 — 국어 264~267쪽 · 지도서 350~355쪽 */
const WORDS = { 신통방통하다: '매우 대견하고 칭찬해 줄 만하다', 밑창: '신발의 바닥 밑에 붙이는 가죽이나 고무 따위의 조각', 단짝: '서로 뜻이 맞거나 매우 친해 늘 함께 어울리는 친구' };
const S265 = { why: '친구들과 나누어 먹으려고 과자를 가져왔는데 마리와 기동이가 별로 고마워하지 않는다고 생각했기 때문', gift: '신비가 다른 친구들의 처지에서 생각해 볼 수 있도록 하기 위해서', dino: '살아남은 단 하나의 공룡', how: '인물이 한 말과 행동', music: '배경 음악' };
const VALUE355 = { 신비: '다른 사람의 처지에서 이해하고 배려하는 마음', '마리 · 기동': '신비를 좋은 친구라고 생각함', 아빠: '가족이자 딸인 신비' };
const VSTEP = ['문제 분석', '가치 확인', '가치 평가', '가치 일반화'];
/* 7~8차시 — 국어 268~273쪽 · 지도서 356쪽 */
const FACT356 = ['신비는 친구들에게 과자를 나누어 주었습니다.', '마리는 신비에게 화장실을 양보해 주었습니다.', '신비는 니 맘 내 맘 계산기로 친구들의 마음을 들여다보았습니다.'];
const OPIN_END = /(어야|해야) (합니다|한다)\.$|하자\.$|면 좋겠다\.$|라고 생각한다\.$/;   // 272쪽 의견 표현
const METHOD269 = [['신비가 경험한 것처럼', '문제 상황을 자세히 쓴다'], ['다른 사람의 마음을 잘 이해하기 위해서는', '자신의 의견을 제시한다'], ['왜냐하면', '그렇게 생각한 이유를 쓴다']];
const FOOD270 = { opin: '음식을 골고루 먹어야 한다', muscle: '고기, 생선, 콩 종류', liked: '김치' };
const FOUR271 = ['주제나 문제 상황에 어울리는 의견을 내야 합니다.', '의견을 뒷받침하는 적절한 이유를 들어야 합니다.', '다양한 이유를 중복되지 않게 제시해야 합니다.', '의견은 문제를 푸는 데 도움이 되는 것이어야 합니다.'], BOGI271 = ['다양', '도움', '뒷받침'];
const DEF268 = '의견';
/* 9차시 — 국어 274~275쪽 · 지도서 361쪽(「문제 해결」 → 「결」 차단으로 「문제를 푸는 데」·보기 「문제 풀이」) */
const REV274 = ['주제나 문제 상황에 어울리는 의견을 썼는지 확인한다.', '의견을 뒷받침하는 적절한 이유를 썼는지 확인한다.', '의견과 그 이유가 문제를 푸는 데 도움이 되는지 살펴본다.', '글의 내용에 어색한 부분은 없는지 확인한다.', '띄어쓰기나 맞춤법이 틀린 부분은 없는지 살펴본다.'], BOGI274 = ['적절', '문제 상황', '문제 풀이'];
const RUN274 = { odd: '둘째, 내가 우리 반에서 달리기를 가장 잘하기 때문이다.', lines: ['요즘 운동량이 부족해서 체력이 약한 어린이가 많다.', '첫째, 친구들과 함께 달리면 운동 효과가 더 좋아지기 때문이다.', '그래서 체력을 기르기 위해 점심시간에 함께 달리기를 하면 좋겠다.'] };
const FIX275 = '둘째, 달리기를 매일 하면 체력도 길러지고 건강해진다. 온몸의 다양한 근육을 쓰고 심장과 폐도 튼튼해지기 때문이다.';
const GOOD275 = ['읽는 사람의 처지에서 내가 제시한 의견이 효과적으로 표현되었는지 확인할 수 있어', '잘못된 의견이나 이유를 고치면 내 의견을 더 설득력 있게 제시할 수 있어', '문제 상황을 잘 풀 수 있는 의견과 이유인지 다시 한번 확인할 수 있어'];
const KIND361 = '비난하거나 무시하지 않아요';
/* 10~11차시 — 국어 276~279쪽 · 국어활동 87쪽 · 지도서 362~365쪽 */
const NEWS362 = '학교 앞 횡단보도 부근 벽면에 노란색을 입힌';
const PIC276 = { '㉮': '깨끗하지 않은 학교 환경', '㉯': '친구와 다툼이 있는 상황' }, PLAN276 = { read: '우리 반 친구들', use: '학급 알림판에 게시한다' };
const THINK277 = ['교실 안이나 복도에서 뛰어다니는 학생이 많다.', '걸어 다니자는 표지판을 만들어 교실이나 복도 곳곳에 붙여 놓자.', '교통 표지판을 보고 차들이 속도를 줄이듯이 뛰려고 하던 학생들도 표지판을 보면 뛰지 말아야겠다는 생각이 들기 때문이다.'];
const REASON278 = ['교통 표지판을 보고 차들이 속도를 줄이듯이 뛰려고 하던 학생들도 뛰지 말아야겠다는 생각이 들기 때문', '자신의 손으로 표지판을 만들면서 뛰지 말아야겠다는 다짐도 할 수 있기 때문'];
const PHONE87 = { opin: '스마트 기기 사용 시간을 알맞게 정해 스스로 지키자', ok: ['스마트 기기를 너무 오래 사용하면 시력이 나빠지기 때문입니다.', '스마트 기기에 빠져 숙제나 독서처럼 꼭 해야 하는 일들을 못 할 수도 있기 때문입니다.'], bad: ['스마트 기기는 우리에게 도움을 주기 때문입니다.'] };
const FIX87 = ['주제나 문제 상황에 어울리는 의견을 쓰지 않았어.', '의견을 뒷받침하는 적절한 이유를 들지 않았어.', '띄어쓰기나 맞춤법이 틀린 부분이 있어.'];
const WSTEP = ['문제 파악하기', '계획하기', '의견과 이유 떠올리기', '글쓰기', '점검하기', '고쳐 쓰기'];   // 지도서 362쪽 수업의 흐름
const ADD364 = '이유를 더해';
/* 12~13차시 — 국어 280~282쪽 · 지도서 366~369쪽 */
const SIGN280 = [['쓰레기는 쓰레기통에 버립시다.', '교실이 더러우면 건강에 좋지 않습니다.'], ['고운 말을 사용합시다.', '나쁜 말을 쓰면 기분이 상하기 때문입니다.'], ['교실에서 뛰지 맙시다.', '다른 친구와 부딪쳐 다칠 수 있기 때문입니다.']];
const HAND280 = ['아름답고 즐거운 교실을 만들기 위해 어떤 의견을 제시하면 좋을지 생각해 보기', '자신의 의견과 그렇게 생각한 이유 써 보기', '여러 가지 모양의 손 팻말로 만들어 보기', '완성한 손 팻말로 친구들과 함께 알림 활동 해 보기'];
const ROLE281 = ['자신이 본 작품에서 재미나 감동을 느낀 장면 떠올리기', '장면 속 인물의 말과 행동을 추가하거나 바꾸기', '이어질 장면을 상상해서 역할놀이 대본 쓰기', '친구들과 역할놀이를 연습하고 발표하기'];
const CARD368 = { topic: '점심시간', 1: ['점심시간은 매우 중요하다.', '급식은 영양소가 풍부한 식사이기 때문이다.', '급식 시간을 더 늘려야 한다.', '놀기 위해서 식사를 너무 빨리하면 안 되기 때문이다.'], 2: ['점심시간에는 운동장에 나가서 놀아야 한다.', '요즘 초등학생들은 야외 활동 시간이 부족하기 때문이다.', '점심시간을 더 늘려야 한다.', '식사를 소화하는 것도 다음 수업 시간에 좋기 때문이다.'], swap: '이유로 바꾸어' };
const S280 = { box: '폐상자', like: '모양 붙임딱지' };
/* 14차시 — 국어 283~285쪽 · 한글 맞춤법 제53항(지도서 371쪽) */
const CHECK283 = { ok: ['주제나 문제 상황에 어울리는 의견을 쓴다.', '의견을 뒷받침하는 적절한 이유를 쓴다.', '고쳐 쓸 부분이 있는지 확인하고 알맞게 고쳐 쓴다.'], no: ['같은 이유를 여러 번 제시한다.'] };
const LIFE283 = ['영화를 볼 때 인물의 표정이나 행동을 살피면서 재미나 감동을 느끼도록 감상할 거야', '내 의견을 발표할 때 이유를 들어서 말할 거야', '의견을 제시하는 글을 쓴 뒤 스스로 확인하고 고쳐 써 볼 거야'];
const SOUND284 = { 갈게: '[갈께]', 일어날걸: '[이러날껄]' };
const VISIBLE284 = ['건전지', '건강', '가자미', '역도', '마술사', '이름'];
/* 맞춤법 규칙 — 묻는 말(?)이면 ‘까·꼬’(된소리), 아니면 ‘게·걸’(예사소리) */
const isQ = (sent) => /\?\s*$/.test(String(sent).trim());
const goodForm = (word, question) => (question ? /(까|꼬)$/.test(word) : /(게|걸)$/.test(word));
const fixWord = (wd) => wd.replace(/께$/, '게').replace(/껄$/, '걸');
/* 낱말 잇기 — 두 낱말이 첫음절·끝음절을 나누는가 */
const shares = (a, b) => [a[0], a[a.length - 1]].some(x => x === b[0] || x === b[b.length - 1]);
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|한다|다|요)$/, '');
const sameStem = (a, b) => { const x = stem(a), y = stem(b); return x === y || (x.length >= 6 && y.indexOf(x) === 0); };

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const optsT = (d) => d.options.map(o => clean(o.text));
const WORD = (q) => { const m = clean(q).match(/「(.+?)」(?:이)?라는 뜻의 낱말/); ok(m, '낱말 뜻 물음 꼴 아님 ' + q); const ws = Object.keys(WORDS).filter(k => WORDS[k] === m[1]); ok(ws.length === 1, '사전에 없는 뜻 ' + m[1]); return ws[0]; };
const WORD_OPT = (d) => { optsT(d).forEach(t => ok(WORDS[t], '보기가 265쪽 보기 밖 ' + t)); return WORD(d.question); };
const WAYQ = (q, d) => { const n = Object.keys(WAY263).filter(k => clean(q).indexOf(k) >= 0); ok(n.length === 1, '263쪽 친구 이름 ' + n.length); if (d) optsT(d).forEach(t => ok(Object.values(WAY263).indexOf(t) >= 0, '감상 방법 밖 보기 ' + t)); return WAY263[n[0]]; };
const SNOWQ = (q, d) => { const n = Object.keys(SNOW85).filter(k => clean(q).indexOf(k) >= 0); ok(n.length === 1, '85쪽 친구 이름 ' + n.length); if (d) Object.values(SNOW85).forEach(v => ok(optsT(d).indexOf(v) >= 0, '85쪽 낱말이 보기에 다 있어야 ' + v)); return SNOW85[n[0]]; };
const core261 = (s) => nsp(s).replace(/^건전지엄마[는가]/, '').replace(/[.]/g, '');
const NEXT261 = (d) => { const i = ORDER261.findIndex(x => /타는 냄새/.test(x) && clean(d.question).indexOf('타는 냄새') >= 0); ok(i >= 0 && /바로 다음/.test(d.question), '차례 물음 꼴'); const c = optsT(d).filter(t => core261(t) === core261(ORDER261[i + 1])); ok(c.length === 1, '다음 장면 보기 ' + c.length); return c[0]; };
const LEOQ = (d) => { const r = LEO259.find(x => clean(d.question).indexOf(x[0].replace(/^가짜 /, '').slice(0, 8)) >= 0 && clean(d.question).indexOf('놀림') >= 0); ok(r, '259쪽 줄 못 찾음'); return r[1]; };
const DELQ = (d) => { ok(/‘델’ \(\s*\)만이라도/.test(clean(d.question)), '빈칸 꼴'); ok(optsT(d).indexOf(DEL.notMade) >= 0, '마법사가 못 만든다는 말(능력)이 보기에'); return DEL.made; };
const EXPQ = (d) => { ok(/의견을 제시하는 글을 써 본 경험/.test(d.question), '257쪽 물음 꼴'); optsT(d).forEach(t => ok(EXP257.opin.concat(EXP257.feel).indexOf(t) >= 0, '257쪽 밖 경험 ' + t)); const c = optsT(d).filter(t => EXP257.opin.indexOf(t) >= 0); ok(c.length === 1, '의견 글 경험 ' + c.length); return c[0]; };
const OPINQ = (d) => { const c = optsT(d).filter(t => OPIN_END.test(t)); ok(c.length === 1, '의견 끝맺음 보기 ' + c.length); optsT(d).filter(t => t !== c[0]).forEach(t => ok(FACT356.indexOf(t) >= 0, '사실 문장이 지도서 356쪽에 없음 ' + t)); return c[0]; };
const BLANKQ = (list, bogi) => (d) => { const m = clean(d.question).match(/「(.*?\(\s*\).*?)」/); ok(m, '빈칸 문장 없음'); optsT(d).forEach(t => ok(bogi.indexOf(t) >= 0, '보기 밖 ' + t)); const c = bogi.filter(wd => list.some(x => nsp(x) === nsp(m[1].replace(/\(\s*\)/, wd)))); ok(c.length === 1, '빈칸에 맞는 보기 ' + c.length); return c[0]; };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
const NOT_IN = (keysIn, others) => (d) => { const out = optsT(d).filter(t => keysIn.indexOf(t) < 0); ok(out.length === 1, '표에 없는 보기 ' + out.length); if (others) ok(others.indexOf(out[0]) >= 0, '「아닌 것」이 진짜 다른 갈래가 아님 ' + out[0]); return out[0]; };
const SIGNQ = (d) => { const r = SIGN280.find(x => d.question.indexOf('「' + x[0] + '」') >= 0); ok(r, '280쪽 팻말 못 찾음'); optsT(d).forEach(t => ok(SIGN280.some(x => x[1] === t), '이유 칸 밖 보기 ' + t)); return r[1]; };
const ROLEQ = (d) => { const i = ROLE281.findIndex(x => clean(d.question).indexOf(x.replace(/바꾸기$/, '바꾼').replace(/^장면 속 /, '장면 속 ')) >= 0); ok(i >= 0 && /다음에 할 일/.test(d.question), '281쪽 단계 못 찾음'); return ROLE281[i + 1]; };
const CARDQ = (d) => { const g = (clean(d.question).match(/(\d)모둠/) || [])[1]; ok(CARD368[g], '모둠 못 찾음'); optsT(d).forEach(t => ok(CARD368[g].indexOf(t) >= 0, '그 모둠 문장 아님 ' + t)); const c = optsT(d).filter(t => /때문이다\.$/.test(t)); ok(c.length === 1, '이유 문장 ' + c.length); return c[0]; };
const GEKAQ = (d) => { const m = clean(d.question).match(/「(.+?)」/); ok(m && /\(\s*\)/.test(m[1]), '빈칸 문장'); const c = optsT(d).filter(t => goodForm(t, isQ(m[1]))); ok(c.length === 1, '규칙에 맞는 보기 ' + c.length); return c[0]; };
const TWOQ = (q) => { const m = clean(q).match(/「(.+?)」와 「(.+?)」 가운데 바르게 쓴/); ok(m, '두 말 견주기 꼴'); const c = [m[1], m[2]].filter(s => { const wd = s.replace(/[.?]$/, '').split(' ').pop(); return goodForm(wd, isQ(s)); }); ok(c.length === 1, '바른 쪽 ' + c.length); return c[0]; };
const CHAINQ = (d) => { const base = (d.question.match(/「([^「」]+)」와 첫음절이 같아/) || [])[1]; ok(base, '낱말 잇기 물음 꼴'); optsT(d).forEach(t => ok(VISIBLE284.indexOf(t) >= 0, '284쪽 밖 낱말 ' + t)); const c = optsT(d).filter(t => t !== base && t[0] === base[0]); ok(c.length === 1, '첫음절 같은 낱말 ' + c.length); return c[0]; };
const FIX87Q = (q) => { FIX87.forEach((f, i) => ok(clean(q).indexOf('①②③'[i] + ' ' + f) >= 0, '87쪽 고쳐 쓸 의견 ' + (i + 1) + ' 없음')); ok(PHONE87.bad.length > 0, '알맞지 않은 이유'); const i = FIX87.findIndex(f => /이유/.test(f)); return '①②③'[i]; };
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const EXP = {
  basic: {
    u6_l01: [S256.feel, S256.opin, EXPQ],
    u6_l02: [DELQ, LEOQ, REAL259],
    u6_l03: [NEXT261, (d) => WAYQ(d.question, d), (d) => SNOWQ(d.question, d)],
    u6_l05: [S265.why, WORD_OPT, VALUE355.아빠],
    u6_l07: [OPINQ, FOOD270.opin, BLANKQ(FOUR271, BOGI271)],
    u6_l09: [BLANKQ(REV274, BOGI274), (d) => { optsT(d).filter(t => t !== RUN274.odd).forEach(t => ok(RUN274.lines.indexOf(t) >= 0, '274쪽 글에 없는 보기 ' + t)); return RUN274.odd; }, () => REV274[0].replace(/ 확인한다\.$/, '')],
    u6_l10: [PLAN276.use, AMONG(REASON278), NOT_IN(PHONE87.ok, PHONE87.bad)],
    u6_l12: [SIGNQ, ROLEQ, CARDQ],
    u6_l14: [AMONG(CHECK283.ok), GEKAQ, CHAINQ]
  },
  lev: {
    u6_l01: [COMP, TEXT256.opin], u6_l02: [DEL.end, DEL.lesson], u6_l03: [(q) => SNOWQ(q), (q) => WAYQ(q)], u6_l05: [(q) => WORD(q), S265.gift],
    u6_l07: [DEF268, FOOD270.muscle], u6_l09: [KIND361, () => FIX275.match(/(\S+과 \S+)도 튼튼/)[1]], u6_l10: [(q) => PIC276[(clean(q).match(/그림 (㉮|㉯)/) || [])[1]], FIX87Q],
    u6_l12: [S280.box, S280.like], u6_l14: [TWOQ, TWOQ]
  },
  exit: {
    u6_l01: [S256.movie, TEXT256.feel, (q) => UNITP.find(p => clean(q).indexOf(p) < 0)],
    u6_l02: [DEL.name, () => LEO259[0][1], (q) => DIFF344.find(x => clean(q).indexOf(x) < 0)],
    u6_l03: [() => ORDER261[4].match(/아이들은 (.+?)하고/)[1] + '했다', (q) => WAYQ(q).match(/인물의 (.+?)에 주의/)[1], (q) => SNOWQ(q)],
    u6_l05: [S265.dino, S265.how, (q) => WORD(q)],
    u6_l07: [() => METHOD269.find(r => r[0] === '왜냐하면')[1].replace(/를 쓴다$/, ''), FOOD270.liked, () => BOGI271.find(wd => FOUR271[3].indexOf(wd + '이 되는') >= 0)],
    u6_l09: [() => FIX275.match(/온몸의 (.+?)을 쓰고/)[1], () => REV274[2].match(/이유가 (.+?) 도움이/)[1], () => GOOD275[1].match(/내 의견을 (.+?) 제시/)[1]],
    u6_l10: [() => NEWS362.match(/벽면에 (\S+)을 입힌/)[1], (q) => PIC276[(clean(q).match(/그림 (㉮|㉯)/) || [])[1]], PHONE87.opin],
    u6_l12: [(q) => { const r = SIGN280.find(x => q.indexOf('「' + x[0] + '」') >= 0); ok(r, '팻말 못 찾음'); return r[1]; }, () => ROLE281[0].match(/에서 (.+?) 떠올리기/)[1], CARD368.topic],
    u6_l14: [(q) => SOUND284[Object.keys(SOUND284).find(k => clean(q).indexOf('「' + k + '」') >= 0)], CHECK283.no[0], () => LIFE283[0].match(/인물의 (.+?)을 살피/)[1]]
  },
  /* 넓히기 — 맥락에서 다시 푼다 */
  adv: {
    u6_l01: (d) => { ok(/라고만/.test(d.context), '의견만 쓴 쪽지'); return '그렇게 생각한 이유'; },
    u6_l02: (d) => { ok(/라고만/.test(d.context), '부분만 말함'); return '그 까닭'; },
    u6_l03: (d) => { ok(/배경 음악/.test(d.context) && /상관없/.test(d.context), '소리를 빼는 생각'); return SOUND349; },
    u6_l05: (d) => { ok(/사랑하는 마음을 깨달았을 때/.test(d.context), '267쪽 장면'); return S265.music; },
    u6_l07: (d) => { const rs = (d.context.match(/「([^」]+)」/g) || []).map(x => stem(x.replace(/줄넘기를 하면 /, ''))); ok(rs.length === 2 && /체력/.test(rs[0]) && /체력/.test(rs[1]), '같은 뜻 두 이유'); return FOUR271[2].replace(/ 제시해야 합니다\.$/, ''); },
    u6_l09: (d) => { ok(/제일 좋아하기 때문/.test(d.context), '나만의 이유'); return REV274[1].replace(/를 썼는지 확인한다\.$/, ''); },
    u6_l10: (d) => { ok(/이유가 하나였는데/.test(d.context) && /더해졌/.test(d.context), '이유를 더한 고쳐 쓰기'); return ADD364; },
    u6_l12: (d) => { ok(/2모둠의 「점심시간에는 운동장에 나가서 놀아야 한다\.」/.test(d.context) && CARD368[2].indexOf('점심시간에는 운동장에 나가서 놀아야 한다.') >= 0, '2모둠 의견 문장'); return CARD368.swap; },
    u6_l14: (d) => { const m = d.context.match(/「(.+?)」/); ok(m, '쪽지 글'); const bad = m[1].split(/\s+/).filter(wd => !/\?$/.test(wd)).map(wd => wd.replace(/[.]$/, '')).filter(wd => /(께|껄)$/.test(wd)); ok(bad.length === 1, '틀린 낱말 ' + bad.length); return { exact: fixWord(bad[0]) }; }
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
      if (exp && exp.exact != null) { if (dot(clean(first)) !== dot(clean(exp.exact))) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 고친 말 「' + exp.exact + '」'); }
      else if (!exp || !sameStem(first, exp)) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 사전 「' + exp + '」'); } });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== PKEY) er.push('l01 from ' + rv.from + ' ≠ ' + PKEY); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 5단원 마지막 차시 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
function errBan(LX) { const er = [], all = JSON.stringify(LX); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); }); return er; }
/* 옛 덱(40차) 창작 장면·인물 — 새 덱에 남으면 안 됨 */
const OLD_NAMES = ['두고 온 우산', '우산꽂이', '떠들지 마', '구십 점', '창문을 제일 잘', '마음이 움직인 자리', '체육복'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 장면·인물 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u6_l01: ['인상 깊게 본 작품에 대한 자신의 의견을 글로 써 본 적이 있나요?', '윤솔', '지수', '세종 대왕', '한글', '백성을 사랑하는 마음', '바르게 사용하자', '외국어나 바람직하지 않은 말', '쓰레기를 아무 데나 버리지 말자', '이순신 장군', '아기 오리', '문화 향유 역량', '언어를 통한 깨달음', '학습 계획'],
  u6_l02: ['다섯 고개', '「예.」', '「아니요.」', '레오의 특별한 꿈', '정소현', '델', '모양', '내 모습', '가짜 ‘델’', '안쓰러웠', '무척 속상했기', '꿈을 이루기 위해', '같은 작품을 보고도', '처한 환경이나 경험', '독서 달력'],
  u6_l03: ['비평', '건전지', '장난감', '가정용 체온계', '시계', '리모컨', '손전등', '건전지 엄마', '토이빌', '낮잠', '타는 냄새', '위험을 무릅쓰고', '비상벨', '대피', '요약하여 말', '아이들에게 도움이 되도록 열심히 일해야지', '여기서 포기할 수 없어', '얘들아, 제발 일어나!', '오늘도 참 뿌듯한 하루였어', '하준', '예서', '시윤', '표정이나 말투', '배경 음악이나 효과음', '주제나 인물에게서 얻을 수 있는 교훈', '건전지 아빠', '눈사람 넷', '정운', '유연', '단우', '펑펑', '눈 세상', '낭송', '과학'],
  u6_l05: ['공익 광고', '목줄', '호랑이', '공공질서', '신통방통 니 맘 내 맘 계산기', '한국교육방송공사', '신비', '용용이', '살아남은 단 하나의 공룡', '마리', '기동', '과자', '고마워하지 않는다', '처지에서 생각', '신통방통하다', '밑창', '단짝', '뜨거운 의자', '뭐야? 별로 안 고마운 거야?', '인심 썼다. 자! 먼저 먹어.', '아빠는 신비가 먹는 것만 봐도 배가 불러요.', '가방을 닫아 주는', '배경 음악', '이벤트', '오해가 풀렸던', '귓속말', '생일 선물', '평가 자료 1', '신통방통한 네 마음 내 마음 계산기', '배려'],
  u6_l07: ['과자를 나누어 주었습니다', '화장실을 양보', '이해해 주어야 합니다', '다른 사람의 마음 이해하기', '어떤 일이나 대상에 대한 생각을 의견', '문제 상황을 자세히 쓴다', '자신의 의견을 제시한다', '그렇게 생각한 이유를 쓴다', '건강하고 행복한 급식 시간', '편식', '골고루', '영양소', '고기', '생선', '콩', '곡물', '과일', '채소', '김치볶음밥', '다양', '도움', '뒷받침', '운동량이 부족해서 체력이 떨어지는 학생이 많대', '줄넘기', '……라고 생각한다.', '……하자.', '……면 좋겠다.', '……해야 한다.', '계획하기', '평가 자료 2'],
  u6_l09: ['보드게임', '두뇌 발달', '친해질', '적절', '문제 상황', '어색한 부분', '띄어쓰기나 맞춤법', '체력을 기르기 위해 달리기를 하자', '내가 우리 반에서 달리기를 가장 잘하기 때문이다', '매일', '근육', '심장과 폐', '바꾸어 읽', '읽는 사람의 처지', '설득력', '비난하거나 무시', '간단명료'],
  u6_l10: ['옐로 카펫', '시민 단체', '노란색', '더 나은 학교', '깨끗하지 않은 학교 환경', '친구와 다툼', '우리 반 친구들', '학급 알림판', '뛰어다니는 학생', '표지판', '교통 표지판', '하지 말자', '뛰지 않는 안전한 학교', '안전 지킴이', '붙임 13', '붙임 14', '스마트 기기', '시력', '숙제나 독서', '도움을 주기 때문', '②', '쓰레기통 위치', '표어', '실천 가능'],
  u6_l12: ['이런 활동 어때요', '손 팻말', '아름답고 즐거운 교실', '폐상자', '알림 활동', '쓰레기는 쓰레기통에 버립시다', '고운 말을 사용합시다', '교실에서 뛰지 맙시다', '만약 이랬더라면', '대본', '의견과 이유 카드 놀이', '점심시간', '1모둠', '2모둠', '운동장', '야외 활동 시간이 부족', '한 줄 평', '모양 붙임딱지', '미운 오리 새끼', '성취기준'],
  u6_l14: ['스스로 확인하기', '같은 이유를 여러 번', '생활 속으로', '갈게', '일어날걸', '먹을까', '늦을꼬', '[갈께]', '[이러날껄]', '건전지', '건강', '가자미', '역도', '마술사', '이름', '워낙', '권리', '궁궐', '훼방', '뒷길', '귀여워하다', '건강하고 행복한 급식 시간을 만들어 봅시다.', '작은 집 이야기', '버지니아 리 버튼', '바위 위에 올라가니 뭐가 보이니?', '궤짝 위에 귀여운 고양이가 낮잠을 자고 있다.']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u6.js 454~488줄) 33장의 핵심 낱말 — 본류 장(그림 포함 · extras 아님)에 있어야 한다 */
const ABSORB = {
  u6_l01: [['생각 열기 · 단원 학습 내용 살펴보기', ['인상 깊게 본 작품', '문화 향유 역량', '언어를 통한 깨달음', '호기심']], ['「윤솔이와 지수의 대화」 듣기', ['세종 대왕', '백성을 사랑하는 마음', '바르게 사용하자', '외국어나 바람직하지 않은 말', '문제 상황에 대한 글쓴이의 의견과 그 이유']], ['경험 나누기 · 무엇을 배울까요', ['쓰레기를 아무 데나 버리지 말자', '이순신 장군', '아기 오리', '알고 싶은 것', '실천하고 싶은 것']]],
  u6_l02: [['다섯 고개 놀이로 작품 떠올리기', ['다섯 고개', '「예.」', '알아맞힌 사람이 다음 문제']], ['만화 — 「레오의 특별한 꿈」 세 친구의 감상', ['정소현', '시청각 자료', '안쓰러웠', '모양만이라도', '부모님께 물건을 사 달라고', '꿈을 이루기 위해']], ['느낀 부분이 다른 까닭 · 나의 감상 쓰기', ['처한 환경이나 경험', '독서 달력', '그 까닭']]],
  u6_l03: [['비평 보고 제목 맞히기 · 건전지가 쓰이는 곳', ['비평', '가정용 체온계', '리모컨', '손전등', '미처 생각하지 못했던 쓰임새']], ['만화 영화 「건전지 엄마」 — 장면 차례와 요약', ['대사가 없는', '타는 냄새', '위험을 무릅쓰고', '비상벨', '무사히 대피', '요약하여 말']], ['글과 잇기 — 표정·행동으로 마음 짐작', ['아이들에게 도움이 되도록 열심히 일해야지', '포기할 수 없어', '얘들아, 제발 일어나', '뿌듯한 하루', '정해진 정답']], ['감상 방법 셋 · 「국어활동」 「눈사람 넷」', ['하준', '예서', '시윤', '배경 음악이나 효과음', '건전지 아빠', '과학', '정운', '유연', '단우', '펑펑', '낭송']]],
  u6_l05: [['공익 광고 「우리 개는 순한데」', ['목줄', '호랑이', '공공질서', '처지']], ['드라마 「신통방통 니 맘 내 맘 계산기」 — 내용·낱말', ['한국교육방송공사', '용용이', '살아남은 단 하나의 공룡', '고마워하지 않는다', '다른 친구들의 처지에서', '밑창', '단짝', '신통방통한 네 마음 내 마음 계산기']], ['뜨거운 의자 · 인물이 추구하는 가치', ['뜨거운 의자', '배려', '좋은 친구', '가장 소중하게', '뭐야? 별로 안 고마운 거야?', '인심 썼다', '사람마다 다르']], ['느낀 재미나 감동 · 오해가 풀렸던 경험', ['가방을 닫아 주는', '배경 음악', '이벤트', '오해가 풀렸던', '귓속말', '평가 자료 1']]],
  u6_l07: [['사실과 의견 · 「다른 사람의 마음 이해하기」', ['화장실을 양보', '이해해 주어야 합니다', '어떤 일이나 대상에 대한 생각을 의견', '문제 상황을 자세히 쓴다', '그렇게 생각한 이유를 쓴다']], ['「건강하고 행복한 급식 시간」 · 네 가지 방법', ['편식', '고기', '곡물', '김치볶음밥', '다양한 이유를 중복되지 않게', '뒷받침하는 적절한 이유', '유의 사항 ❸']], ['체력 문제로 의견을 제시하는 글 쓰기', ['운동량이 부족해서 체력이 떨어지는 학생이 많대', '줄넘기', '……면 좋겠다.', '계획하기 단계', '평가 자료 2']]],
  u6_l09: [['어울리지 않는 의견 — 보드게임 글', ['보드게임', '두뇌 발달', '친해질']], ['고쳐 쓰는 방법 · 달리기 글 고쳐 쓰기', ['적절', '문제 상황', '어색한 부분', '띄어쓰기나 맞춤법', '가장 잘하기 때문이다', '심장과 폐']], ['바꾸어 읽기 · 고쳐 쓰면 좋은 점', ['바꾸어 읽', '비난하거나 무시', '간단명료', '읽는 사람의 처지', '설득력']]],
  u6_l10: [['뉴스 — 옐로 카펫', ['옐로 카펫', '시민 단체', '노란색', '한 번 쉬었다가']], ['문제 파악하기 · 계획하기 · 이유 떠올리기', ['깨끗하지 않은 학교 환경', '친구와 다툼', '우리 반 친구들', '학급 알림판', '교통 표지판', '장점', '근본적으로']], ['글쓰기 · 점검하기 · 같은 문제 다른 의견', ['뛰지 않는 안전한 학교', '안전 지킴이', '돌려 읽', '더해도', '모든 과정', '이 글의 주제는 무엇이지?']], ['더 나아가기 · 「국어활동」 86~87쪽', ['게시', '칭찬', '쓰레기통 위치', '표어', '실천 가능', '스마트 기기', '시력', '도움을 주기 때문']]],
  u6_l12: [['이런 활동 어때요 1 — 의견을 제시하는 손 팻말', ['아름답고 즐거운 교실', '폐상자', '알림 활동', '쓰레기는 쓰레기통에 버립시다', '고운 말을 사용합시다', '교실에서 뛰지 맙시다']], ['이런 활동 어때요 2 — ‘만약 이랬더라면?’ 역할놀이', ['만약 이랬더라면', '추가하거나 바꾸', '대본', '성취기준에 알맞은', '2차시']], ['우리 반 예시 — 의견과 이유 카드 놀이', ['점심시간은 매우 중요하다', '급식은 영양소가 풍부한 식사이기 때문이다', '운동장에 나가서 놀아야', '다른 모둠']], ['우리 반 예시 — (만화) 영화 한 줄 평 놀이', ['포스터', '한 줄 평', '모양 붙임딱지', '미운 오리 새끼', '사물함']]],
  u6_l14: [['스스로 확인하기 · 생활 속으로', ['어울리는 의견', '같은 이유를 여러 번', '표정이나 행동', '이유를 들어', '스스로 확인하고 고쳐']], ['기초 다지기 — 갈게·일어날걸·먹을까·늦을꼬 · 낱말 잇기', ['갈게', '일어날걸', '먹을까', '늦을꼬', '[이러날껄]', '건전지', '건강', '가자미', '역도', '마술사', '이름']], ['글씨 쓰기 — ㅝ·ㅞ·ㅟ', ['워낙', '권리', '궁궐', '훼방', '뒷길', '귀여워하다', '건강하고 행복한 급식 시간을 만들어 봅시다']], ['평가 자료 1·2', ['평가 자료 1', '평가 자료 2', '학교 화단 공간', '놀이 공간', '들여쓰기']], ['스스로 읽기 「작은 집 이야기」', ['작은 집 이야기', '버지니아 리 버튼', '도시와 시골', '적절한 이유']]]
};
const OLD_FILES = { u6_l01: 'g3_kor_u6_l01.html', u6_l02: 'g3_kor_u6_l02.html', u6_l03: 'g3_kor_u6_l03_04.html', u6_l05: 'g3_kor_u6_l05_06.html', u6_l07: 'g3_kor_u6_l07_08.html', u6_l09: 'g3_kor_u6_l09.html', u6_l10: 'g3_kor_u6_l10_11.html', u6_l12: 'g3_kor_u6_l12_13.html', u6_l14: 'g3_kor_u6_l14.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u6_l01: '배울 내용 살펴보기', u6_l02: '작품을 감상하고 재미나 감동을 느낀 경험 말하기', u6_l03: '재미나 감동을 느끼며 만화 영화 감상하기', u6_l05: '재미나 감동을 느끼며 드라마 감상하기', u6_l07: '의견을 제시하는 글을 쓰는 방법 알기', u6_l09: '의견을 제시하는 글을 고쳐 쓰는 방법 알기', u6_l10: '의견을 제시하는 글을 쓰고 고쳐 쓰기', u6_l12: '배운 내용 실천하기', u6_l14: '마무리하기' };
const PAGES = { u6_l01: '342~343', u6_l02: '344~345', u6_l03: '346~349', u6_l05: '350~355', u6_l07: '356~359', u6_l09: '360~361', u6_l10: '362~365', u6_l12: '366~369', u6_l14: '370~371' };
const GOAL = { u6_l01: '배울 내용을 살펴볼 수 있다.', u6_l02: '작품을 감상하고 재미나 감동을 느낀 경험을 말할 수 있다.', u6_l03: '재미나 감동을 느끼며 만화 영화를 감상할 수 있다.', u6_l05: '재미나 감동을 느끼며 드라마를 감상할 수 있다.', u6_l07: '의견을 제시하는 글을 쓰는 방법을 안다.', u6_l09: '의견을 제시하는 글을 고쳐 쓰는 방법을 안다.', u6_l10: '의견을 제시하는 글을 쓰고 고쳐 쓸 수 있다.', u6_l12: '배운 내용을 실천할 수 있다.', u6_l14: '배운 내용을 마무리할 수 있다.' };
const STDT = { '05-05': '재미나 감동을 느끼며 작품을 즐겨 감상하는 태도를 지닌다.', '03-03': '대상에 대한 자신의 의견과 그렇게 생각한 이유가 드러나게 글을 쓴다.', '03-01': '중심 문장과 뒷받침 문장을 갖추어 문단을 쓰고, 문장과 문단을 중심으로 고쳐 쓴다.' };
const A3 = ['05-05', '03-03', '03-01'];
const STDC = { u6_l01: A3, u6_l02: ['05-05'], u6_l03: ['05-05'], u6_l05: ['05-05'], u6_l07: ['03-03', '03-01'], u6_l09: ['03-03', '03-01'], u6_l10: ['03-03', '03-01'], u6_l12: ['05-05', '03-03'], u6_l14: A3 };

/* 5단원 마지막 차시 — 파일에서 동적으로 읽음(마지막 키도 파일에서 — 5단원이 따로 다시 지어져도 계보가 따라감) */
const P5 = load(path.join(TDIR, 'data/g3s2_korean_u5.js'));
const P5K = Object.keys(P5).filter(x => /^u5_l\d\d$/.test(x)).sort().pop();
const PKEY = 'g3s2_korean:' + P5K;
const PEXIT = P5[P5K].slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => s.data))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 ── */
const inOrder = (txt, kws) => { let p = -1; return kws.every(kw => { const q = txt.indexOf(kw, p + 1); if (q < 0) return false; p = q; return true; }); };
function errOrder(LX) { const er = [];
  const sc = LX.u6_l03.slides[3].data.fig; if (!(sc.k === 'note' && SAME(sc.items.map(dot), ORDER261))) er.push('l03 「건전지 엄마」 장면 차례 ≠ 261쪽');
  const md = LX.u6_l07.slides[4].data.fig; if (!(md.k === 'link' && md.rows.length === 3 && md.rows.every((r, i) => r[0].indexOf(METHOD269[i][0]) === 0 && dot(r[1]) === METHOD269[i][1]))) er.push('l07 쓰는 방법 세 가지 차례 ≠ 269쪽');
  ['u6_l10'].forEach(k => { const sl = LX[k].slides; if (!inOrder(sl[13].data.content, WSTEP) || !inOrder(sl[16].data.points[0], WSTEP)) er.push(k + ' 의견 글 쓰는 차례 ≠ 지도서 362쪽'); });
  if (LX.u6_l05.slides[16].data.arrows[0] !== VSTEP.join(' → ')) er.push('l05 가치 탐구 학습 모형 네 단계');
  const hd = LX.u6_l12.slides[3].data.fig; if (!(hd.k === 'chain' && hd.items.length === 4 && hd.items.every((x, i) => HAND280[i].indexOf(x.name.split(' ')[0]) >= 0))) er.push('l12 손 팻말 네 단계 ≠ 280쪽');
  const rl = LX.u6_l12.slides[5].data.fig; if (!(rl.k === 'chain' && rl.items.length === 4 && rl.items.every((x, i) => ROLE281[i].indexOf(x.name.split(' ').pop()) >= 0))) er.push('l12 역할놀이 네 단계 ≠ 281쪽');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'mood', 'sort2', 'note', 'link', 'tools', 'chain', 'sound'];
function errFigs(LX) { const er = []; let nF = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품');
    let h = ''; try { h = FIG.render(f); } catch (e) { er.push(at + ' 렌더 예외 ' + e.message); return; } if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); });
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)');
      if (f.k === 'text' || f.k === 'letter' || f.k === 'sort2') er.push(at + ' 기본 문제의 글 상자·두 갈래 통은 panels 로 감싸기(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'note' && f.items.length > 7) er.push(at + ' 메모 ' + f.items.length + '줄'); } }));
  /* 소단원 차시 이름 = 지도서 340쪽 차시 표 */
  const un = LX.u6_l01.slides[6].data.fig; if (!(un.k === 'sort2' && SAME(un.a.items, ['u6_l02', 'u6_l03', 'u6_l05'].map(k => TITLE[k])) && SAME(un.b.items, ['u6_l07', 'u6_l09', 'u6_l10'].map(k => TITLE[k])) && un.a.name.indexOf(UNITP[0]) >= 0 && un.b.name.indexOf(UNITP[1]) >= 0)) er.push('l01 소단원 차시 이름 ≠ 지도서 340쪽 차시 표');
  /* 표정 → 마음(262쪽 예시) · 감상 방법 선 잇기(263쪽) · 「눈사람 넷」 두 줄 */
  const mi = LX.u6_l03.slides[4].data.fig; if (!(mi.k === 'link' && SAME(mi.rows.map(r => r[1]), MIND262))) er.push('l03 표정 → 마음 ≠ 262쪽');
  const wy = LX.u6_l03.slides[5].data.fig; if (!(wy.k === 'link' && wy.rows.length === 3 && wy.rows.every(r => { const nmn = r[0].split(' — ')[0]; return WAY263[nmn] && dot(r[1]) === WAY263[nmn]; }))) er.push('l03 감상 방법 선 잇기 ≠ 263쪽');
  const sn = LX.u6_l03.slides[6].data.fig; if (!(sn.k === 'text' && sn.lines[0] === SNOW_LINES.join(' / '))) er.push('l03 「눈사람 넷」 두 줄 ≠ 85쪽 예시 답안');
  /* 인물 가치(355쪽) · 쓰는 방법 · 네 가지 방법(271쪽) · 고쳐 쓰는 방법(274쪽) · 어색한 줄 · 고치기 전/뒤 */
  const va = LX.u6_l05.slides[5].data.fig; if (!(va.k === 'link' && va.rows.every(r => VALUE355[r[0]] && r[1].indexOf(VALUE355[r[0]]) === 0))) er.push('l05 인물 가치 ≠ 지도서 355쪽');
  const fo = LX.u6_l07.slides[6].data.fig; if (!(fo.k === 'note' && SAME(fo.items, FOUR271))) er.push('l07 네 가지 방법 ≠ 271쪽');
  const rv = LX.u6_l09.slides[3].data.fig; if (!(rv.k === 'note' && SAME(rv.items, REV274))) er.push('l09 고쳐 쓰는 방법 ≠ 274쪽');
  const od = LX.u6_l09.slides[4].data.fig; const odd = (od.lines || []).filter(l => l && l.tag === '어색'); if (!(odd.length === 1 && odd[0].t === RUN274.odd)) er.push('l09 어색한 줄 ≠ 274쪽 둘째 이유');
  const fx2 = LX.u6_l09.slides[5].data.fig; if (!(fx2.k === 'link' && SAME(fx2.rows, [[RUN274.odd, FIX275]]))) er.push('l09 고치기 전/뒤 ≠ 275쪽');
  /* 문제 파악 판(276쪽) · 의견과 이유 떠올리기(277쪽) · 손 팻말(280쪽) · 스스로 확인(283쪽) · 맞춤법 ○✕ · 낱말 잇기 */
  const pb = LX.u6_l10.slides[3].data.fig; if (!(pb.k === 'sort2' && Object.keys(PIC276).every(x => pb.a.items.some(t => t === x + ' ' + PIC276[x])) && pb.b.items.some(t => t.indexOf(PLAN276.read) >= 0) && pb.b.items.some(t => t.indexOf(PLAN276.use) >= 0))) er.push('l10 문제 파악 판 ≠ 276쪽');
  const th = LX.u6_l10.slides[4].data.fig; if (!(th.k === 'link' && SAME(th.rows.map(r => r[1]), THINK277))) er.push('l10 의견과 이유 떠올리기 ≠ 277쪽');
  const sg = LX.u6_l12.slides[4].data.fig; if (!(sg.k === 'link' && SAME(sg.rows, SIGN280))) er.push('l12 손 팻말 ≠ 280쪽');
  const ck = LX.u6_l14.slides[3].data.fig; if (!(ck.k === 'sort2' && SAME(ck.a.items, CHECK283.ok) && SAME(ck.b.items, CHECK283.no))) er.push('l14 스스로 확인 ○3 ✕1 ≠ 283쪽');
  const gk = LX.u6_l14.slides[5].data.fig; if (!(gk.k === 'sound' && gk.ox && gk.pairs.length === 4 && gk.pairs.every(p => { const L0 = p[0].replace(/[.?]$/, '').split(' ').pop(), R0 = p[1].replace(/[.?]$/, '').split(' ').pop(); return goodForm(L0, isQ(p[0])) && !goodForm(R0, isQ(p[1])); }))) er.push('l14 맞춤법 ○✕ 짝이 규칙과 어긋남');
  const ch = LX.u6_l14.slides[6].data.fig; const chainTxt = (ch.items || []).join(' ');
  if (!(ch.k === 'note' && VISIBLE284.every(v => chainTxt.indexOf(v) >= 0))) er.push('l14 낱말 잇기 — 284쪽 낱말 빠짐');
  else (ch.items || []).forEach(it => { const ws = it.replace(/\(.*?\)/g, '').split('→').map(x => x.trim()).filter(Boolean); for (let i = 1; i < ws.length; i++) if (!shares(ws[i - 1], ws[i])) er.push('l14 낱말 잇기 「' + ws[i - 1] + ' → ' + ws[i] + '」 음절이 이어지지 않음'); });
  return { er, nF }; }

/* ── 제재(작품) — 제목·지은이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [
  { t: '레오의 특별한 꿈', a: '정소현', page: '「국어」 교과서 258', cap: 4 }, { t: '건전지 엄마', a: '토이빌', page: '「국어」 교과서 260', cap: 4 }, { t: '눈사람 넷', page: '「국어활동」 84', cap: 4 },
  { t: '신통방통 니 맘 내 맘 계산기', a: '한국교육방송공사', page: '「국어」 교과서 264', cap: 4 }, { t: '다른 사람의 마음 이해하기', page: '「국어」 교과서 268', cap: 4 }, { t: '건강하고 행복한 급식 시간', page: '「국어」 교과서 270', cap: 4 },
  { t: '체력을 기르기 위해 달리기를 하자', page: '「국어」 교과서 274', cap: 4 }, { t: '뛰지 않는 안전한 학교', page: '「국어」 교과서 278', cap: 4 }, { t: '건전지 아빠', a: '전승배', cap: 4 }, { t: '작은 집 이야기', a: '버지니아', page: '「국어활동」 88', cap: 4 }];
function quotedOf(LX, t) { const set = new Set(); KEYS.forEach(k => LX[k].slides.forEach(s => { const figs = []; const f0 = s.data.fig; if (!f0) return; if (f0.k === 'panels') f0.items.forEach(it => figs.push(it.fig)); else figs.push(f0);
  figs.forEach(f => { if (f.k !== 'text' || String(f.title || '').indexOf('「' + t + '」') < 0) return; (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); }); })); return set; }
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { if (all.indexOf('「' + wk.t + '」') < 0) er.push('「' + wk.t + '」 제목 없음');
    if (wk.a) { const re = new RegExp('「' + wk.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '」[^「」]{0,6}' + wk.a.split(' ')[0]); if (!re.test(all)) er.push('「' + wk.t + '」 지은이 ' + wk.a + ' 함께 없음'); }
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk.t); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  return er; }

/* ── 선행 ── */
const FIRST = [['레오의 특별한 꿈', 'u6_l02'], ['건전지 엄마', 'u6_l03'], ['배경 음악', 'u6_l03'], ['눈사람 넷', 'u6_l03'], ['공익 광고', 'u6_l05'], ['신통방통', 'u6_l05'], ['뜨거운 의자', 'u6_l05'],
  ['뒷받침', 'u6_l07'], ['건강하고 행복한 급식 시간', 'u6_l07'], ['다른 사람의 마음 이해하기', 'u6_l07'], ['보드게임', 'u6_l09'], ['바꾸어 읽', 'u6_l09'], ['옐로 카펫', 'u6_l10'], ['안전 지킴이', 'u6_l10'],
  ['손 팻말', 'u6_l12'], ['한 줄 평', 'u6_l12'], ['만약 이랬더라면', 'u6_l12'], ['갈게', 'u6_l14'], ['낱말 잇기', 'u6_l14']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = teach(LX, k).indexOf(t) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('9차시 키(지도서 묶음 첫 번호 1·2·3·5·7·9·10·12·14) · 파일 data/g3s2_korean_u6.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 6단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 339쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 6 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 6단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/6단원_감상과표현의즐거움/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 감상 극장', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 560분', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); if (a !== b) ok(m.title.indexOf(a + '~' + b + '차시') >= 0, k + ' 묶음 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 560, '분'); });
T('[4국05-05] 차시 = 1·2·3~4·5~6(평가 자료 1)·12~13·14 · [4국03-03] = 1·7~8(평가 자료 2)·9·10~11·12~13·14 · [4국03-01] = 1·7~8·9·10~11·14', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join(); ok(has('05-05') === 'u6_l01,u6_l02,u6_l03,u6_l05,u6_l12,u6_l14', has('05-05')); ok(has('03-03') === 'u6_l01,u6_l07,u6_l09,u6_l10,u6_l12,u6_l14', has('03-03')); ok(has('03-01') === 'u6_l01,u6_l07,u6_l09,u6_l10,u6_l14', has('03-01')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·mood·sort2·note·link·tools·chain·sound·panels)', () => PARTS_USED.concat('panels').forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 3-2 국어 다른 단원(1~5단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); let other = []; [1, 2, 3, 4, 5].forEach(u => { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); }); ok(other.length > 20 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자 · 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 5단원 마지막 차시(' + PKEY + ') 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 = 「2학기 국어를 마쳐요」(옛 덱과 같음 · 3학년 2학기 국어 끝) · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u6_l14.slides[18].data; ok(nx.title === '2학기 국어를 마쳐요' && /3학년 2학기 국어/.test(nx.preview), nx.title + ' ' + nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표·규칙) ═══');
const EA = errAnswers(L);
T('기본 27 · 수준별 기본·도전 18 · 출구 27 · 넓히기 9 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 81', () => ok(EA.n === 81, EA.n));
T('모두 고르기 ≥ 2 · 낱말 뜻 물음 ≥ 3 · 맞춤법 규칙 물음 ≥ 3(사전·규칙이 실제로 쓰임)', () => { let ms = 0, wq = 0, gq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/라는 뜻의 낱말/.test(q)) wq++; if (/가운데 바르게 쓴|바르게 쓴 낱말/.test(q)) gq++; }); ok(ms >= 2 && wq >= 3 && gq >= 3, ms + '/' + wq + '/' + gq); });
T('풀이기 자체 확인 — 뜻 역찾기 · 맞춤법 규칙 · 빈칸 다시 만들기 · 낱말 잇기 · 틀린 것 잡음', () => { ok(WORD('「매우 대견하고 칭찬해 줄 만하다」라는 뜻의 낱말은 무엇일까요?') === '신통방통하다', '역찾기');
  ok(TWOQ('「어디 갈가?」와 「어디 갈까?」 가운데 바르게 쓴 것은 무엇일까요?') === '어디 갈까?' && TWOQ('「곧 올게.」와 「곧 올께.」 가운데 바르게 쓴 것은 무엇일까요?') === '곧 올게.', '규칙');
  ok(BLANKQ(FOUR271, BOGI271)({ question: '「의견은 문제를 푸는 데 (    )이 되는 것이어야 합니다.」의 빈칸', options: BOGI271.map(t => ({ text: t })) }) === '도움', '빈칸'); ok(shares('도마', '마술사') && shares('마술사', '이사') && !shares('역도', '이름'), '음절');
  ok(EXP.adv.u6_l14({ context: '「나중에 연락할께. 어디서 만날까?」' }).exact === '연락할게', '쪽지 고치기');
  let c = 0; try { WORD('「아주 빠르다」라는 뜻의 낱말은 무엇일까요?'); } catch (e) { c++; } try { TWOQ('「어디 갈까?」와 「어디 갈꼬?」 가운데 바르게 쓴 것은 무엇일까요?'); } catch (e) { c++; } try { WAYQ('누군가의 감상 방법은 무엇일까요?'); } catch (e) { c++; } ok(c === 3, '안 걸리는 것 못 잡음'); });

console.log('═══ F. 차례 사슬 ═══');
T('장면 차례(261쪽) · 쓰는 방법 세 가지(269쪽) · 의견 글 쓰는 차례 여섯(지도서 362쪽) · 가치 탐구 네 단계 · 손 팻말 네 단계(280쪽) · 역할놀이 네 단계(281쪽)', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });
T('출구 「무사히 대피했다」 = 261쪽 마지막 장면 문장을 잘라 다시 만든 말 · 「그렇게 생각한 이유」 = 269쪽 방법 문장에서', () => { const ex = L.u6_l03.slides[15].data.items[0].a, ex7 = L.u6_l07.slides[15].data.items[0].a; ok(ex === ORDER261[4].match(/아이들은 (.+?)하고/)[1] + '했다' && ex7 === METHOD269[2][1].replace(/를 쓴다$/, ''), ex + ' / ' + ex7); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 소단원 차시 이름 · 표정 → 마음 · 감상 방법 · 「눈사람 넷」 · 인물 가치 · 네 가지 방법 · 고쳐 쓰는 방법 · 어색한 줄 · 고치기 전/뒤 · 문제 파악 판 · 이유 떠올리기 · 손 팻말 · 스스로 확인 · 맞춤법 ○✕ · 낱말 잇기 · 문제 그림 정답 숨김 · 문제 카드 ≤ 3', () => ok(!EF.er.length, EF.er.slice(0, 6).join(' | ')));
T('개념 36장 · 기본 문제 27장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 · 기본 문제 글 상자 잡음', () => { const X = clone(L); X.u6_l05.slides[9].data.fig = { k: 'tools', items: [{ name: '단짝' }] }; X.u6_l01.slides[8].data.fig.items.push({ name: 'a' }, { name: 'b' }, { name: 'c' }); X.u6_l02.slides[3].data.fig = { k: 'zzz' }; X.u6_l09.slides[9].data.fig = { k: 'text', lines: ['a'] };
  const e = errFigs(X).er.join(' | '); ok(/정답 「단짝」/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e) && /panels 로 감싸기/.test(e), e.slice(0, 240)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u6_l14') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「건전지 엄마」 · l07 에 「옐로 카펫」 없음)', () => { ok(nsp(JSON.stringify(L.u6_l02)).indexOf('건전지엄마') < 0, 'l02'); ok(nsp(JSON.stringify(L.u6_l07)).indexOf('옐로카펫') < 0, 'l07'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 33, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
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
T('발문 분 합계 — 40분 차시 30~45 · 80분 묶음 60~80', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0), d = L[k].meta.duration_min; ok(d === 40 ? m >= 30 && m <= 45 : m >= 60 && m <= 80, k + ' ' + m + '분/' + d); }));
T('학생이 읽는 물음 끝 = 「요?」(모두 고르기만 「세요.」) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question, s.data.multi])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach(x => qs.push([k + ' 출구', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q, ms]) => { const t = clean(q); return ms ? !/모두 고르세요\.$/.test(t) : !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의점이 교사 층에 — 호기심·이유를 함께·역량·학습 계획(l01) · 처한 환경이나 경험·까닭은 작품·독서 달력·시청각 자료(l02) · 정해진 정답·영상과 음향·대사가 없·요약하여·낭송(l03) · 가치 탐구·사람마다 다르·바른 표기·공공질서·평가 자료 1(l05) · 계획하기 단계·유의 사항 ❸·평가 자료 2·사실과 의견(l07) · 비난하거나 무시·간단명료·메타 인지·점검표(l09) · 근본적으로·모든 과정·더해도·타당한 이유·어려움에 맞는 질문(l10) · 성취기준에 알맞은·폐상자·조사 과정·2차시 운영(l12) · 맞춤법 제53항·ㅝ·ㅞ·ㅟ·추가로 확인·작은 집 이야기(l14)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u6_l01', [/호기심/, /이유를 함께/, /역량/, /학습 계획/]], ['u6_l02', [/처한 환경이나 경험/, /까닭은 작품/, /독서 달력/, /시청각 자료/]], ['u6_l03', [/정해진 정답/, /영상과 음향/, /대사가 없/, /요약하여 말/, /낭송/]], ['u6_l05', [/가치 탐구/, /사람마다 다르/, /바른 표기/, /공공질서/, /평가 자료 1/]],
   ['u6_l07', [/계획하기 단계/, /유의 사항 ❸/, /평가 자료 2/, /사실과 의견/]], ['u6_l09', [/비난하거나 무시/, /간단명료/, /메타 인지/, /점검표/]], ['u6_l10', [/근본적으로/, /모든 과정/, /더해도/, /타당한 이유/, /어려움에 맞는 질문/]], ['u6_l12', [/성취기준에 알맞은/, /폐상자/, /조사 과정/, /2차시 운영/]], ['u6_l14', [/맞춤법 제53항/, /ㅝ·ㅞ·ㅟ/, /추가로 확인/, /작은 집 이야기/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u6 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ N. 제재 — 제목·지은이 · 쪽 안내 · 인용 줄 ═══');
T('작품 ' + WORKS.length + '편 — 제목 · 제목 곁에 지은이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판 전부 · [간추림]·→ 빼고)', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('글 판(「레오의 특별한 꿈」·「눈사람 넷」·「다른 사람의 마음 이해하기」·「건강하고 행복한 급식 시간」·달리기 글·「뛰지 않는 안전한 학교」)에는 [간추림] 줄과 「→ 교과서 ○○쪽」 안내가 함께 있음', () => { [['u6_l02', 3], ['u6_l03', 6], ['u6_l07', 3], ['u6_l07', 5], ['u6_l09', 4], ['u6_l10', 5]].forEach(([k, si]) => { const f = L[k].slides[si].data.fig; ok(f.k === 'text' && f.lines.some(l => /^\[간추림\]/.test(typeof l === 'string' ? l : l.t)) && f.lines.some(l => /^→ 「국어(활동)?」 (교과서 )?\d+/.test(typeof l === 'string' ? l : l.t)), k + ' ' + si); }); });
T('인용 셈 자체 확인 — 「다른 사람의 마음 이해하기」 지금 3줄 · 두 줄 더하면 5', () => { ok(quotedOf(L, '다른 사람의 마음 이해하기').size === 3, quotedOf(L, '다른 사람의 마음 이해하기').size); const X = clone(L); X.u6_l07.slides[3].data.fig.lines.splice(1, 0, '항상 내 마음이 기준이 되는 것이 아니다.', '모두가 사이좋게 지낼 수 있을 것이다.'); ok(quotedOf(X, '다른 사람의 마음 이해하기').size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l02·l05 오개념 = 감상(생각)은 사람마다 달라도 되되 까닭은 작품(장면)에서', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/사람마다/.test(L.u6_l02.slides[7].data.right) && /까닭은 작품 속 장면/.test(L.u6_l02.slides[7].data.right) && /사람마다 다르/.test(L.u6_l05.slides[7].data.right) && /까닭은 드라마 속 장면/.test(L.u6_l05.slides[7].data.right), '오개념'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l07 ① 의견 문장 → 사실 문장)', X => { const d = X.u6_l07.slides[8].data; d.options[3].correct = false; d.options[0].correct = true; }, X => errAnswers(X).er);
red('낱말 뜻 정답 바꿈(l05 출구 신통방통하다 → 단짝)', X => { X.u6_l05.slides[15].data.items[2].a = '단짝'; }, X => errAnswers(X).er);
red('감상 방법 바꿈(l03 도전 시윤 → 표정이나 말투)', X => { X.u6_l03.slides[11].data.levels.도전.a = WAY263.하준; }, X => errAnswers(X).er);
red('「국어활동」 85쪽 선 잇기 바꿈(l03 출구 유연 눈사람 → 펑펑)', X => { X.u6_l03.slides[15].data.items[2].a = '펑펑'; }, X => errAnswers(X).er);
red('장면 차례 틀림(l03 ① 「타는 냄새」 다음을 낮잠 장면으로)', X => { const d = X.u6_l03.slides[8].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('맞춤법 틀림(l14 기본 「금방 갈게.」 → 「금방 갈께.」)', X => { X.u6_l14.slides[11].data.levels.기본.a = '금방 갈께.'; }, X => errAnswers(X).er);
red('쪽지 고친 말 틀림(l14 넓히기 「일어날게」 → 「일어날께」)', X => { X.u6_l14.slides[14].data.note = X.u6_l14.slides[14].data.note.replace('**일어날게**', '**일어날께**'); }, X => errAnswers(X).er);
red('복습 계보 끊음(l05 복습 한 줄 바꿈)', X => { X.u6_l05.slides[1].data.items[0].a = '기쁘다'; }, errReview);
red('l01 복습을 5단원 아닌 것으로', X => { X.u6_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l09 개념 「문제 해결에 도움」)', X => { X.u6_l09.slides[3].data.content += ' 문제 해결에 도움이 돼요.'; }, errBan);
red('보탬 카드 b_l3_1 되살림', X => { X.u6_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '건전지 엄마' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지움(l10 안전 지킴이)', X => { X.u6_l10.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/안전 지킴이/g, '도우미')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l12 미운 오리 새끼)', X => { X.u6_l12 = JSON.parse(JSON.stringify(X.u6_l12).replace(/미운 오리 새끼/g, '아기 새')); }, errTB);
red('인용 줄 넘침(「건강하고 행복한 급식 시간」 원문 세 줄 더함)', X => { X.u6_l07.slides[5].data.fig.lines.splice(2, 0, '그 이유에 대해 살펴보겠습니다.', '첫째, 음식을 골고루 먹어야 우리 몸에 필요한 여러 영양소를 얻을 수 있습니다.', '둘째, 자신이 경험해 보지 못한 다양한 음식을 즐길 수 있습니다.'); }, errWorks);
red('지은이 지움(「레오의 특별한 꿈」 정소현)', X => { X.u6_l02 = JSON.parse(JSON.stringify(X.u6_l02).replace(/정소현/g, '')); }, errWorks);
red('역할놀이 차례 바꿈(l12 대본 쓰기 ↔ 말과 행동 바꾸기)', X => { const it = X.u6_l12.slides[5].data.fig.items; [it[1], it[2]] = [it[2], it[1]]; }, errOrder);
red('낱말 잇기 끊음(l14 「역도 → 이름」)', X => { X.u6_l14.slides[6].data.fig.items[2] = '가자미 → 미역 → 역도 → 이름'; }, X => errFigs(X).er);
red('문제 그림에 정답 보임(l12 ① 팻말 카드에 「나쁜 말을 쓰면 기분이 상하기 때문입니다.」)', X => { X.u6_l12.slides[8].data.fig.items[0].kind = '나쁜 말을 쓰면 기분이 상하기 때문입니다.'; }, X => errFigs(X).er);
red('인물 바꿈(l09 곰이 → 한슬)', X => { X.u6_l09.slides[2].data.kids[0].label = '한슬\n"어?"'; }, errPeople);
red('선행 말 앞당김(l02 개념에 「배경 음악」)', X => { X.u6_l02.slides[3].data.content += ' 배경 음악도 들어 봐요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
