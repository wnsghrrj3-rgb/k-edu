// 고조선 인생 층 고리 시험 — 청동기 갈림(from:chief/slave)→신분 → 7 상황 → 끝 카드. 회색(신분·성별)·8조법(도둑→종·값 치르면 풀려남)·종의 도망·삶 중간 신분 변화를 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:bronze-life': JSON.stringify({ craft: 6, heart: 4, grain: 3, branch: 'chief', status: 'rich' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ironhoe_1', 'slab_1', 'granary_1', 'granary_2', 'slavehut_1', 'gatefront_1', 'rampart_1', 'stall_1', 'jail_1', 'lawstone_1', 'altar_1', 'sacredtree_1', 'bigpaddy_1', 'smallpaddy_1', 'masterfield_1', 'hollow_1', 'log_1', 'tower_1', 'coinstall_1', 'fish_1', 'hancamp_1', 'pass_1', 'stone_1', 'stone_2', 'deer_1',
  'npc_king', 'npc_judge', 'npc_smith', 'npc_owner', 'npc_slave', 'npc_guard', 'npc_priest', 'npc_farmer', 'npc_overseer', 'npc_runaway', 'npc_trader'];
const AREAS = { village: [0, 0], gate: [0, -27], forge: [13, -3], market: [-1, -13], altar: [-50, 30], paddy: [-50, -26], field: [46, -22], woods: [68, 28], tower: [40, 50], shore: [14, 54], ford: [10, 64], han: [8, 100], pass: [-6, -98] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'hancamp_1') fn({ isMesh: true, material: { name: 'han_tent' }, set visible(v) { shown.tent = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 군장 곁의 집(청동기 「우두머리 곁」, 곡식 3), 여자 — 넓은 논 → 쇠 창 → 그냥 잔다 → 값을 내준다 → 제단에 선다 → 지킨다 → 남쪽으로
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['coin', 'brawl', 'sale', 'drought']);
  ok(g.era === 'gojoseon-life', 'era 키');
  ok(g.flags.has('from:chief') && g.life.status === 'noble' && g.life.values.grain === 3 && g.life.values.craft === 3 && g.life.values.heart === 2, '청동기 갈림 from:chief → 군장 곁의 집, 곡식 전부·솜씨·인심 절반');
  goTo('paddy'); ok(opened('harvest'), '거둠 상황'); closeCard();
  use('smallpaddy_1'); ok(!g.flags.has('cut:small') && S.says.at(-1).includes('농민 집'), '군장 곁은 작은 논 못 딴다(신분 회색)');
  goTo('village'); use('stone_1'); use('slab_1'); ok(g.has('sickle'), '돌낫');
  goTo('paddy'); use('bigpaddy_1'); ok(g.count('grain') === 5 && done('harvest') && g.life.values.craft === 4, '넓은 논 다섯 단 → 솜씨 4'); closeCard();
  goTo('market'); ok(opened('brawl'), '섞여: 장터 싸움'); closeCard(); ok(g.promptFor(ix.get('stall_1')).verb.includes('주먹'), '밀친 사람 → 주먹'); Math.random = () => 0.99; use('stall_1'); ok(g.flags.has('brawl:lose') && done('brawl') && g.life.values.grain === 4, '졌다 → 상대가 곡식으로 갚아 +1 = 4'); Math.random = () => 0.01; closeCard();
  goTo('shore'); ok(opened('iron') && !opened('coin'), '쇠 상황(명도전은 쇠 뒤)'); closeCard();
  use('npc_trader'); ok(btn('쇠 창') && !btn('쇠 창').disabled && btn('쇠 덩이').disabled && btn('주인 심부름').disabled, '군장 곁: 창 열림·덩이·심부름 회색'); pick('쇠 창'); ok(done('iron') && g.has('ironspear') && g.life.values.grain === 1, '쇠 창 → 곡식 -3 = 1'); closeCard();
  goTo('shore'); ok(opened('coin'), '섞여: 명도전'); closeCard(); use('coinstall_1'); ok(done('coin') && g.has('coin') && g.life.values.grain === 0, '명도전 → 곡식 0'); closeCard();
  await settle(260); ok(g.flags.has('night:1') && opened('night'), '밤 → 곳간 상황'); closeCard();
  ok(g.promptFor(ix.get('granary_1')).verb.includes('몰래'), '곳간 → 몰래 꺼낸다'); ok(g.promptFor(ix.get('slavehut_1')).verb === '살펴보기', '군장 곁은 종의 집에서 못 잔다');
  goTo('village'); use('spot_1'); ok(done('night') && g.flags.has('night:sleep') && g.life.values.heart === 3, '그냥 잤다 → 인심 3'); closeCard();
  await settle(260); ok(g.flags.has('court:on') && opened('court'), '법 앞에서'); closeCard();
  use('npc_judge'); ok(S.says.at(-1).includes('먼저 법을'), '법을 먼저 들어야'); use('lawstone_1'); ok(g.flags.has('law:heard'), '8조법 들음');
  use('npc_judge'); ok(!btn('법대로').disabled && !btn('값을 내준다').disabled && btn('값을 보탠다').disabled && btn('풀려날 값').disabled, '군장 곁: 법대로·내준다 열림, 보탠다·묻는다 회색');
  pick('값을 내준다'); ok(!done('court') && S.says.at(-1).includes('손에 있어야') && g.count('grain') === 1, '벼 세 단 없으면 못 낸다(한 단도 안 사라짐) ' + S.says.at(-1)); S.panel = null;
  g.inventory.push('grain', 'grain', 'grain'); g.life.add('grain', 3); goTo('village'); use('npc_judge'); pick('값을 내준다'); ok(done('court') && g.flags.has('court:pay') && g.life.values.heart === 6 && g.life.values.grain === 0, '값을 내줬다 → 인심 6'); closeCard();
  goTo('market'); ok(opened('sale'), '섞여: 종을 판다'); closeCard(); use('npc_owner'); ok(!btn('산다').disabled, '군장 곁은 종을 살 수 있다'); pick('본다'); ok(done('sale'), '봤다'); closeCard();
  await settle(260); ok(g.flags.has('rite:on') && opened('heaven'), '하늘 제사'); closeCard();
  goTo('altar'); ok(!opened('drought'), '가뭄은 제사 뒤'); use('sacredtree_1'); ok(g.flags.has('seen:tree'), '신단수 📖');
  use('npc_priest'); ok(!btn('제단에 선다').disabled && !btn('무녀 곁').disabled && btn('땔감').disabled, '군장 곁 여자: 제단·무녀 열림, 땔감 회색'); pick('제단에 선다'); ok(done('heaven') && g.flags.has('rite:stand') && g.life.values.heart === 8, '제단에 섰다 → 인심 8'); closeCard();
  goTo('altar'); ok(opened('drought'), '섞여: 가뭄'); closeCard(); use('npc_priest'); pick('논으로 가서'); ok(done('drought') && g.flags.has('drought:ditch'), '가뭄 → 도랑'); closeCard();
  await settle(260); ok(g.flags.has('war:on') && opened('war') && shown.tent === true, '한나라가 온다 + 천막 보임'); closeCard();
  ok(g.promptFor(ix.get('hancamp_1')).name === '한나라 진영', '강 건너 → 한나라 진영');
  goTo('gate'); use('npc_guard'); ok(btn('싸움에 나간다').disabled && btn('싸움에 나간다').reason.includes('남자'), '싸움 = 여자 회색 + 이유'); S.panel = null;
  use('npc_king'); pick('지킵니다'); ok(done('war') && g.flags.has('war:hold') && g.life.values.heart === 9, '군장 곁에서 지킨다'); closeCard();
  await settle(420); ok(g.flags.has('fall:on') && opened('fall'), '한 해 뒤'); closeCard();
  goTo('pass'); ok(g.promptFor(ix.get('pass_1')).verb.includes('남쪽'), '고개 → 남쪽으로'); use('pass_1'); ok(done('fall') && g.flags.has('fall:south'), '남쪽으로'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:lord_south'), '끝: 남쪽으로 간 우두머리 집'); ok(S.panels.at(-1).includes('🏠 군장 곁의 집'), '끝 카드에 신분');
  const carry = JSON.parse(store['kworld_carry:gojoseon-life']); ok(carry.branch === 'lord_south' && carry.status === 'noble', '삼국으로 넘길 값에 갈림·신분');
}
// ===== 판 2: 종의 집(청동기 「빚진 집」), 남자 — 주인 밭 → 심부름 → 지키며 잔다 → 값을 묻는다 → 땔감 → 전쟁에 도망(실패 → 절뚝 / 성공 → 풀려남) → 남쪽
store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'slave', status: 'poor' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['runaway', 'coin', 'brawl', 'hoe'], 'foot');
  ok(g.flags.has('from:slave') && g.life.status === 'slave' && g.flags.has('status:slave'), '청동기 빚진 집 → 종의 집');
  goTo('paddy'); closeCard(); use('bigpaddy_1'); ok(!g.flags.has('cut:big'), '종은 군장 논 못 딴다'); goTo('village'); use('stone_1'); use('slab_1'); goTo('field'); use('masterfield_1'); ok(done('harvest') && g.count('grain') === 1 && g.flags.has('cut:slave'), '주인 밭 → 넷 중 하나'); closeCard();
  goTo('forge'); ok(!opened('hoe'), '섞여 「빌린 괭이」는 종에게 안 열린다(if)');
  goTo('shore'); closeCard(); closeCard(); use('npc_trader'); ok(btn('쇠 괭이').disabled && btn('쇠 괭이').reason.includes('종'), '종은 쇠를 못 산다(회색+이유)'); pick('주인 심부름'); ok(done('iron') && g.flags.has('iron:carry') && g.life.values.heart === 1, '심부름 → 인심 1'); closeCard();
  await settle(260); closeCard(); goTo('village'); ok(g.promptFor(ix.get('slavehut_1')).verb.includes('지키며'), '종의 집 → 지키며 잔다'); use('slavehut_1'); ok(done('night') && g.flags.has('night:guard'), '지키며 잤다'); closeCard();
  await settle(260); closeCard(); use('lawstone_1'); use('npc_judge'); ok(btn('풀려날 값').length !== 0 && !btn('풀려날 값').disabled && btn('법대로').disabled, '종: 값을 묻는다 열림·법대로 회색'); pick('풀려날 값'); ok(done('court') && g.flags.has('court:ask'), '풀려날 값을 물었다'); closeCard();
  goTo('woods'); ok(opened('runaway'), '섞여: 도망 노비'); closeCard(); use('npc_runaway'); pick('말을 기억'); ok(done('runaway') && g.flags.has('run:tempt'), '같이 가자는 말'); closeCard();
  await settle(260); closeCard(); goTo('altar'); use('npc_priest'); ok(btn('제단에 선다').disabled && btn('땔감').length !== 0 && !btn('땔감').disabled, '종: 제단 회색·땔감 열림'); pick('땔감'); ok(done('heaven') && g.flags.has('rite:wood'), '땔감을 날랐다'); closeCard();
  await settle(260); ok(opened('war'), '한나라'); closeCard();
  goTo('woods'); ok(g.promptFor(ix.get('hollow_1')).verb.includes('도망'), '바위 밑 → 도망'); Math.random = () => 0.99; use('hollow_1'); ok(g.flags.has('run:caught') && g.life.hurt.has('leg') && done('war'), '잡혔다 → 절뚝 + 전쟁 상황 끝'); Math.random = () => 0.01; closeCard();
  ok(g.life.status === 'slave', '아직 종');
  await settle(420); closeCard(); goTo('pass'); use('pass_1'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:slave_still'), '끝: 종의 집 — 주인이 바뀌었다(도망 실패)');
}
// ===== 판 3: 농민(청동기 농민), 남자 — 곳간을 몰래 열다 잡힘 → 도둑 흔적 → 법 앞에서 값이 없어 종이 됨(신분이 삶 중간에 바뀜) → 전쟁에 값 대신 싸워 풀려남
store['kworld_carry:bronze-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'farmer', status: 'farmer' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['coin'], 'belly');
  ok(g.life.status === 'farmer', '농민의 집');
  goTo('paddy'); closeCard(); goTo('village'); use('stone_1'); use('slab_1'); goTo('paddy'); use('smallpaddy_1'); ok(done('harvest') && g.count('grain') === 2, '작은 논 두 단'); closeCard();
  goTo('shore'); closeCard(); closeCard(); use('npc_trader'); pick('안 산다'); ok(done('iron') && g.flags.has('iron:no'), '돌로 버틴다'); closeCard();
  await settle(260); closeCard(); goTo('village'); Math.random = () => 0.99; use('granary_1'); ok(g.flags.has('steal:caught') && g.life.hurt.has('thief') && done('night'), '잡혔다 → 흔적 「도둑」'); Math.random = () => 0.01; closeCard();
  await settle(260); closeCard(); use('npc_guard'); ok(S.says.at(-1).includes('얼굴')); use('lawstone_1'); use('npc_judge'); ok(btn('값을 치른다') && btn('값을 치른다').disabled && btn('값을 치른다').reason.includes('다섯'), '벼 다섯 단 없음 → 값 회색'); pick('…값이 없다'); ok(done('court') && g.flags.has('court:enslaved') && g.life.status === 'slave' && g.flags.has('status:slave') && !g.flags.has('status:farmer'), '종이 됐다 — 신분이 삶 중간에 바뀜'); closeCard();
  await settle(260); closeCard(); goTo('altar'); use('npc_priest'); ok(btn('땔감') && !btn('땔감').disabled, '이제 종 → 땔감 열림'); pick('땔감'); closeCard();
  await settle(260); closeCard(); goTo('gate'); use('npc_guard'); ok(btn('값 대신 싸운다') && !btn('값 대신 싸운다').disabled, '종 남자 → 값 대신 싸운다'); pick('값 대신'); ok(done('war') && g.flags.has('war:slavefight') && g.flags.has('free:now') && g.life.status === 'farmer', '싸워서 풀려남 → 농민'); closeCard();
  await settle(420); closeCard(); goTo('gate'); use('npc_guard'); pick('남는다'); ok(done('fall') && g.flags.has('fall:stay'), '남았다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:freed'), '끝: 풀려난 집');
}
console.log(`gojoseon life 고리: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
