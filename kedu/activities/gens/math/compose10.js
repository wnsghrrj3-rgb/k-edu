/* gens/math/compose10.js — 10 만들기 (1학년 수학 3단원, 수111쪽)
 * 순수 함수·DOM 무관 (§9-3). 게임·활동지 공유.
 * params: { mode: 'compose'(모으기 짝) | 'split'(가르기) | 'mix' }
 * type: pair_small(1~4 짝) · pair_large(6~9 짝) · five(5+5) · split(가르기)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compose10'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  function make(kind, rng) {
    var a = ri(rng, 1, 9);
    if (kind === 'split') {                       // 10을 a와 □로 가르기
      var b = 10 - a;
      return {
        a: a, b: b, prompt: '10 → ' + a + ' 과 □', answer: String(b),
        type: 'split',
        explain: '10은 ' + KO.j(a, '와/과') + ' ' + KO.ro(b) + ' 갈라져요. 손가락 ' + a + '개를 접으면 ' + b + '개가 남아요!'
      };
    }
    var need = 10 - a;                            // a와 무엇을 모으면 10?
    var type = (a === 5) ? 'five' : (a <= 4 ? 'pair_small' : 'pair_large');
    return {
      a: a, b: need, prompt: a + ' + □ = 10', answer: String(need),
      type: type,
      explain: a === 5 ? '5와 5를 모으면 10! 한 손씩 짝이에요'
        : a + '에 ' + KO.j(need, '을/를') + ' 더하면 10이 돼요. ' + a + '·' + KO.j(need, '은/는') + ' 10의 단짝!'
    };
  }

  return {
    id: 'compose10',
    title: '10 만들기',
    create: function (params, rng) {
      var m = ((params || {}).qmode) || 'mix';
      return {
        next: function () {
          var kind = (m === 'mix') ? (rng() < 0.5 ? 'compose' : 'split') : m;
          var p = make(kind, rng);
          // 보기 4개: 정답 + 오답 3 (10 이하 자연수, 중복 없이)
          var opts = [p.answer];
          while (opts.length < 4) {
            var c = String(ri(rng, 1, 9));
            if (opts.indexOf(c) < 0) opts.push(c);
          }
          for (var i = opts.length - 1; i > 0; i--) {          // 셔플
            var j = Math.floor(rng() * (i + 1)), t = opts[i]; opts[i] = opts[j]; opts[j] = t;
          }
          p.options = opts;
          return p;
        },
        check: function (pick, p) { return pick === p.answer; }
      };
    },
    printRender: function (p) { return '<span class="w-num">' + p.prompt.replace('□', '<span class="w-box"> </span>') + '</span>'; },
    printAnswer: function (p) { return p.answer; },
    printHead: '□ 안에 알맞은 수를 쓰세요.'
  };
}));
