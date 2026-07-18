/* 케이파크 · 마블런 — tracks.js
 * 프리셋 트랙 정의 (단일 소스 — index.html과 테스트가 공유).
 * 모든 트랙은 graph.buildTrack 검증 + 완주 테스트를 통과해야 함.
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const TRACKS = [
    {
      id: 'golden',
      name: '골든 샘플',
      desc: '기본 코스 — 탑에서 내려와 커브 돌고 벨까지',
      pieces: [
        { type: 'start',    q: 0, r: 0, h: 2, rot: 0 },
        { type: 'slope',    q: 1, r: 0, h: 1, rot: 3 },
        { type: 'slope',    q: 2, r: 0, h: 0, rot: 3 },
        { type: 'straight', q: 3, r: 0, h: 0, rot: 3 },
        { type: 'curve_l',  q: 4, r: 0, h: 0, rot: 3 },
        { type: 'goal',     q: 4, r: 1, h: 0, rot: 2 },
      ],
    },
    {
      id: 'slalom',
      name: 'S자 슬라럼',
      desc: '높이 3에서 좌우로 굽이치며 내려오는 코스',
      pieces: [
        { type: 'start',    q: 0, r: 0, h: 3, rot: 0 },
        { type: 'slope',    q: 1, r: 0, h: 2, rot: 3 },
        { type: 'slope',    q: 2, r: 0, h: 1, rot: 3 },
        { type: 'curve_l',  q: 3, r: 0, h: 1, rot: 3 },
        { type: 'slope',    q: 3, r: 1, h: 0, rot: 2 },
        { type: 'curve_r',  q: 3, r: 2, h: 0, rot: 2 },
        { type: 'straight', q: 4, r: 2, h: 0, rot: 3 },
        { type: 'goal',     q: 5, r: 2, h: 0, rot: 3 },
      ],
    },
    {
      id: 'spiral',
      name: '나선 폭포',
      desc: '높이 4 — 빙글빙글 돌며 떨어지는 최장 낙차 코스',
      pieces: [
        { type: 'start',    q:  0, r: 0, h: 4, rot: 0 },
        { type: 'slope',    q:  1, r: 0, h: 3, rot: 3 },
        { type: 'curve_l',  q:  2, r: 0, h: 3, rot: 3 },
        { type: 'slope',    q:  2, r: 1, h: 2, rot: 2 },
        { type: 'curve_l',  q:  2, r: 2, h: 2, rot: 2 },
        { type: 'slope',    q:  1, r: 3, h: 1, rot: 1 },
        { type: 'curve_l',  q:  0, r: 4, h: 1, rot: 1 },
        { type: 'slope',    q: -1, r: 4, h: 0, rot: 0 },
        { type: 'straight', q: -2, r: 4, h: 0, rot: 0 },
        { type: 'goal',     q: -3, r: 4, h: 0, rot: 0 },
      ],
    },
    {
      id: 'grandtour',
      name: '그랜드 투어',
      desc: '낮은 낙차로 얼마나 멀리 가나 — 마찰과의 싸움',
      pieces: [
        { type: 'start',    q: 0, r: 0, h: 2, rot: 0 },
        { type: 'slope',    q: 1, r: 0, h: 1, rot: 3 },
        { type: 'slope',    q: 2, r: 0, h: 0, rot: 3 },
        { type: 'straight', q: 3, r: 0, h: 0, rot: 3 },
        { type: 'straight', q: 4, r: 0, h: 0, rot: 3 },
        { type: 'curve_l',  q: 5, r: 0, h: 0, rot: 3 },
        { type: 'curve_l',  q: 5, r: 1, h: 0, rot: 2 },
        { type: 'straight', q: 4, r: 2, h: 0, rot: 1 },
        { type: 'straight', q: 3, r: 3, h: 0, rot: 1 },
        { type: 'curve_r',  q: 2, r: 4, h: 0, rot: 1 },
        { type: 'goal',     q: 2, r: 5, h: 0, rot: 2 },
      ],
    },
  ];

  return { TRACKS };
});
