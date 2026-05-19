/* ============================================================
   1학년 1학기 수학 — 2단원 「여러 가지 모양」 (7차시)
   양산 자리 — LESSONS["u2_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 케이티처 LESSONS 양산 채팅 (단원 2 케이티처 자리)
   다른 단원 .js (g1_math_u1·u3~u6.js) = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   2026-05-20 cycle A — 7 차시 1차 양산 (18슬 인덱스 + 문제 옵션)
   2026-05-20 cycle B — CURRICULUM 7 차시 갱신 + ready: true (g1_math.html 자리)
   2026-05-20 cycle C — extras 양산 (차시당 12개 = 총 84개) + 정리 자리 desc 보강
     · u2_l01 = 단원 도입 (18슬, 본 차시 자리 — 안 B 5슬 X)
     · u2_l02~07 = 본 차시 5단계 18슬
     · 새 메카닉 「모양 찾기 놀이(메모리 카드)」 = u2_l05 자리
     · extras types = video·fun_question·tip·real_world·game(memory_match)·book·misconception·extension
   참조 = data/g1_math_u1.js (cycle 16~19 패턴)
   분석 source = handoff/kedu/teacher/lessons/g1_math_u2_l01~l07.json
============================================================ */

LESSONS["u2_l1"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 1,
    title: "단원 도입",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 학교 교실 풍경에서 직·원·구 모양 발견",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_01_단원도입.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"여러 가지 모양을 살펴봐요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"우리 주변에는 어떤 모양이 있을까?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"오늘 만날 3 가지 모양",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"1학년 1반과 1학년 2반 교실",desc:"2단계 · 전개 · 두 교실"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"책상 위에서 다른 모양을 찾아 봐요",desc:"2단계 · 전개 · 다른 그림 찾기 ①"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"교실 다른 자리에서도 찾아 봐요",desc:"2단계 · 전개 · 다른 그림 찾기 ②"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"두 교실에서 만난 3 가지 모양",desc:"2단계 · 전개 · 3 모양 도입"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"주사위 🎲는 어떤 모양이에요?",desc:"주사위 🎲는 어떤 모양이에요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"두루마리 휴지 🧻는 어떤 모양이에요?",desc:"두루마리 휴지 🧻는 어떤 모양이에요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"구슬 🔮은 어떤 모양이에요?",desc:"구슬 🔮은 어떤 모양이에요? (정답: ⚽ 공 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:true}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"두 교실에서 본 물건과 같은 모양을 짝지어요",desc:"두 교실에서 본 물건과 같은 모양을 짝지어요"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"1학년 1반 교실 물건을 같은 모양 통에 분류해 봐요!",desc:"1학년 1반 교실 물건을 같은 모양 통에 분류해 봐요!"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"1학년 2반 교실 물건도 같은 모양 통에 분류해 봐요!",desc:"1학년 2반 교실 물건도 같은 모양 통에 분류해 봐요!"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"1학년 1반 책상 위 필통 🥫은 어떤 모양?",desc:"1학년 1반 책상 위 필통 🥫은 어떤 모양? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:15}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"1학년 2반 쓰레기통 🥫은 어떤 모양?",desc:"1학년 2반 쓰레기통 🥫은 어떤 모양? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:15}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ①",desc:"1단계 정리 — 직·원·구 어휘 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"2단계 정리 — 단원 실천 활동 다짐"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"2차시 — 학교 4공간에서 모양 찾기"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_shape_song", type:"video", icon:"🎥", title:"핑크퐁 모양 노래", url:"https://www.youtube.com/results?search_query=핑크퐁+모양+동그라미+세모+네모", video_id:"", description:"세 모양(상자·기둥·공) 노래로 첫 어휘 흥미 도입. 도입 자리 1~3 슬에 적합.", source:"핑크퐁 (Pinkfong) — 유튜브 공개 검색", fit_slides:["motivate","review"]},
    {id:"q_fun_classroom_3shape", type:"fun_question", icon:"💡", title:"우리 교실 3 모양 찾기", content:"우리 교실을 둘러봐요. 상자 모양·기둥 모양·공 모양을 하나씩 찾을 수 있나요? 친구와 같이 손가락으로 가리켜 봐요.", fit_slides:["motivate","real_world"]},
    {id:"q_fun_my_room", type:"fun_question", icon:"💡", title:"내 방의 세 모양", content:"집에 가서 내 방에서 상자·기둥·공 모양 물건을 하나씩 찾아오기. 다음 시간에 친구에게 이야기.", fit_slides:["motivate","real_world","next_lesson"]},
    {id:"m_everyday_words", type:"tip", icon:"🧩", title:"일상용어로 부르기", content:"1학년에서는 '직육면체·원기둥·구' 같은 어려운 말은 X. '상자 모양·기둥 모양·공 모양' 일상용어로만 부르고 친숙해지기.", fit_slides:["concept","summary"]},
    {id:"m_observe_shape", type:"tip", icon:"🧩", title:"모양에 집중하기", content:"색·크기·재료가 달라도 모양은 같을 수 있어요. 다른 그림 찾기 자리 = 모양 차이에만 집중하고 알려 주기.", fit_slides:["concept"]},
    {id:"r_classroom_objects", type:"real_world", icon:"🌍", title:"교실 물건의 세 모양", content:"필통(기둥/상자)·휴지 상자(상자)·공(공)·구슬(공)·쓰레기통(상자/기둥) — 한 교실에 세 모양이 모두 있어요.", fit_slides:["concept","real_world"]},
    {id:"r_lunch_things", type:"real_world", icon:"🌍", title:"점심시간에 만나는 모양", content:"도시락(상자)·보온병(기둥)·미트볼·방울토마토(공). 점심을 먹으며 모양 이야기를 나눠요.", fit_slides:["real_world","concept"]},
    {id:"g_classroom_hunt", type:"game", icon:"🎮", title:"교실 모양 보물찾기", content:"4~5명이 한 모둠. 모양 카드(상자·기둥·공)를 뽑고 그 모양 물건을 교실에서 가장 빨리 가져오기. 안전 자리 주의.", fit_slides:["game","motivate"]},
    {id:"b_shape_book_intro", type:"book", icon:"📖", title:"『모양으로 만든 세상』", content:"우리 주변 물건들을 상자·기둥·공으로 보는 그림책. 단원 도입 자리 그림 자리 풍부.", source:"국내 모양 그림책 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"x_shape_vs_size", type:"misconception", icon:"❓", title:"오개념 — 크기가 다르면 모양도 다른가?", content:"작은 공·큰 공·축구공·구슬은 크기가 달라도 모두 공 모양. 크기·색은 모양을 결정하지 않는다는 점 짚어 주기.", fit_slides:["concept","advanced_problem"]},
    {id:"x_color_diff", type:"misconception", icon:"❓", title:"오개념 — 색이 달라요!", content:"빨간 상자·파란 상자·흰 상자 모두 상자 모양. 색이 모양을 만드는 것이 아니라는 점 알리기.", fit_slides:["concept"]},
    {id:"e_unit_practice", type:"extension", icon:"⬆", title:"단원 실천 활동 안내", content:"단원 동안 학교·집에서 세 모양을 찾을 때마다 색칠하는 표 안내. 6차시·7차시 자리 모두 누적.", fit_slides:["next_lesson","concept"]}
  ]
};

