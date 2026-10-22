// 삼국 큰 사건 「강 건너에 깃발 — 한강을 두고, 성문이 닫히기 전에」(war 깊이기) — 급한 일 war:late(노비 제외) · 평민 남자 여울 지키기(눈, 실패 → 들의 곳간 털림) · 귀족 군량 내기(곡식 둘 회색) · 촌주 들의 사람들 성 안으로(인심 둘 회색) · 끝 갈림 21 · 그 뒤 규칙.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gojoseon-life': JSON.stringify({ craft: 6, heart: 4, grain: 5, branch: 'lord_south', status: 'noble' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ingot_1', 'granary_1', 'granary_2', 'fortgranary_1', 'slavehut_1', 'loom_1', 'decree_1', 'stall_1', 'saltstall_1', 'fortgate_1', 'wall_1', 'drum_1', 'spearrack_1', 'buddha_1', 'offering_1', 'bigpaddy_1', 'smallpaddy_1', 'lordfield_1', 'target_1', 'bowrack_1', 'pit_1', 'mound_1', 'hollow_1', 'log_1', 'ship_1', 'ironstall_1', 'stele_1', 'foecamp_1', 'pass_1', 'stone_1', 'stone_2', 'stone_3', 'fish_1',
  'npc_lord', 'npc_elder', 'npc_weaver', 'npc_smith', 'npc_overseer', 'npc_slave', 'npc_trader', 'npc_soldier', 'npc_monk', 'npc_farmer', 'npc_hwarang', 'npc_mourner', 'npc_rebel', 'npc_sailor', 'npc_borderguard'];
const AREAS = { village: [0, 0], market: [0, -17], forge: [21, -5], fortress: [0, 46], temple: [-54, 22], paddy: [-52, -32], archery: [44, -44], tomb: [62, 30], shore: [12, 62], ford: [10, 69], border: [8, 106], woods: [78, 76], pass: [-94, -86] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'foecamp_1') fn({ isMesh: true, material: { name: 'foe_tent' }, set visible(v) { shown.tent = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
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
  const useR = (name, label) => { use(name); if (!btn(label) && S.panel?.b.length === 1) { closeCard(); use(name); } };
  const on = (...flags) => { for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toWar = (T) => { skip(T.g, ['tax', 'iron', 'corvee', 'temple', 'famine']); T.on('war:on'); T.goTo('fortress'); T.closeCard(); };
const toEnd = async (T, choice = 'stay') => { T.on('fall:on'); T.goTo('village'); T.closeCard(); T.g.flag('fall:' + choice); T.closeCard(); await settle(); };
// 데이터
const w = J('world'); const dl = w.pulse.deadlines.find((d) => d.id === 'war'); ok(dl && dl.sec === 75 && dl.on.includes('!status:slave') && dl.on.includes('!sit:beacon:open') && dl.failFlag === 'war:late', '급한 일 「성문 — 해 지기 전에」 75초 · 노비 제외 · 봉화 먼저면 양보');
const wr = J('life').situations.find((s) => s.id === 'war'); ok(['ford', 'fordlost', 'supply', 'shelter', 'late'].every((id) => wr.choices.some((c) => c.id === id && c.done === 'war:' + id)) && ['ford', 'fordlost', 'supply', 'shelter', 'late'].every((id) => { const c = wr.choices.find((x) => x.id === id); return c.fact && !/\d{3,4}/.test(c.fact); }) && wr.body.some((b) => b.includes('나루')) && wr.q.a[0].includes('뱃길'), '길 다섯 추가 · fact 연도 없음 · 📜 들·나루·뱃길 · q');
const fl = J('life').situations.find((s) => s.id === 'fall'); ok(fl.choices.every((c) => { const ids = c.then.find((t) => t.end).end.branches.map((b) => b.id); return ids.length === 21 && ids.indexOf('ford') === ids.indexOf('merit') - 1 && ids.indexOf('supply') === ids.indexOf('noble_silla') - 1 && ids.indexOf('shelter') === ids.indexOf('chief') - 1 && ids.indexOf('late') === ids.indexOf('limp') + 1; }), '끝 갈림 21 — ford 는 merit 앞·supply 는 noble_silla 앞·shelter 는 chief 앞·late 는 limp 뒤(다섯 사본)');
const rules = w.bridge.beats[1].rules; ok(rules.some((r) => r.if?.includes('life:ford') && r.if.includes('life:shelter')) && rules.some((r) => r.if?.includes('life:supply')) && rules.some((r) => r.if === 'life:late') && !rules.at(-1).if, '그 뒤 규칙 — ford·shelter·supply 넓힘 + late 한 줄 · 마지막 무조건');
// 판 1 — 평민 남자(고구려): 여울 지키기 성공 → 여울을 지킨 집
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'north', status: 'farmer' });
{ const T = mkGame('m', ['stele'], 'eye'); const { g, S, useR, pick, btn, done, closeCard } = T;
  toWar(T); ok(g.flags.has('nation:goguryeo') && g.life.status === 'farmer', '고구려 평민');
  useR('npc_soldier', '여울을'); ok(btn('여울을') && !btn('여울을').disabled && btn('나간다') && !btn('나간다').disabled, '평민 남자: 여울 지키기·나간다 열림');
  const h = g.life.values.heart; pick('여울을'); ok(done('war') && g.flags.has('war:ford') && g.life.values.heart === h + 1, '여울을 지켰다(눈 굴림 성공) — 🤝+1'); closeCard();
  await toEnd(T, 'north'); ok(g.flags.has('life:north'), '북으로 간 집(fall:north 가 war 보다 먼저)'); }
{ const T = mkGame('m', ['stele'], 'eye'); const { g, S, useR, pick, closeCard } = T;
  toWar(T); useR('npc_soldier', '여울을'); pick('여울을'); closeCard();
  await toEnd(T, 'stay'); ok(g.flags.has('life:ford') && S.panels.at(-1).includes('여울을 지킨 집'), '끝: 여울을 지킨 집(merit 앞)'); }
// 판 2 — 여울 놓침(굴림 실패) → 🌾-1 🤝-1 · 끝은 평민
{ const T = mkGame('m', ['stele'], 'belly'); const { g, useR, pick, closeCard, done } = T;
  toWar(T); const h = g.life.values.heart, gr = g.life.values.grain; Math.random = () => 0.99; useR('npc_soldier', '여울을'); pick('여울을'); Math.random = () => 0.01;
  ok(done('war') && g.flags.has('war:fordlost') && !g.flags.has('war:ford') && g.life.values.heart === h - 1 && g.life.values.grain === gr - 1, '여울을 놓쳤다 → 🌾-1 🤝-1'); closeCard();
  await toEnd(T); ok(g.flags.has('life:farmer') && !g.flags.has('life:ford'), '끝: 평민(ford 아님)'); }
// 판 3 — 평민 여자: 여울 회색 + 이유
{ const T = mkGame('f', ['stele']); const { useR, btn } = T; toWar(T); useR('npc_soldier', '여울을'); ok(btn('여울을')?.disabled && btn('여울을').reason.includes('성 안'), '여자: 여울 회색·이유'); }
// 판 4 — 귀족(신라): 군량 — 곡식 둘 없으면 회색, 있으면 → 곳간을 연 귀족의 집
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 6, heart: 4, grain: 1, branch: 'lord_south', status: 'noble' });
{ const T = mkGame('f', ['stele']); const { g, useR, btn } = T; toWar(T); ok(g.life.status === 'noble' && g.life.values.grain < 2, '곡식 하나뿐인 귀족'); useR('npc_lord', '군량을'); ok(btn('군량을')?.disabled && btn('군량을').reason.includes('곳간이 빈'), '곡식 둘 없으면 군량 회색'); }
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 6, heart: 4, grain: 5, branch: 'lord_south', status: 'noble' });
{ const T = mkGame('f', ['stele']); const { g, S, useR, pick, btn, closeCard, done } = T;
  toWar(T); ok(g.flags.has('nation:silla'), '신라 귀족'); g.inventory.push('grain', 'grain'); const h = g.life.values.heart, gr = g.life.values.grain;
  useR('npc_lord', '군량을'); ok(!btn('군량을')?.disabled && btn('앞장서겠습니다')?.disabled && !btn('성 안을')?.disabled, '여자 귀족: 군량 열림·앞장 회색·성 안 열림');
  pick('군량을'); ok(done('war') && g.flags.has('war:supply') && g.life.values.heart === h + 2 && g.life.values.grain === gr - 1 && g.count('grain') === 0, '군량을 냈다 — 벼 두 단 내고 🤝+2 🌾-1'); closeCard();
  await toEnd(T); ok(g.flags.has('life:supply') && S.panels.at(-1).includes('곳간을 연 귀족의 집'), '끝: 곳간을 연 귀족의 집(noble_silla 앞)'); }
