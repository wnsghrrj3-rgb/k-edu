// I7 고르기 — 손 커서가 대상 원 안에 머무르면 선택(02 4-7). 대상 위치·크기는 data/layout/targets.json(시스템 소유)
// cursor {x,y} 화면 비율 0~1 · targets [{id, slot, rect:{x,y,w,h}, enabled}] · aspect = 화면 가로/세로
import { INPUT } from './config.js';
export class Selector {
  constructor(push){ this.push = push; this.cur = null; this.since = 0; this.lockUntil = 0; this.lostT = 0; this.hover = {}; this.holdMs = INPUT.select.hold; }
  reset(){ this.cur = null; this.since = 0; this.hover = {}; }
  // 커서 정규화: 손바닥 중심 픽셀 → 범위 상자 가장자리를 잘라 펴기(수학 배틀 방식)
  static norm(px, py, W, H){ const [x0, x1] = INPUT.select.stretchX, [y0, y1] = INPUT.select.stretchY;
    const c = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a))); return { x: c(px / W, x0, x1), y: c(py / H, y0, y1) }; }
  update(cursor, targets, t, aspect = 16 / 9){
    if (!cursor) { if (!this.lostT) this.lostT = t; this.cur = null; this.since = 0; this.hover = {};
      if (t - this.lostT > INPUT.select.lost && !this.lostSaid) { this.lostSaid = true; this.push({ type: 'HAND_LOST', t, via: 'hand', value: {}, conf: 0 }); } return; }
    this.lostT = 0; this.lostSaid = false;
    let best = null, bd = Infinity;
    for (const g of targets) { if (g.enabled === false) continue; const cx = g.rect.x + g.rect.w / 2, cy = g.rect.y + g.rect.h / 2, r = g.rect.w / 2 * INPUT.select.radiusMul;
      const d = Math.hypot(cursor.x - cx, (cursor.y - cy) / aspect); if (d <= r && d < bd) { bd = d; best = g; } }
    const id = best ? best.id : null; if (id !== this.cur) { this.cur = id; this.since = t; }
    this.hover = {}; if (!best || t < this.lockUntil) return;
    const p = Math.min(1, (t - this.since) / this.holdMs); this.hover[id] = p;
    if (p >= 1) { this.lockUntil = t + INPUT.select.lock; this.cur = null; this.hover = {}; this.push({ type: 'SELECT', t, via: 'hand', value: { slot: best.slot, id }, conf: 1 }); }
  }
}
// 마우스·터치 클릭 → 대상 맞추기(같은 SELECT)
export function hitTarget(targets, x, y, aspect = 16 / 9){ for (const g of targets) { if (g.enabled === false) continue; const cx = g.rect.x + g.rect.w / 2, cy = g.rect.y + g.rect.h / 2;
  if (Math.hypot(x - cx, (y - cy) / aspect) <= g.rect.w / 2 * INPUT.select.radiusMul) return g; } return null; }
