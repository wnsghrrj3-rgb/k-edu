/* gens/math/pattern_next.js — 규칙 만들기 놀이 (1학년 2학기 수학 5단원 「규칙 찾기」 2·3·4·5·6차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + seq(늘어놓은 것 — 빈칸은 null) · blank(빈칸 자리) · unit(반복되는 부분, 수 배열은 null) · step(커지거나 작아지는 수)
 *   · tokenHtml(조각) — 무대와 활동지가 같은 조각 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 113쪽 「규칙 만들기 놀이」(짝이나 모둠끼리 자연물로 규칙을 만들고, 친구가 「다음 순서로 놓았어」)
 *   + 112쪽 「친구의 규칙처럼 만들어 보세요」 + 116~117쪽 수 배열 · 118~119쪽 수 배열표(커지는 규칙).
 *   친구가 늘어놓은 규칙을 보고 빈칸(다음 순서 또는 가운데)에 놓을 것을 고른다. 처음 두 판은 교과서 규칙:
 *   소화기·안전 모자(112) · 의자 노랑·파랑·파랑(112) · 노랑·노랑·빨강·빨강(113) · 바둑돌 검정·검정·흰(113) · 솔방울·돌멩이·돌멩이(113 놀이)
 *   · 나뭇잎·나뭇가지(113 놀이) · 꽃 분홍·흰(111) · 익힘 71 양말·양말·모자 · 주사위 2·5 · 116~117 수 3·7 · 1·1·6 · 4·4·9 · 5·7·7 · 5·7·5
 *   · 15부터 1씩 · 1부터 2씩 · 28부터 2씩 작아지는 수.
 * 보기의 다른 것 = 지도서 오답 유형(272·273·277쪽): 반복되는 부분을 짧게 잡음(노랑·파랑·파랑을 노랑·파랑 번갈아로)
 *   · 규칙에 없는 것을 놓음 · 수 배열에서 커지는 수를 하나 덜/더 셈 · 작아지는 배열을 커지게 이음.
 * type: ab(두 가지가 하나씩 번갈아) · double(한 가지가 두 번 이어지는 반복 — 1·1·6, 노랑·파랑·파랑, 노랑·노랑·빨강·빨강)
 *       · step(수가 일정하게 커지거나 작아짐)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['pattern_next'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* 조각 — 색(원)·물건(그림 글자)·수(수 판) */
  var NAME = { Y: '노란색', B: '파란색', R: '빨간색', G: '초록색', K: '검은 바둑돌', W: '흰 바둑돌', P: '분홍 꽃', F: '흰 꽃',
    ext: '소화기', helm: '안전 모자', sock: '양말', cap: '모자', leaf: '나뭇잎', twig: '나뭇가지', stone: '돌멩이', pine: '솔방울',
    pencil: '연필', star: '별', heart: '하트' };
  var EMO = { P: '🌸', F: '💮', ext: '🧯', helm: '⛑️', sock: '🧦', cap: '🧢', leaf: '🍂', twig: '🪵', stone: '🪨', pencil: '✏️', star: '⭐', heart: '💛' };
  var POOL = { color: ['Y', 'B', 'R', 'G'], stone: ['K', 'W'], thing: ['ext', 'helm', 'sock', 'cap', 'leaf', 'twig', 'stone', 'pine', 'pencil', 'star', 'heart', 'P', 'F'] };
  function nameOf(t) { return /^n\d+$/.test(t) ? t.slice(1) : NAME[t]; }
  function catOf(t) { return /^n\d+$/.test(t) ? 'num' : (POOL.color.indexOf(t) >= 0 ? 'color' : (POOL.stone.indexOf(t) >= 0 ? 'stone' : 'thing')); }
  var PINE = '<svg class="pn-pine" viewBox="0 0 40 48" aria-hidden="true"><ellipse cx="20" cy="27" rx="13" ry="18" fill="#92400e"/>' +
    '<path d="M9 20 Q20 26 31 20 M8 29 Q20 35 32 29 M10 38 Q20 43 30 38 M20 10 V44" stroke="#fde68a" stroke-width="2" fill="none"/><rect x="18" y="3" width="4" height="8" rx="2" fill="#65a30d"/></svg>';
  function tokenHtml(t) {
    if (t === null) return '<span class="pn pn-blank" data-t="">?</span>';
    var h = '<span class="pn pn-' + catOf(t) + '" data-t="' + t + '" aria-label="' + nameOf(t) + '">';
    if (/^n\d+$/.test(t)) h += t.slice(1);
    else if (t === 'pine') h += PINE;
    else if (EMO[t]) h += EMO[t];
    else h += '<i class="pn-dot pn-' + t + '"></i>';
    return h + '</span>';
  }

  /* 교과서 판 */
  function N(a) { return a.map(function (x) { return 'n' + x; }); }
  var BOOK = [
    { unit: ['ext', 'helm'] }, { unit: ['Y', 'B', 'B'] }, { unit: ['Y', 'Y', 'R', 'R'] }, { unit: ['K', 'K', 'W'] },
    { unit: ['pine', 'stone', 'stone'] }, { unit: ['leaf', 'twig'] }, { unit: ['P', 'F'] }, { unit: ['sock', 'sock', 'cap'] },
    { unit: N([2, 5]) }, { unit: N([3, 7]) }, { unit: N([1, 1, 6]) }, { unit: N([4, 4, 9]) }, { unit: N([5, 7, 7]) }, { unit: N([5, 7, 5]) },
    { start: 15, step: 1 }, { start: 1, step: 2 }, { start: 28, step: -2 }
  ];
  function typeOfUnit(u) { return u.length === 2 ? 'ab' : 'double'; }

  function buildRepeat(rng, unit, endBlank) {
    var L = unit.length, len, blank;
    if (endBlank) { len = L * 2 + ri(rng, 1, L); blank = len - 1; }          // 반복을 두 번 넘게 보여 주고 다음 순서
    else { len = L * 3; blank = ri(rng, L, len - 2); }                         // 한 번은 온전히 보인 뒤 가운데 빈칸
    var seq = [], ans;
    for (var i = 0; i < len; i++) seq.push(unit[i % L]);
    ans = seq[blank]; seq[blank] = null;
    var distinct = unit.filter(function (x, i) { return unit.indexOf(x) === i; });
    var wrong = distinct.filter(function (x) { return x !== ans; });
    var cat = catOf(ans), foreign;
    if (cat === 'num') { do { foreign = 'n' + ri(rng, 1, 9); } while (unit.indexOf(foreign) >= 0); }
    else { var pool = (cat === 'stone' ? POOL.color : POOL[cat]).filter(function (x) { return unit.indexOf(x) < 0; }); foreign = pick(rng, pool); }
    wrong = wrong.slice(0, 1).concat([foreign]);
    var type = typeOfUnit(unit);
    var ex = '반복되는 부분은 「' + unit.map(nameOf).join(', ') + '」 — 빈칸에는 ' + KO.j(nameOf(ans), '이/가') + ' 와요.';
    if (type === 'double') { var twice = unit.filter(function (x) { return unit.filter(function (y) { return y === x; }).length > 1; })[0];
      ex += ' ' + KO.j(nameOf(twice), '이/가') + ' 두 번 이어지는 곳을 하나로 세지 않아요.'; }
    return { seq: seq, blank: blank, unit: unit.slice(), step: null, ans: ans, wrong: wrong, type: type, explain: ex };
  }
  function buildStep(rng, start, step, endBlank) {
    var len = ri(rng, 6, 7), seq = [];
    for (var i = 0; i < len; i++) seq.push(start + step * i);
    var blank = endBlank ? len - 1 : ri(rng, 2, len - 2), v = seq[blank];
    var cands = [v + 1, v - 1, v + step, blank > 0 ? seq[blank - 1] - step : v - step];   // 하나 덜/더 · 한 번 더 뜀 · 거꾸로
    var seen = {}; seen[v] = 1;
    var wrong = shuffle(rng, cands.filter(function (w) { if (w < 0 || w > 100 || seen[w]) return false; seen[w] = 1; return true; })).slice(0, 2);
    var ex = Math.abs(step) + '씩 ' + (step > 0 ? '커져요' : '작아져요') + ' — 빈칸은 ' + KO.ida(v);
    return { seq: seq.map(function (x, i) { return i === blank ? null : 'n' + x; }), blank: blank, unit: null, step: step,
      ans: 'n' + v, wrong: wrong.map(function (x) { return 'n' + x; }), type: 'step', explain: ex + '.' };
  }
  function makeRandom(rng, type, only) {
    if (type === 'step') {
      var step = pick(rng, [1, 2, 5, 10, -1, -2, -10]), len = 7, start;
      if (step > 0) start = ri(rng, 1, 100 - step * len); else start = ri(rng, -step * len, 99);
      if (Math.abs(step) === 10) start = step > 0 ? ri(rng, 1, 30) : ri(rng, 70, 99);
      return { start: start, step: step };
    }
    var cat = only === 'number' ? 'num' : pick(rng, only === 'shape' ? ['color', 'thing', 'thing'] : ['color', 'thing', 'thing', 'num']), a, b;
    if (cat === 'num') { a = 'n' + ri(rng, 1, 9); do { b = 'n' + ri(rng, 1, 9); } while (b === a); }
    else { var pool = shuffle(rng, POOL[cat].slice()); a = pool[0]; b = pool[1]; }
    if (type === 'ab') return { unit: [a, b] };
    return { unit: pick(rng, [[a, a, b], [a, b, b], [a, a, b, b], [a, b, a]]) };
  }

  return {
    id: 'pattern_next',
    title: '규칙 만들기 놀이',
    tokenHtml: tokenHtml, nameOf: nameOf,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var only = params && params.kind;            // shape(물건·색, 2~4차시) · number(수 배열, 5~6차시) · mix
      var list = BOOK.filter(function (b) { return only === 'shape' ? b.unit && b.unit[0].charAt(0) !== 'n' : only === 'number' ? !(b.unit && b.unit[0].charAt(0) !== 'n') : true; });
      var types = only === 'shape' ? ['ab', 'double'] : only === 'number' ? ['ab', 'double', 'step', 'step'] : ['ab', 'double', 'step'];
      var order = shuffle(rng, list.slice()), qi = 0, bag = [];
      return {
        next: function () {
          var it;
          if (book && qi < 2) it = order[qi];
          else {
            if (!bag.length) bag = shuffle(rng, types.slice());
            it = makeRandom(rng, bag.pop(), only);
          }
          qi++;
          var endBlank = rng() < 0.7;
          var r = it.unit ? buildRepeat(rng, it.unit, endBlank) : buildStep(rng, it.start, it.step, endBlank);
          return {
            seq: r.seq, blank: r.blank, unit: r.unit, step: r.step,
            prompt: r.seq.map(function (t) { return t === null ? '□' : nameOf(t); }).join(', '),
            options: shuffle(rng, [r.ans].concat(r.wrong)), answer: r.ans, type: r.type, explain: r.explain
          };
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) { return q.seq.map(function (t) { return t === null ? '<span class="w-box">(　)</span>' : tokenHtml(t); }).join(' '); },
    printAnswer: function (q) { return nameOf(q.answer); },
    printHead: '규칙을 찾아 빈칸에 알맞은 것을 쓰세요.'
  };
}));
