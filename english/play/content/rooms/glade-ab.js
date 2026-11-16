/* ============================================================
 * 영어 놀이터 — 방 자료: 사과나무 빈터 a · b (W15 · 한 해 길 A01 · 상세판 A01 「방 배치」 · 키트 core/diorama.js 위에)
 *   A01 의 입말 낱말 여덟이 전부 빈터 안의 물건이다 — 왼쪽(a) 사과 · 개미 줄 · 도끼 · 악어(개울) / 오른쪽(b) 배낭 · 침대 · 통나무 버스 · 새.
 *   물건마다 누르면 움직이는 법(act)과, 가만히 있을 때 살아 있는 몸짓(stepThings)을 함께 둔다.
 *   const T = buildThings(K, glade, { slot, creek })      → { apple, ant, ax, alligator, bag, bed, bus, bird } (각 userData.act(t) · home · busy)
 *   stepThings(T, dt, t)                                 매 장면 — 개미 줄 · 악어 · 버스 김 · 새 · 배낭 · 사과
 *   const SH = shelves(K, glade, T, { left, right, letterOf })   씨앗 단계가 물건에 보인다(설계 v2 §7-2 · 상세판 A §2):
 *     SH.set(w, stage, ink?)   stage: -1 심기 전(빛바랜 색 · 가만히) · 0·1 씨앗·새싹(제 색 + 살아 움직임) · 2 꽃(제 나무 앞 선반에 작은 나무 조각) · 3 열매(조각에 아이가 쓴 첫 글자 이름표)
 *     장면의 물건은 치우지 않는다 · 숫자 0 — 방이 차는 것이 곧 진도
 * ============================================================ */
export const ROOM_AB = {
  letters: ['a', 'b'],
  words: ['apple', 'ant', 'ax', 'alligator', 'bag', 'bed', 'bus', 'bird'],
  at: { apple: 'Ld', ant: 'Lc', ax: 'Lb', alligator: 'creek', bag: 'Rd', bed: 'Rc', bus: 'Re', bird: 'treeR' }
};

