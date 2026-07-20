/* 케이마블 · 주사위 물리 — 순수 로직 (THREE 없음, 결정론)
 * 정육면체 강체 2개를 접시(원형 아레나) 위로 던진다.
 * 꼭짓점-바닥 임펄스 충돌, 벽 반사, 주사위끼리 구 근사 충돌, 정착 스냅.
 *
 * 결과 강제(모두의 마블 방식): 물리는 자유롭게 굴리고, 멈춘 뒤 윗면이 된
 * "기하 면"에 원하는 눈이 오도록 면→눈 배치를 되돌려 정한다.
 * (마주보는 면의 합 7 유지 — faceValues 참조)
 *
 * throwPair(v1, v2, seed) → {
 *   frames: [ { t, dice: [ {p:[x,y,z], q:[x,y,z,w]}, ... ] }, ... ]   // 60fps
 *   events: [ { t, kind:'bounce'|'clack'|'wall', speed, die }, ... ]
 *   upFace: [i0, i1],            // 각 주사위의 최종 윗면 인덱스 (0..5 = +x,-x,+y,-y,+z,-z)
 *   faceValues: [ [6], [6] ],    // 면 인덱스 → 눈 (BoxGeometry 재질 순서와 동일)
 *   duration: 초
 * } */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KMarbleDice = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  /* ---------- 상수 ---------- */
  const H = 0.34;              // 반변 (주사위 크기 0.68)
  const FLOOR = 0;             // 바닥 y
  const ARENA_R = 2.35;        // 원형 벽 반지름
  const GRAV = -26;
  const REST = 0.36;           // 반발
  const FRIC = 0.42;           // 접촉 마찰
  const LIN_D = 0.0035, ANG_D = 0.006;   // 감쇠/스텝
  const SUB = 1 / 240, OUT = 1 / 60;     // 서브스텝, 출력 프레임
  const MAX_T = 4.2;           // 안전 상한
  const MASS = 1, INV_I = 6 / (MASS * (2 * H) * (2 * H)); // 정육면체 관성 역수 (스칼라 근사)

  /* 면 법선 (로컬): BoxGeometry 재질 순서 = +x,-x,+y,-y,+z,-z */
  const FACE_N = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  /* 꼭짓점 8개 (로컬) */
  const VERTS = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) VERTS.push([sx * H, sy * H, sz * H]);

  /* ---------- 작은 수학 ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const len = a => Math.sqrt(dot(a, a));

  /* 쿼터니언 [x,y,z,w] */
  function qMulV(q, v) { // q * v (벡터 회전)
    const [x, y, z, w] = q;
    const ux = [x, y, z];
    const uv = cross(ux, v);
    const uuv = cross(ux, uv);
    return add(v, add(scl(uv, 2 * w), scl(uuv, 2)));
  }
  function qMul(a, b) {
    return [
      a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
      a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
      a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
      a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
  }
  function qNorm(q) {
    const L = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
    return [q[0] / L, q[1] / L, q[2] / L, q[3] / L];
  }
  function qFromAxis(axis, ang) {
    const s = Math.sin(ang / 2), L = len(axis) || 1;
    return [axis[0] / L * s, axis[1] / L * s, axis[2] / L * s, Math.cos(ang / 2)];
  }
  function qSlerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    let bb = b;
    if (d < 0) { d = -d; bb = [-b[0], -b[1], -b[2], -b[3]]; }
    if (d > 0.9995) return qNorm([a[0] + (bb[0] - a[0]) * t, a[1] + (bb[1] - a[1]) * t, a[2] + (bb[2] - a[2]) * t, a[3] + (bb[3] - a[3]) * t]);
    const th = Math.acos(d), s = Math.sin(th);
    const wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
    return qNorm([a[0] * wa + bb[0] * wb, a[1] * wa + bb[1] * wb, a[2] * wa + bb[2] * wb, a[3] * wa + bb[3] * wb]);
  }

  /* ---------- 강체 한 스텝 ---------- */
  function stepDie(D, dt, ev, t, di) {
    D.v[1] += GRAV * dt;
    D.p = add(D.p, scl(D.v, dt));
    const wl = len(D.w);
    if (wl > 1e-9) {
      const dq = qFromAxis(D.w, wl * dt);
      D.q = qNorm(qMul(dq, D.q));
    }
    D.v = scl(D.v, 1 - LIN_D);
    D.w = scl(D.w, 1 - ANG_D);

    /* 꼭짓점 vs 바닥 */
    let hitSpeed = 0;
    for (const lv of VERTS) {
      const r = qMulV(D.q, lv);
      const wp = add(D.p, r);
      if (wp[1] < FLOOR) {
        const n = [0, 1, 0];
        const u = add(D.v, cross(D.w, r));       // 접점 속도
        const un = dot(u, n);
        if (un < 0) {
          const rn = cross(r, n);
          const jn = -(1 + REST) * un / (1 / MASS + INV_I * dot(rn, rn));
          D.v = add(D.v, scl(n, jn / MASS));
          D.w = add(D.w, scl(cross(r, scl(n, jn)), INV_I));
          /* 마찰 (접선) */
          const u2 = add(D.v, cross(D.w, r));
          const ut = [u2[0], 0, u2[2]];
          const utl = len(ut);
          if (utl > 1e-6) {
            const jt = Math.min(FRIC * Math.abs(jn), MASS * utl);
            const td = scl(ut, -jt / utl);
            D.v = add(D.v, scl(td, 1 / MASS));
            D.w = add(D.w, scl(cross(r, td), INV_I));
          }
          hitSpeed = Math.max(hitSpeed, -un);
        }
        D.p[1] += FLOOR - wp[1];                 // 침투 해소
      }
    }
    if (hitSpeed > 0.55) ev.push({ t, kind: 'bounce', speed: hitSpeed, die: di });

    /* 원형 벽 (중심으로 미는 수평 법선) */
    const horiz = Math.hypot(D.p[0], D.p[2]);
    if (horiz > ARENA_R - H) {
      const n = [-D.p[0] / horiz, 0, -D.p[2] / horiz];
      const un = dot(D.v, n);
      if (un < 0) {
        D.v = add(D.v, scl(n, -(1 + REST * 0.8) * un));
        if (-un > 0.8) ev.push({ t, kind: 'wall', speed: -un, die: di });
      }
      const over = horiz - (ARENA_R - H);
      D.p[0] += n[0] * over; D.p[2] += n[2] * over;
    }
  }

  /* 주사위끼리 — 구 근사 (반지름 = H*√3*0.82) */
  function collidePair(A, B, ev, t) {
    const R = H * 1.42;
    const d = sub(B.p, A.p);
    const L = len(d);
    if (L > 2 * R || L < 1e-9) return;
    const n = scl(d, 1 / L);
    const rel = dot(sub(B.v, A.v), n);
    if (rel < 0) {
      const j = -(1 + REST) * rel / 2;
      A.v = add(A.v, scl(n, -j));
      B.v = add(B.v, scl(n, j));
      /* 살짝 회전도 얻는다 (접점 오프셋 근사) */
      const spin = cross(n, [0, 1, 0]);
      A.w = add(A.w, scl(spin, j * 1.6));
      B.w = add(B.w, scl(spin, -j * 1.6));
      if (-rel > 0.7) ev.push({ t, kind: 'clack', speed: -rel, die: -1 });
    }
    const over = 2 * R - L;
    A.p = add(A.p, scl(n, -over / 2));
    B.p = add(B.p, scl(n, over / 2));
  }

  /* 윗면 인덱스 */
  function upFaceOf(q) {
    let best = 0, bd = -2;
    for (let i = 0; i < 6; i++) {
      const wn = qMulV(q, FACE_N[i]);
      if (wn[1] > bd) { bd = wn[1]; best = i; }
    }
    return best;
  }
  /* 윗면을 정확히 하늘로 스냅한 목표 쿼터니언 (현 yaw는 최대한 유지) */
  function snapTarget(q, up) {
    const wn = qMulV(q, FACE_N[up]);
    const axis = cross(wn, [0, 1, 0]);
    const L = len(axis);
    const ang = Math.acos(Math.max(-1, Math.min(1, wn[1])));
    if (L < 1e-6) return q.slice();
    return qNorm(qMul(qFromAxis(axis, ang), q));
  }

  /* ---------- 면→눈 배치 ----------
   * upFace에 want가 오도록. 마주보는 면(i ↔ i^1)은 합 7. 나머지 4면은 남은 눈을 고정 순서로. */
  function faceValuesFor(upFace, want) {
    const vals = new Array(6).fill(0);
    vals[upFace] = want;
    vals[upFace ^ 1] = 7 - want;
    const rest = [1, 2, 3, 4, 5, 6].filter(v => v !== want && v !== 7 - want);
    /* 남은 두 눈-쌍을 남은 두 면-쌍(짝수 인덱스 i ↔ i+1)에 배치 */
    const restPairs = [];
    const used = new Set([want, 7 - want]);
    for (const v of rest) if (!used.has(v)) { restPairs.push([v, 7 - v]); used.add(v); used.add(7 - v); }
    let k = 0;
    for (let i = 0; i < 6; i += 2) {
      if (vals[i] || vals[i + 1]) continue;
      vals[i] = restPairs[k][0]; vals[i + 1] = restPairs[k][1]; k++;
    }
    return vals;
  }

  /* ---------- 던지기 ---------- */
  function throwOne(rnd, side) {
    /* side: -1 | 1 — 왼/오른쪽에서 안으로 던진다 */
    const D = {
      p: [side * (ARENA_R * 0.62 + rnd() * 0.2), 2.3 + rnd() * 0.7, -ARENA_R * 0.5 - rnd() * 0.3],
      v: [-side * (2.6 + rnd() * 1.6), 0.6 + rnd() * 0.8, 3.0 + rnd() * 1.4],
      q: qNorm([rnd() - 0.5, rnd() - 0.5, rnd() - 0.5, rnd() * 0.6 + 0.4]),
      w: [(rnd() - 0.5) * 26, (rnd() - 0.5) * 26, (rnd() - 0.5) * 26]
    };
    return D;
  }

  function settled(D) {
    if (len(D.v) > 0.12 || len(D.w) > 0.35) return false;
    const wn = qMulV(D.q, FACE_N[upFaceOf(D.q)]);
    return wn[1] > 0.985 && D.p[1] < H * 1.35;
  }

  function throwPair(v1, v2, seed) {
    const rnd = mulberry32((seed == null ? 1 : seed) >>> 0);
    const dice = [throwOne(rnd, -1), throwOne(rnd, 1)];
    const frames = [], events = [];
    let t = 0, nextOut = 0, calm = 0;

    while (t < MAX_T) {
      stepDie(dice[0], SUB, events, t, 0);
      stepDie(dice[1], SUB, events, t, 1);
      collidePair(dice[0], dice[1], events, t);
      t += SUB;
      if (t >= nextOut) {
        frames.push({ t, dice: dice.map(D => ({ p: D.p.slice(), q: D.q.slice() })) });
        nextOut += OUT;
      }
      if (settled(dice[0]) && settled(dice[1])) { calm += SUB; if (calm > 0.12) break; }
      else calm = 0;
    }

    /* 스냅 꼬리: 윗면을 정확히 위로, 높이 H로 (12프레임 slerp) */
    const ups = dice.map(D => upFaceOf(D.q));
    const targets = dice.map((D, i) => snapTarget(D.q, ups[i]));
    const restP = dice.map(D => [D.p[0], H, D.p[2]]);
    const SNAP_N = 12;
    for (let k = 1; k <= SNAP_N; k++) {
      const s = k / SNAP_N, e = 1 - Math.pow(1 - s, 3);
      t += OUT;
      frames.push({
        t,
        dice: dice.map((D, i) => ({
          p: [D.p[0] + (restP[i][0] - D.p[0]) * e, D.p[1] + (restP[i][1] - D.p[1]) * e, D.p[2] + (restP[i][2] - D.p[2]) * e],
          q: qSlerp(D.q, targets[i], e)
        }))
      });
    }
    events.push({ t, kind: 'clack', speed: 1.2, die: -1 });

    return {
      frames, events,
      upFace: ups,
      faceValues: [faceValuesFor(ups[0], v1), faceValuesFor(ups[1], v2)],
      duration: t
    };
  }

  return { throwPair, faceValuesFor, upFaceOf, H, ARENA_R, FACE_N, _internals: { mulberry32, qMulV, qNorm, snapTarget } };
}));
