// 미리 하는 한 가지(118) — 소문(117)을 먼저 들은 집이 큰 사건 전에 한 가지를 미리 해 두면(items rename 맨 앞, prep:<X>) 사건 안에 👂 길 하나가 더 열린다(showIf prep:<X>). 열한 시대 데이터 전수 + 조선 전기 엔진(사화 밤 소문 → 숯가마 옆 곡식 묻기 → 임진 「묻어 둔 곡식」 → 곳간을 연 집). WebGL 없이 규칙만.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const IX = ['hopae_1', 'samun_1', 'examhall_1', 'jagyeokru_1', 'hwangok_1', 'hangeul_1', 'seoan_1', 'sewing_1', 'slavehut_1', 'ybgate_1', 'bigpaddy_1', 'bigpaddy_2', 'smallpaddy_1', 'smallpaddy_2', 'homepaddy_1', 'bestall_1', 'stonepile_1', 'rack_1', 'hideout_1', 'pass_1', 'qingcamp_1', 'boat_1', 'waeship_1',
  'gyosaengbook_1', 'seokjeon_1', 'hgoutside_1', 'wheel_1', 'tributecrate_1', 'claypit_1', 'beacon_1', 'fuelpile_1', 'lookout_1', 'npc_gyogwan', 'npc_sagijang', 'npc_bongsugun',
  'npc_jumo', 'npc_nongbu', 'npc_pojol', 'npc_cheongjigi', 'npc_seonbi', 'npc_ai', 'npc_nageune', 'npc_hunjang', 'npc_baetsagong', 'npc_sojak', 'npc_baekjeong', 'npc_anju', 'npc_nobi', 'npc_ajeon', 'npc_gwanno', 'npc_kkeokjeong', 'npc_uibyeong', 'npc_sunsin'];
