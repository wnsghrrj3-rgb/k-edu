// 개항~일제 인생 층 고리 시험 — 조선 후기 갈림(from:*)→직업 카드 → 8 상황(개항·동학/갑오·을사·토지 조사·태극기·만세·창씨·징용) → 1945 끝 카드. 지주가 협력해 천장 6(족보에 적힘) / 옛 노비 여자의 여공·만세·이름 지키기 / 옛 백정이 의병→독립군→광복군 / 도고→상인의 회사·학교·자금
// 원본 주석 — 조선 전기 갈림(from:*)→신분 → 7 상황(모내기·장시·공명첩·실학·1801·세도·봉기) → 끝 카드. 상민이 도고 → 공명첩 양반 → 과거는 못 봄 → 곳간을 열어 봉기가 비껴감 / 노비 여자의 도망(광산, 안 잡힘) / 서얼의 통청·규장각 검서관(천장 4) / 관노의 1801년 문서 불 → 양인 → 봉기 승리. || 조건·끝 갈림 || 도 같이.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:joseon-late-life': JSON.stringify({ craft: 4, heart: 4, grain: 4, rank: 0, branch: 'yangban', status: 'yangban', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['bank_1','bigpaddy_1','gaekju_1','gando_1','gongjang_1','gyohoe_1','hakgyo_1','hyeong_1','jijugate_1','jpshop_1','jusaeso_1','malmoi_1','mill_1','myeon_1','pier_1','sangil_1','segwan_1','ship_1','smallpaddy_1','sojakjip_1','yeok_1','yeondan_1',
  'npc_ahnjunggeun','npc_gaekju','npc_ijumin','npc_jeonbongjun','npc_jiju','npc_jpmerchant','npc_jusigyeong','npc_kimgu','npc_myeonseogi','npc_nodongja','npc_parkseongchun','npc_segwanwon','npc_seongyosa','npc_sojak','npc_sunsa','npc_yeogong','npc_yugwansun','npc_yundongju'];
