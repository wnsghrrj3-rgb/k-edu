/* 이 파일은 핸드오프 자료 kedu/english/world/lab_v1.js 를 그대로 옮긴 것이다(맨 끝 내보내기 줄만 ES 모듈 꼴). 손으로 고치지 않는다 —
 * 자료를 고치고 tools/sync_lab_data.py 로 다시 옮긴다. 놀이 코드는 낱말 · 부탁 · 수치를 여기서만 읽는다. */
/* 영어 놀이터 「원더랜드」 · 마법 연구소 구역 자료 v1 (2026-11-24)
 * 설계 = kedu/영어_플레이_원더랜드_연구소_설계_v1.md · 검사 = scripts/check_en_world_lab.js (위반 0 이어야 한다)
 * 이 파일이 낱말 · 부탁 · 발견 거리 · 동작 · 모형 · 자동 확인의 하나뿐인 원천이다. 코드(k-edu english/play/world/data/lab.js)는 이것을 옮겨 쓴다.
 * 수치는 처음 값이다 — 준호가 태블릿에서 만져 보고 바꾼다. 바꾸면 여기와 코드의 T 를 같이 고친다. */

// ───────── 낱말 ─────────
// role: core = 부탁까지 가는 낱말(알아듣는지 본다) · name = 만지면 나오는 이름 · hear = 들리기만 하는 말(부탁하지 않는다)
const words = {
  big:    { text: 'Big',    role: 'core', at: 'size',   cell: 'L1-3-1', cls: 'big' },
  small:  { text: 'Small',  role: 'core', at: 'size',   cell: 'L1-3-1', cls: 'small' },
  up:     { text: 'Up',     role: 'core', at: 'float',  cell: 'L1-3-3', cls: 'up' },
  down:   { text: 'Down',   role: 'core', at: 'float',  cell: 'L1-3-3', cls: 'down' },
  red:    { text: 'Red',    role: 'core', at: 'potion', cell: 'L1-3-2', cls: 'c-red' },
  blue:   { text: 'Blue',   role: 'core', at: 'potion', cell: 'L1-3-2', cls: 'c-blue' },
  yellow: { text: 'Yellow', role: 'core', at: 'potion', cell: 'L1-3-2', cls: 'c-yellow' },
  pink:   { text: 'Pink',   role: 'core', at: 'potion', cell: 'L1-3-2', cls: 'c-pink' },
  mix:    { text: 'Mix',    role: 'core', at: 'potion', cell: 'L1-3-2', cls: 'shout' },
  hot:    { text: 'Hot',    role: 'core', at: 'frost',  cell: 'L1-3-4', cls: 'hot' },
  cold:   { text: 'Cold',   role: 'core', at: 'frost',  cell: 'L1-3-4', cls: 'cold' },
  apple:  { text: 'Apple',  role: 'name' }, cup: { text: 'Cup', role: 'name' }, chair: { text: 'Chair', role: 'name' }, ball: { text: 'Ball', role: 'name' }, gogo: { text: 'Gogo', role: 'name' },
  water:  { text: 'Water',  role: 'name' }, ice: { text: 'Ice', role: 'name' },
  purple: { text: 'Purple', role: 'hear', cls: 'c-purple' }, orange: { text: 'Orange', role: 'hear', cls: 'c-orange' }, green: { text: 'Green', role: 'hear', cls: 'c-green' }, brown: { text: 'Brown', role: 'hear', cls: 'c-brown' },
  white:  { text: 'White',  role: 'hear', cls: 'c-white' },
  pop:    { text: 'Pop',    role: 'hear' }, splash: { text: 'Splash', role: 'hear' }, please: { text: 'please', role: 'hear' }, thanks: { text: 'Thank you', role: 'hear' },
};

// ───────── 물건(네 자리가 같이 쓴다) ─────────
// 물건 하나가 지니는 상태 넷. 자리를 옮겨도 그대로 따라간다(이 화면 동안만 — 저장하지 않는다).
const thingState = {
  size:  { range: [0.45, 1.8], rest: 1, words: { big: '>= 1.35', small: '<= 0.7' } },
  lift:  { values: ['bench', 'bubble'], words: { up: 'bench → bubble', down: 'bubble → bench' } },
  color: { values: ['own', 'red', 'blue', 'yellow', 'pink', 'purple', 'orange', 'green', 'brown', 'white'] },
  temp:  { range: [-1, 1], rest: 0, words: { cold: '<= -0.6', hot: '>= 0.6' }, rearm: 0.35, back: 0.04 },
};
const things = ['apple', 'cup', 'chair', 'ball', 'gogo'];