export function buildThings(K, glade, o){
  const { THREE, M, C, mix, hex, hexOf, canvasTex, mesh, ball, rbox, rshape } = K, CK = o.creek;
  const things = {}, wave = (t, n = 1) => Math.sin(t * Math.PI * n);
  function thing(w, x, z){ const g = new THREE.Group(); g.position.set(x, 0, z); g.userData = { w, home: g.position.clone(), hop: 0 }; things[w] = g; glade.add(g); return g; }
  const P = n => o.slot[n];
{ /* apple — 큰 사과(누르면 데굴 한 바퀴) */
  const g = thing('apple', ...P('Ld')), a = new THREE.Group(); a.position.y = 0.6; g.add(a);
  a.add(ball(0.62, M('a-red', { roughness: 0.28 }), 0, 0, 0, 1, 0.92, 1)); a.add(ball(0.2, M(mix('a-red', 'ink', 0.25), { roughness: 0.5 }), 0, 0.5, 0, 1, 0.3, 1));
  a.add(mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.3, 8), M('a-wood'), 0.03, 0.68, 0));
  [[0.2, 0.74, -0.5, 1.2], [-0.13, 0.72, 0.6, 0.8]].forEach(l => { const lf = ball(0.2, M('a-leaf'), l[0], l[1], 0, 1.2 * l[3], 0.22, 0.6 * l[3]); lf.rotation.z = l[2]; a.add(lf); });
  a.add(ball(0.13, M('surface', { transparent: true, opacity: 0.55, roughness: 0.2 }), -0.28, 0.25, 0.42, 1, 1.4, 0.4));
  g.userData.a = a; g.userData.act = t => { a.rotation.z = -t * Math.PI * 2; g.position.x = g.userData.home.x + wave(t) * 0.9; a.position.y = 0.6 + Math.abs(wave(t, 2)) * 0.12; }; }
{ /* ant — 개미집 둘레를 도는 개미 줄(사과 조각을 나른다) */
  const g = thing('ant', ...P('Lc')), ants = [], ink = M(mix('ink', 'a-wood', 0.3), { roughness: 0.4 });
  g.add(ball(0.46, M(mix('a-cream', 'stage-2', 0.45), { roughness: 1 }), 0, 0, 0, 1, 0.42, 0.9)); g.add(ball(0.12, M(mix('a-wood', 'ink', 0.3)), 0, 0.18, 0.04, 1, 0.3, 1));
  for (let i = 0; i < 5; i++) { const a = new THREE.Group();
    a.add(ball(0.13, ink, 0.17, 0.16, 0)); a.add(ball(0.1, ink, 0, 0.15, 0)); a.add(ball(0.15, ink, -0.2, 0.17, 0, 1.2, 1, 1));
    [-1, 1].forEach(s => { for (let k = 0; k < 3; k++) { const leg = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 5), ink, (k - 1) * 0.11, 0.07, s * 0.1); leg.rotation.x = s * 0.7; leg.castShadow = false; a.add(leg); } });
    [-1, 1].forEach(s => { const an = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 5), ink, 0.26, 0.27, s * 0.05); an.rotation.z = -0.7; an.castShadow = false; a.add(an); a.add(ball(0.03, M('surface', { roughness: 0.3 }), 0.27, 0.19, s * 0.07)); });
    const bit = ball(0.11, M(i % 2 ? 'a-cream' : 'a-red', { roughness: 0.5 }), -0.02, 0.36, 0, 1, 0.75, 1); a.add(bit);
    a.userData = { k: i / 5, bit }; a.scale.setScalar(1.3); g.add(a); ants.push(a); }
  g.userData.ants = ants; g.userData.act = t => { ants.forEach((a, i) => { a.position.y = Math.abs(Math.sin(t * Math.PI * 3 + i)) * 0.3; }); }; }
{ /* ax — 그루터기에 기대 놓은 둥근 나무 도끼 · 옆에 쪼갠 장작 */
  const g = thing('ax', ...P('Lb')), wd = M('a-wood', { roughness: 0.9 }), cut = M('a-cream', { roughness: 0.8 });
  g.add(mesh(new THREE.CylinderGeometry(0.72, 0.86, 0.66, 20), wd, 0, 0.33, 0)); g.add(mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.03, 20), cut, 0, 0.67, 0));
  [0.45, 0.25].forEach(r => { const t = mesh(new THREE.TorusGeometry(r, 0.018, 6, 28), M(mix('a-cream', 'a-wood', 0.5)), 0, 0.69, 0); t.rotation.x = Math.PI / 2; t.castShadow = false; g.add(t); });
  [[-1.0, 0.16, 0.75, 0.3], [-1.2, 0.16, 0.35, -0.5], [-1.05, 0.45, 0.55, 0.1]].forEach(l => { const lg = new THREE.Group(); lg.position.set(l[0], l[1], l[2]); lg.rotation.y = l[3]; const c = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.72, 10), wd); c.rotation.z = Math.PI / 2; lg.add(c); [-0.365, 0.365].forEach(x2 => { const e = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 10), cut, x2, 0, 0); e.rotation.z = Math.PI / 2; lg.add(e); }); g.add(lg); });
  [[0.5, 0.95], [0.2, 1.1], [0.75, 0.75]].forEach((c, i) => { const ch = mesh(new THREE.BoxGeometry(0.14, 0.03, 0.07), cut, c[0], 0.03, c[1]); ch.rotation.y = i * 1.1; ch.castShadow = false; g.add(ch); });
  const ax = new THREE.Group(); ax.position.set(1.0, 0.02, 0.5); g.add(ax);
  ax.add(mesh(new THREE.CapsuleGeometry(0.075, 1.5, 6, 12), M(mix('stage-2', 'a-gold', 0.4), { roughness: 0.5 }), 0, 0.85, 0)); ax.add(mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 10), M('a-red', { roughness: 0.6 }), 0, 0.2, 0));
  { const s = new THREE.Shape(); s.moveTo(-0.08, 0.3); s.lineTo(0.5, 0.52); s.quadraticCurveTo(0.74, 0, 0.5, -0.52); s.lineTo(-0.08, -0.3); s.quadraticCurveTo(-0.16, 0, -0.08, 0.3);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }); geo.translate(0, 0, -0.07);
    ax.add(mesh(geo, M('a-steel', { roughness: 0.28, metalness: 0.5 }), 0.02, 1.45, 0)); ax.add(mesh(new THREE.BoxGeometry(0.2, 0.5, 0.2), M('a-red', { roughness: 0.5 }), 0, 1.45, 0)); }
  ax.rotation.z = 0.36; ax.rotation.y = -0.15;
  g.userData.act = t => { ax.rotation.z = 0.36 - wave(t) * 1.1; ax.position.y = 0.02 + wave(t) * 0.5; }; }
{ /* alligator — 개울에서 눈만 내놓다가 누르면 하품(꼬리는 천천히 흔든다) */
  const g = thing('alligator', CK[0] + 1.0, CK[1] + 0.1), body = new THREE.Group(), skin = M(mix('stage-deep', 'a-leaf', 0.3), { roughness: 0.75 }), belly = M(mix('a-cream', 'a-leaf', 0.25)), pink = M('a-pink', { roughness: 0.6 });
  body.position.set(-0.2, 0.02, 0); body.rotation.y = -0.5; g.add(body);
  const tail = new THREE.Group(); tail.position.set(-1.6, 0, 0); body.add(tail);
  [[-0.35, 0.62, 0.3, 1.25, body, 0], [-1.25, 0.52, 0.26, 1.15, body, 0], [-0.45, 0.38, 0.2, 1.0, tail, 2], [-1.15, 0.24, 0.14, 0.9, tail, 3]].forEach(b => { b[4].add(ball(0.5, skin, b[0], 0.02, 0, b[3], b[2], b[1])); const i = b[5] || (b[0] < -1 ? 1 : 0); [-0.15, 0.15].forEach(z2 => b[4].add(ball(0.085 - i * 0.012, skin, b[0] + 0.18, 0.17 - i * 0.03, z2 * (1 - i * 0.2)))); });
  body.add(ball(0.5, skin, 0.42, 0.1, 0, 0.9, 0.5, 0.82));
  body.add(ball(0.5, belly, 1.2, 0.0, 0, 1.55, 0.2, 0.62)); body.add(ball(0.42, pink, 1.2, 0.07, 0, 1.5, 0.08, 0.6));                 /* 아래턱 · 입 안 */
  const jaw = new THREE.Group(); jaw.position.set(0.5, 0.1, 0); body.add(jaw);
  { jaw.add(ball(0.5, skin, 0.72, 0.06, 0, 1.6, 0.26, 0.66)); jaw.add(ball(0.2, skin, 1.36, 0.1, 0, 1, 0.55, 1.5)); jaw.add(ball(0.42, pink, 0.72, -0.03, 0, 1.5, 0.08, 0.58));
    [-1, 1].forEach(s => { for (let k = 0; k < 5; k++) { const tooth = mesh(new THREE.ConeGeometry(0.04, 0.11, 6), M('surface'), 0.28 + k * 0.24, -0.05, s * (0.27 - k * 0.015)); tooth.rotation.x = Math.PI; tooth.castShadow = false; jaw.add(tooth); } });
    [-1, 1].forEach(s => { jaw.add(ball(0.05, M('ink', { roughness: 0.4 }), 1.48, 0.2, s * 0.1)); }); }
  const eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(0.42, 0.36, s * 0.27); body.add(e); e.add(ball(0.2, skin)); e.add(ball(0.14, M('surface', { roughness: 0.2 }), 0.09, 0.05, s * 0.05)); e.add(ball(0.07, M('ink', { roughness: 0.2 }), 0.19, 0.06, s * 0.07)); e.add(ball(0.025, M('surface', { roughness: 0.1 }), 0.24, 0.1, s * 0.05)); return e; });
  g.userData.body = body; g.userData.eyes = eyes; g.userData.jaw = jaw; g.userData.tail = tail;
  g.userData.act = t => { jaw.rotation.z = wave(t) * 0.8; body.position.y = 0.02 + wave(t) * 0.3; }; }
{ /* bag — 나뭇가지에 걸어 둔 배낭(누르면 덜렁) */
  const g = thing('bag', ...P('Rd')), plum = M('a-plum', { roughness: 0.75 }), dark = M(mix('a-plum', 'ink', 0.25), { roughness: 0.7 });
  g.add(mesh(new THREE.CylinderGeometry(0.11, 0.15, 2.2, 10), M('a-wood', { roughness: 0.85 }), -0.55, 1.1, 0));
  { const br = mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 8), M('a-wood', { roughness: 0.85 }), -0.1, 2.0, 0); br.rotation.z = -1.25; g.add(br); g.add(ball(0.22, M('a-leaf'), -0.6, 2.35, 0, 1.3, 0.8, 1)); g.add(ball(0.16, M(mix('a-leaf', 'warm-soft', 0.25)), -0.42, 2.48, 0.12, 1.2, 0.7, 1)); }
  const sw = new THREE.Group(); sw.position.set(0.25, 2.0, 0); g.add(sw);
  [-0.16, 0.16].forEach(x2 => { const st = mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 16, Math.PI), dark, x2, -0.12, 0); st.rotation.y = Math.PI / 2; sw.add(st); });
  const bd = rbox(0.95, 1.05, 0.55, 0.26, plum); bd.position.set(0, -0.82, 0); sw.add(bd);
  const fl = rbox(0.98, 0.46, 0.6, 0.2, dark); fl.position.set(0, -0.5, 0.02); sw.add(fl);
  const pk = rbox(0.56, 0.42, 0.16, 0.12, M(mix('a-plum', 'surface', 0.28))); pk.position.set(0, -1.02, 0.3); sw.add(pk);
  sw.add(mesh(new THREE.BoxGeometry(0.4, 0.03, 0.03), M('a-gold', { metalness: 0.4, roughness: 0.3 }), 0, -0.9, 0.39));
  [-1, 1].forEach(s => { const sp = rbox(0.16, 0.5, 0.36, 0.08, dark); sp.position.set(s * 0.52, -0.98, 0); sw.add(sp); });
  sw.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), M('a-gold', { metalness: 0.4, roughness: 0.3 }), 0, -0.72, 0.33));
  const tagG = new THREE.Group(); tagG.position.set(0.42, -0.62, 0.3); tagG.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), M('ink-2'), 0, -0.1, 0)); tagG.add(ball(0.07, M('warm', { roughness: 0.4 }), 0, -0.24, 0)); sw.add(tagG);
  g.userData.sw = sw; g.userData.tag = tagG; g.userData.act = t => { sw.rotation.z = Math.sin(t * Math.PI * 3) * (1 - t) * 0.6; }; }
{ /* bed — 이끼 침대. 높은 머리판(왼쪽)과 둥근 이불이 b 모양 · 조각 이불 */
  const g = thing('bed', ...P('Rc')), wood = M('a-wood', { roughness: 0.8 });
  const fr = rbox(2.2, 0.34, 1.35, 0.12, wood); fr.rotation.x = -Math.PI / 2; fr.position.y = 0.42; g.add(fr);
  [[-1, -0.55], [-1, 0.55], [1, -0.55], [1, 0.55]].forEach(l => g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 8), wood, l[0], 0.14, l[1])));
  { const hb = rbox(1.42, 1.5, 0.16, 0.5, wood); hb.rotation.y = Math.PI / 2; hb.position.set(-1.1, 1.0, 0); g.add(hb); const fb = rbox(1.42, 0.7, 0.14, 0.3, wood); fb.rotation.y = Math.PI / 2; fb.position.set(1.1, 0.62, 0); g.add(fb); }
  const mt = rbox(2.0, 0.26, 1.2, 0.12, M('stage-soft', { roughness: 0.95 })); mt.rotation.x = -Math.PI / 2; mt.position.y = 0.68; g.add(mt);
  const blanket = new THREE.Group(); blanket.position.set(0.32, 0.82, 0); g.add(blanket);
  { const b = rbox(1.3, 0.2, 1.24, 0.1, M(mix('a-leaf', 'stage-soft', 0.2), { roughness: 1 })); b.rotation.x = -Math.PI / 2; blanket.add(b);
    const quilt = canvasTex(128, 128, (c, w) => { const tones = [hex('stage-soft'), hex('a-pink'), hex('warm-soft'), hexOf(mix('a-fish', 'surface', 0.4)), hexOf(mix('a-leaf', 'surface', 0.35))], n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = tones[(i * 2 + j * 3) % tones.length]; c.fillRect(i * s, j * s, s, s); } c.strokeStyle = hex('surface'); c.lineWidth = 3; c.setLineDash([5, 5]); for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, w); c.moveTo(0, i * s); c.lineTo(w, i * s); c.stroke(); } });
    const q = new THREE.Mesh(new THREE.ShapeGeometry(rshape(1.22, 1.16, 0.12), 12), M(C('surface'), { map: quilt, roughness: 1 })); q.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v / (i % 2 ? 1.16 : 1.22) + 0.5; }); q.rotation.x = -Math.PI / 2; q.position.y = 0.105; q.receiveShadow = true; blanket.add(q); }
  const pillow = ball(0.36, M('surface', { roughness: 0.9 }), -0.62, 0.9, 0, 1, 0.5, 1.25); g.add(pillow);
  { const rug = new THREE.Mesh(new THREE.CircleGeometry(0.62, 28), M(mix('a-pink', 'a-cream', 0.4), { roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.4, 1, 1); rug.position.set(0.1, 0.012, 1.25); rug.receiveShadow = true; g.add(rug); }
  g.userData.act = t => { blanket.position.y = 0.82 + wave(t, 2) * 0.16; pillow.scale.y = 0.5 + wave(t, 2) * 0.2; }; }
{ /* bus — 통나무 버스(굴뚝에서 김 · 앞에 불 · 정류장 기둥) */
  const g = thing('bus', ...P('Re')), car = new THREE.Group(); car.position.y = 0.42; car.rotation.y = 0.15; car.scale.setScalar(0.82); g.add(car);
  const log = mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.9, 24), M('a-wood', { roughness: 0.9 }), 0, 0.72, 0); log.rotation.z = Math.PI / 2; car.add(log);
  [-1.46, 1.46].forEach(x2 => { const c = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.04, 24), M('a-cream', { roughness: 0.8 }), x2, 0.72, 0); c.rotation.z = Math.PI / 2; car.add(c); const r = mesh(new THREE.TorusGeometry(0.4, 0.025, 6, 24), M(mix('a-cream', 'a-wood', 0.5)), x2 + Math.sign(x2) * 0.03, 0.72, 0); r.rotation.y = Math.PI / 2; r.castShadow = false; car.add(r); });
  const glass = new THREE.MeshStandardMaterial({ color: C('warm-soft'), emissive: C('warm'), emissiveIntensity: 0.4, roughness: 0.3 });
  [-0.05, 0.8].forEach(x2 => { const wd = rbox(0.56, 0.5, 0.1, 0.14, glass); wd.position.set(x2, 0.95, 0.72); car.add(wd); const fr2 = rbox(0.66, 0.6, 0.06, 0.16, M(mix('a-wood', 'ink', 0.25))); fr2.position.set(x2, 0.95, 0.7); car.add(fr2); });
  { const door = rbox(0.5, 0.95, 0.08, 0.14, M(mix('a-red', 'a-wood', 0.3), { roughness: 0.6 })); door.position.set(-0.92, 0.72, 0.745); car.add(door); g.userData.door = door; { const hole = rbox(0.42, 0.86, 0.06, 0.12, M(mix('ink', 'a-wood', 0.35), { roughness: 0.9 })); hole.position.set(-0.92, 0.72, 0.715); car.add(hole); } car.add(ball(0.04, M('a-gold', { metalness: 0.5, roughness: 0.3 }), -0.76, 0.7, 0.79)); }
  const lamps = [-1, 1].map(s => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: C('warm-soft'), emissive: C('warm'), emissiveIntensity: 0.9, roughness: 0.3 })); l.position.set(-1.5, 0.5, s * 0.38); l.scale.x = 0.5; car.add(l); return l; });
  { const bp = rbox(0.16, 0.16, 1.5, 0.07, M('ink-2', { roughness: 0.5 })); bp.position.set(-1.52, 0.16, 0); car.add(bp); }
  [[-0.95, 0.6], [0.95, 0.6], [-0.95, -0.6], [0.95, -0.6]].forEach(w2 => { const wh = mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 20), M('ink', { roughness: 0.6 }), w2[0], 0, w2[1]); wh.rotation.x = Math.PI / 2; car.add(wh); const hub = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 12), M('a-cream'), w2[0], 0, w2[1]); hub.rotation.x = Math.PI / 2; car.add(hub); });
  car.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 12), M('ink-2', { roughness: 0.5 }), 0.9, 1.7, 0)); car.add(ball(0.3, M('a-red', { roughness: 0.5 }), -1.2, 1.5, 0, 1.2, 0.35, 1.2));
  const steam = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshStandardMaterial({ color: C('surface'), transparent: true, opacity: 0, roughness: 1, depthWrite: false })); m.position.set(0.9, 2.0, 0); car.add(m); steam.push({ m, t: i / 6 }); }
  { const stop = new THREE.Group(); stop.position.set(P('Re')[0] + 1.75, 0, P('Re')[1] - 0.8); stop.add(mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.4, 8), M('ink-2', { roughness: 0.5 }), 0, 0.7, 0)); const d = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24), M('a-fish', { roughness: 0.5 }), 0, 1.55, 0); d.rotation.x = Math.PI / 2; stop.add(d); const d2 = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.07, 24), M('a-cream', { roughness: 0.6 }), 0, 1.55, 0); d2.rotation.x = Math.PI / 2; stop.add(d2); glade.add(stop); }
  g.userData.steam = steam; g.userData.car = car; g.userData.lamps = lamps; g.userData.act = t => { car.position.y = 0.42 + Math.abs(Math.sin(t * Math.PI * 4)) * 0.12; car.rotation.z = Math.sin(t * Math.PI * 4) * 0.03; lamps.forEach(l => { l.material.emissiveIntensity = 0.9 + wave(t, 4) * 1.6; }); }; }
{ /* bird — b 나무 가지 위의 통통한 새(누르면 깃을 턴다) */
  const g = thing('bird', P('treeR')[0] + 1.9, P('treeR')[1] + 1.2), blue = M(mix('a-fish', 'word-blue', 0.35), { roughness: 0.6 }), deep = M(mix('a-fish', 'ink', 0.25), { roughness: 0.6 });
  { const br = mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.4, 8), M('a-wood', { roughness: 0.85 }), -0.9, 2.05, -0.4); br.rotation.z = -1.35; br.rotation.y = -0.4; g.add(br); g.add(ball(0.2, M(mix('a-leaf', 'a-fish', 0.35)), 0.38, 2.36, 0.25, 1.4, 0.5, 1)); }
  const b = new THREE.Group(); b.position.set(0, 2.42, 0); b.rotation.y = -2.2; g.add(b);
  b.add(ball(0.4, blue, 0, 0.1, 0, 1, 0.95, 0.95)); b.add(ball(0.27, blue, 0.18, 0.5, 0)); b.add(ball(0.26, M('a-cream'), 0.12, 0, 0.12, 0.9, 0.8, 0.9));
  { const bk = mesh(new THREE.ConeGeometry(0.08, 0.2, 8), M('a-gold', { roughness: 0.4 }), 0.46, 0.48, 0); bk.rotation.z = -Math.PI / 2; b.add(bk); const cr = ball(0.09, deep, 0.1, 0.78, 0, 1.4, 0.8, 0.6); cr.rotation.z = 0.5; b.add(cr); }
  [-1, 1].forEach(s => { b.add(ball(0.045, M('ink', { roughness: 0.2 }), 0.33, 0.57, s * 0.14)); b.add(ball(0.016, M('surface', { roughness: 0.1 }), 0.365, 0.59, s * 0.145)); b.add(ball(0.05, M('cheek', { roughness: 0.8 }), 0.3, 0.46, s * 0.2, 1, 0.6, 0.5)); });
  const wings = [-1, 1].map(s => { const w2 = new THREE.Group(); w2.position.set(-0.05, 0.2, s * 0.34); w2.add(ball(0.24, deep, 0, -0.08, 0, 1.2, 0.8, 0.3)); w2.add(ball(0.16, deep, -0.2, -0.16, 0, 1.3, 0.6, 0.25)); b.add(w2); return w2; });
  { const tl = ball(0.18, deep, -0.48, 0.18, 0, 1.6, 0.3, 0.7); tl.rotation.z = 0.5; b.add(tl); }
  [-0.08, 0.08].forEach(z2 => b.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 5), M('a-gold'), 0, -0.34, z2)));
  g.userData.wings = wings; g.userData.b = b; g.userData.act = t => { b.position.y = 2.42 + wave(t, 2) * 0.28; wings.forEach((w2, i) => { w2.rotation.x = (i ? 1 : -1) * Math.abs(wave(t, 6)) * 1.1; }); b.rotation.z = Math.sin(t * Math.PI * 6) * 0.08; }; }
  return things;
}

