/* 케이파크 · 마블런 — tests/sim.spec.js
 * 순수 로직 테스트. 실행: node kpark/marblerun/tests/sim.spec.js
 */
'use strict';
require('../core/hexgrid.js');
require('../core/parts/basic.js');
require('../core/parts/action.js');
require('../core/parts/ballistic.js');
require('../core/graph.js');
require('../core/sim.js');
require('../core/serialize.js');
require('../core/tracks.js');
require('../core/builder.js');
require('../core/parts/switchpart.js');
require('../core/multisim.js');
const NS = globalThis.MarbleSim;

let pass = 0, fail = 0;
function T(name, fn) {
  try { fn(); pass++; console.log('  ✓ ' + name); }
  catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert 실패'); }
function near(a, b, eps, msg) { if (Math.abs(a - b) > (eps || 1e-9)) throw new Error((msg || '') + ' |' + a + ' - ' + b + '| > ' + eps); }

const C = NS.CONST;

// ---------- 1. hexgrid ----------
console.log('[hexgrid]');
T('이웃 6방향 중심거리 = √3·R', () => {
  for (let p = 0; p < 6; p++) {
    const c = NS.hexgrid.tileCenter(2, -1, C.R);
    const n = NS.hexgrid.neighborOf(2, -1, p);
    const cn = NS.hexgrid.tileCenter(n.q, n.r, C.R);
    near(Math.hypot(cn.x - c.x, cn.z - c.z), Math.sqrt(3) * C.R, 1e-12, 'P' + p);
  }
});
T('반대 포트 왕복 = 제자리', () => {
  for (let p = 0; p < 6; p++) {
    const n = NS.hexgrid.neighborOf(0, 0, p);
    const back = NS.hexgrid.neighborOf(n.q, n.r, NS.hexgrid.opposite(p));
    assert(back.q === 0 && back.r === 0, 'P' + p);
  }
});

// ---------- 골든 트랙 = TRACKS[0] 컴파일 (core/tracks.js 단일 소스) ----------
const GOLDEN = NS.compile(NS.TRACKS[0]).pieces;

// ---------- 2. graph ----------
console.log('[graph]');
T('골든 트랙 빌드 성공 (오류 0)', () => {
  const t = NS.buildTrack(GOLDEN);
  assert(t.ok, JSON.stringify(t.errors));
  assert(t.points.length > 20, '웨이포인트 부족');
  assert(t.order.length === 6, '체인 6부품');
});
T('높이 불일치 감지', () => {
  const bad = GOLDEN.map(p => ({ ...p }));
  bad[1].h = 0; // slope를 내리면 시작탑 출구(2H)와 안 맞음
  const t = NS.buildTrack(bad);
  assert(!t.ok && t.errors.some(e => e.code === 'HEIGHT_MISMATCH'), '감지 실패');
});
T('끊긴 트랙 감지', () => {
  const t = NS.buildTrack(GOLDEN.slice(0, 3).concat(GOLDEN.slice(4)));
  assert(!t.ok, '감지 실패');
});
T('포트 불일치 감지', () => {
  const bad = GOLDEN.map(p => ({ ...p }));
  bad[3].rot = 2;
  const t = NS.buildTrack(bad);
  assert(!t.ok && t.errors.some(e => e.code === 'PORT_MISMATCH'), '감지 실패');
});

// ---------- 3. sim 기초 물리 ----------
console.log('[sim 기초]');
function flatPath(len, y) {
  const pts = [];
  for (let i = 0; i <= 40; i++) pts.push({ x: (len * i) / 40, y: y || 0.1, z: 0 });
  return NS.buildPathData(pts, []);
}
T('평지 감속: 단조 감소 후 정지, NaN 없음', () => {
  const sim = new NS.Sim(flatPath(3.0));
  sim.release(1.0);
  let vLast = sim.v;
  for (let i = 0; i < 120 * 20 && sim.status === 'rolling'; i++) {
    sim.step();
    assert(Number.isFinite(sim.v) && Number.isFinite(sim.s), 'NaN 발생');
    assert(sim.v <= vLast + 1e-12, '속도 증가 발생');
    vLast = sim.v;
  }
  assert(sim.status === 'rest', '정지 상태 아님: ' + sim.status);
});
T('에너지 비증가 (평지)', () => {
  const sim = new NS.Sim(flatPath(3.0));
  sim.release(1.2);
  let E = sim.energy();
  for (let i = 0; i < 500; i++) {
    sim.step();
    const E2 = sim.energy();
    assert(E2 <= E + 1e-9, '에너지 증가: ' + E + ' → ' + E2);
    E = E2;
  }
});

// 계곡+언덕 경로: 0.10m에서 출발 → 계곡(0m) 하강 → 봉우리 peakY 언덕 → 0m
function hillPath(peakY) {
  const ease = (a, b, t) => a + (b - a) * (1 - Math.cos(Math.PI * t)) / 2;
  const pts = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let y;
    if (t < 0.35) y = ease(0.10, 0.0, t / 0.35);                 // 하강
    else if (t < 0.65) y = ease(0.0, peakY, (t - 0.35) / 0.30);  // 언덕 오르막 (봉우리 t=0.65)
    else y = ease(peakY, 0.0, (t - 0.65) / 0.35);                // 내리막
    pts.push({ x: t * 1.2, y, z: 0 });
  }
  return NS.buildPathData(pts, []);
}
T('역행: 출발 높이(0.10m)보다 높은 언덕(0.12m)은 못 넘고 되돌아옴', () => {
  const pd = hillPath(0.12);
  const sim = new NS.Sim(pd);
  sim.release(0);
  const ev = sim.runToEnd(20);
  assert(ev.some(e => e.type === 'reverse'), 'reverse 이벤트 없음');
  assert(sim.s < pd.total * 0.65, '봉우리를 넘어버림 (s=' + sim.s.toFixed(3) + ')');
});
T('통과: 출발 높이보다 낮은 언덕(0.06m)은 넘어감', () => {
  const pd = hillPath(0.06);
  const sim = new NS.Sim(pd);
  sim.release(0);
  sim.runToEnd(20);
  assert(sim.s > pd.total * 0.9, '언덕 통과 실패 (s=' + sim.s.toFixed(3) + ')');
});