// ───────── 부탁(공통) ─────────
const ask = {
  firstAfter: 30,        // 그 자리에서 이만큼(초) 놀고, 아이가 한 일이 minActs 번을 넘은 뒤에야 처음 부탁한다
  minActs: 4,
  idle: 6,               // 손을 이만큼(초) 쉬었을 때만
  every: 40,             // 부탁 사이(초) — 이보다 잦게 하지 않는다
  heardAtLeast: 2,       // 그 낱말을 이 화면에서(또는 지난 기록에서) 이만큼 겪은 뒤에만 그 낱말로 부탁한다
  crossEvery: 3,         // 세 번에 한 번은 다른 자리에서 배운 낱말을 섞는다(다른 상황 적용)
  // 도움은 차례로 짙어진다(설계서 §18). 시계가 아니라 「이만큼 기다려도 안 하면 다음 도움」이다 — 화면에 시간은 보이지 않는다
  hints: [
    { at: 0,  give: 'say',   note: '말한다 + 머리 위 생각 방울에 그 물건만(상태는 보여 주지 않는다 — 상태 낱말은 귀로 알아들어야 한다)' },
    { at: 4,  give: 'gaze',  note: '고고가 그 물건을 본다' },
    { at: 8,  give: 'wiggle', note: '그 물건이 까딱인다' },
    { at: 12, give: 'slow',  note: '천천히 다시 말한다(빠르기 0.75)' },
    { at: 16, give: 'show',  note: '고고가 몸으로 그 상태를 흉내 낸다 — 여기서부터는 「도움받아」로 적는다' },
    { at: 22, give: 'drop',  note: '웃으며 어깨를 으쓱하고 잊는다. 틀렸다는 표시 · 소리 · 화면은 없다' },
  ],
  independentBefore: 16, // 이 도움 전에 들어주면 상태 낱말은 「혼자」, 물건 이름은 그림을 봤으므로 언제나 「도움받아」
  onDone: { clip: 'cheer', mood: 'joy', say: 'thanks', echo: true },   // 들어주면: 크게 기뻐하고 그 상태 낱말을 한 번 더 말한다
  onOpposite: { mood: 'smile', sound: 'giggle' },                     // 반대로 해도: 킥킥 웃고 부탁은 그대로 살아 있다
  never: ['아이가 무언가 잡고 있을 때', '고고가 넘어지는 중 · 떠 있는 중 · 얼어 있는 중', '자리를 옮기는 중', '소리를 꺼 둔 때(낱말이 들리지 않으므로)'],
};

