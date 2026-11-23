/* 케이원더 · 화산 속 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 손잡이 셋: visc(끈적임 0 묽게 ~ 1 끈적하게) · gas(기체 양 0~1) · push(밀어 올리는 힘 0~1, 자유에서는 2까지)
 * 시간으로 돈다: const S = createVolcano(); setHandles(S, {...}); stepVolcano(S, 초);  sayFor(S) → 지금 보일 글.
 *
 * 무대(거리 d: 꼭대기 = 0, 산기슭 = 0.3, 판 끝 = 1):
 *   왼쪽 비탈 아래 숲(d = FOREST), 오른쪽 비탈 아래 바다(d = SEA). 용암은 두 비탈로 똑같이 흐른다.
 *
 * 놀이로 줄인 것(설계에 없는 결정 — STATUS 에 옮겨 적는다):
 *   - 끈적임·기체는 0.5 를 넘나 안 넘나로 네 가지로 나눈다(묽음/끈적 × 적음/많음).
 *   - 압력 바늘은 「끈적 + 기체 많음」일 때만 1까지 오른다. 묽으면 기체가 빠져 0.05 근처, 끈적+기체 적음은 0.3 에서 멈춘다.
 *   - 용암이 갈 수 있는 거리 = 1.4 × 힘 × (1 − 끈적임). 묽고 세게 밀어야 바다(0.95)까지 간다.
 *   - 재 기둥은 힘이 기체보다 세면(무거워 못 뜨면) 무너진다 — 실제로도 기체가 모자라거나 뿜는 양이 너무 많으면 무너진다.
 *   - 용암 동굴: 같은 흐름이 8초 넘게 이어지면 겉이 굳는다.
 *   - 용암 호수: 묽고 기체 적게 흐르는 동안 꼭대기 구멍에 있다. 껍질 갈라짐은 씨앗 있는 난수로 열렸다 닫혔다.
 *   - 빨리 감기는 밀어 올리는 힘을 끝까지 내린 뒤(분출이 끝난 뒤)에만 된다.
 */

export const FOREST = 0.4, SEA = 0.95, FOOT = 0.3;
export const TUBE_AGE = 8, COLUMN_T = 12, HOLD = 2.5;
export const START = { visc: 0.3, gas: 0.2, push: 0.5 };
export const CLOUD = 0.55;                       // 하늘 높이(0~1) 중 구름이 있는 높이

