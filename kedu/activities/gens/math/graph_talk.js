/* gens/math/graph_talk.js — 알 수 있는 내용 말하기 놀이 (2학년 2학기 수학 5단원 「표와 그래프」 5·6차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + topic(교과서 조사 주제 열쇠) · claims[{who, text, ok}] · graphHtml(topic) — 무대와 활동지가 같은 그래프 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 121쪽 「표와 그래프로 나타내고 알 수 있는 내용을 이야기하는 놀이」
 *   (순서를 정해 표와 그래프에서 알 수 있는 내용을 말하고, 친구가 말한 내용이 맞는지 확인한다).
 *   그래프 하나에 세 친구가 한 말씩 — 맞는 말은 하나뿐, 바르게 말한 친구를 고른다.
 *   그래프 = 교과서·『수학익힘』 자료 그대로: 동호네 반 전통 놀이 3·8·2·9 · 지수네 반 제기차기 5·3·7·13·8 · 주영이네 반 간식 5·8·4·2 ·
 *   2학년 놀이기구 14·5·13·9 · 12월 날씨 8·11·7·5 · 우리 반 교실 놀이 4·5·6·5 · 수찬이네 반 동물 6·3·5·2·4 · 재우네 반 붕어빵 7·5·2·3·4 ·
 *   은주네 반 과일 3·5·2·4·4 · 우리 반 운동 6·6·4·7.
 *   처음 두 판 = 교과서 문장(3명보다 많은 → 투호 놀이, 공기놀이 · 흐린 날이 가장 많음 · 4모둠 · 모두 22명 · 10명보다 많은 → 미끄럼틀, 회전 무대 ·
 *   공기놀이가 투호 놀이보다 1명 더 · 보드게임 · 흐린 날이 맑은 날보다 3일 더 가운데 둘).
 * 틀린 말 = 지도서 오답 유형: 맨 앞 칸을 가장 많다고(자리로 판단) · 「n보다 많은」에 딱 n 을 넣음 · 많은↔적은 거꾸로 ·
 *   차이 대신 합 · 한 칸의 수나 가짓수를 합계로 · 그래프에 없는 생각(가장 재미있다 · 날마다 추웠다)을 알 수 있는 내용으로(287쪽 통계적 사실).
 * type: most(가장 많은·적은) · more(n보다 많은 — 경곗값) · diff(몇 더 많은) · total(모두 몇) · fact(사실과 생각)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['graph_talk'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* 교과서 조사 주제 — vp: 항목 → 「~한 학생」 말 · most/more: 「가장 ~」·「n보다 많은 ~」 틀({M} 많은|적은, {N} n단위) · total: 합계 말 · think: 그래프에 없는 생각 */
  function likes(v) { return function (c) { return KO.j(c, '을/를') + ' ' + v + ' 학생'; }; }
  var T = {
    play:    { title: '동호네 반 학생들이 좋아하는 전통 놀이별 학생 수', head: '전통 놀이', unit: '명', cols: ['비사치기', '투호 놀이', '제기차기', '공기놀이'], counts: [3, 8, 2, 9],
               vp: likes('좋아하는'), most: '가장 {M} 학생들이 좋아하는 전통 놀이', more: '{N}보다 많은 학생들이 좋아하는 전통 놀이', total: '동호네 반 학생은 모두 {T}', think: '{X} 가장 재미있는 전통 놀이야.' },
    jegi:    { title: '지수네 반 모둠별 제기차기 횟수', head: '모둠', unit: '회', cols: ['1모둠', '2모둠', '3모둠', '4모둠', '5모둠'], counts: [5, 3, 7, 13, 8],
               vp: function (c) { return c + '의 제기차기 횟수'; }, most: '제기차기를 가장 {M2} 한 모둠', more: '제기차기를 {N}보다 많이 한 모둠', total: '지수네 반 전체 모둠이 한 제기차기는 모두 {T}', think: '{X} 연습을 가장 열심히 한 모둠이야.' },
    snack:   { title: '주영이네 반 학생들이 좋아하는 간식별 학생 수', head: '간식', unit: '명', cols: ['햄버거', '떡볶이', '김밥', '라면'], counts: [5, 8, 4, 2],
               vp: likes('좋아하는'), most: '가장 {M} 학생들이 좋아하는 간식', more: '{N}보다 많은 학생들이 좋아하는 간식', total: '주영이네 반 학생은 모두 {T}', think: '{X} 가장 맛있는 간식이야.' },
    ride:    { title: '2학년 학생들이 원하는 놀이기구별 학생 수', head: '놀이기구', unit: '명', cols: ['미끄럼틀', '그네', '회전 무대', '시소'], counts: [14, 5, 13, 9],
               vp: likes('원하는'), most: '가장 {M} 학생들이 원하는 놀이기구', more: '{N}보다 많은 학생들이 원하는 놀이기구', total: '조사한 2학년 학생은 모두 {T}', think: '{X} 가장 안전한 놀이기구야.' },
    weather: { title: '12월 날씨별 일수', head: '날씨', unit: '일', cols: ['맑음', '흐림', '비', '눈'], counts: [8, 11, 7, 5],
               vp: function (c) { return { '맑음': '맑은 날', '흐림': '흐린 날', '비': '비가 온 날', '눈': '눈이 온 날' }[c]; },
               most: '12월에 날수가 가장 {M} 날씨', more: '12월에 {N}보다 많았던 날씨', total: '12월의 날수는 모두 {T}', think: '{X} 많았으니까 12월은 날마다 추웠어.', thinkVp: true },
    game:    { title: '우리 반 학생들이 원하는 교실 놀이별 학생 수', head: '교실 놀이', unit: '명', cols: ['땅따먹기', '공기놀이', '보드게임', '딱지치기'], counts: [4, 5, 6, 5],
               vp: likes('원하는'), most: '가장 {M} 학생들이 원하는 교실 놀이', more: '{N}보다 많은 학생들이 원하는 교실 놀이', total: '우리 반 학생은 모두 {T}', think: '{X} 가장 재미있는 교실 놀이야.' },
    animal:  { title: '수찬이네 반 학생들이 좋아하는 동물별 학생 수', head: '동물', unit: '명', cols: ['개', '앵무새', '고양이', '토끼', '금붕어'], counts: [6, 3, 5, 2, 4],
               vp: likes('좋아하는'), most: '가장 {M} 학생들이 좋아하는 동물', more: '{N}보다 많은 학생들이 좋아하는 동물', total: '수찬이네 반 학생은 모두 {T}', think: '{X} 가장 귀여운 동물이야.' },
    bread:   { title: '재우네 반 학생들이 좋아하는 붕어빵의 종류별 학생 수', head: '종류', unit: '명', cols: ['팥', '슈크림', '고구마', '치즈', '초코'], counts: [7, 5, 2, 3, 4],
               vp: function (c) { return c + ' 붕어빵을 좋아하는 학생'; }, most: '가장 {M} 학생들이 좋아하는 붕어빵', more: '{N}보다 많은 학생들이 좋아하는 붕어빵', total: '재우네 반 학생은 모두 {T}', think: '{X} 붕어빵이 가장 맛있는 붕어빵이야.', thinkRaw: true },
    fruit:   { title: '은주네 반 학생들이 좋아하는 과일별 학생 수', head: '과일', unit: '명', cols: ['자두', '포도', '키위', '감', '복숭아'], counts: [3, 5, 2, 4, 4],
               vp: likes('좋아하는'), most: '가장 {M} 학생들이 좋아하는 과일', more: '{N}보다 많은 학생들이 좋아하는 과일', total: '은주네 반 학생은 모두 {T}', think: '{X} 가장 맛있는 과일이야.' },
    sport:   { title: '우리 반 학생들이 좋아하는 운동별 학생 수', head: '운동', unit: '명', cols: ['줄넘기', '공놀이', '달리기', '수영'], counts: [6, 6, 4, 7],
               vp: likes('좋아하는'), most: '가장 {M} 학생들이 좋아하는 운동', more: '{N}보다 많은 학생들이 좋아하는 운동', total: '우리 반 학생은 모두 {T}', think: '{X} 가장 재미있는 운동이야.' }
  };
  var KEYS = Object.keys(T);
  var NAMES = ['슬기', '지아', '연우', '재이', '세미', '수찬', '민영', '동호', '지수', '주영', '은주', '재우', '소희', '호진'];

  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function qty(t, n) { return n + t.unit; }
  function list(t, idx) { return idx.map(function (i) { return t.cols[i]; }).join(', '); }
  function mostPhrase(t, big) { return t.most.replace('{M2}', big ? '많이' : '적게').replace('{M}', big ? '많은' : '적은'); }
  function S_most(t, i, big) { return KO.j(mostPhrase(t, big), '은/는') + ' ' + KO.iya(t.cols[i]) + '.'; }
  function S_more(t, n, idx) { return KO.j(t.more.replace('{N}', qty(t, n)), '은/는') + ' ' + KO.iya(list(t, idx)) + '.'; }
  function S_diff(t, i, j, d) { var a = t.vp(t.cols[i]), b = t.vp(t.cols[j]); return KO.j(a, '은/는') + ' ' + b + '보다 ' + qty(t, d) + ' 더 많아.'; }
  function S_total(t, n) { return KO.iya(t.total.replace('{T}', qty(t, n))) + '.'; }
  function S_think(t, i) { var c = t.cols[i]; return t.think.replace('{X}', t.thinkRaw ? c : KO.j(t.thinkVp ? t.vp(c) : c, '이/가')); }

  /* 그래프 그림 — ◯ 를 한 칸에 하나씩 맨 아래부터(교과서 세로 그래프). 수는 counts 에서만 그린다 */
  function graphHtml(key) {
    var t = T[key], R = Math.max.apply(null, t.counts), h = '';
    for (var r = R; r >= 1; r--) {
      h += '<tr><th>' + r + '</th>';
      for (var c = 0; c < t.cols.length; c++) h += t.counts[c] >= r ? '<td class="m" data-c="' + c + '">◯</td>' : '<td></td>';
      h += '</tr>';
    }
    h += '<tr class="gl"><th class="cn">' + (t.unit === '일' ? '일수(일)' : t.unit === '회' ? '횟수(회)' : '학생 수(명)') + '</th>';
    for (var c2 = 0; c2 < t.cols.length; c2++) h += '<th data-c="' + c2 + '">' + t.cols[c2] + '</th>';
    h += '</tr>';
    return '<div class="gt-title">' + t.title + '</div><table class="gt" aria-label="그래프">' + h + '</table>';
  }

  /* 한 판 — 맞는 말 하나 + 틀린 말 둘(지도서 오답 유형) */
  function build(rng, it) {
    var t = T[it.topic], cn = t.counts, n = cn.length, tot = sum(cn), right, wrongs = [], ex;
    var mx = Math.max.apply(null, cn), mn = Math.min.apply(null, cn), iMx = cn.indexOf(mx), iMn = cn.indexOf(mn);
    var uniq = function (v) { return cn.filter(function (x) { return x === v; }).length === 1; };
    if (it.type === 'most') {
      var big = it.big !== false && (it.big || uniq(mx)) && uniq(mx); if (!big && !uniq(mn)) big = true;
      var ai = big ? iMx : iMn, oi = big ? iMn : iMx;
      var front = [0, n - 1, 1, 2].filter(function (k) { return k !== ai && k !== oi; })[0];   /* 맨 앞(없으면 맨 뒤) 칸 — 자리로 판단하는 덫 */
      right = S_most(t, ai, big);
      wrongs = [S_most(t, front, big), S_most(t, oi, big)];
      ex = '그래프에서 ◯가 가장 ' + (big ? '높이' : '낮게') + ' 쌓인 것은 ' + KO.ida(t.cols[ai]).replace(t.cols[ai], t.cols[ai] + '(' + qty(t, cn[ai]) + ')') + '. 맨 앞이나 맨 뒤 칸이라고 ' + (big ? '많은' : '적은') + ' 것이 아니에요.';
    } else if (it.type === 'more') {
      var nn = it.n, over = [], ge = [], under = [];
      cn.forEach(function (x, i) { if (x > nn) over.push(i); if (x >= nn) ge.push(i); if (x < nn) under.push(i); });
      right = S_more(t, nn, over);
      wrongs = [];
      if (ge.length !== over.length) wrongs.push(S_more(t, nn, ge));
      if (under.length) wrongs.push(S_more(t, nn, under));
      if (wrongs.length < 2 && over.length > 1) wrongs.push(S_more(t, nn, over.slice(0, over.length - 1)));
      var at = []; cn.forEach(function (x, i) { if (x === nn) at.push(i); });
      ex = qty(t, nn) + '에 선을 긋고 그 위에 ◯가 있는 것을 찾으면 ' + KO.ida(list(t, over)) + '.' + (at.length ? ' 딱 ' + qty(t, nn) + '인 ' + KO.j(list(t, at), '은/는') + ' 「' + qty(t, nn) + '보다 많은」에 들어가지 않아요.' : '');
    } else if (it.type === 'diff') {
      var i1 = it.i, i2 = it.j; if (cn[i1] < cn[i2]) { var tmp = i1; i1 = i2; i2 = tmp; }
      var d = cn[i1] - cn[i2];
      right = S_diff(t, i1, i2, d);
      wrongs = [S_diff(t, i1, i2, cn[i1] + cn[i2]), S_diff(t, i1, i2, d + 1 === cn[i1] + cn[i2] ? d + 2 : d + 1)];
      ex = KO.j(t.vp(t.cols[i1]), '은/는') + ' ' + qty(t, cn[i1]) + ', ' + KO.j(t.vp(t.cols[i2]), '은/는') + ' ' + KO.ida(qty(t, cn[i2])) + '. ' + cn[i1] + ' − ' + cn[i2] + ' = ' + d + ' — 「더 많은」 수는 두 수의 차이예요.';
    } else if (it.type === 'total') {
      right = S_total(t, tot);
      var w = [mx, n, tot + 1].filter(function (v, k, a) { return v !== tot && a.indexOf(v) === k; });
      wrongs = [S_total(t, w[0]), S_total(t, w[1])];
      ex = cn.join(' + ') + ' = ' + tot + ' — 항목별 수를 모두 더한 것이 전체예요. 가장 큰 한 칸의 수(' + mx + ')나 가짓수(' + n + ')가 아니에요.';
    } else {   /* fact — 그래프에 있는 사실 하나, 없는 생각 하나, 거꾸로 읽은 말 하나 */
      var bigF = uniq(mx), af = bigF ? iMx : iMn, of = bigF ? iMn : iMx;
      right = S_most(t, af, bigF);
      wrongs = [S_think(t, iMx), S_most(t, of, bigF)];
      ex = '그래프로 알 수 있는 것은 항목별 수와 많고 적음이에요. 「' + S_think(t, iMx).replace(/\.$/, '') + '」는 그래프에 나타나지 않은 생각이에요.';
    }
    var who = shuffle(rng, NAMES.slice()).slice(0, 3);
    var claims = shuffle(rng, [{ text: right, ok: true }, { text: wrongs[0], ok: false }, { text: wrongs[1], ok: false }]);
    claims.forEach(function (c, k) { c.who = who[k]; });
    var ans = claims.filter(function (c) { return c.ok; })[0].who;
    return { topic: it.topic, title: t.title, claims: claims, prompt: t.title + ' — 바르게 말한 친구는 누구인가요?', options: claims.map(function (c) { return c.who; }), answer: ans, type: it.type, explain: ans + ' — 「' + right.replace(/\.$/, '') + '」 ' + ex };
  }

  /* 교과서 판 — 『수학』 119·120·124~125쪽 · 『수학익힘』 79쪽 · 지도서 287 · 민영이 쪽지(122~123쪽) */
  var BOOK = [
    { topic: 'play', type: 'more', n: 3 }, { topic: 'weather', type: 'most', big: true }, { topic: 'jegi', type: 'most', big: true },
    { topic: 'play', type: 'total' }, { topic: 'ride', type: 'more', n: 10 }, { topic: 'play', type: 'diff', i: 3, j: 1 },
    { topic: 'game', type: 'most', big: true }, { topic: 'weather', type: 'diff', i: 1, j: 0 }
  ];
  function makeRandom(rng) {
    var key = pick(rng, KEYS), t = T[key], cn = t.counts, type = pick(rng, ['most', 'more', 'diff', 'total', 'fact']);
    if (type === 'more') {
      var vals = cn.filter(function (v, k, a) { return a.indexOf(v) === k && v < Math.max.apply(null, cn) && cn.some(function (x) { return x < v; }); });
      if (!vals.length) type = 'most'; else return { topic: key, type: 'more', n: pick(rng, vals) };
    }
    if (type === 'diff') {
      var i, j, g = 0; do { i = ri(rng, 0, cn.length - 1); j = ri(rng, 0, cn.length - 1); g++; } while ((i === j || cn[i] === cn[j]) && g < 50);
      return { topic: key, type: 'diff', i: i, j: j };
    }
    if (type === 'most') return { topic: key, type: 'most', big: rng() < 0.6 };
    return { topic: key, type: type };
  }

  return {
    id: 'graph_talk',
    title: '알 수 있는 내용 말하기',
    TOPICS: T,
    graphHtml: graphHtml,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var order = shuffle(rng, BOOK.slice()), qi = 0;
      return {
        next: function () {
          var it = (book && qi < 2) ? order[qi] : makeRandom(rng);
          qi++;
          return build(rng, it);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      return graphHtml(q.topic) + '<ol class="w-claims">' + q.claims.map(function (c) { return '<li>' + c.who + ': 「' + c.text + '」</li>'; }).join('') + '</ol><span class="w-box">바르게 말한 친구: (　　　)</span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '그래프를 보고 바르게 말한 친구를 쓰세요.'
  };
}));
