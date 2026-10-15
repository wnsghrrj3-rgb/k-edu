// 조선 전기 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(향교·사기소·봉수대)의 섞여 상황 셋을 강제로 켜서 여섯 판(상민 남 / 양반 여 / 솔거 남 / 중인 남 / 백정 남 / 서얼 남) + 굴림 실패 둘. 신분·성별·솜씨·곡식 회색, 숨김 재질 보임(명부 글씨·분청 그릇·봉수 불), 낙강·거짓 불을 본다. WebGL 없이 규칙만.
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
const IX = ['hopae_1', 'samun_1', 'examhall_1', 'jagyeokru_1', 'hwangok_1', 'hangeul_1', 'seoan_1', 'sewing_1', 'slavehut_1', 'ybgate_1', 'bigpaddy_1', 'bigpaddy_2', 'smallpaddy_1', 'smallpaddy_2', 'homepaddy_1', 'bestall_1', 'stonepile_1', 'rack_1', 'hideout_1', 'pass_1', 'qingcamp_1', 'boat_1', 'waeship_1',
  'gyosaengbook_1', 'seokjeon_1', 'hgoutside_1', 'wheel_1', 'tributecrate_1', 'claypit_1', 'beacon_1', 'fuelpile_1', 'lookout_1', 'npc_gyogwan', 'npc_sagijang', 'npc_bongsugun',
  'npc_jumo', 'npc_nongbu', 'npc_pojol', 'npc_cheongjigi', 'npc_seonbi', 'npc_ai', 'npc_nageune', 'npc_hunjang', 'npc_baetsagong', 'npc_sojak', 'npc_baekjeong', 'npc_anju', 'npc_nobi', 'npc_ajeon', 'npc_gwanno', 'npc_kkeokjeong', 'npc_uibyeong', 'npc_sunsin'];
const AREAS = { eogwi: [0, -40], outroad: [0, -58], jangteo: [0, -6], jumak: [-13.5, -5], well: [6.5, -2.5], yangban: [0, 22], haengrang: [-9.5, 23.5], sarang: [-7, 27], anchae: [1, 37.5], gwana: [-27, -5], dongheon: [-30, 8.5], choga: [28, -7], field: [27, -30], seodang: [-31, -29.5], naru: [9, -93], deul: [66, -9], oettan: [72, -79], gogae: [-100, -70], sanjung: [-80, 84], hyanggyo: [-42, 49], sagiso: [92, 59], bongsu: [34, -83] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:goryeo-life'] = JSON.stringify(carry); const mixed = ['hyanggyo', 'sagiso', 'bongsu'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { gyosaengbook_1: ['roll_ink'], wheel_1: ['buncheong', 'slip_white'], beacon_1: ['beacon_fire', 'beacon_fire2'] };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { for (const m of MAT[name] || []) fn({ isMesh: true, material: { name: m }, set visible(v) { shown[m] = v; } }); if (name === 'waeship_1') fn({ isMesh: true, material: { name: 'wae_sail' }, set visible(v) { shown.wae = v; } }); if (name === 'qingcamp_1') fn({ isMesh: true, material: { name: 'qing_tent' }, set visible(v) { shown.qing = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
  const on = (...flags) => { for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const settle = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };   // 뒤에 줄 선 카드(꼭 나오는 상황)를 비우고 then 이 돌 틈을 준다
const D = async (T, area) => { await drain(T.closeCard, T.goTo, area); };
const dis = (T, label) => T.btn(label)?.disabled === true;
const en = (T, label) => T.btn(label) && !T.btn(label).disabled;

// ---- 데이터 전수
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const sids = new Set(life.status.rules.map((r) => r.id)); const setters = JSON.stringify(items.targets) + JSON.stringify(npcs);
  for (const id of ['hyanggyo', 'sagiso', 'bongsu']) {
    const s = life.situations.find((x) => x.id === id);
    ok(s && !s.must && s.q && s.q.a.length === 3 && s.q.revisit, `${id} 섞여 상황 · 복습 물음 q 셋·revisit`);
    ok(s.choices.length >= 8 && s.choices.every((c) => c.fact && c.journal && world.journal[c.journal] && c.done), `${id} 선택마다 📜 사실·사전·done`);
    ok(world.areas[s.place]?.name && s.choices.every((c) => setters.includes(`"${c.done}"`)) && s.choices.every((c) => !c.status || sids.has(c.status)), `${id} 장소·done 세우는 곳·status 실재`);
  }
  ok(life.situations.filter((x) => !x.must).length === 15 && life.mixedCount === 4, '섞여 15 · 판마다 4');
  ok(items.targets.gyosaengbook.hidden.length === 1 && items.targets.wheel.hidden.length === 2 && items.targets.beacon.hidden.length === 2, '숨김 재질(명부 글씨 1·분청 그릇 2·봉수 불 2)');
  const st = (n) => npcs[n].lines[0].choices.filter((c) => c.if && c.gray).length;
  ok(st('gyogwan') === 6 && st('sagijang') === 6 && st('bongsugun') === 6, '신분·성별·솜씨·곡식 회색 — 향교 6·사기소 6·봉수 6');
  ok(JSON.stringify(npcs.sagijang).includes('val:craft>=3') && JSON.stringify(npcs.gyogwan).includes('sex:f') && JSON.stringify(npcs.bongsugun).includes('sex:m'), '물레 솜씨 셋 · 담 밖 여자 · 봉수군 남자');
  ok(world.danger.safe.some((a) => a[0] === -42 && a[1] === 48) && world.scenery.grass.avoid.some((a) => a[0] === 34 && a[1] === -84), '향교 밤 안전 · 봉수대 풀 피하기(엔진 좌표)');
}

