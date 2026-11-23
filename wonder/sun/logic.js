/* 케이원더 · 태양 가까이 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 단위: 태양 위 자리는 「태양 반지름 = 1」, 태양 가운데 = (0,0), y 는 위쪽이 +.
 * describe({ filter, dist, earth, line, watch, light }) → { cut, glare, shows, on, flare, says, … }
 *   filter : 'none'(색유리 없음) | 'visible'(보통 빛) | 'red'(붉은 빛) | 'uv'(자외선)  — 색유리 다이얼
 *   dist   : 0(멀리) ~ 1(아주 가까이) — 거리 레버. 컷 셋: 멀리 / 가장자리(태양 전체) / 표면 위
 *   earth  : {x,y} 지구를 놓은 자리(지금 컷의 태양 단위) 또는 null
 *   line   : lineUp(…) 의 결과(지구 줄) 또는 null
 *   watch  : 자외선으로 꼬인 빛의 다리를 지켜본 시간(초)
 *   light  : 빛 한 줄기를 쏜 뒤 흐른 「진짜」 시간(초) 또는 null
 *
 * 놀이로 줄인 것:
 *   - 크기는 실제 값 그대로: 태양 지름 1,392,700km, 지구 지름 12,742km(→ 109개), 불기둥 100,000km, 큰 흑점 30,000km.
 *   - 태양까지 거리는 어림수 1억 5천만 km → 빛으로 500초 = 8분 20초.
 *   - 꼬인 빛의 다리는 지켜본 지 6초 만에 끊어진다(진짜는 몇 시간~며칠). 폭발은 2.5초, 그 뒤 3.5초 쉬고 다시 꼬인다.
 *   - 흑점 자리·크기·불기둥 자리는 판마다 같은 고정 배치.
 */

export const SUN_DIAM = 1392700, EARTH_DIAM = 12742, SUN_EARTH = 150000000, LIGHT = 299792.458;
export const EARTHS_ACROSS = SUN_DIAM / EARTH_DIAM;                 // 109.3
export const EARTH_R = 1 / EARTHS_ACROSS;                           // 지구 반지름(태양 반지름 단위)
export const km2r = km => km / (SUN_DIAM / 2);
export const SURFACE_TEMP = 5500, SPOT_TEMP = 4000;
export const FILTERS = {
  none:    { name: '색유리 없음' },
  visible: { name: '보통 빛' },
  red:     { name: '붉은 빛' },
  uv:      { name: '자외선' },
};
export const FILTER_ORDER = ['none', 'visible', 'red', 'uv'];
export const CUTS = { far: '멀리', limb: '가장자리', surface: '표면 위' };
export const cutOf = d => (d < 1 / 3 ? 'far' : d < 2 / 3 ? 'limb' : 'surface');
// 고정 배치(태양 반지름 단위)
export const SPOTS = [                                                 // 흑점은 무리 지어 생긴다
  { id: 'a', x: -0.16, y: 0.12, km: 9000 },
  { id: 'b', x: 0.1, y: -0.06, km: 30000 },
  { id: 'c', x: 0.18, y: 0.16, km: 6000 },
  { id: 'd', x: -0.08, y: -0.17, km: 11000 },
];
export const PROMS = [{ id: 'p', angle: 2.4, km: 100000 }];          // 왼쪽 위 가장자리(라디안, x 축에서 시계 반대)
export const LOOPS = [
  { id: 'l1', x: 0.1, y: -0.06, span: 0.1, twisted: true },            // 큰 흑점 위의 꼬인 다리
  { id: 'l2', x: -0.16, y: 0.12, span: 0.07 },
  { id: 'l3', x: 0.5, y: -0.4, span: 0.1 },
  { id: 'l4', x: -0.35, y: 0.55, span: 0.09 },
];
// 표면 위 컷: 가운데·반너비(태양 반지름 단위) — 흑점 무리를 가까이
export const SURFACE_VIEW = { cx: 0.01, cy: 0, half: 0.26 };
export const FLARE = { build: 6, burst: 2.5, rest: 3.5 };

