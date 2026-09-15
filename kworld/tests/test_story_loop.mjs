// 이야기형 시대(story-p1) 고리 규칙 시험 — WebGL 없이 game.js + story.js 규칙만
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; let panel = null;
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; }, craftPanel() {}, pickPanel: (r, c, onPick) => { g._pick = onPick; } };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {} } }); };
['stone_1', 'stone_2', 'bush_a1_1', 'bush_a1_2', 'track_1', 'deer_1', 'fire_1', 'npc_elder', 'gate_1', 'stick_1'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map([['camp', new THREE.Vector3(1, 0, 1)]]), groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {} }, onFrame: [], spawn: new THREE.Vector3() };
g.story = new Story(g, J('scene')); g.story.apply();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (i) => { const b = panel.b[i]; panel = null; b.onClick(); };
const vis = (name) => ix.get(name) && ix.get(name).obj.visible !== false && !ix.get(name).disabled;

// 장면 층: GLB 대상 빼고 절차 소품 들어감
ok(!ix.has('npc_elder') && !ix.has('gate_1') && !ix.has('stone_1') && !ix.has('stone_2'), 'GLB 대상 제거');
ok(ix.has('stone_r1') && ix.has('dbush_1') && ix.has('root_1') && ix.has('npc_hana') && ix.has('npc_maru'), '소품·사람 배치');
ok(ix.get('deer_1').kind === 'big' && !vis('deer_1'), '사슴은 채집 전엔 안 보임');
ok(!vis('npc_aru') && !vis('track_1') && !vis('herd_1'), '아루·흔적·무리 숨김');
ok(g.e.spawn.x === -4 && g.e.spawn.z === -12, '시작점 강가');
g.updateMission(true); ok(g._mission.includes('배가 고프다'), '첫 미션');
// ACT 1 — 검은 열매 먹어 보기(실패 경험) → 하나
use('dbush_1'); ok(panel && panel.b.length === 3, '열매 선택 3'); const h0 = g.hunger; pick(0); ok(g.hunger < h0 && g.flags.has('berry:bad'), '검은 열매: 배 줄고 berry:bad');
g.tick(0.01); ok(g._mission.includes('사람에게 묻기'), '미션 2');
use('root_1'); ok(says.at(-1).includes('잘 모르겠다') && ix.has('root_1'), '하나 전엔 뿌리 못 캠');
use('bush_a1_1'); ok(panel && panel.b.length === 3, '빨간 열매도 선택형'); pick(2); ok(g.has('berry'), '가져간다');
use('npc_hana'); ok(says.at(-1).includes('먹었구나'), '하나: 먹은 뒤 대사'); ok(g.flags.has('talk:hana'), 'talk:hana');
ok(g.promptFor(ix.get('dbush_2')).verb === '그냥 두기', '검은 덤불 이름 바뀜'); use('dbush_2'); ok(says.at(-1).includes('먹지 않는 게 좋아'), '검은 열매 안 먹음');
use('bush_a1_2'); ok(!panel && g.count('berry') === 2, '하나 뒤 빨간 열매는 바로 따기');
use('root_1'); ok(g.has('root') && !ix.has('root_1'), '뿌리 캠');
await new Promise((r) => setTimeout(r, 1400)); ok(g.flags.has('journal:gather'), '📔 채집'); g.tick(0.01); ok(g._mission.includes('사슴'), '미션 4');
ok(vis('deer_1'), '채집 뒤 사슴 보임');
// ACT 2 — 쫓아가면 놓친다 → 아루
const h1 = g.hunger; use('deer_1'); ok(g.flags.has('deer:lost') && g.hunger < h1 && g.story.movers.length === 1, '사슴 달아남');
g.story.tick(3.5); ok(!ix.has('deer_1'), '사슴 사라짐'); ok(vis('npc_aru') && !vis('npc_aru2'), '아루 나타남');
use('npc_aru'); ok(says.at(-1).includes('지나간 곳을 봐'), '아루 대사'); ok(vis('track_1') && !vis('track_2'), '발자국 하나만');
// ACT 3 — 흔적 잇기, 갈림길
use('track_1'); ok(g.flags.has('seen:step') && vis('track_2'), '발자국→배설물');
use('track_2'); ok(vis('track_3') && vis('track_6') && !vis('track_4'), '배설물→가지+오래된 발자국');
use('track_6'); ok(says.at(-1).includes('오래된'), '오래된 발자국은 막다른 길');
use('track_3'); ok(panel && panel.b.length === 2, '갈림길 선택'); pick(1); ok(!g.flags.has('seen:branch') && says.at(-1).includes('다시 가지'), '틀린 쪽');
use('track_3'); pick(0); ok(g.flags.has('seen:branch') && vis('track_4'), '맞는 쪽 → 눌린 풀');
use('track_4'); use('track_5'); ok(g.flags.has('seen:fur'), '털'); await new Promise((r) => setTimeout(r, 1400)); ok(g.flags.has('journal:tracking'), '📔 흔적 읽기');
ok(vis('herd_1') && vis('npc_aru2') && !vis('npc_aru'), '무리·아루2 보임, 아루1 숨김');
use('npc_maru'); ok(says.at(-1).includes('탁'), '마루는 아직 말 안 함'); ok(!g.flags.has('maru:shown'), 'maru:shown 아직');
use('herd_1'); ok(g.flags.has('herd:seen') && says.at(-1).includes('잡을 방법'), '무리: 잡을 방법 없음');
use('npc_aru2'); ok(says.at(-1).includes('마루'), '아루2: 마루로');
// ACT 4 — 돌 고르기
use('npc_maru'); ok(g.flags.has('maru:shown'), '마루 안내');
for (const s of ['stone_r1', 'stone_r2', 'stone_s1', 'stone_h1', 'stone_f1', 'stone_f2']) use(s);
ok(g.count('stone_round') === 2 && g.has('stone_flint'), '돌 종류별 줍기');
g.craft('flake'); ok(typeof g._pick === 'function', '고르기 판');
g._pick(['stone_round', 'stone_round']); ok(!g.has('flake') && g.count('stone_round') === 2 && says.at(-1).includes('둥근'), '둥근+둥근 실패, 안 없어짐');
g.craft('flake'); g._pick(['stone_soft', 'stone_hard']); ok(!g.has('stone_soft') && g.has('stone_hard') && says.at(-1).includes('무르다'), '무른 돌은 부서짐');
g.craft('flake'); g._pick(['stone_flint', 'stone_flint']); ok(g.count('stone_flint') === 1 && says.at(-1).includes('조각'), '각진+각진: 하나 깨짐');
g.craft('flake'); g._pick(['stone_hard', 'stone_flint']); ok(g.has('flake') && !g.has('stone_hard') && !g.has('stone_flint') && g.flags.has('made:flake'), '검은+각진 = 날 선 돌');
await new Promise((r) => setTimeout(r, 1600)); ok(g.flags.has('journal:flake'), '📔 뗀석기');
g.tick(0.01); ok(g._mission.includes('완주'), '미션 끝');
await new Promise((r) => setTimeout(r, 2000)); ok(panel && panel.h.includes('프로토타입'), '끝 화면');
ok(g.story.journalHtml().includes('채집') && g.story.journalHtml().includes('뗀석기'), '탐험일지 3편');
console.log(`story-p1 loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