LESSONS["u2_l2"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 2,
    title: "여러 가지 모양을 찾아볼까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 학교 4공간(체육관·보건실·도서관·화장실)에서 모양 찾기",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_02_여러가지모양을찾아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"여러 가지 모양을 찾아볼까요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"학교에서 어떤 모양이 보일까?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간 두 교실 그림 기억나요?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"체육관에서 공 모양을 찾아 봐요 🏀",desc:"2단계 · 전개 · 체육관"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"보건실에는 어떤 모양이 있을까? 🏥",desc:"2단계 · 전개 · 보건실"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"도서관에는 어떤 모양이 있을까? 📚",desc:"2단계 · 전개 · 도서관"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"화장실과 4공간 정리",desc:"2단계 · 전개 · 화장실 + 정리"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"축구공 ⚽은 어떤 모양이에요?",desc:"축구공 ⚽은 어떤 모양이에요? (정답: ⚽ 공 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:true},{emoji:"📐",label:"뾰족 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"두루마리 휴지 🧻는 어떤 모양이에요?",desc:"두루마리 휴지 🧻는 어떤 모양이에요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"필통 ✏️은 어떤 모양이에요?",desc:"필통 ✏️은 어떤 모양이에요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"학교에서 본 물건과 같은 모양을 짝지어요",desc:"학교에서 본 물건과 같은 모양을 짝지어요"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"교실에서 본 물건을 같은 모양 통에 분류해 봐요!",desc:"교실에서 본 물건을 같은 모양 통에 분류해 봐요!"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"다른 물건들도 같은 모양 통에 분류해 봐요!",desc:"다른 물건들도 같은 모양 통에 분류해 봐요!"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"상자 📦 모양은 무엇과 닮았어요?",desc:"상자 📦 모양은 무엇과 닮았어요? (정답: 🎁 사물함 모양)",options:[{emoji:"🎁",label:"사물함 모양",correct:true},{emoji:"🥫",label:"둥근 기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:15}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"공 ⚽ 모양은 무엇과 닮았어요?",desc:"공 ⚽ 모양은 무엇과 닮았어요? (정답: 🔮 구슬 모양)",options:[{emoji:"🔮",label:"구슬 모양",correct:true},{emoji:"🥫",label:"딱풀 모양",correct:false},{emoji:"📦",label:"필통 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:15}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ①",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"3차시 — 모양의 특징(쌓기·굴리기)"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_shape_song", type:"video", icon:"🎥", title:"핑크퐁 모양 노래 (복습)", url:"https://www.youtube.com/results?search_query=핑크퐁+모양+노래", video_id:"", description:"지난 시간 도입 자리 영상 재활용. 도입 자리 복습 자리.", source:"핑크퐁 — 유튜브 검색", fit_slides:["motivate","review"]},
    {id:"q_fun_gym", type:"fun_question", icon:"💡", title:"체육관에는 또 무엇이?", content:"체육관에 가면 농구공·축구공·구슬 외에 또 어떤 모양 물건이 있을까? 매트(상자)·콘(기둥) 등도 찾아봐요.", fit_slides:["concept","real_world"]},
    {id:"q_fun_library", type:"fun_question", icon:"💡", title:"도서관에는 어떤 모양이?", content:"책은 모두 상자 모양일까? 두꺼운 책·얇은 책·작은 책 — 크기는 달라도 모양은 같아요.", fit_slides:["concept","real_world"]},
    {id:"m_4_spaces", type:"tip", icon:"🧩", title:"공간마다 다른 모양 분포", content:"체육관 = 공 모양 많음, 보건실 = 기둥 모양(약통) 많음, 도서관 = 상자 모양(책) 많음. 공간의 기능과 모양 분포 연결.", fit_slides:["concept","summary"]},
    {id:"m_outline_drawing", type:"tip", icon:"🧩", title:"테두리로 모양 보기", content:"물건의 테두리를 손가락으로 따라 그려 보면 어떤 모양인지 알 수 있어요. 두루마리 휴지 = 동그라미 + 직사각형.", fit_slides:["concept"]},
    {id:"r_gym", type:"real_world", icon:"🌍", title:"체육관의 공 모양", content:"체육 시간에 농구공·축구공·피구공을 봐요. 모두 어떤 방향이든 잘 굴러가요 — 이것이 공 모양의 특징.", fit_slides:["concept","real_world"]},
    {id:"r_pharmacy", type:"real_world", icon:"🌍", title:"약통과 두루마리 휴지", content:"보건실 약통·두루마리 휴지·물병 — 위·아래가 평평하고 옆은 둥근 기둥 모양. 한 방향으로 굴러가요.", fit_slides:["concept","real_world"]},
    {id:"r_books", type:"real_world", icon:"🌍", title:"책꽂이의 상자 모양", content:"교과서·동화책·노트 — 모두 펴면 직사각형, 두께가 있어 상자 모양. 평평한 면이 6개라 쌓기 쉬워요.", fit_slides:["concept","real_world","summary"]},
    {id:"g_4space_hunt", type:"game", icon:"🎮", title:"학교 4공간 모양 카드", content:"체육관·보건실·도서관·화장실 4 카드. 각 카드 자리에서 본 모양 카드를 짝지어요. 모둠 협동.", fit_slides:["game","summary"]},
    {id:"b_shape_at_school", type:"book", icon:"📖", title:"『학교에 숨은 모양들』", content:"학교 구석구석을 살피며 세 모양을 찾는 그림책. 4공간 자리 자리 활동과 자연 연결.", source:"국내 그림책 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"x_only_one_shape", type:"misconception", icon:"❓", title:"오개념 — 한 공간 = 한 모양?", content:"학생 중 \"체육관에는 공 모양만 있다\"고 생각하는 경우. 자세히 보면 매트(상자)·콘(기둥) 등 다양한 모양 공존.", fit_slides:["concept","advanced_problem"]},
    {id:"e_outdoor_shapes", type:"extension", icon:"⬆", title:"운동장으로 자리 확장", content:"교실 안에서 4공간을 봤으니 다음 시간 자리 전 운동장·놀이터에서도 모양을 찾아 봐요. 4차시 놀이터 예고.", fit_slides:["next_lesson","extension"]}
  ]
};

