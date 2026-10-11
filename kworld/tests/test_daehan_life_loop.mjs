// 대한민국 인생 층 고리 시험 — 개항 갈림(from:*)→직업 카드(천장 없음 6) → 10 상황(광복·분단·농지 개혁·전쟁·공부·산업화·거리·선거·IMF·오늘) → 끝 카드 → 문은 구석기(처음부터). 옛 지주가 땅을 내놓고 소를 팔아 가르치고 아파트로 / 옛 노비 여자가 처음 내 땅·피란·파독 간호사·거리 / 독립운동가가 호적 이름·군대·야간 중학·파독 광부. 숨김 재질 넷이 제때 켜지는지.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gaehang-life': JSON.stringify({ craft: 4, heart: 4, grain: 8, rank: 4, branch: 'jiju', status: 'jiju', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['jijugate_1','sojakjip_1','so_1','radio_1','jangteo_1','tv_1','yeondan_1','eup_1','tupyo_1','eunhaeng_1','bogeonso_1','guho_1','hakgyo_1','dari_1','boat_1','malttuk_1','vinyl_1','saemaeul_1','gongjang_1','apateu_1','yeok_1','train_1','bus_1','bangongho_1','cheoljomang_1',
  'npc_jiju','npc_sojak','npc_dolaon','npc_jumo','npc_itaeyeong','npc_eupjang','npc_eunhaengwon','npc_ganhosa','npc_moksa','npc_gyosa','npc_haksaeng','npc_pinanmin','npc_nongbu','npc_saemaeul','npc_jeontaeil','npc_yeogong','npc_yeokmu','npc_gwangbu','npc_chajang','npc_chobyeong'];
