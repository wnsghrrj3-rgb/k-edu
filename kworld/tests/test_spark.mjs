// 설렘·반응 층(10-16) — 마을의 눈·칭호·돌발·밤의 설렘: 열한 시대 데이터 전수 + 엔진 흐름(조선 전기)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
globalThis.performance ??= { now: () => Date.now() };
const { Spark } = await import('../core/spark.js'); const { Story } = await import('../core/story.js'); const { Life } = await import('../core/life.js'); const { Pulse } = await import('../core/pulse.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const ABIL = new Set(['눈', '손', '발', '배', '몸']);
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'life.json'), 'utf8')); const S = w.spark;
  const statusIds = new Set((lf.status?.rules || []).map((r) => r.id)); const hurts = new Set(Object.keys(lf.hurts || {}));
  const secretIds = (w.pulse?.secrets || []).map((s) => s.id); const esc = w.pulse?.chases?.[0]?.escapedFlag;
  ok(S && S.gaze && S.titles?.length >= 6 && S.surprises?.length >= 7 && S.starTitle && S.starSay, `${era}: 마을의 눈·칭호 6+·돌발 3·별똥별`);
  ok((S.gaze.rules || []).length >= 5 && S.gaze.rules.every((r) => r.id && r.if && r.text && r.once) && new Set(S.gaze.rules.map((r) => r.id)).size === S.gaze.rules.length, `${era}: 선택 뒤 반응 규칙 5+ (id·if·text·once)`);
  ok(S.gaze.rules.some((r) => r.if === esc) && S.gaze.rules.some((r) => r.if === w.pulse?.chases?.[0]?.caughtFlag) && S.gaze.rules.filter((r) => r.if.startsWith('sur:')).every((r) => S.surprises.some((x) => r.if.startsWith('sur:' + x.id + ':'))), `${era}: 규칙이 쫓김 탈출·잡힘·돌발 결과 깃발에 맞물린다`);
  ok(S.gaze.warm?.length >= 3 && S.gaze.cold?.length >= 3 && S.gaze.mark?.length >= 2 && S.gaze.gift, `${era}: 눈 — 따뜻·차가움·흔적 줄 + 쥐여 주는 것`);
  const tOn = S.titles.map((t) => t.on); ok(tOn.includes(esc) && tOn.includes(secretIds.map((s) => 'found:' + s).join(' && ')) && tOn.some((x) => x.startsWith('val:heart')) && tOn.some((x) => x.startsWith('val:craft')) && tOn.includes('hurt:leg'), `${era}: 칭호가 쫓김 탈출·숨은 것 셋·인심·솜씨·절뚝 깃발에 맞물린다`);
  ok(S.titles.filter((t) => t.on.startsWith('hurt:')).every((t) => hurts.has(t.on.slice(5)) && t.bitter), `${era}: 흔적 칭호는 hurts 에 있고 쓴 이름`);
  ok(new Set(S.titles.map((t) => t.id)).size === S.titles.length && new Set(S.surprises.map((s) => s.id)).size === S.surprises.length, `${era}: id 겹침 없음`);
  let w3 = true, rollOk = true, hurtOk = true, condOk = true, factOk = true;
  for (const s of S.surprises) { if (!s.fact || !s.title || !s.body?.length) factOk = false; if ((s.ways || []).length < 2 || s.ways.length > 3) w3 = false;
    for (const wy of s.ways) { if (wy.roll && (!ABIL.has(wy.roll.ab) || !wy.fail)) rollOk = false; for (const o of [wy.then, wy.fail]) if (o?.hurt && !hurts.has(o.hurt)) hurtOk = false;
      for (const tok of (wy.if || '').split(/&&|\|\|/)) { const f = tok.trim().replace(/^!/, ''); if (!f) continue; if (f.startsWith('status:')) { if (!statusIds.has(f.slice(7))) condOk = false; } else if (!f.startsWith('val:') && !f.startsWith('bond:') && !f.startsWith('sur:')) condOk = false; } } }
  ok(w3 && rollOk && hurtOk && condOk && factOk, `${era}: 돌발 — 길 2~3·굴림은 능력+실패 줄·흔적은 hurts·조건은 신분/값·📜 사실`);
  const B = ['bond1', 'bond2', 'bond3f', 'bond3e'].map((i) => S.surprises.find((x) => x.id === i)); ok(B.every(Boolean) && B[1].if === 'bond:met' && B[2].if === 'bond:friend' && B[3].if === 'bond:enemy' && B[0].ways[0].then.flag === 'bond:met' && B[1].ways[0].then.flag === 'bond:friend' && B[1].ways[0].fail?.flag === 'bond:enemy' && B[1].ways[1].then.flag === 'bond:enemy' && S.titles.some((t) => t.on === 'bond:friend') && S.titles.some((t) => t.on === 'bond:enemy' && t.bitter) && S.gaze.rules.some((r) => r.if === 'bond:friend'), `${era}: 운명의 사람 — 만남→갈림(벗/원수, 굴림 실패=원수)→끝 사슬 + 칭호 + 사람 반응`);
  ok(S.surprises.some((s) => s.night === true) && S.surprises.some((s) => !s.night), `${era}: 밤 돌발 하나 이상 + 낮 돌발`);
}
// ---- 엔진(조선 전기) ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/life.json'), 'utf8')); const npcs = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/npcs.json'), 'utf8'));
const areas = new Map(); areas.set('gwana', new THREE.Vector3(-30, 0, 2)); areas.set('sanjung', new THREE.Vector3(-80, 0, -84));
const inter = new Map(); const added = []; const e = { interactables: inter, areas, onFrame: [], groundY: () => 0, spawn: new THREE.Vector3(), scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); }, traverse() {} }, removeInteractable: (k) => inter.delete(k) };
const said = []; const opens = []; const g = { e, p: { pos: new THREE.Vector3(0, 0, -20), yaw: 0, moving: true, enabled: true }, flags: new Set(), inventory: [], world: { ...w, events: [] }, npcs, era: 'joseon-life', ui: { say: (t) => said.push(t), setGoal() {}, open(h, b) { g.lastOpen = { h, b }; opens.push(h); g.opened = true; }, close() { g.opened = false; }, isOpen: () => !!g.opened }, sound: { play() {}, thump() {} }, renderInv() {}, updateMission() {}, save: { touch() {} }, results: [] };
g.cond = (x) => g.life ? g.life.cond(x) : true; g.flag = (f) => { for (const x of [].concat(f)) g.flags.add(x); g.story.onFlag(); g.life.onFlag(); g.pulse?.onFlag(); g.spark.onFlag(); };
g.story = new Story(g, { add: [] }); g.story.apply(); g.story.fast = true; g.life = new Life(g, lf); g.life.abil = { 눈: 3, 손: 3, 발: 3, 배: 3, 몸: 3 }; g.life.mixed = []; g.spark = new Spark(g, w.spark);
const run = (sec, step = 0.5) => { for (let t = 0; t < sec; t += step) g.spark.tick(step); };
// 1) 칭호: 깃발이 서면 이름이 붙고 기기에 남는다
g.flag('escape:free'); ok(g.flags.has('title:free') && Spark.titles().some((t) => t.id === 'free' && t.era === 'joseon-life') && said.some((s) => s.includes('발소리를 떨군 사람')), '칭호: escape:free → 「발소리를 떨군 사람」 + kworld_titles');
g.life.add('heart', 6); run(2); ok(g.flags.has('title:warm'), '칭호: 인심 6 → 「호패가 필요 없는 집」(tick 에서도 본다)');
g.life.injure('leg'); run(2); ok(g.flags.has('title:leg') && Spark.titles().find((t) => t.id === 'leg').bitter, '칭호: 절뚝 → 쓴 이름(bitter)');
// 2) 마을의 눈: 사람 곁에 서면 한마디, 같은 하늘 아래 한 번만
inter.set('npc_jumo', { obj: { position: new THREE.Vector3(1.5, 0, -20) }, label: '주모' }); said.length = 0; run(1.5); 
ok(said.some((s) => s.startsWith('💬') && s.includes('주모')), '마을의 눈: 주모 곁 → 👀 한마디(인심 6 = 따뜻한 줄)'); const n1 = said.filter((s) => s.startsWith('💬')).length; run(5); ok(said.filter((s) => s.startsWith('💬')).length === n1, '같은 사람은 하늘이 바뀌기 전엔 다시 말하지 않는다');
g.story.skyName = 'night'; g.story.isNight = true; g.spark.lastGaze = 0; run(1.5); ok(said.filter((s) => s.startsWith('💬')).length === n1 + 1, '하늘이 바뀌면(밤) 다시 한마디');
g.life.values.heart = 0; g.life.log.push({}, {}); g.story.skyName = 'day'; g.story.isNight = false; g.spark.lastGaze = 0; said.length = 0; run(1.5); ok(said.some((s) => s.startsWith('💬')), '인심 0 → 차가운 줄');
// 2b) 선택 뒤 반응: 돌발·쫓김 깃발이 서면 그 일이 사람 입으로 — 한 번만
g.flags.add('sur:tiger:ok'); g.story.skyName = 'dusk'; g.spark.lastGaze = 0; said.length = 0; run(1.5); ok(said.some((s) => s.includes('호랑이 앞에서 안 뛰었다며')), '선택 뒤 반응: sur:tiger:ok → 「산길 호랑이 앞에서 안 뛰었다며」'); ok(g.flags.has('gaze:said:s1'), '한 번 말하면 gaze:said:<id>');
g.story.skyName = 'day'; g.spark.lastGaze = 0; said.length = 0; run(1.5); ok(!said.some((s) => s.includes('호랑이 앞에서')), '같은 반응은 두 번 안 온다(once)');
inter.delete('npc_jumo');
// 3) 돌발: 조용할 때 걷다 보면 느닷없이 카드 — 고르면 값·흔적, 한 번만
Math.random = () => 0.01; g.spark.sinceSur = 200; g.p.pos.set(50, 0, 50); run(3); ok(g.opened && opens[opens.length - 1].includes('⚡'), '돌발: 간격이 지나고 걷는 중이면 카드가 열린다'); const b = g.lastOpen.b; ok(b.length >= 2, '길 2~3');
const sid = [...g.flags].find((f) => f.startsWith('sur:') && !f.includes(':', 4)).slice(4); const S = w.spark.surprises.find((s) => s.id === sid); const h0 = g.life.values.heart;
const first = b.find((x) => !x.disabled); first.onClick(); ok(g.opened && opens[opens.length - 1].includes('📜'), '고르면 결과 카드 + 📜 실제'); g.lastOpen.b[0].onClick(); ok(!g.opened && (g.flags.has('sur:' + sid + ':ok') || g.flags.has('sur:' + sid + ':fail')), '닫으면 깃발 sur:<id>:ok|fail');
g.spark.sinceSur = 200; g.p.pos.set(-50, 0, 50); run(3); ok(!g.opened || !opens[opens.length - 1].includes(S.title), '같은 돌발은 두 번 안 온다'); if (g.opened) { g.lastOpen.b.find((x) => !x.disabled).onClick(); g.lastOpen.b[0].onClick(); }
g.spark.sinceSur = 200; g.p.moving = false; const n2 = opens.length; run(3); ok(opens.length === n2, '서 있으면 안 온다'); g.p.moving = true;
g.pulse = new Pulse(g, w.pulse); g.flags.delete('escape:free'); g.flags.delete('chase:escape'); g.flags.delete('escape:caught'); g.p.pos.set(0, 0, 0); g.pulse.onFlag(); if (!g.pulse.chase) { g.flags.add('escape:run'); g.pulse.onFlag(); }
g.spark.sinceSur = 200; g.p.pos.set(80, 0, 80); const n3 = opens.length; run(3); ok(opens.length === n3, '쫓기는 동안엔 돌발이 안 온다'); g.pulse.endChase(null);
// 3b) 운명의 사람: 만남 전엔 갈림이 안 오고, 깃발 뒤엔 온다
for (const id of ['bond2', 'bond3f', 'bond3e']) g.flags.delete('sur:' + id); g.flags.delete('bond:met');
ok(!w.spark.surprises.filter((s) => g.cond(s.if)).some((s) => s.id === 'bond2'), '운명의 사람: bond:met 전엔 갈림 카드가 후보에 없다'); g.flags.add('bond:met'); ok(w.spark.surprises.filter((s) => g.cond(s.if) && !g.flags.has('sur:' + s.id)).some((s) => s.id === 'bond2'), 'bond:met 뒤엔 후보에 든다');
Math.random = () => 0.01; g.spark.sinceSur = 200; g.p.pos.set(-90, 0, -90); g.spark.lastSurAt = null; opens.length = 0; let guard = 0; while (!g.flags.has('sur:bond2') && guard++ < 12) { if (g.opened) { g.lastOpen.b.find((x) => !x.disabled).onClick(); g.lastOpen.b[0].onClick(); } g.spark.sinceSur = 200; g.p.pos.x += 30; run(3); }
ok(g.flags.has('sur:bond2'), '갈림 카드가 열렸다'); const bw = w.spark.surprises.find((s) => s.id === 'bond2').ways[1]; g.spark.chooseSurprise(w.spark.surprises.find((s) => s.id === 'bond2'), bw); await sleep(400); g.lastOpen.b[0].onClick(); ok(g.flags.has('bond:enemy') && g.flags.has('title:enemy'), '외면 → bond:enemy + 쓴 칭호 「돌쇠와 등진 사람」');
// 4) 밤의 설렘: 밤이면 반딧불이, 별똥별 세 번이면 칭호
g.story.isNight = true; g.story.skyName = 'night'; run(1); ok(g.spark.ff && added.includes(g.spark.ff), '밤 → 반딧불이가 뜬다'); g.story.isNight = false; run(1); ok(!g.spark.ff, '낮 → 사라진다');
g.story.isNight = true; for (let i = 0; i < 3; i++) g.spark.shootStar(); ok(g.spark.stars === 3 && g.flags.has('title:stars') && said.some((s) => s.includes('밤하늘을 보는 사람')), '별똥별 셋 → 「밤하늘을 보는 사람」'); run(2); ok(!g.spark.shot, '별똥별은 1초 남짓이면 진다');
// 5) 족보 상자: 붙은 이름이 족보에 같이 내려간다
const { titlesHtml, carryRecord, bondOf, bondLine, jokboHtml } = await import('../core/jokbo.js');
// 6) 끝 카드·족보로: carryRecord 에 titles·bond, 족보 줄에 🏅·👤
const rec = carryRecord(g.life, { id: 'x' }); ok(rec.titles.some((t) => t.id === 'free') && rec.bond?.name === '돌쇠' && rec.bond.how === 'enemy', 'carryRecord 에 titles + bond(돌쇠·등짐)'); ok(bondLine(bondOf(g)) === '👤 돌쇠과 등졌다'.replace('돌쇠과', '돌쇠과') , 'bondLine'); const jh = jokboHtml({ title: 't', eras: [{ era: 'joseon-life', short: '조선 전기' }] }, [{ era: 'joseon-life', short: '조선 전기', kind: 'now', values: {}, titles: rec.titles, bond: rec.bond, heirlooms: [] }]); ok(jh.includes('🏅') && jh.includes('👤 돌쇠'), '족보 줄에 🏅 이름 + 👤 운명의 사람'); const th = titlesHtml([{ era: 'joseon-life', short: '조선 전기', kind: 'now' }]); ok(th.includes('발소리를 떨군 사람') && th.includes('🩹'), '족보: 🏅 붙은 이름 상자(쓴 이름은 🩹)');
console.log(`${pass} passed, ${fail} failed`); if (fail) process.exit(1);
