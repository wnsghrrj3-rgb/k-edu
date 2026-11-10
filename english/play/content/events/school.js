/* ============================================================
 * 영어 놀이터 — 사건 표 : 교실 무대 (Lv2 · 게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다 — game = 그날 그 사건이 입히는 놀이. 적힌 차례 = 처음 만나는 차례(첫날은 사물함 챙기기).
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['classroom'] = [
  { id: 'locker', name: '사물함 챙기기', icon: 'bag', game: 'order-shop', who: 'mina', cls: 'ev-locker', opt: { guests: ['ben', 'amy'] },
    intro: { en: 'My bag!', ko: '친구들이 사물함에서 챙길 것을 말해 줘 — 그림을 보고 말로 챙겨 줘!' },
    outro: { en: 'Good!', ko: '가방을 다 챙겼어!' } },
  { id: 'magic', name: '마법 주문 시간', icon: 'wand', game: 'magic-call', who: 'mina', cls: 'ev-magic-call',
    intro: { en: 'Call it!', ko: '이름을 부르면 미나가 가져다 줘!' },
    outro: { en: 'Good!', ko: '책상이 꽉 찼어!' } },
  { id: 'note', name: '쪽지 배달', icon: 'box', game: 'belt', who: 'ben', cls: 'ev-note',
    intro: { en: 'Read it!', ko: '쪽지에 적힌 걸 읽고 맞는 그림을 올려 줘!' },
    outro: { en: 'Good!', ko: '쪽지를 다 배달했어!' } },
  { id: 'newfriend', name: '새 친구', icon: 'door', game: 'talk', who: 'ben', cls: 'ev-newfriend',
    intro: { en: 'Hi!', ko: '교실에 친구가 왔어 — 문장으로 대답해 줘!' },
    outro: { en: 'Good!', ko: '친구랑 더 친해졌어!' } },
  { id: 'cards', name: '단어 카드 읽기', icon: 'cards', game: 'read-aloud', who: 'amy', cls: 'ev-readcards',
    intro: { en: 'Read it!', ko: '칠판에 단어 카드가 붙었어 — 먼저 읽어 보고 뜻을 봐!' },
    outro: { en: 'Good!', ko: '다 읽었어!' } },
  { id: 'raccoon', name: '교실 너구리', icon: 'paw', game: 'raccoon', who: 'max', cls: 'ev-raccoon',
    intro: { en: 'Oh no!', ko: '너구리가 교실에 숨어서 무언가를 감췄어!' },
    outro: { en: 'Good!', ko: '다 찾았다!' } }
];
