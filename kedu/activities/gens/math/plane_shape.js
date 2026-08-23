/* gens/math/plane_shape.js — 평면도형 (3학년 수학 2단원)
 * 순수 함수·DOM 무관 (§9-3). sort 장르 계약: deal() → round, binOf(item, by) → bin key.
 *
 * type (§21-3 확정): line_kind · ray_dir · angle_read · right_angle ·
 *                    rt_triangle · rect_square · tricky_rotate
 * 한 판(round) = 한 유형. 그래야 "어느 기준에서 흔들리는지"가 byType으로 남는다.
 *
 * ★ 이 생성기가 도형을 **좌표로 계산**해 내보내고, 무대가 SVG로 그린다.
 *   그림 에셋(§21-4 #3)이 아니다 — 회전각·직각 여부가 데이터라서, 아이가 보는 도형과
 *   채점 기준이 같은 수에서 나온다. 일러스트를 쓰면 둘이 갈라진다.
 *
 * ★ rect_square의 바구니는 셋이다 — **정사각형은 직사각형이기도 하기 때문이다.**
 *   「직사각형 / 정사각형」 두 칸으로 가르면 "정사각형은 직사각형이 아니다"를 가르치게 된다.
 *   교과서 정의(네 각이 모두 직각 = 직사각형, 거기에 네 변이 같으면 정사각형)를 그대로 두려면
 *   칸이 「정사각형」·「직사각형만」·「둘 다 아님」이어야 한다. 3학년에게 어려운 게 아니라,
 *   포함 관계를 손으로 확인시키는 자리다.
 *
 * 차시 근거(실측 2026-08-21): l02 선의 종류 / l03 각 / l04 직각 /
 *   l05 직각삼각형("방향이 달라도 직각삼각형") / l06 직사각형과 정사각형.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['plane_shape'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var PT = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ'];

  // ── 판 정의 ───────────────────────────────────────────────────────
  var ROUNDS = {
    line_kind: {
      ko: '선의 종류', bins: [
        { k: 'segment', ko: '선분' }, { k: 'ray', ko: '반직선' }, { k: 'straight', ko: '직선' }],
      prompt: '선의 종류로 나눠요',
      hint: '끝이 둘 다 막히면 선분, 한쪽만 뻗으면 반직선, 양쪽 다 뻗으면 직선이에요.'
    },
    ray_dir: {
      ko: '반직선의 방향', bins: [
        { k: 'ab', ko: '반직선 ㄱㄴ' }, { k: 'ba', ko: '반직선 ㄴㄱ' }],
      prompt: '반직선의 이름으로 나눠요',
      hint: '반직선은 **시작하는 점을 먼저** 써요. ㄱ에서 시작하면 반직선 ㄱㄴ이에요.'
    },
    angle_read: {
      ko: '각의 꼭짓점', bins: [],       // 판마다 세 점이 바뀌므로 deal에서 만든다
      prompt: '각의 꼭짓점이 어디인지로 나눠요',
      hint: '각의 이름은 **가운데 글자가 꼭짓점**이에요. 각 ㄱㄴㄷ의 꼭짓점은 ㄴ.'
    },
    right_angle: {
      ko: '직각인가', bins: [
        { k: 'yes', ko: '직각' }, { k: 'no', ko: '직각이 아님' }],
      prompt: '직각인 것과 아닌 것으로 나눠요',
      hint: '직각은 종이를 반듯하게 두 번 접었을 때 생기는 각이에요. 방향은 상관없어요.'
    },
    rt_triangle: {
      ko: '직각삼각형', bins: [
        { k: 'yes', ko: '직각삼각형' }, { k: 'no', ko: '직각삼각형이 아님' }],
      prompt: '직각삼각형인 것과 아닌 것으로 나눠요',
      hint: '한 각이 직각이면 직각삼각형이에요. **돌아가 있어도** 직각삼각형이에요.'
    },
    rect_square: {
      ko: '직사각형과 정사각형', bins: [
        { k: 'square', ko: '정사각형' }, { k: 'rect', ko: '직사각형만' },
        { k: 'no', ko: '둘 다 아님' }],
      prompt: '정사각형 · 직사각형 · 둘 다 아님으로 나눠요',
      hint: '네 각이 모두 직각이면 직사각형. 거기에 네 변까지 같으면 정사각형이에요. ' +
            '**정사각형도 직사각형이지만**, 정사각형 칸이 있으면 그쪽으로 담아요.'
    },
    tricky_rotate: {
      ko: '돌아간 도형', bins: [
        { k: 'rt', ko: '직각삼각형' }, { k: 'rect', ko: '직사각형' },
        { k: 'no', ko: '둘 다 아님' }],
      prompt: '돌아가 있어도 이름은 그대로! 이름으로 나눠요',
      hint: '도형의 이름은 **생김새가 아니라 정의**로 정해져요. 돌려도 각과 변은 안 변해요.'
    }
  };
  var ORDER = ['line_kind', 'ray_dir', 'angle_read', 'right_angle',
               'rt_triangle', 'rect_square', 'tricky_rotate'];   // 교과서 차시 순서 (D22)

  // ── 물건 만들기 ───────────────────────────────────────────────────
  function makeLine(rng, kind, a, b) {
    return { kind: 'line', k: kind, a: a, b: b, tilt: ri(rng, -28, 28) };
  }
  function makeRay(rng, from) {                       // from: 'a'(ㄱ 시작) | 'b'(ㄴ 시작)
    return { kind: 'ray', from: from, a: 'ㄱ', b: 'ㄴ', tilt: ri(rng, -22, 22) };
  }
  function makeAngleName(rng, pts, vi) {              // 각 이름 카드 — 가운데가 꼭짓점
    var o = shuffle(rng, pts.slice());
    var v = pts[vi];
    var rest = o.filter(function (p) { return p !== v; });
    return { kind: 'name', text: '각 ' + rest[0] + v + rest[1], vertex: v };
  }
  function makeAngle(rng, isRight) {
    var deg = isRight ? 90 : pick(rng, [30, 40, 50, 60, 70, 110, 125, 140, 155]);
    return { kind: 'angle', deg: deg, rot: ri(rng, 0, 350), right: isRight };
  }
  function makeTri(rng, isRight, forceRot) {
    // 직각삼각형이 아닌 것은 예각·둔각 삼각형. 세 각 중 하나가 90이면 직각삼각형이다.
    var A = isRight ? 90 : pick(rng, [35, 45, 55, 65, 105, 120]);
    var B = isRight ? pick(rng, [30, 35, 40, 50, 55, 60]) : pick(rng, [40, 50, 60, 35]);
    if (!isRight && A + B >= 175) B = 40;
    if (!isRight && (A === 90 || B === 90 || 180 - A - B === 90)) B = B + 5;
    var rot = forceRot ? pick(rng, [18, 27, 34, 41, 52, 63, 71, 106, 128, 145, 198, 234, 301])
                       : pick(rng, [0, 0, 8, 90, 180, 270, 15]);
    return { kind: 'tri', right: isRight, a: A, b: B, rot: rot };
  }
  function makeQuad(rng, k, forceRot) {
    // k: 'square' 정사각형 / 'rect' 직사각형(정사각형 아님) / 'no' 네 각이 직각이 아님
    var w = 1, h = 1, skew = 0;
    if (k === 'rect') { w = 1; h = pick(rng, [0.55, 0.6, 0.65, 1.6, 1.7]); }
    if (k === 'no') {
      // 평행사변형·마름모·사다리꼴 — 네 각이 직각이 아니다
      skew = pick(rng, [16, 20, 24, -18, -22]);
      h = pick(rng, [0.7, 0.85, 1, 1.2]);
    }
    var rot = forceRot ? pick(rng, [17, 26, 33, 44, 58, 67, 112, 131, 209, 246, 317])
                       : pick(rng, [0, 0, 0, 90, 180, 12]);
    return { kind: 'quad', k: k, w: w, h: h, skew: skew, rot: rot };
  }

  // 한 판의 물건을 만들되, **바구니가 비지 않게** 각 범주를 최소 1개씩 보장한다.
  // 한 칸이 비면 아이가 "이 칸은 안 쓰나?"에 시간을 뺏긴다 (§6-3).
  function fill(rng, per, binKeys, maker) {
    var out = [];
    binKeys.forEach(function (k) { out.push(maker(k)); });
    while (out.length < per) out.push(maker(pick(rng, binKeys)));
    return shuffle(rng, out);
  }

  return {
    id: 'plane_shape',
    title: '평면도형',
    rounds: ORDER,

    create: function (params, rng) {
      var p = params || {};
      var by = p.by || 'mix';
      var per = +p.per || 6;
      var qi = 0;

      function dealOne(type) {
        var R = ROUNDS[type], bins = R.bins, items;

        if (type === 'line_kind') {
          items = fill(rng, per, ['segment', 'ray', 'straight'], function (k) {
            var a = PT[ri(rng, 0, 3)], b;
            do { b = PT[ri(rng, 0, 3)]; } while (b === a);
            return makeLine(rng, k, a, b);
          });
        } else if (type === 'ray_dir') {
          items = fill(rng, per, ['ab', 'ba'], function (k) {
            return makeRay(rng, k === 'ab' ? 'a' : 'b');
          });
        } else if (type === 'angle_read') {
          var pts = shuffle(rng, PT.slice(0, 4)).slice(0, 3);
          bins = pts.map(function (v) { return { k: v, ko: '꼭짓점이 ' + v }; });
          items = fill(rng, per, pts, function (k) {
            return makeAngleName(rng, pts, pts.indexOf(k));
          });
        } else if (type === 'right_angle') {
          items = fill(rng, per, ['yes', 'no'], function (k) { return makeAngle(rng, k === 'yes'); });
        } else if (type === 'rt_triangle') {
          items = fill(rng, per, ['yes', 'no'], function (k) { return makeTri(rng, k === 'yes', false); });
        } else if (type === 'rect_square') {
          items = fill(rng, per, ['square', 'rect', 'no'], function (k) { return makeQuad(rng, k, false); });
        } else {   // tricky_rotate — 전부 비스듬히 돌아가 있다. 생김새가 아니라 정의로 갈라야 한다.
          items = fill(rng, per, ['rt', 'rect', 'no'], function (k) {
            if (k === 'rt') return makeTri(rng, true, true);
            if (k === 'rect') return makeQuad(rng, pick(rng, ['rect', 'square']), true);
            return (rng() < 0.5) ? makeTri(rng, false, true) : makeQuad(rng, 'no', true);
          });
        }

        return { by: type, byKo: R.ko, bins: bins, items: items,
                 prompt: R.prompt, hint: R.hint, type: type };
      }

      return {
        deal: function () {
          var type = (by === 'mix') ? ORDER[qi++ % ORDER.length] : by;
          return dealOne(type);
        },
        // 채점 — 도형을 만든 수(각·변·회전)에서 그대로 나온다. 그림을 보고 정하지 않는다.
        binOf: function (it, type) {
          if (type === 'line_kind') return it.k;
          if (type === 'ray_dir') return (it.from === 'a') ? 'ab' : 'ba';
          if (type === 'angle_read') return it.vertex;
          if (type === 'right_angle') return it.right ? 'yes' : 'no';
          if (type === 'rt_triangle') return it.right ? 'yes' : 'no';
          if (type === 'rect_square') return it.k;          // square · rect · no
          // tricky_rotate
          if (it.kind === 'tri') return it.right ? 'rt' : 'no';
          return (it.k === 'no') ? 'no' : 'rect';           // 정사각형도 직사각형이다
        },
        // 오분류 때 띄울 근거 문장 — 버그가 아니라 수업이다
        reasonOf: function (it, type, wantKo) {
          if (type === 'ray_dir')
            return '반직선은 **시작하는 점을 먼저** 써요. 이건 「' + wantKo + '」예요.';
          if (type === 'angle_read')
            return '각의 이름은 **가운데 글자가 꼭짓점**이에요. ' + it.text + '의 꼭짓점은 ' + it.vertex + '.';
          if (type === 'rect_square' && it.k === 'square')
            return '네 각이 직각이고 **네 변까지 같아요** — 정사각형이에요. (정사각형도 직사각형이랍니다)';
          if (type === 'rect_square' && it.k === 'rect')
            return '네 각은 모두 직각인데 변의 길이가 달라요 — 직사각형이에요.';
          if (type === 'tricky_rotate')
            return '돌아가 있어도 각과 변은 그대로예요. 이건 「' + wantKo + '」예요.';
          if (type === 'rt_triangle')
            return it.right ? '한 각이 직각이에요 — 방향이 달라도 직각삼각형이에요.'
                            : '직각인 각이 하나도 없어요.';
          if (type === 'right_angle')
            return it.right ? '반듯하게 두 번 접은 각과 꼭 맞아요 — 직각이에요.'
                            : '직각보다 ' + (it.deg < 90 ? '작아요' : '커요') + '.';
          return '이건 「' + wantKo + '」이에요.';
        }
      };
    }
  };
}));
