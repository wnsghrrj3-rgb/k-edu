/* gate_g2s2_math_u4.js — 2학년 2학기 수학 4단원 「시각과 시간」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g2s2_math_u1 틀 + 지도서 직행 점검).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(clk1·dclk2·tbnd2·kcal2·d24·upr2·grow2·ngrid·dtb·tools·jump) · meta(2학년 2학기 · 4단원 · 성취기준 지도서 237쪽 문구 [2수03-07] 1~4·9 · [2수03-08] 1·5·6·9 · [2수03-09] 1·7~10 · 40분 · 지도서 쪽 · theme·live_url) · slug
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 + 실사 자리 10종 서로 다름 · 다른 덱과 겹침 0)
   D 복습 계보(l01 = 3단원 데이터 파일의 마지막 차시 출구 — 동적으로 찾아 대조 · l02 … l10 = 직전 출구) · l10 다음 단원 = 표와 그래프 · 5단원 u5_l01 복습 = 이 단원 l10 출구
   E 정답 다시 셈 — 게이트 자체 시각·달력 셈기(바늘 말 → 시각 · 숫자 × 5 · 몇 분 전 · 걸린 시간 · 오전/오후 · 요일 · 몇째 요일 · 날수 · 년·개월·주 후 · 읽는 말)로 기본 30 · 수준별 20 · 출구 30 · 넓히기 10 = 90
   F 식 전수(「… = …」 사슬) · 시각 사슬(「A → B 걸린 시간」) 다시 셈 · 틀린 생각은 정말 틀림
   G 그림 — 시계 바늘 = 문제 말(바늘 위치 → 시각) · 개념 시계 = 글 · 이름표(몇 분 전) = 셈 · 디지털 = 글 · 시간 띠 켠 칸 = 걸린 시간 · 달력 1일 요일·날수 = 진짜 달력 · 줄넘기 표시 = 월·수 날수
     · 하루 띠 = 계획표 · 단위 짝 = 단위 셈 · 성장 이야기 화살표 = 날짜 셈 · 숫자↔분 표 · 달의 날수 표 · 시간표 이어짐 · 문제 그림이 답을 보이지 않음(시계 숫자판은 빼고)
   H 재료 충실(개념·문제 = src) · 교과서 수 표(활동목록.md) · 보탬 흡수 대조(옛 TB 22줄의 핵심 수·낱말이 본류 장에 · b_ id 0) · 중복 · src 회수 키 · 읽는 말 전수(게이트 읽기 규칙)
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에
   L 선행(분 전 4 · 60분·1시간·시간 띠 5 · ○시간 ○분 6 · 오전·오후·24시간 7 · 1주일·개월 8 — 1차시 예외) · M 차단 어휘 · 「결」 0(meta.std 지도서 문구만 예외) · 겹낫표 0 · 인물(곰이·펭이만) · 영어 코드 0 · 조사
   R 역검증 레드 — 일부러 망가뜨린 사본(출구 답 · 선행 말 · 보탬 카드 · 읽는 말 · 복습 계보 · 문제 시계 바늘 · 달력 요일 · 조사)을 위 검사가 잡는지 8종
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u4.js */
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
const L0 = load(path.join(TDIR, 'data/g2s2_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u4.json'), 'utf8'));
const FIGJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g2s2_math_u4.json'), 'utf8'));
const PREV = load(path.join(TDIR, 'data/g2s2_math_u3.js'));
const PREV_LAST = Object.keys(PREV).sort().pop();
const KEYS = Array.from({ length: 10 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '시각과 시간', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const slideText = (s) => clean([s.data.title, s.data.content, s.data.question, s.data.scenario && s.data.scenario.body].filter(Boolean).join(' '));

/* ── 게이트 자체 시각·달력 셈기 (부품·생성기와 따로 짬) ── */
const HM = (h, m) => h + '시' + (m ? ' ' + m + '분' : '');
const DIGI = (h, m) => h + ':' + String(m).padStart(2, '0');
const NEXTH = (h) => h % 12 + 1, PREVH = (h) => (h + 10) % 12 + 1;
const BEFORE = (h, m) => { ok(m === 50 || m === 55, '몇 분 전은 5분 전·10분 전만 ' + h + ':' + m); return NEXTH(h) + '시 ' + (60 - m) + '분 전'; };
const FROMBEFORE = (H, n) => { ok(n === 5 || n === 10, '몇 분 전 ' + n); return HM(PREVH(H), 60 - n); };
const ADDM = (h, m, d) => { const t = (h % 12) * 60 + m + d; const hh = Math.floor(t / 60) % 12; return HM(hh || 12, t % 60); };
const MIN = (h1, m1, h2, m2) => { let d = (h2 * 60 + m2) - (h1 * 60 + m1); if (d < 0) d += 720; return d; };
const HMD = (d) => Math.floor(d / 60) + '시간' + (d % 60 ? ' ' + d % 60 + '분' : '');
const NUMOF = (m) => (m === 0 ? 12 : m / 5); // 긴바늘이 가리키는 숫자
const HK = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'], DG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const SINO = (n) => { const t = Math.floor(n / 10), o = n % 10; return (t > 1 ? DG[t] : '') + (t ? '십' : '') + DG[o]; };
const READ = (h, m) => HK[h] + ' 시' + (m ? ' ' + SINO(m) + ' 분' : '');
const READB = (h, m) => HK[NEXTH(h)] + ' 시 ' + SINO(60 - m) + ' 분 전';
const AMPM = (h24) => (h24 % 24 < 12 ? '오전 ' : '오후 ') + ((h24 % 12) || 12) + '시';
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const dow = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const addDays = (y, m, d, n) => { const t = new Date(Date.UTC(y, m - 1, d + n)); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]; };
const MD = (a) => a[1] + '월 ' + a[2] + '일', YMD = (a) => a[0] + '년 ' + MD(a);
const addMon = (y, m, d, k) => { const t = (m - 1) + k; return [y + Math.floor(t / 12), t % 12 + 1, d]; };
const nthDow = (y, m, wd, n) => { let c = 0; for (let d = 1; d <= dim(y, m); d++) if (dow(y, m, d) === wd && ++c === n) return d; throw new Error('몇째 요일 없음'); };
const daysSpan = (a, b) => (Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 864e5; // a 에서 b 까지 며칠 후
const ymdOf = (s) => { const r = String(s).match(/^(\d{4})년 (\d{1,2})월 (\d{1,2})일$/); return r ? [+r[1], +r[2], +r[3]] : null; };
const UNIT = { '1시간': '60분', '1일': '24시간', '1주일': '7일', '1년': '12개월' };
/* 바늘을 말로 적은 물음 → 시각 [h, m] (짧은바늘 「a와 b 사이·가운데」 · 「a,」 · 긴바늘 「n을」 · 「n에서 작은 눈금 k칸 더/덜」) */
function minOf(q) { let r = q.match(/긴바늘[이은] (?:숫자 )?(\d+)에서 작은 눈금 (\d+)칸(?:만큼)? (더|덜)/); if (r) return +r[1] * 5 + (r[3] === '더' ? 1 : -1) * +r[2]; r = q.match(/긴바늘[이은] (?:숫자 )?(\d+)(?:을|를)/); return r ? (+r[1] * 5) % 60 : null; }
function cfw(q) { let h = null, r = q.match(/짧은바늘[이은] (\d+)[과와] (\d+) (?:사이|가운데)/); if (r) { ok(+r[2] === NEXTH(+r[1]), '짧은바늘 두 숫자 ' + r[0]); h = +r[1]; } else { r = q.match(/짧은바늘[이은] (\d+)(?:,|을|를)/); if (r) h = +r[1]; } const m = minOf(q); ok(h != null && m != null, '바늘 말 못 읽음 ' + q); return [h, m]; }
const S = String;
const SEMI = { '잠': 10, '아침 식사': 1, '블록 놀이': 3, '점심 식사': 1, '박물관 관람': 5, '저녁 식사': 1, '독서': 3 }; // 교과서 97쪽 걸린 시간 표
const MUSIC = (() => { let c = 0; for (let d = 1; d <= dim(2026, 11); d++) if ([1, 3].indexOf(dow(2026, 11, d)) >= 0) c++; return c; })(); // 2026년 11월 월·수
const Q = (k, i) => SRC[k].problems[i].q;

const EXP = {
  basic: {
    u4_l01: [HM(...cfw(Q('u4_l01', 0))), HM(...cfw(Q('u4_l01', 1))), S(20 + 5)],
    u4_l02: [HM(...cfw(Q('u4_l02', 0))), HM(...cfw(Q('u4_l02', 1))), S(9 * 5)],
    u4_l03: [HM(...cfw(Q('u4_l03', 0))), HM(...cfw(Q('u4_l03', 1))), S(10 + 4)],
    u4_l04: [BEFORE(...cfw(Q('u4_l04', 0))), S(60 - 50), FROMBEFORE(4, 5)],
    u4_l05: [S(12 * 5), S(MIN(1, 30, 5, 30) / 60), S(MIN(10, 20, 11, 20) / 10)],
    u4_l06: [HMD(MIN(10, 10, 11, 40)), S(MIN(10, 30, 11, 40)), MIN(10, 40, 12, 0) > 70 ? '펭이' : '곰이'],
    u4_l07: [S(12 * 2), AMPM(13).split(' ')[0], S(24 + (11 - 8))],
    u4_l08: [WD[(dow(2026, 11, 11) + 7) % 7] + '요일', S(nthDow(2023, 11, 1, 2)), S(Array.from({ length: 12 }, (_, i) => dim(2026, i + 1)).filter(x => x === 31).length)],
    u4_l09: [HM(...cfw(Q('u4_l09', 0))), UNIT['1주일'], S(addDays(2026, 11, 14, 10)[2])],
    u4_l10: [S(2024 - 2022), MD(addMon(2024, 5, 12, 6)), MD(addDays(2024, 7, 26, 21))]
  },
  lev: {
    u4_l01: [HM(...cfw(L0.u4_l01.slides[11].data.levels.기본.q)), HM(...cfw(L0.u4_l01.slides[11].data.levels.도전.q))],
    u4_l02: [S(4 * 5) + '분', HM(...cfw(L0.u4_l02.slides[11].data.levels.도전.q))],
    u4_l03: [minOf(L0.u4_l03.slides[11].data.levels.기본.q) + '분', minOf(L0.u4_l03.slides[11].data.levels.도전.q) + '분'],
    u4_l04: [BEFORE(2, 55), FROMBEFORE(11, 10)], u4_l05: [S(MIN(3, 0, 4, 0)) + '분', S(10 - 7) + '바퀴'],
    u4_l06: [HMD(MIN(2, 10, 3, 30)), S(60 + 50) + '분'], u4_l07: [S(18 - 15) + '시간', S(14 - 10) + '시간'],
    u4_l08: [S(7 * 2) + '일', S((3 - 4 + 7) % 7 + 1) + '일'], u4_l09: [FROMBEFORE(9, 5), S(MIN(2, 20, 3, 30)) + '분'],
    u4_l10: [S(daysSpan([2024, 7, 12], [2024, 7, 26]) / 7) + '주', YMD(addMon(2024, 12, 22, 4))]
  },
  exit: {
    u4_l01: [HM(...cfw(L0.u4_l01.slides[15].data.items[0].q)), READ(8, 30), S(NUMOF(0))], u4_l02: [S(2 * 5) + '분', READ(2, 20), HM(10, 35)], u4_l03: ['1분', READ(7, 22), HM(11, 43)],
    u4_l04: [BEFORE(8, 55), BEFORE(3, 50), FROMBEFORE(7, 5)], u4_l05: [S(60 / 60) + '시간', S(2 * 60) + '분', S(MIN(9, 0, 11, 0) / 60) + '바퀴'],
    u4_l06: [S(60 + 20) + '분', HMD(MIN(9, 0, 10, 10)), S(MIN(9, 30, 10, 40)) + '분'], u4_l07: [S(12 + 12) + '시간', AMPM(12).split(' ')[0], S(24 + (11 - 9)) + '시간'],
    u4_l08: ['7일', '12개월', (12 % 12 + 1) + '월'], u4_l09: [READ(4, 28), BEFORE(10, 50), AMPM(11 + 2)],
    u4_l10: [YMD(addMon(2022, 5, 12, 24)), S(14 / 7) + '주일', MD(addMon(2024, 5, 12, 2))]
  },
  adv: {
    u4_l01: S(NUMOF(30)), u4_l02: ADDM(8, 35, 10), u4_l03: S([1, 2, 3, 4].map(k => 35 + k).filter(m => m > 35 && m < 40).length), u4_l04: BEFORE(10, 55), u4_l05: S(MIN(3, 20, 8, 20) / 60),
    u4_l06: HMD(MIN(9, 10, 10, 20)), u4_l07: S(24 + (13 - 9)) + '시간', u4_l08: S(daysSpan([2026, 11, 20], [2026, 12, 2]) + 1), u4_l09: S(addDays(2026, 11, 14, -7)[2]), u4_l10: addMon(2025, 4, 22, 6)[1] + '월'
  }
};
/* 지도서 차시 이름 · 쪽 · 성취기준 */
const TITLE = { u4_l01: '시각과 시간', u4_l02: '몇 시 몇 분을 읽어 볼까요(1)', u4_l03: '몇 시 몇 분을 읽어 볼까요(2)', u4_l04: '여러 가지 방법으로 시각을 읽어 볼까요', u4_l05: '1시간을 알아볼까요', u4_l06: '걸린 시간을 알아볼까요', u4_l07: '하루의 시간을 알아볼까요', u4_l08: '달력을 알아볼까요', u4_l09: '수학이랑 확인해요', u4_l10: '수학이랑 만들어요' };
const PAGES = { u4_l01: '244~247', u4_l02: '248~249', u4_l03: '250~251', u4_l04: '252~253', u4_l05: '254~255', u4_l06: '256~257', u4_l07: '258~259', u4_l08: '260~263', u4_l09: '264~265', u4_l10: '266~267' };
const STDS = { 7: '[2수03-07] 시계를 보고 시각을 ‘몇 시 몇 분’까지 읽을 수 있다.', 8: '[2수03-08] 1시간과 1분의 관계를 이해하고, 시간을 ‘시간’, ‘분’으로 표현할 수 있다.', 9: '[2수03-09] 실생활 문제 상황과 연결하여 1분, 1시간, 1일, 1주일, 1개월, 1년 사이의 관계를 이해한다.' };
const STD_N = { 1: [7, 8, 9], 2: [7], 3: [7], 4: [7], 5: [8], 6: [8], 7: [9], 8: [9], 9: [7, 8, 9], 10: [9] }; // 지도서 240쪽 차시 표
/* 교과서 수 표 — 활동목록.md(지도서 236~267쪽 정독)의 차시별 교과서·익힘·확인해요 수·장면 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u4_l01: ['9와 10 사이', '9:30', '아침 8시', '11월', '일요일', '7시', '일곱 시', '8시 30분', '여덟 시 삼십 분', '2시', '3시 30분', '정해진 시각', '약속한 시각', '30분씩', '5씩 뛰어 세'],
  u4_l02: ['7시가 조금 지났네', '숫자 2', '7시 10분', '7과 8 사이', '1분', '7시 15분', '2시 20분', '두 시 이십 분', '7시 25분', '10:35', '열 시 삼십오 분', '8시 35분', '10시 40분', '12시 25분', '7시 3분', '2시 4분', '4시 2분', '5분 후', '10분 후'],
  u4_l03: ['2와 3 사이', '1시 10분', '3칸', '1시 13분', '7시 22분', '일곱 시 이십이 분', '3시 39분', '세 시 삼십구 분', '11:43', '열한 시 사십삼 분', '4명', '성공', '7시 20분', '7시 6분', '3과 4 사이', '3시 36분', '한 칸 덜', '거꾸로'],
  u4_l04: ['8:55', '곧 9시야', '5분 후', '9시 5분 전', '3시 50분', '4시 10분 전', '세 시 오십 분', '네 시 십 분 전', '5시 55분', '6시 5분 전', '7시 5분 전', '5시 10분 전', '7시 50분', '8시 10분 전', '10시 55분', '2시 50분', '3시 10분 전', '10시 5분 전', '1시 10분 전', '4시 5분 전', '9시 55분', '9시 11분', '다짐'],
  u4_l05: ['5시', '6시', '60분은 1시간', '10:30', '11:30', '시간 띠', '9:00', '11:00', '2시간', '120분', '한 바퀴', '90분', '40분', '1시 30분', '5시 30분', '4바퀴', '12칸'],
  u4_l06: ['9시', '10시 20분', '1시간 20분', '80분', '9:00', '10:10', '11:40', '1시간 10분', '70분', '2시간 40분', '160분', '안전 체험하기', '열매 줍기', '음식 만들어 먹기', '자연물로 작품 만들기', '110분', '240분', '9시 10분', '10시 30분', '11시 40분', '10시 40분', '12시'],
  u4_l07: ['잠', '아침 식사', '블록 놀이', '점심 식사', '박물관 관람', '저녁 식사', '독서', '24시간', '오전', '오후', '낮 12시', '밤 12시', '26시간', '2시간', '14시간', '낮 11시', '밤 11시', '12시간', '야영', '주말'],
  u4_l08: ['10월', '31일', '목요일', '11일', '17일', '1주일은 7일', '월요일과 수요일', '둘째 토요일', '2주일마다', '9일', '11월 14일', '11월 28일', '12월 12일', '28일', '12개월', '주먹', '365일', '12월 다음', '한 달, 두 달', '일 개월', '둘째 월요일', '11월 20일', '12월 2일'],
  u4_l09: ['11시 55분', '4시 28분', '12시 55분', '60분', '24시간', '7일', '12개월', '9시 5분 전', '8시 55분', '10시 50분', '11시 10분 전', '오전 11시', '오후 1시', '오후 13시', '오후 2시 20분', '오후 3시 30분', '70분', '11월 14일', '11월 7일', '11월 24일', '화요일', '23일'],
  u4_l10: ['2022년 5월 12일', '2024년 5월 12일', '2024년 7월 12일', '2024년 7월 26일', '세발자전거', '줄넘기', '두발자전거', '혼자서 수영', '2년 후', '2개월 후', '2주 후', '2024년 12월 1일', '12월 22일', '2025년 4월 22일', '2026년 4월 22일', '6개월 후', '3주 후', '디데이']
};
/* 옛 보탬 표 TB(archive/neutral/gen_g2s2_math_u4.js) 22줄 — 각 줄의 핵심 수·낱말이 본류 장(extras 아님)에 있어야 한다 */
const TBA = {
  u4_l01: [['건강 공원 — 운동을 얼마 동안 했을까', ['9와 10 사이', '9:30', '아침 8시', '11월', '7시', '8시 30분', '3시 30분', '2시']], ['단원 실천 활동 — 건강한 생활을 해요', ['정해진 시각', '약속한 시각', '30분씩', '10월 28일', '5씩 뛰어 세']]],
  u4_l02: [['지아가 일어난 시각', ['7과 8 사이', '숫자 2', '7시 10분', '1분', '5분', '15분', '7시 15분', '5단 곱셈구구']], ['쓰고 읽기 · 학교에서 한 일', ['두 시 이십 분', '일곱 시 이십오 분', '열 시 삼십오 분', '8시 35분', '10시 40분', '12시 25분', '5분 후', '10분 후']], ['연우가 잘못 읽은 시각', ['7시 3분', '7시 15분', '2시 4분', '4시 2분']]],
  u4_l03: [['두 사람이 본 시계 — 1~4 넣기', ['3과 4 사이', '7에서 작은 눈금', '3시 36분', '3시 39분', '한 칸 덜']], ['7시 22분 오답 살피기', ['7시 22분', '7시 20분', '7시 6분', '분만 바꾸']]],
  u4_l04: [['곧 9시야 — 8:55', ['8:55', '곧 9시야', '5분 후', '9시 5분 전', '9시 55분', '9시 11분', '10분 전']], ['서둘러야지 이야기', ['7시 50분', '8시 10분 전', '10시 55분', '2시 50분', '3시 10분 전', '7시 5분 전', '5시 10분 전', '6시 55분']], ['벌써 ○시인가? 아니야!', ['10시 5분 전', '1시 10분 전', '4시 5분 전', '다짐 문장']]],
  u4_l05: [['공연 9:00~11:00과 수업 40분', ['9:00', '11:00', '몇 바퀴', '120분', '40분', '90분']], ['원형 시계에 시간 띠 두르기', ['시간 띠', '12칸', '둘레', '1시 30분', '5시 30분', '4바퀴']]],
  u4_l06: [['기차 시간 — 서울 9:00 · 대전 10:10 · 부산 11:40', ['9:00', '10:10', '11:40', '70분', '160분', '1시간 30분', '110분', '240분']], ['출발이 9시 10분이었다면', ['9시 10분', '1시간 10분', '10:40', '12:00', '10시 30분', '11시 40분', '80분']]],
  u4_l07: [['교과서 계획표 칸 그대로 — 세미의 하루', ['잠', '아침 식사', '블록 놀이', '점심 식사', '박물관 관람', '저녁 식사', '독서', '24시간']], ['여행 26시간 오답과 야영 27시간', ['26시간', '2시간', '14시간', '야영', '27']], ['나의 주말 생활 계획표', ['주말', '토요일', '일요일', '낮 11시', '밤 11시']]],
  u4_l08: [['1년 달력 — 생일과 달의 날수', ['생일', '31일', '28일', '주먹', '365일', '12월 다음']], ['달과 개월 읽기 · 어디서 시작해도 1년', ['한 달, 두 달', '일 개월, 이 개월', '3월', '목요일부터 다음 주 수요일']], ['학예회와 전시회', ['11월 1일', '둘째 월요일', '13', '11월 20일', '12월 2일', '며칠인가요', '모두 며칠']]],
  u4_l09: [['확인해요 4·5번과 오답 유형', ['오전 11시', '오후 1시', '오후 13시', '70분', '11월 7일', '24일', '화요일', '23일', '1시간', '1일']], ['수학익힘 68 — 생활 계획표와 자기 평가', ['생활 계획표', '다짐', '시계를 보고 시각을 읽을 수 있나요', '걸린 시간을 구할 수 있나요', '규칙적인 생활을 할 수 있나요']]]
};
/* 틀린 생각 — 틀린 값은 정말 틀리고, 바른 생각에 셈 값이 있다 */
const WRONG = { u4_l01: ['10시', HM(9, 30)], u4_l02: ['2시 4분', HM(2, 20)], u4_l03: ['7시 20분', HM(7, 22)], u4_l04: ['9시 55분', BEFORE(8, 55)], u4_l05: ['90분', MIN(10, 30, 11, 30) + '분'],
  u4_l06: ['110분', (60 + 10) + '분'], u4_l07: ['14시간', (24 + 2) + '시간'], u4_l08: ['일요일부터 토요일까지', '7일'], u4_l09: ['오후 13시', AMPM(13)], u4_l10: ['7월 14일', MD(addDays(2024, 7, 12, 14))] };
const FIRST = [[/분 전/, 4, '분 전'], [/60분/, 5, '60분'], [/1시간/, 5, '1시간'], [/시간 띠/, 5, '시간 띠'], [/\d시간 \d+분/, 6, '○시간 ○분'], [/오전/, 7, '오전'], [/오후/, 7, '오후'], [/24시간/, 7, '24시간'], [/1주일/, 8, '1주일'], [/개월/, 8, '개월']];
const NAMES = ['지아', '세미', '슬기', '연우', '경민', '다현', '재이', '수찬'];

/* ── 검사 함수 (역검증에서 망가뜨린 사본에도 다시 쓴다) ── */
function want(d, exp) {
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
}
function checkAnswers(Ls, k) { let n = 0; const sl = Ls[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } n++; });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === EXP.lev[k][i], t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]).indexOf(nsp(lv[t].a)) >= 0, t + ' 풀이 단계·끝'); n++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === EXP.exit[k][i], '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); n++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++;
  return n; }
