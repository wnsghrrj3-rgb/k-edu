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
// 124: 규칙 소리 중 어색한 것 손으로 고침 — 「세금」이 쇠로, 「두 배」가 바다로 잡히던 것 등(핸드오프 kworld/game/fix_sounds124.py)
{ let p3 = 0, f3 = 0; const ok3 = (c, m) => { c ? p3++ : f3++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
  const ch = (e, s, c) => D[ERAS.indexOf(e)].situations.find((x) => x.id === s).choices.find((x) => x.id === c);
  ok3(!by('silla-life', 'famine').some((n) => ['bellows', 'anvil'].includes(n)), '통일신라 「흉년인데 세금」 — 쇠 소리 없음');
  ok3(ch('goryeo-life', 'bugok', 'pay').sound === 'coin', '고려 부곡 「두 배를 냈다」 = 동전(바다 아님)');
  ok3(by('neo', 'tiger').includes('tiger') && by('life', 'bear').includes('bear'), '신석기 밤 큰 울음 = 호랑이 · 구석기 동굴 = 곰');
  ok3(!by('life', 'fire').includes('drum') && by('life', 'stone').includes('knap'), '구석기 밤·짐승 북 없음 · 맨손 = 돌 깨기');
  ok3(by('daehan-life', 'dmz').includes('siren') && !by('daehan-life', 'dmz').includes('horse'), '휴전선 = 사이렌(말·수레 아님)');
  ok3(by('samguk-life', 'beacon').includes('horn') && !by('samguk-life', 'beacon').includes('splash'), '삼국 봉화 = 나팔(물 아님)');
  ok3(!ch('bronze-life', 'salt', 'no').sound && ch('joseon-life', 'imjin', 'lead').sound === 'horn', '「안 샀다」 소리 없음 · 의병 = 나팔');
  ok3(sits.every((s) => s.sound.length >= 1 && s.sound.length <= 3), '고친 뒤에도 상황 전부 1~3');
  console.log(`sound3③ ${p3}/${f3}`); if (f3) process.exit(1); }
// 124 ②: 예고 — 섞여 상황 자리에 가까워지면(반지름 2.2배 안) 그 상황 첫 소리 0.2 한 번 · 꼭 나오는 상황은 안 함 · 열리면 그대로 · 카드 열려 있으면 안 함 · 되감으면 다시
{ let p4 = 0, f4 = 0; const ok4 = (c, m) => { c ? p4++ : f4++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
  const played4 = []; const flags = new Set(); let uiOpen = false;
  const g4 = { sound: { play: (n, v) => played4.push([n, v]) }, flags, flag: (f) => flags.add(f), ui: { isOpen: () => uiOpen, setGoal() {}, open() {} }, p: { pos: { x: 0, z: 0 }, enabled: true }, e: { areas: new Map([['area_a', { x: 20, z: 0 }], ['area_m', { x: 0, z: 20 }]]) }, cond: () => true, inventory: [] };
  const L4 = Object.create(Life.prototype); L4.g = g4; L4.d = {}; L4.opened = new Set(); L4.done = new Set(); L4.queue = []; L4.log = []; L4.cond = () => true; L4.flush = () => {}; L4.prepHint = () => {}; L4.doThen = () => {};
  L4.d.situations = [{ id: 'mix', place: 'area_a', sound: ['gull', 'wave'] }, { id: 'must', must: true, place: 'area_m', sound: ['drum'] }]; L4.mixed = ['mix'];
  const tick = () => { L4.t = 1; L4.tick(1); };
  g4.p.pos = { x: -20, z: -20 }; tick(); ok4(!played4.length, '멀면(28m 넘게) 조용');
  g4.p.pos = { x: 0, z: 0 }; tick(); ok4(played4.length === 1 && played4[0][0] === 'gull' && played4[0][1] === 0.2 && !L4.opened.has('mix'), '20m 안 — 첫 소리 gull 0.2, 아직 안 열림');
  ok4(!played4.some(([n]) => n === 'drum') && !L4.opened.has('must'), '꼭 나오는 상황(20m)은 예고 없음');
  tick(); ok4(played4.length === 1, '같은 상황 다시 안 함');
  g4.p.pos = { x: 15, z: 0 }; tick(); ok4(L4.opened.has('mix') && played4.length === 1, '11m 안 — 열림(예고는 더 안 남)');
  L4.opened.delete('mix'); L4.hinted.delete('mix'); played4.length = 0; uiOpen = true; g4.p.pos = { x: 0, z: 0 }; tick(); ok4(!played4.length, '카드 열려 있으면 조용'); uiOpen = false;
  flags.clear(); L4.opened.add('mix'); L4.hinted.add('mix'); L4.afterCollapse?.('test'); ok4(!L4.hinted.has('mix') && !L4.opened.has('mix'), '쓰러져 되감으면(sit:open 없음) 예고도 다시');
  console.log(`sound3④ ${p4}/${f4}`); if (f4) process.exit(1); }
