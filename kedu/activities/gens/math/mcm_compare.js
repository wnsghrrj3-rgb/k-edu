/* gens/math/mcm_compare.js — 몇 m 몇 cm 길이 비교 (2학년 2학기 수학 3단원 「길이 재기」 3·8차시)
 * compare999·compare9999 와 **똑같은 계약**(a/b + answer L/E/R + type + explain) — 저울 무대를 그대로 쓴다.
 *   a·b 는 cm 로 센 길이(정수), sa·sb 는 접시에 보일 글(「2 m 10 cm」 또는 「210 cm」).
 * 교과서판(2026-11-09): 『수학』 69쪽 「멀리 던지기 놀이」 기록표(제기·배드민턴공·종이컵)를 저울 위 「나 ↔ 짝」 대결로 옮겼다.
 *   처음 두 판은 교과서 기록 그대로(슬기 2 m 10 cm·지아 1 m 90 cm / 수찬 5 m 10 cm·지아 4 m 30 cm / 연우 2 m 20 cm·슬기 2 m 10 cm /
 *   수찬 4 m 20 cm·연우 4 m 20 cm / 슬기 3 m 50 cm·3 m 30 cm / 지아 2 m 80 cm·연우 3 m 10 cm / 수찬 1 m 60 cm·연우 2 m 20 cm) — 그다음부터 1 m 10 cm ~ 5 m 90 cm 기록.
 * type: m_diff(m 가 다름) · cm_diff(m 같고 cm 가 다름) · cm_trap(m 가 작은 쪽의 cm 가 더 큼 — 1 m 90 cm vs 2 m 10 cm)
 *       · unit_mix(한쪽 기록을 「몇 cm」로 적음 — 같은 단위로 바꾸어 견주기, 지도서 211·확인해요) · equal(같은 기록 — 「같은 거리예요」)
 * 범위: 받아올림·받아내림 없는 2학년 범위의 길이 비교 — 기록은 10 cm 단위(교과서 기록표처럼).
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['mcm_compare'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function mcm(T) { var m = Math.floor(T / 100), c = T % 100; return (m && c) ? m + ' m ' + c + ' cm' : m ? m + ' m' : c + ' cm'; }
  /* 교과서 판 — 『수학』 69쪽 멀리 던지기 기록표 (몇 m 몇 cm 그대로) */
  var BOOK = [[210, 190], [510, 430], [220, 210], [420, 420], [350, 330], [280, 310], [160, 220]];
  function typeOf(a, b, mix) {
    if (a === b) return mix ? 'unit_mix' : 'equal';
    if (mix) return 'unit_mix';
    var ma = Math.floor(a / 100), mb = Math.floor(b / 100);
    if (ma === mb) return 'cm_diff';
    var big = a > b ? a : b, small = a > b ? b : a;
    return (small % 100 > big % 100) ? 'cm_trap' : 'm_diff';
  }
  function explainOf(a, b, type, mix) {
    var big = Math.max(a, b), small = Math.min(a, b), s = '';
    if (mix) s = (mix === 'L' ? a : b) + ' cm = ' + mcm(mix === 'L' ? a : b) + '로 바꾸어 견줘요 — ';
    if (a === b) return s + '두 기록이 같아요 — 같은 거리예요!';
    var mB = Math.floor(big / 100), mS = Math.floor(small / 100);
    if (mB !== mS) s += 'm부터 봐요: ' + mB + ' m > ' + mS + ' m — ' + mcm(big) + '가 더 멀리 갔어요.';
    else s += 'm가 같으니 cm를 봐요: ' + (big % 100) + ' cm > ' + (small % 100) + ' cm — ' + mcm(big) + '가 더 멀리 갔어요.';
    if (type === 'cm_trap') s += ' cm의 수가 커도 m가 작으면 더 짧아요!';
    return s;
  }
  return {
    id: 'mcm_compare',
    title: '몇 m 몇 cm 비교',
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var qi = 0, order = BOOK.slice();
      for (var k = order.length - 1; k > 0; k--) { var j = Math.floor(rng() * (k + 1)); var t = order[k]; order[k] = order[j]; order[j] = t; }
      return {
        next: function () {
          var a, b, mix = '', r;
          if (book && qi < 2) { a = order[qi][0]; b = order[qi][1]; if (rng() < 0.5) { var s = a; a = b; b = s; } qi++; }
          else {
            qi++; r = rng();
            a = ri(rng, 11, 59) * 10;
            if (r < 0.22) { do { b = ri(rng, 11, 59) * 10; } while (Math.floor(b / 100) === Math.floor(a / 100)); }        // m 가 다름
            else if (r < 0.42) {                                                                                             // cm 덫
              var lo = ri(rng, 1, 4); a = lo * 100 + ri(rng, 6, 9) * 10; b = (lo + 1) * 100 + ri(rng, 1, 4) * 10; }
            else if (r < 0.66) { do { b = Math.floor(a / 100) * 100 + ri(rng, 1, 9) * 10; } while (b === a); }               // cm 가 다름
            else if (r < 0.93) { b = Math.floor(a / 100) * 100 + ri(rng, 1, 9) * 10; if (b === a) b = a + (a % 100 < 90 ? 10 : -10); mix = rng() < 0.5 ? 'L' : 'R'; } // 단위 섞임
            else { b = a; if (rng() < 0.5) mix = rng() < 0.5 ? 'L' : 'R'; }                                                 // 같음
            if (rng() < 0.5) { var s2 = a; a = b; b = s2; }
          }
          var type = typeOf(a, b, mix);
          var sa = mix === 'L' ? a + ' cm' : mcm(a), sb = mix === 'R' ? b + ' cm' : mcm(b);
          var ans = a === b ? 'E' : (a > b ? 'L' : 'R');
          return { a: a, b: b, sa: sa, sb: sb, prompt: sa + ' ◯ ' + sb, answer: ans, type: type, explain: explainOf(a, b, type, mix) };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.sa + '</span><span class="w-box">◯</span><span class="w-num">' + q.sb + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '두 기록을 비교해 ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
