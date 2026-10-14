// 고조선 인생 층 고리 시험 3 — 10-14 넓히기 2: 새 장소 셋(청동 거푸집 공방·묵은 땅 개간 터·토성 쌓는 터)의 섞여 상황 셋을 강제로 켜서 네 판(농민 남자 / 군장 곁 여자 / 종 남자 / 쇠 집 남자) + 굴림 실패. 신분·성별 회색, 쇠 괭이 requires, 숨김 재질 보임(거울·새 밭·새 토성), 부역 빠지다 잡힘을 본다. WebGL 없이 규칙만.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ironhoe_1', 'slab_1', 'granary_1', 'slavehut_1', 'gatefront_1', 'rampart_1', 'stall_1', 'jail_1', 'lawstone_1', 'altar_1', 'sacredtree_1', 'bigpaddy_1', 'smallpaddy_1', 'masterfield_1', 'hollow_1', 'tower_1', 'coinstall_1', 'fish_1', 'hancamp_1', 'pass_1', 'stone_1',
  'outerwell_1', 'taxpile_1', 'ore_1', 'charkiln_1', 'cist_1', 'dagger_1', 'restfire_1', 'southgoods_1', 'northcairn_1', 'wimancamp_1', 'raft_1', 'marshtrack_1', 'countysite_1', 'mold_1', 'castheap_1', 'newfield_1', 'rootpile_1', 'rampartwork_1', 'corveelist_1',
  'npc_king', 'npc_judge', 'npc_smith', 'npc_owner', 'npc_slave', 'npc_guard', 'npc_priest', 'npc_farmer', 'npc_overseer', 'npc_runaway', 'npc_trader', 'npc_outer', 'npc_miner', 'npc_tombman', 'npc_southman', 'npc_wiman', 'npc_reedcutter', 'npc_official', 'npc_caster', 'npc_clearer', 'npc_builder'];
const AREAS = { village: [0, 0], gate: [0, -27], forge: [13, -3], market: [-1, -13], altar: [-50, 30], paddy: [-50, -26], field: [46, -22], woods: [68, 28], tower: [40, 50], shore: [14, 54], ford: [10, 64], han: [8, 100], pass: [-6, -98], outer: [-34, 60], ore: [86, 56], tomb: [-84, 70], rest: [-44, 92], northpass: [-62, -104], marsh: [58, -60], county: [34, 64], casting: [-22, -44], clear: [-84, 8], work: [38, -16] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:bronze-life'] = JSON.stringify(carry); const mixed = ['casting', 'clear', 'work'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { mold_1: 'mirror_bronze', newfield_1: 'new_field', rampartwork_1: 'new_rampart' };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (MAT[name]) fn({ isMesh: true, material: { name: MAT[name] }, set visible(v) { shown[name] = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const drain = async (T) => { for (let i = 0; i < 3; i++) { T.closeCard(); await settle(); } };

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  for (const id of ['casting', 'clear', 'work']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 5 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name, `${id} 장소 ${s.place} 이름`);
    const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
    ok(s.choices.every((c) => setters.includes(`"${c.done}"`)), `${id} done 깃발이 NPC/대상에서 세워짐`);
  }
  ok(life.situations.filter((x) => !x.must).length === 20 && life.mixedCount === 6, '섞여 20 · 판마다 6');
  ok(['mold', 'newfield', 'rampartwork'].every((t) => items.targets[t].hidden?.length === 1), '숨김 재질 셋(거울·새 밭·새 토성)');
  ok(world.scenery.grass.avoid.some((a) => a[0] === 38 && a[1] === -16), '토성 쌓는 터 풀 피하기(엔진 좌표)');
  const st = (n) => npcs[n].lines[0].choices.filter((c) => c.if && c.gray).length;
  ok(st('caster') === 3 && st('clearer') === 5 && st('builder') === 5, '신분·성별 회색 — 공방 3·개간 5·부역 5');
  ok(JSON.stringify(npcs.caster).includes('"if": "sex:f"') || JSON.stringify(npcs.caster).includes('"if":"sex:f"'), '거울은 여자 — 성별 회색');
}

