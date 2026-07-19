/* 케이파크 · 마블런 — parts/splitter.js
 * 🚦 신호기 (M2b-3): 고정 방향 분배기. 스위치와 달리 통과해도 반전 없음 —
 * 방향은 사람이 정한다 (실행 중 탭으로 레버 전환). 아이가 교통 관제사가 된다.
 *
 * 기하는 스위치와 완전 동일 (switchpart.js의 기하 계약 그대로):
 *  진입 절반 공유 + 좌/우 출구 거울 대칭 → 분기점 경로 교체 무결.
 * 차이는 오직 상태머신(MultiSim)의 flip 여부뿐.
 */
(function (root, factory) {
  const mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  function baseSwitch() {
    if (root.MarbleSim && root.MarbleSim.PARTS && root.MarbleSim.PARTS.switch) {
      return root.MarbleSim.PARTS.switch;
    }
    return require('./switchpart.js').SWITCH;
  }

  const sw = baseSwitch();
  const spec = Object.assign({}, sw, {
    label: '신호기',
    isSwitch: true,     // 분기 부품 공통 취급 (graph decide 마크 동일)
    isSplitter: true,   // 반전 없음 — MultiSim flip 판정용
  });

  const ns = (root.MarbleSim = root.MarbleSim || {});
  if (ns.PARTS) ns.PARTS.splitter = spec;

  return { SPLITTER: spec };
});
