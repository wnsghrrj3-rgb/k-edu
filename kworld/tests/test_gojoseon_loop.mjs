// 고조선 고리 규칙 시험 — WebGL 없이 game.js 규칙만 (Engine/Player/UI 가짜)
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
  obj: { traverse(f) { for (const m of ['law_marks', 'altar_rice']) f({ isMesh: true, material: { name: m, clone() { return this; }, color: { multiplyScalar() {} } }, set visible(v) { vis[name + ':' + m] = v; } }); } } }); };
['stone_1', 'stone_2', 'stone_3', 'stone_4', 'lawStone_1', 'sheaf_1', 'altar_1', 'npc_guard', 'npc_quarrel', 'npc_king', 'npc_thief', 'npc_seller', 'gate_1'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map([['market', new THREE.Vector3(1, 0, 1)]]), groundY: () => 0, pickTarget: () => null };
g.setFire = () => {};
g.initTargets();
ok(ix.get('lawStone_1').state === 'blank' && vis['lawStone_1:law_marks'] === false, '법돌 글자 숨김'); ok(ix.get('altar_1').state === 'empty' && vis['altar_1:altar_rice'] === false, '제단 볏단 숨김');
g.updateMission(true); ok(g._mission.includes('성문'), '첫 미션');
const use = (name) => { g.target = ix.get(name); g.act(); };
const wait = (ms = 1600) => new Promise((r) => setTimeout(r, ms));
// 1) 문지기 → 장터 다툼(선택 1) → 임금
use('npc_guard'); ok(says.at(-1).includes('장터') && g.flags.has('talk:guard'), '문지기'); g.tick(0.01); ok(g._mission.includes('고함'), '미션 2');
use('npc_king'); ok(says.at(-1).includes('먼저 보고'), '임금: 장터 먼저');
use('npc_quarrel'); ok(panel && panel.b.length === 2 && panel.h.includes('곡식 자루'), '다툼 선택 2');
panel.b[1].onClick(); ok(g.flags.has('met:quarrel') && g.flags.has('choice:king') && says.at(-1).includes('매번'), '선택: 임금에게'); g.tick(0.01); ok(g._mission.includes('임금'), '미션 3');
use('npc_thief'); ok(says.at(-1).includes('정한 것도 없으면서') && !g.flags.has('judged:thief'), '법 없인 판가름 못 함');
use('lawStone_1'); ok(says.at(-1).includes('판판한 돌이 없어'), '돌 없이 새기기 실패');
use('npc_king'); ok(says.at(-1).includes('미리 정해') && g.flags.has('asked:law'), '임금: 법 새겨라'); g.tick(0.01); ok(g._mission.includes('돌 줍기'), '미션 4');
// 2) 돌 3 → 법 새기기 → why law
use('stone_1'); use('stone_2'); use('lawStone_1'); ok(says.at(-1).includes('세 개는'), '돌 2로는 부족');
use('stone_3'); ok(g.count('stone') === 3 && !ix.has('stone_3'), '돌 3'); g.tick(0.01); ok(g._mission.includes('새기기'), '미션 5');
use('lawStone_1'); ok(g.has('law') && g.count('stone') === 0 && ix.get('lawStone_1').state === 'carved' && vis['lawStone_1:law_marks'] === true && g.flags.has('made:law'), '법 새김');
await wait(1000); ok(whys.includes('법이 생긴 까닭'), 'why: law'); g.tick(0.01); ok(g._mission.includes('판가름'), '미션 6');
use('lawStone_1'); ok(says.at(-1).includes('새긴 대로'), '새긴 법돌 읽기');
use('npc_guard'); ok(says.at(-1).includes('법돌이 섰구나'), '문지기 분기');
// 3) 다툼 판가름(선택 2) → 도둑(선택 3, why class)
use('npc_quarrel'); ok(panel && panel.h.includes('다치게 하면'), '판가름 선택'); panel.b[0].onClick(); ok(g.flags.has('settled:quarrel') && g.flags.has('choice:bylaw'), '법대로'); g.tick(0.01); ok(g._mission.includes('묶인'), '미션 7');
use('npc_quarrel'); ok(says.at(-1).includes('법돌 앞으로'), '판가름 뒤 대사');
use('npc_thief'); ok(panel && panel.b.length === 2 && panel.h.includes('오십 자루'), '도둑 선택'); panel.b[0].onClick(); ok(g.flags.has('judged:thief') && g.flags.has('choice:pay'), '풀어 줌');
await wait(); ok(whys.includes('법에 남은 신분의 차이'), 'why: class (선택 뒤)'); g.tick(0.01); ok(g._mission.includes('볏단'), '미션 8');
// 4) 볏단(주인에게 먼저) → 제단 → why heaven → 문
use('altar_1'); ok(says.at(-1).includes('올릴 게 없어'), '제단 빈손');
use('sheaf_1'); ok(says.at(-1).includes('주인에게') && g.count('rice') === 0, '주인 먼저');
use('npc_seller'); ok(g.flags.has('talk:seller'), '아주머니'); use('sheaf_1'); ok(g.count('rice') === 1, '볏단 1'); g.tick(0.01); ok(g._mission.includes('제단'), '미션 9');
ok(!g.gateOpen, '아직 닫힘');
use('altar_1'); ok(g.flags.has('offered:altar') && g.count('rice') === 0 && vis['altar_1:altar_rice'] === true && ix.get('altar_1').state === 'offered', '제사');
ok(g.gateOpen, '문 열림'); await wait(1000); ok(whys.includes('임금의 힘은 어디서 왔나'), 'why: heaven');
use('npc_king'); ok(says.at(-1).includes('하늘이 받으셨다'), '임금 마지막'); g.tick(0.01); ok(g._mission.includes('시간의 문'), '미션 10');
// 5) 완주
use('gate_1'); ok(panel && panel.h.includes(g.check.intro), '문 안내'); g.runCheck(); ok(g.results && g.results.length === 3, '확인 3');
ok(g._mission.includes('고조선 완주'), '완주'); ok(panel.h.includes('8조법'), '역사 가방');
ok(panel.b[0].label.includes('준비 중'), '삼국 준비 중');
console.log(`gojoseon loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
