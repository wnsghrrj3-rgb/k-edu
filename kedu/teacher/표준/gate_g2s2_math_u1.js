/* gate_g2s2_math_u1.js — 2학년 2학기 수학 1단원 「네 자리 수」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 틀 + 지도서 직행 점검).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(bt4·pvt·jump·notes·ngrid·eqt·tools·dtb) · meta(2학년 2학기 · 1단원 · 성취기준 지도서 문구 [2수01-02] 1~5 · [2수01-03] 6~7 · 8·9 둘 다 · 40분 · 지도서 쪽 · theme·live_url) · slug g2s2_math
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 + 실사 자리 9종 서로 다름 · 다른 덱과 겹침 0)
   D 복습 계보(l01 = 1학기 마지막 g2_math u6_l09 출구 → l02 … l09 = 직전 출구) · l09 다음 단원 = 곱셈구구 · 2단원 u2_l01 복습 = 이 단원 l09 출구
   E 정답 다시 셈 — 게이트 자체 네 자리 수 셈기(모형 개수 → 수 · 자리 숫자·값 · 뛰어 세기 · 크기 비교 · □ 후보 · 읽는 말 · 세는 말)로 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 · 되짚기 3 = 84
   F 식 전수 — 글 속 「… = …」 사슬 다시 셈 · 풀이의 「a → b」 뛰는 크기 일정 · 틀린 생각은 정말 틀림(틀린 값 ≠ 셈 · 바른 생각에 셈 값)
   G 그림 — bt4 개수 = 글 · pvt 칸 = 글 · 풀어 쓴 식 합 · 읽는 말 = 게이트 읽기 · 비교 기호 = 게이트 셈 · jump 수열 · 수 배열표 가로·세로 간격 · 묶음 칸 합 · 돈 합계 · 식 카드 합 · 독도경비대 표 = 게이트 셈 · 문제 그림이 답을 보이지 않음
   H 재료 충실(개념·문제 = src) · 교과서 수 표(활동목록.md) · 보탬 흡수 대조(옛 TB 21줄의 핵심 수·낱말이 본류 장에 · b_ id 0) · 중복 · src 회수 키 · 읽는 말 전수(게이트 읽기 규칙)
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에
   L 선행(천의 자리·자릿값 카드 5 · 거꾸로 6 · 부등호 7 — 1차시 예외) · M 차단 어휘 · 「결」 0 · 겹낫표 0 · 인물(곰이·펭이만) · 영어 코드 0 · 9999까지 · 조사(수 뒤 은/는·이/가·을/를·과/와)
   R 역검증 레드 — 일부러 망가뜨린 사본(출구 답 · 선행 말 · 보탬 카드 · 읽는 말 · 복습 계보 · 10000 · 조사)을 위 검사가 잡는지 7종
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u1.js */
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
const L0 = load(path.join(TDIR, 'data/g2s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u1.json'), 'utf8'));
const FIGJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g2s2_math_u1.json'), 'utf8'));
const PREV = load(path.join(TDIR, 'data/g2_math_u6.js'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '네 자리 수', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const slideText = (s) => clean([s.data.title, s.data.content, s.data.question, s.data.scenario && s.data.scenario.body].filter(Boolean).join(' '));

/* ── 게이트 자체 네 자리 수 셈기 (부품·생성기와 따로 짬) ── */
const PL = ['일', '십', '백', '천'], PV = { 일: 1, 십: 10, 백: 100, 천: 1000 };
const P4 = (th, h, t, o) => th * 1000 + h * 100 + t * 10 + o;
const DG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
function RD(n) { ok(Number.isInteger(n) && n >= 0 && n <= 9999, '읽기 범위 ' + n); if (!n) return '영'; const d = String(n).padStart(4, '0').split('').map(Number); let s = ''; d.forEach((x, i) => { const u = ['천', '백', '십', ''][i]; if (!x) return; s += (x === 1 && u ? '' : DG[x]) + u; }); return s; }
const NT = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'], NO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
function COUNT(n) { const hi = n - n % 100, lo = n % 100; let s = hi ? RD(hi) : ''; if (lo === 20) return s + '스무'; return s + NT[Math.floor(lo / 10)] + NO[lo % 10]; } // 물건을 세는 말(장·개 앞)
const dig = (n, pl) => { const s = String(n), i = s.length - 1 - PL.indexOf(pl); ok(i >= 0, n + '에 ' + pl + '의 자리 없음'); return +s[i]; };
const val = (n, pl) => dig(n, pl) * PV[pl];
const placeOf = (n, d) => { const s = String(n), at = []; for (let i = 0; i < s.length; i++) if (+s[i] === d) at.push(PL[s.length - 1 - i]); ok(at.length === 1, n + '에서 ' + d + ' 자리 ' + at.length); return at[0] + '의 자리'; };
const NDIG = (n) => ['', '한', '두', '세', '네'][String(n).length] + ' 자리 수';
const CMP = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
const MAX = (...a) => String(Math.max(...a)), MIN = (...a) => String(Math.min(...a));
const CAND = (lhs, pat) => { const r = []; for (let d = 1; d <= 9; d++) if (lhs < +pat.replace('□', d)) r.push(d); return r.join(', '); }; // lhs < □···
const stepPlace = (step) => PL[String(step).length - 1] + '의 자리';
const MAXDIG = (ds) => ds.slice().sort((a, b) => b - a).join('');
function perm4(cards) { const out = new Set(); const go = (pre, rest) => { if (!rest.length) { out.add(pre); return; } rest.forEach((c, i) => go(pre + c, rest.filter((_, j) => j !== i))); }; go('', cards.map(String)); return [...out]; }
const PICK = (base, total, items) => { const hit = Object.keys(items).filter(k => base + items[k] === total); ok(hit.length === 1, 'PICK ' + hit); return hit[0] + '(' + items[hit[0]] + '원)'; };
function firstMonthOver(start, step, limit) { const M = ['9월', '10월', '11월', '12월', '1월', '2월']; let v = start; for (let i = 0; i < M.length; i++) { if (v > limit) return M[i]; v += step; } throw new Error('달 넘침'); }
const S = String;

const EXP = {
  basic: {
    u1_l01: [S(9 * 100), RD(P4(0, 4, 2, 5)), NDIG(1982)],
    u1_l02: [S(1000 - 8 * 100), S(1000 - (2 * 100 + 10 * 10)), S(900 + 100)],
    u1_l03: [S(2 * 1000 + 10 * 100), PICK(4000, 5000, { 지우개: 1000, 연필: 2000, 필통: 4000, 색연필: 3000 }), S((3000 - 2 * 1000) / 100)],
    u1_l04: [S(P4(2, 1, 0, 2)), RD(2102), S(3 * 1000 + 8 * 100 - 1700)],
    u1_l05: [S(val(5836, '십')), S(val(2595, '백')), S(3000 + 800 + 10 + 9)],
    u1_l06: [S(2167 + 2 * 1000), S(7869 - 4 * 100), S(1217 + 2 * 1000 + 3 * 100)],
    u1_l07: [CMP(4876, 1576), MAX(1422, 2046), CAND(4518, '□618')],
    u1_l08: [S(2360 + 3 * 1000), CAND(6419, '□518'), RD(3 * 1000)],
    u1_l09: [MAX(1982, 1999, 2005, 2010), S(val(1982, '천')), S([1982, 1999, 2005, 2010].filter(x => x > 1999).sort((a, b) => a - b)[0])]
  },
  lev: {
    u1_l01: [7 * 100 + '원', placeOf(607, 0)], u1_l02: [S(1000 - 5 * 100), S((1000 - 5 * 100) / 10)], u1_l03: [S(7 * 1000), S(9000 / 1000)],
    u1_l04: [S(P4(5, 2, 7, 4)), S(P4(6, 0, 8, 3))], u1_l05: [S(val(4627, '백')), S(val(7080, '천'))], u1_l06: [S(4250 + 3 * 100), S(6980 + 3 * 10)],
    u1_l07: [MAX(4381, 4318), MIN(8264, 8246, 8462)], u1_l08: [S(P4(2, 0, 6, 3)), S(5360 - 3 * 1000)], u1_l09: [S(dig(2005, '천')), MIN(1982, 1999)]
  },
  exit: {
    u1_l01: [placeOf(425, 5), S(val(3500, '백')), NDIG(1982)], u1_l02: [S(10 * 100), S(1000 - 900), RD(1000)], u1_l03: [S(4 * 1000), RD(8000), S(5000 / 1000)],
    u1_l04: [S(P4(1, 5, 3, 6)), RD(3258), COUNT(1536) + ' 장'], u1_l05: [S(val(5591, '백')), S(val(1297, '십')), S(5000 + 500 + 90 + 1)], u1_l06: [S(9996 + 3 * 1), S(9000 + 2 * 100), stepPlace(1000)],
    u1_l07: [MAX(6714, 6741), MIN(5107, 6714, 5400), stepPlace(1000)], u1_l08: [RD(5708), S(2360 + 2 * 1000), S(val(6653, '천'))], u1_l09: [S(val(1999, '백')), RD(2010), MIN(1982, 2005)]
  },
  adv: {
    u1_l01: S(1000 / 100), u1_l02: S(880 + 100 + 10 + 10), u1_l03: S(5 - 2), u1_l04: S(P4(2, 0, 8, 1)),
    u1_l05: S(perm4([0, 2, 5, 7]).filter(x => x[0] !== '0' && x[1] === '7').length), u1_l06: S(3517 + 2 * 1000), u1_l07: MAXDIG([4, 8, 7, 6]),
    u1_l08: firstMonthOver(2360, 1000, 6000), u1_l09: S([2180, 1982, 2005].sort((a, b) => b - a)[1])
  }
};
/* 지도서 차시 이름 · 쪽 · 성취기준 */
const TITLE = { u1_l01: '네 자리 수', u1_l02: '천을 알아볼까요', u1_l03: '몇천을 알아볼까요', u1_l04: '네 자리 수를 알아볼까요', u1_l05: '각 자리의 숫자는 얼마를 나타낼까요', u1_l06: '뛰어 세어 볼까요', u1_l07: '수의 크기를 비교해 볼까요', u1_l08: '수학이랑 확인해요', u1_l09: '수학이랑 만들어요' };
const PAGES = { u1_l01: '148~151', u1_l02: '152~153', u1_l03: '154~155', u1_l04: '156~157', u1_l05: '158~159', u1_l06: '160~161', u1_l07: '162~163', u1_l08: '164~165', u1_l09: '166~167' };
const STDS = { a: '[2수01-02] 일, 십, 백, 천의 자릿값과 위치적 기수법을 이해하고, 네 자리 이하의 수를 읽고 쓸 수 있다.', b: '[2수01-03] 네 자리 이하의 수의 범위에서 수의 계열을 이해하고, 수의 크기를 비교할 수 있다.' };
const STD_OF = (n) => (n <= 5 ? STDS.a : n <= 7 ? STDS.b : STDS.a + ' · ' + STDS.b);
/* 교과서 수 표 — 활동목록.md(지도서 140~167쪽 정독)의 차시별 교과서·익힘·확인해요 수·장면 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u1_l01: ['1982', '천연기념물', '케이블카', '7500원', '3500원', '1000원', '3000원', '100원짜리', '900원', '425명', '사백이십오', '5591명', '2180종', '2005년', '4900원', '십 모형 42개'],
  u1_l02: ['연날리기', '100개씩', '1000개', '100이 10개이면 1000', '900보다 100만큼 더 큰 수', '980', '880', '950', '1이 900개, 100이 1개이면 1000', '100이 9개, 10이 10개', '700', '200', '500'],
  u1_l03: ['태극기', '1개에 1000원', '4000', '사천', '6000원', '육천', '8000', '팔천', '3000', '5000', '오천', '1이 2000개', '5000은 1000이 3개, 10이 200개', '사인펜', '지우개', '고무찰흙'],
  u1_l04: ['손수건', '1536', '천오백삼십육', '천오백서른여섯 장', '1000보다 큽니다', '2000보다 작습니다', '4392', '사천삼백구십이', '3258', '삼천이백오십팔', '2051', '1700원', '2100', '2481', '광고지'],
  u1_l05: ['5591명', '5591 = 5000 + 500 + 90 + 1', '5836', '1297 = 1000 + 200 + 90 + 7', '3015', '2595', '3819', '9712', '2705, 2750, 5702, 5720', '8729', '2843', '팔칠이구'],
  u1_l06: ['9950, 9960', '9901', '9999', '9910', '9991', '2167', '7167', '7869', '7369', '1500, 2500, 3500, 4500, 5500', '1217', '3517', '5517', '거꾸로'],
  u1_l07: ['1422종', '2180종', '2015년', '2024년', '1422 < 2180', '2180은 1422보다 큽니다', '5107', '6714', '5400', '4518 < □618', '1점', '수의 크기가 같습니다', '2046', '6372', '6319', '4876', '1576'],
  u1_l08: ['3000', '삼천', '4352 = 4000 + 300 + 50 + 2', '4000300502', '5708', '오천칠백팔', '1596', '1408', '5732', '6653', '9907', '독도경비대', '2360원', '3360원', '4360원', '5360', '6419 < □518', '6, 7, 8, 9', '3500'],
  u1_l09: ['1982년', '1999년', '2005년', '2010년', '천연 보호 구역', '명예 주민증', '2180종', '편지', '천구백팔십이', '이천십']
};
/* 옛 보탬 표 TB(archive/neutral/gen_g2s2_math_u1.js) 21줄 — 각 줄의 핵심 수·낱말이 본류 장(extras 아님)에 있어야 한다 */
const TBA = {
  u1_l01: [['케이블카 요금 3500원', ['3500원', '7500원', '백의 자리 숫자 5', '500']], ['1000원 기념품과 100원짜리 동전', ['1000원', '100원짜리', '900원', '3000원']], ['1982는 몇 자리 수일까요?', ['1982', '세 자리 수', '네 자리 수']]],
  u1_l02: [['문장 만들기 — 1, 10, 100, 1000으로 천 말하기', ['1이 900개, 100이 1개이면 1000', '100이 9개, 10이 10개']], ['수 배열표에서 1000 찾기', ['900', '980', '880', '950', '10씩', '100씩']]],
  u1_l03: [['5000원으로 생일 선물 고르기', ['5000원', '사인펜', '지우개', '공책 1000원', '필통 4000원', '고무찰흙 2000원']], ['문장 만들기 — 몇천을 여러 가지로', ['1이 2000개', '5000은 1000이 3개, 10이 200개']]],
  u1_l04: [['모형이 나타내는 수 쓰고 읽기 — 4392 · 3258', ['4392', '사천삼백구십이', '3258', '삼천이백오십팔']], ['카드 두 장으로 손수건 수 어림하기', ['1000보다', '2000보다', '큽니다', '작습니다']], ['문장 만들기와 0의 뜻', ['2051', '백 모형을 모두 빼면']], ['마트 광고지에서 네 자리 수 찾기', ['광고지', '천 원짜리', '1원 단위']]],
  u1_l05: [['자릿값 카드 겹치기 — 1297', ['1297 = 1000 + 200 + 90 + 7', '3015', '몇백 카드']], ['숫자 순서 바꾸기 — 1297과 9712', ['9712', '90', '9000']], ['돌아가며 말하기 — 3819', ['3819', '돌아가며']], ['수 카드 0, 2, 5, 7', ['0, 2, 5, 7', '2705, 2750, 5702, 5720']], ['8729를 왜 「팔천칠백이십구」로 읽을까요?', ['8729', '팔칠이구', '칠백팔천이십구', '팔천칠백이십구']]],
  u1_l06: [['9901~9999 수 배열표 빈칸 채우기', ['9910', '9991', '9999', '10씩']], ['내 방법으로 뛰어 세기', ['1500, 2500, 3500, 4500, 5500', '내 방법']]],
  u1_l07: [['1422가 2046보다 작은 까닭', ['1422', '2046', '천의 자리부터']], ['수 카드 비교 놀이 규칙', ['두 묶음', '4장', '1점', '수의 크기가 같습니다', '작은 수']]],
  u1_l08: [['독도경비대 낱말 만들기', ['1596', '1408', '5732', '6653', '9907', '독도경비대']]]
};
/* 틀린 생각 — 틀린 값은 정말 틀리고, 바른 생각에 셈 값이 있다 */
const WRONG = { u1_l01: ['9100', '네 자리 수'], u1_l02: ['10000', S(10 * 100)], u1_l03: ['300', S(3 * 1000)], u1_l04: ['251', S(P4(2, 0, 5, 1))], u1_l05: ['팔칠이구', RD(8729)], u1_l06: ['7859', S(7869 - 100)], u1_l07: ['1422에는 4가 있으니', '1422 < 2046'], u1_l08: ['4000300502', S(4000 + 300 + 50 + 2)], u1_l09: ['클수록 오래전', '1982 → 1999 → 2005 → 2010'] };
const FIRST = [['천의 자리', 5], ['자릿값 카드', 5], ['거꾸로', 6], ['<', 7], ['>', 7]];

/* ── 검사 함수 (역검증에서 망가뜨린 사본에도 다시 쓴다) ── */
function want(d, exp) {
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
}
function checkAnswers(Ls, k) { let n = 0; const sl = Ls[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } n++; });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === EXP.lev[k][i], t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]).indexOf(nsp(lv[t].a).replace(/의자리$|원$/, '')) >= 0, t + ' 풀이 단계·끝'); n++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === EXP.exit[k][i], '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); n++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++;
  return n; }
