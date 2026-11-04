/* gens/korean/sound_hunt.js — 해돋이는 [해도지] · [ㅈ]·[ㅊ]으로 바뀌는 낱말 찾기 (4학년 1학기 국어 1단원 「깊이 있게 읽어요」 l13 단원 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 낱말 토큰)가 쓴다 — 토큰 하나 = 어절 하나.
 * params: {}  범위 하나(l13) — 범위 칩 없음
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[찾을 어절…], fix:[소리…], type, explain, l }
 *
 * 정본 l13 s05: 받침 ㄷ·ㅌ 뒤에 모음 ㅣ → [ㅈ]·[ㅊ] · ㄷ 뒤에 히 → [ㅊ] — 해돋이 [해도지] · 같이 [가치] · 굳히다 [구치다]
 * 정본 l13 s08 오개념: [해도지]로 읽는 것은 잘못 읽는 것 → 잘못이 아니라 규칙 · 쓸 때는 글자대로, 읽을 때는 소리대로
 * 정본 l13 s11 기본 ③ 낱말 다섯(해돋이 · 구름 · 같이 · 묻히다 · 나무) · s12 묻히다 [무치다] · s13 watch 「구름」「나무」도 바뀐다고 하는 경우
 * 정본 l13 s14 해돋이길 [해도지길] · 같이 가요 · s15 펭이 굳히다 [굳히다] · 해돋이 [해도디] — 받침 뒤에 ㅣ나 히가 오는지 보는 것이 열쇠
 * 찾을 것 = 소리가 [ㅈ]·[ㅊ]으로 바뀌는 어절(판마다 2~3) · 판정 전엔 모든 낱말이 같은 모습(답 미노출). 소리는 풀이에만.
 * 덫(판마다) = ① 받침 ㄷ·ㅌ 뒤에 ㅣ가 아닌 모음(같은 · 밭에 · 굳은 — 「받침만 보면 누르기」)
 *            ② ㄷ·ㅌ 아닌 받침 뒤에 ㅣ·히(먹이 · 높이 · 막히다 · 입히다 — 「ㅣ·히만 보면 누르기」)
 * type(문항 단위 · 진단 축 — 찾을 곳의 갈래로 정한다. 갈래는 글자를 풀어 기계로 가린다 · 손 이름표 0):
 *   su_di   받침 ㄷ + ㅣ → [ㅈ] 만(해돋이 · 맏이 · 굳이 · 미닫이)
 *   su_ti   받침 ㅌ + ㅣ → [ㅊ] 만(같이 · 밭이 · 끝이 · 겉이 · 붙이고)
 *   su_hi   ㄷ + 히 → [ㅊ] 만(굳히다 · 묻히다 · 닫히다 · 걷히다)
 *   su_mix  두 갈래 이상이 한 글에 — 정본 s11 낱말 다섯 · s15 펭이 · s14 길 이름
 * 표지 문법(이 파일 안): [글자|소리] = 찾을 어절 · {어절} = 덫 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['sound_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PROMPT = '[ㅈ]·[ㅊ]으로 바뀌는 낱말을 모두 눌러요';

  /* [아이콘, 글 이름, 글] */
  var T = [
    // ── su_di · 받침 ㄷ + ㅣ → [ㅈ]
    ['🌅', '새해 아침', '새해 아침에 [해돋이를|해도지를] 보러 갔어요. / 산이 아주 {높이} 솟아 있었어요. / [맏이인|마지인] 형이 앞장섰어요. / {굳은} 땅을 밟고 올라갔어요.'],
    ['🏠', '우리 집 맏이', '나는 우리 집 [맏이예요.|마지예요.] / 동생이 {묻은} 물감도 닦아 줘요. / [굳이|구지] 부탁하지 않아도 그래요. / {놀이} 시간엔 늘 양보해요.'],
    ['🚪', '교실 문', '교실 [미닫이를|미다지를] 살살 {닫아요.} / 쉬는 시간에 [굳이|구지] 뛰지 않아요. / 문 {높이}가 아주 높아요.'],
    ['🪧', '동네 길 이름', '우리 동네 길 이름은 [해돋이길.|해도지길.] / 길 {끝에} 작은 {놀이터가} 있어요. / 아침마다 [해돋이를|해도지를] 보러 가요.'],
    ['🐧', '펭이네 집', '펭이는 다섯 형제 가운데 [맏이래.|마지래.] / {동생이} 엎지른 물도 닦아 줘. / [굳이|구지] 부탁하지 않아도 말이야. / 바닥에 {묻은} 물감도 지워 줘.'],
    ['📕', '그림책 첫 장', '그림책 첫 장에 [해돋이가|해도지가] 나와요. / 바다 {같은} 하늘이 펼쳐져요. / {깊이} 읽으려고 / [굳이|구지] 서두르지 않아요.'],
    // ── su_ti · 받침 ㅌ + ㅣ → [ㅊ]
    ['🎒', '학교 가는 길', '펭이야, 학교에 [같이|가치] 가자. / 우리 {가방이} 색이 {같아.} / 수업 [끝이|끄치] 나면 또 만나.'],
    ['🌱', '할머니 밭', '할머니 [밭이|바치] 아주 넓어요. / {밭에} 감자를 심었어요. / 감자 [겉이|거치] 울퉁불퉁해요. / {먹이를} 찾는 새도 왔어요.'],
    ['🍚', '가마솥 밥', '할머니 댁 [가마솥이|가마소치] 뜨거워요. / {솥에} 쌀을 넣고 불을 땠어요. / {밥이} 다 되면 / [같이|가치] 먹어요.'],
    ['🏷️', '이름표 붙이기', '공책 {겉에} 스티커를 [붙이고|부치고] / 이름표도 [같이|가치] 달았어요. / {필통이} 책상 {밑에} 있어요.'],
    ['📖', '이야기 끝', '이야기 [끝이|끄치] 궁금해요. / {끝을} 미리 보지 않고 / 짝과 [같이|가치] 읽기로 했어요. / 책 {길이가} 아주 길어요.'],
    ['🍞', '팥빵', '[팥이|파치] 가득 든 빵을 샀어요. / 빵 [겉이|거치] 바삭해요. / {팥을} 좋아하는 {동생이} / 반을 먹었어요.'],
    ['📚', '깊이 읽기 클럽', '곰이와 펭이는 [같이|가치] 책을 읽어요. / {깊이} 읽다 보면 / 이야기 [끝이|끄치] 보여요. / 책장 {끝에} 쪽지도 있어요.'],
    // ── su_hi · ㄷ + 히 → [ㅊ]
    ['🏺', '찰흙 그릇', '찰흙 그릇을 그늘에서 [굳히면|구치면] / 금이 가지 않아요. / [굳히는|구치는] 동안 기다려요. / 다 {굳은} 그릇에 색을 {입히면} 예뻐요.'],
    ['🌫️', '안개 낀 아침', '아침 안개가 [걷히고|거치고] / 산 위로 해가 {돋아요.} / 구름도 모두 [걷히니|거치니] / {막힌} 데 없이 멀리 보여요.'],
    ['👖', '흙 묻은 바지', '놀이터에서 바지에 흙을 [묻히고|무치고] 왔어요. / 손에 [묻힌|무친] 물감도 닦았어요. / 엄마가 {묻은} 흙을 털어 주셨어요. / 동생에게 {입히려던} 바지래요.'],
    ['💨', '바람 부는 날', '바람이 불어 문이 [닫히고|다치고] / 창문도 [닫히는|다치는] 소리가 났어요. / 내가 {닫은} 게 아니에요. / 숨이 {막히는} 줄 알았어요.'],
    ['🖍️', '크레파스', '크레파스를 손에 [묻히면|무치면] / 책에도 [묻히게|무치게] 돼요. / {묻은} 손은 먼저 닦고 / 책장이 {접히지} 않게 넘겨요.'],
    ['🍮', '과일 젤리', '뜨거운 과일즙은 먼저 {식히고} / 냉장고에서 [굳히면|구치면] 젤리가 돼요. / 다 [굳힌|구친] 젤리를 / {굳은} 모양 그대로 꺼내요.'],
    // ── su_mix · 두 갈래 이상 — 정본 s11 · s15 · s14
    ['🔤', '낱말 카드', '[해돋이|해도지] 구름 [같이|가치] / [묻히다|무치다] 나무 / {같은} {놀이}'],
    ['🐧', '펭이의 소리 내어 읽기', '펭이는 [해돋이를|해도지를] 소리 내어 읽었어요. / [굳히다도|구치다도] 또박또박 읽었어요. / 곰이와 [같이|가치] 넘긴 다음 카드는 {먹이.}'],
    ['🚶', '해돋이길 산책', '[해돋이길로|해도지길로] [같이|가치] 걸어가요. / 길 {끝에} 작은 공원이 있어요. / 공원 {놀이터에서} 놀아요.'],
    ['⛰️', '새벽 산', '안개가 [걷히니|거치니] [해돋이가|해도지가] 보였어요. / 산 위로 해가 {돋아} 올라요. / 아빠와 [같이|가치] 박수를 쳤어요. / 숨이 {막히게} 멋졌어요.'],
    ['✏️', '받아쓰기', '{받아쓰기} 시간이에요. / [해돋이를|해도지를] 글자대로 썼어요. / [굳히다도|구치다도] 바르게 썼어요. / 다음 낱말은 {높이예요.}'],
    ['🃏', '소리 카드 놀이', '곰이가 뒤집은 카드는 [끝이.|끄치.] / 펭이가 뒤집은 카드는 {밭에.} / 그다음 카드는 [닫히다.|다치다.] / 마지막 카드는 {먹이.}']
  ];

  /* 한글 음절 풀기 — 첫소리 · 가운뎃소리 · 받침(인덱스) */
  var CHO_ㅇ = 11, CHO_ㅎ = 18, JUNG_ㅣ = 20, JONG_ㄷ = 7, JONG_ㅌ = 25;
  function jamo(ch) { var c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c >= 11172) return null; return { cho: Math.floor(c / 588), jung: Math.floor(c % 588 / 28), jong: c % 28 }; }
  function syl(cho, jung, jong) { return String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + jong); }
  var core = function (s) { return s.replace(/[.?!,]+$/, ''); };

  /* 어절 속 바뀌는 자리 — [{i, kind}] · kind di(ㄷ+ㅣ) · ti(ㅌ+ㅣ) · hi(ㄷ·ㅌ+히) */
  function sites(w) {
    w = core(w); var out = [];
    for (var i = 0; i + 1 < w.length; i++) {
      var a = jamo(w[i]), b = jamo(w[i + 1]);
      if (!a || !b || b.jung !== JUNG_ㅣ || (a.jong !== JONG_ㄷ && a.jong !== JONG_ㅌ)) continue;
      if (b.cho === CHO_ㅇ) out.push({ i: i, kind: a.jong === JONG_ㄷ ? 'di' : 'ti' });
      else if (b.cho === CHO_ㅎ) out.push({ i: i, kind: 'hi' });
    }
    return out;
  }
  /* 소리 = 바뀌는 자리만 고친 글자(받침은 뒤로 넘어가 [ㅈ]·[ㅊ]) — 다른 소리 바뀜이 없는 어절만 쓴다 */
  function sound(w) {
    var s = core(w).split(''), st = sites(w);
    st.slice().reverse().forEach(function (x) {
      var a = jamo(s[x.i]), b = jamo(s[x.i + 1]);
      s[x.i] = syl(a.cho, a.jung, 0);
      s[x.i + 1] = syl(x.kind === 'di' ? 12 : 14, b.jung, b.jong);
    });
    return s.join('');
  }
  function kindOf(t) { var st = sites(t); return st.length ? st[0].kind : ''; }

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 토큰. [글자|소리] = 찾을 어절 · {어절} = 덫 · 나머지 어절 하나 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      var out = [], re = /\[([^\]|]+)\|([^\]]+)\]|\{([^}]+)\}|(\S+)/g, m;
      while ((m = re.exec(line))) {
        if (m[1]) out.push({ t: m[1], hit: true, fix: m[2], kind: kindOf(m[1]) });
        else if (m[3]) out.push({ t: m[3], hit: false, trap: true });
        else out.push({ t: m[4], hit: false });
      }
      return out;
    });
  }
  function typeOf(lines) {
    var k = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.kind; });
    var set = k.filter(function (x, i) { return k.indexOf(x) === i; });
    return set.length > 1 ? 'su_mix' : ('su_' + set[0]);
  }

  var HEAD = {
    su_di: '받침 ㄷ 뒤에 ㅣ가 오면 [ㅈ]으로 소리 나요: ',
    su_ti: '받침 ㅌ 뒤에 ㅣ가 오면 [ㅊ]으로 소리 나요: ',
    su_hi: 'ㄷ 뒤에 히가 오면 [ㅊ]으로 소리 나요: ',
    su_mix: '받침 ㄷ·ㅌ 뒤에 ㅣ나 히가 오는지 봐요 — ㄷ+ㅣ [ㅈ] · ㅌ+ㅣ [ㅊ] · ㄷ+히 [ㅊ]: '
  };
  /* 받침 있으면 「은」 · 없으면 「는」 — 덫 맨 끝 글자로 고른다 */
  function eunNeun(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '은' : '는'; }

  /* 풀이 = 머리 + 찾을 곳마다 「글자」 → [소리] + 덫은 「바뀌지 않아요」 + 쓸 때는 글자대로 */
  function explainOf(lines) {
    var all = [].concat.apply([], lines);
    var parts = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + core(t.t) + '」 → [' + core(t.fix) + ']'; });
    var traps = all.filter(function (t) { return t.trap; }).map(function (t) { return core(t.t); });
    return HEAD[typeOf(lines)] + parts.join(' · ') +
      (traps.length ? '  (「' + traps.join('」·「') + '」' + eunNeun(traps[traps.length - 1]) + ' 바뀌지 않아요)' : '') + '  쓸 때는 글자대로!';
  }

  function build(row, k, id) {
    var lines = parse(row[2]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var hits = [].concat.apply([], lines).filter(function (t) { return t.hit; });
    return { id: id, l: 'l13', icon: row[0], src: row[1], type: typeOf(lines),
             prompt: row[0] + ' ' + PROMPT, lines: lines, tokens: tokens,
             answer: hits.map(function (t) { return t.t; }), fix: hits.map(function (t) { return t.fix; }), explain: explainOf(lines) };
  }

  return {
    id: 'sound_hunt',
    title: '해돋이는 [해도지] — [ㅈ]·[ㅊ]으로 바뀌는 낱말 찾기',
    T: T, PROMPT: PROMPT, HEAD: HEAD,
    parse: parse, typeOf: typeOf, kindOf: kindOf, sites: sites, sound: sound, jamo: jamo, eunNeun: eunNeun,
    create: function (params, rng) {
      var idx = T.map(function (t, k) { return k; });
      var deck = shuffle(rng, idx), last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k, 'su' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(String(pick)) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b><br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.map(function (a, i) { return core(a) + ' → [' + core(q.fix[i]) + ']'; }).join(' · '); },
    printHead: '글을 읽고 [ㅈ]·[ㅊ]으로 소리가 바뀌는 낱말에 모두 ○를 하고, 옆에 소리 나는 대로 [ ] 안에 쓰세요. 받침 ㄷ·ㅌ 뒤에 ㅣ나 히가 오는지 먼저 보세요.'
  };
}));
