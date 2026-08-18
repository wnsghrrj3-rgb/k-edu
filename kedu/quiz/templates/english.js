/* =============================================================
 * templates/english.js — 케이퀴즈: 아침활동 영어 (학년 × 일차 자동 등록)
 * 데이터: templates/english_data.js  ·  엔진: kquiz-core.js
 * 정본 설계: handoff/설계-아침영어-v1.md §5 — 이 파일이 그 문항 5형의 실물이다.
 *
 * 등록 키: g{학년}_english_c{일차3자리}   예) g3_english_c001 … g3_english_c040
 *   하루 = 새 문장 1개. 문항은 오늘 문장을 여러 각도로 짚고, 나머지는
 *   그동안 배운 문장 복습으로 채운다 — 매일 하는 활동은 누적이 생명.
 *
 * 문항 6형(설계 §5)
 *   t_order  낱말 카드 배열 → 바른 문장 고르기      (choice)
 *   t_blank  빈칸에 알맞은 말                        (choice)
 *   t_ko2en  뜻 → 영어 문장                          (choice)
 *   t_en2ko  영어 문장 → 뜻                          (choice)  🔊 다시 듣기
 *   t_ox     문장·뜻 짝이 맞는가                     (ox)      🔊 다시 듣기
 *   t_listen 듣고 알맞은 뜻 고르기                   (choice)  🔊 소리가 곧 문제
 *
 * ★소리 규약(D8-ⓓ) — 소리는 **이미 화면에 다 보이는 문장에만** 붙는다.
 *   t_order·t_blank·t_ko2en 은 정답이 문장 자체(또는 그 일부)라서 읽어 주면 답이 샌다.
 *   t_en2ko·t_ox 는 문장이 발문에 그대로 있고 답은 뜻 쪽이라 읽어 줘도 아무것도 안 샌다.
 *   t_listen 만 예외로 문장을 발문에서 빼고 소리에 싣는다(그래야 듣기다).
 *
 * ★어휘 사다리(설계 §3, 헌법급)를 문항까지 연장한다.
 *   발문·보기·해설에 나오는 영어는 **그날까지 누적 단어장 안에서만** 나온다.
 *   그래서 오답 보기는 상상해서 만들지 않고 그날까지의 재료(배운 타일·배운 문장·
 *   화이트리스트 인명)에서만 뽑는다. test_english_morning.js 가 전수 강제한다.
 *
 * ★보기 개수를 강제하지 않는다(수학 9차 교훈, 설계 §5).
 *   재료가 얇은 초반 일차에서 억지로 4개를 채우려면 안 배운 말을 지어내야 한다 —
 *   그럴 바엔 보기가 3개인 편이 정직하다. core 의 buildChoices 가 있는 만큼만 세운다.
 *
 * ★1일차의 한계를 숨기지 않는다.
 *   문장이 하나뿐인 날은 만들 수 있는 서로 다른 발문 수가 문장 길이에 묶인다.
 *   (예: 3타일 문장 → 배열 5 + 빈칸 3 + 짝짓기 약간). 10문항을 채우다 보면
 *   같은 발문이 다시 나올 수 있다. 없는 재료를 지어내는 것보다 낫다고 보고 허용하며,
 *   검사기는 2일차부터 발문 중복 0 을 강제한다(한자 트랙과 같은 판단).
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz, root.KQuiz.englishData);
})(typeof self !== 'undefined' ? self : this, function (KQuiz, DATA) {
  'use strict';
  var CORE = KQuiz.core || KQuiz;
  var reg = CORE.register;

  /* ── 표시형 도우미 ────────────────────────────────────────────
     타일은 구두점을 달고 있다("Hello," · "Ben."). 빈칸 문항은 구두점을
     빈칸 밖에 남겨야 자연스럽다 — 그래서 앞말과 꼬리를 나눈다. */
  function tailOf(tile) { var m = String(tile).match(/[.,!?]+$/); return m ? m[0] : ''; }
  function bareOf(tile) { return String(tile).replace(/[.,!?]+$/, ''); }

  /* 하루 → 그날 얻는 문장·뜻 짝(본문 + 넓히기). 넓히기도 그날까지 재료로만
     만들어진 문장이라 짝짓기 문항의 정당한 재료다(설계 §6). */
  function pairsOf(day) {
    var out = [{ sent: day.sent, ko: day.ko, d: day.d }];
    if (day.expand) out.push({ sent: day.expand.sent, ko: day.expand.ko, d: day.d });
    return out;
  }

  /* ★대소문자 규약 — 빈칸 문항이 정답을 누설하지 않게.
     첫 낱말은 대문자로 시작한다. 오답을 등장한 형태 그대로 세우면 문장 첫 자리
     빈칸에서 "대문자로 시작하는 보기가 하나뿐"이라 뜻을 몰라도 정답이 보인다
     (원장 실측 126/160일). 그래서 보기를 빈칸 자리에 맞는 형태로 고쳐 세운다.
     늘 대문자인 낱말(I · I'm · 인명 · 고유명사)은 문장 중간 등장 형태로 판별한다 —
     목록을 손으로 적으면 원장이 자랄 때 반드시 어긋난다. */
  function capMidOf(days) {
    var m = {};
    days.forEach(function (dy) {
      dy.tiles.forEach(function (t, i) {
        if (i > 0) { var b = bareOf(t); if (/^[A-Z]/.test(b)) m[b] = 1; }
      });
    });
    ['I', "I'm", 'Ben', 'Mia', 'Kai'].forEach(function (w) { m[w] = 1; });
    return m;
  }
  function caseWith(capMid) {
    return function (w, atStart) {
      if (atStart) return w.charAt(0).toUpperCase() + w.slice(1);
      return capMid[w] ? w : (w.charAt(0).toLowerCase() + w.slice(1));
    };
  }

  /* ★짝 색인 — "이 문장이 이 뜻으로 성립하는가".
     같은 뜻을 가진 다른 표현이 원장에 실재한다(g3 Hello, I'm Ben. / Hi, I'm Ben. ·
     g5 May I come in? / May I go in?). 이런 문장을 오답 보기로 세우면 정답이 둘이 된다.
     원장을 깎는 대신 엔진이 피한다 — 같은 뜻으로 성립하는 것은 오답 후보에서 뺀다.
     색인은 그 학년 40일 전체로 만든다(오늘 기준으로만 보면 뒷날 문장과 충돌한다). */
  var SEP = '\u241F';
  function pairIndexOf(days) {
    var m = {};
    days.forEach(function (dy) {
      m[dy.sent + SEP + dy.ko] = 1;
      if (dy.expand) m[dy.expand.sent + SEP + dy.expand.ko] = 1;
    });
    return m;
  }

  /* 복습 가중 — 최근 3일 ×3, 그 앞 5일 ×2, 나머지 ×1.
     어제 배운 걸 오늘 다시 보는 게 지난달 것보다 낫다(math_morning.js 규약 계승). */
  function weighted(days) {
    var pool = [];
    days.slice().reverse().forEach(function (dy, idx) {
      var w = idx < 3 ? 3 : (idx < 8 ? 2 : 1);
      for (var i = 0; i < w; i++) pool.push(dy);
    });
    return pool;
  }
  function pairsOfMany(days) {
    var out = [];
    days.forEach(function (dy) { pairsOf(dy).forEach(function (p) { out.push(p); }); });
    return out;
  }

  /* 빈칸 오답 낱말 창고 — 그날까지 등장한 타일의 표시형 + 화이트리스트 인명.
     인명은 설계 §3 에서 "새 단어로 세지 않는" 상시 재료라 초반 일차의 보기를 지탱한다. */
  function wordBank(days) {
    var seen = {}, out = [];
    function put(w) { var k = w.toLowerCase(); if (!k || seen[k]) return; seen[k] = 1; out.push(w); }
    days.forEach(function (dy) { dy.tiles.forEach(function (t) { put(bareOf(t)); }); });
    ['Ben', 'Mia', 'Kai'].forEach(put);
    return out;
  }

  /* 정답과 겹치지 않는 후보 n개 */
  function othersBy(list, keyOf, ansKey, rng, n) {
    var seen = {}; seen[ansKey] = 1;
    var out = [];
    rng.shuffle(list).forEach(function (x) {
      if (out.length >= n) return;
      var k = keyOf(x);
      if (seen[k]) return;
      seen[k] = 1; out.push(x);
    });
    return out;
  }

  /* ── 문항 템플릿 생성기 — pool(출제 대상)만 갈아끼우면 신규·복습 겸용 ── */

  /* ① 배열: 흩어진 낱말 카드 → 바르게 늘어놓은 문장 고르기 */
  function tplOrder(pool, allPairs, idx, tag, diff) {
    if (!pool.length) return null;
    return {
      id: 't_order_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '문장 순서 잡기',
      gen: function (rng) {
        var x = rng.pick(pool);
        var correct = x.tiles.join(' ');
        /* 흩뿌린 순서는 정답과 달라야 문제가 된다 */
        var shown = x.tiles, tries = 0;
        do { shown = rng.shuffle(x.tiles); tries++; }
        while (shown.join(' ') === correct && tries < 12);
        /* 오답 = 다른 배열. 2타일 문장은 틀린 배열이 하나뿐이라
           모자란 만큼 그날까지 배운 다른 문장으로 채운다(지어내지 않는다). */
        var seen = {}, wrong = [];
        seen[correct] = 1;
        for (var i = 0; i < 40 && wrong.length < 3; i++) {
          var s = rng.shuffle(x.tiles).join(' ');
          if (!seen[s] && !idx[s + SEP + x.ko]) { seen[s] = 1; wrong.push(s); }
        }
        if (wrong.length < 3) {
          var lend = allPairs.filter(function (p) { return !idx[p.sent + SEP + x.ko]; });
          othersBy(lend, function (p) { return p.sent; }, correct, rng, 3 - wrong.length)
            .forEach(function (p) { if (!seen[p.sent]) { seen[p.sent] = 1; wrong.push(p.sent); } });
        }
        return { x: x, shown: shown, wrong: wrong };
      },
      render: function (p) {
        return '「' + p.x.ko + '」 낱말 카드를 바르게 늘어놓은 문장은?  [ '
          + p.shown.join(' / ') + ' ]';
      },
      answer: function (p) { return p.x.tiles.join(' '); },
      distractors: function (p) { return p.wrong; },
      validate: function (p, ans) {
        return !!ans && p.wrong.length >= 1 && p.shown.join(' ') !== ans;
      },
      explain: function (p) {
        return p.x.tiles.join(' ') + ' — ' + p.x.ko;
      }
    };
  }

  /* ② 빈칸: 한 낱말을 가리고 고르기 (뜻을 함께 줘서 정답이 하나로 정해진다) */
  function tplBlank(pool, bank, idx, caseOf, tag, diff) {
    if (!pool.length) return null;
    return {
      id: 't_blank_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '낱말 채우기',
      gen: function (rng) {
        var x = rng.pick(pool);
        var i = rng.int(0, x.tiles.length - 1);
        var ans = bareOf(x.tiles[i]);
        var atStart = (i === 0);
        var safe = bank.map(function (w) { return caseOf(w, atStart); }).filter(function (w) {
          var filled = x.tiles.map(function (t, k) { return k === i ? (w + tailOf(t)) : t; }).join(' ');
          return !idx[filled + SEP + x.ko];
        });
        /* 정답과 같은 대소문자 계열에서 먼저 뽑는다. 섞이면 "대문자로 시작하는 보기가
           하나뿐"이 되어 뜻을 몰라도 답이 보인다(문장 중간 빈칸에서 실제로 나던 누설). */
        var lower = function (w) { return w.toLowerCase(); };
        var ansUp = /^[A-Z]/.test(ans);
        var same = safe.filter(function (w) { return /^[A-Z]/.test(w) === ansUp; });
        var rest = safe.filter(function (w) { return /^[A-Z]/.test(w) !== ansUp; });
        var cand = othersBy(same, lower, ans.toLowerCase(), rng, 3);
        if (cand.length < 3) {
          var seen = {}; seen[ans.toLowerCase()] = 1;
          cand.forEach(function (w) { seen[lower(w)] = 1; });
          othersBy(rest, lower, ans.toLowerCase(), rng, 3 - cand.length).forEach(function (w) {
            if (!seen[lower(w)]) { seen[lower(w)] = 1; cand.push(w); }
          });
        }
        return { x: x, i: i, ans: ans, cand: cand };
      },
      render: function (p) {
        var shown = p.x.tiles.map(function (t, k) {
          return k === p.i ? ('____' + tailOf(t)) : t;
        }).join(' ');
        return '「' + p.x.ko + '」  ' + shown + '  빈칸에 알맞은 말은?';
      },
      answer: function (p) { return p.ans; },
      distractors: function (p) { return p.cand; },
      /* 재료가 얇은 날엔 어느 자리는 대소문자만으로 답이 드러난다(g5 1일차 I'm from Korea.
         — 소문자 낱말이 from 하나뿐). 그런 자리는 묻지 않는다. core 가 다른 자리로 다시 뽑는다. */
      validate: function (p, ans) {
        if (!ans || p.cand.length < 1) return false;
        var isUp = function (w) { return /^[A-Z]/.test(w); };
        var upCand = p.cand.filter(isUp).length;
        if (isUp(ans) && upCand === 0) return false;
        if (!isUp(ans) && upCand === p.cand.length) return false;
        return true;
      },
      explain: function (p) { return p.x.tiles.join(' ') + ' — ' + p.x.ko; }
    };
  }

  /* ③ 뜻 → 영어 문장 */
  function tplKo2En(pool, allPairs, idx, tag, diff) {
    if (!pool.length || allPairs.length < 3) return null;
    return {
      id: 't_ko2en_' + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: '뜻에 맞는 문장',
      gen: function (rng) {
        var x = rng.pick(pool);
        var safe = allPairs.filter(function (p) { return !idx[p.sent + SEP + x.ko]; });
        var cand = othersBy(safe, function (p) { return p.sent; }, x.sent, rng, 3);
        return { x: x, cand: cand };
      },
      render: function (p) { return '「' + p.x.ko + '」 를 영어로 바르게 말한 것은?'; },
      answer: function (p) { return p.x.sent; },
      distractors: function (p) { return p.cand.map(function (c) { return c.sent; }); },
      validate: function (p) { return p.cand.length >= 1; },
      explain: function (p) { return p.x.sent + ' — ' + p.x.ko; }
    };
  }

  /* ④ 영어 문장 → 뜻   ·   ⑥ 듣고 뜻 고르기(byEar)
   *
   * ★한 함수에서 갈라 낸다 — 오답 후보·검증·해설이 같아야 하고, 따로 쓰면 반드시 어긋난다.
   *
   * byEar=false : 문장을 발문에 글로 보여 준다. 소리는 「다시 듣기」로 덤이다.
   * byEar=true  : 문장을 발문에 **넣지 않는다**. 넣으면 읽고 답할 수 있어 듣기가 아니다.
   *   소리 없는 기기에서는 kquiz-ui 가 그 문장을 글로 대신 보여 주고, 그러면 이 문항은
   *   자연스럽게 ④ 로 내려앉는다 — 답할 수 없는 문항이 되지도, 답이 거저 나오지도 않는다
   *   (문장이 보여도 뜻은 여전히 골라야 한다). 설계 §5·§9, D3 확정 「소리는 비계지 관문이 아니다」. */
  function tplEn2Ko(pool, allPairs, idx, tag, diff, byEar) {
    if (!pool.length || allPairs.length < 3) return null;
    return {
      id: (byEar ? 't_listen_' : 't_en2ko_') + tag, type: 'pick', itemType: 'choice', difficulty: diff,
      concept: byEar ? '듣고 뜻 알기' : '문장의 뜻',
      gen: function (rng) {
        var x = rng.pick(pool);
        var safe = allPairs.filter(function (p) { return !idx[x.sent + SEP + p.ko]; });
        var cand = othersBy(safe, function (p) { return p.ko; }, x.ko, rng, 3);
        return { x: x, cand: cand };
      },
      render: function (p) {
        return byEar ? '잘 듣고 알맞은 뜻을 고르세요.'
                     : '「' + p.x.sent + '」 는 무슨 뜻일까요?';
      },
      tts: function (p) { return { text: p.x.sent, onscreen: !byEar }; },
      answer: function (p) { return p.x.ko; },
      distractors: function (p) { return p.cand.map(function (c) { return c.ko; }); },
      validate: function (p) { return p.cand.length >= 1; },
      explain: function (p) { return p.x.sent + ' — ' + p.x.ko; }
    };
  }

  /* ⑤ 참거짓: 문장과 뜻이 맞는 짝인가 */
  function tplOx(pool, allPairs, idx, tag, diff) {
    if (!pool.length || allPairs.length < 2) return null;
    return {
      id: 't_ox_' + tag, type: 'pick', itemType: 'ox', difficulty: diff,
      concept: '뜻 확인',
      gen: function (rng) {
        var x = rng.pick(pool);
        var truth = rng.int(0, 1) === 1;
        var wrongKo = allPairs.filter(function (p) { return !idx[x.sent + SEP + p.ko]; });
        var other = othersBy(wrongKo, function (p) { return p.ko; }, x.ko, rng, 1)[0];
        var shown = (truth || !other) ? x : other;
        return { x: x, shown: shown, truth: !!idx[x.sent + SEP + shown.ko] };
      },
      render: function (p) {
        return '「' + p.x.sent + '」 는 「' + p.shown.ko + '」 라는 뜻이다.';
      },
      /* 문장이 발문에 그대로 있으니 읽어 줘도 답이 새지 않는다 — 순수한 덤이다.
         답은 뜻이 맞는지(O·X)에 달려 있고 소리는 거기에 아무 말도 하지 않는다. */
      tts: function (p) { return { text: p.x.sent, onscreen: true }; },
      answer: function (p) { return p.truth; },
      validate: function (p) { return !!p.shown; },
      explain: function (p) {
        return p.truth
          ? '맞아요. ' + p.x.sent + ' — ' + p.x.ko
          : '아니에요. ' + p.x.sent + ' 는 「' + p.x.ko + '」 이고, 「' + p.shown.ko + '」 는 ' + p.shown.sent + ' 예요.';
      }
    };
  }

  /* ── 등록: 학년 × 일차(하루 한 문장) ──────────────────────────
   *  1일차는 복습 풀이 없어 오늘 문장 변주만으로 짠다(하루뿐이라 허용).
   *  2일차부터 복습이 섞이고, 재료가 3짝을 넘기면 짝짓기 문항이 열린다. */
  DATA.grades().forEach(function (grade) {
    var days = DATA.days(grade);
    var idx = pairIndexOf(days);            // 그 학년 40일 전체 짝 색인
    var caseOf = caseWith(capMidOf(days));  // 빈칸 보기의 대소문자 규약

    for (var i = 1; i <= days.length; i++) {
      var today = days[i - 1];
      var upto = days.slice(0, i);          // 오늘까지(누적 재료의 전부)
      var prev = days.slice(0, i - 1);      // 어제까지(복습 대상)

      var allPairs = pairsOfMany(upto);
      var curPairs = pairsOf(today);
      var prevW = weighted(prev);            // 복습 가중 적용된 일차 목록
      var prevPairsW = pairsOfMany(prevW);
      var bank = wordBank(upto);

      var tpls = [
        tplOrder([today], allPairs, idx, 'new', 1),
        tplBlank([today], bank, idx, caseOf, 'new', 1),
        tplKo2En(curPairs, allPairs, idx, 'new', 2),
        tplEn2Ko(curPairs, allPairs, idx, 'new', 2),
        tplOx(curPairs, allPairs, idx, 'new', 3)
      ];
      if (prev.length) {
        tpls.push(tplOrder(prevW, allPairs, idx, 'rev', 2));
        tpls.push(tplBlank(prevW, bank, idx, caseOf, 'rev', 2));
        tpls.push(tplEn2Ko(prevPairsW, allPairs, idx, 'rev', 2));
        tpls.push(tplOx(prevPairsW, allPairs, idx, 'rev', 3));
      }
      /* ⑥ 듣기 — 오늘 것과 복습을 한 통에 담아 **정확히 하나만** 세운다.
         ★하나인 것이 취향이 아니라 구조다: core 의 라운드로빈은 usable[ti % 길이] 를
         앞에서부터 돌며 10문항을 채우고 멈춘다. 템플릿이 11개가 되면 열한 번째는
         도달 전에 세트가 차서 **영영 안 뽑힌다**(실측: 9개일 때 첫 템플릿만 1175회로
         두 배였던 것과 같은 이유). 10개로 맞추면 열 자리에 열 템플릿이 하나씩 들어가
         듣기가 매일 한 문항 보장되고, 덤으로 지금까지의 배분 쏠림도 사라진다.
         pool 은 recency 가중(오늘 ×3)이라 대개 오늘 문장이지만 옛 문장도 귀로 돌아온다. */
      tpls.push(tplEn2Ko(pairsOfMany(weighted(upto)), allPairs, idx, 'ear', 2, true));

      reg('g' + grade + '_english_c' + ('00' + i).slice(-3), {
        source: grade + '학년 아침영어 ' + i + '일차 「' + today.sent + '」',
        fixed: [],
        templates: tpls.filter(Boolean),
        /* 화면(미리보기·교사)이 "오늘 뭘 나가나"를 문장으로 보여줄 때 쓴다 */
        day_meta: {
          grade: grade, day: i, pat: today.pat,
          sent: today.sent, ko: today.ko, tiles: today.tiles.slice(),
          newWords: (today['new'] || []).slice(),
          expand: today.expand ? { sent: today.expand.sent, ko: today.expand.ko } : null
        }
      });
    }
  });
});
