// 삼국·가야 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(촌주 마을·덩이쇠 가마터·경당·시조 사당·피난 굴·불탄 마을 터·봉화 언덕)의 상황 일곱을 강제로 켜서 네 판(가야 귀족 여자 / 백제 노비 남자 / 고구려 평민 남자 / 신라 촌주·장인). 나라·신분·성별 회색·굴에서 강 건너기·새 지붕 보임·봉화 불 보임을 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gojoseon-life': JSON.stringify({ craft: 6, heart: 4, grain: 3, branch: 'south', status: 'noble' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['fire_1', 'anvil_1', 'ingot_1', 'granary_1', 'granary_2', 'fortgranary_1', 'slavehut_1', 'loom_1', 'decree_1', 'stall_1', 'saltstall_1', 'fortgate_1', 'wall_1', 'drum_1', 'spearrack_1', 'buddha_1', 'offering_1', 'bigpaddy_1', 'smallpaddy_1', 'lordfield_1', 'target_1', 'bowrack_1', 'pit_1', 'mound_1', 'hollow_1', 'stele_1', 'foecamp_1', 'pass_1', 'stone_1', 'fish_1', 'ironstall_1', 'ship_1', 'log_1',
  'tally_1', 'clothrack_1', 'ironkiln_1', 'ingotpile_1', 'books_1', 'shrine_1', 'shrinedrum_1', 'cave_1', 'rebuild_1', 'beacon_1',
  'npc_lord', 'npc_elder', 'npc_soldier', 'npc_monk', 'npc_smith', 'npc_farmer', 'npc_weaver', 'npc_overseer', 'npc_slave', 'npc_trader', 'npc_sailor', 'npc_hwarang', 'npc_mourner', 'npc_rebel', 'npc_borderguard', 'npc_villagechief', 'npc_ironmaster', 'npc_teacher', 'npc_shrinekeeper', 'npc_rebuilder', 'npc_beaconman'];
