/* 케이원더 · 화산 탐방 ① 용암 동굴 — 시간 되감기 다이얼이 정하는 것(순수 계산, document·THREE 를 부르지 않는다)
 * t = 0 지금(식은 빈 굴) … 1 처음(땅 위를 흐르는 용암 강).  높이는 「굴 안 높이」(바닥 = 0, m).
 */
export const STOPS = [0, 1 / 3, 2 / 3, 1];                    // 지금 · 조금 전 · 더 옛날 · 처음
export const STOP_NAMES = ['지금', '조금 전', '더 옛날', '처음'];
export const OUT_AT = 0.78;                                    // 이보다 옛날이면 굴이 아니라 땅 위
export const CAVE = { h1: 0.55, h2: 3.10 };                    // 벽의 가로줄 높이(블렌더 모형과 같은 값)

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function keys(t, ks) { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return va + (vb - va) * sstep(a, b, t); } return ks[ks.length - 1][1]; }

/** 다이얼 값 → 장면이 그릴 것 */
export function caveState(t, C = CAVE) {
  t = clamp(t, 0, 1);
  const lava = t < 0.08 ? -0.3 : keys(t, [[0.08, 0.02], [0.30, C.h1], [0.37, C.h1], [0.62, C.h2], [0.70, C.h2], [OUT_AT, 3.7]]);   // 멈춤 자리에서는 가로줄 높이에 딱 맞는다
  return {
    t, view: t > OUT_AT ? 'out' : 'in',
    lava,                                                       // 용암 면의 높이(없으면 음수)
    heat: sstep(0.08, 0.15, t),                                 // 용암 빛
    day: 1 - sstep(0.02, 0.07, t),                              // 뚫린 천장으로 드는 햇빛(천장은 굴이 식은 뒤에 무너졌다)
    hole: t < 0.07,                                             // 천장이 뚫려 있는가(막대·돌무더기도 「지금」의 것)
    drip: sstep(0.50, 0.62, t),                                 // 천장에서 녹은 돌이 떨어지는 정도
    grow: 1 - 0.7 * sstep(0.42, 0.74, t),                       // 돌 고드름의 길이(옛날일수록 덜 자랐다)
    eye: clamp(Math.max(2.0, lava + 1.35), 2.0, 5.0),           // 무인기 눈높이(용암이 차오르면 떠오른다)
    crust: t > OUT_AT ? 1 - 0.93 * sstep(OUT_AT, 1, t) : 1,     // 땅 위: 검은 지붕이 덮인 정도
    stage: stageOf(t),
  };
}
/** 가장 가까운 멈춤 자리(0~3). */
export function stageOf(t) { let b = 0; for (let i = 1; i < STOPS.length; i++) if (Math.abs(t - STOPS[i]) < Math.abs(t - STOPS[b])) b = i; return b; }
/** 손을 놓았을 때: 멈춤 자리 가까이면 딱 붙는다 */
export function snap(t, near = 0.055) { for (const s of STOPS) if (Math.abs(t - s) <= near) return s; return clamp(t, 0, 1); }

/** 화면 글(3~4학년이 읽는 말) */
export function says(t, lampOn = true) {
  const s = caveState(t);
  if (s.view === 'out') return s.crust > 0.6
    ? ['검은 지붕이 용암 강을 거의 다 덮었어요', '지붕 아래로 용암은 계속 흘러요. 여기가 굴이 돼요']
    : ['처음에는 굴이 아니었어요', '땅 위를 흐르는 용암 강이에요. 겉이 식으면서 검은 지붕이 덮여 가요'];
  if (s.lava < 0) return lampOn
    ? ['용암 동굴 안이에요', '옛날에 용암이 흐르던 길이에요. 다이얼을 돌려 시간을 되감아 보세요']
    : ['등불을 껐어요', '굴 안에는 빛이 하나도 없어요. 멀리 천장이 뚫린 곳만 밝아요'];
  if (s.lava < CAVE.h1 - 0.03) return ['굴 바닥에 붉은 용암이 흘러요', '시간을 더 되감으면 용암이 차올라요'];
  if (s.lava <= CAVE.h1 + 0.03) return ['용암이 무릎 높이로 흐르고 있어요', '벽의 가로줄을 보세요. 용암이 차 있던 높이예요'];
  if (s.lava < CAVE.h2 - 0.03) return ['용암이 점점 차올라요', '벽 위쪽의 가로줄까지 올라가요'];
  if (s.lava <= CAVE.h2 + 0.03) return ['용암이 굴을 반쯤 채웠어요', '천장의 돌이 녹아 똑똑 떨어져요. 굳으면 돌 고드름이 돼요'];
  return ['용암이 굴을 거의 다 채웠어요', '조금만 더 되감으면 굴 밖이에요'];
}
export const WHY = ['용암의 겉은 공기에 닿아 먼저 굳어요.', '속은 계속 흘러 빠져나가요.', '그래서 빈 굴이 남아요.'];
export const WHERE = '제주 만장굴이 이렇게 생긴 용암 동굴이에요.';
