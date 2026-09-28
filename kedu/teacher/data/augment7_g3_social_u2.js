/* augment7_g3_social_u2.js — 2세대 26차 「개념 그림 층」 3학년 사회 2단원 「일상에서 만나는 과거」 개념 장 54장.
   부품 = tline(과거·현재·미래 세 구역 / 연표 띠: 왼쪽 → 오른쪽 = 나중) · then(옛날 ↔ 오늘 짝 · 두 거리 그림) · groups(보고·읽고·듣고 아는 길) · link(물건 → 쓰임 · 땅 이름 → 뜻)
          · exhibit(전시관 진열대·명패) · tools·chain(조사 방법·만드는 걸음) · mood(증언·면담).
   ⚠️ 그림 글자에 「 — 」 을 쓰지 않는다. 실행: node kedu/teacher/data/augment7_g3_social_u2.js */
'use strict';
const P = (name, emoji) => ({ name, emoji });
const GROW = [{ emoji: '👶', what: '태어남', when: '0살', era: 'past' }, { emoji: '🚶', what: '걸음마', when: '1살', era: 'past' }, { emoji: '🎒', what: '입학', when: '8살', era: 'past' }, { emoji: '🧒', what: '3학년', when: '10살', era: 'now' }];
const F = {
  u2_l01: {
    s05: { k: 'tline', zones: [{ era: 'past', on: true, note: '이미 지나간 때', words: ['어제', '작년', '옛날'] }, { era: 'now', words: [] }, { era: 'future', words: [] }] },
    s06: { k: 'tline', zones: [{ era: 'past', words: ['어제', '작년', '옛날'] }, { era: 'now', on: true, note: '지금 살아가는 바로 이때', words: ['오늘', '지금'] }, { era: 'future', words: [] }] },
    s07: { k: 'tline', zones: [{ era: 'past', words: ['어제', '작년', '옛날'] }, { era: 'now', words: ['오늘', '지금'] }, { era: 'future', words: ['내일', '앞으로'] }], arrow: '한 방향으로만 흘러요' }
  },
  u2_l02: {
    s05: { k: 'tools', items: [{ emoji: '👶', name: '태어난 날' }, { emoji: '🚶', name: '걸음마를 한 날' }, { emoji: '🎒', name: '입학한 날' }, { emoji: '📔', name: '사진·앨범' }] },
    s06: { k: 'tline', items: GROW.slice(0, 3), arrow: '먼저 → 나중' },
    s07: { k: 'then', heads: ['과거의 나', '지금의 나'], rows: [{ old: { emoji: '👶', name: '작은 키', note: '누워 있었어요' }, now: { emoji: '🧒', name: '자란 키', note: '뛰어놀아요' } }, { old: { emoji: '🍼', name: '우유만 먹었어요' }, now: { emoji: '🍚', name: '밥을 스스로 먹어요' } }], note: '시간이 흐르며 생긴 달라짐 = **변화**' }
  },
  u2_l03: {
    s05: { k: 'tools', items: [{ emoji: '📷', name: '사진' }, { emoji: '👵', name: '어른의 이야기' }, { emoji: '📜', name: '학교의 기록' }] },
    s06: { k: 'tools', items: [{ emoji: '📷', name: '① 사진 보기', kind: '그때 모습' }, { emoji: '🎤', name: '② 어른께 여쭤보기', kind: '면담' }, { emoji: '💻', name: '③ 누리집 살펴보기', kind: '기록 찾기' }] },
    s07: { k: 'then', heads: ['옛 학교', '지금 학교'], rows: [{ old: { emoji: '🏚️', name: '낮은 나무 건물' }, now: { emoji: '🏫', name: '높은 새 건물' } }, { old: { emoji: '🟫', name: '흙 운동장' }, now: { emoji: '🟩', name: '잔디 운동장' } }, { old: { emoji: '👥', name: '학생 수' }, now: { emoji: '👤', name: '학생 수가 달라졌어요' } }] }
  },
  u2_l04: {
    s05: { k: 'tline', items: GROW, arrow: '오른쪽으로 갈수록 나중 일' },
    s06: { k: 'tline', items: [{ emoji: '👶', what: '있었던 일', when: '때' }, { emoji: '🚶', what: '걸음마', when: '1살' }, { emoji: '🎒', what: '입학', when: '8살' }], note: '**언제**(때) + **무슨 일** = 연표 한 칸' },
    s07: { k: 'chain', items: [{ emoji: '💭', name: '① 있었던 일 떠올리기' }, { emoji: '🔢', name: '② 시간 순서 정하기' }, { emoji: '📏', name: '③ 긴 띠 위에 적기' }] }
  },
  u2_l05: {
    s05: { k: 'chain', items: [{ emoji: '📦', name: '1단계 자료 모으기' }, { emoji: '🔢', name: '2단계 순서 정하기' }, { emoji: '📏', name: '3단계 띠에 적기' }, { emoji: '🖍️', name: '4단계 꾸미기' }] },
    s06: { k: 'panels', items: [{ label: '1단계 · 자료 모으기', fig: { k: 'tools', items: [{ emoji: '📷', name: '사진' }, { emoji: '🧸', name: '물건' }] } }, { label: '2단계 · 순서 정하기', fig: { k: 'tline', items: [{ emoji: '👶', what: '태어남' }, { emoji: '🚶', what: '걸음마' }, { emoji: '🎒', what: '입학' }], arrow: '먼저 → 나중' } }] },
    s07: { k: 'tline', items: [{ emoji: '👶', what: '태어남', when: '0살' }, { emoji: '🚶', what: '걸음마', when: '1살' }, { emoji: '🎒', what: '입학', when: '8살' }, { emoji: '🏆', what: '줄넘기 대회', when: '9살', on: true }], note: '그림·짧은 설명을 더하면 한눈에 보여요' }
  },
  u2_l06: {
    s05: { k: 'tline', zones: [{ era: 'past', words: ['어제'] }, { era: 'now', words: ['오늘'] }, { era: 'future', words: ['내일'] }], arrow: '한 방향으로 흘러요' },
    s06: { k: 'tools', items: [{ emoji: '📷', name: '사진' }, { emoji: '🎤', name: '면담' }, { emoji: '💻', name: '누리집' }] },
    s07: { k: 'panels', items: [{ label: '연표로 정리', fig: { k: 'tline', items: [{ emoji: '👶', what: '태어남' }, { emoji: '🎒', what: '입학' }, { emoji: '🧒', what: '3학년', era: 'now' }], arrow: '차례와 변화' } }, { label: '타임캡슐', fig: { k: 'tools', items: [{ emoji: '📦', name: '오늘의 물건과 글', kind: '먼 뒷날에 열어요' }] } }] }
  },
  u2_l07: {
    s05: { k: 'tools', items: [{ emoji: '🖼️', name: '옛 사진', kind: '단서' }, { emoji: '🏯', name: '옛 건축물', kind: '단서' }, { emoji: '🏺', name: '오래된 물건', kind: '단서' }] },
    s06: { k: 'then', scene: true, old: '한옥 · 좁은 흙길', now: '높은 건물 · 넓은 길' },
    s07: { k: 'groups', bins: [{ name: '보고 아는 길', emoji: '👀', tone: 't0', items: [P('옛 사진', '🖼️'), P('옛 건축물', '🏯'), P('오래된 물건', '🏺')], hint: '눈으로 보아 알아요' }] }
  },
  u2_l08: {
    s05: { k: 'mood', items: [{ who: '🐻', name: '곰이', say: '이건 **무엇을 하던** 물건일까?', how: '가장 먼저 쓰임을 물어요' }, { who: '🐧', name: '펭이', say: '곡식을 갈던 물건 같아!', feel: '그때 생활이 떠올라요' }] },
    s06: { k: 'link', ha: '옛 물건', hb: '쓰임', same: true, rows: [[P('맷돌', '🪨'), '곡식을 갈아요'], [P('다듬이', '🪵'), '옷의 구김을 펴요'], [P('가마솥', '🍲'), '밥을 지어요'], [P('재봉틀', '🧵'), '옷을 지어요']] },
    s07: { k: 'then', heads: ['옛 물건', '오늘날 물건'], rows: [{ old: { emoji: '🪨', name: '맷돌' }, now: { emoji: '🥤', name: '믹서기' } }, { old: { emoji: '🪵', name: '다듬이' }, now: { emoji: '👔', name: '전기다리미' } }], note: '같은 일을 **더 편하게**' }
  },
  u2_l09: {
    s05: { k: 'tools', items: [{ emoji: '📰', name: '옛 신문' }, { emoji: '📖', name: '잡지' }, { emoji: '🪧', name: '포스터' }] },
    s06: { k: 'mood', items: [{ who: '🧒', name: '나', say: '어릴 때 어떻게 지내셨어요?' }, { who: '👵', name: '할머니', say: '냇가에서 빨래를 했단다.', feel: '생생한 옛이야기' }] },
    s07: { k: 'groups', bins: [{ name: '읽고 아는 길', emoji: '📖', tone: 't1', items: [P('옛 신문', '📰'), P('옛 기록', '📜')] }, { name: '듣고 아는 길', emoji: '👂', tone: 't2', items: [P('어른 증언', '👵')] }] }
  },
  u2_l10: {
    s05: { k: 'tools', items: [{ emoji: '🖼️', name: '옛 사진' }, { emoji: '📰', name: '옛 신문', on: true }, { emoji: '🏺', name: '옛 물건' }] },
    s06: { k: 'tools', items: [{ emoji: '👘', name: '옷차림' }, { emoji: '🏺', name: '물건' }, { emoji: '🛣️', name: '거리 모습' }, { emoji: '🔤', name: '글자' }] },
    s07: { k: 'chain', items: [{ emoji: '✍️', name: '③ 한 줄로 정리' }, { emoji: '🗣️', name: '④ 친구와 나누기' }, { emoji: '🏛️', name: '전시관으로' }] }
  },
  u2_l11: {
    s05: { k: 'tools', items: [{ emoji: '👘', name: '옛날 옷' }, { emoji: '🍲', name: '옛날 부엌', on: true }, { emoji: '🏫', name: '옛날 학교' }] },
    s06: { k: 'exhibit', title: '옛날 부엌', label: true, items: [{ emoji: '🪨', name: '맷돌', use: '곡식을 갈아요' }, { emoji: '🍲', name: '가마솥', use: '밥을 지어요' }] },
    s07: { k: 'mood', items: [{ who: '👧', name: '소개하는 친구', say: '맷돌로 곡식을 갈았대요!', how: '알 수 있는 것도 함께' }, { who: '👦', name: '보는 친구', say: '명패가 있어서 알기 쉬워!', feel: '쉽게 알아요' }] }
  },
  u2_l12: {
    s05: { k: 'tools', items: [{ emoji: '🖼️', name: '사진' }, { emoji: '🏯', name: '건축물' }, { emoji: '🏺', name: '물건' }, { emoji: '📰', name: '자료' }, { emoji: '👵', name: '증언' }] },
    s06: { k: 'chain', items: [{ emoji: '☝️', name: '고르기' }, { emoji: '🔍', name: '자세히 보기' }, { emoji: '✍️', name: '정리하기' }, { emoji: '🗣️', name: '나누기' }] },
    s07: { k: 'tline', items: [{ emoji: '📷', what: '오늘의 사진·물건·기록', era: 'now' }, { emoji: '🗃️', what: '과거를 알려 주는 자료', era: 'future', when: '먼 훗날', on: true }], arrow: '오늘도 뒷날엔 과거' }
  },
  u2_l13: {
    s05: { k: 'then', scene: true, heads: ['우리 지역 옛날', '우리 지역 오늘'], old: '낮은 집 · 좁은 길', now: '높은 건물 · 넓은 길' },
    s06: { k: 'tools', items: [{ emoji: '🗺️', name: '옛 사진과 지도' }, { emoji: '📰', name: '옛 신문과 기록' }, { emoji: '👵', name: '옛이야기와 증언' }, { emoji: '🎞️', name: '영상 자료' }] },
    s07: { k: 'groups', bins: [{ name: '보고 아는 길', emoji: '👀', tone: 't0', items: [P('영상', '🎞️'), P('옛 사진', '🖼️')] }, { name: '듣고 아는 길', emoji: '👂', tone: 't2', items: [P('옛이야기', '👵')] }] }
  },
  u2_l14: {
    s05: { k: 'mood', items: [{ who: '👴', name: '할아버지', say: '옛날 옛적에 이 마을에는…', how: '입에서 입으로' }, { who: '🧒', name: '아이', say: '그다음엔요?', feel: '생활 모습과 바람이 담겨요' }] },
    s06: { k: 'link', ha: '땅 이름', hb: '담긴 옛 모습', same: true, rows: [[P('밤골', '🌰'), '밤나무가 많던 곳'], [P('말죽거리', '🐴'), '말에게 죽을 먹이던 곳'], [P('배다리', '⛵'), '배를 이어 다리를 놓던 곳']] },
    s07: { k: 'tools', items: [{ emoji: '👵', name: '어른께 여쭤보기' }, { emoji: '📚', name: '도서관 책' }, { emoji: '💻', name: '지역 누리집' }, { emoji: '📝', name: '적어 두기', on: true }] }
  },
  u2_l15: {
    s05: { k: 'groups', bins: [{ name: '사진', emoji: '🖼️', tone: 't0', items: ['눈으로 모습을'] }, { name: '신문·기록', emoji: '📰', tone: 't1', items: ['글로 소식을'] }, { name: '영상', emoji: '🎞️', tone: 't3', items: ['움직임과 소리로'] }] },
    s06: { k: 'groups', bins: [{ name: '사진', emoji: '🖼️', tone: 't0', items: [P('모습이 보여요', '○'), { name: '소식은 없어요', x: true }] }, { name: '글', emoji: '📰', tone: 't1', items: [P('소식을 알려 줘요', '○'), { name: '모습은 없어요', x: true }] }], },
    s07: { k: 'chain', items: [{ emoji: '🔍', name: '자세히 보기' }, { emoji: '⚖️', name: '비교하기' }, { emoji: '📝', name: '보고서로 적기', on: true }] }
  },
  u2_l16: {
    s05: { k: 'groups', bins: [{ name: '무엇을', emoji: '🎯', tone: 't0', items: [P('집', '🏠'), P('옷', '👘'), P('하는 일', '🧑‍🌾'), P('놀이', '🪁')] }, { name: '어떻게', emoji: '🔎', tone: 't1', items: [P('사진', '🖼️'), P('기록', '📜'), P('영상', '🎞️'), P('어른 증언', '👵')] }] },
    s06: { k: 'then', rows: [{ old: { emoji: '🏚️', name: '낮은 집' }, now: { emoji: '🏢', name: '높은 건물' } }, { old: { emoji: '🛤️', name: '좁은 흙길' }, now: { emoji: '🛣️', name: '넓은 길' } }, { old: { emoji: '⛰️', name: '뒷산' }, now: { emoji: '⛰️', name: '뒷산', note: '그대로예요' } }] },
    s07: { k: 'mood', items: [{ who: '👧', name: '작은 문화 해설사', say: '우리 지역의 옛 모습을 알려 드릴게요!', how: '알기 쉽게' }] }
  },
  u2_l17: {
    s05: { k: 'then', heads: ['옛 사진', '오늘 사진'], rows: [{ old: { emoji: '🛤️', name: '옛 거리' }, now: { emoji: '🛣️', name: '오늘 거리' } }], note: '**견줄 수 있는 짝**이 가장 좋아요' },
    s06: { k: 'tline', items: [{ emoji: '🏚️', what: '옛 거리', era: 'past', when: '옛날' }, { emoji: '🏗️', what: '길을 넓혔어요', era: 'past' }, { emoji: '🏢', what: '오늘 거리', era: 'now', when: '오늘' }], arrow: '옛날 → 오늘' },
    s07: { k: 'then', scene: true, old: '자막: 옛날엔 좁은 흙길이었어요', now: '자막: 지금은 넓은 길이 되었어요' }
  },
  u2_l18: {
    s05: { k: 'tline', zones: [{ era: 'past', words: ['어제'] }, { era: 'now', words: ['오늘'] }, { era: 'future', words: ['내일'] }], arrow: '한 방향 · 차례대로 적으면 연표' },
    s06: { k: 'tools', items: [{ emoji: '🖼️', name: '사진' }, { emoji: '🏯', name: '건축물' }, { emoji: '🏺', name: '물건' }, { emoji: '📰', name: '자료' }, { emoji: '👵', name: '증언' }] },
    s07: { k: 'chain', items: [{ emoji: '🏚️', name: '옛날' }, { emoji: '⚖️', name: '견주기' }, { emoji: '🏢', name: '오늘' }, { emoji: '🎉', name: '지역 축제', on: true }] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_social_u2.js'), F);
