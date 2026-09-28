/* augment7_g3_math_u7.js — 2세대 23차 「개념 그림 층」 3학년 수학 7단원 「말판 놀이」 개념 장 3장 — 글자 카드 chain 으로 충분(22차 판단).
   실행: node kedu/teacher/data/augment7_g3_math_u7.js */
'use strict';
const F = {
  u7_l01: {
    s05: { k: 'chain', items: [{ name: '① 주사위' }, { name: '② 칸의 문제' }, { name: '③ 한 바퀴' }, { name: '④ 단원 잇기' }] },
    s06: { k: 'chain', items: [{ name: '1 덧셈과 뺄셈' }, { name: '2 평면도형' }, { name: '3 나눗셈' }] },
    s07: { k: 'chain', items: [{ name: '4 곱셈' }, { name: '5 길이와 시간' }, { name: '6 분수와 소수' }] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u7.js'), F);
