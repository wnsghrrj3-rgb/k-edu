/* ============================================================
 * 영어 놀이터 — 방 자료: 얼음 그늘 골짜기 i · j (한 해 길 A05 · 상세판 A05 「방 배치」 · 등록 rooms/index.js)
 *   그늘 속 둥근 얼음집(굴뚝 김 · 작은 창 불빛) · 처마의 고드름. 왼쪽(i) 엎질러진 잉크 · 무당벌레 무리 · 지도 그리는 이구아나 · 얼음집(가운데) / 오른쪽(j) 잼 병 · 종이 제트(하늘) · 물병 · 용수철 버섯 발판.
 *   그 주만의 맛: 서늘한 그늘(옅은 안개 · 눈 얼룩) · 박자는 얼음 실로폰 · 처음 나오는 문장 「I see a ~!」.
 * ============================================================ */
export default {
  id: 'A05', light: 'day', fog: 'stage-soft', wind: 0.7,
  beat: { wave: 'sine', vol: 0.12, notes: [[1318, 0, 0.1], [1976, 0.01, 0.14]] },           /* 얼음 실로폰 */
  trees: { L: { leaf: ['a-leaf', 'a-fish', 0.45], fruit: 'a-plum' }, R: { leaf: ['a-leaf', 'surface', 0.35], fruit: 'a-red' } },
  ground: { creek: null, paint: (g, P) => { const { gx, gz, gs, soft, hex } = P; [[-6, 3.4, 1.6], [5.6, 3.8, 1.4], [-2.4, -4.4, 1.2], [3, -4.2, 1.1], [7, -0.4, 0.9]].forEach(p => soft(g, gx(p[0]), gz(p[1]), p[2] * gs, p[2] * 0.6 * gs, hex('surface'), 0.6, 0.4 * gs)); } },
  words: {
    igloo:  { make: 'igloo', at: [0.4, -3.7] },
    ink:    { make: 'ink' },
    insect: { make: 'bugs', o: { n: 5 } },
    iguana: { make: 'lizard', o: { map: true } },
    jam:    { make: 'jam', o: { tone: 'a-red' }, rot: -0.3 },
    jet:    { make: 'paperJet', o: { y: 2.9, ring: 1.3 } },
    jug:    { make: 'jug', o: { tone: 'a-fish' } },
    jump:   { make: 'springPad', o: { tone: 'a-red' } }
  },
  decor(K, glade, PR){ const c = PR.icicles(K, [[-7.0, -2.2, 1.6], [7.0, -2.4, 1.7]]); glade.add(c); return { ice: c, life: c.userData.life }; },
  stage: { jamsmell: { actor: 'igloo' }, spill: { actor: 'insect', from: [-1.2, 0.8] }, paperjet: { actor: 'jet' }, bugmarch: { actor: 'insect' } }
};
