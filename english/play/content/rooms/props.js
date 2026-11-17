/* ============================================================
 * 영어 놀이터 — 빈터 물건 상자(rooms/props) (WA1 · 키트 core/diorama.js 위에)
 *   글자 숲 방 자료(content/rooms/glade-*.js)가 낱말의 물건을 지을 때 고르는 공용 부품. 방 파일은 「무엇을 · 어떤 색으로 · 어디에」만 적는다.
 *   부품 하나 = (K, o) → THREE.Group. g.userData:
 *     act(t)        누르면 움직이는 법(t 0→1 한 번)
 *     life(t, dt)   가만히 있을 때 살아 있는 몸짓(빛바랜 동안은 부르지 않는다)
 *     dy · r        눈이 따라갈 때 볼 높이 · 아래에 밝아지는 자리 크기
 *   동물: animal(고양이·강아지·여우·염소·코끼리 — 몸 · 귀 · 꼬리 · 코 모양을 o 로) · bird(오리·암탉) · fish · frog · bugs(무당벌레 무리) · lizard(이구아나)
 *   사람: 사람은 core/diorama-people.js(makePerson) — 방 파일이 PEOPLE 처럼 겉모습만 넘긴다(elf 는 뾰족 모자)
 *   물건: cup · toyCar · cake · desk · egg · leafFan · gum · board · hat · ham · igloo · ink · jam · paperJet · jug · springPad · logBus
 *   무대: teaTable · waterfall · hillRock · icicles · pond(작은 연못)
 *   색은 토큰 이름만(코드에 색 값 0).
 * ============================================================ */
const wave = (t, n = 1) => Math.sin(t * Math.PI * n);
function eyesOn(K, parent, x, y, z, gap, r = 0.07){ const { THREE, ball, M } = K, dark = M('ink', { roughness: 0.3 }), eyes = [];
  [-1, 1].forEach(s => { const e = new THREE.Group(); e.position.set(x, y, z + s * gap); e.add(ball(r, dark)); e.add(ball(r * 0.35, M('surface', { roughness: 0.1 }), r * 0.5, r * 0.4, s * r * 0.2)); parent.add(e); eyes.push(e); }); return eyes; }
const T = (K, n) => (typeof n === 'string' ? K.C(n) : Array.isArray(n) ? K.mix(n[0], n[1], n[2]) : n);

/* ── 네발 동물 — 몸이 x 쪽을 본다(머리 +x). o = { body, belly, ear:'tri'|'round'|'big'|'droop', tail:'up'|'bush'|'short'|'thin', nose:'snout'|'trunk', horn, bell, scale } ── */
export function animal(K, o){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const sk = M(T(K, o.body), { roughness: 0.75 }), bl = M(T(K, o.belly || o.body), { roughness: 0.8 }), s = o.scale || 1;
  const L = o.long || 1;
  b.add(ball(0.42, sk, 0, 0.62, 0, 1.25 * L, 0.9, 0.9)); b.add(ball(0.3, bl, 0.05, 0.5, 0, 1.0 * L, 0.6, 0.7));
  const legs = [[0.32, 0.26], [0.32, -0.26], [-0.32, 0.26], [-0.32, -0.26]].map(p => { const l = mesh(new THREE.CapsuleGeometry(0.09, 0.32, 4, 8), sk, p[0] * L, 0.24, p[1]); b.add(l); return l; });
  const head = new THREE.Group(); head.position.set(0.55 * L, 0.98, 0); b.add(head);
  head.add(ball(0.32, sk, 0, 0, 0, 1, 0.95, 1));
  if (o.nose === 'trunk') { const tr = new THREE.Group(); tr.position.set(0.28, -0.05, 0); head.add(tr); [0, 1, 2, 3].forEach(i => tr.add(ball(0.11 - i * 0.012, sk, 0.06 + i * 0.06, -0.08 - i * 0.12, 0))); g.userData.trunk = tr; }
  else head.add(ball(0.16, bl, 0.25, -0.08, 0, 1.1, 0.8, 1));
  head.add(ball(0.05, M('ink', { roughness: 0.3 }), 0.4, -0.02, 0));
  const ears = [-1, 1].map(sd => { let e;
    if (o.ear === 'big') { e = ball(0.3, M(T(K, o.inner || 'a-pink'), { roughness: 0.8 }), -0.05, 0.05, sd * 0.3, 0.35, 1, 0.9); }
    else if (o.ear === 'round') e = ball(0.11, sk, -0.05, 0.28, sd * 0.18);
    else if (o.ear === 'droop') { e = ball(0.14, sk, -0.05, 0.05, sd * 0.3, 0.6, 1.3, 0.5); e.rotation.x = sd * 0.4; }
    else { e = mesh(new THREE.ConeGeometry(0.11, 0.24, 4), sk, -0.02, 0.32, sd * 0.16); e.rotation.x = sd * 0.25; }
    head.add(e); return e; });
  if (o.horn) [-1, 1].forEach(sd => { const h = mesh(new THREE.ConeGeometry(0.05, 0.26, 6), M('a-cream', { roughness: 0.5 }), -0.1, 0.36, sd * 0.1); h.rotation.z = 0.5; head.add(h); });
  if (o.bell) { const bel = ball(0.08, M('a-gold', { metalness: 0.5, roughness: 0.3 }), 0.12, -0.32, 0); head.add(bel); g.userData.bell = bel; }
  eyesOn(K, head, 0.22, 0.1, 0, 0.13);
  const tail = new THREE.Group(); tail.position.set(-0.5 * L, 0.72, 0); b.add(tail);
  if (o.tail === 'bush') { const t1 = ball(0.18, sk, -0.25, 0.2, 0, 1.6, 0.8, 0.8); t1.rotation.z = 0.7; tail.add(t1); tail.add(ball(0.1, M('surface'), -0.48, 0.42, 0)); }
  else if (o.tail === 'short') tail.add(ball(0.09, sk, -0.05, 0.05, 0));
  else { const t1 = mesh(new THREE.CapsuleGeometry(0.04, 0.42, 4, 6), sk, -0.12, 0.2, 0); t1.rotation.z = o.tail === 'thin' ? 1.3 : 0.6; tail.add(t1); }
  g.scale.setScalar(s);
  g.userData = { body: b, head, tail, legs, ears, trunk: g.userData.trunk, bell: g.userData.bell, dy: 1.1 * s, r: 1.2 * s,
    act: t => { b.position.y = Math.abs(wave(t, 2)) * 0.35; head.rotation.z = wave(t, 2) * 0.25; tail.rotation.x = wave(t, 4) * 0.8; if (g.userData.trunk) g.userData.trunk.rotation.z = wave(t) * 1.2; },
    life: (t) => { tail.rotation.x = Math.sin(t * (o.wag || 3)) * 0.35; head.rotation.y = Math.sin(t * 0.7) * 0.15; ears.forEach((e, i) => { e.rotation.y = Math.sin(t * 2 + i) * 0.08; }); if (g.userData.trunk) g.userData.trunk.rotation.z = Math.sin(t * 1.3) * 0.3; } };
  return g;
}

