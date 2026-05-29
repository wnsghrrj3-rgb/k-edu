/* ============================================================================
   1학년 수학 2단원 (여러 가지 모양) 차시 데이터
   - 키 형식: LESSONS["u2_l{NN}"]
   - 모양 단원 — 학생 노출 자리에 수학용어(직육면체·원기둥·구) 사용 금지.
     일상용어(상자 모양·기둥 모양·공 모양)로만 표현. 교사 안내·misconception 자리는 OK.
   ============================================================================ */

(function () {

  // ─────────── 1차시: 단원 도입 — 여러 가지 모양 ───────────
  // 안 B 단원 진입 자리. 모양이 분류 기준임을 인식. 평가 X. 분위기·동기 유발 중심.
  LESSONS["u2_l01"] = {
    meta: {
      title: "1학년 수학 2단원 1차시",
      subtitle: "단원 도입 — 여러 가지 모양",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"2단원 시작\n여러 가지 모양\n상자 · 기둥 · 공",emoji:""},suggested_extras:["v_shape_song","r_morning_classroom"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"교실 안을 살펴봐요",kids:[{face:"🙂",label:"필통"},{face:"🙂",label:"공"},{face:"🙂",label:"휴지"}],question:"교실에는 어떤 물건들이 있을까요?\n물건마다 **모양이 어떻게 다른가요**?"},suggested_extras:["q_fun_around","r_classroom_items"]},
  {id:"s03",stage:"도입",block:"question",data:{title:"같아 보여도 다른 점이 있어요",content:"두 교실이 비슷해 보여요.\n그런데 자세히 보면 **물건의 모양이 다른** 자리가 있어요.\n어떤 자리가 다를까요?"},suggested_extras:["m_observation_tip"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"세 가지 모양이 있어요",bidirect:["📦 **상자 모양**","↓","🥫 **기둥 모양**","↓","⚽ **공 모양**","↓","우리 주변에 모두 있어요"]},suggested_extras:["m_three_shapes","x_no_math_term"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"상자 모양 — 📦",ten_frame_solo:{count:0,is_anchor:true,label:"**상자 모양**\n네모난 면이 보여요\n쌓을 수 있어요"},sub_text:"필통 · 책 · 휴지 상자 · 주사위"},suggested_extras:["r_box_in_class","m_box_features"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"기둥 모양 — 🥫",ten_frame_solo:{count:0,is_anchor:true,label:"**기둥 모양**\n위아래는 동그래요\n옆은 매끈해요"},sub_text:"두루마리 휴지 · 통조림 · 컵 · 연필"},suggested_extras:["r_cylinder_in_class","m_cylinder_features"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"공 모양 — ⚽",ten_frame_solo:{count:0,is_anchor:true,label:"**공 모양**\n어디서 봐도 동그래요\n잘 굴러가요"},sub_text:"공 · 구슬 · 풍선 · 사탕"},suggested_extras:["r_ball_in_class","m_sphere_features"]},
  {id:"s08",stage:"전개",block:"compare",data:{title:"같은 자리, 다른 모양",items:[{ten_frame:0,num:0,caption:"📦 **상자**\n네모난 휴지"},{ten_frame:0,num:0,caption:"같은 휴지인데",is_anchor:true},{ten_frame:0,num:0,caption:"🥫 **기둥**\n두루마리 휴지"}]},suggested_extras:["m_same_use_diff_shape","x_shape_only"]},

  // ===== 기본 (3) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"교실에서 상자 모양 찾기",question:"우리 교실 안에서\n**상자 모양**을 찾아봐요.\n어떤 물건이 있을까요?"},suggested_extras:["a_find_box","r_box_in_class"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"기둥 모양과 공 모양도",question:"이번에는 **기둥 모양**과 **공 모양**도\n찾아봐요.\n각각 무엇이 있나요?"},suggested_extras:["a_find_cylinder","a_find_sphere"]},
  {id:"s11",stage:"기본문제",block:"question",data:{title:"친구와 같은 답일까요?",content:"내가 찾은 물건과\n친구가 찾은 물건이 **같을 수도 있고 다를 수도 있어요**.\n둘 다 맞아요. 함께 이야기해 봐요."},suggested_extras:["a_pair_share","m_many_answers"]},

  // ===== 응용 (4) =====
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"집에도 세 가지 모양이 있어요",scenario:{icon:"🏠",body:"식탁 위 **그릇**은 어떤 모양?\n냉장고 안 **음료수 캔**은?\n장난감 **공**은?\n집 안에도 모양이 가득해요."}},suggested_extras:["r_home_shapes","q_fun_home_hunt"]},
  {id:"s13",stage:"응용문제",block:"offline_activity",data:{title:"단원 실천 활동 — 모양 색칠표",tag:"교과서 40~41쪽",icon:"🎨",body:"단원 동안 **상자·기둥·공** 모양을 찾을 때마다\n각 모양 줄에 한 칸씩 색칠해요.\n한 줄에 **9칸**.\n단원이 끝날 때 누가 가장 많이 채웠을까요?",materials:"교과서 40~41쪽 · 색연필"},suggested_extras:["a_color_table","m_color_code"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"내가 실천할 활동 정하기",content:"\"제가 실천할 단원 실천 활동은\n( ) 입니다.\"\n**한 가지 또는 두세 가지** 골라요.\n단원 동안 꾸준히 해 봐요."},suggested_extras:["a_promise_select"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"교실 모양 보물찾기",steps:["교실을 한 바퀴 둘러보기","상자 모양 한 가지 찾아 손가락으로 가리키기","기둥 모양 한 가지 찾아 가리키기","공 모양 한 가지 찾아 가리키기","찾은 것을 짝과 비교하기"]},suggested_extras:["g_classroom_hunt","m_safety_walk"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["주변에 **세 가지 모양**이 있어요","📦 **상자 모양** · 🥫 **기둥 모양** · ⚽ **공 모양**","같은 자리라도 **모양이 다른 물건**이 있어요","단원 동안 **꾸준히 찾아** 봐요"]},suggested_extras:["b_shape_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"세 가지 모양 이름을 모두 말할 수 있나요?\n각 모양의 물건을 한 가지씩 떠올릴 수 있나요?\n단원 실천 활동을 정했나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"세 가지 모양을 **자세히** 살펴봐요!\n어떤 점이 같고 어떤 점이 다를까요?",emoji:""},suggested_extras:["e_compare_preview"]}
    ],
    extras: [
  {id:"v_shape_song",type:"video",icon:"🎥",title:"모양 노래 — 상자·기둥·공",url:"https://www.youtube.com/results?search_query=모양+노래+동요+상자+기둥+공",description:"세 가지 모양을 노래로 익히는 동요. 도입 자리에 흥미 유발. 단원 진입 분위기 만들기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_morning_classroom",type:"real_world",icon:"🌍",title:"아침 교실 풍경",content:"아침에 교실에 들어오면 책상·필통·공·휴지 같은 물건이 곳곳에 있어요. 매일 만나는 물건도 모양으로 보면 새로워요.",fit_slides:["cover","motivate"]},
  {id:"q_fun_around",type:"fun_question",icon:"💡",title:"가장 가까운 물건",content:"지금 책상 위에서 가장 가까운 물건은 무엇인가요? 그 물건은 어떤 모양일까요? 상자 모양? 기둥 모양? 공 모양?",fit_slides:["motivate"]},
  {id:"r_classroom_items",type:"real_world",icon:"🌍",title:"교실 안 물건들",content:"필통·연필·책·지우개·공·휴지·쓰레기통·시계. 모두 모양이 달라요. 같은 일을 하는 물건도 모양이 다를 수 있어요.",fit_slides:["motivate","real_world"]},
  {id:"m_observation_tip",type:"tip",icon:"🧩",title:"자세히 보기",content:"비슷해 보이는 두 그림에서 다른 자리를 찾는 활동은 관찰력 학습의 좋은 출발. 처음엔 색·크기에 끌리지만 모양 차이로 시선을 옮기도록 안내.",fit_slides:["question"]},
  {id:"m_three_shapes",type:"tip",icon:"🧩",title:"세 모양만 분명히",content:"1학년 모양 학습은 상자·기둥·공 세 가지로 한정. 더 많은 모양(원뿔·각뿔 등)은 다루지 않아요. 학생 머릿속에 세 모양만 분명하게.",fit_slides:["concept"]},
  {id:"x_no_math_term",type:"misconception",icon:"❓",title:"오개념 회피: 어려운 이름 X",content:"수학적 용어(직육면체·원기둥·구)는 학생 노출 자리에 사용 금지. 교사 본인이 알고 있되 학생에게는 **상자·기둥·공**으로만 말해 주세요.",fit_slides:["concept"]},
  {id:"r_box_in_class",type:"real_world",icon:"🌍",title:"상자 모양 — 교실 어디에?",content:"책 · 필통(네모난) · 휴지 상자 · 분필 통 · 주사위 · 사물함. 교실 안에 상자 모양이 가장 흔해요.",fit_slides:["visual_demo","basic_problem"]},
  {id:"m_box_features",type:"tip",icon:"🧩",title:"상자 모양 특징",content:"네모난 면이 6개. 모서리가 분명. 쌓기 좋음. 학생이 손으로 만져 보면 평평한 면을 바로 느껴요.",fit_slides:["visual_demo"]},
  {id:"r_cylinder_in_class",type:"real_world",icon:"🌍",title:"기둥 모양 — 교실 어디에?",content:"두루마리 휴지 · 풀(스틱) · 연필 · 컵 · 분필. 위아래는 동그랗고 옆은 매끈한 모양이 기둥 모양.",fit_slides:["visual_demo","basic_problem"]},
  {id:"m_cylinder_features",type:"tip",icon:"🧩",title:"기둥 모양 특징",content:"위아래 동그라미 두 개 + 옆은 매끈. 굴릴 수 있어요(옆으로). 세우면 잘 서요. 두 가지 성질을 모두 가진 흥미로운 모양.",fit_slides:["visual_demo"]},
  {id:"r_ball_in_class",type:"real_world",icon:"🌍",title:"공 모양 — 교실 어디에?",content:"운동장 공 · 구슬 · 사탕 · 풍선(둥근). 어디서 봐도 둥근 것이 공 모양. 교실 안에는 비교적 적어요.",fit_slides:["visual_demo","basic_problem"]},
  {id:"m_sphere_features",type:"tip",icon:"🧩",title:"공 모양 특징",content:"어디서 봐도 동그라미. 평평한 면 없음. 어느 방향으로도 굴러가요. 학생이 손에 쥐어 보면 가장 잘 알 수 있어요.",fit_slides:["visual_demo"]},
  {id:"m_same_use_diff_shape",type:"tip",icon:"🧩",title:"같은 일, 다른 모양",content:"같은 용도(휴지)라도 모양이 다를 수 있음을 강조. 모양은 **분류 기준 중 하나**이지 물건의 용도와 같은 것이 아님.",fit_slides:["compare"]},
  {id:"x_shape_only",type:"misconception",icon:"❓",title:"오개념: 모양 = 크기·색",content:"학생이 '큰 공·작은 공'을 다른 모양이라 하거나 '빨간 상자·파란 상자'를 다른 모양이라 함. 크기·색은 모양이 아니라는 점을 분명히.",fit_slides:["compare","concept"]},
  {id:"a_find_box",type:"other_activity",icon:"📚",title:"다른 활동 — 상자 찾기",content:"학생을 두세 모둠으로 나눠 1분 안에 상자 모양 물건을 가장 많이 찾는 모둠. 가벼운 분위기로 진행. 답은 다양해도 좋아요.",fit_slides:["basic_problem"]},
  {id:"a_find_cylinder",type:"other_activity",icon:"📚",title:"다른 활동 — 기둥 찾기",content:"기둥 모양은 상자만큼 많지 않아요. 학생이 찾기 어려우면 두루마리 휴지·연필을 보여 주며 힌트.",fit_slides:["basic_problem"]},
  {id:"a_find_sphere",type:"other_activity",icon:"📚",title:"다른 활동 — 공 찾기",content:"교실에 공 모양은 가장 적어요. 학생이 찾지 못하면 운동장이나 체육관에서 가져와 보여 주기.",fit_slides:["basic_problem"]},
  {id:"a_pair_share",type:"other_activity",icon:"📚",title:"다른 활동 — 짝 비교",content:"내가 찾은 것과 짝이 찾은 것을 짧게 비교. 같으면 '같다', 다르면 '나는 ○ 너는 ○'. 듣고 말하기 통합.",fit_slides:["question"]},
  {id:"m_many_answers",type:"tip",icon:"🧩",title:"여러 답 인정",content:"\"답이 하나가 아니다\"는 1학년 수학에 처음 익히기 좋은 자리. 친구와 다른 답도 모두 맞을 수 있음을 자연스럽게 경험.",fit_slides:["question"]},
  {id:"r_home_shapes",type:"real_world",icon:"🌍",title:"집에서 만나는 모양",content:"식탁 위 그릇·접시·컵 / 냉장고 안 우유갑·음료수 캔·달걀 / 거실의 쿠션·책·공. 집 안에도 모양이 가득해요.",fit_slides:["real_world"]},
  {id:"q_fun_home_hunt",type:"fun_question",icon:"💡",title:"집에서 모양 보물찾기",content:"오늘 집에 가서 부모님과 함께 세 모양을 각각 한 가지씩 찾아 와요. 내일 친구들에게 자랑해 봐요.",fit_slides:["real_world"]},
  {id:"a_color_table",type:"other_activity",icon:"📚",title:"색칠표 운영",content:"단원 5~6차시까지 누적되는 색칠표. 교실 벽에 큰 종이로 만들어 두면 학생 동기 부여에 좋아요.",fit_slides:["offline_activity"]},
  {id:"m_color_code",type:"tip",icon:"🧩",title:"색 코드 통일",content:"상자=연두 / 기둥=분홍 / 공=노랑처럼 색 코드를 단원 처음에 정해 두면 5~6차시까지 일관성 유지.",fit_slides:["offline_activity"]},
  {id:"a_promise_select",type:"other_activity",icon:"📚",title:"실천 다짐 카드",content:"학생이 골라 적은 다짐을 카드로 만들어 자기 책상 한쪽에 붙여 두기. 단원이 끝날 때 자기가 지킨 약속을 돌아봄.",fit_slides:["question"]},
  {id:"g_classroom_hunt",type:"game",icon:"🎮",title:"교실 모양 보물찾기",content:"제한 시간 안에 세 모양 각각 한 가지씩 찾기. 손가락으로 가리키고 짝과 확인. 빠르지 않아도 정확하면 칭찬.",fit_slides:["game"]},
  {id:"m_safety_walk",type:"tip",icon:"🧩",title:"교실 둘러보기 안전",content:"학생이 자리에서 일어나 돌아다니는 활동은 부딪힘 주의. 한 모둠씩 차례대로 또는 자기 자리 주변만 둘러보기로 안전 확보.",fit_slides:["game"]},
  {id:"b_shape_book",type:"book",icon:"📖",title:"『모양은 어디에?』",content:"일상 곳곳에 숨어 있는 상자·기둥·공 모양을 찾아보는 그림책. 1학년 입문 자리에 잘 어울려요.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_compare_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"다음 차시에는 세 모양을 자세히 비교해 봐요. 어떤 점이 같고 어떤 점이 다를까요? 만져 보고 굴려 보고 쌓아 봐요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 2차시: 여러 가지 모양을 찾아볼까요 ───────────
  // 본 단원 본 차시. 학교 공간(체육관·보건실·도서관·화장실)에서 세 모양 찾기 + 분류 + 이름 짓기.
  LESSONS["u2_l02"] = {
    meta: {
      title: "1학년 수학 2단원 2차시",
      subtitle: "여러 가지 모양을 찾아볼까요",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"여러 가지 모양을\n찾아볼까요?\n학교 곳곳에 모양이 있어요",emoji:""},suggested_extras:["v_school_tour","r_school_walk"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"📦 **상자 모양** · 🥫 **기둥 모양** · ⚽ **공 모양**\n오늘은 **학교 안 곳곳**에서\n세 가지 모양을 찾아봐요"},suggested_extras:["m_recall_three"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"학교에 가면",kids:[{face:"🏀",label:"체육관"},{face:"🩹",label:"보건실"},{face:"📚",label:"도서관"}],question:"각 공간에는 어떤 물건이 있을까요?\n그 물건들은 어떤 모양일까요?"},suggested_extras:["q_fun_school_space","r_school_spaces"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"visual_demo",data:{title:"체육관에서 — ⚽ 공 모양",ten_frame_solo:{count:0,is_anchor:true,label:"농구공 · 배구공 · 축구공\n모두 **공 모양**"},sub_text:"체육관에는 공 모양이 가장 많아요"},suggested_extras:["r_gym_balls","m_gym_thought"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"보건실에서 — 📦🥫⚽ 세 모양 모두",ten_frame_solo:{count:0,is_anchor:true,label:"수납장(📦) · 둥근 의자(🥫) · 솜(⚽)\n한 공간에 세 모양 모두 있어요"},sub_text:"같은 공간 안에도 모양이 다른 물건이 모여 있어요"},suggested_extras:["r_health_room","m_mixed_space"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"도서관에서 — 📦 상자 모양이 가득",ten_frame_solo:{count:0,is_anchor:true,label:"책(📦) · 책꽂이(📦) · 손 소독제(🥫)\n도서관은 상자 모양 천지!"},sub_text:"많은 책이 상자 모양이에요"},suggested_extras:["r_library_books","q_fun_book_shape"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"같은 모양끼리 모아 봐요",bidirect:["📦 책 · 필통 · 사물함","↓","🥫 두루마리 휴지 · 딱풀 · 연필꽂이","↓","⚽ 공 · 구슬 · 지구본","↓","같은 모양끼리 모이는 게 **분류**예요"]},suggested_extras:["m_classify_meaning","x_use_vs_shape"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 모양 이름 짓기",label:"오개념 주의",wrong:"\"빨간 모양\"·\"큰 모양\"으로 이름 짓기",right:"색깔·크기·쓰임이 아닌\n**모양의 특징**으로 이름을 지어요.\n(예: 상자 모양 · 사물함 모양 · 지우개 모양)",hint:"모양을 보면 떠오르는 물건으로 이름 짓기"},suggested_extras:["m_name_from_shape","a_class_naming"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"교실에서 세 모양 찾기",question:"우리 교실 안에서\n세 가지 모양을 각각 한 가지씩 찾아 봐요.\n어떤 물건이 있나요?"},suggested_extras:["r_classroom_three","a_find_each"]},
  {id:"s10",stage:"기본문제",block:"card_arrange",data:{title:"같은 모양끼리 통에 담기",instruction:"카드를 드래그해서 **같은 모양 통**에 담아 보세요",cards:["책","공","두루마리 휴지","필통","구슬","연필꽂이"],target:["상자","상자","기둥","공","공","기둥"]},suggested_extras:["a_drag_classify"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"4지선다 — 어떤 모양?",question:"**두루마리 휴지**는 어떤 모양일까요?\n① 상자 모양\n② 기둥 모양\n③ 공 모양\n④ 알 수 없어요"},suggested_extras:["m_answer_cylinder"]},
  {id:"s12",stage:"기본문제",block:"question",data:{title:"이 모양은 무엇과 닮았을까?",content:"📦 상자 모양 → 지우개? 사물함?\n🥫 기둥 모양 → 딱풀? 깡통?\n⚽ 공 모양 → 공? 사탕? 구슬?\n우리 반만의 **모양 이름**을 함께 정해 봐요."},suggested_extras:["a_class_naming","m_naming_rule"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"학교 공간 산책",scenario:{icon:"🏫",body:"체육관 → 공 모양\n도서관 → 상자 모양\n화장실 → 기둥 모양\n공간마다 **자주 만나는 모양**이 달라요."}},suggested_extras:["r_each_space","m_space_shape_pattern"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"학교 모양 산책",tag:"교실에서 함께 해요",icon:"👣",body:"학생들과 함께 학교를 한 바퀴 돌아 봐요.\n복도 · 화장실 앞 · 강당 입구.\n각 공간에서 **세 모양을 한 가지씩** 찾아\n공책에 그림으로 그려요.",materials:"공책 · 연필 · 색연필"},suggested_extras:["a_school_walk","m_safety_outside"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"\"도서관에 가면\" 놀이",steps:["둥글게 모여 앉기","첫 친구: '도서관에 가면 📦 책이 있고'","다음 친구: '도서관에 가면 📦 책이 있고, 📦 책꽂이도 있고'","계속 이어 가기 — 모양을 함께 외치기","틀리면 처음부터 다시"]},suggested_extras:["g_chain_game","g_space_card"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["**학교 곳곳**에서 세 가지 모양을 찾았어요","**같은 모양끼리 모으는 것**이 분류예요","공간마다 **자주 보이는 모양**이 달라요","우리 반만의 **모양 이름**도 정했어요"]},suggested_extras:["b_block_friend"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"세 모양 각각 물건 한 가지씩 말할 수 있나요?\n같은 모양끼리 모을 수 있나요?\n우리 반 모양 이름을 기억하나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"같은 모양끼리 **자세히 비교**해 봐요!\n모서리는? 면은? 굴러갈까?",emoji:""},suggested_extras:["e_compare_detail"]}
    ],
    extras: [
  {id:"v_school_tour",type:"video",icon:"🎥",title:"학교 한 바퀴 돌아보기",url:"https://www.youtube.com/results?search_query=학교+탐방+1학년+공간+소개",description:"학교 안 여러 공간을 보여 주는 영상. 도입 자리에 학생이 학교 전체를 인식하도록 도움.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_school_walk",type:"real_world",icon:"🌍",title:"입학 후 학교 둘러보기",content:"학기 초에 학교를 둘러본 기억을 떠올려요. 어느 공간에 어떤 물건이 있었는지 기억나나요? 그 물건들은 어떤 모양이었을까요?",fit_slides:["cover","motivate"]},
  {id:"m_recall_three",type:"tip",icon:"🧩",title:"세 모양 빠르게 회상",content:"도입 자리에서 1차시 세 모양을 한 번에 외치고 넘어가면 충분. 시간을 길게 들이지 않아요.",fit_slides:["review"]},
  {id:"q_fun_school_space",type:"fun_question",icon:"💡",title:"가장 좋아하는 공간",content:"학교에서 가장 좋아하는 공간은? 그 공간에 가면 가장 먼저 무엇이 보이나요? 어떤 모양이에요?",fit_slides:["motivate"]},
  {id:"r_school_spaces",type:"real_world",icon:"🌍",title:"학교의 여러 공간",content:"체육관·보건실·도서관·화장실·운동장·급식실·과학실. 공간마다 다른 일을 해요. 그래서 자주 보이는 물건도 달라요.",fit_slides:["motivate"]},
  {id:"r_gym_balls",type:"real_world",icon:"🌍",title:"체육관 — 공의 천국",content:"체육관에는 농구공·배구공·축구공·피구공이 가득. 모두 공 모양이지만 크기·색·재질은 다 달라요.",fit_slides:["visual_demo","real_world"]},
  {id:"m_gym_thought",type:"tip",icon:"🧩",title:"왜 공 모양이 많을까?",content:"체육관에 공 모양이 많은 이유 — 굴러가야 하니까. 학생에게 슬쩍 물어 보면 모양과 쓰임의 연결을 떠올려요.",fit_slides:["visual_demo"]},
  {id:"r_health_room",type:"real_world",icon:"🌍",title:"보건실 — 세 모양 모두",content:"수납장(상자) · 둥근 의자(기둥) · 솜(공). 한 공간 안에 세 모양이 모두 있을 수 있어요. 보건실은 그런 공간.",fit_slides:["visual_demo","real_world"]},
  {id:"m_mixed_space",type:"tip",icon:"🧩",title:"한 공간 = 한 모양 아니에요",content:"학생이 '체육관 = 공 모양만 있다'고 단정 짓기 쉬워요. 한 공간 안에도 여러 모양이 있다는 점을 보건실 예시로 풀어 주세요.",fit_slides:["visual_demo"]},
  {id:"r_library_books",type:"real_world",icon:"🌍",title:"도서관 — 책은 상자 모양",content:"책은 거의 다 상자 모양. 두꺼운 책·얇은 책 모두 네모난 면이 있어요. 도서관은 상자 모양의 보물 창고.",fit_slides:["visual_demo","real_world"]},
  {id:"q_fun_book_shape",type:"fun_question",icon:"💡",title:"가장 좋아하는 책의 모양",content:"가장 좋아하는 책 한 권을 떠올려 봐요. 그 책은 어떤 모양이에요? 더 두꺼울까요, 더 얇을까요?",fit_slides:["visual_demo"]},
  {id:"m_classify_meaning",type:"tip",icon:"🧩",title:"분류의 의미",content:"분류 = 같은 것끼리 모으기. 1학년 학생에게는 '같은 것 → 한 곳에'라는 단순 규칙으로 시작.",fit_slides:["concept"]},
  {id:"x_use_vs_shape",type:"misconception",icon:"❓",title:"오개념: 쓰임 = 모양",content:"학생이 '먹는 것'·'쓰는 것'으로 분류하려 함. 본 차시에서는 '쓰임' 분류가 아닌 **모양 분류**에 집중하도록 안내.",fit_slides:["concept"]},
  {id:"m_name_from_shape",type:"tip",icon:"🧩",title:"이름은 모양에서",content:"학급 합의 이름 짓기에서 학생이 '빨간 모양'·'큰 모양' 제안하면 부드럽게 '그건 색이고 크기야'라고 정정.",fit_slides:["misconception"]},
  {id:"a_class_naming",type:"other_activity",icon:"📚",title:"학급 모양 이름 정하기",content:"세 모양 각각 학급에서 부를 이름 한 가지 정하기. 예: 상자→사물함 모양 / 기둥→딱풀 모양 / 공→구슬 모양. 단원 동안 일관성 있게.",fit_slides:["misconception","question"]},
  {id:"r_classroom_three",type:"real_world",icon:"🌍",title:"교실에 세 모양 모두",content:"필통(상자) · 두루마리 휴지(기둥) · 운동장에서 가져온 공. 우리 교실 안에도 세 모양이 모두 있어요.",fit_slides:["basic_problem"]},
  {id:"a_find_each",type:"other_activity",icon:"📚",title:"각 모양 한 가지씩 찾기",content:"학생이 세 모양 모두를 찾기 어려우면 짝과 함께. 한 명이 한 모양씩 맡아도 좋아요.",fit_slides:["basic_problem"]},
  {id:"a_drag_classify",type:"other_activity",icon:"📚",title:"드래그 분류 운영",content:"태블릿이 있다면 직접 드래그. 없으면 칠판에 카드를 붙여 두고 학생이 차례로 통에 옮기는 방식.",fit_slides:["basic_problem"]},
  {id:"m_answer_cylinder",type:"tip",icon:"🧩",title:"답 = 기둥 모양",content:"두루마리 휴지는 위아래 동그라미 + 옆 매끈 = 기둥 모양. 학생이 답한 다음 왜 그렇게 생각했는지 물어 보면 설명력이 자랍니다.",fit_slides:["basic_problem"]},
  {id:"m_naming_rule",type:"tip",icon:"🧩",title:"이름 짓기 규칙",content:"한 모양에 한 가지 학급 이름 정하기. 여러 가지 이름이 나오면 투표나 가위바위보로 결정. 결정 후엔 단원 동안 일관성.",fit_slides:["question"]},
  {id:"r_each_space",type:"real_world",icon:"🌍",title:"공간마다 모양 색깔이 달라요",content:"체육관 = 공의 공간 / 도서관 = 상자의 공간 / 화장실 = 기둥의 공간. 공간이 어떤 일을 하느냐에 따라 모양이 모이는 경향이 있어요.",fit_slides:["real_world"]},
  {id:"m_space_shape_pattern",type:"tip",icon:"🧩",title:"규칙 발견 학습",content:"공간과 모양의 연결은 학생이 규칙을 발견하는 좋은 자리. '왜 그럴까?'를 함께 생각하면 흥미가 커져요.",fit_slides:["real_world"]},
  {id:"a_school_walk",type:"other_activity",icon:"📚",title:"학교 산책 운영",content:"한 학급이 다 같이 나가면 다른 학급에 방해. 모둠 단위로 짧게 또는 교사가 미리 사진 찍어 와서 화면으로 보여 주기.",fit_slides:["offline_activity"]},
  {id:"m_safety_outside",type:"tip",icon:"🧩",title:"교실 밖 활동 안전",content:"교실 밖으로 나가는 활동은 미리 안전 규칙 안내. 두 줄로 조용히 이동·뛰지 않기·만지지 않기.",fit_slides:["offline_activity"]},
  {id:"g_chain_game",type:"game",icon:"🎮",title:"\"도서관에 가면\" 놀이",content:"전래 놀이를 모양 학습과 합친 활동. 누적 외우기로 기억력도 연습. 틀려도 다시 시작 — 부담 없이 즐기는 게 목적.",fit_slides:["game"]},
  {id:"g_space_card",type:"game",icon:"🎮",title:"공간 카드 매칭",content:"4공간 카드 + 모양 카드 여러 장. 공간 카드를 보고 그 공간에 있을 만한 모양을 짝짓기. 빠르고 활기찬 짝 활동.",fit_slides:["game"]},
  {id:"b_block_friend",type:"book",icon:"📖",title:"『블록 친구』",content:"이시카와 코지 / 김정화 역. 장난감 블록을 소재로 한 그림책. 다양한 모양이 어떻게 어울려 큰 무언가를 만드는지 보여 줘요.",source:"이시카와 코지 / 키다리(2010)",fit_slides:["summary"]},
  {id:"e_compare_detail",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"다음 차시에는 세 모양의 면·모서리·굴러가는 성질을 자세히 비교해요. 만져 보고 굴려 보면 모양이 더 또렷해져요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 3차시: 여러 가지 모양을 알아볼까요 ───────────
  // 감각 운동적 학습. 만져 보기·쌓기·굴리기로 세 모양 특징 직관 파악.
  LESSONS["u2_l03"] = {
    meta: {
      title: "1학년 수학 2단원 3차시",
      subtitle: "여러 가지 모양을 알아볼까요",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"여러 가지 모양을\n알아볼까요?\n만져 보고 · 쌓아 보고 · 굴려 봐요",emoji:""},suggested_extras:["v_touch_song","r_touch_clue"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"📦 상자 · 🥫 기둥 · ⚽ 공\n학교 곳곳에서 세 모양을 **찾았어요**\n오늘은 세 모양을 **자세히 알아봐요**"},suggested_extras:["m_recall_l02"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"상자 속 물건 맞히기",kids:[{face:"🤔",label:"민준 — 손을 넣어요"},{face:"😀",label:"수아 — 들어요"},{face:"🤩",label:"하영 — 맞혀요!"}],question:"한 친구가 만져 보고\n어떤 모양인지만 **설명**해요.\n다른 친구들이 모양을 **맞혀요**."},suggested_extras:["a_touch_box","m_no_peek"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"세 모양의 특징",bidirect:["📦 **상자 모양** — 뾰족한 곳 · 평평한 면","↓","🥫 **기둥 모양** — 평평한 곳 · 둥근 곳 모두","↓","⚽ **공 모양** — 둥근 곳만"]},suggested_extras:["m_three_features","x_features_simple"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"쌓아 볼까요?",ten_frame_solo:{count:0,is_anchor:true,label:"📦 상자: 여러 방향 **쌓을 수 있어요**\n🥫 기둥: 세우면 쌓을 수 있어요\n⚽ 공: 쌓을 수 **없어요**"},sub_text:"평평한 면이 있어야 쌓을 수 있어요"},suggested_extras:["a_stack_test","m_flat_face"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"굴려 볼까요?",ten_frame_solo:{count:0,is_anchor:true,label:"📦 상자: 굴러가지 **않아요**\n🥫 기둥: 옆으로 누우면 **굴러가요**\n⚽ 공: 어느 방향으로도 **잘 굴러가요**"},sub_text:"둥근 부분이 있어야 굴러가요"},suggested_extras:["a_roll_test","m_round_part"]},
  {id:"s07",stage:"전개",block:"compare",data:{title:"한눈에 비교",items:[{ten_frame:0,num:0,caption:"📦 **상자**\n쌓기 ◯ · 굴리기 ✕"},{ten_frame:0,num:0,caption:"🥫 **기둥**\n쌓기 △ · 굴리기 △",is_anchor:true},{ten_frame:0,num:0,caption:"⚽ **공**\n쌓기 ✕ · 굴리기 ◯"}]},suggested_extras:["m_summary_table"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 기둥은 두 가지 성질",label:"오개념 주의",wrong:"기둥 모양은 쌓기·굴리기 둘 다 못해요",right:"기둥은 **두 가지 성질**을 가졌어요.\n**세우면** 쌓기 / **눕히면** 굴리기\n방향에 따라 달라져요!",hint:"두루마리 휴지를 세워 보고 눕혀 봐요"},suggested_extras:["m_cylinder_both","r_tissue_test"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"이 모양은 무엇일까?",question:"\"뾰족한 곳이 있어요.\n평평한 곳도 있어요.\n쌓을 수 있어요.\n굴러가지 않아요.\"\n어떤 모양일까요?"},suggested_extras:["m_clue_box"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"이 모양도 맞혀 봐요",question:"\"둥근 곳만 있어요.\n쌓을 수 없어요.\n어디로든 잘 굴러가요.\"\n어떤 모양일까요?"},suggested_extras:["m_clue_sphere"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"한 가지 더 — 어떤 모양?",question:"\"평평한 곳도 있고\n둥근 곳도 있어요.\n세우면 쌓을 수 있어요.\n옆으로 굴러가요.\"\n어떤 모양일까요?"},suggested_extras:["m_clue_cylinder"]},
  {id:"s12",stage:"기본문제",block:"card_arrange",data:{title:"쌓기·굴리기 결과 짝짓기",instruction:"각 모양에 맞는 **결과**를 짝지어 봐요",cards:["📦","🥫(세움)","🥫(눕힘)","⚽"],target:["여러 방향 쌓기","한 방향 쌓기","옆으로 굴러감","어디로든 굴러감"]},suggested_extras:["a_result_match"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"왜 공은 둥글까요?",scenario:{icon:"⚽",body:"축구공이 만약 **상자 모양**이라면?\n잘 굴러가지 않아\n축구를 할 수 없어요.\n**모양에는 이유가 있어요**."}},suggested_extras:["q_fun_box_ball","r_design_reason"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"다섯 고개 놀이",tag:"교실에서 함께 해요",icon:"❓",body:"한 학생이 마음에 모양 하나 정해요.\n다른 학생들이 **예/아니오** 질문 다섯 번까지.\n\"평평한 곳이 있나요?\"\n\"굴러가나요?\"\n좁혀 가며 답 맞히기!",materials:"세 모양 SVG 카드"},suggested_extras:["g_five_questions","m_question_skill"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"경사판 굴리기 실험",steps:["나무판이나 두꺼운 도화지로 경사 만들기","📦 상자 모양 올려서 손 떼기 — 결과는?","🥫 기둥 모양 올려서 — 결과는?","⚽ 공 모양 올려서 — 결과는?","결과를 함께 외쳐요!"]},suggested_extras:["a_slope_setup","m_safety_slope"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["세 모양을 **만져 보고 쌓아 보고 굴려 봤어요**","📦 상자: 뾰족·평평 / 쌓기 ◯ / 굴리기 ✕","🥫 기둥: 평평+둥근 / 두 가지 성질","⚽ 공: 둥근만 / 쌓기 ✕ / 굴리기 ◯"]},suggested_extras:["b_shape_book2"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"세 모양의 특징을 한 가지씩 말할 수 있나요?\n어떤 모양이 굴러가는지 알 수 있나요?\n어떤 모양이 쌓이는지 알 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"세 모양으로 **재미있는 무언가**를 만들어 봐요!\n쌓을 수 있는 모양은 어떻게 쌓을까요?",emoji:""},suggested_extras:["e_build_preview"]}
    ],
    extras: [
  {id:"v_touch_song",type:"video",icon:"🎥",title:"손으로 만져 봐 노래",url:"https://www.youtube.com/results?search_query=손으로+만져봐+동요+모양",description:"감각 활동 동요. 도입 자리에 활기를 주고 만지기 활동으로 자연스럽게 진입.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover"]},
  {id:"r_touch_clue",type:"real_world",icon:"🌍",title:"눈 감고 만지기",content:"눈을 감으면 손이 더 잘 느껴요. 평평한 면 · 둥근 면 · 뾰족한 모서리. 손은 모양을 읽는 또 다른 눈이에요.",fit_slides:["cover","motivate"]},
  {id:"m_recall_l02",type:"tip",icon:"🧩",title:"2차시 짧게 회상",content:"전 차시 분류 활동을 한두 마디로만 회상. 본론은 만져 보기·쌓기·굴리기.",fit_slides:["review"]},
  {id:"a_touch_box",type:"other_activity",icon:"📚",title:"촉각 상자 만들기",content:"천이나 종이로 위가 가려진 상자를 만들고 그 안에 세 모양 물건을 미리 넣어 두기. 학생이 손만 넣어 만져 보고 설명.",fit_slides:["motivate","basic_problem"]},
  {id:"m_no_peek",type:"tip",icon:"🧩",title:"보지 않기 약속",content:"상자 안을 들여다보지 않도록 약속. 친구가 만질 차례에는 다른 친구들이 자기 손으로 가려 주기 등 작은 규칙으로 분위기 유지.",fit_slides:["motivate"]},
  {id:"m_three_features",type:"tip",icon:"🧩",title:"특징은 분석 X 직관 O",content:"학생이 '면 6개·모서리 12개' 같은 분석을 외우게 하지 않아요. '평평하다·뾰족하다·둥글다' 정도 직관 표현이면 충분.",fit_slides:["concept"]},
  {id:"x_features_simple",type:"misconception",icon:"❓",title:"오개념: 어려운 용어 도입",content:"\"꼭짓점·모서리·면\" 같은 수학 용어는 1학년에 도입 X. 학생 노출 자리는 '곳·자리·부분'으로 부르기.",fit_slides:["concept"]},
  {id:"a_stack_test",type:"other_activity",icon:"📚",title:"쌓기 실험 실물",content:"교실 내 세 모양 물건 한 가지씩 (필통·두루마리 휴지·공) 준비해 교탁 위에서 쌓아 보기. 결과를 학생들이 함께 외치기.",fit_slides:["visual_demo"]},
  {id:"m_flat_face",type:"tip",icon:"🧩",title:"평평한 면이 핵심",content:"쌓기의 비밀 = 평평한 면. 평평한 면이 위로 가야 다음 모양을 올릴 수 있어요. 공은 평평한 곳이 없어서 못 쌓아요.",fit_slides:["visual_demo"]},
  {id:"a_roll_test",type:"other_activity",icon:"📚",title:"굴리기 실험 실물",content:"책상이나 바닥에 세 모양을 가볍게 굴려 보기. 누가 멀리 가는지가 아닌 '굴러가나 안 가나'만 보기.",fit_slides:["visual_demo"]},
  {id:"m_round_part",type:"tip",icon:"🧩",title:"둥근 부분이 굴러요",content:"굴리기의 비밀 = 둥근 부분. 둥근 부분이 바닥에 닿아야 굴러가요. 상자는 둥근 곳이 없어서 못 굴러요.",fit_slides:["visual_demo"]},
  {id:"m_summary_table",type:"tip",icon:"🧩",title:"비교표 정리",content:"칠판에 세 모양 + 쌓기·굴리기 결과를 표로 정리해 두면 학생들이 단원 끝까지 참고할 수 있어요.",fit_slides:["compare"]},
  {id:"m_cylinder_both",type:"tip",icon:"🧩",title:"기둥은 양다리",content:"기둥 모양은 '쌓기도 가능 · 굴리기도 가능'한 특별한 모양. 방향(세움/눕힘)에 따라 다른 성질을 보임을 분명히.",fit_slides:["misconception"]},
  {id:"r_tissue_test",type:"real_world",icon:"🌍",title:"두루마리 휴지로 보여 주기",content:"두루마리 휴지를 세워서 위에 책 한 권 올려 보세요. 잘 받쳐요. 이번엔 눕혀서 살짝 밀면 굴러가요. 한 물건이 두 가지를 다 해요.",fit_slides:["misconception"]},
  {id:"m_clue_box",type:"tip",icon:"🧩",title:"답 = 상자 모양",content:"뾰족·평평·쌓기·안 굴러감 → 상자 모양. 답 후 \"왜 그렇게 생각했어요?\"로 한 번 더 확인.",fit_slides:["basic_problem"]},
  {id:"m_clue_sphere",type:"tip",icon:"🧩",title:"답 = 공 모양",content:"둥근만·안 쌓임·잘 굴러감 → 공 모양. 세 모양 중 특징이 가장 분명한 모양이라 학생들이 빨리 맞혀요.",fit_slides:["basic_problem"]},
  {id:"m_clue_cylinder",type:"tip",icon:"🧩",title:"답 = 기둥 모양",content:"평평+둥근 모두·세우면 쌓기·옆으로 굴러감 → 기둥 모양. 두 성질을 모두 가진 모양은 기둥 하나뿐.",fit_slides:["basic_problem"]},
  {id:"a_result_match",type:"other_activity",icon:"📚",title:"결과 짝짓기 운영",content:"태블릿에서 드래그. 칠판에서 자석 카드 옮기기. 학생이 직접 결과를 짚어 가며 익히는 자리.",fit_slides:["basic_problem"]},
  {id:"q_fun_box_ball",type:"fun_question",icon:"💡",title:"네모 축구공?",content:"축구공이 만약 네모(상자 모양)였다면 어떻게 될까요? 굴러가나요? 차면 어디로 갈까요? 농구공이 네모라면? 함께 상상해 봐요.",fit_slides:["real_world"]},
  {id:"r_design_reason",type:"real_world",icon:"🌍",title:"모양에는 이유가 있어요",content:"바퀴는 굴러야 하니까 둥글어요. 책상은 평평해야 하니까 네모예요. 우리 주변 물건의 모양에는 다 까닭이 있어요.",fit_slides:["real_world"]},
  {id:"g_five_questions",type:"game",icon:"🎮",title:"다섯 고개 놀이",content:"한 학생이 모양 하나 정하고 나머지가 예/아니오 질문 5번 안에 맞히기. 좋은 질문 = 두 모양 이상 한 번에 좁히는 질문.",fit_slides:["offline_activity","game"]},
  {id:"m_question_skill",type:"tip",icon:"🧩",title:"좋은 질문 만들기",content:"\"상자 모양인가요?\"는 한 모양만 좁힘. \"평평한 곳이 있나요?\"는 두 모양을 한 번에 좁힘. 1학년 추론력 학습의 좋은 자리.",fit_slides:["offline_activity"]},
  {id:"a_slope_setup",type:"other_activity",icon:"📚",title:"경사판 만들기",content:"두꺼운 도화지·책·나무판 무엇이든. 책 두세 권 쌓고 그 위에 도화지 비스듬히 놓으면 즉석 경사판. 안전하게 낮은 높이로.",fit_slides:["game"]},
  {id:"m_safety_slope",type:"tip",icon:"🧩",title:"경사판 안전",content:"경사판은 낮게. 굴리는 물건은 작게. 굴러 떨어진 물건이 학생 발에 맞지 않도록 굴리는 자리 앞쪽을 비워 두세요.",fit_slides:["game"]},
  {id:"b_shape_book2",type:"book",icon:"📖",title:"『둥근 것 · 네모난 것』",content:"일상 물건이 어떻게 다른 모양을 가졌는지 차분히 보여 주는 그림책. 단원 중간 자리에 읽어 주면 모양 학습이 깊어져요.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_build_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"다음 차시에는 세 모양으로 만들기 활동을 해 봐요. 어떻게 쌓을지·어디에 굴릴지 직접 정해서 우리만의 작품을 만들어요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 4차시: 여러 가지 모양으로 만들어 볼까요 ───────────
  // 응용·창의. 세 모양으로 놀이터 만들기. 모양과 기능의 연결(시소 받침대=기둥).
  LESSONS["u2_l04"] = {
    meta: {
      title: "1학년 수학 2단원 4차시",
      subtitle: "여러 가지 모양으로 만들어 볼까요",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"여러 가지 모양으로\n만들어 볼까요?\n놀이터를 만들어 봐요",emoji:""},suggested_extras:["v_playground_song","r_playground_memory"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"세 모양의 **특징**\n📦 쌓기 ◯ · 굴리기 ✕\n🥫 두 가지 성질\n⚽ 쌓기 ✕ · 굴리기 ◯\n오늘은 그 특징을 **사용**해서 만들어요"},suggested_extras:["m_recall_l03"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"놀이터에 가면",kids:[{face:"🛝",label:"미끄럼틀"},{face:"⚖️",label:"시소"},{face:"⚽",label:"공"}],question:"놀이터 곳곳에 세 가지 모양이 숨어 있어요.\n어디에 어떤 모양이 있을까요?"},suggested_extras:["q_fun_playground","r_playground_shapes"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"visual_demo",data:{title:"놀이터에서 모양 찾기",ten_frame_solo:{count:0,is_anchor:true,label:"📦 계단 · 미끄럼틀 지붕\n🥫 시소 받침대 · 미끄럼틀 통로\n⚽ 둥근 의자 · 축구공"},sub_text:"한 놀이터 안에 세 모양이 모두 있어요"},suggested_extras:["m_playground_map"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"왜 시소 받침대는 기둥일까요?",bidirect:["시소는 **흔들려야** 해요","↓","흔들리려면 **굴러가야** 해요","↓","🥫 기둥 모양은 **잘 굴러가요**","↓","그래서 시소 받침대는 **기둥 모양**"]},suggested_extras:["x_box_seesaw","m_shape_function"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"잘못 만들면?",ten_frame_solo:{count:0,is_anchor:true,label:"📦 상자로 시소 받침대를 만들면\n→ **굴러가지 않아요**\n→ 시소가 **안 움직여요**"},sub_text:"모양은 쓰임에 맞게 골라야 해요"},suggested_extras:["x_wrong_shape","r_design_matters"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"두 가지 이상 함께",bidirect:["📦 + 🥫 → **그네** (기둥+상자)","↓","📦 + 🥫 → **미끄럼틀** (지붕 상자 + 통로 기둥)","↓","여러 모양을 **함께** 쓰면\n복잡한 것도 만들 수 있어요"]},suggested_extras:["m_combine_shapes","a_combo_examples"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 자유롭게 상상",label:"오개념 주의",wrong:"놀이터 = 미끄럼틀·시소·그네만",right:"실제 놀이터에 없는 것도\n**모양 특징만 맞으면** 새 기구로 만들 수 있어요!\n예: 굴러가는 둥근 회전판",hint:"창의적인 발상 모두 환영"},suggested_extras:["m_creative_play"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"card_arrange",data:{title:"놀이 기구 — 모양 짝짓기",instruction:"각 놀이 기구에 어울리는 **모양**을 짝지어 봐요",cards:["시소 받침대","미끄럼틀 지붕","둥근 회전판","계단"],target:["기둥","상자","공","상자"]},suggested_extras:["m_match_help"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"4지선다",question:"**그네 좌석**으로 가장 어울리는 모양은?\n① 📦 상자 모양\n② 🥫 기둥 모양\n③ ⚽ 공 모양\n④ 아무 모양이나 다 좋아요"},suggested_extras:["m_answer_box"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"한 가지 더",question:"**축구공**으로 어울리는 모양은?\n어떤 모양이어야\n잘 굴러가서 차고 놀 수 있을까요?"},suggested_extras:["m_answer_sphere"]},
  {id:"s12",stage:"기본문제",block:"offline_activity",data:{title:"우리만의 놀이터 그리기",tag:"공책에 그려요",icon:"✏️",body:"공책 한 페이지를 우리만의 놀이터로!\n**세 모양을 모두 사용**해서\n새로운 놀이 기구를 **두 개 이상** 그려요.\n옆에 어떤 모양을 썼는지 적어요.",materials:"공책 · 색연필"},suggested_extras:["a_drawing_tip"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"실제 놀이터 디자인",scenario:{icon:"🛝",body:"실제 놀이터를 만드는 사람들도\n**모양의 특징**을 생각해서 만들어요.\n안전하게 굴러가는 자리 = 기둥\n안전하게 받치는 자리 = 상자\n공처럼 굴러도 되는 자리 = 공"}},suggested_extras:["r_real_design","q_fun_my_park"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"\"똑같이 만들어요\" 짝 활동",tag:"교실에서 함께 해요",icon:"🤝",body:"한 명이 블록(또는 그림)으로 놀이터를 만들고\n**말로 설명**해요.\n짝은 보지 않고 듣기만 하며 똑같이 만들어요.\n끝나면 비교해 봐요!",materials:"종이 블록 또는 공책"},suggested_extras:["a_describe_build","m_listening_skill"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"숨은 다른 자리 찾기",steps:["두 놀이터 그림을 화면에 띄움","둘은 거의 같아 보여요","자세히 보면 모양이 다른 자리가 있어요","찾아서 가리키기","무엇이 어떤 모양에서 어떤 모양으로 바뀌었나요?"]},suggested_extras:["g_spot_difference","m_observation_again"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["세 모양으로 **놀이터**를 만들 수 있어요","모양마다 **잘 어울리는 자리**가 있어요","여러 모양을 **함께** 쓰면 복잡한 것도!","상상력을 살려서 **새로운 기구**도 만들 수 있어요"]},suggested_extras:["b_playground_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"내가 만든 것 소개하기",content:"\"저는 📦 상자 ___개,\n🥫 기둥 ___개,\n⚽ 공 ___개를 사용했어요.\n저는 ___을(를) 만들었어요.\"\n친구들에게 소개해 봐요."},suggested_extras:["a_self_intro"]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"친구가 만든 놀이터와 내 놀이터를\n**비교**해 봐요!\n같은 모양으로도 다른 것을 만들 수 있어요.",emoji:""},suggested_extras:["e_compare_works"]}
    ],
    extras: [
  {id:"v_playground_song",type:"video",icon:"🎥",title:"놀이터 노래",url:"https://www.youtube.com/results?search_query=놀이터+동요+1학년",description:"놀이터를 소재로 한 동요. 도입 자리에 즐거운 분위기 만들기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover"]},
  {id:"r_playground_memory",type:"real_world",icon:"🌍",title:"내가 가 본 놀이터",content:"우리 동네 놀이터를 떠올려 봐요. 무엇이 있었나요? 어떤 모양이 있었는지 기억나나요?",fit_slides:["cover","motivate"]},
  {id:"m_recall_l03",type:"tip",icon:"🧩",title:"3차시 핵심 회상",content:"세 모양의 쌓기·굴리기 결과만 다시 한 번. 이 차시는 그 특징을 응용하는 자리.",fit_slides:["review"]},
  {id:"q_fun_playground",type:"fun_question",icon:"💡",title:"가장 좋아하는 기구",content:"놀이터에서 가장 좋아하는 기구는? 그 기구는 어떤 모양들로 만들어졌을까요? 한번 떠올려 봐요.",fit_slides:["motivate"]},
  {id:"r_playground_shapes",type:"real_world",icon:"🌍",title:"놀이터에 있는 모양",content:"미끄럼틀(지붕=상자, 통로=기둥) · 시소(받침대=기둥) · 그네(기둥+상자) · 둥근 의자(공). 놀이터는 모양의 박물관.",fit_slides:["motivate"]},
  {id:"m_playground_map",type:"tip",icon:"🧩",title:"놀이터 모양 지도",content:"칠판에 놀이터 그림을 그려 두고 학생들이 발견하는 모양마다 그 위에 ○ 표시. 끝나면 세 모양 모두 표시되어 있어요.",fit_slides:["visual_demo"]},
  {id:"x_box_seesaw",type:"misconception",icon:"❓",title:"오개념: 받침대는 아무거나",content:"학생이 시소 받침대로 상자를 골라도 자연스러워요. 잘못된 것이 아니라 모양과 쓰임의 연결을 처음 만나는 자리. 부드럽게 시연해 보여 주기.",fit_slides:["concept"]},
  {id:"m_shape_function",type:"tip",icon:"🧩",title:"모양과 쓰임 연결",content:"\"왜 이 모양일까?\"를 물어 보세요. 학생이 까닭을 말하면 모양 학습이 더 단단해져요.",fit_slides:["concept"]},
  {id:"x_wrong_shape",type:"misconception",icon:"❓",title:"오개념: 모양은 아무 상관 없다",content:"학생이 모양과 쓰임이 무관하다고 여기지 않도록. 시소 받침대로 상자를 쓰면 안 움직임을 시연해 보여 줘요.",fit_slides:["visual_demo"]},
  {id:"r_design_matters",type:"real_world",icon:"🌍",title:"모양은 까닭이 있어요",content:"바퀴는 둥글어요 — 굴러야 하니까. 책상은 평평해요 — 무엇을 올려야 하니까. 우리 주변 모든 모양에는 까닭이 있어요.",fit_slides:["visual_demo","real_world"]},
  {id:"m_combine_shapes",type:"tip",icon:"🧩",title:"두 모양 함께 쓰기",content:"한 가지 모양으로만 만들 수 있는 것은 적어요. 그네·미끄럼틀처럼 두 가지 이상 함께 써야 의미 있는 것이 만들어져요.",fit_slides:["concept"]},
  {id:"a_combo_examples",type:"other_activity",icon:"📚",title:"두 모양 합치기 예시",content:"칠판에 '기둥+상자=그네'·'기둥+상자=미끄럼틀'·'공+상자=구슬 받침대' 등 예시를 미리 두세 가지 그려 두기.",fit_slides:["concept"]},
  {id:"m_creative_play",type:"tip",icon:"🧩",title:"새로운 발상 환영",content:"학생이 '둥근 회전판'·'세모 풍선' 같은 새 아이디어를 내도 모두 인정. 모양 특징만 맞으면 실재하지 않는 기구도 OK.",fit_slides:["misconception"]},
  {id:"m_match_help",type:"tip",icon:"🧩",title:"짝짓기 힌트",content:"학생이 헷갈리면 '굴러가야 할까? 받쳐야 할까?'를 다시 물어 보면 자기 답을 찾아요.",fit_slides:["basic_problem"]},
  {id:"m_answer_box",type:"tip",icon:"🧩",title:"답 = 상자 모양",content:"그네 좌석은 사람이 앉아야 하니 평평한 면(상자)이 필요. 굴러가면 떨어지니 굴러가지 않는 모양.",fit_slides:["basic_problem"]},
  {id:"m_answer_sphere",type:"tip",icon:"🧩",title:"답 = 공 모양",content:"축구공은 어디로든 굴러야 하니 공 모양. 상자·기둥이면 차도 잘 안 굴러가요.",fit_slides:["basic_problem"]},
  {id:"a_drawing_tip",type:"other_activity",icon:"📚",title:"그리기 활동 운영",content:"공책에 그리기가 부담스러운 학생은 글로만 적어도 OK. \"📦로 시소 양옆, 🥫로 받침대\" 식. 그림보다 모양 사용을 더 본 자리.",fit_slides:["offline_activity"]},
  {id:"r_real_design",type:"real_world",icon:"🌍",title:"디자이너의 일",content:"놀이터를 만드는 사람을 '놀이터 디자이너'라고 해요. 안전하고 재미있게 놀 수 있도록 모양과 자리를 정해요.",fit_slides:["real_world"]},
  {id:"q_fun_my_park",type:"fun_question",icon:"💡",title:"내가 디자이너라면",content:"내가 만약 놀이터를 만든다면 어떤 기구를 가장 먼저 넣을까요? 어떤 모양을 가장 많이 쓸까요?",fit_slides:["real_world"]},
  {id:"a_describe_build",type:"other_activity",icon:"📚",title:"설명 듣고 만들기",content:"한 명이 보이지 않게 만들고 짝에게 말로만 설명. 듣는 친구는 똑같이 만들기. 다 만든 다음 비교 — 같지 않을 수 있어요!",fit_slides:["offline_activity"]},
  {id:"m_listening_skill",type:"tip",icon:"🧩",title:"듣기 학습 자리",content:"이 활동은 모양 학습뿐 아니라 듣기·말하기 통합 학습. \"상자 모양을 왼쪽에\" 같은 정확한 표현 연습.",fit_slides:["offline_activity"]},
  {id:"g_spot_difference",type:"game",icon:"🎮",title:"다른 자리 찾기 놀이",content:"두 비슷한 그림에서 모양이 다른 자리를 찾기. 1·4차시 모두에서 활용되는 비교 사고 메카닉.",fit_slides:["game"]},
  {id:"m_observation_again",type:"tip",icon:"🧩",title:"관찰력 다시",content:"1차시에서 한 번 했던 활동을 응용 자리에서 다시. 학생이 모양 어휘를 갖고 다시 보면 처음과 다른 답을 발견해요.",fit_slides:["game"]},
  {id:"b_playground_book",type:"book",icon:"📖",title:"『놀이터에서 만난 모양들』",content:"놀이터의 기구들을 모양 관점에서 다시 보는 그림책. 4차시 정리 자리에 잘 어울려요.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"a_self_intro",type:"other_activity",icon:"📚",title:"내 작품 소개",content:"한 명씩 자기가 만든 놀이터(또는 그림)를 짧게 소개. 사용한 모양 개수를 말하면 5차시 평가와 자연 연결.",fit_slides:["question"]},
  {id:"e_compare_works",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"다음 차시에는 모양으로 만든 작품들을 비교·평가해 봐요. 같은 모양이지만 친구마다 다른 작품을 만들었을 거예요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 5차시: 모양 찾기 놀이를 해 볼까요 ───────────
  // 게임 차시. 12장 카드 색 코딩 분류 + 메모리 카드 게임. 단원 학습 강화.
  LESSONS["u2_l05"] = {
    meta: {
      title: "1학년 수학 2단원 5차시",
      subtitle: "모양 찾기 놀이를 해 볼까요",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"모양 찾기 놀이를\n해 볼까요?\n카드를 뒤집어 짝을 찾아 봐요",emoji:""},suggested_extras:["v_game_song","r_card_game_fun"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"세 모양으로 **만들기**를 했어요\n오늘은 같은 모양을 **찾는** 놀이를 해요\n네 차시 동안 배운 것이 한 자리에 모여요"},suggested_extras:["m_recall_so_far"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"여러 가지 카드",kids:[{face:"🎴",label:"12장 카드"},{face:"📦",label:"상자류 4장"},{face:"🥫",label:"기둥류 4장"}],question:"카드 12장에 그려진 물건은 무엇일까요?\n어떤 모양들이 보일까요?"},suggested_extras:["q_fun_card_check","r_cards_intro"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"카드 12장 살펴보기",bidirect:["📦 상자 모양 — 선물 상자 · 쌓기나무 · 수납장 · 도시락","↓","🥫 기둥 모양 — 저금통 · 딱풀 · 약병 · 두루마리 휴지","↓","⚽ 공 모양 — 농구공 · 탱탱볼 · 축구공 · 구슬"]},suggested_extras:["m_12_cards","r_card_objects"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"색으로 ○ 표시",ten_frame_solo:{count:0,is_anchor:true,label:"📦 상자 → **연두색** ○\n🥫 기둥 → **분홍색** ○\n⚽ 공 → **노랑색** ○"},sub_text:"같은 모양은 같은 색!"},suggested_extras:["m_color_consistency","a_color_pencil"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"메모리 게임 규칙",bidirect:["카드 12장을 **뒤집어 놓아요**","↓","두 장을 골라 **뒤집어요**","↓","두 장이 **같은 모양**이면 가져가요","↓","다르면 **다시 뒤집어 놓아요**"]},suggested_extras:["m_game_rules","x_remember_position"]},
  {id:"s07",stage:"전개",block:"misconception",data:{title:"조심해요 — 같은 그림 아니라 같은 모양!",label:"오개념 주의",wrong:"카드 두 장에 똑같은 그림이 있어야 짝",right:"**같은 모양**이면 짝!\n예: 딱풀과 두루마리 휴지\n둘 다 **기둥 모양** → 짝!",hint:"그림이 달라도 모양이 같으면 OK"},suggested_extras:["m_match_rule","x_same_image_only"]},
  {id:"s08",stage:"전개",block:"compare",data:{title:"같은 모양 짝의 예",items:[{ten_frame:0,num:0,caption:"📦 **선물 상자**"},{ten_frame:0,num:0,caption:"=짝=",is_anchor:true},{ten_frame:0,num:0,caption:"📦 **도시락**"}]},suggested_extras:["m_pair_examples"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"card_arrange",data:{title:"색 코딩 — 어느 색으로 ○?",instruction:"각 물건에 어울리는 **색**을 골라 봐요",cards:["선물 상자","저금통","농구공","수납장"],target:["연두","분홍","노랑","연두"]},suggested_extras:["m_color_check"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"이 둘은 짝일까요?",question:"**딱풀**과 **두루마리 휴지**.\n짝일까요, 아닐까요?\n어떤 모양일까요?"},suggested_extras:["m_yes_pair_cylinder"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"이 둘도 짝일까요?",question:"**도시락**과 **농구공**.\n짝일까요, 아닐까요?\n왜 그렇게 생각해요?"},suggested_extras:["m_no_pair"]},
  {id:"s12",stage:"기본문제",block:"basic_problem",data:{title:"공통점·차이점",question:"**딱풀**과 **약병**은 어떤 점이 **같은가요**?\n**딱풀**과 **수납장**은 어떻게 **다른가요**?"},suggested_extras:["m_compare_pair","a_class_discussion"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"game",data:{title:"전체 메모리 게임 — 도전!",steps:["12장 카드 모두 뒤집어 놓기","한 명씩 차례로 두 장 뒤집기","같은 모양이면 가져가기","다르면 다시 뒤집어 놓기","카드가 다 없어질 때까지!"]},suggested_extras:["g_memory_full","m_full_game"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"짝과 함께 메모리 게임",tag:"교실에서 함께 해요",icon:"🎴",body:"카드를 잘 섞어 책상 위에 뒤집어 놓아요.\n가위바위보로 순서 정해서\n번갈아 두 장씩 뒤집어요.\n많이 가져간 사람이 이겨요!\n역할 바꿔서 또 해요.",materials:"꾸러미 6 모양 카드"},suggested_extras:["a_pair_play","m_game_etiquette"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"선생님과 함께 — 빠른 분류",steps:["선생님이 카드 한 장 보여 줘요","학생들이 같은 모양 카드 빨리 찾기","찾은 사람 손 들기","왜 그 카드가 같은 모양인지 짧게 설명","잘 설명하면 박수!"]},suggested_extras:["g_teacher_card"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["**12장 카드**를 모양별로 분류했어요","같은 모양을 **색**으로 표시했어요","**메모리 게임**으로 모양 짝을 찾았어요","그림이 달라도 **모양이 같으면 짝**이에요"]},suggested_extras:["b_card_game_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"내가 가장 잘 찾은 모양",content:"메모리 게임에서 가장 빨리 찾은 모양은?\n가장 어려웠던 모양은?\n다음에 또 하면 어떻게 더 잘할 수 있을까요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"단원의 마지막을 향해 가요!\n오늘까지 배운 모양을 **정리**해 봐요.\n수학익힘 책에서 한 번 더 풀어 봐요.",emoji:""},suggested_extras:["e_unit_review"]}
    ],
    extras: [
  {id:"v_game_song",type:"video",icon:"🎥",title:"카드 놀이 동요",url:"https://www.youtube.com/results?search_query=카드+뒤집기+놀이+동요",description:"카드 놀이를 다룬 짧은 동요. 도입 자리에 놀이 분위기 만들기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover"]},
  {id:"r_card_game_fun",type:"real_world",icon:"🌍",title:"카드 놀이의 매력",content:"카드 뒤집기 놀이는 어른도 좋아하는 놀이. 기억력 + 운 + 친구와의 교류가 모두 들어 있어요.",fit_slides:["cover","motivate"]},
  {id:"m_recall_so_far",type:"tip",icon:"🧩",title:"네 차시 회상",content:"1~4차시 핵심을 한두 마디로만. 모양 인식 → 분류 → 특징 → 만들기. 오늘은 놀이로 한 자리에 정리.",fit_slides:["review"]},
  {id:"q_fun_card_check",type:"fun_question",icon:"💡",title:"가장 좋아하는 카드",content:"12장 중에 가장 마음에 드는 카드는? 그 카드 물건을 가져 본 적 있나요? 어떤 모양일까요?",fit_slides:["motivate"]},
  {id:"r_cards_intro",type:"real_world",icon:"🌍",title:"카드의 12 물건",content:"선물 상자·쌓기나무·수납장·도시락·저금통·딱풀·약병·두루마리 휴지·농구공·탱탱볼·축구공·구슬. 모두 우리 주변의 친숙한 물건.",fit_slides:["motivate"]},
  {id:"m_12_cards",type:"tip",icon:"🧩",title:"카드를 세 묶음으로",content:"학생이 카드 12장을 세 모양으로 미리 묶어 두면 게임이 훨씬 쉬워져요. 도입에서 충분히 분류한 다음 게임 진입.",fit_slides:["concept"]},
  {id:"r_card_objects",type:"real_world",icon:"🌍",title:"카드 속 물건 짚어 주기",content:"학생이 모르는 물건이 있을 수 있어요. 약병·쌓기나무 등 모르면 짧게 알려 주기. 모양 학습의 본질에 집중.",fit_slides:["concept"]},
  {id:"m_color_consistency",type:"tip",icon:"🧩",title:"색 코드 통일",content:"1차시·6차시까지 같은 색 코드(연두·분홍·노랑). 한 단원 안에서 색이 바뀌면 학생들이 헷갈려요.",fit_slides:["visual_demo"]},
  {id:"a_color_pencil",type:"other_activity",icon:"📚",title:"색연필 ○ 표시 활동",content:"학생이 직접 색연필로 카드 위에 ○. 손 동작으로 모양 분류를 체화. 색연필 3색 미리 준비.",fit_slides:["visual_demo"]},
  {id:"m_game_rules",type:"tip",icon:"🧩",title:"규칙은 천천히",content:"메모리 게임 규칙은 학생에게 익숙해도 한 번 더 천천히 설명. 특히 '다르면 다시 뒤집기'를 까먹는 학생이 있어요.",fit_slides:["concept"]},
  {id:"x_remember_position",type:"misconception",icon:"❓",title:"오개념: 기억력만 있으면 돼",content:"메모리 게임 = 기억력만이 아니에요. 카드의 모양을 빠르게 알아보는 분류 능력이 더 중요. 두 능력이 함께 자라는 자리.",fit_slides:["concept"]},
  {id:"m_match_rule",type:"tip",icon:"🧩",title:"같은 모양 = 짝 강조",content:"이 규칙이 본 차시의 핵심. \"같은 그림\"이 아니라 \"같은 모양\"임을 여러 번 짚기.",fit_slides:["misconception"]},
  {id:"x_same_image_only",type:"misconception",icon:"❓",title:"오개념: 같은 그림이어야 짝",content:"학생이 일반 메모리 게임 규칙(같은 그림 = 짝)을 떠올려 같은 그림만 찾으려 함. 우리 게임은 **같은 모양**이면 짝임을 분명히.",fit_slides:["misconception"]},
  {id:"m_pair_examples",type:"tip",icon:"🧩",title:"짝의 예시 풍부히",content:"선물 상자-도시락(상자), 딱풀-두루마리 휴지(기둥), 농구공-구슬(공). 짝의 예시를 두세 가지 보여 주면 학생이 규칙을 정확히 이해.",fit_slides:["compare"]},
  {id:"m_color_check",type:"tip",icon:"🧩",title:"색 짝짓기 답",content:"선물 상자=연두 / 저금통=분홍 / 농구공=노랑 / 수납장=연두. 학생이 색을 머릿속에서 모양으로 바꿔 답하는 자리.",fit_slides:["basic_problem"]},
  {id:"m_yes_pair_cylinder",type:"tip",icon:"🧩",title:"답 = 짝 (기둥)",content:"딱풀·두루마리 휴지 모두 기둥 모양. 그림은 매우 달라 보이지만 모양 분류로 보면 짝.",fit_slides:["basic_problem"]},
  {id:"m_no_pair",type:"tip",icon:"🧩",title:"답 = 짝 아님 (상자 vs 공)",content:"도시락=상자 / 농구공=공. 다른 모양이라 짝 아님. 학생이 \"왜 그래요?\"를 설명할 수 있도록.",fit_slides:["basic_problem"]},
  {id:"m_compare_pair",type:"tip",icon:"🧩",title:"공통점·차이점 발화",content:"딱풀-약병 공통 = 둘 다 기둥 (평평+둥근). 딱풀-수납장 차이 = 기둥 vs 상자. 모양 언어로 비교하는 자리.",fit_slides:["basic_problem"]},
  {id:"a_class_discussion",type:"other_activity",icon:"📚",title:"학급 토의",content:"몇 가지 짝/비짝 예시를 더 골라 학급 전체 토의. \"왜 같다고 생각해?\" \"왜 다르다고 생각해?\" 발화 연습.",fit_slides:["basic_problem"]},
  {id:"g_memory_full",type:"game",icon:"🎮",title:"전체 메모리 게임",content:"12장으로 전체 게임. 시간이 부족하면 6장(각 모양 2장씩)으로 축소. 학생 수에 맞게 조절.",fit_slides:["game"]},
  {id:"m_full_game",type:"tip",icon:"🧩",title:"게임 진행 팁",content:"학생이 자기 차례에 너무 오래 고민하면 다른 학생이 지루해해요. 짧게 결정하도록 시간 제한 가볍게.",fit_slides:["game"]},
  {id:"a_pair_play",type:"other_activity",icon:"📚",title:"짝과 함께 운영",content:"2인 게임은 가장 활기. 한 사람당 카드 6장 미만 갖게 되니 부담 적음. 끝나면 누가 더 많이 가졌는지 확인.",fit_slides:["offline_activity"]},
  {id:"m_game_etiquette",type:"tip",icon:"🧩",title:"놀이 예의",content:"이기는 것이 목적이 아니라 모양을 익히는 것. 게임 끝나면 \"잘했어!\" 하이파이브로 마무리. 이긴 사람 자랑 X.",fit_slides:["offline_activity"]},
  {id:"g_teacher_card",type:"game",icon:"🎮",title:"선생님 카드 따라잡기",content:"학생이 차례 못 가지면 지루해요. 이 변형 게임은 모두 동시에 참여 가능. 빨리 찾은 한두 명에게 카드 보너스.",fit_slides:["game"]},
  {id:"b_card_game_book",type:"book",icon:"📖",title:"『카드로 놀자』",content:"여러 가지 카드 놀이를 소개하는 그림책. 1학년 정도 학생이 즐길 만한 단순한 놀이들.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_unit_review",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"다음 차시에는 6차시 — 수학익힘 책을 다시 펴서 단원에서 배운 모양을 한 번 더 만나요. 단원 정리의 시작.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 6차시: 수학이랑 확인해요 (단원 정리·평가) ───────────
  // 평가 차시. 4문항 + 자기 평가 3문항. 18슬 5단계 골격에 매핑.
  LESSONS["u2_l06"] = {
    meta: {
      title: "1학년 수학 2단원 6차시",
      subtitle: "수학이랑 확인해요 (단원 정리·평가)",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수학이랑 확인해요\n오늘은 2단원 평가\n천천히 풀어 봐요",emoji:""},suggested_extras:["m_test_calm","r_review_unit"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"2단원에서 배운 것",content:"📦 **상자 모양** · 🥫 **기둥 모양** · ⚽ **공 모양**\n각 모양의 **특징** (쌓기·굴리기)\n같은 모양끼리 **분류**·**연결**\n모양으로 **만들기**·**놀이**"},suggested_extras:["m_unit_summary"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"함께 생활해요 점검",kids:[{face:"📦",label:"상자 ?칸"},{face:"🥫",label:"기둥 ?칸"},{face:"⚽",label:"공 ?칸"}],question:"지난 차시 동안 모은 색칠 칸을 세어 봐요.\n어떤 모양을 가장 많이 찾았나요?"},suggested_extras:["a_count_color","m_practice_check"]},

  // ===== 전개 (5) — 문항 4개 + 평가 안내 =====
  {id:"s04",stage:"전개",block:"basic_problem",data:{title:"문항 ❶ — 분류해 봐요",question:"빨간 모양 · 수박 · 음료 캔 · 공 · 분홍 상자\n다섯 가지를\n**상자 · 기둥 · 공**으로 분류해 봐요."},suggested_extras:["m_classify_check","r_5items"]},
  {id:"s05",stage:"전개",block:"basic_problem",data:{title:"문항 ❷ — 단서로 맞히기",question:"\"뾰족한 부분이 있고\n쉽게 쌓을 수 있어요\"\n축구공? 딱풀? 분홍 상자?"},suggested_extras:["m_clue_answer","x_no_clue_round"]},
  {id:"s06",stage:"전개",block:"basic_problem",data:{title:"문항 ❸ — 같은 모양 짝짓기",question:"6개 사물을 보고\n같은 모양끼리 짝지어 봐요.\n어떻게 알 수 있을까요?"},suggested_extras:["m_match_method"]},
  {id:"s07",stage:"전개",block:"basic_problem",data:{title:"문항 ❹ — 색으로 표시",question:"놀이터 그림에 있는 모양들을\n**색**으로 표시해 봐요.\n📦 연두 · 🥫 분홍 · ⚽ 노랑"},suggested_extras:["m_color_recall","r_playground_again"]},
  {id:"s08",stage:"전개",block:"question",data:{title:"풀이를 다시 보기",content:"답을 다 적었나요?\n빠진 답은 없나요?\n친구 답과 비교하지 말고\n**내가 푼 것**을 차분히 봐요."},suggested_extras:["m_review_own_test"]},

  // ===== 기본 (4) — 짝 검토 + 자기 평가 3 =====
  {id:"s09",stage:"기본문제",block:"question",data:{title:"짝과 답 맞춰 보기",content:"답을 함께 봐요.\n다른 답이 있으면\n**누가 맞고 누가 틀린지** 따지지 말고\n어떻게 풀었는지 이야기해 봐요."},suggested_extras:["a_pair_check_test"]},
  {id:"s10",stage:"기본문제",block:"question",data:{title:"자기 평가 ❶ — 지식·이해",content:"**주변에서 세 모양을 찾을 수 있나요?**\n★ 아직 어려워요\n★★ 도움 있으면 찾을 수 있어요\n★★★ 혼자서도 잘 찾아요"},suggested_extras:["m_honest_test"]},
  {id:"s11",stage:"기본문제",block:"question",data:{title:"자기 평가 ❷ — 과정·기능",content:"**세 모양의 특징을 말할 수 있나요?**\n★ 잘 모르겠어요\n★★ 한두 가지는 말할 수 있어요\n★★★ 모두 말할 수 있어요"},suggested_extras:[]},
  {id:"s12",stage:"기본문제",block:"question",data:{title:"자기 평가 ❸ — 가치·태도",content:"**친구와 함께 모양을 즐겁게 만들었나요?**\n★ 잘 모르겠어요\n★★ 가끔 재미있었어요\n★★★ 친구와 만든 시간이 좋았어요"},suggested_extras:["m_attitude_value"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"offline_activity",data:{title:"단원 실천 활동 정리",tag:"수학익힘 p.30",icon:"📒",body:"단원 동안 모은 **세 모양 색칠 칸**을 세어 봐요.\n몇 칸을 색칠했나요?\n학교 어디에서 가장 많이 찾았나요?\n친구들과 이야기해 봐요.",materials:"수학익힘 p.30 · 색연필"},suggested_extras:["a_journey_share","m_color_table_close"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"단원 동안의 나의 변화",content:"단원이 시작될 때보다\n**모양을 보는 눈**이 어떻게 달라졌나요?\n예전엔 그냥 지나치던 것을\n이제는 어떻게 보나요?"},suggested_extras:["m_self_reflection"]},
  {id:"s15",stage:"응용문제",block:"real_world",data:{title:"단원 이후 — 생활에서",scenario:{icon:"🌍",body:"단원이 끝나도\n**세 모양은 계속 우리 주변에 있어요**.\n학교 가는 길에\n집에 가서\n잠자기 전에\n발견한 모양을 가족과 이야기해 봐요."}},suggested_extras:["r_after_unit","q_fun_keep_finding"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"2단원을 마치며",points:["**세 가지 모양** — 상자 · 기둥 · 공","각 모양의 **특징**과 **쓰임**을 알았어요","같은 모양끼리 **분류**·**연결**·**짝짓기**","모양으로 **만들기·놀이**까지 했어요"]},suggested_extras:["m_celebrate2","b_unit_close_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"단원 종합 소감",content:"2단원에서 가장 좋았던 활동은?\n어떤 모양이 가장 기억에 남나요?\n다음 단원에는 무엇을 만나고 싶나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"마지막 차시 — **수학이랑 만들어요**!\n오늘까지 배운 모양으로\n나만의 작품을 만들어 봐요.",emoji:""},suggested_extras:["e_make_preview"]}
    ],
    extras: [
  {id:"m_test_calm",type:"tip",icon:"🧩",title:"평가 진입 분위기",content:"평가는 점수 매기기가 아닌 '돌아보는 시간'. 학생이 긴장하지 않도록 부드러운 표현으로 시작.",fit_slides:["cover"]},
  {id:"r_review_unit",type:"real_world",icon:"🌍",title:"오늘은 단원 정리",content:"5차시 동안 만난 세 모양을 한 자리에서 다시 만나는 시간. 무엇을 알게 되었는지 함께 확인해요.",fit_slides:["cover"]},
  {id:"m_unit_summary",type:"tip",icon:"🧩",title:"단원 회상은 간단히",content:"학습 내용을 길게 다시 가르치지 않아요. 한 문장씩 빠르게 회상하고 평가 문항으로 진입.",fit_slides:["review"]},
  {id:"a_count_color",type:"other_activity",icon:"📚",title:"색칠 칸 세기",content:"단원 도입에서 시작한 색칠표를 한 자리에서 함께 세어 보기. 학생이 직접 칸을 세면 작은 자기 평가 자리.",fit_slides:["motivate"]},
  {id:"m_practice_check",type:"tip",icon:"🧩",title:"실천 점검",content:"각자 채운 칸이 다를 수 있어요. 많이 채운 학생이 잘한 것이 아니라 단원 동안 찾은 자기 기록.",fit_slides:["motivate"]},
  {id:"m_classify_check",type:"tip",icon:"🧩",title:"문항 ❶ 답",content:"빨간 모양·분홍 상자=상자 / 음료 캔=기둥 / 수박·공=공. 학생이 답한 후 \"왜?\"를 물어 보면 추론력 확인.",fit_slides:["basic_problem"]},
  {id:"r_5items",type:"real_world",icon:"🌍",title:"다섯 사물 소개",content:"빨간 모양(나무 조각)·수박·음료 캔·공·분홍 상자. 일상에서 한두 번씩 본 친숙한 물건들.",fit_slides:["basic_problem"]},
  {id:"m_clue_answer",type:"tip",icon:"🧩",title:"문항 ❷ 답 = 분홍 상자",content:"뾰족 + 쌓기 가능 = 상자 모양. 축구공은 둥글기만, 딱풀은 뾰족이 없고 한 방향만 쌓임.",fit_slides:["basic_problem"]},
  {id:"x_no_clue_round",type:"misconception",icon:"❓",title:"오개념: 둥근 = 공",content:"학생이 '둥근'이라는 단어만 보고 공이라 답할 수 있음. 단서 전체(뾰족도 있고)를 함께 봐야 함을 상기.",fit_slides:["basic_problem"]},
  {id:"m_match_method",type:"tip",icon:"🧩",title:"짝짓기 방법",content:"태블릿이면 터치 매칭. 종이면 색깔 ○로 표시. 어떤 방식이든 학생이 자기 답을 분명히 표현하도록.",fit_slides:["basic_problem"]},
  {id:"m_color_recall",type:"tip",icon:"🧩",title:"색 코드 회상",content:"상자=연두·기둥=분홍·공=노랑. 단원 처음에 정한 색을 끝까지 일관성 있게 사용했다면 학생이 자연스럽게 답.",fit_slides:["basic_problem"]},
  {id:"r_playground_again",type:"real_world",icon:"🌍",title:"놀이터 또 만나기",content:"4차시 놀이터 그림이 다시 등장. 학생들에게 \"이거 어디서 봤지?\" 물어 보면 \"4차시!\" 자랑스럽게 답해요.",fit_slides:["basic_problem"]},
  {id:"m_review_own_test",type:"tip",icon:"🧩",title:"자기 검토",content:"답을 다 적었으면 한 번 더 보는 습관. 학생이 시간을 내서 자기 답을 다시 보도록 안내.",fit_slides:["question"]},
  {id:"a_pair_check_test",type:"other_activity",icon:"📚",title:"짝 검토 — 평가",content:"답을 모은 다음 짝과 어떻게 풀었는지 짧게 이야기. '맞고 틀림'이 아닌 '어떻게 했는지'에 초점.",fit_slides:["question"]},
  {id:"m_honest_test",type:"tip",icon:"🧩",title:"솔직한 자기 평가",content:"학생이 모두 별 3개에 표시하지 않도록. 솔직한 별 1개가 다음 단원 학습에 더 도움.",fit_slides:["question"]},
  {id:"m_attitude_value",type:"tip",icon:"🧩",title:"태도 학습도 학습",content:"수학을 즐겁게 했는지는 단원 분위기를 보여 줘요. 태도 자리도 학습의 한 부분이에요.",fit_slides:["question"]},
  {id:"a_journey_share",type:"other_activity",icon:"📚",title:"단원 여정 나누기",content:"가장 좋았던 활동·어려웠던 활동·기억에 남는 모양을 짧게 발표. 자기 학습을 돌아보는 자리.",fit_slides:["offline_activity"]},
  {id:"m_color_table_close",type:"tip",icon:"🧩",title:"색칠표 마무리",content:"단원 색칠표를 학생 공책에 끼우거나 학급 게시판에 모아 두면 학생이 자기 학습 흔적을 오래 기억.",fit_slides:["offline_activity"]},
  {id:"m_self_reflection",type:"tip",icon:"🧩",title:"\"나의 변화\" 발화",content:"평가는 점수만이 아니라 자기 변화를 자각하는 자리. \"예전엔 그냥 보던 것을 이제는…\" 발화 연습.",fit_slides:["question"]},
  {id:"r_after_unit",type:"real_world",icon:"🌍",title:"단원이 끝나도 학습은 계속",content:"학교에서 배운 것은 학교에서만이 아니에요. 단원이 끝나도 일상에서 모양을 계속 만나며 학습이 깊어져요.",fit_slides:["real_world"]},
  {id:"q_fun_keep_finding",type:"fun_question",icon:"💡",title:"오늘 저녁 모양 찾기",content:"오늘 저녁 식탁에서 세 모양을 각각 한 가지씩 찾아 봐요. 가족에게 모양 이름을 가르쳐 줘도 좋아요.",fit_slides:["real_world"]},
  {id:"m_celebrate2",type:"tip",icon:"🧩",title:"단원 마침 축하",content:"두 단원이나 끝냈다는 사실을 함께 축하해 주세요. 박수·하이파이브·작은 메달 어느 것이라도.",fit_slides:["summary"]},
  {id:"b_unit_close_book",type:"book",icon:"📖",title:"『세 모양 친구들』",content:"상자·기둥·공이 친구가 되어 함께 놀이하는 이야기. 단원 마무리 자리에 읽어 주면 마음이 따뜻해져요.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_make_preview",type:"extension",icon:"⬆",title:"다음 시간 — 만들어요",content:"마지막 차시 7차시는 '수학이랑 만들어요'. 세 모양을 사용해서 진짜 만들기. 단원의 결말을 함께 봐요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 7차시: 수학이랑 만들어요 (단원 마무리·창작) ───────────
  // 단원 마지막. 재활용품으로 학교 물건 만들기. 4차시 놀이터 메카닉을 학교 공간으로 확장.
  LESSONS["u2_l07"] = {
    meta: {
      title: "1학년 수학 2단원 7차시",
      subtitle: "수학이랑 만들어요 (단원 마무리·창작)",
      std: "[2수03-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수학이랑 만들어요\n재활용품으로\n학교 물건을 만들어 봐요",emoji:""},suggested_extras:["v_recycle_song","r_recycle_intro"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"단원 동안 배운 것",content:"📦 상자 · 🥫 기둥 · ⚽ 공\n특징 · 분류 · 만들기 · 놀이\n오늘은 모두 합쳐서\n**진짜 만들기**를 해 봐요"},suggested_extras:["m_unit_recall"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"우리 학교에 있는 물건",kids:[{face:"📚",label:"책상"},{face:"🚪",label:"문"},{face:"🪟",label:"창문"}],question:"학교 곳곳에 무엇이 있을까요?\n각 물건은 **어떤 모양**들로 이루어졌을까요?"},suggested_extras:["q_fun_school_objects","r_school_furniture"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"하나의 물건도 여러 모양으로",bidirect:["📚 **책상** = 상판(📦) + 다리(🥫)","↓","🚪 **문** = 판(📦) + 손잡이(⚽)","↓","의자 · 책꽂이 · 우산꽂이…","↓","대부분의 물건은 **여러 모양의 합**"]},suggested_extras:["m_composite","r_combination"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"재활용품 살펴보기",ten_frame_solo:{count:0,is_anchor:true,label:"📦 과자 상자 · 작은 상자 · 도시락 통\n🥫 빨대 · 수수깡 · 휴지 심\n⚽ 구슬 · 스티로폼 공 · 비드"},sub_text:"버려질 물건도 모양 재료가 돼요"},suggested_extras:["a_collect_recycle","m_clean_first"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"만들기 예시 1 — 도서관 책상",bidirect:["📦 과자 상자 → 책상 **상판**","↓","🥫 빨대 4개 → 책상 **다리**","↓","책상 완성!"]},suggested_extras:["m_table_example"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"만들기 예시 2 — 화장실 문",bidirect:["📦 작은 상자 → **문 판**","↓","⚽ 구슬 → 문 **손잡이**","↓","두 모양 합쳐 문 완성!"]},suggested_extras:["m_door_example"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 정답이 없어요",label:"오개념 주의",wrong:"선생님이 보여 준 대로만 만들기",right:"**같은 물건도 사람마다** 다르게 만들 수 있어요.\n빨대 대신 휴지 심으로 다리 만들기 OK!\n자기 생각대로 자유롭게 만들어요.",hint:"창의적인 발상 모두 환영"},suggested_extras:["m_creative_make","x_one_right_answer"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"question",data:{title:"무엇을 만들까?",content:"우리 학교에 있는 물건 중\n무엇을 만들고 싶나요?\n어떤 모양들이 필요할까요?\n어떤 재활용품을 쓸까요?"},suggested_extras:["q_fun_what_make","m_plan_first"]},
  {id:"s10",stage:"기본문제",block:"offline_activity",data:{title:"만들기 시작",tag:"창작 시간 20분",icon:"🎨",body:"재활용품을 꺼내요.\n**상자·기둥·공** 모양에 맞게\n자르고 · 붙이고 · 꽂아요.\n친구 따라하지 말고\n**내 생각대로** 만들어요.",materials:"재활용품 · 가위 · 풀 · 테이프"},suggested_extras:["a_safe_scissors","m_take_time"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"4지선다 — 친구가 만든 것",question:"\"📦 상자 상판 + 🥫 빨대 다리로 만들었어요.\n도서관에서 사용해요.\"\n무엇일까요?\n① 책상 ② 의자 ③ 문 ④ 사물함"},suggested_extras:["m_clue_table"]},
  {id:"s12",stage:"기본문제",block:"basic_problem",data:{title:"한 가지 더",question:"\"📦 상자 판 + ⚽ 구슬 손잡이로 만들었어요.\n화장실에서 사용해요.\"\n무엇일까요?\n① 창문 ② 문 ③ 거울 ④ 수도꼭지"},suggested_extras:["m_clue_door"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"question",data:{title:"내가 만든 것 소개하기",content:"\"저는 📦 상자 ___개, 🥫 기둥 ___개,\n⚽ 공 ___개를 사용했어요.\n저는 ___을(를) 만들었어요.\n이 물건은 학교의 ___에서 사용해요.\"\n친구들에게 소개해 봐요."},suggested_extras:["a_self_intro2","m_intro_template"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"고무찰흙으로 모양 변환",tag:"재활용품이 없으면",icon:"🟡",body:"고무찰흙 한 덩이로\n**구**를 만들어요.\n바닥에 굴려서 **기둥**으로 바꿔요.\n옆을 손바닥으로 두들겨\n**상자** 모양으로 만들어요!\n한 덩이로 세 모양이!",materials:"고무찰흙"},suggested_extras:["a_clay_transform","m_clay_alt"]},
  {id:"s15",stage:"응용문제",block:"real_world",data:{title:"학교에 가장 많은 모양은?",scenario:{icon:"🏫",body:"학교 안을 둘러보면\n**상자 모양**이 가장 많아요.\n책 · 책상 · 사물함 · 칠판 · 창문.\n왜 그럴까요?\n**쌓고 · 받치고 · 안정적이라서**!"}},suggested_extras:["r_why_box","q_fun_why_school"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"2단원을 모두 마치며",points:["**세 가지 모양**으로 진짜 만들기까지 했어요","대부분 물건은 **여러 모양의 합**이에요","같은 물건도 **사람마다 다르게** 만들 수 있어요","우리 주변에는 **늘 모양**이 있어요"]},suggested_extras:["m_unit_end","b_around_us"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"2단원 종합 소감",content:"2단원에서 가장 재미있었던 활동은?\n가장 기억에 남는 모양은?\n다음 단원에는 무엇을 만나고 싶나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 단원에서는",preview:"**덧셈과 뺄셈**의 세계로 가요!\n수와 수가 만나면 어떻게 될까요?\n더하기 · 빼기를 배워요.",emoji:""},suggested_extras:["e_addsub_preview"]}
    ],
    extras: [
  {id:"v_recycle_song",type:"video",icon:"🎥",title:"재활용 노래",url:"https://www.youtube.com/results?search_query=재활용+동요+1학년",description:"재활용을 다룬 짧은 동요. 도입 자리에 분위기 + 환경 의식 가볍게 짚기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover"]},
  {id:"r_recycle_intro",type:"real_world",icon:"🌍",title:"재활용품의 가치",content:"버려지던 상자·휴지 심·빨대가 학습 재료가 돼요. 가정에서 미리 모아 두면 만들기 활동이 풍성해져요.",fit_slides:["cover","motivate"]},
  {id:"m_unit_recall",type:"tip",icon:"🧩",title:"단원 회상 간단히",content:"6차시까지 배운 내용을 한 문장으로 정리. 이 차시는 만들기에 시간이 많이 필요하니 도입은 빠르게.",fit_slides:["review"]},
  {id:"q_fun_school_objects",type:"fun_question",icon:"💡",title:"오늘 본 학교 물건",content:"오늘 학교 와서 본 물건 중에 가장 인상 깊은 것은? 그 물건은 어떤 모양들로 이루어졌을까요?",fit_slides:["motivate"]},
  {id:"r_school_furniture",type:"real_world",icon:"🌍",title:"학교 가구의 모양",content:"책상·의자·사물함·책꽂이. 학교의 모든 가구는 여러 모양의 합. 특히 상자 모양이 가장 많아요.",fit_slides:["motivate"]},
  {id:"m_composite",type:"tip",icon:"🧩",title:"합성 사물 개념",content:"한 물건 = 한 모양이 아니라는 점이 이 차시의 핵심. 모양은 더 큰 것을 만드는 재료라는 사고로 확장.",fit_slides:["concept"]},
  {id:"r_combination",type:"real_world",icon:"🌍",title:"여러 모양 합치기",content:"의자(상자 좌석 + 기둥 다리) · 우산꽂이(기둥 통 + 상자 받침) · 시계(상자 판 + 공 모양 손잡이). 일상의 거의 모든 물건이 모양의 합.",fit_slides:["concept"]},
  {id:"a_collect_recycle",type:"other_activity",icon:"📚",title:"재활용품 모으기",content:"단원 끝 무렵에 가정으로 안내문. 과자 상자 · 빨대 · 휴지 심 · 비드. 학생당 3~4개 정도면 충분.",fit_slides:["visual_demo"]},
  {id:"m_clean_first",type:"tip",icon:"🧩",title:"청결 확인",content:"과자 상자·통은 깨끗이 비워서 가져오기. 위생 안전 사전 안내. 너무 더러운 재료는 학교에서 추가 제공.",fit_slides:["visual_demo"]},
  {id:"m_table_example",type:"tip",icon:"🧩",title:"책상 만들기 시연",content:"교사가 한 번 시연하면 학생이 안심하고 시작해요. 다만 학생이 똑같이 따라 하지 않도록 \"이건 한 예시야\" 강조.",fit_slides:["concept"]},
  {id:"m_door_example",type:"tip",icon:"🧩",title:"두 번째 예시 효과",content:"한 예시만 보여 주면 학생이 그것만 만들려 함. 두세 예시를 보여 주면 자기 생각으로 다른 것을 만들 수 있다는 가능성을 느껴요.",fit_slides:["concept"]},
  {id:"m_creative_make",type:"tip",icon:"🧩",title:"창의적 발상 환영",content:"학생이 학교에 없는 물건을 만들어도 OK. \"공원에서 본 분수\" \"우주 정거장\" 무엇이든 모양 활용했으면 인정.",fit_slides:["misconception"]},
  {id:"x_one_right_answer",type:"misconception",icon:"❓",title:"오개념: 정답 하나",content:"학생이 \"이게 맞아요?\" 물어 보면 \"네 생각이 맞아\"라고 답하세요. 창작 자리는 정답이 하나가 아니에요.",fit_slides:["misconception"]},
  {id:"q_fun_what_make",type:"fun_question",icon:"💡",title:"내가 만들고 싶은 것",content:"오늘 가장 만들고 싶은 학교 물건은? 그것을 만들려면 어떤 모양이 필요한가요? 어떤 재활용품이 도움이 될까요?",fit_slides:["question"]},
  {id:"m_plan_first",type:"tip",icon:"🧩",title:"계획부터",content:"바로 자르고 붙이기 전에 머릿속 또는 공책에 짧게 계획. \"무엇을 만들지 + 어떤 모양을 쓸지\" 정한 다음 시작.",fit_slides:["question"]},
  {id:"a_safe_scissors",type:"other_activity",icon:"📚",title:"가위 안전",content:"가위는 1학년에게 가장 조심해야 할 도구. 안전 가위 사용·짝과 함께 자르기·자른 자리 정돈 등 사전 안내.",fit_slides:["offline_activity"]},
  {id:"m_take_time",type:"tip",icon:"🧩",title:"시간 충분히",content:"창작 활동은 시간이 곧 결과. 20분 정도 자리 확보. 빨리 끝낸 학생은 친구 도와주거나 두 번째 만들기.",fit_slides:["offline_activity"]},
  {id:"m_clue_table",type:"tip",icon:"🧩",title:"답 = 책상",content:"상자 상판 + 빨대 다리 = 책상. \"도서관에서 사용해요\"가 분명한 단서. 학생이 \"왜 책상이라고 생각해?\" 답할 수 있어야.",fit_slides:["basic_problem"]},
  {id:"m_clue_door",type:"tip",icon:"🧩",title:"답 = 문",content:"상자 판 + 구슬 손잡이 = 문. 손잡이가 둥근 모양인 것이 핵심 단서.",fit_slides:["basic_problem"]},
  {id:"a_self_intro2",type:"other_activity",icon:"📚",title:"발표 자리",content:"한 명씩 자기 작품을 짧게 소개. 부담 큰 학생은 짝에게만. 전체 발표는 자원하는 학생 두세 명으로 충분.",fit_slides:["question"]},
  {id:"m_intro_template",type:"tip",icon:"🧩",title:"발표 양식",content:"\"저는 ___개의 ___ 모양을 사용해서 ___을 만들었어요\" 양식 제공. 학생이 안심하고 발표할 수 있어요.",fit_slides:["question"]},
  {id:"a_clay_transform",type:"other_activity",icon:"📚",title:"고무찰흙 변환",content:"재활용품 없이도 가능한 변형 활동. 한 덩이로 세 모양 모두 만들 수 있음을 직접 체험. 학습 본질과도 연결.",fit_slides:["offline_activity"]},
  {id:"m_clay_alt",type:"tip",icon:"🧩",title:"고무찰흙 대안",content:"재활용품 준비가 어려운 학급에서 가장 좋은 대안. 한 학생당 작은 덩어리만 있어도 가능. 활동 후 보관 주의.",fit_slides:["offline_activity"]},
  {id:"r_why_box",type:"real_world",icon:"🌍",title:"학교에 상자가 많은 까닭",content:"무엇을 올려놓고 · 쌓고 · 안정적이어야 하니까. 모양에는 이유가 있다는 단원 학습의 결말.",fit_slides:["real_world"]},
  {id:"q_fun_why_school",type:"fun_question",icon:"💡",title:"공이 많은 곳은?",content:"학교 안에 공 모양이 가장 많은 곳은? (체육관!) 왜 그럴까요? (운동에 필요하니까!) 곳마다 어울리는 모양이 있어요.",fit_slides:["real_world"]},
  {id:"m_unit_end",type:"tip",icon:"🧩",title:"단원 마침 축하 — 2단원",content:"2단원은 시각·촉각·창작이 모두 들어간 풍성한 단원. 학생들이 한 단원을 완주한 것을 함께 기뻐해 주세요.",fit_slides:["summary"]},
  {id:"b_around_us",type:"book",icon:"📖",title:"『우리 주변의 모양 이야기』",content:"세 모양이 어떻게 우리 일상을 채우는지 다룬 그림책. 단원 마무리 자리에 짧게 읽어 주면 자연스러운 정리.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_addsub_preview",type:"extension",icon:"⬆",title:"다음 단원 — 덧셈과 뺄셈",content:"3단원은 '덧셈과 뺄셈'. 1단원에서 만난 수가 만나서 더해지고 빼지는 단원. 수와 수가 만나는 진짜 출발 자리.",fit_slides:["next_lesson"]}
    ]
  };

})();
