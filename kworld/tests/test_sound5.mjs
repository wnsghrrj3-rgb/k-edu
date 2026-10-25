// 126: 운 카드 55 에 소리 장면(luck.cards[].sound 1~3, showSituation 이 scene 으로 틂) + 결과마다 소리(outcomes[].sound, finish cues 맨 앞) · 「그 뒤」 물음 맞음·틀림 소리(bridge.q.sound {ok, miss}, 없으면 good/bad)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
globalThis.window = { addEventListener() {}, removeEventListener() {} }; globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} }; globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
const { SFX } = await import('../core/sound.js');
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const W = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')));
const D = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/life.json`), 'utf8')));
const BAN = { life: ['paper', 'chatter', 'coin', 'gong', 'bell', 'moktak', 'train', 'saw', 'horse', 'cart', 'loom', 'hoe', 'cow', 'hammer', 'anvil', 'bellows', 'radio', 'car', 'siren', 'drum', 'horn', 'door'], neo: ['paper', 'coin', 'bell', 'moktak', 'train', 'horse', 'cart', 'anvil', 'bellows', 'radio', 'car', 'siren', 'horn', 'hammer', 'gong'], 'daehan-life': ['horse', 'horn', 'growl', 'boar', 'knap', 'gong', 'moktak', 'tiger', 'bear', 'wolf', 'anvil', 'bellows', 'flint', 'drum', 'cart'], 'gaehang-life': ['growl'] };

// ① 운 카드 — 열한 시대 55 전부 sound 1~3, 이름 SFX, 시대 금지 0, 결과 sound 는 있는 것만 SFX
const cards = D.flatMap((d, i) => d.luck.cards.map((c) => ({ era: ERAS[i], c })));
ok(cards.length === 55, `운 카드 ${cards.length}`);
ok(cards.every(({ c }) => Array.isArray(c.sound) && c.sound.length >= 1 && c.sound.length <= 3), '55 전부 sound 1~3');
const unk = [...new Set(cards.flatMap(({ c }) => c.sound || []))].filter((n) => !SFX.includes(n)); ok(!unk.length, `카드 소리 이름 전부 SFX ${unk.join(',')}`);
const banHit = cards.filter(({ era, c }) => (BAN[era] || []).some((n) => (c.sound || []).includes(n) || (c.outcomes || []).some((o) => o.sound === n))); ok(!banHit.length, `시대 금지 소리 0 ${banHit.map((x) => x.era + ':' + x.c.id).join(',')}`);
const outs = cards.flatMap(({ c }) => c.outcomes || []); const withO = outs.filter((o) => o.sound);
ok(withO.length >= 100 && withO.length <= outs.length, `결과 ${outs.length} 중 ${withO.length} 에 sound`);
ok(withO.every((o) => SFX.includes(o.sound)), '결과 소리 이름 전부 SFX');
const by = (era, id) => cards.find((x) => x.era === era && x.c.id === id).c;
ok(by('joseon-life', 'luck_tiger').sound[0] === 'tiger' && by('life', 'luck_beast').sound.includes('growl') && !by('life', 'luck_beast').sound.includes('tiger'), '조선 호랑이 = tiger · 구석기 밤 짐승 = growl(호랑이 이름은 안 밝힘)');
ok(by('daehan-life', 'luck_lotto').sound.includes('radio') && by('gaehang-life', 'luck_mine').sound.includes('train') && by('samguk-life', 'luck_monk').sound.includes('moktak'), '복권 라디오 · 금광 기차 · 스님 목탁');
ok(by('bronze-life', 'luck_drought').outcomes.find((o) => o.id === 'hungry').sound === 'breath' && by('joseon-life', 'luck_famine').outcomes.find((o) => o.id === 'borrow').sound === 'paper', '굶음 = 숨 · 환곡 빌림 = 문서');
ok(D.every((d) => d.luck.cards.filter((c) => c.title.includes('흉년') || c.title.includes('가뭄')).every((c) => c.sound.includes('breath'))), '흉년·가뭄 카드엔 숨(breath)');
ok(new Set(cards.map(({ c }) => c.sound.join())).size >= 45, `55 중 다른 장면 ${new Set(cards.map(({ c }) => c.sound.join())).size}`);

// ② 그 뒤 물음 — 열한 시대 q.sound {ok 2, miss 1}, SFX, 시대 금지 0, ok 와 miss 가 겹치지 않음
ok(W.every((w) => w.bridge?.q?.sound && w.bridge.q.sound.ok?.length === 2 && w.bridge.q.sound.miss?.length === 1), '열한 시대 q.sound ok 2 · miss 1');
const qn = [...new Set(W.flatMap((w) => [...w.bridge.q.sound.ok, ...w.bridge.q.sound.miss]))].filter((n) => !SFX.includes(n)); ok(!qn.length, `물음 소리 이름 전부 SFX ${qn.join(',')}`);
ok(W.every((w, i) => !(BAN[ERAS[i]] || []).some((n) => w.bridge.q.sound.ok.includes(n) || w.bridge.q.sound.miss.includes(n))), '물음 소리 시대 금지 0');
ok(W.every((w) => !w.bridge.q.sound.ok.some((n) => w.bridge.q.sound.miss.includes(n))), 'ok 와 miss 가 다름');
ok(W.every((w) => !['good', 'bad'].some((n) => w.bridge.q.sound.ok.includes(n) || w.bridge.q.sound.miss.includes(n))), 'good/bad 대신 시대 소리');

// ③ 엔진 — ask: ok → scene(q.sound.ok, 120) / miss → scene(q.sound.miss, 120) / 없으면 good·bad
const life = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8');
ok(life.includes("if (q.sound?.ok) this.scene(q.sound.ok, 120); else g.sound?.play?.('good', 0.4);"), 'ask ok → 시대 소리, 없으면 good');
ok(life.includes("if (q.sound?.miss) this.scene(q.sound.miss, 120); else g.sound?.play?.('bad', 0.3);"), 'ask miss → 시대 소리, 없으면 bad');
ok(life.includes("this.scene(s.sound);") && life.includes("if (c.sound) cues.unshift(c.sound);"), '운 카드도 showSituation scene · 결과 sound 는 cues 맨 앞(새 엔진 줄 없음)');
const timers = []; globalThis.setTimeout = (f, ms) => { timers.push([ms, f]); };
const played = []; const g = { sound: { play: (n, v) => played.push([n, v]) } };
const { Life } = await import('../core/life.js'); const L = Object.create(Life.prototype); L.g = g;
L.scene(W[7].bridge.q.sound.ok, 120); ok(timers.map(([ms]) => ms).join() === '120,620', `맞음 둘 0.12·0.62초 ${timers.map(([ms]) => ms)}`);
timers.forEach(([, f]) => f()); ok(played.map((p) => p[0]).join() === 'paper,coin', `조선 전기 맞음 = 문서·동전 ${played.map((p) => p[0])}`);
timers.length = 0; played.length = 0; L.scene(W[0].bridge.q.sound.miss, 120); timers.forEach(([, f]) => f()); ok(played.length === 1 && played[0][0] === 'breath', '구석기 틀림 = 숨 하나');

console.log(`test_sound5: ${pass} passed, ${fail} failed`); if (fail) process.exit(1);
