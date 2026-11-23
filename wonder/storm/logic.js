/* 케이원더 · 폭풍 만들기 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 손잡이 셋: heat(땅 데우기 0~1) · moist(물기 0~1) · shear(위 바람 방향 − 아래 바람 방향, 라디안 −π~π)
 *   자유에서는 데우기·물기가 1.5 까지.
 * 시간으로 돈다: const S = createStorm({ seed }); setHandles(S, {...}); stepStorm(S, 초); sayFor(S) → 지금 보일 글.
 *
 * 땅(위에서 본 판, 단위 km): 폭풍 자리 (0,0). 아래 바람은 동쪽(+x)으로 분다. 북쪽 = +y.
 *   농가 FARM, 풍차 MILL, 관측 차량 CAR.
 *
 * 놀이로 줄인 것(설계에 없는 결정 — STATUS 에 옮겨 적는다):
 *   - 「내 말을 잘 안 듣는다」: 데우기 → 기운(F) → 올라가는 바람(U) → 구름 꼭대기 로 세 번 늦게 따라간다.
 *     기운은 3초에 쌓이고 5초에 걸쳐 빠진다. 물기도 공기 속 물기(Mm)로 늦게(3초·6초) 따라간다.
 *     그래서 자라는 중에 손잡이를 내려도 한동안 더 자라고, 다 자란 폭풍은 한동안 그대로 버틴다.
 *   - 구름 꼭대기(km) = 1.5 + 14.5 × U × (물기 몫)^0.7, 물기 몫 = (공기 속 물기 − 0.15) / 0.85. 8km 넘으면 탑·모루, 9km 넘으면 전기가 쌓이고, 10km 넘으면 땅으로 번개.
 *   - 번개 빠르기 = 0.25 × (꼭대기 − 9) 번/초, 그중 60% 가 땅으로. 풍차(높은 것)에 35%, 차량 가까이 8%.
 *   - 우박 크기(cm) = 0.8 × (꼭대기 − 10). 골프공 = 4cm 이상(꼭대기 15km). 한 번 오르내릴 때 0.8cm 씩 큰다고 센다.
 *   - 엇갈린 바람 세기 = sin(|위−아래 각| / 2). 0.4 넘고 꼭대기 9km 넘으면 돌기 시작, 회전 0.7·올라가는 바람 0.65 넘으면 깔때기.
 *   - 토네이도는 두 바람의 가운데 방향(각의 절반)으로 0.45 km/초 간다. 방향은 3초 늦게 따라가고 씨앗 있는 난수로 조금 흔들린다.
 *   - 먼지 회오리: 물기 0.15 아래 + 엇갈린 바람 0.4 넘으면(데우기는 크기만 키움).
 *   - 의뢰 2 는 새 날(맑은 하늘, 데우기 0.5·물기 0.3)에서 시작. 의뢰 3 에서 내려오는 토네이도는 농가(제자리, 4.5km·45°)를
 *     보고 내려온다. 내려온 뒤에는 「농가 쪽 + 그때부터 다이얼을 돌린 만큼」을 3초 늦게 따라간다 — 도중에 다이얼을 돌려야 비켜 간다.
 *     자유에서는 처음부터 두 바람의 가운데로 간다.
 *   - 구름이 흩어질 때 데우기가 꺼져 있고 비가 왔었으면 무지개. 흩어지면 풍차를 새로 세운다.
 */

export const FARM = { x: 4.5 * Math.SQRT1_2, y: 4.5 * Math.SQRT1_2, r: 0.6, name: '농가' };
export const MILL = { x: 6 * Math.SQRT1_2, y: -6 * Math.SQRT1_2, r: 0.8, name: '풍차' };
export const CAR = { x: -1.5, y: -0.4 };
const STAGE_NEWS = ['haze', 'dust', 'cumulus', 'tower'];
export const HOLD = 2.2, T_SPEED = 0.45, PASS_R = 7.5, MAP_R = 11, GOLF = 4;

