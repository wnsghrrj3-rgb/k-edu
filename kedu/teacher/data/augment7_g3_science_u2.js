/* augment7_g3_science_u2.js — 2세대 27차 「개념 그림 층」 3학년 과학 2단원 「동물의 생활」 개념 장 32장.
   부품 = ask(기준 질문 → 그렇다 ○ 파랑 / 아니다 ✗ 회색) · habitat(땅 위·땅속·하늘·물·사막·극지 바탕 판) · trait(생김새 주황 → 쓸모 초록)
          · anat(물고기 지느러미·아가미·비늘 / 곤충 머리·가슴·배) · mimic(동물 → 본떠요 → 물건) · bins·tools·chain.
   ⚠️ 그림 글자에 「 — 」 을 쓰지 않는다(게이트 선언 검산기). 「아가미」는 l05 부터. 실행: node kedu/teacher/data/augment7_g3_science_u2.js */
'use strict';
const A = (name, emoji) => emoji ? { name, emoji } : { name };
const F = {
  u2_l01: {
    s05: { k: 'tools', items: [{ emoji: '🐰', name: '토끼', kind: '귀 쫑긋 · 폴짝' }, { emoji: '🦒', name: '기린', kind: '목을 길게' }] },
    s06: { k: 'trait', subs: [{ name: '기린', rows: [{ part: '긴 목', use: '높은 잎도 먹어요' }] }, { name: '코끼리', rows: [{ part: '긴 코', use: '물건을 집어요' }] }, { name: '거북', rows: [{ part: '등딱지', use: '몸을 지켜요' }] }], note: '동물마다 다른 **생김새**' },
    s07: { k: 'habitat', zones: [{ at: 'water', items: [A('물고기')], note: '헤엄쳐요' }, { at: 'sky', items: [A('새')], note: '날아요' }, { at: 'land', name: '땅', items: [A('개미')], note: '기어요' }], note: '**생김새** + **생활 방식** = 동물의 **특징**' }
  },
  u2_l02: {
    s05: { k: 'chain', items: [{ emoji: '🔍', name: '공통점 · 차이점' }, { emoji: '📏', name: '기준 정하기' }, { emoji: '🧺', name: '무리 짓기', on: true }] },
    s06: { k: 'chain', items: [{ emoji: '👀', name: '① 관찰' }, { emoji: '⚖️', name: '② 공통점 · 차이점' }, { emoji: '🧺', name: '③ 기준으로 무리 짓기' }] },
    s07: { k: 'ask', q: '날개가 있는가?', yes: [A('물까치'), A('나비')], no: [A('고라니'), A('뱀')] }
  },
  u2_l03: {
    s05: { k: 'habitat', stack: true, zones: [{ at: 'land', items: [A('다람쥐'), A('개미'), A('뱀')] }, { at: 'under', items: [A('지렁이'), A('두더지')] }] },
    s06: { k: 'ask', q: '다리가 있는가?', yes: [A('다람쥐'), A('개미')], yt: '걷거나 뛰어요', no: [A('뱀'), A('지렁이')], nt: '기어다녀요' },
    s07: { k: 'trait', subs: [{ name: '두더지', env: '땅속', envAt: 'under', rows: [{ part: '넓적한 앞발', use: '땅을 잘 파요' }] }, { name: '지렁이', env: '땅속', envAt: 'under', rows: [{ part: '가늘고 긴 몸', use: '좁은 흙 속을 잘 다녀요' }] }] }
  },
  u2_l04: {
    s05: { k: 'habitat', zones: [{ at: 'sky', items: [A('참새'), A('독수리'), A('비둘기'), A('나비'), A('벌')], note: '새도 있고 곤충도 있어요' }] },
    s06: { k: 'bins', bins: [{ name: '새', emoji: '🐦', tone: 't0', items: [A('참새'), A('비둘기')], hint: '**날개**가 있어요' }, { name: '곤충', emoji: '🦋', tone: 't1', items: [A('나비'), A('벌')], hint: '**날개**가 있어요' }], note: '날 수 있는 동물은 모두 **날개**' },
    s07: { k: 'ask', q: '새인가, 곤충인가?', ya: '새 · 다리 2개', na: '곤충 · 다리 6개', yes: [A('참새'), A('독수리'), A('비둘기')], no: [A('나비'), A('벌'), A('개미')], yt: '깃털 날개', nt: '얇은 날개' }
  },
  u2_l05: {
    s05: { k: 'habitat', zones: [{ at: 'fresh', items: [A('붕어')] }, { at: 'sea', items: [A('상어'), A('문어'), A('게'), A('조개')] }] },
    s06: { k: 'anat', of: 'fish', hi: ['fin', 'gill'], note: '**지느러미**로 헤엄 · **아가미**로 숨' },
    s07: { k: 'ask', q: '지느러미가 있는가?', yes: [A('붕어'), A('상어')], yt: '물고기예요', no: [A('문어'), A('게')], nt: '물고기가 아니에요 · 다리로 움직여요' }
  },
  u2_l06: {
    s05: { k: 'habitat', zones: [{ at: 'desert', name: '덥고 건조한 사막', items: [A('낙타'), A('사막여우'), A('도마뱀')] }, { at: 'polar', name: '매우 추운 극지', items: [A('북극곰'), A('펭귄')] }] },
    s06: { k: 'trait', name: '낙타', emoji: '🐫', env: '사막', envAt: 'desert', rows: [{ part: '혹', use: '양분을 저장해 오래 견뎌요' }, { part: '넓은 발바닥', use: '모래에 빠지지 않아요' }] },
    s07: { k: 'trait', subs: [{ name: '북극곰', env: '극지', envAt: 'polar', rows: [{ part: '두꺼운 털 · 지방', use: '추위를 견뎌요' }] }, { name: '펭귄', env: '극지', envAt: 'polar', rows: [{ part: '두꺼운 지방', use: '추위를 견뎌요' }, { part: '무리 짓기', use: '서로 모여 따뜻하게' }] }] }
  },
  u2_l07: {
    s05: { k: 'mimic', rows: [[{ name: '오리 발', emoji: '🦆' }, { name: '물갈퀴', emoji: '🤿' }], [{ name: '새 날개', emoji: '🐦' }, { name: '비행기', emoji: '✈️' }]] },
    s06: { k: 'mimic', rows: [[{ name: '상어 비늘', emoji: '🦈' }, { name: '빠른 수영복', emoji: '🏊' }, '물의 저항이 적어요'], [{ name: '문어 빨판', emoji: '🐙' }, { name: '흡착판', emoji: '🪝' }, '잘 붙어요']] },
    s07: { k: 'chain', items: [{ emoji: '🐾', name: '훌륭한 생김새' }, { emoji: '🔍', name: '좋은 점 찾기' }, { emoji: '💡', name: '생활을 더 편리하게', on: true }] }
  },
  u2_l08: {
    s05: { k: 'mimic', rows: [[{ name: '오리 발', emoji: '🦆' }, { name: '물갈퀴', emoji: '🤿' }], [{ name: '새 날개', emoji: '🐦' }, { name: '비행기', emoji: '✈️' }], [{ name: '상어 비늘', emoji: '🦈' }, { name: '수영복', emoji: '🏊' }]], note: '우리도 만들 수 있을까요?' },
    s06: { k: 'bins', bins: [{ name: '본뜰 특징이 있어요', emoji: '🐾', tone: 't0', items: [A('오리'), A('새')] }, { name: '살아 있지 않아요', emoji: '🪨', tone: 'x', items: [A('돌멩이')] }] },
    s07: { k: 'chain', items: [{ emoji: '👀', name: '① 관찰하기' }, { emoji: '🔍', name: '② 좋은 점 찾기' }, { emoji: '💡', name: '③ 본떠 만들기', on: true }] },
    s13: { k: 'mimic', rows: [[{ name: '상어 비늘', emoji: '🦈' }, { name: '빠른 수영복', emoji: '🏊' }, '매끄러운 몸']] , note: '무거운 것을 매달면 오히려 느려져요' },
    s14: { k: 'mimic', rows: [[{ name: '문어 빨판', emoji: '🐙' }, { name: '흡착판', emoji: '🪝' }, '잘 붙어요'], [{ name: '문어 빨판', emoji: '🐙' }, { name: '미끄럼 방지 장갑', emoji: '🧤' }, '미끄러운 곳에 착']] }
  },
  u2_l10: {
    s05: { k: 'chain', items: [{ emoji: '🍚', name: '먹이와 물' }, { emoji: '🏥', name: '아프면 병원' }, { emoji: '💚', name: '끝까지 책임', on: true }] },
    s06: { k: 'mimic', ha: '동물', hb: '필요한 돌봄', rows: [[A('강아지'), { name: '매일 산책', emoji: '🦮' }], [A('물고기'), { name: '깨끗한 물', emoji: '💧' }], [A('고양이'), { name: '화장실 치우기', emoji: '🧹' }], [A('햄스터'), { name: '쳇바퀴', emoji: '🎡' }]] },
    s07: { k: 'bins', bins: [{ name: '이렇게 해요', emoji: '○', tone: 't0', items: [{ name: '만진 뒤 손 씻기', emoji: '🧼' }, { name: '무서워하면 쉬게 하기', emoji: '🤫' }] }, { name: '위험해요', emoji: '✗', tone: 'x', items: [{ name: '갑자기 다가가기', emoji: '🏃' }, { name: '큰 소리로 놀라게 하기', emoji: '📢' }] }] }
  },
  u2_l11: {
    s05: { k: 'habitat', zones: [{ at: 'land', name: '땅', items: [A('다람쥐')] }, { at: 'sky', items: [A('참새')] }, { at: 'water', items: [A('붕어')] }, { at: 'desert', name: '특별한 곳', items: [A('낙타')] }], note: '사는 곳에 **알맞은 생김새**' },
    s06: { k: 'mimic', rows: [[{ name: '오리 발', emoji: '🦆' }, { name: '물갈퀴', emoji: '🤿' }], [{ name: '문어 빨판', emoji: '🐙' }, { name: '흡착판', emoji: '🪝' }]], note: '동물은 **소중한 생명** · 끝까지 책임' },
    s07: { k: 'ask', q: '지느러미가 있는가?', yes: [A('붕어')], no: [A('문어')], note: '기준 하나로 물으면 **누가 나눠도 같은 무리**' }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_science_u2.js'), F);
