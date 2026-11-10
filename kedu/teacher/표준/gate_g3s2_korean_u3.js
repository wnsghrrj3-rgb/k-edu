/* gate_g3s2_korean_u3.js — 3학년 2학기 국어 3단원 「정확하게 글을 써요」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g3s2_korean_u1 틀 + 국어 사전·표 대조).
   옛 게이트(37차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u3.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 3단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 9종 서로 다름 · 3-2 국어 다른 단원과 겹침 0
   D 복습 계보(l01 = 2단원 g3s2_korean u2 마지막 차시 출구 — 파일에서 마지막 키를 동적으로 찾아 대조 → 이후 = 직전 차시 출구) · 마지막 = 4단원 「서로 존중하며 대화해요」 예고
   E 정답 다시 풀기 — 게이트 자체 사전·표로 푼다: 낱말 뜻 사전(지도서 185·186쪽 ◆ 풀이) 역찾기 · 이어 주는 말 관계 표(앞뒤 문장 → 비슷·반대·이유·까닭 → 그리고·그러나·그래서·왜냐하면)
       · 출처 표(자료 → 출처 → 기관) · 날짜 표 · 사물함 표 · 짜임 표 · 쓰기 과정 · 점검 네 물음 · ‘-데/-대’ 규칙(직접 경험/남의 말 전달 + 말뿌리) · 낱말 그물 · 표지판 ○✕
       · 「아닌 것」 = 표에 없는 보기 → 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 = 81
   F 차례 사슬 — 손 씻기 6단계 · 2-4-1(4 = 2 × 2) · 감기 걸린 날 일곱 칸 · 심화 간추리기 예시 · 먼저→다음에→끝으로 · 쓰기 과정 넷 · 고깔모자 여섯 · 기차 네 문단 · 한지 제기 네 단계 · 놀이 차례
       · 수 다시 셈(점자 3 × 2 = 6 · 섬 480 + 2910 = 3390)
   G 그림 — 렌더 · 쓰는 부품만(text·mood·sort2·note·sound·link·tools·chain + panels 속 text) · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침) · 표지판 ○3 ✕1 · ‘-데/-대’ 짝 = 규칙 · 출처 표 = 사전
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 30장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80) · 물음 끝 「요?」(인용 「…」 속 문장은 빼고) · 지도서 유의점이 교사 층에
   L 선행(출처 l02 · 삼각기둥책·2-4-1 l03 · 점자·수표·훈맹정음 l05 · 이어 주는 말·왜냐하면 l07 · 글의 목적·순서를 나타내는 말·전기 안전 l09 · 사물함 l10 · 대중교통·상황 카드 l12 · ‘-데’·낱말 그물 l14 — l01 단원 도입 예외)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0(meta.std 지도서 성취기준 문구만 예외) · 겹낫표 0 · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 세트 인물·제재 0
   N 제재 — 글마다 제목·글쓴이 · 교과서 쪽 안내 · 글별 인용 줄 ≤ 4(그림 text·panels 속 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고)
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장(사람마다·여러 답 + 까닭·근거) ≥ 4차시
   R 역검증 레드 — 망가뜨린 사본(정답 · 이어 주는 말 · 낱말 뜻 · 출처 · ‘-데/-대’ · 복습 · 「결」 · b_ 카드 · 보탬 낱말 · 교과서 낱말 · 인용 줄 · 차례 · 수 · 인물 · 선행 · 문제 그림 정답)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u3.js */
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
const L = load(path.join(TDIR, 'data/g3s2_korean_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u3.json'), 'utf8'));
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l05', 'u3_l07', 'u3_l09', 'u3_l10', 'u3_l12', 'u3_l14'];
const COV = { u3_l01: [1, 1], u3_l02: [2, 2], u3_l03: [3, 4], u3_l05: [5, 6], u3_l07: [7, 8], u3_l09: [9, 9], u3_l10: [10, 11], u3_l12: [12, 13], u3_l14: [14, 14] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '정확하게 글을 써요';

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
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
/* 낱말 뜻 — 지도서 185쪽 ◆ 풀이 · 186쪽 낱말 알기 예시 답안(국어 119·121쪽) · 177·178쪽 ◆ 풀이 */
const WORDS = { 구별: '성질이나 종류에 따라 갈라놓음', 동일: '어떤 것과 비교하여 똑같음', 구성: '몇 가지 부분을 모아서 일정한 전체를 짜 이룸',
  창제하고: '전에 없던 것을 새로 만들고', 반포했습니다: '세상에 널리 퍼뜨려 모두 알게 했습니다', 국제연합: '세계 여러 나라가 모여 평화와 협력을 위해 만든 국제 기구' };
/* 이어 주는 말 — 쓰임 표(지도서 190쪽 · 국어 125쪽) · 국어활동 45쪽 라(왜냐하면) */
const USE = { 그리고: '비슷', 그러나: '반대', 그래서: '이유', 왜냐하면: '까닭' };
const USE_TXT = { 그리고: '앞의 내용과 비슷한 내용이 이어질 때', 그러나: '앞의 내용과 반대되는 내용이 이어질 때', 그래서: '앞의 내용이 뒤의 내용의 이유가 될 때' };
/* 앞 문장 → 뒤 문장과의 관계 — 국어 126쪽 4번(지도서 191쪽 예시) · 붙임 8~9 카드(192쪽) · 활동지(193쪽 — 예시 답안 없음, 게이트가 관계를 붙임) · 국어활동 45쪽 */
const REL = { '슬기는 책 읽기를 좋아합니다': '비슷', '여진이는 운동을 좋아합니다': '이유', '재환이는 도화지에 그림을 그리고 싶었습니다': '반대', '연우는 손전등 스위치를 켰습니다': '반대',
  '갑자기 비가 왔다': '반대', '윤석이는 어머니를 도와드리려고 설거지를 했다': '비슷', '나는 오늘 아침에 늦잠을 잤다': '이유', '가을이 되어서 날씨가 쌀쌀해졌다': '이유', '준영이는 공원에서 모자를 잃어버렸다': '반대', '오늘은 할아버지 생신이다': '이유',
  '나는 비가 와서 우산을 썼습니다': '비슷', '나는 그림을 잘 그리지 못합니다': '반대', '어머니는 시장에 가서 과일을 사셨습니다': '비슷', '나는 달리기 연습을 매일 꾸준히 했습니다': '이유', '누나는 피아노를 잘 칩니다': '반대', '나는 우리 반 친구들을 참 좋아합니다': '이유',
  '조개를 들고 있으면 해달이야': '까닭', '동생이 감기에 걸려서 엄마와 병원에 갔어': '비슷', '책을 깜빡하고 반납하지 못했어': '이유', '희은이와 정은이는 쌍둥이야': '반대' };
/* 놀이터 상황 카드(국어 138쪽) 뒤 문장 → 관계 */
const REL12 = { '아직 공사 중이라 들어갈 수 없습니다': '반대', '쉬는 시간마다 친구들이 몰려갑니다': '이유', '미끄럼틀과 그네도 생겼습니다': '비슷', '우리 반 친구들은 무척 기뻐했습니다': '이유' };
/* 출처 표 — 자료 → 출처(국어 111·113·115·117·119~123·131쪽 · 국어활동 43쪽 · 평가 자료 1) · null = 출처 없음 */
const SOURCES = { '올바른 손 씻기 6단계': '「올바른 손 씻기 6단계」, 질병관리청 누리집', '하늘다람쥐': '국립생태원', '섬': '「2024년 국내 섬 현황」, 한국섬진흥원 누리집',
  '한 기관의 조사': null, '단풍길 자전거 사진': null, '질병관리청의 자료': '질병관리청', '2-4-1 법칙': '「2-4-1 법칙」, 서울특별시 자전거 누리 소통망',
  '훈맹정음': '「훈맹정음」, 국립한글박물관 누리집', '수표': '문화체육관광부의 「한국 점자 규정」', '점자 일람표': '「점자 일람표」, 문화체육관광부 누리집',
  '물 마시기': '「한국인 영양소 섭취 기준」, 보건복지부·한국영양학회', '걷기': null, '전기 제품': '「전기 제품을 안전하게 사용할 때 지켜야 할 약속」, 한국전기안전공사 누리집', '문해상': '문화체육관광부의 보도 자료' };
const ORG = (s) => String(s).split(', ').pop().replace(/ 누리집$/, '').replace(/의 「.+」$/, '');
const SRC117 = { 가: '한 기관의 조사', 나: '단풍길 자전거 사진', 다: '질병관리청의 자료', 라: '2-4-1 법칙' };
const DATES = { '한글 점자의 날': '11월 4일', 한글날: '10월 9일', '세계 손 씻기의 날': '10월 15일', '세계 문해의 날': '9월 8일' };
const WASH6 = ['손바닥을 마주 대고 문지르기', '손등과 손바닥을 대고 문지르기', '손깍지를 끼고 손가락 사이 닦기', '두 손 모아 손가락을 마주 잡고 비비기', '엄지손가락을 돌리며 닦기', '손톱 밑을 손바닥에 문지르며 마무리'];
const RULE241 = [{ n: 2, where: '눈썹 위', k: '두 개', per: 2 }, { n: 4, where: '귀 아래 양쪽', k: '두 개씩', per: 2, sides: 2 }, { n: 1, where: '턱 끈', k: '한 개', per: 1 }];
const NUMW = { 1: '한 개', 2: '두 개', 6: '여섯 개' };
const COLD7 = ['재채기', '걱정', '병원에 감', '체온', '처방', '따뜻한 물', '안심'];
const COLD_STORY = ['머리가 아팠', '재채기', '걱정하지 말라', '그러나', '그래서', '병원에 갔'];
const LOCKER = { '교과서, 공책, 파일': '세우거나 꽂기', '색연필, 풀, 가위': '정리 바구니에 담기', '리코더, 줄넘기': '정리 주머니에 넣기', '연필과 공책 여분': '여분 갖추기', '공부 시간에 완성한 작품': '분류해 집으로 가져가기' };
const STRUCT = { 처음: ['글을 쓰는 목적'], 가운데: ['일의 순서나 방법', '참고한 자료의 출처'], 끝: ['설명한 내용 간추리기'] };
const PROC = ['내용 떠올리기', '내용 조직하기', '글쓰기', '점검하기'];
const CHECK4 = ['일의 순서나 방법이 잘 드러나게 썼나요?', '읽는 사람이 궁금해할 내용으로 썼나요?', '바르고 정확한 문장으로 썼나요?', '이어 주는 말을 적절하게 사용했나요?'];
const HAT6 = ['양옆', '반 내려', '모서리', '아래쪽을 접어', '한 번 더', '중간 부분'];
const TRAIN = ['기차의 특징', '기차를 타기 전에 해야 하는 일', '기차 이용 방법', '기차를 탈 때 주의할 점'];
const ORD4 = ['첫째', '둘째', '셋째', '마지막'];
const JEGI = ['한지 네다섯 장과 금속 고리 한 개, 연필 하나 준비하기', '고리를 한지와 함께 돌돌 말기', '고리 중심에 연필로 구멍 뚫기', '구멍에 한지 양 끝을 넣어 고정하기'];
const JEGI_KW = ['준비', '돌돌', '구멍을 뚫', '양 끝을 넣어'];
const GAME12 = ['가위바위보', '뒤집어 쌓기', '한 장씩 뽑기', '뒤 문장'];
const YUT = ['놀이할 사람의 수', '놀이에 필요한 준비물', '놀이의 규칙', '놀이하는 순서'];
const ORDW = ['먼저', '다음에', '끝으로'];
const NET = { 자전거: { 방법: '균형 잡기', 준비물: '안전모', '좋은 점': '건강', 장소: '공원' }, 여행: { 방법: '기차 여행', 준비물: '가방', '좋은 점': '즐거움', 장소: '관광지' } };
const SIGN = { ok: ['이어 주는 말의 앞뒤 문장이 자연스럽게 이어졌는지 확인한다.', '설명하는 글에서는 ‘첫째’, ‘그다음에는’과 같은 말을 사용하면 이해하기 쉽다.', '자료의 출처를 보면 글의 내용이 믿을 만한지 확인할 수 있다.'], no: ['설명하는 글을 쓸 때에는 어려운 낱말을 많이 써야 한다.'] };
/* ‘-데/-대’ — 지도서 206~207쪽 · 표준국어대사전: 직접 경험 → -데 · 남의 말 전달(‘-다고 해’ 준말) → -대 · 문장 앞부분 → 상황 · 말뿌리 */
const DEDAE = { '내가 읽어 보니 그 책 정말': ['exp', '재미있'], '현지는 감기에 걸려 못': ['tell', '온'], '그러는데, 내일 비가': ['tell', '온'] };
const END = { exp: '데', tell: '대' };
/* 지도서 사실 표 — 쪽마다 예시 답안 */
const S = {
  get174: ['인터넷', '그림책', '잘 아는 사람과의 면담'], why108: '앞 문장이 뒤 문장의 이유가 아니라 다음 차례를 잇는 자리여서', easy109: ['문장의 길이가 너무 길어', '준비물을 먼저', '차례를 알려 주는 말'],
  first108: '먼저', awk108: '그래서', remember109: '본 곳을 기억해 두고 글에 밝혀요', order: '차례', unitParts: ['출처를 확인하며 글 읽기', '순서나 방법을 설명하는 글 쓰기'],          // 108~109쪽 · 175쪽
  oct15: '올바른 손 씻기', writer: '김이도 어린이 기자', why112: '친구들에게 올바른 손 씻기 방법과 중요성을 알려 주려고', srcDef: '출처', twoPlaces: ['본문에서 글로', '자료 아래'], islands: '본문에서 글로도, 자료 아래에도', // 110~113쪽 · 179쪽 활동지
  good117: '글에서 활용한 자료가 믿을 만한지', more117: '주제와 관련 있는 정보', noName: '어느 기관인지 이름이 없어서', book116: '삼각기둥책', none: '없음', two: '두 명',              // 115~117쪽
  kh43: '물을 충분히 마시자는 글', munhae: '유네스코 세종 대왕 문해상',                                                                                                          // 국어활동 43쪽 · 평가 자료 1
  reader129: '3학년 우리 반 친구들', hard130: '과열·합선', write195: ['궁금해할 만한', '순서를 나타내는 말', '정확한지 확인'], purpose: '글의 목적', orderWords: '순서를 나타내는 말', more131: '더 알고 싶은 내용', easyWord: '이해하기 쉬운 낱말로 바꾸어', // 128~131쪽 · 195~196쪽
  srcEnd: '글의 맨 끝',                                                                                                                                                          // 136쪽
  support: '뒷받침 문장', srcMeaning: '그 자료를 가져온 곳', card12: '이어 주는 말 카드', post: '학급 알림판', groupPlan: '문단의 짜임을 모둠 전체에서 먼저 정해', // 138~140쪽 · 202~203쪽
  easy141: '이해하기 쉬워요', curious141: '출처'                                                                                                                                  // 141쪽
};
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|다|요)$/, '');

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const optsT = (d) => d.options.map(o => clean(o.text));
const WORD = (q) => { const m = clean(q).match(/「(.+?)」(?:이)?라는 뜻의 낱말/); ok(m, '낱말 뜻 물음 꼴 아님 ' + q); const ws = Object.keys(WORDS).filter(k => WORDS[k] === m[1]); ok(ws.length === 1, '사전에 없는 뜻 ' + m[1]); return ws[0]; };
const PAIR_W = (d) => { const c = optsT(d).filter(t => { const m = t.match(/^(\S+) — (.+)$/); return m && WORDS[m[1]] === m[2]; }); ok(c.length === 1, '바른 짝 ' + c.length); return c[0]; };
const NOT_IN = (keysIn) => (d) => { const out = optsT(d).filter(t => !keysIn.some(k => t.indexOf(k) >= 0)); ok(out.length === 1, '표에 없는 보기 ' + out.length); return out[0]; };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
/* 「A. (   ) B.」 → A 의 마지막 문장을 관계 표에서 찾아 이어 주는 말을 낸다 */
function CONN(text) { const m = clean(text).match(/「(.+?)\s*\(\s*\)\s*(.+?)」/); ok(m, '빈칸 문장 꼴 아님 ' + text); const front = m[1].replace(/[.!?]\s*$/, ''); const last = front.split(/[.!?]\s+/).pop().trim();
  const key = Object.keys(REL).find(k => k === last); ok(key, '관계 표에 없는 앞 문장 「' + last + '」'); const c = Object.keys(USE).filter(x => USE[x] === REL[key]); ok(c.length === 1, '이어 주는 말 ' + c.length); return c[0]; }
