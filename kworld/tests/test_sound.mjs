// 소리층 — 물 비율(높이맵 공통)·합성 대체(mp3 없을 때)·카드/결과 소리. 가짜 AudioContext.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const made = []; const node = (kind) => new Proxy({ kind, connect() {}, start() {}, stop() {}, gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {} }, frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, Q: { value: 0 } }, { get: (o, k) => (k in o ? o[k] : (made.push(kind + ':' + String(k)), () => {})) });
globalThis.window = { AudioContext: function () { return { currentTime: 0, sampleRate: 8000, destination: {}, createGain: () => (made.push('gain'), node('gain')), createOscillator: () => (made.push('osc'), node('osc')), createBiquadFilter: () => node('filter'), createBuffer: () => ({ getChannelData: () => new Float32Array(16000) }), createBufferSource: () => (made.push('buf'), node('buf')), decodeAudioData: () => Promise.resolve({}) }; }, addEventListener() {}, removeEventListener() {} };
globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
globalThis.fetch = () => Promise.resolve({ ok: false }); globalThis.setTimeout = (f) => f();
const { Sound, SFX } = await import('../core/sound.js');
// 물 비율 — 통일신라 높이맵 실제 파일로
const hm = JSON.parse(fs.readFileSync(path.join(root, 'eras/silla-life/height.json'), 'utf8'));
const e = { hm, areas: new Map(), onFrame: [], groundY(x, z) { const m = this.hm; const by = -z; const fx = (x + m.ext) / (2 * m.ext) * (m.n - 1), fy = (by + m.ext) / (2 * m.ext) * (m.n - 1); const i = Math.max(0, Math.min(m.n - 2, Math.floor(fx))), j = Math.max(0, Math.min(m.n - 2, Math.floor(fy))); return m.h[j][i]; } };
const vVillage = Sound.waterLevel(e, 0, 0), vRiver = Sound.waterLevel(e, 56, 78);
ok(vVillage < 0.05, `마을 한가운데는 강물 소리 거의 0 (${vVillage.toFixed(3)})`);
ok(vRiver > 0.2 && vRiver <= 0.34, `여울(56,78) 곁은 강물 소리 (${vRiver.toFixed(3)})`);
ok(Sound.waterLevel({ areas: new Map([['river', { x: 0, z: 0 }]]) }, 3, 0) > 0.25, '높이맵 없으면 river 구역 거리로');
ok(Sound.waterLevel({ areas: new Map() }, 0, 0) === null, '둘 다 없으면 null');
// 합성 대체 — mp3 없을 때
const g = { e, p: { pos: { x: 0, z: 0 } } }; const snd = new Sound(g); snd.init(); made.length = 0;
await snd.play('growl', 0.5); ok(snd.samples.growl === null && made.includes('buf') && made.includes('osc'), 'growl: mp3 없으면 합성(잡음+낮은 톱니)');
made.length = 0; await snd.play('card'); ok(made.includes('buf') && !made.includes('osc'), 'card: 짧은 잡음 한 번');
made.length = 0; await snd.play('good'); ok(made.filter((m) => m === 'osc').length >= 2, 'good: 두 음');
made.length = 0; await snd.play('bad'); ok(made.filter((m) => m === 'osc').length >= 2, 'bad: 쿵 + 내려가는 음');
made.length = 0; await snd.play('nothing_known'); ok(!made.length, '모르는 이름은 조용히');
// 발소리·심장은 그대로
made.length = 0; g.p.moving = true; g.p.keys = {}; snd.tick(0.6); ok(made.includes('buf'), '걸으면 발소리');
// life.js 가 카드·결과 소리를 부름
const life = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8');
ok(life.includes("play?.('card'") && life.includes("c.bad ? 'bad' : 'good'"), 'life.js: 상황 카드=card · 결과=good/bad');
// 시대 분위기 — world.json ambience 가 열한 시대에 서로 다르게, tick 이 장소·밤낮에 따라 층을 올린다
const eras = ['life','neo','bronze-life','gojoseon-life','samguk-life','silla-life','goryeo-life','joseon-life','joseon-late-life','gaehang-life','daehan-life'];
const ambs = eras.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')).ambience);
ok(ambs.every((a) => a && a.near && a.day?.length && a.night?.length), '열한 시대 전부 ambience(near·day·night)');
ok(new Set(ambs.map((a) => JSON.stringify([a.base, Object.values(a.near).sort(), a.day]))).size === eras.length, '열한 시대 분위기가 전부 다르다');
ok(!ambs[0].day.includes('dog') && ambs[0].night.includes('wolf') && ambs[10].day.includes('car') && !ambs[10].night.includes('wolf'), '구석기 낮엔 개 없음·밤 늑대 / 대한민국 낮 자동차·밤 늑대 없음');
for (const [i, a] of ambs.entries()) for (const id of Object.keys(a.near)) { const w = JSON.parse(fs.readFileSync(path.join(root, `eras/${eras[i]}/world.json`), 'utf8')); const ids = Array.isArray(w.areas) ? w.areas.map((x) => x.id) : Object.keys(w.areas || {}); if (!ids.includes(id)) ok(false, `${eras[i]} near ${id} 구역 없음`); }
ok(true, 'near 구역 이름이 전부 그 시대 구역에 있다');
const set = []; const S2 = new Sound({ e: { hm: null, areas: new Map([['jangteo', { x: 0, z: 0 }], ['hang', { x: 200, z: 0 }]]), onFrame: [] }, p: { pos: { x: 0, z: 0 }, keys: {} }, world: { ambience: ambs[9] }, story: { isNight: false }, ui: { isOpen: () => true } }); S2.init(); S2.set = (k, v) => { S2.level[k] = v; set.push([k, +v.toFixed(2)]); };
S2.tick(0.7); ok(set.some(([k, v]) => k === 'crowd' && v > 0.1) && !set.some(([k, v]) => k === 'sea' && v > 0), '개항 장터 곁 낮: 사람 소리 켜짐·바다 안 켜짐');
S2.g.story.isNight = true; set.length = 0; S2.tick(0.7); ok(set.some(([k, v]) => k === 'crowd' && v === 0) && set.some(([k, v]) => k === 'insects' && v > 0), `밤: 사람 소리 꺼지고 벌레 소리 (${JSON.stringify(set)})`);
S2.g.p.pos = { x: 200, z: 0 }; set.length = 0; S2.tick(0.7); ok(set.some(([k, v]) => k === 'sea' && v > 0.1), '부두 곁: 바다 소리');
for (const n of ['bird', 'owl', 'dog', 'rooster', 'hammer', 'horse', 'train', 'car']) { made.length = 0; snd.synth(n); if (!made.length) ok(false, `${n} 합성 없음`); }
ok(true, '한 번 소리 여덟 가지 전부 합성됨');

