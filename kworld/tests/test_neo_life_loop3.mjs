// 신석기 인생 층 고리 시험 3 — 10-14 넓히기 2: 새 장소 셋(새 터·비는 터·벼랑 동굴)의 섞여 상황 셋을 강제로 켜서 한 판 — 새 움집 자리(지붕 숨김→보임)·새 터 사람(곡식 회색)·토우(진흙)·동굴 늙은이·굴 바닥. WebGL 없이 규칙만.
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
['fire_1', 'slab_1', 'pit_1', 'hutsite_1', 'npc_elder', 'npc_child', 'npc_fisher', 'npc_farmer', 'npc_potter', 'npc_cutter', 'npc_hunter', 'npc_other', 'npc_drifter', 'npc_spinner', 'stone_1', 'shell_1', 'clam_1', 'clam_2', 'field_1', 'grave_1', 'camp_1', 'bay_1', 'seaboat_1', 'isle_1', 'burn_1', 'oldsite_1', 'kudzu_1', 'npc_settler', 'npc_prayer', 'npc_cavedweller', 'newhut_1', 'figurine_1', 'mask_1', 'cavehearth_1', 'cavelayer_1'].forEach(mk);
const areas = new Map(Object.entries({ village: [0, 0], shore: [22, 4], field: [-6, -42], clay: [18, 30], reed: [24, -44], woods: [-58, -18], acorn: [-44, 52], low: [16, 66], ford: [28, 36], ford_e: [50, 36], hunt: [76, 62], other: [82, -34], hill: [-70, -80], tomb: [-34, -70], drift: [12, -92], bay: [44, 106], isle: [38, -20], burn: [-22, 86], oldsite: [-36, 8], kudzu: [-84, -44], newsite: [-24, -30], shrine: [64, -74], cliffcave: [-92, 14] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' };
g.life.seed = 7; g.life.mixed = ['split', 'pray', 'cavewinter'];   // 새 장소 상황 셋을 강제로
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
const btn = (label) => panel?.b.find((x) => x.label.startsWith(label));
const shown = []; g.showMats = (t, mats, on) => shown.push([t.name, mats.join(','), on]);
Math.random = () => 0.01;
ok(g.life.situations.length === 10, '꼭 7 + 새 장소 3');
for (const id of ['split', 'pray', 'cavewinter']) { const s = g.life.situations.find((x) => x.id === id); ok(s && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 복습 물음 q 셋·revisit`); ok(s.choices.every((c) => c.fact && c.journal && g.world.journal[c.journal]), `${id} 선택마다 📜 사실·사전`); ok(g.world.areas[s.place], `${id} 장소 ${s.place}`); }
for (const a of ['newsite', 'shrine', 'cliffcave']) ok(g.world.areas[a]?.name, `구역 ${a} 이름`);
// 아직 집도 씨앗도 안 했으면 새 장소에 가도 안 열린다
goTo('newsite'); ok(!opened('split'), '집 짓기 전엔 새 터 상황 안 열림'); goTo('shrine'); ok(!opened('pray'), '씨 묻기 전엔 비는 터 안 열림'); goTo('cliffcave'); ok(!opened('cavewinter'), '집 짓기 전엔 동굴 안 열림');
g.flags.add('sit:seed:done'); g.flags.add('sit:hut:done');
// 새 터: 곡식 0 이면 씨앗 나눔 회색 → 새 터 사람에게 함께 짓기 / 대상에서 지붕 보임
goTo('newsite'); ok(opened('split'), '새 터 — 마을이 좁다 열림'); closeCard();
use('npc_settler'); ok(btn('씨앗을 나눠 준다')?.disabled, '곡식 0 — 씨앗 나눔 회색'); pick('새 움집을 함께'); closeCard(); ok(done('split') && g.flags.has('new:build') && g.life.values.heart >= 2, '새 터 — 함께 지음(🤝+2)');
const settle = () => new Promise((r) => setTimeout(r, 420));
for (let i = 0; i < 4; i++) { closeCard(); await settle(); g.life.t = 1; g.life.tick(0.6); }   // then(show) 은 큐 120ms 뒤에 돈다 — settle 뒤 본다
ok(shown.some((x) => (x[0] === 'ix_newhut_1' || x[0] === 'newhut_1') && x[1] === 'hut_new' && x[2] === true), '새 터 사람에게 골라도 새 움집 지붕(hut_new)이 보인다');
use('newhut_1'); ok(!btn('기둥을'), '지은 뒤엔 새 움집 자리에 더 안 묻는다'); closeCard();
// 비는 터: 진흙 없으면 못 빚음 → 진흙 주면 토우(손) ; 가루 없으면 못 올림
goTo('shrine'); ok(opened('pray'), '비는 터 — 씨를 묻었다 열림'); closeCard();
use('figurine_1'); pick('진흙으로'); closeCard(); ok(!g.flags.has('pray:figurine') && says.some((t) => t.includes('빚을 진흙이 없다')), '진흙 없으면 토우 못 빚음');
use('npc_prayer'); pick('가루 한 줌'); closeCard(); ok(!g.flags.has('pray:flour') && says.some((t) => t.includes('올릴 가루가 없다')), '가루 없으면 못 올림');
g.give('clay'); use('figurine_1'); pick('진흙으로'); closeCard(); ok(done('pray') && g.flags.has('pray:figurine') && g.count('clay') === 0, '비는 터 — 토우를 빚어 올림(진흙 소모)');
// 벼랑 동굴: 굴 바닥 살펴보기(눈) → 늙은이 장작(배)
goTo('cliffcave'); ok(opened('cavewinter'), '벼랑 동굴 — 겨울 열림'); closeCard();
use('cavelayer_1'); ok(btn('옛 자리를'), '굴 바닥 대상 길'); pick('옛 자리를'); closeCard(); ok(done('cavewinter') && g.flags.has('cave:look'), '동굴 — 옛 자리를 살핌');
use('npc_cavedweller'); ok(!btn('여기 동굴에서'), '끝난 뒤엔 늙은이 선택 판 없음'); closeCard();
ok(['growvillage', 'prayer', 'cavelife'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
ok(g.world.danger.safe?.some((s) => s[0] === -92), '동굴 불 곁 밤 안전 자리');
// 둘째 판: 곡식 있으면 씨앗 나눔 열림(🌾-1)
const g2 = { ...g }; g.life.values.grain = 2; g.flags.delete('sit:split:open'); g.flags.delete('sit:split:done'); g.flags.delete('new:build'); g.life.opened.delete('split'); g.life.done.delete('split');
goTo('newsite'); closeCard(); use('npc_settler'); ok(btn('씨앗을 나눠 준다') && !btn('씨앗을 나눠 준다').disabled, '곡식 있으면 씨앗 나눔 열림'); pick('씨앗을 나눠 준다'); closeCard(); ok(g.flags.has('new:seed') && g.life.values.grain === 1 && done('split'), '씨앗 나눔 — 🌾-1');
console.log(`neo 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
