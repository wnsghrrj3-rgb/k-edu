// 조선 후기 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(서원·유기점·조창) 상황을 강제로 켜서 일곱 판(양반 남 / 상민 여 / 중인 남 / 솔거 남 / 장인 남 / 서얼·도고 / 실패 굴림). 신분·성별·솜씨·곡식 회색 · 숨김 재질 보임(사액 현판·금 글씨·놋그릇·쌀가마 곳간·배) · 값 변화 · 실패 깃발. 데이터 전수(섞여 23·q·사실·done 세우는 곳).
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
  'npc_jwasu','npc_nanjeon','npc_gwangdae','npc_gasam','npc_munjeong','npc_gyou','npc_hwajeonmin',
  'saaek_1','mukpae_1','seowonland_1','brassforge_1','brassware_1','wagebook_1','jochang_1','tollbook_1','joseonship_1','npc_yusaeng','npc_yugijang','npc_changri'];
// 엔진 좌표(x, z = -블렌더 y)
const AREAS = { eogwi: [0, 40], outroad: [0, 58], jangteo: [0, 6], jumak: [-13.5, 5], well: [6.5, 2.5], yangban: [0, -22], haengrang: [-9.5, -23.5], sarang: [-7, -27], anchae: [1, -37.5], gwana: [-27, 5], dongheon: [-30, -8.5], choga: [28, 7], field: [27, 30], seodang: [-31, 29.5], naru: [9, 93], deul: [66, 9], oettan: [72, 79], gogae: [-100, 70], sanjung: [-80, -84],
  hyangcheong: [32, -28], nanjeon: [-14.5, 24.2], nori: [-24, 55], crops: [27, 59], isyang: [-50, 94.5], gyouchon: [34, -90], hwajeon: [76, -58], seowon: [-42, 48], yugi: [92, 58], jochang: [42, 90] };
