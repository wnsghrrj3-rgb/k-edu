/* 케이랩 사회실 · 마을 계획실 데이터 (T3)
   TOWN_MAPS[id] = 손맵(절차 생성 아님·오퍼스 양산). 24×16 문자 격자.
   글자: R=길(road) · H=집(house) · W=강(water) · B=다리(bridge) · .=빈터(시설 배치 자리)
   시간 환산(골든타임 근거): 도보 1셀 1분 · 소방차 1셀 0.25분. 강은 다리 셀만 통과. */
(function (root) {
  var T = root.TOWN_MAPS || {};

  // 별빛 신도시 — 격자 도로망(강 없음, 입문). 중앙 광장(빈터)에서 배치 실습.
  T['village1'] = {
    name: '별빛 신도시', W: 24, H: 16,
    rows: [
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.....H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.....H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R",
      "RRRRRRRRRRRRRRRRRRRRRRRR",
      "RH.H.H.H.H.H.H.H.H.H.H.R"
    ]
  };

  // 강마을 — 세로 강이 마을을 좌우로 가르고 다리 2개(y=3·11)로만 건넘. 골든타임 딜레마.
  T['village2'] = {
    name: '강마을', W: 24, H: 16,
    rows: [
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRBBRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRBBRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R",
      "RRRRRRRRRRRWWRRRRRRRRRRR",
      "RH.H.H.H.H.WWH.H.H.H.H.R"
    ]
  };

  // 시설 8종 — 4학년 공공기관·중심지.
  root.TOWN_FAC = {
    fire:     { name: '소방서', emoji: '🚒', color: '#E8503A' },
    hospital: { name: '병원',   emoji: '🏥', color: '#E84393' },
    school:   { name: '학교',   emoji: '🏫', color: '#F6B93B' },
    library:  { name: '도서관', emoji: '📚', color: '#6D5DD3' },
    police:   { name: '경찰서', emoji: '🚓', color: '#3B7DD8' },
    market:   { name: '시장',   emoji: '🏪', color: '#E67E22' },
    post:     { name: '우체국', emoji: '📮', color: '#16A085' },
    park:     { name: '공원',   emoji: '🌳', color: '#27AE60' }
  };

  /* 미션 — give(줄 시설 수)·goals(자동 채점)·hint.
     goal.kind 'coverage' = 전 집 셀에서 fac까지 mode(walk|fire) 시간 ≤ limit분. */
  root.TOWN_MISSIONS = [
    {
      id: 'm1', map: 'village1', title: '모두를 지키는 소방서',
      give: { fire: 2 },
      goals: [{ fac: 'fire', mode: 'fire', limit: 5, kind: 'coverage', label: '모든 집이 소방차로 5분 안에 닿기' }],
      hint: '집이 몰린 곳 사이 빈터(광장)에 놓으면 여러 집을 한 번에 지켜요.'
    },
    {
      id: 'm2', map: 'village1', title: '책이 가까운 동네',
      give: { library: 1, park: 1 },
      goals: [
        { fac: 'library', mode: 'walk', limit: 12, kind: 'coverage', label: '모든 집이 도서관까지 걸어서 12분 안에' },
        { fac: 'park', mode: 'walk', limit: 14, kind: 'coverage', label: '모든 집이 공원까지 걸어서 14분 안에' }
      ],
      hint: '중앙 광장은 어느 집에서도 비슷하게 가까워요.'
    },
    {
      id: 'm3', map: 'village2', title: '강 건너 마을 지키기',
      give: { fire: 2 },
      goals: [{ fac: 'fire', mode: 'fire', limit: 6, kind: 'coverage', label: '강 양쪽 모든 집이 소방차로 6분 안에' }],
      hint: '다리는 두 곳뿐이에요. 소방서 하나로 강 건너까지 닿을 수 있을까요?'
    }
  ];

  root.TOWN_MAPS = T;
  if (typeof module !== 'undefined' && module.exports)
    module.exports = { TOWN_MAPS: T, TOWN_FAC: root.TOWN_FAC, TOWN_MISSIONS: root.TOWN_MISSIONS };
})(typeof window !== 'undefined' ? window : this);
