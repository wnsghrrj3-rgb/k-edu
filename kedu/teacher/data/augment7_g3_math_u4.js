/* augment7_g3_math_u4.js — 2세대 22차 「개념 그림 층」 3학년 수학 4단원 「곱셈」 개념 장 18장.
   그림 문법: 점 배열 = 같은 수 여러 번 · 십 막대 묶음 = (몇십)×(몇) · 가로 십 막대 줄 = 부분 곱(mulrows) · 식 카드 = 어림. 실행: node kedu/teacher/data/augment7_g3_math_u4.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const arr = (r, c, o) => Object.assign({ k: 'arr', r, c }, o || {});
const bt = (n, o) => Object.assign({ k: 'bt', n, split: false }, o || {});
const eq = (lines, tag) => Object.assign({ k: 'eq', lines }, tag ? { tag } : {});
const mul = (a, b) => ({ k: 'mulrows', a, b });
const F = {
  u4_l01: {
    s04: arr(6, 8, { rows: true, label: '8이 6번 → 8 × 6 = 48' }),
    s06: eq(['**7 × 3 = 21**', '**6 × 8 = 48**', '**5 × 4 = 20**'], '곱셈구구'),
    s07: { k: 'chain', items: [{ name: '곱셈 상황' }, { name: '(몇십)×(몇)' }, { name: '(몇십몇)×(몇)' }, { name: '문제 해결' }] }
  },
  u4_l02: {
    s05: P([it('2 × 3 = 6', arr(3, 2, { label: '2씩 3묶음' })), it('20', bt(20)), it('20', bt(20)), it('20 → 20 × 3 = 60', bt(20))]),
    s06: P([it('30', bt(30)), it('30', bt(30)), it('30', bt(30))], '+')
  },
  u4_l03: { s04: eq(['21 → 약 **20**', '20 × 4 = 80', '21 × 4는 **약 80**'], '어림'), s06: mul(21, 4) },
  u4_l04: { s04: eq(['43 → 약 **40**', '40 × 3 = 120', '답은 **세 자리 수**'], '어림'), s06: mul(43, 3) },
  u4_l05: { s04: eq(['19 → 약 **20**', '20 × 4 = 80', '답은 80보다 **조금 작게**'], '어림'), s06: mul(19, 4) },
  u4_l06: { s04: eq(['30으로 어림 → 약 150', '40으로 어림 → 약 200', '답은 **150과 200 사이**'], '두 가지로 어림'), s06: mul(35, 5) },
  u4_l07: { s04: { k: 'tools', items: [{ name: '45', emoji: '🍃' }, { name: '45', emoji: '🍃' }, { name: '45', emoji: '🍃' }, { name: '45', emoji: '🍃' }] }, s06: mul(45, 4) },
  u4_l08: { s04: eq(['4 × 3 = 12', '**40 × 3 = 120**'], '(몇십)×(몇)은 10배'), s05: mul(35, 5), s06: eq(['되풀이되는 묶음 → **곱셈으로 한 번에**', '어림으로 먼저 살펴요']) }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u4.js'), F);
