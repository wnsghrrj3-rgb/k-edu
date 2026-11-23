/* 케이원더 · 달 만들기 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 단위: 무게 = 어린 지구의 배수(m), 빠르기 = 둘이 서로 끌어당겨 생기는 탈출 빠르기의 배수(v, 1 ≈ 초속 10 km),
 *       방향 = 부딪치는 각(θ, 도). 0 = 정면, 90 = 겉만 스침.
 *
 * collide({ size, angle, speed, what, seed }) → { outcome, says, moons:[{mass, a, inner, fate}], moonMass, ratio, ocean, … }
 *   outcome: 'crater'(작은 것 — 구덩이) · 'moon'(달 하나) · 'merge'(합체) · 'shatter'(박살) · 'graze'(두 번째 충돌)
 *            · 'twomoons'(달 둘) · 'runaway'(겉만 긁고 달아남)
 * timeline(res, years) → 부딪친 뒤 years 해가 지났을 때의 모습(고리 → 달 → 멀어짐 → 식어 파래짐)
 *
 * 놀이로 줄인 것(진짜 계산은 조각 수천 개를 끌림으로 돌린다 — 여기는 그 결과를 규칙으로):
 *   - 박살: 부딪치는 힘(줄인 무게 × 빠르기²)이 문턱 QSTAR 를 넘으면.
 *   - 겉만 긁고 달아남: 비스듬한데 빠르기가 RUN_V 를 넘으면(「치고 달아나기」 충돌).
 *   - 원반(튀어 오른 겉)의 무게 = DISK_K × m × (45° 에서 가장 큼) × (너무 빠르면 줄어듦). 그 85% 가 달이 된다.
 *   - 달 둘: 둘의 거리가 SPACING 배보다 가까우면 작은 달이 떨어지거나(안쪽일 때) 튕겨 달아난다(바깥쪽일 때).
 *   - 매번 다르다: seed 로 부딪치는 각을 ±1.5°, 달 무게를 ±5% 흔든다(같은 seed = 같은 결과).
 */

export const SIZE_MIN = 0.005, SIZE_MAX = 1, SIZE_FREE = 10;
export const SPEED_MIN = 1, SPEED_MAX = 3, SPEED_FREE = 5;
export const ANGLE_MAX = 85;
export const SMALL = 0.03;          // 이보다 가벼우면 「작은 것」
export const EQUAL = 0.5;           // 이보다 무거우면 「같은 것(지구만 한 것)」
export const HEAD = 25;             // 이보다 곧으면 「정면」
export const TWO = 55;              // 여기부터 「조금 다르게 비스듬히」 — 달 둘
export const GRAZE = 70;            // 여기부터 「아주 스치듯」
export const RUN_V = 1.8;           // 비스듬히 이보다 빠르면 달아남
export const QSTAR = 0.6;           // 박살 문턱
export const DISK_K = 0.13, MOON_FROM_DISK = 0.85;
export const OUR_MOON = 0.0123;     // 지금 달의 무게(지구의 배수)
export const OUR_MOON_OK = [0.75, 1.3];
export const MOON_A0 = 3.5;         // 막 생긴 달의 거리(지구 반지름의 배수, 로슈 한계 바로 밖)
export const TWO_A1 = 3.3, SPACING = 1.6;
export const FORM_YEARS = 1 / 12;   // 고리가 뭉쳐 달이 되는 데 한 달쯤
export const FATE_YEARS = 1e5;      // 달 둘 중 하나가 떨어지거나 달아나는 때
export const NOW_YEARS = 4.5e9, NOW_A = 60.3, EARTH_KM = 6371, MOON_KM = 1737;
export const KMS_PER_V = 10;

