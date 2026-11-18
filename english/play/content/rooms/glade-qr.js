/* ============================================================
 * 영어 놀이터 — 방 자료: 비 오는 여왕의 뜰 q · r (한 해 길 A09 · 상세판 A09 「방 배치」 · 등록 rooms/index.js)
 *   비 — 지붕 있는 작은 정자에 누비이불을 쓴 여왕. 안쪽(q) 여왕(가운데) · 난간의 누비이불 · 수수께끼 판 · 웅덩이의 오리(quack) /
 *   바깥(r) 빨간 장화 · 비구름(하늘) · 방석 위 반지 · 삐걱 로봇.
 *   그 주만의 맛: 빗줄기와 웅덩이 · 박자는 빗방울 · q 는 늘 u 와 붙어 다닌다(buddy — 글자 그릇 · 쪽지 글자 칸) · 반지가 닿으면 비가 그치고 무지개.
 * ============================================================ */
import { quiltTex } from './props.js';
export default {
  id: 'A09', buddy: { q: 'u' },
  /* 무대 여섯 칸 — 다듬은 정원과 정자 자리 · 깎은 잔디와 디딤돌 · 장미 덩굴 담과 아치문 · 회보라 비구름과 빗줄기 · 둥글게 깎은 정원수 · 비, 그리고 지붕 있는 정자 */
  place: {
    land:   { kind: 'garden' },
    floor:  { kind: 'wetlawn' },
    back:   { kind: 'roseWall', arch: -4.6 },
    sky:    { kind: 'rainGrey' },
    around: { kind: 'topiary', swap: { bushes: ['Bush_1'], plants: { clover: ['Flowers', 'Flower_4'], mossrock: ['Rock_3'] } }, models: [['CommonTree_3', -8.4, 2.6, 3.8], ['Bush_1', 8.3, 1.9, 1.2]],
      trees: { L: { leaf: ['a-leaf', 'stage-deep', 0.3], fruit: 'a-plum' }, R: { leaf: ['a-leaf', 'a-fish', 0.2], fruit: 'a-red' } }, leaf: ['a-leaf', 'a-steel', 0.25],
      bushes: [[-8.1, -0.2, 0.8], [8.2, -3.6, 0.8], [-5.2, -4.9, 0.75], [5.4, -4.9, 0.75]], bushTone: 'stage-deep',
      plants: [['clover', -4.9, 2.9, 0.8], ['clover', 2.6, 3.0, 0.8], ['clover', -8.0, 2.0, 0.7], ['clover', 8.2, 0.9, 0.7], ['mossrock', -1.2, 3.2, 0.5]] },
    look:   { kind: 'rainPavilion' }
  },
  /* 방법 일곱 칸 — 이 방이 고른 부품: 글자 그릇 둘(누비이불 조각 · 웅덩이 파문) · 쓰는 것(수수께끼 판에 깃펜) · 챈트 몸짓(손으로 오리 부리) */
  how: { carrier: { L: { kind: 'quiltpatch', tone: 'a-plum', at: [1.0, -1.4] }, R: { kind: 'ripple', at: [5.0, -0.6] } }, pen: { kind: 'quill' }, body: { kind: 'quack' } },
  beat: { wave: 'sine', vol: 0.1, notes: [[1760, 0, 0.04], [1174, 0.05, 0.06]] },              /* 빗방울이 지붕을 톡 */
  words: {
    queen: { make: 'person', o: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-plum', buns: true, pants: 'a-plum', shoe: 'a-gold' }, crown: 'a-gold', cape: 'surface', capeMap: quiltTex, scale: 0.85, at: [0.4, -3.2], y: 0.22 },
    quilt: { make: 'quilt', rot: 0.3 },
    quiz:  { make: 'quizBoard', rot: 0.35 },
    quack: { make: 'bird', o: { body: 'a-cream', wing: ['a-cream', 'a-gold', 0.4], beak: 'warm', flat: true, swim: true }, y: 0.04 },
    red:   { make: 'boots', o: { tone: 'a-red' } },
    rain:  { make: 'rainCloud', o: { y: 3.9 } },
    ring:  { make: 'ring' },
    robot: { make: 'robot', rot: -0.4 }
  },
  decor(K, glade, PR, things, land){ const p = PR.pavilion(K); p.position.set(0.4, 0, -3.4); glade.add(p); const dk = things.quack ? things.quack.position : { x: 3.5, z: -3.0 }, pd = PR.pond(K, [dk.x, dk.z], 0.8); glade.add(pd);
    const bow = PR.rainbow(K); glade.add(bow); return { pavilion: p, bow, life: (t, dt) => { p.userData.life(t, dt); } }; },      /* 비는 터가 내린다(하늘 칸의 날씨) — 여기는 정자 · 오리의 웅덩이 · 비 갠 뒤의 무지개 */
  /* 여왕의 수수께끼 — 낱말마다 오리가 웅덩이에서 나와 판 쪽으로 한 걸음씩 */
  stage: { rainbeat: { actor: 'rain' }, riddle: { actor: 'quiz', walker: 'quack', from: [1.6, -1.4], to: [-1.9, -0.6] }, ringwalk: { actor: 'robot' }, leafboats: { actor: 'quack' } },
  onEvent(id, c){ const d = c.decor, rain = c.land && c.land.weather && c.land.weather.rain;
    if (id === 'ringwalk') { if (rain) rain.stop(); if (d.bow && d.bow.userData.show) d.bow.userData.show(); if (d.pavilion) { d.pavilion.userData.wet = false; d.pavilion.userData.chime.visible = true; } if (c.things.rain) c.things.rain.userData.rain = false; } },      /* 반지가 닿으면 비가 그치고 무지개 · 처마에 풍경 */
  /* 얼굴 놀이 「여왕의 수수께끼」(고르기 뼈대 + 두드리기) — 수수께끼 판의 덮개 셋이 닫혀 있다. 들린 그림을 똑똑 두드려 고를 때마다 덮개가 하나씩 열리고, 다 열리면 여왕이 손뼉을 친다 */
  sig: { event: 'riddle', tip: '들리는 그림을 똑똑 두 번 두드려 봐 — 덮개가 열려',
    eye: c => c.things.quiz,
    start(c){ c.st.n = 0; c.things.quiz.userData.open(0); },
    async ok(c, x, i, n){ const q = c.things.quiz, f = q.userData.flaps, k = Math.min(f.length - 1, c.st.n++ % f.length); c.sfx(c.BEAT);
      if (k === 0 && c.st.n > 1) q.userData.open(0);                                                       /* 셋이 다 열렸으면 다시 덮고 */
      await c.tween(420, t => { f[k].rotation.x = -2.4 * t; }, t => 1 - Math.pow(1 - t, 3)); c.burstAt(q, 1.5, 8, ['a-gold', 'a-pink', 'surface']);
      if (i === n - 1) { c.hop(c.things.queen, 0.35, 500); c.mood(c.me, 'happy', 900); await c.wait(300); } },
    end(c){ c.things.quiz.userData.open(3); } }
};
