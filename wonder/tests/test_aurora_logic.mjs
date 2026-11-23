import assert from 'node:assert/strict';
import { aurora, curtain, sky, ring, korea, edgeLat, foldSpeed, MISSIONS, WHY, SAYS, ALT_DEFAULT, KOREA_LAT } from '../aurora/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };

// 설계 장면 2 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나 (고도는 따로 말 없으면 보통 = ALT_DEFAULT)
t('1 바람 약함: 지평선 가까이 희미한 초록 띠', () => {
  const r = aurora({ wind: 0.15 });
  assert.equal(r.level, 'weak'); assert.equal(r.main, 'green');
  assert.ok(r.sky.lowNorth && r.sky.reach < 25 && !r.sky.overhead);             // 북쪽 지평선 위 낮게
  assert.ok(r.sky.bright < 0.4);                                                 // 희미하다
  assert.ok(r.says.includes('지평선 가까이 희미한 초록 띠'));
});
t('2 바람 보통: 초록 커튼이 하늘을 가로질러 너울너울', () => {
  const r = aurora({ wind: 0.45 });
  assert.equal(r.level, 'medium'); assert.equal(r.main, 'green');
  assert.ok(r.sky.across && !r.sky.overhead);
  assert.ok(r.sky.reach > aurora({ wind: 0.15 }).sky.reach + 15);                // 약할 때보다 훨씬 높이 올라온다
  assert.ok(r.says.includes('초록 커튼이 하늘을 가로질러 너울너울'));
});
t('3 바람 셈: 머리 위까지, 주름이 빨라지고, 아래 가장자리에 분홍 테', () => {
  const r = aurora({ wind: 0.75 });
  assert.equal(r.level, 'strong'); assert.ok(r.sky.overhead && !r.sky.corona);
  assert.ok(foldSpeed(0.75) > foldSpeed(0.45) * 1.3);
  assert.ok(r.pinkRim && r.main === 'green' && !r.redTop);
  assert.ok(r.says.includes('머리 위까지') && r.says.includes('주름이 빨라져요') && r.says.includes('분홍 테'));
});
t('4 바람 폭풍: 하늘 전체가 덮이고 위쪽이 빨갛게, 머리 위 한 점으로 모이는 빛살(왕관)', () => {
  const r = aurora({ wind: 0.95 });
  assert.equal(r.level, 'storm'); assert.ok(r.sky.cover >= 0.9 && r.sky.inside && r.sky.corona);
  assert.ok(r.redTop && r.curtain.top > 200);
  assert.ok(r.says.includes('하늘 전체') && r.says.includes('위쪽이 빨갛게') && r.says.includes('왕관'));
  assert.ok(!aurora({ wind: 0.75 }).redTop);                                     // 셈까지는 위가 빨개지지 않는다
});
t('5 고도를 높이면 초록 → 빨강(높은 곳의 산소)', () => {
  const lo = aurora({ wind: 0.4, alt: ALT_DEFAULT }), hi = aurora({ wind: 0.4, alt: 230 });
  assert.equal(lo.main, 'green'); assert.equal(hi.main, 'red');
  assert.ok(hi.curtain.base > 200);
  assert.ok(hi.says.includes('빨간 커튼') && hi.says.includes('산소'));
});
t('6 고도를 낮추면 보라·분홍(질소)', () => {
  const r = aurora({ wind: 0.4, alt: 75 });
  assert.equal(r.main, 'pink'); assert.ok(r.curtain.base < 100);
  assert.ok(r.says.includes('보라·분홍') && r.says.includes('질소'));
});
t('7 우주 컷: 극지방을 두른 빛나는 고리 — 바람이 세질수록 굵어지고 남쪽으로', () => {
  const ws = [0.1, 0.4, 0.7, 0.9, 1];
  const rs = ws.map(w => ring(w));
  for (let i = 1; i < rs.length; i++) { assert.ok(rs[i].edge < rs[i - 1].edge); assert.ok(rs[i].thickKm > rs[i - 1].thickKm); }
  const r = aurora({ wind: 0.7, cut: 'space' });
  assert.ok(r.says.includes('극지방을 두른 빛나는 고리') && r.says.includes('굵어지고 남쪽으로'));
});
t('8 (자유) 지구 자석을 끄면 오로라가 사라지고 바람이 땅까지 온다', () => {
  const r = aurora({ wind: 0.9, magnet: false });
  assert.equal(r.visible, false); assert.ok(r.windAtGround); assert.equal(r.main, null);
  assert.ok(r.says.includes('사라지고') && r.says.includes('땅까지'));
  for (const m of MISSIONS) assert.ok(!m.ok(r));
});
t('9 (자유) 목성으로 바꾸면 훨씬 큰 푸른 오로라', () => {
  const r = aurora({ wind: 0.6, planet: 'jupiter' });
  assert.equal(r.main, 'blue'); assert.ok(r.bigger > 4);
  assert.ok(r.ring.radiusKm * 2 > 12742);                                        // 고리 하나가 지구 지름보다 크다
  assert.ok(r.says.includes('훨씬 큰 푸른 오로라'));
});