// ───────── 네 자리 ─────────
const stations = {
  // ① 있는 것(본판 world/zones/lab — 놀이는 바꾸지 않는다). 부탁만 붙는다.
  size: {
    title: '커졌다 작아졌다', cell: 'L1-3-1', built: true, tool: 'wand', verbs: ['대고 위아래로 끌기'], easy: '대상을 누르면 지팡이가 날아와 붙는다',
    time: '낮', look: { wall: '#b9a7e0', sky: ['#e6dcf6', '#d6cbee', '#b9a8dc'], sun: '#fff1d6', hemi: 0.85 }, cam: { AIM: [0, 1.15, 0], TILT: 17, HALF_W: 4.05 },
    brings: ['지팡이 꽂이'], bed: '느린 종 다섯 음',
    says: [{ w: 'big', when: '크기가 1.35 를 넘는 순간' }, { w: 'small', when: '크기가 0.7 아래로 내려가는 순간' }],
    asks: [
      { say: 'Big apple!', thing: 'apple', want: 'size>=1.35', words: ['big', 'apple'] }, { say: 'Small chair!', thing: 'chair', want: 'size<=0.7', words: ['small', 'chair'] },
      { say: 'Big ball!', thing: 'ball', want: 'size>=1.35', words: ['big', 'ball'] }, { say: 'Small cup!', thing: 'cup', want: 'size<=0.7', words: ['small', 'cup'] },
      { say: 'Big Gogo!', thing: 'gogo', want: 'size>=1.35', words: ['big', 'gogo'] }, { say: 'Small Gogo!', thing: 'gogo', want: 'size<=0.7', words: ['small', 'gogo'] },
    ],
    finds: [
      { id: 'cupKnock', who: 'gogo', do: '고고를 키운다', see: '쿵쿵 걷다 컵을 쓰러뜨린다', auto: 'lock:gogo,drag:1.8,release,step:6' },
      { id: 'cupHide', who: 'gogo', do: '고고를 줄인다', see: '컵 안에 들어가 얼굴만 내민다', auto: 'lock:gogo,drag:0.45,release,step:8' },
      { id: 'appleClimb', who: 'gogo', do: '고고는 작게, 사과는 크게', see: '사과에 올라탄다', auto: 'lock:gogo,drag:0.45,release,lock:apple,drag:1.8,release,step:8' },
      { id: 'ballOff', who: 'thing', do: '공을 키운다', see: '굴러떨어졌다가 하늘에서 돌아온다', auto: 'lock:ball,drag:1.8,release,step:7' },
      { id: 'sitFall', who: 'gogo', do: '의자를 줄인다', see: '앉으려다 넘어진다', auto: 'lock:chair,drag:0.45,release,step:7' },
      { id: 'dizzy', who: 'gogo', do: '고고를 다 키웠다 바로 다 줄인다', see: '눈이 뱅글뱅글', auto: 'lock:gogo,drag:1.8,drag:0.45,release,step:5' },
    ],
    gogo: ['커질 때 제 손을 내려다봄', '다 크면 묵직하게 걷고 실험대가 흔들림', '작아질 때 허둥댐', '다 작아지면 종종걸음', '큰 물건을 올려다봄', '가만두면 혼자 물건을 건드림'],
    clips: [], models: [], sounds: [],
  },

  // ② 둥둥 띄우기
  float: {
    title: '둥둥 띄우기', cell: 'L1-3-3', built: false, tool: 'bubbleBottle', verbs: ['씌우기', '밀기', '톡 터뜨리기'], easy: '대상을 누르면 방울병이 날아와 씌운다 · 방울은 살짝만 눌러도 터진다',
    time: '늦은 오후', look: { wall: '#e9c9b4', sky: ['#ffe9cf', '#f7cfae', '#e3a98f'], sun: '#ffd09a', hemi: 0.8 }, cam: { AIM: [0, 2.05, 0], TILT: 9, HALF_W: 4.05 },
    brings: ['천장 들보와 매달린 등(천장에서 내려온다)', '높은 선반', '방울병(지팡이 꽂이 자리)'], bed: '높고 성긴 풍경 소리',
    T: {
      BUBBLE_R: 1.25,            // 방울 반지름 = 대상의 큰 쪽 반지름 × 이 값
      WRAP: 0.35,                // 방울이 부풀어 감싸는 시간(초)
      BUOY: 2.4, DRAG: 1.6,      // 떠오르는 힘 · 공기 저항(끝 빠르기 = BUOY / DRAG ≒ 1.5)
      HEAVY_AT: 1.35, LIGHT_AT: 0.7,   // 큰 것은 무겁다: 방울 하나로는 HEAVY_TOP 까지만 뜬다 · 작은 것은 가볍다: 떠오르는 힘 × LIGHT_K
      HEAVY_TOP: 0.6, LIGHT_K: 1.8,
      CEIL: 5.1, WALL_X: 3.9,    // 천장 · 양옆 벽
      SOFT: 0.55,                // 방울이 부딪혀 튕기는 정도(말랑)
      PUSH: 14, GLIDE: 0.9,      // 손으로 밀 때 따라오는 빠르기 · 놓은 뒤 미끄러지는 정도(초당 남는 빠르기 비율)
      TAP_MS: 180, TAP_PX: 12,   // 이보다 짧고 덜 움직였으면 「톡」(터뜨리기), 아니면 「밀기」
      MERGE_V: 2.2,              // 두 방울이 이 빠르기보다 세게 부딪히면 하나로 합쳐진다
      WIND: 1.3, WIND_SEC: 4,    // 창을 열면 부는 바람의 세기 · 길이
      FALL_BOUNCE: { ball: 0.72, other: 0.3 }, TOP_BALL_BOUNCES: 3,
      UP_AT: 0.25, DOWN_AT: 'pop',   // 대상 바닥이 실험대에서 이만큼 뜨면 "Up!" · 방울이 터지는 순간 "Down!"
      GOGO_VOICE: 0.06,          // 고고가 높이 1 올라갈 때마다 목소리가 이만큼 높아진다
      IDLE_BLOW: 10, ALL_UP: 5,
      MAX_BUBBLES: 7,
    },
    says: [{ w: 'up', when: '대상의 바닥이 실험대에서 0.25 만큼 뜬 순간' }, { w: 'down', when: '방울이 터져 떨어지기 시작하는 순간' }, { w: 'pop', when: '방울 둘이 합쳐질 때(세 번에 한 번)' }],
    asks: [
      { say: 'Apple, up!', thing: 'apple', want: 'lift=bubble', words: ['up', 'apple'] }, { say: 'Ball, up!', thing: 'ball', want: 'lift=bubble', words: ['up', 'ball'] },
      { say: 'Chair, up!', thing: 'chair', want: 'lift=bubble', words: ['up', 'chair'] }, { say: 'Cup, down!', thing: 'cup', want: 'lift=bench', words: ['down', 'cup'], need: 'lift=bubble' },
      { say: 'Ball, down!', thing: 'ball', want: 'lift=bench', words: ['down', 'ball'], need: 'lift=bubble' }, { say: 'Gogo, up!', thing: 'gogo', want: 'lift=bubble', words: ['up', 'gogo'] },
      { say: 'Gogo, down!', thing: 'gogo', want: 'lift=bench', words: ['down', 'gogo'], need: 'lift=bubble' },
    ],
    finds: [
      { id: 'chairRide', who: 'gogo', do: '고고 곁의 의자를 띄운다', see: '고고가 올라타 의자째 떠오른다', auto: 'wrap:chair:near,step:5' },
      { id: 'merge', who: 'thing', do: '방울 둘을 세게 부딪친다', see: '하나로 합쳐져 둘이 같이 뜬다', auto: 'wrap:apple,wrap:cup,fling:apple:cup,step:3' },
      { id: 'wind', who: 'thing', do: '둥근 창을 누른다', see: '창이 열리고 바람에 방울이 한쪽으로 밀려간다', auto: 'wrap:ball,window,step:5' },
      { id: 'allUp', who: 'gogo', do: '다섯을 다 띄운다', see: '고고가 "Up! Up! Up!" 하고 등이 흔들린다', auto: 'wrap:apple,wrap:cup,wrap:chair,wrap:ball,wrap:gogo,step:6' },
      { id: 'antPop', who: 'gogo', do: '뜬 고고를 다른 방울 쪽으로 민다', see: '더듬이로 남의 방울을 터뜨리고 놀란다', auto: 'wrap:gogo,wrap:apple,push:gogo:apple,step:4' },
      { id: 'topBounce', who: 'thing', do: '공을 천장까지 올렸다 터뜨린다', see: '크게 세 번 튕긴다', auto: 'wrap:ball,step:6,pop:ball,step:4' },
      { id: 'cupTrap', who: 'gogo', do: '컵을 고고 위에서 터뜨린다', see: '뒤집힌 컵에 갇혔다가 들고 나온다', auto: 'wrap:cup,push:cup:gogo,pop:cup,step:6' },
      { id: 'lampHang', who: 'gogo', do: '고고를 천장까지 띄운다', see: '등을 붙잡고 매달려 흔들린다', auto: 'wrap:gogo,step:7' },
      { id: 'heavyNeedsTwo', who: 'thing', cross: 'size', do: '크게 만든 것을 띄운다', see: '무거워 조금만 뜬다 — 방울을 하나 더 합쳐 주면 천장까지', auto: 'set:apple:size:1.8,wrap:apple,step:4,wrap:cup,fling:cup:apple,step:5' },
    ],
    gogo: ['방울병을 눈으로 따라감', '물건이 뜨면 폴짝폴짝 뛰어 잡으려 함', '낮게 내려온 방울을 더듬이로 건드려 봄', '뜨면 허우적 → 헤엄 → 깔깔', '천장에 닿으면 등에 매달림', '떨어지면 납작해졌다 출렁이며 일어남', '연달아 두 번 떨어지면 어지러워함', '떨어진 물건을 쓰다듬음', '튕겨 온 공을 받아 냄', '가만두면 혼자 방울을 불고 쫓아다님'],
    clips: ['flail', 'swim', 'hang', 'splat', 'reachJump', 'blow', 'pat'],
    models: ['방울병', '천장 들보', '매달린 등', '높은 선반과 그 위 물건', '열리는 둥근 창'], code: ['방울(얇은 막 · 무지갯빛 가장자리 · 출렁임 · 터질 때 물방울)'],
    sounds: ['방울 부풂', '방울 퐁', '말랑 부딪힘', '바람', '등 삐걱', '쿵 납작'],
  },

  // ③ 무지개 물약
  potion: {
    title: '무지개 물약', cell: 'L1-3-2', built: false, tool: 'ladle', verbs: ['기울여 붓기', '원을 그려 젓기', '떠서 끼얹기'], easy: '병을 누르면 스스로 날아가 조금 붓는다 · 냄비를 문지르기만 해도 저어진다 · 국자를 누르고 대상을 누르면 끼얹는다',
    time: '저녁', look: { wall: '#6f5aa8', sky: ['#4b3a86', '#5b4796', '#3a2c6b'], sun: '#b9a0ff', hemi: 0.45, glow: '냄비 속 물약의 색이 방을 물들인다(점 빛 하나)' }, cam: { AIM: [0, 1.25, 0], TILT: 14, HALF_W: 3.6 },
    brings: ['냄비(실험대 가운데 뚜껑문에서 솟는다)', '병 걸이와 물약 병 넷(위에서 내려온다)', '국자', '수도꼭지(오른쪽 뒤)'], bed: '낮게 보글거리는 소리와 종',
    T: {
      CAULDRON: { at: [0, -0.3], r: 0.62, rim: 0.62, cap: 8 },   // 자리 · 반지름 · 테두리 높이 · 들어가는 양(단위)
      RAIL: { y: 2.25, z: -0.6, xs: [-0.9, -0.3, 0.3, 0.9], order: ['red', 'yellow', 'blue', 'white'] },
      PLACE: { chair: [-2.6, -0.45], apple: [-1.55, -0.3], cup: [1.5, -0.3], ball: [2.5, -0.15], gogo: [-0.75, 0.55], tap: [3.0, -0.8] },
      POUR_PAD: 0.75,            // 병이 냄비 가운데에서 이 거리 안에 오면 스스로 기울어 붓는다
      POUR: 2,                   // 붓는 빠르기(단위/초). 병은 비지 않는다
      TILT: 0.25,                // 병이 기울어지는 시간(초)
      STIR_TURN: 1.25,           // 이만큼(바퀴) 저으면 다 섞인다. 저은 만큼 섞인다(0~1)
      STIR_R: [0.15, 0.7],       // 젓는 것으로 보는 손의 반지름 범위(냄비 반지름의 배수)
      OVER: 8, OVER_SPILL: 3,    // 이보다 많이 부으면 넘친다 · 넘치면 이만큼 덜어진다
      SCOOP: 1, SPLASH_PAD: 0.6, // 국자 한 번에 뜨는 양 · 대상 위 이 거리 안에서 스스로 기울어 끼얹는다
      DYE: 0.35,                 // 물드는 시간(초)
      BIG_NEEDS: 2,              // 큰 것은 두 번 끼얹어야 다 물든다(한 번이면 위쪽 반만)
      DUNK_SMALL: 0.7,           // 이보다 작은 것은 냄비에 통째로 담글 수 있다
      WASH: 0.6,                 // 수돗물에 씻겨 제 색으로 돌아가는 시간(초)
      DRAIN: 1.2,                // 마개를 뽑으면 비는 시간(초)
      IDLE_STIR: 10, RAINBOW: 4, // 가만두면 고고가 혼자 젓는다 · 서로 다른 색 넷이면 무지개
    },
    // 색 모형(놀이용 — 실제 물감은 재료에 따라 다르다. README 에 적고 화면에는 적지 않는다)
    colors: {
      hex: { red: '#E8574E', yellow: '#FFD24A', blue: '#4E9BE8', white: '#FFF7EC', orange: '#F5953B', green: '#6CC070', purple: '#9B6AD4', pink: '#F7A0C0', brown: '#8A6A4A' },
      rule: [
        '빨강 · 노랑 · 파랑 가운데 하나뿐 → 그 색',
        '둘이 저마다 (세 색 합의) 25% 이상이고 나머지 하나가 15% 아래 → 빨강+노랑 = orange · 노랑+파랑 = green · 파랑+빨강 = purple',
        '둘 가운데 하나가 25% 아래 → 많은 쪽의 색(조금 물든 빛)',
        '셋이 저마다 15% 이상 → brown',
        '흰색이 25% 이상 + 빨강만 → pink · 흰색 + 다른 색 → 그 색의 옅은 빛(이름은 그대로) · 흰색뿐 → white',
      ],
      show: '보이는 색은 화면 색을 평균하지 않는다(파랑 + 노랑이 회색이 된다). 고른 색 띠 빨강→주황→노랑→초록→파랑→보라→빨강 위에서 비율대로 잡고, 흰색만큼 #FFF7EC 쪽으로 옅게(최대 70%), 갈색은 #8A6A4A',
      before: '젓기 전에는 부은 색들이 따로 소용돌이친다(얼룩) — 저어야 한 색이 되고, 그 순간 색 이름이 나온다',
    },
    says: [
      { w: 'red', when: '빨강 병을 집을 때(이름) · 대상이 빨갛게 물들 때' }, { w: 'blue', when: '파랑 병을 집을 때 · 파랗게 물들 때' }, { w: 'yellow', when: '노랑 병을 집을 때 · 노랗게 물들 때' },
      { w: 'white', when: '흰 병을 집을 때' }, { w: 'mix', when: '저어서 섞임이 0.5 를 넘는 순간' },
      { w: 'pink', when: '다 섞여 분홍이 된 순간 · 분홍으로 물들 때' }, { w: 'purple', when: '다 섞여 보라가 된 순간' }, { w: 'orange', when: '다 섞여 주황이 된 순간' }, { w: 'green', when: '다 섞여 초록이 된 순간' }, { w: 'brown', when: '다 섞여 갈색이 된 순간' },
      { w: 'splash', when: '냄비가 넘칠 때' }, { w: 'water', when: '수도꼭지를 틀 때(이름)' },
    ],
    asks: [
      { say: 'Blue apple!', thing: 'apple', want: 'color=blue', words: ['blue', 'apple'] }, { say: 'Red ball!', thing: 'ball', want: 'color=red', words: ['red', 'ball'] },
      { say: 'Yellow chair!', thing: 'chair', want: 'color=yellow', words: ['yellow', 'chair'] }, { say: 'Pink cup!', thing: 'cup', want: 'color=pink', words: ['pink', 'cup'] },
      { say: 'Red Gogo!', thing: 'gogo', want: 'color=red', words: ['red', 'gogo'] }, { say: 'Blue Gogo!', thing: 'gogo', want: 'color=blue', words: ['blue', 'gogo'] },
      { say: 'Mix, please!', thing: 'cauldron', want: 'mixed>=1', words: ['mix'], need: 'poured>=2colors' }, { say: 'Yellow, please!', thing: 'cauldron', want: 'pour=yellow', words: ['yellow'] },
      { say: 'Pink, please!', thing: 'cauldron', want: 'potion=pink', words: ['pink'] },
    ],
    finds: [
      { id: 'overflow', who: 'gogo', do: '계속 붓는다', see: '부글부글 넘쳐 거품이 실험대로 흘러내리고 고고가 발을 든다', auto: 'pour:red:5,pour:blue:5,step:3' },
      { id: 'brownBurp', who: 'thing', do: '세 색을 다 넣고 젓는다', see: '갈색이 되고 냄비가 큰 방울을 꺼억 뱉는다', auto: 'pour:red:2,pour:yellow:2,pour:blue:2,stir:2,step:3' },
      { id: 'gogoDye', who: 'gogo', do: '고고에게 끼얹는다', see: '그 색이 된 제 손을 내려다보고 몸을 털어 색 방울을 튀긴다', auto: 'pour:blue:2,scoop,splash:gogo,step:5' },
      { id: 'sipHiccup', who: 'gogo', do: '국자를 고고 입에 가져간다', see: '한 모금 마시고 딸꾹질마다 그 색 방울이 나온다', auto: 'pour:red:1,pour:white:1,stir:2,scoop,feed:gogo,step:5' },
      { id: 'roomGlow', who: 'thing', do: '물약 색을 바꾼다', see: '방 전체가 그 색 빛으로 물든다', auto: 'pour:yellow:3,step:2' },
      { id: 'rainbow', who: 'gogo', do: '넷을 서로 다른 색으로 물들인다', see: '창에 무지개가 뜨고 고고가 손뼉을 친다', auto: 'paint:apple:red,paint:cup:yellow,paint:chair:blue,paint:ball:pink,step:4' },
      { id: 'sameShine', who: 'thing', do: '빨간 사과에 빨강을 끼얹는다', see: '반짝반짝 윤이 난다', auto: 'pour:red:2,scoop,splash:apple,step:2' },
      { id: 'drain', who: 'thing', do: '냄비 마개를 뽑는다', see: '꾸르륵 소용돌이치며 비고 색 빛이 꺼진다', auto: 'pour:blue:3,plug,step:3' },
      { id: 'dunkSmall', who: 'thing', cross: 'size', do: '작게 만든 것을 냄비에 넣는다', see: '퐁당 빠졌다가 물들어 떠오른다', auto: 'set:ball:size:0.5,pour:yellow:3,dunk:ball,step:4' },
      { id: 'bigHalf', who: 'thing', cross: 'size', do: '크게 만든 것에 한 번 끼얹는다', see: '위쪽 반만 물든다 — 한 번 더 끼얹으면 다 물든다', auto: 'set:apple:size:1.8,pour:blue:3,scoop,splash:apple,step:2' },
    ],
    gogo: ['병을 눈으로 따라가고 붓는 줄기를 올려다봄', '젓는 손을 따라 고개를 빙글빙글 돌림', '다 섞여 색이 바뀌면 눈이 커짐', '넘치면 발을 번갈아 들며 허둥댐', '물든 물건에 다가가 견주어 봄(제 몸 색과)', '제가 물들면 손을 내려다보고 몸을 턺', '갈색에는 코를 쥠', '가만두면 혼자 국자로 젓고 한 모금 맛봄'],
    clips: ['stir', 'sip', 'hiccup', 'shake', 'hopFeet', 'noseHold'],
    models: ['냄비와 받침', '국자', '병 걸이', '물약 병 넷', '수도꼭지', '마개와 줄'], code: ['물약 겉면(얼룩 → 한 색)', '붓는 줄기', '거품과 넘침', '물든 겉(색 섞기 · 위쪽 반만)', '무지개'],
    sounds: ['코르크 뽁', '조르륵', '보글', '젓는 소리', '다 섞임 종', '끼얹기 찰박', '넘침', '꾸르륵', '딸꾹'],
  },

  // ④ 얼음과 불
  frost: {
    title: '얼음과 불', cell: 'L1-3-4', built: false, tool: 'cloudAndLamp', verbs: ['들고 머물기', '기울여 쏟기', '밀어 미끄러뜨리기'], easy: '눈구름 · 햇살 등을 누르고 대상을 누르면 그 위에 가서 머문다 · 대접을 길게 누르면 쏟아진다',
    time: '아침', look: { wall: '#cfdcee', sky: ['#eef6ff', '#dbe9f7', '#bfd3ea'], sun: '#ffffff', hemi: 0.95, split: '왼쪽은 창에서 드는 푸른 눈빛, 오른쪽은 난로의 주황빛 — 왼쪽 = Cold, 오른쪽 = Hot' }, cam: { AIM: [0, 0.8, 0], TILT: 26, HALF_W: 4.05 },
    brings: ['눈구름(창이 열리며 들어와 왼쪽 걸이에)', '햇살 등(오른쪽 걸이에)', '물 대접(가운데 뚜껑문에서)', '옥수수 접시(오른쪽 앞)', '작은 난로(오른쪽 벽)'], bed: '왼쪽의 바람과 오른쪽의 타닥타닥',
    T: {
      PLACE: { chair: [-2.55, -0.45], apple: [-1.3, -0.3], cup: [1.25, -0.3], ball: [2.4, -0.15], gogo: [0.1, 0.6], bowl: [0, -0.25], corn: [2.9, 0.75], cloud: [-3.0, 1.7], lamp: [3.0, 1.7] },
      HOVER: 1.1, PAD: 0.6,      // 도구가 대상 위에 떠 있는 높이 · 그 아래 이 거리 안의 것이 차가워지고 뜨거워진다
      RATE: 0.9,                 // 온도가 바뀌는 빠르기(1/초). 큰 것은 느리고 작은 것은 빠르다(÷ 크기)
      COLD_AT: -0.6, HOT_AT: 0.6, REARM: 0.35,
      BACK: 0.04,                // 가만두면 미지근한 쪽으로 돌아가는 빠르기(1/초) — 아주 느리다
      FREEZE_HOLD: 2,            // 고고가 가장 차가운 채로 이만큼(초) 있으면 얼음 조각이 된다
      FREEZE_FREE: 1.5,          // 얼음 조각이 된 뒤 스스로 깨고 나오기까지(초)
      BOWL: { r: 0.5, tilt: 0.8 },   // 대접 · 이만큼(초) 길게 누르거나 실험대 밖으로 기울이면 쏟아진다
      PUDDLE: { r: 1.1, max: 3 },    // 웅덩이 반지름 · 한 번에 있을 수 있는 수
      ICE_SLIDE: 0.985, BENCH_SLIDE: 0.6,   // 빙판 위 · 맨 실험대 위에서 초당 남는 빠르기 비율(빙판은 거의 줄지 않는다)
      SLIP_V: 0.9,               // 고고가 빙판을 이보다 빠르게 걸으면 미끄러진다
      BALL: { cold: 0.08, rest: 0.45, hot: 0.82 },   // 공이 튀는 정도
      POPCORN: { at: 0.6, n: 9 },    // 옥수수가 터지기 시작하는 온도 · 알 수
      SNOW: { hold: 2.5, r: 0.45 },  // 빈 자리에 눈구름을 이만큼(초) 두면 눈 더미
      STEAM_GONE: 3,             // 웅덩이를 이만큼(초) 쬐면 김이 되어 사라진다
      IDLE_PLAY: 10,
    },
    says: [
      { w: 'cold', when: '대상의 온도가 -0.6 아래로 내려가는 순간' }, { w: 'hot', when: '대상의 온도가 0.6 을 넘는 순간' },
      { w: 'ice', when: '물이 얼음이 된 순간 · 얼음을 만질 때(이름)' }, { w: 'water', when: '대접 · 웅덩이를 만질 때(이름) · 얼음이 다 녹은 순간' }, { w: 'pop', when: '옥수수가 터질 때(처음 한 번)' },
    ],
    asks: [
      { say: 'Cold apple!', thing: 'apple', want: 'temp<=-0.6', words: ['cold', 'apple'] }, { say: 'Hot cup!', thing: 'cup', want: 'temp>=0.6', words: ['hot', 'cup'] },
      { say: 'Cold ball!', thing: 'ball', want: 'temp<=-0.6', words: ['cold', 'ball'] }, { say: 'Hot chair!', thing: 'chair', want: 'temp>=0.6', words: ['hot', 'chair'] },
      { say: 'Cold water!', thing: 'bowl', want: 'temp<=-0.6', words: ['cold', 'water'] }, { say: 'Hot water!', thing: 'bowl', want: 'temp>=0.6', words: ['hot', 'water'] },
      { say: 'Hot, please!', thing: 'gogo', want: 'temp>=0.2', words: ['hot'], need: 'gogo.temp<=-0.6', note: '고고가 떨고 있을 때만 — 녹여 달라는 부탁' },
      { say: 'Cold, please!', thing: 'gogo', want: 'temp<=-0.2', words: ['cold'], need: 'gogo.temp>=0.6', note: '고고가 더울 때만' },
    ],
    finds: [
      { id: 'iceRink', who: 'gogo', do: '물을 쏟고 눈구름으로 얼린다', see: '빙판이 되고 지나가던 고고가 미끄러져 엉덩방아를 찧는다', auto: 'spill,cold:puddle:3,walk:gogo:puddle,step:4' },
      { id: 'curling', who: 'thing', do: '빙판 위에서 물건을 민다', see: '멀리 미끄러져 다른 물건을 맞히고 둘 다 빙글 돈다', auto: 'spill,cold:puddle:3,shove:apple:cup,step:4' },
      { id: 'statue', who: 'gogo', do: '고고에게 눈구름을 오래 댄다', see: '꽁 얼어 얼음 조각이 됐다가 금이 가며 깨고 나와 재채기로 눈송이를 뿜는다', auto: 'cold:gogo:4,step:4' },
      { id: 'bounceChange', who: 'thing', do: '공을 얼리거나 데워 떨어뜨린다', see: '언 공은 딱 하고 안 튀고, 데운 공은 말랑하게 높이 튄다', auto: 'cold:ball:2,drop:ball,step:2,hot:ball:4,drop:ball,step:3' },
      { id: 'popcorn', who: 'gogo', do: '옥수수 접시에 햇살 등을 댄다', see: '팡팡 터져 날아오르고 고고가 입으로 받아먹는다', auto: 'hot:corn:3,step:4' },
      { id: 'snowman', who: 'gogo', do: '빈 자리에 눈구름을 오래 둔다', see: '눈이 쌓이고 고고가 굴려 눈사람을 만든다. 등을 대면 스르르 녹는다', auto: 'cold:spot:4,step:8' },
      { id: 'hotSeat', who: 'gogo', do: '의자를 데운다', see: '고고가 앉았다가 벌떡 뛰어올라 엉덩이에 부채질한다', auto: 'hot:chair:2,sit:gogo,step:4' },
      { id: 'steamAway', who: 'thing', do: '웅덩이에 햇살 등을 오래 댄다', see: '김이 되어 다 사라진다', auto: 'spill,hot:puddle:4,step:2' },
      { id: 'coolDip', who: 'gogo', do: '고고를 데운다', see: '빨개져 부채질하다 물 대접에 뛰어들어 치익 김이 난다', auto: 'hot:gogo:3,step:6' },
      { id: 'bigSlow', who: 'thing', cross: 'size', do: '크게 만든 것을 얼린다', see: '서리가 아래에서부터 천천히 올라온다 — 작은 것은 눈 깜짝할 새 언다', auto: 'set:apple:size:1.8,cold:apple:2,step:1' },
      { id: 'colorIce', who: 'thing', cross: 'potion', do: '물든 작은 것을 물에 담갔다 얼린다', see: '물이 그 색이 되고 색 얼음이 된다', auto: 'set:ball:size:0.5,set:ball:color:blue,dunk:ball,cold:bowl:3,step:2' },
    ],
    gogo: ['눈구름을 올려다보고 떨어지는 눈송이를 혀로 받음', '차가워지면 파래져 덜덜 떨고 더듬이 끝에 고드름', '뜨거워지면 발그레해져 손부채질', '빙판에서 미끄러져 엉덩방아 → 두 번째부터는 양팔을 벌리고 지침', '언 물건을 만져 보고 손을 호호 붊', '김 나는 컵에 손을 쬠', '튀는 팝콘을 입으로 받아먹음', '가만두면 혼자 빙판을 지치거나 눈을 뭉침'],
    clips: ['shiver', 'slip', 'skate', 'fan', 'warm', 'catchMouth', 'rollSnow', 'sneeze'],
    models: ['눈구름', '햇살 등', '물 대접', '얼음덩이', '옥수수 접시와 팝콘', '작은 난로', '눈사람 부품(눈 덩이 둘 · 당근 코)'], code: ['서리 겉(아래에서 올라옴)', '고드름', '김', '눈송이', '웅덩이와 빙판(바닥 무늬 셋까지)', '달아오른 빛'],
    sounds: ['사락사락 눈', '쩍 얼음', '치익 김', '타닥 난로', '미끄덩', '팡 옥수수', '딱 언 공', '뚝뚝 녹는 물'],
  },
};

