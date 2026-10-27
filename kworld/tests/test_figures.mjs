// 역사의 인물 층(133·134·135·136) — 데이터 열한 시대(인물 29 = 133 큰 사건 11 + 134 평화 사건 8 + 135 이름 없는 얼굴 3 + 136 셋째 사람 7: 구역·사건·선택지·연도 0·값 ±2) + 엔진(조선 전기 이순신): 사건 열림 → 걸어 들어옴 → 📯 세 줄·📜 → E 선택지 값·깃발 → again → 떠남·gone → 「그 뒤」 줄
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
ok(n === 29 && new Set(names).size === 29, `인물 29(133 큰 사건 11 + 134 평화 사건 8 + 135 이름 없는 얼굴 3 + 136 셋째 사람 7), 이름 다 다름 (${n})`);
// 134 — 떠난 뒤 마을 사람 한마디(spark gaze.rules fg_*)·만난 칭호(spark.titles fg_*)가 인물마다 하나씩, 실제 깃발에 맞물림
{ const why = []; let nr = 0, nt = 0;
  for (const era of ERAS) { const w = read(era, 'world.json'); for (const f of w.figures || []) { const r = (w.spark?.gaze?.rules || []).find((x) => x.id === 'fg_' + f.id); const t = (w.spark?.titles || []).find((x) => x.id === 'fg_' + f.id);
    if (!r || r.if !== 'figure:' + f.id + ':gone' || !r.once || !r.text) why.push(`${era}.${f.id} 소문`); else nr++;
    if (!t || t.on !== 'figure:' + f.id + ':met' || !t.name.endsWith(' 만난 사람') || !t.name.startsWith(f.name) || !t.line) why.push(`${era}.${f.id} 칭호`); else nt++; } }
  ok(!why.length && nr === 29 && nt === 29, `134 소문 ${nr}·칭호 ${nt} — 인물마다 하나씩${why.length ? ' — ' + why.join(' / ') : ''}`); }
// 135 — 구석기~청동기 이름 없는 얼굴(실존 이름 없이) + 인물마다 벗이 먼저 한마디(spark.bond.react fg_*, if figure:<id>:here, once)
{ const early = { life: 'stranger', neo: 'seafarer', 'bronze-life': 'mirrorman' }; const why = [];
  for (const [era, id] of Object.entries(early)) { const f = read(era, 'world.json').figures; if (!(f?.length === 1 && f[0].id === id)) why.push(era + ' 인물'); else if (/[가-힣]{2,3}(이순신|세종|위만)/.test(f[0].name) || f[0].name.length < 5) why.push(era + ' 이름'); }
  ok(!why.length && read('life', 'world.json').figures[0].name === '낯선 우두머리' && read('neo', 'world.json').figures[0].name === '바다 건너 온 사람' && read('bronze-life', 'world.json').figures[0].name === '거울을 든 사람', `135 구석기·신석기·청동기 이름 없는 얼굴 하나씩${why.length ? ' — ' + why.join(' / ') : ''}`);
  let nb = 0; const why2 = [];
  for (const era of ERAS) { const w = read(era, 'world.json'); const bn = w.spark?.bond?.name; for (const f of w.figures || []) { const r = (w.spark?.bond?.react || []).find((x) => x.id === 'fg_' + f.id); if (!r || r.if !== 'figure:' + f.id + ':here' || !r.once || !r.text || !r.text.includes(f.name)) why2.push(`${era}.${f.id}`); else nb++; } if (!bn) why2.push(era + ' 벗 없음'); }
  ok(!why2.length && nb === 29, `135 벗 반응 ${nb} — 인물마다 하나씩(figure:<id>:here, 이름 들어감)${why2.length ? ' — ' + why2.join(' / ') : ''}`); }
{ const j = read('joseon-life', 'world.json'); ok(j.figures.length === 3 && j.figures[1].id === 'sejong' && j.figures[1].on === 'sit:hangeul:open' && j.figures[1].to === 'seodang', '134 조선 전기 둘째 인물 = 세종(한글 열리면 서당으로)');
  const sl = read('silla-life', 'world.json').figures; ok(sl.length === 3 && sl.find((f) => f.id === 'wonhyo')?.if === 'nation:silla' && sl.find((f) => f.id === 'daejoyeong')?.if === 'nation:balhae', '134 통일신라·발해는 나라마다(원효 silla · 대조영 balhae)');
  const jl = read('joseon-late-life', 'world.json').figures; ok(jl.length === 4 && jl.map((f) => f.on).includes('sit:silhak:open') && jl.map((f) => f.on).includes('sit:jangsi:open'), '134 조선 후기 정약용(실학)·김홍도(장시) 서로 다른 사건'); }
