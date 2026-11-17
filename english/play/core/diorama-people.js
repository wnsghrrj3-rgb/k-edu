/* ============================================================
 * 영어 놀이터 — 입체 인물(diorama-people) (W15 · 설계 v2 §7)
 *   머리 큰 2.5등신 — 눈을 깜박이고, 말할 때 입이 움직이고, 보는 쪽으로 고개를 돌린다. 빈터 시험판에서 뽑아 냈다.
 *   const p = makePerson(K, { skin, hair, shirt, scarf?, pocket?, buns?, bow?, cap?, pants?, shoe? })
 *   stepPeople(K, people, dt, t, { leader, look, body, head, idleLook })   매 장면 — 몸짓은 부드럽게 이어진다
 *   p.userData.mood:
 *     'idle' 서기 · 'happy' 기쁨(폴짝 · 두 손 위로) · 'wave' 두 손을 좌우로(흔들기 시범) · 'ear' 귀에 손(네 말을 듣는다) ·
 *     'lead' 발 구르기(박자 · userData.stomp = 1 로 한 번 구른다) · 'point' 보는 것을 가리킨다 · 'lift' 한 손에 번쩍 · 'speak' 두 손을 입가에(따라 말한다) · 'tilt' 갸웃
 *   p.userData.look = 볼 물건(없으면 천천히 두리번) · p.userData.talk = 말하는 중이면 1 이상(입) · p.userData.hop = 1 이면 한 번 폴짝
 *   ⏳ 걷기는 아직 — 지금 장면은 서서 하는 몸짓만 쓴다(걷는 장면이 생기면 여기 더한다).
 * ============================================================ */
/* 몸짓 이름 — 방 자료의 how.body 가 고른다(챈트 몸짓은 걸음마다 다르다) */
export const MOODS = ['idle', 'happy', 'wave', 'ear', 'lead', 'point', 'lift', 'speak', 'tilt', 'knee', 'clink', 'trunk', 'horns', 'jump'];
export const BEAT_MOODS = ['lead', 'knee', 'clink', 'trunk', 'horns', 'jump'];      /* 박자(stomp)를 타는 몸짓 */
export const PEOPLE = {
  /* 이름 있는 사람들의 겉모습(빈터의 셋 — 뒤 걸음도 같은 사람) */
  max:  { skin: 'skin-3', hair: 'hair-1', shirt: 'stage', scarf: 'warm', pocket: 'stage-deep' },
  mina: { skin: 'skin-1', hair: 'hair-2', shirt: 'a-gold', buns: true, bow: 'a-pink', pants: 'stage-2', shoe: 'a-red' },
  me:   { skin: 'skin-2', hair: 'hair-3', shirt: 'a-fish', cap: 'word-blue', pocket: 'surface' }
};

