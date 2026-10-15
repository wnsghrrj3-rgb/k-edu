// 대한민국 인생 층 고리 시험 3 — 10-15 넓히기 2: 새 장소 셋(피란민 판자촌·전파사 골목·중학교) 상황을 강제로 켜서 일곱 판(학생 남 / 돌아온 집 여 / 지주 남 / 상인 남 / 노동자 솜씨 4 / 소작 남 / 실패 굴림·다친 몸 원호). 직업·성별·솜씨·다친 몸 회색 · 숨김 재질 보임(판자 지붕·TV 화면·은행알) · 값 변화 · 삶 중간 변화(학비 없어 공장→노동자) · 실패 깃발. 데이터 전수(섞여 14·q·사실·done 세우는 곳).
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:gaehang-life': JSON.stringify({ craft: 2, heart: 4, grain: 4, rank: 0, branch: 'haksaeng', status: 'haksaeng', nation: 'joseon' }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['jijugate_1','sojakjip_1','so_1','radio_1','jangteo_1','tv_1','yeondan_1','eup_1','tupyo_1','eunhaeng_1','bogeonso_1','guho_1','hakgyo_1','dari_1','boat_1','malttuk_1','vinyl_1','saemaeul_1','gongjang_1','apateu_1','yeok_1','train_1','bus_1','bangongho_1','cheoljomang_1',
  'npc_jiju','npc_sojak','npc_dolaon','npc_jumo','npc_itaeyeong','npc_eupjang','npc_eunhaengwon','npc_ganhosa','npc_moksa','npc_gyosa','npc_haksaeng','npc_pinanmin','npc_nongbu','npc_saemaeul','npc_jeontaeil','npc_yeogong','npc_yeokmu','npc_gwangbu','npc_chajang','npc_chobyeong',
  'halfpanja_1','floursack_1','crutch_1','workbench_1','yangpum_1','radiobox_1','lottery_1','noticeboard_1','uniformstall_1','npc_sangigunin','npc_jeonpasa','npc_gyogam'];
const AREAS = { maeul: [-22, -16], jiju: [-29, -22], jangteo: [0, 12], gwangjang: [0, 38], eupsamuso: [26, 28], eunhaeng: [28, 35], bogeonso: [-24, 35], gyohoe: [-46, 31], hakgyo: [-50, -2], dari: [-60, 10], naru: [-62, 34], nongji: [55, -12], deul: [85, -14], saemaeul: [54, 18], gongjang: [60, 41], apateu: [84, 52], yeok: [20, 66], seoulgil: [34, -36], bangongho: [-88, -68], hyujeon: [-18, -100], panja: [-34, 94], sueri: [-14, 56], junghak: [-50, 52] };
const mkGame = (sex, mixed, char = 'hand') => {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const HID = { halfpanja_1: [['panja_roof', 'roof']], workbench_1: [['tv_light', 'tv']], lottery_1: [['lottery_balls', 'balls']], cheoljomang_1: [['barbed', 'barbed']], saemaeul_1: [['slate_blue', 'slate']], dari_1: [['bridge_new', 'bridge']], apateu_1: [['apt_concrete', 'apt']] };
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
const MIX = ['panja', 'sueri', 'junghak'];
const verb = (g, n) => g.promptFor(g.e.interactables.get(n)).verb;
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };
const ALL = ['sit:gwangbok:done', 'sit:bundan:done', 'sit:nongji:done', 'sit:jeonjaeng:done', 'sit:gongbu:done', 'sit:sanupwha:done', 'sit:geori:done', 'sit:seongeo:done', 'sit:oehwan:done'];
const endOf = (g) => g.life.d.situations.find((s) => s.id === 'oneul').choices[0].then[0].end;
const carry = (key) => JSON.parse(store['kworld_carry:daehan-life'] || '{}')[key];

