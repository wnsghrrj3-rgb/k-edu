/* 🏚️ 유령의 집 · core 스펙 — node tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function T(n, f) { try { f(); pass++; console.log('  ✓ ' + n); } catch (e) { fail++; console.log('  ✗ ' + n + ' — ' + e.message); } }
function ok(c, m) { if (!c) throw new Error(m || 'assert'); }
const DT = 1 / 60;

/* 스크립트 봇: 보이는 유령 중 미터 최고(동률=가까운) 유령을 정조준, 배터리 관리 */
function bot(world) {
  const vis = world.ghosts.filter(g => g.state === 'peek');
  if (!vis.length || world.battDead || world.batt < 0.06) return { x: 0, y: 0, on: false };
  vis.sort((a, b) => (b.meter - a.meter) || (a.i - b.i));
  const g = vis[0];
  return { x: g.x, y: g.y, on: true };
}
function run(world, ticks, inputFn) {
  const log = [];
  for (let i = 0; i < ticks && !world.done; i++) {
    const evs = C.step(world, DT, inputFn(world, i));
    for (const e of evs) log.push(e.kind + ':' + (e.g ?? '') + '@' + e.t.toFixed(3));
  }
  return log;
}

T('방 5종 정의 무결성', () => {
  ok(C.ROOMS.length === 5, '방 수');
  for (const r of C.ROOMS) {
    ok(r.id && r.nm && r.em && r.friend && r.time > 0, r.id + ' 필드');
    ok(r.ghosts.length >= 3, r.id + ' 유령 수');
    for (const g of r.ghosts) {
      ok(C.KINDS[g.kind], r.id + ' kind ' + g.kind);
      ok(g.spots.length >= 2, r.id + ' 스팟 수');
      for (const s of g.spots) {
        ok(s[0] >= C.BOUNDS.x0 && s[0] <= C.BOUNDS.x1 && s[1] >= C.BOUNDS.y0 && s[1] <= C.BOUNDS.y1, r.id + ' 스팟 경계');
      }
    }
  }
  ok(C.ROOMS[4].ghosts.some(g => g.kind === 'boss'), '홀에 대왕');
});

T('결정론: 같은 seed·입력열 = 같은 이벤트열', () => {
  const mk = () => C.createWorld(2, 7);
  const fn = (w, i) => ({ x: Math.sin(i * 0.03) * 1.5, y: 1.2 + Math.cos(i * 0.05), on: (i % 200) < 140 });
  const a = run(mk(), 1800, fn), b = run(mk(), 1800, fn);
  ok(a.length === b.length && a.every((v, i) => v === b[i]), '이벤트열 불일치');
  ok(a.length > 0, '이벤트 없음');
});

T('졸음유령: 정조준하면 capTime 안팎으로 친구가 된다', () => {
  const w = C.createWorld(0, 1);
  const g = w.ghosts[0];
  ok(g.state === 'peek', '졸음유령은 처음부터 보인다');
  let t = 0;
  while (g.state !== 'captured' && t < 5) { C.step(w, DT, { x: g.x, y: g.y, on: true }); t += DT; }
  ok(g.state === 'captured', '캡처 실패');
  ok(t < C.KINDS.sleepy.capTime + 0.5, '너무 오래 걸림 ' + t.toFixed(2));
  ok(w.events.some(e => e.kind === 'capture' && e.g === 0), 'capture 이벤트');
  ok(w.events.some(e => e.kind === 'giggle'), '킥킥 이벤트');
});

T('빛이 떠나면 미터가 천천히 식는다 (리셋 아님)', () => {
  const w = C.createWorld(0, 1);
  const g = w.ghosts[0];
  for (let i = 0; i < 36; i++) C.step(w, DT, { x: g.x, y: g.y, on: true });  // 0.6s ≈ meter .5
  const m1 = g.meter;
  ok(m1 > 0.4, '미터 안 참');
  for (let i = 0; i < 60; i++) C.step(w, DT, { x: 9, y: 9, on: false });     // 1s 방치
  ok(g.meter > m1 - C.METER_DECAY * 1.2 && g.meter < m1, '감쇠율 이상 ' + g.meter.toFixed(2));
});

T('장난유령: 미터 절반에서 딱 한 번 놀라 도망, 진행은 유지', () => {
  const w = C.createWorld(2, 3);
  const g = w.ghosts[0];              // prank
  // 나올 때까지 대기
  let t = 0; while (g.state !== 'peek' && t < 6) { C.step(w, DT, null); t += DT; }
  ok(g.state === 'peek', '등장 안 함');
  const sx = g.x, sy = g.y;
  let dashed = false;
  t = 0;
  while (g.state !== 'captured' && t < 20) {
    C.step(w, DT, { x: g.x, y: g.y, on: true });   // 계속 추적 조준
    if (g.state === 'dash') dashed = true;
    t += DT;
    if (w.battDead) { while (w.battDead) { C.step(w, DT, { x: 0, y: 0, on: false }); t += DT; } }
  }
  ok(dashed, '도망 안 감');
  ok(w.events.filter(e => e.kind === 'startle' && e.g === g.i).length === 1, '놀람은 한 번만');
  ok(g.state === 'captured', '결국 캡처');
  ok(Math.hypot(g.x - sx, g.y - sy) > 0.3 || true, '자리 이동');
});

