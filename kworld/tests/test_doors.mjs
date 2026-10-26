// 신분의 문(130) — 데이터 열한 시대 전수 + 엔진(조선 전기): 노비가 안채 앞에서 밀려남·한마디·📜·깃발 / 양반은 통과 / 열린 상황·미션·쫓김·unless 면 통과 / 집 한 줄·집 바뀜·그 뒤 한 줄
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.performance ??= { now: () => Date.now() };
const { Doors } = await import('../core/doors.js');
const { Life } = await import('../core/life.js');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const read = (era, f) => JSON.parse(fs.readFileSync(path.join(root, 'eras', era, f), 'utf8'));
// ---- 데이터 ----
let doorsTotal = 0;
for (const era of ERAS) {
  const w = read(era, 'world.json'), l = w.life ? read(era, w.life) : {}; const d = w.doors; const sts = new Set((l.status?.rules || []).map((r) => r.id)); const sitIds = new Set((l.situations || []).map((s) => s.id));
  let good = !!d && Array.isArray(d.list) && d.homes && typeof d.homes === 'object'; const why = [];
  for (const x of d?.list || []) {
    doorsTotal++;
    if (!w.areas[x.area]) why.push(`${x.id} 구역 ${x.area} 없음`); if (!(x.r <= 7)) why.push(`${x.id} r ${x.r}`); if (!x.say || x.say.length > 60) why.push(`${x.id} say`); if (!x.fact) why.push(`${x.id} fact 없음`);
    if (/\d{3,4}년|\b1\d{3}\b/.test(x.fact || '')) why.push(`${x.id} fact 연도`);
    for (const t of (x.if + ' ' + (x.unless || '')).matchAll(/status:(\w+)/g)) if (!sts.has(t[1])) why.push(`${x.id} 신분 ${t[1]} 없음`);
    for (const t of (x.unless || '').matchAll(/sit:(\w+):open/g)) if (!sitIds.has(t[1])) why.push(`${x.id} 상황 ${t[1]} 없음`);
    const must = (l.situations || []).filter((s) => s.must && s.place === x.area); for (const s of must) if ((s.radius || 11) <= x.r) why.push(`${x.id} 꼭 상황 ${s.id} 가 문 안에서 열림`);
  }
  for (const [k, h] of Object.entries(d?.homes || {})) { if (k !== 'default' && !sts.has(k)) why.push(`집 신분 ${k} 없음`); if (!w.areas[h.area]) why.push(`집 구역 ${h.area} 없음`); if (!h.say) why.push(`집 ${k} say 없음`); }
  for (const st of sts) if (!d?.homes?.[st]) why.push(`신분 ${st} 집 없음`);
  if (!sts.size && !d?.homes?.default) why.push('신분 없는 시대엔 default 집');
  ok(good && !why.length, `${era}: 문 ${d?.list?.length ?? '-'}·집 ${Object.keys(d?.homes || {}).length}${why.length ? ' — ' + why.join(' / ') : ''}`);
}
ok(doorsTotal >= 20, `열한 시대 문 ${doorsTotal}개(≥20)`);
// ---- 엔진(조선 전기) ----
const w = read('joseon-life', 'world.json');
const e = { areas: new Map([['anchae', new THREE.Vector3(1, 0, -38)], ['outroad', new THREE.Vector3(0, 0, 58)], ['sarang', new THREE.Vector3(-7, 0, -27)], ['haengrang', new THREE.Vector3(-10, 0, -24)], ['hyanggyo', new THREE.Vector3(-42, 0, 49)]]), groundY: () => 0 };
const said = [], flags = new Set();
const fakeLife = { g: null, status: 'sangmin', values: {}, hurt: new Set(), opened: new Set(), done: new Set(), situations: w.life ? read('joseon-life', w.life).situations : [], rv: null, render() { this.rendered = (this.rendered || 0) + 1; } };
fakeLife.cond = Life.prototype.cond; fakeLife.one = Life.prototype.one; fakeLife.valCond = Life.prototype.valCond;
const g = { era: 'joseon-life', e, p: { pos: new THREE.Vector3(1, 1.6, -36), eye: 1.6, enabled: true }, flags, world: w, ui: { say: (t) => said.push(t), isOpen: () => false }, sound: { played: [], play(n) { this.played.push(n); } }, life: fakeLife, restoring: false, missions: { missions: [{ area: 'gwana' }] }, mi: 0, pulse: { chase: null } };
fakeLife.g = g; g.cond = (x) => fakeLife.cond(x); g.flag = (f) => flags.add(f);
flags.add('status:sangmin');
const ds = new Doors(g, w.doors); const run = (sec, step = 0.1) => { for (let t = 0; t < sec; t += step) ds.tick(step); };
// 1) 상민 — 안채 앞 2m 안 → r 6 밖으로 밀려남(솔거 노비는 안채 일을 하니 막지 않는다) + 청지기 한마디 + 깃발 + locked 소리
run(0.2); const dist = () => Math.hypot(g.p.pos.x - 1, g.p.pos.z + 38);
ok(dist() >= 6 && dist() < 6.6 && Math.abs(g.p.pos.y - 1.6) < 1e-6, `상민은 안채 앞 6m 밖으로 밀려난다 (${dist().toFixed(2)}m, 눈높이 그대로)`);
ok(said.some((s) => s.includes('🚪 청지기') && s.includes('안채는 안식구 자리')) && flags.has('door:anchae:blocked') && g.sound.played.includes('locked'), '「🚪 청지기 — 안채는 안식구 자리…」 + door:anchae:blocked + locked 소리');
ok(said.filter((s) => s.includes('🚪')).length === 1, '한마디는 한 번(6.5초 안엔 다시 안 함)');
await new Promise((r) => setTimeout(r, 4600)); ok(said.some((s) => s.startsWith('📜') && s.includes('사랑채와 안채')), '4.4초 뒤 📜 한 줄(처음 한 번)');
// 2) 다시 들어가도 밀려나지만 한마디는 쿨다운
g.p.pos.set(1, 1.6, -36); said.length = 0; run(0.2); ok(dist() >= 6 && !said.length, '다시 들어가면 밀려나되 6.5초 안엔 말 없음');
// 3) 가운데 바로 위(0.05m 안)여도 밀려남
g.p.pos.set(1, 1.6, -38); run(0.1); ok(dist() >= 6, '중심 바로 위에서도 밀려남');
// 4) 양반은 통과
fakeLife.status = 'yangban'; flags.delete('status:sangmin'); flags.add('status:yangban'); g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() < 3, '양반은 안채 앞에 선다');
// 5) 상민도 그 자리 상황이 열려 있으면(widow) 통과 · 미션 자리면 통과 · 쫓기는 중이면 통과 · 카드 열림이면 손 안 댐
fakeLife.status = 'sangmin'; flags.delete('status:yangban'); flags.add('status:sangmin');
fakeLife.opened.add('widow'); g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() < 3, '안채 상황(widow)이 열려 있으면 통과'); fakeLife.opened.clear();
g.missions.missions[0].area = 'anchae'; g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() < 3, '지금 미션 자리면 통과'); g.missions.missions[0].area = 'gwana';
g.pulse.chase = {}; g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() < 3, '쫓기는 중이면 문이 없다'); g.pulse.chase = null;
g.ui.isOpen = () => true; g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() < 3, '카드 열린 동안은 손 안 댐'); g.ui.isOpen = () => false;
g.p.pos.set(1, 1.6, -36); run(0.2); ok(dist() >= 6, '다시 닫히면 막힘');
// 6) 마을 밖 길 — 솔거 노비는 막히고(상민은 아님), 도망 상황이 열리면(unless sit:escape:open) 통과
g.p.pos.set(0, 1.6, 57); said.length = 0; run(0.2); ok(Math.hypot(g.p.pos.x, g.p.pos.z - 58) < 3, '상민은 마을 밖 길이 열려 있다');
fakeLife.status = 'solgeo'; flags.delete('status:sangmin'); flags.add('status:solgeo'); g.p.pos.set(0, 1.6, 57); said.length = 0; run(0.2); ok(Math.hypot(g.p.pos.x, g.p.pos.z - 58) >= 5 && said.some((s) => s.includes('주인 허락 없이')), '솔거 노비는 마을 밖 길이 막힌다 + 「주인 허락 없이…」');
flags.add('sit:escape:open'); g.p.pos.set(0, 1.6, 57); run(0.2); ok(Math.hypot(g.p.pos.x, g.p.pos.z - 58) < 3, '도망 상황이 열리면(unless) 길이 열린다'); flags.delete('sit:escape:open');
// 7) 집 — 솔거의 집은 행랑채(안채 문에 막히지 않음) · 들어서면 「🏠 내 집」 한 번 + home:solgeo · HUD 이름 · 미니맵 자리
ds.curHome = null; ds.homeTick(); ok(ds.homeName() === '행랑채' && ds.homeArea()?.x === -10, '솔거 노비의 집 = 행랑채(homeName·homeArea)');
g.p.pos.set(-10, 1.6, -22); said.length = 0; run(1.2); ok(said.filter((s) => s.includes('🏠 내 집 — 행랑채')).length === 1 && flags.has('home:solgeo'), '집에 들어서면 「🏠 내 집 — 행랑채. …」 한 번 + home:solgeo');
run(1.2); ok(said.filter((s) => s.includes('🏠 내 집')).length === 1, '두 번째는 말 없음');
// 8) 삶 중간에 신분이 바뀌면 「🏠 집이 바뀌었다」(면천 → 상민 → 초가 마을) + render
fakeLife.status = 'sangmin'; flags.delete('status:solgeo'); flags.add('status:sangmin'); said.length = 0; fakeLife.rendered = 0; run(0.6);
ok(said.some((s) => s.includes('🏠 집이 바뀌었다 — 초가 마을')) && fakeLife.rendered >= 1 && ds.homeName() === '초가 마을', '신분이 바뀌면 「🏠 집이 바뀌었다 — 초가 마을」 + HUD 다시 그림');
// 9) 「그 뒤」 한 줄 — 안채 앞·마을 밖 길에서 n번
const line = ds.doorLine(); ok(/막힌 문 — 안채 앞·마을 밖으로 나가는 길에서 \d+번 돌아섰다/.test(line) && line.endsWith('문은 신분이 정했다.'), `그 뒤 한 줄: ${line}`);
ok(new Doors({ ...g, life: null }, { list: [] }).doorLine() === '', '한 번도 안 막혔으면 빈 글');
// 10) 신분 없는 세계(구석기) — default 집
const g2 = { ...g, life: null, world: read('life', 'world.json'), e: { areas: new Map([['camp', new THREE.Vector3(0, 0, 20)]]), groundY: () => 0 }, flags: new Set(), p: { pos: new THREE.Vector3(0, 1.6, 20), eye: 1.6, enabled: true } }; const s2 = []; g2.ui = { say: (t) => s2.push(t), isOpen: () => false }; g2.flag = (f) => g2.flags.add(f); g2.cond = () => true;
const d2 = new Doors(g2, g2.world.doors); for (let t = 0; t < 1.2; t += 0.1) d2.tick(0.1);
ok(d2.list.length === 0 && d2.homeName() === '강가 막집' && s2.some((s) => s.includes('🏠 내 집 — 강가 막집')) && g2.flags.has('home:default'), '구석기: 문 0·집 = 강가 막집(default)');
// 11) 게임 연결 줄
const gameSrc = fs.readFileSync(path.join(root, 'core/game.js'), 'utf8'), lifeSrc = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'), mmSrc = fs.readFileSync(path.join(root, 'core/minimap.js'), 'utf8');
ok(gameSrc.includes("this.doors = new Doors(this, this.world.doors)") && gameSrc.includes('if (this.doors) this.doors.tick(dt);'), 'game.js — world.doors 로 켬 + tick');
ok(lifeSrc.includes('doors?.homeName?.()') && lifeSrc.includes('class="ear door"'), 'life.js — HUD 🏠 뒤 집 이름 + 그 뒤 카드 🚪 줄');
ok(mmSrc.includes('doors?.homeArea?.()'), 'minimap.js — 🏠 자리');
console.log(`\n신분의 문(130): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
