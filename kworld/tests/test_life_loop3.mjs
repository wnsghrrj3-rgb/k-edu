// 인생 층 고리 시험 3 — 10-06 넓히기: 새 장소 여덟(물웅덩이·몰이 골짜기·갈대 습지·바위 틈·모래톱·작은 굴·북쪽 고개·만나는 바위)의 상황 여덟을 강제로 켜서 한 판.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.era = 'life'; g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; let panel = null; const panels = [];
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 20), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
['fire_1', 'npc_fire', 'npc_stone', 'stone_1', 'stone_2', 'stone_3', 'stone_4', 'bush_1', 'bush_2', 'fish_1', 'npc_food', 'deer_1', 'deer_2', 'npc_hunt', 'track_1', 'cave_1', 'shelter_1', 'flint_1', 'view_1', 'npc_other1', 'pool_1', 'gully_1', 'marsh_1', 'hidecrack_1', 'sandbar_1', 'burial_1', 'passn_1', 'trade_1'].forEach(mk);
const areas = new Map(Object.entries({ camp: [0, 20], river: [0, 6], berry: [40, -6], meadow: [12, -46], deep: [66, -58], shelter: [-40, 16], cave: [-72, 8], flint: [-78, -78], ford: [44, 36], ford_n: [44, 44], hill: [62, 80], other: [-30, 74], pool: [83, 4], gully: [-28, -34], marsh: [74, 22], hidecrack: [24, -85], sandbar: [-60, 24.5], burial: [-86, -26], passn: [10, 100], trade: [0, 54] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' };   // 손 좋은 여자아이

g.life.seed = 5; g.life.mixed = ['waterhole', 'drive', 'marsh', 'hidebeast', 'pebble', 'farewell', 'move', 'obsidian'];   // 새 장소 상황 여덟을 강제로
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;
const btn = (label) => panel?.b.find((x) => x.label.startsWith(label));
const at = (area, sitId, target, label) => { goTo(area); ok(opened(sitId), `${sitId} 열림(${area})`); closeCard(); use(target); if (!btn(label)) { console.log('버튼 없음', label, panel?.b.map((x) => x.label)); fail++; return; } pick(label); closeCard(); };
ok(g.life.situations.length === 15, '꼭 7 + 새 장소 8');
goTo('camp'); ok(opened('hunger'), '배고픔'); closeCard();
at('pool', 'waterhole', 'pool_1', '덤불에 숨어'); ok(done('waterhole') && g.flags.has('pool:wait') && g.count('meat') >= 1, '물웅덩이 — 기다려서 잡음');
goTo('gully'); closeCard(); use('gully_1'); ok(btn('무리를 불러')?.disabled, '인심 3 전엔 몰이 회색'); pick('혼자 해 본다'); closeCard(); ok(done('drive') && g.flags.has('gully:alone'), '몰이 골짜기 — 혼자');
at('marsh', 'marsh', 'marsh_1', '진흙에서'); ok(done('marsh') && g.count('root') >= 2, '갈대 습지 — 뿌리');
at('hidecrack', 'hidebeast', 'hidecrack_1', '바위 틈으로'); ok(done('hidebeast') && g.flags.has('crack:in'), '바위 틈 — 숨었다');
at('sandbar', 'pebble', 'sandbar_1', '단단한 큰 자갈'); ok(done('pebble') && g.count('flint') >= 1, '모래톱 — 강자갈 돌감');
at('trade', 'obsidian', 'trade_1', '고기를 놓고'); ok(done('obsidian') && g.flags.has('tr:swap') && g.count('obsidian') === 1, '만나는 바위 — 고기와 흑요석');
goTo('burial'); ok(!opened('farewell'), '나눔 전엔 작은 굴 상황 안 열림');
g.flags.add('sit:share:done'); g.life.onFlag(); at('burial', 'farewell', 'burial_1', '고운 흙을'); ok(done('farewell') && g.flags.has('bur:flower'), '작은 굴 — 꽃');
g.flags.add('sit:gone:open'); g.life.onFlag(); at('passn', 'move', 'passn_1', '막집으로 돌아가'); ok(done('move') && g.flags.has('move:tell'), '북쪽 고개 — 무리에 알림');
const J2 = g.world.journal; ok(['waterhole', 'drive', 'gather', 'hidebeast', 'pebble', 'heungsu', 'move', 'obsidian'].every((k) => J2[k]?.note), '새 기록 여덟');
console.log(`life 고리 3(새 장소 8): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
