/* gens/korean/jamo_sort.js — 자음자냐 모음자냐 (1학년 국어 1단원 l03·l13)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * params: { pool: 'basic'|'more'|'mix' }   basic = 자음자 14 + 모음자 10 · more = 여러 가지 모음자 포함
 * next() → { item, cat:'consonant'|'vowel', type, explain }
 * type(문항 단위): consonant · vowel · vowel_more(여러 가지 모음자 — l09~l11 진단 축)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['jamo_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var J = (typeof module === 'object' && module.exports) ? require('./jamo.js') : (typeof self !== 'undefined' ? self : this).GENS.jamo;

  return {
    id: 'jamo_sort',
    title: '자음자냐 모음자냐',
    categories: [{ key: 'consonant', label: '자음자' }, { key: 'vowel', label: '모음자' }],
    create: function (params, rng) {
      var p = params || {};
      var pool = p.pool === 'more' || p.pool === 'mix' ? p.pool : 'basic';
      var vows = pool === 'basic' ? J.BASIC_VOW : (pool === 'more' ? J.MORE_VOW : J.BASIC_VOW.concat(J.MORE_VOW));
      var last = null;
      return {
        next: function () {
          var item;
          do {
            // 자음자·모음자를 번갈아 뽑지 않는다 — 규칙성이 답을 준다. 절반 확률로 갈래를 고른다.
            item = rng() < 0.5 ? J.pick(rng, J.BASIC_CONS) : J.pick(rng, vows);
          } while (item === last);
          last = item;
          var cons = J.isCons(item);
          var type = cons ? 'consonant' : (J.BASIC_VOW.indexOf(item) >= 0 ? 'vowel' : 'vowel_more');
          return {
            item: item, cat: cons ? 'consonant' : 'vowel', type: type,
            explain: item + (cons ? '은 자음자' : '는 모음자') + '예요'   // 자음자 이름(기역·니은…)은 받침이 있고 모음자 이름은 없다 (§6-10)
          };
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + q.item + '</span> → □ 자음자 □ 모음자'; },
    printAnswer: function (q) { return q.item + ' ' + (q.cat === 'consonant' ? '자음자' : '모음자'); },
    printHead: '자음자에는 ○, 모음자에는 △를 하세요.'
  };
}));
