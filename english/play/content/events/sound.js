/* ============================================================
 * 영어 놀이터 — 사건 표 : 소리 공방 무대 (게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다 — game = 그날 그 사건이 입히는 놀이.
 *   who = 등장인물 · cls = 배경(play.css 의 .ev-*). 영어 한마디는 짧게, 뜻은 우리말 줄로.
 *   적힌 차례 = 처음 만나는 차례(첫날은 기계 고장).
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['sound-shop'] = [
  { id: 'broken', name: '기계 고장', icon: 'wrench', game: 'sound-bridge', who: 'max', cls: 'ev-broken',
    intro: { en: 'Oh no!', ko: '소리 기계가 멈췄어 — 조각을 차례로 끼워서 다리를 이어 줘!' },
    outro: { en: 'Good!', ko: '기계가 다시 돌아간다!' } },
  { id: 'monsters', name: '소리 몬스터', icon: 'monster', game: 'sound-monster', who: 'ben', cls: 'ev-monsters',
    intro: { en: 'Oh! Look!', ko: '몬스터들이 소리 글자를 달고 놀러 왔어 — 들린 소리를 찾아 줘!' },
    outro: { en: 'Ha ha!', ko: '몬스터들이 신이 났어!' } },
  { id: 'express', name: '급행 기차', icon: 'train', game: 'sound-train', who: 'mina', cls: 'ev-express',
    intro: { en: 'Go! Go!', ko: '기차가 곧 떠나 — 들린 차례대로 칸을 이어 줘!' },
    outro: { en: 'Good!', ko: '기차가 제시간에 떠났어!' } },
  { id: 'magic', name: '변신 소동', icon: 'wand', game: 'sound-swap', who: 'amy', cls: 'ev-magic',
    intro: { en: 'Oh!', ko: '조각 하나만 바꾸면 다른 것이 돼 — 무엇으로 바꿀까?' },
    outro: { en: 'Ha ha!', ko: '뿅! 재미있는 변신이었어.' } },
  { id: 'cards', name: '단어 카드 대소동', icon: 'cards', game: 'read-aloud', who: 'sam', cls: 'ev-cards',
    intro: { en: 'Read it!', ko: '기계가 단어 카드를 마구 찍어 내 — 소리 내어 읽어 줘!' },
    outro: { en: 'Good!', ko: '카드를 다 읽었어!' } }
];