// ---- 1판: 상민 남(솜씨 1·곡식 2) — 사기소: 흙(🤝+1, 그릇 안 보임) / 향교: 액외 교생(🌾+1 🤝-1, 명부 글씨 보임) / 봉수: 봉수군(🤝+1, 불 보임)
{
  const T = mkGame('m', { craft: 1, heart: 2, grain: 2, rank: 0, branch: 'yangmin', status: 'yangmin', nation: 'goryeo' }, 'eye'); const { g, shown } = T;
  ok(g.life.status === 'sangmin' && g.life.situations.length === 10, '상민 · 꼭 7 + 새 장소 3');
  T.goTo('hyanggyo'); ok(!T.opened('hyanggyo'), '한글 전엔 향교 안 열림'); T.goTo('sagiso'); ok(!T.opened('sagiso'), '부역 전엔 사기소 안 열림'); T.goTo('bongsu'); ok(!T.opened('bongsu'), '과거 전엔 봉수대 안 열림');
  T.on('sit:corvee:done'); T.goTo('sagiso'); ok(T.opened('sagiso'), '사기소 열림'); await D(T, 'sagiso');
  T.useR('npc_sagijang', '흙을'); ok(dis(T, '물레를') && dis(T, '제기를') && en(T, '흙을') && dis(T, '공납 장부') && dis(T, '장부에 더') && en(T, '방납꾼'), '상민 솜씨 1 — 흙·방납 열림, 물레·제기·장부 회색');
  const h0 = g.life.values.heart; T.pick('흙을'); await D(T, 'sagiso'); ok(T.done('sagiso') && g.flags.has('sg:dig') && g.life.values.heart === h0 + 1 && shown.buncheong !== true, '흙·장작(🤝+1, 분청 그릇은 안 보임)');
  T.on('sit:hangeul:done'); T.goTo('hyanggyo'); ok(T.opened('hyanggyo'), '향교 열림'); await D(T, 'hyanggyo');
  T.useR('npc_gyogwan', '액외'); ok(dis(T, '교생 명부에') && dis(T, '서재에') && en(T, '액외') && en(T, '석전제') && dis(T, '담 밖') && dis(T, '재지기'), '상민 남 — 액외·제물 열림, 윗줄·서재·담 밖·재지기 회색');
  const g0 = g.life.values.grain, h1 = g.life.values.heart; T.pick('액외'); await D(T, 'hyanggyo');
  ok(T.done('hyanggyo') && g.flags.has('hg:extra') && g.life.values.grain === g0 + 1 && g.life.values.heart === h1 - 1 && shown.roll_ink === true, '액외 교생(🌾+1 🤝-1, roll_ink 보임)');
  T.use('gyosaengbook_1'); ok(T.S.says.some((s) => s.includes('낙강충군')), '오른 뒤 「교생 명부 — 이름이 올랐다」');
  T.on('sit:exam:done'); T.goTo('bongsu'); ok(T.opened('bongsu'), '봉수대 열림'); await D(T, 'bongsu');
  T.useR('npc_bongsugun', '봉수군으로'); ok(en(T, '봉수군으로') && en(T, '불을 둘') && dis(T, '주인 대신') && dis(T, '봉수군이 졸았다') && dis(T, '봉수군 밥') && dis(T, '말똥'), '상민 남 — 봉수군·둘 열림, 나무·알림·밥·말똥 회색');
  const h2 = g.life.values.heart; T.pick('봉수군으로'); await D(T, 'bongsu'); ok(T.done('bongsu') && g.flags.has('bs:duty') && g.life.values.heart === h2 + 1 && shown.beacon_fire === true && shown.beacon_fire2 !== true, '봉수군(🤝+1, 첫 불만 보임)');
  T.use('beacon_1'); ok(T.S.says.some((s) => s.includes('산과 산이')), '올린 뒤 「연대 — 불이 올랐다」');
}

