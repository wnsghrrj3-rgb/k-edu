/* ============================================================
 * 영어 놀이터 — 방 자료: 염소 언덕 g · h (한 해 길 A04 · 상세판 A04 「방 배치」 · 등록 rooms/index.js)
 *   언덕 꼭대기 납작한 큰 바위 위에 돗자리와 놀이판 · 바람개비. 왼쪽(g) 염소(목에 방울) · 풍선껌 · 소녀 · 놀이판(가운데) / 오른쪽(h) 밀짚모자 · 암탉 · 햄 바구니 · 내 손.
 *   그 주만의 맛: 오후 빛 · 풀이 바람에 더 눕는다 · 박자는 염소 방울 소리 · g 로 아랫줄을 처음 쓴다.
 * ============================================================ */
export default {
  id: 'A04',
  /* 무대 여섯 칸 — 솟은 둥근 언덕(자리들이 비탈에 · 꼭대기에 납작 바위) · 바람에 눕는 긴 풀 · 겹겹이 먼 언덕 · 구름 그림자 · 바람에 기운 나무 · 하늘이 화면의 절반 */
  place: {
    land:   { kind: 'hill', top: 1.75, at: [0.3, -3.2] },
    floor:  { kind: 'longgrass' },
    back:   { kind: 'farHills' },
    sky:    { kind: 'cloudAfternoon' },
    around: { kind: 'windswept', trees: { L: { leaf: 'a-leaf', fruit: 'a-red' }, R: { leaf: ['a-leaf', 'a-gold', 0.3], fruit: 'a-gold' } },
      rocks: [[-7.6, 2.4, 0.4], [7.9, 2.8, 0.36], [-1.4, -5.0, 0.44], [2.6, -5.0, 0.3]], rockCap: ['a-leaf', 'a-gold', 0.4],
      plants: [['thistle', -8.0, -0.9, 1.1], ['thistle', -4.6, 3.4, 0.9], ['thistle', 5.6, -4.6, 1.0], ['thistle', 8.0, 0.9, 1.0], ['thistle', -1.7, -5.0, 0.9], ['thistle', 1.6, 3.2, 0.8], ['thistle', -8.0, 3.9, 0.9]] },
    look:   { kind: 'skyHalf' }
  },
  /* 방법 일곱 칸(다름 설계 v1 §4 · WD0) — 구도 · 손짓 · 얼굴 놀이 · 여는 꼴과 그 글은 생성 자료(data/path-differ.js)에서 읽는다. 여기는 이 방이 고른 부품만: 글자 그릇 둘 · 쓰는 것 · 챈트 몸짓 */
  how: { carrier: { L: { kind: 'pawn', tone: 'a-red' }, R: { kind: 'hatband', tone: 'a-red' } }, pen: { kind: 'chalkstone' }, body: { kind: 'horns' } },      /* 놀이판의 말 · 모자 띠 / 납작 바위 놀이판에 분필돌 / 염소 뿔 까딱 */
  beat: { wave: 'sine', vol: 0.12, notes: [[1046, 0, 0.12], [1318, 0.01, 0.18]] },          /* 염소 방울 딸랑 */
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
  decor(K, glade, PR, things, land){ const r = PR.hillRock(K); r.position.set(0.4, land.heightAt(0.4, -3.4) - 0.12, -3.4); glade.add(r); return { rock: r, life: r.userData.life }; },      /* 언덕 꼭대기의 납작 바위 */
  stage: { hatthief: { actor: 'goat' }, hamsmell: { actor: 'goat', from: [-6.6, -1.2], to: [-4.6, 0.2] }, oneround: { actor: 'game' }, bubble: { actor: 'gum' } }
};
