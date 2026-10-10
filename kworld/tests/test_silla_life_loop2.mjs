// 통일신라·발해 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(정전 마을·종 공방·등탑 섬·옛 성터·포석정·말갈 마을·숯 골)의 상황 일곱을 강제로 켜서 네 판(진골 여자 / 노비 남자 / 6두품 남자 / 발해 말갈). 골품·성별·나라 회색·종 보임·등불 보임·목책 보임·노비 도망·두품의 벼슬 천장을 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:samguk-life': JSON.stringify({ craft: 4, heart: 6, grain: 9, branch: 'noble_silla', status: 'noble', nation: 'silla' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['jingolgate_1', 'slavehut_1', 'census_1', 'mulberry_1', 'ox_1', 'well_1', 'stone_1', 'dyestall_1', 'tangstall_1', 'stall_1', 'exam_1', 'pagoda_1', 'grotto_1', 'stonepile_1', 'offering_1', 'stair_1', 'bigpaddy_1', 'smallpaddy_1', 'hojokgranary_1', 'hojokgate_1', 'ship_1', 'tradepile_1', 'fish_1', 'redcamp_1', 'mound_1', 'stoneman_1', 'hollow_1', 'log_1', 'pass_1', 'flags_1',
  'deedstone_1', 'bellmold_1', 'glasskiln_1', 'lamptower_1', 'fortsite_1', 'poseok_1', 'horses_1', 'sables_1', 'charkiln_1',
  'npc_lord', 'npc_clerk', 'npc_census', 'npc_slave', 'npc_trader', 'npc_teacher', 'npc_choe', 'npc_monk', 'npc_mason', 'npc_minister', 'npc_farmer', 'npc_hojok', 'npc_jangbogo', 'npc_envoy', 'npc_rebel', 'npc_keeper', 'npc_runaway', 'npc_passguard', 'npc_tiller', 'npc_bellmaster', 'npc_lightkeeper', 'npc_fortbuilder', 'npc_poet', 'npc_malgalchief', 'npc_charcoalman'];
