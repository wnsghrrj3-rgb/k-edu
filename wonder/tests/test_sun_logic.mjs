import assert from 'node:assert/strict';
import { describe, placeEarth, lineUp, flareAt, lightSeconds, clockText, cutOf, SPOTS, PROMS, EARTHS_ACROSS, EARTH_DIAM, SURFACE_TEMP, SPOT_TEMP, FLARE, MISSIONS, WHY, SAYS, km2r } from '../sun/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const LIMB = 0.5, NEAR = 0.9, FAR = 0.1;
const big = SPOTS.find(s => s.km >= EARTH_DIAM), small = SPOTS.find(s => s.km < EARTH_DIAM), P = PROMS[0];
const promSide = { x: Math.cos(P.angle) * 1.05, y: Math.sin(P.angle) * 1.05 };       // 불기둥 아래쪽 바로 옆

// 설계 장면 5 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 색유리 없이 보면 화면이 하얗게 날아간다(가리개 필요)', () => {
  for (const d of [FAR, LIMB, NEAR]) {
    const r = describe({ filter: 'none', dist: d });
    assert.ok(r.glare); assert.ok(!r.shows.spots && !r.shows.proms && !r.shows.loops && !r.temps);
    assert.ok(r.says.includes('하얗게 날아가요') && r.says.includes('가리개'));
  }
});
t('2 보통 빛: 노란 공, 검은 점들(흑점)', () => {
  const r = describe({ filter: 'visible', dist: LIMB });
  assert.ok(r.shows.spots && !r.shows.granules && !r.shows.loops);
  assert.ok(r.says.includes('노란 공') && r.says.includes('흑점'));
});
t('3 붉은 빛: 꿈틀거리는 쌀알 무늬, 가장자리의 붉은 불기둥', () => {
  const r = describe({ filter: 'red', dist: LIMB });
  assert.ok(r.shows.granules && r.shows.proms);
  assert.ok(r.says.includes('쌀알 무늬') && r.says.includes('붉은 불기둥'));
});
t('4 자외선: 고리 모양으로 솟아 되돌아오는 빛의 다리들', () => {
  const r = describe({ filter: 'uv', dist: LIMB });
  assert.ok(r.shows.loops && !r.shows.spots);
  assert.ok(r.says.includes('빛의 다리'));
  assert.ok(!describe({ filter: 'uv', dist: FAR }).shows.loops);                          // 멀리서는 안 보인다
});
t('5 지구를 불기둥 옆에 대면 불기둥 하나가 지구 여러 개 높이', () => {
  const on = placeEarth(promSide, 'limb');
  assert.equal(on.kind, 'prom'); assert.ok(on.earths >= 5);
  assert.equal(on.earths, Math.round(P.km / EARTH_DIAM));
  const r = describe({ filter: 'red', dist: LIMB, earth: promSide });
  assert.ok(r.says.includes(`불기둥 하나가 지구 ${on.earths}개 높이`));
  assert.ok(!describe({ filter: 'visible', dist: LIMB, earth: promSide }).says.includes('높이예요'));   // 불기둥은 붉은 빛에서
});
t('6 지구를 흑점 위에 대면 흑점 하나에 지구가 쏙 들어간다', () => {
  const on = placeEarth(big, 'surface');
  assert.equal(on.kind, 'spot'); assert.ok(on.fits && on.earths > 2);
  assert.ok(km2r(big.km) > 2 * (1 / EARTHS_ACROSS));                                       // 흑점 지름 > 지구 지름
  const r = describe({ filter: 'visible', dist: NEAR, earth: { x: big.x, y: big.y } });
  assert.ok(r.says.includes('흑점 하나에 지구가 쏙 들어가요'));
  const s = describe({ filter: 'visible', dist: NEAR, earth: { x: small.x, y: small.y } });
  assert.ok(s.says.includes('지구보다 작아요'));
});
t('7 지구를 한 줄로 늘어놓으면 태양 지름에 109개', () => {
  assert.ok(Math.abs(EARTHS_ACROSS - 109.3) < 0.05);
  const L = lineUp({ x: -1.2, y: 0.02 }, { x: 1.2, y: -0.01 });
  assert.ok(L.diameter); assert.equal(L.count, 109);
  const r = describe({ filter: 'visible', dist: LIMB, line: L });
  assert.ok(r.says.includes('태양 지름에 지구가 109개'));
  const half = lineUp({ x: -1.2, y: 0 }, { x: 0, y: 0 }); assert.ok(!half.spans && half.count > 50 && half.count < 56);
  const chord = lineUp({ x: -1.2, y: 0.6 }, { x: 1.2, y: 0.6 }); assert.ok(chord.spans && !chord.through && chord.count < 90);
});
t('8 흑점에 다가가면 주변보다 어두울 뿐 여전히 뜨겁다(5,500도 / 4,000도)', () => {
  const r = describe({ filter: 'visible', dist: NEAR });
  assert.equal(r.cut, 'surface'); assert.deepEqual(r.temps, { surface: 5500, spot: 4000 });
  assert.ok(SPOT_TEMP < SURFACE_TEMP && SPOT_TEMP > 3000);
  assert.ok(r.says.includes('여전히 눈부시게 뜨거워요') && r.says.includes('5,500도') && r.says.includes('4,000도'));
  assert.equal(describe({ filter: 'visible', dist: LIMB }).temps, null);
});
t('9 꼬인 빛의 다리를 기다리면 툭 끊어지며 폭발 — 알갱이 구름 → 오로라', () => {
  const a = flareAt(1), b = flareAt(4), c = flareAt(FLARE.build + 0.5), d = flareAt(FLARE.build + FLARE.burst + 1);
  assert.equal(a.phase, 'build'); assert.ok(b.twist > a.twist);
  assert.equal(c.phase, 'flare'); assert.ok(c.toEarth);
  assert.equal(d.phase, 'after');
  const r = describe({ filter: 'uv', dist: LIMB, watch: FLARE.build + 0.5 });
  assert.ok(r.says.includes('툭 끊어지며 폭발') && r.says.includes('알갱이 구름') && r.says.includes('오로라'));
  assert.ok(describe({ filter: 'uv', dist: LIMB, watch: 2 }).says.includes('꼬여요'));
});
t('10 표면에서 빛 한 줄기를 쏘면 지구까지 8분 20초', () => {
  assert.ok(Math.abs(lightSeconds() - 500) < 1); assert.equal(clockText(lightSeconds()), '8분 20초');
  assert.ok(describe({ filter: 'visible', dist: FAR, light: 600 }).says.includes('지구까지 가는 시간: 8분 20초'));
  assert.ok(describe({ filter: 'visible', dist: FAR, light: 100 }).says.includes('가는 중… 1분 40초'));
});

