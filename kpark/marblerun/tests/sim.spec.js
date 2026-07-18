/* 케이파크 · 마블런 — tests/sim.spec.js
 * 순수 로직 테스트. 실행: node kpark/marblerun/tests/sim.spec.js
 */
'use strict';
require('../core/hexgrid.js');
require('../core/parts/basic.js');
require('../core/graph.js');
require('../core/sim.js');
require('../core/serialize.js');
require('../core/tracks.js');
require('../core/builder.js');
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
    const t = NS.buildTrack(c.pieces);
    assert(t.ok, JSON.stringify(t.errors));
    const sim = new NS.Sim(NS.buildPathData(t.points, t.bowlIndexRanges));
    sim.release(0);
    const ev = sim.runToEnd(60);
    assert(ev.some(e => e.type === 'goal'),
      '완주 실패 (status=' + sim.status + ', s=' + sim.s.toFixed(3) + '/' + sim.pd.total.toFixed(3) + ')');
  });
}

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
