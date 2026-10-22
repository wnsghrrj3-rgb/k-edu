// 청동기 큰 사건 「칼은 곡식으로 — 마을이 안다」(sword 깊이기) — 값 부르기(제자만 회색) · 숨기기 ⚠ 성공 → 칼을 숨긴 집 / 실패 → 들킨 집(곡식 -3) · 급한 일 실패 → 만든 손이 잊힌 집 · 그 뒤 우리 집 규칙.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = { 'kworld_carry:neo': JSON.stringify({ craft: 2, heart: 2, grain: 0 }) };
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
  ['fire_1', 'mold_1', 'npc_chief', 'npc_smith', 'granary_1'].forEach(mkI);
  const areas = new Map(Object.entries({ village: [0, 0], valley: [66, 6], tin: [86, -10], woods: [-52, 60] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; }
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'm' };
  g.life.seed = 3; g.life.mixed = ['salt', 'mirror', 'caught', 'smoke']; g.life.begin();
  // 앞 상황 여섯은 끝난 것으로
  for (const id of ['rice', 'granary']) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); }
  for (const id of g.life.mixed) { g.life.opened.add(id); g.life.done.add(id); }
  g.flags.add('day:forge'); g.flags.add('smith:ask');
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
const dl = w.pulse.deadlines.find((d) => d.id === 'sword'); ok(dl && dl.sec === 75 && dl.failFlag === 'sword:late' && dl.on.includes('made:sword'), '급한 일 「칼 — 마을이 안다」 75초 · 칼이 나오면');
const st = J('life').situations.find((s) => s.id === 'sword'); ok(['price', 'hide', 'caught', 'late'].every((id) => st.choices.some((c) => c.id === id && c.done === 'sword:' + id)) && st.choices.every((c) => c.fact && !/\d{3,4}/.test(c.fact)), '길 넷 추가·fact 전부·연도 없음');
const mg = J('life').situations.find((s) => s.id === 'merge'); ok(mg.choices.every((c) => { const ids = c.then.find((t) => t.end).end.branches.map((b) => b.id); return ids.length === 10 && ids.indexOf('sword_caught') < ids.indexOf('limp') && ids.indexOf('rite') < ids.indexOf('sword_caught'); }), '끝 갈림 10 — 모임 갈림 → 칼 셋 → 절뚝');
const rules = w.bridge.beats[1].rules; ok(['life:sword_caught', 'life:sword_hidden'].every((k) => rules.some((r) => r.if === k)) && !rules.at(-1).if, '그 뒤 우리 집 규칙 둘');
const give = (g) => { for (const it of ['copper', 'copper', 'tin', 'charcoal']) g.give(it); };
// 판 1 — 제자 아님·곡식 0 → 내가 찬다 회색·값 부르기 회색 · 숨기기 성공 → 칼을 숨긴 집
{ const { g, S, use, pick, closeCard, goTo, btn } = mk();
  goTo('valley'); ok(opened(g, 'sword') && S.panel?.h.includes('마을이 안다'), '칼 상황 카드'); closeCard();
  give(g); goTo('village'); use('fire_1'); ok(g.has('sword') && g.flags.has('made:sword'), '청동을 부었다');
  use('npc_chief'); ok(btn('내 곳간이')?.disabled && btn('장인으로서')?.disabled && !btn('우두머리에게')?.disabled && !btn('안 나왔다고')?.disabled, '곡식 0: 내가 찬다·값 부르기 회색 / 바친다·숨기기 열림');
  pick('안 나왔다고'); ok(done(g, 'sword') && g.flags.has('sword:hide') && g.has('sword'), '숨겼다(눈 굴림 성공) — 칼은 그대로 손에'); closeCard();
  ok(g.life.values.heart === 0, '인심 -1 (1→0)');
  for (const id of ['water', 'dolmen', 'famine']) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); }
  g.flags.add('merge:on'); goTo('village'); closeCard(); g.flag('merge:back'); closeCard(); await settle();
  ok(g.flags.has('life:end') && g.flags.has('life:sword_hidden') && S.panels.at(-1).includes('칼을 숨긴 집'), '끝: 칼을 숨긴 집'); }
// 판 2 — 숨기다 들킴(굴림 실패) → 곡식 -3 → 들킨 집
{ const { g, S, use, pick, closeCard, goTo } = mk();
  goTo('valley'); closeCard(); give(g); goTo('village'); use('fire_1'); g.life.values.grain = 3; g.life.values.heart = 2;
  Math.random = () => 0.99; use('npc_chief'); pick('안 나왔다고'); Math.random = () => 0.01;
  ok(done(g, 'sword') && g.flags.has('sword:caught') && !g.flags.has('sword:hide'), '눈이 흔들렸다 → 들킴'); closeCard();
  ok(g.life.values.grain === 0 && g.life.values.heart === 0, '곡식 3→0 · 인심 2→0');
  for (const id of ['water', 'dolmen', 'famine']) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); }
  g.flags.add('merge:on'); goTo('village'); closeCard(); g.flag('merge:back'); closeCard(); await settle();
  ok(g.flags.has('life:sword_caught') && S.panels.at(-1).includes('들킨 집'), '끝: 칼을 숨기다 들킨 집'); }
// 판 3 — 제자(smith:learn) → 값을 부른다 → 곡식 +2 · 솜씨 +2
{ const { g, use, pick, closeCard, goTo, btn } = mk();
  g.flags.add('smith:learn'); goTo('valley'); closeCard(); give(g); goTo('village'); use('fire_1'); const c0 = g.life.values.craft;
  use('npc_chief'); ok(!btn('장인으로서')?.disabled, '제자 → 값 부르기 열림'); pick('장인으로서');
  ok(done(g, 'sword') && g.flags.has('sword:price') && !g.has('sword') && g.life.values.grain === 2 && g.life.values.craft === c0 + 2, '값 — 칼은 큰 집으로, 곡식 2·솜씨 +2'); closeCard(); }
// 판 4 — 급한 일 실패(sword:late) → 만든 손이 잊힌 집
{ const { g, S, use, closeCard, goTo } = mk();
  goTo('valley'); closeCard(); give(g); goTo('village'); use('fire_1'); g.flag('sword:late');
  ok(done(g, 'sword') && g.flags.has('sit:sword:late'), '머뭇거리는 사이 사람이 왔다'); closeCard();
  for (const id of ['water', 'dolmen', 'famine']) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); }
  g.flags.add('merge:on'); goTo('village'); closeCard(); g.flag('merge:back'); closeCard(); await settle();
  ok(g.flags.has('life:sword_late') && S.panels.at(-1).includes('잊힌 집'), '끝: 만든 손이 잊힌 집'); }
console.log(`bronze 고리 4(칼은 곡식으로): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
