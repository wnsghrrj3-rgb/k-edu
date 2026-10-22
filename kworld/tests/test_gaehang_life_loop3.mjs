// 개항~일제 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(야학·방직 공장 기숙사·토막 마을) 상황을 강제로 켜서 일곱 판(학생 남 / 옛 노비 여 / 지주 남 / 협력한 집 남 / 노동자 남 / 소작 남 / 실패 굴림). 직업·성별·솜씨 회색 · 숨김 재질 보임(칠판 한글·파업 천·새 지붕) · 값 변화 · 삶 중간 변화(날품→노동자·간도→이주민) · 실패 깃발. 데이터 전수(섞여 15·q·사실·done 세우는 곳).
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:joseon-late-life': JSON.stringify({ craft: 2, heart: 4, grain: 4, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['bank_1','bigpaddy_1','gaekju_1','gando_1','gongjang_1','gyohoe_1','hakgyo_1','hyeong_1','jijugate_1','jpshop_1','jusaeso_1','malmoi_1','mill_1','myeon_1','pier_1','sangil_1','segwan_1','ship_1','smallpaddy_1','sojakjip_1','yeok_1','yeondan_1',
  'npc_ahnjunggeun','npc_gaekju','npc_ijumin','npc_jeonbongjun','npc_jiju','npc_jpmerchant','npc_jusigyeong','npc_kimgu','npc_myeonseogi','npc_nodongja','npc_parkseongchun','npc_segwanwon','npc_seongyosa','npc_sojak','npc_sunsa','npc_yeogong','npc_yugwansun','npc_yundongju',
  'blackboard_1','horong_1','yahakbook_1','dormgate_1','dormroom_1','strike_1','torn_1','tomakfire_1','tomakbundle_1','npc_yahakgyosa','npc_gamdok','npc_tomakmin'];