/* ── 새(오리 · 암탉) — o = { body, wing, beak, comb, swim } ── */
export function bird(K, o){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const bd = M(T(K, o.body), { roughness: 0.7 }), wg = M(T(K, o.wing || o.body), { roughness: 0.7 }), bk = M(T(K, o.beak || 'warm'), { roughness: 0.5 });
  b.add(ball(0.42, bd, 0, 0.45, 0, 1.25, 0.85, 0.95)); const head = new THREE.Group(); head.position.set(0.36, 0.86, 0); b.add(head);
  head.add(ball(0.24, bd)); { const k = mesh(new THREE.ConeGeometry(0.08, 0.22, 8), bk, 0.26, -0.02, 0); k.rotation.z = -Math.PI / 2; k.scale.z = o.flat ? 1.8 : 1; head.add(k); }
  if (o.comb) [0, 1, 2].forEach(i => head.add(ball(0.06, M('a-red', { roughness: 0.5 }), -0.04 + i * 0.07, 0.24 - Math.abs(i - 1) * 0.03, 0)));
  eyesOn(K, head, 0.14, 0.06, 0, 0.12, 0.045);
  const wings = [-1, 1].map(s => { const w = ball(0.26, wg, -0.05, 0.5, s * 0.36, 1.3, 0.6, 0.25); b.add(w); return w; });
  b.add(ball(0.14, bd, -0.5, 0.62, 0, 1.2, 0.6, 0.7));
  if (!o.swim) [-0.1, 0.1].forEach(z => b.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 5), bk, 0.02, 0.08, z)));
  g.userData = { body: b, head, wings, dy: 0.8, r: 1.0,
    act: t => { b.position.y = Math.abs(wave(t, 2)) * 0.3; wings.forEach((w, i) => { w.rotation.x = (i ? 1 : -1) * Math.abs(wave(t, 6)) * 0.9; }); },
    life: (t) => { head.position.y = 0.86 + (o.peck ? Math.max(0, Math.sin(t * 2.4)) * -0.25 : Math.sin(t * 2) * 0.02); head.rotation.z = o.peck ? Math.max(0, Math.sin(t * 2.4)) * -0.6 : 0; if (o.swim) b.position.y = Math.sin(t * 1.6) * 0.03; } };
  return g;
}

/* ── 물고기 — 소에서 높이 튀어 오른다(o.jump) ── */
export function fish(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), f = new THREE.Group(); g.add(f);
  const m = M(T(K, o.body || 'warm'), { roughness: 0.4 }); f.add(ball(0.32, m, 0, 0, 0, 1.3, 0.8, 0.55));
  { const t = mesh(new THREE.ConeGeometry(0.22, 0.32, 3), m, -0.48, 0, 0); t.rotation.z = Math.PI / 2; f.add(t); }
  f.add(ball(0.1, M(T(K, o.fin || 'a-gold'), { roughness: 0.4 }), 0, 0.22, 0, 1.4, 0.6, 0.3));
  eyesOn(K, f, 0.24, 0.06, 0, 0.13, 0.05);
  const base = o.y || 0.6;
  g.userData = { fish: f, dy: base + 0.3, r: 0.9,
    act: t => { f.position.y = Math.sin(t * Math.PI) * 1.4; f.rotation.z = Math.cos(t * Math.PI) * 0.9; },
    life: (t) => { const k = (t * 0.45) % 1; f.position.y = base + (k < 0.35 ? Math.sin(k / 0.35 * Math.PI) * 1.2 : 0); f.rotation.z = k < 0.35 ? Math.cos(k / 0.35 * Math.PI) * 0.8 : 0; f.visible = k < 0.35 || !o.jump; } };
  return g;
}

/* ── 개구리 — 연잎 위 ── */
export function frog(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const m = M(T(K, o.body || 'a-leaf'), { roughness: 0.6 });
  if (o.pad !== false) { const pad = new THREE.Mesh(new THREE.CircleGeometry(0.62, 22, 0.35, 5.6), M(K.mix('a-leaf', 'stage', 0.5), { roughness: 0.6, side: THREE.DoubleSide })); pad.rotation.x = -Math.PI / 2; pad.position.y = 0.05; g.add(pad); }
  b.add(ball(0.3, m, 0, 0.3, 0, 1.1, 0.75, 1)); [-1, 1].forEach(s => { b.add(ball(0.11, m, 0.12, 0.55, s * 0.14)); const e = ball(0.06, M('surface'), 0.17, 0.58, s * 0.14); b.add(e); b.add(ball(0.03, M('ink'), 0.22, 0.59, s * 0.14)); b.add(ball(0.1, m, -0.05, 0.12, s * 0.3, 1.6, 0.4, 0.8)); });
  g.userData = { body: b, dy: 0.5, r: 0.9, act: t => { b.position.y = Math.sin(t * Math.PI) * 0.9; b.rotation.z = wave(t) * 0.3; }, life: (t) => { b.scale.y = 1 + Math.max(0, Math.sin(t * 3)) * 0.06; } };
  return g;
}

