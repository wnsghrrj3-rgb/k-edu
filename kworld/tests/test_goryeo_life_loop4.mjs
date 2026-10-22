// 고려 큰 사건 「땅문서를 태우는 날 — 과전법. 더미가 타기 전에」(land 깊이기 ⑥) — 급한 일 land:late(양민·외거만, 찾으면 끝) · 양민 「맡긴 채 둔다」(투탁 → 같이 탐) · 불 자리 ⚠ 내 논 문서도 같이(burnmine) · 권문 「더미를 넘긴다」(눈 굴림, 실패 → keep) · 솔거 「노비 문서를 더미에 섞는다」(눈, 실패 → 다리) · 끝 갈림 35 · 그 뒤 규칙 셋.
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
const IX = ['munbeolgate_1', 'slavehut_1', 'oegeohut_1', 'ledger_1', 'well_1', 'stone_1', 'examhall_1', 'eumseogate_1', 'bigpaddy_1', 'smallpaddy_1', 'cottonfield_1', 'kiln_1', 'celadon_1', 'sogate_1', 'pagoda_1', 'woodblock_1', 'offering_1', 'fortgate_1', 'wall_1', 'drum_1', 'fortgranary_1', 'spearrack_1', 'wardrum_1', 'songship_1', 'ganghwaship_1', 'tradepile_1', 'arabstall_1', 'fish_1', 'meetrock_1', 'hollow_1', 'log_1', 'pass_1', 'talkmat_1', 'mongolcamp_1', 'pgranary_1', 'deedpile_1', 'firepit_1', 'powergate_1',
  'npc_munbeol', 'npc_hyangni', 'npc_yangmin', 'npc_solgeo', 'npc_oegeo', 'npc_examiner', 'npc_sadaebu', 'npc_soin', 'npc_overseer', 'npc_monk', 'npc_carver', 'npc_gimyunhu', 'npc_general', 'npc_merchant', 'npc_arab', 'npc_manjeok', 'npc_seohui', 'npc_gwonmun'];
