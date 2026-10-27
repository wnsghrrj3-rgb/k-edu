// P2 ④ — 강화 수정(07 문서 상황 B) · 큰 슬라임 분열(06 문서 3절) · 계산 고블린 도토리(원거리) — 화면 없이 sim/ 만으로(node tests/sim/p2c.mjs)
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { GAME } from '../../sim/game/config.js';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note) }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}, via = 'key') => g.input.push({ type, t: 0, via, value });
function setup(seed = 21, grade = 1){ const f = createFlow({ data, grade, seed, unlock: 'all' }); f.action('start', { mode: 'keyboard' }); const g = f.game; run(f, 2.0); return { f, g }; }
const empCr = g => g.crystals.find(c => c.kind === 'empower');
function openCrystal(f, g, kind = 'math'){ run(f, 30, s => s.crystals.some(c => c.kind === kind)); const c = g.crystals.find(c => c.kind === kind); if (!c) return false; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 6, s => { const x = s.crystals.find(y => y.uid === c.uid); return x && x.near; }); push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, .5); return g.screen === 'S08Q'; }

// ① 강화 수정 — 마나 100 → 3초 뒤 금빛 수정, 정답 = 20초 강화(불꽃탄 ×1.5·마법탄 강력), 오답 = 재도전 수정 1번, 15초 안 열면 사라짐, 판당 3번
{ const { f, g } = setup(); g.meteorOff = true;   // 별똥 자동 장착은 끄고(마나를 쓰지 않게) 순수 강화만 봄
  g.player.mana = 100; const ev = run(f, 6, s => s.crystals.some(c => c.kind === 'empower'));
  const c = empCr(g); ok('마나 100 → 금빛 수정 등장(≈3초)', !!c && g.gameT >= 2.9, `t=${g.gameT.toFixed(1)} kind=${c && c.kind}`);
  ok('crystal:spawn kind empower', ev.some(e => e.type === 'crystal:spawn' && e.kind === 'empower'));
  ok('수정 life 비율 스냅샷', g.snapshot().crystals.find(x => x.kind === 'empower').life <= 1);
  ok('강화 수정 열림(kind power)', openCrystal(f, g, 'empower') && g.q.kind === 'power', `kind=${g.q && g.q.kind}`);
  const s = g.snapshot(); ok('문제 종류 = 계산형(불꽃탄 = 연산 속도형)', s.question.kind === 'power' && s.question.type === 'calc1', s.question.type);
  ok('게이지 ×.75', Math.abs(g.q.total - 12 * 1.6 * 1.5 * .75) < 1e-6, g.q.total);
  run(f, 2.0); push(g, 'SELECT', { slot: g.q.v.correctSlot }); const ev2 = run(f, .2);
  ok('정답 → empower:on', ev2.some(e => e.type === 'empower:on' && e.t === 20) && g.snapshot().player.empowered, `empowerT=${g.snapshot().player.empowerT}`);
  run(f, 1.5); push(g, 'ATTACK', { zone: 1, side: 'R' }); const ev3 = run(f, .5);
  const fire = ev3.find(e => e.type === 'attack:fire'); ok('강화 중 기본 공격 = 강력 공격(power 1)', fire && fire.power === 1, JSON.stringify(fire));
  const bolt = g.projectiles.find(p => p.kind === 'bolt') || null; ok('강력 탄: 피해 ×1.6(관통 1은 맞으면 0)', !bolt || (bolt.mult === 1.6 && bolt.pierce >= 0), bolt ? `${bolt.mult}/${bolt.pierce}` : '이미 맞음');
  const evOff = run(f, 22, (s, ev) => ev.some(e => e.type === 'empower:off')); ok('20초 뒤 empower:off', evOff.some(e => e.type === 'empower:off') && !g.snapshot().player.empowered);
  // 오답 → 재도전 수정(쉬운 문제·같은 개념), 재도전도 틀리면 끝
  g.player.mana = 100; g.empowerAt = 0; run(f, 6, s => s.crystals.some(c => c.kind === 'empower')); ok('두 번째 강화 수정', !!empCr(g) && g.empowerN === 2, g.empowerN);
  ok('열림', openCrystal(f, g, 'empower')); const concept = g.q.v.concept; run(f, 2.0); push(g, 'SELECT', { slot: (g.q.v.correctSlot + 1) % 3 }); run(f, 3.6);
  const rc = empCr(g); ok('오답 → 재도전 수정 바로', !!rc && rc.retry, rc ? `retry=${rc.retry}` : '없음');
  ok('재도전 수정은 perRun 에 안 셈', g.empowerN === 2, g.empowerN);
  ok('재도전 열림', openCrystal(f, g, 'empower')); ok('같은 개념 쉬운 문제', g.q.v.retry && g.q.v.concept === concept && g.q.v.d <= .35, `${g.q.v.concept} d=${g.q.v.d}`);
  run(f, 2.0); push(g, 'SELECT', { slot: (g.q.v.correctSlot + 1) % 3 }); run(f, 3.6); ok('재도전 오답 → 더 없음', !empCr(g) && !g.snapshot().player.empowered);
  // 안 열면 15초 뒤 사라짐
  g.player.mana = 100; g.lastQClose = -99; run(f, 6, s => s.crystals.some(c => c.kind === 'empower')); const c3 = empCr(g); ok('세 번째(마지막) 강화 수정', !!c3 && g.empowerN === 3);
  const evF = run(f, 17, s => !s.crystals.some(c => c.kind === 'empower')); ok('15초 안 열면 사라짐(fade)', !empCr(g) && evF.some(e => e.type === 'crystal:break' && e.fade && e.uid === c3.uid));
  g.player.mana = 100; run(f, 8); ok('판당 3번 넘으면 안 나옴', !empCr(g) && g.empowerN === 3);
  ok('결과에 empowers', g.stats.empowers === 1, g.stats.empowers); }

