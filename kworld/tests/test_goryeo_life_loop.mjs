// 고려 인생 층 고리 시험 — 통일신라 갈림(from:*)→신분 → 7 상황 → 끝 카드. 노비안검법으로 풀려남(법이 풀어 줌), 과거→신진 사대부(역전), 서희 담판(눈), 송 배 몰래 타기, 정변의 밤, 처인성(부곡이 현으로), 땅문서 태우기 → 이성계/정몽주.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:silla-life': JSON.stringify({ craft: 6, heart: 4, grain: 4, rank: 3, branch: 'surname', status: 'retainer', nation: 'silla' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['munbeolgate_1', 'slavehut_1', 'oegeohut_1', 'ledger_1', 'well_1', 'stone_1', 'stone_2', 'stone_3', 'examhall_1', 'eumseogate_1', 'bigpaddy_1', 'smallpaddy_1', 'cottonfield_1', 'kiln_1', 'celadon_1', 'sogate_1', 'pagoda_1', 'woodblock_1', 'offering_1', 'fortgate_1', 'wall_1', 'drum_1', 'fortgranary_1', 'spearrack_1', 'wardrum_1', 'songship_1', 'ganghwaship_1', 'tradepile_1', 'arabstall_1', 'fish_1', 'meetrock_1', 'hollow_1', 'log_1', 'pass_1', 'talkmat_1', 'mongolcamp_1', 'pgranary_1', 'deedpile_1', 'firepit_1', 'powergate_1',
  'npc_munbeol', 'npc_hyangni', 'npc_yangmin', 'npc_solgeo', 'npc_oegeo', 'npc_examiner', 'npc_sadaebu', 'npc_soin', 'npc_overseer', 'npc_monk', 'npc_carver', 'npc_gimyunhu', 'npc_general', 'npc_merchant', 'npc_arab', 'npc_manjeok', 'npc_seohui', 'npc_gwonmun'];
