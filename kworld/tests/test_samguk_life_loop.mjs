// 삼국·가야 인생 층 고리 시험 — 고조선 갈림(from:*)→나라·신분 → 7 상황 → 끝 카드. 나라별(진대법·화랑·순장 금지)·신분별·성별 회색, 군공으로 풀려남, 빚→노비를 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gojoseon-life': JSON.stringify({ craft: 6, heart: 4, grain: 5, branch: 'lord_south', status: 'noble' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ingot_1', 'granary_1', 'granary_2', 'fortgranary_1', 'slavehut_1', 'loom_1', 'decree_1', 'stall_1', 'saltstall_1', 'fortgate_1', 'wall_1', 'drum_1', 'spearrack_1', 'buddha_1', 'offering_1', 'bigpaddy_1', 'smallpaddy_1', 'lordfield_1', 'target_1', 'bowrack_1', 'pit_1', 'mound_1', 'hollow_1', 'log_1', 'ship_1', 'ironstall_1', 'stele_1', 'foecamp_1', 'pass_1', 'stone_1', 'stone_2', 'stone_3', 'fish_1',
  'npc_lord', 'npc_elder', 'npc_weaver', 'npc_smith', 'npc_overseer', 'npc_slave', 'npc_trader', 'npc_soldier', 'npc_monk', 'npc_farmer', 'npc_hwarang', 'npc_mourner', 'npc_rebel', 'npc_sailor', 'npc_borderguard'];
