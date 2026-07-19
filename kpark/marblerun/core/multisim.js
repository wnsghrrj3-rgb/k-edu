/* 케이파크 · 마블런 — multisim.js
 * MultiSim (M2b-2): 구슬 1~8개 순차 방출 + 교대 스위치 상태머신. 순수 로직.
 *
 * 원리:
 *  - 잎(leaf)마다 완전한 pathData가 있고, 모든 잎은 갈림길 이전 구간의 기하를 공유한다
 *    (스위치 부품의 진입 절반이 방향 무관 동일 — parts/switchpart.js의 기하 계약).
 *  - 구슬은 항상 "어떤 잎 위"를 달린다. 분기점(sDecide)을 앞으로 통과하는 순간:
 *      1) 그 스위치의 현재 방향을 읽어 자기 결정으로 삼고
 *      2) 스위치를 반전시키고 (딸깍! — 다음 구슬은 반대쪽)
 *      3) 결정에 맞는 잎으로 경로를 교체한다 (s·v 그대로 — 기하 공유로 이어짐)
 *  - 역행해서 분기점 뒤로 물러나면 결정이 풀리고, 다시 앞으로 통과할 때
 *    그 시점의 스위치 방향을 새로 따른다 (진짜 플리퍼처럼).
 *
 * 알려진 근사: 구슬 간 충돌 없음 — 방출 간격(stagger)으로 겹침을 피한다.
 * 결정론: 고정 틱·고정 간격·초기 방향(왼길) 고정 → 같은 트랙 = 항상 같은 결과.
 *
 * routesData: [{ pd, switches: [{ id, s }] }]   // 경로 순서대로 정렬된 스위치 (id = 전역 부품 인덱스)
 * 이벤트: 기존 Sim 이벤트에 m(구슬 인덱스) 태그 + {type:'switch', id, dir, m}
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function NS() {
    if (root.MarbleSim && root.MarbleSim.Sim) return root.MarbleSim;
    return require('./sim.js');
  }

  const S_EPS = 0.004; // 분기점 역행 이력 (m) — 이보다 뒤로 물러나야 결정 해제

  /* comp(builder.compile 결과) → MultiSim 투입용 잎 데이터.
   * 각 잎: leafPieces로 buildTrack → pathData, decideMarks → 경로 순 스위치 [{id, s}]. */
  function compileRoutes(comp, buildOpts) {
    const ns = (root.MarbleSim && root.MarbleSim.buildTrack) ? root.MarbleSim
      : Object.assign({}, require('./graph.js'), require('./sim.js'), require('./builder.js'));
    const routesData = [];
    const errors = [];
    comp.routes.forEach((rt, ri) => {
      const lp = ns.leafPieces(comp, rt);
      const track = ns.buildTrack(lp, null, buildOpts);
      if (!track.ok && !(buildOpts && buildOpts.allowNoGoal)) {
        errors.push({ route: ri, errors: track.errors });
        return;
      }
      if (track.points.length < 2) return;
      const pd = ns.buildPathData(track.points, track.bowlIndexRanges, {
        airIndexRanges: track.airIndexRanges,
        boostIndexRanges: track.boostIndexRanges,
        launchMarks: track.launchMarks,
      });
      const switches = (track.decideMarks || [])
        .map(dm => ({ id: rt.pieceIdxs[dm.piece], s: pd.cum[dm.i] }))
        .sort((a, b) => a.s - b.s);
      const lastGlobal = rt.pieceIdxs[rt.pieceIdxs.length - 1];
      routesData.push({
        pd, track, switches,
        decisions: rt.decisions,
        leafPieces: lp,
        routeIdx: ri,
        goalPieceIdx: comp.pieces[lastGlobal] && comp.pieces[lastGlobal].type === 'goal' ? lastGlobal : null,
      });
    });
    return { ok: errors.length === 0, errors, routesData };
  }

  const TERMINAL = { goal: 1, rest: 1, fallen: 1 };

  class MultiSim {
    /* routesData: 잎 배열. opts: { count=1, staggerTicks=60, phys } */
    constructor(routesData, opts) {
      const { Sim } = NS();
      this._Sim = Sim;
      this.routes = routesData;
      const o = opts || {};
      this.count = Math.max(1, Math.min(8, o.count || 1));
      this.stagger = o.staggerTicks != null ? o.staggerTicks : 60;
      this.phys = o.phys || null;
      this.reset();
    }

    reset() {
      this.tick = 0;
      this.states = new Map(); // 스위치 id → 0(왼) | 1(오) — 초기 전부 왼길
      for (const rt of this.routes) for (const sw of rt.switches) if (!this.states.has(sw.id)) this.states.set(sw.id, 0);
      this.marbles = [];
      for (let i = 0; i < this.count; i++) {
        this.marbles.push({
          sim: new this._Sim(this.routes[0].pd, this.phys),
          routeIdx: 0,
          decided: [],        // [{id, dir}] — 경로 순서
          released: false,
          delay: i * this.stagger,
          releaseTick: 0,
        });
      }
      this.done = false;
    }

    release() {
      this.reset();
      return [{ type: 'multirelease', count: this.count }];
    }

    /* decided 시퀀스와 접두 일치하는 잎 찾기 */
    _routeFor(decided) {
      for (let i = 0; i < this.routes.length; i++) {
        const dec = this.routes[i].decisions;
        if (!dec) continue;
        if (dec.length < decided.length) continue;
        let ok = true;
        for (let j = 0; j < decided.length; j++) {
          if (dec[j].id !== decided[j].id || dec[j].dir !== decided[j].dir) { ok = false; break; }
        }
        if (ok) return i;
      }
      return -1;
    }

    step() {
      const ev = [];
      let allDone = true;
      for (let m = 0; m < this.marbles.length; m++) {
        const M = this.marbles[m];
        if (!M.released) {
          if (this.tick >= M.delay) {
            M.released = true;
            M.releaseTick = this.tick;
            for (const e of M.sim.release(0)) ev.push(Object.assign({ m }, e));
          } else { allDone = false; continue; }
        }
        if (TERMINAL[M.sim.status]) continue;
        allDone = false;

        for (const e of M.sim.step()) ev.push(Object.assign({ m }, e));

        // ── 분기점 통과/후퇴 판정 (RAIL 상태에서만 s가 유효) ──
        if (M.sim.status === 'rolling') {
          const route = this.routes[M.routeIdx];
          // 후퇴: 마지막 결정의 분기점보다 확실히 뒤면 결정 해제
          while (M.decided.length > 0) {
            const lastSw = route.switches[M.decided.length - 1];
            if (lastSw && M.sim.s < lastSw.s - S_EPS) { M.decided.pop(); }
            else break;
          }
          // 전진: 다음 스위치의 분기점을 넘었으면 결정 + 반전 + 잎 교체
          let guard = 0;
          while (guard++ < 8) {
            const nextSw = this.routes[M.routeIdx].switches[M.decided.length];
            if (!nextSw || M.sim.s < nextSw.s) break;
            const dir = this.states.get(nextSw.id) || 0;
            this.states.set(nextSw.id, dir ^ 1); // 딸깍 — 다음 구슬은 반대쪽
            M.decided.push({ id: nextSw.id, dir });
            M.sim.s = nextSw.s; // 기하 공유점으로 클램프 → 경로 교체 무결
            const ri = this._routeFor(M.decided);
            if (ri >= 0 && ri !== M.routeIdx) {
              M.routeIdx = ri;
              M.sim.pd = this.routes[ri].pd;
            }
            ev.push({ type: 'switch', id: nextSw.id, dir, next: dir ^ 1, m });
          }
        }
        if (TERMINAL[M.sim.status]) {
          if (M.sim.status === 'goal') ev.push({ type: 'finish', m, ticks: this.tick - M.releaseTick, routeIdx: M.routeIdx });
        }
      }
      this.tick++;
      if (allDone && !this.done) { this.done = true; ev.push({ type: 'alldone' }); }
      return ev;
    }

    runToEnd(maxSec) {
      const { PHYS } = NS();
      const dt = (this.phys && this.phys.dt) || PHYS.dt;
      const maxTicks = Math.round((maxSec || 40) / dt);
      const all = [];
      while (!this.done && this.tick < maxTicks) all.push(...this.step());
      return all;
    }
  }

  return { MultiSim, compileRoutes };
});
