/* gens/korean/g5_2_clue_hunt.js — 단서와 함축된 표현 찾기 (5학년 2학기 국어 5단원 「추론하며 읽어요」 l02 · l04 · l07 · l09 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 덩이 토큰 · fixed 조각)가 쓴다. 교과서판 2학기 — 판의 글은 교과서·지도서 그대로(줄임만, 몇 줄 인용).
 * 판 둘 갈래(type):
 *   clue      글에서 찾은 단서 — 『국어』 215쪽 3의 (1)번 「투명 비닐을 덮었을 때 색으로 표시되는 문장」 · 224쪽 생략된 내용 추론하기 단서 ①②.
 *             📋 질문과 추론한 내용(fixed)을 보여 주고, 그렇게 추론하게 한 단서 덩이를 모두 누른다.
 *   implicit  함축된 표현 — 『국어』 230~233쪽 「인류, 책, 도서관」(씨앗 · 문과 열쇠 · 조용한 놀이터) · 243쪽 「사라, 버스를 타다」 붙임 11.
 *             📋 표현에 담긴 뜻(fixed — 교과서 예시 답안)을 보여 주고, 그 뜻이 함축된 표현 덩이를 누른다.
 *   글 그대로 읽히는 덩이(문자 그대로의 말)와 다른 사람의 말도 함께 두어, 낱말만 보고 누르면 흔들린다.
 * 근거(지도서 국어 5-2 5단원 · 쪽 = 지도서 인쇄 쪽):
 *   264~265쪽 『국어』 217쪽 4번 「로버트 훅이 레이우엔훅의 현미경을 직접 확인하러 갔고 성능을 인정했어요」 = 글에서 찾은 단서
 *   263~264쪽 「단서 ①(깨알보다 작은 존재로 생각했던 벼룩)와 로버트 훅이 … 벼룩을 크고 자세하게 그렸다는 단서를 조합하여 추론」
 *   269~270쪽 단서 ① 마을 주민들은 돈이 부족했다 · ② 서비스나 물품을 제공하면 플러스(+), 제공받으면 마이너스(-)
 *   275~276쪽 함축된 표현 = 「뜻이 바로 드러나지 않고 숨겨져 있거나 하나의 표현 안에 여러 가지 뜻이 담겨 있는 표현」 · 씨앗 = 지식의 출발점
 *        · 문과 열쇠 = 모든 사람에게 배울 기회 · 조용한 놀이터 = 조용히 책을 읽으며 즐겁게 배울 수 있는 도서관
 *   286~287쪽 「사라, 버스를 타다」 붙임 11 — 사라 · 버스 운전사 · 경찰관 · 사라의 어머니의 말과 그 뜻
 * params: { upto: 'l02'|'l04'|'l07'|'all' }  l02 = 3차시까지(현미경) · l04 = 6차시까지(+ 녹색 화폐) · l07 = 8차시까지(+ 「인류, 책, 도서관」) · all = 단원 전체(+ 「사라, 버스를 타다」)
 * next() → { prompt, icon, src, tokens:[{t,hit} | {t:' ',sep:true} | {t,fixed:true}], answer:[…], type, explain, l }
 * 표지 문법(이 파일 안): {f:…} = 누를 수 없는 줄·조각 · [*…] = 찾을 덩이 · 그 밖 = 누를 수 있는 덩이 · | = 덩이 사이 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_clue_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l04', 'l07', 'l09'];
  var PROMPT = { clue: '이렇게 추론하게 한 단서를 글에서 모두 찾아 눌러요', implicit: '이 뜻이 함축된 표현을 찾아 눌러요' };
  var WHY = { clue: '글에서 찾은 단서를 바탕으로 글에 드러나지 않은 내용을 짐작해요.',
              implicit: '함축된 표현은 뜻이 바로 드러나지 않고 숨겨져 있는 표현이에요. 앞뒤 문장에서 단서를 찾아 뜻을 짐작해요.' };

  /* [차시, 아이콘, 글 이름, type, 글] */
  var T = [
    // ── l02 · 『국어』 215·217쪽 「현미경으로 세포를 발견하다」 · l04 · 224쪽 「마을을 살린 새로운 화폐 ‘녹색 화폐’」
    ['l02', '🔬', '「현미경으로 세포를 발견하다」', 'clue',
      '{f:📋 질문: 로버트 훅의 현미경으로 무엇을 할 수 있게 되었나요?} / {f:💡 추론한 내용: 벼룩과 같은 생물을 확대해 자세히 관찰할 수 있게 되었다.} / ' +
      '로버트 훅은 조명 장치까지 갖춘 현미경을 만들었어. | 이 책에는 눈의 결정이나 비단 조직을 확대한 그림도 실려 있지. | ' +
      '[*지금 보는 벼룩의 그림은 가로 45센티미터, 세로 30센티미터야.] | [*깨알보다 작은 존재로 생각했던 벼룩] | 사람들이 놀랄 수밖에.'],
    ['l02', '🔬', '「현미경으로 세포를 발견하다」', 'clue',
      '{f:📋 질문: 레이우엔훅과 로버트 훅 가운데 누구의 현미경 성능이 더 좋았을까요?} / {f:💡 추론한 내용: 레이우엔훅의 현미경 성능이 더 좋았다.} / ' +
      '로버트 훅은 조명 장치까지 갖춘 현미경을 만들었어. | 사람들이 벼룩의 무시무시한 모습에 놀랐어. | ' +
      '[*로버트 훅이 레이우엔훅의 현미경을 직접 확인하러 갔고 성능을 인정했어요.]'],
    ['l04', '🌿', '「마을을 살린 새로운 화폐 ‘녹색 화폐’」', 'clue',
      '{f:📋 질문: 마이클 린튼이 제안한 방법에 ‘화폐’라는 이름이 붙은 까닭은 무엇일까?} / {f:💡 추론한 내용: 돈이 부족해도 필요한 것을 서로 교환할 수 있는 방법이기 때문이다.} / ' +
      '[*마을이 어려워져 주민들은 돈이 부족했어요.] | 소피아는 주인아주머니께 물었죠. | ' +
      '[*서비스나 물품을 제공하면 플러스(+)가 표시돼요.] | [*서비스나 물품을 제공받으면 마이너스(-)가 표시돼요.] | 피아노 선생님도 다시 수업을 시작했어요.'],
    // ── l07 · 『국어』 230~233쪽 「인류, 책, 도서관」
    ['l07', '📚', '「인류, 책, 도서관」', 'implicit',
      '{f:📋 뜻: 지식의 출발점} / {f:사람들이 책을 읽게 되자, 다양한 분야에서 새로운 생각들이 싹트기 시작했어.} / ' +
      '이 생각들은 다시 책으로 기록되어 | 또 다른 생각들의 | [*씨앗] | 이 되었지. / 인쇄술의 발달은 이 | [*씨앗들을] | 더 넓은 지역으로 빠르게 퍼뜨렸어.'],
    ['l07', '📚', '「인류, 책, 도서관」', 'implicit',
      '{f:📋 뜻: 모든 사람에게 공부하고 배울 수 있는 기회가 있어야 한다.} / ' +
      '모든 나라에서 가장 중요한 일은 | 어린이들을 학교에 보내서 글을 가르치는 거야. | ' +
      '[*배움의 문은 모두에게 열려 있어야 해.] | [*그 문을 열 수 있는 열쇠가 누구에게나 주어져야 하지.] | 모두를 위한 도서관이 더 많이 필요해!'],
    ['l07', '📚', '「인류, 책, 도서관」', 'implicit',
      '{f:📋 뜻: 조용히 책을 읽으며 즐겁게 배울 수 있는 도서관을 많이 이용하자.} / ' +
      '모두를 위한 공공장소와 시설들이 잘 운영되려면 | 우리 모두가 규칙을 잘 지키고 관리해야 해. | ' +
      '[*모두가 함께 즐길 수 있는 조용한 놀이터로 모여 보자.] | 책과 도서관을 즐겨 이용하고 소중하게 여긴다면 | 더 많은 것을 누릴 수 있어.'],
    // ── l09 · 『국어』 243쪽 「사라, 버스를 타다」 붙임 11
    ['l09', '🚌', '「사라, 버스를 타다」', 'implicit',
      '{f:📋 뜻: 차별에 굴하지 않고 자신의 권리를 지키겠다.} / ' +
      '[*사라 — “문 닫으셔도 돼요. 저는 학교까지 타고 가겠어요.”] / 버스 운전사 — “뒤로 가서 앉아라. 늘 그래 왔잖니?” / ' +
      '경찰관 — “법이 뭔지 너도 알 거다. 그렇지?” / 사라의 어머니 — “경찰관들이 진짜 범죄자들을 잡으러 가야 할 때인 것 같구나.”'],
    ['l09', '🚌', '「사라, 버스를 타다」', 'implicit',
      '{f:📋 뜻: 지금까지 지켜 온 규칙에 따라 행동하고, 그것을 바꾸려 하지 말아야 한다.} / ' +
      '사라 — “문 닫으셔도 돼요. 저는 학교까지 타고 가겠어요.” / [*버스 운전사 — “뒤로 가서 앉아라. 늘 그래 왔잖니?”] / ' +
      '경찰관 — “법이 뭔지 너도 알 거다. 그렇지?” / 사라의 어머니 — “경찰관들이 진짜 범죄자들을 잡으러 가야 할 때인 것 같구나.”'],
    ['l09', '🚌', '「사라, 버스를 타다」', 'implicit',
      '{f:📋 뜻: 흑인은 버스의 앞자리에 앉을 수 없다는 법을 잘 지켜야 한다.} / ' +
      '사라 — “문 닫으셔도 돼요. 저는 학교까지 타고 가겠어요.” / 버스 운전사 — “뒤로 가서 앉아라. 늘 그래 왔잖니?” / ' +
      '[*경찰관 — “법이 뭔지 너도 알 거다. 그렇지?”] / 사라의 어머니 — “경찰관들이 진짜 범죄자들을 잡으러 가야 할 때인 것 같구나.”'],
    ['l09', '🚌', '「사라, 버스를 타다」', 'implicit',
      '{f:📋 뜻: 사라는 잘못을 저지르지 않았다.} / ' +
      '사라 — “문 닫으셔도 돼요. 저는 학교까지 타고 가겠어요.” / 버스 운전사 — “뒤로 가서 앉아라. 늘 그래 왔잖니?” / ' +
      '경찰관 — “법이 뭔지 너도 알 거다. 그렇지?” / [*사라의 어머니 — “경찰관들이 진짜 범죄자들을 잡으러 가야 할 때인 것 같구나.”]']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* 글 → 줄[덩이] — {f:…} 누를 수 없음 · [*…] 찾을 덩이 · | 덩이 사이 · / 줄 바꿈 */
  function parse(s) {
    return s.split(' / ').map(function (line) {
      line = line.trim();
      return line.split(' | ').map(function (c) {
        c = c.trim(); var f = c.match(/^\{f:(.*)\}$/), h = c.match(/^\[\*(.*)\]$/);
        return f ? { t: f[1], fixed: true } : h ? { t: h[1], hit: true } : { t: c };
      });
    });
  }
  function explainOf(lines, type) {
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.t + '」'; });
    var head = lines[0][0].t.replace(/^📋 /, '');
    return (type === 'clue' ? '단서: ' : head + ' → ') + hits.join(' · ') + '. ' + WHY[type];
  }
  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push(t.fixed ? { t: esc(t.t), fixed: true } : { t: esc(t.t), hit: !!t.hit }); });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return esc(t.t); });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: row[3],
             prompt: row[1] + ' ' + row[2] + ' — ' + PROMPT[row[3]], lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines, row[3]) };
  }

  return {
    id: 'g5_2_clue_hunt',
    title: '단서와 함축된 표현 찾기',
    T: T, ORDER: ORDER, PROMPT: PROMPT, WHY: WHY,
    parse: parse,
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto === 'l02' || p.upto === 'l04' || p.upto === 'l07') ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 판이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], 'ch' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(pick) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) { return line.map(function (t) { return t.t; }).join(' '); }).join('<br>');
    },
    printAnswer: function (q) { return q.lines.reduce(function (a, l) { return a.concat(l); }, []).filter(function (t) { return t.hit; }).map(function (t) { return t.t; }).join(' · '); },
    printHead: '📋 질문과 추론한 내용(또는 뜻)을 읽고, 그렇게 짐작하게 한 단서나 그 뜻이 함축된 표현에 밑줄을 그으세요.'
  };
}));
