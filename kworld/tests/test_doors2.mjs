// 신분의 문 ②·③(131) — 데이터 열한 시대(문지기 npc 가 그 문 곁 8m 안·주인집 행랑 masterSay) + 엔진(조선 전기): 문지기가 걸어 나와 앞을 막아섬·4.8초 뒤 제자리 / 벗·반 친구 한마디 / 집에서 잠들기(밤·내 집·E)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const { Doors } = await import('../core/doors.js');
const { Life } = await import('../core/life.js');
const { Actor } = await import('../core/actor.js');
const { Bond } = await import('../core/bond.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const read = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f), 'utf8'));
// GLB 의 area_·ix_npc_ 자리(통짜 사람은 translation 이 없어 메시 min/max 중심으로)
const glbSpots = (era, glb) => { const buf = fs.readFileSync(path.resolve(path.join(root, 'eras', era), glb)); const d = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString()); const out = {};
  const center = (i) => { const mins = [], maxs = []; const walk = (j, off) => { const n = d.nodes[j]; const t = n.translation || [0, 0, 0]; const o = [off[0] + t[0], off[1] + t[1], off[2] + t[2]]; if (n.mesh != null) for (const p of d.meshes[n.mesh].primitives) { const a = d.accessors[p.attributes.POSITION]; if (a.min) { mins.push(a.min.map((v, k) => v + o[k])); maxs.push(a.max.map((v, k) => v + o[k])); } } for (const c of n.children || []) walk(c, o); }; walk(i, [0, 0, 0]); if (!mins.length) return d.nodes[i].translation || [0, 0, 0]; return [0, 1, 2].map((k) => (Math.min(...mins.map((m) => m[k])) + Math.max(...maxs.map((m) => m[k]))) / 2); };
  d.nodes.forEach((n, i) => { if (/^(area_|ix_npc_)/.test(n.name || '')) out[n.name] = center(i); }); return out; };
