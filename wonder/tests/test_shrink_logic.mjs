import assert from 'node:assert/strict';
import { view, blend, stageAt, ruler, field, velcro, tardiStep, tardiNew, tardiSays, OBJECTS, DESK, SAYS, MISSIONS, WHY, Z_MAX, Z_MAX_FREE, TARDI_Z, sheen } from '../shrink/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const L = { light: true };
/** z 를 0 부터 끝까지 끊김 없이 돌리며 보이는 글 차례를 모은다 */
const dive = (obj, opts = L) => { const seen = []; for (let z = 0; z <= Z_MAX_FREE + 1e-9; z += 0.01) { const v = view(obj, z, { ...opts, free: true }); if (seen[seen.length - 1] !== v.find) seen.push(v.find); } return seen; };
const inOrder = (seen, words) => { let i = 0; for (const s of seen) if (i < words.length && s.includes(words[i])) i++; return i === words.length; };

// 설계 장면 11 「들어간 곳 → 줄어들수록 보이는 것」 — 한 줄에 시험 하나
t('1 나비 날개: 파란 면 → 기왓장처럼 겹친 비늘 → 가는 골. 비늘을 뒤집으면 갈색 — 파랑은 물감이 아니다', () => {
  assert.ok(inOrder(dive('butterfly'), ['파란 면', '기왓장처럼 겹친 비늘', '가는 골']));
  const v = view('butterfly', 2.6, { light: true, flipped: true }); assert.ok(v.flipped); assert.ok(v.says.includes('갈색') && v.says.includes('물감이 아니에요'));
  assert.ok(!view('butterfly', 1.2, { light: true, flipped: true }).flipped);           // 비늘이 안 보이면 못 뒤집는다
  assert.ok(view('butterfly', 1.2, { light: true, lightA: 1.0 }).says.includes('보랏빛'));  // 비추는 각에 따라 색이 흐른다(구조색)
  assert.ok(sheen(0) < sheen(1));
});
t('2 소금 알갱이: 흰 가루 → 하나하나가 유리 주사위', () => {
  assert.ok(inOrder(dive('salt'), ['흰 가루', '유리 주사위']));
  assert.equal(view('salt', 2.2, L).key, '유리 주사위');
});
t('3 이끼의 물방울: 초록 덩어리 → 이끼 잎 숲 → 물곰(다리 여덟) + 짚신벌레', () => {
  const seen = dive('moss'); assert.ok(inOrder(seen, ['초록 덩어리', '이끼 잎', '물곰']));
  const v = view('moss', 2.6, L); assert.ok(v.find.includes('다리가 여덟') && v.find.includes('짚신벌레'));
  assert.ok(OBJECTS.moss.stages[3].size < 0.5);                                           // 물곰은 깨알(약 1mm)보다 작다
});
t('4 벨크로: 까슬한 면 → 갈고리 숲과 고리 숲. 붙였다 떼면 걸렸다 풀린다', () => {
  assert.ok(inOrder(dive('velcro'), ['까슬한 면', '갈고리 숲과 고리 숲']));
  const a = velcro('apart', stageAt('velcro', 1.6)); assert.equal(a.state, 'stuck'); assert.ok(a.says.includes('걸렸어요'));
  const b = velcro(a.state, 2); assert.equal(b.state, 'apart'); assert.ok(b.says.includes('풀려요'));
  assert.ok(velcro('apart', 0).says.includes('작아져서'));                               // 멀리서는 까닭이 안 보인다
});
t('5 머리카락: 한 올 → 밧줄 굵기 → 겉이 비늘로 덮인 기둥', () => { assert.ok(inOrder(dive('hair'), ['한 올', '밧줄', '비늘로 덮인 기둥'])); });
t('6 연필 글씨: 검은 선 → 종이 섬유 사이에 낀 반짝이는 검은 조각들', () => { assert.ok(inOrder(dive('pencil'), ['검은 선', '섬유', '반짝이는 검은 조각'])); });
t('7 모래 한 줌: 다 같은 모래 → 알마다 다른 보석 더미, 사이에 작은 조개 조각', () => { assert.ok(inOrder(dive('sand'), ['다 같은 모래', '색과 모양이 다른 보석', '조개 조각'])); });
t('8 꽃가루(자유): 노란 가루 → 가시 돋친 공들', () => {
  assert.ok(OBJECTS.pollen.free); assert.ok(inOrder(dive('pollen'), ['노란 가루', '가시 돋친 공']));
});
t('9 물곰을 말린다(자유): 통처럼 오그라들어 멈춘다. 물을 주면 다시 걷는다', () => {
  let s = tardiNew(); assert.ok(tardiSays(s).includes('걸어요'));
  s = { ...s, wet: false }; s = tardiStep(s, 1); assert.equal(s.form, 'walk'); assert.ok(tardiSays(s).includes('말라'));
  for (let i = 0; i < 10; i++) s = tardiStep(s, 0.5);
  assert.equal(s.form, 'tun'); assert.ok(tardiSays(s).includes('통처럼 오그라들어 멈췄어요'));
  for (let i = 0; i < 40; i++) s = tardiStep(s, 0.5); assert.equal(s.form, 'tun');           // 말라 있는 동안은 오래 멈춰 있다(죽지 않는다)
  s = { ...s, wet: true }; s = tardiStep(s, 0.5); assert.equal(s.form, 'waking'); assert.ok(tardiSays(s).includes('부풀어'));
  for (let i = 0; i < 8; i++) s = tardiStep(s, 0.5);
  assert.equal(s.form, 'walk'); assert.ok(tardiSays(s).includes('다시 걸어요'));
});
t('끊김 없는 확대: 단계 사이가 겹치며 이어진다 · 크기 자 · 도감 스물넷', () => {
  for (const obj of DESK) {
    let prev = null;
    for (let z = 0; z <= Z_MAX_FREE; z += 0.005) {
      const b = blend(obj, z), sum = b.reduce((a, q) => a + q.a, 0); assert.ok(Math.abs(sum - 1) < 1e-9, obj + ' ' + z);
      const w = OBJECTS[obj].stages.map((_, i) => (b.find(q => q.i === i) || { a: 0 }).a);
      if (prev) assert.ok(w.every((a, i) => Math.abs(a - prev[i]) <= 0.025), `${obj} 이 ${z.toFixed(3)} 에서 뚝 끊김`);
      prev = w;
    }
    assert.ok(blend(obj, OBJECTS[obj].stages[2].z).length === 2);                          // 문턱에서는 두 단계가 겹쳐 보인다
  }
  assert.equal(ruler(0).name, '연필'); assert.equal(ruler(1.2).name, '쌀알'); assert.equal(ruler(3).name, '머리카락 굵기'); assert.equal(ruler(5).name, '머리카락 굵기의 백 분의 일');
  assert.ok(Math.abs(field(1) - 20) < 1e-9 && Math.abs(field(3) - 0.2) < 1e-9);
  const finds = DESK.flatMap(o => OBJECTS[o].stages.slice(1).map(s => s.key)); assert.equal(finds.length, 24); assert.equal(new Set(finds).size, 24);
  assert.ok(view('salt', 2.5, { light: false }).dark && view('salt', 2.5, { light: false }).says === SAYS.dark);   // 작아지면 손전등이 필요
  assert.ok(!view('salt', 1.5, { light: false }).dark);
  assert.equal(view('salt', 9, L).z, Z_MAX); assert.ok(view('salt', 5.2, { light: true, free: true }).deep);
});