export const SAYS = {
  rest:     '밀어 올리는 힘이 없어 마그마가 땅속에서 조용히 쉬어요.',
  flow:     '주황 용암이 강처럼 줄줄 흘러내려요. 산은 넓고 완만해져요.',
  fountain: '꼭대기에서 불 분수가 솟아요.',
  dome:     '꼭대기에 용암 혹이 천천히 부풀어요.',
  building: '길이 막혀 압력 바늘이 올라가요… 땅이 떨리고 꼭대기가 부풀어요.',
  blast:    '대폭발! 재 기둥이 구름 위까지 솟고, 재 구름 속에서 번개가 쳐요.',
  collapse: '재 기둥이 무너져요! 잿빛 구름이 산비탈을 쏟아져 내려요. 화산에서 가장 위험한 것이에요.',
  calm:     '재 기둥이 가라앉았어요. 산꼭대기가 날아가 움푹 팼어요.',
  sea:      '용암이 바다에 닿았어요. 김 구름이 솟고, 물속에서 베개 모양으로 굳어요.',
  forest:   '용암이 숲에 닿았어요. 나무가 타고, 굳은 뒤 나무 모양 구멍이 남아요.',
  tube:     '흐르던 용암 겉이 굳었어요. 속은 계속 흘러 용암 동굴이 돼요. 무인기로 들어가 봐요.',
  tubeIn:   '무인기가 용암 동굴 속으로 들어가요. 굳은 천장 아래로 주황 용암이 흘러가요.',
  lake:     '무인기 아래 용암 호수 — 검은 껍질이 갈라지며 속의 주황빛이 드러나고 다시 덮여요.',
  regrow:   '빨리 감기 — 여러 해가 지나며 재 위에 풀이 돋고 숲이 돌아와요.',
  notYet:   '아직 끝나지 않았어요. 밀어 올리는 힘을 끝까지 내려요.',
  nothing:  '덮인 것이 없어 그대로예요.',
};
export const DRONE = {
  air:      '무인기를 꼭대기 구멍이나 흐르는 용암 위로 옮겨 봐요.',
  hot:      '불 분수가 너무 뜨거워 무인기가 가까이 못 가요.',
  domeTop:  '천천히 굳어 가는 용암 혹 위예요. 겉에 금이 가 있어요.',
  quiet:    '꼭대기 구멍이 조용해요.',
  flowing:  '흐르는 용암 위 — 겉은 검고 갈라진 틈만 빛나요.',
  cold:     '굳은 용암 위예요. 아직 따뜻해요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function createVolcano(o = {}) {
  const S = {
    t: 0, free: !!o.free, visc: START.visc, gas: START.gas, push: START.push,
    pressure: 0, dome: 0, bulge: 0, tremor: false,
    fountainH: 0, fountainT: 0,
    flow: { front: 0, age: 0, tube: false, cover: 0 },
    forest: { burnt: false, molds: 0 }, sea: { pillows: 0, steam: 0 },
    column: null, bolts: 0, summitLost: false, cone: { w: 1, h: 1 }, ash: 0, regrow: 0,
    lake: { phase: 0, open: false }, blasts: 0, blastBase: 0,
    queue: [], cur: null, log: [], mode: null,
    rnd: mulberry(o.seed ?? 7),
  };
  setHandles(S, o);
  S.mode = modeOf(S);
  return S;
}
export const pushMax = S => (S.free ? 2 : 1);
export function setHandles(S, h = {}) {
  if (h.visc != null) S.visc = clamp(+h.visc, 0, 1);
  if (h.gas != null) S.gas = clamp(+h.gas, 0, 1);
  if (h.push != null) S.push = clamp(+h.push, 0, pushMax(S));
  if (S.mode) syncMode(S);
  return S;
}
function syncMode(S) {
  const m = modeOf(S);
  if (m !== S.mode && S.mode === 'flow') { S.flow.front = 0; S.flow.age = 0; S.flow.tube = false; }   // 흐름이 끊기면 새 흐름은 처음부터
  S.mode = m;
}
/** 손잡이만 보고 정하는 분출 모양(재 기둥이 서 있으면 그것이 먼저) */
export function modeOf(S) {
  if (S.column) return 'column';
  if (S.push < 0.05) return 'rest';
  const runny = S.visc < 0.5, gassy = S.gas >= 0.5;
  return runny ? (gassy ? 'fountain' : 'flow') : (gassy ? 'building' : 'dome');
}
/** 용암이 갈 수 있는 가장 먼 거리 */
export const flowReach = S => 1.4 * S.push * (1 - S.visc);

function announce(S, key) {
  S.log.push({ key, t: S.t });
  S.queue.push({ key, text: SAYS[key] });
  if (S.queue.length > 6) S.queue.splice(0, S.queue.length - 6);
}

