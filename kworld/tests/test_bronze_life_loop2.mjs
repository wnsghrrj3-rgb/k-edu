// 청동기 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(바위그림 벼랑·환호 도랑 터·피난 골·아랫마을·경계 돌무더기·찧는 마당·샘터)의 상황 일곱을 강제로 켜서 두 판(곳간 집 여자 / 밭뙈기 집 남자).
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
  ['fire_1', 'slab_1', 'granary_1', 'mold_1', 'sheaf_1', 'gatefront_1', 'npc_chief', 'npc_smith', 'npc_elder', 'npc_poor', 'npc_guard', 'npc_farmer', 'npc_tenant', 'npc_shaman', 'npc_trader', 'npc_neighbor', 'npc_digger', 'npc_lower', 'npc_borderman', 'npc_pounder', 'npc_waterwoman', 'rockart_1', 'cliffaltar_1', 'moat_1', 'refuge_1', 'lowerfire_1', 'border_1', 'mortar_1', 'spring_1', 'stone_1', 'stone_2', 'bigpaddy_1', 'smallpaddy_1', 'field_1', 'ditch_1', 'copper_1', 'copper_2', 'rock_1', 'tin_1', 'charcoal_1', 'dolmensite_1', 'olddolmen_1', 'emptypit_1', 'tower_1', 'fish_1'].forEach(mk);
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  const areas = new Map(Object.entries({ village: [0, 0], gate: [0, -21], paddy: [-2, 46], field_s: [34, 40], valley: [66, 6], tin: [86, -10], dolmen: [-62, 4], woods: [-52, 60], shore: [28, -58], ford: [-6, -66], ford_s: [-6, -86], other: [-24, -96], tower: [58, 72], cliff: [90, 52], moat: [-26, -14], refuge: [-84, -30], lower: [-32, 44], border: [-70, 104], mill: [-34, -30], spring: [20, -22] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
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
const MIX = ['rockart', 'moat', 'raid', 'lower', 'border', 'mortar', 'spring'];
const btn = (S, label) => S.panel?.b.find((x) => x.label.startsWith(label));

// ===== 판 1: 곳간 집(곡식 3) 여자 — 소작 몫 · 샘 앞자리 · 사람 보내기 · 제단 앞 · 피난 골
{
  const { g, ix, S, use, pick, closeCard, goTo, opened, done } = mkGame('f', MIX);
  const useR = (name, label) => { use(name); if (!btn(S, label) && S.panel?.b.length === 1) { closeCard(); use(name); } };   // 꼭 나오는 상황 카드가 먼저 뜨면 닫고 한 번 더
  ok(g.life.situations.length === 14, '꼭 7 + 새 7'); ok(Object.keys(g.world.areas).length === 20, '구역 20'); ok(g.life.status === 'rich', '곳간 집');
  goTo('mill'); ok(!opened('mortar'), '이삭 전엔 찧는 마당 안 열림');
  g.flags.add('sit:rice:done'); g.life.onFlag();
  goTo('mill'); ok(opened('mortar'), '찧는 마당'); closeCard(); useR('npc_pounder', '소작'); ok(!btn(S, '소작 몫을 받는다')?.disabled, '곳간 집은 소작 몫 열림'); pick('소작 몫을 셋 중'); closeCard(); ok(done('mortar') && g.flags.has('mortar:third') && g.life.values.grain === 4, '셋 중 하나 → 🌾+1');
  goTo('border'); ok(opened('border'), '경계'); closeCard(); useR('npc_borderman', '「여기까지」'); pick('「여기까지」'); closeCard(); ok(done('border') && g.flags.has('border:agree'), '경계 — 손을 맞잡음');
  g.flags.add('sit:granary:done'); g.life.onFlag();
  goTo('lower'); ok(opened('lower'), '아랫마을'); closeCard(); useR('npc_lower', '여기로'); ok(btn(S, '여기로 내려와')?.disabled, '곳간 집은 아랫마을로 못 내려감(회색)'); pick('내 논에 일손'); closeCard(); ok(done('lower') && g.flags.has('lower:hire') && g.life.values.grain === 3, '일손 — 🌾-1');
  g.flags.add('sit:sword:done'); g.life.onFlag();
  goTo('spring'); ok(opened('spring'), '샘터'); closeCard(); useR('npc_waterwoman', '줄 맨'); ok(!btn(S, '줄 맨 앞')?.disabled, '곳간 집은 앞자리 열림'); pick('줄 맨 앞'); closeCard(); ok(done('spring') && g.flags.has('spring:first'), '샘 — 맨 앞');
  g.flags.add('sit:water:done'); g.life.onFlag();
  goTo('moat'); ok(opened('moat'), '환호'); closeCard(); useR('npc_digger', '우리 집 사람'); ok(!btn(S, '우리 집 사람')?.disabled, '곳간 집은 사람 보내기 열림'); pick('우리 집 사람'); closeCard(); ok(done('moat') && g.flags.has('moat:send'), '환호 — 사람을 보냄');
  g.flags.add('sit:dolmen:done'); g.life.onFlag();
  goTo('cliff'); ok(opened('rockart'), '바위그림'); closeCard(); useR('cliffaltar_1', '제단 앞에'); ok(!btn(S, '제단 앞에')?.disabled, '여자 → 제단 앞 열림'); pick('제단 앞에'); closeCard(); ok(done('rockart') && g.flags.has('rock:rite'), '바위그림 — 제사 자리');
  g.flags.add('sit:famine:done'); g.life.onFlag();
  goTo('village'); ok(opened('raid'), '습격 밤'); closeCard(); useR('npc_guard', '창을 들고'); ok(btn(S, '창을 들고')?.disabled, '여자는 문에서 창 회색'); S.panel = null; g.p.enabled = true;
  goTo('refuge'); useR('refuge_1', '아이들과'); pick('아이들과'); closeCard(); ok(done('raid') && g.flags.has('raid:hide'), '피난 골 — 숨었다');
  ok(['rockart', 'moat', 'raid', 'lower', 'border', 'mortar', 'spring'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 밭뙈기 집(곡식 0) 남자 — 품팔이 · 아랫마을로 · 차례 · 직접 판다 · 돌 옮기기 · 문에서 막다가 다침
{
  store['kworld_carry:neo'] = JSON.stringify({ craft: 2, heart: 2, grain: 0 });
  const { g, ix, S, use, pick, closeCard, goTo, opened, done } = mkGame('m', MIX);
  const useR = (name, label) => { use(name); if (!btn(S, label) && S.panel?.b.length === 1) { closeCard(); use(name); } };
  ok(g.life.status === 'poor', '밭뙈기 집');
  g.flags.add('sit:rice:done'); g.life.onFlag();
  goTo('mill'); closeCard(); useR('npc_pounder', '소작'); ok(btn(S, '소작 몫을 받는다')?.disabled, '밭뙈기 집은 소작 몫 회색'); pick('품을 팔아'); closeCard(); ok(done('mortar') && g.flags.has('mortar:labor'), '품팔이');
  goTo('border'); closeCard(); useR('npc_borderman', '「여기까지」'); pick('돌을 우리 쪽으로'); closeCard(); ok(done('border') && g.flags.has('border:push') && g.life.values.grain === 1, '돌 옮김 → 🌾+1 🤝-2');
  g.flags.add('sit:granary:done'); g.life.onFlag();
  goTo('lower'); closeCard(); useR('npc_lower', '여기로'); ok(!btn(S, '여기로 내려와')?.disabled && btn(S, '내 논에 일손')?.disabled, '밭뙈기 집은 내려가기 열림·일손 회색'); pick('여기로 내려와'); closeCard(); ok(done('lower') && g.flags.has('lower:join'), '아랫마을로');
  g.flags.add('sit:sword:done'); g.life.onFlag();
  goTo('spring'); closeCard(); useR('npc_waterwoman', '줄 맨'); ok(btn(S, '줄 맨 앞')?.disabled, '앞자리 회색'); pick('새 샘을'); closeCard(); ok(done('spring') && g.flags.has('spring:dig'), '새 샘을 팠다');
  g.flags.add('sit:water:done'); g.life.onFlag();
  goTo('moat'); closeCard(); useR('npc_digger', '우리 집 사람'); ok(btn(S, '우리 집 사람')?.disabled, '사람 보내기 회색'); pick('나도 판다'); closeCard(); ok(done('moat') && g.flags.has('moat:dig'), '직접 팠다');
  g.flags.add('sit:famine:done'); g.life.onFlag();
  Math.random = () => 0.99; g.life.tries = {};   // 몸 2 굴림이 세 번째면 자동 통과라 횟수를 비운다
  goTo('village'); closeCard(); useR('npc_guard', '창을 들고'); ok(!btn(S, '창을 들고')?.disabled, '남자는 창 열림'); pick('창을 들고'); closeCard(); ok(done('raid') && g.flags.has('raid:wound') && g.flags.has('hurt:leg'), '막다가 다침 → 절뚝');
  Math.random = () => 0.01;
  g.flags.add('sit:dolmen:done'); g.life.onFlag();
  goTo('cliff'); closeCard(); useR('cliffaltar_1', '제단 앞에'); ok(btn(S, '제단 앞에')?.disabled, '남자는 제사 자리 회색'); S.panel = null; g.p.enabled = true; useR('rockart_1', '돌로 쪼아'); pick('돌로 쪼아'); closeCard(); ok(done('rockart') && g.flags.has('rock:carve'), '바위에 새김');
}
console.log(`bronze life 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
