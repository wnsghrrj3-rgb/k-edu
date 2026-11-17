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
    around: { kind: 'windswept', swap: { rocks: ['Rock_5', 'Rock_3'], plants: { thistle: ['Wheat', null, 'Grass_2'] } }, models: [['BirchTree_1', -6.3, -6.3, 4.2], ['BirchTree_3', 3.2, -6.4, 3.8], ['BushBerries_1', -7.5, 0.8, 1.2]],
      trees: { L: { leaf: 'a-leaf', fruit: 'a-red' }, R: { leaf: ['a-leaf', 'a-gold', 0.3], fruit: 'a-gold' } },
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
  /* 얼굴 놀이 「놀이 한 판」(상세판 사건 oneround) — 비탈에 놀이판 두 칸(g · h). 들린 낱말의 그림 말을 그 칸으로 던지면 염소가 그 칸으로 뛰어가 방울을 흔든다 */
  sig: { event: 'oneround', tip: '들린 낱말의 그림을 첫소리 칸으로 튕겨 던져 봐', binR: 1.25, binDy: 0.2,
    bin: (c, l) => c.st.tiles[l],
    start(c){ const T = c.THREE, at = { [c.letters[0]]: [-2.3, -2.0], [c.letters[1]]: [2.7, -0.1] }; c.st.tiles = {};
      c.letters.forEach((l, i) => { const g = new T.Group(), x = at[l][0], z = at[l][1]; g.position.set(x, c.H(x, z) + 0.06, z); g.rotation.y = i ? -0.2 : 0.25;
        const tl = c.rbox(1.5, 1.5, 0.12, 0.2, c.M(i ? 'a-gold' : 'a-red', { roughness: 0.7 })); tl.rotation.x = -Math.PI / 2; g.add(tl);
        const lb = new T.Mesh(new T.CircleGeometry(0.5, 28), new T.MeshBasicMaterial({ map: c.letterTex(l, c.hex('ink'), c.hex('a-cream')) })); lb.rotation.x = -Math.PI / 2 + 0.5; lb.position.set(0, 0.34, 0.1); g.add(lb);
        g.scale.setScalar(0.01); c.glade.add(g); c.st.tiles[l] = g; c.tween(420, t => g.scale.setScalar(Math.max(0.01, t))); });
      c.st.home = c.things.goat.position.clone(); c.st.rot = c.things.goat.rotation.y; c.things.goat.userData.busy = true; },
    async ok(c, x){ const T = c.THREE, goat = c.things.goat, tl = c.st.tiles[x.l].position; await c.walkTo(goat, new T.Vector3(tl.x, goat.position.y, tl.z + 0.2), 520); c.sfx(c.BEAT); await c.hop(goat, 0.45, 380); c.sfx(c.BEAT); c.burstAt(goat, 1.2, 8); },      /* 염소가 그 칸에서 방울을 흔든다 */
    async end(c){ const goat = c.things.goat; await c.walkTo(goat, c.st.home, 800); goat.position.copy(c.st.home); goat.rotation.y = c.st.rot; goat.userData.busy = false; Object.values(c.st.tiles).forEach(g => c.tween(300, t => g.scale.setScalar(Math.max(0.01, 1 - t))).then(() => c.glade.remove(g))); } },
  stage: { hatthief: { actor: 'goat' }, hamsmell: { actor: 'goat', from: [-6.6, -1.2], to: [-4.6, 0.2] }, oneround: { actor: 'game' }, bubble: { actor: 'gum' } }
};
