// 조선 후기 인생 층 고리 시험 2 — 10-10 자기 장소: 후기 전용 터의 새 장소 일곱(향청·난전 골목·놀이판·담배·인삼 밭·이양선 모래톱·산골 옹기 마을·화전 마을) 상황을 강제로 켜서 여섯 판(신향 남 / 상민 여 / 솔거 남 / 도고 남 실패 길 / 소작 남 씨감자 / 상민 남 불 번짐). 신분·성별 회색 · 숨김 재질 보임(향안 붉은 끈·새 좌판·탈춤 춤꾼·담배 잎·조) · 불 놓으면 화전민 · 옹기 마을에 남으면 끝 갈림 · 향안 끝 갈림 · 실패 흔적.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:joseon-life': JSON.stringify({ craft: 4, heart: 4, grain: 6, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['hopae_1','samun_1','examhall_1','jagyeokru_1','hwangok_1','hangeul_1','seoan_1','sewing_1','slavehut_1','ybgate_1','bigpaddy_1','bigpaddy_2','smallpaddy_1','smallpaddy_2','homepaddy_1','bestall_1','stonepile_1','rack_1','hideout_1','pass_1','qingcamp_1','boat_1','waeship_1',
  'hyangan_1','hyangseat_1','nanstall_1','newstall_1','dogostore_1','madang_1','buk_1','tobacco_1','dryshed_1','ginseng_1','westship_1','crate_1','rowboat_1','onggikiln_1','onggi_1','jarbook_1','burnfield_1','potato_1',
  'npc_jumo','npc_nongbu','npc_pojol','npc_cheongjigi','npc_seonbi','npc_ai','npc_nageune','npc_hunjang','npc_baetsagong','npc_sojak','npc_baekjeong','npc_anju','npc_nobi','npc_ajeon','npc_gwanno','npc_kkeokjeong','npc_uibyeong','npc_sunsin',
  'npc_jwasu','npc_nanjeon','npc_gwangdae','npc_gasam','npc_munjeong','npc_gyou','npc_hwajeonmin'];
