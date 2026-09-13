// 구석기 고리 규칙 시험 — WebGL 없이 game.js 규칙만 (Engine/Player/UI 가짜)
// 실행: three 가 resolve 되는 폴더에서 `node test_paleo_loop.mjs <eras/paleo 절대경로>`
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Game } = await import('../core/game.js');

const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };

const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check] = ['world', 'items', 'npcs', 'why', 'check'].map(J);
g.hunger = g.world.hunger.start;
const says = []; const whys = []; let panel = null;
g.ui = { say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => { whys.push(c.concept); cb(); }, npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; }, craftPanel() {},
  check: (data, _a, onFinish) => onFinish([{ id: 'q1', ok: true }, { id: 'q2', ok: true }, { id: 'q3', open: '추웠을 것' }]) };
g.p = { enabled: true, speedMul: 1, teleport() {} };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { material: { clone() { return { color: { multiplyScalar() {} } }; } } } }); };
['stone_1', 'stone_2', 'stone_3', 'stick_1', 'stick_2', 'stick_3', 'grass_1', 'grass_2', 'bush_a1_1', 'bush_a1_2', 'bush_a1_3', 'track_1', 'deer_1', 'fire_1', 'npc_elder', 'gate_1'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map() };
g.setFire = () => { g._fire = true; };
const use = (name) => { g.target = ix.get(name); g.act(); };

// 1) 어른에게 말 걸기 → 돌 힌트
use('npc_elder'); ok(says.at(-1).includes('돌끼리'), '첫 대사');
// 2) 맨손 사냥 실패
use('deer_1'); ok(says.at(-1).includes('맨손'), '맨손 사냥 실패'); ok(ix.has('deer_1'), '사슴 그대로');
// 3) 돌 줍기 3 → 만들기 판에서 주먹도끼
use('stone_1'); use('stone_2'); use('stone_3'); ok(g.count('stone') === 3, '돌 3');
g.craft('handaxe'); ok(g.has('handaxe') && g.count('stone') === 1, '주먹도끼 완성'); ok(g.flags.has('made:handaxe'), 'flag');
await new Promise((r) => setTimeout(r, 1000)); ok(whys.includes('도구와 생활 방식의 관계'), 'why: handaxe');
// 4) 발자국 → NPC 대사 바뀜
use('track_1'); ok(g.flags.has('seen:track'), '발자국'); use('npc_elder'); ok(says.at(-1).includes('나뭇가지에 붙이면'), '창 힌트');
// 5) 창 없이 사냥 → 실패, 창 만들고 사냥 성공
use('stick_1'); g.craft('spear'); ok(g.has('spear') && !g.has('handaxe'), '창');
use('deer_1'); ok(g.count('meat') === 2 && g.has('hide') && !ix.has('deer_1'), '사냥 성공');
// 6) 불: 불씨 없이 실패 → 나무 비비기 → 마른 풀 없이 실패 → 성공 → why fire
use('fire_1'); ok(says.at(-1).includes('불씨가 없어'), '불씨 없음');
use('stick_2'); use('stick_3'); use('grass_1'); g.craft('ember'); ok(g.has('ember') && !g.has('grass'), '불씨(풀 소모)');
use('fire_1'); ok(says.at(-1).includes('마른 풀이 없어'), '풀 없음'); ok(!g.flags.has('fire:lit'), '아직 안 붙음');
use('grass_2'); use('fire_1'); ok(g.flags.has('fire:lit') && g._fire && ix.get('fire_1').state === 'lit', '불 붙음');
await new Promise((r) => setTimeout(r, 1000)); ok(whys.includes('불의 사용과 생활의 변화'), 'why: fire');
// 7) 굽기 → 먹기 → 문 열림
use('fire_1'); ok(g.has('cooked') && g.count('meat') === 1, '굽기');
ok(!g.gateOpen, '아직 닫힘'); g.tapItem('cooked'); ok(g.flags.has('ate:cooked') && g.gateOpen, '문 열림');
// 8) 덤불 3×3 → 구역 비면 why move
for (const b of ['bush_a1_1', 'bush_a1_2', 'bush_a1_3']) for (let k = 0; k < 3; k++) use(b);
ok(g.count('berry') === 9, '열매 9'); ok(g.flags.has('area1:empty'), '구역 비움');
await new Promise((r) => setTimeout(r, 1000)); ok(whys.includes('자연 조건과 이동 생활'), 'why: move');
// 9) 시간의 문 → 확인하기 → 완주
use('gate_1'); ok(panel && panel.h.includes(g.check.intro), '문 안내'); g.runCheck(); ok(g.results && g.results.length === 3, '확인 결과 3'); ok(panel.h.includes('시대 완주'), '완주 화면');
// 10) 배고픔: 느려짐
g.hunger = 10; g.tick(0.1); ok(g.p.speedMul < 1, '배고프면 느려짐');
console.log(`paleo loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
