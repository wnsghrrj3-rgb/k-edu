// 123: 사건·선택지 소리 — 열한 시대 상황 302 전부 소리 장면(1~3) · 선택지 370여 개 sound · 시대에 없는 소리 없음 · life.scene 이 카드 뒤 겹쳐 튼다
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
globalThis.window = { addEventListener() {}, removeEventListener() {} }; globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} }; globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
const { SFX } = await import('../core/sound.js');
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const D = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/life.json`), 'utf8')));
const sits = D.flatMap((d) => d.situations); const chs = sits.flatMap((s) => s.choices || []);
ok(sits.length >= 300 && sits.every((s) => Array.isArray(s.sound) && s.sound.length >= 1 && s.sound.length <= 3), `상황 ${sits.length} 전부 소리 장면 1~3`);
const unk = [...new Set([...sits.flatMap((s) => s.sound), ...chs.map((c) => c.sound).filter(Boolean)])].filter((n) => !SFX.includes(n)); ok(!unk.length, `이름 전부 SFX 에 ${unk.join(',')}`);
const withC = chs.filter((c) => c.sound).length; ok(withC >= 300 && withC < chs.length, `선택지 ${chs.length} 중 ${withC} 에 sound(제목이 분명한 것만)`);
const BAN = { life: ['paper', 'chatter', 'coin', 'gong', 'bell', 'moktak', 'train', 'saw', 'horse', 'cart', 'loom', 'hoe', 'cow', 'hammer', 'anvil', 'bellows', 'radio', 'car', 'siren'], neo: ['paper', 'coin', 'bell', 'moktak', 'train', 'saw', 'horse', 'anvil', 'bellows', 'radio', 'car'], 'joseon-life': ['train', 'saw', 'radio', 'car', 'siren'], 'daehan-life': ['growl', 'boar', 'knap'] };
const bad = []; for (const [i, d] of D.entries()) { const b = BAN[ERAS[i]]; if (!b) continue; for (const s of d.situations) { for (const n of s.sound) if (b.includes(n)) bad.push(ERAS[i] + ':' + s.id + ':' + n); for (const c of s.choices || []) if (c.sound && b.includes(c.sound)) bad.push(ERAS[i] + ':' + s.id + '/' + c.id + ':' + c.sound); } }
ok(!bad.length, `시대에 없는 소리 없음(구석기 동전·종이·쇠, 대한민국 호랑이) ${bad.slice(0, 5).join(',')}`);
const by = (e, id) => D[ERAS.indexOf(e)].situations.find((s) => s.id === id)?.sound || [];
ok(by('joseon-life', 'imjin').includes('drum') && by('joseon-life', 'imjin').includes('horn'), '임진왜란 = 북·나팔');
ok(by('samguk-life', 'temple').includes('moktak') && by('samguk-life', 'iron').includes('anvil'), '삼국 절 목탁 · 대장간 모루');
ok(by('joseon-late-life', 'jangsi').includes('chatter') && by('joseon-late-life', 'jangsi').includes('coin'), '장시 = 웅성·동전');
ok(by('daehan-life', 'gwangbok').includes('radio') && by('daehan-life', 'sanupwha').includes('train'), '광복 라디오 · 산업화 기차');
ok(by('life', 'hunt').includes('growl') && by('neo', 'seed').includes('hoe'), '구석기 사냥 으르렁 · 신석기 씨 호미');
ok(new Set(D.map((d) => JSON.stringify(d.situations.map((s) => s.sound)))).size === ERAS.length, '열한 시대 소리 장면이 전부 다르다');
// 엔진: life.scene 이 카드 뒤 0.45초부터 0.5초 간격, 첫 소리 0.38·다음 0.3, 셋까지 · 문자열 하나도 됨 · 없으면 조용
const life = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8');
ok(life.includes("g.sound?.play?.('card', 0.6); this.scene(s.sound);") && life.includes('scene(list) {'), 'showSituation: card 뒤 scene(s.sound)');
const timers = []; globalThis.setTimeout = (f, ms) => { timers.push([ms, f]); };
const played = []; const g = { sound: { play: (n, v) => played.push([n, v]) } };
const { Life } = await import('../core/life.js'); const L = Object.create(Life.prototype); L.g = g;
L.scene(['drum', 'horn', 'horse', 'extra']); ok(timers.length === 3 && timers.map(([ms]) => ms).join() === '450,950,1450', `세 소리 0.45·0.95·1.45초 (넷째는 버림) ${timers.map(([ms]) => ms)}`);
timers.forEach(([, f]) => f()); ok(played.length === 3 && played[0][1] === 0.38 && played[1][1] === 0.3, '첫 0.38 · 다음 0.3');
timers.length = 0; played.length = 0; L.scene('paper'); timers.forEach(([, f]) => f()); ok(played.length === 1 && played[0][0] === 'paper', '문자열 하나도 됨');
timers.length = 0; L.scene(undefined); L.scene(null); ok(!timers.length, '없으면 조용');
console.log(`sound3 ${pass}/${fail}`); if (fail) process.exit(1);
// 123 ②: 큰 사건(deadline)·쫓김(chase) 소리 장면 — 열한 시대 데이터 + pulse 가 scene 을 부른다
{ let p2 = 0, f2 = 0; const ok2 = (c, m) => { c ? p2++ : f2++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
  const W = ERAS.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')).pulse);
  ok2(W.every((p) => p.deadlines.every((d) => Array.isArray(d.sound) && d.sound.length === 3) && p.chases.every((c) => Array.isArray(c.sound) && c.sound.length === 3)), `큰 사건 ${W.reduce((n, p) => n + p.deadlines.length, 0)}·쫓김 ${W.length} 전부 소리 셋`);
  const un = W.flatMap((p) => [...p.deadlines, ...p.chases]).flatMap((x) => x.sound).filter((n) => !SFX.includes(n)); ok2(!un.length, `이름 전부 SFX 에 ${un.join(',')}`);
  const dl = (e, id) => W[ERAS.indexOf(e)].deadlines.find((d) => d.id === id).sound;
  ok2(dl('joseon-life', 'imjin').includes('horn') && dl('daehan-life', 'jeonjaeng').includes('siren') && dl('life', 'flood').includes('splash') && dl('goryeo-life', 'land').includes('flint'), '임진 나팔 · 전쟁 사이렌 · 강 넘침 물 · 땅문서 불');
  ok2(W[1].chases[0].sound.includes('tiger') && W[7].chases[0].sound.includes('whistle') && !W[0].chases[0].sound.includes('horse'), '신석기 호랑이 쫓김 · 조선 포졸 호각 · 구석기 말 없음');
  const pulse = fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8');
  ok2(pulse.includes("g.sound?.play?.('drum', 0.4); g.life?.scene?.(d.sound);") && pulse.includes("g.life?.scene?.(c.sound);"), 'pulse: 큰 사건·쫓김 시작에 life.scene');
  console.log(`sound3② ${p2}/${f2}`); if (f2) process.exit(1); }
