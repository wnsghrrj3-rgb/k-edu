// 케이모션 과학실 — 동사 판정 시험 (node kmotion/lab/tests/test_hands.js)
import assert from 'node:assert/strict';
import { pickNearest, snapSlot, makeTilt, makeStrike, makePump, wrapDeg, lostAction, inZone, BODY_ZONE, followK } from '../core/hands.js';

let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ✓', name); };

t('집기: 반경(화면 높이 9%) 안의 가장 가까운 물체를 고른다', () => {
  const c = [{ id: 'a', x: .50, y: .50 }, { id: 'b', x: .53, y: .50 }];
  assert.equal(pickNearest({ x: .535, y: .5 }, c).id, 'b');
  assert.equal(pickNearest({ x: .9, y: .9 }, c), null);
});
t('놓기: 차 있는 자리는 건너뛰고 빈 자리에 내려앉는다', () => {
  const s = [{ id: 'bench_a', x: .4, y: .7, free: false }, { id: 'bench_b', x: .46, y: .7 }];
  assert.equal(snapSlot({ x: .41, y: .7 }, s).id, 'bench_b');
});
t('붓기: ±8° 떨림은 0, 25° 넘어야 흐르고 18° 밑에서 멈춘다', () => {
  const k = makeTilt();
  assert.equal(k.update(6).angle, 0);
  assert.equal(k.update(22).flowing, false);
  assert.equal(k.update(26).flowing, true);
  assert.equal(k.update(20).flowing, true, '18~25 사이는 그대로 흐름(오르내림 방지)');
  assert.equal(k.update(17).flowing, false);
});
t('붓기: 더 기울이면 더 많이 나온다', () => {
  const k = makeTilt(); k.update(30); const a = k.update(30).flow, b = k.update(70).flow; assert.ok(b > a);
});
t('붓기: 반대로 기울이면 반대쪽으로 흐른다', () => { const k = makeTilt(); assert.equal(k.update(-40).dir, -1); });
const swing = (peak) => { const s = makeStrike(); let out = null, y = .3; for (let ms = 0; ms <= 600; ms += 16) { const v = ms < 200 ? peak : 0; y += v * .016; const r = s.update(ms, y); if (r) out = r; } return out; };
t('내리치기: 세기 셋이 구별된다(톡·탁·쾅)', () => {
  assert.equal(swing(1.1).level, 1); assert.equal(swing(2.0).level, 2); assert.equal(swing(3.4).level, 3);
});
t('내리치기: 천천히 내리면 치기가 아니다', () => { assert.equal(swing(.5), null); });
t('내리치기: 한 번 휘두르면 한 번만 친다', () => {
  const s = makeStrike(); let hits = 0, y = .3; for (let ms = 0; ms <= 700; ms += 16) { y += (ms < 220 ? 3 : 0) * .016; if (s.update(ms, y)) hits++; } assert.equal(hits, 1);
});
t('펌프질: 위아래 다섯 번 = 다섯 칸, 폭이 작아도 인정', () => {
  const p = makePump(); let c = 0; for (let i = 0; i < 5; i++) { for (let k = 0; k <= 10; k++) c += p.update(.5 + k * .005) ? 1 : 0; for (let k = 10; k >= 0; k--) c += p.update(.5 + k * .005) ? 1 : 0; }
  assert.equal(c, 5);
});
t('펌프질: 손 떨림(아주 작은 흔들림)은 세지 않는다', () => {
  const p = makePump(); let c = 0; for (let i = 0; i < 40; i++) c += p.update(.5 + (i % 2) * .008) ? 1 : 0; assert.equal(c, 0);
});
t('손 놓침: 0.4초는 공중에 머물고 그 뒤 제자리로', () => { assert.equal(lostAction(200), 'hold'); assert.equal(lostAction(600), 'return'); });
t('쓰기: 「내 몸」 자리는 화면 아래 가운데', () => { assert.ok(inZone({ x: .5, y: .9 }, BODY_ZONE)); assert.ok(!inZone({ x: .1, y: .9 }, BODY_ZONE)); });
t('각도 감기: 350° − 10° = −20°', () => { assert.equal(wrapDeg(350 - 10), -20); assert.equal(wrapDeg(10 - 350), 20); });
t('무게감: 무거운 통일수록 늦게 따라온다', () => { assert.ok(followK(1 / 30, 1.8) < followK(1 / 30, .6)); });
console.log(`hands: ${n} 통과`);
