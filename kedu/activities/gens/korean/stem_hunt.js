/* gens/korean/stem_hunt.js — 바뀌지 않는 부분 짚기 (3학년 2학기 국어 5단원 「사전으로 여는 세상」 l04 = 4·5차시 · l06 = 6·7차시 · l14 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 글자 토큰)가 쓴다 — 토큰 하나 = 글자 하나, 줄 하나 = 모양이 바뀐 낱말 하나.
 * params: { upto: 'l04'|'l06'|'all' }  단원 처음부터 그 차시까지 누적 · all = 단원 전체(l14)
 * next() → { prompt, icon, src, base, stem, rows:[낱말…], lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[글자…], type, explain, l }
 *
 * 정본 l04 s04: 「접고 · 접으니 · 접으면 · 접어서」 — 🔒 바뀌지 않는 부분 **접** · 🔄 바뀌는 부분 고·으니·으면·어서 · watch 「「접으」까지를 바뀌지 않는 부분으로」
 * 정본 l04 s09: 「심고 · 심으니 · 심으면 · 심어서」 → **심** (오답 「으니」·「심어」) · 「네 낱말을 나란히 놓고 처음부터 같은 곳까지 손가락으로 짚어」
 * 정본 l04 s05: 이름을 나타내는 낱말은 그대로 — 「계단이 · 계단을 · 계단은」 · watch 「「계단을」의 「을」을 낱말이 바뀐 것으로」
 * 정본 l04 s06·s08·s12: 닦으니 → 닦 · 비좁으니 · 「닦고 · 닦으니 · 닦으면 · 닦아서 · 닦는다 · 닦았다」 · 옮기면 · 오르고 · 오르니 · 「집어」
 * 정본 l06 s06·s11: 기준 ② 모양이 바뀌는가 — 「-고 · -으니 · -어서」를 붙여 읽기 · 여닫다 · 집다 바뀜 / 물통 · 뚜껑 그대로
 * 찾을 것 = 줄마다 바뀌지 않는 부분의 글자(판마다 줄 3~4 · 찾을 글자 ≤ 6) · 판정 전엔 모든 글자가 같은 모습(답 미노출).
 * 덫 = 바뀌는 부분의 첫 글자 「으」·「어/아/었/았」(정본 s04 watch 「접으」 · s09 「심어」) — 움직임 낱말 판마다 둘 다.
 * 줄임 꼴(두드려서 · 옮겼다 · 달렸고 · 했다)은 글자째 바뀌어 짚을 수 없으니 0 — 줄마다 바뀌지 않는 부분의 글자가 그대로 앞에 있다.
 * type(문항 단위 · 진단 축):
 *   st_one   한 글자 — 움직임 낱말 네 꼴(접·심·닦·집·읽·찾) · 덫 으·어 — s04·s09 watch
 *   st_two   두 글자 — 세 꼴(비좁·옮기·달리·오르·여닫) · 앞 글자만 짚고 멈추지 않기 — s06·s12·s15 watch(「묵직」까지만)
 *   st_name  이름 낱말 — 세 꼴(계단·종이·사전·물통·뚜껑) · 낱말 전체가 그대로, 뒤에 붙은 말만 다름 — s05 watch
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['stem_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '낱말마다 바뀌지 않는 부분을 모두 눌러요';
  var ORDER = ['l04', 'l06'];

  /* [차시, 유형, 아이콘, 낱말(기본형·이름), 바뀌지 않는 부분, 꼴(정본 차례)] */
  var T = [
    // ── st_one · 한 글자(정본 s04 · s09 · s06·s08 · s12 「집어」)
    ['l04', 'st_one', '✂️', '접다', '접', ['접고', '접으니', '접으면', '접어서']],
    ['l04', 'st_one', '🌱', '심다', '심', ['심고', '심으니', '심으면', '심어서']],
    ['l04', 'st_one', '🧽', '닦다', '닦', ['닦고', '닦으니', '닦는다', '닦아서']],
    ['l04', 'st_one', '✂️', '접다', '접', ['접는다', '접으면', '접었다', '접어서']],
    ['l04', 'st_one', '🌱', '심다', '심', ['심고', '심으니', '심는다', '심었다']],
    ['l04', 'st_one', '🧽', '닦다', '닦', ['닦고', '닦으면', '닦으니', '닦았다']],
    ['l04', 'st_one', '🤏', '집다', '집', ['집고', '집으니', '집으면', '집어서']],
    ['l04', 'st_one', '📖', '읽다', '읽', ['읽고', '읽으니', '읽으면', '읽어서']],
    ['l04', 'st_one', '🔍', '찾다', '찾', ['찾고', '찾으니', '찾는다', '찾아서']],
    ['l04', 'st_one', '🤏', '집다', '집', ['집는다', '집으면', '집었다', '집어']],
    ['l04', 'st_one', '📖', '읽다', '읽', ['읽는다', '읽으면', '읽었다', '읽어서']],
    ['l04', 'st_one', '🔍', '찾다', '찾', ['찾고', '찾으면', '찾으니', '찾았다']],
    // ── st_two · 두 글자(정본 s06 비좁으니 · s12 옮기면 · 오르고·오르니 · l02 달리다 · l06 여닫다)
    ['l04', 'st_two', '🧺', '비좁다', '비좁', ['비좁고', '비좁으니', '비좁아서']],
    ['l04', 'st_two', '🧺', '비좁다', '비좁', ['비좁으면', '비좁고', '비좁았다']],
    ['l04', 'st_two', '📦', '옮기다', '옮기', ['옮기고', '옮기니', '옮기면']],
    ['l04', 'st_two', '📦', '옮기다', '옮기', ['옮기는', '옮기고', '옮기면']],
    ['l04', 'st_two', '🏃', '달리다', '달리', ['달리고', '달리니', '달리면']],
    ['l04', 'st_two', '🪜', '오르다', '오르', ['오르고', '오르니', '오르면']],
    ['l06', 'st_two', '🚪', '여닫다', '여닫', ['여닫고', '여닫으니', '여닫아서']],
    ['l06', 'st_two', '🚪', '여닫다', '여닫', ['여닫으면', '여닫는', '여닫았다']],
    // ── st_name · 이름 낱말(정본 s05 계단 · s11 종이 · l01 사전 · l06 s06 물통·뚜껑)
    ['l04', 'st_name', '🪜', '계단', '계단', ['계단이', '계단을', '계단은']],
    ['l04', 'st_name', '📄', '종이', '종이', ['종이가', '종이를', '종이는']],
    ['l04', 'st_name', '📚', '사전', '사전', ['사전이', '사전을', '사전에']],
    ['l04', 'st_name', '🪜', '계단', '계단', ['계단에', '계단도', '계단을']],
    ['l06', 'st_name', '🧴', '물통', '물통', ['물통이', '물통을', '물통은']],
    ['l06', 'st_name', '🫙', '뚜껑', '뚜껑', ['뚜껑이', '뚜껑을', '뚜껑은']]
  ];

  var NUM = { 2: '두', 3: '세', 4: '네' };
  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function chars(s) { return Array.from(s); }
  function hasBat(s) { var c = s.charCodeAt(s.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 !== 0; }
  function eun(s) { return '「' + s + '」' + (hasBat(s) ? '은' : '는'); }
  var TRAP = [['으', /^으/], ['어', /^[어아었았]/]];

  /* 풀이 — 바뀌지 않는 부분 · 바뀌는 부분(정본 차례) · 덫 한 줄 · 기본형 (이름 낱말 = 통째로 그대로) */
  function explainOf(row) {
    var stem = row[4], forms = row[5], tails = forms.map(function (f) { return f.slice(stem.length); });
    if (row[1] === 'st_name')
      return eun(stem) + ' 이름을 나타내는 낱말이라 통째로 그대로예요. 뒤에 「' + tails.join('·') + '」만 붙었어요.';
    var note = '';
    for (var k = 0; k < TRAP.length && !note; k++) {
      var withT = tails.filter(function (t) { return TRAP[k][1].test(t); });
      var without = forms.filter(function (f, i) { return !TRAP[k][1].test(tails[i]); });
      if (withT.length && without.length) note = ' — 「' + chars(withT[0])[0] + '」는 「' + without[0] + '」에는 없어요';
    }
    return eun(stem) + ' ' + NUM[forms.length] + ' 낱말에 빠짐없이 들어 있는 바뀌지 않는 부분이에요. 「' + tails.join('·') + '」' +
      (hasBat(tails[tails.length - 1]) ? '은' : '는') + ' 바뀌는 부분' + note + '. 기본형은 「' + row[3] + '」.';
  }

  function build(row, rng, id) {
    var stem = chars(row[4]), rows = shuffle(rng, row[5]);
    var lines = rows.map(function (f) {
      return chars(f).map(function (c, i) { return { t: c, hit: i < stem.length }; });
    });
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: t.hit }); });
    });
    return { id: id, l: row[0], icon: row[2], src: row[3], base: row[3], stem: row[4], type: row[1], rows: rows,
             prompt: row[2] + ' ' + PROMPT, lines: lines, tokens: tokens,
             answer: stem.slice(), explain: explainOf(row) };
  }

  function pool(upto) {
    var lim = upto && upto !== 'all' && ORDER.indexOf(upto) >= 0 ? ORDER.indexOf(upto) : ORDER.length - 1;
    return T.map(function (t, k) { return k; }).filter(function (k) { return ORDER.indexOf(T[k][0]) <= lim; });
  }
  /* 같은 낱말 판이 잇따르지 않게 — 앞 판과 다른 낱말을 먼저 고르고, 남은 것이 앞 판과 같으면 들어갈 틈에 끼움 */
  function spread(deck, prev) {
    var rest = deck.slice(), out = [];
    var base = function (k) { return T[k][3]; };
    while (rest.length) {
      var before = out.length ? base(out[out.length - 1]) : prev, j = 0;
      while (j < rest.length && base(rest[j]) === before) j++;
      if (j < rest.length) { out.push(rest.splice(j, 1)[0]); continue; }
      var k = rest.shift(), b = base(k), put = -1;
      for (var i = 1; i < out.length && put < 0; i++) if (base(out[i - 1]) !== b && base(out[i]) !== b) put = i;
      if (put < 0 && out.length && base(out[0]) !== b && prev !== b) put = 0;
      if (put < 0) out.push(k); else out.splice(put, 0, k);
    }
    return out;
  }

  return {
    id: 'stem_hunt',
    title: '바뀌지 않는 부분 짚기',
    T: T, ORDER: ORDER, PROMPT: PROMPT,
    chars: chars, pool: pool, explainOf: explainOf,
    create: function (params, rng) {
      var idx = pool(params && params.upto);
      var deck = spread(shuffle(rng, idx), null), lastBase = null, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) deck = spread(shuffle(rng, idx), lastBase);
          var k = deck.shift(); lastBase = T[k][3];
          return build(T[k], rng, 'st' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(String(pick)) >= 0; }
      };
    },
    printRender: function (q) { return q.icon + ' ' + q.rows.join(' · '); },
    printAnswer: function (q) { return q.stem + (q.type === 'st_name' ? ' (이름 — 그대로)' : ' → 기본형 ' + q.base); },
    printHead: '낱말들을 나란히 놓고 모든 낱말에 똑같이 남는 부분(바뀌지 않는 부분)에 ○를 하세요.'
  };
}));
