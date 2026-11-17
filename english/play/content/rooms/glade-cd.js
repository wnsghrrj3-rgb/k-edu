/* ============================================================
 * 영어 놀이터 — 방 자료: 그루터기 찻집 c · d (한 해 길 A02 · 상세판 A02 「방 배치」 · 등록 rooms/index.js)
 *   가운데 큰 그루터기 찻상과 빈 의자 넷 · 오른쪽 뒤 작은 연못. 왼쪽(c) 고양이 · 컵(찻상 위) · 장난감 자동차 · 케이크 / 오른쪽(d) 강아지 · 아빠 · 오리 · 계산대 책상.
 *   그 주만의 맛: 방석이 하루에 하나씩 놓인다(손님 없는 찻집 → 오리 가족까지 와서 꽉 찬다) · 박자는 찻숟가락이 컵을 치는 소리.
 * ============================================================ */
export default {
  id: 'A02', light: 'day', fog: null, wind: 1,
  beat: { wave: 'sine', vol: 0.12, notes: [[1568, 0, 0.06], [2349, 0.01, 0.1]] },          /* 찻숟가락 땡 */
  trees: { L: { leaf: 'a-leaf', fruit: 'a-gold' }, R: { leaf: ['a-leaf', 'warm', 0.25], fruit: 'a-plum' } },
  ground: { creek: null, mushrooms: [[-6.9, 2.9, 1], [-6.4, 3.3, 0.7], [1.2, 3.4, 0.8], [7.2, 2.0, 0.9]] },
  words: {
    cat:  { make: 'animal', o: { body: 'a-gold', belly: 'a-cream', ear: 'tri', tail: 'thin', scale: 0.8, wag: 4 } },
    cup:  { make: 'cup', o: { tone: 'surface' }, y: 0.72 },
    car:  { make: 'toyCar', o: { tone: 'a-red' } },
    cake: { make: 'cake' },
    dog:  { make: 'animal', o: { body: ['a-wood', 'a-cream', 0.45], belly: 'a-cream', ear: 'droop', tail: 'up', scale: 0.85, wag: 7 }, rot: Math.PI },
    dad:  { make: 'person', o: { skin: 'skin-2', hair: 'hair-3', shirt: 'stage-2' }, apron: 'a-cream', rot: -0.6 },
    duck: { make: 'bird', o: { body: 'a-cream', wing: ['a-cream', 'a-gold', 0.4], beak: 'warm', flat: true, swim: true }, y: 0.04, rot: Math.PI },
    desk: { make: 'desk', rot: -0.4 }
  },
  decor(K, glade, PR){ const t = PR.teaTable(K); t.position.set(0.4, 0, -3.4); glade.add(t); const p = PR.pond(K, [7.3, -2.3], 0.9); glade.add(p); return { table: t, seats: t.userData.seats, life: t.userData.life }; },
  stage: { empty: { actor: 'dad' }, stare: { actor: 'cat', from: [-1.5, 0.2] }, duckway: { actor: 'duck' }, toytrain: { actor: 'car' } },
  /* 방석 — 손님 없는 찻집이 하나씩 찬다 */
  onEvent(id, c){ const s = c.decor.seats; if (!s) return; const show = n => s.slice(0, n).forEach(x => { x.userData.cush.visible = true; });
    if (id === 'empty') show(1); else if (id === 'stare') show(2); else if (id === 'toytrain') show(3); else if (id === 'duckway') show(4); }
};