LESSONS["u2_l3"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 3,
    title: "여러 가지 모양을 알아볼까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 상자·기둥·공 모양 특징 알아보기 (감각 운동·굴리기·쌓기)",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_03_여러가지모양을알아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"여러 가지 모양을 알아볼까요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"상자 속에 뭐가 있을까?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 모양",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"상자 모양 📦",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"기둥 모양 🥫",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"공 모양 ⚽",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"세 모양을 비교해 봐요",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"뾰족한 부분과 평평한 부분이 있고, 잘 쌓이는 모양은 …",desc:"뾰족한 부분과 평평한 부분이 있고, 잘 쌓이는 모양은 무엇일까요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🌐",label:"동그란 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"공 모양 ⚽은 어떻게 굴러갈까요?",desc:"공 모양 ⚽은 어떻게 굴러갈까요? (정답: 🔄 여러 방향으로 잘 굴러가요)",options:[{emoji:"🚫",label:"굴러가지 않아요",correct:false},{emoji:"➡️",label:"한 방향만 굴러가요",correct:false},{emoji:"🔄",label:"여러 방향으로 잘 굴러가요",correct:true},{emoji:"⬆️",label:"위로만 굴러가요",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"어떤 모양이 잘 쌓일까요?",desc:"어떤 모양이 잘 쌓일까요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"어떤 모양이 굴러가지 않을까요?",desc:"어떤 모양이 굴러가지 않을까요? (정답: 📦 상자 모양)",options:[{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📦",label:"상자 모양",correct:true}],points:10}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"응용문제 자리",desc:"4단계 · 응용문제 1 · 다섯 고개"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"응용문제 자리",desc:"4단계 · 응용문제 2 · 다섯 고개"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"축구공 ⚽이 상자 📦 모양이면 어떻게 될까요?",desc:"축구공 ⚽이 상자 📦 모양이면 어떻게 될까요? (정답: 🚫 굴러가지 않아 축구하기 힘들어요)",options:[{emoji:"🚀",label:"더 빠르게 굴러가요",correct:false},{emoji:"🚫",label:"굴러가지 않아 축구하기 힘들어요",correct:true},{emoji:"💧",label:"물에 잘 떠요",correct:false},{emoji:"✨",label:"더 가벼워져요",correct:false}],points:15}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"물건과 어울리는 모양을 찾아 짝지어요",desc:"물건과 어울리는 모양을 찾아 짝지어요"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ①",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"4차시 — 놀이터에서 모양 조합"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_rolling_video", type:"video", icon:"🎥", title:"굴려보기 실험 영상", url:"https://www.youtube.com/results?search_query=공+기둥+상자+굴리기", video_id:"", description:"공·기둥·상자를 굴려 보는 실험 영상. 굴러가는 방향 자리 자리 명확히 보이기.", source:"교육 영상 — 유튜브 검색", fit_slides:["concept","real_world"]},
    {id:"q_fun_touch_box", type:"fun_question", icon:"💡", title:"보지 않고 만져서 알아맞히기", content:"눈을 가리고 상자·기둥·공을 차례로 만져 봐요. 평평한 면·뾰족한 부분·둥근 부분으로 어떤 모양인지 알 수 있나요?", fit_slides:["motivate","concept"]},
    {id:"q_fun_stack_high", type:"fun_question", icon:"💡", title:"가장 높이 쌓기 시합", content:"상자만·기둥만·공만 사용해서 가장 높이 쌓아 보기. 어느 모양이 가장 잘 쌓이고, 가장 안 쌓일까?", fit_slides:["concept","game"]},
    {id:"m_three_features", type:"tip", icon:"🧩", title:"세 모양 핵심 특징", content:"상자 = 평평한 면 6개·뾰족한 꼭지점 8개·쌓기 잘 됨·안 굴러감. 기둥 = 위·아래 평평·옆은 둥근·한 방향 굴러감. 공 = 모든 면 둥근·아무 방향 굴러감·쌓기 어려움.", fit_slides:["concept","summary"]},
    {id:"m_roll_or_stack", type:"tip", icon:"🧩", title:"굴리기 vs 쌓기 양면 자리", content:"공은 잘 굴러가지만 쌓기 어려워요. 상자는 쌓기 좋지만 안 굴러가요. 기둥은 양쪽 다 가능 — 한 방향 굴러가고 위·아래로 쌓이기도 해요.", fit_slides:["concept","summary"]},
    {id:"r_marble_run", type:"real_world", icon:"🌍", title:"구슬 놀이", content:"구슬은 공 모양. 어디로 굴릴지 모르고 사방으로 굴러가요. 경사면을 만들어 구슬 놀이를 해 보면 모양의 특성을 직접 체험.", fit_slides:["concept","real_world"]},
    {id:"r_lego_blocks", type:"real_world", icon:"🌍", title:"블록 쌓기", content:"레고·나무 블록은 대부분 상자 모양. 면이 평평해서 위로 잘 쌓이고 무너지지 않아요. 공 모양 블록이 적은 이유.", fit_slides:["concept","real_world"]},
    {id:"r_drink_can", type:"real_world", icon:"🌍", title:"음료수 캔 = 기둥", content:"콜라 캔·통조림은 모두 기둥 모양. 식탁에 세워두면 안 굴러가지만, 옆으로 눕히면 한 방향으로 굴러가요.", fit_slides:["concept","real_world"]},
    {id:"g_shape_charades", type:"game", icon:"🎮", title:"몸으로 모양 표현", content:"\"상자!\" 하면 손으로 네모 만들기, \"기둥!\" 하면 두 손을 위·아래 평평하게, \"공!\" 하면 두 손을 둥글게. 빠르게 따라하는 자리.", fit_slides:["game","motivate"]},
    {id:"b_solid_shapes", type:"book", icon:"📖", title:"『둥근 것 모난 것』", content:"세상의 모양을 둥근 것·모난 것·뾰족한 것으로 살피는 그림책. 모양의 특징 자리 인식 자리 자리.", source:"국내 그림책 — 도서관 확인", fit_slides:["motivate","concept"]},
    {id:"x_3d_vs_2d", type:"misconception", icon:"❓", title:"오개념 — 동그라미 = 공?", content:"동그라미(평면)와 공(입체)을 혼동하는 학생. 종이 위 동그라미는 굴러갈 수 없지만, 진짜 공은 굴러간다는 차이 알리기. 평면도형은 3학년에서 자세히.", fit_slides:["concept","advanced_problem"]},
    {id:"e_kindergarten_link", type:"extension", icon:"⬆", title:"누리과정 연결", content:"5세 누리과정에서 이미 입체도형을 구별해 봤어요. 학교 수학에서는 그 경험을 발전시켜요. 부모님·유치원 선생님과 이야기 나누기.", fit_slides:["motivate"]}
  ]
};

