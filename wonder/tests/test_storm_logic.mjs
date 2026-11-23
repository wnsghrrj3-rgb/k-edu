import assert from 'node:assert/strict';
import { createStorm, beginMission, setHandles, stepStorm, sayFor, shearOf, steerOf, hailName, MISSIONS, WHY, SAYS, FARM, MILL, GOLF } from '../storm/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const DEG = Math.PI / 180;
const W = (h, seed = 5) => setHandles(createStorm({ seed }), h);
/** dt 마다 sayFor 를 불러 보인 글을 모두 모은다 */
const watch = (S, sec, dt = 1 / 30) => { const seen = new Set(); for (let s = 0; s < sec; s += dt) { stepStorm(S, dt); seen.add(sayFor(S)); } return [...seen].join(' | '); };
const run = (h, sec, seed) => stepStorm(W(h, seed), sec);

// 설계 장면 9 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 데우기만 → 아지랑이, 구름 없음', () => {
  const S = W({ heat: 1, moist: 0 }); const said = watch(S, 20);
  assert.ok(S.haze && S.top < 1 && S.U > 0.3); assert.ok(said.includes('아지랑이') && said.includes('구름은 없어요'));
});
t('2 데우기 + 물기 조금 → 뭉게구름 몇 조각', () => {
  const S = W({ heat: 1, moist: 0.3 }); const said = watch(S, 25);
  assert.ok(S.top >= 1 && S.top < 8); assert.equal(S.stage, 'cumulus'); assert.ok(said.includes('뭉게구름'));
  assert.equal(S.strikes, 0);
});
t('3 데우기 + 물기 많이 → 탑처럼 솟아 모루, 아래가 시커멓다', () => {
  const S = W({ heat: 1, moist: 0.62 }); const said = watch(S, 25);
  assert.ok(S.top >= 8 && S.top < 10, S.top); assert.equal(S.stage, 'tower'); assert.ok(said.includes('탑처럼') && said.includes('모루'));
});
t('4 계속 키우면 구름 속이 번쩍이다 땅으로 번개, 비 기둥 — 높은 풍차에 잘 친다', () => {
  const S = W({ heat: 1, moist: 1 }); const said = watch(S, 40);
  assert.ok(S.strikes > 5 && S.flashes > S.strikes && S.rained); assert.ok(said.includes('번개가 땅으로') && said.includes('비 기둥'));
  const L = W({ heat: 1, moist: 1 }); const at = { mill: 0, car: 0, ground: 0 };
  for (let i = 0; i < 3000; i++) { const b = L.bolt; stepStorm(L, 0.1); if (L.bolt && L.bolt !== b) at[L.bolt.on]++; }
  assert.ok(at.mill / (at.mill + at.car + at.ground) > 0.25, JSON.stringify(at));    // 땅 넓이에 비해 풍차가 훨씬 자주 맞는다
  assert.ok(at.car > 0 && L.log.some(e => e.key === 'whiteout'));                       // 차량 가까이 치면 화면이 하얗게
});
t('5 더 키우면 우박(차 지붕을 때림)과 돌풍', () => {
  const S = W({ heat: 1, moist: 1 }); const said = watch(S, 30);
  assert.ok(S.hailNow > 0 && S.gust); assert.ok(said.includes('우박') && said.includes('돌풍') && said.includes('차 지붕'));
  const low = run({ heat: 1, moist: 0.62 }, 30); assert.equal(low.hailMax, 0);         // 구름이 낮으면 우박 없음
});
t('6 엇갈린 바람 → 구름 전체가 천천히 돌고 벽 구름이 처진다', () => {
  const S = W({ heat: 1, moist: 1, shear: 90 * DEG }); stepStorm(S, 14); const said = watch(S, 4);
  assert.ok(S.wall && S.rot >= 0.35); assert.ok(said.includes('천천히 돌아요') && said.includes('벽 같은 구름'));
  const calm = run({ heat: 1, moist: 1, shear: 0 }, 40); assert.ok(calm.rot === 0 && !calm.tornado && calm.tornadoes === 0);
  assert.ok(shearOf(W({ shear: 180 * DEG })) > shearOf(W({ shear: 60 * DEG })));
});
t('7 도는 구름을 계속 키우면 깔때기가 땅에 닿는다 — 토네이도', () => {
  const S = W({ heat: 1, moist: 1, shear: 120 * DEG }); let said = '';
  for (let i = 0; i < 400 && !S.tornado; i++) { stepStorm(S, 0.1); said += sayFor(S); }
  said += watch(S, 3);
  assert.ok(S.tornado || S.lastTornado); assert.ok(S.tornadoes >= 1); assert.ok(said.includes('토네이도') && said.includes('흙먼지 기둥'));
  const weak = run({ heat: 1, moist: 1, shear: 60 * DEG }, 60); assert.equal(weak.tornadoes, 0);   // 조금 엇갈리면 돌기만 한다
});
t('8 토네이도가 풍차를 지나면 풍차가 빨려 올라간다(사람·동물 없음)', () => {
  const S = W({ heat: 1, moist: 1, shear: -90 * DEG }); const said = watch(S, 45);
  assert.ok(!S.mill.standing || S.log.some(e => e.key === 'mill')); assert.ok(said.includes('풍차가 빨려 올라가요') && said.includes('사람도 동물도 없어요'));
  assert.ok(Math.abs(steerOf(S) - (-45 * DEG)) < 1e-9 && Math.abs(Math.atan2(MILL.y, MILL.x) - steerOf(S)) < 1e-9);   // 풍차는 −45° 쪽
});
t('9 데우기를 끄면 구름이 힘을 잃고 흩어지고 무지개', () => {
  const S = W({ heat: 1, moist: 1 }); stepStorm(S, 25); assert.ok(S.top > 12);
  setHandles(S, { heat: 0 }); const said = watch(S, 40);
  assert.ok(S.top < 2 && S.rainbow); assert.ok(said.includes('흩어져요') && said.includes('무지개'));
  const dry = W({ heat: 1, moist: 0.3 }); stepStorm(dry, 20); setHandles(dry, { heat: 0 }); const s2 = watch(dry, 30);
  assert.ok(s2.includes('흩어져요') && !s2.includes('무지개'));                         // 비가 안 왔으면 무지개도 없다
});
t('10 물기 없이 엇갈린 바람만 → 작은 먼지 회오리', () => {
  const S = W({ heat: 0, moist: 0, shear: 120 * DEG }); const said = watch(S, 5);
  assert.ok(S.dust > 0 && S.dust < 1 && S.top < 1 && !S.tornado); assert.ok(said.includes('먼지 회오리'));
});
t('긴장: 키운 폭풍은 손잡이를 내려도 한동안 혼자 자란다', () => {
  const S = W({ heat: 1, moist: 1 }); stepStorm(S, 6); const top0 = S.top;
  setHandles(S, { heat: 0, moist: 0 }); stepStorm(S, 1.5);
  assert.ok(S.top > top0 + 0.5, `${top0} → ${S.top}`);
  const big = W({ heat: 1, moist: 1 }); stepStorm(big, 30); setHandles(big, { heat: 0, moist: 0 }); stepStorm(big, 4); assert.ok(big.top > 10);   // 다 큰 폭풍은 한동안 버틴다
});

