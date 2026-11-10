/* ============================================================
 * 영어 놀이터 — 사건 표 : 우리 집 입구 (Lv1 첫 두 칸 · 게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다. 영어 한마디는 Lv1 #1 사이트워드(I·you·like·a·the·see·it)와 감탄만.
 *   나머지 우리 집 사건(가족·색·수 — 내 방 꾸미기)은 W10.
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['lv1-gate'] = [
  { id: 'cards', name: '단어 카드 손님', icon: 'cards', game: 'order-shop', who: 'mina', cls: 'ev-cards',
    intro: { en: 'Hi!', ko: '손님들이 단어 그림을 들고 왔어 — 말로 받아 줘!' },
    outro: { en: 'I like it!', ko: '손님들이 웃으며 돌아갔어.' } },
  { id: 'friend', name: '친구가 왔어요', icon: 'door', game: 'talk', who: 'ben', cls: 'ev-friend',
    intro: { en: 'Hi!', ko: '똑똑! 친구가 놀러 왔어.' },
    outro: { en: 'I like you!', ko: '친구가 또 오겠대.' } },
  { id: 'echo', name: '메아리', icon: 'ear', game: 'pop', who: 'amy', cls: 'ev-echo',
    intro: { en: 'Listen!', ko: '방 안에 메아리가 울려 — 들린 것을 톡톡 눌러 줘!' },
    outro: { en: 'I see it!', ko: '메아리를 다 찾았어!' } }
];
