// 짐승 층 ④(115) — 날씨에 따라 짐승 자리가 바뀜 · 벗이 짐승 앞에 같이 섬 · 🐾 만난 짐승 한 줄(끝 카드·족보 줄)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const LS = {}; globalThis.localStorage = { getItem: (k) => LS[k] ?? null, setItem(k, v) { LS[k] = String(v); }, removeItem(k) { delete LS[k]; } };
const { Beasts } = await import('../core/beasts.js');
const { recordBeast, beastsOf, beastLine } = await import('../core/dogam.js');
const { carryRecord, collect, jokboHtml } = await import('../core/jokbo.js');
const { Bond } = await import('../core/bond.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
// ---- 엔진 틀(구석기) ----
const e = { areas: new Map([['deep', new THREE.Vector3(66, 0, 58)], ['grass', new THREE.Vector3(-40, 0, 20)], ['camp', new THREE.Vector3(0, 0, -20)]]), groundY: () => 0, scene: { add() {}, remove() {} }, interactables: new Map() };
const said = []; const flags = new Set(); let collapsed = null;
const story = { isNight: true, cutsceneOn: false, skyName: 'night', snowOn: false };
const g = { era: 'life', e, p: { pos: new THREE.Vector3(66, 0, 58), yaw: 0, moving: false, enabled: true }, flags, inventory: [], world: { ...w, bounds: 116 }, ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false }, sound: { play() {}, thump() {} }, story, danger: { cfg: { nightRadius: 9, food: ['berry', 'meat'] }, hasTorch: () => false, firePos: () => null, collapse: (r, l) => { collapsed = { r, l }; }, collapsing: false }, has: () => false, take() {}, renderInv() {}, save: { touch() {} } };
g.flag = (f) => { for (const x of [].concat(f)) flags.add(x); };
const bs = new Beasts(g, { tiger: { areas: ['deep'], chance: 1, waitSec: 2 }, boar: { areas: ['grass'], chance: 1, waitSec: 2 }, bear: { areas: [] } });
g.beasts = bs;
const run = (sec, step = 0.1, each) => { for (let t = 0; t < sec; t += step) { bs.tick(step); each?.(step); } };
const reset = (x, z, night) => { for (const k of ['tiger', 'boar', 'bear']) { bs.cool[k] = 0; bs.hold[k] = 0; } if (bs.cur) bs.remove(bs.cur); bs.runT = 0; bs.vel = 0; bs.prev = null; g.p.moving = false; g.p.pos.set(x, 0, z); story.isNight = night; story.skyName = night ? 'night' : 'day'; story.snowOn = false; said.length = 0; };
const dist = () => bs.cur ? Math.hypot(bs.cur.origin.x - g.p.pos.x, bs.cur.origin.z - g.p.pos.z) : null;   // 선 자리(origin) — 그 뒤엔 다가온다
// 1) 날씨 없음 — 호랑이 18m
reset(66, 58, true); run(3); ok(bs.cur?.kind === 'tiger' && Math.abs(dist() - 18) < 0.5, `맑은 밤 — 호랑이 18m (${dist()?.toFixed(1)})`);
ok(bs.wxName === null && bs.eff('tiger').far === 18, 'day·night 는 날씨가 아니다 → 기본값');
// 2) 비 오는 밤 — 호랑이 12m + 한 줄 한 번
reset(66, 58, true); story.skyName = 'rainy'; run(3);
ok(bs.cur?.kind === 'tiger' && Math.abs(dist() - 12) < 0.5, `비 오는 밤 — 호랑이 12m (${dist()?.toFixed(1)})`);
ok(said.some((s) => s.includes('빗소리')) && flags.has('beast:tiger:wx:rainy'), '「빗소리에 발소리가 묻혔다」 한 줄 + beast:tiger:wx:rainy');
reset(66, 58, true); story.skyName = 'rainy'; run(3); ok(bs.cur && !said.some((s) => s.includes('빗소리')), '같은 날씨 두 번째는 한 줄 없음(기본 「풀 속에 줄무늬」)');
// 3) 비 — 멧돼지 안 나옴
reset(-40, 20, false); story.skyName = 'rainy'; run(10); ok(!bs.cur && bs.eff('boar').skip === true, '비 오는 낮 — 멧돼지는 숲 속에(skip)');
reset(-40, 20, false); run(3); ok(bs.cur?.kind === 'boar', '맑은 낮 — 멧돼지 나옴');
// 4) 눈 — 호랑이 자리 반경 30(마을 길 가까이) · 멧돼지 뜸함(r 8)
reset(66, 58, true); story.snowOn = true; ok(bs.wxName === 'winter' && bs.eff('tiger').r === 30 && bs.eff('tiger').chance === 0.9 && bs.eff('boar').r === 8, '눈 → winter: 호랑이 r 30·자주, 멧돼지 r 8');
g.p.pos.set(66 + 24, 0, 58); const R0 = Math.random; Math.random = () => 0.1;   /* 131: chance(0.9) 굴림이 3할쯤 비어 흔들리던 것 — 이 한 판만 늘 나오게 */ run(6); Math.random = R0; ok(bs.cur?.kind === 'tiger' && said.some((s) => s.includes('눈 위에 큰 발자국')), '눈 오는 밤, 깊은 숲 중심에서 24m 떨어진 길에서도 호랑이가 선다 + 「눈 위에 큰 발자국」');
reset(66 + 24, 58, true); run(10); ok(!bs.cur, '맑은 밤엔 24m 밖은 자리가 아니다(r 16)');
// 5) 가뭄 — 멧돼지 자주·밭으로
reset(-40, 20, false); story.skyName = 'drought'; ok(bs.eff('boar').chance === 0.9 && bs.eff('boar').waitSec === 2 && bs.eff('boar').r === 20, '가뭄 → 멧돼지 기다림 2초·0.9·r 20'); run(3); ok(bs.cur?.kind === 'boar' && said.some((s) => s.includes('밭으로 내려왔다')), '「산에 먹을 게 없다 — 밭으로」 한 줄');
// 6) 시대 cfg.wx 가 이긴다
const bs2 = new Beasts({ ...g, story: { skyName: 'rainy', isNight: true } }, { tiger: { areas: ['deep'], wx: { rainy: { far: 15 } } } }); ok(bs2.eff('tiger').far === 15, 'world.beasts.tiger.wx.rainy 가 있으면 그 값');
// ---- 벗이 짐승 앞에 같이 선다 ----
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, innerHTML: '' }), head: { appendChild() {} } };
const bflags = new Set(['bond:met', 'bond:friend']); const bsaid = [];
const bg = { e: { scene: { add() {}, remove() {} }, groundY: () => 0 }, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, enabled: true, moving: false }, flags: bflags, restoring: false, ui: { say: (t) => bsaid.push(t), isOpen: () => false }, sound: { play() {} }, story: { skyName: 'night' }, friends: { myWaveUntil: 0 }, beasts: { cur: null }, danger: { collapsing: false }, inventory: [] };
bg.flag = (f) => bflags.add(f);
const bd = new Bond(bg, w.spark.bond); const brun = (sec) => { for (let t = 0; t < sec; t += 0.1) bd.tick(0.1); };
brun(4); const p0 = { x: bd.pos.x, z: bd.pos.z }; bsaid.length = 0;
bg.beasts.cur = { kind: 'tiger', obj: { position: { x: 20, z: 0 } } }; bg.p.pos.set(6, 0, 0); brun(3);
ok(Math.hypot(bd.pos.x - p0.x, bd.pos.z - p0.z) < 0.01 && bflags.has('bond:beast:tiger') && bsaid.filter((s) => s.includes('뛰지 마')).length === 1, '호랑이가 나오면 벗은 그 자리에 서서 「뛰지 마. 가만히. 옆에 있어.」 한 번(따라오지 않음)');
ok(Math.abs(Math.atan2(Math.sin(bd.yaw - Math.atan2(20 - bd.pos.x, 0 - bd.pos.z)), Math.cos(bd.yaw - Math.atan2(20 - bd.pos.x, 0 - bd.pos.z)))) < 0.1, '벗이 짐승 쪽을 본다');
bg.beasts.cur = null; brun(1); ok(bsaid.some((s) => s.includes('갔다. 숨 쉬어')), '짐승이 가면 「…갔다. 숨 쉬어.」');
brun(4); ok(Math.hypot(bd.pos.x - bg.p.pos.x, bd.pos.z - bg.p.pos.z) <= 2.45, '그 뒤 다시 곁으로');
bsaid.length = 0; bg.beasts.cur = { kind: 'boar', obj: { position: { x: 10, z: 10 } } }; brun(1); ok(bsaid.some((s) => s.includes('물러서. 천천히')), '멧돼지엔 「물러서. 천천히.」');
bflags.add('beast:boar:caught'); bg.beasts.cur = null; brun(1); ok(!bsaid.some((s) => s.includes('갔다')), '쓰러졌으면 「갔다」 말 없음');
bsaid.length = 0; bg.beasts.cur = { kind: 'tiger', obj: { position: { x: 20, z: 0 } } }; brun(1); ok(bsaid.filter((s) => s.includes('뛰지 마')).length === 1, '다음 만남에도 「뛰지 마」 한 번(만남마다 한 번, 깃발은 종류별 한 번)');
bg.beasts.cur = null; bflags.delete('bond:friend'); bg.beasts.cur = { kind: 'bear', obj: { position: { x: 0, z: 20 } } }; bsaid.length = 0; brun(2); ok(!bflags.has('bond:beast:bear'), '벗이 아니면(met) 안 선다');
// ---- 🐾 한 줄 ----
recordBeast('life', 'tiger', 'faced'); recordBeast('life', 'bear', 'fed'); recordBeast('life', 'bear', 'fed'); recordBeast('neo', 'boar', 'hit');
const L = beastsOf('life'); ok(L.length === 2 && L.find((b) => b.kind === 'bear').n === 2, 'beastsOf — 이 시대 것만');
ok(beastLine(L) === '🐾 🐅 호랑이 마주 봄 · 🐻 곰 먹을 것을 던짐 ×2' && beastLine([]) === '', `beastLine — ${beastLine(L)}`);
const life = { values: { craft: 3, heart: 2 }, d: {}, cap: () => null, hurt: new Set(), log: [], g: { era: 'life', flags: new Set(), world: w } };
const rec = carryRecord(life, { id: 'x', title: 'x' }); ok(rec.beasts?.length === 2, 'carryRecord 에 beasts 가 실린다');
localStorage.setItem('kworld_carry:life', JSON.stringify(rec));
const chain = JSON.parse(fs.readFileSync(path.join(root, 'eras/chain.json'), 'utf8')); const rows = collect(chain); const html = jokboHtml(chain, rows);
ok(html.includes('jbz') && html.includes('🐾 🐅 호랑이 마주 봄'), '족보 줄에 🐾 한 줄(지난 집 아닌 줄)');
const src = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'); ok(src.includes('beastLine(rec.beasts)') && src.includes("beastLine } from './dogam.js'"), '끝 카드에 🐾 한 줄');
console.log(`\n짐승 층 ④: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