// 의뢰 셋
t('의뢰 1: 초록 커튼을 머리 위까지', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(aurora({ wind: 0.65 })));
  const low = aurora({ wind: 0.3 }); assert.ok(!m.ok(low)); assert.ok(m.tell(low).includes('더 세게'));
  const red = aurora({ wind: 0.65, alt: 240 }); assert.ok(!m.ok(red)); assert.ok(m.tell(red).includes('고도'));
  const sp = aurora({ wind: 0.65, cut: 'space' }); assert.ok(!m.ok(sp)); assert.ok(m.tell(sp).includes('망원경'));
});
t('의뢰 2: 분홍 테 — 바람만으로도, 고도만으로도 안 되고 둘 다', () => {
  const m = MISSIONS[1];
  assert.ok(m.ok(aurora({ wind: 0.7, alt: 110 })));
  for (let w = 0; w <= 1.0001; w += 0.05) assert.ok(!m.ok(aurora({ wind: w, alt: ALT_DEFAULT })), 'w ' + w);   // 바람만 바꾸면 안 된다
  for (let a = 70; a <= 250; a += 5) assert.ok(!m.ok(aurora({ wind: 0.4, alt: a })), 'alt ' + a);           // 고도만 바꾸면 안 된다
  const thin = aurora({ wind: 0.75 }); assert.ok(!m.ok(thin)); assert.ok(m.tell(thin).includes('가늘어요'));
  const all = aurora({ wind: 0.4, alt: 75 }); assert.ok(!m.ok(all)); assert.ok(m.tell(all).includes('온통'));
  const top = aurora({ wind: 0.95 }); assert.ok(!m.ok(top)); assert.ok(m.tell(top).includes('빨개졌어요'));
  const weak = aurora({ wind: 0.4, alt: 90 }); assert.ok(!m.ok(weak)); assert.ok(m.tell(weak).includes('바람이 아직 약해요'));
  const none = aurora({ wind: 0.6, alt: 160 }); assert.ok(!m.ok(none)); assert.ok(m.tell(none).includes('아직 초록'));
});
t('의뢰 3: 우리나라에서도 보이게 — 폭풍이어야', () => {
  const m = MISSIONS[2];
  const big = aurora({ wind: 1 }); assert.ok(m.ok(big)); assert.ok(big.says.includes('우리나라'));
  assert.ok(korea(1, ALT_DEFAULT).elev > 3 && edgeLat(1) - KOREA_LAT < 3);
  for (let w = 0; w < 0.8; w += 0.05) assert.ok(!m.ok(aurora({ wind: w, alt: 250 })), 'w ' + w);           // 폭풍 아래로는 안 된다
  const mid = aurora({ wind: 0.6 }); assert.ok(m.tell(mid).includes('폭풍까지'));
  const far = aurora({ wind: 0.82 }); assert.ok(!m.ok(far)); assert.ok(m.tell(far).includes('폭풍이지만'));
  const near = aurora({ wind: 0.9 }); assert.ok(!m.ok(near)); assert.ok(m.tell(near).includes('거의'));
  assert.ok(m.ok(aurora({ wind: 0.9, alt: 250 })));                              // 거의 왔을 때 고도를 높이면 높은 빨간 빛이 보인다
  assert.ok(!m.ok(aurora({ wind: 1, magnet: false })));
});
t('까닭 둘과 결과 문구', () => {
  assert.equal(WHY.length, 2);
  assert.equal(WHY[0], '태양에서 날아온 알갱이들이 지구 자석에 끌려 북쪽과 남쪽 끝으로 몰려요. 거기서 공기와 부딪쳐 빛나요.');
  assert.equal(WHY[1], '초록과 빨강은 산소가, 보라와 분홍은 질소가 내는 빛이에요.');
  for (const k of ['weak', 'medium', 'strong', 'storm', 'pinkRim', 'redTop', 'corona', 'space', 'nomagnet', 'jupiter']) assert.ok(SAYS[k]);
  for (const m of MISSIONS) assert.ok(m.id && m.say && m.hint && WHY[m.why]);
  // 표 줄은 손잡이를 끝까지 돌려도 깨지지 않는다
  for (let w = 0; w <= 1; w += 0.1) for (let a = 70; a <= 250; a += 30) { const r = aurora({ wind: w, alt: a }); assert.ok(r.says.length > 5 && curtain(w, a).top > curtain(w, a).base && sky(w, a).reach >= 0); }
});
console.log(n + ' 통과');