// ---- 데이터 ----
let npcDoors = 0, masters = 0;
for (const era of ERAS) {
  const w = read(era, 'world.json'); const d = w.doors; const npcs = read(era, 'npcs.json'); const nl = npcs.npcs || npcs; const spots = glbSpots(era, w.glb); const why = [];
  for (const x of d.list) { if (!x.npc) continue; npcDoors++; if (!nl[x.npc]) why.push(`${x.id} npc ${x.npc} 없음`); const a = spots['area_' + x.area], n = spots['ix_npc_' + x.npc]; if (!a || !n) why.push(`${x.id} GLB 자리 없음`); else { const dist = Math.hypot(a[0] - n[0], a[2] - n[2]); if (dist > 8) why.push(`${x.id} ${x.npc} 가 문에서 ${dist.toFixed(1)}m`); } }
  for (const [st, h] of Object.entries(d.homes)) { if (h.master) { masters++; if (!h.masterSay || h.masterSay.length > 60 || !/먼저|뒤에야/.test(h.masterSay)) why.push(`집 ${st} masterSay`); } if (/주인집 행랑|주인 집 담/.test(h.say) && !h.master) why.push(`집 ${st} 는 주인집인데 master 없음`); }
  ok(!why.length, `${era}: 문지기 npc ${d.list.filter((x) => x.npc).length}·주인집 ${Object.values(d.homes).filter((h) => h.master).length}${why.length ? ' — ' + why.join(' / ') : ''}`);
}
ok(npcDoors >= 15 && masters >= 7, `문지기 있는 문 ${npcDoors}(≥15) · 주인집 행랑 ${masters}(≥7)`);
ok(fs.readFileSync(path.join(root, 'core/friends.js'), 'utf8').includes("door: ['「거긴 못 들어가!」'"), 'friends SHOUT 에 door 묶음');
const gameSrc = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8'); ok(gameSrc.includes('this.doors?.canSleep()) this.ui.setPrompt(this.doors.sleepPrompt())') && gameSrc.includes('if (this.doors?.canSleep()) return this.doors.sleep();'), 'game.js — 프롬프트·E 가 doors.sleep 으로');
ok(fs.readFileSync(path.join(root, 'core/danger.js'), 'utf8').includes('if (g.doors?.sleeping) { this.t = 0; return; }'), 'danger.tick — 잠든 동안 밤 시계 0');
// ---- 엔진(조선 전기) ----
const w0 = read('joseon-life', 'world.json'); const w = { ...w0, hideHunger: false };   // 조선은 hideHunger 라 배고픔 셈을 보려고 켠다
const e = { areas: new Map([['dongheon', new THREE.Vector3(-30, 0, -8)], ['choga', new THREE.Vector3(20, 0, 0)], ['haengrang', new THREE.Vector3(-10, 0, -24)], ['oettan', new THREE.Vector3(72, 0, 79)]]), groundY: () => 0, interactables: new Map() };
const npcObj = new THREE.Group(); npcObj.position.set(-27, 0, -9); npcObj.rotation.y = 0.7; const box = { setFromObject() { return this; }, getCenter: (v) => v }; e.interactables.set('npc_gwanno', { obj: npcObj, box, center: new THREE.Vector3() });
const said = [], flags = new Set();
const fakeLife = { g: null, status: 'baekjeong', values: {}, hurt: new Set(), opened: new Set(), done: new Set(), situations: read('joseon-life', w.life).situations, rv: null, render() { } };
fakeLife.cond = Life.prototype.cond; fakeLife.one = Life.prototype.one; fakeLife.valCond = Life.prototype.valCond;
let actor = null; const bondCalls = [], shouts = [];
const g = { era: 'joseon-life', e, p: { pos: new THREE.Vector3(-30, 1.6, -5), eye: 1.6, enabled: true }, flags, world: w, ui: { say: (t) => said.push(t), isOpen: () => false, setHunger() { } }, sound: { played: [], play(n) { this.played.push(n); } }, life: fakeLife, restoring: false, missions: { missions: [{ area: 'x' }] }, mi: 0,
  pulse: { chase: null, deadline: null, cfg: { routines: [] }, actorOf(id) { if (id !== 'gwanno') return null; return (actor ??= new Actor(g, id, npcObj, { speed: { walk: 1.2 } })); } },
  story: { isNight: false, fast: true, actors: {}, overlay(a) { g.overlaid = (g.overlaid || []).concat([a.lines.join('')]); g.p.enabled = false; return Promise.resolve(); } }, danger: { t: 9, starveT: 3, collapsing: false }, hunger: 50, beasts: { busy: false },
  bond: { onDoor: (d, n) => bondCalls.push([d.id, n]) }, friends: { shout: (k, t) => shouts.push([k, t]) } };