const mkGame = (sex, mixed, char = 'hand') => {
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
const settle = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const MIX = ['seowon', 'yugi', 'jochang'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };
const ALL = ['sit:monaegi:done', 'sit:jangsi:done', 'sit:gongmyeong:done', 'sit:silhak:done', 'sit:year1801:done', 'sit:samjeong:done'];
const endOf = (g) => g.life.d.situations.find((s) => s.id === 'uprising').choices[0].then[0].end;
const carry = (key) => JSON.parse(store['kworld_carry:joseon-late-life'] || '{}')[key];

// ===== 데이터 전수: 섞여 23 · 새 상황 셋에 q 셋·📜 사실(선택지마다 「그래서」 인과·연도 없음, 109)·기록 · done 깃발을 세우는 곳 · 회색 수
{
  const life = J('life'), items = J('items'), npcs = J('npcs'), world = J('world');
  const mixed = life.situations.filter((s) => !s.must); ok(mixed.length === 23 && life.mixedCount === 6, '섞여 23 · mixedCount 6');
  const blob = JSON.stringify(items) + JSON.stringify(npcs);
  for (const id of MIX) { const s = life.situations.find((x) => x.id === id); ok(!!s && s.q.a.length === 3 && s.q.revisit && world.journal[id]?.note && s.choices.every((c) => c.fact && c.fact.includes('그래서') && !/\d{3,4}년/.test(c.fact) && c.journal === id), `상황 ${id} q·사실·기록`); for (const c of s.choices) ok(blob.includes(`"${c.done}"`), `${id}.${c.id} done 세우는 곳`); }
  const gray = (id) => npcs[id].lines[0].choices.filter((c) => c.if).length; ok(gray('yusaeng') === 8 && gray('yugijang') === 6 && gray('changri') === 8, '회색 조건 8·6·8');
  ok(['seowon', 'yugi', 'jochang'].every((a) => world.areas[a]) && world.danger.safe.some(([x, z]) => x === -42 && z === 48) && world.scenery.grass.avoid.some(([x, z]) => x === 28 && z === 90), '구역·밤 안전·풀 피하기');
}
// ===== 판 1: 양반 남자(눈 밝은, 곡식 6) — 실학 전엔 서원 안 열림 → 사액 글 ⚠ → 현판·금 글씨 보임 🎖+1 🤝+1 · 제기 시키기 → 놋그릇 보임 🌾-2 · 「면세」 ⚠ 🌾+1 🤝-2 — 묵패·품삯·쌀 지기 회색
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('yangban'); ok(g.life.status === 'yangban' && g.life.values.grain >= 6, '양반·곡식 여섯');
  ok(g.life.situations.length === 10 && Object.keys(g.world.areas).length === 29, '꼭 7 + 새 3 · 구역 29');
  goTo('seowon'); ok(!opened('seowon'), '실학 전엔 서원 안 열림');
  on(...ALL); goTo('seowon'); ok(opened('seowon'), '서원'); closeCard(); ok(shown.board === false && shown.gold === false, '현판은 처음엔 숨김');
  ok(verb(g, 'saaek_1').includes('글을 올린다') && verb(g, 'mukpae_1') === '살펴보기', '양반: 현판 자리 열림 · 묵패는 살펴보기만');
  useR('npc_yusaeng', '유생으로'); ok(!btn('유생으로')?.disabled && !btn('사액을')?.disabled && !btn('땅을')?.disabled && btn('묵패를 받았다 — 낸다')?.disabled && btn('서원 노비')?.disabled && btn('문 밖에서')?.disabled && btn('제사 음식')?.disabled, '양반 남자: 유생·사액·땅 열림 · 묵패·노비·문 밖·음식 회색'); S.panel = null;
  const r0 = g.life.values.rank, h0 = g.life.values.heart; useR('saaek_1', '사액을'); closeCard(); await drain(closeCard, goTo, 'seowon'); ok(done('seowon') && g.flags.has('sw:saaek') && shown.board === true && shown.gold === true && g.life.values.rank === r0 + 1 && g.life.values.heart === h0 + 1, '사액 → 현판·금 글씨 보임 · 🎖+1 🤝+1');
  ok(verb(g, 'saaek_1') === '살펴보기' && g.promptFor(g.e.interactables.get('saaek_1')).name.includes('걸렸다'), '끝난 뒤 「현판 — 걸렸다」');
  goTo('yugi'); ok(opened('yugi'), '유기점'); closeCard(); ok(shown.brass === false && verb(g, 'brassware_1').includes('망치를 든다') && verb(g, 'brassforge_1') === '살펴보기', '놋그릇 숨김 · 양반: 두드리는 상 열림(제기) · 화덕은 살펴보기');
  useR('npc_yugijang', '제기 한 벌'); ok(!btn('제기 한 벌')?.disabled && !btn('몽땅')?.disabled && btn('놋쇠를 치고')?.disabled && btn('품삯')?.disabled && btn('그릇 닦는')?.disabled && btn('풀무 가죽')?.disabled, '양반 곡식 6: 제기·몽땅(곡식 넷) 열림 · 치기·품삯·닦기·가죽 회색'); const g0 = g.life.values.grain; pick('제기 한 벌'); closeCard(); await drain(closeCard, goTo, 'yugi'); ok(done('yugi') && g.flags.has('yg:order') && shown.brass === true && g.life.values.grain === g0 - 2, '제기 → 놋그릇 보임 · 🌾-2');
  goTo('jochang'); ok(opened('jochang'), '조창'); closeCard(); ok(shown.sack === false && verb(g, 'tollbook_1').includes('되를 든다') && verb(g, 'joseonship_1') === '살펴보기', '쌀가마 숨김 · 양반: 되질 자리 열림(면세) · 배는 살펴보기');
  useR('npc_changri', '「면세'); ok(!btn('「면세')?.disabled && !btn('쌀로 낸다')?.disabled && btn('주인 논')?.disabled && btn('장부를')?.disabled && btn('되를 속인다')?.disabled && btn('조운선')?.disabled && btn('쌀을 빼돌린다')?.disabled && btn('되질 품')?.disabled, '양반: 면세·쌀 내기 열림 · 나머지 회색'); const g1 = g.life.values.grain, h1 = g.life.values.heart; pick('「면세'); closeCard(); ok(done('jochang') && g.flags.has('jc:exempt') && g.life.values.grain === g1 + 1 && g.life.values.heart === Math.max(0, h1 - 2) && shown.sack === false, '면세 → 🌾+1 🤝-2 · 곳간은 비어 있음');
  g.life.end(endOf(g)); ok(g.flags.has('life:end') && carry('status') === 'yangban', '끝 카드 · 양반 넘김');
  ok(['seowon', 'yugi', 'jochang'].every((k) => g.world.journal[k]?.note), '새 기록 셋');
}
// ===== 판 2: 상민 여자(손 좋은, 곡식 2) — 제사 음식 🤝+1 · 닦는 삯일 🌾+1 · 되질 품 🌾+1 — 유생·사공·묵패(여자도 상민이라 열림) 확인
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 3, heart: 3, grain: 2, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'hand');
  ok(g.life.status === 'sangmin', '상민'); on(...ALL);
  goTo('seowon'); closeCard(); ok(verb(g, 'saaek_1') === '살펴보기' && verb(g, 'mukpae_1').includes('패를 든다'), '상민 여자: 현판 못 만짐 · 묵패 자리 열림'); useR('npc_yusaeng', '제사 음식'); ok(!btn('제사 음식')?.disabled && !btn('묵패를 받았다 — 낸다')?.disabled && btn('유생으로')?.disabled && btn('사액을')?.disabled && btn('땅을')?.disabled && btn('서원 노비')?.disabled && btn('문 밖에서')?.disabled, '상민 여자: 음식·묵패 열림 · 유생·사액·땅·노비·서얼 회색'); const h0 = g.life.values.heart; pick('제사 음식'); closeCard(); ok(done('seowon') && g.flags.has('sw:food') && g.life.values.heart === h0 + 1, '제사 음식 → 🤝+1');
  goTo('yugi'); closeCard(); ok(verb(g, 'brassware_1').includes('망치를 든다') && verb(g, 'wagebook_1') === '살펴보기', '여자: 두드리는 상 열림(닦기) · 장부는 살펴보기(곡식 넷 미만)'); useR('npc_yugijang', '그릇 닦는'); ok(!btn('그릇 닦는')?.disabled && !btn('품삯')?.disabled && btn('놋쇠를 치고')?.disabled && btn('제기 한 벌')?.disabled && btn('몽땅')?.disabled && btn('풀무 가죽')?.disabled, '상민 여자 솜씨 1: 닦기·품삯 열림 · 치기·제기·몽땅·가죽 회색'); const g0 = g.life.values.grain; pick('그릇 닦는'); closeCard(); ok(done('yugi') && g.flags.has('yg:polish') && g.life.values.grain === g0 + 1 && shown.brass === false, '닦기 → 🌾+1 · 놋그릇은 안 보임');
  goTo('jochang'); closeCard(); ok(verb(g, 'joseonship_1') === '살펴보기', '여자: 배는 살펴보기'); useR('npc_changri', '되질 품'); ok(!btn('되질 품')?.disabled && !btn('쌀로 낸다')?.disabled && btn('조운선')?.disabled && btn('쌀을 빼돌린다')?.disabled && btn('장부를')?.disabled && btn('「면세')?.disabled, '상민 여자: 되질 품·쌀 내기 열림 · 사공·빼돌리기·장부·면세 회색'); const g1 = g.life.values.grain; pick('되질 품'); closeCard(); ok(done('jochang') && g.flags.has('jc:measure') && g.life.values.grain === g1 + 1, '되질 품 → 🌾+1');
}
// ===== 판 3: 중인 남자(눈 밝은, 곡식 3) — 서원 「본다」 · 유기점 제기 시키기 · 조창 장부 🎖+1 → 끝난 뒤 되 속임 안 뜸
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 3, rank: 1, branch: 'jungin', status: 'jungin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'jungin', '중인'); on(...ALL);
  goTo('seowon'); closeCard(); ok(verb(g, 'saaek_1') === '살펴보기' && verb(g, 'mukpae_1') === '살펴보기' && verb(g, 'seowonland_1') === '살펴보기', '중인: 서원 세 자리 전부 살펴보기만'); useR('npc_yusaeng', '본다'); ok(btn('유생으로')?.disabled && btn('묵패를 받았다 — 낸다')?.disabled && btn('땅을')?.disabled, '중인: 유생·묵패·땅 회색'); pick('본다'); closeCard(); ok(done('seowon') && g.flags.has('sw:watch'), '봤다');
  goTo('yugi'); closeCard(); useR('npc_yugijang', '제기 한 벌'); ok(!btn('제기 한 벌')?.disabled && btn('품삯')?.disabled && btn('놋쇠를 치고')?.disabled, '중인 곡식 3: 제기 열림 · 품삯·치기 회색'); pick('제기 한 벌'); closeCard(); await drain(closeCard, goTo, 'yugi'); ok(done('yugi') && g.flags.has('yg:order') && shown.brass === true, '제기 → 놋그릇 보임');
  goTo('jochang'); closeCard(); ok(verb(g, 'tollbook_1').includes('되를 든다'), '중인: 되질 자리 열림'); useR('npc_changri', '장부를'); ok(!btn('장부를')?.disabled && !btn('되를 속인다')?.disabled && !btn('쌀로 낸다')?.disabled && btn('「면세')?.disabled && btn('조운선')?.disabled, '중인: 장부·되 속임·쌀 내기 열림 · 면세·사공 회색'); const r0 = g.life.values.rank; pick('장부를'); closeCard(); ok(done('jochang') && g.flags.has('jc:book') && g.life.values.rank === r0 + 1, '장부 → 🎖+1');
  ok(verb(g, 'tollbook_1') === '살펴보기', '끝난 뒤 되질 자리는 살펴보기');
}
// ===== 판 4: 솔거 노비 남자(발 빠른) — 서원 노비 🤝+1 · 품삯 🌾+1 🤝+1 · 주인 쌀 지기 → 곳간 쌀가마 보임
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 0, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'foot');
  ok(g.life.status === 'solgeo', '솔거 노비'); on(...ALL);
  goTo('seowon'); closeCard(); ok(verb(g, 'mukpae_1').includes('패를 든다'), '노비: 묵패 자리 열림(노비 일)'); useR('npc_yusaeng', '서원 노비'); ok(!btn('서원 노비')?.disabled && btn('묵패를 받았다 — 낸다')?.disabled && btn('묵패를 받았다 — 거절')?.disabled && btn('유생으로')?.disabled && btn('제사 음식')?.disabled, '노비 남자: 서원 노비 열림 · 묵패·유생·음식 회색'); const h0 = g.life.values.heart; pick('서원 노비'); closeCard(); ok(done('seowon') && g.flags.has('sw:serve') && g.life.values.heart === h0 + 1, '서원 노비 → 🤝+1');
  goTo('yugi'); closeCard(); ok(verb(g, 'brassforge_1').includes('풀무를 밟는다') && verb(g, 'brassware_1') === '살펴보기', '노비: 화덕 열림 · 두드리는 상은 살펴보기'); const g0 = g.life.values.grain, h1 = g.life.values.heart; useR('brassforge_1', '품삯'); closeCard(); ok(done('yugi') && g.flags.has('yg:wage') && g.life.values.grain === g0 + 1 && g.life.values.heart === h1 + 1, '품삯 → 🌾+1 🤝+1');
  goTo('jochang'); closeCard(); ok(verb(g, 'jochang_1').includes('쌀을 낸다') && shown.sack === false, '노비: 곳간 열림(지기) · 쌀가마 숨김'); useR('npc_changri', '주인 논'); ok(!btn('주인 논')?.disabled && !btn('쌀을 빼돌린다')?.disabled && btn('쌀로 낸다')?.disabled && btn('조운선')?.disabled && btn('장부를')?.disabled, '노비 남자: 지기·빼돌리기 열림 · 쌀 내기·사공·장부 회색'); pick('주인 논'); closeCard(); await drain(closeCard, goTo, 'jochang'); ok(done('jochang') && g.flags.has('jc:carry') && shown.sack === true, '주인 쌀 지기 → 곳간 쌀가마 보임');
  ok(g.promptFor(g.e.interactables.get('jochang_1')).name.includes('찼다'), '끝난 뒤 「곳간 — 찼다」');
}
// ===== 판 5: 장인 남자(손 좋은, 솜씨 4) — 놋쇠 치기 → 놋그릇 보임 ✋+2 🌾+1 · 조운선 사공 → 배 쌀가마 보임 🌾+2 🤝+1 · 묵패 낸다 🌾-1 🤝+1
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 8, heart: 3, grain: 1, rank: 0, branch: 'jangin', status: 'jangin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'hand');
  g.life.setStatusTo('jangin'); ok(g.life.status === 'jangin' && g.life.values.craft >= 3, '장인·솜씨 셋 이상'); on(...ALL);
  goTo('yugi'); closeCard(); ok(verb(g, 'brassware_1').includes('망치를 든다'), '장인: 두드리는 상 열림'); useR('npc_yugijang', '놋쇠를 치고'); ok(!btn('놋쇠를 치고')?.disabled && btn('제기 한 벌')?.disabled && btn('몽땅')?.disabled, '장인 곡식 1: 치기 열림 · 제기·몽땅 회색'); const c0 = g.life.values.craft, g0 = g.life.values.grain; pick('놋쇠를 치고'); closeCard(); await drain(closeCard, goTo, 'yugi'); ok(done('yugi') && g.flags.has('yg:hammer') && shown.brass === true && g.life.values.craft === c0 + 2 && g.life.values.grain === g0 + 1, '치기 → 놋그릇 보임 · ✋+2 🌾+1');
  ok(g.promptFor(g.e.interactables.get('brassware_1')).name.includes('더미'), '끝난 뒤 「놋그릇 더미」');
  goTo('jochang'); closeCard(); ok(verb(g, 'joseonship_1').includes('배에 오른다') && shown.shipsack === false, '장인 남자: 배 열림 · 배 쌀 숨김'); useR('npc_changri', '조운선'); ok(!btn('조운선')?.disabled && !btn('쌀로 낸다')?.disabled && btn('쌀을 빼돌린다')?.disabled && btn('주인 논')?.disabled, '장인 남자: 사공·쌀 내기 열림 · 빼돌리기·지기 회색'); const g1 = g.life.values.grain, h0 = g.life.values.heart; pick('조운선'); closeCard(); await drain(closeCard, goTo, 'jochang'); ok(done('jochang') && g.flags.has('jc:sail') && shown.shipsack === true && g.life.values.grain === g1 + 2 && g.life.values.heart === h0 + 1, '사공 → 배 쌀가마 보임 · 🌾+2 🤝+1');
  goTo('seowon'); closeCard(); useR('npc_yusaeng', '묵패를 받았다 — 낸다'); ok(!btn('묵패를 받았다 — 낸다')?.disabled && !btn('묵패를 받았다 — 거절')?.disabled && btn('유생으로')?.disabled, '장인: 묵패 둘 열림 · 유생 회색'); const g2 = g.life.values.grain, h1 = g.life.values.heart; pick('묵패를 받았다 — 낸다'); closeCard(); ok(done('seowon') && g.flags.has('sw:pay') && g.life.values.grain === g2 - 1 && g.life.values.heart === h1 + 1, '묵패에 냈다 → 🌾-1 🤝+1');
}
// ===== 판 6: 서얼(양반 집 + belly) 문 밖에서 글 🤝+1 · 도고(곡식 5) 몽땅 사들이기 성공 🌾+3 🤝-2 · 땅 바치기(도고) 🌾-2
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 4, grain: 2, rank: 0, branch: 'gongsin', status: 'yangban', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'seoeol', '서얼'); on(...ALL);
  goTo('seowon'); closeCard(); ok(verb(g, 'saaek_1').includes('글을 올린다'), '서얼: 현판 자리 열림(문 밖 글)'); useR('npc_yusaeng', '문 밖에서'); ok(!btn('문 밖에서')?.disabled && btn('유생으로')?.disabled && btn('사액을')?.disabled && btn('땅을')?.disabled, '서얼: 문 밖 열림 · 유생·사액·땅 회색'); const h0 = g.life.values.heart; pick('문 밖에서'); closeCard(); ok(done('seowon') && g.flags.has('sw:gate') && g.life.values.heart === h0 + 1, '문 밖에서 읽었다 → 🤝+1');
  goTo('yugi'); closeCard(); useR('npc_yugijang', '제기 한 벌'); ok(!btn('제기 한 벌')?.disabled, '서얼 곡식 2: 제기 열림'); pick('제기 한 벌'); closeCard();
}
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 5, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  g.life.setStatusTo('dogo'); ok(g.life.status === 'dogo' && g.life.values.grain >= 4, '도고·곡식 넷 이상'); on(...ALL);
  goTo('yugi'); closeCard(); ok(verb(g, 'wagebook_1').includes('장부를 편다'), '도고: 품삯 장부 열림(몽땅)'); const g0 = g.life.values.grain, h0 = g.life.values.heart; useR('wagebook_1', '몽땅'); closeCard(); ok(done('yugi') && g.flags.has('yg:corner') && g.life.values.grain === g0 + 3 && g.life.values.heart === Math.max(0, h0 - 2), '몽땅 사들였다 → 🌾+3 🤝-2');
  goTo('seowon'); closeCard(); ok(verb(g, 'seowonland_1').includes('문서를 낸다'), '도고: 서원 땅 곳간 열림'); const g1 = g.life.values.grain; useR('seowonland_1', '땅을'); closeCard(); ok(done('seowon') && g.flags.has('sw:donate') && g.life.values.grain === g1 - 2, '땅을 서원에 바쳤다 → 🌾-2');
  goTo('jochang'); closeCard(); useR('npc_changri', '쌀로 낸다'); ok(!btn('쌀로 낸다')?.disabled && btn('「면세')?.disabled, '도고: 쌀 내기 열림 · 면세 회색'); pick('쌀로 낸다'); closeCard(); await drain(closeCard, goTo, 'jochang'); ok(done('jochang') && g.flags.has('jc:pay') && shown.sack === true, '쌀로 냈다 → 곳간 쌀가마 보임');
}
// ===== 판 7: 실패 굴림 — 상민 남 묵패 거절 실패 → 맞음 🌾-1 🤝-1 · 도고 몽땅 실패 → 값 떨어짐 🌾-2 · 중인 되 속임 실패 → 들통 🤝-3 🎖-1 · 사공 실패 → 여울 🌾-2 (숨김은 그대로)
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 3, rank: 0, branch: 'sangmin', status: 'sangmin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  on(...ALL); Math.random = () => 0.99; g.life.tries = {};
  goTo('seowon'); closeCard(); const g0 = g.life.values.grain, h0 = g.life.values.heart; useR('mukpae_1', '묵패를 받았다 — 거절'); pick('묵패를 받았다 — 거절'); closeCard(); ok(done('seowon') && g.flags.has('sw:beaten') && !g.flags.has('sw:refuse') && g.life.values.grain === g0 - 1 && g.life.values.heart === h0 - 1, '거절 실패 → 맞았다 🌾-1 🤝-1');
  goTo('jochang'); closeCard(); const g1 = g.life.values.grain; useR('joseonship_1', '조운선'); closeCard(); ok(done('jochang') && g.flags.has('jc:wreck') && !g.flags.has('jc:sail') && g.life.values.grain === Math.max(0, g1 - 2) && shown.shipsack === false, '사공 실패 → 여울 🌾-2 · 배 쌀 안 보임');
  Math.random = () => 0.01;
}
{
  store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 2, heart: 6, grain: 5, rank: 2, branch: 'jungin', status: 'jungin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'jungin', '중인'); on(...ALL); Math.random = () => 0.99; g.life.tries = {};
  goTo('jochang'); closeCard(); const h0 = g.life.values.heart, r0 = g.life.values.rank; useR('tollbook_1', '되를 속인다'); pick('되를 속인다'); closeCard(); ok(done('jochang') && g.flags.has('jc:exposed') && !g.flags.has('jc:cheat') && g.life.values.heart === Math.max(0, h0 - 3) && g.life.values.rank === Math.max(0, r0 - 1), '되 속임 실패 → 들통 🤝-3 🎖-1(바닥 0)');
  g.life.setStatusTo('dogo'); goTo('yugi'); closeCard(); const g0 = g.life.values.grain; useR('wagebook_1', '몽땅'); closeCard(); ok(done('yugi') && g.flags.has('yg:glut') && g.life.values.grain === Math.max(0, g0 - 2), '몽땅 실패 → 값 떨어짐 🌾-2');
  Math.random = () => 0.01;
}
console.log(`joseon-late life 고리 3(넓히기 2: 서원·유기점·조창): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