const AREAS = { maeul: [-22, -16], jiju: [-29, -22], jangteo: [0, 12], gwangjang: [0, 38], eupsamuso: [26, 28], eunhaeng: [28, 35], bogeonso: [-24, 35], gyohoe: [-46, 31], hakgyo: [-50, -2], dari: [-60, 10], naru: [-62, 34], nongji: [55, -12], deul: [85, -14], saemaeul: [54, 18], gongjang: [60, 41], apateu: [84, 52], yeok: [20, 66], seoulgil: [34, -36], bangongho: [-88, -68], hyujeon: [-18, -100] };
const HID = { cheoljomang_1: ['barbed', 'barbed'], saemaeul_1: ['slate_blue', 'slate'], dari_1: ['bridge_new', 'bridge'], apateu_1: ['apt_concrete', 'apt'] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { const h = HID[name]; if (h) fn({ isMesh: true, material: { name: h[0] }, set visible(v) { shown[h[1]] = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; if (d?.hidden) g.showMats(t, d.hidden, false); }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const use = (name) => { closeCard(); g.target = ix.get(name); g.act(); if (S.panel && S.panel.b.length === 1 && S.panel.h.includes('chk life') && !S.panel.h.includes('결과') && !S.panel.h.includes('이번 삶')) { closeCard(); g.act(); } };
  const pick = (label) => { if (!S.panel) { console.log('판 없음', label); fail++; return; } const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 지주 남자(눈 밝은, 쌀 8) → 땅 가진 집(6) — 광복 거리 → 분단 편지만 → 농지 개혁 땅을 내놓는다(→ 농사짓는 집, 쌀 5) → 전쟁 남는다(쌀 4) → 휴전: 철조망 보임 → 소를 판다(쌀 1) → 산업화: 슬레이트·다리 보임, 비닐하우스(쌀 3) → 새마을 앞장(쌀 4) → 거리: 문을 열어 둔다 → 투표 → 아파트 보임·산다 → IMF 금반지 → 오늘 → 「땅을 내놓은 집」, 문 = 구석기(열림)
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['saemaeul', 'apt', 'tv', 'guho'], 'eye');
  ok(g.era === 'daehan-life', 'era 키');
  ok(g.flags.has('from:jiju') && g.life.status === 'jiju' && g.life.cap() === 6 && g.life.values.grain === 8 && g.life.values.craft === 2, '지주 → 땅 가진 집(천장 6), 곡식 전부·솜씨 절반');
  ok(shown.barbed === false && shown.slate === false && shown.bridge === false && shown.apt === false, '처음엔 철조망·슬레이트·다리·아파트 숨김');
  goTo('maeul'); ok(opened('gwangbok'), '광복 상황'); closeCard();
  use('radio_1'); ok(btn('대문을 닫는다') && !btn('대문을 닫는다').disabled, '땅 가진 집 — 대문을 닫는다 열림'); pick('거리로 나간다'); ok(done('gwangbok') && g.flags.has('gw:street') && g.life.values.heart === 3, '거리로 → 인심 3'); closeCard();
  await settle(260); ok(g.flags.has('bundan:on') && opened('bundan'), '1948 → 분단'); closeCard();
  goTo('eupsamuso'); use('eup_1'); ok(btn('개성에') && btn('개성에').disabled, '지주 — 개성 물건은 회색'); pick('편지만'); ok(done('bundan') && g.flags.has('bd:letter'), '편지만'); closeCard();
  await settle(260); ok(g.flags.has('nongji:on') && opened('nongji'), '1950 → 농지 개혁'); closeCard();
  goTo('jiju'); use('jijugate_1'); pick('땅을 내놓는다'); ok(done('nongji') && g.flags.has('nj:give') && g.life.status === 'nongmin' && g.life.values.grain === 5, '땅을 내놓았다 → 농사짓는 집, 쌀 5'); closeCard();
  await settle(900); ok(g.flags.has('night:1') && g.flags.has('jeonjaeng:on') && opened('jeonjaeng'), '밤 → 전쟁'); closeCard();
  ok(opened('guho') === false, '구호물자는 전쟁 뒤');
  goTo('naru'); use('boat_1'); pick('남는다'); ok(done('jeonjaeng') && g.flags.has('jj:stay') && g.life.values.grain === 4, '남았다 → 쌀 4'); closeCard();
  await settle(900); ok(g.flags.has('day:2') && g.flags.has('gongbu:on') && opened('gongbu'), '휴전 → 공부'); closeCard();
  ok(shown.barbed === true, '휴전 — 철조망 보임'); ok(opened('guho'), '구호물자 상황(전쟁 뒤)'); closeCard();
  goTo('gyohoe'); use('guho_1'); pick('내 것을 나눈다'); ok(done('guho') && g.flags.has('gh:give') && g.life.values.grain === 3, '나눴다 → 쌀 3'); closeCard();
  goTo('maeul'); use('so_1'); ok(btn('소를 판다') && !btn('소를 판다').disabled, '쌀 3 — 소를 판다 열림'); pick('소를 판다'); ok(done('gongbu') && g.flags.has('gb:sellcow') && g.life.values.grain === 0 && g.has('book'), '소를 팔았다 → 쌀 0, 교과서'); closeCard();
  await settle(300); ok(g.flags.has('sanupwha:on') && opened('sanupwha'), '1960 → 산업화'); closeCard();
  ok(shown.slate === true && shown.bridge === true, '산업화 — 슬레이트·다시 놓은 다리 보임'); ok(opened('saemaeul'), '새마을 상황(공부 뒤)'); closeCard();
  goTo('deul'); use('vinyl_1'); ok(done('sanupwha') && g.flags.has('su:stay') && g.life.values.grain === 2 && g.life.status === 'nongmin', '비닐하우스 → 쌀 2'); closeCard();
  goTo('saemaeul'); use('saemaeul_1'); pick('앞장선다'); ok(done('saemaeul') && g.flags.has('sm:lead') && g.life.values.grain === 3, '새마을 지도자 → 쌀 3'); closeCard();
  ok(opened('tv'), '컬러 TV(산업화 뒤)'); closeCard(); goTo('jangteo'); use('tv_1'); pick('안 산다'); ok(done('tv') && g.flags.has('tv:no'), 'TV 안 샀다'); closeCard();
  await settle(300); ok(g.flags.has('geori:on') && opened('geori'), '거리로 나갈까'); closeCard();
  goTo('gwangjang'); use('yeondan_1'); pick('문을 열어 둔다'); ok(done('geori') && g.flags.has('gr:open'), '문을 열어 뒀다'); closeCard();
  ok(opened('apt'), '아파트 상황(거리 뒤)'); ok(shown.apt === true, '아파트 보임'); closeCard();
  await settle(300); ok(g.flags.has('seongeo:on') && opened('seongeo'), '1987 선거'); closeCard();
  goTo('eupsamuso'); use('tupyo_1'); pick('투표한다'); ok(done('seongeo') && g.flags.has('sg:vote') && g.has('ballot'), '한 장'); closeCard();
  goTo('apateu'); use('apateu_1'); ok(btn('집을 팔고') && !btn('집을 팔고').disabled, '쌀 3 — 아파트'); pick('집을 팔고'); ok(done('apt') && g.flags.has('ap:buy') && g.has('passbook') && g.life.values.grain === 2, '아파트로 → 쌀 2'); closeCard();
  await settle(300); ok(g.flags.has('oehwan:on') && opened('oehwan'), '1997 IMF'); closeCard();
  goTo('eunhaeng'); use('eunhaeng_1'); pick('금반지를 낸다'); ok(done('oehwan') && g.flags.has('oh:gold'), '금반지'); closeCard();
  await settle(300); ok(g.flags.has('oneul:on') && opened('oneul'), '오늘'); closeCard();
  goTo('gwangjang'); use('yeondan_1'); ok(done('oneul') && g.flags.has('on:arrive'), '도착'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:landgone'), '끝 갈림 = 땅을 내놓은 집');
  ok(S.panels.at(-1)?.includes('구석기 — 처음부터 다시') || S.panel?.b?.some((b) => b.label.includes('구석기')), '문 = 구석기 처음부터');
  const carry = JSON.parse(store['kworld_carry:daehan-life']); ok(carry.branch === 'landgone' && carry.status === 'nongmin', '끝 값 저장');
  console.log('판 1 끝');
}
// ===== 판 2: 옛 노비 여자(손 좋은, 쌀 0) → 소작의 집 — 광복 집에서 → 분단 친척 데려옴(발 2) → 농지: 처음 내 땅(→ 농사짓는 집, 쌀 1) → 전쟁 피란(쌀 0) → 소 없음 → 일을 시킨다 → 파독 간호사(손 2, 해외 일꾼, 쌀 3) → 거리로 나간다 → 투표 → TV 산다 → IMF 다시 시작(→ 상인) → 「처음으로 땅을 가진 집」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 0, rank: 4, branch: 'yetnobi', status: 'yetnobi', nation: 'joseon' });
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['tv', 'guho', 'gundae', 'isan'], 'hand');
  ok(g.life.status === 'sojak' && g.life.cap() === 6 && g.life.values.grain === 0, '옛 노비 → 소작의 집, 천장 6');
  goTo('maeul'); closeCard(); use('radio_1'); ok(!btn('대문을 닫는다') || btn('대문을 닫는다').disabled, '소작 — 대문 닫기는 회색'); pick('집에서 듣는다'); ok(done('gwangbok') && g.flags.has('gw:home'), '집에서'); closeCard();
  await settle(260); closeCard(); goTo('eupsamuso'); use('eup_1'); pick('38선 너머'); ok(done('bundan') && g.flags.has('bd:go') && !g.flags.has('bd:lost'), '데려왔다'); closeCard();
  await settle(260); closeCard(); goTo('jiju'); use('jijugate_1'); ok(!btn('땅을 내놓는다'), '소작 — 대문 선택 없음'); goTo('maeul'); use('sojakjip_1'); pick('분배를 신청한다'); ok(done('nongji') && g.flags.has('nj:get') && g.has('deed') && g.life.status === 'nongmin' && g.life.values.grain === 1, '처음으로 내 땅 → 농사짓는 집, 쌀 1'); closeCard();
  await settle(900); closeCard(); goTo('naru'); use('boat_1'); pick('피란'); ok(done('jeonjaeng') && g.flags.has('jj:boat') && g.life.values.grain === 0, '피란 → 쌀 0(바닥)'); closeCard();
  await settle(900); closeCard(); ok(!opened('gundae'), '여자 — 군대 상황 안 열림'); ok(!opened('isan'), '못 잃었으니 이산가족 상황 안 열림'); closeCard();
  goTo('maeul'); use('so_1'); ok(btn('소를 판다') && btn('소를 판다').disabled && btn('오빠만').disabled, '쌀 0 — 소는 회색, 오빠만은 여자에겐 없음'); pick('일을 시킨다'); ok(done('gongbu') && g.flags.has('gb:work') && g.life.values.grain === 1, '일을 시켰다 → 쌀 1'); closeCard();
  await settle(300); closeCard(); goTo('bogeonso'); ok(g.promptFor(ix.get('bogeonso_1')).verb.includes('간호사'), '여자 → 파독 간호사'); use('bogeonso_1'); ok(done('sanupwha') && g.flags.has('su:nurse') && g.life.status === 'haeoe' && g.life.values.grain === 4 && g.has('ticket'), '간호사 → 해외 일꾼, 쌀 4'); closeCard();
  goTo('yeok'); ok(g.promptFor(ix.get('yeok_1')).verb === '살펴보기', '산업화 끝 — 개찰구는 살펴보기'); 
  goTo('gyohoe'); use('guho_1'); pick('줄을 선다'); ok(done('guho') && g.flags.has('gh:line') && g.has('flour'), '밀가루'); closeCard();
  closeCard(); goTo('jangteo'); use('tv_1'); pick('컬러 TV를 산다'); ok(done('tv') && g.flags.has('tv:buy') && g.life.values.grain === 3, 'TV → 쌀 3'); closeCard();
  await settle(300); closeCard(); goTo('gwangjang'); use('yeondan_1'); pick('거리로 나간다'); ok(done('geori') && g.flags.has('gr:go') && !g.life.hurt.has('wound'), '거리로 — 골목으로'); closeCard();
  await settle(300); closeCard(); goTo('eupsamuso'); use('tupyo_1'); pick('투표한다'); ok(done('seongeo'), '투표'); closeCard();
  await settle(300); closeCard(); goTo('eunhaeng'); use('eunhaeng_1'); ok(btn('정리 해고'), '해외 일꾼 → 다시 시작 버튼'); pick('정리 해고'); ok(done('oehwan') && g.flags.has('oh:restart') && g.life.status === 'sangin', '다시 시작 → 상인'); closeCard();
  await settle(300); closeCard(); goTo('gwangjang'); use('yeondan_1'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:firstland'), '끝 갈림 = 처음으로 땅을 가진 집');
  console.log('판 2 끝');
}
// ===== 판 3: 독립운동가 남자(잘 버티는) — 호적 이름 → 편지 → 농지: 본다 → 전쟁: 군대(몸 2) → 야간 중학(손 1) → 입영 열차 → 파독 광부(몸 2) → 전태일 상황은 해외 일꾼에겐 안 열림 → 거리 집에 → 안 간다 → 금반지 → 「전쟁에 나간 집」
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 1, rank: 0, branch: 'dongnip', status: 'dongnip', nation: 'joseon' });
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['gundae', 'jeontaeil', 'saemaeul', 'isan'], 'belly');
  ok(g.life.status === 'dongnip' && g.life.cap() === 6, '독립운동가의 집, 천장 6');
  goTo('maeul'); closeCard(); ok(g.promptFor(ix.get('radio_1')).verb.includes('호적'), '독립운동가 → 호적 이름'); use('radio_1'); ok(done('gwangbok') && g.flags.has('gw:name'), '이름을 다시 올렸다'); closeCard();
  await settle(260); closeCard(); goTo('eupsamuso'); use('eup_1'); pick('편지만'); closeCard();
  await settle(260); closeCard(); goTo('maeul'); use('sojakjip_1'); ok(done('nongji') && g.flags.has('nj:watch'), '땅 없는 집 — 봤다'); closeCard();
  await settle(900); closeCard(); goTo('hyujeon'); ok(g.promptFor(ix.get('cheoljomang_1')).verb.includes('군대'), '남자 → 군대'); use('cheoljomang_1'); ok(done('jeonjaeng') && g.flags.has('jj:soldier') && !g.life.hurt.has('leg'), '군대 — 돌아왔다'); closeCard();
  await settle(900); closeCard(); ok(!opened('gundae'), '군대 상황은 공부 뒤'); closeCard();
  goTo('maeul'); ok(g.promptFor(ix.get('so_1')).verb === '살펴보기', '소 없는 집'); goTo('hakgyo'); use('hakgyo_1'); pick('야간 중학'); ok(done('gongbu') && g.flags.has('gb:night') && g.has('book'), '야간 중학'); closeCard();
  ok(opened('gundae'), '군대 상황(남자, 공부 뒤)'); closeCard();
  goTo('yeok'); ok(g.promptFor(ix.get('yeok_1')).verb.includes('입영'), '영장 → 입영'); use('yeok_1'); ok(done('gundae') && g.flags.has('gd:serve'), '군 복무'); closeCard();
  await settle(300); closeCard(); goTo('yeok'); use('yeok_1'); pick('파독 광부'); ok(done('sanupwha') && g.flags.has('su:miner') && g.life.status === 'haeoe', '파독 광부 → 해외 일꾼'); closeCard();
  ok(!opened('jeontaeil'), '해외 일꾼 — 전태일 상황 안 열림'); ok(opened('saemaeul'), '새마을은 열림'); closeCard();
  await settle(300); closeCard(); goTo('gwangjang'); use('yeondan_1'); pick('집에 있는다'); ok(done('geori') && g.flags.has('gr:home'), '집에'); closeCard();
  await settle(300); closeCard(); goTo('eupsamuso'); use('tupyo_1'); pick('안 간다'); ok(done('seongeo') && g.flags.has('sg:no'), '안 갔다'); closeCard();
  await settle(300); closeCard(); goTo('eunhaeng'); use('eunhaeng_1'); pick('금반지를 낸다'); ok(done('oehwan'), '금반지'); closeCard();
  await settle(300); closeCard(); goTo('gwangjang'); use('yeondan_1'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:soldier'), '끝 갈림 = 전쟁에 나간 집');
  console.log('판 3 끝');
}
console.log(`daehan-life loop: pass ${pass} fail ${fail}`); if (fail) process.exit(1);