export function stepVolcano(S, dt) {
  while (dt > 1e-9) { const h = Math.min(0.1, dt); tick(S, h); dt -= h; }
  return S;
}
function tick(S, dt) {
  S.t += dt;
  syncMode(S);
  if (S.mode !== 'fountain') S.fountainT = 0;
  const m = S.mode;
  // 압력 바늘
  if (m === 'building') {
    S.pressure += dt * 0.2 * S.push * (0.5 * S.gas + 0.5 * S.visc);
    S.bulge = S.pressure; S.tremor = S.pressure > 0.5;
    S.dome = Math.min(1, S.dome + dt * 0.02 * S.push);
    if (S.pressure >= 1) blast(S);
  } else if (m !== 'column') {
    const cap = m === 'dome' ? 0.3 : m === 'rest' ? S.pressure : 0.05;
    S.pressure += (cap - S.pressure) * Math.min(1, dt * 0.6);
    S.bulge = Math.max(0, S.bulge - dt * 0.2); S.tremor = false;
  }
  if (m === 'flow') {
    const L = Math.min(flowReach(S), SEA + 0.08), sp = 0.15 * (1 - S.visc) * (0.3 + S.push);
    const before = S.flow.front;
    if (S.flow.front < L) S.flow.front = Math.min(L, S.flow.front + sp * dt);
    S.flow.age += dt; S.flow.cover = Math.max(S.flow.cover, S.flow.front);
    S.cone.w = Math.min(1.3, S.cone.w + dt * 0.01 * S.push);   // 1.3 까지 — 산기슭(0.39)이 숲(0.4)을 덮지 않게
    if (before < FOREST && S.flow.front >= FOREST && !S.forest.burnt) { S.forest.burnt = true; S.forest.molds = 5 + Math.floor(S.rnd() * 4); announce(S, 'forest'); }
    if (before < SEA && S.flow.front >= SEA) announce(S, 'sea');
    if (S.flow.front >= SEA) { S.sea.pillows += dt * 2; S.sea.steam = 1; }
    if (!S.flow.tube && S.flow.age >= TUBE_AGE && S.flow.front >= FOOT) { S.flow.tube = true; announce(S, 'tube'); }
    S.lake.phase += dt * (1.2 + S.rnd() * 0.8); S.lake.open = Math.sin(S.lake.phase) > 0.3;
  } else S.lake.open = false;
  S.sea.steam = Math.max(0, S.sea.steam - (S.flow.front >= SEA && m === 'flow' ? 0 : dt * 0.3));
  if (m === 'fountain') { S.fountainH = S.gas * (0.4 + S.push); S.fountainT += dt; S.cone.h = Math.min(1.2, S.cone.h + dt * 0.003); }
  else S.fountainH = Math.max(0, S.fountainH - dt);
  if (m === 'dome') S.dome = Math.min(1, S.dome + dt * 0.04 * S.push);
  if (m === 'column') {
    const C = S.column; C.t += dt;
    C.h += (C.top - C.h) * Math.min(1, dt * 0.25);                     // 아주 느리게 솟는다(커 보이게)
    if (S.rnd() < dt * 1.5 * (C.h / C.top)) { S.bolts++; C.flash = 0.15; }
    C.flash = Math.max(0, (C.flash || 0) - dt);
    if (!C.collapsed && C.t > 2 && S.push > S.gas) { C.collapsed = true; C.slide = 0; S.ash += 1; announce(S, 'collapse'); }
    if (C.collapsed) C.slide = Math.min(1, C.slide + dt * 0.25);
    if (C.t >= COLUMN_T) { S.column = null; S.pressure = 0; S.dome = 0; S.bulge = 0; announce(S, 'calm'); }
  }
}
function blast(S) {
  S.pressure = 0; S.bulge = 0; S.tremor = false; S.dome = 0;
  S.column = { t: 0, h: 0, top: Math.min(1, 0.65 + 0.3 * S.gas + 0.1 * (S.push - 0.5)), collapsed: false, slide: 0, flash: 0 };
  S.summitLost = true; S.cone.h = Math.min(S.cone.h, 0.78); S.ash += 1; S.blasts++;
  S.mode = 'column'; announce(S, 'blast');
}

/** 다 끝난 뒤 빨리 감기 → 'regrow' | 'notYet' | 'nothing' */
export function fastForward(S) {
  if (S.column || S.push >= 0.05) { S.queue.length = 0; S.cur = { key: 'notYet', text: SAYS.notYet, at: S.t }; return 'notYet'; }
  if (!(S.ash > 0 || S.flow.cover > 0 || S.forest.burnt)) { S.cur = { key: 'nothing', text: SAYS.nothing, at: S.t }; return 'nothing'; }
  S.forest.burnt = false; S.ash = 0; S.regrow = 1; S.sea.steam = 0; S.pressure = 0;
  S.queue.length = 0; S.cur = null; announce(S, 'regrow');
  return 'regrow';
}

/** 무인기가 본 것 — spot: 'crater' | 'flow' | 'air' */
export function droneLook(S, spot) {
  if (spot === 'crater') {
    if (S.mode === 'flow') return { key: 'lake', text: SAYS.lake, open: S.lake.open };
    if (S.mode === 'fountain' || S.mode === 'column') return { key: 'hot', text: DRONE.hot };
    if (S.mode === 'dome' || S.mode === 'building') return { key: 'domeTop', text: DRONE.domeTop };
    return { key: 'quiet', text: DRONE.quiet };
  }
  if (spot === 'flow') {
    if (S.mode === 'flow' && S.flow.tube) return { key: 'tubeIn', text: SAYS.tubeIn };
    if (S.mode === 'flow' && S.flow.front > 0.05) return { key: 'flowing', text: DRONE.flowing };
    return { key: 'cold', text: DRONE.cold };
  }
  return { key: 'air', text: DRONE.air };
}

