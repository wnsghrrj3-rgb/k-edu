/* ============================================================
 * 영어 놀이터 — 사건 표 : 소리 숲 무대 (Lv1 · 게임설계 v1 §5-3)
 *   사건은 미니게임의 포장만 바꾼다 — game = 그날 그 사건이 입히는 놀이. 알파벳 칸은 소리 몬스터·소리 점프를 입히는 사건만 쓴다.
 *   영어 한마디는 Lv1 에서 배운 낱말·감탄만(Oh! · Listen! · I see it!) — 뜻은 우리말 줄로. 적힌 차례 = 처음 만나는 차례.
 * ============================================================ */
window.PLAY_EVENTS = window.PLAY_EVENTS || {};
window.PLAY_EVENTS['sound-forest'] = [
  { id: 'fireflies', name: '반딧불 소리', icon: 'sparkle', game: 'sound-monster', who: 'mina', cls: 'ev-fireflies',
    intro: { en: 'Listen!', ko: '반딧불이 소리 글자를 달고 날아왔어 — 들린 소리를 찾아 줘!' },
    outro: { en: 'I see it!', ko: '숲이 환해졌어!' } },
  { id: 'stones', name: '징검다리', icon: 'jump', game: 'sound-jump', who: 'ben', cls: 'ev-stones',
    intro: { en: 'Oh!', ko: '개울에 소리 돌이 놓였어 — 들린 소리 쪽으로 몸을 기울여 건너!' },
    outro: { en: 'I like it!', ko: '개울을 다 건넜어!' } },
  { id: 'log', name: '통나무 다리', icon: 'bridge', game: 'sound-bridge', who: 'max', cls: 'ev-log',
    intro: { en: 'Oh!', ko: '통나무 다리가 끊겼어 — 소리 조각을 차례로 끼워 이어 줘!' },
    outro: { en: 'I like it!', ko: '다리가 이어졌어!' } },
  { id: 'leaves', name: '나뭇잎 편지', icon: 'leaf', game: 'read-aloud', who: 'amy', cls: 'ev-leaves',
    intro: { en: 'I see it!', ko: '나뭇잎에 단어가 적혀 날아왔어 — 소리 내어 읽어 줘!' },
    outro: { en: 'I like it!', ko: '나뭇잎 편지를 다 읽었어!' } },
  { id: 'caterpillar', name: '애벌레 기차', icon: 'train', game: 'sound-train', who: 'mina', cls: 'ev-caterpillar',
    intro: { en: 'Listen!', ko: '애벌레가 마디마디 소리를 달고 있어 — 들린 차례대로 이어 줘!' },
    outro: { en: 'I like it!', ko: '애벌레가 신나게 기어가!' } },
  { id: 'wand', name: '요정 지팡이', icon: 'wand', game: 'sound-swap', who: 'amy', cls: 'ev-wand',
    intro: { en: 'Oh!', ko: '요정 지팡이로 소리 하나만 바꾸면 다른 것이 돼!' },
    outro: { en: 'I see it!', ko: '뿅! 재미있는 변신이었어.' } }
];
