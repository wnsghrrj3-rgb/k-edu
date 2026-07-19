/* 케이파크 · 마블런 — tracks.js
 * 프리셋 트랙 (단일 소스). 빌더 데이터 모델(startH + seq)로 정의 —
 * "예시 불러오기 → 이어서 편집"이 가능한 구조.
 * 모든 트랙은 compile + buildTrack + 완주 테스트를 통과해야 함.
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
      startH: 2,
      seq: ['slope', 'slope', 'straight', 'curve_l', 'goal'],
    },
    {
      id: 'slalom',
      name: 'S자 슬라럼',
      desc: '높이 3에서 좌우로 굽이치며 내려오는 코스',
      startH: 3,
      seq: ['slope', 'slope', 'curve_l', 'slope', 'curve_r', 'straight', 'goal'],
    },
    {
      id: 'spiral',
      name: '나선 폭포',
      desc: '높이 4 — 빙글빙글 돌며 떨어지는 최장 낙차 코스',
      startH: 4,
      seq: ['slope', 'curve_l', 'slope', 'curve_l', 'slope', 'curve_l', 'slope', 'straight', 'goal'],
    },
    {
      id: 'grandtour',
      name: '그랜드 투어',
      desc: '낮은 낙차로 얼마나 멀리 가나 — 마찰과의 싸움',
      startH: 2,
      seq: ['slope', 'slope', 'straight', 'straight', 'curve_l', 'curve_l', 'straight', 'straight', 'curve_r', 'goal'],
    },
    {
      id: 'fullcourse',
      name: '풀코스 스페셜',
      desc: '자이로·언덕·루프·점프·부스터 총출동 — 전 부품 시연',
      startH: 5,
      seq: ['slope', 'gyro', 'curve_l', 'slope', 'hill', 'booster', 'curve_r', 'loop', 'slope', 'jump', 'zigzag', 'goal'],
    },
    {
      id: 'loopchallenge',
      name: '루프 챌린지',
      desc: '느리면 꼭대기에서 떨어진다! 부스터 2개의 힘',
      startH: 2,
      seq: ['slope', 'booster', 'booster', 'loop', 'slope', 'straight', 'goal'],
    },
    {
      id: 'cannonrange',
      name: '대포 발사대',
      desc: '3칸을 날아 착지대에 꽂힌다 — 대포는 스스로 밀어준다',
      startH: 5,
      seq: ['straight', 'cannon', 'slope', 'booster', 'loop', 'slope', 'goal'],
    },
    {
      id: 'trampolinepark',
      name: '트램펄린 파크',
      desc: '통통 두 번 튕겨서 건너가는 코스',
      startH: 3,
      seq: ['slope', 'trampoline', 'curve_l', 'trampoline', 'straight', 'goal'],
    },
    {
      id: 'skyroute',
      name: '공중 대탐험',
      desc: '대포로 날고 트램펄린으로 튕기고 — 땅에 거의 안 닿는 코스',
      startH: 5,
      seq: ['straight', 'cannon', 'slope', 'trampoline', 'curve_r', 'goal'],
    },
    {
      id: 'forkplaza',
      name: '갈림길 광장',
      desc: '구슬 3개를 굴려봐 — 스위치가 딸깍딸깍 번갈아 보낸다!',
      startH: 3,
      marbles: 3,
      seq: ['slope', 'straight',
        { type: 'switch',
          left:  ['curve_l', 'slope', 'straight', 'goal'],
          right: ['curve_r', 'slope', 'straight', 'goal'] }],
    },
    {
      id: 'triplebell',
      name: '세 갈래 종탑',
      desc: '갈래 속의 갈래 — 벨 3개가 누구를 먼저 맞이할까?',
      startH: 4,
      marbles: 3,
      seq: ['slope',
        { type: 'switch',
          left: ['curve_l', 'slope',
            { type: 'switch',
              left:  ['curve_l', 'goal'],
              right: ['curve_r', 'straight', 'goal'] }],
          right: ['curve_r', 'slope', 'zigzag', 'goal'] }],
    },
  ];

  return { TRACKS };
});