const AREAS = { eogwi: [0, -40], outroad: [0, -58], jangteo: [0, -6], jumak: [-13.5, -5], well: [6.5, -2.5], yangban: [0, 22], haengrang: [-9.5, 23.5], sarang: [-7, 27], anchae: [1, 37.5], gwana: [-27, -5], dongheon: [-30, 8.5], choga: [28, -7], field: [27, -30], seodang: [-31, -29.5], naru: [9, -93], deul: [66, -9], oettan: [72, -79], gogae: [-100, -70], sanjung: [-80, 84], hyanggyo: [-42, 49], sagiso: [92, 59], bongsu: [34, -83] };
const mkGame = (sex, carry, char = 'hand') => {
  store['kworld_carry:goryeo-life'] = JSON.stringify(carry); const mixed = ['hyanggyo', 'sagiso', 'bongsu'];
  const g = new Game(base);
  [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() {}, pulseHint() {}, say: (t) => S.says.push(t), setPrompt() {}, setHunger() {}, setGoal(t) { g._goal = t; }, renderInventory() {}, isOpen: () => !!S.panel, close() { S.panel = null; },
    whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const ix = new Map(); const shown = {};
  const MAT = { gyosaengbook_1: ['roll_ink'], wheel_1: ['buncheong', 'slip_white'], beacon_1: ['beacon_fire', 'beacon_fire2'] };
  const mk = (name) => { const [type, ...rest] = name.split('_'); ix.set(name, { type, id: rest.join('_') || type, name, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse(fn) { for (const m of MAT[name] || []) fn({ isMesh: true, material: { name: m }, set visible(v) { shown[m] = v; } }); if (name === 'waeship_1') fn({ isMesh: true, material: { name: 'wae_sail' }, set visible(v) { shown.wae = v; } }); if (name === 'qingcamp_1') fn({ isMesh: true, material: { name: 'qing_tent' }, set visible(v) { shown.qing = v; } }); }, position: new THREE.Vector3(), rotation: {} } }); };
  IX.forEach(mk);
  const areas = new Map(Object.entries(AREAS).map(([k, v]) => [k, new THREE.Vector3(v[0], 0, v[1])]));
  g.e = { interactables: ix, removeInteractable: (k) => ix.delete(k), areas, groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {};
  g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply();
  for (const t of ix.values()) { const d = g.items.targets[t.type]; if (d?.start) t.state = d.start; if (d?.hidden) g.showMats(t, d.hidden, false); }
  g.life = new Life(g, J('life'));
  g.character = g.world.characters.find((c) => c.id === char); g.sex = { id: sex };
  g.life.seed = 3; g.life.mixed = mixed; g.life.begin();
  const use = (name) => { g.target = ix.get(name); g.act(); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const pick = (label) => { const b = btn(label); if (!b) { console.log('버튼 없음', label, S.panel?.b.map((x) => x.label)); fail++; return; } S.panel = null; b.onClick(); };
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const goTo = (area) => { const a = areas.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const useR = (name, label) => { use(name); if (!btn(label) && S.panel?.b.length === 1) { closeCard(); use(name); } };   // 꼭 나오는 상황 카드가 먼저 뜨면 닫고 한 번 더
  const on = (...flags) => { for (const f of flags) g.flags.add(f); g.life.onFlag(); };
  return { g, ix, S, shown, use, useR, pick, closeCard, goTo, btn, on, opened: (id) => g.flags.has('sit:' + id + ':open'), done: (id) => g.flags.has('sit:' + id + ':done') };
};
Math.random = () => 0.01;
const settle = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const drain = async (closeCard, goTo, area) => { for (let i = 0; i < 4; i++) { closeCard(); await settle(); goTo(area); } };   // 뒤에 줄 선 카드(꼭 나오는 상황)를 비우고 then 이 돌 틈을 준다
Math.random = () => 0.01;
const skip = (g, ids) => { for (const id of ids) { g.flags.add('sit:' + id + ':open'); g.flags.add('sit:' + id + ':done'); g.life.opened.add(id); g.life.done.add(id); } };
const toImjin = (T) => { skip(T.g, ['hopae', 'corvee', 'hangeul', 'exam', 'sahwa']); T.on('war:on'); T.goTo('eogwi'); T.closeCard(); };
const DL = () => J('world').pulse.deadlines.find((d) => d.id === 'imjin');
const END = J('life').situations.find((s) => s.id === 'horan').choices[0].then[0].end;
const endOf = (T) => { T.closeCard(); T.g.life.endCard(END); return [...T.g.flags].filter((f) => f.startsWith('life:')); };
const YANG = (heart, grain) => ({ craft: 3, heart, grain, rank: 2, branch: 'gongsin', status: 'sadaebu', nation: 'goryeo' });
const SOL = (grain) => ({ craft: 1, heart: 1, grain, rank: 0, branch: 'solgeo', status: 'solgeo', nation: 'goryeo' });
const SANG = { craft: 2, heart: 2, grain: 2, rank: 0, branch: 'reclaim', status: 'yangmin', nation: 'goryeo' };
// ---- 데이터 전수(열한 시대)
{
  const ERAS = { life: 'leave', neo: 'store', 'bronze-life': 'sword', 'gojoseon-life': 'court', 'samguk-life': 'war', 'silla-life': 'exam', 'goryeo-life': 'land', 'joseon-life': 'imjin', 'joseon-late-life': 'gongmyeong', 'gaehang-life': 'samil', 'daehan-life': 'nongji' };
  const LIFE_X = { life: 'leave', neo: 'store', 'bronze-life': 'sword', 'gojoseon-life': 'court', 'samguk-life': 'war', 'joseon-life': 'imjin', 'joseon-late-life': 'gong', 'gaehang-life': 'sm', 'daehan-life': 'nj' };   // 통일신라·고려는 인생 길 없음(사건 중간 단계)
  const root = base.replace(/\/eras\/[^/]+\/?$/, '');
  const R = (e, n) => JSON.parse(fs.readFileSync(`${root}/eras/${e}/${n}.json`, 'utf8'));
  let preps = 0, gates = 0;
  for (const [e, x] of Object.entries(ERAS)) {
    const items = R(e, 'items'), npcs = R(e, 'npcs'), life = R(e, 'life'), world = R(e, 'world');
    const must = life.situations.filter((s) => s.must).map((s) => s.id); ok(must.includes(x) && must.indexOf(x) > 0, `${e}: ${x} 는 꼭 나오는 상황(첫 상황 아님 — 소문이 있다)`);
    ok((world.spark?.gaze?.rules || []).some((r) => r.flag === `rumor:${x}:heard`), `${e}: rumor:${x}:heard 소문이 있다`);
    const prep = []; for (const [tid, t] of Object.entries(items.targets)) for (const r of t.rename || []) if (r.flag === `prep:${x}`) prep.push([tid, r]);
    ok(prep.length === 1, `${e}: 미리 하기 자리 하나(${prep.map((p) => p[0]).join(',')})`); preps += prep.length;
    for (const [tid, r] of prep) {
      const t = items.targets[tid]; ok(r.if.startsWith(`rumor:${x}:heard && !sit:${x}:open && !prep:${x}`) && r.once === false && r.verb.includes('미리') && r.say?.startsWith('👂') && r.name === t.name, `${e}: ${tid} — 소문 뒤·사건 전·한 번 · 「미리」 · 👂`);
      const firstN = t.rename.findIndex((q) => !/prep:/.test(q.if || '')); ok(firstN === -1 || t.rename.indexOf(r) < firstN, `${e}: ${tid} — 미리 하기가 보통 rename 보다 앞`);
      for (const k of ['requires', 'gives', 'remove', 'uses', 'consumes', 'roll', 'choices', 'journal']) if (k in t && !(e === 'life' && k === 'gives')) ok(r[k] === null, `${e}: ${tid} — 기본 ${k} 를 null 로 덮음`);
      ok(!/\d{3,4}년|\(\d{3,4}\)|기원전/.test(r.verb + r.say), `${e}: ${tid} — 연도 0`);
    }
    // 사건 안 길 — showIf prep:<x> 선택지(NPC 줄·자리) 또는 prep:<x> 조건 rename
    const gate = [];
    for (const [nid, n] of Object.entries(npcs)) for (const l of n.lines || []) for (const c of l.choices || []) if ((c.showIf || '').startsWith(`prep:${x}`)) gate.push(['npc', nid, c, l]);
    for (const [tid, t] of Object.entries(items.targets)) for (const r of t.rename || []) { for (const c of r.choices || []) if ((c.showIf || '').startsWith(`prep:${x}`)) gate.push(['item', tid, c, r]); if (/(^|&& )prep:/.test(r.if || '') && r.if.includes(`sit:${x}:open`)) gate.push(['rename', tid, r, t]); }
    ok(gate.length >= 1, `${e}: 사건 안 👂 길 ${gate.length}`); gates += gate.length;
    for (const [kind, id, c, host] of gate) {
      const hostIf = kind === 'rename' ? c.if : (host.if || ''); ok(hostIf.includes(`sit:${x}:open`) && hostIf.includes(`!sit:${x}:done`), `${e}: ${kind} ${id} — 사건 열려 있을 때`);
      const fl = [].concat(c.flag); const want = LIFE_X[e] ? `${LIFE_X[e]}:prep` : `${x}:prep`; ok(fl.includes(want), `${e}: ${kind} ${id} — 깃발 ${want}`);
      ok(c.say?.startsWith('👂') && (kind === 'rename' ? c.verb : c.label).length <= 36 && !/\d{3,4}년/.test(c.say), `${e}: ${kind} ${id} — 👂 say · 글자 수 · 연도 0`);
      if (kind !== 'rename') ok(host.choices.indexOf(c) === host.choices.length - 1, `${e}: ${kind} ${id} — 선택지 끝(기존 번호 안 밀림)`);
      if (kind === 'rename') ok(!c.roll && host.rename.indexOf(c) < host.rename.findIndex((r) => r !== c && (r.if || '').includes(`sit:${x}:open`) && !/prep:/.test(r.if)), `${e}: rename ${id} — 굴림 없음 · 같은 사건 보통 rename 보다 앞`);
    }
    if (LIFE_X[e]) {
      const s = life.situations.find((q) => q.id === x); const p = s.choices.find((c) => c.id === 'prep');
      ok(p && p.done === `${LIFE_X[e]}:prep` && s.choices.indexOf(p) === s.choices.length - 1, `${e}: 인생 길 prep(done ${LIFE_X[e]}:prep) · 끝에`);
      ok(p.title.startsWith('먼저 들은 집') && p.result?.length === 2 && /먼저 듣고/.test(p.fact) && /→ 그래서/.test(p.fact) && !/\d{3,4}년/.test(p.fact) && ((p.heart || 0) > 0 || p.rank || p.status), `${e}: 제목 「먼저 들은 집」 · 📜 「먼저 듣고 … → 그래서」 · 좋아지는 값 하나`);
      ok((s.ways || []).some((w) => w.startsWith('👂 소문을 먼저 들은 집')), `${e}: ways 에 👂 한 줄`);
      const ref = s.choices.find((c) => c.then && c.id !== 'prep'); if (ref) ok(JSON.stringify(p.then) === JSON.stringify(ref.then), `${e}: 끝(end) 사본 같음`);
    } else {
      const s = life.situations.find((q) => q.id === x); ok(!s.choices.some((c) => c.id === 'prep') && (s.ways || []).some((w) => w.startsWith('👂')), `${e}: 인생 길 없음(중간 단계) · ways 👂 한 줄`);
    }
    // 끝 갈림에 prep 이 들어간 곳은 || 로 넓힌 것뿐(새 갈림 0)
    const ends = []; for (const s of life.situations) for (const c of s.choices) for (const t of c.then || []) if (t.end) ends.push(t.end.branches);
    ok(ends.every((br) => br.every((b) => !b.id.includes('prep'))) && ends.every((br) => br.filter((b) => (b.if || '').includes(':prep')).every((b) => b.if.includes('||'))), `${e}: 새 끝 갈림 0 · prep 은 || 로만`);
  }
  ok(preps === 11 && gates >= 14, `열한 시대 미리 하기 ${preps} · 사건 안 👂 길 ${gates}`);
}
// ---- 판 1 — 조선 전기 양반 남, 곡식 1: 사화 밤에 소문 → 숯가마 옆에서 곡식을 미리 묻어 둠 → 임진 → 곳간 회색이어도 「묻어 둔 곡식」 → 🤝+3 🌾-1 → 곳간을 연 집
{
  const T = mkGame('m', YANG(1, 1), 'eye'); const { g, use, pick, btn, done, S } = T;
  skip(g, ['hopae', 'corvee', 'hangeul', 'exam']); T.on('sit:sahwa:open'); T.goTo('sanjung'); T.closeCard();
  use('hideout_1'); ok(!g.flags.has('prep:imjin') && !(S.panel?.b || []).some((b) => b.label.includes('미리')), '소문을 안 들었으면 숯가마 옆에 「미리」 없음');
  g.flags.add('rumor:imjin:heard'); const d = g.defFor(g.e.interactables.get('hideout_1')); ok(d.verb.includes('곡식을 미리 산속에 묻어 둔다'), `소문을 들으면 숯가마 옆 동사 = 「${d.verb}」`);
  use('hideout_1'); T.closeCard(); ok(g.flags.has('prep:imjin') && S.says.some((t) => t.startsWith('👂🌾')), '묻어 뒀다 → prep:imjin · 👂 한 줄');
  ok(!g.defFor(g.e.interactables.get('hideout_1')).verb.includes('미리'), '한 번 묻으면 「미리」 동사는 사라진다');
  skip(g, ['sahwa']); T.on('war:on'); T.goTo('eogwi'); T.closeCard(); ok(T.opened('imjin'), '임진왜란 열림');
  use('npc_uibyeong'); ok(btn('마을에 남는다')?.disabled && btn('의병을 일으킨다')?.disabled, '곡식 하나·인심 하나 → 곳간·의병 둘 다 회색'); const pb = btn('묻어 둔 곡식'); ok(pb && !pb.disabled, '👂 「묻어 둔 곡식을 꺼내 의병을 먹인다」 열림(값 조건 없음)');
  const gr = g.life.values.grain, he = g.life.values.heart; pick('묻어 둔 곡식'); ok(done('imjin') && g.flags.has('imjin:prep') && g.life.values.grain === gr - 1 && g.life.values.heart === he + 3, '먹였다 — 🌾-1 🤝+3'); ok(g.cond(DL().until), '정하면 급한 일 끝');
  const L = endOf(T); ok(L.includes('life:feeder'), '끝 갈림 「곳간을 연 양반의 집」(|| imjin:prep)');
}
// ---- 판 2 — 양반 여, 소문 안 들음: 「묻어 둔 곡식」 안 보임 · 양반 남 안 묻었으면 안 보임
{
  const T = mkGame('f', YANG(2, 3), 'hand'); const { g, use, btn } = T;
  toImjin(T); use('npc_uibyeong'); ok(!btn('묻어 둔 곡식') && btn('안채 곳간을 연다'), '소문도 묻기도 없으면 👂 길 없음 — 안채 곳간만');
  g.flags.add('rumor:imjin:heard'); g.ui.close(); use('npc_uibyeong'); ok(!btn('묻어 둔 곡식'), '소문만 듣고 안 묻었으면 역시 없음(prep 깃발이 열쇠)');
}
// ---- 판 3 — 상민은 숯가마 옆에 「미리」가 안 선다(양반만)
{
  const T = mkGame('m', SANG, 'eye'); const { g } = T;
  skip(g, ['hopae', 'corvee', 'hangeul', 'exam']); T.on('sit:sahwa:open'); T.closeCard(); g.flags.add('rumor:imjin:heard');
  ok(g.life.status !== 'yangban' && !g.defFor(g.e.interactables.get('hideout_1')).verb.includes('미리'), '상민 — 숯가마 옆은 그대로');
}
console.log(`미리 하는 한 가지(118): ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