const AREAS = { maeul: [-22, 16], jiju: [-29, 22], sojakjip: [-16, 1], outroad: [-56, 34], jangteo: [0, -12], gaekju: [-15, -11], ilbon: [0, -44], segwan: [0, -58], mill: [-20, -58], hang: [8, -84], gyohoe: [-46, -31], hakgyo: [-50, 2], jusaeso: [26, -27], myeon: [40, -8], deul: [55, 12], gongjang: [60, -39], hyeong: [90, -19], yeok: [20, 36], gando: [-104, 58], sangil: [-85, 88] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'jusaeso_1') fn({ isMesh: true, material: { name: 'sunred' }, set visible(v) { shown.wae = v; } }); if (name === 'qingcamp_1') fn({ isMesh: true, material: { name: 'qing_tent' }, set visible(v) { shown.qing = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const use = (name) => { closeCard(); g.target = ix.get(name); g.act(); if (S.panel && S.panel.b.length === 1 && S.panel.h.includes('chk life') && !S.panel.h.includes('결과') && !S.panel.h.includes('이번 삶')) { closeCard(); g.act(); } };   // 상황 카드가 늦게 떠 있으면 먼저 닫는다; 살펴본 깃발이 카드를 열어 선택 판이 밀리면 한 번 더 누른다(실제 화면과 같은 흐름)
  const pick = (label) => { if (!S.panel) { console.log('판 없음', label); fail++; return; } const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 양반 남자(후기 「양반의 집」, 눈 밝은) → 지주(천장 4) — 세관에 세 배로 판다 → 동학: 곳간을 연다 → 을사: 통감부와 손잡는다(협력, 천장 6) → 토지 조사: 소작 땅까지(일장기 보임) → 만민 공동회 듣는다 → 태극기 안 만듦 → 만세: 주재소에 알린다 → 독립군 자금도 댄다 → 창씨 앞장 → 아들 지원병 → 「아들을 지원병으로 보낸 집」
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['manmin', 'sinmun', 'hakgyo', 'dongnipgun'], 'eye');
  ok(g.era === 'gaehang-life', 'era 키');
  ok(g.flags.has('from:yangban') && g.life.status === 'jiju' && g.life.cap() === 4 && g.life.values.grain === 4 && g.life.values.craft === 2, '양반 → 지주(천장 4), 곡식 전부·솜씨 절반');
  goTo('segwan'); ok(opened('gaehang'), '개항 상황'); closeCard();
  use('segwan_1'); pick('일본 상인에게'); ok(done('gaehang') && g.flags.has('gh:sell') && g.life.values.grain === 8 && g.has('coin'), '세 배 → 쌀 8, 엔'); closeCard();
  await settle(260); ok(g.flags.has('gabo:on') && opened('gabo'), '1894 → 동학·갑오'); closeCard();
  goTo('jiju'); use('jijugate_1'); pick('곳간을 연다'); ok(done('gabo') && g.flags.has('gb:open') && g.life.values.grain === 5, '곳간 → 쌀 5'); closeCard();
  ok(opened('manmin') && opened('sinmun') && opened('hakgyo') && !opened('dongnipgun'), '섞여 셋(갑오 뒤), 독립군은 만세 뒤'); closeCard(); await settle(300); closeCard();
  ok(g.flags.has('eulsa:on') && opened('eulsa'), '을사'); closeCard();
  goTo('jiju'); use('jijugate_1'); pick('통감부 관리와'); ok(done('eulsa') && g.flags.has('es:chinil') && g.life.status === 'chinil' && g.life.cap() === 6 && g.life.values.grain === 8, '협력 → 천장 6, 쌀 8'); closeCard();
  await settle(900); ok(g.flags.has('toji:on') && g.flags.has('day:2') && opened('toji'), '1910 → 토지 조사'); closeCard();
  ok(shown.wae === true, '1910 — 주재소 일장기 보임');
  goTo('myeon'); use('myeon_1'); pick('소작인 논도'); ok(done('toji') && g.flags.has('tj:grab') && g.life.values.grain === 12 && g.has('deed'), '소작 땅까지 → 쌀 12, 지권'); closeCard();
  goTo('jangteo'); use('yeondan_1'); pick('듣는다'); ok(done('manmin') && g.flags.has('mm:listen'), '만민 공동회 — 들었다'); closeCard();
  await settle(700); ok(g.flags.has('night:1') && g.flags.has('samil:on') && opened('taegeukgi'), '밤 → 태극기'); closeCard();
  goTo('gaekju'); use('gaekju_1'); pick('안 만든다'); ok(done('taegeukgi') && g.flags.has('sm:noflag'), '안 만들었다'); closeCard();
  await settle(700); ok(g.flags.has('samil:morning') && g.flags.has('day:3') && opened('samil'), '아침 → 만세'); closeCard();
  goTo('jangteo'); ok(!btn('만세'), '협력한 집엔 만세 버튼 없음'); use('yeondan_1'); ok(btn('앞장선 사람을'), '협력한 집 — 주재소에 알린다'); pick('앞장선 사람을'); ok(done('samil') && g.flags.has('sm:report') && g.life.values.grain === 14, '알렸다 → 쌀 14'); closeCard();
  ok(opened('dongnipgun'), '만세 뒤 독립군 상황'); closeCard();
  goTo('jiju'); use('jijugate_1'); pick('독립군 자금'); ok(done('dongnipgun') && g.flags.has('dg:fund') && g.life.values.grain === 11, '자금 → 쌀 11'); closeCard();
  await settle(260); ok(g.flags.has('changssi:on') && opened('changssi'), '1940 창씨'); closeCard();
  goTo('jusaeso'); use('jusaeso_1'); ok(done('changssi') && g.flags.has('cs:lead') && g.life.values.grain === 13, '앞장 → 쌀 13'); closeCard();
  await settle(260); ok(g.flags.has('jingyong:on') && opened('jingyong'), '1944 징용'); closeCard();
  goTo('jiju'); use('jijugate_1'); ok(btn('아들을 지원병으로') && !btn('아들을 지원병으로').disabled, '협력한 집 → 지원병 열림'); pick('아들을 지원병으로'); ok(done('jingyong') && g.flags.has('jy:volunteer'), '지원병'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:volunteer'), '끝 갈림 = 아들을 지원병으로 보낸 집');
  const carry = JSON.parse(store['kworld_carry:gaehang-life']); ok(carry.branch === 'volunteer' && carry.status === 'chinil', '대한민국으로 넘길 것 저장');
  console.log('판 1 끝');
}
// ===== 판 2: 솔거 노비 여자(발 빠른) → 옛 노비(빈손) — 정미소 여공 → 동학군에 주먹밥 → 은비녀 → 토지: 신고할 땅이 없다 → 간도 안 감 → 여공 파업 → 형평사와 같이 → 태극기 → 만세 → 말모이 → 이름을 지킨다 → 정신대 영장 숨는다 → 「만세를 부른 집」
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'joseon' });
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['paeop', 'gando', 'hyeong', 'malmoi'], 'foot');
  ok(g.life.status === 'yetnobi' && g.life.cap() === 4 && g.life.values.grain === 0, '솔거 → 옛 노비(빈손), 천장 4');
  goTo('segwan'); closeCard(); goTo('mill'); ok(g.promptFor(ix.get('mill_1')).verb.includes('여공'), '여자 → 정미소 여공'); use('mill_1'); ok(done('gaehang') && g.flags.has('gh:millf') && g.life.values.grain === 1, '여공 → 쌀 1'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); use('yeondan_1'); pick('동학군에 주먹밥'); ok(done('gabo') && g.flags.has('gb:bae'), '주먹밥'); closeCard(); closeCard(); await settle(300); closeCard();
  goTo('jangteo'); use('yeondan_1'); ok(btn('은비녀') && !btn('은비녀').disabled, '여자 → 은비녀 열림'); pick('은비녀'); ok(done('eulsa') && g.flags.has('es:binyeo'), '은비녀'); closeCard();
  await settle(900); closeCard(); goTo('myeon'); use('myeon_1'); ok(done('toji') && g.flags.has('tj:none') && g.life.values.grain === 0, '신고할 땅이 없다'); closeCard();
  ok(opened('gando') && opened('paeop') && opened('hyeong') && !opened('malmoi'), '섞여 셋(토지 뒤), 말모이는 만세 뒤'); closeCard(); await settle(300); closeCard();
  goTo('yeok'); use('yeok_1'); pick('남는다'); ok(done('gando') && g.flags.has('gd:stay') && g.life.status === 'yetnobi', '남았다'); closeCard();
  goTo('gongjang'); use('gongjang_1'); pick('파업'); ok(done('paeop') && g.flags.has('po:join'), '여공 파업'); closeCard();
  goTo('hyeong'); use('hyeong_1'); pick('형평사와 같이'); ok(done('hyeong') && g.flags.has('hp:with'), '형평사와 같이'); closeCard();
  await settle(700); closeCard(); goTo('gaekju'); use('gaekju_1'); pick('태극기를 만든다'); ok(done('taegeukgi') && g.flags.has('sm:flag') && g.has('flag'), '태극기'); closeCard();
  await settle(700); closeCard(); goTo('jangteo'); use('yeondan_1'); pick('만세'); ok(done('samil') && g.flags.has('sm:manse') && !g.life.hurt.has('wound'), '만세 — 골목으로'); closeCard();
  ok(opened('malmoi'), '말모이'); closeCard(); goTo('hakgyo'); use('malmoi_1'); pick('우리 마을 말을'); ok(done('malmoi') && g.flags.has('ml:send'), '낱말을 보냈다'); closeCard();
  await settle(260); closeCard(); goTo('jusaeso'); use('jusaeso_1'); pick('버틴다'); ok(done('changssi') && g.flags.has('cs:keep') && g.life.values.grain === 0, '이름을 지켰다(쌀은 바닥)'); closeCard();
  await settle(260); closeCard(); goTo('gongjang'); use('gongjang_1'); ok(btn('숨는다'), '여자 → 정신대 영장'); pick('숨는다'); ok(done('jingyong') && g.flags.has('jy:hidef'), '숨었다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:manse'), '끝 갈림 = 만세를 부른 집');
  console.log('판 2 끝');
}
// ===== 판 3: 백정 남자(잘 버티는) → 옛 백정 — 가죽을 일본 상인에게 → 동학군 → 만민 공동회 연단에 선다 → 학교: 아이가 쫓겨남 → 의병 → 쫓기는 몸(천장 0, 독립군·파업 상황 안 열림) → 토지: 수배 중 → 태극기·만세 → 창씨: 이름이 없다 → 광복군 → 「광복군의 집」
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 3, rank: 0, branch: 'baekjeong', status: 'baekjeong', nation: 'joseon' });
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['manmin', 'hakgyo', 'dongnipgun', 'paeop'], 'belly');
  ok(g.life.status === 'yetbaekjeong' && g.life.cap() === 4, '백정 → 옛 백정(법으로는 풀림)');
  goTo('segwan'); closeCard(); ok(g.promptFor(ix.get('segwan_1')).verb.includes('가죽'), '옛 백정 → 가죽'); use('segwan_1'); ok(done('gaehang') && g.flags.has('gh:leather') && g.life.values.grain === 6, '가죽 → 쌀 6'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); use('yeondan_1'); pick('동학군에 든다'); ok(done('gabo') && g.flags.has('gb:join'), '동학군 — 전주성'); closeCard(); closeCard(); await settle(300); closeCard();
  goTo('jangteo'); use('yeondan_1'); ok(btn('연단에 선다'), '만민 공동회 — 연단'); pick('연단에 선다'); ok(done('manmin') && g.flags.has('mm:speak'), '백정이 연단에'); closeCard();
  goTo('hakgyo'); use('hakgyo_1'); ok(done('hakgyo') && g.flags.has('hk:out'), '아이가 학교에서 쫓겨났다'); closeCard();
  goTo('sangil'); use('sangil_1'); pick('의병에 든다'); ok(done('eulsa') && g.flags.has('es:uibyeong') && g.life.status === 'dongnip' && g.life.cap() === 0, '의병 → 쫓기는 몸(천장 0)'); closeCard();
  await settle(900); closeCard(); goTo('myeon'); use('myeon_1'); ok(done('toji') && g.flags.has('tj:hiding'), '수배 중 — 신고 못 함'); closeCard();
  ok(!opened('paeop'), '쫓기는 몸 — 파업 상황 안 열림'); closeCard(); await settle(300); closeCard();
  await settle(700); closeCard(); goTo('gaekju'); use('gaekju_1'); pick('태극기를 만든다'); closeCard(); await settle(700); closeCard(); goTo('jangteo'); use('yeondan_1'); pick('만세'); ok(done('samil') && g.flags.has('sm:manse'), '만세'); closeCard();
  ok(!opened('dongnipgun'), '이미 쫓기는 몸 — 독립군 상황 안 열림');
  await settle(260); closeCard(); goTo('jusaeso'); use('jusaeso_1'); ok(done('changssi') && g.flags.has('cs:none'), '이름이 없다'); closeCard();
  await settle(260); closeCard(); goTo('gongjang'); ok(g.promptFor(ix.get('gongjang_1')).verb === '살펴보기', '영장이 내 이름을 모른다'); goTo('sangil'); use('sangil_1'); ok(done('jingyong') && g.flags.has('jy:kwangbok'), '광복군'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:kwangbok'), '끝 갈림 = 광복군의 집');
  console.log('판 3 끝');
}
// ===== 판 4: 도고 남자(손 좋은) → 상인 — 석유·성냥 ⚠ → 동학군에 쌀을 푼다 → 한글 신문 → 학교를 세운다 → 회사령 허가 → 형평 돌아섬 → 태극기 안 만듦·집에 → 말모이 안 넣음 → 金本 → 징용 끌려감 → 「학교를 세운 집」 · 간도 상황은 상인에겐 안 열림
{
  store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 4, heart: 2, grain: 5, rank: 0, branch: 'dogo', status: 'dogo', nation: 'joseon' });
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['sinmun', 'gando', 'hyeong', 'malmoi'], 'hand');
  ok(g.life.status === 'sangin' && g.life.values.grain === 5, '도고 → 상인');
  goTo('segwan'); closeCard(); goTo('ilbon'); use('jpshop_1'); ok(done('gaehang') && g.flags.has('gh:import') && g.life.values.grain === 9, '석유·성냥 → 쌀 9'); closeCard();
  await settle(260); closeCard(); goTo('gaekju'); use('gaekju_1'); pick('쌀을 푼다'); ok(done('gabo') && g.flags.has('gb:food') && g.life.values.grain === 7, '쌀을 풀었다'); closeCard(); closeCard(); await settle(300); closeCard();
  use('gaekju_1'); pick('한글 신문을 읽는다'); ok(done('sinmun') && g.flags.has('sn:read') && g.has('paper'), '한글 신문'); closeCard();
  goTo('hakgyo'); use('hakgyo_1'); ok(done('eulsa') && g.flags.has('es:school') && g.life.values.grain === 3, '학교를 세웠다 → 쌀 3'); closeCard();
  await settle(900); closeCard(); goTo('myeon'); use('myeon_1'); pick('회사령'); ok(done('toji') && g.flags.has('tj:hoesa'), '회사 허가'); closeCard();
  ok(!opened('gando') && opened('hyeong'), '상인 — 간도 상황 안 열림, 형평은 열림'); closeCard(); await settle(300); closeCard();
  goTo('hyeong'); use('hyeong_1'); pick('돌아선다'); ok(done('hyeong') && g.flags.has('hp:turn'), '돌아섰다'); closeCard();
  await settle(700); closeCard(); goTo('gaekju'); use('gaekju_1'); pick('안 만든다'); closeCard(); await settle(700); closeCard(); goTo('jangteo'); use('yeondan_1'); pick('집에 있는다'); ok(done('samil') && g.flags.has('sm:home'), '집에'); closeCard();
  closeCard(); goTo('hakgyo'); use('malmoi_1'); pick('안 넣는다'); ok(done('malmoi') && g.flags.has('ml:japanese'), '안 넣었다'); closeCard();
  await settle(260); closeCard(); goTo('jusaeso'); use('jusaeso_1'); pick('성은 남긴다'); ok(done('changssi') && g.flags.has('cs:half') && g.has('ration'), '金本 — 배급표'); closeCard();
  await settle(260); closeCard(); goTo('gongjang'); use('gongjang_1'); pick('영장대로'); ok(done('jingyong') && g.flags.has('jy:go'), '징용'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:school'), '끝 갈림 = 학교를 세운 집(징용보다 앞)');
  console.log('판 4 끝');
}
console.log(`gaehang-life loop: pass ${pass} fail ${fail}`); if (fail) process.exit(1);
