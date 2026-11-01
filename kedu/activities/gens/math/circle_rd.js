/* gens/math/circle_rd.js — 원의 반지름·지름 (3학년 2학기 수학 3단원 「원」 l04~l07)
 * 순수 함수·DOM 무관 (§9-3). 선다 겨루기·활동지 공유.
 *
 * params: { upto: 'l04'|'l05'|'l06'|'all' }
 *   upto  그 차시까지 배운 갈래만 섞는다. 이번 차시 갈래가 처음 두 문항 + 이후 절반.
 *         'all' = l07(크기 견주기)까지 전부 고르게 (l07 단원 마무리).
 *
 * l01~l03 은 이 판에 넣지 않는다 — 원·반지름·지름의 「뜻」을 묻는 차시라 수 판이 서지 않고,
 * 2배·반 관계는 정본 l04 에서 처음 나온다(앞당김 금지).
 *
 * type (§21-3 · 정본 data/g3s2_math_u3.js 차시 그대로 — D22 차시 순서를 뒤집지 않는다):
 *   r_to_d        l04  반지름 → 지름 (정본 s06 4 → 8 · s09 8 → 16)
 *   d_to_r        l04  지름 → 반지름 (정본 s07 10 → 5)
 *   two_pads      l04  반지름이 같은 방석 둘을 나란히 (정본 s15 20 → 80)
 *   compass_d     l05  지름이 주어진 원 — 컴퍼스 벌릴 길이 (정본 s06·s08 4 → 2 · s10 8 → 4)
 *   compass_r     l05  반지름이 주어진 원 — 그대로 벌림 (정본 s12 기본 5 → 5)
 *   compass_back  l05  벌린 길이로 그린 원의 지름 (정본 s07 4 → 8 · s11 1 → 2)
 *   pat_r         l06  반지름이 되풀이되는 원 무늬 — 몇 번째 원의 반지름 (정본 s09·s10·s12)
 *   pat_center    l06  원의 중심이 옮겨 가는 규칙 — 몇 번째 원의 중심 (정본 s15 2 + 4 + 4 = 10)
 *   compare_big   l07  반지름·지름이 섞인 원 — 가장 큰(작은) 원 (정본 s06 · s08 · s12 도전)
 *   stage_line    l07  반지름 무대 + 지름 무대 나란히 (정본 s15 3 m · 5 m → 11)
 *
 * ★ 오답 선택지 = 정본 「이런 생각을 조심해요」·watch 가 실명으로 적은 오류값 (#11 오류값 규약):
 *   l04 s08 반지름이 지름의 2배 → 반지름 4 의 지름을 2 · s06 watch 4 + 2 = 6 · s07 watch 지름 10 → 반지름 20
 *       s15 watch 방석 반지름 두 개만 더해 40
 *   l05 s08 지름 4 cm 원에 4 cm 벌림 · s07 4 cm 벌리면 지름 8 · s08 watch 반지름이 주어졌는데 반으로 줄임
 *       l07 s10 지름 2 cm 원에 2 cm · 4 cm 벌림
 *   l06 s08 반지름만 보면 된다 → 중심을 반지름만큼 옮긴 값 (2 + 2 + 2 = 6)
 *   l07 s08 반지름 4 cm 원 < 지름 6 cm 원 (수만 견줌) → 「가장 큰 원」에 수가 가장 큰 지름 원
 *       s15 watch 반지름 3 m 와 지름 5 m 를 그대로 더해 8
 *   아이가 자기 실수와 똑같은 값을 집으면 그건 오답이 아니라 진단 정보다.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['circle_rd'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  var ORDER = ['l04', 'l05', 'l06', 'l07'];
  var POOL = {
    l04: ['r_to_d', 'd_to_r', 'two_pads'],
    l05: ['compass_d', 'compass_r', 'compass_back'],
    l06: ['pat_r', 'pat_center'],
    l07: ['compare_big', 'stage_line']
  };
  var TYPES = ['r_to_d', 'd_to_r', 'two_pads', 'compass_d', 'compass_r', 'compass_back',
               'pat_r', 'pat_center', 'compare_big', 'stage_line'];
  var WORDY = { two_pads: 1, pat_r: 1, pat_center: 1, stage_line: 1 };
  var NTH = ['', '첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
  function nth(n) { return NTH[n] + ' 번째'; }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /* ── 후보 표를 미리 깐다 (재시도 루프는 유형 격리를 보장하지 못한다 — mul_2x1 규약) ── */
  var T = { r_to_d: [], d_to_r: [], two_pads: [], compass_d: [], compass_r: [], compass_back: [],
            pat_r: [], pat_center: [], stage_line: [] };
  (function build() {
    var r, d, c, n, x, k, m, a, b;
    for (r = 2; r <= 15; r++) T.r_to_d.push([r]);                  // 반지름 → 지름
    for (d = 4; d <= 30; d += 2) T.d_to_r.push([d]);                // 지름(짝수) → 반지름
    for (r = 5; r <= 30; r += 5) T.two_pads.push([r]);              // 방석 반지름 5·10·…·30 cm (정본 20)
    for (d = 2; d <= 24; d += 2) T.compass_d.push([d]);             // 지름 2~24 cm (정본 2·4·8·10·12)
    for (r = 2; r <= 12; r++) T.compass_r.push([r]);                // 반지름 2~12 cm (정본 4·5)
    for (c = 1; c <= 12; c++) T.compass_back.push([c]);             // 벌린 길이 1~12 cm (정본 1·4)
    [[1, 2], [2, 1], [1, 3], [2, 3], [1, 2, 3], [3, 2, 1], [2, 1, 3]].forEach(function (cyc) {
      for (n = cyc.length + 2; n <= 9; n++) T.pat_r.push([cyc, n]);  // 한 묶음 넘어서부터 (정본 4·5·6·8번째)
    });
    for (x = 1; x <= 3; x++) for (k = 3; k <= 6; k++) for (m = 3; m <= 5; m++) {
      for (r = 1; r <= 3; r++) if (r * 2 <= k && r <= x) T.pat_center.push([x, k, m, r]);  // 이웃 원이 겹치지 않음(지름 ≤ 옮긴 칸) · 첫 원이 모눈 안
    }
    for (a = 2; a <= 9; a++) for (b = 3; b <= 15; b++) {
      if (b !== a * 2 && b < a * 2 + 6 && b > a) T.stage_line.push([a, b]);   // 지름 b 가 반지름 a 보다 수는 크다(덫이 서는 판)
    }
  }());

  /* ── 오류값 ── */
  function numWrongs(q) {
    var w = [];
    switch (q.type) {
      case 'r_to_d':                      // 반지름 r → 지름 2r
        w.push(q.r % 2 ? null : q.r / 2, q.r + 2, q.r);   // 거꾸로 반 · 4 + 2 · 그대로
        w.push(q.r * 4, q.r * 2 + 2);
        break;
      case 'd_to_r':                      // 지름 d → 반지름 d/2
        w.push(q.d * 2, q.d - 2, q.d);                    // 거꾸로 2배(10 → 20) · 10 − 2 · 그대로
        w.push(q.d / 2 + 1, q.d / 2 + 2);
        break;
      case 'two_pads':                    // 반지름 r 방석 둘 → 4r
        w.push(q.r * 2, q.r * 3, q.r * 8, q.r * 4 + q.r);   // 반지름 두 개만(40) · 셋 · 2배를 두 번
        break;
      case 'compass_d':                   // 지름 d → d/2 벌림
        w.push(q.d, q.d * 2, q.d / 2 + 1);                // 지름 그대로(4) · 거꾸로 2배(4 → 8)
        w.push(q.d + 1);
        break;
      case 'compass_r':                   // 반지름 r → r 벌림
        w.push(q.r % 2 ? null : q.r / 2, q.r * 2, q.r + 1, q.r - 1);   // 반대 실수 반으로 · 2배
        break;
      case 'compass_back':                // c 벌림 → 지름 2c
        w.push(q.c, q.c % 2 ? null : q.c / 2, q.c + 2, q.c * 4);       // 벌린 길이 그대로 · 반
        w.push(q.c * 2 + 1);
        break;
      case 'pat_r':                       // 되풀이 반지름
        q.cyc.forEach(function (v) { w.push(v); });                   // 묶음 안 다른 값
        w.push(q.cyc.length === 2 ? 3 : 4, q.n);
        break;
      case 'pat_center':                  // x + k(m−1)
        w.push(q.x + q.r * (q.m - 1));                                // 반지름만 보고 옮김(정본 l06 s08 — 2 + 2 + 2)
        w.push(q.x + q.k * q.m);                                      // 한 번 더 옮김
        w.push(q.k * (q.m - 1));                                      // 첫 중심 자리를 빠뜨림
        w.push(q.k * q.m, q.x + q.k * (q.m - 2));
        break;
      case 'stage_line':                  // 2a + b
        w.push(q.a + q.b);                                            // 그대로 더함(3 + 5 = 8)
        w.push(q.a + q.b * 2, q.a * 2 + q.b * 2, q.a * 2 + q.b + 1);
        break;
    }
    return w;
  }

  function buildNum(ans, wrongs, rng) {
    var opts = [String(ans)];
    wrongs.forEach(function (x) {
      if (x == null) return;
      var s = String(x);
      if (x > 0 && Math.floor(x) === x && x !== ans && opts.indexOf(s) < 0 && opts.length < 4) opts.push(s);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 60) {
      var c = ans + Math.floor(rng() * 7) - 3;
      if (c > 0 && c !== ans && opts.indexOf(String(c)) < 0) opts.push(String(c));
    }
    return shuffle(rng, opts);
  }

  function D(x) { return KO.ida(x) + '.'; }

  /* ── 문항 만들기 ── */
  function makeRD(rng, type) {
    var c = pick(rng, T[type]), q = { type: type, unit: 'cm' };
    switch (type) {
      case 'r_to_d':
        q.r = c[0]; q.ans = q.r * 2; q.give = 'r';
        q.prompt = '반지름이 ' + q.r + ' cm 인 원의 지름은 몇 cm 일까요?';
        q.parts = ['지름은 반지름의 2배', q.r + ' × 2 = ' + q.ans, '지름 ' + q.ans + ' cm'];
        q.explain = '지름은 원을 가로질러 반지름 두 개를 이어 놓은 길이와 같아요. ' + q.r + ' × 2 = ' + D(q.ans) +
                    ' 반지름을 반으로 나누거나 2를 더하면 지름이 아니에요.';
        break;
      case 'd_to_r':
        q.d = c[0]; q.ans = q.d / 2; q.give = 'd';
        q.prompt = '지름이 ' + q.d + ' cm 인 원의 반지름은 몇 cm 일까요?';
        q.parts = ['반지름은 지름의 반', q.d + ' ÷ 2 = ' + q.ans, '반지름 ' + q.ans + ' cm'];
        q.explain = '반지름은 지름의 반이에요. ' + q.d + ' ÷ 2 = ' + D(q.ans) + ' 반지름이 지름보다 길어질 수는 없어요.';
        break;
      case 'two_pads':
        q.r = c[0]; q.ans = q.r * 4; q.unit = 'cm';
        q.prompt = '반지름이 ' + q.r + ' cm 인 원 모양 방석 두 개를 나란히 맞닿게 놓았어요. 전체 길이는 몇 cm 일까요?';
        q.parts = ['방석 하나의 지름 ' + q.r + ' × 2 = ' + q.r * 2, q.r * 2 + ' + ' + q.r * 2 + ' = ' + q.ans, q.ans + ' cm'];
        q.explain = '나란히 놓으면 방석 지름 두 개를 잇게 돼요. 지름 = ' + q.r + ' × 2 = ' + q.r * 2 + ', ' + q.r * 2 + ' + ' + q.r * 2 + ' = ' + D(q.ans) +
                    ' 반지름 두 개만 더하면 방석 하나 길이밖에 안 돼요.';
        break;
      case 'compass_d':
        q.d = c[0]; q.ans = q.d / 2; q.give = 'd';
        q.prompt = '지름이 ' + q.d + ' cm 인 원을 그리려면 컴퍼스를 몇 cm 벌려야 할까요?';
        q.parts = ['컴퍼스는 반지름만큼 벌려요', q.d + ' ÷ 2 = ' + q.ans, q.ans + ' cm 벌려요'];
        q.explain = '컴퍼스를 벌린 길이는 반지름이 돼요. 지름 ' + q.d + ' cm 의 반 → ' + q.d + ' ÷ 2 = ' + D(q.ans) +
                    ' ' + q.d + ' cm 를 벌리면 지름이 ' + q.d * 2 + ' cm 인 원이 그려져요.';
        break;
      case 'compass_r':
        q.r = c[0]; q.ans = q.r; q.give = 'r';
        q.prompt = '반지름이 ' + q.r + ' cm 인 원을 그리려면 컴퍼스를 몇 cm 벌려야 할까요?';
        q.parts = ['컴퍼스는 반지름만큼 벌려요', '주어진 것이 반지름이에요', q.ans + ' cm 벌려요'];
        q.explain = '주어진 것이 반지름이라 그대로 ' + q.r + ' cm 벌려요. 반으로 줄이는 건 지름이 주어졌을 때예요.';
        break;
      case 'compass_back':
        q.c = c[0]; q.ans = q.c * 2; q.give = 'c';
        q.prompt = '컴퍼스를 ' + q.c + ' cm 벌려 그린 원의 지름은 몇 cm 일까요?';
        q.parts = ['벌린 길이 = 반지름', q.c + ' × 2 = ' + q.ans, '지름 ' + q.ans + ' cm'];
        q.explain = '벌린 길이 ' + q.c + ' cm 가 반지름이에요. 지름은 반지름의 2배 → ' + q.c + ' × 2 = ' + D(q.ans);
        break;
    }
    q.answer = String(q.ans);
    q.options = buildNum(q.ans, numWrongs(q), rng);
    q.shown = [q.r || q.d || q.c];
    return q;
  }

  function makePatR(rng) {
    var c = pick(rng, T.pat_r), cyc = c[0], n = c[1], L = cyc.length;
    var q = { type: 'pat_r', cyc: cyc, n: n, ans: cyc[(n - 1) % L] };
    var head = cyc.map(function (v) { return v + '칸'; }).join(', ');
    q.prompt = '반지름이 ' + head + ', ' + head + ', … 으로 되풀이되는 원 무늬예요. ' + nth(n) + ' 원의 반지름은 모눈 몇 칸일까요?';
    q.answer = String(q.ans);
    q.options = buildNum(q.ans, numWrongs(q), rng);
    var seq = [];
    for (var i = 0; i < n; i++) seq.push(cyc[i % L]);
    q.parts = [L + '개씩 한 묶음으로 되풀이', seq.join(', '), nth(n) + ' 원 → ' + q.ans + '칸'];
    q.explain = cyc.map(function (v) { return v + '칸'; }).join(', ') + '이 한 묶음으로 되풀이돼요. 차례로 이어 가면 ' + seq.join(', ') + ' — ' + nth(n) + ' 원은 ' + D(q.ans + '칸');
    q.shown = [n];
    return q;
  }

  function makeCenter(rng) {
    var c = pick(rng, T.pat_center), x = c[0], k = c[1], m = c[2], r = c[3];
    var q = { type: 'pat_center', x: x, k: k, m: m, r: r, ans: x + k * (m - 1) };
    q.prompt = '반지름이 모두 ' + r + '칸인 원 무늬예요. 첫 번째 원의 중심은 왼쪽 끝에서 ' + x + '칸째, 원의 중심을 오른쪽으로 ' + k +
               '칸씩 옮겨요. ' + nth(m) + ' 원의 중심은 몇 칸째일까요?';
    q.answer = String(q.ans);
    q.options = buildNum(q.ans, numWrongs(q), rng);
    var add = [x]; for (var i = 1; i < m; i++) add.push(k);
    q.parts = ['첫 번째 중심 ' + x + '칸째', add.join(' + ') + ' = ' + q.ans, nth(m) + ' 중심 ' + q.ans + '칸째'];
    q.explain = '반지름이 아니라 중심이 옮겨 가는 규칙을 봐요. ' + x + '칸째에서 ' + k + '칸씩 ' + (m - 1) + '번 옮기면 ' + add.join(' + ') + ' = ' + D(q.ans) +
                ' 반지름 ' + r + '칸만큼 옮기면 무늬가 달라져요.';
    q.shown = [x, k];
    return q;
  }

  function lab(it) { return (it.k === 'r' ? '반지름 ' : '지름 ') + it.v + ' cm'; }
  function makeCompare(rng) {
    var guard = 0, items, want, best, raw;
    do {
      want = rng() < 0.7 ? 'big' : 'small';
      items = []; var used = {};
      while (items.length < 4) {
        var k = rng() < 0.5 ? 'r' : 'd', v = k === 'r' ? 2 + Math.floor(rng() * 8) : 3 + Math.floor(rng() * 13);
        var dd = k === 'r' ? v * 2 : v;
        if (used[dd] || items.some(function (o) { return o.k === k && o.v === v; })) continue;   // 같은 크기 원 0 · 같은 이름표 0
        used[dd] = 1; items.push({ k: k, v: v, d: dd });
      }
      var byD = items.slice().sort(function (p, q) { return p.d - q.d; });
      var byV = items.slice().sort(function (p, q) { return p.v - q.v; });
      best = want === 'big' ? byD[3] : byD[0];
      raw = want === 'big' ? byV[3] : byV[0];
      var tie = want === 'big' ? byV[2].v === byV[3].v : byV[0].v === byV[1].v;
      // 덫이 서는 판만: 수만 견주면 다른 원을 집게 된다(정본 l07 s08 반지름 4 < 지름 6)
      if (raw !== best && !tie && items.some(function (o) { return o.k === 'r'; }) && items.some(function (o) { return o.k === 'd'; })) break;
    } while (guard++ < 200);
    shuffle(rng, items);
    var q = { type: 'compare_big', items: items, want: want, best: best, raw: raw };
    q.prompt = '반지름과 지름이 섞여 있어요. ' + (want === 'big' ? '가장 큰' : '가장 작은') + ' 원은?';
    q.answer = lab(best);
    q.options = items.map(lab);                       // 네 원 이름표가 곧 선택지 — 덫(수만 큰 원)이 늘 들어 있다
    q.parts = items.map(function (o) { return o.k === 'r' ? '반지름 ' + o.v + ' → 지름 ' + o.d : '지름 ' + o.v; })
      .concat([(want === 'big' ? '가장 큰 원 ' : '가장 작은 원 ') + lab(best)]);
    q.explain = '반지름과 지름이 섞여 있으면 모두 지름으로 바꾸어 견주어요. ' +
                items.map(function (o) { return o.d; }).join(', ') + ' → ' + KO.j(lab(best), '이/가') + ' ' + (want === 'big' ? '가장 커요.' : '가장 작아요.') +
                ' 수만 보면 ' + KO.j(lab(raw), '을/를') + ' 고르게 돼요.';
    q.shown = items.map(function (o) { return o.v; });
    return q;
  }

  function makeStage(rng) {
    var c = pick(rng, T.stage_line), a = c[0], b = c[1];
    var q = { type: 'stage_line', a: a, b: b, ans: a * 2 + b };
    q.prompt = '반지름이 ' + a + ' m 인 원 모양 무대와 지름이 ' + b + ' m 인 원 모양 무대를 나란히 맞닿게 놓았어요. 전체 길이는 몇 m 일까요?';
    q.answer = String(q.ans);
    q.options = buildNum(q.ans, numWrongs(q), rng);
    q.parts = ['반지름 ' + a + ' m 무대의 지름 ' + a + ' × 2 = ' + a * 2, a * 2 + ' + ' + b + ' = ' + q.ans, q.ans + ' m'];
    q.explain = '나란히 놓은 길이는 두 무대의 지름을 더한 것이에요. 반지름 ' + a + ' m 를 지름 ' + a * 2 + ' m 로 바꾸고 ' + a * 2 + ' + ' + b + ' = ' + D(q.ans) +
                ' 반지름과 지름을 그대로 더하면 ' + KO.j(a + b, '이/가') + ' 돼 버려요.';
    q.shown = [a, b];
    return q;
  }

  return {
    id: 'circle_rd',
    title: '원의 반지름과 지름',
    ORDER: ORDER, POOL: POOL, TYPES: TYPES, T: T,
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
      var count = 0, seen = {};

      function one(type) {
        if (type === 'pat_r') return makePatR(rng);
        if (type === 'pat_center') return makeCenter(rng);
        if (type === 'compare_big') return makeCompare(rng);
        if (type === 'stage_line') return makeStage(rng);
        return makeRD(rng, type);
      }

      return {
        next: function () {
          var type;
          if (count < 2) type = pick(rng, cur);                               // 이번 차시 먼저
          else if (upto !== 'all' && rng() < 0.5) type = pick(rng, cur);
          else type = pick(rng, all);
          count++;
          var q, guard = 0;
          do { q = one(type); } while (seen[q.prompt] && guard++ < 20);
          seen[q.prompt] = 1;
          q.wordy = !!WORDY[q.type];
          q.cmp = q.type === 'compare_big';
          return q;
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      if (q.cmp) return '<span class="w-txt">' + q.prompt + ' (' + q.options.join(' · ') + ')</span><span class="w-box"> </span>';
      return '<span class="w-txt">' + q.prompt + '</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '□ 안에 알맞은 수나 원을 쓰세요. 지름은 반지름의 2배, 반지름은 지름의 반이에요.'
  };
}));