LESSONS["u2_l4"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 4,
    title: "여러 가지 모양으로 만들어 볼까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 놀이터(미끄럼틀·시소·그네) 속 모양 발견 + 모양 조합",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_04_여러가지모양으로만들어볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"여러 가지 모양으로 만들어 볼까요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"놀이터에 어떤 모양이 보일까?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 모양 특징",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"미끄럼틀에 숨은 모양 🛝",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"시소에 숨은 모양 ⚖️",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"그네에 숨은 모양 🪢",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"모양마다 어울리는 자리",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"시소 ⚖️ 받침대로 어떤 모양이 좋을까요?",desc:"시소 ⚖️ 받침대로 어떤 모양이 좋을까요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"뾰족 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"위로 차곡차곡 쌓아서 탑 🏗️을 만들기 좋은 모양은?",desc:"위로 차곡차곡 쌓아서 탑 🏗️을 만들기 좋은 모양은? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🔮",label:"구슬 모양",correct:false},{emoji:"🌐",label:"동그란 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"의자 좌석판처럼 평평한 자리에 어울리는 모양은?",desc:"의자 좌석판처럼 평평한 자리에 어울리는 모양은? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"받침대로 어울리지 않는 모양은 어떤 것일까요?",desc:"받침대로 어울리지 않는 모양은 어떤 것일까요? (정답: 📦 상자 모양)",options:[{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"📦",label:"상자 모양",correct:true}],points:10}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"시소 ⚖️를 만들어요! 받침대·좌석판 자리에 어울리는 …",desc:"시소 ⚖️를 만들어요! 받침대·좌석판 자리에 어울리는 모양을 골라요"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"미끄럼틀 🛝을 만들어요! 계단·통로 자리에 어울리는 모…",desc:"미끄럼틀 🛝을 만들어요! 계단·통로 자리에 어울리는 모양을 골라요"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"축구공 ⚽이 상자 📦 모양이 된다면 친구들과 어떻게 놀…",desc:"축구공 ⚽이 상자 📦 모양이 된다면 친구들과 어떻게 놀까요? (정답: 🏗️ 차기 어렵지만 탑 쌓기는 잘해요)",options:[{emoji:"🚀",label:"더 빠르게 굴러가요",correct:false},{emoji:"🏗️",label:"차기 어렵지만 탑 쌓기는 잘해요",correct:true},{emoji:"💧",label:"물에 잘 떠요",correct:false},{emoji:"✨",label:"더 가벼워져요",correct:false}],points:15}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구들이 만든 놀이 기구에 가장 많이 쓴 모양을 짝지어…",desc:"친구들이 만든 놀이 기구에 가장 많이 쓴 모양을 짝지어요"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ①",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"5차시 — 모양 찾기 놀이(메모리 카드)"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_playground", type:"video", icon:"🎥", title:"놀이터 모양 살펴보기", url:"https://www.youtube.com/results?search_query=놀이터+모양+찾기+유아", video_id:"", description:"놀이터 기구(미끄럼틀·시소·그네) 자리에 어떤 모양이 숨어있는지 살펴보는 영상.", source:"교육 영상 — 유튜브 검색", fit_slides:["motivate","concept"]},
    {id:"q_fun_my_playground", type:"fun_question", icon:"💡", title:"우리 놀이터에 어떤 모양?", content:"학교·동네 놀이터에 가서 미끄럼틀·시소·그네·정글짐을 자세히 보면 어떤 모양이 보이나요? 핸드폰으로 사진 한 장 찍어 오기.", fit_slides:["motivate","real_world"]},
    {id:"q_fun_build_with_shapes", type:"fun_question", icon:"💡", title:"세 모양으로 만들 수 있는 것", content:"상자·기둥·공만으로 우리가 만들 수 있는 것은 무엇일까? 자동차·로봇·기차·집을 그려 봐요.", fit_slides:["advanced_problem","game"]},
    {id:"m_combination", type:"tip", icon:"🧩", title:"여러 모양 조합", content:"하나의 물건도 여러 모양이 합쳐져 있어요. 미끄럼틀 = 상자 모양 계단 + 기울어진 미끄럼 면 + 기둥 모양 손잡이. 부분으로 나눠 보기.", fit_slides:["concept","summary"]},
    {id:"m_shape_function", type:"tip", icon:"🧩", title:"모양과 기능", content:"모양마다 어울리는 자리가 달라요. 굴러가야 하는 자리 = 공·기둥. 안 굴러가야 하는 자리 = 상자. 쌓아야 하는 자리 = 상자.", fit_slides:["concept","advanced_problem"]},
    {id:"r_slide", type:"real_world", icon:"🌍", title:"미끄럼틀에 숨은 모양", content:"미끄럼틀의 받침대(상자)·기둥·미끄럼 면(상자 변형)·손잡이(기둥). 안전을 위해 뾰족한 부분은 둥글게 처리한 것도 살피기.", fit_slides:["concept","real_world"]},
    {id:"r_seesaw", type:"real_world", icon:"🌍", title:"시소의 기둥과 막대", content:"시소의 가운데 받침대 = 기둥 모양. 위에 얹힌 막대 = 길쭉한 상자 모양. 가운데가 둥글어야 잘 움직여요.", fit_slides:["concept","real_world"]},
    {id:"r_swing", type:"real_world", icon:"🌍", title:"그네의 기둥과 손잡이", content:"그네 양옆 기둥 = 기둥 모양. 손잡이를 잡는 부분도 둥근 기둥. 모양마다 안전·기능에 맞춰 쓰여요.", fit_slides:["concept","real_world"]},
    {id:"g_build_with_blocks", type:"game", icon:"🎮", title:"세 모양으로 작품 만들기", content:"상자·기둥·공 블록을 활용해 자유롭게 작품 만들기. 모둠 자리 — 만들고 친구에게 어떤 모양 몇 개 썼는지 설명.", fit_slides:["game","advanced_problem"]},
    {id:"b_playground_book", type:"book", icon:"📖", title:"『놀이터에 숨은 모양』", content:"놀이터 기구마다 숨은 모양을 찾는 그림책. 본 차시 자리 학습 흐름과 자연 연결.", source:"국내 그림책 — 도서관 확인", fit_slides:["motivate","concept"]},
    {id:"x_pure_shape", type:"misconception", icon:"❓", title:"오개념 — 순수한 한 모양?", content:"학생 중 \"미끄럼틀은 상자 모양\"이라고 단정하는 경우. 실제 물건은 여러 모양의 조합이라는 점 알리기. 부분을 나눠 보기.", fit_slides:["concept","advanced_problem"]},
    {id:"e_park_outing", type:"extension", icon:"⬆", title:"공원 외출 학습", content:"주말에 가족과 공원 가서 놀이 기구·벤치·휴지통 모양을 살펴보고 이야기. 단원 실천 활동 자리에 한 칸 색칠.", fit_slides:["next_lesson","extension"]}
  ]
};