// ---------- 4. 골든 시나리오 ----------
console.log('[골든 시나리오]');
T('골든 트랙 완주: bell → goal', () => {
  const t = NS.buildTrack(GOLDEN);
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges);
  const sim = new NS.Sim(pd);
  sim.release(0);
  const ev = sim.runToEnd(30);
  assert(ev.some(e => e.type === 'bell'), 'bell 없음');
  assert(ev.some(e => e.type === 'goal'), 'goal 없음 (status=' + sim.status + ', s=' + sim.s.toFixed(3) + '/' + pd.total.toFixed(3) + ', v=' + sim.v.toFixed(3) + ')');
  const bellIdx = ev.findIndex(e => e.type === 'bell');
  const goalIdx = ev.findIndex(e => e.type === 'goal');
  assert(bellIdx < goalIdx, 'bell이 goal보다 늦음');
});
T('결정론: 동일 트랙 2회 실행 = 동일 틱 수·동일 최종 s', () => {
  const run = () => {
    const t = NS.buildTrack(GOLDEN);
    const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges));
    sim.release(0);
    sim.runToEnd(30);
    return { tick: sim.tick, s: sim.s };
  };
  const a = run(), b = run();
  assert(a.tick === b.tick, '틱 불일치: ' + a.tick + ' vs ' + b.tick);
  near(a.s, b.s, 0, 's 불일치');
});
T('에너지 비증가 (골든 전 구간, 오일러 이산화 허용치 1e-3)', () => {
  const t = NS.buildTrack(GOLDEN);
  const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges));
  sim.release(0);
  const E0 = sim.energy();
  let E = E0;
  while (sim.status === 'rolling' && sim.tick < 120 * 30) {
    sim.step();
    const E2 = sim.energy();
    assert(E2 <= E + 1e-3, '에너지 급증 @tick ' + sim.tick + ' (' + E + ' → ' + E2 + ')');
    E = E2;
  }
  assert(sim.energy() < E0, '총 에너지가 줄지 않음');
});