export function makePerson(K, o){
  const { THREE, M, mesh, ball, rbox, mix } = K;
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = M(o.skin, { roughness: 0.55 }), hair = M(o.hair, { roughness: 0.75 }), shirt = M(o.shirt, { roughness: 0.8 }), dark = M('ink', { roughness: 0.3 });
  [-1, 1].forEach(s => { body.add(mesh(new THREE.CapsuleGeometry(0.12, 0.16, 6, 10), M(o.pants || 'ink-2', { roughness: 0.8 }), s * 0.17, 0.3, 0)); body.add(ball(0.15, M(o.shoe || 'a-wood', { roughness: 0.6 }), s * 0.18, 0.09, 0.07, 1, 0.62, 1.5)); });
  body.add(mesh(new THREE.CapsuleGeometry(0.36, 0.4, 8, 18), shirt, 0, 0.86, 0));
  if (o.scarf) { const sc = mesh(new THREE.TorusGeometry(0.3, 0.06, 10, 24), M(o.scarf, { roughness: 0.8 }), 0, 1.2, 0); sc.rotation.x = Math.PI / 2; body.add(sc); }
  if (o.pocket) { const pk = rbox(0.3, 0.22, 0.06, 0.07, M(o.pocket, { roughness: 0.8 })); pk.position.set(0, 0.78, 0.35); body.add(pk); }
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.42, 1.1, 0); a.rotation.order = 'YXZ'; a.add(mesh(new THREE.CapsuleGeometry(0.1, 0.34, 6, 10), shirt, 0, -0.2, 0)); a.add(ball(0.11, skin, 0, -0.45, 0)); a.rotation.z = s * 0.15; body.add(a); return a; });
  const head = new THREE.Group(); head.position.y = 1.62; body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.55, 32, 24), skin));
  [-1, 1].forEach(s => head.add(ball(0.1, skin, s * 0.53, -0.04, 0, 0.6, 1, 1)));
  const hc = mesh(new THREE.SphereGeometry(0.58, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), hair, 0, 0.04, -0.05); hc.rotation.x = -0.35; head.add(hc);
  if (o.buns) { [-1, 1].forEach(s => head.add(ball(0.2, hair, s * 0.42, 0.42, -0.12))); if (o.bow) [-1, 1].forEach(s => head.add(ball(0.09, M(o.bow, { roughness: 0.6 }), 0.42 + s * 0.09, 0.6, -0.04, 1.2, 0.8, 0.6))); }
  else head.add(ball(0.22, hair, 0.05, 0.55, 0.05, 1.4, 0.6, 1));
  if (o.cap) { const cp = mesh(new THREE.SphereGeometry(0.6, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), M(o.cap, { roughness: 0.7 }), 0, 0.06, -0.02); cp.rotation.x = -0.18; head.add(cp); const brim = ball(0.3, M(o.cap, { roughness: 0.7 }), 0, 0.3, 0.5, 1.15, 0.14, 0.9); brim.rotation.x = 0.25; head.add(brim); }
  const eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.18, 0.03, 0.5); e.add(ball(0.06, dark)); e.add(ball(0.02, M('surface', { roughness: 0.1 }), 0.02, 0.025, 0.05)); e.scale.y = 1.35; head.add(e); return e; });
  const brows = [-1, 1].map(s => { const b = mesh(new THREE.CapsuleGeometry(0.016, 0.09, 4, 6), hair, s * 0.18, 0.21, 0.5); b.rotation.z = Math.PI / 2 + s * 0.12; b.castShadow = false; head.add(b); return b; });
  [-1, 1].forEach(s => head.add(ball(0.09, M('cheek', { roughness: 0.8 }), s * 0.3, -0.12, 0.44, 1, 0.6, 0.4)));
  const mouth = mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 20, Math.PI), dark, 0, -0.14, 0.52); mouth.rotation.z = Math.PI; head.add(mouth);
  const open = ball(0.075, M(mix('a-red', 'ink', 0.45), { roughness: 0.6 }), 0, -0.19, 0.51, 1.1, 0.6, 0.5); open.visible = false; open.castShadow = false; head.add(open);
  g.userData = { body, head, arms, eyes, brows, mouth, open, mood: 'idle', stomp: 0, talk: 0, look: null, hop: 0 }; return g;
}

