/* gate_g3s2_math_u1.js — 3학년 2학기 수학 1단원 「곱셈」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 · gate_g2s2_math_u1 틀 + 지도서 직행 점검).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(vmul·grid·range·eq·bt·mulrows·eqt·ngrid·dtb·tools·panels) · meta(3학년 2학기 · 1단원 곱셈 · 성취기준 지도서 문구 [4수01-04] 1·2·5·9 · + [4수01-08] 3·4·6·7·8·10 · 40분 · 지도서 쪽 · theme·live_url) · slug g3s2_math
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 + 실사 자리 10종 서로 다름 · 다른 덱과 겹침 0)
   D 복습 계보(l01 = 1학기 마지막 g3_math u7_l01 출구 → l02 … l10 = 직전 출구) · l10 다음 단원 = 나눗셈 · 2단원 u2_l01 복습 = 이 단원 l10 출구
   E 정답 다시 셈 — 게이트 자체 세로셈 셈기(한 자리씩 곱해 올림하는 LM · 올림 횟수 · 곱 비교 · □ 찾기 · 수 카드 가장 큰/작은 두 자리 수 · 암호)로 기본 30 · 수준별 20 · 출구 30 · 넓히기 10 · 되짚기 3 = 93
   F 식 전수 — 글 속 「… = …」 사슬 다시 셈(× 는 셈기로) · 「… > …」「… < …」 비교 다시 셈 · 틀린 생각은 정말 틀림(틀린 값 ≠ 셈 · 바른 생각에 셈 값)
   G 그림 — vmul 곱·부분 곱 = 셈기 · 문제 세로셈은 답·부분 곱·올림 칸 모두 비움 · grid 덩이 곱·합 · range 사이 · eq/eqt 식 · dtb 수 카드 세기·필요한 양·바른 곱 · ngrid 수 카드 합 · 문제 그림 빈칸 = 답 · 문제 그림이 답을 보이지 않음
   H 재료 충실(개념·문제 = src) · 교과서 수 표(활동목록.md) · 보탬 흡수 대조(옛 TB 18줄의 핵심 수·낱말이 본류 장에 · b_ id 0) · 중복 · src 회수 키
     · 교과서 곱셈 목록 대조(handoff gen_tb.py TBP + 그 부분 곱 — 목록 밖 곱셈식 0)
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에(올림 차례 · 어림 · 자리 맞추기 · 올림 안 더함 · 부분 곱 · 10배 · 상황은 달라요 · 두 자리 수만)
   L 선행(올림 2 · 어림 3 · 계산기 4 · 10배 5 · 모눈·순서를 바꾸어 6 · 한 자리 밀어 7 · 곱셈 갈래 이름 5·6·7 — 1차시 예고 예외) · 셈 선행(올림 한 번 3 · 여러 번 4 · (몇십몇) × (몇십) 5 · (몇) × (몇십몇) 6 · (몇십몇) × (몇십몇) 7)
   M 차단 어휘 · 「결」 0 · 겹낫표 0 · 인물(곰이·펭이만 — 채원·서준·건우·도윤·지유 0) · 영어 코드 0 · 조사(수 뒤 은/는·이/가·을/를·과/와·이에요/예요)
   R 역검증 레드 — 일부러 망가뜨린 사본(출구 답 · 선행 말 · 보탬 카드 · 복습 계보 · 교과서 밖 곱셈 · 셈 선행 · 조사 · 식 사슬 · 문제 그림 답)을 위 검사가 잡는지 9종
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_math_u1.js */
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
const L0 = load(path.join(TDIR, 'data/g3s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u1.json'), 'utf8'));
const FIGJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g3s2_math_u1.json'), 'utf8'));
const PREV = load(path.join(TDIR, 'data/g3_math_u7.js'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '곱셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const slideText = (s) => clean([s.data.title, s.data.content, s.data.question, s.data.scenario && s.data.scenario.body].filter(Boolean).join(' '));
const S = String;

/* ── 게이트 자체 세로셈 셈기 (부품·생성기와 따로 짬 — JS 곱셈을 쓰지 않고 한 자리씩 곱해 올림) ── */
const GUGU = (x, y) => { let s = 0; for (let i = 0; i < y; i++) s += x; return s; }; // 한 자리 × 한 자리 = 거듭 더하기
function LM(a, b) {
  const A = S(a).split('').reverse().map(Number), B = S(b).split('').reverse().map(Number); const out = new Array(A.length + B.length + 2).fill(0);
  B.forEach((bd, j) => { let c = 0; A.forEach((ad, i) => { const v = out[i + j] + GUGU(ad, bd) + c; out[i + j] = v % 10; c = Math.floor(v / 10); }); let k = A.length + j; while (c) { const v = out[k] + c; out[k] = v % 10; c = Math.floor(v / 10); k++; } });
  return +out.reverse().join('');
}
function CARRIES(a, b) { ok(b < 10, 'CARRIES 한 자리 곱하는 수'); let c = 0, n = 0; S(a).split('').reverse().map(Number).forEach(d => { const v = GUGU(d, b) + c; c = Math.floor(v / 10); if (v >= 10) n++; }); return n; } // 올림 횟수(맨 윗자리 넘침 포함)
const MAXP = (...ps) => S(Math.max(...ps.map(([a, b]) => LM(a, b))));
const MINP = (...ps) => S(Math.min(...ps.map(([a, b]) => LM(a, b))));
const PICKMAX = (o) => { const ks = Object.keys(o), v = ks.map(k => LM(o[k][0], o[k][1])), m = Math.max(...v); ok(v.filter(x => x === m).length === 1, 'PICKMAX 같은 값'); return ks[v.indexOf(m)]; };
const CMPPICK = (p, q) => { const a = LM(p[0], p[1]), b = LM(q[0], q[1]); return a > b ? p[0] + ' × ' + p[1] : a < b ? q[0] + ' × ' + q[1] : '두 곱이 같아요'; };
const BIG2 = (ds) => +ds.slice().sort((x, y) => y - x).slice(0, 2).join(''), SMALL2 = (ds) => +ds.slice().sort((x, y) => x - y).slice(0, 2).join('');
const BOXEQ = (pat, b, r) => { const hit = []; for (let d = 0; d <= 9; d++) if (LM(+pat.replace('□', d), b) === r) hit.push(d); ok(hit.length === 1, 'BOXEQ ' + hit); return S(hit[0]); };
const BOXLT = (b, lim) => { let best = null; for (let d = 1; d <= 9; d++) if (LM(d, b) < lim) best = d; return S(best); };
const NDIG = (n) => ['', '한', '두', '세', '네'][S(n).length] + ' 자리 수';
const CODE = (pairs, map) => pairs.map(([a, b]) => { const v = LM(a, b); ok(map[v], '암호 글자 없음 ' + v); return map[v]; }).join('');

const EXP = {
  basic: {
    u1_l01: [S(LM(43, 3)), CMPPICK([69, 6], [50, 8]), S(LM(12, 9))],
    u1_l02: [S(LM(213, 3)), S(LM(314, 2)), S(LM(120, 4))],
    u1_l03: [S(LM(114, 6)), S(LM(328, 3)), BOXEQ('2□6', 3, 678)],
    u1_l04: [S(LM(417, 5)), S(LM(274, 6)), '약 ' + LM(200, 2) + ' · ' + LM(189, 2)],
    u1_l05: [S(LM(13, 30)), S(LM(80, 30)), S(LM(32, 40))],
    u1_l06: [S(LM(3, 48)), S(LM(6, 15)), BOXLT(43, 200)],
    u1_l07: [S(LM(12, 16)), S(LM(14, 16)), S(LM(36, 12))],
    u1_l08: [S(LM(29, 63)), S(LM(45, 15)), S(LM(BIG2([2, 4, 5, 6, 8]), SMALL2([2, 4, 5, 6, 8])))],
    u1_l09: [S(LM(109, 8)), S(LM(8, 35)), S(LM(51, 19))],
    u1_l10: [S(LM(492, 3)), S(LM(191, 6)), S(LM(16, 21))]
  },
  lev: {
    u1_l01: [S(LM(40, 2)), MAXP([43, 3], [76, 5])], u1_l02: [S(LM(223, 2)), MAXP([342, 2], [201, 3])], u1_l03: [S(LM(106, 8)), MAXP([218, 4], [121, 7])],
    u1_l04: [S(LM(136, 4)), PICKMAX({ '㉠': [242, 6], '㉡': [461, 3], '㉢': [637, 2], '㉣': [391, 4] })], u1_l05: [S(LM(50, 40)), S(LM(100 - 30, 30))],
    u1_l06: [S(LM(8, 42)), MAXP([4, 24], [6, 15], [3, 36])], u1_l07: [S(LM(15, 21)), MAXP([61, 14], [42, 23])], u1_l08: [S(LM(73, 24)), MINP([53, 25], [34, 41])],
    u1_l09: [S(LM(12, 25)), S(LM(17, 48))], u1_l10: [S(LM(12, 37)), S(LM(BIG2([2, 9, 7, 5]), SMALL2([2, 9, 7, 5])))]
  },
  exit: {
    u1_l01: [S(LM(11, 7)), S(LM(76, 5)), S(LM(69, 6))], u1_l02: [S(LM(143, 2)), S(LM(200, 4)), S(LM(223, 3))], u1_l03: [S(LM(217, 2)), S(LM(132, 4)), S(LM(282, 2))],
    u1_l04: [S(LM(426, 3)), S(LM(274, 7)), S(LM(359, 7))], u1_l05: [S(LM(30, 30)), S(LM(14, 20)), S(LM(23, 40))], u1_l06: [S(LM(7, 16)), S(LM(5, 64)), LM(7, 16) === LM(16, 7) ? '같아요' : '달라요'],
    u1_l07: [S(LM(24, 13)), S(LM(23, 14)), S(LM(24, 10))], u1_l08: [S(LM(39, 26)), S(LM(85, 37)), S(LM(40, 30))], u1_l09: [S(LM(31, 20)), S(LM(138, 6)), S(LM(17, 27))],
    u1_l10: [S(LM(216, 4)), S(LM(80, 70)), S(LM(6, 38))]
  },
  adv: {
    u1_l01: NDIG(38), u1_l02: S(LM(430, 2)), u1_l03: S(LM(142, 4)), u1_l04: S(LM(129, 6)), u1_l05: S(LM(22, 80)),
    u1_l06: CODE([[5, 14], [7, 35], [9, 27], [8, 34], [4, 98], [3, 54]], { 70: '수', 245: '학', 243: '은', 272: '내', 392: '친', 162: '구' }),
    u1_l07: S(LM(12, 26)), u1_l08: S(LM(28, 46)), u1_l09: S(LM(26, 19)), u1_l10: S([[23, 43], [175, 6], [42, 28], [322, 3]].filter(([a, b]) => LM(a, b) > 1000).length)
  }
};
/* 지도서 차시 이름 · 쪽 · 교과서 쪽 · 성취기준 */
const TITLE = { u1_l01: '곱셈', u1_l02: '(세 자리 수) × (한 자리 수)를 구해 볼까요 (1)', u1_l03: '(세 자리 수) × (한 자리 수)를 구해 볼까요 (2)', u1_l04: '(세 자리 수) × (한 자리 수)를 구해 볼까요 (3)', u1_l05: '(몇십) × (몇십), (몇십몇) × (몇십)을 구해 볼까요', u1_l06: '(몇) × (몇십몇)을 구해 볼까요', u1_l07: '(몇십몇) × (몇십몇)을 구해 볼까요 (1)', u1_l08: '(몇십몇) × (몇십몇)을 구해 볼까요 (2)', u1_l09: '걸리버와 함께 살아요', u1_l10: '스스로 마무리하기' };
const PAGES = { u1_l01: '164~165', u1_l02: '166~169', u1_l03: '170~173', u1_l04: '174~177', u1_l05: '178~181', u1_l06: '182~185', u1_l07: '186~189', u1_l08: '190~193', u1_l09: '194~197', u1_l10: '198~201' };
const TBPG = { u1_l01: '수학 8~9쪽 · 수학익힘 5쪽', u1_l02: '수학 10~11쪽 · 수학익힘 6~7쪽', u1_l03: '수학 12~14쪽 · 수학익힘 8~9쪽', u1_l04: '수학 15~17쪽 · 수학익힘 10~11쪽', u1_l05: '수학 18~19쪽 · 수학익힘 12~13쪽', u1_l06: '수학 20~21쪽 · 수학익힘 14~15쪽', u1_l07: '수학 22~23쪽 · 수학익힘 16~17쪽', u1_l08: '수학 24~25쪽 · 수학익힘 18~19쪽', u1_l09: '수학 26~27쪽 · 수학익힘 20쪽', u1_l10: '수학 28~31쪽' };
const STDS = { a: '[4수01-04] 곱하는 수가 한 자리 수 또는 두 자리 수인 곱셈의 계산 원리를 이해하고 그 계산을 할 수 있다.', b: '[4수01-08] 자연수의 덧셈, 뺄셈, 곱셈, 나눗셈과 관련한 여러 가지 상황에서 어림셈을 할 수 있다.' };
const STD_OF = (n) => ([1, 2, 5, 9].indexOf(n) >= 0 ? STDS.a : STDS.a + ' · ' + STDS.b);
/* 교과서 곱셈 목록 — handoff/kedu/textbook2/g3_2_math_u1/gen_tb.py TBP(지도서 148~201쪽 정독) 그대로 + 익힘 5 선수 학습 · 교과서 방법 1·2 사슬. 이 밖의 곱셈식(과 그 부분 곱 밖)은 데이터에 못 쓴다 */
const TBP = [
  [6, 38], [12, 19], [11, 7], [43, 3], [76, 5], [69, 6], [50, 8],
  [143, 2], [200, 4], [320, 3], [421, 2], [24, 2],
  [213, 3], [314, 2], [100, 9], [321, 3], [134, 2], [223, 2], [223, 3], [342, 2], [201, 3], [120, 4], [210, 3], [121, 4], [214, 2],
  [300, 2], [103, 3], [420, 2], [430, 2],
  [217, 2], [132, 4], [114, 6], [106, 8], [282, 2], [328, 3],
  [241, 3], [136, 2], [117, 5], [251, 3], [329, 2], [117, 3], [351, 2], [218, 4], [121, 7], [150, 6], [226, 3], [142, 4],
  [416, 2], [271, 3], [329, 3], [232, 4], [153, 3],
  [426, 3], [274, 7], [136, 4], [417, 5], [359, 7], [274, 6], [189, 2],
  [617, 5], [534, 3], [741, 3], [158, 2], [629, 8], [242, 6], [461, 3], [637, 2], [391, 4], [390, 5], [129, 6], [256, 3], [266, 3], [552, 3], [393, 3],
  [253, 7], [861, 3], [632, 9], [421, 5], [326, 4],
  [30, 30], [30, 3], [14, 20], [14, 2], [14, 10], [40, 20], [32, 30], [73, 40],
  [13, 30], [13, 3], [13, 10], [26, 20], [26, 2], [26, 10], [80, 30], [23, 40], [47, 60], [60, 20], [52, 20], [24, 50], [26, 40], [32, 40], [70, 30], [12, 40],
  [50, 40], [38, 20], [60, 30], [29, 90], [22, 80],
  [7, 16], [16, 7], [3, 48], [8, 42], [5, 64], [6, 15],
  [7, 25], [8, 14], [4, 39], [6, 51], [5, 84], [9, 15], [8, 37], [4, 24], [3, 36], [5, 23], [4, 43], [5, 43], [5, 14], [7, 35], [9, 27], [8, 34], [4, 98], [3, 54],
  [3, 42], [5, 63], [8, 74], [9, 82], [4, 27], [12, 6], [6, 12],
  [24, 13], [12, 16], [15, 21], [23, 14], [24, 1], [24, 4], [24, 8],
  [12, 26], [28, 13], [32, 24], [13, 42], [36, 21], [41, 24], [52, 13], [27, 31], [61, 14], [42, 23], [14, 16], [36, 12], [29, 13], [30, 13], [29, 10], [30, 10],
  [16, 13], [31, 17], [23, 34], [18, 19],
  [39, 26], [29, 63], [73, 24], [85, 37], [44, 26], [37, 48], [63, 45], [40, 30], [40, 20],
  [28, 46], [46, 34], [74, 62], [23, 58], [53, 25], [34, 41], [45, 15], [86, 24], [26, 43],
  [28, 29], [53, 64], [43, 36], [72, 27], [35, 49],
  [31, 20], [138, 6], [17, 27], [5, 49], [92, 41], [12, 25],
  [109, 8], [51, 19], [8, 35], [17, 48], [40, 19], [26, 19], [39, 19], [14, 48], [71, 48], [48, 48], [31, 6], [31, 27], [31, 49],
  [212, 4], [307, 3], [564, 2], [12, 20], [7, 26], [48, 36], [423, 2], [80, 70], [5, 38], [216, 4], [492, 3], [12, 37], [45, 30], [45, 3], [45, 10], [23, 43], [175, 6], [42, 28], [322, 3], [191, 6], [16, 21], [972, 5], [972, 2], [972, 3], [97, 25],
  [421, 4], [16, 34], [26, 30], [206, 6], [32, 21], [23, 12], [76, 32], [13, 18], [26, 13],
  [328, 7], [42, 24], [32, 29], [65, 35], [378, 2], [43, 32], [300, 3], [300, 10], [330, 10], [70, 40], [80, 2], [99, 2], [99, 3], [99, 4], [99, 5],
  [320, 1], [310, 2], [203, 1], [103, 2], [102, 3], [38, 27],
  [200, 2], [100, 4], [400, 3], [200, 3], [20, 16], [7, 20], [12, 20], [6, 40], [400, 2], [1000, 5],
  [40, 2], [12, 9], [28, 10], [140, 2], [135, 10], [450, 3] // 익힘 5 선수 학습(지도서 165) · 14 × 2 × 10 · 14 × 10 × 2(교과서 19) · 45 × 3 × 10 · 45 × 10 × 3(교과서 28)
];
function partsOf(a, b) { const out = []; const add = (x, y) => out.push([x, y]);
  if (b < 10 && a >= 100) [[100, Math.floor(a / 100)], [10, Math.floor(a / 10) % 10], [1, a % 10]].forEach(([k, v]) => { add(v * k, b); add(v, b); });
  if (b < 10 && a >= 10 && a < 100) { add(Math.floor(a / 10) * 10, b); add(a % 10, b); add(Math.floor(a / 10), b); }
  if (b >= 10) { const bt = Math.floor(b / 10), bo = b % 10; [[a, bo], [a, bt * 10], [a, bt], [a, 10], [a, 1]].forEach(p => add(...p));
    if (a >= 10) [[Math.floor(a / 10) * 10, bo], [a % 10, bo], [Math.floor(a / 10) * 10, bt * 10], [a % 10, bt * 10], [Math.floor(a / 10), bt], [a % 10, bt]].forEach(p => add(...p));
    if (a % 10 === 0 && b % 10 === 0) add(a / 10, b / 10); }
  return out; }
const ALLOWED = new Set(); TBP.forEach(([a, b]) => [[a, b]].concat(partsOf(a, b)).forEach(([x, y]) => { ALLOWED.add(x + '×' + y); ALLOWED.add(y + '×' + x); }));
const MULRE = /(?<![\d□])(\d+)((?: × \d+)+)/g;
const prep = (s) => String(s).replace(/\*\*/g, '').replace(/\d*□\d*/g, '□');
function mulPairs(s0) { const s = prep(s0), out = []; let m; MULRE.lastIndex = 0; while ((m = MULRE.exec(s))) { const xs = [+m[1]].concat(m[2].split(' × ').filter(Boolean).map(Number)); let acc = xs[0]; for (let i = 1; i < xs.length; i++) { out.push([acc, xs[i]]); acc = LM(acc, xs[i]); } } return out; }
/* 셈 갈래가 처음 나오는 차시 — 지도서 차시 차례(올림 없음 2 → 한 번 3 → 여러 번 4 → (몇십몇) × (몇십) 5 → (몇) × (몇십몇) 6 → (몇십몇) × (몇십몇) 7) */
function introOf(a, b) { if (a < 10 && b < 10) return 1; if (b < 10) { if (a < 100) return 1; const c = CARRIES(a, b); return c === 0 ? 2 : c === 1 ? 3 : 4; } if (a < 10) return 6; if (b % 10 === 0) return 5; return 7; }
const L01_OK = new Set(['6×38', '12×19']); // 1차시 단원 도입 장면의 곱셈(계산은 10차시 만화에서)

/* 교과서 수 표 — 활동목록.md(지도서 148~201쪽 정독)의 차시별 교과서·익힘·확인 문제 수·장면 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u1_l01: ['식품 안전 체험관', '고구마', '6개씩 38상자', '12개씩 19상자', '11 × 7', '77', '43 × 3', '129', '76 × 5', '380', '69 × 6', '50 × 8', '414', '400', '곱해지는 수나 곱하는 수가 큰 곱셈', '31쪽', '12 × 9', '108', '40개씩'],
  u1_l02: ['천연 비료', '143개씩', '143 × 2', '286', '수 카드', '100 × 2 = 200', '40 × 2 = 80', '3 × 2 = 6', '200 × 4', '800', '320 × 3 = 960', '421 × 2 = 842', '213', '639', '314 × 2', '628', '223 × 2', '446', '223 × 3', '669', '342 × 2', '201 × 3', '120개씩', '480', '0, 1, 2, 3', '210 × 3', '630', '121', '484', '214', '428', '어린이 도서관', '430원', '860', '16'],
  u1_l03: ['블루베리', '217개씩', '약 400', '7 × 2 = 14', '434', '132 × 4', '528', '114 × 6', '684', '106 × 8', '848', '282 × 2', '564', '328명', '984', '241 × 3', '723', '218 × 4', '121 × 7', '872', '847', '150', '900', '2□6 × 3 = 678', '142', '424', '568'],
  u1_l04: ['방울토마토', '426개씩', '약 1200', '1278', '274 × 7', '518의 5', '1918', '136 × 4', '544', '417 × 5', '2085', '359 × 7', '2513', '274', '1644', '189', '378', '곱셈판', '계산기', '242 × 6', '461 × 3', '637 × 2', '391 × 4', '129', '774', '킬로칼로리', '266', '552', '393', '약 1290'],
  u1_l05: ['미니 양배추', '30개씩', '30 × 3 = 90', '900', '파프리카', '14개씩 20봉지', '14 × 2 = 28', '14 × 10 = 140', '280', '40 × 20 = 800', '32 × 30 = 960', '73 × 40', '2920', '13개씩 30상자', '390', '80 × 30', '2400', '32개씩 40줄', '1280', '70 × 30', '2100', '12개씩 40상자', '480', '500명', '50 × 40', '2000', '22권', '1760', '곱하기 10', '23 × 40', '920'],
  u1_l06: ['당근', '7개씩', '16봉지', '약 140', '7 × 6 = 42', '7 × 10 = 70', '112', '16 × 7', '모눈종이', '3 × 48', '144', '8 × 42', '336', '5 × 64', '320', '6 × 15', '쿠키', '90', '4 × 24', '3 × 36', '108', '□ × 43 < 200', '172', '215', '수학은 내 친구', '12 × 6', '6 × 12'],
  u1_l07: ['체험 프로그램', '24명', '13개', '약 300', '4 × 3 = 12', '20 × 3 = 60', '4 × 10 = 40', '20 × 10 = 200', '24 × 3 = 72', '24 × 10 = 240', '312', '12 × 16', '192', '15 × 21', '315', '23 × 14', '322', '24 × 8 = 192', '24 + 96 + 192 = 312', '꽈배기', '224', '36원', '432', '29 × 13', '377', '61 × 14', '42 × 23', '966', '18명', '342'],
  u1_l08: ['견과류 과자', '39개', '26판', '800보다 크고 1200보다 작', '약 1000', '39 × 6 = 234', '39 × 20 = 780', '1014', '29 × 63', '1827', '73 × 24', '1752', '85 × 37', '3145', '44 × 26', '1080', '1144', '37 × 48', '1776', '63 × 45', '2835', '45명씩', '675', '2, 4, 5, 6, 8', '2064', '53 × 25', '1325', '34 × 41', '1394', '800 + 300 + 18 = 1118', '35개씩', '1715', '28개씩 46판', '1288'],
  u1_l09: ['걸리버', '31장의 20배', '620', '138장의 6배', '828', '17잔의 27배', '459', '5마리의 49배', '245', '침대', '나무', '92', '41배', '3772', '가방', '가죽', '25배', '300', '109장의 8배', '872', '8개의 35배', '280', '51장', '19배', '969', '17조각의 48배', '816', '두 자리 수만'],
  u1_l10: ['212 × 4 = 848', '307 × 3 = 921', '564 × 2 = 1128', '12 × 20 = 240', '7 × 26 = 182', '48 × 36', '1728', '45 × 30', '1350', '492 × 3', '1476', '216 × 4', '864', '80 × 70', '5600', '23 × 43', '175 × 6', '42 × 28', '322 × 3', '1000보다 큰', '191일', '1146', '페트병 16개', '336', '972원', '4860', '2, 9, 7, 5', '2425', '6 × 38 = 228', '12 × 19 = 228', '약 240', '38 cm', '1026']
};
/* 옛 보탬 표 TB(archive/neutral/gen_g3s2_math_u1.js) 18줄 — 각 줄의 핵심 수·낱말이 본류 장(extras 아님)에 있어야 한다 */
const TBA = {
  u1_l01: [['준비하기 69 × 6 ○ 50 × 8과 단원 핵심 질문', ['69 × 6', '50 × 8', '414', '400', '곱해지는 수나 곱하는 수가 큰 곱셈', '31쪽']]],
  u1_l02: [['수 카드로 314 × 2 · 223 × 2와 223 × 3', ['314 × 2', '628', '223 × 2', '446', '223 × 3', '669', '120', '480']], ['수 카드 0, 1, 2, 3 · 두 도서관의 책장', ['0, 1, 2, 3', '210 × 3', '630', '121', '214', '어린이 도서관', '16']]],
  u1_l03: [['비행기 328명 × 3대와 익힘 문제', ['328', '984', '114 × 6', '106 × 8', '282 × 2', '241 × 3', '2□6 × 3 = 678']], ['수학에 퐁당 — 줄넘기 142 × 4 고치기 · 확인 문제', ['142', '424', '568', '217 × 2']]],
  u1_l04: [['274 × 7의 5 · 영화관 · 바둑돌 어림 · 곱셈판', ['518의 5', '1644', '189', '378', '약 400', '곱셈판', '계산기']], ['익힘 — 방울토마토 617 × 5 · 반찬 3접시 열량', ['242 × 6', '391 × 4', '㉣', '129', '774', '킬로칼로리', '1656', '1179']]],
  u1_l05: [['파프리카 14 × 20 두 방법 · 곱하기 10 놀이', ['14 × 2 = 28', '14 × 10 = 140', '280', '곱하기 10']], ['익힘 — 13 × 30 · 상추 모종 · 어떤 수 · 도넛', ['13개씩 30상자', '32개씩 40줄', '1280', '70 × 30', '2100', '480', '500명']]],
  u1_l06: [['6 × 15 생활 문제 · 곱이 같아도 뜻은 달라요', ['6 × 15', '쿠키', '90', '12 × 6', '6 × 12', '49']], ['익힘 — 당근 7 × 25 · 사과 · □ × 43 < 200 · 암호', ['□ × 43 < 200', '172', '215', '수학은 내 친구']]],
  u1_l07: [['고대 이집트 곱셈법 — 2배 하기', ['24 × 8 = 192', '24 + 96 + 192 = 312', '2배', '96']], ['익힘 — 꽈배기 · 밧 · 29 × 13 어림 대화', ['꽈배기', '224', '36원', '432', '29 × 13', '377']]],
  u1_l08: [['④ 85 × 37 · 잘못 고치기 세 가지 · 어림 피드백', ['85 × 37', '3145', '1080', '1144', '1776', '2835', '800보다 크고 1200보다 작']], ['익힘 — 견과류 28 × 46 · 버스 · 수 카드 · 선 긋기', ['28', '46', '1288', '45명씩', '675', '2, 4, 5, 6, 8', '2064', '800 + 300 + 18 = 1118']]],
  u1_l09: [['대화 완성 예 — 가방과 가죽 · 익힘 사과와 닭고기', ['가방', '가죽', '25배', '300', '92 × 41 = 3772', '109', '872', '8개의 35배', '280', '17조각의 48배', '816']]],
  u1_l10: [['스스로 마무리 — 빈칸 · 계산 · 1000보다 큰 곱', ['212 × 4 = 848', '307 × 3 = 921', '564 × 2 = 1128', '48 × 36', '1728', '1000보다 큰', '1050', '1176']], ['스스로 마무리 — 학교 가는 날 · 페트병 · 캐나다 돈 · 수 카드', ['191', '1146', '16', '21', '336', '972', '4860', '97', '25', '2425', '6 × 38 = 228', '12 × 19 = 228', '240']]]
};
/* 틀린 생각 — 틀린 값은 정말 틀리고(셈과 다름), 바른 생각에 셈 값이 있다 */
const WRONG = { u1_l01: ['350', S(LM(76, 5))], u1_l02: ['16', S(LM(143, 2))], u1_l03: ['424', S(LM(217, 2))], u1_l04: ['1498', S(LM(274, 7))], u1_l05: ['28', S(LM(14, 20))], u1_l06: ['49', S(LM(7, 16))], u1_l07: ['96', S(LM(24, 13))], u1_l08: ['2735', S(LM(63, 45))], u1_l09: ['186', S(LM(138, 6))], u1_l10: ['135', S(LM(45, 30))] };
/* 선행 말 — [말, 처음 배우는 차시, 1차시 단원 도입 예고 예외] */
const FIRST = [['올림', 2], ['어림', 3], ['계산기', 4], ['10배', 5], ['모눈', 6], ['순서를 바꾸어', 6], ['한 자리 밀어', 7], ['(몇십) × (몇십)', 5, 1], ['(몇십몇) × (몇십)', 5, 1], ['(몇) × (몇십몇)', 6, 1], ['(몇십몇) × (몇십몇)', 7, 1]];

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
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && nsp(last) === nsp(EXP.adv[k]), '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++;
  return n; }
function checkLineage(Ls, k, i) { const rv = Ls[k].slides[1].data;
  if (!i) { const pe = PREV.u7_l01.slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g3_math:u7_l01' && SAME(rv.items.map(x => [x.q, x.a]), pe.map(x => [x.q, x.a])), 'l01 복습 = 1학기 u7_l01 출구'); ok(/1학기/.test(rv.title) && /곱셈/.test(rv.content) && /\(몇십몇\) × \(몇\)/.test(rv.content), 'l01 복습 글'); return; }
  const ex = Ls[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }
const dataStrings = (Ls, k, opt) => { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (opt && opt.skip && opt.skip[x]) return; walk(o[x], where + '.' + x); }); })(opt && opt.slidesOnly ? Ls[k].slides : Ls[k], k); return out; };
const notL01Review = ([, wh]) => !/^u1_l01\.slides\.1\.data\.items/.test(wh) && !/^u1_l01\.1\.data\.items/.test(wh);
const teach = (Ls, k) => JSON.stringify(Ls[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(Ls[k].extras);
function checkFirst(Ls) { KEYS.forEach((k, i) => FIRST.forEach(([t, n, ex1]) => { if (i + 1 < n && !(ex1 && i === 0)) ok(teach(Ls, k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); })); }
/* 데이터(그림 포함) 속 곱셈 — 글의 곱셈 사슬 + eqt 칸 줄 + vmul·mulrows·grid 의 a·b */
function figPairs(f) { const out = []; (function walk(g) { if (!g) return; if (g.k === 'panels') return g.items.forEach(p => walk(p.fig || p)); if (g.k === 'vmul' || g.k === 'mulrows') out.push([+g.a, +g.b]); if (g.k === 'grid') out.push([+g.w, +g.h]); if (g.k === 'eqt') (g.rows || []).forEach(r => mulPairs(r.toks.join(' ')).forEach(p => out.push(p))); })(f); return out; }
function lessonPairs(Ls, k) { const out = []; dataStrings(Ls, k).filter(notL01Review).forEach(([s, wh]) => mulPairs(s).forEach(p => out.push([p, wh]))); Ls[k].slides.forEach(s => { if (s.data.fig) figPairs(s.data.fig).forEach(p => out.push([p, k + ' ' + s.id + ' 그림'])); }); return out; }
function checkTBP(Ls) { const bad = []; let n = 0; KEYS.forEach(k => lessonPairs(Ls, k).forEach(([[a, b], wh]) => { n++; if (!ALLOWED.has(a + '×' + b)) bad.push(wh + ' ' + a + ' × ' + b); })); ok(!bad.length, '교과서 밖 곱셈 ' + bad.slice(0, 4).join(' | ')); return n; }
function checkCalcFirst(Ls) { const bad = []; KEYS.forEach((k, i) => lessonPairs(Ls, k).forEach(([[a, b], wh]) => { if (i === 0 && L01_OK.has(a + '×' + b)) return; const n = introOf(a, b); if (n > i + 1) bad.push(wh + ' ' + a + ' × ' + b + '(' + n + '차시 셈)'); })); ok(!bad.length, bad.slice(0, 4).join(' | ')); }
function checkExtras(Ls, k) { const ex = Ls[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복'); ok(!ids.some(x => /^b_l/.test(x)) && !ex.some(e => e.type === 'other_activity'), '보탬 카드(b_ · other_activity) 남음');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  Ls[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }
/* 식 — 「… = …」 사슬 · 「… > …」「… < …」 비교를 셈기로 다시 셈 */
function evI(e) { const t = String(e).replace(/[−]/g, '-').replace(/\s+/g, ''); ok(/^[\d+\-×]+$/.test(t), '식 글자 ' + e); return t.split(/(?=[+-])/).reduce((a, term) => { const sg = term[0] === '-' ? -1 : 1; const v = term.replace(/^[+-]/, '').split('×').map(Number).reduce((p, x) => LM(p, x)); return a + sg * v; }, 0); }
const chainOK = (e) => { const v = String(e).split('=').map(x => x.trim()).filter(Boolean).map(evI); return v.every(x => x === v[0]); };
const EQ = /\d[\d \t+\-−×]*=[\d \t+\-−×=]*\d/g, CMP = /(?<![\d□])(\d+(?: × \d+)?) ([<>]) (\d+(?: × \d+)?)(?![\d])/g;
function eqBad(s0, where, cnt) { const s = prep(s0), bad = []; let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const t = m[0].trim(); if (!/[+\-−×]/.test(t)) continue; cnt.n++; try { if (!chainOK(t)) bad.push(where + ' 「' + t + '」'); } catch (e) { bad.push(where + ' 못 읽음 「' + t + '」'); } }
  CMP.lastIndex = 0; while ((m = CMP.exec(s))) { cnt.c++; const a = evI(m[1]), b = evI(m[3]); if (!(m[2] === '>' ? a > b : a < b)) bad.push(where + ' 비교 「' + m[0] + '」'); } return bad; }
function checkEq(Ls) { const cnt = { n: 0, c: 0 }, bad = []; KEYS.forEach(k => dataStrings(Ls, k, { slidesOnly: true }).filter(notL01Review).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; if (/\.fig\./.test(where) && !/\.lines\.\d+$/.test(where) && !/\.rows\.\d+\.\d+$/.test(where)) return; eqBad(s, where, cnt).forEach(b => bad.push(b)); }));
  KEYS.forEach(k => Ls[k].extras.forEach(e => [e.title, e.content || '', e.description || ''].forEach(x => eqBad(x, k + ' ' + e.id, cnt).forEach(b => bad.push(b)))));
  ok(!bad.length, bad.slice(0, 5).join(' | ')); return cnt; }
/* 조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요 (마지막 숫자의 읽는 소리 받침) */
function finalOf(wd) { const d = +String(wd).slice(-1); return d === 0 ? 1 : [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; const t = String(s).replace(/\*\*/g, ''); const re = /(?<![\d,])(\d+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g; let m; while ((m = re.exec(t))) { const f = finalOf(m[1]); if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
function checkJosa(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { skip: { options: 1, fig: 1, url: 1, id: 1, img: 1, live_url: 1, source: 1 } }).filter(notL01Review).forEach(([s, wh]) => josa(s).forEach(b => bad.push(wh + ' 「' + b + '」'))); }); ok(!bad.length, bad.slice(0, 5).join(' | ')); }

/* ── 그림 검사 ── */
const flat = (f) => (f.k === 'panels' ? f.items.flatMap(p => flat(p.fig || p)) : [f]);
const nG = { vmul: 0, grid: 0, range: 0, eq: 0, eqt: 0, dtb: 0, bt: 0, mulrows: 0, ngrid: 0, tools: 0, ask: 0 };
const has = (tx, v) => nsp(tx).indexOf(nsp(v)) >= 0;
function checkFig(w0, f, prob, tx) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h);
  if (f.k === 'vmul') { nG.vmul++; const a = +f.a, b = +f.b, r = LM(a, b); const el = d.querySelector('.vm'); ok(+el.getAttribute('data-r') === r, w0 + ' 곱 ' + el.getAttribute('data-r') + ' ≠ 셈 ' + r);
    if (b >= 10 && b % 10) ok(el.getAttribute('data-p') === LM(a, b % 10) + ',' + LM(a, Math.floor(b / 10)) * 10, w0 + ' 부분 곱 ' + el.getAttribute('data-p'));
    if (prob) { ok(f.answer === false && f.parts === false && f.carry === false, w0 + ' 문제 세로셈은 답·부분 곱·올림 칸 비움'); ok(!d.querySelector('.vm-carry') && !d.querySelector('.vm-side'), w0 + ' 문제 세로셈에 올림·옆 식'); return [S(r)]; }
    ok(has(tx, S(a)) && has(tx, S(b)) && has(tx, S(r)), w0 + ' 세로셈 수 ' + a + ' × ' + b + ' = ' + r + ' 이 글에 없음'); return []; }
  if (f.k === 'mulrows') { nG.mulrows++; const a = +f.a, b = +f.b; ok(has(d.body.textContent, S(LM(a, b))), w0 + ' 곱'); ok(has(tx, S(a)) && has(tx, S(b)) && has(tx, S(LM(a, b))), w0 + ' 글'); return []; }
  if (f.k === 'bt') { nG.bt++; ok(has(tx, S(f.n)), w0 + ' 수 모형 ' + f.n + ' 이 글에 없음'); return []; }
  if (f.k === 'grid') { nG.grid++; const sw = f.sw || [f.w], sh = f.sh || [f.h]; ok(sw.reduce((a, x) => a + x, 0) === f.w && sh.reduce((a, x) => a + x, 0) === f.h, w0 + ' 가르기 합');
    const parts = []; sh.forEach(hh => sw.forEach(ww => parts.push(LM(ww, hh)))); const vs = [...d.querySelectorAll('.o-blk')].map(x => +x.getAttribute('data-v')); ok(SAME(vs, parts), w0 + ' 덩이 곱 ' + vs + ' ≠ ' + parts);
    ok(parts.reduce((a, x) => a + x, 0) === LM(f.w, f.h), w0 + ' 덩이 합 ≠ 곱'); ok(has(d.body.textContent, (parts.length > 1 ? parts.join(' + ') + ' = ' : '') + LM(f.w, f.h)), w0 + ' 합 줄');
    if (!prob) { ok(has(tx, S(f.w)) && has(tx, S(f.h)), w0 + ' 가로·세로 수'); parts.concat(LM(f.w, f.h)).forEach(v => ok(has(tx, S(v)), w0 + ' 덩이 값 ' + v + ' 이 글에 없음')); } return []; }
  if (f.k === 'range') { nG.range++; ok(f.lo < f.hi, w0 + ' 사이'); if (f.at != null) ok(d.querySelector('svg').getAttribute('data-in') === (f.at >= f.lo && f.at <= f.hi ? '1' : '0'), w0 + ' 사이 안팎'); ok(has(tx, S(f.lo)) && has(tx, S(f.hi)), w0 + ' 사이 수 글'); return []; }
  if (f.k === 'eq') { nG.eq++; f.lines.forEach(l0 => { const l = clean(l0); if (/=/.test(l) && /\d/.test(l)) ok(chainOK(prep(l)), w0 + ' 식 카드 ' + l); if (!prob) (l.match(/\d+/g) || []).forEach(x => ok(has(tx, x), w0 + ' 식 카드 수 ' + x + ' 이 글에 없음')); }); return []; }
  if (f.k === 'eqt') { nG.eqt++; const out = []; f.rows.forEach(r => { const qs = r.q || [], t = r.toks.map((x, i) => (qs.indexOf(i) >= 0 ? '?' : S(x))), line = t.join(' ');
      if (/□/.test(line)) { if (/=/.test(line)) { const [L, R] = line.split('='), m = L.match(/^(\S*□\S*) × (\d+)/); out.push(BOXEQ(m[1], +m[2], evI(R))); } else { const m = line.match(/^□ × (\d+) < (\d+)$/); ok(m, w0 + ' □ 줄'); out.push(BOXLT(+m[1], +m[2])); } return; }
      if (/=/.test(line)) { const [L, R] = line.split('=').map(x => x.trim()); if (R === '?') out.push(S(evI(L))); else ok(evI(L) === evI(R), w0 + ' 식 칸 ' + line); if (prob) ok(!(r.hi || []).length, w0 + ' 문제 식 강조'); }
      if (!prob) (line.match(/\d+/g) || []).forEach(x => ok(has(tx, x), w0 + ' 식 칸 수 ' + x + ' 이 글에 없음')); else if (!/=/.test(line)) (line.match(/\d+/g) || []).forEach(x => ok(has(tx, x), w0 + ' 식 칸 수 ' + x)); });
    return out; }
  if (f.k === 'dtb') { nG.dtb++;
    if (f.chk) { const ds = S(f.chk.a).padStart(3, '0').split('').map(Number), b = f.chk.b; ok(SAME(f.rows.map(r => r[0]), ['백 카드', '십 카드', '일 카드']), w0 + ' 카드 줄');
      if (prob) { ok(f.rows.every((r, i) => r.length === 2 && +r[1] === ds[i]), w0 + ' 문제 표는 한 줄 카드 수만'); ok(has(tx, S(f.chk.a)) && has(tx, S(b)), w0 + ' 문제 표 수'); return [S(LM(f.chk.a, b))]; }
      f.rows.forEach((r, i) => { ok(+r[1] === ds[i] && +r[2] === LM(ds[i], b), w0 + ' ' + r[0] + ' ' + r.slice(1)); });
      const tot = LM(ds[0], b) * 100 + LM(ds[1], b) * 10 + LM(ds[2], b); ok(tot === LM(f.chk.a, b), w0 + ' 카드 합 ≠ 곱'); if (!prob) ok(has(tx, S(tot)) && has(tx, S(f.chk.a)), w0 + ' 카드 합 ' + tot + ' 이 글에 없음'); return []; }
    f.rows.forEach(r => { const c = r.find(x => /^\d+ × \d+$/.test(x)); ok(c, w0 + ' 곱셈 칸 없음 ' + r); const [a, b] = c.split(' × ').map(Number), last = +S(r[r.length - 1]).match(/^\d+/)[0]; ok(last === LM(a, b), w0 + ' ' + c + ' → ' + last + ' ≠ ' + LM(a, b)); if (!prob) ok(has(tx, S(last)), w0 + ' 표 값 ' + last + ' 이 글에 없음'); }); return []; }
  if (f.k === 'ngrid') { nG.ngrid++; const all = [].concat(...f.rows).map(S);
    if (all.every(v => /^(100|10|1)$/.test(v))) { const sum = all.reduce((a, v) => a + +v, 0); if (prob) return [S(sum)]; ok(has(tx, S(sum)), w0 + ' 수 카드 합 ' + sum + ' 이 글에 없음'); return []; }
    all.forEach(v => ok(has(tx, v), w0 + ' 칸 수 ' + v + ' 이 글에 없음')); return []; }
  if (f.k === 'tools') { nG.tools++; if (prob) return []; f.items.forEach(it => ok(has(tx, it.name), w0 + ' 카드 ' + it.name + ' 이 글에 없음')); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}
const ansOf = (d) => (d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer));
const figsOf = (Ls) => { const out = []; KEYS.forEach(k => Ls[k].slides.forEach(s => { if (s.data.fig) out.push([k + ' ' + s.id, s.data.fig, s.block, s, k]); })); return out; };
function checkFigs(Ls) { figsOf(Ls).forEach(([w0, f, b, s]) => { const prob = b === 'basic_problem'; const tx = slideText(s); const ws = flat(f).flatMap(g => checkFig(w0 + ' ' + g.k, g, prob, tx)); if (prob && ws.length) { nG.ask++; const A = ansOf(s.data); ok(ws.every(x => x === A), w0 + ' 그림 빈칸 값 ' + ws + ' ≠ 답 ' + A); } }); }
function checkProbFigs(Ls) { figsOf(Ls).filter(x => x[2] === 'basic_problem').forEach(([w0, f, b, s]) => { const d = s.data, A = ansOf(d); if (nsp(d.question).indexOf(nsp(A)) >= 0) return; const txt = docOf(FIG.render(f).replace(/></g, '> <')).body.textContent; if (/^\d+$/.test(A)) ok((txt.match(/\d+/g) || []).indexOf(A) < 0, w0 + ' 그림에 정답 ' + A); else ok(nsp(txt).indexOf(nsp(A)) < 0, w0 + ' 그림에 정답 ' + A); }); }

console.log('═══ A. 로드 ═══');
T('10차시 키 u1_l01~l10 · 파일 data/g3s2_math_u1.js', () => ok(SAME(Object.keys(L0).sort(), KEYS), Object.keys(L0).join(',')));
T('meta: 3학년 2학기 수학 · 1단원 곱셈 · 성취기준 지도서 문구 · 40분 · 지도서·교과서 쪽 · theme · live_url 원문 실재 · n', () => KEYS.forEach((k, i) => { const m = L0[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 1 && m.subject === '수학' && m.unit_title === '곱셈' && m.n === i + 1, k); ok(m.std === STD_OF(i + 1), k + ' 성취기준 ' + m.std); ok(!/임시/.test(m.std), k + ' 임시'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 1단원(지도서 ' + PAGES[k] + '쪽) · ' + TBPG[k]) >= 0, k + ' 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(m.theme === '곰이·펭이 식품 안전 체험관', k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 400분', () => { KEYS.forEach(k => ok(L0[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L0[k].meta.title)); ok(KEYS.reduce((a, k) => a + L0[k].meta.duration_min, 0) === 400, '분'); });
T('slug — KT2.slugOf({g:3,s:math,t:2}) = g3s2_math · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'math', t: '2' }) === 'g3s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 vmul·grid·range·eq·bt·mulrows·eqt·ngrid·dtb·tools·panels 등록 · 렌더 깨짐 0', () => { [{ k: 'vmul', a: 217, b: 2 }, { k: 'grid', w: 24, h: 13, sh: [3, 10] }, { k: 'range', lo: 800, hi: 1200 }, { k: 'eq', lines: ['1 × 2 = 2'] }, { k: 'bt', n: 143 }, { k: 'mulrows', a: 11, b: 7 }, { k: 'eqt', rows: [{ toks: ['1', '×', '2', '=', '2'] }] }, { k: 'ngrid', rows: [['1', '2']] }, { k: 'dtb', head: ['a', 'b'], rows: [['1', '2']] }, { k: 'tools', items: [{ emoji: '📖', name: 'a', kind: 'b' }] }, { k: 'panels', items: [{ fig: { k: 'bt', n: 1 } }] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined/.test(h), f.k); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L0[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 190장 (10 × 19)', () => ok(KEYS.reduce((a, k) => a + L0[k].slides.length, 0) === 190, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 실사 자리) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 곰이·펭이', () => { const sl = L0[k].slides, hs = f => sl.some(f);
  ok(hs(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(hs(s => s.data.img), '②실사'); const mo = sl[2].data;
  ok(mo.kids && mo.kids.length === 2 && mo.kids[0].face === '🐻' && /^곰이\n"/.test(mo.kids[0].label) && mo.kids[1].face === '🐧' && /^펭이\n"/.test(mo.kids[1].label) && mo.question, '③장면·물음 + 곰이·펭이');
  ok(hs(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(hs(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(hs(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 10종 서로 다름 · 다른 덱(data 전체)과 겹침 0', () => { const im = KEYS.map(k => L0[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); let other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g\d(s\d)?_[a-z]+_u\d+\.js$/.test(f) && f !== 'g3s2_math_u1.js').forEach(f => { try { Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => { if (s.data && s.data.img) other.push(s.data.img); })); } catch (e) { /* 다른 꼴 파일 */ } }); ok(other.length >= 300, '다른 덱 실사 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침 ' + im.filter(x => other.indexOf(x) >= 0)); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '1학기 마지막 g3_math u7_l01 출구'), () => checkLineage(L0, k, i)));
T('마지막 차시 「다음 단원엔」 = 나눗셈 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L0.u1_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /나눗셈/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L0[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });
T('2단원 이음 — g3s2_math_u2 u2_l01 복습 = 이 단원 u1_l10 출구(그 생성기가 vm 으로 읽음)', () => { const U2 = load(path.join(TDIR, 'data/g3s2_math_u2.js')); const rv = U2.u2_l01.slides[1].data; ok(rv.from === 'g3s2_math:u1_l10', 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L0.u1_l10.slides[15].data.items.map(x => [x.q, x.a])), 'u2_l01 복습이 옛 출구 — gen_g3s2_math_u2 다시 돌릴 것'); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u1_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { nCheck += checkAnswers(L0, k); if (k === 'u1_l01') { const it = L0[k].slides[1].data.items; ok(it[0].a === '1021' && 724 + 297 === 1021, '되짚기 덧셈'); nCheck += it.length; } }));
T('다시 셈한 정답 = 93', () => ok(nCheck === 93, nCheck));
T('셈기 자체 확인 — 세로셈 곱 · 올림 횟수 · □ 찾기 · 수 카드 · 암호 · 틀린 답 잡음', () => { ok(LM(217, 2) === 434 && LM(274, 7) === 1918 && LM(39, 26) === 1014 && LM(972, 5) === 4860 && LM(80, 70) === 5600 && LM(7, 16) === LM(16, 7), '곱'); ok(CARRIES(143, 2) === 0 && CARRIES(217, 2) === 1 && CARRIES(132, 4) === 1 && CARRIES(426, 3) === 2 && CARRIES(274, 7) === 3, '올림 횟수'); ok(BOXEQ('2□6', 3, 678) === '2' && BOXLT(43, 200) === '4', '□'); ok(BIG2([2, 9, 7, 5]) === 97 && SMALL2([2, 9, 7, 5]) === 25 && BIG2([2, 4, 5, 6, 8]) === 86 && SMALL2([2, 4, 5, 6, 8]) === 24, '수 카드'); ok(EXP.adv.u1_l06 === '수학은내친구', '암호');
  let c = 0; [() => want({ input: 'count_input', answer: 424, note: '**424**' }, S(LM(217, 2))), () => want({ options: [{ text: '50 × 8', correct: true }, { text: '69 × 6' }] }, CMPPICK([69, 6], [50, 8])), () => want({ input: 'count_input', answer: 96, note: '**96**' }, S(LM(24, 13)))].forEach(f => { if (throws(f)) c++; }); ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
let eqCnt = { n: 0, c: 0 };
T('글 속 「… = …」 사슬 · 「… > …」「… < …」 비교 다시 셈 틀림 0 · 사슬 ≥ 60 · 비교 ≥ 8', () => { eqCnt = checkEq(L0); ok(eqCnt.n >= 60 && eqCnt.c >= 8, '사슬 ' + eqCnt.n + ' · 비교 ' + eqCnt.c); });
T('틀린 생각은 정말 틀림 — 틀린 값 ≠ 셈 · 바른 생각에 셈 값', () => KEYS.forEach(k => { const d = L0[k].slides[7].data, [bad, good] = WRONG[k]; ok(clean(d.wrong).indexOf(bad) >= 0, k + ' 틀린 생각에 「' + bad + '」 없음'); ok(clean(d.right).indexOf(good) >= 0, k + ' 바른 생각에 「' + good + '」 없음'); ok(bad !== good, k + ' 틀린 값 = 셈'); }));
T('식 검산기 자체 확인(틀린 식·비교 잡음 · 맞는 식 통과 · □ 식은 건너뜀)', () => { const c = { n: 0, c: 0 }; ok(eqBad('217 × 2 = 424', 'p', c).length === 1 && eqBad('24 × 13 = 72 + 24 = 96', 'p', c).length === 1 && eqBad('854 > 966', 'p', c).length === 1, '못 잡음'); ok(!eqBad('24 × 13 = 72 + 240 = 312 · 69 × 6 > 50 × 8 · 2□6 × 3 = 678 · 100 − 30 = 70', 'p', c).length, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const FIGS = figsOf(L0);
T('그림 ' + FIGS.length + '개 — 세로셈 곱·부분 곱 · 모눈 덩이 · 어림 사이 · 식 카드 · 식 칸 · 표 · 수 카드 합 = 게이트 셈·글 · 문제 그림 빈칸 = 답', () => checkFigs(L0));
T('문제 그림이 답을 보이지 않음 — 그림 글자의 수 토막·글자에 정답 0(물음 글에 이미 있는 답 빼고)', () => checkProbFigs(L0));
T('개념 40장 · 기본 문제 30장 모두 그림 · vmul ≥ 20 · grid ≥ 4 · 문제 그림 빈칸 대조 ≥ 20', () => { let c = 0, p = 0; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 40 && p === 30, c + '/' + p); ok(nG.vmul >= 20 && nG.grid >= 4 && nG.ask >= 20 && nG.dtb >= 4 && nG.range >= 1, JSON.stringify(nG)); });
T('그림 검사기 자체 확인 — 세로셈 곱·문제 세로셈 올림 칸·모눈 덩이·수 카드 표·식 칸·필요한 양 표 잡음', () => { let c = 0; const tr = (f, prob, tx) => { if (throws(() => checkFig('probe', f, prob, tx))) c++; };
  const R0 = FIG.render; FIG.render = (f) => R0(f).replace('data-r="434"', 'data-r="424"'); tr({ k: 'vmul', a: 217, b: 2 }, false, '217 2 434'); FIG.render = R0;
  tr({ k: 'vmul', a: 114, b: 6, answer: false, parts: false }, true, '');
  tr({ k: 'grid', w: 24, h: 13, sw: [4, 20], sh: [3, 9] }, false, '24 13 12 60 40 200 312');
  tr({ k: 'dtb', head: ['', '', ''], rows: [['백 카드', '2', '4'], ['십 카드', '1', '2'], ['일 카드', '7', '12']], chk: { a: 217, b: 2 } }, false, '217 434');
  tr({ k: 'eqt', rows: [{ toks: ['30', '×', '30', '=', '9000'] }] }, false, '30 9000');
  tr({ k: 'dtb', head: ['', '', ''], rows: [['천', '138 × 6', '688장']] }, false, '138 6 688');
  ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 · 교과서 곱셈 목록 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 그림 = fig json · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k], F = FIGJ[k];
  L0[k].slides.filter(s => s.block === 'concept').forEach((s, i) => { ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'); ok(SAME(s.data.fig, F.slides[i]), s.id + ' 그림 명세'); });
  L0[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.fig, F.problems[i]), s.id + ' 그림 명세'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  ok(src.tb === TBPG[k] && src.guide === '지도서 ' + PAGES[k] + '쪽', 'src 쪽'); const nx = L0[k].slides[18].data; if (k !== 'u1_l10') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => { const all = nsp(JSON.stringify(L0[k])); const miss = TB[k].filter(t => all.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l02 에 「7 × 16」 · l07 에 「143 × 2」 · l03 에 「모눈」 없음)', () => { ok(nsp(JSON.stringify(L0.u1_l02)).indexOf(nsp('7 × 16')) < 0, 'l02'); ok(nsp(JSON.stringify(L0.u1_l07)).indexOf(nsp('143 × 2')) < 0, 'l07'); ok(JSON.stringify(L0.u1_l03).indexOf('모눈') < 0, 'l03'); });
const TBA_N = Object.values(TBA).reduce((a, x) => a + x.length, 0);
T('보탬 흡수 대조 — 옛 TB ' + TBA_N + '줄(보관본에 실재)의 핵심 수·낱말이 그 차시 본류 장(extras 아님)에 · b_ id 0', () => { const old = fs.readFileSync(path.join(TDIR, 'archive/neutral/gen_g3s2_math_u1.js'), 'utf8'); ok(TBA_N === 18, 'TB 줄 ' + TBA_N); Object.keys(TBA).forEach(k => { const main = nsp(JSON.stringify(L0[k].slides)); TBA[k].forEach(([title, toks]) => { ok(old.indexOf("['" + title + "'") >= 0, '보관본에 TB 줄 없음 ' + title); const miss = toks.filter(t => main.indexOf(nsp(t)) < 0); ok(!miss.length, k + ' 「' + title + '」 본류에 없음 ' + miss.join(' / ')); }); }); ok(!/"id":"b_l/.test(fs.readFileSync(path.join(TDIR, 'data/g3s2_math_u1.js'), 'utf8')), 'b_ id'); });
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L0[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 차시마다 file = g3_math_u1_lNN_….html · 원문 파일 실재(투영 지도)', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g3_math_u1_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade3/semester2/math/1단원_곱셈', f)), k + ' 원문 없음'); }));
let nTBP = 0;
T('교과서 곱셈 목록 대조 — 데이터·그림 속 곱셈식이 모두 교과서·익힘·지도서 곱셈(gen_tb.py TBP)이나 그 부분 곱 · ≥ 400', () => { nTBP = checkTBP(L0); ok(nTBP >= 400, '곱셈 ' + nTBP); });
T('교과서 곱셈 목록 자체 확인 — 부분 곱은 허용 · 목록 밖은 잡음', () => { ok(ALLOWED.has('40×2') && ALLOWED.has('20×10') && ALLOWED.has('39×20') && ALLOWED.has('28×10'), '부분 곱'); ok(!ALLOWED.has('35×5') && !ALLOWED.has('17×23'), '목록 밖'); ok(SAME(mulPairs('14 × 2 × 10 = 280 · 2□6 × 3'), [[14, 2], [28, 10]]), '사슬·□'); });

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
T('지도서 유의 사항이 교사 층에 — 올림 없는→한 번→여러 번 · 어림(까닭·옳다/그르다 금지) · 자리 맞추기 · 올림 안 더함 · 부분 곱 · 10배·두 방법 · 상황은 달라요 · 두 자리 수만 · 계산기 · 올림 표기 자율', () => { const tx = (k) => JSON.stringify(L0[k]); const mi = (k) => L0[k].slides[7].data;
  ok(/올림이 없는/.test(L0.u1_l02.meta.lesson_format) && /올림이 한 번/.test(L0.u1_l03.meta.lesson_format) && /올림이 여러 번/.test(L0.u1_l04.meta.lesson_format) && /올림이 한 번/.test(L0.u1_l07.meta.lesson_format) && /올림이 여러 번/.test(L0.u1_l08.meta.lesson_format), '올림 차례');
  ok(/16/.test(mi('u1_l02').wrong) && /지도서 168/.test(mi('u1_l02').hint), 'l02 143 × 2 = 16'); ok(/424/.test(mi('u1_l03').wrong) && /지도서 172/.test(mi('u1_l03').hint) && /정확한 자리/.test(tx('u1_l03')) && /학생 자율/.test(tx('u1_l03')), 'l03 올림 안 더함·표시 자리·자율');
  ok(/어림한 까닭/.test(tx('u1_l03')) && /잊지 않고/.test(tx('u1_l04')) && /1290/.test(tx('u1_l04')) && /계산기/.test(tx('u1_l04')) && /확인용/.test(tx('u1_l04')), 'l03·l04 어림·계산기');
  ok(/10배를 하는 방법에 중점/.test(tx('u1_l05')) && /두 가지 방법을 모두/.test(tx('u1_l05')) && /28/.test(mi('u1_l05').wrong), 'l05 10배·두 방법'); ok(/상황은 달라요|뜻이 달라요/.test(tx('u1_l06')) && /12 × 6/.test(tx('u1_l06')) && /49/.test(mi('u1_l06').wrong), 'l06 상황·49');
  ok(/96/.test(mi('u1_l07').wrong) && /한 자리 밀어/.test(mi('u1_l07').right) && /4 × 3 = 12/.test(tx('u1_l07')) && /20 × 10 = 200/.test(tx('u1_l07')) && /부분 곱/.test(tx('u1_l07')), 'l07 자리 맞추기·부분 곱'); ok(/옳다, 그르다/.test(tx('u1_l08')) && /2735/.test(mi('u1_l08').wrong) && /구분해 표시/.test(tx('u1_l08')), 'l08 어림 피드백·올림');
  ok(/두 자리 수만/.test(tx('u1_l09')) && /31/.test(mi('u1_l09').wrong), 'l09 두 자리 수만·31'); ok(/31쪽/.test(tx('u1_l01')) && /쪽수/.test(tx('u1_l10')), 'l01·l10 핵심 질문·쪽수');
  [3, 4, 6, 7, 8].forEach(n => { const k = KEYS[n - 1]; ok(L0[k].slides.slice(3, 7).some(s => /어림한 값/.test(s.data.content) && /적절해요/.test(s.data.content)), k + ' 어림한 값과 계산한 값 비교'); }); });

console.log('═══ L. 선행 ═══');
T('처음 배우는 차시 전에는 그 말 0 (올림 2 · 어림 3 · 계산기 4 · 10배 5 · 모눈·순서를 바꾸어 6 · 한 자리 밀어 7 · 갈래 이름 5·6·7 — 1차시 예고 예외)', () => checkFirst(L0));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(L0, KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));
T('셈 선행 0 — 올림 있는 (세 자리 수) × (한 자리 수) 3 · 여러 번 4 · 두 자리 곱하는 수 5~7 차례 앞에 그 셈 없음(1차시 장면 6 × 38 · 12 × 19 예외)', () => checkCalcFirst(L0));
T('셈 선행 자체 확인 — 2차시는 올림 0 · 3차시에 올림 한 번 있음 · 4차시에 여러 번 있음', () => { ok(lessonPairs(L0, 'u1_l02').every(([[a, b]]) => introOf(a, b) <= 2), 'l02'); ok(lessonPairs(L0, 'u1_l03').some(([[a, b]]) => introOf(a, b) === 3), 'l03'); ok(lessonPairs(L0, 'u1_l04').some(([[a, b]]) => introOf(a, b) === 4), 'l04'); ok(introOf(24, 13) === 7 && introOf(7, 16) === 6 && introOf(14, 20) === 5 && introOf(426, 3) === 4, 'introOf'); });

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 · 조사 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 · 교과서 속 다른 인물 이름(채원·서준·건우·도윤·지유) 0', () => { const all = JSON.stringify(L0); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』', '채원', '서준', '건우', '도윤', '지유'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => FIGS.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면(렌더 글자)에 영어 코드(u1 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~D)와 단위 cm 만', () => KEYS.forEach(k => L0[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L0[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); const wds = (txt.match(/[A-Za-z]+/g) || []).filter(x => !/^[A-D]$/.test(x) && x !== 'cm'); ok(!wds.length, k + ' ' + s.id + ' 영어 낱말 「' + wds.join(',') + '」'); }))));
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L0[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
T('조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요가 읽는 소리 받침에 맞음', () => checkJosa(L0));
T('조사 검사기 자체 확인', () => { ok(josa('434예요').length === 0 && josa('434이에요').length === 1 && josa('286이에요').length === 0 && josa('1014예요').length === 0 && josa('2835이에요').length === 1 && josa('217을').length === 0 && josa('24을').length === 1 && josa('6 × 38과').length === 0, '조사'); });

console.log('  · 숫자 — 다시 셈 ' + nCheck + ' · 식 사슬 ' + eqCnt.n + ' · 비교 ' + eqCnt.c + ' · 교과서 곱셈 대조 ' + nTBP + ' · 그림 ' + FIGS.length + ' ' + JSON.stringify(nG));
console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 잡는지 ═══');
const RED = [
  ['출구 답을 틀리게(l04 426 × 3 → 「1178」)', (B) => { B.u1_l04.slides[15].data.items[0].a = '1178'; }, (B) => checkAnswers(B, 'u1_l04')],
  ['선행 말을 앞 차시에(l02 개념에 「어림하면」)', (B) => { B.u1_l02.slides[4].data.content += ' 어림하면 약 300이에요.'; }, (B) => checkFirst(B)],
  ['보탬 카드를 되살림(l03 extras 에 b_l3_1)', (B) => { B.u1_l03.extras[21] = { id: 'b_l3_1', type: 'other_activity', icon: '📗', title: '교과서 활동 — 비행기', content: '…', fit_slides: ['concept'] }; }, (B) => checkExtras(B, 'u1_l03')],
  ['복습 계보를 끊음(l06 복습 첫 답)', (B) => { B.u1_l06.slides[1].data.items[0].a = '901'; }, (B) => checkLineage(B, 'u1_l06', 5)],
  ['교과서 밖 곱셈(l05 개념에 「17 × 23 = 391」)', (B) => { B.u1_l05.slides[5].data.content += ' 17 × 23 = 391이에요.'; }, (B) => checkTBP(B)],
  ['셈 선행(l02 기본 문제 풀이에 올림 있는 217 × 2)', (B) => { B.u1_l02.slides[8].data.note = '217 × 2도 같아요. ' + B.u1_l02.slides[8].data.note; }, (B) => checkCalcFirst(B)],
  ['조사 틀림(l03 「434예요」 → 「434이에요」)', (B) => { B.u1_l03.slides[4].data.content = B.u1_l03.slides[4].data.content.replace('434예요', '434이에요'); }, (B) => checkJosa(B)],
  ['식 사슬 틀림(l07 개념 「72 + 240 = 312」 → 「72 + 24 = 312」)', (B) => { B.u1_l07.slides[5].data.content = B.u1_l07.slides[5].data.content.replace('72 + 240 = 312', '72 + 24 = 312'); }, (B) => checkEq(B)],
  ['문제 그림이 답을 보임(l02 기본 ① 세로셈 답 칸 열기)', (B) => { delete B.u1_l02.slides[8].data.fig.answer; delete B.u1_l02.slides[8].data.fig.parts; }, (B) => { checkProbFigs(B); checkFigs(B); }]
];
RED.forEach(([name, broke, chk]) => T('레드 — ' + name + ' → 잡힘 · 원본은 통과', () => { ok(!throws(() => chk(L0)), '원본이 걸림'); const B = clone(L0); broke(B); ok(throws(() => chk(B)), '못 잡음'); }));
T('역검증 9종', () => ok(RED.length >= 9, RED.length));

console.log('\n게이트 g3s2 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
