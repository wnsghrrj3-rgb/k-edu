// 긴장·설렘 층(10-16) — 쫓김·급한 일·살아 있는 마을·숨은 것: 엔진 흐름 + 조선 전기 데이터 연결
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }) }), body: { appendChild() {} }, head: { appendChild() {} } };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
globalThis.performance ??= { now: () => Date.now() };
const { Pulse } = await import('../core/pulse.js'); const { Story } = await import('../core/story.js'); const { Life } = await import('../core/life.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// ---- 데이터: 조선 전기 pulse ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/life.json'), 'utf8'));
const P = w.pulse; ok(P && P.chases?.length === 1 && P.deadlines?.length === 1 && P.routines?.length >= 5 && P.secrets?.length === 3, '조선 전기: 쫓김 1·급한 일 1·일과 5+·숨은 것 3');
const ch = P.chases[0]; ok(w.areas[ch.from] && w.areas[ch.goal_at] && ch.caughtHurt in lf.hurts, '쫓김: from·goal 이 구역이고 흔적이 hurts 에 있다');
const dl = P.deadlines[0]; const im = lf.situations.find((s) => s.id === 'imjin'); ok(im && im.choices.some((c) => c.done === dl.failFlag), '급한 일: 늦으면 서는 깃발을 받는 선택지가 있다(imjin:late)');
ok(P.routines.every((r) => w.areas[r.day] && w.areas[r.night]), '일과: 낮·밤 자리가 전부 구역 이름');
ok(P.secrets.every((s) => w.areas[s.at] && s.heirloom && (!s.journal || w.journal[s.journal])), '숨은 것: 자리·물려줄 것·탐험일지 키');
const npcs = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/npcs.json'), 'utf8')); ok(P.routines.every((r) => npcs[r.actor]), '일과 사람이 전부 npcs.json 에 있다');
// ---- 엔진 ----
const areas = new Map(); for (const [k, v] of [['gwana', [-30, 2]], ['sanjung', [-80, -84]], ['haengrang', [0, -20]], ['jumak', [4, 6]], ['choga', [30, 10]], ['bongsu', [40, 40]], ['naru', [9, 93]], ['seodang', [-32, 35]]]) areas.set(k, new THREE.Vector3(v[0], 0, v[1]));
const inter = new Map(); const added = []; const e = { interactables: inter, areas, onFrame: [], groundY: () => 0, spawn: new THREE.Vector3(), scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); }, traverse() {} }, removeInteractable: (k) => inter.delete(k) };
const said = []; const g = { e, p: { pos: new THREE.Vector3(0, 0, -20), yaw: 0, moving: false, enabled: true }, flags: new Set(), inventory: [], world: { ...w, events: [] }, era: 'joseon-life', ui: { say: (t) => said.push(t), setGoal() {}, open(h, b) { g.lastOpen = { h, b }; }, close() {}, isOpen: () => false }, sound: { play() {}, thump() {} }, renderInv() {}, updateMission() {}, save: { touch() {} }, results: [] };
g.cond = (x) => g.life ? g.life.cond(x) : true; g.flag = (f) => { for (const x of [].concat(f)) g.flags.add(x); g.story.onFlag(); g.life.onFlag(); g.pulse.onFlag(); };
g.story = new Story(g, { add: [] }); g.story.apply(); g.story.fast = true; g.life = new Life(g, lf); g.life.abil = { 눈: 2, 손: 2, 발: 2, 배: 2, 몸: 2 }; g.life.mixed = []; g.pulse = new Pulse(g, P);
const run = (sec, step = 0.1) => { for (let t = 0; t < sec; t += step) { g.pulse.tick(step); g.story.tick(step); } };
// 1) 쫓김: 깃발 → 포졸이 나타나 달려온다 → 멈춰 있으면 잡힌다 → 흔적 + escape:caught
g.flags.add('status:solgeo'); g.flag('escape:run');
ok(!!g.pulse.chase && inter.has('npc_chaser_escape'), '쫓김: escape:run 에 포졸이 나타난다');
const o = g.pulse.chase.actor.obj; const d0 = Math.hypot(o.position.x - g.p.pos.x, o.position.z - g.p.pos.z); run(2); const d1 = Math.hypot(o.position.x - g.p.pos.x, o.position.z - g.p.pos.z);
ok(d1 < d0 - 3, `포졸이 달려온다 ${d0.toFixed(1)} → ${d1.toFixed(1)}`); ok(g.pulse.level > 0.3, '긴장이 올라간다(심장·붉은 가장자리)');
run(12); await sleep(1500); ok(!g.pulse.chase && g.flags.has('escape:caught') && g.life.hurt.has('leg'), '서 있으면 잡힌다 → escape:caught + 절뚝이는 다리'); ok(!inter.has('npc_chaser_escape'), '잡은 뒤 포졸은 사라진다');
// 2) 쫓김: 숨는 자리에 먼저 닿아 가만히 → 놓친다 → escape:free
g.flags.delete('escape:caught'); g.flags.delete('chase:escape'); g.life.hurt.clear(); g.p.pos.set(0, 0, -20); g.pulse.onFlag(); ok(!!g.pulse.chase, '다시 쫓긴다');
g.p.pos.set(-80, 0, -84); g.p.moving = false; run(5.5); await sleep(1400); ok(!g.pulse.chase && g.flags.has('escape:free') && !g.life.hurt.size, '숯가마 뒤에서 숨을 죽이면 놓친다 → escape:free, 흔적 없음');
// 3) 급한 일: 상황이 열리면 모래시계, 시간 안에 못 정하면 imjin:late 가 서고 life 가 그 선택지로 끝낸다
g.flags.delete('status:solgeo'); g.flags.add('status:yangban'); g.flag('sit:imjin:open'); ok(!!g.pulse.deadline && g.pulse.deadline.left === 75, '임진왜란: 75초 모래시계');
run(80, 0.5); ok(!g.pulse.deadline && g.flags.has('imjin:late'), '시간이 다 가면 imjin:late');
g.life.opened.add('imjin'); g.life.resolve(im); ok(g.life.done.has('imjin') && g.life.hurt.has('wound') && g.life.values.heart === -0 || g.life.values.heart <= 0, '늦은 선택지로 끝난다(상처 흔적·인심 -2)');
g.flags.delete('deadline:imjin'); g.flags.delete('imjin:late'); g.flags.delete('sit:imjin:open'); g.pulse.onFlag(); g.flag('sit:imjin:open'); g.flags.add('sit:imjin:done'); g.pulse.onFlag(); ok(!g.pulse.deadline, '정하면 모래시계가 조용히 걷힌다');
// 4) 일과: 사람이 낮엔 장터 밥집, 밤엔 초가로 걸어간다(GLB 사람도 배우로 감싼다)
const jumo = new THREE.Group(); jumo.position.set(4, 0, 6); inter.set('npc_jumo', { obj: jumo, box: new THREE.Box3(), center: new THREE.Vector3(), name: 'npc_jumo' });
g.story.isNight = true; run(3); ok(g.pulse.actorOf('jumo').path, '밤이 되면 주모가 집으로 걷기 시작한다'); run(40); ok(Math.hypot(jumo.position.x - 30, jumo.position.z - 10) < 3, `주모가 초가에 닿았다 (${jumo.position.x.toFixed(1)}, ${jumo.position.z.toFixed(1)})`);
g.story.isNight = false; run(40); ok(Math.hypot(jumo.position.x - 4, jumo.position.z - 6) < 4, '낮이 되면 밥집으로 돌아온다');
// 5) 숨은 것: 반짝임이 서고, 닿으면 카드·값·물려줄 것
ok(g.pulse.secrets.length === 3, '숨은 것 셋이 서 있다'); g.p.pos.set(46, 0, 35); run(1); ok(g.lastOpen?.h.includes('녹슨 화살촉') && g.flags.has('secret:arrow'), '봉수대 돌 틈에 닿으면 카드');
ok(g.life.values.craft >= 1 && Pulse.heirlooms().some((h) => h.id === 'arrow'), '솜씨 +1 · 물려줄 것에 화살촉이 적힌다'); g.lastOpen.b[0].onClick(); ok(g.flags.has('found:arrow'), '챙기면 found:arrow');
// 6) 저장·재개
const snap = g.pulse.snapshot(); ok(snap.chase === null && snap.deadline === null, '저장: 쫓김·모래시계 없음이면 null');
// 9) 통짜 GLB 사람(뼈대·관절 없음)은 걸을 때 들썩이고 기울었다가, 서면 제자리로(미끄러짐 가림)
{ const { Actor } = await import('../core/actor.js'); const obj = new THREE.Object3D(); const a = new Actor(g, 'sway_t', obj); a.goTo([0, 30]);
  let bob = 0, tilt = 0; for (let i = 0; i < 40; i++) { a.tick(0.05); bob = Math.max(bob, obj.position.y); tilt = Math.max(tilt, Math.abs(obj.rotation.z)); }
  ok(a.path && bob > 0.02 && bob <= 0.046 && tilt > 0.015 && tilt <= 0.036, `걷는 동안 들썩임 ${bob.toFixed(3)}·기울기 ${tilt.toFixed(3)}`);
  for (let i = 0; i < 400; i++) a.tick(0.1); ok(!a.path && obj.position.y === 0 && obj.rotation.z === 0 && obj.position.z === 30, '도착해 서면 높이·기울기 0 으로 돌아온다');
  const m = new THREE.Object3D(); const b = new Actor(g, 'sway_m', m); b.mixer = { update() {} }; b.goTo([0, 10]); for (let i = 0; i < 20; i++) b.tick(0.05); ok(m.rotation.z === 0, '뼈대 있는 GLB 는 흔들림을 안 얹는다(동작 클립이 한다)'); }
