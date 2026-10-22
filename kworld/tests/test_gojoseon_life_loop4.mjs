// 고조선 큰 사건 「법 앞에서 — 법을 외는 날」(court 깊이기) — 급한 일 court:late · 도둑 달아나기 ⚠(성공 → 법에서 달아난 집 / 실패 → 절뚝+종) · 군장 곁 내주고 밭 받기 → 사람을 거둔 집 · 농민 두 단 돌려주기 · 그 뒤 규칙.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:bronze-life': JSON.stringify({ craft: 6, heart: 4, grain: 3, branch: 'chief', status: 'rich' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ironhoe_1', 'slab_1', 'granary_1', 'granary_2', 'slavehut_1', 'gatefront_1', 'rampart_1', 'stall_1', 'jail_1', 'lawstone_1', 'altar_1', 'sacredtree_1', 'bigpaddy_1', 'smallpaddy_1', 'masterfield_1', 'hollow_1', 'log_1', 'tower_1', 'coinstall_1', 'fish_1', 'hancamp_1', 'pass_1', 'stone_1', 'stone_2', 'deer_1',
  'npc_king', 'npc_judge', 'npc_smith', 'npc_owner', 'npc_slave', 'npc_guard', 'npc_priest', 'npc_farmer', 'npc_overseer', 'npc_runaway', 'npc_trader'];
const AREAS = { village: [0, 0], gate: [0, -27], forge: [13, -3], market: [-1, -13], altar: [-50, 30], paddy: [-50, -26], field: [46, -22], woods: [68, 28], tower: [40, 50], shore: [14, 54], ford: [10, 64], han: [8, 100], pass: [-6, -98] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'hancamp_1') fn({ isMesh: true, material: { name: 'han_tent' }, set visible(v) { shown.tent = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toCourt = async (g, goTo, closeCard) => { skip(g, ['harvest', 'iron', 'night']); g.flags.add('night:1'); g.flags.add('court:on'); goTo('village'); closeCard(); };
const toEnd = async (g, goTo, closeCard) => { skip(g, ['rite', 'war']); g.flags.add('fall:on'); goTo('gate'); closeCard(); g.flag('fall:stay'); closeCard(); await settle(); };
const w = J('world'); const dl = w.pulse.deadlines.find((d) => d.id === 'court'); ok(dl && dl.sec === 90 && dl.on.includes('!hurt:thief') && dl.failFlag === 'court:late', '급한 일 「법 외는 날」 90초 · 도둑이 아닌 집만');
const ct = J('life').situations.find((s) => s.id === 'court'); ok(['run', 'runcaught', 'retain', 'return', 'late'].every((id) => ct.choices.some((c) => c.id === id && c.done === 'court:' + id)) && ct.choices.every((c) => c.fact && !/\d{3,4}/.test(c.fact)), '길 다섯 추가 · fact · 연도 없음');
const fl = J('life').situations.find((s) => s.id === 'fall'); ok(fl.choices.every((c) => { const ids = c.then.find((t) => t.end).end.branches.map((b) => b.id); return ids.length === 15 && ids.indexOf('court_run') < ids.indexOf('freed') && ids.indexOf('lord_retain') === ids.indexOf('county_collab') + 1; }), '끝 갈림 15 — court_run 은 freed 앞·lord_retain 은 county_collab 뒤');
ok(w.bridge.beats[1].rules.some((r) => r.if?.includes('life:court_run')) && w.bridge.beats[1].rules.some((r) => r.if?.includes('life:lord_retain')), '그 뒤 규칙에 둘');
// 판 1 — 농민 도둑: 달아나기 성공 → 법에서 달아난 집
store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'farmer', status: 'farmer' });
{ const { g, S, use, pick, closeCard, goTo, btn, done } = mkGame('m', ['coin'], 'foot');
  await toCourt(g, goTo, closeCard); g.life.injure?.('thief') ?? g.life.hurt.add('thief'); g.flags.add('hurt:thief');
  use('lawstone_1'); use('npc_judge'); ok(btn('달아난다') && !btn('달아난다').disabled && btn('값을 치른다').disabled, '도둑: 달아나기 열림·값 회색');
  pick('달아난다'); ok(done('court') && g.flags.has('court:run') && g.life.status === 'farmer', '달아났다(발 굴림 성공) — 신분 그대로'); closeCard();
  await toEnd(g, goTo, closeCard); ok(g.flags.has('life:court_run') && S.panels.at(-1).includes('달아난 집'), '끝: 법에서 달아난 집'); }
// 판 2 — 달아나다 잡힘 → 절뚝 + 종
{ const { g, S, use, pick, closeCard, goTo, done } = mkGame('m', ['coin'], 'belly');
  await toCourt(g, goTo, closeCard); g.life.hurt.add('thief'); g.flags.add('hurt:thief'); use('lawstone_1');
  Math.random = () => 0.99; use('npc_judge'); pick('달아난다'); Math.random = () => 0.01;
  ok(done('court') && g.flags.has('court:runcaught') && g.life.hurt.has('leg') && g.life.status === 'slave', '잡혔다 → 절뚝 + 종'); closeCard();
  await toEnd(g, goTo, closeCard); ok(g.flags.has('life:slave_still') && !g.flags.has('life:court_run'), '끝: 종 그대로(court_run 아님)'); }
// 판 3 — 군장 곁: 값을 내주고 밭을 받는다 → 사람을 거둔 집
store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 6, heart: 4, grain: 3, branch: 'chief', status: 'rich' });
{ const { g, S, use, pick, closeCard, goTo, btn, done } = mkGame('f', ['coin']);
  await toCourt(g, goTo, closeCard); use('lawstone_1'); g.inventory.push('grain', 'grain', 'grain'); const h = g.life.values.heart, gr = g.life.values.grain;
  use('npc_judge'); ok(!btn('값을 내주고')?.disabled && btn('두 단을')?.disabled, '군장 곁: 내주고 밭 받기 열림·두 단 돌려주기 회색');
  pick('값을 내주고'); ok(done('court') && g.flags.has('court:retain') && g.life.values.heart === h + 1 && g.life.values.grain === gr - 1, '밭을 받았다 — 인심 +1·곡식 -1(세 단 내고 밭 받음)'); closeCard();
  await toEnd(g, goTo, closeCard); ok(g.flags.has('life:lord_retain') && S.panels.at(-1).includes('사람을 거둔 집'), '끝: 값을 내주고 사람을 거둔 집'); }
// 판 4 — 농민: 두 단을 돌려주면 → 눈 · 급한 일 실패 court:late 는 따로
store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'farmer', status: 'farmer' });
{ const { g, use, pick, closeCard, goTo, btn, done } = mkGame('m', ['coin']);
  await toCourt(g, goTo, closeCard); use('lawstone_1'); use('npc_judge'); ok(!btn('두 단을')?.disabled && btn('값을 내주고')?.disabled, '농민: 두 단 돌려주기 열림·내주고 밭 회색');
  pick('두 단을'); ok(done('court') && g.flags.has('court:return'), '법은 값을 정했다'); closeCard(); }
{ const { g, closeCard, goTo, done } = mkGame('m', ['coin']);
  await toCourt(g, goTo, closeCard); const h = g.life.values.heart; g.flag('court:late'); ok(done('court') && g.flags.has('sit:court:late') && g.life.values.heart === h - 1 && !g.flags.has('law:heard'), '해가 졌다 — 법을 못 들음 🤝-1'); closeCard(); }
console.log(`gojoseon 고리 4(법 외는 날): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
