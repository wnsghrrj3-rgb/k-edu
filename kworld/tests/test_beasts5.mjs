// 짐승 층 ⑤(116) — 반 친구 외침(「뛰지 마!」·「갔다!」·「괜찮아?」) · 보내 준 자리의 길 위의 일(after:<kind>) · 시대마다 짐승 한 줄 데이터(see·faceSay)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const LS = {}; globalThis.localStorage = { getItem: (k) => LS[k] ?? null, setItem(k, v) { LS[k] = String(v); }, removeItem(k) { delete LS[k]; } };
const { Beasts } = await import('../core/beasts.js'); const { Road } = await import('../core/road.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const B = w.beasts; const kinds = Object.keys(B);
  ok(kinds.every((k) => B[k].see && !/\d{3,4}년/.test(B[k].see) && (k !== 'tiger' || B[k].faceSay)), `${era}: 짐승 한 줄 see(${kinds.join('·')})·호랑이 faceSay·연도 0`);
  const after = (w.road.events || []).filter((s) => s.after);
  ok(after.length === kinds.length && kinds.every((k) => after.some((s) => s.after === k && s.beast === k && s.prop === 'track')), `${era}: after:<kind> 길 위의 일 ${after.map((s) => s.id).join('·')} = 그 시대 짐승마다 하나`);
  ok(after.every((s) => s.ways.length === 2 && s.ways[0].roll?.ab === '눈' && s.ways[0].then?.craft === 1 && s.ways[1].then?.heart === 1 && s.fact.includes('→') && !/\d{3,4}년|\(\d{3,4}\)/.test(s.fact + s.body.join(''))), `${era}: 살핀다(눈 굴림 ✋+1)·알린다(🤝+1)·📜 인과·연도 0`);
}
// ---- 엔진(구석기) ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
const e = { areas: new Map([['deep', new THREE.Vector3(66, 0, 58)], ['meadow', new THREE.Vector3(-40, 0, 20)]]), groundY: () => 0, scene: { add() {}, remove() {} }, interactables: new Map(), removeInteractable() {} };
const said = [], shouts = []; const flags = new Set(); let collapsed = null; const placed = [];
const story = { isNight: true, cutsceneOn: false, skyName: 'night', snowOn: false, place: (o) => { placed.push(o); const obj = new THREE.Group(); return { name: o.name, obj, box: new THREE.Box3(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 2, 1)), center: new THREE.Vector3() }; }, actors: {}, animals: [] };
const g = { era: 'life', e, p: { pos: new THREE.Vector3(66, 0, 58), yaw: 0, moving: false, enabled: true }, flags, inventory: [], world: { ...w, bounds: 116 }, ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false, open() {}, close() {} }, sound: { play() {}, thump() {} }, story, danger: { cfg: { food: ['berry', 'meat'] }, hasTorch: () => false, firePos: () => null, collapse: (r, l) => { collapsed = { r, l }; }, collapsing: false }, has: () => false, take() {}, renderInv() {}, save: { touch() {} }, cond: () => true, friends: { shout: (k, t) => shouts.push(k + ':' + t) }, restoring: false };
g.flag = (f) => { for (const x of [].concat(f)) flags.add(x); };
const bs = new Beasts(g, { ...w.beasts, bear: { areas: [] } }); g.beasts = bs; const road = new Road(g, w.road); g.road = road;   // 곰은 이 시험에선 끔(깊은 숲이 곰 자리이기도 해서)
const run = (sec, step = 0.1) => { for (let t = 0; t < sec; t += step) { bs.tick(step); road.tick(step); } };
const reset = (x, z, night) => { for (const k of ['tiger', 'boar', 'bear']) { bs.cool[k] = 0; bs.hold[k] = 0; } if (bs.cur) bs.remove(bs.cur); if (road.cur) road.remove(road.cur); road.pending = null; bs.runT = 0; bs.vel = 0; bs.prev = null; g.p.moving = false; g.p.pos.set(x, 0, z); story.isNight = night; story.skyName = night ? 'night' : 'day'; said.length = 0; shouts.length = 0; placed.length = 0; collapsed = null; };
// 1) 호랑이가 서면 곁 친구에게 「뛰지 마!」(beast:호랑이) + 시대 한 줄
reset(66, 58, true); bs.k.tiger.chance = 1; bs.k.tiger.waitSec = 2; run(3);
ok(bs.cur?.kind === 'tiger' && shouts.includes('beast:호랑이'), 'tiger 서면 friends.shout(beast, 호랑이)');
ok(said.some((s) => s === w.beasts.tiger.see), '시대 데이터 see 한 줄이 그대로 뜬다');
// 2) 마주 보면 돌아선다 → 「갔다!」 + 그 자리에 after_tiger 가 놓인다(2.5초 뒤)
const origin = { ...bs.cur.origin }; g.p.moving = false; run(30);
ok(!bs.cur && flags.has('beast:tiger:faced') && shouts.includes('beastok:호랑이'), `마주 봄 → faced → friends.shout(beastok) [${[...flags].filter((f) => f.startsWith('beast:')).join(',')} | ${shouts.join(',')}]`);
ok(said.some((s) => s === w.beasts.tiger.faceSay), '시대 데이터 faceSay 한 줄');
ok(road.cur?.s?.id === 'after_tiger' && Math.hypot(road.cur.x - origin.x, road.cur.z - origin.z) < 0.01 && placed[0]?.prop === 'track' && flags.has('road:after_tiger'), `after_tiger 가 호랑이 섰던 자리에 놓였다 (${origin.x.toFixed(1)},${origin.z.toFixed(1)})`);
// 3) 같은 판에 다시 보내도 두 번은 안 놓인다
road.remove(road.cur); ok(road.afterBeast('tiger', 'faced', origin) === false && !road.pending, '같은 판 두 번째 after_tiger 는 안 놓인다(road: 깃발)');
ok(!road.cands().some((s) => s.after), 'after 일은 걷다 만나는 후보가 아니다');
// 4) 뛰면 덮침 → 「괜찮아?」, 길 위의 일 없음
reset(66, 58, true); flags.delete('road:after_tiger'); run(3); ok(bs.cur?.kind === 'tiger', '다시 호랑이');
run(4); g.p.moving = true; for (let t = 0; t < 6; t += 0.1) { g.p.pos.x += 0.65; bs.tick(0.1); road.tick(0.1); }
ok(collapsed?.r === 'tiger' && shouts.includes('beastbad:호랑이') && !road.pending && !road.cur, '덮침 → friends.shout(beastbad) · after 없음');
// 5) 멧돼지는 「물러서!」(beastboar), 창 들면 달아남 → 「갔다!」 + after_boar
reset(-40, 20, false); bs.k.boar.chance = 1; bs.k.boar.waitSec = 2; run(3); ok(bs.cur?.kind === 'boar' && shouts.includes('beastboar:멧돼지'), 'boar 서면 friends.shout(beastboar)');
g.has = (k) => k === 'spear'; g.p.pos.set(bs.cur.obj.position.x + 5, 0, bs.cur.obj.position.z); const bo = { ...bs.cur.origin }; run(25); g.has = () => false;
ok(!bs.cur && flags.has('beast:boar:fled') && shouts.includes('beastok:멧돼지') && road.cur?.s?.id === 'after_boar' && Math.hypot(road.cur.x - bo.x, road.cur.z - bo.z) < 0.01, 'fled → beastok + after_boar 그 자리');
// 6) 짐승이 서 있는 동안엔 안 놓인다(quiet) · 멀어지면 버림
reset(66, 58, true); flags.delete('road:after_tiger'); ok(road.afterBeast('tiger', 'faced', { x: 66, z: 58 }) && road.pending, 'pending 섬'); g.p.pos.set(66 + 60, 0, 58); run(4); ok(!road.pending && !road.cur, '40m 넘게 멀면 안 놓고 버린다');
console.log(`\n짐승 층 ⑤: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
