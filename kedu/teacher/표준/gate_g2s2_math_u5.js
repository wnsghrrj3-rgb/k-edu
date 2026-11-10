/* gate_g2s2_math_u5.js — 2학년 2학기 수학 5단원 「표와 그래프」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 · gate_g2s2_math_u1 틀 + 지도서 직행 점검).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(tbl2·cg2·tly2·dc2·srt2·wcl2·nte2·tools) · meta(2학년 2학기 · 5단원 · 성취기준 지도서 문구 [2수04-02] 2·3 · [2수04-03] 4 · 1·5~8 둘 다 · 40분 · 지도서 쪽 · theme·live_url) · slug g2s2_math
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 + 실사 자리 8종 서로 다름 · 다른 덱과 겹침 0)
   D 복습 계보(l01 = 4단원 데이터 파일의 마지막 차시 출구 — 키를 박지 않고 동적으로 → l02 … l08 = 직전 출구) · l08 다음 단원 = 규칙 찾기 · 6단원 u6_l01 복습 = 이 단원 l08 출구
   E 정답 다시 셈 — 게이트 자체 자료 셈기(교과서 이름 명단 · 생일 · 날씨 달력을 스스로 세고, 표 자료로 합계 · 가장 많은/적은 · 차 · ~보다 많은/적은 · 같은 수)로 기본 24 · 수준별 16 · 출구 24 · 넓히기 8
   F 식 전수 — 글 속 「… = …」 사슬 다시 셈 · 틀린 생각은 정말 틀림(바른 생각에 셈 값)
   G 그림 — 표 칸·합계 = 자료 셈 · 그래프 칸 ◯ 수 = 자료 셈 · 맨 아래(왼쪽)부터 빠짐없이 · 세면서 표시하기 · 분류 칸 이름 = 명단 · 낱장 = 명단 · 날씨 달력 = 달력 · 쪽지 굵은 말 = 셈 · 카드 = 글
         · 문제 그림 빈칸 값 = 정답 · 문제 그림이 답을 보이지 않음(수 답은 그림 수에 없음 · 이름 답은 강조 없음)
   H 재료 충실(개념·문제 = src) · 교과서 수 표(활동목록.md) · 글 속 「항목 수+단위」 전수 = 자료 셈 · 보탬 흡수 대조(옛 TB 14줄의 핵심 낱말·수가 본류 장에 · b_ id 0) · 중복 · src 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에
   L 선행(그래프 4차시 · 합계 2차시 — 1차시 단원 도입 예외) · M 차단 어휘 · 「결」 0 · 겹낫표 0 · 인물(곰이·펭이만) · 영어 코드 0 · 조사(수 뒤 은/는·이/가·을/를·과/와)
   R 역검증 레드 — 일부러 망가뜨린 사본(출구 답 · 선행 말 · 보탬 카드 · 그래프 칸 · 표 합계 · 위에서부터 · 복습 계보 · 글 속 수 · 「결」)을 위 검사가 잡는지 9종
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u5.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const throws = (f) => { try { f(); return false; } catch (e) { return true; } };

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L0 = load(path.join(TDIR, 'data/g2s2_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u5.json'), 'utf8'));
const FIGJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g2s2_math_u5.json'), 'utf8'));
const PREV = load(path.join(TDIR, 'data/g2s2_math_u4.js'));
const PREV_K = Object.keys(PREV).sort().pop(); // 4단원 마지막 차시 — 다시 지어져도 동적으로
const KEYS = Array.from({ length: 8 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '표와 그래프', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const slideText = (s) => clean([s.data.title, s.data.content, s.data.question, s.data.scenario && s.data.scenario.body].filter(Boolean).join(' '));
const S = String;

/* ── 게이트 자체 자료 — 활동목록.md · 지도서 268~295쪽에서 따로 옮김(생성기·그림 명세와 따로) ── */
const CNT = (lists) => { const o = {}; Object.keys(lists).forEach(k => { o[k] = lists[k].length; }); return o; };
const ACT_N = { '현장체험학습': ['서준', '수찬', '우영', '재이', '슬기', '효주', '소희'], '안전 체험': ['채원', '세미', '도현'], '놀이 한마당': ['다윤', '정우', '소민', '시후', '지은'], '신나는 무용': ['호진', '지아'], '텃밭 가꾸기': ['민하', '연우', '상혁'] };
const SEA_N = { 봄: ['지아', '재이', '연우', '슬기', '수찬', '소희', '세미'], 여름: ['민하', '우영', '시후', '채원'], 가을: ['지은', '상혁', '호진', '효주', '서준', '정우'], 겨울: ['도현', '소민', '다윤'] };
const ANI_N = { 개: ['수찬', '지아', '민하', '소민', '소희', '상혁'], 앵무새: ['채원', '세미', '도현'], 고양이: ['서준', '효주', '호진', '지은', '시후'], 토끼: ['재이', '다윤'], 금붕어: ['슬기', '정우', '연우', '우영'] };
const BIRTH = { '1월': ['호진', '소민'], '3월': ['지아'], '5월': ['재이'], '6월': ['연우'], '8월': ['슬기', '시후'], '10월': ['소희', '지은', '수찬'], '11월': ['정우'], '12월': ['세미'] };
const BOOKS = { 슬기: 5, 지아: 3, 수찬: 8, 세미: 6, 재이: 9, 연우: 2, 소희: 5, 지은: 11, 호진: 8, 소민: 10, 시후: 7, 정우: 4 };
const WX_D = { 맑음: [1, 5, 6, 7, 12, 22, 23, 31], 흐림: [2, 8, 9, 11, 13, 17, 21, 24, 25, 26, 28], 비: [3, 4, 10, 14, 15, 16, 20], 눈: [18, 19, 27, 29, 30] };
const D = {
  SHAPES: { 사각형: 4, 원: 3, 삼각형: 5 }, COOKIE: { '한 가지 색': 4, '두 가지 색': 6 }, HOLES: { '2개': 5, '3개': 1, '4개': 6 }, BSHAPE: { '◯': 5, '△': 3, '□': 4 },
  PRACTICE: { '의견 나누기': 5, '여러 방법 조사': 4, '쉽게 나타내기': 5, '서로 협력': 3 },
  ACT: CNT(ACT_N), BLOCK: { 주황색: 9, 파란색: 10, 노란색: 8 }, SEA: CNT(SEA_N), PIECE: { '①': 4, '②': 6, '③': 7, '④': 1, '⑤': 2 },
  ANI: CNT(ANI_N), INSTR: { 리코더: 2, 피아노: 6, 칼림바: 4, 오카리나: 2 }, BUNGEO: { 팥: 7, 슈크림: 5, 고구마: 2, 치즈: 3, 초코: 4 },
  GAMES: { 비사치기: 3, '투호 놀이': 8, 제기차기: 2, 공기놀이: 9 }, JEGI: { '1모둠': 5, '2모둠': 3, '3모둠': 7, '4모둠': 13, '5모둠': 8 }, SNACK: { 햄버거: 5, 떡볶이: 8, 김밥: 4, 라면: 2 }, RIDES: { 미끄럼틀: 14, 그네: 5, '회전 무대': 13, 시소: 9 },
  CGAME: { 땅따먹기: 4, 공기놀이: 5, 보드게임: 6, 딱지치기: 5 }, GIFTS: { 로봇: 5, 인형: 3, 모자: 4, 신발: 4, 그림책: 4 },
  WX: CNT(WX_D), FRUIT: { 자두: 3, 포도: 5, 키위: 2, 감: 4, 복숭아: 4 }, SPORT: { 줄넘기: 6, 공놀이: 6, 달리기: 4, 수영: 7 }
};
const LDS = { u5_l01: ['SHAPES', 'COOKIE', 'HOLES', 'BSHAPE', 'PRACTICE'], u5_l02: ['ACT', 'BLOCK'], u5_l03: ['SEA', 'PIECE'], u5_l04: ['ANI', 'INSTR', 'BUNGEO'], u5_l05: ['GAMES', 'JEGI', 'SNACK', 'RIDES'], u5_l06: ['CGAME', 'GIFTS'], u5_l07: ['WX', 'FRUIT'], u5_l08: ['SPORT'] };
/* 셈기 */
const SUM = (d) => Object.values(d).reduce((a, v) => a + v, 0);
const MAXV = (d) => Math.max(...Object.values(d)), MINV = (d) => Math.min(...Object.values(d));
const MAXK = (d) => { const k = Object.keys(d).filter(x => d[x] === MAXV(d)); ok(k.length === 1, '가장 많은 것 둘 ' + k); return k[0]; };
const MINK = (d) => { const k = Object.keys(d).filter(x => d[x] === MINV(d)); ok(k.length === 1, '가장 적은 것 둘 ' + k); return k[0]; };
const OVERL = (d, n) => Object.keys(d).filter(k => d[k] > n), UNDERL = (d, n) => Object.keys(d).filter(k => d[k] < n);
const SECOND = (d) => { const v = Object.values(d).sort((a, b) => b - a)[1]; const k = Object.keys(d).filter(x => d[x] === v); ok(k.length === 1, '두 번째 둘'); return k[0]; };
const SAMEK = (d) => { const by = {}; Object.keys(d).forEach(k => { (by[d[k]] = by[d[k]] || []).push(k); }); const g = Object.values(by).filter(x => x.length > 1); ok(g.length === 1, '같은 수 무리 ' + g.length); return g[0].join(', '); };
const SAMEAS = (d, k0) => { const k = Object.keys(d).filter(x => x !== k0 && d[x] === d[k0]); ok(k.length === 1, '같은 수 ' + k); return k[0]; };
const CMPW = (a, b) => (a > b ? '많습니다' : a < b ? '적습니다' : '같습니다');
const WEATHER_OF = (day) => { const k = Object.keys(WX_D).filter(w0 => WX_D[w0].indexOf(day) >= 0); ok(k.length === 1, day + '일 날씨 ' + k); return k[0]; };
const ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
const josaIE = (word) => { const c = word.charCodeAt(word.length - 1) - 0xAC00; return c >= 0 && c % 28 ? '이에요' : '예요'; };

