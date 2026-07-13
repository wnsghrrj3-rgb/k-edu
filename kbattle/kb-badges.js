/* ============================================================================
   K-edu 케이배틀 — 배지 (kb-badges.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제6조(**배지가 파트너의 모습을 결정한다** — 진화 분기),
             제1조 ②(유료화를 위해 더 모으는 건 없다), 제5조(강등 없음), KB-1(오답에 벌 없음).

   ⭐ 배지는 새로 모으는 게 아니다.
      ★3 정답 수도, 협동 성공 횟수도, 매일 왔는지도 **이미 쌓여 있다.**
      배지는 그걸 **다르게 본 것**일 뿐이다 — answers·프로필 통계의 또 하나의 뷰.

   ⭐ 배지 4종은 헌법 제6조가 이미 정해 뒀다 (파트너 외형 분기):
        ★3 정복   → 뿔        🦄
        협동 다수 → 빛 오라   🌟
        매일 참여 → 별가루 꼬리 ✨
        전 유형 정답 → 무지개 무늬 🌈
      **최종 형태가 아이마다 달라진다 → 비교가 아니라 서로 구경이 된다**(제6조).
      파트너가 붙는 날(7번) 이 네 개를 그대로 외형에 꽂으면 된다. 자리는 지금 판다.

   원칙:
     - **못 딴 배지에 벌은 없다.** 회색으로 보여주되 "실패"라 말하지 않는다(KB-1의 정신).
     - **한 번 딴 배지는 안 사라진다** (제5조 강등 없음과 같은 축).
     - 개인 배지는 **타인에게 안 보인다** (KB-2 — 게임 중 화면엔 닉네임·아바타뿐).

   공개 API:
     KBBadges.CATALOG               배지 정의 목록
     KBBadges.evaluate(profile, rows)  지금 자격이 되는 배지 id 배열
     KBBadges.newly(profile, rows)     이번에 새로 딴 것 (profile.badges 와의 차집합)
     KBBadges.get(id)               정의 하나
     KBBadges.branchOf(badges)      파트너 외형 분기 목록 (제6조 — 7번에서 소비)
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBBadges) return;

  var TYPES = ['mcq', 'ox', 'numpad', 'order'];

  /* 배지 정의.
     branch: true = 파트너 외형을 바꾸는 배지(헌법 제6조). 나머지는 인정 배지. */
  var CATALOG = [
    { id: 'first', emoji: '🐣', name: '첫걸음', desc: '케이배틀 첫 판을 끝냈어요',
      test: function (p) { return (p.stats.played | 0) >= 1; } },

    { id: 'horn', emoji: '🦄', name: '뿔', desc: '어려운 문제(★3)를 20개 맞혔어요',
      branch: true, goal: 20,
      count: function (p) { return p.stats.hard | 0; },
      test: function (p) { return (p.stats.hard | 0) >= 20; } },

    { id: 'aura', emoji: '🌟', name: '빛 오라', desc: '친구들과 힘을 합쳐 5번 해냈어요',
      branch: true, goal: 5,
      count: function (p) { return p.stats.coop | 0; },
      test: function (p) { return (p.stats.coop | 0) >= 5; } },

    { id: 'tail', emoji: '✨', name: '별가루 꼬리', desc: '7일 동안 케이배틀에 왔어요',
      branch: true, goal: 7,
      count: function (p) { return p.stats.days | 0; },
      test: function (p) { return (p.stats.days | 0) >= 7; } },

    { id: 'rainbow', emoji: '🌈', name: '무지개 무늬', desc: '네 가지 문제 유형을 모두 맞혔어요',
      branch: true, goal: 4,
      count: function (p, rows) { return typesCleared(rows).length; },
      test: function (p, rows) { return typesCleared(rows).length >= TYPES.length; } },

    { id: 'comeback', emoji: '🔁', name: '다시 만난 문제', desc: '틀렸던 문제를 다시 만나 5개 맞혔어요',
      goal: 5,
      count: function (p, rows) { return comebacks(rows); },
      test: function (p, rows) { return comebacks(rows) >= 5; } },

    { id: 'streak10', emoji: '🔥', name: '열 연속', desc: '한 판에서 10문제를 연속으로 맞혔어요',
      goal: 10,
      count: function (p) { return p.stats.bestStreak | 0; },
      test: function (p) { return (p.stats.bestStreak | 0) >= 10; } },

    { id: 'master', emoji: '🧠', name: '개념 주인', desc: '한 개념을 10문제 이상 풀고 9할을 맞혔어요',
      count: function (p, rows) { return mastered(rows).length; },
      test: function (p, rows) { return mastered(rows).length >= 1; } }
  ];

  /* ---- 판정 재료 (전부 이미 있는 데이터) ---- */
  function typesCleared(rows) {
    var seen = {};
    (rows || []).forEach(function (r) { if (r.correct && TYPES.indexOf(r.type) >= 0) seen[r.type] = 1; });
    return Object.keys(seen);
  }
  // "틀렸던 문제를 오답 세트에서 다시 만나 맞힌" 횟수 — 극복의 정의(제9조 wrongSet 과 같은 축)
  function comebacks(rows) {
    var n = 0;
    (rows || []).forEach(function (r) { if (r.kind === 'wrongset' && r.correct) n++; });
    return n;
  }
  function mastered(rows) {
    var KBA = root.KBAnswers;
    if (!KBA || !rows || !rows.length) return [];
    return KBA.byConcept(rows).filter(function (c) {
      return c.n >= 10 && c.rate >= 0.9;
    }).map(function (c) { return c.concept; });
  }

  function safe(p) {
    p = p || {};
    p.stats = p.stats || {};
    p.badges = p.badges || [];
    return p;
  }

  function evaluate(profile, rows) {
    var p = safe(profile);
    var out = [];
    CATALOG.forEach(function (b) {
      var ok = false;
      try { ok = !!b.test(p, rows || []); } catch (e) { ok = false; }
      if (ok) out.push(b.id);
    });
    // 한 번 딴 배지는 안 사라진다 (제5조와 같은 축 — 강등 없음)
    p.badges.forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); });
    return out;
  }

  function newly(profile, rows) {
    var p = safe(profile);
    var have = {};
    p.badges.forEach(function (id) { have[id] = 1; });
    return evaluate(p, rows).filter(function (id) { return !have[id]; });
  }

  function get(id) {
    return CATALOG.filter(function (b) { return b.id === id; })[0] || null;
  }

  // 진행도 (0~1). goal 이 없는 배지는 딴 것만 1.
  function progress(id, profile, rows) {
    var b = get(id); if (!b) return 0;
    var p = safe(profile);
    if (!b.goal || !b.count) return b.test(p, rows || []) ? 1 : 0;
    var n = 0;
    try { n = b.count(p, rows || []) | 0; } catch (e) { n = 0; }
    return Math.max(0, Math.min(1, n / b.goal));
  }

  // 파트너 외형 분기 (헌법 제6조 — 7번 파트너 시스템이 소비할 자리)
  function branchOf(badges) {
    var have = {};
    (badges || []).forEach(function (id) { have[id] = 1; });
    return CATALOG.filter(function (b) { return b.branch && have[b.id]; })
                  .map(function (b) { return b.id; });
  }

  root.KBBadges = {
    CATALOG: CATALOG, evaluate: evaluate, newly: newly, get: get,
    progress: progress, branchOf: branchOf, TYPES: TYPES,
    _mastered: mastered, _comebacks: comebacks
  };
})();
