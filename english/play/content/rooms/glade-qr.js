/* ============================================================
 * 영어 놀이터 — 방 자료: 비 오는 여왕의 뜰 q · r (한 해 길 A09 · 상세판 A09 「방 배치」 · 등록 rooms/index.js)
 *   비 — 지붕 있는 작은 정자에 누비이불을 쓴 여왕. 왼쪽(q) 여왕(가운데) · 난간의 누비이불 · 수수께끼 판 · 웅덩이의 오리(quack) /
 *   오른쪽(r) 빨간 장화 · 비구름(하늘) · 방석 위 반지 · 삐걱 로봇.
 *   그 주만의 맛: 빗줄기와 웅덩이 · 박자는 빗방울 · q 는 늘 u 와 붙어 다닌다(buddy — 열매 · 쪽지 글자 칸) · 반지가 닿으면 비가 그치고 무지개.
 * ============================================================ */
import { quiltTex } from './props.js';
export default {
  id: 'A09', light: 'afternoon', fog: 'stage-soft', wind: 1.2, buddy: { q: 'u' },
  beat: { wave: 'sine', vol: 0.1, notes: [[1760, 0, 0.04], [1174, 0.05, 0.06]] },              /* 빗방울이 지붕을 톡 */
  trees: { L: { leaf: ['a-leaf', 'a-fish', 0.3], fruit: 'a-plum' }, R: { leaf: 'a-leaf', fruit: 'a-red' } },
  ground: { creek: null },
  words: {
    queen: { make: 'person', o: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-plum', buns: true, pants: 'a-plum', shoe: 'a-gold' }, crown: 'a-gold', cape: 'surface', capeMap: quiltTex, scale: 0.85, at: [0.4, -2.55], y: 0.22 },
    quilt: { make: 'quilt', rot: 0.3 },
    quiz:  { make: 'quizBoard', rot: 0.35 },
    quack: { make: 'bird', o: { body: 'a-cream', wing: ['a-cream', 'a-gold', 0.4], beak: 'warm', flat: true, swim: true }, y: 0.04 },
    red:   { make: 'boots', o: { tone: 'a-red' } },
    rain:  { make: 'rainCloud', o: { y: 3.9 }, at: [3.0, -2.2] },
    ring:  { make: 'ring', at: [2.8, 0.7] },
    robot: { make: 'robot', rot: -0.4 }
  },
  decor(K, glade, PR){ const p = PR.pavilion(K); p.position.set(0.4, 0, -3.4); glade.add(p); const pd = PR.pond(K, [-3.2, -1.7], 0.75); glade.add(pd);
    const rn = PR.rainField(K); glade.add(rn); const bow = PR.rainbow(K); glade.add(bow);
    return { pavilion: p, rain: rn, bow, life: (t, dt) => { p.userData.life(t, dt); rn.userData.life(t, dt); } }; },
  /* 여왕의 수수께끼 — 낱말마다 오리가 웅덩이에서 나와 판 쪽으로 한 걸음씩 */
  stage: { rainbeat: { actor: 'rain' }, riddle: { actor: 'quiz', walker: 'quack', from: [-2.4, 0.5], to: [-4.5, 0.9] }, ringwalk: { actor: 'robot' }, leafboats: { actor: 'quack' } },
  onEvent(id, c){ const d = c.decor;
    if (id === 'riddle' && c.things.quiz) c.things.quiz.userData.open(3);                       /* 덮개 셋이 다 열린다 */
    if (id === 'ringwalk') { if (d.rain) d.rain.userData.stop(); if (d.bow) d.bow.userData.show(); if (d.pavilion) { d.pavilion.userData.wet = false; d.pavilion.userData.chime.visible = true; } if (c.things.rain) c.things.rain.userData.rain = false; } }      /* 비가 그치고 무지개 · 처마에 풍경 */
};
