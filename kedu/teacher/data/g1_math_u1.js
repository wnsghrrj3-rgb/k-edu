/* ============================================================
   1학년 1학기 수학 — 1단원 「9까지의 수」 (12차시)
   양산 자리 — LESSONS["u1_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 정리·케이티처 채팅 자리
   다른 단원 .js (g1_math_u2.js ~ u6.js) = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   2026-05-15 cycle 16 — 8 차시 1차 양산 (18슬 인덱스)
   2026-05-15 cycle 17 — l01·l12 추가
   2026-05-15 cycle 19 — 슬라이드 풍부화 (data 필드 시각 자료 props + extras 양산)
   옛 LESSONS["u1_l8"] 34슬 = archive/2026-05-15_u1_옛34슬_LESSONS_l8.js
============================================================ */

LESSONS["u1_l2~3"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "2~3",
    title: "1, 2, 3, 4, 5를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (블록 차시)",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l02_03.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"무엇을 셀까?", desc:"학용품·장난감 그림에서 셀 것 찾기", emojis:["✂️","📝","📓","⚽","🐶"], question:"우리 주변에 셀 수 있는 것은 무엇일까요?"}, suggested_extras:["v_count_song_kor","q_fun_classroom"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"오늘은 **1부터 5까지의 수**를 배우고 써 봐요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기", content:"입학 전에 수를 세어 본 적 있어요? 몇 살이에요? 손가락 몇 개?"}, suggested_extras:["q_fun_age"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"1과 2를 알아봐요", items:[{emoji:"✂️", count:1, dots:1, label:"1 — 하나·일"},{emoji:"🟦", count:2, dots:2, label:"2 — 둘·이"}], note:"일대일대응 동그라미로 같이 세어요"}, suggested_extras:["m_one_to_one"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"3과 4를 알아봐요", items:[{emoji:"✏️", count:3, dots:3, label:"3 — 셋·삼"},{emoji:"📓", count:4, dots:4, label:"4 — 넷·사"}]}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"5와 추상화", items:[{emoji:"🪨", count:5, dots:5, label:"공깃돌 5개"},{emoji:"🚗", count:5, dots:5, label:"자동차 5대"}], note:"종류는 달라도 둘 다 **5개** — 수는 종류와 상관없어요"}, suggested_extras:["x_object_vs_number","m_one_to_one"]},
    {id:"s07", stage:"전개", block:"trace", data:{title:"1·2·3·4·5 따라써 봐요", trace_numbers:[1,2,3,4,5], note:"점선 따라 시작점부터 화살표 방향대로"}, suggested_extras:["m_finger_writing"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"토끼 몇 마리?", emoji:"🐰", count:4, answer:4, input:"count_input"}, suggested_extras:["q_fun_pets"]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"비행기 몇 대?", emoji:"✈️", count:2, answer:2, input:"count_input"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"우주선 몇 대?", emoji:"🚀", count:5, answer:5, input:"count_input", note:"답한 뒤 우리말·한자어 두 가지로 읽어봐요"}, suggested_extras:["m_two_readings"]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"사물과 숫자 짝짓기", pairs:[{emoji:"🍎", num:1},{emoji:"🐶🐱", num:2},{emoji:"🌸🌸🌸", num:3},{emoji:"⭐⭐⭐⭐", num:4},{emoji:"🚗🚗🚗🚗🚗", num:5}], type:"touch_match"}, suggested_extras:["g_card_match"]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드 보고 그림 고르기", card:3, options:[{emoji:"🐶🐶", count:2},{emoji:"🐶🐶🐶", count:3, correct:true},{emoji:"🐶🐶🐶🐶", count:4},{emoji:"🐶🐶🐶🐶🐶", count:5}], type:"choice4_image"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"둘 다 4개인 것을 모두 골라요", options:[{emoji:"🍎🍎🍎🍎", count:4, correct:true},{emoji:"🍌🍌🍌🍌", count:4, correct:true},{emoji:"🌸🌸🌸", count:3},{emoji:"⭐⭐⭐⭐⭐", count:5}], expectedCount:2, note:"추상화 검증 — 종류가 달라도 같은 수일 수 있어요"}, suggested_extras:["x_object_vs_number"]},
    {id:"s14", stage:"응용문제", block:"match", data:{title:"숫자와 두 가지 읽기 짝짓기", target:3, pairs:[{label:"셋", kind:"우리말"},{label:"삼", kind:"한자어"}], type:"touch_match"}, suggested_extras:["g_num_word_match","m_two_readings","r_phone_number"]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"빠진 수 찾기", sequence:[1,2,3,"?",5], answer:4, input:"count_input"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", table:[{num:1, kor:"하나", han:"일"},{num:2, kor:"둘", han:"이"},{num:3, kor:"셋", han:"삼"},{num:4, kor:"넷", han:"사"},{num:5, kor:"다섯", han:"오"}]}, suggested_extras:["b_number_book"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["수 세기를 잘했어요","수 쓰기를 잘했어요","두 가지 읽기를 잘했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"다음에는 **6, 7, 8, 9**를 배워요"}, suggested_extras:["e_above_5"]}
  ],
  extras: [
    {id:"v_count_song_kor", type:"video", icon:"🎥", title:"핑크퐁 1-10 숫자송", url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id:"Qxi-dPmsl-Q", description:"1부터 10까지 노래로 익히기. 도입 자리 흥미 유발.", source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상", fit_slides:["motivate","review"]},
    {id:"q_fun_classroom", type:"fun_question", icon:"💡", title:"교실 안에서 5개씩 찾기", content:"교실을 둘러보면서 5개인 것을 찾아봐요. 책 5권? 의자 5개? 시계 5개? 친구와 같이 찾아봐요.", fit_slides:["motivate","real_world"]},
    {id:"q_fun_age", type:"fun_question", icon:"💡", title:"나이로 수 익히기", content:"몇 살이에요? 7살이면 1·2·3·4·5·6·7 — 손가락 7개. 동생은? 형은?", fit_slides:["review","motivate"]},
    {id:"q_fun_pets", type:"fun_question", icon:"💡", title:"토끼 가족 이야기", content:"토끼 엄마가 1마리, 아빠가 1마리, 아기 토끼가 2마리 있어요. 모두 몇 마리?", fit_slides:["basic_problem","motivate"]},
    {id:"m_one_to_one", type:"tip", icon:"🧩", title:"일대일대응으로 세기", content:"사물 하나에 동그라미 하나씩 짝지어요. 빠뜨리지 않고 정확히 세는 법. 손가락 짚으며 세기도 같은 원리.", fit_slides:["concept","compare"]},
    {id:"m_two_readings", type:"tip", icon:"🧩", title:"우리말·한자어 두 가지 읽기", content:"3 = 셋(우리말) / 삼(한자어). 사물 셀 때는 우리말('사과 세 개'), 순서·전화번호는 한자어('3층, 삼번'). 두 가지 모두 일상에서 자주 써요.", fit_slides:["concept","real_world"]},
    {id:"m_finger_writing", type:"tip", icon:"🧩", title:"필순 손가락으로 따라하기", content:"점선만 따라가지 말고, 손가락으로 허공에 한 번 써본 뒤 종이에 쓰면 기억이 잘 돼요.", fit_slides:["trace","concept"]},
    {id:"r_phone_number", type:"real_world", icon:"🌍", title:"전화번호 읽기", content:"010-1234-5678 같은 전화번호는 한자어로 읽어요(공일공·일이삼사·오륙칠팔). 우리집·엄마 전화번호 읽어보기.", fit_slides:["real_world","concept"]},
    {id:"r_finger_count", type:"real_world", icon:"🌍", title:"손가락으로 세기", content:"한 손에 손가락 5개. 1·2·3·4·5 — 손가락 펴면서 세기. 가장 가까운 수 세기 도구.", fit_slides:["concept","real_world"]},
    {id:"g_card_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"수 카드 짝짓기 놀이", description:"수 카드와 그림 카드의 같은 짝을 찾아보세요.", content:"수 카드 1~5와 그림 카드(사물 1~5개) 5쌍을 뒤집어 놓고 같은 짝 찾기. 메모리 게임 형식.", hint:"같은 수끼리 짝을 맞춰 보세요.", pairs:[
      { a:{text:"1"}, b:{emoji:"✏️", count:1} },
      { a:{text:"2"}, b:{emoji:"📕", count:2} },
      { a:{text:"3"}, b:{emoji:"⚽", count:3} },
      { a:{text:"4"}, b:{emoji:"✂️", count:4} },
      { a:{text:"5"}, b:{emoji:"🎲", count:5} }
    ], fit_slides:["match","game"]},
    {id:"g_num_word_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"숫자와 우리말 읽기 짝짓기", description:"숫자와 우리말 읽기의 짝을 찾아보세요.", content:"숫자 1~5와 우리말 읽기(하나·둘·셋·넷·다섯)를 뒤집어 놓고 짝 찾기.", hint:"숫자를 우리말로 읽어 보고 짝을 찾아요.", pairs:[
      { a:{text:"1"}, b:{text:"하나"} },
      { a:{text:"2"}, b:{text:"둘"} },
      { a:{text:"3"}, b:{text:"셋"} },
      { a:{text:"4"}, b:{text:"넷"} },
      { a:{text:"5"}, b:{text:"다섯"} }
    ], fit_slides:["match","game"]},
    {id:"g_show_finger", type:"game", icon:"🎮", title:"손가락 빨리 들기", content:"교사가 '셋!' 외치면 손가락 3개를, '오!' 하면 5개를 빨리 드는 게임. 우리말·한자어 둘 다 사용.", fit_slides:["game","concept"]},
    {id:"b_number_book", type:"book", icon:"📖", title:"『숫자가 사라졌어요』 - 로렌 리디", content:"숫자가 사라진 세상 이야기로 수의 필요성·이름을 자연스럽게 배움.", source:"로렌 리디 / 비룡소", fit_slides:["motivate","summary"]},
    {id:"b_ten_apples", type:"book", icon:"📖", title:"『사과가 쿵!』", content:"사물이 하나씩 늘어나는 단순한 구조. 1·2·3·4·5 차례로 세는 그림책.", source:"국내 그림책 (도서관 확인)", fit_slides:["motivate","concept"]},
    {id:"x_object_vs_number", type:"misconception", icon:"❓", title:"오개념 — 종류가 다르면 수도 다르다?", content:"학생 중 사과 5개와 자동차 5개를 보고 '둘 다 다르니까 수도 다르다'고 답하는 경우. 일대일대응으로 짝지으면 둘 다 5라는 같은 수임을 보여주기.", fit_slides:["concept","multi"]},
    {id:"e_above_5", type:"extension", icon:"⬆", title:"5 다음은?", content:"5 다음은? 6·7·8·9 — 다음 차시(4~5차)에서 배워요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l4~5"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "4~5",
    title: "6, 7, 8, 9를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (블록 차시) — 십 배열판·연결 모형 도입",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l04_05.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"수가 5를 넘어가요", desc:"해바라기·풍선·물고기 풍경 (지도서 p.20-21)", emojis:["🌻","🎈","🐟"], question:"5보다 더 많은 것은 어떻게 셀까요?"}, suggested_extras:["v_count_song_kor","q_fun_garden"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"오늘은 **6·7·8·9**를 배우고 **십 배열판**으로 그려 봐요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 — 1~5 복습", content:"지난 시간 1·2·3·4·5와 우리말·한자어 두 가지 읽기를 떠올려 봐요", table:[{num:1,kor:"하나",han:"일"},{num:2,kor:"둘",han:"이"},{num:3,kor:"셋",han:"삼"},{num:4,kor:"넷",han:"사"},{num:5,kor:"다섯",han:"오"}]}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"6과 7을 알아봐요", items:[{ten_frame:6, num:6, label:"6 — 여섯·육", note:"5에 1 더"},{ten_frame:7, num:7, label:"7 — 일곱·칠", note:"5에 2 더"}], component:"ten_frame"}, suggested_extras:["m_ten_frame_5plus","m_ten_frame_tip"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"8과 9를 알아봐요", items:[{ten_frame:8, num:8, label:"8 — 여덟·팔", note:"5에 3 더"},{ten_frame:9, num:9, label:"9 — 아홉·구", note:"5에 4 더"}], component:"ten_frame"}, suggested_extras:["m_ten_frame_5plus"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"연결 모형 — 1~9 계단", linking_cube_staircase:{range:[1,9]}, note:"1부터 9까지 한 칸씩 더 쌓이며 커져요", component:"linking_cube"}, suggested_extras:["m_number_line"]},
    {id:"s07", stage:"전개", block:"trace", data:{title:"6·7·8·9 따라써 봐요", trace_numbers:[6,7,8,9], component:"trace_number"}, suggested_extras:["m_finger_writing"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판 6칸 — 몇 칸?", ten_frame:6, answer:6, input:"count_input"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판 9칸 — 몇 칸?", ten_frame:9, answer:9, input:"count_input"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"사물 7개 세어 봐요", emoji:"🐰", count:7, answer:7, input:"count_input", note:"답한 뒤 우리말·한자어 두 가지로 읽어요"}, suggested_extras:["m_two_readings"]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"십 배열판과 숫자 짝짓기", pairs:[{ten_frame:6,num:6},{ten_frame:7,num:7},{ten_frame:8,num:8},{ten_frame:9,num:9}], type:"touch_match"}, suggested_extras:["g_ten_frame_match"]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수만큼 십 배열판 채우기", target:8, component:"ten_frame", mode:"interactive", note:"숫자 8을 보고 ten_frame 8칸을 클릭으로 채워봐요"}, suggested_extras:["g_finger_show"]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"둘 다 7개인 것을 모두 골라요", options:[{emoji:"🍎",count:7,correct:true},{emoji:"🍌",count:7,correct:true},{emoji:"🌸",count:6},{emoji:"⭐",count:9}], expectedCount:2}, suggested_extras:["x_object_vs_number"]},
    {id:"s14", stage:"응용문제", block:"match", data:{title:"숫자와 두 가지 읽기 짝짓기", target:8, pairs:[{label:"여덟",kind:"우리말"},{label:"팔",kind:"한자어"}], type:"touch_match"}, suggested_extras:["m_two_readings"]},
    {id:"s15", stage:"응용문제", block:"basic_problem", data:{title:"연결 모형 7칸 — 몇 칸?", linking_cube:7, answer:7, input:"count_input"}, suggested_extras:["m_number_line"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"1~9 한 번에 보기", table:[{num:6,kor:"여섯",han:"육"},{num:7,kor:"일곱",han:"칠"},{num:8,kor:"여덟",han:"팔"},{num:9,kor:"아홉",han:"구"}], ten_frame_strip:[1,2,3,4,5,6,7,8,9]}, suggested_extras:["b_count_to_10"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["수 세기를 잘했어요","십 배열판을 잘 이해했어요","두 가지 읽기를 잘했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"다음에는 **순서**를 배워요 — 첫째·둘째·셋째…"}, suggested_extras:["e_to_order"]}
  ],
  extras: [
    {id:"v_count_song_kor", type:"video", icon:"🎥", title:"핑크퐁 1-10 숫자송", url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id:"Qxi-dPmsl-Q", description:"1부터 10까지 노래로. 6·7·8·9 도입 자리 흥미 유발.", source:"핑크퐁 — 유튜브 공개 영상", fit_slides:["motivate","review"]},
    {id:"q_fun_garden", type:"fun_question", icon:"💡", title:"꽃밭에 해바라기 7송이", content:"해바라기 7송이가 햇볕을 받고 있어요. 그 옆에 풍선 8개도 있어요. 어느 쪽이 더 많을까요?", fit_slides:["motivate","basic_problem"]},
    {id:"m_ten_frame_5plus", type:"tip", icon:"🧩", title:"십 배열판 = 5 기준", content:"십 배열판은 위 5칸·아래 5칸으로 나뉘어요. 6은 위 5 + 아래 1, 8은 위 5 + 아래 3. 5를 기준으로 보면 한 눈에 알아보기 쉬워요.", fit_slides:["concept","visual_demo"]},
    {id:"m_ten_frame_tip", type:"tip", icon:"🧩", title:"십 배열판 가르치는 법", content:"왼쪽부터 한 칸씩 채우기. 위 줄 다 채운 뒤 아래 줄로. 일관된 채움 순서가 시각 인식의 핵심.", fit_slides:["concept","visual_demo"]},
    {id:"m_number_line", type:"tip", icon:"🧩", title:"수직선·계단 시각", content:"1~9를 계단처럼 쌓으면 옆 칸과의 차이가 1이라는 것이 한 눈에 보임. 이후 ±1·덧셈·뺄셈의 시각 기반.", fit_slides:["concept","visual_demo"]},
    {id:"m_two_readings", type:"tip", icon:"🧩", title:"우리말·한자어 두 가지", content:"6 = 여섯(우리말) / 육(한자어). 사물 셀 때는 우리말, 순서·층수는 한자어. 둘 다 일상에서 자주 사용.", fit_slides:["concept","real_world"]},
    {id:"m_finger_writing", type:"tip", icon:"🧩", title:"필순 손으로 따라하기", content:"점선만 따라가지 말고 손가락으로 허공에 한 번 써본 뒤 종이에 쓰면 기억이 잘 돼요.", fit_slides:["trace","concept"]},
    {id:"r_team_member", type:"real_world", icon:"🌍", title:"모둠 친구 수", content:"우리 모둠은 6명. 옆 모둠은 8명. 어느 쪽이 더 많을까? 우리 반 전체는 몇 명?", fit_slides:["real_world","concept"]},
    {id:"r_egg_box", type:"real_world", icon:"🌍", title:"계란 한 판", content:"마트에서 계란을 사면 한 판에 10개가 들어 있어요. 9개를 먹으면 1개 남음. 십 배열판과 똑같이 생겼어요.", fit_slides:["real_world","visual_demo"]},
    {id:"g_finger_show", type:"game", icon:"🎮", title:"손가락 빨리 들기", content:"교사가 '여덟!' 하면 두 손 합쳐 8개를 빨리 드는 게임. '구!' 하면 9개. 우리말·한자어 둘 다 사용.", fit_slides:["game","concept"]},
    {id:"g_ten_frame_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"십 배열판과 숫자 짝짓기", description:"십 배열판과 숫자의 같은 짝을 찾아보세요.", content:"숫자 6~9와 십 배열판(채워진 칸 수)을 뒤집어 놓고 짝 찾기.", hint:"십 배열판의 채워진 칸을 세어 짝을 찾아요.", pairs:[
      { a:{text:"6"}, b:{ten_frame:6} },
      { a:{text:"7"}, b:{ten_frame:7} },
      { a:{text:"8"}, b:{ten_frame:8} },
      { a:{text:"9"}, b:{ten_frame:9} }
    ], fit_slides:["match","game"]},
    {id:"g_ten_frame_race", type:"game", icon:"🎮", title:"십 배열판 채우기 경주", content:"두 팀이 빈 십 배열판에 돌을 놓으며 N개를 빨리 채우는 게임. 잘못 세면 다시 시작.", fit_slides:["game","interactive"]},
    {id:"b_count_to_10", type:"book", icon:"📖", title:"『열까지 셀 줄 아는 아기염소』", content:"알프 프뢰위센. 아기 염소가 동물들을 만나며 1~10 세는 그림책. 한 마리씩 늘어나는 구조.", source:"알프 프뢰위센 / 마루벌", fit_slides:["motivate","concept"]},
    {id:"x_object_vs_number", type:"misconception", icon:"❓", title:"오개념 — 종류가 다르면 수도 다르다?", content:"사과 7과 자동차 7을 보고 다른 수로 답하는 경우. 일대일대응이나 십 배열판으로 둘 다 7이라는 같은 수임을 시각화.", fit_slides:["concept","multi"]},
    {id:"x_ten_frame_count", type:"misconception", icon:"❓", title:"오개념 — 십 배열판 빈 칸도 세기", content:"6칸 채워진 십 배열판을 10으로 답하는 경우. 채워진 칸만 세야 함을 손가락으로 짚으며 강조.", fit_slides:["concept","basic_problem"]},
    {id:"e_to_order", type:"extension", icon:"⬆", title:"수의 순서로", content:"이제 1·2·3·4·5·6·7·8·9 — 9개의 수를 알아요. 다음 차시(6차)에서 이 수들의 **순서**를 배워요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l6"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 6,
    title: "순서를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 순서수 + 기준 명시",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l06.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"줄 선 친구들", desc:"복도에 줄 선 9명 (휠체어 친구 포함). 어떻게 순서를 말할까?", scene:"line_of_kids", count:9}, suggested_extras:["q_fun_line","r_school_line"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"오늘은 **순서**를 나타내는 말과 수를 배워요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"1~9 복습", ten_frame_strip:[1,2,3,4,5,6,7,8,9]}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"첫째·둘째…아홉째", ordinal_map:[{n:1,word:"첫째"},{n:2,word:"둘째"},{n:3,word:"셋째"},{n:4,word:"넷째"},{n:5,word:"다섯째"},{n:6,word:"여섯째"},{n:7,word:"일곱째"},{n:8,word:"여덟째"},{n:9,word:"아홉째"}], note:"순서를 나타내는 말 — 끝에 '째'가 붙어요"}, suggested_extras:["m_ordinal_vs_count"]},
    {id:"s05", stage:"전개", block:"compare", data:{title:"몇째 ≠ 몇 개", contrast:{left:{label:"사탕 둘째",visual:"🍬🍬🍬🍬🍬", marker:2, kind:"order"},right:{label:"사탕 2개",visual:"🍬🍬", kind:"count"}}}, suggested_extras:["x_order_vs_quantity"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"기준이 중요해요", scenarios:[{label:"왼쪽에서 셋째", direction:"left", target:3},{label:"오른쪽에서 일곱째", direction:"right", target:7}], note:"같은 친구도 기준에 따라 다른 순서로 표현돼요"}, suggested_extras:["m_two_directions"]},
    {id:"s07", stage:"전개", block:"summary", data:{title:"정리표", table:[{num:1,ord:"첫째"},{num:2,ord:"둘째"},{num:3,ord:"셋째"},{num:4,ord:"넷째"},{num:5,ord:"다섯째"},{num:6,ord:"여섯째"},{num:7,ord:"일곱째"},{num:8,ord:"여덟째"},{num:9,ord:"아홉째"}], legend:"← 왼쪽 기준 / 오른쪽 기준 →"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"왼쪽에서 셋째는?", line_count:9, direction:"left", target:3, component:"position_picker"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"이 친구는 왼쪽에서 몇째?", line_count:9, highlight_pos:5, direction:"left", input:"count_input", answer:5}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"match", data:{title:"순서수 짝짓기", pairs:[{n:3,ord:"셋째"},{n:6,ord:"여섯째"},{n:9,ord:"아홉째"}], type:"ordinal_match"}, suggested_extras:["g_ordinal_card"]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"오른쪽에서 다섯째는?", line_count:9, direction:"right", target:5, component:"position_picker", note:"기준이 바뀜 — 오른쪽부터 세어요"}, suggested_extras:["m_two_directions"]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"두 기준 동시", line_count:9, both:true, left_target:3, right_target:7, component:"position_picker", note:"왼쪽에서 셋째 = 오른쪽에서 일곱째 — 같은 친구!"}, suggested_extras:["x_two_orders_same_person"]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"둘째·다섯째·여덟째 모두 골라", line_count:9, targets:[2,5,8], direction:"left", expectedCount:3}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"multi", data:{title:"'사탕 셋째'와 '사탕 3개' 모두 골라", options:[{label:"사탕 셋째",kind:"order",correct:true},{label:"사탕 3개",kind:"count",correct:true},{label:"사탕 둘째",kind:"order"},{label:"사탕 5개",kind:"count"}], expectedCount:2, note:"몇째와 몇 개 둘 다 구분해야 정답"}, suggested_extras:["x_order_vs_quantity"]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"벽 작품 자리", scenario:"내 작품은 왼쪽에서 4째. 9칸 벽이면 오른쪽에서는 몇째?", total:9, left_pos:4, answer:6, input:"count_input"}, suggested_extras:["r_apartment_floor"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"1~9 + 첫째~아홉째 + 두 기준", table:[{num:1,ord:"첫째"},{num:2,ord:"둘째"},{num:3,ord:"셋째"},{num:4,ord:"넷째"},{num:5,ord:"다섯째"},{num:6,ord:"여섯째"},{num:7,ord:"일곱째"},{num:8,ord:"여덟째"},{num:9,ord:"아홉째"}]}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["순서수를 잘 매핑했어요","기준(왼쪽/오른쪽)을 잘 인식했어요","'몇째'와 '몇 개'를 구분했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"수의 순서 — **1·2·3···9** 그리고 거꾸로 **9·8···1**"}, suggested_extras:[]}
  ],
  extras: [
    {id:"q_fun_line", type:"fun_question", icon:"💡", title:"줄 서기 놀이", content:"운동장에 친구 9명이 일렬로 섰을 때, 가장 키 작은 친구가 첫째라면 가장 키 큰 친구는 몇째? 9째!", fit_slides:["motivate","concept"]},
    {id:"r_school_line", type:"real_world", icon:"🌍", title:"급식 줄·등교 줄", content:"우리 반 급식 줄을 떠올려 봐요. 내 앞에 친구 3명이 있으면 나는 넷째. 줄에서 순서는 매일 만나는 개념.", fit_slides:["motivate","real_world"]},
    {id:"r_apartment_floor", type:"real_world", icon:"🌍", title:"아파트 층수", content:"우리 집은 5층. 위에서 셋째라면 건물은 몇 층? (3+5-1=7층). 한 건물도 위·아래 두 기준으로 셀 수 있어요.", fit_slides:["real_world","advanced_problem"]},
    {id:"r_race_finish", type:"real_world", icon:"🌍", title:"달리기 결승선", content:"운동회 달리기에서 1등·2등·3등은 첫째·둘째·셋째로도 말해요. 순서를 표현하는 다른 방식.", fit_slides:["real_world","concept"]},
    {id:"m_ordinal_vs_count", type:"tip", icon:"🧩", title:"'몇째'와 '몇 개' 구분 팁", content:"'몇째'는 위치 (한 명·한 개). '몇 개'는 양 (여러 개). 손가락으로 짚을 때 — '셋째'는 셋째 자리 한 곳만 짚고, '3개'는 1·2·3 모두 짚어요.", fit_slides:["concept","compare"]},
    {id:"m_two_directions", type:"tip", icon:"🧩", title:"기준 명시 습관", content:"순서를 말할 때 항상 '왼쪽에서·오른쪽에서·앞에서·뒤에서' 같은 기준을 함께 말해요. 안 그러면 듣는 사람이 헷갈려요.", fit_slides:["concept","real_world"]},
    {id:"g_ordinal_card", type:"game", game_kind:"memory_match", icon:"🎮", title:"순서수 카드 뒤집기", description:"숫자와 순서수의 같은 짝을 찾아보세요.", content:"숫자 카드(1~9)와 순서수 카드(첫째~아홉째)를 뒤집어 놓고 같은 짝 찾기 메모리 게임.", hint:"숫자와 순서수의 짝을 맞춰 보세요.", pairs:[
      { a:{text:"1"}, b:{text:"첫째"} },
      { a:{text:"2"}, b:{text:"둘째"} },
      { a:{text:"3"}, b:{text:"셋째"} },
      { a:{text:"5"}, b:{text:"다섯째"} },
      { a:{text:"9"}, b:{text:"아홉째"} }
    ], fit_slides:["match","game"]},
    {id:"g_line_game", type:"game", icon:"🎮", title:"기준 바꾸기 놀이", content:"친구 9명이 일렬로 섬. 교사가 '왼쪽에서 다섯째!' 외치면 다섯째가 손 들기. '오른쪽에서 다섯째!'로 바꾸면 다른 친구가 손 듦. 빠르게 반응 훈련.", fit_slides:["game","real_world"]},
    {id:"b_ordinal_book", type:"book", icon:"📖", title:"『첫째·둘째·셋째』 - 순서 그림책", content:"동물들이 줄을 서며 순서를 배우는 그림책. '몇째'와 '몇 개'를 자연스럽게 구분.", source:"국내 그림책 다수 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"x_order_vs_quantity", type:"misconception", icon:"❓", title:"오개념 — '셋째'와 '3개' 혼동", content:"학생이 '사탕 셋째'에 사탕 3개를 답하는 경우. '몇째'는 한 곳을 가리키는 위치임을 손가락 짚기로 강조.", fit_slides:["concept","compare"]},
    {id:"x_two_orders_same_person", type:"misconception", icon:"❓", title:"오개념 — 한 사람은 한 순서만?", content:"학생이 '왼쪽 셋째'와 '오른쪽 일곱째'를 다른 사람으로 답하는 경우. 9명 줄에서 같은 한 사람을 양쪽에서 세면 다른 수가 나옴을 시각화.", fit_slides:["advanced_problem","concept"]},
    {id:"e_to_sequence", type:"extension", icon:"⬆", title:"순서수 → 수의 순서", content:"순서수를 알았으니 이제 수 자체를 순서대로 — 다음 차시(7차)에서 1·2·3···9 / 9·8·7···1을 배워요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l7"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 7,
    title: "수의 순서를 알아볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 순방향·역방향·중간 시작",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l07.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"숫자판 1~9", desc:"색색의 숫자판. 어떤 순서로 말할 수 있을까?", number_panel:[1,2,3,4,5,6,7,8,9]}, suggested_extras:["v_count_song_kor","r_hopscotch"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"수를 **1·2···9** 순서대로 / 거꾸로 **9·8···1** 세 봐요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 — 첫째~아홉째", table:[{num:1,ord:"첫째"},{num:5,ord:"다섯째"},{num:9,ord:"아홉째"}]}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"순방향 1→9", sequence:[1,2,3,4,5,6,7,8,9], arrow:"right", note:"1부터 한 칸씩 커지며 9까지"}, suggested_extras:["m_number_line"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"역방향 9→1", sequence:[9,8,7,6,5,4,3,2,1], arrow:"left", note:"9부터 한 칸씩 작아지며 1까지"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"중간 시작", examples:[{start:4, end:8, direction:"asc"},{start:7, end:2, direction:"desc"}], note:"항상 1·9에서만 시작하는 건 아니에요"}, suggested_extras:["g_count_from_middle"]},
    {id:"s07", stage:"전개", block:"summary", data:{title:"호기심 자리", questions:["9 다음 수는?","1 이전 수는?"], note:"두 자리 모두 다음 차시·다음 단원에서 만나요"}, suggested_extras:["e_above_9","e_below_1"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"빈칸 순방향", sequence:[1,"?",3,"?",5,6,"?",8,"?"], answers:[2,4,7,9], input:"count_input_4"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"빈칸 역방향", sequence:[9,"?",7,"?",5,"?",3,"?",1], answers:[8,6,4,2], input:"count_input_4"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"흩어진 카드 순서대로", component:"sequence_arrange", direction:"asc", range:[1,9]}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"길 따라 1→9", component:"number_path", direction:"asc", range:[1,9]}, suggested_extras:["g_number_path_jump"]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"4부터 8까지 배열", component:"sequence_arrange", direction:"asc", range:[4,8]}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"7부터 2까지 배열 (역방향)", component:"sequence_arrange", direction:"desc", range:[7,2]}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"basic_problem", data:{title:"다음 수·이전 수", base:5, questions:["5의 다음 수?","5의 이전 수?"], answers:[6,4], input:"count_input_2"}, suggested_extras:["e_next_prev"]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"거꾸로 길 따라 9→1", component:"number_path", direction:"desc", range:[9,1]}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"1~9 순방향·역방향", sequence_asc:[1,2,3,4,5,6,7,8,9], sequence_desc:[9,8,7,6,5,4,3,2,1], questions:["9 다음 = ?","1 이전 = ?"]}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["순방향을 잘했어요","역방향을 잘했어요","중간 시작도 잘했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"**1만큼 더 큰 수**와 **1만큼 더 작은 수**"}, suggested_extras:[]}
  ],
  extras: [
    {id:"v_count_song_kor", type:"video", icon:"🎥", title:"핑크퐁 1-10 숫자송", url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id:"Qxi-dPmsl-Q", description:"1~10을 순서대로 노래로. 7차 도입 자리.", source:"핑크퐁 — 유튜브 공개 영상", fit_slides:["motivate","review"]},
    {id:"v_count_backward", type:"video", icon:"🎥", title:"카운트다운 영상", url:"https://www.youtube.com/results?search_query=10+9+8+countdown+kids", description:"10부터 거꾸로 세는 영상. 로켓 발사·생일 카운트다운 등 역방향의 친숙한 예.", source:"유튜브 다수 영상 — 교사 선택", fit_slides:["concept","motivate"]},
    {id:"r_hopscotch", type:"real_world", icon:"🌍", title:"사방치기 놀이", content:"바닥에 1~9 칸을 그리고 돌을 던져 한 칸씩 뛰어가는 사방치기. 숫자판을 직접 밟으며 순서를 익히는 가장 좋은 놀이.", fit_slides:["motivate","real_world"]},
    {id:"r_calendar_days", type:"real_world", icon:"🌍", title:"달력 날짜", content:"오늘이 5일이면 다음 날은 6일·7일… 거꾸로 어제는 4일·3일. 날짜는 매일 ±1로 바뀌어요.", fit_slides:["real_world","concept"]},
    {id:"r_pages", type:"real_world", icon:"🌍", title:"책장 넘기기", content:"책 페이지 1·2·3·4·5… 순서대로 넘겨요. 거꾸로 다시 5·4·3·2·1로 가기도 해요.", fit_slides:["real_world","concept"]},
    {id:"m_number_line", type:"tip", icon:"🧩", title:"수직선·길 활용", content:"1·2·3···9를 길처럼 그리면 순방향·역방향이 한 눈에 보임. 손가락으로 짚으며 가면 더 좋아요.", fit_slides:["concept","visual_demo"]},
    {id:"m_two_directions", type:"tip", icon:"🧩", title:"양방향 연습 습관", content:"숫자 셀 때 매번 순방향만 하지 말고, 가끔 역방향으로도 세요. 양방향 모두 익숙해지면 뺄셈·±1도 쉬워져요.", fit_slides:["concept","real_world"]},
    {id:"g_number_path_jump", type:"game", icon:"🎮", title:"숫자판 점프 놀이", content:"교실 바닥에 1~9 카드를 흩어 놓고 교사가 '1·2·3·4·5!' 외치면 학생이 그 순서로 점프. 역방향도 해 봐요.", fit_slides:["game","real_world"]},
    {id:"g_count_from_middle", type:"game", icon:"🎮", title:"중간에서 시작 게임", content:"교사가 '4부터 8까지!' 외치면 학생이 4·5·6·7·8 외치기. 시작·끝을 매번 바꿔 빠르게.", fit_slides:["game","concept"]},
    {id:"g_card_sort", type:"game", icon:"🎮", title:"카드 정렬 경주", content:"두 팀이 1~9 카드를 흩어 놓고 순서대로 빠르게 정렬. 역방향도 정렬해 봐요.", fit_slides:["game","basic_problem"]},
    {id:"b_count_book", type:"book", icon:"📖", title:"『숫자 길 따라가요』", content:"동물들이 숫자 길을 따라 모험하는 그림책. 순방향·역방향 모두 등장.", source:"국내 그림책 다수 — 도서관 확인", fit_slides:["motivate","concept"]},
    {id:"x_count_skip", type:"misconception", icon:"❓", title:"오개념 — 수를 건너뛰며 세기", content:"학생이 1·2·4·5처럼 한 수를 빠뜨리는 경우. 손가락으로 한 칸씩 짚으며 세는 습관이 중요.", fit_slides:["basic_problem","concept"]},
    {id:"e_above_9", type:"extension", icon:"⬆", title:"9 다음은?", content:"9 다음은 10! 이번 학년 5단원에서 만나요. 50까지 세어 봐요.", fit_slides:["next_lesson","summary"]},
    {id:"e_below_1", type:"extension", icon:"⬆", title:"1 이전은?", content:"1 이전은 0. 다음 차시(9차)에서 새 식구 0을 만나요.", fit_slides:["next_lesson"]},
    {id:"e_next_prev", type:"extension", icon:"⬆", title:"'다음 수'·'이전 수'와 ±1", content:"'5의 다음 수'는 '5보다 1만큼 더 큰 수'와 같아요. 다음 차시(8차)에서 같은 개념을 다른 말로 만나요.", fit_slides:["advanced_problem","next_lesson"]}
  ]
};

