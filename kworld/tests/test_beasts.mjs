// 짐승 층(112) — 열한 시대 데이터 전수 + 엔진 흐름(구석기): 밤 산길에 호랑이가 보인다 → 7m 까지 와서 돈다 → 뛰면 덮친다(쓰러짐) / 가만히 마주 보면 돌아선다 · 낮 들에 멧돼지 → 4m 노려봄 → 3m 받음(먹을 것 하나) → 달아남 / 창 들면 먼저 달아남
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const { Beasts, beastModel } = await import('../core/beasts.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const B = w.beasts;
  ok(B && B.boar?.areas?.length >= 2 && B.boar.fact?.includes('→'), `${era}: 멧돼지 자리 2+ · 📜 인과`);
  const tigerExpected = (w.ambience?.night || []).includes('tiger') || era === 'gaehang-life';
  ok(tigerExpected ? (B.tiger?.areas?.length >= 2 && B.tiger.fact?.includes('→')) : !B.tiger, `${era}: 호랑이 ${tigerExpected ? '자리 2+ · 📜' : '없음'}`);
  const allAreas = [...(B.tiger?.areas || []), ...(B.boar?.areas || [])];
  ok(allAreas.every((a) => w.areas?.[a]) && !/\d{3,4}년|\(\d{3,4}\)/.test((B.tiger?.fact || '') + B.boar.fact), `${era}: 자리는 전부 world.areas 에 있음 · 연도 0`);
  const villageish = ['village', 'camp', 'maeul', 'jangteo', 'yangban', 'gwana', 'market'];
  ok(!(B.tiger?.areas || []).some((a) => villageish.includes(a)), `${era}: 호랑이는 사람 사는 곳 밖`);
}
// ---- 모양 ----
const tg = beastModel('tiger'), bo = beastModel('boar');
ok(tg.userData.legs.length === 4 && bo.userData.legs.length === 4 && tg.getObjectByName('head') && bo.getObjectByName('tail') && tg.children.length > bo.children.length - 4, '호랑이·멧돼지 모양 — 다리 넷·머리·꼬리');
// ---- 엔진(구석기) ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
const added = []; const e = { areas: new Map([['deep', new THREE.Vector3(66, 0, 58)], ['meadow', new THREE.Vector3(12, 0, 46)], ['camp', new THREE.Vector3(0, 0, -20)]]), groundY: () => 0, scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); } }, collides: () => false };
const said = []; const flags = new Set(); let collapsed = null;
const g = { e, p: { pos: new THREE.Vector3(66, 0, 58), yaw: 0, moving: false, enabled: true }, flags, inventory: ['berry', 'meat'], world: { ...w, bounds: 116 }, ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false }, sound: { play() {}, thump() {} }, story: { isNight: true, cutsceneOn: false }, danger: { cfg: { nightRadius: 9, food: ['berry', 'meat'] }, hasTorch: () => false, firePos: () => null, collapse: (r, l) => { collapsed = { r, l }; }, collapsing: false }, has: (k) => g.inventory.includes(k), take: (k) => { const i = g.inventory.indexOf(k); if (i >= 0) g.inventory.splice(i, 1); }, renderInv() {}, flag: (f) => { for (const x of [].concat(f)) flags.add(x); }, save: { touch() {} } };
const bs = new Beasts(g, { ...w.beasts, tiger: { ...w.beasts.tiger, chance: 1, waitSec: 2 }, boar: { ...w.beasts.boar, chance: 1, waitSec: 2 }, bear: { areas: [] } });   // 곰(113)은 아래에서 따로
const run = (sec, step = 0.1, each) => { for (let t = 0; t < sec; t += step) { bs.tick(step); each?.(step); } };
// 1) 밤 깊은 숲에 서 있으면 호랑이가 뒤 18m 쯤에 선다 — 보인다·busy·한 줄
run(3); const c1 = bs.cur; const d1 = c1 && Math.hypot(c1.obj.position.x - 66, c1.obj.position.z - 58);
ok(c1?.kind === 'tiger' && added.includes(c1.obj) && d1 > 13 && d1 < 23 && bs.busy && said.some((s) => s.includes('호랑이')), `밤 깊은 숲 → 호랑이가 ${d1?.toFixed(1)}m 에 선다(보임·busy) · 「호랑이다」`);
ok(flags.has('beast:tiger:near') && flags.has('beast:tiger:seen'), 'beast:tiger:near · seen 깃발');
// 2) 가만히 있으면 7m 까지 다가와 돈다(덮치지 않는다)
run(6); const d2 = Math.hypot(c1.obj.position.x - 66, c1.obj.position.z - 58); ok(c1.mode === 'stalk' && d2 < 9 && d2 > 5 && !collapsed, `가만히 서 있으면 ${d2.toFixed(1)}m 까지 와서 돈다 — 덮치지 않음`);
// 3) 뛰면 덮친다 — 쓰러짐(danger.collapse tiger)
g.p.moving = true; run(6, 0.1, (dt) => { g.p.pos.x += 6.5 * dt; }); ok(collapsed?.r === 'tiger' && flags.has('beast:tiger:caught') && bs.cur === null, `뛰면 덮친다 → collapse('tiger') · 「${collapsed?.l}」`);
// 4) 다시: 가만히 마주 보면 돌아선다 — beast:tiger:faced, 쿨다운
collapsed = null; bs.cool.tiger = 0; g.p.moving = false; g.p.pos.set(66, 0, 58); bs.runT = 0; bs.vel = 0; bs.prev = null; said.length = 0;
run(3); const c2 = bs.cur; ok(c2?.kind === 'tiger', '두 번째 호랑이'); run(10); ok(c2.mode === 'retreat' && said.some((s) => s.includes('돌아선다')), '6초 가만히 마주 보면 돌아선다'); run(15); ok(bs.cur === null && flags.has('beast:tiger:faced') && flags.has('beast:tiger:met') && bs.cool.tiger > 100, '물러가면 사라짐 · beast:tiger:faced · met · 쿨다운');
// 5) 횃불이 있으면 안 온다 / 낮엔 안 온다 / 마을 자리엔 안 온다
bs.cool.tiger = 0; g.danger.hasTorch = () => true; run(5); ok(bs.cur === null, '횃불 들고 있으면 안 온다'); g.danger.hasTorch = () => false;
g.story.isNight = false; run(5); ok(bs.cur === null || bs.cur.kind !== 'tiger', '낮엔 호랑이 안 온다');
// 6) 낮 풀밭 → 멧돼지가 선다, 코를 박고 돌아다닌다(자리 둘레)
bs.cool.boar = 0; g.p.pos.set(12, 0, 46); said.length = 0; run(3); const b1 = bs.cur; ok(b1?.kind === 'boar' && b1.mode === 'root' && said.some((s) => s.includes('멧돼지')), '낮 풀밭 → 멧돼지(코로 뒤짐) · 「멧돼지다」');
const o0 = b1.obj.position.clone(); run(6); ok(b1.obj.position.distanceTo(o0) > 0.5 && Math.hypot(b1.obj.position.x - b1.origin.x, b1.obj.position.z - b1.origin.z) < 9, '자리 둘레를 느릿느릿 돌아다닌다');
// 7) 4m 안 → 노려봄, 물러서면 다시 뒤진다
g.p.pos.set(b1.obj.position.x + 3.8, 0, b1.obj.position.z); run(0.3); ok(b1.mode === 'alert' && said.some((s) => s.includes('노려본다')), '4m 안에 들면 멈춰 노려본다');
g.p.pos.set(b1.obj.position.x + 7, 0, b1.obj.position.z); run(0.5); ok(b1.mode === 'root', '물러서면 다시 코를 땅에');
// 8) 3m 안 → 받는다 → 넘어짐·먹을 것 하나 잃음·달아남
const inv0 = g.inventory.length; g.p.pos.set(b1.obj.position.x + 2.5, 0, b1.obj.position.z); run(0.3); ok(b1.mode === 'charge', '3m 안이면 받는다(charge)');
run(2); ok(b1.hit && flags.has('beast:boar:hit') && g.inventory.length === inv0 - 1 && g.p.enabled === false && b1.mode === 'flee', `받혔다 → 먹을 것 하나 잃음(${inv0}→${g.inventory.length}) · 잠깐 못 움직임 · 달아난다`);
await new Promise((r) => setTimeout(r, 1400)); ok(g.p.enabled === true, '1.3초 뒤 다시 걷는다');
run(12); ok(bs.cur === null && flags.has('beast:boar:met') && flags.has('beast:boar:hit'), '달아나 사라짐 · beast:boar:met');
// 9) 창을 들고 있으면 7m 에서 먼저 달아난다
bs.cool.boar = 0; g.inventory.push('spear'); g.p.pos.set(12, 0, 46); said.length = 0; run(3); const b2 = bs.cur; ok(b2?.kind === 'boar', '세 번째 멧돼지');
g.p.pos.set(b2.obj.position.x + 6, 0, b2.obj.position.z); run(0.3); ok(b2.mode === 'flee' && said.some((s) => s.includes('달아난다')), '창 들고 7m 안 → 먼저 달아난다');
run(12); ok(bs.cur === null && flags.has('beast:boar:fled'), 'beast:boar:fled');
// 10) 위험층·길 위의 일 연동: busy 면 늑대 밤 판정·길 위의 일이 쉰다(코드 문자열)
const dj = fs.readFileSync(path.join(root, 'core/danger.js'), 'utf8'), rj = fs.readFileSync(path.join(root, 'core/road.js'), 'utf8'), gj = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8');
ok(dj.includes('!g.beasts?.busy') && rj.includes('!g.beasts?.busy') && gj.includes('new Beasts(this, this.world.beasts)') && gj.includes('this.beasts.tick(dt)'), 'danger·road 는 busy 면 쉼 · game.js 가 켠다(?beasts=0 끔)');

