/* gens/math/count_bundle.js — 10개씩 묶어 세기 (1학년 수학 5단원, 수120-123)
 * 순수 함수·DOM 무관 (§9-3). 게임(조작)·활동지(빈칸) 공유.
 * params: { range: 30|50|99 }
 * next() → { total, tens, ones, prompt, answer:'{tens}-{ones}', options, type }
 * type: plain(낱개 있음) · exact(딱 떨어짐: 30, 40 …) · teen(10대 수)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['count_bundle'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  return {
    id: 'count_bundle',
    title: '10개씩 묶어 세기',
    create: function (params, rng) {
      var range = [30, 50, 99].indexOf(+((params || {}).range)) >= 0 ? +params.range : 50;
      return {
        next: function () {
          var total;
          var r = rng();
          if (r < 0.18) total = ri(rng, 1, Math.floor(range / 10)) * 10;   // 딱 떨어지는 수
          else if (r < 0.34) total = ri(rng, 11, 19);                      // 10대 수 (십 몇)
          else total = ri(rng, 11, range);
          var tens = Math.floor(total / 10), ones = total % 10;
          var type = (ones === 0) ? 'exact' : (total < 20 ? 'teen' : 'plain');

          // 읽기 보기: 정답 + 자릿값 혼동 오답(묶음↔낱개 뒤집기 등)
          var key = function (t, o) { return t + '-' + o; };
          var answer = key(tens, ones);
          var opts = [answer];
          var cand = [key(ones, tens), key(tens + 1, ones), key(tens, (ones + 1) % 10), key(Math.max(0, tens - 1), ones)];
          for (var i = 0; i < cand.length && opts.length < 4; i++) {
            if (opts.indexOf(cand[i]) < 0) opts.push(cand[i]);
          }
          while (opts.length < 4) {
            var c = key(ri(rng, 1, 9), ri(rng, 0, 9));
            if (opts.indexOf(c) < 0) opts.push(c);
          }
          for (var j = opts.length - 1; j > 0; j--) {
            var k = Math.floor(rng() * (j + 1)), t2 = opts[j]; opts[j] = opts[k]; opts[k] = t2;
          }

          return {
            total: total, tens: tens, ones: ones,
            prompt: KO.j(total, '은/는') + ' 10개씩 몇 묶음, 낱개 몇 개?',
            answer: answer, options: opts, type: type,
            explain: total + ' = 10개씩 ' + tens + '묶음 하고 낱개 ' + ones + '개예요' +
                     (ones === 0 ? ' (남는 낱개가 없어요!)' : '')
          };
        },
        check: function (pick, p) { return pick === p.answer; }
      };
    },
    printRender: function (p) {
      return '<span class="w-num">' + p.total + '</span>' +
        '<span style="margin:0 6px">→ 10개씩</span><span class="w-box"> </span><span style="margin:0 4px">묶음</span>' +
        '<span style="margin-left:6px">낱개</span><span class="w-box"> </span><span>개</span>';
    },
    printAnswer: function (p) { return p.tens + '묶음 ' + p.ones + '개'; },
    printHead: '10개씩 묶어 세어 □ 안에 알맞은 수를 쓰세요.'
  };
}));
