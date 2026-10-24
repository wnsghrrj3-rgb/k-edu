// 소문 층(117) — 다음 큰 사건의 전조를 마을 사람 입으로 먼저 듣는다(gaze.rules rm_*) → 들었으면 그 급한 일에 여유(heardBonus)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {}, innerHTML: '' }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
globalThis.performance ??= { now: () => Date.now() };
const { Spark } = await import('../core/spark.js'); const { Pulse } = await import('../core/pulse.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
// ---- 데이터 전수 ----
let total = 0;
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'life.json'), 'utf8'));
  const must = lf.situations.filter((s) => s.must).map((s) => s.id); const rules = (w.spark?.gaze?.rules || []).filter((r) => r.id.startsWith('rm_')); total += rules.length;
  const byNext = new Map(); for (const r of rules) { const m = r.id.match(/^rm_(\w+)_(\d)$/); if (m) (byNext.get(m[1]) || byNext.set(m[1], []).get(m[1])).push(r); }
  ok(must.slice(1).every((b) => (byNext.get(b) || []).length >= 2) && byNext.size === must.length - 1, `${era}: 꼭 나오는 상황 ${must.length}개 — 둘째부터 전부 소문 둘씩(${rules.length}줄)`);
  ok(rules.every((r) => { const b = r.id.match(/^rm_(\w+)_\d$/)?.[1]; const i = must.indexOf(b); return i > 0 && r.if === `sit:${must[i - 1]}:open && !sit:${b}:open` && r.flag === `rumor:${b}:heard` && r.once; }), `${era}: 조건 = 바로 앞 상황이 열려 있고 다음은 아직 · 깃발 rumor:<다음>:heard · 한 번`);
  ok(rules.every((r) => r.text && r.text.length <= 48 && !/\d{3,4}년|\(\d{3,4}\)|기원전/.test(r.text)), `${era}: 한 줄 48자 안 · 연도 0`);
  ok(new Set((w.spark.gaze.rules || []).map((r) => r.id)).size === w.spark.gaze.rules.length, `${era}: 규칙 id 겹침 없음`);
  const dls = w.pulse?.deadlines || []; ok(dls.every((d) => { const m = d.on.match(/sit:(\w+):open/); return !m || !must.includes(m[1]) || d.rumor === m[1]; }), `${era}: 꼭 나오는 상황의 급한 일 ${dls.filter((d) => d.rumor).length}개에 rumor 가 적혀 있다`);
  ok(dls.filter((d) => d.rumor).every((d) => must.indexOf(d.rumor) > 0 && byNext.has(d.rumor) || must.indexOf(d.rumor) === 0), `${era}: rumor 가 가리키는 상황엔 소문이 있다(첫 상황은 소문 없음)`);
}
ok(total >= 140, `열한 시대 소문 ${total}줄`);
// ---- 엔진 ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/joseon-life/world.json'), 'utf8'));
const flags = new Set(); const said = [];
const cond = (expr) => !expr || expr.split('&&').every((p) => { p = p.trim(); return p.startsWith('!') ? !flags.has(p.slice(1)) : flags.has(p); });
const g = { flags, cond, flag: (f) => { for (const x of [].concat(f)) flags.add(x); }, life: { values: { heart: 2 }, hurt: new Set(), log: [] }, e: { interactables: new Map(), areas: new Map(), scene: { add() {}, remove() {} } }, p: { pos: { x: 0, y: 0, z: 0 } }, ui: { say: (t) => said.push(t), setGoal() {}, isOpen: () => false }, sound: { play() {} }, story: {} };
const sp = new Spark(g, w.spark);
// 사화가 열린 동안 — 임진왜란 소문만 들린다
flags.add('sit:sahwa:open'); const pick = sp.pickGaze(w.spark.gaze, 'jumo');
ok(pick?.id?.startsWith('rm_imjin_') && flags.has('rumor:imjin:heard') && flags.has('gaze:said:' + pick.id), `사화 밤에 사람 곁 → 「${pick?.text}」 → rumor:imjin:heard`);
const pick2 = sp.pickGaze(w.spark.gaze, 'ai'); ok(!pick2 || (pick2.id.startsWith('rm_imjin_') && pick2.id !== pick.id), '같은 소문은 다시 안 함(둘째 줄 또는 없음)');
flags.add('sit:imjin:open'); const p3 = sp.pickGaze(w.spark.gaze, 'nongbu'); ok(p3?.id?.startsWith('rm_horan_') && flags.has('rumor:horan:heard'), `임진왜란이 열리면 그 소문은 그치고 병자호란 소문으로 — 「${p3?.text}」`);
// 급한 일 — 들었으면 +15초
const pl = new Pulse(g, w.pulse); const d = w.pulse.deadlines.find((x) => x.id === 'imjin'); ok(d.rumor === 'imjin', '임진왜란 급한 일에 rumor: imjin');
pl.startDeadline(d); ok(pl.deadline.left === d.sec + 15 && pl.deadline.total === d.sec + 15 && pl.deadline.heard && flags.has('rumor:imjin:used'), `들었으면 ${d.sec}→${pl.deadline.left}초(+15) · 사용 깃발`);
await new Promise((r) => setTimeout(r, 1800)); ok(said.some((t) => t.startsWith('👂')), '「👂 먼저 들어 둔 말」 한 줄');
pl.tickDeadline(1); ok(Math.abs(pl.deadline.left - (d.sec + 14)) < 1e-6 && !pl.deadline.hot, '막대는 늘어난 전체 시간으로 잰다(hot 아님)');
// 안 들었으면 그대로
const flags2 = new Set(); const g2 = { ...g, flags: flags2, cond: (e) => !e || e.split('&&').every((p) => { p = p.trim(); return p.startsWith('!') ? !flags2.has(p.slice(1)) : flags2.has(p); }), ui: { say() {}, setGoal() {}, isOpen: () => false } }; const pl2 = new Pulse(g2, w.pulse); pl2.startDeadline(d);
ok(pl2.deadline.left === d.sec && !pl2.deadline.heard, `안 들었으면 ${d.sec}초 그대로`);
// heardBonus 를 데이터가 정하면 그걸 쓴다
pl2.deadline = null; flags2.add('rumor:imjin:heard'); pl2.startDeadline({ ...d, heardBonus: 30 }); ok(pl2.deadline.left === d.sec + 30, 'heardBonus 30 이면 +30');
console.log(`\n${pass} 통과 · ${fail} 실패`); process.exit(fail ? 1 : 0);
