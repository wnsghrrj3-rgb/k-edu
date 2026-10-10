// 고조선 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(성 밖 농민 마을·쇠돌 골·돌널무덤 벌판·남쪽 길 쉼터·북쪽 고개·갈대 늪·군현 관청 터)의 상황 일곱을 강제로 켜서 세 판(군장 곁 여자 / 종 남자 / 쇠 다루는 집 남자). 신분 회색·종의 도망(늪·남쪽)·무덤 도둑 → 종·군현 손잡기 끝 갈림을 본다.
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
const IX = ['fire_1', 'anvil_1', 'ironhoe_1', 'slab_1', 'granary_1', 'slavehut_1', 'gatefront_1', 'rampart_1', 'stall_1', 'jail_1', 'lawstone_1', 'altar_1', 'sacredtree_1', 'bigpaddy_1', 'smallpaddy_1', 'masterfield_1', 'hollow_1', 'tower_1', 'coinstall_1', 'fish_1', 'hancamp_1', 'pass_1', 'stone_1',
  'outerwell_1', 'taxpile_1', 'ore_1', 'charkiln_1', 'cist_1', 'dagger_1', 'restfire_1', 'southgoods_1', 'northcairn_1', 'wimancamp_1', 'raft_1', 'marshtrack_1', 'countysite_1',
  'npc_king', 'npc_judge', 'npc_smith', 'npc_owner', 'npc_slave', 'npc_guard', 'npc_priest', 'npc_farmer', 'npc_overseer', 'npc_runaway', 'npc_trader', 'npc_outer', 'npc_miner', 'npc_tombman', 'npc_southman', 'npc_wiman', 'npc_reedcutter', 'npc_official'];
