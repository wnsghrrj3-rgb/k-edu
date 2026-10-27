// 신분의 문 ④(132) — 데이터 열한 시대(문지기 문 19 전부 `open` 48자 안·연도 0) + 엔진(조선 전기): 꿈 한 줄 / 막아선 문지기에게 말 걸기 / 잠자리(spot) 3m 안이면 소품보다 잠들기 먼저
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const { Doors } = await import('../core/doors.js');
const { Life } = await import('../core/life.js');
const { Actor } = await import('../core/actor.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const read = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f), 'utf8'));
// ---- 데이터 ----
let n = 0;
for (const era of ERAS) {
  const w = read(era, 'world.json'); const why = [];
  for (const d of w.doors.list) { if (!d.npc) { if (d.open) why.push(`${d.id} npc 없는데 open`); continue; } n++; if (!d.open) why.push(`${d.id} open 없음`); else { if (d.open.length > 48) why.push(`${d.id} ${d.open.length}자`); if (/\d/.test(d.open)) why.push(`${d.id} 연도`); if (!/열|든다|배운다|지워|열쇠|남는다|간다|선다|있다|온다|연다|문이다|없다/.test(d.open)) why.push(`${d.id} 「…하면 열린다」 결 아님`); } }
  const q = w.bridge?.q; if (!q?.why || !q?.a?.[0]) why.push('bridge.q why·a[0] 없음(꿈 재료)');
  for (const [st, h] of Object.entries(w.doors.homes)) if (h.spot && !(Array.isArray(h.spot) && h.spot.length === 2)) why.push(`집 ${st} spot 꼴`);
  ok(!why.length, `${era}: 문지기 문 open ${w.doors.list.filter((d) => d.npc).length}${why.length ? ' — ' + why.join(' / ') : ''}`);
}
ok(n === 19, `open 줄 19 (${n})`);
const gameSrc = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8');
ok(gameSrc.includes("if (t.type === 'npc' && this.doors?.gateTalk(t)) return;") && gameSrc.includes('if (this.doors?.sleepFirst(t)) this.ui.setPrompt(this.doors.sleepPrompt());') && gameSrc.includes('if (this.doors?.sleepFirst(t)) return this.doors.sleep();'), 'game.js — gateTalk · sleepFirst 프롬프트·E 세 줄');
// ---- 엔진(조선 전기) ----
const w0 = read('joseon-life', 'world.json'); const w = { ...w0, hideHunger: false };
const e = { areas: new Map([['dongheon', new THREE.Vector3(-30, 0, -8)], ['choga', new THREE.Vector3(20, 0, 0)], ['haengrang', new THREE.Vector3(-10, 0, -24)]]), groundY: () => 0, interactables: new Map() };
const npcObj = new THREE.Group(); npcObj.position.set(-27, 0, -9); npcObj.rotation.y = 0.7; const box = { setFromObject() { return this; }, getCenter: (v) => v }; e.interactables.set('npc_gwanno', { obj: npcObj, box, center: new THREE.Vector3() });
const said = [], flags = new Set(), played = [];
const fakeLife = { g: null, status: 'baekjeong', values: {}, hurt: new Set(), opened: new Set(), done: new Set(), situations: read('joseon-life', w.life).situations, rv: null, render() { }, d: { carry: { from: 'goryeo-life' } } };
fakeLife.cond = Life.prototype.cond; fakeLife.one = Life.prototype.one; fakeLife.valCond = Life.prototype.valCond;
let actor = null;
const g = { era: 'joseon-life', e, p: { pos: new THREE.Vector3(-30, 1.6, -5), eye: 1.6, enabled: true }, flags, world: w, ui: { say: (t) => said.push(t), isOpen: () => false, setHunger() { } }, sound: { play: (n) => played.push(n) }, life: fakeLife, restoring: false, missions: { missions: [{ area: 'x' }] }, mi: 0,
  pulse: { chase: null, deadline: null, cfg: { routines: [] }, actorOf(id) { if (id !== 'gwanno') return null; return (actor ??= new Actor(g, id, npcObj, { speed: { walk: 1.2 } })); } },
  story: { isNight: false, fast: true, actors: {}, overlay(a) { g.overlaid = (g.overlaid || []).concat([a.lines]); g.p.enabled = false; return Promise.resolve(); } }, danger: { t: 9, starveT: 3, collapsing: false }, hunger: 50, beasts: { busy: false } };
fakeLife.g = g; g.cond = (x) => fakeLife.cond(x); g.flag = (f) => flags.add(f); flags.add('status:baekjeong');
const ds = new Doors(g, w.doors); const run = (sec, step = 0.1) => { for (let t = 0; t < sec; t += step) ds.tick(step); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// 1) 막아서기 전엔 gateTalk 이 false(보통 대사로)
ok(ds.gateTalk({ type: 'npc', id: 'gwanno' }) === false, '막아서기 전엔 보통 대사(false)');
// 2) 백정이 동헌 앞 → 관노가 걸어 나옴 → 그 사람에게 E = fact 한 번 더 + 3.4초(fast 5ms) 뒤 open 줄, 깃발 asked, talk 깃발 없음
run(0.1); run(4.0); said.length = 0; played.length = 0;
const dong = w.doors.list.find((d) => d.id === 'dongheon');
ok(ds.gateTalk({ type: 'npc', id: 'gwanno' }) === true, '막아서는 중 관노에게 말 걸기 → true');
await wait(30);
ok(said.length === 2 && said[0] === `🚪 포졸 — 「${dong.fact}」` && said[1] === `🚪 포졸 — 「${dong.open}」`, `fact 한 번 더 → open: ${said[1]}`);
ok(flags.has('door:dongheon:asked') && !flags.has('talk:gwanno') && played[0] === 'meet', 'door:dongheon:asked · talk:gwanno 없음 · 소리 meet');
ok(ds.gateTalk({ type: 'npc', id: 'seonbi' }) === false && ds.gateTalk({ type: 'item', id: 'gwanno' }) === false, '다른 사람·소품엔 false');
// 3) 물었으니 3초는 더 선다(t 를 STAND_SEC-3 로 되감음) → 그 뒤 제자리로
ok(ds.standing.t <= 1.8 + 1e-6, `물은 뒤 t=${ds.standing.t.toFixed(1)} (≤1.8)`);
run(4.2); ok(ds.standing?.back === true, '3초가 지나면 제자리로 돌아간다(back)');
ok(ds.gateTalk({ type: 'npc', id: 'gwanno' }) === false, '돌아가는 중엔 false');
run(8.0); await wait(0); ds.standing = null; actor.path = null;
// 4) open 없는 문지기 문이면 기본 「신분이 바뀌면 열린다.」 — fact 도 없으면 한 줄만
const ds2 = new Doors(g, { list: [{ id: 'x', area: 'dongheon', npc: 'gwanno', if: 'status:baekjeong', who: '문지기', say: '안 돼' }], homes: {} });
ds2.standing = { id: 'gwanno', door: ds2.list[0], back: false, t: 0 }; said.length = 0; ds2.gateTalk({ type: 'npc', id: 'gwanno' }); await wait(10);
if (said.length !== 1) console.log('   said:', said);
ok(said.length === 1 && said[0] === '🚪 문지기 — 「신분이 바뀌면 열린다.」', `open·fact 없으면 기본 한 줄: ${said[0]}`);
// 5) 꿈 — 첫 밤 bridge.q.why, 둘째 밤 q.a[0], 셋째 밤 없음(…); 조상 있는 시대는 「꿈에서 조상이 —」
fakeLife.status = 'sangmin'; flags.delete('status:baekjeong'); flags.add('status:sangmin'); ds.curHome = null; g.story.isNight = true; g.p.pos.set(21, 1.6, 1);
ok(ds.dream() === `💭 꿈에서 조상이 — ${w.bridge.q.why}`, `첫 꿈 = 조상이 + q.why: ${ds.dream().slice(0, 40)}…`);
g.overlaid = []; await ds.sleep(); ok(g.overlaid[0][1].startsWith('💭 꿈에서 조상이 — ') && flags.has('home:dream') && flags.has('home:dream:1') && ds.dreams === 1 && g.danger.t === 0, '암전 가운데 줄이 꿈 · home:dream·:1 · 밤 시계 0');
await ds.sleep(); ok(g.overlaid[1][1] === `💭 꿈에서 조상이 — ${w.bridge.q.a[0]}` && flags.has('home:dream:2'), '둘째 밤 = q.a[0]');
await ds.sleep(); ok(g.overlaid[2][1] === '…' && ds.dreams === 2 && !flags.has('home:dream:3'), '셋째 밤은 꿈 없이 「…」');
ok(ds.doorLine().includes('내 집에서 3번 잤다, 꿈을 2번 꿨다.'), `그 뒤 줄: ${ds.doorLine()}`);
// 6) 구석기(carry 없음)는 「꿈에서 —」 · doors.dreams[] 가 있으면 그것 · bridge.q 없으면 null
const gl = { ...g, life: { ...fakeLife, d: {} }, world: { ...w } }; const d3 = new Doors(gl, w.doors); ok(d3.dream().startsWith('💭 꿈에서 — '), '조상 없으면 「꿈에서 —」');
const d4 = new Doors(g, { ...w.doors, dreams: ['강물은 쌓아 둘 수 없다.'] }); ok(d4.dream() === '💭 꿈에서 조상이 — 강물은 쌓아 둘 수 없다.', 'doors.dreams[] 가 있으면 그것');
const d5 = new Doors({ ...g, world: { ...w, bridge: null } }, w.doors); ok(d5.dream() === null, 'bridge.q 없으면 꿈 없음');
// 7) 잠자리 — spot 없으면 집 중심 3m 안이면 소품보다 잠들기 먼저, 사람·길·문은 그대로; spot 이 있으면 그 자리 기준
g.p.pos.set(21, 1.6, 1); ok(ds.sleepFirst({ type: 'item', id: 'hwadeok' }) === true, '집 중심 3m 안 소품 → 잠들기 먼저');
ok(ds.sleepFirst({ type: 'npc', id: 'x' }) === false && ds.sleepFirst({ type: 'road' }) === false && ds.sleepFirst({ type: 'gate' }) === false, '사람·길 위의 일·시간의 문은 그대로 먼저');
g.p.pos.set(24.5, 1.6, 1); ok(ds.canSleep() && ds.sleepFirst({ type: 'item' }) === false, '4.5m — 잠들 순 있지만 소품이 먼저');
g.story.isNight = false; g.p.pos.set(21, 1.6, 1); ok(ds.sleepFirst({ type: 'item' }) === false, '낮엔 소품 그대로'); g.story.isNight = true;
ds.homes.sangmin = { ...ds.homes.sangmin, spot: [4, 0] }; g.p.pos.set(21, 1.6, 0); ok(ds.sleepDist() === 3 && ds.sleepFirst({ type: 'item' }) === false, 'spot [4,0] 이면 중심에서 3m 는 잠자리 밖');
g.p.pos.set(24.5, 1.6, 0); ok(ds.sleepFirst({ type: 'item' }) === true, 'spot 곁 0.5m → 잠들기 먼저'); g.p.pos.set(30.5, 1.6, 0); ok(!ds.canSleep(), 'spot 에서 6m 넘으면 안 됨'); delete ds.homes.sangmin.spot;
console.log(`\n132 신분의 문 ④: ${pass} 통과 · ${fail} 실패`); if (fail) process.exit(1);
