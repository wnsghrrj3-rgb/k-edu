/* gens/math/pict_graph.js — 그림그래프 (3학년 2학기 수학 6단원 「그림그래프」 l01~l07)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l01'|'l02'|'l03'|'l04'|'l05'|'l06'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l06(단위가 다른 두 그림그래프)까지 전부 고르게 (l07 단원 마무리).
 *
 * type (§21-3 · 정본 data/g3s2_math_u6.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   tbl_total   l01  표의 합계 (정본 s04·s11 봄 7 · 여름 8 · 가을 6 · 겨울 4 → 25)
 *   tbl_miss    l01  합계로 모르는 수 (정본 s06·s09 합계 50 · 미국 20 · 일본 17 → 영국 13)
 *   pg_read10   l02  큰 그림 10 · 작은 그림 1 읽기 (정본 s09 자전거 타기 20 · s12 줄넘기 14 · s16 23)
 *   pg_read5    l02  큰 그림 5 · 작은 그림 1 읽기 (정본 s05·s11 지유 5 + 5 + 1 + 1 = 12회)
 *   pg_cmp3     l02  그림 수가 같아도 수는 달라요 (정본 s07·s10 ㉠ 12 · ㉡ 21)
 *   pg_most     l02  가장 많은 것 — 큰 그림부터 (정본 s06 가 34 · 나 41 · 다 38)
 *   pg_diff     l02  몇 더 많은가 (정본 s15 샌들 15 − 구두 12 = 3켤레)
 *   draw_big    l03  큰 그림 몇 개 그리나 (정본 s09 당근 18 → 10명 그림 1 · s16 27 → 2)
 *   draw_small  l03  작은 그림 몇 개 그리나 (정본 s10 콩나물 35 → 1명 그림 5 · s12 오이 24 → 4)
 *   draw_3u     l03  100명 · 10명 · 1명 세 가지 그림 (정본 s06 떡국 130 · s12 불고기 112 → 그림 4 · s16 145 → 10명 그림 4)
 *   pg_sum2     l03  두 항목을 더해요 (정본 s15 떡볶이 17 + 탄산음료 32 = 49개)
 *   sv_more     l04  표에서 몇 더 많은가 (정본 s12 플루트 30 − 우쿨렐레 18 = 12)
 *   sv_double   l04  두 번 센 사람 (정본 s12 97 → 99 · 2명)
 *   sv_absent   l04  빠진 사람 (정본 s15 8 + 6 + 5 + 9 = 28 · 반 30명 → 2명)
 *   sv_method   l04  조사 방법 (정본 s05·s09 손 들기 · 투표하기 · 붙임딱지 붙이기 · 돌아다니며 묻기)
 *   draw5       l05  큰 그림 5 · 작은 그림 1로 그리기 (정본 s09 서준 22 → 5회 그림 4 · s10 은비 13 → 1회 그림 3)
 *   check_miss  l05  그림의 합과 표의 합계 (정본 s15 사과 12 · 배 14 · 포도 9 → 35 · 합계 37 → 2명 덜 그림 · s16 53 · 55)
 *   u_two       l06  단위가 다른 두 그림그래프 (정본 s09 나 268 → 100건 그림 2 · s10 가 268 → 10건 그림 26)
 *   pic_gap     l06  두 그림그래프의 그림 수 차이 (정본 s12 봄 377 → 44 · 17 · 차이 27)
 *   same_data   l06  그림이 적어도 같은 자료 (정본 s08 「나가 그림이 적으니 산불도 적다」)
 *   big_sum     l06  세 자리 건수 더하기 — 받아올림 (정본 s11 756 · s15 377 + 268 = 645)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」·watch 가 실명으로 적은 오류값 (#11 오류값 규약):
 *   l01 s08 합계를 가장 많은 수로 · s11 오답 「계절의 수」 · watch 합계에 두 수를 더해 버림(50 + 20 + 17)
 *   l02 s08 그림이 3개씩이니 같다 · watch 그림 크기와 상관없이 개수만 셈 · 큰 그림을 10회로 여겨 22회 ·
 *       그림의 전체 개수만 세어 다 농장 · s15 작은 그림만 세어 뺌
 *   l03 watch 작은 그림 18개를 그림 · 100명 그림과 10명 그림을 헷갈림 · s12 그림 수 대신 사람 수 112 ·
 *       s15 큰 그림을 1개로 세어 합을 작게(1 + 7 + 3 + 2 = 13)
 *   l04 watch 투표 종이를 두 번 셈(합계로 확인) · s15 빠진 2명
 *   l05 watch 큰 그림을 10회로 착각 · 그림 수만 세고 단위를 곱하지 않음 · s15 그림 개수(1 + 2 + 1 + 4 + 9)를 더해 17
 *   l06 s08 그림이 적으니 산불도 적다 · watch 10건 그림 26개를 2개로 · 받아올림을 빠뜨림 · 그림 수 대신 건수를 뺌
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 *
 * 풀이에 「자리」 말 0 (reason 게이트 — 그림그래프는 자릿값이 아니라 그림의 크기로 센다).
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['pict_graph'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l01', 'l02', 'l03', 'l04', 'l05', 'l06'];
  var POOL = {
    l01: ['tbl_total', 'tbl_miss'],
    l02: ['pg_read10', 'pg_read5', 'pg_cmp3', 'pg_most', 'pg_diff'],
    l03: ['draw_big', 'draw_small', 'draw_3u', 'pg_sum2'],
    l04: ['sv_more', 'sv_double', 'sv_absent', 'sv_method'],
    l05: ['draw5', 'check_miss'],
    l06: ['u_two', 'pic_gap', 'same_data', 'big_sum']
  };
  var TYPES = [];
  ORDER.forEach(function (l) { POOL[l].forEach(function (t) { TYPES.push(t); }); });
  var CMP = { pg_cmp3: 1, pg_most: 1, sv_method: 1, same_data: 1 };

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function int(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function sample(rng, arr, n) { return shuffle(rng, arr.slice()).slice(0, n); }

  /* ── 조사 ── 수·말 끝 받침으로 고른다 (㉠ 기역 · ㉡ 니은 = 받침 있음) */
  function B(t) { t = String(t); if (/[㉠㉡]$/.test(t)) return true; return KO.batchim(t); }
  function J(t, pair) { var s = { '은/는': ['은', '는'], '이/가': ['이', '가'], '을/를': ['을', '를'], '와/과': ['과', '와'] }[pair]; return t + (B(t) ? s[0] : s[1]); }
  function IDA(t) { return t + (B(t) ? '이에요.' : '예요.'); }

  /* ── 주제 ── 정본 그 차시에 나온 항목·그림·단위만 (낱말 앞당김 0) */
  var TH = {
    season: { head: '계절', title: '좋아하는 계절별 학생 수', unit: '명', names: ['봄', '여름', '가을', '겨울'], who: function (n) { return J(n, '을/를') + ' 좋아하는 학생'; } },
    animal: { head: '동물', title: '좋아하는 동물별 학생 수', unit: '명', names: ['강아지', '고양이', '햄스터'], who: function (n) { return J(n, '을/를') + ' 좋아하는 학생'; } },
    nation: { head: '나라', title: '여행 가고 싶어 하는 나라별 학생 수', unit: '명', names: ['미국', '일본', '영국'], who: function (n) { return n + '에 가고 싶어 하는 학생'; } },
    leisure: { head: '여가 활동', title: '좋아하는 여가 활동별 학생 수', unit: '명', icon: '🙂', names: ['배드민턴', '산책', '자전거 타기', '줄넘기'], who: function (n) { return J(n, '을/를') + ' 좋아하는 학생'; } },
    hula: { head: '이름', title: '훌라후프를 한 횟수', unit: '회', icon: '⭕', names: ['은비', '건우', '도윤', '지유'] },
    farm: { head: '농장', title: '농장별 기르는 오리의 수', unit: '마리', icon: '🦆', names: ['가', '나', '다'] },
    shoe: { head: '신발', title: '신발별 판매 수', unit: '켤레', icon: '👟', names: ['운동화', '구두', '샌들', '장화'] },
    veg: { head: '채소', title: '좋아하는 채소별 학생 수', unit: '명', icon: '🥕', names: ['당근', '시금치', '오이', '콩나물'] },
    food: { head: '음식', title: '좋아하는 전통 음식별 학생 수', unit: '명', icon: '🍲', names: ['떡국', '불고기', '비빔밥', '식혜'] },
    sugar: { head: '음식', title: '음식별 각설탕 수', unit: '개', icon: '🧊', names: ['떡볶이', '탄산음료'] },
    inst: { head: '악기', title: '배우고 싶어 하는 악기별 학생 수', unit: '명', names: ['가야금', '오카리나', '우쿨렐레', '플루트'] },
    snack: { head: '간식', title: '좋아하는 간식별 학생 수', unit: '명', names: ['과자', '과일', '떡', '아이스크림'] },
    run: { head: '이름', title: '한 달 동안 운동한 횟수', unit: '회', icon: '🏃', names: ['건우', '서준', '은비', '지유'] },
    fruit: { head: '과일', title: '좋아하는 과일별 학생 수', unit: '명', icon: '🍎', names: ['사과', '배', '포도'] },
    fire: { head: '계절', title: '계절별 산불 발생 건수', unit: '건', icon: '🔥', names: ['봄', '여름', '가을', '겨울'] }
  };

  /* ── 그림 수 ── 큰 그림부터 (정본 l03 s05 「큰 수를 나타내는 그림을 먼저」) */
  function pics(v, units) { var out = [], r = v; units.forEach(function (u) { out.push(Math.floor(r / u)); r = r % u; }); return out; }
  function picN(v, units) { return pics(v, units).reduce(function (a, b) { return a + b; }, 0); }
  function legendLine(units, unit) { return units.map(function (u) { return u + unit; }).join(' · '); }
  function picWords(v, units, unit) {               // 「10명 그림 1개 + 1명 그림 8개」 (0개 그림은 뺀다)
    var c = pics(v, units), out = [];
    units.forEach(function (u, i) { if (c[i]) out.push(u + unit + ' 그림 ' + c[i] + '개'); });
    return out.join(' + ');
  }
  function sumLine(v, units) {                      // 「10 + 10 + 1 = 21」 꼴은 그림이 적을 때만, 많으면 「20 + 1 = 21」
    var c = pics(v, units), part = [];
    units.forEach(function (u, i) { if (c[i]) part.push(u * c[i]); });
    return part.length > 1 ? part.join(' + ') + ' = ' + v : String(v);
  }

  /* ── 선택지 ── 정답 + 오류값(정본 실명 먼저) + 곁 값 채움 */
  function N(x) { return (x == null || x <= 0 || Math.floor(x) !== x) ? null : String(x); }
  function build4(ans, wrongs, fill, rng) {
    var opts = [ans];
    wrongs.forEach(function (w) { if (w != null && w !== ans && opts.indexOf(w) < 0 && opts.length < 4) opts.push(w); });
    var guard = 0;
    while (opts.length < 4 && guard++ < 80) {
      var w = fill(rng);
      if (w != null && w !== ans && opts.indexOf(w) < 0) opts.push(w);
    }
    return shuffle(rng, opts);
  }
  function numFill(ans, step) {
    return function (rng) { var c = +ans + (Math.floor(rng() * 7) - 3) * step; return c > 0 && c !== +ans ? String(c) : null; };
  }

  function tableFig(th, rows, total) { return { k: 'tbl', head: th.head, title: th.title, unit: th.unit, rows: rows, total: total }; }
  function graphFig(th, units, rows) { return { k: 'pg', head: th.head, title: th.title, unit: th.unit, icon: th.icon, units: units, rows: rows }; }

  /* ══ l01 표 ══ */
  function makeTblTotal(rng) {
    var th = TH[pick(rng, ['season', 'season', 'animal'])];
    var rows = th.names.map(function (n) { return { name: n, v: int(rng, 2, 12) }; });
    var vs = rows.map(function (r) { return r.v; }), sum = vs.reduce(function (a, b) { return a + b; }, 0), mx = Math.max.apply(null, vs);
    var drop = pick(rng, vs);
    var q = { type: 'tbl_total', fig: tableFig(th, rows, '?') };
    q.prompt = '표를 보고 조사한 학생은 모두 몇 명인지 구하세요.';
    q.answer = String(sum);
    q.options = build4(q.answer, [N(mx), N(sum - drop), N(rows.length)], numFill(sum, 1), rng);   // s08 합계 = 가장 많은 수 · 하나 빠뜨림 · s11 「계절의 수」
    q.parts = [vs.join(' + ') + ' = ' + sum, '합계 ' + sum + '명'];
    q.explain = '합계는 조사한 학생 모두의 수예요. ' + vs.join(' + ') + ' = ' + IDA(sum) + ' 가장 많은 ' + mx + '명이 합계가 아니에요.';
    return q;
  }
  function makeTblMiss(rng) {
    var th = TH[pick(rng, ['nation', 'nation', 'animal'])];
    var a = int(rng, 11, 24), b = int(rng, 11, 24), c = int(rng, 6, 19), tot = a + b + c;
    var rows = [{ name: th.names[0], v: a }, { name: th.names[1], v: b }, { name: th.names[2], v: '?' }];
    var q = { type: 'tbl_miss', fig: tableFig(th, rows, tot), a: a, b: b, tot: tot };
    q.prompt = '합계가 ' + tot + '명이에요. ' + th.who(th.names[2]) + '은 몇 명일까요?';
    q.answer = String(c);
    q.options = build4(q.answer, [N(tot + a + b), N(tot - a), N(a + b)], numFill(c, 1), rng);    // watch 합계에 두 수를 더해 버림 · 하나만 뺌 · 아는 두 수만 더함
    q.parts = [tot + ' − ' + a + ' = ' + (tot - a), (tot - a) + ' − ' + b + ' = ' + c, th.names[2] + ' ' + c + '명'];
    q.explain = '합계 ' + tot + '에서 아는 수를 빼요. ' + tot + ' − ' + a + ' − ' + b + ' = ' + IDA(c) + ' 합계에 두 수를 더하면 안 돼요.';
    return q;
  }

  /* ══ l02 그림그래프 읽기 ══ */
  function rowsFor(rng, th, units, n, lo, hi, okv) {
    var names = th.names.slice(0, n), rows = [], used = {};
    names.forEach(function (nm) {
      var v, g = 0;
      do { v = int(rng, lo, hi); } while ((used[v] || (okv && !okv(v))) && g++ < 60);
      used[v] = 1; rows.push({ name: nm, v: v });
    });
    return rows;
  }
  function makeRead10(rng) {
    var th = TH.leisure, U = [10, 1];
    var rows = rowsFor(rng, th, U, 4, 11, 49, function (v) { return v % 10 !== 0 && Math.floor(v / 10) !== v % 10; });
    var r = pick(rng, rows); r.ask = true;
    var c = pics(r.v, U), big = c[0], sm = c[1];
    var q = { type: 'pg_read10', fig: graphFig(th, U, rows), v: r.v };
    q.prompt = '큰 그림은 10명, 작은 그림은 1명이에요. ' + th.who(r.name) + '은 몇 명일까요?';
    q.answer = String(r.v);
    q.options = build4(q.answer, [N(big + sm), N(sm * 10 + big), N(big * 10)], numFill(r.v, 1), rng);   // watch 개수만 셈 · 큰·작은 그림을 바꾸어 셈 · 작은 그림 빠뜨림
    q.parts = ['큰 그림 ' + big + '개 → ' + big * 10, '작은 그림 ' + sm + '개 → ' + sm, big * 10 + ' + ' + sm + ' = ' + r.v];
    q.explain = '큰 그림 ' + big + '개는 ' + (big * 10) + '명, 작은 그림 ' + sm + '개는 ' + sm + '명이라서 ' + IDA(r.v + '명') + ' 그림 ' + (big + sm) + '개를 그대로 세면 안 돼요.';
    return q;
  }
  function makeRead5(rng) {
    var th = TH.hula, U = [5, 1];
    var rows = rowsFor(rng, th, U, 4, 6, 24, function (v) { return v % 5 !== 0; });
    var r = pick(rng, rows); r.ask = true;
    var c = pics(r.v, U), big = c[0], sm = c[1];
    var q = { type: 'pg_read5', fig: graphFig(th, U, rows), v: r.v };
    q.prompt = '큰 그림은 5회, 작은 그림은 1회예요. ' + J(r.name, '은/는') + ' 훌라후프를 몇 회 했을까요?';
    q.answer = String(r.v);
    q.options = build4(q.answer, [N(big * 10 + sm), N(big + sm), N(big * 5)], numFill(r.v, 1), rng);    // watch 큰 그림을 10회로(22회) · 개수만 셈 · 작은 그림 빠뜨림
    var five = []; for (var i = 0; i < big; i++) five.push(5);
    for (i = 0; i < sm; i++) five.push(1);
    q.parts = ['큰 그림 ' + big + '개 → ' + big * 5, '작은 그림 ' + sm + '개 → ' + sm, five.join(' + ') + ' = ' + r.v];
    q.explain = '큰 그림 하나는 5회예요. ' + five.join(' + ') + ' = ' + IDA(r.v + '회') + ' 큰 그림을 10회로 세면 ' + (big * 10 + sm) + '회가 되어 틀려요.';
    return q;
  }
  var CMP3 = ['㉠이 많아요', '㉡이 많아요', '둘이 같아요', '알 수 없어요'];
  function makeCmp3(rng) {
    var th = TH.leisure, U = [10, 1], n = pick(rng, [3, 3, 4]), k, m;
    do { k = int(rng, 1, n - 1); m = int(rng, 1, n - 1); } while (k === m);
    var va = 10 * k + (n - k), vb = 10 * m + (n - m);
    var rows = [{ name: '㉠', v: va }, { name: '㉡', v: vb }];
    var q = { type: 'pg_cmp3', fig: { k: 'pg', head: '기호', title: '그림이 ' + n + '개씩', unit: '명', icon: th.icon, units: U, rows: rows }, va: va, vb: vb, n: n };
    q.prompt = '㉠과 ㉡은 그림이 ' + n + '개씩이에요. 큰 그림은 10명, 작은 그림은 1명일 때 바르게 말한 것은 무엇일까요?';
    q.answer = va > vb ? CMP3[0] : CMP3[1];
    q.options = shuffle(rng, CMP3.slice());                                       // s08 「3개씩이니까 같다」 = 「둘이 같아요」
    q.parts = ['㉠ ' + sumLine(va, U), '㉡ ' + sumLine(vb, U), q.answer];
    q.explain = '그림의 크기를 먼저 봐요. ㉠은 ' + sumLine(va, U) + ', ㉡은 ' + IDA(sumLine(vb, U)) + ' 그림 수가 같아도 크기가 다르면 수가 달라요.';
    return q;
  }
  var MOST4 = ['가 농장', '나 농장', '다 농장', '알 수 없어요'];
  function makeMost(rng) {
    var th = TH.farm, U = [10, 1];
    var a = int(rng, 3, 5), win = 10 * a + int(rng, 0, 3), trap = 10 * (a - 1) + int(rng, 7, 9);
    var low = rng() < 0.5 ? 10 * (a - 1) + int(rng, 0, (trap % 10) - 1) : 10 * (a - 2) + int(rng, 0, 9);   // 정본 s06 가 34 · 다 38 (큰 그림 같은 두 줄)
    var vals = shuffle(rng, [win, trap, low]);
    var rows = th.names.map(function (nm, i) { return { name: nm, v: vals[i] }; });
    var wi = vals.indexOf(win), ti = vals.indexOf(trap);
    var q = { type: 'pg_most', fig: graphFig(th, U, rows), win: th.names[wi], trap: th.names[ti] };
    q.prompt = '큰 그림은 10마리, 작은 그림은 1마리예요. 오리를 가장 많이 기르는 농장은 어디일까요?';
    q.answer = MOST4[wi];
    q.options = shuffle(rng, MOST4.slice());                                     // watch 그림 전체 개수만 세어 고르는 농장 = 덫(늘 선택지)
    q.parts = rows.map(function (r) { return r.name + ' ' + r.v + '마리'; }).concat([q.answer]);
    q.explain = '큰 그림이 가장 많은 농장부터 봐요. ' + th.names[wi] + ' 농장은 큰 그림이 ' + a + '개라서 ' + IDA(win + '마리') + ' ' +
                th.names[ti] + ' 농장은 그림이 더 많아도 ' + IDA(trap + '마리');
    return q;
  }
  function makeDiff(rng) {
    var th = TH.shoe, U = [10, 1], x1, x2, y1, y2, g = 0;
    do {
      x1 = int(rng, 1, 4); y1 = int(rng, 1, x1); x2 = int(rng, 0, 9); y2 = int(rng, 1, 9);   // 큰 그림이 같은 판 = 정본 s15 샌들 15 · 구두 12
    } while ((x2 === y2 || (x1 === y1 && x2 <= y2) || (x1 + x2) === (y1 + y2) && x1 !== y1) && g++ < 40);
    var vx = 10 * x1 + x2, vy = 10 * y1 + y2, ans = vx - vy;
    var two = sample(rng, th.names, 2), X = two[0], Y = two[1];
    var rows = th.names.map(function (nm) {
      if (nm === X) return { name: nm, v: vx, ask: true };
      if (nm === Y) return { name: nm, v: vy, ask: true };
      return { name: nm, v: int(rng, 5, 29) };
    });
    var q = { type: 'pg_diff', fig: graphFig(th, U, rows), vx: vx, vy: vy };
    q.prompt = '큰 그림은 10켤레, 작은 그림은 1켤레예요. ' + J(X, '은/는') + ' ' + Y + '보다 몇 켤레 더 많을까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [N(vx + vy), N(picN(vx, U) - picN(vy, U)), N(Math.abs(x2 - y2)), N(vx)], numFill(ans, 1), rng);   // 더해 버림 · 그림 개수끼리 뺌 · s15 작은 그림만
    q.parts = [X + ' ' + sumLine(vx, U), Y + ' ' + sumLine(vy, U), vx + ' − ' + vy + ' = ' + ans];
    q.explain = X + ' ' + vx + '켤레, ' + Y + ' ' + vy + '켤레예요. ' + vx + ' − ' + vy + ' = ' + IDA(ans + '켤레') + ' 그림 개수끼리 빼면 안 돼요.';
    return q;
  }

  /* ══ l03 그림그래프로 나타내기 ══ */
  function makeDraw10(rng, which) {
    var th = TH.veg, U = [10, 1];
    var rows = rowsFor(rng, th, U, 4, 11, 49, function (v) { return v % 10 !== 0 && Math.floor(v / 10) !== v % 10; });
    var r = pick(rng, rows); r.ask = true; r.hide = true;
    var c = pics(r.v, U), big = c[0], sm = c[1];
    var q = { type: which === 'big' ? 'draw_big' : 'draw_small', fig: graphFig(th, U, rows), v: r.v };
    q.prompt = '큰 그림은 10명, 작은 그림은 1명이에요. ' + r.name + ' ' + r.v + '명을 나타낼 때 ' + (which === 'big' ? '10명' : '1명') + ' 그림은 몇 개 그리나요?';
    if (which === 'big') {
      q.answer = String(big);
      q.options = build4(q.answer, [N(sm), N(r.v), N(big + sm)], numFill(big, 1), rng);          // 작은 그림 수와 바꿈 · 수 그대로 · 그림 모두
    } else {
      q.answer = String(sm);
      q.options = build4(q.answer, [N(r.v), N(big), N(big + sm)], numFill(sm, 1), rng);          // watch 작은 그림 18개 · 큰 그림 수 · 그림 모두
    }
    q.parts = which === 'big' ? [r.v + ' = ' + (big * 10) + ' + ' + sm, '1명 그림 ' + sm + '개', '10명 그림 ' + big + '개']
                              : [r.v + ' = ' + (big * 10) + ' + ' + sm, '10명 그림 ' + big + '개', '1명 그림 ' + sm + '개'];
    q.explain = '큰 그림부터 그려요. ' + r.v + '명은 ' + picWords(r.v, U, '명') + '예요. 1명 그림 ' + r.v + '개로 그리면 견주기 어려워요.';
    return q;
  }
  function makeDraw3(rng) {
    var th = TH.food, U = [100, 10, 1];
    var h = int(rng, 1, 3), t = int(rng, 1, 9), o = int(rng, 1, 9);
    if (t === o) o = o === 9 ? 1 : o + 1;
    var v = 100 * h + 10 * t + o, ask = pick(rng, ['ten', 'ten', 'hund', 'all']);
    var nm = pick(rng, th.names.slice(0, 3));
    var rows = th.names.map(function (n) { return n === nm ? { name: n, v: v, ask: true, hide: true } : { name: n, v: n === '식혜' ? int(rng, 11, 39) : int(rng, 101, 139) }; });
    var q = { type: 'draw_3u', fig: graphFig(th, U, rows), v: v, ask: ask };
    var lead = '100명 · 10명 · 1명 그림으로 ' + nm + ' ' + v + '명을 나타낼 때 ';
    if (ask === 'ten') {
      q.prompt = lead + '10명 그림은 몇 개일까요?';
      q.answer = String(t);
      q.options = build4(q.answer, [N(Math.floor(v / 10)), N(h), N(o)], numFill(t, 1), rng);    // watch 100명 그림과 10명 그림을 헷갈림(10명 그림만 쓴 수)
    } else if (ask === 'hund') {
      q.prompt = lead + '100명 그림은 몇 개일까요?';
      q.answer = String(h);
      q.options = build4(q.answer, [N(Math.floor(v / 10)), N(t), N(o)], numFill(h, 1), rng);
    } else {
      q.prompt = lead + '그림은 모두 몇 개일까요?';
      q.answer = String(h + t + o);
      q.options = build4(q.answer, [N(v), N(3), N(h + t)], numFill(h + t + o, 1), rng);           // s12 그림 수 대신 사람 수 112 · 그림 종류 수
    }
    q.parts = ask === 'all' ? ['100명 그림 ' + h + '개', '10명 그림 ' + t + '개', '1명 그림 ' + o + '개', h + ' + ' + t + ' + ' + o + ' = ' + (h + t + o)]
            : ask === 'ten' ? ['100명 그림 ' + h + '개', '1명 그림 ' + o + '개', '10명 그림 ' + t + '개']
            : ['10명 그림 ' + t + '개', '1명 그림 ' + o + '개', '100명 그림 ' + h + '개'];
    q.explain = v + '명은 ' + picWords(v, U, '명') + '예요.' + (ask === 'all' ? ' 그림은 모두 ' + (h + t + o) + '개 — ' + J(String(v), '은/는') + ' 사람 수예요.' : ' 100명 그림을 먼저 그려요.');
    return q;
  }
  function makeSum2(rng) {
    var th = TH.sugar, U = [10, 1], a1 = int(rng, 1, 3), a2 = int(rng, 2, 9), b1 = int(rng, 1, 4), b2 = int(rng, 1, 9);
    var va = 10 * a1 + a2, vb = 10 * b1 + b2, ans = va + vb;
    var rows = [{ name: th.names[0], v: va, ask: true }, { name: th.names[1], v: vb, ask: true }];
    var q = { type: 'pg_sum2', fig: graphFig(th, U, rows), va: va, vb: vb };
    q.prompt = '큰 그림은 10개, 작은 그림은 1개예요. 두 음식의 각설탕은 모두 몇 개일까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [N(a1 + a2 + b1 + b2), N(Math.abs(va - vb)), N(va > vb ? va : vb)], numFill(ans, 1), rng);   // s15 큰 그림을 1개로 세어 합을 작게
    q.parts = [th.names[0] + ' ' + sumLine(va, U), th.names[1] + ' ' + sumLine(vb, U), va + ' + ' + vb + ' = ' + ans];
    q.explain = th.names[0] + ' ' + va + '개, ' + th.names[1] + ' ' + vb + '개라서 ' + va + ' + ' + vb + ' = ' + IDA(ans + '개') +
                ' 큰 그림을 1개로 세면 ' + (a1 + a2 + b1 + b2) + '개가 되어 틀려요.';
    return q;
  }

  /* ══ l04 자료 모으기 ══ */
  function makeSvMore(rng) {
    var th = TH.inst;
    var rows = th.names.map(function (n) { return { name: n, v: int(rng, 12, 32) }; });
    var two = sample(rng, rows, 2).sort(function (p, r) { return r.v - p.v; });
    if (two[0].v === two[1].v) two[0].v += int(rng, 3, 9);
    var X = two[0], Y = two[1], ans = X.v - Y.v;
    var q = { type: 'sv_more', fig: tableFig(th, rows, rows.reduce(function (s, r) { return s + r.v; }, 0)) };
    q.prompt = J(X.name, '을/를') + ' 배우고 싶어 하는 학생은 ' + Y.name + '보다 몇 명 더 많을까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [N(X.v + Y.v), N(X.v), N(Y.v)], numFill(ans, 1), rng);
    q.parts = [X.name + ' ' + X.v + '명', Y.name + ' ' + Y.v + '명', X.v + ' − ' + Y.v + ' = ' + ans];
    q.explain = X.name + ' ' + X.v + '명에서 ' + Y.name + ' ' + Y.v + '명을 빼요. ' + X.v + ' − ' + Y.v + ' = ' + IDA(ans + '명');
    return q;
  }
  function makeSvDouble(rng) {
    var th = TH.inst;
    var rows = th.names.map(function (n) { return { name: n, v: int(rng, 12, 32) }; });
    var tot = rows.reduce(function (s, r) { return s + r.v; }, 0), d = int(rng, 1, 4);
    var q = { type: 'sv_double', fig: tableFig(th, rows, tot), tot: tot, d: d };
    q.prompt = '투표 종이를 세어 합계가 ' + tot + '명이었는데, 다시 세어 보니 ' + (tot + d) + '명이었어요. 몇 명을 두 번 셌을까요?';
    q.answer = String(d);
    q.options = build4(q.answer, [N(tot + tot + d), N(tot + d), N(tot)], numFill(d, 1), rng);
    q.parts = ['처음 합계 ' + tot + '명', '다시 센 합계 ' + (tot + d) + '명', (tot + d) + ' − ' + tot + ' = ' + d];
    q.explain = '다시 센 합계에서 처음 합계를 빼요. ' + (tot + d) + ' − ' + tot + ' = ' + IDA(d + '명') + ' 합계로 확인하면 두 번 센 것을 찾을 수 있어요.';
    return q;
  }
  function makeSvAbsent(rng) {
    var th = TH.snack;
    var rows = th.names.map(function (n) { return { name: n, v: int(rng, 4, 9) }; });
    var stuck = rows.reduce(function (s, r) { return s + r.v; }, 0), miss = int(rng, 1, 4), cls = stuck + miss;
    var q = { type: 'sv_absent', fig: tableFig(th, rows, stuck), stuck: stuck, cls: cls };
    q.prompt = '붙임딱지로 좋아하는 간식을 조사했어요. 반 학생은 ' + cls + '명이에요. 붙이지 않은 학생은 몇 명일까요?';
    q.answer = String(miss);
    q.options = build4(q.answer, [N(stuck), N(cls), N(cls + stuck)], numFill(miss, 1), rng);
    q.parts = [rows.map(function (r) { return r.v; }).join(' + ') + ' = ' + stuck, cls + ' − ' + stuck + ' = ' + miss];
    q.explain = '붙인 학생은 ' + stuck + '명이에요. 반 학생 ' + cls + '명에서 빼면 ' + cls + ' − ' + stuck + ' = ' + IDA(miss + '명') + ' 빠짐없이 모으려면 「기타」 칸을 두어요.';
    return q;
  }
  var METHOD = [
    { name: '투표하기', say: '종이에 적어서 상자에 넣어요' },              // 정본 s09 「상자에 종이를 넣어요」
    { name: '손 들기', say: '좋아하는 것을 부르면 손을 번쩍 올려요' },
    { name: '붙임딱지 붙이기', say: '좋아하는 칸에 붙임딱지를 하나씩 붙여요' },
    { name: '돌아다니며 묻기', say: '친구에게 한 명씩 다가가 물어봐요' }
  ];
  function makeSvMethod(rng) {
    var m = pick(rng, METHOD);
    var q = { type: 'sv_method' };
    q.prompt = '「' + m.say + '」라고 말했어요. 어떤 조사 방법일까요?';
    q.answer = m.name;
    q.options = shuffle(rng, METHOD.map(function (x) { return x.name; }));
    q.parts = ['「' + m.say + '」', '→ ' + m.name];
    q.explain = IDA(m.name) + ' 조사 방법마다 모으는 모양과 좋은 점이 달라요.';
    return q;
  }

  /* ══ l05 그리고 확인하기 ══ */
  function makeDraw5(rng) {
    var th = TH.run, U = [5, 1];
    var rows = rowsFor(rng, th, U, 4, 6, 24, function (v) { return v % 5 !== 0; });
    var r = pick(rng, rows); r.ask = true; r.hide = true;
    var c = pics(r.v, U), big = c[0], sm = c[1], which = rng() < 0.5 ? 'big' : 'small';
    var q = { type: 'draw5', fig: graphFig(th, U, rows), v: r.v, which: which };
    q.prompt = '큰 그림은 5회, 작은 그림은 1회예요. ' + J(r.name, '이/가') + ' 운동한 ' + r.v + '회를 나타낼 때 ' + (which === 'big' ? '5회' : '1회') + ' 그림은 몇 개 그리나요?';
    if (which === 'big') {
      q.answer = String(big);
      q.options = build4(q.answer, [N(Math.floor(r.v / 10)), N(r.v), N(big + sm)], numFill(big, 1), rng);   // watch 큰 그림을 10회로 착각 · 수 그대로 · 그림 모두
    } else {
      q.answer = String(sm);
      q.options = build4(q.answer, [N(r.v), N(r.v - 5), N(big)], numFill(sm, 1), rng);
    }
    q.parts = which === 'big' ? [r.v + ' = ' + (big * 5) + ' + ' + sm, '1회 그림 ' + sm + '개', '5회 그림 ' + big + '개']
                              : [r.v + ' = ' + (big * 5) + ' + ' + sm, '5회 그림 ' + big + '개', '1회 그림 ' + sm + '개'];
    q.explain = '5회 그림 하나가 5회예요. ' + r.v + '회는 ' + picWords(r.v, U, '회') + '예요. 큰 그림을 10회로 여기면 틀려요.';
    return q;
  }
  function makeCheckMiss(rng) {
    var th = TH.fruit, U = [10, 1];
    var vals = [10 + int(rng, 1, 9), 10 + int(rng, 1, 9), int(rng, 5, 9)];
    if (vals[0] === vals[1]) vals[1] = vals[1] === 19 ? 11 : vals[1] + 1;
    var rows = th.names.map(function (n, i) { return { name: n, v: vals[i] }; });
    var sum = vals[0] + vals[1] + vals[2], d = int(rng, 1, 3), tot = sum + d;
    var pc = vals.reduce(function (s, v) { return s + picN(v, U); }, 0);
    var q = { type: 'check_miss', fig: graphFig(th, U, rows), sum: sum, tot: tot, pc: pc };
    q.fig.note = '표의 합계 ' + tot + '명';
    q.prompt = '큰 그림은 10명, 작은 그림은 1명이에요. 표의 합계가 ' + tot + '명이라면 그림그래프에는 몇 명을 덜 그렸을까요?';
    q.answer = String(d);
    q.options = build4(q.answer, [N(tot - pc), N(pc), N(sum)], numFill(d, 1), rng);           // s15 그림 개수를 더해 17 · 37 − 17
    q.parts = [vals.join(' + ') + ' = ' + sum, tot + ' − ' + sum + ' = ' + d];
    q.explain = '그림이 나타내는 수를 더하면 ' + vals.join(' + ') + ' = ' + IDA(sum) + ' 표의 합계 ' + J(String(tot), '와/과') + ' 견주면 ' + tot + ' − ' + sum + ' = ' + d + '명을 덜 그렸어요.';
    return q;
  }

  /* ══ l06 단위가 다른 두 그림그래프 ══ */
  function makeUTwo(rng) {
    var th = TH.fire, h = int(rng, 1, 3), t = int(rng, 1, 9), o = int(rng, 1, 9);
    if (t === h) t = t === 9 ? 2 : t + 1;
    var v = 100 * h + 10 * t + o, side = rng() < 0.5 ? 'ga' : 'na', season = pick(rng, th.names);
    var U = side === 'ga' ? [10, 1] : [100, 10, 1];
    var q = { type: 'u_two', side: side, v: v, fig: graphFig(th, U, [{ name: season, v: v, ask: true, hide: true }]) };
    q.fig.label = side === 'ga' ? '가 — 10건 · 1건' : '나 — 100건 · 10건 · 1건';
    if (side === 'ga') {
      q.prompt = '가 그림그래프는 10건 · 1건 그림을 써요. ' + season + ' ' + v + '건을 나타낼 때 10건 그림은 몇 개일까요?';
      q.answer = String(10 * h + t);
      q.options = build4(q.answer, [N(t), N(h), N(v)], numFill(10 * h + t, 1), rng);           // 100건 그림이 없는데 있는 것처럼 · watch 26개를 2개로
      q.parts = [v + ' = ' + (100 * h + 10 * t) + ' + ' + o, '1건 그림 ' + o + '개', '10건 그림 ' + (10 * h + t) + '개'];
      q.explain = '가에는 100건 그림이 없어요. ' + v + ' 안에 10이 ' + (10 * h + t) + '번 들어가서 10건 그림 ' + (10 * h + t) + '개, 1건 그림 ' + o + '개예요.';
    } else {
      q.prompt = '나 그림그래프는 100건 · 10건 · 1건 그림을 써요. ' + season + ' ' + v + '건을 나타낼 때 100건 그림은 몇 개일까요?';
      q.answer = String(h);
      q.options = build4(q.answer, [N(10 * h + t), N(t), N(o)], numFill(h, 1), rng);
      q.parts = ['10건 그림 ' + t + '개', '1건 그림 ' + o + '개', '100건 그림 ' + h + '개'];
      q.explain = v + '건은 ' + picWords(v, [100, 10, 1], '건') + '예요. 100건 그림을 먼저 그려요.';
    }
    return q;
  }
  function makePicGap(rng) {
    var th = TH.fire, h = int(rng, 1, 3), t = int(rng, 1, 9), o = int(rng, 1, 9);
    var v = 100 * h + 10 * t + o, A = 10 * h + t + o, Bn = h + t + o, ans = A - Bn, season = pick(rng, th.names);
    var q = { type: 'pic_gap', v: v };
    q.prompt = season + ' ' + v + '건을 10건 · 1건 그림으로 나타낼 때와 100건 · 10건 · 1건 그림으로 나타낼 때 그림 수의 차이는 몇 개일까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [N(A), N(Bn), N(A + Bn)], numFill(ans, 1), rng);
    q.parts = ['10건 · 1건: ' + (10 * h + t) + ' + ' + o + ' = ' + A, '100건 · 10건 · 1건: ' + h + ' + ' + t + ' + ' + o + ' = ' + Bn, A + ' − ' + Bn + ' = ' + ans];
    q.explain = '10건 · 1건 그림은 ' + A + '개, 100건 · 10건 · 1건 그림은 ' + Bn + '개예요. ' + A + ' − ' + Bn + ' = ' + IDA(ans + '개') + ' 건수가 아니라 그림 수끼리 빼요.';
    return q;
  }
  var FIRE2022 = [377, 29, 82, 268];
  var SAME4 = ['가 쪽이 많아요', '나 쪽이 많아요', '둘이 같아요', '알 수 없어요'];
  function makeSame(rng) {
    var th = TH.fire, h = 1, t = int(rng, 1, 5), o = int(rng, 1, 6), v = 100 * h + 10 * t + o, season = pick(rng, th.names);
    var q = { type: 'same_data', v: v, fig: { k: 'pg2', title: th.title, unit: th.unit, icon: th.icon, name: season, v: v, a: [10, 1], b: [100, 10, 1] } };
    q.prompt = '가와 나는 같은 조사를 나타낸 그림그래프예요. 나는 가보다 그림이 더 적어요. ' + season + ' 산불은 어느 쪽이 더 많을까요?';
    q.answer = SAME4[2];
    q.options = shuffle(rng, SAME4.slice());                                    // s08 「그림이 적으니까 산불도 적다」 = 「가 쪽이 많아요」
    q.parts = ['가 ' + picWords(v, [10, 1], '건'), '나 ' + picWords(v, [100, 10, 1], '건'), '둘 다 ' + v + '건 → 둘이 같아요'];
    q.explain = '가와 나는 같은 자료예요. 나는 100건 그림을 더 써서 같은 수를 적은 그림으로 나타냈을 뿐이에요. 둘 다 ' + IDA(v + '건');
    return q;
  }
  function makeBigSum(rng) {
    var th = TH.fire, a, b, g = 0, two = sample(rng, th.names, 2), rows;
    if (rng() < 0.5) {                               // 정본 s06·s11·s15 2022년 계절별 산불 — 봄 377 · 여름 29 · 가을 82 · 겨울 268 (둘씩 더하면 늘 받아올림)
      rows = th.names.map(function (n, i) { return { name: n, v: FIRE2022[i] }; });
      a = FIRE2022[th.names.indexOf(two[0])]; b = FIRE2022[th.names.indexOf(two[1])];
    } else {
      do { a = int(rng, 120, 399); b = int(rng, 21, 289); } while (((a % 10) + (b % 10) < 10 && (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10) && g++ < 60);
      rows = th.names.map(function (n) { return { name: n, v: n === two[0] ? a : n === two[1] ? b : int(rng, 21, 199) }; });
    }
    var ans = a + b;
    function noCarry(x, y) {                         // 받아올림을 빠뜨림 — 끝 수끼리만 적음
      var s = 0, p = 1;
      while (x > 0 || y > 0) { s += ((x % 10 + y % 10) % 10) * p; x = Math.floor(x / 10); y = Math.floor(y / 10); p *= 10; }
      return s;
    }
    var q = { type: 'big_sum', fig: tableFig(th, rows, null) };
    q.prompt = J(two[0], '와/과') + ' ' + two[1] + '의 산불을 합하면 모두 몇 건일까요?';
    q.answer = String(ans);
    q.options = build4(q.answer, [N(noCarry(a, b)), N(Math.abs(a - b)), N(ans - 100)], numFill(ans, 10), rng);   // watch 받아올림을 빠뜨림
    q.parts = [a + ' + ' + b + ' = ' + ans, '모두 ' + ans + '건'];
    q.explain = two[0] + ' ' + a + '건과 ' + two[1] + ' ' + b + '건을 더해요. ' + a + ' + ' + b + ' = ' + IDA(ans + '건') + ' 받아올림을 빠뜨리지 않아요.';
    return q;
  }

  /* ── 활동지 — 종이엔 무대 그림이 없으니 표·그림그래프를 글로 적는다 ── */
  function figText(q) {
    var f = q.fig;
    if (!f) return '';
    if (f.k === 'tbl') return '[' + f.title + '] ' + f.rows.map(function (r) { return r.name + ' ' + r.v; }).join(' · ') +
                              (f.total == null ? '' : ' · 합계 ' + f.total) + ' (' + f.unit + ')';
    if (f.k === 'pg2') return '[가 — ' + legendLine(f.a, f.unit) + '] ' + f.name + ' ' + picWords(f.v, f.a, f.unit) +
                              ' / [나 — ' + legendLine(f.b, f.unit) + '] ' + f.name + ' ' + picWords(f.v, f.b, f.unit);
    return '[' + f.title + ' · 그림 ' + legendLine(f.units, f.unit) + '] ' + f.rows.map(function (r) {
      if (r.hide) return r.name + ' (그릴 줄)';
      return r.name + ' ' + picWords(r.v, f.units, f.unit);
    }).join(' / ') + (f.note ? ' · ' + f.note : '');
  }

  var MAKE = {
    tbl_total: makeTblTotal, tbl_miss: makeTblMiss,
    pg_read10: makeRead10, pg_read5: makeRead5, pg_cmp3: makeCmp3, pg_most: makeMost, pg_diff: makeDiff,
    draw_big: function (r) { return makeDraw10(r, 'big'); }, draw_small: function (r) { return makeDraw10(r, 'small'); },
    draw_3u: makeDraw3, pg_sum2: makeSum2,
    sv_more: makeSvMore, sv_double: makeSvDouble, sv_absent: makeSvAbsent, sv_method: makeSvMethod,
    draw5: makeDraw5, check_miss: makeCheckMiss,
    u_two: makeUTwo, pic_gap: makePicGap, same_data: makeSame, big_sum: makeBigSum
  };

  return {
    id: 'pict_graph',
    title: '그림그래프',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, TH: TH, METHOD: METHOD, MAKE: MAKE,
    pics: pics, picN: picN, legendLine: legendLine,
    typesUpto: function (upto) {
      var end = (upto === 'all' || ORDER.indexOf(upto) < 0) ? ORDER.length - 1 : ORDER.indexOf(upto);
      var out = [];
      for (var i = 0; i <= end; i++) POOL[ORDER[i]].forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); });
      return out;
    },
    create: function (params, rng) {
      var p = params || {};
      var upto = (p.upto && (p.upto === 'all' || ORDER.indexOf(p.upto) >= 0)) ? p.upto : 'all';
      var all = this.typesUpto(upto);
      var cur = upto === 'all' ? all : POOL[upto];
      var count = 0, seen = {}, last = null;
      return {
        next: function () {
          var type, g0 = 0;
          do {
            if (count < 2) type = pick(rng, cur);                               // 이번 차시 먼저
            else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
            else type = pick(rng, all);
          } while (type === last && all.length > 1 && g0++ < 6);
          last = type;
          count++;
          var q, guard = 0;
          do { q = MAKE[type](rng); } while (seen[q.prompt + q.answer] && guard++ < 20);
          seen[q.prompt + q.answer] = 1;
          q.wordy = true;
          q.cmp = !!CMP[q.type];
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    figText: figText,
    printRender: function (q) {
      var f = figText(q);
      if (f) f = '<span class="w-fig">' + f + '</span><br>';
      if (q.cmp) return f + '<span class="w-txt">' + q.prompt + ' (' + q.options.join(' · ') + ')</span><span class="w-box"> </span>';
      return f + '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '그림그래프와 표를 보고 □ 안에 알맞은 수나 말을 쓰세요.'
  };
}));
