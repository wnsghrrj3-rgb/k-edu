// 개항~일제 큰 사건 「3·1 운동 — 만세 아침」(samil 깊이기 ⑨) — 누구나 「선언서를 읽는다 ⚠」(눈 2, 실패 주모자 옥) · 지주 「값을 댄다」(곡식 둘 회색)/「소작인들을 말린다」 · 상인 철시/가게 · 옛 백정 「같은 줄에 선다」 · 옛 노비·소작·노동자 「쓰러진 사람을 업는다 ⚠」(몸 2, 실패 잡힘) · 교사 「교문을 잠근다」 · 협력한 집 「모른다」 ⚠(눈 2, 실패 의심 곡식 -2 벼슬 -1) · 늦음 sm:late → 늦은 집 · 끝 갈림 57(8 사본) · 그 뒤 규칙 아홉. WebGL 없이 규칙만.
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
const MIX = ['yahak', 'dorm', 'tomak'];
const IX = ['bank_1','bigpaddy_1','gaekju_1','gando_1','gongjang_1','gyohoe_1','hakgyo_1','hyeong_1','jijugate_1','jpshop_1','jusaeso_1','malmoi_1','mill_1','myeon_1','pier_1','sangil_1','segwan_1','ship_1','smallpaddy_1','sojakjip_1','yeok_1','yeondan_1',
  'npc_ahnjunggeun','npc_gaekju','npc_ijumin','npc_jeonbongjun','npc_jiju','npc_jpmerchant','npc_jusigyeong','npc_kimgu','npc_myeonseogi','npc_nodongja','npc_parkseongchun','npc_segwanwon','npc_seongyosa','npc_sojak','npc_sunsa','npc_yeogong','npc_yugwansun','npc_yundongju',
  'blackboard_1','horong_1','yahakbook_1','dormgate_1','dormroom_1','strike_1','torn_1','tomakfire_1','tomakbundle_1','npc_yahakgyosa','npc_gamdok','npc_tomakmin'];
