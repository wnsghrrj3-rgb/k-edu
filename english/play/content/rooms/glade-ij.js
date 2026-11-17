/* ============================================================
 * 영어 놀이터 — 방 자료: 얼음 그늘 골짜기 i · j (한 해 길 A05 · 상세판 A05 「방 배치」 · 등록 rooms/index.js)
 *   그늘 속 둥근 얼음집(굴뚝 김 · 작은 창 불빛) · 처마의 고드름. 왼쪽(i) 엎질러진 잉크 · 무당벌레 무리 · 지도 그리는 이구아나 · 얼음집(가운데) / 오른쪽(j) 잼 병 · 종이 제트(하늘) · 물병 · 용수철 버섯 발판.
 *   그 주만의 맛: 서늘한 그늘(옅은 안개 · 눈 얼룩) · 박자는 얼음 실로폰 · 처음 나오는 문장 「I see a ~!」.
 * ============================================================ */
export default {
  id: 'A05',
  /* 무대 여섯 칸 — 양옆이 바위벽인 좁은 골짜기 바닥 · 눈과 서리 · 골짜기 끝의 밝은 틈 · 푸른 그늘빛과 입김 · 서리 앉은 바늘잎나무 · 희고 푸른 그늘 속 노란 창 하나 */
  place: {
    land:   { kind: 'gorge', side: 0.9 },
    floor:  { kind: 'snow' },
    back:   { kind: 'gorgeGap' },
    sky:    { kind: 'blueShade' },
    around: { kind: 'conifer', trees: { L: { leaf: ['stage-deep', 'a-fish', 0.22], fruit: 'a-plum' }, R: { leaf: ['stage-deep', 'a-leaf', 0.3], fruit: 'a-red' } },
      plants: [['snowrock', -7.6, 3.2, 1.0], ['snowrock', 7.7, 2.4, 0.9], ['snowrock', -2.6, -4.7, 1.1], ['snowrock', 3.3, -4.5, 0.9], ['snowrock', -8.0, -3.9, 1.2], ['snowrock', 8.1, -4.3, 1.2], ['snowrock', 1.4, 3.3, 0.6]] },
    look:   { kind: 'blueWindow' }
  },
  /* 방법 일곱 칸(다름 설계 v1 §4 · WD0) — 구도 · 손짓 · 얼굴 놀이 · 여는 꼴과 그 글은 생성 자료(data/path-differ.js)에서 읽는다. 여기는 이 방이 고른 부품만: 글자 그릇 둘 · 쓰는 것 · 챈트 몸짓 */
  how: { carrier: { L: { kind: 'icecube' }, R: { kind: 'jamlid', tone: 'a-red' } }, pen: { kind: 'frost' }, body: { kind: 'jump' } },      /* 얼음 조각 · 잼 병 뚜껑 / 서리 낀 문패를 긁어 쓰기 / 제자리에서 폴짝 */
  beat: { wave: 'sine', vol: 0.12, notes: [[1318, 0, 0.1], [1976, 0.01, 0.14]] },           /* 얼음 실로폰 */
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
  decor(K, glade, PR, things, land){ const c = PR.icicles(K, [[-7.9, -3.9, 1.7], [7.9, -4.0, 1.8]]); c.children.forEach(r => { r.position.y = land.heightAt(r.position.x, r.position.z); }); glade.add(c); return { ice: c, life: c.userData.life }; },      /* 바위벽 아래 처마의 고드름 */
  stage: { jamsmell: { actor: 'igloo' }, spill: { actor: 'insect', from: [-1.2, 0.8] }, paperjet: { actor: 'jet' }, bugmarch: { actor: 'insect' } }
};