// ---- 2판: 양반 여(곡식 5) — 향교: 담 밖(🤝+1) / 사기소: 제기(🌾-2, 그릇 보임) / 봉수: 알린다(🎖+1 🤝-2)
{
  const T = mkGame('f', { craft: 2, heart: 2, grain: 5, rank: 2, branch: 'gongsin', status: 'sadaebu', nation: 'goryeo' }, 'eye'); const { g, shown } = T;
  ok(g.life.status === 'yangban', '양반 여');
  T.on('sit:corvee:done', 'sit:hangeul:done', 'sit:exam:done');
  T.goTo('hyanggyo'); await D(T, 'hyanggyo'); T.useR('npc_gyogwan', '담 밖'); ok(dis(T, '교생 명부에') && dis(T, '액외') && dis(T, '서재에') && en(T, '석전제') && en(T, '담 밖') && dis(T, '재지기'), '양반 여 — 명부·액외 회색(여자), 제물·담 밖 열림');
  const h0 = g.life.values.heart; T.pick('담 밖'); await D(T, 'hyanggyo'); ok(T.done('hyanggyo') && g.flags.has('hg:outside') && g.life.values.heart === h0 + 1 && shown.roll_ink !== true, '담 밖에서 들음(🤝+1, 명부 그대로)');
  T.goTo('sagiso'); await D(T, 'sagiso'); T.useR('npc_sagijang', '제기를'); ok(dis(T, '물레를') && en(T, '제기를') && dis(T, '흙을') && dis(T, '공납 장부') && dis(T, '방납꾼'), '양반 솜씨 2 — 제기 열림, 물레·흙·장부·방납 회색');
  const g0 = g.life.values.grain; T.pick('제기를'); await D(T, 'sagiso'); ok(T.done('sagiso') && g.flags.has('sg:order') && g.life.values.grain === g0 - 2 && shown.buncheong === true && shown.slip_white === true, '제기를 시킴(🌾-2, 분청 그릇 보임)');
  T.use('wheel_1'); ok(T.S.says.some((s) => s.includes('빚은 손은 남는다')), '빚은 뒤 「분청 그릇 더미」');
  T.goTo('bongsu'); await D(T, 'bongsu'); T.useR('npc_bongsugun', '봉수군이 졸았다'); ok(dis(T, '봉수군으로') && dis(T, '불을 둘') && en(T, '봉수군이 졸았다') && en(T, '봉수군 밥') && dis(T, '말똥'), '양반 여 — 알림·밥 열림, 봉수군·말똥 회색');
  const r0 = g.life.values.rank, h1 = g.life.values.heart; T.pick('봉수군이 졸았다'); await D(T, 'bongsu'); ok(T.done('bongsu') && g.flags.has('bs:report') && g.life.values.rank === r0 + 1 && g.life.values.heart === h1 - 2 && shown.beacon_fire !== true, '관아에 알림(🎖+1 🤝-2, 불은 안 보임)');
}

