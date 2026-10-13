// 시대 끝 복습 시험 — 알게 된 것 카드 → 왜 그랬을까 3지선다(틀리면 그 자리로 다시 가 보기) → 끝 카드. 데이터 전수(열한 시대 must 상황 전부 q) 포함.
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
g.life.forceReview = true; g.flags.delete('life:review:done');
// --- 데이터 전수: 열한 시대 must·섞여 나오는 상황마다 q(물음·답 셋·revisit), 자리(place)가 그 시대 구역에 있음, review 설정
const eras = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
let nq = 0, nmix = 0, bad = [];
for (const e of eras) { const d = JSON.parse(fs.readFileSync(`${base}/../${e}/life.json`, 'utf8')); const w = JSON.parse(fs.readFileSync(`${base}/../${e}/world.json`, 'utf8')); const ids = Array.isArray(w.areas) ? w.areas.map((x) => x.id) : Object.keys(w.areas || {});
  if (!d.review) bad.push(e + ':review');
  for (const s of d.situations) { const q = s.q; if (!s.must) { if (!q || !q.q || !Array.isArray(q.a) || q.a.length !== 3 || new Set(q.a).size !== 3 || !q.revisit) bad.push(e + ':mix:' + s.id); else nmix++; continue; } if (!q || !q.q || !Array.isArray(q.a) || q.a.length !== 3 || !q.revisit) { bad.push(e + ':' + s.id); continue; } nq++; if (s.place && !ids.includes(s.place)) bad.push(e + ':' + s.id + ':place'); if (new Set(q.a).size !== 3) bad.push(e + ':' + s.id + ':dup'); } }
ok(!bad.length, '열한 시대 must 상황 전부 q 셋·revisit·자리 OK ' + bad.join(' ')); ok(nq >= 78, `물음 수 ${nq}`); ok(nmix >= 143, `섞여 나오는 상황 물음 수 ${nmix}`);
// --- 고리: 겪은 상황 넷을 흉내(log) → end → 복습 카드
g.life.log = [{ sit: 'hunger', choice: 'gather' }, { sit: 'stone', choice: 'make' }, { sit: 'fire', choice: 'keep' }, { sit: 'hunt', choice: 'back' }, { sit: 'share', choice: 'equal' }, { sit: 'rain', choice: 'shelter' }];
g.life.seed = 7; const E = J('life').situations.find((s) => s.id === 'gone').choices.find((c) => c.then?.some((t) => t.end))?.then.find((t) => t.end).end || { branches: [] };
panels.length = 0; g.life.end(E);
ok(panel && panel.h.includes('알게 된 것') && (panel.h.match(/📜/g) || []).length === 5, '복습 카드: 📜 다섯(must 먼저)'); ok(panel.h.includes('뗀석기') || panel.h.includes('채집'), '겪은 상황의 사실이 들어 있다');
pick('물어봐'); ok(panel && panel.h.includes('왜 그랬을까 1/3') && panel.b.length === 3, '물음 1/3 — 답 셋 단추'); ok(!g.flags.has('life:end'), '아직 끝 카드 아님');
const q1 = g.life.rv.qs[0]; const right = () => panel.b.find((b) => b.label === g.life.rv.qs[g.life.rv.i].q.a[0]); const wrong = () => panel.b.find((b) => b.label !== g.life.rv.qs[g.life.rv.i].q.a[0]);
ok(new Set(panel.b.map((b) => b.label)).size === 3 && right(), '보기 셋이 섞여 있고 정답이 그 안에');
// 틀림 → 다시 가 보기 → 자리에 닿으면 같은 물음
{ const b = wrong(); panel = null; b.onClick(); }
ok(panel && panel.h.includes('그건 아니었어') && panel.b[0].label === '다시 가 보기', '오답 → 되짚기 카드'); ok(g.results.at(-1).ok === false && g.results.at(-1).concept === 'hist.why' && g.results.at(-1).t === q1.title && g.results.at(-1).pick && g.results.at(-1).pick !== q1.q.a[0], '오답이 results 에 오개념으로(상황 제목·고른 답까지 — 리포트용) ' + JSON.stringify(g.results.at(-1)));
pick('다시 가 보기'); ok(!panel && g.p.enabled && g.life.rv.pending && g._goal.includes('다시 가 보자'), '카드 닫히고 걸을 수 있고 나침반 글');
g.p.pos.set(500, 0, 500); g.life.t = 1; g.life.tick(0.6); ok(!panel, '멀리 있으면 안 열림');
const a = areas.get(g.life.rv.pending.place); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6);
ok(panel && panel.h.includes('왜 그랬을까 1/3') && g.life.rv.qs[0] === q1 && !g.p.enabled, '자리에 닿으면 같은 물음이 다시');
{ const b = right(); panel = null; b.onClick(); } ok(g.life.rv.i === 1 && panel.h.includes('2/3'), '맞으면 다음 물음');
{ const b = wrong(); panel = null; b.onClick(); } pick('여기서 다시 고르기'); ok(panel.h.includes('2/3'), '「여기서 다시 고르기」 → 같은 물음');
{ const b = right(); panel = null; b.onClick(); } { const b = right(); panel = null; b.onClick(); }
ok(g.flags.has('life:review:done') && g.flags.has('life:end') && panel && panel.h.includes('솜씨'), '셋 다 맞히면 끝 카드'); ok(says.some((t) => t.includes('다시 가 본 것 2')), '되짚은 수를 말해 준다');
ok(g.results.filter((r) => r.concept === 'hist.why').length === 5 && g.results.filter((r) => r.concept === 'hist.why' && r.ok).length === 3, 'results: 물음 5번(오답 2 포함)');
// 두 번 안 열림
panels.length = 0; g.life.end(E); ok(panel.h.includes('솜씨') && !panels.some((h) => h.includes('왜 그랬을까')), '복습이 끝났으면 바로 끝 카드');
// story.fast 면(기존 고리 시험) 건너뜀
g.flags.delete('life:review:done'); g.life.forceReview = false; panels.length = 0; g.life.end(E); ok(panel.h.includes('솜씨') && !panels.some((h) => h.includes('알게 된 것')), 'fast 시험은 복습 건너뜀');
console.log(`review ${pass}/${fail}`); if (fail) process.exit(1);
