/* 공통 엔진 · 첫 손길 — 설명 글 없이도 「아, 저걸 누르면 되는구나」를 알게 한다(연구소 설계 v1.1 · 0장 · 자료 firstTouch).
 * F1 들어가면 이미 일이 벌어지고 있다(자리가 맡는다) · F2 3초 안에 캐릭터가 그 자리의 일을 한 번 해 보인다 · F3 해 보인 뒤 누를 것 하나에 빛 고리가 숨 쉬듯 뛰고,
 * 그래도 손이 없으면 반투명 손이 누르는 시늉을 한 번 · F4 첫 손길은 누르기 한 번(자리가 맡는다) · F5 손을 쉬면 다른 것으로 다시 해 보이고, 아이가 한 일이 넷이 되면 그만둔다.
 * 자리는 `first = { show(n)(n 번째 해 보이기 — brain.run 으로 캐릭터가 한다), ready()(해 보이기에서 낱말까지 나왔는가 — 그때부터 고리를 띄워도 된다 · 없어도 됨),
 *   ring()(빛 고리가 뛸 곳 → Vector3 | null), r()(고리 반지름) }` 만 넘긴다.
 * 때는 놀이의 시계(dt)로 잰다. 수치는 자료에서(cfg). */
import * as THREE from 'three';
import { clamp } from './stage.js';

