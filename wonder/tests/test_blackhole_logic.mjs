import assert from 'node:assert/strict';
import { simulate, clockRate, stretchAt, horizon, farView, farTimeToReach, view, lensImages, MISSIONS, WHY, SAYS } from '../blackhole/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const SIDE = Math.PI / 2;

// 설계 장면 4 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 곧장 던지면 점점 빨라지며 빨려 들고, 가까울수록 늘어난다', () => {
  const r = simulate({ what: 'planet', aim: 0, power: 0.3 });
  assert.equal(r.outcome, 'plunge'); assert.ok(r.says.includes('국수'));
  const p = r.path, far = p[0], near = p[p.length - 1];
  assert.ok(near.r <= horizon(1) * 1.01);
  for (let i = 1; i < p.length; i++) assert.ok(p[i].v >= p[i - 1].v - 1e-9 && p[i].stretch >= p[i - 1].stretch - 1e-9);
  assert.ok(near.stretch > far.stretch * 5);
});
t('2 비스듬히 알맞은 세기면 둘레를 돈다', () => {
  const r = simulate({ what: 'planet', aim: SIDE, power: 0.57 });
  assert.equal(r.outcome, 'orbit'); assert.ok(r.turns >= 3);
  const rs = r.path.map(p => p.r); assert.ok(Math.max(...rs) / Math.min(...rs) < 1.2);   // 거의 둥글다
});
t('3 비스듬히 너무 약하면 나선을 그리며 원반에 섞인다', () => {
  const r = simulate({ what: 'planet', aim: 1.0, power: 0.2 });
  assert.equal(r.outcome, 'spiral'); assert.ok(r.intoDisk);
  const tail = r.path.filter(p => p.spiral); assert.ok(tail.length > 10);
  for (let i = 1; i < tail.length; i++) assert.ok(tail[i].r < tail[i - 1].r);       // 안쪽으로 감긴다
  const a0 = Math.atan2(tail[0].y, tail[0].x); let sw = 0, a = a0;
  for (const q of tail) { const b = Math.atan2(q.y, q.x); let d = b - a; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; sw += d; a = b; }
  assert.ok(Math.abs(sw) > 2 * Math.PI);                                              // 한 바퀴 넘게 돌며
});
t('4 비스듬히 아주 세면 휘었다가 반대쪽으로 튕겨 나간다', () => {
  const r = simulate({ what: 'planet', aim: 0.35, power: 1 });
  assert.equal(r.outcome, 'fling'); assert.ok(r.deflect > Math.PI / 2);
  const g = simulate({ what: 'planet', aim: 0.35, power: 0.95, shipDist: 20 }); assert.equal(g.outcome, 'fling');
  const away = simulate({ what: 'planet', aim: Math.PI, power: 1 }); assert.equal(away.outcome, 'fling'); assert.ok(away.says.includes('멀리 날아가'));   // 블랙홀 반대로 던지면 꺾였다고 하지 않는다
});
t('5 별을 가까이 지나가게 하면 찢겨 원반으로 감긴다 — 같은 길의 행성은 돈다', () => {
  const s = simulate({ what: 'star', aim: SIDE, power: 0.35 }), p = simulate({ what: 'planet', aim: SIDE, power: 0.35 });
  assert.equal(s.outcome, 'torn'); assert.ok(s.intoDisk && s.tearAt); assert.ok(s.says.includes('찢겨'));
  assert.equal(p.outcome, 'orbit');
  assert.equal(simulate({ what: 'star', aim: SIDE, power: 0.57 }).outcome, 'orbit');   // 멀리 돌면 안 찢긴다
});
t('6 시계 탐사선은 가까울수록 내 시계보다 느리다', () => {
  for (let r = 2; r < 30; r += 1) assert.ok(clockRate(r) < clockRate(r + 1));
  const o = simulate({ what: 'probe', aim: SIDE, power: 0.3 }, { maxTurns: 1 });
  assert.equal(o.outcome, 'orbit'); assert.ok(o.minClock < 0.8);
  const closest = o.path.reduce((a, b) => (b.r < a.r ? b : a)), farthest = o.path.reduce((a, b) => (b.r > a.r ? b : a));
  assert.ok(closest.clock < farthest.clock); assert.ok(Math.abs(closest.clock - o.minClock) < 0.01);
  assert.ok(o.says.includes('배 빠르기'));
});
t('7 검은 원 가장자리에서 멈춘 듯 붉어지며 흐려진다 — 끝내 들어가는 걸 못 본다', () => {
  const a = farView(3), b = farView(1.1), c = farView(1.001);
  assert.ok(a.crawl > b.crawl && b.crawl > c.crawl && c.crawl < 0.001);
  assert.ok(c.redden > b.redden && b.redden > a.redden && c.redden > 20);
  assert.ok(c.dim < b.dim && c.dim < 1e-5);
  const t1 = farTimeToReach(3, 1.01), t2 = farTimeToReach(3, 1.0001), t3 = farTimeToReach(3, 1.000001);
  assert.ok(t2 > t1 + 1 && t3 > t2 + 1);                                              // 가까이 갈수록 끝없이 늘어난다
  const p = simulate({ what: 'probe', aim: 0, power: 0.3 });
  assert.ok(p.freezes && p.says.includes('끝내 못 봐요'));
});
t('8 우주선이 다가가면 뒤 별이 더 휘고 원반 뒤쪽이 접혀 보인다', () => {
  const far = view(30), near = view(10);
  assert.ok(near.bend(0.5) > far.bend(0.5) * 2);
  assert.ok(near.shadow > far.shadow && near.fold > far.fold && near.folded);
  assert.equal(near.bend(near.shadow * 0.5), null);                                    // 검은 그림자 안은 빛이 안 온다
});
t('9 블랙홀 뒤로 별이 지나가면 하나 → 둘 → 고리', () => {
  const a = lensImages(1.0), b = lensImages(0.2), c = lensImages(0.01);
  assert.equal(a.kind, 'one'); assert.equal(b.kind, 'two'); assert.equal(c.kind, 'ring');
  assert.ok(b.images[0].at > 0 && b.images[1].at < 0);                                // 양쪽에 하나씩
  assert.ok(Math.abs(c.images[0].at - c.thetaE) < 0.05 * c.thetaE);                   // 고리 반지름 = 아인슈타인 각
});
t('10 블랙홀을 키우면 검은 원은 커지는데 가장자리의 늘어남은 순해진다', () => {
  assert.ok(horizon(4) > horizon(1));
  assert.ok(stretchAt(horizon(4), 4) < stretchAt(horizon(1), 1) / 5);
  const small = simulate({ what: 'planet', aim: 0, power: 0.3, mass: 1 }), big = simulate({ what: 'planet', aim: 0, power: 0.3, mass: 4 });
  const last = r => r.path[r.path.length - 1].stretch; assert.ok(last(big) < last(small));
});

