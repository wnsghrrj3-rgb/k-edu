/* ============================================================
 * 영어 놀이터 — 사건 표 : 변신 거울 무대 (Lv2 · 게임설계 v1 §5-3)
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['mirror'] = [
  { id: 'robotday', name: '로봇 만드는 날', icon: 'robot', game: 'robot', who: 'max', cls: 'ev-robot',
    intro: { en: 'Oh!', ko: '거울 뒤에 로봇 부품이 잔뜩 — 들은 부품을 붙여 줘!' },
    outro: { en: 'Good!', ko: '로봇이 춤을 춰!' } },
  { id: 'magicmirror', name: '요술 거울', icon: 'mirror', game: 'mirror', who: 'amy', cls: 'ev-magicmirror',
    intro: { en: 'Oh!', ko: '거울이 요술을 부려 — 얼굴을 골라 변신하고 말해 봐!' },
    outro: { en: 'Good!', ko: '거울이 반짝반짝!' } },
  { id: 'sizes', name: '커졌다 작아졌다', icon: 'magnet', game: 'size-lab', who: 'ben', cls: 'ev-sizes',
    intro: { en: 'Big? Small?', ko: '거울에 비친 게 커졌다 작아졌다 해!' },
    outro: { en: 'Ha ha!', ko: '원래대로 돌아왔어.' } },
  { id: 'paint', name: '물감 소동', icon: 'bulb', game: 'color-lab', who: 'mina', cls: 'ev-paint',
    intro: { en: 'Oh no!', ko: '물감이 쏟아졌어 — 들은 색으로 칠한 걸 골라 줘!' },
    outro: { en: 'Good!', ko: '알록달록 멋져!' } },
  { id: 'faces', name: '표정 맞히기', icon: 'ear', game: 'pop', who: 'sam', cls: 'ev-faces',
    intro: { en: 'Listen!', ko: '들린 표정을 톡톡 눌러 줘!' },
    outro: { en: 'Good!', ko: '다 맞혔어!' } },
  { id: 'raccoon', name: '거울 너구리', icon: 'paw', game: 'raccoon', who: 'max', cls: 'ev-raccoon',
    intro: { en: 'Oh no!', ko: '너구리가 표정 카드를 숨겼어!' },
    outro: { en: 'Good!', ko: '다 찾았다!' } }
];