/* ── 무당벌레 무리 — 폴짝 뛰며 다닌다 ── */
export function bugs(K, o = {}){
  const { THREE, M, ball } = K, g = new THREE.Group(), list = [];
  for (let i = 0; i < (o.n || 5); i++) { const b = new THREE.Group(); b.add(ball(0.12, M('a-red', { roughness: 0.4 }), 0, 0.1, 0, 1.2, 0.7, 1)); b.add(ball(0.06, M('ink-2'), 0.12, 0.1, 0));
    [[-0.03, 0.05], [0.05, -0.05]].forEach(d => b.add(ball(0.025, M('ink'), d[0], 0.17, d[1]))); b.userData.k = i / (o.n || 5); g.add(b); list.push(b); }
  g.userData = { bugs: list, dy: 0.4, r: 1.2,
    act: t => { list.forEach((b, i) => { b.position.y = Math.abs(Math.sin(t * Math.PI * 3 + i)) * 0.5; }); },
    life: (t) => { list.forEach((b, i) => { const a = (b.userData.k + t * 0.05) * Math.PI * 2; b.position.x = Math.cos(a) * 0.7; b.position.z = Math.sin(a) * 0.45; b.rotation.y = -a; b.position.y = Math.abs(Math.sin(t * 5 + i * 2)) * 0.12; }); } };
  return g;
}

/* ── 이구아나 — 바위 위에서 지도를 그린다 ── */
export function lizard(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const m = M(T(K, o.body || 'a-leaf'), { roughness: 0.7 });
  if (o.rock !== false) g.add(ball(0.55, M(K.mix(K.mix('a-steel', 'stage-2', 0.3), 'ink', 0.2), { roughness: 0.9 }), 0, 0.2, 0, 1.4, 0.55, 1.1));
  b.position.y = 0.42; g.add(b);
  b.add(ball(0.24, m, 0, 0.12, 0, 1.8, 0.6, 0.8)); const head = new THREE.Group(); head.position.set(0.5, 0.16, 0); b.add(head); head.add(ball(0.16, m, 0, 0, 0, 1.4, 0.8, 0.9));
  eyesOn(K, head, 0.12, 0.06, 0, 0.1, 0.035);
  for (let i = 0; i < 5; i++) b.add(mesh(new THREE.ConeGeometry(0.035, 0.1, 4), M('a-gold'), -0.25 + i * 0.12, 0.27, 0));
  const tail = new THREE.Group(); tail.position.set(-0.4, 0.1, 0); b.add(tail); { const t1 = mesh(new THREE.ConeGeometry(0.08, 0.7, 6), m, -0.3, 0, 0); t1.rotation.z = Math.PI / 2; tail.add(t1); }
  if (o.map) { const mp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), M('a-cream', { roughness: 0.9, side: THREE.DoubleSide })); mp.rotation.x = -Math.PI / 2; mp.position.set(0.55, 0.47, 0.42); g.add(mp); }
  g.userData = { body: b, head, tail, dy: 0.8, r: 1.1, act: t => { head.rotation.z = wave(t, 2) * 0.4; tail.rotation.y = wave(t, 3) * 0.7; b.position.y = 0.42 + Math.abs(wave(t)) * 0.15; }, life: (t) => { tail.rotation.y = Math.sin(t * 1.2) * 0.3; head.rotation.y = Math.sin(t * 0.8) * 0.2; } };
  return g;
}

