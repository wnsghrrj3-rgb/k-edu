// 이야기형 시대(story-p1) 고리 규칙 시험 — WebGL 없이 game.js + story.js 규칙만
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; let panel = null;
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; }, craftPanel() {}, check: (data, onA, onFinish) => { g._check = data; onFinish(data.questions.map((q) => ({ id: q.id, concept: q.concept, ok: true }))); }, pickPanel: (r, c, onPick) => { g._pick = onPick; } };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {} } }); };
['stone_1', 'stone_2', 'bush_a1_1', 'bush_a1_2', 'track_1', 'deer_1', 'fire_1', 'npc_elder', 'gate_1', 'stick_1', 'stick_2', 'stick_3', 'stick_4'].forEach(mk);
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas: new Map([['camp', new THREE.Vector3(1, 0, 1)]]), groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {} }, onFrame: [], spawn: new THREE.Vector3() };
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (i) => { const b = panel.b[i]; panel = null; b.onClick(); };
const vis = (name) => ix.get(name) && ix.get(name).obj.visible !== false && !ix.get(name).disabled;

// 장면 층: GLB 대상 빼고 절차 소품 들어감
ok(!ix.has('npc_elder') && !ix.has('gate_1') && !ix.has('stone_1') && !ix.has('stone_2'), 'GLB 대상 제거');
ok(ix.has('stone_r1') && ix.has('dbush_1') && ix.has('root_1') && ix.has('npc_hana') && ix.has('npc_maru'), '소품·사람 배치');
ok(ix.get('deer_1').kind === 'big' && !vis('deer_1'), '사슴은 채집 전엔 안 보임');
ok(!vis('npc_aru') && !vis('track_1') && !vis('herd_1'), '아루·흔적·무리 숨김');
ok(g.e.spawn.x === -4 && g.e.spawn.z === -12, '시작점 강가');
g.updateMission(true); ok(g._mission.includes('배가 고프다'), '첫 미션');
// ACT 1 — 검은 열매 먹어 보기(실패 경험) → 하나
use('dbush_1'); ok(panel && panel.b.length === 3, '열매 선택 3'); const h0 = g.hunger; pick(0); ok(g.hunger < h0 && g.flags.has('berry:bad'), '검은 열매: 배 줄고 berry:bad');
g.tick(0.01); ok(g._mission.includes('사람에게 묻기'), '미션 2');
use('root_1'); ok(says.at(-1).includes('잘 모르겠다') && ix.has('root_1'), '하나 전엔 뿌리 못 캠');
use('bush_a1_1'); ok(panel && panel.b.length === 3, '빨간 열매도 선택형'); pick(2); ok(g.has('berry'), '가져간다');
use('npc_hana'); ok(says.at(-1).includes('먹었구나'), '하나: 먹은 뒤 대사'); ok(g.flags.has('talk:hana'), 'talk:hana');
ok(g.promptFor(ix.get('dbush_2')).verb === '그냥 두기', '검은 덤불 이름 바뀜'); use('dbush_2'); ok(says.at(-1).includes('먹지 않는 게 좋아'), '검은 열매 안 먹음');
use('bush_a1_2'); ok(!panel && g.count('berry') === 2, '하나 뒤 빨간 열매는 바로 따기');
use('root_1'); ok(g.has('root') && !ix.has('root_1'), '뿌리 캠');
await new Promise((r) => setTimeout(r, 1400)); ok(g.flags.has('journal:gather'), '📔 채집'); g.tick(0.01); ok(g._mission.includes('사슴'), '미션 4');
ok(vis('deer_1'), '채집 뒤 사슴 보임');
// ACT 2 — 쫓아가면 놓친다 → 아루
const h1 = g.hunger; use('deer_1'); ok(g.flags.has('deer:lost') && g.hunger < h1 && g.story.movers.length === 1, '사슴 달아남');
g.story.tick(3.5); ok(!ix.has('deer_1'), '사슴 사라짐'); ok(vis('npc_aru') && !vis('npc_aru2'), '아루 나타남');
use('npc_aru'); ok(says.at(-1).includes('지나간 곳을 봐'), '아루 대사'); ok(vis('track_1') && !vis('track_2'), '발자국 하나만');
// ACT 3 — 흔적 잇기, 갈림길
use('track_1'); ok(g.flags.has('seen:step') && vis('track_2'), '발자국→배설물');
use('track_2'); ok(vis('track_3') && vis('track_6') && !vis('track_4'), '배설물→가지+오래된 발자국');
use('track_6'); ok(says.at(-1).includes('오래된'), '오래된 발자국은 막다른 길');
use('track_3'); ok(panel && panel.b.length === 2, '갈림길 선택'); pick(1); ok(!g.flags.has('seen:branch') && says.at(-1).includes('다시 가지'), '틀린 쪽');
use('track_3'); pick(0); ok(g.flags.has('seen:branch') && vis('track_4'), '맞는 쪽 → 눌린 풀');
use('track_4'); use('track_5'); ok(g.flags.has('seen:fur'), '털'); await new Promise((r) => setTimeout(r, 1400)); ok(g.flags.has('journal:tracking'), '📔 흔적 읽기');
ok(vis('herd_1') && vis('npc_aru2') && !vis('npc_aru'), '무리·아루2 보임, 아루1 숨김');
use('npc_maru'); ok(says.at(-1).includes('탁'), '마루는 아직 말 안 함'); ok(!g.flags.has('maru:shown'), 'maru:shown 아직');
use('herd_1'); ok(g.flags.has('herd:seen') && says.at(-1).includes('잡을 방법'), '무리: 잡을 방법 없음');
use('npc_aru2'); ok(says.at(-1).includes('마루'), '아루2: 마루로');
// ACT 4 — 돌 고르기
use('npc_maru'); ok(g.flags.has('maru:shown'), '마루 안내');
for (const s of ['stone_r1', 'stone_r2', 'stone_s1', 'stone_h1', 'stone_f1', 'stone_f2']) use(s);
ok(g.count('stone_round') === 2 && g.has('stone_flint'), '돌 종류별 줍기');
g.craft('flake'); ok(typeof g._pick === 'function', '고르기 판');
g._pick(['stone_round', 'stone_round']); ok(!g.has('flake') && g.count('stone_round') === 2 && says.at(-1).includes('둥근'), '둥근+둥근 실패, 안 없어짐');
g.craft('flake'); g._pick(['stone_soft', 'stone_hard']); ok(!g.has('stone_soft') && g.has('stone_hard') && says.at(-1).includes('무르다'), '무른 돌은 부서짐');
g.craft('flake'); g._pick(['stone_flint', 'stone_flint']); ok(g.count('stone_flint') === 1 && says.at(-1).includes('조각'), '각진+각진: 하나 깨짐');
g.craft('flake'); g._pick(['stone_hard', 'stone_flint']); ok(g.has('flake') && !g.has('stone_hard') && !g.has('stone_flint') && g.flags.has('made:flake'), '검은+각진 = 날 선 돌');
await new Promise((r) => setTimeout(r, 1600)); ok(g.flags.has('journal:flake'), '📔 뗀석기');
g.tick(0.01); ok(g._mission.includes('풀밭 너머'), '미션 10');
ok(!vis('npc_maru') && !vis('npc_aru2') && vis('npc_nuri') && vis('npc_aru3') && vis('npc_maru2'), '날 선 돌 뒤: 사람들이 풀밭 너머로');
ok(!vis('spot_rockA') && !vis('wind_a'), '자리·바람은 누리 전엔 없음');
// ACT 5 — 첫 번째 사냥: 자리 고르기, 냄새(바람)로 놓침 → 다시 추적 → 성공
use('npc_nuri'); ok(g.flags.has('talk:nuri') && vis('spot_rockA') && vis('spot_reedA') && vis('wind_a'), '누리 뒤 자리 3 + 바람');
use('npc_aru3'); ok(g.flags.has('seen:wind'), '아루: 바람');
use('wind_a'); ok(says.at(-1).includes('강 쪽에서 언덕 쪽으로'), '잎이 날리는 방향');
use('spot_reedA'); ok(panel && panel.b.length === 2, '자리 선택'); const h2 = g.hunger; pick(0);
ok(g.flags.has('hunt:miss1') && g.hunger < h2 && g.story.movers.length === 3, '강 쪽(바람 위): 냄새 맡고 무리 달아남');
ok(!vis('spot_rockA') && vis('track_7') && !vis('track_8') && !vis('herdb_1'), '자리 A 사라지고 새 발자국만');
g.story.tick(3.5); ok(!ix.has('herd_1'), '무리 A 사라짐');
use('track_7'); ok(vis('track_8'), '새 발자국→눌린 풀'); use('track_8'); ok(vis('herdb_1') && vis('spot_rockB') && vis('npc_nuri2') && vis('wind_b'), '무리 B·자리 B·누리');
use('spot_openB'); const h3 = g.hunger; pick(0); ok(g.flags.has('hunt:miss2') && g.hunger < h3 && vis('herdb_1'), '탁 트인 곳: 배만 고파지고 무리는 그대로');
use('spot_rockB'); pick(0); ok(g.flags.has('hunt:done'), '바위 뒤(바람 아래): 사냥');
ok(!vis('herdb_1') && !vis('spot_rockB') && vis('npc_nuri2') && vis('kill_b') && !vis('kill_a'), '무리·자리 사라지고 누운 사슴, 누리는 남음');
await new Promise((r) => setTimeout(r, 30)); { const nu = g.story.actors.nuri2; ok(nu.state === 'run' && nu.path, '누리가 사슴 쪽으로 달린다'); for (let i = 0; i < 400 && nu.path; i++) g.story.tick(0.05); ok(!nu.path && nu.state === 'idle' && Math.abs(nu.obj.position.x + 6.5) < 0.2, '누리 도착 → 대기'); }
use('kill_b'); ok(g.flags.has('kill:seen') && says.at(-1).includes('조용'), '…조용하다'); use('kill_b'); ok(g.flags.has('deer:carried') && !ix.has('kill_b'), '함께 옮기기');
ok(vis('carcass_1') && vis('npc_hana2') && vis('npc_maru3') && vis('npc_nuri3') && vis('npc_old') && vis('npc_child') && !vis('npc_hana') && !vis('npc_nuri2'), '야영지: 사슴 + 사람들');
// ACT 6 — 한 마리의 사슴: 날 선 돌로는 안 됨 → 긁개
use('carcass_1'); ok(g.flags.has('skin:fail') && !g.has('hide') && says.at(-1).includes('찢어'), '날 선 돌: 가죽 찢어짐');
use('npc_maru3'); ok(says.at(-1).includes('다른 모양'), '마루: 이건 다른 모양이');
const rec = g.items.recipes.filter((r) => g.cond(r.showIf)); ok(rec.some((r) => r.out === 'scraper'), '다듬기 조리법 이제 보임');
use('stone_f3'); use('stone_r3'); g.craft('scraper'); ok(g.has('scraper') && g.flags.has('made:scraper') && !g.has('stone_flint'), '각진+둥근 = 긁개');
await new Promise((r) => setTimeout(r, 1600)); ok(g.flags.has('journal:scraper'), '📔 긁개');
use('carcass_1'); ok(g.flags.has('skin:done') && g.count('meat') === 3 && g.has('hide') && g.has('bone') && g.has('sinew'), '가죽 벗기기: 고기 3·가죽·뼈·힘줄');
use('carcass_1'); ok(says.at(-1).includes('뼈만'), '뼈만 남음');
// ACT 7 — 누구의 사슴인가: 나눔
use('npc_old'); ok(says.at(-1).includes('말이 없다'), '노인'); use('npc_nuri3'); ok(panel && panel.b.length === 2, '나눔 선택'); pick(0);
ok(g.flags.has('share:done') && g.count('meat') === 1 && says.at(-1).includes('혼자 잡은'), '내가 잡았는데? → 나눠지고 고기 1');
// ACT 8 — 밤
ok(g.story.nightOn && g.hungerMul > 1, '밤: 춥다'); ok(vis('npc_bara') && g.fireBase < 2, '바라 + 작은 불');
ok(g.promptFor(ix.get('stick_1')).verb === '줍기' && g.promptFor(ix.get('wstick_1')).verb === '줍기', '가지 줍기 열림');
use('npc_bara'); ok(says.at(-1).includes('가지'), '바라: 가지'); ok(g.flags.has('talk:bara'), 'talk:bara');
use('wstick_1'); use('wstick_2'); ok(g.count('wetstick') === 2, '젖은 가지 2');
use('fire_1'); ok(panel && panel.b.length === 3, '불 살리기 선택 3'); pick(1); ok(says.at(-1).includes('세 개'), '마른 가지 없음');
use('fire_1'); pick(0); ok(g.flags.has('fire:smoke') && g.count('wetstick') === 1 && !g.flags.has('fire:alive'), '젖은 가지: 연기만');
use('npc_bara'); ok(says.at(-1).includes('연기'), '바라: 연기만');
use('stick_1'); use('stick_2'); use('stick_3'); ok(g.count('stick') === 3, '마른 가지 3');
use('fire_1'); pick(1); ok(g.flags.has('fire:alive') && g.count('stick') === 0 && g.fireBase === 3, '마른 가지 셋: 불 살아남');
ok(g.hungerMul === 1 && vis('npc_hana2') && vis('npc_old'), '따뜻해짐, 사람들 그대로 있음'); await new Promise((r) => setTimeout(r, 30)); { const h = g.story.actors.hana2; ok(h.path && h.state === 'walk', '하나가 불로 걸어간다'); for (let i = 0; i < 400; i++) g.story.tick(0.05); ok(!h.path && Math.hypot(h.obj.position.x + 6, h.obj.position.z - 3) < 2.6, '하나 불 곁 도착'); }
use('npc_hana2'); ok(says.at(-1).includes('따뜻'), '하나: 불 곁 대사');
await new Promise((r) => setTimeout(r, 1400)); ok(g.flags.has('journal:fire'), '📔 불');
use('fire_1'); ok(panel && panel.b.length === 3, '불: 굽기·횃불·쬐기'); pick(0); ok(g.has('cooked') && g.count('meat') === 0, '고기 굽기');
g.tapItem('cooked'); ok(g.flags.has('eat:cooked') && !g.has('cooked'), '익힌 고기 먹기');
g.tick(0.01); ok(g._mission.includes('물이 들어온다'), '미션 18');
// ACT 9 — 폭우 → 거처 후보 3
const wait = (ms) => new Promise((r) => setTimeout(r, ms)); await wait(200);
ok(g.flags.has('act9') && g.story.rainOn === false && g.hungerMul === 1, '비 왔다 그침 → act9');
ok(vis('site_river') && vis('site_rock') && vis('site_high') && !vis('npc_hana2') && vis('npc_nuri5'), '후보 3 + 사람들 낮 자리');
use('npc_nuri5'); ok(says.at(-1).includes('세 곳'), '누리: 세 곳');
use('site_rock'); ok(panel && panel.b.length === 2, '후보 선택'); pick(0); ok(!g.flags.has('home:done') && says.at(-1).includes('다른 곳도'), '다 보기 전엔 못 정함');
ok(g.flags.has('seen:site:rock'), '바위 그늘 봄'); use('site_river'); pick(1); use('site_high'); pick(1); ok(g.flags.has('seen:site:river') && g.flags.has('seen:site:high'), '세 곳 봄');
g.tick(0.01); ok(g._mission.includes('어디로 옮길까'), '미션 20');
use('site_high'); pick(0); ok(g.flags.has('home:high') && !g.has('hide') && vis('shelter_high') && !vis('shelter_river') && !vis('site_river'), '높은 평지로: 가죽 걸고 거처');
// ACT 10 — 익숙해진 삶
await wait(200); ok(g.flags.has('act10') && vis('herdc_1'), '며칠 지남 → act10, 사슴 제자리');
use('stick_4'); ok(g.has('stick'), '가지'); use('fire_1'); ok(g.flags.has('routine:fire') && !g.has('stick'), '불 돌보기');
use('bush_a1_1'); ok(g.flags.has('routine:berry'), '열매 따기 익숙');
use('herdc_1'); ok(g.flags.has('routine:herd') && says.at(-1).includes('계속 살면'), '여기서 계속 살면 되겠네');
// ACT 11 — 사라진 사슴
await wait(200); ok(g.flags.has('act11') && !vis('herdc_1') && vis('track_9') && vis('npc_aru7'), '어느 날: 사슴 없음, 오래된 발자국');
use('bush_a1_2'); ok(says.at(-1).includes('거의 없다'), '열매 줄음'); use('root_2'); ok(g.has('root') && says.at(-1).includes('작다'), '뿌리 작음');
use('track_9'); ok(g.flags.has('seen:old2'), '오래된 것뿐'); use('npc_aru7'); use('npc_hana4'); ok(says.at(-1).includes('줄고 있어'), '하나: 먹을 것이 줄고 있어');
// ACT 12 — 떠나야 한다
await wait(200); ok(g.flags.has('act12') && vis('npc_nuri6') && vis('scout_up') && !vis('npc_bara'), '밤 회의 → act12');
use('npc_nuri6'); ok(says.at(-1).includes('세 쪽'), '누리: 세 쪽'); use('fire_1'); ok(says.at(-1).includes('어디로'), '불: 회의');
use('scout_up'); use('scout_mt'); use('scout_tr'); await wait(100); ok(g.flags.has('scout:all'), '정찰 3');
use('npc_nuri6'); ok(panel && panel.b.length === 3, '방향 선택 3'); pick(2); ok(g.flags.has('go:decided') && !vis('scout_up'), '방향 정함');
use('shelter_high'); ok(panel && panel.b.length === 1 && panel.h.includes('다 두고 가'), '우리가 만든 건 다 두고 가?'); pick(0);
ok(g.flags.has('leave:ready'), '떠난다'); await wait(1400); ok(g.flags.has('journal:move'), '📔 이동생활');
// ACT 13~14 — 컷신: 카드 → 확인 → 유적 → 이름
await wait(100); let guard = 0; while (panel && guard++ < 10 && !g.flags.has('era1:done')) { const h = panel.h; pick(0); await wait(30); }
ok(g.results.filter((r) => r.id.startsWith('d')).length === 2, '발굴 확인 2문항(열린 1 + 증거 고르기 1)');
ok(g.flags.has('era1:review') && g.results.filter((r) => r.id.startsWith('rv:')).length === 6, '시대 정리: 발견 5 되짚기 + 열린 1');
ok(g.flags.has('era1:done'), '구석기 시대 이름 공개 → era1:done');
g.tick(0.01); ok(g._mission.includes('완주'), '미션 끝');
await wait(2000); ok(panel && panel.h.includes('구석기 시대'), '끝 화면: PART I');
ok(g.story.journalHtml().includes('채집') && g.story.journalHtml().includes('긁개') && g.story.journalHtml().includes('불'), '탐험일지 5편');
// 저장·재개 — 스냅샷 → 비우기 → 적용
{ const { Save } = await import('../core/save.js'); const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  const sv = new Save(g, 'story-p1'); sv.write(); const snap = sv.load(); ok(snap && snap.flags.length === g.flags.size && snap.results.length === 8, '저장 스냅샷');
  const n0 = g.flags.size; g.flags.clear(); g.inventory.length = 0; for (const ev of g.world.events) ev.done = false;
  sv.apply(snap); ok(g.flags.size === n0 && g.world.events.every((ev) => ev.done || !g.cond(ev.on)) && g.results.length === 8, '재개: 깃발·사건·결과 복원'); g.tick(0.01); ok(g._mission.includes('완주'), '재개 뒤 미션 상태 그대로');
  sv.clear(); ok(!sv.load(), '처음부터 = 저장 지움'); }

