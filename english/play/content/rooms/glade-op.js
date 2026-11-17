/* ============================================================
 * 영어 놀이터 — 방 자료: 문어 연못 o · p (한 해 길 A08 · 상세판 A08 「방 배치」 · 등록 rooms/index.js)
 *   둥근 연못 한가운데 문어 — 다리 여덟으로 냄비 여덟을 돌린다. 왼쪽(o) 문어(가운데) · 수레 곁의 황소 · 올리브 바구니 · 물장구치는 수달 /
 *   오른쪽(p) 줄 선 돼지 · 통나무 계산대의 깃펜 · 김 나는 냄비 · 대나무 씹는 판다.
 *   그 주만의 맛: 박자는 냄비 뚜껑 달그락 · 셋째 마디의 놀이가 「첫 글자 쓰기」(상자가 수레에 하나씩 실린다) · 통말 the.
 * ============================================================ */
export default {
  id: 'A08', light: 'day', fog: null, wind: 1,
  beat: { wave: 'triangle', vol: 0.12, notes: [[620, 0, 0.04], [930, 0.03, 0.05]] },           /* 냄비 뚜껑 달그락 */
  trees: { L: { leaf: 'a-leaf', fruit: 'a-gold' }, R: { leaf: ['a-leaf', 'a-fish', 0.25], fruit: 'a-pink' } },
  ground: { creek: null },
  words: {
    octopus: { make: 'octopus', o: { body: 'a-plum' }, at: [0.4, -3.3] },
    ox:      { make: 'animal', o: { body: 'a-wood', belly: ['a-wood', 'a-cream', 0.4], ear: 'droop', horn: true, tail: 'thin', scale: 1.15, wag: 1.5 } },
    olive:   { make: 'basket' },
    otter:   { make: 'otter', rot: 0.4 },
    pig:     { make: 'animal', o: { body: 'a-pink', belly: ['a-pink', 'surface', 0.3], ear: 'tri', tail: 'short', scale: 0.85, wag: 6 }, rot: Math.PI },
    pen:     { make: 'quill' },
    pot:     { make: 'pot' },
    panda:   { make: 'panda', rot: -0.5 }
  },
  decor(K, glade, PR){ const p = PR.pond(K, [0.4, -3.3], 1.95); glade.add(p); const c = PR.cart(K); c.position.set(-7.3, 0, 0.45); c.rotation.y = 0.3; glade.add(c); const b = PR.bamboo(K, [7.4, -3.5]); glade.add(b); return { pond: p, cart: c, life: b.userData.life }; },
  /* 올리브 퐁당 — 낱말마다 돼지가 한 걸음씩 연못가로 와 줄을 선다 */
  stage: { kitchen: { actor: 'octopus' }, plop: { actor: 'otter', walker: 'pig', from: [5.2, 2.3], to: [2.6, -0.8] }, loadcart: { actor: 'ox' }, inkdrops: { actor: 'octopus' } },
  onRound(id, i, c){ if (id === 'loadcart' && c.decor.cart) c.decor.cart.userData.load(i + 1); },      /* 잔치 짐 — 한 글자에 상자 하나 */
  onEvent(id, c){ if (id === 'loadcart' && c.decor.cart) c.decor.cart.userData.load(3); }
};