const clampN = (v, a) => Math.max(-a, Math.min(a, v));
/* 매 장면 — o.look: 고개를 돌리는 끝 · o.body: [몸이 따라 도는 비율, 끝] · o.head: 고개의 끝 · o.leader: 박자를 이끄는 사람(나머지는 까딱) · o.idleLook(p): 볼 것이 없을 때의 방향 */
export function stepPeople(K, people, dt, t, o = {}){
  const vA = K._pv || (K._pv = new K.THREE.Vector3()), look = o.look || 1.7, bd = o.body || [0.5, 0.85], hd = o.head || 0.9;
  people.forEach((p, i) => { const u = p.userData, k = Math.min(1, dt * 11), m = u.mood;
    u.stomp = Math.max(0, u.stomp - dt * 4.5); u.hop = Math.max(0, (u.hop || 0) - dt * 1.4);
    let by = Math.sin(t * 2 + i) * 0.02, bsy = 1 + Math.sin(t * 2 + i) * 0.012, hz = 0, eye = ((t + i * 1.3) % 3.7 < 0.12) ? 0.1 : 1, smile = 1, brow = 0, yawTo = Math.sin(t * 0.4 + i * 2) * 0.14, snap = false;
    const ax = [0, 0], ay = [0, 0], az = [-0.15, 0.15];
    if (u.look) { u.look.getWorldPosition(vA); const a = Math.atan2(vA.x - p.position.x, vA.z - p.position.z) - p.rotation.y; yawTo = clampN(Math.atan2(Math.sin(a), Math.cos(a)), look); }
    else if (o.idleLook) { const y = o.idleLook(p); if (y != null) yawTo = y; }
    const bodyYaw = clampN(yawTo * bd[0], bd[1]), headYaw = clampN(yawTo - bodyYaw, hd);
    if (m === 'happy') { by = Math.abs(Math.sin(t * 7 + i)) * 0.3; az[0] = -2.6 + Math.sin(t * 14) * 0.2; az[1] = 2.6 - Math.sin(t * 14) * 0.2; eye = 0.45; smile = 1.5; brow = 1; snap = true; }
    else if (m === 'wave') { const s = Math.sin(t * 8); by = Math.abs(s) * 0.05; az[0] = -2.45 + s * 0.5; az[1] = 2.45 + s * 0.5; hz = s * 0.08; smile = 1.4; brow = 0.8; }      /* 두 손을 좌우로 — 흔들기 시범 */
    else if (m === 'ear') { hz = 0.24; az[1] = 2.4; ax[1] = -0.3; brow = 1; smile = 0.85; }                                                                   /* 귀에 손 — 네 말을 듣는다 */
    else if (m === 'lead') { by = -u.stomp * 0.12 + Math.sin(u.stomp * Math.PI) * 0.16; bsy = 1 - u.stomp * 0.08; az[0] = -(0.5 + u.stomp * 1.2); az[1] = 0.5 + u.stomp * 1.2; hz = Math.sin(t * 3) * 0.06; smile = 1.25; snap = true; }
    else if (m === 'point') { const sd = yawTo >= 0 ? 1 : 0; ax[sd] = -1.3; ay[sd] = yawTo - bodyYaw; az[sd] = 0; by += u.stomp * 0.1; smile = 1.25; brow = 0.6; }     /* 그 물건을 가리킨다 */
    else if (m === 'lift') { az[1] = 2.2; az[0] = -0.5; smile = 1.4; brow = 1; }                                                                              /* 한 손에 번쩍 든다 */
    else if (m === 'speak') { by = Math.abs(Math.sin(t * 5)) * 0.05; ax[0] = ax[1] = -0.7; az[0] = 0.35; az[1] = -0.35; brow = 0.8; }                        /* 두 손을 입가에 — 따라 말한다 */
    /* 챈트 몸짓(WD0 · 다름 설계 ⑪ — 걸음마다 다른 몸짓. stomp 가 박자마다 1 → 0) */
    else if (m === 'knee') { by = -u.stomp * 0.1; bsy = 1 - u.stomp * 0.06; ax[0] = ax[1] = -0.5 - u.stomp * 0.5; az[0] = 0.3; az[1] = -0.3; hz = Math.sin(t * 3) * 0.05; smile = 1.25; snap = true; }                 /* 무릎 치기 */
    else if (m === 'clink') { ax[0] = ax[1] = -1.25; az[0] = 0.55 - u.stomp * 0.35; az[1] = -0.55 + u.stomp * 0.35; by = Math.sin(u.stomp * Math.PI) * 0.06; smile = 1.3; brow = 0.6; snap = true; }                          /* 검지 둘 맞부딪치기 */
    else if (m === 'trunk') { ax[1] = -1.5 + Math.sin(t * 5) * 0.5; az[1] = Math.sin(t * 5 + 1) * 0.7; az[0] = -0.3; hz = Math.sin(t * 5) * 0.1; by = u.stomp * 0.06; smile = 1.3; }                                           /* 팔을 코끼리 코처럼 */
    else if (m === 'horns') { az[0] = -2.75; az[1] = 2.75; ax[0] = ax[1] = -0.15; hz = (u.stomp - 0.5) * 0.3; by = u.stomp * 0.05; smile = 1.35; brow = 1; snap = true; }                                                     /* 머리 위 염소 뿔 까딱 */
    else if (m === 'jump') { by = Math.sin(u.stomp * Math.PI) * 0.5; az[0] = -0.6 - u.stomp; az[1] = 0.6 + u.stomp; smile = 1.5; brow = 1; snap = true; }                                                                    /* 제자리에서 폴짝 */
    else if (m === 'tilt') { hz = 0.32; brow = 1; smile = 0.9; az[1] = 0.9; ax[1] = -0.6; }                                                                   /* 갸웃 */
    if (o.leader && p !== o.leader && o.leader.userData.mood === 'lead' && m === 'idle') by += o.leader.userData.stomp * 0.1;           /* 박자에 맞춰 까딱 */
    by += Math.sin(u.hop * Math.PI) * 0.6;
    u.body.position.y += (by - u.body.position.y) * (snap || u.hop > 0 ? 1 : k); u.body.scale.y += (bsy - u.body.scale.y) * k;
    u.body.rotation.y += (bodyYaw - u.body.rotation.y) * k * 0.5; u.head.rotation.y += (headYaw - u.head.rotation.y) * k * 0.6; u.head.rotation.z += (hz - u.head.rotation.z) * k;
    u.arms.forEach((a, j) => { a.rotation.x += (ax[j] - a.rotation.x) * k; a.rotation.y += (ay[j] - a.rotation.y) * k; a.rotation.z += (az[j] - a.rotation.z) * k; });
    u.eyes.forEach(e => { e.scale.y += (eye * 1.35 - e.scale.y) * Math.min(1, dt * 28); });
    u.brows.forEach(b => { b.position.y += (0.21 + brow * 0.05 - b.position.y) * k; });
    const talking = u.talk > 0 || m === 'speak'; u.open.visible = talking; u.mouth.visible = !talking;
    if (talking) u.open.scale.set(1.1, 0.3 + Math.abs(Math.sin(t * 13 + i)) * 0.9, 0.5); else { u.mouth.scale.x += (smile - u.mouth.scale.x) * k; u.mouth.scale.y += (smile - u.mouth.scale.y) * k; }
  });
}