// ---------- 5. 빌더 (건설 컴파일러) ----------
console.log('[빌더]');
T('빈 트랙(시작탑만) 컴파일 + 부분 트랙 빌드 허용', () => {
  const c = NS.compile({ startH: 3, seq: [] });
  assert(c.ok && !c.ended && c.next && !c.next.blocked, JSON.stringify(c.errors));
  const t = NS.buildTrack(c.pieces, null, { allowNoGoal: true });
  assert(t.ok, '부분 트랙 빌드 실패: ' + JSON.stringify(t.errors));
});
T('바닥(높이 0)에서 경사 거부 (TOO_LOW)', () => {
  const c = NS.compile({ startH: 1, seq: ['slope', 'slope'] });
  assert(!c.ok && c.errors.some(e => e.code === 'TOO_LOW'), JSON.stringify(c.errors));
});
T('커브 6연속 → 시작탑 자리 충돌 감지 (COLLISION)', () => {
  const c = NS.compile({ startH: 2, seq: ['curve_l', 'curve_l', 'curve_l', 'curve_l', 'curve_l', 'curve_l'] });
  assert(!c.ok && c.errors.some(e => e.code === 'COLLISION'), JSON.stringify(c.errors));
});
T('골 벨 뒤 배치 거부 (AFTER_GOAL)', () => {
  const c = NS.compile({ startH: 2, seq: ['goal', 'straight'] });
  assert(!c.ok && c.errors.some(e => e.code === 'AFTER_GOAL'), JSON.stringify(c.errors));
});
T('canPlace: 막다른 길에서 전부 거부', () => {
  const c = NS.compile({ startH: 2, seq: ['curve_l', 'curve_l', 'curve_l', 'curve_l', 'curve_l'] });
  assert(c.ok, '5연속 커브는 유효해야 함');
  assert(c.next && c.next.blocked, '다음 자리(시작탑)가 막혀 있어야 함');
  for (const t of NS.APPENDABLE) assert(!NS.canPlace(c, t), t + ' 놓기가 허용됨');
});

// ---------- 6. 프리셋 트랙 전체 (컴파일 → 빌드 → 완주) ----------
console.log('[프리셋 트랙]');
for (const tr of NS.TRACKS) {
  T('「' + tr.name + '」 컴파일 + 빌드 + 완주 (bell→goal)', () => {
    const c = NS.compile(tr);
    assert(c.ok && c.ended, '컴파일 실패: ' + JSON.stringify(c.errors));
    if (c.routes.length > 1) {
      // 갈래 트랙: 잎별 빌드 + MultiSim으로 전 구슬 완주
      const cr = NS.compileRoutes(c);
      assert(cr.ok && cr.routesData.length === c.routes.length, '잎 빌드 실패: ' + JSON.stringify(cr.errors));
      const ms = new NS.MultiSim(cr.routesData, { count: tr.marbles || 3 });
      ms.release();
      const ev = ms.runToEnd(180);
      const fin = ev.filter(e => e.type === 'finish');
      assert(fin.length === (tr.marbles || 3), '완주 ' + fin.length + '/' + (tr.marbles || 3));
      return;
    }
    const t = NS.buildTrack(c.pieces);
    assert(t.ok, JSON.stringify(t.errors));
    const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges,
      { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks }));
    sim.release(0);
    const ev = sim.runToEnd(120);
    assert(ev.some(e => e.type === 'goal'),
      '완주 실패 (status=' + sim.status + ', s=' + sim.s.toFixed(3) + '/' + sim.pd.total.toFixed(3) + ')');
  });
}

