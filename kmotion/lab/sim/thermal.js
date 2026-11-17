// 케이모션 과학실 — 영하 196도 열 계산 (순수: 화면·Three.js 를 모른다 → node 로 시험, 설계 5-4)
// 모든 걸음 함수는 (상태, 입력, dt, 모델) → 새 상태. 받은 상태를 고치지 않고, 숨은 전역이 없다.
// 숫자는 전부 exp.json 에서 온다(게임 값). 실제 값에 닻을 둔 것은 끓는점 −196℃ 와 약 700배뿐이다.
//
// 세계 상태 world = {
//   t, boil, cloud,
//   bowl:   { ln2, water, T, flashed },     그릇: 질소 양(1 = 한 그릇 가득)·따뜻한 물·그릇 온도·구름으로 날아간 양
//   dewar:  { ln2 },                        통에 남은 질소
//   bottle: { ln2, size, demo, popped },    병 + 풍선 대신 보여 주기
//   bodies: { id: { kind, Ts, Tc, env, warm, minTs, cap } }   물체: 겉·속 온도, 있는 곳(air·ln2·hands·warm)
// }

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
/** banana_2 → banana (물체 하나하나의 이름에서 종류를 얻는다) */
export const kindOf = id => String(id).replace(/_\d+$/, '');
const ease = (k, h) => 1 - Math.exp(-Math.max(0, k) * h);   // 지수 걸음: dt 가 커도 넘치지 않는다

