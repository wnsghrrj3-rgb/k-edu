// 고려 인생 층 고리 시험 2 — 10-10 넓히기: 새 장소 일곱(부곡 마을·시전 거리·역참·화통도감·산속 암자·팔관회 터·불탄 포구)의 상황 일곱을 강제로 켜서 다섯 판(향리 남 / 솔거 여 / 부곡 남 / 권문세족 여 / 양민 남 실패 길). 신분·성별 회색·화포 보임·윤등 보임·새 지붕 보임·노비 → 스님·부곡 → 문서 밖·공녀 수레·실패 흔적을 본다.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:silla-life': JSON.stringify({ craft: 6, heart: 4, grain: 4, rank: 2, branch: 'surname', status: 'low', nation: 'silla' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['munbeolgate_1', 'slavehut_1', 'oegeohut_1', 'ledger_1', 'well_1', 'stone_1', 'stone_2', 'stone_3', 'examhall_1', 'eumseogate_1', 'bigpaddy_1', 'smallpaddy_1', 'cottonfield_1', 'kiln_1', 'celadon_1', 'sogate_1', 'pagoda_1', 'woodblock_1', 'offering_1', 'fortgate_1', 'wall_1', 'drum_1', 'fortgranary_1', 'spearrack_1', 'wardrum_1', 'songship_1', 'ganghwaship_1', 'tradepile_1', 'arabstall_1', 'fish_1', 'meetrock_1', 'hollow_1', 'log_1', 'pass_1', 'talkmat_1', 'mongolcamp_1', 'pgranary_1', 'deedpile_1', 'firepit_1', 'powergate_1',
  'taxpile_1', 'bugoksign_1', 'silverstall_1', 'coinstall_1', 'clothstall_1', 'posthorse_1', 'dispatch_1', 'cart_1', 'saltpeterkiln_1', 'powdermix_1', 'cannon_1', 'moktak_1', 'hermitspring_1', 'bundle_1', 'chaebung_1', 'lanterns_1', 'tributestall_1', 'rebuild_1', 'burntboat_1',
  'npc_munbeol', 'npc_hyangni', 'npc_yangmin', 'npc_solgeo', 'npc_oegeo', 'npc_examiner', 'npc_sadaebu', 'npc_soin', 'npc_overseer', 'npc_monk', 'npc_carver', 'npc_gimyunhu', 'npc_general', 'npc_merchant', 'npc_arab', 'npc_manjeok', 'npc_seohui', 'npc_gwonmun', 'npc_bugokin', 'npc_sijeon', 'npc_palgwan', 'npc_sindon', 'npc_yeokjol', 'npc_choemuseon', 'npc_fisher'];
