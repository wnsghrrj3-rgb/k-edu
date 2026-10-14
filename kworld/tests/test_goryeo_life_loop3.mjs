// 고려 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(활자 공방·의창·소금 가마)의 섞여 상황 셋을 강제로 켜서 다섯 판(양민 남 / 문벌 여 / 솔거 남 / 향리 남 / 권문세족) + 굴림 실패 둘. 신분·솜씨·곡식 회색, 숨김 재질 보임(찍은 책·곳간 곡식·소금 가마니), 되 속임·안 갚기·사염 잡힘을 본다. WebGL 없이 규칙만.
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
const IX = ['munbeolgate_1', 'slavehut_1', 'oegeohut_1', 'ledger_1', 'well_1', 'stone_1', 'stone_2', 'stone_3', 'examhall_1', 'eumseogate_1', 'bigpaddy_1', 'smallpaddy_1', 'cottonfield_1', 'kiln_1', 'celadon_1', 'sogate_1', 'pagoda_1', 'woodblock_1', 'offering_1', 'fortgate_1', 'wall_1', 'drum_1', 'fortgranary_1', 'spearrack_1', 'wardrum_1', 'songship_1', 'ganghwaship_1', 'tradepile_1', 'arabstall_1', 'fish_1', 'meetrock_1', 'hollow_1', 'log_1', 'pass_1', 'talkmat_1', 'mongolcamp_1', 'pgranary_1', 'deedpile_1', 'firepit_1', 'powergate_1',
  'typemold_1', 'typeset_1', 'typescript_1', 'uichang_1', 'uichangbook_1', 'repaypile_1', 'saltpan_1', 'saltkiln_1', 'saltstore_1', 'npc_typecaster', 'npc_uichangri', 'npc_salter',
  'taxpile_1', 'bugoksign_1', 'silverstall_1', 'coinstall_1', 'clothstall_1', 'posthorse_1', 'dispatch_1', 'cart_1', 'saltpeterkiln_1', 'powdermix_1', 'cannon_1', 'moktak_1', 'hermitspring_1', 'bundle_1', 'chaebung_1', 'lanterns_1', 'tributestall_1', 'rebuild_1', 'burntboat_1',
  'npc_munbeol', 'npc_hyangni', 'npc_yangmin', 'npc_solgeo', 'npc_oegeo', 'npc_examiner', 'npc_sadaebu', 'npc_soin', 'npc_overseer', 'npc_monk', 'npc_carver', 'npc_gimyunhu', 'npc_general', 'npc_merchant', 'npc_arab', 'npc_manjeok', 'npc_seohui', 'npc_gwonmun', 'npc_bugokin', 'npc_sijeon', 'npc_palgwan', 'npc_sindon', 'npc_yeokjol', 'npc_choemuseon', 'npc_fisher'];
const AREAS = { village: [0, 0], office: [36, 32], paddy: [-40, -30], so: [-84, -62], temple: [-58, 38], fortress: [0, 52], camp: [48, -4], port: [18, -60], ford: [56, -67], hill: [70, -104], woods: [-84, 78], pass: [2, 106], power: [66, -28], bugok: [-28, 56], market: [30, 34], station: [30, -68], gunpowder: [96, 48], hermit: [-102, -16], palgwan: [-30, -72], burnt: [-60, 62], press: [-26, -46], uichang: [-40, 2], salt: [-6, 52] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:silla-life'] = JSON.stringify(carry); const mixed = ['press', 'uichang', 'salt'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { typeset_1: 'printed_book', uichang_1: 'stored_grain', saltstore_1: 'salt_sack' };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (MAT[name]) fn({ isMesh: true, material: { name: MAT[name] }, set visible(v) { shown[name] = v; } }); if (name === 'cannon_1') fn({ isMesh: true, material: { name: 'cannon_bronze' }, set visible(v) { shown.cannon = v; } }); if (name === 'lanterns_1') fn({ isMesh: true, material: { name: 'lantern_fire' }, set visible(v) { shown.lantern = v; } }); if (name === 'rebuild_1') fn({ isMesh: true, material: { name: 'new_thatch' }, set visible(v) { shown.thatch = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };   // 뒤에 줄 선 카드(꼭 나오는 상황)를 비우고 then 이 돌 틈을 준다

const D = async (T, area) => { await drain(T.closeCard, T.goTo, area); };

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const sids = new Set(life.status.rules.map((r) => r.id)); const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
  for (const id of ['press', 'uichang', 'salt']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 7 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name && s.choices.every((c) => setters.includes(`"${c.done}"`)) && s.choices.every((c) => !c.status || sids.has(c.status)), `${id} 장소·done 세우는 곳·status 실재`);
  }
  ok(life.situations.filter((x) => !x.must).length === 22 && life.mixedCount === 6, '섞여 22 · 판마다 6');
  ok(['typeset', 'uichang', 'saltstore'].every((t) => items.targets[t].hidden?.length === 1), '숨김 재질 셋(찍은 책·곳간 곡식·소금 가마니)');
  const st = (n) => npcs[n].lines[0].choices.filter((c) => c.if && c.gray).length;
  ok(st('typecaster') === 5 && st('uichangri') === 6 && st('salter') === 6, '신분·솜씨·곡식 회색 — 공방 5·의창 6·소금 6');
  ok(JSON.stringify(npcs.typecaster).includes('val:craft>=3') && JSON.stringify(npcs.salter).includes('val:grain>=3'), '활자 붓기 솜씨 셋 · 가마 사기 곡식 셋');
  ok(world.danger.safe.some((a) => a[0] === -40 && a[1] === 2) && world.scenery.grass.avoid.some((a) => a[0] === -6 && a[1] === 52), '의창 밤 안전 · 소금 가마 풀 피하기(엔진 좌표)');
}

