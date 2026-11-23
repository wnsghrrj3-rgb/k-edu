/* 케이원더 · 오로라 — 논리(그림을 모른다. node 로 시험한다)
 *
 * aurora({ wind, alt, cut, magnet, planet }) → { level, curtain, main, pinkRim, redTop, sky, ring, korea, says, … }
 *   wind   : 태양 바람 세기 0~1 (조종판 레버)
 *   alt    : 고도 다이얼 = 바람이 약할 때 커튼 아래 끝이 생기는 높이(km), ALT_MIN~ALT_MAX
 *   cut    : 'ground'(망원경 — 호숫가에서 올려다보기) | 'space'(위성 창 — 극지방을 내려다보기)
 *   magnet : 지구 자석 켜짐(자유에서 끌 수 있다)
 *   planet : 'earth' | 'jupiter'(자유)
 *
 * 놀이로 줄인 것:
 *   - 위도는 모두 「자석 위도」(지구 자석의 북극에서 잰 위도). 호숫가 = 60°, 서울 = 29°.
 *   - 오로라 띠(타원 고리)의 남쪽 끝은 EDGE_KNOTS 를 이은 꺾은선. 고요하면 67°, 아주 큰 폭풍(w = 1)이면 30°
 *     (1770년처럼 우리 옛 기록에 남은 큰 폭풍 때 이만큼 내려왔다). 북쪽 끝 = 70 + 5w² 도.
 *     위성 창의 「밝은 고리」 굵기 = 4 + 12w² 도, 그 안쪽(극 쪽)은 옅은 빛. 호숫가 하늘은 옅은 빛까지 쳐서 덮인 몫을 잰다.
 *   - 커튼 높이: 아래 끝 = 고도 − 75·(w − 0.15)  (센 바람의 알갱이일수록 더 깊이 들어온다)
 *               위 끝   = 고도 + 40 + 150·(w − 0.6) (센 바람일수록 더 높이까지 빛난다)
 *   - 색은 높이로만: 100km 아래 = 질소(보라·분홍), 100~200km = 산소(초록), 200km 위 = 산소(빨강).
 *   - 하늘에서 어디쯤 보이나는 둥근 지구 위 높이 h 의 점을 올려다보는 각으로 셈한다.
 */