export const SAYS = {
  clear:     '맑은 하늘이에요. 땅을 데워 보세요.',
  haze:      '땅이 데워져 아지랑이가 피어올라요. 구름은 없어요.',
  dust:      '물기 없이 엇갈린 바람 — 먼지 회오리가 작게 일어요.',
  cumulus:   '뭉게구름이 몇 조각 떠요.',
  tower:     '구름이 탑처럼 솟아 꼭대기가 모루 모양으로 퍼져요. 아래가 시커메져요.',
  lightning: '구름 속이 번쩍거리다 번개가 땅으로 쳐요. 비 기둥이 내려요.',
  hail:      '우박이 쏟아져 차 지붕을 때려요. 돌풍이 불어요.',
  rotate:    '구름 전체가 천천히 돌아요. 아래로 벽 같은 구름이 처져요.',
  tornado:   '깔때기가 내려와 땅에 닿아요 — 토네이도! 흙먼지 기둥이 일어요.',
  mill:      '토네이도가 풍차를 지나며 풍차가 빨려 올라가요. 사람도 동물도 없어요.',
  farm:      '토네이도가 농가에 닿았어요! 헛간 지붕이 날아가요. 농가는 비어 있어요.',
  pass:      '토네이도가 농가를 비켜 지나갔어요.',
  aim:       '토네이도가 농가 쪽으로 가요! 이대로 두면 닿아요.',
  ropeout:   '토네이도가 밧줄처럼 가늘어지다 사라져요.',
  rainbow:   '데우기를 끄니 구름이 힘을 잃고 흩어져요. 무지개가 떠요.',
  fade:      '구름이 힘을 잃고 흩어져요.',
  whiteout:  '번개가 차량 가까이 쳐서 화면이 하얘졌어요!',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

export function createStorm(o = {}) {
  const S = {
    t: 0, free: !!o.free, heat: 0.3, moist: 0.25, shear: 0,
    F: 0, U: 0, Mm: 0, top: 0, charge: 0, strikes: 0, flashes: 0, stormStrikes: 0, bolt: null, icFlash: 0, whiteout: 0, lastWhite: -99,
    rained: false, peak: 0, hailNow: 0, hailMax: 0, gust: false, rot: 0, wall: false, funnel: 0, wob: 0,
    tornado: null, lastTornado: null, tornadoes: 0, tornadoPass: false, farmHit: false, mill: { standing: true }, dust: 0, haze: false,
    stage: 'clear', said: new Set(), queue: [], cur: null, log: [],
    farm: { ...FARM }, farmChase: false, seed: o.seed ?? 11,
    rnd: mulberry(o.seed ?? 11),
  };
  setHandles(S, o);
  if (o.warm) { S.F = S.U = S.heat * (0.4 + 0.6 * S.moist); S.Mm = S.moist; }
  return S;
}
export const handleMax = S => (S.free ? 1.5 : 1);
export function setHandles(S, h = {}) {
  if (h.heat != null) S.heat = clamp(+h.heat, 0, handleMax(S));
  if (h.moist != null) S.moist = clamp(+h.moist, 0, handleMax(S));
  if (h.shear != null) S.shear = wrap(+h.shear);
  return S;
}
/** 엇갈린 바람 세기 0~1 */
export const farmHeading = S => Math.atan2(S.farm.y, S.farm.x);
export const shearOf = S => Math.sin(Math.abs(S.shear) / 2);
/** 토네이도가 가려는 방향(두 바람의 가운데) */
export const steerOf = S => S.shear / 2;
export const hailName = cm => cm >= GOLF ? '골프공' : cm >= 2.5 ? '메추리알' : cm >= 1 ? '구슬' : '콩알';

function announce(S, key, text = SAYS[key]) {
  S.log.push({ key, t: S.t });
  S.queue.push({ key, text, t: S.t });
  if (S.queue.length > 8) S.queue.splice(0, S.queue.length - 8);
}
const once = (S, key, text) => { if (S.said.has(key)) return; S.said.add(key); announce(S, key, text); };

export function stepStorm(S, dt) {
  while (dt > 1e-9) { const h = Math.min(0.1, dt); tick(S, h); dt -= h; }
  return S;
}
function tick(S, dt) {
  S.t += dt;
  const H = S.heat, B = H * (0.4 + 0.6 * Math.min(1, S.moist)) * (S.moist > 1 ? S.moist : 1);
  S.F += (B - S.F) * dt / (B > S.F ? 3 : 5);       // 기운(공기가 불안정한 정도) — 데우면 3초에 쌓이고, 꺼도 5초에 걸쳐 빠진다
  S.U += (S.F - S.U) * dt / 2.5;                    // 올라가는 바람 — 기운보다 늦게
  S.Mm += (S.moist - S.Mm) * dt / (S.moist > S.Mm ? 3 : 6);   // 공기 속 물기
  const m = clamp((S.Mm - 0.15) / 0.85, 0, 1.4);
  const target = S.Mm >= 0.15 && S.U >= 0.12 ? Math.min(20, 1.5 + 14.5 * S.U * Math.pow(m, 0.7)) : 0;
  S.top += (target - S.top) * dt / 2;
  const top = S.top, cloud = top >= 1;
  S.peak = Math.max(S.peak, top);
  if (top >= 8) S.rained = true;
  // 번개
  S.icFlash = Math.max(0, S.icFlash - dt); S.whiteout = Math.max(0, S.whiteout - dt);
  if (top >= 9) {
    S.charge += 0.25 * (top - 9) * dt;
    while (S.charge >= 1) {
      S.charge -= 1; S.flashes++;
      if (top >= 10 && S.rnd() < 0.6) {
        S.strikes++; S.stormStrikes++;
        const r = S.rnd(); let at;
        if (S.mill.standing && r < 0.35) at = { x: MILL.x, y: MILL.y, on: 'mill' };
        else if (r < 0.43) { at = { x: CAR.x + 0.3, y: CAR.y, on: 'car' }; S.whiteout = 0.6; if (S.t - S.lastWhite > 20) { S.lastWhite = S.t; announce(S, 'whiteout'); } }
        else at = { x: -2 + S.rnd() * 10, y: -3 + S.rnd() * 6, on: 'ground' };
        S.bolt = { ...at, t: S.t };
        if (S.stormStrikes === 1) once(S, 'lightning');
      } else S.icFlash = 0.2;
    }
  } else S.charge = Math.max(0, S.charge - dt * 0.2);
  // 우박 · 돌풍
  S.hailNow = top >= 11 ? 0.8 * (top - 10) : 0; S.hailMax = Math.max(S.hailMax, S.hailNow); S.gust = top >= 11;
  if (S.hailNow > 0) once(S, 'hail');
  // 돌기 · 깔때기 · 토네이도
  const s = shearOf(S);
  const rotT = s >= 0.4 && top >= 9 ? clamp((s - 0.3) / 0.5, 0, 1) * clamp((top - 8) / 5, 0, 1) : 0;
  S.rot += (rotT - S.rot) * dt / 4;
  S.wall = S.rot >= 0.35;
  if (S.wall) once(S, 'rotate');
  if (!S.tornado) {
    if (S.rot >= 0.7 && S.U >= 0.65) S.funnel = Math.min(1, S.funnel + 0.25 * dt); else S.funnel = Math.max(0, S.funnel - 0.4 * dt);
    if (S.funnel >= 1) {
      const chase = S.farmChase, h = chase ? farmHeading(S) : steerOf(S);   // 의뢰 3: 토네이도는 농가 쪽을 보고 내려온다(농가는 그 자리 그대로)
      S.tornado = { x: 0, y: 0, h, age: 0, path: [[0, 0]], hitFarm: false, hitMill: false, chase, dial0: steerOf(S) }; S.tornadoes++; S.farmHit = false; S.said.delete('tornado'); once(S, 'tornado');
      if (chase) announce(S, 'aim');
    }
  } else moveTornado(S, dt);
  // 먼지 회오리 · 아지랑이
  S.dust = S.Mm < 0.15 && s >= 0.4 ? s * (0.4 + 0.6 * Math.min(1, H)) : 0;
  S.haze = H >= 0.2 && !cloud;
  // 단계와 첫 소식
  const st = stageOf(S);
  if (st !== S.stage) { S.stage = st; if (STAGE_NEWS.includes(st)) once(S, st); }
  // 흩어짐
  if (S.peak >= 3 && top < 2 && !S.tornado) {
    announce(S, S.heat < 0.05 && S.rained ? 'rainbow' : 'fade');
    S.rainbow = S.heat < 0.05 && S.rained ? S.t : S.rainbow;
    S.peak = 0; S.rained = false; S.stormStrikes = 0; S.said.clear(); S.mill.standing = true;
  }
}
function moveTornado(S, dt) {
  const T = S.tornado; T.age += dt;
  S.wob += ((S.rnd() - 0.5) * 2 - S.wob * 0.8) * dt;
  const want = T.chase ? farmHeading(S) + wrap(steerOf(S) - T.dial0) : steerOf(S);   // 의뢰 3: 내려온 뒤 다이얼을 돌린 만큼만 농가 쪽에서 비켜 간다
  T.h = T.h + wrap(want - T.h) * dt / 3 + S.wob * 0.25 * dt;
  T.x += Math.cos(T.h) * T_SPEED * dt; T.y += Math.sin(T.h) * T_SPEED * dt;
  if (T.path.length < 400) T.path.push([T.x, T.y]);
  if (!T.hitFarm && Math.hypot(T.x - S.farm.x, T.y - S.farm.y) < FARM.r) { T.hitFarm = true; S.farmHit = true; announce(S, 'farm'); }
  if (S.mill.standing && Math.hypot(T.x - MILL.x, T.y - MILL.y) < MILL.r) { S.mill.standing = false; T.hitMill = true; announce(S, 'mill'); }
  const r = Math.hypot(T.x, T.y);
  if (!T.hitFarm && !T.passed && r >= PASS_R && (T.chase || !S.farmChase)) { T.passed = true; S.tornadoPass = true; announce(S, 'pass'); }
  if (S.rot < 0.5) { end(S, 'ropeout'); announce(S, 'ropeout'); }
  else if (r >= MAP_R) end(S, 'away');
}
function end(S, how) { S.lastTornado = { ...S.tornado, how }; S.tornado = null; S.funnel = 0; }

export function stageOf(S) {
  if (S.tornado) return 'tornado';
  if (S.wall) return 'rotate';
  if (S.hailNow > 0) return 'hail';
  if (S.top >= 10 && S.stormStrikes > 0) return 'lightning';
  if (S.top >= 8) return 'tower';
  if (S.top >= 1) return 'cumulus';
  if (S.dust > 0.05) return 'dust';
  if (S.heat >= 0.2) return 'haze';
  return 'clear';
}
/** 우박 말 — 크기·이름·오르내린 번수 */
export function hailSay(S, cm = S.hailNow) {
  if (cm <= 0) return '';
  return ` 우박은 ${hailName(cm)}만 해요(${cm.toFixed(1)}cm) — 구름 속을 ${Math.max(1, Math.round(cm / 0.8))}번 오르내리며 컸어요.`;
}
/** 지금 #say 에 보일 글: 막 일어난 일(차례로, 하나에 HOLD 초) → 없으면 지금 단계 */
export function sayFor(S) {
  if (S.cur && S.t - S.cur.at >= HOLD) S.cur = null;
  while (!S.cur && S.queue.length) {
    const q = S.queue.shift();
    if (STAGE_NEWS.includes(q.key) && q.key !== S.stage && S.t - q.t > 4) continue;   // 이미 지나간 단계 소식은 늦게 말하지 않는다
    S.cur = { ...q, at: S.t };
  }
  if (S.cur) return S.cur.text + (S.cur.key === 'hail' ? hailSay(S) : '');
  const st = S.stage;
  return SAYS[st] + (st === 'hail' || (st === 'rotate' && S.hailNow > 0) ? hailSay(S) : '');
}

/** 의뢰 i 를 시작할 때 하늘을 맞춘다(앞 의뢰의 끝 상태로 저절로 풀리지 않게) */
export function beginMission(S, i) {
  if (i === 0) S.strikes = 0;
  if (i === 1) {                                     // 새 날: 맑은 하늘에서 다시 키운다(다 큰 구름의 우박이 그대로 치지 않게)
    const keep = { t: S.t, free: S.free, seed: S.seed + 1, shear: S.shear };
    Object.assign(S, createStorm({ seed: keep.seed, free: keep.free }), { t: keep.t });
    setHandles(S, { heat: 0.5, moist: 0.3, shear: keep.shear });
  }
  if (i === 2) {                                     // 이제부터 내려오는 토네이도만 센다. 그 토네이도는 농가 쪽으로 내려온다
    S.farmChase = true; S.tornadoPass = false; S.farmHit = false;
    if (S.tornado) S.tornado.chase = false;
  }
  return S;
}
/** 의뢰 셋 — ok(S) 맞았나, tell(S) 아니면 무엇이 걸렸나 */
export const MISSIONS = [
  { id: 'bolts', say: '번개를 열 번 쳐라', hint: '땅을 데우고 물기를 불어넣어 구름을 높이 키워요.', why: 1,
    ok: S => S.strikes >= 10,
    tell: S => S.top < 9 ? '구름이 아직 낮아요. 땅을 더 데우고 물기를 더 불어넣어요.'
      : S.top < 10 ? '구름 속에서만 번쩍여요. 조금 더 높이 키워요.'
      : `번개 ${S.strikes}번 — 계속 키워요.` },
  { id: 'golf', say: '골프공만 한 우박을 만들어라', hint: '구름 꼭대기를 더 높이 — 우박은 구름 속을 여러 번 오르내리며 커요.', why: 0,
    ok: S => S.hailMax >= GOLF,
    tell: S => S.hailMax <= 0 ? (S.top < 11 ? '우박이 생기려면 구름 꼭대기가 더 높아야 해요.' : '우박이 막 생기려 해요.')
      : `우박이 ${hailName(S.hailMax)}만 해요(${S.hailMax.toFixed(1)}cm). 데우기와 물기를 둘 다 끝까지.` },
  { id: 'dodge', say: '토네이도가 농가에 닿지 않게 비켜 가게 하라', hint: '토네이도는 위 바람과 아래 바람의 가운데 쪽으로 가요. 만드는 것보다 모는 것이 어려워요.', why: 2,
    ok: S => S.tornadoPass,
    tell: S => S.farmHit ? '농가에 닿았어요! 위 바람 방향을 돌려 비켜 가게 해요.'
      : S.tornado ? '토네이도가 가고 있어요. 위 바람 다이얼로 방향을 틀어요.'
      : S.lastTornado && S.lastTornado.how === 'ropeout' ? '농가 옆을 지나기 전에 사라졌어요. 엇갈린 바람을 너무 줄이면 약해져요.'
      : S.rot < 0.35 ? '먼저 엇갈린 바람으로 구름을 돌려 토네이도를 만들어요.'
      : '깔때기가 내려오는 중이에요.' },
];

export const WHY = [
  '따뜻하고 축축한 공기는 위로 올라가요. 올라가며 식어서 물방울이 되고 구름이 돼요.',
  '구름 속에서 얼음 알갱이들이 부딪치며 전기가 쌓여요. 번개는 그 전기가 쏟아지는 거예요.',
  '위와 아래 바람이 엇갈리면 올라가는 공기가 돌기 시작해요.',
];
