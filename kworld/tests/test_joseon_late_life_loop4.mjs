// 조선 후기 큰 사건 「공명첩 — 돈이 신분을 사는 날」(gongmyeong 깊이기 ⑧) — 급한 일 「상의 종이가 떨어진다」 90초(살 수 있는 집만, gong:late → 종이가 떨어진 집) · 상민 남 「도고에게 꾸어 산다 ⚠」(곡식 셋~넷 → 양반 행세+빚) · 상민 여 「아들 이름으로 산다」(곡식 다섯) · 양반 「향안에서 뺀다」 인심 둘 회색 + 「족보에 양자로 적어 준다 ⚠」(눈, 실패 벼슬 -1) · 솔거 「주인에게 다섯 단 ⚠」(눈, 성공 상민 / 실패 곡식만 뺏김) · 백정 「호적을 옮긴다 ⚠」(눈, 성공 상민 / 실패 그대로) · 끝 갈림 50(13 사본) · 그 뒤 규칙 아홉. WebGL 없이 규칙만.
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
const MIX = ['seowon', 'yugi', 'jochang'];
const IX = ['hopae_1','samun_1','examhall_1','jagyeokru_1','hwangok_1','hangeul_1','seoan_1','sewing_1','slavehut_1','ybgate_1','bigpaddy_1','bigpaddy_2','smallpaddy_1','smallpaddy_2','homepaddy_1','bestall_1','stonepile_1','rack_1','hideout_1','pass_1','qingcamp_1','boat_1','waeship_1',
  'hyangan_1','hyangseat_1','nanstall_1','newstall_1','dogostore_1','madang_1','buk_1','tobacco_1','dryshed_1','ginseng_1','westship_1','crate_1','rowboat_1','onggikiln_1','onggi_1','jarbook_1','burnfield_1','potato_1',
  'npc_jumo','npc_nongbu','npc_pojol','npc_cheongjigi','npc_seonbi','npc_ai','npc_nageune','npc_hunjang','npc_baetsagong','npc_sojak','npc_baekjeong','npc_anju','npc_nobi','npc_ajeon','npc_gwanno','npc_kkeokjeong','npc_uibyeong','npc_sunsin',
  'npc_jwasu','npc_nanjeon','npc_gwangdae','npc_gasam','npc_munjeong','npc_gyou','npc_hwajeonmin',
  'saaek_1','mukpae_1','seowonland_1','brassforge_1','brassware_1','wagebook_1','jochang_1','tollbook_1','joseonship_1','npc_yusaeng','npc_yugijang','npc_changri'];
// 엔진 좌표(x, z = -블렌더 y)
const AREAS = { eogwi: [0, 40], outroad: [0, 58], jangteo: [0, 6], jumak: [-13.5, 5], well: [6.5, 2.5], yangban: [0, -22], haengrang: [-9.5, -23.5], sarang: [-7, -27], anchae: [1, -37.5], gwana: [-27, 5], dongheon: [-30, -8.5], choga: [28, 7], field: [27, 30], seodang: [-31, 29.5], naru: [9, 93], deul: [66, 9], oettan: [72, 79], gogae: [-100, 70], sanjung: [-80, -84],
  hyangcheong: [32, -28], nanjeon: [-14.5, 24.2], nori: [-24, 55], crops: [27, 59], isyang: [-50, 94.5], gyouchon: [34, -90], hwajeon: [76, -58], seowon: [-42, 48], yugi: [92, 58], jochang: [42, 90] };