/* 매 장면 — 살아 있는 것(빛바랜 물건은 가만히) */
export function stepThings(things, dt, t){
  const live = w => !things[w].userData.faded;
  if (live('ant')) things.ant.userData.ants.forEach(a => { const k = (a.userData.k + t * 0.07) % 1, ang = k * Math.PI * 2; a.position.x = Math.cos(ang) * 1.05; a.position.z = Math.sin(ang) * 0.62; a.rotation.y = -ang - Math.PI / 2; if (!things.ant.userData.busy) a.position.y = Math.abs(Math.sin(t * 9 + a.userData.k * 20)) * 0.03; a.userData.bit.position.y = 0.36 + Math.sin(t * 9 + a.userData.k * 20) * 0.015; });
  if (live('alligator')) { const al = things.alligator.userData; if (!things.alligator.userData.busy) { al.body.position.y = 0.02 + Math.sin(t * 1.1) * 0.05; al.jaw.rotation.z = Math.max(0, Math.sin(t * 0.5)) * 0.06; } if (!al.wag) al.tail.rotation.y = Math.sin(t * 1.3) * 0.22; al.eyes.forEach(e => e.scale.y = (t % 4.2 < 0.14) ? 0.15 : 1); }
  if (live('bus')) things.bus.userData.steam.forEach(s => { s.t = (s.t + dt * 0.3) % 1; const k = s.t; s.m.position.set(0.9 + Math.sin(k * 7) * 0.12, 2.0 + k * 1.5, Math.cos(k * 5) * 0.08); s.m.scale.setScalar(0.5 + k * 1.3); s.m.material.opacity = Math.sin(k * Math.PI) * 0.6; });
  if (live('bus') && !things.bus.userData.busy) things.bus.userData.car.position.y = 0.42 + Math.sin(t * 22) * 0.006;
  if (live('bird') && !things.bird.userData.busy) { const b = things.bird.userData.b; b.rotation.y = -2.2 + Math.sin(t * 0.7) * 0.45; b.position.y = 2.42 + (t % 3.1 < 0.25 ? Math.sin((t % 3.1) / 0.25 * Math.PI) * 0.1 : 0); }
  if (live('bag') && !things.bag.userData.busy) things.bag.userData.sw.rotation.z = Math.sin(t * 1.3) * 0.04; things.bag.userData.tag.rotation.z = Math.sin(t * 2.6) * 0.3;
  if (live('apple') && !things.apple.userData.busy) things.apple.userData.a.rotation.z = Math.sin(t * 1.2) * 0.035;
}