// 136 — 셋째 사람 7(여자·낮은 신분 얼굴) + 선택마다 벗 한마디(spark.bond.react fgc_<id>_<choice>) + 인물마다 남긴 것(relic)
{ const third = { 'gojoseon-life': 'junwang', 'samguk-life': 'seondeok', 'goryeo-life': 'munikjeom', 'joseon-life': 'jangyeongsil', 'joseon-late-life': 'kimmandeok', 'gaehang-life': 'anchangho', 'daehan-life': 'jeontaeil' }; const why = [];
  for (const [era, id] of Object.entries(third)) { const f = (read(era, 'world.json').figures || []).find((x) => x.id === id); if (!f) why.push(era + ' 없음'); }
  const sd = read('samguk-life', 'world.json').figures.find((f) => f.id === 'seondeok'); if (sd?.if !== 'nation:silla' || sd.on !== 'sit:temple:open') why.push('선덕여왕 신라·탑');
  const jy = read('joseon-life', 'world.json').figures.find((f) => f.id === 'jangyeongsil'); if (jy?.on !== 'sit:yeongsil:open' || !jy.talk.choices.find((c) => c.id === 'scorn' && c.showIf === 'status:yangban')) why.push('장영실 물시계·양반만 돌아섬');
  const km = read('joseon-late-life', 'world.json').figures.find((f) => f.id === 'kimmandeok'); if (!km?.talk.choices.find((c) => c.id === 'add' && c.showIf === 'val:grain>=1')) why.push('김만덕 곡식 보태기 val');
  const jt = read('daehan-life', 'world.json').figures.find((f) => f.id === 'jeontaeil'); if (jt?.on !== 'sit:jeontaeil:open' || /분신|불을 질/.test(jt.fact + jt.say.join(''))) why.push('전태일 사실만');
  ok(!why.length, `136 셋째 사람 7(준왕·선덕여왕·문익점·장영실·김만덕·안창호·전태일)${why.length ? ' — ' + why.join(' / ') : ''}`);
  let np = 0, nrl = 0; const why2 = [], why3 = [];
  for (const era of ERAS) { const w = read(era, 'world.json'); const RE = w.spark?.bond?.react || [];
    for (const f of w.figures || []) { for (const c of f.talk.choices) { const r = RE.find((x) => x.id === `fgc_${f.id}_${c.id}`); if (!r || r.if !== `figure:${f.id}:${c.id}` || !r.once || !/^「.+」$/.test(r.text) || r.text.length > 42 || /\d/.test(r.text)) why2.push(`${era}.${f.id}.${c.id}`); else np++; }
      const r = f.relic; if (!r?.name || !r.title || !r.body?.length || !r.fact || /\d/.test(r.name + r.fact + r.body.join(''))) why3.push(`${era}.${f.id}`); else nrl++; } }
  ok(!why2.length && np >= 100, `136 벗이 선택을 두고 한마디 ${np} — 선택지마다 하나씩(figure:<id>:<choice>, once, 「」, 연도 0)${why2.length ? ' — ' + why2.slice(0, 5).join(' / ') : ''}`);
  ok(!why3.length && nrl === 29, `136 남긴 것 ${nrl} — 인물마다 relic{name,title,body,fact} 연도 0${why3.length ? ' — ' + why3.join(' / ') : ''}`);
  ok(fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8').includes('placeSecret(s) {') && fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8').includes('from: s.from || null'), 'pulse.js — placeSecret 한 점·from 넘김'); }