// ---- 3판: 솔거 남(곡식 0) — 향교: 재지기만(🤝+1) / 사기소: 흙만 / 봉수: 땔나무(🤝+1, 불 보임)
{
  const T = mkGame('m', { craft: 1, heart: 1, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'goryeo' }); const { g, shown } = T;
  ok(g.life.status === 'solgeo', '솔거 노비');
  T.on('sit:corvee:done', 'sit:hangeul:done', 'sit:exam:done');
  T.goTo('hyanggyo'); await D(T, 'hyanggyo'); T.useR('npc_gyogwan', '재지기'); ok(dis(T, '교생 명부에') && dis(T, '액외') && dis(T, '석전제') && dis(T, '담 밖') && en(T, '재지기'), '노비(곡식 0) — 재지기만 열림');
  const h0 = g.life.values.heart; T.pick('재지기'); await D(T, 'hyanggyo'); ok(T.done('hyanggyo') && g.flags.has('hg:sweep') && g.life.values.heart === h0 + 1, '뜰을 쓺(🤝+1)');
  T.goTo('sagiso'); await D(T, 'sagiso'); T.useR('npc_sagijang', '흙을'); ok(en(T, '흙을') && dis(T, '방납꾼') && dis(T, '제기를'), '노비 — 흙 열림, 방납·제기 회색'); T.pick('흙을'); await D(T, 'sagiso'); ok(T.done('sagiso') && g.flags.has('sg:dig'), '흙·장작');
  T.goTo('bongsu'); await D(T, 'bongsu'); T.useR('npc_bongsugun', '주인 대신'); ok(dis(T, '봉수군으로') && en(T, '주인 대신') && dis(T, '봉수군이 졸았다'), '노비 — 땔나무만 열림');
  const h1 = g.life.values.heart; T.pick('주인 대신'); await D(T, 'bongsu'); ok(T.done('bongsu') && g.flags.has('bs:fuel') && g.life.values.heart === h1 + 1 && shown.beacon_fire === true, '땔나무(🤝+1, 불 보임)');
}

