/* 케이원더 · 블랙홀 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 단위: 빛의 빠르기 c = 1, 길이 1 = 기본 블랙홀(mass 1)의 검은 원 반지름.
 *       mass 가 m 이면 검은 원 반지름 = m, 끌림 세기 GM = m / 2.
 * 무대: 블랙홀은 (0,0), 우주선은 (+x) 쪽 shipDist × (검은 원 반지름) 자리. 던질 것은 우주선에서 출발한다.
 *
 * simulate({ what, aim, power, shipDist, mass }) → { outcome, path, turns, rp, minClock, deflect, … }
 *   what  : 'star' | 'planet' | 'ship' | 'probe'
 *   aim   : 블랙홀을 똑바로 겨눈 쪽에서 돌린 각(라디안). 0 = 곧장, ±π/2 = 옆으로
 *   power : 0~1 (끌었다 놓은 세기)
 * outcome: 'plunge'(곧장 빨려 듦) · 'spiral'(나선으로 원반에 섞임) · 'orbit'(돎) · 'fling'(튕겨 나감) · 'torn'(별이 찢김)
 *
 * 놀이로 줄인 것(설계 「끌림의 법칙 그대로」): 길은 뉴턴의 끌림으로 계산한다.
 *   - 검은 원의 1.5배(빛이 겨우 도는 자리) 안으로 들어오면 되돌아오지 못한다.
 *   - 시계 빠르기 = (끌림 때문에 느려짐) × (빨라서 느려짐).
 *   - 빛 휨·고리·접힌 원반은 약한 끌림 근사 식.
 */