/** 지금 #say 에 보일 글: 막 일어난 일(차례로, 하나에 HOLD 초) → 없으면 지금 분출 모양 */
export function sayFor(S) {
  if (S.cur && S.t - S.cur.at >= HOLD) S.cur = null;
  if (!S.cur && S.queue.length) S.cur = { ...S.queue.shift(), at: S.t };
  if (S.cur) return S.cur.text;
  if (S.mode === 'column') return S.column.collapsed ? SAYS.collapse : SAYS.blast;
  return SAYS[S.mode];
}

export const FOUNTAIN_OK = 0.6;          // 의뢰 2: 분수 높이(기체 × (0.4 + 힘)) — 밸브만 조금 열어서는 안 된다
/** 의뢰 i 를 시작할 때 화산을 맞춘다(의뢰가 앞 의뢰의 끝 상태로 저절로 풀리지 않게) */
export function beginMission(S, i) {
  if (i === 1) { setHandles(S, { visc: 0.8, gas: 0.1 }); S.fountainT = 0; }   // 마그마가 끈적하고 기체가 닫힌 채로 시작 — 레버와 밸브를 둘 다 써야 한다
  if (i === 2) S.blastBase = S.blasts;                                       // 이번 의뢰에서 새로 터져야 한다
  return S;
}
/** 의뢰 셋 — ok(S) 맞았나, tell(S) 아니면 무엇이 걸렸나 */
const noPush = S => S.push < 0.05;
export const MISSIONS = [
  { id: 'sea', say: '용암 강을 바다까지 흘려보내라', hint: '묽을수록, 세게 밀어 올릴수록 멀리 가요.', why: 0,
    ok: S => S.mode === 'flow' && S.flow.front >= SEA,
    tell: S => noPush(S) ? '밀어 올리는 힘이 없어요. 펌프를 눌러요.'
      : S.visc >= 0.5 ? '끈적한 용암은 멀리 못 가요. 레버를 묽게.'
      : S.gas >= 0.5 ? '기체가 많아 분수가 돼요. 밸브를 잠가요.'
      : flowReach(S) < SEA ? '용암이 바다 앞에서 멈춰요. 더 묽게, 더 세게 밀어 올려요.'
      : '바다로 흘러가는 중이에요. 조금만 기다려요.' },
  { id: 'fountain', say: '불 분수를 뿜어라', hint: '묽은 용암에 기체를 많이.', why: 1,
    ok: S => S.mode === 'fountain' && S.fountainT >= 1.5 && S.fountainH >= FOUNTAIN_OK,
    tell: S => noPush(S) ? '밀어 올리는 힘이 없어요. 펌프를 눌러요.'
      : S.visc >= 0.5 ? '끈적하면 기체가 갇혀요. 분수는 묽은 용암에서 솟아요.'
      : S.gas < 0.5 ? '기체가 적어 줄줄 흘러요. 밸브를 더 열어요.'
      : S.fountainH < FOUNTAIN_OK ? '분수가 낮아요. 기체를 더, 또는 더 세게 밀어 올려요.'
      : '솟는 중이에요.' },
  { id: 'summit', say: '산꼭대기를 날려 버려라', hint: '끈적하게, 기체는 많이. 그리고 기다려요. (묽은 용암으로는 왜 안 될까?)', why: 1,
    ok: S => S.blasts > S.blastBase,
    tell: S => noPush(S) ? '밀어 올리는 힘이 없어요. 펌프를 눌러요.'
      : S.visc < 0.5 ? '묽으면 기체가 쉽게 빠져나가 압력이 쌓이지 않아요. 끈적하게!'
      : S.gas < 0.5 ? '기체가 적어 혹만 부풀어요. 밸브를 열어요.'
      : `압력 ${Math.round(S.pressure * 100)} — 기다려요. 오래 조용하다가 한 번에 터져요.` },
];

export const WHY = [
  '땅속 깊은 곳의 녹은 돌이 마그마예요. 그 속에 기체가 녹아 있어요. 사이다와 같아요.',
  '묽으면 기체가 쉽게 빠져나가 조용히 흘러요. 끈적하면 기체가 갇혔다가 한꺼번에 터져요.',
];
