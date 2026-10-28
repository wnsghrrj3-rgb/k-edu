// v1.9 S04 월드 지도(10 문서 S04 받침대 + S06 지도 합침) — 화면 없이 sim/ 만으로(node tests/sim/p7.mjs)
// 흐름 start → S04 → enter → S08 · 결과 map → S04(마스터리·progress 유지) · 손 유지(targets kind 'map')·키보드 ←→ 1~4 Enter·클릭(pick) · 잠김 토스트 · 받침대 6 · ?stage= 강제는 지도 없이
import { createFlow } from '../../sim/flow/screens.js';
import { INPUT } from '../../sim/input/config.js';
import { loadData } from './load.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.snapshot(), ev)) break; } return ev; };
const S = ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss'];
const center = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

// ── 1. 데이터: worlds.json 결정 6·월드 6(숲만 열림) · targets.json map 노드 4(지름 ≥ 15%)·enter
{ const W = data.worlds, M = data.layout.map;
  ok('worlds.json 결정 6 · 월드 6 · 숲 열림·수의 결정, 나머지 닫힘', W.crystals.length === 6 && W.worlds.length === 6 && W.worlds[0].id === 'forest' && W.worlds[0].open && W.worlds[0].crystal === 'number' && W.worlds.slice(1).every(w => !w.open) && W.worlds.every((w, i) => w.crystal === W.crystals[i]));
  ok('targets.json map 노드 4 · 지름 ≥ 15% · enter', M.node.length === 4 && M.node.every(n => n.rect.w >= .15) && M.enter && M.enter.rect.w >= .15);
  const far = M.node.every((a, i) => M.node.every((b, j) => i === j || Math.hypot((a.rect.x - b.rect.x), (a.rect.y - b.rect.y) / (16 / 9)) >= a.rect.w)); ok('노드끼리 겹치지 않음', far); }

// ── 2. start(키보드) → S04 · 지도 모델 · 받침대
{ const f = createFlow({ data, grade: 1, seed: 1 }); const ev = []; f.action('start', { mode: 'keyboard' }); ev.push(...f.drainEvents()); const s = f.snapshot();
  ok('start → S04 · screen 이벤트 S01→S04', s.screen === 'S04' && ev.some(e => e.type === 'screen' && e.from === 'S01' && e.to === 'S04'));
  ok('map: 숲 · 1-1 고름 · 스테이지 4 · learn = 1-1 개념 · 권장 Lv1 · 별 0', s.map && s.map.world === 'forest' && s.map.worldName === '숫자의 숲' && s.map.stage === S[0] && s.map.stages.length === 4 && s.map.learn.join() === data.stages[S[0]].concepts.join() && s.map.recLevel === 1 && s.map.stars === 0, JSON.stringify(s.map && s.map.learn));
  ok('targets 5(kind map: stage:×4 + enter) · 잠긴 노드도 눌림(enabled) · enter 안 잠김', s.targets.length === 5 && s.targets.every(t => t.kind === 'map') && s.targets.slice(0, 4).every((t, i) => t.id === 'stage:' + S[i]) && s.targets[4].id === 'enter' && !s.targets[4].locked && s.targets[1].locked && !s.targets[0].locked);
  ok('받침대 6 · 하나도 없음 · 숲만 open', s.map.pedestals.length === 6 && s.map.pedestals.every(p => !p.got) && s.map.pedestals[0].open && s.map.pedestals[0].crystal === 'number' && !s.map.pedestals[1].open);
  ok('wantModes: 키보드 S04 = []', f.wantModes().length === 0);
  const f2 = createFlow({ data, grade: 1, seed: 1, progress: { level: 5, xp: 40, cleared: { [S[0]]: 3, [S[1]]: 2, [S[2]]: 1, [S[3]]: 3 }, crystals: ['number'] } }); f2.action('start', { mode: 'keyboard' }); const s2 = f2.snapshot();
  ok('깬 기록·결정: 별 9 · Lv5 · ✦40 · 받침대 1번 got · 모두 열림', s2.map.stars === 9 && s2.map.level === 5 && s2.map.xp === 40 && s2.map.pedestals[0].got && s2.map.stages.every(z => !z.locked) && s2.map.stages[3].final && s2.map.stages[3].crystal === 'number'); }

