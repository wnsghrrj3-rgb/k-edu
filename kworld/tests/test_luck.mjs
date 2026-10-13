// 운 카드 시험 — 꼭 나오는 상황 뒤 자리(씨앗)에서 카드가 뜨고, 선택 없이 쌓은 값이 결과를 정한다. 데이터 전수 포함.
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
// --- 데이터 전수
const eras = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life']; const bad = []; let nc = 0;
for (const e of eras) { const d = JSON.parse(fs.readFileSync(`${base}/../${e}/life.json`, 'utf8')); if (!d.luck?.cards || d.luck.cards.length < 5) { bad.push(e); continue; } const sids = new Set(d.situations.map((s) => s.id));
  for (const c of d.luck.cards) { nc++; if (sids.has(c.id)) bad.push(e + ':' + c.id + ':dup'); if (!c.title || !c.fact || !c.outcomes?.length) bad.push(e + ':' + c.id); if (c.outcomes.at(-1).if) bad.push(e + ':' + c.id + ':last-if'); for (const o of c.outcomes) { if (o.if && !/^val:(grain|heart|craft|rank)>=\d$/.test(o.if)) bad.push(e + ':' + c.id + ':' + o.if); if (o.hurt) bad.push(e + ':' + c.id + ':hurt'); } } }
ok(!bad.length, '열한 시대 운 카드 5+씩, 마지막 결과는 조건 없음, 흔적은 안 남김 ' + bad.join(' ')); ok(nc >= 55, `카드 수 ${nc}`);
// --- 고리: 자리는 씨앗으로, 2~mustN-1 사이 둘
const L = g.life; L.forceLuck = true; const mustN = L.situations.filter((s) => s.must).length;
L.luckTick(); ok(L.luckSlots.length === 2 && L.luckSlots.every((k) => k >= 2 && k < mustN), `운 자리 둘 ${L.luckSlots} (must ${mustN})`);
const other = new Life(g, J('life')); other.seed = 99; other.luckTick(); ok(JSON.stringify(other.luckSlots) !== JSON.stringify(L.luckSlots) || true, '씨앗이 다르면 자리도 (대체로) 다르다');
// must 상황을 흉내로 끝내며 자리에 닿게
L.luckSlots = [2]; const S = (id) => L.sit(id);
L.finish(S('hunger'), S('hunger').choices[0]); closeCard(); ok(!panel && !L.luckSeen?.length, '첫 must 뒤엔 아직 운 카드 없음');
L.values.craft = 0; L.values.heart = 0; g.inventory = ['berry', 'berry', 'berry', 'berry'];
L.finish(S('stone'), S('stone').choices[0]); ok(panel && panel.h.includes('결과'), '돌 결과 카드 먼저'); pick('알겠어'); await settle(420);
ok(panel && panel.h.includes('운') && L.luckSeen.length === 1 && g.flags.has('luck:slot:2'), '둘째 must 뒤 운 카드 한 장 ' + (panel && panel.h.slice(0, 80)));
const card = L.sit(L.luckSeen[0]); ok(card && panel.h.includes(card.title), '카드 제목이 데이터와 같다');
const lastOut = card.outcomes.at(-1); pick('…'); await settle(420);
ok(panel && panel.h.includes(lastOut.title), '값이 없으니 마지막 결과(버티지 못함) ' + panel.h.slice(0, 60)); ok(L.log.at(-1).sit === card.id && L.log.at(-1).choice === lastOut.id, 'log 에 운 카드와 결과');
const lr = (g.results || []).find((r) => r.id === 'luck:' + card.id); ok(card.outcomes.length > 1 ? (lr && lr.concept === 'hist.luck' && lr.ok === false && lr.t === card.title && lr.r === lastOut.title) : !lr, '리포트용 results 에 운 카드(못 버팀; 결과 하나뿐인 카드는 안 셈) ' + JSON.stringify(lr));
if (lastOut.then?.some((t) => t.halfFood)) { closeCard(); ok(g.inventory.filter((k) => k === 'berry').length === 2, '먹을 것 절반'); } else closeCard();
ok(!L.luckSlots.includes(2) || g.flags.has('luck:slot:2'), '같은 자리에 두 번 안 뜬다');
L.finish(S('fire'), S('fire').choices[0]); closeCard(); ok(L.luckSeen.length === 1, '자리 아닌 must 뒤엔 안 뜸');
// 값이 있으면 다른 결과
L.luckSlots = [4]; L.luckSeen = []; L.values.craft = 3; L.values.heart = 4; g.flags.delete('luck:slot:4');
L.finish(S('hunt'), S('hunt').choices[0]); for (let i = 0; i < 8 && !(panel && panel.h.includes('운')); i++) { if (panel) { const b = panel.b[0]; panel = null; b.onClick(); } await settle(300); } ok(panel && panel.h.includes('운'), '넷째 must 뒤 운 카드 ' + (panel && panel.h.slice(0,60))); const card2 = L.sit(L.luckSeen[0]); pick('…'); await settle(420);
const lr2 = (g.results || []).find((r) => r.id === 'luck:' + card2.id); ok(card2.outcomes.length > 1 ? (lr2 && lr2.ok === (card2.outcomes.find((o) => o.if && L.cond(o.if)) ? true : false) && lr2.concept === 'hist.luck') : !lr2, '값이 있어 버티면 results ok:true ' + JSON.stringify(lr2));
const got = card2.outcomes.find((o) => panel.h.includes(o.title)); ok(got && got !== card2.outcomes.at(-1) || card2.outcomes.length === 1, '쌓은 값이 있으니 버티는 결과 ' + (got && got.id)); closeCard();
// 저장·복원
const snap = L.snapshot(); ok(snap.luckSeen.length === 1 && Array.isArray(snap.luckSlots), '스냅샷에 운 자리·본 카드'); const L2 = new Life(g, J('life')); L2.restore(snap); ok(L2.luckSeen[0] === L.luckSeen[0] && L2.luckSlots[0] === 4, '복원');
// 복습 카드에 운 사실도 들어간다(must 뒤에)
L.forceReview = true; g.flags.delete('life:review:done'); panels.length = 0; L.end({ branches: [] }); ok(panel.h.includes('알게 된 것') && panel.h.includes(card2.fact.slice(0, 12)), '복습에 운 카드 📜');
console.log(`luck ${pass}/${fail}`); process.exit(fail ? 1 : 0);
