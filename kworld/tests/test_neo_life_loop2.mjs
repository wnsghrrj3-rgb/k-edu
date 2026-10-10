// 신석기 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(무덤 터·떠돌이 야영지·바다 어귀·갈대섬·불 놓은 숲·옛 움집 터·칡 비탈)의 상황 일곱을 강제로 켜서 한 판. WebGL 없이 규칙만.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:life': JSON.stringify({ craft: 2, heart: 2, grain: 0 }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; let panel = null; const panels = [];
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
['fire_1', 'slab_1', 'pit_1', 'hutsite_1', 'npc_elder', 'npc_child', 'npc_fisher', 'npc_farmer', 'npc_potter', 'npc_cutter', 'npc_hunter', 'npc_other', 'npc_drifter', 'npc_spinner', 'stone_1', 'shell_1', 'clam_1', 'clam_2', 'field_1', 'grave_1', 'camp_1', 'bay_1', 'seaboat_1', 'isle_1', 'burn_1', 'oldsite_1', 'kudzu_1'].forEach(mk);
const areas = new Map(Object.entries({ village: [0, 0], shore: [22, 4], field: [-6, -42], clay: [18, 30], reed: [24, -44], woods: [-58, -18], acorn: [-44, 52], low: [16, 66], ford: [28, 36], ford_e: [50, 36], hunt: [76, 62], other: [82, -34], hill: [-70, -80], tomb: [-34, -70], drift: [12, -92], bay: [44, 106], isle: [38, -20], burn: [-22, 86], oldsite: [-36, 8], kudzu: [-84, -44] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' };
g.life.seed = 3; g.life.mixed = ['grave', 'drifters', 'sea', 'tiger', 'slash', 'layers', 'spin'];
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
const btn = (label) => panel?.b.find((x) => x.label.startsWith(label));
Math.random = () => 0.01;
const at = (area, sitId, target, label) => { goTo(area); ok(opened(sitId), `${sitId} 열림(${area})`); closeCard(); use(target); if (!btn(label) && panel?.b.length === 1) { closeCard(); use(target); }   // 꼭 나오는 상황 카드(저장 등)가 먼저 뜨면 닫고 한 번 더
  if (!btn(label)) { console.log('버튼 없음', label, panel?.b.map((x) => x.label)); fail++; return; } pick(label); closeCard(); };
ok(g.life.situations.length === 14, '꼭 7 + 새 장소 7');
ok(g.life.values.craft === 1 && g.life.values.heart === 1, '구석기에서 넘겨받기(절반)');
ok(Object.keys(g.world.areas).length === 20, '구역 20');
// 머묾 전엔 새 상황 안 열림(바다·떠돌이는 sit:stay:done 뒤)
goTo('bay'); ok(!opened('sea'), '머물기 전엔 바다 상황 안 열림');
g.flags.add('sit:stay:done'); g.life.onFlag();
at('bay', 'sea', 'seaboat_1', '노를 저어'); ok(done('sea') && g.flags.has('bay:sea') && g.count('fish') === 3, '바다 어귀 — 어귀 밖으로, 큰 고기 셋');
goTo('drift'); ok(opened('drifters'), '떠돌이 상황'); closeCard(); use('npc_drifter'); pick('여기 머물라고'); closeCard(); ok(done('drifters') && g.flags.has('drift:stay'), '떠돌이 — 머물라고 권함');
goTo('tomb'); ok(!opened('grave'), '갈기 전엔 무덤 상황 안 열림');
g.flags.add('sit:grind:done'); g.life.onFlag();
goTo('tomb'); ok(opened('grave'), '무덤 상황'); closeCard(); use('grave_1'); ok(btn('내 간돌도끼'), '묻기 버튼'); pick('내 간돌도끼'); ok(says.some((s) => s.includes('묻을 도끼가 없다')), '도끼 없으면 못 묻음'); closeCard();
g.inventory.push('axe'); use('grave_1'); pick('내 간돌도끼'); closeCard(); ok(done('grave') && g.flags.has('grave:axe') && g.count('axe') === 0, '무덤 터 — 도끼를 함께 묻음(소모)');
const h0 = g.life.values.heart; ok(h0 >= 3, '묻으니 인심 +2');
at('kudzu', 'spin', 'kudzu_1', '가락바퀴를 돌려'); ok(done('spin') && g.flags.has('spin:self') && g.count('thread') === 1, '칡 비탈 — 실을 자음');
goTo('burn'); ok(!opened('slash'), '심기 전엔 불 놓기 안 열림');
g.flags.add('planted:field'); g.life.onFlag();
at('burn', 'slash', 'burn_1', '바람을 보고'); ok(done('slash') && g.flags.has('burn:fire') && g.life.values.grain === 1, '불 놓은 숲 — 밭 하나 더(🌾+1)');
goTo('oldsite'); ok(!opened('layers'), '홍수 전엔 옛 터 안 열림');
g.flags.add('sit:flood:done'); g.life.onFlag();
at('oldsite', 'layers', 'oldsite_1', '묻힌 갈판'); ok(done('layers') && g.flags.has('old:slab'), '옛 움집 터 — 갈판');
goTo('village'); ok(!opened('tiger'), '집 짓기 전엔 호랑이 밤 안 열림');
g.flags.add('sit:hut:done'); g.life.onFlag();
goTo('village'); ok(opened('tiger'), '호랑이 밤'); closeCard(); use('isle_1'); if (!btn('아이들을') && panel?.b.length === 1) { closeCard(); use('isle_1'); } pick('아이들을 데리고'); closeCard(); ok(done('tiger') && g.flags.has('tiger:isle'), '갈대섬 — 아이들과 숨음');
const J2 = g.world.journal; ok(['grave', 'drifter', 'sea', 'tiger', 'slash', 'layers', 'spindle'].every((k) => J2[k]?.note), '새 기록 일곱');
// 실패 굴림 길: 불 놓기 눈 굴림 실패 → rollFailFlag burn:spread 가 bad 결과 선택지의 done 과 맞는다
const slash = g.life.situations.find((x) => x.id === 'slash'); const burnT = g.items.targets.burn.rename[0].choices[0]; ok(burnT.rollFailFlag === 'burn:spread' && slash.choices.some((c) => c.done === 'burn:spread' && c.bad), '실패 굴림 → 불이 숲으로(bad 결과)');
console.log(`neo 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