// 어느 자리에서나 쓰는 고고 동작(부탁 · 기쁨)
const commonClips = ['ask', 'cheer', 'shrug'];
// 동작마다: 길이(초) · 되풀이 · 몸이 하는 일
const clips = {
  ask: [1.2, true, '두 손을 모으고 아이 쪽을 올려다본다. 몸을 살짝 앞으로'], cheer: [1.2, false, '두 팔을 번쩍 들고 두 번 뛴다'], shrug: [0.9, false, '어깨를 으쓱하고 고개를 갸웃'], pat: [1.0, false, '한 손으로 앞의 것을 두 번 쓰다듬는다'],
  flail: [0.8, true, '팔다리를 허우적(몸이 뒤로 젖혀짐)'], swim: [1.0, true, '개구리헤엄 — 팔다리를 모았다 편다'], hang: [1.6, true, '두 손을 위로 뻗어 매달려 앞뒤로 흔들림'], splat: [1.6, false, '쿵 납작(세로 0.55배) → 출렁 → 일어섬'], reachJump: [1.0, false, '한 손을 뻗으며 뛰어오른다'], blow: [1.4, false, '방울 고리를 입에 대고 볼을 부풀려 분다'],
  stir: [1.2, true, '두 손으로 국자를 잡고 크게 원을 그린다'], sip: [1.1, false, '국자를 입에 대고 후루룩'], hiccup: [0.5, false, '온몸이 한 번 튀고 입이 벌어짐'], shake: [1.0, false, '젖은 강아지처럼 몸을 좌우로 턴다'], hopFeet: [0.6, true, '발을 번갈아 들며 제자리에서 동동'], noseHold: [1.0, false, '한 손으로 코(얼굴 가운데)를 쥐고 고개를 돌림'],
  shiver: [0.4, true, '어깨를 움츠리고 잘게 떤다'], slip: [1.4, false, '발이 앞으로 빠지며 엉덩방아 → 눈을 끔벅'], skate: [1.2, true, '양팔을 벌리고 한 발씩 밀며 지친다'], fan: [0.6, true, '한 손으로 얼굴에 부채질'], warm: [1.5, true, '두 손을 앞으로 내밀고 쬔다'], catchMouth: [0.7, false, '고개를 젖히고 입을 벌려 받아먹는다'], rollSnow: [1.6, true, '몸을 숙여 눈 덩이를 굴린다'], sneeze: [0.9, false, '고개를 젖혔다 앞으로 숙이며 에취'],
};
// 새 표정(코드 — actor.js FACE 에 더한다)
const faces = { cold: '눈을 조금 감고 입이 잔물결 모양으로 잘게 떨린다', ask: '눈이 커지고 눈동자가 크며 입을 살짝 벌린다(먹고 싶다 want 를 바탕으로)', blowing: '볼이 부풀고 입이 오므라든다', stuffy: '눈을 질끈 감고 입을 꾹 다문다(갈색 물약)' };

