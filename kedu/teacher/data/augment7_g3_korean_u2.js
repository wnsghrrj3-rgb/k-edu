/* augment7_g3_korean_u2.js — 2세대 24차 「개념 그림 층」 3학년 국어 2단원 「문장의 짜임·소리 내어 읽기」 개념 장 24장.
   부품 = sents(문장 짜임: 파랑 누가/무엇이 · 주황 뒷부분) · pause(∨ 쉬어 읽기) · text(글 읽기 판) · mood(인물 마음) · tools(글자·이모지 카드).
   실행: node kedu/teacher/data/augment7_g3_korean_u2.js */
'use strict';
const F = {
  u2_l01: {
    s05: { k: 'tools', items: [{ emoji: '🙋', name: '발표할 때' }, { emoji: '📢', name: '방송으로 알릴 때' }, { emoji: '📖', name: '동생에게 읽어 줄 때' }] },
    s06: { k: 'mood', items: [{ who: '👧', name: '읽는 사람', say: '또박또박 **분명하게**', how: '알맞은 빠르기' }, { who: '👦', name: '듣는 사람', say: '아, 무슨 뜻인지 **잘 알겠어!**', feel: '뜻이 또렷해요' }] },
    s07: { k: 'chain', items: [{ name: '① 문장의 짜임' }, { name: '② 유창하게 읽기' }, { name: '③ 실감 나게 읽기' }] }
  },
  u2_l02: {
    s05: { k: 'sents', items: [{ a: '콩이가', b: '뛰어갑니다.', lb: '어찌하다', sub: false }] },
    s06: { k: 'sents', items: [{ a: '콩이가', b: '짖습니다.', t: 'act' }, { a: '콩이가', b: '뜁니다.', t: 'act' }, { a: '콩이가', b: '달립니다.', t: 'act' }] },
    s07: { k: 'sents', items: [{ a: '콩이는', b: '귀엽습니다.', t: 'state' }, { a: '콩이는', b: '작습니다.', t: 'state' }, { a: '하늘이', b: '파랗습니다.', t: 'state' }] },
    s13: { k: 'sents', items: [{ a: '민주는', b: '3학년 학생입니다.', t: 'what' }, { a: '콩이는', b: '강아지입니다.', t: 'what' }] },
    s14: { k: 'sents', tree: true, a: '콩이가', items: [{ t: 'act', b: '뛰어갑니다' }, { t: 'state', b: '귀엽습니다' }, { t: 'what', b: '강아지입니다' }] },
    s15: { k: 'sents', items: [{ a: '콩이가', b: '달립니다.', t: 'act' }, { a: '꽃이', b: '예쁩니다.', t: 'state' }, { a: '민주는', b: '학생입니다.', t: 'what' }] },
    s25: { k: 'sents', tree: true, a: '(누가/무엇이)', items: [] },
    s26: { k: 'sents', items: [{ a: '콩이가', b: '강아지입니다.', t: 'what', ok: true }, { a: '콩이가', b: '파랗습니다.', t: 'state', bad: true }] }
  },
  u2_l05: {
    s05: { k: 'tools', items: [{ emoji: '📅', name: '음력 5월 5일' }, { emoji: '🎠', name: '그네 타기' }, { emoji: '🤼', name: '씨름' }, { emoji: '🌿', name: '창포물 머리 감기' }] },
    s06: { k: 'pause', lines: ['사람들은 ∨ 그네를 탑니다.'], key: false },
    s07: { k: 'pause', lines: ['씨름을 합니다. ∨∨'] },
    s13: { k: 'pause', lines: ['사람들은 ∨ 그네를 탑니다. ∨∨', '아이들이 ∨ 씨름을 합니다. ∨∨', '단오는 ∨ 즐거운 명절입니다. ∨∨'] },
    s14: { k: 'sents', items: [{ a: '나는', b: '그네를 탑니다.', t: 'act', mark: true }] }
  },
  u2_l07: {
    s05: { k: 'tools', items: [{ emoji: '🗣️', name: '또박또박' }, { emoji: '⏱️', name: '알맞은 빠르기' }, { emoji: '🎵', name: '자연스럽게' }] },
    s06: { k: 'tools', items: [{ emoji: '🗣️', name: '분명하게' }, { emoji: '⏱️', name: '알맞은 빠르기' }, { emoji: '⏸️', name: '알맞게 띄어' }] },
    s07: { k: 'text', title: '발표를 잘하려면', lines: ['발표할 때에는 또박또박 말해요.', '듣는 사람을 바라봐요.', '친구가 말할 때에는 끝까지 들어요.'] },
    s13: { k: 'pause', rows: [{ sym: ',', name: '쉼표', mark: '∨', say: '조금 쉬어 읽어요' }, { sym: '.', name: '마침표', mark: '∨∨', say: '조금 더 쉬어 읽어요' }, { sym: '?', name: '물음표', say: '끝을 **올려** 읽어요' }] },
    s14: { k: 'pause', lines: ['발표할 때에는 ∨ 또박또박 말합니다. ∨∨', '듣는 사람을 ∨ 바라봅니다. ∨∨', '친구의 발표를 ∨ 끝까지 듣습니다. ∨∨'], key: false }
  },
  u2_l09: {
    s05: { k: 'text', title: '할머니의 사진첩', lines: ['지우는 오래된 사진첩을 펼쳐요.', '할머니와 텃밭에서 찍은 사진이 보여요.', '지우의 마음이 따뜻해져요.'] },
    s06: { k: 'mood', items: [{ who: '👧', name: '지우', say: '할머니, 보고 싶어요…', feel: '그립고 고마운 마음' }] },
    s07: { k: 'sound', rule: '글 속 낱말이 마음을 알려 줘요', items: [{ w: '가만히', s: '차분한 마음' }, { w: '속삭였습니다', s: '조용한 마음' }, { w: '따뜻해졌습니다', s: '그리운 마음' }] },
    s13: { k: 'mood', items: [{ who: '👧', name: '준언어 = 목소리', say: '차분하고 **부드럽게**', how: '크기 · 빠르기 · 높낮이' }] },
    s14: { k: 'mood', items: [{ who: '🙂', name: '따뜻한 장면', how: '부드러운 미소' }, { who: '😮', name: '놀란 장면', how: '커진 눈' }] },
    s15: { k: 'mood', items: [{ who: '😟', name: '그리운 마음', how: '차분하고 부드러운 목소리' }, { who: '😀', name: '기쁜 마음', how: '밝고 신나는 목소리' }, { who: '😮', name: '놀란 마음', how: '커진 눈 · 빨라진 말' }] },
    s25: { k: 'chain', items: [{ name: '① 장면 고르기' }, { name: '② 마음 정하기' }, { name: '③ 목소리·표정·몸짓 떠올리기' }, { name: '④ 소리 내어 읽기' }] },
    s26: { k: 'text', title: '할머니의 사진첩', lines: ['지우는 사진첩을 가만히 펼쳤습니다.', '"할머니, 보고 싶어요." 지우가 속삭였습니다.', '지우의 마음이 따뜻해졌습니다.'] }
  },
  u2_l12: {
    s05: { k: 'pause', lines: ['우리는 ∨ 발표회를 준비합니다. ∨∨'], key: true },
    s06: { k: 'mood', items: [{ who: '👦', name: '인물의 마음 정하기', how: '목소리 · 표정 · 몸짓' }] },
    s07: { k: 'mood', items: [{ who: '👧', name: '읽는 친구', say: '(끝까지 읽어요)' }, { who: '👦', name: '듣는 친구', say: '잘한 점을 **칭찬**해요', feel: '고칠 점은 도와줘요' }] },
    s13: { k: 'pause', lines: ['봄이 오면 ∨ 들판에 꽃이 핍니다. ∨∨', '아이들이 ∨ 신나게 뛰어놉니다. ∨∨', '오늘은 ∨ 정말 즐거운 날입니다. ∨∨'], key: false },
    s14: { k: 'mood', items: [{ who: '👧', name: '읽는 사람', say: '(무대에서 읽어요)' }, { who: '😀', name: '듣는 사람', say: '짝짝짝! 끝까지 들었어요', feel: '무대가 살아나요' }] }
  },
  u2_l14: {
    s05: { k: 'sents', tree: true, a: '누가/무엇이', items: [{ t: 'act', b: '움직임' }, { t: 'state', b: '상태' }, { t: 'what', b: '무엇인지' }] },
    s06: { k: 'pause', lines: ['누가/무엇이 ∨ 어찌하다. ∨∨'] },
    s07: { k: 'mood', items: [{ who: '👧', name: '유창하게', how: '또박또박 · 알맞은 빠르기' }, { who: '👦', name: '실감 나게', how: '목소리 · 표정 · 몸짓' }] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_korean_u2.js'), F);
