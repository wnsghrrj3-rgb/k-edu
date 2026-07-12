/* ============================================================================
   K-edu 케이배틀 — 4층 XP·등급 (kb-xp.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제5조.
     ① 강등 없음 (누적형만 — xp 는 절대 줄지 않는다)
     ② 등급은 실력이 아니라 여정 (비교 랭킹 화면 없음, 내 프로필에서만)
     ③ 잘하는 것보다 '하는 것'에 보상 (참여 XP 가 기본, 정답 XP 는 얹는 것)

   순수 로직만. DOM·저장소·네트워크 모름 → 어디서든 재사용(테스트 쉬움).

   ⚠️ 등급 테마 = 우주 가안 (준호 최종 확정 대기).
      바꿀 때 건드릴 곳은 TIERS 배열 하나뿐 — 계단 수식·XP 규칙은 테마와 무관.
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBXP) return;

  /* ---------------- XP 규칙 (제5조) ---------------- */
  var XP = {
    play: 20,        // 게임 1판 참여 (= 기본. 못 맞혀도 준다)
    correct: 5,      // 정답 1개
    hard: 12,        // ★3 정답 (correct 대신 지급 — 중복 아님)
    streak5: 15,     // 한 판에서 5연속 달성
    coop: 25,        // 협동 목표 달성 전원
    firstToday: 20   // 오늘 첫 판
  };

  // 한 판의 결과 → 획득 XP 내역.
  // r = { correct: n, hardCorrect: n, bestStreak: n, coopCleared: bool, firstToday: bool }
  function gain(r) {
    r = r || {};
    var hard = Math.max(0, r.hardCorrect | 0);
    var normal = Math.max(0, (r.correct | 0) - hard);   // ★3 정답은 hard 로만 계산
    var lines = [];
    lines.push({ k: 'play', label: '참여', xp: XP.play });
    if (normal) lines.push({ k: 'correct', label: '정답 ' + normal + '개', xp: normal * XP.correct });
    if (hard) lines.push({ k: 'hard', label: '★3 정답 ' + hard + '개', xp: hard * XP.hard });
    if ((r.bestStreak | 0) >= 5) lines.push({ k: 'streak5', label: '5연속!', xp: XP.streak5 });
    if (r.coopCleared) lines.push({ k: 'coop', label: '협동 성공', xp: XP.coop });
    if (r.firstToday) lines.push({ k: 'firstToday', label: '오늘 첫 판', xp: XP.firstToday });
    var total = lines.reduce(function (s, l) { return s + l.xp; }, 0);
    return { total: total, lines: lines };
  }

  /* ---------------- 등급 사다리 (10단계 × Ⅰ·Ⅱ·Ⅲ = 30계단) ---------------- */
  // ⚠️ 테마 교체 지점 (준호 확정 대기)
  var TIERS = [
    { name: '새싹',       emoji: '🌱' },
    { name: '반딧불',     emoji: '✨' },
    { name: '별똥별',     emoji: '💫' },
    { name: '초승달',     emoji: '🌙' },
    { name: '보름달',     emoji: '🌕' },
    { name: '행성',       emoji: '🪐' },
    { name: '혜성',       emoji: '☄️' },
    { name: '은하',       emoji: '🌌' },
    { name: '성운',       emoji: '🌠' },
    { name: '별의 수호자', emoji: '👑' }
  ];
  var ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ'];
  var STEPS = TIERS.length * 3;         // 30

  // 계단 k(1~29) → 다음 계단까지 필요 XP.
  // 초반 계단은 짧게 — 첫 주에 승급 맛을 못 보면 시스템이 죽는다(제5조).
  //   1계단: 150 (참여+정답이면 2~3판) … 29계단: ~1800
  function needFor(step) {
    if (step < 1 || step >= STEPS) return Infinity;   // 30계단 = 끝(더 오를 곳 없음)
    return Math.round(150 * Math.pow(1.09, step - 1));
  }

  // 누적 XP 임계값 (계단 k에 도달하는 데 필요한 총 XP)
  var CUM = [0, 0];                     // CUM[1] = 0 (누구나 1계단에서 시작)
  for (var s = 1; s < STEPS; s++) CUM[s + 1] = CUM[s] + needFor(s);

  // xp → 등급 정보
  function rank(xp) {
    xp = Math.max(0, xp | 0);
    var step = 1;
    for (var k = STEPS; k >= 1; k--) { if (xp >= CUM[k]) { step = k; break; } }
    var ti = Math.floor((step - 1) / 3);
    var sub = (step - 1) % 3;
    var need = needFor(step);
    var into = xp - CUM[step];
    return {
      step: step,                       // 1~30
      tier: ti,                         // 0~9
      tierName: TIERS[ti].name,
      emoji: TIERS[ti].emoji,
      sub: ROMAN[sub],
      label: TIERS[ti].name + ' ' + ROMAN[sub],
      xp: xp,
      into: into,                       // 이 계단에서 쌓은 XP
      need: need,                       // 다음 계단까지 필요 XP (마지막이면 Infinity)
      ratio: (need === Infinity) ? 1 : Math.min(1, into / need),
      max: step >= STEPS
    };
  }

  // 판 결과 반영 → 승급 여부까지 (강등 없음: add 는 항상 xp 증가)
  function add(prevXp, gained) {
    var before = rank(prevXp);
    var after = rank(Math.max(0, (prevXp | 0)) + Math.max(0, gained | 0));
    return {
      before: before, after: after,
      promoted: after.step > before.step,          // 승급 = 풀스크린 연출 트리거
      tierUp: after.tier > before.tier             // 단계(파트너 진화) 상승
    };
  }

  root.KBXP = {
    XP: XP, TIERS: TIERS, STEPS: STEPS,
    gain: gain, rank: rank, add: add, needFor: needFor,
    _cum: CUM
  };
})();
