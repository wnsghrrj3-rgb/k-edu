// 최초 보정(02 5-1) ②서기 ③만세 ④좌우 한 걸음 ⑤휙 3번 — 어느 단계도 판을 막지 않는다(8초 지나면 기본값)
// ①카메라 범위는 엔진 공통(📷 범위), ⑥구슬 만지기는 문제 화면 첫 사용 때 같이 익힌다(P1)
import { INPUT } from './config.js';
import { median, slope } from '../core/math.js';
const vis = q => q && (q.v == null || q.v >= INPUT.visMin);
export const CALIB_STEPS = ['stand', 'up', 'side', 'punch'];
export class Calib {
  constructor(){ this.i = 0; this.stepT = null; this.res = { sw0: 0, cx0: 0, yS0: 0, uMax: INPUT.move.uMax, vPeak: 0, aPeak: 0 }; this.buf = []; this.okT = 0; this.flags = {}; this.peaks = []; this.hist = []; this.done = false; this.msg = 'calib.stand'; this.p = 0; this.distHint = null; }
  get step(){ return CALIB_STEPS[this.i]; }
  next(t){ this.i++; this.stepT = t; this.okT = 0; this.p = 0; this.buf = []; if (this.i >= CALIB_STEPS.length) { this.done = true; this.msg = 'calib.done'; } else this.msg = 'calib.' + this.step; }
  skip(t){ this.next(t); }
  pose(p, t, W){
    if (this.done) return; if (this.stepT == null) this.stepT = t;
    const ok = p && vis(p[11]) && vis(p[12]); const k = this.res;
    if (t - this.stepT > 8000 && this.step !== 'stand') return this.next(t);   // 8초 → 기본값
    if (!ok) { this.okT = 0; this.p = 0; this.msg = 'calib.noBody'; return; }
    const cx = (p[11].x + p[12].x) / 2, cy = (p[11].y + p[12].y) / 2, sw = Math.hypot(p[11].x - p[12].x, p[11].y - p[12].y);
    this.hist.push({ t, cx, sw, w: [p[15], p[16]], s: [p[11], p[12]] }); while (this.hist.length > 6) this.hist.shift();
    if (this.step === 'stand') {
      const ratio = sw / W; this.distHint = ratio < .10 ? 'calib.closer' : ratio > .34 ? 'calib.farther' : null;
      if (this.distHint) { this.okT = 0; this.p = 0; this.msg = this.distHint; if (t - this.stepT > 8000) { /* 거리 밖이어도 8초 뒤 진행 */ } else return; }
      this.msg = 'calib.stand'; if (!this.okT) this.okT = t; this.buf.push({ cx, cy, sw }); this.p = Math.min(1, (t - this.okT) / 1500);
      if (this.p >= 1) { k.sw0 = median(this.buf.map(b => b.sw)); k.cx0 = median(this.buf.map(b => b.cx)); k.yS0 = median(this.buf.map(b => b.cy)); k.distRatio = Math.round(k.sw0 / W * 1000) / 1000; this.next(t); }
      return;
    }
    const sw0 = k.sw0 || sw;
    if (this.step === 'up') { const top = vis(p[0]) ? p[0].y : cy - .9 * sw0; const up = vis(p[15]) && vis(p[16]) && p[15].y < top && p[16].y < top;
      if (up) { if (!this.okT) this.okT = t; this.p = Math.min(1, (t - this.okT) / 500); if (this.p >= 1) { k.hUp = Math.round((cy - Math.min(p[15].y, p[16].y)) / sw0 * 100) / 100; this.next(t); } } else { this.okT = 0; this.p = 0; } return; }
    if (this.step === 'side') { const u = (cx - k.cx0) / sw0; const h = this.hist; if (h.length >= 3) { const v = Math.abs(slope(h.slice(-3).map(q => q.t / 1000), h.slice(-3).map(q => q.cx / sw0))); k.vPeak = Math.max(k.vPeak, v); }
      if (u <= -.9) this.flags.L = Math.min(this.flags.L || 0, u); if (u >= .9) this.flags.R = Math.max(this.flags.R || 0, u);
      this.flags.maxL = Math.min(this.flags.maxL || 0, u); this.flags.maxR = Math.max(this.flags.maxR || 0, u);
      this.msg = this.flags.L ? 'calib.sideR' : 'calib.sideL'; this.p = (this.flags.L ? .5 : 0) + (this.flags.R ? .5 : 0);
      if (this.flags.L && this.flags.R) { k.uMax = Math.max(1.0, Math.min(Math.abs(this.flags.maxL), this.flags.maxR)); this.next(t); }
      else if (t - this.stepT > 7900) { const m = Math.min(Math.abs(this.flags.maxL || 0), this.flags.maxR || 0); k.uMax = Math.max(1.0, m || INPUT.move.uMax); }
      return; }
    if (this.step === 'punch') { const h = this.hist; if (h.length < 3) return; const ts = h.slice(-3).map(q => q.t / 1000);
      for (const j of [0, 1]) { const rx = h.slice(-3).map(q => (q.w[j].x - q.s[j].x) / sw0), ry = h.slice(-3).map(q => (q.w[j].y - q.s[j].y) / sw0); const s = Math.hypot(slope(ts, rx), slope(ts, ry));
        if (this.win && t - this.win.t0 <= 300) this.win.max = Math.max(this.win.max, s);
        else if (s > 3) { if (this.win) this.peaks.push(this.win.max); this.win = { t0: t, max: s }; } }
      if (this.win && t - this.win.t0 > 300) { this.peaks.push(this.win.max); this.win = null; }   // 휙 한 번 = 300ms 창 안 최고 속도
      this.p = Math.min(1, this.peaks.length / 3);
      if (this.peaks.length >= 3) { k.aPeak = Math.round(median(this.peaks) * 100) / 100; this.next(t); } }
  }
  result(){ const k = this.res; return k.sw0 ? Object.assign({}, k, { vPeak: Math.round(k.vPeak * 100) / 100, date: Date.now() }) : null; }
}
