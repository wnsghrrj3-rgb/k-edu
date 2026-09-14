// Scoped quality experiment: the paleo player and ONE existing deer target only.
// Scene lighting, camera, controls, scenery and mission rules are deliberately owned by their existing modules.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const ASSETS = new URL('../assets/actors/', import.meta.url);
const clamp = THREE.MathUtils.clamp;
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

function prepare(scene) {
  const bones = {};
  scene.traverse(o => {
    if (o.isBone) bones[o.name] = o;
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = true;
      // Animated antlers/limbs must not disappear at the edge of a static bind-pose box.
      o.frustumCulled = false;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        for (const k of ['map', 'normalMap', 'roughnessMap']) if (m[k]) m[k].anisotropy = 4;
      }
    }
  });
  return bones;
}

export function animateExplorer(actor, bones) {
  let weight = 0, lastTime = 0, phase = 0;
  actor.userData.animate = (time, moving) => {
    const dt = clamp(time - lastTime, 0, .05); lastTime = time;
    weight = THREE.MathUtils.damp(weight, moving ? 1 : 0, 9, dt);
    phase += dt * 8.6;
    const breath = Math.sin(time * 1.8);
    bones.hips.position.y = .88 + Math.cos(phase * 2) * .010 * weight + breath * .002;
    bones.hips.rotation.z = Math.sin(phase) * .024 * weight + Math.sin(time * .67) * .006 * (1 - weight);
    bones.hips.rotation.y = Math.sin(phase) * .035 * weight;
    bones.spine.rotation.x = .018 * weight + breath * .005;
    bones.spine.rotation.y = -Math.sin(phase) * .024 * weight;
    bones.head.rotation.y = Math.sin(time * .45) * .035 * (1 - weight);
    bones.head.rotation.x = Math.sin(time * .77) * .012;
    for (const [side, offset] of [['L', 0], ['R', Math.PI]]) {
      const p = phase + offset, swing = Math.sin(p);
      bones['thigh_' + side].rotation.x = swing * .40 * weight;
      // Back-swing bends the knee; support phase straightens it. Arms counter the legs.
      bones['shin_' + side].rotation.x = -Math.max(0, -swing) * .70 * weight;
      bones['foot_' + side].rotation.x = Math.max(0, swing) * .14 * weight;
      bones['arm_' + side].rotation.x = -swing * .29 * weight;
      bones['forearm_' + side].rotation.x = -.09 - Math.max(0, swing) * .13 * weight;
    }
  };
}

