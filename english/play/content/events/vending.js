/* ============================================================
 * 영어 놀이터 — 사건 표 : 마법 자판기 무대 (Lv2 · 게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다. 문법은 「문제」가 아니라 조합 놀이로만(W08). 적힌 차례 = 처음 만나는 차례.
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['vending'] = [
  { id: 'jam', name: '칩이 엉켰어', icon: 'gear', game: 'gram-vending', who: 'max', cls: 'ev-jam',
    intro: { en: 'Oh no!', ko: '자판기 칩이 엉켰어 — 그림대로 칩을 끼워서 문장을 만들어 줘!' },
    outro: { en: 'Good!', ko: '자판기가 다시 돌아가!' } },
  { id: 'prank', name: '장난 자판기', icon: 'mask', game: 'silly-story', who: 'ben', cls: 'ev-prank',
    intro: { en: 'Ha ha!', ko: '자판기가 장난꾸러기가 됐어 — 마음대로 문장을 넣어 봐!' },
    outro: { en: 'Ha ha!', ko: '모두 깔깔 웃었어!' } },
  { id: 'tickets', name: '문장 쪽지', icon: 'box', game: 'belt', who: 'mina', cls: 'ev-tickets',
    intro: { en: 'Read it!', ko: '쪽지에 적힌 문장을 읽고 맞는 그림을 올려 줘!' },
    outro: { en: 'Good!', ko: '쪽지를 다 배달했어!' } },
  { id: 'echo', name: '자판기 메아리', icon: 'ear', game: 'pop', who: 'amy', cls: 'ev-vecho',
    intro: { en: 'Listen!', ko: '자판기가 문장을 외쳐 — 들린 그림을 톡톡!' },
    outro: { en: 'Good!', ko: '메아리를 다 잡았어!' } }
];
