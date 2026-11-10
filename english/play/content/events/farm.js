/* ============================================================
 * 영어 놀이터 — 사건 표 : 동물 농장 무대 (Lv1 · 게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다. 영어 한마디는 Lv1 에서 배운 낱말·감탄만. 적힌 차례 = 처음 만나는 차례(첫날은 너구리 침입).
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['animal-farm'] = [
  { id: 'raccoon', name: '너구리 침입', icon: 'paw', game: 'raccoon', who: 'ben', cls: 'ev-raccoon',
    intro: { en: 'Oh!', ko: '너구리가 몰래 들어와 무언가를 덤불에 숨겼어!' },
    outro: { en: 'I see it!', ko: '다 찾았다! 너구리가 머쓱해해.' } },
  { id: 'visitors', name: '동물 손님', icon: 'order', game: 'order-shop', who: 'mina', cls: 'ev-visitors',
    intro: { en: 'Hi!', ko: '동물 친구들이 줄을 섰어 — 이름을 불러 줘!' },
    outro: { en: 'I like it!', ko: '동물들이 기분 좋게 돌아갔어.' } },
  { id: 'story', name: '그림책 시간', icon: 'book', game: 'picture-book', who: 'amy', cls: 'ev-story',
    intro: { en: 'Oh!', ko: '헛간에서 그림책을 펼쳤어 — 읽으면 그림이 나타나!' },
    outro: { en: 'I like it!', ko: '그림책을 끝까지 넘겼어!' } },
  { id: 'hide', name: '숨바꼭질', icon: 'ear', game: 'pop', who: 'ben', cls: 'ev-hide',
    intro: { en: 'Listen!', ko: '동물들이 구멍에서 톡톡 — 들린 이름을 눌러 줘!' },
    outro: { en: 'I see it!', ko: '모두 찾았어!' } },
  { id: 'feed', name: '먹이 주는 날', icon: 'box', game: 'belt', who: 'sam', cls: 'ev-feed',
    intro: { en: 'Oh!', ko: '벨트로 이름표가 와 — 맞는 그림을 올려 줘!' },
    outro: { en: 'I like it!', ko: '모두 배불러졌어!' } }
];
