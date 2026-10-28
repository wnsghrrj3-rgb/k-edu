// 역사의 인물 층(133~139) — 데이터 열한 시대(인물 29 = 133 큰 사건 11 + 134 평화 사건 8 + 135 이름 없는 얼굴 3 + 136 셋째 사람 7: 구역·사건·선택지·연도 0·값 ±2) + 엔진(조선 전기 이순신): 사건 열림 → 걸어 들어옴 → 📯 세 줄·📜 → E 선택지 값·깃발 → again → 떠남·gone → 「그 뒤」 줄
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
ok(n === 38 && new Set(names).size === 38, `인물 38(133 큰 사건 11 + 134 평화 사건 8 + 135 이름 없는 얼굴 3 + 136 셋째 사람 7 + 137 넷째 사람 9), 이름 다 다름 (${n})`);
// 134 — 떠난 뒤 마을 사람 한마디(spark gaze.rules fg_*)·만난 칭호(spark.titles fg_*)가 인물마다 하나씩, 실제 깃발에 맞물림
{ const why = []; let nr = 0, nt = 0;
  for (const era of ERAS) { const w = read(era, 'world.json'); for (const f of w.figures || []) { const r = (w.spark?.gaze?.rules || []).find((x) => x.id === 'fg_' + f.id); const t = (w.spark?.titles || []).find((x) => x.id === 'fg_' + f.id);
    if (!r || r.if !== 'figure:' + f.id + ':gone' || !r.once || !r.text) why.push(`${era}.${f.id} 소문`); else nr++;
    if (!t || t.on !== 'figure:' + f.id + ':met' || !t.name.endsWith(' 만난 사람') || !t.name.startsWith(f.name) || !t.line) why.push(`${era}.${f.id} 칭호`); else nt++; } }
  ok(!why.length && nr === 38 && nt === 38, `134 소문 ${nr}·칭호 ${nt} — 인물마다 하나씩${why.length ? ' — ' + why.join(' / ') : ''}`); }