const AREAS = { village: [0, 0], gate: [0, -27], forge: [13, -3], market: [-1, -13], altar: [-50, 30], paddy: [-50, -26], field: [46, -22], woods: [68, 28], tower: [40, 50], shore: [14, 54], ford: [10, 64], han: [8, 100], pass: [-6, -98], outer: [-34, 60], ore: [86, 56], tomb: [-84, 70], rest: [-44, 92], northpass: [-62, -104], marsh: [58, -60], county: [34, 64] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'countysite_1') fn({ isMesh: true, material: { name: 'han_office' }, set visible(v) { shown.office = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; if (d?.hidden) g.showMats(t, d.hidden, false); }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const pick = (label) => { const b = btn(label); if (!b) { console.log('버튼 없음', label, S.panel?.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const useR = (name, label) => { use(name); if (!btn(label) && S.panel?.b.length === 1) { closeCard(); use(name); } };   // 꼭 나오는 상황 카드가 먼저 뜨면 닫고 한 번 더
  const on = (...flags) => { g.flags.add(...flags); for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const MIX = ['tax', 'ore', 'tomb', 'south', 'wiman', 'marsh', 'county'];

// ===== 판 1: 군장 곁의 집(곡식 3) 여자 — 반만 거둔다 · 말뚝 · 동검 묻기 · 길 막기 · 땅 떼어 주자 · 못 본 척 · 관리와 손잡기 → 끝 갈림 「군현 벼슬을 받은 집」
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX);
  ok(g.life.situations.length === 14 && Object.keys(g.world.areas).length === 20, '꼭 7 + 새 7 · 구역 20'); ok(g.life.status === 'noble', '군장 곁의 집');
  goTo('outer'); ok(!opened('tax'), '거둠 전엔 바치는 날 안 열림');
  on('sit:harvest:done'); goTo('outer'); ok(opened('tax'), '바치는 날'); closeCard(); useR('npc_outer', '한 단씩'); ok(!btn('한 단씩')?.disabled && btn('낸다')?.disabled && btn('주인 몫')?.disabled, '군장 곁: 거두기 열림·내기·나르기 회색'); pick('흉년이니'); closeCard(); ok(done('tax') && g.flags.has('tax:half') && g.life.values.grain === 4, '반만 → 🌾+1 🤝+2');
  on('sit:iron:done'); goTo('ore'); ok(opened('ore'), '쇠돌 골'); closeCard(); useR('npc_miner', '골짜기에'); ok(!btn('골짜기에')?.disabled && btn('캐서 녹인다')?.disabled, '말뚝 열림·녹이기 회색'); pick('골짜기에'); closeCard(); ok(done('ore') && g.flags.has('ore:claim') && g.life.values.grain === 6, '말뚝 → 🌾+2');
  goTo('rest'); ok(opened('south'), '남쪽 사람'); closeCard(); useR('npc_southman', '길을 막는다'); ok(!btn('길을 막는다')?.disabled && btn('따라간다')?.disabled, '길 막기 열림·따라가기 회색'); pick('길을 막는다'); closeCard(); ok(done('south') && g.flags.has('south:block'), '길을 막았다');
  on('sit:night:done'); goTo('marsh'); ok(opened('marsh'), '갈대 늪'); closeCard(); useR('npc_reedcutter', '개를 풀어'); ok(!btn('개를 풀어')?.disabled && btn('먹을 것을')?.disabled, '개 풀기 열림·먹이기 회색'); pick('못 본 척'); closeCard(); ok(done('marsh') && g.flags.has('marsh:ignore'), '못 본 척');
  on('sit:court:done'); goTo('northpass'); ok(opened('wiman'), '위만'); closeCard(); useR('npc_wiman', '서쪽 땅을'); ok(!btn('서쪽 땅을')?.disabled && btn('무리에 든다')?.disabled, '땅 떼어 주기 열림·무리 들기 회색'); pick('서쪽 땅을'); closeCard(); ok(done('wiman') && g.flags.has('wiman:land'), '서쪽 땅');
  on('sit:heaven:done'); goTo('tomb'); ok(opened('tomb'), '돌널무덤'); closeCard(); useR('npc_tombman', '동검을 함께'); ok(!btn('동검을 함께')?.disabled, '군장 곁은 동검 묻기 열림'); pick('동검을 함께'); closeCard(); ok(done('tomb') && g.flags.has('tomb:bury') && g.life.values.grain === 7, '동검 묻기 → 🌾-1(8-1)');
  on('sit:war:done'); goTo('county'); ok(opened('county'), '군현'); ok(shown.office === true, '관청 기와가 보인다'); closeCard(); useR('npc_official', '관리와 손잡는다'); ok(!btn('관리와 손잡는다')?.disabled && btn('새 법을')?.disabled, '손잡기 열림·새 법 회색'); pick('관리와 손잡는다'); closeCard(); ok(done('county') && g.flags.has('county:collab'), '관리와 손잡았다');
  const fall = g.life.situations.find((x) => x.id === 'fall'); const end = fall.choices[0].then[0].end; const br = end.branches.find((b) => g.life.cond(b.if));
  ok(br?.id === 'county_collab', '끝 갈림 = 군현 벼슬을 받은 집');
  ok(['tax', 'ore', 'tomb', 'south', 'wiman', 'marsh', 'county'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 종(곡식 0) 남자 — 주인 몫 나르기 · 시켜서 캐기 · 늪 건너기 성공 → 농민 · 무리에 들기 · 밤 무덤 도둑 실패 → 다시 종 · 새 법을 묻는다 → 끝 갈림 「무덤 도둑의 집」
{
  store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'slave', status: 'poor' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX, 'foot');
  ok(g.life.status === 'slave', '종의 집');
  on('sit:harvest:done'); goTo('outer'); closeCard(); useR('npc_outer', '주인 몫'); ok(btn('한 단씩')?.disabled && btn('낸다')?.disabled && !btn('주인 몫')?.disabled, '종: 거두기·내기 회색, 나르기 열림'); pick('주인 몫'); closeCard(); ok(done('tax') && g.flags.has('tax:carry'), '주인 몫을 날랐다');
  on('sit:iron:done'); goTo('ore'); closeCard(); ok(g.promptFor(g.e.interactables.get('ore_1')).verb === '살펴보기', '종은 쇠돌을 직접 못 캔다'); useR('npc_miner', '주인이 시켜'); ok(btn('캐서 쇠 다루는')?.disabled && !btn('주인이 시켜')?.disabled, '팔기 회색·시켜서 캐기 열림'); pick('주인이 시켜'); closeCard(); ok(done('ore') && g.flags.has('ore:forced'), '시켜서 캤다');
  on('sit:night:done'); goTo('marsh'); closeCard(); useR('raft_1', '늪을'); ok(g.flags.has('marsh:free') || g.flags.has('marsh:caught'), '뗏목 — 굴림이 돌았다'); closeCard(); ok(done('marsh') && g.flags.has('marsh:free') && g.life.status === 'farmer' && g.flags.has('free:now'), '늪 건너기 성공 → 농민·풀려남');
  on('sit:court:done'); goTo('northpass'); closeCard(); useR('npc_wiman', '무리에 든다'); ok(!btn('무리에 든다')?.disabled && btn('서쪽 땅을')?.disabled, '풀려난 농민: 무리 들기 열림·땅 회색'); pick('무리에 든다'); closeCard(); ok(done('wiman') && g.flags.has('wiman:join'), '무리에 들었다');
  on('sit:heaven:done'); goTo('tomb'); closeCard(); useR('npc_tombman', '동검을 함께'); ok(btn('동검을 함께')?.disabled, '농민은 동검 묻기 회색');
  S.panel = null; g.p.enabled = true; Math.random = () => 0.99; g.life.tries = {};   // 눈 3 실패 — 무덤 도둑
  ok(g.promptFor(g.e.interactables.get('cist_1')).verb.includes('꺼낸다'), '돌널 — 동검을 꺼낸다 ⚠'); useR('cist_1', '해 지면'); pick('해 지면'); closeCard(); ok(done('tomb') && g.flags.has('tomb:caught') && g.life.status === 'slave' && g.flags.has('status:slave'), '무덤 도둑 잡힘 → 법대로 다시 종');
  Math.random = () => 0.01;
  on('sit:war:done'); goTo('county'); closeCard(); useR('npc_official', '새 법을'); ok(!btn('새 법을')?.disabled && btn('적지 않고')?.disabled && btn('관리와 손잡는다')?.disabled, '종: 새 법 열림·숲·손잡기 회색'); pick('새 법을'); closeCard(); ok(done('county') && g.flags.has('county:law'), '새 법을 물었다');
  const end = g.life.situations.find((x) => x.id === 'fall').choices[1].then[0].end; const br = end.branches.find((b) => g.life.cond(b.if));
  ok(br?.id === 'tomb_enslaved', '끝 갈림 = 무덤 도둑의 집(풀려남보다 앞)');
}
// ===== 판 3: 쇠 다루는 집(곡식 1) 남자 — 괭이로 내기 · 캐서 녹이기 · 쇠 팔기 · 쇠 칼 보기 · 먹을 것 두기 · 덮개돌 나르기 · 관청 기와 굽기 + 숯 굽기·남쪽 사람 따라가기 회색
{
  store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 6, heart: 2, grain: 1, branch: 'smith', status: 'farmer' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX);
  ok(g.life.status === 'smith', '쇠 다루는 집');
  on('sit:harvest:done'); goTo('outer'); closeCard(); useR('npc_outer', '괭이'); ok(!btn('괭이')?.disabled && btn('낸다')?.disabled, '쇠 집: 괭이 열림·내기 회색'); pick('괭이'); closeCard(); ok(done('tax') && g.flags.has('tax:hoe'), '괭이로 냈다');
  on('sit:iron:done'); goTo('ore'); closeCard(); useR('ore_1', '캐서 녹인다'); ok(!btn('캐서 녹인다')?.disabled, '쇠 집은 녹이기 열림'); pick('캐서 녹인다'); closeCard(); ok(done('ore') && g.flags.has('ore:smelt') && g.life.values.craft >= 5, '녹였다 → ✋+2');
  goTo('rest'); closeCard(); useR('npc_southman', '쇠 덩이'); ok(!btn('쇠 덩이')?.disabled && btn('곡식과')?.disabled && btn('따라간다')?.disabled && btn('길을 막는다')?.disabled, '쇠 팔기만 열림'); pick('쇠 덩이'); closeCard(); ok(done('south') && g.flags.has('south:sell'), '쇠를 팔았다');
  on('sit:court:done'); goTo('northpass'); closeCard(); useR('npc_wiman', '그들의 쇠'); ok(!btn('그들의 쇠')?.disabled && btn('무리에 든다')?.disabled, '쇠 칼 보기 열림·무리 회색'); pick('그들의 쇠'); closeCard(); ok(done('wiman') && g.flags.has('wiman:iron'), '쇠 칼을 봤다');
  on('sit:night:done'); goTo('marsh'); closeCard(); useR('npc_reedcutter', '먹을 것을'); ok(!btn('먹을 것을')?.disabled && btn('개를 풀어')?.disabled, '먹이기 열림·개 회색'); pick('먹을 것을'); closeCard(); ok(done('marsh') && g.flags.has('marsh:feed'), '먹을 것을 뒀다');
  on('sit:heaven:done'); goTo('tomb'); closeCard(); useR('cist_1', '덮개돌을'); pick('덮개돌을'); closeCard(); ok(done('tomb') && g.flags.has('tomb:carry'), '덮개돌을 날랐다');
  on('sit:war:done'); goTo('county'); closeCard(); useR('npc_official', '관청 기와'); ok(!btn('관청 기와')?.disabled && btn('새 법을')?.disabled, '기와 굽기 열림·새 법 회색'); pick('관청 기와'); closeCard(); ok(done('county') && g.flags.has('county:tile'), '기와를 구웠다');
}
console.log(`gojoseon life 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