/* ── 씨앗 단계가 물건에 보인다 — 빛바램 · 선반의 나무 조각 · 아이 글씨 이름표 ── */
export function shelves(K, glade, things, o){
  const { THREE, M, C, mix, mesh, rbox, canvasTex, hex, letterTex } = K;
  const SH = {}, made = {}, base = new Map();
  /* 선반 둘 — 제 나무 앞(왼쪽 = 첫 글자 · 오른쪽 = 둘째 글자) · 처음엔 빈 판자 */
  const wood = M(mix('a-wood', 'warm', 0.15), { roughness: 0.85 }), dark = M(mix('a-wood', 'ink', 0.2), { roughness: 0.9 });
  const boards = ['left', 'right'].map(side => { const at = o[side], g = new THREE.Group(); g.position.set(at[0], 0, at[1]); g.rotation.y = at[2] || 0;
    const top = rbox(1.9, 0.12, 0.62, 0.05, wood); top.rotation.x = -Math.PI / 2; top.position.y = 0.62; g.add(top);
    [-0.75, 0.75].forEach(x => g.add(mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.58, 10), dark, x, 0.29, 0)));
    g.userData = { used: 0 }; glade.add(g); return g; });
  const sideOf = w => (o.letterOf(w) === o.letters[0] ? 0 : 1);
  function eachMat(root, fn){ root.traverse(m => { if (m.isMesh && m.material && m.material.color) fn(m); }); }
  /* 빛바램 — 재질 색을 바탕색 쪽으로(되돌릴 수 있게 처음 색을 기억) */
  function fade(w, on){ const g = things[w]; if (!g) return; g.userData.faded = !!on; const pale = C('bg');
    eachMat(g, m => { if (!m.material.userData.own) { m.material = m.material.clone(); m.material.userData.own = 1; base.set(m.material, m.material.color.clone()); }
      const c0 = base.get(m.material); m.material.color.copy(on ? c0.clone().lerp(pale, 0.55) : c0); }); }
  /* 작은 나무 조각 — 그 물건을 나무로 깎은 모양(본을 떠서 나무 재질로) */
  function piece(w){ if (made[w]) return made[w]; const src = things[w], side = boards[sideOf(w)], k = side.userData.used++;
    const g = new THREE.Group(), copy = src.clone(true); copy.position.set(0, 0, 0); copy.rotation.set(0, 0, 0); copy.scale.setScalar(1);
    const carve = M(mix('a-wood', 'a-cream', 0.35), { roughness: 0.8 }); copy.traverse(m => { if (m.isMesh) { m.material = carve; m.castShadow = true; } if (m.isPoints) m.visible = false; });
    const box = new THREE.Box3().setFromObject(copy), size = box.getSize(new THREE.Vector3()), s = 0.56 / Math.max(size.x, size.y, size.z, 0.01);
    copy.scale.setScalar(s); copy.position.y = -box.min.y * s; g.add(copy);
    g.position.set(-0.66 + (k % 4) * 0.44, 0.68, (k >= 4 ? -0.14 : 0.06)); side.add(g); made[w] = g; return g; }
  /* 이름표 — 아이가 쓴 첫 글자(없으면 글자 자료의 획) */
  function tag(w, ink){ const g = piece(w); if (g.userData.tag) return; const l = w.charAt(0);
    const tex = canvasTex(96, 96, (c, W) => { c.fillStyle = hex('a-cream'); c.beginPath(); c.arc(W / 2, W / 2, W / 2 - 2, 0, 7); c.fill(); c.strokeStyle = hex('ink');
      if (!(ink && window.PlayWrite && window.PlayWrite.draw(ink, c, { x: 14, y: 10, w: W - 28, h: W - 20 }))) { const lt = letterTex(l, hex('ink'), null).image; c.drawImage(lt, 8, 8, W - 16, W - 16); } });
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(0.16, 0.05, 0.22); g.add(m); g.userData.tag = m; }
  SH.set = (w, stage, ink) => { if (!things[w]) return; fade(w, stage < 0); if (stage >= 2) piece(w); if (stage >= 3) tag(w, ink); };
  SH.boards = boards; SH.pieces = made;
  return SH;
}
