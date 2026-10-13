// 소리층 — 물 비율(높이맵 공통)·합성 대체(mp3 없을 때)·카드/결과 소리. 가짜 AudioContext.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const made = []; const node = (kind) => new Proxy({ kind, connect() {}, start() {}, stop() {}, gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {} }, frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, Q: { value: 0 } }, { get: (o, k) => (k in o ? o[k] : (made.push(kind + ':' + String(k)), () => {})) });
globalThis.window = { AudioContext: function () { return { currentTime: 0, sampleRate: 8000, destination: {}, createGain: () => (made.push('gain'), node('gain')), createOscillator: () => (made.push('osc'), node('osc')), createBiquadFilter: () => node('filter'), createBuffer: () => ({ getChannelData: () => new Float32Array(16000) }), createBufferSource: () => (made.push('buf'), node('buf')), decodeAudioData: () => Promise.resolve({}) }; }, addEventListener() {}, removeEventListener() {} };
globalThis.location = { search: '' }; globalThis.localStorage = { getItem: () => null, setItem() {} };
globalThis.document = { createElement: () => ({ style: {}, addEventListener() {} }), body: { appendChild() {} } };
globalThis.fetch = () => Promise.resolve({ ok: false }); globalThis.setTimeout = (f) => f();
const { Sound } = await import('../core/sound.js');
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
console.log(`sound ${pass}/${fail}`); if (fail) process.exit(1);
