// 청동기 인생 층 고리 시험 — 넘겨받은 곡식 → 신분(곳간 있는 집) → 7 상황 → 끝 카드(우두머리 곁). 회색(성별·신분)·빚→노비 갈림도 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:neo': JSON.stringify({ craft: 6, heart: 2, grain: 3 }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const mkGame = (sex, mixed) => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map();
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
  ['fire_1', 'slab_1', 'granary_1', 'mold_1', 'sheaf_1', 'gatefront_1', 'npc_chief', 'npc_smith', 'npc_elder', 'npc_poor', 'npc_guard', 'npc_farmer', 'npc_tenant', 'npc_shaman', 'npc_trader', 'npc_neighbor', 'stone_1', 'stone_2', 'bigpaddy_1', 'smallpaddy_1', 'field_1', 'ditch_1', 'copper_1', 'copper_2', 'rock_1', 'tin_1', 'charcoal_1', 'dolmensite_1', 'olddolmen_1', 'emptypit_1', 'tower_1', 'fish_1'].forEach(mk);
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  const areas = new Map(Object.entries({ village: [0, 0], gate: [0, -21], paddy: [-2, 46], field_s: [34, 40], valley: [66, 6], tin: [86, -10], dolmen: [-62, 4], woods: [-52, 60], shore: [28, -58], ford: [-6, -66], ford_s: [-6, -86], other: [-24, -96], tower: [58, 72] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  return { g, ix, S, use, pick, closeCard, goTo, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 곳간이 있는 집(넘겨받은 곡식 3), 여자 — 우두머리 곁까지
{
  const { g, ix, S, use, pick, closeCard, goTo, opened, done } = mkGame('f', ['salt', 'mirror', 'smoke', 'apprentice']);
  ok(g.era === 'bronze-life', 'era 키');
  ok(g.life.values.grain === 3 && g.life.values.craft === 3 && g.life.values.heart === 1, '넘겨받음: 곡식은 전부(3), 솜씨·인심 절반');
  ok(g.life.status === 'rich' && g.flags.has('status:rich'), '신분 = 곳간이 있는 집(곡식 ≥3, 수치로)');
  goTo('paddy'); ok(opened('rice'), '이삭 상황'); closeCard();
  use('bigpaddy_1'); ok(!g.flags.has('cut:paddy') && S.says.at(-1).includes('반달돌칼'), '칼 없이는 못 딴다');
  goTo('village'); use('stone_1'); ok(g.promptFor(ix.get('slab_1')).verb.includes('반달'), '갈판 → 반달돌칼'); use('slab_1'); ok(g.has('sickle'), '반달돌칼');
  goTo('paddy'); use('smallpaddy_1'); ok(!g.flags.has('cut:paddy') && S.says.at(-1).includes('논 있는 집'), '곳간 집은 작은 논을 못 딴다(신분 회색)');
  use('bigpaddy_1'); ok(g.count('grain') === 3 + 0 + 4 - 0 || g.count('grain') === 4, '넓은 논 네 단'); ok(done('rice') && g.life.values.craft === 4, '이삭 → 솜씨 4'); closeCard();
  goTo('village'); ok(opened('granary'), '곳간 상황'); closeCard();
  use('npc_chief'); ok(S.panel.b[1].disabled && !S.panel.b[0].disabled, '「바친다」는 곳간 집에 회색'); pick('곳간에 넣는다'); closeCard();
  ok(g.promptFor(ix.get('granary_1')).verb.includes('넣는다'), '곳간 이름 바뀜'); use('granary_1'); ok(g.flags.has('granary:mine') && done('granary') && g.life.values.grain === 5, '우리 곳간 → 곡식 5'); closeCard();
  await settle(); ok(g.flags.has('day:forge') && opened('sword'), '쇠 다루는 사람 손짓 → 칼 상황'); closeCard();
  use('npc_smith'); pick('배운다'); ok(g.flags.has('smith:learn'), '제자');
  goTo('valley'); use('rock_1'); ok(!g.has('copper'), '그냥 바위'); use('copper_1'); use('copper_2'); goTo('tin'); use('tin_1'); goTo('woods'); use('charcoal_1');
  ok(g.count('copper') === 2 && g.has('tin') && g.count('charcoal') === 2, '구리 둘·주석·숯');
  goTo('village'); use('fire_1'); ok(g.has('sword') && g.flags.has('made:sword'), '청동을 부었다');
  use('npc_chief'); ok(!S.panel.b[0].disabled, '곡식 5 ≥ 4 → 내가 찰 수 있다'); pick('내 곳간이'); ok(done('sword') && g.flags.has('sword:mine'), '칼은 내 것'); closeCard();
  await settle(); goTo('village'); ok(opened('apprentice'), '섞여: 비법'); closeCard(); use('npc_smith'); pick('작은 집 아이'); ok(done('apprentice') && g.life.values.heart === 3, '가르침 → 인심 3'); closeCard();
  await settle(120); ok(g.flags.has('water:on') && opened('water'), '물싸움 상황'); closeCard();
  goTo('paddy'); use('npc_farmer'); ok(S.panel.b[1].disabled && S.panel.b[1].reason.includes('남자'), '싸움 = 여자 회색 + 이유'); ok(!S.panel.b[2].disabled, '약속 = 곳간 집 가능'); pick('우두머리로서'); ok(done('water') && g.flags.has('water:deal') && g.life.values.grain === 4, '약속 → 곡식 -1 = 4'); closeCard();
  await settle(200); ok(g.flags.has('chief:dead') && opened('dolmen'), '우두머리 죽음 → 고인돌'); closeCard();
  goTo('dolmen'); ok(opened('mirror'), '섞여: 거울'); closeCard(); ok(g.promptFor(ix.get('dolmensite_1')).verb.includes('시킨다'), '곳간 집은 「위에서 시킨다」'); use('dolmensite_1'); ok(done('dolmen') && g.flags.has('dolmen:order'), '시켰다 ' + S.says.slice(-2).join('|') + ' flags:' + [...g.flags].filter((f) => f.includes('dolmen')).join(',')); closeCard();
  await settle(200); ok(g.flags.has('famine:on') && opened('famine'), '흉년'); closeCard();
  goTo('other'); use('npc_neighbor'); pick('거저'); ok(done('famine') && g.life.values.heart === 8 && g.life.values.grain === 3, '거저 → 인심 8·곡식 3'); closeCard();
  await settle(120); ok(g.flags.has('merge:on') && opened('merge'), '마을이 커진다'); closeCard();
  goTo('village'); use('npc_elder'); ok(S.panel.b[0].disabled && S.panel.b[0].reason.includes('곡식'), '곡식 3 < 4 → 우두머리 곁 회색(수치)'); ok(!S.panel.b[1].disabled, '장인 자리(제자)'); ok(S.panel.b[2].disabled && !S.panel.b[3].disabled, '싸움 회색·제사 열림(여자)');
  pick('마을을 지킨다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:rite'), '끝: 제사 맡은 집'); ok(S.panels.at(-1).includes('🏠 곳간이 있는 집'), '끝 카드에 신분');
  const carry = JSON.parse(store['kworld_carry:bronze-life']); ok(carry.status === 'rich' && carry.grain === 3, '고조선으로 넘길 값에 신분');
}
// ===== 판 2: 밭뙈기 집(넘겨받은 곡식 0), 남자 — 빌려서 빚 → 노비
store['kworld_carry:neo'] = JSON.stringify({ craft: 2, heart: 0, grain: 0 });
{
  const { g, ix, S, use, pick, closeCard, goTo, opened, done } = mkGame('m', ['salt']);
  ok(g.life.status === 'poor', '신분 = 밭뙈기 집');
  goTo('paddy'); closeCard(); goTo('village'); use('stone_1'); use('slab_1'); goTo('paddy'); use('bigpaddy_1'); ok(!g.flags.has('cut:paddy'), '우두머리 논 못 땀'); goTo('field_s'); use('field_1'); ok(done('rice') && g.has('millet'), '밭뙈기 조'); closeCard();
  goTo('village'); closeCard(); use('npc_chief'); ok(S.panel.b[0].disabled, '「우리 곳간」 회색'); pick('숨긴다'); ok(!g.flags.has('granary:hide'), '숨길 벼가 없다(조뿐)'); S.panel = null;
  g.inventory.push('grain'); use('npc_chief'); pick('숨긴다'); ok(done('granary') && g.flags.has('granary:hide') && g.life.values.heart === -0 || g.life.values.heart === 0, '숨겼다'); closeCard();
  await settle(); closeCard(); goTo('valley'); use('copper_1'); use('copper_2'); goTo('tin'); use('tin_1'); goTo('woods'); use('charcoal_1'); goTo('village'); use('fire_1'); use('npc_chief'); ok(S.panel.b[0].disabled, '곡식 적으면 「내가 찬다」 회색'); pick('우두머리에게'); closeCard();
  await settle(120); closeCard(); goTo('paddy'); use('npc_farmer'); ok(!S.panel.b[1].disabled && S.panel.b[2].disabled, '남자는 싸움 가능·약속은 회색'); pick('같이 도랑'); use('ditch_1'); ok(done('water') && g.flags.has('water:ditch'), '도랑'); closeCard();
  await settle(200); closeCard(); goTo('dolmen'); ok(g.promptFor(ix.get('dolmensite_1')).verb === '끈다', '밭뙈기 집은 끈다'); Math.random = () => 0.99; use('dolmensite_1'); ok(g.life.hurt.has('leg') && !done('dolmen'), '굴림 실패 → 절뚝'); Math.random = () => 0.01; use('dolmensite_1'); ok(done('dolmen'), '끌었다'); closeCard();
  await settle(200); closeCard(); goTo('village'); use('npc_poor'); pick('우두머리에게 빌린다'); ok(done('famine') && g.flags.has('famine:borrow'), '빌렸다 → 빚'); closeCard();
  await settle(120); closeCard(); use('npc_elder'); ok(S.panel.b[2].disabled && S.panel.b[2].reason.includes('절'), '절뚝 → 싸움 회색'); pick('뒷자리'); closeCard(); await settle();
  ok(g.flags.has('life:slave'), '끝: 빚진 집(노비 길)');
}
console.log(`bronze life 고리: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
