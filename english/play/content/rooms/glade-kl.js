/* ============================================================
 * 영어 놀이터 — 방 자료: 연 날리는 언덕 k · l (한 해 길 A06 · 상세판 A06 「방 배치」 · 등록 rooms/index.js)
 *   높은 등성이 위 잠긴 성문 · 문 옆 바위 얼굴이 입술을 모아 바람을 후 분다(민들레 씨). 뒤 줄(k) 나무에 걸린 연 · 발 구르는 임금님 · 연줄의 열쇠 · 공 /
 *   앞 줄(l) 내 다리(몸 낱말) · 바위 얼굴의 입술(가운데) · 기둥 등 · 갈기 날리는 사자.
 *   그 주만의 맛: 센 바람 · 박자는 연줄 튕기는 소리 · 손님 차례에 c 와 k 가 쌍둥이로(같은 소리).
 * ============================================================ */
export default {
  id: 'A06',
  /* 무대 여섯 칸 — 돌 단이 둘 올라가는 등성이 · 돌 포장과 틈새 풀 · 성벽과 탑 · 맑고 높은 파란 하늘과 연 · 깃대처럼 곧은 나무 · 돌 회색 위의 빨간 연 */
  place: {
    land:   { kind: 'ridge' },
    floor:  { kind: 'paving' },
    back:   { kind: 'castleWall' },
    sky:    { kind: 'highBlue' },
    around: { kind: 'pole', swap: { rocks: ['Rock_1', 'Rock_5'], bushes: ['Bush_2'], plants: { clover: ['Grass'] } }, models: [['PineTree_1', -8.1, 1.7, 4.4], ['PineTree_1', 8.2, -0.1, 3.8]],
      trees: { L: { leaf: 'a-leaf', fruit: 'a-red' }, R: { leaf: ['a-leaf', 'a-gold', 0.25], fruit: 'a-gold' } }, leaf: ['a-leaf', 'stage-deep', 0.2],
      rocks: [[-7.9, -0.7, 0.42], [7.9, -1.7, 0.4], [-7.5, 4.2, 0.34], [8.0, 2.5, 0.38]], bushes: [[-8.0, 3.2, 0.75], [1.0, -5.0, 0.7]], bushTone: 'a-leaf',
      plants: [['clover', -1.6, 3.2, 0.8], ['clover', 2.6, 2.7, 0.8], ['clover', -5.0, 2.9, 0.7]] },
    look:   { kind: 'redKite' }
  },
  /* 방법 일곱 칸 — 이 방이 고른 부품: 글자 그릇 둘(연 꼬리 리본 · 등불 갓) · 쓰는 것(리본에 붓) · 챈트 몸짓(한 발로 툭 차기) */
  how: { carrier: { L: { kind: 'ribbon', tone: 'a-red', at: [-3.3, -4.2] }, R: { kind: 'lampshade', tone: 'a-gold', at: [-0.2, 2.6] } },      /* 리본은 윗단 성벽 앞 · 등불 갓은 맨 앞(사람에 가리지 않는 자리) */
  pen: { kind: 'brush' }, body: { kind: 'kick' } },
  beat: { wave: 'triangle', vol: 0.12, notes: [[880, 0, 0.05], [1320, 0.02, 0.09]] },          /* 연줄 튕기는 소리 */
  words: {
    kite: { make: 'kite', o: { tone: 'a-red' }, at: [-6.9, -4.0], y: 4.3 },      /* 깃대 나무 꼭대기에 걸렸다 */
    king: { make: 'person', o: { skin: 'skin-1', hair: 'hair-1', shirt: 'a-plum', pants: 'ink-2', shoe: 'a-gold' }, crown: 'a-gold', cape: 'a-red', scale: 0.78, rot: -0.5 },
    key:  { make: 'key', o: { y: 1.5, string: 1.9, lean: 0.25 } },
    kick: { make: 'kickBall' },
    leg:  { make: 'me', mood: 'kick' },
    lip:  { make: 'rockFace', at: [1.7, -3.6] },
    lamp: { make: 'lampPost' },
    lion: { make: 'animal', o: { body: 'a-gold', belly: 'a-cream', ear: 'round', tail: 'thin', mane: 'warm', scale: 1.05, wag: 2 } }
  },
  decor(K, glade, PR, things, land){ const g = PR.gate(K); g.position.set(-1.0, land ? land.heightAt(-1.0, -4.3) : 0, -4.3); glade.add(g); const s = PR.seeds(K, [1.7, 0.9 + (land ? land.heightAt(1.7, -3.6) : 0), -2.8]); glade.add(s); return { gate: g, life: s.userData.life }; },
  /* 연줄의 열쇠 — 낱말마다 사자가 한 걸음씩 열쇠 쪽으로 */
  stage: { stuck: { actor: 'kite' }, keyjump: { actor: 'key', walker: 'lion', from: [-5.4, 1.5], to: [-3.9, -1.1] }, lanterns: { actor: 'lamp' }, puff: { actor: 'lip' } },
  onEvent(id, c){ if (id === 'lanterns' && c.decor.gate && c.decor.gate.userData.lampOn) c.decor.gate.userData.lampOn(); },      /* 등불 행렬 뒤 — 성문 위에 등 */
  /* 얼굴 놀이 「연줄의 열쇠」(고르기 뼈대 + 당기기) — 열쇠가 연줄 높이 올라가 있다. 들린 그림 방울을 아래로 당길 때마다 줄이 한 뼘 내려오고, 끝에 열쇠가 손에 닿는다 */
  sig: { event: 'keyjump', tip: '들리는 그림을 아래로 쭉 당겨 봐 — 연줄이 한 뼘 내려와',
    eye: c => c.things.key,
    start(c){ const k = c.things.key; c.st.y0 = k.position.y; c.st.up = 1.7; c.st.n = 0; return c.tween(600, t => { k.position.y = c.st.y0 + c.st.up * t; }); },
    progress(c, drop, k){ c.things.key.rotation.z = Math.sin(k * 9) * 0.12 * k; },      /* 당기는 동안 열쇠가 달랑거린다 */
    async ok(c, x, i, n){ const k = c.things.key, fr = k.position.y, to = c.st.y0 + c.st.up * (1 - (i + 1) / n); c.sfx(c.BEAT); k.rotation.z = 0;
      await c.tween(520, t => { k.position.y = fr + (to - fr) * t + Math.sin(t * Math.PI) * 0.12; k.rotation.y = t * Math.PI * 2; }, t => t * t * (3 - 2 * t)); c.burstAt(k, 1.2, 8, ['a-gold', 'surface', 'warm-soft']);
      if (i === n - 1) { c.hop(c.things.lion, 0.5, 500); c.hop(c.things.king, 0.4, 500); await c.wait(350); } },      /* 다 내려오면 사자와 임금님이 폴짝 */
    end(c){ const k = c.things.key; if (c.st.y0 != null) k.position.y = c.st.y0; k.rotation.z = 0; k.rotation.y = 0; } }
};
