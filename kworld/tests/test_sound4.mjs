// 125: 「그 뒤」 카드 소리 장면(bridge.sound — 다음 시대가 먼저 들린다, gate 뒤 1.1초부터) + 선택지 sound 2차(규칙, 1,237 → 약 800)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
globalThis.window = { addEventListener() {}, removeEventListener() {} }; globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} }; globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
const { SFX } = await import('../core/sound.js');
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const W = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')));
const D = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/life.json`), 'utf8')));

// ① bridge.sound — 열한 시대 전부 2~3, SFX 이름, 다음 시대의 소리(앞 시대에 없는 것이 하나는 든다)
ok(W.every((w) => Array.isArray(w.bridge?.sound) && w.bridge.sound.length >= 2 && w.bridge.sound.length <= 3), '열한 시대 bridge.sound 2~3');
const unk = [...new Set(W.flatMap((w) => w.bridge.sound))].filter((n) => !SFX.includes(n)); ok(!unk.length, `이름 전부 SFX ${unk.join(',')}`);
ok(W[0].bridge.sound.includes('hoe') && W[1].bridge.sound.includes('horn') && W[3].bridge.sound.includes('horse') && W[8].bridge.sound.includes('train') && W[9].bridge.sound.includes('radio'), '구석기→호미 · 신석기→뿔피리 · 고조선→말 · 조선 후기→기차 · 개항→라디오');
ok(new Set(W.map((w) => w.bridge.sound.join())).size === 11, '열한 시대 다 다름');
const BANP = { life: ['paper', 'coin', 'gong', 'bell', 'moktak', 'train', 'anvil', 'radio', 'car', 'siren'] };
ok(!(W[0].bridge.sound.some((n) => BANP.life.includes(n))), '구석기 그 뒤 카드엔 구석기에 없는 소리를 안 씀(다음 시대 소리라도 호미·물·아이까지만)');

// 엔진: scene(list, at) · bridge 가 gate 뒤 1100 부터 scene(b.sound)
const life = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8');
ok(life.includes("g.sound?.play?.('gate', 0.45); this.scene(b.sound, 1100);"), 'bridge: gate 뒤 scene(b.sound, 1100)');
const timers = []; globalThis.setTimeout = (f, ms) => { timers.push([ms, f]); };
const played = []; const g = { sound: { play: (n, v) => played.push([n, v]) } };
const { Life } = await import('../core/life.js'); const L = Object.create(Life.prototype); L.g = g;
L.scene(['hoe', 'pour', 'child'], 1100); ok(timers.map(([ms]) => ms).join() === '1100,1600,2100', `그 뒤 카드 소리 1.1·1.6·2.1초 ${timers.map(([ms]) => ms)}`);
timers.length = 0; L.scene(['drum']); ok(timers[0][0] === 450, 'at 없으면 전과 같이 450');

// ② 선택지 sound 2차 — 1,612 중 650~900 (전부는 아님), 이름 전부 SFX, 시대 금지 소리 0, 수동 선택지(봤다·그대로 류)엔 없음(「국어 상용」 gong 은 124 가 손으로)
const chs = D.flatMap((d) => d.situations.flatMap((s) => s.choices || []));
const withC = chs.filter((c) => c.sound); ok(withC.length >= 650 && withC.length <= 900 && withC.length < chs.length, `선택지 ${chs.length} 중 ${withC.length} 에 sound`);
const unk2 = [...new Set(withC.map((c) => c.sound))].filter((n) => !SFX.includes(n)); ok(!unk2.length, `선택지 소리 이름 전부 SFX ${unk2.join(',')}`);
const BAN = { life: ['paper', 'chatter', 'coin', 'gong', 'bell', 'moktak', 'train', 'saw', 'horse', 'cart', 'loom', 'hoe', 'cow', 'hammer', 'anvil', 'bellows', 'radio', 'car', 'siren', 'drum', 'horn', 'door'], neo: ['paper', 'coin', 'bell', 'moktak', 'train', 'saw', 'horse', 'anvil', 'bellows', 'radio', 'car', 'cart', 'horn'], 'joseon-life': ['train', 'saw', 'radio', 'car', 'siren'], 'daehan-life': ['growl', 'boar', 'knap', 'gong', 'moktak'] };
const bad = []; D.forEach((d, i) => { const b = BAN[ERAS[i]]; if (!b) return; for (const s of d.situations) for (const c of s.choices || []) if (c.sound && b.includes(c.sound)) bad.push(ERAS[i] + ':' + s.id + '/' + c.id + ':' + c.sound); });
ok(!bad.length, `시대 금지 소리 0 ${bad.slice(0, 5).join(' ')}`);
const passive = chs.filter((c) => /^(봤다|그대로|기다렸다|지나쳤다|안 했다)$/.test((c.title || '').trim()));
ok(passive.length > 20 && passive.every((c) => !c.sound), `수동 선택지 ${passive.length} 엔 소리 없음`);
const find = (e, rx) => D[ERAS.indexOf(e)].situations.flatMap((s) => s.choices || []).find((c) => rx.test(c.title || ''));
ok(find('goryeo-life', /^숯을 구웠다/)?.sound === 'flint', '「숯을 구웠다」 flint(먹기 아님)');
ok(find('goryeo-life', /매를 길렀다/)?.sound !== 'hurt', '「매를 길렀다」 는 맞는 게 아니다');
ok(find('silla-life', /장보고와 손잡았다/)?.sound !== 'growl', '「손잡았다」 는 사냥이 아니다');
ok(find('joseon-life', /^수절했다/)?.sound !== 'gong', '「수절했다」 는 절이 아니다');
ok(find('life', /물길을 막았다/)?.sound === 'splash', '구석기 「물길을 막았다」 splash');
ok(find('joseon-late-life', /^잡혔다 — 다리/)?.sound === 'hurt' && find('daehan-life', /^편지를 썼다/)?.sound === 'paper' && find('samguk-life', /^나가 싸웠다/)?.sound === 'horn', '잡혔다 hurt · 편지 paper · 싸웠다 horn');
ok(find('life', /^동굴로 갔다/)?.sound === 'rustle' && find('neo', /^그릇을 구웠다/)?.sound === 'flint', '구석기 동굴로 rustle · 신석기 그릇 flint');
console.log(`sound4: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
