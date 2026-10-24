// 소문 층 ④(120) — ① 소문 번짐: 내가 떠도는 말을 들으면(사람 입 spark.pickGaze · 벗 bond.rumoring) 곁(14m) 반 친구 화면에 「👥 이름 — 「들었어? …」」 + 같은 차례면 깃발 rumor:<X>:heard(값 없음) · 멀면·이미 들었으면·내 차례 아니면·다른 시대 소문이면 없음 · 번진 소문은 다시 안 번짐
// ② 미리 한 집(prep:<X>)의 급한 일 막대 — 「⏳ 👂 제목」·prep 클래스·한마디 「미리 해 둔 것도 있다」, 시간은 그대로(+heardBonus 만)
import path from 'path'; import { fileURLToPath } from 'url'; import fs from 'node:fs';
import * as THREE from 'three';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.join(here, '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const tick = () => new Promise((r) => setTimeout(r, 5));
const J = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f + '.json'), 'utf8'));
const condOf = (flags) => (expr) => !expr || expr.split('&&').every((p) => { p = p.trim(); if (!p) return true; const neg = p.startsWith('!'); const t = neg ? p.slice(1) : p; const v = t.startsWith('val:') ? false : flags.has(t); return neg ? !v : v; });
// 가짜 버스 — 채널 이름이 같은 것끼리 브로드캐스트
const bus = {}; const mkDb = () => ({ channel(name) { const subs = (bus[name] ??= []); const ch = { name, handlers: [], on(kind, f, cb) { ch.handlers.push({ kind, ev: f.event, cb }); return ch; }, subscribe(cb) { subs.push(ch); cb('SUBSCRIBED'); return ch; }, track() { }, untrack() { }, unsubscribe() { const i = subs.indexOf(ch); if (i >= 0) subs.splice(i, 1); }, send(m) { for (const o of subs) if (o !== ch) for (const h of o.handlers) if (h.kind === 'broadcast' && h.ev === m.event) h.cb({ payload: m.payload }); } }; return ch; } });
let seatOf = null; globalThis.window = { KeduTier: { resolve: async () => seatOf, canSave: (t) => t?.tier === 'student' } }; globalThis.getKeduDb = () => mkDb();
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '', getContext: () => null }), body: { appendChild() {} }, head: { appendChild() {} } };
globalThis.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
globalThis.performance ??= { now: () => Date.now() }; globalThis.addEventListener ??= () => { };
const { resetSeat } = await import(path.join(root, 'core/save.js'));
const { Friends } = await import(path.join(root, 'core/friends.js'));
const { Spark } = await import(path.join(root, 'core/spark.js'));
const { Bond } = await import(path.join(root, 'core/bond.js'));
const { Pulse } = await import(path.join(root, 'core/pulse.js'));

const W = J('joseon-life', 'world'); const RM = W.spark.gaze.rules.filter((r) => r.id.startsWith('rm_imjin_')); ok(RM.length === 2, '조선 전기 임진 소문 두 줄');
function mkG(era, flags = []) {
  const F = new Set(flags); const said = [];
  const g = { era, world: W, character: { id: 'eye' }, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, moving: false, enabled: true }, flags: F, said, restoring: false, inventory: [], items: { items: {} }, panels: [],
    e: { onFrame: [], scene: { kids: [], add(o) { this.kids.push(o); }, remove(o) { const i = this.kids.indexOf(o); if (i >= 0) this.kids.splice(i, 1); } }, groundY: () => 0, interactables: new Map(), areas: new Map() },
    ui: { say: (t) => said.push(t), isOpen: () => false, setGoal() {}, open() {}, close() {} }, sound: { play() {} }, story: { skyName: 'day' }, life: { values: { heart: 2 }, hurt: new Set(), log: [] } };
  g.cond = condOf(F); g.spark = new Spark(g, W.spark); g.bond = new Bond(g, W.spark.bond); g.flag = (f) => { for (const x of [].concat(f)) g.flags.add(x); g.bond.onFlag(); }; return g;
}
async function pair(flagsA, flagsB, eraB = 'joseon-life') {
  seatOf = { tier: 'student', profile: { profile_id: 'stu-1', nickname: '3 김하늘', class_code_id: 'c1' } }; resetSeat();
  const gA = mkG('joseon-life', flagsA); const fA = new Friends(gA); gA.friends = fA; await fA.start(); await tick();
  seatOf = { tier: 'student', profile: { profile_id: 'stu-2', nickname: '7 박솔', class_code_id: 'c1' } }; resetSeat();
  const gB = mkG(eraB, flagsB); const fB = new Friends(gB); gB.friends = fB; await fB.start(); await tick();
  return { gA, fA, gB, fB };
}
const heardLine = (g) => g.said.find((t) => t.startsWith('👥 ') && t.includes('「들었어? '));

