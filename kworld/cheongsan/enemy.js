/* 청산리 — 엿새 · 적과 병사 무리(설계 v2 ③ · ⑨ enemy.js)
   병사는 한 번에 그린다(인스턴스 — 안시성 방식). 적은 맞으면 「쓰러지면서 사라진다」: 앞으로 숙여 눕듯 기울며 작아져 없어진다. 피·남는 몸 없음.
   줄(column) = 길(꺾은선) 위를 걷는 사람들. 머리(앞머리)의 길 위 거리 s 에서 뒤로 gap 씩, 옆으로 files 줄.
   지도 위 다섯 갈래(branches)는 장마다 같은 자리에서 조여 온다 — 포위망 띠가 오를수록 우리 쪽으로. 살핀 갈래만 뚜렷하게(작은 지도). */
import * as THREE from 'three';
import { clamp, lerp, dist, ART, artGeo, artMat, canvasTex } from '../scene/kit.js';
import { Hq, groundRing } from './map.js';

const _d = new THREE.Object3D();
/* 블렌더 모델이 없을 때 쓰는 네모 사람(색 하나) */
function boxMan(col, prone) { const g = prone ? new THREE.BoxGeometry(0.55, 0.42, 1.8) : new THREE.BoxGeometry(0.6, 1.7, 0.4); g.translate(0, prone ? 0.21 : 0.85, 0); const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }

/* ───── 무리(한 가지 모양을 여럿) ───── */
export function crowd(scene, name, max, { tints = {}, fallback = 0x8a7f55, prone = false, shadow = true } = {}) {
  const g = artGeo(name, tints) || boxMan(fallback, prone), m = new THREE.InstancedMesh(g, artMat, max); m.count = 0; m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true; scene.add(m);
  const units = [];
  function add(o) { const u = Object.assign({ x: 0, y: null, z: 0, ry: 0, pitch: 0, roll: 0, s: 1, bob: 0, on: true }, o); units.push(u); return u; }
  function flush() { let k = 0; for (const u of units) { if (!u.on || k >= max) continue; const y = u.y == null ? Hq(u.x, u.z) : u.y; _d.position.set(u.x, y + u.bob, u.z); _d.rotation.set(u.pitch, u.ry, u.roll, 'YXZ'); _d.scale.setScalar(Math.max(0.001, u.s)); _d.updateMatrix(); m.setMatrixAt(k++, _d.matrix); } m.count = k; m.instanceMatrix.needsUpdate = true; }
  function clear() { units.length = 0; m.count = 0; }
  return { m, units, add, flush, clear };
}

/* ───── 길(꺾은선) ───── */
export function path(pts) { const segs = []; let L = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, s0: L }); L += l; } return { pts, segs, L,
  at(s) { s = clamp(s, 0, L); let sg = segs[segs.length - 1]; for (const q of segs) if (s <= q.s0 + q.l) { sg = q; break; } const t = sg.l ? (s - sg.s0) / sg.l : 0; return [lerp(sg.a[0], sg.b[0], t), lerp(sg.a[1], sg.b[1], t), Math.atan2(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1])]; },
  sOfX(x) { /* 길이 동서로 흐를 때: x 에 닿는 길 위 거리 */ for (const q of segs) { const xa = q.a[0], xb = q.b[0]; if ((x - xa) * (x - xb) <= 0 && xa !== xb) return q.s0 + q.l * (x - xa) / (xb - xa); } return x < pts[pts.length - 1][0] ? L : 0; } }; }

