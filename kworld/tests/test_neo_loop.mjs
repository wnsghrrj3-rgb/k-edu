// 신석기 고리 규칙 시험 — WebGL 없이 game.js 규칙만 (Engine/Player/UI 가짜)
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Game } = await import('../core/game.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; const whys = []; let panel = null;
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => { whys.push(c.concept); cb(); }, npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; }, craftPanel() {},
  check: (data, _a, onFinish) => onFinish([{ id: 'q1', ok: true }, { id: 'q2', ok: true }, { id: 'q3', open: '굶었을 것' }]) };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(), yaw: 0 };
const ix = new Map(); const vis = {};
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(),
  obj: { traverse(f) { for (const m of ['sprout', 'crop', 'hut_built']) f({ isMesh: true, material: { name: m }, set visible(v) { vis[name + ':' + m] = v; } }); } } }); };
['stone_1', 'stone_2', 'slab_1', 'field_1', 'field_2', 'millet_1', 'millet_2', 'clay_1', 'water_1', 'fire_1', 'shell_1', 'log_1', 'log_2', 'log_3', 'reed_1', 'reed_2', 'hutsite_1', 'npc_elder', 'npc_farmer', 'gate_1'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map([['village', new THREE.Vector3(1, 0, 1)]]), groundY: () => 0, pickTarget: () => null };
g.setFire = (on) => { g._fire = on; };
g.initTargets(); for (const t of ix.values()) if (t.type === 'fire' && t.state === 'lit') g.setFire(true);
ok(ix.get('fire_1').state === 'lit' && g._fire, '화덕은 처음부터 켜짐'); ok(ix.get('field_1').state === 'bare' && vis['field_1:crop'] === false, '밭 시작 상태·작물 숨김');
ok(ix.get('hutsite_1').state === 'empty' && vis['hutsite_1:hut_built'] === false, '움집 자리 숨김');
g.updateMission(true); ok(g._mission.includes('말 걸기'), '첫 미션');
const use = (name) => { g.target = ix.get(name); g.act(); };
const wait = () => new Promise((r) => setTimeout(r, 1000));
// 1) 어른
use('npc_elder'); ok(says.at(-1).includes('갈면'), '첫 대사'); g.tick(0.01); ok(g._mission.includes('돌 줍기'), '미션 2');
// 2) 갈판: 돌 없이 실패 → 돌 줍고 갈기 → 돌괭이 + why
use('slab_1'); ok(says.at(-1).includes('돌이 필요해'), '갈판 돌 없음');
use('stone_1'); g.tick(0.01); ok(g._mission.includes('갈기'), '미션 3');
use('slab_1'); ok(g.has('hoe') && !g.has('stone') && g.flags.has('made:hoe'), '돌괭이'); await wait(); ok(whys.includes('도구의 발전과 생활의 변화'), 'why: polished');
g.tick(0.01); ok(g._mission.includes('밭 파기'), '미션 4');
// 3) 밭: 파기 → 씨 없이 실패 → 씨앗 → 심기 → 타이머 → 자람
use('field_2'); ok(ix.get('field_2').state === 'dug', '밭 파기'); g.tick(0.01); ok(g._mission.includes('씨앗'), '미션 5');
use('field_2'); ok(says.at(-1).includes('씨앗이 없어'), '씨 없음');
use('millet_1'); ok(g.count('seed') === 2, '씨앗 2'); g.tapItem('seed'); ok(g.count('seed') === 1, '씨앗을 먹을 수도 있음(딜레마)');
use('field_2'); ok(ix.get('field_2').state === 'planted' && vis['field_2:sprout'] === true && ix.get('field_2').timer, '심기+싹+타이머');
use('field_2'); ok(says.at(-1).includes('싹이 작다'), '기다리는 중 안내');
g.tick(0.01); ok(g._mission.includes('그릇 빚기'), '미션 7 (기다리는 동안)');
// 4) 그릇: 진흙+물 → 빚기 → 굽기
use('clay_1'); use('water_1'); ok(g.has('clay') && g.has('water') && ix.has('water_1'), '진흙·물(강은 안 없어짐)');
g.craft('wetpot'); ok(g.has('wetpot') && g.flags.has('made:wetpot'), '빚기'); g.tick(0.01); ok(g._mission.includes('굽기'), '미션 8');
use('fire_1'); ok(g.has('pottery') && !g.has('wetpot') && g.flags.has('made:pottery'), '굽기'); g.tick(0.01); ok(g._mission.includes('거두기'), '미션 9');
// 5) 자람: 타이머 당겨서 → 거두기 → 담아 두기 → why farm
ix.get('field_2').timer.at = 0; g.tick(0.01); ok(ix.get('field_2').state === 'grown' && vis['field_2:crop'] === true && vis['field_2:sprout'] === false, '타이머로 자람');
use('field_2'); ok(g.count('grain') === 3 && ix.get('field_2').state === 'harvested' && vis['field_2:crop'] === false, '거두기'); g.tick(0.01); ok(g._mission.includes('담아'), '미션 10');
g.craft('storedpot'); ok(g.has('storedpot') && g.count('grain') === 1 && g.flags.has('stored:grain'), '담아 두기'); g.tick(0.01); ok(g._mission.includes('움집'), '미션 11');
use('npc_farmer'); ok(says.at(-1).includes('남겨'), '농부 대사 분기');
// 6) 움집: 통나무 부족 → 갈대 부족 → 성공 → why hut → 문 열림
use('hutsite_1'); ok(says.at(-1).includes('통나무'), '통나무 없음');
use('log_1'); use('log_2'); use('hutsite_1'); ok(says.at(-1).includes('세 개'), '통나무 부족');
use('log_3'); use('reed_1'); use('hutsite_1'); ok(says.at(-1).includes('갈대'), '갈대 부족');
use('reed_2'); ok(!g.gateOpen, '아직 닫힘'); use('hutsite_1'); ok(ix.get('hutsite_1').state === 'built' && vis['hutsite_1:hut_built'] === true && !g.has('wood') && !g.has('reed'), '움집 완성');
ok(g.gateOpen, '문 열림'); await wait(); ok(whys.includes('정착 생활과 집'), 'why: hut');
g.tick(0.01); ok(g._mission.includes('시간의 문'), '미션 12');
// 7) 완주
use('gate_1'); ok(panel && panel.h.includes(g.check.intro), '문 안내'); g.runCheck(); ok(g.results && g.results.length === 3, '확인 3');
ok(g._mission.includes('신석기 완주'), '완주'); ok(panel.h.includes('돌괭이') && panel.h.includes('빗살무늬토기') && panel.h.includes('조를 담은 토기'), '역사 가방 3');
ok(panel.b[0].label.includes('준비 중'), '청동기 준비 중');
g.hunger = 10; g.tick(0.1); ok(g.p.speedMul < 1, '배고픔');
console.log(`neolithic loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
