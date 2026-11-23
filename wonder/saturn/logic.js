/* 케이원더 · 토성 고리 속 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 손잡이 셋:
 *   다가가기 레버 lever 0~1 : 0 = 고리에서 100만 km, 0.8 이상 = 고리 속.
 *   조종 손잡이 — 좌우 = 겨눈 자리 aim 0~1 (0~0.14 토성, 그 밖은 고리 안쪽 끝 → 바깥 끝), 위아래 = 고리 판에서 올려다본 기울기 elev(도).
 *     고리 속에서는 좌우·위아래가 우주선을 그대로 움직인다(crossStep).
 *   집게 팔 — grab(집기) / push(세기 0~1 로 밀기).
 * look({ lever, aim, elev }) → { stage, region, key, says, distKm, thickRatio, … }
 *   stage : 'far'(띠) · 'lines'(줄무늬) · 'grains'(알갱이) · 'inside'(고리 속)
 *   region: 'saturn' · 'ring' · 'gap'(검은 틈)
 *   key   : 그 순간 「이렇게 된다」 한 줄 — far · lines · grains · inside · side · gap · saturn
 *
 * 놀이로 줄인 것:
 *   - 멀리서 보이는 「가운데 검은 틈」(카시니 틈 자리)에, 들어가 보면 작은 달이 지나가는 틈(엥케 틈의 일)을 합쳐 하나로 만들었다.
 *   - 거리에 따라 네 단계로 바뀐다(진짜로는 이어져 있다). 단계 문턱은 아래 STAGE_AT.
 *   - 고리 속 뚫고 지나가기는 얼음 덩어리 COURSE 가 정해진 길로 흐르는 2D 판(같은 시각 = 같은 자리).
 */

export const RING_IN = 1.24, RING_OUT = 2.27;        // 고리 안쪽·바깥 끝(토성 반지름의 배수)
export const GAP = [1.95, 2.03];                     // 검은 틈
export const SATURN_AIM = 0.14;                      // aim 이 이보다 작으면 토성을 겨눔
export const SATURN_KM = 60268, EARTH_KM = 12742;    // 토성 반지름 · 지구 지름
export const RING_DIAM_KM = 2 * RING_OUT * SATURN_KM;
export const RING_THICK_KM = 0.02;                   // 두께 20 m(아파트 몇 층)
export const EDGE = 1.5;                             // 이보다 덜 기울면 「옆에서 본다」
export const ELEV_MAX = 30, ELEV_FREE = 90;
export const STAGE_AT = { lines: 0.2, grains: 0.45, inside: 0.8 };
export const DENSITY = { saturn: 0.69, jupiter: 1.33, earth: 5.51 };   // 물 = 1
export const PUSH_HARD = 0.45;                       // 이보다 세게 밀면(5 m/s × 세기 > 2 m/s) 부딪쳐 부서진다
export const REJOIN_SEC = 6;