// 108: 효과음 층 넓히기 — SFX 60여 종 전부 합성됨 · 절뚝 발소리 · 숨소리 · 호출부 연결 · 시대 분위기 짐승
ok(SFX.length >= 60, `SFX 이름 ${SFX.length}개(≥60)`);
const missing = []; for (const n of SFX) { made.length = 0; if (!snd.synth(n)) missing.push(n); else if (!made.length) missing.push(n + '(빈)'); }
ok(!missing.length, `SFX 전부 합성됨 ${missing.length ? '— 빠짐: ' + missing.join(',') : ''}`);
ok(new Set(SFX).size === SFX.length, 'SFX 이름 겹침 없음');
// 절뚝: 다리 다치면 한 걸음 걸러 끌리는 소리(osc 쿵 포함) · 멀쩡하면 잡음만
const g2 = { e, p: { pos: { x: 0, z: 0 }, moving: true, keys: {} }, life: { hurt: new Set(['leg']) } }; const S3 = new Sound(g2); S3.init();
made.length = 0; S3.tick(0.7); S3.tick(0.7); const limpOsc = made.filter((m) => m === 'osc').length; ok(limpOsc >= 1, `절뚝 — 두 걸음 중 한 번은 끌리는 소리(osc ${limpOsc})`);
g2.life.hurt.clear(); made.length = 0; S3.stepT = 0; S3.stepN = 0; S3.tick(0.7); S3.tick(0.7); ok(!made.includes('osc'), '멀쩡하면 발소리는 잡음만');
// 숨소리: 4초 넘게 달리면
g2.p.keys.ShiftLeft = true; made.length = 0; for (let i = 0; i < 12; i++) S3.tick(0.5); ok(made.includes('buf'), '6초 달리면 숨소리');
S3.runT = 0; g2.p.keys.ShiftLeft = false; S3.tick(0.5); ok(S3.runT === 0, '걸으면 달리기 시간 0');
// 호출부
const src = (f) => fs.readFileSync(path.join(root, 'core', f), 'utf8');
ok(src('ui.js').includes('this.onGray?.()') && src('game.js').includes("play?.('locked'"), '회색 단추 → locked');
ok(src('life.js').includes("cues.push(c.heart > 0 ? 'heart' : 'bad')") && src('life.js').includes("'capped' : 'rank'") && src('life.js').includes('480 + i * 380'), 'life.finish 값 소리(craft·heart·grain·rank/capped) 결과 카드 뒤 차례로');
ok(src('life.js').includes("play?.('status'") && src('life.js').includes("play?.('hurt'") && src('life.js').includes("play?.('luck'") && src('life.js').includes("play?.('jokbo'") && src('life.js').includes("play?.('paper'"), 'life: 신분·상처·운 카드·족보·도감');
ok(src('pulse.js').includes("play?.('tick'") && src('pulse.js').includes("play?.('late'") && src('pulse.js').includes("play?.('meet'") && src('pulse.js').includes("play?.('secret'"), 'pulse: 마지막 10초 틱·늦음·한마디·숨은 것');
ok(src('danger.js').includes("play?.('fall'") && src('danger.js').includes("play?.('wake'"), 'danger: 쓰러짐·눈 뜸');
ok(src('game.js').includes("play?.('eat'") && src('game.js').includes("play?.('gate'") && src('game.js').includes("'splash'") && src('game.js').includes("'knap'"), 'game: 먹기·시대 문·줍기(자리별)·만들기');
ok(src('bond.js').includes("play?.('wave'") && src('friends.js').includes("play?.('wave'") && src('spark.js').includes("play?.('star'"), 'bond/friends 손 흔들기 · 별똥별');
// 시대 분위기 — 새 이름이 전부 SFX 에 있고, 구석기~고조선·조선 밤엔 호랑이, 개항·대한민국 낮엔 기적
const amb2 = eras.map((e) => JSON.parse(fs.readFileSync(path.join(root, `eras/${e}/world.json`), 'utf8')).ambience);
const unknown = amb2.flatMap((a) => [...a.day, ...a.night]).filter((n) => !SFX.includes(n));
ok(!unknown.length, `ambience 소리 이름 전부 SFX 에 있음 ${unknown.length ? unknown.join(',') : ''}`);
ok([0, 1, 2, 3].every((i) => amb2[i].night.includes('tiger')) && amb2[7].night.includes('tiger') && !amb2[10].night.includes('tiger'), '구석기~고조선·조선 전기 밤 호랑이 · 대한민국 밤엔 없음');
ok(amb2[9].day.includes('whistle') && amb2[10].day.includes('whistle') && !amb2[0].day.includes('whistle'), '개항·대한민국 낮 기적 · 구석기엔 없음');
console.log(`sound ${pass}/${fail}`); if (fail) process.exit(1);
