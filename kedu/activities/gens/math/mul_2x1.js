/* gens/math/mul_2x1.js — (몇십몇) × (몇) (3학년 수학 4단원 곱셈)
 * 순수 함수·DOM 무관 (§9-3). 선다 대결·활동지 공유.
 *
 * params: { qmode: 'tens'|'std'|'mix', level: 0|1|2|3, est: 0|1 }
 *   qmode  tens (몇십)×(몇)만 / std (몇십몇)×(몇)만 / mix 섞기
 *   level  0 올림 없음 / 1 올림 한 번 / 2 올림 두 번 / 3 섞기   (std에만 적용)
 * type (§21-3 확정): tens_mul · plain · carry_tens · carry_ones · carry_both · estimate
 *
 * 유형을 6종으로 잡은 이유(D22 근거): 교과서가 l02 (몇십)×(몇) · l03 올림 없음 ·
 * l04 십의 자리 올림 · l05 일의 자리 올림 · l06 올림 두 번을 **각각 별개 차시**로 가른다.
 * 그리고 순서를 뒤집지 않는다 — 십의 자리 올림(l04)이 일의 자리 올림(l05)보다 앞인 것은
 * 십의 자리 올림은 올린 수를 백의 자리에 그대로 쓰면 끝나지만, 일의 자리 올림은
 * 올린 수를 십의 자리 곱에 **다시 더해야** 하기 때문이다. 진짜 고비가 뒤에 있다.
 *
 * ★ 오답 선택지 = 전형적 오류값 (#11 add_sub_3digit이 세운 규약). 이 단원은 오류값이
 *   교과서 본문에 실명으로 나와 있다: "백의 자리 올림을 빠뜨려 29", "올림한 1을 더하지 않고 88",
 *   "일의 자리 올림 2를 빠뜨려 124", "21 × 4 = 24"(일의 자리만 곱함), "20 × 3 = 6"(10배 안 함).
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['mul_2x1'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function round10(n) { return Math.round(n / 10) * 10; }

  // ── 후보 표를 미리 다 깔아둔다. 재시도 루프는 유형 격리를 보장하지 못한다.
  //    t 십의 자리 · o 일의 자리 · m 곱하는 수. 분류는 실제 세로셈 절차 그대로.
  var STD = { plain: [], carry_tens: [], carry_ones: [], carry_both: [] };
  (function buildTable() {
    for (var t = 1; t <= 9; t++) {
      for (var o = 1; o <= 9; o++) {
        for (var m = 2; m <= 9; m++) {
          var c1 = Math.floor((o * m) / 10);        // 일의 자리 → 십의 자리 올림
          var c2 = Math.floor((t * m + c1) / 10);   // 십의 자리 → 백의 자리 올림
          var key = c1 && c2 ? 'carry_both' : (c1 ? 'carry_ones' : (c2 ? 'carry_tens' : 'plain'));
          STD[key].push([t, o, m]);
        }
      }
    }
  }());

  function makeStd(rng, type) {
    var c = pick(rng, STD[type]);
    var t = c[0], o = c[1], m = c[2];
    var a = t * 10 + o;
    var c1 = Math.floor((o * m) / 10);
    var c2 = Math.floor((t * m + c1) / 10);
    return { a: a, m: m, t: t, o: o, c1: c1, c2: c2, ans: a * m, type: type };
  }

  function makeTens(rng) {
    var t = ri(rng, 2, 9), m = ri(rng, 2, 9);
    return { a: t * 10, m: m, t: t, o: 0, c1: 0, c2: Math.floor((t * m) / 10),
             ans: t * m * 10, type: 'tens_mul' };
  }

  // ── 전형적 오류값
  function wrongsFor(q) {
    var out = [];
    if (q.type === 'tens_mul') {
      out.push(q.t * q.m);                       // ① 10배를 안 함 — "20 × 3 = 6"
      out.push(q.t * 10 + q.m);                  // ② 두 수를 이어 씀 — "30 × 2 = 32"
      out.push((q.t * q.m + 1) * 10);            // ③ 곱셈구구 인접값
      out.push((q.t * q.m - 1) * 10);
      return out;
    }
    if (q.c1) out.push(q.ans - q.c1 * 10);       // ① 일의 자리에서 올린 수를 십의 자리에 안 더함
    // ② 십의 자리 올림을 백의 자리에 안 씀 — "43 × 3 → 29".
    //    단, 남는 값이 한 자리가 되면(56×9 → 4) 아이가 쓸 리 없는 값이라 오류값으로 못 쓴다.
    if (q.c2 && (q.ans - q.c2 * 100) >= 10) out.push(q.ans - q.c2 * 100);
    if (q.o * q.m < 10) out.push(q.t * 10 + q.o * q.m);  // ③ 일의 자리만 곱함 — "21 × 4 = 24"
    out.push(q.ans - 10);                        // ④ 십의 자리 곱을 하나 작게 (구구 인접)
    out.push(q.ans + 1);                         //   일의 자리 곱을 하나 크게
    return out;
  }

  function buildOptions(ans, wrongs, rng) {
    var opts = [String(ans)];
    wrongs.forEach(function (w) {
      var s = String(w);
      if (w > 0 && w !== ans && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 40) {
      var d = ans + ri(rng, -3, 3) * 10 + ri(rng, -2, 2);
      var c = String(d);
      if (d > 0 && d !== ans && opts.indexOf(c) < 0) opts.push(c);
    }
    for (var i = opts.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
    }
    return opts;
  }

  function explainFor(q) {
    var tens = q.t * 10, partT = tens * q.m, partO = q.o * q.m;
    switch (q.type) {
      case 'tens_mul':
        return q.t + ' × ' + q.m + ' = ' + (q.t * q.m) + ' 이죠? 곱해지는 수가 10배(' + q.t +
               ' → ' + q.a + ')가 되면 답도 10배예요. 그래서 ' + q.a + ' × ' + q.m + ' = ' + q.ans + '.';
      case 'plain':
        return tens + ' × ' + q.m + ' = ' + partT + ', ' + q.o + ' × ' + q.m + ' = ' + partO +
               '. 나누어 곱한 뒤 더하면 ' + KO.ida(q.ans) + '.';
      case 'carry_tens':
        return '십의 자리 곱 ' + tens + ' × ' + q.m + ' = ' + partT + ' — 백의 자리가 생겼어요! ' +
               '십 모형 ' + (q.t * q.m) + '개 중 10개를 백 모형 1개로 바꾸는 거예요. ' + KO.j(partO, '을/를') + ' 더하면 ' + q.ans + '.';
      case 'carry_ones':
        return '일의 자리 곱 ' + q.o + ' × ' + q.m + ' = ' + partO + ' → ' + (partO % 10) +
               KO.only(partO % 10, '을/를') + ' 쓰고 ' + KO.j(q.c1, '을/를') + ' 올려요. 십의 자리 ' + q.t + ' × ' + q.m + ' = ' + (q.t * q.m) +
               '에 **올린 ' + KO.j(q.c1, '을/를') + ' 꼭 더해야** ' + KO.j(q.ans, '이/가') + ' 돼요.';
      case 'carry_both':
        return '올림이 두 번! 일의 자리 ' + q.o + ' × ' + q.m + ' = ' + partO + ' → ' + KO.j(q.c1, '을/를') +
               ' 올리고, 십의 자리 ' + q.t + ' × ' + q.m + ' = ' + (q.t * q.m) + '에 ' + KO.j(q.c1, '을/를') +
               ' 더해 ' + (q.t * q.m + q.c1) + ' → 다시 ' + KO.j(q.c2, '을/를') + ' 백의 자리로 올려요. 답은 ' + q.ans + '.';
    }
    return '';
  }

  return {
    id: 'mul_2x1',
    title: '(몇십몇) × (몇)',
    create: function (params, rng) {
      var p = params || {};
      var qm = p.qmode || 'mix';
      var lv = (p.level == null) ? 3 : +p.level;
      var estOn = (+p.est === 1);
      // 레벨 → 유형. 순서는 교과서 차시 순서다 (D22) — 난이도 직관으로 뒤집지 않는다.
      var BY_LEVEL = { 0: ['plain'], 1: ['carry_tens', 'carry_ones'], 2: ['carry_both'],
                       3: ['plain', 'carry_tens', 'carry_ones', 'carry_both'] };

      return {
        next: function () {
          var useTens = (qm === 'tens') || (qm === 'mix' && rng() < 0.25);
          var q = useTens ? makeTens(rng) : makeStd(rng, pick(rng, BY_LEVEL[lv] || BY_LEVEL[3]));

          // 어림 — 계산이 아니라 판단을 묻는다 (l03~l06 매 차시 첫 절).
          // (몇십)×(몇)은 이미 어림값이라 묻지 않고, 일의 자리 5는 어림이 갈리므로 제외한다.
          // 일의 자리 5는 어림이 갈리고(35 → 30? 40?), 어림값이 10인 수(11~14)는
          // 어림할 게 없다 — 둘 다 어림 문제로 내지 않는다.
          var isEst = estOn && !useTens && q.o !== 5 && round10(q.a) >= 20 && rng() < 0.25;
          if (isEst) {
            var ra = round10(q.a), est = ra * q.m, step = 10 * q.m;
            var eopts = [String(est)];
            // 선택지 간격은 항상 step(= 몇십 한 칸) — 어림을 한 칸 다르게 했을 때 나오는 값들이다.
            [est - step, est + step, est + 2 * step, est - 2 * step,
             est + 3 * step, est + 4 * step].forEach(function (v) {
              if (v > 0 && eopts.length < 4 && eopts.indexOf(String(v)) < 0) eopts.push(String(v));
            });
            for (var i = eopts.length - 1; i > 0; i--) {
              var j = Math.floor(rng() * (i + 1)), x = eopts[i]; eopts[i] = eopts[j]; eopts[j] = x;
            }
            return {
              a: q.a, m: q.m, t: q.t, o: q.o, est: true, round: ra,
              shown: [q.a, q.m, est],
              prompt: q.a + ' × ' + KO.j(q.m, '은/는') + ' 약 얼마쯤일까요?',
              answer: String(est), options: eopts, type: 'estimate',
              explain: KO.j(q.a, '은/는') + ' 약 ' + KO.ida(ra) + '. ' + ra + ' × ' + q.m + ' = ' + est +
                       KO.only(est, '이니까/니까') + ' 약 ' + est + '쯤! 어림은 계산하기 전에 답이 몇백쯤인지 미리 아는 거예요.'
            };
          }

          return {
            a: q.a, m: q.m, t: q.t, o: q.o, est: false,
            shown: [q.a, q.m, q.ans],   // §6-9-7 판에 보이는 수 — "백의 자리가 생겼어요"는 답이 세 자리일 때만 참
            carry: { ones: q.c1, tens: q.c2 },
            part: { tens: q.t * 10 * q.m, ones: q.o * q.m },
            prompt: q.a + ' × ' + q.m + ' = ?',
            answer: String(q.ans), options: buildOptions(q.ans, wrongsFor(q), rng),
            type: q.type, explain: explainFor(q)
          };
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.a + ' × ' + q.m +
             (q.est ? '은 약</span><span class="w-box"> </span>' : ' =</span><span class="w-box"> </span>');
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '계산해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