/** 꺾은선 표 읽기. points = [[x, y], …] (차례는 상관없다). 표 밖은 끝값. */
export function curve(points, x){
  const p = [...points].sort((a, b) => a[0] - b[0]);
  if (x <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) if (x <= p[i][0]) { const [x0, y0] = p[i - 1], [x1, y1] = p[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  return p[p.length - 1][1];
}

/** exp.json 에서 열 계산에 쓰는 것만 뽑는다 */
export function thermalModel(exp){
  const specs = {}; for (const it of exp.items) if (it.thermal) specs[it.id] = it.thermal;
  return { env: exp.env, bowl: exp.bowl, dewar: exp.dewar, bottle: exp.bottle, frost: exp.frost, specs };
}

export function makeBody(kind, T = 20){ return { kind, Ts: T, Tc: T, env: 'air', warm: 0, minTs: T, cap: 1 }; }

export function makeWorld(model, ids = []){
  const air = model.env.temps.air, bodies = {};
  for (const id of ids) bodies[id] = makeBody(kindOf(id), air);
  return { t: 0, boil: 0, cloud: 0, bowl: { ln2: 0, water: 0, T: air, flashed: 0 }, dewar: { ln2: model.dewar.amount },
    bottle: { ln2: 0, size: 0, demo: false, popped: false }, bodies };
}

export function cloneWorld(w){
  const bodies = {}; for (const id in w.bodies) bodies[id] = { ...w.bodies[id] };
  return { ...w, bowl: { ...w.bowl }, dewar: { ...w.dewar }, bottle: { ...w.bottle }, bodies };
}

/** 물체가 지금 실제로 느끼는 주변: 따뜻한 물을 맞는 중이면 warm, 그릇 속이라도 질소가 얕으면 공기 */
export function envOf(body, bowl, model){
  if (body.warm > 0) return 'warm';
  if (body.env === 'ln2') return bowl.ln2 >= model.bowl.minDip ? 'ln2' : 'air';
  return body.env;
}

/** 물체에 남은 열(0 = 질소만큼 식음, 1 = 방 온도). 속 몫(core)이 큰 물체는 속이 식을 때까지 끓음을 낸다. */
export function heatLeft(body, th, env){
  const lo = env.temps.ln2, span = env.temps.air - lo, c = th.core || 0;
  return Math.max(0, ((1 - c) * (body.Ts - lo) + c * (body.Tc - lo)) / span);
}

/** 물체 한 걸음: Ts += (Tenv − Ts)·ks·dt, Tc += (Ts − Tc)·kc·dt (설계 5-4). envKey = 실제로 느끼는 주변 */
export function stepBody(body, th, envKey, env, dt){
  const b = { ...body }, rate = th.rates && th.rates[envKey] != null ? th.rates[envKey] : env.rates[envKey];
  b.Ts += (env.temps[envKey] - b.Ts) * ease(th.ks * rate, dt);
  const kc = th.kc != null ? th.kc : th.ks;
  b.Tc += (b.Ts - b.Tc) * ease(b.Ts > b.Tc && th.kcThaw != null ? th.kcThaw : kc, dt);   // 속은 얼 때보다 녹을 때가 더 느리다(kcThaw)
  if (b.warm > 0) b.warm = Math.max(0, b.warm - dt);
  if (b.Ts < b.minTs) b.minTs = b.Ts;
  if (th.volume && curve(th.volume.curve, b.Ts) <= th.volume.flatAt) b.cap = th.volume.recoverMax;   // 한 번 납작해진 풍선은 95%까지만 돌아온다
  return b;
}

/** 서리: 겉 온도가 곧 덮는 정도(0~1) */
export function frostAmount(Ts, frost){ return clamp((frost.start - Ts) / (frost.start - frost.full), 0, 1); }

/** 풍선 부피(1 = 처음 크기): 온도 곡선표, 한 번 납작해진 뒤에는 cap 까지만 */
export function balloonVolume(body, th){ return Math.min(body.cap != null ? body.cap : 1, curve(th.volume.curve, body.Ts)); }

/** 통을 얼마나 기울여야 나오기 시작하나: 질소가 줄수록 더 많이 기울여야 한다(무게감) */
export function pourStartDeg(fill, dewar){ return dewar.tiltStart + (1 - clamp(fill, 0, 1)) * (dewar.tiltEmpty - dewar.tiltStart); }

/** 끓는 세기 — 화면의 거품·안개·소리는 이 값 하나만 읽는다. 그릇에 질소가 없으면 0. */
export function boilOf(world, model){
  const B = model.bowl, T = model.env.temps;
  if (!(world.bowl.ln2 > 0)) return 0;
  let boil = B.boilFloor + B.area * Math.max(0, (world.bowl.T - T.ln2) / (T.air - T.ln2));
  for (const id in world.bodies) { const b = world.bodies[id], th = model.specs[b.kind];
    if (th && envOf(b, world.bowl, model) === 'ln2') boil += th.area * heatLeft(b, th, model.env); }
  if (world.bowl.water > 0) boil += B.flashBoil;
  return boil;
}

/** 통의 질소를 붓는다. into = 'bowl' | 'bottle' | 그 밖(실험대에 쏟음). → { world, poured, spilled } */
export function pourLn2(world, amount, model, into = 'bowl'){
  const w = cloneWorld(world), poured = clamp(amount, 0, w.dewar.ln2); let spilled = 0;
  w.dewar.ln2 -= poured;
  if (into === 'bowl') { const room = model.bowl.capacity - w.bowl.ln2; spilled = Math.max(0, poured - room); w.bowl.ln2 += poured - spilled; }
  else if (into === 'bottle') { const room = model.bottle.capacity - w.bottle.ln2; spilled = Math.max(0, poured - room); w.bottle.ln2 += poured - spilled; }
  else spilled = poured;
  w.boil = boilOf(w, model);
  return { world: w, poured, spilled };
}

/** 따뜻한 물을 그릇에 붓는다(마무리 구름의 재료) */
export function addWater(world, amount, model){
  const w = cloneWorld(world); w.bowl.water = Math.min(model.bowl.capacity, w.bowl.water + Math.max(0, amount)); w.boil = boilOf(w, model); return w;
}

/** 물체를 그릇에 넣는다: 넣는 순간 질소가 훅 줄고(gulp), 물체는 질소 속에 있게 된다 */
export function dipIn(world, id, model){
  const w = cloneWorld(world), b = w.bodies[id]; if (!b) return w;
  const th = model.specs[b.kind];
  b.env = 'ln2';
  if (th && w.bowl.ln2 >= model.bowl.minDip) w.bowl.ln2 = Math.max(0, w.bowl.ln2 - (th.gulp || 0));
  w.boil = boilOf(w, model);
  return w;
}

/** 물체가 있는 곳을 바꾼다(air · ln2 · hands) */
export function setEnv(world, id, env, model){
  const w = cloneWorld(world); if (w.bodies[id]) w.bodies[id].env = env; if (model) w.boil = boilOf(w, model); return w;
}

/** 병 + 풍선: 병 속 질소가 기체가 되며 풍선을 불린다. 커지다 popAt 에서 터진다. */
export function stepBottle(bottle, dt, model){
  const b = { ...bottle }, K = model.bottle;
  if (b.ln2 > 0) { const ev = Math.min(b.ln2, K.evap * dt); b.ln2 -= ev;
    if (b.demo && !b.popped) { b.size += ev * K.gain; if (b.size >= K.popAt) { b.size = K.popAt; b.popped = true; } } }
  return b;
}

function substep(w, h, m){
  const T = m.env.temps, R = m.env.rates, B = m.bowl, has = w.bowl.ln2 > 0;
  w.bowl.T += ((has ? T.ln2 : T.air) - w.bowl.T) * ease(B.ks * (has ? R.ln2 : R.air), h);
  for (const id in w.bodies) { const b = w.bodies[id], th = m.specs[b.kind]; if (th) w.bodies[id] = stepBody(b, th, envOf(b, w.bowl, m), m.env, h); }
  // 따뜻한 물 + 질소 = 구름: 질소가 한꺼번에 날아간다
  let flashing = false;
  if (has && w.bowl.water > 0) { const f = Math.min(w.bowl.ln2, w.bowl.water * B.waterPower, B.flashRate * h);
    w.bowl.ln2 -= f; w.bowl.water = Math.max(0, w.bowl.water - f / B.waterPower); w.bowl.flashed += f; flashing = f > 0;
    if (w.bowl.water < 1e-9) w.bowl.water = 0; }
  w.cloud += ((flashing ? 1 : 0) - w.cloud) * ease(1 / (flashing ? B.cloudRise : B.cloudFall), h);
  w.boil = boilOf(w, m) + (flashing && !(w.bowl.water > 0) ? B.flashBoil : 0);
  // 질소가 날아간다: 기본 증발 + 끓는 만큼
  if (w.bowl.ln2 > 0) { w.bowl.ln2 = Math.max(0, w.bowl.ln2 - (B.baseEvap + w.boil * B.boilEvap) * h); if (w.bowl.ln2 < 1e-9) w.bowl.ln2 = 0; }
  if (!(w.bowl.ln2 > 0)) w.boil = 0;
  w.dewar.ln2 = Math.max(0, w.dewar.ln2 - m.dewar.evap * h);
  w.bottle = stepBottle(w.bottle, h, m);
  w.t += h;
}

/** 세계 한 걸음. inputs(없어도 됨) = { env: {id: 'air'|'ln2'|'hands'}, dip: [id…], pour: 양, water: 양, warm: {id: 초} }
 *  입력을 먼저 반영하고 dt 만큼 흐르게 한다. dt 가 커도 안에서 잘게 나눠 센다. */
export function stepWorld(world, inputs, dt, model){
  let w = cloneWorld(world); const inp = inputs || {};
  if (inp.pour) w = pourLn2(w, inp.pour, model, 'bowl').world;
  if (inp.water) w = addWater(w, inp.water, model);
  for (const id of inp.dip || []) w = dipIn(w, id, model);
  for (const id in inp.env || {}) if (w.bodies[id]) w.bodies[id].env = inp.env[id];
  for (const id in inp.warm || {}) if (w.bodies[id]) w.bodies[id].warm = Math.max(w.bodies[id].warm, inp.warm[id]);
  const h0 = model.env.maxStep || 0.05; let left = Math.max(0, dt || 0);
  while (left > 1e-9) { const h = Math.min(h0, left); left -= h; substep(w, h, model); }
  if (!(dt > 0)) w.boil = boilOf(w, model);
  return w;
}