// 의뢰 셋
t('의뢰 1: 번개 열 번', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(run({ heat: 1, moist: 1 }, 30)));
  const low = run({ heat: 1, moist: 0.5 }, 30); assert.ok(!m.ok(low)); assert.ok(m.tell(low).includes('구름이 아직 낮아요'));
  const mid = run({ heat: 1, moist: 1 }, 12); assert.ok(!m.ok(mid)); assert.ok(m.tell(mid).includes('계속 키워요'));
});
t('의뢰 2: 골프공 우박 — 구름 꼭대기를 더 높이', () => {
  const m = MISSIONS[1];
  const top = run({ heat: 1, moist: 1 }, 30); assert.ok(m.ok(top)); assert.ok(top.hailMax >= GOLF); assert.equal(hailName(top.hailMax), '골프공');
  const almost = run({ heat: 1, moist: 0.9 }, 30); assert.ok(!m.ok(almost)); assert.ok(m.tell(almost).includes('메추리알') && m.tell(almost).includes('끝까지'));
  const none = run({ heat: 1, moist: 0.6 }, 30); assert.ok(!m.ok(none)); assert.ok(m.tell(none).includes('더 높아야'));
  // 의뢰 1 이 끝난 다 큰 폭풍에서 넘어와도 저절로 풀리지 않는다 — 새 날, 맑은 하늘에서 다시
  const S = run({ heat: 1, moist: 1 }, 30); assert.ok(S.hailNow >= GOLF); const t0 = S.t;
  beginMission(S, 1); assert.ok(S.top === 0 && S.hailMax === 0 && S.heat === 0.5 && S.moist === 0.3 && S.t === t0);
  stepStorm(S, 30); assert.ok(!m.ok(S));                                                // 손대지 않으면 안 된다
  setHandles(S, { heat: 1, moist: 1 }); stepStorm(S, 30); assert.ok(m.ok(S));            // 데우기·물기 둘 다 끝까지
});
t('의뢰 3: 토네이도를 농가에서 비켜 가게 — 모는 것이 어렵다', () => {
  const m = MISSIONS[2];
  assert.ok(Math.abs(Math.atan2(FARM.y, FARM.x) - 45 * DEG) < 1e-9);
  // 뒤집힘: 의뢰 3 에서 내려오는 토네이도는 어느 방향이든 손대지 않으면 농가에 닿는다
  const chase = (seed, th) => { const S = run({ heat: 1, moist: 1 }, 15, seed); beginMission(S, 2); setHandles(S, { shear: th * DEG }); while (!(S.tornado && S.tornado.chase)) stepStorm(S, 0.1); return S; };
  for (const [seed, th] of [[1, 90], [2, 150], [3, -100], [4, 180], [5, -170]]) {
    const S = chase(seed, th), T = S.tornado;
    assert.ok(Math.abs(T.h - Math.atan2(FARM.y, FARM.x)) < 1e-9);                      // 농가를 보고 내려온다
    while (S.tornado === T) stepStorm(S, 0.1);
    assert.ok(T.hitFarm && !m.ok(S), `${seed} ${th}`); assert.ok(m.tell(S).includes('농가에 닿았어요'));
    assert.deepEqual([S.farm.x, S.farm.y], [FARM.x, FARM.y]);                          // 농가는 그 자리 그대로
  }
  // 자유(의뢰 3 밖)에서는 억지로 농가를 보지 않는다 — 두 바람의 가운데로
  const F = W({ heat: 1, moist: 1, shear: 150 * DEG }); while (!F.tornado) stepStorm(F, 0.1); assert.ok(Math.abs(F.tornado.h - 75 * DEG) < 1e-9);
  // 다이얼을 도중에 돌려 틀면 비켜 간다(방향은 늦게 따라온다)
  const D = chase(6, 90); assert.ok(D.log.some(e => e.key === 'aim')); stepStorm(D, 1); setHandles(D, { shear: 160 * DEG }); stepStorm(D, 25);
  assert.ok(m.ok(D) && !D.log.some(e => e.key === 'farm'));
  // 의뢰 전에 내려온 토네이도는 세지 않는다
  const O = W({ heat: 1, moist: 1, shear: 150 * DEG }); while (!O.tornado) stepStorm(O, 0.1); beginMission(O, 2); const T0 = O.tornado;
  while (O.tornado === T0) stepStorm(O, 0.1); assert.ok(T0.passed === undefined && Math.hypot(O.lastTornado.x, O.lastTornado.y) > 7.5 && !m.ok(O));
  const hit = run({ heat: 1, moist: 1, shear: 90 * DEG }, 45); assert.ok(hit.farmHit && !m.ok(hit)); assert.ok(m.tell(hit).includes('농가에 닿았어요'));
  const dodge = run({ heat: 1, moist: 1, shear: 150 * DEG }, 45); assert.ok(m.ok(dodge)); assert.ok(!dodge.log.some(e => e.key === 'farm'));
  // 농가로 가던 것을 도중에 틀어도 된다(방향은 늦게 따라온다)
  const S = W({ heat: 1, moist: 1, shear: 90 * DEG }); while (!S.tornado) stepStorm(S, 0.1);
  stepStorm(S, 2); setHandles(S, { shear: 160 * DEG }); stepStorm(S, 30); assert.ok(m.ok(S) && !S.log.some(e => e.key === 'farm'));
  const none = run({ heat: 1, moist: 1 }, 30); assert.ok(!m.ok(none)); assert.ok(m.tell(none).includes('먼저 엇갈린 바람'));
});
t('까닭 셋과 결과 문구', () => {
  assert.equal(WHY.length, 3); assert.ok(WHY[0].includes('위로 올라가요') && WHY[1].includes('전기가 쌓여요') && WHY[2].includes('돌기 시작해요'));
  for (const k of ['haze', 'cumulus', 'tower', 'lightning', 'hail', 'rotate', 'tornado', 'mill', 'rainbow', 'dust']) assert.ok(SAYS[k], k);
});
t('씨앗이 같으면 결과가 같다', () => {
  const a = run({ heat: 1, moist: 1, shear: 120 * DEG }, 40, 9), b = run({ heat: 1, moist: 1, shear: 120 * DEG }, 40, 9);
  assert.equal(a.strikes, b.strikes); assert.deepEqual(a.log, b.log); assert.deepEqual(a.lastTornado?.path ?? a.tornado?.path, b.lastTornado?.path ?? b.tornado?.path);
});
console.log(n + ' 통과');
