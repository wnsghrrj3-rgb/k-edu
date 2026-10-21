// 「그 뒤」 다리 카드 시험 — 끝 카드 「○○로 가기」 → 그 뒤 카드(시대 질문·답·세상·우리 집·다음) → 「왜 세상이 바뀌었을까」 3지선다(틀리면 정답 한 줄) → 족보 → 다음 시대.
// 데이터 전수(열한 시대): bridge 있음·beats 셋·우리 집 규칙의 if 가 실제 끝 갈림(life:<branch>)·done 깃발·값 조건을 가리킴·마지막 규칙은 조건 없음·q 셋(중복 없음)·why.
import * as THREE from 'three';
import fs from 'fs';
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.location = { href: 'http://x/kworld/?era=life' };
globalThis.fetch = async () => ({ json: async () => JSON.parse(fs.readFileSync(`${base}/../chain.json`, 'utf8')) });   // 족보(chain.json)
const { Game } = await import('../core/game.js');
const { Story } = await import('../core/story.js');
const { Life } = await import('../core/life.js');
const base = process.argv[2];
const J = (n) => JSON.parse(fs.readFileSync(`${base}/${n}.json`, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// --- 데이터 전수
const eras = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const walk = (o, acc) => { if (Array.isArray(o)) o.forEach((v) => walk(v, acc)); else if (o && typeof o === 'object') { if (o.end?.branches) acc.push(...o.end.branches.map((b) => b.id)); for (const v of Object.values(o)) walk(v, acc); } };
const bad = []; let nrules = 0;
for (const e of eras) {
  const w = JSON.parse(fs.readFileSync(`${base}/../${e}/world.json`, 'utf8')), d = JSON.parse(fs.readFileSync(`${base}/../${e}/life.json`, 'utf8'));
  const b = w.bridge; if (!b) { bad.push(e + ':none'); continue; }
  if (!b.answer || !b.years) bad.push(e + ':answer');
  if (!Array.isArray(b.beats) || b.beats.length !== 3 || !b.beats[0].text || !b.beats[2].text) bad.push(e + ':beats');
  const branches = []; walk(d, branches); const dones = new Set(); for (const s of d.situations) for (const c of s.choices || []) if (c.done) dones.add('sit:' + s.id + ':' + c.id);
  const rules = b.beats?.[1]?.rules || []; if (!rules.length || rules.at(-1).if) bad.push(e + ':home:last');
  for (const r of rules) { nrules++; if (!r.text) bad.push(e + ':home:text'); if (!r.if) continue; for (const tok of r.if.split('||').map((x) => x.trim())) { if (tok.startsWith('life:')) { if (!branches.includes(tok.slice(5))) bad.push(e + ':home:' + tok); } else if (tok.startsWith('sit:')) { if (!dones.has(tok)) bad.push(e + ':home:' + tok); } else if (!/^(val|hurt|status):/.test(tok)) bad.push(e + ':home:tok:' + tok); } }
  const q = b.q; if (!q || !q.q || !Array.isArray(q.a) || q.a.length !== 3 || new Set(q.a).size !== 3 || !q.why) bad.push(e + ':q');
  if (!w.question) bad.push(e + ':question');
  if (/\d{3,4}년|\d{3,4}\s*~/.test(b.answer)) bad.push(e + ':answer:year');   // 답 한 줄은 연도가 아니라 인과로
}
ok(!bad.length, '열한 시대 bridge 데이터 전수 ' + bad.join(' ')); ok(nrules >= 70, `우리 집 규칙 수 ${nrules}`);
// --- 엔진: 구석기 끝 → 「신석기로 가기」 → 그 뒤 카드 → 물음(틀림 → 정답 한 줄 → 족보) / 두 번째 판은 안 뜸
const mk = () => {
  const g = new Game(base); [g.world, g.items, g.npcs, g.why, g.check, g.missions] = ['world', 'items', 'npcs', 'why', 'check', 'missions'].map(J);
  g.era = 'life'; g.mi = 0; g.missionStart = performance.now(); g.hintShown = false; g.hunger = g.world.hunger.start;
  g.ui = { setMission() {}, setCompass() {}, pulseHint() {}, say: (t) => (g._says ??= []).push(t), setPrompt() {}, setHunger() {}, setGoal() {}, renderInventory() {}, isOpen: () => !!g._panel, close() { g._panel = null; }, whyCard: (c, cb) => cb(), npcLine: (n, t, cb) => cb(), open: (h, b) => { g._panel = { h, b }; (g._panels ??= []).push(h); }, craftPanel() {}, check: (d, a, f) => f([]), pickPanel() {} };
  g.p = { enabled: true, speedMul: 1, teleport() {}, pos: new THREE.Vector3(0, 0, 20), yaw: 0 };
  g.e = { interactables: new Map(), removeInteractable() {}, areas: new Map(), groundY: () => 0, pickTarget: () => null, scene: { add() {}, remove() {}, children: [], traverse() {} }, onFrame: [], spawn: new THREE.Vector3(), sun: { intensity: 1, color: new THREE.Color() }, renderer: { toneMappingExposure: 1 } };
  g.setFire = () => {}; g.story = new Story(g, J('scene')); g.story.fast = true; g.story.apply(); g.life = new Life(g, J('life')); g.character = g.world.characters.find((c) => c.id === 'hand'); g.sex = { id: 'f' }; g.life.seed = 7; g.life.begin();
  g.save = { clear() {}, touch() {}, recordEnd() {} }; return g;
};
const g = mk(); g.flags.add('life:review:done');
g.life.values.heart = 4; g.life.injure('leg'); g.flags.add('sit:leave:ember');
const end = g.life.situations.find((s) => s.id === 'leave').choices[0].then[0].end; g.life.end(end);
ok(g.flags.has('life:carried') && g._panel?.h.includes('업혀서'), '끝 카드: 절뚝+인심 4 → 업혀서');
const goBtn = g._panel.b.find((b) => b.label.includes('신석기로 가기')); ok(!!goBtn, '끝 카드에 「신석기로 가기」'); g._panel = null; goBtn.onClick();
ok(g.flags.has('life:bridge') && g._panel?.h.includes('그 뒤') && g._panel.h.includes(g.world.question) && g._panel.h.includes(g.world.bridge.answer), '그 뒤 카드: 시대 질문·답');
ok(g._panel.h.includes('업혀서 떠난 너는') && !g._panel.h.includes('불씨를 들고 넘은'), '우리 집 줄: 끝 갈림(carried)이 먼저 맞는 규칙');
ok(g._panel.h.includes('빙하기가 끝나며') && g._panel.h.includes('강가 움집'), '세상·다음 줄');
const next = g._panel.b[0]; ok(next.primary && next.label.includes('다음 대로'), '단추 「그래서 — 다음 대로」'); g._panel = null; next.onClick();
ok(g._panel?.h.includes('왜 세상이 바뀌었을까') && g._panel.b.length === 3, '물음 카드: 3지선다');
const wrong = g._panel.b.find((b) => b.label !== g.world.bridge.q.a[0]); g._panel = null; wrong.onClick();
ok(g.flags.has('bridge:miss') && g._panel?.h.includes('그건 아니었어') && g._panel.h.includes(g.world.bridge.q.a[0]) && g._panel.h.includes(g.world.bridge.q.why), '틀림 → 정답 한 줄 + why(되돌아가기 없음)');
ok(g.results.some((r) => r.id === 'bridge:life' && r.concept === 'hist.why' && r.ok === false), '결과 기록 bridge:life');
const okb = g._panel.b[0]; g._panel = null; okb.onClick(); await new Promise((r) => setTimeout(r, 30));
ok(g._panel?.h.includes('족보') && g._panel.b[0].label.includes('신석기로 →'), '그 뒤 → 족보(다음 대로 단추)로 이어짐');
// 맞힌 경우 + 두 번째는 안 뜸
const g2 = mk(); g2.flags.add('life:review:done'); g2.life.values.heart = 1; g2.flags.add('sit:leave:alone'); g2.life.end(end);
ok(g2.flags.has('life:alone') && g2._panel.h.includes('먼저 떠났다'), '끝 갈림 alone');
g2._panel.b.find((b) => b.label.includes('신석기로 가기')).onClick(); ok(g2._panel.h.includes('혼자 먼저 넘은 너는'), '우리 집 줄: sit:leave:alone');
g2._panel.b[0].onClick(); const right = g2._panel.b.find((b) => b.label === g2.world.bridge.q.a[0]); g2._panel = null; right.onClick();
await new Promise((r) => setTimeout(r, 30)); ok(g2.flags.has('bridge:ok') && g2._panel?.h.includes('족보'), '맞힘 → 바로 족보');
g2._panel = null; g2.life.bridge(() => { g2._bridged = true; }); ok(g2._bridged && !g2._panel, '두 번째 bridge() 는 안 뜨고 바로 done');
// bridge 없는 시대(world.bridge 삭제)는 그냥 지나간다
const g3 = mk(); delete g3.world.bridge; g3._panel = null; g3.life.bridge(() => { g3._bridged = true; }); ok(g3._bridged && !g3._panel, 'bridge 데이터 없으면 바로 done');
console.log(`bridge: ${pass} 통과 / ${fail} 실패`); process.exit(fail ? 1 : 0);
