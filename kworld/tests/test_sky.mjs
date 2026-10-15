// 계절·날씨 하늘(10-13) — 팔레트 열 벌(흉년·먹구름·가을·겨울·새벽·연기), 풀 색·산 눈까지 한 벌로 바뀜, 눈 입자, 저장·재개. 열한 시대 사건의 sky 이름 전수.
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {} }), body: { appendChild() {} } };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { Story } = await import('../core/story.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
// ---- 데이터: 열한 시대 사건의 sky/snow ----
const eras = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const used = {}; let badName = []; let badSnow = [];
for (const era of eras) {
  const w = JSON.parse(fs.readFileSync(path.join(root, `eras/${era}/world.json`), 'utf8'));
  for (const ev of w.events || []) for (const a of ev.do || []) { if (a.sky) { (used[era] ??= new Set()).add(a.sky); if (!Story.SKIES.includes(a.sky)) badName.push(era + ':' + a.sky); } if ('snow' in a && typeof a.snow !== 'boolean') badSnow.push(era); }
}
ok(!badName.length, `사건 sky 이름이 전부 팔레트에 있다 ${badName.join(',')}`);
ok(!badSnow.length, 'snow 는 true/false');
const has = (e, n) => used[e]?.has(n);
ok(has('life', 'storm') && has('neo', 'storm'), '구석기·신석기: 큰비·홍수 앞에 먹구름(storm)이 먼저');
ok(has('bronze-life', 'drought') && has('samguk-life', 'drought') && has('silla-life', 'drought'), '청동기·삼국·통일신라: 흉년 아침은 가뭄 하늘(drought)');
ok(has('samguk-life', 'autumn'), '삼국: 「아침이면 가을」 — autumn');
ok(has('joseon-life', 'winter') && has('gaehang-life', 'winter') && has('daehan-life', 'winter'), '조선 전기(병자호란)·개항(1919 2월)·대한민국(1997 겨울): winter');
ok(['gojoseon-life', 'samguk-life', 'goryeo-life', 'joseon-life', 'daehan-life'].every((e) => has(e, 'smoke')), '전쟁 다섯 시대: 연기 하늘(smoke)');
ok(Object.values(used).filter((s) => s.has('dawn')).length >= 5, '「아침.」 말 앞은 새벽(dawn) → 낮 (다섯 시대 이상)');
for (const era of eras) { const w = JSON.parse(fs.readFileSync(path.join(root, `eras/${era}/world.json`), 'utf8')); let snowOn = false, lastNonSnow = null; for (const ev of w.events || []) for (const a of ev.do || []) { if (a.sky) lastNonSnow = a.sky; if ('snow' in a) snowOn = a.snow; } if (snowOn && !['winter', 'night'].includes(lastNonSnow)) ok(false, `${era}: 눈이 온 채 끝나는데 하늘이 ${lastNonSnow}`); }
ok(true, '눈은 겨울·밤 하늘에서만 내린 채 남는다');
// ---- 엔진: 팔레트 → 햇빛·안개·하늘돔·풀·산 눈이 함께 바뀐다 ----
const U = (c) => ({ value: new THREE.Color(c) });
const grass = { name: 'meadow-grass', material: { uniforms: { uBase: U(0x4a7a3a), uTip: U(0x8ab85a) } } };
const mount = { name: 'far-mountains', children: [0, 1, 2].map(() => ({ material: { uniforms: { uSnow: { value: 0 } } } })) };
const hemi = { isHemisphereLight: true, intensity: 0.6 };
const leaf = { isMesh: true, material: { name: 'leaf', color: new THREE.Color(0x3f7a2e) } }, pine = { isMesh: true, material: { name: 'pine', color: new THREE.Color(0x2f5a2a) } }, photoTree = { isMesh: true, material: { name: 'bush', color: new THREE.Color(0xffffff) } };
const added = [];
const e = { interactables: new Map(), areas: new Map(), onFrame: [], groundY: () => 0, spawn: new THREE.Vector3(), sun: { intensity: 2.35, color: new THREE.Color(0xffd9a0) }, renderer: { toneMappingExposure: 1.02 },
  scene: { children: [hemi, grass, mount, leaf, pine, photoTree], add: (o) => added.push(o), remove() {}, traverse(f) { for (const o of [hemi, grass, mount, leaf, pine, photoTree]) f(o); }, fog: { color: new THREE.Color(0xdfe3d6), near: 38, far: 150 } },
  skyDome: { material: { uniforms: { uZenith: U(0x427da8), uHorizon: U(0xd9e1de), uHaze: U(0xe5dfca), uSunColor: U(0xffd9a0), uCloud: { value: 0.5 } } } } };
const winds = []; const g = { e, p: { pos: new THREE.Vector3(0, 0, 0), enabled: true }, flags: new Set(), world: {}, ui: { say() {}, setGoal() {} }, cond: () => false, sound: { set: (k, v) => winds.push([k, v]), play() {} } };
const st = new Story(g, {}); st.apply();
const run = (sec) => { for (let i = 0; i < 40; i++) st.tick(sec / 40); };
st.transition('drought', 1); run(1.2);
ok(e.sun.intensity > 2.6 && e.sun.color.getHex() === 0xfff0cc, `흉년: 해가 세고 하얗게 (${e.sun.intensity.toFixed(2)})`);
ok(grass.material.uniforms.uBase.value.getHex() === 0xa38e4a && grass.material.uniforms.uTip.value.getHex() === 0xd1bb6c, '흉년: 풀이 누렇게');
ok(e.skyDome.material.uniforms.uCloud.value < 0.15, '흉년: 구름 거의 없음');
ok(winds.some(([k, v]) => k === 'wind' && v === 0.4), '흉년 바람 0.4');
st.transition('winter', 1); run(1.2);
ok(Math.abs(mount.children[0].material.uniforms.uSnow.value - 1) < 0.01 && mount.children.every((m) => m.material.uniforms.uSnow.value > 0.99), '겨울: 원경 산 셋 전부 눈');
ok(e.sun.color.getHex() === 0xe8efff && e.scene.fog.near === 18, '겨울: 차가운 햇빛·옅은 안개');
{ const c = leaf.material.color; ok(c.r > c.g && c.g > c.b && c.getHex() !== 0x3f7a2e, `겨울: 잎이 갈색으로 (${c.getHexString()})`); ok(pine.material.color.getHex() === 0x2f5a2a, '겨울: 소나무는 그대로'); ok(photoTree.material.color.getHex() !== 0xffffff && photoTree.material.color.r > photoTree.material.color.b, '겨울: 사진 질감 나무도 바랜다(color 곱)'); }
st.transition('night', 1); run(1.2);
ok(Math.abs(mount.children[0].material.uniforms.uSnow.value - 1) < 0.01 && st.isNight, '밤: 산 눈은 그대로, isNight');
ok(leaf.material.color.r > leaf.material.color.b, '밤: 잎 색 그대로(갈색)');
st.transition('day', 1); run(1.2);
ok(mount.children[0].material.uniforms.uSnow.value < 0.01, '낮으로 돌아오면 눈 사라짐(낮 값 0)');
ok(leaf.material.color.getHex() === 0x3f7a2e && photoTree.material.color.getHex() === 0xffffff, '낮: 잎이 원래 초록으로 돌아온다');
st.transition('autumn', 1); run(1.2); ok(leaf.material.color.r > leaf.material.color.g && leaf.material.color.getHex() !== 0x3f7a2e, '가을: 잎이 주황으로'); st.transition('day', 1); run(1.2);
ok(Math.abs(grass.material.uniforms.uBase.value.r - new THREE.Color(0x4a7a3a).r) < 0.01, '낮: 풀 색 원래대로');
ok(e.sun.intensity > 2.3 && !st.isNight, '낮: 해 원래대로');
// ---- 눈 입자 ----
st.snow(true); run(0.5);
ok(st.rainPts && st.rainPts.visible && st.snowOn && !st.rainOn && st.rainPts.material.size > 0.1, '눈: 비 점이 희고 굵게, rainOn 아님');
ok(winds.at(-1)[0] === 'rain' && winds.at(-1)[1] === 0, '눈은 빗소리 없음');
const y0 = st.rainPts.geometry.attributes.position.array[1]; run(1); const y1 = st.rainPts.geometry.attributes.position.array[1];
ok(y1 < y0 && y0 - y1 < 6, `눈은 천천히 내린다 (${(y0 - y1).toFixed(2)}/초)`);
st.snow(false); ok(!st.rainPts.visible && !st.snowOn && st.rainPts.material.size < 0.1, '눈 그침 → 점 숨김·비 크기로');
st.rain(true); ok(st.rainOn && !st.snowOn && st.rainPts.material.color.getHex() === 0xbfd0e6, '비는 푸르스름한 점');
// ---- 저장·재개 ----
st.transition('drought', 0.5); run(0.6); st.rain(false);
ok(JSON.stringify(st.skyState()) === JSON.stringify({ n: 'drought', rain: false, snow: false }), '저장 한 줄: drought');
st.transition('day', 0.5); run(0.6); ok(st.skyState() === null, '낮·맑음이면 null(안 적음)');
st.transition('winter', 0.5); st.snow(true); run(0.6); ok(JSON.stringify(st.skyState()) === JSON.stringify({ n: 'winter', rain: false, snow: true }), '겨울+눈');
const st2 = new Story(g, {}); st2.apply(); st2.setSky({ n: 'winter', snow: true }); for (let i = 0; i < 40; i++) st2.tick(0.02);
ok(st2.skyName === 'winter' && st2.snowOn && mount.children[0].material.uniforms.uSnow.value > 0.99, '재개: setSky 로 겨울·눈 되짚음');
st2.setSky({ n: 'rainy', rain: true }); ok(st2.rainOn && !st2.snowOn, '재개: 비');
st.transition('nothing_known', 1); ok(st.skyName === 'winter', '모르는 이름은 조용히(하늘 그대로)');
// ---- 사건 doActions 가 snow 를 읽는다 / life 스냅샷·save 복원에 sky ----
st.fast = true; await st.doActions([{ sky: 'winter', sec: 0.1 }, { snow: true }, { snow: false }, { sky: 'day', sec: 0.1 }]);
ok(!st.snowOn && st.skyName === 'day', '사건 snow:true/false 동작');
const life = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'), save = fs.readFileSync(path.join(root, 'core/save.js'), 'utf8');
ok(life.includes('sky: this.g.story?.skyState?.()') && save.includes('snap.life?.sky') && save.includes('setSky'), 'life.snapshot 에 sky · save.restore 가 setSky');
// ---- 겨울 상황(10-16): 구석기 찬바람·신석기 벼랑 동굴 겨울 — 상황이 열리면 겨울 하늘+눈(낮일 때만 하늘), 고르면 눈 그침 ----
for (const [era, sid] of [['life', 'coldwind'], ['neo', 'cavewinter']]) {
  const L = JSON.parse(fs.readFileSync(path.join(root, `eras/${era}/life.json`), 'utf8')); const sit = L.situations.find((x) => x.id === sid);
  const sky = (sit.onOpen || []).find((a) => a.sky), sn = (sit.onOpen || []).find((a) => a.snow === true);
  ok(sky && sky.sky === 'winter' && sky.ifDay === true && sn, `${era}/${sid}: onOpen = winter(ifDay)+눈`);
  ok(sit.choices.every((c) => (c.then || []).some((a) => a.snow === false)), `${era}/${sid}: 모든 선택 뒤 눈 그침`);
}
st.transition('night', 0.1); run(0.2); await st.doActions([{ sky: 'winter', sec: 0.1, ifDay: true }, { snow: true }]);
ok(st.skyName === 'night' && st.isNight && st.snowOn, 'ifDay: 밤에는 하늘 그대로, 눈만');
await st.doActions([{ snow: false }, { sky: 'day', sec: 0.1 }]); await st.doActions([{ sky: 'winter', sec: 0.1, ifDay: true }]);
ok(st.skyName === 'winter', 'ifDay: 낮이면 겨울로');
console.log(`sky ${pass}/${fail}`); if (fail) process.exit(1);
