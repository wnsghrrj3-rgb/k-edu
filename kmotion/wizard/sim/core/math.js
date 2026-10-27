// 작은 수학 도우미 (단위: 미터·초·라디안)
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, k) => a + (b - a) * k;
export const sign = v => v < 0 ? -1 : 1;
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
export const expK = (dt, tau) => 1 - Math.exp(-dt / Math.max(1e-4, tau));
// 선형 회귀 기울기 (t 초, v 값)
export function slope(ts, vs){ const n = ts.length; if (n < 2) return 0; let mt = 0, mv = 0; for (let i = 0; i < n; i++) { mt += ts[i]; mv += vs[i]; } mt /= n; mv /= n;
  let num = 0, den = 0; for (let i = 0; i < n; i++) { num += (ts[i] - mt) * (vs[i] - mv); den += (ts[i] - mt) ** 2; } return den > 1e-9 ? num / den : 0; }
// 두 선분 교차
export function segCross(a, b, c, d){ const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); }
export function median(a){ if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