// ───────── 자리끼리 이어지는 것(같은 물건이 상태를 지닌 채 옮겨 간다) ─────────
const cross = [
  { a: 'size', b: 'float', rule: '큰 것은 무겁다 — 방울 하나로는 조금만 뜬다. 작은 것은 쏜살같이 올라 천장에 통통 튄다' },
  { a: 'color', b: 'float', rule: '물든 것을 감싼 방울은 그 색이 비친다' },
  { a: 'temp', b: 'float', rule: '언 것의 방울은 서리가 끼어 천천히 가라앉는다 · 뜨거운 것의 방울은 빨리 오르다 김에 저절로 퐁 터진다' },
  { a: 'size', b: 'potion', rule: '큰 것은 두 번 끼얹어야 다 물든다 · 작은 것은 냄비에 통째로 담글 수 있다' },
  { a: 'temp', b: 'potion', rule: '뜨거운 것을 끼얹으면 그 색 김이 오른다 · 언 것은 서리 밑으로 색이 비친다' },
  { a: 'size', b: 'frost', rule: '큰 것은 천천히 얼고 녹는다 · 작은 것은 금방' },
  { a: 'color', b: 'frost', rule: '물든 작은 것을 물에 담그면 물이 그 색 → 얼리면 색 얼음' },
];
// 상태가 둘이 겹치면 고고가 두 낱말을 이어 말한다(둘까지만). 차례 = 크기 → 온도 → 색 → 이름
const combo = { order: ['size', 'temp', 'color'], max: 2, every: 2, sample: ['Big blue apple!', 'Small cold ball!', 'Hot red cup!', 'Big hot chair!'], lift: 'Big apple, up!' };