function checkLineage(Ls, k, i) { const rv = Ls[k].slides[1].data;
  if (!i) { const pe = PREV[PREV_LAST].slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g2s2_math:' + PREV_LAST && SAME(rv.items.map(x => [x.q, x.a]), pe.map(x => [x.q, x.a])), 'l01 복습 = 3단원 ' + PREV_LAST + ' 출구'); ok(/지난 단원/.test(rv.title) && /3단원/.test(rv.content) && /길이 재기/.test(rv.content), 'l01 복습 글'); return; }
  const ex = Ls[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }
const dataStrings = (Ls, k, opt) => { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (opt && opt.skip && opt.skip[x]) return; walk(o[x], where + '.' + x); }); })(opt && opt.slidesOnly ? Ls[k].slides : Ls[k], k); return out; };
const teach = (Ls, k) => JSON.stringify(Ls[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(Ls[k].extras);
function checkFirst(Ls) { KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([re, n, nm]) => { if (i + 1 < n) ok(!re.test(teach(Ls, k)), k + ' 선행 「' + nm + '」'); }); }); }
function checkExtras(Ls, k) { const ex = Ls[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복'); ok(!ids.some(x => /^b_l/.test(x)) && !ex.some(e => e.type === 'other_activity'), '보탬 카드(b_ · other_activity) 남음');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  Ls[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }
/* 읽는 말 전수 — 「2시 20분은 두 시 이십 분」「10시 35분, 열 시 삼십오 분」 · 「… 분 또는 … 분 전」 꼴을 모두 찾아 게이트 읽기와 대조 */
const HKR = '(?:열한|열두|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)', MKR = '[일이삼사오육칠팔구십]+';
const READ_RE = new RegExp('(\\d{1,2})시(?: (\\d{1,2})분)?(?:은|는|,)? 「?(' + HKR + ' 시(?: ' + MKR + ' 분)?)(?! 전)', 'g');
const READB_RE = new RegExp('(' + HKR + ') 시 (' + MKR + ') 분 또는 (' + HKR + ' 시 ' + MKR + ' 분 전)', 'g');
const KH = (s) => HK.indexOf(s), KM = (s) => { let v = 0; const t = s.split('십'); if (t.length === 2) v = (t[0] ? DG.indexOf(t[0]) : 1) * 10 + (t[1] ? DG.indexOf(t[1]) : 0); else v = DG.indexOf(s); return v; };
function readingsOf(Ls) { const out = []; KEYS.forEach(k => dataStrings(Ls, k, { slidesOnly: true, skip: { options: 1, fig: 1, wrong: 1, watch: 1 } }).forEach(([s0, where]) => { const s = clean(s0); let m; READ_RE.lastIndex = 0; while ((m = READ_RE.exec(s))) out.push(['r', READ(+m[1], +(m[2] || 0)), m[3], where]); READB_RE.lastIndex = 0; while ((m = READB_RE.exec(s))) out.push(['b', READB(KH(m[1]), KM(m[2])), m[3], where]); })); return out; }
function checkReadings(Ls) { const r = readingsOf(Ls); const bad = r.filter(([, want0, got]) => want0 !== got); ok(!bad.length, bad.map(([, a, b, w0]) => w0 + ' 「' + b + '」(게이트 ' + a + ')').slice(0, 4).join(' | ')); return r.length; }
/* 조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요 (마지막 숫자의 읽는 소리 받침) */
function finalOf(wd) { const d = +String(wd).slice(-1); return d === 0 ? 1 : [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; const t = String(s).replace(/\*\*/g, ''); const re = /(?<![\d,])(\d+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g; let m; while ((m = re.exec(t))) { const f = finalOf(m[1]); if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
function checkJosa(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { skip: { options: 1, fig: 1, url: 1, id: 1, img: 1, live_url: 1, source: 1, std: 1 } }).forEach(([s, wh]) => josa(s).forEach(b => bad.push(wh + ' 「' + b + '」'))); }); ok(!bad.length, bad.slice(0, 5).join(' | ')); }

console.log('═══ A. 로드 ═══');
T('10차시 키 u4_l01~l10 · 파일 data/g2s2_math_u4.js', () => ok(SAME(Object.keys(L0).sort(), KEYS), Object.keys(L0).join(',')));
T('meta: 2학년 2학기 수학 · 4단원 시각과 시간 · 성취기준 지도서 문구(240쪽 차시 표대로) · 40분 · 지도서 쪽 · theme · live_url 원문 실재 · n', () => KEYS.forEach((k, i) => { const m = L0[k].meta; ok(m.grade === 2 && m.term === 2 && m.unit === 4 && m.subject === '수학' && m.unit_title === '시각과 시간' && m.n === i + 1, k); ok(m.std === STD_N[i + 1].map(x => STDS[x]).join(' · '), k + ' 성취기준 ' + m.std); ok(!/임시/.test(m.std), k + ' 임시'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 4단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(m.theme === '곰이·펭이 시각과 시간 공원', k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 400분', () => { KEYS.forEach(k => ok(L0[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L0[k].meta.title)); ok(KEYS.reduce((a, k) => a + L0[k].meta.duration_min, 0) === 400, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math · 2학년 = tier-mid', () => { ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 clk1·dclk2·tbnd2·kcal2·d24·upr2·grow2·ngrid·dtb·tools·jump 등록 · 렌더 깨짐 0', () => { [{ k: 'clk1', h: 7, m: 10 }, { k: 'dclk2', h: 10, m: 35 }, { k: 'tbnd2', h0: 9, h1: 11, step: 10, on: [540], from: [9, 0], to: [9, 10] }, { k: 'kcal2', y: 2026, m: 11, first: 0, days: 30 }, { k: 'd24', segs: [[0, 24]], cols: ['#eee'], legs: [] }, { k: 'upr2', items: [['1시간', '60분']] }, { k: 'grow2', nodes: [{ date: 'a', label: 'b' }], legs: [] }, { k: 'ngrid', rows: [['1', '2']] }, { k: 'dtb', head: ['a', 'b'], rows: [['1', '2']] }, { k: 'tools', items: [{ emoji: '📖', name: 'a', kind: 'b' }] }, { k: 'jump', start: 5, step: 5, n: 4 }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined/.test(h), f.k); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L0[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 190장 (10 × 19)', () => ok(KEYS.reduce((a, k) => a + L0[k].slides.length, 0) === 190, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선 + 실사 자리) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 곰이·펭이', () => { const sl = L0[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); const mo = sl[2].data;
  ok(mo.kids && mo.kids.length === 2 && mo.kids[0].face === '🐻' && /^곰이\n"/.test(mo.kids[0].label) && mo.kids[1].face === '🐧' && /^펭이\n"/.test(mo.kids[1].label) && mo.question, '③장면·물음 + 곰이·펭이');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 10종 서로 다름 · 다른 덱(data 전체)과 겹침 0', () => { const im = KEYS.map(k => L0[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); const other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g\d(s\d)?_[a-z]+_u\d+\.js$/.test(f) && f !== 'g2s2_math_u4.js').forEach(f => { try { Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => { if (s.data && s.data.img) other.push(s.data.img); })); } catch (e) { /* 다른 꼴 파일 */ } }); ok(other.length >= 300, '다른 덱 실사 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침 ' + im.filter(x => other.indexOf(x) >= 0)); });
T('활동 장 넘침 미리 피하기 — goal ≤ 45자 · steps 각 ≤ 45자 · 기본 문제 tools 카드 ≤ 3 · ngrid 한 줄 ≤ 7칸', () => KEYS.forEach(k => { const sl = L0[k].slides, a = sl[12].data; ok(a.goal.length <= 45, k + ' goal ' + a.goal.length); a.steps.forEach(x => ok(x.length <= 45, k + ' step ' + x.length + ' ' + x)); sl.forEach(s => { const f = s.data.fig; if (!f) return; const fl = f.k === 'panels' ? f.items.map(p => p.fig) : [f]; fl.forEach(g => { if (g.k === 'tools') ok(g.items.length <= 3, k + ' ' + s.id + ' 카드 ' + g.items.length); if (g.k === 'ngrid') g.rows.forEach(r => ok(r.length <= 7, k + ' ' + s.id + ' ngrid ' + r.length)); }); }); }));

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '3단원 마지막 ' + PREV_LAST + ' 출구(동적)'), () => checkLineage(L0, k, i)));
T('마지막 차시 「다음 단원엔」 = 표와 그래프 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L0.u4_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /표와 그래프/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L0[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });
T('5단원 이음 — g2s2_math_u5 u5_l01 복습 = 이 단원 u4_l10 출구(그 생성기가 vm 으로 읽음)', () => { const U5 = load(path.join(TDIR, 'data/g2s2_math_u5.js')); const rv = U5.u5_l01.slides[1].data; ok(rv.from === 'g2s2_math:u4_l10', 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L0.u4_l10.slides[15].data.items.map(x => [x.q, x.a])), 'u5_l01 복습이 옛 출구 — gen_g2s2_math_u5 다시 돌릴 것'); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { nCheck += checkAnswers(L0, k); }));
T('다시 셈한 정답 = 90', () => ok(nCheck === 90, nCheck));
T('셈기 자체 확인 — 바늘 말 · 몇 분 전 · 걸린 시간 · 읽는 말 · 요일 · 몇째 요일 · 개월 넘김 · 틀린 답 잡음', () => {
  ok(SAME(cfw('짧은바늘은 3과 4 사이, 긴바늘은 7에서 작은 눈금 4칸만큼 더 간 곳'), [3, 39]) && SAME(cfw('짧은바늘이 2, 긴바늘이 12를'), [2, 0]) && minOf('긴바늘이 숫자 9에서 작은 눈금 1칸 덜') === 44, '바늘 말');
  ok(BEFORE(8, 55) === '9시 5분 전' && BEFORE(12, 50) === '1시 10분 전' && FROMBEFORE(1, 10) === '12시 50분' && throws(() => BEFORE(3, 47)), '몇 분 전(5·10분만)');
  ok(HMD(MIN(10, 40, 12, 0)) === '1시간 20분' && MIN(9, 30, 10, 40) === 70 && ADDM(12, 55, 10) === '1시 5분', '걸린 시간');
  ok(READ(11, 43) === '열한 시 사십삼 분' && READ(7, 0) === '일곱 시' && READ(2, 20) === '두 시 이십 분' && READB(5, 55) === '여섯 시 오 분 전' && READ(3, 39) === '세 시 삼십구 분', '읽는 말');
  ok(dow(2026, 11, 1) === 0 && dow(2026, 10, 1) === 4 && dow(2023, 11, 1) === 3 && dow(2024, 7, 1) === 1 && MUSIC === 9 && nthDow(2026, 11, 6, 2) === 14 && nthDow(2026, 11, 6, 4) === 28, '요일');
  ok(YMD(addMon(2024, 12, 22, 4)) === '2025년 4월 22일' && MD(addDays(2026, 11, 28, 14)) === '12월 12일' && daysSpan([2026, 11, 20], [2026, 12, 2]) + 1 === 13, '날짜');
  let c = 0; [() => want({ options: [{ text: '9시 55분', correct: true }, { text: '9시 5분 전' }] }, BEFORE(8, 55)), () => want({ input: 'count_input', answer: 23, note: '**23**' }, S(addDays(2026, 11, 14, 10)[2])), () => want({ options: [{ text: '오후 13시', correct: true }] }, AMPM(13))].forEach(f => { if (throws(f)) c++; }); ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 · 시각 사슬 ═══');
const EQ = /\d[\d \t+\-−×]*=[\d \t+\-−×=]*\d/g;
function evI(e) { const t = String(e).replace(/[−]/g, '-').replace(/×/g, '*').replace(/\s+/g, ''); ok(/^[\d+\-*]+$/.test(t), '식 글자 ' + e); return t.split(/(?=[+-])/).reduce((a, term) => { const sg = term[0] === '-' ? -1 : 1; const v = term.replace(/^[+-]/, '').split('*').reduce((p, x) => p * +x, 1); return a + sg * v; }, 0); }
const chainOK = (e) => { const p = String(e).split('=').map(x => x.trim()).filter(Boolean); const v = p.map(evI); return v.every(x => x === v[0]); };
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const t = m[0].trim(); if (!/[+\-−×]/.test(t)) continue; nEq++; try { if (!chainOK(t)) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」'); } } }
KEYS.forEach(k => dataStrings(L0, k, { slidesOnly: true, skip: { fig: 1 } }).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); }));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 6', () => ok(!badEq.length && nEq >= 6, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
/* 시각 사슬 — 「2시 10분 → 3시 10분 1시간」「오전 10시 → 낮 12시 2시간」의 걸린 시간을 다시 셈 */
const CH_RE = /(?:(오전|오후|낮|밤) )?(\d{1,2})시(?: (\d{1,2})분)? → (?:(오전|오후|낮|밤) )?(\d{1,2})시(?: (\d{1,2})분)? (\d+)(시간|분)/g;
const to24 = (p, h) => (p === '오후' || p === '밤' ? (h % 12) + 12 : p === '낮' ? 12 : h % 12);
function chains(Ls) { let n = 0; const bad = []; KEYS.forEach(k => dataStrings(Ls, k, { slidesOnly: true, skip: { fig: 1, wrong: 1, watch: 1 } }).forEach(([s0, where]) => { const s = clean(s0); let m; CH_RE.lastIndex = 0; while ((m = CH_RE.exec(s))) { n++; const a = to24(m[1], +m[2]) * 60 + +(m[3] || 0), b = to24(m[4], +m[5]) * 60 + +(m[6] || 0); let d = b - a; if (d <= 0) d += (m[1] || m[4]) ? 1440 : 720; const want0 = +m[7] * (m[8] === '시간' ? 60 : 1); if (d !== want0) bad.push(where + ' 「' + m[0] + '」 = ' + d + '분'); } })); ok(!bad.length, bad.slice(0, 4).join(' | ')); return n; }
let nCh = 0;
T('풀이의 시각 사슬 「A → B 걸린 시간」 다시 셈 · ≥ 8', () => { nCh = chains(L0); ok(nCh >= 8, '사슬 ' + nCh); });
T('틀린 생각은 정말 틀림 — 틀린 값 ≠ 셈 · 바른 생각에 셈 값', () => KEYS.forEach(k => { const d = L0[k].slides[7].data, [bad, good] = WRONG[k]; ok(clean(d.wrong).indexOf(bad) >= 0, k + ' 틀린 생각에 「' + bad + '」 없음'); ok(clean(d.right).indexOf(good) >= 0, k + ' 바른 생각에 「' + good + '」 없음'); ok(bad !== good, k + ' 틀린 값 = 셈'); }));
T('식·사슬 검산기 자체 확인(틀린 식·틀린 사슬 잡음)', () => { const b0 = badEq.length; ['5 × 7 = 30', '1 + 3 + 1 + 5 + 1 + 3 + 10 = 23'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 2, '틀린 식 못 잡음'); badEq.length = b0;
  const B = clone(L0); B.u4_l06.slides[11].data.levels.기본.steps[1] = '3시 10분 → 3시 30분 30분'; ok(throws(() => chains(B)), '틀린 사슬 못 잡음'); const C2 = clone(L0); C2.u4_l07.slides[11].data.levels.도전.steps[0] = '오전 10시 → 낮 12시 3시간'; ok(throws(() => chains(C2)), '오전·낮 사슬 못 잡음'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s, k]); }));
const flat = (f) => (f.k === 'panels' ? f.items.flatMap(p => flat(p.fig || p)) : [f]);
const nG = { clk1: 0, clkq: 0, dclk2: 0, tbnd2: 0, kcal2: 0, d24: 0, upr2: 0, grow2: 0, ngrid: 0, dtb: 0, tools: 0, jump: 0, ask: 0 };
const timeIn = (tx, h, m) => tx.indexOf(HM(h, m)) >= 0 || tx.indexOf(DIGI(h, m)) >= 0;
function checkFig(w0, f, prob, tx, s) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h), T0 = d.body.textContent; const q = s && s.data.question ? clean(s.data.question) : '';
  if (f.k === 'clk1') { nG.clk1++; const sv = d.querySelector('.fig-clk1'); ok(+sv.getAttribute('data-h') === f.h && +sv.getAttribute('data-m') === f.m, w0 + ' 시계 값'); ok(Math.abs(+sv.getAttribute('data-md') - f.m * 6) < 0.01 && Math.abs(+sv.getAttribute('data-hd') - ((f.h % 12) * 30 + f.m * 0.5)) < 0.01, w0 + ' 바늘 각도');
    const hands = f.hands == null ? 'hm' : f.hands, tag = f.tag || '';
    const isT = /^\d+시( \d+분)?( 전)?$/.test(tag); // 시각 꼴 이름표만 셈과 대조(「1시간 뒤」·「어제 오전」은 이름)
    if (isT) ok(tag === HM(f.h, f.m) || (f.m >= 50 && tag === BEFORE(f.h, f.m)), w0 + ' 이름표 ' + tag + ' ≠ 시계 ' + HM(f.h, f.m));
    if (prob) { if (/짧은바늘[이은] \d/.test(q)) { const c = cfw(q); ok(c[0] === f.h && (hands === 'h' || c[1] === f.m), w0 + ' 문제 시계 ' + HM(f.h, f.m) + ' ≠ 물음 말 ' + HM(c[0], c[1])); nG.clkq++; } else if (minOf(q) != null) { ok(hands === 'm' && f.m === minOf(q), w0 + ' 긴바늘만 그린 시계 ≠ 물음 말'); nG.clkq++; } else if (hands !== '' && /\d+시/.test(q)) { ok(timeIn(q, f.h, f.m) || hands !== 'hm' || /멈/.test(tag), w0 + ' 문제 시계가 물음에 없음'); } return []; }
    if (hands === 'h') ok(new RegExp(f.h + '[과와] ' + NEXTH(f.h) + ' 사이').test(tx), w0 + ' 짧은바늘만 — 글에 두 숫자 사이 없음'); else if (!isT || tag === HM(f.h, f.m)) ok(timeIn(tx, f.h, f.m), w0 + ' 시계 ' + HM(f.h, f.m) + ' 이 글에 없음');
    return []; }
  if (f.k === 'dclk2') { nG.dclk2++; ok(d.querySelector('.fig-dclk2').getAttribute('data-t') === (f.pre ? f.pre + ' ' : '') + DIGI(f.h, f.m), w0 + ' 디지털'); ok(timeIn(prob ? q : tx, f.h, f.m), w0 + ' 디지털 ' + DIGI(f.h, f.m) + ' 이 글에 없음'); return []; }
  if (f.k === 'tbnd2') { nG.tbnd2++; const fr = f.from[0] * 60 + f.from[1], to = f.to[0] * 60 + f.to[1], el = to - fr; ok(el > 0 && fr >= f.h0 * 60 && to <= f.h1 * 60, w0 + ' 띠 범위');
    if (prob) { ok(!f.on.length, w0 + ' 문제 띠에 색칠(답)'); ok(timeIn(q, f.from[0], f.from[1]) && timeIn(q, f.to[0], f.to[1]), w0 + ' 문제 띠 시각'); return []; }
    ok(f.on.length * f.step === el && f.on.every((t, i) => t === fr + i * f.step), w0 + ' 켠 칸 ≠ 걸린 시간 ' + el); ok(d.querySelector('.fig-tbnd2').getAttribute('data-band').split('|')[2] === String(el), w0 + ' data-band');
    ok(tx.indexOf(el + '분') >= 0 || tx.indexOf(HMD(el)) >= 0, w0 + ' 띠 걸린 시간 ' + el + '분 이 글에 없음'); ok(tx.indexOf(f.on.length + '칸') >= 0 || tx.indexOf('한 바퀴') >= 0, w0 + ' 칸 수 글'); return []; }
  if (f.k === 'kcal2') { nG.kcal2++; ok(f.first === dow(f.y, f.m, 1), w0 + ' ' + f.y + '년 ' + f.m + '월 1일 요일 ' + WD[f.first] + ' ≠ 달력 ' + WD[dow(f.y, f.m, 1)]); ok(f.days === dim(f.y, f.m), w0 + ' 날수'); const up = f.upto || f.days; (f.ring || []).forEach(x => ok(x <= up, w0 + ' 동그라미 ' + x));
    ok(d.querySelector('.fig-kcal2').getAttribute('data-cal').indexOf([f.y, f.m, f.first, f.days, up].join('|')) === 0, w0 + ' data-cal');
    if (f.marks) { const mus = Object.keys(f.marks).filter(x => f.marks[x] === '🪢').map(Number); if (mus.length) { ok(mus.length === MUSIC && mus.every(x => [1, 3].indexOf(dow(f.y, f.m, x)) >= 0), w0 + ' 줄넘기 표시 = 월·수'); ok(tx.indexOf('모두 ' + MUSIC + '일') >= 0, w0 + ' 줄넘기 날수 글'); const hk = Object.keys(f.marks).filter(x => f.marks[x] === '⛰️').map(Number); ok(SAME(hk, [nthDow(f.y, f.m, 6, 2), nthDow(f.y, f.m, 6, 4)]), w0 + ' 등산 = 둘째·넷째 토요일'); } }
    if ((f.ring || []).length === 7) ok(f.ring.map(x => dow(f.y, f.m, x)).join() === '0,1,2,3,4,5,6', w0 + ' 1주일 동그라미 일~토'); return []; }
  if (f.k === 'd24') { nG.d24++; let t = 0; const per = {}; f.segs.forEach((g, i) => { ok(g[0] === t, w0 + ' 띠 이어짐'); t = g[1]; const nm = f.legs.find(l => l.col === f.cols[i]).name; per[nm] = (per[nm] || 0) + g[1] - g[0]; }); ok(t === 24, w0 + ' 24칸');
    ok(per['잠'] === SEMI['잠'] && per['블록 놀이'] === SEMI['블록 놀이'] && per['박물관 관람'] === SEMI['박물관 관람'] && per['독서'] === SEMI['독서'] && per['식사'] === SEMI['아침 식사'] + SEMI['점심 식사'] + SEMI['저녁 식사'], w0 + ' 하루 띠 ≠ 계획표 ' + JSON.stringify(per)); return []; }
  if (f.k === 'upr2') { nG.upr2++; f.items.forEach(([a, b]) => ok(UNIT[a] === b, w0 + ' 단위 짝 ' + a + '=' + b)); f.items.forEach(([a, b]) => ok(tx.indexOf(a + '은 ' + b) >= 0 || tx.indexOf(a + '는 ' + b) >= 0 || tx.indexOf(a + ' = ' + b) >= 0, w0 + ' 짝 글 ' + a)); return []; }
  if (f.k === 'grow2') { nG.grow2++; const out = []; f.legs.forEach((g, i) => { const A = ymdOf(f.nodes[i].date), B = ymdOf(f.nodes[i + 1] ? f.nodes[i + 1].date : ''); let v;
      if (A && B) { if (g.u === '년') { ok(A[1] === B[1] && A[2] === B[2], w0 + ' 년 후 — 월·일 같음'); v = B[0] - A[0]; } else if (g.u === '개월') { ok(A[2] === B[2], w0 + ' 개월 후 — 일 같음'); v = (B[0] - A[0]) * 12 + B[1] - A[1]; } else { const dd = daysSpan(A, B); ok(dd % 7 === 0, w0 + ' 주 후 — 7의 배수'); v = dd / 7; } }
      if (g.n === '?') { ok(v != null, w0 + ' 빈칸 날짜'); if (prob) out.push(S(v)); } else if (v != null) ok(v === +g.n, w0 + ' ' + f.nodes[i].date + ' → ' + f.nodes[i + 1].date + ' = ' + v + g.u + ' ≠ ' + g.n);
      else if (A && /□/.test(f.nodes[i + 1].date)) ok(q.indexOf(g.n + g.u) >= 0, w0 + ' 문제 화살표 = 물음'); });
    if (!prob) f.nodes.forEach(n => ok(tx.indexOf(n.date) >= 0 || tx.indexOf(n.date.replace(/^\d+년 /, '')) >= 0, w0 + ' 날짜 ' + n.date + ' 이 글에 없음')); return out; }
  if (f.k === 'ngrid') { nG.ngrid++; const rows = f.rows.map(r => r.map(c => (c && typeof c === 'object' ? (c.q ? '?' : String(c.v)) : String(c))));
    if (rows[0][0] === '숫자') { for (let r = 0; r < rows.length; r += 2) rows[r].slice(1).forEach((x, j) => ok(+rows[r + 1][j + 1] === (+x * 5) % 60, w0 + ' 숫자 ' + x + ' → 분')); }
    else if (rows[0][0] === '월') { for (let r = 0; r < rows.length; r += 2) rows[r].slice(1).forEach((x, j) => ok(+rows[r + 1][j + 1] === dim(2026, +x), w0 + ' ' + x + '월 날수')); }
    else if (rows[0][0] === '하는 일') { let sum = 0; for (let r = 0; r < rows.length; r += 2) rows[r].slice(1).forEach((x, j) => { if (!x) return; ok(+rows[r + 1][j + 1] === SEMI[x], w0 + ' ' + x + ' 시간'); sum += +rows[r + 1][j + 1]; }); ok(sum === 24, w0 + ' 합 24'); }
    else { ok(prob && rows[1].every(x => x === '?') && rows[0].every(x => UNIT[x]), w0 + ' 모르는 표'); } return []; }
  if (f.k === 'dtb') { nG.dtb++; const tm = (x) => { const r = String(x).match(/^(\d{1,2}):(\d{2})$/); return r ? [+r[1], +r[2]] : null; };
    if (f.head[0] === '시간') { let end = null; f.rows.forEach(r => { const p = r[0].split('~').map(tm); ok(p[0] && p[1], w0 + ' 시간 칸'); if (end) ok(SAME(end, p[0]), w0 + ' 시간표 이어짐'); end = p[1]; const nm = r[1]; const re = new RegExp(nm + '\\((\\d+:\\d+)~(\\d+:\\d+)\\)'); const mm = tx.match(re); if (mm) ok(mm[1] === r[0].split('~')[0] && mm[2] === r[0].split('~')[1], w0 + ' 글의 시각 ' + nm); }); }
    else f.rows.forEach(r => { const ts = r.slice(1).map(tm); ts.forEach((t, j) => ok(t, w0 + ' 시각 칸 ' + r[j + 1])); const src0 = prob ? q : tx;
      if (prob && ts.length === 2 && !ts.every(t => timeIn(q, t[0], t[1]))) ok(q.indexOf(r[0] + '는 ' + MIN(ts[0][0], ts[0][1], ts[1][0], ts[1][1]) + '분') >= 0, w0 + ' 표 ' + r[0] + ' 걸린 시간이 물음에 없음'); // 곰이 10:30~11:40 = 물음의 「곰이는 70분」
      else ts.forEach(t => ok(timeIn(src0, t[0], t[1]), w0 + ' 표 시각 ' + DIGI(t[0], t[1]) + ' 이 글에 없음')); }); return []; }
  if (f.k === 'tools') { nG.tools++; if (prob) return []; f.items.forEach(it => ok(tx.indexOf(it.name) >= 0, w0 + ' 카드 ' + it.name + ' 이 글에 없음')); return []; }
  if (f.k === 'jump') { nG.jump++; const seq = Array.from({ length: f.n }, (_, i) => f.start + f.step * i); ok(d.querySelector('.fig-jump').getAttribute('data-seq') === seq.join(','), w0 + ' 수열');
    if (prob) { ok(f.bare && !d.querySelector('.jp-key') && !/[+−]\d/.test(T0), w0 + ' 문제 그림에 뛰는 크기'); return (f.q || []).length === 1 ? [String(seq[f.q[0]])] : []; } ok(tx.indexOf(String(seq[0])) >= 0 || tx.indexOf(String(seq[seq.length - 1])) >= 0, w0 + ' 뛰어 세기 수 글에 없음'); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}
const ansOf = (d) => (d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer));
T('그림 ' + figs.length + '개 — 시계 바늘·이름표·디지털·시간 띠·달력 요일·날수·줄넘기·하루 띠·단위 짝·성장 이야기·표 = 게이트 셈·글', () => figs.forEach(([w0, f, b, s]) => { const prob = b === 'basic_problem'; const tx = slideText(s); const ws = flat(f).flatMap(g => checkFig(w0 + ' ' + g.k, g, prob, tx, s)); if (prob && ws.length) { nG.ask++; const A = ansOf(s.data); ok(ws.every(x => x === A), w0 + ' 그림 빈칸 값 ' + ws + ' ≠ 답 ' + A); } }));
/* 문제 그림 글자 — 시계는 숫자판(1~12)을 빼고 이름표만 */
const figText = (f) => flat(f).map(g => (g.k === 'clk1' ? (g.tag || '') : docOf(FIG.render(g).replace(/></g, '> <')).body.textContent)).join(' ');
T('문제 그림이 답을 보이지 않음 — 그림 글자(시계 숫자판 빼고)의 수 토막·글자에 정답 0(물음 글에 이미 있는 답 빼고)', () => figs.filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data, A = ansOf(d); if (nsp(d.question).indexOf(nsp(A)) >= 0) return; const txt = figText(f); if (/^\d+$/.test(A)) ok((txt.match(/\d+/g) || []).indexOf(A) < 0, w0 + ' 그림에 정답 ' + A); else ok(nsp(txt).indexOf(nsp(A)) < 0, w0 + ' 그림에 정답 ' + A); }));
T('개념 40장 · 기본 문제 30장 모두 그림 · 시계 ≥ 30 · 물음 말 시계 대조 ≥ 6 · 달력 ≥ 8 · 시간 띠 ≥ 4 · 빈칸 대조 ≥ 2', () => { let c = 0, p = 0; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 40 && p === 30, c + '/' + p); ok(nG.clk1 >= 30 && nG.clkq >= 6 && nG.kcal2 >= 8 && nG.tbnd2 >= 4 && nG.ask >= 2 && nG.dclk2 >= 10 && nG.grow2 >= 4, JSON.stringify(nG)); });
T('그림 검사기 자체 확인 — 시계 값·이름표·짧은바늘 글·띠 칸·달력 요일·하루 띠·단위 짝·성장 화살표 잡음', () => { let c = 0; const tr = (f, prob, tx, s) => { if (throws(() => checkFig('probe', f, prob, tx, s))) c++; };
  tr({ k: 'clk1', h: 7, m: 15 }, false, '7시 10분이에요');
  tr({ k: 'clk1', h: 3, m: 50, tag: '4시 5분 전' }, false, '3시 50분');
  tr({ k: 'clk1', h: 4, m: 35 }, true, '', { data: { question: '짧은바늘이 4와 5 사이, 긴바늘이 8을 가리켜요.' } });
  tr({ k: 'tbnd2', h0: 10, h1: 12, step: 10, on: [630, 640, 650, 660, 670], from: [10, 30], to: [11, 30] }, false, '60분 6칸');
  tr({ k: 'kcal2', y: 2026, m: 11, first: 1, days: 30 }, false, '');
  tr({ k: 'd24', segs: [[0, 7], [7, 9], [9, 24]], cols: ['#a', '#b', '#c'], legs: [{ col: '#a', name: '잠' }, { col: '#b', name: '식사' }, { col: '#c', name: '독서' }] }, false, '');
  tr({ k: 'upr2', items: [['1주일', '12개월']] }, false, '1주일은 12개월');
  tr({ k: 'grow2', nodes: [{ date: '2024년 7월 12일', label: 'a' }, { date: '2024년 7월 26일', label: 'b' }], legs: [{ n: 3, u: '주' }] }, false, '2024년 7월 12일 2024년 7월 26일');
  ok(c === 8, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 그림 = fig json · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k], F = FIGJ[k];
  L0[k].slides.filter(s => s.block === 'concept').forEach((s, i) => { ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'); ok(SAME(s.data.fig, F.slides[i]), s.id + ' 그림 명세'); });
  L0[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.fig, F.problems[i]), s.id + ' 그림 명세'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L0[k].slides[18].data; if (k !== 'u4_l10') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
T('개념 글 3~4줄 안팎(실렌더 그림 축소 피하기) — 차시마다 개념 글 줄 ≤ 4', () => KEYS.forEach(k => L0[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 4, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L0[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l04 「8:55」는 l02 에 · l10 「2022년 5월 12일」은 l08 에 없음)', () => { ok(nsp(JSON.stringify(L0.u4_l02)).indexOf('8:55') < 0, 'l02'); ok(nsp(JSON.stringify(L0.u4_l08)).indexOf('2022년5월12일') < 0, 'l08'); });
const TBA_N = Object.values(TBA).reduce((a, x) => a + x.length, 0);
T('보탬 흡수 대조 — 옛 TB ' + TBA_N + '줄(보관본에 실재)의 핵심 수·낱말이 그 차시 본류 장(extras 아님)에 · b_ id 0', () => { const old = fs.readFileSync(path.join(TDIR, 'archive/neutral/gen_g2s2_math_u4.js'), 'utf8'); ok(TBA_N === 22, 'TB 줄 ' + TBA_N); Object.keys(TBA).forEach(k => { const main = nsp(JSON.stringify(L0[k].slides)); TBA[k].forEach(([title, toks]) => { ok(old.indexOf("['" + title + "'") >= 0, '보관본에 TB 줄 없음 ' + title); const miss = toks.filter(t => main.indexOf(nsp(t)) < 0); ok(!miss.length, k + ' 「' + title + '」 본류에 없음 ' + miss.join(' / ')); }); }); ok(!/"id":"b_l/.test(fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u4.js'), 'utf8')), 'b_ id'); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L0[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); if (n) ok(e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 차시마다 file = g2_math_u4_lNN_….html · 원문 파일 실재(투영 지도)', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g2_math_u4_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade2/semester2/math/4단원_시각과시간', f)), k + ' 원문 없음'); }));
let nRead = 0;
T('읽는 말 전수 — 데이터 속 「시각 → 읽는 말」(몇 시 몇 분 · 몇 시 몇 분 전)이 게이트 읽기와 같음 · ≥ 10', () => { nRead = checkReadings(L0); ok(nRead >= 10, '읽는 말 ' + nRead); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 동기 장 mo2(곰이·펭이) · 1인 흐름 · 그림 섬', () => { const les = L0[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'motivate') ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), s.id + ' 동기 장 꼴 ' + r.cls);
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재 · 보탬 카드 0', () => checkExtras(L0, k)));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 사항 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L0[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L0[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~니?」「~는가?」 0 · 「」 속 말은 빼고) · 물음 속 「~다.」 0 (l01 되짚기는 3단원 덱 출구 그대로라 뺌)', () => { const qs = []; KEYS.forEach((k, i) => { const sl = L0[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(i ? sl[1].data.items : []).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q).replace(/「[^」]*」/g, '「」'); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 5단 곱셈구구 l02 · 가까운 숫자·분만 바꾸기 l03 · 5분 전·10분 전만 l04 · 같은 숫자 한 바퀴·도착 시각 90분 l05 · 1시간씩 먼저·따로 빼지 않기 l06 · 오후가 길지 않음·밤 12시 l07 · 며칠/모두 며칠·한 달/일 개월 l08 · 13시·23일 l09 · 주 단위 날수 l10 · 허용 l01', () => { const tx = (k) => JSON.stringify(L0[k]);
  ok(/5단 곱셈구구/.test(tx('u4_l02')), 'l02'); ok(/가까운 숫자/.test(tx('u4_l03')) && /분만 바꾸/.test(tx('u4_l03')), 'l03'); ok(/5분 전, 10분 전만/.test(tx('u4_l04')), 'l04'); ok(/같은 숫자에서 출발해 같은 숫자로/.test(tx('u4_l05')) && /90분/.test(L0.u4_l05.slides[7].data.wrong), 'l05');
  ok(/1시간씩 먼저/.test(tx('u4_l06')) && /따로 빼/.test(tx('u4_l06')), 'l06'); ok(/오후가 더 길지 않/.test(tx('u4_l07')) && /밤 12시/.test(tx('u4_l07')), 'l07'); ok(/「며칠인가요\?」와 「모두 며칠인가요\?」/.test(tx('u4_l08')) && /한 달, 두 달/.test(tx('u4_l08')) && /일 개월, 이 개월/.test(tx('u4_l08')), 'l08');
  ok(/13시는 시계에 없음|13시/.test(L0.u4_l09.slides[7].data.hint) && /23일/.test(L0.u4_l09.slides[7].data.hint), 'l09'); ok(/각 달의 날수/.test(tx('u4_l10')), 'l10'); ok(/허용적/.test(tx('u4_l01')), 'l01'); });

console.log('═══ L. 선행 용어 ═══');
T('처음 배우는 차시 전에는 그 말 0 (분 전 l04 · 60분·1시간·시간 띠 l05 · ○시간 ○분 l06 · 오전·오후·24시간 l07 · 1주일·개월 l08 — l01 단원 도입 예외)', () => checkFirst(L0));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([re, n, nm]) => ok(re.test(teach(L0, KEYS[n - 1])), nm + ' l' + String(n).padStart(2, '0'))));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 · 조사 ═══');
const noStd = (Ls) => JSON.stringify(KEYS.map(k => Object.assign({}, Ls[k], { meta: Object.assign({}, Ls[k].meta, { std: '' }) })));
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0(meta.std 지도서 문구만 예외) · 겹낫표 0 · 교과서 속 다른 인물 이름 0', () => { const all = noStd(L0); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].concat(NAMES).forEach(b => ok(all.indexOf(b) < 0, b)); ok(KEYS.every(k => !/결/.test(L0[k].meta.std) || /연결하여/.test(L0[k].meta.std)), 'std 예외는 「연결하여」뿐'); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면(렌더 글자)에 영어 코드(u4 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~D)만', () => KEYS.forEach(k => L0[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L0[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); const wds = (txt.match(/[A-Za-z]+/g) || []).filter(x => !/^[A-D]$/.test(x) && !(k === 'u4_l01' && s.block === 'review' && /^c?m$/.test(x))); /* l01 되짚기 = 3단원 출구(길이 단위 m·cm) 그대로 */ ok(!wds.length, k + ' ' + s.id + ' 영어 낱말 「' + wds.join(',') + '」'); }))));
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L0[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
T('조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요가 읽는 소리 받침에 맞음', () => checkJosa(L0));
T('조사 검사기 자체 확인', () => { ok(josa('10:35는').length === 0 && josa('11:43는').length === 1 && josa('7과 8').length === 0 && josa('9과 10').length === 1 && josa('8:55를').length === 0, '조사'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 잡는지 ═══');
const RED = [
  ['출구 답을 틀리게(l04 9시 5분 전 → 「9시 55분」)', (B) => { B.u4_l04.slides[15].data.items[0].a = '9시 55분'; }, (B) => checkAnswers(B, 'u4_l04')],
  ['선행 말을 앞 차시에(l02 개념에 「5분 전」)', (B) => { B.u4_l02.slides[4].data.content += ' 9시 5분 전'; }, (B) => checkFirst(B)],
  ['보탬 카드를 되살림(l03 extras 에 b_l3_1)', (B) => { B.u4_l03.extras[21] = { id: 'b_l3_1', type: 'other_activity', icon: '📗', title: '교과서 활동 — 7시 22분', content: '…', fit_slides: ['concept'] }; }, (B) => checkExtras(B, 'u4_l03')],
  ['읽는 말 틀림(l02 「두 시 이십 분」 → 「두 시 이 분」)', (B) => { B.u4_l02.slides[5].data.content = B.u4_l02.slides[5].data.content.replace('두 시 이십 분', '두 시 이 분'); }, (B) => checkReadings(B)],
  ['복습 계보를 끊음(l06 복습 첫 답)', (B) => { B.u4_l06.slides[1].data.items[0].a = '9시 50분'; }, (B) => checkLineage(B, 'u4_l06', 5)],
  ['문제 시계 바늘이 물음과 다름(l02 기본 ① 4시 35분 → 4시 40분)', (B) => { B.u4_l02.slides[8].data.fig.m = 40; }, (B) => checkFig('red', B.u4_l02.slides[8].data.fig, true, '', B.u4_l02.slides[8])],
  ['달력 요일 틀림(l08 10월 1일 목요일 → 수요일)', (B) => { B.u4_l08.slides[3].data.fig.first = 3; }, (B) => checkFig('red', B.u4_l08.slides[3].data.fig, false, slideText(B.u4_l08.slides[3]), B.u4_l08.slides[3])],
  ['조사 틀림(l02 「10:35는」 → 「10:35은」)', (B) => { B.u4_l02.slides[5].data.content = B.u4_l02.slides[5].data.content.replace('10:35**는', '10:35**은'); }, (B) => checkJosa(B)]
];
RED.forEach(([name, broke, chk]) => T('레드 — ' + name + ' → 잡힘 · 원본은 통과', () => { ok(!throws(() => chk(L0)), '원본이 걸림'); const B = clone(L0); broke(B); ok(throws(() => chk(B)), '못 잡음'); }));
T('역검증 8종', () => ok(RED.length >= 8, RED.length));

console.log('\n  (다시 셈: 정답 ' + nCheck + ' · 식 ' + nEq + ' · 시각 사슬 ' + nCh + ' · 읽는 말 ' + nRead + ' · 그림 ' + figs.length + ' · 역검증 ' + RED.length + '종)');
console.log('\n게이트 g2s2 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