// ---- 1판: 농민 남자(곡식 0) — 쇠 괭이 없으면 못 갈고, 받으면 새 밭 보임 / 흙 지고 다져 새 토성 보임 / 공방은 숯
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 0, branch: 'poor', status: 'poor' }); const { g, shown } = T;
  ok(g.life.status === 'farmer', '농민의 집');
  ok(g.life.situations.length === 10, '꼭 7 + 새 장소 3');
  T.goTo('clear'); ok(!T.opened('clear'), '쇠 들어옴 전엔 개간 터 안 열림'); T.goTo('work'); ok(!T.opened('work'), '법 전엔 토성 쌓는 터 안 열림'); T.goTo('casting'); ok(!T.opened('casting'), '법 전엔 공방 안 열림');
  g.flags.add('sit:iron:done'); g.flags.add('sit:court:done');
  // 개간 터
  T.goTo('clear'); ok(T.opened('clear'), '개간 터 — 묵은 땅을 간다 열림'); await drain(T);
  T.useR('npc_clearer', '쇠 괭이로'); ok(T.btn('말뚝을')?.disabled && T.btn('주인 몫')?.disabled && T.btn('괭이 날')?.disabled, '농민 — 말뚝·주인 몫·괭이 날 회색'); ok(T.btn('쇠 괭이로') && !T.btn('쇠 괭이로').disabled, '농민 — 쇠 괭이 길 열림(회색 아님)');
  const n0 = T.S.says.length; T.pick('쇠 괭이로'); ok(!g.flags.has('clear:iron') && T.S.says.slice(n0).some((s) => s.includes('쇠 괭이가 없다')), '쇠 괭이가 없으면 못 간다(requires)'); await drain(T);
  g.inventory.push('ironhoe'); const gr = g.life.values.grain; T.useR('newfield_1', '쇠 괭이로'); T.pick('쇠 괭이로'); await drain(T);
  ok(T.done('clear') && g.flags.has('clear:iron') && g.life.values.grain === gr + 2 && shown.newfield_1 === true, '쇠 괭이로 갈아 새 밭(🌾+2, new_field 보임)');
  T.use('newfield_1'); ok(!T.btn('쇠 괭이로'), '끝난 뒤엔 선택 판 없음'); await drain(T);
  // 토성 쌓는 터
  T.goTo('work'); ok(T.opened('work'), '토성 쌓는 터 — 성을 쌓는다 열림'); await drain(T);
  T.useR('npc_builder', '흙을 지고'); ok(T.btn('종을 대신')?.disabled && T.btn('주인 대신')?.disabled && T.btn('달구')?.disabled, '농민 — 종 보내기·주인 대신·공이 회색'); ok(!T.btn('빠진다').disabled, '농민 — 빠지는 길 열림');
  const h0 = g.life.values.heart; T.pick('흙을 지고'); await drain(T);
  ok(T.done('work') && g.flags.has('work:carry') && g.life.values.heart === h0 + 2 && shown.rampartwork_1 === true, '흙을 지고 다짐(🤝+2, new_rampart 보임)');
  // 공방
  T.goTo('casting'); ok(T.opened('casting'), '공방 — 거울을 붓는 날 열림'); await drain(T);
  T.useR('npc_caster', '숯을'); ok(T.btn('거푸집에')?.disabled && T.btn('동검을')?.disabled && T.btn('거울을 받아')?.disabled, '농민 남자 — 쇳물·동검·거울 회색'); const h1 = g.life.values.heart; T.pick('숯을'); await drain(T);
  ok(T.done('casting') && g.flags.has('casting:coal') && g.life.values.heart === h1 + 1 && shown.mold_1 !== true, '숯을 나름(🤝+1, 거울은 안 보임)');
  ok(['casting', 'clear', 'work'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
}

// ---- 2판: 군장 곁 여자(곡식 3) — 동검 맡기기(🌾-2)·거울 열림 / 흙 지기·빠지기 회색 → 종 보내기 / 말뚝(🌾+2 🤝-2)
{
  const T = mkGame('f', { craft: 2, heart: 3, grain: 3, branch: 'chief', status: 'rich' }); const { g } = T;
  ok(g.life.status === 'noble', '군장 곁의 집');
  g.flags.add('sit:iron:done'); g.flags.add('sit:court:done');
  T.goTo('casting'); await drain(T); T.useR('npc_caster', '동검을'); ok(T.btn('거푸집에')?.disabled, '군장 곁 — 쇳물 회색'); ok(!T.btn('거울을 받아').disabled && !T.btn('동검을').disabled, '여자 — 거울 열림 · 군장 곁 — 동검 열림');
  T.pick('동검을'); await drain(T); ok(T.done('casting') && g.flags.has('casting:order') && g.life.values.grain === 1, '동검을 맡김(🌾-2)');
  T.goTo('work'); await drain(T); T.useR('npc_builder', '종을 대신'); ok(T.btn('흙을 지고')?.disabled && T.btn('빠진다')?.disabled, '군장 곁 — 흙 지기·빠지기 회색'); T.pick('종을 대신'); await drain(T);
  ok(T.done('work') && g.flags.has('work:send'), '종을 대신 보냄');
  T.goTo('clear'); await drain(T); T.useR('rootpile_1', '말뚝을'); const g0 = g.life.values.grain, h0 = g.life.values.heart; T.pick('말뚝을'); await drain(T);
  ok(T.done('clear') && g.flags.has('clear:stake') && g.life.values.grain === g0 + 2 && g.life.values.heart === h0 - 2, '말뚝을 박음(🌾+2 🤝-2)');
}

// ---- 3판: 종 남자 — 쇠 괭이·돌 괭이 회색 → 주인 몫 / 빠지기 회색 → 주인 대신 / 4판: 쇠 집 — 쇳물 → 거울 보임(✋+2)
{
  const T = mkGame('m', { craft: 0, heart: 0, grain: 0, branch: 'slave', status: 'poor' }); const { g, shown } = T;
  ok(g.life.status === 'slave', '종의 집');
  g.flags.add('sit:iron:done'); g.flags.add('sit:court:done');
  T.goTo('clear'); await drain(T); T.useR('npc_clearer', '주인 몫'); ok(T.btn('쇠 괭이로')?.disabled && T.btn('돌 괭이로')?.disabled, '종 — 쇠 괭이·돌 괭이 회색'); const h0 = g.life.values.heart; T.pick('주인 몫'); await drain(T);
  ok(T.done('clear') && g.flags.has('clear:forslave') && g.life.values.heart === h0 + 1 && shown.newfield_1 === true, '주인 몫으로 갈음(🤝+1, 밭은 보이되 주인 것)');
  T.goTo('work'); await drain(T); T.useR('npc_builder', '주인 대신'); ok(T.btn('빠진다')?.disabled && T.btn('종을 대신')?.disabled && T.btn('달구')?.disabled, '종 — 빠지기·종 보내기·공이 회색'); T.pick('주인 대신'); await drain(T); ok(T.done('work') && g.flags.has('work:forslave') && shown.rampartwork_1 === true, '주인 대신 와서 다짐(새 토성 보임)');
  const U = mkGame('m', { craft: 5, heart: 1, grain: 1, branch: 'smith', status: 'poor' }); ok(U.g.life.status === 'smith', '쇠 다루는 집');
  U.g.flags.add('sit:court:done'); U.goTo('casting'); await drain(U); U.useR('mold_1', '거푸집에'); const c0 = U.g.life.values.craft; U.pick('거푸집에'); await drain(U);
  ok(U.done('casting') && U.g.flags.has('casting:pour') && U.g.life.values.craft === c0 + 2 && U.shown.mold_1 === true, '쇳물을 부어 거울(✋+2, mirror_bronze 보임)');
  U.use('mold_1'); ok(!U.btn('거푸집에') && U.S.says.some((s) => s.includes('식는다')), '부은 뒤엔 「거울이 식는다」 살펴보기');
  // 굴림 실패: 농민이 부역에서 빠지다 잡힘 → work:caught(🤝-2 🌾-1), 상황은 끝남
  const V = mkGame('m', { craft: 0, heart: 2, grain: 1, branch: 'poor', status: 'poor' }); V.g.flags.add('sit:court:done'); Math.random = () => 0.99;
  V.goTo('work'); await drain(V); V.useR('corveelist_1', '빠진다'); V.pick('빠진다'); await drain(V);
  ok(V.done('work') && V.g.flags.has('work:caught') && !V.g.flags.has('work:skip') && V.g.life.values.heart === 0 && V.g.life.values.grain === 0, '빠지다 잡힘 → work:caught(🤝-2 🌾-1), 상황은 끝남');
  Math.random = () => 0.01;
}
console.log(`gojoseon 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