/* ───── 군대 ───── */
export function makeArmy(scene) {
  const jp = crowd(scene, 'cs_jp', 320, { fallback: 0x8a7f55 });
  const off = crowd(scene, 'cs_jp_off', 6, { fallback: 0x6a4a30 });
  const IA_T = [{ shirt: 0x4a4f58, pants: 0x5a5448 }, { shirt: 0x6a5a44, pants: 0x4a4a4e }, { shirt: 0x3e4a5a, pants: 0x6a604c }];
  const iaS = IA_T.map((t) => crowd(scene, 'cs_ia', 90, { tints: t, fallback: 0x4a4f58 }));
  const iaP = IA_T.map((t) => crowd(scene, 'cs_ia_prone', 60, { tints: t, fallback: 0x4a4f58, prone: true }));
  const iaK = IA_T.map((t) => crowd(scene, 'cs_ia_kneel', 40, { tints: t, fallback: 0x4a4f58 }));
  const columns = [];
  /* 줄: n 명, 길 p, 머리가 s0 에서 시작(음수면 아직 길 밖 — 안 보임) */
  function column({ n, p, files = 3, gap = 3.5, speed = 1.6, s0 = 0, name = '추격대', officer = true, seed = 1 }) {
    let r = seed; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const c = { n, p, files, gap, speed, s: s0, name, dir: 1, halt: 0, men: [], off: null, seen: false, seenT: 0, gone: false, look: 0 };
    for (let i = 0; i < n; i++) { const rank = Math.floor(i / files), file = i % files; c.men.push({ rank, file, back: rank * gap + rnd() * 0.8, lat: (file - (files - 1) / 2) * 1.35 + (rnd() - 0.5) * 0.35, st: 'walk', t: 0, ph: rnd() * 6.28, u: jp.add({ on: false }), arc: 0, fx: 0, fz: 0 }); }
    if (officer) c.off = { back: Math.floor(n / files / 2) * gap + 1.7, u: off.add({ on: false }), st: 'walk', t: 0 };
    columns.push(c); return c;
  }
  const tailBack = (c) => c.men.reduce((a, m) => Math.max(a, m.back), 0);
  function manPos(c, m) { const arc = m.st === 'flee' ? m.arc : c.s - m.back; const [x, z, a] = c.p.at(arc); const lx = Math.cos(a), lz = -Math.sin(a); return [x + lx * m.lat, z + lz * m.lat, a, arc]; }
  function fall(m) { if (m.st === 'walk' || m.st === 'flee' || m.st === 'stand') { m.st = 'fall'; m.t = 0; } }
  function flee(c, m) { if (m.st !== 'walk' && m.st !== 'stand') return; const [, , , arc] = manPos(c, m); m.st = 'flee'; m.arc = arc; m.t = 0; }
  function update(dt, t) {
    for (const c of columns) { if (c.gone) continue;
      if (c.halt > 0) c.halt -= dt; else c.s += c.speed * c.dir * dt;
      let anyOn = false; const moving = c.halt <= 0;
      for (const m of c.men) { const u = m.u; if (m.st === 'gone') { u.on = false; continue; }
        if (m.st === 'flee') { m.arc -= 3.8 * dt; if (m.arc < 0) { m.st = 'gone'; u.on = false; continue; } }
        const [x, z, a, arc] = manPos(c, m); if (arc <= 0.01 || arc >= c.p.L - 0.01) { if (m.st !== 'fall') { u.on = false; continue; } }
        anyOn = true; u.on = true; u.x = x; u.z = z; u.ry = (m.st === 'flee' ? a + Math.PI : c.dir < 0 ? a + Math.PI : a);
        const walk = m.st === 'flee' || (m.st === 'walk' && moving); u.bob = walk ? Math.abs(Math.sin(t * (m.st === 'flee' ? 11 : 7) + m.ph)) * 0.09 : 0; u.roll = walk ? Math.sin(t * 7 + m.ph) * 0.05 : 0;
        if (m.st === 'walk' && !moving) u.ry += Math.sin(t * 0.7 + m.ph) * 0.5 * c.look;   /* 멈칫: 두리번 */
        if (m.st === 'fall') { m.t += dt; const k = clamp(m.t / 0.45, 0, 1), k2 = clamp((m.t - 0.45) / 0.55, 0, 1); u.pitch = k * 1.35; u.s = 1 - k2; u.bob = -k2 * 0.3; if (m.t > 1.0) { m.st = 'gone'; u.on = false; } } else { u.pitch = 0; u.s = 1; } }
      if (c.off) { const o = c.off, u = o.u; if (o.st === 'gone') u.on = false; else { const [x, z, a] = c.p.at(o.st === 'flee' ? o.arc : c.s - o.back); if (o.st === 'flee') { o.arc -= 4.5 * dt; if (o.arc < 0) { o.st = 'gone'; u.on = false; } }
        const arc = o.st === 'flee' ? o.arc : c.s - o.back; u.on = o.st !== 'gone' && arc > 0.01 && arc < c.p.L - 0.01; u.x = x; u.z = z; u.ry = o.st === 'flee' || c.dir < 0 ? a + Math.PI : a; u.bob = moving || o.st === 'flee' ? Math.abs(Math.sin(t * 5)) * 0.06 : 0; if (u.on) anyOn = true; } }
      if (!anyOn && c.s > tailBack(c) + 2 && c.men.every((m) => m.st === 'gone' || m.st === 'flee' || c.s - m.back >= c.p.L || c.s - m.back <= 0) && (c.dir < 0 || c.s - tailBack(c) >= c.p.L)) c.gone = true;
    }
    jp.flush(); off.flush(); for (const k of [...iaS, ...iaP, ...iaK]) k.flush();
  }
  /* 살아 있는(쓰러지지 않은) 사람 수 · 어느 x 보다 서쪽에 든 사람 수 */
  const alive = (c) => c.men.filter((m) => m.st === 'walk' || m.st === 'stand').length;
  const insideWest = (c, x) => c.men.filter((m) => (m.st === 'walk' || m.st === 'stand') && manPos(c, m)[0] < x).length;
  const headX = (c) => c.p.at(c.s)[0], tailX = (c) => c.p.at(c.s - tailBack(c))[0];
  const center = (c) => { const ms = c.men.filter((m) => m.st === 'walk' || m.st === 'stand'); if (!ms.length) return null; let sx = 0, sz = 0; for (const m of ms) { const p = manPos(c, m); sx += p[0]; sz += p[1]; } return [sx / ms.length, sz / ms.length]; };
  function reset() { columns.length = 0; jp.clear(); off.clear(); for (const k of [...iaS, ...iaP, ...iaK]) k.clear(); }
  return { jp, off, iaS, iaP, iaK, columns, column, update, fall, flee, alive, insideWest, headX, tailX, center, manPos, tailBack, reset };
}

