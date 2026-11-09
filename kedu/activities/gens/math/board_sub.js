/* gens/math/board_sub.js — 말판 뺄셈 놀이 (1학년 2학기 수학 6단원 「덧셈과 뺄셈(3)」 4·5차시 「뺄셈을 알아볼까요」)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + board(말판 18칸: 0 = 출발·도착, 식 칸 {k:'sub',a,b} · 특별 칸 {k:'fwd'|'back'|'rest'|'swap'}) · from·to(내 말) · palFrom·palTo(짝 말)
 *   · events(주사위·특별 칸 일어난 일) · done(이 말판에서 이미 푼 칸) · lap(몇 바퀴째) · fresh(새 말판의 첫 판)
 * 교과서판(2026-11-09): 『수학』 137쪽 「뺄셈 놀이」(말판 — 주사위를 굴려 나온 수만큼 칸을 이동하고 칸의 식을 계산,
 *   틀리면 원래 있던 자리로, 도착 지점에 빨리 도착하면 이김 · 지도서 303쪽 인원 2명 · 주사위 · 말).
 *   첫 말판 = 교과서 말판 그대로(출발 → 36−2 · 한 칸 앞으로 · 57−21 · 33−11 · 50−30 · 25−4 · 한 칸 뒤로 · 29−5 · 46−10
 *   · 한 번 쉬기 · 38−8 · 40−10 · 자리 이동하기 · 64−13 · 49−4 · 한 칸 뒤로 · 70−20 → 도착).
 *   도착하면 지도서 303쪽 「학생 스스로 말판을 만들어 적절한 뺄셈 문제」처럼 같은 길에 새 식을 놓은 말판으로 한 바퀴 더.
 *   특별 칸: 한 칸 앞으로·뒤로는 그대로, 한 번 쉬기는 짝이 한 번 더 간 뒤 다시 굴림, 자리 이동하기는 짝과 말 자리를 바꿈.
 * 보기의 다른 수 = 지도서 오답 유형(302·303쪽): 같은 모형끼리 빼지 않음(34−12 대신 34−21처럼 빼는 수의 자리를 바꿈)
 *   · 빼는 몇을 십 모형으로(36−2 → 16) · 몇십을 몇으로(50−30 → 47) · 한 자리만 빼고 끝냄 · 빼지 않고 더함.
 * type: sub_ones((몇십몇)−(몇)) · sub_tens((몇십)−(몇십)·(몇십몇)−(몇십)) · sub_both((몇십몇)−(몇십몇))
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['board_sub'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var LEN = 18;                                   // 0 = 출발·도착, 1~17 = 길
  var SPECIAL = { 2: 'fwd', 7: 'back', 10: 'rest', 13: 'swap', 16: 'back' };
  var SP_NAME = { fwd: '한 칸 앞으로', back: '한 칸 뒤로', rest: '한 번 쉬기', swap: '자리 이동하기' };
  var BOOK = { 1: [36, 2], 3: [57, 21], 4: [33, 11], 5: [50, 30], 6: [25, 4], 8: [29, 5], 9: [46, 10], 11: [38, 8], 12: [40, 10], 14: [64, 13], 15: [49, 4], 17: [70, 20] };

  function typeOf(a, b) { return b < 10 ? 'sub_ones' : (b % 10 === 0 ? 'sub_tens' : 'sub_both'); }
  function makeCell(rng, type) {
    var t, u, s, v;
    if (type === 'sub_ones') { t = ri(rng, 2, 9); u = ri(rng, 1, 9); return [t * 10 + u, ri(rng, 1, u)]; }
    if (type === 'sub_tens') { t = ri(rng, 2, 9); s = ri(rng, 1, t - 1); return [t * 10 + (rng() < 0.5 ? 0 : ri(rng, 1, 9)), s * 10]; }
    t = ri(rng, 3, 9); u = ri(rng, 1, 9); s = ri(rng, 1, t - 1); v = ri(rng, 1, u);
    return [t * 10 + u, s * 10 + v];
  }
  function makeBoard(rng, book) {
    var bd = [{ k: 'start' }], bag = [];
    for (var p = 1; p < LEN; p++) {
      if (SPECIAL[p]) { bd.push({ k: SPECIAL[p] }); continue; }
      var ab;
      if (book) ab = BOOK[p];
      else { if (!bag.length) bag = shuffle(rng, ['sub_ones', 'sub_tens', 'sub_both']); ab = makeCell(rng, bag.pop()); }
      bd.push({ k: 'sub', a: ab[0], b: ab[1] });
    }
    return bd;
  }
  function explainOf(a, b) {
    var at = Math.floor(a / 10), au = a % 10, bt = Math.floor(b / 10), bu = b % 10, r = a - b;
    if (b < 10) return a + '−' + b + ' — 일 모형끼리 ' + au + '−' + b + '=' + (au - b) + ', 십 모형 ' + at + '개는 그대로 → ' + KO.ida(r) + '.';
    if (bu === 0) return a + '−' + b + ' — 십 모형끼리 ' + at + '−' + bt + '=' + (at - bt) + ', 일 모형 ' + au + '개는 그대로 → ' + KO.ida(r) + '.';
    return a + '−' + b + ' — 십 모형끼리 ' + at + '−' + bt + '=' + (at - bt) + ', 일 모형끼리 ' + au + '−' + bu + '=' + (au - bu) + ' → ' + KO.ida(r) + '.';
  }
  function trapsOf(a, b) {
    var at = Math.floor(a / 10), au = a % 10, bt = Math.floor(b / 10), bu = b % 10, P = [], S = [a - b + 1, a - b - 1, a + b];
    if (b < 10) { P.push(a - b * 10); P.push(au - b); }                                      // 36−2 → 16 · 일의 자리만
    else if (bu === 0) { P.push(a - bt); if (au === 0) P.push(at - bt); S.push(a - b + 10, a - b - 10); }   // 50−30 → 47 · 2
    else { P.push(a - (bu * 10 + bt)); P.push(a - bt * 10); P.push(a - bu); S.push(a - b + 10, a - b - 10); }  // 57−12 · 십만 · 일만
    return { P: P, S: S };
  }

  return {
    id: 'board_sub',
    title: '말판 뺄셈 놀이',
    LEN: LEN, SP_NAME: SP_NAME, typeOf: typeOf,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var board = makeBoard(rng, book), me = 0, pal = 0, lap = 1, done = [], fresh = true;
      function isSub(p) { return p > 0 && board[p].k === 'sub'; }
      return {
        next: function () {
          var from = me, palFrom = pal, ev = [], guard = 0;
          function roll() {
            var r = ri(rng, 1, 6); ev.push({ kind: 'roll', v: r });
            if (me + r >= LEN) {                                         // 도착 → 새 말판으로 한 바퀴 더
              lap++; board = makeBoard(rng, false); done = []; fresh = true;
              ev.push({ kind: 'arrive', text: '🏁 도착! 새 말판으로 한 바퀴 더' });
              me = 0; pal = 0; return roll();
            }
            me += r;
          }
          roll();
          while (!isSub(me) && guard++ < 8) {
            var k = me > 0 ? board[me].k : 'start';
            if (k === 'fwd') { me += 1; ev.push({ kind: 'note', text: '➡️ 한 칸 앞으로' }); }
            else if (k === 'back') { me -= 1; ev.push({ kind: 'note', text: '⬅️ 한 칸 뒤로' }); }
            else if (k === 'rest') {
              ev.push({ kind: 'note', text: '😴 한 번 쉬기 — 짝이 한 번 더 가요' });
              pal = (pal + ri(rng, 1, 6)) % LEN; roll();
            } else if (k === 'swap' && pal !== me) {
              var t = pal; pal = me; me = t; ev.push({ kind: 'note', text: '🔄 자리 이동하기 — 짝과 말 자리를 바꿔요' });
            } else { me = (me % (LEN - 1)) + 1; ev.push({ kind: 'note', text: '👣 식이 있는 칸까지 한 칸 더' }); }
          }
          if (!isSub(me)) { while (!isSub(me)) me = (me % (LEN - 1)) + 1; }      // 안전판(실제로는 오지 않음)
          pal = (pal + ri(rng, 1, 6)) % LEN;                                       // 짝의 차례(짝은 언제나 바르게 계산)
          var c = board[me], a = c.a, b = c.b, r = a - b, type = typeOf(a, b), tr = trapsOf(a, b);
          var seen = {}; seen[r] = 1;
          function okw(w) { if (w < 0 || w > 99 || seen[w]) return false; seen[w] = 1; return true; }
          var wrong = shuffle(rng, tr.P).filter(okw).slice(0, 1);
          wrong = wrong.concat(shuffle(rng, tr.S.concat(tr.P)).filter(okw)).slice(0, 2);
          var q = {
            board: board.map(function (x) { return x.k === 'sub' ? { k: 'sub', a: x.a, b: x.b } : { k: x.k }; }),
            from: from, to: me, palFrom: palFrom, palTo: pal, events: ev, done: done.slice(), lap: lap, fresh: fresh,
            a: a, b: b, prompt: a + '−' + b + '=?',
            options: shuffle(rng, [String(r)].concat(wrong.map(String))), answer: String(r), type: type, explain: explainOf(a, b)
          };
          if (done.indexOf(me) < 0) done.push(me);
          fresh = false;
          return q;
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) { return '<span class="w-num">' + q.a + ' − ' + q.b + '</span> = <span class="w-box">(　)</span>'; },
    printAnswer: function (q) { return q.answer; },
    printHead: '말판의 뺄셈식을 계산하세요. (십 모형은 십 모형끼리, 일 모형은 일 모형끼리)'
  };
}));
