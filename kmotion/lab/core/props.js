// 케이모션 과학실 — 기구 올리기·집기·놓기·동사 여덟 개를 실제 물체에 붙임 · 손 모델
// L01 회색 판: 기구를 상자·원통으로 만든다. 기구마다 빈 점 grip(쥐는 자리)·base(바닥)·spout(주둥이)·tip(집게 끝·망치 머리)을 넣고
// 아래 코드는 그 이름만 본다 → L03 에서 블렌더 GLB 로 바꿔도 동작 코드는 그대로.
import * as THREE from 'three';
import { pickNearest, snapSlot, makeTilt, makeStrike, makePump, wrapDeg, followK, lostAction, inZone, BODY_ZONE, LOST_ASK_MS, clamp } from './hands.js';

const DEG = Math.PI / 180;

// ── 회색 판 기구 목록 (L04 부터는 exp.json 이 이 자리를 맡는다)
export const ITEMS = [
  { id: 'goggles', name: '보안경', kind: 'wear', wear: 'face', home: 'shelf_2_1', mat: 'plastic', weight: .5 },
  { id: 'gloves', name: '장갑', kind: 'wear', wear: 'hands', home: 'shelf_2_2', mat: 'cloth', weight: .5 },
  { id: 'bowl', name: '그릇', kind: 'vessel', home: 'shelf_2_3', mat: 'metal', weight: 1.2 },
  { id: 'can', name: '통', kind: 'pour', home: 'shelf_3_1', mat: 'metal', weight: 1.8 },
  { id: 'tongs', name: '집게', kind: 'dip', home: 'shelf_3_2', mat: 'metal', weight: .7 },
  { id: 'hammer', name: '망치', kind: 'strike', home: 'shelf_3_3', mat: 'rubber', weight: 1.0 },
  { id: 'block', name: '나무토막', kind: 'target', home: 'fix_left', fixed: true, mat: 'wood' },
  { id: 'pump', name: '펌프', kind: 'pump', home: 'fix_right', fixed: true, mat: 'metal', weight: .8 },
];

