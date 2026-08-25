/* gens/math/number_step.js — 1만큼 더 큰 수·작은 수와 0 (1학년 수학 1단원 후반, 수24-31쪽)
 * 순수 함수·DOM 무관 (§9-3). 게임·활동지 공유.
 * params: { max: 5|9, kind: 'step'|'zero'|'mix' }
 *   max  — 수 범위. 옵션 밖 값은 §6-9-4대로 **아래로만** 내린다 (조용히 올리지 않는다).
 *   kind — step(1만큼 큰·작은 수만) / zero(0만) / mix(섞기, 기본)
 * next() → { cells, askIdx, showNum, prompt, answer, options, type, explain }
 *   cells   [{ n, items }] 세 칸. 한 칸이 물음표(askIdx)다.
 *   showNum 칸 아래 수를 적는가 — false면 물건만 보이는 세기 문항이다(gone)
 *
 * type (§21-3 사전 등재 = 이 넷이 전부다):
 *   more1     1만큼 더 큰 수      — 오른쪽 칸
 *   less1     1만큼 더 작은 수    — 왼쪽 칸
 *   zero_edge 1보다 1만큼 더 작은 수 (0) — "1 앞에는 수가 없다"는 오개념을 직접 겨눈다
 *   gone      아무것도 없으면 0   — 수를 감추고 빈 칸을 세는 문항 (l09 「풀을 하나씩 가져가요」)
 * zero_edge를 less1에서 떼어 낸 이유: 1에서 하나를 덜어 낸 자리에 0이 있다는 것은
 * 크기 감각이 아니라 **0이 수라는 것**을 아는가의 신호다 (compare50 boundary·number_line
 * decade_cross와 같은 논거 — 경계는 별도의 칸으로 본다).
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['number_step'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

  var MAX_OPTS = [5, 9];
  /* §6-9-4 — 옵션 밖 값은 가장 가까운 **아래** 옵션으로. 위로 올리지 않는다. */
  function clampDown(v, opts, dflt) {
    var x = +v;
    if (!isFinite(x)) return dflt;
    var best = null;
    for (var i = 0; i < opts.length; i++) if (opts[i] <= x && (best === null || opts[i] > best)) best = opts[i];
    return best === null ? opts[0] : best;
  }

  function cell(n, showNum) { return { n: showNum ? n : null, items: n }; }

  return {
    id: 'number_step',
    title: '1만큼 더 큰 수와 작은 수',
    create: function (params, rng) {
      var p = params || {};
      var max = clampDown(p.max, MAX_OPTS, 9);
      var kind = ['step', 'zero', 'mix'].indexOf(p.kind) >= 0 ? p.kind : 'mix';

      function pickType() {
        if (kind === 'zero') return rng() < 0.5 ? 'zero_edge' : 'gone';
        if (kind === 'step') return rng() < 0.5 ? 'more1' : 'less1';
        var r = rng();
        if (r < 0.35) return 'more1';
        if (r < 0.70) return 'less1';
        return r < 0.85 ? 'zero_edge' : 'gone';
      }

      return {
        next: function () {
          var type = pickType();
          var cells, askIdx, answer, prompt, explain, showNum = true;

          if (type === 'more1') {
            // [b-1] [b] [?]  — 왼쪽 두 칸이 1만큼씩 커지는 것을 보여 준다 (l08 「옆 칸은 1만큼 차이」)
            // b=1이면 왼쪽 칸이 0이 되는데, 0은 l09에서야 배운다 — 그때는 두 칸으로 낸다 (§6-9-2)
            var b = ri(rng, 1, max - 1);
            cells = b > 1 ? [cell(b - 1, true), cell(b, true), null] : [cell(b, true), null];
            askIdx = cells.length - 1; answer = String(b + 1);
            prompt = b + '보다 1만큼 더 큰 수는 얼마일까요?';
            explain = '옆 칸으로 한 걸음 가면 1만큼 커져요. ' + b + ' 다음은 ' + KO.ida(b + 1);

          } else if (type === 'less1') {
            // [?] [b] [b+1]
            var c = ri(rng, 2, max - 1);
            cells = [null, cell(c, true), cell(c + 1, true)];
            askIdx = 0; answer = String(c - 1);
            prompt = c + '보다 1만큼 더 작은 수는 얼마일까요?';
            explain = '앞 칸으로 한 걸음 오면 1만큼 작아져요. ' + c + ' 앞은 ' + KO.ida(c - 1);

          } else if (type === 'zero_edge') {
            // [?] [1] [2] — 1 앞에도 칸이 있다
            cells = [null, cell(1, true), cell(2, true)];
            askIdx = 0; answer = '0';
            prompt = '1보다 1만큼 더 작은 수는 얼마일까요?';
            explain = '1 앞에도 칸이 있어요. 하나도 없는 그 칸의 수가 바로 0이에요.';

          } else {
            // gone — 수를 감추고 물건만 보여 준다. 하나씩 없어져 빈 칸이 된다 (l09)
            var s = ri(rng, 2, Math.min(4, max));
            cells = [cell(s, false), cell(s - 1, false), cell(0, false)];
            askIdx = 2; answer = '0'; showNum = false;
            prompt = '마지막 칸에는 몇 개가 있을까요?';
            explain = '하나씩 없어져서 아무것도 남지 않았어요. 아무것도 없으면 0이에요.';
          }

          // 답 보기 — 범위 안의 수에서만 고른다 (§6-9-2 단원 적합성)
          var opts = [answer];
          var guard = 0;
          while (opts.length < 4 && guard++ < 60) {
            var cand = String(ri(rng, 0, max));
            if (opts.indexOf(cand) < 0) opts.push(cand);
          }
          for (var j = opts.length - 1; j > 0; j--) {
            var k = Math.floor(rng() * (j + 1)), t = opts[j]; opts[j] = opts[k]; opts[k] = t;
          }

          return {
            cells: cells, askIdx: askIdx, showNum: showNum,
            prompt: prompt, answer: answer, options: opts, type: type, explain: explain
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      var s = '';
      for (var i = 0; i < q.cells.length; i++) {
        var c = q.cells[i];
        if (i === q.askIdx || !c) { s += '<span class="w-box"> </span>'; continue; }
        s += '<span style="display:inline-block;min-width:34px;text-align:center">' +
             (q.showNum ? c.n : new Array(c.items + 1).join('●')) + '</span>';
      }
      return '<span style="font-size:20px;letter-spacing:3px">' + s + '</span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '빈 칸에 알맞은 수를 쓰세요.'
  };
}));
