/* 케이파크 · 마블런 — sim.js
 * MarbleSim: 고정 틱(120Hz) 결정론 물리 엔진. RAIL 상태 (M0).
 * 순수 로직 — DOM/Three.js 의존 제로.
 *
 * 힘 모델 (부호 있는 궤도 속도 v, 호길이 s):
 *   중력 성분:  a_g = -g · (dh/ds)
 *   마찰(감속): f  = μ_r·g·cosθ + (c_d + k_c·κ)·v²  [+ 그릇 감쇠 b·|v|]
 *   틱 적분:    v += a_g·dt;  |v| ≤ f·dt 이면 v = 0 (정지 마찰), 아니면 v -= sign(v)·f·dt
 *   → 언덕을 못 넘으면 자연스럽게 역행 (v 부호 반전)
 *
 * 이벤트: 'release' | 'bell' | 'goal' | 'reverse' | 'rest' | 'end'
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const PHYS = {
    g: 9.81,
    mu_r: 0.010,   // 구름마찰 계수
    c_d: 0.020,    // 속도² 저항 (1/m)
    k_c: 0.004,    // 곡률 페널티 (무차원·m)
    bowlDamp: 7.0, // 골 그릇 선형 감쇠 (1/s)
    boost: 3.0,    // 부스터 추진력 (단위질량, m/s²)
    dt: 1 / 120,   // 고정 틱
  };

  // 웨이포인트 → 세그먼트 데이터 (길이·기울기·cosθ·곡률·누적 s)
  function buildPathData(points, bowlIndexRanges, opts) {
    const n = points.length;
    if (n < 2) throw new Error('경로 웨이포인트 부족');
    const segs = [];
    const cum = [0];
    for (let i = 0; i < n - 1; i++) {
      const a = points[i], b = points[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      const len = Math.hypot(dx, dy, dz);
      const horiz = Math.hypot(dx, dz);
      segs.push({
        len,
        slope: len > 0 ? dy / len : 0,      // dh/ds
        cos: len > 0 ? horiz / len : 1,      // cosθ
        kappa: 0,
        dir: { x: dx / (len || 1), y: dy / (len || 1), z: dz / (len || 1) },
      });
      cum.push(cum[i] + len);
    }
    // 곡률: 인접 세그먼트 방향 사이 각 / 평균 길이 → 양쪽 세그먼트에 절반씩
    for (let i = 0; i < segs.length - 1; i++) {
      const d0 = segs[i].dir, d1 = segs[i + 1].dir;
      const dot = Math.max(-1, Math.min(1, d0.x * d1.x + d0.y * d1.y + d0.z * d1.z));
      const ang = Math.acos(dot);
      const k = ang / ((segs[i].len + segs[i + 1].len) / 2 || 1);
      segs[i].kappa += k / 2;
      segs[i + 1].kappa += k / 2;
    }
    const total = cum[cum.length - 1];
    const toS = (rs) => (rs || []).map(r => ({ s0: cum[r.i0], s1: cum[Math.min(r.i1, n - 1)] }));
    const bowlRanges = toS(bowlIndexRanges);
    const airRanges = toS(opts && opts.airIndexRanges);
    const boostRanges = toS(opts && opts.boostIndexRanges);
    return { points, segs, cum, total, bowlRanges, airRanges, boostRanges };
  }

  function segIndexAt(pd, s) {
    // 이진 탐색
    let lo = 0, hi = pd.segs.length - 1;
    if (s <= 0) return 0;
    if (s >= pd.total) return pd.segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (pd.cum[mid + 1] < s) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function posAt(pd, s) {
    const i = segIndexAt(pd, s);
    const a = pd.points[i], b = pd.points[i + 1];
    const t = pd.segs[i].len > 0 ? (Math.min(Math.max(s, 0), pd.total) - pd.cum[i]) / pd.segs[i].len : 0;
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  }

  function tangentAt(pd, s) {
    return pd.segs[segIndexAt(pd, s)].dir;
  }

  function inRange(ranges, s) {
    for (const r of ranges) if (s >= r.s0 && s <= r.s1) return true;
    return false;
  }
  function inBowl(pd, s) { return inRange(pd.bowlRanges, s); }
  function inAir(pd, s) { return inRange(pd.airRanges || [], s); }
  function inBoost(pd, s) { return inRange(pd.boostRanges || [], s); }

  class Sim {
    constructor(pathData, phys) {
      this.pd = pathData;
      this.P = Object.assign({}, PHYS, phys || {});
      this.reset();
    }
    reset() {
      this.s = 0;
      this.v = 0;
      this.status = 'ready'; // ready | rolling | goal | rest
      this.tick = 0;
      this._belled = false;
      this._restTicks = 0;
      this._lastDir = 0;
    }
    release(v0) {
      this.reset();
      this.v = v0 || 0;
      this.status = 'rolling';
      return [{ type: 'release' }];
    }
    energy() {
      // 단위질량 역학적 에너지 (진단·테스트용)
      return 0.5 * this.v * this.v + this.P.g * posAt(this.pd, this.s).y;
    }
    pos() { return posAt(this.pd, this.s); }
    tangent() { return tangentAt(this.pd, this.s); }

    step() {
      // 에너지 스테핑: E' = E − 손실·|Δs|,  v' = ±√(max(0, 2(E' − g·h(s'))))
      // → 구조적으로 에너지 비증가 보장 (설계서 §2-1)
      const ev = [];
      if (this.status !== 'rolling') return ev;
      const P = this.P, pd = this.pd, dt = P.dt;
      const seg = pd.segs[segIndexAt(pd, this.s)];
      const bowl = inBowl(pd, this.s);

      const vPrev = this.v;
      const yOld = posAt(pd, this.s).y;

      // 예측 속도 (방향·이동량 결정용 오일러 프리딕터)
      let vE = this.v + (-P.g * seg.slope) * dt;

      // 정지 마찰: 멈춰 있고 경사가 마찰 한계 이내면 그대로 정지
      if (this.v === 0 && Math.abs(seg.slope) <= P.mu_r * seg.cos + 1e-12) {
        vE = 0;
      }

      const ds = vE * dt;
      const sNew = Math.min(Math.max(this.s + ds, 0), pd.total);
      const dsActual = sNew - this.s;
      const yNew = posAt(pd, sNew).y;

      // 손실 일 (실제 이동 거리 기준)
      // air: 공중 — 구름마찰·저항 없음 / boost: 추진 — 음의 마찰 (에너지 주입)
      const air = inAir(pd, this.s);
      let fMag = air ? 0 : P.mu_r * P.g * seg.cos + (P.c_d + P.k_c * seg.kappa) * vE * vE;
      if (bowl) fMag += P.bowlDamp * Math.abs(vE);
      if (inBoost(pd, this.s)) fMag -= P.boost;
      const lossWork = fMag * Math.abs(dsActual);

      // 에너지 보존 보정
      const E = 0.5 * this.v * this.v + P.g * yOld;
      const v2 = 2 * (E - lossWork - P.g * yNew);
      this.v = v2 > 0 ? Math.sign(vE || 1) * Math.sqrt(v2) : 0;
      this.s = sNew;

      // 역행 감지: 마지막 진행 방향 기준 (v=0 경유 반전 포함)
      const dir = this.v > 1e-6 ? 1 : this.v < -1e-6 ? -1 : 0;
      if (this._lastDir === 1 && dir === -1) ev.push({ type: 'reverse', s: this.s });
      if (dir !== 0) this._lastDir = dir;

      // 경계 처리
      if (this.s <= 0) { this.s = 0; if (this.v < 0) this.v = 0; }
      if (this.s >= pd.total) {
        this.s = pd.total; this.v = 0;
        if (inBowl(pd, this.s)) { if (!this._belled) { ev.push({ type: 'bell' }); this._belled = true; } ev.push({ type: 'goal' }); this.status = 'goal'; }
        else { ev.push({ type: 'end' }); this.status = 'rest'; }
        this.tick++;
        return ev;
      }

      // 벨: 그릇 첫 진입
      if (!this._belled && bowl && Math.abs(this.v) > 0.01) {
        this._belled = true;
        ev.push({ type: 'bell' });
      }

      // 정착 판정
      if (this.v === 0 && Math.abs(seg.slope) <= this.P.mu_r * seg.cos + 1e-9) {
        this._restTicks++;
        if (bowl && this._restTicks >= 12) { ev.push({ type: 'goal' }); this.status = 'goal'; }
        else if (!bowl && this._restTicks >= 120) { ev.push({ type: 'rest' }); this.status = 'rest'; }
      } else if (bowl && Math.abs(this.v) < 0.02) {
        this._restTicks++;
        if (this._restTicks >= 24) { this.v = 0; ev.push({ type: 'goal' }); this.status = 'goal'; }
      } else {
        this._restTicks = 0;
      }

      this.tick++;
      return ev;
    }

    // 완료까지 실행 (테스트용). maxSec 내 미완료 시 상태 반환.
    runToEnd(maxSec) {
      const maxTicks = Math.round((maxSec || 30) / this.P.dt);
      const all = [];
      while (this.status === 'rolling' && this.tick < maxTicks) {
        all.push(...this.step());
      }
      return all;
    }
  }

  return { PHYS, Sim, buildPathData, posAt, tangentAt, segIndexAt };
});