// ── 회색 모양 만들기 (base 가 원점, 빈 점 이름 약속)
const M = (c, r = .6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
function empty(name, x, y, z, ud){ const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); if (ud) Object.assign(o.userData, ud); return o; }
function mesh(geo, mat, x = 0, y = 0, z = 0){ const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; }
const BUILD = {
  can(){ const g = new THREE.Group(), m = M(0xb9bec4, .35, .8);
    g.add(mesh(new THREE.CylinderGeometry(.075, .075, .30, 28), m, 0, .15, 0), mesh(new THREE.CylinderGeometry(.03, .045, .05, 20), m, 0, .325, 0));
    const h = mesh(new THREE.TorusGeometry(.05, .008, 8, 20, Math.PI), M(0x55595e, .5), 0, .25, 0); h.rotation.y = Math.PI / 2; g.add(h);
    g.add(empty('grip', 0, .21, 0), empty('spout', 0, .35, 0, { rim: .03 }), empty('base', 0, 0, 0)); return g; },
  bowl(){ const g = new THREE.Group(), m = M(0xa9aeb4, .3, .85); m.side = THREE.DoubleSide;
    g.add(mesh(new THREE.CylinderGeometry(.125, .105, .09, 36, 1, true), m, 0, .045, 0)); const b = mesh(new THREE.CircleGeometry(.105, 36), m, 0, .004, 0); b.rotation.x = -Math.PI / 2; g.add(b);
    const rim = mesh(new THREE.TorusGeometry(.125, .005, 6, 36), m, 0, .09, 0); rim.rotation.x = Math.PI / 2; g.add(rim);
    const liq = new THREE.Mesh(new THREE.CircleGeometry(1, 36), new THREE.MeshStandardMaterial({ color: 0xdfeeff, roughness: .08, metalness: .1, transparent: true, opacity: .85 })); liq.rotation.x = -Math.PI / 2; liq.name = 'liquid'; liq.visible = false; g.add(liq);
    g.add(empty('grip', 0, .07, 0), empty('base', 0, 0, 0), empty('inner', 0, .006, 0, { rTop: .118, rBot: .1, h: .084 })); return g; },
  tongs(){ const g = new THREE.Group(), m = M(0x9aa0a6, .35, .85);
    const a = mesh(new THREE.BoxGeometry(.01, .30, .012), m, -.012, .15, 0), b = mesh(new THREE.BoxGeometry(.01, .30, .012), m, .012, .15, 0); a.rotation.z = -.05; b.rotation.z = .05; g.add(a, b, mesh(new THREE.TorusGeometry(.016, .004, 6, 14), m, 0, .3, 0));
    g.add(empty('grip', 0, .25, 0), empty('tip', 0, .008, 0), empty('base', 0, 0, 0)); return g; },
  hammer(){ const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(.012, .014, .26, 12), M(0x7a6248, .7), 0, .17, 0), mesh(new THREE.BoxGeometry(.10, .05, .05), M(0x3a3d41, .9), 0, .025, 0));
    g.add(empty('grip', 0, .24, 0), empty('tip', 0, .0, 0), empty('base', 0, 0, 0)); return g; },
  goggles(){ const g = new THREE.Group(), m = M(0x8fb4c8, .2, 0); m.transparent = true; m.opacity = .75;
    [-.032, .032].forEach(x => { const r = mesh(new THREE.TorusGeometry(.026, .008, 8, 22), m, x, .03, 0); g.add(r); }); g.add(mesh(new THREE.BoxGeometry(.14, .01, .008), M(0x444a50, .8), 0, .03, -.006));
    g.add(empty('grip', 0, .03, 0), empty('base', 0, 0, 0)); return g; },
  gloves(){ const g = new THREE.Group(), m = M(0x3f6fcf, .85);
    [-.035, .035].forEach((x, i) => { const p = mesh(new THREE.BoxGeometry(.055, .028, .1), m, x, .014, 0); p.rotation.y = (i ? -1 : 1) * .2; g.add(p); });
    g.add(empty('grip', 0, .025, 0), empty('base', 0, 0, 0)); return g; },
  block(){ const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.15, .08, .11), M(0xa98657, .8), 0, .04, 0)); g.add(empty('top', 0, .08, 0), empty('base', 0, 0, 0)); return g; },
  pump(){ const g = new THREE.Group(), m = M(0x8d9298, .4, .7);
    g.add(mesh(new THREE.BoxGeometry(.14, .03, .12), M(0x5a5e63, .6), 0, .015, 0), mesh(new THREE.CylinderGeometry(.028, .028, .24, 18), m, 0, .15, 0));
    const handle = new THREE.Group(); handle.name = 'handle'; handle.add(mesh(new THREE.CylinderGeometry(.006, .006, .16, 8), M(0xc8ccd0, .3, .9), 0, -.08, 0), mesh(new THREE.BoxGeometry(.13, .02, .02), M(0x2f3236, .7), 0, 0, 0)); handle.position.y = .40; g.add(handle);
    const dial = mesh(new THREE.CylinderGeometry(.045, .045, .008, 28), M(0xf1efe8, .6), 0, .09, .065); dial.rotation.x = Math.PI / 2; g.add(dial);
    const needle = new THREE.Group(); needle.name = 'needle'; needle.position.set(0, .09, .071); const nm = mesh(new THREE.BoxGeometry(.004, .036, .003), M(0xc8302c, .5), 0, .016, 0); needle.add(nm); g.add(needle);
    for (let k = 0; k <= 10; k++) { const a = (-135 + k * 27) * DEG, t = mesh(new THREE.BoxGeometry(.002, .007, .002), M(0x333333), Math.sin(a) * .038, .09 + Math.cos(a) * .038, .07); t.rotation.z = -a; g.add(t); }
    g.add(empty('grip', 0, .40, 0), empty('base', 0, 0, 0)); return g; },
};

