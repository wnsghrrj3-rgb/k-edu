// 인생 층 고리 시험 4 — 10-14 넓히기 2: 새 장소 셋(불탄 들·바람막이 바위·뼈 들판)의 섞여 상황 셋을 강제로 켜서 한 판 — 대상 둘씩(불씨/그을린 짐승 · 장작/털가죽 · 뼈 더미/긁개).
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
['fire_1', 'npc_fire', 'npc_stone', 'stone_1', 'stone_2', 'stone_3', 'stone_4', 'bush_1', 'bush_2', 'fish_1', 'npc_food', 'deer_1', 'deer_2', 'npc_hunt', 'track_1', 'cave_1', 'shelter_1', 'flint_1', 'view_1', 'npc_other1', 'pool_1', 'gully_1', 'marsh_1', 'hidecrack_1', 'sandbar_1', 'burial_1', 'passn_1', 'trade_1', 'burnt_1', 'scorched_1', 'windrock_1', 'hides_1', 'bone_1', 'scraper_1'].forEach(mk);
const areas = new Map(Object.entries({ camp: [0, 20], river: [0, 6], berry: [40, -6], meadow: [12, -46], deep: [66, -58], shelter: [-40, 16], cave: [-72, 8], flint: [-78, -78], ford: [44, 36], ford_n: [44, 44], hill: [62, 80], other: [-30, 74], pool: [83, 4], gully: [-28, -34], marsh: [74, 22], hidecrack: [24, -85], sandbar: [-60, 24.5], burial: [-86, -26], passn: [10, 100], trade: [0, 54], burnt: [-10, -82], windrock: [102, 50], bonefield: [52, -101] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' };   // 손 좋은 여자아이

g.life.seed = 5; g.life.mixed = ['wildfire', 'coldwind', 'bonetool'];   // 새 장소 상황 셋을 강제로
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;
const btn = (label) => panel?.b.find((x) => x.label.startsWith(label));
ok(g.life.situations.length === 11, '꼭 8 + 새 장소 3');
for (const id of ['wildfire', 'coldwind', 'bonetool']) { const s = g.life.situations.find((x) => x.id === id); ok(s && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 복습 물음 q 셋·revisit`); ok(s.choices.every((c) => c.fact && c.journal && g.world.journal[c.journal]), `${id} 선택마다 📜 사실·사전`); }
goTo('camp'); ok(opened('hunger'), '배고픔'); closeCard();
// 불탄 들: 불씨 가져오기(손) + 그을린 짐승(고기)
goTo('burnt'); ok(opened('wildfire'), '불탄 들 — 번개 상황 열림'); closeCard();
use('scorched_1'); ok(btn('그을린 고기를'), '그을린 짐승 대상 길'); pick('그을린 고기를'); closeCard(); ok(g.flags.has('burn:meat') && g.count('meat') >= 1 && done('wildfire'), '불탄 들 — 그을린 고기를 거둠');
// 바람막이 바위: 인심 전엔 옮기기 회색, 불만 키움 / 가죽옷 없으면 털가죽 못 겹침
goTo('windrock'); ok(opened('coldwind'), '바람막이 바위 — 찬바람 상황 열림'); closeCard();
use('hides_1'); ok(btn('내 가죽옷에'), '털가죽 대상 길'); pick('내 가죽옷에'); closeCard(); ok(!g.flags.has('cold:hide') && says.some((t) => t.includes('겹칠 가죽옷이 없다')), '가죽옷 없으면 못 겹침');
use('windrock_1'); ok(btn('무리를 바위 밑으로')?.disabled, '인심 2 전엔 옮기기 회색'); pick('막집에 남아'); closeCard(); ok(done('coldwind') && g.flags.has('cold:fire'), '바람막이 바위 — 불만 키움');
// 뼈 들판: 돌 없으면 못 깎음 → 뿔만 / 돌 있으면 뼈 찌르개
goTo('bonefield'); ok(opened('bonetool'), '뼈 들판 — 뼈 연모 상황 열림'); closeCard();
use('bone_1'); pick('긴 뼈를'); closeCard(); ok(!g.flags.has('bone:carve') && says.some((t) => t.includes('긁을 돌이 없다')), '돌 없으면 뼈를 못 깎음');
g.give('flint'); use('bone_1'); pick('긴 뼈를'); closeCard(); ok(done('bonetool') && g.flags.has('bone:carve') && g.count('bonepoint') === 1, '뼈 들판 — 뼈 찌르개');
ok(['fire_get', 'icecold', 'bonetool'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
console.log(`life 고리 4(새 장소 3): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
