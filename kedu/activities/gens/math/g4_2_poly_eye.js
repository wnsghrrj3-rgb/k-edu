/* gens/math/g4_2_poly_eye.js — 다각형 탐정 (4학년 2학기 수학 4단원 「다각형」 l02~l05 · l09 마무리) — 교과서판 2학기 대표 활동
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기(duel_quiz · stream).
 *
 * params: { upto: 'l02'|'l03'|'l04'|'l05'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반. 'all' = l09 마무리(고르게).
 *
 * 그림은 모두 교과서·『수학익힘』·지도서의 도형이다(조건 — 변 수·곡선·열림·같은 변/각 표시·그은 선 — 을 120×100 판에 새로 그림).
 * 정답은 판의 좌표에서 다시 셀 수 있다(스모크가 따로 셈): 둘러싸임·곡선 · 변 수 · 변 길이와 각 크기 · 그은 선의 끝점과 이웃 · n(n−3)÷2.
 *
 * type (§21-3 · 교과서 차시 그대로 — D22):
 *   poly_yes  l02  다각형일까? — 『수학』 86 ①·87 ③ · 익힘 54 · 100 1 (다각형이에요 / 곡선이 섞였어요 / 곡선으로만 둘러쌈 / 열려 있어요)
 *   name_n    l03  변을 세어 이름 — 『수학』 88 ⑤·89 ⑦ · 익힘 55 ③⑤ (오각형~팔각형)
 *   regular   l04  정다각형일까? — 『수학』 90 ①·91 · 익힘 56 · 지도서 328 (정다각형 / 변만 같아요 / 각만 같아요 / 둘 다 아니에요)
 *   diag_ok   l05  그은 선이 대각선일까? — 『수학』 93 ③ · 익힘 58 ①·59 퐁당 (대각선이에요 / 변이에요 / 곡선이에요 / 꼭짓점이 아니에요)
 *   diag_cnt  l05  대각선은 모두 몇 개? — 『수학』 92 ②·93 ④ · 익힘 59 ⑤⑥ (0·2·2·5·9 · 팔각형 한 꼭짓점 5)
 *
 * ★ 오답 선택지 = 지도서·교과서가 실명으로 적은 오류(학습지 오개념과 같은 축):
 *   다각형 오류 1 「선분이 있으면 다각형」(X01) — 곡선 섞인·열린 도형에 「다각형이에요」 · 변 셈 하나 어긋남(X04, 지도서 336 노력 요함 예시)
 *   정다각형 오류 1 「변만(각만) 같아도」(X07·X08) · 오류 2 「이등변삼각형도」(X21) · 대각선: 곡선으로 이음(93 ③ 가 · X24) · 변의 중간(93 ③ 나 · X12)
 *   · 이웃한 꼭짓점(변 · X11) · 대각선 수 「한 꼭짓점에서만」 n−3 · 「두 번 셈」 n(n−3) · 지도서 344 보통 예시 오각형 4 · 노력 요함 2(X13)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_poly_eye'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l02', 'l03', 'l04', 'l05'];
  var POOL = { l02: ['poly_yes'], l03: ['name_n'], l04: ['regular'], l05: ['diag_ok', 'diag_cnt'] };
  var TYPES = ['poly_yes', 'name_n', 'regular', 'diag_ok', 'diag_cnt'];
  var TAG = { poly_yes: '다각형일까?', name_n: '변을 세어 이름', regular: '정다각형일까?', diag_ok: '대각선일까?', diag_cnt: '대각선은 몇 개?' };
  var OPT = {
    poly_yes: ['다각형이에요', '곡선이 섞였어요', '곡선으로만 둘러쌈', '열려 있어요'],
    name_n: ['오각형', '육각형', '칠각형', '팔각형'],
    regular: ['정다각형', '변만 같아요', '각만 같아요', '둘 다 아니에요'],
    diag_ok: ['대각선이에요', '변이에요', '곡선이에요', '꼭짓점이 아니에요']
  };
  var NAME = { 3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형', 7: '칠각형', 8: '팔각형' };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function r1(v) { return Math.round(v * 10) / 10; }
  /* 판 좌표: 120 × 100. 점 = [x, y] (y 아래로) */
  function ell(angs, rx, ry, cx, cy) { return angs.map(function (a) { var t = a * Math.PI / 180; return [r1((cx || 60) + (rx || 50) * Math.cos(t)), r1((cy || 50) - (ry || 40) * Math.sin(t))]; }); }
  function reg(n, r, cx, cy) { var a0 = Math.PI / 2 - Math.PI / n, out = []; for (var i = 0; i < n; i++) { var t = a0 + 2 * Math.PI * i / n; out.push([r1((cx || 60) + (r || 44) * Math.cos(t)), r1((cy || 52) + (r || 44) * Math.sin(t))]); } return out; }

  /* ── 교과서 도형 표 (그림 = 선분 L · 곡선 Q[시작, 끝, 조절점] · 원 C · 길쭉한 원 E · 다각형 P) ── */
  var T = {
    poly_yes: [
      { src: '『수학』 86 ① 가', fig: { L: [[[16, 92], [104, 92]]], Q: [[[16, 92], [104, 92], [60, -60]]] }, k: 'mix' },
      { src: '『수학』 86 ① 나', fig: { P: [[12, 16], [108, 32], [108, 76], [12, 88]] }, k: 'poly' },
      { src: '『수학』 86 ① 다', fig: { L: [[[6, 20], [28, 80]], [[114, 20], [92, 80]]], Q: [[[6, 20], [114, 20], [60, 52]], [[28, 80], [92, 80], [60, 108]]] }, k: 'mix' },
      { src: '『수학』 86 ① 라', fig: { C: [[60, 50, 42]] }, k: 'round' },
      { src: '『수학』 86 ① 마', fig: { P: [[60, 8], [88, 92], [32, 92]] }, k: 'poly' },
      { src: '『수학』 86 ① 바', fig: { P: [[10, 46], [60, 8], [110, 46], [110, 92], [10, 92]] }, k: 'poly' },
      { src: '『수학』 87 ③ 가', fig: { P: [[32, 16], [112, 16], [88, 84], [8, 84]] }, k: 'poly' },
      { src: '『수학』 87 ③ 나', fig: { E: [[60, 50, 48, 32]] }, k: 'round' },
      { src: '『수학』 87 ③ 다', fig: { P: [[40, 12], [108, 12], [108, 88], [12, 88], [12, 40]] }, k: 'poly' },
      { src: '『수학』 87 ③ 라', fig: { L: [[[60, 10], [8, 94]], [[28, 90], [108, 90]], [[108, 90], [60, 10]]] }, k: 'open' },
      { src: '『수학』 87 ③ 바', fig: { L: [[[16, 10], [16, 90]], [[16, 90], [96, 90]]], Q: [[[16, 10], [96, 90], [96, 10]]] }, k: 'mix' },
      { src: '『수학익힘』 54 나', fig: { L: [[[12, 20], [108, 20]]], Q: [[[12, 20], [108, 20], [60, 120]]] }, k: 'mix' },
      { src: '『수학익힘』 54 라', fig: { L: [[[10, 92], [36, 10]], [[36, 10], [110, 10]], [[110, 10], [84, 90]], [[84, 90], [48, 90]]] }, k: 'open' },
      { src: '『수학익힘』 54 마', fig: { L: [[[20, 20], [20, 80]], [[100, 20], [100, 80]]], Q: [[[20, 20], [100, 20], [60, 44]], [[20, 80], [100, 80], [60, 108]]] }, k: 'mix' },
      { src: '『수학익힘』 54 다', fig: { P: reg(7, 44) }, k: 'poly' },
      { src: '『수학』 100 1 ㉯', fig: { L: [[[16, 16], [64, 16]], [[16, 16], [16, 84]], [[16, 84], [64, 84]]], Q: [[[64, 16], [64, 84], [120, 50]]] }, k: 'mix' },
      { src: '『수학』 100 1 ㉰', fig: { L: [[[16, 16], [40, 84]], [[40, 84], [80, 84]], [[80, 84], [104, 16]]] }, k: 'open' },
      { src: '『수학』 100 1 ㉮', fig: { P: [[10, 20], [72, 20], [110, 50], [72, 80], [10, 80]] }, k: 'poly' }
    ],
    name_n: [
      { src: '『수학』 88 ⑤ 가', fig: { P: ell([10, 90, 170, 235, 305]) }, n: 5 },
      { src: '『수학』 88 ⑤ 나', fig: { P: ell([0, 40, 95, 135, 180, 220, 270, 315]) }, n: 8 },
      { src: '『수학』 88 ⑤ 다', fig: { P: ell([20, 80, 160, 200, 260, 330]) }, n: 6 },
      { src: '『수학』 88 ⑤ 라', fig: { P: ell([0, 50, 100, 150, 200, 255, 305]) }, n: 7 },
      { src: '『수학』 88 ⑤ 마', fig: { P: ell([15, 60, 100, 150, 190, 240, 280, 330]) }, n: 8 },
      { src: '『수학』 88 ⑤ 바', fig: { P: ell([0, 70, 120, 180, 240, 300]) }, n: 6 },
      { src: '『수학』 88 ⑤ 사', fig: { P: ell([25, 75, 130, 180, 220, 270, 320]) }, n: 7 },
      { src: '『수학』 89 ⑦ 왼쪽', fig: { P: ell([10, 65, 115, 165, 215, 270, 320], 52, 42) }, n: 7 },
      { src: '『수학』 89 ⑦ 오른쪽', fig: { P: ell([20, 60, 120, 160, 200, 240, 300, 340], 54, 36) }, n: 8 },
      { src: '『수학익힘』 55 ⑤ 어린이 보호 표지판', fig: { P: [[60, 8], [108, 44], [108, 92], [12, 92], [12, 44]] }, n: 5 },
      { src: '『수학익힘』 55 ⑤ 정지 표지판', fig: { P: reg(8, 44) }, n: 8 },
      { src: '『수학익힘』 54 가', fig: { P: ell([10, 90, 150, 200, 250, 320]) }, n: 6 }
    ],
    regular: [   // t = 변 표시(같은 수 = 같은 길이) · a = 각 표시(같은 수 = 같은 크기, 'r' = 직각)
      { src: '『수학』 90 ① 가 — 그릇', fig: { P: [[24, 14], [96, 14], [96, 86], [24, 86]], t: [1, 1, 1, 1], a: ['r', 'r', 'r', 'r'] } },
      { src: '『수학』 90 ① 나 — 그릇', fig: { P: reg(8, 46), t: [1, 1, 1, 1, 1, 1, 1, 1], a: [1, 1, 1, 1, 1, 1, 1, 1] } },
      { src: '『수학』 90 ① 다 — 그릇', fig: { P: [[8, 50], [60, 20], [112, 50], [60, 80]], t: [1, 1, 1, 1], a: [1, 2, 1, 2] } },
      { src: '『수학』 90 ① 라 — 그릇', fig: { P: reg(6, 46), t: [1, 1, 1, 1, 1, 1], a: [1, 1, 1, 1, 1, 1] } },
      { src: '『수학』 90 ① 마 — 그릇', fig: { P: [[32, 8], [88, 8], [88, 92], [32, 92]], t: [1, 2, 1, 2], a: ['r', 'r', 'r', 'r'] } },
      { src: '『수학익힘』 56쪽 가 — 그릇', fig: { P: [[12, 20], [108, 20], [108, 80], [12, 80]], t: [1, 2, 1, 2], a: ['r', 'r', 'r', 'r'] } },
      { src: '『수학』 91 정삼각형', fig: { P: reg(3, 50, 60, 60), t: [1, 1, 1], a: [1, 1, 1] } },
      { src: '『수학』 91 정오각형(단추)', fig: { P: reg(5, 46), t: [1, 1, 1, 1, 1], a: [1, 1, 1, 1, 1] } },
      { src: '지도서 328 이등변삼각형', fig: { P: [[60, 6], [92, 94], [28, 94]], t: [1, 2, 1], a: [2, 1, 1] } }
    ],
    diag_ok: [   // P = 다각형 · M = 그은 선(곡선이면 Q 꼴 3점) · pts = 변 위의 점
      { src: '『수학』 93 ③ 가', fig: { P: [[28, 18], [92, 18], [112, 84], [8, 84]], MQ: [[28, 18], [112, 84], [32, 80]] } },
      { src: '『수학』 93 ③ 나', fig: { P: [[60, 10], [106, 90], [14, 90]], M: [[60, 10], [60, 90]] } },
      { src: '『수학』 93 ③ 다', fig: { P: [[12, 16], [72, 16], [108, 50], [72, 84], [12, 84]], M: [[12, 84], [72, 16]] } },
      { src: '『수학익힘』 58 ① 선분 ㄱㄷ', fig: { P: [[78, 10], [42, 10], [18, 50], [42, 90], [78, 90], [102, 50]], M: [[78, 10], [18, 50]], dot: [66, 90], names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'], dotName: 'ㅅ' } },
      { src: '『수학익힘』 58 ① 선분 ㄱㅅ', fig: { P: [[78, 10], [42, 10], [18, 50], [42, 90], [78, 90], [102, 50]], M: [[78, 10], [66, 90]], dot: [66, 90], names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'], dotName: 'ㅅ' } },
      { src: '『수학익힘』 58 ① 선분 ㄱㅁ', fig: { P: [[78, 10], [42, 10], [18, 50], [42, 90], [78, 90], [102, 50]], M: [[78, 10], [78, 90]], dot: [66, 90], names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'], dotName: 'ㅅ' } },
      { src: '『수학익힘』 58 ① 선분 ㄱㅂ', fig: { P: [[78, 10], [42, 10], [18, 50], [42, 90], [78, 90], [102, 50]], M: [[78, 10], [102, 50]], dot: [66, 90], names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'], dotName: 'ㅅ' } },
      { src: '『수학익힘』 59 수학에 퐁당 — 친구의 답', fig: { P: [[12, 16], [72, 16], [108, 50], [72, 84], [12, 84]], M: [[12, 16], [90, 67]] } },
      { src: '『수학』 92 ① 조각보 선분 ㄱㄷ', fig: { P: [[16, 12], [16, 88], [92, 88], [92, 12]], M: [[16, 12], [92, 88]], names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'] } }
    ],
    diag_cnt: [   // one = 한 꼭짓점에서만 묻기
      { src: '『수학』 92 ② 삼각형', fig: { P: [[60, 10], [106, 90], [14, 90]] }, book: 0 },
      { src: '『수학』 92 ② 직사각형', fig: { P: [[12, 18], [108, 18], [108, 82], [12, 82]] }, book: 2 },
      { src: '『수학』 92 ② 마름모', fig: { P: [[60, 6], [108, 50], [60, 94], [12, 50]] }, book: 2 },
      { src: '『수학』 92 ② 오각형', fig: { P: reg(5, 46) }, book: 5 },
      { src: '『수학』 93 ④ 육각형', fig: { P: reg(6, 46) }, book: 9 },
      { src: '『수학익힘』 59 ⑥ 평행사변형', fig: { P: [[32, 20], [112, 20], [88, 80], [8, 80]] }, book: 2 },
      { src: '『수학익힘』 59 ⑥ 사다리꼴', fig: { P: [[28, 18], [92, 18], [112, 84], [8, 84]] }, book: 2 },
      { src: '『수학익힘』 59 ⑤ 팔각형 꼭짓점 ㄱ', fig: { P: [[60, 6], [90, 18], [104, 50], [90, 82], [60, 94], [30, 82], [16, 50], [30, 18]], v: 0, names: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'] }, one: true, book: 5 }
    ]
  };

  /* ── 판에서 셈 ── */
  function isConvex(P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length], c = P[(i + 2) % P.length]; var cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(cr) < 1e-9) return false; if (s === 0) s = cr > 0 ? 1 : -1; else if ((cr > 0 ? 1 : -1) !== s) return false; } return true; }
  function sides(P) { return P.map(function (a, i) { var b = P[(i + 1) % P.length]; return Math.hypot(b[0] - a[0], b[1] - a[1]); }); }
  function angles(P) { return P.map(function (b, i) { var a = P[(i + P.length - 1) % P.length], c = P[(i + 1) % P.length]; var u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]]; return Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(u[0], u[1]) / Math.hypot(v[0], v[1])) * 180 / Math.PI; }); }
  function allSame(xs, tol) { return Math.max.apply(null, xs) - Math.min.apply(null, xs) < tol; }
  function regClass(P) { var s = allSame(sides(P), 1.2), a = allSame(angles(P), 1.5); return s && a ? 0 : s ? 1 : a ? 2 : 3; }   // OPT.regular 차례
  function near(p, q) { return Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.6; }
  function vIdx(P, p) { for (var i = 0; i < P.length; i++) if (near(P[i], p)) return i; return -1; }
  function diagClass(f) {
    if (f.MQ) return 2;                                   // 곡선
    var i = vIdx(f.P, f.M[0]), j = vIdx(f.P, f.M[1]), n = f.P.length;
    if (i < 0 || j < 0) return 3;                         // 한 끝이 꼭짓점이 아님
    return ((i - j + n) % n === 1 || (j - i + n) % n === 1) ? 1 : 0;
  }
  function nd(n) { return n * (n - 3) / 2; }

  function buildNum(ans, wrongs, rng) {
    var opts = [String(ans)];
    wrongs.forEach(function (x) { if (x == null || x < 0) return; var s = String(x); if (opts.indexOf(s) < 0 && opts.length < 4) opts.push(s); });
    var c = 0; while (opts.length < 4) { if (opts.indexOf(String(c)) < 0) opts.push(String(c)); c++; }
    return shuffle(rng, opts);
  }

  function make(type, rng) {
    var row = pick(rng, T[type]), f = row.fig, q = { type: type, src: row.src, fig: f, tag: TAG[type] };
    if (type === 'poly_yes') {
      var k = row.k, idx = { poly: 0, mix: 1, round: 2, open: 3 }[k];
      q.prompt = row.src + ' — 이 도형은 다각형일까요?';
      q.answer = OPT.poly_yes[idx]; q.options = OPT.poly_yes.slice();
      q.parts = [k === 'poly' ? '선분으로만 둘러싸여 있어요' : k === 'mix' ? '곡선이 포함되어 있어요' : k === 'round' ? '곡선으로 둘러싸여 있어요' : '선분으로 둘러싸여 있지 않고 열려 있어요',
                 k === 'poly' ? '다각형이에요(변 ' + f.P.length + '개)' : '다각형이 아니에요'];
      q.explain = '다각형은 선분으로만 둘러싸인 도형이에요. 선분이 있어도 곡선이 섞이거나 열려 있으면 다각형이 아니에요.';
    } else if (type === 'name_n') {
      var n = f.P.length;
      q.prompt = row.src + ' — 변을 세어 이 다각형의 이름을 고르세요.';
      q.answer = NAME[n]; q.options = OPT.name_n.slice(); q.n = n;
      q.parts = ['변 ' + n + '개 · 꼭짓점 ' + n + '개', '변이 ' + n + '개이면 ' + NAME[n]];
      q.explain = '한 꼭짓점에서 시작해 표시하며 변을 세요. 다각형의 이름은 변의 수로 정해요.';
    } else if (type === 'regular') {
      var c = regClass(f.P);
      q.prompt = row.src + ' — 같은 표시는 길이·크기가 같아요. 이 도형은 정다각형일까요?';
      q.answer = OPT.regular[c]; q.options = OPT.regular.slice(); q.cls = c;
      q.parts = [['변의 길이가 모두 같아요', '변의 길이가 모두 같아요', '길이가 다른 변이 있어요', '길이가 다른 변이 있어요'][c],
                 ['각의 크기가 모두 같아요', '크기가 다른 각이 있어요', '각의 크기가 모두 같아요', '크기가 다른 각이 있어요'][c],
                 c === 0 ? '둘 다 같으니 정다각형' : '정다각형이 아니에요'];
      q.explain = '정다각형은 변의 길이가 모두 같고 각의 크기도 모두 같은 다각형이에요. 하나만 같거나 일부만 같으면 정다각형이 아니에요.';
    } else if (type === 'diag_ok') {
      var d = diagClass(f);
      q.prompt = row.src + ' — 빨간 선은 대각선일까요?';
      q.answer = OPT.diag_ok[d]; q.options = OPT.diag_ok.slice(); q.cls = d;
      q.parts = [['서로 이웃하지 않는 두 꼭짓점을 이은 선분', '이웃한 두 꼭짓점을 이은 선분 — 변', '두 꼭짓점을 이었지만 선분이 아님', '한 끝이 꼭짓점이 아님'][d],
                 d === 0 ? '대각선이에요' : '대각선이 아니에요'];
      q.explain = '대각선은 서로 이웃하지 않는 두 꼭짓점을 이은 선분이에요. 곡선이거나, 한 끝이 꼭짓점이 아니거나, 이웃한 꼭짓점끼리면 대각선이 아니에요.';
    } else {
      var m = f.P.length, ans = row.one ? m - 3 : nd(m);
      q.n = m; q.one = !!row.one; q.ans = ans;
      q.prompt = row.src + (row.one ? ' — 꼭짓점 ㄱ에서 그을 수 있는 대각선은 몇 개일까요?' : ' — 대각선을 모두 그으면 몇 개일까요?');
      var w = row.one ? [nd(m), m - 1, m] : [m - 3, m * (m - 3), m, ans - 1];   // 전체를 셈 · 이웃까지 · 변의 수 / 한 꼭짓점에서만 · 두 번 셈 · 변의 수 · 하나 빠뜨림(지도서 344)
      q.answer = String(ans); q.options = buildNum(ans, w, rng);
      q.parts = row.one ? ['자기 자신과 이웃한 두 꼭짓점은 빼요', m + ' − 3 = ' + ans, ans + '개']
                        : m === 3 ? ['이웃하지 않는 두 꼭짓점이 없어요', '0개'] : ['한 꼭짓점에서 ' + (m - 3) + '개씩', m + ' × ' + (m - 3) + ' ÷ 2 = ' + ans, ans + '개'];
      q.explain = row.one ? '한 꼭짓점에서는 자기 자신과 이웃한 두 꼭짓점에 대각선을 그을 수 없어요.' : '한 꼭짓점을 기준으로 차례로 긋고, 같은 대각선을 두 번 세지 않아요.';
    }
    return q;
  }

  return {
    id: 'g4_2_poly_eye',
    title: '다각형 탐정',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T, OPT: OPT, TAG: TAG,
    typesUpto: function (upto) {
      var end = (upto === 'all' || ORDER.indexOf(upto) < 0) ? ORDER.length - 1 : ORDER.indexOf(upto);
      var out = [];
      for (var i = 0; i <= end; i++) POOL[ORDER[i]].forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
      return out;
    },
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto && (p.upto === 'all' || ORDER.indexOf(p.upto) >= 0)) ? p.upto : 'all';
      var all = this.typesUpto(upto);
      var cur = upto === 'all' ? all : POOL[upto];
      var count = 0, seen = {};
      return {
        next: function () {
          var type;
          if (count < 2) type = pick(rng, cur);                               // 이번 차시 먼저
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = make(type, rng); } while (seen[q.prompt] && guard++ < 20);
          seen[q.prompt] = 1;
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-txt">' + q.prompt + ' (' + q.options.join(' · ') + ')</span><span class="w-box"> </span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '그림을 보고 알맞은 답을 쓰세요. 다각형은 선분으로만 둘러싸인 도형, 대각선은 이웃하지 않는 두 꼭짓점을 이은 선분이에요.',
    _calc: { isConvex: isConvex, regClass: regClass, diagClass: diagClass }
  };
}));
