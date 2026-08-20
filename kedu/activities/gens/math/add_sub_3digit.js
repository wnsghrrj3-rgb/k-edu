/* gens/math/add_sub_3digit.js — 세 자리 수 덧셈과 뺄셈 (3학년 수학 1단원)
 * 순수 함수·DOM 무관 (§9-3). 선다 대결·활동지 공유.
 *
 * params: { qmode: 'add'|'sub'|'mix', level: 0|1|2|3, est: 0|1 }
 *   level 0 없음 / 1 한 번 / 2 여러 번 / 3 섞기      (est=1이면 어림 문제를 섞는다)
 * type (§21-3 확정): plain · carry1 · carry2 · borrow1 · borrow2 · zero_borrow · estimate
 *   받아올림 1회(l03)와 여러 번(l04)을 나눈 이유 — 합치면 "어디서 무너지는지"가 사라진다.
 *   zero_borrow(l07 "0이 있는 자리의 받아내림")는 3학년 뺄셈 최대 오류 지점이라 별도 키다.
 *
 * ★ 이 생성기의 핵심: 오답 선택지가 무작위가 아니라 **전형적 오류값**이다.
 *   받아올림한 1을 빠뜨린 값, 받아내림하고 윗자리를 안 줄인 값, 자리마다 큰 수에서 작은 수를
 *   뺀 값. 아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['add_sub_3digit'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function digits(n) { return [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]; } // 백,십,일
  function num(h, t, o) { return h * 100 + t * 10 + o; }
  // 어림: 십의 자리에서 반올림. 일의 자리 5는 애초에 만들지 않는다(어림이 모호해지므로).
  function round10(n) { return Math.round(n / 10) * 10; }

  // ── 덧셈 조립: 받아올림 횟수를 자리에서 직접 만든다 (재시도 루프보다 확실)
  function makeAdd(rng, want) {          // want: 0·1·2
    var a0, b0, a1, b1, a2, b2, c0, c1;
    if (want === 0) {
      a0 = ri(rng, 1, 8); b0 = ri(rng, 1, 9 - a0);
      a1 = ri(rng, 1, 8); b1 = ri(rng, 0, 9 - a1);
      a2 = ri(rng, 1, 7); b2 = ri(rng, 1, 9 - a2);
    } else if (want === 1) {
      if (rng() < 0.5) {                 // 일의 자리에서만
        a0 = ri(rng, 2, 9); b0 = ri(rng, 10 - a0, 9);
        a1 = ri(rng, 1, 7); b1 = ri(rng, 0, 8 - a1);
      } else {                           // 십의 자리에서만
        a0 = ri(rng, 1, 8); b0 = ri(rng, 0, 9 - a0);
        a1 = ri(rng, 2, 9); b1 = ri(rng, 10 - a1, 9);
      }
      a2 = ri(rng, 1, 6); b2 = ri(rng, 1, 7 - a2);
    } else {
      a0 = ri(rng, 2, 9); b0 = ri(rng, 10 - a0, 9);
      a1 = ri(rng, 2, 9); b1 = ri(rng, 9 - a1, 9);   // +1 포함해 10 이상
      a2 = ri(rng, 1, 6); b2 = ri(rng, 1, 7 - a2);
    }
    var a = num(a2, a1, a0), b = num(b2, b1, b0);
    c0 = (a0 + b0 >= 10) ? 1 : 0;
    c1 = (a1 + b1 + c0 >= 10) ? 1 : 0;
    return { a: a, b: b, carries: c0 + c1, c0: c0, c1: c1 };
  }

  // ── 뺄셈 조립
  function makeSub(rng, want, wantZero) {
    var a0, b0, a1, b1, a2, b2;
    if (want === 0) {
      a0 = ri(rng, 2, 9); b0 = ri(rng, 1, a0);
      a1 = ri(rng, 2, 9); b1 = ri(rng, 0, a1);
      a2 = ri(rng, 3, 9); b2 = ri(rng, 1, a2 - 1);
    } else if (want === 1) {
      if (rng() < 0.5) {                 // 일의 자리에서만 받아내림
        a0 = ri(rng, 0, 7); b0 = ri(rng, a0 + 1, 9);
        a1 = ri(rng, 2, 9); b1 = ri(rng, 0, a1 - 1);
      } else {                           // 십의 자리에서만
        a0 = ri(rng, 2, 9); b0 = ri(rng, 1, a0);
        a1 = ri(rng, 0, 7); b1 = ri(rng, a1 + 1, 9);
      }
      a2 = ri(rng, 3, 9); b2 = ri(rng, 1, a2 - 1);
    } else if (wantZero) {               // 0이 있는 자리의 받아내림 (l07)
      a1 = 0;
      a0 = ri(rng, 0, 7); b0 = ri(rng, a0 + 1, 9);
      b1 = ri(rng, 0, 8);
      a2 = ri(rng, 3, 9); b2 = ri(rng, 1, a2 - 1);
    } else {
      a0 = ri(rng, 0, 7); b0 = ri(rng, a0 + 1, 9);
      a1 = ri(rng, 1, 8); b1 = ri(rng, a1, 9);       // a1-1 < b1
      a2 = ri(rng, 3, 9); b2 = ri(rng, 1, a2 - 1);
    }
    var a = num(a2, a1, a0), b = num(b2, b1, b0);
    var br0 = (a0 < b0) ? 1 : 0;
    var br1 = ((a1 - br0) < b1) ? 1 : 0;
    return { a: a, b: b, borrows: br0 + br1, br0: br0, br1: br1, zero: (a1 === 0 && br0 === 1) };
  }

  // ── 전형적 오류값 (오답 선택지의 재료)
  function wrongAdd(a, b) {
    var A = digits(a), B = digits(b), out = [];
    // ① 받아올림을 아예 안 함 — 자리마다 합의 일의 자리만 씀
    out.push(num((A[0] + B[0]) % 10, (A[1] + B[1]) % 10, (A[2] + B[2]) % 10));
    // ② 일의 자리 받아올림한 1을 십의 자리에 안 더함
    if (A[2] + B[2] >= 10) out.push(a + b - 10);
    // ③ 십의 자리 받아올림한 1을 백의 자리에 안 더함
    var c0 = (A[2] + B[2] >= 10) ? 1 : 0;
    if (A[1] + B[1] + c0 >= 10) out.push(a + b - 100);
    return out;
  }
  function wrongSub(a, b) {
    var A = digits(a), B = digits(b), out = [];
    // ① 자리마다 큰 수에서 작은 수를 뺌 (받아내림 자체를 안 함)
    out.push(num(Math.abs(A[0] - B[0]), Math.abs(A[1] - B[1]), Math.abs(A[2] - B[2])));
    // ② 일에서 빌려오고 십의 자리를 줄이지 않음
    if (A[2] < B[2]) out.push(a - b + 10);
    // ③ 십에서 빌려오고 백의 자리를 줄이지 않음
    var br0 = (A[2] < B[2]) ? 1 : 0;
    if ((A[1] - br0) < B[1]) out.push(a - b + 100);
    return out;
  }

  function buildOptions(ans, wrongs, rng) {
    var opts = [String(ans)];
    wrongs.forEach(function (w) {
      var s = String(w);
      if (w > 0 && w !== ans && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 40) {       // 모자라면 근처값으로 채운다
      var d = ans + ri(rng, -3, 3) * 10 + ri(rng, -2, 2);
      var c = String(d);
      if (d > 0 && d !== ans && opts.indexOf(c) < 0) opts.push(c);
    }
    for (var i = opts.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
    }
    return opts;
  }

  return {
    id: 'add_sub_3digit',
    title: '세 자리 덧셈·뺄셈',
    create: function (params, rng) {
      var p = params || {};
      var m = p.qmode || 'mix';
      var lv = (p.level == null) ? 3 : +p.level;
      var estOn = (+p.est === 1);

      return {
        next: function () {
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'add' : 'sub') : m;
          var want = (lv === 3) ? ri(rng, 0, 2) : lv;
          var isEst = estOn && rng() < 0.25;
          var q, ans, type, explain, A, B;

          if (kind === 'add') {
            q = makeAdd(rng, want);
            ans = q.a + q.b;
            type = q.carries === 0 ? 'plain' : (q.carries === 1 ? 'carry1' : 'carry2');
            A = digits(q.a); B = digits(q.b);
            if (type === 'plain') {
              explain = '각 자리의 수끼리 더하면 돼요. ' + q.a + ' + ' + q.b + ' = ' + ans;
            } else if (type === 'carry1') {
              explain = q.c0
                ? '일의 자리: ' + A[2] + ' + ' + B[2] + ' = ' + (A[2] + B[2]) +
                  ' — 10개를 십 모형 1개로 바꿔요. 올린 1을 십의 자리에 꼭 더해요!'
                : '십의 자리: ' + A[1] + ' + ' + B[1] + ' = ' + (A[1] + B[1]) +
                  ' — 10개를 백 모형 1개로 바꿔요. 올린 1을 백의 자리에 꼭 더해요!';
            } else {
              explain = '받아올림이 두 번! 일의 자리에서 1을 올리고, 십의 자리에서 또 1을 올려요. ' +
                        '올린 1을 두 번 다 더해야 ' + ans + '이 돼요.';
            }
          } else {
            var wantZero = (want === 2) && rng() < 0.4;
            q = makeSub(rng, want, wantZero);
            ans = q.a - q.b;
            type = q.zero ? 'zero_borrow'
                 : (q.borrows === 0 ? 'plain' : (q.borrows === 1 ? 'borrow1' : 'borrow2'));
            A = digits(q.a); B = digits(q.b);
            if (type === 'plain') {
              explain = '각 자리의 수끼리 빼면 돼요. ' + q.a + ' − ' + q.b + ' = ' + ans;
            } else if (type === 'borrow1') {
              explain = q.br0
                ? '일의 자리: ' + A[2] + '에서 ' + B[2] + '을 뺄 수 없어요. 십 모형 1개를 일 모형 10개로 바꿔요. ' +
                  '십의 자리는 1 줄어든다는 걸 잊지 마세요!'
                : '십의 자리: ' + A[1] + '에서 ' + B[1] + '을 뺄 수 없어요. 백 모형 1개를 십 모형 10개로 바꿔요. ' +
                  '백의 자리는 1 줄어들어요!';
            } else if (type === 'zero_borrow') {
              explain = '십의 자리가 0이에요! 빌려줄 게 없으니 백의 자리에서 십의 자리로 먼저 빌려와요. ' +
                        '그다음 십의 자리에서 일의 자리로 빌려줘요.';
            } else {
              explain = '받아내림이 두 번! 일의 자리로 한 번, 십의 자리로 또 한 번 빌려와요. ' +
                        '빌려준 자리는 그때마다 1씩 줄어요.';
            }
          }

          // 어림 문제 — 계산이 아니라 판단을 묻는다 (l03~l07 매 차시의 어림 절)
          var ra = round10(q.a), rb = round10(q.b);
          var est = (kind === 'add') ? ra + rb : ra - rb;
          // 선택지 간격은 항상 100 — 아이가 조금 다르게 어림해도 고를 답이 같아야 한다.
          // 그래서 어림값이 250 미만이면(차가 작은 뺄셈) 어림으로 묻지 않고 계산 문제로 돌린다.
          if (isEst && est < 250) isEst = false;

          if (isEst) {
            var eopts = [String(est)];
            [est + 100, est - 100, est + 200, est - 200].forEach(function (v) {
              if (v > 0 && eopts.length < 4 && eopts.indexOf(String(v)) < 0) eopts.push(String(v));
            });
            for (var i = eopts.length - 1; i > 0; i--) {
              var j = Math.floor(rng() * (i + 1)), x = eopts[i]; eopts[i] = eopts[j]; eopts[j] = x;
            }
            return {
              a: q.a, b: q.b, kind: kind, est: true,
              prompt: q.a + (kind === 'add' ? ' + ' : ' − ') + q.b + '은 약 얼마쯤일까요?',
              answer: String(est), options: eopts, type: 'estimate',
              explain: q.a + '은 약 ' + ra + ', ' + q.b + '은 약 ' + rb + '. 그래서 ' +
                       (kind === 'add' ? '합' : '차') + '은 약 ' + est + '쯤이에요. ' +
                       '어림은 계산하기 전에 대강의 값을 미리 알아보는 거예요.'
            };
          }

          var wrongs = (kind === 'add') ? wrongAdd(q.a, q.b) : wrongSub(q.a, q.b);
          return {
            a: q.a, b: q.b, kind: kind, est: false,
            carry: (kind === 'add') ? { ones: q.c0, tens: q.c1 } : null,
            borrow: (kind === 'sub') ? { ones: q.br0, tens: q.br1 } : null,
            prompt: q.a + (kind === 'add' ? ' + ' : ' − ') + q.b + ' = ?',
            answer: String(ans), options: buildOptions(ans, wrongs, rng),
            type: type, explain: explain
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.a + (q.kind === 'add' ? ' + ' : ' − ') + q.b +
             (q.est ? '은 약</span><span class="w-box"> </span>' : ' =</span><span class="w-box"> </span>');
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '계산해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