const mkGame = (sex, carry, char = 'hand', mixed = MIX) => {
  store['kworld_carry:joseon-life'] = JSON.stringify(carry);
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const HID = { saaek_1: [['saaek_board', 'board'], ['saaek_gold', 'gold']], brassware_1: [['brass_ware', 'brass']], jochang_1: [['rice_sack', 'sack']], joseonship_1: [['rice_sack', 'shipsack']] };
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
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toGong = (T) => { skip(T.g, ['monaegi', 'jangsi']); T.on('gongmyeong:on'); T.goTo('gwana'); T.closeCard(); };
const DL = () => J('world').pulse.deadlines.find((d) => d.id === 'gongmyeong');
const END = J('life').situations.find((s) => s.id === 'uprising').choices[0].then[0].end;
const endOf = (T) => { T.closeCard(); T.g.life.endCard(END); return [...T.g.flags].filter((f) => f.startsWith('life:')); };
const C = (branch, status, grain, heart = 2, rank = 0) => ({ craft: 2, heart, grain, rank, branch, status, nation: 'joseon' });
// ---- 데이터
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const gm = life.situations.find((s) => s.id === 'gongmyeong'); const NEWC = ['late', 'borrowbuy', 'sonbuy', 'adopt', 'adoptcaught', 'solsok', 'solrefuse', 'move', 'movecaught'];
  ok(NEWC.every((id) => gm.choices.some((c) => c.id === id && c.done === 'gong:' + id && c.fact && !/\d{3,4}/.test(c.fact))) && gm.body.some((b) => b.startsWith('📜') && b.includes('종이 한 장의 이름')) && gm.q.a[0].includes('향안') && gm.choices.find((c) => c.id === 'borrowbuy').status === 'sinyang' && gm.choices.find((c) => c.id === 'borrowbuy').flag === 'debt:on' && gm.choices.find((c) => c.id === 'sonbuy').status === 'sinyang' && gm.choices.find((c) => c.id === 'solsok').status === 'sangmin' && gm.choices.find((c) => c.id === 'move').status === 'sangmin' && ['late', 'adoptcaught', 'solrefuse', 'movecaught'].every((id) => gm.choices.find((c) => c.id === id).bad && gm.choices.find((c) => c.id === id).why), '길 아홉 · fact 연도 없음 · 📜 종이 한 장의 이름 · q 향안 · 신분 변화 넷 · 나쁜 길 넷에 왜');
  const dl = DL(); ok(dl && dl.sec === 90 && dl.failFlag === 'gong:late' && dl.until === 'sit:gongmyeong:done' && dl.on.includes('sex:m') && dl.on.includes('val:grain>=3') && dl.on.includes('status:sangmin || status:dogo'), '급한 일 90초 · 살 수 있는 집만 · gong:late');
  const rn = items.targets.hopae.rename; const sm = rn.find((r) => r.if.includes('status:sangmin || status:dogo') && r.if.includes('sex:m')); const yb = rn.find((r) => r.if.includes('status:yangban') && r.choices); const so = rn.find((r) => r.if.includes('status:solgeo')); const bk = rn.find((r) => r.if.includes('status:baekjeong')); const fi = rn.findIndex((r) => r.if.includes('sex:f') && r.if.includes('status:sangmin')); const fg = rn.findIndex((r) => r.if.endsWith('sex:f && !gong:daughter'));
  ok(sm.choices[1].flag === 'gong:borrowbuy' && sm.choices[1].if === 'val:grain>=3 && val:grain<5' && sm.choices[1].gray && sm.choices[1].gives === 'deed', '상민 남 — 꾸어 산다(곡식 셋~넷 회색, 땅문서)');
  ok(yb.choices[0].flag === 'gong:out' && yb.choices[0].if === 'val:heart>=2' && yb.choices[0].gray && yb.choices[2].flag === 'gong:adopt' && yb.choices[2].roll?.ab === '눈' && yb.choices[2].roll.hard === 2 && yb.choices[2].rollFailFlag === 'gong:adoptcaught', '양반 — 뺀다 인심 둘 회색 · 양자 눈 2(실패 adoptcaught)');
  ok(so.choices[0].flag === 'gong:solsok' && so.choices[0].if === 'val:grain>=5' && so.choices[0].gray && so.choices[0].rollFailFlag === 'gong:solrefuse' && so.choices[1].flag === 'gong:nosell' && so.if.includes('!gong:solsok'), '솔거 — 주인에게 다섯 단(곡식 다섯 회색, 실패 solrefuse) / 본다');
  ok(bk.choices[0].flag === 'gong:move' && bk.choices[0].if === 'val:grain>=3' && bk.choices[0].rollFailFlag === 'gong:movecaught' && bk.choices[1].flag === 'gong:nobaek', '백정 — 호적 옮기기(곡식 셋, 실패 movecaught) / 엽전');
  ok(fi >= 0 && fg > fi && rn[fi].choices[0].flag === 'gong:sonbuy' && rn[fi].choices[0].if === 'val:grain>=5' && rn[fi].choices[1].flag === 'gong:daughter', '상민 쪽 여자 줄이 일반 여자 줄보다 앞 — 아들 이름(곡식 다섯) / 안채로');
  ok(npcs.nobi.lines.findIndex((l) => l.if?.startsWith('sit:gongmyeong:open') && l.if.includes('status:solgeo')) > npcs.nobi.lines.findIndex((l) => l.if?.startsWith('sit:escape:open')) && npcs.baekjeong.lines.some((l) => l.if?.startsWith('sit:gongmyeong:open')) && npcs.ajeon.lines.some((l) => l.if?.endsWith('sex:f') && l.text.includes('아들 이름')), 'NPC 한마디 — 행랑 노비 줄은 도망 줄 뒤 · 백정 · 아전 여자 줄 아들 이름');
  const ends = []; for (const s of life.situations) for (const c of s.choices || []) for (const t of c.then || []) if (t.end) ends.push(t.end.branches);
  const idx = (br, id, key) => br.findIndex((b) => b.id === id && (key === undefined || (key ? 'key' in b : !('key' in b))));
  ok(ends.length === 13 && ends.every((br) => br.length === 50 && idx(br, 'gonglate') === idx(br, 'limp') - 1 && idx(br, 'sonbuy') === idx(br, 'debtrank') - 1 && idx(br, 'debtrank') === idx(br, 'sinyang', false) - 1 && idx(br, 'adopt') === idx(br, 'adoptcaught') - 1 && idx(br, 'adoptcaught') === idx(br, 'yangban') - 1 && idx(br, 'solsok') === idx(br, 'soknyang') - 1 && idx(br, 'solrefuse') === idx(br, 'solgeo') - 1 && idx(br, 'move') === idx(br, 'movecaught') - 1 && idx(br, 'movecaught') === idx(br, 'baekjeong') - 1), '끝 갈림 50 × 13 사본 — gonglate 는 limp 앞 / sonbuy·debtrank 는 sinyang(향안 아님) 앞 / adopt·adoptcaught 는 yangban 앞 / solsok 은 soknyang 앞 / solrefuse 는 solgeo 앞 / move·movecaught 는 baekjeong 앞');
  const rules = world.bridge.beats[1].rules; const ri = (f) => rules.findIndex((r) => r.if === f); const A_YB = 'life:buyrank || life:sinyang || life:yangban || life:open', A_NB = 'life:soknyang || life:freed_gov || life:runaway';
  ok(['life:debtrank', 'life:sonbuy', 'life:adopt', 'life:adoptcaught', 'life:gonglate', 'life:solsok', 'life:solrefuse', 'life:move', 'life:movecaught'].every((f) => ri(f) >= 0) && ri('life:gonglate') < ri(A_YB) && ri('life:debtrank') < ri(A_YB) && ri('life:solsok') < ri(A_NB) && ri('life:solrefuse') < ri(A_NB) && ri('life:move') < ri('life:baekjeong') && ri('life:movecaught') < ri('life:baekjeong') && !rules.at(-1).if, '그 뒤 규칙 아홉 · 순서 · 마지막 무조건');
}
// ---- 판 1 — 상민 남, 곡식 4: 「산다」 회색 · 「꾸어 산다」 → 양반 행세 + 빚 🌾1 🎖1 → 빚으로 산 집
{
  const T = mkGame('m', C('sangmin', 'sangmin', 4), 'eye'); const { g, use, pick, btn, done } = T;
  toGong(T); ok(g.life.status === 'sangmin' && T.opened('gongmyeong'), '상민 · 공명첩 열림'); ok(g.cond(DL().on) && !g.cond(DL().until), '곡식 넷 남자 → 급한 일 선다');
  use('hopae_1'); ok(btn('공명첩을 산다')?.disabled && btn('도고에게 꾸어') && !btn('도고에게 꾸어').disabled, '곡식 넷 → 산다 회색, 꾸어 산다 열림');
  pick('도고에게 꾸어'); ok(done('gongmyeong') && g.flags.has('gong:borrowbuy') && g.flags.has('debt:on') && g.life.status === 'sinyang' && g.life.values.grain === 1 && g.life.values.rank === 1 && g.inventory.includes('deed'), '꾸어 샀다 → 양반 행세·빚·🌾1·🎖1·땅문서'); ok(g.cond(DL().until), '정하면 급한 일 끝');
  const L = endOf(T); ok(L.includes('life:debtrank') && !L.includes('life:sinyang'), '끝 갈림 「빚으로 양반 행세를 산 집」');
  const U = mkGame('m', C('sangmin', 'sangmin', 6), 'eye'); toGong(U); U.use('hopae_1'); ok(U.btn('도고에게 꾸어')?.disabled && !U.btn('공명첩을 산다')?.disabled, '곡식 여섯 → 꾸어 산다 회색(다섯이면 그냥 산다), 산다 열림');
  const V = mkGame('m', C('sangmin', 'sangmin', 2), 'eye'); toGong(V); ok(!V.g.cond(DL().on), '곡식 둘 → 급한 일 안 섬');
}
// ---- 판 2 — 상민 남, 곡식 3: 급한 일 늦음 → gong:late 🌾-2 → 종이가 떨어진 집
{
  const T = mkGame('m', C('sangmin', 'sangmin', 3), 'hand'); const { g, done } = T;
  toGong(T); ok(g.cond(DL().on), '곡식 셋 → 급한 일 선다'); T.on('gong:late'); ok(done('gongmyeong') && g.flags.has('gong:late') && g.life.status === 'sangmin' && g.life.values.grain === 1, '늦었다 → 상민 그대로·군포 🌾-2');
  const L = endOf(T); ok(L.includes('life:gonglate') && !L.includes('life:sangmin'), '끝 갈림 「종이가 떨어진 집」');
}
// ---- 판 3 — 상민 여, 곡식 5: 「아들 이름으로 산다」 → sinyang 🌾0 → 아들 이름으로 산 집 / 곡식 2 → 회색
{
  const T = mkGame('f', C('sangmin', 'sangmin', 5), 'eye'); const { g, use, pick, btn, done } = T;
  toGong(T); ok(!g.cond(DL().on), '여자 → 급한 일 안 섬'); use('hopae_1'); ok(btn('아들 이름으로') && !btn('아들 이름으로').disabled && btn('안 산다'), '상민 여 곡식 다섯 → 아들 이름 열림');
  pick('아들 이름으로'); ok(done('gongmyeong') && g.flags.has('gong:sonbuy') && g.life.status === 'sinyang' && g.life.values.grain === 0 && g.inventory.includes('deed'), '아들 이름으로 샀다 → 양반 행세 🌾0');
  const L = endOf(T); ok(L.includes('life:sonbuy') && !L.includes('life:debtrank') && !L.includes('life:sinyang'), '끝 갈림 「아들 이름으로 산 집」');
  const U = mkGame('f', C('sangmin', 'sangmin', 2), 'eye'); toGong(U); U.use('hopae_1'); ok(U.btn('아들 이름으로')?.disabled, '곡식 둘 → 회색');
  U.pick('안 산다'); ok(U.done('gongmyeong') && U.g.flags.has('gong:daughter'), '안 산다 → 안채로(전처럼)');
}
// ---- 판 4 — 양반, 인심 1·곡식 2: 「향안에서 뺀다」 회색 · 양자 눈 성공 → 🌾+4 🤝-2 → 족보에 남을 적어 준 집 / 실패 → 🎖-1 🌾-2 → 족보 위조로 걸린 집
{
  const T = mkGame('m', C('yangban', 'yangban', 2, 1, 2), 'eye'); const { g, use, pick, btn, done } = T;
  toGong(T); ok(g.life.status === 'yangban' && !g.cond(DL().on), '양반 · 급한 일 안 섬'); use('hopae_1'); ok(btn('향안에서 뺀다')?.disabled && !btn('끼워 준다')?.disabled && !btn('족보에 양자로')?.disabled, '인심 하나 → 뺀다 회색, 끼워 준다·양자 열림');
  pick('족보에 양자로'); ok(done('gongmyeong') && g.flags.has('gong:adopt') && g.life.values.grain === 6 && g.life.values.heart === 0 && g.life.status === 'yangban', '양자로 적어 줬다 🌾+4 🤝-2(바닥 0)');
  const L = endOf(T); ok(L.includes('life:adopt') && !L.includes('life:yangban'), '끝 갈림 「족보에 남을 적어 준 양반의 집」');
  Math.random = () => 0.99;
  const U = mkGame('m', C('yangban', 'yangban', 2, 3, 2), 'foot'); toGong(U); U.use('hopae_1'); ok(!U.btn('향안에서 뺀다')?.disabled, '인심 셋 → 뺀다 열림');
  U.g.life.values.rank = 2; U.pick('족보에 양자로'); ok(U.done('gongmyeong') && U.g.flags.has('gong:adoptcaught') && U.g.life.values.rank === 1 && U.g.life.values.grain === 0, '굴림 실패 → 걸렸다 🎖-1 🌾-2');
  const L2 = endOf(U); ok(L2.includes('life:adoptcaught') && !L2.includes('life:adopt'), '끝 갈림 「족보 위조로 걸린 집」');
  Math.random = () => 0.01;
}
// ---- 판 5 — 솔거 남, 곡식 5: 「주인에게 다섯 단」 성공 → 상민 🌾0 → 문서를 찢은 집 / 곡식 3 → 회색 / 실패 → 곡식만 뺏김, 종 그대로
{
  const T = mkGame('m', C('solgeo', 'solgeo', 5, 1), 'eye'); const { g, use, pick, btn, done } = T;
  toGong(T); ok(g.life.status === 'solgeo' && !g.cond(DL().on), '솔거 · 급한 일 안 섬'); use('hopae_1'); ok(btn('주인에게 다섯 단') && !btn('주인에게 다섯 단').disabled && btn('본다'), '곡식 다섯 → 주인에게 열림');
  pick('주인에게 다섯 단'); ok(done('gongmyeong') && g.flags.has('gong:solsok') && g.life.status === 'sangmin' && g.life.values.grain === 0, '속량 → 상민 🌾0');
  const L = endOf(T); ok(L.includes('life:solsok') && !L.includes('life:soknyang') && !L.includes('life:solgeo'), '끝 갈림 「다섯 단으로 문서를 찢은 집」');
  const U = mkGame('m', C('solgeo', 'solgeo', 3, 1), 'eye'); toGong(U); U.use('hopae_1'); ok(U.btn('주인에게 다섯 단')?.disabled, '곡식 셋 → 회색'); U.pick('본다'); ok(U.done('gongmyeong') && U.g.flags.has('gong:nosell') && U.g.life.status === 'solgeo', '본다 → 노비 그대로(전처럼)');
  Math.random = () => 0.99;
  const V = mkGame('m', C('solgeo', 'solgeo', 5, 1), 'belly'); toGong(V); V.use('hopae_1'); V.pick('주인에게 다섯 단'); ok(V.done('gongmyeong') && V.g.flags.has('gong:solrefuse') && V.g.life.status === 'solgeo' && V.g.life.values.grain === 0 && !V.g.life.hurt.has('leg'), '굴림 실패 → 곡식만 뺏김, 종 그대로, 흔적 없음');
  const L2 = endOf(V); ok(L2.includes('life:solrefuse') && !L2.includes('life:solgeo'), '끝 갈림 「곡식만 뺏긴 집」');
  Math.random = () => 0.01;
}
// ---- 판 6 — 백정, 곡식 3: 「호적을 옮긴다」 성공 → 상민 🌾0 → 호적을 옮긴 집 / 곡식 1 → 회색 → 엽전 / 실패 → 그대로
{
  const T = mkGame('m', C('baekjeong', 'baekjeong', 3, 1), 'eye'); const { g, use, pick, btn, done } = T;
  toGong(T); ok(g.life.status === 'baekjeong' && !g.cond(DL().on), '백정 · 급한 일 안 섬'); use('hopae_1'); ok(btn('호적을 다른 고을로') && !btn('호적을 다른 고을로').disabled && btn('엽전을 꺼낸다'), '곡식 셋 → 호적 옮기기 열림');
  pick('호적을 다른 고을로'); ok(done('gongmyeong') && g.flags.has('gong:move') && g.life.status === 'sangmin' && g.life.values.grain === 0, '호적을 옮겼다 → 상민 🌾0');
  const L = endOf(T); ok(L.includes('life:move') && !L.includes('life:baekjeong') && !L.includes('life:sangmin'), '끝 갈림 「호적을 옮긴 집」');
  const U = mkGame('m', C('baekjeong', 'baekjeong', 1, 1), 'eye'); toGong(U); U.use('hopae_1'); ok(U.btn('호적을 다른 고을로')?.disabled, '곡식 하나 → 회색'); U.pick('엽전을 꺼낸다'); ok(U.done('gongmyeong') && U.g.flags.has('gong:nobaek') && U.g.life.status === 'baekjeong', '엽전 → 안 판다(전처럼)');
  Math.random = () => 0.99;
  const V = mkGame('m', C('baekjeong', 'baekjeong', 3, 1), 'belly'); toGong(V); V.use('hopae_1'); V.pick('호적을 다른 고을로'); ok(V.done('gongmyeong') && V.g.flags.has('gong:movecaught') && V.g.life.status === 'baekjeong' && V.g.life.values.grain === 0, '굴림 실패 → 「도한」 그대로, 곡식은 안 돌아옴');
  const L2 = endOf(V); ok(L2.includes('life:movecaught') && !L2.includes('life:move') && !L2.includes('life:baekjeong'), '끝 갈림 「호적을 옮기다 걸린 집」');
  Math.random = () => 0.01;
}
console.log(`joseon-late 고리 4(공명첩 깊이기): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