const CONN_OPT = (d) => { const a = CONN(d.question); optsT(d).forEach(t => ok(USE[t], '보기가 이어 주는 말이 아님 ' + t)); return a; };
const USE_Q = (q) => { const k = Object.keys(USE_TXT).filter(x => clean(q).indexOf(USE_TXT[x]) >= 0); ok(k.length === 1, '쓰임 물음 ' + k.length); return k[0]; };
const DATE = (d) => { const k = Object.keys(DATES).find(x => d.question.indexOf(x) >= 0); ok(k, '날짜 표 이름'); optsT(d).forEach(t => ok(Object.values(DATES).indexOf(t) >= 0, '오답 보기가 날짜 표에 없음 ' + t)); return DATES[k]; };
const LOCK = (q) => { const k = Object.keys(LOCKER).filter(x => q.indexOf('「' + x + '」') >= 0); ok(k.length === 1, '사물함 표 줄 ' + k.length); return LOCKER[k[0]]; };
const LOCK_OPT = (d) => { const a = LOCK(d.question); optsT(d).forEach(t => ok(Object.values(LOCKER).indexOf(t) >= 0, '오답 보기가 사물함 표에 없음 ' + t)); return a; };
const PART = (part) => (d) => { optsT(d).forEach(t => ok([].concat(STRUCT.처음, STRUCT.가운데, STRUCT.끝).indexOf(t) >= 0, '짜임 표에 없는 보기 ' + t)); const c = optsT(d).filter(t => STRUCT[part].indexOf(t) >= 0); ok(c.length === 1, part + ' 보기 ' + c.length); return c[0]; };
const DEDAE_Q = (text) => { const k = Object.keys(DEDAE).find(x => clean(text).indexOf(x) >= 0); ok(k, '‘-데/-대’ 상황 표에 없음'); const [kind, root] = DEDAE[k]; return root + END[kind]; };
const NET_Q = (text) => { const m = clean(text).match(/「(자전거|여행)」.*「(방법|준비물|좋은 점|장소)」/); ok(m, '낱말 그물 물음 꼴'); return NET[m[1]][m[2]]; };
const SRC_OPT = (name) => (d) => { const s = SOURCES[name]; ok(s, '출처 표 ' + name); optsT(d).filter(t => t !== s).forEach(t => ok(Object.values(SOURCES).indexOf(t) < 0, '오답 보기가 다른 자료의 출처 ' + t)); return s; };
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const EXP = {
  basic: {
    u3_l01: [AMONG(S.get174), S.why108, NOT_IN(S.easy109)],
    u3_l02: [S.oct15, (d) => { const c = optsT(d).filter(t => t.indexOf(WASH6[5]) === 0); ok(c.length === 1, '마지막 단계 보기'); optsT(d).filter(t => t !== c[0]).forEach(t => ok(WASH6.slice(0, 5).some(x => t.indexOf(x) === 0), '오답 보기가 6단계 밖 ' + t)); return c[0]; }, SRC_OPT('올바른 손 씻기 6단계')],
    u3_l03: [(d) => { const m = d.question.match(/자료 (가|나|다|라)/); const has = !!SOURCES[SRC117[m[1]]]; const c = optsT(d).filter(t => t.indexOf(has ? '출처가 있어요' : '출처가 없어요') === 0); ok(c.length === 1, '출처 있음/없음 보기 ' + c.length); return c[0]; },
      (d) => optsT(d).filter(t => { const k = t.charAt(0); return SRC117[k] && SOURCES[SRC117[k]]; }), S.good117],
    u3_l05: [DATE, PAIR_W, (d) => { ok(SOURCES['물 마시기'] && !SOURCES['걷기'], '국어활동 43쪽 표'); return S.kh43; }],
    u3_l07: [CONN_OPT, CONN_OPT, CONN_OPT],
    u3_l09: [S.reader129, S.hard130, NOT_IN(S.write195)],
    u3_l10: [LOCK_OPT, S.srcEnd, PART('처음')],
    u3_l12: [(d) => { const want = USE[(d.question.match(/「(그리고|그러나|그래서)」 카드/) || [])[1]]; ok(want, '뽑은 카드'); const c = optsT(d).filter(t => { const back = t.replace(/^(그리고|그러나|그래서) /, '').replace(/\.$/, ''); ok(REL12[back], '놀이터 표에 없는 뒤 문장 ' + back); return REL12[back] === want; }); ok(c.length === 1, '어울리는 뒤 문장 ' + c.length); return c[0]; },
      S.srcMeaning, (d) => { const m = d.question.match(/(첫째|둘째|셋째|마지막) 문단/); return TRAIN[ORD4.indexOf(m[1])]; }],
    u3_l14: [(d) => { const c = optsT(d).filter(t => SIGN.no.indexOf(t) >= 0); optsT(d).filter(t => t !== c[0]).forEach(t => ok(SIGN.ok.indexOf(t) >= 0, '알맞은 표지판 표에 없음 ' + t)); ok(c.length === 1, '✕ 표지판'); return c[0]; },
      (d) => DEDAE_Q(d.question), (d) => NET_Q(d.question)]
  },
  lev: {
    u3_l01: [S.first108, S.awk108], u3_l02: [S.writer, S.why112], u3_l03: [S.two, (q) => RULE241.find(r => q.indexOf(r.where) >= 0).k],
    u3_l05: [(q) => { ok(SOURCES['수표'], '수표 출처'); return '수표'; }, (q) => WORD(q)], u3_l07: [(q) => CONN(q), (q) => CONN(q)],
    u3_l09: [ORDW[2], (q) => ORG(SOURCES['전기 제품'])], u3_l10: [(q) => LOCK(q), (q) => { const i = CHECK4.findIndex((c, j) => j === CHECK4.length - 1 || clean(q).indexOf(c) < 0); ok(CHECK4.slice(0, i).every(c => clean(q).indexOf(c) >= 0), '앞 물음 셋'); return CHECK4[i]; }],
    u3_l12: [S.support, (q) => { const m = q.match(/(첫|두|세|네) 번째/); return JEGI[['첫', '두', '세', '네'].indexOf(m[1])]; }], u3_l14: [(q) => DEDAE_Q(q), (q) => NET_Q(q)]
  },
  exit: {
    u3_l01: [S.order, S.unitParts[0], S.unitParts[1]], u3_l02: [S.srcDef, S.twoPlaces[1], () => ORG(SOURCES['올바른 손 씻기 6단계'])],
    u3_l03: [S.more117, () => (SOURCES[SRC117.나] ? '?' : S.none), S.book116],
    u3_l05: [() => NUMW[3 * 2], (q) => WORD(q), () => ORG(SOURCES['훈맹정음'])],
    u3_l07: [(q) => CONN(q), (q) => USE_Q(q), (q) => CONN(q)],
    u3_l09: [S.purpose, S.orderWords, S.more131],
    u3_l10: [() => LOCKER['리코더, 줄넘기'].replace(/에 넣기$/, ''), () => STRUCT.끝[0], (q) => PROC[PROC.indexOf('글쓰기') + 1]],
    u3_l12: [S.card12, S.srcDef, S.post],
    u3_l14: [(q) => (clean(q).indexOf('남의 말을 전달') >= 0 ? '-' + END.tell : '-' + END.exp), S.easy141, S.curious141]
  },
  /* 넓히기 — 맥락에서 다시 푼다(활동지 섬 글 · 이름 없는 기관 · 문해상 대상 · 그림 연습 문장 · 윷놀이 빈칸 · ‘-대’ 고쳐 쓰기) */
  adv: {
    u3_l01: S.remember109, u3_l02: (d) => { ok(/따르면/.test(d.context) && /■ 출처/.test(d.context), '본문·자료 아래 둘 다'); return S.islands; },
    u3_l03: S.noName, u3_l05: S.munhae,
    u3_l07: (d) => CONN(d.context.replace(/그래서 (실망하지)/, '(   ) $1')),
    u3_l09: S.easyWord,
    u3_l10: (d) => { const done = d.context.split('정리했는데')[0]; return YUT.filter(x => done.indexOf(x) < 0).join('과 '); },
    u3_l12: S.groupPlan,
    u3_l14: (d) => { const m = d.context.match(/「(.+?)」/); ok(m, '곰이의 말'); const ws = (m[1].match(/[가-힣]+[데대](?=[.!])/g) || []); ok(ws.length === 1, '고칠 낱말'); const k = Object.keys(DEDAE).find(x => clean(m[1]).indexOf(x) >= 0); ok(k, '상황'); const want = DEDAE[k][1] + END[DEDAE[k][0]]; ok(ws[0] !== want, '이미 바름'); return want; }
  }
};

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { const d = s.data, at = k + ' ' + s.id; n++;
      let exp; try { exp = fx(EXP.basic[k][i])(d); } catch (e) { er.push(at + ' 풀이기 ' + e.message); return; }
      const cor = d.options.filter(o => o.correct).map(o => clean(o.text));
      if (Array.isArray(exp)) { if (!d.multi || !SAME(cor.slice().sort(), exp.slice().sort())) er.push(at + ' 모두 고르기 ' + cor.join('/') + ' ≠ ' + exp.join('/')); if (d.note.indexOf('**' + exp.length + '개**') < 0) er.push(at + ' 개수 풀이'); if (!/모두 고르세요\.$/.test(d.question)) er.push(at + ' 모두 고르기 물음 꼴'); if (exp.length >= d.options.length) er.push(at + ' 오답 보기 없음'); }
      else { if (d.multi || cor.length !== 1 || cor[0] !== clean(exp)) er.push(at + ' 정답 「' + cor.join('/') + '」 ≠ 사전 「' + exp + '」'); if (!new RegExp('\\*\\*' + esc(String(exp)) + '\\*\\*$').test(d.note)) er.push(at + ' 풀이 끝 ≠ 정답'); }
      if (new Set(optsT(d)).size !== d.options.length) er.push(at + ' 같은 보기 둘'); });
    const lv = sl[11].data.levels; if (!(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true)) er.push(k + ' 수준 셋·심화 open');
    ['기본', '도전'].forEach((t, i) => { n++; let exp; try { exp = fx(EXP.lev[k][i])(lv[t].q); } catch (e) { er.push(k + ' ' + t + ' 풀이기 ' + e.message); return; }
      if (clean(lv[t].a) !== clean(exp)) er.push(k + ' ' + t + ' 「' + lv[t].a + '」 ≠ 사전 「' + exp + '」'); if (!(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a))) er.push(k + ' ' + t + ' 풀이 끝'); });
    sl[15].data.items.forEach((x, i) => { n++; let exp; try { exp = fx(EXP.exit[k][i])(x.q); } catch (e) { er.push(k + ' 출구 ' + (i + 1) + ' 풀이기 ' + e.message); return; } if (clean(x.a) !== clean(exp)) er.push(k + ' 출구 ' + (i + 1) + ' 「' + x.a + '」 ≠ 사전 「' + exp + '」'); });
    const ad = sl[14].data, ae = EXP.adv[k]; n++;
    if (ae === OPEN) { if (!/^풀이: 여러 답/.test(ad.note) || !/까닭|근거/.test(ad.note)) er.push(k + ' 열린 넓히기 꼴'); }
    else { let exp; try { exp = fx(ae)(ad); } catch (e) { er.push(k + ' 넓히기 풀이기 ' + e.message); return; } const first = ((ad.note.match(/\*\*([^*]+)\*\*/) || [])[1]) || '';
      if (stem(first) !== stem(exp)) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 사전 「' + exp + '」'); } });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== PREV_KEY) er.push('l01 from ' + rv.from + ' ≠ ' + PREV_KEY); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 2단원 마지막 차시 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
/* 「결」 검사 — meta.std(지도서 성취기준 [4국03-02] 「절차와 결과가 …」 문구 그대로)만 뺀다 */
const noStd = (LX) => { const X = clone(LX); Object.keys(X).forEach(k => { if (X[k] && X[k].meta) X[k].meta.std = ''; }); return X; };
function errBan(LX) { const er = [], all = JSON.stringify(noStd(LX)); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); }); return er; }
/* 옛 창작 세트(37차 · 학교 중립)의 인물·제재 — 새 덱에 0 */
const OLD_NAMES = ['하선', '도영', '세연', '연호', '하경', '윤하', '채호', '딱지', '과습', '종이접기 첫걸음', '텃밭', '뒤죽박죽 사물함', '길 잃은 1학년', '모퉁이에서 쾅'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 세트 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u3_l01: ['종이비행기', '날렸던 일', '먼저', '그래서', '마지막으로', '나만의 비법', '어떤 책을 보고 쓴 글', '기억이 잘 안 나는데', '이해하기 어려워', '문장의 길이가 너무 길어', '준비물을 먼저', '인터넷', '그림책', '면담', '부모님', '음식점', '학습 계획'],
  u3_l02: ['하루에 30분', '많은 사람', '세계보건기구', '올바른 손 씻기', '김이도', '학급 신문', '국제연합', '2008년', '10월 15일', '질병관리청', '흐르는 물', '비누', '30초', '손톱 밑', '자료를 만든 사람이나 기관', '본문에서 글로', '자료 아래', '하늘다람쥐', '국립생태원', '한국섬진흥원', '교육부', '동영상', '실린 작품', '3390개'],
  u3_l03: ['안전 장비', '수신호', '표지판', '자전거 안전모를 써요', '한 기관의 조사', '다섯 명 가운데 한 명', '단풍길', '두 명 가운데 한 명', '2-4-1 법칙', '서울특별시 자전거 누리 소통망', '머리가 더 약', '삼각기둥책', '글쓴이의 의견', '새롭게 안 내용', '알고 싶은 내용', '믿을 만한지', '더 찾아볼 수 없', '어떤 곳일까요'],
  u3_l05: ['점자 블록', '지폐', '다이얼 5번', '당기세요', '손끝으로 읽는 여섯 개의 점', '10월 9일', '11월 4일', '1926년', '송암 박두성', '훈맹정음', '국립한글박물관', '세로로 세 개', '여섯 개', '승강기', '한국 점자 규정', '수표', '점자 일람표', '문화체육관광부', '소중한 문자', '창제', '반포', '구별', '동일', '구성', '어떤 기관인지 확인해야 해', '누리집에 직접 들어가서', '차림표', '한국인 영양소 섭취 기준', '보건복지부', '한국영양학회', '유네스코 세종 대왕 문해상', '68개', '보도 자료'],
  u3_l07: ['새 식당', '두 시간', '소문', '감기 걸린 날', '연우', '머리가 아프고', '재채기', '연극 공연', '병원', '이틀', '따뜻한 물', '푹 쉬', '그러나', '그래서', '그리고', '이어 주는 말', '비슷한 내용', '반대되는 내용', '이유', '슬기', '여진', '재환', '손전등', '붙임 8~9', '우산', '피아노', '순서대로 정리', '왜냐하면', '해달', '쌍둥이', '연체'],
  u3_l09: ['긴팔 윗옷', '소매', '중심선', '1/3', '그림자놀이', '토끼', '도서 자동 대출 반납기', '종이학', '수지', '생활 안전', '전기 안전 규칙', '3학년 우리 반 친구들', '글의 목적', '꼭 들어가야 할 내용', '궁금해할 만한', '이해하기 쉬운 낱말', '다음에', '끝으로', '과열', '합선', '출처가 없', '한눈에', '첫째', '모둠 전원 꽂이', '한국전기안전공사', '하기 전', '마친 뒤', '붙임쪽지', '아리수'],
  u3_l10: ['개인 사물함', '세워서', '파일꽂이', '정리 주머니', '리코더', '정리 바구니', '여분', '사용 횟수', '오늘의 어린이', '정리의 달인', '세우거나 꽂기', '줄넘기', '완성한 작품', '처음', '가운데', '먼저', '다음으로', '출처를 글의 맨 끝', '그림이나 사진 자료도', '점검', '양말목', '칸막이', '내용 떠올리기', '윷놀이', '놀이할 사람의 수', '고깔모자', '색종이 한 장'],
  u3_l12: ['상황 카드', '붙임 9~10', '학교 운동장에 새로운 놀이터', '가위바위보', '있을 만한 이야기', '대중교통', '버스', '기차', '지하철', '비행기', '여객선', '탑승 방법', '안전 수칙', '사진', '동영상', '첫째', '둘째', '셋째', '마지막', '중심 문장', '뒷받침 문장', '알림판', '놀이 이름', '하고 싶은 까닭', '준비물 및 주의할 점', '한지 제기', '금속 고리', '돌돌', '제기'],
  u3_l14: ['스스로 확인하기', '어려운 낱말을 많이', '이어 주는 말의 앞뒤 문장', '그다음에는', '믿을 만한지', '생활 속으로', '다녀왔던 곳', '수영', '궁금한 점', '재미있데', '온대', '직접 경험', '남의 말을 전달', '-다고 해', '자전거', '균형 잡기', '안전모', '건강', '공원', '여행', '기차 여행', '가방', '즐거움', '관광지', '미리', '씻기', '승강기', '힘', '의견', '희망', '띄어쓰기', '시각 장애인과 세상을 이어 주는 소중한 문자', '처음 만나는 풀꽃 이야기', '이동혁']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u3.js 452~483줄) 30장의 핵심 낱말 — 본류 장(그림 포함 · extras 아님)에 있어야 한다 */
