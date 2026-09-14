// 청동기 고리 규칙 시험 — WebGL 없이 game.js 규칙만 (Engine/Player/UI 가짜)
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
  check: (data, _a, onFinish) => onFinish([{ id: 'q1', ok: true }, { id: 'q2', ok: true }, { id: 'q3', open: '싸움이 났을 것' }]) };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(), yaw: 0 };
const ix = new Map(); const vis = {};
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(),
  obj: { traverse(f) { for (const m of ['ricehead', 'grain_full', 'dolmen_cap', 'dolmen_lying']) f({ isMesh: true, material: { name: m }, set visible(v) { vis[name + ':' + m] = v; } }); } } }); };
['stone_1', 'stone_2', 'stone_3', 'stone_4', 'slab_1', 'paddy_1', 'paddy_2', 'paddy_3', 'granary_1', 'copper_1', 'copper_2', 'tin_1', 'rock_1', 'fire_1', 'dolmenSite_1', 'npc_chief', 'npc_neighbor', 'npc_v1', 'npc_v2', 'npc_v3', 'gate_1'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map([['village', new THREE.Vector3(1, 0, 1)]]), groundY: () => 0, pickTarget: () => null };
g.setFire = (on) => { g._fire = on; };
g.initTargets(); for (const t of ix.values()) if (t.type === 'fire' && t.state === 'lit') g.setFire(true);
ok(ix.get('fire_1').state === 'lit' && g._fire, '화덕 켜짐'); ok(ix.get('paddy_1').state === 'ripe', '논 익음'); ok(vis['granary_1:grain_full'] === false, '곳간 볏단 숨김'); ok(vis['dolmenSite_1:dolmen_cap'] === false, '덮개돌 숨김');
g.updateMission(true); ok(g._mission.includes('우두머리'), '첫 미션');
const use = (name) => { g.target = ix.get(name); g.act(); };
const wait = () => new Promise((r) => setTimeout(r, 1000));
// 1) 우두머리 → 돌 → 반달돌칼
use('npc_chief'); ok(says.at(-1).includes('반달'), '우두머리 첫 대사'); ok(g.flags.has('talk:chief'), 'NPC 별 깃발'); g.tick(0.01); ok(g._mission.includes('돌 줍기'), '미션 2');
use('paddy_1'); ok(says.at(-1).includes('줄기만'), '맨손 실패');
use('slab_1'); ok(says.at(-1).includes('갈 돌이 없네'), '갈판 돌 없음');
use('stone_1'); g.tick(0.01); ok(g._mission.includes('반달돌칼'), '미션 3');
use('slab_1'); ok(g.has('sickle') && g.flags.has('made:sickle'), '반달돌칼'); g.tick(0.01); ok(g._mission.includes('이삭'), '미션 4');
// 2) 벼 4묶음 → 곳간 → why surplus
use('paddy_1'); ok(g.count('rice') === 2 && ix.get('paddy_1').state === 'cut' && vis['paddy_1:ricehead'] === false, '이삭 따기 2');
use('paddy_1'); ok(says.at(-1).includes('다 땄다'), '딴 논');
use('granary_1'); ok(says.at(-1).includes('네 묶음'), '벼 부족');
use('paddy_2'); ok(g.count('rice') === 4, '벼 4'); g.tick(0.01); ok(g._mission.includes('곳간'), '미션 5');
use('granary_1'); ok(g.flags.has('stored:rice') && g.count('rice') === 0 && vis['granary_1:grain_full'] === true, '곳간 가득'); await wait(); ok(whys.includes('잉여와 계급의 관계'), 'why: surplus');
g.tick(0.01); ok(g._mission.includes('낯선'), '미션 6');
// 3) 이웃 딜레마(선택형) → 우두머리
use('npc_neighbor'); ok(panel && panel.b.length === 2 && panel.h.includes('나눠'), '선택 2개');
panel.b[1].onClick(); ok(g.flags.has('met:neighbor') && g.flags.has('choice:guard') && !g.flags.has('choice:share'), '선택 깃발'); g.tick(0.01); ok(g._mission.includes('돌아가기'), '미션 7');
use('npc_neighbor'); ok(says.at(-1).includes('울타리'), '선택 뒤 대사 분기');
use('npc_chief'); ok(says.at(-1).includes('돌려보냈') && g.flags.has('asked:bronze'), '우두머리 분기+대사 깃발'); g.tick(0.01); ok(g._mission.includes('구리돌'), '미션 8');
// 4) 광석: 그냥 바위 · 구리 2 · 주석 1 → 거푸집 → 청동 붓기 실패들 → 성공 → why bronze
use('rock_1'); ok(says.at(-1).includes('그냥 돌') && ix.has('rock_1'), '그냥 바위');
use('copper_1'); use('copper_2'); ok(g.count('copper') === 2, '구리 2'); g.tick(0.01); ok(g._mission.includes('주석'), '미션 9');
use('fire_1'); ok(says.at(-1).includes('거푸집이 없어'), '거푸집 없음');
use('tin_1'); g.tick(0.01); ok(g._mission.includes('거푸집'), '미션 10');
g.craft('mold'); ok(says.at(-1).includes('모자라'), '돌 부족(1개)');
use('stone_2'); use('stone_3'); g.craft('mold'); ok(g.has('mold') && g.count('stone') === 0 && g.flags.has('made:mold'), '거푸집'); g.tick(0.01); ok(g._mission.includes('청동 붓기'), '미션 11');
g.take('tin'); use('fire_1'); ok(says.at(-1).includes('주석돌이 있어야'), '주석 없음'); g.give('tin');
use('npc_v1'); ok(says.at(-1).includes('왜 따라가') && !g.flags.has('helper:v1'), '검 없이는 안 따름');
use('fire_1'); ok(g.has('sword') && !g.has('mold') && !g.has('copper') && !g.has('tin') && g.flags.has('made:bronze'), '비파형동검'); await wait(); ok(whys.includes('기술의 희소성과 권력'), 'why: bronze');
g.tick(0.01); ok(g._mission.includes('사람 모으기'), '미션 12');
// 5) 사람 모으기(all) → 고인돌(requiresFlags)
use('dolmenSite_1'); ok(says.at(-1).includes('꿈쩍') && ix.get('dolmenSite_1').state === 'flat', '혼자는 못 세움');
use('npc_v1'); use('npc_v2'); ok(g.flags.has('helper:v1') && g.flags.has('helper:v2'), '둘 모음'); g.tick(0.01); ok(g._mission.includes('사람 모으기'), '아직 셋 아님');
use('npc_v3'); g.tick(0.01); ok(g._mission.includes('고인돌 세우기'), '미션 13');
ok(!g.gateOpen, '아직 닫힘'); use('dolmenSite_1'); ok(ix.get('dolmenSite_1').state === 'built' && vis['dolmenSite_1:dolmen_cap'] === true && vis['dolmenSite_1:dolmen_lying'] === false && g.flags.has('built:dolmen'), '고인돌');
ok(g.gateOpen, '문 열림'); await wait(); ok(whys.includes('힘의 흔적과 나라의 시작'), 'why: dolmen');
g.tick(0.01); ok(g._mission.includes('시간의 문'), '미션 14');
// 6) 완주
use('gate_1'); ok(panel && panel.h.includes(g.check.intro), '문 안내'); g.runCheck(); ok(g.results && g.results.length === 3, '확인 3');
ok(g._mission.includes('청동기 완주'), '완주'); ok(panel.h.includes('반달돌칼') && panel.h.includes('비파형동검'), '역사 가방 2');
ok(panel.b[0].label.includes('준비 중'), '고조선 준비 중');
g.hunger = 10; g.tick(0.1); ok(g.p.speedMul < 1, '배고픔');
console.log(`bronze loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
