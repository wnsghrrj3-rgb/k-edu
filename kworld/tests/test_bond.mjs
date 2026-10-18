// 운명의 사람이 세상에 있다(10-19, core/bond.js) — 열한 시대 데이터(이름·옷·한마디) + 엔진(만나면 나와 따라옴·벗이면 더 가까이·등지면 물러섬·끝에 떠남·재개는 조용히·?bond=0)
// + 77: 말 걸기(E — 한마디·물건 주기·등진 사람은 안 닿음) · 벗이 쫓김에 끼어듦(앞을 막아 3초, 한 번) · 조건 토큰 bond:1
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
globalThis.performance ??= { now: () => Date.now() };
const { Bond } = await import('../core/bond.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const b = w.spark?.bond;
  ok(b && b.name && typeof b.look?.cloth === 'number' && ['met', 'friend', 'enemy'].every((k) => b.lines?.[k]?.length >= 2 && b.lines[k].every((t) => t.includes(b.name.replace(/이$/, '')))), `${era}: 운명의 사람 ${b?.name} — 옷 색·관계마다 한마디 둘(이름이 들어 있다)`);
  ok(w.spark.surprises.find((s) => s.id === 'bond1')?.ways[0].then.flag === 'bond:met', `${era}: 만남 카드 첫 길이 bond:met 를 세운다(그때 몸이 나온다)`);
}
// ---- 엔진 ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
function mk(flags = [], restoring = false) {
  const added = []; const said = [];
  const g = { e: { scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); } }, groundY: () => 0 }, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, enabled: true, moving: false }, flags: new Set(flags), restoring, ui: { say: (t) => said.push(t), isOpen: () => false }, sound: { play() {} }, story: { skyName: 'day' }, friends: { myWaveUntil: 0 } };
  g.inventory = []; g.items = { items: { stone: { name: '돌', icon: '🪨' }, berry: { name: '열매', icon: '🫐' } } }; g.take = (k) => { const i = g.inventory.indexOf(k); if (i >= 0) g.inventory.splice(i, 1); }; g.renderInv = () => {}; g.panels = [];
  g.ui.open = (html, buttons) => { g.panels.push({ html, buttons }); g.ui._open = true; }; g.ui.close = () => { g.ui._open = false; }; g.ui.isOpen = () => !!g.ui._open;
  g.bond = new Bond(g, w.spark.bond); g.flag = (f) => { g.flags.add(f); g.bond.onFlag(); }; g.added = added; g.said = said; return g;
}
const run = (g, sec, step = 0.1) => { for (let t = 0; t < sec; t += step) g.bond.tick(step); };
const d = (g) => Math.hypot(g.bond.pos.x - g.p.pos.x, g.bond.pos.z - g.p.pos.z);
// 1) 아직 안 만났으면 없다 → 만나면 나온다(손 흔들기·첫 줄) → 따라온다
let g = mk(); run(g, 2); ok(g.added.length === 0 && g.bond.state() === null, '만나기 전엔 몸이 없다');
g.flag('bond:met'); ok(g.added.length === 1 && g.flags.has('bond:here') && g.said.some((t) => t.includes('흰돌') && t.includes('같이 가')) && g.bond.waveUntil > performance.now(), 'bond:met → 몸 하나 + 이름 첫 줄 + 손 흔들기');
ok(Math.abs(d(g) - 7) < 0.01, '플레이어 앞 7m 에 선다');
run(g, 3); ok(d(g) <= 3.45 && d(g) > 3.2, `서 있으면 3.4m 까지 와서 멈춘다(${d(g).toFixed(2)})`);
g.p.pos.set(30, 0, 0); const d0 = d(g); run(g, 0.5); ok(d(g) < d0 - 2.5 && g.bond.walk > 0, '멀어지면 뛰어온다(9m 밖이면 달리기 6.2, 걸음 동작 시간이 쌓인다)');
run(g, 8); ok(d(g) <= 3.45, '따라잡아 다시 곁에 선다');
// 2) 벗 → 더 가까이, 내가 손 흔들면 같이
g.flag('bond:friend'); run(g, 4); ok(d(g) <= 2.45 && d(g) > 2.2, `벗이면 2.4m(${d(g).toFixed(2)})`);
const t0 = performance.now(); g.friends.myWaveUntil = t0 + 1600; g.bond.waveUntil = 0; run(g, 0.2); ok(g.bond.waveUntil > t0, '내가 손을 흔들면(G) 같이 흔든다');
// 3) 한마디 — 55초에 한 번, 관계 줄에서
g.said.length = 0; run(g, 60); ok(g.said.filter((t) => t.startsWith('👤 흰돌 —')).length === 1 && w.spark.bond.lines.friend.some((l) => g.said[0].includes(l)), '곁에서 55초에 한 줄, 벗 줄에서');
g.said.length = 0; g.story.skyName = 'night'; run(g, 14); ok(g.said.length === 1, '하늘이 바뀌면 곧(12초 안에) 새 한마디');
// 4) 벗은 끝나도 곁에
g.flag('bond:end'); run(g, 2); ok(g.added.length === 1 && g.bond.state() === 'friend', '벗은 bond:end 뒤에도 곁에 남는다');
// 5) 등진 사람 — 따라오지 않고 물러선다, 끝나면 떠난다
g = mk(['bond:met']); run(g, 0.2); ok(g.added.length === 1 && g.said.length === 0 && g.bond.waveUntil === 0, '첫 틱에 이미 만나 있었으면(재개) 조용히 선다');
run(g, 3); g.flag('bond:enemy'); g.said.length = 0; run(g, 1); ok(g.said.some((t) => t.includes('등을 돌렸다')) && d(g) > 3.4, '등지면 「등을 돌렸다」 한 줄 + 다가가 있던 자리에서 물러난다');
run(g, 6); const far = d(g); g.p.pos.set(-40, 0, 0); run(g, 6); ok(d(g) < 60 && d(g) >= 11, `아주 멀어지면 멀찍이(11m) 따라는 온다(${d(g).toFixed(1)})`);
g.p.pos.set(g.bond.pos.x + 2, 0, g.bond.pos.z); run(g, 3); ok(d(g) > 4.5, `다가가면 물러난다(${d(g).toFixed(1)})`);
g.said.length = 0; g.p.pos.set(g.bond.pos.x + 8, 0, g.bond.pos.z); run(g, 60); ok(g.said.some((t) => w.spark.bond.lines.enemy.some((l) => t.includes(l))), '등진 사람 줄에서 한마디');
g.flag('bond:end'); ok(g.added.length === 0 && !g.flags.has('bond:here') && g.said.some((t) => t.includes('떠났다')), '등지고 끝나면 떠난다(몸 사라짐·bond:here 내림)');
// 6) 재개 중엔 안 선다
g = mk(['bond:met'], true); run(g, 1); ok(g.added.length === 0, 'restoring 중엔 몸을 안 세운다');
// 8) 말 걸기(E) — 곁 3.2m 안이면 prompt·talk, 한마디 + 물건 주기
g = mk(['bond:met']); run(g, 4); ok(g.bond.canTalk() && g.bond.prompt().verb === '말을 건다', '곁(3.8m)에 서면 「말을 건다」 prompt');
g.inventory.push('stone', 'stone', 'berry'); g.bond.talk(); let pn = g.panels.at(-1); ok(g.ui.isOpen() && g.p.enabled === false && pn.html.includes('흰돌') && pn.buttons[0].label === '「같이 갈래?」' && pn.buttons.some((b) => b.label.includes('돌 준다')) && pn.buttons.some((b) => b.label.includes('열매 준다')) && pn.buttons.at(-1).label === '그냥 간다', '말 걸기 판: 이름·한마디·「같이 갈래?」·주머니 물건별 「준다」·그냥 간다');
pn.buttons.find((b) => b.label.includes('돌 준다')).onClick(); ok(!g.ui.isOpen() && g.p.enabled && g.inventory.filter((k) => k === 'stone').length === 1 && g.flags.has('bond:gave') && g.flags.has('bond:gave:stone') && g.said.at(-1).includes('받았다'), '돌을 주면 주머니에서 하나 빠지고 bond:gave:stone + 「받았다」');
g.flag('bond:friend'); g.bond.talk(); pn = g.panels.at(-1); ok(pn.buttons[0].label === '「같이 가자.」', '벗이면 첫 단추 「같이 가자.」'); pn.buttons[0].onClick(); ok(g.flags.has('bond:talked') && g.said.at(-1).includes('어디든'), '「같이 가자」 → bond:talked + 답');
ok(g.bond.withMe() === true, '벗이 곁(5m) → withMe() = bond:1 참'); g.p.pos.set(40, 0, 0); ok(g.bond.withMe() === false, '멀면 bond:1 거짓'); g.p.pos.set(g.bond.pos.x + 1, 0, g.bond.pos.z);
g.flags.add('bond:enemy'); g.said.length = 0; const np = g.panels.length; g.bond.talk(); ok(g.panels.length === np && g.said[0].includes('말이 닿지 않는다') && g.flags.has('bond:tried'), '등진 사람에겐 판이 안 열리고 「말이 닿지 않는다」 + bond:tried');
// 9) 벗이 쫓김에 끼어든다 — 쫓는 사람에게 달려가 앞을 막으면 pulse.hold(3) + bond:blocked, 한 쫓김에 한 번, 끝나면 다시 따라온다
g = mk(['bond:met', 'bond:friend']); run(g, 4); const chaser = { position: new THREE.Vector3(-30, 0, 0) }; let held = 0; g.pulse = { chase: { c: { id: 'esc' }, actor: { obj: chaser } }, hold: (s) => { held = s; } };
run(g, 0.5); const dc = () => Math.hypot(chaser.position.x - g.bond.pos.x, chaser.position.z - g.bond.pos.z); ok(dc() < 28 && g.bond.walk > 0, `쫓김이 서면 벗이 쫓는 사람 쪽으로 달려간다(${dc().toFixed(1)}m)`);
run(g, 6); ok(held === 3 && g.pulse.chase.bondBlocked && g.flags.has('bond:blocked') && g.flags.has('bond:blocked:esc') && g.said.some((t) => t.includes('앞을 막았다')) && dc() <= 2.3, '닿으면 hold(3)·bondBlocked·bond:blocked·「앞을 막았다 — 뛰어!」');
const bx = g.bond.pos.x; run(g, 2); ok(Math.abs(g.bond.pos.x - bx) < 0.01, '막는 3초 동안은 그 자리에 선다');
g.bond.block.until = 0; run(g, 8); ok(d(g) <= 2.45 && held === 3, '막은 뒤엔 다시 곁으로 돌아온다, 같은 쫓김에 두 번 막지 않는다');
g.pulse.chase = null; run(g, 1); ok(g.bond.block === null, '쫓김이 끝나면 끼어듦 상태가 지워진다');
// 10) pulse.hold / life.cond bond:n / game.cond bond:n
const pj = fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8'); ok(/hold\(sec\)/.test(pj) && /holdUntil > performance\.now\(\)/.test(pj), 'pulse.js — hold(sec) + 쫓는 사람 멈춤');
const lj = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'); ok(/bond:\\d\+\$\/\.test\(f\)/.test(lj) && /withMe/.test(lj), 'life.cond — bond:n 토큰(withMe)');
// 7) game.js 연결
const gj = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8'); ok(/import \{ Bond \}/.test(gj) && /get\('bond'\) !== '0'/.test(gj) && /this\.bond\.onFlag\(\)/.test(gj) && /this\.bond\.tick\(dt\)/.test(gj) && /this\.bond\?\.canTalk\(\)\) return this\.bond\.talk\(\)/.test(gj) && /this\.bond\.prompt\(\)/.test(gj) && /\^bond:\\d\+\$/.test(gj), 'game.js — 생성(?bond=0 끔)·onFlag·tick·E 말 걸기·prompt·cond bond:n');
console.log(`\n운명의 사람(bond): ${pass}/${pass + fail} 통과`); if (fail) process.exit(1);
