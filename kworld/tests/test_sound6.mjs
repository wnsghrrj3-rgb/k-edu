// 127: 길 위의 일 카드마다 소리 장면(road.events[].sound 1~2) · 칭호마다 소리 하나(spark.titles[].sound) · 시대 문이 열리면 다음 시대 아침 소리 둘(gate.sound)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
globalThis.window = { addEventListener() {}, removeEventListener() {} }; globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} }; globalThis.document = { createElement: () => ({ style: {}, addEventListener() {}, classList: { add() {}, remove() {} } }), body: { appendChild() {} }, head: { appendChild() {} }, getElementById: () => null };
const { SFX } = await import('../core/sound.js');
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const W = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')));
const BAN = { life: ['paper', 'chatter', 'coin', 'gong', 'bell', 'moktak', 'train', 'saw', 'horse', 'cart', 'loom', 'hoe', 'cow', 'hammer', 'anvil', 'bellows', 'radio', 'car', 'siren', 'drum', 'horn', 'door', 'dog', 'rooster'], neo: ['paper', 'coin', 'bell', 'moktak', 'train', 'horse', 'cart', 'anvil', 'bellows', 'radio', 'car', 'siren', 'horn', 'hammer', 'rooster'], 'bronze-life': ['paper', 'coin', 'train', 'radio', 'car', 'siren', 'moktak', 'bell'], 'gojoseon-life': ['train', 'radio', 'car', 'siren', 'moktak', 'bell'], 'samguk-life': ['train', 'radio', 'car', 'siren'], 'silla-life': ['train', 'radio', 'car', 'siren'], 'goryeo-life': ['train', 'radio', 'car', 'siren'], 'joseon-life': ['train', 'radio', 'car', 'siren'], 'joseon-late-life': ['radio', 'car', 'siren'], 'gaehang-life': ['growl', 'knap', 'bear'], 'daehan-life': ['growl', 'knap', 'horse', 'horn', 'gong', 'moktak', 'bear', 'tiger', 'wolf'] };
const NEXT = Object.fromEntries(ERAS.map((e, i) => [e, ERAS[(i + 1) % ERAS.length]]));

// ① 길 위의 일 — 열한 시대 149 전부 sound 1~2, SFX, 시대 금지 0, 발자국은 그 짐승 소리, 밤 일은 밤 소리
const ev = W.flatMap((w, i) => w.road.events.map((s) => ({ era: ERAS[i], s })));
ok(ev.length >= 110, `길 위의 일 ${ev.length}`);
ok(ev.every(({ s }) => Array.isArray(s.sound) && s.sound.length >= 1 && s.sound.length <= 2), '전부 sound 1~2');
const unk = [...new Set(ev.flatMap(({ s }) => s.sound || []))].filter((n) => !SFX.includes(n)); ok(!unk.length, `소리 이름 전부 SFX ${unk.join(',')}`);
const banHit = ev.filter(({ era, s }) => (BAN[era] || []).some((n) => s.sound.includes(n))); ok(!banHit.length, `시대 금지 소리 0 ${banHit.map((x) => x.era + ':' + x.s.id).join(',')}`);
ok(ev.filter(({ s }) => s.beast).every(({ s }) => s.sound.includes(s.beast)), '발자국(beast) 일은 그 짐승 소리가 든다');
ok(ev.filter(({ s }) => s.prop === 'track' && !s.beast).every(({ s }) => s.sound[0] === 'horse' || s.sound.includes('rustle')), '짐승 없는 자국(몽골 말)은 말·바스락');
const by = (era, id) => ev.find((x) => x.era === era && x.s.id === id).s;
ok(by('life', 'child').sound.includes('child') && by('gaehang-life', 'ticketdrop').sound.includes('train') && by('daehan-life', 'nightcurfew').sound.includes('siren') && by('silla-life', 'bellsound').sound[0] === 'bell', '우는 아이 child · 기차표 train · 통행금지 siren · 종 소리 bell');
ok(by('gojoseon-life', 'coindrop').sound.includes('coin') && !by('life', 'obsid').sound.includes('coin'), '명도전은 동전 · 구석기 흑요석은 동전 아님');
ok(new Set(ev.map(({ s }) => s.sound.join())).size >= 70, `149 중 다른 장면 ${new Set(ev.map(({ s }) => s.sound.join())).size}`);

// ② 칭호 — 열한 시대 173 전부 sound 하나, SFX, 시대 금지 0, 짐승 칭호는 그 짐승, 절뚝은 limp, 쓴 칭호는 밝은 소리 아님
const tt = W.flatMap((w, i) => w.spark.titles.map((t) => ({ era: ERAS[i], t })));
ok(tt.length >= 150, `칭호 ${tt.length}`);
ok(tt.every(({ t }) => typeof t.sound === 'string' && SFX.includes(t.sound)), '전부 sound 하나, SFX');
ok(!tt.some(({ era, t }) => (BAN[era] || []).includes(t.sound)), '칭호 소리 시대 금지 0');
ok(tt.filter(({ t }) => /^beast:(tiger|bear|boar):/.test(t.on) && !t.on.includes('&&')).every(({ t }) => t.sound === t.on.split(':')[1]), '짐승 칭호 = 그 짐승 소리(셋 다 본 「산을 아는 사람」은 바스락)');
ok(tt.filter(({ t }) => t.id === 'threebeasts').every(({ t }) => t.sound === 'rustle'), '산을 아는 사람 = rustle');
ok(tt.filter(({ t }) => t.id === 'leg').every(({ t }) => t.sound === 'limp') && tt.filter(({ t }) => t.id === 'warm').every(({ t }) => t.sound === 'heart') && tt.filter(({ t }) => t.id === 'hands').every(({ t }) => t.sound === 'craft'), '절뚝 limp · 인심 집 heart · 손 craft');
ok(tt.filter(({ t }) => t.bitter).every(({ t }) => !['good', 'heart', 'craft', 'grain', 'rank', 'meet', 'star'].includes(t.sound)), '쓴 칭호엔 밝은 값 소리 없음');
ok(tt.find((x) => x.era === 'silla-life' && x.t.id === 'capped').t.sound === 'capped' && tt.find((x) => x.era === 'daehan-life' && x.t.id === 'safe').t.sound === 'siren', '천장 capped · 교회 천막 siren');

