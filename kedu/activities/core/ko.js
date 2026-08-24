/* core/ko.js — 한국어 조사 부품 (설계 §6-10 「읽을 수 있는 한국어」)
 *
 * 화면에 "은(는)"을 내보내지 않기 위한 단 하나의 판정처.
 * 순수 함수·DOM 무관. node(require)와 브라우저(self.KEDU_KO) 양쪽에서 산다.
 *
 * 규칙 (§6-10):
 *   1항 조사 병기 금지 — 받침을 보고 하나를 고른다.
 *   2항 수는 소리로 읽는다 — 한자어 읽기의 마지막 음절 받침을 따른다.
 *        끝자리 2·4·5·9 → 받침 없음(이·사·오·구). 나머지와 0으로 끝나는 수 → 받침 있음
 *        (일·삼·육·칠·팔 / 십·백·천·만 — 단위어는 전부 받침이 있다).
 *   3항 서술격 조사도 조사다 — 받침 있으면 '이에요', 없으면 '예요'.
 *
 * 쓰는 법:
 *   KO.j(40, '이/가')      → '40이'
 *   KO.j('오렌지', '은/는') → '오렌지는'
 *   KO.ida(9)              → '9예요'
 *   KO.ro('9')             → '9로'      (ㄹ 받침·무받침은 '로', 그 밖은 '으로')
 *
 * 판정할 수 없는 말(빈 문자열·기호로 끝나는 말)을 받으면 **던진다.**
 * 조용히 하나를 고르면 §6-9-4가 금지한 "조용한 되돌림"과 같은 병이 된다.
 */
(function (root, factory) {
  var m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  root.KEDU_KO = m;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* 단위 기호는 읽는 소리로 판정한다 (§6-10 3항) */
  var UNIT = {
    m: false, cm: false, mm: false, km: false,      // 미터·센티미터·밀리미터·킬로미터
    L: false, l: false, ml: false, mL: false,        // 리터·밀리리터
    g: true, kg: true                                // 그램·킬로그램
  };

  /* 마지막 음절에 받침이 있는가. 판정 불가면 null */
  function batchim(word) {
    var s = String(word == null ? '' : word).trim();
    if (!s) return null;

    var u = s.match(/([A-Za-z]+)$/);
    if (u) return Object.prototype.hasOwnProperty.call(UNIT, u[1]) ? UNIT[u[1]] : null;

    var last = s.charAt(s.length - 1);
    if (last >= '0' && last <= '9') return '2459'.indexOf(last) < 0;   // §6-10 2항

    var c = s.charCodeAt(s.length - 1);
    if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28 !== 0;
    return null;
  }

  /* 받침이 ㄹ 인가 ('으로/로' 판정용) */
  function isRieul(word) {
    var s = String(word == null ? '' : word).trim();
    if (!s) return false;
    var last = s.charAt(s.length - 1);
    if (last >= '0' && last <= '9') return '178'.indexOf(last) >= 0;   // 일·칠·팔
    var c = s.charCodeAt(s.length - 1);
    if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28 === 8;
    return false;
  }

  var PAIRS = {
    '은/는': ['은', '는'], '이/가': ['이', '가'], '을/를': ['을', '를'],
    '와/과': ['과', '와'], '아/야': ['아', '야'], '이라/라': ['이라', '라'],
    '이랑/랑': ['이랑', '랑'], '이나/나': ['이나', '나'], '이야/야': ['이야', '야'],
    '이니까/니까': ['이니까', '니까'], '이니/니': ['이니', '니']
  };

  function need(word, where) {
    var b = batchim(word);
    if (b === null)
      throw new Error('[ko] 조사를 고를 수 없는 말: "' + word + '" (' + (where || '') + ') — §6-10 5항');
    return b;
  }

  /* KO.j(말, '은/는') → 말 + 고른 조사 */
  function j(word, pair) {
    var set = PAIRS[pair];
    if (!set) throw new Error('[ko] 모르는 조사 짝: ' + pair);
    return String(word) + (need(word, pair) ? set[0] : set[1]);
  }

  /* KO.only(말, '은/는') → 조사만 */
  function only(word, pair) {
    var set = PAIRS[pair];
    if (!set) throw new Error('[ko] 모르는 조사 짝: ' + pair);
    return need(word, pair) ? set[0] : set[1];
  }

  /* 서술격 조사 (§6-10 3항) */
  function ida(word) { return String(word) + (need(word, '이에요') ? '이에요' : '예요'); }
  function iya(word) { return String(word) + (need(word, '이야') ? '이야' : '야'); }

  /* '으로/로' — ㄹ 받침과 무받침은 '로' */
  function ro(word) {
    var b = need(word, '으로/로');
    return String(word) + (!b || isRieul(word) ? '로' : '으로');
  }

  return {
    batchim: batchim, isRieul: isRieul,
    j: j, only: only, ida: ida, iya: iya, ro: ro
  };
}));
