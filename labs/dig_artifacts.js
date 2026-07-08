/* 케이랩 사회실 · 발굴실 유물 데이터 (T2-④ 스키마)
   window.DIG_ARTIFACTS[id] = 유물 JSON. 오퍼스 무한 양산의 심장(T2-2에서 12종 확장).
   ⚠️ 문화재 명칭·설명은 교과서 준거로만(창작 서사 금지 — 정직 원칙).
   geo.type "lathe" = 회전체 프로파일[[r,y],…](발굴실이 회전체 파이프라인 원산지) / "composite" = 프리미티브 합성(박물관 미니어처 톤).
   profile: r=반지름·y=높이(정규화). depth = 유물 상단 매설 깊이 d_a(0..1). shards_base = 기본 조각 수(타격당 +2). */
(function (root) {
  var A = root.DIG_ARTIFACTS || {};

  A['bitsal'] = {
    id: 'bitsal', name: '빗살무늬토기', era: '신석기',
    geo: {
      type: 'lathe',
      // 뾰족 바닥(V) → 배부른 몸통 → 살짝 오므린 입구
      profile: [[0, 0], [0.14, 0.03], [0.28, 0.10], [0.32, 0.22], [0.31, 0.42], [0.27, 0.60], [0.15, 0.71], [0.14, 0.73]],
      pattern: 'comb_lines', tint: '#B08860'
    },
    depth: 0.55, hp: 3, shards_base: 5,
    card: { use: '곡식 보관·조리', why_shape: '뾰족한 바닥 — 강가 모래에 꽂아 세워 두었어요.' },
    timeline_wrong: { '조선': '그땐 이미 백자를 굽던 시대예요!', '삼국': '토기보다 훨씬 뒤예요 — 재료를 떠올려요.' },
    predict: { q: '바닥이 왜 뾰족할까요?', options: ['멋을 내려고', '모래에 꽂으려고', '실수로'], a: 1 }
  };

  root.DIG_ARTIFACTS = A;
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
})(typeof window !== 'undefined' ? window : this);