// ── 3. 키보드: →로 잠긴 노드 고르면 토스트·안 넘어감 · Enter 잠김 토스트 · ← 1-1 Enter → S08
{ const f = createFlow({ data, grade: 1, seed: 2 }); f.action('start', { mode: 'keyboard' }); f.drainEvents();
  f.key('ArrowRight', true, 0); let ev = f.drainEvents(); let s = f.snapshot();
  ok('→ 1-2(잠김): map:pick locked via key · 토스트 map.locked.forest-1-2 · 고름은 1-1 그대로', ev.some(e => e.type === 'map:pick' && e.stage === S[1] && e.locked && e.via === 'key') && s.toast === 'map.locked.forest-1-2' && s.map.stage === S[0], s.toast);
  run(f, 3); ok('토스트 2.6초 뒤 사라짐', f.snapshot().toast === null);
  f.key('Digit4', true, 0); s = f.snapshot(); ok('4 = 보스(잠김) 토스트', s.toast === 'map.locked.forest-1-boss' && s.map.stage === S[0]);
  f.key('ArrowLeft', true, 0); f.key('Enter', true, 0); ev = f.drainEvents(); s = f.snapshot();
  ok('Enter → S08 1-1 · map:enter via key · screen S04→S08', f.screen === 'S08' && f.game && f.game.stageId === S[0] && ev.some(e => e.type === 'map:enter' && e.via === 'key') && ev.some(e => e.type === 'screen' && e.from === 'S04' && e.to === 'S08') && s.map === undefined);
  const f2 = createFlow({ data, grade: 1, seed: 2, progress: { level: 3, xp: 0, cleared: { [S[0]]: 3, [S[1]]: 1 } } }); f2.action('start', { mode: 'keyboard' }); f2.key('Digit3', true, 0); const s3 = f2.snapshot();
  ok('1-2 깬 기록: 3 → 1-3 고름 · learn = 1-3 개념 6 · 권장 Lv3 · 별 4', s3.map.stage === S[2] && s3.map.learn.length === 6 && s3.map.recLevel === 3 && s3.map.stars === 4);
  f2.key('Space', true, 0); ok('Space 들어가기 → 1-3', f2.game && f2.game.stageId === S[2]);
  const f3 = createFlow({ data, grade: 1, seed: 2 }); f3.action('start', { mode: 'keyboard' }); f3.action('pick', { stage: S[1] }); ok('클릭 pick 잠김 → 토스트', f3.snapshot().toast === 'map.locked.forest-1-2'); f3.action('enter'); ok('enter(1-1) 클릭 → 게임', !!f3.game && f3.game.stageId === S[0]);
  f3.key('Escape', true, 0); ok('게임 중 Esc 는 지도 키 아님(멈춤)', f3.screen === 'S08'); const f4 = createFlow({ data, grade: 1, seed: 2 }); f4.action('start', { mode: 'keyboard' }); f4.key('Escape', true, 0); ok('지도 Esc → S01', f4.screen === 'S01' && !f4.game); }

// ── 4. 손 유지(마우스·카메라): targets rect 가운데 커서 유지 → SELECT · 잠긴 노드 토스트 · enter → 게임
{ const f = createFlow({ data, grade: 1, seed: 3 }); f.action('start', { mode: 'mouse' }); f.drainEvents();
  ok('마우스 모드 S04 wantModes = hands', f.wantModes().join() === 'hands');
  const T = f.snapshot().targets, c1 = center(T[1].rect); let picked = -1, hoverSeen = 0;
  for (let i = 0; i < 120; i++) { f.hand([, , , , , , , , , { x: c1.x * 640, y: c1.y * 480 }], 640, 480); f.step(1 / 60); const s = f.snapshot(); hoverSeen = Math.max(hoverSeen, s.targets[1].hover); const ev = f.drainEvents(); if (picked < 0 && ev.some(e => e.type === 'map:pick' && e.via === 'hand')) picked = i; }
  ok('손 유지 → 잠긴 1-2 pick(hand) · 유지 시간 ≈ hold · hover 가 차오름 · 토스트', picked > 0 && Math.abs(picked / 60 * 1000 - INPUT.select.hold) < 120 && hoverSeen > .5 && f.snapshot().toast === 'map.locked.forest-1-2', `${picked}f hover ${hoverSeen}`);
  ok('커서가 스냅샷 input.cursor 에', f.snapshot().input.cursor && f.snapshot().input.cursor.x > 0);
  const ce = center(T[4].rect); for (let i = 0; i < 120 && !f.game; i++) { f.hand([, , , , , , , , , { x: ce.x * 640, y: ce.y * 480 }], 640, 480); f.step(1 / 60); f.drainEvents(); }
  ok('손 유지 enter → S08 1-1', !!f.game && f.screen === 'S08' && f.game.stageId === S[0]);
  const g = createFlow({ data, grade: 1, seed: 3 }); g.action('start', { mode: 'mouse' }); for (let i = 0; i < 60; i++) { g.hand(null, 640, 480); g.step(1 / 60); } ok('손 없으면 아무것도 안 고름', g.screen === 'S04' && g.snapshot().input.cursor === null); }

