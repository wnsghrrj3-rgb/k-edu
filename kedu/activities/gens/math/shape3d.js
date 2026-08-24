/* gens/math/shape3d.js — 여러 가지 모양 (1학년 수학 2단원)
 * 순수 함수·DOM 무관 (§9-3). 분류 게임·모양 찾기·활동지 공유.
 * 모양 3종: box(상자 모양) · cylinder(둥근기둥 모양) · ball(공 모양)
 * type: box · cylinder · ball · tricky(겉모습이 헷갈리는 것 — 모양의 본질을 묻는다)
 *   tricky가 약하면 "이름·용도"로 분류하고 있다는 신호. 모양은 쓰임이 아니라 생김새다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['shape3d'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  var SHAPE_KO = { box: '상자 모양', cylinder: '둥근기둥 모양', ball: '공 모양' };
  // { 이름, 아이콘, 모양, 헷갈림 여부 }
  var THINGS = [
    { n: '주사위', i: '🎲', s: 'box' }, { n: '책', i: '📕', s: 'box' },
    { n: '선물 상자', i: '🎁', s: 'box' }, { n: '지우개', i: '🧽', s: 'box' },
    { n: '우유갑', i: '🥛', s: 'box', t: 1 },
    { n: '통조림', i: '🥫', s: 'cylinder' }, { n: '북', i: '🥁', s: 'cylinder' },
    { n: '연필꽂이', i: '🖍️', s: 'cylinder' }, { n: '김밥', i: '🍙', s: 'cylinder', t: 1 },
    { n: '두루마리 휴지', i: '🧻', s: 'cylinder' },
    { n: '축구공', i: '⚽', s: 'ball' }, { n: '농구공', i: '🏀', s: 'ball' },
    { n: '수박', i: '🍉', s: 'ball' }, { n: '구슬', i: '🔮', s: 'ball' },
    { n: '오렌지', i: '🍊', s: 'ball', t: 1 }
  ];

  return {
    id: 'shape3d',
    title: '여러 가지 모양',
    shapes: SHAPE_KO,
    things: THINGS,
    create: function (params, rng) {
      var p = params || {};
      var per = +p.per || 6;                 // 분류 게임에서 한 판에 나오는 물건 수
      return {
        // 모양 찾기(선다형) — "이 물건은 어떤 모양?"
        next: function () {
          var t = THINGS[Math.floor(rng() * THINGS.length)];
          var opts = ['box', 'cylinder', 'ball'];
          for (var i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
          }
          return {
            thing: t, prompt: KO.j(t.n, '은/는') + ' 어떤 모양일까요?',
            answer: t.s, options: opts, type: t.t ? 'tricky' : t.s,
            explain: KO.j(t.n, '은/는') + ' ' + KO.ida(SHAPE_KO[t.s]) +
              (t.t ? '. 겉모습에 속지 말고 생김새를 봐요!' : '')
          };
        },
        // 분류 게임 — 물건 여러 개를 한 판에
        deal: function () {
          var pool = THINGS.slice();
          for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t;
          }
          return pool.slice(0, per);
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span style="font-size:26px">' + q.thing.i + '</span>' +
        '<span style="margin-left:8px">' + q.thing.n + ' →</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return SHAPE_KO[q.answer]; },
    printHead: '물건의 모양을 □ 안에 쓰세요. (상자·둥근기둥·공)'
  };
}));
