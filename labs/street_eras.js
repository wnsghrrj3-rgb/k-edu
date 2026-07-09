/* 케이랩 사회실 · 시간 거리 데이터 (T4)
   같은 거리가 시대를 갈아입는다 — 3학년 교통·통신·생활 도구의 변화.
   STREET_ERAS[id] = 시대 레이어 스펙(색·집·탈것 프리셋 키 — 실제 드로잉은 timestreet.html 렌더러).
   OLD_THINGS[id]  = 거리에 놓인 옛 물건(3지선다 · 도감 · 정답 시 그 시대 자리로).
   문화재·생활도구 명칭/용법은 교과서 준거만 — 창작 서사 금지(정직 원칙). */
(function (root) {

  // 시대 5기(과거→오늘). order = 슬라이더 왼→오. sky=[위,아래] 하늘빛, ground=길색.
  // house/vehicle = 렌더러가 아는 프리셋 키(timestreet.html DRAW.house/DRAW.vehicle에 대응).
  root.STREET_ERAS = {
    joseon:  { id: 'joseon',  order: 0, name: '조선 후기', year: '약 1800년대',
               sky: ['#bcd3de', '#efe4c8'], ground: '#c9b48c',
               house: 'thatch',  vehicle: 'oxcart',
               desc: '초가집이 늘어서고 소달구지가 흙길을 지나던 때예요.' },
    gaehwa:  { id: 'gaehwa',  order: 1, name: '개화기', year: '1900년대 초',
               sky: ['#c6d2da', '#e2d6bc'], ground: '#c2b39a',
               house: 'tile',    vehicle: 'tram',
               desc: '기와집 사이에 서양식 건물이 서고 전차가 다니기 시작했어요.' },
    e1970:   { id: 'e1970',   order: 2, name: '1970년대', year: '',
               sky: ['#cdd6da', '#d9cfbd'], ground: '#9aa0a4',
               house: 'villa',   vehicle: 'bus',
               desc: '이층 양옥집이 들어서고 버스가 사람들을 실어 날랐어요.' },
    e1990:   { id: 'e1990',   order: 3, name: '1990년대', year: '',
               sky: ['#bccfe0', '#d5dcdf'], ground: '#8b9298',
               house: 'apart',   vehicle: 'car',
               desc: '아파트가 높이 올라가고 골목마다 자동차가 늘었어요.' },
    today:   { id: 'today',   order: 4, name: '오늘날', year: '',
               sky: ['#a8d1f0', '#e6f1fa'], ground: '#7f868c',
               house: 'tower',   vehicle: 'ev',
               desc: '높은 빌딩과 전기차, 손안의 스마트폰이 있는 지금이에요.' }
  };

  // 옛 물건 — era = 놓이는 시대(STREET_ERAS 키). q/options/answer = 3지선다("뭐에 쓰던 물건?").
  // use = 쓰임, now = 오늘날 무엇으로 바뀌었나(정답 뒤 안내). x = 거리 위 가로 위치(0~1).
  root.OLD_THINGS = {
    dadeumi:  { id: 'dadeumi',  name: '다듬잇돌', era: 'joseon', x: 0.22, glyph: 'block',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['밥을 짓는 그릇', '빨래를 두드려 구김 펴기', '글씨 쓰는 판'], answer: 1,
      use: '방망이로 빨래를 두드려 구김을 펴던 돌이에요.', now: '오늘날엔 다리미로 다려요.' },
    matdol:   { id: 'matdol',   name: '맷돌', era: 'joseon', x: 0.52, glyph: 'disc',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['곡식을 갈아 가루 만들기', '빨래하기', '불 피우기'], answer: 0,
      use: '위아래 돌을 돌려 콩·곡식을 갈던 도구예요.', now: '오늘날엔 믹서기로 갈아요.' },
    jige:     { id: 'jige',     name: '지게', era: 'joseon', x: 0.78, glyph: 'frame',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['무거운 짐 나르기', '낚시하기', '악기 연주'], answer: 0,
      use: '등에 지고 나무·곡식 같은 무거운 짐을 나르던 도구예요.', now: '오늘날엔 수레·트럭으로 옮겨요.' },
    yogang:   { id: 'yogang',   name: '요강', era: 'gaehwa', x: 0.30, glyph: 'pot',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['세수하는 대야', '밤에 방에서 쓰던 변기', '국 담는 그릇'], answer: 1,
      use: '화장실이 멀던 밤에 방 안에서 쓰던 그릇이에요.', now: '오늘날엔 수세식 화장실이 있어요.' },
    radio:    { id: 'radio',    name: '라디오', era: 'gaehwa', x: 0.66, glyph: 'radio',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['소리로 소식·노래 듣기', '사진 찍기', '시간 재기'], answer: 0,
      use: '방송 소리로 소식과 노래를 듣던 기계예요.', now: '오늘날엔 스마트폰으로도 들어요.' },
    bwtv:     { id: 'bwtv',     name: '흑백텔레비전', era: 'e1970', x: 0.28, glyph: 'tv',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['빨래 삶기', '흑백 화면으로 방송 보기', '밥 짓기'], answer: 1,
      use: '색 없이 검고 흰 화면으로 방송을 보던 텔레비전이에요.', now: '오늘날엔 컬러·스마트 TV로 봐요.' },
    dialtel:  { id: 'dialtel',  name: '다이얼 전화기', era: 'e1970', x: 0.70, glyph: 'phone',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['게임하기', '구멍을 돌려 전화 걸기', '계산하기'], answer: 1,
      use: '숫자 구멍에 손가락을 넣어 돌려 전화를 걸던 기계예요.', now: '오늘날엔 스마트폰으로 걸어요.' },
    ppippi:   { id: 'ppippi',   name: '삐삐(무선호출기)', era: 'e1990', x: 0.34, glyph: 'pager',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['음악 연주', '연락 오면 번호 받기', '사진 찍기'], answer: 1,
      use: '연락이 오면 번호가 떠서 공중전화로 되걸던 작은 기계예요.', now: '오늘날엔 스마트폰으로 바로 통화해요.' },
    payphone: { id: 'payphone', name: '공중전화', era: 'e1990', x: 0.72, glyph: 'booth',
      q: '이건 무엇에 쓰던 물건일까요?',
      options: ['동전 넣고 전화 걸기', '음료수 뽑기', '우표 사기'], answer: 0,
      use: '길에서 동전이나 카드를 넣고 전화를 걸던 기계예요.', now: '오늘날엔 저마다 스마트폰이 있어요.' }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STREET_ERAS: root.STREET_ERAS, OLD_THINGS: root.OLD_THINGS };
  }
})(typeof window !== 'undefined' ? window : this);
