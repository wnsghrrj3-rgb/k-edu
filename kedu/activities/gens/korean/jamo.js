/* gens/korean/jamo.js — 한글 자모 부품 (1학년 국어 1단원 「글자를 만들어요」 공용)
 * 순수 함수·DOM 무관 (§9-3). 국어 생성기 셋(jamo_sort · letter_build · vowel_hunt)이 함께 쓴다.
 * 조립기는 `gens`(부품 생성기)로 먼저 인라인한다 — 브라우저는 GENS['jamo'], node 는 require.
 *
 * 규칙:
 *   split('나') → { cho:'ㄴ', jung:'ㅏ', jong:'' }   (완성형 한글만, 아니면 null)
 *   layout('ㅏ') → 'side' (자음 옆에 모음)  ·  layout('ㅗ') → 'under' (자음 아래 모음)  ·  'wrap'(ㅘ·ㅝ·ㅚ·ㅟ·ㅢ …: 아래+옆)
 *   MIRROR: 1학년이 가장 자주 바꿔 읽는 거울 짝 (ㅏ↔ㅓ · ㅗ↔ㅜ · ㅑ↔ㅕ · ㅛ↔ㅠ)
 *   LOOKALIKE: 획 하나 차이 자음 짝 (ㄱ↔ㅋ · ㄴ↔ㄷ · ㄷ↔ㅌ · ㅁ↔ㅂ · ㅂ↔ㅍ · ㅅ↔ㅈ · ㅈ↔ㅊ · ㅇ↔ㅎ)
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['jamo'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  var JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  var JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  var BASIC_CONS = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];   // 자음자 14
  var BASIC_VOW = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];                            // 모음자 10
  var MORE_VOW = ['ㅐ','ㅔ','ㅚ','ㅟ','ㅘ','ㅝ','ㅙ','ㅞ','ㅢ','ㅒ','ㅖ'];                        // 여러 가지 모음자 (l09~l11)
  var SIDE = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ'];
  var UNDER = ['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ'];

  var MIRROR = { 'ㅏ':'ㅓ','ㅓ':'ㅏ','ㅗ':'ㅜ','ㅜ':'ㅗ','ㅑ':'ㅕ','ㅕ':'ㅑ','ㅛ':'ㅠ','ㅠ':'ㅛ' };
  var SOUNDALIKE = { 'ㅐ':'ㅔ','ㅔ':'ㅐ','ㅒ':'ㅖ','ㅖ':'ㅒ','ㅚ':'ㅟ','ㅟ':'ㅚ','ㅘ':'ㅝ','ㅝ':'ㅘ','ㅙ':'ㅞ','ㅞ':'ㅙ' };
  var LOOKALIKE = { 'ㄱ':'ㅋ','ㅋ':'ㄱ','ㄴ':'ㄷ','ㄷ':'ㅌ','ㅌ':'ㄷ','ㅁ':'ㅂ','ㅂ':'ㅍ','ㅍ':'ㅂ','ㅅ':'ㅈ','ㅈ':'ㅊ','ㅊ':'ㅈ','ㅇ':'ㅎ','ㅎ':'ㅇ','ㄹ':'ㄷ' };

  function split(ch) {
    var c = String(ch || '').charCodeAt(0) - 0xAC00;
    if (!(c >= 0 && c < 11172)) return null;
    return { cho: CHO[Math.floor(c / 588)], jung: JUNG[Math.floor((c % 588) / 28)], jong: JONG[c % 28] };
  }
  function join(cho, jung) {
    var a = CHO.indexOf(cho), b = JUNG.indexOf(jung);
    if (a < 0 || b < 0) return '';
    return String.fromCharCode(0xAC00 + a * 588 + b * 28);
  }
  function layout(v) { return SIDE.indexOf(v) >= 0 ? 'side' : (UNDER.indexOf(v) >= 0 ? 'under' : 'wrap'); }
  function isCons(j) { return CHO.indexOf(j) >= 0; }
  function isVow(j) { return JUNG.indexOf(j) >= 0; }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[k]; a[k] = t; }
    return a;
  }
  /* 「ㅏ」를 아이가 읽는 이름 — 조사 판정용 (모두 받침 없음, §6-10) */
  function jName(j) { return j; }

  return {
    id: 'jamo', title: '한글 자모 부품',
    CHO: CHO, JUNG: JUNG, BASIC_CONS: BASIC_CONS, BASIC_VOW: BASIC_VOW, MORE_VOW: MORE_VOW,
    MIRROR: MIRROR, SOUNDALIKE: SOUNDALIKE, LOOKALIKE: LOOKALIKE,
    split: split, join: join, layout: layout, isCons: isCons, isVow: isVow,
    pick: pick, shuffle: shuffle, jName: jName,
    create: function () { return { next: function () { return null; } }; }   // 부품 — 스스로 문제를 내지 않는다
  };
}));
