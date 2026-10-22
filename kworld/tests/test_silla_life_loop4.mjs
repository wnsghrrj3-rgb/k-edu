// 통일신라·발해 큰 사건 「독서삼품과 — 천장. 문이 닫히기 전에」(exam 깊이기 ⑤) — 급한 일 exam:late(6두품·두품 남자만) · 읽기는 끝이 아니다(read:top → 계단 세 단 → 천장에서 멈춤) · 재상 「한 단만 더」 회색(뼈)·당(눈 굴림)·호족 밑(신분 → 호족의 사람)·아찬으로 산다 · 평민 어깨너머 글자(눈) · 끝 갈림 21(late·six_tang 은 six_goryeo 앞·peek 는 drifter 앞) · 그 뒤 규칙 셋.
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
const IX = ['jingolgate_1', 'slavehut_1', 'census_1', 'mulberry_1', 'ox_1', 'well_1', 'stone_1', 'dyestall_1', 'tangstall_1', 'stall_1', 'exam_1', 'pagoda_1', 'grotto_1', 'stonepile_1', 'offering_1', 'stair_1', 'bigpaddy_1', 'smallpaddy_1', 'hojokgranary_1', 'hojokgate_1', 'ship_1', 'tradepile_1', 'fish_1', 'redcamp_1', 'mound_1', 'stoneman_1', 'hollow_1', 'log_1', 'pass_1', 'flags_1',
  'deedstone_1', 'bellmold_1', 'glasskiln_1', 'lamptower_1', 'fortsite_1', 'poseok_1', 'horses_1', 'sables_1', 'charkiln_1', 'icehouse_1', 'icecut_1', 'icebook_1', 'zen_1', 'stupa_1', 'seonwood_1', 'deed_1', 'manorfield_1', 'fence_1',
  'npc_lord', 'npc_clerk', 'npc_census', 'npc_slave', 'npc_trader', 'npc_teacher', 'npc_choe', 'npc_monk', 'npc_mason', 'npc_minister', 'npc_farmer', 'npc_hojok', 'npc_jangbogo', 'npc_envoy', 'npc_rebel', 'npc_keeper', 'npc_runaway', 'npc_passguard', 'npc_tiller', 'npc_bellmaster', 'npc_lightkeeper', 'npc_fortbuilder', 'npc_poet', 'npc_malgalchief', 'npc_charcoalman', 'npc_icekeeper', 'npc_seonmaster', 'npc_steward'];
