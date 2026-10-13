// 섞여 나오는 상황 +4(10-13) 시험 — 데이터 전수(열한 시대 44: 자리·q·done 깃발이 NPC/대상에서 실제로 세워지는지·신분/나라 조건 id 실재·회색 이유) + 구석기 고리(깊은 숲 큰 발자국: 상황 열림 → 대상 선택 → 결과 카드 → 복습 📜).
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// ---------- 데이터 전수 ----------
const NEW = { life: ['oldfire', 'smoke_far', 'bigtrack', 'longnight'], neo: ['acornfall', 'reedroof', 'lowland', 'farvillage'], 'bronze-life': ['gatewatch', 'tin', 'charcoal', 'plot'], 'gojoseon-life': ['fieldeye', 'towerduty', 'hanplain', 'tributeroad'],
  'samguk-life': ['waboat', 'deepwoods', 'oxplow', 'law'], 'silla-life': ['ministerdoor', 'bigpaddy', 'hojokgate', 'northford'], 'goryeo-life': ['templeland', 'fordwork', 'charwoods', 'hyangdo'], 'joseon-life': ['market', 'wellside', 'ferry', 'halfshare'],
  'joseon-late-life': ['peddler', 'clerkbook', 'gatein', 'gwangjak'], 'gaehang-life': ['ricemill', 'church', 'jpstreet', 'tenantfight'], 'daehan-life': ['school2', 'clinic', 'busroad', 'dmz'] };
const bad = []; let n = 0;
for (const [era, ids] of Object.entries(NEW)) {
  const d = JSON.parse(fs.readFileSync(`${base}/../${era}/life.json`, 'utf8')), w = JSON.parse(fs.readFileSync(`${base}/../${era}/world.json`, 'utf8')), npcs = JSON.parse(fs.readFileSync(`${base}/../${era}/npcs.json`, 'utf8')), items = JSON.parse(fs.readFileSync(`${base}/../${era}/items.json`, 'utf8'));
  const statusIds = new Set((d.status?.rules || []).map((r) => r.id)), nationIds = new Set((d.nation?.rules || []).map((r) => r.id)), areaIds = new Set(Object.keys(w.areas || {}));
  // NPC 대사·대상 rename 이 세우는 깃발 전부
  const flags = new Set(); const addc = (c) => { if (c.flag) flags.add(c.flag); if (c.rollFailFlag) flags.add(c.rollFailFlag); };
  for (const npc of Object.values(npcs)) for (const l of npc.lines || []) for (const c of l.choices || []) addc(c);
  for (const t of Object.values(items.targets || {})) for (const r of t.rename || []) for (const c of r.choices || []) addc(c);
  const checkIf = (expr, where) => { if (!expr) return; for (const tok of expr.replace(/[()!]/g, ' ').split(/&&|\|\|/)) { const t = tok.trim(); if (!t) continue; if (t.startsWith('status:') && !statusIds.has(t.slice(7))) bad.push(`${era}:${where}:status ${t}`); if (t.startsWith('nation:') && !nationIds.has(t.slice(7))) bad.push(`${era}:${where}:nation ${t}`); if (t.startsWith('val:') && !/^val:\w+(>=|<=|>|<|=)\d+$/.test(t)) bad.push(`${era}:${where}:val ${t}`); } };
  for (const id of ids) {
    const s = d.situations.find((x) => x.id === id); if (!s) { bad.push(`${era}:${id}:없음`); continue; } n++;
    if (s.must) bad.push(`${era}:${id}:must`); if (!areaIds.has(s.place)) bad.push(`${era}:${id}:place ${s.place}`);
    if (!s.q || s.q.a?.length !== 3 || new Set(s.q.a).size !== 3 || !s.q.revisit) bad.push(`${era}:${id}:q`);
    if (!s.ways?.length || !s.body?.length) bad.push(`${era}:${id}:ways/body`);
    const cids = new Set(); for (const c of s.choices) { if (cids.has(c.id)) bad.push(`${era}:${id}:choice id 겹침 ${c.id}`); cids.add(c.id); if (!c.done) bad.push(`${era}:${id}:${c.id}:done 없음`); else if (!flags.has(c.done)) bad.push(`${era}:${id}:${c.id}:깃발 ${c.done} 을 세우는 자리 없음`); if (!c.fact) bad.push(`${era}:${id}:${c.id}:fact`); if (c.status && !statusIds.has(c.status)) bad.push(`${era}:${id}:${c.id}:status ${c.status}`); if (c.hurt && !(d.hurts || {})[c.hurt]) bad.push(`${era}:${id}:${c.id}:hurt ${c.hurt}`); }
    checkIf(s.if, id);
    if (s.choices.some((c) => c.fact) && !w.journal?.[s.choices[0].journal]) bad.push(`${era}:${id}:journal ${s.choices[0].journal}`);
  }
  // 그 시대 NPC/대상의 새 선택지: if 조건 id 실재 + if 있으면 gray 이유
  for (const [nid, npc] of Object.entries(npcs)) for (const l of npc.lines || []) { if (!ids.some((id) => (l.if || '').startsWith(`sit:${id}:open`))) continue; for (const c of l.choices || []) { checkIf(c.if, nid + '/' + c.label); if (c.if && !c.gray) bad.push(`${era}:${nid}:${c.label}:gray 없음`); if (c.roll && !['눈', '손', '발', '배', '몸'].includes(c.roll.ab)) bad.push(`${era}:${nid}:${c.label}:roll ab`); } }
  for (const [typ, t] of Object.entries(items.targets || {})) for (const r of t.rename || []) { if (!ids.some((id) => (r.if || '').startsWith(`sit:${id}:open`))) continue; if (r.once !== false) bad.push(`${era}:${typ}:rename once`); for (const c of r.choices || []) { checkIf(c.if, typ + '/' + c.label); if (c.if && !c.gray) bad.push(`${era}:${typ}:${c.label}:gray 없음`); } }
}
ok(n === 44, `새 상황 수 ${n}`); ok(!bad.length, '데이터 전수 OK ' + bad.slice(0, 12).join(' | '));
// ---------- 구석기 고리: 깊은 숲 큰 발자국 ----------
const g = new Game(base);
[g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
g.era = 'life'; g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
const says = []; let panel = null; const panels = [];
g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!panel, close() { panel = null; },
  whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { says.push('NPC:' + t); cb(); }, open: (h, b) => { panel = { h, b }; panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 20), yaw: 0 };
