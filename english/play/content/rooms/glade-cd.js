/* ============================================================
 * 영어 놀이터 — 방 자료: 그루터기 찻집 c · d (한 해 길 A02 · 상세판 A02 「방 배치」 · 등록 rooms/index.js)
 *   가운데 큰 그루터기 찻상과 빈 의자 넷 · 오른쪽 뒤 작은 연못. 왼쪽(c) 고양이 · 컵(찻상 위) · 장난감 자동차 · 케이크 / 오른쪽(d) 강아지 · 아빠 · 오리 · 계산대 책상.
 *   그 주만의 맛: 방석이 하루에 하나씩 놓인다(손님 없는 찻집 → 오리 가족까지 와서 꽉 찬다) · 박자는 찻숟가락이 컵을 치는 소리.
 * ============================================================ */
export default {
  id: 'A02',
  /* 무대 여섯 칸(무대 설계 v1 §2 · 터 부품 상자 rooms/lands.js) — 깊은 숲 속 움푹한 자리 · 낙엽과 톱밥 · 줄기 벽 · 빛 기둥 · 굵고 곧은 큰 나무 · 갈색과 금빛 */
  place: {
    land:   { kind: 'hollow', rim: 0.8, pond: [7.3, -2.3, 0.9] },
    floor:  { kind: 'litter' },
    back:   { kind: 'trunkWall' },
    sky:    { kind: 'canopyShafts' },
    around: { kind: 'pillar', swap: { mushrooms: ['Mushroom_3', 'Mushroom_4'], plants: { fern: ['Plant_1', 'Plant_3'], mossrock: ['Rock_Moss_1'], stump: ['TreeStump_Moss'] } }, models: [['WoodLog_Moss', 9.0, -2.0, 2.0, 1.2], ['TreeStump_Moss', -9.1, -1.2, 1.4], ['Mushroom_4', -9.0, 1.4, 0.6], ['Plant_3', 9.1, 2.4, 1.0]],
      trees: { L: { leaf: ['stage-deep', 'a-leaf', 0.55], fruit: 'a-gold' }, R: { leaf: ['stage-deep', 'a-gold', 0.3], fruit: 'a-plum', bark: ['a-wood', 'ink', 0.12] } },
      mushrooms: [[-6.9, 2.9, 1], [-6.4, 3.3, 0.7], [1.2, 3.4, 0.8], [7.4, 3.0, 0.9], [-0.9, -5.0, 1.0], [-0.4, -5.2, 0.7]],
      plants: [['fern', -7.6, -3.8, 1.2], ['fern', -6.2, -4.9, 1.0], ['fern', 3.6, -5.0, 1.1], ['fern', 7.9, -4.4, 1.2], ['fern', -8.0, 0.8, 0.9], ['fern', 8.2, 0.9, 1.0], ['fern', -4.6, 4.2, 0.8], ['mossrock', -7.4, 4.3, 0.8], ['mossrock', 1.6, -5.2, 0.7], ['stump', 5.2, -4.9, 1.0]] },
    look:   { kind: 'canopyGold' }
  },
  /* 방법 일곱 칸(다름 설계 v1 §4 · WD0) — 구도 · 손짓 · 얼굴 놀이 · 여는 꼴과 그 글은 생성 자료(data/path-differ.js)에서 읽는다. 여기는 이 방이 고른 부품만: 글자 그릇 둘 · 쓰는 것 · 챈트 몸짓 */
  how: { carrier: { L: { kind: 'saucer', tone: 'surface' }, R: { kind: 'bowl', tone: 'a-fish' } }, pen: { kind: 'chalk' }, body: { kind: 'clink' } },      /* 찻잔 받침 · 강아지 밥그릇 / 차림표에 분필 / 검지 둘 맞부딪치기 */
  beat: { wave: 'sine', vol: 0.12, notes: [[1568, 0, 0.06], [2349, 0.01, 0.1]] },          /* 찻숟가락 땡 */
  words: {
    cat:  { make: 'animal', o: { body: 'a-gold', belly: 'a-cream', ear: 'tri', tail: 'thin', scale: 0.8, wag: 4 } },
    cup:  { make: 'cup', o: { tone: 'surface' }, y: 0.72 },
    car:  { make: 'toyCar', o: { tone: 'a-red' } },
    cake: { make: 'cake' },
    dog:  { make: 'animal', o: { body: ['a-wood', 'a-cream', 0.45], belly: 'a-cream', ear: 'droop', tail: 'up', scale: 0.85, wag: 7 }, rot: Math.PI },
    dad:  { make: 'person', o: { skin: 'skin-2', hair: 'hair-3', shirt: 'stage-2' }, apron: 'a-cream', rot: -0.6 },
    duck: { make: 'bird', o: { body: 'a-cream', wing: ['a-cream', 'a-gold', 0.4], beak: 'warm', flat: true, swim: true }, at: [7.3, -2.3], y: 0.04, rot: Math.PI },      /* 작은 연못 위 */
    desk: { make: 'desk', rot: -0.4 }
  },
  decor(K, glade, PR, things, land){ const t = PR.teaTable(K); t.position.set(0.4, land.heightAt(0.4, -3.4), -3.4); glade.add(t); return { table: t, seats: t.userData.seats, life: t.userData.life }; },      /* 작은 연못은 땅(place.land.pond)이 판다 */
  /* 얼굴 놀이 「케이크 눈싸움」(상세판 사건 stare) — 고양이와 강아지가 케이크를 사이에 두고 눈싸움. 들린 낱말의 그림을 고양이 쪽(c) · 강아지 쪽(d)으로 끌어다 놓으면, 맞을 때마다 둘이 한 칸씩 물러나고 방석이 하나 놓인다 */
  sig: { event: 'stare', tip: '들린 낱말의 그림을 고양이 쪽이나 강아지 쪽으로 끌어다 놓아 봐', binR: 1.2, binDy: 0.5,
    bin: (c, l) => c.things[l === c.letters[0] ? 'cat' : 'dog'],
    eye: c => c.things.cake,
    async start(c){ const cake = c.things.cake.position, T = c.THREE, cat = c.things.cat, dog = c.things.dog; c.st.home = { cat: cat.position.clone(), dog: dog.position.clone(), rc: cat.rotation.y, rd: dog.rotation.y }; cat.userData.busy = dog.userData.busy = true;
      await Promise.all([c.walkTo(cat, new T.Vector3(cake.x - 1.25, cat.position.y, cake.z + 0.9), 900), c.walkTo(dog, new T.Vector3(cake.x + 1.25, dog.position.y, cake.z + 0.9), 900)]); cat.rotation.y = 0; dog.rotation.y = Math.PI; c.act('cake', 700); },      /* 케이크 양옆에서 마주 본다 */
    async ok(c, x, i){ const T = c.THREE, cat = c.things.cat, dog = c.things.dog, s = c.decor.seats; if (s && s[i]) s[i].userData.cush.visible = true; c.sfx('pop');
      await Promise.all([c.walkTo(cat, cat.position.clone().add(new T.Vector3(-0.5, 0, 0.25)), 380), c.walkTo(dog, dog.position.clone().add(new T.Vector3(0.5, 0, 0.25)), 380)]); cat.rotation.y = 0; dog.rotation.y = Math.PI; },      /* 한 칸씩 물러난다 */
    async end(c){ const h = c.st.home, cat = c.things.cat, dog = c.things.dog; c.act('cake', 900); await Promise.all([c.walkTo(cat, h.cat, 900), c.walkTo(dog, h.dog, 900)]); cat.position.copy(h.cat); dog.position.copy(h.dog); cat.rotation.y = h.rc; dog.rotation.y = h.rd; cat.userData.busy = dog.userData.busy = false; } },
  stage: { empty: { actor: 'dad' }, stare: { actor: 'cat', from: [-1.5, 0.2] }, duckway: { actor: 'duck' }, toytrain: { actor: 'car' } },
  /* 방석 — 손님 없는 찻집이 하나씩 찬다 */
  onEvent(id, c){ const s = c.decor.seats; if (!s) return; const show = n => s.slice(0, n).forEach(x => { x.userData.cush.visible = true; });
    if (id === 'empty') show(1); else if (id === 'stare') show(2); else if (id === 'toytrain') show(3); else if (id === 'duckway') show(4); }
};
