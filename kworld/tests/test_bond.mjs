// 운명의 사람이 세상에 있다(10-19, core/bond.js) — 열한 시대 데이터(이름·옷·한마디) + 엔진(만나면 나와 따라옴·벗이면 더 가까이·등지면 물러섬·끝에 떠남·재개는 조용히·?bond=0)
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
// 7) game.js 연결
const gj = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8'); ok(/import \{ Bond \}/.test(gj) && /get\('bond'\) !== '0'/.test(gj) && /this\.bond\.onFlag\(\)/.test(gj) && /this\.bond\.tick\(dt\)/.test(gj), 'game.js — 생성(?bond=0 끔)·onFlag·tick');
console.log(`\n운명의 사람(bond): ${pass}/${pass + fail} 통과`); if (fail) process.exit(1);
