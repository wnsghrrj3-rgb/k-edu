// 신석기 인생 층 고리 시험 — WebGL 없이 game.js + story.js + life.js 규칙만. 태어남(넘겨받기) → 7 상황 → 끝 카드(곡식 칸), 섞여 나오는 상황 강제.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:life': JSON.stringify({ craft: 4, heart: 2, grain: 0 }) };
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
ok(g.era === 'neo', 'era 키 = 폴더 이름');
const says = []; let panel = null; const panels = [];
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
['fire_1', 'slab_1', 'pit_1', 'hutsite_1', 'npc_elder', 'npc_child', 'npc_fisher', 'npc_farmer', 'npc_potter', 'npc_cutter', 'npc_hunter', 'npc_other', 'stone_1', 'stone_2', 'stone_3', 'stone_4', 'shell_1', 'water_1', 'clam_1', 'clam_2', 'clam_3', 'fish_1', 'field_1', 'field_4', 'millet_1', 'millet_2', 'reed_1', 'reed_2', 'clay_1', 'kiln_1', 'log_1', 'log_2', 'log_3', 'log_4', 'acorn_1', 'acorn_2', 'mark_1', 'view_1', 'deer_1', 'obsidian_1'].forEach(mk);
const areas = new Map(Object.entries({ village: [0, 0], shore: [22, 4], field: [-6, 42], clay: [18, -30], reed: [24, 44], woods: [-58, 18], acorn: [-44, -52], low: [16, -66], ford: [28, -36], ford_e: [50, -36], hunt: [76, -62], other: [82, 34], hill: [-70, 80] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'm' };
g.life.seed = 7; g.life.mixed = ['tannin', 'trade', 'nettear', 'child', 'boar'];
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;

ok(g.life.values.craft === 2 && g.life.values.heart === 1, '조상에게서 솜씨·인심 절반 넘어옴(4→2, 2→1)');
ok(g.life.values.grain === 0 && g.life.d.grain.open, '곡식 칸 열림(0)');
ok(g.life.situations.length === 12, '이번 판 상황 7 + 5 = 12');
// 상황 1 머묾
goTo('village'); ok(opened('stay') && panel && panel.h.includes('머물렀다'), '머묾 상황 카드'); closeCard();
goTo('acorn'); use('acorn_1'); use('acorn_2'); ok(g.count('acorn') === 4, '도토리 넷');
ok(done('stay') && g.flags.has('sit:stay:acorn'), '머묾 → 도토리로 해결'); closeCard();
// 상황 2 갈기 → 도토리 가루 → 섞여: 떫다
goTo('village'); ok(opened('grind'), '갈기 상황'); closeCard();
ok(g.promptFor(ix.get('slab_1')).verb.includes('도토리'), '갈판 이름 바뀜'); use('slab_1'); ok(g.flags.has('grind:acorn') && g.count('flour') === 2, '가루 둘');
ok(done('grind') && g.life.values.craft === 3, '갈기 해결, 솜씨 3'); closeCard();
await settle(); ok(opened('tannin'), '섞여: 가루가 쓰다'); closeCard();
goTo('shore'); ok(opened('nettear'), '섞여: 그물 찢어짐'); closeCard(); use('water_1'); ok(g.flags.has('tannin:soak') && done('tannin'), '물에 우렸다'); closeCard();
// 돌괭이(갈판 두 번째 이름)
goTo('village'); use('stone_1'); ok(g.promptFor(ix.get('slab_1')).verb.includes('날'), '갈판 → 돌 갈기'); use('slab_1'); ok(g.has('hoe') && g.flags.has('made:hoe'), '돌괭이');
use('stone_2'); ok(g.promptFor(ix.get('slab_1')).verb.includes('도끼'), '괭이 뒤 → 도끼 갈기'); use('slab_1'); ok(g.has('axe'), '간돌도끼');
// 상황 3 씨앗 — 심는다
goTo('field'); ok(opened('seed'), '씨앗 상황'); closeCard();
use('millet_1'); ok(g.count('seed') === 2, '씨앗 둘'); use('npc_farmer'); ok(panel && panel.b.length === 2, '먹을까 심을까'); pick('심는다');
use('field_1'); ok(ix.get('field_1').state === 'dug', '밭 팜'); use('field_1'); ok(ix.get('field_1').state === 'planted' && g.flags.has('planted:field'), '씨 뿌림');
ok(done('seed') && g.flags.has('sit:seed:plant'), '씨앗 → 심었다'); closeCard();
// 상황 4 그릇 — 빚어서 굽는다
goTo('clay'); ok(opened('pot'), '그릇 상황'); closeCard();
use('clay_1'); goTo('shore'); ok(opened('child'), '섞여: 아이가 빠졌다'); closeCard(); use('npc_fisher'); pick('마을 쪽'); ok(done('child') && g.life.values.heart === 2, '사람 불러 건짐, 인심 2'); closeCard(); use('water_1'); ok(g.has('clay') && g.has('water'), '진흙·물');
g.craft('wetpot'); ok(g.has('wetpot'), '빚은 그릇'); goTo('clay'); use('kiln_1'); ok(g.has('pottery') && g.flags.has('made:pottery'), '구웠다');
ok(done('pot') && g.life.values.craft === 6, '그릇 해결, 솜씨 6(넘겨받은 2 + 갈기 1 + 심기 1 + 그릇 2)'); closeCard();
// 밤 → 상황 5 집 → 짓는다
await settle(60); ok(g.flags.has('night:1') && opened('hut'), '해 진다 → 집 상황'); closeCard();
await settle(); if (opened('boar')) { closeCard(); }
goTo('woods'); use('log_1'); use('log_2'); use('log_3'); ok(g.count('log') === 3, '통나무 셋');
goTo('reed'); use('reed_1'); use('reed_2'); ok(g.count('reed') === 2, '갈대 둘');
goTo('village'); use('hutsite_1'); ok(g.flags.has('built:hut') && ix.get('hutsite_1').state === 'built', '움집 지음');
ok(done('hut') && g.flags.has('sit:hut:build'), '집 상황 → 지었다'); closeCard();
// 멧돼지(섞여) — 내버려 둔다 → 밭 하나 사라짐
ok(opened('boar'), '섞여: 멧돼지'); goTo('field'); use('npc_farmer'); pick('내버려'); ok(done('boar'), '멧돼지 — 내버려 둠'); closeCard(); await settle(); ok(!ix.has('field_4'), '밭 4 사라짐');
// 아침·비 → 상황 6 홍수 — 물 자국 못 봤으니 회색
await settle(200); ok(g.flags.has('flood:on') && opened('flood'), '비 → 홍수 상황'); closeCard();
goTo('village'); use('npc_elder'); ok(panel.b[2].disabled, '낮은 땅 알리기 회색(자국 못 봄)'); pick('높은'); ok(done('flood') && g.flags.has('flood:up'), '높은 언덕'); closeCard();
// 조 익음 → 거둠 → 상황 7 저장
await settle(120); ok(g.flags.has('day:3'), '물 빠짐 → day:3');
ok(opened('store'), '저장 상황(거두기 전에 열림)'); closeCard();
ix.get('field_1').state = 'grown'; use('field_1'); ok(g.count('grain') === 3 && g.flags.has('harvested:field'), '조 셋');
use('pit_1'); ok(g.flags.has('stored:grain') && ix.get('pit_1').state === 'full', '구덩이 채움');
ok(done('store') && g.life.values.grain === 3, '저장 → 곡식 3'); closeCard(); await settle();
ok(g.flags.has('life:end') && g.flags.has('life:full'), '끝: 곡식 3 → 곳간이 찬 집'); ok(panels.at(-1).includes('곳간') && panels.at(-1).includes('🌾 곡식 <b>3'), '끝 카드에 곡식');
const carry = JSON.parse(store['kworld_carry:neo'] || 'null'); ok(carry && carry.grain === 3 && carry.craft === 8, '다음 시대로 넘길 값 저장(집 지어 솜씨 8)');
// 씨앗을 먹으면 빈 구덩이
const g2 = { ...g }; const l2 = new Life(g, J('life')); l2.restore(g.life.snapshot()); ok(l2.values.grain === 3 && l2.carried, '저장·복원(넘겨받기 두 번 안 함)');
console.log(`neo life 고리: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