// 의뢰 셋
t('의뢰 1: 물곰 사진', () => {
  const m = MISSIONS[0], ok = { obj: 'moss', z: 2.6, light: true, photo: true };
  assert.ok(m.ok(ok));
  assert.ok(!m.ok({ ...ok, obj: 'salt' })); assert.ok(m.tell({ ...ok, obj: 'salt' }).includes('이끼'));
  assert.ok(!m.ok({ ...ok, z: 1.5 })); assert.ok(m.tell({ ...ok, z: 1.5 }).includes('더 작아져요'));
  assert.ok(!m.ok({ ...ok, z: 4 })); assert.ok(m.tell({ ...ok, z: 4 }).includes('너무 가까워요'));
  assert.ok(!m.ok({ ...ok, light: false })); assert.ok(m.tell({ ...ok, light: false }).includes('손전등'));
  assert.ok(TARDI_Z[0] === OBJECTS.moss.stages[3].z);
});
t('의뢰 2: 파랑은 물감이 아니다 — 비늘을 뒤집어 본다', () => {
  const m = MISSIONS[1], ok = { obj: 'butterfly', z: 2.6, light: true, flipped: true };
  assert.ok(m.ok(ok));
  assert.ok(!m.ok({ ...ok, flipped: false })); assert.ok(m.tell({ ...ok, flipped: false }).includes('뒤집어'));
  assert.ok(!m.ok({ ...ok, z: 1 })); assert.ok(m.tell({ ...ok, z: 1 }).includes('작아져요'));
  assert.ok(m.tell({ ...ok, obj: 'moss' }).includes('나비'));
});
t('의뢰 3: 주사위 모양 — 만든 게 아니라 소금', () => {
  const m = MISSIONS[2], ok = { obj: 'salt', z: 2.3, light: true, photo: true };
  assert.ok(m.ok(ok));
  assert.ok(!m.ok({ ...ok, obj: 'sand' })); assert.ok(m.tell({ ...ok, obj: 'sand' }).includes('제각각'));
  assert.ok(!m.ok({ ...ok, z: 1 })); assert.ok(m.tell({ ...ok, z: 1 }).includes('가루'));
  assert.ok(!m.ok({ ...ok, obj: 'hair' })); assert.ok(m.tell({ ...ok, obj: 'hair' }).includes('흰 가루'));
});
t('까닭 둘', () => {
  assert.equal(WHY.length, 2);
  assert.equal(WHY[0], '나비의 파랑은 물감이 아니에요. 비늘에 난 아주 가는 골이 빛을 튕겨 파랗게 보이게 해요.');
  assert.equal(WHY[1], '물곰은 다 자라도 깨알보다 작아요. 말라도, 얼어도 죽지 않고 버텨요.');
});
console.log(n + ' 통과');
