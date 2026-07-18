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
    floorY: 0.012, // 이탈 낙하 착지 높이 (구슬 반지름)
    catchKeep: 0.85, // 착지대 깔때기 포획 시 수평속도 유지율
    wallKeep: 0.45,  // 백보드(뒷벽) 맞고 떨어진 경우 유지율
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
    // + 곡률 중심 방향(cdir): 접선 변화 방향 (구심 방향)
    for (let i = 0; i < segs.length - 1; i++) {
      const d0 = segs[i].dir, d1 = segs[i + 1].dir;
      const dot = Math.max(-1, Math.min(1, d0.x * d1.x + d0.y * d1.y + d0.z * d1.z));
      const ang = Math.acos(dot);
      const k = ang / ((segs[i].len + segs[i + 1].len) / 2 || 1);
      segs[i].kappa += k / 2;
      segs[i + 1].kappa += k / 2;
      let cx = d1.x - d0.x, cy = d1.y - d0.y, cz = d1.z - d0.z;
      const cl = Math.hypot(cx, cy, cz);
      if (cl > 1e-9) {
        const cd = { x: cx / cl, y: cy / cl, z: cz / cl };
        segs[i].cdir = segs[i].cdir || cd;
        segs[i + 1].cdir = cd;
      }
    }
    // 지지 법선(supp): 레일이 구슬을 미는 방향. +y에서 출발, 접선에 수직 유지하며 평행이동
    // → 루프에서는 한 바퀴 돌며 뒤집힘 (꼭대기에서 supp = -y)
    let sx = 0, sy = 1, sz = 0;
    for (let i = 0; i < segs.length; i++) {
      const d = segs[i].dir;
      const dp = sx * d.x + sy * d.y + sz * d.z;
      sx -= dp * d.x; sy -= dp * d.y; sz -= dp * d.z;
      const sl = Math.hypot(sx, sy, sz);
      if (sl > 1e-6) { sx /= sl; sy /= sl; sz /= sl; }
      else { sx = 0; sy = 1; sz = 0; }
      segs[i].supp = { x: sx, y: sy, z: sz };
    }
    const total = cum[cum.length - 1];
    const toS = (rs) => (rs || []).map(r => ({ s0: cum[r.i0], s1: cum[Math.min(r.i1, n - 1)] }));
    const bowlRanges = toS(bowlIndexRanges);
    const airRanges = toS(opts && opts.airIndexRanges);
    const boostRanges = toS(opts && opts.boostIndexRanges);
    // 발사 지점: 인덱스 → 호길이 s + 실제 좌표 (탄도 부품)
    const launches = ((opts && opts.launchMarks) || []).map(m => ({
      sLaunch: cum[m.i],
      sLand: cum[m.iLand],
      from: points[m.i],
      to: points[m.iLand],
      angle: m.angle,
      boost: m.boost,
      catchR: m.catchR,
      wallR: m.wallR || m.catchR,
      wallH: m.wallH || 0,
      u: (function () {
        const A = points[m.i], B = points[m.iLand];
        const dx = B.x - A.x, dz = B.z - A.z, dl = Math.hypot(dx, dz) || 1;
        return { x: dx / dl, z: dz / dl };
      })(),
    })).sort((a, b) => a.sLaunch - b.sLaunch);
    return { points, segs, cum, total, bowlRanges, airRanges, boostRanges, launches };
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
      this._fall = null; // 이탈 낙하 { p:{x,y,z}, v:{x,y,z} }
      this._air = null;  // 탄도 비행 { p, v, L }  (L = 발사 정의)
      this._missed = false;
    }
    release(v0) {
      this.reset();
      this.v = v0 || 0;
      this.status = 'rolling';
      return [{ type: 'release' }];
    }
    energy() {
      // 단위질량 역학적 에너지 (진단·테스트용)
      const f = this._air || this._fall;
      if (f) return 0.5 * (f.v.x * f.v.x + f.v.y * f.v.y + f.v.z * f.v.z) + this.P.g * f.p.y;
      return 0.5 * this.v * this.v + this.P.g * posAt(this.pd, this.s).y;
    }
    pos() {
      if (this._air) return this._air.p;
      if (this._fall) return this._fall.p;
      return posAt(this.pd, this.s);
    }
    tangent() {
      const f = this._air || this._fall;
      if (f) {
        const L = Math.hypot(f.v.x, f.v.y, f.v.z) || 1;
        return { x: f.v.x / L, y: f.v.y / L, z: f.v.z / L };
      }
      return tangentAt(this.pd, this.s);
    }
    speed() {
      const f = this._air || this._fall;
      if (f) return Math.hypot(f.v.x, f.v.y, f.v.z);
      return Math.abs(this.v);
    }

    /* 발사: 진입 속도 + 부품 부스트 → 지정 각도로 사출.
     * v_out = √(v_in² + 2·boost),  방향 = (발사→착지) 수평 단위벡터를 angle 만큼 들어올림. */
    _launch(L, ev) {
      const P = this.P;
      const vin = Math.abs(this.v);
      const sp = Math.sqrt(vin * vin + 2 * L.boost);
      let dx = L.to.x - L.from.x, dz = L.to.z - L.from.z;
      const dl = Math.hypot(dx, dz) || 1;
      dx /= dl; dz /= dl;
      const ch = Math.cos(L.angle), sh = Math.sin(L.angle);
      this._air = {
        p: { x: L.from.x, y: L.from.y, z: L.from.z },
        v: { x: dx * sp * ch, y: sp * sh, z: dz * sp * ch },
        L,
      };
      this.status = 'air';
      this.v = 0;
      ev.push({ type: 'launch', speed: sp, s: L.sLaunch });
      // 사거리 예보 (진단·힌트용, 물리에 영향 없음)
      this._airRange = (sp * sp * Math.sin(2 * L.angle)) / P.g;
      this._missed = false;
      return ev;
    }

    /* 비행 1틱: 포물선 적분 → 착지대 평면 하강 통과 시 포획 판정 */
    _airStep(ev) {
      const P = this.P, dt = P.dt, a = this._air, L = a.L;
      const yPrev = a.p.y;
      // 등가속 정확 적분 — 비행 중 역학적 에너지가 정확히 보존된다
      a.p.x += a.v.x * dt;
      a.p.y += a.v.y * dt - 0.5 * P.g * dt * dt;
      a.p.z += a.v.z * dt;
      a.v.y -= P.g * dt;

      // 착지대 판정 — 깔때기 / 백보드 / 빗나감
      const dx = a.p.x - L.to.x, dz = a.p.z - L.to.z;
      const along = dx * L.u.x + dz * L.u.z;              // + = 착지대를 지나침
      const lat = Math.abs(dx * L.u.z - dz * L.u.x);      // 좌우 편차
      const capture = (keep, kind, miss) => {
        this.s = L.sLand;
        this.v = Math.hypot(a.v.x, a.v.z) * keep;
        this.status = 'rolling';
        this._air = null;
        this._restTicks = 0;
        this._lastDir = 1;
        ev.push({ type: 'catch', miss, wall: kind === 'wall', v: this.v });
      };

      if (a.v.y < 0 && lat <= L.catchR) {
        // 1) 깔때기: 착지 평면을 하강 통과하며 오차 이내
        if (yPrev > L.to.y && a.p.y <= L.to.y && Math.abs(along) <= L.catchR) {
          capture(P.catchKeep, 'clean', Math.abs(along));
          return ev;
        }
        // 2) 백보드: 낮게 날아온 오버슛이 뒷벽 안쪽 면에 맞고 떨어짐
        if (along > L.catchR && along <= L.wallR && a.p.y <= L.to.y + L.wallH) {
          capture(P.wallKeep, 'wall', along);
          return ev;
        }
      }
      if (a.v.y < 0 && yPrev > L.to.y && a.p.y <= L.to.y && !this._missed) {
        this._missed = true;
        ev.push({ type: 'miss', miss: Math.hypot(dx, dz), over: along > 0 });
      }

      if (a.p.y <= P.floorY) {
        a.p.y = P.floorY;
        this._fall = a;
        this._air = null;
        this.status = 'fallen';
        ev.push({ type: 'crash' });
      }
      return ev;
    }

    step() {
      // 에너지 스테핑: E' = E − 손실·|Δs|,  v' = ±√(max(0, 2(E' − g·h(s'))))
      // → 구조적으로 에너지 비증가 보장 (설계서 §2-1)
      const ev = [];
      // 탄도 비행: 진짜 포물선 적분 + 착지대 포획 판정
      if (this.status === 'air') { this._airStep(ev); this.tick++; return ev; }
      // 이탈 낙하: 포물선 적분 → 바닥 충돌
      if (this.status === 'falling') {
        const P = this.P, dt = P.dt;
        const f = this._fall;
        // 등가속 정확 적분: y += v·dt − ½g·dt²  (심플렉틱 오일러의 계통 오차 제거)
        f.p.x += f.v.x * dt;
        f.p.y += f.v.y * dt - 0.5 * P.g * dt * dt;
        f.p.z += f.v.z * dt;
        f.v.y -= P.g * dt;
        if (f.p.y <= P.floorY) {
          f.p.y = P.floorY;
          this.status = 'fallen';
          ev.push({ type: 'crash' });
        }
        this.tick++;
        return ev;
      }
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

      // ── 탄도 발사 (캐논·트램펄린): 발사 지점 통과 → AIR 상태 ──
      if (vE > 0 && pd.launches && pd.launches.length) {
        for (const L of pd.launches) {
          if (this.s < L.sLaunch && sNew >= L.sLaunch) {
            this.s = L.sLaunch;
            this._launch(L, ev);
            this.tick++;
            return ev;
          }
        }
      }

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

      // 접촉 조건 (수직 곡면 역학): 레일은 supp 방향으로만 밀 수 있다.
      // 힘 균형 구심 성분: N·(supp·cdir) = v²κ + g·cdir_y  →  N < 0 이면 이탈.
      // 루프 꼭대기: cdir=(0,-1,0), supp=(0,-1,0) → N = v²κ − g  (v²κ < g 이면 낙하)
      // supp·cdir ≤ 0.3 (평지 커브·언덕류)은 검사 제외 — 언덕 이탈은 M2b AIR 캡처와 함께.
      {
        const seg2 = pd.segs[segIndexAt(pd, this.s)];
        if (seg2.kappa > 4 && seg2.cdir && seg2.supp && !inAir(pd, this.s)) {
          const denom = seg2.supp.x * seg2.cdir.x + seg2.supp.y * seg2.cdir.y + seg2.supp.z * seg2.cdir.z;
          if (denom > 0.3) {
            const N = (this.v * this.v * seg2.kappa + P.g * seg2.cdir.y) / denom;
            if (N < 0) {
              const p = posAt(pd, this.s);
              const t = seg2.dir;
              const sp = Math.abs(this.v);
              const sg = Math.sign(this.v || 1);
              this._fall = {
                p: { x: p.x, y: p.y, z: p.z },
                v: { x: t.x * sp * sg, y: t.y * sp * sg, z: t.z * sp * sg },
              };
              this.status = 'falling';
              ev.push({ type: 'detach', s: this.s });
              this.tick++;
              return ev;
            }
          }
        }
      }

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
      while ((this.status === 'rolling' || this.status === 'falling' || this.status === 'air') && this.tick < maxTicks) {
        all.push(...this.step());
      }
      return all;
    }
  }

  return { PHYS, Sim, buildPathData, posAt, tangentAt, segIndexAt };
});