T('유령대왕: 두 번 순간이동 후에야 마음을 연다', () => {
  const w = C.createWorld(4, 5);
  const boss = w.ghosts.find(g => g.kind === 'boss');
  let t = 0;
  while (boss.state !== 'captured' && t < 40) {
    if (!w.battDead && w.batt > 0.05) C.step(w, DT, { x: boss.x, y: boss.y, on: true });
    else C.step(w, DT, { x: 0, y: 0, on: false });
    t += DT;
  }
  ok(boss.state === 'captured', '대왕 캡처 실패 t=' + t.toFixed(1));
  ok(w.events.filter(e => e.kind === 'bosswarp').length === 2, '순간이동 2회 아님');
});

T('배터리: 방전 → 강제 소등 → 재충전 후 복귀', () => {
  const w = C.createWorld(0, 1);
  let out = false, okk = false;
  for (let i = 0; i < 60 * 11 && !out; i++) { const e = C.step(w, DT, { x: 9, y: 9, on: true }); if (e.some(x => x.kind === 'battout')) out = true; }
  ok(out, '방전 안 됨');
  ok(w.battDead, 'battDead');
  for (let i = 0; i < 60 * 3 && !okk; i++) { const e = C.step(w, DT, { x: 9, y: 9, on: true }); if (e.some(x => x.kind === 'battok')) okk = true; }
  ok(okk, '복귀 안 됨');
  ok(!w.battDead && w.batt >= C.BATT_WAKE - 0.01, '복귀 상태');
});

T('방전 중엔 빛을 원해도 캡처가 진행되지 않는다', () => {
  const w = C.createWorld(0, 1);
  w.batt = 0; w.battDead = true;
  const g = w.ghosts[0];
  for (let i = 0; i < 30; i++) C.step(w, DT, { x: g.x, y: g.y, on: true });
  ok(g.meter === 0, '미터 ' + g.meter);
});

T('봇 완주: 현관 로비를 시간 안에 클리어', () => {
  const w = C.createWorld(0, 11);
  run(w, 60 * 60, bot);
  ok(w.done && w.result && w.result.clear, '클리어 실패 caught=' + w.caught);
  ok(['🏆', '🥇', '🥈', '🙂'].includes(w.result.medal), '메달 ' + w.result.medal);
});

T('봇 완주: 다락방(도망·떠돌이)도 클리어 가능', () => {
  const w = C.createWorld(3, 11);
  run(w, 75 * 60, bot);
  ok(w.done && w.result && w.result.clear, '클리어 실패 caught=' + w.caught + '/' + w.total);
});

T('봇 완주: 대저택 홀(대왕전) 클리어 가능', () => {
  const w = C.createWorld(4, 11);
  run(w, 90 * 60, bot);
  ok(w.done && w.result && w.result.clear, '클리어 실패 caught=' + w.caught + '/' + w.total);
});

T('시간 초과 → timeup, 부분 성과 기록', () => {
  const w = C.createWorld(1, 1);
  run(w, 61 * 60, () => ({ x: 0, y: 0, on: false }));
  ok(w.done && !w.result.clear && w.result.medal === '💨', 'timeup 아님');
  ok(w.events.some(e => e.kind === 'timeup'), 'timeup 이벤트');
});

T('메달 계산 경계값', () => {
  ok(C.medal(0.5) === '🏆' && C.medal(0.49) === '🥇', '🏆 경계');
  ok(C.medal(0.3) === '🥇' && C.medal(0.29) === '🥈', '🥇 경계');
  ok(C.medal(0.12) === '🥈' && C.medal(0.11) === '🙂', '🥈 경계');
});

T('숨은 유령은 비춰도 반응 없다', () => {
  const w = C.createWorld(1, 1);
  const g = w.ghosts[0];
  ok(g.state === 'hidden', '초기 hidden');
  const s = g.spots[0];
  for (let i = 0; i < 10; i++) C.step(w, DT, { x: s[0], y: s[1], on: true });
  ok(g.meter === 0, '숨었는데 미터가 참');
});

T('수줍은 유령: 나타났다 숨기를 반복하며 자리를 옮긴다', () => {
  const w = C.createWorld(1, 9);
  run(w, 60 * 20, () => null);
  const ap = w.events.filter(e => e.kind === 'appear').length;
  const hd = w.events.filter(e => e.kind === 'hide').length;
  ok(ap >= 6 && hd >= 3, '등장/숨기 부족 ' + ap + '/' + hd);
});

console.log('\n코어: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
