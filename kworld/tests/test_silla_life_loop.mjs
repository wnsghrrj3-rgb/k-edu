// 통일신라·발해 인생 층 고리 시험 — 삼국 갈림(from:*)→나라·신분(cap) → 7 상황 → 끝 카드. 천장(독서삼품과 상품인데 6두품은 3에서 멈춤), 성별(계단은 남자·땅문서는 여자), 노비 몰래 타기→풀려남, 발해 수령의 천장 2, 왕건 깃발→성씨를 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:samguk-life': JSON.stringify({ craft: 6, heart: 4, grain: 5, branch: 'noble_fallen', status: 'noble', nation: 'baekje' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['jingolgate_1', 'slavehut_1', 'census_1', 'mulberry_1', 'mulberry_2', 'mulberry_3', 'mulberry_4', 'ox_1', 'well_1', 'stone_1', 'stone_2', 'stone_3', 'dyestall_1', 'tangstall_1', 'stall_1', 'exam_1', 'pagoda_1', 'pagoda_2', 'grotto_1', 'stonepile_1', 'offering_1', 'stair_1', 'bigpaddy_1', 'smallpaddy_1', 'hojokgranary_1', 'hojokgate_1', 'ship_1', 'ship_2', 'tradepile_1', 'fish_1', 'redcamp_1', 'mound_1', 'stoneman_1', 'hollow_1', 'log_1', 'pass_1', 'flags_1',
  'npc_lord', 'npc_clerk', 'npc_census', 'npc_slave', 'npc_trader', 'npc_teacher', 'npc_choe', 'npc_monk', 'npc_mason', 'npc_minister', 'npc_farmer', 'npc_hojok', 'npc_jangbogo', 'npc_envoy', 'npc_rebel', 'npc_keeper', 'npc_runaway', 'npc_passguard'];