const AREAS = { village: [0, 0], market: [0, -17], forge: [21, -5], fortress: [0, 46], temple: [-54, 22], paddy: [-52, -32], archery: [44, -44], tomb: [62, 30], shore: [12, 62], ford: [10, 69], border: [8, 106], woods: [78, 76], pass: [-94, -86] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'foecamp_1') fn({ isMesh: true, material: { name: 'foe_tent' }, set visible(v) { shown.tent = v; } }); if (name === 'buddha_1') fn({ isMesh: true, material: { name: 'buddha_gold' }, set visible(v) { shown.gold = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
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

// ===== 판 1: 신라 귀족 여자(고조선 「남쪽으로 간 우두머리 집」) — 넓은 논 → 자주 비단 → 쇠 칼 → 위에서 시킨다 → 화랑(여자: 본다) → 비단을 낸다 → 빌려준다 → 성 안을 맡는다 → 남는다 → 신라 귀족 그대로
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['robe', 'hwarang', 'tomb', 'stele']);
  ok(g.era === 'samguk-life', 'era 키');
  ok(g.flags.has('from:lord_south') && g.life.nation === 'silla' && g.life.status === 'noble' && g.flags.has('nation:silla') && g.flags.has('sex:f') && g.life.values.grain === 5, '고조선 갈림 lord_south → 신라 귀족, 곡식 전부, 성별 깃발');
  goTo('paddy'); ok(opened('tax'), '세금 상황'); closeCard();
  use('smallpaddy_1'); ok(!g.flags.has('cut:small') && S.says.at(-1).includes('네 땅으로'), '귀족은 소작 논 못 딴다');
  goTo('village'); ok(g.promptFor(ix.get('loom_1')).verb.includes('베를'), '여자 → 베틀 「베를 짠다」'); use('stone_1'); use('decree_1'); ok(g.flags.has('law:heard'), '율령');
  g.inventory.push('sickle'); goTo('paddy'); use('bigpaddy_1'); ok(g.count('grain') === 5 && done('tax') && g.life.values.grain === 9, '넓은 논 다섯 단 → 곡식 9'); closeCard();
  goTo('market'); ok(opened('robe'), '섞여: 옷 색'); closeCard(); use('stall_1'); ok(done('robe') && g.has('silk') && g.life.values.grain === 7, '자주 비단 → 곡식 7'); closeCard();
  goTo('forge'); ok(opened('iron'), '덩이쇠'); closeCard(); use('npc_smith'); ok(btn('쇠 칼') && !btn('쇠 칼').disabled && btn('덩이쇠 —').disabled && btn('주인 심부름').disabled, '귀족: 칼 열림·덩이쇠·심부름 회색'); pick('쇠 칼'); ok(done('iron') && g.has('sword') && g.life.values.grain === 4, '쇠 칼 → 곡식 4'); closeCard();
  await settle(260); ok(g.flags.has('corvee:on') && opened('corvee'), '북소리 → 성 쌓기'); closeCard();
  goTo('fortress'); ok(g.promptFor(ix.get('wall_1')).verb === '살펴보기', '귀족은 돌을 안 진다'); use('npc_lord'); pick('노비 넷을'); ok(done('corvee') && g.flags.has('corvee:order'), '위에서 시켰다'); closeCard();
  goTo('archery'); ok(opened('hwarang'), '섞여: 화랑'); closeCard(); use('npc_hwarang'); ok(btn('들어간다').disabled && btn('들어간다').reason.includes('남자'), '여자 귀족: 화랑 회색+이유'); pick('본다'); ok(done('hwarang') && g.flags.has('hwa:watch'), '원화 이야기'); closeCard();
  await settle(260); ok(g.flags.has('temple:on') && opened('temple'), '탑이 섰다'); closeCard();
  goTo('temple'); use('npc_monk'); pick('절 짓는 데'); ok(!done('temple') && S.says.at(-1).includes('손에 있어야'), '곡식 없으면 비단도 못 낸다'); g.inventory.push('grain'); g.life.add('grain', 1); use('npc_monk'); ok(btn('절 짓는 데') && !btn('절 짓는 데').disabled, '여자 귀족: 비단 열림'); pick('절 짓는 데'); ok(done('temple') && g.flags.has('temple:donate') && g.life.values.heart === 4, '비단을 냈다 → 인심 4'); closeCard();
  await settle(420); ok(g.flags.has('night:1') && g.flags.has('famine:on') && opened('famine'), '밤 → 가을 흉년'); closeCard();
  goTo('village'); ok(g.promptFor(ix.get('granary_1')).verb === '살펴보기', '신라 → 진대법 없음'); g.inventory.push('grain', 'grain', 'grain'); g.life.add('grain', 3); use('npc_lord'); ok(btn('빌려준다') && !btn('빌려준다').disabled && btn('빌린다') === undefined, '귀족: 빌려준다 열림·빌린다 없음'); pick('빌려준다'); ok(done('famine') && g.flags.has('famine:lend') && g.life.values.heart === 7 && g.life.values.grain === 4 && g.count('grain') === 0, '빌려줬다 → 인심 7·곡식 4'); closeCard();
  await settle(260); ok(g.flags.has('war:on') && opened('war') && shown.tent === true, '한강 전쟁 + 천막 보임'); closeCard();
  goTo('fortress'); use('npc_lord'); ok(btn('앞장서겠습니다').disabled && btn('앞장서겠습니다').reason.includes('남자') && !btn('성 안을').disabled, '여자 귀족: 앞장 회색·성 안 열림'); pick('성 안을'); ok(done('war') && g.flags.has('war:nurse') && g.life.values.heart === 9, '성 안을 맡았다'); closeCard();
  await settle(420); ok(g.flags.has('fall:on') && opened('fall'), '나라의 끝'); closeCard();
  goTo('village'); ok(g.promptFor(ix.get('hollow_1')).verb === '살펴보기', '신라 사람은 부흥군 없음'); use('npc_elder'); pick('남는다'); ok(done('fall') && g.flags.has('fall:stay'), '남았다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:noble_silla'), '끝: 신라 귀족 그대로'); ok(S.panels.at(-1).includes('🏳️ 신라') && S.panels.at(-1).includes('🏠 귀족의 집'), '끝 카드에 나라·신분');
  const carry = JSON.parse(store['kworld_carry:samguk-life']); ok(carry.branch === 'noble_silla' && carry.status === 'noble' && carry.nation === 'silla', '통일신라로 넘길 값에 갈림·신분·나라');
}
// ===== 판 2: 가야 노비 남자(고조선 「종의 집」 → 남쪽 고개 x; from:slave_still) — 주인 논 → 심부름 → 주인 대신 돌 → 순장 구덩이(가야: 법 없음, 뛰다 잡힘 → 절뚝) → 절 일 → 곳간 지킴 → 주인 따라 나가 공 → 풀려남 → 신라로 → 풀려난 집
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'slave_still', status: 'slave' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['tomb', 'boat', 'craftsman', 'debt'], 'foot');
  ok(g.life.nation === 'silla' && g.life.status === 'slave', '종의 집 → 신라(기본) 노비');
}
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'south', status: 'slave' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['tomb', 'boat', 'craftsman', 'debt'], 'foot');
  ok(g.life.nation === 'gaya' && g.life.status === 'slave' && g.flags.has('status:slave'), '남쪽 고개 + 종 → 가야 노비');
  goTo('paddy'); closeCard(); use('bigpaddy_1'); ok(!g.flags.has('cut:big'), '노비는 귀족 논 못 딴다'); goTo('village'); ok(g.promptFor(ix.get('loom_1')).verb === '살펴보기', '노비 남자 → 베틀 안 됨'); g.inventory.push('sickle'); goTo('paddy'); use('lordfield_1'); ok(done('tax') && g.count('grain') === 1 && g.flags.has('cut:slave'), '주인 논 → 넷 중 하나'); closeCard();
  goTo('forge'); closeCard(); ok(g.promptFor(ix.get('ingot_1')).verb === '살펴보기', '가야여도 노비는 덩이쇠 못 진다'); use('npc_smith'); ok(btn('쇠 보습').disabled && btn('쇠 보습').reason.includes('노비'), '노비: 쇠 회색+이유'); pick('주인 심부름'); ok(done('iron') && g.flags.has('iron:carry'), '심부름'); closeCard();
  await settle(260); closeCard(); goTo('fortress'); ok(g.promptFor(ix.get('wall_1')).verb.includes('주인 대신'), '노비 → 주인 대신 돌'); use('wall_1'); ok(S.says.at(-1).includes('돌이 있어야'), '돌이 있어야'); goTo('village'); use('stone_1'); goTo('fortress'); use('wall_1'); ok(done('corvee') && g.flags.has('wall:slave'), '주인 대신 쌓았다'); closeCard();
  goTo('tomb'); ok(opened('tomb'), '섞여: 순장'); closeCard(); ok(g.promptFor(ix.get('pit_1')).verb.includes('뛴다'), '가야 노비 → 구덩이에서 뛴다(법 없음)'); Math.random = () => 0.99; use('pit_1'); ok(g.flags.has('tomb:caught') && g.life.hurt.has('leg') && done('tomb'), '뛰다 잡혔다 → 절뚝'); Math.random = () => 0.01; closeCard();
  await settle(260); closeCard(); goTo('temple'); use('npc_monk'); pick('절 일을'); ok(done('temple') && g.flags.has('temple:work'), '절 일'); closeCard();
  await settle(420); closeCard(); goTo('village'); ok(g.promptFor(ix.get('granary_1')).verb.includes('지키며'), '노비 → 곳간 지킨다'); use('granary_1'); ok(done('famine') && g.flags.has('famine:guard'), '지켰다'); closeCard();
  ok(!opened('debt'), '빚 없음 → 빚 상황 안 열림');
  await settle(260); closeCard(); goTo('fortress'); use('npc_soldier'); ok(btn('주인 따라') && !btn('주인 따라').disabled, '노비 남자 → 주인 따라'); pick('주인 따라'); ok(done('war') && g.flags.has('war:slavefight') && g.flags.has('free:now') && g.life.status === 'farmer', '공을 세워 풀려남 → 평민'); closeCard();
  await settle(420); closeCard(); goTo('village'); use('npc_elder'); ok(btn('성주 따라 신라로'), '가야 → 신라로'); pick('성주 따라'); ok(done('fall') && g.flags.has('fall:silla')); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:freed'), '끝: 풀려난 집(절뚝보다 먼저)');
}
// ===== 판 3: 고구려 평민 남자(from:north) — 소작 논 → 돌비(국경) → 쇠 보습 → 돌을 진다 → 쌀 올림 → 진대법 → 나가 싸운다(공) → 부흥군 ⚠ → 되살리려던 사람
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'north', status: 'farmer' });
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['stele', 'hwarang'], 'belly');
  ok(g.life.nation === 'goguryeo' && g.life.status === 'farmer', '북 → 고구려 평민');
  goTo('paddy'); closeCard(); g.inventory.push('sickle'); use('smallpaddy_1'); ok(done('tax') && g.count('grain') === 3 && g.life.values.grain === 3, '소작 논 세 단'); closeCard();
  goTo('border'); ok(opened('stele'), '섞여: 국경 비'); closeCard(); use('npc_borderguard'); pick('누구 땅'); ok(done('stele') && g.flags.has('stele:ask'), '국경은 날짜'); closeCard();
  goTo('forge'); closeCard(); use('npc_smith'); pick('쇠 보습'); ok(done('iron') && g.has('plow') && g.count('grain') === 1, '쇠 보습 → 곡식 둘 감'); closeCard();
  await settle(260); closeCard(); goTo('village'); use('stone_1'); goTo('fortress'); ok(g.promptFor(ix.get('wall_1')).verb === '돌을 쌓는다'); use('wall_1'); ok(done('corvee') && g.flags.has('wall:carry'), '돌을 졌다'); closeCard();
  goTo('archery'); closeCard(); use('npc_hwarang'); ok(!btn('들어간다'), '고구려 → 화랑 없음(훈련)'); pick('본다'); ok(done('hwarang')); closeCard();
  await settle(260); closeCard(); goTo('temple'); use('offering_1'); ok(done('temple') && g.flags.has('temple:offer') && g.count('grain') === 0, '쌀 올렸다'); closeCard();
  await settle(420); closeCard(); goTo('village'); ok(g.promptFor(ix.get('granary_1')).verb.includes('진대법'), '고구려 → 진대법'); use('granary_1'); ok(done('famine') && g.flags.has('famine:jindae') && g.count('grain') === 2 && !g.flags.has('debt:on'), '나라 곳간에서 빌림 — 빚 아님'); closeCard();
  await settle(260); closeCard(); ok(shown.tent === true); goTo('fortress'); use('npc_soldier'); ok(btn('나간다') && !btn('나간다').disabled && btn('가야는').disabled, '평민 남자: 나간다 열림·가야 회색'); pick('나간다'); ok(done('war') && g.flags.has('war:fight') && !g.life.hurt.has('wound'), '싸웠다 — 공'); closeCard();
  await settle(420); closeCard(); goTo('woods'); ok(g.promptFor(ix.get('hollow_1')).verb.includes('되살리'), '고구려 → 부흥군 길'); use('hollow_1'); ok(done('fall') && g.flags.has('fall:revolt')); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:rebel'), '끝: 되살리려던 사람 — 졌다(군공보다 먼저)');
}
// ===== 판 4: 백제 평민 여자(from:stay) — 베 짜기 → 안 산다 → 빠진다 → 안 간다 → 성주에게 빌림(빚) → 빚 갚는 날 못 갚음 → 노비 → 성 안에서 돕는다 → 남는다 → 빚의 집
store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 0, heart: 0, grain: 0, branch: 'stay', status: 'farmer' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['debt', 'robe'], 'eye');
  ok(g.life.nation === 'baekje' && g.life.status === 'farmer', '남음 → 백제 평민');
  goTo('paddy'); closeCard(); goTo('village'); use('loom_1'); ok(done('tax') && g.has('cloth') && g.flags.has('weave:done'), '베를 짰다 — 여자의 세금'); closeCard();
  goTo('market'); closeCard(); use('stall_1'); ok(!g.flags.has('robe:buy') && S.says.at(-1).includes('벌'), '평민: 자주 비단 못 산다(이유)'); use('npc_trader'); pick('본다'); ok(done('robe')); closeCard();
  goTo('forge'); closeCard(); use('npc_smith'); pick('안 산다'); ok(done('iron')); closeCard();
  await settle(260); closeCard(); goTo('fortress'); use('npc_soldier'); pick('…아픕니다'); ok(done('corvee') && g.flags.has('corvee:skip'), '빠졌다 → 벌'); closeCard();
  await settle(260); closeCard(); goTo('temple'); use('npc_monk'); pick('안 간다'); ok(done('temple')); closeCard();
  await settle(420); closeCard(); goTo('village'); use('npc_lord'); ok(btn('빌린다'), '백제 평민 → 성주에게 빌린다'); pick('빌린다'); ok(done('famine') && g.flags.has('debt:on') && g.count('grain') === 2, '빚'); closeCard();
  goTo('village'); ok(opened('debt'), '섞여: 빚 갚는 날'); closeCard(); use('npc_lord'); pick('…못 갚는다'); ok(done('debt') && g.flags.has('debt:slave') && g.life.status === 'slave', '못 갚아 노비 — 신분이 삶 중간에 바뀜'); closeCard();
  await settle(260); closeCard(); goTo('fortress'); use('npc_soldier'); ok(btn('성 안에서') && !btn('성 안에서').disabled && btn('주인 따라').disabled, '노비 여자: 성 안 열림·주인 따라 회색'); pick('성 안에서'); ok(done('war')); closeCard();
  await settle(420); closeCard(); goTo('village'); use('npc_elder'); pick('남는다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:slave_debt'), '끝: 빚의 집 — 노비');
}
console.log(`samguk life 고리: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