// ───────── 자리 옮기기 ─────────
const move = {
  tray: { where: '화면 아래 가운데', n: 4, px: 64, gap: 14, pictures: ['지팡이', '방울', '냄비', '눈송이와 불꽃'], text: false, now: '지금 자리의 그림은 살짝 올라와 있다' },
  steps: [
    { t: 0.00, what: '누른 그림이 눌리고(0.1초) 지금 도구가 제자리로 돌아간다' },
    { t: 0.10, what: '빛 · 벽 색이 새 때(낮 · 늦은 오후 · 저녁 · 아침)로 옮겨 가기 시작한다(1.0초)' },
    { t: 0.15, what: '카메라가 새 구도로(0.9초)' },
    { t: 0.20, what: '지난 자리의 가구가 들어가고 새 자리의 가구가 나온다(0.8초 — 뚜껑문 · 천장 · 창)' },
    { t: 0.30, what: '물건들이 새 자리로 짧게 뛴다(하나에 0.4초, 0.08초씩 어긋나게). 고고는 걸어간다' },
    { t: 1.20, what: '끝. 그사이에도 손은 막지 않는다(뛰는 물건을 눌러도 이름이 나온다)' },
  ],
  keep: ['크기', '색', '온도'], drop: ['방울(조용히 터져 내려온다 — "Down!" 은 말하지 않는다)', '웅덩이 · 빙판 · 눈 더미 · 팝콘(그 자리의 것)'],
  lazy: '자리마다 모형 묶음 하나(lab_float.glb · lab_potion.glb · lab_frost.glb, 저마다 450KB 아래)를 처음 갈 때 받는다. 받는 동안 그림이 숨 쉬듯 깜박이고 지금 자리에서 계속 놀 수 있다',
};