// ---- 1판: 양민 남(솜씨 1·곡식 1) — 공방: 붓기 회색·숯 열림 / 의창: 빌리기(🌾+1 🤝+1, 곡식 보임) / 소금: 굽기(🌾+2)
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 1, branch: 'noname', status: 'farmer', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'yangmin' && g.life.situations.length === 10, '양민 · 꼭 7 + 새 장소 3');
  T.goTo('press'); ok(!T.opened('press'), '몽골 전엔 공방 안 열림'); T.goTo('uichang'); ok(!T.opened('uichang'), '거란 전엔 의창 안 열림'); T.goTo('salt'); ok(!T.opened('salt'), '벽란도 전엔 소금 가마 안 열림');
  T.on('sit:khitan:done'); T.goTo('uichang'); ok(T.opened('uichang'), '의창 열림'); await D(T, 'uichang');
  T.useR('npc_uichangri', '봄 곡식'); ok(!T.btn('봄 곡식').disabled && T.btn('곡식을 낸다')?.disabled && T.btn('되를 잰다')?.disabled && T.btn('주인 집')?.disabled && T.btn('빌려 가고')?.disabled, '양민 — 빌리기 열림, 채우기·되·노비·권문 회색');
  const g0 = g.life.values.grain, h0 = g.life.values.heart; T.pick('봄 곡식'); await D(T, 'uichang');
  ok(T.done('uichang') && g.flags.has('uichang:borrow') && g.life.values.grain === g0 + 1 && g.life.values.heart === h0 + 1 && shown.uichang_1 === true, '빌려 갚음(🌾+1 🤝+1, stored_grain 보임)');
  T.use('uichang_1'); ok(T.S.says.some((s) => s.includes('볏단이 곳간 안을')), '갚은 뒤 「의창 곳간 — 찼다」');
  T.on('sit:port:done'); T.goTo('salt'); ok(T.opened('salt'), '소금 가마 열림'); await D(T, 'salt');
  T.useR('npc_salter', '소금을 굽는다'); ok(!T.btn('소금을 굽는다').disabled && T.btn('땔나무')?.disabled && T.btn('염창에')?.disabled && T.btn('소금 가마를')?.disabled && !T.btn('소금을 몰래').disabled, '양민 — 굽기·몰래 열림, 나무·염창·사들이기 회색');
  const g1 = g.life.values.grain; T.pick('소금을 굽는다'); await D(T, 'salt'); ok(T.done('salt') && g.flags.has('salt:boil') && g.life.values.grain === g1 + 2 && shown.saltstore_1 !== true, '소금을 구움(🌾+2, 가마니는 안 보임)');
  T.on('sit:mongol:done'); T.goTo('press'); ok(T.opened('press'), '공방 열림'); await D(T, 'press');
  T.useR('npc_typecaster', '숯을'); ok(T.btn('활자를 붓는다')?.disabled && T.btn('글자본')?.disabled && T.btn('책을')?.disabled && !T.btn('숯을').disabled, '솜씨 1 양민 — 붓기·글자본·책 회색, 숯 열림');
  T.pick('숯을'); await D(T, 'press'); ok(T.done('press') && g.flags.has('press:ink') && shown.typeset_1 !== true, '숯·먹(책은 안 보임)');
}

