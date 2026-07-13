/* gens/math/shape2d.js — 평면도형 (2학년 수학 2단원, 여러 가지 도형)
 * 순수 함수·DOM 무관 (§9-3). 이름 맞히기·분류·활동지 공유.
 * params: { qmode: 'name'(도형 이름) | 'sides'(변) | 'vertex'(꼭짓점) | 'mix' }
 * type: triangle · square · circle · pentagon · hexagon · rotated_trap(돌아간 도형)
 *   rotated_trap이 약하면 "삼각형은 뾰족한 게 위로 가야 한다"는 방향 고착. 도형은 돌려도 그 도형이다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['shape2d'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  var SHAPES = [
    { k: 'triangle', ko: '삼각형', sides: 3, vtx: 3 },
    { k: 'square', ko: '사각형', sides: 4, vtx: 4 },
    { k: 'pentagon', ko: '오각형', sides: 5, vtx: 5 },
    { k: 'hexagon', ko: '육각형', sides: 6, vtx: 6 },
    { k: 'circle', ko: '원', sides: 0, vtx: 0 }
  ];

  return {
    id: 'shape2d',
    title: '여러 가지 도형',
    shapes: SHAPES,
    create: function (params, rng) {
      var p = params || {};
      var m = p.qmode || 'mix';
      var per = +p.per || 6;
      function one() {
        var s = SHAPES[ri(rng, 0, SHAPES.length - 1)];
        var rot = (s.k === 'circle') ? 0 : ri(rng, 0, 5) * 30;      // 돌아간 도형
        return { shape: s, rot: rot, rotated: rot >= 30 };
      }
      return {
        next: function () {
          var it = one();
          var s = it.shape;
          var kind = (m === 'mix') ? ['name', 'sides', 'vertex'][ri(rng, 0, 2)] : m;
          var answer, prompt, explain, opts = [];

          if (kind === 'name') {
            answer = s.k;
            prompt = '이 도형의 이름은?';
            explain = s.ko + '이에요' + (it.rotated ? ' — 돌아가 있어도 ' + s.ko + '이에요!' : '') +
              (s.sides ? ' (변 ' + s.sides + '개, 꼭짓점 ' + s.vtx + '개)' : ' (변도 꼭짓점도 없어요)');
            var pool = SHAPES.map(function (x) { return x.k; });
            opts = [answer];
            while (opts.length < 4) {
              var c = pool[ri(rng, 0, pool.length - 1)];
              if (opts.indexOf(c) < 0) opts.push(c);
            }
          } else {
            var n = (kind === 'sides') ? s.sides : s.vtx;
            answer = String(n);
            prompt = (kind === 'sides') ? '변은 몇 개일까요?' : '꼭짓점은 몇 개일까요?';
            explain = s.ko + '은(는) ' + (kind === 'sides' ? '변이 ' : '꼭짓점이 ') + n + '개예요' +
              (n === 0 ? ' — 원은 곧은 선도 모난 곳도 없어요' : '');
            opts = [answer];
            while (opts.length < 4) {
              var c2 = String(ri(rng, 0, 6));
              if (opts.indexOf(c2) < 0) opts.push(c2);
            }
          }
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
          }
          return {
            shape: s, rot: it.rot, kind: kind, prompt: prompt, answer: answer, options: opts,
            type: it.rotated ? 'rotated_trap' : s.k, explain: explain
          };
        },
        // 분류 게임용 — 도형 여러 개
        deal: function () {
          var out = [];
          for (var i = 0; i < per; i++) out.push(one());
          return out;
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span style="margin-right:8px">' + q.shape.ko + ' →</span><span class="w-box"> </span>' +
             '<span style="margin-left:4px">' + (q.kind === 'vertex' ? '꼭짓점' : '변') + ' 개수</span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '도형의 변과 꼭짓점 수를 □ 안에 쓰세요.'
  };
}));