// 의뢰 셋
t('의뢰 1: 지구가 들어가는 흑점', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(describe({ filter: 'visible', dist: NEAR, earth: { x: big.x, y: big.y } })));
  const sm = describe({ filter: 'visible', dist: NEAR, earth: { x: small.x, y: small.y } }); assert.ok(!m.ok(sm)); assert.ok(m.tell(sm).includes('더 큰 흑점'));
  const wh = describe({ filter: 'none', dist: NEAR, earth: { x: big.x, y: big.y } }); assert.ok(!m.ok(wh)); assert.ok(m.tell(wh).includes('색유리'));
  const off = describe({ filter: 'visible', dist: NEAR, earth: { x: 0.3, y: -0.4 } }); assert.ok(!m.ok(off)); assert.ok(m.tell(off).includes('흑점) 바로 위'));
});
t('의뢰 2: 폭발의 순간을 찍는다 — 자외선으로, 기다렸다가', () => {
  const m = MISSIONS[1], at = w => describe({ filter: 'uv', dist: LIMB, watch: w });
  assert.ok(m.ok(at(FLARE.build + 1)));
  const early = at(2); assert.ok(!m.ok(early)); assert.ok(m.tell(early).includes('아직 안 터졌어요'));
  const late = at(FLARE.build + FLARE.burst + 1); assert.ok(!m.ok(late)); assert.ok(m.tell(late).includes('지나갔어요'));
  const vis = describe({ filter: 'visible', dist: LIMB, watch: FLARE.build + 1 }); assert.ok(!m.ok(vis)); assert.ok(m.tell(vis).includes('자외선'));
});
t('의뢰 3: 지구 몇 개 — 지름을 따라 끝에서 끝까지', () => {
  const m = MISSIONS[2], at = (p0, p1) => describe({ filter: 'visible', dist: LIMB, line: lineUp(p0, p1) });
  assert.ok(m.ok(at({ x: 0.03, y: 1.1 }, { x: -0.02, y: -1.1 })));
  const half = at({ x: -1.1, y: 0 }, { x: 0.2, y: 0 }); assert.ok(!m.ok(half)); assert.ok(m.tell(half).includes('끝에서 끝까지'));
  const chord = at({ x: -1.2, y: 0.6 }, { x: 1.2, y: 0.6 }); assert.ok(!m.ok(chord)); assert.ok(m.tell(chord).includes('가운데를 지나야'));
  const none = describe({ filter: 'visible', dist: LIMB }); assert.ok(!m.ok(none)); assert.ok(m.tell(none).includes('지구 줄'));
  const close = describe({ filter: 'visible', dist: NEAR, line: lineUp({ x: -0.2, y: 0 }, { x: 0.2, y: 0 }) }); assert.ok(!m.ok(close)); assert.ok(m.tell(close).includes('거리 레버를 가장자리로'));
});
t('까닭 둘과 결과 문구', () => {
  assert.equal(WHY.length, 2);
  assert.equal(WHY[0], '태양은 불타는 게 아니라 속에서 작은 알갱이들이 합쳐지며 빛을 내요. 땅이 없고 전부 뜨거운 기체예요.');
  assert.equal(WHY[1], '흑점은 식은 게 아니라 둘레보다 덜 뜨거워서 어둡게 보일 뿐이에요.');
  for (const k of ['none', 'visible', 'red', 'uv', 'far', 'spotNear', 'line109', 'flare']) assert.ok(SAYS[k]);
  for (const m of MISSIONS) assert.ok(m.id && m.say && m.hint && WHY[m.why]);
  assert.equal(cutOf(0), 'far'); assert.equal(cutOf(0.5), 'limb'); assert.equal(cutOf(1), 'surface');
});
console.log(n + ' 통과');
