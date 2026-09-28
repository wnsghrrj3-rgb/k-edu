/* augment7_g3_math_u3.js — 2세대 22차 「개념 그림 층」 3학년 수학 3단원 「나눗셈」 개념 장 19장.
   그림 문법: 접시 = 묶음 수로 나누기 · 노란 점선 상자 = 몇 개씩 묶기 · 점 배열 = 곱셈↔나눗셈. ÷ 기호는 l04 부터.
   실행: node kedu/teacher/data/augment7_g3_math_u3.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const share = (total, groups, o) => Object.assign({ k: 'share', total, groups }, o || {});
const bundle = (total, per, o) => Object.assign({ k: 'bundle', total, per }, o || {});
const arr = (r, c, o) => Object.assign({ k: 'arr', r, c }, o || {});
const eq = (lines, tag) => Object.assign({ k: 'eq', lines }, tag ? { tag } : {});
const F = {
  u3_l01: {
    s04: bundle(12, 4, { label: '묶음마다 개수가 같아요' }),
    s06: { k: 'places', items: [{ name: '간식 나누기', emoji: '🍪' }, { name: '팀 나누기', emoji: '⚽' }, { name: '자리 나누기', emoji: '🪑' }] },
    s07: { k: 'chain', items: [{ name: '똑같이 나누기' }, { name: '나눗셈식' }, { name: '곱셈과의 관계' }, { name: '곱셈구구' }] }
  },
  u3_l02: { s04: share(12, 3), s05: share(8, 2, { unit: '명', label: '공책 8권을 2명에게 똑같이' }) },
  u3_l03: { s04: bundle(12, 3), s05: eq(['12 − 3 − 3 − 3 − 3 = 0', '3을 **4번** 뺐으니 **4묶음**']) },
  u3_l04: { s04: P([it('4명에게 똑같이', share(12, 4, { unit: '명' })), it('식으로', eq(['**12 ÷ 4 = 3**', '12 나누기 4는 3']))]), s06: P([it('12 ÷ 4 = 3 (한 묶음 3개)', share(12, 4)), it('12 ÷ 3 = 4 (4묶음)', bundle(12, 3))]) },
  u3_l05: { s04: arr(3, 4, { rows: true, cols: true, label: '3 × 4 = 12 · 4 × 3 = 12' }), s05: arr(3, 4, { rows: true, cols: true, label: '12 ÷ 3 = 4 · 12 ÷ 4 = 3' }) },
  u3_l06: { s04: eq(['12 ÷ 3 = ☐', '**3 × ☐ = 12**'], '☐ 를 놓고 곱셈으로'), s05: eq(['3단: **3 × 4 = 12**', '그래서 12 ÷ 3 = 4']), s06: eq(['24 ÷ 4 = 6', '**4 × 6 = 24** ✓'], '나누는 수 × 몫 = 전체') },
  u3_l07: { s04: share(12, 4, { unit: '명', label: '한 명에게 몇 개? → 12 ÷ 4 = 3' }), s05: bundle(12, 3, { label: '몇 봉지? → 12 ÷ 3 = 4' }), s06: P([it('2 × 6', arr(2, 6, { label: '2 × 6 = 12' })), it('3 × 4', arr(3, 4, { label: '3 × 4 = 12' })), it('4 × 3', arr(4, 3, { label: '4 × 3 = 12' }))]) },
  u3_l08: { s04: P([it('묶음 수로 → 한 묶음 개수', share(12, 3)), it('한 묶음 개수로 → 묶음 수', bundle(12, 4))]), s05: eq(['전체 ÷ 나누는 수 = **몫**', '**12 ÷ 4 = 3**']) }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u3.js'), F);