// ---- ① 사람 입으로 들은 소문이 곁 친구에게 번진다 ----
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], ['sit:sahwa:open']);
  ok(fA.on && fB.count() === 1 && fA.count() === 1, '두 학생이 같은 마을(조선 전기)에 서로 보인다');
  // A 가 사람 곁에서 소문을 듣는다(spark.pickGaze 가 rm_ 규칙을 고른다)
  const r = gA.spark.pickGaze({ rules: RM }, 'seonbi'); // 사람 곁 — 조건 맞는 임진 소문 둘 중 하나
  ok(r && /^rm_imjin_/.test(r.id) && gA.flags.has('rumor:imjin:heard'), `A 가 사람 입으로 임진 소문을 들었다(${r?.id})`);
  await tick();
  const l = heardLine(gB);
  ok(l && l.startsWith('👥 3 김하늘 — 「들었어? ') && l.includes(r.text), `B 화면에 「👥 3 김하늘 — 「들었어? …」」(${l?.slice(0, 44)}…)`);
  ok(gB.flags.has('rumor:imjin:heard') && gB.flags.has('friend:rumor') && gB.flags.has('friend:rumor:imjin') && gB.flags.has('gaze:said:' + r.id), 'B 에게도 깃발 rumor:imjin:heard + friend:rumor:imjin + 그 규칙 gaze:said(값은 안 바뀜)');
  // B 가 들은 것은 다시 번지지 않는다 → A 에겐 「들었어?」 줄이 없다
  ok(!heardLine(gA), '번진 소문은 다시 번지지 않는다(A 화면엔 「들었어?」 없음)');
  // B 의 벗도 이제 임진 소문은 안 한다(이미 들음)
  gB.flags.add('bond:met'); gB.flags.add('bond:friend'); gB.said.length = 0; for (let t = 0; t < 60; t += 0.1) gB.bond.tick(0.1);
  ok(!gB.said.some((t) => t.includes('들었어?')), 'B 의 벗은 이미 들은 임진 소문을 다시 귀띔하지 않는다');
  // 둘째 소문 줄(rm_imjin 다른 줄)을 A 가 또 들어도 B 는 이미 heard → 조용
  gB.said.length = 0; const r2 = RM.find((x) => x.id !== r.id); fA.rumored('imjin', r2.text, r2.id); await tick();
  ok(!heardLine(gB), '이미 들은 소문(둘째 줄)은 B 에게 다시 안 뜬다');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
// ---- ① 멀면 없음 · 내 차례 아니면 없음 · 다른 시대 소문이면 없음 ----
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], ['sit:sahwa:open']);
  gB.p.pos.x = 30; fB.lastSend = -1e9; fB.send(true); await tick();   // B 가 30m 밖
  fA.rumored('imjin', RM[0].text, RM[0].id); await tick();
  ok(!heardLine(gB) && !gB.flags.has('rumor:imjin:heard'), '곁 14m 밖이면 소문이 안 닿는다');
  gB.p.pos.x = 5; fB.lastSend = -1e9; fB.send(true); await tick(); fA.rumored('imjin', RM[0].text, RM[0].id); await tick();
  ok(heardLine(gB), '곁으로 오면 닿는다');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], []);   // B 는 아직 사화 전(앞 상황 안 열림)
  fA.rumored('imjin', RM[0].text, RM[0].id); await tick();
  ok(!heardLine(gB) && !gB.flags.has('rumor:imjin:heard'), 'B 가 아직 그 차례가 아니면(앞 상황 안 열림) 뜻 없는 말 — 안 뜸·깃발 없음');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], ['sit:sahwa:open', 'sit:imjin:open']);   // B 는 이미 임진이 열림
  fA.rumored('imjin', RM[0].text, RM[0].id); await tick();
  ok(!heardLine(gB) && !gB.flags.has('rumor:imjin:heard'), 'B 에게 그 사건이 이미 열렸으면 전조가 아니다 — 안 뜸');
  fA.rumored('nothing', '아무 말', 'x'); await tick(); ok(!heardLine(gB), '이 시대 소문 데이터에 없는 id 면 없음');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
