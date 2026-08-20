/* gens/math/frac_dec_compare.js — 분수·소수 크기 비교 생성기 (3학년 수학 6단원)
 * compare50·compare999와 **똑같은 계약**(L/E/R + type + explain + whyAns) — 저울 무대를 그대로 재사용한다.
 * §10-2 확장 검증 4회차: 수(정수) → 무게 → 세 자리 수 → **분수·소수**.
 *
 * 유형(§21-3 사전 확정 2026-08-20, 차시 원본 l05·l06·l09):
 *   unit_frac   단위분수 (분모가 클수록 작아요)        — l06
 *   same_denom  분모가 같은 분수 (분자가 클수록 커요)  — l05
 *   decimal     소수 비교 (0.1의 개수)                 — l09
 *   frac_dec    분수를 소수로 바꿔 비교 (0.4 = 10분의 4) — l07·l09 전개
 *   equal       같은 수
 *
 * params: { mix: 0 섞어 | 1 분수만 | 2 소수만 }
 * next() → { a, b, prompt, answer:'L'|'E'|'R', type, explain, whyAns, L, R }
 *   L·R = { kind:'frac'|'dec', num, den, val, text }   ← 무대(저울 카드·띠 모델)가 읽는 값
 *   분수도 소수도 den 등분 중 num 칸으로 표현된다 (소수는 den=10) — 띠 모델이 같은 규칙으로 그려진다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['frac_dec_compare'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  function frac(num, den) {
    return { kind: 'frac', num: num, den: den, val: num / den, text: num + '/' + den };
  }
  function dec(tenths) {
    return { kind: 'dec', num: tenths, den: 10, val: tenths / 10, text: '0.' + tenths };
  }
  function swap(o) { var t = o.L; o.L = o.R; o.R = t; }
  // 화면·수첩에 쓰는 한국어 읽기 — 교과서 표현("4분의 3")을 따른다
  function say(s) { return s.kind === 'dec' ? s.text : (s.den + '분의 ' + s.num); }
  // 받침 조사 — 끝자리 숫자의 한글 읽기 기준 (0영·1일·3삼·6육·7칠·8팔 받침 있음)
  function bat(t) { var m = String(t).match(/(\d)(?!.*\d)/); return m ? '013678'.indexOf(m[1]) >= 0 : false; }
  function jo(t, withB, noB) { return bat(t) ? withB : noB; }

  function make(mix, rng) {
    var r = rng(), type;
    if (mix === 'frac') type = r < 0.42 ? 'unit_frac' : (r < 0.88 ? 'same_denom' : 'equal');
    else if (mix === 'dec') type = r < 0.82 ? 'decimal' : 'equal';
    else type = r < 0.26 ? 'unit_frac' : (r < 0.52 ? 'same_denom' : (r < 0.74 ? 'decimal' : (r < 0.9 ? 'frac_dec' : 'equal')));

    var o = { L: null, R: null }, d1, d2, n1, n2, t1, t2;

    if (type === 'unit_frac') {                       // 1/d 끼리 — 분모가 클수록 작다
      d1 = ri(rng, 2, 10);
      do { d2 = ri(rng, 2, 10); } while (d2 === d1);
      o.L = frac(1, d1); o.R = frac(1, d2);
    } else if (type === 'same_denom') {               // 분모가 같은 분수 — 분자가 클수록 크다
      var d = ri(rng, 3, 10);
      n1 = ri(rng, 1, d - 1);
      do { n2 = ri(rng, 1, d - 1); } while (n2 === n1);
      o.L = frac(n1, d); o.R = frac(n2, d);
    } else if (type === 'decimal') {                  // 0.1의 개수로 견준다
      t1 = ri(rng, 1, 9);
      do { t2 = ri(rng, 1, 9); } while (t2 === t1);
      o.L = dec(t1); o.R = dec(t2);
    } else if (type === 'frac_dec') {                 // 분모가 10인 분수 ↔ 소수
      t1 = ri(rng, 1, 9);
      do { t2 = ri(rng, 1, 9); } while (t2 === t1);
      o.L = frac(t1, 10); o.R = dec(t2);
      if (rng() < 0.5) swap(o);
    } else {                                          // equal — 절반은 형태가 다른 같은 수 (0.4 = 10분의 4)
      if (rng() < 0.5) {
        t1 = ri(rng, 1, 9);
        o.L = frac(t1, 10); o.R = dec(t1);
        if (rng() < 0.5) swap(o);
      } else if (rng() < 0.5) {
        t1 = ri(rng, 1, 9); o.L = dec(t1); o.R = dec(t1);
      } else {
        var de = ri(rng, 2, 10), nu = ri(rng, 1, de - 1);
        o.L = frac(nu, de); o.R = frac(nu, de);
      }
    }

    var L = o.L, R = o.R;
    var same = Math.abs(L.val - R.val) < 1e-9;
    var ans = same ? 'E' : (L.val > R.val ? 'L' : 'R');
    var big = L.val > R.val ? L : R, small = L.val > R.val ? R : L;

    var explain;
    if (type === 'unit_frac') {
      explain = '단위분수는 분모가 클수록 작은 수예요. 분모 ' + small.den + jo(small.den, '이 ', '가 ') + big.den +
                '보다 크니까 ' + say(big) + jo(say(big), '이', '가') + ' 더 커요';
    } else if (type === 'same_denom') {
      explain = '분모가 같으면 분자가 클수록 큰 분수예요. ' + L.den + '분의 1이 ' +
                big.num + '개 > ' + small.num + '개';
    } else if (type === 'decimal') {
      explain = '0.1이 몇 개인지 세요: ' + big.num + '개 > ' + small.num + '개. 그래서 ' +
                say(big) + ' > ' + say(small);
    } else if (type === 'frac_dec') {
      var fr = L.kind === 'frac' ? L : R, dc = L.kind === 'frac' ? R : L;
      explain = dc.text + jo(dc.text, '은 ', '는 ') + '10분의 ' + dc.num + jo(dc.num, '이에요', '예요') + '. 분모가 같으니 분자를 비교해요: ' +
                big.num + ' > ' + small.num;
    } else {
      explain = (L.kind !== R.kind)
        ? say(L) + jo(say(L), '과 ', '와 ') + say(R) + jo(say(R), '은', '는') + ' 같은 수예요! 0.1이 ' + L.num + '개로 똑같아요'
        : '두 수가 똑같아요!';
    }

    var whyAns = type === 'unit_frac' ? 'denom'
               : type === 'same_denom' ? 'numer'
               : type === 'equal' ? 'equal' : 'tenths';

    return {
      a: say(L), b: say(R), prompt: say(L) + ' ◯ ' + say(R), answer: ans,
      type: type, explain: explain, whyAns: whyAns, L: L, R: R
    };
  }

  function printSide(s) {
    if (s.kind === 'dec') return '<span style="font-family:Nunito,sans-serif;font-weight:800;font-size:26px">' + s.text + '</span>';
    return '<span style="display:inline-block;text-align:center;font-family:Nunito,sans-serif;font-weight:800;font-size:17px;line-height:1.05;vertical-align:middle">' +
           s.num + '<span style="display:block;border-top:2px solid currentColor">' + s.den + '</span></span>';
  }

  return {
    id: 'frac_dec_compare',
    title: '분수와 소수의 크기 비교',
    create: function (params, rng) {
      // §9-3 params는 숫자값 — 0 섞어 · 1 분수만 · 2 소수만
      var m = +((params || {}).mix);
      var mix = m === 1 ? 'frac' : (m === 2 ? 'dec' : 'both');
      return {
        next: function () { return make(mix, rng); },
        check: function (pick, p) { return pick === p.answer; }
      };
    },
    // 활동지 인쇄 렌더 (§11-2)
    printRender: function (p) {
      return printSide(p.L) + '<span class="w-box">◯</span>' + printSide(p.R);
    },
    printAnswer: function (p) { return p.answer === 'E' ? '=' : (p.answer === 'L' ? '>' : '<'); },
    printHead: '두 수를 비교해 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
