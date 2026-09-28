/* augment7_g3_social_u1.js — 2세대 26차 「개념 그림 층」 3학년 사회 1단원 「우리가 사는 곳」 개념 장 39장.
   부품 = places·tools(장소 카드) · groups(두~네 갈래 통: 장소/아닌 것 · 자연/사람 · 하는 일 무리 · 살기 좋은 조건) · pcard(장소 카드·그림일기) · news(마을 신문) · post(공유 앱 화면)
          · link(장소 → 도움 · 문제 → 방안) · map(마을 지도: 검색·찾은 곳·확대/축소·길찾기·디지털 영상 지도) · mood(곰이·펭이 마음) · chain(흐름).
   ⚠️ 그림 글자에 「 — 」 을 쓰지 않는다(게이트 검산기가 「○ — ○」 선언을 잰다). 실행: node kedu/teacher/data/augment7_g3_social_u1.js */
'use strict';
const P = (name, emoji) => ({ name, emoji });
const MAP6 = ['학교', '도서관', '병원', '시장', '소방서', '우체국'];
const F = {
  u1_l01: {
    s04: { k: 'places', items: [P('산', '⛰️'), P('강', '🏞️'), P('시장', '🧺'), P('학교', '🏫')] },
    s05: { k: 'mood', items: [{ who: '🐻', name: '곰이', say: '여기에 **갈 수 있니?**', how: '장소를 가려내는 한 물음' }, { who: '🐧', name: '펭이', say: '응! 학교에 갈 수 있어!', feel: '장소예요' }] },
    s06: { k: 'groups', bins: [{ name: '○ 장소예요', emoji: '📍', tone: 'man', items: [P('학교', '🏫'), P('시장', '🧺'), P('산', '⛰️'), P('강', '🏞️')], hint: '갈 수 있어요' }, { name: '✗ 장소가 아니에요', tone: 'x', items: [P('기쁨', '😊'), P('어제', '📅'), P('빠르다', '💨')], hint: '갈 수 없어요' }] },
    s07: { k: 'groups', bins: [{ name: '자연이 만든 곳', emoji: '🌿', tone: 'nat', items: [P('산', '⛰️'), P('강', '🏞️')] }, { name: '사람들이 만든 곳', emoji: '🏗️', tone: 'man', items: [P('학교', '🏫'), P('시장', '🧺')] }] }
  },
  u1_l02: {
    s05: { k: 'places', items: [P('산', '⛰️'), P('강', '🏞️'), P('학교', '🏫'), P('시장', '🧺'), P('도서관', '📚'), P('놀이터', '🛝')] },
    s06: { k: 'mood', items: [{ who: '🐻', name: '곰이', say: '나는 **색깔**로 나눌래!' }, { who: '🐧', name: '펭이', say: '나는 **크기**로 나눌래!', feel: '약속이 없으면 서로 달라요' }] },
    s07: { k: 'groups', bins: [{ name: '자연이 만든 곳', emoji: '🌿', tone: 'nat', items: [P('산', '⛰️'), P('강', '🏞️')] }, { name: '사람이 만든 곳', emoji: '🏗️', tone: 'man', items: [P('학교', '🏫'), P('시장', '🧺'), P('도서관', '📚'), P('놀이터', '🛝')], hint: '기준: 누가 만들었나요?' }] }
  },
  u1_l03: {
    s05: { k: 'link', ha: '경험(겪은 일)', hb: '느낌(마음)', rows: [[P('놀이터에서 친구를 만났어요', '🛝'), P('즐거움', '😄')], [P('도서관에서 책을 다 읽었어요', '📚'), P('뿌듯함', '😊')], [P('어두운 골목을 지났어요', '🌙'), P('무서움', '😨')]] },
    s06: { k: 'mood', items: [{ who: '🐻', name: '곰이', say: '친구를 만났어!', feel: '즐거웠어요', how: '놀이터' }, { who: '🐧', name: '펭이', say: '넘어졌어…', feel: '무서웠어요', how: '같은 놀이터' }] },
    s07: { k: 'pcard', place: '놀이터', emoji: '🛝', did: '친구와 술래잡기를 했어요', feel: '즐거웠어요', face: '🐻' }
  },
  u1_l04: {
    s05: { k: 'tools', items: [{ emoji: '🎨', name: '그림' }, { emoji: '📰', name: '신문' }, { emoji: '🎵', name: '노래' }, { emoji: '🏘️', name: '모형' }] },
    s06: { k: 'groups', bins: [{ name: '밝은 색', emoji: '☀️', tone: 't1', items: [P('노랑', '🟨'), P('주황', '🟧')], hint: '즐거운 마음' }, { name: '어두운 색', emoji: '🌙', tone: 't3', items: [P('검정', '⬛'), P('짙은 보라', '🟪')], hint: '무서운 마음' }] },
    s07: { k: 'news', tags: true, name: '우리 마을 신문', photo: '📚', title: '새로 생긴 마을 도서관', body: '책이 많고 조용해서 책 읽기 좋아요.', items: ['토요일 책 읽기 모임', '시장 할인 행사'] }
  },
  u1_l05: {
    s05: { k: 'chain', items: [{ emoji: '🎨', name: '그림·신문' }, { emoji: '📸', name: '사진 찍기' }, { emoji: '📲', name: '공유 앱에 올리기' }, { emoji: '👀', name: '많은 친구가 봐요' }] },
    s06: { k: 'post', art: '🎨', title: '우리 동네 놀이터', who: '서아', likes: 5, comments: [{ who: '하준', t: '색이 참 밝아서 즐거워 보여!', ok: true }, { who: '지우', t: '미끄럼틀 그림이 멋져. 가 보고 싶어!', ok: true }] },
    s07: { k: 'post', art: '🖼️', title: '우리 반 마을 신문', who: '하준', likes: 4, comments: [{ who: '서아', t: '소식이 많아서 좋아!', ok: true }, { who: '?', t: '이게 뭐야, 이상해', bad: true }], rules: [{ emoji: '💬', name: '고운 말로 칭찬하기' }, { emoji: '🙋', name: '친구 얼굴 사진은 먼저 물어보기' }, { emoji: '🔒', name: '주소·전화번호는 올리지 않기', x: true }] }
  },
  u1_l06: {
    s05: { k: 'pcard', diary: true, place: '놀이터', emoji: '🛝', did: '친구와 그네를 탔어요', feel: '신났어요', face: '😀' },
    s06: { k: 'chain', items: [{ emoji: '📍', name: '여러 장소' }, { emoji: '🗂️', name: '기준으로 묶기' }, { emoji: '💭', name: '경험과 느낌' }, { emoji: '🤝', name: '서로 존중' }] },
    s07: { k: 'chain', items: [{ emoji: '🎨', name: '그림·마을 신문' }, { emoji: '🙋', name: '소개하기' }, { emoji: '📲', name: '공유 앱·댓글' }, { emoji: '💬', name: '고운 말' }] }
  },
  u1_l07: {
    s05: { k: 'places', items: [P('병원', '🏥'), P('소방서', '🚒'), P('우체국', '📮'), P('경찰서', '👮')] },
    s06: { k: 'link', ha: '장소', hb: '주는 도움', rows: [[P('병원', '🏥'), P('건강', '💊')], [P('소방서', '🚒'), P('안전', '🦺')], [P('경찰서', '👮'), P('안전', '🦺')], [P('우체국', '📮'), P('소식', '✉️')], [P('도서관', '📚'), P('배움', '📖')]] },
    s07: { k: 'tools', items: [{ emoji: '👨‍👩‍👧‍👦', name: '여러 사람이 함께' }, { emoji: '🚶', name: '차례 지키기' }, { emoji: '🤫', name: '조용히 이용하기' }] }
  },
  u1_l08: {
    s05: { k: 'tools', items: [{ emoji: '🦺', name: '안전을 지키는 곳' }, { emoji: '💊', name: '건강을 돌보는 곳' }, { emoji: '📖', name: '배우고 즐기는 곳' }] },
    s06: { k: 'groups', bins: [{ name: '안전을 지키는 곳', emoji: '🦺', tone: 't1', items: [P('소방서', '🚒'), P('경찰서', '👮')] }, { name: '건강을 돌보는 곳', emoji: '💊', tone: 't0', items: [P('병원', '🏥'), P('보건소', '🩺')] }, { name: '배우고 즐기는 곳', emoji: '📖', tone: 't2', items: [P('도서관', '📚'), P('놀이터', '🛝')] }] },
    s07: { k: 'groups', bins: [{ name: '안전', emoji: '🦺', tone: 't1', items: [P('소방서', '🚒'), P('경찰서', '👮')] }, { name: '건강', emoji: '💊', tone: 't0', items: [P('병원', '🏥'), P('보건소', '🩺')] }, { name: '배움·즐거움', emoji: '📖', tone: 't2', items: [P('도서관', '📚'), P('놀이터', '🛝')] }, { name: '새 무리', emoji: '✨', tone: 't3', items: [{ name: '우체국', emoji: '📮', on: true }], hint: '생활을 편리하게' }] }
  },
  u1_l09: {
    s05: { k: 'map', pins: MAP6, sat: true },
    s06: { k: 'map', pins: MAP6, search: '병원', hi: '병원' },
    s07: { k: 'map', pins: MAP6, route: ['학교', '병원'], hi: '병원' }
  },
  u1_l10: {
    s05: { k: 'tools', items: [{ emoji: '🔍', name: '검색' }, { emoji: '➕', name: '확대' }, { emoji: '➖', name: '축소' }, { emoji: '🧭', name: '길찾기' }] },
    s06: { k: 'panels', items: [{ label: '확대: 한 곳을 자세히', fig: { k: 'map', pins: MAP6, hi: '도서관', zoom: 'in' } }, { label: '축소: 동네를 넓게', fig: { k: 'map', pins: MAP6, zoom: 'out' } }] },
    s07: { k: 'map', pins: ['학교', '도서관', '병원', '시장', '우리 집', '우체국'], route: ['우리 집', '병원'], tag: '길찾기: 출발 → 도착' }
  },
  u1_l11: {
    s05: { k: 'tools', items: [{ emoji: '🚦', name: '① 안전' }, { emoji: '🌳', name: '② 환경' }, { emoji: '🏪', name: '③ 편리' }, { emoji: '🤝', name: '④ 어울림' }] },
    s06: { k: 'groups', bins: [{ name: '안전', emoji: '🚦', tone: 't1', items: [P('밝은 가로등', '💡'), P('넓은 횡단보도', '🚸')] }, { name: '환경', emoji: '🌳', tone: 't2', items: [P('깨끗한 공원', '🌳'), P('분리배출', '♻️')] }, { name: '편리', emoji: '🏪', tone: 't0', items: [P('가까운 병원', '🏥')] }, { name: '어울림', emoji: '🤝', tone: 't3', items: [P('서로 돕는 이웃', '🤝')] }] },
    s07: { k: 'groups', bins: [{ name: '○ 좋은 점', emoji: '👍', tone: 'nat', items: [P('공원이 깨끗해요', '🌳')], hint: '먼저 찾아요' }, { name: '△ 고칠 점', emoji: '🔧', tone: 't1', items: [P('밤길이 어두워요', '🌙')], hint: '그다음 찾아요' }] }
  },
  u1_l12: {
    s05: { k: 'chain', items: [{ emoji: '🔎', name: '고칠 점 찾기', on: true }, { emoji: '🤔', name: '무엇이 불편한지' }, { emoji: '💡', name: '알맞은 방안 고르기' }] },
    s06: { k: 'link', ha: '고칠 점', hb: '알맞은 방안', rows: [[P('어두운 길', '🌙'), P('가로등을 세워요', '💡')], [P('쌓인 쓰레기', '🗑️'), P('분리배출을 해요', '♻️')], [P('쉴 곳 없음', '🥵'), P('공원을 만들어요', '🌳')], [P('외로운 이웃', '😔'), P('인사를 나눠요', '👋')]] },
    s07: { k: 'groups', bins: [{ name: '내가 바로', emoji: '🙋', tone: 't0', items: [P('쓰레기 버리지 않기', '🚯'), P('이웃에게 인사하기', '👋')] }, { name: '함께 의논해서', emoji: '👨‍👩‍👧‍👦', tone: 't1', items: [P('가로등 세우기', '💡'), P('공원 만들기', '🌳'), P('어린이 보호구역', '🚸')] }] }
  },
  u1_l13: {
    s05: { k: 'chain', items: [{ emoji: '📍', name: '여러 장소' }, { emoji: '🗂️', name: '기준으로 묶기' }, { emoji: '💭', name: '경험과 느낌 존중' }] },
    s06: { k: 'chain', items: [{ emoji: '🏥', name: '도움 주는 장소' }, { emoji: '🗺️', name: '디지털 영상 지도' }, { emoji: '🔧', name: '고칠 점과 방안' }] },
    s07: { k: 'chain', items: [{ emoji: '👀', name: '① 장소를 알아보는 눈' }, { emoji: '🏘️', name: '② 생활을 돕는 곳·바꿀 길' }, { emoji: '💚', name: '우리가 사는 곳을 알고 아끼기', on: true }] }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_social_u1.js'), F);
