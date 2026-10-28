// v1.8 1-보스 「고대 나무 심장」(09 문서 4-2 보스 행 · 1절 보스 전 한마디·보스 후 결정 복구 · 12행 「수의 결정」) — 화면 없이 sim/ 만으로(node tests/sim/p6.mjs)
// 잠김(1-3 뒤)·👑 final → 짧은 길 20초(바위 2·가지 1·상자 1·반딧불 4·몬스터 0) → 보스방 바로(길 상태 정리, 체력 +20, 숫자 골렘 페이즈 HP ×1.2) → 클리어 = 「수의 결정」 progress.crystals 한 번만
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const SB = 'forest-1-boss', ST = data.stages[SB];
const flowAt = (zone, seed = 11, extra = {}) => { const f = createFlow(Object.assign({ data, grade: 1, seed, stage: SB, forceStage: true, startZone: zone }, extra)); f.action('start', { mode: 'keyboard' }); f.action('enter'); return f; };

// ── 1. 스테이지 데이터·목록: 4번째 · 1-3 뒤 · final · 보상 crystal(마법 아님) · 구역 2(길→보스)
{ ok('구역 2(길 20초 76m → 보스 num-golem hpMul 1.2 heal 20)', ST.zones.length === 2 && ST.zones[0].type === 'rail' && ST.zones[0].seconds === 20 && ST.zones[0].len === 76 && ST.zones[1].type === 'boss' && ST.zones[1].boss === 'num-golem' && ST.zones[1].hpMul === 1.2 && ST.zones[1].heal === 20);
  ok('길에 몬스터 0 · 바위 2·가지 1·상자 1·반딧불 4', ST.zones[0].enemies.length === 0 && ST.zones[0].obstacles.rock === 2 && ST.zones[0].obstacles.branch === 1 && ST.zones[0].chest === 1 && ST.zones[0].fireflies === 4);
  ok('final · 보상 = crystal number(spell 없음) · 별 반딧불 3', ST.final === true && ST.reward.crystal === 'number' && !ST.reward.spell && ST.stars.fireflies === 3);
  const f = createFlow({ data, grade: 1, seed: 1, progress: { xp: 0, level: 3, cleared: { 'forest-1-1': 3, 'forest-1-2': 2 } } }); const t = f.snapshot().title;
  ok('시작 화면 스테이지 4개 · 보스는 4번째 · 잠김(1-3 안 깸) · final · crystal number · reward null', t.stages.length === 4 && t.stages[3].id === SB && t.stages[3].locked && t.stages[3].requires === 'forest-1-3' && t.stages[3].final && t.stages[3].crystal === 'number' && t.stages[3].reward === null, JSON.stringify(t.stages[3]));
  f.action('start', { mode: 'keyboard', stage: SB }); f.action('enter'); ok('잠긴 채 고르면 1-1 로 감', f.game.stageId === 'forest-1-1');
  const f2 = createFlow({ data, grade: 1, seed: 1, progress: { xp: 0, level: 4, cleared: { 'forest-1-1': 3, 'forest-1-2': 2, 'forest-1-3': 1 }, unlocked: ['shield', 'ice', 'lightning'] } });
  ok('1-3 깬 기록이 있으면 열림 · 결정 0', !f2.snapshot().title.stages[3].locked); f2.action('start', { mode: 'keyboard', stage: SB }); f2.action('enter');
  const w = f2.game.snapshot().world; ok('시작 · 이름 「고대 나무 심장」 · world.heart·final · crystals [] · 마법 3종 장착 가능', f2.game.stageId === SB && w.stageName === '고대 나무 심장' && w.heart && w.final && Array.isArray(w.crystals) && w.crystals.length === 0 && ['ice', 'lightning'].every(k => f2.game.spellList().includes(k)), JSON.stringify([w.stageName, w.heart, w.final, w.crystals])); }

// ── 2. 길: 보스 전 한마디 toast.heart.rail · 20초 전후에 끝남 · 바로 보스방(rail null·heart 유지·heal) · toast.heart.boss
{ const f = flowAt(0, 21); const g = f.game; run(f, .1); const s = g.snapshot();
  ok('길 들어갈 때 토스트 toast.heart.rail(보스 전 한마디) · 길 길이 76', s.toast === 'toast.heart.rail' && s.world.rail && s.world.rail.len === 76 && s.world.zone === 'rail', s.toast);
  ok('길 위 몬스터 0', !g.rail.enemies.length && g.rail.obstacles.filter(o => o.kind === 'firefly').length === 4 && g.rail.obstacles.filter(o => o.kind === 'chest').length === 1);
  g.player.hp = 60; g.player.invulnUntil = 999; const t0 = g.gameT; const ev = run(f, 60, s => s.world.zone === 'boss'); const s2 = g.snapshot();
  ok('길 끝 → 보스방 바로(전투장 없음) · 15~30초', s2.world.zone === 'boss' && !!s2.boss && g.gameT - t0 >= 15 && g.gameT - t0 <= 30, `${(g.gameT - t0).toFixed(1)}초`);
  ok('보스방에서 world.rail null · 퍼즐 null · heart 유지 · 체력 +20(60→80)', s2.world.rail === null && !s2.puzzle && s2.world.heart && g.player.hp === 80 && !g.rail, `hp ${g.player.hp} rail ${JSON.stringify(s2.world.rail)}`);
  ok('보스 토스트 toast.heart.boss · zone:enter boss · boss:intro', s2.toast === 'toast.heart.boss' && ev.some(e => e.type === 'zone:enter' && e.zone === 'boss') && ev.some(e => e.type === 'boss:intro'), s2.toast);
  ok('페이즈 HP 240(200 ×1.2) · 원본 enemies.json 무변경', s2.boss.hpMax === 240 && g.boss.def.phases.every(p => p.hp === 240) && data.enemies['num-golem'].phases.every(p => p.hp === 200), `${s2.boss.hpMax}`); }