// ---------- 6.5 액션 부품 물리 ----------
console.log('[액션 부품]');
function runSeq(startH, seq, maxSec) {
  const c = NS.compile({ startH, seq });
  if (!c.ok) return { compileErrors: c.errors };
  const t = NS.buildTrack(c.pieces, null, { allowNoGoal: true });
  const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks }));
  sim.release(0);
  let vMax = 0;
  const evs = [];
  const maxTicks = Math.round((maxSec || 60) / sim.P.dt);
  while (sim.status === 'rolling' && sim.tick < maxTicks) {
    evs.push(...sim.step());
    if (Math.abs(sim.v) > vMax) vMax = Math.abs(sim.v);
  }
  return { sim, evs, vMax };
}
T('언덕: 낙차 부족(시작 1)이면 역행, 골 미도달', () => {
  const r = runSeq(1, ['hill', 'straight', 'goal'], 30);
  assert(r.evs.some(e => e.type === 'reverse'), 'reverse 없음');
  assert(!r.evs.some(e => e.type === 'goal'), '넘으면 안 되는데 완주함');
});
T('언덕: 낙차 충분(시작 3, 경사 2개)이면 통과', () => {
  const r = runSeq(3, ['slope', 'slope', 'hill', 'goal'], 30);
  assert(r.evs.some(e => e.type === 'goal'), '통과 실패 (s=' + r.sim.s.toFixed(3) + ')');
});
T('루프 접촉 물리: 저속 이탈(detach→crash), 고속 완주', () => {
  // 접촉 조건: 꼭대기에서 v²κ ≥ g. 느리면 안쪽 벽에서 떨어져 낙하한다.
  const c = NS.compile({ startH: 1, seq: ['loop', 'goal'] });
  const t = NS.buildTrack(c.pieces);
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges, {});
  const slow = new NS.Sim(pd);
  slow.release(1.0);
  const evS = slow.runToEnd(30);
  assert(evS.some(e => e.type === 'detach'), '저속인데 이탈 없음');
  assert(evS.some(e => e.type === 'crash'), '낙하 착지(crash) 없음');
  assert(slow.status === 'fallen', 'fallen 상태 아님: ' + slow.status);
  assert(!evS.some(e => e.type === 'goal'), '저속인데 완주');
  const fast = new NS.Sim(pd);
  fast.release(1.8);
  const evF = fast.runToEnd(30);
  assert(evF.some(e => e.type === 'goal'), '고속인데 완주 실패');
  assert(!evF.some(e => e.type === 'detach'), '고속인데 이탈');
});
T('루프: 이탈 낙하는 결정론 (2회 동일 착지점)', () => {
  const c = NS.compile({ startH: 1, seq: ['loop', 'goal'] });
  const t = NS.buildTrack(c.pieces);
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges, {});
  const run = () => { const s = new NS.Sim(pd); s.release(1.0); s.runToEnd(30); return s.pos(); };
  const a = run(), b = run();
  near(a.x, b.x, 0, '착지 x'); near(a.y, b.y, 0, '착지 y'); near(a.z, b.z, 0, '착지 z');
});
T('부스터: 같은 트랙에서 직선 대비 최고 속도 증가', () => {
  const plain = runSeq(2, ['slope', 'slope', 'straight', 'straight', 'goal'], 30);
  const boost = runSeq(2, ['slope', 'slope', 'booster', 'straight', 'goal'], 30);
  assert(boost.vMax > plain.vMax + 0.1, '가속 없음: ' + plain.vMax.toFixed(2) + ' → ' + boost.vMax.toFixed(2));
});
T('자이로: 높이 2 미만이면 TOO_LOW, 2 이상이면 2칸 하강 완주', () => {
  const low = NS.compile({ startH: 1, seq: ['gyro'] });
  assert(!low.ok && low.errors.some(e => e.code === 'TOO_LOW'), '저높이 자이로 허용됨');
  const r = runSeq(2, ['gyro', 'goal'], 30);
  assert(r.evs.some(e => e.type === 'goal'), '자이로 완주 실패');
  const c = NS.compile({ startH: 2, seq: ['gyro', 'goal'] });
  assert(c.exitH === 0, '2칸 하강 아님 (exitH=' + c.exitH + ')');
});
T('점프: air 구간에서 마찰 손실 없음 (에너지 보존)', () => {
  const c = NS.compile({ startH: 3, seq: ['slope', 'jump', 'goal'] });
  const t = NS.buildTrack(c.pieces);
  assert(t.airIndexRanges.length === 1, 'air 구간 없음');
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges });
  const sim = new NS.Sim(pd);
  sim.release(0);
  const air = pd.airRanges[0];
  let E0 = null, E1 = null;
  while (sim.status === 'rolling' && sim.tick < 120 * 30) {
    const wasIn = sim.s >= air.s0 && sim.s <= air.s1;
    sim.step();
    const isIn = sim.s >= air.s0 && sim.s <= air.s1;
    if (E0 === null && isIn) E0 = sim.energy();
    if (E0 !== null && E1 === null && wasIn && !isIn) E1 = sim.energy();
  }
  assert(E0 !== null && E1 !== null, '공중 구간 미통과');
  near(E1, E0, 5e-4, '공중에서 에너지 변화');
});
T('지그재그: 곡률 마찰로 직선보다 감속', () => {
  const plain = runSeq(2, ['slope', 'slope', 'straight', 'goal'], 30);
  const zig = runSeq(2, ['slope', 'slope', 'zigzag', 'goal'], 30);
  assert(zig.evs.some(e => e.type === 'goal'), '지그재그 완주 실패');
  const vP = Math.abs(plain.vMax), vZ = Math.abs(zig.vMax);
  assert(vZ <= vP + 1e-9, '지그재그가 더 빠름?');
});

// ---------- 6b. 탄도 부품 (M2b-1: 대포·트램펄린) ----------
console.log('[탄도 — 대포·트램펄린]');

