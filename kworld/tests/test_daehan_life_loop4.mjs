// 대한민국 큰 사건 「농지 개혁 — 처음으로 내 땅. 벽보는 사흘, 말뚝은 봄」(nongji 깊이기 ⑩) — 급한 일 「벽보 — 신청 사흘」 90초(소작만, nj:late) · 소작 「전쟁 전에 지주에게서 산다 ⚠」(곡식 셋 회색, 눈 2 → 땅문서·5년 없음 / 실패 곡식만 가고 분배 논) · 지주 「증권으로 귀속 공장 ⚠」(눈 2 → 상인 🌾+2 ✋+1 / 실패 종잇값 🌾-3) · 자작농 「옆집에 첫 해 곡식 꿔 주기」(곡식 하나 회색 🤝+2) · 땅 없는 집 읍사무소 「농지위원에게 매달린다 ⚠」(인심 둘 회색, 눈 2 → 한 뙈기·농사짓는 집) · 끝 갈림 48 · 그 뒤 규칙 아홉. WebGL 없이 규칙만.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gaehang-life': JSON.stringify({ craft: 2, heart: 4, grain: 4, rank: 0, branch: 'haksaeng', status: 'haksaeng', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['jijugate_1','sojakjip_1','so_1','radio_1','jangteo_1','tv_1','yeondan_1','eup_1','tupyo_1','eunhaeng_1','bogeonso_1','guho_1','hakgyo_1','dari_1','boat_1','malttuk_1','vinyl_1','saemaeul_1','gongjang_1','apateu_1','yeok_1','train_1','bus_1','bangongho_1','cheoljomang_1',
  'npc_jiju','npc_sojak','npc_dolaon','npc_jumo','npc_itaeyeong','npc_eupjang','npc_eunhaengwon','npc_ganhosa','npc_moksa','npc_gyosa','npc_haksaeng','npc_pinanmin','npc_nongbu','npc_saemaeul','npc_jeontaeil','npc_yeogong','npc_yeokmu','npc_gwangbu','npc_chajang','npc_chobyeong',
  'halfpanja_1','floursack_1','crutch_1','workbench_1','yangpum_1','radiobox_1','lottery_1','noticeboard_1','uniformstall_1','npc_sangigunin','npc_jeonpasa','npc_gyogam'];