const ABSORB = {
  u3_l01: [['생각 열기 — 종이비행기 접는 방법을 글로', ['종이비행기', '접었던 일', '날렸던 일', '먼저', '나만의 비법', '그래서', '어떤 책을 보고 쓴 글']], ['「어떤 책을 보고 쓴 글이야?」 — 푸는 방법 쓰기', ['기억이 잘 안 나는데', '문장의 길이가 너무 길어', '준비물을 먼저', '인터넷', '그림책', '면담', '부모님', '음식점']], ['무엇을 배울까요 — 단원 학습 계획', ['글에 제시된 자료의 출처 확인하기', '출처를 확인하며 읽으면 좋은 점 알기', '이어 주는 말의 쓰임 알기', '일상생활에서 순서나 방법을 설명하는 글 쓰기', '알고 있는 것', '학습 계획', '호기심']]],
  u3_l02: [['출처가 있는 글과 없는 글 견주기', ['하루에 30분', '많은 사람', '세계보건기구', '믿음이 가']], ['「올바른 손 씻기」 읽고 출처에 밑줄 긋기', ['김이도', '학급 신문', '밑줄', '자료를 만든 사람이나 기관', '10월 15일', '손톱 밑', '알려 주려고', '학교에서 꼭 손을 씻어야 할 때']], ['출처를 나타내는 두 곳 · 출처를 본 경험', ['본문에서 글로', '자료 아래', '하늘다람쥐', '국립생태원', '한국섬진흥원', '교육부', '동영상', '실린 작품', '우리나라의 섬들', '3390개']]],
  u3_l03: [['「자전거 안전모를 써요」 — 자료와 출처 표', ['안전 장비', '수신호', '표지판', '한 기관의 조사', '단풍길', '질병관리청', '2-4-1 법칙', '서울특별시 자전거 누리 소통망', '글에 인용된 자료']], ['삼각기둥책으로 묻고 답하기', ['붙임 7', '글쓴이의 의견', '새롭게 안 내용', '알고 싶은 내용', '안전모를 착용하는 습관', '어떤 재료', '머리가 더 약']], ['출처를 확인하며 읽으면 좋은 점', ['믿을 만한지', '더 찾아볼 수 없', '어떤 곳일까요', '4학년 1학기']]],
  u3_l05: [['「손끝으로 읽는 여섯 개의 점」 — 스스로 출처 찾으며 읽기', ['점자 블록', '지폐', '다이얼 5번', '당기세요', '처음-가운데-끝', '11월 4일', '수표', '소중한 문자', '송암 박두성', '여섯']], ['낱말 알기 · 출처 표 · 확인 방법 이야기', ['구별', '구성', '동일', '국립한글박물관', '한국 점자 규정', '점자 일람표', '어떤 기관인지 확인해야 해', '누리집에 직접 들어가서']], ['세상과 잇기 · 「국어활동」 42~43쪽', ['차림표', '한국인 영양소 섭취 기준', '보건복지부', '한국영양학회', '사람, 기관, 누리집 주소']], ['평가 자료 1 — 글에 제시된 자료의 출처 확인하기', ['유네스코 세종 대왕 문해상', '68개', '문화체육관광부의 보도 자료', '제목', '가장 많이 쓰인 낱말']]],
  u3_l07: [['문장 이어 가기 놀이', ['네다섯 명', '새 식당', '두 시간', '소문', '한 시간 넘게', '지식 탐구 학습 모형']], ['「감기 걸린 날」 — 이어 주는 말 찾기와 쓰임', ['감기 걸린 날', '머리가 아프고 재채기', '연극 공연', '따뜻한 물', '그러나', '그래서', '그리고', '비슷한 내용', '반대되는 내용', '이유', '순서대로 정리']], ['빈칸 채우기 · 문장 완성하기 놀이', ['슬기', '여진', '재환', '손전등', '붙임 8~9', '늦잠', '할아버지 생신', '우산', '피아노']], ['「국어활동」 45쪽 — 이어 주는 말 바르게 쓰기', ['병원', '약국', '연체', '쌍둥이', '왜냐하면', '해달', '짧게 나누어']]],
  u3_l09: [['긴팔 윗옷 개는 방법 설명하기 · 그림자놀이', ['긴팔 윗옷', '소매', '중심선', '1/3', '보관', '그림자놀이', '도서 자동 대출 반납기', '종이학']], ['수지의 고민 — 쓰기 전에 생각할 세 가지', ['수지', '생활 안전', '3학년 우리 반 친구들', '전기 안전 규칙', '궁금해할', '이해하기 쉬운 낱말', '먼저', '끝으로', '정확한지', '읽을 대상']], ['수지의 처음 글과 고쳐 쓴 글 견주기', ['과열', '합선', '출처가 없', '첫째', '모둠 전원 꽂이', '한국전기안전공사', '기억하기 쉬워', '하기 전', '붙임쪽지', '아리수']]],
  u3_l10: [['다영이의 자료 조사 — 사물함 정리 방법', ['교과서', '파일꽂이', '정리 주머니', '리코더', '색연필', '여분', '사용 횟수', '오늘의 어린이', '정리의 달인', '가상']], ['짜임 정하기 · 글쓰기 · 점검하기', ['처음', '가운데', '끝', '먼저', '다음으로', '맨 끝', '그림이나 사진 자료도', '일의 순서나 방법이 잘 드러나', '바르고 정확한 문장', '이어 주는 말을 적절하게', '내용 떠올리기']], ['더 나아가기 — 양말 정리 · 「국어활동」 44쪽 고깔모자', ['양말', '양말목', '칸막이', '고깔모자', '색종이 한 장', '중요한 순서를 빠뜨리지', '알림판']], ['평가 자료 2 — 윷놀이하는 방법 설명하는 글', ['윷놀이', '놀이할 사람의 수', '준비물', '규칙', '놀이하는 순서', '다른 놀이', '글쓰기 틀']]],
  u3_l12: [['‘이어 주는 말’ 놀이 — 상황 카드', ['상황 카드', '붙임 9~10', '학교 운동장에 새로운 놀이터', '가위바위보', '있을 만한 이야기']], ['대중교통 이용 설명서 만들기', ['버스', '기차', '비행기', '여객선', '출처', '첫째', '둘째', '셋째', '마지막', '중심 문장', '뒷받침', '알림판']], ['우리 반 예시 — 놀이 설명하기 · 한지 제기', ['놀이 이름', '하고 싶은 까닭', '놀이 방법', '준비물 및 주의할 점', '한지 제기', '금속 고리', '돌돌', '구멍', '가위바위보', '많이 찬 사람이 이']]],
  u3_l14: [['스스로 확인하기 — 길 찾기 · 생활 속으로', ['어려운 낱말을 많이', '이어 주는 말의 앞뒤 문장', '첫째', '그다음에는', '믿을 만한지', '다녀왔던 곳', '수영', '출처를 찾아']], ['기초 다지기 — ‘-데’·‘-대’ · 낱말 그물', ['재미있데', '온대', '-다고 해', '자전거', '균형 잡기', '안전모', '건강', '공원', '여행', '기차 여행', '가방', '즐거움', '관광지', '사람마다']], ['글씨 쓰기 · 「국어활동」 스스로 읽기', ['미리', '씻기', '승강기', '힘', '의견', '희망', '띄어쓰기', '시각 장애인과 세상을 이어 주는 소중한 문자', '처음 만나는 풀꽃 이야기', '이동혁', '이어 주는 말을 찾아']]]
};
const OLD_FILES = { u3_l01: 'g3_kor_u3_l01.html', u3_l02: 'g3_kor_u3_l02.html', u3_l03: 'g3_kor_u3_l03_04.html', u3_l05: 'g3_kor_u3_l05_06.html', u3_l07: 'g3_kor_u3_l07_08.html', u3_l09: 'g3_kor_u3_l09.html', u3_l10: 'g3_kor_u3_l10_11.html', u3_l12: 'g3_kor_u3_l12_13.html', u3_l14: 'g3_kor_u3_l14.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u3_l01: '배울 내용 살펴보기', u3_l02: '글에 제시된 자료의 출처 확인하기', u3_l03: '출처를 확인하며 읽으면 좋은 점 알기', u3_l05: '자료의 출처를 확인하며 글 읽기', u3_l07: '이어 주는 말의 쓰임 알기', u3_l09: '순서나 방법을 설명하는 글을 쓰는 방법 알기', u3_l10: '일상생활에서 순서나 방법을 설명하는 글 쓰기', u3_l12: '배운 내용 실천하기', u3_l14: '마무리하기' };
const PAGES = { u3_l01: '174~175', u3_l02: '176~179', u3_l03: '180~183', u3_l05: '184~187', u3_l07: '188~193', u3_l09: '194~197', u3_l10: '198~201', u3_l12: '202~205', u3_l14: '206~207' };
const GOAL = { u3_l01: '배울 내용을 살펴볼 수 있다.', u3_l02: '글에 제시된 자료의 출처를 확인할 수 있다.', u3_l03: '출처를 확인하며 읽으면 좋은 점을 안다.', u3_l05: '자료의 출처를 확인하며 글을 읽을 수 있다.', u3_l07: '이어 주는 말의 쓰임을 안다.', u3_l09: '순서나 방법을 설명하는 글을 쓰는 방법을 안다.', u3_l10: '일상생활에서 순서나 방법을 설명하는 글을 쓸 수 있다.', u3_l12: '배운 내용을 실천할 수 있다.', u3_l14: '배운 내용을 마무리할 수 있다.' };
const STDT = { '02-05': '글이나 자료의 출처가 믿을 만한지 판단한다.', '03-02': '절차와 결과가 드러나게 정확한 표현으로 보고하는 글을 쓴다.', '04-04': '글과 담화에 쓰인 높임 표현과 지시·접속 표현을 이해하고 상황에 맞게 표현한다.' };
const STDC = { u3_l01: ['02-05', '03-02'], u3_l02: ['02-05'], u3_l03: ['02-05'], u3_l05: ['02-05'], u3_l07: ['03-02', '04-04'], u3_l09: ['03-02'], u3_l10: ['03-02'], u3_l12: ['03-02', '04-04'], u3_l14: ['02-05', '03-02', '04-04'] };

/* 2단원 마지막 차시 — 파일에서 동적으로 읽음(2단원이 다시 지어져도 마지막 키를 따라감) */
const P2 = load(path.join(TDIR, 'data/g3s2_korean_u2.js'));
const P2K = Object.keys(P2).filter(k => /^u2_l\d+$/.test(k)).sort((a, b) => +a.split('_l')[1] - +b.split('_l')[1]).pop();
const PREV_KEY = 'g3s2_korean:' + P2K;
const PEXIT = P2[P2K].slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => s.data))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 · 수 ── */
const itemT = (it) => (typeof it === 'string' ? it : (it.t || it.name || ''));
function chainKw(f, kws, at, er) { const items = (f && f.items) || []; if (items.length !== kws.length) { er.push(at + ' 칸 수 ' + items.length + ' ≠ ' + kws.length); return; } items.forEach((it, i) => { const s = itemT(it); if (s.indexOf(kws[i]) < 0) er.push(at + ' ' + (i + 1) + '번째 「' + s + '」 ≠ ' + kws[i]); }); }
function inOrder(text, kws, at, er) { let p = -1; kws.forEach(kw => { const q = text.indexOf(kw, p + 1); if (q < 0 || q <= p) er.push(at + ' 차례 「' + kw + '」'); else p = q; }); }
function errOrder(LX) { const er = [];
  const w6 = LX.u3_l02.slides[5].data.fig; if (!(w6 && w6.k === 'note' && SAME(w6.items.map(itemT), WASH6))) er.push('l02 손 씻기 6단계 ≠ 지도서 표');
  const r241 = LX.u3_l03.slides[4].data.fig; chainKw(r241, RULE241.map(r => r.n + ' 법칙'), 'l03 2-4-1', er); (r241.items || []).forEach((it, i) => { const r = RULE241[i]; if (!r) return; if ((it.kind || '').indexOf(r.where) < 0 || (it.kind || '').indexOf(r.k) < 0) er.push('l03 ' + r.n + ' 법칙 설명'); if (r.n !== r.per * (r.sides || 1)) er.push('l03 ' + r.n + ' ≠ 손가락 셈'); });
  chainKw(LX.u3_l07.slides[6].data.fig, COLD7, 'l07 연우에게 일어난 일', er);
  inOrder(LX.u3_l07.slides[11].data.levels.심화.a, COLD_STORY, 'l07 심화 간추리기', er);
  chainKw(LX.u3_l09.slides[5].data.fig, ORDW, 'l09 순서를 나타내는 말', er);
  chainKw(LX.u3_l10.slides[6].data.fig, PROC, 'l10 쓰기 과정', er);
  inOrder(LX.u3_l10.slides[13].data.scenario.body, HAT6, 'l10 고깔모자', er);
  const tr = LX.u3_l12.slides[5].data.fig; chainKw(tr, TRAIN.map((t, i) => ORD4[i] + ' 문단 — ' + t), 'l12 기차 문단', er);
  const jg = LX.u3_l12.slides[6].data.fig; chainKw({ items: jg.lines }, JEGI_KW, 'l12 한지 제기', er); ['첫', '두', '세', '네'].forEach((o, i) => { if (itemT(jg.lines[i]).indexOf(o + ' 번째') < 0) er.push('l12 제기 ' + o + ' 번째'); });
  chainKw(LX.u3_l12.slides[3].data.fig, GAME12, 'l12 놀이 차례', er);
  /* 수 다시 셈 */
  const dot = LX.u3_l05.slides[4].data.fig.items[0]; const m = String(itemT(dot)).match(/세로 (\d)개 × 가로 (\d)개 = (\d)개/); if (!(m && +m[1] * +m[2] === +m[3] && +m[3] === 6)) er.push('l05 점자 3 × 2 = 6');
  const isl = JSON.stringify(LX.u3_l02); const im = isl.match(/섬 (\d+)개 가운데 사람이 사는 섬은 (\d+)개, 사람이 살지 않는 섬은 (\d+)개/); if (!(im && +im[2] + +im[3] === +im[1] && +im[1] === 3390)) er.push('l02 섬 480 + 2910 = 3390');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'mood', 'sort2', 'note', 'sound', 'link', 'tools', 'chain'];