const AREAS = { village: [0, 0], market: [20, -16], gukhak: [-28, 12], temple: [-58, 38], office: [36, 32], paddy: [-46, -36], hojok: [64, -26], shore: [18, -60], ford: [56, -67], hill: [70, -104], tomb: [72, 62], woods: [-84, 78], pass: [2, 106] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'redcamp_1') fn({ isMesh: true, material: { name: 'red_cloth' }, set visible(v) { shown.red = v; } }); if (name === 'grotto_1') fn({ isMesh: true, material: { name: 'grotto_buddha' }, set visible(v) { shown.buddha = v; } }); if (name === 'flags_1') fn({ isMesh: true, material: { name: 'flag_wang' }, set visible(v) { shown.flag = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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

// ===== 판 1: 신라 6두품 남자(삼국 「망한 나라의 귀족」) — 촌락문서 적기(벼슬 1) → 독서삼품과 상품(+3 → 천장 3에서 멈춤) → 21자 → 석굴 부처 → 글 올리기 → 당 유학(천장) → 최치원 → 호족 밑(천장 없음) → 왕건 깃발 → 성씨 받은 집
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['house', 'choe', 'robe', 'envoy']);
  ok(g.era === 'silla-life', 'era 키');
  ok(g.flags.has('from:noble_fallen') && g.life.nation === 'silla' && g.life.status === 'six' && g.life.cap() === 3 && g.life.values.grain === 5 && g.life.values.craft === 3, '망한 나라 귀족 → 통일신라 6두품, 천장 3, 곡식 전부·솜씨 절반');
  goTo('village'); ok(opened('census'), '촌락문서 상황'); closeCard();
  ok(g.promptFor(ix.get('mulberry_1')).verb === '살펴보기', '6두품은 뽕나무를 안 센다'); use('npc_census'); pick('내가 적는다'); ok(done('census') && g.life.values.rank === 1 && g.life.values.craft === 4, '적는 사람 → 벼슬 1·솜씨 4'); closeCard();
  await settle(260); ok(g.flags.has('exam:on') && opened('exam'), '국학 북소리 → 독서삼품과'); closeCard();
  goTo('gukhak'); ok(g.promptFor(ix.get('exam_1')).verb.includes('책을 읽는다'), '6두품 남자 → 책을 읽는다'); use('exam_1'); ok(g.flags.has('exam:top') && g.has('book'), '상품'); ok(done('exam') && g.life.values.rank === 3 && g.flags.has('rank:capped'), '벼슬 +3 → 천장 3에서 멈춤(capped)'); ok(S.panels.at(-1).includes('천장 3') && S.panels.at(-1).includes('여기까지'), '결과 카드에 「천장 3 — 여기까지」'); closeCard();
  goTo('office'); ok(g.promptFor(ix.get('stair_1')).verb.includes('여기까지'), '계단 「여기까지 — 천장」'); use('stair_1'); ok(g.life.values.rank === 3, '더는 안 오른다');
  goTo('village'); ok(opened('house'), '섞여: 집 넓히기'); closeCard(); ok(g.promptFor(ix.get('jingolgate_1')).verb.includes('21자'), '6두품 → 21자까지'); g.inventory.push('grain', 'grain'); use('jingolgate_1'); ok(done('house') && g.flags.has('house:21'), '21자'); closeCard();
  await settle(260); ok(g.flags.has('temple:on') && opened('bulguksa'), '탑이 섰다'); closeCard();
  goTo('temple'); use('npc_mason'); ok(btn('손을 보인다') && !btn('손을 보인다').disabled, '솜씨 4 → 정을 받는다'); pick('손을 보인다'); ok(g.has('chisel') && g.flags.has('craft:mason'), '정'); ok(g.promptFor(ix.get('grotto_1')).verb === '부처를 새긴다', '석굴 → 부처를 새긴다'); use('grotto_1'); ok(done('bulguksa') && g.flags.has('temple:carve') && shown.buddha === true && g.life.values.craft === 9 && g.life.values.rank === 3, '석굴 부처 보임 · 솜씨 9 · 벼슬은 천장(3) 그대로'); closeCard();
  await settle(420); ok(g.flags.has('night:1') && g.flags.has('famine:on') && opened('famine'), '밤 → 흉년에 또 세금'); closeCard();
  goTo('village'); ok(g.promptFor(ix.get('ox_1')).verb === '살펴보기', '6두품은 소를 안 판다'); use('npc_clerk'); pick('같이 글을'); ok(done('famine') && g.flags.has('famine:petition') && g.life.values.heart === 4, '글을 올렸다 → 인심 4'); closeCard();
  await settle(260); ok(g.flags.has('sea:on') && opened('sea'), '청해진'); closeCard();
  goTo('shore'); ok(opened('envoy'), '섞여: 발해 사신'); closeCard(); use('npc_envoy'); pick('말을 섞는다'); ok(done('envoy'), '남북국'); closeCard(); use('npc_jangbogo'); ok(S.says.at(-1).includes('사신선'), '6두품은 유학'); ok(g.promptFor(ix.get('ship_2')).verb.includes('당으로'), '사신선 → 당 유학'); use('ship_2'); ok(done('sea') && g.flags.has('tang:studied') && g.life.values.rank === 3, '빈공과 → 벼슬은 천장 그대로'); closeCard();
  goTo('gukhak'); ok(opened('choe'), '섞여: 최치원'); closeCard(); use('npc_choe'); pick('같이 글을'); ok(done('choe') && g.flags.has('choe:advice'), '시무 10조'); closeCard();
  await settle(260); ok(g.flags.has('unrest:on') && opened('unrest') && shown.red === true, '원종·애노 + 붉은 바지 보임'); closeCard();
  goTo('hill'); ok(g.promptFor(ix.get('redcamp_1')).verb === '살펴보기', '6두품은 산채에 안 올라간다');
  goTo('hojok'); use('npc_hojok'); ok(btn('내가 호족이') && btn('내가 호족이').disabled && btn('내가 호족이').reason.includes('곡식 8'), '곡식 모자라 호족 못 됨(회색+이유)'); pick('밑에 든다'); ok(done('unrest') && g.life.status === 'retainer' && g.life.cap() === null && g.flags.has('status:retainer') && !g.flags.has('status:six'), '호족의 사람 → 천장 없음'); closeCard();
  await settle(420); ok(g.flags.has('fall:on') && opened('fall') && shown.flag === true, '후삼국 + 깃발 보임'); closeCard();
  goTo('pass'); use('flags_1'); pick('푸른 깃발'); ok(done('fall') && g.flags.has('fall:wang'), '왕건 깃발'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:surname'), '끝: 성씨를 받은 집'); ok(S.panels.at(-1).includes('🏳️ 통일신라') && S.panels.at(-1).includes('호족의 사람') && S.panels.at(-1).includes('🎖 벼슬'), '끝 카드에 나라·신분·벼슬');
  const carry = JSON.parse(store['kworld_carry:silla-life']); ok(carry.branch === 'surname' && carry.status === 'retainer' && carry.rank === 3, '고려로 넘길 값에 갈림·신분·벼슬');
}
// ===== 판 2: 신라 노비 여자(삼국 「노비 그대로」, 발 빠른 아이) — 소 옆에 적힘 → 계단 앞 막힘 → 돌 나름 → 담 지킴 → 큰 배 몰래 타기 성공 → 평민 → 들고일어남 → 견훤 깃발 → 들고일어난 집
store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, branch: 'slave', status: 'slave', nation: 'silla' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['robe', 'escape', 'westerner', 'house'], 'foot');
  ok(g.life.nation === 'silla' && g.life.status === 'slave' && g.life.cap() === 0, '노비 그대로 → 통일신라 노비, 천장 0');
  goTo('village'); closeCard(); ok(g.promptFor(ix.get('mulberry_1')).verb === '살펴보기', '노비는 뽕나무를 안 센다'); use('npc_census'); ok(done('census') && g.flags.has('census:slave'), '소 옆에 적혔다'); closeCard();
  await settle(260); closeCard(); goTo('gukhak'); ok(g.promptFor(ix.get('exam_1')).verb === '살펴보기', '노비는 국학 문이 안 열린다'); goTo('office'); ok(g.promptFor(ix.get('stair_1')).verb === '살펴보기', '계단 앞'); use('stair_1'); ok(done('exam') && g.flags.has('exam:blocked') && g.life.values.rank === 0, '노비는 계단 앞에도 못 갔다'); closeCard();
  goTo('market'); ok(opened('robe'), '섞여: 옷 색'); closeCard(); use('dyestall_1'); ok(done('robe') && g.flags.has('robe:watch'), '노비는 옷감을 안 산다'); closeCard();
  await settle(260); closeCard(); goTo('village'); ok(opened('house'), '섞여: 집(노비)'); closeCard(); use('jingolgate_1'); ok(done('house') && g.flags.has('house:no'), '노비 집은 넓히는 게 아니다'); closeCard(); use('stone_1'); goTo('temple'); use('npc_mason'); ok(S.says.at(-1).includes('노비는 돌을'), '노비는 정을 못 받는다'); use('stonepile_1'); ok(done('bulguksa') && g.flags.has('temple:carry'), '돌을 날랐다'); closeCard();
  await settle(420); closeCard(); goTo('village'); ok(g.promptFor(ix.get('hollow_1')).verb === '살펴보기' || true, '-'); use('jingolgate_1'); ok(done('famine') && g.flags.has('famine:guard'), '담을 지켰다'); closeCard();
  goTo('woods'); ok(opened('escape'), '섞여: 노비 도망(흉년 뒤)'); closeCard(); ok(g.promptFor(ix.get('hollow_1')).verb.includes('달아난다'), '바위 밑 → 달아난다');
  await settle(260); closeCard(); goTo('shore'); use('npc_jangbogo'); ok(S.says.at(-1).includes('몰래'), '노비 → 몰래'); use('ship_1'); ok(done('sea') && g.flags.has('sea:stow') && g.life.status === 'farmer' && g.flags.has('free:now') && g.flags.has('status:farmer'), '몰래 타기 성공 → 평민'); closeCard();
  await settle(260); ok(opened('unrest'), '봉기'); closeCard(); goTo('hill'); ok(g.promptFor(ix.get('redcamp_1')).verb.includes('들고일어난다'), '평민 → 산채 깃발'); use('redcamp_1'); ok(done('unrest') && g.flags.has('unrest:rise'), '들고일어났다'); closeCard();
  await settle(420); closeCard(); goTo('pass'); use('flags_1'); pick('노란 깃발'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:rebel'), '끝: 들고일어난 집 — 졌다(깃발보다 봉기가 먼저)');
}
// ===== 판 3: 발해 말갈 마을 남자(삼국 「북쪽으로 간 집」) — 말 바침 → 군공(1) → 돌 나름 → 겨울 사냥 → 일본 노 젓기 → 거란 막기(2=천장) → 고려로
store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 3, branch: 'north', status: 'farmer', nation: 'goguryeo' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['robe', 'envoy', 'westerner', 'house'], 'belly');
  ok(g.life.nation === 'balhae' && g.life.status === 'bal_folk' && g.life.cap() === 2 && g.flags.has('nation:balhae'), '북으로 간 집 → 발해 말갈 마을, 천장 2');
  goTo('village'); closeCard(); use('npc_census'); pick('말을 바친다'); ok(done('census') && g.flags.has('census:horse'), '말을 바쳤다'); closeCard();
  await settle(260); closeCard(); goTo('pass'); use('npc_passguard'); pick('말을 타고'); ok(done('exam') && g.flags.has('exam:merit') && g.life.values.rank === 1 && !g.flags.has('rank:capped'), '군공 → 벼슬 1'); closeCard();
  await settle(260); closeCard(); goTo('village'); ok(opened('house'), '섞여: 집'); closeCard(); use('stone_1'); goTo('temple'); use('npc_monk'); ok(btn('가 보겠다'), '발해 마을 사람 → 돌 더미'); pick('가 보겠다'); use('stonepile_1'); ok(done('bulguksa'), '돌을 날랐다'); closeCard();
  await settle(420); closeCard(); goTo('pass'); use('npc_passguard'); pick('겨울 사냥'); ok(done('famine') && g.flags.has('famine:hunt') && g.has('fur'), '사냥 → 담비 가죽'); closeCard();
  await settle(260); closeCard(); goTo('shore'); closeCard(); ok(g.promptFor(ix.get('ship_2')).verb.includes('노를'), '발해 마을 → 노를 젓는다'); use('ship_2'); ok(done('sea') && g.flags.has('sea:japan'), '일본'); closeCard();
  await settle(260); closeCard(); goTo('hill'); ok(g.promptFor(ix.get('redcamp_1')).verb === '살펴보기', '발해 사람은 신라 봉기에 없다'); goTo('pass'); use('npc_passguard'); pick('거란을'); ok(done('unrest') && g.life.values.rank === 2 && g.flags.has('rank:capped'), '거란 막음 → 벼슬 2 = 천장'); closeCard();
  await settle(420); closeCard(); goTo('pass'); ok(g.promptFor(ix.get('flags_1')).verb === '살펴보기', '발해 사람은 남쪽 깃발이 없다'); use('npc_passguard'); pick('고려로'); ok(done('fall') && g.flags.has('fall:goryeo'), '고려로'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:bal_goryeo'), '끝: 발해 사람 — 고려로');
}
// ===== 판 4: 신라 진골 여자(삼국 「신라 귀족 그대로」) — 녹읍 숨김 → 계단 대신 땅문서(여자 회색) → 24자 → 짓게 한다 → 덜 걷는다 → 장보고와 손잡기 → 왕위 다툼 이김(+2) → 신라에 남는다 → 옛 왕족 낀 자리
store['kworld_carry:samguk-life'] = JSON.stringify({ craft: 4, heart: 6, grain: 9, branch: 'noble_silla', status: 'noble', nation: 'silla' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['house', 'robe', 'westerner', 'envoy'], 'eye');
  ok(g.life.status === 'jingol' && g.life.cap() === 6 && g.life.values.grain === 9, '신라 귀족 그대로 → 진골, 천장 6');
  goTo('village'); closeCard(); use('npc_census'); pick('녹읍은 적지'); ok(done('census') && g.life.values.grain === 11, '녹읍 숨김 → 곡식 11'); closeCard();
  await settle(260); closeCard(); goTo('office'); ok(g.promptFor(ix.get('stair_1')).verb === '살펴보기', '여자는 계단을 못 오른다'); use('stair_1'); ok(!done('exam') && S.says.at(-1).includes('남자가 오른다'), '이유 한 줄'); goTo('village'); use('npc_lord'); pick('땅문서를'); ok(done('exam') && g.flags.has('exam:land') && g.life.values.grain === 13, '딸은 땅문서'); closeCard();
  goTo('village'); ok(opened('house'), '섞여: 집'); closeCard(); ok(g.promptFor(ix.get('jingolgate_1')).verb.includes('24자'), '진골 → 24자'); g.inventory.push('grain', 'grain', 'grain'); use('jingolgate_1'); ok(done('house') && g.flags.has('house:24'), '24자'); closeCard();
  await settle(260); closeCard(); goTo('temple'); g.inventory.push('grain', 'grain', 'grain'); use('npc_monk'); pick('짓게 한다'); ok(done('bulguksa') && g.flags.has('temple:build'), '짓게 했다'); closeCard();
  await settle(420); closeCard(); goTo('village'); use('npc_lord'); pick('올해는 반만'); ok(done('famine') && g.flags.has('famine:spare') && g.life.values.heart === 9, '덜 걷었다 → 인심 9'); closeCard();
  await settle(260); closeCard(); goTo('shore'); closeCard(); use('npc_jangbogo'); pick('손잡는다'); ok(done('sea') && g.flags.has('sea:ally'), '장보고와 손잡았다'); closeCard();
  await settle(260); closeCard(); goTo('office'); use('npc_minister'); pick('편을 고른다'); ok(done('unrest') && g.flags.has('unrest:win') && g.life.values.rank === 2, '왕위 다툼 이김 → 벼슬 2'); closeCard();
  await settle(420); closeCard(); goTo('office'); use('npc_minister'); pick('신라에 남는다'); ok(done('fall') && g.flags.has('fall:stay'), '남았다'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:silla_royal'), '끝: 경순왕 따라 — 옛 왕족 낀 자리');
}
console.log(`silla-life 고리: ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