/* ── 물건 ── */
export function cup(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), c = new THREE.Group(); c.position.y = o.y || 0; g.add(c);
  const m = M(T(K, o.tone || 'surface'), { roughness: 0.3 }); c.add(mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.42, 20), m, 0, 0.21, 0)); c.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 20), M('a-wood', { roughness: 0.4 }), 0, 0.4, 0));
  { const h = mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 16), m, 0.3, 0.22, 0); c.add(h); } c.add(mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 20), m, 0, 0.01, 0));
  const steam = []; for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: K.C('surface'), transparent: true, opacity: 0, depthWrite: false })); s.position.set(0, 0.5, 0); c.add(s); steam.push({ m: s, k: i / 4 }); }
  g.userData = { dy: (o.y || 0) + 0.5, r: 0.8, act: t => { c.rotation.z = wave(t, 3) * 0.2; c.position.y = (o.y || 0) + Math.abs(wave(t, 2)) * 0.2; },
    life: (t) => { steam.forEach(s => { const k = (s.k + t * 0.25) % 1; s.m.position.set(Math.sin(k * 6) * 0.06, 0.5 + k * 0.8, 0); s.m.scale.setScalar(0.5 + k); s.m.material.opacity = Math.sin(k * Math.PI) * 0.55; }); } };
  return g;
}
export function toyCar(K, o = {}){
  const { THREE, M, mesh, ball, rbox } = K, g = new THREE.Group(), ring = 0.8;
  { const tr = new THREE.Mesh(new THREE.RingGeometry(ring - 0.18, ring + 0.18, 40), M(K.mix('stage-2-soft', 'stage-2', 0.4), { roughness: 1, side: THREE.DoubleSide })); tr.rotation.x = -Math.PI / 2; tr.position.y = 0.015; tr.receiveShadow = true; g.add(tr); }
  const car = new THREE.Group(); g.add(car); const m = M(T(K, o.tone || 'a-red'), { roughness: 0.4 });
  const bd = rbox(0.5, 0.18, 0.3, 0.06, m); bd.position.y = 0.14; car.add(bd); const top = rbox(0.26, 0.14, 0.26, 0.05, M('a-fish', { roughness: 0.3 })); top.position.set(-0.03, 0.29, 0); car.add(top);
  [[-0.16, 0.16], [0.16, 0.16], [-0.16, -0.16], [0.16, -0.16]].forEach(w => { const wh = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), M('ink', { roughness: 0.6 }), w[0], 0.07, w[1]); wh.rotation.x = Math.PI / 2; car.add(wh); });
  const place = a => { car.position.set(Math.cos(a) * ring, 0, Math.sin(a) * ring); car.rotation.y = -a - Math.PI / 2; };
  place(0);
  g.userData = { car, dy: 0.4, r: 1.2, act: t => { car.position.y = Math.abs(wave(t, 4)) * 0.15; }, life: (t) => place(t * 0.9) };
  return g;
}
export function cake(K, o = {}){
  const { THREE, M, mesh, ball, rbox } = K, g = new THREE.Group(), wd = M('a-wood', { roughness: 0.8 });
  const cart = rbox(0.9, 0.12, 0.6, 0.05, wd); cart.rotation.x = -Math.PI / 2; cart.position.y = 0.52; g.add(cart);
  [[-0.35, 0.25], [0.35, 0.25], [-0.35, -0.25], [0.35, -0.25]].forEach(p => g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), wd, p[0], 0.27, p[1])));
  [-1, 1].forEach(s => { const wh = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 14), M('ink-2'), s * 0.3, 0.12, 0.33); wh.rotation.x = Math.PI / 2; g.add(wh); });
  const ck = new THREE.Group(); ck.position.y = 0.58; g.add(ck);
  ck.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 24), M('a-cream', { roughness: 0.6 }), 0, 0.12, 0)); ck.add(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 24), M('a-pink', { roughness: 0.5 }), 0, 0.26, 0));
  ck.add(ball(0.08, M('a-red', { roughness: 0.3 }), 0, 0.34, 0));
  g.userData = { dy: 0.9, r: 1.0, act: t => { ck.position.y = 0.58 + Math.abs(wave(t, 2)) * 0.25; ck.rotation.y = t * Math.PI * 2; } };
  return g;
}
export function desk(K, o = {}){
  const { THREE, M, mesh, rbox } = K, g = new THREE.Group(), wd = M(K.mix('a-wood', 'warm', 0.15), { roughness: 0.8 });
  const top = rbox(1.4, 0.12, 0.7, 0.05, wd); top.rotation.x = -Math.PI / 2; top.position.y = 0.82; g.add(top);
  const front = rbox(1.36, 0.7, 0.08, 0.05, M(K.mix('a-wood', 'ink', 0.15), { roughness: 0.85 })); front.position.set(0, 0.45, 0.3); g.add(front);
  const menu = new THREE.Group(); menu.position.set(0.2, 0.88, 0); g.add(menu);
  { const bd = rbox(0.5, 0.62, 0.05, 0.05, M('a-cream', { roughness: 0.9 })); bd.position.y = 0.31; bd.rotation.x = -0.2; menu.add(bd); }
  g.add(mesh(new THREE.ConeGeometry(0.1, 0.12, 12), M('a-gold', { metalness: 0.5, roughness: 0.3 }), -0.45, 0.94, 0.1));
  g.userData = { menu, dy: 1.0, r: 1.1, act: t => { menu.rotation.z = wave(t, 3) * 0.15; menu.position.y = 0.88 + Math.abs(wave(t)) * 0.12; } };
  return g;
}
export function egg(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group();
  const nest = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 10, 24), M(K.mix('a-wood', 'a-gold', 0.4), { roughness: 1 })); nest.rotation.x = Math.PI / 2; nest.position.y = 0.14; nest.castShadow = nest.receiveShadow = true; g.add(nest);
  const e = ball(0.36, M(T(K, o.tone || 'a-cream'), { roughness: 0.4 }), 0, 0.45, 0, 1, 1.3, 1); g.add(e);
  g.userData = { egg: e, dy: 0.9, r: 1.0, act: t => { e.rotation.z = wave(t, 4) * 0.35; }, life: (t) => { e.rotation.z = Math.sin(t * 5) * 0.04 * (Math.sin(t * 0.7) > 0.6 ? 1 : 0); } };
  return g;
}
export function leafFan(K, o = {}){
  const { THREE, M, mesh } = K, g = new THREE.Group(), f = new THREE.Group(); f.position.y = 0.9; g.add(f);
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.0, 8), M('a-wood'), 0, 0.5, 0));
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(-0.55, 0.9); shape.quadraticCurveTo(0, 1.25, 0.55, 0.9); shape.lineTo(0, 0);
  const leaf = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), M(T(K, o.tone || 'a-leaf'), { roughness: 0.7, side: THREE.DoubleSide })); leaf.castShadow = true; f.add(leaf);
  g.userData = { fan: f, dy: 1.4, r: 0.9, act: t => { f.rotation.y = wave(t, 4) * 0.8; }, life: (t) => { f.rotation.z = Math.sin(t * 0.8) * 0.05; } };
  return g;
}
export function gum(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 16), M('a-fish', { roughness: 0.2, transparent: true, opacity: 0.6 }), 0, 0.25, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), M('a-red', { roughness: 0.5 }), 0, 0.52, 0));
  [['a-pink', 0.06], ['a-gold', -0.06], ['a-leaf', 0]].forEach((c, i) => g.add(ball(0.07, M(c[0]), c[1], 0.12 + i * 0.1, 0.05)));
  const bub = ball(0.2, M('a-pink', { roughness: 0.25, transparent: true, opacity: 0.85 }), 0, 0.9, 0); g.add(bub);
  g.userData = { bub, dy: 0.8, r: 0.8, act: t => { bub.scale.setScalar(t < 0.85 ? 0.6 + t * 2.4 : 0.1); }, life: (t) => { const k = (t * 0.25) % 1; bub.scale.setScalar(k < 0.9 ? 0.5 + k * 1.6 : 0.05); bub.position.y = 0.8 + k * 0.4; } };
  return g;
}
export function board(K, o = {}){
  const { THREE, M, mesh, ball, rbox } = K, g = new THREE.Group();
  const bd = new THREE.Group(); bd.position.y = o.y || 0.02; g.add(bd);
  const tex = K.canvasTex(256, 256, (c, w) => { const n = 5, s = w / n, tones = [K.hex('a-cream'), K.hex('warm-soft'), K.hexOf(K.mix('a-leaf', 'surface', 0.5)), K.hexOf(K.mix('a-fish', 'surface', 0.5))]; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = tones[(i + j * 2) % tones.length]; c.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); } });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 1.3), [M('a-wood'), M('a-wood'), M(K.C('surface'), { map: tex, roughness: 0.9 }), M('a-wood'), M('a-wood'), M('a-wood')]); top.position.y = 0.03; top.castShadow = top.receiveShadow = true; bd.add(top);
  const pieces = [['a-red', -0.4, -0.4], ['word-blue', 0.4, 0.4]].map(p => { const pc = new THREE.Group(); pc.position.set(p[1], 0.06, p[2]); pc.add(mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.16, 12), M(p[0], { roughness: 0.4 }), 0, 0.08, 0)); pc.add(ball(0.07, M(p[0], { roughness: 0.4 }), 0, 0.2, 0)); bd.add(pc); return pc; });
  g.userData = { pieces, dy: (o.y || 0) + 0.4, r: 1.2, act: t => { pieces.forEach((p, i) => { p.position.y = 0.06 + Math.abs(wave(t + i * 0.3, 2)) * 0.3; }); } };
  return g;
}
export function hat(K, o = {}){
  const { THREE, M, mesh } = K, g = new THREE.Group(), h = new THREE.Group(); g.add(h); const m = M(T(K, o.tone || 'a-gold'), { roughness: 0.85 });
  h.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 24), m, 0, 0.03, 0)); h.add(mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.26, 20), m, 0, 0.16, 0)); h.add(mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.07, 20), M('a-red', { roughness: 0.6 }), 0, 0.08, 0));
  h.rotation.z = 0.15;
  g.userData = { hat: h, dy: 0.3, r: 0.8, act: t => { h.position.x = wave(t) * 0.6; h.rotation.x = t * Math.PI * 2; h.position.y = Math.abs(wave(t, 2)) * 0.2; }, life: (t) => { h.rotation.y = t * 0.3; } };
  return g;
}
export function ham(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.36, 18, 1, true), M(K.mix('a-wood', 'warm', 0.25), { roughness: 0.85, side: THREE.DoubleSide }), 0, 0.18, 0));
  const hm = ball(0.26, M('a-pink', { roughness: 0.5 }), 0, 0.42, 0, 1.3, 0.8, 1); g.add(hm); { const bone = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.24, 8), M('a-cream'), 0.38, 0.48, 0); bone.rotation.z = -1.2; g.add(bone); }
  const steam = []; for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: K.C('surface'), transparent: true, opacity: 0, depthWrite: false })); g.add(s); steam.push({ m: s, k: i / 3 }); }
  g.userData = { dy: 0.6, r: 0.9, act: t => { hm.position.y = 0.42 + Math.abs(wave(t, 2)) * 0.25; }, life: (t) => { steam.forEach(s => { const k = (s.k + t * 0.3) % 1; s.m.position.set(Math.sin(k * 6) * 0.08, 0.6 + k * 0.7, 0); s.m.scale.setScalar(0.5 + k); s.m.material.opacity = Math.sin(k * Math.PI) * 0.5; }); } };
  return g;
}
export function igloo(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), ice = M(K.mix('surface', 'a-fish', 0.15), { roughness: 0.4 });
  g.add(mesh(new THREE.SphereGeometry(1.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), ice, 0, 0, 0));
  for (let i = 1; i < 4; i++) { const r = mesh(new THREE.TorusGeometry(1.25 * Math.cos(i * 0.38), 0.015, 6, 40), M(K.mix('a-fish', 'surface', 0.4)), 0, 1.25 * Math.sin(i * 0.38), 0); r.rotation.x = Math.PI / 2; r.castShadow = false; g.add(r); }
  const door = new THREE.Group(); door.position.set(0, 0, 1.1); g.add(door); { const tn = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 20, 1, false, 0, Math.PI), ice, 0, 0, 0); tn.rotation.set(Math.PI / 2, 0, 0); door.add(tn); door.add(mesh(new THREE.CircleGeometry(0.36, 20, 0, Math.PI), M('ink-2', { roughness: 0.9 }), 0, 0.02, 0.31)); }
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), new THREE.MeshStandardMaterial({ color: K.C('warm-soft'), emissive: K.C('warm'), emissiveIntensity: 0.6 })); win.position.set(0.7, 0.75, 0.82); win.lookAt(1.4, 1.5, 1.64); g.add(win);
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 10), M('ink-2'), -0.5, 1.2, -0.3));
  const steam = []; for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: K.C('surface'), transparent: true, opacity: 0, depthWrite: false })); g.add(s); steam.push({ m: s, k: i / 4 }); }
  g.userData = { win, dy: 1.2, r: 1.9, act: t => { win.material.emissiveIntensity = 0.6 + Math.abs(wave(t, 4)) * 2; },
    life: (t) => { steam.forEach(s => { const k = (s.k + t * 0.22) % 1; s.m.position.set(-0.5 + Math.sin(k * 5) * 0.1, 1.45 + k * 1.2, -0.3); s.m.scale.setScalar(0.6 + k * 1.2); s.m.material.opacity = Math.sin(k * Math.PI) * 0.55; }); } };
  return g;
}
export function ink(K, o = {}){
  const { THREE, M, mesh } = K, g = new THREE.Group();
  const pud = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), M('word-blue', { roughness: 0.15 })); pud.rotation.x = -Math.PI / 2; pud.scale.set(1.3, 1, 1); pud.position.set(0.3, 0.012, 0.15); pud.receiveShadow = true; g.add(pud);
  const bt = new THREE.Group(); bt.position.set(-0.3, 0, 0); g.add(bt); bt.add(mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.42, 14), M('word-blue', { roughness: 0.3 }), 0, 0.21, 0)); bt.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), M('ink-2'), 0, 0.48, 0));
  bt.rotation.z = 0.5;
  g.userData = { bottle: bt, dy: 0.4, r: 1.1, act: t => { bt.rotation.z = 0.5 + wave(t, 3) * 0.35; pud.scale.set(1.3 + Math.abs(wave(t)) * 0.3, 1, 1 + Math.abs(wave(t)) * 0.3); } };
  return g;
}
export function jam(K, o = {}){
  const { THREE, M, mesh, rbox } = K, g = new THREE.Group(), ice = M(K.mix('surface', 'a-fish', 0.2), { roughness: 0.3 });
  const sh = rbox(1.0, 0.1, 0.5, 0.04, ice); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.7; g.add(sh); [-0.4, 0.4].forEach(x => g.add(mesh(new THREE.BoxGeometry(0.12, 0.7, 0.4), ice, x, 0.35, 0)));
  const jr = new THREE.Group(); jr.position.set(0, 0.75, 0); g.add(jr); jr.add(mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 16), M(T(K, o.tone || 'a-red'), { roughness: 0.2 }), 0, 0.16, 0)); jr.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), M('a-cream', { roughness: 0.6 }), 0, 0.35, 0));
  g.userData = { jar: jr, dy: 1.0, r: 0.9, act: t => { jr.position.y = 0.75 + Math.abs(wave(t, 2)) * 0.3; jr.rotation.y = t * Math.PI * 2; } };
  return g;
}
export function paperJet(K, o = {}){
  const { THREE, M } = K, g = new THREE.Group(), jet = new THREE.Group(); g.add(jet);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0.5, 0, 0, -0.4, 0, 0.35, -0.3, 0.02, 0, 0.5, 0, 0, -0.3, 0.02, 0, -0.4, 0, -0.35, 0.5, 0, 0, -0.3, 0.02, 0, -0.35, -0.12, 0], 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M('surface', { roughness: 0.7, side: THREE.DoubleSide })); m.castShadow = true; jet.add(m);
  const h = o.y || 2.6, R = o.ring || 1.4;
  const place = a => { jet.position.set(Math.cos(a) * R, h + Math.sin(a * 2) * 0.2, Math.sin(a) * R * 0.6); jet.rotation.set(0, -a - Math.PI / 2, Math.sin(a) * 0.3); };
  place(0);
  g.userData = { jet, dy: h, r: 0.8, act: t => { jet.rotation.x = t * Math.PI * 2; }, life: (t) => place(t * 0.6), follow: jet };
  return g;
}
export function jug(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), j = new THREE.Group(); g.add(j); const m = M(T(K, o.tone || 'a-fish'), { roughness: 0.4 });
  j.add(mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.7, 18), m, 0, 0.35, 0)); j.add(mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.08, 18), M('a-steel', { roughness: 0.3 }), 0, 0.72, 0));
  { const hd = mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 16, Math.PI), m, 0.3, 0.42, 0); hd.rotation.z = -Math.PI / 2; j.add(hd); }
  g.userData = { dy: 0.7, r: 0.8, act: t => { j.rotation.z = wave(t, 3) * 0.3; j.position.y = Math.abs(wave(t, 2)) * 0.2; } };
  return g;
}
export function springPad(K, o = {}){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), cap = new THREE.Group(); g.add(cap);
  for (let i = 0; i < 5; i++) { const r = mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 20), M('a-steel', { metalness: 0.5, roughness: 0.3 }), 0, 0.08 + i * 0.07, 0); r.rotation.x = Math.PI / 2; g.add(r); }
  cap.position.y = 0.45; cap.add(ball(0.5, M(T(K, o.tone || 'a-red'), { roughness: 0.5 }), 0, 0, 0, 1, 0.35, 1)); [[0.2, 0.1, 0.2], [-0.25, 0.12, -0.05], [0.05, 0.15, -0.25]].forEach(d => cap.add(ball(0.06, M('surface'), d[0], d[1], d[2])));
  g.userData = { cap, dy: 0.7, r: 0.9, act: t => { cap.position.y = 0.45 - Math.abs(wave(t, 2)) * 0.18 + Math.max(0, wave(t * 2 - 1)) * 0.4; } };
  return g;
}

