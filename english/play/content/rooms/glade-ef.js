/* ============================================================
 * 영어 놀이터 — 방 자료: 코끼리 폭포 e · f (한 해 길 A03 · 상세판 A03 「방 배치」 · 등록 rooms/index.js)
 *   뒤쪽 바위에서 떨어지는 폭포와 둥근 소 · 소 앞 풀 둥지의 큰 알. 왼쪽(e) 아기 코끼리 · 요정 · 알(가운데) · 내 팔꿈치 / 오른쪽(f) 물고기(소에서 튀어 오름) · 나뭇잎 부채 · 여우 · 개구리.
 *   그 주만의 맛: 물안개(옅은 안개) · 박자는 물방울 떨어지는 소리.
 * ============================================================ */
export default {
  id: 'A03', light: 'day', fog: 'stage-soft', wind: 1,
  beat: { wave: 'sine', vol: 0.14, notes: [[880, 0, 0.09, 1320]] },                         /* 물방울 똑 */
  trees: { L: { leaf: ['a-leaf', 'a-fish', 0.25], fruit: 'warm' }, R: { leaf: ['a-leaf', 'stage-deep', 0.25], fruit: 'a-pink' } },
  ground: { creek: null, rocks: [[-7.5, 0.6, 0.42], [-7.4, 4.1, 0.36], [7.4, 3.9, 0.4], [-2.6, -4.6, 0.5], [2.6, -4.6, 0.5]] },
  words: {
    egg:      { make: 'egg', at: [0, -2.4] },
    elephant: { make: 'animal', o: { body: 'a-steel', belly: ['a-steel', 'surface', 0.3], ear: 'big', inner: 'a-pink', nose: 'trunk', tail: 'thin', scale: 1.15, long: 1.1, wag: 2 } },
    elbow:    { make: 'me', mood: 'lift' },
    elf:      { make: 'person', o: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-leaf' }, cone: 'a-leaf', scale: 0.78, rot: 0.5 },
    fish:     { make: 'fish', o: { body: 'warm', fin: 'a-gold', jump: true, y: 0.2 }, at: [1.3, -3.9] },
    fan:      { make: 'leafFan', o: { tone: 'a-leaf' }, rot: -0.5 },
    fox:      { make: 'animal', o: { body: 'warm', belly: 'surface', ear: 'tri', tail: 'bush', scale: 0.8, wag: 3 }, rot: Math.PI },
    frog:     { make: 'frog' }
  },
  decor(K, glade, PR){ const w = PR.waterfall(K); w.position.set(0, 0, -4.9); glade.add(w); return { fall: w, life: w.userData.life }; },
  stage: { whoseegg: { actor: 'egg' }, guard: { actor: 'fox', from: [1.6, -0.2] }, babyfish: { actor: 'fish' }, shower: { actor: 'elephant' } }
};
