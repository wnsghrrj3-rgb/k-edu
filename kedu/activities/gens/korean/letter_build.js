/* gens/korean/letter_build.js — 글자 짜임 만들기 (1학년 국어 1단원 l04·l05·l12)
 * 순수 함수·DOM 무관 (§9-3). 장르 map_pin(자리에 놓기)이 쓴다.
 * params: { vowels: 'basic'|'more'|'mix' }
 * next() → { target:'나', word:'나무', layout:'side'|'under'|'wrap', prompt,
 *            slots:[{key:'cho',label:'첫소리 자리'},{key:'jung',label:'가운뎃소리 자리'}],
 *            tiles:[{v:'ㄴ',slot:'cho'},{v:'ㅏ',slot:'jung'},{v:'ㅁ',slot:null},{v:'ㅓ',slot:null}], type, explain }
 * type(문항 단위, 판정 우선순위): mirror(거울 짝 모음이 보기에 있음) > under(모음이 아래) > wrap(아래+옆) > side
 *   거울 짝(ㅏ↔ㅓ·ㅗ↔ㅜ)이 1학년의 진단 축이다 — 이 키가 없으면 수첩이 짜임 형태만 남는다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['letter_build'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var J = (typeof module === 'object' && module.exports) ? require('./jamo.js') : (typeof self !== 'undefined' ? self : this).GENS.jamo;

  /* 받침 없는 1학년 낱말 — 만들 글자는 낱말의 첫 글자 (아이는 「나무의 나」로 읽는다) */
  var WORDS_BASIC = ['나무','다리','바다','사자','마차','나비','하마','자두','가지','아기',
                     '어머니','버스','머리','너구리','거미','서리',
                     '오이','모자','고구마','포도','소나무','호수','토마토','도토리',
                     '우유','두부','구두','누나','무지개','부자','주스','수도',
                     '그네','스키','트리','크레파스',
                     '이','기차','비누','시소','지구','치즈','피자',
                     '야구','야채','여우','벼','요리','유리','휴지','튜브'];
  var WORDS_MORE = ['개미','새','배','매미','대나무','채소','해','게','세수','메뚜기','네모','베개','제비',
                    '외투','뇌','귀','뒤','쥐','위','과자','화가','좌우','의자','의사','돼지','왜'];

  function otherVowel(rng, v, pool) {
    var m = J.MIRROR[v];
    if (m && rng() < 0.6) return { v: m, mirror: true };
    var s = J.SOUNDALIKE[v];
    if (s && rng() < 0.6) return { v: s, mirror: true };
    var c;
    do { c = J.pick(rng, pool); } while (c === v);
    return { v: c, mirror: false };
  }
  function otherCons(rng, c) {
    var l = J.LOOKALIKE[c];
    if (l && rng() < 0.6) return l;
    var x;
    do { x = J.pick(rng, J.BASIC_CONS); } while (x === c);
    return x;
  }

  return {
    id: 'letter_build',
    title: '글자 짜임 만들기',
    create: function (params, rng) {
      var p = params || {};
      var mode = p.vowels === 'more' || p.vowels === 'mix' ? p.vowels : 'basic';
      var words = mode === 'basic' ? WORDS_BASIC : (mode === 'more' ? WORDS_MORE : WORDS_BASIC.concat(WORDS_MORE));
      var vpool = mode === 'basic' ? J.BASIC_VOW : (mode === 'more' ? J.MORE_VOW : J.BASIC_VOW.concat(J.MORE_VOW));
      var last = null;
      return {
        next: function () {
          var word, s;
          do { word = J.pick(rng, words); s = J.split(word.charAt(0)); } while (!s || word === last);
          last = word;
          var target = word.charAt(0);
          var lay = J.layout(s.jung);
          var dv = otherVowel(rng, s.jung, vpool);
          var dc = otherCons(rng, s.cho);
          var tiles = J.shuffle(rng, [
            { v: s.cho, slot: 'cho' }, { v: s.jung, slot: 'jung' },
            { v: dc, slot: null }, { v: dv.v, slot: null }
          ]);
          var type = dv.mirror ? 'mirror' : lay;
          return {
            target: target, word: word, layout: lay, type: type,
            prompt: (word.length > 1 ? '「' + word + '」의 ' : '') + '「' + target + '」를 만들어요',   // 만드는 글자는 전부 받침 없음 → 「를」
            slots: [{ key: 'cho', label: '첫소리' }, { key: 'jung', label: '가운뎃소리' }],
            tiles: tiles,
            answer: s.cho + '+' + s.jung,
            explain: s.cho + (lay === 'under' ? ' 아래에 ' : (lay === 'wrap' ? ' 아래와 옆에 ' : ' 옆에 ')) + s.jung + ' → ' + target +
              (dv.mirror ? '  (' + dv.v + '와 헷갈리지 않게!)' : '')
          };
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.target + '</span> = <span class="w-box"> </span> + <span class="w-box"> </span>' +
        '  <small>(보기: ' + q.tiles.map(function (t) { return t.v; }).join(' ') + ')</small>';
    },
    printAnswer: function (q) { return q.target + ' = ' + q.answer.replace('+', ' + '); },
    printHead: '글자를 이루는 자음자와 모음자를 보기에서 골라 □ 안에 쓰세요.'
  };
}));
