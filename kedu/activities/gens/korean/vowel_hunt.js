/* gens/korean/vowel_hunt.js — 낱말 속 모음자 찾기 (1학년 국어 1단원 l09~l11·l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기)가 쓴다.
 * params: { pool: 'basic'|'more'|'mix', words: 3|4|5 }
 * next() → { vowel:'ㅐ', prompt, tokens:[{t:'개',hit:true},{t:'미',hit:false},{t:' ',sep:true}…], type, explain, answer }
 * type(문항 단위): ae_e(ㅐ·ㅔ 소리 닮은 짝) > double(ㅘ·ㅝ·ㅚ·ㅟ·ㅢ …) > y_vowel(ㅑㅕㅛㅠ) > basic
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['vowel_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var J = (typeof module === 'object' && module.exports) ? require('./jamo.js') : (typeof self !== 'undefined' ? self : this).GENS.jamo;

  var WORDS = ['나무','사자','바다','아기','마차','다리','나비','사과','하마','자두','가지',
               '어머니','버스','머리','너구리','거미','오이','모자','고구마','포도','소나무','호수','토마토','도토리',
               '우유','두부','구두','누나','무지개','주스','그네','스키','트리','드레스',
               '기차','비누','시소','지구','치즈','피자','야구','야채','여우','벼','혀','요리','요요','유리','휴지','튜브',
               '개','새','배','매미','개미','대나무','채소','해','게','세수','메뚜기','네모','베개','제비',
               '과자','화가','좌우','외투','뇌','귀','뒤','쥐','위','취미','의자','의사','돼지','왜'];
  var Y = ['ㅑ','ㅕ','ㅛ','ㅠ'];
  var DOUBLE = ['ㅘ','ㅝ','ㅙ','ㅞ','ㅢ','ㅚ','ㅟ'];

  function vowelsOf(word) {
    var out = [];
    for (var i = 0; i < word.length; i++) { var s = J.split(word.charAt(i)); if (s) out.push(s.jung); }
    return out;
  }

  return {
    id: 'vowel_hunt',
    title: '낱말 속 모음자 찾기',
    create: function (params, rng) {
      var p = params || {};
      var pool = p.pool === 'more' || p.pool === 'mix' ? p.pool : 'basic';
      var nWords = (+p.words >= 2 && +p.words <= 6) ? Math.floor(+p.words) : 4;
      var vows = pool === 'basic' ? J.BASIC_VOW : (pool === 'more' ? J.MORE_VOW : J.BASIC_VOW.concat(J.MORE_VOW));
      // 낱말에 실제로 있는 모음자만 낸다 — 정답 0개인 판은 판이 아니다
      vows = vows.filter(function (v) { return WORDS.some(function (w) { return vowelsOf(w).indexOf(v) >= 0; }); });
      var last = null;
      return {
        next: function () {
          var v;
          do { v = J.pick(rng, vows); } while (v === last && vows.length > 1);
          last = v;
          var hits = J.shuffle(rng, WORDS.filter(function (w) { return vowelsOf(w).indexOf(v) >= 0; }));
          var rest = J.shuffle(rng, WORDS.filter(function (w) { return vowelsOf(w).indexOf(v) < 0; }));
          // 소리 닮은 짝·거울 짝 낱말을 하나 끼운다 — 그게 이 판이 재는 것이다
          var trap = J.SOUNDALIKE[v] || J.MIRROR[v];
          var trapWords = trap ? rest.filter(function (w) { return vowelsOf(w).indexOf(trap) >= 0; }) : [];
          var nHit = Math.max(1, Math.min(hits.length, 1 + Math.floor(rng() * Math.min(2, nWords - 1))));
          var chosen = hits.slice(0, nHit);
          if (trapWords.length && chosen.length < nWords) chosen.push(trapWords[0]);
          var k = 0;
          while (chosen.length < nWords && k < rest.length) { if (chosen.indexOf(rest[k]) < 0) chosen.push(rest[k]); k++; }
          chosen = J.shuffle(rng, chosen);
          var tokens = [], answer = [];
          chosen.forEach(function (w, wi) {
            if (wi) tokens.push({ t: ' ', sep: true });
            for (var i = 0; i < w.length; i++) {
              var s = J.split(w.charAt(i)), hit = !!s && s.jung === v;
              tokens.push({ t: w.charAt(i), hit: hit });
              if (hit) answer.push(w.charAt(i));
            }
          });
          var type = (v === 'ㅐ' || v === 'ㅔ' || v === 'ㅒ' || v === 'ㅖ') ? 'ae_e'
                   : (DOUBLE.indexOf(v) >= 0 ? 'double' : (Y.indexOf(v) >= 0 ? 'y_vowel' : 'basic'));
          return {
            vowel: v, tokens: tokens, type: type, words: chosen,
            prompt: v + '가 들어 있는 글자를 모두 짚어요',
            answer: answer.join(','),
            explain: answer.join(' · ') + ' — ' + v + '가 숨어 있었어요' +
              (trap && chosen.indexOf(trapWords[0]) >= 0 ? '  (' + trap + '와 헷갈리지 않게!)' : '')
          };
        },
        check: function (pick, q) { return q.answer.split(',').indexOf(pick) >= 0; }
      };
    },
    printRender: function (q) {
      return '<b>' + q.vowel + '</b> 찾기: ' + q.words.map(function (w) { return '<span class="w-num">' + w + '</span>'; }).join(' ');
    },
    printAnswer: function (q) { return q.vowel + ' → ' + q.answer.split(',').join(' '); },
    printHead: '모음자가 들어 있는 글자에 모두 ○를 하세요.'
  };
}));