// ── 손 모델: 자세 셋(펴기·집기·쥐기)을 섞고 손목 방향만 1:1. 손가락 21관절을 그대로 따라가지 않는다.
function makeHand(side){
  const g = new THREE.Group(), mat = M(0x8e8fd8, .75); g.userData.mat = mat; const s = side === 'left' ? -1 : 1;
  const palm = mesh(new THREE.BoxGeometry(.074, .08, .024), mat, 0, .045, .03); g.add(palm);
  const fingers = []; [-.027, -.009, .009, .027].forEach((x, i) => { const piv = new THREE.Group(); piv.position.set(x * s, .085, .03); const len = [.045, .052, .05, .04][i];
    const seg = mesh(new THREE.BoxGeometry(.016, len, .017), mat, 0, len / 2, 0); piv.add(seg); g.add(piv); fingers.push(piv); });
  const th = new THREE.Group(); th.position.set(-.036 * s, .03, .034); th.add(mesh(new THREE.BoxGeometry(.018, .045, .018), mat, 0, .022, 0)); th.rotation.z = .7 * s; g.add(th);
  g.userData.fingers = fingers; g.userData.thumb = th; g.userData.side = s; g.visible = false; return g;
}
function poseHand(h, curl){ h.userData.fingers.forEach((f, i) => { f.rotation.x = -curl * (1.25 + i * .06); }); h.userData.thumb.rotation.x = -curl * .6; }