const EXP = {
  basic: {
    u5_l01: [CMPW(D.HOLES['4개'], D.HOLES['2개']), CMPW(D.BSHAPE['□'], D.BSHAPE['◯']), S(D.COOKIE['두 가지 색'] - D.COOKIE['한 가지 색'])],
    u5_l02: [S(Object.values(ACT_N).flat().length - (SUM(D.ACT) - D.ACT['현장체험학습'])), S(SUM(D.BLOCK)), MAXK(D.ACT)],
    u5_l03: [S(SEA_N.가을.length), S(SUM(D.PIECE)), MINK(D.SEA)],
    u5_l04: [S(ANI_N.고양이.length), MAXK(D.BUNGEO), S(D.INSTR.피아노 - D.INSTR.리코더)],
    u5_l05: [OVERL(D.RIDES, 10).join(', '), S(D.SNACK.떡볶이 - D.SNACK.라면), UNDERL(D.GAMES, 5).join(', ')],
    u5_l06: [S(SUM(D.GIFTS)), S(D.GIFTS.인형 + 2), SAMEK(D.GIFTS)],
    u5_l07: [S(D.WX.비), S(D.WX.흐림 - D.WX.맑음), SAMEAS(D.FRUIT, '감')],
    u5_l08: [S(D.SPORT.수영 - D.SPORT.달리기), S(D.SPORT.줄넘기), '가장 많이 좋아하는 운동은 ' + MAXK(D.SPORT) + josaIE(MAXK(D.SPORT))]
  },
  lev: {
    u5_l01: [S(D.SHAPES.삼각형 - D.SHAPES.원) + '개', S(SUM(D.HOLES) - D.HOLES['2개'] - D.HOLES['4개']) + '개'],
    u5_l02: [S(D.ACT['현장체험학습'] + D.ACT['안전 체험'] + D.ACT['놀이 한마당']) + '명', S(MAXV(D.BLOCK) - MINV(D.BLOCK)) + '개'],
    u5_l03: [S(5 * 1 + 1) + '개', S(SUM(D.SEA)) + '명'],
    u5_l04: [S(4) + '명', S(7) + '칸'],
    u5_l05: [S(SUM(D.GAMES)) + '명', S(MAXV(D.JEGI) - MINV(D.JEGI)) + '회'],
    u5_l06: [S(SUM(D.CGAME)) + '명', S(8) + '칸'],
    u5_l07: [S(5 * 2 + 1) + '개', S(SUM(D.WX)) + '일'],
    u5_l08: [S(SUM(D.SPORT)) + '명', S(SUM(D.SPORT) - D.SPORT.줄넘기 - D.SPORT.공놀이 - D.SPORT.달리기) + '명']
  },
  exit: {
    u5_l01: [MAXK(D.SHAPES), S(SUM(D.COOKIE)) + '개', S(BIRTH['10월'].length) + '명'],
    u5_l02: ['합계', S(D.ACT['놀이 한마당'] - D.ACT['신나는 무용']) + '명', S(SUM(D.ACT) - D.ACT['현장체험학습'] - D.ACT['안전 체험'] - D.ACT['놀이 한마당'] - D.ACT['신나는 무용']) + '명'],
    u5_l03: [S(D.SEA.봄 - D.SEA.겨울) + '명', S(D.SEA.여름 + D.SEA.가을) + '명', S(SUM(D.SEA) - D.SEA.봄 - D.SEA.여름 - D.SEA.가을) + '명'],
    u5_l04: ['맨 아래 칸부터', S(D.ANI.개 - D.ANI.토끼) + '명', '아니요'],
    u5_l05: [S(OVERL(D.GAMES, 3).length) + '가지', S(D.GAMES['투호 놀이'] - D.GAMES.제기차기) + '명', S(SUM(D.JEGI)) + '회'],
    u5_l06: [S(D.CGAME.보드게임 - D.CGAME.땅따먹기) + '명', D.CGAME.공기놀이 === D.CGAME.딱지치기 ? '같아요' : '달라요', MINK(D.GIFTS)],
    u5_l07: [WEATHER_OF(24), S(SUM(D.FRUIT)) + '명', S(SUM(D.WX) - D.WX.맑음 - D.WX.흐림 - D.WX.비) + '일'],
    u5_l08: [S(6 + 4 + 7) + '명', S(D.SPORT.줄넘기 - D.SPORT.달리기) + '명', S(9) + '칸']
  },
  adv: {
    u5_l01: S(MAXV(D.PRACTICE) - MINV(D.PRACTICE)) + '번', u5_l02: S(5 + 2) + '명', u5_l03: S(8 + D.SEA.여름 + D.SEA.가을 + D.SEA.겨울 - SUM(D.SEA)) + '명', u5_l04: ORD[D.ANI.앵무새] + ' 칸',
    u5_l05: SECOND(D.RIDES), u5_l06: S(SUM(D.CGAME) - D.CGAME.땅따먹기 + 5) + '개', u5_l07: S(D.WX.맑음 + D.WX.눈 - D.WX.비) + '일', u5_l08: S(D.SPORT.줄넘기 + D.SPORT.공놀이 - D.SPORT.수영) + '명'
  }
};
/* 지도서 차시 이름 · 쪽 · 성취기준 */
const TITLE = { u5_l01: '표와 그래프', u5_l02: '자료를 분류하여 표로 나타내 볼까요', u5_l03: '자료를 조사하여 표로 나타내 볼까요', u5_l04: '자료를 분류하여 그래프로 나타내 볼까요', u5_l05: '표와 그래프를 보고 무엇을 알 수 있을까요', u5_l06: '표와 그래프로 나타내 볼까요', u5_l07: '수학이랑 확인해요', u5_l08: '수학이랑 만들어요' };
const PAGES = { u5_l01: '274~277', u5_l02: '278~279', u5_l03: '280~281', u5_l04: '282~285', u5_l05: '286~289', u5_l06: '290~291', u5_l07: '292~293', u5_l08: '294~295' };
const STDS = { a: '[2수04-02] 자료를 분류하여 표로 나타내고, 자료를 표로 나타내면 편리한 점을 말할 수 있다.', b: '[2수04-03] 자료를 분류하여 ◯, ×, / 등을 이용한 그래프로 나타내고, 자료를 그래프로 나타내면 편리한 점을 말할 수 있다.' };
const STD_OF = (n) => (n === 2 || n === 3 ? STDS.a : n === 4 ? STDS.b : STDS.a + ' · ' + STDS.b);
/* 교과서 수 표 — 활동목록.md(지도서 268~295쪽 정독)의 차시별 교과서·익힘·확인해요 수·장면 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u5_l01: ['친구들의 생각이 궁금해요', '2학년 때 즐거웠던 활동', '좋아하는 동물', '좋아하는 전통 놀이', '하고 싶은 교실 놀이', '11월에 읽은 책의 수', '11권', '생일 축하해요', '10월', '시간표', '사각형 4개', '원 3개', '삼각형 5개', '한 가지 색 4개', '두 가지 색 6개', '함께 조사해요', '서로 협력', '색종이', '구멍 수', '많습니다', '적습니다'],
  u5_l02: ['슬기네 반', '이름표', '20장', '현장체험학습 7명', '안전 체험 3명', '놀이 한마당 5명', '신나는 무용 2명', '텃밭 가꾸기 3명', '합계', '내년에도', '한눈에', '모형 블록', '27', '주황색', '세면서 표시하기'],
  u5_l03: ['봄(3, 4, 5월)', '여름(6, 7, 8월)', '가을(9, 10, 11월)', '겨울(12, 1, 2월)', '계절별로 손을 들어요', '한 사람씩 말해요', '이름을 써서 붙여요', '묻고 답하기', '이동하기', '제목', '칸을 나누어', '20명', '봄 7명', '조각'],
  u5_l04: ['수찬이네 반', '붙임딱지', '아래에서 위로', '번거로워', '개 6명', '앵무새 3명', '고양이 5명', '토끼 2명', '금붕어 4명', '그래프', '◯의 크기', '제목', '리코더', '피아노', '칼림바', '오카리나', '팥', '슈크림', '붕어빵', '편지'],
  u5_l05: ['동호네 반', '22명', '비사치기 3명', '공기놀이 9명', '투호 놀이, 공기놀이', '3명보다 많은', '5명보다 적은', '지수네 반', '36회', '4모둠', '주사위', '20번', '햄버거', '떡볶이', '미끄럼틀 14명', '회전 무대 13명', '10명보다 많은'],
  u5_l06: ['놀이 시간에', '땅따먹기 4명', '공기놀이 5명', '보드게임 6명', '딱지치기 5명', '민영이', '쪽지', '4~5가지', '직접 만나서', '로봇', '인형', '그림책', '시완이', '12월 3일', '일기'],
  u5_l07: ['12월 24일', '흐림', '18일, 19일, 27일, 29일, 30일', '△', '맑음 8일', '흐림 11일', '비 7일', '눈 5일', '31일', '3일', '은주네 반', '자두', '복숭아', '표와 그래프를 이용'],
  u5_l08: ['무지개 색깔', '음료', '운동', '장소', '줄넘기, 공놀이, 달리기, 수영', '주스', '식혜', '코코아', '급식실', '23명', '수영', '발표 자료', '학년 신문', '음식, 장난감, 계절']
};
/* 옛 보탬 표 TB(archive/neutral/gen_g2s2_math_u5.js) 14줄 — 각 줄의 핵심 수·낱말이 본류 장(extras 아님)에 있어야 한다 */
const TBA = {
  u5_l01: [['칠판 속 표와 그래프 — 책·생일·시간표', ['11월에 읽은 책의 수', '지은', '11권', '생일 축하해요', '10월', '시간표']], ['단원 실천 활동 — 함께 조사해요', ['함께 조사해요', '서로 협력', '색종이']]],
  u5_l02: [['내년에도 하면 좋을 활동 · 자료와 분류와 표', ['내년에도', '현장체험학습', '20명', '세면서 표시하기', '합계']]],
  u5_l03: [['조사 방법 세 갈래와 표를 만들 때 생각할 점', ['묻고 답하기', '쓰기', '이동하기', '제목', '칸을 나누어', '지아']]],
  u5_l04: [['동물 붙임딱지 — 개는 어디에 붙일까', ['붙임딱지', '아래에서 위로', '번거로워']], ['그래프를 나타내는 순서와 ◯의 크기', ['그리는 순서', '◯의 크기', '한 가지', '제목']], ['악기 그래프와 붕어빵 가게 편지', ['피아노', '리코더', '팥', '붕어빵', '편지']]],
  u5_l05: [['주사위 20번 — 알 수 있는 내용 말하기 놀이', ['주사위', '20번', '햄버거', '떡볶이']], ['놀이터 놀이기구 · 5명보다 적은', ['미끄럼틀', '회전 무대', '10명보다 많은', '5명보다 적은']]],
  u5_l06: [['시완이의 일기 — 받고 싶은 생일 선물', ['로봇', '인형', '그림책', '일기', '12월 3일']], ['교실 놀이 조사 계획 세우기', ['쪽지', '직접 만나서', '4~5가지', '보드게임']]],
  u5_l07: [['확인해요 오답 유형과 함께 조사해요 돌아보기', ['△', '소리 내어', '은주네 반', '자두', '표와 그래프를 이용']]],
  u5_l08: [['카드 네 가지 — 조사 주제와 항목', ['무지개 색깔', '식혜', '코코아', '컴퓨터실', '음식']], ['이런 활동도 — 우리 학년 신문', ['학년 신문']]]
};
/* 틀린 생각 — 틀린 말이 있고, 바른 생각에 게이트 셈 값이 있다 */
const WRONG = { u5_l01: ['예쁜 단추', '구멍 수'], u5_l02: ['두 번 쓰거나', '합계가 ' + SUM(D.ACT) + '명'], u5_l03: ['두 번', '합계가 ' + SUM(D.SEA) + '명'], u5_l04: ['위에서부터', '맨 아래 칸부터'], u5_l05: ['비사치기도 넣는다', OVERL(D.GAMES, 3).join(', ')], u5_l06: ['내가 하고 싶은 놀이', MAXK(D.CGAME) + '(' + MAXV(D.CGAME) + '명)'], u5_l07: ['하루를 빠뜨리거나', '합계가 ' + SUM(D.WX) + '일'], u5_l08: ['수영을 잘해요', '알게 된 점'] };
const FIRST = [['그래프', 4], ['합계', 2]];