/* ── 통나무 버스 — 빈터마다 정류장에 선다(굴뚝 김 · 앞에 불 · 문) ── */
export function logBus(K, at){
  const { THREE, M, mesh, ball, rbox, mix, C } = K, g = new THREE.Group(); g.position.set(at[0], 0, at[1]);
  const car = new THREE.Group(); car.position.y = 0.42; car.rotation.y = 0.15; car.scale.setScalar(0.82); g.add(car);
  const log = mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.9, 24), M('a-wood', { roughness: 0.9 }), 0, 0.72, 0); log.rotation.z = Math.PI / 2; car.add(log);
  [-1.46, 1.46].forEach(x2 => { const c = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.04, 24), M('a-cream', { roughness: 0.8 }), x2, 0.72, 0); c.rotation.z = Math.PI / 2; car.add(c); const r = mesh(new THREE.TorusGeometry(0.4, 0.025, 6, 24), M(mix('a-cream', 'a-wood', 0.5)), x2 + Math.sign(x2) * 0.03, 0.72, 0); r.rotation.y = Math.PI / 2; r.castShadow = false; car.add(r); });
  const glass = new THREE.MeshStandardMaterial({ color: C('warm-soft'), emissive: C('warm'), emissiveIntensity: 0.4, roughness: 0.3 });
  [-0.05, 0.8].forEach(x2 => { const wd = rbox(0.56, 0.5, 0.1, 0.14, glass); wd.position.set(x2, 0.95, 0.72); car.add(wd); const fr2 = rbox(0.66, 0.6, 0.06, 0.16, M(mix('a-wood', 'ink', 0.25))); fr2.position.set(x2, 0.95, 0.7); car.add(fr2); });
  let door; { door = rbox(0.5, 0.95, 0.08, 0.14, M(mix('a-red', 'a-wood', 0.3), { roughness: 0.6 })); door.position.set(-0.92, 0.72, 0.745); car.add(door); const hole = rbox(0.42, 0.86, 0.06, 0.12, M(mix('ink', 'a-wood', 0.35), { roughness: 0.9 })); hole.position.set(-0.92, 0.72, 0.715); car.add(hole); car.add(ball(0.04, M('a-gold', { metalness: 0.5, roughness: 0.3 }), -0.76, 0.7, 0.79)); }
  const lamps = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: C('warm-soft'), emissive: C('warm'), emissiveIntensity: 0.9, roughness: 0.3 })); l.position.set(-1.5, 0.5, s * 0.38); l.scale.x = 0.5; car.add(l); return l; });
  { const bp = rbox(0.16, 0.16, 1.5, 0.07, M('ink-2', { roughness: 0.5 })); bp.position.set(-1.52, 0.16, 0); car.add(bp); }
  [[-0.95, 0.6], [0.95, 0.6], [-0.95, -0.6], [0.95, -0.6]].forEach(w2 => { const wh = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 20), M('ink', { roughness: 0.6 }), w2[0], 0, w2[1]); wh.rotation.x = Math.PI / 2; car.add(wh); const hub = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 12), M('a-cream'), w2[0], 0, w2[1]); hub.rotation.x = Math.PI / 2; car.add(hub); });
  car.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 12), M('ink-2', { roughness: 0.5 }), 0.9, 1.7, 0)); car.add(ball(0.3, M('a-red', { roughness: 0.5 }), -1.2, 1.5, 0, 1.2, 0.35, 1.2));
  const steam = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshStandardMaterial({ color: C('surface'), transparent: true, opacity: 0, roughness: 1, depthWrite: false })); m.position.set(0.9, 2.0, 0); car.add(m); steam.push({ m, t: i / 6 }); }
  const stop = new THREE.Group(); stop.position.set(1.75, 0, -0.8); stop.add(mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.4, 8), M('ink-2', { roughness: 0.5 }), 0, 0.7, 0)); { const d = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24), M('a-fish', { roughness: 0.5 }), 0, 1.55, 0); d.rotation.x = Math.PI / 2; stop.add(d); const d2 = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.07, 24), M('a-cream', { roughness: 0.6 }), 0, 1.55, 0); d2.rotation.x = Math.PI / 2; stop.add(d2); }
  g.userData = { w: 'bus', home: g.position.clone(), stop, steam, car, lamps, door, dy: 0.9, r: 1.9,
    act: t => { car.position.y = 0.42 + Math.abs(Math.sin(t * Math.PI * 4)) * 0.12; car.rotation.z = Math.sin(t * Math.PI * 4) * 0.03; lamps.forEach(l => { l.material.emissiveIntensity = 0.9 + wave(t, 4) * 1.6; }); } };
  return g;
}
/* 버스의 살아 있는 몸짓 — 굴뚝 김 · 엔진 떨림(A01 의 버스도 같은 몸짓) */
export function busLife(bus, dt, t){ const u = bus.userData; u.steam.forEach(s => { s.t = (s.t + dt * 0.3) % 1; const k = s.t; s.m.position.set(0.9 + Math.sin(k * 7) * 0.12, 2.0 + k * 1.5, Math.cos(k * 5) * 0.08); s.m.scale.setScalar(0.5 + k * 1.3); s.m.material.opacity = Math.sin(k * Math.PI) * 0.6; }); if (!u.busy) u.car.position.y = 0.42 + Math.sin(t * 22) * 0.006; }

