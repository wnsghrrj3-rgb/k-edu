/* gens/math/classify.js — 분류하기 (2학년 수학 5단원)
 * 순수 함수·DOM 무관 (§9-3).
 * 분류의 핵심은 "무엇으로 나눌지 정하는 것" — 같은 물건이 기준에 따라 다른 칸에 들어간다.
 * params: { by: 'color'|'shape'|'size'|'mix', per: 한 판 물건 수 }
 * type: color · shape · size — 어떤 기준에서 흔들리는지가 신호
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['classify'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  var COLORS = [
    { k: 'red', ko: '빨강', hex: '#ef4444' },
    { k: 'blue', ko: '파랑', hex: '#3b82f6' },
    { k: 'yellow', ko: '노랑', hex: '#eab308' }
  ];
  var SHAPES = [
    { k: 'circle', ko: '원' }, { k: 'square', ko: '사각형' }, { k: 'triangle', ko: '삼각형' }
  ];
  var SIZES = [{ k: 'big', ko: '큰 것' }, { k: 'small', ko: '작은 것' }];
  var BY_KO = { color: '색깔', shape: '모양', size: '크기' };

  return {
    id: 'classify',
    title: '기준을 정해 분류하기',
    colors: COLORS, shapes: SHAPES, sizes: SIZES, byKo: BY_KO,
    create: function (params, rng) {
      var p = params || {};
      var by = p.by || 'mix';
      var per = +p.per || 6;
      return {
        // 한 판: 기준 하나 + 물건들
        deal: function () {
          var b = (by === 'mix') ? ['color', 'shape', 'size'][ri(rng, 0, 2)] : by;
          var items = [];
          for (var i = 0; i < per; i++) {
            items.push({
              color: COLORS[ri(rng, 0, 2)],
              shape: SHAPES[ri(rng, 0, 2)],
              size: SIZES[ri(rng, 0, 1)]
            });
          }
          var bins = (b === 'color') ? COLORS : (b === 'shape' ? SHAPES : SIZES);
          return {
            by: b, byKo: BY_KO[b], bins: bins, items: items,
            prompt: BY_KO[b] + '(으)로 나눠요',
            type: b
          };
        },
        binOf: function (item, by) { return item[by].k; }
      };
    },
    printHead: '기준을 정해 분류하고 수를 세어 보세요.'
  };
}));