/* 비행(air)·낙하(falling)까지 끝까지 돌리는 러너 */
function runBallistic(startH, seq, maxSec) {
  const c = NS.compile({ startH, seq });
  if (!c.ok) return { compileErrors: c.errors };
  const t = NS.buildTrack(c.pieces);
  if (!t.ok) return { buildErrors: t.errors };
  const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks }));
  sim.release(0);
  const evs = [];
  let vIn = 0, vAtLaunch = null;
  const maxTicks = Math.round((maxSec || 60) / sim.P.dt);
  while ((sim.status === 'rolling' || sim.status === 'air' || sim.status === 'falling') && sim.tick < maxTicks) {
    if (sim.status === 'rolling') vIn = Math.abs(sim.v);
    const e = sim.step();
    if (vAtLaunch === null && e.some(x => x.type === 'launch')) vAtLaunch = vIn;
    evs.push(...e);
  }
  return { sim, evs, c, t, vAtLaunch };
}
const evTypes = (r) => r.evs.map(e => e.type);

T('빌더: 대포는 앞쪽 3칸(비행+착지대)을 통째로 점유', () => {
  const c = NS.compile({ startH: 4, seq: ['cannon', 'straight', 'goal'] });
  assert(c.ok, JSON.stringify(c.errors));
  const cannon = c.pieces.find(p => p.type === 'cannon');
  const after = c.pieces[c.pieces.findIndex(p => p.type === 'cannon') + 1];
  const dist = Math.hypot(
    NS.hexgrid.tileCenter(after.q, after.r, C.R).x - NS.hexgrid.tileCenter(cannon.q, cannon.r, C.R).x,
    NS.hexgrid.tileCenter(after.q, after.r, C.R).z - NS.hexgrid.tileCenter(cannon.q, cannon.r, C.R).z);
  near(dist, 4 * Math.sqrt(3) * C.R, 1e-9, '대포 다음 부품이 착지대 바로 뒤가 아님');
});

T('빌더: 스팬 자리가 막히면 SPAN_BLOCKED', () => {
  // 커브로 한 바퀴 감아 앞을 막은 뒤 대포 시도
  // 커브로 한 바퀴 감아 놓으면 대포의 비행 3칸이 자기 트랙과 겹친다
  const seq = ['straight', 'curve_l', 'curve_l', 'curve_l', 'curve_l'];
  const okBefore = NS.compile({ startH: 6, seq });
  assert(okBefore.ok, '기반 트랙 자체가 실패: ' + JSON.stringify(okBefore.errors));
  assert(!NS.canPlace(okBefore, 'cannon'), 'canPlace가 대포를 허용함');
  assert(NS.canPlace(okBefore, 'straight'), '직선까지 막힘 (과도한 차단)');
  const c = NS.compile({ startH: 6, seq: seq.concat('cannon') });
  assert(!c.ok && c.errors[0].code === 'SPAN_BLOCKED', '기대: SPAN_BLOCKED, 실제: ' + JSON.stringify(c.errors));
});

T('대포: 진입 속도가 극단적으로 낮으면 못 미치고 추락 (부족 분기)', () => {
  // 대포는 자체 추진이라 정상 배치에서는 부족 실패가 나지 않는다(의도된 관대함).
  // 부족 분기 자체는 살아 있어야 하므로 발사 직전 속도를 강제로 낮춰 검증한다.
  const c = NS.compile({ startH: 3, seq: ['straight', 'cannon', 'straight', 'goal'] });
  assert(c.ok, JSON.stringify(c.errors));
  const t = NS.buildTrack(c.pieces);
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks });
  const sim = new NS.Sim(pd);
  sim.release(0);
  const sLaunch = pd.launches[0].sLaunch;
  const evs = [];
  let damped = false;
  while ((sim.status === 'rolling' || sim.status === 'air' || sim.status === 'falling') && sim.tick < 60 * 30) {
    if (!damped && sim.status === 'rolling' && sim.s > sLaunch - 0.0035) { sim.v = 0.20; damped = true; }
    evs.push(...sim.step());
  }
  assert(damped, '발사 지점에 도달하지 못함');
  assert(evs.some(e => e.type === 'launch'), '발사 안 함');
  const miss = evs.find(e => e.type === 'miss');
  assert(miss && !miss.over, '부족 빗나감이 아님: ' + JSON.stringify(miss));
  assert(sim.status === 'fallen', '추락하지 않음: ' + sim.status);
});

T('대포: 평지에 그냥 이어붙여도 건너간다 (기본 배치 보장)', () => {
  // v1 회귀 방지 — 낙차 없는 체인의 실제 진입 속도(≈0.75)에서 반드시 성공해야 한다.
  for (const h of [2, 3, 5, 8]) {
    const r = runBallistic(h, ['cannon', 'straight', 'goal'], 30);
    const cat = r.evs.find(e => e.type === 'catch');
    assert(cat && !cat.wall, 'startH ' + h + ': 깔때기 포획 실패 (' + JSON.stringify(evTypes(r)) + ')');
    assert(evTypes(r).includes('goal'), 'startH ' + h + ': 완주 실패');
  }
});

