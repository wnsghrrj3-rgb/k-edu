/* augment7_g3_korean_u4.js — 2세대 25차 「개념 그림 층」 3학년 국어 4단원 「중요한 내용을 찾아요」 개념 장 34장.
   부품 = note(메모지 — 제목·번호·⭐) · text(설명·이야기 글 판) · para(중심·뒷받침) · mood(설명하는 사람·인물 마음, flow 마음 변화) · sound pairs(띄어쓰기 두 뜻) · tools/chain.
   실행: node kedu/teacher/data/augment7_g3_korean_u4.js */
'use strict';
const F = {
  u4_l01: {
    s05: { k: 'note', title: '친구와 한 약속', items: ['토요일 2시', '놀이터 앞', { t: '줄넘기 가져가기', star: true }] },
    s06: { k: 'tools', items: [{ emoji: '🧠', name: '오래 기억해요' }, { emoji: '🔁', name: '다시 볼 수 있어요' }, { emoji: '✅', name: '할 일을 잊지 않아요' }] },
    s07: { k: 'chain', items: [{ emoji: '👂', name: '① 듣고 보며 중요한 내용' }, { emoji: '📖', name: '② 읽고 중심 내용 간추리기' }, { emoji: '🧱', name: '③ 기초 다지기' }] }
  },
  u4_l02: {
    s05: { k: 'tools', items: [{ emoji: '🎯', name: '듣는 목적' }, { emoji: '💭', name: '아는 내용' }, { emoji: '📢', name: '강조하는 내용' }] },
    s06: { k: 'text', title: '무당벌레', lines: ['무당벌레는 진딧물을 잡아먹어 식물을 지켜요.', '등에 있는 점의 개수로 종류를 구별해요.', '위험하면 다리를 오므리고 죽은 척해요.'] },
    s07: { k: 'mood', items: [{ who: '🐻', name: '설명하는 사람', say: '진딧물을 **잡아먹어요**! **잡아먹어요**!', how: '목소리를 높이거나 천천히 · 한 번 더' }, { who: '👧', name: '듣는 사람', feel: '여기가 **중요한 내용**!' }] },
    s13: { k: 'tools', items: [{ emoji: '🏷️', name: '제목으로 묶기' }, { emoji: '🔢', name: '숫자로 차례' }, { emoji: '⭐', name: '기호로 표시' }] },
    s14: { k: 'note', title: '무당벌레가 하는 일', items: [{ t: '진딧물을 잡아먹어 식물을 지킴', star: true }, '점의 개수로 종류를 구별함'] }
  },
  u4_l04: {
    s05: { k: 'tools', items: [{ emoji: '🔊', name: '소리' }, { emoji: '🔤', name: '화면의 글' }, { emoji: '🖼️', name: '그림·장면' }] },
    s06: { k: 'text', title: '지구의 날', lines: ['지구의 날은 4월 22일이에요.', '환경을 생각하고 지구를 지키자는 날이에요.', '이날에는 불을 끄고 쓰레기를 줍는 행사를 해요.'] },
    s07: { k: 'sound', rule: '**셋을 함께** 봐야 잘 보여요', items: [{ w: '🔊 소리', s: '설명' }, { w: '🔤 글', s: '중요한 말' }, { w: '🖼️ 그림', s: '모습' }] },
    s13: { k: 'tools', items: [{ emoji: '🔊', name: '소리', kind: '설명을 들려줘요' }, { emoji: '🔤', name: '글', kind: '중요한 말을 보여줘요' }, { emoji: '🖼️', name: '그림·장면', kind: '실제 모습을 보여줘요' }] },
    s14: { k: 'note', title: '지구의 날', items: [{ t: '4월 22일', star: true }, '지구를 지키자는 날', '불 끄기 · 쓰레기 줍기'] }
  },
  u4_l06: {
    s05: { k: 'para', main: '문단을 **대표하는** 문장', subs: ['덧붙여 **설명하는** 문장', '**예를 드는** 문장'] },
    s06: { k: 'para', indent: true, main: '먼저, 바닷물을 넓은 염전에 가두어요.', subs: ['염전은 바닷가에 만든 얕은 밭이에요.', '바닷물을 얕게 가두면 햇볕을 잘 받아요.'] },
    s07: { k: 'tools', items: [{ emoji: '⬆️', name: '앞에' }, { emoji: '↕️', name: '가운데' }, { emoji: '⬇️', name: '끝에' }] },
    s13: { k: 'chain', items: [{ emoji: '🤔', name: '모르는 낱말' }, { emoji: '👀', name: '앞뒤 문장 보기' }, { emoji: '💡', name: '뜻 짐작하기' }] },
    s14: { k: 'tools', items: [{ emoji: '🧂', name: '염전', kind: '소금을 얻는 밭' }, { emoji: '💧', name: '물기', kind: '젖어 있는 물의 기운' }, { emoji: '⚪', name: '알갱이', kind: '작고 동그란 덩이' }] }
  },
  u4_l08: {
    s05: { k: 'tools', items: [{ emoji: '⏰', name: '시간 차례' }, { emoji: '📍', name: '장소' }, { emoji: '💓', name: '마음 변화' }] },
    s06: { k: 'text', title: '처음에 일어난 일', lines: ['지우는 학교에서 방울토마토 모종을 받았어요.', '베란다에 심고 날마다 물을 주었어요.', '빨간 토마토가 열릴 생각에 마음이 설렜어요.'] },
    s07: { k: 'chain', items: [{ emoji: '🏫', name: '학교 — 모종을 받아요' }, { emoji: '🪴', name: '베란다 — 심어요' }] },
    s13: { k: 'mood', items: [{ who: '😟', name: '지우', say: '내 토마토가 왜 이러지?', feel: '속상한 마음', how: '울상이 되었어요' }] },
    s14: { k: 'mood', flow: [{ who: '😊', name: '설렘', note: '처음' }, { who: '😟', name: '속상함', note: '그다음' }] },
    s15: { k: 'note', title: '일어난 일 차례', items: ['모종을 받아 심고 물을 줌 → **설렘**', '잎이 시들어 버림 → **속상함**', '토마토가 빨갛게 익음 → **기쁨·고마움**'] },
    s25: { k: 'mood', items: [{ who: '👴', name: '할아버지', say: '햇볕과 바람도 함께 길러 준단다.' }, { who: '😀', name: '지우', feel: '기쁘고 고마운 마음', how: '볕 드는 곳에 화분을 옮겨요' }] },
    s26: { k: 'mood', flow: [{ who: '😊', name: '설렘' }, { who: '😟', name: '속상함' }, { who: '😀', name: '기쁨·고마움', note: '**고마움**이 새로' }] }
  },
  u4_l11: {
    s05: { k: 'chain', items: [{ emoji: '🎬', name: '차례가 뼈대' }, { emoji: '🔢', name: '숫자로 나누어' }, { emoji: '📝', name: '메모' }] },
    s06: { k: 'note', title: '종이비행기 접기', items: ['반으로 접어 가운데 선 만들기', '양쪽 모서리를 가운데 선에 맞추어 접기', { t: '날개를 반듯하게 접기', star: true }] },
    s07: { k: 'mood', items: [{ who: '🐻', name: '설명하는 사람', say: '날개를 **반듯하게**!', how: '힘주어 말해요' }, { who: '👦', name: '메모하는 나', feel: '여기에 ⭐' }] },
    s13: { k: 'note', title: '바른 자세', items: ['등을 곧게 펴고 앉기', '두 발을 바닥에 나란히', '책은 눈에서 알맞게'] },
    s14: { k: 'tools', items: [{ emoji: '🧍', name: '등을 곧게', kind: '허리가 아프지 않아요' }, { emoji: '🦶', name: '두 발을 바닥에', kind: '몸이 안정돼요' }, { emoji: '📖', name: '책을 알맞게', kind: '눈이 편해요' }] }
  },
  u4_l13: {
    s05: { k: 'tools', items: [{ emoji: '📝', name: '설명·영상', kind: '중요한 내용만 메모' }, { emoji: '📄', name: '설명하는 글', kind: '중심 문장 찾기' }, { emoji: '📚', name: '이야기', kind: '일어난 일 차례로' }] },
    s06: { k: 'sound', rule: '**띄어쓰기**에 따라 뜻이 달라져요', pairs: [['아이가 오리를', '아이 가오리를'], ['아빠가 방에', '아빠 가방에'], ['오늘 밤나무를 심자', '오늘 밤 나무를 심자']] },
    s07: { k: 'sound', pairs: [['나물 좀 줘', '나 물 좀 줘'], ['손수건으로 닦아', '손 수건으로 닦아'], ['나무 그늘', '나 무그늘']] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_korean_u4.js'), F);