const AREAS = { village: [0, 0], office: [36, 32], paddy: [-40, -30], so: [-84, -62], temple: [-58, 38], fortress: [0, 52], camp: [48, -4], port: [18, -60], ford: [56, -67], hill: [70, -104], woods: [-84, 78], pass: [2, 106], power: [66, -28] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:silla-life'] = JSON.stringify(carry); const mixed = ['celadon', 'cotton', 'inherit', 'yeokgwan'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map();
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
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
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const pick = (label) => { const b = btn(label); if (!b) { console.log('버튼 없음', label, S.panel?.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const useR = (name, label) => { use(name); if (!btn(label) && S.panel?.b.length === 1) { closeCard(); use(name); } };
  const on = (...flags) => { for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toLand = (T) => { skip(T.g, ['angeom', 'exam', 'khitan', 'port', 'coup', 'mongol']); T.on('land:on'); T.goTo('power'); T.closeCard(); };
const DL = () => J('world').pulse.deadlines.find((d) => d.id === 'land');
const endOf = async (T) => { T.closeCard(); await settle(); await settle(); return [...T.g.flags].filter((f) => f.startsWith('life:')); };   // 끝 카드(다시 태어난다)는 닫지 않는다
const YANG = { craft: 2, heart: 2, grain: 4, rank: 0, branch: 'nameless', status: 'farmer', nation: 'silla' };
// ---- 데이터
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const dl = DL(); ok(dl && dl.sec === 90 && dl.on.includes('status:yangmin || status:oegeo') && dl.on.includes('!land:reclaim') && dl.until.includes('land:reclaim') && dl.failFlag === 'land:late', '급한 일 「불 자리 — 더미가 타기 전에」 90초 · 양민·외거만 · 찾으면 끝');
  const ld = life.situations.find((s) => s.id === 'land'); const NEWC = ['yield', 'trust', 'late', 'slip', 'slipcaught'];
  ok(NEWC.every((id) => ld.choices.some((c) => c.id === id && c.done === 'land:' + id && c.then?.some((t) => t.end))) && NEWC.every((id) => { const c = ld.choices.find((x) => x.id === id); return c.fact && !/\d{3,4}/.test(c.fact); }) && ld.body.some((b) => b.startsWith('📜') && b.includes('칼이 아니라 불로')) && ld.q.a[0].includes('과전'), '길 다섯 추가(끝 카드 있음) · fact 연도 없음 · 📜 칼이 아니라 불로 · q 과전');
  ok(items.targets.firepit.rename[0].flag.includes('land:burnmine') && items.targets.firepit.rename[0].if.includes('status:yangmin || status:oegeo'), '불 자리 첫 규칙 — 양민·외거가 안 찾고 태우면 burnmine');
  const gw = npcs.gwonmun.lines; ok(gw.some((l) => l.if.includes('status:gwonmun') && l.choices?.some((c) => c.flag === 'land:yield' && c.roll?.ab === '눈' && c.rollFailFlag === 'land:keep')) && gw.some((l) => l.if.includes('status:yangmin') && l.choices?.some((c) => c.flag === 'land:trust')) && gw.some((l) => l.if.includes('status:solgeo') && l.choices?.some((c) => c.flag === 'land:slip' && c.rollFailFlag === 'land:slipcaught' && c.rollHurt === 'leg')), '권문세족 줄 — 넘긴다(눈, 실패 keep) · 양민 맡긴 채 둔다 · 솔거 노비 문서 섞기(눈, 실패 다리)');
  ok(ld.choices.every((c) => { const ids = c.then.find((t) => t.end).end.branches.map((b) => b.id); return ids.length === 35 && ids.indexOf('gwonmun_yield') === ids.indexOf('gwonmun_fall') - 1 && ids.indexOf('burnmine') === ids.indexOf('reclaim') - 1 && ids.indexOf('late') === ids.indexOf('burnmine') - 1 && ids.indexOf('trusted') === ids.indexOf('late') - 1 && ids.indexOf('slip') === ids.indexOf('oegeo') - 1; }), '끝 갈림 35 — gwonmun_yield 는 gwonmun_fall 앞·trusted·late·burnmine 은 reclaim 앞·slip 은 oegeo 앞(아홉 사본)');
  const rules = world.bridge.beats[1].rules; ok(rules.some((r) => r.if === 'life:gwonmun_yield') && rules.some((r) => r.if === 'life:slip') && rules.some((r) => r.if === 'life:trusted || life:late || life:burnmine') && rules.findIndex((r) => r.if === 'life:gwonmun_yield') < rules.findIndex((r) => r.if === 'life:gwonmun_fall') && rules.findIndex((r) => r.if === 'life:slip') < rules.findIndex((r) => r.if === 'life:oegeo || life:solgeo') && !rules.at(-1).if, '그 뒤 규칙 셋 · 순서 · 마지막 무조건');
}
// ---- 판 1 — 양민 남자: 급한 일 선다 → 더미에서 내 문서(눈 성공) → 급한 일 끝 → 남의 문서 태움 → 이성계 → 땅을 되찾은 집
{
  const T = mkGame('m', YANG, 'eye'); const { g, ix, use, pick, closeCard, done } = T;
  toLand(T); ok(g.life.status === 'yangmin' && T.opened('land'), '양민 · 땅문서 열림'); ok(g.cond(DL().on) && !g.cond(DL().until), '급한 일: 양민은 선다');
  ok(g.promptFor(ix.get('firepit_1')).verb.includes('⚠'), '안 찾고 태우는 길은 ⚠ 내 논 문서도');
  use('deedpile_1'); ok(g.flags.has('land:reclaim') && g.has('deed'), '내 문서를 찾았다'); ok(g.cond(DL().until), '찾으면 급한 일 끝');
  ok(g.promptFor(ix.get('firepit_1')).verb.includes('남의 땅문서'), '찾은 뒤엔 「남의 땅문서를 태운다」'); use('firepit_1'); ok(g.flags.has('land:burn') && !g.flags.has('land:burnmine'), '남의 문서만 탔다');
  use('npc_sadaebu'); pick('이성계 편'); ok(done('land'), '이성계 편'); const L = await endOf(T); ok(L.includes('life:reclaim') && !L.includes('life:burnmine'), '끝 갈림 「땅을 되찾은 집」');
}
// ---- 판 2 — 양민 여자: 권문세족 「맡긴 채 둔다」 → 🌾-1 🤝-1 → 맡긴 논이 탄 집
{
  const T = mkGame('f', YANG, 'hand'); const { g, useR, pick, done } = T;
  toLand(T); const gr = g.life.values.grain, h = g.life.values.heart;
  useR('npc_gwonmun', '맡긴 채'); pick('맡긴 채'); ok(done('land') && g.flags.has('land:trust') && g.life.values.grain === gr - 1 && g.life.values.heart === h - 1, '맡긴 채 두었다 → 같이 탔다 🌾-1 🤝-1');
  ok(!g.cond(DL().on), '맡기면 급한 일도 안 선다'); const L = await endOf(T); ok(L.includes('life:trusted'), '끝 갈림 「맡긴 논이 탄 집」');
}
// ---- 판 3 — 양민 남자: 급한 일 실패 land:late → 🌾-1 → 더미가 먼저 탄 집
{
  const T = mkGame('m', YANG, 'foot'); const { g, done } = T;
  toLand(T); const gr = g.life.values.grain; g.flag('land:late'); ok(done('land') && g.life.values.grain === gr - 1, '더미가 먼저 탔다 🌾-1');
  const L = await endOf(T); ok(L.includes('life:late') && !L.includes('life:reclaim'), '끝 갈림 「더미가 먼저 탄 집」');
}
// ---- 판 4 — 양민 남자: 안 찾고 태움(⚠) → burnmine → 더미는 살펴보기만 → 이성계 → 제 논 문서를 제 손으로 태운 집
{
  const T = mkGame('m', YANG, 'eye'); const { g, ix, use, pick, done } = T;
  toLand(T); use('firepit_1'); ok(g.flags.has('land:burn') && g.flags.has('land:burnmine') && g.cond(DL().until), '내 논 문서도 같이 탔다 · 급한 일 끝');
  ok(g.promptFor(ix.get('deedpile_1')).verb === '살펴보기', '탄 뒤엔 더미에서 찾을 것이 없다');
  use('npc_sadaebu'); pick('이성계 편'); ok(done('land'), '이성계 편'); const L = await endOf(T); ok(L.includes('life:burnmine') && !L.includes('life:reclaim'), '끝 갈림 「제 논 문서를 제 손으로 태운 집」');
}
// ---- 판 5 — 권문세족: 「더미를 넘긴다」 눈 굴림 성공 → yield 🌾-2 🤝+1 → 땅을 넘기고 이름을 남긴 집 / 실패 → keep → 땅과 함께 무너진 집
{
  const T = mkGame('f', { craft: 4, heart: 6, grain: 9, rank: 6, branch: 'silla_royal', status: 'jingol', nation: 'silla' }, 'eye'); const { g, ix, useR, pick, done } = T;
  toLand(T); g.life.setStatusTo('gwonmun'); ok(g.life.status === 'gwonmun' && !g.cond(DL().on), '권문세족 — 급한 일 안 선다');
  ok(g.promptFor(ix.get('firepit_1')).verb === '살펴보기', '권문은 안 태운다'); const gr = g.life.values.grain, h = g.life.values.heart;
  useR('npc_gwonmun', '더미를 넘긴다'); pick('더미를 넘긴다'); ok(done('land') && g.flags.has('land:yield') && !g.flags.has('land:keep') && g.life.values.grain === gr - 2 && g.life.values.heart === h + 1, '넘겼다 → 🌾-2 🤝+1');
  const L = await endOf(T); ok(L.includes('life:gwonmun_yield'), '끝 갈림 「땅을 넘기고 이름을 남긴 집」');
  Math.random = () => 0.99;
  const U = mkGame('f', { craft: 4, heart: 6, grain: 9, rank: 6, branch: 'silla_royal', status: 'jingol', nation: 'silla' }, 'hand');
  toLand(U); U.g.life.setStatusTo('gwonmun'); const g2 = U.g.life.values.grain; U.useR('npc_gwonmun', '더미를 넘긴다'); U.pick('더미를 넘긴다'); ok(U.done('land') && U.g.flags.has('land:keep') && !U.g.flags.has('land:yield') && U.g.life.values.grain === g2 - 4, '굴림 실패 → 더미째 갔다(keep) 🌾-4');
  const L2 = await endOf(U); ok(L2.includes('life:gwonmun_fall'), '끝 갈림 「땅과 함께 무너진 집」'); Math.random = () => 0.01;
}
// ---- 판 6 — 솔거 노비 남자: 「노비 문서를 더미에 섞는다」 성공 → slip 🤝-1 → 노비 문서를 불에 섞은 집 / 실패 → 다리 + slipcaught
{
  const T = mkGame('m', YANG, 'eye'); const { g, useR, pick, btn, done } = T;
  toLand(T); g.life.setStatusTo('solgeo'); ok(g.life.status === 'solgeo' && !g.cond(DL().on), '솔거 노비 — 급한 일 안 선다'); const h = g.life.values.heart;
  useR('npc_gwonmun', '노비 문서'); ok(btn('주인 짐을') && btn('노비 문서') && !btn('노비 문서').disabled, '노비 문서 섞기 보임(다리 성함)'); pick('노비 문서'); ok(done('land') && g.flags.has('land:slip') && g.life.values.heart === h - 1 && g.life.status === 'solgeo', '섞었다 🤝-1 · 신분 그대로');
  const L = await endOf(T); ok(L.includes('life:slip') && !L.includes('life:solgeo'), '끝 갈림 「노비 문서를 불에 섞은 집」');
  Math.random = () => 0.99;
  const U = mkGame('m', YANG, 'hand'); toLand(U); U.g.life.setStatusTo('solgeo'); U.useR('npc_gwonmun', '노비 문서'); U.pick('노비 문서'); ok(U.done('land') && U.g.flags.has('land:slipcaught') && U.g.life.hurt.has('leg'), '굴림 실패 → 들켰다 · 다리');
  const L2 = await endOf(U); ok(L2.includes('life:slipcaught') || L2.includes('life:limp') || L2.includes('life:solgeo'), '끝 카드는 뜬다'); Math.random = () => 0.01;
  const V = mkGame('m', YANG, 'hand'); toLand(V); V.g.life.setStatusTo('solgeo'); V.g.life.injure('leg'); V.useR('npc_gwonmun', '노비 문서'); ok(V.btn('노비 문서')?.disabled && V.btn('노비 문서').reason.includes('다리'), '절뚝이면 회색 — 다리');
}
console.log(`test_goryeo_life_loop4: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