export const R_EARTH = 6371, R_JUPITER = 71492, EARTH_DIAM = 12742;
export const OBSERVER_LAT = 60, KOREA_LAT = 29;
export const ALT_MIN = 70, ALT_MAX = 250, ALT_DEFAULT = 135;
export const N2_TOP = 100, GREEN_TOP = 200;          // 색이 바뀌는 높이(km)
export const SEEN = 5;                               // 이만큼(km) 두께가 되어야 눈에 띈다
export const KOREA_ELEV = 3;                         // 지평선 위 이만큼(도) 떠야 「보인다」
export const LEVELS = [
  { id: 'weak',   name: '약함', upTo: 0.3 },
  { id: 'medium', name: '보통', upTo: 0.55 },
  { id: 'strong', name: '셈',   upTo: 0.8 },
  { id: 'storm',  name: '폭풍', upTo: Infinity },
];
export const COLORS = {
  pink:  { name: '보라·분홍', adj: '보라·분홍', gas: '질소' },
  green: { name: '초록',      adj: '초록',      gas: '산소' },
  red:   { name: '빨강',      adj: '빨간',      gas: '산소' },
  blue:  { name: '파랑',      adj: '푸른',      gas: '수소' },
};
export const SAYS = {
  weak:   c => `지평선 가까이 희미한 ${c} 띠가 떠요.`,
  medium: c => `${c} 커튼이 하늘을 가로질러 너울너울 흔들려요.`,
  strong: c => `${c} 커튼이 머리 위까지 번지고 주름이 빨라져요.`,
  storm:  () => '하늘 전체가 오로라로 덮여요.',
  pinkRim: '아래 가장자리에 분홍 테가 생겨요.',
  redTop:  '위쪽이 빨갛게 물들어요.',
  corona:  '사방에서 머리 위 한 점으로 모이는 빛살 — 왕관이에요.',
  high:    '높은 곳의 산소가 빨갛게 빛나요.',
  low:     '낮은 곳의 질소가 보라·분홍으로 빛나요.',
  space:   '극지방을 두른 빛나는 고리가 보여요.',
  spaceGrow: '바람이 세질수록 고리가 굵어지고 남쪽으로 내려와요.',
  korea:   '우리나라에서도 보여요!',
  nomagnet: '오로라가 사라지고 태양 바람이 땅까지 그대로 와요.',
  jupiter: '훨씬 큰 푸른 오로라가 떠요. 목성의 오로라 고리 하나가 지구보다 커요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const D2R = Math.PI / 180;
export const windLevel = w => LEVELS.find(L => w < L.upTo).id;
export const EDGE_KNOTS = [[0, 67], [0.3, 63.0], [0.55, 60.3], [0.8, 58.4], [1, 30]];
/** 오로라 띠의 남쪽 끝(자석 위도) — 바람이 세질수록 남쪽으로 */
export function edgeLat(w) {
  w = clamp(w, 0, 1); const K = EDGE_KNOTS;
  for (let i = 1; i < K.length; i++) if (w <= K[i][0]) { const [a, A] = K[i - 1], [b, B] = K[i]; return A + (B - A) * (w - a) / (b - a); }
  return K[K.length - 1][1];
}
export const poleLat = w => 70 + 5 * w * w;                 // 띠의 북쪽 끝
export const zoneWidth = w => poleLat(w) - edgeLat(w);       // 띠의 너비(도)
export const foldSpeed = w => 0.2 + 1.6 * w;                // 주름이 흔들리는 빠르기(1초에 몇 번)
export const brightness = w => 0.15 + 0.85 * w;

/** 커튼의 아래·위 끝과 높이별 색 */
export function curtain(wind, alt) {
  const base = alt - 75 * Math.max(0, wind - 0.15), top = alt + 40 + 150 * Math.max(0, wind - 0.6);
  const seg = (lo, hi) => Math.max(0, Math.min(top, hi) - Math.max(base, lo));
  const bands = { pink: seg(-1e9, N2_TOP), green: seg(N2_TOP, GREEN_TOP), red: seg(GREEN_TOP, 1e9) };
  const main = Object.keys(bands).reduce((a, b) => (bands[b] > bands[a] ? b : a));
  return { base, top, bands, main,
    pinkRim: main !== 'pink' && bands.pink >= SEEN, pinkThick: bands.pink,
    redTop: main !== 'red' && bands.red >= SEEN };
}

/** 땅 위 사람이 자기 자리에서 (북쪽으로) d 도 떨어진, 높이 h km 의 빛을 올려다보는 각(도). 음수면 지평선 아래 */
export function elevation(dDeg, h, R = R_EARTH) {
  const d = Math.abs(dDeg) * D2R;
  if (d < 1e-9) return 90;
  return Math.atan2(Math.cos(d) - R / (R + h), Math.sin(d)) / D2R;
}
/** 하늘 자리 0(북쪽 지평선) ~ 90(머리 위) ~ 180(남쪽 지평선). d > 0 = 북쪽 */
export const skyPos = (dDeg, h) => (dDeg >= 0 ? elevation(dDeg, h) : 180 - elevation(dDeg, h));

/** 호숫가에서 올려다본 하늘 */
export function sky(wind, alt) {
  const c = curtain(wind, alt), h = (c.base + c.top) / 2, edge = edgeLat(wind), width = zoneWidth(wind);
  const dS = edge - OBSERVER_LAT, dN = edge + width - OBSERVER_LAT;
  const sS = clamp(skyPos(dS, h), 0, 180), sN = clamp(skyPos(dN, h), 0, 180);
  const inside = dS <= 0 && dN >= 0;
  const level = windLevel(wind);
  return {
    edge, width, inside, south: sS, north: sN,
    reach: sS,                                   // 커튼(띠의 남쪽 끝)이 하늘 어디까지 왔나
    cover: Math.max(0, sS - sN) / 180,           // 하늘에서 오로라가 덮은 몫
    lowNorth: sS < 25, across: sS >= 25 && sS < 75, overhead: inside || sS >= 75,
    corona: inside && level === 'storm',
    fold: foldSpeed(wind), bright: brightness(wind),
  };
}

/** 위성 창에서 본 고리(남쪽 끝 위도·굵기) */
export function ring(wind, planet = 'earth') {
  if (planet === 'jupiter') {
    const edge = 73, width = 3 + 2 * wind;                    // 목성 고리는 거의 제자리(목성 자석 속 알갱이가 주로 만든다)
    return { edge, width, thickKm: Math.round(width * D2R * R_JUPITER), radiusKm: Math.round(R_JUPITER * Math.cos(edge * D2R)) };
  }
  const edge = edgeLat(wind), width = Math.min(zoneWidth(wind), 4 + 12 * wind * wind);   // 밝은 고리(그 안쪽 극까지는 옅은 빛)
  return { edge, width, glowTo: poleLat(wind), thickKm: Math.round(width * D2R * R_EARTH), radiusKm: Math.round(R_EARTH * Math.cos(edge * D2R)) };
}

/** 서울(자석 위도 29°)에서 보이나 — 띠의 남쪽 끝, 커튼 위 끝 높이를 올려다본 각 */
export function korea(wind, alt) {
  const c = curtain(wind, alt), d = edgeLat(wind) - KOREA_LAT, elev = elevation(d, c.top);
  return { elev, sees: elev >= KOREA_ELEV, dist: d };
}

export function aurora(input = {}) {
  const wind = clamp(input.wind ?? 0.4, 0, 1), alt = clamp(input.alt ?? ALT_DEFAULT, ALT_MIN, ALT_MAX);
  const cut = input.cut === 'space' ? 'space' : 'ground', magnet = input.magnet !== false, planet = input.planet === 'jupiter' ? 'jupiter' : 'earth';
  const level = windLevel(wind);
  const res = { wind, alt, cut, magnet, planet, level, visible: true };
  if (!magnet) {
    Object.assign(res, { visible: false, windAtGround: true, main: null, says: SAYS.nomagnet,
      korea: { sees: false, elev: -90 }, sky: { overhead: false, cover: 0, inside: false }, ring: null, curtain: null, pinkRim: false, redTop: false });
    return res;
  }
  if (planet === 'jupiter') {
    const rg = ring(wind, 'jupiter');
    Object.assign(res, { main: 'blue', ring: rg, bigger: rg.radiusKm / ring(wind).radiusKm, says: SAYS.jupiter + ` (고리 반지름 ${rg.radiusKm.toLocaleString('ko-KR')}km)`,
      korea: { sees: false, elev: -90 }, sky: { overhead: false, cover: 0, inside: false }, curtain: null, pinkRim: false, redTop: false });
    return res;
  }
  const c = curtain(wind, alt), s = sky(wind, alt), rg = ring(wind), k = korea(wind, alt);
  Object.assign(res, { curtain: c, main: c.main, pinkRim: c.pinkRim, redTop: c.redTop, sky: s, ring: rg, korea: k });
  const C = COLORS[c.main].adj;
  let t;
  if (cut === 'space') {
    t = SAYS.space + ` 고리 끝 위도 ${rg.edge.toFixed(0)}°, 굵기 ${rg.thickKm.toLocaleString('ko-KR')}km.` + (wind >= 0.3 ? ' ' + SAYS.spaceGrow : '');
  } else {
    t = level === 'storm' ? SAYS.storm() : SAYS[level](C);
    if (c.pinkRim) t += ' ' + SAYS.pinkRim;
    if (c.redTop) t += ' ' + SAYS.redTop;
    if (s.corona) t += ' ' + SAYS.corona;
    if (c.main === 'red') t += ' ' + SAYS.high;
    if (c.main === 'pink') t += ' ' + SAYS.low;
  }
  if (k.sees) t += ' ' + SAYS.korea;
  res.says = t;
  return res;
}

const cname = s => (s.main ? COLORS[s.main].name : '없음');
/** 의뢰 셋 — ok(상태) 맞았나, tell(상태) 아니면 무엇이 걸렸나. 상태 = aurora(…) 의 결과 */
export const MISSIONS = [
  { id: 'overhead', say: '초록 커튼을 머리 위까지', hint: '바람 레버를 올려요. 고도 다이얼은 초록이 나는 보통 높이로.', why: 0,
    ok: s => s.cut === 'ground' && s.magnet && s.planet === 'earth' && s.sky.overhead && s.main === 'green',
    tell: s => s.cut !== 'ground' ? '망원경으로 땅에서 올려다봐야 해요.'
      : !s.magnet || s.planet !== 'earth' ? '지구 자석이 켜진 지구 하늘이어야 해요.'
      : !s.sky.overhead ? '아직 북쪽 하늘에만 있어요. 바람을 더 세게.'
      : s.main !== 'green' ? `커튼이 ${cname(s)}이에요. 고도 다이얼을 보통으로.`
      : '' },
  { id: 'pinkrim', say: '분홍 테를 만들어라', hint: '바람은 세게, 고도는 조금 낮게. 손잡이 둘을 같이 써요.', why: 1,
    ok: s => s.cut === 'ground' && !!s.curtain && (s.level === 'strong' || s.level === 'storm') && s.main === 'green' && s.pinkRim && s.curtain.pinkThick >= 15 && !s.redTop,
    tell: s => s.cut !== 'ground' ? '망원경으로 땅에서 올려다봐야 해요.'
      : !s.curtain ? '지구 자석이 켜진 지구 하늘이어야 해요.'
      : s.main === 'pink' ? '온통 보라·분홍이에요. 테가 되려면 고도를 조금 올려요.'
      : s.main === 'red' ? '커튼이 빨개요. 고도를 낮춰요.'
      : s.level !== 'strong' && s.level !== 'storm' ? '바람이 아직 약해요. 분홍 테는 센 바람의 알갱이가 깊이 들어와야 생겨요. 바람을 세게.'
      : s.redTop ? '위쪽까지 빨개졌어요. 바람이 너무 세면 위가 빨개져요. 고도를 조금 낮춰 봐요.'
      : !s.pinkRim ? '아래 가장자리가 아직 초록이에요. 바람을 세게, 고도는 조금 낮게.'
      : s.curtain.pinkThick < 15 ? '분홍 테가 아직 가늘어요. 고도를 조금 더 낮춰요.'
      : '' },
  { id: 'korea', say: '우리나라에서도 보이게', hint: '바람을 폭풍까지 올려 고리를 남쪽으로. 위성 창으로 고리를 보면 알 수 있어요.', why: 0,
    ok: s => !!s.korea && s.korea.sees,
    tell: s => !s.magnet || s.planet !== 'earth' ? '지구 자석이 켜진 지구 하늘이어야 해요.'
      : s.level !== 'storm' ? `고리가 아직 멀어요(고리 끝 위도 ${s.ring.edge.toFixed(0)}°, 우리나라 ${KOREA_LAT}°). 바람을 폭풍까지.`
      : s.ring.edge - KOREA_LAT > 16 ? `폭풍이지만 고리가 아직 멀어요(고리 끝 위도 ${s.ring.edge.toFixed(0)}°). 바람을 더 끝까지.`
      : `거의 왔어요(고리 끝 위도 ${s.ring.edge.toFixed(0)}°). 바람을 끝까지, 또는 고도를 높여 높은 빨간 빛이 멀리서도 보이게.` },
];

export const WHY = [
  '태양에서 날아온 알갱이들이 지구 자석에 끌려 북쪽과 남쪽 끝으로 몰려요. 거기서 공기와 부딪쳐 빛나요.',
  '초록과 빨강은 산소가, 보라와 분홍은 질소가 내는 빛이에요.',
];