T('대포: 적정 속도 → 깔때기 포획 후 완주', () => {
  const r = runBallistic(4, ['straight', 'cannon', 'slope', 'goal'], 60);
  const cat = r.evs.find(e => e.type === 'catch');
  assert(cat && !cat.wall, '깔때기 포획 실패: ' + JSON.stringify(r.evs.map(e => e.type)));
  assert(evTypes(r).includes('goal'), '완주 실패');
});

T('대포: 과속 → 백보드가 받아냄 (속도 손실 동반)', () => {
  const r = runBallistic(5, ['slope', 'slope', 'straight', 'cannon', 'slope', 'trampoline', 'curve_r', 'goal'], 60);
  const wall = r.evs.filter(e => e.type === 'catch').some(e => e.wall);
  assert(wall, '백보드 포획이 한 번도 안 일어남');
  assert(evTypes(r).includes('goal'), '완주 실패');
});

T('대포: 지나친 과속 → 백보드도 넘겨 추락', () => {
  const r = runBallistic(6, ['slope', 'slope', 'slope', 'slope', 'straight', 'cannon', 'goal'], 60);
  const miss = r.evs.find(e => e.type === 'miss');
  assert(miss && miss.over, '오버 빗나감이 아님: ' + JSON.stringify(miss));
  assert(r.sim.status === 'fallen', '추락하지 않음: ' + r.sim.status);
});

T('탄도: 비행 중 역학적 에너지 보존 (마찰 없음)', () => {
  const r0 = runBallistic(4, ['straight', 'cannon', 'slope', 'goal'], 60);
  assert(r0.sim, '빌드 실패');
  // 재실행하며 발사 직후 / 포획 직전 에너지 비교
  const t = r0.t;
  const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks }));
  sim.release(0);
  let E0 = null, E1 = null;
  while (sim.status === 'rolling' || sim.status === 'air') {
    const wasAir = sim.status === 'air';
    sim.step();
    if (sim.status === 'air' && E0 === null) E0 = sim.energy();
    if (wasAir && sim.status !== 'air') break;
    if (sim.status === 'air') E1 = sim.energy();
  }
  assert(E0 !== null && E1 !== null, '비행 구간 미검출');
  near(E1, E0, 2e-3, '비행 중 에너지 변화');
});

T('탄도: 발사 속도 = √(v_in² + 2·boost)', () => {
  const r = runBallistic(4, ['slope', 'slope', 'straight', 'cannon', 'slope', 'goal'], 60);
  const L = r.evs.find(e => e.type === 'launch');
  const boost = NS.BALLISTIC.cannon.boost;
  near(L.speed, Math.sqrt(r.vAtLaunch * r.vAtLaunch + 2 * boost), 5e-3, '발사 속도 공식 불일치');
});

T('부품 성격: 대포는 좁은 착지대(과속에 엄격), 트램펄린은 넓은 매트(관대)', () => {
  const BAL = NS.BALLISTIC;
  const d0 = Math.sqrt(3) * C.R;
  // 같은 진입 속도에서 대포는 성공하고 트램펄린은 못 미치는 저속 구간이 존재해야 한다.
  const outcome = (key, vIn) => {
    const sp = BAL[key];
    const D = sp.span * d0;
    const vOut = Math.sqrt(vIn * vIn + 2 * sp.boost);
    const err = (vOut * vOut * Math.sin(2 * sp.angle)) / 9.81 - D;
    if (Math.abs(err) <= sp.catchR) return 'catch';
    if (err > 0 && err <= sp.wallR) return 'wall';
    return err < 0 ? 'short' : 'over';
  };
  // 기본 배치 속도(≈0.75)에서는 둘 다 깨끗이 성공해야 한다.
  assert(outcome('cannon', 0.75) === 'catch', '대포 기본 배치 실패');
  assert(outcome('trampoline', 0.75) === 'catch', '트램펄린 기본 배치 실패');
  // 차이는 과속 허용치: 대포가 먼저 넘겨야 한다.
  assert(outcome('cannon', 1.70) === 'over', '대포가 과속(1.70)에서 안 넘어감');
  assert(outcome('trampoline', 1.70) !== 'over', '트램펄린이 대포와 같이 넘어감 (성격 차이 소실)');
  assert(outcome('trampoline', 2.10) === 'over', '트램펄린이 극과속에서도 안 넘어감');
});

