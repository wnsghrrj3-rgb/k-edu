/* ============================================================
   케이메이커 생성기 골격 데이터 (skeletons.js)
   ------------------------------------------------------------
   M1 템플릿 생성기의 데이터 층. 코드(generator.js)와 분리 —
   오퍼스 양산 지점(종류당 골격 5까지·페어링 30쌍까지 데이터만 추가).
   ⚠ 수치·공식은 generator.js가 가지며 여기서 바꾸지 않는다.

   골격 스키마: zones:[{ z, rect:[x,y,w,h] 0~1 비율,
                         text?, slot?(문자열|false), font?(역할), material?, anim? }]
   font 역할: title | name | body | date  (generator가 페어링으로 실폰트 배정)
   ============================================================ */

/* 종류별 무드 태그 (폰트 페어링 교집합용) */
window.KM_KIND_MOOD = {
  award:     ['상장', '공식'],
  card:      ['카드', '감성'],
  worksheet: ['학습지', '공식'],
  nametag:   ['이름표', '아이'],
  notice:    ['안내장', '공식'],
  poster:    ['포스터', '파티'],
};

window.KM_SKELETONS = {
  /* ── 상장 (골든 3) ── */
  award: [
    { id:'award_classic', zones:[
      { z:'frame',  rect:[0.04,0.04,0.92,0.92], material:'금박테두리' },
      { z:'emblem', rect:[0.40,0.07,0.20,0.14], material:'엠블럼' },
      { z:'title',  rect:[0.20,0.24,0.60,0.11], text:'표창장', slot:false, font:'title' },
      { z:'name',   rect:[0.25,0.42,0.50,0.08], text:'홍길동', slot:'이름', font:'name' },
      { z:'body',   rect:[0.15,0.54,0.70,0.20], text:'위 학생은 배움에 늘 성실하고\n친구를 아끼는 마음이 뛰어나\n이 상장을 주어 칭찬합니다.', slot:'내용', font:'body' },
      { z:'date',   rect:[0.30,0.79,0.40,0.05], text:'2026년 7월 9일', slot:'날짜', font:'date' },
      { z:'stamp',  rect:[0.66,0.83,0.12,0.12], material:'도장' } ] },
    { id:'award_ribbon', zones:[
      { z:'emblem', rect:[0.42,0.06,0.16,0.13], material:'엠블럼' },
      { z:'title',  rect:[0.18,0.22,0.64,0.10], text:'우수상', slot:false, font:'title' },
      { z:'name',   rect:[0.22,0.38,0.56,0.09], text:'김하늘', slot:'이름', font:'name' },
      { z:'body',   rect:[0.14,0.52,0.72,0.22], text:'위 학생은 한 해 동안 맡은 일을\n끝까지 해내는 모습을 보여\n그 노력을 기려 상을 줍니다.', slot:'내용', font:'body' },
      { z:'date',   rect:[0.28,0.80,0.44,0.05], text:'2026년 7월 9일', slot:'날짜', font:'date' },
      { z:'stamp',  rect:[0.64,0.82,0.13,0.13], material:'도장' } ] },
    { id:'award_modern', zones:[
      { z:'title',  rect:[0.12,0.14,0.76,0.12], text:'칭찬장', slot:false, font:'title' },
      { z:'name',   rect:[0.18,0.34,0.64,0.10], text:'이서준', slot:'이름', font:'name' },
      { z:'body',   rect:[0.13,0.50,0.74,0.22], text:'위 어린이는 우리 반의 자랑입니다.\n밝은 웃음과 따뜻한 마음을\n오래 기억하겠습니다.', slot:'내용', font:'body' },
      { z:'emblem', rect:[0.44,0.74,0.12,0.10], material:'엠블럼' },
      { z:'date',   rect:[0.30,0.86,0.40,0.05], text:'2026년 7월 9일', slot:'날짜', font:'date' } ] },
  ],

  /* ── 카드 (골든 3) ── */
  card: [
    { id:'card_center', zones:[
      { z:'bg',     rect:[0,0,1,1], material:'배경' },
      { z:'title',  rect:[0.12,0.28,0.76,0.14], text:'고마워요', slot:'제목', font:'title' },
      { z:'body',   rect:[0.16,0.48,0.68,0.16], text:'늘 곁에 있어 줘서\n정말 고맙습니다.', slot:'내용', font:'body' },
      { z:'date',   rect:[0.30,0.74,0.40,0.05], text:'from. 준호', slot:'보내는이', font:'date' } ] },
    { id:'card_topline', zones:[
      { z:'bg',     rect:[0,0,1,1], material:'배경' },
      { z:'title',  rect:[0.14,0.16,0.72,0.13], text:'생일 축하해', slot:'제목', font:'title' },
      { z:'body',   rect:[0.16,0.40,0.68,0.28], text:'너의 하루가\n웃음으로 가득하길\n마음 담아 바랄게.', slot:'내용', font:'body' },
      { z:'date',   rect:[0.28,0.80,0.44,0.05], text:'2026. 7. 9.', slot:'날짜', font:'date' } ] },
    { id:'card_quote', zones:[
      { z:'bg',     rect:[0,0,1,1], material:'배경' },
      { z:'title',  rect:[0.14,0.34,0.72,0.12], text:'응원해', slot:'제목', font:'title' },
      { z:'body',   rect:[0.18,0.52,0.64,0.14], text:'네가 걷는 그 길을\n조용히 응원할게.', slot:'내용', font:'body' } ] },
  ],

  /* ── 학습지 (1기 1, 오퍼스 확장 대상) ── */
  worksheet: [
    { id:'ws_basic', zones:[
      { z:'title',  rect:[0.08,0.05,0.66,0.07], text:'오늘의 학습지', slot:'제목', font:'title' },
      { z:'name',   rect:[0.74,0.05,0.20,0.06], text:'이름:', slot:'이름', font:'date' },
      { z:'body',   rect:[0.08,0.16,0.84,0.20], text:'1. 다음 물음에 답해 봅시다.', slot:'문제1', font:'body' },
      { z:'body2',  rect:[0.08,0.40,0.84,0.20], text:'2. 알맞은 것을 골라 봅시다.', slot:'문제2', font:'body' },
      { z:'body3',  rect:[0.08,0.64,0.84,0.24], text:'3. 오늘 배운 것을 정리해 봅시다.', slot:'문제3', font:'body' } ] },
  ],

  /* ── 이름표 (1기 1) ── */
  nametag: [
    { id:'tag_basic', zones:[
      { z:'frame',  rect:[0.03,0.06,0.94,0.88], material:'테두리' },
      { z:'title',  rect:[0.08,0.16,0.84,0.34], text:'김하은', slot:'이름', font:'title' },
      { z:'body',   rect:[0.12,0.58,0.76,0.24], text:'2학년 3반', slot:'소속', font:'body' } ] },
  ],

  /* ── 안내장 (1기 1) ── */
  notice: [
    { id:'notice_basic', zones:[
      { z:'title',  rect:[0.10,0.08,0.80,0.10], text:'가정통신문', slot:'제목', font:'title' },
      { z:'body',   rect:[0.10,0.24,0.80,0.44], text:'학부모님께 알려 드립니다.\n\n아래 내용을 확인해 주시기 바랍니다.', slot:'내용', font:'body' },
      { z:'date',   rect:[0.10,0.76,0.50,0.05], text:'2026년 7월 9일', slot:'날짜', font:'date' },
      { z:'sign',   rect:[0.50,0.84,0.44,0.06], text:'금성초등학교장', slot:'보내는이', font:'date' } ] },
  ],

  /* ── 포스터 (1기 1) ── */
  poster: [
    { id:'poster_center', zones:[
      { z:'bg',     rect:[0,0,1,1], material:'배경' },
      { z:'title',  rect:[0.10,0.14,0.80,0.18], text:'우리 반 축제', slot:'제목', font:'title' },
      { z:'body',   rect:[0.14,0.40,0.72,0.28], text:'모두 함께 즐겨요!\n7월 20일 오후 2시\n우리 교실에서', slot:'내용', font:'body' },
      { z:'date',   rect:[0.24,0.78,0.52,0.06], text:'2-3반 친구들 모두 환영', slot:'꼬리말', font:'date' } ] },
  ],
};