const AREAS = { maeul: [-22, -16], jiju: [-29, -22], jangteo: [0, 12], gwangjang: [0, 38], eupsamuso: [26, 28], eunhaeng: [28, 35], bogeonso: [-24, 35], gyohoe: [-46, 31], hakgyo: [-50, -2], dari: [-60, 10], naru: [-62, 34], nongji: [55, -12], deul: [85, -14], saemaeul: [54, 18], gongjang: [60, 41], apateu: [84, 52], yeok: [20, 66], seoulgil: [34, -36], bangongho: [-88, -68], hyujeon: [-18, -100], panja: [-34, 94], sueri: [-14, 56], junghak: [-50, 52] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const HID = { halfpanja_1: [['panja_roof', 'roof']], workbench_1: [['tv_light', 'tv']], lottery_1: [['lottery_balls', 'balls']], cheoljomang_1: [['barbed', 'barbed']], saemaeul_1: [['slate_blue', 'slate']], dari_1: [['bridge_new', 'bridge']], apateu_1: [['apt_concrete', 'apt']] };
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
const MIX = ['panja', 'sueri', 'junghak'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };
const ALL = ['sit:gwangbok:done', 'sit:bundan:done', 'sit:nongji:done', 'sit:jeonjaeng:done', 'sit:gongbu:done', 'sit:sanupwha:done', 'sit:geori:done', 'sit:seongeo:done', 'sit:oehwan:done'];
const endOf = (g) => g.life.d.situations.find((s) => s.id === 'oneul').choices[0].then[0].end;
const carry = (key) => JSON.parse(store['kworld_carry:daehan-life'] || '{}')[key];


// ===== 데이터 전수: 길 15 · 급한 일 nongji(소작·90초·nj:late 선택지) · 끝 갈림 48(bought·plot 은 firstland 앞, certfactory·certpaper·buylost·lender 는 landgone 앞, late 는 limp 앞) · 그 뒤 규칙 아홉(if 가 실제 끝 갈림) · 회색 넷 · status 실재 · 평가 문구 없음
{
  const life = J('life'), items = J('items'), npcs = J('npcs'), world = J('world');
  const s = life.situations.find((x) => x.id === 'nongji');
  ok(s.choices.length === 15 && ['buy', 'buyfail', 'factory', 'paper', 'lend', 'plot', 'pleadfail', 'late'].every((id) => s.choices.some((c) => c.id === id)), '길 15');
  ok(s.body.some((b) => b.startsWith('📜') && b.includes('→')) && s.q.a.length === 3 && new Set(s.q.a).size === 3 && !/\d{4}년/.test(s.q.a[0]), '📜 인과 한 줄 · q 셋(연도 없음)');
  const dl = world.pulse.deadlines.find((d) => d.id === 'nongji'); ok(dl && dl.sec === 90 && dl.on.includes('status:sojak') && dl.failFlag === 'nj:late' && s.choices.some((c) => c.done === 'nj:late' && c.bad), '급한 일: 소작만 90초 → nj:late 선택지(bad)');
  const br = endOf({ life: { d: life } }).branches; const idx = (id) => br.findIndex((b) => b.id === id);
  ok(br.length === 48 && idx('bought') < idx('firstland') && idx('plot') < idx('firstland') && idx('buylost') < idx('landgone') && idx('certfactory') < idx('landgone') && idx('certpaper') < idx('landgone') && idx('lender') < idx('landgone') && idx('late') < idx('limp') && idx('factory') > idx('landgone'), '끝 갈림 48 · 자리(산업화 factory 와 다른 id)');
  const rules = world.bridge.beats[1].rules; ok(rules.length === 9 && !rules.at(-1).if, '그 뒤 규칙 아홉 · 마지막 무조건');
  for (const r of rules) if (r.if) for (const tok of r.if.split('||').map((x) => x.trim())) ok(br.some((b) => 'life:' + b.id === tok), `그 뒤 ${tok} 는 실제 끝 갈림`);
  const gate = items.targets.jijugate.rename.find((r) => r.if.includes('status:jiju') && r.choices); ok(gate.choices.length === 3 && gate.choices[2].rollFailFlag === 'nj:paper' && gate.choices[2].flag === 'nj:factory', '대문 셋: 증권 공장 ⚠');
  const sj = items.targets.sojakjip.rename.find((r) => r.if.includes('status:sojak') && r.choices); ok(sj.choices.length === 3 && sj.choices[1].if === 'val:grain>=3' && sj.choices[1].gives === 'deed' && sj.choices[1].rollFailFlag === 'nj:buyfail', '마루 소작 셋: 미리 사기 곡식 셋 회색·땅문서');
  const nm = items.targets.sojakjip.rename.find((r) => r.if.includes('status:nongmin') && r.choices); ok(nm.choices.length === 2 && nm.choices[1].if === 'val:grain>=1' && nm.choices[1].flag === 'nj:lend', '마루 자작농 둘: 꿔 주기 곡식 하나 회색');
  const ep = items.targets.eup.rename[0]; ok(ep.if.includes('sit:nongji:open') && ep.choices[0].if === 'val:heart>=2' && ep.choices[0].rollFailFlag === 'nj:pleadfail' && ep.choices[0].gives === 'deed', '읍사무소 벽보: 매달리기 인심 둘 회색·땅문서');
  const ids = new Set(life.status.rules.map((r) => r.id)); for (const c of s.choices) if (c.status) ok(ids.has(c.status), `nongji.${c.id} 결과 신분 ${c.status} 실재`);
  const blob = JSON.stringify(items) + JSON.stringify(npcs) + JSON.stringify(world); for (const c of s.choices) ok(blob.includes(`"${c.done}"`), `nongji.${c.id} done 세우는 곳`);
  ok(npcs.eupjang.lines.some((l) => l.if === 'sit:nongji:open && !sit:nongji:done'), '읍장 농지 줄');
  const txt = JSON.stringify(s) + JSON.stringify(ep) + JSON.stringify(gate); for (const w of ['옳았', '잘못', '정의', '영웅', '폭도']) ok(!txt.includes(w), `평가 문구 「${w}」 없음`);
}
const OPEN = ['sit:gwangbok:done', 'sit:bundan:done', 'nongji:on'];
// ===== 판 1: 소작 남자(눈 밝은, 쌀 4) — 미리 사기 열림 → 성공 → 땅문서·농사짓는 집·🌾1 🤝+1 · 끝 갈림 「전쟁 전에 사 둔 집」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 4, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'sojak' && g.life.values.grain === 4, '소작 쌀 4'); on(...OPEN); goTo('nongji'); ok(opened('nongji'), '농지 개혁 열림'); closeCard();
  ok(verb(g, 'eup_1') === '살펴보기' || !verb(g, 'eup_1').includes('매달린다'), '소작: 읍사무소 매달리기 없음');
  goTo('maeul'); useR('sojakjip_1', '분배를'); ok(btn('분배를') && !btn('전쟁 전에')?.disabled && btn('못 한다'), '소작 쌀 4: 신청·미리 사기·빚 셋 다 열림');
  const h0 = g.life.values.heart; pick('전쟁 전에'); closeCard(); ok(done('nongji') && g.flags.has('nj:buy') && g.has('deed') && g.life.status === 'nongmin' && g.life.values.grain === 1 && g.life.values.heart === h0 + 1, '미리 사기 성공 → 땅문서·농사짓는 집·🌾1 🤝+1');
  g.life.end(endOf(g)); ok(g.flags.has('life:bought') && carry('branch') === 'bought' && carry('status') === 'nongmin', '끝 갈림 = 전쟁 전에 사 둔 집');
}
// ===== 판 2: 소작 여자 쌀 2 — 미리 사기 회색 → 신청 → 처음으로 내 땅(그대로) · 다른 판: nj:late 깃발 → 「벽보가 떨어졌다」 🤝-1 → 끝 갈림 「벽보를 놓친 집」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 3, grain: 2, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('f', MIX, 'belly');
  on(...OPEN); goTo('nongji'); closeCard(); goTo('maeul'); useR('sojakjip_1', '분배를'); ok(btn('전쟁 전에')?.disabled && btn('전쟁 전에').gray?.includes('세 단') !== false, '소작 쌀 2: 미리 사기 회색'); pick('분배를'); closeCard();
  ok(done('nongji') && g.flags.has('nj:get') && g.has('deed') && g.life.status === 'nongmin' && g.life.values.grain === 3, '신청 → 처음으로 내 땅(그대로)');
  g.life.end(endOf(g)); ok(g.flags.has('life:firstland'), '끝 갈림 = 처음으로 땅을 가진 집');
}
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 1, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, closeCard, goTo, on, done } = mkGame('m', MIX, 'foot');
  on(...OPEN); goTo('nongji'); closeCard(); const h0 = g.life.values.heart; on('nj:late'); closeCard(); ok(done('nongji') && g.flags.has('nj:late') && g.life.values.heart === h0 - 1 && g.life.status === 'sojak', '벽보 떨어짐 → 🤝-1 · 소작 그대로');
  g.life.end(endOf(g)); ok(g.flags.has('life:late'), '끝 갈림 = 벽보를 놓친 집');
}
// ===== 판 3: 소작 남자 쌀 3 — 미리 사기 굴림 실패 → 곡식은 가고 분배 논(nj:buyfail) · 🌾0 · 농사짓는 집 · 끝 갈림 「두 번 산 땅」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 3, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, on, done } = mkGame('m', MIX, 'belly');
  on(...OPEN); goTo('nongji'); closeCard(); Math.random = () => 0.99; g.life.tries = {};
  goTo('maeul'); useR('sojakjip_1', '전쟁 전에'); pick('전쟁 전에'); closeCard(); ok(done('nongji') && g.flags.has('nj:buyfail') && !g.has('deed') && g.life.values.grain === 0 && g.life.status === 'nongmin', '굴림 실패 → 곡식 셋 가고 분배 논 · 땅문서 없음');
  g.life.end(endOf(g)); ok(g.flags.has('life:buylost'), '끝 갈림 = 두 번 산 땅'); Math.random = () => 0.01;
}
// ===== 판 4: 지주 남자(눈, 쌀 5) — 증권으로 공장 성공 → 상인 🌾+2 ✋+1 · 끝 갈림 「증권으로 공장을 산 집」 / 실패 → 종잇값 🌾-3 농사짓는 집 → 「증권이 종잇값이 된 집」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 4, heart: 3, grain: 5, rank: 1, branch: 'jiju', status: 'jiju', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'jiju', '지주'); on(...OPEN); goTo('nongji'); closeCard(); goTo('jiju'); useR('jijugate_1', '땅을 내놓는다'); ok(btn('땅을 내놓는다') && btn('미리 판다') && btn('지가증권으로'), '대문 셋');
  const g0 = g.life.values.grain, c0 = g.life.values.craft; pick('지가증권으로'); closeCard(); ok(done('nongji') && g.flags.has('nj:factory') && g.life.status === 'sangin' && g.life.values.grain === g0 + 2 && g.life.values.craft === c0 + 1, '증권 공장 성공 → 상인 🌾+2 ✋+1');
  g.life.end(endOf(g)); ok(g.flags.has('life:certfactory') && !g.flags.has('life:landgone') && carry('status') === 'sangin', '끝 갈림 = 증권으로 공장을 산 집(땅을 내놓은 집 아님)');
}
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 5, rank: 1, branch: 'jiju', status: 'jiju', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, on, done } = mkGame('m', MIX, 'belly');
  on(...OPEN); goTo('nongji'); closeCard(); Math.random = () => 0.99; g.life.tries = {};
  goTo('jiju'); useR('jijugate_1', '지가증권으로'); pick('지가증권으로'); closeCard(); ok(done('nongji') && g.flags.has('nj:paper') && g.life.status === 'nongmin' && g.life.values.grain === 2, '굴림 실패 → 종잇값 🌾-3 · 농사짓는 집');
  g.life.end(endOf(g)); ok(g.flags.has('life:certpaper'), '끝 갈림 = 증권이 종잇값이 된 집'); Math.random = () => 0.01;
}
// ===== 판 5: 자작농(쌀 1) — 꿔 주기 열림 → 🌾0 🤝+2 · 끝 갈림 「꿔 준 집」 / 쌀 0 이면 회색 → 신고
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 1, rank: 0, branch: 'nongmin', status: 'nongmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('f', MIX, 'hand');
  ok(g.life.status === 'nongmin', '자작농'); on(...OPEN); goTo('nongji'); closeCard(); goTo('maeul'); useR('sojakjip_1', '내 땅을'); ok(btn('내 땅을') && !btn('옆집 소작에게')?.disabled, '자작농 쌀 1: 신고·꿔 주기 열림');
  const h0 = g.life.values.heart; pick('옆집 소작에게'); closeCard(); ok(done('nongji') && g.flags.has('nj:lend') && g.life.values.grain === 0 && g.life.values.heart === h0 + 2 && g.life.status === 'nongmin', '꿔 주기 → 🌾0 🤝+2');
  g.life.end(endOf(g)); ok(g.flags.has('life:lender'), '끝 갈림 = 꿔 준 집');
}
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 0, rank: 0, branch: 'nongmin', status: 'nongmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('m', MIX, 'hand');
  on(...OPEN); goTo('nongji'); closeCard(); goTo('maeul'); useR('sojakjip_1', '내 땅을'); ok(btn('옆집 소작에게')?.disabled, '자작농 쌀 0: 꿔 주기 회색'); pick('내 땅을'); closeCard(); ok(done('nongji') && g.flags.has('nj:report'), '신고');
  g.life.end(endOf(g)); ok(g.flags.has('life:nongmin'), '끝 갈림 = 농사짓는 집');
}
// ===== 판 6: 노동자(인심 3) — 읍사무소 매달리기 열림 → 성공 → 한 뙈기·농사짓는 집·땅문서 🌾+1 🤝+1 · 끝 갈림 「한 뙈기」 / 인심 1 회색 → 본다 / 실패 → 고개 저음(노동자 그대로)
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 1, rank: 0, branch: 'nodongja', status: 'nodongja', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'nodongja' && g.life.values.heart === 3, '노동자 인심 3'); on(...OPEN); goTo('nongji'); closeCard();
  goTo('maeul'); ok(verb(g, 'sojakjip_1').includes('본다') && verb(g, 'jijugate_1') === '살펴보기', '땅 없는 집: 마루 본다 · 대문 살펴보기');
  goTo('eupsamuso'); useR('eup_1', '농지위원'); ok(!btn('농지위원')?.disabled && btn('본다'), '읍사무소: 매달리기 열림');
  const g0 = g.life.values.grain, h0 = g.life.values.heart; pick('농지위원'); closeCard(); ok(done('nongji') && g.flags.has('nj:plot') && g.has('deed') && g.life.status === 'nongmin' && g.life.values.grain === g0 + 1 && g.life.values.heart === h0 + 1, '매달리기 성공 → 한 뙈기·농사짓는 집·땅문서');
  g.life.end(endOf(g)); ok(g.flags.has('life:plot') && !g.flags.has('life:firstland'), '끝 갈림 = 한 뙈기');
}
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, rank: 0, branch: 'nodongja', status: 'nodongja', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, done } = mkGame('f', MIX, 'eye');
  ok(g.life.values.heart === 1, '인심 1'); on(...OPEN); goTo('nongji'); closeCard(); goTo('eupsamuso'); useR('eup_1', '농지위원'); ok(btn('농지위원')?.disabled, '인심 1: 매달리기 회색'); pick('본다'); closeCard(); ok(done('nongji') && g.flags.has('nj:watch') && g.life.status === 'nodongja', '본다 → 노동자 그대로');
}
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 1, rank: 0, branch: 'nodongja', status: 'nodongja', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, on, done } = mkGame('m', MIX, 'belly');
  on(...OPEN); goTo('nongji'); closeCard(); Math.random = () => 0.99; g.life.tries = {};
  goTo('eupsamuso'); useR('eup_1', '농지위원'); pick('농지위원'); closeCard(); ok(done('nongji') && g.flags.has('nj:pleadfail') && !g.has('deed') && g.life.status === 'nodongja', '굴림 실패 → 고개 저음 · 노동자 그대로 · 땅문서 없음');
  g.life.end(endOf(g)); ok(g.flags.has('life:nongmin') && !g.flags.has('life:plot'), '끝 갈림 = 한 뙈기 아님(기본 농사짓는 집 — 대한민국 끝 갈림엔 직업 줄 없음)'); Math.random = () => 0.01;
}
console.log(`\n대한민국 농지 개혁 깊이기: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