/* ── 검사 함수 (역검증에서 망가뜨린 사본에도 다시 쓴다) ── */
function want(d, exp) {
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
}
function checkAnswers(Ls, k) { let n = 0; const sl = Ls[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } n++; });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === EXP.lev[k][i], t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3 && lv[t].steps[lv[t].steps.length - 1] === lv[t].a, t + ' 풀이 단계·끝'); n++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === EXP.exit[k][i], '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); n++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++;
  return n; }
function checkLineage(Ls, k, i) { const rv = Ls[k].slides[1].data;
  if (!i) { const pe = PREV[PREV_K].slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g2s2_math:' + PREV_K && SAME(rv.items.map(x => [x.q, x.a]), pe.map(x => [x.q, x.a])), 'l01 복습 = 4단원 ' + PREV_K + ' 출구 (생성기를 다시 돌릴 것)'); ok(rv.content.indexOf(PREV[PREV_K].meta.unit_title) >= 0 && /분류하기/.test(rv.content), 'l01 복습 글(4단원 이름 · 분류하기)'); return; }
  const ex = Ls[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }
const dataStrings = (Ls, k, opt) => { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (opt && opt.skip && opt.skip[x]) return; walk(o[x], where + '.' + x); }); })(opt && opt.slidesOnly ? Ls[k].slides : Ls[k], k); return out; };
const teach = (Ls, k) => JSON.stringify(Ls[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(Ls[k].extras);
function checkFirst(Ls) { KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(Ls, k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }); }
function checkExtras(Ls, k) { const ex = Ls[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복'); ok(!ids.some(x => /^b_l/.test(x)) && !ex.some(e => e.type === 'other_activity'), '보탬 카드(b_ · other_activity) 남음');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  Ls[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }
/* 글 속 「항목 수+단위」 전수 — 그 차시 자료의 항목 이름 바로 뒤 「7명」「11일」 꼴은 게이트 셈과 같아야 한다 */
const FACT_SKIP = { 'u5_l03.slides.14.data.context': 1 }; // 3차시 넓히기 = 일부러 잘못 센 친구의 표(봄 8명)
const normC = (c) => String(c).replace(/\n?\(.*\)$/, '').replace(/\s+/g, '');
function factsOf(Ls, k) { const out = []; const dss = LDS[k].map(n => D[n]);
  dataStrings(Ls, k, { skip: { fig: 1, url: 1, id: 1, img: 1 } }).forEach(([s0, wh]) => { if (FACT_SKIP[wh.replace(/^(u5_l\d\d)\.slides\.(\d+)/, (m, a, b) => a + '.slides.' + b)]) return; const s = clean(s0);
    dss.forEach(ds => Object.keys(ds).forEach(cat => { if (/^[\d①-⑤◯△□]/.test(cat)) return; const re = new RegExp('(?<![가-힣])' + cat.replace(/[()]/g, '\\$&') + ' (\\d+)(명|개|일|회|권|번)(?![가-힣]*짜리)', 'g'); let m; while ((m = re.exec(s))) out.push([wh, cat, +m[1], ds[cat]]); })); });
  return out; }
function checkFacts(Ls) { let n = 0; const bad = []; KEYS.forEach(k => factsOf(Ls, k).forEach(([wh, cat, v, want0]) => { n++; if (v !== want0) bad.push(wh + ' ' + cat + ' ' + v + '(셈 ' + want0 + ')'); })); ok(!bad.length, bad.slice(0, 4).join(' | ')); return n; }

console.log('═══ A. 로드 ═══');
T('8차시 키 u5_l01~l08 (옛 키와 같음) · 파일 data/g2s2_math_u5.js', () => ok(SAME(Object.keys(L0).sort(), KEYS), Object.keys(L0).join(',')));
T('meta: 2학년 2학기 수학 · 5단원 표와 그래프 · 성취기준 지도서 문구 · 40분 · 지도서 쪽 · theme · live_url 원문 실재 · n', () => KEYS.forEach((k, i) => { const m = L0[k].meta; ok(m.grade === 2 && m.term === 2 && m.unit === 5 && m.subject === '수학' && m.unit_title === '표와 그래프' && m.n === i + 1, k); ok(m.std === STD_OF(i + 1), k + ' 성취기준 ' + m.std); ok(!/임시/.test(m.std), k + ' 임시'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 5단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(m.theme === '곰이·펭이 우리 반 조사 놀이터', k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 320분', () => { KEYS.forEach(k => ok(L0[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L0[k].meta.title)); ok(KEYS.reduce((a, k) => a + L0[k].meta.duration_min, 0) === 320, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math · 2학년 = tier-mid', () => { ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 tbl2·cg2·tly2·dc2·srt2·wcl2·nte2·tools 등록 · 렌더 깨짐 0', () => { [{ k: 'tbl2', head: ['a', 'b'], cats: ['가'], vals: [1], total: 1 }, { k: 'cg2', cats: ['가'], max: 2, grid: ['10'], ax: ['a', 'b'] }, { k: 'tly2', name: 'a', cats: ['가'], counts: [6] }, { k: 'dc2', items: [['a', 'b']] }, { k: 'srt2', groups: [['a', ['b']]] }, { k: 'wcl2', first: 0, days: ['맑음'] }, { k: 'nte2', hd: 'a', body: 'b **c**' }, { k: 'tools', items: [{ emoji: '📖', name: 'a', kind: 'b' }] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined/.test(h), f.k); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L0[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 152장 (8 × 19)', () => ok(KEYS.reduce((a, k) => a + L0[k].slides.length, 0) === 152, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선 + 실사 자리) ═══');
function errPeople(Ls) { const er = []; KEYS.forEach(k => Ls[k].slides.forEach(s => (s.data.kids || []).forEach((kd, i) => { if (!(i === 0 ? /^곰이\n"/.test(kd.label) && kd.face === '🐻' : /^펭이\n"/.test(kd.label) && kd.face === '🐧')) er.push(k + ' ' + s.id + ' 인물 ' + kd.label.split('\n')[0]); }))); return er; }
KEYS.forEach(k => T(k + ' 7요소 · 인물 곰이·펭이', () => { const sl = L0[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); const mo = sl[2].data;
  ok(mo.kids && mo.kids.length === 2 && mo.question, '③장면·물음·인물'); ok(!errPeople(L0).length, errPeople(L0).join(' | '));
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 8종 서로 다름 · 다른 덱(data 전체)과 겹침 0', () => { const im = KEYS.map(k => L0[k].slides[2].data.img); ok(new Set(im).size === 8, im.join(',')); let other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g\d(s\d)?_[a-z]+_u\d+\.js$/.test(f) && f !== 'g2s2_math_u5.js').forEach(f => { try { Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => { if (s.data && s.data.img) other.push(s.data.img); })); } catch (e) { /* 다른 꼴 파일 */ } }); ok(other.length >= 300, '다른 덱 실사 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침 ' + im.filter(x => other.indexOf(x) >= 0)); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '4단원 마지막 차시 ' + PREV_K + ' 출구(동적)'), () => checkLineage(L0, k, i)));
T('마지막 차시 「다음 단원엔」 = 규칙 찾기 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L0.u5_l08.slides[18].data; ok(nx.title === '다음 단원엔' && /규칙 찾기/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L0[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });
T('6단원 이음 — g2s2_math_u6 u6_l01 복습 = 이 단원 u5_l08 출구(그 생성기가 vm 으로 읽음)', () => { const U6 = load(path.join(TDIR, 'data/g2s2_math_u6.js')); const rv = U6.u6_l01.slides[1].data; ok(rv.from === 'g2s2_math:u5_l08', 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L0.u5_l08.slides[15].data.items.map(x => [x.q, x.a])), 'u6_l01 복습이 옛 출구 — gen_g2s2_math_u6 다시 돌릴 것'); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { nCheck += checkAnswers(L0, k); }));
T('다시 셈한 정답 = 72', () => ok(nCheck === 72, nCheck));
T('셈기 자체 확인 — 명단 세기 · 합계 · 가장 많은/적은 · ~보다 많은/적은 · 같은 수 · 달력 · 틀린 답 잡음', () => { ok(SAME(D.ACT, { '현장체험학습': 7, '안전 체험': 3, '놀이 한마당': 5, '신나는 무용': 2, '텃밭 가꾸기': 3 }) && SUM(D.ACT) === 20, '이름표 20장'); ok(SUM(D.SEA) === 20 && SUM(D.ANI) === 20 && SUM(D.WX) === 31 && SUM(D.GAMES) === 22 && SUM(D.JEGI) === 36 && SUM(D.BUNGEO) === 21 && SUM(D.FRUIT) === 18 && SUM(D.SPORT) === 23 && SUM(D.SNACK) === 19 && SUM(D.HOLES) === 12 && SUM(D.BLOCK) === 27, '합계(교과서)');
  ok(SAME(D.WX, { 맑음: 8, 흐림: 11, 비: 7, 눈: 5 }) && new Set([].concat(...Object.values(WX_D))).size === 31, '12월 달력 31일'); ok(OVERL(D.GAMES, 3).join() === '투호 놀이,공기놀이' && UNDERL(D.GAMES, 5).join() === '비사치기,제기차기' && OVERL(D.RIDES, 10).join() === '미끄럼틀,회전 무대', '많은·적은'); ok(MAXK(BOOKS) === '지은' && BOOKS.지은 === 11 && D.GIFTS.로봇 === D.GIFTS.인형 + 2 && D.SPORT.공놀이 === D.SPORT.줄넘기 && MINK(D.SPORT) === '달리기', '책·선물·운동');
  let c = 0; [() => want({ options: [{ text: '미끄럼틀, 회전 무대, 시소', correct: true }, { text: '미끄럼틀, 회전 무대' }] }, OVERL(D.RIDES, 10).join(', ')), () => want({ input: 'count_input', answer: 21, note: '**21**' }, S(SUM(D.SEA))), () => want({ options: [{ text: '비사치기, 제기차기, 투호 놀이', correct: true }] }, UNDERL(D.GAMES, 5).join(', '))].forEach(f => { if (throws(f)) c++; }); ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const EQ = /\d[\d \t+\-−×]*=[\d \t+\-−×=]*\d/g;
function evI(e) { const t = String(e).replace(/[−]/g, '-').replace(/×/g, '*').replace(/\s+/g, ''); ok(/^[\d+\-*]+$/.test(t), '식 글자 ' + e); return t.split(/(?=[+-])/).reduce((a, term) => { const sg = term[0] === '-' ? -1 : 1; const v = term.replace(/^[+-]/, '').split('*').reduce((p, x) => p * +x, 1); return a + sg * v; }, 0); }
const chainOK = (e) => { const p = String(e).split('=').map(x => x.trim()).filter(Boolean); const v = p.map(evI); return v.every(x => x === v[0]); };
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const t = m[0].trim(); if (!/[+\-−×]/.test(t)) continue; nEq++; try { if (!chainOK(t)) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」'); } } }
KEYS.forEach(k => dataStrings(L0, k, { slidesOnly: true, skip: { fig: 1 } }).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); }));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 30', () => ok(!badEq.length && nEq >= 30, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('틀린 생각은 정말 틀림 — 틀린 말이 있고 바른 생각에 셈 값', () => KEYS.forEach(k => { const d = L0[k].slides[7].data, [bad, good] = WRONG[k]; ok(clean(d.wrong).indexOf(bad) >= 0, k + ' 틀린 생각에 「' + bad + '」 없음'); ok(clean(d.right).indexOf(good) >= 0, k + ' 바른 생각에 「' + good + '」 없음'); }));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['7 + 3 + 5 + 2 + 3 = 21', '9 + 10 + 8 = 28', '13 − 3 = 9'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('8 + 11 + 7 + 5 = 31', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const flat = (f) => (f.k === 'panels' ? f.items.flatMap(p => flat(p.fig || p)) : [f]);
const nG = { tbl2: 0, cg2: 0, tly2: 0, dc2: 0, srt2: 0, wcl2: 0, nte2: 0, tools: 0, hole: 0, cont: 0 };
function dsOf(k, cats) { const want0 = cats.map(normC).sort().join('|'); const hit = LDS[k].filter(n => Object.keys(D[n]).map(normC).sort().join('|') === want0); ok(hit.length === 1, k + ' 그림 항목에 맞는 자료 없음 ' + cats.join(',')); const ds = D[hit[0]], m = {}; Object.keys(ds).forEach(x => { m[normC(x)] = ds[x]; }); return m; }
const NOTE = { u5_l06: () => ({ bold: [MAXK(D.CGAME)], says: [MINK(D.CGAME) + '를 좋아하는 친구들이 가장 적습니다'] }), u5_l08: () => ({ bold: [SUM(D.SPORT) + '명', MAXK(D.SPORT)], says: [D.SPORT.줄넘기 === D.SPORT.공놀이 ? '줄넘기와 공놀이를 좋아하는 학생 수는 같습니다' : '-'] }) };
/* 그림 하나 검사 — 문제 그림이면 빈칸 값 목록을 돌려준다 */
function checkFig(k, w0, f, prob, tx) {
  const h = FIG.render(f); ok(h && !/NaN|undefined|\[object/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'tbl2') { nG.tbl2++; const ds = dsOf(k, f.cats); const holes = f.holes || []; f.cats.forEach((c, i) => ok(f.vals[i] === ds[normC(c)], w0 + ' 표 칸 ' + c + ' ' + f.vals[i] + ' ≠ 셈 ' + ds[normC(c)]));
    if (f.total != null) ok(f.total === Object.values(ds).reduce((a, v) => a + v, 0), w0 + ' 합계 ' + f.total); const shown = d.querySelector('.fig-tbl2').getAttribute('data-tbl');
    ok(!prob ? !holes.length && !f.total_hole : true, w0 + ' 개념 그림에 빈칸'); ok((shown.match(/\?/g) || []).length === holes.length + (f.total_hole ? 1 : 0), w0 + ' 빈칸 표시');
    return holes.map(i => String(f.vals[i])).concat(f.total_hole ? [String(f.total)] : []); }
  if (f.k === 'cg2') { nG.cg2++; const ds = dsOf(k, f.cats); const holes = f.holes || [];
    f.cats.forEach((c, i) => { const g = String(f.grid[i] || ''); ok(g.length === f.max, w0 + ' 칸 수 ' + c); ok(/^1*0*$/.test(g), w0 + ' ' + c + ' 칸 — 맨 아래(왼쪽)부터 빠짐없이가 아님 ' + g); nG.cont++; const n = (g.match(/1/g) || []).length;
      if (holes.indexOf(i) >= 0) ok(prob && n === 0, w0 + ' 채울 칸 ' + c + ' 에 기호'); else ok(n === ds[normC(c)], w0 + ' 그래프 ' + c + ' ' + n + ' ≠ 셈 ' + ds[normC(c)]); });
    ok(f.max >= Math.max(...Object.values(ds)), w0 + ' 칸이 모자람'); if (prob) ok(!(f.hi || []).length, w0 + ' 문제 그래프 강조'); ok(['O', 'X', '/'].indexOf(f.sym) >= 0, w0 + ' 기호 한 가지');
    return holes.map(i => String(ds[normC(f.cats[i])])); }
  if (f.k === 'tly2') { nG.tly2++; const ds = dsOf(k, f.cats); f.cats.forEach((c, i) => ok(f.counts[i] === ds[normC(c)], w0 + ' 세면서 표시하기 ' + c)); ok(!/\d/.test(d.body.textContent), w0 + ' 표시 그림에 수'); return []; }
  if (f.k === 'srt2') { nG.srt2++; const NAMES = { u5_l02: ACT_N, u5_l03: SEA_N, u5_l04: ANI_N }[k]; ok(NAMES, w0 + ' 명단 없음'); const want0 = {}; Object.keys(NAMES).forEach(x => { want0[normC(x)] = NAMES[x]; }); ok(f.groups.length === Object.keys(NAMES).length, w0 + ' 칸 수'); f.groups.forEach(([g, ns]) => ok(SAME(ns, want0[normC(g)]), w0 + ' 분류 칸 ' + g + ' 이름 ≠ 명단')); return []; }
  if (f.k === 'dc2') { nG.dc2++; const want0 = {}; Object.keys(ACT_N).forEach(a => ACT_N[a].forEach(nm => { want0[nm] = a; })); ok(f.items.length === Object.keys(want0).length, w0 + ' 낱장 수 ' + f.items.length); f.items.forEach(([nm, a]) => ok(want0[nm] === a, w0 + ' 낱장 ' + nm + ' ' + a)); ok(new Set(f.items.map(x => x[0])).size === f.items.length, w0 + ' 같은 이름 둘'); return []; }
  if (f.k === 'wcl2') { nG.wcl2++; ok(f.first === 0 && f.days.length === 31, w0 + ' 12월 1일 = 일요일 · 31일'); f.days.forEach((x, i) => ok(x === WEATHER_OF(i + 1), w0 + ' ' + (i + 1) + '일 ' + x)); if (prob) ok(!(f.mark || []).length && !(f.ring || []).length, w0 + ' 문제 달력에 표시'); else ok(SAME((f.mark || []).slice().sort((a, b) => a - b), WX_D.눈), w0 + ' △ = 눈 온 날'); return []; }
  if (f.k === 'nte2') { nG.nte2++; const N = NOTE[k] && NOTE[k](); ok(N, w0 + ' 쪽지 셈 없음'); const bold = (f.body.match(/\*\*([^*]+)\*\*/g) || []).map(x => x.replace(/\*/g, '')); ok(SAME(bold, N.bold), w0 + ' 쪽지 굵은 말 ' + bold + ' ≠ 셈 ' + N.bold); N.says.forEach(x => ok(f.body.indexOf(x) >= 0, w0 + ' 쪽지 사실 ' + x)); ok(!prob, w0 + ' 문제 그림에 쪽지'); return []; }
  if (f.k === 'tools') { nG.tools++; ok(f.items.length <= (prob ? 3 : 4), w0 + ' 카드 수'); if (!prob) f.items.forEach(it => ok(tx.indexOf(it.name) >= 0, w0 + ' 카드 ' + it.name + ' 이 글에 없음')); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}
const ansOf = (d) => (d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer));
function checkFigs(Ls) { const figs = []; KEYS.forEach(k => Ls[k].slides.forEach(s => { if (s.data.fig) figs.push([k, k + ' ' + s.id, s.data.fig, s.block, s]); }));
  figs.forEach(([k, w0, f, b, s]) => { const prob = b === 'basic_problem'; const tx = slideText(s); const ws = flat(f).flatMap(g => checkFig(k, w0 + ' ' + g.k, g, prob, tx)); if (prob && ws.length) { nG.hole++; const A = ansOf(s.data); ok(ws.every(x => x === A), w0 + ' 그림 빈칸 값 ' + ws + ' ≠ 답 ' + A); } });
  return figs; }
let FIGS = [];
T('그림 — 표 칸·합계 · 그래프 칸(맨 아래·왼쪽부터 빠짐없이) · 세면서 표시하기 · 분류 칸·낱장 = 명단 · 날씨 달력 · 쪽지 굵은 말 · 카드 = 게이트 셈·글', () => { FIGS = checkFigs(L0); });
T('문제 그림이 답을 보이지 않음 — 수 답은 그림 글자의 수에 없음(그래프 눈금·달력 날짜 빼고) · 이름 답은 그림에 강조 없음', () => FIGS.filter(x => x[3] === 'basic_problem').forEach(([k, w0, f, b, s]) => { const A = ansOf(s.data); if (nsp(s.data.question).indexOf(nsp(A)) >= 0) return;
  flat(f).forEach(g => { if (/^\d+$/.test(A)) { if (g.k === 'cg2' || g.k === 'wcl2') return; const txt = docOf(FIG.render(g).replace(/></g, '> <')).body.textContent; ok((txt.match(/\d+/g) || []).indexOf(A) < 0, w0 + ' ' + g.k + ' 그림에 정답 ' + A); } else ok(!(g.hi || []).length && !(g.on || []).length, w0 + ' 이름 답을 그림이 강조'); }); }));
T('개념 32장 · 기본 문제 24장 모두 그림 · 표 ≥ 12 · 그래프 ≥ 14 · 문제 그림 빈칸 대조 ≥ 6 · 부품 일곱 갈래 모두 씀', () => { let c = 0, p = 0; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 32 && p === 24, c + '/' + p); ok(nG.tbl2 >= 12 && nG.cg2 >= 14 && nG.hole >= 6 && nG.tly2 && nG.dc2 && nG.srt2 && nG.wcl2 && nG.nte2, JSON.stringify(nG)); });
T('그림 크기 — 세로 그래프는 11칸까지(더 크면 가로) · 표 항목 6개까지 · 낱장 한 줄 5장', () => FIGS.forEach(([k, w0, f]) => flat(f).forEach(g => { if (g.k === 'cg2' && g.vert !== false) ok(g.max <= 11, w0 + ' 세로 그래프 ' + g.max + '칸'); if (g.k === 'tbl2') ok(g.cats.length <= 6, w0 + ' 표 항목'); if (g.k === 'dc2') ok(g.cols === 5, w0 + ' 낱장 줄'); })));
T('그림 검사기 자체 확인 — 표 칸 · 합계 · 그래프 칸 · 위에서부터 · 채울 칸 기호 · 분류 이름 · 달력 · 쪽지 잡음', () => { let c = 0; const tr = (k, f, prob) => { if (throws(() => checkFig(k, 'probe', f, prob, ''))) c++; };
  tr('u5_l05', { k: 'tbl2', head: ['a', 'b'], cats: ['비사치기', '투호 놀이', '제기차기', '공기놀이'], vals: [3, 8, 2, 8], total: 21 }, false);
  tr('u5_l05', { k: 'tbl2', head: ['a', 'b'], cats: ['비사치기', '투호 놀이', '제기차기', '공기놀이'], vals: [3, 8, 2, 9], total: 23 }, false);
  tr('u5_l04', { k: 'cg2', sym: 'O', cats: ['개', '앵무새', '고양이', '토끼', '금붕어'], max: 6, grid: ['111110', '111000', '111110', '110000', '111100'], ax: ['a', 'b'] }, false);
  tr('u5_l04', { k: 'cg2', sym: 'O', cats: ['개', '앵무새', '고양이', '토끼', '금붕어'], max: 6, grid: ['111111', '111000', '111110', '000011', '111100'], ax: ['a', 'b'] }, false);
  tr('u5_l04', { k: 'cg2', sym: 'O', cats: ['개', '앵무새', '고양이', '토끼', '금붕어'], max: 6, grid: ['111111', '111000', '100000', '110000', '111100'], holes: [2], ax: ['a', 'b'] }, true);
  tr('u5_l03', { k: 'srt2', groups: [['봄', ['지아']], ['여름', []], ['가을', []], ['겨울', []]] }, false);
  tr('u5_l07', { k: 'wcl2', first: 0, days: FIGJ.u5_l07.slides['0'].days.map((x, i) => (i === 23 ? '맑음' : x)), mark: WX_D.눈 }, false);
  tr('u5_l06', { k: 'nte2', hd: 'a', body: '가장 많은 학생들이 원하는 교실 놀이는 **공기놀이**입니다.' }, false);
  ok(c === 8, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 글 속 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 그림 = fig json · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k], F = FIGJ[k];
  L0[k].slides.filter(s => s.block === 'concept').forEach((s, i) => { ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'); ok(SAME(s.data.fig, F.slides[i]), s.id + ' 그림 명세'); });
  L0[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.fig, F.problems[i]), s.id + ' 그림 명세'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L0[k].slides[18].data; if (k !== 'u5_l08') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L0[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l07 「흐림 11일」은 l05 에 · l04 「앵무새 3명」은 l06 에 없음)', () => { ok(nsp(JSON.stringify(L0.u5_l05)).indexOf('흐림11일') < 0, 'l05'); ok(nsp(JSON.stringify(L0.u5_l06)).indexOf('앵무새3명') < 0, 'l06'); });
let nFact = 0;
T('글 속 「항목 수+단위」 전수(발문·문제·출구·extras 포함) = 그 차시 자료 셈 · ≥ 60', () => { nFact = checkFacts(L0); ok(nFact >= 60, '대조 ' + nFact); });
const TBA_N = Object.values(TBA).reduce((a, x) => a + x.length, 0);
T('보탬 흡수 대조 — 옛 TB ' + TBA_N + '줄(보관본에 실재)의 핵심 수·낱말이 그 차시 본류 장(extras 아님)에 · b_ id 0', () => { const old = fs.readFileSync(path.join(TDIR, 'archive/neutral/gen_g2s2_math_u5.js'), 'utf8'); ok(TBA_N === 14, 'TB 줄 ' + TBA_N); Object.keys(TBA).forEach(k => { const main = nsp(JSON.stringify(L0[k].slides)); TBA[k].forEach(([title, toks]) => { ok(old.indexOf("['" + title + "'") >= 0, '보관본에 TB 줄 없음 ' + title); const miss = toks.filter(t => main.indexOf(nsp(t)) < 0); ok(!miss.length, k + ' 「' + title + '」 본류에 없음 ' + miss.join(' / ')); }); }); ok(!/"id":"b_l/.test(fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u5.js'), 'utf8')), 'b_ id'); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L0[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 차시마다 file = g2_math_u5_lNN_….html · 원문 파일 실재(투영 지도)', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g2_math_u5_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade2/semester2/math/5단원_표와그래프', f)), k + ' 원문 없음'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 동기 장 mo2(곰이·펭이) · 1인 흐름 · 그림 섬', () => { const les = L0[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'motivate') ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), s.id + ' 동기 장 꼴 ' + r.cls);
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));
T('교실 활동 장 넘침 미리 피하기 — goal 40자 안팎(≤ 42) · steps 4개 각 45자 안팎(≤ 46) · solo 3개 · 개념 글 4줄 이하', () => KEYS.forEach(k => { const a = L0[k].slides[12].data; ok(a.goal.length <= 42, k + ' goal ' + a.goal.length); ok(a.steps.length === 4 && a.steps.every(x => x.length <= 46), k + ' steps'); ok(a.solo.length === 3, k + ' solo'); L0[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 4, k + ' ' + s.id + ' 개념 글 ' + s.data.content.split('\n').length + '줄')); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재 · 보탬 카드 0', () => checkExtras(L0, k)));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 사항 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L0[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L0[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~니?」「~는가?」 0) · 물음 속 「~다.」 0 (l01 되짚기는 4단원 덱 출구 그대로라 뺌)', () => { const qs = []; KEYS.forEach((k, i) => { const sl = L0[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(i ? sl[1].data.items : []).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — ×·/ 표시와 합계 l02 · 빠진 친구 없이 l03 · 그래프 말 유도 금지·아래에서 위로·◯의 크기·섞지 않기 l04 · 3명은 빼고 선 긋기 l05 · 4~5가지·알맞게 칸 l06 · 서로 다른 표시·아랫부분부터 l07 · 달라지지 않게 l08', () => { const tx = (k) => JSON.stringify(L0[k]);
  ok(/×/.test(L0.u5_l02.slides[7].data.right) && /합계/.test(L0.u5_l02.slides[7].data.right) && /분류 항목과 표의 항목/.test(tx('u5_l02')), 'l02'); ok(/빠진 친구 없이/.test(tx('u5_l03')) && /묻고 답하기/.test(tx('u5_l03')), 'l03');
  ok(/유도하지/.test(L0.u5_l04.slides[2].data.tnote.watch) && /아래에서 위로/.test(tx('u5_l04')) && /◯의 크기/.test(L0.u5_l04.slides[7].data.right) && /섞어/.test(tx('u5_l04')) && /제목/.test(L0.u5_l04.slides[5].data.content), 'l04');
  ok(/3명이 들어가지 않아요/.test(L0.u5_l05.slides[7].data.right) && /선을 긋고/.test(L0.u5_l05.slides[5].data.content), 'l05'); ok(/4~5가지/.test(tx('u5_l06')) && /알맞게 칸/.test(L0.u5_l06.slides[5].data.content), 'l06');
  ok(/서로 다른 표시/.test(tx('u5_l07')) && /아랫부분부터/.test(tx('u5_l07')) && /31일/.test(L0.u5_l07.slides[7].data.right), 'l07'); ok(/달라지지 않게/.test(L0.u5_l08.slides[5].data.content), 'l08'); });

console.log('═══ L. 선행 용어 ═══');
T('처음 배우는 차시 전에는 그 말 0 (그래프 l04 · 합계 l02 — l01 단원 도입 예외)', () => checkFirst(L0));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(L0, KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 · 조사 ═══');
const blocked = (Ls) => { const all = JSON.stringify(Ls); return ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』', '연결 모형'].filter(b => all.indexOf(b) >= 0); };
T('차단 어휘(박음·빵꾸·갈아엎·결로·연결 모형) 0 · 「결」 0 · 겹낫표 0', () => { const b = blocked(L0); ok(!b.length, b.join(',')); });
T('렌더된 그림 속 「결」 0', () => FIGS.forEach(([k, w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('인물 = 곰이·펭이(옛 덱 계승) — 동기 장 말풍선 · 교과서 말풍선 인물(슬기·세미)은 말하는 사람으로 나오지 않음', () => { const e = errPeople(L0); ok(!e.length, e.join(' | ')); KEYS.forEach(k => L0[k].slides[2].data.kids.forEach(kd => ok(!/슬기|세미/.test(kd.label.split('\n')[0]), k + ' 말풍선 인물'))); });
T('교사 화면(렌더 글자)에 영어 코드(u5 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~D)만', () => KEYS.forEach(k => L0[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L0[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); const wds = (txt.match(/[A-Za-z]+/g) || []).filter(x => !/^[A-D]$/.test(x)); ok(!wds.length, k + ' ' + s.id + ' 영어 낱말 「' + wds.join(',') + '」'); }))));
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L0[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
function finalOf(wd) { const d = +String(wd).slice(-1); return d === 0 ? 1 : [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; const t = String(s).replace(/\*\*/g, ''); const re = /(?<![\d,])(\d+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g; let m; while ((m = re.exec(t))) { const f = finalOf(m[1]); if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
function checkJosa(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { skip: { options: 1, fig: 1, url: 1, id: 1, img: 1, live_url: 1, source: 1 } }).forEach(([s, wh]) => josa(s).forEach(b => bad.push(wh + ' 「' + b + '」'))); }); ok(!bad.length, bad.slice(0, 5).join(' | ')); }
T('조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요가 읽는 소리 받침에 맞음', () => checkJosa(L0));
T('조사 검사기 자체 확인', () => { ok(josa('6은').length === 0 && josa('4는').length === 0 && josa('4은').length === 1 && josa('20이에요').length === 0 && josa('21예요').length === 1 && josa('22예요').length === 0, '조사'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 잡는지 ═══');
const RED = [
  ['출구 답을 틀리게(l05 투호 놀이 − 제기차기 → 「5명」)', (B) => { B.u5_l05.slides[15].data.items[1].a = '5명'; }, (B) => checkAnswers(B, 'u5_l05')],
  ['선행 말을 앞 차시에(l03 개념에 「그래프」)', (B) => { B.u5_l03.slides[4].data.content += ' 그래프로 나타내요.'; }, (B) => checkFirst(B)],
  ['보탬 카드를 되살림(l04 extras 에 b_l4_1)', (B) => { B.u5_l04.extras[21] = { id: 'b_l4_1', type: 'other_activity', icon: '📗', title: '교과서 활동 — 붕어빵', content: '…', fit_slides: ['concept'] }; }, (B) => checkExtras(B, 'u5_l04')],
  ['그래프 칸 ◯ 수 틀림(l04 개 6 → 5)', (B) => { B.u5_l04.slides[5].data.fig.grid[0] = '111110'; }, (B) => checkFigs(B)],
  ['표 합계 틀림(l05 합계 22 → 21)', (B) => { B.u5_l05.slides[3].data.fig.total = 21; }, (B) => checkFigs(B)],
  ['그래프를 위에서부터(l07 눈 칸)', (B) => { B.u5_l07.slides[5].data.fig.grid[3] = '00000011111'; }, (B) => checkFigs(B)],
  ['복습 계보를 끊음(l06 복습 첫 답)', (B) => { B.u5_l06.slides[1].data.items[0].a = '9명'; }, (B) => checkLineage(B, 'u5_l06', 5)],
  ['글 속 수 틀림(l07 개념 「흐림 11일」 → 「흐림 10일」)', (B) => { B.u5_l07.slides[4].data.content = B.u5_l07.slides[4].data.content.replace('흐림 **11일**', '흐림 **10일**'); }, (B) => checkFacts(B)],
  ['「결」 글자(l08 동기 물음에 「결과」)', (B) => { B.u5_l08.slides[2].data.question += ' 조사 결과를 볼까요?'; }, (B) => { const b = blocked(B); ok(!b.length, b.join(',')); }]
];
RED.forEach(([name, broke, chk]) => T('레드 — ' + name + ' → 잡힘 · 원본은 통과', () => { ok(!throws(() => chk(L0)), '원본이 걸림'); const B = clone(L0); broke(B); ok(throws(() => chk(B)), '못 잡음'); }));
T('역검증 9종', () => ok(RED.length >= 9, RED.length));

console.log('\n게이트 g2s2 수학 u5: ' + pass + '/' + fail + ' (통과/실패) · 정답 다시 셈 ' + nCheck + ' · 식 ' + nEq + ' · 글 속 수 ' + nFact + ' · 그림 ' + FIGS.length);
process.exitCode = fail ? 1 : 0;