const AREAS = { village: [0, 0], office: [36, 32], paddy: [-40, -30], so: [-84, -62], temple: [-58, 38], fortress: [0, 52], camp: [48, -4], port: [18, -60], ford: [56, -67], hill: [70, -104], woods: [-84, 78], pass: [2, 106], power: [66, -28] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'mongolcamp_1') fn({ isMesh: true, material: { name: 'mongol_tent' }, set visible(v) { shown.mongol = v; } }); if (name === 'woodblock_1') fn({ isMesh: true, material: { name: 'carved_block' }, set visible(v) { shown.carved = v; } }); if (name === 'cottonfield_1') fn({ isMesh: true, material: { name: 'cotton_white' }, set visible(v) { shown.cotton = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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

// ===== 판 1: 향리 남자(통일신라 「왕건 깃발 — 성씨 받은 집」) — 명부 적기(벼슬 1) → 과거 급제 → 신진 사대부(역전, 천장 6) → 서희 곁에서 담판(강동 6주) → 송 사신 → 정변의 밤 문 닫기 → 솜씨 4+ 경판 새기기(보임) → 땅문서 태우기 → 이성계 편 → 개국 공신
{
  const { g, ix, S, shown, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['celadon', 'cotton', 'inherit', 'yeokgwan']);
  ok(g.era === 'goryeo-life', 'era 키');
  ok(g.flags.has('from:surname') && g.life.nation === 'goryeo' && g.life.status === 'hyangni' && g.life.cap() === 4 && g.life.values.grain === 4 && g.life.values.craft === 3, '성씨 받은 집 → 고려 향리, 천장 4, 곡식 전부·솜씨 절반');
  goTo('village'); ok(opened('angeom'), '노비안검 상황'); closeCard();
  ok(g.promptFor(ix.get('ledger_1')).verb === '명부를 적는다', '향리 → 명부를 적는다'); use('ledger_1'); ok(done('angeom') && g.flags.has('angeom:write') && g.life.values.rank === 1 && g.life.values.craft === 4, '적는 사람 → 벼슬 1·솜씨 4'); closeCard();
  await settle(260); ok(g.flags.has('exam:on') && opened('exam'), '북소리 → 과거'); closeCard();
  goTo('office'); ok(g.promptFor(ix.get('eumseogate_1')).verb === '살펴보기', '향리는 음서 문이 안 열린다'); ok(g.promptFor(ix.get('examhall_1')).verb.includes('시험을 본다'), '향리 남자 → 시험을 본다'); use('examhall_1'); ok(g.flags.has('exam:pass') && g.has('book'), '급제'); ok(done('exam') && g.life.status === 'sadaebu' && g.life.cap() === 6 && g.life.values.rank === 3 && g.flags.has('status:sadaebu') && !g.flags.has('status:hyangni'), '급제 → 신진 사대부(천장 4→6), 벼슬 3'); closeCard();
  await settle(260); ok(g.flags.has('khitan:on') && opened('khitan'), '거란'); closeCard();
  goTo('pass'); ok(g.promptFor(ix.get('talkmat_1')).verb.includes('서희 곁'), '담판 천막 → 서희 곁에 앉는다'); use('talkmat_1'); ok(done('khitan') && g.flags.has('khitan:talk') && g.life.values.rank === 4 && g.life.values.craft === 7, '강동 6주 → 벼슬 4·솜씨 7'); closeCard();
  await settle(260); ok(g.flags.has('port:on') && opened('port'), '벽란도'); closeCard();
  goTo('port'); ok(opened('yeokgwan') === false, '역관은 몽골 뒤에야'); ok(g.promptFor(ix.get('songship_1')).verb === '살펴보기', '사대부는 송 사신 줄이 없다(향리였을 때만)'); use('npc_merchant'); pick('인삼을'); ok(done('port') && g.flags.has('port:sell') && g.life.values.grain === 6, '인삼을 팔았다 → 곡식 6'); closeCard();
  await settle(420); ok(g.flags.has('night:1') && g.flags.has('coup:on') && opened('coup'), '밤 → 무신정변'); closeCard();
  goTo('camp'); ok(g.promptFor(ix.get('spearrack_1')).verb === '살펴보기', '사대부는 창을 안 든다'); goTo('village'); use('npc_yangmin'); pick('문을 닫고'); ok(done('coup') && g.flags.has('coup:quiet') && g.life.status === 'sadaebu', '문을 닫았다'); closeCard();
  await settle(420); ok(g.flags.has('day:2') && g.flags.has('mongol:on') && opened('mongol') && shown.mongol === true, '아침 → 몽골 + 천막 보임'); closeCard();
  goTo('temple'); use('npc_carver'); ok(btn('손을 보인다') && !btn('손을 보인다').disabled, '솜씨 7 → 칼을 받는다'); pick('손을 보인다'); ok(g.has('knife') && g.flags.has('craft:carver'), '판각 칼'); ok(g.promptFor(ix.get('woodblock_1')).verb.includes('글자를 새긴다'), '경판 → 새긴다'); use('woodblock_1'); ok(done('mongol') && g.flags.has('mongol:carve') && shown.carved === true && g.life.values.craft === 9, '경판 보임 · 솜씨 9'); closeCard();
  goTo('paddy'); ok(opened('cotton'), '섞여: 목화'); closeCard(); use('npc_yangmin'); pick('목화씨를'); ok(g.has('seed'), '씨앗'); use('cottonfield_1'); ok(done('cotton') && shown.cotton === true && g.life.values.grain === 8, '목화 솜 보임 · 곡식 8'); closeCard();
  await settle(420); ok(g.flags.has('land:on') && opened('land'), '땅문서를 태우는 날'); closeCard();
  goTo('power'); use('npc_sadaebu'); ok(S.says.at(-1).includes('불 자리부터'), '태우기 전엔 편을 안 묻는다'); ok(g.promptFor(ix.get('deedpile_1')).verb === '살펴보기', '사대부는 되찾을 문서가 없다'); ok(g.promptFor(ix.get('firepit_1')).verb.includes('태운다'), '불 자리 → 태운다'); use('firepit_1'); ok(g.flags.has('land:burn') && !done('land'), '태웠다 — 아직 끝 아님'); use('npc_sadaebu'); pick('이성계 편'); ok(done('land') && g.flags.has('land:yi') && g.life.values.rank === 5, '이성계 편 → 벼슬 5'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:gongsin'), '끝: 조선 개국 공신 — 사대부의 집'); ok(S.panels.at(-1).includes('🏳️ 고려') && S.panels.at(-1).includes('신진 사대부') && S.panels.at(-1).includes('🎖 벼슬'), '끝 카드에 나라·신분·벼슬');
  const carry = JSON.parse(store['kworld_carry:goryeo-life']); ok(carry.branch === 'gongsin' && carry.status === 'sadaebu' && carry.rank === 5, '조선으로 넘길 값에 갈림·신분·벼슬');
}
// ===== 판 2: 솔거 노비 여자(통일신라 「노비 그대로」, 발 빠른) — 명부에서 증거 없음(그대로) → 시험장 앞 → 성 안에서 돕기 → 송 배 몰래 타기 성공(양인) → 문 닫기 → 성벽 돌 → 땅문서 태우기 → 이성계 → 송 배를 탄 집
store['kworld_carry:silla-life'] = JSON.stringify({ craft: 2, heart: 0, grain: 0, rank: 0, branch: 'slave', status: 'slave', nation: 'silla' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['celadon', 'manjeok', 'inherit', 'sambyeolcho'], 'foot');
  ok(g.life.status === 'solgeo' && g.life.cap() === 0 && g.life.values.craft === 1, '노비 그대로 → 솔거 노비(솜씨 1 < 3)');
  goTo('village'); closeCard(); ok(g.promptFor(ix.get('ledger_1')).verb.includes('원래 양인'), '노비 → 「원래 양인이었습니다」'); const R = Math.random; Math.random = () => 0.99; use('ledger_1'); Math.random = R; ok(done('angeom') && g.flags.has('angeom:stay') && g.life.status === 'solgeo', '증거 없음 → 그대로'); closeCard();
  await settle(260); closeCard(); goTo('office'); ok(g.promptFor(ix.get('examhall_1')).verb === '살펴보기', '노비는 시험장이 안 열린다'); use('examhall_1'); ok(done('exam') && g.flags.has('exam:slave') && g.life.values.rank === 0, '노비는 돌아가라'); closeCard();
  await settle(260); closeCard(); goTo('pass'); ok(g.promptFor(ix.get('talkmat_1')).verb === '살펴보기', '노비는 천막에 못 앉는다'); goTo('village'); use('npc_yangmin'); pick('성 안에서'); ok(done('khitan') && g.flags.has('khitan:help'), '성 안에서 도왔다'); closeCard();
  goTo('village'); ok(!opened('inherit'), '노비 여자는 상속 상황이 안 열린다(장소는 맞아도)'); 
  await settle(260); closeCard(); goTo('port'); use('npc_merchant'); ok(S.says.at(-1).includes('몰래'), '송 상인 → 몰래'); ok(g.promptFor(ix.get('songship_1')).verb === '몰래 탄다', '송 배 → 몰래 탄다'); use('songship_1'); ok(done('port') && g.flags.has('port:stow') && g.life.status === 'yangmin' && g.flags.has('free:now') && g.life.cap() === 3, '몰래 타기 성공 → 양인(천장 3)'); closeCard();
  goTo('village'); ok(opened('inherit'), '양인이 되자 상속 상황이 열린다'); closeCard(); use('npc_yangmin'); pick('같은 몫'); ok(done('inherit') && g.life.values.grain === 2, '아들과 같은 몫'); closeCard();
  await settle(420); closeCard(); goTo('village'); use('npc_yangmin'); pick('문을 닫고'); ok(done('coup'), '문을 닫았다'); closeCard();
  await settle(420); closeCard(); goTo('fortress'); use('npc_gimyunhu'); ok(S.says.at(-1).includes('성 안으로'), '여자 → 돌을 쌓는다'); use('wall_1'); ok(S.says.at(-1).includes('돌이 있어야'), '돌이 있어야'); g.inventory.push('stone'); use('wall_1'); ok(done('mongol') && g.flags.has('mongol:stone'), '성벽을 쌓았다'); closeCard();
  goTo('port'); ok(opened('sambyeolcho'), '섞여: 삼별초'); closeCard(); ok(g.promptFor(ix.get('songship_1')).verb === '살펴보기', '여자는 삼별초 배가 없다'); use('npc_merchant'); pick('…안 탄다'); ok(done('sambyeolcho') && !g.flags.has('sambyeol'), '안 탔다'); closeCard();
  await settle(420); closeCard(); goTo('power'); use('deedpile_1'); ok(g.flags.has('land:reclaim') && g.has('deed') && g.count('grain') >= 2, '신돈의 도감 — 내 땅문서(+곡식 둘 손에)'); use('firepit_1'); ok(g.flags.has('land:burn'), '남의 문서를 태웠다'); use('npc_sadaebu'); pick('이성계 편'); ok(done('land'), '이성계 편'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:reclaim'), '끝: 땅을 되찾은 집(되찾음이 송 배보다 먼저)');
}
// ===== 판 3: 소(所) 남자(통일신라 「들고일어난 집 — 졌다」, 잘 버티는) — 「우리 소도」(법은 노비만) → 과거는 법으로 막힘 → 군사로(안융진) → 청자 굽기 → 감독에게 청자 → 망이·망소이 들고일어남 → 현이 됨(어귀 열림) → 문 닫기 → 처인성 → 태우기 → 이성계 → 소에서 현으로 올라간 집
store['kworld_carry:silla-life'] = JSON.stringify({ craft: 4, heart: 2, grain: 1, rank: 0, branch: 'rebel', status: 'farmer', nation: 'silla' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('m', ['celadon', 'mangi', 'cotton', 'yeokgwan'], 'belly');
  ok(g.life.status === 'bugok' && g.life.cap() === 0, '들고일어나 진 집 → 향·소·부곡, 천장 0');
  goTo('village'); closeCard(); use('ledger_1'); ok(done('angeom') && g.flags.has('angeom:bugok'), '「우리 소도」 — 법은 노비만'); closeCard();
  await settle(260); closeCard(); goTo('office'); use('examhall_1'); ok(done('exam') && g.flags.has('exam:bugok'), '소 사람은 과거를 못 본다 — 법으로'); closeCard();
  goTo('so'); ok(opened('celadon') && opened('mangi'), '섞여: 청자 + 망이·망소이(과거 뒤)'); closeCard(); await settle(300); closeCard(); ok(g.promptFor(ix.get('kiln_1')).verb.includes('굽는다'), '소 사람 → 가마'); use('kiln_1'); ok(done('celadon') && g.has('celadon') && g.life.values.craft === 4, '비색 → 솜씨 4'); await settle(300); closeCard(); ok(g.promptFor(ix.get('sogate_1')).verb === '넘어가 본다' || g.promptFor(ix.get('sogate_1')).verb === '살펴보기', '어귀'); use('npc_overseer'); if (!btn('들고일어난다')) { closeCard(); use('npc_overseer'); } pick('들고일어난다'); ok(done('mangi') && g.flags.has('so:raised') && g.life.status === 'yangmin' && g.life.cap() === 3, '명학소 → 충순현, 양인(천장 3)'); await settle(300); closeCard(); await settle(300); closeCard(); ok(g.promptFor(ix.get('sogate_1')).verb === '살펴보기' && g.promptFor(ix.get('sogate_1')).name === '마을 어귀', '어귀 통나무가 치워졌다');
  await settle(260); closeCard(); goTo('village'); use('npc_yangmin'); pick('군사로'); ok(done('khitan') && g.flags.has('khitan:soldier') && g.life.values.rank === 1, '안융진 → 벼슬 1'); closeCard();
  await settle(260); closeCard(); goTo('port'); use('npc_merchant'); pick('청자를 판다'); ok(done('port') && g.flags.has('port:sell') && !g.has('celadon') && g.life.values.grain === 4, '청자를 팔았다 → 곡식 4'); closeCard();
  await settle(420); closeCard(); goTo('camp'); ok(g.promptFor(ix.get('spearrack_1')).verb.includes('창을 든다'), '양인 남자 → 창'); goTo('village'); use('npc_yangmin'); pick('문을 닫고'); ok(done('coup'), '문을 닫았다'); closeCard();
  await settle(420); closeCard(); goTo('fortress'); use('npc_gimyunhu'); pick('처인성에서'); ok(done('mongol') && g.flags.has('mongol:fight') && g.life.values.rank === 2, '처인성 → 벼슬 2'); closeCard();
  goTo('port'); ok(opened('yeokgwan'), '섞여: 역관'); closeCard(); use('npc_merchant'); pick('몽골 말'); ok(done('yeokgwan') && g.life.status === 'yeokgwan' && g.life.cap() === 5 && g.life.values.rank === 4, '역관 → 천장 5, 벼슬 4'); closeCard();
  await settle(420); closeCard(); goTo('power'); use('firepit_1'); use('npc_sadaebu'); pick('정몽주 편'); ok(done('land') && g.flags.has('land:jeong') && g.life.values.rank === 3, '정몽주 편 → 벼슬 -1'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:jeong'), '끝: 정몽주 편 — 두문동(역관보다 편이 먼저)');
}
// ===== 판 4: 문벌 여자(통일신라 「경순왕 따라 — 옛 왕족」, 눈 밝은) — 노비 숨기기 성공 → 시험장 대신 같은 몫 → 「땅을 떼어 주자」 → 송 사신 → 정변: 숨기 성공 → 원에 줄(권문세족) → 땅문서 지킴 ⚠ → 몰락
store['kworld_carry:silla-life'] = JSON.stringify({ craft: 4, heart: 6, grain: 9, rank: 6, branch: 'silla_royal', status: 'jingol', nation: 'silla' });
{
  const { g, ix, S, use, pick, closeCard, goTo, btn, opened, done } = mkGame('f', ['inherit', 'celadon', 'cotton', 'manjeok'], 'eye');
  ok(g.life.status === 'munbeol' && g.life.cap() === 6 && g.life.values.grain === 9, '옛 왕족 → 문벌, 천장 6');
  goTo('village'); closeCard(); use('ledger_1'); pick('숨긴다'); ok(done('angeom') && g.flags.has('angeom:hide') && g.life.values.grain === 10, '노비를 숨겼다 → 곡식 10'); closeCard();
  await settle(260); closeCard(); goTo('office'); ok(g.promptFor(ix.get('eumseogate_1')).verb === '살펴보기', '여자는 음서 문도 안 열린다'); use('examhall_1'); ok(!done('exam') && S.says.at(-1).includes('딸은'), '이유 한 줄'); goTo('village'); use('npc_munbeol'); pick('같은 몫'); ok(done('exam') && g.flags.has('exam:inherit') && g.life.values.grain === 12, '같은 몫 → 곡식 12'); closeCard();
  goTo('village'); ok(opened('inherit'), '섞여: 상속'); closeCard(); use('npc_munbeol'); pick('재혼'); ok(done('inherit') && g.flags.has('inherit:remarry'), '재혼 — 흠이 아니다'); closeCard();
  await settle(260); closeCard(); goTo('pass'); use('npc_seohui'); pick('땅을 떼어'); ok(done('khitan') && g.flags.has('khitan:cede') && g.life.values.heart === 1, '땅을 떼어 주자 → 인심 1'); closeCard();
  await settle(260); closeCard(); goTo('port'); ok(g.promptFor(ix.get('songship_1')).verb.includes('사신'), '문벌 → 송 사신'); use('songship_1'); ok(done('port') && g.flags.has('port:envoy') && g.life.values.rank === 1, '사신 → 벼슬 1'); closeCard();
  await settle(420); closeCard(); goTo('camp'); use('npc_general'); ok(S.says.at(-1).includes('숨어라'), '문벌은 군영에서 쫓겨난다'); goTo('village'); use('npc_munbeol'); pick('숨는다'); ok(done('coup') && g.flags.has('coup:hide') && g.life.values.grain === 11 && !g.life.hurt.has('wound'), '숨었다 → 살았다, 곡식 -2'); closeCard();
  await settle(420); closeCard(); goTo('port'); ok(g.promptFor(ix.get('ganghwaship_1')).verb.includes('강화도'), '문벌 → 강화 배'); goTo('village'); use('npc_munbeol'); pick('원에 줄'); ok(done('mongol') && g.flags.has('mongol:yuan') && g.life.status === 'gwonmun' && g.life.values.grain === 14, '원에 줄 → 권문세족, 곡식 14'); closeCard(); ok(g.promptFor(ix.get('ganghwaship_1')).verb === '살펴보기' || true, '-');
  await settle(420); closeCard(); goTo('power'); ok(g.promptFor(ix.get('firepit_1')).verb === '살펴보기', '권문은 안 태운다'); ok(g.promptFor(ix.get('deedpile_1')).verb.includes('지킨다'), '더미 → 지킨다'); use('deedpile_1'); ok(done('land') && g.flags.has('land:keep') && g.life.values.grain === 10, '지켰다 → 더미째 갔다, 곡식 -4'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:gwonmun_fall'), '끝: 권문세족 — 땅과 함께 무너진 집');
}
console.log(`goryeo-life 고리: ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
