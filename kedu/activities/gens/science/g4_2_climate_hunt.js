/* gens/science/g4_2_climate_hunt.js — 기후 지킴이 글 속 찾기 (4학년 2학기 과학 4단원 「기후 변화와 우리 생활」 l03 · l06 · l07 · l10 마무리)
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 덩이 토큰)가 쓴다 — 토큰 하나 = 뜻 덩이 하나(생활 모습·노력 한 덩이).
 * params: { upto: 'l03'|'l06'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 글이 덱 앞머리
 * next() → { prompt, icon, src, lines:[[tok…]…], tokens:[{t,hit} | {t:' ',sep:true}], answer:[…], type, explain, l }
 *
 * 유형 = 물음 = 진단 축(지도서 4-2 과학 4단원 · 『과학』 쪽):
 *   cl_worse  (l03) 기후 변화를 더 심각하게 만드는 일 — 『과학』 84~85쪽(숲을 파괴하고 건물을 지어요 · 화석 연료를 사용해요 · 쓰레기를 많이 버려요
 *             · 에너지를 많이 사용해요 · 대규모 축산, 지도서 320쪽) · 더 생각해요 나의 생활 습관(지도서 321쪽: 낮은 층도 승강기 · 쓰지 않는 텔레비전·컴퓨터를
 *             켜 놓음 · 일회용품을 많이 사용) · 도입 난방을 필요 이상으로(지도서 320쪽)
 *             덫 a = 대응하는 일(나무 심기 · 계단 · 걷기 — 지도서 321쪽 형성 평가 ㉠·㉢)
 *   cl_act    (l06) 기후 변화에 대응하는 방법 — 『과학』 90~91쪽(국가와 사회: 숲을 되살리고 화석 연료 사용을 줄이는 법과 제도 · 과학자: 기후 변화에 강한 씨앗,
 *             친환경 에너지 개발 · 사람들: 걷기, 에너지 절약, 일회용품 사용하지 않기 · 생활 속 과학 서머킹) · 지도서 338쪽 조사 예(물 아껴 쓰기 · 인공 나무 ·
 *             인공위성으로 온실 가스 감시) · 353쪽 과학 글쓰기 예(일회용 숟가락·젓가락 받지 않기 · 양치할 때 컵에 물 받기)
 *             덫 w = 더 심각하게 만드는 일(도로를 만들려 숲 파괴 · 화석 연료를 많이 태움 · 쓰지 않는 컴퓨터를 켜 놓음 — 84~85쪽)
 *   cl_school (l07) 학교에서 실천하는 대응 — 『과학』 91쪽 더 생각해요 예시 답안(지도서 339쪽: 대중교통·걷기 · 먹을 만큼만 받기 · 빈 교실의 전등 끄기 ·
 *             다회용 컵 · 종이 가방이나 일회용 비닐봉지 줄이기) · 형성 평가 바르게 실천한 모습(불필요한 전등의 전원을 꺼요)
 *             덫 w = 형성 평가 바르지 않은 모습(음식을 많이 남겨요 · 일회용품을 많이 사용해요 · 쓰레기를 아무 곳에나 버려요)
 * 지도서 319쪽 유의 「모든 인간의 삶과 활동 자체가 기후 변화에 심각한 영향을 미친다는 부정적인 인식을 갖지 않도록」 → 글마다 보통 덩이(밥 먹기 · 놀기)를 섞되
 *   찾을 덩이로 삼지 않는다 · 337쪽 유의 「완화·적응을 구분하여 지도하지 않도록」 → 대응 칸은 하나.
 * 표지 문법(이 파일 안): [찾을 덩이] · {a|w:덫} · | = 덩이 사이 · / = 줄 바꿈
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g4_2_climate_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l06', 'l07'];
  var PROMPT = {
    cl_worse: '🔥 기후 변화를 더 심각하게 만드는 일을 모두 눌러요',
    cl_act: '🌱 기후 변화에 대응하는 방법을 모두 눌러요',
    cl_school: '🏫 학교에서 실천하는 기후 변화 대응 방법을 모두 눌러요'
  };
  var LEAD = { cl_worse: '기후 변화를 더 심각하게 만드는 일', cl_act: '기후 변화에 대응하는 방법', cl_school: '학교에서 실천하는 대응 방법' };
  var TRAP_NOTE = { a: '나무 심기·계단·걷기는 기후 변화에 대응하는 일이에요', w: '숲 파괴·화석 연료·낭비는 기후 변화를 더 심각하게 만들어요' };
  var TAIL = {
    cl_worse: '숲 파괴 · 화석 연료 사용 · 많은 쓰레기 · 과도한 에너지 사용은 온실 가스를 늘려 기후 변화를 더 심각하게 만들어요',
    cl_act: '국가와 사회 · 과학자 · 사람들이 함께 대응해요 — 법과 제도, 새로운 기술, 생활 속 실천',
    cl_school: '먹을 만큼만 받기 · 빈 교실 전등 끄기 · 다회용 컵 · 걷기와 대중교통은 학교에서도 실천할 수 있어요'
  };

  /* [차시, 아이콘, 글 이름, type, 글] */
  var T = [
    // ── l03 · 『과학』 84~85쪽 · 지도서 318~323쪽
    ['l03', '🏙️', '도시가 커져요', 'cl_worse',
      '[도로를 만들려고 숲의 나무를 베어요] / [건물을 짓기 위해 숲을 파괴해요] / {a:공원에 나무를 심고 가꿔요}'],
    ['l03', '🏭', '공장과 자동차', 'cl_worse',
      '[공장에서 화석 연료를 태워 물건을 만들어요] / [자동차가 화석 연료를 사용해 움직여요] | {a:가까운 거리는 걸어 다녀요}'],
    ['l03', '🏠', '겨울 저녁 우리 집', 'cl_worse',
      '가족과 함께 저녁을 먹어요 / [난방을 필요 이상으로 해서 반팔을 입어요] / [보지 않는 텔레비전을 켜 놓아요] | {a:쓰지 않는 전등은 꺼요}'],
    ['l03', '🛗', '아파트 2층 가는 길', 'cl_worse',
      '친구와 놀이터에서 놀았어요 / [낮은 층인데도 승강기를 타요] | {a:계단을 걸어 올라가요} / [가까운 거리도 자동차로 이동해요]'],
    ['l03', '🗑️', '쓰레기 이야기', 'cl_worse',
      '[일회용품을 많이 사용해요] / [쓰레기를 많이 버려요] | {a:일회용품 사용을 줄여요} / 학교에서 돌아와 숙제를 해요'],
    ['l03', '🐄', '고기와 우유', 'cl_worse',
      '[고기, 우유를 얻으려고 가축을 대규모로 키워요] / [전기를 만들려고 화석 연료를 많이 써요] / {a:숲에 나무를 심어요}'],
    // ── l06 · 『과학』 90~91쪽 · 지도서 336~341쪽
    ['l06', '🏛️', '나라와 사회의 노력', 'cl_act',
      '[숲을 되살려요] / [화석 연료 사용을 줄이는 법과 제도를 만들어요] / {w:도로를 만들려고 숲을 파괴해요}'],
    ['l06', '🔬', '과학자의 연구', 'cl_act',
      '[기후 변화에 강한 씨앗을 연구해요] | [친환경 에너지를 개발해요] / {w:공장에서 화석 연료를 많이 태워요} / [여름에 수확하는 사과 서머킹을 개발해요]'],
    ['l06', '🛰️', '새로운 기술', 'cl_act',
      '[온실 가스를 줄일 수 있는 인공 나무를 연구해요] / [인공위성으로 온실 가스를 감시해요] / {w:쓰레기를 많이 버려요}'],
    ['l06', '🙋', '사람들의 실천', 'cl_act',
      '[가까운 거리는 걸어 다녀요] | [에너지를 절약해요] / {w:쓰지 않는 컴퓨터를 켜 놓아요} / [일회용품을 사용하지 않아요]'],
    ['l06', '💧', '물 아끼기', 'cl_act',
      '[샤워를 너무 길게 하지 않아요] / [세탁물을 모아서 세탁기를 돌려요] / [양치할 때 컵에 물을 받아서 해요] | {w:난방을 필요 이상으로 해요}'],
    ['l06', '🛍️', '배달 음식을 먹을 때', 'cl_act',
      '가족과 저녁을 먹기로 했어요 / [일회용 숟가락, 젓가락을 받지 않아요] / {w:일회용품을 많이 사용해요}'],
    // ── l07 · 『과학』 91쪽 더 생각해요 · 92~95쪽 · 지도서 339~349쪽
    ['l07', '🍱', '급식 시간', 'cl_school',
      '친구와 이야기하며 점심을 먹어요 / [먹을 만큼만 받고 음식을 남기지 않아요] / {w:음식을 많이 남겨요}'],
    ['l07', '💡', '체육 시간', 'cl_school',
      '운동장으로 나가 줄넘기를 해요 / [빈 교실의 전등을 꺼요] | [불필요한 전등의 전원을 꺼요] / {w:쓰지 않는 컴퓨터를 켜 놓아요}'],
    ['l07', '🚌', '등하교', 'cl_school',
      '[자가용보다 대중교통을 이용해요] | [걸어서 다녀요] / {w:가까운 거리도 자동차로 이동해요}'],
    ['l07', '🥤', '교실 생활', 'cl_school',
      '[다회용 컵을 사용해요] / [일회용 비닐봉지 사용을 줄여요] / {w:쓰레기를 아무 곳에나 버려요} | {w:일회용품을 많이 사용해요}']
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 글 → 줄마다 덩이 토큰 */
  function parse(text) {
    return text.split(' / ').map(function (line) {
      return line.split(' | ').map(function (c) {
        var m;
        if ((m = c.match(/^\[(.+)\]$/))) return { t: m[1], hit: true, ans: m[1] };
        if ((m = c.match(/^\{([aw]):(.+)\}$/))) return { t: m[2], hit: false, trap: m[1] };
        return { t: c, hit: false };
      });
    });
  }

  function explainOf(lines, type) {
    var all = [].concat.apply([], lines);
    var hits = all.filter(function (t) { return t.hit; }).map(function (t) { return '「' + t.ans + '」'; });
    var notes = [], seen = {};
    all.forEach(function (t) { if (t.trap && !seen[t.trap]) { seen[t.trap] = 1; notes.push(TRAP_NOTE[t.trap]); } });
    return LEAD[type] + ': ' + hits.join(' · ') + (notes.length ? '  (' + notes.join(' · ') + ')' : '') + ' — ' + TAIL[type];
  }

  function build(row, id) {
    var lines = parse(row[4]);
    var tokens = [];
    lines.forEach(function (line, li) {
      if (li) tokens.push({ t: ' ', sep: true });
      line.forEach(function (t) { tokens.push({ t: t.t, hit: !!t.hit }); });
    });
    var answer = [].concat.apply([], lines).filter(function (t) { return t.hit; }).map(function (t) { return t.ans; });
    return { id: id, l: row[0], icon: row[1], src: row[2], type: row[3],
             prompt: PROMPT[row[3]], lines: lines, tokens: tokens, answer: answer, explain: explainOf(lines, row[3]) };
  }

  return {
    id: 'g4_2_climate_hunt',
    title: '기후 지킴이 글 속 찾기',
    T: T, ORDER: ORDER, PROMPT: PROMPT,
    parse: parse,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== ORDER[ORDER.length - 1] ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t[0]) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k][0] === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], 'cl' + k + '_' + (n++));
        },
        check: function (pick, q) { return q.answer.indexOf(pick) >= 0; }
      };
    },
    printRender: function (q) {
      return q.icon + ' <b>' + q.src + '</b> — ' + q.prompt.replace(/^\S+ /, '') + '<br>' + q.lines.map(function (line) {
        return line.map(function (t) { return t.t; }).join(' ');
      }).join('<br>');
    },
    printAnswer: function (q) { return q.answer.join(' · '); },
    printHead: '글을 읽고 물음에 맞는 곳에 모두 밑줄을 그으세요.'
  };
}));
