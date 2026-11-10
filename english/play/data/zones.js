/* ============================================================
 * 영어 놀이터 — 구역 데이터 (입문 층 Lv1~Lv2)
 * 단일 원천 = v3 펼침(handoff kedu/english/v3/lv2/02_food1.md)의 재료를 그대로 읽어 놀이로 재표현.
 * 칸 id 는 v3 ladder.js 와 같은 id(lv2-02) — 보스전 통과 = KProgress.light(id) 로 사다리와 동기.
 * 그림 = v3 펼침 「그림 근거」 그대로(🍱 lunch 등). 문장틀 = Lv1 #2 「I like ~」(Lv2 #2 시점에 아이가 아는 유일한 문장틀).
 * ============================================================ */
window.PLAY_ZONES = {
  world: [
    { id: 'lv1', name: '소리 숲', open: false, note: 'Lv1 — 놀이터 재표현 전(사다리 그대로)' },
    { id: 'lv2', name: '마을', open: true }
  ],
  zones: [
    {
      id: 'lv2-02', world: 'lv2', slug: 'food1', stage: 'lunch-shop', cellName: '음식', cellIcon: '🐟',
      name: '점심 가게', emoji: '🏪', color: '#FF8A3D',
      page: 'zone/food1.html',
      /* 재료 8 — 출처 v3 Lv2 #2 */
      words: [
        { w: 'fish',  ko: '물고기',  pic: '🐟' },
        { w: 'chips', ko: '감자튀김', pic: '🍟' },
        { w: 'lunch', ko: '점심',    pic: '🍱' },
        { w: 'shop',  ko: '가게',    pic: '🏪' },
        { w: 'dish',  ko: '접시',    pic: '🍽️' },
        { w: 'chop',  ko: '썰다',    pic: '🔪' },
        { w: 'ham',   ko: '햄',      pic: '🍖' },
        { w: 'jam',   ko: '잼',      pic: '🍓' }
      ],
      /* 혼동 예상쌍(펼침) — 음성 판정에서 서로를 정답으로 받지 않는다 */
      confuse: [['chips', 'chop'], ['dish', 'fish'], ['chop', 'shop']],
      /* 먹는 것 — 보스전 「I like ~」·접시 채우기의 재료. 가게·접시·썰다는 간판·그릇·도구 */
      foods: ['fish', 'chips', 'ham', 'jam', 'lunch'],
      sentence: function (w) { return 'I like ' + w + '.'; },
      /* 챈트 — 재료 8 전부, 한 줄 3박. 펼침 밖 단어 0(and·at 는 Lv1 사이트워드) */
      chant: [
        ['fish', 'chips', 'ham'],
        ['jam', 'lunch', 'shop'],
        ['dish', 'chop', 'lunch'],
        ['fish', 'chips', 'ham']
      ],
      /* 보스 = 가게 주인 Sam(v3 인물 풀) */
      boss: { name: 'Sam', pic: '👨‍🍳',
        turns: [
          { ask: 'Fish or chips?', ko: '물고기? 감자튀김?', pick: ['fish', 'chips'] },
          { ask: 'Ham or jam?',    ko: '햄? 잼?',          pick: ['ham', 'jam'] },
          { ask: 'What do you like?', ko: '뭐가 좋아?',     pick: ['fish', 'chips', 'ham', 'jam', 'lunch'] }
        ] },
      /* 이 무대에서 조립기가 고를 수 있는 미니게임(적힌 차례 = 처음 만나는 차례). 사건 전용 놀이(엉뚱한 주문)는 사건 표가 데려온다.
         정원(돌보기)·특별 손님은 날마다 앞뒤에 붙는다 */
      games: ['order-shop', 'chant', 'pop', 'monster', 'catch', 'lean', 'belt', 'plates', 'sandwich', 'vending'],
      /* 무대의 작은 변화 — 하루를 마칠 때마다 하나씩 생기는 장식(열매·아이템과는 별개) */
      decor: [
        { id: 'plant', pic: '🪴', name: '화분' }, { id: 'menu', pic: '📋', name: '메뉴판' }, { id: 'lamp', pic: '🏮', name: '등' },
        { id: 'balloon', pic: '🎈', name: '풍선' }, { id: 'clock', pic: '🕰️', name: '시계' }, { id: 'frame', pic: '🖼️', name: '그림' },
        { id: 'basket', pic: '🧺', name: '바구니' }, { id: 'bell', pic: '🛎️', name: '종' }
      ],
      /* 엉뚱한 주문(놀이 #2) — 꾸미는 말은 사다리에 나온 것만: big·small = Lv1 수·꾸밈말 칸, red·blue = Lv1 색 칸.
         attr = 손님이 말하는 것, vs = 견줄 것. nouns = 이 구역 재료 중 그 말이 어울리는 것 */
      silly: [
        { kind: 'size',  attr: 'big',   vs: 'small', nouns: ['fish', 'ham', 'chips', 'lunch'] },
        { kind: 'size',  attr: 'small', vs: 'big',   nouns: ['fish', 'ham', 'dish'] },
        { kind: 'color', attr: 'red',   vs: 'blue',  nouns: ['jam', 'fish', 'dish'] },
        { kind: 'color', attr: 'blue',  vs: 'red',   nouns: ['dish', 'fish', 'jam'] }
      ],
      /* 내 공간 — 음식 구역은 「가게 진열」. 열매가 된 단어가 진열대에 색깔로 올라간다 */
      space: { kind: 'shelf', label: '내 가게' },
      /* 캐릭터 파츠 1종 — 구역 첫 열매에 앞치마 */
      part: { id: 'apron', name: '앞치마', when: 'firstFruit' }
    },
    {
      /* 점심 가게 둘째 칸 — 재료 8 = v3 펼침 Lv2 #12 음식②·놀이(전부 a_e). 그림 = 이미 만든 v3 차시(12_*) 그대로 */
      id: 'lv2-12', world: 'lv2', slug: 'food2', stage: 'lunch-shop', decorKey: 'lv2-02',   /* 무대 장식은 첫 칸 기록에 함께 쌓는다 */
      name: '점심 가게', cellName: '음식·놀이', cellIcon: '🎂', emoji: '🏪', color: '#FF8A3D',
      page: 'zone/food1.html?cell=lv2-12',
      words: [
        { w: 'cake',  ko: '케이크',   pic: '🎂' },
        { w: 'grape', ko: '포도',     pic: '🍇' },
        { w: 'game',  ko: '게임',     pic: '🎮' },
        { w: 'race',  ko: '경주',     pic: '🏁' },
        { w: 'plate', ko: '접시',     pic: '🍽' },
        { w: 'shake', ko: '셰이크',   pic: '🥤' },
        { w: 'date',  ko: '날짜',     pic: '📅' },
        { w: 'chase', ko: '쫓아가다', pic: '🐕🐈' }
      ],
      /* 혼동 예상쌍(펼침 12_B) */
      confuse: [['race', 'chase'], ['cake', 'shake'], ['date', 'plate']],
      foods: ['cake', 'grape', 'shake'],
      sentence: function (w) { return 'I like ' + w + '.'; },
      chant: [
        ['cake', 'shake', 'plate'],
        ['game', 'race', 'chase'],
        ['grape', 'date', 'cake'],
        ['game', 'race', 'chase']
      ],
      boss: { name: 'Sam', pic: '👨‍🍳',
        turns: [
          { ask: 'Cake or grape?',  ko: '케이크? 포도?', pick: ['cake', 'grape'] },
          { ask: 'Shake or cake?',  ko: '셰이크? 케이크?', pick: ['shake', 'cake'] },
          { ask: 'What do you like?', ko: '뭐가 좋아?',   pick: ['cake', 'grape', 'shake'] }
        ] },
      games: ['order-shop', 'chant', 'pop', 'monster', 'catch', 'lean', 'belt', 'plates', 'sandwich', 'vending'],
      decor: null,
      silly: [
        { kind: 'size',  attr: 'big',   vs: 'small', nouns: ['cake', 'grape', 'shake', 'plate'] },
        { kind: 'size',  attr: 'small', vs: 'big',   nouns: ['cake', 'grape', 'plate'] },
        { kind: 'color', attr: 'red',   vs: 'blue',  nouns: ['plate', 'grape', 'cake'] },
        { kind: 'color', attr: 'blue',  vs: 'red',   nouns: ['plate', 'cake', 'shake'] }
      ],
      space: { kind: 'shelf', label: '내 가게' },
      part: { id: 'apron', name: '앞치마', when: 'firstFruit' }
    }
  ],
  /* 다음 무대 — after 구역의 특별 손님을 넘으면 안개가 걷혀 구경할 수 있고(결정 §0-2), 그 구역 단어 ¾ 이 꽃이면 들어갈 수 있다.
     page 가 없으면 아직 짓는 중 */
  peek: [
    { id: 'classroom', name: '교실', emoji: '🏫', after: 'lv2-02', host: 'mina', page: '' }
  ],
  /* 무대 — 여러 칸이 한 무대를 쓴다(홈 지도는 무대마다 한 칸) */
  stages: { 'lunch-shop': { id: 'lunch-shop', name: '점심 가게', emoji: '🏪', page: 'zone/food1.html' } },
  cells: function (stage) { return this.zones.filter(function (z) { return z.stage === stage; }); },
  /* 그 무대에서 지금 놀 수 있는 마지막 칸의 차례 — 첫 칸 + 앞 칸이 열림 조건(특별 손님 + 단어 ¾ 이 꽃)을 채운 만큼(결정 §0-2) */
  openIndex: function (stage, seed) {
    var zs = this.cells(stage), k = 0;
    for (var i = 0; i < zs.length - 1; i++) { if (seed && seed.canClear(zs[i].id, zs[i].words.map(function (x) { return x.w; }))) k = i + 1; else break; }
    return k;
  },
  zone: function (id) { for (var i = 0; i < this.zones.length; i++) if (this.zones[i].id === id) return this.zones[i]; return null; }
};
/* 같은 무대의 칸들은 장식 목록을 함께 쓴다(둘째 칸의 decor 는 첫 칸 것) */
window.PLAY_ZONES.zones.forEach(function (z) { if (!z.decor) { var f = window.PLAY_ZONES.cells(z.stage)[0]; z.decor = f ? f.decor : []; } });
