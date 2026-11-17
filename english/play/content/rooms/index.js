/* ============================================================
 * 영어 놀이터 — 빈터 방 등록소(rooms/index) (WA1 · 글자 숲 A02~A14 가 따르는 한 가지 길)
 *   빈터 하나 더하기 = ① content/rooms/glade-<글자 둘>.js 를 하나 쓰고(물건 여덟 + 무대 여섯 칸 place) ② 아래 ROOMS 에 한 줄.
 *   그러면 zone/glade.html?step=<걸음> 이 그 방을 짓고, 낱말 · 쪽지 · 사건 · 손님 · 박자는 상세판 자료(data/path-detail.js)에서 읽어
 *   A01 과 같은 놀이 · 판정으로 세 마디를 돈다. 등록이 없는 걸음은 2D 걸음 화면(step.html)으로 간다.
 *
 *   방 파일 꼴(export default):
 *     id · beat(박자 소리 — PlayAudio 합성 한 벌)
 *     how: { carrier: { L: { kind, at?, tone? }, R }, pen: { kind }, body: { kind } }   — 방법 일곱 칸 가운데 이 방이 고르는 부품(WD0 · 다름 설계 v1). 나머지 넷(구도 · 손짓 · 얼굴 놀이 · 여는 꼴)은 data/path-differ.js 가 준다 — howOf() 가 합친다. 빈 방은 짓지 않는다
 *     place: { land, floor, back, sky, around, look }              — 무대 여섯 칸(무대 설계 v1 §1). 칸마다 { kind: 터 부품 이름, … } — 부품은 rooms/lands.js. 여섯 칸이 비면 짓지 않는다
 *            빛 · 안개 · 바람은 sky 가, 글자 나무 둘(왼쪽 = 첫 글자 · 오른쪽 = 둘째 글자)은 around.trees 가 정한다
 *     words: { 낱말: { make: props 부품 이름 | 'person' | 'me', o: 부품에 넘길 것, at?: [x, z], y?, rot?, mood? } }
 *            자리는 적지 않으면 상세판 room.props 의 자리 이름(La·Lb·…·center·skyR)을 자리 약속(glade.js)에서 찾는다 · 높이는 땅이 준다(y 는 그 위로 얼마)
 *     decor(K, glade, PR, things, land) → { life?(t), … }         — 가운데 장면(찻상 · 바위 · 얼음 처마). land.heightAt(x, z) 로 땅에 붙인다
 *     stage: { 사건 id: { actor: 낱말, from?: [x, z] } }          — 사건이 감싸는 물건 · from 이 있으면 낱말마다 한 걸음씩 제자리로(A01 개미 줄)
 *     onRound?(사건 id, 몇 번째, ctx)                              — 그 방만의 맛(찻집 방석 하나 · …)
 * ============================================================ */
import * as PR from './props.js';
import { AXES } from './glade.js';
import { CARRIERS } from './carriers.js';
import { MOODS } from '../../core/diorama-people.js';
export { PR };

/* 빈터 하나 = 한 줄. 걸음 id → 방 파일(필요할 때 불러온다) */
export const ROOMS = {
  A02: () => import('./glade-cd.js'),
  A03: () => import('./glade-ef.js'),
  A04: () => import('./glade-gh.js'),
  A05: () => import('./glade-ij.js'),
  A06: () => import('./glade-kl.js'),
  A07: () => import('./glade-mn.js')
};
export const hasRoom = id => !!ROOMS[id];
export async function loadRoom(id){ const f = ROOMS[id]; return f ? (await f()).default : null; }

/* 자리 약속(자리 이름 → 좌표)은 판형 glade.js 에 있다 — 모든 방이 그 표를 쓴다 */
export { ROOM_SLOTS, GLADE, sideOf, AXES, slotsFor } from './glade.js';
/* 그 걸음의 무대 여섯 칸(place) — A01 은 기준판 방 자료(glade-ab.js), 나머지는 방 파일. 입체 판 · 2D 판 · 한 장 보기가 같은 것을 읽는다 */
export async function loadPlace(id){ if (id === 'A01') return (await import('./glade-ab.js')).ROOM_AB.place; const r = await loadRoom(id); return r ? r.place : null; }

/* ── 방법 일곱 칸(how · WD0 · 다름 설계 v1 §6) — 걸음의 다름 자료(data/path-differ.js 의 그 걸음 줄)에 방이 고른 부품(글자 그릇 둘 · 쓰는 것 · 챈트 몸짓)을 더한 것 ──
   howOf(differ, id, room) → { carrier: { L, R, text }, axis, hand, handLook, sig, sigLine, sigEvent, body: { kind, text }, pen: { kind, text }, open, cam } | null
   checkHow(how, env) → 비었거나 아직 짓지 않은 부품인 칸 이름들(빈 방은 짓지 않는다). env = { hands, pens }(없으면 화면의 PlayHands · PlayPens) */
