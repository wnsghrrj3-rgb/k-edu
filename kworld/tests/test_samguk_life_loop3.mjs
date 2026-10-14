// 삼국·가야 인생 층 고리 시험 3 — 10-14 넓히기 2: 새 장소 셋(저수지 둑·금 공방·말 목장)의 섞여 상황 셋을 강제로 켜서 네 판(백제 평민 남자 / 신라 귀족 여자 / 가야 노비 남자 / 장인·촌주) + 굴림 실패. 신분·성별 회색, 솜씨 4 길, 숨김 재질 보임(물·금관·말갑옷), 둑 부역 빠지다 잡힘을 본다. WebGL 없이 규칙만.
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
const IX = ['fire_1', 'anvil_1', 'ingot_1', 'granary_1', 'granary_2', 'fortgranary_1', 'slavehut_1', 'loom_1', 'decree_1', 'stall_1', 'saltstall_1', 'fortgate_1', 'wall_1', 'drum_1', 'spearrack_1', 'buddha_1', 'offering_1', 'bigpaddy_1', 'smallpaddy_1', 'lordfield_1', 'target_1', 'bowrack_1', 'pit_1', 'mound_1', 'hollow_1', 'stele_1', 'foecamp_1', 'pass_1', 'stone_1', 'fish_1', 'ironstall_1', 'ship_1', 'log_1',
  'tally_1', 'clothrack_1', 'ironkiln_1', 'ingotpile_1', 'books_1', 'shrine_1', 'shrinedrum_1', 'cave_1', 'rebuild_1', 'beacon_1', 'dam_1', 'sluice_1', 'basket_1', 'crownbench_1', 'goldheap_1', 'horsearmor_1', 'hay_1',
  'npc_lord', 'npc_elder', 'npc_soldier', 'npc_monk', 'npc_smith', 'npc_farmer', 'npc_weaver', 'npc_overseer', 'npc_slave', 'npc_trader', 'npc_sailor', 'npc_hwarang', 'npc_mourner', 'npc_rebel', 'npc_borderguard', 'npc_villagechief', 'npc_ironmaster', 'npc_teacher', 'npc_shrinekeeper', 'npc_rebuilder', 'npc_beaconman', 'npc_dambuilder', 'npc_goldsmith', 'npc_horseman'];
const AREAS = { village: [0, 0], market: [0, 17], forge: [21, 5], fortress: [0, -46], temple: [-54, -22], paddy: [-52, 32], archery: [44, 44], tomb: [62, -30], shore: [12, -62], ford: [10, -69], border: [8, -106], woods: [78, -76], pass: [-94, 86], hamlet: [-34, 70], ironworks: [40, 78], school: [-38, 4], shrine: [-70, -56], cave: [-104, 26], burnt: [-8, 64], beacon: [86, 22], reservoir: [-88, -2], goldsmith: [36, -22], pasture: [60, 6] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:gojoseon-life'] = JSON.stringify(carry); const mixed = ['reservoir', 'goldsmith', 'pasture'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { dam_1: 'pond_water', crownbench_1: 'crown_gold', horsearmor_1: 'horse_armor' };
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
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const drain = async (T) => { for (let i = 0; i < 3; i++) { T.closeCard(); await settle(); } };

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  for (const id of ['reservoir', 'goldsmith', 'pasture']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 6 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name, `${id} 장소 ${s.place} 이름`);
    const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
    ok(s.choices.every((c) => setters.includes(`"${c.done}"`)), `${id} done 깃발이 NPC/대상에서 세워짐`);
  }
  ok(life.situations.filter((x) => !x.must).length === 21 && life.mixedCount === 6, '섞여 21 · 판마다 6');
  ok(['dam', 'crownbench', 'horsearmor'].every((t) => items.targets[t].hidden?.length === 1), '숨김 재질 셋(물·금관·말갑옷)');
  ok(world.scenery.grass.avoid.some((a) => a[0] === 60 && a[1] === 6), '말 목장 풀 피하기(엔진 좌표)');
  const st = (n) => npcs[n].lines[0].choices.filter((c) => c.if && c.gray).length;
  ok(st('dambuilder') === 6 && st('goldsmith') === 5 && st('horseman') === 4, '신분·성별 회색 — 둑 6·금 5·목장 4');
  ok(JSON.stringify(npcs.dambuilder).includes('sex:f') && JSON.stringify(npcs.horseman).includes('sex:m'), '밥은 여자 · 싸움말은 남자 — 성별 회색');
  ok(JSON.stringify(npcs.goldsmith).includes('val:craft>=4'), '솜씨 넷이면 장인 아니어도 금을 두드린다');
}