// ---- 2판: 문벌 여(곡식 8) — 공방: 책 시키기(🌾-2, 책 보임)·붓기·숯 회색 / 의창: 채우기(🌾-2 🤝+2 🎖+1) / 소금: 가마 사들이기(🌾-3)
{
  const T = mkGame('f', { craft: 2, heart: 2, grain: 8, branch: 'surname', status: 'hojok', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'munbeol', '문벌 여');
  T.on('sit:khitan:done', 'sit:port:done', 'sit:mongol:done');
  T.goTo('press'); await D(T, 'press'); T.useR('npc_typecaster', '책을'); ok(T.btn('활자를 붓는다')?.disabled && T.btn('숯을')?.disabled && T.btn('활자 한 줌')?.disabled && !T.btn('글자본').disabled, '문벌 — 붓기·숯·몰래 회색, 글자본·책 열림');
  const g0 = g.life.values.grain; T.pick('책을'); await D(T, 'press'); ok(T.done('press') && g.flags.has('press:order') && g.life.values.grain === g0 - 2 && shown.typeset_1 === true, '책을 시킴(🌾-2, printed_book 보임)');
  T.use('typeset_1'); ok(T.S.says.some((s) => s.includes('같은 활자다')), '찍은 뒤 「찍은 책」 살펴보기');
  T.goTo('uichang'); await D(T, 'uichang'); T.useR('npc_uichangri', '곡식을 낸다'); ok(T.btn('봄 곡식')?.disabled && !T.btn('곡식을 낸다').disabled, '문벌 — 빌리기 회색, 채우기 열림');
  const g1 = g.life.values.grain, h1 = g.life.values.heart, r1 = g.life.values.rank; T.pick('곡식을 낸다'); await D(T, 'uichang');
  ok(T.done('uichang') && g.flags.has('uichang:fill') && g.life.values.grain === g1 - 2 && g.life.values.heart === h1 + 2 && g.life.values.rank === r1 + 1 && shown.uichang_1 === true, '곳간 채움(🌾-2 🤝+2 🎖+1, 곡식 보임)');
  T.goTo('salt'); await D(T, 'salt'); T.useR('npc_salter', '소금 가마를'); ok(T.btn('소금을 굽는다')?.disabled && T.btn('소금을 몰래')?.disabled && !T.btn('소금 가마를').disabled && !T.btn('소금을 산다').disabled, '문벌 — 굽기·몰래 회색, 사들이기·사기 열림');
  const g2 = g.life.values.grain; T.pick('소금 가마를'); await D(T, 'salt'); ok(T.done('salt') && g.flags.has('salt:seize') && g.life.values.grain === g2 - 3, '가마 사들임(🌾-3)');
}

// ---- 3판: 솔거 남 — 의창: 지게만 열림 / 소금: 땔나무(🤝+1) / 공방: 붓기 회색·몰래 열림
{
  const T = mkGame('m', { craft: 1, heart: 0, grain: 0, branch: 'slave', status: 'slave', nation: 'silla' }); const { g } = T;
  ok(g.life.status === 'solgeo', '솔거 노비');
  T.on('sit:khitan:done', 'sit:port:done', 'sit:mongol:done');
  T.goTo('uichang'); await D(T, 'uichang'); T.useR('npc_uichangri', '주인 집'); ok(T.btn('봄 곡식')?.disabled && T.btn('곡식을 낸다')?.disabled && T.btn('되를 잰다')?.disabled && !T.btn('주인 집').disabled, '노비 — 빌리기·채우기·되 회색, 지게 열림'); T.pick('주인 집'); await D(T, 'uichang'); ok(T.done('uichang') && g.flags.has('uichang:carry'), '주인 집 곡식 지고 옴');
  T.goTo('salt'); await D(T, 'salt'); T.useR('npc_salter', '땔나무'); ok(!T.btn('땔나무').disabled && T.btn('소금을 굽는다')?.disabled && T.btn('소금을 산다')?.disabled, '노비(곡식 0) — 나무 열림, 굽기·사기 회색'); const h0 = g.life.values.heart; T.pick('땔나무'); await D(T, 'salt'); ok(T.done('salt') && g.flags.has('salt:wood') && g.life.values.heart === h0 + 1, '땔나무(🤝+1)');
  T.goTo('press'); await D(T, 'press'); T.useR('npc_typecaster', '숯을'); ok(T.btn('활자를 붓는다')?.disabled && !T.btn('활자 한 줌').disabled, '노비 솜씨 1 — 붓기 회색, 몰래 열림');
}

// ---- 4판: 향리 남(솜씨 3) — 공방: 붓기(✋+2, 책 보임) / 의창: 되 바르게(🤝+2) / 소금: 염창(🎖+1, 가마니 보임) · 권문(setStatusTo): 안 갚기(🌾+3 🤝-3)
{
  const T = mkGame('m', { craft: 6, heart: 2, grain: 2, branch: 'surname', status: 'low', nation: 'silla' }); const { g, shown } = T;
  ok(g.life.status === 'hyangni' && g.life.values.craft >= 3, '향리 · 솜씨 셋');
  T.on('sit:khitan:done', 'sit:port:done', 'sit:mongol:done');
  T.goTo('press'); await D(T, 'press'); T.useR('typemold_1', '활자를 붓는다'); ok(!T.btn('활자를 붓는다').disabled, '솜씨 셋 — 붓기 열림'); const c0 = g.life.values.craft; T.pick('활자를 붓는다'); await D(T, 'press'); ok(T.done('press') && g.flags.has('press:cast') && g.life.values.craft === c0 + 2 && shown.typeset_1 === true, '활자를 부음(✋+2, 책 보임)');
  T.goTo('uichang'); await D(T, 'uichang'); T.useR('uichangbook_1', '되를 잰다'); ok(!T.btn('되를 잰다').disabled && !T.btn('큰 되로').disabled, '향리 — 되 바르게·속임 둘 다 열림'); const h0 = g.life.values.heart; T.pick('되를 잰다'); await D(T, 'uichang'); ok(T.done('uichang') && g.flags.has('uichang:fair') && g.life.values.heart === h0 + 2, '되 바르게(🤝+2)');
  T.goTo('salt'); await D(T, 'salt'); T.useR('saltstore_1', '염창에'); ok(!T.btn('염창에').disabled && T.btn('소금을 몰래')?.disabled, '향리 — 염창 열림, 몰래 회색'); const r0 = g.life.values.rank; T.pick('염창에'); await D(T, 'salt'); ok(T.done('salt') && g.flags.has('salt:store') && g.life.values.rank === r0 + 1 && shown.saltstore_1 === true, '염창에 들임(🎖+1, salt_sack 보임)');
  T.use('saltstore_1'); ok(T.S.says.some((s) => s.includes('염호는 베 한 필')), '들인 뒤 「염창 — 가마니가 찼다」');
  const U = mkGame('f', { craft: 2, heart: 5, grain: 4, branch: 'surname', status: 'hojok', nation: 'silla' }); U.g.life.setStatusTo('gwonmun'); ok(U.g.life.status === 'gwonmun', '권문세족');
  U.on('sit:khitan:done'); U.goTo('uichang'); await D(U, 'uichang'); U.useR('npc_uichangri', '빌려 가고'); ok(!U.btn('빌려 가고').disabled && U.btn('곡식을 낸다')?.disabled, '권문 — 안 갚기 열림, 채우기 회색'); const ug = U.g.life.values.grain, uh = U.g.life.values.heart; U.pick('빌려 가고'); await D(U, 'uichang');
  ok(U.done('uichang') && U.g.flags.has('uichang:grab') && U.g.life.values.grain === ug + 3 && U.g.life.values.heart === uh - 3 && U.shown.uichang_1 !== true, '안 갚음(🌾+3 🤝-3, 곳간은 빈 채)');
}

// ---- 굴림 실패: 양민 못 갚음(uichang:owe 🌾-1) · 사염 잡힘(salt:caught 🌾-1 🤝-2)
{
  Math.random = () => 0.99;
  const X = mkGame('m', { craft: 1, heart: 2, grain: 2, branch: 'noname', status: 'farmer', nation: 'silla' }); X.g.life.tries = {};
  X.on('sit:khitan:done', 'sit:port:done'); X.goTo('uichang'); await D(X, 'uichang'); X.useR('uichang_1', '봄 곡식'); X.pick('봄 곡식'); await D(X, 'uichang');
  ok(X.done('uichang') && X.g.flags.has('uichang:owe') && !X.g.flags.has('uichang:borrow') && X.g.life.values.grain === 1 && X.shown.uichang_1 !== true, '못 갚음 → uichang:owe(🌾-1, 곡식 안 보임), 상황은 끝남');
  X.goTo('salt'); await D(X, 'salt'); X.useR('saltstore_1', '소금을 몰래'); X.pick('소금을 몰래'); await D(X, 'salt');
  ok(X.done('salt') && X.g.flags.has('salt:caught') && !X.g.flags.has('salt:smuggle') && X.g.life.values.grain === 0 && X.g.life.values.heart === 0, '사염 잡힘 → salt:caught(🌾-1 🤝-2)');
  Math.random = () => 0.01;
}
console.log(`goryeo 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
