/* gens/math/same_card.js — 같은 수 모으기 놀이 (1학년 2학기 수학 1단원 「100까지의 수」 2·3·4차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + n(모으는 수) · hand(손에 든 카드 셋) · need(모자란 카드 종류) · cards(보기 카드 셋) · cardHtml(카드) — 무대·활동지가 같은 카드 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 23쪽 「같은 수 모으기 놀이」(꾸러미 4 — 같은 수를 나타내는 연결 모형·숫자·한자어 수사·우리말 수사
 *   카드 4장을 모으면 「모았다!」) + 19쪽 「같은 수 찾기 놀이」(60·70·80·90 카드 16장, 2차시).
 *   손에 같은 수 카드 3장이 있고 한 장이 모자랄 때, 오른쪽 친구가 줄 카드 셋 가운데 알맞은 한 장을 고른다.
 *   처음 두 판은 교과서 수(82 · 63 · 78 · 88 · 98 · 99 · 53 — 23쪽 손에 든 카드 82·육십삼·일흔여덟, 22쪽 유과·약과,
 *   23쪽 연결 모형 묻고 답하기 / 몇십 판은 19쪽 60·70·80·90).
 * 보기의 다른 카드 = 지도서 오답 유형(152·156·157쪽):
 *   10개씩 묶음의 수만 씀(「10개씩 묶음 8개를 수로 나타내면 8이에요」) · 99 대신 909처럼 씀 · 묶음과 낱개를 바꿈(78 → 87)
 *   · 두 읽기를 섞음(「오십셋, 쉰삼 등과 같이 혼용」) · 묶음이나 낱개 하나 차이.
 * type: blocks(연결 모형 카드가 모자람) · digit(숫자 카드) · sino(「칠십팔」처럼 읽는 카드) · native(「일흔여덟」처럼 읽는 카드)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['same_card'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var SINO_T = ['', '십', '이십', '삼십', '사십', '오십', '육십', '칠십', '팔십', '구십'];
  var SINO_U = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  var NAT_T = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
  var NAT_U = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
  function sino(n) { return SINO_T[Math.floor(n / 10)] + SINO_U[n % 10]; }
  function native(n) { return NAT_T[Math.floor(n / 10)] + NAT_U[n % 10]; }
  var KINDS = ['blocks', 'digit', 'sino', 'native'];
  var KIND_NAME = { blocks: '연결 모형', digit: '숫자', sino: '「칠십팔」처럼 읽는', native: '「일흔여덟」처럼 읽는' };

  /* 카드 한 장 = { kind, t(10개씩 묶음), u(낱개), text } — 연결 모형 카드는 t·u 로 그린다(값 n 과 따로) */
  function card(kind, n) {
    var t = Math.floor(n / 10), u = n % 10;
    if (kind === 'blocks') return { kind: kind, t: t, u: u, text: '10개씩 묶음 ' + t + '개 · 낱개 ' + u + '개' };
    if (kind === 'digit') return { kind: kind, text: String(n) };
    if (kind === 'sino') return { kind: kind, text: sino(n) };
    return { kind: kind, text: native(n) };
  }
  function keyOf(c) { return c.kind === 'blocks' ? 'b' + c.t + '-' + c.u : c.kind.charAt(0) + c.text; }

  /* 카드 그림 — 연결 모형은 막대(10개씩 묶음)와 낱개 칸을 그대로 센다 */
  function cardHtml(c, cls) {
    var h = '<span class="sc sc-' + c.kind + (cls ? ' ' + cls : '') + '" data-kind="' + c.kind + '"';
    if (c.kind === 'blocks') {
      h += ' data-t="' + c.t + '" data-u="' + c.u + '" aria-label="' + c.text + '"><span class="sc-rods">';
      for (var i = 0; i < c.t; i++) h += '<i class="rod"></i>';
      h += '</span><span class="sc-ones">';
      for (var k = 0; k < c.u; k++) h += '<i class="one"></i>';
      return h + '</span></span>';
    }
    return h + '>' + c.text + '</span>';
  }

  /* 보기의 덫 — 모자란 종류마다 지도서 오답 유형에서 고른다 */
  function traps(kind, n) {
    var t = Math.floor(n / 10), u = n % 10, out = [];
    function nOk(x) { return x >= 10 && x <= 99 && x !== n; }
    var near = u === 0 ? [n + 10, n - 10] : [n + 1, n - 1, n + 10, n - 10];   // 몇십 판(2차시)은 다른 몇십만
    if (kind === 'digit') {
      if (u === 0) out.push({ kind: 'digit', text: String(t) });                 // 묶음의 수만 (80 → 8)
      else out.push({ kind: 'digit', text: String(t) + '0' + String(u) });       // 909 처럼 (78 → 708)
      if (u > 0 && u !== t) out.push(card('digit', u * 10 + t));                 // 묶음·낱개 바꿈
      near.forEach(function (x) { if (nOk(x)) out.push(card('digit', x)); });
    } else if (kind === 'sino') {
      if (u === 0) out.push({ kind: 'sino', text: SINO_U[t] });                  // 「팔」 — 묶음의 수만
      else out.push({ kind: 'sino', text: SINO_T[t] + NAT_U[u] });               // 섞어 읽기 (칠십여덟)
      if (u > 0 && u !== t) out.push(card('sino', u * 10 + t));
      near.forEach(function (x) { if (nOk(x)) out.push(card('sino', x)); });
    } else if (kind === 'native') {
      if (u === 0) out.push({ kind: 'native', text: NAT_U[t] });                 // 「여덟」 — 묶음의 수만
      else out.push({ kind: 'native', text: NAT_T[t] + SINO_U[u] });             // 섞어 읽기 (일흔팔)
      if (u > 0 && u !== t) out.push(card('native', u * 10 + t));
      near.forEach(function (x) { if (nOk(x)) out.push(card('native', x)); });
    } else {
      if (u === 0) out.push({ kind: 'blocks', t: 0, u: t, text: '10개씩 묶음 0개 · 낱개 ' + t + '개' });   // 묶음 대신 낱개 t개
      else if (u !== t) out.push(card('blocks', u * 10 + t));                     // 묶음·낱개 바꿈
      near.forEach(function (x) { if (nOk(x)) out.push(card('blocks', x)); });
    }
    return out;
  }

  var BOOK = [82, 63, 78, 88, 98, 99, 53];   // 『수학』 22~23쪽
  var BOOK_TENS = [60, 70, 80, 90];          // 『수학』 18~19쪽

  function build(rng, n, kind) {
    var have = KINDS.filter(function (k) { return k !== kind; });
    var hand = shuffle(rng, have.map(function (k) { return card(k, n); }));
    var right = card(kind, n), seen = {}, wrong = [];
    seen[keyOf(right)] = 1;
    var cand = traps(kind, n), first = cand.shift();
    if (first && !seen[keyOf(first)]) { seen[keyOf(first)] = 1; wrong.push(first); }   // 지도서 덫 하나는 꼭
    shuffle(rng, cand).forEach(function (c) { if (wrong.length < 2 && !seen[keyOf(c)]) { seen[keyOf(c)] = 1; wrong.push(c); } });
    var cards = shuffle(rng, [right].concat(wrong));
    var t = Math.floor(n / 10), u = n % 10;
    var how = u ? '10개씩 묶음 ' + t + '개와 낱개 ' + u + '개' : '10개씩 묶음 ' + t + '개';
    var ex = how + ' — ' + n + ', ' + sino(n) + ' 또는 ' + native(n) + '. 네 장이 모두 같은 수를 나타내요. 「모았다!」';
    return {
      n: n, need: kind, hand: hand, cards: cards,
      prompt: '같은 수 ' + n + ' 카드 4장을 모으려면? (' + KIND_NAME[kind] + ' 카드)',
      options: cards.map(keyOf), answer: keyOf(right), type: kind, explain: ex
    };
  }

  return {
    id: 'same_card',
    title: '같은 수 모으기',
    cardHtml: cardHtml, keyOf: keyOf, sino: sino, native: native,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var tens = params && params.range === 'tens';
      var order = shuffle(rng, (tens ? BOOK_TENS : BOOK).slice()), qi = 0, kinds = [];
      return {
        next: function () {
          if (!kinds.length) kinds = shuffle(rng, KINDS.slice());        // 네 종류가 고르게 돈다
          var kind = kinds.pop(), n;
          if (book && qi < 2) n = order[qi];
          else n = tens ? 10 * ri(rng, 6, 9) : (rng() < 0.15 ? 10 * ri(rng, 6, 9) : ri(rng, 51, 99));   // 몇십은 2차시의 60·70·80·90
          qi++;
          return build(rng, n, kind);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      return q.hand.map(function (c) { return cardHtml(c); }).join(' ') + ' <span class="w-box">(　　　)</span>';
    },
    printAnswer: function (q) { var c = q.cards.filter(function (x) { return keyOf(x) === q.answer; })[0]; return c.kind === 'blocks' ? '10개씩 묶음 ' + c.t + '개, 낱개 ' + c.u + '개' : c.text; },
    printHead: '같은 수를 나타내는 카드 4장을 모으려고 해요. 모자란 카드를 쓰세요. (연결 모형은 묶음과 낱개의 수로)'
  };
}));
