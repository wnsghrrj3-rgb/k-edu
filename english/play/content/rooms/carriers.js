/* ============================================================
 * 영어 놀이터 — 글자 그릇 상자(rooms/carriers) (WD0 · 다름 설계 v1 §2 ⑦ · §6)
 *   그 걸음의 글자를 들고 있는 물건. 그 무대에 원래 있는 것이어야 한다 — 둥근 열매는 사과나무 빈터(A01)에만 남는다.
 *   그릇 하나 = 모델 + 글자가 붙는 자리(label) + 처음 나타나는 법(appear) + 꽃 · 열매 단계의 모습(stage)
 *     const c = carrier(K, kind, { letter, tone, r })   → THREE.Group
 *     c.userData = { kind, letter, label(글자 판 — 한 장 보기에서는 가린다), s(바탕 크기), appear(k 0→1), stage(n — 2 꽃 · 3 열매) }
 *   어느 그릇이든 글자 판은 +z(보는 쪽)를 향하고, 누르는 크기는 반지름 0.5 안팎으로 같다 — 판정이 그릇에 따라 달라지지 않게.
 *   그릇을 더하는 법: CARRIERS 에 이름 하나. 같은 모델을 색만 바꿔 다른 걸음에 다시 쓰지 않는다(N7).
 *   이번에 지은 것(A01~A05): fruit 사과나무 열매 / saucer 찻잔 받침 · bowl 밥그릇 / eggshell 알 껍데기 · fin 물고기 지느러미 / pawn 놀이판 말 · hatband 모자 띠 / icecube 얼음 조각 · jamlid 잼 병 뚜껑
 *   WA2 에서 더한 것(A06~A09): ribbon 연 꼬리 리본 · lampshade 등불 갓 / moondisc 달 · nestegg 둥지 알 / sucker 문어 빨판 · potlid 냄비 뚜껑 / quiltpatch 누비이불 조각 · ripple 웅덩이 파문
 *   색은 토큰 이름만(코드에 색 값 0).
 * ============================================================ */
function disc(K, letter, r, z, y = 0){ const { THREE } = K, sp = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ map: K.letterTex(letter, K.hex('ink'), K.hex('a-cream')) })); sp.position.set(0, y, z); return sp; }
function done(K, g, kind, o, label, appear){ const bloom = new K.THREE.Group(); bloom.visible = false; g.add(bloom);      /* 꽃 단계 — 그릇 위에 작은 꽃 · 열매 단계 — 금빛 테 */
  [0, 1.26, 2.51, 3.77, 5.03].forEach(a => bloom.add(K.ball(0.07, K.M('a-pink', { roughness: 0.6 }), Math.cos(a) * 0.09, 0.62, Math.sin(a) * 0.09, 1, 0.55, 1))); bloom.add(K.ball(0.05, K.M('warm'), 0, 0.64, 0));
  const rim = K.mesh(new K.THREE.TorusGeometry(0.4, 0.03, 8, 32), K.M('a-gold', { metalness: 0.6, roughness: 0.3 }), 0, 0.02, label.position.z + 0.01); rim.visible = false; rim.castShadow = false; g.add(rim);
  g.userData = { kind, letter: o.letter, label, s: 1, appear: appear || (k => g.scale.setScalar(Math.max(0.01, k))), stage: n => { bloom.visible = n >= 2; rim.visible = n >= 3; } }; return g; }