LESSONS["u2_l5"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 5,
    title: "모양 찾기 놀이를 해 볼까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 메모리 카드 게임 (3 모양 색 코딩 + 카드 뒤집기 짝 맞추기)",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_05_모양찾기놀이를해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"모양 찾기 놀이를 해 볼까요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"카드에는 어떤 물건들이?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 세 모양",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"모양마다 다른 색깔로",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"두 카드도 색칠해 보면?",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"카드 뒤집기 놀이 방법",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"한번 같이 해 볼까요?",desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"이 세 카드는 모두 어느 모양인가요?",desc:"이 세 카드는 모두 어느 모양인가요? (정답:  기둥)",options:[{emoji:"",label:"상자",correct:false},{emoji:"",label:"기둥",correct:true},{emoji:"",label:"공",correct:false},{emoji:"",label:"모르겠어요",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"이 세 카드는 모두 어느 모양인가요?",desc:"이 세 카드는 모두 어느 모양인가요? (정답:  상자)",options:[{emoji:"",label:"상자",correct:true},{emoji:"",label:"기둥",correct:false},{emoji:"",label:"공",correct:false},{emoji:"",label:"모르겠어요",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"이 세 카드는 모두 어느 모양인가요?",desc:"이 세 카드는 모두 어느 모양인가요? (정답:  공)",options:[{emoji:"",label:"상자",correct:false},{emoji:"",label:"기둥",correct:false},{emoji:"",label:"공",correct:true},{emoji:"",label:"모르겠어요",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"도시락은 어느 모양인가요?",desc:"도시락은 어느 모양인가요? (정답:  상자)",options:[{emoji:"",label:"상자",correct:true},{emoji:"",label:"기둥",correct:false},{emoji:"",label:"공",correct:false},{emoji:"",label:"모르겠어요",correct:false}],points:10}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"같은 모양 찾기 놀이",desc:"4단계 · 응용문제 1"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"딱풀과 약병의 같은 점은?",desc:"딱풀과 약병의 같은 점은? (정답:  둘 다 기둥 모양)",options:[{emoji:"",label:"둘 다 기둥 모양",correct:true},{emoji:"",label:"둘 다 상자 모양",correct:false},{emoji:"",label:"둘 다 공 모양",correct:false},{emoji:"",label:"같은 점 없음",correct:false}],points:15}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"딱풀과 수납장의 다른 점은?",desc:"딱풀과 수납장의 다른 점은? (정답:  딱풀은 굴러가요)",options:[{emoji:"",label:"딱풀은 굴러가요",correct:true},{emoji:"",label:"딱풀은 공 모양",correct:false},{emoji:"",label:"딱풀은 크기가 커요",correct:false},{emoji:"",label:"다른 점 없음",correct:false}],points:15}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"응용문제 자리",desc:"4단계 · 응용문제 4"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"6차시 — 단원 평가"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_memory_game", type:"video", icon:"🎥", title:"카드 짝 맞추기 놀이 영상", url:"https://www.youtube.com/results?search_query=어린이+카드+짝맞추기+놀이", video_id:"", description:"메모리 카드 놀이 방법 영상. 카드 뒤집기·짝 맞추기·집중력 자리 자리.", source:"교육 영상 — 유튜브 검색", fit_slides:["motivate","game"]},
    {id:"q_fun_color_code", type:"fun_question", icon:"💡", title:"왜 같은 색깔로?", content:"상자 모양 = 연두, 기둥 모양 = 분홍, 공 모양 = 노랑. 왜 같은 모양은 같은 색으로 칠할까? 색이 모양을 알려주는 신호.", fit_slides:["concept","motivate"]},
    {id:"q_fun_make_cards", type:"fun_question", icon:"💡", title:"우리만의 카드 만들기", content:"집에서 종이를 잘라 모양 카드를 만들어 봐요. 그림을 그리고 색을 칠해 가족과 함께 짝 맞추기 놀이.", fit_slides:["game","extension"]},
    {id:"m_memory_skill", type:"tip", icon:"🧩", title:"기억력 자리 자리", content:"카드 위치를 기억하면 더 빨리 짝을 찾을 수 있어요. 처음 뒤집어 본 카드 위치는 머릿속에 살짝 표시.", fit_slides:["game","summary"]},
    {id:"m_pair_strategy", type:"tip", icon:"🧩", title:"짝 찾기 전략", content:"같은 색 카드 = 같은 모양. 가장 자신 있는 모양부터 짝지어요. 친구 차례에 친구가 본 카드 위치도 같이 기억.", fit_slides:["game"]},
    {id:"r_card_in_life", type:"real_world", icon:"🌍", title:"우리 주변의 카드들", content:"전철 카드·도서관 카드·식당 메뉴판 — 카드는 정보를 빠르게 알려주는 자리. 모양 카드도 모양 정보를 한눈에 알려줘요.", fit_slides:["motivate","real_world"]},
    {id:"r_concentration_game", type:"real_world", icon:"🌍", title:"집중력 놀이의 가치", content:"메모리 게임 = 집중력·기억력을 길러주는 자리. 1학년 때부터 자주 하면 공부 자리 자리 자리 도움.", fit_slides:["motivate","game"]},
    {id:"g_memory_match_basic", type:"game", game_kind:"memory_match", icon:"🎮", title:"기본 짝 맞추기 — 같은 모양", description:"같은 모양 카드끼리 짝을 찾아요.", content:"6장(3쌍): 상자×2·기둥×2·공×2 카드를 뒤집어 놓고 같은 모양을 찾는 자리.", hint:"같은 색 = 같은 모양.", pairs:[
      { a:{emoji:"📦",label:"상자"}, b:{emoji:"🎁",label:"선물상자"} },
      { a:{emoji:"🥫",label:"기둥"}, b:{emoji:"🧻",label:"두루마리"} },
      { a:{emoji:"⚽",label:"공"}, b:{emoji:"🏀",label:"농구공"} }
    ], fit_slides:["game","advanced_problem"]},
    {id:"g_memory_match_object_shape", type:"game", game_kind:"memory_match", icon:"🎮", title:"확장 짝 맞추기 — 물건과 모양", description:"물건과 모양 카드를 짝지어요.", content:"4쌍 자리. 한쪽 = 물건 그림 / 다른쪽 = 모양 이름 카드.", hint:"물건이 어떤 모양인지 생각하고 짝을 찾아요.", pairs:[
      { a:{emoji:"📚",label:"책"}, b:{text:"상자 모양"} },
      { a:{emoji:"🥤",label:"음료수"}, b:{text:"기둥 모양"} },
      { a:{emoji:"🏀",label:"농구공"}, b:{text:"공 모양"} },
      { a:{emoji:"🎲",label:"주사위"}, b:{text:"상자 모양"} }
    ], fit_slides:["game","match"]},
    {id:"b_card_book", type:"book", icon:"📖", title:"『짝을 찾아 봐요』", content:"짝 찾기 그림책. 모양·색·크기 등 다양한 분류 기준으로 짝을 찾는 자리 자리.", source:"국내 그림책 — 도서관 확인", fit_slides:["motivate","game"]},
    {id:"x_color_only", type:"misconception", icon:"❓", title:"오개념 — 색만 보고 짝?", content:"색만 보고 카드를 짝짓는 경우. 색은 단서지만 모양 자체를 확인해야 한다는 점 알리기. 색 단서가 없는 카드도 풀어 보기.", fit_slides:["game","advanced_problem"]},
    {id:"e_more_cards", type:"extension", icon:"⬆", title:"카드 자리 더 만들기", content:"오늘은 6~8장. 익숙해지면 10~12장, 16장으로 늘려요. 학년이 올라가면 평면도형·숫자 카드로 확장.", fit_slides:["next_lesson","game"]}
  ]
};