export const SIZES = [                // 크기 다이얼의 눈금 이름
  { at: 0.012, name: '달만 한 것' }, { at: 0.107, name: '화성만 한 것' }, { at: 1, name: '지구만 한 것' }, { at: 10, name: '지구 열 개만 한 것' },
];
export const SAYS = {
  crater:   '큰 구덩이가 파이고 번쩍! 파편이 조금 튀었다가 다시 떨어져요. 달은 안 생겨요.',
  moon:     '겉이 녹아 튀어 올라 빛나는 고리가 생겨요. 시간을 감으면 뭉쳐서 달 하나가 돼요.',
  merge:    '둘이 합쳐져 큰 행성 하나가 돼요. 달은 없어요.',
  shatter:  '둘 다 부서져 파편 구름이 돼요.',
  graze:    '스치고 빗나갔다가 다시 돌아와 두 번째로 부딪혀요. 이번엔 합쳐져 하나가 돼요.',
  twomoons: '빛나는 고리가 뭉쳐 달이 둘 생겨요! 나중에 하나는 떨어지거나 달아나요.',
  runaway:  '너무 빨라서 겉만 긁고 그대로 달아나요. 남은 파편이 적어 달이 안 생겨요.',
  ocean:    '얼음이 녹아 바다가 생겨요.',
  ring:     '겉이 녹아 튀어 올라 빛나는 고리가 돌고 있어요.',
  formed1:  '고리가 뭉쳐서 달 하나가 됐어요.',
  formed2:  '고리가 뭉쳐서 달 둘이 됐어요.',
  recede:   '달이 처음엔 하늘을 크게 덮을 만큼 가깝다가 점점 멀어져요.',
  blue:     '지구 겉이 식어 파래져요.',
  hot:      '지구 겉이 아직 붉게 달아올라 있어요.',
  crust:    '지구 겉이 식어 검게 굳어요.',
  fell:     '안쪽의 작은 달이 지구로 떨어졌어요.',
  fled:     '바깥쪽의 작은 달이 튕겨 달아났어요.',
  both:     '두 달이 다 살아남았어요!',
  cloud:    '파편 구름이 천천히 퍼져요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function rng(seed = 1) { let s = (Math.floor(Math.abs(seed)) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function sizeName(m) {
  if (m < SMALL) return '작은 것';
  if (m >= 3) return '지구보다 훨씬 큰 것';
  if (m >= EQUAL) return '지구만 한 것';
  return m >= 0.06 && m <= 0.2 ? '화성만 한 것' : (m < 0.06 ? '화성보다 작은 것' : '화성보다 큰 것');
}
/** 부딪치는 힘(줄인 무게 × 빠르기² / 전체 무게). 같은 둘이 정면이면 v²/8 */
export const impactEnergy = (m, v) => 0.5 * m / ((1 + m) * (1 + m)) * v * v;
/** 원반이 45° 에서 가장 크다 */
export const bell = th => clamp(1 - ((th - 45) / 30) ** 2, 0.3, 1);
/** 너무 빠르면 원반이 흩어진다 */
export const speedKeep = v => v <= 1.4 ? 1 : clamp(1 - (v - 1.4), 0.6, 1);

export function collide(input = {}) {
  const free = !!input.free;
  const m = clamp(input.size ?? 0.107, SIZE_MIN, free ? SIZE_FREE : SIZE_MAX);
  const v = clamp(input.speed ?? 1.1, SPEED_MIN, free ? SPEED_FREE : SPEED_MAX);
  const th0 = clamp(input.angle ?? 45, 0, ANGLE_MAX);
  const what = input.what === 'ice' ? 'ice' : 'rock';
  const r = rng(input.seed ?? 1);
  const shake = input.jitter !== false;                              // 의뢰 중에는 흔들지 않는다(jitter:false)
  const j1 = r(), j2 = r(), th = clamp(th0 + (shake ? (j1 - 0.5) * 3 : 0), 0, 89), wob = shake ? 1 + (j2 - 0.5) * 0.1 : 1;
  const Q = impactEnergy(m, v);
  let outcome;
  if (m < SMALL) outcome = 'crater';
  else if (Q >= QSTAR) outcome = 'shatter';
  else if (v > RUN_V && th >= HEAD) outcome = 'runaway';
  else if (th >= GRAZE) outcome = 'graze';
  else if (th < HEAD) outcome = 'merge';
  else outcome = th < TWO ? 'moon' : 'twomoons';

  const disk = (outcome === 'moon' || outcome === 'twomoons') ? DISK_K * m * bell(th) * speedKeep(v) : 0;
  const moonMass = disk * MOON_FROM_DISK * wob;
  let moons = [];
  if (outcome === 'moon') moons = [{ mass: moonMass, a: MOON_A0, inner: true, fate: 'stay' }];
  if (outcome === 'twomoons') {
    const a2 = TWO_A1 * Math.max(1.05, 1 + 1.2 * (v - 1));
    const innerBig = th < (TWO + GRAZE) / 2;
    const big = moonMass * 0.7, small = moonMass * 0.3;
    const stable = a2 / TWO_A1 >= SPACING;
    moons = [
      { mass: innerBig ? big : small, a: TWO_A1, inner: true, fate: stable || innerBig ? 'stay' : 'fell' },
      { mass: innerBig ? small : big, a: a2, inner: false, fate: stable || !innerBig ? 'stay' : 'fled' },
    ];
  }
  const res = {
    outcome, what, size: m, angle: th0, angleHit: th, speed: v, energy: Q, disk, moonMass, moons,
    ratio: moonMass / OUR_MOON, ocean: what === 'ice' && outcome !== 'shatter' && outcome !== 'runaway',
    secondHit: outcome === 'graze', debris: outcome === 'crater' ? 'little' : outcome === 'shatter' ? 'cloud' : outcome === 'runaway' ? 'some' : disk > 0 ? 'ring' : 'none',
    flash: clamp(Q * 4 + m, 0.2, 3),
    stable: outcome === 'twomoons' ? moons.every(o => o.fate === 'stay') : null,
    sizeName: sizeName(m), kms: Math.round(v * KMS_PER_V),
  };
  res.says = SAYS[outcome] + (res.ocean ? ' ' + SAYS.ocean : '');
  return res;
}