fakeLife.g = g; g.cond = (x) => fakeLife.cond(x); g.flag = (f) => flags.add(f); flags.add('status:baekjeong');
const ds = new Doors(g, w.doors); const run = (sec, step = 0.1) => { for (let t = 0; t < sec; t += step) ds.tick(step); };
// 1) 백정이 동헌 앞(r 6) 안에 들면 밀려남 + 관노(npc)가 문 중심에서 나 쪽으로 r+1.1 자리로 걸어 나온다
run(0.1); ok(ds.standing && ds.standing.id === 'gwanno' && actor && actor.path, '백정이 동헌 앞에 들면 관노가 걸어 나온다(standing·path)');
ok(bondCalls.length === 1 && bondCalls[0][0] === 'dongheon' && bondCalls[0][1] === w.areas.dongheon.name && shouts.length === 1 && shouts[0][0] === 'door' && shouts[0][1] === w.areas.dongheon.name, `벗 onDoor(dongheon, ${w.areas.dongheon.name}) + 반 친구 shout('door') 한 번씩`);
const target = actor.path.to; const dT = Math.hypot(target.x + 30, target.z + 8); ok(dT > 7.0 && dT < 7.2, `막아서는 자리 = 문 중심에서 r+1.1 = 7.1m (${dT.toFixed(2)})`);
ok(target.z > -8 && Math.abs(target.x + 30) < 0.01, '내가 선 쪽(남쪽)으로');
run(4.0); ok(!actor.path && Math.abs(npcObj.position.z - target.z) < 0.01, '4초 안에 닿아 선다(2.6m/s)');
const yawTo = Math.atan2(g.p.pos.x - npcObj.position.x, g.p.pos.z - npcObj.position.z); run(0.5); ok(Math.abs(Math.atan2(Math.sin(npcObj.rotation.y - yawTo), Math.cos(npcObj.rotation.y - yawTo))) < 0.1, '나를 마주 본다');
// 2) 그 사이 다시 들어가도 두 번째 문지기는 안 나온다(standing 하나) · 4.8초 뒤 제자리로 걸어 돌아가고 원래 방향
g.p.pos.set(-30, 1.6, -5); run(0.1); ok(ds.standing && ds.standing.ac === actor, '막아서는 동안엔 한 사람뿐');
run(2.0); ok(ds.standing && !ds.standing.back, '닿은 뒤 2.5초 — 아직 마주 서 있다');
run(2.5); ok(ds.standing?.back && actor.path && Math.abs(actor.path.to.x + 27) < 0.01 && Math.abs(actor.path.to.z + 9) < 0.01, '닿아서 4.8초가 지나면 제자리(-27,-9)로 걸어간다');
run(8.0); await new Promise((r) => setTimeout(r, 0)); ok(!ds.standing && !actor.path && Math.abs(npcObj.position.x + 27) < 0.01 && Math.abs(npcObj.rotation.y - 0.7) < 1e-6, '돌아와서 원래 방향으로 선다 · standing 비움');
// 3) 장면층 배우(story.actors)·일과 배우면 여기서 tick 안 함(owns=false)
g.story.actors.gwanno = actor; ds.last.clear(); g.p.pos.set(-30, 1.6, -5); run(0.1); ok(ds.standing && ds.standing.owns === false, '장면층 배우면 owns=false(그쪽이 tick)'); delete g.story.actors.gwanno; ds.standing = null; actor.path = null;
// 4) npc 없는 문(안채)은 standing 없이 밀려나기만
g.pulse.cfg.routines = [{ actor: 'gwanno', day: 'gwana' }]; ds.last.clear(); g.p.pos.set(-30, 1.6, -5); run(0.1); ok(ds.standing?.owns === false, '일과 배우면 owns=false'); ds.standing = null; actor.path = null; g.pulse.cfg.routines = [];
// 5) 벗 onDoor — 벗(friend)·곁 10m 일 때 1.7초 뒤 한마디, 문마다 한 번, 처음·둘째 줄 다름
const bsaid = []; const bg = { flags: new Set(['bond:met', 'bond:friend']), flag: (f) => bg.flags.add(f), p: { pos: new THREE.Vector3(0, 0, 0) }, ui: { say: (t) => bsaid.push(t) }, story: { fast: true } };
const b = Object.create(Bond.prototype); b.g = bg; b.cfg = {}; b.name = '하늘'; b.body = {}; b.pos = new THREE.Vector3(3, 0, 0); b.gone = false; b.sinceLine = 20;
b.onDoor({ id: 'anchae' }, '안채 앞'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid.length === 1 && bsaid[0].startsWith('👤 하늘 — 「거긴 우리 자리가 아니야') && bg.flags.has('bond:door:anchae') && bg.flags.has('bond:door'), `벗 한마디: ${bsaid[0]}`);
b.onDoor({ id: 'anchae' }, '안채 앞'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid.length === 1, '같은 문은 다시 안 함');
b.onDoor({ id: 'dongheon' }, '동헌'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid.length === 2 && bsaid[1].includes('문은 문이지'), '다른 문은 둘째 줄');
b.pos.set(30, 0, 0); b.onDoor({ id: 'hyanggyo' }, '향교'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid.length === 2, '멀면(10m 밖) 조용'); b.pos.set(3, 0, 0);
bg.flags.delete('bond:friend'); b.onDoor({ id: 'outroad' }, '길'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid.length === 2, '벗이 아니면 조용'); bg.flags.add('bond:friend');
b.cfg = { doorSay: { default: '여긴 아니야. 가자.' } }; b.onDoor({ id: 'seowon' }, '서원'); await new Promise((r) => setTimeout(r, 30)); ok(bsaid[2]?.includes('여긴 아니야. 가자.'), '시대 데이터 doorSay 가 있으면 그것');
// 6) 잠들기 — 밤·내 집(상민 = 초가 마을 r 6)·카드 없음·급한 일 없음일 때만
fakeLife.status = 'sangmin'; flags.delete('status:baekjeong'); flags.add('status:sangmin'); ds.curHome = null;
g.p.pos.set(21, 1.6, 1); ok(!ds.canSleep(), '낮엔 잠들 수 없다');
g.story.isNight = true; ok(ds.canSleep() && ds.sleepPrompt().verb === '잠든다' && ds.sleepPrompt().name === '초가 마을', '밤·내 집이면 「초가 마을 · 잠든다」(E)');
g.p.pos.set(30, 1.6, 1); ok(!ds.canSleep(), '집에서 6m 넘게 떨어지면 안 됨'); g.p.pos.set(21, 1.6, 1);
g.pulse.deadline = {}; ok(!ds.canSleep(), '급한 일 중엔 안 됨'); g.pulse.deadline = null; g.pulse.chase = {}; ok(!ds.canSleep(), '쫓기는 중엔 안 됨'); g.pulse.chase = null; g.ui.isOpen = () => true; ok(!ds.canSleep(), '카드 열림엔 안 됨'); g.ui.isOpen = () => false; g.beasts.busy = true; ok(!ds.canSleep(), '짐승 앞에선 안 됨'); g.beasts.busy = false;
said.length = 0; g.danger.t = 9; await ds.sleep();
ok(g.overlaid?.length === 1 && g.overlaid[0].includes('밤이 지나간다') && g.hunger === 62 && g.danger.t === 0 && flags.has('home:slept') && flags.has('home:slept:1') && g.p.enabled && !ds.sleeping, `잠듦: 암전 「밤이 지나간다」 · 배고픔 50→62 · 밤 시계 0 · home:slept · 깨어나 움직임`);
ok(said.some((s) => s.startsWith('눈을 떴다. 아직 밤이다 — ') && s.includes(w.night.goal)), '아직 밤이면 그 밤의 goal 을 일러 준다');
g.story.isNight = false; await ds.sleep(); ok(g.hunger === 62 && ds.sleeps === 1, '낮엔 sleep() 이 아무것도 안 한다'); g.story.isNight = true;
// 7) 주인집 행랑(솔거) — 「주인이 먼저 잔다」 먼저 + 배고픔 +6 · hideHunger 면 배고픔 그대로
fakeLife.status = 'solgeo'; flags.delete('status:sangmin'); flags.add('status:solgeo'); g.p.pos.set(-10, 1.6, -22); said.length = 0; g.hunger = 50;
ok(ds.canSleep() && ds.sleepPrompt().verb === '행랑 바닥에 눕는다', '솔거는 「행랑채 · 행랑 바닥에 눕는다」'); await ds.sleep();
ok(said[0]?.startsWith('🛏 주인이 먼저 잔다') && g.hunger === 56 && ds.sleeps === 2, `「🛏 주인이 먼저 잔다…」 먼저 · 배고픔 +6 (${said[0]})`);
g.world = w0; g.hunger = 50; await ds.sleep(); ok(g.hunger === 50 && ds.sleeps === 3, 'hideHunger 시대(조선 원본)는 배고픔 그대로'); g.world = w;
// 8) 「그 뒤」 한 줄에 잠잔 횟수
ok(/돌아섰다\. 문은 신분이 정했다\. 내 집에서 3번 잤다(, 꿈을 \d번 꿨다)?\.$/.test(ds.doorLine()), `그 뒤 한 줄: ${ds.doorLine()}`);
const d0 = new Doors({ ...g, life: null }, { list: [] }); d0.sleeps = 2; ok(d0.doorLine() === '막힌 문은 없었다. 내 집에서 2번 잤다.', '막힌 문 없이 잠만 잤으면 그 줄만');
console.log(`\n신분의 문 ②·③(131): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
