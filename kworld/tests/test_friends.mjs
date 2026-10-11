// 반 멀티 0단계 시험 — 가짜 Realtime 버스 위에 두 학생: 자리가 오가고 친구 몸이 scene 에 서며 따라 움직인다 · 20초 소식 없으면 사라짐 · 좌석 없으면 아무것도 안 함 · 자기 것은 안 그림
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.join(here, '..');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const tick = () => new Promise((r) => setTimeout(r, 5));
// 가짜 버스 — 채널 이름이 같은 것끼리 브로드캐스트
const bus = {}; const mkDb = () => ({ channel(name) { const subs = (bus[name] ??= []); const ch = { name, handlers: [], on(kind, f, cb) { ch.handlers.push({ kind, ev: f.event, cb }); return ch; }, subscribe(cb) { subs.push(ch); cb('SUBSCRIBED'); return ch; }, track() { }, untrack() { }, unsubscribe() { const i = subs.indexOf(ch); if (i >= 0) subs.splice(i, 1); }, send(m) { for (const o of subs) if (o !== ch) for (const h of o.handlers) if (h.kind === 'broadcast' && h.ev === m.event) h.cb({ payload: m.payload }); } }; return ch; } });
let seatOf = null; globalThis.window = { KeduTier: { resolve: async () => seatOf, canSave: (t) => t?.tier === 'student' } }; globalThis.getKeduDb = () => mkDb();
globalThis.localStorage = { getItem: () => null, setItem() { }, removeItem() { } };
globalThis.performance ??= { now: () => Date.now() }; globalThis.addEventListener ??= () => { };
const mkG = (era) => ({ era, world: { characters: [{ id: 'eye', look: { cloth: 0x8a5a3a } }] }, character: { id: 'eye' }, p: { pos: { x: 0, z: 0 }, yaw: 0, moving: false }, e: { onFrame: [], scene: { kids: [], add(o) { this.kids.push(o); }, remove(o) { const i = this.kids.indexOf(o); if (i >= 0) this.kids.splice(i, 1); } }, groundY: () => 1 } });

// 학생 A (좌석 stu-1)
seatOf = { tier: 'student', profile: { profile_id: 'stu-1', nickname: '3 김하늘', class_code_id: 'c1' } };
const { resetSeat } = await import(path.join(root, 'core/save.js'));
const { Friends } = await import(path.join(root, 'core/friends.js'));
const gA = mkG('neo'); const fA = new Friends(gA); await fA.start(); await tick();
ok(fA.on && fA.ch?.name === 'kworld:c1:neo', '채널 = 학급×시대 ' + fA.ch?.name);
// 학생 B (같은 반·같은 시대) — seat 는 모듈마다 한 번 묻으므로 새 모듈
const seatB = { tier: 'student', profile: { profile_id: 'stu-2', nickname: '7 박솔', class_code_id: 'c1' } };
globalThis.window.KeduTier.resolve = async () => seatB; resetSeat();
const FriendsB = Friends;
const gB = mkG('neo'); const fB = new FriendsB(gB); await fB.start(); await tick();
ok(fA.count() === 1 && gA.e.scene.kids.length === 1 && fA.friends.get('stu-2').body.userData.nick === '7 박솔', 'B 가 들어오면 A 화면에 B 몸 + 이름 ' + fA.count());
ok(fB.count() === 0, 'B 는 A 의 첫 자리를 아직 못 받음(A 는 B 보다 먼저 보냈다)');
// A 가 걷는다 → B 화면의 A 가 따라간다
gA.p.pos.x = 5; gA.p.pos.z = -3; gA.p.moving = true; fA.lastSend = -1e9; fA.tick(0.016); await tick();
ok(fB.count() === 1 && fB.friends.get('stu-1').tx === 5 && fB.friends.get('stu-1').tz === -3, 'A 자리가 B 에게 ' + JSON.stringify(fB.friends.get('stu-1') && [fB.friends.get('stu-1').tx, fB.friends.get('stu-1').tz]));
for (let i = 0; i < 60; i++) fB.tick(0.05); const a = fB.friends.get('stu-1');
ok(Math.abs(a.body.position.x - 5) < 0.05 && Math.abs(a.body.position.z + 3) < 0.05 && a.body.position.y === 1, '친구 몸이 자리로 미끄러져 가고 땅 높이에 선다');
// 자기 것은 안 그린다
fA.recv({ id: 'stu-1', nick: 'me', x: 9, z: 9 }); ok(fA.count() === 1, '자기 자리 무시');
// 같은 자리면 다시 안 보낸다
fA.lastSend = -1e9; gA.p.moving = false; fA.send(); const sentAgain = fA.lastSend !== -1e9; fA.lastSend = -1e9; fA.send(); ok(sentAgain && fA.lastSend === -1e9, '안 움직이면 두 번째는 안 보냄');
// 20초 소식 없음 → 사라짐
fB.friends.get('stu-1').t = performance.now() - 25000; fB.tick(0.016); ok(fB.count() === 0 && gB.e.scene.kids.length === 0, '20초 소식 없으면 사라짐');
// 다른 시대는 다른 채널
resetSeat(); const FriendsC = Friends; const gC = mkG('bronze-life'); const fC = new FriendsC(gC); await fC.start(); await tick();
ok(fC.ch.name === 'kworld:c1:bronze-life' && fA.count() === 1, '다른 시대는 다른 채널');
// 좌석 없음(게스트) → 아무것도 안 함
globalThis.window.KeduTier.resolve = async () => ({ tier: 'guest' }); resetSeat(); const FriendsD = Friends; const gD = mkG('neo'); const fD = new FriendsD(gD); await fD.start(); await tick();
ok(!fD.on && !fD.ch && gD.e.onFrame.length === 0, '게스트·방문자: 채널 없음');
// world.friends === false 면 끔
globalThis.window.KeduTier.resolve = async () => seatB; resetSeat(); const FriendsE = Friends; const gE = mkG('neo'); gE.world.friends = false; const fE = new FriendsE(gE); await fE.start(); await tick(); ok(!fE.on, 'world.friends=false 면 끔');
console.log(`friends ${pass}/${fail}`); process.exit(fail ? 1 : 0);
