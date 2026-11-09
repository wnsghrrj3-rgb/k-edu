/* gens/math/rule_next.js — 다음에 올 무늬 맞히기 (2학년 2학기 수학 6단원 「규칙 찾기」 2·3·8차시)
 * 순수 함수·DOM 무관 (§9-3). duel_quiz(stream) 계약: { prompt, options, answer, type, explain } + check.
 *   + scene(교과서 장면 열쇠) · kind(rep·combo·spin·grow·num) · cells/boards/groups(그림 재료) · patHtml(q) — 무대와 활동지가 같은 그림을 쓴다.
 * 교과서판(2026-11-09): 『수학』 132~135쪽 무늬 · 144~145쪽 확인해요 · 146~147쪽 만들어요 의 「규칙에 따라 빈칸에 알맞은 것」.
 *   장면 = 교과서 그대로: 벽 무늬 빨강·노랑·파랑(132) · 바닥 △□○ × 하늘·연두(133) · 받침대 꽃 2 3 2 → 1, 2, 3, 2(133) ·
 *   종이 팔찌 5칸 시계 방향(134) · 집 모양 지붕 시계 반대 방향(135) · 회오리 모빌 빨1 파1 빨2 파2 …(135) ·
 *   확인해요 1번 노랑·빨강·파랑 원 / △□○ × 파랑·파랑·초록·초록 · 2번 원 속 점 4개 시계 방향 · 6번 목걸이 구슬1 달1 구슬2 …(144~145) ·
 *   옷 줄무늬 초록·빨강·노랑 · 벽 연두·회색 삼각형(143) · 쿵 쿵 짝 = 4 4 1 · 단 짝 친 구 = 1 2 3 4(146~147).
 *   처음 두 판 = 교과서 빈칸 그대로(확인해요 ? 파란색 원 · 초록색 사각형 · 팔찌 여섯째 · 집 여섯째 왼쪽 · 점 여섯째 오른쪽 · 모빌 빨간색 4개 · 목걸이 달 3개 · 쿵쿵짝 ? 1 · 벽 · 바닥 가운데 둘).
 * 오답 보기 = 지도서 오답 유형: 한 칸 밀려 읽음 · 무늬에 없는 색(확인해요 1번, 322) · 모양과 색 가운데 하나만 봄(322) ·
 *   돌아가는 방향을 반대로(313·322) · 제자리 · 늘어나지 않고 처음 개수 그대로(313) · 같은 것에 다른 수(311).
 * type: rep(되풀이) · combo(모양과 색 함께) · spin(돌아가는 판) · grow(늘어나는 묶음) · num(규칙을 수로)
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['rule_next'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var COL = { '빨강': '#E46A5E', '주황': '#F2A65A', '노랑': '#F4D35E', '연두': '#B5D99C', '초록': '#5BAE6B', '하늘': '#9FD3EE', '파랑': '#5C8FD6', '보라': '#9B7BC8', '회색': '#A7A9AC', '분홍': '#F2A1B8' };
  var CN = { '빨강': '빨간색', '주황': '주황색', '노랑': '노란색', '연두': '연두색', '초록': '초록색', '하늘': '하늘색', '파랑': '파란색', '보라': '보라색', '회색': '회색', '분홍': '분홍색' };
  var POS4 = ['위', '오른쪽', '아래', '왼쪽'];
  var ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열두째'];

  /* 교과서 장면 — rep·combo: 모양·색 묶음 · spin: 칸 수·방향 · grow: 번갈아 나오는 것 · num: 소리 말과 수 */
  var S = {
    wall:    { kind: 'rep', name: '벽 무늬', page: '『수학』 132쪽', unit: [['빨강', '칸'], ['노랑', '칸'], ['파랑', '칸']], len: 7, noun: '색' },
    ck1:     { kind: 'rep', name: '확인해요 1번 구슬 줄', page: '『수학』 144쪽', unit: [['노랑', '원'], ['빨강', '원'], ['파랑', '원']], len: 9, noun: '색' },
    sweater: { kind: 'rep', name: '옷 줄무늬', page: '『수학』 143쪽', unit: [['초록', '줄'], ['빨강', '줄'], ['노랑', '줄']], len: 8, noun: '색' },
    walltri: { kind: 'rep', name: '벽의 삼각형 무늬', page: '『수학』 143쪽', unit: [['연두', '삼각형'], ['회색', '삼각형']], len: 8, noun: '색' },
    floor:   { kind: 'combo', name: '바닥 무늬', page: '『수학』 133쪽', shapes: ['삼각형', '사각형', '원'], colors: ['하늘', '연두'], len: 7 },
    ck2:     { kind: 'combo', name: '확인해요 1번 모양 줄', page: '『수학』 144쪽', shapes: ['삼각형', '사각형', '원'], colors: ['파랑', '파랑', '초록', '초록'], len: 9 },
    bracelet:{ kind: 'spin', name: '종이 팔찌', page: '『수학』 134쪽', n: 5, dir: 1 },
    house:   { kind: 'spin', name: '집 모양 지붕', page: '『수학』 135쪽', n: 4, dir: -1 },
    dots:    { kind: 'spin', name: '확인해요 2번 원 속 점', page: '『수학』 144쪽', n: 4, dir: 1 },
    mobile:  { kind: 'grow', name: '회오리 모빌', page: '『수학』 135쪽', items: [['빨강', '원', '빨간색 구슬'], ['파랑', '원', '파란색 구슬']] },
    neck:    { kind: 'grow', name: '확인해요 6번 목걸이', page: '『수학』 145쪽', items: [['하늘', '원', '구슬'], ['초록', '달', '달']] },
    neck3:   { kind: 'grow', name: '확인해요 6번 목걸이(예)', page: '『수학』 145쪽', items: [['하늘', '원', '구슬'], ['빨강', '삼각형', '세모'], ['초록', '달', '달']] },
    kung:    { kind: 'num', name: '쿵 쿵 짝', page: '『수학』 146쪽', words: ['쿵', '쿵', '짝'], nums: [4, 4, 1] },
    friend:  { kind: 'num', name: '단 짝 친 구', page: '『수학』 147쪽', words: ['단', '짝', '친', '구'], nums: [1, 2, 3, 4] },
    stand:   { kind: 'num', name: '받침대 무늬', page: '『수학』 133쪽', words: ['꽃', '2', '3', '2'], nums: [1, 2, 3, 2] },
    kungtari:{ kind: 'num', name: '쿵 타 리', page: '『수학』 146쪽', words: ['쿵', '타', '리'], nums: [4, 2, 1] },
    sonuri:  { kind: 'num', name: '손 우 리 짝', page: '『수학』 147쪽', words: ['손', '우', '리', '짝'], nums: [2, 3, 4, 5] }
  };
  var KEYS = Object.keys(S);

  function nm(c, s) { return s === '칸' || s === '줄' ? CN[c] : CN[c] + ' ' + s; }
  /* ── 그림 ── 모양 하나 · 판 하나 (viewBox 단위) */
  function shapeSvg(c, s, x, y, W, print) {
    var f = COL[c] || '#ccc', st = ' fill="' + f + '" stroke="#5b4636" stroke-width="1.6" stroke-linejoin="round"', cx = x + W / 2, cy = y + W / 2, R = W * 0.4, b;
    if (s === '원') b = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"' + st + '/>';
    else if (s === '삼각형') b = '<polygon points="' + cx + ',' + (cy - R) + ' ' + (cx + R) + ',' + (cy + R * 0.8) + ' ' + (cx - R) + ',' + (cy + R * 0.8) + '"' + st + '/>';
    else if (s === '사각형') b = '<rect x="' + (cx - R * 0.85) + '" y="' + (cy - R * 0.85) + '" width="' + (R * 1.7) + '" height="' + (R * 1.7) + '"' + st + '/>';
    else if (s === '달') b = '<path d="M' + (cx + R * 0.2) + ' ' + (cy - R) + ' A' + R + ' ' + R + ' 0 1 0 ' + (cx + R * 0.2) + ' ' + (cy + R) + ' A' + (R * 0.72) + ' ' + (R * 0.85) + ' 0 1 1 ' + (cx + R * 0.2) + ' ' + (cy - R) + ' Z"' + st + '/>';
    else if (s === '줄') b = '<rect x="' + (x + 1) + '" y="' + (cy - W * 0.22) + '" width="' + (W - 2) + '" height="' + (W * 0.44) + '" rx="4"' + st + '/>';
    else b = '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (W - 2) + '" height="' + (W - 2) + '" rx="3"' + st + '/>';
    if (print) b += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#000">' + String(c).slice(0, 1) + '</text>';
    return b;
  }
  function qBox(x, y, W) { return '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (W - 2) + '" height="' + (W - 2) + '" rx="6" fill="#fff" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="4 3"/><text x="' + (x + W / 2) + '" y="' + (y + W / 2 + 7) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#c0392b">?</text>'; }
  function pieSvg(n, on, cx, cy, R) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var st0 = n === 4 ? -135 : -90;   /* 4칸은 위·오른쪽·아래·왼쪽이 칸 한가운데(집 지붕·점 자리) · 5칸 팔찌는 맨 위에서 시계 방향으로 첫 칸(교과서 그림) */
      var a0 = (st0 + i * 360 / n) * Math.PI / 180, a1 = (st0 + (i + 1) * 360 / n) * Math.PI / 180;
      s += '<path class="' + (i === on ? 'on' : 'off') + '" data-i="' + i + '" d="M' + cx + ' ' + cy + ' L' + (cx + Math.cos(a0) * R).toFixed(1) + ' ' + (cy + Math.sin(a0) * R).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R).toFixed(1) + ' ' + (cy + Math.sin(a1) * R).toFixed(1) + ' Z" fill="' + (i === on ? '#F2A65A' : '#fff') + '" stroke="#5b4636" stroke-width="1.3"/>';
    }
    return s;
  }
  function iconCell(c, s) { return '<svg class="rn-ic" viewBox="0 0 40 40" aria-hidden="true">' + shapeSvg(c, s, 0, 0, 40, false) + '</svg>'; }
  function iconPie(n, on) { return '<svg class="rn-ic" viewBox="0 0 40 40" aria-hidden="true">' + pieSvg(n, on, 20, 20, 17) + '</svg>'; }

  /* 무대·활동지 그림 — 데이터 속성(data-c · data-s · data-n · data-on · data-q)을 달아 검사가 그림에서 따로 읽는다 */
  function patHtml(q, print) {
    var W = 40, G = 6, RG = 14, x = 4, h = '', H = W + 8;
    if (q.kind === 'spin') {
      var R = 20, BW = 2 * R + 14;
      q.boards.forEach(function (b, k) {
        var cx = 4 + k * BW + R, cy = 4 + R;
        h += '<g class="bd" data-k="' + k + '"' + (b === null ? ' data-q="1"' : ' data-on="' + b + '"') + '>' + (b === null ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#fff" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="4 3"/><text x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#c0392b">?</text>' : pieSvg(q.n, b, cx, cy, R)) +
          '<text x="' + cx + '" y="' + (cy + R + 14) + '" text-anchor="middle" font-size="11" fill="#5b4636">' + ORD[k + 1] + '</text></g>';
      });
      var wS = 8 + q.boards.length * BW;
      return '<div class="rn-title">' + q.title + '</div><svg class="rn-pat" viewBox="0 0 ' + wS + ' ' + (2 * R + 24) + '" role="img" aria-label="돌아가는 판 ' + q.boards.length + '개">' + h + '</svg>';
    }
    q.cells.forEach(function (it, i) {
      if (q.kind === 'grow' && i > 0 && it && q.cells[i - 1] && it.g !== q.cells[i - 1].g) x += RG;
      if (it === null) h += '<g class="ce" data-q="1">' + qBox(x, 4, W) + '</g>';
      else if (q.kind === 'num') h += '<g class="ce" data-n="' + it.n + '"><text x="' + (x + W / 2) + '" y="14" text-anchor="middle" font-size="12" fill="#7c5a3a">' + it.w + '</text><rect x="' + (x + 1) + '" y="18" width="' + (W - 2) + '" height="' + (W - 6) + '" rx="6" fill="#fff" stroke="#5b4636" stroke-width="1.6"/><text x="' + (x + W / 2) + '" y="' + (18 + (W - 6) / 2 + 7) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#5b4636">' + it.n + '</text></g>';
      else h += '<g class="ce" data-c="' + it.c + '" data-s="' + it.s + '"' + (it.g !== undefined ? ' data-g="' + it.g + '"' : '') + '>' + shapeSvg(it.c, it.s, x, 4, W, print) + '</g>';
      x += W + G;
    });
    if (q.kind === 'num') H = W + 18;
    return '<div class="rn-title">' + q.title + '</div><svg class="rn-pat" viewBox="0 0 ' + (x + 2) + ' ' + H + '" role="img" aria-label="무늬 ' + q.cells.length + '칸">' + h + '</svg>';
  }

  function opt(pick, label, text) { return { pick: pick, label: label, text: text }; }
  function finish(rng, it, q, right, wrongs, explain, prompt) {
    var opts = shuffle(rng, [right].concat(wrongs));
    q.options = opts.map(function (o) { return o.pick; });
    q.labels = opts.map(function (o) { return o.label; });
    q.texts = opts.map(function (o) { return o.text; });
    q.answer = right.pick; q.answerText = right.text;
    q.prompt = prompt; q.ask = prompt.indexOf(' — ') > 0 ? prompt.slice(prompt.indexOf(' — ') + 3) : prompt; q.explain = right.text + ' — ' + explain;
    return q;
  }

  /* 한 판 */
  function build(rng, it) {
    var sc = S[it.scene], q = { scene: it.scene, kind: sc.kind, type: sc.kind, title: sc.page + ' ' + sc.name };
    if (sc.kind === 'rep') {
      var p = sc.unit.length, L = it.len || sc.len, qi = it.q;
      q.cells = []; for (var i = 0; i < L; i++) q.cells.push(i === qi ? null : { c: sc.unit[i % p][0], s: sc.unit[i % p][1] });
      var a = sc.unit[qi % p], sh = sc.unit[(qi + 1) % p], used = sc.unit.map(function (u) { return u[0]; });
      var none = ['초록', '보라', '분홍', '주황', '하늘'].filter(function (c) { return used.indexOf(c) < 0; })[0];
      var right = opt('c:' + a[0] + ':' + a[1], iconCell(a[0], a[1]) + '<span>' + nm(a[0], a[1]) + '</span>', nm(a[0], a[1]));
      var w1 = opt('c:' + sh[0] + ':' + sh[1], iconCell(sh[0], sh[1]) + '<span>' + nm(sh[0], sh[1]) + '</span>', nm(sh[0], sh[1]));
      var w2 = opt('c:' + none + ':' + a[1], iconCell(none, a[1]) + '<span>' + nm(none, a[1]) + '</span>', nm(none, a[1]));
      var unitT = sc.unit.map(function (u) { return nm(u[0], u[1]); }).join(', ');
      return finish(rng, it, q, right, [w1, w2],
        KO.j(unitT, '이/가') + ' 한 묶음으로 되풀이돼요. ?는 묶음의 ' + ORD[qi % p + 1] + ' 자리예요. 한 칸 밀려 읽거나 무늬에 없는 ' + KO.j(CN[none], '을/를') + ' 고르면 안 돼요.',
        sc.name + ' — 규칙에 따라 ?에 알맞은 것은 무엇일까요?');
    }
    if (sc.kind === 'combo') {
      var L2 = it.len || sc.len, q2 = it.q, ps = sc.shapes.length, pc = sc.colors.length;
      q.cells = []; for (var k = 0; k < L2; k++) q.cells.push(k === q2 ? null : { c: sc.colors[k % pc], s: sc.shapes[k % ps] });
      var s0 = sc.shapes[q2 % ps], c0 = sc.colors[q2 % pc];
      var cOther = sc.colors.filter(function (c) { return c !== c0; })[0], sOther = sc.shapes[(q2 + 1) % ps];
      var r2 = opt('c:' + c0 + ':' + s0, iconCell(c0, s0) + '<span>' + nm(c0, s0) + '</span>', nm(c0, s0));
      var wA = opt('c:' + cOther + ':' + s0, iconCell(cOther, s0) + '<span>' + nm(cOther, s0) + '</span>', nm(cOther, s0));
      var wB = opt('c:' + c0 + ':' + sOther, iconCell(c0, sOther) + '<span>' + nm(c0, sOther) + '</span>', nm(c0, sOther));
      var colT = sc.colors.map(function (c) { return CN[c]; }).join(', ');
      return finish(rng, it, q, r2, [wA, wB],
        '모양은 ' + sc.shapes.join(', ') + ' — ' + ps + '칸씩, 색은 ' + colT + ' — ' + pc + '칸씩 되풀이돼요. 모양과 색 가운데 하나만 보면 틀려요.',
        sc.name + ' — 모양과 색을 함께 보고 ?에 알맞은 것을 고르세요.');
    }
    if (sc.kind === 'spin') {
      var n = sc.n, B = it.boards, last = B[B.length - 1], ans = ((last + sc.dir) % n + n) % n, rev = ((last - sc.dir) % n + n) % n;
      q.n = n; q.boards = B.concat([null]);
      var lab = function (v) { return iconPie(n, v) + (n === 4 ? '<span>' + POS4[v] + '</span>' : ''); };
      var txt = function (v) { return n === 4 ? (sc.name === '집 모양 지붕' ? '지붕이 ' + POS4[v] : POS4[v] + ' 점') : ORD[B.length] + ' 판에서 ' + (v === ans ? '시계 방향으로 한 칸' : v === rev ? '시계 반대 방향으로 한 칸' : '그대로'); };
      var dirT = sc.dir === 1 ? '시계 방향' : '시계 반대 방향';
      return finish(rng, it, q, opt('p:' + ans, lab(ans), txt(ans)), [opt('p:' + rev, lab(rev), txt(rev)), opt('p:' + last, lab(last), txt(last))],
        '색칠된 칸이 ' + dirT + '으로 한 칸씩 돌아가요. 반대 방향으로 돌리거나 제자리에 두면 틀려요.',
        sc.name + ' — ' + ORD[B.length + 1] + ' 판에서 색칠될 칸은 어디일까요?');
    }
    if (sc.kind === 'grow') {
      var K = sc.items.length, m = it.groups, cnt = function (g) { return Math.floor(g / K) + 1; };
      q.cells = []; for (var g = 0; g < m; g++) for (var c = 0; c < cnt(g); c++) q.cells.push({ c: sc.items[g % K][0], s: sc.items[g % K][1], g: g });
      q.cells.push(null);
      var nx = sc.items[m % K], nc = cnt(m), prevC = cnt(m - 1), oth = sc.items[(m + 1) % K];
      var gl = function (itm, k) { return '<span class="rn-grp">' + iconCell(itm[0], itm[1]) + '<b>× ' + k + '</b></span><span>' + itm[2] + ' ' + k + '개</span>'; };
      var wFirst = nc === 1 ? (prevC !== nc ? prevC : nc + 1) : 1;
      var gk = function (itm, k) { return 'g:' + itm[0] + ':' + itm[1] + ':' + k; };
      var wrongs = [opt(gk(nx, wFirst), gl(nx, wFirst), nx[2] + ' ' + wFirst + '개'), opt(gk(oth, nc), gl(oth, nc), oth[2] + ' ' + nc + '개')];
      return finish(rng, it, q, opt(gk(nx, nc), gl(nx, nc), nx[2] + ' ' + nc + '개'), wrongs,
        sc.items.map(function (x) { return x[2]; }).join(', ') + ' 차례로 나오며 한 바퀴 돌 때마다 1개씩 늘어나요. 시작점부터 묶음마다 개수를 세어 보세요.',
        sc.name + ' — 다음에 올 묶음은 무엇일까요?');
    }
    /* num */
    var pn = sc.nums.length, L3 = it.len, q3 = it.q;
    q.cells = []; for (var t = 0; t < L3; t++) q.cells.push(t === q3 ? null : { w: sc.words[t % pn], n: sc.nums[t % pn] });
    var av = sc.nums[q3 % pn], vals = sc.nums.filter(function (v, k, a) { return a.indexOf(v) === k; });
    var w1v = vals.filter(function (v) { return v !== av; })[0], w2v = [5, 6, 3, 7, 2].filter(function (v) { return vals.indexOf(v) < 0; })[0];
    if (vals.length >= 3) { var nb = sc.nums[(q3 + 1) % pn]; if (nb !== av) w1v = nb; }
    var pairT = sc.words.map(function (w, k) { return w + ' → ' + sc.nums[k]; }).filter(function (v, k, a) { return a.indexOf(v) === k; }).join(', ');
    return finish(rng, it, q, opt('n:' + av, '<b class="rn-num">' + av + '</b>', String(av)), [opt('n:' + w1v, '<b class="rn-num">' + w1v + '</b>', String(w1v)), opt('n:' + w2v, '<b class="rn-num">' + w2v + '</b>', String(w2v))],
      KO.j(sc.words.join(' '), '이/가') + ' 되풀이돼요(' + pairT + '). ?는 「' + sc.words[q3 % pn] + '」 자리라 같은 것에는 같은 수를 써요.',
      '「' + sc.name + '」' + KO.j(sc.name, '을/를').slice(sc.name.length) + ' 수로 나타냈어요. ?에 알맞은 수는 무엇일까요?');
  }

  /* 교과서 판 — 빈칸 그대로 */
  var BOOK = [
    { scene: 'ck1', q: 5 }, { scene: 'ck2', q: 7 }, { scene: 'wall', q: 6 }, { scene: 'floor', q: 5 },
    { scene: 'bracelet', boards: [0, 1, 2, 3, 4] }, { scene: 'house', boards: [0, 3, 2, 1, 0] }, { scene: 'dots', boards: [0, 1, 2, 3, 0] },
    { scene: 'mobile', groups: 6 }, { scene: 'neck', groups: 5 }, { scene: 'kung', len: 9, q: 8 }
  ];
  function makeRandom(rng, prev) {
    var key = pick(rng, KEYS); if (key === prev) key = KEYS[(KEYS.indexOf(key) + 1 + Math.floor(rng() * (KEYS.length - 1))) % KEYS.length];
    var sc = S[key];
    if (sc.kind === 'rep') { var L = ri(rng, 7, 9), p = sc.unit.length; return { scene: key, len: L, q: rng() < 0.55 ? L - 1 : ri(rng, p, L - 1) }; }
    if (sc.kind === 'combo') { var L2 = ri(rng, 8, 10); return { scene: key, len: L2, q: rng() < 0.5 ? L2 - 1 : ri(rng, sc.colors.length, L2 - 1) }; }
    if (sc.kind === 'spin') { var nb = ri(rng, 4, 5), s0 = ri(rng, 0, sc.n - 1), B = []; for (var i = 0; i < nb; i++) B.push(((s0 + sc.dir * i) % sc.n + sc.n) % sc.n); return { scene: key, boards: B }; }
    if (sc.kind === 'grow') return { scene: key, groups: sc.items.length === 3 ? ri(rng, 4, 7) : ri(rng, 4, 6) };
    var L3 = ri(rng, 7, 10); return { scene: key, len: L3, q: rng() < 0.5 ? L3 - 1 : ri(rng, sc.nums.length, L3 - 1) };
  }

  return {
    id: 'rule_next',
    title: '다음에 올 무늬 맞히기',
    SCENES: S,
    patHtml: patHtml,
    create: function (params, rng) {
      var book = !(params && +params.book === 0);
      var order = shuffle(rng, BOOK.slice()), qi = 0, prev = null;
      return {
        next: function () {
          var it = (book && qi < 2) ? order[qi] : makeRandom(rng, prev);
          qi++; prev = it.scene;
          return build(rng, it);
        },
        check: function (p, q) { return p === q.answer; }
      };
    },
    printRender: function (q) {
      return patHtml(q, true) + '<ol class="w-opts">' + q.texts.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol><span class="w-box">답: (　　　)</span>';
    },
    printAnswer: function (q) { return q.answerText; },
    printHead: '규칙을 찾아 ?에 알맞은 것을 고르세요.'
  };
}));