// ---- ① 벗 귀띔으로 들은 소문도 번진다 ----
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open', 'bond:met', 'bond:friend'], ['sit:sahwa:open']);
  for (let t = 0; t < 30; t += 0.1) gA.bond.tick(0.1); await tick();
  ok(gA.flags.has('bond:rumor:imjin') && gA.said.some((t) => t.includes('들었어?')), 'A 의 벗이 24초 뒤 임진 소문을 귀띔했다');
  const l = heardLine(gB); ok(l && l.startsWith('👥 3 김하늘') && gB.flags.has('rumor:imjin:heard'), '벗에게 들은 소문도 곁 친구 B 에게 번진다');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
// ---- 좌석 없으면(rumored 가 조용) ----
{
  seatOf = { tier: 'guest' }; resetSeat(); const gD = mkG('joseon-life', ['sit:sahwa:open']); const fD = new Friends(gD); await fD.start(); await tick();
  let threw = false; try { fD.rumored('imjin', RM[0].text, RM[0].id); } catch { threw = true; } ok(!fD.on && !threw, '게스트: rumored 는 조용히 아무것도 안 함');
}

// ---- ② 미리 한 집의 급한 일 막대 ----
{
  const d = (W.pulse?.deadlines || []).find((x) => x.rumor === 'imjin'); ok(!!d, `임진 급한 일에 rumor:imjin(${d?.id})`);
  const mkP = (flags) => { const F = new Set(flags); const said = []; const bar = { style: {}, cls: new Set(), classList: { add(c) { bar.cls.add(c); }, remove(c) { bar.cls.delete(c); }, toggle(c, v) { v ? bar.cls.add(c) : bar.cls.delete(c); } }, t: { innerHTML: '' }, i: { style: {} }, querySelector(q) { return q === '.t' ? bar.t : bar.i; } };
    const g = { flags: F, cond: condOf(F), ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false }, sound: { play() {} }, e: { areas: new Map() }, said, story: {} }; const pl = new Pulse(g, W.pulse); pl.bar = bar; return { pl, g, bar, said }; };
  { const { pl, bar, said } = mkP(['rumor:imjin:heard', 'prep:imjin']); pl.startDeadline(d); await new Promise((r) => setTimeout(r, 1700));
    ok(pl.deadline.prep && bar.cls.has('prep') && bar.t.innerHTML.startsWith('⏳ 👂 <b>'), `미리 한 집: deadline.prep · prep 클래스 · 「⏳ 👂 제목」(${bar.t.innerHTML.slice(0, 20)}…)`);
    ok(pl.deadline.left === d.sec + 15, `시간은 그대로(+heardBonus 만) ${pl.deadline.left}초`);
    ok(said.some((t) => t.includes('미리 해 둔 것도 있다')), '한마디 「👂 먼저 들어 둔 말 … 미리 해 둔 것도 있다」');
    pl.deadline.left = d.sec * 0.2; pl.tickDeadline(0.01); ok(bar.cls.has('hot') && bar.cls.has('prep'), '거의 다 왔으면 hot 도 같이(붉음이 위)'); pl.endDeadline(true); }
  { const { pl, bar, said } = mkP(['rumor:imjin:heard']); pl.startDeadline(d); await new Promise((r) => setTimeout(r, 1700));
    ok(!pl.deadline.prep && !bar.cls.has('prep') && bar.t.innerHTML.startsWith('⏳ <b>') && !said.some((t) => t.includes('미리 해 둔')), '듣기만 하고 미리 안 했으면 막대 그대로·👂 없음'); pl.endDeadline(true); }
  { const { pl, bar } = mkP(['prep:imjin']); pl.startDeadline(d); ok(pl.deadline.prep && bar.cls.has('prep') && pl.deadline.left === d.sec, 'prep 깃발만 있으면(데이터상 소문 없인 못 하지만) 표시는 하되 +초는 없음'); pl.endDeadline(true); }
}
console.log(`\ntest_rumor3: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
