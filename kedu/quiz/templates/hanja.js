/* =============================================================
 * templates/hanja.js — 케이퀴즈: 아침활동 한자 (학년 × 회차 자동 등록)
 * 데이터: templates/hanja_data.js  ·  엔진: kquiz-core.js
 *
 * 등록 키: g{학년}_hanja_s{회차2자리}   예) g1_hanja_s01 … g1_hanja_s05
 *   회차 1개 = 새 한자 10자. 문항은 새 글자 위주에 이전 회차 복습을 섞는다
 *   (라운드로빈 결과 대략 신규 7 : 복습 3) — 아침활동은 매일 하므로 누적이 생명.
 *
 * 문항 5형
 *   t_c2hunum  한자 → 훈·음 고르기        (choice)
 *   t_hunum2c  훈·음 → 한자 고르기        (choice)
 *   t_eum      한자 → 음 쓰기             (short)
 *   t_word     낱말 속 한자 찾기          (choice, 대표낱말 있는 글자만)
 *   t_ox       훈·음 짝 맞는지            (ox)
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz, root.KQuiz.hanjaData);
})(typeof self !== 'undefined' ? self : this, function (KQuiz, DATA) {
  'use strict';
  var CORE = KQuiz.core;
  var reg = CORE.register;

  function hunum(x) { return x.hun + ' ' + x.eum; }

  /* 풀에서 기준 글자와 다른 것 n개 */
  function others(pool, ch, rng, n) {
    var p = pool.filter(function (x) { return x.c !== ch.c; });
    return rng.shuffle(p).slice(0, n);
  }

  /* ── 문항 템플릿 생성기 — pool(출제 대상)만 갈아끼우면 신규·복습 겸용 ── */

  function tplC2Hunum(pool, all, tag, diff) {
    return {
      id: 't_c2hunum_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '훈음 익히기',
      gen: function (rng) { return { x: rng.pick(pool) }; },
      render: function (p) { return '「' + p.x.c + '」의 훈(뜻)과 음(소리)으로 알맞은 것은?'; },
      answer: function (p) { return hunum(p.x); },
      distractors: function (p, ans, rng) {
        return others(all, p.x, rng, 3).map(hunum);
      },
      validate: function (p, ans) { return !!ans && ans.indexOf(' ') > 0; },
      explain: function (p) { return '「' + p.x.c + '」은(는) 「' + hunum(p.x) + '」이에요.'; }
    };
  }

  function tplHunum2C(pool, all, tag, diff) {
    return {
      id: 't_hunum2c_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '한자 알아보기',
      gen: function (rng) { return { x: rng.pick(pool) }; },
      render: function (p) { return '「' + hunum(p.x) + '」을(를) 나타내는 한자는?'; },
      answer: function (p) { return p.x.c; },
      distractors: function (p, ans, rng) {
        return others(all, p.x, rng, 3).map(function (o) { return o.c; });
      },
      validate: function (p) { return !!p.x.c; },
      explain: function (p) { return '「' + hunum(p.x) + '」은(는) 「' + p.x.c + '」(으)로 써요.'; }
    };
  }

  function tplEum(pool, tag, diff) {
    return {
      id: 't_eum_' + tag, type: 'pick', itemType: 'short', difficulty: diff,
      concept: '음 읽기',
      gen: function (rng) { return { x: rng.pick(pool) }; },
      render: function (p) { return '「' + p.x.c + '」을(를) 소리 내어 읽으면? (음만 쓰세요)'; },
      answer: function (p) { return p.x.eum; },
      validate: function (p) { return !!p.x.eum; },
      explain: function (p) { return '「' + p.x.c + '」의 음은 「' + p.x.eum + '」이에요. (훈: ' + p.x.hun + ')'; }
    };
  }

  function tplWord(pool, all, tag, diff) {
    var wp = pool.filter(function (x) { return x.word; });
    if (!wp.length) return null;
    return {
      id: 't_word_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '낱말 속 한자',
      gen: function (rng) { return { x: rng.pick(wp) }; },
      render: function (p) {
        return '「' + p.x.word + '(' + p.x.wordKo + ')」에서 「' + p.x.eum + '」에 해당하는 한자는?';
      },
      answer: function (p) { return p.x.c; },
      distractors: function (p, ans, rng) {
        return others(all, p.x, rng, 3).map(function (o) { return o.c; });
      },
      validate: function (p) { return !!p.x.word; },
      explain: function (p) {
        return '「' + p.x.word + '」은(는) 「' + p.x.wordKo + '」이라는 뜻이고, 「' + p.x.eum + '」은 「' + p.x.c + '」예요.';
      }
    };
  }

  function tplOx(pool, all, tag, diff) {
    return {
      id: 't_ox_' + tag, type: 'pick', itemType: 'ox', difficulty: diff,
      concept: '훈음 확인',
      gen: function (rng) {
        var x = rng.pick(pool);
        var truth = rng.int(0, 1) === 1;
        var shown = truth ? x : (others(all, x, rng, 1)[0] || x);
        return { x: x, shown: shown, truth: shown.c === x.c };
      },
      render: function (p) {
        return '「' + p.x.c + '」의 훈과 음은 「' + hunum(p.shown) + '」이다.';
      },
      answer: function (p) { return p.truth; },
      validate: function (p) { return !!p.shown; },
      explain: function (p) {
        return p.truth ? '맞아요. 「' + p.x.c + '」은(는) 「' + hunum(p.x) + '」이에요.'
                       : '아니에요. 「' + p.x.c + '」은(는) 「' + hunum(p.x) + '」이고, 「' + hunum(p.shown) + '」은(는) 「' + p.shown.c + '」예요.';
      }
    };
  }

  /* ── 학년 × 회차 전수 등록 ─────────────────────────────────── */
  DATA.grades().forEach(function (grade) {
    var all = DATA.all(grade);
    var n = DATA.stepCount(grade);
    for (var s = 1; s <= n; s++) {
      var cur = DATA.step(grade, s);                       // 이번 회차 새 글자 10자
      var prev = DATA.upto(grade, s - 1);                   // 이전 회차 누적(복습)
      var key = 'g' + grade + '_hanja_s' + (s < 10 ? '0' + s : s);

      var tpls = [
        tplC2Hunum(cur, all, 'new', 1),
        tplHunum2C(cur, all, 'new', 1),
        tplWord(cur, all, 'new', 2),
        tplEum(cur, 'new', 2)
      ];
      if (prev.length) {                                    // 2회차부터 복습 섞임
        tpls.push(tplC2Hunum(prev, all, 'rev', 2));
        tpls.push(tplOx(prev, all, 'rev', 3));
      } else {
        tpls.push(tplOx(cur, all, 'new', 3));
      }

      reg(key, {
        source: grade + '학년 아침한자 ' + s + '회차',
        fixed: [],
        templates: tpls.filter(Boolean)
      });
    }
  });
});
