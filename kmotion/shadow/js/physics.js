/* 그림자 괴물 · 물리 층(순수 함수 — 화면·엔진과 무관)
 * 모델: 카메라 = 점광원. 핀홀 카메라가 곧 그림자 기하라서, 카메라 영상 속 사람 마스크를
 *       화면 중심 기준으로 상수배 하면 그대로 벽에 비친 그림자가 된다(광원에 가까울수록 커짐).
 *   영상 속 키 h(화면 높이 비율)  ∝ 1/d  (d = 광원~사람 거리)
 *   그림자 키 S = Hb · L / d          (Hb = 사람 키, L = 광원~벽 거리)
 *   화면 배율 s = 벽 거리 손잡이(1.0~2.2) → L = L0 · s
 */
export const DEF = { d0: 200, Hb: 130, L0: 222, s: 1.35 };   // d0: 보정 자리까지 거리(cm), Hb: 사람 키(cm), L0: s=1 일 때 벽 거리(cm)

/** 마스크 알파(0~255, w×h)에서 상자·면적. thr 초과 픽셀만 사람으로 본다 */
export function maskStats(a, w, h, thr = 128){
  let minx = w, miny = h, maxx = -1, maxy = -1, area = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > thr) { area++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  if (maxx < 0) return null;
  return { x0: minx, y0: miny, x1: maxx + 1, y1: maxy + 1, w: maxx - minx + 1, h: maxy - miny + 1, area, cx: (minx + maxx + 1) / 2, cy: (miny + maxy + 1) / 2, fill: area / ((maxx - minx + 1) * (maxy - miny + 1)) };
}

/** 영상 속 키 비율 hFrac(0~1) → 광원까지 거리 d(cm). h0 = 보정 때 키 비율 */
export function distanceFrom(hFrac, h0, d0 = DEF.d0){ if (!hFrac || !h0) return null; return Math.max(30, Math.min(900, d0 * h0 / hFrac)); }
/** 벽 거리 L(cm) */
export const wallDistance = (s, L0 = DEF.L0) => L0 * s;
/** 그림자 키(cm) */
export const shadowHeight = (Hb, L, d) => (d ? Hb * L / d : null);
/** 배율 L/d */
export const magnification = (L, d) => (d ? L / d : null);

/** 두 이진 마스크(Uint8Array, 같은 크기)의 IoU */
export function iou(a, b){ let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k], y = b[k]; if (x && y) i++; if (x || y) u++; } return u ? i / u : 0; }
/** 알파 ImageData → 이진 배열 */
export function binarize(data, thr = 128){ const n = data.length / 4, out = new Uint8Array(n); for (let k = 0, j = 3; k < n; k++, j += 4) out[k] = data[j] > thr ? 1 : 0; return out; }

/** 중심 투영: 화면 중심(cx,cy) 기준으로 점 p 를 s 배 */
export const project = (p, cx, cy, s) => ({ x: cx + (p.x - cx) * s, y: cy + (p.y - cy) * s });