// ② 큰 슬라임 — 죽으면 a+b 두 마리(가르기), 정답 6초 안이면 분열 없음
{ const { f, g } = setup(5); const { makeEnemy } = await import('../../sim/game/enemyAI.js');
  const big = makeEnemy(data.enemies['big-slime'], 900, 0, 7, g.rng, g.band, { label: 7 }); g.enemies.push(big); run(f, .7);
  ok('큰 슬라임 크기 1.5·HP 50', big.scale === 1.5 && big.hp === 50 && big.label === '7');
  g.lastRightT = -99; big.hp = 1; g.enemies.filter(e => e !== big).forEach(e => { e.state = 'dead'; });
  push(g, 'ATTACK', { zone: 1, side: 'R' }); const ev = run(f, 2.5, (s, ev) => ev.some(e => e.type === 'enemy:split'));
  const sp = ev.find(e => e.type === 'enemy:split'); const minis = g.enemies.filter(e => e.tags.includes('mini'));
  ok('분열 이벤트 parts a+b = 7', sp && !sp.prevented && sp.parts.length === 2 && sp.parts[0] + sp.parts[1] === 7, JSON.stringify(sp && sp.parts));
  ok('작은 슬라임 2마리 HP 15·크기 .72·숫자 = a,b', minis.length === 2 && minis.every(m => m.hpMax === 15 && m.scale === .72) && minis.map(m => +m.label).sort().join() === sp.parts.slice().sort().join(), minis.map(m => m.label).join('+'));
  ok('스냅샷 scale', g.snapshot().enemies.filter(e => e.scale === .72).length === 2);
  // 정답 직후 처치 → 분열 없음
  const big2 = makeEnemy(data.enemies['big-slime'], 901, 0, 7, g.rng, g.band, { label: 5 }); g.enemies.push(big2); run(f, .7); minis.forEach(m => { m.state = 'dead'; });
  g.lastRightT = g.gameT - 2; big2.hp = 1; push(g, 'ATTACK', { zone: 1, side: 'R' }); const ev2 = run(f, 2.5, (s, ev) => ev.some(e => e.type === 'enemy:split'));
  const sp2 = ev2.find(e => e.type === 'enemy:split'); ok('정답 6초 안 처치 → 분열 없음(prevented)', sp2 && sp2.prevented && g.enemies.filter(e => e.tags.includes('mini') && e.state !== 'dead').length === 0, JSON.stringify(sp2));
  ok('웨이브 데이터 큰 슬라임 숫자 5·6·7', JSON.stringify(data.stages['forest-1-1']).includes('"big-slime"'), '09 문서 4-1'); }