// ---- 4판: 중인 남(솜씨 4·곡식 1) — 사기소: 물레 열림(솜씨)·장부(🎖+1)·더 적기 열림 / 향교: 액외 열림 / 봉수: 알림 열림 · 백정 남: 말똥(🌾+1)·재지기·제물 회색 · 서얼 남: 서재(🤝+1)
{
  const T = mkGame('m', { craft: 8, heart: 2, grain: 1, rank: 1, branch: 'hyangni', status: 'hyangni', nation: 'goryeo' }); const { g, shown } = T;
  ok(g.life.status === 'jungin' && g.life.values.craft >= 3, '중인 · 솜씨 셋 넘음');
  T.on('sit:corvee:done', 'sit:hangeul:done', 'sit:exam:done');
  T.goTo('sagiso'); await D(T, 'sagiso'); T.useR('npc_sagijang', '공납 장부'); ok(en(T, '물레를') && dis(T, '제기를') && dis(T, '흙을') && en(T, '공납 장부') && en(T, '장부에 더') && dis(T, '방납꾼'), '중인 솜씨 4 — 물레(솜씨)·장부·더 적기 열림, 제기·흙·방납 회색');
  const r0 = g.life.values.rank; T.pick('공납 장부'); await D(T, 'sagiso'); ok(T.done('sagiso') && g.flags.has('sg:book') && g.life.values.rank === r0 + 1 && shown.buncheong !== true, '장부 적음(🎖+1, 그릇 안 보임)');
  T.goTo('hyanggyo'); await D(T, 'hyanggyo'); T.useR('npc_gyogwan', '액외'); ok(en(T, '액외') && dis(T, '교생 명부에'), '중인 남 — 액외 열림, 윗줄 회색'); T.pick('액외'); await D(T, 'hyanggyo'); ok(T.done('hyanggyo') && g.flags.has('hg:extra') && shown.roll_ink === true, '액외 교생 → 명부 글씨 보임');
  T.goTo('bongsu'); await D(T, 'bongsu'); T.useR('npc_bongsugun', '봉수군이 졸았다'); ok(en(T, '봉수군이 졸았다') && dis(T, '봉수군으로'), '중인 — 알림 열림, 봉수군 회색'); T.pick('봉수군이 졸았다'); await D(T, 'bongsu'); ok(T.done('bongsu') && g.flags.has('bs:report'), '관아에 알림');
  const B = mkGame('m', { craft: 1, heart: 1, grain: 2, rank: 0, branch: 'drifter', status: 'drifter', nation: 'goryeo' }); ok(B.g.life.status === 'baekjeong', '백정');
  B.on('sit:corvee:done', 'sit:hangeul:done', 'sit:exam:done');
  B.goTo('bongsu'); await D(B, 'bongsu'); B.useR('npc_bongsugun', '말똥'); ok(en(B, '말똥') && dis(B, '봉수군으로') && dis(B, '주인 대신'), '백정 — 말똥 열림, 봉수군·나무 회색'); const bg = B.g.life.values.grain; B.pick('말똥'); await D(B, 'bongsu'); ok(B.done('bongsu') && B.g.flags.has('bs:dung') && B.g.life.values.grain === bg + 1, '말똥(🌾+1)');
  B.goTo('hyanggyo'); await D(B, 'hyanggyo'); B.useR('npc_gyogwan', '재지기'); ok(en(B, '재지기') && dis(B, '석전제') && dis(B, '액외'), '백정(곡식 2) — 재지기 열림, 제물·액외 회색(신분)');
  const E = mkGame('m', { craft: 2, heart: 2, grain: 3, rank: 3, branch: 'gongsin', status: 'sadaebu', nation: 'goryeo' }, 'belly'); ok(E.g.life.status === 'seoeol', '서얼(공신 집 + belly)');
  E.on('sit:hangeul:done'); E.goTo('hyanggyo'); await D(E, 'hyanggyo'); E.useR('npc_gyogwan', '서재에'); ok(en(E, '서재에') && dis(E, '교생 명부에') && dis(E, '액외') && en(E, '석전제'), '서얼 남 — 서재 열림, 윗줄·액외 회색'); const eh = E.g.life.values.heart; E.pick('서재에'); await D(E, 'hyanggyo'); ok(E.done('hyanggyo') && E.g.flags.has('hg:west') && E.g.life.values.heart === eh + 1, '서재(🤝+1)');
}

// ---- 굴림 실패: 상민 낙강(hg:failed 🌾-2, 명부 그대로) · 거짓 불(bs:false 🤝-2)
{
  Math.random = () => 0.99;
  const X = mkGame('m', { craft: 1, heart: 6, grain: 3, rank: 0, branch: 'yangmin', status: 'yangmin', nation: 'goryeo' }, 'eye'); X.g.life.tries = {};
  X.on('sit:hangeul:done', 'sit:exam:done'); X.goTo('hyanggyo'); await D(X, 'hyanggyo'); X.useR('gyosaengbook_1', '액외'); X.pick('액외'); await D(X, 'hyanggyo');
  ok(X.done('hyanggyo') && X.g.flags.has('hg:failed') && !X.g.flags.has('hg:extra') && X.g.life.values.grain === 1 && X.shown.roll_ink !== true, '낙강 → hg:failed(🌾-2, 명부 글씨 안 보임), 상황은 끝남');
  X.goTo('bongsu'); await D(X, 'bongsu'); X.useR('beacon_1', '불을 둘'); X.pick('불을 둘'); await D(X, 'bongsu');
  ok(X.done('bongsu') && X.g.flags.has('bs:false') && !X.g.flags.has('bs:two') && X.g.life.values.heart === 1 && X.shown.beacon_fire2 !== true, '거짓 불 → bs:false(🤝-2: 넘겨받은 인심 3 → 1, 둘째 불 안 보임)');
  Math.random = () => 0.01;
}
console.log(`joseon 고리 3(새 장소 3): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