const AREAS = { village: [0, 0], market: [20, 16], gukhak: [-28, -12], temple: [-58, -38], office: [36, -32], paddy: [-46, 36], hojok: [64, 26], shore: [18, 60], ford: [56, 67], hill: [70, 104], tomb: [72, -62], woods: [-84, -78], pass: [2, -106], outer: [-34, 58], workshop: [-14, 40], islet: [-20, 78], newfort: [-90, 40], poseok: [-56, 8], malgal: [-62, -88], charcoal: [92, 50], icehouse: [32, 46], seonam: [40, -96], manor: [-88, -6] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:samguk-life'] = JSON.stringify(carry); const mixed = ['ice', 'seon', 'manor'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { icehouse_1: 'ice_block', stupa_1: 'stupa_stone', fence_1: 'new_fence' };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (MAT[name]) fn({ isMesh: true, material: { name: MAT[name] }, set visible(v) { shown[name] = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; if (d?.hidden) g.showMats(t, d.hidden, false); }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const pick = (label) => { const b = btn(label); if (!b) { console.log('버튼 없음', label, S.panel?.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const useR = (name, label) => { use(name); if (!btn(label) && S.panel?.b.length === 1) { closeCard(); use(name); } };   // 꼭 나오는 상황 카드가 먼저 뜨면 닫고 한 번 더
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const drain = async (T) => { for (let i = 0; i < 3; i++) { T.closeCard(); await settle(); } };


const toExam = (T) => { T.g.flags.add('sit:census:open'); T.g.flags.add('sit:census:done'); T.g.life.opened.add('census'); T.g.life.done.add('census'); T.g.flags.add('exam:on'); T.g.life.onFlag(); T.goTo('gukhak'); T.closeCard(); };
const toEnd = async (T) => { for (const id of ['bulguksa', 'famine', 'sea', 'unrest']) { T.g.flags.add('sit:' + id + ':open'); T.g.flags.add('sit:' + id + ':done'); T.g.life.opened.add(id); T.g.life.done.add(id); } T.g.flags.add('fall:on'); T.g.life.onFlag(); T.goTo('pass'); T.closeCard(); T.g.flag('fall:stay'); T.closeCard(); await settle(); };
const endTitle = (T) => T.S.panels.find((h) => h.includes('이번 삶')) || T.S.panels.at(-1);
// ---- 데이터
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const dl = world.pulse.deadlines.find((d) => d.id === 'exam'); ok(dl && dl.sec === 90 && dl.on.includes('sex:m') && dl.on.includes('status:six || status:low') && dl.failFlag === 'exam:late' && dl.until.includes('exam:read:top'), '급한 일 「시험 날 — 국학 문」 90초 · 6두품·두품 남자만 · 읽으면 끝');
  const ex = life.situations.find((s) => s.id === 'exam'); ok(!ex.choices.some((c) => c.id === 'top') && ['low', 'stay', 'tang', 'tangfail', 'hojok', 'peek', 'late'].every((id) => ex.choices.some((c) => c.id === id && c.done === 'exam:' + id)) && ['low', 'stay', 'tang', 'tangfail', 'hojok', 'peek', 'late'].every((id) => { const c = ex.choices.find((x) => x.id === id); return c.fact && !/\d{3,4}/.test(c.fact); }) && ex.body.some((b) => b.startsWith('📜') && b.includes('계단은 아니다')) && ex.choices.find((c) => c.id === 'hojok').status === 'retainer', 'top 접음 · 길 일곱 · fact 연도 없음 · 📜 책은 공평·계단은 아니다 · 호족 밑 → 호족의 사람');
  const st = items.targets.stair.rename; ok(st.some((r) => r.flag === 'exam:climbed' && r.rank === 3 && r.if.includes('exam:read:top')) && st.some((r) => r.flag === 'exam:low' && r.if.includes('exam:read:low')) && items.targets.exam.rename.some((r) => r.flag === 'exam:read:top' && r.rollFailFlag === 'exam:read:low'), '시험 자리 → read:top/low · 계단에서 세 단(천장)/한 단');
  const mn = npcs.minister.lines.filter((l) => l.if?.startsWith('exam:climbed')); ok(mn.length === 2 && mn.every((l) => l.choices[0].if === 'status:jingol' && l.choices[0].gray.includes('뼈') && l.choices.some((c) => c.flag?.includes('exam:tang') && c.roll?.ab === '눈') && l.choices.some((c) => c.flag === 'exam:hojok') && l.choices.some((c) => c.flag === 'exam:stay')), '재상(계단 위): 6두품·두품 줄 — 「한 단만 더」는 뼈로 회색 · 당·호족·여기까지');
  const fl = life.situations.find((s) => s.id === 'fall'); ok(fl.choices.every((c) => { const ids = c.then.find((t) => t.end).end.branches.map((b) => b.id); return ids.length === 21 && ids.indexOf('six_tang') === ids.indexOf('six_goryeo') - 1 && ids.indexOf('late') === ids.indexOf('six_tang') - 1 && ids.indexOf('peek') === ids.indexOf('drifter') - 1; }), '끝 갈림 21 — late·six_tang 은 six_goryeo 앞·peek 는 drifter 앞(여섯 사본)');
  const rules = world.bridge.beats[1].rules; ok(['life:six_tang', 'life:peek', 'life:late'].every((f) => rules.some((r) => r.if === f)) && rules.findIndex((r) => r.if === 'life:six_tang') < rules.findIndex((r) => r.if === 'life:six_goryeo') && !rules.at(-1).if, '그 뒤 규칙 셋 · six_tang 이 six_goryeo 앞 · 마지막 무조건');
}
// ---- 판 1 — 6두품 남자: 상품 → 계단 세 단에서 멈춤 → 재상 「한 단만 더」 회색 → 당(굴림 성공) → 당에서 돌아온 집
{
  const T = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'eye'); const { g, S, ix, use, useR, pick, btn, closeCard, goTo, done } = T;
  toExam(T); ok(g.life.status === 'six' && g.life.cap() === 3 && T.opened('exam'), '6두품 · 천장 3 · 독서삼품과 열림'); ok(g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').on), '급한 일 조건: 6두품 남자는 선다');
  use('exam_1'); ok(g.flags.has('exam:read:top') && !done('exam'), '상품 — 아직 안 끝남'); ok(!g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').on) || g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').until), '읽으면 급한 일 끝');
  goTo('office'); use('stair_1'); ok(g.flags.has('exam:climbed') && g.life.values.rank === 3 && g.flags.has('rank:capped') && !done('exam'), '세 단 → 천장 3에서 발이 멈춤');
  use('stair_1'); ok(g.life.values.rank === 3 && !g.flags.has('exam:stay'), '다시 밟아도 더는 안 오른다·안 끝난다');
  use('npc_minister'); ok(btn('한 단만 더')?.disabled && btn('한 단만 더').reason.includes('뼈'), '「한 단만 더」 회색 — 책이 아니라 뼈'); const c0 = g.life.values.craft; pick('당으로'); ok(done('exam') && g.flags.has('exam:tang') && g.flags.has('tang:studied') && g.life.values.craft === c0 + 2 && g.life.values.rank === 3, '당 빈공과(눈 굴림 성공) → 솜씨 +2 · 벼슬은 천장 그대로'); closeCard();
  await toEnd(T); ok(g.flags.has('life:six_tang') && endTitle(T).includes('천장 밖에서 읽은 책'), '끝 갈림 「당에서 돌아온 집 — 천장 밖에서 읽은 책」');
}
// ---- 판 2 — 6두품 남자: 당 굴림 실패 → 3년 헛됨 🌾-1 · 하품 길
{
  Math.random = () => 0.99;
  const T = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'hand'); const { g, use, pick, closeCard, goTo, done } = T;
  toExam(T); use('exam_1'); ok(g.flags.has('exam:read:low') && !done('exam'), '눈 굴림 실패 → 하품(아직 안 끝남)');
  goTo('office'); ok(g.promptFor(T.ix.get('stair_1')).verb.includes('하품'), '계단 「하품, 한 단」'); use('stair_1'); ok(done('exam') && g.flags.has('exam:low') && g.life.values.rank === 1 && !g.flags.has('rank:capped'), '한 단 → 벼슬 1, 천장 아님'); closeCard();
  const U = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'eye'); Math.random = () => 0.01; toExam(U); U.use('exam_1'); U.goTo('office'); U.use('stair_1'); Math.random = () => 0.99;
  const gr = U.g.life.values.grain; U.use('npc_minister'); U.pick('당으로'); ok(U.done('exam') && U.g.flags.has('exam:tangfail') && U.g.life.values.grain === gr - 1, '당 굴림 실패 → 3년 헛됨 🌾-1'); U.closeCard();
  Math.random = () => 0.01;
}
// ---- 판 3 — 6두품 남자: 호족 밑으로 → 신분 「호족의 사람」, 끝은 retainer
{
  const T = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'eye'); const { g, use, pick, closeCard, goTo, done } = T;
  toExam(T); use('exam_1'); goTo('office'); use('stair_1'); const h = g.life.values.heart; use('npc_minister'); pick('호족 밑으로'); ok(done('exam') && g.flags.has('exam:hojok') && g.life.status === 'retainer' && g.life.values.heart === h + 1, '호족 밑 → 호족의 사람 · 🤝+1'); closeCard();
  await toEnd(T); ok(g.flags.has('life:retainer'), '끝 갈림 호족의 사람');
}
// ---- 판 4 — 5두품(촌주 집안) 남자: 상품이라도 한 단 — 재상 「한 단만 더」 회색
{
  const T = mkGame('m', { craft: 2, heart: 3, grain: 2, branch: 'chief', status: 'chief', nation: 'silla' }, 'eye'); const { g, use, pick, btn, closeCard, goTo, done } = T;
  toExam(T); ok(g.life.status === 'low' && g.life.cap() === 1, '5·4두품 · 천장 1'); use('exam_1'); goTo('office'); use('stair_1'); ok(g.life.values.rank === 1 && g.flags.has('rank:capped'), '상품이라도 한 단에서 멈춤');
  use('npc_minister'); ok(btn('한 단만 더')?.disabled && btn('여기서 삽니다'), '두품 줄: 「한 단만 더」 회색'); pick('여기서 삽니다'); ok(done('exam') && g.flags.has('exam:stay'), '여기서 산다'); closeCard();
}
// ---- 판 5 — 평민 남자: 급한 일 안 섬 · 박사 「마당을 쓸며 어깨너머로」(눈 성공) → peek → 담 너머로 글자를 배운 집 / 실패 → 돌아섬
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 0, branch: 'poor', status: 'poor', nation: 'silla' }, 'eye'); const { g, use, useR, pick, btn, closeCard, goTo, done } = T;
  toExam(T); ok(g.life.status === 'farmer' && !g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').on), '평민: 급한 일 조건 거짓(시험이 없다)');
  ok(g.promptFor(T.ix.get('exam_1')).verb === '살펴보기', '평민은 시험 자리 못 쓴다'); useR('npc_teacher', '마당을'); ok(btn('마당을') && btn('…돌아선다'), '박사: 마당을 쓸며 / 돌아선다'); pick('마당을'); ok(done('exam') && g.flags.has('exam:peek') && g.life.values.rank === 0, '어깨너머로 글자 → peek · 벼슬 0'); closeCard();
  await toEnd(T); ok(g.flags.has('life:peek') && endTitle(T).includes('담 너머로 글자'), '끝 갈림 「담 너머로 글자를 배운 평민의 집」');
  Math.random = () => 0.99; const U = mkGame('m', { craft: 1, heart: 1, grain: 0, branch: 'poor', status: 'poor', nation: 'silla' }, 'hand'); toExam(U); U.useR('npc_teacher', '마당을'); U.pick('마당을'); ok(U.done('exam') && U.g.flags.has('exam:none') && !U.g.flags.has('exam:peek'), '눈 굴림 실패 → 쫓겨남(돌아섬)'); U.closeCard(); Math.random = () => 0.01;
}
// ---- 판 6 — 6두품 남자: 급한 일 늦음 → 시험 날을 놓친 집 🌾-1 · 진골·여자는 급한 일 안 섬
{
  const T = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'eye'); const { g, closeCard, done } = T;
  toExam(T); const gr = g.life.values.grain; g.flag('exam:late'); ok(done('exam') && g.flags.has('exam:late') && g.life.values.grain === gr - 1 && g.life.values.rank === 0, '문이 닫혔다 → 🌾-1 · 벼슬 0'); closeCard();
  await toEnd(T); ok(g.flags.has('life:late') && endTitle(T).includes('시험 날을 놓친 집'), '끝 갈림 「시험 날을 놓친 집」');
  const F = mkGame('f', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }, 'eye'); toExam(F); ok(!F.g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').on), '6두품 여자: 급한 일 안 섬(계단은 남자)');
  const K = mkGame('m', { craft: 6, heart: 4, grain: 5, branch: 'noble_silla', status: 'noble', nation: 'silla' }, 'eye'); toExam(K); ok(K.g.life.status === 'jingol' && !K.g.cond(J('world').pulse.deadlines.find((d) => d.id === 'exam').on), '진골: 급한 일 안 섬(시험 없이 오른다)');
}
console.log(`silla 고리 4(천장): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