// 10) 마주침: 일과 사람 둘이 길에서 만나면 둘 다 멈춰 마주 보고 한마디, 2.4초 뒤 걷던 길을 잇는다 — 같은 둘은 90초 안엔 다시 안 함
{ const nb = new THREE.Group(); nb.position.set(4, 0, 20); inter.set('npc_nongbu', { obj: nb, box: new THREE.Box3(), center: new THREE.Vector3(), name: 'npc_nongbu' }); g.npcs = { jumo: { name: '주모(상민)' }, nongbu: { name: '농부(상민)' } };
  g.story.isNight = false; run(45); const A = g.pulse.actorOf('jumo'), B = g.pulse.actorOf('nongbu'); ok(!g.pulse.meet, '시작: 마주침 없음'); jumo.position.set(4, 0, 6); A.path = null; said.length = 0; g.p.pos.set(4, 0, 22);
  A.goTo([4, 40]); run(11); ok(g.pulse.meet && g.pulse.meet.who.includes(A) && g.pulse.meet.who.includes(B), `주모가 농부 1.9m 안에 들자 마주침이 선다 (z ${jumo.position.z.toFixed(1)})`); ok(!A.path && !B.path && A.state === 'idle', '둘 다 멈춰 선다(걷던 길은 접어 둔다)');
  ok(Math.abs(A.turnTo - Math.atan2(nb.position.x - jumo.position.x, nb.position.z - jumo.position.z)) < 0.01, '서로를 보도록 돈다'); ok(said.some((t) => t.startsWith('👥 주모·농부 — 「')), `한마디가 「👥 주모·농부 — …」 로 뜬다(괄호 신분 뗌): ${said.find((t) => t.startsWith('👥')) || '없음'}`); ok(P.greet.some((l) => said.some((t) => t.startsWith('👥') && t.endsWith(`「${l}」`))), '한마디는 시대 데이터 pulse.greet 에서 고른다');
  const zStop = jumo.position.z; run(1); ok(jumo.position.z === zStop && g.pulse.meet, '서 있는 동안엔 안 움직인다'); run(2); ok(!g.pulse.meet && A.path && A.state === 'walk', '2.4초 뒤 걷던 길을 그대로 잇는다'); run(10); ok(A.path?.to.z === 40 && jumo.position.z > 28, `원래 가던 곳으로 계속 간다 (z ${jumo.position.z.toFixed(1)})`); run(14);
  said.length = 0; nb.position.set(4, 0, 30); A.path = null; jumo.position.set(4, 0, 6); A.goTo([4, 40]); run(12); ok(!g.pulse.meet && !said.some((t) => t.startsWith('👥')), '같은 둘은 90초 안엔 다시 안 멈춘다'); run(100);
  said.length = 0; g.p.pos.set(80, 0, 80); A.path = null; jumo.position.set(4, 0, 6); nb.position.set(4, 0, 20); A.goTo([4, 40]); run(11); ok(g.pulse.meet && !said.some((t) => t.startsWith('👥')), '내가 14m 밖이면 멈추긴 해도 한마디는 안 들린다'); run(30);
  ok(g.pulse.nameOf('jumo') === '주모' && g.pulse.nameOf('없는사람') === '없는사람', 'nameOf: 괄호 뗌·모르면 id'); }
console.log(`\n긴장·설렘 층: ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
