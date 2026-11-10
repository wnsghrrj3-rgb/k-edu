/* ============================================================
 * 영어 놀이터 — 사건 표 : 그림책방 무대 (Lv2 · 게임설계 v1 §5-3)
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['bookshop'] = [
  { id: 'storytime', name: '이야기 시간', icon: 'book', game: 'picture-book', who: 'mina', cls: 'ev-storytime',
    intro: { en: 'Read it!', ko: '새 그림책이 왔어 — 소리 내어 읽으면 장면이 움직여!' },
    outro: { en: 'Good!', ko: '이야기를 다 읽었어!' } },
  { id: 'return', name: '책 반납', icon: 'box', game: 'belt', who: 'ben', cls: 'ev-return',
    intro: { en: 'Oh!', ko: '반납된 책이 벨트로 와 — 문장을 읽고 맞는 그림에 꽂아 줘!' },
    outro: { en: 'Good!', ko: '책장이 가지런해!' } },
  { id: 'readaloud', name: '읽어 주는 날', icon: 'ear', game: 'pop', who: 'amy', cls: 'ev-readaloud',
    intro: { en: 'Listen!', ko: '사서 선생님이 읽어 줘 — 들린 장면을 톡톡!' },
    outro: { en: 'Good!', ko: '귀가 쫑긋!' } }
];