const ix = new Map();
const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() {}, position: new THREE.Vector3(), rotation: {} } }); };
['fire_1', 'npc_fire', 'stone_1', 'track_1', 'scratch_1', 'shelter_1', 'view_1'].forEach(mk);
const areas = new Map(Object.entries({ camp: [0, 20], river: [0, 6], meadow: [12, -46], deep: [66, -58], shelter: [-40, 16], hill: [62, 80] }).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
g.setFire = () => {};
g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
g.life = new Life(g, J('life'));
g.character = g.world.characters.find((c) => c.id === 'eye'); g.sex = { id: 'm' };
g.life.seed = 3; g.life.mixed = ['bigtrack', 'oldfire', 'smoke_far', 'longnight']; g.life.begin();
const use = (name) => { g.target = ix.get(name); g.act(); };
const pick = (label) => { const b = panel.b.find((x) => x.label.startsWith(label)); if (!b) { console.log('버튼 없음', label, panel.b.map((x) => x.label)); fail++; return; } panel = null; b.onClick(); };
const closeCard = () => { while (panel) { const b = panel.b[0]; panel = null; b.onClick(); } };
const drain = async () => { for (let i = 0; i < 3; i++) { closeCard(); await settle(); } };
const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
const settle = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const opened = (id) => g.flags.has('sit:' + id + ':open'), done = (id) => g.flags.has('sit:' + id + ':done');
Math.random = () => 0.01;
goTo('deep'); ok(!opened('bigtrack'), '돌 상황 전엔 큰 발자국이 안 열린다');
g.flags.add('sit:stone:done'); goTo('deep'); await settle(); ok(opened('bigtrack') && panel && panel.h.includes('큰 것의 자리'), '깊은 숲에 닿으면 큰 발자국 상황 카드'); await drain();
use('track_1'); ok(panel && panel.b.length === 3 && panel.b.some((b) => b.label.includes('굴까지')), '큰 발자국 — 선택 셋(rename)'); ok(!panel.b.find((b) => b.label.includes('굴까지')).disabled, '다리 성하면 굴 길 열림');
pick('자국을 읽고'); await settle(); ok(done('bigtrack') && g.flags.has('sit:bigtrack:read') && g.life.values.heart >= 1, '읽고 돌아감 → 상황 끝, 인심 +1 ' + g.life.values.heart); await drain();
ok(g.life.log.some((l) => l.sit === 'bigtrack' && l.choice === 'read'), 'log 에 남음(복습 📜 재료)');
// 실패 갈래: 다리 흔적 → 다음 판엔 굴 길이 회색
g.life.injure('leg'); use('track_1'); ok(panel && panel.b.length === 1 && panel.b[0].label.includes('살펴보기') || !panel || panel.b.every((b) => !b.label.includes('굴까지') || b.disabled), '상황이 끝났으면 rename 이 걷힌다'); await drain();
// 다른 셋: 자리에 닿으면 열림
g.flags.add('sit:fire:done'); goTo('shelter'); await settle(); ok(opened('oldfire'), '바위 그늘 — 먼저 살던 자리 열림'); await drain(); use('shelter_1'); ok(panel && panel.b.some((b) => b.label.includes('깨진 돌')), '바위 그늘 선택'); pick('본다'); await drain(); ok(done('oldfire'), '본다 → 끝');
g.flags.add('sit:hunt:done'); goTo('hill'); await settle(); ok(opened('smoke_far'), '높은 언덕 — 연기 열림'); await drain(); use('view_1'); pick('가지를 태워'); await drain(); ok(done('smoke_far') && g.life.values.heart >= 3, '연기 답 → 인심 +2');
g.flags.add('sit:share:done'); goTo('camp'); await settle(); ok(opened('longnight'), '긴 밤 열림'); await drain(); use('fire_1'); ok(panel && panel.b.some((b) => b.label.includes('손짓')), '불가 선택'); pick('끝까지'); await settle(); ok(done('longnight'), '듣기 → 끝');
console.log(`mixed4 ${pass}/${fail}`); if (fail) process.exit(1);
