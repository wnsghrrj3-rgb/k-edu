/* ============================================================
 * 영어 놀이터 — 사건 표 : 점심 가게 무대 (게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다 — game = 그날 그 사건이 입히는 놀이(이미 있는 놀이를 그대로 씀).
 *   who = 등장인물 · cls = 배경(play.css 의 .ev-*) · opt = 놀이에 넘기는 작은 바꿈(손님 수 등).
 *   Sam 의 영어 한마디는 짧게, 뜻은 아래 줄(우리말)로 — 아이가 따라 말해야 하는 재료는 여기에 없다(재료는 구역 단어뿐).
 *   적힌 차례 = 처음 만나는 차례(첫날은 엉뚱한 주문).
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['lunch-shop'] = [
  { id: 'silly', name: '엉뚱한 주문', icon: 'mask', game: 'silly-order', who: 'ben', cls: 'ev-silly',
    intro: { en: 'Oh! Ben!', ko: '장난꾸러기 Ben 이 왔어 — 잘 듣고 골라 줘!' },
    outro: { en: 'Ha ha!', ko: '하하, 재미있는 주문이었어!' } },
  { id: 'raccoon', name: '너구리 침입', icon: 'paw', game: 'pop', who: 'max', cls: 'ev-raccoon',
    intro: { en: 'Oh no!', ko: '너구리가 음식을 숨겼어 — 톡톡 올라올 때 들린 것을 잡아!' },
    outro: { en: 'Good!', ko: '다 찾았다! 너구리도 배가 고팠나 봐.' } },
  { id: 'group', name: '단체 손님', icon: 'party', game: 'order-shop', who: 'amy', cls: 'ev-group',
    intro: { en: 'Big lunch!', ko: '손님이 한꺼번에 왔어 — 차례로 주문을 받아 줘!' },
    outro: { en: 'Yum!', ko: '모두 맛있게 먹었대!' },
    opt: { guests: ['mina', 'ben', 'amy', 'max'] } },
  { id: 'rain', name: '비 오는 날', icon: 'umbrella', game: 'belt', who: 'mina', cls: 'ev-rain',
    intro: { en: 'Lunch! Lunch!', ko: '비가 와서 배달 주문이 밀려와 — 주문표에 음식을 올려 줘!' },
    outro: { en: 'Good!', ko: '배달 끝! 비 오는 날에도 든든해.' } },
  { id: 'newmenu', name: '새 메뉴', icon: 'menu', game: 'plates', who: 'sam', cls: 'ev-menu',
    intro: { en: 'My lunch!', ko: '새 메뉴판을 만들자 — 글자 자리에 음식을 올려 줘!' },
    outro: { en: 'I like it!', ko: '멋진 메뉴판이 됐어!' } }
];
