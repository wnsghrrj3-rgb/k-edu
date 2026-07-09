/* =============================================================
 * templates/g1_math_u4.js — 케이퀴즈: 1학년 1학기 4단원 「비교하기」
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §4-2 (pick·정의적 비교)
 *
 * 네 가지 비교: 길이 · 무게 · 넓이 · 들이
 * 차시(g1_math_u4): l01 도입(퀴즈X) · l02 길이 · l03 무게 · l04 넓이 ·
 *   l05 들이 · l06 정리·평가 · l07 창작(퀴즈X)
 * 성취기준 [2수03-06](양의 비교·비교 어휘)
 *
 * 원칙: 시각/실물 단원이지만, '누가 더 큰가'가 실세계에서 명백한 쌍만 골라
 *   텍스트 pick으로 낸다(기차>연필, 코끼리>나비 …). 방향(더 큰/더 작은)을 함께 물어
 *   비교 어휘 양쪽(길다/짧다·무겁다/가볍다·넓다/좁다·많다/적다)을 모두 커버.
 *   정답은 순서쌍이 코드로 결정 → test가 동일 순서쌍 집합으로 독립 재계산.
 *   전부 순수 창작(교과서 문항 차용 0).
 *
 *   재계산기 매칭(문구 절대 변경 금지):
 *     "「{A}」와(과) 「{B}」 중에서 {비교어} 것은 무엇일까요?"
 *        → 순서쌍 집합에서 더 큰 쪽 판정 후 방향 적용
 * ============================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory; return; }
  factory(root.KQuiz);
})(typeof self !== 'undefined' ? self : this, function (KQuiz) {
  'use strict';
  var CORE = KQuiz.register ? KQuiz : KQuiz.core;
  var reg = CORE.register;

  // 각 pairs 항목 = [더 큰 쪽, 더 작은 쪽] (실세계에서 명백한 순서만)
  var POOLS = {
    '길이': {
      more: '더 긴', less: '더 짧은', cmp: ['더 깁니다', '더 짧습니다'],
      pairs: [['기차', '연필'], ['버스', '자전거'], ['코끼리 코', '생쥐 꼬리'],
              ['기린 목', '강아지 다리'], ['국수 가락', '바늘']]
    },
    '무게': {
      more: '더 무거운', less: '더 가벼운', cmp: ['더 무겁습니다', '더 가볍습니다'],
      pairs: [['코끼리', '나비'], ['냉장고', '풍선'], ['수박', '포도 한 알'],
              ['자동차', '축구공'], ['바위', '깃털']]
    },
    '넓이': {
      more: '더 넓은', less: '더 좁은', cmp: ['더 넓습니다', '더 좁습니다'],
      pairs: [['운동장', '손수건'], ['교실 문', '공책'], ['이불', '손바닥'],
              ['칠판', '우표'], ['농구장', '방석']]
    },
    '들이': {
      more: '더 많이 담을 수 있는', less: '더 적게 담을 수 있는', cmp: ['더 많이 담깁니다', '더 적게 담깁니다'],
      pairs: [['욕조', '컵'], ['양동이', '종이컵'], ['물통', '숟가락'],
              ['수영장', '물병'], ['드럼통', '찻잔']]
    }
  };

  function makeCmp(attr) {
    var P = POOLS[attr];
    return {
      id: 't_cmp_' + attr, type: 'pick', difficulty: 2, choiceCount: 2,
      gen: function (rng) {
        var pr = rng.pick(P.pairs), more = pr[0], less = pr[1];
        var dir = rng.next() < 0.5 ? 'more' : 'less';
        var swap = rng.next() < 0.5;                 // 보기 표시 순서 섞기
        return { more: more, less: less, dir: dir, a: swap ? less : more, b: swap ? more : less };
      },
      render: function (p) {
        return '「' + p.a + '」와(과) 「' + p.b + '」 중에서 ' + (p.dir === 'more' ? P.more : P.less) + ' 것은 무엇일까요?';
      },
      answer: function (p) { return p.dir === 'more' ? p.more : p.less; },
      distractors: function (p) { return [p.dir === 'more' ? p.less : p.more]; },
      explain: function (p) {
        var win = p.dir === 'more' ? p.more : p.less, lose = p.dir === 'more' ? p.less : p.more;
        return win + '이(가) ' + lose + '보다 ' + P.cmp[p.dir === 'more' ? 0 : 1];
      }
    };
  }

  var cmpLen = makeCmp('길이'), cmpWeight = makeCmp('무게'),
      cmpArea = makeCmp('넓이'), cmpCap = makeCmp('들이');

  // ── 차시별 등록 ──────────────────────────────────────────────────────────
  function src(lesson) { return { grade: 1, subject: 'math', unit: 'u4', lesson: lesson }; }

  reg('g1_math_u4_l02', { source: src('l02'), fixed: [], templates: [cmpLen] });
  reg('g1_math_u4_l03', { source: src('l03'), fixed: [], templates: [cmpWeight] });
  reg('g1_math_u4_l04', { source: src('l04'), fixed: [], templates: [cmpArea] });
  reg('g1_math_u4_l05', { source: src('l05'), fixed: [], templates: [cmpCap] });
  reg('g1_math_u4_l06', { source: src('l06'), fixed: [], templates: [cmpLen, cmpWeight, cmpArea, cmpCap] });

  reg('g1_math_u4', {
    source: { grade: 1, subject: 'math', unit: 'u4', lesson: 'all' }, fixed: [],
    templates: [cmpLen, cmpWeight, cmpArea, cmpCap]
  });
});
