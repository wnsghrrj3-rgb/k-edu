// 화면 없는 한 판(13 문서 9절 · 04 문서 8절 봇 시뮬) — three·DOM 없이 sim/ 만으로 숲 1-1 전투장 완주
// node tests/sim/run.mjs [--bot 0.75] [--react 0.4] [--n 20]   STAGE=forest-1-2|forest-1-3 node tests/sim/run.mjs (v1.6~1.7 스테이지 고르기)
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? +process.argv[i + 1] : d; };

export function playOne({ data, seed, acc = .75, react = .4, grade = 1, maxT = 600, record = null, unlock = process.env.UNLOCK || null, stage = process.env.STAGE || null, progress = null, rand = Math.random, inputLog = null }){
  const f = createFlow({ data, grade, seed, unlock, stage, forceStage: !!stage, progress }); f.action('start', { mode: 'keyboard', seed }); f.action('enter');
  const g = f.game, dt = 1 / 60; let nextAtk = 0, plan = [], seenTele = new Set(), qAnswerAt = null, castAt = null, lastQ = null, minHp = 100, hash = 0, slowSum = 0, pzAt = null, lastPz = null, duckOn = false, railT = 0;
  const push = (type, value = {}) => { g.input.push({ type, t: f.t * 1000, via: 'key', value }); if (inputLog) inputLog.push({ at: Math.round(f.t * 1000), type, value }); };
  while (f.t < maxT) {
    const s = g.snapshot(); minHp = Math.min(minHp, s.player.hp);
    if (s.screen === 'S13' || s.screen === 'S14') { if (s.screen === 'S14' && f.t < maxT - 5) { f.action('again'); continue; } break; }
    const P = s.player, t = f.t;
    // 예고를 보면 react 초 뒤 피함
    for (const e of s.enemies) if (e.telegraph && !seenTele.has(e.uid + ':' + e.telegraph.t0)) { seenTele.add(e.uid + ':' + e.telegraph.t0); const c = e.telegraph.center, r = e.telegraph.size[0] + .3 + .5;
      if (Math.abs(P.pos[0] - c[0]) < r) { let x = c[0] + (P.pos[0] >= c[0] ? r : -r); if (Math.abs(x) > 3.9) x = c[0] - Math.sign(x) * r; plan.push({ at: t + react, u: Math.max(-1, Math.min(1, x / 4)) }); } }
    if (s.boss) for (const [i, tg] of s.boss.telegraphs.entries()) { const key = 'b' + i + ':' + tg.t0; if (seenTele.has(key)) continue; seenTele.add(key);
      if (tg.avoid === 'duck') { plan.push({ at: t + react, duck: true }); plan.push({ at: g.gameT + (tg.t1 - g.gameT) / Math.max(.15, g.slow) + .6 > 0 ? t + (tg.t1 - s.gameT) + .7 : t + 2, duck: false }); continue; }
      const half = tg.shape === 'line' ? tg.size[0] / 2 + .5 : tg.size[0] + .8; let dx;
      if (tg.shape === 'line') { const sx = Math.sin(tg.yaw), sz = Math.cos(tg.yaw); const rx = P.pos[0] - tg.center[0], rz = P.pos[2] - tg.center[2]; dx = rx * sz - rz * sx; if (Math.abs(dx) < half) { const side = dx >= 0 ? 1 : -1; let x = P.pos[0] + side * (half - Math.abs(dx) + .3) / Math.max(.3, Math.abs(sz)); if (Math.abs(x) > 3.9) x = P.pos[0] - side * (half + Math.abs(dx) + .3); plan.push({ at: t + react, u: Math.max(-1, Math.min(1, x / 4)) }); } }
      else if (Math.abs(P.pos[0] - tg.center[0]) < half) { let x = tg.center[0] + (P.pos[0] >= tg.center[0] ? half : -half); if (Math.abs(x) > 3.9) x = tg.center[0] - Math.sign(x) * half; plan.push({ at: t + react, u: Math.max(-1, Math.min(1, x / 4)) }); } }
    plan = plan.filter(p => { if (t >= p.at) { if (p.duck != null) push('DUCK', { on: p.duck }); else push('MOVE', { u: p.u }); return false; } return true; });
    // 길 구간(v1.5): 앞 장애물을 보고 react 초 뒤 비키거나 숙임 · 반딧불·상자는 줍기 · 퍼즐은 react+읽기 뒤 정답률대로
    if (s.world.zone === 'rail' && s.screen === 'S08' && s.obstacles) { railT += dt; const sp = Math.max(1, s.world.rail.speed), xm = s.world.rail.xMax;
      const ahead = s.obstacles.filter(o => o.state === 'ahead' && o.pos[2] > 0).sort((a, b) => a.pos[2] - b.pos[2]); const near = ahead[0];
      if (near && near.pos[2] / sp <= react + .9) {   // 이 장애물 차례
        if (near.kind === 'rock') { if (Math.abs(P.pos[0] - near.pos[0]) < near.r + .5 && !plan.length) { const x = near.pos[0] + (near.pos[0] <= 0 ? 1 : -1) * (near.r + .7); plan.push({ at: t + react * .5, u: Math.max(-1, Math.min(1, x / xm)) }); } }
        else if (near.kind === 'branch') { if (!duckOn) { duckOn = true; push('DUCK', { on: true }); } }
        else if ((near.kind === 'firefly' || near.kind === 'chest') && !plan.length && Math.abs(P.pos[0] - near.pos[0]) > .4) plan.push({ at: t + react * .5, u: Math.max(-1, Math.min(1, near.pos[0] / xm)) }); }
      if (duckOn && !s.obstacles.some(o => o.state === 'ahead' && o.kind === 'branch' && o.pos[2] < sp * (react + .9) + .6)) { duckOn = false; push('DUCK', { on: false }); } }
    else if (duckOn && s.screen === 'S08') { duckOn = false; push('DUCK', { on: false }); }
    if (s.screen === 'S08P' && s.puzzle) { const pz = s.puzzle;
      if (lastPz !== pz.id) { lastPz = pz.id; pzAt = t + react + 1.5 + rand(); }
      if (pz.state === 'open' && t >= pzAt) { const ok = rand() < acc; const g2 = f.game.puzzle.cur;
        if (pz.stones) { const ans = g2.answer, pool = [0, 1, 2]; const want = ok ? ans : (ans.length === 2 ? [ans[0], pool.find(x => !ans.includes(x))] : [(ans[0] + 1) % 3]); for (const sl of want) push('SELECT', { slot: sl }); }
        else push('MOVE', { u: (ok ? g2.answer : (g2.answer === 'L' ? 'R' : 'L')) === 'L' ? -1 : 1 });
        pzAt = Infinity; } }
    if (s.screen === 'S08Q' && s.question) {
      if (lastQ !== s.question.id) { lastQ = s.question.id; qAnswerAt = t + react + 1.8 + 1.5 + rand() * 2; }
      if (s.question.state === 'open' && t >= qAnswerAt) { const right = g.q.v.correctSlot, slot = rand() < acc ? right : (right + 1) % 3; push('SELECT', { slot }); qAnswerAt = Infinity; }
    } else if (s.screen === 'S08') {
      const threat = s.enemies.some(e => e.telegraph && Math.abs(P.pos[0] - e.telegraph.center[0]) < e.telegraph.size[0] + .3) || !!(s.boss && s.boss.telegraphs.length);
      const cr = s.crystals[0];
      if (castAt != null) { if (t >= castAt) { push('CAST', { aim: 'auto' }); castAt = null; } }
      else if (cr && !threat && !plan.length && (P.mana < P.spellCost || cr.near)) { if (!cr.near) push('MOVE', { u: cr.pos[0] / 4 }); else if (t >= nextAtk) { push('ATTACK', { zone: 1, side: 'R' }); nextAtk = t + .67; } }
      else if (P.mana >= P.spellCost && P.castReady && (s.enemies.filter(e => e.state !== 'dead').length >= 2 || (s.boss && s.boss.state === 'kneel')) && !threat && g.canCast()) { push('CHARGE', { p: 0, start: true }); castAt = t + .55; }
      else if (t >= nextAtk && (s.enemies.some(e => e.state !== 'dead' && e.state !== 'spawn') || (s.boss && !['intro', 'phase', 'dead'].includes(s.boss.state)))) { push('ATTACK', { zone: 1, side: 'R' }); nextAtk = t + .67; }
    }
    f.step(dt); slowSum += g.slow < 1 ? dt : 0;
    for (const ev of f.drainEvents()) { hash = (hash * 31 + ev.type.length + (ev.amount || 0)) % 1000000007; if (record) record.push(ev); }
  }
  const st = g.stats; const bs = g.snapshot().boss; return { stage: g.stageId, shields: st.shields || 0, cracks: st.cracks || 0, bounces: st.bounces || 0, reward: g.rewardSpell || null, fireflies: st.fireflies || 0, puzzles: st.puzzles || 0, pzRight: st.puzzleRight || 0, obHit: st.obstaclesHit || 0, zone: g.zoneIdx, bossPhase: bs ? bs.phase + (bs.state === 'dead' ? 1 : 0) : -1, win: g.snapshot().screen === 'S13', t: Math.round(f.t), deaths: g.deaths, q: st.q, right: st.right, kills: st.kills, packClears: st.packClears || 0, shareRight: st.shareRight || 0, shareWrong: st.shareWrong || 0, minHp, qShare: Math.round(st.qTime / f.t * 100), hash, log: st.log };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = loadData(); const n = arg('n', 20);
  const rows = [];
  for (const react of [.25, .4, .6]) for (const acc of [.5, .75, .9]) {
    const rs = []; for (let i = 0; i < n; i++) rs.push(playOne({ data, seed: 1000 + i, acc, react }));
    const avg = k => Math.round(rs.reduce((a, r) => a + r[k], 0) / rs.length * 10) / 10;
    rows.push({ react, acc, zone: avg('zone'), boss: avg('bossPhase'), win: rs.filter(r => r.win).length + '/' + n, t: avg('t'), deaths: avg('deaths'), q: avg('q'), right: avg('right'), kills: avg('kills'), minHp: avg('minHp'), qShare: avg('qShare') + '%', ff: avg('fireflies'), pz: avg('pzRight') + '/' + avg('puzzles'), obHit: avg('obHit'), sh: avg('shields'), bn: avg('bounces') });
  }
  console.table(rows);
}
