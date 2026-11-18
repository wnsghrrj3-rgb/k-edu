/* ============================================================
 * 영어 놀이터 — 방 자료: 문어 연못 o · p (한 해 길 A08 · 상세판 A08 「방 배치」 · 등록 rooms/index.js)
 *   둥근 연못 한가운데 문어 — 다리 여덟으로 냄비 여덟을 돌린다. 왼 반원(o) 문어(가운데) · 수레를 맨 황소 · 올리브 바구니 · 물장구치는 수달 /
 *   오른 반원(p) 줄 선 돼지 · 계산대의 깃펜 · 김 나는 냄비 · 대나무 씹는 판다.
 *   그 주만의 맛: 물이 주인공 · 박자는 냄비 뚜껑 달그락 · 셋째 마디에 잔치 짐 싣기(첫 글자 쓰기).
 * ============================================================ */
export default {
  id: 'A08',
  /* 무대 여섯 칸 — 가운데 뒤의 큰 연못 · 젖은 모래와 물가 자갈 · 갈대밭과 버드나무 · 맑은 낮과 냄비 김 · 대나무 떨기 · 물이 주인공 */
  place: {
    land:   { kind: 'pond' },
    floor:  { kind: 'wetsand' },
    back:   { kind: 'reedWillow' },
    sky:    { kind: 'clearMirror' },
    around: { kind: 'bamboo', swap: { rocks: ['Rock_Moss_1', 'Rock_Moss_6'], plants: { fern: ['Plant_1'], bigleaf: [null, 'Bamboo_3'] } }, models: [['Willow_1', -8.6, 2.4, 3.6], ['Bamboo_4', 8.6, 1.3, 3.0], ['Lilypad', 1.6, -2.4, 0.7], ['Lilypad', -1.2, -3.9, 0.6]],
      trees: { L: { leaf: ['a-leaf', 'a-gold', 0.2], fruit: 'a-gold' }, R: { leaf: ['a-leaf', 'a-fish', 0.25], fruit: 'a-pink' } }, leaf: ['a-leaf', 'a-fish', 0.2],
      rocks: [[-8.0, -0.2, 0.4], [8.0, -2.2, 0.42], [-7.6, 4.2, 0.34]],
      plants: [['fern', -7.9, 2.9, 0.9], ['fern', 8.0, 0.6, 0.9], ['bigleaf', -8.1, -3.0, 1.0], ['bigleaf', 8.1, -3.6, 1.0], ['bigleaf', 2.4, 3.2, 0.7]] },
    look:   { kind: 'pondIsle' }
  },
  /* 방법 일곱 칸 — 이 방이 고른 부품: 글자 그릇 둘(문어 빨판 · 냄비 뚜껑) · 쓰는 것(이름표에 먹물 붓) · 챈트 몸짓(두 팔로 큰 동그라미) */
  how: { carrier: { L: { kind: 'sucker', tone: 'a-plum', at: [-3.4, -0.6] }, R: { kind: 'potlid', tone: 'a-steel', at: [3.6, -1.0] } }, pen: { kind: 'inkbrush' }, body: { kind: 'bigo' } },
  beat: { wave: 'triangle', vol: 0.12, notes: [[620, 0, 0.04], [930, 0.03, 0.05]] },           /* 냄비 뚜껑 달그락 */
  words: {
    octopus: { make: 'octopus', o: { body: 'a-plum' }, at: [0.4, -3.1], y: 0.1 },
    ox:      { make: 'animal', o: { body: 'a-wood', belly: ['a-wood', 'a-cream', 0.4], ear: 'droop', horn: true, tail: 'thin', scale: 1.15, wag: 1.5 } },
    olive:   { make: 'basket' },
    otter:   { make: 'otter', rot: 0.4 },
    pig:     { make: 'animal', o: { body: 'a-pink', belly: ['a-pink', 'surface', 0.3], ear: 'tri', tail: 'short', scale: 0.85, wag: 6 }, rot: Math.PI },
    pen:     { make: 'quill' },
    pot:     { make: 'pot' },
    panda:   { make: 'panda', rot: -0.5 }
  },
  decor(K, glade, PR, things, land){ const c = PR.cart(K); c.position.set(-7.2, land ? land.heightAt(-7.2, -1.9) : 0, -1.9); c.rotation.y = 0.5; glade.add(c); return { cart: c }; },      /* 연못은 터가 짓는다 — 여기는 황소의 수레만 */
  /* 올리브 퐁당 — 낱말마다 돼지가 한 걸음씩 연못가로 와 줄을 선다 */
  stage: { kitchen: { actor: 'octopus' }, plop: { actor: 'otter', walker: 'pig', from: [5.6, 1.9], to: [3.0, 0.2] }, loadcart: { actor: 'ox' }, inkdrops: { actor: 'octopus' } },
  onRound(id, i, c){ if (id === 'loadcart' && c.decor.cart && c.decor.cart.userData.load) c.decor.cart.userData.load(i + 1); },      /* 잔치 짐 — 한 글자에 상자 하나 */
  onEvent(id, c){ if (id === 'loadcart' && c.decor.cart && c.decor.cart.userData.load) c.decor.cart.userData.load(3); },
  /* 얼굴 놀이 「문어 주방」(말하기 뼈대 + 돌리기) — 주문 그림의 이름을 말하면, 문어를 빙글 돌려 그 냄비를 앞으로 데려온다. 냄비가 앞에 오면 뚜껑이 들썩이고 김이 오른다 */
  sig: { event: 'kitchen', tip: '문어를 빙글 돌려 봐 — 주문한 냄비가 앞으로 와', binR: 2.0, binDy: 0.6,
    bin: c => c.things.octopus,
    start(c){ const o = c.things.octopus; c.st.rot0 = o.userData.body.rotation.y; c.st.turn = 0; },
    progress(c, x, k, ang){ const o = c.things.octopus; o.userData.body.rotation.y = c.st.rot0 + c.st.turn + (ang || 0) * 0.45; },      /* 손이 도는 만큼 문어가 돈다 */
    async ok(c, x, i, n){ const o = c.things.octopus, b = o.userData.body, fr = b.rotation.y, to = c.st.rot0 + (c.st.turn += Math.PI / 4 * 3); c.sfx(c.BEAT);
      await c.tween(620, t => { b.rotation.y = fr + (to - fr) * t; }, t => 1 - Math.pow(1 - t, 3)); const arm = o.userData.arms[(8 - (i * 3) % 8) % 8];
      await c.tween(420, t => { arm.lid.position.y = 0.09 + Math.sin(t * Math.PI) * 0.3; }, t => t); c.burstAt(o, 1.5, 10, ['surface', 'a-cream', 'warm-soft']); c.ripple(o.position.x, o.position.z, 1.6); await c.wait(250); },
    end(c){ const b = c.things.octopus.userData.body; if (c.st.rot0 != null) b.rotation.y = c.st.rot0; } }
};