// ── 3. 1-1 보스는 그대로 200 · 1-1 토스트 그대로 toast.boss / toast.rail (회귀)
{ const f = flowAt(4, 3, { stage: 'forest-1-1' }); run(f, .1); const s = f.game.snapshot(); ok('1-1 보스 HP 200 · 토스트 toast.boss · heart false', s.boss.hpMax === 200 && s.toast === 'toast.boss' && !s.world.heart && !s.world.final, `${s.boss.hpMax} ${s.toast}`);
  const f2 = flowAt(0, 3, { stage: 'forest-1-1' }); run(f2, .1); ok('1-1 길 토스트 toast.rail 그대로', f2.game.snapshot().toast === 'toast.rail'); }

// ── 4. 클리어 → 수의 결정: reward crystal 이벤트 1회 · stage:clear crystal·final · result.crystal · progress.crystals · 두 번째 클리어엔 없음
{ const prog = { xp: 0, level: 4, cleared: { 'forest-1-1': 3, 'forest-1-2': 2, 'forest-1-3': 1 }, unlocked: ['shield', 'ice', 'lightning'] };
  const r1 = playOne({ data, seed: 777, acc: .9, react: .3, stage: SB, progress: prog, record: [] });
  ok('봇 완주(보스 3페이즈)', r1.win && r1.bossPhase === 3, `${r1.win} ph ${r1.bossPhase}`);
  ok('progress.crystals = [number] · cleared 보스 별 ≥ 1', prog.crystals && prog.crystals.length === 1 && prog.crystals[0] === 'number' && prog.cleared[SB] >= 1, JSON.stringify(prog.crystals));
  const r2 = playOne({ data, seed: 778, acc: .9, react: .3, stage: SB, progress: prog }); ok('두 번째 클리어: 결정 또 안 생김(1개 그대로)', r2.win && prog.crystals.length === 1);
  // 이벤트·결과 직접: 보스 바로 죽여 보기
  const f = flowAt(1, 5, { progress: { xp: 0, level: 4, cleared: {}, unlocked: [] } }); const g = f.game; run(f, 3); g.boss.phase = 2; g.boss.hp = 1; g.boss.phaseHp[0] = g.boss.phaseHp[1] = 0; g.boss.shield = 0; g.boss.state = 'chase';
  g.input.push({ type: 'ATTACK', t: 0, via: 'key', value: { zone: 1, side: 'R', power: 1 } }); const ev = run(f, 12, s => s.screen === 'S13');
  const rw = ev.filter(e => e.type === 'reward' && e.kind === 'crystal'), sc = ev.find(e => e.type === 'stage:clear');
  ok('클리어 → reward kind crystal 1회 · stage:clear {crystal number, final true, reward null}', g.snapshot().screen === 'S13' && rw.length === 1 && rw[0].crystal === 'number' && sc && sc.crystal === 'number' && sc.final === true && sc.reward === null, JSON.stringify(sc));
  const res = g.snapshot().result; ok('result.crystal number · final · world.crystals [number]', res && res.crystal === 'number' && res.final && g.snapshot().world.crystals.join() === 'number', JSON.stringify([res && res.crystal, res && res.final]));
  ok('비전 방패는 1-1 보스 몫 그대로(여기 보상 아님) — 보스 처치에 shield 해금 이벤트는 기존대로', ev.some(e => e.type === 'reward' && e.kind === 'spell' && e.spell === 'shield') && !res.reward); }

// ── 5. 1-1~1-3 결정 없음(회귀) · 1-3 클리어 result.crystal null
{ ok('1-1·1-2·1-3 reward.crystal 없음 · final 아님', ['forest-1-1', 'forest-1-2', 'forest-1-3'].every(id => !data.stages[id].final && !(data.stages[id].reward && data.stages[id].reward.crystal)));
  const r = playOne({ data, seed: 901, acc: .9, react: .3, stage: 'forest-1-3' }); ok('1-3 봇 완주 회귀', r.win); }

// ── 6. 봇 6판: 완주 · 문제 5~12 · 60~200초 · 반딧불 3↑(별) 달성 가능
{ const rs = []; for (let i = 0; i < 6; i++) rs.push(playOne({ data, seed: 700 + i, acc: .75, react: .4, stage: SB }));
  ok('봇 6판 전부 완주 · 3페이즈', rs.every(r => r.win && r.bossPhase === 3), rs.map(r => r.bossPhase).join());
  ok('문제 수 5~12(봉인+수정)', rs.every(r => r.q >= 5 && r.q <= 12), rs.map(r => r.q).join());
  ok('한 판 60~200초', rs.every(r => r.t >= 60 && r.t <= 200), rs.map(r => r.t).join());
  ok('반딧불 3↑ 봇 전부', rs.every(r => r.fireflies >= 3), rs.map(r => r.fireflies).join()); }

console.table(out); if (fail) { console.log(`✗ ${fail}개 실패`); process.exit(1); } console.log('전부 통과');
