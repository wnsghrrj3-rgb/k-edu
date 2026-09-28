/* augment7_g3_math_u6.js — 2세대 22차 「개념 그림 층」 3학년 수학 6단원 「분수와 소수」 개념 장 38장.
   그림 문법: 파랑 = 색칠한(쓴) 부분 · 연회색 = 남은 칸 · 주황 = 수직선 점. 분수·소수 표기는 그 차시 뒤에만(l01·l02·l07 은 표기 없음).
   실행: node kedu/teacher/data/augment7_g3_math_u6.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const bar = (n, m, o) => Object.assign({ k: 'frac', n, m }, o || {});
const cir = (n, m, o) => Object.assign({ k: 'frac', n, m, shape: 'circle' }, o || {});
const sq = (n, m, o) => Object.assign({ k: 'frac', n, m, shape: 'square' }, o || {});
const rows = (items, cmp) => Object.assign({ k: 'fracs', items }, cmp ? { cmp } : {});
const F = {
  u6_l01: {
    s04: P([it('모양과 크기가 같게', sq(4, 0, { show: false })), it('둘로 똑같이', cir(2, 0, { show: false }))]),
    s05: P([it('사과 한 개 = 1', cir(1, 1, { show: false })), it('한 조각은 1보다 작아요', cir(2, 1, { show: false }))]),
    s06: bar(4, 3, { show: false, wholeLabel: '전체를 똑같이 넷으로', onLabel: '그중 셋' }),
    s07: { k: 'tenbox', m: 3, top: '열로 나눈 것 중 셋', show: false }
  },
  u6_l02: {
    s04: P([it('반으로 나눈 두 조각', cir(2, 1, { show: false })), it('겹쳐 보면 꼭 맞아요', cir(2, 2, { show: false }))]),
    s05: P([it('가로세로 한 번씩', sq(4, 0, { show: false })), it('가로로 두 번', sq(4, 0, { cols: 1, show: false })), it('세로로 두 번', sq(4, 0, { cols: 4, show: false }))]),
    s06: P([it('① 겹쳐 보기', cir(2, 1, { show: false })), it('② 다시 모으면 전체', cir(4, 4, { show: false }))])
  },
  u6_l03: {
    s04: bar(4, 3, { wholeLabel: '전체를 똑같이 넷으로' }),
    s05: P([it('4분의 3', bar(4, 3)), it('아래 = 분모 · 위 = 분자', { k: 'eq', lines: ['3 ← 분자 · 그중 몇', '4 ← 분모 · 몇으로 나눴나', '읽기: 사분의 삼'], tag: '아래부터 읽어요' })]),
    s06: rows([{ n: 3, m: 1 }, { n: 3, m: 2 }])
  },
  u6_l04: {
    s04: bar(3, 1, { rest: true, onLabel: '쓴 부분 3분의 1', restLabel: '남은 부분 3분의 2', show: false }),
    s05: bar(4, 3, { rest: true, onLabel: '색칠한 4분의 3', restLabel: '4분의 1', show: false }),
    s06: P([it('3분의 1 조각 하나', bar(3, 1)), it('3개 모이면 전체', bar(3, 3, { show: '1' }))])
  },
  u6_l05: {
    s04: rows([{ n: 4, m: 2 }, { n: 4, m: 3 }], '<'),
    s05: rows([{ n: 6, m: 5 }, { n: 6, m: 4 }], '>'),
    s06: P([it('큰 전체의 2분의 1', cir(2, 1, { r: 100 })), it('작은 전체의 2분의 1', cir(2, 1, { r: 60 }))], 'vs')
  },
  u6_l06: {
    s04: rows([{ n: 2, m: 1 }, { n: 3, m: 1 }], '>'),
    s05: rows([{ n: 6, m: 1 }, { n: 3, m: 1 }], '<'),
    s06: { k: 'numline', n: 4, marks: [{ at: '2/4', label: '1/2' }, { at: '1/4', label: '1/4' }] }
  },
  u6_l07: {
    s04: { k: 'chain', items: [{ name: '1이 10개' }, { name: '10' }, { name: '10이 10개' }, { name: '100' }] },
    s05: { k: 'tenbox', m: 7, top: '10분의 1이 7개 = 10분의 7', show: false },
    s06: { k: 'chain', items: [{ name: '10분의 1' }, { name: '1' }, { name: '10' }, { name: '100' }] }
  },
  u6_l08: {
    s04: { k: 'tenbox', m: 1, top: '10분의 1 = 0.1 (영 점 일)', show: '가운데 점 = 소수점' },
    s05: rows([{ n: 10, m: 2, show: '0.2' }, { n: 10, m: 5, show: '0.5' }, { n: 10, m: 7, show: '0.7' }]),
    s06: { k: 'numline', n: 10, dec: true, marks: [{ at: 0.7, label: '0.7' }], hop: true }
  },
  u6_l09: {
    s04: rows([{ n: 10, m: 4, show: '0.4' }, { n: 10, m: 6, show: '0.6' }], '<'),
    s05: { k: 'numline', n: 10, dec: true, marks: [{ at: 0.6, label: '0.6' }, { at: 0.4, label: '0.4' }] },
    s06: rows([{ n: 10, m: 4, show: '4/10' }, { n: 10, m: 6, show: '6/10' }], '<')
  },
  u6_l10: {
    s04: P([it('큰 피자의 4분의 1', cir(4, 1, { r: 100 })), it('작은 피자의 4분의 1', cir(4, 1, { r: 62 }))], 'vs'),
    s05: P([it('3분의 1이 3개 → 전체', bar(3, 3, { show: '1' })), it('5분의 1이 3개', bar(5, 3))]),
    s06: P([it('큰 전체의 2분의 1', cir(2, 1, { r: 100 })), it('작은 전체의 2분의 1', cir(2, 1, { r: 60 }))], 'vs')
  },
  u6_l11: {
    s04: bar(4, 3),
    s05: P([it('분모가 같으면 분자를', rows([{ n: 4, m: 2 }, { n: 4, m: 3 }], '<')), it('단위분수는 분모가 클수록 작게', rows([{ n: 2, m: 1 }, { n: 6, m: 1 }], '>'))]),
    s06: { k: 'tenbox', m: 7, show: '10분의 7 = 0.7' }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u6.js'), F);
