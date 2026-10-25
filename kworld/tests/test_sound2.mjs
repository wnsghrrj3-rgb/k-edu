// 122: 효과음 다양하게 — 장소 층 넷(market·forge·forest·road) · 장소별 한 번 소리(nearSfx) 겹치기 · 결 나누기(alert 가 울리면 환경 duck) · 새 소리 11
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const made = []; const targets = []; const calls = [];
const node = (kind) => new Proxy({ kind, connect(t) { targets.push([kind, t?.id || t?.kind || '?']); }, start() {}, stop() {}, gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime(v, t, c) { calls.push(['target', kind, v, t, c]); }, cancelScheduledValues() {} }, frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, Q: { value: 0 } }, { get: (o, k) => (k in o ? o[k] : (made.push(kind + ':' + String(k)), () => {})) });
let gid = 0;
globalThis.window = { AudioContext: function () { return { currentTime: 5, sampleRate: 8000, destination: { kind: 'dest' }, createGain: () => { made.push('gain'); const n = node('gain'); n.id = 'g' + (gid++); return n; }, createOscillator: () => (made.push('osc'), node('osc')), createBiquadFilter: () => node('filter'), createBuffer: () => ({ getChannelData: () => new Float32Array(16000) }), createBufferSource: () => (made.push('buf'), node('buf')), decodeAudioData: () => Promise.resolve({}) }; }, addEventListener() {}, removeEventListener() {} };
globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
globalThis.fetch = () => Promise.resolve({ ok: false }); globalThis.setTimeout = (f) => f();
const { Sound, SFX, CAT, LAYERS } = await import('../core/sound.js');
// 새 소리 11 전부 SFX 에 있고 합성됨
const NEW = ['chatter', 'cart', 'bellows', 'anvil', 'saw', 'pour', 'child', 'gull', 'moktak', 'radio', 'siren'];
ok(NEW.every((n) => SFX.includes(n)) && new Set(SFX).size === SFX.length, `새 소리 11 전부 SFX(${SFX.length})에, 겹침 없음`);
const snd = new Sound({ e: { hm: null, areas: new Map(), onFrame: [] }, p: { pos: { x: 0, z: 0 }, keys: {} } }); snd.init();
const miss = NEW.filter((n) => { made.length = 0; return !snd.synth(n) || !made.length; }); ok(!miss.length, `새 소리 전부 합성 ${miss.join(',')}`);
made.length = 0; snd.synth('anvil'); ok(made.filter((m) => m === 'osc').length >= 6, 'anvil: 쇠 울림(사인 둘×3)'); made.length = 0; snd.synth('hammer'); ok(!made.includes('osc'), 'hammer 는 잡음만 — anvil 과 결이 다르다');
// 세 길 + 장소 층 넷
ok(snd.bus?.amb && snd.bus.act && snd.bus.alert, '세 길 amb·act·alert');
ok(LAYERS.length === 8 && ['market', 'forge', 'forest', 'road'].every((k) => snd.layers[k]), '장소 층 넷(market·forge·forest·road) + 기존 넷');
const ambId = snd.bus.amb.id; const layerTargets = Object.values(snd.layers).map((L) => targets.find(([k, t]) => k === 'gain' && t === ambId)); ok(layerTargets.every(Boolean), '환경 층은 전부 amb 길로');
// 결: 짐승·급한 일 = alert, 귓속말·카드 = act
ok(Sound.cat('tiger') === 'alert' && Sound.cat('late') === 'alert' && Sound.cat('drum') === 'alert' && Sound.cat('rumor') === 'act' && Sound.cat('card') === 'act' && Sound.cat('chatter') === 'act', 'cat: tiger/late/drum=alert · rumor/card/chatter=act');
// duck: alert 가 울리면 amb 가 움츠렸다가 제자리
calls.length = 0; await snd.play('tiger', 0.8); const d = calls.filter(([, k, v]) => k === 'gain' && v < 1 && v > 0 && v <= 0.35); const back = calls.filter(([, k, v, t]) => k === 'gain' && v === 1 && t > 5);
ok(d.length >= 1 && back.length >= 1, `tiger: amb 움츠림(${d[0]?.[2]}) → 제자리(${back[0]?.[3]}초 뒤)`);
calls.length = 0; await snd.play('card'); ok(!calls.some(([, k, v]) => k === 'gain' && v < 1 && v > 0), 'card: 움츠림 없음');
// 합성 소리는 그 결의 길로 간다 — tiger 의 gn 은 alert 로, card 는 act 로
targets.length = 0; snd.synth('tiger'); ok(targets.some(([k, t]) => k === 'gain' && t === snd.bus.alert.id) && !targets.some(([k, t]) => k === 'gain' && t === snd.bus.act.id), 'tiger 합성 → alert 길');
targets.length = 0; snd.synth('card'); ok(targets.some(([k, t]) => k === 'gain' && t === snd.bus.act.id), 'card 합성 → act 길');
// 데이터: 열한 시대 nearSfx · 이름 전부 SFX · 구역 존재 · 장소 층 쓰임
const eras = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const W = eras.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')));
ok(W.every((w) => w.ambience.nearSfx && Object.keys(w.ambience.nearSfx).length >= 8), '열한 시대 전부 nearSfx(8곳 이상)');
const bad = []; for (const [i, w] of W.entries()) { const ids = Array.isArray(w.areas) ? w.areas.map((a) => a.id) : Object.keys(w.areas); for (const [id, list] of Object.entries(w.ambience.nearSfx)) { if (!ids.includes(id)) bad.push(eras[i] + ':' + id); for (const n of list) if (!SFX.includes(n)) bad.push(eras[i] + ':' + n); } for (const [id, lay] of Object.entries(w.ambience.near)) { if (!ids.includes(id)) bad.push(eras[i] + ':near:' + id); if (!LAYERS.includes(lay)) bad.push(eras[i] + ':lay:' + lay); } }
ok(!bad.length, `nearSfx·near 구역·이름 전부 맞음 ${bad.join(',')}`);
ok(W.slice(2).every((w) => Object.values(w.ambience.near).includes('market')) && W.slice(3, 9).every((w) => Object.values(w.ambience.near).includes('forge')) && W.slice(9).every((w) => Object.values(w.ambience.near).includes('machines')) && W.every((w) => Object.values(w.ambience.near).includes('forest') || Object.values(w.ambience.near).includes('road')), '청동기~ 장터 층 · 고조선~조선 후기 공방 층 · 개항·대한민국 기계 층 · 전 시대 숲/길 층');
ok(!W[0].ambience.nearSfx.camp.includes('coin') && W[10].ambience.nearSfx.sueri.includes('radio') && W[4].ambience.nearSfx.temple.includes('moktak') && !JSON.stringify(W[0].ambience.nearSfx).includes('bell'), '구석기 막집엔 동전 없음 · 대한민국 전파사 라디오 · 삼국 절 목탁 · 구석기에 종 없음');
ok(new Set(W.map((w) => JSON.stringify(w.ambience.nearSfx))).size === eras.length, '열한 시대 장소 소리가 전부 다르다');
// tick: 조선 전기 장터 곁 낮 → market 층 켜짐·crowd 아님 · 밤 → market 0 · 장터 소리가 섞여 나온다
const w7 = W[7]; const areas = new Map([['jangteo', { x: 0, z: 6 }], ['sagiso', { x: 150, z: 90 }], ['naru', { x: 9, z: 93 }]]);   /* 구역 자리는 GLB 에서 오니 가짜로 */ const ja = areas.get('jangteo');
const set = [], played = []; const S2 = new Sound({ e: { hm: null, areas, onFrame: [] }, p: { pos: { x: ja.x, z: ja.z }, keys: {} }, world: { ambience: w7.ambience }, story: { isNight: false }, ui: { isOpen: () => false } }); S2.init(); S2.set = (k, v) => { S2.level[k] = v; set.push([k, +v.toFixed(2)]); }; S2.play = (n, g) => played.push([n, +g.toFixed(2)]);
S2.tick(0.7); ok(set.some(([k, v]) => k === 'market' && v > 0.15), `장터 곁 낮: market 층 ${JSON.stringify(set)}`);
ok(S2.nearSfx?.length && S2.nearSfx[0].list.includes('chatter'), 'nearSfx 후보에 장터(chatter)');
for (let i = 0; i < 400; i++) S2.tick(0.7); const jn = new Set(w7.ambience.nearSfx.jangteo); const nearHits = played.filter(([n]) => jn.has(n)).length; const baseHits = played.filter(([n]) => !jn.has(n)).length;
ok(played.length >= 8 && nearHits >= 3 && baseHits >= 1, `장터 곁 280초: 한 번 소리 ${played.length}번 — 장터 소리 ${nearHits}·바탕 소리 ${baseHits} (둘 다 섞임)`);
ok(played.filter(([n]) => jn.has(n)).every(([, g]) => g >= 0.35 && g <= 0.56), '장터 소리는 가까울수록 조금 크게(0.35~0.55)');
S2.g.story.isNight = true; set.length = 0; played.length = 0; S2.tick(0.7); for (let i = 0; i < 80; i++) S2.tick(0.7);
ok(set.some(([k, v]) => k === 'market' && v === 0) && !played.some(([n]) => jn.has(n)), '밤: market 꺼지고 장터 소리 안 섞임');
S2.g.story.isNight = false; S2.g.p.pos = { x: ja.x + 300, z: ja.z }; set.length = 0; S2.tick(0.7); ok(S2.level.market === 0 && !set.some(([k, v]) => k === 'market' && v > 0), '멀어지면 market 0');
// 사기소(공방) 곁 → forge 층
const sg = areas.get('sagiso'); S2.g.p.pos = { x: sg.x, z: sg.z }; set.length = 0; S2.tick(0.7); ok(set.some(([k, v]) => k === 'forge' && v > 0.1), '사기소 곁: forge 층');
// 발소리·심장은 그대로(act 길)
made.length = 0; S2.g.p.moving = true; S2.tick(0.6); ok(made.includes('buf'), '걸으면 발소리 그대로');
console.log(`sound2 ${pass}/${fail}`); if (fail) process.exit(1);