export function createProps({ stage, input, audio, liquid, hud }){
  const { scene, slots, BENCH_Y, WORK_Z } = stage;
  const aspect = () => stage.camera.aspect;
  const items = new Map(), occupied = new Map(); // slot → item id
  const counters = { grabs: 0, placed: 0, returned: 0, lost: 0, wears: 0, grains: 0, dips: 0, strikes: [0, 0, 0, 0], strikesOnTarget: [0, 0, 0, 0], pumps: 0, poursStarted: 0 };
  const worn = { face: false, hands: false };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const slotPos = name => slots.get(name).getWorldPosition(new THREE.Vector3());

  for (const def0 of ITEMS) {
    const def = stage.pictured && def0.fixed ? { ...def0, home: def0.id === 'block' ? 'bench_e' : 'bench_f' } : def0;   /* 그림 판 방: 컷 B 가 가까워 양끝 고정 자리가 화면 밖 → 실험대 다섯째·여섯째 자리로 */
    const model = BUILD[def.id](); const pivot = new THREE.Group(); pivot.name = def.id; pivot.add(model);
    const grip = model.getObjectByName('grip'), gripLocal = grip ? grip.position.clone() : new THREE.Vector3();
    if (!def.fixed) model.position.copy(gripLocal).multiplyScalar(-1);                              // 쥐는 자리가 회전 중심
    const mats = []; model.traverse(o => { if (o.isMesh && o.name !== 'liquid') { o.material = o.material.clone(); mats.push(o.material); } });
    const it = { ...def, pivot, model, gripLocal, mats, slot: def.home, held: null, anim: null, angle: 0, glow: 0, hover: 0, amount: def.kind === 'pour' ? 1 : 0, level: 0, hop: 0, worn: false };
    const p = slotPos(def.home); if (def.fixed) pivot.position.copy(p); else pivot.position.copy(p).add(gripLocal);
    occupied.set(def.home, def.id); scene.add(pivot); items.set(def.id, it);
  }
  const pump = items.get('pump'), handle = pump.model.getObjectByName('handle'), needle = pump.model.getObjectByName('needle'), bowl = items.get('bowl'), block = items.get('block');
  pump.handleY = .40; pump.ticks = 0;

  // 손 둘
  const H3 = [makeHand('right'), makeHand('left')]; H3.forEach(h => scene.add(h));
  const hs = [0, 1].map(() => ({ held: null, prevGrab: false, lostAt: null, tilt: makeTilt(), strike: makeStrike(), pump: makePump(), dir0: 0, tiltIn0: 0, curl: 0, hover: null, inDip: false, emitAcc: 0 }));
  // 놓을 자리 그림자 자리표
  const ring = new THREE.Mesh(new THREE.RingGeometry(.05, .085, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);

  const world = (o, name) => { const e = o.model.getObjectByName(name); return e ? e.getWorldPosition(new THREE.Vector3()) : o.pivot.getWorldPosition(new THREE.Vector3()); };
  const screenOf = v => stage.project(v);
  const basePos = it => world(it, 'base');
  const freeSlots = () => [...slots.entries()].filter(([n, o]) => o.userData.kind !== 'fixture' && !occupied.has(n)).map(([n]) => { const s = screenOf(slotPos(n)); return { id: n, x: s.x, y: s.y }; });

  // ── 받는 그릇(알갱이가 들어감)
  function bowlInfo(){ const b = basePos(bowl); const inner = bowl.model.getObjectByName('inner').userData; const surfaceY = b.y + .006 + bowl.level * inner.h * .85; return { b, rIn: inner.rBot, rTop: inner.rTop, surfaceY, rimY: b.y + .09 }; }
  const vessels = [{ inside(p){ if (bowl.held || bowl.worn) return false; const I = bowlInfo(); return Math.hypot(p.x - I.b.x, p.z - I.b.z) < I.rIn && p.y < I.rimY && p.y > I.b.y - .01; }, get surfaceY(){ return bowlInfo().surfaceY; },
    absorb(){ bowl.level = Math.min(1, bowl.level + .0045); } }];

  // ── 동작
  function grab(it, i, H){ const st = hs[i]; st.held = it; it.held = i; it.anim = null; if (!it.fixed) occupied.delete(it.slot); it.slot = null;
    st.hover = null; st.dir0 = H.dir; st.tiltIn0 = H.tiltIn; st.tilt.reset(); st.strike.reset(); st.pump.reset(); st.inDip = false; counters.grabs++; audio.grab(it.mat); }
  function animateTo(it, to, dur, arc = 0){ it.anim = { from: it.pivot.position.clone(), to: to.clone(), fromAng: it.angle, t: 0, dur, arc }; }
  function placeAt(it, slotName){ occupied.set(slotName, it.id); it.slot = slotName; animateTo(it, slotPos(slotName).add(it.gripLocal), .16); it.placeSound = true; counters.placed++;
    if (it.kind === 'pour' && slotName === it.home) it.amount = 1; }  // 회색 판: 제자리에 두면 통이 다시 찬다
  function returnHome(it){ let to = it.home; if (occupied.has(to)) { const f = [...slots.keys()].find(n => n.startsWith('shelf_') && !occupied.has(n)); to = f || to; }
    occupied.set(to, it.id); it.slot = to; animateTo(it, slotPos(to).add(it.gripLocal), .55, .12); it.placeSound = true; counters.returned++; }
  function release(it, i, H){ const st = hs[i]; st.held = null; it.held = null; ring.visible = false; audio.pour(0); audio.boil(0);
    if (it.kind === 'pump') { return; }
    if (it.kind === 'wear' && inZone(H, BODY_ZONE)) { it.worn = true; it.pivot.visible = false; worn[it.wear] = true; counters.wears++; audio.wear(); hud.wear(it.wear); return; }
    const bp = screenOf(basePos(it)), s = snapSlot(bp, freeSlots(), aspect());
    if (s) placeAt(it, s.id); else returnHome(it); }

  // 망치가 닿은 곳
  function strikeHit(it, level, hand){
    const top = world(block, 'top'), head = world(it, 'tip'); if (hand) { const hy = Math.max(top.y - .01, hand.y - it.gripLocal.y); if (hy < head.y) head.set(hand.x, hy, head.z); }   // 손이 간 자리 기준(물체가 손보다 살짝 늦게 와도 친 곳은 손 아래)
    const onBlock = Math.abs(head.x - top.x) < .12 && head.y < top.y + .14 && Math.abs(head.z - top.z) < .2;
    const overBench = Math.abs(head.x) < 1.3 && head.y < BENCH_Y + .16;
    counters.strikes[level]++;
    if (onBlock) { counters.strikesOnTarget[level]++; block.hop = [0, .012, .03, .06][level]; audio.strike(level, true); stage.shake([0, .25, .55, 1][level]);
      const s = level === 3 ? { x: .5, y: .5 } : stage.projectView(top); hud.pop(['', '톡', '탁', '쾅!'][level], s.x, s.y - .1, [0, 2.2, 3.2, 4.6][level]);   // 쾅은 눈앞 컷 가운데
      if (level === 3) { stage.closeUp(top, 1.6); stage.slowMo(.35, .6); }
      return 'block'; }
    if (overBench) { audio.strike(level, false); stage.shake(.15 * level); const s = stage.projectView(head); hud.pop('쿵', s.x, s.y - .05, 1.6); return 'bench'; }
    audio.whoosh(); return 'air';
  }

  function carry(it, i, H, dt, now){
    const st = hs[i], hand = stage.screenToPlane(H.x, H.y, WORK_Z, tmp);
    if (it.kind === 'pump') { // 손잡이는 세로 레일 위에서만
      const base = pump.pivot.position, y = clamp(hand.y - base.y, .28, .44); pump.handleY += (y - pump.handleY) * followK(dt, .5); handle.position.y = pump.handleY;
      if (st.pump.update(-pump.handleY)) { pump.ticks = (pump.ticks + 1) % 11; counters.pumps++; audio.pump(); needle.rotation.z = -(-135 + pump.ticks * 27) * DEG; const s = stage.projectView(world(pump, 'base')); hud.pop('+1', s.x + .03, s.y - .1, 1.4); }
      return; }
    // 옮기기: 손보다 살짝 늦게(무게감)
    const p = it.pivot.position; p.lerp(hand, followK(dt, it.weight));
    // 바닥 아래로 못 들어감(베이스·머리)
    const floorY = BENCH_Y + it.gripLocal.y * Math.cos(it.angle * DEG); if (Math.abs(p.x) < 1.33 && p.y < floorY) p.y = floorY;
    if (it.kind === 'strike') { const top = world(block, 'top'); if (Math.abs(p.x - top.x) < .1 && p.y < top.y + it.gripLocal.y) p.y = top.y + it.gripLocal.y;
      const r = st.strike.update(now, H.y); if (r) { const where = strikeHit(it, r.level, hand); if (where !== 'air') { p.x = hand.x; p.y = Math.max(p.y - .5, where === 'block' ? top.y + it.gripLocal.y : BENCH_Y + it.gripLocal.y); } } }
    // 기울여 붓기
    if (it.kind === 'pour') {
      let raw; if (H.src === 'cam') raw = wrapDeg(H.dir - st.dir0); else { raw = H.tiltIn - st.tiltIn0; const o = input.hands[1 - i]; if (o.present && o.grab && !hs[1 - i].held && o.dragDy) raw += o.dragDy * 260; }
      const r = st.tilt.update(raw); it.angle += (r.angle - it.angle) * Math.min(1, dt * 14); it.pivot.rotation.z = -it.angle * DEG;
      const can = it.amount > 0 && r.flowing; audio.pour(can ? r.flow : 0);
      if (can) { if (!st.wasFlow) counters.poursStarted++; st.emitAcc += dt * (25 + r.flow * 110); const sp = world(it, 'spout'), rim = .03;
        const side = new THREE.Vector3(Math.cos(-it.angle * DEG), Math.sin(-it.angle * DEG), 0).multiplyScalar(rim * Math.sign(it.angle)); // 기울어진 쪽 입구 끝
        while (st.emitAcc >= 1) { st.emitAcc--; liquid.grain(tmp2.copy(sp).add(side), Math.sign(it.angle), .6 + r.flow * .6); it.amount = Math.max(0, it.amount - .004); counters.grains++; } }
      st.wasFlow = can; }
    // 담그기: 집게 끝이 액면 아래
    if (it.kind === 'dip' && !bowl.held && !bowl.worn) { const tip = world(it, 'tip'), I = bowlInfo(), dh = Math.hypot(tip.x - I.b.x, tip.z - I.b.z);
      if (dh < .17 && tip.y < I.rimY + .16 && tip.y > I.b.y) p.x += (I.b.x - tip.x) * Math.min(1, dt * 6);          // 입구가 자석처럼 살짝 끌어당김
      const inside = dh < I.rIn * .95 && tip.y < I.rimY;
      const wet = inside && bowl.level > .04 && tip.y < I.surfaceY;
      if (wet && !st.inDip) { counters.dips++; audio.sizzle(1); liquid.bubbles(new THREE.Vector3(tip.x, I.surfaceY, tip.z), 46, 1.3, .05); hud.ripple(); }
      else if (inside && !wet && !st.inDipDry && bowl.level <= .04) { audio.clink(); }
      if (wet) { if (Math.random() < dt * 30) liquid.bubbles(new THREE.Vector3(tip.x, I.surfaceY, tip.z), 2, .7, .03); audio.boil(.6); } else audio.boil(0);
      st.inDip = wet; st.inDipDry = inside && !wet; }
    // 그릇: 흔들면 안의 액체가 출렁
    if (it.kind === 'vessel') { const v = it.prevX == null ? 0 : (p.x - it.prevX) / Math.max(dt, 1e-3); it.slosh = (it.slosh || 0) * .9 + v * .08; it.prevX = p.x; }
    // 놓을 자리 그림자
    const bp = screenOf(basePos(it)), s = it.kind === 'wear' ? null : snapSlot(bp, freeSlots(), aspect());
    if (s) { ring.position.copy(slotPos(s.id)).add(new THREE.Vector3(0, .002, 0)); ring.visible = true; } else ring.visible = false;
  }

  // ── 매 프레임
  let noHandSince = performance.now();
  function update(dt, now){
    const t = now / 1000;
    input.hands.forEach((H, i) => {
      const st = hs[i], hand3 = H3[i];
      if (st.held) {
        const it = st.held;
        if (!H.present && H.src === 'cam') { // 손을 놓침 — 0.4초 공중에 머묾, 그 뒤 제자리로 사뿐히. 깨지지 않는다.
          if (st.lostAt == null) st.lostAt = now;
          if (it.kind === 'pour') { it.angle *= Math.max(0, 1 - dt * 8); it.pivot.rotation.z = -it.angle * DEG; audio.pour(0); }
          if (lostAction(now - st.lostAt) === 'return') { st.held = null; it.held = null; ring.visible = false; counters.lost++; if (it.kind !== 'pump') returnHome(it); st.lostAt = null; }
        } else { st.lostAt = null; if (!H.grab) release(it, i, H); else carry(it, i, H, dt, now); }
      } else if (H.present) {
        const cands = []; for (const it of items.values()) { if (it.worn || it.held != null || it.kind === 'target' || (it.anim && it.anim.t < .6)) continue; const pt = it.kind === 'pump' ? (handle.getWorldPosition(tmp2)) : world(it, 'grip'); const s = screenOf(pt); cands.push({ id: it.id, x: s.x, y: s.y }); }
        const near = pickNearest(H, cands, aspect()); st.hover = near ? items.get(near.id) : null;
        if (H.grab && !st.prevGrab && st.hover) grab(st.hover, i, H);
      } else st.hover = null;
      st.prevGrab = H.grab && H.present;
      // 손 모델
      hand3.visible = !!H.present || (st.held && st.lostAt != null);
      if (H.present) { const hp = stage.screenToPlane(H.x, H.y, WORK_Z + .045, tmp); hand3.position.lerp(hp, H.src === 'cam' ? .6 : 1);
        const want = st.held ? 1 : (H.grab ? .55 : 0); st.curl += (want - st.curl) * Math.min(1, dt * 18); poseHand(hand3, st.curl);
        const ang = st.held && st.held.kind === 'pour' ? st.held.angle : 0; hand3.rotation.z = -ang * DEG + (i ? .12 : -.12);
        const glove = worn.hands; hand3.userData.mat.color.setHex(glove ? 0x2f5fc9 : 0x8e8fd8); hand3.scale.setScalar(glove ? 1.15 : 1); }
    });
    if (input.hands.some(H => H.present)) noHandSince = now; hud.askHands(input.mode === 'cam' && now - noHandSince > LOST_ASK_MS);
    // 놓기·돌아가기 움직임 + 물체 상태
    const hovered = new Set(hs.map(s => s.hover).filter(Boolean));
    for (const it of items.values()) {
      if (it.anim) { const a = it.anim; a.t = Math.min(1, a.t + dt / a.dur); const k = 1 - Math.pow(1 - a.t, 3); it.pivot.position.lerpVectors(a.from, a.to, k); it.pivot.position.y += Math.sin(Math.PI * a.t) * a.arc;
        it.angle = a.fromAng * (1 - k); it.pivot.rotation.z = -it.angle * DEG; if (a.t >= 1) { it.anim = null; if (it.placeSound) { audio.place(it.mat, .6); it.placeSound = false; } } }
      if (it.kind === 'pump' && it.held == null) { pump.handleY += (.40 - pump.handleY) * Math.min(1, dt * 3); handle.position.y = pump.handleY; }
      if (it.hop > 0) { it.hop *= Math.pow(.02, dt); it.model.position.y = Math.abs(Math.sin(t * 40)) * it.hop; if (it.hop < .0005) { it.hop = 0; it.model.position.y = 0; } }
      const glowWant = Math.max(it.glow * (.5 + .5 * Math.sin(t * 4.2)), hovered.has(it) ? .55 : 0, it.held != null ? .05 : 0);
      for (const m of it.mats) { m.emissive.setRGB(glowWant * .55, glowWant * .5, glowWant * .3); }
    }
    // 그릇 액면
    const liq = bowl.model.getObjectByName('liquid'), inner = bowl.model.getObjectByName('inner').userData;
    liq.visible = bowl.level > .01; liq.position.y = .006 + bowl.level * inner.h * .85; const r = inner.rBot + (inner.rTop - inner.rBot) * bowl.level * .85; liq.scale.set(r, r, 1);
    liq.rotation.y = 0; liq.rotation.z = clamp((bowl.slosh || 0), -.25, .25) + Math.sin(t * 9) * Math.min(.06, Math.abs(bowl.slosh || 0) * .3); if (!bowl.held) bowl.slosh = (bowl.slosh || 0) * Math.pow(.05, dt);
    liquid.update(dt, vessels, BENCH_Y);
  }

  return { items, counters, worn, hs, update, occupied, bowl, pump, block,
    benchCount: () => [...occupied.keys()].filter(n => n.startsWith('bench_')).length,
    holding: () => hs.some(s => s.held), heldKinds: () => hs.map(s => s.held && s.held.kind).filter(Boolean),
    glow(id){ for (const it of items.values()) it.glow = it.id === id ? 1 : 0; },
    screenOfItem(id, part = 'grip'){ const it = items.get(id); return screenOf(it.kind === 'pump' && part === 'grip' ? handle.getWorldPosition(new THREE.Vector3()) : world(it, part)); },
    screenOfSlot: n => screenOf(slotPos(n)) };
}