function errFigs(LX) { const er = []; let nF = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품'); /* panels 한 칸 = 글 상자 min-width 풀기(실렌더 — 정답 공개 때 480 칸) */
    const h = FIG.render(f); if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); });
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)');
      if (f.k === 'text' || f.k === 'letter' || f.k === 'sort2') er.push(at + ' 기본 문제 글 상자는 panels 로(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'note' && f.items.length > 7) er.push(at + ' 메모 ' + f.items.length + '줄'); if (f.k === 'link' && f.rows.length > 5) er.push(at + ' 짝 ' + f.rows.length + '줄'); } }));
  const sg = LX.u3_l14.slides[3].data.fig; if (!(sg.k === 'sort2' && SAME(sg.a.items, SIGN.ok) && SAME(sg.b.items, SIGN.no))) er.push('l14 표지판 ○3 ✕1 ≠ 141쪽');
  const dd = LX.u3_l14.slides[5].data.fig; if (!(dd.k === 'sound' && dd.ox && dd.pairs.length === 2)) er.push('l14 ‘-데/-대’ 짝'); else { const want = [DEDAE['내가 읽어 보니 그 책 정말'], DEDAE['현지는 감기에 걸려 못']].map(([kd, r]) => r + END[kd]); dd.pairs.forEach((p, i) => { if (p[0] !== want[i]) er.push('l14 ○ 쪽 「' + p[0] + '」 ≠ 규칙 「' + want[i] + '」'); if (p[1] === p[0] || p[1].slice(0, -1) !== p[0].slice(0, -1)) er.push('l14 ✗ 쪽 짝'); }); }
  const nt = LX.u3_l14.slides[6].data.fig; if (!(nt.k === 'link' && nt.ha === '자전거' && SAME(nt.rows, Object.keys(NET.자전거).map(x => [x, NET.자전거[x]])))) er.push('l14 낱말 그물 보기 ≠ 142쪽');
  const s5 = LX.u3_l05.slides[6].data.fig; if (!(s5.k === 'link' && SAME(s5.rows.map(r => r[1]), ['훈맹정음', '수표', '점자 일람표'].map(x => SOURCES[x])))) er.push('l05 출처 표 ≠ 지도서 186쪽');
  const s3 = LX.u3_l03.slides[6].data.fig; if (!(s3.k === 'link' && s3.rows.length === 4 && s3.rows.every((r, i) => { const nm = SRC117['가나다라'[i]]; return r[0].indexOf('가나다라'[i] + ' ') === 0 && (SOURCES[nm] ? r[1] !== '없음' && r[1].indexOf(ORG(SOURCES[nm])) >= 0 : r[1] === '없음'); }))) er.push('l03 117쪽 표 ≠ 출처 표');
  const lk = LX.u3_l10.slides[4].data.fig; if (!(lk.k === 'link' && SAME(lk.rows, Object.keys(LOCKER).map(x => [x, LOCKER[x]])))) er.push('l10 사물함 표 ≠ 134쪽');
  const us = LX.u3_l07.slides[5].data.fig; if (!(us.k === 'link' && us.rows.every(r => USE_TXT[r[0]] === r[1]))) er.push('l07 쓰임 표 ≠ 190쪽');
  return { er, nF }; }

