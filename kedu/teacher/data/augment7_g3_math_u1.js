/* augment7_g3_math_u1.js — 2세대 22차 「개념 그림 층」 3학년 수학 1단원 「덧셈과 뺄셈」 개념 장 24장.
   그림 문법: 수 모형(빨강 백 판·초록 십 막대·노랑 낱개) · 세로셈(주황 받아올림·빨강 줄어든 수) · 식 카드(어림).
   실행: node kedu/teacher/data/augment7_g3_math_u1.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const bt = (n, o) => Object.assign({ k: 'bt', n }, o || {});
const V = (a, b, op, o) => Object.assign({ k: 'vert', a, b, op }, o || {});
const eq = (lines, tag) => Object.assign({ k: 'eq', lines }, tag ? { tag } : {});
const est = (a, ea, b, eb, r, word) => eq([a + ' → 약 ' + ea, b + ' → 약 ' + eb, (word || '합') + '은 **약 ' + r + '**'], '계산하기 전에 대강 가늠해요');
const F = {
  u1_l01: { s04: V(34, 52, '+', { label: '같은 자리끼리' }), s06: V(245, 312, '+', { label: '일 → 십 → 백 차례로' }), s07: V(568, 234, '−', { label: '같은 자리끼리 빼요' }) },
  u1_l02: { s04: P([it('오전 426명', bt(426)), it('오후 342명', bt(342))], '+'), s05: P([it('일 모형 6개', bt(6, { split: false })), it('일 모형 2개', bt(2, { split: false })), it('8개', bt(8, { split: false }))], '+') },
  u1_l03: { s04: est(234, 230, 158, 160, 390), s05: { k: 'regroup', label: '4 + 8 = 12 → 10개를 십 모형 1개로' }, s06: V(234, 158, '+', { label: '올라온 1을 잊지 마세요 · 어림 390' }) },
  u1_l04: { s04: est(347, 350, 285, 280, 630), s05: { k: 'regroup', label: '7 + 5 = 12 → 십 모형 1개로, 일의 자리엔 2' }, s06: V(347, 285, '+', { label: '십의 자리에서 또 받아올림 · 어림 630' }) },
  u1_l05: { s04: bt(327, { tag: '여기서 214만큼 덜어 내요' }), s05: P([it('일 모형 7개', bt(7, { split: false })), it('4개 덜어 내면', bt(4, { split: false })), it('3개 남아요', bt(3, { split: false }))], '−') },
  u1_l06: { s04: est(453, 450, 138, 140, 310, '차'), s05: { k: 'regroup', dir: 'down', label: '십 모형 1개를 낱개 10개로 → 13 − 8 = 5' }, s06: V(453, 138, '−', { label: '줄어든 십의 자리를 잊지 마세요 · 어림 310' }) },
  u1_l07: { s04: est(621, 620, 147, 150, 470, '차'), s05: { k: 'regroup', dir: 'down', label: '십 모형 1개를 낱개 10개로 → 11 − 7 = 4' }, s06: V(621, 147, '−', { label: '십의 자리에서 또 받아내림 · 어림 470' }) },
  u1_l08: { s05: V(465, 387, '+', { label: '어깨 465점 + 이마 387점' }), s06: V(852, 816, '−', { label: '852 > 816 → 바꿀 수 있어요 · 남은 점수' }) },
  u1_l09: { s04: V(542, 279, '+', { label: '받아올림 두 번' }), s05: V(843, 418, '−', { label: '받아내림 한 번' }), s06: eq(['가까운 몇백몇십으로 바꿔요', '계산한 값과 **견주어요**', '어림은 점검하는 도구']) }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u1.js'), F);
