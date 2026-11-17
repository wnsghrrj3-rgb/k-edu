/* ============================================================
 * 영어 놀이터 — 빈터 방 등록소(rooms/index) (WA1 · 글자 숲 A02~A14 가 따르는 한 가지 길)
 *   빈터 하나 더하기 = ① content/rooms/glade-<글자 둘>.js 를 하나 쓰고 ② 아래 ROOMS 에 한 줄.
 *   그러면 zone/glade.html?step=<걸음> 이 그 방을 짓고, 낱말 · 쪽지 · 사건 · 손님 · 박자는 상세판 자료(data/path-detail.js)에서 읽어
 *   A01 과 같은 놀이 · 판정으로 세 마디를 돈다. 등록이 없는 걸음은 2D 걸음 화면(step.html)으로 간다.
 *
 *   방 파일 꼴(export default):
 *     id · light('morning'|'day'|'afternoon'|'evening'|'lamp') · fog(빛 이름 | null) · wind(풀 흔들림 배수) · beat(박자 소리 — PlayAudio 합성 한 벌)
 *     trees: { L: { leaf, fruit, apples? }, R: { … } }        — 왼쪽 = 첫 글자, 오른쪽 = 둘째 글자(빈터 판형)
 *     ground: buildGlade 에 넘길 것(개울 · 덤불 · 버섯 · 바위 — 없으면 판형 기본)
 *     words: { 낱말: { make: props 부품 이름 | 'person' | 'me', o: 부품에 넘길 것, at?: [x, z], y?, rot?, mood? } }
 *            자리는 적지 않으면 상세판 room.props 의 자리 이름(La·Lb·…·center·skyR)을 빈터 판형 GLADE 에서 찾는다
 *     decor(K, glade, PR, things) → { life?(t), … }               — 가운데 장면(찻상 · 폭포 · 바위 · 얼음 처마)
 *     stage: { 사건 id: { actor: 낱말, from?: [x, z] } }          — 사건이 감싸는 물건 · from 이 있으면 낱말마다 한 걸음씩 제자리로(A01 개미 줄)
 *     onRound?(사건 id, 몇 번째, ctx)                              — 그 방만의 맛(찻집 방석 하나 · …)
 * ============================================================ */
import * as PR from './props.js';
export { PR };

/* 빈터 하나 = 한 줄. 걸음 id → 방 파일(필요할 때 불러온다) */
export const ROOMS = {
  A02: () => import('./glade-cd.js'),
  A03: () => import('./glade-ef.js'),
  A04: () => import('./glade-gh.js'),
  A05: () => import('./glade-ij.js')
};
export const hasRoom = id => !!ROOMS[id];
export async function loadRoom(id){ const f = ROOMS[id]; return f ? (await f()).default : null; }

/* 빈터 판형의 자리를 화면에서 서로 가리지 않게 조금 옮긴 것(A01 기준판이 쓰는 값과 같은 뜻 — 버스 뒤 · 주인 뒤 · 선반 옆이 비게). 모든 방이 이 표를 쓴다 */
export const ROOM_SLOTS = {
  La: [-6.9, -0.9], Lb: [-3.2, -1.7], Lc: [-5.7, 1.4], Ld: [-3.6, 1.1], Ra: [7.3, -2.3], Rb: [3.1, -1.9], Rc: [6.5, -0.4], Rd: [3.5, 0.9],
  center: [0.4, -3.4], skyR: [2.4, -2.6], skyL: [-2.4, -2.6], owner: [-0.5, -0.8], me: [-2.2, 2.3], guide: [1.9, 2.3], Re: [4.9, 3.5], sign: [7.25, 3.7], path: [0, 4.3]
};
export const ROOM_BUSHES = [[-7.6, -4.6, 1.25], [-2.7, -5.0, 1.05], [3.5, -5.1, 1.05], [7.6, -4.6, 1.3]];     /* 옆 덤불은 뺀다 — La · Ra 자리가 보이게 */

