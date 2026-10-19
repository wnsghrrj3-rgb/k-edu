// 운명의 사람이 세상에 있다(10-19, core/bond.js) — 열한 시대 데이터(이름·옷·한마디) + 엔진(만나면 나와 따라옴·벗이면 더 가까이·등지면 물러섬·끝에 떠남·재개는 조용히·?bond=0)
// + 77: 말 걸기(E — 한마디·물건 주기·등진 사람은 안 닿음) · 벗이 쫓김에 끼어듦(앞을 막아 3초, 한 번) · 조건 토큰 bond:1
// + 79: 등진 사람과 화해(bond3e 「미안했다」 길 → bond:sorry → 돌발 bond4 굴림 → bond:mended 면 다시 벗으로 돌아와 따라다님) · 쫓길 때 벗이 「이쪽!」 하며 goal_at 쪽으로 먼저 뜀(12m 뒤처지면 기다림) · 벗 한마디가 지난 선택에 반응(cfg.react, 한 번)
// + 78: 「운명의 벗과 함께」 길 열한 시대(gen_bond_ways.py, items bond:1 + life.json bond:true → together 한마디) · 벗 답례 gift 열한 시대(items 키 실재) · 벗이 숨은 것 곁에서 「저기 뭔가 있다」(한 번·자리 안 말함)
// + 80: 벗의 물려줄 것(bond3f 첫 길·bond4 화해 성공 then.heirloom → spark.apply → Pulse.keep from:'bond', 족보 n/3 셈엔 안 들어감) · 벗이 쓰러진 나를 일으킴(danger.collapse — 벗 곁 8m 면 먹을 것 1/4, bond:lifted) · 반 친구 외침(friends.shout — 쫓김 끝·급한 일 늦음, 곁 14m 친구만)
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, querySelector: () => ({ style: {} }), innerHTML: '' }), body: { appendChild() {} }, head: { appendChild() {} } };
globalThis.performance ??= { now: () => Date.now() };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
const { Bond } = await import('../core/bond.js'); const { Pulse } = await import('../core/pulse.js'); const { Spark } = await import('../core/spark.js'); const { Danger } = await import('../core/danger.js'); const { heirloomsOf, chestHtml } = await import('../core/jokbo.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
// ---- 데이터 전수 ----
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const b = w.spark?.bond;
  ok(b && b.name && typeof b.look?.cloth === 'number' && ['met', 'friend', 'enemy'].every((k) => b.lines?.[k]?.length >= 2 && b.lines[k].every((t) => t.includes(b.name.replace(/이$/, '')))), `${era}: 운명의 사람 ${b?.name} — 옷 색·관계마다 한마디 둘(이름이 들어 있다)`);
  ok(w.spark.surprises.find((s) => s.id === 'bond1')?.ways[0].then.flag === 'bond:met', `${era}: 만남 카드 첫 길이 bond:met 를 세운다(그때 몸이 나온다)`);
}
// ---- 엔진 ----
const w = JSON.parse(fs.readFileSync(path.join(root, 'eras/life/world.json'), 'utf8'));
function mk(flags = [], restoring = false) {
  const added = []; const said = [];
  const g = { e: { scene: { add: (o) => added.push(o), remove: (o) => { const i = added.indexOf(o); if (i >= 0) added.splice(i, 1); } }, groundY: () => 0 }, p: { pos: new THREE.Vector3(0, 0, 0), yaw: 0, enabled: true, moving: false }, flags: new Set(flags), restoring, ui: { say: (t) => said.push(t), isOpen: () => false }, sound: { play() {} }, story: { skyName: 'day' }, friends: { myWaveUntil: 0 } };
  g.inventory = []; g.items = { items: { stone: { name: '돌', icon: '🪨' }, berry: { name: '열매', icon: '🫐' } } }; g.take = (k) => { const i = g.inventory.indexOf(k); if (i >= 0) g.inventory.splice(i, 1); }; g.renderInv = () => {}; g.panels = [];
  g.ui.open = (html, buttons) => { g.panels.push({ html, buttons }); g.ui._open = true; }; g.ui.close = () => { g.ui._open = false; }; g.ui.isOpen = () => !!g.ui._open;
  g.bond = new Bond(g, w.spark.bond); g.flag = (f) => { g.flags.add(f); g.bond.onFlag(); }; g.added = added; g.said = said; return g;
}
const run = (g, sec, step = 0.1) => { for (let t = 0; t < sec; t += step) g.bond.tick(step); };
const d = (g) => Math.hypot(g.bond.pos.x - g.p.pos.x, g.bond.pos.z - g.p.pos.z);
// 1) 아직 안 만났으면 없다 → 만나면 나온다(손 흔들기·첫 줄) → 따라온다
let g = mk(); run(g, 2); ok(g.added.length === 0 && g.bond.state() === null, '만나기 전엔 몸이 없다');
g.flag('bond:met'); ok(g.added.length === 1 && g.flags.has('bond:here') && g.said.some((t) => t.includes('흰돌') && t.includes('같이 가')) && g.bond.waveUntil > performance.now(), 'bond:met → 몸 하나 + 이름 첫 줄 + 손 흔들기');
ok(Math.abs(d(g) - 7) < 0.01, '플레이어 앞 7m 에 선다');
run(g, 3); ok(d(g) <= 3.45 && d(g) > 3.2, `서 있으면 3.4m 까지 와서 멈춘다(${d(g).toFixed(2)})`);
g.p.pos.set(30, 0, 0); const d0 = d(g); run(g, 0.5); ok(d(g) < d0 - 2.5 && g.bond.walk > 0, '멀어지면 뛰어온다(9m 밖이면 달리기 6.2, 걸음 동작 시간이 쌓인다)');
run(g, 8); ok(d(g) <= 3.45, '따라잡아 다시 곁에 선다');
// 2) 벗 → 더 가까이, 내가 손 흔들면 같이
g.flag('bond:friend'); run(g, 4); ok(d(g) <= 2.45 && d(g) > 2.2, `벗이면 2.4m(${d(g).toFixed(2)})`);
const t0 = performance.now(); g.friends.myWaveUntil = t0 + 1600; g.bond.waveUntil = 0; run(g, 0.2); ok(g.bond.waveUntil > t0, '내가 손을 흔들면(G) 같이 흔든다');
// 3) 한마디 — 55초에 한 번, 관계 줄에서
g.said.length = 0; run(g, 60); ok(g.said.filter((t) => t.startsWith('👤 흰돌 —')).length === 1 && w.spark.bond.lines.friend.some((l) => g.said[0].includes(l)), '곁에서 55초에 한 줄, 벗 줄에서');
g.said.length = 0; g.story.skyName = 'night'; run(g, 14); ok(g.said.length === 1, '하늘이 바뀌면 곧(12초 안에) 새 한마디');
// 4) 벗은 끝나도 곁에
g.flag('bond:end'); run(g, 2); ok(g.added.length === 1 && g.bond.state() === 'friend', '벗은 bond:end 뒤에도 곁에 남는다');
// 5) 등진 사람 — 따라오지 않고 물러선다, 끝나면 떠난다
g = mk(['bond:met']); run(g, 0.2); ok(g.added.length === 1 && g.said.length === 0 && g.bond.waveUntil === 0, '첫 틱에 이미 만나 있었으면(재개) 조용히 선다');
run(g, 3); g.flag('bond:enemy'); g.said.length = 0; run(g, 1); ok(g.said.some((t) => t.includes('등을 돌렸다')) && d(g) > 3.4, '등지면 「등을 돌렸다」 한 줄 + 다가가 있던 자리에서 물러난다');
run(g, 6); const far = d(g); g.p.pos.set(-40, 0, 0); run(g, 6); ok(d(g) < 60 && d(g) >= 11, `아주 멀어지면 멀찍이(11m) 따라는 온다(${d(g).toFixed(1)})`);
g.p.pos.set(g.bond.pos.x + 2, 0, g.bond.pos.z); run(g, 3); ok(d(g) > 4.5, `다가가면 물러난다(${d(g).toFixed(1)})`);
g.said.length = 0; g.p.pos.set(g.bond.pos.x + 8, 0, g.bond.pos.z); run(g, 60); ok(g.said.some((t) => w.spark.bond.lines.enemy.some((l) => t.includes(l))), '등진 사람 줄에서 한마디');
g.flag('bond:end'); ok(g.added.length === 0 && !g.flags.has('bond:here') && g.said.some((t) => t.includes('떠났다')), '등지고 끝나면 떠난다(몸 사라짐·bond:here 내림)');
// 6) 재개 중엔 안 선다
g = mk(['bond:met'], true); run(g, 1); ok(g.added.length === 0, 'restoring 중엔 몸을 안 세운다');
// 8) 말 걸기(E) — 곁 3.2m 안이면 prompt·talk, 한마디 + 물건 주기
g = mk(['bond:met']); run(g, 4); ok(g.bond.canTalk() && g.bond.prompt().verb === '말을 건다', '곁(3.8m)에 서면 「말을 건다」 prompt');
g.inventory.push('stone', 'stone', 'berry'); g.bond.talk(); let pn = g.panels.at(-1); ok(g.ui.isOpen() && g.p.enabled === false && pn.html.includes('흰돌') && pn.buttons[0].label === '「같이 갈래?」' && pn.buttons.some((b) => b.label.includes('돌 준다')) && pn.buttons.some((b) => b.label.includes('열매 준다')) && pn.buttons.at(-1).label === '그냥 간다', '말 걸기 판: 이름·한마디·「같이 갈래?」·주머니 물건별 「준다」·그냥 간다');
pn.buttons.find((b) => b.label.includes('돌 준다')).onClick(); ok(!g.ui.isOpen() && g.p.enabled && g.inventory.filter((k) => k === 'stone').length === 1 && g.flags.has('bond:gave') && g.flags.has('bond:gave:stone') && g.said.at(-1).includes('받았다'), '돌을 주면 주머니에서 하나 빠지고 bond:gave:stone + 「받았다」');
g.flag('bond:friend'); g.bond.talk(); pn = g.panels.at(-1); ok(pn.buttons[0].label === '「같이 가자.」', '벗이면 첫 단추 「같이 가자.」'); pn.buttons[0].onClick(); ok(g.flags.has('bond:talked') && g.said.at(-1).includes('어디든'), '「같이 가자」 → bond:talked + 답');
ok(g.bond.withMe() === true, '벗이 곁(5m) → withMe() = bond:1 참'); g.p.pos.set(40, 0, 0); ok(g.bond.withMe() === false, '멀면 bond:1 거짓'); g.p.pos.set(g.bond.pos.x + 1, 0, g.bond.pos.z);
g.flags.add('bond:enemy'); g.said.length = 0; const np = g.panels.length; g.bond.talk(); ok(g.panels.length === np && g.said[0].includes('말이 닿지 않는다') && g.flags.has('bond:tried'), '등진 사람에겐 판이 안 열리고 「말이 닿지 않는다」 + bond:tried');
// 9) 벗이 쫓김에 끼어든다 — 쫓는 사람에게 달려가 앞을 막으면 pulse.hold(3) + bond:blocked, 한 쫓김에 한 번, 끝나면 다시 따라온다
g = mk(['bond:met', 'bond:friend']); run(g, 4); const chaser = { position: new THREE.Vector3(-30, 0, 0) }; let held = 0; g.pulse = { chase: { c: { id: 'esc' }, actor: { obj: chaser } }, hold: (s) => { held = s; } };
run(g, 0.5); const dc = () => Math.hypot(chaser.position.x - g.bond.pos.x, chaser.position.z - g.bond.pos.z); ok(dc() < 28 && g.bond.walk > 0, `쫓김이 서면 벗이 쫓는 사람 쪽으로 달려간다(${dc().toFixed(1)}m)`);
run(g, 6); ok(held === 3 && g.pulse.chase.bondBlocked && g.flags.has('bond:blocked') && g.flags.has('bond:blocked:esc') && g.said.some((t) => t.includes('앞을 막았다')) && dc() <= 2.3, '닿으면 hold(3)·bondBlocked·bond:blocked·「앞을 막았다 — 뛰어!」');
const bx = g.bond.pos.x; run(g, 2); ok(Math.abs(g.bond.pos.x - bx) < 0.01, '막는 3초 동안은 그 자리에 선다');
g.bond.block.until = 0; run(g, 8); ok(d(g) <= 2.45 && held === 3, '막은 뒤엔 다시 곁으로 돌아온다, 같은 쫓김에 두 번 막지 않는다');
g.pulse.chase = null; run(g, 1); ok(g.bond.block === null, '쫓김이 끝나면 끼어듦 상태가 지워진다');
// 10) pulse.hold / life.cond bond:n / game.cond bond:n
const pj = fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8'); ok(/hold\(sec\)/.test(pj) && /holdUntil > performance\.now\(\)/.test(pj), 'pulse.js — hold(sec) + 쫓는 사람 멈춤');
const lj = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'); ok(/bond:\\d\+\$\/\.test\(f\)/.test(lj) && /withMe/.test(lj), 'life.cond — bond:n 토큰(withMe)');
// 7) game.js 연결
const gj = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8'); ok(/import \{ Bond \}/.test(gj) && /get\('bond'\) !== '0'/.test(gj) && /this\.bond\.onFlag\(\)/.test(gj) && /this\.bond\.tick\(dt\)/.test(gj) && /this\.bond\?\.canTalk\(\)\) return this\.bond\.talk\(\)/.test(gj) && /this\.bond\.prompt\(\)/.test(gj) && /\^bond:\\d\+\$/.test(gj), 'game.js — 생성(?bond=0 끔)·onFlag·tick·E 말 걸기·prompt·cond bond:n');
// 11) 78 — 열한 시대 데이터: 벗 길(bond:1)·결과 카드(bond:true)·답례 물건
const BW = { life: ['gully', 'gully:bond'], neo: ['burn', 'burn:hand_bond'], 'bronze-life': ['rockart', 'rock:carve_bond'], 'gojoseon-life': ['rampart', 'war:build_bond'], 'samguk-life': ['wall', 'wall:carry_bond'], 'silla-life': ['stonepile', 'temple:carry_bond'], 'goryeo-life': ['wall', 'mongol:stone_bond'], 'joseon-life': ['hangeul', 'hangeul:learn_bond'], 'joseon-late-life': ['mine', 'mine:dig_bond'], 'gaehang-life': ['malmoi', 'ml:send_bond'], 'daehan-life': ['hakgyo', 'gb:night_bond'] };
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const it = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'items.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'life.json'), 'utf8'));
  const [tgt, fb] = BW[era]; const nm = w.spark.bond.name; const rn = it.targets[tgt].rename; const all = []; rn.forEach((r, i) => { all.push([r, i, -1]); (r.choices || []).forEach((c, j) => all.push([c, i, j])); });
  const near = all.find(([x]) => /\bnear:1\b/.test(x.if || '')), bond = all.find(([x]) => x.flag === fb);
  ok(near && bond && /\bbond:1\b/.test(bond[0].if || '') && (bond[0].label || bond[0].verb || '').includes(nm) && (bond[1] > near[1] || (bond[1] === near[1] && bond[2] === near[2] + 1)) && bond[0].say && !(bond[0].label || bond[0].verb || '').includes('반 친구'), `${era}: ${tgt} 에 「${nm}과 함께」 bond:1 길이 반 친구 길 바로 뒤에, 깃발 ${fb}`);
  if (bond[2] === -1) { const base = (bond[0].if || '').replace(/\s*&&\s*bond:1\b/, ''); const oi = rn.findIndex((r) => (r.if || '') === base); ok(oi > bond[1], `${era}: rename 벗 길이 원 길(if 같은 것)보다 앞(첫 맞는 것이 이긴다)`); }
  else ok(true, `${era}: 선택지 벗 길 — 순서 무관(단추)`);
  const lc = lf.situations.flatMap((s) => s.choices || []).find((c) => c.done === fb); ok(lc && lc.bond === true && !lc.with && (lc.title || '').includes(nm) && !(lc.title || '').includes('반 친구'), `${era}: life.json 결과 카드 done ${fb} · bond:true(with 없음) · 제목에 ${nm}`);
  const neg = JSON.stringify(it) + JSON.stringify(fs.existsSync(path.join(root, 'eras', era, 'npcs.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'npcs.json'), 'utf8')) : {}); const fw = near[0].flag; ok(!neg.includes('!' + fw) || (neg.match(new RegExp('!' + fw.replace(/[:]/g, '\\:') + '(?!_)', 'g')) || []).length <= (neg.match(new RegExp('!' + fb.replace(/[:]/g, '\\:'), 'g')) || []).length, `${era}: !${fw} 를 보는 if 마다 !${fb} 도 같이`);
  ok(w.spark.bond.gift && it.items[w.spark.bond.gift], `${era}: 벗 답례 gift=${w.spark.bond.gift} 가 items 에 있다`);
}
// 12) 78 — 엔진: 벗 길 결과 카드 → together 한마디(bond:together:<sit>) · 답례 gift · 숨은 것 힌트
g = mk(['bond:met', 'bond:friend']); run(g, 4); g.bond.cfg.gift = 'berry'; g.inventory.push('stone'); g.bond.talk(); pn = g.panels.at(-1); pn.buttons.find((b) => b.label.includes('돌 준다')).onClick();
await new Promise((r) => setTimeout(r, 1700)); ok(g.inventory.includes('berry') && g.flags.has('bond:gift') && g.said.at(-1).includes('네 거'), '벗에게 물건을 주면 1.6초 뒤 답례(cfg.gift) 한 번 + bond:gift');
g.inventory.push('stone'); g.bond.talk(); pn = g.panels.at(-1); pn.buttons.find((b) => b.label.includes('돌 준다')).onClick(); await new Promise((r) => setTimeout(r, 1700)); ok(g.inventory.filter((k) => k === 'berry').length === 1, '답례는 한 번뿐');
g.said.length = 0; g.bond.together({ id: 'drive', title: '좁은 골짜기' }, { bond: true }); ok(g.flags.has('bond:together') && g.flags.has('bond:together:drive'), '벗 길 결과 → bond:together:drive'); await new Promise((r) => setTimeout(r, 1900)); ok(g.said.some((t) => t.includes('같이 하니까') && t.includes('좁은 골짜기')), '1.8초 뒤 벗 한마디 「같이 하니까 됐지.」');
g.flags.delete('bond:friend'); g.said.length = 0; g.bond.together({ id: 'x' }, {}); ok(!g.flags.has('bond:together:x'), '벗이 아니면 together 는 아무것도 안 한다'); g.flags.add('bond:friend');
g.pulse = { secrets: [{ s: { id: 'axe' }, x: g.bond.pos.x + 8, z: g.bond.pos.z, found: false }, { s: { id: 'far' }, x: g.bond.pos.x + 40, z: 0, found: false }, { s: { id: 'got' }, x: g.bond.pos.x + 2, z: 0, found: true }] }; g.said.length = 0; g.bond.sinceHint = 0; run(g, 21);
ok(g.said.filter((t) => t.includes('저기 뭔가 있다')).length === 1 && g.flags.has('bond:hint:axe') && !g.flags.has('bond:hint:far') && !g.flags.has('bond:hint:got') && !g.said.some((t) => t.includes('8')), '벗 12m 안의 못 찾은 숨은 것 하나 → 「저기 뭔가 있다」 한 번(bond:hint:axe), 먼 것·찾은 것은 안 말함, 자리는 안 말함');
g.said.length = 0; run(g, 40); ok(!g.said.some((t) => t.includes('저기 뭔가')), '같은 숨은 것은 다시 말하지 않는다');
const lj2 = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'); ok(/c\.bond\) g\.bond\?\.together\?\.\(s, c\)/.test(lj2), 'life.finish — 결과 카드 bond:true → bond.together');
// 13) 79 — 열한 시대 데이터: 화해 돌발 bond4(if bond:sorry) · bond3e 첫 길이 bond:end+bond:sorry · 칭호 「다시 벗」·사람 반응 · 벗 반응 규칙 6(실제 깃발)
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const S = w.spark; const b = S.bond; const nm = b.name;
  const e3 = S.surprises.find((s) => s.id === 'bond3e'), e4 = S.surprises.find((s) => s.id === 'bond4');
  ok(Array.isArray(e3.ways[0].then.flag) && e3.ways[0].then.flag.includes('bond:end') && e3.ways[0].then.flag.includes('bond:sorry') && e3.ways[1].then.flag === 'bond:end', `${era}: bond3e 다가간 길만 bond:end + bond:sorry`);
  ok(e4 && e4.if === 'bond:sorry' && e4.ways.length === 2 && e4.ways[0].roll?.ab && e4.ways[0].then.flag === 'bond:mended' && e4.ways[0].fail?.say && !e4.ways[1].then.flag && e4.fact && e4.title.includes(nm.replace(/이$/, '')), `${era}: bond4 화해 — if bond:sorry · 굴림 ${e4?.ways[0].roll?.ab} 성공 bond:mended / 실패·그냥 둔다는 깃발 없음`);
  ok(S.titles.some((t) => t.on === 'bond:mended' && !t.bitter && t.name.includes('다시 벗')) && S.gaze.rules.some((r) => r.if === 'bond:mended' && r.once), `${era}: 칭호 「${nm}과 다시 벗」 + 마을 사람 반응`);
  const chase = w.pulse.chases[0], dl = w.pulse.deadlines[0]; const R = b.react || [];
  ok(R.length >= 6 && R.every((r) => r.id && r.if && r.text && r.once) && new Set(R.map((r) => r.id)).size === R.length, `${era}: 벗 반응 규칙 ${R.length} (id·if·text·once)`);
  ok(R.some((r) => r.if === chase.escapedFlag) && R.some((r) => r.if === chase.caughtFlag) && R.some((r) => r.if === dl.failFlag) && R.some((r) => r.if === 'bond:blocked') && R.some((r) => r.if === 'bond:gave') && R.some((r) => r.if === 'bond:together'), `${era}: 규칙이 쫓김 탈출(${chase.escapedFlag})·잡힘·늦음(${dl.failFlag})·앞 막음·준 것·같이 한 것에 맞물린다`);
}
// 14) 79 — 엔진: 화해 → 떠났던 사람이 벗으로 돌아온다
g = mk(['bond:met']); run(g, 3); g.flag('bond:enemy'); run(g, 3); g.flag('bond:end'); ok(g.added.length === 0 && g.bond.state() === 'gone', '등지고 끝나 떠났다');
g.said.length = 0; g.flag('bond:mended'); run(g, 0.3); ok(g.bond.state() === 'friend' && g.added.length === 1 && g.flags.has('bond:here') && g.said.some((t) => t.includes('다시, 같이 가')), 'bond:mended → 벗으로 돌아와 몸이 다시 서고 「…다시, 같이 가.」');
run(g, 6); ok(d(g) <= 2.45 && g.bond.withMe(), '돌아온 벗은 2.4m 로 붙고 bond:1 참');
g.flag('bond:end'); run(g, 2); ok(g.added.length === 1, '화해한 벗은 bond:end 뒤에도 곁에');
// 15) 79 — 엔진: 쫓길 때 벗이 「이쪽!」 하며 숨을 곳 쪽으로 먼저 뛴다, 12m 뒤처지면 기다린다, 끝나면 돌아온다
g = mk(['bond:met', 'bond:friend']); run(g, 4); const ch2 = { c: { id: 'esc', goal_at: 'hide' }, actor: { obj: { position: new THREE.Vector3(-30, 0, 0) } }, bondBlocked: true }; g.pulse = { chase: ch2, hold() {}, area: (t) => t === 'hide' ? { x: 60, z: 0 } : null };
g.said.length = 0; run(g, 0.3); ok(g.flags.has('bond:lead') && g.flags.has('bond:lead:esc') && g.said.some((t) => t.includes('이쪽!')), '앞 막기 뒤 쫓김 중이면 「이쪽!」 + bond:lead:esc');
run(g, 1.5); ok(g.bond.pos.x > 6 && g.bond.pos.x < 12.5, `goal_at 쪽으로 달린다(x=${g.bond.pos.x.toFixed(1)}, 달리기 6.2)`);
run(g, 1); ok(g.bond.pos.x >= 11.9 && g.bond.pos.x <= 12.4 && !g.bond.lead.moving, `내가 12m 넘게 뒤처지면 멈춰 기다린다(x=${g.bond.pos.x.toFixed(1)})`);
for (let t = 0; t < 12; t += 0.1) { g.p.pos.set(g.bond.pos.x - 3, 0, 0); g.bond.tick(0.1); } ok(Math.abs(g.bond.pos.x - 60) <= 1.7, `내가 따라오면 숨을 곳 앞(1.6m)까지 간다(x=${g.bond.pos.x.toFixed(1)})`);
g.said.length = 0; g.pulse.chase = null; run(g, 1); ok(g.bond.lead === null && !g.said.some((t) => t.includes('이쪽')), '쫓김이 끝나면 이끌기 상태가 지워진다'); g.p.pos.set(g.bond.pos.x, 0, 0); run(g, 12); ok(d(g) <= 2.45, '다시 곁으로');
ok((() => { const h = mk(['bond:met', 'bond:friend']); run(h, 4); h.pulse = { chase: { c: { id: 'x' }, actor: { obj: { position: new THREE.Vector3(-30, 0, 0) } }, bondBlocked: true }, hold() {}, area: () => null }; run(h, 1); return !h.flags.has('bond:lead') && d(h) <= 2.6; })(), '숨을 곳이 없는 쫓김이면 이끌지 않고 곁에서 같이 뛴다');
// 16) 79 — 엔진: 벗 한마디가 지난 선택에 반응(cfg.react) — 깃발이 서면 8초 안에, 한 번, 벗일 때만
g = mk(['bond:met', 'bond:friend']); g.cond = (x) => x.split('&&').every((t) => { t = t.trim(); const n = t.startsWith('!'); const f = n ? t.slice(1) : t; return n ? !g.flags.has(f) : g.flags.has(f); }); run(g, 4);
g.said.length = 0; g.bond.sinceLine = 0; g.flags.add('crack:in'); run(g, 9); ok(g.said.filter((t) => t.includes('그 틈, 나도 봤어')).length === 1 && g.flags.has('bond:said:esc'), '깃발 crack:in → 벗이 「그 틈, 나도 봤어」 (bond:said:esc)');
g.said.length = 0; run(g, 30); ok(!g.said.some((t) => t.includes('그 틈')), '같은 일은 다시 말하지 않는다');
g.flags.add('bond:gave'); g.said.length = 0; run(g, 9); ok(g.said.some((t) => t.includes('네가 준 거')), '다른 깃발(bond:gave)은 또 한 번');
ok((() => { const h = mk(['bond:met']); h.cond = g.cond; run(h, 4); h.flags.add('crack:in'); h.said.length = 0; run(h, 10); return !h.said.some((t) => t.includes('그 틈')); })(), '벗이 아니면(met) 반응 줄은 없다');
const sj = fs.readFileSync(path.join(root, 'core/spark.js'), 'utf8'); ok(/\[\]\.concat\(out\.flag\)/.test(sj), 'spark.apply — then.flag 가 여럿이어도 전부 세운다');
const jj = fs.readFileSync(path.join(root, 'core/jokbo.js'), 'utf8'); ok(/bond:mended/.test(jj) && /다시 벗/.test(jj), 'jokbo — 화해하면 「○○과 다시 벗」');

// 17) 80 — 데이터: 벗의 선물·화해 선물이 물려줄 것(heirloom) 열한 시대
for (const era of ERAS) {
  const w = JSON.parse(fs.readFileSync(path.join(root, 'eras', era, 'world.json'), 'utf8')); const S = w.spark; const nm = S.bond.name;
  const f3 = S.surprises.find((s) => s.id === 'bond3f'); const h = f3?.ways[0].then.heirloom;
  ok(h && h.id === 'bond' && h.name && h.fact && h.tag === `👤 ${nm}` && !f3.ways[1].then.heirloom, `${era}: 벗 끝 카드 첫 길에만 물려줄 것 「${h?.name}」(👤 ${nm})`);
  const e4 = S.surprises.find((s) => s.id === 'bond4'); const hm = e4?.ways[0].then.heirloom;
  ok(hm && hm.id === 'bond_mend' && hm.name && hm.fact && hm.tag.includes('다시 벗') && !e4.ways[1].then.heirloom, `${era}: 화해 성공 길에만 물려줄 것 「${hm?.name}」`);
}
// 18) 80 — 엔진: spark.apply(then.heirloom) → kworld_heirlooms(from:'bond') + heirloom:bond:bond 깃발, 같은 것 두 번 안 적음; 족보 셈은 숨은 것만
{
  const g = mk(['bond:met', 'bond:friend']); g.era = 'life'; g.world = w; g.life = { add() {}, d: {} }; g.spark = new Spark(g, w.spark); g.flag = (f) => g.flags.add(f);
  delete store.kworld_heirlooms; const lines = g.spark.apply({ say: 'x', heirloom: { id: 'bond', name: '흰돌의 돌', tag: '👤 흰돌', fact: 'f' } }, null, true);
  const list = JSON.parse(store.kworld_heirlooms || '[]');
  ok(list.length === 1 && list[0].id === 'bond:bond' && list[0].from === 'bond' && list[0].era === 'life' && g.flags.has('heirloom:bond:bond') && lines.some((t) => t.includes('집에 내려오는 것')), '벗의 선물 → kworld_heirlooms(from bond) + 깃발 + 결과 줄');
  g.spark.apply({ heirloom: { id: 'bond', name: '흰돌의 돌' } }, null, true); ok(JSON.parse(store.kworld_heirlooms).length === 1, '같은 선물은 두 번 안 적는다');
  Pulse.keep(g, { id: 'sec1', name: '주먹도끼' }); const rd = (k) => JSON.parse(store[k] || 'null');
  const hl = heirloomsOf('life', rd); ok(hl.length === 2 && hl.find((x) => x.id === 'bond:bond')?.from === 'bond' && !hl.find((x) => x.id === 'sec1').from, 'heirloomsOf 가 from 을 함께 돌려준다');
  const html = chestHtml([{ kind: 'now', short: '구석기', relics: 3, heirlooms: hl }]); ok(/1\/3 \+👤1/.test(html) && html.includes('벗의 선물'), `족보 상자 — 숨은 것 1/3 + 👤1(벗의 선물 표시): ${html.match(/<span class="jd">[^<]*/)?.[0]}`);
}
// 19) 80 — 엔진: 쓰러질 때 벗이 곁(8m)이면 먹을 것 1/4 만 잃고 「…일어나. 업어 왔어.」 + bond:lifted
{
  const mkD = (withBond) => { const g = mk(['bond:met', 'bond:friend']); run(g, 4); if (!withBond) g.p.pos.set(50, 0, 0); g.world = { eye: 1.55, events: [] }; g.e.areas = new Map([['camp', { x: 0, z: 0 }]]); g.inventory.push('berry', 'berry', 'berry', 'berry'); g.hunger = 50; g.checkpoint = null; g.flag = (f) => g.flags.add(f);
    const dg = new Danger(g, { food: ['berry'] }); dg.showEyes = () => {}; return { g, dg }; };
  const a = mkD(true); await a.dg.collapse('night', '눈 두 쌍.'); ok(a.g.inventory.length === 3 && a.g.flags.has('bond:lifted') && a.g.flags.has('bond:lifted:night') && a.g.said.some((t) => t.includes('업어 왔어')), `벗이 곁이면 열매 넷 중 하나만 잃고(${a.g.inventory.length} 남음) 벗의 한 줄 + bond:lifted`);
  const b = mkD(false); await b.dg.collapse('night', '눈 두 쌍.'); ok(b.g.inventory.length === 2 && !b.g.flags.has('bond:lifted') && b.g.said.some((t) => t.includes('혼자 가지 마')), `벗이 멀면 전처럼 절반(${b.g.inventory.length} 남음)·bond:lifted 없음`);
}
// 20) 80 — 반 친구 외침: pulse 가 friends.shout 를 부르고, 받는 쪽은 곁 14m 친구만 한 줄
{
  const pj = fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8'); ok(/shout\?\.\('escaped'/.test(pj) && /shout\?\.\('caught'/.test(pj) && /shout\?\.\('late'/.test(pj), 'pulse.endChase·endDeadline → friends.shout(escaped/caught/late)');
  const { Friends } = await import('../core/friends.js'); const said = []; const g = { p: { pos: { x: 0, z: 0 } }, ui: { say: (t) => said.push(t) }, e: { scene: { add() {}, remove() {} }, onFrame: [] }, world: {} };
  const fr = new Friends(g); fr.on = true; fr.me = { sid: 'me' }; fr.ch = { sent: [], send(m) { this.sent.push(m); } }; fr.friends = new Map([['f1', { tx: 3, tz: 0, body: { userData: { nick: '7 박솔' } } }]]);
  fr.shout('escaped', '포졸'); ok(fr.ch.sent.length === 1 && fr.ch.sent[0].event === 'shout' && fr.ch.sent[0].payload.kind === 'escaped', '내 외침이 채널로 나간다(kind·자리)');
  fr.recvShout({ id: 'f1', kind: 'escaped', x: 3, z: 0 }); ok(said.length === 1 && /👥 7 박솔 — 「/.test(said[0]), `곁 친구의 외침이 한 줄로: ${said[0]}`);
  fr.recvShout({ id: 'f1', kind: 'caught', x: 40, z: 0 }); ok(said.length === 1, '14m 밖 친구 외침은 안 뜬다'); fr.recvShout({ id: 'f1', kind: 'xx', x: 3, z: 0 }); fr.recvShout({ id: 'me', kind: 'late' }); ok(said.length === 1, '모르는 종류·내 것은 무시');
  fr.on = false; fr.ch.sent.length = 0; fr.shout('late'); ok(fr.ch.sent.length === 0, '반 멀티가 꺼져 있으면 안 보낸다');
}
console.log(`\n운명의 사람(bond): ${pass}/${pass + fail} 통과`); if (fail) process.exit(1);