T('트램펄린: 매트가 넓어 아주 느려도 받아낸다 (입문용 보장)', () => {
  const c = NS.compile({ startH: 3, seq: ['straight', 'trampoline', 'straight', 'goal'] });
  assert(c.ok, JSON.stringify(c.errors));
  const t = NS.buildTrack(c.pieces);
  const pd = NS.buildPathData(t.points, t.bowlIndexRanges,
    { airIndexRanges: t.airIndexRanges, boostIndexRanges: t.boostIndexRanges, launchMarks: t.launchMarks });
  const sim = new NS.Sim(pd);
  sim.release(0);
  const sLaunch = pd.launches[0].sLaunch;
  const evs = [];
  let damped = false;
  while ((sim.status === 'rolling' || sim.status === 'air' || sim.status === 'falling') && sim.tick < 60 * 30) {
    if (!damped && sim.status === 'rolling' && sim.s > sLaunch - 0.0035) { sim.v = 0.20; damped = true; }
    evs.push(...sim.step());
  }
  const cat = evs.find(e => e.type === 'catch');
  assert(cat, '저속 포획 실패: ' + JSON.stringify(evs.map(e => e.type)));
});

T('탄도: 결정론 — 같은 트랙 두 번 = 같은 이벤트열·같은 tick', () => {
  const a = runBallistic(5, ['straight', 'cannon', 'slope', 'trampoline', 'curve_r', 'goal'], 60);
  const b = runBallistic(5, ['straight', 'cannon', 'slope', 'trampoline', 'curve_r', 'goal'], 60);
  assert(a.sim.tick === b.sim.tick, 'tick 불일치');
  assert(JSON.stringify(evTypes(a)) === JSON.stringify(evTypes(b)), '이벤트열 불일치');
});

T('프리셋 전 종목 완주 (탄도 3종 포함 총 ' + NS.TRACKS.length + '종)', () => {
  for (const tk of NS.TRACKS) {
    if (NS.compile(tk).routes.length > 1) continue; // 갈래 트랙은 [프리셋 트랙]의 MultiSim 케이스가 커버
    const r = runBallistic(tk.startH, tk.seq, 90);
    assert(r.sim, tk.name + ' 빌드 실패: ' + JSON.stringify(r.compileErrors || r.buildErrors));
    assert(r.sim.status === 'goal', tk.name + ' 완주 실패 (' + r.sim.status + ')');
  }
});

// ---------- 6.7 스위치 분기 + MultiSim ----------
console.log('[스위치 분기]');

const FORK = {
  startH: 3,
  seq: ['slope', 'straight',
    { type: 'switch',
      left:  ['curve_l', 'slope', 'straight', 'goal'],
      right: ['curve_r', 'slope', 'straight', 'goal'] }],
};

T('트리 컴파일: 잎 2개, 전 잎 골 종결, 부품 합집합', () => {
  const c = NS.compile(FORK);
  assert(c.ok, JSON.stringify(c.errors));
  assert(c.routes.length === 2, '잎 수 ' + c.routes.length);
  assert(c.ended, '전 잎 종결이어야 함');
  // 트렁크 3개(start·slope·straight) + 스위치 1 + 갈래 4×2 = 12
  assert(c.pieces.length === 12, '부품 수 ' + c.pieces.length);
  const sw = c.pieces.findIndex(p => p.type === 'switch');
  assert(c.routes[0].decisions[0].id === sw && c.routes[0].decisions[0].dir === 0, '왼길 결정');
  assert(c.routes[1].decisions[0].dir === 1, '오른길 결정');
});

T('갈래 간 충돌 감지 (COLLISION)', () => {
  // 오른길이 왼쪽으로 세 번 감아 돌아 왼길이 이미 차지한 타일로 향한다
  const c = NS.compile({ startH: 3, seq: [
    { type: 'switch',
      left:  ['curve_r', 'straight'],
      right: ['curve_l', 'curve_l', 'curve_l', 'straight'] }] });
  assert(!c.ok && c.errors.some(e => e.code === 'COLLISION'), JSON.stringify(c.errors));
});