const AREAS = { village: [0, 0], market: [0, -17], forge: [21, -5], fortress: [0, 46], temple: [-54, 22], paddy: [-52, -32], archery: [44, -44], tomb: [62, 30], shore: [12, 62], ford: [10, 69], border: [8, 106], woods: [78, 76], pass: [-94, -86], hamlet: [-34, 70], ironworks: [40, 78], school: [-38, 4], shrine: [-70, -56], cave: [-104, 26], burnt: [-8, 64], beacon: [86, 22] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'rebuild_1') fn({ isMesh: true, material: { name: 'new_thatch' }, set visible(v) { shown.roof = v; } }); if (name === 'beacon_1') fn({ isMesh: true, material: { name: 'beacon_fire' }, set visible(v) { shown.fire = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const MIX = ['tally', 'ingot', 'school', 'shrine', 'cave', 'rebuild', 'beacon'];

// ===== 판 1: 가야 귀족 여자(고조선 「남쪽으로 간 우두머리 집」) — 더 걷으라 · 왜 배에 덩이쇠 · 담 밖에서 듣기 · 단에 서기 · 곡식 굴에 숨기기 · 망대 사람 · 노비 시켜 세우기(새 지붕 보임)
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX);
  ok(g.life.situations.length === 14 && Object.keys(g.world.areas).length === 20, '꼭 7 + 새 7 · 구역 20'); ok(g.life.status === 'noble' && g.flags.has('nation:gaya'), '가야 귀족');
  goTo('hamlet'); ok(!opened('tally'), '세금 전엔 촌주의 셈 안 열림');
  on('sit:tax:done'); goTo('hamlet'); ok(opened('tally'), '촌주의 셈'); closeCard(); useR('npc_villagechief', '촌주에게 더'); ok(!btn('촌주에게 더')?.disabled && btn('덜 적는다')?.disabled && btn('베 한 필')?.disabled, '귀족: 더 걷으라 열림·촌주 몫·평민 베 회색'); pick('촌주에게 더'); closeCard(); ok(done('tally') && g.flags.has('tally:press') && g.life.values.grain === 4, '더 걷으라 → 🌾+1');
  on('sit:iron:done'); goTo('ironworks'); ok(opened('ingot'), '덩이쇠'); closeCard(); useR('npc_ironmaster', '덩이쇠 열 장'); ok(!btn('덩이쇠 열 장')?.disabled && btn('가마를 맡는다')?.disabled && !btn('가마를 나라'), '가야: 왜 배 열림·가마 회색·「나라 것」 없음'); pick('덩이쇠 열 장'); closeCard(); ok(done('ingot') && g.flags.has('ingot:export') && g.life.values.grain === 7, '왜 배 → 🌾+3');
  on('sit:corvee:done'); goTo('school'); ok(opened('school'), '글'); closeCard(); useR('npc_teacher', '담 밖'); ok(!btn('담 밖')?.disabled && btn('글을 배운다')?.disabled, '여자: 담 밖 열림·글 배우기 회색'); pick('담 밖'); closeCard(); ok(done('school') && g.flags.has('school:listen'), '담 밖에서 들었다');
  on('sit:temple:done'); goTo('shrine'); ok(opened('shrine'), '시조 제사'); closeCard(); useR('npc_shrinekeeper', '제사 자리'); ok(!btn('제사 자리')?.disabled && btn('마을 몫')?.disabled && !btn('제사 음식')?.disabled, '귀족 여자: 단 열림·촌주 몫 회색·음식 열림'); pick('제사 자리'); closeCard(); ok(done('shrine') && g.flags.has('shrine:stand'), '단에 섰다');
  on('war:on'); goTo('beacon'); ok(opened('beacon'), '봉화'); closeCard(); useR('npc_beaconman', '망대 사람'); ok(!btn('망대 사람')?.disabled && !btn('횃불 가지')?.disabled, '귀족·여자: 망대·가지 열림'); pick('망대 사람'); closeCard(); ok(done('beacon') && g.flags.has('beacon:send'), '망대 사람을 보냈다');
  goTo('cave'); ok(opened('cave'), '피난 굴'); closeCard(); ok(g.promptFor(g.e.interactables.get('cave_1')).verb.includes('아이들과'), '여자 → 아이들과 숨는다(노비 도망은 안 뜸)'); useR('cave_1', '아이들과'); closeCard(); ok(done('cave') && g.flags.has('cave:hide'), '아이들과 숨었다');
  on('sit:war:done'); goTo('burnt'); ok(opened('rebuild'), '불탄 집'); ok(shown.roof === false, '새 지붕은 처음엔 숨김'); closeCard(); useR('npc_rebuilder', '노비를 시켜'); ok(!btn('노비를 시켜')?.disabled && btn('내 손으로')?.disabled, '귀족: 시키기 열림·내 손 회색'); pick('노비를 시켜'); closeCard(); goTo('burnt'); await settle(50); ok(done('rebuild') && g.flags.has('rebuild:order') && shown.roof === true, '노비를 시켰다 → 새 지붕 보임');
  ok(['tally', 'ingot', 'school', 'shrine', 'cave', 'rebuild', 'beacon'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 백제 노비 남자(발 빠른) — 촌주 집 일 · 풀무 · 마당 쓸기 · 땔감 · 봉화 올리기(불 보임) · 굴에서 강 건너기 성공 → 농민·풀려남 · 내 손으로(풀려난 뒤)
{
  store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'stay', status: 'slave' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'foot');
  ok(g.life.status === 'slave' && g.flags.has('nation:baekje'), '백제 노비');
  on('sit:tax:done'); goTo('hamlet'); closeCard(); useR('npc_villagechief', '촌주 집 일'); ok(!btn('촌주 집 일')?.disabled && btn('목간 모르는')?.disabled, '노비: 촌주 집 일 열림·빼돌리기 회색'); pick('촌주 집 일'); closeCard(); ok(done('tally') && g.flags.has('tally:serve'), '촌주 집 일');
  on('sit:iron:done'); goTo('ironworks'); closeCard(); useR('npc_ironmaster', '풀무'); ok(btn('가마를 나라')?.disabled && !btn('풀무')?.disabled && !btn('덩이쇠 열 장'), '백제: 나라 것 회색(노비)·풀무 열림·왜 배 없음'); pick('풀무'); closeCard(); ok(done('ingot') && g.flags.has('ingot:bellows'), '풀무를 밟았다');
  on('sit:corvee:done'); goTo('school'); closeCard(); useR('npc_teacher', '마당을'); ok(!btn('마당을')?.disabled && btn('글을 배운다')?.disabled, '노비: 마당 열림·글 회색'); pick('마당을'); closeCard(); ok(done('school') && g.flags.has('school:sweep'), '마당을 쓸었다');
  on('sit:temple:done'); goTo('shrine'); closeCard(); useR('npc_shrinekeeper', '땔감'); ok(!btn('땔감')?.disabled && btn('술과 춤')?.disabled, '노비: 땔감 열림·춤 회색'); pick('땔감'); closeCard(); ok(done('shrine') && g.flags.has('shrine:wood'), '땔감을 댔다');
  on('war:on'); goTo('beacon'); closeCard(); ok(shown.fire === false, '봉화 불 숨김'); useR('beacon_1', '봉화를'); closeCard(); ok(done('beacon') && g.flags.has('beacon:light') && shown.fire === true, '봉화를 올렸다 → 불 보임');
  goTo('cave'); closeCard(); ok(g.promptFor(g.e.interactables.get('cave_1')).verb.includes('강을 건넌다'), '노비 → 굴에서 강 건너기'); useR('cave_1', '굴에서'); closeCard(); ok(done('cave') && g.flags.has('cave:cross') && g.life.status === 'farmer' && g.flags.has('free:now'), '강 건너기 성공 → 농민·풀려남');
  on('sit:war:done'); goTo('burnt'); closeCard(); useR('npc_rebuilder', '내 손으로'); ok(!btn('내 손으로')?.disabled && btn('주인 집')?.disabled, '풀려난 농민: 내 손 열림·주인 집 회색'); pick('내 손으로'); closeCard(); ok(done('rebuild') && g.flags.has('rebuild:hand'), '내 손으로 올렸다');
}
// ===== 판 3: 고구려 평민 남자(눈) — 빼돌리기 · 숯 나르기 · 경당에서 글(평민도) · 술과 춤 · 올리지 않는다 · 굴 앞 지키기 · 굴에서 강 건너기 실패 길은 노비만
{
  store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'north', status: 'farmer' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'farmer' && g.flags.has('nation:goguryeo'), '고구려 평민');
  on('sit:tax:done'); goTo('hamlet'); closeCard(); useR('tally_1', '한 단을 빼돌린다'); closeCard(); ok(done('tally') && g.flags.has('tally:hide') && g.life.values.grain === 2, '목간 앞에서 빼돌렸다 → 🌾+1');
  on('sit:iron:done'); goTo('ironworks'); closeCard(); useR('npc_ironmaster', '숯을'); pick('숯을'); closeCard(); ok(done('ingot') && g.flags.has('ingot:carry'), '숯을 날랐다');
  on('sit:corvee:done'); goTo('school'); closeCard(); useR('npc_teacher', '글을 배운다'); ok(!btn('글을 배운다')?.disabled, '고구려 평민 남자: 경당 글 열림'); pick('글을 배운다'); closeCard(); ok(done('school') && g.flags.has('school:read'), '경당에서 글을 배웠다');
  on('sit:temple:done'); goTo('shrine'); closeCard(); useR('shrinedrum_1', '술과 춤'); closeCard(); ok(done('shrine') && g.flags.has('shrine:dance'), '큰북 곁 술과 춤');
  on('war:on'); goTo('beacon'); closeCard(); useR('npc_beaconman', '올리지'); ok(btn('망대 사람')?.disabled && btn('횃불 가지')?.disabled, '평민 남자: 망대·가지 회색'); const h0 = g.life.values.heart; pick('올리지'); closeCard(); ok(done('beacon') && g.flags.has('beacon:skip') && g.life.values.heart === h0 - 3, '올리지 않았다 → 🤝-3');
  goTo('cave'); closeCard(); ok(g.promptFor(g.e.interactables.get('cave_1')).verb.includes('굴 앞'), '평민 남자 → 굴 앞을 지킨다'); useR('cave_1', '굴 앞'); closeCard(); ok(done('cave') && g.flags.has('cave:guard'), '굴 앞을 지켰다');
}
// ===== 판 4: 신라 촌주(곡식 5) 남자 — 덜 적는다 · 나라 것 아님(촌주는 귀족 아님 → 숯) · 글 회색(귀족만) · 제상에 마을 몫 · 품앗이 // 장인은 가마·기와
{
  store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 5, branch: 'stay_farmer', status: 'farmer' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX);
  ok(g.life.status === 'chief' && g.flags.has('nation:silla'), '신라 촌주');
  on('sit:tax:done'); goTo('hamlet'); closeCard(); useR('npc_villagechief', '덜 적는다'); ok(!btn('덜 적는다')?.disabled && btn('촌주에게 더')?.disabled, '촌주: 덜 적기 열림·귀족 명령 회색'); const h0 = g.life.values.heart; pick('덜 적는다'); closeCard(); ok(done('tally') && g.flags.has('tally:less') && g.life.values.heart === h0 + 3 && g.life.values.grain === 4, '덜 적었다 → 🤝+3 🌾-1');
  on('sit:corvee:done'); goTo('school'); closeCard(); useR('npc_teacher', '글을 배운다'); ok(btn('글을 배운다')?.disabled, '신라 촌주 남자: 글 회색(귀족만)'); pick('본다'); closeCard(); ok(done('school') && g.flags.has('school:watch'), '봤다');
  on('sit:temple:done'); goTo('shrine'); closeCard(); useR('shrine_1', '마을 몫'); closeCard(); ok(done('shrine') && g.flags.has('shrine:offer') && g.life.values.grain === 3, '제상에 마을 몫 → 🌾-1');
  on('sit:war:done'); goTo('burnt'); closeCard(); useR('npc_rebuilder', '마을이 같이'); ok(!btn('마을이 같이')?.disabled, '촌주: 품앗이 열림'); pick('마을이 같이'); closeCard(); ok(done('rebuild') && g.flags.has('rebuild:together'), '품앗이');
}
// ===== 판 5: 고구려 장인 남자 — 가마를 맡는다(손) · 낫 고치기 · 기와 올리기
{
  store['kworld_carry:gojoseon-life'] = JSON.stringify({ craft: 6, heart: 2, grain: 1, branch: 'smith_north', status: 'smith' });
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX);
  ok(g.life.status === 'artisan', '장인');
  on('sit:tax:done'); goTo('hamlet'); closeCard(); useR('npc_villagechief', '낫을'); ok(!btn('낫을')?.disabled, '장인: 낫 고치기 열림'); pick('낫을'); closeCard(); ok(done('tally') && g.flags.has('tally:fix'), '낫을 고쳤다');
  on('sit:iron:done'); goTo('ironworks'); closeCard(); useR('ironkiln_1', '가마를'); closeCard(); ok(done('ingot') && g.flags.has('ingot:smelt'), '가마를 맡았다');
  on('sit:war:done'); goTo('burnt'); closeCard(); useR('npc_rebuilder', '기와를'); ok(!btn('기와를')?.disabled && btn('내 손으로')?.disabled, '장인: 기와 열림·내 손 회색'); pick('기와를'); closeCard(); ok(done('rebuild') && g.flags.has('rebuild:tile'), '기와를 올렸다');
}
console.log(`samguk life 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
