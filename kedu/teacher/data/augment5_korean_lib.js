/* augment5_korean_lib.js — g2 국어 12슬 균일 골격(s03 motivate·s04 concept·s05 card_quiz·s06 활동·leveled·offline·exit)용 얇은 껍데기.
   R(kids, [s03,s04,s05,s06,leveled,offline,exit]) — 각 항목은 [ask, watch] 또는 문자열. 단원 첫 차시(l01)는 leveled·offline·exit 가 s100·s101·s102 다. */
'use strict';
const K = (n1, s1, n2, s2) => { const F = { 하나: '👧', 두리: '👦', 도토: '🐿️', 선생님: '👩‍🏫', 엄마: '👩', 아빠: '👨', 할머니: '👵', 동생: '🧒', 친구: '🧑' }; return [{ face: F[n1] || '🙂', label: n1 + ' "' + s1 + '"' }, { face: F[n2] || '🙂', label: n2 + ' "' + s2 + '"' }]; };
const q = (a, m) => { if (typeof a === 'string') a = [a]; return { ask: [a[0]], watch: a[1] || '', min: m }; };
module.exports = function R(kids, arr, first) {
  const ids = first ? ['s03', 's04', 's05', 's06', 's100', 's101', 's102'] : ['s03', 's04', 's05', 's06', 's101', 's102', 's103'];
  const mins = [3, 4, 4, 5, 5, 5, 3]; const o = {};
  arr.forEach((a, i) => { o[ids[i]] = q(a, mins[i]); });
  o.s03 = { kids, tnote: o.s03 };
  return o;
};
module.exports.K = K;
