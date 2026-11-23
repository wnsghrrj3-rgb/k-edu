/* 케이원더 · 자라는 결정 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 결정은 「자란 역사」로 정해진다. 역사 = 걸음들의 줄:
 *   steps = [{ T, w, dt }, …, { notch: true }, …]
 *   T  : 온도 다이얼(°C) · w : 둘째 다이얼 0~1(눈 = 물기, 소금 = 말리는 빠르기, 비스무트·수정 = 식히는 빠르기, 동굴 = 물에 녹은 양)
 *   dt : 그 조건으로 흐른 시간(상자마다 단위가 다르다: 분 · 일 · 년)
 *   notch : 자라는 결정에 흠을 낸다
 * grow({ box, steps, seed }) → { kind, size, says, … }   같은 역사 + 다른 seed = 닮았지만 똑같지 않은 결정
 *
 * 놀이로 줄인 것:
 *   - 눈: 나카야 도표를 온도 네 띠 × 물기 세 칸 = 열두 칸으로 줄였다. 한 칸이 그 순간 자라는 버릇(판·기둥·가지)을 고른다.
 *         결정은 가운데에서 밖으로 한 겹씩 자라므로, 겹마다 그때의 버릇이 남는다(가운데 = 처음, 끝 = 나중).
 *         여섯 팔은 같은 역사를 겪어 닮는다. 곁가지가 돋는 자리만 seed 로 흔들린다.
 *   - 소금·비스무트: 빠를수록 씨앗(알갱이)이 많이 생겨 잘아진다. 크기 = (다 굳은 양 / 알갱이 수)의 세제곱근.
 *   - 흠: 움푹 팬 자리는 붙을 자리가 많아 다른 곳보다 세 배 빨리 자란다 → 흠 깊이가 자란 만큼의 두 배씩 준다.
 */

export const MELT = 271;            // 비스무트가 녹는 온도(°C)
export const BIG_RAINBOW = 34;      // 의뢰 3: 이만큼(mm) 넘는 무지개 계단이면 「가장 큰」
export const PERSON = 1.7;          // 동굴 속 탐험가 인형 키(m)

export const BOXES = {
  snow:    { name: '눈 결정',        dial1: { name: '온도',        min: -30, max: 0,   unit: '°C', start: -2 },  dial2: { name: '물기',          lo: '적게',   hi: '많이',   start: 0.5 },  unit: '분', sizeUnit: 'mm', flow: 1.5,   cap: 30 },
  salt:    { name: '소금물',         dial1: { name: '방 온도',     min: 10,  max: 60,  unit: '°C', start: 20 },  dial2: { name: '말리는 빠르기', lo: '천천히', hi: '빨리',   start: 0.5 },  unit: '일', sizeUnit: 'mm', flow: 2,     cap: 60 },
  bismuth: { name: '비스무트',       dial1: { name: '온도',        min: 150, max: 350, unit: '°C', start: 300 }, dial2: { name: '식히는 빠르기', lo: '천천히', hi: '빨리',   start: 0.5 },  unit: '분', sizeUnit: 'mm', flow: 4,     cap: 120 },
  quartz:  { name: '수정',           dial1: { name: '땅속 물 온도', min: 100, max: 400, unit: '°C', start: 250 }, dial2: { name: '식히는 빠르기', lo: '천천히', hi: '빨리',   start: 0.4 },  unit: '년', sizeUnit: 'mm', flow: 400,   cap: 20000 },
  cave:    { name: '거대 결정 동굴', free: true, dial1: { name: '물 온도', min: 30, max: 70, unit: '°C', start: 55 }, dial2: { name: '물에 녹은 양', lo: '조금', hi: '많이', start: 0.2 }, unit: '년', sizeUnit: 'm', flow: 20000, cap: 600000 },
};
export const FREE_CAP = 3;          // 자유에서는 시간 한도가 세 배
export const FREE_SNOW_MIN = -40;   // 자유에서는 온도 다이얼이 더 내려간다

