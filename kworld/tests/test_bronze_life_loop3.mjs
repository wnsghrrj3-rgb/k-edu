// 청동기 인생 층 고리 시험 3 — 10-14 넓히기 2: 새 장소 셋(무덤 언덕·채석 벼랑·옥 가는 집)의 섞여 상황 셋을 강제로 켜서 두 판(밭뙈기 집 → 앞줄에서 끈다·곳간 집 → 뒤에서 센다). WebGL 없이 규칙만.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const mkGame = (carry, sex) => {
  store['kworld_carry:neo'] = JSON.stringify(carry);
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map();
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
  ['fire_1', 'slab_1', 'granary_1', 'mold_1', 'sheaf_1', 'gatefront_1', 'npc_chief', 'npc_smith', 'npc_elder', 'npc_poor', 'npc_guard', 'npc_farmer', 'npc_tenant', 'npc_shaman', 'npc_trader', 'npc_neighbor', 'npc_digger', 'npc_lower', 'npc_borderman', 'npc_pounder', 'npc_waterwoman', 'npc_mourner', 'npc_quarryman', 'npc_jadeworker', 'jarcoffin_1', 'cist_1', 'wedge_1', 'rollers_1', 'jadebench_1', 'bluestone_1', 'stone_1', 'dolmensite_1', 'tower_1'].forEach(mk);
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  const areas = new Map(Object.entries({ village: [0, 0], gate: [0, -21], paddy: [-2, 46], dolmen: [-62, 4], tomb: [-64, 44], quarry: [94, -28], jade: [18, -78] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: sex };
  g.life.seed = 5; g.life.mixed = ['tomb', 'quarry', 'jade']; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  return { g, ix, S, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const drain = async (T) => { for (let i = 0; i < 3; i++) { T.closeCard(); await settle(); } };
Math.random = () => 0.01;

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  for (const id of ['tomb', 'quarry', 'jade']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 4 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택 넷마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name, `${id} 장소 ${s.place} 이름`);
    const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
    ok(s.choices.every((c) => setters.includes(`"${c.done}"`)), `${id} done 깃발이 NPC/대상에서 세워짐`);
  }
  ok(life.situations.filter((x) => !x.must).length === 19 && life.mixedCount === 6, '섞여 19 · 판마다 6');
  ok(items.items.bead?.bag, '대롱옥 물건');
  ok(world.scenery.grass.avoid.some((a) => a[0] === -64 && a[1] === 44), '무덤 언덕 풀 피하기(엔진 좌표)');
  const grayed = JSON.stringify(npcs.quarryman).includes('"if": "!status:rich"') || JSON.stringify(npcs.quarryman).includes('"if":"!status:rich"');
  ok(grayed && npcs.quarryman.lines[0].choices.filter((c) => c.if && c.gray).length === 2, '채석 벼랑 — 앞줄/세는 자리가 신분 회색');
}

// ---- 1판: 밭뙈기 집(곡식 0) 여자 — 곡식 길 회색, 앞줄에서 끈다, 옥을 간다
{
  const T = mkGame({ craft: 6, heart: 2, grain: 0 }, 'f'); const { g } = T;
  ok(g.life.status === 'poor', '곡식 0 → 밭뙈기 집');
  ok(g.life.situations.length === 10, '꼭 7 + 새 장소 3');
  T.goTo('tomb'); ok(!T.opened('tomb'), '흉년 전엔 무덤 언덕 안 열림'); T.goTo('quarry'); ok(!T.opened('quarry'), '고인돌 전엔 채석 벼랑 안 열림'); T.goTo('jade'); ok(!T.opened('jade'), '청동검 전엔 옥 가는 집 안 열림');
  g.flags.add('sit:famine:done'); g.flags.add('sit:dolmen:done'); g.flags.add('sit:sword:done');
  // 무덤 언덕
  T.goTo('tomb'); ok(T.opened('tomb'), '무덤 언덕 — 아이가 죽었다 열림'); await drain(T);
  T.use('npc_mourner'); ok(T.btn('곡식 한 줌')?.disabled, '곡식 0 — 곡식 넣기 회색'); const c0 = g.life.values.craft, hh = g.life.values.heart; T.pick('독 둘을'); await drain(T);
    ok(T.done('tomb') && g.flags.has('tomb:jar') && g.life.values.craft === c0 + 1 && g.life.values.heart === hh + 2, '독을 빚어 묻음(✋+1 🤝+2)');
  T.use('jarcoffin_1'); ok(!T.btn('독 둘을'), '끝난 뒤엔 독무덤 자리에 선택 판 없음'); await drain(T);
  // 채석 벼랑: 밭뙈기 집은 세는 자리 회색 → 앞줄에서 끈다(몸)
  T.goTo('quarry'); ok(T.opened('quarry'), '채석 벼랑 — 덮개돌을 뗀다 열림'); await drain(T);
  T.use('npc_quarryman'); ok(T.btn('뒤에서 센다')?.disabled, '밭뙈기 집 — 세는 자리 회색'); ok(T.btn('앞줄에서') && !T.btn('앞줄에서').disabled, '밭뙈기 집 — 앞줄 열림'); const h0 = g.life.values.heart; T.pick('앞줄에서'); await drain(T);
  ok(T.done('quarry') && g.flags.has('quarry:pull') && g.life.values.heart === h0 + 2 && !g.life.hurt.has('leg'), '앞줄에서 끌음(🤝+2, 굴림 성공이라 흔적 없음)');
  T.use('rollers_1'); ok(!T.btn('밧줄을'), '끝난 뒤엔 굴림대에 선택 판 없음'); await drain(T);
  // 옥 가는 집: 곡식 0 — 사기 회색 → 옥을 간다 → 대롱옥
  T.goTo('jade'); ok(T.opened('jade'), '옥 가는 집 — 옥을 간다 열림'); await drain(T);
  T.use('npc_jadeworker'); ok(T.btn('곡식을 주고')?.disabled, '곡식 0 — 사기 회색'); T.pick('옥을 간다'); await drain(T);
  ok(T.done('jade') && g.flags.has('jade:grind') && g.count('bead') === 1, '옥을 갈아 대롱옥 하나');
  ok(['tomb', 'quarry', 'jade'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
}

// ---- 2판: 곳간 집(곡식 3) 남자 — 앞줄 회색·뒤에서 센다, 곡식 넣기·옥 사기(🌾-2)
{
  const T = mkGame({ craft: 2, heart: 2, grain: 3 }, 'm'); const { g } = T;
  ok(g.life.status === 'rich', '곡식 3 → 곳간이 있는 집');
  g.flags.add('sit:famine:done'); g.flags.add('sit:dolmen:done'); g.flags.add('sit:sword:done');
  T.goTo('quarry'); await drain(T);
  T.use('npc_quarryman'); ok(T.btn('앞줄에서')?.disabled, '곳간 집 — 앞줄 회색'); ok(T.btn('뒤에서 센다') && !T.btn('뒤에서 센다').disabled, '곳간 집 — 세는 자리 열림'); const h0 = g.life.values.heart; T.pick('뒤에서 센다'); await drain(T);
  ok(T.done('quarry') && g.flags.has('quarry:count') && g.life.values.heart === h0 - 1, '뒤에서 셈(🤝-1)');
  T.goTo('tomb'); await drain(T); T.use('jarcoffin_1'); ok(T.btn('곡식 한 줌') && !T.btn('곡식 한 줌').disabled, '곡식 있으면 넣기 열림'); T.pick('곡식 한 줌'); await drain(T);
  ok(T.done('tomb') && g.flags.has('tomb:grain') && g.life.values.grain === 2, '곡식 한 줌 넣음(🌾-1)');
  T.goTo('jade'); await drain(T); T.use('npc_jadeworker'); ok(T.btn('곡식을 주고') && !T.btn('곡식을 주고').disabled, '곡식 2 — 옥 사기 열림'); T.pick('곡식을 주고'); await drain(T);
  ok(T.done('jade') && g.flags.has('jade:buy') && g.life.values.grain === 0 && g.count('bead') === 1, '곡식 둘로 옥 삼(🌾-2, 대롱옥)');
  // 굴림 실패 → 흔적: 밭뙈기 집으로 다시 — 앞줄에서 굴림대가 튀면 다리
  const U = mkGame({ craft: 0, heart: 0, grain: 0 }, 'm'); U.g.flags.add('sit:dolmen:done'); Math.random = () => 0.99;
  U.goTo('quarry'); await drain(U); U.use('rollers_1'); U.pick('밧줄을'); await drain(U);
    ok(U.done('quarry') && U.g.flags.has('quarry:crushed') && !U.g.flags.has('quarry:pull') && U.g.life.hurt.has('leg') && U.g.life.log.some((x) => x.sit === 'quarry' || x.id === 'quarry' || JSON.stringify(x).includes('crushed')), '앞줄에서 굴림 실패 → 다리 흔적(quarry:crushed, 상황은 끝남)');
  Math.random = () => 0.01;
}
console.log(`bronze 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
