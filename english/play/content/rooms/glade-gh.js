/* ============================================================
 * 영어 놀이터 — 방 자료: 염소 언덕 g · h (한 해 길 A04 · 상세판 A04 「방 배치」 · 등록 rooms/index.js)
 *   언덕 꼭대기 납작한 큰 바위 위에 돗자리와 놀이판 · 바람개비. 왼쪽(g) 염소(목에 방울) · 풍선껌 · 소녀 · 놀이판(가운데) / 오른쪽(h) 밀짚모자 · 암탉 · 햄 바구니 · 내 손.
 *   그 주만의 맛: 오후 빛 · 풀이 바람에 더 눕는다 · 박자는 염소 방울 소리 · g 로 아랫줄을 처음 쓴다.
 * ============================================================ */
export default {
  id: 'A04', light: 'afternoon', fog: null, wind: 1.8,
  beat: { wave: 'sine', vol: 0.12, notes: [[1046, 0, 0.12], [1318, 0.01, 0.18]] },          /* 염소 방울 딸랑 */
  trees: { L: { leaf: 'a-leaf', fruit: 'a-red' }, R: { leaf: ['a-leaf', 'a-gold', 0.3], fruit: 'a-gold' } },
  ground: { creek: null },
  words: {
    goat: { make: 'animal', o: { body: 'a-cream', belly: 'surface', ear: 'droop', horn: true, bell: true, tail: 'short', scale: 0.95, wag: 5 } },
    gum:  { make: 'gum' },
    girl: { make: 'person', o: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-pink', buns: true, bow: 'a-gold', pants: 'stage-2', shoe: 'a-red' }, scale: 0.9, rot: 0.6 },
    game: { make: 'board', y: 0.78 },
    hat:  { make: 'hat', o: { tone: 'a-gold' } },
    hen:  { make: 'bird', o: { body: 'surface', wing: 'a-cream', beak: 'a-gold', comb: true, peck: true }, rot: Math.PI },
    ham:  { make: 'ham' },
    hand: { make: 'me', mood: 'wave' }
  },
  decor(K, glade, PR){ const r = PR.hillRock(K); r.position.set(0.4, 0, -3.4); glade.add(r); return { rock: r, life: r.userData.life }; },
  stage: { hatthief: { actor: 'goat' }, hamsmell: { actor: 'goat', from: [-6.6, -1.2], to: [-4.6, 0.2] }, oneround: { actor: 'game' }, bubble: { actor: 'gum' } }
};
