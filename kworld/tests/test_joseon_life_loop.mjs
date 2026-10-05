// 조선 전기 인생 층 고리 시험 — 고려 갈림(from:*)→신분 아홉 → 7 상황(호패·부역·한글·과거·사화·임진왜란·병자호란) → 끝 카드. 상민이 곡식 셋으로 문과 → 양반 → 의병장, 노비 여자의 도망(호패를 버림), 서얼의 문과 회색·무과, 백정의 의병 공 → 호적을 고침.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:goryeo-life': JSON.stringify({ craft: 4, heart: 4, grain: 3, rank: 0, branch: 'yangmin', status: 'yangmin', nation: 'goryeo' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['hopae_1','samun_1','examhall_1','jagyeokru_1','hwangok_1','hangeul_1','seoan_1','sewing_1','slavehut_1','ybgate_1','bigpaddy_1','bigpaddy_2','smallpaddy_1','smallpaddy_2','homepaddy_1','bestall_1','stonepile_1','rack_1','hideout_1','pass_1','qingcamp_1','boat_1','waeship_1',
  'npc_jumo','npc_nongbu','npc_pojol','npc_cheongjigi','npc_seonbi','npc_ai','npc_nageune','npc_hunjang','npc_baetsagong','npc_sojak','npc_baekjeong','npc_anju','npc_nobi','npc_ajeon','npc_gwanno','npc_kkeokjeong','npc_uibyeong','npc_sunsin'];