/* ── 제재(교과서 글) — 제목·글쓴이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [
  { t: '올바른 손 씻기', a: '김이도', page: '「국어」 교과서 110', cap: 4 }, { t: '자전거 안전모를 써요', page: '「국어」 교과서 114', cap: 4 }, { t: '손끝으로 읽는 여섯 개의 점', page: '「국어」 교과서 119', cap: 4 },
  { t: '감기 걸린 날', page: '「국어」 교과서 124', cap: 4 }, { t: '전기 제품, 이렇게 쓰면 안전해요', a: '남수지', page: '「국어」 교과서 131', cap: 4 }, { t: '처음 만나는 풀꽃 이야기', a: '이동혁', page: '「국어활동」 46', cap: 0 },
  { t: '여자아이가 쓴 글', key: '여자아이가 쓴 글', page: '「국어」 교과서 108', cap: 4 }, { t: '한지 제기 만드는 방법', key: '한지 제기 만드는 방법', cap: 4 }];
function textFigs(f) { if (!f) return []; if (f.k === 'panels') return [].concat(...(f.items || []).map(it => textFigs(it.fig))); return f.k === 'text' ? [f] : []; }
function quotedOf(LX, wk) { const set = new Set(); const tag = wk.key || '「' + wk.t + '」'; KEYS.forEach(k => LX[k].slides.forEach(s => textFigs(s.data.fig).forEach(f => { if (String(f.title || '').indexOf(tag) < 0) return;
  (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→|^\[그림\]/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); }))); return set; }
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { if (wk.a) { const re = new RegExp('「' + esc(wk.t) + '」[^「」]{0,12}' + wk.a); if (!re.test(all)) er.push('「' + wk.t + '」 글쓴이 ' + wk.a + ' 함께 없음'); }
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  return er; }

/* ── 선행 ── */
const FIRST = [['출처', 'u3_l02'], ['삼각기둥책', 'u3_l03'], ['2-4-1', 'u3_l03'], ['점자', 'u3_l05'], ['수표', 'u3_l05'], ['훈맹정음', 'u3_l05'], ['이어 주는 말', 'u3_l07'], ['왜냐하면', 'u3_l07'],
  ['글의 목적', 'u3_l09'], ['순서를 나타내는 말', 'u3_l09'], ['전기 안전', 'u3_l09'], ['사물함', 'u3_l10'], ['대중교통', 'u3_l12'], ['상황 카드', 'u3_l12'], ['‘-데’', 'u3_l14'], ['낱말 그물', 'u3_l14']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = teach(LX, k).indexOf(t) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('9차시 키(지도서 묶음 첫 번호 1·2·3·5·7·9·10·12·14) · 파일 data/g3s2_korean_u3.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 3단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 171쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 3 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 3단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/3단원_정확하게글을써요/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 학급 신문 기자단', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 560분', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); if (a !== b) ok(m.title.indexOf(a + '~' + b + '차시') >= 0, k + ' 묶음 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 560, '분'); });
