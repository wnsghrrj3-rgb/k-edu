/* ============================================================
 * 영어 놀이터 — 구역 데이터 (입문 층 Lv1~Lv2)
 * 월드 = Lv. Lv1 「소리 마을」(우리 집 입구 · 소리 숲 · 동물 농장 — W06) → Lv2 「마을」. 소리 숲·소리 공방 칸은 생성 파일(content/phonics*.js)을 core/decode.js 가 등록한다.
 * 문(결정 §0-2) — 칸: 앞 칸의 특별 손님을 넘으면 구경(peek), 단어 ¾ 이 꽃이면 입장(open). 무대를 건너는 칸은 gates 에 적는다.
 *                 월드: Lv1 의 마지막 칸 특별 손님 → Lv2 구경 · Lv1 칸이 모두 열림 조건을 채우면 Lv2 입장(이미 Lv2 를 시작한 아이·사다리에서 Lv1 을 마친 아이는 열림).
 * 단일 원천 = v3 펼침(handoff kedu/english/v3/lv2/02_food1.md)의 재료를 그대로 읽어 놀이로 재표현.
 * 칸 id 는 v3 ladder.js 와 같은 id(lv2-02) — 보스전 통과 = KProgress.light(id) 로 사다리와 동기.
 * 그림 = content/art/food.js 의 그린 그림(이름 = 단어) — 구역 자료에는 그림 문자를 적지 않는다(§15). 문장틀 = Lv1 #2 「I like ~」(Lv2 #2 시점에 아이가 아는 유일한 문장틀).
 * ============================================================ */
