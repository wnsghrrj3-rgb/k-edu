/* 케이파크 · 🎯 사격 게임장 — 순수 로직 (UI·THREE 없음, 결정론)
 * 새총으로 공을 쏴서: 캔 타워 무너뜨리기 · 풍선 터뜨리기 · 오리 행렬 맞추기 · 회전 과녁.
 *
 * 물리: 공(구) 탄도 + 캔(원기둥) 강체 — 케이마블 주사위와 같은 임펄스 수학.
 * simulateShot(world, aim) → 발사 전체를 미리 계산해 { frames, events, result } 반환.
 * 프레임 60fps, 이벤트(clang/pop/quack/ring/fall/thud)는 타임스탬프 포함 → 소리 예약용. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KShootCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  /* ---------- 상수 ---------- */
  const GRAV = -9.6;
  const BALL_R = 0.09;
  const CAN_R = 0.14, CAN_H = 0.42;
  const SHELF = { y: 0, x0: -1.7, x1: 1.7, z0: -0.55, z1: 0.4 };  // 선반 (캔이 밖이면 낙하)
  const PIT_Y = -1.5;            // 바닥(구덩이) — 여기 떨어지면 완전 아웃
  const REST = 0.3, FRIC = 0.5;
  const SUB = 1 / 240, OUT = 1 / 60, MAX_T = 5.0;
  const MASS_CAN = 1, INV_I_CAN = 6 / (MASS_CAN * CAN_H * CAN_H);
  const BALL_SPEED = 11.5;       // power 1.0 기준
  const MUZZLE = [0, 0.55, 4.4]; // 발사 위치

  /* ---------- 수학 (케이마블 주사위와 동일 계열) ---------- */
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
  function qMulV(q, v) {
    const u = [q[0], q[1], q[2]];
    const uv = cross(u, v), uuv = cross(u, uv);
    return add(v, add(scl(uv, 2 * q[3]), scl(uuv, 2)));
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

  /* 캔 접촉점 — 위/아래 테두리 링 4점씩 */
  const CAN_PTS = [];
  for (const sy of [-1, 1]) for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    CAN_PTS.push([Math.cos(a) * CAN_R, sy * CAN_H / 2, Math.sin(a) * CAN_R]);
  }

  /* ---------- 스테이지 ----------
   * kind: cans | balloons | ducks | targets
   * shots: 발 수. goal: 안내문. */
  const STAGES = [
    {
      id: 'pyramid', kind: 'cans', em: '🥫', nm: '캔 피라미드', shots: 3,
      goal: '캔 여섯 개를 전부 선반 아래로!',
      cans: [
        { x: -0.30, z: -0.1 }, { x: 0, z: -0.1 }, { x: 0.30, z: -0.1 },
        { x: -0.15, z: -0.1, tier: 1 }, { x: 0.15, z: -0.1, tier: 1 },
        { x: 0, z: -0.1, tier: 2, gold: true }
      ]
    },
    {
      id: 'towers', kind: 'cans', em: '🏗️', nm: '쌍둥이 타워', shots: 4,
      goal: '두 탑, 캔 여덟 개를 모두 무너뜨려!',
      cans: [
        { x: -0.75, z: -0.1 }, { x: -0.45, z: -0.1 }, { x: -0.6, z: -0.1, tier: 1 }, { x: -0.6, z: -0.1, tier: 2, gold: true },
        { x: 0.45, z: -0.1 }, { x: 0.75, z: -0.1 }, { x: 0.6, z: -0.1, tier: 1 }, { x: 0.6, z: -0.1, tier: 2, gold: true }
      ]
    },
    {
      id: 'balloons', kind: 'balloons', em: '🎈', nm: '풍선 축제', shots: 5,
      goal: '둥실둥실 풍선 일곱 개를 모두 팡!',
      balloons: [
        { x: -1.2, y: 1.0 }, { x: -0.8, y: 1.5 }, { x: -0.4, y: 0.9 }, { x: 0, y: 1.6 },
        { x: 0.4, y: 1.0 }, { x: 0.8, y: 1.45 }, { x: 1.2, y: 0.95 }
      ]
    },
    {
      id: 'ducks', kind: 'ducks', em: '🦆', nm: '오리 퍼레이드', shots: 5,
      goal: '행진하는 오리 다섯 마리를 전부 폴짝!',
      ducks: [
        { row: 0, phase: 0.0 }, { row: 0, phase: 0.4 }, { row: 1, phase: 0.15 },
        { row: 1, phase: 0.6 }, { row: 0, phase: 0.8 }
      ]
    },
    {
      id: 'targets', kind: 'targets', em: '🎯', nm: '회전 과녁', shots: 3,
      goal: '빙글빙글 과녁 — 한가운데 노리기!',
      targets: [
        { x: -1.0, y: 1.1, r: 0.34, spin: 1.1 },
        { x: 0, y: 1.35, r: 0.28, spin: -1.5 },
        { x: 1.0, y: 1.1, r: 0.34, spin: 1.9 }
      ]
    }
  ];

  /* 오리 위치 — 판정·렌더 공용. row0 = 앞줄(오른쪽으로), row1 = 뒷줄(왼쪽으로) */
  const DUCK_SPAN = 1.55, DUCK_SPEED = [0.19, 0.14], DUCK_Y = [0.35, 0.85], DUCK_Z = [-0.05, -0.35], DUCK_R = 0.17;
  function duckPos(d, t) {
    const dir = d.row === 0 ? 1 : -1;
    const u = (d.phase + t * DUCK_SPEED[d.row]) % 1;
    const x = dir * (-DUCK_SPAN + u * 2 * DUCK_SPAN);
    return [x, DUCK_Y[d.row] + Math.sin((d.phase * 7 + t * 3)) * 0.03, DUCK_Z[d.row]];
  }
  /* 과녁 중심 흔들림 (스핀은 시각 연출, 판정은 링 반경) */
  function targetPos(tg, t) {
    return [tg.x + Math.sin(t * tg.spin) * 0.12, tg.y + Math.cos(t * tg.spin * 0.7) * 0.08, -0.35];
  }

  /* ---------- 새 판 ---------- */
  function newWorld(stageIdx, seed) {
    const st = STAGES[stageIdx];
    const rnd = mulberry32((seed == null ? 7 : seed) >>> 0);
    const w = {
      stage: stageIdx, kind: st.kind, shotsLeft: st.shots, t: 0,
      cans: [], balloons: [], ducks: [], targets: [], scoreRings: [], done: false
    };
    if (st.cans) w.cans = st.cans.map((c, i) => ({
      id: i, gold: !!c.gold,
      p: [c.x + (rnd() - 0.5) * 0.004, (c.tier || 0) * CAN_H + CAN_H / 2, c.z + (rnd() - 0.5) * 0.004],
      q: [0, 0, 0, 1], v: [0, 0, 0], w: [0, 0, 0],
      state: 'stand'                    // stand | live | out
    }));
    if (st.balloons) w.balloons = st.balloons.map((b, i) => ({ id: i, x: b.x, y: b.y, alive: true }));
    if (st.ducks) w.ducks = st.ducks.map((d, i) => ({ id: i, row: d.row, phase: d.phase, alive: true }));
    if (st.targets) w.targets = st.targets.map((tg, i) => ({ id: i, x: tg.x, y: tg.y, r: tg.r, spin: tg.spin, hits: [] }));
    return w;
  }

  /* ---------- 캔 강체 스텝 ---------- */
  function stepCan(cn, dt, ev, t) {
    cn.v[1] += GRAV * dt;
    cn.p = add(cn.p, scl(cn.v, dt));
    const wl = len(cn.w);
    if (wl > 1e-9) cn.q = qNorm(qMul(qFromAxis(cn.w, wl * dt), cn.q));
    cn.v = scl(cn.v, 1 - 0.004);
    cn.w = scl(cn.w, 1 - 0.008);

    const onShelf = cn.p[0] > SHELF.x0 && cn.p[0] < SHELF.x1 && cn.p[2] > SHELF.z0 && cn.p[2] < SHELF.z1;
    const floorY = onShelf ? SHELF.y : PIT_Y;
    if (!onShelf && cn.state === 'live' && cn.p[1] < SHELF.y - 0.3 && !cn.fell) {
      cn.fell = true;
      ev.push({ t, kind: 'fall', id: cn.id, gold: cn.gold });
    }
    let hit = 0;
    for (const lp of CAN_PTS) {
      const r = qMulV(cn.q, lp);
      const wp = add(cn.p, r);
      if (wp[1] < floorY) {
        const n = [0, 1, 0];
        const u = add(cn.v, cross(cn.w, r));
        const un = dot(u, n);
        if (un < 0) {
          const rn = cross(r, n);
          const jn = -(1 + REST) * un / (1 / MASS_CAN + INV_I_CAN * dot(rn, rn));
          cn.v = add(cn.v, scl(n, jn / MASS_CAN));
          cn.w = add(cn.w, scl(cross(r, scl(n, jn)), INV_I_CAN));
          const u2 = add(cn.v, cross(cn.w, r));
          const ut = [u2[0], 0, u2[2]], utl = len(ut);
          if (utl > 1e-6) {
            const jt = Math.min(FRIC * Math.abs(jn), MASS_CAN * utl);
            const td = scl(ut, -jt / utl);
            cn.v = add(cn.v, td);
            cn.w = add(cn.w, scl(cross(r, td), INV_I_CAN));
          }
          hit = Math.max(hit, -un);
        }
        cn.p[1] += floorY - wp[1];
      }
    }
    if (hit > 0.7) ev.push({ t, kind: 'thud', speed: hit, pos: cn.p.slice() });
    if (cn.p[1] < PIT_Y + 0.1 && cn.state === 'live') { cn.state = 'out'; }
  }

  /* 캔끼리 — 구 근사 */
  function collideCans(A, B, ev, t) {
    const R = CAN_R * 1.5;
    const d = sub(B.p, A.p), L = len(d);
    if (L > 2 * R || L < 1e-9) return;
    const n = scl(d, 1 / L);
    wake(A); wake(B);
    const rel = dot(sub(B.v, A.v), n);
    if (rel < 0) {
      const j = -(1 + REST) * rel / 2;
      A.v = add(A.v, scl(n, -j));
      B.v = add(B.v, scl(n, j));
      const spin = cross(n, [0, 1, 0]);
      A.w = add(A.w, scl(spin, j * 1.2));
      B.w = add(B.w, scl(spin, -j * 1.2));
      if (-rel > 0.6) ev.push({ t, kind: 'clang', speed: -rel, pos: A.p.slice() });
    }
    const over = 2 * R - L;
    A.p = add(A.p, scl(n, -over / 2));
    B.p = add(B.p, scl(n, over / 2));
  }
  function wake(cn) { if (cn.state === 'stand') cn.state = 'live'; }

  /* 공 vs 캔 — 구-구 임펄스 (공이 훨씬 가볍고 빠름 → 캔에 운동량 전달) */
  function ballHitCan(ball, cn, ev, t) {
    const R = BALL_R + CAN_R * 1.15;
    const d = sub(cn.p, ball.p), L = len(d);
    if (L > R || L < 1e-9) return false;
    const n = scl(d, 1 / L);
    const rel = dot(sub(cn.v, ball.v), n);
    if (rel < 0) {
      wake(cn);
      const j = -(1 + 0.25) * rel * 0.42;      // 공 질량 몫
      cn.v = add(cn.v, scl(n, j));
      /* 명중 높이에 따라 회전 — 위를 맞으면 시원하게 넘어간다 */
      const hitY = ball.p[1] - cn.p[1];
      const r = [-n[0] * CAN_R, hitY, -n[2] * CAN_R];
      cn.w = add(cn.w, scl(cross(r, scl(n, j * 2.2)), INV_I_CAN));
      ball.v = scl(ball.v, 0.35);
      ball.v[1] += 0.8;
      ev.push({ t, kind: 'clang', speed: -rel, pos: cn.p.slice(), strong: true });
      return true;
    }
    return false;
  }

  /* ---------- 한 발 시뮬 ----------
   * world는 복제 후 갱신되어 반환 (호출자가 교체). aim: {dir:[x,y,z] 정규화, power:0..1}
   * frames: { t, ball:[x,y,z]|null, cans:[{p,q}] } — 풍선·오리·과녁은 절차(시간 함수) + 이벤트 */
  function simulateShot(world, aim, seed) {
    const w = JSON.parse(JSON.stringify(world));
    const ev = [], frames = [];
    const rnd = mulberry32((seed == null ? 3 : seed) >>> 0);
    const speed = BALL_SPEED * (0.45 + 0.55 * Math.max(0, Math.min(1, aim.power)));
    const ball = { p: MUZZLE.slice(), v: scl(aim.dir, speed), alive: true };
    const t0 = w.t;
    let t = 0, nextOut = 0, ballGone = 0;

    const liveCans = () => w.cans.filter(c => c.state !== 'out');

    while (t < MAX_T) {
      /* 공 */
      if (ball.alive) {
        ball.v[1] += GRAV * SUB;
        ball.p = add(ball.p, scl(ball.v, SUB));
        /* 선반 바운스 */
        const onShelf = ball.p[0] > SHELF.x0 && ball.p[0] < SHELF.x1 && ball.p[2] > SHELF.z0 && ball.p[2] < SHELF.z1;
        const fy = onShelf ? SHELF.y : PIT_Y;
        if (ball.p[1] < fy + BALL_R && ball.v[1] < 0) {
          ball.p[1] = fy + BALL_R;
          ball.v[1] *= -0.45; ball.v[0] *= 0.8; ball.v[2] *= 0.8;
          if (Math.abs(ball.v[1]) > 0.5) ev.push({ t, kind: 'bounce', pos: ball.p.slice() });
        }
        /* 뒷벽 */
        if (ball.p[2] < -0.9) { ball.p[2] = -0.9; ball.v[2] *= -0.4; ev.push({ t, kind: 'bounce', pos: ball.p.slice() }); }
        /* 표적 판정 */
        if (w.kind === 'balloons') for (const b of w.balloons) {
          if (!b.alive) continue;
          const bp = [b.x + Math.sin((t0 + t) * 1.3 + b.id) * 0.07, b.y + Math.sin((t0 + t) * 1.7 + b.id * 2) * 0.05, -0.3];
          if (len(sub(ball.p, bp)) < BALL_R + 0.2) {
            b.alive = false;
            ev.push({ t, kind: 'pop', id: b.id, pos: bp });
          }
        }
        if (w.kind === 'ducks') for (const d of w.ducks) {
          if (!d.alive) continue;
          const dp = duckPos(d, t0 + t);
          if (len(sub(ball.p, dp)) < BALL_R + DUCK_R) {
            d.alive = false;
            ev.push({ t, kind: 'quack', id: d.id, pos: dp });
            ball.v = scl(ball.v, 0.4);
          }
        }
        if (w.kind === 'targets') for (const tg of w.targets) {
          const tp = targetPos(tg, t0 + t);
          if (ball.p[2] < tp[2] + BALL_R && ball.p[2] > tp[2] - 0.12 && ball.v[2] < 0) {
            const dx = ball.p[0] - tp[0], dy = ball.p[1] - tp[1];
            const rr = Math.hypot(dx, dy);
            if (rr < tg.r) {
              const ring = rr < tg.r * 0.34 ? 3 : rr < tg.r * 0.68 ? 2 : 1;
              tg.hits.push(ring);
              ev.push({ t, kind: 'ring', id: tg.id, ring, pos: tp.slice() });
              ball.v[2] *= -0.3; ball.v[0] += dx * 2; ball.v[1] += dy * 2;
            }
          }
        }
        /* 캔 명중 */
        if (w.kind === 'cans') for (const cn of liveCans()) ballHitCan(ball, cn, ev, t);
        if (ball.p[1] < PIT_Y + BALL_R + 0.02 || Math.abs(ball.p[0]) > 6 || ball.p[2] < -2 || ball.p[2] > 6) {
          if (ball.alive) { ball.alive = false; ballGone = t; }
        }
      }
      /* 캔 물리 */
      const lc = liveCans();
      for (const cn of lc) if (cn.state === 'live') stepCan(cn, SUB, ev, t);
      for (let i = 0; i < lc.length; i++) for (let j = i + 1; j < lc.length; j++) {
        if (lc[i].state === 'live' || lc[j].state === 'live') collideCans(lc[i], lc[j], ev, t);
      }
      /* 서 있는 캔 지지 검사 — 아래 캔이 사라지면 깨어난다 */
      for (const cn of lc) {
        if (cn.state !== 'stand' || cn.p[1] < CAN_H * 0.9) continue;
        const under = lc.find(o => o !== cn && o.state === 'stand'
          && Math.abs(o.p[1] - (cn.p[1] - CAN_H)) < 0.05
          && Math.hypot(o.p[0] - cn.p[0], o.p[2] - cn.p[2]) < CAN_R * 1.6);
        if (!under) wake(cn);
      }

      t += SUB;
      if (t >= nextOut) {
        frames.push({
          t,
          ball: ball.alive ? ball.p.slice() : null,
          cans: w.cans.map(c => ({ p: c.p.slice(), q: c.q.slice(), s: c.state }))
        });
        nextOut += OUT;
      }
      /* 종료: 공 사라짐 + 캔 전부 잠잠 */
      const busyCans = lc.some(c => c.state === 'live' && (len(c.v) > 0.15 || len(c.w) > 0.4));
      if (!ball.alive && !busyCans && t - ballGone > 0.5) break;
    }

    w.t = t0 + t;
    w.shotsLeft--;

    /* 결과 집계 */
    const result = tally(w, ev);
    if (result.cleared || w.shotsLeft <= 0) w.done = true;
    return { world: w, frames, events: ev, result, duration: t };
  }

  function tally(w, ev) {
    const st = STAGES[w.stage];
    let cleared = false, remain = 0, score = 0;
    if (w.kind === 'cans') {
      remain = w.cans.filter(c => c.state !== 'out').length;
      score = w.cans.filter(c => c.state === 'out').reduce((s, c) => s + (c.gold ? 30 : 10), 0);
      cleared = remain === 0;
    } else if (w.kind === 'balloons') {
      remain = w.balloons.filter(b => b.alive).length;
      score = (w.balloons.length - remain) * 10;
      cleared = remain === 0;
    } else if (w.kind === 'ducks') {
      remain = w.ducks.filter(d => d.alive).length;
      score = (w.ducks.length - remain) * 12;
      cleared = remain === 0;
    } else if (w.kind === 'targets') {
      score = w.targets.reduce((s, tg) => s + tg.hits.reduce((a, r) => a + r * 10, 0), 0);
      remain = w.targets.filter(tg => !tg.hits.length).length;
      cleared = w.targets.every(tg => tg.hits.some(r => r === 3));
    }
    return { cleared, remain, score, shotsLeft: w.shotsLeft };
  }

  /* 조준 도우미: 화면 조준점(선반 위 목표)을 발사 방향으로 */
  function aimAt(px, py, pz, power) {
    const dir = sub([px, py, pz], MUZZLE);
    /* 포물선 보정 — 거리만큼 위로 */
    const dist = len(dir);
    dir[1] += dist * dist * -GRAV / (2 * BALL_SPEED * BALL_SPEED * (0.45 + 0.55 * power)) * 0.9;
    const L = len(dir);
    return { dir: scl(dir, 1 / L), power };
  }

  /* 상 — 스테이지 성적표 */
  function medalOf(result, stage) {
    const st = STAGES[stage];
    if (!result.cleared) return result.score > 0 ? '🙂' : '💨';
    if (st.kind === 'targets') return result.score >= 80 ? '🏆' : '🥇';
    return result.shotsLeft >= 2 ? '🏆' : result.shotsLeft >= 1 ? '🥇' : '🥈';
  }
  const PRIZES = ['🧸', '🐻', '🦄', '🐰', '🐧'];

  return {
    STAGES, PRIZES, MUZZLE, BALL_R, CAN_R, CAN_H, SHELF, PIT_Y, DUCK_R, BALL_SPEED,
    newWorld, simulateShot, aimAt, duckPos, targetPos, medalOf, tally,
    _internals: { mulberry32, qMulV, stepCan, ballHitCan }
  };
}));
