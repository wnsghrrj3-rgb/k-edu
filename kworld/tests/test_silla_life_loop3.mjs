// 통일신라·발해 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(석빙고·선종 암자·진골 농장)의 섞여 상황 셋을 강제로 켜서 다섯 판(평민 남자 / 진골 여자 / 노비 남자 / 6두품 남자 / 호족) + 굴림 실패. 골품·성별 회색, 곡식 조건, 숨김 재질 보임(얼음·부도·새 담), 머리 깎기(골품 밖), 얼음 도둑 잡힘을 본다. WebGL 없이 규칙만.
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

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  for (const id of ['ice', 'seon', 'manor']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 6 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name, `${id} 장소 ${s.place} 이름`);
    const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
    ok(s.choices.every((c) => setters.includes(`"${c.done}"`)), `${id} done 깃발이 NPC/대상에서 세워짐`);
    const sids = new Set(life.status.rules.map((r) => r.id));
    ok(s.choices.every((c) => !c.status || sids.has(c.status)), `${id} 선택지 status id 실재`);
  }
  ok(life.situations.filter((x) => !x.must).length === 21 && life.mixedCount === 6, '섞여 21 · 판마다 6');
  ok(['icehouse', 'stupa', 'fence'].every((t) => items.targets[t].hidden?.length === 1), '숨김 재질 셋(얼음·부도·새 담)');
  ok(world.scenery.grass.avoid.some((a) => a[0] === 40 && a[1] === -96) && world.scenery.grass.avoid.some((a) => a[0] === -88 && a[1] === -6), '암자·농장 풀 피하기(엔진 좌표)');
  const st = (n) => npcs[n].lines[0].choices.filter((c) => c.if && c.gray).length;
  ok(st('icekeeper') === 5 && st('seonmaster') === 4 && st('steward') === 6, '골품 회색 — 석빙고 5·암자 4·농장 6');
  ok(JSON.stringify(npcs.seonmaster).includes("'monk'") || JSON.stringify(npcs.seonmaster).includes('!status:monk'), '머리 깎기는 스님이 아닐 때만');
  ok(JSON.stringify(npcs.steward).includes('val:grain>=3') && JSON.stringify(npcs.seonmaster).includes('val:grain>=2'), '땅 사기 곡식 셋 · 부도 곡식 둘 — 실제 값을 읽음');
  ok(['ice', 'seon', 'manor'].every((k) => world.journal[k]?.note?.length > 80), '새 기록 셋');
}

// ---- 1판: 신라 평민 남자(곡식 0) — 석빙고: 얼음 뜨기(🤝+1, 얼음 보임)·나머지 회색 / 암자: 묻기(🤝+1)·부도·막기 회색 / 농장: 땅 팔기(🌾+2 🤝-1, 새 담 보임·land:sold)
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 0, branch: 'poor', status: 'poor', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'farmer' && g.flags.has('nation:silla'), '신라 평민');
  ok(g.life.situations.length === 10, '꼭 7 + 새 장소 3');
  T.goTo('icehouse'); ok(!T.opened('ice'), '촌락문서 전엔 석빙고 안 열림'); T.goTo('seonam'); ok(!T.opened('seon'), '불국사 전엔 암자 안 열림'); T.goTo('manor'); ok(!T.opened('manor'), '흉년 전엔 농장 안 열림');
  g.flags.add('sit:census:done');
  T.goTo('icehouse'); ok(T.opened('ice'), '석빙고 — 얼음을 들인다 열림'); await drain(T);
  T.useR('npc_icekeeper', '얼음을 뜨고'); ok(T.btn('주인 몫')?.disabled && T.btn('사람을')?.disabled && T.btn('빙고전')?.disabled && !T.btn('한 덩이').disabled, '평민 — 주인 몫·사람 보내기·장부 회색, 몰래는 열림');
  const h0 = g.life.values.heart; T.pick('얼음을 뜨고'); await drain(T);
  ok(T.done('ice') && g.flags.has('ice:cut') && g.life.values.heart === h0 + 1 && shown.icehouse_1 === true, '얼음을 뜨고 들임(🤝+1, ice_block 보임)');
  T.use('icehouse_1'); ok(!T.btn('얼음을 뜨고') && T.S.says.some((s) => s.includes('얼음이 돌 계단')), '끝난 뒤엔 「석빙고 — 얼음이 찼다」 살펴보기');
  g.flags.add('sit:bulguksa:done'); g.flags.add('sit:famine:done'); await drain(T);
  T.goTo('seonam'); ok(T.opened('seon'), '암자 — 산문 열림'); await drain(T);
  T.useR('npc_seonmaster', '묻는다'); ok(T.btn('부도를')?.disabled && T.btn('산문을 막는다')?.disabled && !T.btn('머리를').disabled && !T.btn('장작을').disabled, '평민 — 부도·막기 회색, 머리 깎기·장작 열림');
  const h1 = g.life.values.heart; T.pick('묻는다'); await drain(T); ok(T.done('seon') && g.flags.has('seon:ask') && g.life.values.heart === h1 + 1 && shown.stupa_1 !== true, '묻기(🤝+1, 부도는 안 보임)');
  T.goTo('manor'); ok(T.opened('manor'), '농장 — 땅이 큰 집으로 열림'); await drain(T);
  T.useR('npc_steward', '땅을 판다'); ok(T.btn('땅을 산다')?.disabled && T.btn('글을 올린다')?.disabled && T.btn('주인 농장')?.disabled && T.btn('땅 없는')?.disabled && !T.btn('소작을').disabled, '평민 — 사기·글·주인 몫·사람 모으기 회색, 소작 열림');
  const g0 = g.life.values.grain, h2 = g.life.values.heart; T.pick('땅을 판다'); await drain(T);
  ok(T.done('manor') && g.flags.has('manor:sell') && g.flags.has('land:sold') && g.life.values.grain === g0 + 2 && g.life.values.heart === h2 - 1 && shown.fence_1 === true, '땅을 팔았다(🌾+2 🤝-1, new_fence 보임, land:sold)');
  T.use('fence_1'); ok(T.S.says.some((s) => s.includes('어제까지 평민 밭')), '판 뒤엔 「새 담 — 큰 집 땅」 살펴보기');
}