T('[4국02-05] 차시 = 1·2·3~4·5~6(평가 자료 1)·14 · [4국03-02] = 1·7~8·9·10~11(평가 자료 2)·12~13·14 · [4국04-04] = 7~8·12~13·14', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join(); ok(has('02-05') === 'u3_l01,u3_l02,u3_l03,u3_l05,u3_l14', has('02-05')); ok(has('03-02') === 'u3_l01,u3_l07,u3_l09,u3_l10,u3_l12,u3_l14', has('03-02')); ok(has('04-04') === 'u3_l07,u3_l12,u3_l14', has('04-04')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·mood·sort2·note·sound·link·tools·chain·panels)', () => PARTS_USED.concat('panels').forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 3-2 국어 다른 단원(1·2·4·5·6단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); let other = []; [1, 2, 4, 5, 6].forEach(u => { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); }); ok(other.length > 20 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 2단원 마지막 차시(' + PREV_KEY + ') 출구 — 파일에서 마지막 키를 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 4단원 서로 존중하며 대화해요 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u3_l14.slides[18].data; ok(nx.title === '다음 단원엔' && /서로 존중하며 대화해요/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표) ═══');
const EA = errAnswers(L);
T('기본 27 · 수준별 기본·도전 18 · 출구 27 · 넓히기 9 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 81', () => ok(EA.n === 81, EA.n));
T('모두 고르기 ≥ 2 · 이어 주는 말 물음 ≥ 8 · 낱말 뜻 물음 ≥ 2 · 출처 물음 ≥ 6(사전·표가 실제로 쓰임)', () => { let ms = 0, cq = 0, wq = 0, sq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/\(\s+\)/.test(q) && /이어 주는 말|이어질 때/.test(q) || /이어질 때 쓰는/.test(q)) cq++; if (/라는 뜻의 낱말/.test(q)) wq++; if (/출처/.test(q)) sq++; }); ok(ms >= 2 && cq >= 8 && wq >= 2 && sq >= 6, ms + '/' + cq + '/' + wq + '/' + sq); });
T('풀이기 자체 확인 — 이어 주는 말 표 · ‘-데/-대’ · 기관 뽑기 · 틀린 것 잡음', () => { ok(CONN('「누나는 피아노를 잘 칩니다. (   ) 나는 피아노를 잘 못 칩니다.」') === '그러나' && CONN('「나는 우리 반 친구들을 참 좋아합니다. (   ) 학교에 오는 일이 무척 즐겁습니다.」') === '그래서', '관계 표');
  ok(DEDAE_Q('「현지는 감기에 걸려 못 (   ).」') === '온대' && DEDAE_Q('「내가 읽어 보니 그 책 정말 (   )!」') === '재미있데', '-데/-대'); ok(ORG(SOURCES['점자 일람표']) === '문화체육관광부' && ORG(SOURCES['수표']) === '문화체육관광부' && ORG(SOURCES['전기 제품']) === '한국전기안전공사', '기관');
  let c = 0; try { CONN('「나는 밥을 먹었다. (   ) 잤다.」'); } catch (e) { c++; } try { WORD('「아주 빠르게」라는 뜻의 낱말은 무엇일까요?'); } catch (e) { c++; } ok(c === 2, '표에 없는 것 못 잡음'); });