LESSONS["u1_l8"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 8,
    title: "1만큼 더 큰 수와 1만큼 더 작은 수를 알아볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — ±1 개념 · 가역적 사고",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l08.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"도서관 책 빌리기", scene_title:"오늘 빌릴 책 4권, 내일 1권 더?", question:"내일 한 권 더 빌리면 책은 몇 권?", emojis:["📚📚📚📚","➕📚"]}, suggested_extras:["v_geni_pm1","q_fun_dinosaur"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"**1만큼 더 큰 수**와 **1만큼 더 작은 수**를 알아봐요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 — 수의 순서", sequence:[1,2,3,4,5,6,7,8,9], note:"앞 시간에 수를 차례로 세었어요"}, suggested_extras:["v_count_song_kor"]},
    {id:"s04", stage:"전개", block:"motivate", data:{title:"오늘 배울 거", question:"**1만큼 더 큰 수**와 **1만큼 더 작은 수**는 무엇일까?"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"visual_demo", data:{title:"십 배열판으로 5 보여주기", ten_frame_solo:{count:5, is_anchor:true, label:"5는 5개 채워진 자리"}, component:"ten_frame"}, suggested_extras:["m_ten_frame_tip"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"5에서 1만큼 더 커지면", content:"5에 **하나 더** 들어가면 **6**", direction:"more", from:5, to:6, component:"ten_frame", animate:"add"}, suggested_extras:["v_geni_pm1"]},
    {id:"s07", stage:"전개", block:"compare", data:{title:"5와 6 견주어 봐요", items:[{ten_frame:5,num:5,caption:"5",is_anchor:true},{ten_frame:6,num:6,caption:"6 — 1만큼 더 큰 수"}]}, suggested_extras:["r_elevator"]},
    {id:"s08", stage:"전개", block:"concept", data:{title:"5에서 1만큼 더 작아지면", content:"5에서 **하나 빠지면** **4**", direction:"less", from:5, to:4, component:"ten_frame", animate:"remove"}, suggested_extras:[]},
    {id:"s09", stage:"전개", block:"compare", data:{title:"5와 4 견주어 봐요", items:[{ten_frame:5,num:5,caption:"5",is_anchor:true},{ten_frame:4,num:4,caption:"4 — 1만큼 더 작은 수"}]}, suggested_extras:[]},
    {id:"s10", stage:"전개", block:"visual_demo", data:{title:"계단처럼 1만큼씩", linking_cube_staircase:{range:[1,9]}, caption:"한 칸씩 더 쌓이면 1만큼씩 커져요"}, suggested_extras:["m_number_line"]},
    {id:"s11", stage:"전개", block:"concept", data:{title:"같은 일을 두 가지 말로", bidirect:["**5**는 **6**보다 1만큼 더 **작은 수**","=","**6**은 **5**보다 1만큼 더 **큰 수**"]}, suggested_extras:["x_more_means_bigger"]},
    {id:"s12", stage:"기본문제", block:"basic_problem", data:{title:"7보다 1만큼 더 큰 수는?", ten_frame_anchor:7, base:5, mode:"choice4", direction:"more", component:"more_less_one"}, suggested_extras:["q_fun_pizza"]},
    {id:"s13", stage:"기본문제", block:"basic_problem", data:{title:"6보다 1만큼 더 작은 수는?", ten_frame_anchor:6, base:6, mode:"choice4", direction:"less", component:"more_less_one"}, suggested_extras:["m_finger_tip"]},
    {id:"s14", stage:"기본문제", block:"basic_problem", data:{title:"4보다 1만큼 더 큰 수·작은 수는?", base:4, both:true, component:"more_less_one"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"두 가지로 말해보기", challenge:"**8**을 물어볼 때, 어떻게 질문할까? 방법은 **두 가지**!", expected:["7보다 1만큼 더 큰 수","9보다 1만큼 더 작은 수"]}, suggested_extras:["x_more_means_bigger"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["1만큼 더 큰 수","1만큼 더 작은 수","같은 수도 두 가지 방법으로 표현","수직선·계단으로 보면 옆 칸이 ±1"]}, suggested_extras:["b_number_book","b_one_more"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["1만큼 더 큰 수를 말했어요","1만큼 더 작은 수를 말했어요","같은 수를 두 가지로 말했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"1보다 1만큼 더 작은 수는? 새 수 **0**이 등장!"}, suggested_extras:["e_zero_intro"]}
  ],
  extras: [
    {id:"v_geni_pm1", type:"video", icon:"🎥", title:"지니와 함께하는 수학 — 1만큼 더 큰 수·작은 수", url:"https://www.youtube.com/watch?v=kfg8v8CRLRI", video_id:"kfg8v8CRLRI", description:"8차 ±1 개념 직격. 1학년 1학기 1단원 학습 영상. 도입·개념 자리에 그대로.", source:"스마트올TV — 출처·링크 표기 조건 사용", fit_slides:["motivate","concept","review"]},
    {id:"v_count_song_kor", type:"video", icon:"🎥", title:"핑크퐁 1-10 숫자송", url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id:"Qxi-dPmsl-Q", description:"전시 학습(1~9 수 이름) 상기.", source:"핑크퐁 — 유튜브 공개 영상", fit_slides:["review","motivate"]},
    {id:"v_chickadees", type:"video", icon:"🎥", title:"Five Little Chickadees", url:"https://www.youtube.com/results?search_query=five+little+chickadees+song", description:"1만큼 적어지는 개념을 노래로 — 챙기새 5마리가 하나씩 줄어듦.", source:"영미권 전래 동요 (퍼블릭 도메인)", fit_slides:["motivate","concept"]},
    {id:"q_fun_dinosaur", type:"fun_question", icon:"💡", title:"공룡 가족", content:"공룡 5마리가 놀고 있어요. 1마리 더 오면 몇 마리? 1마리 가버리면 몇 마리?", fit_slides:["motivate","basic_problem"]},
    {id:"q_fun_pizza", type:"fun_question", icon:"💡", title:"피자 조각 이야기", content:"피자 7조각 중 한 조각을 먹었어요. 몇 조각 남았을까요? (7보다 1만큼 더 작은 수)", fit_slides:["basic_problem","real_world"]},
    {id:"r_elevator", type:"real_world", icon:"🌍", title:"엘리베이터 층수", content:"5층에서 ▲ 누르면 6층, ▼ 누르면 4층. 엘리베이터 버튼이 ±1의 좋은 예.", fit_slides:["concept","real_world"]},
    {id:"r_calendar", type:"real_world", icon:"🌍", title:"달력 날짜", content:"오늘이 8일이면 어제는 7일, 내일은 9일. 매일 ±1로 날짜가 바뀜.", fit_slides:["real_world"]},
    {id:"r_age", type:"real_world", icon:"🌍", title:"형제 나이", content:"나는 8살. 형은 9살(1살 더), 동생은 7살(1살 더 어림). 가족 안에서 만나는 ±1.", fit_slides:["real_world"]},
    {id:"r_traffic_light", type:"real_world", icon:"🌍", title:"신호등 카운트다운", content:"5초 남았다고 깜빡여요. 1초 지나면 4초. 또 1초 지나면 3초. 시간도 1만큼씩 줄어요.", fit_slides:["real_world"]},
    {id:"g_card_bingo", type:"game", icon:"🎮", title:"수 카드 빙고", content:"3×3 빙고판. 교사가 '4보다 1만큼 더 큰 수' 외치면 학생이 5에 동그라미. 표현 듣고 답하기 훈련.", fit_slides:["game","advanced_problem"]},
    {id:"g_finger_game", type:"game", icon:"🎮", title:"손가락 ±1 놀이", content:"짝과 마주 앉아 한 명이 손가락 N개 들기. 다른 한 명이 '1만큼 더 큰 수' 외치고 빠르게 N+1 들기. 빠르고 정확한 사람 점수.", fit_slides:["game"]},
    {id:"b_number_book", type:"book", icon:"📖", title:"『숫자가 사라졌어요』 - 로렌 리디", content:"숫자가 사라진 세상 이야기. 이웃 수 개념을 자연스럽게.", source:"로렌 리디 / 비룡소", fit_slides:["motivate","summary"]},
    {id:"b_one_more", type:"book", icon:"📖", title:"『One More』", content:"동물이 하나씩 늘어나는 그림책. ±1 개념 시각화.", source:"영미권 그림책 — 도서관 확인", fit_slides:["motivate"]},
    {id:"m_finger_tip", type:"tip", icon:"🧩", title:"1만큼 더 작은 수 헷갈리면", content:"손가락 N개 펴고 → 한 개 접으면 → 그게 1만큼 더 작은 수.", fit_slides:["concept","basic_problem"]},
    {id:"m_number_line", type:"tip", icon:"🧩", title:"수직선 활용", content:"1~9 수직선 그려두면 ±1 = 한 칸 옆. 이후 덧셈·뺄셈 학습 기반.", fit_slides:["concept","visual_demo"]},
    {id:"m_ten_frame_tip", type:"tip", icon:"🧩", title:"십 배열판으로 ±1", content:"5칸 채워진 십 배열판에서 1만큼 더 큰 수는 한 칸 더 채움(→6), 1만큼 더 작은 수는 한 칸 비움(→4). 시각·동작 동시.", fit_slides:["concept","visual_demo"]},
    {id:"x_more_means_bigger", type:"misconception", icon:"❓", title:"오개념 — '더 많다 = 더 크다'", content:"학생들이 양('많다/적다')과 수('크다/작다')를 혼동. 일관되게 '1만큼 더 큰 수'·'1만큼 더 작은 수' 표현 사용.", fit_slides:["concept"]},
    {id:"e_zero_intro", type:"extension", icon:"⬆", title:"1보다 1만큼 더 작은 수는?", content:"1보다 1만큼 더 작은 수는? 다음 차시(9차)에서! 0이라는 새 수가 등장.", fit_slides:["next_lesson","summary"]}
  ]
};

LESSONS["u1_l9"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 9,
    title: "0을 알아볼까요",
    std: "[2수01-01], [2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 0 도입",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l09.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"풀 받침대", scene:"풀 3개 → 친구들이 하나씩 가져감 → 아무것도 안 남음", emoji:"🧴🧴🧴 → ?"}, suggested_extras:["q_fun_empty"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"**아무것도 없음**을 수로 나타내요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 회수", content:"8차에서 \"1보다 1만큼 더 작은 수는?\"라는 호기심이 있었어요. 오늘 답을 만나요!"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"풀 3개에서 0개까지", component:"decrement_animation", from:3, to:0, items:"🧴", note:"학생이 한 개씩 클릭하면 사라짐"}, suggested_extras:["m_decrement_visual"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"0이라고 쓰고 '영'이라고 읽어요", number:0, kor:"영", han:"영", font:"Jua 800"}, suggested_extras:["m_zero_writing"]},
    {id:"s06", stage:"전개", block:"trace", data:{title:"0 따라써 봐요", trace_numbers:[0], component:"trace_number", note:"한 바퀴 닫는 형태 — 위에서 시작 → 한 바퀴 → 시작점에 닫음"}, suggested_extras:["m_zero_writing"]},
    {id:"s07", stage:"전개", block:"summary", data:{title:"0이 새 식구!", sequence:[0,1,2,3,4,5,6,7,8,9], note:"이제 0부터 9까지 10개의 수가 있어요"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"가위 보관통 3개에서 0개까지", component:"decrement_animation", from:3, to:0, items:"✂️", input:"count_input", answer:0}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"크레파스 보관함 0→3", component:"increment_animation", from:0, to:3, items:"🖍️", input:"count_input", answer_start:0}, suggested_extras:["m_starting_zero"]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"사과 한 개 남았는데 한 개 더 가져가면?", scenario:"🍎 → 🚶 → ?", answer:0, input:"count_input"}, suggested_extras:["q_fun_empty"]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"0 ↔ '영' 짝짓기", pairs:[{n:0, word:"영"}], type:"touch_match"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"사탕 다 먹었어요", scenario:"주머니에 사탕이 있었는데 다 먹었어요. 지금 몇 개?", answer:0, input:"count_input"}, suggested_extras:["r_pocket_money"]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"바둑돌 5개 → 0개로", scenario:"바둑돌 5개를 모두 덜어내려면 몇 번?", answer:5, input:"count_input"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"compare", data:{title:"0과 1 중 더 작은 수는?", left:0, right:1, component:"compare_picker", target:"smaller", note:"다음 차시 크기 비교의 예고편"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"multi", data:{title:"'0개' 상황 고르기", options:[{label:"빈 책장",count:0,correct:true},{label:"결석 0명",count:0,correct:true},{label:"빵 가득",count:9}], expectedCount:2}, suggested_extras:["r_attendance"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"0~9 한 줄", sequence:[0,1,2,3,4,5,6,7,8,9], note:"0 = 아무것도 없음을 나타내는 수"}, suggested_extras:["b_zero_book"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["0의 의미를 이해했어요","0을 잘 썼어요","일상 0 사례를 찾았어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"**수의 크기 비교** — 0~9 중에 어느 수가 더 클까?"}, suggested_extras:[]}
  ],
  extras: [
    {id:"q_fun_empty", type:"fun_question", icon:"💡", title:"빈 컵·빈 통", content:"우유를 다 마신 컵, 사탕을 다 먹은 봉지 — 안에 몇 개? 0개. 매일 만나는 0.", fit_slides:["motivate","basic_problem"]},
    {id:"q_fun_no_homework", type:"fun_question", icon:"💡", title:"숙제 0개", content:"오늘 숙제가 없는 날 — 숙제가 몇 개? 0개! 좋은 날 ㅎㅎ", fit_slides:["motivate","real_world"]},
    {id:"r_pocket_money", type:"real_world", icon:"🌍", title:"용돈 다 쓰면", content:"용돈 1000원 다 쓰면 0원. 지갑 안에 돈이 0원이라는 표현은 매일 만나는 사례.", fit_slides:["real_world","advanced_problem"]},
    {id:"r_attendance", type:"real_world", icon:"🌍", title:"결석 0명", content:"오늘 결석한 친구가 0명이면 우리 반 모두 출석! 0의 좋은 의미.", fit_slides:["real_world","summary"]},
    {id:"r_score_zero", type:"real_world", icon:"🌍", title:"점수 0점·시간 0분", content:"게임 시작할 때 점수 0점. 알람 0분 0초 남으면 울림. 0은 시작점이기도 해요.", fit_slides:["real_world"]},
    {id:"m_decrement_visual", type:"tip", icon:"🧩", title:"점차 감소 시각화", content:"3·2·1·0을 한 칸씩 줄여가며 마지막에 '아무것도 없음 = 0'을 강조. 손으로 가리면서 줄여가면 더 인상 깊음.", fit_slides:["concept","visual_demo"]},
    {id:"m_zero_writing", type:"tip", icon:"🧩", title:"0 필순 — 한 바퀴 닫기", content:"위에서 시작해서 왼쪽으로 → 아래 → 오른쪽 → 시작점에 닫음. 한 번에 끊어지지 않게 그리기.", fit_slides:["trace","concept"]},
    {id:"m_starting_zero", type:"tip", icon:"🧩", title:"0부터 시작하는 시각", content:"빈 통에서 시작 → 하나씩 더해가는 시각도 중요. 0이 '없음'이자 '출발점'임을 강조.", fit_slides:["concept","basic_problem"]},
    {id:"g_zero_search", type:"game", icon:"🎮", title:"0 사례 찾기 경주", content:"교실·복도·운동장에서 '0개'인 것을 찾는 경주. 빈 사물함·빈 칠판 등 다양.", fit_slides:["game","real_world"]},
    {id:"g_count_down", type:"game", icon:"🎮", title:"카운트다운 발사", content:"교사가 '5·4·3·2·1·0!'을 외치면 학생이 종이 비행기 발사. 0이 '시작 신호'가 되는 경험.", fit_slides:["game","concept"]},
    {id:"b_zero_book", type:"book", icon:"📖", title:"『0이 처음 등장한 날』", content:"숫자 0이 어떻게 만들어졌는지 이야기. 인류가 0을 발견한 의미 있는 발자취.", source:"교양 그림책 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"b_zero_friend", type:"book", icon:"📖", title:"『0은 외로워』", content:"숫자 0이 자기 자리를 찾는 이야기. 0이 가장 작지만 꼭 필요한 수임을 다룸.", source:"국내 그림책 다수 — 도서관 확인", fit_slides:["motivate","concept"]},
    {id:"x_zero_means_nothing", type:"misconception", icon:"❓", title:"오개념 — '0 = 없음 = 수가 아님'", content:"학생이 '아무것도 없는데 왜 수가 있어요?'라고 묻는 경우. '없음을 표현하는 약속'이 0임을 강조.", fit_slides:["concept","motivate"]},
    {id:"x_zero_confusion", type:"misconception", icon:"❓", title:"오개념 — '3에서 1만큼 적어지면 0?'", content:"학생이 '3-1=0'으로 답하는 경우. 한 칸만 줄어드는 것임을 십 배열판·연결 모형으로 시각화.", fit_slides:["concept","compare"]},
    {id:"e_zero_in_two_digit", type:"extension", icon:"⬆", title:"두 자리 수의 0", content:"5단원에서 10·20·30… 두 자리 수의 끝에 0이 붙어요. 0이 '자리'를 표현하는 큰 역할로.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l10"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 10,
    title: "수의 크기를 비교해 볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 두 수 크기 비교 · 양방향 표현",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l10.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"고리 던지기 결과", teams:[{label:"1모둠",hoops:3},{label:"2모둠",hoops:3},{label:"3모둠",hoops:5}], question:"어느 모둠이 가장 많이 넣었을까요?"}, suggested_extras:["q_fun_basketball","r_score_compare"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표", content:"두 수의 **크기**를 **비교**해요"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 회수", content:"9차에서 \"0과 1 중 더 작은 수는?\"이라는 질문 — 정답 **0**!"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"표현 구분 — 양 vs 수", pairs:[{kind:"양",visual:"🍎🍎🍎🍎🍎",words:"많다 / 적다"},{kind:"수",visual:"5 / 3",words:"크다 / 작다"}], note:"사물 그림은 '많다·적다', 숫자 카드는 '크다·작다'"}, suggested_extras:["x_quantity_vs_number"]},
    {id:"s05", stage:"전개", block:"visual_demo", data:{title:"일대일대응으로 보기", left:{circles:3},right:{circles:5}, note:"짝지어 그어보면 남는 쪽이 '더 많다'"}, suggested_extras:["m_one_to_one"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"십 배열판으로 비교", left:{ten_frame:6,num:6},right:{ten_frame:4,num:4}, component:"ten_frame", mode:"compare", compareWith:4, expression:"6은 4보다 크다 / 4는 6보다 작다"}, suggested_extras:["m_ten_frame_compare"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"양방향 표현", bidirect:["A는 B보다 **크다**","↔","B는 A보다 **작다**"], note:"같은 사실을 두 가지 방향으로 말할 수 있어요"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"5 vs 3 — 더 큰 쪽?", left:{ten_frame:5},right:{ten_frame:3}, component:"compare_picker", target:"larger"}, suggested_extras:["g_compare_race"]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"7 vs 8 — 더 작은 쪽?", left:{ten_frame:7},right:{ten_frame:8}, component:"compare_picker", target:"smaller", note:"한 칸 차이"}, suggested_extras:["m_one_more_one_less"]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"사과 vs 배 — 둘 다 세어보고 비교", left:{emoji:"🍎",count:5},right:{emoji:"🍐",count:7}, input:"count_input_2", answers:[5,7], note:"답한 뒤 자동으로 비교 결과 표시"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"카드 뒤집기 — 더 큰 수 가져가기", cards:[{n:5},{n:3}], component:"card_flip"}, suggested_extras:["g_card_war"]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"6보다 작은 수는?", base:6, direction:"less", input:"count_input", acceptRange:[0,5], note:"여러 정답 가능 (0~5)"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"5보다 크고 8보다 작은 수는?", range:[5,8], input:"count_input", acceptValues:[6,7], note:"정답 6 또는 7"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"match", data:{title:"양방향 표현 빈칸", left:"6은 4보다 ___", right:"4는 6보다 ___", options:["크다","작다"], answers:["크다","작다"]}, suggested_extras:["g_compare_race"]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"카드 뒤집기 3판", rounds:3, component:"card_flip", note:"카드 더미에서 매 판 두 장씩 뽑아 큰 수 가져가기 — 누가 더 많이?"}, suggested_extras:["g_card_war"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["일대일대응으로 비교","십 배열판으로 비교","양방향 표현 (크다 ↔ 작다)","0~9 한 줄"]}, suggested_extras:["b_compare_book"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가", items:["일대일대응을 잘했어요","십 배열판으로 비교했어요","양방향 표현을 했어요"], stars:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", preview:"**수학이랑 확인해요** — 1단원을 모두 점검!"}, suggested_extras:[]}
  ],
  extras: [
    {id:"q_fun_basketball", type:"fun_question", icon:"💡", title:"농구 시합 점수", content:"우리 팀 7점, 상대 팀 5점. 누가 이기고 있을까? 점수가 큰 쪽이 이겨요.", fit_slides:["motivate","real_world"]},
    {id:"q_fun_height", type:"fun_question", icon:"💡", title:"형제 키 비교", content:"형은 6살, 동생은 4살. 나이 외에 키도 비교해 봐요. 더 큰 쪽 / 더 작은 쪽.", fit_slides:["motivate","compare"]},
    {id:"r_score_compare", type:"real_world", icon:"🌍", title:"운동 경기 점수", content:"축구·농구·야구 모든 경기에서 점수의 크기를 비교해서 승부를 가려요. 매일 만나는 '크기 비교'.", fit_slides:["motivate","real_world"]},
    {id:"r_class_count", type:"real_world", icon:"🌍", title:"반별 학생 수", content:"1반 8명, 2반 9명. 어느 반이 더 많을까? 학교에서 늘 만나는 비교.", fit_slides:["real_world"]},
    {id:"r_age_compare", type:"real_world", icon:"🌍", title:"나이 비교", content:"형 8살, 나 7살, 동생 5살. 형이 가장 큰 수, 동생이 가장 작은 수. 가족 안에서 자연스럽게.", fit_slides:["real_world","advanced_problem"]},
    {id:"m_one_to_one", type:"tip", icon:"🧩", title:"일대일대응 — 줄잇기", content:"두 그룹의 사물을 짝지어 그어보기. 남는 쪽이 더 많음. 어린 학생도 직관적으로 이해.", fit_slides:["concept","visual_demo"]},
    {id:"m_ten_frame_compare", type:"tip", icon:"🧩", title:"십 배열판 두 개 나란히", content:"두 수를 십 배열판 두 개로 나란히 보여주면 위·아래 차이가 한 눈에. 어느 쪽이 더 많은지 직관 인식.", fit_slides:["concept","visual_demo"]},
    {id:"m_one_more_one_less", type:"tip", icon:"🧩", title:"한 칸 차이 인식", content:"7과 8 같은 한 칸 차이는 시각으로 잘 안 보일 수 있음. 손가락으로 차이 칸을 짚으며 강조.", fit_slides:["basic_problem","concept"]},
    {id:"g_card_war", type:"game", icon:"🎮", title:"카드 전쟁", content:"수 카드 0~9 두 더미. 짝과 매 판 한 장씩 동시에 펴서 큰 수 가져가기. 더 많이 가져가는 사람이 승리.", fit_slides:["game","advanced_problem"]},
    {id:"g_compare_race", type:"game", game_kind:"compare_pair", icon:"🎮", title:"큰 수 작은 수 빠르게 고르기", description:"두 카드 중 큰 수(또는 작은 수)를 빠르게 골라 보세요.", content:"0~9 범위 두 수를 십 배열판으로 보여주고, '큰 수' 또는 '작은 수' 지시에 맞게 선택. 10라운드. 정답마다 양방향 표현 자동 표시.", hint:"십 배열판의 채워진 칸을 비교해서 골라요.", rounds_total:10, range:[0,9], visual:"ten_frame", fit_slides:["basic_problem","compare","game"]},
    {id:"g_bigger_smaller_race", type:"game", icon:"🎮", title:"크다·작다 빠르게", content:"교사가 두 수를 외치면 학생이 '큰 수!' 또는 '작은 수!' 빨리 답하기. 점수 누적.", fit_slides:["game","basic_problem"]},
    {id:"g_dice_compare", type:"game", icon:"🎮", title:"주사위 비교", content:"주사위 두 개 굴려서 나온 수 비교. 양방향 표현으로 두 번 말하기 — 'A는 B보다 ___'·'B는 A보다 ___'.", fit_slides:["game","concept"]},
    {id:"b_compare_book", type:"book", icon:"📖", title:"『큰 것은 무엇? 작은 것은?』", content:"여러 사물을 비교하는 그림책. 양·수 두 자리 표현 모두 등장.", source:"국내 그림책 다수 — 도서관 확인", fit_slides:["motivate","summary"]},
    {id:"x_quantity_vs_number", type:"misconception", icon:"❓", title:"오개념 — '많다=크다, 적다=작다'", content:"학생이 '사과가 크다'·'사과가 적다'처럼 표현 혼용. 양은 '많다/적다', 수는 '크다/작다'로 일관되게.", fit_slides:["concept","real_world"]},
    {id:"x_size_vs_number", type:"misconception", icon:"❓", title:"오개념 — 작은 사물 = 작은 수", content:"콩 5개와 사과 3개 비교 시 '작은 사물(콩)이 많으니까 수가 더 큰가?'라고 헷갈리는 경우. 수 자체를 비교하는 것임을 강조.", fit_slides:["concept","compare"]},
    {id:"e_three_compare", type:"extension", icon:"⬆", title:"세 수 비교", content:"오늘은 두 수 비교. 곧 세 수도 비교해요 — 가장 크다·가장 작다·중간. 5단원에서!", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l11"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 11,
    title: "수학이랑 확인해요 (단원 평가)",
    std: "[2수01-01], [2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 (평가용 슬 의미)",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l11.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"단원 평가 — 1단원에서 배운 것 점검", scene:"야채 농장 풍경 (지도서 p.34)", emojis:["🥬","🥕","🥒"]}, suggested_extras:["q_fun_garden"]},
    {id:"s02", stage:"도입", block:"review", data:{title:"단원 전체 회상", areas:[{label:"수 세기·읽기",ten_frame:7,num:7},{label:"순서·기준순서",ord:["첫째","다섯째","아홉째"]},{label:"±1·0",staircase:[0,1,2,3,4,5,6,7,8,9]},{label:"크기 비교",compare:"6 > 4"}]}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"self_assessment", data:{title:"자기 점검 안내", question:"어느 부분이 자신 있나요? 마지막에 별로 평가해요", preview_slide:"s17"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"summary", data:{title:"핵심 1 — 수 세기·읽기 (02-03·04-05차 종합)", ten_frame:7, num:7, table:[{num:7,kor:"일곱",han:"칠"}]}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"summary", data:{title:"핵심 2 — 수의 순서·기준 (06·07차 종합)", sequence:[1,2,3,4,5,6,7,8,9], ordinals:["첫째","둘째","셋째","넷째","다섯째","여섯째","일곱째","여덟째","아홉째"]}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"summary", data:{title:"핵심 3 — ±1·0 (08·09차 종합)", linking_cube_staircase:{range:[0,9]}, arrows:["±1"], note:"0~9 계단"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"summary", data:{title:"핵심 4 — 두 수 크기 비교 (10차 종합)", left:{ten_frame:6},right:{ten_frame:4}, bidirect:["6 > 4","4 < 6"]}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"평가 1번 — 야채 수 세어 쓰기", items:[{emoji:"🥬",count:4},{emoji:"🥕",count:9},{emoji:"🥒",count:7}], answers:[4,9,7], input:"count_input_3", note:"답한 뒤 우리말·한자어 매칭"}, suggested_extras:["m_two_readings"]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"평가 2번 — 당근 3→0", component:"decrement_animation", from:3, to:0, items:"🥕", input:"count_input", answer:0}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"평가 4번 — 1~9 빈칸", component:"sequence_arrange", direction:"asc", range:[1,9], blanks_only:true}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"평가 5번 — 책 9권 기준 순서", line_count:9, component:"position_picker", direction:"both", left_target:6, right_target:2}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"평가 3번 — 3 vs 6 비교", left:{ten_frame:3},right:{ten_frame:6}, component:"compare_picker", target:"larger", bidirect:["3은 6보다 작다","6은 3보다 크다"]}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"평가 6번 일부 — 캔 5보다 1 적은 유리병", base:5, mode:"choice4", direction:"less", component:"more_less_one", answer:4}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"평가 6번 일부 — 캔 5보다 1 많은 페트병", base:5, mode:"choice4", direction:"more", component:"more_less_one", answer:6}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"종합 — 분리배출 세 그룹", items:[{label:"캔",count:5},{label:"유리병",count:4},{label:"페트병",count:6}], answers:[5,4,6], input:"count_input_3", note:"세 수 비교까지 한 번에 (실생활 연결)"}, suggested_extras:["r_recycling"]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원 학습 목표 회수", points:["수 세기와 두 가지 읽기","순서와 기준 순서","±1과 0","수의 크기 비교"], note:"이 모든 것을 1단원에서 배웠어요"}, suggested_extras:["g_unit_review_match"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 평가 — 3차원", dimensions:["지식·이해","과정·기능","가치·태도"], prompts:["0~9까지의 수를 정확히 이해했어요","두 수의 크기를 잘 비교했어요","수 학습에 즐겁게 참여했어요"], starsPerDimension:3}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원", preview:"**여러 가지 모양** — 동그라미·세모·네모를 찾아봐요"}, suggested_extras:["e_to_unit2"]}
  ],
  extras: [
    {id:"q_fun_garden", type:"fun_question", icon:"💡", title:"우리 동네 텃밭", content:"우리 동네 텃밭에 배추·당근·무가 자라요. 어느 채소가 가장 많을까? 직접 가서 세어 봐요.", fit_slides:["motivate","real_world"]},
    {id:"q_fun_market", type:"fun_question", icon:"💡", title:"마트 야채 코너", content:"마트 야채 코너에서 사과 5개·배 6개·귤 9개를 봤어요. 어느 게 가장 많고, 가장 적을까?", fit_slides:["motivate","real_world"]},
    {id:"r_recycling", type:"real_world", icon:"🌍", title:"분리배출", content:"집에서 캔·유리병·페트병을 나눠 버려요. 일주일에 몇 개씩 나오는지 세 보고 어느 게 가장 많은지 비교해 봐요.", fit_slides:["real_world","advanced_problem"]},
    {id:"r_lunch_count", type:"real_world", icon:"🌍", title:"급식 반찬 수", content:"오늘 급식 반찬이 5가지면 어제는 4가지였을 수도. 비교해 봐요. 매일 만나는 수 세기·비교.", fit_slides:["real_world","summary"]},
    {id:"m_two_readings", type:"tip", icon:"🧩", title:"우리말·한자어 두 가지", content:"수 세기는 우리말('넷')·순서·번호는 한자어('사번'). 평가 자리에서 둘 다 확인.", fit_slides:["basic_problem","summary"]},
    {id:"m_assessment_tip", type:"tip", icon:"🧩", title:"평가 진행 팁", content:"평가는 점수보다 어디가 어렵고 어디가 자신 있는지 확인하는 자리. 못한 부분도 다시 배우면 돼요.", fit_slides:["motivate","self_assessment"]},
    {id:"g_review_quiz", type:"game", icon:"🎮", title:"단원 복습 퀴즈", content:"짝과 함께 1단원 핵심 4가지(수 세기·순서·±1·비교)에서 한 문제씩 만들어 풀기. 모두 맞히면 박수!", fit_slides:["game","summary"]},
    {id:"g_unit_review_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"1단원 종합 짝짓기", description:"1단원에서 배운 여러 영역의 짝을 찾아보세요.", content:"수 세기·순서·0·시각화를 한 게임으로 종합. 5쌍 — 영역별 1개씩.", hint:"읽기·순서수·십 배열판·0까지 1단원 전체를 떠올려 봐요.", pairs:[
      { a:{text:"4"}, b:{ten_frame:4} },
      { a:{text:"7"}, b:{emoji:"🥕", count:7} },
      { a:{text:"9"}, b:{text:"구"} },
      { a:{text:"5"}, b:{text:"다섯째"} },
      { a:{text:"0"}, b:{ten_frame:0} }
    ], fit_slides:["match","game","summary"]},
    {id:"g_card_review", type:"game", icon:"🎮", title:"카드로 빠른 복습", content:"0~9 카드 + 첫째~아홉째 카드 + '크다·작다·1만큼 더 큰·1만큼 더 작은' 카드를 섞어 빠르게 답하기.", fit_slides:["game","summary"]},
    {id:"b_review_book", type:"book", icon:"📖", title:"『수의 세계 한 바퀴』", content:"0~9까지의 수, 순서, 크기 비교를 모두 다루는 종합 그림책. 단원 마무리 자리.", source:"국내 그림책 다수 — 도서관 확인", fit_slides:["summary","motivate"]},
    {id:"x_assessment_fear", type:"misconception", icon:"❓", title:"오개념 — 평가 = 점수", content:"평가를 점수로만 받아들이는 학생. 평가는 자기를 알아가는 자리임을 강조. 못한 부분은 다시 배우면 됨.", fit_slides:["motivate","self_assessment"]},
    {id:"e_to_unit2", type:"extension", icon:"⬆", title:"다음 단원 예고", content:"2단원 — 여러 가지 모양. 동그라미·세모·네모를 만나며 도형의 세계로!", fit_slides:["next_lesson"]},
    {id:"e_to_unit5", type:"extension", icon:"⬆", title:"5단원에서 10·20·30…", content:"오늘 0~9까지를 마쳤어요. 곧 10·20·30… 50까지의 수를 만나요. 두 자리 수의 세계.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u1_l1"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 1,
    title: "단원 도입 (학교가 즐거워요)",
    std: "[2수01-01]",
    duration_min: 40,
    lesson_format: "안 B — 단원 진입 슬 묶음 (본 차시 X, 점수 X)",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l01.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"우리 주변에는 셀 수 있는 것이 많아요", desc:"학교 가는 길에 무엇이 보이나요? 그림에서 셀 수 있는 것을 친구와 이야기해 봐요 (🐿️🐰🦆🦋🐟🐸🌼🌳👫)"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"단원에서 배울 7가지", desc:"1. 수의 필요성·사물의 수 세기 / 2. 1~9 세고 읽고 쓰기 / 3. 몇째인지 순서 / 4. ±1 큰 수·작은 수 / 5. 0의 뜻 / 6. 두 수의 크기 비교 / 7. 1~9·0 문제 해결"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"단원 차시 미리보기", desc:"1. 1~5 / 2. 6~9 / 3. 순서 / 4. 수의 순서 / 5. ±1 / 6. 0 / 7. 크기 비교 / 8. 단원 평가"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"단원 실천 활동", desc:"🏠 수를 세어 준비물 챙기기 / 🚦 수를 찾아 말하기 / 🎒 수와 함께 놀기 — 단원을 배우며 실천"}, suggested_extras:[]},
    {id:"s05", stage:"정리", block:"next_lesson", data:{title:"준비됐어요?", desc:"단원에서 만날 수들과 친해질 시간 — 2차시 「1, 2, 3, 4, 5를 알아볼까요」로 진입"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u1_l12"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: 12,
    title: "수학이랑 만들어요 (수 그림책)",
    std: "[2수01-01]",
    duration_min: 40,
    lesson_format: "안 B — 단원 아웃트로 + \"내 수 컬렉션\" 자유 발상 (본 차시 X, 점수 X)",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l12.html"
  },
  slides: [
    {id:"s01", stage:"정리", block:"summary", data:{title:"우리가 배운 것", desc:"✓ 수를 세는 것 / ✓ 1~9 읽고 쓰기 / ✓ 몇째인지 순서 / ✓ ±1 큰 수·작은 수 / ✓ 0의 뜻 / ✓ 두 수의 크기 비교"}, suggested_extras:[]},
    {id:"s02", stage:"응용문제", block:"real_world", data:{title:"좋아하는 수를 골라요", desc:"단원에서 만난 0~9 중 가장 좋아하는 수 고르기 (자유 선택, 정답 X)"}, suggested_extras:[]},
    {id:"s03", stage:"응용문제", block:"real_world", data:{title:"내 수 컬렉션", desc:"좋아하는 수를 어디서 봤어요? 생각나는 것 자유 발상 자리 (정답 없음, 자유롭게 떠올리기) — 저장 기능 자리"}, suggested_extras:[]},
    {id:"s04", stage:"정리", block:"self_assessment", data:{title:"단원이 즐거웠나요?", desc:"별 1~5개 자리 단원 평가 (자기 평가 자리)"}, suggested_extras:[]},
    {id:"s05", stage:"정리", block:"next_lesson", data:{title:"다음 단원 예고", desc:"2단원 — 여러 가지 모양 (🔷⚪🔺 동그라미·세모·네모)"}, suggested_extras:[]},
    {id:"s06", stage:"정리", block:"next_lesson", data:{title:"잘했어요!", desc:"1단원을 모두 끝냈어요 — 단원 목록으로 진입"}, suggested_extras:[]}
  ],
  extras: []
};