const AREAS = { maeul: [-22, 16], jiju: [-29, 22], sojakjip: [-16, 1], outroad: [-56, 34], jangteo: [0, -12], gaekju: [-15, -11], ilbon: [0, -44], segwan: [0, -58], mill: [-20, -58], hang: [8, -84], gyohoe: [-46, -31], hakgyo: [-50, 2], jusaeso: [26, -27], myeon: [40, -8], deul: [55, 12], gongjang: [60, -39], hyeong: [90, -19], yeok: [20, 36], gando: [-104, 58], sangil: [-85, 88], yahak: [-70, -8], dorm: [59, -26], tomak: [-64, -56] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const HID = { blackboard_1: [['chalk_hangul', 'chalk']], strike_1: [['strike_cloth', 'strike']], torn_1: [['tomak_new', 'newroof']] };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { for (const H of HID[name] || []) fn({ isMesh: true, material: { name: H[0] }, set visible(v) { shown[H[1]] = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const MIX = ['yahak', 'dorm', 'tomak'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };
const ALL = ['sit:gaehang:done', 'sit:gabo:done', 'sit:eulsa:done', 'sit:toji:done', 'sit:taegeukgi:done', 'sit:samil:done', 'sit:changssi:done'];
const endOf = (g) => g.life.d.situations.find((s) => s.id === 'jingyong').choices[0].then[0].end;
const carry = (key) => JSON.parse(store['kworld_carry:gaehang-life'] || '{}')[key];

// ===== 데이터 전수: 섞여 15 · 새 상황 셋에 q 셋·📜 사실·기록 · done 깃발을 세우는 곳 · 회색 수 · status id 실재
{
  const life = J('life'), items = J('items'), npcs = J('npcs'), world = J('world');
  const mixed = life.situations.filter((s) => !s.must); ok(mixed.length === 15 && life.mixedCount === 4, '섞여 15 · mixedCount 4');
  const blob = JSON.stringify(items) + JSON.stringify(npcs);
  for (const id of MIX) { const s = life.situations.find((x) => x.id === id); ok(!!s && s.q.a.length === 3 && s.q.revisit && world.journal[id]?.note && s.choices.every((c) => c.fact && c.fact.includes('그래서') && !/\d{3,4}년/.test(c.fact) && c.journal === id), `상황 ${id} q·사실·기록`); for (const c of s.choices) ok(blob.includes(`"${c.done}"`), `${id}.${c.id} done 세우는 곳`); }
  const gray = (id) => npcs[id].lines[0].choices.filter((c) => c.if).length; ok(gray('yahakgyosa') === 6 && gray('gamdok') === 6 && gray('tomakmin') === 6, '회색 조건 6·6·6');
  const ids = new Set(life.status.rules.map((r) => r.id));
  for (const id of ['yahakgyosa', 'gamdok', 'tomakmin']) for (const c of npcs[id].lines[0].choices) { for (const f of (c.if || '').match(/status:(\w+)/g) || []) ok(ids.has(f.slice(7)), `${id} ${f} 실재`); if (c.status) ok(ids.has(c.status), `${id} 선택 신분 ${c.status} 실재`); }
  ok(['yahak', 'dorm', 'tomak'].every((a) => world.areas[a]) && world.danger.safe.some(([x, z]) => x === 59 && z === 29) && world.scenery.grass.avoid.some(([x, z]) => x === -64 && z === 56), '구역·밤 안전·풀 피하기');
}
// ===== 판 1: 학생 남자(눈 밝은) — 토지 조사 전엔 야학 안 열림 → 가르친다 → 칠판 한글 보임 🤝+2 🎖+1 · 기숙사는 「본다」(전부 회색) · 토막 구호미 🌾-1 🤝+2
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('haksaeng'); ok(g.life.status === 'haksaeng', '학생');
  ok(g.life.situations.length === 11 && Object.keys(g.world.areas).length === 23, '꼭 8 + 새 3 · 구역 23');
  goTo('yahak'); ok(!opened('yahak'), '토지 조사 전엔 야학 안 열림');
  on(...ALL); goTo('yahak'); ok(opened('yahak'), '야학'); closeCard(); ok(shown.chalk === false, '칠판 글씨는 처음엔 숨김');
  ok(verb(g, 'blackboard_1').includes('분필을 든다') && verb(g, 'horong_1') === '살펴보기' && verb(g, 'yahakbook_1').includes('책을 숨긴다'), '학생: 칠판 열림 · 호롱은 살펴보기 · 교본 열림');
  useR('npc_yahakgyosa', '가르친다'); ok(!btn('가르친다')?.disabled && !btn('순사가 왔다')?.disabled && btn('글을 배운다')?.disabled && btn('부인 야학')?.disabled && btn('호롱 기름')?.disabled && btn('주재소에')?.disabled, '학생 남자: 가르친다·책 숨기기 열림 · 배운다·부인·기름·알린다 회색'); S.panel = null;
  const r0 = g.life.values.rank, h0 = g.life.values.heart; useR('blackboard_1', '가르친다'); closeCard(); await drain(closeCard, goTo, 'yahak'); ok(done('yahak') && g.flags.has('yh:teach') && shown.chalk === true && g.life.values.rank === r0 + 1 && g.life.values.heart === h0 + 2, '가르친다 → 칠판 한글 보임 · 🎖+1 🤝+2');
  ok(verb(g, 'blackboard_1') === '살펴보기' && g.promptFor(g.e.interactables.get('blackboard_1')).name.includes('한글 두 줄'), '끝난 뒤 「칠판 — 한글 두 줄」');
  goTo('dorm'); ok(opened('dorm'), '기숙사'); closeCard(); ok(shown.strike === false && verb(g, 'dormgate_1') === '살펴보기' && verb(g, 'strike_1') === '살펴보기' && verb(g, 'dormroom_1') === '살펴보기', '파업 천 숨김 · 학생 남자(솜씨 2): 쪽문·사다리·창살 전부 살펴보기');
  useR('npc_gamdok', '본다'); ok(btn('여공으로')?.disabled && btn('파업에')?.disabled && btn('감독 자리')?.disabled && btn('딸을')?.disabled && btn('기숙사에 쌀')?.disabled && btn('기계를')?.disabled, '학생 남자: 기숙사 여섯 전부 회색'); pick('본다'); closeCard(); ok(done('dorm') && g.flags.has('dm:watch'), '봤다');
  goTo('tomak'); ok(opened('tomak'), '토막'); closeCard(); ok(shown.newroof === false && verb(g, 'tomakfire_1').includes('쌀을 푼다') && verb(g, 'torn_1') === '살펴보기' && verb(g, 'tomakbundle_1') === '살펴보기', '새 지붕 숨김 · 학생: 불 자리 열림(구호미) · 헐린 토막·짐은 살펴보기');
  useR('npc_tomakmin', '구호미'); ok(!btn('구호미')?.disabled && btn('토막을 다시')?.disabled && btn('날품')?.disabled && btn('헐라고')?.disabled && btn('물장사')?.disabled && btn('간도로')?.disabled, '학생 남자: 구호미 열림 · 나머지 회색'); const g0 = g.life.values.grain, h1 = g.life.values.heart; pick('구호미'); closeCard(); ok(done('tomak') && g.flags.has('tm:relief') && g.life.values.grain === g0 - 1 && g.life.values.heart === h1 + 2 && shown.newroof === false, '구호미 → 🌾-1 🤝+2 · 지붕은 그대로 숨김');
  g.life.end(endOf(g)); ok(g.flags.has('life:end') && carry('status') === 'haksaeng', '끝 카드 · 학생 넘김');
  ok(['yahak', 'dorm', 'tomak'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
}
// ===== 판 2: 옛 노비 여자(발 빠른, 솜씨 1) — 부인 야학 ✋+1 🤝+1 · 여공 🌾+2 🤝+1 · 토막 다시 짓기 → 새 지붕 보임 🤝+1
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 1, heart: 3, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'foot');
  ok(g.life.status === 'yetnobi', '옛 노비'); on(...ALL);
  goTo('yahak'); closeCard(); ok(verb(g, 'blackboard_1').includes('분필을 든다') && verb(g, 'horong_1') === '살펴보기', '옛 노비 여자: 칠판 열림(배운다·부인) · 호롱은 살펴보기'); useR('npc_yahakgyosa', '부인 야학'); ok(!btn('부인 야학')?.disabled && !btn('글을 배운다')?.disabled && !btn('순사가 왔다')?.disabled && btn('가르친다')?.disabled && btn('호롱 기름')?.disabled && btn('주재소에')?.disabled, '옛 노비 여자: 부인·배운다·숨기기 열림 · 가르친다·기름·알린다 회색'); const c0 = g.life.values.craft, h0 = g.life.values.heart; pick('부인 야학'); closeCard(); ok(done('yahak') && g.flags.has('yh:women') && g.life.values.craft === c0 + 1 && g.life.values.heart === h0 + 1 && shown.chalk === false, '부인 야학 → ✋+1 🤝+1 · 칠판 글씨는 안 보임');
  goTo('dorm'); closeCard(); ok(verb(g, 'dormgate_1').includes('문을 연다') && verb(g, 'strike_1').includes('지붕에 오른다') && verb(g, 'dormroom_1') === '살펴보기', '여자: 쪽문·사다리 열림 · 창살(기계)은 살펴보기'); useR('npc_gamdok', '여공으로'); ok(!btn('여공으로')?.disabled && !btn('파업에')?.disabled && !btn('딸을')?.disabled && btn('감독 자리')?.disabled && btn('기숙사에 쌀')?.disabled && btn('기계를')?.disabled, '옛 노비 여자 솜씨 2: 여공·파업·딸 열림 · 감독·쌀·기계 회색'); const g0 = g.life.values.grain, h1 = g.life.values.heart; pick('여공으로'); closeCard(); ok(done('dorm') && g.flags.has('dm:enter') && g.life.values.grain === g0 + 2 && g.life.values.heart === h1 + 1 && shown.strike === false, '여공 → 🌾+2 🤝+1 · 파업 천은 안 보임');
  goTo('tomak'); closeCard(); ok(verb(g, 'torn_1').includes('판자를 든다') && verb(g, 'tomakbundle_1').includes('짐을 진다') && verb(g, 'tomakfire_1').includes('쌀을 푼다'), '옛 노비 여자: 헐린 토막·짐·불 자리(빨래) 전부 열림'); useR('npc_tomakmin', '토막을 다시'); ok(!btn('토막을 다시')?.disabled && !btn('날품')?.disabled && !btn('물장사')?.disabled && !btn('간도로')?.disabled && btn('헐라고')?.disabled && btn('구호미')?.disabled, '옛 노비 여자: 짓기·날품·빨래·간도 열림 · 헐라고·구호미 회색'); const h2 = g.life.values.heart; pick('토막을 다시'); closeCard(); await drain(closeCard, goTo, 'tomak'); ok(done('tomak') && g.flags.has('tm:build') && shown.newroof === true && g.life.values.heart === h2 + 1, '다시 짓기 → 새 지붕 보임 · 🤝+1');
  ok(g.promptFor(g.e.interactables.get('torn_1')).name.includes('다시 선'), '끝난 뒤 「다시 선 토막」');
}
// ===== 판 3: 지주 남자(배 든든한, 쌀 5) — 호롱 기름 🌾-1 🤝+2 · 기숙사 쌀 🌾+1 · 토막 구호미(불 자리) — 가르친다·감독·날품 회색
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 5, rank: 1, branch: 'yangban', status: 'yangban', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'jiju', '지주'); on(...ALL);
  goTo('yahak'); closeCard(); ok(verb(g, 'horong_1').includes('기름을 댄다') && verb(g, 'blackboard_1') === '살펴보기' && verb(g, 'yahakbook_1') === '살펴보기', '지주: 호롱 열림 · 칠판·교본은 살펴보기'); useR('npc_yahakgyosa', '호롱 기름'); ok(!btn('호롱 기름')?.disabled && btn('가르친다')?.disabled && btn('글을 배운다')?.disabled && btn('부인 야학')?.disabled && btn('주재소에')?.disabled && btn('순사가 왔다')?.disabled, '지주 남자: 기름 열림 · 나머지 회색'); const g0 = g.life.values.grain, h0 = g.life.values.heart; pick('호롱 기름'); closeCard(); ok(done('yahak') && g.flags.has('yh:fund') && g.life.values.grain === g0 - 1 && g.life.values.heart === h0 + 2, '기름 → 🌾-1 🤝+2');
  goTo('dorm'); closeCard(); ok(verb(g, 'dormgate_1').includes('문을 연다') && verb(g, 'strike_1') === '살펴보기', '지주: 쪽문 열림(쌀) · 사다리는 살펴보기'); useR('npc_gamdok', '기숙사에 쌀'); ok(!btn('기숙사에 쌀')?.disabled && btn('감독 자리')?.disabled && btn('여공으로')?.disabled && btn('딸을')?.disabled && btn('파업에')?.disabled, '지주 남자: 쌀 열림 · 감독·여공·딸·파업 회색'); const g1 = g.life.values.grain; pick('기숙사에 쌀'); closeCard(); ok(done('dorm') && g.flags.has('dm:supply') && g.life.values.grain === g1 + 1, '쌀 → 🌾+1');
  goTo('tomak'); closeCard(); ok(verb(g, 'tomakfire_1').includes('쌀을 푼다') && verb(g, 'torn_1') === '살펴보기' && verb(g, 'tomakbundle_1') === '살펴보기', '지주: 불 자리 열림 · 토막·짐은 살펴보기'); const g2 = g.life.values.grain; useR('tomakfire_1', '구호미'); closeCard(); ok(done('tomak') && g.flags.has('tm:relief') && g.life.values.grain === g2 - 1, '구호미 → 🌾-1');
}
// ===== 판 4: 협력한 집(삶 중간, 남자) — 주재소에 알린다 🌾+1 🤝-3 · 감독 🌾+2 🤝-2 🎖+1 · 헐라고 🌾+1 🤝-3 — 게임은 판단 없이 값과 족보로만
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 3, rank: 1, branch: 'yangban', status: 'yangban', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('chinil'); ok(g.life.status === 'chinil', '협력한 집'); on(...ALL);
  goTo('yahak'); closeCard(); ok(verb(g, 'horong_1').includes('기름을 댄다'), '협력한 집: 호롱 자리 열림(알린다)'); useR('npc_yahakgyosa', '주재소에'); ok(!btn('주재소에')?.disabled && btn('가르친다')?.disabled && btn('호롱 기름')?.disabled, '협력한 집: 알린다 열림 · 가르친다·기름 회색'); const g0 = g.life.values.grain, h0 = g.life.values.heart; pick('주재소에'); closeCard(); ok(done('yahak') && g.flags.has('yh:report') && g.life.values.grain === g0 + 1 && g.life.values.heart === Math.max(0, h0 - 3) && shown.chalk === false, '알렸다 → 🌾+1 🤝-3 · 칠판은 빈 판');
  goTo('dorm'); closeCard(); ok(verb(g, 'dormgate_1').includes('문을 연다'), '협력한 집 남자: 쪽문 열림(감독)'); useR('npc_gamdok', '감독 자리'); ok(!btn('감독 자리')?.disabled && btn('여공으로')?.disabled && btn('기숙사에 쌀')?.disabled && btn('파업에')?.disabled, '협력한 집 남자: 감독 열림 · 여공·쌀·파업 회색'); const g1 = g.life.values.grain, r0 = g.life.values.rank; pick('감독 자리'); closeCard(); ok(done('dorm') && g.flags.has('dm:foreman') && g.life.values.grain === g1 + 2 && g.life.values.rank === r0 + 1, '감독 → 🌾+2 🎖+1');
  goTo('tomak'); closeCard(); ok(verb(g, 'torn_1').includes('판자를 든다') && verb(g, 'tomakfire_1') === '살펴보기', '협력한 집: 헐린 토막 열림(헐라고) · 불 자리는 살펴보기'); const g2 = g.life.values.grain; useR('torn_1', '헐라고'); pick('헐라고'); closeCard(); ok(done('tomak') && g.flags.has('tm:evict') && g.life.values.grain === g2 + 1 && shown.newroof === false, '헐라고 → 🌾+1 · 지붕 그대로 숨김');
  g.life.end(endOf(g)); ok(g.flags.has('life:end') && carry('status') === 'chinil', '끝 카드 · 협력한 집 넘김(족보에 적힌다)');
}
// ===== 판 5: 노동자 남자(손 좋은, 솜씨 4) — 창살 창 열림(기계) · 파업 → 지붕 천 보임 🤝+3 · 토막 간도 → 이주민
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 8, heart: 2, grain: 1, rank: 0, branch: 'pumpali', status: 'pumpali', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'hand');
  g.life.setStatusTo('nodongja'); ok(g.life.status === 'nodongja' && g.life.values.craft >= 3, '노동자·솜씨 셋 이상'); on(...ALL);
  goTo('dorm'); closeCard(); ok(verb(g, 'dormroom_1').includes('기계 쪽으로') && verb(g, 'strike_1').includes('지붕에 오른다') && verb(g, 'dormgate_1').includes('문을 연다'), '노동자 솜씨 4: 창살(기계)·사다리(파업)·쪽문(딸) 열림'); useR('npc_gamdok', '파업에'); ok(!btn('파업에')?.disabled && !btn('기계를')?.disabled && !btn('딸을')?.disabled && btn('여공으로')?.disabled && btn('감독 자리')?.disabled, '노동자 남자: 파업·기계·딸 열림 · 여공·감독 회색'); const h0 = g.life.values.heart; pick('파업에'); closeCard(); await drain(closeCard, goTo, 'dorm'); ok(done('dorm') && g.flags.has('dm:strike') && shown.strike === true && g.life.values.heart === h0 + 3, '파업 → 지붕 천 보임 · 🤝+3');
  ok(g.promptFor(g.e.interactables.get('strike_1')).name.includes('품삯'), '끝난 뒤 「지붕 위 천 — 품삯 깎지 마라」');
  goTo('tomak'); closeCard(); ok(verb(g, 'tomakbundle_1').includes('짐을 진다'), '노동자: 짐 열림(날품·간도)'); useR('tomakbundle_1', '간도로'); pick('간도로'); closeCard(); ok(done('tomak') && g.flags.has('tm:leave') && g.life.status === 'ijumin', '간도로 → 이주민(삶 중간 변화)');
}
// ===== 판 6: 소작 남자 — 날품 → 노동자(삶 중간 변화) 🌾+1 · 야학 글을 배운다 ✋+1 🤝+1
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 0, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'sojak', '소작'); on(...ALL);
  goTo('tomak'); closeCard(); const g0 = g.life.values.grain; useR('npc_tomakmin', '날품'); ok(!btn('날품')?.disabled && !btn('토막을 다시')?.disabled && btn('물장사')?.disabled && btn('구호미')?.disabled, '소작 남자: 날품·짓기 열림 · 빨래·구호미 회색'); pick('날품'); closeCard(); ok(done('tomak') && g.flags.has('tm:work') && g.life.status === 'nodongja' && g.life.values.grain === g0 + 1, '날품 → 노동자 · 🌾+1');
  goTo('yahak'); closeCard(); useR('npc_yahakgyosa', '글을 배운다'); ok(!btn('글을 배운다')?.disabled && btn('부인 야학')?.disabled && btn('가르친다')?.disabled, '노동자 남자: 배운다 열림 · 부인·가르친다 회색'); const c0 = g.life.values.craft; pick('글을 배운다'); closeCard(); ok(done('yahak') && g.flags.has('yh:learn') && g.life.values.craft === c0 + 1, '글을 배웠다 → ✋+1');
}
// ===== 판 7: 실패 굴림 — 자작농 여자 파업 실패 → 해고 🌾-1 🤝-1(천은 안 보임) · 책 숨기기 실패 → 야학 닫힘 🤝-1
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 4, grain: 3, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'eye');
  ok(g.life.status === 'nongmin', '자작농'); on(...ALL); Math.random = () => 0.99; g.life.tries = {};
  goTo('dorm'); closeCard(); const g0 = g.life.values.grain, h0 = g.life.values.heart; useR('strike_1', '파업에'); closeCard(); ok(done('dorm') && g.flags.has('dm:fired') && !g.flags.has('dm:strike') && g.life.values.grain === g0 - 1 && g.life.values.heart === h0 - 1 && shown.strike === false, '파업 실패 → 해고 🌾-1 🤝-1 · 천 안 보임');
  goTo('yahak'); closeCard(); const h1 = g.life.values.heart; useR('yahakbook_1', '순사가 왔다'); closeCard(); ok(done('yahak') && g.flags.has('yh:closed') && !g.flags.has('yh:hide') && g.life.values.heart === Math.max(0, h1 - 1), '책 숨기기 실패 → 야학 닫힘 🤝-1');
  Math.random = () => 0.01;
}
console.log(`gaehang life 고리 3(넓히기 2: 야학·기숙사·토막): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
