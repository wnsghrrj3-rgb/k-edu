/* ============================================================
 * 영어 놀이터 — 방 자료: 코끼리 폭포 e · f (한 해 길 A03 · 상세판 A03 「방 배치」 · 등록 rooms/index.js)
 *   뒤쪽 바위에서 떨어지는 폭포와 둥근 소 · 소 앞 풀 둥지의 큰 알. 왼쪽(e) 아기 코끼리 · 요정 · 알(가운데) · 내 팔꿈치 / 오른쪽(f) 물고기(소에서 튀어 오름) · 나뭇잎 부채 · 여우 · 개구리.
 *   그 주만의 맛: 물안개(옅은 안개) · 박자는 물방울 떨어지는 소리.
 * ============================================================ */
export default {
  id: 'A03',
  /* 무대 여섯 칸 — 절벽 아래 둥근 소(물가가 계단처럼 낮아진다) · 젖은 바위와 이끼 · 절벽과 폭포 · 물안개와 작은 무지개 · 물가로 늘어진 가지 · 세로로 높은 절벽과 청록 물 */
  place: {
    land:   { kind: 'cliffpool' },
    floor:  { kind: 'wetrock' },
    back:   { kind: 'cliffFall', fallX: 0.4 },
    sky:    { kind: 'sprayNoon' },
    around: { kind: 'weeping', trees: { L: { leaf: ['a-leaf', 'a-fish', 0.25], fruit: 'warm' }, R: { leaf: ['a-leaf', 'stage-deep', 0.25], fruit: 'a-pink' } },
      rocks: [[-7.5, 0.6, 0.42], [-7.4, 4.1, 0.36], [7.4, 3.9, 0.4], [-7.6, -3.6, 0.5], [7.9, -3.2, 0.5]], rockCap: ['a-leaf', 'stage-deep', 0.4],
      plants: [['bigleaf', -7.8, -1.9, 1.1], ['bigleaf', -4.4, -1.1, 0.8], ['bigleaf', 4.6, -1.2, 0.9], ['bigleaf', 8.0, -1.3, 1.1], ['bigleaf', -7.9, 2.4, 0.9], ['bigleaf', 8.1, 1.9, 0.9], ['mossrock', -2.2, -1.0, 0.7], ['mossrock', 5.6, 2.4, 0.6]] },
    look:   { kind: 'cliffTeal' }
  },
  beat: { wave: 'sine', vol: 0.14, notes: [[880, 0, 0.09, 1320]] },                         /* 물방울 똑 */
  words: {
    egg:      { make: 'egg', at: [0.9, -1.0] },                         /* 소 앞 물가의 풀 둥지 */
    elephant: { make: 'animal', o: { body: 'a-steel', belly: ['a-steel', 'surface', 0.3], ear: 'big', inner: 'a-pink', nose: 'trunk', tail: 'thin', scale: 1.15, long: 1.1, wag: 2 } },
    elbow:    { make: 'me', mood: 'lift' },
    elf:      { make: 'person', o: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-leaf' }, cone: 'a-leaf', scale: 0.78, rot: 0.5 },
    fish:     { make: 'fish', o: { body: 'warm', fin: 'a-gold', jump: true, y: 0.2 }, at: [1.3, -3.9] },      /* 소 한가운데서 튀어 오른다 */
    fan:      { make: 'leafFan', o: { tone: 'a-leaf' }, rot: -0.5 },
    fox:      { make: 'animal', o: { body: 'warm', belly: 'surface', ear: 'tri', tail: 'bush', scale: 0.8, wag: 3 }, rot: Math.PI },
    frog:     { make: 'frog', at: [2.6, -2.6] }                           /* 물 위 연잎 */
  },
  /* 폭포와 소는 터가 짓는다(place.back · place.land) — 가운데 장면을 따로 얹지 않는다 */
  stage: { whoseegg: { actor: 'egg' }, guard: { actor: 'fox', from: [1.6, -0.2] }, babyfish: { actor: 'fish' }, shower: { actor: 'elephant' } }
};
