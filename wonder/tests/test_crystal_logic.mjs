import assert from 'node:assert/strict';
import { grow, twins, snowCell, sliceSteps, totalTime, SNOW, SAYS, MISSIONS, WHY, BIG_RAINBOW, PERSON, MELT } from '../crystal/logic.js';
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok', name); };
const snow = (steps, seed = 1) => grow({ box: 'snow', steps, seed });
const S = (T, w, dt) => ({ T, w, dt });

// 설계 장면 10 「이렇게 하면 → 이렇게 된다」 — 한 줄에 시험 하나
t('1 눈 결정 — 영하 2도쯤: 납작한 육각 판', () => {
  for (const w of [0.1, 0.5, 0.9]) {
    const r = snow([S(-2, w, 20)]);
    assert.equal(r.kind, 'plate'); assert.ok(r.says.includes('육각 판')); assert.ok(r.label.includes('육각 판'));
    assert.equal(r.arms.flat().length, 0);                                            // 곁가지 없음
  }
});
t('2 영하 5도쯤: 가는 바늘·기둥', () => {
  for (const w of [0.1, 0.5, 0.9]) { const r = snow([S(-5, w, 20)]); assert.equal(r.kind, 'column'); assert.ok(r.says.includes('바늘·기둥')); }
  assert.equal(snow([S(-5, 0.9, 20)]).label, '가는 바늘');
});
t('3 영하 15도쯤 + 물기 많이: 가지 여섯의 별 모양(나뭇가지 눈)', () => {
  const r = snow([S(-15, 0.9, 20)]);
  assert.equal(r.kind, 'dendrite'); assert.ok(r.says.includes('별 모양')); assert.equal(r.label, '별 모양(나뭇가지 눈)');
  assert.equal(r.arms.length, 6); assert.ok(r.arms[0].length >= 5);                 // 팔 여섯, 곁가지 여럿
  assert.equal(snow([S(-15, 0.1, 20)]).kind, 'plate');                              // 같은 온도라도 물기가 적으면 판
  const cells = new Set(); for (const T of [-2, -6, -15, -25]) for (const w of [0.1, 0.5, 0.9]) cells.add(snowCell(T, w).id);
  assert.equal(cells.size, 12); assert.equal(Object.keys(SNOW).length, 12);          // 도감 열두 칸
});
t('4 자라는 도중 온도를 바꿈: 가운데는 판, 끝은 가지 — 자란 역사가 모양에 남는다', () => {
  const r = snow([S(-2, 0.5, 12), S(-15, 0.9, 12)]);
  assert.equal(r.kind, 'history'); assert.equal(r.core, 'plate'); assert.equal(r.tip, 'dendrite');
  assert.ok(r.says.includes('가운데는 판, 끝은 가지') && r.says.includes('역사'));
  const inner = r.layers[0]; assert.ok(r.arms[0].every(b => b.at >= inner.r1));      // 곁가지는 바깥 겹에만
  const three = snow([S(-2, 0.5, 10), S(-15, 0.9, 10), S(-2, 0.5, 25)]); assert.deepEqual(three.seq, ['plate', 'dendrite', 'plate']);
  assert.ok(three.says.includes('가운데는 판, 그다음 가지, 끝은 다시 판'));                 // 세 겹이면 세 겹 다 말한다
  const back = snow([S(-15, 0.9, 12), S(-2, 0.5, 12)]); assert.equal(back.core, 'dendrite'); assert.equal(back.tip, 'plate');   // 거꾸로 하면 거꾸로 남는다
  const early = grow({ box: 'snow', steps: sliceSteps([S(-2, 0.5, 12), S(-15, 0.9, 12)], 12) });  // 돌려 보기: 12분 때는 아직 판
  assert.equal(early.kind, 'plate'); assert.equal(totalTime(sliceSteps([S(-2, 0.5, 12), S(-15, 0.9, 12)], 18)), 18);
});
t('5 같은 조건 두 번: 닮았지만 똑같지는 않다', () => {
  const steps = [S(-15, 0.9, 20)], a = snow(steps, 3), b = snow(steps, 4), c = snow(steps, 3);
  const tw = twins(a, b); assert.ok(tw.alike); assert.ok(!tw.same); assert.ok(tw.says.includes('닮았지만'));
  assert.ok(twins(a, c).same);                                                      // 같은 씨앗이면 똑같다(흔들림은 씨앗에서만 온다)
  assert.deepEqual(a.arms, c.arms);                                                 // 같은 씨앗 → 곁가지 하나하나까지 같다
  assert.notDeepEqual(a.arms[0].map(q => q.at), b.arms[0].map(q => q.at));           // 다른 씨앗 → 곁가지 자리가 다르다
  const near = (x, y) => x.every((q, i) => Math.abs(q.len - y[i].len) <= 0.05 * q.len);
  assert.ok(near(a.arms[0], a.arms[3]));                                            // 한 결정의 여섯 팔은 같은 역사라 거의 같다
});
t('6 소금물을 천천히 말림: 반듯한 정육면체', () => {
  const r = grow({ box: 'salt', steps: [S(20, 0.1, 60)] });
  assert.equal(r.kind, 'cube'); assert.ok(r.done); assert.ok(r.says.includes('정육면체')); assert.ok(r.count <= 6 && r.size > 5);
  assert.equal(grow({ box: 'salt', steps: [S(20, 0.1, 2)] }).done, false);           // 아직 덜 말랐다
});
t('7 빨리 말림: 잘고 뭉친 가루', () => {
  const slow = grow({ box: 'salt', steps: [S(20, 0.1, 60)] }), r = grow({ box: 'salt', steps: [S(20, 1, 60)] });
  assert.equal(r.kind, 'powder'); assert.ok(r.says.includes('잘고 뭉친 가루')); assert.ok(r.count > 100 && r.size < slow.size / 4);
  assert.equal(grow({ box: 'salt', steps: [S(20, 0.5, 60)] }).kind, 'smallcubes');
});
t('8 비스무트를 녹였다 천천히 식힘: 네모 계단이 소용돌이치는 탑, 겉이 무지개색', () => {
  assert.equal(grow({ box: 'bismuth', steps: [S(200, 0.1, 100)] }).kind, 'solid');    // 녹이지 않으면 그대로
  const melt = grow({ box: 'bismuth', steps: [S(300, 0.1, 2)] }); assert.equal(melt.kind, 'melt'); assert.ok(melt.says.includes('녹았어요'));
  const r = grow({ box: 'bismuth', steps: [S(300, 0.1, 2), S(MELT - 30, 0.1, 100)] });
  assert.equal(r.kind, 'hopper'); assert.ok(r.done && r.rainbow && r.stairs >= 8); assert.ok(r.says.includes('소용돌이') && r.says.includes('무지개'));
  const again = grow({ box: 'bismuth', steps: [S(300, 0.1, 2), S(200, 0.1, 100), S(300, 0.1, 1)] }); assert.equal(again.kind, 'melt');   // 다시 데우면 다시 녹는다
});
t('9 빨리 식힘: 무늬 없는 은빛 덩어리', () => {
  const r = grow({ box: 'bismuth', steps: [S(300, 1, 2), S(200, 1, 30)] });
  assert.equal(r.kind, 'lump'); assert.ok(!r.rainbow && r.stairs === 0); assert.ok(r.says.includes('은빛 덩어리'));
  const slow = grow({ box: 'bismuth', steps: [S(300, 0.1, 2), S(200, 0.1, 100)] }), mid = grow({ box: 'bismuth', steps: [S(300, 0.5, 2), S(200, 0.5, 100)] });
  assert.ok(slow.size > mid.size && mid.size > r.size);                             // 느릴수록 크다
});
t('10 수정 — 아주 오래: 육각 기둥에 뾰족한 끝', () => {
  const short = grow({ box: 'quartz', steps: [S(250, 0.4, 500)] }), long = grow({ box: 'quartz', steps: [S(250, 0.4, 15000)] });
  assert.equal(short.kind, 'grain'); assert.ok(short.says.includes('오래'));
  assert.equal(long.kind, 'prism'); assert.ok(long.says.includes('육각 기둥에 뾰족한 끝'));
  assert.equal(grow({ box: 'quartz', steps: [S(250, 1, 15000)] }).kind, 'cluster');
});
t('11 자라는 결정에 흠을 냄: 흠을 메우며 다시 반듯해진다', () => {
  const base = [S(-2, 0.5, 10)];
  const cut = snow([...base, { notch: true }]); assert.ok(cut.defect > 0 && !cut.healed);
  const mid = snow([...base, { notch: true }, S(-2, 0.5, 1)]); assert.ok(mid.defect > 0 && mid.defect < cut.defect); assert.ok(mid.says.includes(SAYS.healing));
  const r = snow([...base, { notch: true }, S(-2, 0.5, 10)]); assert.equal(r.defect, 0); assert.ok(r.healed); assert.ok(r.says.includes('다시 반듯해졌어요'));
  const s = grow({ box: 'salt', steps: [S(20, 0.1, 10), { notch: true }, S(20, 0.1, 50)] }); assert.ok(s.healed && s.kind === 'cube');   // 소금도
  assert.ok(!snow([{ notch: true }]).notched);                                      // 아무것도 없으면 흠도 못 낸다
});
t('12 거대 결정 동굴(자유): 사람보다 큰 흰 기둥 결정들 사이에 작은 탐험가 인형', () => {
  const r = grow({ box: 'cave', steps: [S(55, 0.2, 400000)] });
  assert.equal(r.kind, 'cave'); assert.ok(r.size > PERSON * 2); assert.ok(r.says.includes('사람보다 큰 흰 기둥') && r.says.includes('탐험가'));
  assert.equal(grow({ box: 'cave', steps: [S(55, 0.2, 20000)] }).kind, 'caveSmall');
  assert.equal(grow({ box: 'cave', steps: [S(55, 0.9, 400000)] }).kind, 'crust');      // 빨리 자라면 크지 못한다
});