const AREAS = { village: [0, 0], market: [20, -16], gukhak: [-28, 12], temple: [-58, 38], office: [36, 32], paddy: [-46, -36], hojok: [64, -26], shore: [18, -60], ford: [56, -67], hill: [70, -104], tomb: [72, 62], woods: [-84, 78], pass: [2, 106], outer: [-34, 58], workshop: [-14, 40], islet: [-20, 78], newfort: [-90, 40], poseok: [-56, 8], malgal: [-62, -88], charcoal: [92, 50] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'bellmold_1') fn({ isMesh: true, material: { name: 'bell_bronze' }, set visible(v) { shown.bell = v; } }); if (name === 'lamptower_1') fn({ isMesh: true, material: { name: 'lamp_fire' }, set visible(v) { shown.lamp = v; } }); if (name === 'fortsite_1') fn({ isMesh: true, material: { name: 'new_palisade' }, set visible(v) { shown.pal = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
  const on = (...flags) => { g.flags.add(...flags); for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const settle = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const MIX = ['jeongjeon', 'bell', 'lamp', 'newfort', 'poseok', 'malgal', 'charcoal'];

// ===== 판 1: 신라 진골 여자(곡식 9) — 녹읍 되찾기 · 시주(🎖) · 탑 높이기 · 담비 가죽 · 잔치 · 숯 사기 · 나라에 알리기
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX);
  ok(g.life.situations.length === 14 && Object.keys(g.world.areas).length === 20, '꼭 7 + 새 7 · 구역 20'); ok(g.life.status === 'jingol' && g.flags.has('nation:silla'), '신라 진골');
  goTo('outer'); ok(!opened('jeongjeon'), '촌락문서 전엔 정전 안 열림');
  on('sit:census:done'); goTo('outer'); ok(opened('jeongjeon'), '정전'); closeCard(); useR('npc_tiller', '녹읍을'); ok(!btn('녹읍을')?.disabled && btn('정전 문서를')?.disabled && btn('관료전')?.disabled, '진골: 녹읍 열림·정전·관료전 회색'); const g0 = g.life.values.grain; pick('녹읍을'); closeCard(); ok(done('jeongjeon') && g.flags.has('jj:nogeup') && g.life.values.grain === g0 + 2, '녹읍 → 🌾+2');
  goTo('malgal'); ok(opened('malgal'), '말갈 마을'); closeCard(); useR('npc_malgalchief', '담비'); ok(!btn('담비')?.disabled && btn('말똥')?.disabled && !btn('수령을'), '신라 진골: 담비 열림·말똥 회색·발해 선택 없음'); pick('담비'); closeCard(); ok(done('malgal') && g.flags.has('mg:sable'), '담비 가죽');
  on('sit:exam:done'); goTo('poseok'); ok(opened('poseok'), '포석정'); closeCard(); useR('npc_poet', '잔치에'); ok(!btn('잔치에')?.disabled && btn('시를 짓는다')?.disabled && btn('술을 나른다')?.disabled, '진골: 잔치 열림·시·술 회색'); pick('잔치에'); closeCard(); ok(done('poseok') && g.flags.has('ps:feast'), '잔치');
  on('sit:bulguksa:done'); goTo('workshop'); ok(opened('bell'), '종'); ok(shown.bell === false, '종은 처음엔 숨김'); closeCard(); useR('npc_bellmaster', '시주'); ok(!btn('시주')?.disabled && !btn('구리 그릇')?.disabled && btn('거푸집 흙')?.disabled, '진골 여자: 시주·그릇 열림·흙 회색'); const r0 = g.life.values.rank || 0; pick('시주'); closeCard(); ok(done('bell') && g.flags.has('bell:donate') && (g.life.values.rank || 0) === r0 + 1, '시주 → 🎖+1');
  on('sit:famine:done'); goTo('charcoal'); ok(opened('charcoal'), '숯'); closeCard(); ok(g.promptFor(g.e.interactables.get('charkiln_1')).verb === '살펴보기', '진골은 숯을 직접 안 굽는다'); useR('npc_charcoalman', '숯을 산다'); ok(!btn('숯을 산다')?.disabled && btn('숯을 굽는다')?.disabled, '진골: 사기 열림·굽기 회색'); pick('숯을 산다'); closeCard(); ok(done('charcoal') && g.flags.has('ch:buy'), '숯을 샀다');
  on('sit:sea:done'); goTo('islet'); ok(opened('lamp'), '등탑'); closeCard(); useR('npc_lightkeeper', '등탑을 더'); ok(!btn('등탑을 더')?.disabled && btn('섬에 숨는다')?.disabled, '진골: 탑 높이기 열림·숨기 회색'); pick('등탑을 더'); closeCard(); ok(done('lamp') && g.flags.has('lamp:build'), '탑을 높였다');
  on('sit:unrest:done'); goTo('newfort'); ok(opened('newfort'), '호족의 성'); closeCard(); useR('npc_fortbuilder', '나라에'); ok(!btn('나라에')?.disabled && btn('돌을 나른다')?.disabled && btn('목책을')?.disabled, '진골: 알리기 열림·돌·목책 회색'); pick('나라에'); closeCard(); ok(done('newfort') && g.flags.has('fort:report'), '나라에 알렸다');
  ok(['jeongjeon', 'bell', 'lamp', 'newfort', 'poseok', 'malgal', 'charcoal'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 신라 노비 남자(발 빠른) — 주인 땅 · 말똥 · 물길 치우기 · 흙 지기 · 주인 몫 숯 · 섬에 숨어 배 타기 → 풀려남 · (풀려난 농민) 돌 나르기
{
  store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'slave', status: 'slave', nation: 'silla' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'foot');
  ok(g.life.status === 'slave', '노비');
  on('sit:census:done'); goTo('outer'); closeCard(); useR('npc_tiller', '주인 땅'); ok(!btn('주인 땅')?.disabled && btn('정전 문서를')?.disabled, '노비: 주인 땅 열림·정전 회색'); pick('주인 땅'); closeCard(); ok(done('jeongjeon') && g.flags.has('jj:serve'), '주인 땅');
  goTo('malgal'); closeCard(); useR('npc_malgalchief', '말똥'); ok(!btn('말똥')?.disabled && btn('말을 산다')?.disabled, '노비: 말똥 열림·말 사기 회색'); pick('말똥'); closeCard(); ok(done('malgal') && g.flags.has('mg:dung'), '말똥');
  on('sit:exam:done'); goTo('poseok'); closeCard(); useR('poseok_1', '물길을'); closeCard(); ok(done('poseok') && g.flags.has('ps:clean'), '물길을 치웠다');
  on('sit:bulguksa:done'); goTo('workshop'); closeCard(); ok(g.promptFor(g.e.interactables.get('bellmold_1')).verb === '살펴보기', '노비(솜씨 1)는 쇳물 못 붓는다'); useR('npc_bellmaster', '거푸집 흙'); ok(!btn('거푸집 흙')?.disabled && btn('쇳물을')?.disabled, '노비: 흙 열림·쇳물 회색'); pick('거푸집 흙'); closeCard(); ok(done('bell') && g.flags.has('bell:mud'), '흙을 졌다');
  on('sit:famine:done'); goTo('charcoal'); closeCard(); useR('npc_charcoalman', '주인 몫'); pick('주인 몫'); closeCard(); ok(done('charcoal') && g.flags.has('ch:serve'), '주인 몫 숯');
  on('sit:sea:done'); goTo('islet'); closeCard(); ok(g.promptFor(g.e.interactables.get('lamptower_1')).verb === '살펴보기', '노비는 등불을 못 밝힌다'); useR('npc_lightkeeper', '섬에 숨는다'); ok(!btn('섬에 숨는다')?.disabled && btn('등불을')?.disabled, '노비: 숨기 열림·등불 회색'); pick('섬에 숨는다'); closeCard(); ok(done('lamp') && g.flags.has('lamp:hide') && g.life.status === 'farmer' && g.flags.has('free:now'), '섬에 숨어 배를 탔다 → 풀려남');
  on('sit:unrest:done'); goTo('newfort'); closeCard(); useR('npc_fortbuilder', '돌을 나른다'); ok(!btn('돌을 나른다')?.disabled && btn('호족 성으로')?.disabled, '풀려난 농민: 돌 열림·달아나기 회색'); pick('돌을 나른다'); closeCard(); ok(done('newfort') && g.flags.has('fort:carry'), '돌을 날랐다');
}
// ===== 판 3: 신라 6두품 남자(손 좋은, 솜씨 넘겨받아 ≥4) — 관료전 · 시 → 🎖 천장 3 · 쇳물 붓기(종 보임) · 숯 굽기 · 등불 밝히기(불 보임) · 호족에게 글 → 호족의 사람(천장 없음)
{
  store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 9, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'baekje' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'hand');
  ok(g.life.status === 'six' && g.life.values.craft >= 4, '6두품·솜씨 넷 이상');
  on('sit:census:done'); goTo('outer'); closeCard(); useR('npc_tiller', '관료전'); ok(!btn('관료전')?.disabled, '6두품: 관료전 열림'); pick('관료전'); closeCard(); ok(done('jeongjeon') && g.flags.has('jj:gwallyo'), '관료전');
  on('sit:exam:done'); g.life.values.rank = 3; goTo('poseok'); closeCard(); useR('npc_poet', '시를 짓는다'); ok(!btn('시를 짓는다')?.disabled, '6두품: 시 열림'); pick('시를 짓는다'); closeCard(); ok(done('poseok') && g.flags.has('ps:poem') && g.life.values.rank === 3 && g.flags.has('rank:capped'), '시 → 벼슬 천장 3 에서 멈춤');
  on('sit:bulguksa:done'); goTo('workshop'); closeCard(); ok(g.promptFor(g.e.interactables.get('bellmold_1')).verb.includes('쇳물'), '솜씨 넷 → 쇳물을 붓는다'); useR('bellmold_1', '쇳물'); closeCard(); ok(done('bell') && g.flags.has('bell:cast') && shown.bell === true, '종을 부었다 → 종 보임');
  on('sit:famine:done'); goTo('charcoal'); closeCard(); ok(g.promptFor(g.e.interactables.get('charkiln_1')).verb === '살펴보기', '6두품은 숯을 안 굽는다'); useR('npc_charcoalman', '숯을 산다'); pick('숯을 산다'); closeCard(); ok(done('charcoal'), '숯을 샀다');
  on('sit:sea:done'); goTo('islet'); closeCard(); ok(shown.lamp === false, '등불 숨김'); useR('lamptower_1', '등불을'); closeCard(); ok(done('lamp') && g.flags.has('lamp:light') && shown.lamp === true, '등불 밝힘 → 불 보임');
  on('sit:unrest:done'); goTo('newfort'); closeCard(); useR('npc_fortbuilder', '호족에게 글'); ok(!btn('호족에게 글')?.disabled && btn('돌을 나른다')?.disabled, '6두품: 글 열림·돌 회색'); pick('호족에게 글'); closeCard(); ok(done('newfort') && g.flags.has('fort:write') && g.life.status === 'retainer' && g.life.cap() == null, '글 → 호족의 사람(천장 없음)');
}
// ===== 판 4: 발해 말갈 남자 — 말 기르기 · 길잡이(🎖) · 숯 굽기 · 정전은 「본다」(발해 다스리는 집만 수령) / 발해 다스리는 집: 수령·촌 수령 · 호족 성 목책(retainer 뒤)
{
  store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 3, branch: 'north', status: 'farmer', nation: 'goguryeo' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'bal_folk' && g.flags.has('nation:balhae'), '발해 말갈');
  on('sit:census:done'); goTo('malgal'); closeCard(); useR('npc_malgalchief', '말을 기른다'); ok(!btn('말을 기른다')?.disabled && btn('말갈 마을에')?.disabled, '말갈: 기르기 열림·수령 회색'); pick('말을 기른다'); closeCard(); ok(done('malgal') && g.flags.has('mg:horse'), '말을 길렀다');
  goTo('outer'); closeCard(); useR('npc_tiller', '촌에 수령'); ok(btn('촌에 수령')?.disabled && btn('정전 문서를')?.disabled, '말갈: 수령·정전 회색'); pick('본다'); closeCard(); ok(done('jeongjeon') && g.flags.has('jj:watch'), '봤다');
  on('sit:sea:done'); goTo('islet'); closeCard(); useR('npc_lightkeeper', '발해 사신선'); ok(!btn('발해 사신선')?.disabled, '발해: 길잡이 열림'); const r0 = g.life.values.rank || 0; pick('발해 사신선'); closeCard(); ok(done('lamp') && g.flags.has('lamp:guide') && (g.life.values.rank || 0) === r0 + 1, '길잡이 → 🎖+1');
  on('sit:famine:done'); goTo('charcoal'); closeCard(); useR('charkiln_1', '숯을 굽는다'); closeCard(); ok(done('charcoal') && g.flags.has('ch:burn'), '숯을 구웠다');
  on('sit:unrest:done'); goTo('newfort'); closeCard(); ok(g.promptFor(g.e.interactables.get('fortsite_1')).verb === '살펴보기', '호족 집이 아니면 목책을 못 세운다'); g.life.setStatusTo('retainer'); ok(g.promptFor(g.e.interactables.get('fortsite_1')).verb.includes('목책'), '호족의 사람이 되면 목책'); useR('fortsite_1', '목책'); closeCard(); ok(done('newfort') && g.flags.has('fort:build') && shown.pal === true, '목책 → 보임');
}
console.log(`silla life 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