// 판 5 — 촌주: 인심 둘 회색 / 있으면 들의 사람들을 성 안으로
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 1, grain: 6, branch: 'farmer', status: 'farmer' });
{ const T = mkGame('m', ['stele']); const { g, useR, btn } = T; toWar(T); ok(g.life.status === 'chief', '곡식 많은 집 → 촌주'); useR('npc_elder', '들의 사람들'); ok(btn('들의 사람들')?.disabled && btn('들의 사람들').reason.includes('인심') && !btn('사람을 모아')?.disabled, '인심 하나: 성 안 들이기 회색·모아 보내기 열림'); }
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 6, branch: 'farmer', status: 'farmer' });
{ const T = mkGame('f', ['stele']); const { g, S, useR, pick, btn, closeCard, done } = T;
  toWar(T); const h = g.life.values.heart; useR('npc_elder', '들의 사람들'); ok(!btn('들의 사람들')?.disabled, '인심 셋: 열림');
  pick('들의 사람들'); ok(done('war') && g.flags.has('war:shelter') && g.life.values.heart === h + 2, '성 안으로 들였다 — 🤝+2'); closeCard();
  await toEnd(T); ok(g.flags.has('life:shelter') && S.panels.at(-1).includes('촌주의 집'), '끝: 사람들을 성 안에 들인 촌주의 집(chief 앞)'); }
// 판 6 — 급한 일 실패 war:late → 🌾-1 🤝-1 → 들에서 밤을 난 집
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 2, branch: 'farmer', status: 'farmer' });
{ const T = mkGame('m', ['stele']); const { g, S, closeCard, done } = T;
  toWar(T); const h = g.life.values.heart, gr = g.life.values.grain; g.flag('war:late'); ok(done('war') && g.flags.has('sit:war:late') && g.life.values.heart === h - 1 && g.life.values.grain === gr - 1, '성문이 닫혔다 — 🌾-1 🤝-1'); closeCard();
  await toEnd(T); ok(g.flags.has('life:late') && S.panels.at(-1).includes('들에서 밤을 난 집'), '끝: 들에서 밤을 난 집(limp 뒤·farmer 앞)'); }
console.log(`samguk 고리 4(한강·성문): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