export const HOW_KEYS = ['carrier', 'axis', 'hand', 'sig', 'body', 'pen', 'open'];
export const OPEN_KINDS = ['scene', 'guest', 'ear', 'beat', 'hand', 'seek', 'note'];      /* 여는 꼴 일곱 — 빈터 화면이 하나씩 짓는다 */
export async function loadHowParts(id){ if (id === 'A01') return (await import('./glade-ab.js')).ROOM_AB.how; const r = await loadRoom(id); return r ? r.how : null; }
export function howOf(differ, id, parts){ const d = differ && differ.steps && differ.steps[id]; if (!d || !parts) return null; const c = parts.carrier || {};
  return { carrier: { L: c.L || null, R: c.R || null, text: d.carrier }, axis: d.axis, hand: d.hand, handLook: d.handLook, sig: d.sig, sigLine: d.sigLine, sigEvent: d.sigEvent || null,
    body: parts.body ? Object.assign({ text: d.body }, parts.body) : null, pen: parts.pen ? Object.assign({ text: d.pen }, parts.pen) : null, open: d.open, cam: !!d.cam }; }
export function checkHow(how, env){ const G = typeof globalThis !== 'undefined' ? globalThis : {}, e = env || {}, hands = e.hands || (G.PlayHands && G.PlayHands.KINDS) || [], pens = e.pens || (G.PlayPens && Object.keys(G.PlayPens.PENS)) || [];
  if (!how) return HOW_KEYS.slice();
  const ok = { carrier: !!(how.carrier && how.carrier.text && ['L', 'R'].every(k => how.carrier[k] && CARRIERS[how.carrier[k].kind])), axis: !!AXES[how.axis], hand: hands.indexOf(how.hand) >= 0, sig: !!(how.sig && how.sigLine),
    body: !!(how.body && how.body.text && MOODS.indexOf(how.body.kind) >= 0), pen: !!(how.pen && how.pen.text && pens.indexOf(how.pen.kind) >= 0), open: OPEN_KINDS.indexOf(how.open) >= 0 };
  return HOW_KEYS.filter(k => !ok[k]); }
/* 이웃한 두 걸음의 방법(N2) — 구도 · 손짓 · 여는 꼴이 셋 다 달라야 한다 */
export const howSame = (a, b) => ['axis', 'hand', 'open'].filter(k => a[k] === b[k]);

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
  const { THREE } = K, things = {}, H = ctx.heightAt || (() => 0);
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
      if (s.crown) { const cr = new THREE.Group(); cr.position.y = 0.52; cr.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.16, 14, 1, true), K.M(s.crown, { metalness: 0.6, roughness: 0.25, side: THREE.DoubleSide }))); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, pk = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 4), K.M(s.crown, { metalness: 0.6, roughness: 0.25 })); pk.position.set(Math.cos(a) * 0.28, 0.16, Math.sin(a) * 0.28); cr.add(pk); } cr.traverse(m => { if (m.isMesh) m.castShadow = true; }); u.head.add(cr); }      /* 왕관(임금님 · 여왕) */
      if (s.cape) { const cp = K.ball(0.5, K.M(s.cape, s.capeMap ? { map: s.capeMap(K), roughness: 0.95 } : { roughness: 0.9 }), 0, 0.82, -0.16, 1.05, 1.15, 0.62); u.body.add(cp); }      /* 망토 */
      if (s.apron) { const ap = K.rbox(0.5, 0.56, 0.04, 0.1, K.M(s.apron, { roughness: 0.85 })); ap.position.set(0, 0.7, 0.36); u.body.add(ap); }
      if (s.scale) g.scale.setScalar(s.scale);
      u.dy = 1.9 * (s.scale || 1); u.r = 1.0;
      u.act = t => { u.arms[1].rotation.z = 0.15 + Math.sin(t * Math.PI) * 2.2; u.body.position.y = Math.abs(Math.sin(t * Math.PI * 2)) * 0.18; };
      u.life = t => { u.body.rotation.y = Math.sin(t * 0.5) * 0.2; u.eyes.forEach(e => { e.scale.y = ((t + 1.7) % 3.9 < 0.12) ? 0.15 : 1.35; }); };
    } else {
      const make = PR[s.make]; if (!make) throw new Error('없는 부품 ' + s.make + ' (' + w + ')');
      g = make(K, s.o || {});
      if (s.scale) { g.scale.multiplyScalar(s.scale); g.userData.dy = (g.userData.dy || 1) * s.scale; g.userData.r = (g.userData.r || 1) * s.scale; }      /* 부품을 조금 키우거나 줄인다 */
    }
    g.position.set(at[0], H(at[0], at[1]) + (s.y || 0), at[1]); g.rotation.y = s.rot || 0;      /* 땅에 붙는다(터 부품 상자의 heightAt — 물 위는 물 높이) */
    Object.assign(g.userData, { w, home: g.position.clone(), hop: 0 });
    if (s.y) g.userData.dy = (g.userData.dy || 1) + s.y;
    group.add(g); things[w] = g;
  });
  const decor = room.decor ? room.decor(K, group, PR, things, { heightAt: H }) || {} : {};
  return { things, decor };
}

/* 매 장면 — 살아 있는 것(빛바랜 물건 · 바쁜 물건은 가만히) */
export function stepRoom(things, decor, dt, t){
  Object.keys(things).forEach(w => { const u = things[w].userData; if (!u.faded && !u.busy && u.life) u.life(t, dt); });
  if (decor && decor.life) decor.life(t, dt);
}