function checkLineage(Ls, k, i) { const rv = Ls[k].slides[1].data;
  if (!i) { const pe = PREV.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g2_math:u6_l09' && SAME(rv.items.map(x => [x.q, x.a]), pe.map(x => [x.q, x.a])), 'l01 복습 = 1학기 u6_l09 출구'); ok(/1학기/.test(rv.title) && /곱셈/.test(rv.content) && /세 자리 수/.test(rv.content), 'l01 복습 글'); return; }
  const ex = Ls[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }
const dataStrings = (Ls, k, opt) => { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (opt && opt.skip && opt.skip[x]) return; walk(o[x], where + '.' + x); }); })(opt && opt.slidesOnly ? Ls[k].slides : Ls[k], k); return out; };
const teach = (Ls, k) => JSON.stringify(Ls[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(Ls[k].extras);
function checkFirst(Ls) { KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(Ls, k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }); }
function checkExtras(Ls, k) { const ex = Ls[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복'); ok(!ids.some(x => /^b_l/.test(x)) && !ex.some(e => e.type === 'other_activity'), '보탬 카드(b_ · other_activity) 남음');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  Ls[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }
/* 읽는 말 전수 — 「1536은 천오백삼십육이라고」「4392이고, 사천삼백구십이라고」「1982는 천구백팔십이,」 꼴을 모두 찾아 게이트 읽기와 대조 */
const READ_RE = /(\d{3,4})(?:은|는|이고,|,)?\s*「?([일이삼사오육칠팔구십백천]{2,}|천)(?=」|이라고|라고|,|\s*읽|예요|이에요|\s|$)/g;
function readingsOf(Ls) { const out = []; KEYS.forEach(k => dataStrings(Ls, k, { slidesOnly: true, skip: { options: 1, fig: 1, wrong: 1, watch: 1, hint: 1 } }).forEach(([s0, where]) => { const s = clean(s0); let m; READ_RE.lastIndex = 0; while ((m = READ_RE.exec(s))) out.push([+m[1], m[2], where]); })); return out; }
function checkReadings(Ls) { const r = readingsOf(Ls); const bad = r.filter(([n, ko]) => RD(n) !== ko && RD(n) !== ko.replace(/이$/, '')); /* 「구십이라고」 = 구십이+라고 · 「천이라고」 = 천+이라고 */ ok(!bad.length, bad.map(([n, ko, w0]) => w0 + ' ' + n + '→' + ko + '(게이트 ' + RD(n) + ')').slice(0, 4).join(' | ')); return r.length; }
/* 0을 읽은 잘못된 읽는 말(「삼백영십이」「오천칠백영팔」)은 틀린 생각·관찰·보기·오개념/팁 카드에만 */
const ZERO_RE = /[일이삼사오육칠팔구천백십]영[일이삼사오육칠팔구십백천영]|[일이삼사오육칠팔구]영영/;
function checkZeroRead(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { slidesOnly: true, skip: { options: 1, wrong: 1, watch: 1, hint: 1, fig: 1 } }).forEach(([s, wh]) => { if (ZERO_RE.test(s)) bad.push(wh + ' 「' + s.slice(0, 30) + '」'); }); Ls[k].extras.filter(e => e.type !== 'misconception' && e.type !== 'tip').forEach(e => { if (ZERO_RE.test(e.title + e.content)) bad.push(k + ' ' + e.id); }); }); ok(!bad.length, bad.slice(0, 4).join(' | ')); }
/* 9999까지 — 10000 이상의 수는 틀린 생각·관찰·오개념 카드에만(소리 나는 대로 쓰기 오류) */
function check9999(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { slidesOnly: true, skip: { wrong: 1, watch: 1, fig: 1, url: 1 } }).forEach(([s, wh]) => { (String(s).match(/\d+/g) || []).forEach(x => { if (+x > 9999) bad.push(wh + ' ' + x); }); }); Ls[k].extras.filter(e => e.type !== 'misconception' && e.type !== 'tip').forEach(e => ((e.title + ' ' + (e.content || '') + ' ' + (e.description || '')).match(/\d+/g) || []).forEach(x => { if (+x > 9999) bad.push(k + ' ' + e.id + ' ' + x); })); }); ok(!bad.length, bad.slice(0, 4).join(' | ')); }
/* 조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요 (마지막 숫자의 읽는 소리 받침) */
function finalOf(wd) { const d = +String(wd).slice(-1); return d === 0 ? 1 : [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; const t = String(s).replace(/\*\*/g, ''); const re = /(?<![\d,])(\d+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g; let m; while ((m = re.exec(t))) { const f = finalOf(m[1]); if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
function checkJosa(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { skip: { options: 1, fig: 1, url: 1, id: 1, img: 1, live_url: 1, source: 1 } }).forEach(([s, wh]) => josa(s).forEach(b => bad.push(wh + ' 「' + b + '」'))); }); ok(!bad.length, bad.slice(0, 5).join(' | ')); }

console.log('═══ A. 로드 ═══');
T('9차시 키 u1_l01~l09 · 파일 data/g2s2_math_u1.js', () => ok(SAME(Object.keys(L0).sort(), KEYS), Object.keys(L0).join(',')));
T('meta: 2학년 2학기 수학 · 1단원 네 자리 수 · 성취기준 지도서 문구 · 40분 · 지도서 쪽 · theme · live_url 원문 실재 · n', () => KEYS.forEach((k, i) => { const m = L0[k].meta; ok(m.grade === 2 && m.term === 2 && m.unit === 1 && m.subject === '수학' && m.unit_title === '네 자리 수' && m.n === i + 1, k); ok(m.std === STD_OF(i + 1), k + ' 성취기준 ' + m.std); ok(!/임시/.test(m.std), k + ' 임시'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 1단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(m.theme === '곰이·펭이 독도 여행', k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 360분', () => { KEYS.forEach(k => ok(L0[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L0[k].meta.title)); ok(KEYS.reduce((a, k) => a + L0[k].meta.duration_min, 0) === 360, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math · 2학년 = tier-mid', () => { ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 bt4·pvt·jump·notes·ngrid·eqt·tools·dtb 등록 · 렌더 깨짐 0', () => { [{ k: 'bt4', th: 1, h: 5, t: 3, o: 6 }, { k: 'pvt', v: '1536', read: true }, { k: 'jump', start: 2167, step: 1000, n: 4 }, { k: 'notes', items: [{ v: 1000, n: 2 }] }, { k: 'ngrid', rows: [['1', '2']] }, { k: 'eqt', rows: [{ toks: ['1', '+', '2', '=', '3'] }] }, { k: 'tools', items: [{ emoji: '📖', name: 'a', kind: 'b' }] }, { k: 'dtb', head: ['a', 'b'], rows: [['1', '2']] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined/.test(h), f.k); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L0[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L0[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선 + 실사 자리) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 곰이·펭이', () => { const sl = L0[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); const mo = sl[2].data;
  ok(mo.kids && mo.kids.length === 2 && mo.kids[0].face === '🐻' && /^곰이\n"/.test(mo.kids[0].label) && mo.kids[1].face === '🐧' && /^펭이\n"/.test(mo.kids[1].label) && mo.question, '③장면·물음 + 곰이·펭이');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 9종 서로 다름 · 다른 덱(data 전체)과 겹침 0', () => { const im = KEYS.map(k => L0[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); let other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g\d(s\d)?_[a-z]+_u\d+\.js$/.test(f) && f !== 'g2s2_math_u1.js').forEach(f => { try { Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => { if (s.data && s.data.img) other.push(s.data.img); })); } catch (e) { /* 다른 꼴 파일 */ } }); ok(other.length >= 300, '다른 덱 실사 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침 ' + im.filter(x => other.indexOf(x) >= 0)); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '1학기 마지막 g2_math u6_l09 출구'), () => checkLineage(L0, k, i)));
T('마지막 차시 「다음 단원엔」 = 곱셈구구 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L0.u1_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /곱셈구구/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L0[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });
T('2단원 이음 — g2s2_math_u2 u2_l01 복습 = 이 단원 u1_l09 출구(그 생성기가 vm 으로 읽음)', () => { const U2 = load(path.join(TDIR, 'data/g2s2_math_u2.js')); const rv = U2.u2_l01.slides[1].data; ok(rv.from === 'g2s2_math:u1_l09', 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L0.u1_l09.slides[15].data.items.map(x => [x.q, x.a])), 'u2_l01 복습이 옛 출구 — gen_g2s2_math_u2 다시 돌릴 것'); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u1_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { nCheck += checkAnswers(L0, k); if (k === 'u1_l01') nCheck += L0[k].slides[1].data.items.length; }));
T('다시 셈한 정답 = 84', () => ok(nCheck === 84, nCheck));
T('셈기 자체 확인 — 읽기(0인 자리 안 읽음·일 생략) · 세는 말 · 자리 · □ 후보 · 순열 · 틀린 답 잡음', () => { ok(RD(5708) === '오천칠백팔' && RD(2102) === '이천백이' && RD(1000) === '천' && RD(8729) === '팔천칠백이십구' && RD(2010) === '이천십' && RD(1111) === '천백십일' && RD(302) === '삼백이', '읽기'); ok(COUNT(1536) === '천오백서른여섯' && COUNT(1520) === '천오백스무' && COUNT(1001) === '천한', '세는 말'); ok(placeOf(607, 0) === '십의 자리' && val(5591, '백') === 500 && dig(2005, '천') === 2 && NDIG(425) === '세 자리 수', '자리'); ok(CAND(6419, '□518') === '6, 7, 8, 9' && CAND(4518, '□618') === '4, 5, 6, 7, 8, 9', '□'); ok(perm4([0, 2, 5, 7]).filter(x => x[0] !== '0' && x[1] === '7').sort().join() === '2705,2750,5702,5720', '순열');
  let c = 0; [() => want({ options: [{ text: '7, 8, 9', correct: true }, { text: '6, 7, 8, 9' }] }, CAND(6419, '□518')), () => want({ input: 'count_input', answer: 4000300502, note: '**4000300502**' }, S(4352)), () => want({ options: [{ text: '오천칠백영팔', correct: true }] }, RD(5708))].forEach(f => { if (throws(f)) c++; }); ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const EQ = /\d[\d \t+\-−×]*=[\d \t+\-−×=]*\d/g;
function evI(e) { const t = String(e).replace(/[−]/g, '-').replace(/×/g, '*').replace(/\s+/g, ''); ok(/^[\d+\-*]+$/.test(t), '식 글자 ' + e); return t.split(/(?=[+-])/).reduce((a, term) => { const sg = term[0] === '-' ? -1 : 1; const v = term.replace(/^[+-]/, '').split('*').reduce((p, x) => p * +x, 1); return a + sg * v; }, 0); }
const chainOK = (e) => { const p = String(e).split('=').map(x => x.trim()).filter(Boolean); const v = p.map(evI); return v.every(x => x === v[0]); };
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); /* 줄바꿈은 그대로 — 식이 줄을 넘지 않게 */ let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const t = m[0].trim(); if (!/[+\-−×]/.test(t)) continue; nEq++; try { if (!chainOK(t)) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」'); } } }
KEYS.forEach(k => dataStrings(L0, k, { slidesOnly: true, skip: { fig: 1 } }).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); }));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 7', () => ok(!badEq.length && nEq >= 7, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('풀이의 「a → b」 뛰어 세기 — 물음의 출발 수·뛰는 크기·방향대로 한 걸음씩', () => { let n = 0; KEYS.forEach(k => { const lv = L0[k].slides[11].data.levels; ['기본', '도전'].forEach(t => { const m = lv[t].q.match(/^(\d+)부터 (\d+)씩 (거꾸로 )?(\d+)번/); if (!m) return; const st = (m[3] ? -1 : 1) * +m[2]; let cur = +m[1], cnt = 0; lv[t].steps.forEach(x => { const p = x.match(/^(\d+) → (\d+)$/); if (p) { ok(+p[1] === cur && +p[2] === cur + st, k + ' ' + t + ' 뛰기 ' + x); cur = +p[2]; cnt++; } }); ok(cnt === +m[4], k + ' ' + t + ' 걸음 수'); n++; }); }); ok(n >= 3, '뛰기 풀이 ' + n); });
T('틀린 생각은 정말 틀림 — 틀린 값 ≠ 셈 · 바른 생각에 셈 값', () => KEYS.forEach(k => { const d = L0[k].slides[7].data, [bad, good] = WRONG[k]; ok(clean(d.wrong).indexOf(bad) >= 0, k + ' 틀린 생각에 「' + bad + '」 없음'); ok(clean(d.right).indexOf(good) >= 0, k + ' 바른 생각에 「' + good + '」 없음'); if (/^\d+$/.test(bad) || /^[가-힣]+$/.test(bad) && /^[일이삼사오육칠팔구십백천]+$/.test(bad)) ok(bad !== good, k + ' 틀린 값 = 셈'); }));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['4352 = 4000 + 300 + 50 + 20', '5591 = 5000 + 500 + 9 + 1', '3015 = 3000 + 100 + 5'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('1297 = 1000 + 200 + 90 + 7', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s, k]); }));
const flat = (f) => (f.k === 'panels' ? f.items.flatMap(p => flat(p.fig || p)) : [f]);
const cellV = (c) => (c && typeof c === 'object' ? (c.q ? '?' : String(c.v)) : String(c));
const nG = { bt4: 0, pvt: 0, jump: 0, notes: 0, tiles: 0, grid: 0, eqt: 0, dtb: 0, tools: 0, ask: 0 };
const UNDER = [[1596, '천'], [1408, '백'], [5732, '십'], [6653, '백'], [9907, '일']], LETTER = { 400: '도', 900: '리', 1000: '독', 100: '부', 300: '학', 600: '비', 60: '머', 30: '경', 4: '울', 7: '대' };
function checkFig(w0, f, prob, tx, ans) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h), T0 = d.body.textContent;
  if (f.k === 'bt4') { nG.bt4++; const N = P4(f.th, f.h, f.t, f.o); ok(!/\d/.test(T0.replace(/\s/g, '')), w0 + ' 모형 그림에 수'); const cnt = [['천', f.th, 1000], ['백', f.h, 100], ['십', f.t, 10], ['일', f.o, 1]].filter(x => x[1] > 0); ok(tx.indexOf(String(N)) >= 0 || cnt.every(([nm, c, u]) => tx.indexOf(nm + ' 모형 ' + c + '개') >= 0 || tx.indexOf(u + '이 ' + c + '개') >= 0), w0 + ' 모형 ' + N + ' 이 글에 없음'); return []; }
  if (f.k === 'pvt') { nG.pvt++; const rows = (f.rows || [{ v: f.v }]).map(r => String(r.v)); ok(d.querySelector('.fig-pvt').getAttribute('data-vals') === rows.join(','), w0 + ' 칸'); rows.forEach(v => ok(tx.indexOf(v) >= 0, w0 + ' 자리판 수 ' + v + ' 이 글에 없음'));
    if (f.expand) { const eq = d.querySelector('.pv-eq').textContent.replace(/\s/g, ''); ok(evI(eq.split('=')[1]) === +rows[0], w0 + ' 풀어 쓴 식 합'); ok(!prob, w0 + ' 문제 그림에 풀어 쓴 식'); }
    if (f.read) { ok(d.querySelector('.pv-read b').textContent === RD(+rows[0]), w0 + ' 읽는 말'); ok(!prob, w0 + ' 문제 그림에 읽는 말'); }
    if (f.cmp) { ok(rows.length === 2 && d.querySelectorAll('.pv-eq')[0].textContent.replace(/\s/g, '') === rows[0] + CMP(+rows[0], +rows[1]) + rows[1], w0 + ' 비교 기호'); ok(!prob, w0 + ' 문제 그림에 비교 기호'); }
    if (f.hi) ok(prob ? true : true, ''); return []; }
  if (f.k === 'jump') { nG.jump++; const seq = Array.from({ length: f.n }, (_, i) => f.start + f.step * i); ok(d.querySelector('.fig-jump').getAttribute('data-seq') === seq.join(','), w0 + ' 수열'); ok(seq.every(v => v >= 0 && v <= 9999), w0 + ' 9999 넘음'); ok(d.querySelectorAll('.jp-b.q').length === (f.q || []).length, w0 + ' 「?」 칸');
    if (prob) { ok(f.bare && !d.querySelector('.jp-key') && !/[+−]\d/.test(T0), w0 + ' 문제 그림에 뛰는 크기'); return (f.q || []).length === 1 ? [String(seq[f.q[0]])] : []; } ok(tx.indexOf(String(seq[0])) >= 0 || tx.indexOf(String(seq[seq.length - 1])) >= 0 || (f.q || []).length, w0 + ' 뛰어 세기 수 글에 없음'); return []; }
  if (f.k === 'notes') { nG.notes++; const tot = f.items.reduce((a, r) => a + r.v * r.n, 0); ok(+d.querySelector('.fig-notes').getAttribute('data-total') === tot, w0 + ' 합계'); if (prob) ok(f.total === false && !/모두/.test(T0), w0 + ' 문제 그림 합계 줄'); else ok(tx.indexOf(String(tot)) >= 0, w0 + ' 돈 합계 ' + tot + ' 이 글에 없음'); return []; }
  if (f.k === 'ngrid') { const rows = f.rows.map(r => r.map(cellV)); const all = [].concat(...rows);
    if (all.every(v => /^(1000|100|10|1)$/.test(v))) { nG.tiles++; const sum = all.reduce((a, v) => a + +v, 0); if (!prob) ok(tx.indexOf(String(sum)) >= 0, w0 + ' 묶음 칸 합 ' + sum + ' 이 글에 없음'); return []; }
    const nums = rows.map(r => r.map(v => (/^\d+$/.test(v) ? +v : null)));
    if (rows.length > 1 && rows.every(r => r.length === rows[0].length) && nums[0].every(x => x != null && x >= 100)) { nG.grid++; const dx = nums[0][1] - nums[0][0], dy = nums[1][0] - nums[0][0]; nums.forEach((r, i) => r.forEach((x, j) => { if (x == null) return; ok(x === nums[0][0] + dx * j + dy * i, w0 + ' 수 배열표 ' + x); })); ok(new RegExp('→ ' + dx + '씩').test(f.arrow || '') && new RegExp('↓ ' + dy + '씩').test(f.arrow || ''), w0 + ' 배열표 화살표 글 ' + f.arrow); return []; }
    all.filter(v => /^\d{3,4}$/.test(v)).forEach(v => ok(tx.indexOf(v) >= 0, w0 + ' 칸 수 ' + v + ' 이 글에 없음')); return []; }
  if (f.k === 'eqt') { nG.eqt++; const want0 = []; f.rows.forEach(r => { const t = r.toks.map(String), qs = r.q || []; const tt = t.map((x, i) => (qs.indexOf(i) >= 0 ? '?' : x)); const eqI = tt.indexOf('='); if (eqI < 0) { tt.forEach(x => /^\d+$/.test(x) && ok(tx.indexOf(x) >= 0, w0 + ' 식 카드 수 ' + x)); return; } const Lh = tt.slice(0, eqI).join(' '), Rh = tt.slice(eqI + 1).join(' ');
      if (Rh === '?') want0.push(String(evI(Lh))); else ok(evI(Lh) === evI(Rh), w0 + ' 식 카드 ' + tt.join(' ')); if (prob) ok(!(r.hi || []).length, w0 + ' 문제 식 강조'); }); return want0; }
  if (f.k === 'dtb') { nG.dtb++; f.rows.forEach(r => r.forEach(c => { if (/^\d+(원)?$/.test(c) && !prob) ok(tx.indexOf(c) >= 0, w0 + ' 표 칸 ' + c + ' 이 글에 없음'); })); if (/독도경비대/.test(tx)) { const vals = UNDER.map(([n, p]) => val(n, p)); ok(SAME(f.rows.map(r => +r[0]), vals), w0 + ' 밑줄 숫자 값 ' + vals); ok(f.rows.map(r => r[1]).join('') === vals.map(v => LETTER[v]).join('') && vals.map(v => LETTER[v]).join('') === '독도경비대', w0 + ' 글자'); } return []; }
  if (f.k === 'tools') { nG.tools++; if (prob) return []; /* 문제 그림의 카드는 고를 거리 */ f.items.forEach(it => ok(tx.indexOf(it.name.replace(/[년명종]$/, '')) >= 0 || tx.indexOf(it.name) >= 0, w0 + ' 카드 ' + it.name + ' 이 글에 없음')); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}
const ansOf = (d) => (d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer));
T('그림 ' + figs.length + '개 — 모형 개수·자리판·풀어 쓴 식·읽는 말·비교 기호·수열·배열표 간격·묶음 칸·돈·식 카드·표·카드 = 게이트 셈·글', () => figs.forEach(([w0, f, b, s]) => { const prob = b === 'basic_problem'; const tx = slideText(s); const ws = flat(f).flatMap(g => checkFig(w0 + ' ' + g.k, g, prob, tx)); if (prob && ws.length) { nG.ask++; const A = ansOf(s.data); ok(ws.every(x => x === A), w0 + ' 그림 빈칸 값 ' + ws + ' ≠ 답 ' + A); } }));
T('문제 그림이 답을 보이지 않음 — 그림 글자의 수 토막·글자에 정답 0(물음 글에 이미 있는 답 빼고)', () => figs.filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data, A = ansOf(d); if (nsp(d.question).indexOf(nsp(A)) >= 0) return; const txt = docOf(FIG.render(f).replace(/></g, '> <')).body.textContent; if (/^\d+$/.test(A)) ok((txt.match(/\d+/g) || []).indexOf(A) < 0, w0 + ' 그림에 정답 ' + A); else ok(nsp(txt).indexOf(nsp(A)) < 0, w0 + ' 그림에 정답 ' + A); }));
T('개념 36장 · 기본 문제 27장 모두 그림 · bt4 ≥ 10 · pvt ≥ 12 · jump ≥ 8 · 문제 그림 빈칸 대조 ≥ 4', () => { let c = 0, p = 0; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); ok(nG.bt4 >= 10 && nG.pvt >= 12 && nG.jump >= 8 && nG.ask >= 4 && nG.grid >= 2 && nG.tiles >= 4, JSON.stringify(nG)); });
T('그림 검사기 자체 확인 — 모형 수·읽는 말·비교 기호·배열표·문제 그림 뛰는 크기·식 카드 잡음', () => { let c = 0; const tr = (f, prob, tx) => { if (throws(() => checkFig('probe', f, prob, tx))) c++; };
  tr({ k: 'bt4', th: 1, h: 5, t: 3, o: 6 }, false, '1535');
  const R0 = FIG.render; FIG.render = (f) => R0(f).replace('천오백삼십육', '천오백삼십륙'); tr({ k: 'pvt', v: '1536', read: true }, false, '1536'); FIG.render = R0;
  FIG.render = (f) => R0(f).replace('1422 &lt; 2180', '1422 &gt; 2180').replace('1422 < 2180', '1422 > 2180'); tr({ k: 'pvt', rows: [{ v: '1422' }, { v: '2180' }], cmp: true }, false, '1422 2180'); FIG.render = R0;
  tr({ k: 'ngrid', rows: [['880', '890', '900'], ['980', '990', '1010']], arrow: '→ 10씩 · ↓ 100씩' }, false, '880 890 900 980 990 1010');
  tr({ k: 'jump', start: 2167, step: 1000, n: 4, q: [2] }, true, '');
  tr({ k: 'eqt', rows: [{ toks: ['1000', '+', '200', '+', '90', '+', '7', '=', '1279'] }] }, false, '1000 200 90 7 1279');
  ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 그림 = fig json · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k], F = FIGJ[k];
  L0[k].slides.filter(s => s.block === 'concept').forEach((s, i) => { ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'); ok(SAME(s.data.fig, F.slides[i]), s.id + ' 그림 명세'); });
  L0[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.fig, F.problems[i]), s.id + ' 그림 명세'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L0[k].slides[18].data; if (k !== 'u1_l09') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L0[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l06 「7869」는 l02 에 · l04 「천오백서른여섯」은 l07 에 없음)', () => { ok(nsp(JSON.stringify(L0.u1_l02)).indexOf('7869') < 0, 'l02'); ok(nsp(JSON.stringify(L0.u1_l07)).indexOf('천오백서른여섯') < 0, 'l07'); });
const TBA_N = Object.values(TBA).reduce((a, x) => a + x.length, 0);
T('보탬 흡수 대조 — 옛 TB ' + TBA_N + '줄(보관본에 실재)의 핵심 수·낱말이 그 차시 본류 장(extras 아님)에 · b_ id 0', () => { const old = fs.readFileSync(path.join(TDIR, 'archive/neutral/gen_g2s2_math_u1.js'), 'utf8'); ok(TBA_N === 21, 'TB 줄 ' + TBA_N); Object.keys(TBA).forEach(k => { const main = nsp(JSON.stringify(L0[k].slides)); TBA[k].forEach(([title, toks]) => { ok(old.indexOf("['" + title + "'") >= 0, '보관본에 TB 줄 없음 ' + title); const miss = toks.filter(t => main.indexOf(nsp(t)) < 0); ok(!miss.length, k + ' 「' + title + '」 본류에 없음 ' + miss.join(' / ')); }); }); ok(!/"id":"b_l/.test(fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u1.js'), 'utf8')), 'b_ id'); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L0[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 차시마다 file = g2_math_u1_lNN_….html · 원문 파일 실재(투영 지도)', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g2_math_u1_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade2/semester2/math/1단원_네자리수', f)), k + ' 원문 없음'); }));
let nRead = 0;
T('읽는 말 전수 — 데이터 속 「수 → 읽는 말」이 게이트 읽기 규칙과 같음(0인 자리 안 읽음 · 일 생략) · ≥ 15', () => { nRead = checkReadings(L0); ok(nRead >= 15, '읽는 말 ' + nRead); });
T('0을 읽은 잘못된 읽는 말(「…영…」)은 틀린 생각·관찰·보기·오개념/팁 카드에만', () => checkZeroRead(L0));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 동기 장 mo2(곰이·펭이) · 1인 흐름 · 그림 섬', () => { const les = L0[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'motivate') ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), s.id + ' 동기 장 꼴 ' + r.cls);
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재 · 보탬 카드 0', () => checkExtras(L0, k)));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 사항 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L0[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L0[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~니?」「~는가?」 0) · 물음 속 「~다.」 0 (l01 되짚기는 1학기 덱 출구 그대로라 뺌)', () => { const qs = []; KEYS.forEach((k, i) => { const sl = L0[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(i ? sl[1].data.items : []).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 읽는 말·세는 말 l04 · 0인 자리 안 읽음 l08 · 8729 토의 l05 · 1422 < 2046 l07 · 말 먼저 기호 뒤 l07 · 9999까지 l06 · 「이영사육」 허용 l01 · 소리 나는 대로 쓰기 l04·l08 · 천 모형은 꼭 l04', () => { const tx = (k) => JSON.stringify(L0[k]);
  ok(/천오백서른여섯/.test(L0.u1_l04.slides[4].data.content) && /서른여섯/.test(JSON.stringify(L0.u1_l04.slides[4].data.tnote)), 'l04 읽는 말·세는 말'); ok(/0인 자리는 읽지 않아요/.test(tx('u1_l08')), 'l08 0 읽기'); ok(/팔칠이구/.test(L0.u1_l05.slides[7].data.wrong) && /토의/.test(L0.u1_l05.slides[7].data.hint), 'l05 8729 토의'); ok(/2046/.test(L0.u1_l07.slides[7].data.wrong), 'l07 1422 < 2046');
  ok(/말로 먼저/.test(tx('u1_l07')) && /2180은 1422보다 큽니다/.test(L0.u1_l07.slides[3].data.content), 'l07 말 먼저'); ok(/10000\)?은 다루지 않아요|9999보다 1만큼 더 큰 수\(10000\)는 다루지 않아요/.test(tx('u1_l06')), 'l06 9999까지'); ok(/이영사육/.test(tx('u1_l01')), 'l01 허용'); ok(/200051/.test(L0.u1_l04.slides[7].data.wrong) && /4000300502/.test(L0.u1_l08.slides[7].data.wrong), '소리 나는 대로'); ok(/천 모형은 꼭/.test(tx('u1_l04')), 'l04 천 모형'); });

console.log('═══ L. 선행 용어 ═══');
T('처음 배우는 차시 전에는 그 말 0 (천의 자리·자릿값 카드 l05 · 거꾸로 l06 · 부등호 l07 — l01 단원 도입 예외)', () => checkFirst(L0));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(L0, KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 · 9999 · 조사 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 · 교과서 속 다른 인물 이름(지아·세미) 0', () => { const all = JSON.stringify(L0); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』', '지아', '세미'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면(렌더 글자)에 영어 코드(u1 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~D)만', () => KEYS.forEach(k => L0[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L0[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); const wds = (txt.match(/[A-Za-z]+/g) || []).filter(x => !/^[A-D]$/.test(x)); ok(!wds.length, k + ' ' + s.id + ' 영어 낱말 「' + wds.join(',') + '」'); }))));
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L0[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
T('9999까지 — 10000 이상의 수는 틀린 생각·관찰·오개념·팁 카드에만(지도서 161쪽)', () => check9999(L0));
T('조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요가 읽는 소리 받침에 맞음', () => checkJosa(L0));
T('조사 검사기 자체 확인', () => { ok(josa('1000을').length === 0 && josa('1000를').length === 1 && josa('425는').length === 0 && josa('3027는').length === 1 && josa('2051은').length === 0 && josa('4352이에요').length === 1 && josa('6372와').length === 0, '조사'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 잡는지 ═══');
const RED = [
  ['출구 답을 틀리게(l05 백의 자리 5 → 「5」)', (B) => { B.u1_l05.slides[15].data.items[0].a = '5'; }, (B) => checkAnswers(B, 'u1_l05')],
  ['선행 말을 앞 차시에(l03 개념에 「천의 자리」)', (B) => { B.u1_l03.slides[4].data.content += ' 천의 자리 숫자'; }, (B) => checkFirst(B)],
  ['보탬 카드를 되살림(l03 extras 에 b_l3_1)', (B) => { B.u1_l03.extras[21] = { id: 'b_l3_1', type: 'other_activity', icon: '📗', title: '교과서 활동 — 5000원', content: '…', fit_slides: ['concept'] }; }, (B) => checkExtras(B, 'u1_l03')],
  ['읽는 말에 0을 읽음(l04 「이천오십일」 → 「이천영백오십일」)', (B) => { B.u1_l04.slides[6].data.content = B.u1_l04.slides[6].data.content.replace('이천오십일', '이천영백오십일'); }, (B) => { checkReadings(B); checkZeroRead(B); }],
  ['복습 계보를 끊음(l06 복습 첫 답)', (B) => { B.u1_l06.slides[1].data.items[0].a = '9998'; }, (B) => checkLineage(B, 'u1_l06', 5)],
  ['9999를 넘는 수(l06 개념에 「10000」)', (B) => { B.u1_l06.slides[5].data.content += ' 9999 다음은 10000'; }, (B) => check9999(B)],
  ['조사 틀림(l07 「1422는」 → 「1422은」)', (B) => { B.u1_l07.slides[3].data.content = B.u1_l07.slides[3].data.content.replace('1422는', '1422은'); }, (B) => checkJosa(B)]
];
RED.forEach(([name, broke, chk]) => T('레드 — ' + name + ' → 잡힘 · 원본은 통과', () => { ok(!throws(() => chk(L0)), '원본이 걸림'); const B = clone(L0); broke(B); ok(throws(() => chk(B)), '못 잡음'); }));
T('역검증 7종', () => ok(RED.length >= 7, RED.length));

console.log('\n게이트 g2s2 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