const AREAS = { maeul: [-22, 16], jiju: [-29, 22], sojakjip: [-16, 1], outroad: [-56, 34], jangteo: [0, -12], gaekju: [-15, -11], ilbon: [0, -44], segwan: [0, -58], mill: [-20, -58], hang: [8, -84], gyohoe: [-46, -31], hakgyo: [-50, 2], jusaeso: [26, -27], myeon: [40, -8], deul: [55, 12], gongjang: [60, -39], hyeong: [90, -19], yeok: [20, 36], gando: [-104, 58], sangil: [-85, 88], yahak: [-70, -8], dorm: [59, -26], tomak: [-64, -56] };
const mkGame = (sex, carry, char = 'hand', mixed = MIX) => {
  store['kworld_carry:joseon-late-life'] = JSON.stringify(carry);
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; if (d?.hidden) g.showMats(t, d.hidden, false); }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const pick = (label) => { const b = btn(label); if (!b) { console.log('버튼 없음', label, S.panel?.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const use = (name) => { g.target = ix.get(name); g.act(); if (S.panel?.b.length === 1 && S.panel.b[0].label.startsWith('…')) { closeCard(); g.target = ix.get(name); g.act(); } };   // 상황 카드가 먼저 뜨면 닫고 한 번 더
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const on = (...flags) => { for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toSamil = (T, status) => { skip(T.g, ['gaehang', 'gabo', 'eulsa', 'toji', 'taegeukgi']); if (status) T.g.life.setStatusTo(status); T.on('samil:on', 'night:1', 'day:3', 'samil:morning'); T.goTo('jangteo'); T.closeCard(); };
const DL = () => J('world').pulse.deadlines.find((d) => d.id === 'samil');
const END = J('life').situations.find((s) => s.id === 'jingyong').choices[0].then[0].end;
const endOf = (T) => { T.closeCard(); T.g.life.endCard(END); return [...T.g.flags].filter((f) => f.startsWith('life:')); };
const C = (branch, status, grain, heart = 4, rank = 0) => ({ craft: 2, heart, grain, rank, branch, status, nation: 'joseon' });
// ---- 데이터
{
  const life = J('life'), world = J('world'), items = J('items'), npcs = J('npcs');
  const sm = life.situations.find((s) => s.id === 'samil'); const NEWC = ['read', 'readcaught', 'carry', 'carrycaught', 'cheolsi', 'openshop', 'fund', 'hold', 'sameline', 'silent', 'suspect', 'lock'];
  ok(NEWC.every((id) => sm.choices.some((c) => c.id === id && c.done === 'sm:' + id && c.fact && !/\d{3,4}/.test(c.fact))) && sm.body.some((b) => b.startsWith('📜') && b.includes('신분이 아니라 나라로')) && sm.q.a[0].includes('법에서 이미') && ['readcaught', 'carrycaught', 'suspect'].every((id) => sm.choices.find((c) => c.id === id).bad && sm.choices.find((c) => c.id === id).why) && sm.choices.find((c) => c.id === 'suspect').rank === -1 && sm.choices.find((c) => c.id === 'suspect').grain === -2, '길 열둘 · fact 연도 없음 · 📜 신분이 아니라 나라로 · q 법 · 나쁜 길 셋에 왜 · 의심 🌾-2 🎖-1');
  const dl = DL(); ok(dl && dl.sec === 60 && dl.failFlag === 'sm:late' && dl.until === 'sit:samil:done' && dl.on === 'sit:samil:open', '급한 일 60초 그대로 · sm:late');
  const rn = items.targets.yeondan.rename; const idx = (pred) => rn.findIndex(pred); const S = (st) => idx((r) => r.if.includes('status:' + st) && !r.if.includes('!status:' + st) && r.if.startsWith('sit:samil:open'));
  const gi = idx((r) => r.if.startsWith('sit:samil:open') && r.if.includes('!status:chinil')); const chi = rn[S('chinil')];
  ok([S('jiju'), S('sangin'), S('yetbaekjeong'), S('yetnobi'), S('gyosa')].every((i) => i >= 0 && i < gi) && rn[gi].choices.length === 4 && rn[gi].choices[3].showIf === 'prep:samil' && rn[gi].choices[1].flag === 'sm:read' && rn[gi].choices[1].roll.ab === '눈' && rn[gi].choices[1].roll.hard === 2 && rn[gi].choices[1].rollFailFlag === 'sm:readcaught' && rn[gi].choices[1].rollHurt === 'jail', '직업 줄 다섯이 일반 줄 앞 · 일반 줄 = 만세/읽는다(눈 2, 실패 옥)/집에/👂 미리');
  const jj = rn[S('jiju')], sg = rn[S('sangin')], bk = rn[S('yetbaekjeong')], cr = rn[S('yetnobi')], gy = rn[S('gyosa')];
  ok(jj.choices[2].flag === 'sm:fund' && jj.choices[2].if === 'val:grain>=2' && jj.choices[2].gray && jj.choices[3].flag === 'sm:hold', '지주 — 값을 댄다(곡식 둘 회색) / 말린다');
  ok(sg.choices[2].flag === 'sm:cheolsi' && sg.choices[3].flag === 'sm:openshop', '상인 — 철시 / 가게를 연다');
  ok(bk.choices[0].flag === 'sm:sameline' && bk.choices[0].rollFailFlag === 'sm:hurt' && bk.choices[0].rollHurt === 'wound' && bk.choices[0].journal === 'hyeong', '옛 백정 — 같은 줄에 선다(몸 1, 실패 다침) → 형평 기록');
  ok(cr.if.includes('status:sojak') && cr.if.includes('status:nodongja') && cr.if.includes('status:nongmin') && cr.choices[2].flag === 'sm:carry' && cr.choices[2].roll.ab === '몸' && cr.choices[2].roll.hard === 2 && cr.choices[2].rollFailFlag === 'sm:carrycaught' && cr.choices[2].rollHurt === 'jail', '옛 노비·소작·노동자·화전·농민 — 업는다(몸 2, 실패 옥)');
  ok(gy.choices[2].flag === 'sm:lock', '교사 — 교문을 잠근다');
  ok(chi.choices[1].flag === 'sm:silent' && chi.choices[1].roll.ab === '눈' && chi.choices[1].rollFailFlag === 'sm:suspect' && !chi.choices[1].rollHurt && chi.if.includes('!sm:silent') && chi.if.includes('!sm:suspect'), '협력한 집 — 「모른다」(눈 2, 실패 의심·흔적 없음)');
  ok(npcs.jiju.lines[0].if?.startsWith('sit:samil:open') && npcs.gaekju.lines[0].if?.startsWith('sit:samil:open') && npcs.sunsa.lines[0].if?.includes('status:chinil'), 'NPC 한마디 — 지주·객주·순사');
  const ends = []; for (const s of life.situations) for (const c of s.choices || []) for (const t of c.then || []) if (t.end) ends.push(t.end.branches);
  const bi = (br, id) => br.findIndex((b) => b.id === id);
  ok(ends.length === 8 && ends.every((br) => br.length === 57 && bi(br, 'reader_jail') < bi(br, 'manse_jail') && bi(br, 'carrycaught') < bi(br, 'manse_jail') && bi(br, 'reader') < bi(br, 'manse_jail') && bi(br, 'carrier') < bi(br, 'manse_jail') && bi(br, 'sameline') < bi(br, 'manse_jail') && bi(br, 'cheolsi') < bi(br, 'manse_jail') && bi(br, 'funder') < bi(br, 'manse_jail') && bi(br, 'holder') < bi(br, 'manse_jail') && bi(br, 'lockteacher') < bi(br, 'manse_jail') && bi(br, 'silent') === bi(br, 'chinil') - 2 && bi(br, 'suspect') === bi(br, 'chinil') - 1 && bi(br, 'chinil_lead') < bi(br, 'silent') && bi(br, 'samil_late') === bi(br, 'limp') - 1 && br.find((b) => b.id === 'reader').if === 'sm:read && !hurt:jail' && br.find((b) => b.id === 'sameline').if === 'sm:sameline && !hurt:wound'), '끝 갈림 57 × 8 사본 — 새 아홉은 manse_jail 앞 / silent·suspect 는 chinil_lead 뒤·chinil 앞 / samil_late 는 limp 앞');
  const rules = world.bridge.beats[1].rules; const ri = (f) => rules.findIndex((r) => r.if === f);
  ok(['life:reader || life:reader_jail', 'life:carrier || life:carrycaught', 'life:silent || life:suspect', 'life:funder', 'life:holder', 'life:sameline || life:hyeong || life:hyeong_with || life:yetbaekjeong', 'life:lockteacher', 'life:samil_late', 'life:cheolsi || life:sangin'].every((f) => ri(f) >= 0) && ri('life:reader || life:reader_jail') < ri('life:kwangbok || life:dongnip || life:dongnip_jail || life:manse_jail') && ri('life:silent || life:suspect') < ri('life:chinil || life:chinil_lead') && ri('life:funder') < ri('life:jiju || life:grab') && ri('life:holder') < ri('life:jiju || life:grab') && ri('life:lockteacher') < ri('life:haksaeng || life:gyosa || life:school') && !rules.at(-1).if, '그 뒤 규칙 아홉 · 순서 · 마지막 무조건');
}
// ---- 판 1 — 지주 남 곡식 3: 급한 일 선다 · 「값을 댄다」 → 🌾1 🤝4 → 선언서 값을 댄 집 / 곡식 1 → 회색 → 「말린다」 🤝0 → 말린 집
{
  const T = mkGame('m', C('yangban', 'yangban', 3), 'eye'); const { g, use, pick, btn, done } = T;
  toSamil(T); ok(g.life.status === 'jiju' && T.opened('samil'), '지주 · 만세 열림'); ok(g.cond(DL().on) && !g.cond(DL().until), '급한 일 선다');
  use('yeondan_1'); ok(btn('만세') && btn('선언서를 읽는다') && btn('선언서 찍을 값을') && !btn('선언서 찍을 값을').disabled && btn('소작인들을 말린다') && btn('집에'), '지주 다섯 길');
  pick('선언서 찍을 값을'); ok(done('samil') && g.flags.has('sm:fund') && g.life.values.grain === 1 && g.life.values.heart === 4 && g.life.status === 'jiju', '값을 댔다 🌾-2 🤝+2'); ok(g.cond(DL().until), '정하면 급한 일 끝');
  const L = endOf(T); ok(L.includes('life:funder') && !L.includes('life:jiju') && !L.includes('life:manse'), '끝 갈림 「선언서 값을 댄 지주의 집」');
  const U = mkGame('m', C('yangban', 'yangban', 1), 'eye'); toSamil(U); U.use('yeondan_1'); ok(U.btn('선언서 찍을 값을')?.disabled, '곡식 하나 → 값을 댄다 회색');
  U.pick('소작인들을 말린다'); ok(U.done('samil') && U.g.flags.has('sm:hold') && U.g.life.values.heart === 0, '말렸다 🤝-2(바닥 0)');
  const L2 = endOf(U); ok(L2.includes('life:holder') && !L2.includes('life:jiju'), '끝 갈림 「소작인들을 말린 지주의 집」');
}
// ---- 판 2 — 상인(도고) 여: 철시 → 🌾-2 🤝+2 → 문을 닫은 가게 / 가게를 연다 → 🌾+1 🤝-1 → 상인 그대로
{
  const T = mkGame('f', C('dogo', 'dogo', 4), 'eye'); const { g, use, pick, btn, done } = T;
  toSamil(T); ok(g.life.status === 'sangin', '상인'); use('yeondan_1'); ok(btn('가게 문을 닫는다') && btn('가게를 연다') && !btn('선언서 찍을 값을'), '상인 길');
  pick('가게 문을 닫는다'); ok(done('samil') && g.flags.has('sm:cheolsi') && g.life.values.grain === 2 && g.life.values.heart === 4, '철시 🌾-2 🤝+2');
  const L = endOf(T); ok(L.includes('life:cheolsi') && !L.includes('life:sangin'), '끝 갈림 「문을 닫은 가게의 집」');
  const U = mkGame('m', C('dogo', 'dogo', 4), 'eye'); toSamil(U); U.use('yeondan_1'); U.pick('가게를 연다'); ok(U.done('samil') && U.g.flags.has('sm:openshop') && U.g.life.values.grain === 5 && U.g.life.values.heart === 1, '가게를 열었다 🌾+1 🤝-1');
  const L2 = endOf(U); ok(L2.includes('life:sangin') && !L2.includes('life:cheolsi'), '끝 갈림 상인 그대로');
}
// ---- 판 3 — 옛 백정 남: 「같은 줄에 선다」 성공 → 🤝+3 → 같은 줄에 선 집 / 굴림 실패 → 다침 → manse_jail
{
  const T = mkGame('m', C('baekjeong', 'baekjeong', 2), 'body'); const { g, use, pick, btn, done } = T;
  toSamil(T); ok(g.life.status === 'yetbaekjeong', '옛 백정'); use('yeondan_1'); ok(btn('같은 줄에 선다') && !btn('만세 ⚠') && btn('선언서를 읽는다') && btn('집에'), '옛 백정 — 같은 줄에 선다(만세 대신)');
  pick('같은 줄에 선다'); ok(done('samil') && g.flags.has('sm:sameline') && !g.flags.has('sm:manse') && g.life.values.heart === 5 && !g.life.hurt.has('wound'), '같은 줄에 섰다 🤝+3');
  const L = endOf(T); ok(L.includes('life:sameline') && !L.includes('life:manse') && !L.includes('life:yetbaekjeong'), '끝 갈림 「같은 줄에 선 옛 백정의 집」');
  Math.random = () => 0.99;
  const U = mkGame('m', C('baekjeong', 'baekjeong', 2), 'belly'); toSamil(U); U.use('yeondan_1'); U.pick('같은 줄에 선다'); ok(U.done('samil') && U.g.flags.has('sm:hurt') && U.g.life.hurt.has('wound'), '굴림 실패 → 헌병 — 어깨');
  const L2 = endOf(U); ok(L2.includes('life:manse_jail') && !L2.includes('life:sameline'), '다친 몸 → manse_jail(같은 줄 아님)');
  Math.random = () => 0.01;
}
// ---- 판 4 — 옛 노비(솔거) 여: 「업는다」 성공 → 🤝+3 → 업은 집 / 실패 → 옥 → 업다 잡힌 집
{
  const T = mkGame('f', C('solgeo', 'solgeo', 1), 'body'); const { g, use, pick, btn, done } = T;
  toSamil(T); ok(g.life.status === 'yetnobi', '옛 노비'); use('yeondan_1'); ok(btn('쓰러진 사람을 업는다') && btn('만세') && btn('집에'), '옛 노비 — 업는다');
  pick('쓰러진 사람을 업는다'); ok(done('samil') && g.flags.has('sm:carry') && g.life.values.heart === 5 && !g.life.hurt.has('jail'), '업었다 🤝+3');
  const L = endOf(T); ok(L.includes('life:carrier') && !L.includes('life:yetnobi'), '끝 갈림 「쓰러진 사람을 업은 집」');
  Math.random = () => 0.99;
  const U = mkGame('m', C('solgeo', 'solgeo', 1), 'belly'); toSamil(U); U.use('yeondan_1'); U.pick('쓰러진 사람을 업는다'); ok(U.done('samil') && U.g.flags.has('sm:carrycaught') && U.g.life.hurt.has('jail'), '굴림 실패 → 둘 다 잡혔다, 옥');
  const L2 = endOf(U); ok(L2.includes('life:carrycaught') && !L2.includes('life:carrier') && !L2.includes('life:jail'), '끝 갈림 「업다 잡힌 집」');
  Math.random = () => 0.01;
}
// ---- 판 5 — 농민 남: 「선언서를 읽는다」 성공 → 🤝+3 → 읽은 집 / 실패 → 주모자 옥 → 읽다 잡힌 집 / 늦음 → 늦은 집
{
  const T = mkGame('m', C('sangmin', 'sangmin', 2), 'eye'); const { g, use, pick, btn, done } = T;
  toSamil(T); ok(g.life.status === 'nongmin', '농민'); use('yeondan_1'); ok(btn('선언서를 읽는다') && btn('쓰러진 사람을 업는다'), '농민 — 읽는다·업는다');
  pick('선언서를 읽는다'); ok(done('samil') && g.flags.has('sm:read') && g.life.values.heart === 5 && !g.life.hurt.has('jail'), '읽었다 🤝+3');
  const L = endOf(T); ok(L.includes('life:reader') && !L.includes('life:nongmin') && !L.includes('life:manse'), '끝 갈림 「선언서를 읽은 집」');
  Math.random = () => 0.99;
  const U = mkGame('m', C('sangmin', 'sangmin', 2), 'belly'); toSamil(U); U.use('yeondan_1'); U.pick('선언서를 읽는다'); ok(U.done('samil') && U.g.flags.has('sm:readcaught') && U.g.life.hurt.has('jail'), '굴림 실패 → 주모자, 옥');
  const L2 = endOf(U); ok(L2.includes('life:reader_jail') && !L2.includes('life:reader'), '끝 갈림 「선언서를 읽다 잡힌 집」');
  Math.random = () => 0.01;
  const V = mkGame('m', C('sangmin', 'sangmin', 2), 'eye'); toSamil(V); V.on('sm:late'); ok(V.done('samil') && V.g.flags.has('sm:late') && V.g.life.values.heart === 1, '늦었다 🤝-1');
  const L3 = endOf(V); ok(L3.includes('life:samil_late') && !L3.includes('life:nongmin'), '끝 갈림 「만세 아침에 늦은 집」');
}
// ---- 판 6 — 교사: 「교문을 잠근다」 → 🤝-2 → 교문을 잠근 교사의 집 · 협력한 집: 「모른다」 성공 → 입을 다문 집 / 실패 → 🌾-2 🎖-1 → 의심
{
  const T = mkGame('m', C('sangmin', 'sangmin', 2), 'eye'); const { g, use, pick, btn, done } = T;
  toSamil(T, 'gyosa'); ok(g.life.status === 'gyosa', '교사'); use('yeondan_1'); ok(btn('교문을 잠근다') && btn('만세') && !btn('쓰러진 사람을 업는다'), '교사 — 교문을 잠근다');
  pick('교문을 잠근다'); ok(done('samil') && g.flags.has('sm:lock') && g.life.values.heart === 0, '잠갔다 🤝-2');
  const L = endOf(T); ok(L.includes('life:lockteacher') && !L.includes('life:gyosa'), '끝 갈림 「교문을 잠근 교사의 집」');
  const U = mkGame('m', C('sangmin', 'sangmin', 4), 'eye'); toSamil(U, 'chinil'); ok(U.g.life.status === 'chinil' && U.g.cond(DL().on), '협력한 집 · 급한 일 선다'); U.use('yeondan_1'); ok(U.btn('앞장선 사람을') && U.btn('주재소에서 「모른다」') && !U.btn('만세'), '협력한 집 — 알린다/모른다/집에, 만세 없음');
  U.pick('주재소에서 「모른다」'); ok(U.done('samil') && U.g.flags.has('sm:silent') && U.g.life.values.heart === 3 && U.g.life.status === 'chinil', '「모른다」 통했다 🤝+1');
  const L2 = endOf(U); ok(L2.includes('life:silent') && !L2.includes('life:chinil') && !L2.includes('life:chinil_lead'), '끝 갈림 「협력하고도 입을 다문 집」');
  Math.random = () => 0.99;
  const V = mkGame('m', C('sangmin', 'sangmin', 4), 'belly'); toSamil(V, 'chinil'); V.g.life.values.rank = 2; V.use('yeondan_1'); V.pick('주재소에서 「모른다」'); ok(V.done('samil') && V.g.flags.has('sm:suspect') && V.g.life.values.grain === 2 && V.g.life.values.rank === 1 && !V.g.life.hurt.size, '굴림 실패 → 의심 🌾-2 🎖-1, 흔적 없음');
  const L3 = endOf(V); ok(L3.includes('life:suspect') && !L3.includes('life:silent') && !L3.includes('life:chinil'), '끝 갈림 「「모른다」가 안 통한 집」');
  Math.random = () => 0.01;
}
console.log(`gaehang 고리 4(만세 아침 깊이기): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