/* 낱말 → 빈터 위 자리(방 파일의 at > 상세판 자리 이름 → 빈터 판형) */
export function slotOf(room, det, glade, w){
  const s = room.words[w] || {};
  if (s.at) return s.at;
  const name = det && det.room && det.room.props && det.room.props[w] ? det.room.props[w][0] : null;
  const p = name && (glade.slots[name] || glade.spots[name]);
  return p || [0, 0];
}

/* 판형 기본 그림 — 가운데 햇볕 자리 · 앞 흙길 · 길에서 주인에게 오는 오솔길(A01 과 같은 얼룩) */
export function defaultPaint(g, P){ const { gx, gz, gs, soft, hex, dirt } = P;
  soft(g, gx(0), gz(0.9), 4.6 * gs, 2.4 * gs, hex('warm-soft'), 0.2, 2.2 * gs);
  soft(g, gx(0), gz(4.3), 3.6 * gs, 0.5 * gs, dirt, 0.92, 0.3 * gs);
  [[0.25, 3.5, 0.6], [-0.2, 2.9, 0.5], [0.15, 2.2, 0.45], [-0.05, 1.5, 0.4], [0.05, 0.8, 0.36], [0, 0.1, 0.34]].forEach((p, i) => soft(g, gx(p[0]), gz(p[1]), p[2] * gs, 0.3 * gs, dirt, 0.7 - i * 0.08, 0.22 * gs));
}

/* 방을 짓는다 — 낱말 여덟의 물건 + 가운데 장면. ctx = { det, glade:GLADE, me, makePerson } → { things, decor } */
export function buildRoom(K, group, room, ctx){
  const { THREE } = K, things = {};
  Object.keys(room.words).forEach(w => {
    const s = room.words[w], at = slotOf(room, ctx.det, ctx.glade, w);
    let g;
    if (s.make === 'me') {                                   /* 몸 낱말 — 내 캐릭터의 몸(누르면 그 몸짓) */
      g = ctx.me; Object.assign(g.userData, { w, home: g.position.clone(), dy: s.dy || 1.6, r: 0.9, moodAct: s.mood || 'lift' });
      things[w] = g; return;
    }
    if (s.make === 'person') {                               /* 사람 낱말 — 인물 몸에 그 사람의 소품 */
      g = ctx.makePerson(K, s.o); const u = g.userData;
      if (s.cone) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 16), K.M(s.cone, { roughness: 0.7 })); c.position.set(0, 0.62, -0.02); c.rotation.x = -0.25; c.castShadow = true; u.head.add(c); }
      if (s.apron) { const ap = K.rbox(0.5, 0.56, 0.04, 0.1, K.M(s.apron, { roughness: 0.85 })); ap.position.set(0, 0.7, 0.36); u.body.add(ap); }
      if (s.scale) g.scale.setScalar(s.scale);
      u.dy = 1.9 * (s.scale || 1); u.r = 1.0;
      u.act = t => { u.arms[1].rotation.z = 0.15 + Math.sin(t * Math.PI) * 2.2; u.body.position.y = Math.abs(Math.sin(t * Math.PI * 2)) * 0.18; };
      u.life = t => { u.body.rotation.y = Math.sin(t * 0.5) * 0.2; u.eyes.forEach(e => { e.scale.y = ((t + 1.7) % 3.9 < 0.12) ? 0.15 : 1.35; }); };
    } else {
      const make = PR[s.make]; if (!make) throw new Error('없는 부품 ' + s.make + ' (' + w + ')');
      g = make(K, s.o || {});
    }
    g.position.set(at[0], s.y || 0, at[1]); g.rotation.y = s.rot || 0;
    Object.assign(g.userData, { w, home: g.position.clone(), hop: 0 });
    if (s.y) g.userData.dy = (g.userData.dy || 1) + s.y;
    group.add(g); things[w] = g;
  });
  const decor = room.decor ? room.decor(K, group, PR, things) || {} : {};
  return { things, decor };
}

/* 매 장면 — 살아 있는 것(빛바랜 물건 · 바쁜 물건은 가만히) */
export function stepRoom(things, decor, dt, t){
  Object.keys(things).forEach(w => { const u = things[w].userData; if (!u.faded && !u.busy && u.life) u.life(t, dt); });
  if (decor && decor.life) decor.life(t, dt);
}