/* 폰트 페어링 표 (body는 본문·명조 카테고리만 — 하드 규칙) */
window.KM_FONT_PAIRS = [
  { title:'Hakgyoansim Moheomga', body:'Gowun Dodum',  mood:['상장','공식'] },
  { title:'Black Han Sans',       body:'Gowun Batang', mood:['상장','공식'] },
  { title:'Song Myung',           body:'Gowun Batang', mood:['상장','안내장'] },
  { title:'Gmarket Sans',         body:'Noto Sans KR', mood:['안내장','공식'] },
  { title:'Paperlogy',            body:'Pretendard',   mood:['안내장','학습지'] },
  { title:'Do Hyeon',             body:'IBM Plex Sans KR', mood:['학습지','공식'] },
  { title:'Hakgyoansim Kkokkoma', body:'Gowun Dodum',  mood:['학습지','아이'] },
  { title:'Jua',                  body:'Gowun Dodum',  mood:['이름표','아이'] },
  { title:'Bagel Fat One',        body:'Gowun Dodum',  mood:['이름표','파티'] },
  { title:'CookieRun',            body:'Pretendard',   mood:['파티','포스터'] },
  { title:'ONE Mobile POP',       body:'Noto Sans KR', mood:['파티','포스터'] },
  { title:'Cafe24 Ssurround',     body:'Gowun Dodum',  mood:['포스터','아이'] },
  { title:'Hakgyoansim Mulgyeol', body:'Gowun Batang', mood:['카드','감성'] },
  { title:'Gowun Batang',         body:'Gowun Batang', mood:['카드','감성'] },
  { title:'Hakgyoansim Monggeul', body:'Gowun Dodum',  mood:['카드','아이'] },
  { title:'Nanum Myeongjo',       body:'Nanum Myeongjo', mood:['카드','공식'] },
];

/* 본문 허용 카테고리 폰트 (하드 규칙 검증용) */
window.KM_BODY_FONTS = ['Pretendard','Noto Sans KR','IBM Plex Sans KR','Gowun Dodum',
                        'Gowun Batang','Nanum Myeongjo','Song Myung','Hahmlet','Diphylleia'];

/* 종류별 연출표 — 골격 zone에 존재하는 것만 부여 */
window.KM_GEN_MOTION = {
  award:     { emblem:{ fx:'stamp' }, stamp:{ fx:'stamp' }, title:{ fx:'charpop' }, _global:'goldburst' },
  card:      { title:{ in:'slideUp' }, body:{ in:'fadeIn' } },
  poster:    { motionBg:'confetti', title:{ in:'drop' } },
  nametag:   { title:{ in:'pop' } },
  worksheet: {},
  notice:    {},
};
