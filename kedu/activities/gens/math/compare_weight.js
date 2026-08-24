/* gens/math/compare_weight.js — 무게 비교 (1학년 수학 4단원, 비교하기)
 * 순수 함수·DOM 무관 (§9-3). balance 장르 재사용 검증용 생성기 (§10-2 확장 기준).
 * next() → { L, R, answer:'L'|'E'|'R', type, explain }  ← compare50과 동일한 계약
 * type: obvious(차이 큼) · close(비슷함) · size_trap(큰데 가벼움 — 부피≠무게 오개념)
 *   size_trap이 유독 약하면 "크면 무겁다"는 오개념이 남아 있다는 신호.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['compare_weight'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  // { 이름, 아이콘, 무게(g), 보이는 크기(1~5) }
  var THINGS = [
    { n: '지우개', i: '🧽', w: 20, s: 2 }, { n: '연필', i: '✏️', w: 10, s: 2 },
    { n: '사과', i: '🍎', w: 250, s: 3 }, { n: '가위', i: '✂️', w: 90, s: 2 },
    { n: '책', i: '📕', w: 500, s: 4 }, { n: '가방', i: '🎒', w: 900, s: 5 },
    { n: '돌', i: '🪨', w: 800, s: 2 }, { n: '풍선', i: '🎈', w: 5, s: 5 },
    { n: '수박', i: '🍉', w: 4000, s: 5 }, { n: '깃털', i: '🪶', w: 1, s: 3 },
    { n: '우유갑', i: '🥛', w: 300, s: 3 }, { n: '베개', i: '🛏️', w: 400, s: 5 },
    { n: '동전', i: '🪙', w: 8, s: 1 }, { n: '망치', i: '🔨', w: 600, s: 3 },
    { n: '스티커', i: '🏷️', w: 2, s: 1 }, { n: '물통', i: '🍶', w: 1200, s: 4 }
  ];
  function pickIdx(rng, n) { return Math.floor(rng() * n); }

  return {
    id: 'compare_weight',
    title: '무게 비교',
    create: function (params, rng) {
      return {
        next: function () {
          var L, R, type, r = rng();
          if (r < 0.3) {
            // size_trap — 큰데 가벼운 것 vs 작은데 무거운 것 (부피 ≠ 무게)
            var light = THINGS.filter(function (t) { return t.s >= 4 && t.w <= 400; });
            var heavy = THINGS.filter(function (t) { return t.s <= 3 && t.w >= 250; });
            L = light[pickIdx(rng, light.length)];
            R = heavy[pickIdx(rng, heavy.length)];
            if (rng() < 0.5) { var t0 = L; L = R; R = t0; }
            type = 'size_trap';
          } else {
            do {
              L = THINGS[pickIdx(rng, THINGS.length)];
              R = THINGS[pickIdx(rng, THINGS.length)];
            } while (L.n === R.n);
            var ratio = Math.max(L.w, R.w) / Math.min(L.w, R.w);
            type = (ratio >= 4) ? 'obvious' : 'close';
          }
          var ans = (L.w === R.w) ? 'E' : (L.w > R.w ? 'L' : 'R');
          var heavyOne = (L.w > R.w) ? L : R, lightOne = (L.w > R.w) ? R : L;
          var explain = (type === 'size_trap')
            ? KO.j(heavyOne.n, '이/가') + ' 더 무거워요. ' + KO.j(lightOne.n, '은/는') + ' 커 보여도 가벼워요 — 크다고 무거운 게 아니에요!'
            : KO.j(heavyOne.n, '이/가') + ' ' + lightOne.n + '보다 무거워요. 저울이 무거운 쪽으로 내려가요';
          return {
            L: L, R: R, prompt: L.n + ' vs ' + R.n, answer: ans, type: type, explain: explain
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span style="font-size:26px">' + q.L.i + '</span><span class="w-box">◯</span>' +
             '<span style="font-size:26px">' + q.R.i + '</span>';
    },
    printAnswer: function (q) { return q.answer === 'E' ? '=' : (q.answer === 'L' ? '>' : '<'); },
    printHead: '어느 것이 더 무거울까요? ◯ 안에 >, =, < 를 쓰세요.'
  };
}));
