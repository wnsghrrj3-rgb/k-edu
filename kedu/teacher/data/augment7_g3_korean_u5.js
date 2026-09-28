/* augment7_g3_korean_u5.js — 2세대 25차 「개념 그림 층」 3학년 국어 5단원 「인물의 마음을 짐작하며 읽어요 · 마음을 전하는 글」 개념 장 37장.
   부품 = mood(인물 성격·말과 행동) · letter(편지지 — 받는 사람·상황/마음 꼬리표·쓴 사람 · parts 짜임) · sents(꾸며 주는 말 + 인물) · sort2(마음/성격 · 친구/웃어른) · para pairs(상황 → 마음) · note · sound ox(-ㄹ게 표기).
   실행: node kedu/teacher/data/augment7_g3_korean_u5.js */
'use strict';
const F = {
  u5_l01: {
    s05: { k: 'tools', items: [{ emoji: '🤝', name: '친절하다' }, { emoji: '🦁', name: '용감하다' }, { emoji: '💪', name: '끈기 있다' }] },
    s06: { k: 'chain', items: [{ emoji: '📖', name: '① 성격 파악하며 읽기' }, { emoji: '✉️', name: '② 마음을 전하는 글' }, { emoji: '🧱', name: '③ 단원 마무리' }] },
    s07: { k: 'tools', items: [{ emoji: '🏷️', name: '수식하는 말' }, { emoji: '🗣️', name: '말과 행동' }, { emoji: '✉️', name: '상황과 생각·느낌' }] }
  },
  u5_l02: {
    s05: { k: 'sort2', a: { name: '마음', items: ['그때그때 생겼다 사라져요'], hint: '예) 기쁨 · 속상함' }, b: { name: '성격', items: ['여러 상황에서 **일관되게**'], hint: '예) 친절함 · 용감함' } },
    s06: { k: 'sents', items: [{ la: '꾸며 주는 말', a: '성질이 급한', lb: '인물', b: '별이' }] },
    s07: { k: 'mood', items: [{ who: '👧', name: '하나', say: '떨어진 휴지, 내가 주울게!', how: '말과 행동' }, { who: '👦', name: '두리', say: '(못 본 척 지나가요)', how: '말과 행동' }] }
  },
  u5_l03: {
    s05: { k: 'tools', items: [{ emoji: '⏰', name: '차례대로' }, { emoji: '🗣️', name: '말과 행동' }, { emoji: '💓', name: '마음 변화' }] },
    s06: { k: 'text', title: '처음에 일어난 일', lines: ['도리는 "내가 모은 건 내 것"이라며 욕심을 부렸어요.', '마을 너구리들과 부딪히기 싫어 산꼭대기로 떠났어요.', '도리는 혼자 힘으로 튼튼한 집을 지었어요.'] },
    s07: { k: 'mood', items: [{ who: '🦝', name: '도리', say: '내 것은 내 것!', feel: '**주체적** · **고집**이 세요', how: '한 인물도 여러 성격' }] },
    s13: { k: 'text', title: '그다음에 일어난 일', lines: ['어느 날 밤, 큰비가 내려 산꼭대기가 무너졌어요.', '도리는 무너진 기둥에 깔려 꼼짝할 수 없었어요.', '"여기는 산꼭대기인데, 누가 내 소리를 들을까……"'] },
    s14: { k: 'mood', items: [{ who: '🦝', name: '마을 너구리들', say: '괜찮으세요?', how: '비를 맞으며 힘을 모아요' }, { who: '🦝', name: '도리', feel: '구해 주었어요' }] }
  },
  u5_l05: {
    s05: { k: 'tools', items: [{ emoji: '🏷️', name: '수식하는 말' }, { emoji: '🗣️', name: '말과 행동' }, { emoji: '🖼️', name: '표정과 몸짓' }] },
    s06: { k: 'letter', to: '할머니께', lines: ['죄송해요. 그림을 그리다 공이 굴러가', '할머니 화분을 깨뜨렸어요. 제 실수예요.', '다시 잘 키울게요. 약속해요.'], from: '민서 올림' },
    s07: { k: 'mood', items: [{ who: '👧', name: '민서', say: '제 실수예요. 다시 잘 키울게요.', how: '숨기지 않고 사실대로 · 약속', feel: '말과 행동에 성격이 드러나요' }] },
    s13: { k: 'letter', to: '민서에게', lines: ['솔직하게 말해 줘서 고맙구나.', '화분은 괜찮으니 걱정 말거라.', '주말에 새 꽃 심는 걸 보여 주마.'], from: '옆집 할머니로부터' },
    s14: { k: 'mood', items: [{ who: '👵', name: '할머니', say: '솔직하게 말해 줘서 고맙구나.', feel: '**배려심**이 많아요', how: '너그럽게 · 공감하며' }] }
  },
  u5_l07: {
    s05: { k: 'tools', items: [{ emoji: '💌', name: '말로 하기 어려운 마음도' }, { emoji: '📮', name: '함께 있지 않아도' }, { emoji: '🔁', name: '두고두고 읽어요' }] },
    s06: { k: 'letter', parts: ['받는 사람', '상황', '마음', '쓴 사람'] },
    s07: { k: 'letter', to: '할머니께', lines: [{ t: '오늘 화분을 깨뜨려서 정말 죄송했어요.', tag: '상황' }, { t: '너그럽게 이해해 주셔서 고맙습니다.', tag: '마음' }], from: '민서 올림' },
    s13: { k: 'sort2', a: { name: '👦 친구에게', items: ['고마워!'] }, b: { name: '👵 웃어른께', items: ['고맙**습니다**.'], hint: '높임 표현' } },
    s14: { k: 'letter', to: '할머니**께**', lines: ['화분을 잘 키울게**요**.', '고맙**습니다**.'], from: '민서 **올림**' }
  },
  u5_l09: {
    s05: { k: 'note', title: '마음 전하는 글 계획', items: ['받는 사람은 누구인가', { t: '전하고 싶은 마음', star: true }, '어떤 상황에서', '어떤 말로'] },
    s06: { k: 'sort2', a: { name: '○ 마음을 나타내는 말', items: ['고마운 마음', '응원하는 마음', '걱정스러운 마음'] }, b: { name: '✗ 아니에요', items: ['동그라미', '빨간색'] } },
    s07: { k: 'para', mainTag: '상황', subTag: '마음', pairs: [['늘 응원해 주시는 부모님', '감사한 마음'], ['대회 연습을 열심히 하는 친구', '응원하는 마음'], ['편찮으신 할머니', '걱정스러운 마음']] },
    s13: { k: 'mood', items: [{ who: '👪', name: '부모님', feel: '**감사한** 마음' }, { who: '👦', name: '친구', feel: '**응원하는** 마음' }, { who: '👵', name: '할머니', feel: '**걱정스러운** 마음' }] },
    s14: { k: 'sort2', a: { name: '밋밋해요', items: ['고마워. 고마워. 고마워.'] }, b: { name: '진심이 전해져요', items: ['덕분에 용기가 났어.', '정말 든든했어.'] } },
    s15: { k: 'sort2', a: { name: '흐릿하게', items: ['그때 고마웠어.'] }, b: { name: '구체적으로', items: ['**어제 운동장에서** 넘어졌을 때 일으켜 줘서 고마웠어.'], hint: '언제 · 어디서 · 무슨 일' } },
    s25: { k: 'chain', items: [{ emoji: '📋', name: '계획표' }, { emoji: '✍️', name: '한 편의 글로' }, { emoji: '🙇', name: '높임 표현 확인' }] },
    s26: { k: 'note', title: '쓴 글 점검', items: ['받는 사람과 쓴 사람', '상황을 구체적으로', { t: '마음이 잘 드러나게', star: true }] }
  },
  u5_l12: {
    s05: { k: 'tools', items: [{ emoji: '💭', name: '읽을 사람의 마음 헤아리기' }, { emoji: '📌', name: '구체적으로' }, { emoji: '💖', name: '진심을 담아' }] },
    s06: { k: 'mood', items: [{ who: '🐶', name: '콩이' }, { who: '🦝', name: '도리' }, { who: '👧', name: '민서' }] },
    s07: { k: 'letter', to: '콩이에게', lines: ['끝까지 포기하지 않은 모습이 멋졌어.', '나도 너처럼 끈기 있게 해 볼게.', '응원할게!'], from: '○○가' },
    s13: { k: 'tools', items: [{ emoji: '👪', name: '가족' }, { emoji: '🧑‍🤝‍🧑', name: '친구' }, { emoji: '🧑‍🏫', name: '선생님' }] },
    s14: { k: 'chain', items: [{ emoji: '📦', name: '상자 꾸미기' }, { emoji: '📮', name: '학급 우체통' }, { emoji: '✉️', name: '편지 주고받기' }] }
  },
  u5_l14: {
    s05: { k: 'letter', parts: ['받는 사람', '상황', '마음', '쓴 사람'] },
    s06: { k: 'tools', items: [{ emoji: '🏷️', name: '수식하는 말' }, { emoji: '🗣️', name: '말과 행동' }, { emoji: '🖼️', name: '표정·몸짓' }] },
    s07: { k: 'sound', rule: '**-ㄹ게** — 소리는 [께], 글로는 **게**', ox: true, pairs: [['갈게', '갈께'], ['할게', '할께'], ['지킬게', '지킬께']] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_korean_u5.js'), F);