// 135 — 구석기~청동기 이름 없는 얼굴(실존 이름 없이) + 인물마다 벗이 먼저 한마디(spark.bond.react fg_*, if figure:<id>:here, once)
{ const early = { life: 'stranger', neo: 'seafarer', 'bronze-life': 'mirrorman' }; const why = [];
  for (const [era, id] of Object.entries(early)) { const f = read(era, 'world.json').figures; if (!(f?.length >= 1 && f[0].id === id)) why.push(era + ' 인물'); else if (/[가-힣]{2,3}(이순신|세종|위만)/.test(f[0].name) || f[0].name.length < 5) why.push(era + ' 이름'); }
  ok(!why.length && read('life', 'world.json').figures[0].name === '낯선 우두머리' && read('neo', 'world.json').figures[0].name === '바다 건너 온 사람' && read('bronze-life', 'world.json').figures[0].name === '거울을 든 사람', `135 구석기·신석기·청동기 이름 없는 얼굴 하나씩${why.length ? ' — ' + why.join(' / ') : ''}`);
  let nb = 0; const why2 = [];
  for (const era of ERAS) { const w = read(era, 'world.json'); const bn = w.spark?.bond?.name; for (const f of w.figures || []) { const r = (w.spark?.bond?.react || []).find((x) => x.id === 'fg_' + f.id); if (!r || r.if !== 'figure:' + f.id + ':here' || !r.once || !r.text || !r.text.includes(f.name)) why2.push(`${era}.${f.id}`); else nb++; } if (!bn) why2.push(era + ' 벗 없음'); }
  ok(!why2.length && nb === 38, `135 벗 반응 ${nb} — 인물마다 하나씩(figure:<id>:here, 이름 들어감)${why2.length ? ' — ' + why2.join(' / ') : ''}`); }
{ const j = read('joseon-life', 'world.json'); ok(j.figures.length === 4 && j.figures[1].id === 'sejong' && j.figures[1].on === 'sit:hangeul:open' && j.figures[1].to === 'seodang', '134 조선 전기 둘째 인물 = 세종(한글 열리면 서당으로)');
  const sl = read('silla-life', 'world.json').figures; ok(sl.length === 4 && sl.find((f) => f.id === 'wonhyo')?.if === 'nation:silla' && sl.find((f) => f.id === 'daejoyeong')?.if === 'nation:balhae', '134 통일신라·발해는 나라마다(원효 silla · 대조영 balhae)');
  const jl = read('joseon-late-life', 'world.json').figures; ok(jl.length === 5 && jl.map((f) => f.on).includes('sit:silhak:open') && jl.map((f) => f.on).includes('sit:jangsi:open'), '134 조선 후기 정약용(실학)·김홍도(장시) 서로 다른 사건'); }
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
  ok(!why3.length && nrl === 38, `136 남긴 것 ${nrl} — 인물마다 relic{name,title,body,fact} 연도 0${why3.length ? ' — ' + why3.join(' / ') : ''}`);
  ok(fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8').includes('placeSecret(s) {') && fs.readFileSync(path.join(root, 'core/pulse.js'), 'utf8').includes('from: s.from || null'), 'pulse.js — placeSecret 한 점·from 넘김'); }
const sam = read('samguk-life', 'world.json').figures; ok(sam.length === 6 && sam.filter((f) => f.id !== 'gayapotter').every((f) => /^nation:(goguryeo|baekje|silla|gaya)$/.test(f.if)) && !sam.find((f) => f.id === 'gayapotter').if, '삼국·가야는 나라마다 한 사람(if nation:) + 136 선덕여왕(신라) + 137 가야 토기 장인은 어느 나라에나');
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
// 137 데이터 — 넷째 사람 9: 손·글·씨앗으로 세상을 바꾼 얼굴(구석기·신석기는 이름 없이) · npcs.json 과 id 안 겹침 · relic·소문·칭호·벗 반응·선택 한마디 전부
{ const F5 = { life: ['firekeeper', '불을 지키는 할머니', 'sit:ember:open'], neo: ['kilnman', '토기 굽는 사람', 'sit:pot:open'], 'samguk-life': ['gayapotter', '가야 토기 장인', 'sit:craftsman:open'], 'silla-life': ['choechiwon', '최치원', 'sit:choe:open'], 'goryeo-life': ['jeongcheonik', '정천익', 'sit:cotton:done'], 'joseon-life': ['saimdang', '신사임당', 'sit:wellside:open'], 'joseon-late-life': ['bakjiwon', '박지원', 'sit:yeonhaeng:open'], 'gaehang-life': ['seojaepil', '서재필', 'sit:sinmun:open'], 'daehan-life': ['schoolteacher', '국민학교 선생', 'sit:school2:open'] }; const why = [];
  for (const [era, [id, name, on]] of Object.entries(F5)) { const w = read(era, 'world.json'); const f = (w.figures || []).find((x) => x.id === id); if (!f || f.name !== name || f.on !== on || !f.relic?.name) { why.push(`${era}.${id}`); continue; }
    const N = JSON.stringify(read(era, 'npcs.json')); if (N.includes(`"id": "${id}"`) || N.includes(`"id":"${id}"`)) why.push(`${era}.${id} npcs 겹침`);
    const RE = w.spark?.bond?.react || []; if (!RE.find((x) => x.id === 'fg_' + id) || f.talk.choices.some((c) => !RE.find((x) => x.id === `fgc_${id}_${c.id}`))) why.push(`${era}.${id} 벗`);
    if (!(w.spark?.gaze?.rules || []).find((x) => x.id === 'fg_' + id) || !(w.spark?.titles || []).find((x) => x.id === 'fg_' + id)) why.push(`${era}.${id} 소문·칭호`); }
  ok(!why.length, `137 넷째 사람 9(불을 지키는 할머니·토기 굽는 사람·가야 토기 장인·최치원·정천익·신사임당·박지원·서재필·국민학교 선생)${why.length ? ' — ' + why.join(' / ') : ''}`);
  const sl = read('silla-life', 'world.json').figures.find((f) => f.id === 'choechiwon'); ok(sl.if === 'nation:silla' && sl.talk.choices.find((c) => c.id === 'scorn')?.showIf === 'status:jingol', '137 최치원은 신라만 · 「육두품이 뭘」은 진골만');
  ok(read('gaehang-life', 'npcs.json') && JSON.stringify(read('gaehang-life', 'npcs.json')).includes('jusigyeong') && !read('gaehang-life', 'world.json').figures.find((f) => f.id === 'jusigyeong'), '137 주시경은 학교 문지기(npcs)로 이미 있어 개항 넷째는 서재필'); }
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
// 138 엔진 — 다시 만남: 떠난 뒤 revisit.on(병자호란 열림)이 맞으면 한 번 더 걸어와 내가 고른 것(wood)을 기억한 한 줄·E 한 줄·8초 뒤 말없이 돌아감·gone 그대로·한 번뿐
{ const n0 = said.length; flags.add('sit:horan:open'); run(0.5); const L8 = fg.live.get('yisunsin');
  ok(L8?.revisit === true && flags.has('figure:yisunsin:revisit') && !flags.has('figure:yisunsin:here') && said.slice(n0).some((x) => x.startsWith('📯 낯익은 사람이 지나간다 — 이순신')) && g.npcs.yisunsin.lines.length === 1 && g.npcs.yisunsin.lines[0].text.includes('소나무 내준 집'), '다시 온다 — 「낯익은 사람이 지나간다」·E 한 줄(소나무 내준 집)·here 깃발 없음');
  run(40); await wait(80); ok(said.slice(n0).some((x) => x === '📯 이순신 — 「소나무 내준 집. 그 배는 바다에 떠 있다.」') && !said.slice(n0).some((x) => x.startsWith('📜')), '닿으면 고른 것을 기억한 한 줄만(📜·세 줄 없음)');
  const n1 = said.length; run(12); ok(L8.leaving && !said.slice(n1).some((x) => x.includes('한산도로 간다')), '8초 뒤 말없이 돌아간다');
  L8.ac.path = null; run(1); ok(!fg.live.has('yisunsin') && flags.has('figure:yisunsin:gone') && placedSecrets.length === 1, '사라져도 gone 그대로·relic 또 안 둠'); run(2); ok(!fg.live.has('yisunsin'), '다시 만남은 한 번뿐');
  ok(fg.figureLine().includes('떠난 뒤 1번은 다시 지나가며 나를 기억했다'), `그 뒤 줄: ${fg.figureLine()}`);
  ok(fg.revisitLine({ id: 'zz', revisit: { say: { default: 'd' } }, talk: { choices: [{ id: 'a', label: '곡식을 낸다' }, { id: 'b', label: '돌아선다', val: { heart: -1 } }] } }) === 'd', 'revisitLine — 안 골랐으면 default');
  flags.add('figure:zz:b'); ok(fg.revisitLine({ id: 'zz', revisit: { say: { default: 'd' } }, talk: { choices: [{ id: 'a', label: '곡식을 낸다' }, { id: 'b', label: '돌아선다', val: { heart: -1 } }] } }).includes('돌아섰던 얼굴'), 'revisitLine — 돌아선 선택은 공통 줄'); flags.delete('figure:zz:b');
  flags.add('figure:zz:a'); ok(fg.revisitLine({ id: 'zz', revisit: { say: { default: 'd' } }, talk: { choices: [{ id: 'a', label: '곡식을 낸다' }] } }) === '다시 보는구나. 그날 — 곡식을 낸다. 잊지 않았다.', 'revisitLine — 따로 없는 선택은 선택지 글로'); }
// 138 데이터 — 38 전부 revisit{on: 뒤의 꼭 나오는 상황, say.default ≤44자·연도 0, 선택 줄은 실재 선택지}
{ const why = []; let n = 0; for (const era of ERAS) { const w = read(era, 'world.json'); const L = read(era, w.life); const must = new Set(L.situations.filter((x) => x.must).map((x) => x.id));
    for (const f of w.figures || []) { const r = f.revisit; if (!r?.on || !r.say?.default) { why.push(`${era}.${f.id}`); continue; } const sid = r.on.split(':')[1]; if (!must.has(sid) || (sid === f.on.split(':')[1] && !r.on.endsWith(':done'))) why.push(`${era}.${f.id} on`);
      for (const [k, v] of Object.entries(r.say)) { if ((k !== 'default' && k !== 'scorn' && !f.talk.choices.find((c) => c.id === k)) || v.length > 44 || /\d/.test(v)) why.push(`${era}.${f.id}.${k}`); } n++; } }
  ok(!why.length && n === 38, `138 다시 만남 ${n} — 뒤의 꼭 나오는 상황·한 줄 ≤44·선택 줄 실재${why.length ? ' — ' + why.slice(0, 6).join(' / ') : ''}`); }
// 138 — 손님 인물에 반 친구 「누가 불렀어?」(friends SHOUT.figure, recvFigure 가 shout) · 「그 뒤」 📯 줄에 손님으로만 본 인물
{ const fr = fs.readFileSync(path.join(root, 'core/friends.js'), 'utf8'); ok(/figure: \['「누가 불렀어\?」/.test(fr) && fr.includes("this.shout('figure', f.name, f.id)") && /REPLY = \{[^\n]*figure: \[/.test(fr), 'friends.js — SHOUT.figure·REPLY.figure·recvFigure 가 shout');
  const g9 = { ...g, flags: new Set(['status:sangmin', 'figure:sejong:guest']), npcs: {} }; const f9 = new Figures(g9, w.figures); ok(f9.figureLine() === '역사의 인물 — 반 친구의 일로 온 세종을(를) 보았다.', `손님으로만 본 인물: ${f9.figureLine()}`);
  g9.flags.add('figure:yisunsin:gone'); g9.flags.add('figure:yisunsin:met'); f9.picked.set('yisunsin', { label: 'x' }); ok(f9.figureLine().endsWith('을(를) 만났다. 반 친구의 일로 온 세종을(를) 보았다.'), `만남 + 손님: ${f9.figureLine()}`); }
ok(placedSecrets.length === 1 && placedSecrets[0].id === 'fig_yisunsin' && placedSecrets[0].at === 'naru' && placedSecrets[0].from === 'figure' && placedSecrets[0].heirloom === '거북선 쇠못' && placedSecrets[0].tag === '📯 이순신이 남긴 것' && flags.has('figure:yisunsin:relic'), `136 떠난 자리(나루)에 남긴 것 ✨: ${placedSecrets[0]?.heirloom} · ${placedSecrets[0]?.tag}`);
ok(fg.figureLine() === '역사의 인물 — 이순신(배 만드는 나무를 댄다)을(를) 만났다. 떠난 뒤 1번은 다시 지나가며 나를 기억했다.', `그 뒤 줄(아직 안 챙김): ${fg.figureLine()}`);
flags.add('secret:fig_yisunsin'); ok(fg.figureLine().includes('을(를) 만났다. 지나간 자리에서 거북선 쇠못을(를) 챙겼다. 떠난 뒤 1번'), `챙기면 그 뒤 줄에 한 토막: ${fg.figureLine()}`);
ok(fg.leaveRelic(L) === false, '같은 인물 relic 두 번 안 세움(secret 깃발)');
// 말 안 걸고 보낸 경우 · 인물 없는 세계
const g2 = { ...g, flags: new Set(['status:sangmin', 'sit:imjin:open']), npcs: {}, placed: null }; g2.cond = (x) => { const old = fakeLife.g; fakeLife.g = g2; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g2.flag = (f) => g2.flags.add(f);
const f2 = new Figures(g2, w.figures); f2.tick(0.5); g2.flags.add('figure:yisunsin:gone'); g2.flags.delete('figure:yisunsin:here'); f2.live.clear();
ok(f2.figureLine().includes('말을 걸지 않았다'), `지나치면: ${f2.figureLine()}`);
ok(new Figures(g, []).figureLine() === '', '인물 없는 세계는 빈 줄');
// 137 엔진 — 손님: 반 친구의 사건으로 온 인물(arrive guest) — 📯 줄은 보이고 E 는 한 줄뿐·🧬 깃발 없음 → 내 사건이 열리면 promote(선택지 붙음·시간 다시) / 그냥 떠나면 gone·relic 없음 → 내 사건 때 다시 온다 · friends.figured 방송
{ const said5 = [], flags5 = new Set(['status:sangmin']), e5 = { areas: new Map([['outroad', new THREE.Vector3(0, 0, 58)], ['naru', new THREE.Vector3(9, 0, 93)]]), groundY: () => 0, interactables: new Map(), removeInteractable(k) { this.interactables.delete(k); } }; const sent = [], secrets5 = [];
  const g5 = { ...g, e: e5, flags: flags5, npcs: {}, placed: null, ui: { say: (t) => said5.push(t), isOpen: () => false }, friends: { figured: (id) => sent.push(id) }, pulse: { placeSecret: (sx) => { secrets5.push(sx); return true; } } };
  g5.cond = (x) => { const old = fakeLife.g; fakeLife.g = g5; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g5.flag = (f) => flags5.add(f);
  g5.story = { ...g.story, actors: {}, place(a) { const obj = new THREE.Group(); obj.position.set(a.x, 0, a.z); const it = { name: a.name, obj, box: { setFromObject() { return this; }, getCenter: (v) => v }, center: new THREE.Vector3() }; e5.interactables.set(a.name, it); g5.placed = (g5.placed || []).concat([a]); return it; } };
  const f5 = new Figures(g5, w.figures); const ys = w.figures.find((x) => x.id === 'yisunsin');
  ok(f5.arrive(ys, { guest: true, by: '7 박솔' }) === true && f5.live.get('yisunsin')?.guest === true && flags5.has('figure:yisunsin:here') && said5[0].includes('(반 친구 7 박솔의 일로)') && sent.length === 0, '손님으로 온다 — 「반 친구 …의 일로」, 방송은 안 함');
  ok(g5.npcs.yisunsin.lines.length === 1 && !g5.npcs.yisunsin.lines[0].choices && g5.npcs.yisunsin.lines[0].text.startsWith('「'), '손님 E 는 한 줄뿐(선택지 없음)');
  ok(f5.arrive(ys, { guest: true }) === false, '이미 와 있으면 다시 안 온다');
  for (let t = 0; t < 40; t += 0.5) f5.tick(0.5); await wait(80);
  ok(said5.filter((x) => x.startsWith('📯 이순신 — 「')).length >= 1, '손님도 📯 줄은 말한다');
  flags5.add('sit:imjin:open'); f5.tick(0.5);
  const L5 = f5.live.get('yisunsin'); ok(L5 && L5.guest === false && L5.t <= 0.5 && g5.npcs.yisunsin.lines.length === 2 && g5.npcs.yisunsin.lines[1].choices.length === 4 && said5.some((x) => x.includes('너를 보았다 — 말을 걸 수 있다')), '내 사건이 열리면 promote — 선택지 넷·시간 다시·한 줄');
  // 손님이 그냥 떠나면 gone 도 relic 도 없다
  const said6 = [], flags6 = new Set(['status:sangmin']), secrets6 = []; const g6 = { ...g5, flags: flags6, npcs: {}, placed: null, ui: { say: (t) => said6.push(t), isOpen: () => false }, pulse: { placeSecret: (sx) => { secrets6.push(sx); return true; } }, friends: { figured: () => {} } }; g6.cond = (x) => { const old = fakeLife.g; fakeLife.g = g6; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g6.flag = (f) => flags6.add(f);
  e5.interactables.clear(); const f6 = new Figures(g6, w.figures); f6.arrive(ys, { guest: true }); const L6 = f6.live.get('yisunsin'); L6.there = true; L6.leaving = true; L6.ac.path = null; f6.tickOne(L6, 0.5);
  ok(!f6.live.has('yisunsin') && !flags6.has('figure:yisunsin:gone') && flags6.has('figure:yisunsin:guestgone') && !flags6.has('figure:yisunsin:here') && secrets6.length === 0, '손님이 떠나면 gone·relic 없음(guestgone 만)');
  flags6.add('sit:imjin:open'); f6.tick(0.5); ok(f6.live.get('yisunsin')?.guest === false, '그 뒤 내 사건이 열리면 제대로 다시 온다');
  // 내 사건으로 오면 friends.figured 방송
  const sent7 = []; const g7 = { ...g5, flags: new Set(['status:sangmin', 'sit:imjin:open']), npcs: {}, placed: null, ui: { say: () => {}, isOpen: () => false }, friends: { figured: (id) => sent7.push(id) } }; g7.cond = (x) => { const old = fakeLife.g; fakeLife.g = g7; const r = fakeLife.cond(x); fakeLife.g = old; return r; }; g7.flag = (f) => g7.flags.add(f);
  e5.interactables.clear(); new Figures(g7, w.figures).tick(0.5); ok(sent7.length === 1 && sent7[0] === 'yisunsin', '내 사건으로 오면 friends.figured(id) 방송');
  const fr = fs.readFileSync(path.join(root, 'core/friends.js'), 'utf8'); ok(fr.includes("event: 'figure'") && fr.includes('recvFigure(p)') && fr.includes("arrive(f, { guest: true"), 'friends.js — figure 이벤트 · recvFigure → arrive guest'); }
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

// ---- 139 — 인물 기록(kworld_figures) · 도감 📯 칸 · 족보 👤 줄·n/38 · 「누가 불렀어?」 답 뒤 같이 가기(figure:<id>:with) ----
{ const { recordFigure, figureLog, figuresOfEra, figLine, figureHtml } = await import('../core/dogam.js'); const { collect, jokboHtml } = await import('../core/jokbo.js'); const { Friends } = await import('../core/friends.js');
  const chain = JSON.parse(fs.readFileSync(path.join(root, 'eras/chain.json'), 'utf8')); const dg = JSON.parse(fs.readFileSync(path.join(root, 'eras/dogam.json'), 'utf8'));
  ok(chain.eras.every((e) => e.people === (read(e.era, 'world.json').figures || []).length) && chain.eras.reduce((a, e) => a + e.people, 0) === 38, '139 chain.json people = 시대마다 인물 수, 합 38');
  const whyD = []; for (const E of dg.eras) { const W = read(E.era, 'world.json').figures || []; if (!E.figures || E.figures.length !== W.length) { whyD.push(E.era); continue; } for (const f of E.figures) { const w = W.find((x) => x.id === f.id); if (!w || f.name !== w.name || (w.title || null) !== (f.title || null) || !f.event) whyD.push(`${E.era}.${f.id}`); } }
  ok(!whyD.length && dg.people === 38, `139 dogam.json 시대마다 figures(id·이름·직함·어느 사건) · people 38${whyD.length ? ' — ' + whyD.join(' / ') : ''}`);
  // 가짜 localStorage — recordFigure 가 적고 도감·족보가 읽는다
  const mem = new Map(); globalThis.localStorage = { getItem: (k) => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const said9 = [], flags9 = new Set(['status:sangmin']), added9 = []; const life9 = { g: null, status: 'sangmin', values: { craft: 1, heart: 1 }, add: (k, v) => added9.push([k, v]), cap: () => 0, hurt: new Set(), d: { hurts: {} }, log: [], nationName: null, statusName: '상민' }; life9.cond = Life.prototype.cond; life9.one = Life.prototype.one; life9.valCond = Life.prototype.valCond;
  const e9 = { areas: new Map([['outroad', new THREE.Vector3(0, 0, 58)], ['naru', new THREE.Vector3(9, 0, 93)], ['seodang', new THREE.Vector3(-32, 0, 35)]]), groundY: () => 0, interactables: new Map(), removed: [], removeInteractable(k) { this.interactables.delete(k); } };
  const g9 = { era: 'joseon-life', e: e9, p: { pos: new THREE.Vector3(9, 1.6, 88), enabled: true }, flags: flags9, world: w, npcs: {}, ui: { say: (t) => said9.push(t), isOpen: () => false }, sound: { play: () => { } }, life: life9, restoring: false,
    story: { fast: true, actors: {}, cutsceneOn: false, place(a) { const obj = new THREE.Group(); obj.position.set(a.x, 0, a.z); const it = { name: a.name, obj, box: { setFromObject() { return this; }, getCenter: (v) => v }, center: new THREE.Vector3() }; e9.interactables.set(a.name, it); return it; } } };
  life9.g = g9; g9.cond = (x) => life9.cond(x); const fg9 = new Figures(g9, w.figures); g9.figures = fg9; g9.flag = (f) => { if (flags9.has(f)) return; flags9.add(f); fg9.onFlag(f); };
  const run9 = (sec) => { for (let t = 0; t < sec; t += 0.5) fg9.tick(0.5); };
  flags9.add('sit:imjin:open'); run9(0.5); const log1 = figureLog();
  ok(log1['joseon-life']?.yisunsin?.how?.came === 1 && log1['joseon-life'].yisunsin.name === '이순신' && log1['joseon-life'].yisunsin.title === '전라좌수사' && !log1['joseon-life'].yisunsin.choice, '왔을 때 kworld_figures 에 came(이름·직함)');
  run9(25); await wait(40); g9.flag('figure:yisunsin:wood'); await wait(20); const log2 = figureLog();
  ok(log2['joseon-life'].yisunsin.how.met === 1 && log2['joseon-life'].yisunsin.choice === '배 만드는 나무를 댄다' && log2['joseon-life'].yisunsin.n === 1, '말 걸고 고르면 met + 고른 것(n 은 온 횟수 그대로 1)');
  flags9.add('sit:hangeul:open'); run9(0.5); ok(figureLog()['joseon-life'].sejong?.how?.came === 1, '세종도 오면 came');
  const list9 = figuresOfEra('joseon-life'); ok(list9.length === 2 && figLine(list9) === '👤 이순신(배 만드는 나무를 댄다) · 세종 지나침', `figuresOfEra·figLine: ${figLine(list9)}`);
  recordFigure('joseon-life', 'yisunsin', 'with', { name: '이순신' }); ok(figLine(figuresOfEra('joseon-life')).startsWith('👤 이순신(배 만드는 나무를 댄다) 👥'), 'with 면 👥');
  recordFigure('gaehang-life', 'yugwansun', 'guest', { name: '유관순' }); ok(figLine(figuresOfEra('gaehang-life')) === '👤 유관순 손님', '손님으로만 본 인물은 「손님」');
  // 도감 📯 칸 — 이 시대: 만난·지나친·그림자(어느 사건에 온다, 연도 없이)
  const sits9 = read('joseon-life', 'life.json').situations; const list = w.figures.map((f) => ({ id: f.id, name: f.name, title: f.title || null, event: sits9.find((s) => s.id === f.on.split(':')[1])?.title || '' }));
  const h9 = figureHtml(figureLog(), { era: 'joseon-life', list, all: 38 });
  ok(h9.includes('fc met') && h9.includes('배 만드는 나무를 댄다') && h9.includes('반 친구와 함께') && h9.includes('fc seen') && h9.includes('마을에 왔지만 말을 걸지 않았다') && (h9.match(/fc ghost/g) || []).length === 2 && h9.includes('때 온다') && !/\d+년/.test(h9) && h9.includes('만난 역사의 인물 1/38') && h9.includes('지나친 얼굴 2'), '도감 📯 칸 — 만남·지나침·그림자 둘(어느 사건에 온다)·합 1/38·지나친 얼굴 2');
  const hA = figureHtml(figureLog(), { eras: dg.eras, all: 38 }); ok((hA.match(/<details class="fera"/g) || []).length === 11 && hA.includes('<details class="fera" open><summary><b>조선 전기</b><span class="dcnt">1/4') && hA.includes('<b>신석기</b><span class="dcnt">0/2'), '따로 연 도감 — 시대 11 묶음, 만난 시대만 펼침, n/전체');
  ok(figureHtml({}, { era: 'life', list: [] }) === '' && figureHtml({}, { era: 'life', list: [{ id: 'x', name: '낯선 우두머리', event: '다른 무리를 만났다.' }] }).includes('다른 무리를 만났다 때 온다'), '기록·목록 없으면 빈 글 / 목록만 있으면 그림자');
  ok(fs.readFileSync(path.join(root, 'core/dogam.js'), 'utf8').includes("'</p>' + bz + fz + '<details'") && fs.readFileSync(path.join(root, 'dogam.html'), 'utf8').includes('figureHtml(figureLog(), { eras: data.eras'), 'openDogam·dogam.html 에 📯 칸');
  // 족보 👤 줄 — carry 에 figures 가 실렸으면 그것, 없으면 이 기기 kworld_figures · 요약 n/38
  const store9 = { 'kworld_carry:life': { craft: 1, heart: 1, grain: 0, rank: 0, branch: 'b', title: '갈림', marks: [], sits: 3, t: 100, figures: [{ id: 'stranger', name: '낯선 우두머리', choice: '고기를 나눈다' }] } };
  const rows9 = collect(chain, g9, (k) => store9[k] || JSON.parse(mem.get(k) || 'null'));
  ok(rows9[0].figures?.[0]?.name === '낯선 우두머리' && rows9[7].kind === 'now' && rows9[7].figures?.length === 2 && rows9[7].figures.find((f) => f.id === 'yisunsin')?.choice === '배 만드는 나무를 댄다', '족보 줄: 1대는 carry 의 figures · 지금 사는 대는 figures.met(고른 것)');
  const j9 = jokboHtml(chain, rows9); ok(j9.includes('jfg">👤 낯선 우두머리(고기를 나눈다) <span class="jd">1/2</span>') && j9.includes('👤 이순신(배 만드는 나무를 댄다) 👥 · 세종 지나침 <span class="jd">1/4</span>') && j9.includes('역사의 인물 2/38'), '족보 한 장 — 👤 줄 n/시대 인물 수 · 요약 「역사의 인물 2/38」');
  const rowsN = collect(chain, null, (k) => k === 'kworld_carry:neo' ? { craft: 1, heart: 1, branch: 'b', title: 't', marks: [], sits: 1, t: 50 } : JSON.parse(mem.get(k) || 'null'));
  ok(rowsN[1].figures?.length === 0 && !jokboHtml(chain, rowsN).includes('역사의 인물 '), 'carry 에도 기기에도 없으면 👤 줄·요약 없음');
  // 「누가 불렀어?」 답 뒤 같이 가기 — 외친 쪽(손님을 본 친구)이 답을 받을 때 6m 안이면 figure:<id>:with
  const mk = (pos) => { const sd = [], fl = new Set(), bc = []; const gg = { era: 'joseon-life', p: { pos: new THREE.Vector3(pos[0], 0, pos[1]), body: null }, flags: fl, figures: { list: w.figures }, ui: { say: (t) => sd.push(t), isOpen: () => false }, sound: { play: () => { } }, e: { scene: { add() { }, remove() { } }, onFrame: [] }, world: {} }; gg.flag = (f) => fl.add(f);
    const F = new Friends(gg); F.on = true; F.me = { sid: 'me' + pos.join(''), nick: '나' }; F.ch = { send: (m) => bc.push(m) }; return { gg, F, sd, fl, bc }; };
  const A = mk([0, 0]); const fB = { body: new THREE.Group(), x: 3, z: 0, tx: 3, tz: 0 }; fB.body.userData = { nick: '7 박솔' }; A.F.friends.set('B', fB);
  A.F.recvWave({ id: 'B', nick: '7 박솔', reply: { to: A.F.me.sid, kind: 'figure', fig: 'sejong' } });
  ok(A.fl.has('figure:sejong:with') && A.fl.has('friend:figure') && A.sd.some((x) => x === '👥 7 박솔이(가) 같이 간다 — 세종') && A.bc.some((m) => m.payload?.reply?.kind === 'back' && m.payload.reply.for === 'figure' && m.payload.reply.fig === 'sejong' && m.payload.reply.with === true), `답을 받은 쪽(3m): 깃발 figure:sejong:with + 「같이 간다」 + back(for figure, with)`);
  ok(figureLog()['joseon-life'].sejong.how.with === 1, '기기 기록에도 with');
  const A2 = mk([0, 0]); const fC = { body: new THREE.Group(), x: 9, z: 0, tx: 9, tz: 0 }; fC.body.userData = { nick: '3 김하늘' }; A2.F.friends.set('C', fC);
  A2.F.recvWave({ id: 'C', reply: { to: A2.F.me.sid, kind: 'figure', fig: 'sejong' } }); ok(!A2.fl.has('figure:sejong:with') && A2.bc.some((m) => m.payload?.reply?.kind === 'back' && m.payload.reply.with === false) && A2.sd.some((x) => x.startsWith('👋 3 김하늘 — ')), '9m 밖이면 깃발 없음(답 한 줄·back 은 그대로, with false)');
  const D = mk([0, 0]); const fE = { body: new THREE.Group(), x: 4, z: 2, tx: 4, tz: 2 }; fE.body.userData = { nick: '5 이솔' }; D.F.friends.set('E', fE);
  D.F.recvWave({ id: 'E', reply: { to: D.F.me.sid, kind: 'back', for: 'figure', fig: 'sejong', with: true } }); ok(D.fl.has('figure:sejong:with') && D.sd.some((x) => x.includes('같이 간다 — 세종')) && !D.bc.length, '답한 쪽(부른 사람): back(for figure, with) 이 오면 자기 화면에도 깃발 + 한 줄, 다시 답하진 않음');
  D.F.recvWave({ id: 'E', reply: { to: D.F.me.sid, kind: 'back', for: 'figure', fig: 'sejong', with: true } }); ok(D.sd.filter((x) => x.includes('같이 간다')).length === 1, '같은 인물은 한 번');
  const Z = mk([0, 0]); const fZ = { body: new THREE.Group(), x: 1, z: 0, tx: 1, tz: 0 }; fZ.body.userData = { nick: 'z' }; Z.F.friends.set('Z', fZ); Z.F.recvWave({ id: 'Z', reply: { to: Z.F.me.sid, kind: 'figure', fig: 'nobody' } }); ok(!Z.fl.has('figure:nobody:with'), '이 시대에 없는 인물 id 면 조용');
  Z.F.recvShout({ id: 'Z', kind: 'figure', title: '세종', fig: 'sejong', x: 1, z: 0 }); Z.F.wave(); ok(Z.F.reply === null && Z.bc.some((m) => m.event === 'wave' && m.payload.reply?.kind === 'figure' && m.payload.reply.fig === 'sejong'), 'recvShout 가 fig 를 들고 있다가 G 답에 실어 보낸다');
  ok(fg9.figureLine().includes('그중 1번은 반 친구와 함께 갔다') === flags9.has('figure:yisunsin:with') || (flags9.add('figure:yisunsin:with'), fg9.figureLine().includes('을(를) 만났다. 그중 1번은 반 친구와 함께 갔다.')), `그 뒤 줄: ${fg9.figureLine()}`);
  delete globalThis.localStorage; }
// 140 — 교사 안내 한 장(teacher.html): 새 층(소문·인물·신분의 문·짐승·소리) 상자 + 7번 역사의 인물 표(dogam.json figures) + 층 끄는 스위치
{ const tg = fs.readFileSync(path.join(root, 'teacher.html'), 'utf8');
  ok(tg.includes('./eras/dogam.json') && tg.includes('id="figures"') && tg.includes('7. 역사의 인물') && tg.includes('e.figures.map'), 'teacher.html — 7번 역사의 인물 표가 dogam.json figures 를 읽는다');
  ok(['소문과 전조', '역사의 인물</b>', '신분의 문 · 내 집', '짐승 · 길 위의 일 · 소리', '인물로 여는 이야기', '?figures=0', '?beasts=0', '?doors=0', '잠들기'].every((k) => tg.includes(k)), 'teacher.html — 새 층 상자 다섯·수업 이야기·스위치·잠들기');
  ok(!/\d{3,4}년/.test(tg.split('<h2>7.')[1] || ''), 'teacher.html 7번 표 둘레에 연도 없음(표는 ev() 가 연도를 뺀다)'); }
console.log(`\n133~139 역사의 인물: ${pass} 통과 · ${fail} 실패`); if (fail) process.exit(1);
