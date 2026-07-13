/* ============================================================================
   K-edu 케이배틀 — 학부모 리포트 (kb-report.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제1조 ②(**유료는 오직 학부모의 '보는 눈'** — 추가 수집 없음),
             제8조(최소 수집), 제9조(answers 가 모든 파생 가치의 뿌리).

   ⚠️ 이 층에서 제일 중요한 것은 기능이 아니라 **선(線)**이다.
      **리포트가 아이를 압박하는 도구가 되면 케이배틀 전체가 무너진다.**
      아이가 "엄마가 볼까 봐" 게임을 피하는 순간, 제0조(산골짜기 아이도 재미있게 공부한다)가 죽는다.

   그래서 이 리포트에 **없는 것**들 — 넣지 않기로 한 게 아니라 **넣으면 안 되는 것**:
      ⛔ 반 평균·석차·순위·백분위    (다른 아이와 비교하는 순간 이건 성적표가 된다)
      ⛔ 점수·XP·등급               (게임 안의 보상은 아이 것이다. 부모의 평가 잣대가 아니다)
      ⛔ "못한다"·"부족하다"·"뒤처진다" 같은 말 (아직 만나는 중인 개념이 있을 뿐이다)
      ⛔ 개별 문제의 정오 목록        (감시가 된다)

   있는 것 — 전부 **아이 자신의 변화**:
      ① 요즘 어떤 개념을 만나고 있나 (약한 개념 = 같이 볼 것 1~2개)
      ② 잘 아는 개념 (칭찬할 자리)
      ③ 성장 곡선 (지난주의 아이와 이번 주의 아이)
      ④ 꾸준함 (온 날 수)
      ⑤ 부모가 할 수 있는 일 한 가지

   ⭐ 새로 모으는 데이터는 0. 전부 `KBAnswers` 의 뷰다(제1조 ②).

   공개 API:
     KBReport.build(profile, rows)  → 리포트 데이터 한 벌
     KBReport.linkCode()            → 6자리 연결 코드 생성 (아이가 부모에게 준다)
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBReport) return;

  var MIN_N = 4;          // 이만큼은 풀어야 개념 판단을 한다 (2문제 틀렸다고 "약점"이라 하지 않는다)

  function pct(x) { return Math.round(x * 100); }

  /* 연결 코드 — 아이가 스스로 부모를 연결한다.
     ⛔ 부모 계정·이메일·전화 없음(제8조). 코드 하나가 전부다.
     아이가 주지 않으면 부모도 못 본다 — 그게 맞다. */
  function linkCode() {
    var A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // 헷갈리는 글자(I·O·0·1·L) 제외
    var s = '';
    for (var i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
    return s;
  }

  function build(profile, rows) {
    rows = rows || [];
    var KBA = root.KBAnswers;
    var p = profile || {};

    var n = rows.length;
    var ok = rows.filter(function (r) { return r.correct; }).length;

    var concepts = (KBA ? KBA.byConcept(rows) : []).filter(function (c) { return c.n >= MIN_N; });
    var weak = concepts.filter(function (c) { return c.rate < 0.7; }).slice(0, 2);      // 같이 볼 것 최대 2개
    var strong = concepts.filter(function (c) { return c.rate >= 0.85; }).slice(-3).reverse();

    var g = (KBA ? KBA.growth(rows) : []);
    var lastTwo = g.slice(-2);
    var trend = null;
    if (lastTwo.length === 2 && lastTwo[0].n >= MIN_N && lastTwo[1].n >= MIN_N) {
      trend = { from: lastTwo[0].rate, to: lastTwo[1].rate, delta: lastTwo[1].rate - lastTwo[0].rate };
    }

    return {
      name: p.name || '',
      days: (p.stats && p.stats.days) | 0,          // 케이배틀에 온 날 (꾸준함)
      played: (p.stats && p.stats.played) | 0,
      solved: n,
      rate: n ? ok / n : 0,
      weak: weak,                                   // [{concept, n, ok, rate}]
      strong: strong,
      growth: g,                                    // 주별 [{week, n, ok, rate}]
      trend: trend,
      badges: (p.badges || []).length,
      enough: n >= 10,                              // 아직 판단할 만큼 안 풀었으면 말하지 않는다
      todo: todo(weak, p),
      line: line(n, trend, weak, p)
    };
  }

  /* 부모가 할 수 있는 일 한 가지. "시켜라"가 아니라 "같이 보라". */
  function todo(weak, p) {
    if (!weak.length) {
      return { head: '오늘은 같이 볼 게 없어요',
               body: '아이가 만난 개념을 대체로 잘 이해하고 있어요. 잘하고 있다고 한 번 말해 주세요.' };
    }
    var c = weak[0];
    return {
      head: '「' + c.concept + '」을(를) 같이 한 번 보세요',
      body: '아직 익숙해지는 중인 개념이에요. 케이배틀의 「틀린 문제 다시」를 아이와 함께 한 판만 해 보면 충분해요. ' +
            '(아이가 푸는 건 언제나 무료예요)'
    };
  }

  /* 한 줄 요약 — 절대 평가가 아니라 서술. "못한다"는 말은 쓰지 않는다. */
  function line(n, trend, weak, p) {
    if (n < 10) return (p.name || '아이') + '이(가) 이제 막 시작했어요. 며칠만 더 지켜봐 주세요.';
    if (trend && trend.delta >= 0.08) return '지난주보다 더 잘 풀고 있어요. 흐름이 좋아요.';
    if (trend && trend.delta <= -0.08) return '이번 주엔 조금 어려운 문제를 만난 것 같아요. 새 단원에 들어갔을 수도 있어요.';
    if (!weak.length) return '만나는 개념들을 고르게 잘 이해하고 있어요.';
    return '대체로 잘 따라가고 있고, 「' + weak[0].concept + '」만 아직 익숙해지는 중이에요.';
  }

  root.KBReport = {
    build: build, linkCode: linkCode, MIN_N: MIN_N,
    // ⛔ 있어서는 안 되는 것들 — 코드로 못 박는다(누가 나중에 추가하려 하면 이 목록을 보게)
    FORBIDDEN: ['반 평균', '석차', '순위', '백분위', '점수', 'XP', '등급', '문제별 정오 목록']
  };
})();