/** 부딪친 뒤 years 해: 달이 멀어지는 거리(밀물·썰물이 달을 밀어낸다 — 대략 시간의 2/13 제곱) */
export const recedeFactor = years => Math.max(1, NOW_A * Math.pow(Math.max(years, 1e-9) / NOW_YEARS, 2 / 13) / MOON_A0);
export const moonRadiusKm = mass => MOON_KM * Math.cbrt(Math.max(mass, 1e-9) / OUR_MOON);
/** 땅에서 올려다본 달의 크기(도) — a 는 지구 반지름의 배수 */
export const skyDeg = (mass, a) => 2 * Math.atan(moonRadiusKm(mass) / ((a - 1) * EARTH_KM)) * 180 / Math.PI;
export const SKY_NOW = skyDeg(OUR_MOON, NOW_A);

export function earthAt(years, res) {
  const early = res && res.ocean ? 1e6 : 1e8;
  return years < 1e6 ? 'hot' : years < early ? 'crust' : 'blue';
}

export function timeline(res, years = 0) {
  const formed = (res.outcome === 'moon' || res.outcome === 'twomoons') && years >= FORM_YEARS;
  const ringNow = (res.outcome === 'moon' || res.outcome === 'twomoons') && !formed;
  const g = recedeFactor(years);
  const moons = formed ? res.moons.map(o => {
    const gone = o.fate !== 'stay' && years >= FATE_YEARS;
    const a = o.a * g;
    return { ...o, a, alive: !gone, sky: skyDeg(o.mass, a) };
  }) : [];
  const alive = moons.filter(o => o.alive);
  const earth = res.outcome === 'shatter' ? 'cloud' : earthAt(years, res);
  const parts = [];
  if (res.outcome === 'shatter') parts.push(SAYS.cloud);
  else if (ringNow) parts.push(SAYS.ring);
  else if (formed) {
    parts.push(res.outcome === 'moon' ? SAYS.formed1 : SAYS.formed2);
    if (res.outcome === 'twomoons' && years >= FATE_YEARS) {
      const lost = moons.find(o => !o.alive);
      parts.push(lost ? (lost.fate === 'fell' ? SAYS.fell : SAYS.fled) : SAYS.both);
    }
    if (years >= 1000 && alive.length) {
      const big = alive.reduce((a, b) => (b.mass > a.mass ? b : a));
      parts.push(SAYS.recede + ` 지금은 하늘에서 ${big.sky.toFixed(1)}°(오늘 달의 ${(big.sky / SKY_NOW).toFixed(1)}배).`);
    }
  }
  if (res.outcome !== 'shatter') parts.push(SAYS[earth] + (res.ocean && earth !== 'hot' ? ' ' + SAYS.ocean : ''));
  return { years, ring: ringNow, formed, moons, alive: alive.length, earth, says: parts.join(' ') };
}

