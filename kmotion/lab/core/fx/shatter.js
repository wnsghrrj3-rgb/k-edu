// 케이모션 과학실 — 깨짐: 미리 쪼개 둔 조각 묶음을 치는 순간 흩뜨린다 (설계 6-3)
// 물리 엔진 없이 직접 계산: 던져짐 · 중력 · 상판에서 튐 · 미끄러짐 · 돎 · 납작하게 눕고 멈춤. 조각은 구(반지름 둘: 구를 때·누웠을 때)로 어림한다.
// + 아주 작은 반짝 조각(한 번에 그림). 느린 동작은 timeScale(또는 무대가 주는 dt)로. 시간은 update(dt) 로만 흐른다.
import * as THREE from 'three';

const G = 9.8, MU = .55;
const SPEED = [0, .3, .7, 1.2];       // 세기 1(톡)·2(탁)·3(쾅)의 던지는 빠르기(m/s)

/**
 * const shatter = createShatter(ctx)
 *   const h = shatter.burst(shards:Object3D[], { point:Vector3(맞은 자리), strength:1|2|3, benchY, dir:Vector3(치는 방향, 기본 아래), radius(물체 크기 어림), tint:색 })
 *     - shards: 따로 떨어진 Object3D 들(원점 = 조각의 무게중심). 부르면 장면 바로 아래로 옮겨져(세계 자리 유지) 보이게 된다. 통짜 메시는 부르는 쪽에서 숨긴다.
 *   매 프레임: shatter.update(dt)      · 느린 동작: shatter.timeScale = 0.35
 *   읽기: shatter.awake(아직 움직이는 조각 수) · h.settled · h.clear()(조각 치우기)
 *   소리: shatter.onBounce = (speed, position) => { … }
 */
