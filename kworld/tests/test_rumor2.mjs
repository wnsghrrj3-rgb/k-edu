// 소문 층 ②(119) — ① 벗이 소문을 먼저 귀띔(bond.rumoring: 전조가 들릴 차례인데 24초 동안 아무도 말해 주지 않으면 「들었어? …」 한 번, 깃발은 사람 입과 같음)
// ② 나침반 밑 「👂 자리 — 미리 … · 미리 해 둘 수 있다」(life.prepHint — items.targets 의 prep rename 이 지금 조건에 맞을 때만, 열리거나 미리 하면 사라짐)
// ③ 「그 뒤」 카드 👂 한 줄(life.earLine — 먼저 들은 집·앞서 선 횟수·미리 한 일 / 하나도 못 들었으면 「소문은 지나쳤다」)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
globalThis.performance ??= { now: () => Date.now() };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
const { Bond } = await import('../core/bond.js'); const { Spark } = await import('../core/spark.js'); const { Life } = await import('../core/life.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const J = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f + '.json'), 'utf8'));
const condOf = (flags) => (expr) => !expr || expr.split('&&').every((p) => { p = p.trim(); if (!p) return true; const neg = p.startsWith('!'); const t = neg ? p.slice(1) : p; let v; if (t.startsWith('val:')) v = false; else v = flags.has(t); return neg ? !v : v; });

// ---- 데이터: 열한 시대 — 소문 규칙의 flag 가 전부 rumor:<X>:heard, prep rename 의 if 에 그 소문 깃발이 든다(벗 귀띔 → 나침반 밑 한 줄로 이어진다) ----
for (const era of ERAS) {
  const w = J(era, 'world'), it = J(era, 'items'); const rm = (w.spark?.gaze?.rules || []).filter((r) => r.id.startsWith('rm_'));
  ok(rm.length && rm.every((r) => /^rumor:[^:]+:heard$/.test(r.flag)), `${era}: 소문 ${rm.length}줄 전부 flag rumor:<X>:heard(벗 귀띔이 같은 깃발을 세운다)`);
  const preps = []; for (const [k, def] of Object.entries(it.targets || {})) for (const r of def.rename || []) if (/rumor:\w+:heard/.test(r.if || '') && /prep/.test(r.flag || '')) preps.push({ k, def, r });
  ok(preps.length === 1 && preps[0].def.name && preps[0].r.verb?.includes('미리') && rm.some((x) => (preps[0].r.if || '').includes(x.flag)), `${era}: 미리 하기 자리 하나(${preps[0]?.def.name}) — 그 소문 깃발을 본다 · 동사에 「미리」`);
}

// ---- 엔진 ① 벗 귀띔 ----
const w = J('joseon-life', 'world');
function mk(flags = []) {
  const said = []; const F = new Set(flags);
  const g = { e: { scene: { add() {}, remove() {} }, groundY: () => 0, interactables: new Map(), areas: new Map() }, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, enabled: true, moving: false }, flags: F, restoring: false, ui: { say: (t) => said.push(t), isOpen: () => false, setGoal() {} }, sound: { play() {} }, story: { skyName: 'day' }, friends: { myWaveUntil: 0 }, inventory: [], items: { items: {} }, life: { values: { heart: 2 }, hurt: new Set(), log: [] }, panels: [] };
  g.cond = condOf(F); g.ui.open = () => {}; g.ui.close = () => {};
  g.spark = new Spark(g, w.spark); g.bond = new Bond(g, w.spark.bond); g.flag = (f) => { for (const x of [].concat(f)) g.flags.add(x); g.bond.onFlag(); }; g.said = said; return g;
}
const run = (g, sec, step = 0.1) => { for (let t = 0; t < sec; t += step) g.bond.tick(step); };
const name = w.spark.bond.name;
let g = mk(['bond:met', 'bond:friend', 'sit:sahwa:open']); run(g, 2); g.said.length = 0;
run(g, 12); ok(!g.said.some((t) => t.includes('들었어?')), '사화가 열려 임진 소문이 떠돌아도 12초 안엔 벗이 말하지 않는다(사람 입이 먼저)');
run(g, 16); const r1 = g.said.filter((t) => t.includes('들었어?')); const rm = w.spark.gaze.rules.filter((r) => r.id.startsWith('rm_imjin_'));
ok(r1.length === 1 && r1[0].startsWith(`👤 ${name} — 「들었어? `) && rm.some((r) => r1[0].includes(r.text)), `24초 지나면 벗이 「들었어? …」 — 임진 소문 한 줄(${r1[0]?.slice(0, 40)}…)`);
ok(g.flags.has('rumor:imjin:heard') && g.flags.has('bond:rumor:imjin') && g.flags.has('bond:rumor') && rm.some((r) => g.flags.has('gaze:said:' + r.id)), '깃발 = 사람 입으로 들은 것과 같다(rumor:imjin:heard) + bond:rumor:imjin + 그 규칙 gaze:said');
g.said.length = 0; run(g, 90); ok(!g.said.some((t) => t.includes('들었어?')), '같은 소문은 다시 안 한다(둘째 줄도 안 함)');
g.flags.add('sit:imjin:open'); g.said.length = 0; run(g, 40); const r2 = g.said.filter((t) => t.includes('들었어?'));
ok(r2.length === 1 && w.spark.gaze.rules.filter((r) => r.id.startsWith('rm_horan_')).some((r) => r2[0].includes(r.text)) && g.flags.has('rumor:horan:heard'), '임진왜란이 열리면 다음(병자호란) 소문을 또 한 번');
// 사람 입으로 먼저 들었으면 벗은 말 안 함
g = mk(['bond:met', 'bond:friend', 'sit:sahwa:open', 'rumor:imjin:heard']); run(g, 40); ok(!g.said.some((t) => t.includes('들었어?')), '마을 사람에게 이미 들었으면(rumor:imjin:heard) 벗은 말하지 않는다');
// 벗이 아니면(met) 안 함
g = mk(['bond:met', 'sit:sahwa:open']); run(g, 40); ok(!g.said.some((t) => t.includes('들었어?')), '아직 벗이 아니면(met) 귀띔하지 않는다');
// 급한 일·쫓김·짐승 앞·카드 열림·멀면 미룬다
g = mk(['bond:met', 'bond:friend', 'sit:sahwa:open']); g.pulse = { deadline: { d: { id: 'x' } } }; run(g, 40); ok(!g.said.some((t) => t.includes('들었어?')), '급한 일 중엔 미룬다');
g.pulse = null; g.beasts = { cur: { kind: 'tiger', obj: { position: { x: 5, z: 5 } } } }; run(g, 10); g.beasts = null; ok(!g.said.some((t) => t.includes('들었어?')), '짐승 앞에선 미룬다');
g.p.pos.set(40, 0, 0); run(g, 1.2); ok(!g.said.some((t) => t.includes('들었어?')) && Math.hypot(g.bond.pos.x - 40, g.bond.pos.z) > 6, '멀리 있으면(6m 밖) 미룬다');
g.p.pos.set(g.bond.pos.x, 0, g.bond.pos.z); run(g, 8); ok(g.said.some((t) => t.includes('들었어?')), '곁으로 돌아오면 바로 귀띔(기다린 시간은 쌓여 있었다)');
// 소문 없는 세계(spark 없음) → 조용히
g = mk(['bond:met', 'bond:friend', 'sit:sahwa:open']); g.spark = null; run(g, 40); ok(!g.said.some((t) => t.includes('들었어?')) && g.bond.rumorT === null, 'spark 가 없으면 아무 일 없음');
// cfg.rumorWait 로 시대 데이터가 기다림을 바꿀 수 있다
g = mk(['bond:met', 'bond:friend', 'sit:sahwa:open']); g.bond.cfg = { ...g.bond.cfg, rumorWait: 5 }; run(g, 2); g.said.length = 0; run(g, 8); ok(g.said.some((t) => t.includes('들었어?')), 'cfg.rumorWait 5 → 8초 안에 귀띔');

