/* 케이파크 · 마블런 — builder.js
 * 건설 모드 핵심: 체인 이어붙이기 모델.
 * 트랙 = { startH, seq: ['slope','curve_l',...] } 만으로 완전 결정.
 * → 회전 UI 불필요 (체인이 진입 포트를, 부품이 출구 포트를 결정)
 * → 탭 한 번 = 부품 하나, 저학년 조작 가능
 *
 * compile(state) → {
 *   ok, errors, pieces,        // graph.buildTrack에 그대로 투입 가능한 배치
 *   ended,                     // 골 벨로 종결됨
 *   exitH,                     // 현재 열린 출구 높이 (기둥 단위)
 *   next: {q,r,entry,blocked}  // 다음 부품이 놓일 자리 (없으면 null)
 * }
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function hex() {
    if (root.MarbleSim && root.MarbleSim.hexgrid) return root.MarbleSim.hexgrid;
    return require('./hexgrid.js').hexgrid;
  }

  const APPENDABLE = ['straight', 'curve_l', 'curve_r', 'slope', 'goal',
                      'hill', 'loop', 'gyro', 'jump', 'booster', 'zigzag'];
  const DROPS = { slope: 1, gyro: 2 }; // 부품별 하강 칸수 (그 외 0)

  function compile(state) {
    const hx = hex();
    const startH = state.startH;
    const seq = state.seq || [];
    const errors = [];
    const pieces = [{ type: 'start', q: 0, r: 0, h: startH, rot: 0 }];
    const occupied = new Set([hx.key(0, 0)]);

    let q = 0, r = 0, exitPort = 0, exitH = startH;
    let ended = false;

    for (let i = 0; i < seq.length; i++) {
      const t = seq[i];
      if (ended) { errors.push({ code: 'AFTER_GOAL', msg: '골 벨 뒤에는 부품을 놓을 수 없음', at: i }); break; }
      if (APPENDABLE.indexOf(t) < 0) { errors.push({ code: 'UNKNOWN_TYPE', msg: '알 수 없는 부품: ' + t, at: i }); break; }

      const n = hx.neighborOf(q, r, exitPort);
      const k = hx.key(n.q, n.r);
      if (occupied.has(k)) { errors.push({ code: 'COLLISION', msg: '자리가 이미 차 있음: ' + k, at: i }); break; }

      const entry = hx.opposite(exitPort);
      const drop = DROPS[t] || 0;
      if (exitH < drop) { errors.push({ code: 'TOO_LOW', msg: '높이가 부족해 ' + t + '를 놓을 수 없음 (필요 ' + drop + '칸)', at: i }); break; }
      const h = exitH - drop;
      let newExit;
      if (t === 'curve_l')      newExit = (entry + 2) % 6;
      else if (t === 'curve_r') newExit = (entry + 4) % 6;
      else if (t === 'goal')    newExit = null;
      else                      newExit = (entry + 3) % 6;

      pieces.push({ type: t, q: n.q, r: n.r, h, rot: entry });
      occupied.add(k);
      q = n.q; r = n.r;
      if (drop > 0) exitH = h;
      if (newExit === null) { ended = true; }
      else exitPort = newExit;
    }

    let next = null;
    if (!ended && errors.length === 0) {
      const n = hx.neighborOf(q, r, exitPort);
      next = { q: n.q, r: n.r, entry: hx.opposite(exitPort), blocked: occupied.has(hx.key(n.q, n.r)) };
    }

    return { ok: errors.length === 0, errors, pieces, ended, exitH, next };
  }

  /* 팔레트 활성 여부: 부품별로 지금 놓을 수 있는지 */
  function canPlace(comp, type) {
    if (comp.ended || !comp.ok) return false;
    if (!comp.next || comp.next.blocked) return false;
    if ((DROPS[type] || 0) > comp.exitH) return false;
    return APPENDABLE.indexOf(type) >= 0;
  }

  return { compile, canPlace, APPENDABLE };
});