// ==== 113 — 곰(셋째 짐승) · 발자국 → 그 자리에 짐승 · 흔들림 ====
const BEAR_ERAS = ERAS.slice(0, 9);
for (const era of ERAS) {
  const w2 = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const Bb = w2.beasts.bear;
  if (BEAR_ERAS.includes(era)) ok(Bb?.areas?.length >= 2 && Bb.areas.every((a) => w2.areas?.[a]) && Bb.fact?.includes('→') && !/\d{3,4}년|\(\d{3,4}\)/.test(Bb.fact) && !Bb.areas.some((a) => ['village', 'camp', 'maeul', 'jangteo'].includes(a)), `${era}: 곰 자리 2+(굴·깊은 산) · 📜 인과 · 연도 0`);
  else ok(!Bb, `${era}: 곰 없음`);
  const tracks = (w2.road?.events || []).filter((s) => s.beast);
  ok(tracks.length >= 1 && tracks.every((s) => s.prop === 'track' && w2.beasts[s.beast]?.areas?.length && s.ways.some((wy) => wy.then?.lure) && s.ways.some((wy) => !wy.then?.lure)), `${era}: 짐승 발자국 ${tracks.map((s) => s.id + '→' + s.beast).join(',')} — 따라가는 길(lure)·안 따라가는 길`);
}
const bm = beastModel('bear'); ok(bm.getObjectByName('rig') && bm.getObjectByName('moon') && bm.userData.legs.length === 4, '곰 모양 — 일어서는 rig·가슴 반달·다리 넷');
// 곰 엔진(구석기 굴)
g.inventory = ['meat', 'berry']; g.story.isNight = false; g.story.skyName = 'day'; g.danger.hasTorch = () => false; collapsed = null; flags.clear(); said.length = 0;
const cave = { x: 30, z: 70 }; e.areas.set('cave', new THREE.Vector3(cave.x, 0, cave.z));
const bb = new Beasts(g, { ...w.beasts, tiger: { areas: [] }, boar: { areas: [] }, bear: { ...w.beasts.bear, chance: 1, waitSec: 2 } }); const runB = (sec, step = 0.1, each) => { for (let t = 0; t < sec; t += step) { bb.tick(step); each?.(step); } };
g.p.pos.set(cave.x, 0, cave.z); g.p.moving = false; runB(3); const k1 = bb.cur; ok(k1?.kind === 'bear' && k1.mode === 'approach' && said.some((s) => s.includes('곰')), '낮 굴 앞 → 곰이 선다 · 「곰이다」');
runB(25); ok(['rear', 'eat', 'leave'].includes(k1.mode), `가만히 있으면 6m 쯤에서 일어선다(${k1.mode})`); ok(flags.has('beast:bear:reared'), 'beast:bear:reared');
runB(6); ok(k1.mode === 'eat' || k1.mode === 'leave', '먹을 것이 있으면 하나 던져 준다'); ok(flags.has('beast:bear:fed') && g.inventory.length === 1 && g.inventory[0] === 'berry', `고기부터 던짐 — 남은 것 ${g.inventory}`);
runB(30); ok(bb.cur === null && flags.has('beast:bear:met') && flags.has('beast:bear:fed') && !collapsed, '먹고 돌아가 사라짐 · met · 쓰러지지 않음');
// 먹을 것 없으면 한참(7초) 노려보다 돌아선다
bb.cool.bear = 0; g.inventory = []; g.p.pos.set(cave.x, 0, cave.z); said.length = 0; runB(3); const k2 = bb.cur; runB(25); runB(9); ok(k2 && (k2.mode === 'leave' || bb.cur === null) && said.some((s) => s.includes('돌아선다')) && !collapsed, '먹을 것 없으면 한참 노려보다 돌아선다');
runB(30);
// 뛰면 쫓아와 덮친다 — jolt
bb.cool.bear = 0; g.p.pos.set(cave.x, 0, cave.z); runB(3); const k3 = bb.cur; for (let t = 0; t < 40 && k3?.mode !== 'rear'; t += 0.1) bb.tick(0.1); ok(k3?.mode === 'rear', '세 번째 곰이 일어섰다'); const j0 = bb.jolts; g.p.moving = true; runB(8, 0.1, (dt) => { g.p.pos.x += 6.5 * dt; }); ok(collapsed?.r === 'bear' && flags.has('beast:bear:caught') && bb.jolts === j0 + 1 && bb.cur === null, `뛰면 쫓아와 덮친다 → collapse('bear') · 흔들림 1 · 「${collapsed?.l}」`);
// 겨울엔 안 나온다
collapsed = null; g.p.moving = false; bb.cool.bear = 0; g.p.pos.set(cave.x, 0, cave.z); g.story.skyName = 'winter'; bb.runT = 0; bb.vel = 0; bb.prev = null; runB(6); ok(bb.cur === null, '겨울엔 곰이 안 나온다(겨울잠)'); g.story.skyName = 'day';
// 발자국 → 그 자리에 짐승: 호랑이는 낮에도 온다
const tb = new Beasts(g, { ...w.beasts, tiger: { ...w.beasts.tiger, chance: 0 }, boar: { areas: [] }, bear: { areas: [] } }); g.p.pos.set(0, 0, 0); g.story.isNight = false; said.length = 0; flags.clear();
for (let t = 0; t < 5; t += 0.1) tb.tick(0.1); ok(tb.cur === null, '발자국 없으면(마을 밖 아님·낮) 호랑이 없음');
ok(tb.lure('tiger', { x: 2, z: -3 }) && flags.has('beast:tiger:lured'), 'lure(tiger) — beast:tiger:lured'); for (let t = 0; t < 4; t += 0.1) tb.tick(0.1);
const tc = tb.cur; ok(tc?.kind === 'tiger' && tc.lured && flags.has('beast:tiger:tracked'), '발자국을 따라가면 낮에도 그 자리에 호랑이가 선다(tracked)');
for (let t = 0; t < 4; t += 0.1) tb.tick(0.1); ok(tc.mode === 'stalk', '따라온 호랑이는 낮이라고 바로 돌아서지 않는다');
ok(!new Beasts(g, { boar: { areas: ['x'] } }).lure('bear', { x: 0, z: 0 }), '그 시대에 없는 짐승은 lure 안 됨');
// 흔들림: 멧돼지 받힘·호랑이 덮침도 jolt
ok(fs.readFileSync(path.join(root, 'core/beasts.js'), 'utf8').match(/this\.jolt\(/g).length >= 3 && fs.readFileSync(path.join(root, 'core/road.js'), 'utf8').includes('g.beasts?.lure?.(s.beast'), '덮침·받힘·앞발 → jolt · road 가 lure 를 부른다');
console.log(`\n짐승 층: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
