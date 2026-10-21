/* gens/korean/word_kind.js — 이름일까, 움직임일까, 성질이나 상태일까? (3학년 2학기 국어 5단원 「사전으로 여는 세상」 l02 · l06 · l10 · l12 · l14)
 * 순수 함수·DOM 무관 (§9-3). 장르 category_race(분류 릴레이)가 쓴다.
 * 칸 = 정본 l01 s06 · l02 s04~s06 셋: 🏷️ 이름 · 🏃 움직임 · ✨ 성질이나 상태.
 *   낱말의 종류는 l02(2·3차시)에서 처음 갈라진다 → 이 활동은 l02 부터.
 * 문항 꼴 = 정본 l02 s04~s06 — 낱말 하나(기본형). 칸은 그 낱말이 들어가는 틀이 정한다(정본 l02 s07 속말 · l14 s05 세 틀).
 *   풀이는 늘 그 틀에 넣은 한 문장 — 「이것이 ○○이다」 · 「(누가) 무엇을 한다」 · 「(무엇이) 어떠하다」.
 * 진단 축:
 *   ① 정본 l02 s08 오개념 「소리가 닮은 낱말은 같은 종류」 → 소리 닮은 짝이 두 칸에 갈림
 *      (웃음 ↔ 웃다 · 그림 ↔ 그리다 l02 · 여닫이 ↔ 여닫다 l06·l10 · 비탈 ↔ 비탈지다 l10·l14 — 정본 l14 s05 watch).
 *      짝 풀이는 늘 「소리가 닮았지만 다른 종류」.
 *   ② 정본 l02 s06 watch 「환하다를 움직임으로」 → 환하다는 성질이나 상태(풀이 「움직임이 아니라」).
 * 모양이 바뀐 낱말(닦아서·접으면 — l04 자리) · 칸 「바뀜/그대로」(l06 기준 ②) · 사전 차례(l08) 0.
 * params: { upto: 'l02'|'l06'|'l10'|'all' }  l02 = 3차시까지 · l06 = 7차시까지 · l10 = 11차시까지 · all = 14차시(단원 전체)
 * next() → { item, w, cat, type, explain, l, obj }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['word_kind'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l02', 'l06', 'l10', 'l14'];
  var CATS = [{ key: 'name', label: '🏷️ 이름' }, { key: 'act', label: '🏃 움직임' }, { key: 'state', label: '✨ 성질이나 상태' }];
  var NAME = { name: '이름을 나타내는 낱말', act: '움직임을 나타내는 낱말', state: '성질이나 상태를 나타내는 낱말' };

  /* [차시, 칸, 낱말(기본형), 틀에 넣은 문장, 뿌리(연달아 0 · 짝 표시), (짝이면) 소리 닮은 낱말] */
  var S = [
    // l02 — 정본 s04 이름 다섯 · s05 움직임 다섯 · s06 성질이나 상태 넷 · s08 웃음/웃다
    ['l02', 'name', '사물함', '이것이 사물함이다', '사물함'],
    ['l02', 'name', '손잡이', '이것이 손잡이다', '손잡이'],
    ['l02', 'name', '빗자루', '이것이 빗자루다', '빗자루'],
    ['l02', 'name', '계단', '이것이 계단이다', '계단'],
    ['l02', 'name', '바구니', '이것이 바구니다', '바구니'],
    ['l02', 'name', '웃음', '웃음이 터졌다', '웃', '웃다'],
    ['l02', 'name', '그림', '이것이 그림이다', '그리', '그리다'],
    ['l02', 'act', '닦다', '창문을 닦는다', '닦'],
    ['l02', 'act', '옮기다', '책상을 옮긴다', '옮기'],
    ['l02', 'act', '두드리다', '문을 두드린다', '두드리'],
    ['l02', 'act', '접다', '색종이를 접는다', '접'],
    ['l02', 'act', '심다', '꽃씨를 심는다', '심'],
    ['l02', 'act', '웃다', '친구가 웃는다', '웃', '웃음'],
    ['l02', 'act', '그리다', '동생이 꽃을 그린다', '그리', '그림'],
    ['l02', 'state', '비좁다', '방이 비좁다', '비좁'],
    ['l02', 'state', '환하다', '교실이 환하다', '환하'],
    ['l02', 'state', '매끈하다', '돌이 매끈하다', '매끈'],
    ['l02', 'state', '묵직하다', '수박이 묵직하다', '묵직'],
    ['l02', 'state', '따뜻하다', '국이 따뜻하다', '따뜻'],
    ['l02', 'state', '시끄럽다', '복도가 시끄럽다', '시끄'],
    ['l02', 'state', '깨끗하다', '손이 깨끗하다', '깨끗'],
    // l06 — 정본 s05 「물통 이야기」 · s06 기준 ① 종류로
    ['l06', 'name', '물통', '이것이 물통이다', '물통'],
    ['l06', 'name', '뚜껑', '이것이 뚜껑이다', '뚜껑'],
    ['l06', 'act', '여닫다', '뚜껑을 여닫는다', '여닫', '여닫이'],
    ['l06', 'act', '집다', '물통을 집는다', '집'],
    ['l06', 'act', '찌그러지다', '바닥이 찌그러진다', '찌그러'],
    ['l06', 'state', '까슬까슬하다', '겉이 까슬까슬하다', '까슬'],
    // l10 — 정본 s04·s05 「어디부터 그릴까」 · s07 비탈·여닫이
    ['l10', 'name', '비탈', '이것이 비탈이다', '비탈', '비탈지다'],
    ['l10', 'name', '여닫이', '이것이 여닫이다', '여닫', '여닫다'],
    ['l10', 'name', '어귀', '이것이 어귀다', '어귀'],
    ['l10', 'name', '안내도', '이것이 안내도다', '안내도'],
    ['l10', 'act', '에워싸다', '건물이 운동장을 에워싼다', '에워싸'],
    ['l10', 'act', '당기다', '문을 당긴다', '당기'],
    ['l10', 'act', '밀다', '문을 민다', '밀'],
    ['l10', 'state', '평평하다', '길이 평평하다', '평평'],
    ['l10', 'state', '자세하다', '안내도가 자세하다', '자세'],
    // l14 — 정본 s05 watch 「비탈 ↔ 비탈지다」 · s07 한여름·눈인사
    ['l14', 'state', '비탈지다', '길이 비탈지다', '비탈', '비탈'],
    ['l14', 'name', '한여름', '이것이 한여름이다', '한여름'],
    ['l14', 'name', '눈인사', '이것이 눈인사다', '눈인사']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function q(w) { return '「' + w + '」'; }
  function bat(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c % 28 > 0; }   // 받침 있음
  function why(s) {
    var t = s[1] === 'name' ? q(s[3]) + (s[3].indexOf('이것이') === 0 ? '가 돼요.' : '처럼 이름으로 써요.')
          : s[1] === 'act' ? q(s[3]) + '처럼 무엇을 하는지 나타내요.'
          : q(s[3]) + '처럼 어떠한지 나타내요.';
    if (s[2] === '환하다') t += ' 움직임이 아니라 교실이 어떠한지예요.';
    if (s[5]) t += ' ' + q(s[5]) + (bat(s[5]) ? '과' : '와') + ' 소리가 닮았지만 다른 종류예요.';
    return t;
  }
  function build(s) {
    return { l: s[0], cat: s[1], type: s[1], w: s[2], item: s[2], obj: s[4], pair: s[5] || null,
             explain: why(s) + ' → ' + NAME[s[1]] };
  }

  return {
    id: 'word_kind',
    title: '이름일까, 움직임일까, 성질이나 상태일까?',
    categories: CATS,
    S: S,
    ORDER: ORDER,
    NAME: NAME,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      S.forEach(function (s, k) { if (ORDER.indexOf(s[0]) <= lim) idx.push(k); });
      var deck = shuffle(rng, idx);
      var last = null, lastCat = '', run = 0;
      function find() {
        for (var t = 0; t < deck.length; t++) { var k = deck[t]; if (last && S[k][4] === last[4]) continue; if (run >= 1 && S[k][1] === lastCat) continue; return t; }
        return -1;
      }
      return {
        size: idx.length,
        upto: upto,
        next: function () {
          if (!deck.length) deck = shuffle(rng, idx);
          var at = find();
          if (at < 0) { deck = deck.concat(shuffle(rng, idx)); at = find(); }   // 같은 칸 두 번 넘게 잇따름 0 · 같은 뿌리 연달아 0
          var k = deck.splice(at, 1)[0];
          run = S[k][1] === lastCat ? run + 1 : 0; lastCat = S[k][1]; last = S[k];
          return build(S[k]);
        },
        check: function (pick, qq) { return pick === qq.cat; }
      };
    },
    printRender: function (qq) { return '<u>' + qq.w + '</u> → □ 이름 □ 움직임 □ 성질이나 상태'; },
    printAnswer: function (qq) { return { name: '이름', act: '움직임', state: '성질이나 상태' }[qq.cat]; },
    printHead: '낱말은 어떤 종류일까요? □에 ✓ 하세요.'
  };
}));
