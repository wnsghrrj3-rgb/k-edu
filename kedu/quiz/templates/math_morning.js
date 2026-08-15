/* =============================================================
 * templates/math_morning.js — 아침활동 수학: 하루 1차시
 *
 * ★ 9.7차 전면 개편(준호 지시): 사다리의 기준은 **자기주도 본차시**다.
 *   케이퀴즈 세트가 있는 차시만 긁어모으던 방식(8차)은 진도에 구멍을 냈다
 *   (4학년 삼각형·막대그래프 단원이 통째로 건너뛰어짐). 이제는
 *   templates/math_lessons.js(자동 생성 명세, 자기주도 파일시스템이 원천)가
 *   하루 1차시 사다리를 정하고, 케이퀴즈 세트는 이름 대조로 매달려 있다.
 *
 * 하루의 문항 구성 3가지(명세의 quiz 필드와 위치가 정한다):
 *   set    — 그 차시의 케이퀴즈 세트 + 이전 세트 복습(오늘이 주인공, 복습은 절반쯤)
 *   review — 그 차시 세트가 없음: 그날까지 나온 세트들로 복습 구성.
 *            학교에서 그 단원을 배우는 동안 아침엔 앞 내용을 되짚는다 —
 *            구멍을 조용히 건너뛰는 것보다 정직하다.
 *   borrow — 학기 초라 되짚을 것도 없음: 같은 단원에서 가장 가까운 세트를
 *            당겨쓴다(g1 은 1~3일째가 여기 해당).
 *
 * 키: g{학년}_math_c{일차3자리}. ma_today 의 키 조립은 과목 무관이라 SQL 은
 * ma_max_step 의 일수만 맞으면 된다(9.7차: 44/52/55/54/53/51 — 자기주도 차시 수).
 *
 * 로드 순서: g?_math_u?.js 전부 → math_lessons.js → 이 파일.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register, getDef = CORE.getDef;

  var LESSONS = (typeof module === 'object' && typeof require === 'function')
    ? require('./math_lessons.js')
    : (typeof self !== 'undefined' ? self : this).KEDU_MATH_LESSONS;
  if (!LESSONS) return;   // 명세 없이 돌면 사다리가 8차 방식으로 오염되느니 조용히 아무것도 안 한다(검사기가 잡음)

  /* 복습으로 얹을 템플릿 수: 오늘 것의 절반쯤(최소 2). 오늘 것이 주인공이고
     복습은 거들 뿐 — 비율이 뒤집히면 그날 배운 것을 짚는 활동이 아니게 된다. */
  function reviewQuota(todayCount) {
    return Math.max(2, Math.floor(todayCount / 2));
  }

  /* 이전 세트 풀에서 결정적으로 고른다(일차가 같으면 언제 열어도 같은 구성).
     최근 것에 무게를 둔다 — 어제 배운 걸 오늘 다시 보는 게 지난달 것보다 낫다. */
  function pickReview(prevKeys, quota, dayNo) {
    var pool = [];
    prevKeys.slice().reverse().forEach(function (k, idx) {
      var d = getDef(k);
      if (!d || !d.templates) return;
      var weight = idx < 3 ? 3 : (idx < 8 ? 2 : 1);      // 최근 3세트 ×3, 그 앞 5세트 ×2
      for (var w = 0; w < weight; w++) {
        d.templates.forEach(function (t) { pool.push(t); });
      }
    });
    if (!pool.length) return [];
    var out = [], seen = [];
    var step = 7;                                        // 결정적 훑기(시드 없이 재현)
    for (var i = 0, p = (dayNo * 13) % pool.length; out.length < quota && i < pool.length * 2; i++) {
      var t = pool[p];
      if (seen.indexOf(t) < 0) { seen.push(t); out.push(t); }
      p = (p + step) % pool.length;
    }
    return out;
  }

  var ORDER = {};   // { 학년: [일차 메타, ...] }

  /* 사람이 읽는 차시 이름 — '3단원 덧셈을알아볼까요' / 제목 없는 옛 형식은 '1단원 6차시' */
  function label(day) {
    var lNice = day.l.replace(/^0+/, '').replace(/_0?/g, '·');
    return day.unitNo + '단원 ' + (day.title || (lNice + '차시'));
  }

  [1, 2, 3, 4, 5, 6].forEach(function (grade) {
    var units = LESSONS[grade] || LESSONS[String(grade)];
    if (!units) return;

    /* 명세를 하루 1차시 사다리로 편다 */
    var days = [];
    units.forEach(function (u) {
      u.lessons.forEach(function (les) {
        days.push({ unitNo: u.unitNo, unitName: u.name, l: les.l, title: les.title, quiz: les.quiz });
      });
    });

    var matchedSoFar = [];   // 그날까지 나온 케이퀴즈 세트 키(복습 풀)

    days.forEach(function (day, idx) {
      var dayNo = idx + 1;
      var tpls, mode;

      var primary = day.quiz ? getDef(day.quiz) : null;
      if (primary && primary.templates) {
        mode = 'set';
        tpls = primary.templates.slice()
          .concat(pickReview(matchedSoFar, reviewQuota(primary.templates.length), dayNo));
      } else if (matchedSoFar.length) {
        mode = 'review';
        // 세트 없는 날 — 그날까지의 풀에서 넉넉히(중복 0 으로 10문항이 서게) 담는다
        tpls = pickReview(matchedSoFar, 14, dayNo);
      } else {
        mode = 'borrow';
        // 학기 맨 앞이라 복습 풀도 없음 — 같은 단원에서 가장 가까운 세트를 당겨쓴다
        var lend = null;
        for (var j = idx + 1; j < days.length && days[j].unitNo === day.unitNo; j++) {
          if (days[j].quiz && getDef(days[j].quiz)) { lend = getDef(days[j].quiz); break; }
        }
        if (!lend) return;   // 이 학년 구조에선 없는 경우 — 검사기가 일수 부족으로 잡는다
        tpls = lend.templates.slice();
      }

      day.mode = mode;
      reg('g' + grade + '_math_c' + ('00' + dayNo).slice(-3), {
        /* ★ 원 차시 source 는 객체라 그대로 이어붙이면 [object Object] (9.6차 실측) —
           여기서는 명세의 단원명·차시 제목으로 사람이 읽는 문구를 직접 만든다. */
        source: grade + '학년 아침수학 ' + dayNo + '일차 — ' + label(day)
          + (mode === 'review' ? ' (복습으로 구성)' : ''),
        fixed: [],           // 고정 문항은 물려받지 않는다 — 그림·표 등 원 화면 맥락에 기대는 것이 있음
        templates: tpls,
        origin: day.quiz,    // null 이면 그날은 복습 구성
        lesson_meta: { unitNo: day.unitNo, unitName: day.unitName, l: day.l, title: day.title, mode: mode }
      });

      if (day.quiz && primary) matchedSoFar.push(day.quiz);
    });

    ORDER[grade] = days;
  });

  /* 일차 메타 목록. 화면이 "오늘은 어느 단원 어느 차시" 를 제목으로 보여줄 때 쓴다.
     (9.7차에서 반환형이 차시 키 배열 → 메타 객체 배열로 바뀜 — 사용처 전수 개정함) */
  CORE.mathMorningOrder = function (grade) { return (ORDER[grade] || []).slice(); };
});