/* 눈 열두 칸: 온도 띠(A 0~-4 · B -4~-10 · C -10~-22 · D 그보다 추움) × 물기(0 적게 · 1 보통 · 2 많이) */
export const SNOW = {
  A0: { name: '두꺼운 육각 판',        family: 'plate' },
  A1: { name: '육각 판',               family: 'plate' },
  A2: { name: '얇고 넓은 육각 판',     family: 'plate' },
  B0: { name: '짧은 기둥',             family: 'column' },
  B1: { name: '속 빈 기둥',            family: 'column' },
  B2: { name: '가는 바늘',             family: 'column' },
  C0: { name: '작은 육각 판',          family: 'plate' },
  C1: { name: '부채꼴 육각 판',        family: 'plate' },
  C2: { name: '별 모양(나뭇가지 눈)',  family: 'dendrite' },
  D0: { name: '작은 기둥',             family: 'column' },
  D1: { name: '총알 다발',             family: 'column' },
  D2: { name: '판 달린 기둥',          family: 'column' },
};
export const FAMILY = { plate: '판', column: '기둥', dendrite: '가지' };

export const SAYS = {
  empty:      '아직 아무것도 안 자랐어요.',
  plate:      '납작한 육각 판으로 자라요.',
  column:     '가는 바늘·기둥으로 자라요.',
  dendrite:   '가지 여섯의 별 모양으로 자라요. 나뭇가지 눈이에요.',
  history:    (core, tip, seq = [core, tip]) => (seq.length > 2
    ? `가운데는 ${FAMILY[seq[0]]}, ${seq.slice(1, -1).map(f => '그다음 ' + FAMILY[f]).join(', ')}, 끝은 ${seq[seq.length - 1] === seq[0] ? '다시 ' : ''}${FAMILY[tip]} — 자란 역사가 모양에 남아요.`
    : `가운데는 ${FAMILY[core]}, 끝은 ${FAMILY[tip]} — 자란 역사가 모양에 남아요.`),
  twins:      '같은 조건으로 두 번 — 닮았지만 똑같지는 않아요.',
  wet:        '소금물이 마르는 중이에요.',
  cube:       '반듯한 정육면체 소금이 생겨요.',
  smallcubes: '작은 정육면체가 여러 개 생겨요.',
  powder:     '잘고 뭉친 가루가 돼요.',
  solid:      '아직 안 녹았어요. 271도보다 뜨겁게 해요.',
  melt:       '다 녹았어요. 이제 271도 아래로 식혀 봐요.',
  hopper:     '네모 계단이 소용돌이치는 탑이 자라요. 겉이 무지개색이에요.',
  smallhopper:'작은 계단 탑이 여러 개 생겨요. 겉이 무지개색이에요.',
  lump:       '무늬 없는 은빛 덩어리가 돼요.',
  grain:      '아직 작은 알갱이예요. 수정은 아주 오래 걸려요.',
  prism:      '육각 기둥에 뾰족한 끝이 달린 수정이 자라요.',
  cluster:    '뿌옇고 잔 기둥이 무더기로 나요.',
  caveSmall:  '흰 기둥 결정이 자라요. 아직 탐험가 인형보다 작아요.',
  cave:       '사람보다 큰 흰 기둥 결정들 사이에 작은 탐험가 인형이 서 있어요.',
  crust:      '잔 결정이 벽을 껍질처럼 덮어요. 크게 자라지 못해요.',
  healing:    '흠 자리가 다른 곳보다 빨리 자라 메워지고 있어요.',
  healed:     '흠을 메우며 다시 반듯해졌어요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** 같은 seed → 같은 수의 줄 */
export function rng(seed = 1) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** 눈 한 칸 */
export function snowCell(T, w) {
  const band = T > -4 ? 'A' : T > -10 ? 'B' : T > -22 ? 'C' : 'D';
  const level = w < 1 / 3 ? 0 : w < 2 / 3 ? 1 : 2;
  const id = band + level;
  return { id, band, level, ...SNOW[id] };
}
/** 눈이 자라는 빠르기(mm/분) — 물기가 많을수록, 가지일수록 빠르다 */
export function snowRate(T, w) {
  const f = snowCell(T, w).family;
  return (0.02 + 0.12 * clamp(w, 0, 1)) * (f === 'dendrite' ? 1.3 : f === 'plate' ? 0.8 : 1.0);
}
export const saltRate = (T, w) => (0.15 + 0.85 * clamp(w, 0, 1)) * (0.7 + 0.6 * (T - 10) / 50);   // 하루에 마르는 몫(× 1/SALT_FULL)
const SALT_FULL = 6;
const coolRate = w => 0.05 + 0.95 * clamp(w, 0, 1);
const quartzRate = (T, w) => 0.0015 * (0.3 + 0.7 * clamp(w, 0, 1)) * (0.5 + (T - 100) / 300);      // mm/년
const caveTemp = T => Math.max(0.2, 1 - Math.abs(T - 55) / 20);
const caveRate = (T, w) => 2e-5 * (0.3 + clamp(w, 0, 1)) * caveTemp(T);                               // m/년

/** 역사를 시간 t 까지만 자른다(돌려 보기) */
export function sliceSteps(steps, t) {
  const out = []; let acc = 0;
  for (const s of steps) {
    if (s.notch) { if (acc <= t + 1e-9) out.push(s); continue; }
    if (acc >= t - 1e-12) break;
    const dt = Math.min(s.dt, t - acc); out.push(dt === s.dt ? s : { ...s, dt }); acc += dt;
  }
  return out;
}
export const totalTime = steps => steps.reduce((a, s) => a + (s.dt || 0), 0);

export function grow({ box = 'snow', steps = [], seed = 1 } = {}) {
  const B = BOXES[box] ? box : 'snow';
  const R = rng(seed), jitter = 1 + 0.06 * (R() - 0.5);
  let size = 0, defect = 0, notched = false, lastT = BOXES[B].dial1.start, lastW = BOXES[B].dial2.start;
  const res = { box: B, seed, time: totalTime(steps), unit: BOXES[B].unit, sizeUnit: BOXES[B].sizeUnit };
  const addSize = ns => { const dr = Math.max(0, ns - size); size = ns; if (defect > 0) defect = Math.max(0, defect - 2 * dr); };
  const notch = () => { if (size > 0) { defect = Math.max(defect, 0.3 * size); notched = true; } };

  if (B === 'snow') {
    const layers = [];
    for (const s of steps) {
      if (s.notch) { notch(); continue; }
      lastT = s.T; lastW = s.w;
      const c = snowCell(s.T, s.w), dr = snowRate(s.T, s.w) * s.dt * jitter;
      if (dr <= 0) continue;
      const L = layers[layers.length - 1];
      if (L && L.id === c.id) L.r1 += dr; else layers.push({ id: c.id, name: c.name, family: c.family, r0: size, r1: size + dr });
      addSize(size + dr);
    }
    const share = { plate: 0, column: 0, dendrite: 0 };
    for (const L of layers) share[L.family] += (L.r1 - L.r0) / (size || 1);
    const seq = [];                                      // 눈에 띄는 겹(15% 넘게)만, 같은 버릇끼리 붙여서
    for (const L of layers) {
      if (share[L.family] < 0.15) continue;
      if (seq[seq.length - 1] !== L.family) seq.push(L.family);
    }
    let kind;
    if (size < 0.05) kind = 'empty';
    else if (seq.length >= 2) kind = 'history';
    else kind = seq[0] || Object.keys(share).reduce((a, b) => (share[b] > share[a] ? b : a));
    const core = seq[0] || kind, tip = seq[seq.length - 1] || kind;
    const main = layers.filter(L => L.family === tip).reduce((a, b) => (!a || b.r1 - b.r0 > a.r1 - a.r0 ? b : a), null);
    // 곁가지: 팔을 따라 걸어가며, 그 자리를 자랄 때 가지 버릇이었으면 곁가지를 낸다. 자리만 seed 로 흔들린다.
    const branches = [];
    if (size > 0) for (let r = size * (0.05 + 0.05 * R()); r < size * 0.97; r += size * (0.045 + 0.06 * R())) {
      const L = layers.find(q => r >= q.r0 && r < q.r1);
      if (L && L.family === 'dendrite') branches.push({ at: r, len: Math.min((size - r) * (0.3 + 0.25 * R()), (r - L.r0) * 0.8 + size * 0.04) });   // 팔 뿌리 쪽은 짧게, 가운데가 길게
    }
    const arms = Array.from({ length: 6 }, () => branches.map(b => ({ at: b.at, len: b.len * (1 + 0.06 * (R() - 0.5)) })));
    Object.assign(res, { kind, layers, share, seq, core, tip, label: main ? main.name : '', arms });
    res.says = kind === 'history' ? SAYS.history(core, tip, seq) : SAYS[kind];
  }

  else if (B === 'salt') {
    let f = 0, sw = 0;
    for (const s of steps) {
      if (s.notch) { notch(); continue; }
      lastT = s.T; lastW = s.w;
      const e = saltRate(s.T, s.w), take = Math.min(e * s.dt / SALT_FULL, 1 - f);
      if (take <= 0) continue;
      f += take; sw += take * Math.min(1, e);
      const sp = sw / f, N = Math.max(1, Math.round(1 + 600 * sp ** 3));
      addSize(10 * Math.cbrt(f / N) * jitter);
    }
    const speed = f ? sw / f : 0, count = Math.max(1, Math.round(1 + 600 * speed ** 3));
    const kind = f < 0.02 ? 'wet' : speed < 0.3 ? 'cube' : speed >= 0.6 ? 'powder' : 'smallcubes';
    Object.assign(res, { kind, dried: f, speed, count, done: f >= 1 - 1e-9, label: { cube: '정육면체', smallcubes: '작은 정육면체', powder: '가루', wet: '' }[kind] });
    res.says = SAYS[kind];
  }

  else if (B === 'bismuth') {
    let melted = false, f = 0, sw = 0;
    for (const s of steps) {
      if (s.notch) { notch(); continue; }
      lastT = s.T; lastW = s.w;
      if (s.T >= MELT) { melted = true; f = 0; sw = 0; size = 0; defect = 0; notched = false; continue; }
      if (!melted) continue;
      const c = coolRate(s.w), take = Math.min(c * s.dt / 4, 1 - f);
      if (take <= 0) continue;
      f += take; sw += take * c;
      addSize((8 + 34 * (1 - sw / f) ** 1.5) * Math.cbrt(f) * jitter);
    }
    const speed = f ? sw / f : 0;
    const kind = !melted ? 'solid' : f < 0.02 ? 'melt' : speed < 0.4 ? 'hopper' : speed < 0.7 ? 'smallhopper' : 'lump';
    const stairs = kind === 'hopper' || kind === 'smallhopper' ? Math.max(3, Math.round(size / 3)) : 0;
    Object.assign(res, { kind, melted, solid: f, speed, stairs, rainbow: stairs > 0, spin: seed % 2 ? 1 : -1, done: melted && f >= 1 - 1e-9,
      label: { hopper: '무지개 계단 탑', smallhopper: '작은 계단 탑', lump: '은빛 덩어리' }[kind] || '' });
    res.says = SAYS[kind];
  }

  else if (B === 'quartz') {
    let sw = 0;
    for (const s of steps) {
      if (s.notch) { notch(); continue; }
      lastT = s.T; lastW = s.w;
      const dL = quartzRate(s.T, s.w) * s.dt * jitter; if (dL <= 0) continue;
      sw += dL * s.w; addSize(size + dL);
    }
    const speed = size ? sw / size : 0;
    const kind = size < 5 ? 'grain' : speed > 0.7 ? 'cluster' : 'prism';
    Object.assign(res, { kind, speed, label: { prism: '육각 기둥 수정', cluster: '뿌연 잔 기둥', grain: '' }[kind] });
    res.says = SAYS[kind];
  }

  else {   // cave
    let sw = 0, grown = 0;
    for (const s of steps) {
      if (s.notch) { notch(); continue; }
      lastT = s.T; lastW = s.w;
      const dH = caveRate(s.T, s.w) * s.dt * jitter; if (dH <= 0) continue;
      grown += dH; sw += dH * s.w;
      const sp = sw / grown; addSize(sp > 0.5 ? Math.min(grown, 0.05) : grown);
    }
    const speed = grown ? sw / grown : 0;
    const kind = speed > 0.5 ? 'crust' : size >= PERSON ? 'cave' : 'caveSmall';
    Object.assign(res, { kind, speed, label: kind === 'cave' ? '거대 결정' : '' });
    res.says = SAYS[kind];
  }

  const healed = notched && defect <= 1e-9;
  Object.assign(res, { size, defect, notched, healed, lastT, lastW });
  if (notched && size > 0) res.says += ' ' + (healed ? SAYS.healed : SAYS.healing);
  return res;
}

/** 같은 조건 두 번: 닮았나(종류·크기), 똑같나(곁가지 하나하나까지) */
export function twins(a, b) {
  const alike = a.box === b.box && a.kind === b.kind && a.core === b.core && a.tip === b.tip
    && Math.abs(a.size - b.size) <= 0.12 * Math.max(a.size, b.size, 1e-9);
  const same = JSON.stringify(a.arms ?? null) === JSON.stringify(b.arms ?? null) && a.size === b.size;
  return { alike, same, says: alike && !same ? SAYS.twins : alike ? '똑같아요.' : '모양이 달라요.' };
}

/** 의뢰 셋 — ok(결과) 맞았나, tell(결과) 아니면 무엇이 걸렸나 */
export const MISSIONS = [
  { id: 'star', say: '별 모양 눈을 길러라', hint: '아주 춥게(영하 15도쯤), 물기를 많이.', why: 1,
    ok: r => r.box === 'snow' && r.kind === 'dendrite' && r.size >= 1.5,
    tell: r => r.box !== 'snow' ? '눈 결정 상자를 골라요.'
      : r.kind === 'empty' ? SAYS.empty
      : r.kind === 'column' ? '바늘·기둥이 됐어요. 더 춥게, 영하 15도쯤으로.'
      : r.kind === 'plate' ? (snowCell(r.lastT, r.lastW).band === 'C' ? '판이 됐어요. 물기를 많이 해 봐요.' : '판이 됐어요. 더 춥게(영하 15도쯤), 물기도 많이.')
      : r.kind === 'history' ? '가운데와 끝이 달라요. 새 씨앗부터 같은 조건으로 길러요.'
      : '거의 다 됐어요. 조금 더 길러요.' },
  { id: 'order', say: '주문서와 같은 눈 — 가운데는 판, 끝은 가지', hint: '처음엔 판이 자라는 온도, 도중에 가지가 나는 온도로 바꿔요.', why: 0,
    ok: r => r.box === 'snow' && r.kind === 'history' && r.core === 'plate' && r.tip === 'dendrite' && r.share.dendrite >= 0.25 && r.size >= 1.5,
    tell: r => r.box !== 'snow' ? '눈 결정 상자를 골라요.'
      : r.kind === 'empty' ? SAYS.empty
      : r.kind === 'dendrite' ? '처음부터 가지가 났어요. 처음엔 판(영하 2도쯤)으로 기르다가 도중에 바꿔요.'
      : r.kind === 'plate' ? '아직 끝도 판이에요. 도중에 영하 15도쯤, 물기 많이로 바꿔요.'
      : r.seq && r.seq.includes('column') ? '기둥이 섞였어요. 판 → 가지 차례로 길러요.'
      : r.kind === 'history' && r.core === 'dendrite' ? '차례가 거꾸로예요. 가운데가 판, 끝이 가지.'
      : r.kind === 'history' && r.tip === 'plate' ? '끝이 다시 판이 됐어요. 가지가 난 다음에는 온도를 그대로 두어요.'
      : r.kind === 'column' ? '바늘·기둥이 됐어요. 판 → 가지 차례로 길러요.'
      : '가지가 아직 짧아요. 조금 더 길러요.' },
  { id: 'rainbow', say: '가장 큰 무지개 계단을 길러라', hint: '녹인 다음, 식히는 빠르기를 아주 천천히. 느릴수록 커요.', why: 2,
    ok: r => r.box === 'bismuth' && r.done && r.kind === 'hopper' && r.size >= BIG_RAINBOW,
    tell: r => r.box !== 'bismuth' ? '비스무트 상자를 골라요.'
      : !r.melted ? '먼저 녹여요. 271도보다 뜨겁게.'
      : r.kind === 'melt' ? '이제 271도 아래로 식혀요.'
      : !r.done ? '아직 다 안 굳었어요. 시간을 더 감아요.'
      : r.kind === 'lump' ? '너무 빨리 식혔어요. 은빛 덩어리예요. 다시 271도 위로 녹인 다음 천천히 식혀요.'
      : `계단이 ${Math.round(r.size)}mm예요. 다시 271도 위로 녹인 다음, 더 천천히 식힐수록 커요.` },
];

export const WHY = [
  '아주 작은 알갱이들이 정해진 줄에 맞춰 차곡차곡 붙어요. 그래서 누가 깎지 않아도 반듯해요.',
  '눈은 물 알갱이가 여섯 방향으로 붙어서 언제나 육각이에요.',
  '천천히 자랄수록 크고 반듯해요.',
];
