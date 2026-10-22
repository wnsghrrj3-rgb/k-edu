// 조선 전기 큰 사건 「임진왜란 — 문서가 타는 밤, 곳간이 열리는 날」(imjin 깊이기 ⑦) — 양반 남 「의병을 일으킨다」 인심 둘·「곳간을 연다」 곡식 셋 회색 · 양반 여 「안채 곳간을 연다」(imjin:feed) · 노비 「곡식 셋을 바쳐 면천 — 납속」(imjin:napsok → 상민) · 행랑채 궤짝 「노비 문서를 불에 넣는다 ⚠」(눈, 성공 drifter / 실패 다리) · 급한 일 imjin:late → 왜군이 먼저 온 집 · 끝 갈림 33 · 그 뒤 규칙 다섯. WebGL 없이 규칙만.
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
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toImjin = (T) => { skip(T.g, ['hopae', 'corvee', 'hangeul', 'exam', 'sahwa']); T.on('war:on'); T.goTo('eogwi'); T.closeCard(); };
const DL = () => J('world').pulse.deadlines.find((d) => d.id === 'imjin');
const END = J('life').situations.find((s) => s.id === 'horan').choices[0].then[0].end;
const endOf = (T) => { T.closeCard(); T.g.life.endCard(END); return [...T.g.flags].filter((f) => f.startsWith('life:')); };
const YANG = (heart, grain) => ({ craft: 3, heart, grain, rank: 2, branch: 'gongsin', status: 'sadaebu', nation: 'goryeo' });
const SOL = (grain) => ({ craft: 1, heart: 1, grain, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'goryeo' });
const SANG = { craft: 2, heart: 2, grain: 2, rank: 0, branch: 'reclaim', status: 'yangmin', nation: 'goryeo' };
// ---- 데이터
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const im = life.situations.find((s) => s.id === 'imjin'); const NEWC = ['feed', 'napsok', 'burnpaper', 'papercaught'];
  ok(NEWC.every((id) => im.choices.some((c) => c.id === id && c.done === 'imjin:' + id && c.fact && !/\d{3,4}/.test(c.fact))) && im.body.some((b) => b.startsWith('📜') && b.includes('종이와 곡식')) && im.q.a[0].includes('납속') && im.choices.find((c) => c.id === 'napsok').status === 'sangmin' && im.choices.find((c) => c.id === 'burnpaper').status === 'drifter', '길 넷 추가 · fact 연도 없음 · 📜 종이와 곡식 · q 납속 · 납속→상민·궤짝→drifter');
  const dl = DL(); ok(dl && dl.sec === 75 && dl.failFlag === 'imjin:late' && im.choices.some((c) => c.id === 'late' && c.done === 'imjin:late'), '급한 일 75초 그대로 · imjin:late → 늦은 길');
  const ub = npcs.uibyeong.lines; const ym = ub.find((l) => l.if.includes('status:yangban && sex:m')); const yf = ub.find((l) => l.if.includes('status:yangban && sex:f'));
  ok(ym.choices[0].if === 'val:heart>=2' && ym.choices[0].gray && ym.choices[1].if === 'val:grain>=3' && ym.choices[1].gray && yf.choices.some((c) => c.flag === 'imjin:feed' && c.if === 'val:grain>=2' && c.gray), '의병장 줄 — 양반 남 인심 둘·곡식 셋 회색 · 양반 여 안채 곳간(곡식 둘)');
  ok(['solgeo', 'oegeo'].every((st) => ub.some((l) => l.if.includes('status:' + st) && l.if.includes('!imjin:napsok') && l.choices.some((c) => c.flag === 'imjin:napsok' && c.if === 'val:grain>=3' && c.gray))), '노비 줄 — 납속(곡식 셋 회색), 둘 다');
  const sh = items.targets.slavehut.rename[0]; ok(sh.flag === 'imjin:burnpaper' && sh.roll?.ab === '눈' && sh.roll.hard === 2 && sh.rollFailFlag === 'imjin:papercaught' && sh.rollHurt === 'leg' && sh.if.includes('status:solgeo || status:oegeo') && items.targets.hideout.rename.filter((r) => String(r.flag).includes('imjin:run')).every((r) => r.if.includes('!imjin:burnpaper')), '행랑채 궤짝 — 문서를 불에 넣는다(눈 2, 실패 다리) · 숯가마 길은 궤짝 뒤엔 안 뜸');
  const ends = []; for (const s of life.situations) for (const c of s.choices || []) for (const t of c.then || []) if (t.end) ends.push(t.end.branches.map((b) => b.id));
  ok(ends.length === 6 && ends.every((ids) => ids.length === 33 && ids.indexOf('feeder') === ids.indexOf('scholar') - 1 && ids.indexOf('feeder') > ids.indexOf('uibyeong') && ids.indexOf('napsok') === ids.indexOf('freed') - 1 && ids.indexOf('burned') === ids.indexOf('drifter') - 1 && ids.indexOf('papercaught') === ids.indexOf('runaway') - 1 && ids.indexOf('warlate') === ids.indexOf('limp') - 1), '끝 갈림 33 — feeder 는 uibyeong 뒤·scholar 앞 / napsok 은 freed 앞 / burned 는 drifter 앞 / papercaught 는 runaway 앞 / warlate 는 limp 앞(여섯 사본)');
  const rules = world.bridge.beats[1].rules; const idx = (f) => rules.findIndex((r) => r.if === f);
  ok(['life:feeder', 'life:napsok', 'life:burned', 'life:papercaught', 'life:warlate'].every((f) => idx(f) >= 0) && idx('life:feeder') < idx('life:yangban') && idx('life:napsok') < idx('life:freed || life:gisul') && idx('life:burned') < idx('life:runaway || life:drifter') && idx('life:papercaught') < idx('life:kk_caught || life:solgeo || life:oegeo') && idx('life:warlate') === rules.length - 2 && !rules.at(-1).if, '그 뒤 규칙 다섯 · 순서 · 마지막 무조건');
}
// ---- 판 1 — 양반 남, 인심 1·곡식 4: 의병 회색 → 곳간을 연다 → 곳간을 연 집
{
  const T = mkGame('m', YANG(1, 4), 'eye'); const { g, use, pick, btn, done } = T;
  toImjin(T); ok(g.life.status === 'yangban' && T.opened('imjin'), '양반 · 임진왜란 열림'); ok(g.cond(DL().on) && !g.cond(DL().until), '급한 일 선다');
  use('npc_uibyeong'); const b = btn('의병을 일으킨다'); ok(b && b.disabled, '인심 하나 → 의병을 일으킨다 회색'); ok(btn('마을에 남는다') && !btn('마을에 남는다').disabled, '곡식 넷 → 곳간을 연다 열림');
  const gr = g.life.values.grain; pick('마을에 남는다'); ok(done('imjin') && g.flags.has('imjin:stay') && g.life.values.grain === gr - 3, '곳간을 열었다 🌾-3'); ok(g.cond(DL().until), '정하면 급한 일 끝');
  const L = endOf(T); ok(L.includes('life:feeder'), '끝 갈림 「곳간을 연 양반의 집」');
}
// ---- 판 2 — 양반 남, 인심 3·곡식 1: 곳간 회색 → 의병을 일으킨다 → 의병장의 집
{
  const T = mkGame('m', YANG(3, 1), 'body'); const { g, use, pick, btn } = T;
  toImjin(T); use('npc_uibyeong'); ok(btn('마을에 남는다')?.disabled && !btn('의병을 일으킨다')?.disabled, '곡식 하나 → 곳간 회색, 인심 셋 → 의병 열림');
  pick('의병을 일으킨다'); ok(g.flags.has('imjin:lead'), '의병을 일으켰다'); const L = endOf(T); ok(L.includes('life:uibyeong') && !L.includes('life:feeder'), '끝 갈림 「의병장의 집」(feeder 아님)');
}
// ---- 판 3 — 양반 여, 곡식 2: 안채 곳간을 연다 → imjin:feed 🌾-2 🤝+2 → 곳간을 연 집
{
  const T = mkGame('f', YANG(2, 2), 'hand'); const { g, use, pick, btn, done } = T;
  toImjin(T); use('npc_uibyeong'); ok(btn('안채 곳간을 연다') && !btn('안채 곳간을 연다').disabled, '양반 여 곡식 둘 → 안채 곳간 열림');
  const gr = g.life.values.grain, h = g.life.values.heart; pick('안채 곳간을 연다'); ok(done('imjin') && g.flags.has('imjin:feed') && g.life.values.grain === gr - 2 && g.life.values.heart === h + 2, '안채 곳간을 열었다 🌾-2 🤝+2');
  const L = endOf(T); ok(L.includes('life:feeder'), '끝 갈림 「곳간을 연 양반의 집」');
  const U = mkGame('f', YANG(2, 1), 'hand'); toImjin(U); U.use('npc_uibyeong'); ok(U.btn('안채 곳간을 연다')?.disabled && U.btn('마을에 남아'), '곡식 하나 → 안채 곳간 회색, 돌보기는 열림');
}
// ---- 판 4 — 솔거 남, 곡식 3: 납속 → 상민 🌾-3 → 곡식으로 면천한 집
{
  const T = mkGame('m', SOL(3), 'eye'); const { g, use, pick, btn, done } = T;
  toImjin(T); ok(g.life.status === 'solgeo', '솔거 노비'); use('npc_uibyeong'); ok(btn('곡식 셋을 바쳐') && !btn('곡식 셋을 바쳐').disabled, '곡식 셋 → 납속 열림');
  pick('곡식 셋을 바쳐'); ok(done('imjin') && g.flags.has('imjin:napsok') && g.life.status === 'sangmin' && g.life.values.grain === 0, '납속 → 상민, 곡식 0');
  const L = endOf(T); ok(L.includes('life:napsok') && !L.includes('life:freed'), '끝 갈림 「곡식으로 면천한 집」');
}
// ---- 판 5 — 솔거 남, 곡식 0: 납속 회색 → 행랑채 궤짝(눈 성공) → 달아남 drifter → 문서를 불에 넣고 달아난 집
{
  const T = mkGame('m', SOL(0), 'eye'); const { g, ix, use, btn, done } = T;
  toImjin(T); use('npc_uibyeong'); ok(btn('곡식 셋을 바쳐')?.disabled, '곡식 0 → 납속 회색'); T.S.panel = null;   // 첫 단추(의병 굴림)를 누르지 않고 닫는다
  ok(g.promptFor(ix.get('slavehut_1')).verb.includes('불에 넣는다'), '행랑채 궤짝 → 문서를 불에 넣는다 ⚠'); ok(g.promptFor(ix.get('hideout_1')).verb.includes('달아난다'), '숯가마 길도 아직 있음');
  use('slavehut_1'); ok(done('imjin') && g.flags.has('imjin:burnpaper') && g.life.status === 'drifter' && !g.life.hurt.has('leg'), '문서를 불에 넣었다 → drifter'); ok(g.promptFor(ix.get('hideout_1')).verb === '살펴보기', '궤짝 뒤엔 숯가마 달아나기 안 뜸');
  const L = endOf(T); ok(L.includes('life:burned') && !L.includes('life:drifter'), '끝 갈림 「문서를 불에 넣고 달아난 집」');
}
// ---- 판 6 — 솔거 남, 궤짝 눈 굴림 실패 → 다리 → 궤짝 앞에서 잡힌 집 / 상민 급한 일 실패 → 왜군이 먼저 온 집
{
  Math.random = () => 0.99;
  const T = mkGame('m', SOL(0), 'belly'); const { g, use, done } = T;
  toImjin(T); T.closeCard(); use('slavehut_1'); ok(done('imjin') && g.flags.has('imjin:papercaught') && g.life.hurt.has('leg') && g.life.status === 'solgeo', '굴림 실패 → 잡혔다, 다리, 종 그대로');
  const L = endOf(T); ok(L.includes('life:papercaught'), '끝 갈림 「궤짝 앞에서 잡힌 집」');
  Math.random = () => 0.01;
  const U = mkGame('m', SANG, 'hand'); toImjin(U); ok(U.g.life.status === 'sangmin' && U.g.cond(DL().on), '상민 · 급한 일 선다'); U.on('imjin:late'); ok(U.done('imjin') && U.g.flags.has('imjin:late'), 'imjin:late → 늦은 길로 끝');
  const L2 = endOf(U); ok(L2.includes('life:warlate'), '끝 갈림 「왜군이 먼저 온 집」');
}
console.log(`joseon 고리 4(임진왜란 깊이기): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
