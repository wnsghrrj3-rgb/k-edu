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
    around: { kind: 'pillar', trees: { L: { leaf: ['stage-deep', 'a-leaf', 0.55], fruit: 'a-gold' }, R: { leaf: ['stage-deep', 'a-gold', 0.3], fruit: 'a-plum', bark: ['a-wood', 'ink', 0.12] } },
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
  stage: { empty: { actor: 'dad' }, stare: { actor: 'cat', from: [-1.5, 0.2] }, duckway: { actor: 'duck' }, toytrain: { actor: 'car' } },
  /* 방석 — 손님 없는 찻집이 하나씩 찬다 */
  onEvent(id, c){ const s = c.decor.seats; if (!s) return; const show = n => s.slice(0, n).forEach(x => { x.userData.cush.visible = true; });
    if (id === 'empty') show(1); else if (id === 'stare') show(2); else if (id === 'toytrain') show(3); else if (id === 'duckway') show(4); }
};
