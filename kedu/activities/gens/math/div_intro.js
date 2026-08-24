/* gens/math/div_intro.js — 나눗셈의 시작 (3학년 수학 3단원, l02~l06)
 * 순수 함수·DOM 무관 (§9-3). 나눔 마당(조작)·몫을 찾아라(선다)·활동지 공유.
 *
 * 두 활동이 한 생성기를 쓴다 (D23 — 한 단원 = 활동 2종):
 *   A 나눔 마당   params { stage: 'share'|'group'|'mix' }  → equal_share · grouping · which_div
 *   B 몫을 찾아라 params { qmode: 'expr'|'family'|'gugu'|'mix' } → div_expr · fact_family · quotient_gugu
 * stage가 오면 A의 문항을, qmode가 오면 B의 문항을 낸다.
 *
 * 유형 6종의 근거 (§21-3 확정 2026-08-21):
 *   equal_share(l02)와 grouping(l03)은 같은 식이 되지만 묻는 것이 다르다 —
 *   12÷4 등분제 = 4접시로 나눠 "몇 개씩" / 12÷3 포함제 = 3개씩 덜어 "몇 묶음".
 *   which_div는 그 구별 자체를 진단한다: 두 계산을 다 맞히면서도 상황을 구별 못 하는
 *   아이가 이 단원의 표적이다 (지도서 오개념 "포함제를 등분제로 착각").
 *
 * ★ 오답 선택지 = 전형적 오류값 (#11 규약, §21-3 명문):
 *   12÷4의 오답에 ① 나누는 수(4)를 몫 자리에 놓은 값 ② 뒤집힌 나눗셈(4÷12 취급)
 *   ③ 곱셈구구 인접값(몫±1)을 쓴다. 아이가 자기 실수와 똑같은 값을 집으면 진단 정보다.
 *
 * 수 범위: 곱셈구구 안 — 나누는 수 2~9, 몫 2~9 (l06 "곱셈구구로 몫 구하기"가 상한).
 * 조작 무대(stage)는 화면에 낱개가 다 보여야 하므로 전체 30개 이하로 죈다.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['div_intro'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  // 소재 — 등분제는 "그릇에 담는" 상황, 포함제는 "몇 개씩 묶는" 상황이 자연스럽다
  var SHARE_ITEMS = [
    { thing: '쿠키', unit: '개', dish: '접시' },
    { thing: '딸기', unit: '개', dish: '접시' },
    { thing: '연필', unit: '자루', dish: '필통' },
    { thing: '구슬', unit: '개', dish: '주머니' }
  ];
  var GROUP_ITEMS = [
    { thing: '사탕', unit: '개', dish: '봉지' },
    { thing: '달걀', unit: '개', dish: '상자' },
    { thing: '귤', unit: '개', dish: '바구니' },
    { thing: '색종이', unit: '장', dish: '묶음' }
  ];

  // per(나누는 수)·quot(몫) 뽑기 — cap 이하로 전체를 죈다
  function draw(rng, cap) {
    var per, quot, total, guard = 0;
    do {
      per = ri(rng, 2, 9); quot = ri(rng, 2, 9); total = per * quot;
    } while (total > cap && guard++ < 60);
    if (total > cap) { per = 3; quot = ri(rng, 2, 6); total = per * quot; }
    return { per: per, quot: quot, total: total };
  }

  function shuffle(rng, arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // 수 답 보기 — #11: 나누는 수를 몫 자리에 / 구구 인접값 / 뒤집기 잔재
  function numOptions(rng, ans, divisor, total) {
    var opts = [String(ans)];
    var cand = [divisor, ans + 1, ans - 1, total - divisor, divisor + 1];
    for (var i = 0; i < cand.length && opts.length < 4; i++) {
      var c = cand[i];
      if (c >= 1 && c !== ans && opts.indexOf(String(c)) < 0) opts.push(String(c));
    }
    var guard = 0;
    while (opts.length < 4 && guard++ < 40) {
      var d = ans + ri(rng, -3, 3);
      if (d >= 1 && d !== ans && opts.indexOf(String(d)) < 0) opts.push(String(d));
    }
    return shuffle(rng, opts);
  }

  // ── A 무대 문항 ──────────────────────────────────────────────
  function makeShare(rng) {           // 등분제: 접시 수를 주고 "몇 개씩"을 묻는다
    var d = draw(rng, 30), it = pick(rng, SHARE_ITEMS);
    var plates = d.per, each = d.quot;             // 나누는 수 = 접시 수
    return {
      type: 'equal_share', kind: 'share', item: it,
      total: d.total, plates: plates, each: each,
      task: it.thing + ' ' + d.total + it.unit + '를 ' + it.dish + ' ' + plates + '개에 똑같이 나눠 담아요',
      prompt: it.dish + ' 한 개에 몇 ' + it.unit + '씩 담겼나요?',
      answer: String(each),
      options: numOptions(rng, each, plates, d.total),
      expr: d.total + ' ÷ ' + plates + ' = ' + each,
      explain: d.total + ' ÷ ' + plates + ' = ' + each + ' — 똑같이 나누면 "한 ' + it.dish +
               '의 개수"를 알 수 있어요. ' + plates + '개 ' + it.dish + '에 ' + each + it.unit + '씩!'
    };
  }

  function makeGroup(rng) {           // 포함제: 묶음 크기를 주고 "몇 묶음"을 묻는다
    var d = draw(rng, 30), it = pick(rng, GROUP_ITEMS);
    var per = d.per, groups = d.quot;              // 나누는 수 = 한 묶음 개수
    return {
      type: 'grouping', kind: 'group', item: it,
      total: d.total, per: per, groups: groups,
      task: it.thing + ' ' + d.total + it.unit + '를 ' + per + it.unit + '씩 묶어 덜어내요',
      prompt: it.dish + '이(가) 몇 개 됐나요?',
      answer: String(groups),
      options: numOptions(rng, groups, per, d.total),
      expr: d.total + ' ÷ ' + per + ' = ' + groups,
      explain: d.total + ' ÷ ' + per + ' = ' + groups + ' — ' + per + it.unit + '씩 묶어 덜어내면 ' +
               '"묶음의 수"를 알 수 있어요. ' + groups + '번 덜어냈죠!'
    };
  }

  function makeWhich(rng) {           // 구별: 상황을 읽고 어느 나눗셈인지 가른다
    var isShare = rng() < 0.5;
    var d = draw(rng, 72), it = pick(rng, isShare ? SHARE_ITEMS : GROUP_ITEMS);
    var text = isShare
      ? it.thing + ' ' + d.total + it.unit + '를 ' + it.dish + ' ' + d.per + '개에 똑같이 나눠 담았어요.'
      : it.thing + ' ' + d.total + it.unit + '를 ' + d.per + it.unit + '씩 ' + it.dish + '에 담았어요.';
    return {
      type: 'which_div', kind: 'which', item: it,
      total: d.total, per: d.per, quot: d.quot, isShare: isShare,
      task: text,
      prompt: '이렇게 나누면 무엇을 알 수 있나요?',
      answer: isShare ? 'each' : 'groups',
      options: shuffle(rng, ['each', 'groups']),
      labels: { each: '한 ' + it.dish + '에 담긴 개수 (몇 ' + it.unit + '씩)', groups: it.dish + '의 수 (몇 개)' },
      explain: isShare
        ? '똑같이 나누기예요 — ' + it.dish + ' 수를 알고 있으니, 나눗셈으로 "한 ' + it.dish + '에 몇 ' + it.unit + '씩"을 알 수 있어요.'
        : '묶어 덜어내기예요 — 한 번에 담는 개수를 알고 있으니, 나눗셈으로 "' + it.dish + '이(가) 몇 개"인지 알 수 있어요.'
    };
  }

  // ── B 선다 문항 ──────────────────────────────────────────────
  function exprStr(a, b, c) { return a + ' ÷ ' + b + ' = ' + c; }

  function makeExpr(rng) {            // l04: 상황 → 올바른 나눗셈식 세우기
    var isShare = rng() < 0.5;
    var d = draw(rng, 72), it = pick(rng, isShare ? SHARE_ITEMS : GROUP_ITEMS);
    var text = isShare
      ? it.thing + ' ' + d.total + it.unit + ' → ' + it.dish + ' ' + d.per + '개에 똑같이'
      : it.thing + ' ' + d.total + it.unit + ' → ' + d.per + it.unit + '씩 묶기';
    var ans = exprStr(d.total, d.per, d.quot);
    var opts = [ans,
      exprStr(d.per, d.total, d.quot),             // ① 뒤집힌 식 — 작은 수 ÷ 큰 수
      exprStr(d.total, d.quot, d.per),             // ② 나누는 수·몫 자리 바꿈
      d.total + ' × ' + d.per + ' = ' + (d.total * d.per)  // ③ 나눌 자리에 곱셈
    ];
    return {
      type: 'div_expr', kind: 'expr',
      total: d.total, per: d.per, quot: d.quot,
      task: text, prompt: '알맞은 나눗셈식은?',
      answer: ans, options: shuffle(rng, opts),
      explain: '전체 ' + d.total + '을 ' + d.per + '(으)로 나눠요 — 나눗셈식은 언제나 「전체 ÷ 나누는 수」. ' + ans + '.'
    };
  }

  function makeFamily(rng) {          // l05: 곱셈식 → 나눗셈식 (식 가족)
    var d = draw(rng, 81);
    var a = d.per, b = d.quot, t = d.total;        // a × b = t
    var ans = exprStr(t, a, b);
    // ★ 주의: t÷b=a 도 정답인 가족이다 — 오답 후보에 절대 넣지 않는다
    var opts = [ans,
      exprStr(a, t, b),                            // ① 뒤집힌 식
      exprStr(t, a, a),                            // ② 나누는 수를 몫 자리에
      exprStr(t, b, b)                             //    (같은 병, 다른 짝)
    ];
    return {
      type: 'fact_family', kind: 'family',
      a: a, b: b, total: t,
      task: a + ' × ' + b + ' = ' + t,
      prompt: '나눗셈식으로 바르게 바꾼 것은?',
      answer: ans, options: shuffle(rng, opts),
      explain: '곱셈식 하나로 나눗셈식 두 개를 만들 수 있어요: ' + exprStr(t, a, b) + ' 그리고 ' +
               exprStr(t, b, a) + '. 곱한 두 수가 번갈아 나누는 수가 돼요.'
    };
  }

  function makeGugu(rng) {            // l06: 곱셈구구로 몫 구하기
    var d = draw(rng, 81);
    return {
      type: 'quotient_gugu', kind: 'gugu',
      total: d.total, per: d.per, quot: d.quot,
      task: d.total + ' ÷ ' + d.per + ' = ?',
      prompt: '몫은 얼마인가요?',
      answer: String(d.quot),
      options: numOptions(rng, d.quot, d.per, d.total),
      gugu: d.per + ' × ' + d.quot + ' = ' + d.total,
      explain: '곱셈구구를 떠올려요 — ' + d.per + ' × □ = ' + d.total + '에서 □는 ' + d.quot +
               '. 그래서 ' + d.total + ' ÷ ' + d.per + ' = ' + d.quot + '이에요.'
    };
  }

  return {
    id: 'div_intro',
    title: '나눗셈의 시작',
    create: function (params, rng) {
      var p = params || {};
      var seq;
      if (p.stage != null) {                       // A 나눔 마당
        var st = String(p.stage);
        seq = (st === 'share') ? ['share'] : (st === 'group') ? ['group'] : ['share', 'group', 'which'];
      } else {                                     // B 몫을 찾아라
        var qm = String(p.qmode || 'mix');
        seq = (qm === 'expr') ? ['expr'] : (qm === 'family') ? ['family'] :
              (qm === 'gugu') ? ['gugu'] : ['expr', 'family', 'gugu'];
      }
      var MAKE = { share: makeShare, group: makeGroup, which: makeWhich,
                   expr: makeExpr, family: makeFamily, gugu: makeGugu };
      var i = 0;
      return {
        next: function () {
          // mix는 순환 + 가끔 섞기 — 한 판 안에서 세 유형이 반드시 다 나온다
          var k = (i < seq.length) ? seq[i] : pick(rng, seq);
          i++;
          return MAKE[k](rng);
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    // 활동지 — 게임과 같은 문제의 인쇄 렌더 (§11-3)
    printRender: function (q) {
      if (q.kind === 'share' || q.kind === 'group' || q.kind === 'which') {
        return '<span>' + q.task + '</span><span style="margin:0 8px">→</span>' +
               '<span class="w-num">' + q.total + '</span><span> ÷ </span>' +
               '<span class="w-num">' + (q.kind === 'share' ? q.plates : q.per) + '</span>' +
               '<span> = </span><span class="w-box"> </span>';
      }
      if (q.kind === 'family') {
        return '<span class="w-num">' + q.task + '</span>' +
               '<span style="margin:0 8px">→</span><span class="w-num">' + q.total + '</span>' +
               '<span> ÷ </span><span class="w-num">' + q.a + '</span><span> = </span><span class="w-box"> </span>';
      }
      return '<span class="w-num">' + q.total + '</span><span> ÷ </span>' +
             '<span class="w-num">' + q.per + '</span><span> = </span><span class="w-box"> </span>';
    },
    printAnswer: function (q) {
      if (q.kind === 'share') return String(q.each);
      if (q.kind === 'group' || q.kind === 'which') return String(q.kind === 'which' ? q.quot : q.groups);
      if (q.kind === 'family') return String(q.b);
      return String(q.quot);
    },
    printHead: '나눗셈의 몫을 구해 □ 안에 알맞은 수를 쓰세요.'
  };
}));