/* ── 무대(가운데 장면) ── */
export function teaTable(K){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), wd = M('a-wood', { roughness: 0.9 }), cut = M('a-cream', { roughness: 0.8 });
  g.add(mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.7, 24), wd, 0, 0.35, 0)); g.add(mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.03, 24), cut, 0, 0.71, 0));
  [0.7, 0.45, 0.22].forEach(r => { const t = mesh(new THREE.TorusGeometry(r, 0.015, 6, 32), M(K.mix('a-cream', 'a-wood', 0.5)), 0, 0.725, 0); t.rotation.x = Math.PI / 2; t.castShadow = false; g.add(t); });
  const seats = [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4, s = new THREE.Group(); s.position.set(Math.cos(a) * 1.75, 0, Math.sin(a) * 1.2); s.add(mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.4, 16), wd, 0, 0.2, 0)); s.add(mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 16), cut, 0, 0.41, 0));
    const cush = ball(0.3, M(['a-pink', 'a-fish', 'warm-soft', 'a-leaf'][i], { roughness: 0.9 }), 0, 0.48, 0, 1, 0.3, 1); cush.visible = false; s.add(cush); s.userData.cush = cush; g.add(s); return s; });
  const pot = new THREE.Group(); pot.position.set(-0.45, 0.72, -0.2); g.add(pot); pot.add(ball(0.22, M('surface', { roughness: 0.3 }), 0, 0.18, 0, 1, 0.85, 1)); { const sp = mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.24, 8), M('surface'), 0.24, 0.2, 0); sp.rotation.z = -0.9; pot.add(sp); }
  const lid = ball(0.1, M('a-gold', { roughness: 0.4 }), 0, 0.36, 0, 1, 0.5, 1); pot.add(lid);
  g.userData = { seats, lid, life: (t) => { lid.position.y = 0.36 + Math.max(0, Math.sin(t * 6)) * 0.03 * (Math.sin(t * 0.9) > 0.3 ? 1 : 0); } };
  return g;
}
export function waterfall(K){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), rock = M(K.mix(K.mix('a-steel', 'stage-2', 0.3), 'ink', 0.2), { roughness: 0.9 });
  [[-1.4, 1.2, -0.6, 1.1], [1.4, 1.1, -0.6, 1.0], [0, 1.9, -1.0, 1.3], [-0.8, 2.6, -1.2, 0.8], [0.9, 2.5, -1.2, 0.8]].forEach(r => g.add(ball(r[3], rock, r[0], r[1], r[2], 1.1, 1, 0.8)));
  g.add(ball(0.9, M(K.mix('stage', 'a-leaf', 0.5), { roughness: 1 }), 0, 3.05, -1.0, 1.4, 0.3, 0.9));
  const tex = K.canvasTex(64, 256, (c, w, h) => { c.fillStyle = K.hex('a-fish'); c.fillRect(0, 0, w, h); c.fillStyle = K.hex('surface'); for (let i = 0; i < 40; i++) { c.globalAlpha = 0.3 + Math.random() * 0.4; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 20 + Math.random() * 40); } c.globalAlpha = 1; });
  tex.wrapT = THREE.RepeatWrapping;
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.6), new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.85, roughness: 0.2 })); fall.position.set(0, 1.55, -0.2); g.add(fall);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), M(K.mix('a-fish', 'stage-soft', 0.3), { roughness: 0.1, transparent: true, opacity: 0.92 })); pool.rotation.x = -Math.PI / 2; pool.scale.set(1.3, 0.8, 1); pool.position.set(0, 0.03, 0.9); pool.receiveShadow = true; g.add(pool);
  const mist = []; for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshStandardMaterial({ color: K.C('surface'), transparent: true, opacity: 0, depthWrite: false })); g.add(s); mist.push({ m: s, k: i / 6 }); }
  g.userData = { tex, pool, life: (t) => { tex.offset.y = -t * 0.6; mist.forEach(s => { const k = (s.k + t * 0.15) % 1; s.m.position.set(Math.sin(s.k * 9) * 0.8, 0.2 + k * 0.9, 0.3 + Math.cos(s.k * 7) * 0.3); s.m.scale.setScalar(0.6 + k); s.m.material.opacity = Math.sin(k * Math.PI) * 0.35; }); } };
  return g;
}
export function hillRock(K){
  const { THREE, M, mesh, ball } = K, g = new THREE.Group(), rock = M(K.mix(K.mix('a-steel', 'stage-2', 0.35), 'ink', 0.15), { roughness: 0.9 });
  g.add(ball(1.4, rock, 0, 0.25, 0, 1.3, 0.38, 1.0));
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.5), M(K.mix('a-red', 'a-cream', 0.55), { roughness: 1, side: THREE.DoubleSide })); mat.rotation.x = -Math.PI / 2; mat.position.y = 0.76; mat.receiveShadow = true; g.add(mat);
  const mill = new THREE.Group(); mill.position.set(1.7, 0, -0.6); g.add(mill); mill.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), M('a-wood'), 0, 0.7, 0));
  const blades = new THREE.Group(); blades.position.y = 1.4; mill.add(blades); ['a-red', 'a-gold', 'a-fish', 'a-leaf'].forEach((c, i) => { const b = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 3), M(c, { roughness: 0.6 })); b.position.set(Math.cos(i * Math.PI / 2) * 0.2, Math.sin(i * Math.PI / 2) * 0.2, 0.05); b.rotation.z = i * Math.PI / 2; blades.add(b); });
  g.userData = { top: 0.78, life: (t) => { blades.rotation.z = -t * 2.2; } };
  return g;
}
export function icicles(K, at){
  const { THREE, M, mesh } = K, g = new THREE.Group(), ice = M(K.mix('surface', 'a-fish', 0.25), { roughness: 0.2, transparent: true, opacity: 0.85 });
  const drops = [];
  at.forEach(p => { const r = new THREE.Group(); r.position.set(p[0], 0, p[1]); g.add(r);
    r.add(mesh(new THREE.BoxGeometry(1.4, 0.22, 0.5), M(K.mix(K.mix('a-steel', 'stage-2', 0.3), 'ink', 0.2), { roughness: 0.9 }), 0, p[2] || 1.6, 0));
    for (let i = 0; i < 5; i++) { const c = mesh(new THREE.ConeGeometry(0.06, 0.35 + (i % 3) * 0.12, 6), ice, -0.5 + i * 0.25, (p[2] || 1.6) - 0.28, 0.1); c.rotation.x = Math.PI; r.add(c); }
    [-1, 1].forEach(s => r.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, p[2] || 1.6, 6), M('a-wood'), s * 0.6, (p[2] || 1.6) / 2, 0)));
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), ice); r.add(d); drops.push({ m: d, y0: (p[2] || 1.6) - 0.5, k: Math.random() }); });
  g.userData = { life: (t) => { drops.forEach(d => { const k = (d.k + t * 0.4) % 1; d.m.position.set(0, d.y0 - k * d.y0, 0.1); d.m.visible = k < 0.95; }); } };
  return g;
}
export function pond(K, at, r = 1.3){
  const { THREE, M } = K, g = new THREE.Group(); g.position.set(at[0], 0, at[1]);
  const w = new THREE.Mesh(new THREE.CircleGeometry(r, 32), M(K.mix('a-fish', 'stage-soft', 0.3), { roughness: 0.1, transparent: true, opacity: 0.92 })); w.rotation.x = -Math.PI / 2; w.scale.set(1.3, 0.8, 1); w.position.y = 0.03; w.receiveShadow = true; g.add(w);
  [[-0.6, 0.2, 0.26], [0.5, -0.3, 0.22]].forEach((a, i) => { const p = new THREE.Mesh(new THREE.CircleGeometry(a[2], 18, 0.35, 5.6), M(K.mix('a-leaf', 'stage', 0.5), { roughness: 0.6, side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; p.rotation.z = i * 2; p.position.set(a[0], 0.05, a[1]); g.add(p); });
  return g;
}