// 의뢰 셋
t('의뢰 1: 별 모양 눈', () => {
  const m = MISSIONS[0];
  assert.ok(m.ok(snow([S(-15, 0.9, 20)])));
  const col = snow([S(-5, 0.9, 20)]); assert.ok(!m.ok(col)); assert.ok(m.tell(col).includes('더 춥게'));
  const dry = snow([S(-15, 0.1, 20)]); assert.ok(!m.ok(dry)); assert.ok(m.tell(dry).includes('물기를 많이'));
  const warm = snow([S(-2, 0.9, 20)]); assert.ok(m.tell(warm).includes('영하 15도'));
  assert.ok(m.tell(grow({ box: 'salt', steps: [] })).includes('눈 결정 상자'));
});
t('의뢰 2: 주문서 — 가운데 판, 끝 가지(도중에 바꿔야)', () => {
  const m = MISSIONS[1];
  assert.ok(m.ok(snow([S(-2, 0.5, 12), S(-15, 0.9, 12)])));
  const star = snow([S(-15, 0.9, 20)]); assert.ok(!m.ok(star)); assert.ok(m.tell(star).includes('처음부터 가지'));
  const plate = snow([S(-2, 0.5, 20)]); assert.ok(!m.ok(plate)); assert.ok(m.tell(plate).includes('도중에'));
  const three = snow([S(-2, 0.5, 10), S(-15, 0.9, 10), S(-2, 0.5, 25)]); assert.ok(!m.ok(three)); assert.ok(m.tell(three).includes('끝이 다시 판'));
  const rev = snow([S(-15, 0.9, 12), S(-2, 0.5, 30)]); assert.ok(!m.ok(rev)); assert.ok(m.tell(rev).includes('거꾸로'));
});
t('의뢰 3: 가장 큰 무지개 계단 — 느릴수록 크다', () => {
  const m = MISSIONS[2], go = w => grow({ box: 'bismuth', steps: [S(300, w, 2), S(200, w, 200)] });
  const big = go(0.05); assert.ok(m.ok(big), big.size); assert.ok(big.size >= BIG_RAINBOW);
  const mid = go(0.3); assert.ok(!m.ok(mid)); assert.equal(mid.kind, 'hopper'); assert.ok(m.tell(mid).includes('더 천천히'));
  assert.ok(m.tell(mid).includes('다시 271도 위로 녹인'));                            // 굳은 뒤에는 다이얼만 돌려선 안 되니 다시 녹이라고
  const fast = go(1); assert.ok(!m.ok(fast)); assert.ok(m.tell(fast).includes('너무 빨리') && m.tell(fast).includes('다시 271도 위로'));
  const cold = grow({ box: 'bismuth', steps: [S(200, 0.05, 50)] }); assert.ok(m.tell(cold).includes('먼저 녹여요'));
  const half = grow({ box: 'bismuth', steps: [S(300, 0.05, 2), S(200, 0.05, 5)] }); assert.ok(!m.ok(half)); assert.ok(m.tell(half).includes('다 안 굳었어요'));
});
t('까닭 셋과 결과 문구', () => {
  assert.equal(WHY.length, 3);
  assert.equal(WHY[0], '아주 작은 알갱이들이 정해진 줄에 맞춰 차곡차곡 붙어요. 그래서 누가 깎지 않아도 반듯해요.');
  assert.equal(WHY[1], '눈은 물 알갱이가 여섯 방향으로 붙어서 언제나 육각이에요.');
  assert.equal(WHY[2], '천천히 자랄수록 크고 반듯해요.');
  for (const k of ['plate', 'column', 'dendrite', 'twins', 'cube', 'powder', 'hopper', 'lump', 'prism', 'cave', 'healed']) assert.ok(SAYS[k]);
});
console.log(n + ' 통과');
