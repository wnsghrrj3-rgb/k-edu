// 인생 층(life) 고리 시험 — WebGL 없이 game.js + story.js + life.js 규칙만. 태어남 → 7 상황 → 끝 카드, 섞여 나오는 상황도 강제로 켜서 본다.
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
['fire_1', 'npc_fire', 'npc_stone', 'stone_1', 'stone_2', 'stone_3', 'stone_4', 'bush_1', 'bush_2', 'fish_1', 'npc_food', 'deer_1', 'deer_2', 'npc_hunt', 'track_1', 'cave_1', 'shelter_1', 'flint_1', 'view_1', 'npc_other1'].forEach(mk);
const areas = new Map(Object.entries({ camp: [0, 20], river: [0, 6], berry: [40, -6], meadow: [12, -46], deep: [66, -58], shelter: [-40, 16], cave: [-72, 8], flint: [-78, -78], ford: [44, 36], ford_n: [44, 44], hill: [62, 80], other: [-30, 74] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = (on, small) => { g._fire = on ? (small ? 'small' : 'lit') : 'off'; };
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' };   // 손 좋은 여자아이
g.life.seed = 7; g.life.mixed = ['newberry', 'broken', 'meet', 'far', 'mate_hurt'];   // 이번 판 섞여 나오는 5
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;   // 굴림은 항상 성공(실패 갈래는 따로 강제)

// 태어남 뒤: 능력 단계가 표에서 왔는지, 곡식 잠김
ok(g.life.abil['손'] === 3 && g.life.abil['발'] === 1, '능력 단계 = characters.levels');
ok(g.life.situations.length === 12, '이번 판 상황 7 + 5 = 12');
// 상황 1 배고픔 — 막집에서 열린다
goTo('camp'); ok(opened('hunger') && panel && panel.h.includes('배가 고프다'), '배고픔 상황 카드'); closeCard();
g.updateMission(true); ok(g._mission.includes('배가 고프다'), '미션 1');
// 섞여: 열매 숲에 가면 「처음 보는 까만 열매」
goTo('berry'); ok(opened('newberry'), '섞여 나오는 상황: 까만 열매'); closeCard();
use('dbush_1'); ok(panel && panel.b.length === 2, '까만 덤불 선택 2'); pick('먹어 본다'); ok(g.flags.has('berry:eyed'), '눈이 밝아 알아봄(굴림 성공)');
await settle(); ok(done('newberry') && panel && panel.h.includes('눈이 알아봤다'), '결과 카드 — 눈이 알아봤다'); closeCard();
// 열매 셋 → 배고픔 상황 해결(채집)
use('bush_1'); use('bush_1'); use('bush_1'); ok(g.count('berry') === 3, '열매 셋');
ok(done('hunger') && g.flags.has('sit:hunger:gather'), '배고픔 → 채집으로 해결'); ok(panel && panel.h.includes('열매를 땄다') && panel.h.includes('📜'), '결과 카드 + 역사 사실'); closeCard();
ok(g.life.abil['눈'] >= 2, '눈이 올랐다(하면 오른다)');
// 상황 2 돌 — 만들기
goTo('river'); ok(opened('stone'), '돌 상황'); closeCard();
use('npc_stone'); ok(panel && panel.b.length === 2, '돌 깨는 사람 선택 2'); pick('내가 해 본다');
use('stone_1'); use('stone_2'); g.craft('handaxe'); ok(g.has('handaxe') && g.flags.has('made:handaxe'), '주먹도끼 만듦');
ok(done('stone') && g.life.values.craft === 1, '돌 상황 → 만들었다, 솜씨 1'); closeCard();
// 밤이 온다(사건) → 불 상황
await settle(60); ok(g.flags.has('night:1'), '해가 진다 → night:1'); ok(opened('fire'), '불 상황 카드'); closeCard();
ok(g._fire === 'small', '작은 불씨');
// 잔다 → 불 꺼짐(나쁜 결과) — 그 뒤 위험층이 쓰러뜨리고 상황 앞으로(여기선 afterCollapse 직접)
use('bed_1'); ok(g.flags.has('fire:slept'), '눕는다 → 잔다'); ok(done('fire') && panel && panel.h.includes('안 됐다') && panel.h.includes('왜?'), '나쁜 결과 카드 + 왜'); closeCard(); await settle(60);
ok(g._fire === 'off', '불이 꺼졌다');
g.flags.clear(); for (const f of g.checkpoint.flags) g.flags.add(f); g.life.afterCollapse('night');
ok(!done('fire') && opened('fire') && g._fire === 'small', '쓰러진 뒤: 불 상황 앞으로, 불씨 다시');
// 지킨다
use('stick_1'); ok(g.has('branch'), '마른 가지'); use('fire_1'); ok(g.flags.has('fire:kept') && g._fire === 'lit', '가지 넣어 불 지킴');
ok(done('fire') && g.life.values.craft === 2, '불 상황 해결, 솜씨 2'); closeCard();
await settle(80); ok(g.flags.has('day:2'), '아침 → day:2');
// 상황 4 큰 짐승 — 창 만들고 앞에서 몬다
use('stick_2'); g.craft('spear'); ok(g.has('spear') && g.has('handaxe'), '창(주먹도끼는 남음)');
goTo('meadow'); ok(opened('hunt'), '큰 짐승 상황'); closeCard();
use('npc_hunt'); ok(panel && panel.b.length === 3, '앞/뒤/작은 것');
Math.random = () => 0.99;   // 앞자리 굴림 실패 → 다친다
pick('앞에서'); ok(!g.flags.has('hunt:done') && g.life.hurt.has('leg'), '굴림 실패 → 절뚝이는 다리, 사냥은 아직'); ok(says.some((s) => s.includes('왜?')), '「왜」 한 줄');
ok(g.life.speedMul < 1, '절뚝 → 느려짐');
use('npc_hunt'); ok(panel.b[0].disabled && panel.b[0].reason.includes('절뚝'), '앞자리 회색 + 이유');
Math.random = () => 0.01; pick('뒤에서'); ok(g.flags.has('hunt:back') && g.count('meat') === 1, '뒤에서 지킴, 고기 1');
ok(done('hunt') && panel && panel.h.includes('뒤에서 지켰다'), '사냥 결과'); closeCard(); await settle();
ok(g.story.movers.length >= 1, '사슴 달아남');
ok(opened('share'), '고기 상황 열림'); closeCard();
ok(!opened('mate_hurt'), '내가 다쳤으면 「옆 사람 다침」은 안 나옴'); await settle(); ok(opened('broken') && panel && panel.h.includes('도구가 깨졌다'), '도구가 깨졌다(만든 사람만)'); closeCard();
ok(!g.has('handaxe') && g.has('shard'), '주먹도끼 → 조각');
use('npc_stone'); ok(panel.b[0].label.includes('빌린다') && !panel.b[0].disabled, '안 빌린 사람은 빌릴 수 있음'); pick('내가 만든다');
use('stone_3'); g.craft('scraper'); ok(g.has('scraper') && done('broken'), '조각 → 긁개'); closeCard();
// 상황 5 나누기
goTo('camp'); use('npc_fire'); ok(panel && panel.b.length === 2, '나누기 선택 2(다친 사람 없으니)'); pick('똑같이'); ok(done('share') && g.life.values.heart === 2, '똑같이 나눔 → 인심 2'); closeCard();
await settle(120); ok(g.flags.has('rain:on'), '둘째 밤 → 비'); ok(opened('rain'), '큰비 상황'); closeCard();
// 바위 그늘로
ok(g.promptFor(ix.get('shelter_1')).verb.includes('비를 피한다'), '바위 그늘 이름 바뀜'); use('shelter_1'); ok(done('rain') && g.flags.has('sit:rain:shelter'), '바위 그늘'); closeCard();
await settle(80); ok(g.flags.has('gone:1') && opened('gone'), '비 갬 → 사냥감 사라짐'); closeCard();
// 남는다(되돌아옴) → 떠난다(끝)
use('npc_hunt'); pick('남아서'); ok(panel && panel.h.includes('안 됐다'), '남으면 쓰러진다'); closeCard(); await settle(60);
ok(!done('gone') && !g.flags.has('leave:stay'), '상황 앞으로 되돌아옴');
use('npc_hunt'); pick('무리와'); closeCard(); await settle();
ok(g.flags.has('life:end') && g.flags.has('life:left'), '끝: 다쳤고 인심 2 → 뒤처짐'); ok(panels.at(-1).includes('뒤처졌다') && panels.at(-1).includes('솜씨'), '끝 카드에 값·흔적');
// 저장 왕복
const snap = g.life.snapshot(); const l2 = new Life(g, J('life')); l2.restore(snap); ok(l2.values.heart === 2 && l2.hurt.has('leg') && l2.mixed.length === 5, '저장·복원');
// 다른 씨앗이면 섞여 나오는 것이 다르다
const a = g.life.pickMixed(1).join(), b = g.life.pickMixed(99).join(); ok(a !== b, '씨앗 다르면 섞임 다름');
console.log(`life 고리: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