// 엔진 좌표(x, z = -블렌더 y)
const AREAS = { eogwi: [0, 40], outroad: [0, 58], jangteo: [0, 6], jumak: [-13.5, 5], well: [6.5, 2.5], yangban: [0, -22], haengrang: [-9.5, -23.5], sarang: [-7, -27], anchae: [1, -37.5], gwana: [-27, 5], dongheon: [-30, -8.5], choga: [28, 7], field: [27, 30], seodang: [-31, 29.5], naru: [9, 93], deul: [66, 9], oettan: [72, 79], gogae: [-100, 70], sanjung: [-80, -84],
  hyangcheong: [32, -28], nanjeon: [-14.5, 24.2], nori: [-24, 55], crops: [27, 59], isyang: [-50, 94.5], gyouchon: [34, -90], hwajeon: [76, -58] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { const H = { hyangan_1: ['new_name', 'name'], newstall_1: ['new_stall', 'stall'], madang_1: ['mask_dancer', 'dancer'], dryshed_1: ['dry_leaf', 'leaf'], burnfield_1: ['new_millet', 'millet'] }[name]; if (H) fn({ isMesh: true, material: { name: H[0] }, set visible(v) { shown[H[1]] = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const MIX = ['hyangcheong', 'nanjeon', 'nori', 'crops', 'isyang', 'gyouchon', 'hwajeon'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };
const ALL = ['sit:monaegi:done', 'sit:jangsi:done', 'sit:gongmyeong:done', 'sit:silhak:done', 'sit:year1801:done', 'sit:samjeong:done'];
const endOf = (g) => g.life.d.situations.find((s) => s.id === 'uprising').choices[0].then[0].end;
const carry = (key) => JSON.parse(store['kworld_carry:joseon-late-life'] || '{}')[key];

// ===== 판 1: 신향 남자(눈 밝은, 곡식 6) — 향안에 이름 → 붉은 끈 보임 · 노비 시켜 팔기 · 소리꾼을 집으로 · 소작 내보내기 · 「교역은 안 된다」 · 관아에 알린다 · 화전세 → 끝 갈림 「향안에 오른 집」
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('sinyang'); ok(g.life.status === 'sinyang' && g.life.values.grain >= 6, '신향·곡식 여섯');
  ok(g.life.situations.length === 14 && Object.keys(g.world.areas).length === 26, '꼭 7 + 새 7 · 구역 26');
  goTo('hyangcheong'); ok(!opened('hyangcheong'), '공명첩 전엔 향청 안 열림');
  on(...ALL); goTo('hyangcheong'); ok(opened('hyangcheong'), '향청'); closeCard(); ok(shown.name === false, '붉은 끈은 처음엔 숨김');
  ok(verb(g, 'hyangan_1').includes('이름을 올린다'), '신향: 향안 이름 올리기 열림'); useR('npc_jwasu', '향안에'); ok(!btn('향안에')?.disabled && !btn('수령에게')?.disabled && btn('족보를')?.disabled && btn('서얼도')?.disabled && btn('향안 궤')?.disabled, '신향: 올리기·쌀 열림·막기·통문·궤 회색'); S.panel = null;
  const r0 = g.life.values.rank; useR('hyangan_1', '이름을'); closeCard(); await drain(closeCard, goTo, 'hyangcheong'); ok(done('hyangcheong') && g.flags.has('hc:list') && shown.name === true && g.life.values.rank === r0 + 1, '향안 → 붉은 끈 보임 · 🎖+1');
  goTo('nanjeon'); ok(opened('nanjeon'), '난전'); closeCard(); ok(verb(g, 'newstall_1') === '살펴보기' && shown.stall === false, '신향은 빈 자리에 안 앉는다 · 새 좌판 숨김'); useR('npc_nanjeon', '노비를 시켜'); ok(!btn('노비를 시켜')?.disabled && btn('빈 자리에')?.disabled && btn('떡·술')?.disabled && btn('창고에')?.disabled, '신향: 노비 시키기 열림·좌판·떡·도고 회색'); pick('노비를 시켜'); closeCard(); ok(done('nanjeon') && g.flags.has('nj:proxy'), '노비를 시켜 팔았다');
  goTo('nori'); closeCard(); ok(verb(g, 'madang_1') === '살펴보기' && verb(g, 'buk_1') === '살펴보기', '신향: 탈·북 손 안 댐'); useR('npc_gwangdae', '소리꾼을'); ok(!btn('소리꾼을')?.disabled && !btn('갓 쓰고')?.disabled && btn('탈을 쓰고')?.disabled && btn('북을')?.disabled && btn('담 너머')?.disabled, '신향 남자: 부르기·맨 뒤 열림·탈·북·담 너머 회색'); pick('소리꾼을'); closeCard(); ok(done('nori') && g.flags.has('nr:invite'), '소리꾼을 불렀다');
  goTo('crops'); closeCard(); ok(verb(g, 'tobacco_1') === '살펴보기', '신향은 제 논을 바꿔 심지 않는다'); useR('npc_gasam', '소작 땅을'); ok(!btn('소작 땅을')?.disabled && btn('논 한쪽에')?.disabled && btn('잎을 딴다')?.disabled && btn('목화를')?.disabled, '신향: 소작 내보내기 열림·심기·품·목화 회색'); const h0 = g.life.values.heart; pick('소작 땅을'); closeCard(); ok(done('crops') && g.flags.has('cr:evict') && g.life.values.heart === Math.max(0, h0 - 2), '소작을 내보냈다 → 🤝-2');
  goTo('isyang'); closeCard(); ok(verb(g, 'crate_1') === '살펴보기', '신향은 씨감자 안 받음'); useR('npc_munjeong', '「교역은'); ok(!btn('「교역은')?.disabled && btn('물과 땔감')?.disabled && btn('배에 올라')?.disabled && btn('씨감자를')?.disabled, '신향: 교역 거절 열림·물·묻기·씨감자 회색'); pick('「교역은'); closeCard(); ok(done('isyang') && g.flags.has('is:refuse'), '교역은 안 된다');
  goTo('gyouchon'); closeCard(); ok(verb(g, 'onggi_1') === '살펴보기' && verb(g, 'onggikiln_1').includes('거든다'), '신향: 옹기 지기 안 함·굽기는 누구나'); useR('npc_gyou', '관아에'); ok(!btn('관아에')?.disabled && btn('「교우」')?.disabled && btn('옹기를 지고')?.disabled && !btn('여기 남아')?.disabled, '신향: 알리기·남기 열림·교우·지기 회색'); const h1 = g.life.values.heart; pick('관아에'); closeCard(); ok(done('gyouchon') && g.flags.has('gy:report') && g.life.values.heart === Math.max(0, h1 - 3), '관아에 알렸다 → 🤝-3');
  goTo('hwajeon'); closeCard(); ok(verb(g, 'burnfield_1') === '살펴보기', '신향은 불 안 놓음'); useR('npc_hwajeonmin', '화전세를'); ok(!btn('화전세를')?.disabled && btn('비탈에 불을')?.disabled && btn('감자·조를')?.disabled && btn('나물')?.disabled && btn('씨감자를')?.disabled, '신향 남자: 화전세 열림·나머지 회색'); pick('화전세를'); closeCard(); ok(done('hwajeon') && g.flags.has('hj:tax'), '화전세를 걷었다');
  g.life.end(endOf(g)); ok(g.flags.has('life:sinyang') && carry('branch') === 'sinyang', '끝 갈림: 향안에 오른 집(넘김 id sinyang)');
  ok(['hyangjeon', 'nanjeon', 'nori', 'crops', 'isyang', 'gyouchon', 'hwajeon'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 상민 여자(손 좋은, 곡식 1) — 좌판 펴기(새 좌판 보임) · 탈춤(춤꾼 보임) · 담배 심기(시렁 잎 보임) · 씨감자 · 불 놓기 → 화전민(조 보임) · 옹기 마을에 남는다 → 끝 갈림 「옹기 마을의 집」
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 3, heart: 3, grain: 1, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'hand');
  ok(g.life.status === 'sangmin', '상민'); on(...ALL);
  goTo('hyangcheong'); closeCard(); ok(verb(g, 'hyangan_1') === '살펴보기', '상민은 향안에 못 오름'); useR('npc_jwasu', '마당 밖에서'); ok(btn('향안에')?.disabled && btn('수령에게')?.disabled && btn('족보를')?.disabled, '상민: 올리기·쌀·막기 회색'); pick('마당 밖에서'); closeCard(); ok(done('hyangcheong') && g.flags.has('hc:watch'), '마당 밖에서 봤다');
  goTo('nanjeon'); closeCard(); ok(verb(g, 'newstall_1').includes('좌판을 편다'), '상민: 빈 자리 열림'); useR('newstall_1', '좌판을'); closeCard(); await drain(closeCard, goTo, 'nanjeon'); ok(done('nanjeon') && g.flags.has('nj:stall') && shown.stall === true, '좌판을 폈다 → 새 좌판 보임');
  goTo('nori'); closeCard(); ok(shown.dancer === false && verb(g, 'madang_1').includes('탈을 쓴다'), '춤꾼 숨김 · 상민: 탈 쓰기 열림'); useR('madang_1', '탈을'); closeCard(); await drain(closeCard, goTo, 'nori'); ok(done('nori') && g.flags.has('nr:mask') && shown.dancer === true, '탈을 썼다 → 춤꾼 보임');
  goTo('crops'); closeCard(); ok(shown.leaf === false && verb(g, 'tobacco_1').includes('담배로'), '시렁 비어 있음 · 상민: 담배 심기 열림'); const g0 = g.life.values.grain; useR('tobacco_1', '논 한쪽을'); closeCard(); await drain(closeCard, goTo, 'crops'); ok(done('crops') && g.flags.has('cr:tobacco') && shown.leaf === true && g.life.values.grain === g0 + 3, '담배 → 시렁에 잎 · 🌾+3');
  goTo('isyang'); closeCard(); ok(verb(g, 'crate_1').includes('씨감자'), '상민: 씨감자 열림'); useR('crate_1', '씨감자를'); closeCard(); ok(done('isyang') && g.flags.has('is:potato'), '씨감자를 얻었다');
  goTo('hwajeon'); closeCard(); ok(shown.millet === false && verb(g, 'burnfield_1').includes('불을 놓는다'), '조 숨김 · 상민: 불 놓기 열림'); useR('npc_hwajeonmin', '비탈에 불을'); ok(!btn('비탈에 불을')?.disabled && !btn('씨감자를')?.disabled && !btn('나물')?.disabled && btn('화전세를')?.disabled && btn('감자·조를')?.disabled, '상민 여자: 불·씨감자·나물 열림·세금·화전민 심기 회색'); pick('비탈에 불을'); closeCard(); await drain(closeCard, goTo, 'hwajeon'); ok(done('hwajeon') && g.flags.has('hj:burn') && g.life.status === 'hwajeon' && shown.millet === true, '불을 놓았다 → 화전민 · 조 보임');
  goTo('gyouchon'); closeCard(); useR('npc_gyou', '여기 남아'); ok(!btn('여기 남아')?.disabled && !btn('옹기를 지고')?.disabled && btn('관아에')?.disabled && btn('「교우」')?.disabled, '화전민: 남기·지기 열림·알리기·교우(노비·백정) 회색'); pick('여기 남아'); closeCard(); ok(done('gyouchon') && g.flags.has('gy:stay'), '남았다');
  g.life.end(endOf(g)); ok(g.flags.has('life:catholic') && carry('branch') === 'catholic' && carry('status') === 'hwajeon', '끝 갈림: 옹기 마을의 집(넘김 id catholic) · 신분 화전');
}
// ===== 판 3: 솔거 노비 남자(발 빠른) — 궤 나르기 · 짐 · 탈 · 북 · 물 나르기(책은 회색) · 「교우」 · 화전·밭은 본다
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 1, heart: 1, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'foot');
  ok(g.life.status === 'solgeo', '솔거 노비'); on(...ALL);
  goTo('hyangcheong'); closeCard(); useR('npc_jwasu', '향안 궤'); ok(!btn('향안 궤')?.disabled && btn('향안에')?.disabled && btn('말을 옮긴다')?.disabled, '노비: 궤 열림·올리기·말 옮기기 회색'); pick('향안 궤'); closeCard(); ok(done('hyangcheong') && g.flags.has('hc:errand'), '궤를 날랐다');
  goTo('nanjeon'); closeCard(); ok(verb(g, 'newstall_1') === '살펴보기' && verb(g, 'dogostore_1') === '살펴보기', '노비: 좌판·도고 손 안 댐'); useR('npc_nanjeon', '짐을'); ok(!btn('짐을')?.disabled && btn('빈 자리에')?.disabled && btn('노비를 시켜')?.disabled, '노비: 짐 열림·좌판·시키기 회색'); pick('짐을'); closeCard(); ok(done('nanjeon') && g.flags.has('nj:errand'), '짐을 날랐다');
  goTo('nori'); closeCard(); ok(verb(g, 'buk_1').includes('북을'), '노비: 북 열림'); useR('buk_1', '북을'); closeCard(); ok(done('nori') && g.flags.has('nr:drum'), '북을 쳤다');
  goTo('isyang'); closeCard(); useR('npc_munjeong', '물과 땔감'); ok(!btn('물과 땔감')?.disabled && btn('책 한 권')?.disabled && btn('씨감자를')?.disabled, '노비: 물 열림·책·씨감자 회색'); pick('물과 땔감'); closeCard(); ok(done('isyang') && g.flags.has('is:water'), '물을 날랐다');
  goTo('gyouchon'); closeCard(); useR('npc_gyou', '「교우」'); ok(!btn('「교우」')?.disabled && btn('관아에')?.disabled, '노비: 교우 열림·알리기 회색'); const h0 = g.life.values.heart; pick('「교우」'); closeCard(); ok(done('gyouchon') && g.flags.has('gy:brother') && g.life.values.heart === h0 + 2, '「교우」 → 🤝+2');
  goTo('crops'); closeCard(); useR('npc_gasam', '본다'); ok(btn('논 한쪽에')?.disabled && btn('잎을 딴다')?.disabled && btn('목화를')?.disabled, '노비 남자: 심기·품·목화 회색'); pick('본다'); closeCard(); ok(done('crops') && g.flags.has('cr:watch'), '봤다');
  goTo('hwajeon'); closeCard(); ok(verb(g, 'burnfield_1') === '살펴보기', '노비는 불 안 놓음(도망은 다른 길)'); useR('npc_hwajeonmin', '본다'); ok(btn('비탈에 불을')?.disabled, '노비: 불 회색'); pick('본다'); closeCard(); ok(done('hwajeon') && g.flags.has('hj:watch'), '봤다');
}
// ===== 판 4: 도고 남자(곡식 5) — 수령에게 쌀 → 붉은 끈 · 삼포는 회색(곡식 둘 남음) · 몰아 사기 실패 → 값이 먼저 떨어졌다 · 끝 갈림 향안
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 3, heart: 3, grain: 5, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('dogo'); ok(g.life.status === 'dogo', '도고'); on(...ALL);
  goTo('hyangcheong'); closeCard(); ok(verb(g, 'hyangan_1') === '살펴보기', '도고는 향안에 직접 못 오름'); useR('npc_jwasu', '수령에게'); ok(!btn('수령에게')?.disabled && btn('향안에')?.disabled, '도고: 쌀 열림·이름 회색'); const g0 = g.life.values.grain; pick('수령에게'); closeCard(); await drain(closeCard, goTo, 'hyangcheong'); ok(done('hyangcheong') && g.flags.has('hc:bribe') && shown.name === true && g.life.values.grain === g0 - 3, '수령 편을 샀다 → 붉은 끈 · 🌾-3');
  goTo('crops'); closeCard(); useR('npc_gasam', '본다'); ok(btn('삼포를')?.disabled, '곡식 둘이면 삼포 회색'); pick('본다'); closeCard();
  Math.random = () => 0.99; g.life.tries = {};
  goTo('nanjeon'); closeCard(); ok(verb(g, 'dogostore_1').includes('몰아 산다'), '도고: 창고 열림'); const g1 = g.life.values.grain; useR('dogostore_1', '몰아'); closeCard(); ok(done('nanjeon') && g.flags.has('nj:hoardfail') && g.life.values.grain === Math.max(0, g1 - 2), '값이 먼저 떨어졌다 → 🌾-2');
  Math.random = () => 0.01;
  g.life.end(endOf(g)); ok(g.flags.has('life:sinyang') && carry('branch') === 'sinyang', '끝 갈림: 향안(쌀로 산 자리)');
}
// ===== 판 5: 소작 남자(잘 버티는) — 씨감자 → 화전에서 씨감자 심기(🌾+3) · 잎 따기 품(시렁 잎 보임) · 옹기 지고 팔기
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 0, rank: 0, branch: 'sojak', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'sojak', '소작'); on(...ALL);
  goTo('isyang'); closeCard(); useR('npc_munjeong', '씨감자를'); pick('씨감자를'); closeCard(); ok(done('isyang') && g.flags.has('is:potato'), '씨감자');
  goTo('hwajeon'); closeCard(); useR('npc_hwajeonmin', '씨감자를'); ok(!btn('씨감자를')?.disabled && btn('나물')?.disabled, '씨감자 열림 · 남자는 나물 회색'); const g0 = g.life.values.grain; pick('씨감자를'); closeCard(); ok(done('hwajeon') && g.flags.has('hj:potato2') && g.life.values.grain === g0 + 3, '씨감자를 심었다 → 🌾+3');
  goTo('crops'); closeCard(); useR('npc_gasam', '잎을 딴다'); ok(!btn('잎을 딴다')?.disabled && !btn('논 한쪽에')?.disabled, '소작: 품·심기 열림'); pick('잎을 딴다'); closeCard(); await drain(closeCard, goTo, 'crops'); ok(done('crops') && g.flags.has('cr:hire') && shown.leaf === true, '잎을 땄다 → 시렁에 잎');
  goTo('gyouchon'); closeCard(); ok(verb(g, 'onggi_1').includes('지고'), '소작: 옹기 지기 열림'); useR('onggi_1', '지고'); closeCard(); ok(done('gyouchon') && g.flags.has('gy:sell'), '옹기를 지고 팔았다');
}
// ===== 판 6: 상민 남자 — 실패 길: 비탈에 불을 놓다 번짐 → 팔 흔적 · 그 뒤 불 놓기는 회색
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 2, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  on(...ALL); Math.random = () => 0.99; g.life.tries = {};
  goTo('hwajeon'); closeCard(); useR('burnfield_1', '불을'); closeCard(); ok(done('hwajeon') && g.flags.has('hj:fire') && g.flags.has('hurt:wound') && g.life.status === 'sangmin' && shown.millet === false, '불이 번졌다 → 팔 흔적 · 화전민 아님 · 조 없음');
  ok(verb(g, 'burnfield_1') === '살펴보기', '다친 뒤엔 불 놓기 막힘');
  Math.random = () => 0.01;
}
console.log(`joseon-late life 고리 2(자기 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