/** 시간 다이얼(0~1) ↔ 해. 0 = 부딪친 지 9시간, 1 = 45억 년(오늘) */
export const LOG_MIN = -3, LOG_MAX = Math.log10(NOW_YEARS);
export const dialYears = f => Math.pow(10, LOG_MIN + clamp(f, 0, 1) * (LOG_MAX - LOG_MIN));
export const yearsDial = y => clamp((Math.log10(Math.max(y, 1e-9)) - LOG_MIN) / (LOG_MAX - LOG_MIN), 0, 1);
export function yearsText(y) {
  if (y < 1 / 365) return Math.max(1, Math.round(y * 365 * 24)) + '시간';
  if (y < 1 / 12) return Math.round(y * 365) + '일';
  if (y < 1) return Math.round(y * 12) + '달';
  if (y < 1e4) return Math.round(y).toLocaleString('ko-KR') + '년';
  if (y < 1e8) return Math.round(y / 1e4).toLocaleString('ko-KR') + '만 년';
  return (y / 1e8).toFixed(y < 1e9 ? 1 : 0).replace(/\.0$/, '') + '억 년';
}

/** 의뢰 셋 — state = { res, years } (years = 시간 다이얼로 감은 해) */
const notWound = '시간 다이얼을 돌려 감아 봐요.';
function missTell(r) {
  return {
    crater: '너무 작아요. 구덩이만 생겼어요. 더 큰 행성을.',
    merge: '정면이라 합쳐져 버렸어요. 비스듬히 던져요.',
    shatter: '너무 세서 다 부서졌어요.',
    runaway: '너무 빨라서 겉만 긁고 달아났어요. 조금 느리게.',
    graze: '너무 스치듯이에요. 빗나갔다 돌아와 합쳐졌어요.',
    twomoons: '달이 둘 생겼어요. 조금 덜 비스듬히.',
  }[r.outcome] || '';
}
export const MISSIONS = [
  { id: 'one', say: '달 하나를 만들어라', hint: '화성만 한 행성을 비스듬히, 알맞은 빠르기로.', why: 0,
    ok: s => !!s.res && s.res.outcome === 'moon' && s.years >= FORM_YEARS,
    tell: s => !s.res ? '먼저 행성을 던져요.' : s.res.outcome !== 'moon' ? missTell(s.res) : s.years < FORM_YEARS ? '빛나는 고리가 생겼어요. ' + notWound : '' },
  { id: 'ours', say: '지금 우리 달만 한 크기로', hint: '던지는 행성의 크기와 방향을 같이 바꿔 봐요. 행성이 클수록 달도 커요.', why: 1,
    ok: s => !!s.res && s.res.outcome === 'moon' && s.years >= FORM_YEARS && s.res.ratio >= OUR_MOON_OK[0] && s.res.ratio <= OUR_MOON_OK[1],
    tell: s => {
      if (!s.res) return '먼저 행성을 던져요.';
      if (s.res.outcome !== 'moon') return missTell(s.res);
      if (s.years < FORM_YEARS) return '빛나는 고리가 생겼어요. ' + notWound;
      const x = s.res.ratio.toFixed(2);
      if (s.res.ratio > OUR_MOON_OK[1]) return `우리 달의 ${x}배예요. 너무 커요. 더 작은 행성으로.`;
      if (s.res.ratio < OUR_MOON_OK[0]) return `우리 달의 ${x}배예요. 너무 작아요. 더 큰 행성이나 45°쯤으로.`;
      return '';
    } },
  { id: 'two', say: '달 둘을 만들어 둘 다 살아남게', hint: '달 둘은 조금 더 비스듬히. 둘이 너무 가까우면 하나가 떨어지거나 달아나요.', why: 0,
    ok: s => !!s.res && s.res.outcome === 'twomoons' && s.res.stable && s.years >= FATE_YEARS,
    tell: s => {
      if (!s.res) return '먼저 행성을 던져요.';
      if (s.res.outcome !== 'twomoons') return s.res.outcome === 'moon' ? '달이 하나예요. 조금 더 비스듬히.' : missTell(s.res);
      if (s.years < FATE_YEARS) return '달이 둘! 끝까지 살아남나 시간을 더 감아 봐요.';
      const lost = s.res.moons.find(o => o.fate !== 'stay');
      if (lost) return (lost.fate === 'fell' ? '안쪽 작은 달이 떨어졌어요.' : '바깥쪽 작은 달이 튕겨 달아났어요.') + ' 두 달이 너무 가까웠어요. 멀리 떼어 놓으려면 더 세게 던져 봐요.';
      return '';
    } },
];

export const WHY = [
  '아주 옛날, 화성만 한 행성이 어린 지구와 비스듬히 부딪쳤어요. 튀어나온 조각들이 뭉쳐 달이 됐다고 과학자들은 생각해요.',
  '그래서 달의 돌은 지구의 돌과 닮았어요.',
];
