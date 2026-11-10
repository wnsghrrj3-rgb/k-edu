/* ============================================================
 * 영어 놀이터 — 사건 표 : 운동장 무대 (Lv2 · 게임설계 v1 §5-3) — 몸 놀이(카메라)는 이 무대에 모은다(§10)
 *   사건은 미니게임의 포장만 바꾼다. 적힌 차례 = 처음 만나는 차례(첫날은 댄스 대회).
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['playground'] = [
  { id: 'dancecontest', name: '댄스 대회', icon: 'jump', game: 'dance', who: 'ben', cls: 'ev-dance',
    intro: { en: 'Dance!', ko: '운동장 댄스 대회야 — 강아지가 외치는 동작을 같이 춰!' },
    outro: { en: 'Good!', ko: '모두 손뼉을 쳐 줬어!' } },
  { id: 'coach', name: '코치 놀이', icon: 'wand', game: 'magic-call', who: 'ben', cls: 'ev-coach',
    intro: { en: 'Call it!', ko: '오늘은 네가 코치 — 동작 이름을 부르면 벤이 해!' },
    outro: { en: 'Good!', ko: '벤이 땀을 닦아.' } },
  { id: 'ball', name: '공놀이', icon: 'body', game: 'catch', who: 'mina', cls: 'ev-ball',
    intro: { en: 'Catch!', ko: '들린 쪽으로 몸을 기울여 받아!' },
    outro: { en: 'Good!', ko: '하나도 안 떨어뜨렸어!' } },
  { id: 'cheer', name: '응원 챈트', icon: 'note', game: 'chant', who: 'amy', cls: 'ev-cheer',
    intro: { en: 'Sing with me!', ko: '응원 구호를 같이 외쳐!' },
    outro: { en: 'Good!', ko: '운동장이 들썩들썩!' } },
  { id: 'raccoon', name: '운동장 너구리', icon: 'paw', game: 'raccoon', who: 'max', cls: 'ev-raccoon',
    intro: { en: 'Oh no!', ko: '너구리가 동작 카드를 덤불에 숨겼어!' },
    outro: { en: 'Good!', ko: '다 찾았다!' } }
];