const sam = read('samguk-life', 'world.json').figures; ok(sam.length === 5 && sam.every((f) => /^nation:(goguryeo|baekje|silla|gaya)$/.test(f.if)), '삼국·가야는 나라마다 한 사람(if nation:) + 136 선덕여왕(신라)');
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
// 136 — 떠난 자리에 남긴 것: pulse.placeSecret 로 to 구역 곁에 ✨(id fig_yisunsin, from figure, heirloom 거북선 쇠못)
const placedSecrets = []; g.pulse = { placeSecret(s) { if (g.flags.has('secret:' + s.id)) return false; placedSecrets.push(s); return true; } };
run(40); await wait(20); ok(!fg.live.has('yisunsin') && e.removed.includes('npc_yisunsin') && !g.npcs.yisunsin && flags.has('figure:yisunsin:gone') && !flags.has('figure:yisunsin:here'), '걸어 나가 사라짐 · npcs 지움 · gone');
run(2); ok(!fg.live.has('yisunsin') && g.placed.length === 1, '다시 안 온다');
ok(placedSecrets.length === 1 && placedSecrets[0].id === 'fig_yisunsin' && placedSecrets[0].at === 'naru' && placedSecrets[0].from === 'figure' && placedSecrets[0].heirloom === '거북선 쇠못' && placedSecrets[0].tag === '📯 이순신이 남긴 것' && flags.has('figure:yisunsin:relic'), `136 떠난 자리(나루)에 남긴 것 ✨: ${placedSecrets[0]?.heirloom} · ${placedSecrets[0]?.tag}`);
ok(fg.figureLine() === '역사의 인물 — 이순신(배 만드는 나무를 댄다)을(를) 만났다.', `그 뒤 줄(아직 안 챙김): ${fg.figureLine()}`);
flags.add('secret:fig_yisunsin'); ok(fg.figureLine().endsWith('을(를) 만났다. 지나간 자리에서 거북선 쇠못을(를) 챙겼다.'), `챙기면 그 뒤 줄에 한 토막: ${fg.figureLine()}`);
ok(fg.leaveRelic(L) === false, '같은 인물 relic 두 번 안 세움(secret 깃발)');
// 말 안 걸고 보낸 경우 · 인물 없는 세계
const g2 = { ...g, flags: new Set(['status:sangmin', 'sit:imjin:open']), npcs: {}, placed: null }; g2.cond = (x) => { const old = fakeLife.g; fakeLife.g = g2; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g2.flag = (f) => g2.flags.add(f);
const f2 = new Figures(g2, w.figures); f2.tick(0.5); g2.flags.add('figure:yisunsin:gone'); g2.flags.delete('figure:yisunsin:here'); f2.live.clear();
ok(f2.figureLine().includes('말을 걸지 않았다'), `지나치면: ${f2.figureLine()}`);
ok(new Figures(g, []).figureLine() === '', '인물 없는 세계는 빈 줄');
// 135 엔진 — 둘이 같이 와도 한 사람씩 말한다(이순신·세종 동시) + 곁의 반 친구가 먼저 「저 사람 누구야?」
{ const said3 = [], flags3 = new Set(['status:sangmin', 'sit:imjin:open', 'sit:hangeul:open']), e3 = { areas: new Map([['outroad', new THREE.Vector3(0, 0, 58)], ['naru', new THREE.Vector3(9, 0, 93)], ['seodang', new THREE.Vector3(-32, 0, 35)]]), groundY: () => 0, interactables: new Map(), removeInteractable(k) { this.interactables.delete(k); } };
  const g3 = { ...g, e: e3, flags: flags3, npcs: {}, placed: null, ui: { say: (t) => said3.push(t), isOpen: () => false }, friends: { friends: new Map([['s1', { x: 10, z: 90, body: { userData: { nick: '가람' } } }]]) } };
  g3.cond = (x) => { const old = fakeLife.g; fakeLife.g = g3; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g3.flag = (f) => flags3.add(f);
  g3.story = { ...g.story, actors: {}, place(a) { const obj = new THREE.Group(); obj.position.set(a.x, 0, a.z); const it = { name: a.name, obj, box: { setFromObject() { return this; }, getCenter: (v) => v }, center: new THREE.Vector3() }; e3.interactables.set(a.name, it); g3.placed = (g3.placed || []).concat([a]); return it; } };
  const f3 = new Figures(g3, w.figures); f3.tick(0.5); ok(f3.live.size === 2, '이순신·세종이 같이 온다');
  for (let t = 0; t < 40; t += 0.5) f3.tick(0.5); await wait(120);
  const lines = said3.filter((s) => s.startsWith('📯 ') && !s.startsWith('📯 멀리서')); const who = lines.map((s) => s.slice(2, s.indexOf(' —')));
  const firstOther = who.findIndex((n) => n !== who[0]); const grouped = firstOther === 3 && who.slice(3).every((n) => n === who[3]);
  ok(lines.length === 6 && grouped, `한 사람씩 말한다 — ${who.join('·')}`);
  ok(f3.speaking === null, '다 말하면 speaking 비움');
  const cm = said3.filter((s) => s.startsWith('👥 가람 — 「저 사람 누구야?')); ok(cm.length === 2 && flags3.has('figure:yisunsin:saw') && flags3.has('figure:sejong:saw') && cm[0].includes('전라좌수사'), `반 친구가 먼저 「저 사람 누구야?」 인물마다 한 번: ${cm[0]}`);
  const g4 = { ...g3, flags: new Set(['status:sangmin', 'sit:imjin:open']), npcs: {}, placed: null, friends: { friends: new Map([['s1', { x: 40, z: 40, body: { userData: { nick: '가람' } } }]]) }, ui: { say: () => {}, isOpen: () => false } }; g4.cond = (x) => { const old = fakeLife.g; fakeLife.g = g4; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g4.flag = (f) => g4.flags.add(f);
  const f4 = new Figures(g4, w.figures); for (let t = 0; t < 40; t += 0.5) f4.tick(0.5); await wait(60); ok(!g4.flags.has('figure:yisunsin:saw'), '친구가 멀면(8m 밖) 말 안 함'); }
console.log(`\n133·134·135·136 역사의 인물: ${pass} 통과 · ${fail} 실패`); if (fail) process.exit(1);