// ③ 시대 문 — 열한 시대 gate.sound 둘, 다음 시대에 있는 소리, 둘이 다름, bridge.sound(일하는 소리)와 같은 묶음 아님
ok(W.every((w) => Array.isArray(w.gate?.sound) && w.gate.sound.length === 2 && w.gate.sound[0] !== w.gate.sound[1]), '열한 시대 gate.sound 둘(다름)');
ok(W.every((w) => w.gate.sound.every((n) => SFX.includes(n))), '문 소리 SFX');
ok(W.every((w, i) => !(BAN[NEXT[ERAS[i]]] || []).some((n) => w.gate.sound.includes(n))), '문 소리는 다음 시대에 있는 소리');
ok(W.every((w) => w.gate.sound.join() !== (w.bridge?.sound || []).join()), '그 뒤 카드 bridge.sound 와 다른 묶음');
ok(W[0].gate.sound.includes('bird') && W[ERAS.indexOf('joseon-late-life')].gate.sound.includes('train') && W[ERAS.indexOf('gojoseon-life')].gate.sound.includes('bell'), '구석기 문 → 새 · 후기 문 → 기차 · 고조선 문 → 절 종');

// ④ 엔진 — road.open: pick 뒤 scene(s.sound, 350) / spark.earn: good·bad 뒤 420ms 에 t.sound / game.checkGate: gate 뒤 scene(gate.sound, 1300)
const road = fs.readFileSync(path.join(root, 'core/road.js'), 'utf8'); const spark = fs.readFileSync(path.join(root, 'core/spark.js'), 'utf8'); const game = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8');
ok(road.includes("g.sound?.play?.('pick', 0.3); if (g.life?.scene) g.life.scene(s.sound, 350);"), 'road.open → pick + scene(sound, 350)');
ok(spark.includes("if (t.sound) setTimeout(() => g.sound?.play?.(t.sound, 0.32), 420);"), 'spark.earn → good/bad 뒤 420ms 칭호 소리');
ok(game.includes("if (g.sound && this.life?.scene) this.life.scene(g.sound, 1300);"), 'checkGate → gate 뒤 scene(gate.sound, 1300)');
// 실제로 불리는지 — 가짜 g 로 earn 과 scene 타이밍
const timers = []; const realST = globalThis.setTimeout; globalThis.setTimeout = (f, ms) => { timers.push([ms, f]); return 0; };
const { Spark } = await import('../core/spark.js');
const played = []; const g = { era: 'life', flags: new Set(), cond: () => true, ui: { say() {} }, sound: { play: (n, v) => played.push([n, v]) }, save: { touch() {} } };
const sp = Object.create(Spark.prototype); sp.g = g; sp.cfg = {}; sp.badge = null; sp.renderBadge = () => {};
sp.earn({ id: 'tigereye', name: '호랑이와 눈을 맞춘 사람', sound: 'tiger' });
ok(played[0]?.[0] === 'good' && timers.some(([ms]) => ms === 420), 'earn: good 바로 · 420ms 타이머');
timers.filter(([ms]) => ms === 420).forEach(([, f]) => f()); ok(played.some(([n]) => n === 'tiger'), '420ms 뒤 tiger');
sp.earn({ id: 'leg', name: '절뚝', bitter: true, sound: 'limp' }); timers.filter(([ms]) => ms === 420).forEach(([, f]) => f());
ok(played.some(([n]) => n === 'bad') && played.at(-1)[0] === 'limp', '쓴 칭호: bad 뒤 limp');
played.length = 0; timers.length = 0; sp.earn({ id: 'x', name: 'x' }); ok(played.length === 1 && played[0][0] === 'good' && !timers.length, 'sound 없는 칭호는 전처럼 good 만');
// life.scene 타이밍(350 · 850 / 1300 · 1800)
const { Life } = await import('../core/life.js'); const lf = Object.create(Life.prototype); lf.g = g; timers.length = 0;
lf.scene(['pick', 'child'], 350); ok(timers.map(([ms]) => ms).join() === '350,850', 'road 장면 350·850');
timers.length = 0; lf.scene(['bird', 'rustle'], 1300); ok(timers.map(([ms]) => ms).join() === '1300,1800', '문 장면 1300·1800');
globalThis.setTimeout = realST;

console.log(`\n${pass}/${fail}`); process.exit(fail ? 1 : 0);
