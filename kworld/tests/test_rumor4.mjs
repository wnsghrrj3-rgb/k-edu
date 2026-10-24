// 소문 층 ⑤(121) — ① 미리 한 것 번짐: 내가 소문 듣고 한 가지를 미리 하면(깃발 prep:<X>, game.flag → friends.onFlag) 곁(3.5m) 반 친구에게 「👥 이름이(가) 미리 해 뒀다 — … (자리)」 한 줄(pick 틀, 값 없음, 받는 쪽 friend:prep:<X>)
// ② 「그 뒤」 카드 👂 줄에 「(그중 n번은 반 친구에게서)」 · ③ 소문 번짐 소리 'rumor'(사람→친구·벗 귀띔 둘 다, meet 와 따로)
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


const IT = J('joseon-life', 'items'); const prepR = Object.entries(IT.targets || {}).flatMap(([k, d]) => (d.rename || []).filter((r) => r.flag === 'prep:imjin').map((r) => ({ k, d, r })))[0];
ok(!!prepR, `조선 전기 미리 하기 자리(${prepR?.k} · ${prepR?.d.name})`);
const prepLine = (g) => g.said.find((t) => t.startsWith('👥 ') && t.includes('미리 해 뒀다'));

// ---- ① 미리 한 것이 곁 친구에게 번진다 ----
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open', 'rumor:imjin:heard'], ['sit:sahwa:open']);
  gA.items = IT; gB.items = IT; const played = []; gB.sound = { play: (n, v) => played.push([n, v]) };
  gB.p.pos.x = 30; fB.lastSend = -1e9; fB.send(true); await tick();   // B 는 멀리
  // A 가 숯가마 옆에서 곡식을 미리 묻는다 → game.flag('prep:imjin') → friends.onFlag
  gA.flag('prep:imjin'); fA.onFlag('prep:imjin'); await tick();
  const fAinB = fB.friends.get('stu-1'); ok(fAinB?.prep && fAinB.prep.x === 'imjin' && !fAinB.prep.shown && fAinB.prep.place === prepR.d.name, `B 가 받아 들고 있다(자리 ${fAinB?.prep?.place}) — 멀어서 아직 안 뜸`);
  ok(!prepLine(gB) && !gB.flags.has('friend:prep:imjin'), '멀면(3.5m 밖) 아직 한 줄 없음·깃발 없음');
  // B 가 A 곁 3.5m 안으로 오면
  gB.p.pos.x = 2; fAinB.x = 0; fAinB.z = 0; fB.tick(0.1); await tick();
  const l = prepLine(gB); ok(l && l.startsWith('👥 3 김하늘이(가) 미리 해 뒀다 — ') && l.includes(prepR.r.verb.split(' — ')[0]) && l.includes(prepR.d.name), `곁에 오면 「${l?.slice(0, 48)}…」`);
  ok(gB.flags.has('friend:prep') && gB.flags.has('friend:prep:imjin') && !gB.flags.has('prep:imjin') && !gB.flags.has('rumor:imjin:heard'), 'B 깃발은 friend:prep:imjin 만 — B 의 prep·rumor 깃발은 안 선다(값·시간 그대로)');
  ok(played.some(([n]) => n === 'rumor'), '소리 rumor');
  gB.said.length = 0; fB.tick(0.1); fB.tick(0.1); ok(!prepLine(gB), '같은 것은 한 번만');
  // A 쪽엔 아무 줄 없음(자기 것) · 같은 prep 두 번 와도 다시 안 뜸
  ok(!prepLine(gA), 'A 화면엔 없음(자기 것)');
  fA.onFlag('prep:imjin'); await tick(); fB.tick(0.1); ok(!prepLine(gB), '같은 prep 이 다시 와도 다시 안 뜸');
  // 카드 열린 중엔 미룸
  fA.onFlag('prep:leave'); await tick(); ok(!fAinB.prep || fAinB.prep.x === 'imjin', '이 시대 자리에 없는 prep(구석기 것)은 보내지 않는다');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