// 위험층 — 밤·불 밖·횃불 없음 → 눈 → 쓰러짐(체크포인트) / 횃불 / 큰 짐승(가만히 있으면 간다)
{ const { Danger } = await import('../core/danger.js'); g.danger = new Danger(g, g.world.danger); g.fire = { visible: true, position: { x: -6, z: 3 }, scale: new THREE.Vector3(1, 1, 1) }; g.fireBase = 3; g.story.nightOn = true; g.story.skyName = 'night';
  g.checkpoint = { act: 'act12', flags: [...g.flags].filter((f) => !f.startsWith('era1')), inventory: [...g.inventory] };
  g.checkpoint.inventory.push('berry', 'berry', 'root', 'meat'); const cpFood = g.checkpoint.inventory.filter((k) => ['berry','root','meat','cooked'].includes(k)).length; g.p.pos.set(20, 0, 30); const n0 = g.flags.size;
  for (let i = 0; i < 60; i++) g.danger.tick(0.1); ok(g.danger.eyesOn === true && !g.danger.collapsing, '밤 불 밖 6초: 눈이 보인다');
  g.p.pos.set(-5, 0, 4); for (let i = 0; i < 40; i++) g.danger.tick(0.1); ok(!g.danger.eyesOn, '불 곁으로 오면 물러간다');
  g.p.pos.set(20, 0, 30); for (let i = 0; i < 150; i++) g.danger.tick(0.1); await new Promise((r) => setTimeout(r, 50));
  ok(!g.flags.has('era1:done') && g.flags.size < n0 && g.hunger >= 22 && Math.abs(g.p.pos.x + 4.5) < 0.1, '쓰러짐 → 체크포인트로, 불 곁에서 눈 뜸'); ok(g.inventory.filter((k) => ['berry','root','meat','cooked'].includes(k)).length === cpFood - Math.floor(cpFood / 2), '먹을 것 절반');
  ok(g.telemetry.collapsed?.[0]?.reason === 'night', '계측: 쓰러짐 원인');
  g.danger.lightTorch(); g.p.pos.set(20, 0, 30); g.danger.t = 0; for (let i = 0; i < 100; i++) g.danger.tick(0.1); ok(!g.danger.eyesOn && !g.danger.collapsing, '횃불이 있으면 안 온다');
  g.danger.torchUntil = 0; g.story.nightOn = false; g.p.pos.set(36, 0, 10); g.p.moving = false; for (let i = 0; i < 200; i++) g.danger.tick(0.1); ok(g.danger.enc && g.danger.eyesOn, '큰 짐승 자리에 오래 있으면 만난다');
  for (let i = 0; i < 80; i++) g.danger.tick(0.1); ok(!g.danger.enc && g.flags.has('beast:met'), '가만히 있으면 물러난다');
}

console.log(`story-p1 loop: ${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
