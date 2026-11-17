/* ============================================================
 * 영어 놀이터 — 방 자료: 달빛 둥지 m · n (한 해 길 A07 · 상세판 A07 「방 배치」 · 등록 rooms/index.js)
 *   저녁 — 달맞이 바위 위의 엄마 새 · 반딧불. 왼쪽(m) 엄마 새(가운데) · 그루터기의 지도 · 우유병과 잔 · 차오르는 달(하늘) /
 *   오른쪽(n) 나무 사이 그물 · 도토리 · 내 코(몸 낱말) · 도토리나무 가지의 둥지(아기 새 셋).
 *   그 주만의 맛: 달빛 · 박자는 귀뚜라미 · 셋째 마디의 놀이가 「첫 글자 쓰기」(그림 옆에 첫 글자 — 도토리가 풀린다).
 * ============================================================ */
export default {
  id: 'A07', light: 'evening', fog: null, wind: 0.8,
  beat: { wave: 'square', vol: 0.05, notes: [[4186, 0, 0.03], [4186, 0.06, 0.03]] },           /* 귀뚜라미 */
  trees: { L: { leaf: ['a-leaf', 'stage-deep', 0.3], fruit: 'a-plum' }, R: { leaf: ['a-leaf', 'a-wood', 0.3], fruit: 'a-gold' } },
  ground: { creek: null },
  words: {
    mom:  { make: 'bird', o: { body: 'a-plum', wing: ['a-plum', 'ink', 0.25], beak: 'a-gold' }, at: [0.4, -3.3], y: 0.8, rot: -0.9, scale: 1.3 },
    map:  { make: 'mapStump' },
    milk: { make: 'milk' },
    moon: { make: 'moon', o: { y: 4.3, r: 0.6 } },
    net:  { make: 'net', rot: -0.25 },
    nut:  { make: 'acorns' },
    nose: { make: 'me', mood: 'nose' },
    nest: { make: 'nest', at: [5.9, -1.7], y: 3.0 }
  },
  decor(K, glade, PR){ const r = PR.moonRock(K); r.position.set(0.4, 0, -3.4); glade.add(r); const f = PR.fireflies(K); glade.add(f); return { rock: r, flies: f, life: f.userData.life }; },
  /* 지도 펴기 — 낱말마다 엄마 새가 바위에서 내려와 지도 쪽으로 한 걸음씩 */
  stage: { moonrise: { actor: 'moon' }, openmap: { actor: 'map', walker: 'mom', ground: true, from: [-0.9, -0.4], to: [-2.4, 0.7] }, nuts: { actor: 'net' }, glowway: { actor: 'nest' } },
  onEvent(id, c){ if (c.decor.flies && (id === 'moonrise' || id === 'glowway')) c.decor.flies.userData.bright = 1.7; }      /* 반딧불이 더 환해진다 */
};