// ───────── 묶음 ─────────
const bundles = [
  { id: '3-0', title: '연구소 껍데기', does: '한 화면 네 자리(구도 · 빛 · 가구 · 도구가 바뀐다) · 도구 그림 넷 · 물건 상태 넷 · 부탁(engine/ask.js) + 생각 방울 · 구역 배경 소리 · 「커졌다 작아졌다」에 부탁 붙이기', clips: ['ask', 'cheer', 'shrug'], done: '「커졌다 작아졌다」의 자동 확인 아홉 차례가 전과 같다 · 식당 · 햄버거 · 첫 접속의 자동 확인도 전과 같다 · 부탁 한 번이 처음부터 끝까지(말 → 도움 넷 → 잊기 / 들어주기) 자동 확인으로 돈다' },
  { id: '3-1', title: '둥둥 띄우기', does: 'stations.float 전부', done: '발견 거리 아홉이 자동 확인에서 다 일어난다 · "Up!" 과 "Down!" 이 제때에만 난다' },
  { id: '3-2', title: '무지개 물약', does: 'stations.potion 전부', done: '발견 거리 열 · 색 규칙 표의 모든 줄이 자동 확인으로 그 이름을 낸다' },
  { id: '3-3', title: '얼음과 불', does: 'stations.frost 전부', done: '발견 거리 열하나 · "Hot!" 과 "Cold!" 가 제때에만 난다' },
  { id: '3-4', title: '잇기', does: 'cross 일곱 줄 · 겹친 낱말(combo) · 녹음 대본 뽑기(tools/voice_script → 낱말과 문장의 목록)', done: 'cross 일곱 줄이 자동 확인에서 다 일어난다 · 네 자리를 돌아도 크기 · 색 · 온도가 남아 있다' },
];

export const LAB = { version: 1, zone: 'world-lab', words, thingState, things, ask, stations, commonClips, clips, faces, cross, combo, move, bundles };
export default LAB;
