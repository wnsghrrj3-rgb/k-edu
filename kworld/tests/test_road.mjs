// 길 위의 일(111) — 열한 시대 데이터 전수 + 엔진 흐름(조선 전기): 걷다 보면 앞길에 놓인다 → 살펴보기 → 길 고름 → 값 → 치움 / 그냥 지나치면 사라진다
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
globalThis.performance ??= { now: () => Date.now() };
const { Road } = await import('../core/road.js'); const { Story } = await import('../core/story.js'); const { Life } = await import('../core/life.js'); const { PROPS } = await import('../core/props.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const ABIL = new Set(['눈', '손', '발', '배', '몸']); const PROPKIND = new Set(['bundle', 'person', 'stone', 'stick', 'animal', 'basket', 'bush', 'track']);
// ---- 데이터 전수 ----
let total = 0;
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'life.json'), 'utf8')); const it = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'items.json'), 'utf8'));
  const R = w.road; const statusIds = new Set((lf.status?.rules || []).map((r) => r.id)); const hurts = new Set(Object.keys(lf.hurts || {})); const items = new Set(Object.keys(it.items)); const grainOpen = !!lf.grain?.open;
  ok(R && R.events?.length >= 10 && R.gapSec && R.chance, `${era}: 길 위의 일 10+ · gapSec·chance`);
  ok(new Set(R.events.map((s) => s.id)).size === R.events.length && R.events.every((s) => PROPKIND.has(s.prop) && s.title && s.body?.length && s.tag), `${era}: id 겹침 없음 · prop·제목·본문·tag`);
  ok(R.events.some((s) => s.night) && R.events.some((s) => s.prop === 'person') && R.events.filter((s) => s.prop !== 'person').length >= 4, `${era}: 밤 일 1+ · 사람 · 물건 4+`);
  let w3 = true, rollOk = true, hurtOk = true, condOk = true, factOk = true, giveOk = true, grainOk = true, yearOk = true;
  for (const s of R.events) { if (!s.fact || !s.fact.includes('→')) factOk = false; if (/\d{3,4}년|\(\d{3,4}\)/.test(s.fact + (s.body || []).join('')) ) yearOk = false; if ((s.ways || []).length < 2 || s.ways.length > 3) w3 = false;
    for (const wy of s.ways) { if (wy.roll && (!ABIL.has(wy.roll.ab) || !wy.fail)) rollOk = false; if (!wy.then && !wy.roll) w3 = false;
      for (const o of [wy.then, wy.fail]) { if (!o) continue; if (o.hurt && !hurts.has(o.hurt)) hurtOk = false; for (const k of [].concat(o.give || [])) if (!items.has(k)) giveOk = false; if (o.grain && !grainOpen) grainOk = false; }
      for (const tok of (wy.if || '').split(/&&|\|\|/)) { const f = tok.trim().replace(/^!/, '').replace(/^\(|\)$/g, ''); if (!f) continue; if (f.startsWith('status:')) { if (!statusIds.has(f.slice(7))) condOk = false; } else if (!f.startsWith('val:') && !f.startsWith('road:') && !f.startsWith('sit:')) condOk = false; }
      if (wy.if && !wy.why) condOk = false; }
    for (const tok of (s.if || '').split(/&&|\|\|/)) { const f = tok.trim().replace(/^!/, ''); if (f.startsWith('status:') && !statusIds.has(f.slice(7))) condOk = false; } }
  ok(w3 && rollOk && hurtOk && condOk && factOk && giveOk && grainOk && yearOk, `${era}: 길 2~3·굴림은 능력+실패 줄·흔적은 hurts·조건은 신분/값(+이유)·물건은 items·곡식은 열린 시대만·📜 인과(→)·연도 0`);
  total += R.events.length;
}
ok(total >= 110, `열한 시대 합 ${total} (110+)`);
ok(typeof PROPS.bundle === 'function' && PROPS.bundle('sack', 1).children.length >= 2 && PROPS.bundle('basket', 2).children.length >= 3, '소품 bundle(sack·basket) 그려진다');
// ---- 엔진(조선 전기) ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/life.json'), 'utf8'));
const inter = new Map(); const added = []; const e = { interactables: inter, areas: new Map(), onFrame: [], groundY: () => 0, spawn: new THREE.Vector3(), scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); }, traverse() {} }, removeInteractable: (k) => { const it = inter.get(k); if (it) { e.scene.remove(it.obj); inter.delete(k); } }, collides: () => false };
const said = []; const g = { e, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, moving: true, enabled: true }, flags: new Set(), inventory: [], world: { ...w, events: [] }, era: 'joseon-life', ui: { say: (t) => said.push(t), setGoal() {}, open(h, b) { g.lastOpen = { h, b }; g.opened = true; }, close() { g.opened = false; }, isOpen: () => !!g.opened }, sound: { play() {}, thump() {} }, renderInv() {}, updateMission() {}, save: { touch() {} }, results: [], story: null };
g.cond = (x) => g.life ? g.life.cond(x) : true; g.flag = (f) => { for (const x of [].concat(f)) g.flags.add(x); g.life.onFlag(); };
g.story = new Story(g, { add: [] }); g.story.apply(); g.story.fast = true; g.life = new Life(g, lf); g.life.abil = { 눈: 3, 손: 3, 발: 3, 배: 3, 몸: 3 }; g.life.mixed = []; g.life.status = 'sangmin'; g.life.d.grain.open = true; g.life.values.grain = 2;
const road = new Road(g, { ...w.road, chance: 1, gapSec: 10, firstGap: 0 });
const run = (sec, step = 0.5) => { for (let t = 0; t < sec; t += step) { road.tick(step); if (g.p.moving && !road.cur) { g.p.pos.z -= step * 2; } } };
// 1) 걷기 4초 + 간격 → 앞길에 놓인다(이름 road_*, 10~16m 앞, 정면)
run(12); const cur = road.cur; ok(cur && inter.has('road_' + cur.s.id) && cur.it.road === cur.s, `걷다 보면 앞길에 놓인다 — ${cur?.s.title || '(없음)'}`);
const d0 = cur && Math.hypot(cur.x - g.p.pos.x, cur.z - g.p.pos.z); ok(cur && d0 >= 8.5 && d0 <= 16.5 && cur.z < g.p.pos.z, `놓인 자리 = 앞 ${d0?.toFixed(1)}m (정면)`);
ok(cur && g.flags.has('road:' + cur.s.id) && cur.ring && cur.it.obj.children.includes(cur.ring), '같은 판엔 한 번(road:<id> 깃발) · 바닥 테');
// 2) 가까이 가면 「👀 길 위에」 한 줄, 더 가까이면 살펴보기 prompt
g.p.pos.set(cur.x, 0, cur.z + 8); g.p.moving = false; run(1); ok(cur.seen && said.some((s) => s.includes('👀')), '11m 안에 들면 「👀 길 위에 — 」 한 줄');
const pr = road.prompt(cur.it); ok(pr?.action && pr.name === cur.s.title && pr.verb === '살펴본다', '가까이 가면 살펴보기 prompt'); ok(road.info(cur.it)?.name === cur.s.title, 'info 도 제목');
// 3) 살펴보기 → 카드(길 + 그냥 간다) → 첫 길 → 값 → 치움
road.open(cur.it); ok(g.opened && g.lastOpen.h.includes('🛤') && g.lastOpen.b.length === cur.s.ways.length + 1 && g.lastOpen.b.at(-1).label === '그냥 간다' && g.p.enabled === false, '살펴보기 → 카드(길 + 「그냥 간다」), 몸은 멈춤');
const before = { ...g.life.values }; const wy = cur.s.ways.find((x) => !x.roll && !x.if) || cur.s.ways[0]; const btn = g.lastOpen.b[cur.s.ways.indexOf(wy)]; btn.onClick();
ok(g.opened && g.lastOpen.h.includes('📜') && (g.flags.has('road:' + cur.s.id + ':ok') || g.flags.has('road:' + cur.s.id + ':fail')), '길 고름 → 결과 카드(📜 실제) + road:<id>:ok|fail');
const th = wy.then || {}; const dv = ['heart', 'craft', 'grain'].filter((k) => th[k]); ok(dv.every((k) => g.life.values[k] === (before[k] || 0) + th[k]), `값이 바뀐다(${dv.map((k) => k + ' ' + th[k]).join(', ') || '없음'})`);
g.lastOpen.b[0].onClick(); ok(!g.opened && g.p.enabled === true && road.cur === null && !inter.has('road_' + cur.s.id), '「…」 → 닫히고 걷는다, 소품 치움');
// 4) 다음 것: 「그냥 간다」 → 치움·road:<id>:left, 값 그대로
g.p.moving = true; run(22); const c2 = road.cur; ok(c2 && c2.s.id !== cur.s.id, `다음 일은 다른 것 — ${c2?.s.title || '(없음)'}`);
if (c2) { g.p.pos.set(c2.x, 0, c2.z + 2); const v0 = { ...g.life.values }; road.open(c2.it); g.lastOpen.b.at(-1).onClick(); ok(!g.opened && road.cur === null && g.flags.has('road:' + c2.s.id + ':left') && ['heart', 'craft', 'grain'].every((k) => g.life.values[k] === v0[k]), '「그냥 간다」 → 치움 · road:<id>:left · 값 그대로'); }
// 5) 지나치면(40m 넘게 멀어지면) 조용히 사라진다 — road:<id>:passed
g.p.pos.set(0, 0, 0); run(14); const c3 = road.cur; ok(!!c3, `세 번째 놓임 — ${c3?.s.title || '(없음)'}`);
if (c3) { g.p.pos.set(c3.x + 60, 0, c3.z); run(2); ok(road.cur === null && g.flags.has('road:' + c3.s.id + ':passed') && !inter.has('road_' + c3.s.id), '40m 넘게 멀어지면 사라진다 · road:<id>:passed'); }
// 6) 회색: 조건 안 맞는 길은 눌리지 않고 이유가 있다(조선 전기 「부역 가다 쓰러진 사람」 곡식 0)
g.life.values.grain = 0; const corvee = w.road.events.find((s) => s.id === 'corvee'); g.flags.delete('road:corvee'); road.cur = null; g.p.pos.set(0, 0, 0); road.put(corvee, { x: 0, z: -12, yaw: 0 }); road.open(road.cur.it);
ok(g.lastOpen.b[0].disabled && g.lastOpen.b[0].reason === corvee.ways[0].why && g.lastOpen.b[0].label.startsWith('▫'), '회색 길: 곡식 0 → 「나눌 곡식이 없다」, 안 눌린다'); g.lastOpen.b.at(-1).onClick();
// 7) 조용하지 않으면(카드·쫓김·급한 일) 안 놓인다 · 같은 자리(22m 안)에선 안 놓인다
g.pulse = { chase: { c: {} } }; road.cur = null; road.since = 99; road.walk = 99; road.lastAt = null; g.p.moving = true; const n0 = inter.size; run(3); ok(road.cur === null && inter.size === n0, '쫓기는 동안은 안 놓인다'); g.pulse = null;
road.lastAt = { x: g.p.pos.x, z: g.p.pos.z }; road.since = 99; road.walk = 99; run(1, 0.5); ok(road.cur === null, '같은 자리(22m 안)에선 다시 안 놓인다');
// 8) 밤 일은 밤에만
g.story.isNight = false; const nightIds = w.road.events.filter((s) => s.night).map((s) => s.id); ok(nightIds.length && road.cands().every((s) => !nightIds.includes(s.id)), '낮엔 밤 일이 후보에 없다'); g.story.isNight = true; ok(road.cands().some((s) => nightIds.includes(s.id)), '밤엔 밤 일이 후보에 든다');
// 9) 신분 조건이 있는 일(백정은 「길을 피하는 사람」을 안 만난다)
g.story.isNight = false; g.flags.delete('road:baekjeongroad'); g.life.status = 'baekjeong'; ok(!road.cands().some((s) => s.id === 'baekjeongroad'), '백정은 「길을 피하는 사람」 일을 안 만난다'); g.life.status = 'sangmin'; ok(road.cands().some((s) => s.id === 'baekjeongroad'), '상민은 만난다');
console.log(`\n길 위의 일: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