export const CARRIERS = {
  /* 사과나무의 열매 — 가지 끝에 매달린 큰 열매(A01 기준판 그대로 · 열매는 이 걸음뿐이다) */
  fruit(K, o){ const { THREE, M, mesh, ball } = K, r = o.r || 0.52, g = new THREE.Group();
    g.add(ball(r, M(o.tone || 'a-red', { roughness: 0.35 }), 0, 0, 0, 1, 0.95, 1)); g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), M('a-wood'), 0, 0.7, 0));
    { const lf = ball(0.18, M('a-leaf'), 0.16, 0.56, 0, 1.3, 0.25, 0.7); lf.rotation.z = -0.5; g.add(lf); }
    const sp = disc(K, o.letter, 0.36, r + 0.025, 0.02); sp.position.x = 0.07; sp.rotation.y = 0.12; g.add(sp); return done(K, g, 'fruit', o, sp); },
  /* 찻잔 받침 — 납작한 접시를 세워 보인다(가운데 오목한 자리에 글자) */
  saucer(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), m = M(o.tone || 'surface', { roughness: 0.3 }), p = new THREE.Group(); p.rotation.x = Math.PI / 2 - 0.35; g.add(p);
    p.add(mesh(new THREE.CylinderGeometry(0.56, 0.5, 0.06, 28), m, 0, 0, 0)); { const r1 = mesh(new THREE.TorusGeometry(0.54, 0.03, 8, 32), M('a-gold', { metalness: 0.5, roughness: 0.3 }), 0, 0.03, 0); r1.rotation.x = Math.PI / 2; p.add(r1); }
    p.add(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 24), M('a-cream', { roughness: 0.5 }), 0, 0.035, 0));
    const sp = disc(K, o.letter, 0.3, 0.06); sp.rotation.x = -0.35; g.add(sp); return done(K, g, 'saucer', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.rotation.z = (1 - k) * 2.5; }); },
  /* 강아지 밥그릇 — 기울인 그릇의 바닥에 글자 */
  bowl(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), m = M(o.tone || 'a-fish', { roughness: 0.5, side: THREE.DoubleSide }), p = new THREE.Group(); p.rotation.x = Math.PI / 2 - 0.5; g.add(p);
    p.add(mesh(new THREE.CylinderGeometry(0.56, 0.36, 0.34, 26, 1, true), m, 0, 0.17, 0)); p.add(mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 26), m, 0, 0.015, 0));
    [-0.3, 0.3].forEach(x => p.add(K.ball(0.07, M('a-cream', { roughness: 0.6 }), x, 0.2, 0.52, 1.6, 0.7, 0.5)));
    const sp = disc(K, o.letter, 0.28, 0.02, 0.03); sp.rotation.x = -0.5; g.add(sp); return done(K, g, 'bowl', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.position.y += 0; }); },
  /* 알 껍데기 — 반으로 깨진 껍데기 안쪽에 글자 */
  eggshell(K, o){ const { THREE, M } = K, g = new THREE.Group(), m = M(o.tone || 'a-cream', { roughness: 0.45, side: THREE.DoubleSide });
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.56, 28, 18, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), m); sh.scale.set(1, 1.2, 0.8); sh.castShadow = true; g.add(sh);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, t = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 3), m); t.position.set(Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.4); t.rotation.y = -a; g.add(t); }
    const sp = disc(K, o.letter, 0.3, 0.46, -0.2); g.add(sp); return done(K, g, 'eggshell', o, sp, k => { g.scale.set(Math.max(0.01, k), Math.max(0.01, k * (2 - k)), Math.max(0.01, k)); }); },
  /* 물고기 지느러미 — 물 위로 솟은 등지느러미에 글자 */
  fin(K, o){ const { THREE, M } = K, g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(-0.6, -0.42); sh.quadraticCurveTo(-0.35, 0.5, 0.42, 0.62); sh.quadraticCurveTo(0.3, 0.1, 0.6, -0.42); sh.lineTo(-0.6, -0.42);
    const f = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), M(o.tone || 'warm', { roughness: 0.4 })); f.position.z = -0.05; f.castShadow = true; g.add(f);
    [-0.25, 0, 0.25].forEach(x => { const l = K.mesh(new THREE.BoxGeometry(0.03, 0.6, 0.02), M('a-gold', { roughness: 0.4 }), x, -0.05, 0.09); l.rotation.z = -0.25; l.castShadow = false; g.add(l); });
    const sp = disc(K, o.letter, 0.27, 0.11, -0.05); g.add(sp); return done(K, g, 'fin', o, sp, k => { g.scale.setScalar(1); g.position.y = (g.userData.y0 || 0) - (1 - k) * 1.2; }); },
  /* 놀이판의 말 — 둥근 머리의 말, 몸통에 글자 */
  pawn(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), m = M(o.tone || 'a-red', { roughness: 0.4 });
    g.add(mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.14, 22), m, 0, -0.42, 0)); g.add(mesh(new THREE.CylinderGeometry(0.3, 0.44, 0.7, 22), m, 0, -0.05, 0)); g.add(ball(0.3, m, 0, 0.5, 0)); { const c = mesh(new THREE.TorusGeometry(0.26, 0.05, 8, 24), m, 0, 0.3, 0); c.rotation.x = Math.PI / 2; g.add(c); }
    const sp = disc(K, o.letter, 0.27, 0.4, -0.08); g.add(sp); return done(K, g, 'pawn', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.position.y = (g.userData.y0 || 0) + Math.sin(k * Math.PI) * 0.6; }); },
  /* 모자 띠 — 밀짚모자의 띠에 글자 */
  hatband(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), st = M('a-gold', { roughness: 0.85 }), p = new THREE.Group(); p.rotation.x = 0.5; g.add(p);
    p.add(mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.04, 28), st, 0, -0.3, 0)); p.add(mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.5, 24), st, 0, -0.04, 0)); p.add(mesh(new THREE.CylinderGeometry(0.405, 0.41, 0.2, 24), M(o.tone || 'a-red', { roughness: 0.6 }), 0, -0.14, 0));
    const sp = disc(K, o.letter, 0.26, 0.47, -0.02); sp.rotation.x = 0.1; g.add(sp); return done(K, g, 'hatband', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.rotation.y = (1 - k) * 4; }); },
  /* 얼음 조각 — 맑은 얼음 속에 언 글자 */
  icecube(K, o){ const { M } = K, g = new K.THREE.Group(), ice = M(K.mix('a-fish', 'word-blue', 0.25), { roughness: 0.12, transparent: true, opacity: 0.6 });
    const b = K.rbox(0.96, 0.96, 0.7, 0.14, ice); g.add(b); g.add(K.ball(0.1, M('surface', { transparent: true, opacity: 0.6 }), -0.28, 0.3, 0.3, 1.6, 0.5, 0.4));
    const sp = disc(K, o.letter, 0.3, 0.1); g.add(sp); return done(K, g, 'icecube', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); ice.opacity = 0.95 - k * 0.35; }); },
  /* 잼 병 뚜껑 — 체크무늬 천을 씌운 뚜껑 */
  jamlid(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), p = new THREE.Group(); p.rotation.x = Math.PI / 2 - 0.3; g.add(p);
    p.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.16, 28), M('a-gold', { metalness: 0.4, roughness: 0.35 }), 0, 0, 0)); p.add(mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.05, 12), M(o.tone || 'a-red', { roughness: 0.8 }), 0, 0.09, 0));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.add(K.ball(0.07, M(o.tone || 'a-red', { roughness: 0.8 }), Math.cos(a) * 0.6, 0.04, Math.sin(a) * 0.6, 1, 0.6, 1)); }
    const sp = disc(K, o.letter, 0.3, 0.16, 0.02); sp.rotation.x = -0.3; g.add(sp); return done(K, g, 'jamlid', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.position.y = (g.userData.y0 || 0) + (1 - k) * 0.5; }); },
  /* 연 꼬리 리본 — 바람에 접힌 넓은 리본 한 장(A06) */
  ribbon(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), m = M(o.tone || 'a-red', { roughness: 0.6, side: THREE.DoubleSide });
    const mid = mesh(new THREE.BoxGeometry(0.98, 0.66, 0.05), m, 0, 0, 0); g.add(mid); [-1, 1].forEach(sd => { const w = mesh(new THREE.BoxGeometry(0.44, 0.5, 0.04), m, sd * 0.62, -0.08, -0.08); w.rotation.y = sd * 0.7; w.rotation.z = sd * -0.25; g.add(w); });
    g.add(ball(0.09, M('a-gold', { metalness: 0.4, roughness: 0.4 }), 0, 0.42, 0)); { const st = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), M('ink-2'), 0, 0.78, 0); st.castShadow = false; g.add(st); }      /* 매듭과 연줄 */
    const sp = disc(K, o.letter, 0.3, 0.035); g.add(sp); return done(K, g, 'ribbon', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.rotation.y = (1 - k) * 3; }); },
  /* 등불 갓 — 아래가 넓은 갓, 안에서 빛이 샌다(A06) */
  lampshade(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), m = M(o.tone || 'a-gold', { roughness: 0.5, side: THREE.DoubleSide });
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.6, 0.72, 18, 1, true), m, 0, 0, 0)); g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 18), M('a-wood'), 0, 0.37, 0)); g.add(mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 14), M('a-wood'), 0, 0.5, 0));
    { const gl = ball(0.2, new THREE.MeshBasicMaterial({ color: K.mix('warm-soft', 'surface', 0.4) }), 0, -0.22, 0); gl.castShadow = false; g.add(gl); }      /* 등불 */
    const sp = disc(K, o.letter, 0.27, 0.47, -0.02); sp.rotation.x = -0.36; g.add(sp); return done(K, g, 'lampshade', o, sp); },
  /* 달 — 둥근 달이 물그릇처럼 떠 있고 테두리가 빛난다(A07) */
  moondisc(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group();
    { const d = mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.08, 36), M(o.tone || K.mix('surface', 'a-gold', 0.2), { roughness: 0.35 }), 0, 0, 0); d.rotation.x = Math.PI / 2; g.add(d); const h = mesh(new THREE.TorusGeometry(0.6, 0.035, 8, 40), new THREE.MeshBasicMaterial({ color: K.mix('surface', 'a-fish', 0.25) }), 0, 0, 0); h.castShadow = false; g.add(h); }
    [[-0.28, 0.24, 0.1], [0.3, -0.2, 0.07], [0.18, 0.3, 0.05]].forEach(c => { const cr = mesh(new THREE.CylinderGeometry(c[2], c[2], 0.01, 12), M(K.mix('a-steel', 'surface', 0.6), { roughness: 0.6 }), c[0], c[1], 0.045); cr.rotation.x = Math.PI / 2; cr.castShadow = false; g.add(cr); });      /* 달 무늬 */
    const sp = disc(K, o.letter, 0.3, 0.05); g.add(sp); return done(K, g, 'moondisc', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.position.y += 0; }); },
  /* 둥지 알 — 지푸라기 둥지에 앉은 큰 알(A07) */
  nestegg(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), straw = M(K.mix('a-gold', 'a-wood', 0.45), { roughness: 0.95 });
    { const n1 = mesh(new THREE.TorusGeometry(0.46, 0.14, 8, 22), straw, 0, -0.34, 0); n1.rotation.x = Math.PI / 2; g.add(n1); const n2 = mesh(new THREE.CylinderGeometry(0.44, 0.34, 0.14, 18), straw, 0, -0.4, 0); g.add(n2); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, tw = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 4), straw, Math.cos(a) * 0.52, -0.3, Math.sin(a) * 0.52); tw.rotation.z = Math.cos(a) * 1.1; tw.rotation.x = Math.sin(a) * 1.1; tw.castShadow = false; g.add(tw); }
    g.add(ball(0.42, M(o.tone || 'a-cream', { roughness: 0.4 }), 0, 0.08, 0, 1, 1.22, 1));
    const sp = disc(K, o.letter, 0.27, 0.41, 0.1); g.add(sp); return done(K, g, 'nestegg', o, sp); },
  /* 문어 빨판 — 문어 다리 끝이 말려 올라오고, 큰 빨판 하나에 글자(A08) */
  sucker(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), skin = M(o.tone || 'a-plum', { roughness: 0.5 }), pale = M(K.mix(o.tone || 'a-plum', 'a-cream', 0.6), { roughness: 0.5 });
    for (let i = 0; i < 6; i++) { const a = i / 5 * 2.2 - 0.3, r = 0.5 - i * 0.03; g.add(ball(0.2 - i * 0.02, skin, -Math.cos(a) * r - 0.1, -0.5 + Math.sin(a) * r * 1.1 + i * 0.07, -0.05, 1, 1, 0.9)); }      /* 말린 다리 */
    { const cup = mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.16, 28), pale, 0.08, 0.05, 0); cup.rotation.x = Math.PI / 2; g.add(cup); const rim = mesh(new THREE.TorusGeometry(0.52, 0.06, 8, 30), skin, 0.08, 0.05, 0.08); rim.castShadow = false; g.add(rim); }
    const sp = disc(K, o.letter, 0.3, 0.14, 0.05); sp.position.x = 0.08; g.add(sp); return done(K, g, 'sucker', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.rotation.z = (1 - k) * -1.2; }); },
  /* 냄비 뚜껑 — 손잡이 달린 둥근 뚜껑을 세워 보인다(A08) */
  potlid(K, o){ const { THREE, M, mesh, ball } = K, g = new THREE.Group(), m = M(o.tone || 'a-steel', { roughness: 0.3, metalness: 0.5 }), p = new THREE.Group(); p.rotation.x = Math.PI / 2 - 0.25; g.add(p);
    p.add(mesh(new THREE.CylinderGeometry(0.58, 0.6, 0.07, 30), m, 0, 0, 0)); { const dome = ball(0.5, m, 0, 0.02, 0, 1, 0.22, 1); p.add(dome); }
    { const kn = ball(0.11, M('a-red', { roughness: 0.4 }), 0, 0.56, 0.12); g.add(kn); const st = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), M('ink-2'), 0, 0.5, 0.1); g.add(st); }      /* 손잡이 */
    const sp = disc(K, o.letter, 0.3, 0.13, 0); sp.rotation.x = -0.25; g.add(sp); return done(K, g, 'potlid', o, sp); },
  /* 누비이불 조각 — 바느질 선이 있는 네모 천 한 장(A09 — q 는 u 와 붙어 qu 로 적힌다) */
  quiltpatch(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), tn = [o.tone || 'a-plum', 'a-pink', 'a-gold', 'a-fish'];
    for (let i = 0; i < 4; i++) g.add(mesh(new THREE.BoxGeometry(0.52, 0.52, 0.09), M(tn[i], { roughness: 0.95 }), (i % 2 ? 0.27 : -0.27), (i < 2 ? 0.27 : -0.27), 0));
    [[0, 0, 1.1, 0.03], [0, 0, 0.03, 1.1]].forEach(b => { const st = mesh(new THREE.BoxGeometry(b[2], b[3], 0.1), M('a-cream', { roughness: 0.9 }), b[0], b[1], 0.005); st.castShadow = false; g.add(st); });      /* 바느질 선 */
    g.rotation.z = 0.06; const sp = disc(K, o.letter, 0.33, 0.06); g.add(sp); return done(K, g, 'quiltpatch', o, sp, k => { g.scale.setScalar(Math.max(0.01, k)); g.rotation.z = 0.06 + (1 - k) * 1.5; }); },
  /* 웅덩이 파문 — 겹겹이 번지는 물 동그라미(A09) */
  ripple(K, o){ const { THREE, M, mesh } = K, g = new THREE.Group(), w = M(o.tone || K.mix('a-fish', 'surface', 0.3), { roughness: 0.15, metalness: 0.1 });
    { const d = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 36), w, 0, 0, 0); d.rotation.x = Math.PI / 2 - 0.3; g.add(d); }
    [0.56, 0.42, 0.28].forEach((r, i) => { const t = mesh(new THREE.TorusGeometry(r, 0.022, 6, 36), new THREE.MeshBasicMaterial({ color: K.mix('surface', 'a-fish', 0.15 + i * 0.1) }), 0, 0, 0.035); t.rotation.x = -0.3; t.castShadow = false; g.add(t); });
    { const dp = K.ball(0.07, M('surface', { roughness: 0.2 }), 0.2, 0.62, 0.05, 0.8, 1.3, 0.8); g.add(dp); }      /* 떨어지는 빗방울 */
    const sp = disc(K, o.letter, 0.26, 0.05); sp.rotation.x = -0.3; g.add(sp); return done(K, g, 'ripple', o, sp); }
};
export const hasCarrier = k => !!CARRIERS[k];
export function carrier(K, kind, o){ const f = CARRIERS[kind]; if (!f) throw new Error('없는 글자 그릇 ' + kind); return f(K, o || {}); }