export const FIRST = { SHOW_AT: 1.0, READY_RING: 0.3, GHOST_SEC: 1.5, RING_R: 0.42 };      // 들어가서 해 보이기까지(자리 옮기기 1.2초 뒤) · 손 시늉의 길이 · 고리의 기본 반지름
/** o = { scene, stage, cfg(자료의 firstTouch), brain, holding(), moving(), off(끔 — 확인용 ?nofirst) } */
export function createFirst(o) {
  const { stage, cfg, brain } = o, col = new THREE.Color(cfg.ring.color);
  const mk = (a, b, op) => { const m = new THREE.Mesh(new THREE.RingGeometry(a, b, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.renderOrder = 20; m.visible = false; o.scene.add(m); return m; };
  const ring = mk(0.86, 1, 0.95), wave = mk(0.94, 1, 0.6);
  // 반투명 손(검지로 누르는 꼴) — 그림 한 장
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; { const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.strokeStyle = 'rgba(90,60,30,.85)'; x.lineWidth = 6; x.lineJoin = 'round';
    const rr = (px, py, w, h, r) => { x.beginPath(); x.roundRect(px, py, w, h, r); x.fill(); x.stroke(); }; rr(34, 62, 62, 54, 20); rr(74, 50, 20, 40, 10); rr(54, 44, 20, 40, 10); rr(34, 8, 22, 82, 11); rr(14, 66, 26, 22, 11); x.fillRect(40, 70, 50, 38); }
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0, depthTest: false })); hand.renderOrder = 21; hand.visible = false; o.scene.add(hand);
  const F = { t: 0, idle: 0, acts: 0, shown: 0, state: 'wait', ringIn: 0, ringT: 0, ghostIn: 0, ghostT: -1, ghosts: 0, on: false, st: null, log: [] }, at = new THREE.Vector3(), v = new THREE.Vector3();
  const hide = () => { ring.visible = wave.visible = false; F.on = false; };
  /** 그 자리에 들어갔다(처음부터 다시 잰다). */
  function enter() { F.t = 0; F.idle = 0; F.acts = 0; F.shown = 0; F.state = 'wait'; F.ghostT = -1; F.ghosts = 0; hide(); hand.visible = false; F.log.push('enter'); }
  function show(st) { F.state = 'show'; F.shownAt = F.t; hide(); st.first.show(F.shown++); F.log.push('show' + F.shown); }
  /** 매 장면. st = 지금 자리(first 가 없거나 옮기는 중이면 쉰다). */
  function tick(dt, st) {
    if (o.off || !st || !st.first) { hide(); hand.visible = false; return; }
    F.t += dt; F.idle += dt; F.st = st;
    if (F.acts >= cfg.untilActs) { hide(); hand.visible = false; return; }                     // 아이가 넷을 해 봤으면 그만 — 이제는 부탁의 차례
    const free = !brain.busy && !o.holding() && !(o.moving && o.moving());
    if (F.state === 'wait') { if (F.t >= FIRST.SHOW_AT && free) show(st); }
    else if (F.state === 'show') {                                                             // 해 보이기가 끝났다(또는 자리가 「낱말까지 나왔다」고 알렸다 — first.ready) → 빛 고리
      const rdy = st.first.ready && st.first.ready(); if (rdy || (!brain.busy && F.t - F.shownAt > 0.6)) { F.state = 'ring'; F.ringIn = rdy ? FIRST.READY_RING : cfg.ring.after; F.idle = 0; } }
    else if (F.state === 'ring') {
      if (F.ringIn > 0) { if ((F.ringIn -= dt) <= 0) { F.on = true; F.ringT = 0; F.ghostIn = cfg.ghost; F.log.push('ring'); } }
      else if (F.idle >= cfg.again && free && F.ghostT < 0) show(st);                         // 손을 쉬면 다른 것으로 다시 해 보인다
    }
    const p = F.on && st.first.ring ? st.first.ring() : null;
    if (!p) { ring.visible = wave.visible = false; hand.visible = false; return; }
    at.copy(p); F.ringT += dt; const r = (st.first.r ? st.first.r() : FIRST.RING_R), u = (F.ringT % cfg.ring.pulse) / cfg.ring.pulse, br = 1 + 0.1 * Math.sin(u * Math.PI * 2);
    ring.visible = wave.visible = true; ring.position.copy(at); wave.position.copy(at); ring.quaternion.copy(stage.camera.quaternion); wave.quaternion.copy(stage.camera.quaternion);
    ring.scale.setScalar(r * br); ring.material.opacity = 0.75 + 0.2 * Math.sin(u * Math.PI * 2); wave.scale.setScalar(r * (1 + 0.55 * u)); wave.material.opacity = 0.55 * (1 - u);
    // 손 시늉: 고리가 뜨고도 손이 없으면 한 번
    if (F.ghostT < 0 && F.ghosts < 1 && (F.ghostIn -= dt) <= 0) { F.ghostT = 0; F.ghosts++; F.log.push('ghost'); }
    if (F.ghostT >= 0) {
      F.ghostT += dt; const k = F.ghostT / FIRST.GHOST_SEC, down = clamp(k / 0.45, 0, 1), press = clamp((k - 0.45) / 0.15, 0, 1) * (1 - clamp((k - 0.6) / 0.15, 0, 1)), fade = clamp(k / 0.15, 0, 1) * (1 - clamp((k - 0.8) / 0.2, 0, 1));
      const e = down * down * (3 - 2 * down), s = r * 1.5; hand.visible = true; hand.material.opacity = 0.62 * fade; hand.scale.set(s * (1 - 0.1 * press), s * (1 - 0.1 * press), 1);
      v.set(0.3 * s * (1 - e) + 0.18 * s, -0.42 * s - 0.55 * s * (1 - e), 0).applyQuaternion(stage.camera.quaternion); hand.position.copy(at).add(v);
      if (k >= 1) { F.ghostT = -1; hand.visible = false; F.idle = Math.max(F.idle, cfg.again - 2.5); }
    } else hand.visible = false;
  }
  return { tick, enter, F,
    /** 아이가 화면을 건드렸다. */
    touch() { F.idle = 0; if (F.ghostT >= 0) { F.ghostT = -1; hand.visible = false; } },
    /** 아이가 일 하나를 했다(고리를 거둔다 — 손을 쉬면 다른 것으로 다시 해 보인다). */
    act() { F.acts++; F.idle = 0; hide(); if (F.state === 'ring') { F.ringIn = 0; F.on = false; } if (F.state === 'wait') F.state = 'ring'; },
    /** 빛 고리가 화면 어디에 있나(확인용 tapRing) — 없으면 null. */
    ringScreen() { const st = F.st, p = F.on && st && st.first.ring ? st.first.ring() : null; return p ? stage.screenOf(p) : null; },
    summary: () => ({ shown: F.shown, ring: F.on, acts: F.acts, ghosts: F.ghosts, state: F.state }),
  };
}