export const SAYS = {
  none:    '화면이 하얗게 날아가요. 눈부셔서 아무것도 안 보여요 — 가리개(색유리)가 필요해요.',
  visible: '노란 공에 검은 점들(흑점)이 보여요.',
  red:     '표면의 쌀알 무늬가 꿈틀거리고, 가장자리에 붉은 불기둥이 솟아요.',
  uv:      '표면에서 고리 모양으로 솟았다가 되돌아오는 빛의 다리들이 보여요.',
  far:     '멀리서 보면 지구는 태양 옆의 작은 점이에요.',
  spotNear: `흑점에 다가가요. 주변보다 어두울 뿐, 여전히 눈부시게 뜨거워요(온도계: 주변 ${SURFACE_TEMP.toLocaleString('ko-KR')}도, 흑점 ${SPOT_TEMP.toLocaleString('ko-KR')}도쯤).`,
  prom:    n => `불기둥 하나가 지구 ${n}개 높이예요.`,
  spotFit: (km, n) => `흑점 하나에 지구가 쏙 들어가요(흑점 지름 ${km.toLocaleString('ko-KR')}km = 지구 ${n}개).`,
  spotSmall: km => `이 흑점은 지구보다 작아요(흑점 지름 ${km.toLocaleString('ko-KR')}km).`,
  line109: `태양 지름에 지구가 ${Math.floor(EARTHS_ACROSS)}개 늘어서요.`,
  lineSome: n => `지구 ${n}개를 늘어놓았어요.`,
  twisted: p => `꼬인 빛의 다리가 점점 더 꼬여요(${p}%).`,
  flare:   '꼬인 빛의 다리가 툭 끊어지며 폭발했어요(플레어)! 알갱이 구름이 날아가요 — 지구에 닿으면 오로라가 생겨요.',
  after:   '알갱이 구름이 우주로 날아가요. 다리는 다시 꼬이기 시작해요.',
  lightGo: s => `빛 한 줄기가 지구로 가는 중… ${clockText(s)}`,
  lightAt: s => `빛 한 줄기가 지구까지 가는 시간: ${clockText(s)}.`,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lightSeconds = () => SUN_EARTH / LIGHT;                 // 500.3초
export function clockText(sec) { const s = Math.round(sec), m = Math.floor(s / 60); return m ? `${m}분 ${s - m * 60}초` : `${s}초`; }

/** 꼬인 다리를 지켜본 시간 → 꼬임·폭발 */
export function flareAt(watch) {
  const P = FLARE.build + FLARE.burst + FLARE.rest, t = ((watch % P) + P) % P;
  if (t < FLARE.build) return { phase: 'build', twist: t / FLARE.build };
  if (t < FLARE.build + FLARE.burst) return { phase: 'flare', twist: 1, cloud: (t - FLARE.build) / FLARE.burst, toEarth: true };
  return { phase: 'after', twist: (t - FLARE.build - FLARE.burst) / FLARE.rest * 0.2, cloud: 1 };
}

/** 지구를 놓은 자리 → 무엇 옆인가 */
export function placeEarth(p, cut) {
  if (!p || cut === 'far') return { kind: 'none' };
  for (const s of SPOTS) {
    if (Math.hypot(p.x - s.x, p.y - s.y) < Math.max(km2r(s.km) / 2, EARTH_R) * 1.1) {
      const n = s.km / EARTH_DIAM;
      return { kind: 'spot', id: s.id, km: s.km, fits: s.km >= EARTH_DIAM, earths: Math.round(n * 10) / 10 };
    }
  }
  if (cut === 'limb') {
    for (const pr of PROMS) {
      const h = km2r(pr.km), ux = Math.cos(pr.angle), uy = Math.sin(pr.angle);
      const along = p.x * ux + p.y * uy, side = Math.abs(-p.x * uy + p.y * ux);   // 불기둥 축을 따라·옆으로
      if (along > 0.97 && along < 1 + h + 0.06 && side < 0.12) return { kind: 'prom', id: pr.id, km: pr.km, earths: Math.round(pr.km / EARTH_DIAM) };
    }
  }
  return { kind: Math.hypot(p.x, p.y) <= 1 ? 'disk' : 'space' };
}

/** 지구 줄: p0→p1 로 끌어 지구를 한 줄로 찍는다(태양 원 안쪽만) */
export function lineUp(p0, p1) {
  const dx = p1.x - p0.x, dy = p1.y - p0.y, L = Math.hypot(dx, dy);
  if (L < 1e-9) return { count: 0, spans: false, through: false, diameter: false, len: 0 };
  const ux = dx / L, uy = dy / L, b = p0.x * ux + p0.y * uy, c = p0.x * p0.x + p0.y * p0.y - 1, disc = b * b - c;
  const off = Math.abs(p0.x * uy - p0.y * ux);                                    // 가운데에서 선까지 거리
  if (disc <= 0) return { count: 0, spans: false, through: false, diameter: false, len: 0, off };
  const t0 = -b - Math.sqrt(disc), t1 = -b + Math.sqrt(disc);                     // 원과 만나는 두 점(선 위의 거리)
  const a = clamp(t0, 0, L), z = clamp(t1, 0, L), len = Math.max(0, z - a), chord = t1 - t0, tol = 0.06;
  const spans = a <= t0 + tol && z >= t1 - tol, through = off < 0.1, diameter = spans && through;
  const count = diameter ? Math.floor(EARTHS_ACROSS) : Math.floor(len / (2 * EARTH_R));
  return { count, spans, through, diameter, len, chord, off,
    from: { x: p0.x + ux * a, y: p0.y + uy * a }, to: { x: p0.x + ux * z, y: p0.y + uy * z } };
}

/** 지금 손잡이 자리에서 무엇이 보이고 무슨 말을 하나 */
export function describe(st = {}) {
  const filter = FILTERS[st.filter] ? st.filter : 'visible', dist = clamp(st.dist ?? 0.5, 0, 1), cut = cutOf(dist);
  const glare = filter === 'none';
  const shows = {
    spots: !glare && (filter === 'visible' || filter === 'red'),
    granules: !glare && filter === 'red',
    proms: !glare && filter === 'red' && cut !== 'surface',
    loops: !glare && filter === 'uv' && cut !== 'far',
  };
  const on = placeEarth(st.earth, cut);
  const flare = shows.loops ? flareAt(st.watch || 0) : null;
  const parts = [];
  if (cut === 'far') parts.push(SAYS.far);
  parts.push(SAYS[filter]);
  if (cut === 'surface' && !glare) parts.push(SAYS.spotNear);
  if (!glare) {
    if (on.kind === 'prom' && shows.proms) parts.push(SAYS.prom(on.earths));
    else if (on.kind === 'prom') parts.push('불기둥은 붉은 빛 색유리로 보여요.');
    if (on.kind === 'spot' && shows.spots) parts.push(on.fits ? SAYS.spotFit(on.km, on.earths) : SAYS.spotSmall(on.km));
    if (st.line && cut !== 'far') parts.push(st.line.diameter ? SAYS.line109 : SAYS.lineSome(st.line.count) + (st.line.spans ? ' 가운데를 지나야 지름이에요.' : ' 끝에서 끝까지 늘어놓아요.'));
    if (flare) parts.push(flare.phase === 'build' ? SAYS.twisted(Math.round(flare.twist * 100)) : flare.phase === 'flare' ? SAYS.flare : SAYS.after);
  }
  if (st.light != null) { const T = lightSeconds(), s = Math.min(T, st.light); parts.push(s >= T ? SAYS.lightAt(T) : SAYS.lightGo(s)); }
  return { filter, dist, cut, glare, shows, on, flare, line: st.line || null,
    temps: cut === 'surface' && !glare ? { surface: SURFACE_TEMP, spot: SPOT_TEMP } : null,
    says: parts.join(' ') };
}

/** 의뢰 셋 — ok(상태) 맞았나, tell(상태) 아니면 무엇이 걸렸나. 상태 = describe(…) 의 결과(의뢰 2 는 「찍은 순간」의 것) */
export const MISSIONS = [
  { id: 'spot', say: '지구가 들어가는 흑점을 찾아라', hint: '보통 빛으로 다가가서, 지구를 흑점 위에 끌어다 놓아요.', why: 1,
    ok: s => s.shows.spots && s.on.kind === 'spot' && s.on.fits,
    tell: s => s.glare ? '눈부셔서 안 보여요. 색유리를 끼워요.'
      : !s.shows.spots ? '흑점은 보통 빛이나 붉은 빛으로 보여요.'
      : s.cut === 'far' ? '너무 멀어요. 거리 레버로 다가가요.'
      : s.on.kind !== 'spot' ? '검은 점(흑점) 바로 위에 지구를 놓아요.'
      : `이 흑점은 지구보다 작아요(지름 ${s.on.km.toLocaleString('ko-KR')}km). 더 큰 흑점을 찾아요.` },
  { id: 'flare', say: '폭발의 순간을 찍어라', hint: '자외선으로 꼬인 빛의 다리를 찾아 기다렸다가, 터지는 순간 찍어요.', why: 0,
    ok: s => s.shows.loops && !!s.flare && s.flare.phase === 'flare',
    tell: s => s.glare ? '눈부셔서 안 보여요. 색유리를 끼워요.'
      : s.filter !== 'uv' ? '빛의 다리는 자외선 색유리로 보여요.'
      : s.cut === 'far' ? '너무 멀어요. 다가가야 빛의 다리가 보여요.'
      : s.flare.phase === 'build' ? `아직 안 터졌어요(꼬임 ${Math.round(s.flare.twist * 100)}%). 조금 더 기다려요.`
      : '이미 지나갔어요. 다시 꼬일 때까지 기다려요.' },
  { id: 'count', say: '태양에 지구가 몇 개 늘어서는지 세어라', hint: '「지구 줄」을 골라 태양을 가장자리에서 가장자리까지, 가운데를 지나게 끌어요.', why: 0,
    ok: s => s.cut !== 'far' && !!s.line && s.line.diameter && s.line.count === Math.floor(EARTHS_ACROSS),
    tell: s => s.cut === 'far' ? '너무 멀어요. 거리 레버로 다가가요.'
      : s.cut === 'surface' ? '너무 가까워요. 거리 레버를 가장자리로 — 태양 전체가 보여야 지름을 잴 수 있어요.'
      : !s.line ? '「지구 줄」을 골라 태양 위로 끌어요.'
      : !s.line.spans ? `지구 ${s.line.count}개 — 끝에서 끝까지 늘어놓아요.`
      : `지구 ${s.line.count}개 — 가운데를 지나야 지름이에요.` },
];

export const WHY = [
  '태양은 불타는 게 아니라 속에서 작은 알갱이들이 합쳐지며 빛을 내요. 땅이 없고 전부 뜨거운 기체예요.',
  '흑점은 식은 게 아니라 둘레보다 덜 뜨거워서 어둡게 보일 뿐이에요.',
];
