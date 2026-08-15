/* =============================================================
 * templates/math_morning.js — 아침활동 수학: 하루 1차시
 *
 * 한자(hanja.js)와 같은 자리를 맡되, 성격이 다르다.
 *   한자는 글자 원장에서 문항을 새로 짜지만,
 *   수학은 **이미 있는 케이퀴즈 차시 세트를 그대로 물려쓴다.**
 *   그 차시들은 자기주도 학습 차시와 같은 키 체계(g4_math_u6_l02)라,
 *   아침에 푸는 문제가 그날 교과 진도와 어긋나지 않는다.
 *
 * 키: g{학년}_math_c{일차3자리}   예) g3_math_c001 … g3_math_c044
 *   ma_today 의 키 조립(`g||학년||_||과목||_c||일차`)이 과목을 가리지 않으므로
 *   SQL 쪽은 ma_max_step 에 math 행을 더하는 것 말고 손댈 게 없다.
 *
 * 문항 구성 = 오늘 차시 + 이전 차시 복습.
 *   ★ 복습을 섞는 건 교육적 취향이 아니라 **필요**다. 215차시 중 10차시는
 *     출제 풀이 좁아 혼자서는 10문항을 못 채우고, 코어의 중복 허용 폴백이 돌아
 *     같은 문제를 최대 7번까지 다시 낸다(g3_math_u2_l02 는 3종뿐).
 *     이전 차시를 섞으면 그 구멍이 메워지고, 매일 앞 내용을 조금씩 되짚게 된다.
 *   1일차는 복습할 것이 없어 오늘 차시만으로 짠다(하루뿐이라 감수 — 한자와 같은 판단).
 *
 * 이 파일은 g?_math_u?.js 들이 **모두 등록된 뒤에** 로드되어야 한다.
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register, getDef = CORE.getDef;

  /* 학년별 차시 순서 = 단원 번호 → 차시 번호 (교과 진도 순서 그대로).
     한자와 달리 재배열하지 않는다 — 수학은 앞 단원을 알아야 뒤 단원이 풀리므로
     교과가 정한 차례가 곧 난이도 사다리다. */
  var ORDER = {};   // { 학년: [lessonKey, ...] }

  /* 차시 키 수집. 대부분 g{g}_math_u{u}_l{ll} 이지만, 두 차시를 한 벌로 묶어
     등록한 합본 키도 있다(예: g1_math_u5_l02_03 — l02·l03 이 따로 없다).
     패턴을 좁게 잡으면 그런 차시가 통째로 빠지므로 합본도 함께 훑는다. */
  function collect(grade) {
    var found = [], seen = {};
    function tryKey(k, u, l) {
      if (seen[k] || !getDef(k)) return;
      seen[k] = 1; found.push({ u: u, l: l, key: k });
    }
    for (var u = 1; u <= 9; u++) {
      for (var l = 1; l <= 20; l++) {
        var pad = ('0' + l).slice(-2);
        tryKey('g' + grade + '_math_u' + u + '_l' + pad, u, l);
        for (var m = l + 1; m <= 20; m++) {                    // 합본 l02_03 꼴
          tryKey('g' + grade + '_math_u' + u + '_l' + pad + '_' + ('0' + m).slice(-2), u, l);
        }
      }
    }
    found.sort(function (a, b) { return a.u - b.u || a.l - b.l; });
    return found.map(function (x) { return x.key; });
  }

  /* 복습으로 얹을 템플릿 수: 오늘 것의 절반쯤(최소 2). 오늘 것이 주인공이고
     복습은 거들 뿐 — 비율이 뒤집히면 그날 배운 것을 짚는 활동이 아니게 된다. */
  function reviewQuota(todayCount) {
    return Math.max(2, Math.floor(todayCount / 2));
  }

  /* 이전 차시 풀에서 결정적으로 고른다(일차가 같으면 언제 열어도 같은 구성).
     최근 것에 무게를 둔다 — 어제 배운 걸 오늘 다시 보는 게 지난달 것보다 낫다. */
  function pickReview(prevKeys, quota, dayNo) {
    var pool = [];
    prevKeys.slice().reverse().forEach(function (k, idx) {
      var d = getDef(k);
      if (!d || !d.templates) return;
      var weight = idx < 3 ? 3 : (idx < 8 ? 2 : 1);      // 최근 3차시 ×3, 그 앞 5차시 ×2
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

  [1, 2, 3, 4, 5, 6].forEach(function (grade) {
    var keys = collect(grade);
    if (!keys.length) return;
    ORDER[grade] = keys;

    keys.forEach(function (key, idx) {
      var dayNo = idx + 1;
      var today = getDef(key);
      if (!today || !today.templates) return;

      var tpls = today.templates.slice();
      var rev = pickReview(keys.slice(0, idx), reviewQuota(tpls.length), dayNo);
      var all = tpls.concat(rev);

      reg('g' + grade + '_math_c' + ('00' + dayNo).slice(-3), {
        source: grade + '학년 아침수학 ' + dayNo + '일차 — ' + (today.source || key),
        // 고정 문항은 물려받지 않는다. 차시별 고정 문항은 그 차시 화면 맥락에 기대어
        // 쓰인 것이 있어(그림·표 참조 등) 아침활동 단독 화면에서 깨질 수 있다.
        fixed: [],
        templates: all,
        // 되짚기용 메타 — 아침활동 화면이 "오늘은 어느 차시" 를 보여줄 수 있게.
        origin: key
      });
    });
  });

  /* 일차 → 실제 차시 키. 화면이 "더 공부하기" 로 자기주도 차시를 이어줄 때 쓴다. */
  CORE.mathMorningOrder = function (grade) { return (ORDER[grade] || []).slice(); };
});