window.PLAY_ZONES = {
  world: [
    { id: 'lv1', name: '소리 마을', open: true },
    { id: 'lv2', name: '마을', open: true }
  ],
  zones: [
    {
      id: 'lv2-02', world: 'lv2', slug: 'food1', stage: 'lunch-shop', cellName: '음식', cellIcon: 'fish',
      name: '점심 가게', icon: 'shop', palette: 'shop',
      page: 'zone/food1.html',
      /* 재료 8 — 출처 v3 Lv2 #2 */
      words: [
        { w: 'fish',  ko: '물고기' },
        { w: 'chips', ko: '감자튀김' },
        { w: 'lunch', ko: '점심' },
        { w: 'shop',  ko: '가게' },
        { w: 'dish',  ko: '접시' },
        { w: 'chop',  ko: '썰다' },
        { w: 'ham',   ko: '햄' },
        { w: 'jam',   ko: '잼' }
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
      boss: { name: 'Sam',
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
        { id: 'plant', icon: 'plant', name: '화분' }, { id: 'menu', icon: 'menu', name: '메뉴판' }, { id: 'lamp', icon: 'lamp', name: '등' },
        { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'clock', icon: 'clock', name: '시계' }, { id: 'frame', icon: 'frame', name: '그림' },
        { id: 'basket', icon: 'basket', name: '바구니' }, { id: 'bell', icon: 'bell', name: '종' }
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
      name: '점심 가게', cellName: '음식·놀이', cellIcon: 'cake', icon: 'shop', palette: 'shop',
      page: 'zone/food1.html?cell=lv2-12',
      words: [
        { w: 'cake',  ko: '케이크' },
        { w: 'grape', ko: '포도' },
        { w: 'game',  ko: '게임' },
        { w: 'race',  ko: '경주' },
        { w: 'plate', ko: '접시' },
        { w: 'shake', ko: '셰이크' },
        { w: 'date',  ko: '날짜' },
        { w: 'chase', ko: '쫓아가다' }
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
      boss: { name: 'Sam',
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
    },
    /* ── Lv2 「마을」 교실 · 운동장(W07) ── */
    {
      /* 교실 ① — 재료 8 = 펼침 Lv2 #4 학교①. 해독 강제 대상 아님(book 의 oo · chair 의 ai · pencil 2음절) — 통단어 그림 카드로만, 소리 놀이 재료로 쓰지 않는다 */
      id: 'lv2-04', world: 'lv2', slug: 'school1', stage: 'classroom', kind: 'things',
      name: '교실', cellName: '학교', cellIcon: 'desk', icon: 'school', palette: 'school',
      page: 'zone/classroom.html?cell=lv2-04',
      words: [
        { w: 'desk',   ko: '책상' }, { w: 'chair',  ko: '의자' }, { w: 'bag',    ko: '가방' }, { w: 'book',   ko: '책' },
        { w: 'pen',    ko: '펜' },   { w: 'bench',  ko: '긴 의자' }, { w: 'clock',  ko: '시계' }, { w: 'pencil', ko: '연필' }
      ],
      /* 펼침 04_B 혼동 예상쌍 */
      confuse: [['pen', 'pencil'], ['desk', 'bench'], ['bag', 'book']],
      /* 문장틀 — Lv1 #17 「I see a ~.」 */
      sentence: function (w) { return 'I see a ' + w + '.'; },
      boss: { name: 'Amy',
        turns: [
          { ask: 'Pen or pencil?', ko: '펜? 연필?', pick: ['pen', 'pencil'] },
          { ask: 'Desk or chair?', ko: '책상? 의자?', pick: ['desk', 'chair'] },
          { ask: 'What do you see?', ko: '뭐가 보여?', pick: ['bag', 'book', 'clock', 'bench'] }
        ] },
      /* 친구와 대화(#21) — 「I like ~ / I am ~ / I see ~」(Lv1 #2·#10·#17) */
      talk: [
        { show: ['book', 'pen'], line: { en: 'I see a book. I see a pen.', ko: '미나 사물함에 책이랑 펜이 있어.' }, pick: ['I like a book.', 'I like a pen.'],
          then: { 'I like a book.': { face: 'ok', art: 'book', ko: '미나가 책을 빌려줬어!' }, 'I like a pen.': { face: 'ok', art: 'pen', ko: '미나가 펜을 빌려줬어!' } } },
        { show: ['desk'], line: { en: 'I am here!', ko: '(벤이 책상 밑에서) 나 여기 있어!' }, pick: ['I see you.', 'I am here.'],
          then: { 'I see you.': { face: 'cheer', art: 'see', ko: '찾았다! 벤이 웃어.' }, 'I am here.': { face: 'ok', art: 'I', ko: '둘 다 여기 있네!' } } }
      ],
      /* 사물함 챙기기(주문 받기) · 마법 주문(#19 — 이름을 부르면 Mina 가 가져온다) · 친구와 대화 · 배달 벨트 · 톡톡 듣기 · 받기 */
      games: ['order-shop', 'magic-call', 'talk', 'belt', 'pop', 'catch'],
      /* 교실에서 주문 받기 = 사물함 챙기기(가게 말 「This is my shop!」 대신) */
      intro: { 'order-shop': { en: 'My bag!', ko: '친구들이 사물함에서 챙길 것을 말해 줘 — 그림을 보고 말로 챙겨 줘!' } },
      host: 'mina',
      decor: [
        { id: 'clock', icon: 'clock', name: '시계' }, { id: 'plant', icon: 'plant', name: '화분' }, { id: 'frame', icon: 'frame', name: '그림' },
        { id: 'book', icon: 'book', name: '책꽂이' }, { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'flag', icon: 'flag', name: '깃발' }
      ],
      space: { kind: 'locker', label: '내 사물함' },
      part: { id: 'backpack', name: '책가방', when: 'firstFruit' }
    },
    {
      /* 교실 ② — 재료 8 = 펼침 Lv2 #22 학교②·읽기(8/8 해독 — ee·ea). 직접 읽어 보고 나서 뜻(22_1) */
      id: 'lv2-22', world: 'lv2', slug: 'school2', stage: 'classroom', kind: 'read', decorKey: 'lv2-04',
      name: '교실', cellName: '읽기', cellIcon: 'read', icon: 'school', palette: 'school',
      page: 'zone/classroom.html?cell=lv2-22',
      words: [
        { w: 'read',  ko: '읽다' }, { w: 'see',   ko: '보다' }, { w: 'green', ko: '초록' }, { w: 'tree',  ko: '나무' },
        { w: 'teach', ko: '가르치다' }, { w: 'speak', ko: '말하다' }, { w: 'clean', ko: '청소하다' }, { w: 'week',  ko: '한 주' }
      ],
      confuse: [['read', 'teach'], ['see', 'speak'], ['green', 'clean']],
      /* 읽어 주기(먼저 읽고 뜻) · 배달 벨트 · 톡톡 듣기 · 도둑 너구리 · 받기. 특별 손님 = 처음 보는 차례로 단어 카드 읽기 */
      games: ['read-aloud', 'belt', 'pop', 'raccoon', 'catch'],
      host: 'mina',
      decor: null,
      space: { kind: 'locker', label: '내 사물함' },
      part: { id: 'backpack', name: '책가방', when: 'firstFruit' }
    },
    {
      /* 운동장 ① — 재료 8 = 펼침 Lv2 #7 동작①(블렌드 동사). jump 는 -mp(#8 예열 — 통단어로 먼저). 문장틀 = 「I ___.」(펼침 32_3 · #17 I swim. 선례) */
      id: 'lv2-07', world: 'lv2', slug: 'action1', stage: 'playground', kind: 'action',
      name: '운동장', cellName: '동작', cellIcon: 'jump', icon: 'body', palette: 'field',
      page: 'zone/playground.html?cell=lv2-07',
      words: [
        { w: 'stop', ko: '멈추다' }, { w: 'swim', ko: '헤엄치다' }, { w: 'clap', ko: '손뼉 치다' }, { w: 'drop', ko: '떨어뜨리다' },
        { w: 'grab', ko: '붙잡다' }, { w: 'spin', ko: '빙글 돌다' }, { w: 'snap', ko: '딱 튕기다' }, { w: 'jump', ko: '뛰다' }
      ],
      confuse: [['drop', 'stop'], ['spin', 'swim'], ['clap', 'snap']],
      sentence: function (w) { return 'I ' + w + '.'; },
      boss: { name: 'Amy',
        turns: [
          { ask: 'Swim or stop?', ko: '헤엄칠까? 멈출까?', pick: ['swim', 'stop'] },
          { ask: 'Clap or snap?', ko: '손뼉? 딱?', pick: ['clap', 'snap'] },
          { ask: 'Jump or spin?', ko: '점프? 빙글?', pick: ['jump', 'spin'] }
        ] },
      /* 챈트 — 재료 8 전부, 한 줄 3박. 펼침 밖 단어 0 */
      chant: [['stop', 'swim', 'clap'], ['drop', 'grab', 'spin'], ['snap', 'jump', 'stop'], ['clap', 'spin', 'jump']],
      /* 마법 주문(#19 — 동작 이름을 부르면 Ben 이 한다) · 동물 댄스(#10 — 카메라) · 받기 · 챈트 · 도둑 너구리 · 톡톡 듣기 */
      games: ['magic-call', 'dance', 'catch', 'chant', 'raccoon', 'pop'],
      host: 'ben',
      decor: [
        { id: 'flag', icon: 'flag', name: '깃발' }, { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'sun', icon: 'sun-cloud', name: '해' },
        { id: 'bell', icon: 'bell', name: '종' }, { id: 'tree', icon: 'tree', name: '나무' }, { id: 'clap', icon: 'clap', name: '응원' }
      ],
      space: { kind: 'moves', label: '춤 동작 모음' },
      part: { id: 'sneakers', name: '운동화', when: 'firstFruit' }
    },
    {
      /* 운동장 ② — 재료 8 = 펼침 Lv2 #32 동작②(해독 7 + 통단어 sing). sleep 은 sl 미도입이라 sweep(펼침 판정) */
      id: 'lv2-32', world: 'lv2', slug: 'action2', stage: 'playground', kind: 'action', decorKey: 'lv2-07',
      name: '운동장', cellName: '동작②', cellIcon: 'wave', icon: 'body', palette: 'field',
      page: 'zone/playground.html?cell=lv2-32',
      words: [
        { w: 'ride',  ko: '타다' }, { w: 'wave',  ko: '손 흔들다' }, { w: 'stand', ko: '서다' }, { w: 'sweep', ko: '쓸다' },
        { w: 'sing',  ko: '노래하다' }, { w: 'wake', ko: '깨다' }, { w: 'smile', ko: '웃다' }, { w: 'jump', ko: '뛰다' }
      ],
      confuse: [['wave', 'wake'], ['ride', 'smile'], ['stand', 'sweep']],
      sentence: function (w) { return 'I ' + w + '.'; },
      boss: { name: 'Amy',
        turns: [
          { ask: 'Wave or smile?', ko: '손 흔들까? 웃을까?', pick: ['wave', 'smile'] },
          { ask: 'Ride or sing?', ko: '탈까? 노래할까?', pick: ['ride', 'sing'] },
          { ask: 'Jump or stand?', ko: '뛸까? 설까?', pick: ['jump', 'stand'] }
        ] },
      chant: [['ride', 'wave', 'stand'], ['sweep', 'sing', 'wake'], ['smile', 'jump', 'wave'], ['ride', 'sing', 'smile']],
      games: ['magic-call', 'dance', 'catch', 'chant', 'raccoon', 'pop'],
      host: 'ben',
      decor: null,
      space: { kind: 'moves', label: '춤 동작 모음' },
      part: { id: 'sneakers', name: '운동화', when: 'firstFruit' }
    },
    /* ── Lv1 「소리 마을」 ── */
    {
      /* 우리 집 입구 ① — 사다리 첫 칸. 재료 = 펼침 Lv1 #1 사이트워드 7(통째로 보는 단어 — 쪼개 읽지 않는다). 아이가 처음 오면 여기서 시작 */
      id: 'lv1-01', world: 'lv1', slug: 'words1', stage: 'lv1-gate', kind: 'sight',
      name: '우리 집', cellName: '첫 단어', cellIcon: 'I', icon: 'home', palette: 'home',
      page: 'zone/home.html?cell=lv1-01',
      words: [
        { w: 'I',    ko: '나',     sight: true },
        { w: 'you',  ko: '너',     sight: true },
        { w: 'like', ko: '좋아해', sight: true },
        { w: 'see',  ko: '보여',   sight: true },
        { w: 'it',   ko: '그것',   sight: true },
        { w: 'a',    ko: '하나',   sight: true },
        { w: 'the',  ko: '그',     sight: true }
      ],
      /* 펼침 1-B 「헷갈리는 쌍 나란히 대조: I/it, a/the」 */
      confuse: [['I', 'it'], ['a', 'the']],
      /* 손님 주문 받기(그림판) + 톡톡 듣기. 특별 손님 = 단어 카드 읽기(통째로) */
      games: ['order-shop', 'pop'],
      decor: [
        { id: 'plant', icon: 'plant', name: '화분' }, { id: 'lamp', icon: 'lamp', name: '등' }, { id: 'frame', icon: 'frame', name: '그림' },
        { id: 'clock', icon: 'clock', name: '시계' }, { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'book', icon: 'book', name: '책' }
      ],
      space: { kind: 'room', label: '내 방' }
    },
    {
      /* 우리 집 입구 ② — 펼침 Lv1 #2 「I like it. / I like you.」 + 2-3 의 「I like a cat. / I like a dog.」. 씨앗 = 문장 통째로.
         친구와 대화(#21): 친구가 무언가를 보여 주며 한마디 → 아이가 두 문장 중 하나로 답하면 대화가 그쪽으로 갈라진다 */
      id: 'lv1-02', world: 'lv1', slug: 'like', stage: 'lv1-gate', kind: 'talk', decorKey: 'lv1-01',
      name: '우리 집', cellName: 'I like', cellIcon: 'like', icon: 'home', palette: 'home',
      page: 'zone/home.html?cell=lv1-02',
      words: [
        { w: 'I like it.',    ko: '그거 좋아.',     art: 'it' },
        { w: 'I like you.',   ko: '네가 좋아.',     art: 'you' },
        { w: 'I like a cat.', ko: '고양이가 좋아.', art: 'cat' },
        { w: 'I like a dog.', ko: '강아지가 좋아.', art: 'dog' }
      ],
      confuse: [],
      frame: ['I', 'like'],
      /* 대화 장면 — line = 친구의 한마디(Lv1 #1·#2 낱말만), pick = 아이가 고를 두 문장, then = 고른 문장에 따라 갈라지는 반응 */
      talk: [
        { show: ['gift'], line: { en: 'I like you!', ko: '나는 네가 좋아! (선물도 가져왔어)' }, pick: ['I like you.', 'I like it.'],
          then: { 'I like you.': { face: 'cheer', art: 'like', ko: '둘이 마주 보고 웃었어!' }, 'I like it.': { face: 'ok', art: 'gift', ko: '선물을 받았어!' } } },
        { show: ['cat', 'dog'], line: { en: 'I see a cat. I see a dog.', ko: '고양이랑 강아지가 놀러 왔어.' }, pick: ['I like a cat.', 'I like a dog.'],
          then: { 'I like a cat.': { face: 'ok', art: 'cat', ko: '고양이가 너한테 왔어!' }, 'I like a dog.': { face: 'ok', art: 'dog', ko: '강아지가 너한테 왔어!' } } }
      ],
      games: ['talk', 'pop'],
      decor: null,
      space: { kind: 'room', label: '내 방' }
    },
    {
      /* 동물 농장 ① — 펼침 Lv1 #5 동물 5(cat·dog·pig 는 읽을 수 있는 단어, fish·bird 는 통째로). 문장틀 = Lv1 #2 「I like a ~.」 */
      id: 'lv1-05', world: 'lv1', slug: 'animals', stage: 'animal-farm', kind: 'vocab',
      name: '동물 농장', cellName: '동물', cellIcon: 'cat', icon: 'barn', palette: 'farm',
      page: 'zone/farm.html?cell=lv1-05',
      words: [
        { w: 'cat',  ko: '고양이' },
        { w: 'dog',  ko: '강아지' },
        { w: 'pig',  ko: '돼지' },
        { w: 'fish', ko: '물고기' },
        { w: 'bird', ko: '새' }
      ],
      confuse: [],
      sentence: function (w) { return 'I like a ' + w + '.'; },
      /* 특별 손님 Amy — 한마디는 Lv1 #1·#2 낱말만(see·like·you). 「or」 같은 안 배운 낱말 0 */
      boss: { name: 'Amy',
        turns: [
          { ask: 'I see a cat. I see a dog.', ko: '고양이랑 강아지가 보여 — 너는 뭐가 좋아?', pick: ['cat', 'dog'] },
          { ask: 'I see a pig. I see a bird.', ko: '돼지랑 새가 보여 — 너는?', pick: ['pig', 'bird'] },
          { ask: 'I like a fish. You?', ko: '나는 물고기가 좋아. 너는?', pick: ['cat', 'dog', 'pig', 'fish', 'bird'] }
        ] },
      /* 손님 주문 받기(동물판) · 도둑 너구리 · 톡톡 듣기 · 받기 · 몸으로 고르기 */
      games: ['order-shop', 'raccoon', 'pop', 'catch', 'lean'],
      decor: [
        { id: 'basket', icon: 'basket', name: '건초 바구니' }, { id: 'flag', icon: 'flag', name: '깃발' }, { id: 'flower', icon: 'flower', name: '꽃' },
        { id: 'bell', icon: 'bell', name: '종' }, { id: 'nest', icon: 'nest', name: '새 둥지' }, { id: 'lamp', icon: 'lamp', name: '등' }
      ],
      space: { kind: 'pet', label: '따라다니는 동물' },
      part: { id: 'bandana', name: '목수건', when: 'firstFruit' }
    },
    {
      /* 동물 농장 ② — 펼침 Lv1 #8 단어와 그림 연결: 블렌딩으로 읽은 CVC(#4·#6·#7)에 뜻(그림)을 붙인다. 먼저 읽고, 그다음 그림 */
      id: 'lv1-08', world: 'lv1', slug: 'wordpic', stage: 'animal-farm', kind: 'read', decorKey: 'lv1-05',
      name: '동물 농장', cellName: '단어와 그림', cellIcon: 'book', icon: 'barn', palette: 'farm',
      page: 'zone/farm.html?cell=lv1-08',
      words: [
        { w: 'cat', ko: '고양이' }, { w: 'mat', ko: '깔개' }, { w: 'man', ko: '아저씨' }, { w: 'pig', ko: '돼지' },
        { w: 'pin', ko: '핀' }, { w: 'dog', ko: '강아지' }, { w: 'box', ko: '상자' }, { w: 'pot', ko: '냄비' }
      ],
      confuse: [['cat', 'mat'], ['pig', 'pin'], ['box', 'pot']],
      /* 그림책 넘기기(읽으면 그림이 움직인다) · 배달 벨트 · 접시 채우기 · 톡톡 듣기 · 도둑 너구리 · 받기. 특별 손님 = 처음 보는 차례로 단어 카드 읽기 */
      games: ['picture-book', 'belt', 'plates', 'pop', 'raccoon', 'catch'],
      decor: null,
      space: { kind: 'pet', label: '따라다니는 동물' },
      part: { id: 'bandana', name: '목수건', when: 'firstFruit' }
    }
  ],
  /* 다음 무대 — after 구역의 특별 손님을 넘으면 안개가 걷혀 구경할 수 있고(결정 §0-2), 그 구역 단어 ¾ 이 꽃이면 들어갈 수 있다.
     page 가 없으면 아직 짓는 중 */
  peek: [],      /* W07 — 교실이 지어져 「구경」은 무대의 문(gates)이 맡는다 */
  /* 무대 — 여러 칸이 한 무대를 쓴다(홈 지도는 무대마다 한 칸) */
  stages: {
    'lunch-shop':  { id: 'lunch-shop',  name: '점심 가게', icon: 'shop', page: 'zone/food1.html', world: 'lv2' },
    'classroom':   { id: 'classroom',   name: '교실',     icon: 'school', page: 'zone/classroom.html', world: 'lv2' },
    'playground':  { id: 'playground',  name: '운동장',   icon: 'body', page: 'zone/playground.html', world: 'lv2' },
    'lv1-gate':    { id: 'lv1-gate',    name: '우리 집',   icon: 'home', page: 'zone/home.html',  world: 'lv1' },
    'animal-farm': { id: 'animal-farm', name: '동물 농장', icon: 'barn', page: 'zone/farm.html',  world: 'lv1' }
  },
  /* 무대를 건너는 문 — 이 칸은 적힌 칸이 열림 조건을 채워야 들어갈 수 있다(특별 손님만 넘었으면 구경). 사다리 차례 그대로 */
  gates: { 'lv1-03': 'lv1-02', 'lv1-05': 'lv1-04', 'lv1-08': 'lv1-07',
    /* Lv2(W07) — 교실은 점심 가게 첫 칸 뒤(예전 「교실 구경」 그대로) · 읽기 칸은 ee·ea 칸 뒤 · 운동장은 블렌드 l·r 칸 뒤(동작 동사를 읽을 수 있게) ·
       동작② 는 모음짝 칸 뒤(i_e·a_e·ee·-nd — 사다리 #31 자연 칸은 W09 에서 지으면 그 칸으로 옮긴다) */
    'lv2-04': 'lv2-02', 'lv2-22': 'lv2-21', 'lv2-07': 'lv2-06', 'lv2-32': 'lv2-23' },
  /* 앞으로 지을 Lv1 무대(W10) — 지도에는 안개로만 */
  later: { lv1: [{ id: 'picture-books', name: '그림책방', icon: 'book' }, { id: 'festival', name: '마을 축제', icon: 'party' }] },
  cells: function (stage) { return this.zones.filter(function (z) { return z.stage === stage; }); },
  /* 그 무대에서 지금 놀 수 있는 마지막 칸의 차례 — 첫 칸 + 앞 칸이 열림 조건(특별 손님 + 단어 ¾ 이 꽃)을 채운 만큼(결정 §0-2) */
  openIndex: function (stage, seed) {
    var zs = this.cells(stage), k = 0;
    for (var i = 0; i < zs.length - 1; i++) { if (this.ready(zs[i].id, seed) && this.door(zs[i + 1].id, seed) === 'open') k = i + 1; else break; }
    return k;
  },
  /* 그 칸이 열림 조건(특별 손님 + 단어 ¾ 꽃)을 채웠나 */
  ready: function (id, seed) { var z = this.zone(id); return !!z && !!seed && seed.canClear(z.id, (z.words || []).map(function (x) { return x.w; })); },
  /* 칸의 문 — 'open' | 'peek'(앞 칸 특별 손님만 넘음 — 구경, 내일 또 와) | 'fog' */
  door: function (id, seed) {
    var a = this.gates[id]; if (!a) return 'open';
    if (this.ready(a, seed)) return 'open';
    return seed && seed.bossDone(a) ? 'peek' : 'fog';
  },
  /* 무대의 문 = 그 무대 첫 칸의 문 */
  stageDoor: function (stage, seed) { var f = this.cells(stage)[0]; return f ? this.door(f.id, seed) : 'fog'; },
  /* 지금 놀 수 있는 칸인가 — 무대 문이 열려 있고, 그 무대에서 열린 칸까지 */
  reachable: function (id, seed) { var z = this.zone(id); if (!z) return false; var zs = this.cells(z.stage); return this.stageDoor(z.stage, seed) === 'open' && zs.indexOf(z) <= this.openIndex(z.stage, seed); },
  /* 월드의 칸들 — 사다리 차례(번호 차례) */
  worldCells: function (world) {
    var n = function (z) { var m = /^lv\d+-(\d+)$/.exec(z.id); return m ? +m[1] : 0; };
    return this.zones.filter(function (z) { return z.world === world; }).sort(function (a, b) { return n(a) - n(b); });
  },
  /* 다음에 놀 칸 — 그 월드에서 사다리 차례로 아직 열림 조건을 못 채운 첫 칸 중 지금 들어갈 수 있는 것(없으면 null) */
  nextCell: function (world, seed) {
    var self = this, cs = this.worldCells(world);
    for (var i = 0; i < cs.length; i++) if (!self.ready(cs[i].id, seed) && self.reachable(cs[i].id, seed)) return cs[i];
    return null;
  },
  /* 이미 Lv2 를 시작했나 — Lv2 칸에 심은 씨앗·넘은 특별 손님, 또는 사다리에서 Lv1 마무리 칸을 밝힘 */
  started: function (world, seed) {
    var ids = {}; this.zones.forEach(function (z) { if (z.world === world) ids[z.id] = 1; });
    var s = seed ? seed.all() : {};
    if (Object.keys(s).some(function (w) { return ids[s[w].zone]; })) return true;
    if (seed && Object.keys(ids).some(function (id) { return seed.bossDone(id); })) return true;
    var K = window.KProgress; if (world === 'lv2' && K && K.state) { try { if (/^lit/.test(K.state('lv1-18') || '')) return true; } catch (e) {} }
    return false;
  },
  /* 월드의 문 — Lv1 은 늘 열림. Lv2 는 위 「started」 이거나 Lv1 칸이 모두 열림 조건을 채우면 열림 · Lv1 마지막 칸의 특별 손님만 넘었으면 구경 */
  worldDoor: function (world, seed) {
    if (world !== 'lv2') return 'open';
    var self = this, l1 = this.worldCells('lv1');
    if (!l1.length || this.started('lv2', seed) || l1.every(function (z) { return self.ready(z.id, seed); })) return 'open';
    return seed && seed.bossDone(l1[l1.length - 1].id) ? 'peek' : 'fog';
  },
  zone: function (id) { for (var i = 0; i < this.zones.length; i++) if (this.zones[i].id === id) return this.zones[i]; return null; }
};
/* 같은 무대의 칸들은 장식 목록을 함께 쓴다(둘째 칸의 decor 는 첫 칸 것) */
window.PLAY_ZONES.zones.forEach(function (z) { if (!z.decor) { var f = window.PLAY_ZONES.cells(z.stage)[0]; z.decor = f ? f.decor : []; } });
/* 그림 — 단어마다 그린 그림(content/art/*.js)을 단다. 그림이 없거나 그림 파일을 싣지 않은 곳에선 글자 카드 */
window.PLAY_ZONES.zones.forEach(function (z) { (z.words || []).forEach(function (x) { x.pic = window.PlayArt ? window.PlayArt.pic(x.art || x.w) : '<span class="art-word">' + x.w + '</span>'; }); });     /* art = 단어와 다른 이름의 그림(문장 칸 — 「I like it.」 → it) */