export function bindDeer(engine, player, target, actor, bones) {
  const originalCenter = target.center.clone();
  actor.position.set(originalCenter.x, engine.groundY(originalCenter.x, originalCenter.z), originalCenter.z);
  actor.rotation.y = -.7;
  // Preserve the interactable record, its name/type/id and the existing removal path.
  // Every part is inside target.obj so hunting removes the entire animated animal.
  target.obj.clear(); target.obj.position.set(0, 0, 0); target.obj.add(actor);
  const home = actor.position.clone(), proposal = new THREE.Vector3();
  const offset = new THREE.Vector3(), collisionPoint = new THREE.Vector3();
  const centerOffset = new THREE.Vector3(0, .95, 0), reachSize = new THREE.Vector3(.8, 1.9, 2.5);
  let elapsed = 0, headLift = 0, retreat = 0, fleeCooldown = 0, state = 'graze';
  const frame = dt => {
    if (engine.interactables.get(target.name) !== target) {
      const i = engine.onFrame.indexOf(frame); if (i >= 0) engine.onFrame.splice(i, 1);
      return;
    }
    elapsed += dt; fleeCooldown = Math.max(0, fleeCooldown - dt);
    offset.copy(player.pos).sub(actor.position); offset.y = 0;
    const distance = offset.length();
    // A bounded retreat leaves the original spear mission reachable (3.2 m reach).
    if (distance < 1.55 && fleeCooldown === 0 && retreat <= 0) { retreat = .9; fleeCooldown = 5; }
    state = retreat > 0 ? 'retreat' : distance < 3.8 ? 'watch' : distance < 7 ? 'alert' : 'graze';
    const active = player.enabled;
    if (active && retreat > 0) {
      retreat = Math.max(0, retreat - dt);
      const length = Math.max(distance, .01);
      proposal.copy(actor.position).addScaledVector(offset, -dt * 1.65 / length);
      collisionPoint.copy(proposal);
      const gy = engine.groundY(proposal.x, proposal.z);
      const safe = Math.abs(gy - actor.position.y) < .25 && gy > -.45 && proposal.distanceTo(home) < 3.0 &&
        Math.abs(proposal.x) < player.bounds - 1 && Math.abs(proposal.z) < player.bounds - 1 &&
        !engine.collides(collisionPoint, 1.25);
      if (safe) actor.position.set(proposal.x, gy, proposal.z);
      else { retreat = 0; state = 'watch'; }
    }
    const watching = state !== 'graze';
    headLift = THREE.MathUtils.damp(headLift, watching ? 1 : 0, 4, dt);
    const bearing = Math.atan2(-offset.x, -offset.z);
    if (watching && active) {
      const goal = state === 'retreat' ? bearing + Math.PI : bearing;
      actor.rotation.y += angleDelta(actor.rotation.y, goal) * (1 - Math.exp(-dt * 2));
    }
    bones.body.scale.set(1 + Math.sin(elapsed * 2.0) * .004, 1 + Math.sin(elapsed * 2.0) * .003, 1);
    bones.neck.rotation.x = (1 - headLift) * -.95 + Math.sin(elapsed * .7) * .018;
    bones.head.rotation.x = (1 - headLift) * -.28 + Math.sin(elapsed * 1.2) * .022;
    bones.head.rotation.y = watching ? clamp(angleDelta(actor.rotation.y, bearing), -.45, .45) : Math.sin(elapsed * .35) * .11;
    for (const [side, sign] of [['L', -1], ['R', 1]]) {
      const twitch = Math.pow(Math.max(0, Math.sin(elapsed * 2.3 + sign)), 16) * .16;
      bones['ear_' + side].rotation.y = sign * ((1 - headLift) * .24 + twitch);
      bones['ear_' + side].rotation.z = sign * (.04 + (1 - headLift) * .1);
    }
    bones.tail.rotation.x = Math.sin(elapsed * 1.35) * .08;
    bones.tail.rotation.z = Math.pow(Math.max(0, Math.sin(elapsed * .85)), 12) * .20;
    const walking = state === 'retreat' && active;
    for (const [i, leg] of ['front_L', 'front_R', 'hind_L', 'hind_R'].entries()) {
      const p = elapsed * 10 + [0, Math.PI, Math.PI * 1.25, Math.PI * .25][i];
      const wave = Math.sin(p);
      bones[leg].rotation.x = THREE.MathUtils.damp(bones[leg].rotation.x, walking ? wave * .28 : 0, 12, dt);
      bones[leg + '_lower'].rotation.x = THREE.MathUtils.damp(bones[leg + '_lower'].rotation.x, walking ? Math.max(0, -wave) * .34 : 0, 12, dt);
      bones[leg + '_ankle'].rotation.x = THREE.MathUtils.damp(bones[leg + '_ankle'].rotation.x, walking ? -Math.max(0, -wave) * .22 : 0, 12, dt);
    }
    // Use the moving body for interaction, not a costly exact per-vertex skinned AABB.
    // Antlers are intentionally excluded from the reach radius.
    target.center.copy(actor.position).add(centerOffset);
    target.box.setFromCenterAndSize(target.center, reachSize);
    actor.userData.behavior = state;
  };
  engine.onFrame.push(frame); frame(0);
  return frame;
}

export async function enhancePaleoActors(engine, player) {
  const loader = new GLTFLoader();
  // Load both before swapping either; an asset failure keeps both original objects usable.
  const [human, deer] = await Promise.all([
    loader.loadAsync(new URL('paleo-explorer.glb', ASSETS).href),
    loader.loadAsync(new URL('red-deer.glb', ASSETS).href),
  ]);
  const actor = human.scene;
  animateExplorer(actor, prepare(actor));
  actor.visible = player.body.visible;
  actor.position.copy(player.body.position); actor.rotation.copy(player.body.rotation);
  engine.scene.remove(player.body); player.body = actor; engine.scene.add(actor);
  const target = [...engine.interactables.values()].find(t => t.type === 'deer');
  if (target) bindDeer(engine, player, target, deer.scene, prepare(deer.scene));
}
