/* gens/social/g5_2_cho_sort.js — 자음 단어 찾기 판 (5학년 2학기 사회 1단원 「유적과 유물로 살펴본 옛 사람들의 생활」 l09 · l12 · l17 · l20)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다. 교과서판 2학기 — 낱말·사실은 교과서·지도서 그대로.
 * 놀이 = 『사회』 68~69쪽 단원 마무리 「교실 놀이를 함께해요 — 자음 단어 찾기 놀이」(지도서 151쪽)
 *   놀이 판 = 주제 네 칸(선사 시대와 고조선 · 삼국과 가야 · 통일신라와 발해 · 고려) × 자음 줄. 자음으로 시작하는 단어를 주제별로 적는다.
 *   여기서는 거꾸로 — 자음 표가 붙은 단어 카드 한 장을 보고, 놀이 판의 어느 주제 칸에 적을 단어인지 고른다(혼자 하기 = n 문항).
 *   지도서 151쪽 「교사가 임의로 자음을 불러 주고 학생들이 모두 함께 놀이에 참여하는 등 다양한 방식으로 진행」 · 「반 전체 활동으로도 변형」.
 * 칸은 배운 것만 선다(categoriesFor) — 10차시까지 둘(선사·고조선 / 삼국과 가야) · 12차시까지 셋(+ 통일신라와 발해) · 단원 전체 넷(+ 고려).
 * 낱말 출처(지도서 사회 5-2 1단원 · 69쪽 놀이 판 예시 낱말 포함 — 가락바퀴 · 광개토 대왕 · 과거제 · 단군왕검 · 덩이쇠 · 대조영 · 대식국 · 비파형 동검 · 벽화 · 불국사 · 벽란도 · 움집 · 온조 · 연등회):
 *   놀이 판 예시 가운데 여러 시대에 걸치는 「기와집」(삼국 시대 지배층도 삶 — 지도서 6826줄)·「온돌」(고구려·발해 함께 나옴)은 판에서 뺐다 — 한 칸으로 가릴 수 없어서.
 * type = 칸(주제) · 풀이 = 낱말 + 그 시대 사실 한 줄(지도서 글).
 * params: { upto: 'l09'|'l12'|'all' }
 * next() → { item, cho, w, cat, type, why, explain, l, cats }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_cho_sort'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l06', 'l09', 'l12', 'l17'];
  var CATS = [{ key: 'pre', label: '🪨 선사 시대와 고조선' }, { key: 'three', label: '🏯 삼국과 가야' },
              { key: 'unified', label: '🛕 통일신라와 발해' }, { key: 'goryeo', label: '🏺 고려' }];
  var NAME = { pre: '선사 시대와 고조선', three: '삼국과 가야', unified: '통일신라와 발해', goryeo: '고려' };
  var FROM = { pre: 'l06', three: 'l09', unified: 'l12', goryeo: 'l17' };
  var CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

  /* [칸, 낱말, 그 시대 사실(풀이)] — 차시는 칸이 처음 서는 차시(FROM) */
  var S = [
    ['pre', '막집', '구석기 시대 사람들은 강가에 막집을 짓고 살았어요.'],
    ['pre', '뗀석기', '구석기 시대 사람들은 돌을 깨뜨리거나 떼어서 만든 뗀석기를 썼어요.'],
    ['pre', '주먹 도끼', '구석기 시대 뗀석기로, 짐승을 사냥하거나 땅을 팔 때 썼어요.'],
    ['pre', '빗살무늬 토기', '신석기 시대 사람들이 음식을 보관하거나 조리할 때 썼어요.'],
    ['pre', '간석기', '신석기 시대 사람들은 간석기를 만들어 농사를 짓기 시작했어요.'],
    ['pre', '가락바퀴', '신석기 시대 사람들이 실을 뽑을 때 사용했어요.'],
    ['pre', '움집', '신석기 시대 사람들은 땅을 파고 지붕을 덮은 움집에서 살았어요.'],
    ['pre', '고인돌', '청동기 시대 지배자나 마을 사람들이 죽으면 만든 무덤이에요.'],
    ['pre', '반달 돌칼', '청동기 시대 사람들은 벼농사를 짓고 반달 돌칼로 곡식을 거두었어요.'],
    ['pre', '비파형 동검', '청동기 시대와 고조선의 대표 유물이에요.'],
    ['pre', '단군왕검', '고조선의 건국 이야기에서 나라를 세운 인물이에요.'],
    ['three', '광개토 대왕', '고구려의 세력을 크게 넓힌 왕이에요.'],
    ['three', '근초고왕', '백제의 영토를 넓히고 주변 나라들과 활발히 교류한 왕이에요.'],
    ['three', '진흥왕', '신라는 진흥왕 때 크게 성장했어요.'],
    ['three', '온조', '고구려에서 내려와 한강 유역에 백제를 세웠어요.'],
    ['three', '김수로', '가야의 왕이 되었다는 건국 이야기의 주인공이에요.'],
    ['three', '덩이쇠', '가야에서 화폐처럼 쓰인 철 덩어리예요.'],
    ['three', '벽화', '고구려 고분 벽화로 삼국 시대 사람들의 생활 모습을 알 수 있어요.'],
    ['three', '첨성대', '신라 사람들이 하늘을 관찰한 곳이에요.'],
    ['three', '화랑도', '신라는 화랑도를 통해 유능한 인재를 길렀어요.'],
    ['three', '무령왕릉', '백제 무덤으로, 청동으로 만든 수저가 나왔어요.'],
    ['unified', '불국사', '통일신라 때 경주에 세운 절이에요.'],
    ['unified', '석굴암', '통일신라의 석굴 사원이에요.'],
    ['unified', '다보탑', '불국사에 있는 통일신라의 탑이에요.'],
    ['unified', '장보고', '통일신라 때 청해진 대사로 가장 이름난 인물이에요.'],
    ['unified', '대조영', '고구려 출신으로 고구려 유민과 말갈인을 이끌고 발해를 세웠어요.'],
    ['unified', '해동성국', '발해를 「바다 동쪽에 있는 번성한 나라」라고 부른 이름이에요.'],
    ['goryeo', '왕건', '고려를 세웠고 훈요 10조를 남겼어요.'],
    ['goryeo', '과거제', '고려는 과거제를 통해 관리를 뽑았어요.'],
    ['goryeo', '벽란도', '고려의 국제 무역항으로 수많은 사람이 오갔어요.'],
    ['goryeo', '대식국', '아라비아를 이르는 말로, 대식국 상인들이 고려에 왔어요.'],
    ['goryeo', '연등회', '고려의 불교 행사로, 팔관회와 함께 열렸어요.'],
    ['goryeo', '팔만대장경', '고려 사람들이 만든 대장경이에요.'],
    ['goryeo', '상감 청자', '고려청자는 상감 기법으로 만든 것이 많아요.'],
    ['goryeo', '금속 활자', '고려 사람들은 세계 최초로 금속 활자를 발명해 책을 인쇄했어요.'],
    ['goryeo', '서희', '거란이 1차로 침입했을 때 외교 담판으로 강동 6주 지역을 얻었어요.'],
    ['goryeo', '강감찬', '귀주에서 거란을 크게 물리쳤어요(귀주 대첩).']
  ];

  function cho(w) { var c = w.charCodeAt(0) - 0xAC00; return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : w[0]; }
  function lim(upto) { var i = ORDER.indexOf(upto); return (upto === 'all' || i < 0) ? ORDER.length - 1 : i; }
  function norm(upto) { return (upto === 'l09' || upto === 'l12') ? upto : 'all'; }
  function categoriesFor(upto) { var L = lim(norm(upto)); return CATS.filter(function (c) { return ORDER.indexOf(FROM[c.key]) <= L; }); }
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function iyeyo(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '이에요' : '예요'; }
  function build(s, keys) {
    var ch = cho(s[1]);
    return { l: FROM[s[0]], cat: s[0], type: s[0], cho: ch, w: s[1], why: s[2], item: ch + ' — ' + s[1], cats: keys,
             explain: '「' + s[1] + '」 — ' + NAME[s[0]] + ' 칸에 적을 단어' + iyeyo('단어') + '. ' + s[2] };
  }

  return {
    id: 'g5_2_cho_sort',
    title: '자음 단어 찾기 판',
    categories: CATS,
    categoriesFor: categoriesFor,
    NAME: NAME, FROM: FROM, S: S, ORDER: ORDER, cho: cho,
    create: function (params, rng) {
      var p = params || {};
      var upto = norm(p.upto);
      var cats = categoriesFor(upto), keys = cats.map(function (c) { return c.key; });
      var idx = [];
      S.forEach(function (s, k) { if (keys.indexOf(s[0]) >= 0) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = -1, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (k === last) continue; if (run >= 1 && S[k][0] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        categories: cats,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0
          var k = deck.splice(at, 1)[0];
          run = S[k][0] === lastCat ? run + 1 : 0; lastCat = S[k][0]; last = k;
          return build(S[k], keys);
        },
        check: function (pick, q) { return pick === q.cat; }
      };
    },
    printRender: function (q) {
      var ks = q.cats || CATS.map(function (c) { return c.key; });
      return q.item + ' → ' + ks.map(function (k) { return '□ ' + NAME[k]; }).join(' ');
    },
    printAnswer: function (q) { return q.w + ' → ' + NAME[q.cat]; },
    printHead: '자음으로 시작하는 단어를 보고, 자음 단어 찾기 놀이 판의 어느 주제 칸에 적을 단어인지 □에 ✓ 하세요.'
  };
}));