export function createShatter(ctx, opt = {}){
  const { scene } = ctx, rand = ctx.rand, B = ctx.bench, N = opt.glitter || ctx.q.glitter;
  const groups = [];
  // ── 반짝 조각
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .1, metalness: 0, flatShading: true, envMapIntensity: 2.4, emissive: 0xaec4dc, emissiveIntensity: .22 });
  const glit = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1, 0), gm, N); glit.name = 'fx_glitter'; glit.instanceMatrix.setUsage(THREE.DynamicDrawUsage); glit.frustumCulled = false; glit.count = 0; glit.castShadow = false; scene.add(glit);
  // cols = 조각마다의 색(자리 고정), instanceColor = 그릴 차례대로
  const cols = new Float32Array(N * 3).fill(1); glit.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3).fill(1), 3); glit.instanceColor.setUsage(THREE.DynamicDrawUsage);
  const GP = new Float32Array(N * 14);   // p3 v3 축3 각 돎 크기 남은시간 닿음
  let gcur = 0;
  const m4 = new THREE.Matrix4(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), qI = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), box = new THREE.Box3(), tint = new THREE.Color(), white = new THREE.Color(0xf4f8ff), c1 = new THREE.Color();
  const groundAt = (x, z, benchY) => (x > B.x0 && x < B.x1 && z > B.z0 && z < B.z1) ? benchY : B.floorY;

  function burst(shards, o = {}){
    const strength = Math.min(3, Math.max(1, Math.round(o.strength || 2))), S = SPEED[strength], benchY = o.benchY ?? B.y, point = o.point, R = o.radius ?? .05;
    const hx = o.dir ? o.dir.x : 0, hz = o.dir ? o.dir.z : 0;
    const g = { bodies: [], benchY, awake: 0, clear(){ for (const b of g.bodies) b.o.removeFromParent(); g.bodies.length = 0; const i = groups.indexOf(g); if (i >= 0) groups.splice(i, 1); }, get settled(){ return g.awake === 0; } };
    // 조각들의 가운데(세계): 위에서 내리치면 조각은 맞은 자리에서 '아래로'가 아니라 가운데에서 '옆으로' 흩어진다(아래는 상판이 막고 있다)
    let mx = 0, mz = 0;
    for (const o3 of shards) { scene.attach(o3); o3.visible = true; o3.updateWorldMatrix(false, true); mx += o3.position.x; mz += o3.position.z; }
    if (shards.length) { mx /= shards.length; mz /= shards.length; }
    for (const o3 of shards) {
      // 조각 크기: 가장 얇은 쪽(누웠을 때 높이)과 가운데 치수(구를 때 반지름)
      let ex, ey, ez; const sc = o3.scale;
      if (o3.isMesh) { const ge = o3.geometry; if (!ge.boundingBox) ge.computeBoundingBox(); const bb = ge.boundingBox; ex = (bb.max.x - bb.min.x) * sc.x / 2; ey = (bb.max.y - bb.min.y) * sc.y / 2; ez = (bb.max.z - bb.min.z) * sc.z / 2; }
      else { box.setFromObject(o3); ex = (box.max.x - box.min.x) / 2; ey = (box.max.y - box.min.y) / 2; ez = (box.max.z - box.min.z) / 2; }
      const thin = Math.min(ex, ey, ez), big = Math.max(ex, ey, ez), mid = ex + ey + ez - thin - big;
      const b = { o: o3, v: new THREE.Vector3(), w: new THREE.Vector3(), axis: new THREE.Vector3(ex === thin ? 1 : 0, ex !== thin && ey === thin ? 1 : 0, ex !== thin && ey !== thin ? 1 : 0),
        rThin: Math.max(.0006, thin), rRoll: Math.max(.0012, Math.min(big, (mid + thin) * .5)), e: .22 + rand() * .22, asleep: false, lie: 0, hits: 0 };
      // 던지기: 맞은 자리에서 바깥으로, 가까울수록 세게. 내리치면 옆으로 퍼지며 튀어 오른다
      const dist = o3.position.distanceTo(point);
      let ax = o3.position.x - mx, az = o3.position.z - mz; const al = Math.hypot(ax, az);
      if (al < R * .12) { const an = rand() * 6.283; ax = Math.cos(an); az = Math.sin(an); } else { const j = (rand() - .5) * .9, c = Math.cos(j), s = Math.sin(j); const tx = ax / al, tz = az / al; ax = tx * c - tz * s; az = tx * s + tz * c; }   // 가운데 가까운 조각은 아무 쪽으로 · 바깥 조각은 제 쪽으로(조금 흔들어)
      const near = 1 / (1 + dist / Math.max(.01, R) * .9), weak = strength === 1 && dist > R * .7 ? .25 : 1, sp = S * weak * (.45 + .8 * rand()) * (.55 + .6 * near);
      b.v.set(ax * sp + hx * S * .3, S * weak * (.12 + .55 * rand()) * (.4 + .6 * near), az * sp + hz * S * .3);
      const ws = (3 + 11 * rand()) * (.5 + S) * weak; b.w.set(rand() - .5, rand() - .5, rand() - .5).normalize().multiplyScalar(ws);
      g.bodies.push(b);
    }
    g.awake = g.bodies.length; groups.push(g);
    // 반짝 조각
    if (o.glitter !== false) { tint.set(o.tint ?? 0xffffff); const cnt = Math.round(N * [0, .25, .6, 1][strength]);
      for (let k = 0; k < cnt; k++) { const i = gcur++ % N, p = i * 14, a = rand() * 6.283, el = rand(), rr = R * Math.cbrt(rand()), s = S * (.35 + 1.5 * rand());
        GP[p] = point.x + Math.cos(a) * rr * .8; GP[p + 1] = point.y + (rand() - .3) * R * .6; GP[p + 2] = point.z + Math.sin(a) * rr * .8;
        GP[p + 3] = Math.cos(a) * s * (1 - el * .6); GP[p + 4] = s * (.25 + el * .95); GP[p + 5] = Math.sin(a) * s * (1 - el * .6);
        v1.set(rand() - .5, rand() - .5, rand() - .5).normalize(); GP[p + 6] = v1.x; GP[p + 7] = v1.y; GP[p + 8] = v1.z; GP[p + 9] = rand() * 6.283; GP[p + 10] = 12 + rand() * 40;
        GP[p + 11] = .0012 + rand() * rand() * .0042; GP[p + 12] = 2.4 + rand() * 2.6; GP[p + 13] = 0;
        c1.copy(tint).lerp(white, .35 + rand() * .65); cols[i * 3] = c1.r; cols[i * 3 + 1] = c1.g; cols[i * 3 + 2] = c1.b; }
    }
    // 찬 가루 김
    if (ctx.fog && o.dust !== false) for (let k = 0; k < 3 + strength * 3; k++) { const a = rand() * 6.283, s = .1 + rand() * .25 * strength; ctx.fog.emit(point.x, point.y + .01, point.z, Math.cos(a) * s, .08 + rand() * .15, Math.sin(a) * s, .04, .14 + rand() * .1, 1.1 + rand() * .9, .13); }
    return g;
  }

  function stepBody(b, h, benchY){
    const o = b.o, p = o.position, v = b.v, w = b.w;
    v.y -= G * h; p.x += v.x * h; p.y += v.y * h; p.z += v.z * h;
    const ws = w.length(); if (ws > 1e-4) { q1.setFromAxisAngle(v1.copy(w).multiplyScalar(1 / ws), ws * h); o.quaternion.premultiply(q1); }
    let gy = groundAt(p.x, p.z, benchY); const rc = b.rRoll + (b.rThin - b.rRoll) * b.lie;
    if (gy === benchY && p.y < benchY - .05) gy = B.floorY;                                  // 가장자리 밖으로 떨어진 뒤 상판 밑으로 들어온 조각은 바닥까지 간다
    if (p.y - rc < gy) {
      p.y = gy + rc;
      if (v.y < -.38) {                                                                       // 튐
        const hit = -v.y; v.y = hit * b.e; v.x *= .7; v.z *= .7; b.hits++;
        w.multiplyScalar(.5); w.x += (rand() - .5) * hit * 9; w.y += (rand() - .5) * hit * 4; w.z += (rand() - .5) * hit * 9;
        if (api.onBounce) api.onBounce(hit, p);
      } else {                                                                                // 미끄러지다 눕는다
        v.y = 0; const sp = Math.hypot(v.x, v.z), dec = MU * G * h; if (sp <= dec) { v.x = 0; v.z = 0; } else { const k = (sp - dec) / sp; v.x *= k; v.z *= k; }
        w.multiplyScalar(Math.exp(-12 * h)); b.lie = Math.min(1, b.lie + h * 5);
        v2.copy(b.axis).applyQuaternion(o.quaternion); v3.set(0, v2.y >= 0 ? 1 : -1, 0); q2.setFromUnitVectors(v2, v3); q1.copy(qI).slerp(q2, Math.min(1, h * 12)); o.quaternion.premultiply(q1);   // 얇은 쪽이 위아래를 보게
        if (sp < .012 && b.lie >= 1 && ws < .4) { b.asleep = true; v.set(0, 0, 0); w.set(0, 0, 0); return; }
      }
    }
  }

  const api = {
    timeScale: 1, awake: 0, onBounce: null, glitter: glit, groups, burst,
    update(dt){
      dt *= api.timeScale; if (!(dt > 0)) return;
      let awake = 0;
      for (let gi = 0; gi < groups.length; gi++) { const g = groups[gi]; if (g.awake === 0) continue; let a = 0;
        const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
        for (let k = 0; k < g.bodies.length; k++) { const b = g.bodies[k]; if (b.asleep) continue; for (let s = 0; s < steps && !b.asleep; s++) stepBody(b, h, g.benchY); if (!b.asleep) a++; if (b.o.position.y < B.floorY - 1) { b.asleep = true; b.o.visible = false; } }
        g.awake = a; awake += a; }
      api.awake = awake;
      // 반짝 조각
      let n = 0; const M = glit.instanceMatrix.array, C = glit.instanceColor.array;
      for (let i = 0; i < N; i++) { const p = i * 14; if (GP[p + 12] <= 0) continue; GP[p + 12] -= dt; if (GP[p + 12] <= 0) continue;
        if (GP[p + 13] < 3) { GP[p + 4] -= G * dt; GP[p] += GP[p + 3] * dt; GP[p + 1] += GP[p + 4] * dt; GP[p + 2] += GP[p + 5] * dt; GP[p + 9] += GP[p + 10] * dt;
          const gy = groundAt(GP[p], GP[p + 2], B.y) + GP[p + 11] * .5;
          if (GP[p + 1] < gy && GP[p + 4] < 0 && GP[p + 1] > gy - .05) { GP[p + 1] = gy; if (GP[p + 4] < -.3 && GP[p + 13] < 2) { GP[p + 4] *= -.35; GP[p + 3] *= .6; GP[p + 5] *= .6; GP[p + 13]++; GP[p + 10] *= .6; } else { GP[p + 13] = 3; } } }
        else { const f = Math.exp(-6 * dt); GP[p + 3] *= f; GP[p + 5] *= f; GP[p] += GP[p + 3] * dt; GP[p + 2] += GP[p + 5] * dt; }
        const s = GP[p + 11] * Math.min(1, GP[p + 12] / .5);
        q1.setFromAxisAngle(v1.set(GP[p + 6], GP[p + 7], GP[p + 8]), GP[p + 9]); m4.compose(v2.set(GP[p], GP[p + 1], GP[p + 2]), q1, v3.set(s, s * .55, s * 1.3)); m4.toArray(M, n * 16);
        C[n * 3] = cols[i * 3]; C[n * 3 + 1] = cols[i * 3 + 1]; C[n * 3 + 2] = cols[i * 3 + 2];
        n++; }
      glit.count = n; glit.instanceMatrix.needsUpdate = true; if (n) glit.instanceColor.needsUpdate = true;
    },
    clear(){ while (groups.length) groups[0].clear(); GP.fill(0); glit.count = 0; },
    dispose(){ api.clear(); scene.remove(glit); glit.geometry.dispose(); gm.dispose(); },
  };
  return api;
}