LESSONS["u2_l6"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 6,
    title: "수학이랑 확인해요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 단원 평가 (분류·추론·짝짓기·색 코딩 종합)",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_06_수학이랑확인해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"수학이랑 확인해요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"지금까지 배운 것",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"오늘 풀어 볼 문제 4가지",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"평가 1번 — 분류하기 1",desc:"기둥 모양 물건을 골라요"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"평가 1번 — 분류하기 2",desc:"상자 모양 물건을 골라요"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"평가 1번 — 분류하기 3",desc:"공 모양 물건을 골라요"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"평가 1번 종합 — 세 모양 정리",desc:"분류 결과 확인"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"\"뾰족한 부분이 있고 쉽게 쌓을 수 있어요 \" 어떤 모…",desc:"\"뾰족한 부분이 있고 쉽게 쌓을 수 있어요 \" 어떤 모양일까요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🔮",label:"구슬 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"\" 어떤 방향이든 잘 굴러가요 평평한 부분이 없어요\" …",desc:"\" 어떤 방향이든 잘 굴러가요 평평한 부분이 없어요\" 어떤 모양일까요? (정답: ⚽ 공 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:true},{emoji:"📐",label:"세모 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"\" 한 방향으로만 잘 굴러가요 위·아래는 평평해요\" 어…",desc:"\" 한 방향으로만 잘 굴러가요 위·아래는 평평해요\" 어떤 모양일까요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🔵",label:"동그란 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"\"평평한 부분만 있어요 잘 굴러가지 않아요 \" 어떤 모…",desc:"\"평평한 부분만 있어요 잘 굴러가지 않아요 \" 어떤 모양일까요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🟡",label:"둥근 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"물건과 같은 모양을 골라 봐요",desc:"물건과 같은 모양을 골라 봐요"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"다른 물건도 짝지어 봐요",desc:"다른 물건도 짝지어 봐요"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"놀이터 물건 을 알맞은 색으로 표시해요",desc:"놀이터 물건 을 알맞은 색으로 표시해요"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"운동장 물건 도 같은 색으로 표시해요",desc:"운동장 물건 도 같은 색으로 표시해요"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"self_assessment", data:{title:"스스로 평가해요",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"단원에서 배운 3가지 모양",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고",desc:"7차시 — 재활용품으로 작품 만들기"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_unit_review", type:"video", icon:"🎥", title:"세 모양 복습 영상", url:"https://www.youtube.com/results?search_query=직육면체+원기둥+구+모양", video_id:"", description:"단원 핵심 자리 정리 영상. 평가 자리 자리 앞 자신감 자리.", source:"교육 영상 — 유튜브 검색", fit_slides:["motivate","review"]},
    {id:"q_fun_team_quiz", type:"fun_question", icon:"💡", title:"모둠 모양 퀴즈", content:"4~5명이 한 모둠. 한 학생이 \"상자\" 외치면 다른 학생들이 그 모양 물건을 빠르게 찾기. 점수 X, 즐겁게.", fit_slides:["motivate","game"]},
    {id:"q_fun_riddle", type:"fun_question", icon:"💡", title:"모양 스무 고개", content:"\"평평한 면이 있나요?\" \"굴러가나요?\" 같은 질문을 하면서 친구가 생각한 모양 알아내기. 모양 특징을 활용한 추론 자리.", fit_slides:["motivate","advanced_problem"]},
    {id:"m_eval_attitude", type:"tip", icon:"🧩", title:"평가는 점수가 X", content:"평가는 자기를 알아가는 자리. 점수보다 어디가 어렵고 어디가 자신 있는지 확인하는 자리.", fit_slides:["motivate","self_assessment"]},
    {id:"m_review_3shape", type:"tip", icon:"🧩", title:"세 모양 한 줄 정리", content:"상자 = 평평·뾰족·안 굴러. 기둥 = 위아래 평평·옆 둥근·한 방향 굴러. 공 = 모두 둥근·아무 방향 굴러. 평가 자리 앞 한 번 더.", fit_slides:["review","summary"]},
    {id:"r_eval_meaning", type:"real_world", icon:"🌍", title:"건강검진 같은 자리", content:"평가는 건강검진처럼 자기 상태를 확인하는 자리. 못한 부분 = 다시 배우면 돼요. 부끄러운 자리 X.", fit_slides:["motivate","self_assessment"]},
    {id:"r_classroom_review", type:"real_world", icon:"🌍", title:"교실 한 바퀴 복습", content:"교실을 한 바퀴 돌면서 세 모양 물건을 손가락으로 가리켜요. 다 가리킬 수 있으면 단원 자리 자리 자리 자리.", fit_slides:["motivate","summary"]},
    {id:"g_review_relay", type:"game", icon:"🎮", title:"이어달리기 복습", content:"줄을 만들어 한 학생씩 \"상자·기둥·공\" 차례로 외치고 그 모양 물건을 1초 안에 가리키기. 늦으면 처음부터.", fit_slides:["game","review"]},
    {id:"g_eval_card_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"평가 자리 짝 맞추기", description:"단원에서 배운 모양들을 짝지어요.", content:"5쌍 자리 — 모양 이름·물건·특징을 짝지어요.", hint:"단원 전체에서 배운 자리들을 떠올려요.", pairs:[
      { a:{text:"상자"}, b:{emoji:"🎁",label:"선물상자"} },
      { a:{text:"기둥"}, b:{emoji:"🥫",label:"통조림"} },
      { a:{text:"공"}, b:{emoji:"⚽",label:"축구공"} },
      { a:{text:"잘 굴러요"}, b:{emoji:"⚽",label:"공"} },
      { a:{text:"잘 쌓여요"}, b:{emoji:"📦",label:"상자"} }
    ], fit_slides:["match","game"]},
    {id:"b_eval_book", type:"book", icon:"📖", title:"『모양과 만난 첫 책』", content:"단원 마무리 자리 그림책. 세 모양 전체 복습 + 일상 자리.", source:"국내 그림책 — 도서관 확인", fit_slides:["summary","motivate"]},
    {id:"x_eval_fear", type:"misconception", icon:"❓", title:"오개념 — 평가 = 무서운 것?", content:"평가를 무섭게 받아들이는 학생. 평가는 자기를 더 알아가는 자리임을 안내. 못해도 다시 배우면 돼요.", fit_slides:["motivate","self_assessment"]},
    {id:"e_to_unit3", type:"extension", icon:"⬆", title:"다음 단원 예고", content:"3단원 — 덧셈과 뺄셈. 모양 단원에서 익힌 \"여러 개 합치기·나누기\" 감각이 덧셈·뺄셈으로 자연 자리.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u2_l7"] = {
  meta: {
    grade: 1, subject: "수학", unit: 2, n: 7,
    title: "수학이랑 만들어요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 재활용품으로 모양 작품 만들기 (드래그 구성·고무찰흙 변형)",
    live_url: "../../grade1/semester1/math/2단원_여러가지모양/g1_math_u2_07_수학이랑만들어요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"수학이랑 만들어요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"친구들이 만들고 있어요",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"학교에는 어떤 곳이 있나요?",desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 모양 만들기 1"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 모양 만들기 2"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 모양 만들기 3"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"재활용품도 모양이 있어요",desc:"2단계 · 전개 · 재활용품"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"🍪 과자 상자는 어떤 모양 일까요?",desc:"🍪 과자 상자는 어떤 모양 일까요? (정답: 📦 상자 모양)",options:[{emoji:"📦",label:"상자 모양",correct:true},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🔵",label:"동그란 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"🧻 휴지 심은 어떤 모양 일까요?",desc:"🧻 휴지 심은 어떤 모양 일까요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"📐",label:"세모 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"🔮 구슬은 어떤 모양 일까요?",desc:"🔮 구슬은 어떤 모양 일까요? (정답: ⚽ 공 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:false},{emoji:"⚽",label:"공 모양",correct:true},{emoji:"🟦",label:"네모 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"긴 빨대 같은 수수깡 은 어떤 모양일까요?",desc:"긴 빨대 같은 수수깡 은 어떤 모양일까요? (정답: 🥫 기둥 모양)",options:[{emoji:"📦",label:"상자 모양",correct:false},{emoji:"🥫",label:"기둥 모양",correct:true},{emoji:"⚽",label:"공 모양",correct:false},{emoji:"🔺",label:"세모 모양",correct:false}],points:10}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"📚 도서관 책상을 만들어요! 알맞은 재활용품을 골라요",desc:"📚 도서관 책상을 만들어요! 알맞은 재활용품을 골라요"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"🪑 교실 의자를 만들어요! 알맞은 재활용품을 골라요",desc:"🪑 교실 의자를 만들어요! 알맞은 재활용품을 골라요"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"🚪 화장실 문을 만들어요! 알맞은 재활용품을 골라요",desc:"🚪 화장실 문을 만들어요! 알맞은 재활용품을 골라요"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구가 둥근 구슬 4개 를 이어 붙여 만들었어요! 어디…",desc:"친구가 둥근 구슬 4개 를 이어 붙여 만들었어요! 어디에 쓰는 것일까요? (정답: ⚽ 운동장)",options:[{emoji:"📚",label:"도서관",correct:false},{emoji:"🪑",label:"교실",correct:false},{emoji:"⚽",label:"운동장",correct:true},{emoji:"🚪",label:"복도",correct:false}],points:15}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"self_assessment", data:{title:"스스로 평가해요",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"2단원에서 배운 것",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"단원 마무리",desc:"다음 단원 — 3단원 덧셈과 뺄셈"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_recycle_art", type:"video", icon:"🎥", title:"재활용품으로 만들기 영상", url:"https://www.youtube.com/results?search_query=재활용품+만들기+초등", video_id:"", description:"빈 상자·페트병·캔으로 작품 만들기 영상. 모양 활용 자리 자리.", source:"교육 영상 — 유튜브 검색", fit_slides:["motivate","concept"]},
    {id:"q_fun_my_creation", type:"fun_question", icon:"💡", title:"나만의 작품 아이디어", content:"빈 상자·페트병·신문지로 무엇을 만들고 싶나요? 로봇·자동차·기차·건물 — 그림을 먼저 그려 봐요.", fit_slides:["motivate","advanced_problem"]},
    {id:"q_fun_home_recycle", type:"fun_question", icon:"💡", title:"집에서 재활용품 모으기", content:"집에서 빈 우유팩·과자 상자·휴지심을 모아 보기. 일주일 모으면 어떤 모양이 몇 개? 부모님과 함께 분리수거.", fit_slides:["real_world","extension"]},
    {id:"m_design_first", type:"tip", icon:"🧩", title:"먼저 설계하고 만들기", content:"바로 만들기보다 종이에 먼저 그려 봐요. 어떤 모양 몇 개가 필요한지 미리 정해 두면 작업이 빨라요.", fit_slides:["motivate","advanced_problem"]},
    {id:"m_shape_to_part", type:"tip", icon:"🧩", title:"부분으로 나눠 보기", content:"로봇 = 상자(몸통) + 기둥(팔다리) + 공(머리). 만들고 싶은 작품을 모양 단위로 분해해서 생각해 봐요.", fit_slides:["advanced_problem","summary"]},
    {id:"r_recycle_separation", type:"real_world", icon:"🌍", title:"분리수거와 모양", content:"분리수거장에 가면 종이(상자·우유팩)·플라스틱(페트병·통)·캔(기둥)·유리(병)가 모양별로 모여 있어요. 모양은 환경에도 영향.", fit_slides:["real_world","concept"]},
    {id:"r_factory_shape", type:"real_world", icon:"🌍", title:"공장에서 만들어지는 모양", content:"음료수 캔은 모두 기둥 모양인 이유 = 잘 쌓이고 잘 굴러 운반 효율적. 모양은 기능과 깊이 연결.", fit_slides:["concept","extension"]},
    {id:"g_team_build", type:"game", icon:"🎮", title:"모둠 작품 만들기", content:"4~5명이 한 모둠. 재활용품을 모아 30분 자리 작품 만들기. 마지막에 다른 모둠과 작품을 소개해요.", fit_slides:["game","advanced_problem"]},
    {id:"g_shape_clay", type:"game", icon:"🎮", title:"고무찰흙 모양 변형", content:"고무찰흙으로 공을 만들고 → 굴려서 기둥으로 → 눌러서 상자로 변형. 같은 양으로 세 모양 모두 만들어 보기.", fit_slides:["game","concept"]},
    {id:"b_recycle_book", type:"book", icon:"📖", title:"『빈 통의 변신』", content:"버려질 뻔한 빈 통들이 작품으로 변신하는 그림책. 재활용·창의·모양을 함께 배움.", source:"국내 그림책 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"x_must_buy", type:"misconception", icon:"❓", title:"오개념 — 사야 만들어요?", content:"학생 중 \"새 재료를 사야 한다\"고 생각하는 경우. 집에 있는 재활용품도 충분히 좋은 재료라는 점 알리기.", fit_slides:["motivate"]},
    {id:"e_to_unit3_2", type:"extension", icon:"⬆", title:"단원 종결 + 다음 단원", content:"2단원 자리 자리. 다음 3단원 = 덧셈과 뺄셈 — 모양 개수를 세고 합치는 자리 자리.", fit_slides:["next_lesson","summary"]}
  ]
};