// ---- 1판: 백제 평민 남자(곡식 0·솜씨 1) — 둑: 흙 지기(🌾+1 🤝+2, 물 보임) / 공방: 금 두드리기 회색·풀무 / 목장: 싸움말(발)
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 0, branch: 'stay', status: 'poor' }); const { g, shown } = T;
  ok(g.life.status === 'farmer' && g.flags.has('nation:baekje'), '백제 평민');
  ok(g.life.situations.length === 10, '꼭 7 + 새 장소 3');
  T.goTo('reservoir'); ok(!T.opened('reservoir'), '성 쌓기 전엔 둑 안 열림'); T.goTo('goldsmith'); ok(!T.opened('goldsmith'), '절 전엔 공방 안 열림'); T.goTo('pasture'); ok(!T.opened('pasture'), '덩이쇠 전엔 목장 안 열림');
  g.flags.add('sit:corvee:done');
  T.goTo('reservoir'); ok(T.opened('reservoir'), '둑 — 둑을 쌓는다 열림'); await drain(T);
  T.useR('npc_dambuilder', '흙을 지고'); ok(T.btn('사람을')?.disabled && T.btn('물 댈')?.disabled && T.btn('주인 몫')?.disabled && T.btn('밥을')?.disabled, '평민 남자 — 사람 보내기·차례·주인 몫·밥 회색'); ok(!T.btn('빠진다').disabled, '평민 — 빠지는 길 열림');
  const g0 = g.life.values.grain, h0 = g.life.values.heart; T.pick('흙을 지고'); await drain(T);
  ok(T.done('reservoir') && g.flags.has('reservoir:carry') && g.life.values.grain === g0 + 1 && g.life.values.heart === h0 + 2 && shown.dam_1 === true, '흙을 지고 다짐(🌾+1 🤝+2, pond_water 보임)');
  T.use('dam_1'); ok(!T.btn('흙을 지고') && T.S.says.some((s) => s.includes('물이 찼다')), '끝난 뒤엔 「둑 — 물이 찼다」 살펴보기');
  g.flags.add('sit:temple:done'); g.flags.add('sit:iron:done'); await drain(T);
  T.goTo('goldsmith'); ok(T.opened('goldsmith'), '공방 — 금관을 두드린다 열림'); await drain(T);
  T.useR('npc_goldsmith', '풀무를'); ok(T.btn('금을 두드려')?.disabled && T.btn('관을 맞춘다')?.disabled && T.btn('금귀걸이')?.disabled, '평민(솜씨 1) — 두드리기·관·귀걸이 회색'); const h1 = g.life.values.heart; T.pick('풀무를'); await drain(T);
  ok(T.done('goldsmith') && g.flags.has('goldsmith:bellows') && g.life.values.heart === h1 + 1 && shown.crownbench_1 !== true, '풀무를 밈(🤝+1, 금관은 안 보임)');
  T.goTo('pasture'); ok(T.opened('pasture'), '목장 — 싸움말 열림'); await drain(T);
  T.useR('npc_horseman', '싸움말'); ok(T.btn('말갑옷')?.disabled && T.btn('말 한 필')?.disabled && T.btn('말을 끈다')?.disabled && !T.btn('싸움말').disabled, '평민 남자 — 갑옷·내 말·끌기 회색, 싸움말 열림');
  T.pick('싸움말'); await drain(T); ok(T.done('pasture') && g.flags.has('pasture:ride') && shown.horsearmor_1 !== true, '싸움말을 몲(갑옷은 안 보임)');
  ok(['reservoir', 'goldsmith', 'pasture'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
}

// ---- 2판: 백제 귀족 여자(곡식 4) — 둑: 흙·빠지기 회색 → 사람 보내기(🌾+2 🤝-1) / 공방: 귀걸이 열림·관 맞추기(🌾-3) / 목장: 싸움말 회색(여자) → 말 한 필(🌾-2)
{
  const T = mkGame('f', { craft: 2, heart: 3, grain: 4, branch: 'lord_stay', status: 'noble' }); const { g, shown } = T;
  ok(g.life.status === 'noble' && g.flags.has('nation:baekje'), '백제 귀족 여자');
  g.flags.add('sit:corvee:done'); g.flags.add('sit:temple:done'); g.flags.add('sit:iron:done');
  T.goTo('reservoir'); await drain(T); T.useR('npc_dambuilder', '사람을'); ok(T.btn('흙을 지고')?.disabled && T.btn('빠진다')?.disabled && !T.btn('밥을').disabled, '귀족 — 흙·빠지기 회색, 밥(여자) 열림');
  const g0 = g.life.values.grain; T.pick('사람을'); await drain(T); ok(T.done('reservoir') && g.flags.has('reservoir:send') && g.life.values.grain === g0 + 2 && shown.dam_1 === true, '사람을 보냄(🌾+2, 물 보임)');
  T.goTo('goldsmith'); await drain(T); T.useR('npc_goldsmith', '관을 맞춘다'); ok(!T.btn('금귀걸이').disabled && T.btn('풀무를')?.disabled && T.btn('금 가루')?.disabled, '귀족 여자 — 귀걸이 열림, 풀무·가루 회색');
  const g1 = g.life.values.grain; T.pick('관을 맞춘다'); await drain(T); ok(T.done('goldsmith') && g.flags.has('goldsmith:order') && g.life.values.grain === g1 - 3 && shown.crownbench_1 === true, '관을 맞춤(🌾-3, crown_gold 보임)');
  T.use('crownbench_1'); ok(!T.btn('관을 맞춘다') && T.S.says.some((s) => s.includes('出자')), '끝난 뒤엔 「금관」 살펴보기');
  T.goTo('pasture'); await drain(T); T.useR('npc_horseman', '말 한 필'); ok(T.btn('싸움말')?.disabled && T.btn('말을 끈다')?.disabled && !T.btn('꼴을').disabled, '여자 귀족 — 싸움말·끌기 회색, 꼴 열림');
  const g2 = g.life.values.grain; T.pick('말 한 필'); await drain(T); ok(T.done('pasture') && g.flags.has('pasture:own') && g.life.values.grain === g2 - 2, '말 한 필(🌾-2)');
}

// ---- 3판: 가야 노비 남자 — 둑: 주인 몫(물 보임)·빠지기 회색 / 목장: 싸움말 회색(노비) → 말을 끈다 / 4판: 장인 — 금 두드리기(✋+3, 금관 보임)·말갑옷(✋+2, 갑옷 보임) / 촌주 — 수문에서 차례 / 굴림 실패 — 둑에서 빠지다 잡힘
{
  const T = mkGame('m', { craft: 0, heart: 0, grain: 0, branch: 'enslaved', status: 'slave' }); const { g, shown } = T;
  ok(g.life.status === 'slave', '노비');
  g.flags.add('sit:corvee:done'); g.flags.add('sit:iron:done');
  T.goTo('reservoir'); await drain(T); T.useR('npc_dambuilder', '주인 몫'); ok(T.btn('흙을 지고')?.disabled && T.btn('빠진다')?.disabled && T.btn('사람을')?.disabled, '노비 — 흙(제 몫)·빠지기·사람 보내기 회색'); const h0 = g.life.values.heart; T.pick('주인 몫'); await drain(T);
  ok(T.done('reservoir') && g.flags.has('reservoir:forslave') && g.life.values.heart === h0 + 1 && shown.dam_1 === true, '주인 몫으로 흙을 짐(🤝+1, 물은 보이되 주인 논으로)');
  T.goTo('pasture'); await drain(T); T.useR('npc_horseman', '말을 끈다'); ok(T.btn('싸움말')?.disabled && T.btn('말갑옷')?.disabled, '노비 — 싸움말·갑옷 회색'); T.pick('말을 끈다'); await drain(T); ok(T.done('pasture') && g.flags.has('pasture:lead'), '말을 끎');
  const U = mkGame('m', { craft: 5, heart: 1, grain: 1, branch: 'smith_north', status: 'smith' }); ok(U.g.life.status === 'artisan' && U.g.flags.has('nation:goguryeo'), '고구려 장인');
  U.g.flags.add('sit:temple:done'); U.g.flags.add('sit:iron:done');
  U.goTo('goldsmith'); await drain(U); U.useR('crownbench_1', '금을 두드려'); const c0 = U.g.life.values.craft; U.pick('금을 두드려'); await drain(U);
  ok(U.done('goldsmith') && U.g.flags.has('goldsmith:hammer') && U.g.life.values.craft === c0 + 3 && U.shown.crownbench_1 === true, '금을 두드려 관(✋+3, crown_gold 보임)');
  U.goTo('pasture'); await drain(U); U.useR('horsearmor_1', '말갑옷'); ok(!U.btn('말갑옷').disabled && !U.btn('싸움말').disabled, '장인 남자 — 갑옷·싸움말 둘 다 열림'); U.pick('말갑옷'); await drain(U);
  ok(U.done('pasture') && U.g.flags.has('pasture:armor') && U.shown.horsearmor_1 === true, '말갑옷을 입힘(horse_armor 보임)');
  U.use('horsearmor_1'); ok(!U.btn('말갑옷') && U.S.says.some((s) => s.includes('비늘이 몸을')), '입힌 뒤엔 「말갑옷 입은 말」 살펴보기');
  const V = mkGame('f', { craft: 8, heart: 2, grain: 6, branch: 'farmer', status: 'poor' }); ok(V.g.life.status === 'chief', '촌주(곡식 5 이상)');
  V.g.flags.add('sit:corvee:done'); V.g.flags.add('sit:temple:done'); V.goTo('reservoir'); await drain(V); V.useR('sluice_1', '물 댈'); ok(!V.btn('물 댈').disabled && !V.btn('빠진다')?.disabled, '촌주 — 수문에서 차례 열림·빠지기도 열림'); V.pick('물 댈'); await drain(V);
  ok(V.done('reservoir') && V.g.flags.has('reservoir:order'), '촌주 — 물 댈 차례');
  V.goTo('goldsmith'); await drain(V); V.useR('crownbench_1', '금을 두드려'); ok(!V.btn('금을 두드려').disabled && V.btn('관을 맞춘다')?.disabled, '솜씨 4 촌주 — 장인 아니어도 두드리기 열림, 관 맞추기는 회색');
  // 굴림 실패: 평민이 둑 부역에서 빠지다 잡힘 → reservoir:caught(🤝-2 🌾-1), 상황은 끝남
  const X = mkGame('m', { craft: 0, heart: 2, grain: 1, branch: 'poor', status: 'poor' }); X.g.flags.add('sit:corvee:done'); Math.random = () => 0.99;
  X.goTo('reservoir'); await drain(X); X.useR('sluice_1', '빠진다'); X.pick('빠진다'); await drain(X);
  ok(X.done('reservoir') && X.g.flags.has('reservoir:caught') && !X.g.flags.has('reservoir:skip') && X.g.life.values.heart === 0 && X.g.life.values.grain === 0, '빠지다 잡힘 → reservoir:caught(🤝-2 🌾-1), 상황은 끝남');
  Math.random = () => 0.01;
}
console.log(`samguk 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