// ---- 2판: 진골 여자(곡식 5) — 석빙고: 사람 보내기(🤝-1, 얼음 보임)·뜨기·몰래 회색 / 암자: 부도 세우기(🌾-2 🤝+2, 부도 보임)·묻기 회색·막기 열림 / 농장: 땅 사기(🌾-3, 새 담 보임)·팔기 회색
{
  const T = mkGame('f', { craft: 2, heart: 3, grain: 5, branch: 'noble_silla', status: 'noble', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'jingol', '신라 진골 여자');
  g.flags.add('sit:census:done'); g.flags.add('sit:bulguksa:done'); g.flags.add('sit:famine:done');
  T.goTo('icehouse'); await drain(T); T.useR('npc_icekeeper', '사람을'); ok(T.btn('얼음을 뜨고')?.disabled && T.btn('한 덩이')?.disabled && T.btn('빙고전')?.disabled, '진골 — 뜨기·몰래·장부 회색');
  const h0 = g.life.values.heart; T.pick('사람을'); await drain(T); ok(T.done('ice') && g.flags.has('ice:send') && g.life.values.heart === h0 - 1 && shown.icehouse_1 === true, '사람을 보냄(🤝-1, 얼음 보임)');
  T.goTo('seonam'); await drain(T); T.useR('npc_seonmaster', '부도를'); ok(T.btn('묻는다')?.disabled && !T.btn('산문을 막는다').disabled && !T.btn('부도를').disabled, '진골 — 묻기 회색, 막기·부도 열림');
  const g1 = g.life.values.grain, h1 = g.life.values.heart; T.pick('부도를'); await drain(T); ok(T.done('seon') && g.flags.has('seon:build') && g.life.values.grain === g1 - 2 && g.life.values.heart === h1 + 2 && shown.stupa_1 === true, '부도를 세움(🌾-2 🤝+2, stupa_stone 보임)');
  T.use('stupa_1'); ok(!T.btn('부도를') && T.S.says.some((s) => s.includes('팔각 받침')), '세운 뒤엔 「팔각 부도」 살펴보기');
  T.goTo('manor'); await drain(T); T.useR('npc_steward', '땅을 산다'); ok(T.btn('땅을 판다')?.disabled && T.btn('소작을')?.disabled && !T.btn('땅을 산다').disabled, '진골 — 팔기·소작 회색, 사기 열림');
  const g2 = g.life.values.grain; T.pick('땅을 산다'); await drain(T); ok(T.done('manor') && g.flags.has('manor:buy') && g.life.values.grain === g2 - 3 && shown.fence_1 === true, '땅을 삼(🌾-3, new_fence 보임)');
}

// ---- 3판: 노비 남자 — 석빙고: 주인 몫(얼음 보임)·뜨기 회색·몰래 열림 / 암자: 머리 깎기 회색 → 장작 / 농장: 주인 농장 일·소작·팔기 회색
{
  const T = mkGame('m', { craft: 0, heart: 0, grain: 0, branch: 'slave', status: 'slave', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'slave', '노비');
  g.flags.add('sit:census:done'); g.flags.add('sit:bulguksa:done'); g.flags.add('sit:famine:done');
  T.goTo('icehouse'); await drain(T); T.useR('npc_icekeeper', '주인 몫'); ok(T.btn('얼음을 뜨고')?.disabled && T.btn('사람을')?.disabled && !T.btn('한 덩이').disabled, '노비 — 뜨기(제 몫)·사람 보내기 회색, 몰래 열림'); T.pick('주인 몫'); await drain(T);
  ok(T.done('ice') && g.flags.has('ice:forslave') && shown.icehouse_1 === true, '주인 몫으로 뜸(얼음은 보이되 주인 집으로)');
  T.goTo('seonam'); await drain(T); T.useR('npc_seonmaster', '장작을'); ok(T.btn('머리를')?.disabled && !T.btn('묻는다').disabled, '노비 — 머리 깎기 회색, 묻기 열림'); T.pick('장작을'); await drain(T); ok(T.done('seon') && g.flags.has('seon:wood'), '장작을 해다 줌');
  T.goTo('manor'); await drain(T); T.useR('npc_steward', '주인 농장'); ok(T.btn('소작을')?.disabled && T.btn('땅을 판다')?.disabled && T.btn('땅을 산다')?.disabled, '노비 — 소작·팔기·사기 회색'); T.pick('주인 농장'); await drain(T); ok(T.done('manor') && g.flags.has('manor:work'), '주인 농장 일');
}

// ---- 4판: 6두품 남자 — 장부 적기(🎖+1) / 암자: 머리 깎기 → 스님(골품 밖) / 농장: 글 올리기(🎖+1 🤝+1) · 호족(삶 중간): 사람 모으기 열림·부도 열림 · 굴림 실패: 평민 얼음 도둑 잡힘(🤝-2)
{
  const T = mkGame('m', { craft: 3, heart: 2, grain: 2, branch: 'noble_fallen', status: 'noble', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'six', '6두품');
  g.flags.add('sit:census:done'); g.flags.add('sit:bulguksa:done'); g.flags.add('sit:famine:done');
  T.goTo('icehouse'); await drain(T); T.useR('icebook_1', '빙고전'); ok(!T.btn('빙고전').disabled && T.btn('사람을')?.disabled, '6두품 — 장부 열림, 사람 보내기 회색'); const r0 = g.life.values.rank; T.pick('빙고전'); await drain(T);
  ok(T.done('ice') && g.flags.has('ice:book') && g.life.values.rank === r0 + 1 && shown.icehouse_1 !== true, '장부를 적음(🎖+1, 얼음은 안 보임 — 들인 건 남)');
  T.goTo('manor'); await drain(T); T.useR('deed_1', '글을 올린다'); ok(!T.btn('글을 올린다').disabled && !T.btn('땅을 판다').disabled && T.btn('땅을 산다')?.disabled, '6두품(곡식 2) — 글·팔기 열림, 사기 회색'); const r1 = g.life.values.rank, h1 = g.life.values.heart; T.pick('글을 올린다'); await drain(T);
  ok(T.done('manor') && g.flags.has('manor:memo') && g.life.values.rank === r1 + 1 && g.life.values.heart === h1 + 1 && shown.fence_1 !== true, '글을 올림(🎖+1 🤝+1, 담은 그대로)');
  T.goTo('seonam'); await drain(T); T.useR('zen_1', '머리를'); T.pick('머리를'); await drain(T); ok(T.done('seon') && g.flags.has('seon:ordain') && g.life.status === 'monk', '머리를 깎음 → 스님(골품 밖)');
  const U = mkGame('m', { craft: 2, heart: 4, grain: 6, branch: 'poor', status: 'poor', nation: 'silla' }); U.g.life.setStatusTo('hojok'); ok(U.g.life.status === 'hojok', '호족(삶 중간)');
  U.g.flags.add('sit:bulguksa:done'); U.g.flags.add('sit:famine:done');
  U.goTo('manor'); await drain(U); U.useR('npc_steward', '땅 없는'); ok(!U.btn('땅 없는').disabled && !U.btn('땅을 산다').disabled && U.btn('땅을 판다')?.disabled, '호족 — 사람 모으기·사기 열림, 팔기 회색'); const uh = U.g.life.values.heart; U.pick('땅 없는'); await drain(U);
  ok(U.done('manor') && U.g.flags.has('manor:gather') && U.g.life.values.heart === uh + 2 && U.shown.fence_1 !== true, '땅 없는 사람을 모음(🤝+2, 담은 그대로)');
  U.goTo('seonam'); await drain(U); U.useR('stupa_1', '부도를'); ok(!U.btn('부도를').disabled && U.btn('산문을 막는다')?.disabled, '호족 — 부도 열림, 막기(진골) 회색'); U.pick('부도를'); await drain(U); ok(U.shown.stupa_1 === true, '호족이 부도를 세움');
  const X = mkGame('m', { craft: 0, heart: 2, grain: 1, branch: 'poor', status: 'poor', nation: 'silla' }); X.g.flags.add('sit:census:done'); Math.random = () => 0.99;
  X.goTo('icehouse'); await drain(X); X.useR('icecut_1', '한 덩이'); X.pick('한 덩이'); await drain(X);
  ok(X.done('ice') && X.g.flags.has('ice:caught') && !X.g.flags.has('ice:steal') && X.g.life.values.heart === 0 && X.g.life.values.grain === 1, '얼음 도둑으로 잡힘 → ice:caught(🤝-2, 곡식 그대로), 상황은 끝남');
  Math.random = () => 0.01;
}
console.log(`silla 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