/* ───── 총구 불빛 · 연기 · 산포 고리 ───── */
export function makeFx(scene, cam) {
  const flashTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,245,200,1)'); r.addColorStop(0.35, 'rgba(255,190,80,.8)'); r.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const puffTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(235,232,225,.85)'); r.addColorStop(0.6, 'rgba(210,206,198,.45)'); r.addColorStop(1, 'rgba(200,196,188,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const flashes = [], puffs = [], shells = [];
  for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); flashes.push({ s, t: 0 }); }
  for (let i = 0; i < 90; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, color: 0xffffff })); s.visible = false; scene.add(s); puffs.push({ s, t: 0, life: 1, vy: 1, g: 1 }); }
  let fi = 0, pi = 0;
  function flash(x, y, z, size = 1.4) { const f = flashes[fi++ % flashes.length]; f.s.position.set(x, y, z); f.s.scale.set(size, size, 1); f.s.visible = true; f.t = 0.07 + Math.random() * 0.05; }
  function puff(x, y, z, { size = 1.6, life = 1.6, vy = 0.8, grow = 2.2, col = 0xffffff, op = 0.75 } = {}) { const p = puffs[pi++ % puffs.length]; p.s.position.set(x, y, z); p.s.material.color.set(col); p.s.material.opacity = op; p.op = op; p.s.visible = true; p.t = 0; p.life = life; p.vy = vy; p.g = grow; p.sz = size; p.s.scale.set(size, size, 1); }
  /* 산포: 붉은 고리가 땅에 뜨고 delay 초 뒤 떨어진다 → onLand(x, z) */
  function shell(x, z, delay, onLand, r = 3.2) { const ring = groundRing(scene, x, z, r - 0.35, r, 0xe0402a, 0.9), fill = groundRing(scene, x, z, 0.01, r - 0.35, 0xe0402a, 0.18); shells.push({ x, z, t: 0, delay, ring, fill, onLand, r }); }
  let shake = 0;
  function update(dt) {
    for (const f of flashes) if (f.s.visible) { f.t -= dt; if (f.t <= 0) f.s.visible = false; }
    for (const p of puffs) if (p.s.visible) { p.t += dt; const k = p.t / p.life; if (k >= 1) { p.s.visible = false; continue; } p.s.position.y += p.vy * dt; const s = p.sz * (1 + k * p.g); p.s.scale.set(s, s, 1); p.s.material.opacity = p.op * (1 - k); }
    for (let i = shells.length - 1; i >= 0; i--) { const s = shells[i]; s.t += dt; const k = s.t / s.delay, pulse = 0.5 + 0.5 * Math.sin(s.t * (6 + k * 14)); s.ring.material.opacity = 0.5 + 0.45 * pulse; s.fill.material.opacity = 0.1 + 0.2 * k;
      if (s.t >= s.delay) { scene.remove(s.ring, s.fill); s.ring.geometry.dispose(); s.fill.geometry.dispose(); shells.splice(i, 1); const y = Hq(s.x, s.z); for (let k2 = 0; k2 < 7; k2++) puff(s.x + (Math.random() - 0.5) * 3, y + 0.5 + Math.random(), s.z + (Math.random() - 0.5) * 3, { size: 2.4, life: 2.4, vy: 1.6, grow: 2.6, col: 0x9a8a70, op: 0.8 }); flash(s.x, y + 1, s.z, 5); if (s.onLand) s.onLand(s.x, s.z); } }
    shake = Math.max(0, shake - dt * 2.2);
  }
  return { flash, puff, shell, shells, update, get shake() { return shake; }, set shake(v) { shake = Math.max(shake, v); } };
}

/* ───── 연기 기둥(적이 피운 불 — 멀리서도 보인다) ───── */
export function smokeColumn(scene, x, z, { h = 70, col = 0x5e5a54, n = 14, w = 6 } = {}) {
  const tex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(0.5, 'rgba(255,255,255,.6)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const y0 = Hq(x, z), sp = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: col, fog: false })); s.userData.k = i / n; scene.add(s); sp.push(s); }
  let t = 0, on = true;
  function update(dt) { t += dt; for (const s of sp) { s.visible = on; if (!on) continue; const k = (s.userData.k + t * 0.04) % 1; s.position.set(x + k * k * 18, y0 + 2 + k * h, z - k * 6); const sc = w * (0.6 + k * 2.4); s.scale.set(sc, sc, 1); s.material.opacity = 0.9 * (1 - k * 0.8) * Math.min(1, k * 8); } }
  return { x, z, y0, h, sp, update, set on(v) { on = v; }, get on() { return on; } };
}
