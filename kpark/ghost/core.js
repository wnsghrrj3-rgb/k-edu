/* 케이파크 · 🏚️ 유령의 집 — 순수 로직 (UI·THREE 없음, 결정론)
 * 어두운 방에 수줍은 유령들이 숨어 있다. 손전등으로 비추면 모습이 드러나고,
 * 빛을 계속 비추면 마음이 열려서(캡처 링) 랜턴 친구가 된다. 무섭지 않게 — 귀엽게.
 *
 * createWorld(roomIdx, seed) → world / step(world, dt, {x,y,on}) → events[]
 * 틱 = 고정 dt(1/60 권장). 같은 seed + 같은 입력열 = 같은 이벤트열 (테스트 보장).
 * 좌표: 방 안 가상 평면 x∈[-2,2], y∈[0.2,2.4] (z는 무대 깊이 연출용 — 판정 무관). */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KGhostCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  /* ---------- 상수 ---------- */
  const LIGHT_R = 0.55;        // 손전등 원 반지름 (판정)
  const BATT_DRAIN = 10;       // 켠 채 10초면 방전
  const BATT_REGEN = 4;        // 끄면 4초면 완충
  const BATT_WAKE = 0.3;       // 방전 후 이만큼 차야 다시 켜짐
  const METER_DECAY = 0.12;    // 빛이 떠나면 초당 이만큼 식는다 (천천히 — 다정하게)
  const GIGGLE_GAP = 0.8;      // 비추는 동안 킥킥 소리 간격
  const DASH_DUR = 0.5;        // 놀라서 도망가는 시간
  const BOUNDS = { x0: -2, x1: 2, y0: 0.2, y1: 2.4 };

  /* 유령 성격 — capTime: 마음이 열리는 시간(초), startleAt: 놀라 도망가는 문턱 */
  const KINDS = {
    sleepy: { capTime: 1.2, peek: [999, 999], hide: [0, 0], startleAt: [], drift: 0.06 },
    shy:    { capTime: 1.6, peek: [2.4, 3.4], hide: [1.0, 2.0], startleAt: [], drift: 0 },
    prank:  { capTime: 2.0, peek: [2.6, 3.6], hide: [0.8, 1.6], startleAt: [0.5], drift: 0 },
    dash:   { capTime: 2.2, peek: [999, 999], hide: [0, 0], startleAt: [0.5], drift: 0.5, wander: true },
    boss:   { capTime: 4.5, peek: [999, 999], hide: [0, 0], startleAt: [0.34, 0.67], drift: 0.12 }
  };

  /* ---------- 방 5종 ---------- */
  const ROOMS = [
    { id: 'lobby', nm: '현관 로비', em: '🛋️', time: 60, friend: '💤', friendNm: '졸음유령',
      sub: '먼지 낀 소파와 낡은 램프. 입문 코스',
      ghosts: [
        { kind: 'sleepy', spots: [[-1.2, 0.9, -1.4], [-0.6, 1.1, -1.5]] },
        { kind: 'sleepy', spots: [[1.1, 0.7, -1.2], [1.5, 1.0, -1.4]] },
        { kind: 'shy', spots: [[0.1, 1.6, -1.8], [-1.5, 1.8, -1.8], [1.4, 1.7, -1.8]] }
      ] },
    { id: 'study', nm: '낡은 서재', em: '📚', time: 60, friend: '📖', friendNm: '책벌레유령',
      sub: '책장 뒤에서 빼꼼 — 수줍음이 세 배',
      ghosts: [
        { kind: 'shy', spots: [[-1.6, 1.0, -1.7], [-1.6, 1.9, -1.7], [-0.9, 1.4, -1.8]] },
        { kind: 'shy', spots: [[0.2, 0.8, -1.6], [0.2, 1.8, -1.7], [0.9, 1.2, -1.8]] },
        { kind: 'shy', spots: [[1.6, 0.9, -1.7], [1.6, 1.9, -1.7], [0.9, 2.1, -1.8]] }
      ] },
    { id: 'kitchen', nm: '덜그럭 부엌', em: '🍳', time: 75, friend: '🥄', friendNm: '주걱유령',
      sub: '냄비에서 뿅! 장난꾸러기가 나타났다',
      ghosts: [
        { kind: 'prank', spots: [[-1.4, 0.8, -1.5], [1.3, 0.8, -1.5], [0, 1.9, -1.8]] },
        { kind: 'prank', spots: [[0.6, 0.7, -1.4], [-0.7, 1.9, -1.8], [1.6, 1.5, -1.7]] },
        { kind: 'shy', spots: [[-0.2, 1.2, -1.7], [-1.7, 1.6, -1.8]] },
        { kind: 'shy', spots: [[1.0, 1.7, -1.8], [0.3, 0.7, -1.5]] }
      ] },
    { id: 'attic', nm: '삐걱 다락방', em: '🕰️', time: 75, friend: '⏰', friendNm: '태엽유령',
      sub: '둥둥 떠다니는 유령들 — 눈으로 쫓아라',
      ghosts: [
        { kind: 'dash', spots: [[-1.5, 1.0, -1.5], [1.5, 1.9, -1.7], [0, 0.7, -1.3], [1.4, 0.8, -1.5]] },
        { kind: 'dash', spots: [[1.5, 1.1, -1.5], [-1.5, 2.0, -1.7], [-0.2, 1.8, -1.8], [-1.3, 0.7, -1.4]] },
        { kind: 'prank', spots: [[0.8, 1.4, -1.6], [-0.9, 1.2, -1.6], [0, 2.1, -1.8]] },
        { kind: 'prank', spots: [[-0.5, 0.8, -1.4], [1.6, 1.6, -1.7], [-1.6, 1.5, -1.7]] }
      ] },
    { id: 'hall', nm: '대저택 홀', em: '👑', time: 90, friend: '👑', friendNm: '유령대왕',
      sub: '샹들리에 아래, 유령대왕이 기다린다',
      ghosts: [
        { kind: 'shy', spots: [[-1.6, 1.0, -1.6], [-1.6, 2.0, -1.8], [-0.8, 1.5, -1.7]] },
        { kind: 'shy', spots: [[1.6, 1.0, -1.6], [1.6, 2.0, -1.8], [0.8, 1.5, -1.7]] },
        { kind: 'boss', big: true, spots: [[0, 1.5, -1.8], [-1.3, 1.8, -1.8], [1.3, 1.8, -1.8], [0, 0.8, -1.5]] }
      ] }
  ];

  /* ---------- RNG (케이마블 계열) ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rr = (rng, a, b) => a + rng() * (b - a);

  /* ---------- 월드 ---------- */
  function createWorld(roomIdx, seed) {
    const room = ROOMS[roomIdx];
    if (!room) throw new Error('no room ' + roomIdx);
    const rng = mulberry32((seed | 0) + roomIdx * 977 + 1);
    const ghosts = room.ghosts.map((g, i) => {
      const K = KINDS[g.kind];
      const alwaysOut = K.peek[0] >= 999;
      const s0 = g.spots[0];
      return {
        i, kind: g.kind, big: !!g.big, spots: g.spots,
        x: s0[0], y: s0[1], z: s0[2], spot: 0,
        state: alwaysOut ? 'peek' : 'hidden',
        tState: 0,
        tNext: alwaysOut ? Infinity : rr(rng, 0.4, K.hide[1]),   // 첫 등장은 조금 빠르게
        meter: 0, startled: [],          // 이미 지난 문턱 기록
        tx: s0[0], ty: s0[1], tz: s0[2], // 이동 목표 (dash·wander·boss drift)
        lastGiggle: -9, wasLit: false
      };
    });
    return {
      roomIdx, room, rng, t: 0, timeLeft: room.time,
      ghosts, caught: 0, total: ghosts.length,
      batt: 1, battDead: false,
      done: false, result: null, events: []
    };
  }

  function farthestSpot(g, rng) {
    let best = g.spot, bd = -1;
    for (let s = 0; s < g.spots.length; s++) {
      if (s === g.spot) continue;
      const d = Math.hypot(g.spots[s][0] - g.x, g.spots[s][1] - g.y) + rng() * 0.01;
      if (d > bd) { bd = d; best = s; }
    }
    return best;
  }

  function medal(frac) {
    return frac >= 0.5 ? '🏆' : frac >= 0.3 ? '🥇' : frac >= 0.12 ? '🥈' : '🙂';
  }

  /* ---------- 틱 ---------- */
  function step(world, dt, input) {
    const ev = [];
    if (world.done) return ev;
    const emit = (kind, extra) => { const e = Object.assign({ t: world.t, kind }, extra || {}); ev.push(e); world.events.push(e); };
    world.t += dt;
    world.timeLeft -= dt;

    /* 배터리 */
    const wantOn = !!(input && input.on);
    if (wantOn && !world.battDead) {
      world.batt -= dt / BATT_DRAIN;
      if (world.batt <= 0) { world.batt = 0; world.battDead = true; emit('battout'); }
    } else {
      world.batt = Math.min(1, world.batt + dt / BATT_REGEN);
      if (world.battDead && world.batt >= BATT_WAKE) { world.battDead = false; emit('battok'); }
    }
    const lightOn = wantOn && !world.battDead;
    const lx = input ? input.x : 0, ly = input ? input.y : 0;

    /* 유령들 */
    for (const g of world.ghosts) {
      if (g.state === 'captured') continue;
      const K = KINDS[g.kind];
      g.tState += dt;

      /* 상태 전이 */
      if (g.state === 'hidden' && g.tState >= g.tNext) {
        g.state = 'peek'; g.tState = 0;
        g.tNext = rr(world.rng, K.peek[0], K.peek[1]);
        emit('appear', { g: g.i, gk: g.kind });
      } else if (g.state === 'peek' && g.tState >= g.tNext && K.peek[0] < 999) {
        g.state = 'hidden'; g.tState = 0;
        g.spot = (g.spot + 1 + ((world.rng() * (g.spots.length - 1)) | 0)) % g.spots.length;
        const s = g.spots[g.spot];
        g.x = g.tx = s[0]; g.y = g.ty = s[1]; g.z = g.tz = s[2];
        g.tNext = rr(world.rng, K.hide[0], K.hide[1]);
        emit('hide', { g: g.i });
      } else if (g.state === 'dash') {
        const k = Math.min(1, g.tState / DASH_DUR);
        g.x = g.dx0 + (g.tx - g.dx0) * k;
        g.y = g.dy0 + (g.ty - g.dy0) * k;
        g.z = g.dz0 + (g.tz - g.dz0) * k;
        if (k >= 1) { g.state = 'peek'; g.tState = 0; g.tNext = rr(world.rng, K.peek[0], K.peek[1]); }
      }

      /* 떠돌이(wander)·대왕 표류 */
      if (g.state === 'peek' && (K.wander || K.drift > 0.1)) {
        const d = Math.hypot(g.tx - g.x, g.ty - g.y);
        if (d < 0.05) {
          const s = g.spots[(world.rng() * g.spots.length) | 0];
          g.tx = s[0]; g.ty = s[1]; g.tz = s[2];
        } else {
          const v = K.drift;
          g.x += (g.tx - g.x) / d * v * dt;
          g.y += (g.ty - g.y) / d * v * dt;
          g.z += (g.tz - g.z) * Math.min(1, v * dt / d);
        }
      }

      /* 빛 판정 + 캡처 미터 */
      const visible = g.state === 'peek';
      const R = LIGHT_R * (g.big ? 1.25 : 1);
      const lit = visible && lightOn && Math.hypot(lx - g.x, ly - g.y) <= R;
      if (lit) {
        g.meter += dt / K.capTime;
        if (world.t - g.lastGiggle >= GIGGLE_GAP) { g.lastGiggle = world.t; emit('giggle', { g: g.i, m: g.meter }); }
        /* 놀람 문턱 */
        for (let si = 0; si < K.startleAt.length; si++) {
          if (g.meter >= K.startleAt[si] && !g.startled.includes(si) && g.meter < 1) {
            g.startled.push(si);
            g.spot = farthestSpot(g, world.rng);
            const s = g.spots[g.spot];
            g.dx0 = g.x; g.dy0 = g.y; g.dz0 = g.z;
            g.tx = s[0]; g.ty = s[1]; g.tz = s[2];
            g.state = 'dash'; g.tState = 0;
            emit(g.kind === 'boss' ? 'bosswarp' : 'startle', { g: g.i });
            break;
          }
        }
        if (g.meter >= 1 && g.state === 'peek') {
          g.meter = 1; g.state = 'captured';
          world.caught++;
          emit('capture', { g: g.i, gk: g.kind, left: world.total - world.caught });
        }
      } else {
        g.meter = Math.max(0, g.meter - METER_DECAY * dt);
      }
      g.wasLit = lit;
    }

    /* 종료 */
    if (world.caught >= world.total) {
      world.done = true;
      const frac = Math.max(0, world.timeLeft) / world.room.time;
      world.result = { clear: true, medal: medal(frac), timeLeft: Math.max(0, world.timeLeft) };
      emit('clear', { medal: world.result.medal, timeLeft: world.result.timeLeft });
    } else if (world.timeLeft <= 0) {
      world.done = true;
      world.result = { clear: false, medal: '💨', caught: world.caught };
      emit('timeup', { caught: world.caught, total: world.total });
    }
    return ev;
  }

  return {
    ROOMS, KINDS, LIGHT_R, BATT_DRAIN, BATT_REGEN, BATT_WAKE, METER_DECAY, DASH_DUR, BOUNDS,
    createWorld, step, medal
  };
}));
