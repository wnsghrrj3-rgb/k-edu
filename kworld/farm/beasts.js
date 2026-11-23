/* 「다섯 해」 움직이는 짐승과 사람 몸짓(준호 11-23 「강아지도 움직임이 있어야 하는데 그냥 통통 튀면서 움직인다」).
   짐승 = beasts.glb(tools/blender/make_beasts.py) 의 조각들. 조각마다 원점이 돌림 중심(어깨·엉덩이·목·꼬리뿌리)이라
   보이지 않는 뼈대(Object3D)를 짐승마다 하나씩 두고, 조각마다 InstancedMesh 하나로 그린다(닭 넷도 조각 수만큼만 그리기).
   rig.root 는 위치·방향·visible 을 가진 보통 물체 — 말풍선(talk)도 이것을 따라간다.
   다리 돌림(rotation.x): + 면 발이 뒤로, - 면 앞으로. 몸통(엉덩이 축) rotation.x: - 면 머리가 든다. 꼬리 rotation.z = 좌우 흔들기. */
import * as THREE from 'three';
import { ART, artGeo, artMat } from '../scene/kit.js?v=5';

const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const DEFS = {
  dog: { body: 'dog_body', kids: { head: 'dog_head', legFL: 'dog_legFL', legFR: 'dog_legFR', legBL: 'dog_legBL', legBR: 'dog_legBR', tail: 'dog_tail' }, sub: { jaw: ['head', 'dog_jaw'] }, noShadow: ['jaw'] },
  hen: { body: 'hen_body', kids: { head: 'hen_head', wingL: 'hen_wingL', wingR: 'hen_wingR', legL: 'hen_legL', legR: 'hen_legR' }, noShadow: ['legL', 'legR', 'wingL', 'wingR'] },
  ox: { body: 'ox_body', kids: { head: 'ox_head', legFL: 'ox_legFL', legFR: 'ox_legFR', legBL: 'ox_legBL', legBR: 'ox_legBR', tail: 'ox_tail', yoke: 'ox_yoke' }, sub: { earL: ['head', 'ox_earL'], earR: ['head', 'ox_earR'] }, noShadow: ['earL', 'earR', 'tail'] }
};
export function beastKit(scene) {
  const kinds = [];
  /* 같은 짐승 n 마리. tints = 깃·털 색(tint_*) */
  function herd(kind, n, tints = {}) {
    const D = DEFS[kind]; if (!ART[D.body]) return null;
    const parts = [['body', D.body, null]]; for (const k in D.kids) parts.push([k, D.kids[k], 'body']); for (const k in D.sub || {}) parts.push([k, D.sub[k][1], D.sub[k][0]]);
    const nameOf = {}; for (const [k, nm] of parts) nameOf[k] = nm;
    const inst = {};
    for (const [k, nm] of parts) { const im = new THREE.InstancedMesh(artGeo(nm, tints), artMat, n); im.castShadow = !(D.noShadow || []).includes(k); im.receiveShadow = true; im.frustumCulled = false; scene.add(im); inst[k] = im; }
    const rigs = [];
    for (let i = 0; i < n; i++) { const root = new THREE.Object3D(), P = {};
      for (const [k, nm, par] of parts) { const o = new THREE.Object3D(); o.position.copy(ART[nm].pivot); if (par) o.position.sub(ART[nameOf[par]].pivot); (par ? P[par] : root).add(o); o.userData.p0 = o.position.clone(); P[k] = o; }
      rigs.push({ root, P, ph: i * 1.7, st: {} }); }
    function flush() { rigs.forEach((r, i) => { r.root.updateMatrixWorld(true); for (const [k] of parts) inst[k].setMatrixAt(i, r.root.visible && (k !== 'yoke' || r.yoke) ? r.P[k].matrixWorld : ZERO); }); for (const k in inst) inst[k].instanceMatrix.needsUpdate = true; }
    const h = { rigs, inst, flush }; kinds.push(h); return h;
  }
  const flushAll = () => { for (const k of kinds) k.flush(); };
  const lp = (o, k, v, a) => { o.rotation[k] += (v - o.rotation[k]) * a; };

  /* 개: o = { sp(걸음 빠르기), sit 0~1, lie 0~1, wag(흔들기 세기), bark 0~1, look(고개 좌우), t, dt } */
  function dogPose(r, o) {
    const P = r.P, a = Math.min(1, o.dt * 10), sp = o.sp, run = sp > 6.2;
    r.ph += o.dt * (run ? sp * 2.1 : sp * 3.2);
    const f = r.ph, mv = Math.min(1, sp / 1.2), A = (run ? 0.78 : 0.48) * mv;
    let FL, FR, BL, BR, pitch = 0, bob = 0;
    if (run) { FL = Math.sin(f) * A; FR = Math.sin(f - 0.45) * A; BL = Math.sin(f + Math.PI) * A; BR = Math.sin(f + Math.PI - 0.45) * A; pitch = Math.sin(f + 0.6) * 0.13; bob = Math.max(0, Math.sin(f + 0.6)) * 0.07; }
    else { FL = Math.sin(f) * A; BR = Math.sin(f) * A; FR = -Math.sin(f) * A; BL = -Math.sin(f) * A; pitch = Math.sin(f * 2) * 0.02 * mv; }
    const s = o.sit * (1 - mv), l = o.lie * (1 - mv) * (1 - s);
    const bp = P.body.userData.p0;
    P.body.position.y = bp.y + bob - 0.26 * s - 0.33 * l;
    lp(P.body, 'x', pitch - 0.6 * s + 0.0 * l, a);
    P.body.rotation.z = run ? Math.sin(f) * 0.04 : Math.sin(f) * 0.025 * mv;
    lp(P.legFL, 'x', FL + 0.6 * s - 1.45 * l, a); lp(P.legFR, 'x', FR + 0.6 * s - 1.35 * l, a);
    lp(P.legBL, 'x', BL - 0.46 * s - 1.25 * l, a); lp(P.legBR, 'x', BR - 0.46 * s - 1.3 * l, a);
    P.legBL.rotation.z = -0.25 * l; P.legBR.rotation.z = 0.25 * l;
    const bark = o.bark || 0;
    lp(P.head, 'x', 0.42 * s + 0.18 * l - 0.38 * bark + (run ? 0.12 : Math.sin(f * 2) * 0.03 * mv), a);
    lp(P.head, 'y', (o.look || 0) * (1 - mv * 0.7), Math.min(1, o.dt * 4));
    P.head.rotation.z = l * 0.2;
    P.jaw.rotation.x = bark > 0 ? 0.5 * Math.abs(Math.sin(o.t * 18)) : run ? 0.32 : (s > 0.5 ? 0.16 + Math.sin(o.t * 9) * 0.06 : 0.04);
    const w = o.wag == null ? 0.3 : o.wag;
    P.tail.rotation.z = Math.sin(o.t * (w > 0.5 ? 17 : 9)) * w * (1 - 0.5 * l);
    lp(P.tail, 'x', run ? 0.75 : o.tuck ? 1.1 : 0, a);
  }
  /* 닭: o = { sp, flee, peck 0~1, t, dt } */
  function henPose(r, o) {
    const P = r.P, sp = o.sp, mv = Math.min(1, sp / 0.6), a = Math.min(1, o.dt * 14);
    r.ph += o.dt * (o.flee ? 26 : 4 + sp * 6);
    const f = r.ph, A = (o.flee ? 0.9 : 0.6) * mv;
    P.legL.rotation.x = Math.sin(f) * A; P.legR.rotation.x = -Math.sin(f) * A;
    const hp = P.head.userData.p0, bp = P.body.userData.p0;
    P.head.position.z = hp.z + (mv > 0.2 && !o.flee ? Math.max(-0.02, Math.sin(f * 2)) * 0.035 : 0);
    const pk = o.peck || 0, jab = pk > 0 ? Math.max(0, Math.sin(o.t * 16)) : 0;
    lp(P.body, 'x', 0.45 * pk + (o.flee ? 0.25 : 0), a);
    P.head.rotation.x = 0.6 * pk + jab * 0.55 * pk - (o.flee ? 0.3 : 0);
    P.body.position.y = bp.y + (o.flee ? Math.abs(Math.sin(f * 0.5)) * 0.08 : 0);
    P.body.rotation.z = Math.sin(f) * 0.06 * mv;
    const fl = o.flee ? 0.35 + Math.abs(Math.sin(o.t * 32)) * 0.95 : 0;
    P.wingL.rotation.z = -fl; P.wingR.rotation.z = fl;
  }
  /* 소: o = { sp, t, dt, look } — 서 있을 때 꼬리·귀·되새김, 걸을 때 옆걸음 순서(뒤왼·앞왼·뒤오·앞오) */
  function oxPose(r, o) {
    const P = r.P, sp = o.sp, mv = Math.min(1, sp / 0.8), a = Math.min(1, o.dt * 8);
    r.ph += o.dt * sp * 1.9;
    const f = r.ph, A = 0.34 * mv;
    lp(P.legBL, 'x', Math.sin(f) * A, a); lp(P.legFL, 'x', Math.sin(f - Math.PI / 2) * A, a); lp(P.legBR, 'x', Math.sin(f + Math.PI) * A, a); lp(P.legFR, 'x', Math.sin(f + Math.PI / 2) * A, a);
    P.body.rotation.z = Math.sin(f) * 0.025 * mv;
    const st = r.st, t = o.t + r.ph * 0.01 + r.root.position.x;
    st.flick = (st.flick || 0) - o.dt; if (st.flick < -3 - (Math.sin(t * 7.3) + 1) * 3) st.flick = 0.5;
    const fk = st.flick > 0 ? Math.sin(st.flick * 18) * 0.6 : 0;
    P.earL.rotation.z = -0.1 + fk; P.earR.rotation.z = 0.1 - (st.flick > 0 && Math.sin(t) > 0 ? fk : 0);
    P.tail.rotation.z = Math.sin(o.t * 1.6 + r.root.position.z) * 0.32 + (st.flick > 0 ? Math.sin(st.flick * 12) * 0.4 : 0);
    P.tail.rotation.x = mv * 0.15;
    lp(P.head, 'x', mv ? 0.1 + Math.sin(f * 2) * 0.07 : 0.12 + Math.sin(o.t * 0.7 + r.root.position.x) * 0.1, a);
    lp(P.head, 'y', mv ? 0 : (o.look || 0), Math.min(1, o.dt * 2));
    P.head.rotation.z = mv ? 0 : Math.sin(o.t * 3.1) * 0.03;
  }

  /* ───── 사람 몸짓: 허리에서 굽히게(전엔 발끝을 축으로 통째 기울어 막대처럼 누웠다) ───── */
  function hipify(m) { const u = m.userData; if (u.upper || !u.legL) return m; const hy = u.legL.position.y, up = new THREE.Group(); up.position.y = hy;
    for (const c of m.children.slice()) { if (c === u.legL || c === u.legR) continue; m.remove(c); c.position.y -= hy; up.add(c); }
    m.add(up); u.upper = up; return m; }
  /* kind: null(서기) · 'weed'(김매기 — 쭈그려 두 손 번갈아 뽑기) · 'plant'(모내기·심기 — 허리 굽혀 오른손 꽂기, 왼손 모 다발) · 'sow'(볍씨 뿌리기 — 선 채 오른팔을 휘둘러 흩기)
     'cut'(거두기 — 왼손 움켜쥐고 오른손 낫질) · 'dig'(보 쌓기·길 닦기·품 — 두 손 들어 내리찍기) · 'bow'(절 — 깊이 숙이고 두 손 모음) · 'haggle'(흥정 — 손짓) */
  function workPose(m, kind, t, dt = 0.05) {
    const u = m.userData; if (!u.upper) hipify(m); const up = u.upper, a = Math.min(1, dt * 10); let bend = 0, aL = null, aR = null, zL = 0, zR = 0, lg = 0;
    if (kind === 'weed') { bend = 0.95; const s = Math.sin(t * 6); aL = -1.1 - Math.max(0, s) * 0.5; aR = -1.1 - Math.max(0, -s) * 0.5; lg = -0.55; }
    else if (kind === 'plant') { bend = 0.85; const s = Math.sin(t * 5); aR = -1.2 - Math.max(0, s) * 0.55; aL = -0.9; zL = 0.25; lg = -0.35; }
    else if (kind === 'sow') { bend = 0.12; const s = Math.sin(t * 4); aL = -0.9; zL = 0.2; aR = -0.5 - (s + 1) * 0.5; zR = 0.3 + Math.max(0, s) * 0.9; }
    else if (kind === 'cut') { bend = 0.7; const s = Math.sin(t * 5.5); aL = -1.2; zL = 0.35; aR = -1.0 + s * 0.25; zR = 0.3 - (s + 1) * 0.45; lg = -0.3; }
    else if (kind === 'dig') { const s = Math.sin(t * 4.2); bend = 0.35 + s * 0.3; aL = aR = -1.4 - s * 1.0; lg = -0.15; }
    else if (kind === 'bow') { bend = 1.05; aL = aR = -0.55; zL = 0.15; zR = -0.15; lg = -0.12; }
    else if (kind === 'haggle') { aR = -0.8 + Math.sin(t * 5) * 0.35; zR = 0.25; }
    up.rotation.x += (bend - up.rotation.x) * a;
    /* 팔·다리는 walkAnim 이 매 걸음 0 으로 되돌리므로 바로 놓는다 */
    if (aL != null) { u.armL.rotation.x = aL; u.armL.rotation.z = zL; }
    if (aR != null && !u.lantern) { u.armR.rotation.x = aR; u.armR.rotation.z = zR; }
    if (kind) { u.legL.rotation.x = lg; u.legR.rotation.x = lg * 0.6; } else { u.armL.rotation.z = 0; if (!u.lantern) u.armR.rotation.z = 0; }
    return kind; }
  return { herd, flushAll, dogPose, henPose, oxPose, hipify, workPose };
}
