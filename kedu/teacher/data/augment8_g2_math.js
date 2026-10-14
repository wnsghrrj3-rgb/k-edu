/* augment8_g2_math.js — 2세대 115차 「개념 그림 층」 2학년 수학 글만 개념 장 47장(u1 10 · u2 9 · u4 14 · u5 7 · u6 7).
   준호(2026-10-10) 「어떤 그림도 없으면 심심하고 지루해 보여」 → 글만 남은 개념 장에 그림 한 칸(fig)을 끼워 cv2(그림이 주인공) 로 보낸다.
   선행 표기 지킴 — 2학년 길이 단원은 mm 를 쓰지 않음(어긋난 끝은 eq 로 「약」만), 길이 단위(cm) 전 차시(l01~l03)는 cm 없음.
   실행: node kedu/teacher/data/augment8_g2_math.js */
'use strict';
const path = require('path');
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const T = (items, o) => Object.assign({ k: 'tools', items }, o || {});
const c = (emoji, name, kind, on) => Object.assign({ emoji, name }, kind ? { kind } : {}, on ? { on: true } : {});
const EQ = (lines, tag) => Object.assign({ k: 'eq', lines }, tag ? { tag } : {});
const R = (o) => Object.assign({ k: 'ruler' }, o);
const B = (total, per, label) => Object.assign({ k: 'bundle', total, per }, label ? { label } : {});
const J = (start, step, n) => ({ k: 'jump', start, step, n });
const F = {
  g2_math_u1: {
    u1_l01: { s05: P([it('두 자리 수', { k: 'pvt', v: '99', cols: 3 }), it('세 자리 수', { k: 'pvt', v: '100' })], '➜') },
    u1_l02: { s05: P([it('90보다 10 큰 수', J(80, 10, 3)), it('99보다 1 큰 수', J(98, 1, 3)), it('10이 10개', { k: 'bt', n: 100, split: false })]) },
    u1_l03: { s05: { k: 'pvt', rows: [{ v: '200', label: '이백' }, { v: '500', label: '오백' }, { v: '700', label: '칠백' }], hi: 2 } },
    u1_l04: { s05: { k: 'pvt', rows: [{ v: '254', label: '이백오십사' }, { v: '503', label: '오백삼' }] } },
    u1_l05: { s04: { k: 'pvt', v: '323', expand: true, hi: [2, 0] } },
    u1_l06: { s05: J(997, 1, 4) },
    u1_l07: { s04: { k: 'pvt', rows: [{ v: '352' }, { v: '347' }], cmp: true }, s05: { k: 'pvt', rows: [{ v: '196' }, { v: '169' }], cmp: true } },
    u1_l08: { s04: { k: 'chain', items: [c('💯', '몇백'), c('🔢', '자릿값'), c('🦘', '뛰어 세기'), c('⚖️', '크기 비교')] } },
    u1_l09: { s04: { k: 'pvt', v: '245', expand: true, read: true } }
  },
  g2_math_u2: {
    u2_l01: { s05: T([c('⚠️', '표지판', '세모'), c('🪟', '창문', '네모'), c('🕐', '시계', '동그라미')]) },
    u2_l02: { s05: { k: 'tri', angs: [60, 60, 60], ticks: false, show: false, label: '변 3개 · 꼭짓점 3개' } },
    u2_l03: { s05: { k: 'geo', type: 'list', items: [{ t: 'tri', right: false, label: '변 3 · 꼭짓점 3' }, { t: 'quad', label: '변 4 · 꼭짓점 4' }] } },
    u2_l04: { s05: T([c('⭕', '작은 원', '곧은 선 0'), c('🔵', '큰 원', '꼭짓점 0'), c('🪙', '동전', '둥근 곡선')]) },
    u2_l05: { s05: { k: 'paper', pieces: [[[0, 0], [4, 0], [0, 4]], [[4, 0], [4, 4], [0, 4]]] } },
    u2_l06: { s05: T([c('🧱', '아래 3개', '개수'), c('⬆️', '그 위', '위치'), c('➡️', '오른쪽에 1개', '방향')]) },
    u2_l07: { s05: T([c('2️⃣', '2층', '그 위', true), c('1️⃣', '1층', '맨 아래')]) },
    u2_l08: { s04: { k: 'chain', items: [c('🔺', '삼각형'), c('🟦', '사각형'), c('⭕', '원'), c('🧩', '칠교판'), c('🧱', '쌓기나무')] } },
    u2_l09: { s05: T([c('🔺', '세모', '지붕'), c('🟥', '네모', '벽'), c('⭕', '동그라미', '창문')]) }
  },
  g2_math_u4: {
    u4_l01: { s04: T([c('✏️', '연필', '더 길어요', true), c('🧽', '지우개', '끝을 맞춰요')]) },
    u4_l02: { s04: T([c('🍃', '가 잎', '종이띠로 본떠요'), c('🌿', '나 잎', '더 길어요', true)]), s05: T([c('⬅️', '왼쪽 끝 맞추기', '시작점', true), c('❌', '어긋나면', '길이가 잘못 보여요')]) },
    u4_l03: { s04: T([c('📎', '종이집게 8번', '빈틈없이 이어서', true), c('📘', '수학책 긴 쪽')]), s05: T([c('🖐️', '1뼘', '엄지~검지'), c('💪', '팔 길이', '3뼘쯤', true)]) },
    u4_l04: { s04: T([c('🖐️', '내 뼘'), c('✋', '친구 뼘', '달라요'), c('📏', '같은 단위', '필요해요', true)]), s05: R({ obj: { cm: 1, name: '' }, from: 0, to: 4, show: '1 cm · 1 센티미터' }) },
    u4_l05: { s04: R({ from: 0, to: 6 }), s05: R({ obj: { cm: 8, name: '색연필' }, from: 0, to: 10 }) },
    u4_l06: { s04: EQ(['끝: **7**과 8 사이', '**7**에 더 가까워요', '→ **약 7 cm**']), s05: P([it('딱 맞으면', R({ obj: { cm: 8, name: '막대' }, from: 0, to: 9 })), it('사이에서 끝나면', EQ(['7 cm쯤', '= **약 7 cm**']))]) },
    u4_l07: { s04: T([c('💅', '엄지손톱', '약 1 cm'), c('☝️', '가운뎃손가락', '약 5 cm'), c('🖐️', '한 뼘', '약 10 cm', true)]), s05: { k: 'joins', items: [{ name: '손가락', cm: 5 }, { name: '손가락', cm: 5 }], total: '약 10 cm' } },
    u4_l09: { s05: T([c('📏', '딱 맞으면', '8 cm'), c('〰️', '사이에서 끝나면', '약 7 cm', true)]) }
  },
  g2_math_u5: {
    u5_l01: { s05: T([c('🔍', '찾기 쉬워요'), c('✨', '깔끔해져요')]) },
    u5_l02: { s05: { k: 'sort2', a: { name: '사람마다 달라요', items: ['좋아하는', '예쁜', '맛있는'] }, b: { name: '분명한 기준', items: ['색깔', '모양', '개수'], hint: '누가 나눠도 같아요' } } },
    u5_l03: { s05: { k: 'bins', bins: [{ name: '동그라미', emoji: '⚪', tone: 't0', items: [{ name: '빨간 단추' }, { name: '파란 단추' }] }, { name: '네모', emoji: '🟦', tone: 't1', items: [{ name: '노란 단추' }, { name: '빨간 단추' }] }], note: '기준 = **모양**' } },
    u5_l04: { s05: EQ(['빨강 ／／／／', '노랑 ／／', '하나 셀 때마다 **／**']) },
    u5_l05: { s05: { k: 'ptable', head: '칸', unit: '개', items: [{ name: '가', v: 4 }, { name: '나', v: 6 }, { name: '다', v: 3 }], title: '4 + 6 + 3 = 13' } },
    u5_l06: { s04: { k: 'chain', items: [c('📐', '기준 정하기'), c('🗂️', '분류'), c('🔢', '세기'), c('🗣️', '말하기')] } },
    u5_l07: { s05: { k: 'ptable', head: '색깔', items: [{ name: '빨강', v: 6 }, { name: '노랑', v: 3 }, { name: '파랑', v: 4 }, { name: '흰색', v: 2 }], hi: '빨강', unit: '조각', title: '색깔별 조각 수' } }
  },
  g2_math_u6: {
    u6_l01: { s05: J(5, 5, 4) },
    u6_l02: { s05: P([it('3씩 뛰어 세기', J(3, 3, 4)), it('3씩 4묶음', B(12, 3))]) },
    u6_l03: { s05: B(20, 4, '20개를 4씩 묶으면 5묶음') },
    u6_l04: { s05: P([it('4의 2배', B(8, 4)), it('8의 1배', B(8, 8))]) },
    u6_l05: { s05: P([it('기준 4개', B(4, 4, '4개')), it('2배 = 8개', B(8, 4))]) },
    u6_l06: { s05: { k: 'arr', r: 5, c: 4, rows: true, cols: true, label: '4 + 4 + 4 + 4 + 4 = 4 × 5 = 20' } },
    u6_l07: { s05: P([it('4 × 6', { k: 'arr', r: 6, c: 4, label: '4 × 6 = 24' }), it('6 × 4', { k: 'arr', r: 4, c: 6, label: '6 × 4 = 24' })], '=') },
    u6_l09: { s05: B(6, 3, '3 + 3 = 3씩 2묶음 = 3의 2배 = 3 × 2') }
  }
};
module.exports = F;
if (require.main === module) for (const f of Object.keys(F)) require('./augment7_lib.js')(path.join(__dirname, f + '.js'), F[f]);
