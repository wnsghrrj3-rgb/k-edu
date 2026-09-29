// 인생 층 고리 시험 2 — 새 섞여 나오는 상황 7(허탕·죽은 짐승·한파·불씨·짐승이 먼저·가죽·강 넘침)을 강제로 켜서 한 판.
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

g.life.seed = 11; g.life.mixed = ['nohunt', 'carcass', 'cold', 'ember', 'beast', 'hide', 'flood'];   // 이번 판: 새 섞여 나오는 7 을 강제로
g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;

ok(g.life.situations.length === 14, '이번 판 상황 7 + 7 = 14');
ok(ix.has('carcass_1') && ix.has('root_1') && ix.has('bank_1') && ix.has('beast_1') && ix.has('stick_8'), '새 소품이 놓였다');
goTo('camp'); ok(opened('hunger'), '배고픔'); closeCard();
// 며칠째 허탕 — 풀밭에서 열림, 사냥 이끄는 사람 말이 바뀜, 뿌리 둘로 버팀
goTo('meadow'); ok(opened('nohunt') && panel && panel.h.includes('며칠째 허탕'), '허탕 상황 카드'); closeCard();
use('npc_hunt'); ok(panel && panel.b.length === 3 && panel.b[0].label.includes('떠나자'), '허탕: 떠나자/뿌리/더 멀리'); pick('뿌리라도');
use('root_1'); use('root_2'); ok(g.count('root') === 2 && !ix.has('root_1'), '뿌리 둘 캠');
await settle(); ok(done('nohunt') && g.flags.has('sit:nohunt:root'), '뿌리로 버팀 → 허탕 해결'); ok(panel && panel.h.includes('뿌리로 버텼다'), '결과 카드'); closeCard();
ok(g.life.abil['배'] >= 2, '배가 올랐다');
// 죽은 큰 짐승 — 살펴보면 열린다 · 눈 굴림 실패 → 배탈(상황 앞으로) → 가죽만 챙김
use('carcass_1'); ok(g.flags.has('seen:carcass'), '쓰러진 사슴 살펴봄'); await settle(); ok(opened('carcass') && panel && panel.h.includes('죽은 큰 짐승'), '죽은 짐승 상황'); closeCard();
use('carcass_1'); ok(panel && panel.b.length === 3, '먹는다/가죽만/지나친다');
Math.random = () => 0.99; pick('고기를 잘라'); ok(g.life.log.at(-1)?.choice === 'sick' && !g.has('meat'), '눈 굴림 실패 → 배탈, 고기 없음');
await settle(); ok(panel && panel.h.includes('배탈') && panel.h.includes('왜?'), '배탈 카드 + 왜'); closeCard();
ok(!done('carcass') && !g.flags.has('carcass:sick'), '되돌아옴 — 다시 고를 수 있다');
Math.random = () => 0.01; use('carcass_1'); pick('가죽과 뼈만'); ok(g.has('rawhide'), '생가죽'); await settle(); ok(done('carcass') && g.life.values.craft === 1, '가죽만 챙김 → 솜씨 1'); closeCard();
// 배고픔은 열매로
goTo('berry'); use('bush_1'); use('bush_1'); use('bush_1'); ok(done('hunger'), '열매 셋 → 배고픔 해결'); closeCard();
// 돌 만들기 → 밤 → 불 지킴 → 한파 열림(불 자리 가지 둘 더)
goTo('river'); closeCard(); use('npc_stone'); pick('내가 해 본다'); use('stone_1'); use('stone_2'); g.craft('handaxe'); ok(done('stone'), '돌'); closeCard();
await settle(60); ok(g.flags.has('night:1') && opened('fire'), '밤 → 불 상황'); closeCard();
use('stick_1'); use('fire_1'); ok(g.flags.has('fire:kept') && done('fire'), '불 지킴'); closeCard();
await settle(); ok(opened('cold') && panel && panel.h.includes('한파'), '한파 상황(불 지킨 뒤)'); closeCard();
await settle(80); ok(g.flags.has('day:2'), '아침');
// 불씨가 꺼졌다 — 아침에 열림(한파는 아직 열린 채), 다른 무리에게 얻어 와 붙인다
await settle(); ok(opened('ember') && g._fire === 'off' && panel && panel.h.includes('불씨가 꺼졌다'), '불씨 꺼짐 상황 카드 + 불 꺼짐'); closeCard();
ok(g.promptFor(ix.get('fire_1')).verb.includes('비빈다'), '불 자리: 가지를 비빈다(꺼진 동안 한파 「키운다」는 안 보임)');
goTo('other'); use('npc_other1'); ok(panel && panel.b[0].label.includes('불씨'), '다른 무리: 불씨를 받는다'); pick('불씨를'); ok(g.has('torch') && g.flags.has('ember:borrow'), '횃불 받음');
goTo('camp'); ok(g.promptFor(ix.get('fire_1')).verb.includes('횃불로'), '불 자리: 횃불로 붙인다'); use('fire_1'); ok(g._fire === 'lit' && !g.has('torch') && done('ember') && g.life.values.heart === 1, '불 살아남 → 인심 1'); closeCard();
// 한파 — 이제 불을 키울 수 있다(가지 둘)
ok(g.promptFor(ix.get('fire_1')).verb.includes('키운다'), '불 자리: 가지를 더 넣어 키운다');
use('fire_1'); ok(!g.flags.has('cold:fire'), '가지 없이는 안 된다'); use('stick_2'); use('stick_3'); use('fire_1'); ok(g.flags.has('cold:fire') && done('cold'), '가지 둘 → 불 키움 → 한파 해결'); closeCard();
// 짐승이 먼저 와 있다 — 여울 발자국, 물러나서 기다린다
goTo('ford'); use('beast_1'); await settle(); ok(opened('beast') && panel && panel.h.includes('짐승이 먼저'), '짐승이 먼저 상황'); closeCard();
use('beast_1'); ok(panel && panel.b.length === 3, '쫓는다/기다린다/물러난다'); pick('물러나서'); await settle(); ok(done('beast') && g.flags.has('sit:beast:wait'), '기다렸다'); closeCard();
// 강이 넘친다 — 여울 건너, 둔덕으로
goTo('ford_n'); ok(opened('flood') && panel && panel.h.includes('강이 넘친다'), '강 넘침 상황'); closeCard();
ok(g.promptFor(ix.get('bank_1')).verb.includes('뛰어오른다') && g.promptFor(ix.get('bundle_1')).verb.includes('짐부터'), '둔덕·짐 동사');
use('bank_1'); await settle(); ok(done('flood') && g.flags.has('sit:flood:high') && g.life.abil['발'] >= 2, '둔덕 → 발 오름'); closeCard();
// 사냥 → 나누기 → 가죽 한 장(생가죽 하나 더) → 직접 긁어 덮개
use('stick_4'); g.craft('spear'); goTo('meadow'); closeCard(); use('npc_hunt'); pick('뒤에서'); closeCard(); await settle(); closeCard();
goTo('camp'); use('npc_fire'); pick('똑같이'); ok(done('share'), '나눔'); closeCard();
await settle(); ok(opened('hide') && g.count('rawhide') === 2, '가죽 상황 + 생가죽 둘'); closeCard();
use('npc_fire'); ok(panel && panel.b[0].label.includes('고기'), '불 지키는 사람: 고기와 바꾼다'); pick('내가 긁는다');
const cr = g.items.recipes.find((r) => r.out === 'cloak'); ok(cr && g.cond(cr.showIf), '가죽 긁기 만들기가 보인다'); g.craft('cloak'); ok(g.has('cloak') && g.flags.has('made:cloak'), '가죽 덮개');
await settle(); ok(done('hide') && g.flags.has('sit:hide:self') && g.life.values.craft >= 2, '직접 긁음 → 솜씨'); closeCard();
console.log(`life 고리 2(새 상황 7): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