export const OBJECTS = {
  star:   { name: '별',          size: 1.0,  tear: 6 },     // tear: 기본 블랙홀에서 찢기기 시작하는 거리
  planet: { name: '행성',        size: 0.7 },
  ship:   { name: '우주선',      size: 0.15 },
  probe:  { name: '시계 탐사선', size: 0.15, clock: true },
};
export const CAPTURE = 1.5;          // 검은 원의 몇 배 안이면 못 돌아오나
export const SHIP_MIN = 8, SHIP_MAX = 40;
export const DISK_IN = 3, DISK_OUT = 12;   // 원반 안쪽·바깥쪽(검은 원의 배수)
export const STRETCH_K = 40, STRETCH_MAX = 30;
export const SAYS = {
  plunge: '점점 빨라지며 빨려 들어가요. 가까워질수록 국수처럼 늘어나요.',
  spiral: '나선을 그리며 돌다가 원반에 섞여 빛나요.',
  orbit:  '블랙홀 둘레를 돌아요.',
  fling:  '휘었다가 튕겨 나가듯 반대쪽으로 날아가요.',
  away:   '블랙홀 곁을 크게 지나지 않고 멀리 날아가 버려요.',
  torn:   '별이 찢겨 긴 빛줄기가 되어 원반으로 감겨요.',
  freeze: '검은 원 가장자리에서 멈춘 듯 붉어지며 흐려져요. 들어가는 걸 끝내 못 봐요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const horizon = (mass = 1) => mass;
const gm = mass => mass / 2;

/** 시계 빠르기(멀리 가만히 있는 시계 = 1) — 가까울수록, 빠를수록 느리다 */
export function clockRate(r, v = 0, mass = 1) {
  return Math.sqrt(Math.max(0, 1 - mass / r)) * Math.sqrt(Math.max(0, 1 - Math.min(v * v, 1)));
}
/** 늘어남(1 = 그대로) — 머리와 발을 당기는 힘의 차이(GM·2/r³)에 비례 */
export function stretchAt(r, mass = 1, size = 1) {
  return Math.min(STRETCH_MAX, 1 + STRETCH_K * size * mass / (r * r * r));
}

/** 던지기 → 처음 자리와 빠르기 */
export function launch({ aim = 0, power = 0.5, shipDist = 20, mass = 1 } = {}) {
  const D = clamp(shipDist, SHIP_MIN, SHIP_MAX) * mass;
  const v = clamp(power, 0, 1) * 1.25 * Math.sqrt(2 * gm(mass) / D);   // 0.57쯤 = 둥근 궤도, 0.8 = 탈출
  return { x: D, y: 0, vx: -Math.cos(aim) * v, vy: Math.sin(aim) * v, D };
}

/** 뉴턴 궤도의 가장 가까운 거리(계산으로) */
export function periapsis(x, y, vx, vy, mass = 1) {
  const mu = gm(mass), r = Math.hypot(x, y), L = x * vy - y * vx, E = (vx * vx + vy * vy) / 2 - mu / r;
  if (Math.abs(L) < 1e-12) return 0;
  const e = Math.sqrt(Math.max(0, 1 + 2 * E * L * L / (mu * mu)));
  return (L * L / mu) / (1 + e);
}

const ETA = 0.004, MAX_STEPS = 80000;
export function simulate(input = {}, opts = {}) {
  const what = OBJECTS[input.what] ? input.what : 'planet', O = OBJECTS[what];
  const mass = input.mass ?? 1, mu = gm(mass), RH = horizon(mass), RC = CAPTURE * RH;
  const maxTurns = opts.maxTurns ?? 3;
  let { x, y, vx, vy, D } = launch({ ...input, mass });
  const L = x * vy - y * vx, E = (vx * vx + vy * vy) / 2 - mu / D;
  const rTear = O.tear ? O.tear * Math.cbrt(mass) : 0;                 // 큰 블랙홀일수록 (검은 원에 견주어) 덜 찢김
  const shipRate = clockRate(D, 0, mass);
  const v0 = [vx, vy];
  const path = [];
  const put = (t, spiral) => {
    const r = Math.hypot(x, y), v = Math.min(Math.hypot(vx, vy), 0.99);
    path.push({ x, y, t, r, v, stretch: stretchAt(r, mass, O.size), clock: clockRate(r, v, mass) / shipRate, spiral: !!spiral });
  };
  const acc = (px, py) => { const r2 = px * px + py * py, k = -mu / (r2 * Math.sqrt(r2)); return [k * px, k * py]; };
  let t = 0, swept = 0, ang = Math.atan2(y, x), outcome = null, tearAt = null;
  put(t);
  for (let i = 0; i < MAX_STEPS && !outcome; i++) {
    const r = Math.hypot(x, y), dt = ETA * r * Math.sqrt(r / mu);
    let [ax, ay] = acc(x, y); vx += ax * dt / 2; vy += ay * dt / 2;
    x += vx * dt; y += vy * dt;
    [ax, ay] = acc(x, y); vx += ax * dt / 2; vy += ay * dt / 2;
    t += dt;
    const a2 = Math.atan2(y, x); let d = a2 - ang; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; swept += d; ang = a2;
    const rn = Math.hypot(x, y);
    put(t);
    if (rTear && rn < rTear) { outcome = 'torn'; tearAt = { x, y, r: rn }; break; }
    if (rn < RC) { outcome = Math.abs(L) > 0.2 * Math.sqrt(mu * RC) ? 'spiral' : 'plunge'; break; }
    if (Math.abs(swept) / (2 * Math.PI) >= maxTurns) { outcome = 'orbit'; break; }
    if (E >= 0 && rn > Math.max(2.5 * D, 60 * mass) && (x * vx + y * vy) > 0) { outcome = 'fling'; break; }
  }
  if (!outcome) outcome = E < 0 ? 'orbit' : 'fling';
  if (outcome === 'plunge') {                                            // 검은 원까지 마저 떨어진다
    for (let i = 0; i < MAX_STEPS && Math.hypot(x, y) > RH; i++) {
      const r = Math.hypot(x, y), dt = ETA * r * Math.sqrt(r / mu);
      let [ax, ay] = acc(x, y); vx += ax * dt / 2; vy += ay * dt / 2; x += vx * dt; y += vy * dt;
      [ax, ay] = acc(x, y); vx += ax * dt / 2; vy += ay * dt / 2; t += dt; put(t);
    }
  } else if (outcome === 'spiral' || outcome === 'torn') {               // 나선으로 감기며 원반(또는 검은 원)으로
    const r0 = Math.hypot(x, y), a0 = Math.atan2(y, x), sgn = Math.sign(L) || 1;
    const rEnd = outcome === 'torn' ? Math.max(RH * DISK_IN, Math.min(r0, RH * DISK_OUT) * 0.6) : RH;
    const n = 90;
    for (let k = 1; k <= n; k++) {
      const f = k / n, r = r0 + (rEnd - r0) * f, a = a0 + sgn * f * 2.5 * Math.PI, vc = Math.sqrt(mu / r);
      x = r * Math.cos(a); y = r * Math.sin(a); vx = -sgn * vc * Math.sin(a); vy = sgn * vc * Math.cos(a);
      t += (2.5 * Math.PI / n) * r / vc; put(t, true);
    }
  }
  const vEnd = [vx, vy];
  const deflect = outcome === 'fling'
    ? Math.acos(clamp((v0[0] * vEnd[0] + v0[1] * vEnd[1]) / (Math.hypot(...v0) * Math.hypot(...vEnd)), -1, 1)) : 0;
  const rMin = Math.min(...path.map(p => p.r));
  const orbitPts = outcome === 'orbit' ? path : [];
  const res = {
    what, outcome, path, turns: Math.abs(swept) / (2 * Math.PI), rp: periapsis(D, 0, v0[0], v0[1], mass), rMin,
    minClock: orbitPts.length ? Math.min(...orbitPts.map(p => p.clock)) : (path.length ? Math.min(...path.map(p => p.clock)) : 1),
    deflect, tearAt, intoDisk: outcome === 'spiral' || outcome === 'torn', freezes: !!O.clock && (outcome === 'plunge' || outcome === 'spiral'),
    L, E, shipDist: D,
  };
  res.says = (outcome === 'fling' && deflect < 0.35 ? SAYS.away : SAYS[outcome]) + (res.freezes ? ' ' + SAYS.freeze : '')
    + (O.clock && outcome === 'orbit' ? ` 탐사선 시계는 가장 가까울 때 내 시계의 ${res.minClock.toFixed(2)}배 빠르기.` : '');
  return res;
}

/** 멀리(내 우주선)에서 본, 곧장 떨어지는 탐사선 — r 은 검은 원의 배수 */
export function farView(r, mass = 1) {
  const q = Math.max(0, 1 - mass / r);
  return {
    crawl: q * Math.sqrt(mass / r),       // 보이는 떨어지는 빠르기(빛의 빠르기 = 1) — 가장자리에서 0
    redden: q > 0 ? 1 / Math.sqrt(q) : Infinity,   // 빛의 물결이 몇 배로 늘어나 보이나(붉어짐)
    dim: q * q,                           // 밝기(1 = 그대로)
    clock: Math.sqrt(q),                  // 탐사선 시계가 내 것보다 몇 배 빠르기로 보이나(멈춰 있을 때)
  };
}
/** 멀리서 보면 r0 에서 r1 까지 떨어지는 데 걸리는 시간(검은 원 반지름 / 빛의 빠르기 단위) */
export function farTimeToReach(r0, r1, mass = 1, steps = 4000) {
  // 가장자리 가까이를 촘촘히 재도록 ln(r - 검은 원) 을 고르게 나눈다
  const a = Math.log(r0 - mass), b = Math.log(r1 - mass); let T = 0;
  for (let i = 0; i < steps; i++) {
    const s = a + (b - a) * (i + .5) / steps, r = mass + Math.exp(s), dr = Math.exp(s) * Math.abs(b - a) / steps;
    T += dr / farView(r, mass).crawl;
  }
  return T;
}

/** 우주선 자리(shipDist = 검은 원의 배수)에서 본 하늘 */
export function view(shipDist = 20, mass = 1) {
  const D = clamp(shipDist, SHIP_MIN, SHIP_MAX) * mass, rs = mass, bc = 1.5 * Math.sqrt(3) * rs;
  const shadow = Math.asin(Math.min(1, bc / D * Math.sqrt(1 - rs / D)));     // 검은 원이 보이는 반지름(라디안)
  const dDisk = DISK_OUT * rs;
  const fold = Math.sqrt(2 * rs * dDisk / (D * (D + dDisk)));                  // 원반 뒤쪽이 위아래로 접혀 올라오는 높이(라디안)
  /** 화면 가운데에서 theta(라디안) 떨어진 곳의 뒤 별빛이 휘는 각 — 검은 그림자 안이면 null */
  const bend = theta => {
    const b = D * Math.sin(theta) / Math.sqrt(1 - rs / D);
    if (b <= bc) return null;
    return 2 * rs / b + (15 * Math.PI / 16) * (rs / b) ** 2;
  };
  return { D, shadow, fold, folded: fold > shadow * 0.5, bend };
}

/** 블랙홀 뒤(behind 만큼 더 먼 곳)의 별 하나 — beta: 블랙홀에서 비켜난 각(라디안) */
export function lensImages(beta, shipDist = 20, mass = 1, behind = 1000) {
  const Dl = clamp(shipDist, SHIP_MIN, SHIP_MAX) * mass, Ds = Dl + behind * mass;
  const thetaE = Math.sqrt(2 * mass * (Ds - Dl) / (Dl * Ds));
  const u = Math.abs(beta) / thetaE, s = Math.sqrt(u * u + 4);
  const plus = (u + s) / 2 * thetaE, minus = (u - s) / 2 * thetaE;           // minus 는 반대쪽(음수)
  const muP = u > 0 ? (u * u + 2) / (2 * u * s) + .5 : Infinity, muM = u > 0 ? (u * u + 2) / (2 * u * s) - .5 : Infinity;
  const kind = u < 0.15 ? 'ring' : muM >= 0.05 ? 'two' : 'one';
  return { kind, thetaE, u, images: [{ at: plus, bright: muP }, { at: minus, bright: muM }],
           says: { one: '별이 하나로 보여요.', two: '별이 블랙홀 양쪽에 둘로 보여요.', ring: '별이 블랙홀을 두른 빛의 고리로 보여요.' }[kind] };
}

/** 의뢰 셋 — ok(…) 맞았나, tell(…) 아니면 무엇이 걸렸나 */
export const MISSIONS = [
  { id: 'orbit3', say: '행성을 블랙홀 둘레에 세 바퀴 돌려라', hint: '곧장 말고 옆으로. 너무 약하면 빨려 들고, 너무 세면 날아가요.', why: 0,
    ok: r => r.what === 'planet' && r.outcome === 'orbit' && r.turns >= 3,
    tell: r => r.what !== 'planet' ? '행성을 골라 던져요.'
      : r.outcome === 'fling' ? '너무 세요. 날아가 버렸어요.'
      : r.outcome === 'orbit' ? `${Math.floor(r.turns)}바퀴 돌았어요.`
      : '너무 약하거나 너무 곧장이에요. 빨려 들어갔어요.' },
  { id: 'halfclock', say: '탐사선 시계를 내 시계의 절반 빠르기로', hint: '가까이 갈수록 시계가 느려요. 그래도 빠지면 안 돼요.', why: 1,
    ok: r => r.what === 'probe' && r.outcome === 'orbit' && r.turns >= 1 && r.minClock >= 0.35 && r.minClock <= 0.65,
    tell: r => r.what !== 'probe' ? '시계 탐사선을 골라 던져요.'
      : r.outcome !== 'orbit' ? (r.outcome === 'fling' ? '날아가 버렸어요. 궤도에 올려야 해요.' : '빠져 버렸어요. 조금만 덜 가까이.')
      : r.minClock > 0.65 ? `시계가 ${r.minClock.toFixed(2)}배예요. 더 가까이 지나가게.`
      : r.minClock < 0.35 ? `시계가 ${r.minClock.toFixed(2)}배예요. 너무 느려요. 조금만 멀리.`
      : '한 바퀴는 돌아야 해요.' },
  { id: 'hidden', say: '블랙홀 뒤에 숨은 별을 찾아라', hint: '빛이 휘어서 블랙홀 둘레에 보여요.', why: 1,
    /* q = { tap:[x,y](라디안, 블랙홀 가운데 = 0), hidden:{ beta, dir }, shipDist, mass, behind } */
    ok: q => hiddenHit(q).hit,
    tell: q => hiddenHit(q).hit ? '' : '거기는 아니에요. 블랙홀 둘레에서 휜 빛을 찾아요.' },
];
export function hiddenHit({ tap, hidden, shipDist = 20, mass = 1, behind = 1000 }) {
  const L = lensImages(hidden.beta, shipDist, mass, behind), [tx, ty] = tap, r = Math.hypot(tx, ty);
  if (L.kind === 'ring') return { hit: Math.abs(r - L.thetaE) < 0.35 * L.thetaE, lens: L };
  const n = [Math.cos(hidden.dir || 0), Math.sin(hidden.dir || 0)];
  const imgs = L.kind === 'two' ? L.images : L.images.slice(0, 1);
  return { hit: imgs.some(im => Math.hypot(tx - n[0] * im.at, ty - n[1] * im.at) < 0.35 * L.thetaE), lens: L };
}

export const WHY = [
  '블랙홀은 아주 많은 것이 아주 작은 곳에 뭉친 거예요. 끌어당기는 힘이 너무 세서 빛도 못 나와요. 그래서 까맣게 보여요.',
  '그 둘레에서는 빛도 휘고 시간도 느리게 가요.',
  '머리 쪽보다 발 쪽을 더 세게 당겨서 길게 늘어나요.',
];
