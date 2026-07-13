/* gens/math/place3.js — 세 자리 수 자릿값 (2학년 수학 1단원)
 * 순수 함수·DOM 무관 (§9-3).
 * params: { qmode: 'digit'(자릿수 묻기) | 'value'(자릿값 묻기) | 'mix' }
 * type: hundreds · tens · ones · zero_trap(0이 낀 수 — 자릿값 이해의 시금석)
 *   zero_trap이 약하면 "빈 자리를 세지 않는다"는 오개념. 305를 35로 읽는 아이가 여기서 걸린다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['place3'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  var KO = { h: '백의 자리', t: '십의 자리', o: '일의 자리' };

  return {
    id: 'place3',
    title: '세 자리 수 자릿값',
    create: function (params, rng) {
      var m = ((params || {}).qmode) || 'mix';
      return {
        next: function () {
          var zeroTrap = rng() < 0.28;
          var h = ri(rng, 1, 9), t, o;
          if (zeroTrap) {
            if (rng() < 0.5) { t = 0; o = ri(rng, 1, 9); }
            else { t = ri(rng, 1, 9); o = 0; }
          } else { t = ri(rng, 1, 9); o = ri(rng, 1, 9); }
          var num = h * 100 + t * 10 + o;

          var slots = ['h', 't', 'o'];
          var slot = slots[ri(rng, 0, 2)];
          var digit = (slot === 'h') ? h : (slot === 't' ? t : o);
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'digit' : 'value') : m;

          var answer, prompt, explain;
          if (kind === 'digit') {                 // 그 자리의 숫자는?
            answer = String(digit);
            prompt = num + '의 ' + KO[slot] + ' 숫자는?';
            explain = num + '의 ' + KO[slot] + ' 숫자는 ' + digit + '이에요';
          } else {                                 // 그 자리가 나타내는 값은?
            var val = digit * (slot === 'h' ? 100 : (slot === 't' ? 10 : 1));
            answer = String(val);
            prompt = num + '의 ' + KO[slot] + '는 얼마를 나타낼까요?';
            explain = num + '의 ' + KO[slot] + ' 숫자 ' + digit + '은(는) ' + val + '을(를) 나타내요';
          }
          var type = zeroTrap ? 'zero_trap' : (slot === 'h' ? 'hundreds' : (slot === 't' ? 'tens' : 'ones'));

          var opts = [answer];
          while (opts.length < 4) {
            var c;
            if (kind === 'digit') c = String(ri(rng, 0, 9));
            else c = String([1, 10, 100][ri(rng, 0, 2)] * ri(rng, 0, 9));
            if (opts.indexOf(c) < 0 && c !== '0') opts.push(c);
          }
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
          }
          return { num: num, h: h, t: t, o: o, slot: slot, prompt: prompt, answer: answer,
                   options: opts, type: type, explain: explain };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.num + '</span><span style="margin:0 6px">의 ' + KO[q.slot] + ' →</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '□ 안에 알맞은 수를 쓰세요.'
  };
}));
