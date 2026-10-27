// 역사의 인물 층(133·134) — 데이터 열한 시대(인물 19 = 133 큰 사건 11 + 134 평화 사건 8: 구역·사건·선택지·연도 0·값 ±2) + 엔진(조선 전기 이순신): 사건 열림 → 걸어 들어옴 → 📯 세 줄·📜 → E 선택지 값·깃발 → again → 떠남·gone → 「그 뒤」 줄
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const { Figures } = await import('../core/figures.js');
const { Life } = await import('../core/life.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const read = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f), 'utf8'));
// ---- 데이터 ----
let n = 0; const names = [];
for (const era of ERAS) {
  const w = read(era, 'world.json'); const figs = w.figures || []; const why = []; const L = read(era, w.life); const sits = new Set(L.situations.map((s) => s.id));
  for (const f of figs) { n++; names.push(f.name);
    if (!w.areas[f.from] || !w.areas[f.to]) why.push(`${f.id} 구역`); const m = /^sit:(\w+):(open|done)$/.exec(f.on); if (!m || !sits.has(m[1])) why.push(`${f.id} on ${f.on}`);
    if (!(f.say?.length === 3) || !f.fact || !f.talk?.text || !f.gone || !f.again) why.push(`${f.id} 줄 모자람`);
    for (const t of [f.fact, ...f.say, ...(f.talk.choices.map((c) => c.fact || ''))]) if (/\d/.test(t)) why.push(`${f.id} 연도`);
    for (const s of f.say) if (s.length > 60) why.push(`${f.id} say ${s.length}자`);
    const cs = f.talk.choices; if (cs.length < 2 || cs.length > 4) why.push(`${f.id} 선택지 ${cs.length}`);
    for (const c of cs) { if (!c.id || !c.label || !c.say) why.push(`${f.id}.${c.id} 빈 칸`); if (c.status) why.push(`${f.id}.${c.id} 신분 바꿈`); for (const [k, v] of Object.entries(c.val || {})) if (!['craft', 'heart', 'grain', 'rank'].includes(k) || Math.abs(v) > 2) why.push(`${f.id}.${c.id} 값 ${k}:${v}`); }
    if (new Set(cs.map((c) => c.id)).size !== cs.length) why.push(`${f.id} 선택지 id 겹침`);
  }
  ok(!why.length, `${era}: 인물 ${figs.length}${figs.length ? '(' + figs.map((f) => f.name).join('·') + ')' : ''}${why.length ? ' — ' + why.join(' / ') : ''}`);
}
ok(n === 19 && new Set(names).size === 19, `인물 19(133 큰 사건 11 + 134 평화 사건 8), 이름 다 다름 (${n})`);
// 134 — 떠난 뒤 마을 사람 한마디(spark gaze.rules fg_*)·만난 칭호(spark.titles fg_*)가 인물마다 하나씩, 실제 깃발에 맞물림
{ const why = []; let nr = 0, nt = 0;
  for (const era of ERAS) { const w = read(era, 'world.json'); for (const f of w.figures || []) { const r = (w.spark?.gaze?.rules || []).find((x) => x.id === 'fg_' + f.id); const t = (w.spark?.titles || []).find((x) => x.id === 'fg_' + f.id);
    if (!r || r.if !== 'figure:' + f.id + ':gone' || !r.once || !r.text) why.push(`${era}.${f.id} 소문`); else nr++;
    if (!t || t.on !== 'figure:' + f.id + ':met' || !t.name.endsWith(' 만난 사람') || !t.name.startsWith(f.name) || !t.line) why.push(`${era}.${f.id} 칭호`); else nt++; } }
  ok(!why.length && nr === 19 && nt === 19, `134 소문 ${nr}·칭호 ${nt} — 인물마다 하나씩${why.length ? ' — ' + why.join(' / ') : ''}`); }
{ const j = read('joseon-life', 'world.json'); ok(j.figures.length === 2 && j.figures[1].id === 'sejong' && j.figures[1].on === 'sit:hangeul:open' && j.figures[1].to === 'seodang', '134 조선 전기 둘째 인물 = 세종(한글 열리면 서당으로)');
  const sl = read('silla-life', 'world.json').figures; ok(sl.length === 3 && sl.find((f) => f.id === 'wonhyo')?.if === 'nation:silla' && sl.find((f) => f.id === 'daejoyeong')?.if === 'nation:balhae', '134 통일신라·발해는 나라마다(원효 silla · 대조영 balhae)');
  const jl = read('joseon-late-life', 'world.json').figures; ok(jl.length === 3 && jl.map((f) => f.on).includes('sit:silhak:open') && jl.map((f) => f.on).includes('sit:jangsi:open'), '134 조선 후기 정약용(실학)·김홍도(장시) 서로 다른 사건'); }
const sam = read('samguk-life', 'world.json').figures; ok(sam.length === 4 && sam.every((f) => /^nation:(goguryeo|baekje|silla|gaya)$/.test(f.if)), '삼국·가야는 나라마다 한 사람(if nation:)');
const gameSrc = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8');
ok(gameSrc.includes("this.figures = new Figures(this, this.world.figures)") && gameSrc.includes('if (this.figures) this.figures.tick(dt);') && gameSrc.includes('if (this.figures) this.figures.onFlag(f);'), 'game.js — 생성·tick·onFlag 세 줄');
ok(fs.readFileSync(path.join(root, 'core/life.js'), 'utf8').includes('ear fig'), 'life.js — 「그 뒤」 📯 줄');
// ---- 엔진(조선 전기 이순신) ----
const w = read('joseon-life', 'world.json');
const e = { areas: new Map([['outroad', new THREE.Vector3(0, 0, 58)], ['naru', new THREE.Vector3(9, 0, 93)]]), groundY: () => 0, interactables: new Map(), removed: [], removeInteractable(k) { this.removed.push(k); this.interactables.delete(k); } };
const said = [], flags = new Set(), played = [], added = [];
const fakeLife = { g: null, status: 'sangmin', values: {}, add: (k, v) => added.push([k, v]) }; fakeLife.cond = Life.prototype.cond; fakeLife.one = Life.prototype.one; fakeLife.valCond = Life.prototype.valCond;
const g = { era: 'joseon-life', e, p: { pos: new THREE.Vector3(9, 1.6, 88), enabled: true }, flags, world: w, npcs: {}, ui: { say: (t) => said.push(t), isOpen: () => false }, sound: { play: (n) => played.push(n) }, life: fakeLife, restoring: false,
  story: { fast: true, actors: {}, cutsceneOn: false, place(a) { const obj = new THREE.Group(); obj.position.set(a.x, 0, a.z); const it = { name: a.name, obj, box: { setFromObject() { return this; }, getCenter: (v) => v }, center: new THREE.Vector3() }; e.interactables.set(a.name, it); g.placed = (g.placed || []).concat([a]); return it; } } };
fakeLife.g = g; g.cond = (x) => fakeLife.cond(x); g.flag = (f) => { if (flags.has(f)) return; flags.add(f); fg.onFlag(f); }; flags.add('status:sangmin');
const fg = new Figures(g, w.figures); const run = (sec, step = 0.5) => { for (let t = 0; t < sec; t += step) fg.tick(step); }; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
run(2); ok(fg.live.size === 0 && !g.placed, '사건 전엔 아무도 안 온다');
flags.add('sit:imjin:open'); run(0.5);
const L = fg.live.get('yisunsin'); ok(L && g.placed?.[0].name === 'npc_yisunsin' && g.placed[0].x === 0 && g.placed[0].z === 58 && flags.has('figure:yisunsin:here') && said[0].includes('📯 멀리서 누가 온다') && played[0] === 'drum', `임진왜란 열림 → 이순신이 어귀 밖 길(outroad)에 서서 나루로 온다: ${said[0]}`);
ok(g.npcs.yisunsin?.name === '이순신 · 전라좌수사' && g.npcs.yisunsin.lines.length === 2 && g.npcs.yisunsin.lines[1].choices.length === 4, 'g.npcs 에 대사 끼움(선택지 넷)');
const to = L.ac.path.to; ok(Math.hypot(to.x - 9, to.z - 93) > 2.1 && Math.hypot(to.x - 9, to.z - 93) < 2.3, `나루 중심 2.2m 앞까지 (${Math.hypot(to.x - 9, to.z - 93).toFixed(2)})`);
run(25); await wait(40); ok(L.there && !L.ac.path, '걸어와서 선다(there)');
ok(said.filter((s) => s.startsWith('📯 이순신 — 「')).length === 3 && said.some((s) => s.startsWith('📜 이순신은')), '📯 세 줄 + 📜 한 줄');
// 말 걸기 — game.talk 이 c.flag 를 세우면 onFlag 로 값·깃발
const line = g.npcs.yisunsin.lines.find((l) => !l.if); const wood = line.choices.find((c) => c.flag === 'figure:yisunsin:wood'); ok(wood && wood.label.includes('나무'), '선택지 flag = figure:yisunsin:wood');
g.flag('figure:yisunsin:wood'); await wait(20);
ok(added.length === 2 && added.some(([k, v]) => k === 'grain' && v === -1) && added.some(([k, v]) => k === 'heart' && v === 2) && flags.has('figure:yisunsin:met') && fg.met.includes('yisunsin') && said.some((s) => s.startsWith('📜 판옥선')), '고르면 🌾-1 🤝+2 · met · 📜 선택지 사실');
g.flag('figure:yisunsin:wood'); ok(added.length === 2, '같은 깃발 두 번엔 값 안 더함');
ok(g.npcs.yisunsin.lines[0].if === 'figure:yisunsin:met' && g.npcs.yisunsin.lines[0].text.includes('바다는 내가 막는다'), '두 번째부터 again 한 줄');
ok(line.choices.find((c) => c.flag === 'figure:yisunsin:oar').showIf === '!sex:f', '격군은 남자만(showIf)');
// 머물다 떠남
run(230); ok(L.leaving && said.some((s) => s.includes('한산도로 간다')), '240초 뒤 떠난다(gone 한 줄)');
run(40); await wait(20); ok(!fg.live.has('yisunsin') && e.removed.includes('npc_yisunsin') && !g.npcs.yisunsin && flags.has('figure:yisunsin:gone') && !flags.has('figure:yisunsin:here'), '걸어 나가 사라짐 · npcs 지움 · gone');
run(2); ok(!fg.live.has('yisunsin') && g.placed.length === 1, '다시 안 온다');
ok(fg.figureLine() === '역사의 인물 — 이순신(배 만드는 나무를 댄다)을(를) 만났다.', `그 뒤 줄: ${fg.figureLine()}`);
// 말 안 걸고 보낸 경우 · 인물 없는 세계
const g2 = { ...g, flags: new Set(['status:sangmin', 'sit:imjin:open']), npcs: {}, placed: null }; g2.cond = (x) => { const old = fakeLife.g; fakeLife.g = g2; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g2.flag = (f) => g2.flags.add(f);
const f2 = new Figures(g2, w.figures); f2.tick(0.5); g2.flags.add('figure:yisunsin:gone'); g2.flags.delete('figure:yisunsin:here'); f2.live.clear();
ok(f2.figureLine().includes('말을 걸지 않았다'), `지나치면: ${f2.figureLine()}`);
ok(new Figures(g, []).figureLine() === '', '인물 없는 세계는 빈 줄');
console.log(`\n133 역사의 인물: ${pass} 통과 · ${fail} 실패`); if (fail) process.exit(1);