// ---- ① prep 가 아닌 깃발은 조용 · 좌석 없으면 조용 · 카드 열린 중엔 미룸 ----
{
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], ['sit:sahwa:open']); gA.items = IT; gB.items = IT;
  fA.onFlag('sit:imjin:open'); fA.onFlag('prep:imjin:x'); await tick(); ok(!fB.friends.get('stu-1')?.prep, 'prep:<X> 꼴이 아니면 아무것도 안 보냄');
  gB.ui.isOpen = () => true; fA.onFlag('prep:imjin'); await tick(); const f = fB.friends.get('stu-1'); f.x = 1; f.z = 0; fB.tick(0.1); ok(f.prep && !f.prep.shown && !prepLine(gB), '카드 열린 중엔 미룸');
  gB.ui.isOpen = () => false; fB.tick(0.1); ok(prepLine(gB), '카드 닫히면 뜬다');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
  seatOf = { tier: 'guest' }; resetSeat(); const gD = mkG('joseon-life', []); gD.items = IT; const fD = new Friends(gD); await fD.start(); await tick();
  let threw = false; try { fD.onFlag('prep:imjin'); } catch { threw = true; } ok(!fD.on && !threw, '게스트: onFlag 는 조용히 아무것도 안 함');
}
// ---- ② 「그 뒤」 카드 👂 줄 — 반 친구에게 들은 것 ----
{
  const { Life } = await import(path.join(root, 'core/life.js'));
  const mk = (flags) => { const g = { world: W, flags: new Set(flags), ui: {}, era: 'joseon-life' }; const L = Object.create(Life.prototype); L.g = g; return L; };
  ok(mk(['rumor:imjin:heard', 'friend:rumor:imjin']).earLine().includes('1번 먼저 들었다(그중 1번은 반 친구에게서)'), '반 친구에게 들은 소문은 「(그중 n번은 반 친구에게서)」');
  ok(!mk(['rumor:imjin:heard']).earLine().includes('반 친구'), '사람 입으로만 들었으면 그 괄호 없음');
  const t = mk(['rumor:imjin:heard', 'rumor:horan:heard', 'friend:rumor:horan', 'rumor:horan:used', 'prep:imjin']).earLine();
  ok(t.includes('2번 먼저 들었다(그중 1번은 반 친구에게서), 그래서 1번은 남보다 앞서 섰다. 미리 해 둔 일 1가지'), `차례: 들음(반 친구) → 앞섬 → 미리 (${t.slice(0, 70)}…)`);
  ok(mk([]).earLine().startsWith('소문은 지나쳤다'), '하나도 못 들었으면 전처럼');
}
// ---- ③ 소문 소리 'rumor' — 사람→친구 번짐·벗 귀띔 둘 다, SFX 에 있고 합성됨 ----
{
  const { SFX, Sound } = await import(path.join(root, 'core/sound.js'));
  ok(SFX.includes('rumor') && SFX.includes('meet'), 'SFX 에 rumor(meet 와 따로)');
  globalThis.location ??= { search: '' }; globalThis.window.addEventListener ??= () => {}; const snd = Object.create(Sound.prototype); snd.samples = {}; snd.level = {}; snd.layers = {}; const made = []; snd.ctx = { currentTime: 0, createOscillator: () => ({ frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() { made.push('o'); }, stop() {} }), createGain: () => ({ gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 0 }, connect() {} }), createBiquadFilter: () => ({ frequency: { value: 0 }, connect() {} }), createBufferSource: () => ({ connect() {}, start() {} }) }; snd.on = true; snd.master = { connect() {} }; snd.blip = () => made.push('b');
  const made0 = snd.synth('rumor'); await new Promise((r) => setTimeout(r, 320)); ok(made0 && made.length >= 3, `rumor 합성됨 — 귓속말 세 조각(${made.length})`);
  const { gA, fA, gB, fB } = await pair(['sit:sahwa:open'], ['sit:sahwa:open']); const pl = []; gB.sound = { play: (n) => pl.push(n) };
  fA.rumored('imjin', RM[0].text, RM[0].id); await tick(); ok(pl.includes('rumor') && !pl.includes('meet'), '친구 번짐 소리 = rumor(meet 아님)');
  const pl2 = []; gA.sound = { play: (n) => pl2.push(n) }; gA.flags.add('bond:met'); gA.flags.add('bond:friend'); gA.flags.delete('rumor:imjin:heard'); for (let t = 0; t < 30; t += 0.1) gA.bond.tick(0.1);
  ok(gA.said.some((t) => t.includes('들었어?')) && pl2.includes('rumor'), '벗 귀띔 소리 = rumor');
  fA.ch.unsubscribe(); fB.ch.unsubscribe();
}
console.log(`\ntest_rumor4: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
