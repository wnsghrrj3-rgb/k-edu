/* ============================================================
 * 영어 놀이터 — 방 자료: 연 날리는 언덕 k · l (한 해 길 A06 · 상세판 A06 「방 배치」 · 등록 rooms/index.js)
 *   언덕 위 잠긴 성문 · 문 옆 바위 얼굴이 입술을 모아 바람을 후 분다(민들레 씨). 왼쪽(k) 나무에 걸린 연 · 발 구르는 임금님 · 연줄의 열쇠 · 공 /
 *   오른쪽(l) 내 다리(몸 낱말) · 바위 얼굴의 입술(가운데) · 기둥 등 · 갈기 날리는 사자.
 *   그 주만의 맛: 센 바람 · 박자는 연줄 튕기는 소리 · 손님 차례에 c 와 k 가 쌍둥이 열매로(같은 소리).
 * ============================================================ */
export default {
  id: 'A06', light: 'day', fog: null, wind: 2.2,
  beat: { wave: 'triangle', vol: 0.12, notes: [[880, 0, 0.05], [1320, 0.02, 0.09]] },          /* 연줄 튕기는 소리 */
  trees: { L: { leaf: 'a-leaf', fruit: 'a-red' }, R: { leaf: ['a-leaf', 'a-gold', 0.25], fruit: 'a-gold' } },
  ground: { creek: null },
  words: {
    kite: { make: 'kite', o: { tone: 'a-red' }, at: [-3.6, -0.9], y: 3.3 },
    king: { make: 'person', o: { skin: 'skin-1', hair: 'hair-1', shirt: 'a-plum', pants: 'ink-2', shoe: 'a-gold' }, crown: 'a-gold', cape: 'a-red', scale: 0.78, rot: 0.5 },
    key:  { make: 'key', o: { y: 1.5, string: 1.9, lean: 0.25 } },
    kick: { make: 'kickBall' },
    leg:  { make: 'me', mood: 'kick' },
    lip:  { make: 'rockFace', at: [1.6, -3.5] },
    lamp: { make: 'lampPost' },
    lion: { make: 'animal', o: { body: 'a-gold', belly: 'a-cream', ear: 'round', tail: 'thin', mane: 'warm', scale: 1.05, wag: 2 }, rot: Math.PI }
  },
  decor(K, glade, PR){ const g = PR.gate(K); g.position.set(-1.0, 0, -3.9); glade.add(g); const s = PR.seeds(K, [1.6, 0.7, -2.6]); glade.add(s); return { gate: g, life: s.userData.life }; },
  /* 연줄의 열쇠 — 낱말마다 사자가 한 걸음씩 열쇠 쪽으로 */
  stage: { stuck: { actor: 'kite' }, keyjump: { actor: 'key', walker: 'lion', from: [4.4, 0.5], to: [-1.4, -0.9] }, lanterns: { actor: 'lamp' }, puff: { actor: 'lip' } },
  onEvent(id, c){ if (id === 'lanterns' && c.decor.gate) c.decor.gate.userData.lampOn(); }      /* 등불 행렬 뒤 — 성문 위에 등 */
};