// ③ 계산 고블린 — 조준선(line) 예고 → 도토리(식 달림) → 서 있으면 맞고, 숙이면 지나가며 마나 +3, 거리 유지
{ const { f, g } = setup(9); const { makeEnemy } = await import('../../sim/game/enemyAI.js');
  g.enemies.forEach(e => { e.state = 'dead'; }); const gob = makeEnemy(data.enemies['calc-goblin'], 910, 0, 10, g.rng, g.band); g.enemies.push(gob);
  const ev = run(f, 8, (s, ev) => ev.some(e => e.type === 'enemy:shoot'));
  const tg = ev.find(e => e.type === 'telegraph:start' && e.uid === 910); ok('조준선 예고(line) 먼저', tg && tg.shape === 'line');
  const sh = ev.find(e => e.type === 'enemy:shoot'); ok('도토리 발사 + 식 라벨', sh && /^\d\+\d$/.test(sh.label), sh && sh.label);
  const ac = g.projectiles.find(p => p.kind === 'acorn'); ok('스냅샷 투사체 kind acorn·owner 적·label', ac && g.snapshot().projectiles.some(p => p.kind === 'acorn' && p.owner === 910 && p.label === sh.label));
  const hp0 = g.player.hp; const ev2 = run(f, 3, (s, ev) => ev.some(e => e.type === 'projectile:hit' || (e.type === 'dodge' && e.acorn)));
  ok('서 있으면 맞음(예고 뒤)', ev2.some(e => e.type === 'projectile:hit') && g.player.hp < hp0, `hp ${hp0}→${g.player.hp}`);
  ok('거리 유지(keep 6.5 근처, 가까이 안 옴)', Math.hypot(gob.pos[0] - g.player.pos[0], gob.pos[2] - g.player.pos[2]) >= 4.5, Math.hypot(gob.pos[0], gob.pos[2]).toFixed(1));
  // 숙이기로 피함
  const ev3 = run(f, 8, (s, ev) => ev.some(e => e.type === 'enemy:shoot')); push(g, 'DUCK', { on: true }); const m0 = g.player.mana, hp1 = g.player.hp;
  const ev4 = run(f, 3, (s, ev) => ev.some(e => e.type === 'projectile:hit' || (e.type === 'dodge' && e.acorn)));
  ok('숙이면 지나감 + 멋진 회피 마나 +3', ev4.some(e => e.type === 'dodge' && e.acorn && e.duck) && g.player.hp === hp1 && g.player.mana - m0 === 3, `mana ${m0}→${g.player.mana}`);
  push(g, 'DUCK', { on: false });
  // 옆으로 회피(날아오는 중)
  run(f, 8, (s, ev) => ev.some(e => e.type === 'enemy:shoot')); run(f, 2, s => s.projectiles.some(p => p.kind === 'acorn' && p.pos[2] - s.player.pos[2] < 3.5)); push(g, 'DODGE', { dir: 1 }); const hp2 = g.player.hp;
  const ev5 = run(f, 3, (s, ev) => ev.some(e => e.type === 'projectile:hit' || (e.type === 'dodge' && e.acorn)));
  ok('회피로 피하면 멋진 회피', ev5.some(e => e.type === 'dodge' && e.acorn) && g.player.hp === hp2);
  ok('문제 중엔 새 조준 없음', (() => { g.player.mana = 10; g.questionOpen = true; gob.lastAtk = -99; gob.state = 'chase'; const e = run(f, 3); g.questionOpen = false; return !e.some(x => x.type === 'telegraph:start' && x.uid === 910); })()); }

// ④ 봇 한 판(전투장 1·2 새 구성) — 전부 완주, 큰 슬라임 분열·고블린 등장
{ const rs = []; for (let i = 0; i < 6; i++) rs.push(playOne({ data, seed: 500 + i, acc: .75, react: .4, record: null }));
  ok('봇 6판 완주', rs.every(r => r.win), rs.map(r => r.win ? 'W' : 'L').join(''));
  ok('처치 수 ≥ 22(분열 포함, 정답 뒤 처치는 분열 없음)', rs.every(r => r.kills >= 22), rs.map(r => r.kills).join(','));
  const rec = []; playOne({ data, seed: 777, acc: .75, react: .4, record: rec });
  ok('한 판에 고블린 발사·큰 슬라임 분열 있음', rec.some(e => e.type === 'enemy:shoot') && rec.some(e => e.type === 'enemy:split'), `shoot ${rec.filter(e => e.type === 'enemy:shoot').length} split ${rec.filter(e => e.type === 'enemy:split').length}`);
  ok('예고 없는 도토리 피해 0', (() => { let last = -1; for (const e of rec) { if (e.type === 'telegraph:start' && e.shape === 'line') last = 1; if (e.type === 'projectile:hit') { if (last < 0) return false; } } return true; })());
  ok('봇 문제 시간 비율 ≤ 55%', rs.every(r => r.qShare <= 55), rs.map(r => r.qShare + '%').join(',')); }

console.table(out); console.log(fail ? `실패 ${fail}` : '전부 통과'); if (fail) process.exit(1);