const AREAS = { eogwi: [0, -40], outroad: [0, -58], jangteo: [0, -6], jumak: [-13.5, -5], well: [6.5, -2.5], yangban: [0, 22], haengrang: [-9.5, 23.5], sarang: [-7, 27], anchae: [1, 37.5], gwana: [-27, -5], dongheon: [-30, 8.5], choga: [28, -7], field: [27, -30], seodang: [-31, -29.5], naru: [9, -93], deul: [66, -9], oettan: [72, -79], gogae: [-100, -70], sanjung: [-80, 84] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'waeship_1') fn({ isMesh: true, material: { name: 'wae_sail' }, set visible(v) { shown.wae = v; } }); if (name === 'qingcamp_1') fn({ isMesh: true, material: { name: 'qing_tent' }, set visible(v) { shown.qing = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 상민 남자(고려 「양민 — 조선 상민의 집」, 눈 밝은) — 나무 호패 → 돌을 진다(몸) → 스물여덟 자 → 환곡: 한글 소장(눈) → 과거: 곡식 셋으로 문과 급제 → 양반(역전, 천장 3→6) → 사화 사림 편 이김(벼슬 +2) → 임진: 의병을 일으킨다 → 병자: 척화 → 의병장의 집
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['hwangok', 'debtday', 'kkeokjeong', 'widow'], 'eye');
  ok(g.era === 'joseon-life', 'era 키');
  ok(g.flags.has('from:yangmin') && g.life.nation === 'joseon' && g.life.status === 'sangmin' && g.life.cap() === 3 && g.life.values.grain === 3 && g.life.values.craft === 2 && g.life.values.heart === 2, '양민 → 조선 상민, 천장 3, 곡식 전부·솜씨 절반');
  goTo('gwana'); ok(opened('hopae'), '호패 상황'); closeCard();
  ok(g.promptFor(ix.get('hopae_1')).verb.includes('나무'), '상민 남자 → 나무 호패'); use('hopae_1'); ok(done('hopae') && g.flags.has('hopae:wood') && g.has('hopae'), '나무 호패를 찼다'); closeCard();
  await settle(260); ok(g.flags.has('corvee:on') && opened('corvee'), '북소리 → 부역'); closeCard();
  goTo('eogwi'); ok(g.promptFor(ix.get('stonepile_1')).verb.includes('돌을 진다'), '상민 → 돌을 진다'); use('stonepile_1'); ok(done('corvee') && g.flags.has('corvee:stone') && g.life.values.heart === 3 && !g.life.hurt.has('wound'), '돌을 졌다 → 인심 3'); closeCard();
  await settle(260); ok(g.flags.has('hangeul:on') && opened('hangeul'), '서당 → 한글'); closeCard();
  goTo('seodang'); ok(g.promptFor(ix.get('hangeul_1')).verb.includes('배운다'), '글판 → 배운다'); use('hangeul_1'); ok(done('hangeul') && g.flags.has('hangeul:learn') && g.has('letter') && g.life.values.craft === 3, '스물여덟 자 → 솜씨 3'); closeCard();
  await settle(260); ok(g.flags.has('exam:on') && opened('exam') && opened('hwangok'), '과거 + 섞여: 환곡(한글 뒤)'); closeCard(); await settle(300); closeCard();
  goTo('gwana'); ok(g.promptFor(ix.get('samun_1')).verb.includes('소장'), '한글을 익힌 상민 → 삼문에 한글 소장'); use('samun_1'); ok(done('hwangok') && g.flags.has('hwangok:letter') && !g.flags.has('debt:on') && g.life.values.heart === 4 && g.life.values.craft === 4, '소장 → 빚 없이 인심 4·솜씨 4'); closeCard();
  goTo('dongheon'); ok(g.promptFor(ix.get('examhall_1')).verb.includes('곡식 셋'), '상민 곡식 3 → 문과를 본다'); use('examhall_1'); ok(g.flags.has('exam:scholar') && g.has('book') && g.count('grain') === 0, '급제 — 곡식 셋이 갔다'); ok(done('exam') && g.life.status === 'yangban' && g.life.cap() === 6 && g.life.values.rank === 3 && g.flags.has('status:yangban') && !g.flags.has('status:sangmin'), '상민이 문과에 → 양반(천장 3→6), 벼슬 3'); closeCard();
  ok(!opened('debtday') && !opened('widow'), '빚 없음·남자 → 빚 갚는 날·재혼은 안 열린다');
  await settle(420); ok(g.flags.has('night:1') && g.flags.has('sahwa:on') && opened('sahwa'), '밤 → 사화'); closeCard();
  goTo('sarang'); ok(g.promptFor(ix.get('seoan_1')).verb.includes('상소'), '양반 남자 → 상소'); use('seoan_1'); pick('사림 편'); ok(done('sahwa') && g.flags.has('sahwa:sarim') && g.life.values.rank === 5, '사림 편 — 이겼다 → 벼슬 5'); closeCard();
  await settle(420); ok(g.flags.has('day:2') && g.flags.has('war:on') && opened('imjin') && shown.wae === true, '아침 → 임진왜란 + 왜선 보임'); closeCard();
  goTo('eogwi'); use('npc_uibyeong'); ok(btn('의병을 일으킨다'), '양반 → 의병을 일으킨다'); pick('의병을 일으킨다'); ok(done('imjin') && g.flags.has('imjin:lead') && g.life.values.rank === 6 && g.life.values.heart === 7 && g.flags.has('rank:capped'), '의병장 → 벼슬 천장 6·인심 7'); closeCard();
  await settle(420); ok(g.flags.has('horan:on') && opened('horan') && shown.qing === true, '병자호란 + 청 진영 보임'); closeCard();
  goTo('yangban'); use('npc_seonbi'); pick('척화'); ok(done('horan') && g.flags.has('horan:cheok'), '척화'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:uibyeong'), '끝: 의병장의 집(척화로 끌려감보다 의병이 먼저)'); ok(S.panels.at(-1).includes('조선') && S.panels.at(-1).includes('양반') && S.panels.at(-1).includes('🎖 벼슬'), '끝 카드에 나라·신분·벼슬');
  const carry = JSON.parse(store['kworld_carry:joseon-life']); ok(carry.branch === 'uibyeong' && carry.status === 'yangban' && carry.rank === 6, '조선 후기로 넘길 값에 갈림·신분·벼슬');
}
// ===== 판 2: 솔거 노비 여자(고려 「노비 그대로」, 발 빠른) — 호패가 없다 → 주인 몫의 베 → 스물여덟 자 → 도망: 행랑 노비 따라 담 넘고 숯가마에 호패를 버린다(발 3 성공) → 이름 없는 사람 → 과거: 못 본다(노비 아님이라 「딸은 안 온다」) → 사화 본다 → 임진: 마을에 남아 돌본다 → 병자: 끌려가다 돌아온다 → 인심으로 받아 줌
store['kworld_carry:goryeo-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'goryeo' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['escape', 'yeongsil', 'widow', 'baekjeong'], 'foot');
  ok(g.life.status === 'solgeo' && g.life.cap() === 0 && g.life.values.craft === 1, '노비 그대로 → 솔거 노비, 천장 0');
  goTo('gwana'); closeCard(); ok(g.promptFor(ix.get('hopae_1')).verb === '살펴보기', '여자는 호패를 안 받는다'); use('hopae_1'); ok(done('hopae') && g.flags.has('hopae:none') && !g.has('hopae'), '호패가 없다 — 호적에만'); closeCard();
  goTo('haengrang'); ok(opened('escape'), '섞여: 노비의 도망(호패 뒤)'); closeCard();
  await settle(260); closeCard(); goTo('eogwi'); ok(g.promptFor(ix.get('stonepile_1')).verb === '살펴보기', '여자는 돌을 안 진다'); goTo('anchae'); ok(g.promptFor(ix.get('sewing_1')).verb.includes('주인 몫'), '노비 여자 → 주인 몫의 베'); use('sewing_1'); ok(done('corvee') && g.flags.has('corvee:weaveslave') && !g.has('cloth'), '주인 몫의 베 — 내 것은 없다'); closeCard();
  await settle(260); closeCard(); goTo('seodang'); use('hangeul_1'); ok(done('hangeul') && g.flags.has('hangeul:learn'), '노비 여자도 스물여덟 자'); closeCard();
  goTo('haengrang'); use('npc_nobi'); pick('간다'); ok(g.flags.has('escape:run') && !done('escape'), '담을 넘었다 — 아직 산속'); ok(g.promptFor(ix.get('hideout_1')).verb.includes('호패를 버린다'), '숯가마 옆 → 호패를 버린다'); goTo('sanjung'); use('hideout_1'); ok(done('escape') && g.flags.has('escape:free') && g.life.status === 'drifter' && !g.life.hurt.has('leg'), '도망 성공 → 이름 없는 사람'); closeCard();
  await settle(260); closeCard(); goTo('dongheon'); ok(!opened('yeongsil'), '솜씨 1 < 3 → 장영실은 안 열린다'); use('examhall_1'); ok(!done('exam') && S.says.at(-1).includes('딸은'), '여자 → 안채로'); goTo('anchae'); use('npc_anju'); pick('같은 몫'); ok(done('exam') && g.flags.has('exam:inherit') && g.life.values.grain === 2, '이름 없는 사람도 여자면 같은 몫(노비였을 땐 안채 일)'); closeCard();
  goTo('anchae'); ok(opened('widow'), '섞여: 재혼(과거 뒤·여자)'); closeCard(); use('npc_anju'); ok(!btn('재혼한다 — 문과 볼').disabled, '이름 없는 사람 → 「막힐 문과가 없다」가 열린다'); pick('재혼한다 — 문과 볼'); ok(done('widow') && g.flags.has('widow:free') && g.life.values.heart === 2, '재혼 — 막힐 문과가 없다'); closeCard();
  await settle(420); closeCard(); goTo('sarang'); ok(g.promptFor(ix.get('seoan_1')).verb === '살펴보기', '상소는 양반 일'); use('seoan_1'); ok(done('sahwa') && g.flags.has('sahwa:watch'), '봤다'); closeCard();
  await settle(420); closeCard(); goTo('eogwi'); use('npc_uibyeong'); pick('마을에 남아'); ok(done('imjin') && g.flags.has('imjin:care') && g.life.values.heart === 4, '마을에 남아 돌봤다 → 인심 4'); closeCard();
  await settle(420); closeCard(); goTo('gogae'); ok(g.promptFor(ix.get('pass_1')).verb.includes('끌려가다'), '고개 → 끌려가다 도망친다'); use('pass_1'); ok(done('horan') && g.flags.has('horan:return'), '돌아왔다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:returned'), '끝: 돌아온 집 — 인심 4 ≥ 3 이라 마을이 받아 줬다');
}
// ===== 판 3: 서얼 남자(고려 「개국 공신」인데 잘 버티는 아이 → 서얼) — 뿔 호패 「서」 → 아버지 집 노비가 대신(안 불림) → 한글 → 과거: 문과 회색 → 무과 급제(천장 4) → 서얼: 어머니를 풀어 달라(눈) → 사화 본다 → 임진: 의병에 든다 → 병자: 숨는다 → 서얼의 집
store['kworld_carry:goryeo-life'] = JSON.stringify({ craft: 4, heart: 2, grain: 4, rank: 5, branch: 'gongsin', status: 'sadaebu', nation: 'goryeo' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['seoeol', 'hwangok', 'kkeokjeong', 'widow'], 'belly');
  ok(g.flags.has('char:belly') && g.life.status === 'seoeol' && g.life.cap() === 4, '공신 집인데 잘 버티는 아이 → 서얼, 천장 4');
  goTo('gwana'); closeCard(); ok(g.promptFor(ix.get('hopae_1')).verb.includes('「서(庶)」'), '서얼 → 뿔 호패 「서」'); use('hopae_1'); ok(done('hopae') && g.flags.has('hopae:ivory'), '호패'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); ok(g.promptFor(ix.get('bestall_1')).verb === '살펴보기', '서얼은 군포를 안 낸다(양반 호적)'); goTo('eogwi'); ok(g.promptFor(ix.get('stonepile_1')).verb === '살펴보기', '돌 더미 — 안 불린다'); use('stonepile_1'); ok(done('corvee') && g.flags.has('corvee:exempt') && S.says.slice(-3).some((t) => t.includes('양반이 아니다')), '아버지 집 노비가 대신 — 호적엔 양반, 집에선 아니다'); closeCard();
  await settle(260); closeCard(); goTo('seodang'); use('hangeul_1'); ok(done('hangeul'), '한글'); closeCard();
  await settle(260); closeCard(); await settle(300); closeCard(); goTo('yangban'); ok(opened('seoeol'), '섞여: 서얼(사랑채)'); closeCard();
  goTo('dongheon'); ok(g.promptFor(ix.get('examhall_1')).verb.includes('문과 ✗'), '서얼 → 문과 ✗ / 무과 / 잡과'); use('examhall_1'); ok(btn('문과').disabled && btn('문과').reason.includes('경국대전'), '문과는 회색 + 이유 한 줄'); pick('무과'); ok(done('exam') && g.flags.has('exam:mukwa') && g.life.values.rank === 2, '무과 급제 → 벼슬 2'); closeCard();
  goTo('sarang'); use('npc_seonbi'); pick('어머니를'); ok(done('seoeol') && g.flags.has('seo:free') && g.life.values.heart === 2, '어머니가 양인이 됐다'); closeCard();
  await settle(420); closeCard(); use('seoan_1'); ok(done('sahwa') && g.flags.has('sahwa:watch'), '상소는 양반 일 — 봤다'); closeCard();
  await settle(420); closeCard(); goTo('eogwi'); use('npc_uibyeong'); pick('의병에 든다'); ok(done('imjin') && g.flags.has('imjin:fight') && g.life.values.rank === 3, '서얼 → 의병 공 → 벼슬 3'); closeCard();
  await settle(420); closeCard(); goTo('gogae'); ok(g.promptFor(ix.get('pass_1')).verb === '살펴보기', '서얼은 고개 길이 없다 — 산속으로'); goTo('sanjung'); ok(opened('kkeokjeong'), '섞여: 임꺽정(산속 빈터)'); closeCard(); use('hideout_1'); ok(done('horan') && g.flags.has('horan:hide'), '숨었다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:seoeol'), '끝: 서얼의 집');
}
// ===== 판 4: 백정 남자(고려 「산으로 흩어진 집」, 손 좋은) — 「백정」 호패 → 부역 아님·가죽 바침 → 한글 → 장영실: 물을 긷는다(백정은 안 열림) → 과거: 마당에도 못 섬 → 백정: 가죽을 판다 → 사화 본다 → 임진: 의병 공 → 호적을 고침(상민) → 병자: 끌려가다 돌아옴 → 돌아온 집(인심 3)
store['kworld_carry:goryeo-life'] = JSON.stringify({ craft: 6, heart: 1, grain: 1, rank: 0, branch: 'drifter', status: 'drifter', nation: 'goryeo' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['baekjeong', 'yeongsil', 'hwangok', 'escape'], 'hand');
  ok(g.life.status === 'baekjeong' && g.life.cap() === 0 && g.life.values.craft === 3, '떠돌던 집 → 백정, 천장 0');
  goTo('gwana'); closeCard(); ok(g.promptFor(ix.get('hopae_1')).verb.includes('「백정」'), '백정 호패'); use('hopae_1'); ok(done('hopae') && g.flags.has('hopae:baek'), '호패에 「백정」'); closeCard();
  ok(!opened('escape'), '백정은 노비의 도망이 안 열린다');
  await settle(260); closeCard(); goTo('eogwi'); ok(g.promptFor(ix.get('stonepile_1')).verb === '살펴보기', '백정은 부역 아님'); use('stonepile_1'); ok(g.flags.has('corvee:hide') && !done('corvee'), '「가죽을 바쳐라」'); goTo('oettan'); ok(opened('baekjeong'), '섞여: 백정'); closeCard(); ok(g.promptFor(ix.get('rack_1')).verb.includes('바친다'), '가죽 걸이 → 바친다'); use('rack_1'); ok(done('corvee') && g.flags.has('corvee:leather'), '가죽을 바쳤다'); closeCard();
  ok(g.promptFor(ix.get('rack_1')).verb.includes('무두질'), '가죽 걸이 → 판다'); use('rack_1'); ok(done('baekjeong') && g.flags.has('bj:sell') && g.life.values.grain === 3, '가죽 셋 → 곡식 3'); closeCard();
  await settle(260); closeCard(); goTo('seodang'); use('hangeul_1'); ok(done('hangeul'), '백정도 스물여덟 자'); closeCard();
  await settle(260); closeCard(); await settle(300); closeCard(); goTo('dongheon'); ok(opened('yeongsil'), '섞여: 장영실(솜씨 3, 동헌)'); closeCard(); await settle(300); closeCard(); ok(g.promptFor(ix.get('jagyeokru_1')).verb === '물을 긷는다', '백정 → 물만 긷는다'); use('jagyeokru_1'); ok(done('yeongsil') && g.flags.has('yeongsil:watch'), '물을 길었다'); closeCard(); use('examhall_1'); ok(done('exam') && g.flags.has('exam:denied') && S.says.slice(-3).some((t) => t.includes('백정')), '마당에도 못 선다'); closeCard();
  await settle(420); closeCard(); goTo('sarang'); use('seoan_1'); ok(done('sahwa') && g.flags.has('sahwa:watch'), '봤다'); closeCard();
  await settle(420); closeCard(); goTo('eogwi'); use('npc_uibyeong'); pick('의병에 든다'); ok(done('imjin') && g.flags.has('imjin:baekfight') && g.life.status === 'sangmin' && g.life.cap() === 3, '백정 의병 공 → 호적을 고침(상민, 천장 3)'); closeCard();
  await settle(420); closeCard(); goTo('gogae'); use('pass_1'); ok(done('horan') && g.flags.has('horan:return'), '돌아왔다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:returned') && g.life.values.heart === 3, '끝: 돌아온 집 — 백정이 의병 공으로 쌓은 인심 3이 문을 열었다');
  const carry = JSON.parse(store['kworld_carry:joseon-life']); ok(carry.status === 'sangmin' && carry.branch === 'returned', '조선 후기로 상민으로 넘어간다');
}
console.log(`joseon-life 고리: ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