// ===== 데이터 전수: 섞여 14 · 새 상황 셋에 q 셋·📜 사실·기록 · done 깃발을 세우는 곳 · 회색 수 · status id 실재 · 구역·밤 안전·풀 피하기
{
  const life = J('life'), items = J('items'), npcs = J('npcs'), world = J('world');
  const mixed = life.situations.filter((s) => !s.must); ok(mixed.length === 14 && life.mixedCount === 4, '섞여 14 · mixedCount 4');
  const blob = JSON.stringify(items) + JSON.stringify(npcs);
  for (const id of MIX) { const s = life.situations.find((x) => x.id === id); ok(!!s && s.q.a.length === 3 && s.q.revisit && world.journal[id]?.note && s.choices.every((c) => c.fact === world.journal[id].note && c.journal === id), `상황 ${id} q·사실·기록`); for (const c of s.choices) ok(blob.includes(`"${c.done}"`), `${id}.${c.id} done 세우는 곳`); }
  const gray = (id) => npcs[id].lines[0].choices.filter((c) => c.if).length; ok(gray('sangigunin') === 6 && gray('jeonpasa') === 6 && gray('gyogam') === 7, '회색 조건 6·6·7');
  const ids = new Set(life.status.rules.map((r) => r.id));
  for (const id of ['sangigunin', 'jeonpasa', 'gyogam']) for (const c of npcs[id].lines[0].choices) { for (const f of (c.if || '').match(/status:(\w+)/g) || []) ok(ids.has(f.slice(7)), `${id} ${f} 실재`); if (c.status) ok(ids.has(c.status), `${id} 선택 신분 ${c.status} 실재`); }
  for (const id of MIX) for (const c of life.situations.find((x) => x.id === id).choices) if (c.status) ok(ids.has(c.status), `${id}.${c.id} 결과 신분 ${c.status} 실재`);
  ok(MIX.every((a) => world.areas[a]) && world.danger.safe.some(([x, z]) => x === -34 && z === 94) && world.scenery.grass.avoid.some(([x, z]) => x === -50 && z === 52), '구역·밤 안전·풀 피하기');
  const txt = JSON.stringify(MIX.map((id) => life.situations.find((x) => x.id === id)));
  for (const w of ['옳았', '잘못', '정의', '영웅', '폭도']) ok(!txt.includes(w), `평가 문구 「${w}」 없음`);
}
// ===== 판 1: 학생 남자(눈 밝은) — 전쟁 전엔 판자촌 안 열림 → 야학 🤝+2 🎖+1 · 전파사 점원 🌾+1 ✋+1 · 입시 🎖+1(추첨 통은 그대로 숨김)
{
  const { g, S, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'haksaeng', '학생');
  ok(g.life.situations.length === 13 && Object.keys(g.world.areas).length === 23, '꼭 10 + 새 3 · 구역 23');
  goTo('panja'); ok(!opened('panja'), '전쟁 전엔 판자촌 안 열림');
  on(...ALL); goTo('panja'); ok(opened('panja'), '판자촌'); closeCard(); ok(shown.roof === false, '판자 지붕은 처음엔 숨김');
  ok(verb(g, 'halfpanja_1').includes('판자를 든다') && verb(g, 'floursack_1') === '살펴보기' && verb(g, 'crutch_1') === '살펴보기', '학생: 짓다 만 집 열림(야학) · 포대·목발은 살펴보기');
  useR('npc_sangigunin', '판자촌 야학'); ok(!btn('판자촌 야학')?.disabled && btn('판잣집을')?.disabled && btn('구호 밀가루')?.disabled && btn('원호를')?.disabled && btn('미제')?.disabled && btn('구호 옷')?.disabled, '학생 남자: 야학 열림 · 짓기·밀가루·원호·미제·옷 회색'); S.panel = null;
  const r0 = g.life.values.rank, h0 = g.life.values.heart; useR('halfpanja_1', '판자촌 야학'); pick('판자촌 야학'); closeCard(); ok(done('panja') && g.flags.has('pj:yahak') && g.life.values.rank === r0 + 1 && g.life.values.heart === h0 + 2 && shown.roof === false, '야학 → 🎖+1 🤝+2 · 지붕은 그대로 숨김');
  goTo('sueri'); ok(opened('sueri'), '전파사'); closeCard(); ok(shown.tv === false && verb(g, 'workbench_1').includes('인두를 든다') && verb(g, 'yangpum_1') === '살펴보기' && verb(g, 'radiobox_1').includes('상자를 연다'), 'TV 화면 숨김 · 학생(솜씨 2): 작업대 열림(점원) · 좌판 살펴보기 · 상자 열림(쌀 1)');
  useR('npc_jeonpasa', '점원으로'); ok(!btn('점원으로')?.disabled && !btn('라디오를 산다')?.disabled && btn('라디오·TV를')?.disabled && btn('미제')?.disabled && btn('농어촌')?.disabled && btn('나일론')?.disabled, '학생 남자: 점원·사기 열림 · 고치기·미제·보내기·나일론 회색'); const g0 = g.life.values.grain, c0 = g.life.values.craft; pick('점원으로'); closeCard(); ok(done('sueri') && g.flags.has('sp:clerk') && g.life.values.grain === g0 + 1 && g.life.values.craft === c0 + 1 && shown.tv === false, '점원 → 🌾+1 ✋+1 · 화면은 꺼진 채');
  goTo('junghak'); ok(opened('junghak'), '중학교'); closeCard(); ok(shown.balls === false && verb(g, 'lottery_1').includes('손을 넣는다') && verb(g, 'noticeboard_1') === '살펴보기' && verb(g, 'uniformstall_1') === '살펴보기', '은행알 숨김 · 학생: 추첨 통 열림(입시·추첨) · 벽보·좌판 살펴보기');
  useR('npc_gyogam', '입시 공부'); ok(!btn('입시 공부')?.disabled && !btn('아이 학교를')?.disabled && btn('야간 중학')?.disabled && btn('학비가 없어')?.disabled && btn('교사로')?.disabled && btn('교복을 판다')?.disabled && btn('교복을 짓는다')?.disabled, '학생 남자: 입시·추첨 열림 · 나머지 회색'); const r1 = g.life.values.rank; pick('입시 공부'); closeCard(); ok(done('junghak') && g.flags.has('jh:exam') && g.life.values.rank === r1 + 1 && shown.balls === false, '입시 → 🎖+1 · 은행알은 그대로 숨김');
  g.life.end(endOf(g)); ok(g.flags.has('life:end') && carry('status') === 'haksaeng', '끝 카드 · 학생 넘김');
  ok(MIX.every((k) => g.world.journal[k]?.note), '새 기록 셋');
}
// ===== 판 2: 돌아온 집 여자(발 빠른) — 판잣집 짓기 → 지붕 보임 🤝+1 · 나일론 ✋+1 🌾+1 · 교복 짓기 ✋+1 🌾+1
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 3, grain: 0, rank: 0, branch: 'ijumin', status: 'ijumin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'foot');
  ok(g.life.status === 'doraon', '돌아온 집'); on(...ALL);
  goTo('panja'); closeCard(); ok(verb(g, 'halfpanja_1').includes('판자를 든다') && verb(g, 'floursack_1').includes('포대를 든다') && verb(g, 'crutch_1') === '살펴보기', '돌아온 집 여자: 짓다 만 집·포대 열림 · 목발은 살펴보기'); useR('npc_sangigunin', '판잣집을'); ok(!btn('판잣집을')?.disabled && !btn('구호 밀가루')?.disabled && !btn('구호 옷')?.disabled && btn('원호를')?.disabled && btn('미제')?.disabled && btn('판자촌 야학')?.disabled, '돌아온 집 여자: 짓기·밀가루·옷 열림 · 원호·미제·야학 회색'); const h0 = g.life.values.heart; pick('판잣집을'); closeCard(); await drain(closeCard, goTo, 'panja'); ok(done('panja') && g.flags.has('pj:build') && shown.roof === true && g.life.values.heart === h0 + 1, '판잣집 짓기 → 지붕 보임 · 🤝+1');
  ok(g.promptFor(g.e.interactables.get('halfpanja_1')).name.includes('다 지은'), '끝난 뒤 「다 지은 판잣집」');
  goTo('sueri'); closeCard(); ok(verb(g, 'yangpum_1').includes('물건을 든다') && verb(g, 'workbench_1') === '살펴보기', '여자 솜씨 1: 좌판 열림(나일론) · 작업대는 살펴보기'); useR('npc_jeonpasa', '나일론'); ok(!btn('나일론')?.disabled && btn('라디오·TV를')?.disabled && btn('점원으로')?.disabled && btn('라디오를 산다')?.disabled, '돌아온 집 여자 쌀 0: 나일론 열림 · 고치기·점원·사기(쌀 0) 회색'); const c0 = g.life.values.craft, g0 = g.life.values.grain; pick('나일론'); closeCard(); ok(done('sueri') && g.flags.has('sp:nylon') && g.life.values.craft === c0 + 1 && g.life.values.grain === g0 + 1, '나일론 → ✋+1 🌾+1');
  goTo('junghak'); closeCard(); ok(verb(g, 'uniformstall_1').includes('교복을 든다') && verb(g, 'noticeboard_1').includes('벽보를 본다') && verb(g, 'lottery_1').includes('손을 넣는다'), '돌아온 집 여자 쌀 1: 좌판(짓기)·벽보(공장)·추첨 통(쌀 1) 열림');
  useR('npc_gyogam', '교복을 짓는다'); ok(!btn('교복을 짓는다')?.disabled && !btn('학비가 없어')?.disabled && !btn('아이 학교를')?.disabled && btn('입시 공부')?.disabled && btn('교사로')?.disabled && btn('교복을 판다')?.disabled, '돌아온 집 여자: 짓기·공장·추첨(쌀 1) 열림 · 입시·교사·판다 회색'); const c1 = g.life.values.craft; pick('교복을 짓는다'); closeCard(); ok(done('junghak') && g.flags.has('jh:sew') && g.life.values.craft === c1 + 1, '교복 짓기 → ✋+1');
}
// ===== 판 3: 지주 남자(배 든든한, 쌀 5) — 판자촌 전부 회색 「본다」 · 라디오 산다 🌾-1 🤝+1 · 추첨 🌾-1 → 은행알 보임
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 3, grain: 5, rank: 1, branch: 'jiju', status: 'jiju', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'jiju', '지주'); on(...ALL);
  goTo('panja'); closeCard(); ok(verb(g, 'halfpanja_1') === '살펴보기' && verb(g, 'floursack_1') === '살펴보기' && verb(g, 'crutch_1') === '살펴보기', '지주 남자: 판자촌 셋 전부 살펴보기'); useR('npc_sangigunin', '본다'); ok(btn('판잣집을')?.disabled && btn('구호 밀가루')?.disabled && btn('원호를')?.disabled && btn('미제')?.disabled && btn('판자촌 야학')?.disabled && btn('구호 옷')?.disabled, '지주 남자: 여섯 전부 회색'); pick('본다'); closeCard(); ok(done('panja') && g.flags.has('pj:watch'), '봤다');
  goTo('sueri'); closeCard(); ok(verb(g, 'radiobox_1').includes('상자를 연다') && verb(g, 'workbench_1') === '살펴보기', '지주: 상자 열림(사기) · 작업대 살펴보기'); const g0 = g.life.values.grain, h0 = g.life.values.heart; useR('radiobox_1', '라디오를 산다'); pick('라디오를 산다'); closeCard(); ok(done('sueri') && g.flags.has('sp:buy') && g.life.values.grain === g0 - 1 && g.life.values.heart === h0 + 1, '라디오 → 🌾-1 🤝+1');
  goTo('junghak'); closeCard(); ok(verb(g, 'lottery_1').includes('손을 넣는다') && verb(g, 'noticeboard_1') === '살펴보기', '지주: 추첨 통 열림 · 벽보 살펴보기'); const g1 = g.life.values.grain; useR('lottery_1', '아이 학교를'); pick('아이 학교를'); closeCard(); await drain(closeCard, goTo, 'junghak'); ok(done('junghak') && g.flags.has('jh:lottery') && shown.balls === true && g.life.values.grain === g1 - 1, '추첨 → 은행알 보임 · 🌾-1');
  ok(g.promptFor(g.e.interactables.get('lottery_1')).name.includes('은행알'), '끝난 뒤 「추첨 통 — 은행알」');
}
// ===== 판 4: 상인 남자(눈) — 미제 물건 ⚠ 🌾+3 🤝-1(판자촌) · 라디오 보내기 🌾-1 🤝+2 · 교복 판다 🌾+2
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 5, grain: 3, rank: 1, branch: 'sangin', status: 'sangin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'eye');
  ok(g.life.status === 'sangin', '상인'); on(...ALL);
  goTo('panja'); closeCard(); ok(verb(g, 'floursack_1').includes('포대를 든다') && verb(g, 'halfpanja_1') === '살펴보기', '상인: 포대 열림(미제) · 짓다 만 집 살펴보기'); useR('npc_sangigunin', '미제'); ok(!btn('미제')?.disabled && btn('판잣집을')?.disabled && btn('구호 밀가루')?.disabled && btn('판자촌 야학')?.disabled, '상인 남자: 미제 열림 · 짓기·밀가루·야학 회색'); const g0 = g.life.values.grain, h0 = g.life.values.heart; pick('미제'); closeCard(); ok(done('panja') && g.flags.has('pj:yankee') && g.life.values.grain === g0 + 3 && g.life.values.heart === h0 - 1, '미제 → 🌾+3 🤝-1');
  goTo('sueri'); closeCard(); ok(verb(g, 'yangpum_1').includes('물건을 든다') && verb(g, 'radiobox_1').includes('상자를 연다'), '상인: 좌판·상자 열림'); useR('npc_jeonpasa', '농어촌'); ok(!btn('농어촌')?.disabled && !btn('미제')?.disabled && btn('점원으로')?.disabled && btn('나일론')?.disabled, '상인 남자: 보내기·미제 열림 · 점원·나일론 회색'); const g1 = g.life.values.grain, h1 = g.life.values.heart; pick('농어촌'); closeCard(); ok(done('sueri') && g.flags.has('sp:send') && g.life.values.grain === g1 - 1 && g.life.values.heart === h1 + 2, '보내기 → 🌾-1 🤝+2');
  goTo('junghak'); closeCard(); ok(verb(g, 'uniformstall_1').includes('교복을 든다'), '상인: 좌판 열림(판다)'); const g2 = g.life.values.grain; useR('uniformstall_1', '교복을 판다'); pick('교복을 판다'); closeCard(); ok(done('junghak') && g.flags.has('jh:sell') && g.life.values.grain === g2 + 2, '교복 판다 → 🌾+2');
  g.life.end(endOf(g)); ok(g.flags.has('life:end') && carry('status') === 'sangin', '끝 카드 · 상인 넘김');
}
// ===== 판 5: 노동자 남자(손 좋은, 솜씨 4) — TV 고치기 → 화면 켜짐 ✋+2 🌾+1 · 야간 중학 🎖+1 ✋+1 · 밀가루 🌾+1 🤝+1
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 8, heart: 2, grain: 1, rank: 0, branch: 'nodongja', status: 'nodongja', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'hand');
  ok(g.life.status === 'nodongja' && g.life.values.craft >= 3, '노동자·솜씨 셋 이상'); on(...ALL);
  goTo('sueri'); closeCard(); ok(verb(g, 'workbench_1').includes('인두를 든다'), '노동자 솜씨 4: 작업대 열림(고치기·점원)'); useR('npc_jeonpasa', '라디오·TV를'); ok(!btn('라디오·TV를')?.disabled && !btn('점원으로')?.disabled && btn('미제')?.disabled && btn('농어촌')?.disabled, '노동자 남자: 고치기·점원 열림 · 미제·보내기 회색'); const c0 = g.life.values.craft, g0 = g.life.values.grain; pick('라디오·TV를'); closeCard(); await drain(closeCard, goTo, 'sueri'); ok(done('sueri') && g.flags.has('sp:fix') && shown.tv === true && g.life.values.craft === c0 + 2 && g.life.values.grain === g0 + 1, '고치기 → 화면 켜짐 · ✋+2 🌾+1');
  ok(g.promptFor(g.e.interactables.get('workbench_1')).name.includes('켜진 TV'), '끝난 뒤 「켜진 TV — 작업대」');
  goTo('junghak'); closeCard(); ok(verb(g, 'noticeboard_1').includes('벽보를 본다'), '노동자: 벽보 열림(야간 중학·공장)'); useR('npc_gyogam', '야간 중학'); ok(!btn('야간 중학')?.disabled && !btn('학비가 없어')?.disabled && btn('입시 공부')?.disabled && btn('교사로')?.disabled, '노동자 남자: 야간·공장 열림 · 입시·교사 회색'); const r0 = g.life.values.rank, c1 = g.life.values.craft; pick('야간 중학'); closeCard(); ok(done('junghak') && g.flags.has('jh:night') && g.life.values.rank === r0 + 1 && g.life.values.craft === c1 + 1, '야간 중학 → 🎖+1 ✋+1');
  goTo('panja'); closeCard(); const g1 = g.life.values.grain, h0 = g.life.values.heart; useR('floursack_1', '구호 밀가루'); pick('구호 밀가루'); closeCard(); ok(done('panja') && g.flags.has('pj:flour') && g.life.values.grain === g1 + 1 && g.life.values.heart === h0 + 1, '밀가루 → 🌾+1 🤝+1');
}
// ===== 판 6: 소작 남자 — 학비가 없어 공장으로 → 노동자(삶 중간 변화) 🌾+1 🤝-1 · 그 뒤 전파사 점원(노동자라 열림)
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 1, heart: 2, grain: 0, rank: 0, branch: 'sojak', status: 'sojak', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('m', MIX, 'belly');
  ok(g.life.status === 'sojak', '소작'); on(...ALL);
  goTo('sueri'); closeCard(); ok(verb(g, 'workbench_1') === '살펴보기' && verb(g, 'radiobox_1') === '살펴보기', '소작 쌀 0 솜씨 1: 작업대·상자 살펴보기');
  goTo('junghak'); closeCard(); const g0 = g.life.values.grain, h0 = g.life.values.heart; useR('npc_gyogam', '학비가 없어'); ok(!btn('학비가 없어')?.disabled && !btn('야간 중학')?.disabled && btn('아이 학교를')?.disabled && btn('입시 공부')?.disabled, '소작 남자 쌀 0: 공장·야간 열림 · 추첨(쌀 0)·입시 회색'); pick('학비가 없어'); closeCard(); ok(done('junghak') && g.flags.has('jh:factory') && g.life.status === 'nodongja' && g.life.values.grain === g0 + 1 && g.life.values.heart === Math.max(0, h0 - 1), '공장으로 → 노동자 · 🌾+1 🤝-1');
  goTo('sueri'); closeCard(); ok(verb(g, 'workbench_1').includes('인두를 든다'), '노동자가 된 뒤 작업대 열림(점원)'); useR('npc_jeonpasa', '점원으로'); ok(!btn('점원으로')?.disabled && btn('라디오·TV를')?.disabled, '점원 열림 · 고치기 회색(솜씨 1)'); pick('점원으로'); closeCard(); ok(done('sueri') && g.flags.has('sp:clerk'), '점원');
}
// ===== 판 7: 실패 굴림 + 다친 몸 — 상인 여자 미제 실패 → 단속 🌾-1 · 전파사 미제 실패 🌾-1 · 다친 몸(wound)이면 원호 열림 🌾+1
{
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 4, grain: 3, rank: 0, branch: 'sangin', status: 'sangin', nation: 'joseon' });
  const { g, useR, pick, closeCard, goTo, btn, on, opened, done, shown } = mkGame('f', MIX, 'eye');
  ok(g.life.status === 'sangin', '상인'); on(...ALL); Math.random = () => 0.99; g.life.tries = {};
  goTo('panja'); closeCard(); ok(verb(g, 'crutch_1') === '살펴보기', '안 다친 몸: 목발 자리 살펴보기'); g.life.injure('wound'); ok(verb(g, 'crutch_1').includes('증서를 꺼낸다'), '다친 몸: 목발 자리 열림(원호)');
  const g0 = g.life.values.grain; useR('npc_sangigunin', '미제'); ok(!btn('원호를')?.disabled && !btn('미제')?.disabled && !btn('구호 옷')?.disabled && btn('판잣집을')?.disabled, '상인 여자 다친 몸: 원호·미제·옷 열림 · 짓기 회색'); pick('미제'); closeCard(); ok(done('panja') && g.flags.has('pj:caught') && !g.flags.has('pj:yankee') && g.life.values.grain === g0 - 1, '미제 실패 → 단속 🌾-1');
  goTo('sueri'); closeCard(); const g1 = g.life.values.grain; useR('yangpum_1', '미제'); pick('미제'); closeCard(); ok(done('sueri') && g.flags.has('sp:caught') && !g.flags.has('sp:yankee') && g.life.values.grain === g1 - 1, '전파사 미제 실패 → 압수 🌾-1');
  Math.random = () => 0.01;
  store['kworld_carry:gaehang-life'] = JSON.stringify({ craft: 2, heart: 4, grain: 3, rank: 0, branch: 'gunin', status: 'gunin', nation: 'joseon' });
  const B = mkGame('m', MIX, 'body'); B.on(...ALL); B.g.life.setStatusTo('gunin'); B.goTo('panja'); B.closeCard(); const gg = B.g.life.values.grain; B.useR('crutch_1', '원호를'); B.pick('원호를'); B.closeCard(); ok(B.done('panja') && B.g.flags.has('pj:wonho') && B.g.life.values.grain === gg + 1, '군인: 원호 → 🌾+1');
}
console.log(`daehan life 고리 3(넓히기 2: 판자촌·전파사·중학교): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
