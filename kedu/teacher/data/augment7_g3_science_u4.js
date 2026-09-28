/* augment7_g3_science_u4.js — 2세대 27차 「개념 그림 층」 3학년 과학 4단원 「생물의 한살이」 개념 장 31장.
   부품 = cycle(한살이 띠 — 지금 단계 주황 · 「다음은」 점선 · 뒤 단계 흐리게 · 빠진 단계 점선 취소 · ↺ 다시 이어져요)
          · anat(곤충 머리·가슴·배·다리 세 쌍·날개 두 쌍) · cond(조건 실험 — 다르게 할 조건 주황 / 같게 할 조건 파랑 / 결과 초록)
          · need(싹 틀 때·자랄 때 ○ 필요해요 / ✗ 없어도 돼요) · bins(알/새끼 · 한해살이/여러해살이 · 번데기 있음/없음) · mimic(자라서).
   ⚠️ 그림 글자에 「 — 」 을 쓰지 않는다. 실행: node kedu/teacher/data/augment7_g3_science_u4.js */
'use strict';
const A = (name, emoji) => emoji ? { name, emoji } : { name };
const BUT = [A('알'), A('애벌레'), A('번데기'), { name: '어른벌레' }];
const but = (hi, extra) => Object.assign({ k: 'cycle', who: '배추흰나비', stages: BUT, hi, next: true, fade: true }, extra || {});
const HEN = [{ name: '알', emoji: '🥚', ic: 'none' }, A('병아리'), A('어린 닭'), A('다 자란 닭')];
const BEAN = [A('씨'), A('싹'), A('자람'), A('꽃'), A('열매')];
const SPROUT = { title: '씨가 싹 틀 때', items: [{ name: '물', emoji: '💧' }, { name: '알맞은 온도', emoji: '🌡️' }, { name: '햇빛', emoji: '☀️', ok: false }] };
const GROW = { title: '식물이 자랄 때', items: [{ name: '물', emoji: '💧' }, { name: '햇빛', emoji: '☀️' }] };
const CUP = [{ name: '가 컵', emoji: '🥛' }, { name: '나 컵', emoji: '🥛' }], POT = [{ name: '가 화분', emoji: '🪴' }, { name: '나 화분', emoji: '🪴' }];
const F = {
  u4_l01: {
    s05: { k: 'bins', bins: [{ name: '자라고 있는 생물', emoji: '🔎', tone: 't2', items: [{ name: '병아리', tag: '알에서 깨어나요' }, { name: '올챙이', tag: '물속을 헤엄쳐요' }, { name: '강낭콩', tag: '싹이 텄어요' }] }] },
    s06: { k: 'mimic', verb: '자라서', ha: '어릴 때', hb: '자란 뒤', rows: [[A('애벌레'), { name: '나비', emoji: '🦋' }], [A('싹'), { name: '꽃', emoji: '🌸' }], [A('병아리'), { name: '닭', emoji: '🐓' }]], note: '자라면서 **모습이 변해요**' },
    s07: { k: 'cycle', stages: [{ name: '태어나요', emoji: '🐣' }, { name: '자라요', emoji: '🌿' }, { name: '자손을 남겨요', emoji: '👪' }], loop: '다시 이어져요 · 한살이' }
  },
  u4_l02: {
    s05: but(0, { note: '잎 **뒷면** · 노란색 · 약 1mm' }),
    s06: but(1, { note: '잎을 갉아 먹으며 자라요 · **허물**을 벗어요' }),
    s07: but(2, { note: '움직이지 않고 먹지 않아요' }),
    s13: { k: 'cycle', who: '배추흰나비', stages: BUT, hi: 3, loop: '다시 잎 뒷면에 알을 낳아요' },
    s14: { k: 'anat', of: 'insect', hi: ['head', 'thorax', 'belly', 'leg'], note: '몸이 **머리 · 가슴 · 배** + **다리 세 쌍** = 곤충' }
  },
  u4_l04: {
    s05: { k: 'cycle', who: '닭', stages: HEN, loop: '다시 알을 낳아요', note: '단단한 껍데기에 싸인 알' },
    s06: { k: 'bins', bins: [{ name: '알을 낳아요', emoji: '🥚', tone: 't1', items: [A('닭'), A('개구리'), A('잠자리'), A('뱀')] }] },
    s07: { k: 'bins', bins: [{ name: '알을 낳아요', emoji: '🥚', tone: 't1', items: [A('닭'), A('개구리'), A('뱀')] }, { name: '새끼를 낳아요', emoji: '🍼', tone: 't0', items: [A('개'), A('소'), A('돌고래'), A('박쥐')], hint: '어미젖을 먹여 키워요' }], note: '동물마다 한살이가 다양해요' }
  },
  u4_l05: {
    s05: { k: 'cond', cols: CUP, rows: [{ name: '물', emoji: '💧', v: ['줘요', '안 줘요'], diff: true }], note: '다르게 할 조건은 **딱 하나**' },
    s06: { k: 'cond', cols: CUP, rows: [{ name: '물', emoji: '💧', v: ['줘요', '안 줘요'], diff: true }, { name: '온도', emoji: '🌡️', v: ['알맞게', '알맞게'] }, { name: '씨앗 종류', emoji: '🫘', v: ['강낭콩', '강낭콩'] }, { name: '컵 · 탈지면', emoji: '🥛', v: ['똑같이', '똑같이'] }] },
    s07: { k: 'cond', cols: CUP, rows: [{ name: '물', emoji: '💧', v: ['줘요', '안 줘요'], diff: true }, { name: '온도', emoji: '🌡️', v: ['알맞게', '알맞게'] }], result: { name: '결과', v: ['🌱 싹이 텄어요', '🫘 그대로예요'], win: 0 }, note: '싹 트려면 **물**과 **알맞은 온도**' }
  },
  u4_l06: {
    s05: { k: 'cond', cols: POT, rows: [{ name: '물', emoji: '💧', v: ['줘요', '안 줘요'], diff: true }, { name: '놓은 곳', emoji: '📍', v: ['같은 곳', '같은 곳'] }], result: { name: '결과', v: ['🌿 잘 자랐어요', '🥀 잘 못 자랐어요'], win: 0 } },
    s06: { k: 'cond', cols: POT, rows: [{ name: '햇빛', emoji: '☀️', v: ['받아요', '못 받아요'], diff: true }, { name: '물', emoji: '💧', v: ['똑같이', '똑같이'] }, { name: '흙', emoji: '🟫', v: ['똑같이', '똑같이'] }], result: { name: '결과', v: ['🌿 잘 자랐어요', '🥀 잘 못 자랐어요'], win: 0 } },
    s07: { k: 'need', cols: [SPROUT, GROW] }
  },
  u4_l07: {
    s05: { k: 'bins', bins: [{ name: '한해살이', emoji: '1️⃣', tone: 't2', items: [A('벼'), A('강낭콩'), A('나팔꽃')], hint: '한 해만 살아요' }, { name: '여러해살이', emoji: '🔁', tone: 't0', items: [A('감나무'), A('사과나무'), A('민들레')], hint: '해마다 열매를 맺어요' }] },
    s06: { k: 'cycle', who: '강낭콩', stages: BEAN, loop: '다시 씨를 남겨요' },
    s07: { k: 'cycle', who: '모든 식물', whoEmoji: '🌱', stages: BEAN, loop: '씨에서 시작해 다시 씨', note: '다른 점은 **사는 기간**' }
  },
  u4_l08: {
    s05: { k: 'chain', items: [{ emoji: '📛', name: '생물 이름' }, { emoji: '🔢', name: '한살이 순서', on: true }, { emoji: '✨', name: '특징 셋' }] },
    s06: { k: 'bins', bins: [{ name: '한살이가 있어요', emoji: '🌱', tone: 't2', items: [A('배추흰나비'), A('닭'), A('강낭콩')], hint: '살아 있는 **생물**' }, { name: '한살이가 없어요', emoji: '✗', tone: 'x', items: [A('돌'), A('자동차')], hint: '자손을 남기지 않아요' }] },
    s07: { k: 'bins', bins: [{ name: '동물은', emoji: '🐾', tone: 't1', items: [{ name: '알', emoji: '🥚', ic: 'none' }, { name: '새끼', emoji: '🐶' }] }, { name: '식물은', emoji: '🌿', tone: 't2', items: [A('씨')] }], note: '여기서 **시작**해요' },
    s13: but(0),
    s14: { k: 'bins', bins: [{ name: '가장 중요해요', emoji: '🔢', tone: 't1', items: [{ name: '한살이 순서를 바르게', emoji: '✅' }, { name: '보는 사람이 쉽게', emoji: '👀' }] }, { name: '그다음이에요', emoji: '🎨', tone: 'x', items: [{ name: '예쁘게 꾸미기', emoji: '🖍️' }] }], note: '친구 카드는 **좋은 점**부터' }
  },
  u4_l10: {
    s05: { k: 'cycle', who: '번데기를 거치는 곤충', whoEmoji: '🐞', stages: BUT, hi: 2, note: '배추흰나비 · 무당벌레 · 사슴벌레' },
    s06: { k: 'cycle', who: '번데기를 거치지 않는 곤충', whoEmoji: '🦗', stages: [{ name: '알', ic: 'none' }, { name: '애벌레', ic: 'none' }, { name: '번데기', ic: 'none', skip: true }, { name: '어른벌레', ic: '잠자리' }], note: '잠자리 · 메뚜기 · 매미' },
    s07: { k: 'habitat', stack: true, zones: [{ at: 'sky', name: '어른벌레', items: [A('잠자리')], note: '하늘을 날아요' }, { at: 'fresh', name: '애벌레', items: [{ name: '잠자리 애벌레' }], note: '물속에 살아요' }], note: '애벌레와 허물은 **눈으로만**' }
  },
  u4_l11: {
    s05: { k: 'bins', bins: [{ name: '알로 시작', emoji: '🥚', tone: 't1', items: [A('닭')] }, { name: '새끼로 시작', emoji: '🍼', tone: 't0', items: [A('개')] }, { name: '씨로 시작', emoji: '🌱', tone: 't2', items: [A('강낭콩')] }] },
    s06: { k: 'need', cols: [SPROUT, GROW] },
    s07: { k: 'bins', bins: [{ name: '한해살이', emoji: '1️⃣', tone: 't2', items: [A('벼')] }, { name: '여러해살이', emoji: '🔁', tone: 't0', items: [A('민들레')] }, { name: '번데기 있음', emoji: '🦋', tone: 't1', items: [A('배추흰나비')] }, { name: '번데기 없음', emoji: '✗', tone: 'x', items: [A('매미')] }] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_science_u4.js'), F);
