// 짐승 층 ③(114) — 짐승을 만난 뒤 마을 사람 한마디(gaze.rules bk_*) · 칭호 · 짐승 도감(kworld_beasts)
//  · 열한 시대 데이터: 그 시대에 나오는 짐승만, 깃발은 beasts.js 가 실제로 세우는 것만, 연도 0
//  · 엔진: 호랑이 돌아선 까닭이 나뉨(마주 봄 / 걸어서 / 불빛) → 칭호는 「마주 봄」만 · 도감에 적힘 · 덮침도 적힘
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const LS = {}; globalThis.localStorage = { getItem: (k) => LS[k] ?? null, setItem(k, v) { LS[k] = String(v); }, removeItem(k) { delete LS[k]; } };
const { Beasts } = await import('../core/beasts.js');
const { recordBeast, beastLog, beastHtml, BEAST, HOW, BEAST_CSS } = await import('../core/dogam.js');
const { Spark } = await import('../core/spark.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const SRC = fs.readFileSync(path.join(root, 'core/beasts.js'), 'utf8');
const EMITS = { tiger: ['faced', 'walked', 'lit', 'passed', 'caught', 'seen', 'near', 'met'], bear: ['faced', 'walked', 'lit', 'winter', 'fed', 'caught', 'reared', 'seen', 'met'], boar: ['fled', 'hit', 'passed', 'seen', 'near', 'met'] };
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const kinds = Object.keys(w.beasts || {});
  const rules = w.spark.gaze.rules.filter((r) => r.id.startsWith('bk_')); const titles = w.spark.titles.filter((t) => /beast:/.test(t.on));
  const flagsIn = (s) => (s.match(/beast:\w+:\w+/g) || []);
  const okFlags = (s) => flagsIn(s).every((f) => { const [, k, h] = f.split(':'); return kinds.includes(k) && EMITS[k]?.includes(h); });
  ok(rules.length >= 2 && rules.every((r) => r.once && okFlags(r.if) && r.text.length > 10 && !/\d{3,4}년/.test(r.text)), `${era}: 짐승 한마디 ${rules.length} — 이 시대 짐승 깃발만 · once · 연도 0`);
  ok(kinds.every((k) => rules.some((r) => r.if.startsWith('beast:' + k))), `${era}: 나오는 짐승(${kinds.join('·')})마다 한마디가 있다`);
  ok(titles.length >= 1 && titles.every((t) => okFlags(t.on) && t.name && t.line), `${era}: 짐승 칭호 ${titles.length} — 깃발이 실제로 서는 것`);
  ok(titles.some((t) => t.id === 'threebeasts') === ['tiger', 'bear', 'boar'].every((k) => kinds.includes(k)), `${era}: 「산을 아는 사람」은 셋 다 나오는 시대에만`);
  ok(titles.filter((t) => t.bitter).every((t) => /caught/.test(t.on)), `${era}: 쓴 이름은 덮쳐짐에만`);
  ok(new Set(w.spark.gaze.rules.map((r) => r.id)).size === w.spark.gaze.rules.length && new Set(w.spark.titles.map((t) => t.id)).size === w.spark.titles.length, `${era}: 규칙·칭호 id 겹침 없음`);
}
ok(['faced', 'walked', 'lit', 'winter', 'passed'].every((h) => SRC.includes(`'${h}'`)) && SRC.includes("this.rec('tiger', 'caught')") && SRC.includes("this.rec('bear', 'caught')"), 'beasts.js — 돌아선 까닭 다섯·덮침 기록');
// ---- 엔진(구석기) ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
const e = { areas: new Map([['deep', new THREE.Vector3(66, 0, 58)], ['camp', new THREE.Vector3(0, 0, -20)]]), groundY: () => 0, scene: { add() {}, remove() {} }, interactables: new Map() };
const said = []; const flags = new Set(); let collapsed = null; let torch = false;
const cond = (expr) => !expr || expr.split('&&').every((p) => { p = p.trim(); return p.startsWith('!') ? !flags.has(p.slice(1)) : flags.has(p); });
const g = { era: 'life', e, p: { pos: new THREE.Vector3(66, 0, 58), yaw: 0, moving: false, enabled: true }, flags, inventory: [], world: { ...w, bounds: 116 }, ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false }, sound: { play() {}, thump() {} }, story: { isNight: true, cutsceneOn: false }, danger: { cfg: { nightRadius: 9, food: ['berry', 'meat'] }, hasTorch: () => torch, firePos: () => null, collapse: (r, l) => { collapsed = { r, l }; }, collapsing: false }, has: (k) => g.inventory.includes(k), take() {}, renderInv() {}, cond, save: { touch() {} } };
const sp = new Spark(g, w.spark); g.flag = (f) => { for (const x of [].concat(f)) flags.add(x); sp.onFlag(); };
const bs = new Beasts(g, { ...w.beasts, tiger: { ...w.beasts.tiger, chance: 1, waitSec: 2 }, boar: { areas: [] }, bear: { areas: [] } });
const run = (sec, step = 0.1, each) => { for (let t = 0; t < sec; t += step) { bs.tick(step); each?.(step); } };
const reset = () => { bs.cool.tiger = 0; bs.runT = 0; bs.vel = 0; bs.prev = null; g.p.moving = false; g.p.pos.set(66, 0, 58); said.length = 0; };
// 1) 걸어서 멀어지면 walked — 「마주 봄」 칭호는 안 붙는다
reset(); run(3); const c1 = bs.cur; ok(c1?.kind === 'tiger', '호랑이가 선다');
g.p.moving = true; run(30, 0.1, (dt) => { g.p.pos.x -= 3.4 * dt; }); run(20);
ok(flags.has('beast:tiger:walked') && !flags.has('beast:tiger:faced') && !flags.has('title:tigereye'), '천천히 걸어서 멀어짐 → beast:tiger:walked (마주 봄 아님 · 칭호 없음)');
ok(beastLog().life?.tiger?.how?.walked === 1, '도감 — 호랑이 · 걸어서 물러남 1');
// 2) 불빛이면 lit
reset(); run(3); ok(bs.cur?.kind === 'tiger', '두 번째 호랑이'); torch = true; run(30); torch = false;
ok(flags.has('beast:tiger:lit') && !flags.has('beast:tiger:faced'), '횃불을 켜면 → beast:tiger:lit');
// 3) 가만히 마주 보면 faced → 칭호 「호랑이와 눈을 맞춘 사람」 + 한마디 규칙이 열림
reset(); run(3); run(10); run(20);
ok(flags.has('beast:tiger:faced') && flags.has('title:tigereye') && said.some((s) => s.includes('호랑이와 눈을 맞춘 사람')), '가만히 마주 봄 → faced · 🏅 「호랑이와 눈을 맞춘 사람」');
ok(JSON.parse(LS.kworld_titles).some((t) => t.id === 'tigereye' && t.era === 'life'), '칭호가 kworld_titles 에 남음(족보 상자)');
const pick = sp.pickGaze(w.spark.gaze, 'x'); ok(pick?.id === 'bk_tf' && flags.has('gaze:said:bk_tf'), `마을 사람 한마디 — 「${pick?.text?.slice(0, 24)}…」 (한 번)`);
ok(sp.pickGaze(w.spark.gaze, 'y')?.id !== 'bk_tf', '같은 한마디는 다시 안 함');
// 4) 뛰면 덮침 → caught 기록 · 쓴 이름
reset(); run(3); g.p.moving = true; run(6, 0.1, (dt) => { g.p.pos.x += 6.5 * dt; });
ok(collapsed?.r === 'tiger' && beastLog().life.tiger.how.caught === 1 && flags.has('title:tigerrun'), '뛰면 덮침 → 도감 쓰러짐 1 · 🩹 「호랑이 앞에서 뛴 사람」');
ok(beastLog().life.tiger.n === 4, `도감 — 호랑이 만난 수 ${beastLog().life.tiger.n}`);
// 5) 「산을 아는 사람」 — 셋 다 봤을 때만
ok(!flags.has('title:threebeasts'), '호랑이만 보면 「산을 아는 사람」 아님'); g.flag(['beast:bear:seen', 'beast:boar:seen']); ok(flags.has('title:threebeasts'), '범·곰·멧돼지 셋 다 보면 🏅 「산을 아는 사람」');
// ---- 짐승 도감 HTML ----
recordBeast('life', 'boar', 'fled'); recordBeast('neo', 'boar', 'hit');
const html = beastHtml(beastLog(), { era: 'life', kinds: ['tiger', 'boar', 'bear'] });
ok(html.includes('🐅 호랑이') && html.includes('마주 봄') && html.includes('class="good"') && html.includes('class="bad"'), '이 시대 칸 — 만난 짐승은 어떻게 지나갔는지(좋음·나쁨 색)');
ok(html.includes('bc ghost') && html.includes('아직 못 만났다') && html.includes(BEAST.bear.hint), '못 만난 곰은 그림자 + 어디서 나오는지');
ok(/모든 시대 — .*🐗 2번/.test(html), '모든 시대 합 — 멧돼지 2번');
ok(beastHtml({}, { era: 'daehan-life', kinds: [] }) === '', '아무것도 없으면 빈 칸');
ok(Object.keys(HOW).length >= 9 && BEAST_CSS.includes('.blist'), 'HOW 이름표·CSS');
const dg = fs.readFileSync(path.join(root, 'core/dogam.js'), 'utf8'); const dh = fs.readFileSync(path.join(root, 'dogam.html'), 'utf8');
ok(dg.includes("beastHtml(beastLog(), { era: g.era, kinds: Object.keys(g.world?.beasts || {}) })") && dh.includes('beastHtml(beastLog())'), '게임 안 도감(B)·따로 연 도감 둘 다 짐승 칸');
console.log(`\n짐승 층 ③: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