// ---- 엔진 ② 나침반 밑 한 줄 ----
const it = J('joseon-life', 'items');
function mkLife(flags = []) { const F = new Set(flags); const subs = []; const g = { flags: F, cond: condOf(F), items: it, world: w, ui: { setGoalSub: (t) => subs.push(t) } }; const L = Object.create(Life.prototype); L.g = g; L.subs = subs; return L; }
let L = mkLife(['status:yangban', 'sit:sahwa:open']); L.prepHint(); ok(L.subs.length === 0, '소문을 못 들었으면 나침반 밑 한 줄 없음(설정 호출 없음)');
L.g.flags.add('rumor:imjin:heard'); L.prepHint(); ok(L.subs.length === 1 && L.subs[0].startsWith('👂 숯가마 옆 숨는 자리 — 곡식을 미리 산속에 묻어 둔다') && L.subs[0].endsWith('미리 해 둘 수 있다') && !L.g.flags.has('prep:hint'), `들으면 「${L.subs[0]}」`);
L.prepHint(); ok(L.subs.length === 1, '같은 글이면 다시 안 보낸다');
L.g.flags.add('prep:imjin'); L.prepHint(); ok(L.subs.length === 2 && L.subs[1] === '', '미리 해 두면 사라진다');
L = mkLife(['status:solgeo', 'sit:sahwa:open', 'rumor:imjin:heard']); L.prepHint(); ok(L.subs.length === 0, '그 집이 할 수 없는 미리 하기(양반만)는 뜨지 않는다 — 조건은 데이터 그대로');
L = mkLife(['status:yangban', 'sit:sahwa:open', 'rumor:imjin:heard', 'sit:imjin:open']); L.prepHint(); ok(L.subs.length === 0, '사건이 열리면 뜨지 않는다');
L = mkLife(['status:yangban', 'rumor:imjin:heard']); L.g.ui = {}; L.prepHint(); ok(L.subs.length === 0, 'setGoalSub 없는 화면(시험 ui)에선 아무 일 없음');

// ---- 엔진 ③ 「그 뒤」 👂 한 줄 ----
const ear = (flags) => { const l = mkLife(flags); return l.earLine(); };
ok(ear([]).startsWith('소문은 지나쳤다') && ear([]).includes('살아남았다'), `하나도 못 들었으면 「${ear([])}」`);
ok(ear(['rumor:corvee:heard']) === '먼저 들은 집 — 떠도는 말을 1번 먼저 들었다. 소식을 먼저 아는 집이 살아남았다.', '한 번 들음 — 앞서 선 것·미리 한 것 없음');
const e3 = ear(['rumor:corvee:heard', 'rumor:imjin:heard', 'rumor:imjin:used', 'prep:imjin', 'bond:rumor:imjin', 'rumor:horan:used:x']);
ok(e3 === '먼저 들은 집 — 떠도는 말을 2번 먼저 들었다, 그래서 1번은 남보다 앞서 섰다. 미리 해 둔 일 1가지. 소식을 먼저 아는 집이 살아남았다.', `들음 2·앞섬 1·미리 1 → 「${e3}」(bond:rumor·엉뚱한 꼴 깃발은 안 센다)`);
{ const l = mkLife(['rumor:x:heard']); l.g.world = { spark: { gaze: { rules: [] } } }; ok(l.earLine() === '', '소문 데이터가 없는 세계면 빈 줄(카드에 안 붙는다)'); }

console.log(`\n${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
