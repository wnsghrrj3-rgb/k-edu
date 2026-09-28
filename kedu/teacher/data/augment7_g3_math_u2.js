/* augment7_g3_math_u2.js — 2세대 22차 「개념 그림 층」 3학년 수학 2단원 「평면도형」 개념 장 24장.
   그림 문법: 주황 ㄱ자 = 직각 · 빨강 짧은 금 = 같은 길이 · 점선 화살표 = 끝없이 늘임. 실행: node kedu/teacher/data/augment7_g3_math_u2.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const G = (type, o) => Object.assign({ k: 'geo', type }, o || {});
const L = (items) => ({ k: 'geo', type: 'list', items });
const F = {
  u2_l01: {
    s04: L([{ t: 'tri', right: false, label: '삼각형 — 곧은 선 3개' }, { t: 'quad', label: '사각형 — 곧은 선 4개' }]),
    s06: L([{ t: 'tri', right: false, label: '표지판' }, { t: 'rect', marks: false, label: '횡단보도' }, { t: 'tri', right: false, rot: 180, label: '옐로카펫' }]),
    s07: { k: 'chain', items: [{ name: '선분·직선' }, { name: '각·직각' }, { name: '직각삼각형' }, { name: '직사각형' }] }
  },
  u2_l02: { s04: G('segment'), s05: G('ray'), s06: G('line') },
  u2_l03: { s04: G('angle'), s05: G('angle', { parts: true }), s06: P([it('각 ㄱㄴㄷ', G('angle')), it('각 ㄷㄴㄱ — 같은 각', G('angle', { name: '각 ㄷㄴㄱ' }))], '=') },
  u2_l04: { s04: G('fold'), s05: G('angle', { right: true }), s06: G('setsquare') },
  u2_l05: {
    s04: L([{ t: 'tri', right: true, label: '직각 있음' }, { t: 'tri', right: true, rot: 90 }, { t: 'tri', right: false, label: '직각 없음' }, { t: 'tri', right: false, rot: 30 }]),
    s05: L([{ t: 'tri', right: true, label: '직각삼각형 — 직각 1개' }]),
    s06: L([{ t: 'tri', right: true, label: '아래' }, { t: 'tri', right: true, rot: 90, label: '옆' }, { t: 'tri', right: true, rot: 200, label: '기울어도' }, { t: 'tri', right: true, rot: -40, label: '거꾸로도' }])
  },
  u2_l06: {
    s04: L([{ t: 'rect', label: '네 각 모두 직각' }, { t: 'square' , eq: false}, { t: 'quad', label: '그렇지 않은 것' }, { t: 'quad', rot: 150 }]),
    s05: L([{ t: 'rect', label: '직사각형 — 직각 4개' }])
  },
  u2_l07: {
    s04: L([{ t: 'seg', label: '선분' }, { t: 'tri', right: true, label: '직각삼각형' }, { t: 'rect', label: '직사각형' }, { t: 'square', label: '정사각형' }]),
    s05: L([{ t: 'square', label: '얼굴 = 정사각형' }, { t: 'tri', right: true, label: '귀 = 직각삼각형' }, { t: 'rect', label: '눈 = 직사각형' }]),
    s06: G('cat', { count: true })
  },
  u2_l08: {
    s04: G('three'),
    s05: P([it('각 — 두 반직선', G('angle')), it('직각 — ㄱ자 표시', G('angle', { right: true }))]),
    s06: L([{ t: 'tri', right: true, label: '직각삼각형' }, { t: 'rect', label: '직사각형' }, { t: 'square', label: '정사각형' }])
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u2.js'), F);
