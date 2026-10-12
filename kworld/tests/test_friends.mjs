// 반 멀티 0·1단계 시험 — 가짜 Realtime 버스 위에 두 학생: 자리가 오가고 친구 몸이 scene 에 서며 따라 움직인다 · 20초 소식 없으면 사라짐 · 좌석 없으면 아무것도 안 함 · 자기 것은 안 그림
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
ok(fB.count() === 1, 'B 도 A 가 바로 보인다(A 가 새 친구를 보면 제 자리를 다시 보낸다 — 1단계)');
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
// ---------- 1단계: 손 흔들기 · 무엇을 골랐는지 · near:n ----------
globalThis.window.KeduTier.resolve = async () => ({ tier: 'student', profile: { profile_id: 'stu-1', nickname: '3 김하늘', class_code_id: 'c2' } }); resetSeat();
const gW = mkG('life'); gW.ui = { said: [], say(t) { this.said.push(t); }, isOpen: () => false }; gW.p.body = { userData: { arms: [{ rotation: { x: 0 } }, { rotation: { x: 0 } }] } };
const fW = new Friends(gW); await fW.start(); await tick();
globalThis.window.KeduTier.resolve = async () => ({ tier: 'student', profile: { profile_id: 'stu-2', nickname: '7 박솔', class_code_id: 'c2' } }); resetSeat();
const gX = mkG('life'); gX.ui = { said: [], say(t) { this.said.push(t); }, isOpen: () => false }; gX.p.body = { userData: { arms: [{ rotation: { x: 0 } }, { rotation: { x: 0 } }] } };
const fX = new Friends(gX); await fX.start(); await tick(); fW.lastSend = -1e9; fW.send(true); await tick();
ok(fW.count() === 1 && fX.count() === 1, '둘이 서로 보인다');
// 👋 W 가 흔들면 X 화면의 W 가 오른팔을 들고 토스트
fW.wave(); await tick(); const wf = fX.friends.get('stu-1'); ok(wf.waveUntil > performance.now() && gX.ui.said.some((t) => t.includes('👋') && t.includes('김하늘')), '손 흔들기 → 상대 화면 토스트 ' + gX.ui.said.at(-1));
wf.body.userData.arms = [{ rotation: { x: 0 } }, { rotation: { x: 0 } }]; fX.tick(0.016); ok(wf.body.userData.arms[1].rotation.x < -2, '친구 오른팔이 올라감 ' + wf.body.userData.arms[1].rotation.x);
fW.tick(0.016); ok(gW.p.body.userData.arms[1].rotation.x < -2, '내 몸(3인칭)도 팔을 든다');
gW.ui.isOpen = () => true; const before = fW.myWaveUntil; fW.myWaveUntil = 0; fW.wave(); ok(fW.myWaveUntil === 0, '카드 열린 중엔 안 흔든다'); gW.ui.isOpen = () => false;
// 무엇을 골랐는지 — 멀면 안 뜨고, 곁(3.5m)에 가면 한 줄, 값은 없음
gW.p.pos.x = 30; gW.p.pos.z = 0; fW.lastSend = -1e9; fW.send(true); await tick();
fW.picked({ title: '좁은 골짜기' }, { id: 'alone', title: '혼자 몰았다', heart: 1 }); await tick();
const xf = fX.friends.get('stu-1'); ok(xf.pick && xf.pick.sit === '좁은 골짜기' && !xf.pick.shown && !gX.ui.said.some((t) => t.includes('골짜기')), '멀면 받아 두기만');
gX.p.pos.x = 28; for (let i = 0; i < 80; i++) fX.tick(0.05);
ok(xf.pick.shown && gX.ui.said.some((t) => t.includes('「좁은 골짜기」') && t.includes('혼자 몰았다') && !t.includes('인심')), '곁에 가면 한 줄(값 없음) ' + gX.ui.said.at(-1));
// near:n — 5m 안 친구 수
ok(fX.near() === 1 && fW.near() === 0, 'near: X 곁엔 W(28↔30) 하나, W 는 X 자리를 아직 모름 ' + fX.near() + '/' + fW.near());
fX.lastSend = -1e9; fX.send(true); await tick(); ok(fW.near() === 1, 'X 자리가 오면 W 도 1');
const { Life } = await import(path.join(root, 'core/life.js'));
const one = Life.prototype.one; ok(one.call({ g: { friends: fW, flags: new Set() }, hurt: new Set() }, 'near:1') && !one.call({ g: { friends: fW, flags: new Set() }, hurt: new Set() }, 'near:2') && !one.call({ g: { flags: new Set() }, hurt: new Set() }, 'near:1'), 'life.cond near:1 참·near:2 거짓·friends 없으면 거짓');
// with — 「함께」는 곁 친구에게 바로 토스트
gX.ui.said.length = 0; fW.picked({ title: '좁은 골짜기' }, { id: 'friend', title: '반 친구와 몰았다', with: true }); await tick();
ok(gX.ui.said.some((t) => t.includes('너와 함께') && t.includes('골짜기')), '함께 → 곁 친구 토스트 ' + gX.ui.said.at(-1));
// 새로 온 친구에게 내 마지막 선택 한 줄
globalThis.window.KeduTier.resolve = async () => ({ tier: 'student', profile: { profile_id: 'stu-3', nickname: '9 이준', class_code_id: 'c2' } }); resetSeat();
const gY = mkG('life'); gY.ui = { said: [], say(t) { this.said.push(t); }, isOpen: () => false }; const fY = new Friends(gY); await fY.start(); await tick(); await tick();
ok(fY.friends.get('stu-1')?.pick?.sit === '좁은 골짜기', '새로 들어온 친구도 W 의 마지막 선택을 안다');
// 구석기 몰이 골짜기 json — 반 친구 길
const fs = await import('fs'); const items = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/items.json'), 'utf8')); const life = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/life.json'), 'utf8'));
const gc = items.targets.gully.rename[0].choices.find((c) => c.flag === 'gully:friend'); const sc = life.situations.find((s) => s.id === 'drive').choices.find((c) => c.id === 'friend');
ok(gc && gc.if === 'near:1' && gc.gray && sc && sc.done === 'gully:friend' && sc.with === true, '구석기 몰이 골짜기 「반 친구와 함께」 길 json');
// 같이 하기 자리 넓히기 — 신석기 그물·청동기 도랑·고조선 토성·삼국 성벽
const J = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const chk = [['neo', 'nettear', 'mend_with', 'net:mend_with', J('eras/neo/npcs.json').fisher.lines[1].choices], ['bronze-life', 'moat', 'dig_with', 'moat:dig_with', J('eras/bronze-life/npcs.json').digger.lines[0].choices], ['gojoseon-life', 'war', 'build_with', 'war:build_with', J('eras/gojoseon-life/items.json').targets.rampart.rename], ['samguk-life', 'corvee', 'carry_with', 'wall:carry_with', J('eras/samguk-life/items.json').targets.wall.rename]];
for (const [era, sid, cid, flag, rules] of chk) { const sc = J(`eras/${era}/life.json`).situations.find((s) => s.id === sid).choices.find((c) => c.id === cid); const r = rules.find((x) => x.flag === flag); ok(sc && sc.done === flag && sc.with === true && r && /near:1/.test(r.if) && r.roll?.hard === 1 && (!r.verb || rules.indexOf(r) < rules.findIndex((x) => x.flag === flag.replace('_with', ''))), `${era} 「반 친구와 함께」 길 json(near:1·hard 1·with·rename 이면 원 길보다 앞)`); }
console.log(`friends ${pass}/${fail}`); process.exit(fail ? 1 : 0);
