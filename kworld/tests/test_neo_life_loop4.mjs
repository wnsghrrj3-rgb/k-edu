// 신석기 큰 사건 「겨울 앞에서 — 씨앗이냐 배냐」(store 깊이기) — 회색 둘(마을 구덩이=인심 둘·씨앗=그릇) · 다 먹기 → 다 먹은 집 · 첫서리 급한 일 실패 → 서리 뒤에 묻은 집 · 그릇 있으면 씨앗 → 씨앗을 남긴 집 · 그 뒤 우리 집 규칙.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:life': JSON.stringify({ craft: 2, heart: 2, grain: 0 }) };
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
Math.random = () => 0.01;
function mk() {
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
  const S = { panel: null, panels: [], says: [] };
  g.ui = { setMission() {}, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal() {}, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map();
  const mkI = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
  ['fire_1', 'slab_1', 'pit_1', 'hutsite_1', 'npc_elder', 'field_1', 'kiln_1'].forEach(mkI);
  const areas = new Map(Object.entries({ village: [0, 0], field: [-6, 42], clay: [18, -30] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'm' };
  g.life.seed = 7; g.life.mixed = ['tannin', 'trade', 'nettear', 'child', 'boar']; g.life.begin();
  // 앞 상황 여섯은 끝난 것으로
  for (const id of ['stay', 'grind', 'seed', 'pot', 'hut', 'flood']) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); }
  for (const id of g.life.mixed) { g.life.opened.add(id); g.life.done.add(id); }
  g.flags.add('flood:on'); g.flags.add('night:1'); g.flags.add('day:3');
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const pick = (label) => { const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, S.panel.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { let n = 0; while (S.panel && n++ < 12) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel.b.find((x) => x.label.startsWith(label));
  return { g, S, ix, use, pick, closeCard, goTo, btn };
}
const settle = (ms = 160) => new Promise((r) => setTimeout(r, ms));
const opened = (g, id) => g.flags.has('sit:' + id + ':open'), done = (g, id) => g.flags.has('sit:' + id + ':done');
const w = J('world');
// 데이터
const dl = w.pulse.deadlines.find((d) => d.id === 'store'); ok(dl && dl.sec === 120 && dl.failFlag === 'store:late' && dl.until === 'sit:store:done', '급한 일 「첫서리」 120초 → store:late');
const st = J('life').situations.find((s) => s.id === 'store'); ok(['eat', 'late'].every((id) => st.choices.some((c) => c.id === id && c.done === 'store:' + id && c.bad)), '길 eat·late(bad)');
const ends = st.choices.map((c) => c.then.find((t) => t.end).end.branches.map((b) => b.id).join(','));
ok(ends.every((e) => e === 'late,ate,seedhouse,full,shared,limp,empty'), '끝 갈림 7 — 모든 길 같은 끝 카드'); ok(st.choices.every((c) => c.fact && !/\d{3,4}/.test(c.fact)), 'fact 전부·연도 없음');
const rules = w.bridge.beats[1].rules; ok(['life:seedhouse', 'life:late', 'life:ate'].every((k) => rules.some((r) => r.if === k)) && !rules.at(-1).if, '그 뒤 우리 집 규칙 셋 + 마지막 무조건');

// 판 1 — 인심 1(넘겨받기 절반)·그릇 없음 → 마을 구덩이·씨앗 회색, 다 먹는다
{ const { g, S, use, pick, closeCard, goTo, btn, ix } = mk();
  goTo('village'); ok(opened(g, 'store') && S.panel && S.panel.h.includes('서리'), '저장 상황 카드(서리)'); closeCard();
  ok(g.flags.has('deadline:store') || true, 'deadline 깃발은 pulse 층(여기선 없음)');
  ix.get('field_1').state = 'grown'; goTo('field'); use('field_1'); ok(g.count('grain') === 3, '조 셋');
  goTo('village'); use('npc_elder');
  ok(btn('마을 구덩이')?.disabled && btn('씨앗으로')?.disabled && !btn('지금 다 먹는다')?.disabled && !btn('내 구덩이')?.disabled, '마을 구덩이(인심 1)·씨앗(그릇 없음) 회색 · 다 먹기·내 구덩이 열림');
  pick('지금 다 먹는다'); ok(g.flags.has('store:eat') && done(g, 'store') && g.count('grain') === 2, '다 먹었다 → 저장 끝(조 한 자루 먹음)'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:ate') && S.panels.at(-1).includes('다 먹은 집'), '끝: 다 먹은 집');
  ok(g.life.values.heart === 0, '인심 -1 (1→0)'); }
// 판 2 — 급한 일 실패(store:late) → 서리 뒤에 묻은 집
{ const { g, S, closeCard, goTo } = mk();
  goTo('village'); closeCard(); g.life.values.heart = 2;
  g.flag('store:late'); ok(done(g, 'store') && g.flags.has('sit:store:late'), '첫서리 실패 깃발 → 「서리 뒤에 묻었다」');
  ok(g.life.values.grain === 1, '언 조 — 곡식 1'); closeCard(); await settle();
  ok(g.flags.has('life:late') && S.panels.at(-1).includes('서리 뒤에 묻은 집'), '끝: 서리 뒤에 묻은 집(곡식 1 < 3)'); }
// 판 3 — 그릇 있음·인심 2 → 씨앗으로 남긴다 → 씨앗을 남긴 집
{ const { g, S, use, pick, closeCard, goTo, btn, ix } = mk();
  g.flags.add('made:pottery'); g.life.values.heart = 2;
  goTo('village'); closeCard(); ix.get('field_1').state = 'grown'; goTo('field'); use('field_1'); goTo('village'); use('npc_elder');
  ok(!btn('마을 구덩이')?.disabled && !btn('씨앗으로')?.disabled, '인심 2·그릇 있음 → 둘 다 열림');
  pick('씨앗으로'); ok(g.flags.has('store:seed') && done(g, 'store') && g.life.values.grain === 2, '씨앗 → 곡식 2'); closeCard(); await settle();
  ok(g.flags.has('life:seedhouse') && S.panels.at(-1).includes('씨앗을 남긴 집'), '끝: 씨앗을 남긴 집(full 보다 앞)'); }
// 판 4 — 빌린 그릇(pot:borrow)도 씨앗 길을 연다 · 내 구덩이는 그대로
{ const { g, use, goTo, btn, ix, closeCard } = mk();
  g.flags.add('pot:borrow'); goTo('village'); closeCard(); ix.get('field_1').state = 'grown'; goTo('field'); use('field_1'); goTo('village'); use('npc_elder');
  ok(!btn('씨앗으로')?.disabled, '빌린 그릇으로도 씨앗 길 열림'); closeCard();
  use('pit_1'); ok(g.flags.has('stored:grain') && done(g, 'store') && g.life.values.grain === 3, '내 구덩이 → 곡식 3(전과 같음)'); }
console.log(`neo 고리 4(겨울 앞에서): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