export const SAYS = {
  far:      '매끈한 띠예요. 가운데 검은 틈이 있어요.',
  lines:    '띠가 수천 줄의 가는 줄무늬로 갈라져요.',
  grains:   '줄무늬가 반짝이는 알갱이의 강이 됐어요.',
  inside:   '눈송이만 한 것부터 집채만 한 얼음 덩어리가 모두 같은 방향으로 천천히 흘러요. 서로 살짝 부딪치고 붙었다 떨어져요.',
  side:     '고리가 거의 안 보여요 — 종이 한 장처럼 얇아요.',
  gap:      '텅 비었어요. 저 멀리 작은 달 하나가 틈을 쓸고 지나가요.',
  saturn:   '고리가 토성에 드리운 줄무늬 그림자가 보여요. 북극에는 육각형 구름이 있어요.',
  grab:     '거의 순수한 얼음이에요. 창 안 표본 통에서 녹아 물이 돼요.',
  pushHard: '다른 덩어리와 부딪쳐 부서져요. 한참 뒤 조각들이 흐름에 다시 섞여요.',
  pushSoft: '살짝 밀면 옆 덩어리에 붙었다가 다시 떨어져요.',
  hit:      '쿵! 덩어리에 부딪혔어요. 선체가 긁혔어요 — 삐삐 경보!',
  crossed:  '고리를 뚫고 반대편으로 나왔어요!',
  float:    '둥둥 떠요! 토성은 물보다 가벼워요.',
  sink:     '가라앉아요. 물보다 무거워요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function rng(seed = 1) { let s = (Math.floor(Math.abs(seed)) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/** 레버 → 고리 판까지 거리(km). 고리 속이면 0 */
export const distKm = lever => (lever >= STAGE_AT.inside ? 0 : Math.pow(10, 6 - 6.25 * clamp(lever, 0, 1)));
export const stageAt = lever => (lever >= STAGE_AT.inside ? 'inside' : lever >= STAGE_AT.grains ? 'grains' : lever >= STAGE_AT.lines ? 'lines' : 'far');
/** 겨눈 자리 → 토성 반지름의 배수(토성을 겨누면 0) */
export const aimR = aim => (aim < SATURN_AIM ? 0 : RING_IN + (clamp(aim, SATURN_AIM, 1) - SATURN_AIM) / (1 - SATURN_AIM) * (RING_OUT - RING_IN));
export const rAim = r => SATURN_AIM + (r - RING_IN) / (RING_OUT - RING_IN) * (1 - SATURN_AIM);
export const GAP_AIM = [rAim(GAP[0]), rAim(GAP[1])];
export function regionAt(aim) { if (aim < SATURN_AIM) return 'saturn'; const r = aimR(aim); return r >= GAP[0] && r <= GAP[1] ? 'gap' : 'ring'; }
/** 고리가 보이는 두께 ÷ 폭(옆으로 누운 원이 납작해지는 정도 + 진짜 두께) */
export const thickRatio = elev => Math.abs(Math.sin(elev * Math.PI / 180)) + RING_THICK_KM / RING_DIAM_KM;

export function look({ lever = 0, aim = 0.45, elev = 18 } = {}) {
  const stage = stageAt(lever), region = regionAt(aim), far = stage === 'far' || stage === 'lines';
  let key;
  if (region === 'saturn') key = 'saturn';
  else if (region === 'gap' && !far) key = 'gap';
  else if (far && Math.abs(elev) <= EDGE) key = 'side';
  else key = stage;
  return { stage, region, key, says: SAYS[key], lever, aim, elev, distKm: distKm(lever), thickRatio: thickRatio(elev), ringR: aimR(aim),
    stripes: stage === 'lines' ? 3000 : stage === 'far' ? 0 : null, edge: far && Math.abs(elev) <= EDGE };
}

/** 고리 속 얼음 덩어리(정해진 판) — x: 흐르는 쪽(m), y: 고리 판에서 높이(m), r: 반지름(m), v: 흐르는 빠르기(m/s) */
export const WRAP = 80, LAYER = 9, SHIP_R = 1.2, START_Y = 14, END_Y = -14, SHIP_VX = 5, SHIP_VY = 4;
export const COURSE = (() => {
  const r = rng(7), out = [];
  for (let i = 0; i < 18; i++) {
    const big = r() < 0.25;
    out.push({ id: i, x: r() * WRAP, y: (r() * 2 - 1) * LAYER, r: big ? 2.6 + r() * 2.2 : 0.3 + r() * 1.4, v: 0.7 + r() * 0.6 });
  }
  return out;
})();
export const chunkAt = (c, t) => ({ ...c, x: (((c.x + c.v * t) % WRAP) + WRAP) % WRAP });
const wrapD = d => ((((d + WRAP / 2) % WRAP) + WRAP) % WRAP) - WRAP / 2;
/** 덩어리끼리 맞닿을 때: 느리면 붙었다 떨어지고, 빠르면 튕기고, 아주 빠르면 부서진다 */
export const contact = relSpeed => (relSpeed <= 1 ? 'stick' : relSpeed <= 2 ? 'bounce' : 'break');

export const crossStart = () => ({ t: 0, x: 12, y: START_Y, hit: false, crossed: false, entered: false, hitId: null });
/** 고리 속 한 걸음 — j = { x, y } 조종 손잡이(−1~1, 위 = +) · skip = 집거나 밀어 치운 덩어리 id */
export function crossStep(st, j = { x: 0, y: 0 }, dt = 1 / 30, skip = null) {
  if (st.hit || st.crossed) return st;
  const s = { ...st, t: st.t + dt };
  s.x = ((s.x + clamp(j.x, -1, 1) * SHIP_VX * dt) % WRAP + WRAP) % WRAP;
  s.y = clamp(s.y + clamp(j.y, -1, 1) * SHIP_VY * dt, END_Y - 1, START_Y + 4);
  if (s.y < LAYER + 5) s.entered = true;
  for (const c0 of COURSE) {
    if (skip && skip.has(c0.id)) continue;
    const c = chunkAt(c0, s.t);
    if (Math.hypot(wrapD(s.x - c.x), s.y - c.y) < c.r + SHIP_R) { s.hit = true; s.hitId = c.id; return s; }
  }
  if (s.entered && s.y <= END_Y) s.crossed = true;
  return s;
}
/** 시험·놀이용: wait 초 기다렸다가 곧장 아래로 */
export function diveAfter(wait, x0 = 12) {
  let s = { ...crossStart(), x: x0 };
  for (let t = 0; t < wait; t += 1 / 30) s = crossStep(s, { x: 0, y: 0 });
  for (let i = 0; i < 30 * 20 && !s.hit && !s.crossed; i++) s = crossStep(s, { x: 0, y: -1 });
  return s;
}

/** 집게로 집어 온 덩어리 */
export const grab = () => ({ ice: 0.99, rock: 0.01, melts: true, says: SAYS.grab });
/** 덩어리를 민다(세기 0~1) */
export function push(strength = 0.5) {
  const rel = clamp(strength, 0, 1) * 5, how = contact(rel);
  return { rel, how, breaks: how === 'break', rejoinSec: how === 'break' ? REJOIN_SEC : 0, says: how === 'break' ? SAYS.pushHard : SAYS.pushSoft };
}

/** 틈을 쓸고 지나가는 작은 달 — 창 안 좌표(0~1). 12초마다 한 번 지나간다 */
export const GAP_PERIOD = 12;
export function gapMoon(t) { const f = ((t % GAP_PERIOD) + GAP_PERIOD) % GAP_PERIOD / GAP_PERIOD; return { u: -0.1 + f * 1.2, v: 0.5, r: 0.03 }; }
export function moonHit({ tap, t }) { const m = gapMoon(t); return { hit: Math.hypot(tap[0] - m.u, tap[1] - m.v) < m.r * 2.5, moon: m }; }

/** 큰 물통에 넣어 보기(자유) */
export function floatTest(name = 'saturn') {
  const d = DENSITY[name] ?? 1, floats = d < 1;
  return { name, density: d, floats, says: (floats ? SAYS.float : SAYS.sink) + ` (물의 ${d}배 무게)` };
}

/** 의뢰 셋 */
export const MISSIONS = [
  { id: 'edge', say: '고리가 사라지는 자리를 찾아라', hint: '조종 손잡이를 위아래로 — 고리와 같은 높이에서 보면?', why: 1,
    /* s = look(…) */
    ok: s => s.region !== 'saturn' && (s.stage === 'far' || s.stage === 'lines') && Math.abs(s.elev) <= EDGE,
    tell: s => s.region === 'saturn' ? '토성 말고 고리를 봐요.'
      : (s.stage === 'grains' || s.stage === 'inside') ? '너무 가까워요. 다가가기 레버를 당겨 멀리서 봐요.'
      : `아직 고리가 보여요(기울기 ${Math.round(Math.abs(s.elev))}°). 고리 높이에 맞춰 봐요.` },
  { id: 'cross', say: '부딪치지 않고 고리를 뚫고 반대편으로', hint: '고리 속에서 조종 손잡이를 아래로. 덩어리 사이가 열릴 때 내려가요.', why: 0,
    /* s = { stage, region, hit, crossed } */
    ok: s => s.stage === 'inside' && s.region === 'ring' && s.crossed && !s.hit,
    tell: s => s.stage !== 'inside' ? '먼저 다가가기 레버를 끝까지 밀어 고리 속으로 들어가요.'
      : s.region === 'gap' ? '틈으로 지나면 쉬워요. 덩어리 사이로 뚫어 봐요.'
      : s.region === 'saturn' ? '고리를 겨누고 들어가요.'
      : s.hit ? '덩어리에 부딪혔어요! 선체가 긁혔어요. 사이가 열릴 때를 기다렸다 내려가요.'
      : '고리 아래쪽까지 내려가야 해요.' },
  { id: 'culprit', say: '틈을 만든 범인을 찾아라', hint: '검은 틈으로 가서 기다려 봐요. 틈을 따라 움직이는 것이 있어요.', why: 0,
    /* q = { key, tap:[u,v], t } */
    ok: q => q.key === 'gap' && !!q.tap && moonHit(q).hit,
    tell: q => q.key !== 'gap' ? '먼저 검은 틈으로 가요. 조종 손잡이로 틈을 겨누고 가까이 다가가요.' : '거기는 아니에요. 틈을 따라 지나가는 작은 것을 눌러요.' },
];

export const WHY = [
  '토성의 고리는 판이 아니라 수없이 많은 얼음 조각이에요. 전부 토성 둘레를 돌고 있어요.',
  '폭은 지구를 스무 개 넘게 늘어놓을 만큼 넓은데, 두께는 아파트 몇 층 높이밖에 안 돼요.',
];
