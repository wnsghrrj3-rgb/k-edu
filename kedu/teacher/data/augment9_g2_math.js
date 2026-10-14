/* augment9_g2_math.js — 2세대 120차 「개념 그림 층」 2학년 수학 남은 글·사진 개념 장 7장(u3 6 자리별 셈 · u6 1).
   자리별 셈 장은 이모지 줄(30개·47개…)이 셈을 덮어 cv2 로 못 갔음 → 수 모형(bt)·세로셈(vert)·풀기(regroup) 그림 한 칸.
   u3_l03 s04 · u6_l08 s03 의 img 는 사진 파일이 없는 자리 — cv2 가 그림(fig)을 대신 씀.
   실행: node kedu/teacher/data/augment9_g2_math.js */
'use strict';
const path = require('path');
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const BT = (n) => ({ k: 'bt', n, split: false }); // 칸 이름이 이미 수를 말함 · 「백 0」 줄 뺌
const F = {
  g2_math_u3: {
    u3_l03: { s04: P([it('십끼리 20 + 10', BT(30)), it('일끼리 8 + 9', BT(17))], '+') },
    u3_l04: { s05: { k: 'vert', a: 62, b: 53, op: '+', label: '십의 자리 6 + 5 = 11 → 백의 자리로 1' } },
    u3_l05: { s04: P([it('23', BT(23)), it('− 3 → 20', BT(20)), it('− 2 → 18', BT(18))], '➜') },
    u3_l06: { s04: P([it('십 하나를 풀어요', { k: 'regroup', dir: 'down', label: '50 = 40 + 10' }), it('자리별로 빼요', { k: 'vert', a: 50, b: 27, op: '−' })]) },
    u3_l07: { s05: { k: 'vert', a: 28, b: 26, op: '+', label: '답 28 + 뺀 수 26 = 처음 수 54' } },
    u3_l12: { s04: P([it('빨강 25', BT(25)), it('파랑 17', BT(17))], '+') }
  },
  g2_math_u6: {
    u6_l08: { s03: P([it('6씩 3묶음', { k: 'bundle', total: 18, per: 6, label: '6씩 3묶음 = 6의 3배' }), it('곱셈식', { k: 'arr', r: 3, c: 6, label: '6 × 3 = 18' })]) }
  }
};
module.exports = F;
if (require.main === module) for (const f of Object.keys(F)) require('./augment7_lib.js')(path.join(__dirname, f + '.js'), F[f]);
