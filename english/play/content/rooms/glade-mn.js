/* ============================================================
 * 영어 놀이터 — 방 자료: 달빛 둥지 m · n (한 해 길 A07 · 상세판 A07 「방 배치」 · 등록 rooms/index.js)
 *   밤 — 아주 큰 나무 밑, 달맞이 바위 위의 엄마 새 · 반딧불. 먼 쪽(m) 엄마 새(가운데) · 그루터기의 지도 · 우유병과 잔 · 차오르는 달(하늘) /
 *   가까운 쪽(n) 나무 사이 그물 · 도토리 · 내 코(몸 낱말) · 도토리나무 가지의 둥지(아기 새 셋).
 *   그 주만의 맛: 달빛 · 박자는 귀뚜라미 · 셋째 마디의 놀이가 「첫 글자 쓰기」(그림 옆에 첫 글자 — 도토리가 풀린다).
 * ============================================================ */
export default {
  id: 'A07',
  /* 무대 여섯 칸 — 굵은 뿌리 사이의 빈터와 달맞이 바위 · 낙엽과 뿌리와 이끼 · 검은 숲과 큰 달 · 남보라 밤과 반딧불 · 높은 도토리나무 · 밤, 그리고 둥근 달 */
  place: {
    land:   { kind: 'roothollow', rock: [0.4, -3.4, 0.3] },
    floor:  { kind: 'rootmoss' },
    back:   { kind: 'moonForest' },
    sky:    { kind: 'moonNight' },
    around: { kind: 'oak', swap: { mushrooms: ['Mushroom_3'], plants: { stump: ['TreeStump'], fern: ['Plant_3'] } }, models: [['CommonTree_5', -8.4, -1.9, 4.6], ['WoodLog', 8.0, -2.9, 1.8, 0.4]],
      trees: { L: { leaf: ['a-leaf', 'stage-deep', 0.45], fruit: 'a-plum' }, R: { leaf: ['a-leaf', 'a-plum', 0.3], fruit: 'a-gold', bark: ['a-wood', 'ink', 0.2] } }, leaf: ['stage-deep', 'a-plum', 0.3],
      mushrooms: [[-7.4, 3.3, 0.9], [1.0, 3.3, 0.8], [-1.0, -5.0, 0.9], [7.9, 2.4, 0.7]],
      plants: [['stump', -8.0, 0.3, 1.0], ['fern', -7.6, 3.9, 0.9], ['fern', 7.9, -4.6, 1.0], ['fern', -4.4, -5.1, 0.9], ['mossrock', 6.4, -4.9, 0.6]] },
    look:   { kind: 'moonRound' }
  },
  /* 방법 일곱 칸 — 이 방이 고른 부품: 글자 그릇 둘(달 · 둥지 알) · 쓰는 것(이름표에 달빛 선) · 챈트 몸짓(코를 톡) */
  how: { carrier: { L: { kind: 'moondisc' }, R: { kind: 'nestegg', tone: 'a-cream' } }, pen: { kind: 'moonline' }, body: { kind: 'nose' } },
  beat: { wave: 'square', vol: 0.05, notes: [[4186, 0, 0.03], [4186, 0.06, 0.03]] },           /* 귀뚜라미 */
  words: {
    mom:  { make: 'bird', o: { body: 'a-plum', wing: ['a-plum', 'ink', 0.25], beak: 'a-gold' }, at: [0.4, -3.3], y: 0.8, rot: -0.9, scale: 1.3 },
    map:  { make: 'mapStump' },
    milk: { make: 'milk' },
    moon: { make: 'moon', o: { y: 4.3, r: 0.6 } },
    net:  { make: 'net', rot: -0.25 },
    nut:  { make: 'acorns' },
    nose: { make: 'me', mood: 'nose' },
    nest: { make: 'nest', at: [5.9, 0.7], y: 3.5 }      /* 도토리나무의 옆으로 뻗은 가지 위 */
  },
  decor(K, glade, PR, things, land){ const r = PR.moonRock(K); r.position.set(0.4, land ? land.heightAt(0.4, -3.4) - 0.1 : 0, -3.4); glade.add(r); return { rock: r }; },
  /* 지도 펴기 — 낱말마다 엄마 새가 바위에서 내려와 지도 쪽으로 한 걸음씩 */
  stage: { moonrise: { actor: 'moon' }, openmap: { actor: 'map', walker: 'mom', ground: true, from: [1.9, -1.7], to: [4.1, -2.1] }, nuts: { actor: 'net' }, glowway: { actor: 'nest' } },
  /* 얼굴 놀이 「반딧불 길」(가르기 뼈대 + 이어 긋기) — 반딧불이 그림에서 두 글자 그릇까지 점점이 줄을 선다. 들린 소리의 글자까지 손가락으로 이어 그으면 그 길이 환해진다 */
  sig: { event: 'glowway', tip: '들린 낱말의 첫소리 글자까지 반딧불을 따라 손가락으로 이어 그어 봐',
    start(c){ const fl = (c.land.weather.moon && c.land.weather.moon.flies) || [], T = c.THREE, from = new T.Vector3(0.2, c.H(0.2, 1.0) + 1.5, 1.0), half = Math.floor(fl.length / 2); c.st.paths = {};
      c.letters.forEach((l, li) => { const to = c.carriers[l].position, mine = fl.slice(li * half, (li + 1) * half); c.st.paths[l] = mine;
        mine.forEach((m, i) => { const q = (i + 1) / (mine.length + 1); m.userData.hold = true; m.userData.to = new T.Vector3().lerpVectors(from, to, q); m.userData.to.y += Math.sin(q * Math.PI) * 0.5 + 0.2; }); });
      const all = fl.filter(m => m.userData.hold), fr = all.map(m => m.position.clone()); return c.tween(700, t => all.forEach((m, i) => { m.position.lerpVectors(fr[i], m.userData.to, t); m.material.opacity = 0.75; m.scale.setScalar(1.6); })); },
    async ok(c, x){ const mine = c.st.paths[x.l] || []; c.sfx('tray');
      await c.tween(520, t => mine.forEach((m, i) => { const k = Math.max(0, Math.min(1, t * 1.8 - i * 0.12)); m.scale.setScalar(1.6 + Math.sin(k * Math.PI) * 2.2); m.material.opacity = 0.75 + k * 0.25; }), t => t);
      c.burstAt(c.carriers[x.l], 0.3, 12, ['a-gold', 'surface', 'warm-soft']); mine.forEach(m => m.scale.setScalar(1.6)); c.hop(c.things.nest, 0.25, 400); await c.wait(250); },
    end(c){ const fl = (c.land.weather.moon && c.land.weather.moon.flies) || []; fl.forEach(m => { m.userData.hold = false; m.scale.setScalar(1); }); } }
};