T('잎별 빌드: 포트·높이 정합 + 진입 절반 기하 공유', () => {
  const c = NS.compile(FORK);
  const cr = NS.compileRoutes(c);
  assert(cr.ok && cr.routesData.length === 2, JSON.stringify(cr.errors));
  const [A, B] = cr.routesData;
  assert(A.switches.length === 1 && B.switches.length === 1, '스위치 마크 수');
  near(A.switches[0].s, B.switches[0].s, 1e-9, '분기점 호길이 불일치');
  // 분기점까지 웨이포인트가 완전히 동일해야 경로 교체가 무결하다
  const iA = A.track.decideMarks[0].i;
  for (let i = 0; i <= iA; i++) {
    near(A.pd.points[i].x, B.pd.points[i].x, 1e-12, 'x@' + i);
    near(A.pd.points[i].y, B.pd.points[i].y, 1e-12, 'y@' + i);
    near(A.pd.points[i].z, B.pd.points[i].z, 1e-12, 'z@' + i);
  }
  // 좌/우 스위치 경로 길이 동일 (거울 대칭)
  near(A.pd.total, B.pd.total, 1e-9, '잎 총길이 (대칭 트랙)');
});

T('교대 분기: 구슬 3개 → 왼·오·왼, 전원 완주', () => {
  const c = NS.compile(FORK);
  const cr = NS.compileRoutes(c);
  const ms = new NS.MultiSim(cr.routesData, { count: 3 });
  ms.release();
  const ev = ms.runToEnd(120);
  const sw = ev.filter(e => e.type === 'switch').sort((a, b) => a.m - b.m);
  assert(sw.length === 3, '스위치 통과 ' + sw.length + '회');
  assert(sw[0].dir === 0 && sw[1].dir === 1 && sw[2].dir === 0, '교대 순서: ' + sw.map(e => e.dir).join(','));
  const fin = ev.filter(e => e.type === 'finish');
  assert(fin.length === 3, '완주 ' + fin.length + '/3');
  const routesTaken = fin.sort((a, b) => a.m - b.m).map(e => e.routeIdx);
  assert(routesTaken[0] === 0 && routesTaken[1] === 1 && routesTaken[2] === 0, '잎 배정: ' + routesTaken.join(','));
});

T('MultiSim 결정론: 두 번 실행 = 같은 이벤트열·틱', () => {
  const run = () => {
    const cr = NS.compileRoutes(NS.compile(FORK));
    const ms = new NS.MultiSim(cr.routesData, { count: 3 });
    ms.release();
    const ev = ms.runToEnd(120);
    return { tick: ms.tick, sig: ev.map(e => e.type + (e.m != null ? e.m : '')).join('|') };
  };
  const a = run(), b = run();
  assert(a.tick === b.tick, '틱 불일치');
  assert(a.sig === b.sig, '이벤트열 불일치');
});

T('중첩 스위치 (세 갈래 종탑): 잎 3개, 구슬 3개 서로 다른 벨', () => {
  const tk = NS.TRACKS.find(t => t.id === 'triplebell');
  const c = NS.compile(tk);
  assert(c.ok && c.routes.length === 3, '잎 수 ' + c.routes.length);
  const cr = NS.compileRoutes(c);
  const ms = new NS.MultiSim(cr.routesData, { count: 3 });
  ms.release();
  const ev = ms.runToEnd(180);
  const fin = ev.filter(e => e.type === 'finish');
  assert(fin.length === 3, '완주 ' + fin.length + '/3');
  const goals = new Set(fin.map(e => cr.routesData[e.routeIdx].goalPieceIdx));
  assert(goals.size === 3, '벨 배정 겹침: ' + [...goals].join(','));
});

T('canPlaceRoute: 잎별 독립 배치 판정', () => {
  const c = NS.compile({ startH: 2, seq: [
    { type: 'switch', left: ['straight'], right: ['goal'] }] });
  assert(c.ok, JSON.stringify(c.errors));
  const open = c.routes.find(rt => !rt.ended);
  const closed = c.routes.find(rt => rt.ended);
  assert(NS.canPlaceRoute(c, open, 'straight'), '열린 잎에 직선 가능해야 함');
  assert(!NS.canPlaceRoute(c, closed, 'straight'), '골로 닫힌 잎은 불가');
});

// ---------- 7. serialize ----------
console.log('[serialize]');
T('저장 → 로드 왕복 + 빌드 성공', () => {
  const json = NS.serialize.saveTrack('골든 샘플', GOLDEN);
  const { pieces } = NS.serialize.loadTrack(json);
  assert(NS.buildTrack(pieces).ok, '로드 후 빌드 실패');
});
T('잘못된 포맷 거부', () => {
  let threw = false;
  try { NS.serialize.loadTrack('{"format":"other"}'); } catch (e) { threw = true; }
  assert(threw, '거부 안 함');
});

console.log('\n결과: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail === 0 ? 0 : 1);