// ── 5. 카메라: 보정값 있으면 S04 바로 · 없으면 S17 → 건너뛰기 → S04 · ?stage=(forceStage) 는 지도 없이
{ const f = createFlow({ data, grade: 1, seed: 4, cal: { sw: .2 } }); f.action('start', { mode: 'camera' }); ok('카메라+보정값 → S04 · wantModes hands', f.screen === 'S04' && f.wantModes().join() === 'hands');
  const f2 = createFlow({ data, grade: 1, seed: 4 }); f2.action('start', { mode: 'camera' }); ok('카메라 첫 판 → S17', f2.screen === 'S17'); for (let k = 0; k < 4; k++) { f2.action('calib-skip'); for (let i = 0; i < 5; i++) { f2.pose(null, f2.t * 1000, 640, 480); f2.step(1 / 60); } } ok('보정 건너뛰기 4번 → S04', f2.screen === 'S04' && !f2.game);
  const f3 = createFlow({ data, grade: 1, seed: 4, stage: S[2], forceStage: true }); f3.action('start', { mode: 'keyboard' }); ok('?stage= 강제 = 지도 없이 바로 1-3', f3.screen === 'S08' && f3.game.stageId === S[2]);
  const f4 = createFlow({ data, grade: 1, seed: 4 }); f4.action('start', { mode: 'keyboard', stage: S[0] }); ok('start 에 stage 를 줘도 지도 거침', f4.screen === 'S04'); }

// ── 6. 결과 → map: S04 로 · progress·마스터리 유지 · 깬 기록이 지도에 보임 · 다시 enter 하면 같은 마스터리
{ const f = createFlow({ data, grade: 1, seed: 5 }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game, m = g.qe.m, prog = g.progress; run(f, 2);
  prog.cleared[S[0]] = 3; prog.unlocked.push('shield'); f.action('map'); const ev = f.drainEvents(); const s = f.snapshot();
  ok('map → S04 · 게임 없음 · screen S08→S04', f.screen === 'S04' && !f.game && ev.some(e => e.type === 'screen' && e.to === 'S04'));
  ok('지도에 깬 기록: 1-1 ⭐3 · 1-2 열림 · 별 3 · progress 같은 객체', s.map.stages[0].stars === 3 && !s.map.stages[1].locked && s.map.stars === 3 && f.progress === prog);
  f.key('ArrowRight', true, 0); f.key('Enter', true, 0); ok('1-2 enter → 같은 마스터리·progress 로 새 판 · 방패 장착 가능', f.game && f.game.stageId === S[1] && f.game.qe.m === m && f.game.progress === prog && f.game.unlocked.has('shield'));
  f.action('home'); const f2 = f; ok('home → S01 · 마스터리 보관', f2.screen === 'S01' && !f2.game && f2.mastery === m); f2.action('start', { mode: 'keyboard' }); f2.action('enter'); ok('S01 에서 다시 시작해도 마스터리 이어짐', f2.game.qe.m === m); }

// ── 7. S01 스냅샷 호환(title.stages 그대로) · S04 title.char
{ const f = createFlow({ data, grade: 1, seed: 6 }); const s = f.snapshot(); ok('S01 title.stages 4 · map null', s.title.stages.length === 4 && s.map === null && s.targets.length === 0); f.action('start', { mode: 'keyboard', char: 'tori' }); ok('S04 title.char = tori(메뉴 캐릭터 그리기용)', f.snapshot().title.char === 'tori'); }

console.table(out); console.log(fail ? `✗ ${fail} 실패` : '전부 통과'); process.exit(fail ? 1 : 0);