const AREAS = { village: [0, 0], office: [36, 32], paddy: [-40, -30], so: [-84, -62], temple: [-58, 38], fortress: [0, 52], camp: [48, -4], port: [18, -60], ford: [56, -67], hill: [70, -104], woods: [-84, 78], pass: [2, 106], power: [66, -28], bugok: [-28, 56], market: [30, 34], station: [30, -68], gunpowder: [96, 48], hermit: [-102, -16], palgwan: [-30, -72], burnt: [-60, 62] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { if (name === 'cannon_1') fn({ isMesh: true, material: { name: 'cannon_bronze' }, set visible(v) { shown.cannon = v; } }); if (name === 'lanterns_1') fn({ isMesh: true, material: { name: 'lantern_fire' }, set visible(v) { shown.lantern = v; } }); if (name === 'rebuild_1') fn({ isMesh: true, material: { name: 'new_thatch' }, set visible(v) { shown.thatch = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
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
const MIX = ['bugok', 'market', 'palgwan', 'hermit', 'station', 'gunpowder', 'burnt'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };   // 뒤에 줄 선 카드(꼭 나오는 상황)를 비우고 then 이 돌 틈을 준다

// ===== 판 1: 향리 남자(손 좋은, 솜씨 6→3) — 덜 걷기 · 해동통보 · 고을 공물 · 책 보따리 · 명단에서 한 이름 빼기 · 염초 → 화포 보임 · 품앗이 → 새 지붕 보임
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'hand');
  ok(g.life.situations.length === 14 && Object.keys(g.world.areas).length === 20, '꼭 7 + 새 7 · 구역 20'); ok(g.life.status === 'hyangni' && g.life.values.craft >= 3, '향리·솜씨 셋');
  goTo('bugok'); ok(!opened('bugok'), '노비안검 전엔 부곡 안 열림');
  on('sit:angeom:done'); goTo('bugok'); ok(opened('bugok'), '부곡'); closeCard(); ok(verb(g, 'taxpile_1') === '살펴보기', '향리는 두 배를 안 낸다'); useR('npc_bugokin', '덜 걷는다'); ok(!btn('덜 걷는다')?.disabled && !btn('더 걷는다')?.disabled && btn('두 배를')?.disabled && btn('밤에 목패')?.disabled && btn('주인 몫')?.disabled, '향리: 걷기 열림·두 배·목패·주인 몫 회색'); const h0 = g.life.values.heart; pick('덜 걷는다'); closeCard(); ok(done('bugok') && g.flags.has('bg:less') && g.life.values.heart === h0 + 2, '덜 걷기 → 🤝+2');
  on('sit:khitan:done'); goTo('palgwan'); ok(opened('palgwan'), '팔관회'); closeCard(); ok(shown.lantern === false, '윤등은 처음엔 꺼짐'); ok(verb(g, 'chaebung_1') === '살펴보기' && verb(g, 'lanterns_1') === '살펴보기', '향리는 채붕·윤등 손 안 댐'); useR('npc_palgwan', '고을 공물'); ok(!btn('고을 공물')?.disabled && btn('왕 곁')?.disabled && btn('채붕을')?.disabled && btn('향연 음식')?.disabled && !btn('송 상인과')?.disabled, '향리: 공물 열림·왕 곁·채붕·음식 회색·흥정 열림'); pick('고을 공물'); closeCard(); ok(done('palgwan') && g.flags.has('pg:tribute'), '고을 공물');
  on('sit:port:done'); goTo('market'); ok(opened('market'), '시전'); closeCard(); useR('npc_sijeon', '시전에'); ok(btn('시전에')?.disabled && btn('베를')?.disabled && btn('은병 하나')?.disabled && !btn('해동통보')?.disabled, '향리 남자: 자리·베·빌리기 회색·동전 열림'); pick('해동통보'); closeCard(); ok(done('market') && g.flags.has('mk:coin'), '해동통보로 사 봤다 — 안 받는다');
  on('sit:coup:done'); goTo('hermit'); ok(opened('hermit'), '암자'); closeCard(); ok(verb(g, 'bundle_1').includes('푼다'), '향리: 책 보따리 열림'); useR('bundle_1', '보따리'); closeCard(); ok(done('hermit') && g.flags.has('hm:read'), '책을 읽었다');
  on('sit:mongol:done'); goTo('station'); ok(opened('station'), '역참'); closeCard(); ok(verb(g, 'dispatch_1').includes('명단') && verb(g, 'cart_1') === '살펴보기', '향리: 명단 고치기 열림·수레는 남자라 못 탐'); const h1 = g.life.values.heart; useR('dispatch_1', '명단'); closeCard(); ok(done('station') && g.flags.has('st:erase') && g.life.values.heart === h1 + 3, '한 이름 뺌 → 🤝+3');
  goTo('gunpowder'); ok(opened('gunpowder'), '화통도감'); closeCard(); ok(shown.cannon === false, '화포는 처음엔 숨김'); ok(verb(g, 'saltpeterkiln_1').includes('염초'), '솜씨 셋 → 염초'); const r0 = g.life.values.rank; useR('saltpeterkiln_1', '염초'); closeCard(); await drain(closeCard, goTo, 'gunpowder'); ok(done('gunpowder') && g.flags.has('gp:make') && shown.cannon === true && g.life.values.rank === Math.min(r0 + 1, 4), '염초 → 화포 보임 · 🎖+1(천장 4)');
  goTo('burnt'); ok(opened('burnt'), '불탄 포구'); closeCard(); ok(shown.thatch === false, '새 지붕 숨김'); ok(verb(g, 'rebuild_1') === '살펴보기', '향리는 제 손으로 안 세움'); useR('npc_fisher', '고을 사람'); ok(!btn('고을 사람')?.disabled && btn('내 손으로')?.disabled && btn('노비를')?.disabled && btn('수군')?.disabled, '향리: 품앗이 열림·나머지 회색'); pick('고을 사람'); closeCard(); await drain(closeCard, goTo, 'burnt'); ok(done('burnt') && g.flags.has('bt:gather') && shown.thatch === true, '품앗이 → 새 지붕 보임');
  ok(['bugok', 'sijeon', 'palgwan', 'hermit', 'gongnyeo', 'hwatong', 'waegu'].every((k) => g.world.journal[k]?.note), '새 기록 일곱');
}
// ===== 판 2: 솔거 노비 여자(발 빠른) — 주인 몫 · 심부름 · 윤등 켜기(불 보임) · 머리를 깎는다 → 스님(신분 밖·free) · 스님이 된 뒤 수레에 탄다(공녀) · 숯 빻기 · 본다
{
  store['kworld_carry:silla-life'] = JSON.stringify({ craft: 1, heart: 0, grain: 0, branch: 'slave', status: 'slave', nation: 'silla' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'foot');
  ok(g.life.status === 'solgeo', '솔거 노비');
  on('sit:angeom:done'); goTo('bugok'); closeCard(); useR('npc_bugokin', '주인 몫'); ok(!btn('주인 몫')?.disabled && btn('두 배를')?.disabled && btn('덜 걷는다')?.disabled, '노비: 주인 몫 열림·두 배·걷기 회색'); pick('주인 몫'); closeCard(); ok(done('bugok') && g.flags.has('bg:carry'), '주인 몫을 날랐다');
  on('sit:khitan:done'); goTo('palgwan'); closeCard(); ok(verb(g, 'lanterns_1').includes('등불'), '노비: 윤등 켜기 열림'); useR('lanterns_1', '등불'); closeCard(); ok(done('palgwan') && g.flags.has('pg:lantern') && shown.lantern === true, '윤등 → 불 보임');
  on('sit:port:done'); goTo('market'); closeCard(); ok(verb(g, 'coinstall_1') === '살펴보기', '노비는 돈을 못 쥔다'); useR('npc_sijeon', '심부름'); ok(!btn('심부름')?.disabled && btn('베를')?.disabled && btn('해동통보')?.disabled, '노비 여자: 심부름 열림·베·동전 회색'); pick('심부름'); closeCard(); ok(done('market') && g.flags.has('mk:errand'), '심부름');
  on('sit:coup:done'); goTo('hermit'); closeCard(); ok(verb(g, 'bundle_1') === '살펴보기', '노비는 책 보따리 안 품'); useR('npc_sindon', '머리를'); ok(!btn('머리를')?.disabled && !btn('사정을')?.disabled && btn('책 보따리')?.disabled && btn('스님을 헐뜯는')?.disabled, '노비: 깎기·사정 열림·책·헐뜯기 회색'); pick('머리를'); closeCard(); ok(done('hermit') && g.flags.has('hm:shave') && g.life.status === 'monk' && g.flags.has('free:now') && g.life.cap() == null, '머리를 깎았다 → 스님(신분 밖, 천장 없음)');
  on('sit:mongol:done'); goTo('station'); closeCard(); ok(verb(g, 'cart_1').includes('수레에'), '작은 집 여자: 수레 열림'); useR('cart_1', '수레에'); closeCard(); ok(done('station') && g.flags.has('st:go'), '수레에 탔다 — 원으로');
  goTo('gunpowder'); closeCard(); ok(verb(g, 'saltpeterkiln_1') === '살펴보기', '솜씨 하나는 염초 못 굽는다'); useR('npc_choemuseon', '숯을 빻는다'); ok(!btn('숯을 빻는다')?.disabled && btn('진포로')?.disabled && btn('염초를')?.disabled, '여자: 숯 빻기 열림·진포·염초 회색'); pick('숯을 빻는다'); closeCard(); ok(done('gunpowder') && g.flags.has('gp:char'), '숯을 빻았다');
  goTo('burnt'); closeCard(); useR('npc_fisher', '본다'); ok(btn('내 손으로')?.disabled && btn('주인 집 먼저')?.disabled, '스님: 제 손·주인 집 회색'); pick('본다'); closeCard(); ok(done('burnt') && g.flags.has('bt:watch'), '봤다');
}
// ===== 판 3: 부곡 남자(잘 버티는) — 밤에 목패를 넘는다 → 문서 밖(drifter) · 떠돌이로 채붕 세우기 · 해동통보 · 암자는 본다 · 역말 끌기 · 흙 긁기 · 내 손으로 세우기(새 지붕 보임)
{
  store['kworld_carry:silla-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 1, branch: 'rebel', status: 'farmer', nation: 'silla' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'bugok', '부곡');
  on('sit:angeom:done'); goTo('bugok'); closeCard(); ok(verb(g, 'taxpile_1').includes('두 배'), '부곡: 두 배 내기 열림'); useR('npc_bugokin', '밤에 목패'); ok(!btn('밤에 목패')?.disabled && !btn('두 배를')?.disabled && !btn('향리에게')?.disabled && btn('덜 걷는다')?.disabled, '부곡: 목패·두 배·묻기 열림·걷기 회색'); pick('밤에 목패'); closeCard(); ok(done('bugok') && g.flags.has('bg:flee') && g.life.status === 'drifter', '목패를 넘었다 → 문서 밖');
  on('sit:khitan:done'); goTo('palgwan'); closeCard(); ok(verb(g, 'chaebung_1').includes('채붕'), '떠돌이: 채붕 세우기 열림'); useR('chaebung_1', '채붕'); closeCard(); ok(done('palgwan') && g.flags.has('pg:build'), '채붕을 세웠다');
  on('sit:port:done'); goTo('market'); closeCard(); useR('npc_sijeon', '은병 하나'); ok(btn('은병 하나')?.disabled && !btn('해동통보')?.disabled, '떠돌이: 빌리기 회색(이름이 없다)·동전 열림'); pick('해동통보'); closeCard(); ok(done('market') && g.flags.has('mk:coin'), '동전');
  on('sit:coup:done'); goTo('hermit'); closeCard(); useR('npc_sindon', '본다'); ok(btn('사정을')?.disabled && btn('머리를')?.disabled, '떠돌이: 사정·깎기 회색'); pick('본다'); closeCard(); ok(done('hermit') && g.flags.has('hm:watch'), '봤다');
  on('sit:mongol:done'); goTo('station'); closeCard(); ok(verb(g, 'posthorse_1').includes('역말') && verb(g, 'dispatch_1') === '살펴보기', '남자: 역말 끌기 열림·명단은 향리만'); useR('posthorse_1', '역말'); closeCard(); ok(done('station') && g.flags.has('st:lead'), '역말을 끌었다');
  goTo('gunpowder'); closeCard(); useR('npc_choemuseon', '흙을'); ok(!btn('흙을')?.disabled && !btn('진포로')?.disabled && btn('화통도감을')?.disabled, '떠돌이 남자: 흙·진포 열림·도감 회색'); pick('흙을'); closeCard(); ok(done('gunpowder') && g.flags.has('gp:dig'), '흙을 긁었다');
  goTo('burnt'); closeCard(); ok(verb(g, 'rebuild_1').includes('세운다'), '떠돌이: 제 손으로 세우기 열림'); useR('rebuild_1', '내 손으로'); closeCard(); await drain(closeCard, goTo, 'burnt'); ok(done('burnt') && g.flags.has('bt:rebuild') && shown.thatch === true, '내 손으로 → 새 지붕 보임');
}
// ===== 판 4: 권문세족 여자(눈 밝은, 곡식 4) — 더 걷기 · 왕 곁 · 시전 자리 · 스님을 헐뜯는 글 · 패자 · 숯 빻기(도감은 회색) · 노비 보내 세우기(새 지붕)
{
  store['kworld_carry:silla-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 4, branch: 'surname', status: 'hojok', nation: 'silla' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'eye');
  ok(g.life.status === 'munbeol', '문벌'); g.life.setStatusTo('gwonmun'); ok(g.life.status === 'gwonmun', '→ 권문세족');
  on('sit:angeom:done'); goTo('bugok'); closeCard(); useR('npc_bugokin', '더 걷는다'); ok(!btn('더 걷는다')?.disabled, '권문: 더 걷기 열림'); const g0 = g.life.values.grain; pick('더 걷는다'); closeCard(); ok(done('bugok') && g.flags.has('bg:more') && g.life.values.grain === g0 + 2, '더 걷기 → 🌾+2');
  on('sit:khitan:done'); goTo('palgwan'); closeCard(); useR('npc_palgwan', '왕 곁'); ok(!btn('왕 곁')?.disabled && !btn('향연 음식')?.disabled && btn('고을 공물')?.disabled, '권문 여자: 왕 곁·음식 열림·공물 회색'); const r0 = g.life.values.rank; pick('왕 곁'); closeCard(); ok(done('palgwan') && g.flags.has('pg:seat') && g.life.values.rank === r0 + 1, '왕 곁 → 🎖+1');
  on('sit:port:done'); goTo('market'); closeCard(); useR('npc_sijeon', '시전에'); ok(!btn('시전에')?.disabled && !btn('베를')?.disabled && btn('은병 하나')?.disabled, '권문 여자: 자리·베 열림·빌리기 회색'); pick('시전에'); closeCard(); ok(done('market') && g.flags.has('mk:open'), '시전에 자리를 냈다');
  on('sit:coup:done'); goTo('hermit'); closeCard(); useR('npc_sindon', '스님을 헐뜯는'); ok(!btn('스님을 헐뜯는')?.disabled && btn('사정을')?.disabled && btn('시주')?.disabled, '권문: 헐뜯기 열림·사정·시주 회색'); const h0 = g.life.values.heart; pick('스님을 헐뜯는'); closeCard(); ok(done('hermit') && g.flags.has('hm:slander') && g.life.values.heart === Math.max(0, h0 - 3), '헐뜯었다 → 🤝-3(바닥 0)');
  on('sit:mongol:done'); goTo('station'); closeCard(); ok(verb(g, 'cart_1') === '살펴보기', '권문 여자는 수레에 안 탄다(숨긴다)'); useR('npc_yeokjol', '원 사신에게'); ok(!btn('원 사신에게')?.disabled && !btn('딸을 절에')?.disabled && btn('수레에')?.disabled && btn('명단에서')?.disabled, '권문: 패자·절 열림·수레·명단 회색'); pick('원 사신에게'); closeCard(); ok(done('station') && g.flags.has('st:paiza'), '패자를 받았다');
  goTo('gunpowder'); closeCard(); useR('npc_choemuseon', '숯을 빻는다'); ok(btn('화통도감을')?.disabled && !btn('숯을 빻는다')?.disabled, '권문: 도감 회색(원에 줄 댄 집)·숯 열림'); pick('숯을 빻는다'); closeCard(); ok(done('gunpowder'), '숯');
  goTo('burnt'); closeCard(); useR('npc_fisher', '노비를'); ok(!btn('노비를')?.disabled && btn('고을 사람')?.disabled, '권문: 노비 보내기 열림·품앗이 회색'); pick('노비를'); closeCard(); await drain(closeCard, goTo, 'burnt'); ok(done('burnt') && g.flags.has('bt:send') && shown.thatch === true, '노비를 보내 세웠다 → 새 지붕');
}
// ===== 판 5: 양민 남자 — 실패 길: 진포에서 불이 되돌아옴 → 「창이 지나간 몸」 · 은병 빌리기 · 시주 · 그 뒤 진포는 회색(다친 몸)
{
  store['kworld_carry:silla-life'] = JSON.stringify({ craft: 2, heart: 2, grain: 3, branch: 'noname', status: 'farmer', nation: 'silla' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'yangmin', '양민');
  on('sit:angeom:done', 'sit:khitan:done', 'sit:port:done', 'sit:coup:done', 'sit:mongol:done');
  goTo('market'); closeCard(); useR('npc_sijeon', '은병 하나'); ok(!btn('은병 하나')?.disabled, '양민: 빌리기 열림'); const g0 = g.life.values.grain; pick('은병 하나'); closeCard(); ok(done('market') && g.flags.has('mk:borrow') && g.life.values.grain === g0 + 3, '은병 빌림 → 🌾+3');
  goTo('hermit'); closeCard(); useR('npc_sindon', '시주'); ok(!btn('시주')?.disabled && btn('사정을')?.disabled, '양민: 시주 열림·사정 회색'); pick('시주'); closeCard(); ok(done('hermit') && g.flags.has('hm:rice'), '시주');
  Math.random = () => 0.99; g.life.tries = {};
  goTo('gunpowder'); closeCard(); useR('npc_choemuseon', '진포로'); ok(!btn('진포로')?.disabled, '양민 남자: 진포 열림'); pick('진포로'); closeCard(); ok(done('gunpowder') && g.flags.has('gp:jinpofail') && g.flags.has('hurt:wound'), '불이 되돌아왔다 → 창이 지나간 몸');
  Math.random = () => 0.01;
  goTo('burnt'); closeCard(); ok(verb(g, 'rebuild_1').includes('세운다'), '양민: 제 손으로 세우기'); useR('rebuild_1', '내 손으로'); closeCard(); ok(done('burnt') && g.flags.has('bt:rebuild'), '세웠다');
}
console.log(`goryeo life 고리 2(새 장소 7): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
