// 규칙 찾기 · 보기 풍선 자리(순수 함수) — 몸 기준: 어깨 가운데(cx, cy)·어깨 폭(sw), zone = 그 사람이 쓰는 화면 칸 {x0, x1, y0, y1}(캔버스 px)
//  arc   : 멀리 선 경우. 왼쪽 위 · (머리 위) · 오른쪽 위 — 팔을 뻗으면 닿는 거리
//  stack : 가까이 앉아 머리 위 자리가 화면에 안 들어오는 경우. 얼굴 양옆에 세움(왼쪽 하나 · 오른쪽 위아래)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const radius = sw => clamp(sw * .5, 30, 70);
export function layoutKind(n, cy, sw, zone){ return n < 3 || cy - 1.8 * sw - radius(sw) >= zone.y0 ? 'arc' : 'stack'; }
export function spotsFor(kind, n, cx, cy, sw, zone){
  const r = radius(sw), X = x => clamp(x, zone.x0 + r + 4, zone.x1 - r - 4), Y = y => clamp(y, zone.y0 + r, zone.y1 - r);
  if (kind === 'arc') { const L = { x: X(cx - 1.35 * sw), y: Y(cy - .75 * sw), r }, R = { x: X(cx + 1.35 * sw), y: Y(cy - .75 * sw), r };
    return n < 3 ? [L, R] : [L, { x: X(cx), y: Y(cy - 1.8 * sw), r }, R]; }
  const yU = Math.max(zone.y0 + r, cy - 1.2 * sw), yL = yU + 2 * r + 14, xL = X(cx - 1.3 * sw), xR = X(cx + 1.3 * sw);
  return [{ x: xL, y: Y((yU + yL) / 2), r }, { x: xR, y: Y(yU), r }, { x: xR, y: Y(yL), r }];
}
