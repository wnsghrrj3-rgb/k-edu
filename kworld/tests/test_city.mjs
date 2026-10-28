// 케이시티(141) 0단계 「한내시 첫 해」 — 세계 팩 구조 + 고리 시험: 읍내 터(daehan.glb) 빌림 · 값 이름(일자리·민심·예산) · 시작 예산 5 · 딜레마 셋(공장·시장 골목·예산) + 섞여 둘(개울·놀이터) · 선택지마다 📜 「~해서 → 그래서」 · 끝 갈림 5(판단 0) · 성찰 물음 · 시민 NPC 이해관계
import * as THREE from 'three';
import fs from 'fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
const { Game } = await import('../core/game.js'); const { Story } = await import('../core/story.js'); const { Life, VN_DEFAULT, valName } = await import('../core/life.js');
const base = process.argv[2] || path.join(root, 'eras/city/');
const J = (n) => JSON.parse(fs.readFileSync(path.join(base, n + '.json'), 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const world = J('world'), life = J('life'), items = J('items'), npcs = J('npcs'), missions = J('missions');
// ---- 구조: 읍내 GLB 를 빌린다 — 구역·ix·NPC 가 GLB 와 맞는지(test_daehan_life_glb 와 같은 셈) ----
const buffer = fs.readFileSync(path.join(base, world.glb)); const data = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString());
const names = data.nodes.map((n) => n.name || ''); const ix = names.filter((n) => n.startsWith('ix_')); const types = new Set(ix.map((n) => n.split('_')[1])); const areas = names.filter((n) => n.startsWith('area_')).map((n) => n.slice(5));
ok(world.glb === '../daehan-life/daehan.glb' && world.height === '../daehan-life/height.json' && fs.existsSync(path.join(base, world.height)), '터 = 대한민국 읍내 GLB·높이맵을 빌린다(bpy 없이)');
ok([...types].every((t) => items.targets[t]) && Object.keys(items.targets).every((t) => types.has(t)), 'items.json 대상 = GLB ix 전부');
ok(Object.keys(world.areas).every((a) => areas.includes(a)) && Object.keys(world.areas).length >= 20 && areas.includes(world.face), `구역 ${Object.keys(world.areas).length} 전부 GLB 에·시작 시선 ${world.face}`);
const gnpcs = ix.filter((n) => n.startsWith('ix_npc_')).map((n) => n.slice(7)); ok(gnpcs.every((id) => npcs[id]) && Object.keys(npcs).every((id) => gnpcs.includes(id)), `NPC ${gnpcs.length} = npcs.json`);
ok(['jiju', 'sojak', 'dolaon', 'jumo', 'eupjang', 'gyosa', 'haksaeng'].every((id) => npcs[id].lines.length >= 3), '이해관계 시민 일곱(기와집 노인·하류 농부·청년·노점·비서·선생·학생)은 상황마다 다른 말');
const mats = new Set((data.materials || []).map((m) => m.name)); ok(Object.values(items.targets).every((t) => (t.hidden || []).every((m) => mats.has(m))), '숨김 재질 전부 GLB 에');
// ---- 값 이름·시작 값 ----
ok(valName(life, 'craft') === '🔧 일자리' && valName(life, 'heart') === '👥 민심' && valName(life, 'grain') === '💰 예산' && valName(VN_DEFAULT && {}, 'craft') === '✋ 솜씨', '값 이름은 세계 팩 life.json values 에서(역사 기본 = 솜씨)');
ok(life.start?.grain === 5 && life.rank.open === false && life.grain.open === true && !life.carry, '시작 예산 5 · 자리(rank) 닫힘 · 넘겨받기 없음');
// ---- 상황·선택지 ----
const must = life.situations.filter((s) => s.must), mixed = life.situations.filter((s) => !s.must);
ok(must.map((s) => s.id).join() === 'factory,market,budget' && mixed.map((s) => s.id).join() === 'river,play', '꼭 셋(공장→시장 골목→예산) + 섞여 둘(개울·놀이터)');
const why = []; let nc = 0;
for (const s of life.situations) { if (!world.areas[s.place]) why.push(s.id + ' 자리'); for (const c of s.choices) { nc++; if (!c.done || !c.fact || !c.fact.includes('→ 그래서')) why.push(`${s.id}.${c.id} 📜`); if (/\d{4}년/.test(c.fact + c.result.join(''))) why.push(`${s.id}.${c.id} 연도`); if (/옳|잘못|착한|나쁜 시장/.test(c.fact + c.result.join(''))) why.push(`${s.id}.${c.id} 판단`);
    const R = Object.values(items.targets).flatMap((t) => t.rename || []).flatMap((r) => r.choices || []); if (!R.find((x) => x.flag === c.done)) why.push(`${s.id}.${c.id} 몸으로 고르는 자리 없음`); } }
ok(!why.length && nc === 14, `선택지 ${nc} 전부 몸으로 고르는 자리 + 📜 「~해서 → 그래서」·연도 0·판단 0${why.length ? ' — ' + why.join(' / ') : ''}`);
ok(life.situations.find((s) => s.id === 'river').if === 'fa:yes', '개울 냄새는 공장을 그냥 들였을 때만');
const END = life.situations.find((s) => s.id === 'budget').choices[0].then[0].end; ok(END.branches.length === 5 && !END.branches[4].if && END.branches.every((b) => b.body.some((x) => x.startsWith('💭'))) && !/옳|틀렸/.test(JSON.stringify(END)), '끝 갈림 5(마지막 무조건) · 줄마다 💭 성찰 한 줄 · 판단 0');
ok(world.bridge.q.a.length === 3 && world.bridge.q.why.includes('까닭') && (world.bridge.beats[1].rules || []).length === 9, '「그 뒤」 물음 하나(까닭을 말한다) · 한내시 모습 규칙 9');
ok(world.gate.next === 'city' && world.gate.requires[0] === 'life:end' && world.danger.nightRadius === 0 && world.hideHunger && !world.figures && !world.beasts && !world.doors, '문은 다음 해(같은 세계) · 밤 위험·배고픔 없음 · 인물·짐승·신분의 문 없음(0단계)');
ok(world.road.events.length === 3 && world.road.events.every((e) => e.ways?.length === 2 && e.fact.includes('그래서')) && (world.spark.gaze.rules || []).length >= 10 && world.spark.titles.length === 5, '길 위의 일 3 · 마을의 눈 10+ · 칭호 5');
// ---- 고리(엔진): 공장 조건 → 시장 장날 → 급식 → 끝 갈림 「맑은 개울, 느린 도시」 ----
const mkGame = () => {
  const g = new Game(base); [g.world, g.items, g.npcs, g.missions] = [world, items, npcs, missions]; g.why = {}; g.check = { questions: [] }; g.mi = 0; g.missionStart = performance.now(); g.hunger = 100;
  const S = { says: [], panel: null, panels: [] };
  g.ui = { setMission: (t) => { g._mission = t; }, setCompass() { }, pulseHint() { }, say: (t) => S.says.push(t), setPrompt() { }, setHunger() { }, setGoal(t) { g._goal = t; }, renderInventory() { }, isOpen: () => !!S.panel, close() { S.panel = null; }, whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => { S.says.push('NPC:' + t); cb(); }, open: (h, b) => { S.panel = { h, b }; S.panels.push(h); }, craftPanel() { }, check: (d, a, f) => f([]), pickPanel() { }, setGoalSub() { } };
  g.p = { enabled: true, speedMul: 1, teleport() { }, pos: new THREE.Vector3(0, 0, 0), yaw: 0 };
  const IX = new Map(); for (const n0 of ix) { const n = n0.slice(3); const [type, ...rest] = n.split('_'); IX.set(n, { type, id: rest.join('_') || type, name: n, uses: 0, state: null, center: new THREE.Vector3(), obj: { traverse() { }, position: new THREE.Vector3(), rotation: {} } }); }
  const A = new Map(); for (const n of data.nodes) if (n.name?.startsWith('area_')) A.set(n.name.slice(5), new THREE.Vector3(...(n.translation || [0, 0, 0])));
  g.e = { interactables: IX, removeInteractable: (k) => IX.delete(k), areas: A, groundY: () => 0, pickTarget: () => null, scene: { add() { }, remove() { }, children: [], traverse() { } }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => { }; g.story = new Story(g, { add: [] }); g.story.fast = true; g.story.apply();
  g.life = new Life(g, J('life')); g.character = world.characters[0]; g.sex = { id: 'f' }; g.life.seed = 3; g.life.mixed = ['river', 'play']; g.life.begin();
  const closeCard = () => { while (S.panel) { const b = S.panel.b[0]; S.panel = null; b.onClick(); } };
  const use = (name) => { closeCard(); g.target = IX.get(name); g.act(); if (S.panel && S.panel.b.length === 1 && S.panel.h.includes('chk life') && !S.panel.h.includes('결과') && !S.panel.h.includes('이번 삶') && !S.panel.h.includes('첫 해')) { closeCard(); g.act(); } };
  const pick = (label) => { if (!S.panel) { ok(false, '판 없음 ' + label); return; } const b = S.panel.b.find((x) => x.label.startsWith(label)); if (!b) { ok(false, '버튼 없음 ' + label + ' ' + S.panel.b.map((x) => x.label)); return; } S.panel = null; b.onClick(); };
  const goTo = (area) => { const a = A.get(area); g.p.pos.set(a.x, 0, a.z); g.life.t = 1; g.life.tick(0.6); };
  const btn = (label) => S.panel?.b.find((x) => x.label.startsWith(label));
  const dismiss = () => { S.panel = null; };
  return { g, S, use, pick, goTo, closeCard, btn, A, dismiss };
};
const { g, S, use, pick, goTo, closeCard, btn, dismiss } = mkGame();
ok(g.life.values.grain === 5 && g.life.values.craft === 2 && g.life.values.heart === 3 && g.life.statusName === '새 시장' && g.life.nationName === '한내시', `시작 값 💰5 🔧2 👥3 · 새 시장 · 한내시 (${JSON.stringify(g.life.values)})`);
ok(g.life.vn('grain') === '💰 예산' && g.life.hudHtml?.() === undefined, 'life.vn 이 세계 팩 이름을 돌려준다');
goTo('gongjang'); ok(g.flags.has('sit:factory:open') && S.panels.some((h) => h.includes('공장이 오겠다고 한다')), '공장 부지에 가면 첫 상황 카드');
use('gongjang_1'); ok(S.panel && btn('조건을 단다'), `표지 앞에서 선택지 셋(${S.panel?.b.map((x) => x.label).join(' / ')})`);
pick('조건을 단다'); ok(g.flags.has('fa:cond') && g.flags.has('sit:factory:done') && g.life.values.grain === 4 && g.life.values.craft === 3 && g.life.values.heart === 4, `조건을 달면 💰-1 🔧+1 👥+1 → ${JSON.stringify(g.life.values)}`);
ok(S.panels.some((h) => h.includes('그래서 조건을 단 도시는')), '결과 카드에 📜 「~해서 → 그래서」');
closeCard(); g.flags.add('market:on'); g.life.onFlag(); goTo('jangteo'); ok(g.flags.has('sit:market:open'), '비서 깃발 market:on → 시장 골목 상황');
use('jangteo_1'); pick('요일을 나눈다'); ok(g.flags.has('mk:share') && g.life.values.grain === 5 && g.flags.has('title:t_share') || g.flags.has('mk:share'), `장날 → 💰 ${g.life.values.grain} 👥 ${g.life.values.heart}`);
closeCard(); g.flags.add('budget:on'); g.life.onFlag(); goTo('eupsamuso'); use('eup_1'); ok(btn('빚을 내 둘 다') && !btn('빚을 내 둘 다').disabled, '예산 5면 빚 길도 열린다');
dismiss(); g.life.values.grain = 1; g.life.render(); use('eup_1'); const b1 = btn('다리를 놓는다'); ok(b1 && b1.disabled && b1.reason.includes('예산이 둘'), '예산 1이면 다리(예산 2)는 회색 + 이유 한 줄');
dismiss(); g.life.values.grain = 5; use('eup_1'); pick('급식을 바꾼다');
ok(g.flags.has('bg:lunch') && g.life.values.grain === 3 && g.flags.has('sit:budget:done'), `급식 → 💰3 · 예산 상황 끝`);
closeCard(); await new Promise((r) => setTimeout(r, 400)); ok(g.flags.has('life:end') && g.flags.has('life:clean_jobs'), `끝 갈림 = 맑은 개울, 느린 도시(${[...g.flags].filter((f) => f.startsWith('life:')).join(',')})`);
{ const h = S.panels.find((x) => x.includes('chk life end')) || ''; ok(h.includes('🔧 일자리') && h.includes('💰 예산') && !h.includes('솜씨'), `끝 카드 값 이름 = 일자리·민심·예산(솜씨 없음) ${h ? '' : '— 끝 카드 없음: ' + S.panels.slice(-2).map((x) => x.slice(0, 80)).join(' | ')}`); }
dismiss();
// 섞여: 공장을 그냥 들이면 개울 냄새가 열린다 / 조건을 달면 안 열린다
{ const T = mkGame(); T.goTo('gongjang'); T.use('gongjang_1'); T.pick('들인다'); T.closeCard(); T.goTo('dari'); ok(T.g.flags.has('sit:river:open'), '그냥 들이면 개울 냄새 상황이 열린다'); T.use('dari_1'); T.pick('모른 척한다'); ok(T.g.flags.has('rv:ignore') && T.g.life.values.heart === 0, '모른 척 → 👥-2(들여서 2였던 민심이 0)');
  const U = mkGame(); U.goTo('gongjang'); U.use('gongjang_1'); U.pick('거절한다'); U.closeCard(); U.goTo('dari'); ok(!U.g.flags.has('sit:river:open'), '거절하면 개울 냄새 없음'); U.goTo('hakgyo'); ok(U.g.flags.has('sit:play:open'), '학교에 가면 놀이터 편지'); }
// 세계 팩 목록 + index.html ?world=
const wl = JSON.parse(fs.readFileSync(path.join(root, 'worlds.json'), 'utf8')); ok(wl.worlds.history?.start === 'life' && wl.worlds.city?.start === 'city' && wl.worlds.city.eras.includes('city'), 'worlds.json — history·city 두 팩');
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); ok(idx.includes("get('world')") && idx.includes('worlds.json'), 'index.html — ?world=city 로 들어가면 그 팩의 시작 시대');
console.log(`\n케이시티 0단계: ${pass} 통과 · ${fail} 실패`); process.exit(fail ? 1 : 0);
