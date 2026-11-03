// v2.15 월드 2 보스 「기하학 수호신」(16 문서 9절) — node tests/sim/p18.mjs
// 데이터·스테이지·문구 / 모양 벽 300(답 구멍 하나·같은 묶음 하나·1학년 물건 토스트) / 거울 분신 300(진짜 하나·같은 묶음 하나·ban) / 판 안: 벽 통과(몸 x) → 마나 +5·dodge · 벽 실패 → 피해 / 분신 가짜 → 폭발·보스 피해 0 · 진짜 → 경직·피해 / 마지막 봉인 칸 = 이름 판 / 봇 1~4학년 완주 / 숲·2-1 무변경(골든은 golden.mjs)
import { GAME } from '../../sim/game/config.js';
import { createFlow } from '../../sim/flow/screens.js';
import { makeWall, makeWarmWall, makeMirror, verifyMirror, verifyWall, MIRROR_SETS, WALL_X, MIRROR_X } from '../../sim/learn/guardian.js';
import { SHAPE_KEY_SETS } from '../../sim/learn/puzzles.js';
import { PIC, FAMILY } from '../../sim/learn/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-boss'], D = data.enemies['geo-guardian'];

// ── 1. 데이터·스테이지·문구
{ ok('enemies geo-guardian: boss · 3페이즈 200 · 보호막 0/2/3 · 공격 beam·wall·quake·mirror · 2페이즈 소환 shape-spirit-lite', D && D.boss && D.phases.length === 3 && D.phases.every(p => p.hp === 200) && D.phases.map(p => p.shield).join() === '0,2,3' && D.phases[2].attacks.join() === 'beam,wall,quake,mirror' && D.phases[0].attacks.join() === 'beam,wall' && D.phases[1].summonOnSeal === 'shape-spirit-lite' && ['beam', 'wall', 'quake', 'mirror'].every(k => D.attacks[k]));
  ok('공격 수치(9-3): 광선 12·벽 14 3초·천장 18·분신 8 hold 5 stun 2', D.attacks.beam.dmg === 12 && D.attacks.wall.dmg === 14 && D.attacks.wall.windup === 3 && D.attacks.quake.dmg === 18 && D.attacks.mirror.dmg === 8 && D.attacks.mirror.hold === 5 && D.attacks.mirror.stun === 2);
  ok('주기 4.0 · 3.4 · 2.6', D.phases.map(p => p.cycle).join() === '4,3.4,2.6');
  const L = data.enemies['shape-spirit-lite']; ok('소환 정령: 보호막 없음·HP 절반(22)', L && !L.spirit && L.hp === 22 && L.ranged);
  ok('temple-2-boss: world temple · requires temple-2-1 · final false · 보상 shape · 길 20초 몬스터 0 → 보스 geo-guardian 체력 +20', ST.world === 'temple' && ST.requires === 'temple-2-1' && ST.final === false && ST.reward.crystal === 'shape' && ST.zones[0].type === 'rail' && ST.zones[0].seconds === 20 && ST.zones[0].enemies.length === 0 && ST.zones[1].boss === 'geo-guardian' && ST.zones[1].heal === 20);
  const GT = data.gradeTable['temple-2-boss']; ok('변환표 temple-2-boss g2·g3·g4 = temple-2-1 과 같음', GT && ['g2', 'g3', 'g4'].every(k => JSON.stringify(GT[k].concepts) === JSON.stringify(data.gradeTable['temple-2-1'][k].concepts)));
  const keys = ['stage.temple-2-boss', 'map.locked.temple-2-boss', 'boss.geo-guardian', 'toast.guard.rail', 'toast.guard.boss', 'toast.wall.warm', 'toast.wall', 'toast.wall.solid', 'toast.wallPass', 'toast.wallHit', 'toast.mirror', 'toast.mirrorReal', 'toast.mirrorFake', 'toast.beam', 'toast.reward.crystal.shape', 'result.world2boss'];
  ok(`문구 키 ${keys.length}`, keys.every(k => typeof T[k] === 'string' && T[k].length > 0), keys.filter(k => !T[k]).join());
  ok('숲 4판·2-1 에 수호신 0', ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss', 'temple-2-1'].every(id => JSON.stringify(data.stages[id]).indexOf('geo-guardian') < 0)); }

// ── 2. 모양 벽 300 × 학년 — 답 구멍 하나·같은 묶음 하나·열쇠 문 학년 줄 그대로·자리 WALL_X
for (const grade of [1, 2, 3, 4]) { const rng = createRng(100 + grade); let bad = 0, solid = 0, fams = new Set(), note = '';
  for (let i = 0; i < 300; i++) { const W = makeWall(rng, grade); if (!verifyWall(W) || W.holes.length !== 3 || W.holes.some((h, k) => h.x !== WALL_X[k]) || !W.toast || !W.concept) { bad++; note = JSON.stringify(W).slice(0, 100); } if (W.toast.key === 'toast.wall.solid') solid++; fams.add(FAMILY[W.answerPic]); }
  const set = grade <= 1 ? SHAPE_KEY_SETS.g1 : grade === 2 ? SHAPE_KEY_SETS.g2 : grade === 3 ? SHAPE_KEY_SETS.g3 : SHAPE_KEY_SETS.g4;
  ok(`벽 ${grade}학년 300: 답 하나·구멍 3·자리 고정 · 묶음 ${[...fams].join('/')}`, bad === 0 && fams.size >= 2 && (grade !== 1 ? solid === 0 : solid === 300), note || `solid ${solid}`); }
{ const rng = createRng(9); let bad = 0; for (let i = 0; i < 100; i++) { const W = makeWarmWall(rng); if (!verifyWall(W) || W.holes.length !== 1 || W.answerPic || W.holes[0].pic || !WALL_X.includes(W.holes[0].x)) bad++; } ok('몸풀기 벽 100: 구멍 1·그림 없음·자리는 셋 중 하나', bad === 0); }

// ── 3. 거울 분신 300 × 학년 — 진짜 하나·같은 묶음 하나·ban 끼리 안 나옴·x 자리 MIRROR_X·문제 그림 ≠ 진짜 그림(변형이 있으면)
for (const grade of [1, 2, 3, 4]) { const rng = createRng(200 + grade); let bad = 0, same = 0, fams = new Set(), note = '';
  for (let i = 0; i < 300; i++) { const M = makeMirror(rng, grade); if (M.bodies.filter(b => b.real).length !== 1 || new Set(M.bodies.map(b => b.code)).size !== 3 || M.bodies.length !== 3 || M.bodies.some((b, k) => b.x !== MIRROR_X[k]) || M.real < 0) { bad++; note = JSON.stringify(M).slice(0, 100); } if (M.bodies[M.real].code === M.code) same++; fams.add(M.fam); }
  ok(`분신 ${grade}학년 300: 진짜 하나·같은 묶음 하나·ban 0 · 묶음 ${fams.size} · 같은 그림 ${same}`, bad === 0 && fams.size >= 3 && (grade === 1 ? same === 300 : same < 300), note); }   // 1학년 입체는 변형 1개 → 진짜 그림 = 문제 그림
ok('분신 학년 줄: 3학년 정사각형↔직사각형 ban · 4학년 정삼각형↔이등변 ban', MIRROR_SETS.g3.ban.square.includes('rect') && MIRROR_SETS.g3.ban.rect.includes('square') && MIRROR_SETS.g4.ban.equi.includes('iso') && MIRROR_SETS.g4.ban.iso.includes('equi'));

// ── 4. 판 안 — 벽 판정·분신 판정·이름 판 봉인(직접 조작)
function startBoss(seed, grade){ const f = createFlow({ data, grade, seed, stage: 'temple-2-boss', forceStage: true, startZone: 1, progress: { xp: 0, level: 3, cleared: {}, unlocked: ['shield'] } }); f.action('start', { mode: 'keyboard', seed }); f.action('enter'); const g = f.game; const ev = []; const step = n => { for (let i = 0; i < n; i++) { f.step(1 / 60); for (const e of f.drainEvents()) ev.push(e); } }; const push = (type, value = {}) => g.input.push({ type, t: f.t * 1000, via: 'key', value }); return { f, g, ev, step, push }; }
{ const { f, g, ev, step, push } = startBoss(5, 2); step(400); const b = g.boss; ok('보스 등장 → 1페이즈 chase · 보호막 0 · 스냅샷 nameKey', b && b.kind === 'geo-guardian' && b.phase === 0 && b.shield === 0 && g.snapshot().boss.nameKey === 'boss.geo-guardian' && g.snapshot().boss.kind === 'geo-guardian');
  // 벽 강제: 2페이즈로 올려 그림 벽을 내게
  b.phase = 1; b.hp = b.hpMax = 200; b.shield = 0; b.wallDue = true; b.lastAtk = -99; b.state = 'chase'; b.stateT = 0; g.q = null; step(5);
  ok('벽 공격 시작: attack wall · 예고 shape wall 구멍 3 · boss:wall 이벤트(answerPic·toast)', b.attack === 'wall' && b.wall && b.tgs[0].shape === 'wall' && b.tgs[0].holes.length === 3 && ev.some(e => e.type === 'boss:wall' && e.answerPic && e.toast && e.holes.length === 3), b.attack);
  const S = g.snapshot().boss; ok('스냅샷 wall·telegraphs[].holes', S.wall && S.wall.holes.length === 3 && S.wall.answerPic === b.wall.answerPic && !S.wall.judged && S.telegraphs[0].holes.length === 3);
  const ansX = b.wall.holes[b.wall.answer].x; push('MOVE', { u: ansX / 4 }); const mana0 = g.player.mana, hp0 = g.player.hp; const wind = D.attacks.wall.windup * g.band.windup; step(Math.ceil(wind * 60) + 20);
  const pass = ev.find(e => e.type === 'boss:wallPass'); ok('답 구멍 x 로 → 통과(ok·free 아님)', pass && pass.ok && !pass.free, JSON.stringify(pass) + ` mana ${mana0}→${g.player.mana} hp ${hp0}→${g.player.hp}`);
  ok('통과 뒤 마나 +5 · hp 그대로 · 로그 type wall correct', g.player.mana >= Math.min(g.player.manaMax, mana0 + 5) && g.player.hp === hp0 && g.stats.log.some(l => l.type === 'wall' && l.correct && l.via === 'body') && ev.some(e => e.type === 'dodge' && e.wall && e.perfect) && ev.some(e => e.type === 'boss:wallEnd'));
  // 틀린 구멍
  b.wallDue = true; b.lastAtk = -99; b.state = 'chase'; b.stateT = 0; b.lastKind = null; step(5); ok('두 번째 벽', b.attack === 'wall' && b.wall, b.attack);
  const wrong = b.wall.holes.find((h, i) => i !== b.wall.answer); push('MOVE', { u: wrong.x / 4 }); const hp1 = g.player.hp; step(Math.ceil(wind * 60) + 20);
  const fails = ev.filter(e => e.type === 'boss:wallPass'); const last = fails[fails.length - 1]; ok('틀린 구멍 → 실패 · 피해 14×학년 · answer·name 실림 · 로그 correct false', last && !last.ok && last.name && g.player.hp < hp1 && g.stats.log.some(l => l.type === 'wall' && !l.correct), JSON.stringify(last) + ` hp ${hp1}→${g.player.hp}`);
  // 봉인 중엔 벽을 안 냄 · 벽 중엔 봉인 문제를 안 엶
  ok('벽 통과 후 toast key wallPass / 실패 wallHit', T['toast.wallPass'] && T['toast.wallHit'].includes('{n}')); }
{ const { f, g, ev, step, push } = startBoss(6, 3); step(400); const b = g.boss;
  b.phase = 2; b.hp = b.hpMax = 200; b.shield = 0; b.lastAtk = -99; b.state = 'chase'; b.stateT = 0; b.lastKind = 'beam'; g.q = null;
  // mirror 강제: attacks 목록을 mirror 만으로 잠깐
  const saved = D.phases[2].attacks; D.phases[2].attacks = ['mirror']; step(5); D.phases[2].attacks = saved;
  ok('분신 공격 시작: attack mirror · 예고 shape mirror · toast.mirror', b.attack === 'mirror' && b.mirror && b.tgs[0].shape === 'mirror' && g.toast && g.toast.key === 'toast.mirror', b.attack);
  step(Math.ceil(D.attacks.mirror.windup * g.band.windup * 60) + 5);
  ok('섞임 뒤 hold · boss:mirror bodies 3(pic·x, real 없음) · 스냅샷 mirrors 3·mirrorPic·hold 비율', b.state === 'hold' && ev.some(e => e.type === 'boss:mirror' && e.bodies.length === 3 && e.bodies.every(m => m.real === undefined && m.pic)) && g.snapshot().boss.mirrors.length === 3 && g.snapshot().boss.mirrorPic === b.mirror.pic && g.snapshot().boss.hold > 0 && g.snapshot().boss.mirrors.every(m => m.real === undefined), b.state);
  // 가짜를 맞힘: 몸을 가짜 x 로 두고 hitBoss 경로(마법탄 대신 직접)
  const fake = b.mirror.bodies.find(m => !m.real), real = b.mirror.bodies.find(m => m.real); g.player.pos[0] = fake.x; g.player.targetX = fake.x; const hp0 = g.player.hp, bhp0 = b.hp;
  g.projectiles.push({ uid: 9001, kind: 'bolt', pos: [b.pos[0], 1, b.pos[2] - .3], vel: [0, 0, 0.1], target: b.uid, homing: 0, r: .6, left: 2, mult: 1, owner: 'player', pierce: 0, owner: 'player', hitSet: [] });
  step(6);
  const fk = ev.find(e => e.type === 'boss:mirrorHit' && e.real === false); ok('가짜 분신 맞힘 → mirrorHit real false · 플레이어 피해(8×학년) · 보스 HP 그대로 · 그 분신만 사라짐 · 로그 mirror correct false', !!fk && g.player.hp < hp0 && b.hp === bhp0 && b.mirror && b.mirror.bodies.filter(m => !m.gone).length === 2 && fake.gone && g.stats.log.some(l => l.type === 'mirror' && !l.correct), `hit ${!!fk} hp ${hp0}→${g.player.hp} bhp ${bhp0}→${b.hp} live ${b.mirror ? b.mirror.bodies.filter(m => !m.gone).length : '-'}`);
  ok('스냅샷 mirrors 2(사라진 것 빠짐)', g.snapshot().boss.mirrors.length === 2);
  // 진짜를 맞힘
  g.player.pos[0] = real.x; g.player.targetX = real.x; const hp1 = g.player.hp;
  g.projectiles.push({ uid: 9002, kind: 'bolt', pos: [b.pos[0], 1, b.pos[2] - .3], vel: [0, 0, 0.1], target: b.uid, homing: 0, r: .6, left: 2, mult: 1, owner: 'player', pierce: 0, owner: 'player', hitSet: [] });
  step(6);
  const rl = ev.find(e => e.type === 'boss:mirrorHit' && e.real === true); ok('진짜 맞힘 → mirrorHit real true · mirrorEnd real true · 경직(stun) · 보스 피해 · 플레이어 피해 0 · 로그 correct true', !!rl && ev.some(e => e.type === 'boss:mirrorEnd' && e.real === true) && b.state === 'stun' && b.hp < bhp0 && g.player.hp === hp1 && !b.mirror && g.stats.log.some(l => l.type === 'mirror' && l.correct), `${b.state} bhp ${bhp0}→${b.hp} snapshot stun ${g.snapshot().boss.stun}`);
  ok('스냅샷 stun 비율 > 0 · mirrors null', g.snapshot().boss.stun > 0 && g.snapshot().boss.mirrors === null);
  step(Math.ceil(D.attacks.mirror.stun * 60) + 10); ok('경직 끝 → chase', b.state === 'chase', b.state); }
{ // 분신 5초 지나면 셋이 동시에 광선 · 광선 끝에 분신 사라짐
  const { f, g, ev, step, push } = startBoss(7, 1); step(400); const b = g.boss; b.phase = 2; b.hp = b.hpMax = 200; b.shield = 0; b.lastAtk = -99; b.state = 'chase'; b.stateT = 0; b.lastKind = 'beam'; g.q = null;
  const saved = D.phases[2].attacks; D.phases[2].attacks = ['mirror']; step(5); D.phases[2].attacks = saved; step(Math.ceil(D.attacks.mirror.windup * g.band.windup * 60) + 5); ok('1학년 분신(입체 셋)·hold', b.state === 'hold' && b.mirror && b.mirror.bodies.every(m => ['box', 'cyl', 'ball'].includes(FAMILY[PIC[m.code]])), b.state);
  g.player.pos[0] = 3.9; g.player.targetX = 3.9; step(Math.ceil(D.attacks.mirror.hold * 60) + 3);
  ok('5초 뒤 셋이 동시에 광선: windup beam · 예고 line 3(beam) · toast.beam', b.state === 'windup' && b.attack === 'beam' && b.tgs.length === 3 && b.tgs.every(t => t.shape === 'line' && t.beam) && ev.some(e => e.type === 'telegraph:start' && e.attack === 'beam' && e.n === 3), `${b.state} ${b.attack} ${b.tgs.length}`);
  ok('스냅샷 telegraphs[].beam true · mirrors 3 그대로(광선 끝까지)', g.snapshot().boss.telegraphs.every(t => t.beam) && g.snapshot().boss.mirrors.length === 3);
  step(Math.ceil((D.attacks.beam.windup * g.band.windup + D.attacks.beam.dur) * 60) + 10); ok('광선 끝 → 분신 사라짐(mirrorEnd real null) · recover/chase', !b.mirror && ev.some(e => e.type === 'boss:mirrorEnd' && e.real === null) && ['recover', 'chase'].includes(b.state), b.state); }
{ // 마지막 봉인 칸 = 이름 판(신전) · 봉인 중 벽 0 · 벽 중 봉인 0
  const { f, g, ev, step, push } = startBoss(8, 2); step(400); const b = g.boss; b.phase = 2; b.hp = b.hpMax = 200; b.shield = b.shieldMax = 1; b.lastAtk = g.gameT; b.state = 'chase'; b.stateT = 0; g.q = null; g.lastQClose = -99;
  // 보스를 때려 봉인 문제 열기: 플레이어 근접 공격 대신 탄
  g.projectiles.push({ uid: 9003, kind: 'bolt', pos: [b.pos[0], 1, b.pos[2] - .3], vel: [0, 0, 0.1], target: b.uid, homing: 0, r: .6, left: 2, mult: 1, owner: 'player', pierce: 0, owner: 'player', hitSet: [] }); step(8);
  ok('3페이즈 마지막 칸 봉인 문제 = 이름 판(g2.plane.name) · 보기 nm-* 3 · 문제 그림', g.q && g.q.kind === 'seal' && g.q.v.concept === 'g2.plane.name' && g.q.v.choices.every(c => /^nm-/.test(c.pic || '')) && g.q.v.pic, g.q ? g.q.v.concept : 'q 없음');
  b.wallDue = true; b.lastAtk = -99; step(10); ok('봉인 문제가 열린 동안엔 벽 공격 0', b.attack !== 'wall' && !b.wall, b.attack); }

// ── 5. 봇 1~4학년 3판씩 완주(Lv3) · 벽·분신·광선 전부 한 번은 나옴 · 결과 crystal shape
{ const rows = []; let allWin = true, walls = 0, mirrors = 0, beams = 0, names = 0;
  for (const grade of [1, 2, 3, 4]) for (const seed of [72, 73, 74]) { const rec = []; const r = playOne({ data, seed, acc: .8, react: .35, grade, stage: 'temple-2-boss', progress: { xp: 0, level: 3, cleared: {}, unlocked: ['shield'] }, record: rec }); if (!r.win) allWin = false;
    walls += rec.filter(e => e.type === 'boss:wall').length; mirrors += rec.filter(e => e.type === 'boss:mirror').length; beams += rec.filter(e => e.type === 'telegraph:start' && e.attack === 'beam').length; names += r.log.filter(l => /\.name$/.test(l.concept || '')).length;
    rows.push({ grade, seed, win: r.win, t: r.t, minHp: r.minHp, q: r.q, right: r.right, walls: r.log.filter(l => l.type === 'wall').length, mirror: r.log.filter(l => l.type === 'mirror').length }); }
  console.table(rows); ok('봇 1~4학년 × 3판 전부 완주', allWin); ok(`12판 합: 벽 ${walls} · 분신 ${mirrors} · 광선 ${beams} · 이름 판 봉인 ${names} 전부 > 0`, walls > 0 && mirrors > 0 && beams > 0 && names > 0);
  ok('지도 받침대: 2-보스 보상 = 도형 결정(progress.crystals 에 shape, 토스트 키 존재)', T['toast.reward.crystal.shape'].includes('도형') && data.worlds.crystals[1] === 'shape'); }

console.table(out); console.log(fail ? `실패 ${fail}` : '전부 통과'); process.exit(fail ? 1 : 0);
