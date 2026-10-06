// 조선 후기 인생 층 고리 시험 — 조선 전기 갈림(from:*)→신분 → 7 상황(모내기·장시·공명첩·실학·1801·세도·봉기) → 끝 카드. 상민이 도고 → 공명첩 양반 → 과거는 못 봄 → 곳간을 열어 봉기가 비껴감 / 노비 여자의 도망(광산, 안 잡힘) / 서얼의 통청·규장각 검서관(천장 4) / 관노의 1801년 문서 불 → 양인 → 봉기 승리. || 조건·끝 갈림 || 도 같이.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:joseon-life': JSON.stringify({ craft: 4, heart: 4, grain: 4, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' }) };
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
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const use = (name) => { closeCard(); g.target = ix.get(name); g.act(); if (S.panel && S.panel.b.length === 1 && S.panel.h.includes('chk life') && !S.panel.h.includes('결과') && !S.panel.h.includes('이번 삶')) { closeCard(); g.act(); } };   // 상황 카드가 늦게 떠 있으면 먼저 닫는다; 살펴본 깃발이 카드를 열어 선택 판이 밀리면 한 번 더 누른다(실제 화면과 같은 흐름)
  const pick = (label) => { if (!S.panel) { console.log('판 없음', label); fail++; return; } const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  return { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
Math.random = () => 0.01;

// ===== 판 1: 상민 남자(전기 「상민의 집」, 눈 밝은) — 모내기 두 배 → 장시: 밑천 넷으로 도고 → 공명첩을 산다(곡식 다섯) = 공명첩 양반(천장 4) → 전기수 홍길동전 → 아이를 서당에 → 1801 모임 → 숨는다 → 세도: 공명첩 양반은 과거를 못 본다 → 봉기: 곳간을 연다 → 「곳간을 연 집」
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['mine', 'story', 'yeonhaeng', 'baekjeong'], 'eye');
  ok(g.era === 'joseon-late-life', 'era 키');
  ok(g.flags.has('from:sangmin') && g.life.nation === 'joseon' && g.life.status === 'sangmin' && g.life.cap() === 3 && g.life.values.grain === 4 && g.life.values.craft === 2, '상민 → 상민, 곡식 전부·솜씨 절반');
  ok(ix.has('jeongisu_1') && ix.has('mine_1') && ix.has('donghak_1'), 'scene.add 소품 셋이 자리에');
  goTo('field'); ok(opened('monaegi'), '모내기 상황'); closeCard();
  ok(g.promptFor(ix.get('bigpaddy_1')).verb === '살펴보기' && g.promptFor(ix.get('smallpaddy_1')).verb.includes('모내기'), '상민 → 상민 논에서 모내기(양반 논은 살펴보기)'); use('smallpaddy_1'); pick('모내기'); ok(done('monaegi') && g.flags.has('mon:try') && g.life.values.grain === 8, '모내기 두 배 → 곡식 8'); closeCard();
  await settle(260); ok(g.flags.has('market:on') && opened('jangsi'), '북소리 → 장시'); closeCard();
  goTo('jangteo'); use('bestall_1'); ok(btn('소금·쌀을 몽땅') && !btn('소금·쌀을 몽땅').disabled, '밑천 넷 → 도고 열림'); pick('소금·쌀을 몽땅'); ok(done('jangsi') && g.flags.has('jang:dogo') && g.life.status === 'dogo' && g.life.values.grain === 13, '도고 → 곡식 13, 신분 도고'); closeCard();
  ok(opened('mine') && opened('story') && opened('yeonhaeng') && opened('baekjeong'), '섞여 넷(장시 뒤)'); closeCard(); await settle(300); closeCard();
  goTo('jumak'); use('jeongisu_1'); ok(done('story') && g.flags.has('story:listen') && g.life.values.heart === 3, '전기수 홍길동전 → 인심 3'); closeCard();
  goTo('sanjung'); ok(g.promptFor(ix.get('mine_1')).verb === '살펴보기', '도고는 광산을 안 판다 — 살펴보기'); use('mine_1'); ok(done('mine') && g.flags.has('mine:watch'), '광산 봤다'); closeCard();
  await settle(260); ok(g.flags.has('gongmyeong:on') && opened('gongmyeong'), '공명첩'); closeCard();
  goTo('gwana'); use('hopae_1'); ok(btn('공명첩을 산다') && !btn('공명첩을 산다').disabled, '곡식 다섯 → 공명첩 열림'); pick('공명첩을 산다'); ok(done('gongmyeong') && g.flags.has('gong:buy') && g.life.status === 'sinyang' && g.life.cap() === 4 && g.life.values.grain === 8 && g.life.values.rank === 1 && g.has('deed'), '공명첩 → 공명첩 양반(천장 4), 곡식 8, 벼슬 1'); closeCard();
  await settle(260); ok(g.flags.has('silhak:on') && opened('silhak'), '실학'); closeCard();
  goTo('seodang'); use('hangeul_1'); pick('아이를 서당에'); ok(done('silhak') && g.flags.has('sil:send') && g.life.values.grain === 7, '아이를 서당에 → 곡식 7'); closeCard();
  await settle(420); ok(g.flags.has('night:1') && g.flags.has('year1801:on') && opened('year1801'), '밤 → 1801'); closeCard();
  goTo('oettan'); use('rack_1'); pick('모임에 든다'); ok(g.flags.has('y1:in') && !done('year1801'), '모임 — 아직 박해 전'); ok(g.promptFor(ix.get('rack_1')).verb.includes('숨는다'), '박해 → 숨는다'); use('rack_1'); ok(done('year1801') && g.flags.has('y1:hid') && !g.life.hurt.has('jail') && g.life.values.heart === 5, '숨어서 살았다 → 인심 5'); closeCard();
  await settle(420); ok(g.flags.has('day:2') && g.flags.has('samjeong:on') && opened('samjeong'), '아침 → 세도'); closeCard();
  goTo('dongheon'); ok(g.promptFor(ix.get('examhall_1')).verb.includes('공명첩 양반'), '공명첩 양반 → 과거 자리'); use('examhall_1'); ok(done('samjeong') && g.flags.has('sam:fake'), '「벼슬이 아니라 이름이다」'); closeCard();
  await settle(420); ok(g.flags.has('uprising:on') && opened('uprising') && shown.qing === true && shown.wae === true, '봉기 + 관군 진영·이양선 보임'); closeCard();
  goTo('yangban'); use('ybgate_1'); ok(btn('곳간을 연다') && !btn('곳간을 연다').disabled, '곡식 넷 → 곳간 연다'); pick('곳간을 연다'); ok(done('uprising') && g.flags.has('up:open') && g.life.values.grain === 3 && g.life.values.heart === 9, '곳간 → 곡식 3·인심 9'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:open'), '끝: 곳간을 연 집'); ok(S.panels.at(-1).includes('조선 후기') && S.panels.at(-1).includes('공명첩 양반'), '끝 카드에 나라·신분');
  const carry = JSON.parse(store['kworld_carry:joseon-late-life']); ok(carry.branch === 'open' && carry.status === 'sinyang', '개항기로 넘길 값');
}
// ===== 판 2: 솔거 노비 여자(전기 「노비 그대로」, 발 빠른) — 주인 논 모내기 → 장시: 한 단 몰래 판다 → 도망: 행랑 노비 따라 광산으로(발 1) → 품팔이 → 공명첩: 호적 없음 → 실학: 담 밖 소설 → 1801: 안 든다 → 세도: 뇌물 → 봉기: 주먹밥 → 끝 「달아난 집」(escape:free || up:run)
store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'joseon' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['escape', 'women', 'janggilsan', 'debtday'], 'foot');
  ok(g.life.status === 'solgeo' && g.life.cap() === 0, '노비 그대로 → 솔거');
  goTo('field'); closeCard(); ok(g.promptFor(ix.get('bigpaddy_1')).verb.includes('주인 논'), '노비 → 주인 논 모내기'); use('bigpaddy_1'); ok(done('monaegi') && g.flags.has('mon:slave') && g.life.values.grain === 1, '주인 논 → 곡식 1'); closeCard();
  goTo('haengrang'); ok(opened('escape'), '섞여: 노비의 도망(모내기 뒤)'); closeCard(); await settle(260); closeCard();
  goTo('jangteo'); use('bestall_1'); ok(btn('한 단 몰래'), '노비 → 몰래 판다'); pick('한 단 몰래'); ok(done('jangsi') && g.flags.has('jang:steal') && g.life.values.grain === 2, '몰래 → 곡식 2'); closeCard(); await settle(300); closeCard();
  goTo('haengrang'); use('npc_nobi'); pick('간다'); ok(g.flags.has('escape:run'), '담을 넘었다'); goTo('sanjung'); ok(g.promptFor(ix.get('hideout_1')).verb.includes('광산으로'), '숯가마 옆 → 광산으로'); use('hideout_1'); ok(done('escape') && g.flags.has('escape:free') && g.life.status === 'pumpali' && !g.life.hurt.has('leg'), '안 잡혔다 → 품팔이'); closeCard();
  goTo('gwana'); ok(opened('gongmyeong'), '공명첩'); closeCard(); use('hopae_1'); ok(done('gongmyeong') && g.flags.has('gong:watch'), '호적 없음 → 봤다'); closeCard();
  goTo('anchae'); ok(opened('women') && opened('janggilsan') && !opened('debtday'), '여자·장길산 열림, 빚 없음'); closeCard(); await settle(300); closeCard();
  await settle(300); closeCard(); use('npc_anju'); pick('줄어든 몫'); ok(done('women') && g.flags.has('wom:less') && g.life.values.grain === 3, '딸 몫이 줄었다 → 곡식 3'); closeCard();
  goTo('seodang'); ok(opened('silhak'), '실학'); closeCard(); ok(g.promptFor(ix.get('hangeul_1')).verb.includes('담 밖'), '품팔이 → 담 밖'); use('hangeul_1'); ok(done('silhak') && g.flags.has('sil:read'), '담 밖 소설'); closeCard();
  await settle(420); closeCard(); goTo('oettan'); use('rack_1'); pick('안 든다'); ok(done('year1801') && g.flags.has('y1:out'), '안 들었다'); closeCard();
  await settle(420); closeCard(); goTo('gwana'); use('hwangok_1'); ok(btn('아전에게 뇌물') && !btn('아전에게 뇌물').disabled, '곡식 하나 → 뇌물'); pick('아전에게 뇌물'); ok(done('samjeong') && g.flags.has('sam:bribe') && g.life.values.grain === 2, '뇌물 → 곡식 2'); closeCard();
  await settle(420); closeCard(); goTo('jumak'); use('npc_jumo'); ok(btn('주먹밥'), '여자 → 주먹밥'); pick('주먹밥'); ok(done('uprising') && g.flags.has('up:bae'), '주먹밥'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:runaway'), '끝: 달아난 집(escape:free || up:run)');
}
// ===== 판 3: 서얼 남자(전기 「서얼의 집」, 손 좋은, 솜씨 6→3) — 집 논 소작에게 → 장시 판다 → 통청 상소(눈 2) 벼슬 1 → 규장각 검서관(눈 2) +3 → 천장 4에서 멈춤 → 1801 모임·숨는다 → 세도: 낸다 → 봉기: 동학 → 끝 「동학의 집」
store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 6, heart: 2, grain: 5, rank: 2, branch: 'seoeol', status: 'seoeol', nation: 'joseon' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['seoeol', 'story', 'mine', 'yeonhaeng'], 'hand');
  ok(g.life.status === 'seoeol' && g.life.cap() === 4 && g.life.values.craft === 3, '서얼, 천장 4, 솜씨 3');
  goTo('field'); closeCard(); ok(g.promptFor(ix.get('bigpaddy_1')).verb.includes('집 논'), '서얼 → 집 논'); use('bigpaddy_1'); ok(done('monaegi') && g.flags.has('mon:order') && g.life.values.grain === 8, '소작에게 → 곡식 8'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); use('bestall_1'); pick('그냥 판다'); ok(done('jangsi') && g.flags.has('jang:sell') && g.life.values.grain === 10, '판다 → 10'); closeCard(); await settle(300); closeCard();
  goTo('gwana'); ok(opened('gongmyeong'), '공명첩'); closeCard(); use('hopae_1'); ok(btn('통청 상소'), '서얼 → 통청'); pick('통청 상소'); ok(done('gongmyeong') && g.flags.has('gong:tong') && g.life.values.rank === 1, '통청 → 벼슬 1'); closeCard();
  goTo('sarang'); ok(opened('seoeol'), '섞여: 서얼(공명첩 뒤)'); closeCard(); use('seoan_1'); pick('홍길동전 같은'); ok(done('seoeol') && g.flags.has('seo:write') && g.life.values.craft === 5, '글 → 솜씨 5'); closeCard();
  await settle(260); goTo('seodang'); ok(opened('silhak'), '실학'); closeCard(); ok(g.promptFor(ix.get('hangeul_1')).verb.includes('검서관'), '솜씨 3 이상 서얼 → 검서관'); use('hangeul_1'); ok(done('silhak') && g.flags.has('sil:geomseo') && g.life.values.rank === 4 && g.flags.has('rank:capped'), '검서관 +3 → 천장 4에서 멈춤'); closeCard();
  await settle(420); closeCard(); goTo('oettan'); use('rack_1'); pick('모임에 든다'); use('rack_1'); ok(done('year1801') && g.flags.has('y1:hid'), '모임 → 숨었다'); closeCard();
  await settle(420); closeCard(); goTo('gwana'); use('hwangok_1'); pick('낸다'); ok(done('samjeong') && g.flags.has('sam:pay') && g.life.values.grain === 7, '낸다 → 곡식 7'); closeCard();
  await settle(420); closeCard(); goTo('gogae'); use('donghak_1'); ok(done('uprising') && g.flags.has('up:donghak'), '동학'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:donghak'), '끝: 동학의 집');
}
// ===== 판 4: 관노 남자(전기 「산채로 가다 잡힌 집」, 잘 버티는) — 주인 논 → 장시 심부름 → 공명첩: 관아에 → 실학 담 밖 → 1801: 곳간 문서가 탄다 → 양인(상민) → 세도: 못 낸다 → 품팔이 → 봉기: 삼문 관아로(몸 2 성공) → 끝 「장부를 태운 집」 — 실패 굴림 한 번(광산 굴 무너짐 → 다침)
store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 1, heart: 1, grain: 0, rank: 0, branch: 'kk_caught', status: 'solgeo', nation: 'joseon' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['mine', 'janggilsan', 'story', 'baekjeong'], 'belly');
  ok(g.life.status === 'gwanno' && g.life.cap() === 0, '산채로 가다 잡힘 → 관노(fromstatus 보다 branch 가 먼저)');
  goTo('field'); closeCard(); use('bigpaddy_1'); ok(done('monaegi') && g.flags.has('mon:slave'), '관노도 주인(관아) 논'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); use('bestall_1'); pick('주인 심부름'); ok(done('jangsi') && g.flags.has('jang:errand'), '심부름'); closeCard(); await settle(300); closeCard();
  goTo('sanjung'); ok(opened('mine') && g.promptFor(ix.get('mine_1')).verb === '살펴보기', '관노는 광산 안 판다(살펴보기)'); use('mine_1'); ok(done('mine'), '광산 봤다'); closeCard();
  goTo('gwana'); closeCard(); use('hopae_1'); ok(done('gongmyeong') && g.flags.has('gong:nosell') && S.says.at(-1).includes('태운대'), '관노 → 「나라 노비 문서를 태운대」'); closeCard();
  await settle(260); goTo('seodang'); closeCard(); use('hangeul_1'); ok(done('silhak') && g.flags.has('sil:read'), '담 밖 소설'); closeCard();
  await settle(420); closeCard(); goTo('gwana'); ok(g.promptFor(ix.get('hwangok_1')).verb.includes('관노는 양인'), '1801 → 곳간이 「노비 문서 태우는 불」'); use('hwangok_1'); ok(done('year1801') && g.flags.has('y1:freed') && g.life.status === 'sangmin' && g.life.cap() === 3, '문서가 탔다 → 상민(천장 3)'); closeCard();
  await settle(420); closeCard(); goTo('gwana'); use('hwangok_1'); ok(btn('낸다').disabled && btn('아전에게 뇌물') && !btn('아전에게 뇌물').disabled, '곡식 1 → 낸다 회색·뇌물 열림'); pick('못 낸다'); ok(done('samjeong') && g.flags.has('sam:land') && g.life.status === 'pumpali', '못 냈다 → 품팔이'); closeCard();
  await settle(420); closeCard(); goTo('gwana'); ok(g.promptFor(ix.get('samun_1')).verb.includes('봉기'), '품팔이 남자 → 삼문 봉기'); use('samun_1'); ok(done('uprising') && g.flags.has('up:win') && !g.life.hurt.has('wound'), '삼문이 열렸다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:rise_won'), '끝: 장부를 태운 집');
}
// ===== 실패 굴림: 광산 굴 무너짐 → 다침, 모내기 가뭄, 통청 실패
Math.random = () => 0.99;
store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 2, rank: 0, branch: 'sojak', status: 'sangmin', nation: 'joseon' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['mine', 'story', 'yeonhaeng', 'baekjeong'], 'eye');
  ok(g.life.status === 'sojak' && g.life.cap() === 2, '땅을 넘긴 집 → 소작(천장 2)');
  goTo('field'); closeCard(); use('bigpaddy_1'); ok(done('monaegi') && g.flags.has('mon:slave'), '소작 → 주인 논(굴림 어려움 1: 실패해도 흔적 없음)'); closeCard();
  await settle(260); closeCard(); goTo('jangteo'); use('bestall_1'); pick('거둔 것을'); ok(done('jangsi'), '판다'); closeCard(); await settle(300); closeCard();
  goTo('sanjung'); use('mine_1'); pick('광군'); ok(done('mine') && g.flags.has('mine:fall') && g.life.hurt.has('wound'), '굴이 무너졌다 → 다침'); closeCard();
  ok(g.life.cond('(status:sojak || status:yangban) && hurt:wound') && !g.life.cond('!(status:sojak || status:yangban)') && g.life.cond('status:nothing || hurt:wound'), '|| 조건 — 괄호 있고 없고');
}
console.log(`joseon-late-life loop: ${pass}/${fail}`); if (fail) process.exit(1);
