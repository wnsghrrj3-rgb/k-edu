// 대한민국 인생 층 구조 검증 — 새 터 daehan.glb(bpy daehan_land.py, 10-15 넓히기 2: 판자촌·전파사 골목·중학교): ix 34 + NPC 23 · 구역 23 · 미션 10 · 숨김 재질 넷(철조망 barbed·새마을 slate_blue·아파트 apt_concrete·다리 bridge_new) · done 깃발 전수 · 직업 카드 13(천장 없음 — 누구나 6) · 끝 갈림 41 · 개항에서 넘겨받음 · 문 → 구석기(처음부터, 열림)
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = new URL('../eras/daehan-life/', import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(new URL(f, base)));
const world = read('world.json'), items = read('items.json'), npcDefs = read('npcs.json'), missions = read('missions.json'), scene = read('scene.json'), life = read('life.json');
assert.equal(world.glb, 'daehan.glb', '새 터');
const buffer = fs.readFileSync(new URL(world.glb, base));
const data = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString());
assert.deepEqual(scene.add || [], [], 'scene.add 없음 — 자리는 전부 GLB');
const names = data.nodes.map((n) => n.name || '');
const ix = names.filter((n) => n.startsWith('ix_'));
const types = new Set(ix.map((n) => n.split('_')[1]));
for (const t of types) assert.ok(items.targets[t], `대상 ${t} 가 items.json 에 없음`);
for (const t of Object.keys(items.targets)) assert.ok(types.has(t), `items.json 대상 ${t} 가 GLB 에 없음`);
const areas = names.filter((n) => n.startsWith('area_')).map((n) => n.slice(5));
for (const a of Object.keys(world.areas)) assert.ok(areas.includes(a), `구역 ${a} 없음`);
assert.equal(Object.keys(world.areas).length, 23, '구역 23'); assert.ok(areas.includes(world.face) && names.includes('spawn'), `시작 시선 구역 ${world.face} + spawn`);
const npcs = ix.filter((n) => n.startsWith('ix_npc_')).map((n) => n.slice(7));
for (const id of Object.keys(npcDefs)) assert.ok(npcs.includes(id), `NPC ${id} 가 GLB 에 없음`);
for (const id of npcs) assert.ok(npcDefs[id], `GLB NPC ${id} 가 npcs.json 에 없음`);
assert.equal(npcs.length, 23, 'NPC 23'); assert.equal(ix.length - npcs.length, 34, '상호작용 자리 34');
for (const k of ['jeontaeil', 'itaeyeong', 'ganhosa', 'gwangbu', 'chobyeong', 'pinanmin', 'dolaon']) assert.ok(npcDefs[k], `인물 카드 ${k}`);
const mats = new Set((data.materials || []).map((m) => m.name));
for (const [t, h] of Object.entries(items.targets)) for (const m of h.hidden || []) assert.ok(mats.has(m), `숨김 재질 ${m}(${t}) 가 GLB 에 없음`);
assert.deepEqual([items.targets.cheoljomang.hidden, items.targets.saemaeul.hidden, items.targets.apateu.hidden, items.targets.dari.hidden], [['barbed'], ['slate_blue'], ['apt_concrete'], ['bridge_new']], '숨김 넷');
assert.deepEqual([items.targets.halfpanja.hidden, items.targets.workbench.hidden, items.targets.lottery.hidden], [['panja_roof'], ['tv_light'], ['lottery_balls']], '넓히기 2 숨김 셋(판자 지붕·TV 화면·은행알)');
// 숨김 재질은 그 ix 오브젝트의 자식 메시에 실제로 있어야 showMats 가 켠다
const matIdx = Object.fromEntries((data.materials || []).map((m, i) => [m.name, i]));
const meshMats = (mi) => (data.meshes[mi].primitives || []).map((p) => p.material);
for (const [t, h] of Object.entries(items.targets)) for (const m of h.hidden || []) {
  const node = data.nodes.find((n) => n.name === `ix_${t}_1`); assert.ok(node, `ix_${t}_1`);
  const kids = [node, ...(node.children || []).map((c) => data.nodes[c])]; const found = kids.some((n) => n.mesh !== undefined && meshMats(n.mesh).includes(matIdx[m]));
  assert.ok(found, `ix_${t}_1 안에 ${m} 재질 메시가 없음`);
}
const list = missions.missions; assert.equal(list.length, 10, '미션 10');
const must = life.situations.filter((x) => x.must); assert.equal(must.length, 10, '꼭 나오는 상황 10');
assert.ok(life.situations.length - must.length >= life.mixedCount && life.situations.length >= 24, '섞여 14 ≥ mixedCount 4');
for (const k of ['panja', 'sueri', 'junghak']) assert.ok(world.areas[k] && life.situations.some((x) => x.id === k && x.q?.a?.length === 3) && world.journal[k]?.note, `넓히기 2 ${k} 구역·상황·기록`);
for (const m of list) assert.ok(must.some((x) => 'sit:' + x.id + ':done' === m.done), `미션 ${m.id} 가 상황과 안 맞음`);
for (const sit of life.situations) { if (sit.place) assert.ok(world.areas[sit.place], `상황 ${sit.id} 장소 ${sit.place}`); for (const c of sit.choices) assert.ok(c.done || c.count, `상황 ${sit.id} 선택 ${c.id} 에 done 없음`); }
const blob = JSON.stringify(items) + JSON.stringify(npcDefs) + JSON.stringify(life.situations.map((s) => s.choices.map((c) => c.flag))) + JSON.stringify(world.pulse || {});   // 긴장 층(쫓김·급한 일)이 세우는 깃발도 센다(10-16)
for (const sit of life.situations) for (const c of sit.choices) if (c.done) for (const f of c.done.split('&&').map((x) => x.trim()).filter((x) => !x.startsWith('!'))) assert.ok(blob.includes(`"${f}"`), `상황 ${sit.id} 선택 ${c.id} 의 done 깃발 ${f} 를 세우는 곳이 없음`);
for (const sit of life.situations) for (const c of sit.choices) if (c.status) assert.ok(life.status.rules.some((r) => r.id === c.status), `상황 ${sit.id} 선택 ${c.id} 의 신분 ${c.status} 없음`);
for (const s of life.situations) if (s.onOpen) for (const a of s.onOpen) if (a.show) { assert.ok(ix.includes('ix_' + a.show.name), `onOpen show ${a.show.name}`); for (const m of a.show.mats) assert.ok(mats.has(m), `onOpen 재질 ${m}`); }
const last = life.situations.find((s) => s.id === 'oneul'); for (const c of last.choices) assert.ok(c.then?.some((a) => a.end), `oneul 선택 ${c.id} 에 끝 카드 없음`);
assert.ok(life.situations.find((s) => s.id === 'gongbu').onOpen?.[0]?.show?.mats?.[0] === 'barbed', '휴전 뒤 철조망');
assert.ok(life.situations.find((s) => s.id === 'sanupwha').onOpen?.some((a) => a.show?.mats?.[0] === 'slate_blue') && life.situations.find((s) => s.id === 'sanupwha').onOpen?.some((a) => a.show?.mats?.[0] === 'bridge_new'), '산업화 때 슬레이트·다리');
assert.ok(life.situations.find((s) => s.id === 'apt').onOpen?.[0]?.show?.mats?.[0] === 'apt_concrete', '아파트 상황 때 아파트');
const ids = new Set(life.status.rules.map((r) => r.id));
for (const b of last.choices[0].then[0].end.branches) for (const f of (b.if || '').match(/status:(\w+)/g) || []) assert.ok(ids.has(f.slice(7)), `끝 갈림 ${b.id} 의 ${f} 없음`);
assert.equal(last.choices[0].then[0].end.branches.length, 48, '끝 갈림 48(농지 개혁 깊이기 +7)');
assert.ok(life.grain?.open && life.rank?.open && life.carry?.from === 'gaehang-life', '쌀 + 자리 + 개항에서 넘겨받음');
const st = life.status.rules; assert.ok(ids.size === 13 && st.every((r) => r.cap === 6), '직업 카드 13 — 천장 없음, 누구나 6');
assert.ok(st.findIndex((r) => r.id === 'hoesawon') < st.findIndex((r) => r.id === 'jiju') && st.at(-1).id === 'nongmin', '삶 중간 카드가 앞, 농사짓는 집이 기본');
assert.ok(st.some((r) => r.id === 'doraon' && r.if === 'fromstatus:ijumin') && st.some((r) => r.id === 'sojak' && r.if === 'fromstatus:yetnobi') && st.some((r) => r.id === 'jiju' && r.if === 'fromstatus:chinil') && st.some((r) => r.id === 'dongnip' && r.if === 'fromstatus:dongnip'), '이주민→돌아오는 집 / 옛 노비→소작 / 협력→땅 가진 집 / 독립운동가');
assert.ok(life.hurts?.wound && life.hurts?.leg && life.hurts?.jail && world.danger?.safe?.length === 12, '흔적 셋 + 밤 안전 자리 12');
assert.ok(world.hideHunger && world.hunger.perSecond === 0, '배고픔 없음');
assert.ok(world.gate?.next === 'life' && world.gate.ready && world.gate.last, '문 → 구석기 처음부터(열림, 마지막 시대)');
const prev = JSON.parse(fs.readFileSync(new URL('../eras/gaehang-life/world.json', import.meta.url))); assert.ok(prev.gate?.next === 'daehan-life' && prev.gate.ready, '개항 끝 카드 → 대한민국 문(열림)');
// 평가 문구 0 — 거리 상황 본문·선택·끝 갈림에 「옳」「잘못」「정의」가 없다
const geori = life.situations.find((s) => s.id === 'geori'); const gtxt = JSON.stringify(geori) + JSON.stringify(last.choices[0].then[0].end.branches.filter((b) => /^(street|home|door)/.test(b.id)));
for (const w of ['옳았', '잘못', '정의', '영웅', '폭도']) assert.ok(!gtxt.includes(w), `거리 상황에 평가 문구 「${w}」`);
console.log(`daehan-life: ix ${ix.length} · areas ${areas.length} · npc ${npcs.length} · 상황 ${life.situations.length} · 직업 ${ids.size} · 끝 갈림 ${last.choices[0].then[0].end.branches.length} · glb ${(buffer.length / 1048576).toFixed(1)}MB · 노드 ${names.length}`);