// 의뢰 셋
t('의뢰 1: 행성 세 바퀴', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(simulate({ what: 'planet', aim: SIDE, power: 0.5 })));
  const weak = simulate({ what: 'planet', aim: 1.0, power: 0.2 }); assert.ok(!m.ok(weak)); assert.ok(m.tell(weak).includes('빨려'));
  const fast = simulate({ what: 'planet', aim: 0.35, power: 1 }); assert.ok(!m.ok(fast)); assert.ok(m.tell(fast).includes('세요'));
  assert.ok(!m.ok(simulate({ what: 'ship', aim: SIDE, power: 0.5 })));
});
t('의뢰 2: 탐사선 시계 절반 — 가까이, 그러나 궤도에', () => {
  const m = MISSIONS[1], go = p => simulate({ what: 'probe', aim: SIDE, power: p }, { maxTurns: 1 });
  const good = go(0.24); assert.ok(m.ok(good), good.minClock);
  const far = go(0.4); assert.ok(!m.ok(far)); assert.ok(m.tell(far).includes('더 가까이'));
  const fell = go(0.2); assert.ok(!m.ok(fell)); assert.ok(m.tell(fell).includes('빠져'));
});
t('의뢰 3: 숨은 별 — 휜 빛이 보이는 자리를 짚는다', () => {
  const m = MISSIONS[2], L = lensImages(0.01);
  const ringQ = { hidden: { beta: 0.01, dir: 0.7 }, tap: [0, L.thetaE] };
  assert.ok(m.ok(ringQ)); assert.ok(!m.ok({ ...ringQ, tap: [0, 0] })); assert.ok(!m.ok({ ...ringQ, tap: [0, L.thetaE * 2] }));
  const two = lensImages(0.2), dir = 1.2, q = { hidden: { beta: 0.2, dir } };
  assert.ok(m.ok({ ...q, tap: [Math.cos(dir) * two.images[1].at, Math.sin(dir) * two.images[1].at] }));   // 반대쪽 상도 맞다
  assert.ok(!m.ok({ ...q, tap: [Math.cos(dir + SIDE) * two.thetaE, Math.sin(dir + SIDE) * two.thetaE] }));
});
t('까닭 셋과 결과 문구', () => {
  assert.equal(WHY.length, 3); assert.ok(WHY[0].includes('빛도 못 나와요') && WHY[1].includes('시간도 느리게') && WHY[2].includes('늘어나요'));
  for (const k of ['plunge', 'spiral', 'orbit', 'fling', 'torn', 'freeze']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