console.log('═══ F. 차례 사슬 · 수 ═══');
T('손 씻기 6단계 · 2-4-1(4 = 2 × 2) · 연우 일곱 칸 · 심화 간추리기 차례 · 먼저→다음에→끝으로 · 쓰기 과정 · 고깔모자 · 기차 네 문단 · 한지 제기 · 놀이 차례 · 점자 3 × 2 = 6 · 섬 480 + 2910 = 3390', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 문제 그림 정답 숨김 · 문제 카드 ≤ 3 · 기본 문제 글 상자 = panels · 표지판·‘-데/-대’·낱말 그물·출처 표·사물함 표·쓰임 표 = 지도서', () => ok(!EF.er.length, EF.er.slice(0, 6).join(' | ')));
T('개념 36장 · 기본 문제 27장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 · 맨 글 상자 잡음', () => { const X = clone(L); X.u3_l10.slides[8].data.fig = { k: 'tools', items: [{ name: '정리 주머니에 넣기' }] }; X.u3_l07.slides[8].data.fig.items.push({ name: 'a' }, { name: 'b' }, { name: 'c' }); X.u3_l01.slides[3].data.fig = { k: 'zzz' }; X.u3_l09.slides[9].data.fig = X.u3_l09.slides[9].data.fig.items[0].fig;
  const e = errFigs(X).er.join(' | '); ok(/정답 「정리 주머니에 넣기」/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e) && /panels 로/.test(e), e.slice(0, 200)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u3_l14') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「대중교통」 · l12 에 「훈맹정음」 없음)', () => { ok(nsp(JSON.stringify(L.u3_l02)).indexOf('대중교통') < 0, 'l02'); ok(nsp(JSON.stringify(L.u3_l12)).indexOf('훈맹정음') < 0, 'l12'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 30, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
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
T('학생이 읽는 물음 끝 = 「요?」(모두 고르기만 「세요.」) · 물음 속 「~다.」 0(인용 「…」 속 교과서 문장은 빼고 봄)', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question, s.data.multi])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach(x => qs.push([k + ' 출구', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q, ms]) => { const t = clean(q), u = t.replace(/「[^」]*」/g, '「」'); return ms ? !/모두 고르세요\.$/.test(t) : !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(u); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의점이 교사 층에 — 호기심·면담·외식(l01) · 심화해서 다루지 않·다양한 방법·저작권(l02) · 4학년 1학기·글에 인용된·묻고 답(l03) · 함부로 믿지 않·내용도 충분히·스스로(l05) · 지식 탐구 학습 모형·짧게 나누어·개념을 먼저 알려 주지 않(l07) · 읽을 대상·쉬운 낱말로 바꾸·하기 전(l09) · 가상·내용 떠올리기·중요한 순서를 빠뜨리(l10) · 있을 만한 이야기·중심 문장은 함께·가져온 곳(l12) · 앞에서 배운 내용을 다시·짧은 글이라도·직접 경험(l14)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u3_l01', [/호기심/, /면담/, /외식/]], ['u3_l02', [/심화해서 다루지 않/, /다양한 방법/, /저작권/]], ['u3_l03', [/4학년 1학기/, /글에 인용된/, /묻고 답/]], ['u3_l05', [/함부로 믿지 않/, /내용도 충분히/, /스스로/]],
   ['u3_l07', [/지식 탐구 학습 모형/, /짧게 나누어/, /개념을 먼저 알려 주지 않/]], ['u3_l09', [/읽을 대상/, /쉬운 낱말로 바꾸/, /하기 전/]], ['u3_l10', [/가상/, /내용 떠올리기/, /중요한 순서를 빠뜨리/]], ['u3_l12', [/있을 만한 이야기/, /중심 문장은 함께/, /가져온 곳/]],
   ['u3_l14', [/앞에서 배운 내용을 다시/, /짧은 글이라도/, /직접 경험/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0(meta.std 지도서 성취기준 문구만 예외) · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('「결」 예외 = meta.std 의 [4국03-02] 문구 하나뿐(지도서 171쪽 그대로)', () => KEYS.forEach(k => { const z = L[k].meta.std.replace(STDT['03-02'], ''); ok(z.indexOf('결') < 0, k + ' std'); }));
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u3 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ N. 제재 — 제목·글쓴이 · 쪽 안내 · 인용 줄 ═══');
T('교과서 글 ' + WORKS.length + '편 — 제목 곁에 글쓴이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판·panels 속 글 판 전부 · [간추림]·→·[그림] 빼고)', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('글 판에는 [간추림] 줄과 「→ 「국어」 교과서 ○○쪽」 안내가 함께 있음(손 씻기·안전모·점자·감기·전기 제품)', () => { [['u3_l02', '올바른 손 씻기'], ['u3_l03', '자전거 안전모를 써요'], ['u3_l05', '손끝으로 읽는 여섯 개의 점'], ['u3_l07', '감기 걸린 날'], ['u3_l09', '전기 제품, 이렇게 쓰면 안전해요']].forEach(([k, t]) => { const f = L[k].slides.find(s => s.block === 'concept' && s.data.fig && s.data.fig.k === 'text' && s.data.fig.title.indexOf('「' + t + '」') >= 0).data.fig; ok(f.lines.some(l => /^\[간추림\]/.test(l)) && f.lines.some(l => /^→ 「국어」 교과서 \d+/.test(l)), t); }); });
T('인용 셈 자체 확인 — 「전기 제품, 이렇게 쓰면 안전해요」 지금 4줄(고쳐 쓴 글 3 + panels 속 처음 글 1) · 한 줄 더하면 5', () => { const wk = WORKS[4]; ok(quotedOf(L, wk).size === 4, quotedOf(L, wk).size); const X = clone(L); X.u3_l09.slides[6].data.fig.lines.splice(1, 0, '이러한 전기 제품을 안전하게 사용하려면 몇 가지 약속을 꼭 지켜야 해요.'); ok(quotedOf(X, wk).size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l14 낱말 그물 = 사람마다 다름', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/사람마다/.test(L.u3_l14.slides[6].data.content), 'l14 낱말 그물'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l07 ① 여진 그래서 → 그러나)', X => { const d = X.u3_l07.slides[8].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('출구 이어 주는 말 바꿈(l07 늦잠 → 그러나)', X => { X.u3_l07.slides[15].data.items[0].a = '그러나'; }, X => errAnswers(X).er);
red('수준별 낱말 뜻 정답 바꿈(l05 구별 → 동일)', X => { X.u3_l05.slides[11].data.levels.도전.a = '동일'; }, X => errAnswers(X).er);
red('출처 정답 바꿈(l02 ③ 6단계 출처 → 국제연합)', X => { const d = X.u3_l02.slides[10].data; d.options[0].correct = false; d.options[2].correct = true; }, X => errAnswers(X).er);
red('‘-데/-대’ 바꿈(l14 수준별 온대 → 온데)', X => { X.u3_l14.slides[11].data.levels.기본.a = '온데'; }, X => errAnswers(X).er);
red('복습 계보 끊음(l09 복습 한 줄 바꿈)', X => { X.u3_l09.slides[1].data.items[0].a = '그리고'; }, errReview);
red('l01 복습을 2단원 아닌 것으로', X => { X.u3_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l07 개념 「연결해 주는 말」)', X => { X.u3_l07.slides[4].data.content += ' 앞뒤 내용을 연결해 주는 말이에요.'; }, errBan);
red('보탬 카드 b_l3_1 되살림', X => { X.u3_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '자전거' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지우고 extras 로만(l07 할아버지 생신)', X => { X.u3_l07.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/할아버지 생신/g, '가족 행사')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l05 송암 박두성)', X => { X.u3_l05 = JSON.parse(JSON.stringify(X.u3_l05).replace(/송암 박두성/g, '박 선생')); }, errTB);
red('인용 줄 넘침(「감기 걸린 날」 원문 세 줄 더함)', X => { X.u3_l07.slides[3].data.fig.lines.splice(1, 0, '토요일 아침이었습니다.', '몸도 으슬으슬해서 감기에 걸린 것 같았습니다.', '연우는 어머니께 몸 상태를 말씀드렸습니다.'); }, errWorks);
red('글쓴이 지움(「올바른 손 씻기」 김이도 — 모든 차시에서)', X => { KEYS.forEach(k => { X[k] = JSON.parse(JSON.stringify(X[k]).replace(/김이도/g, '')); }); }, errWorks);
red('손 씻기 차례 바꿈(l02 다섯째·여섯째)', X => { const it = X.u3_l02.slides[5].data.fig.items; [it[4], it[5]] = [it[5], it[4]]; }, errOrder);
red('수 틀림(l05 점자 「세로 3개 × 가로 2개 = 5개」)', X => { X.u3_l05.slides[4].data.fig.items[0] = '세로 3개 × 가로 2개 = 5개'; }, errOrder);
red('문제 그림에 정답 보임(l10 ③ 짜임 메모에 「글을 쓰는 목적」)', X => { X.u3_l10.slides[10].data.fig.items[0] = '처음 — 글을 쓰는 목적'; }, X => errFigs(X).er);
red('인물 바꿈(l07 곰이 → 하선)', X => { X.u3_l07.slides[2].data.kids[0].label = '하선\n"어?"'; }, errPeople);
red('선행 말 앞당김(l03 개념에 「이어 주는 말」)', X => { X.u3_l03.slides[3].data.content += ' 이어 주는 말도 살펴요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
