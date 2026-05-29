/* ============================================================================
   1학년 수학 4단원 (비교하기) 차시 데이터
   - 키 형식: window.LESSONS["u4_l{NN}"]
   - 백필(2026-05-27): 과거 STATUS는 "완료"로 박혀 있었으나 실제는 빈 스텁이었음.
     레포에 학생 draft.html이 없어, 차시별 _PLAN.md(18슬 설계도)를 소스로 가공.
   - 형식 기준 = g1_math_u3.js. meta = {title,subtitle,std,duration}.
   - 전 차시 성취기준 [2수03-06] (측정 — 비교하기).
   - suggested_extras / extras 는 cycle C에서 채움.
   ============================================================================ */

(function () {
  if (!window.LESSONS) window.LESSONS = {};

  // ─────────── 1차시: 단원 도입 ───────────
  window.LESSONS["u4_l01"] = {
    meta: { title:"1학년 수학 4단원 1차시", subtitle:"단원 도입 — 비교하기", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 시작\n비교하기\n🔍 무엇을 비교할까요?",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"방 안을 살펴봐요",kids:[{face:"🎒",label:"책가방"},{face:"✏️",label:"필통"},{face:"🙂",label:"무엇을?"}],question:"방 안에 여러 물건이 있어요.\n물건끼리 **무엇을 비교**할 수 있을까요?"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"이번 단원에서 비교할 **4가지**\n**길이 · 무게 · 넓이 · 들이**\n오늘은 4가지를 미리 만나 봐요"},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"필통에 들어갈 물건은?",bidirect:["필통 그림 안에","연필·지우개는 들어가요","책가방은 못 들어가요","**크기로 나누어** 봐요"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"책가방에 들어갈 물건은?",bidirect:["책가방 그림 안에","책·공책은 들어가요","무엇을 기준으로?","**크기·길이**로 나누어 봐요"]},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"question",data:{title:"어떤 까닭으로 나눴을까요?",content:"물건을 나눈 **까닭**을 말해 봐요.\n크기 때문일까요? 길이 때문일까요?\n무게 때문일까요?"},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"summary",data:{title:"비교의 4가지 속성",points:["**길이** — 길다 · 짧다","**무게** — 무겁다 · 가볍다","**넓이** — 넓다 · 좁다","**들이** — 많다 · 적다"]},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"실천 활동 1 — 길이",question:"수저의 길이를 살펴봐요.\n우리 집 물건 중\n**더 긴 것·더 짧은 것**을 찾아볼까요?"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"실천 활동 2 — 무게",question:"장난감을 정리하며\n**더 무거운 것·더 가벼운 것**을\n들어 봐요."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"실천 활동 3 — 넓이",question:"빨래를 개면서\n**더 넓은 것·더 좁은 것**을\n찾아봐요."},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"실천 활동 4 — 들이",question:"물을 따르며\n**더 많이 담기는 것·적게 담기는 것**을\n비교해 봐요."},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"question",data:{title:"하고 싶은 활동 고르기",content:"4가지 실천 활동 중\n**가장 해 보고 싶은 것**을 골라요.\n왜 그것을 골랐나요?"},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"가족과 함께 해 봐요",scenario:{icon:"👨‍👩‍👧",body:"\"우리 가족과 함께\n( ) 활동을 해 봐요.\"\n\n집에서 비교하기를 실천할 수 있어요."}},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"친구들의 선택을 살펴봐요",content:"친구들은 어떤 활동을 골랐을까요?\n**다양한 선택**이 있어요.\n나와 다른 까닭도 들어 봐요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"card_arrange",data:{title:"실천 표 만들기",steps:["내가 고른 활동을 적어요","언제 실천할지 정해요","누구와 함께할지 정해요","단원이 끝날 때까지 실천해요"]},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"다짐 카드",points:["저는 4단원을 배우며","( ) 활동을","꾸준히 실천할 것을","다짐합니다 ✍️"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"비교의 4가지(길이·무게·넓이·들이)를 말할 수 있나요?\n실천 활동을 하나 정했나요?\n비교하기를 배울 준비가 됐나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**어느 것이 더 길까요?**\n길이를 비교하는 방법을 배워 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 2차시: 어느 것이 더 길까요 (길이) ───────────
  window.LESSONS["u4_l02"] = {
    meta: { title:"1학년 수학 4단원 2차시", subtitle:"어느 것이 더 길까요", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 본 차시\n어느 것이 더 길까요\n☂️ 길이를 비교해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"두 우산 중 무엇을?",kids:[{face:"☂️",label:"주황 우산"},{face:"🌂",label:"노란 우산"},{face:"🙂",label:"어느 것?"}],question:"두 우산이 있어요.\n어느 우산이 **더 길까요?**"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**길이**를 비교하는 방법\n**길다 · 짧다** 말로 표현하기\n전 시간 4속성 중 오늘은 **길이**"},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"눈으로 직관 비교",bidirect:["긴 우산 ☂️","짧은 우산 🌂","차이가 크면","**눈으로도** 알 수 있어요"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"끝 맞추기로 직접 비교",bidirect:["한쪽 끝을 **기준선**에 맞춰요","두 물건을 나란히","남는 쪽이 **더 길다**","끝을 맞춰야 정확해요"]},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"'길다 · 짧다' 말로",bidirect:["더 긴 쪽 → **더 길다**","더 짧은 쪽 → **더 짧다**","말로 표현해 봐요"]},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"두 물건 → 세 물건",steps:["둘을 비교하면 더 길다·짧다","셋을 비교하면?","**가장 길다 · 가장 짧다**","다음 문제에서 해 봐요"]},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"색연필 두 자루 비교",question:"보라 색연필과 빨강 색연필\n끝을 맞춰 봐요.\n\n어느 것이 **더 깁니까?**"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"크레파스와 색연필 비교",question:"크레파스와 색연필\n끝을 맞춰 봐요.\n\n어느 것이 **더 짧습니까?**"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 짧은 것",question:"연필 · 지우개 · 필통\n\n**가장 짧은 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 긴 것",question:"책 · 자 · 테이프\n\n**가장 긴 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"가위바위보 길이 놀이 (1턴)",scenario:{icon:"✊",body:"가위바위보로 두 물건을 정해요.\n끝을 맞춰 길이를 비교하고\n**더 긴 것**을 말해 봐요."}},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"가위바위보 길이 놀이 (2턴)",scenario:{icon:"✌️",body:"다른 물건 조합으로\n한 번 더 해 봐요.\n끝 맞추기를 잊지 말아요."}},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"끝이 안 맞으면? (함정)",question:"두 막대가 있어요.\n한쪽 끝이 **안 맞아** 있어요.\n더 길어 보이는 것이 **정말** 더 길까요?\n끝을 맞춰 확인해 봐요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"일상에서 길이",content:"긴 양말과 짧은 양말,\n긴 줄과 짧은 줄…\n생활 속 **길이**를 찾아 말해 봐요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["길이는 **끝을 맞춰** 비교해요","더 긴 쪽 → 더 길다","더 짧은 쪽 → 더 짧다","셋이면 가장 길다·가장 짧다"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"끝을 맞춰 길이를 비교할 수 있나요?\n'길다·짧다'로 말할 수 있나요?\n가장 긴 것을 찾을 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**어느 것이 더 무거울까요?**\n무게를 비교하는 방법을 배워 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 3차시: 어느 것이 더 무거울까요 (무게) ───────────
  window.LESSONS["u4_l03"] = {
    meta: { title:"1학년 수학 4단원 3차시", subtitle:"어느 것이 더 무거울까요", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 본 차시\n어느 것이 더 무거울까요\n⚖️ 무게를 비교해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"수박과 참외",kids:[{face:"🍉",label:"수박"},{face:"🍈",label:"참외"},{face:"🙂",label:"어느 것?"}],question:"냉장고에서 수박과 참외를 꺼내요.\n어느 것을 손으로 들 수 있을까요?\n어느 것이 **더 무거울까요?**"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**무게**를 비교하는 방법\n**무겁다 · 가볍다** 말로 표현하기\n오늘은 4속성 중 **무게**"},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"양손으로 들어 봐요",bidirect:["한 손에 수박 🍉","다른 손에 참외 🍈","무거운 쪽으로 **손이 내려가요**","들어 보면 알 수 있어요"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"양팔저울로 비교",bidirect:["두 물건을 양팔저울에","무거운 쪽이 **내려가요**","가벼운 쪽이 **올라가요**","눈으로 어려우면 **도구**를"]},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"'무겁다 · 가볍다' 말로",bidirect:["내려간 쪽 → **더 무겁다**","올라간 쪽 → **더 가볍다**","말로 표현해 봐요"]},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"advanced_problem",data:{title:"큰 것이 항상 더 무거울까? (함정 도입)",question:"큰 풍선 🎈 vs 작은 콩 주머니\n\n**큰 것**이 항상 더 무거울까요?\n들어서 확인해 봐요."},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"수학책과 지우개",question:"수학책과 지우개를\n양손으로 들어 봐요.\n\n어느 것이 **더 무겁습니까?**"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"풍선과 콩 주머니",question:"풍선과 콩 주머니를\n양팔저울에 올려요.\n\n어느 것이 **더 가볍습니까?**"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 무거운 것",question:"필통 · 책가방 · 의자\n\n**가장 무거운 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 가벼운 것",question:"공책 · 색연필 · 깃털\n\n**가장 가벼운 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"돌아다니며 친구 만나기 (1턴)",scenario:{icon:"🚶",body:"교실을 돌아다니다\n친구와 만나 두 물건을 정해요.\n양손으로 들어 **더 무거운 것**을 말해요."}},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"돌아다니며 친구 만나기 (2턴)",scenario:{icon:"🚶‍♀️",body:"다른 친구, 다른 물건으로\n한 번 더 해 봐요."}},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"빈 상자 vs 작은 돌 (함정)",question:"큰 종이상자(빈 상자) vs 작은 돌\n\n어느 것이 **더 무거울까요?**\n양팔저울로 직접 확인해 봐요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"일상에서 무게",content:"장난감을 정리하면서\n**무거운 것**과 **가벼운 것**을\n나누어 봐요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["무게는 **손으로 들거나 양팔저울**로 비교","내려간 쪽 → 더 무겁다","올라간 쪽 → 더 가볍다","**크다고 항상 무거운 건 아니에요**"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"양손·양팔저울로 무게를 비교할 수 있나요?\n'무겁다·가볍다'로 말할 수 있나요?\n크기와 무게가 다를 수 있음을 알았나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**어느 것이 더 넓을까요?**\n넓이를 비교하는 방법을 배워 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 4차시: 어느 것이 더 넓을까요 (넓이) ───────────
  window.LESSONS["u4_l04"] = {
    meta: { title:"1학년 수학 4단원 4차시", subtitle:"어느 것이 더 넓을까요", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 본 차시\n어느 것이 더 넓을까요\n🟦 넓이를 비교해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"두 돗자리",kids:[{face:"🟩",label:"꽃 돗자리"},{face:"🟫",label:"곰돌이 돗자리"},{face:"🙂",label:"어느 것?"}],question:"혼자 앉을 돗자리,\n여럿이 앉을 돗자리.\n어느 것이 **더 넓을까요?**"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**넓이**를 비교하는 방법\n**넓다 · 좁다** 말로 표현하기\n오늘은 4속성 중 **넓이**"},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"눈으로 직관 비교",bidirect:["큰 돗자리","작은 돗자리","차이가 크면","**눈으로도** 알 수 있어요"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"겹쳐 보기로 직접 비교",bidirect:["한 면을 다른 면 **위에 포개요**","삐져나온 쪽이 **더 넓다**","완전히 덮이면 **더 좁다**","포개야 정확해요"]},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"'넓다 · 좁다' 말로",bidirect:["삐져나온 쪽 → **더 넓다**","덮인 쪽 → **더 좁다**","말로 표현해 봐요"]},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"포함 관계도 넓이",steps:["운동장과 축구장","넓은 곳 안에 좁은 곳","둘 → 셋으로 확장","가장 넓다·가장 좁다"]},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"책과 수첩 비교",question:"책과 수첩을\n겹쳐 봐요.\n\n어느 것이 **더 넓습니까?**"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"스케치북과 메모지 비교",question:"스케치북과 메모지를\n겹쳐 봐요.\n\n어느 것이 **더 좁습니까?**"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 좁은 것",question:"수첩 · 책 · 스케치북\n\n**가장 좁은 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"세 물건 — 가장 넓은 것",question:"엽서 · 도화지 · 공책\n\n**가장 넓은 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"종이 접기 놀이 (1턴)",scenario:{icon:"📄",body:"가위바위보를 해요.\n진 사람이 종이를 **반으로 접어요**.\n접은 종이와 안 접은 종이, 어느 게 더 넓을까요?"}},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"종이 접기 놀이 (2턴)",scenario:{icon:"📐",body:"또 접으면 점점 **좁아져요**.\n접을수록 넓이가 어떻게 변하는지\n비교해 봐요."}},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"모양이 다르면? (함정)",question:"가로로 긴 직사각형 vs 정사각형\n(사실 **같은 넓이**)\n\n어느 것이 더 넓을까요?\n겹쳐서 확인해 봐요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"일상에서 넓이",content:"빨래를 개면서\n**넓은 것**과 **좁은 것**을\n비교해 봐요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["넓이는 **겹쳐 보기**로 비교해요","삐져나온 쪽 → 더 넓다","덮인 쪽 → 더 좁다","모양이 달라도 넓이는 같을 수 있어요"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"겹쳐서 넓이를 비교할 수 있나요?\n'넓다·좁다'로 말할 수 있나요?\n가장 넓은 것을 찾을 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**어느 것에 더 많이 담을 수 있을까요?**\n들이를 비교하는 방법을 배워 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 5차시: 어느 것에 더 많이 담을 수 있을까요 (들이) ───────────
  window.LESSONS["u4_l05"] = {
    meta: { title:"1학년 수학 4단원 5차시", subtitle:"어느 것에 더 많이 담을 수 있을까요", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 본 차시\n어느 것에 더 많이 담을까요\n🥤 들이를 비교해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"두 물통",kids:[{face:"🔴",label:"빨강 물통"},{face:"🔵",label:"파랑 물통"},{face:"🙂",label:"어느 것?"}],question:"운동회에 물통을 가져가요.\n어느 물통에 **더 많이** 담을 수 있을까요?"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**들이**(담을 수 있는 양)를 비교하는 방법\n**많다 · 적다** 말로 표현하기\n오늘은 4속성 중 **들이**"},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"눈으로 직관 비교",bidirect:["큰 물통","작은 물통","차이가 크면","**눈으로도** 알 수 있어요"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"물 옮겨 담기로 직접 비교",bidirect:["한 그릇 물을 다른 그릇에 **옮겨 담아요**","넘치면 → 받는 그릇이 더 **적다**","공간이 남으면 → 더 **많다**","옮겨 담아야 정확해요"]},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"'많다 · 적다' 말로",bidirect:["더 담기는 쪽 → **더 많다**","덜 담기는 쪽 → **더 적다**","말로 표현해 봐요"]},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"compare",data:{title:"'담을 수 있는 양' vs '담긴 양'",items:[{ten_frame:1,num:1,caption:"빈 그릇 — 담을 수 있는 양"},{ten_frame:2,num:2,caption:"물 담긴 그릇 — 담긴 양",is_anchor:true}]},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"유리병과 요구르트병",question:"유리병 물을 요구르트병에\n옮겨 담아 봐요.\n\n어느 것에 **더 많이** 담을 수 있습니까?"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"작은 컵과 큰 컵",question:"작은 컵과 큰 컵\n물을 옮겨 담아 봐요.\n\n어느 것에 **더 적게** 담깁니까?"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"같은 컵 — 가장 적은 것",question:"크기·모양 같은 컵 가·나·다\n물이 담겨 있어요.\n\n**가장 적게 담긴 것**은?"},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"세 그릇 — 가장 많은 것",question:"세 그릇에 물이 담겨 있어요.\n\n**가장 많이 담긴 것**은 무엇일까요?"},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"종 울리면 2명 만나기 놀이",scenario:{icon:"🔔",body:"종이 울리면 2명이 만나요.\n각자 통을 골라 물을 옮겨 담아\n**더 많이 담기는 것**을 말해요."}},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"종 울리면 3명 만나기 놀이",scenario:{icon:"🔔",body:"이번엔 3명이 만나요.\n세 그릇을 **많은 순서대로** 정렬해 봐요."}},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"물 높이가 같으면? (함정)",question:"모양이 다른 두 그릇,\n물 **높이만 같아요**.\n담긴 양도 같을까요?\n옮겨 담아 확인해 봐요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"일상에서 들이",content:"물통과 컵에 물을 따르며\n**많이 담기는 것**과 **적게 담기는 것**을\n비교해 봐요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["들이는 **물 옮겨 담기**로 비교해요","더 담기는 쪽 → 더 많다","덜 담기는 쪽 → 더 적다","'담을 수 있는 양'과 '담긴 양'은 달라요"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"물을 옮겨 담아 들이를 비교할 수 있나요?\n'많다·적다'로 말할 수 있나요?\n물 높이가 같아도 양이 다를 수 있음을 알았나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**수학이랑 확인해요**\n4단원에서 배운 것을 점검해 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 6차시: 수학이랑 확인해요 (단원 평가) ───────────
  // 특수 구조 — 평가 차시. 5단계 흡수: 도입(안내)·전개(방법·용어 복습)·기본/응용(문제+해설)·정리(자기평가+마무리).
  window.LESSONS["u4_l06"] = {
    meta: { title:"1학년 수학 4단원 6차시", subtitle:"수학이랑 확인해요 (단원 평가)", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 단원 평가\n수학이랑 확인해요\n✅ 배운 것을 점검해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"objective",data:{title:"오늘 점검할 것",content:"4단원에서 배운 **4가지 비교**\n**길이 · 무게 · 넓이 · 들이**\n문제를 풀고 스스로 점검해 봐요"},suggested_extras:[]},
  {id:"s03",stage:"전개",block:"summary",data:{title:"비교 방법 빠른 복습",points:["길이 — **끝 맞추기**","무게 — **손으로 들기 · 양팔저울**","넓이 — **겹쳐 보기**","들이 — **물 옮겨 담기**"]},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"summary",data:{title:"비교 용어 빠른 복습",points:["길이 — 길다 · 짧다","무게 — 무겁다 · 가볍다","넓이 — 넓다 · 좁다","들이 — 많다 · 적다"]},suggested_extras:[]},
  {id:"s05",stage:"기본문제",block:"basic_problem",data:{title:"평가 1 — 길이",question:"연필보다 **더 긴 선**을 그어 봐요.\n끝을 맞춰 비교하면 돼요."},suggested_extras:[]},
  {id:"s06",stage:"기본문제",block:"question",data:{title:"평가 1 — 정답·해설",content:"내가 그은 선은 연필보다 **더 깁니다**.\n끝을 맞춰 보면 선이 더 길게 남아요."},suggested_extras:[]},
  {id:"s07",stage:"기본문제",block:"basic_problem",data:{title:"평가 2 — 무게",question:"책과 의자 그림이에요.\n**더 가벼운 것**에 ○ 해 봐요."},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"question",data:{title:"평가 2 — 정답·해설",content:"**책**이 의자보다 더 가볍습니다.\n들어 보면 의자 쪽이 훨씬 무거워요."},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"평가 3 — 들이",question:"우유갑과 물통 그림이에요.\n담을 수 있는 양이 **더 많은 것**에 ○."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"question",data:{title:"평가 3 — 정답·해설",content:"**물통**이 우유갑보다 담을 수 있는 양이 더 많습니다.\n물을 옮겨 담으면 우유갑은 넘쳐요."},suggested_extras:[]},
  {id:"s11",stage:"응용문제",block:"advanced_problem",data:{title:"평가 4 — 넓이",question:"빨간 방석보다 **더 넓은 방석**을 그려 봐요.\n겹쳐 보면 비교할 수 있어요."},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"question",data:{title:"평가 4 — 정답·해설",content:"빨간 방석을 **덮고도 남는** 방석이 더 넓어요.\n'더 넓다 · 더 좁다'로 말할 수 있어요."},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"advanced_problem",data:{title:"평가 5 — 종합 (붙임딱지 채우기)",question:"책상 위 그림을 보고\n네 문장의 빈칸에 알맞은 붙임딱지\n**4개**를 붙여 봐요. (길이·무게·넓이·들이)"},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"평가 5 — 정답·해설 (1·2번)",content:"1번 — 더 긴 것 / 2번 — 더 무거운 것\n각 문장에 맞는 비교 표현을 확인해요."},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"평가 5 — 정답·해설 (3·4번)",content:"3번 — 더 넓은 것 / 4번 — 더 많이 담기는 것\n네 문장을 모두 맞췄는지 확인해요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"question",data:{title:"스스로 평가 (3차원)",content:"지식·이해 — 여러 방법으로 비교할 수 있나요?\n과정·기능 — 생활 속 물건을 비교해 말할 수 있나요?\n가치·태도 — 친구와 즐겁게 공부했나요?"},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"summary",data:{title:"점검 결과 · 실천 활동",points:["맞힌 만큼 스스로 칭찬해 줘요","틀린 문제는 방법을 다시 떠올려요","내가 정한 **실천 활동**을 했나요?","수학익힘 64쪽도 함께 봐요"]},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**수학이랑 만들어요**\n점토로 만들어 비교해 봐요!",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };

  // ─────────── 7차시: 수학이랑 만들어요 (창의 활동) ───────────
  // 특수 구조 — 창의 활동. 4속성 + 새 단어 '높다·낮다'(높이) 확장.
  window.LESSONS["u4_l07"] = {
    meta: { title:"1학년 수학 4단원 7차시", subtitle:"수학이랑 만들어요 (창의 활동)", std:"[2수03-06]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"4단원 창의 활동\n수학이랑 만들어요\n🎨 점토로 비교해요",emoji:""},suggested_extras:[]},
  {id:"s02",stage:"도입",block:"objective",data:{title:"오늘 할 것",content:"지금까지 배운 **4가지** 비교에\n새 단어 **높다 · 낮다**(높이)를 더해요\n점토 작품으로 비교해 봐요"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"summary",data:{title:"5가지 속성 미리보기",points:["**길이** 길다·짧다","**무게** 무겁다·가볍다","**넓이** 넓다·좁다","**들이** 많다·적다 + 오늘 새로 **높이** 높다·낮다"]},suggested_extras:[]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"점토 작품 갤러리",bidirect:["미리 만든 점토 작품 여러 개","길쭉한 것 · 납작한 것","속이 우묵한 것 · 높이 쌓은 것","무엇을 비교할 수 있을까요?"]},suggested_extras:[]},
  {id:"s05",stage:"전개",block:"basic_problem",data:{title:"점토 작품 길이 비교",question:"두 점토 작품의 길이를\n끝을 맞춰 비교해 봐요.\n어느 것이 **더 깁니까?**"},suggested_extras:[]},
  {id:"s06",stage:"전개",block:"basic_problem",data:{title:"점토 작품 무게 비교",question:"두 점토 작품을 양팔저울에 올려요.\n어느 것이 **더 무겁습니까?**"},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"다음은 넓이와 들이",steps:["길이·무게는 해 봤어요","다음 슬에서 **넓이**","그다음 **들이**","마지막에 새 단어 **높이**"]},suggested_extras:[]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"점토 작품 넓이 비교",question:"두 점토 작품을 겹쳐 봐요.\n어느 것이 **더 넓습니까?**"},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"점토 작품 들이 비교",question:"우묵한 점토 작품 두 개에\n물을 옮겨 담아 봐요.\n어느 것에 **더 많이** 담깁니까?"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"card_arrange",data:{title:"4속성 매칭",steps:["점토 작품 4개","속성 카드 — 길이·무게·넓이·들이","각 작품에 어울리는 비교 속성 짝짓기","왜 그렇게 짝지었는지 말해 봐요"]},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"세 작품 정렬",question:"점토 작품 세 개를 골라\n한 가지 속성으로\n**가장 ~ 한 것**을 찾아봐요."},suggested_extras:[]},
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"쌓기 활동 — 높이 등장",scenario:{icon:"🧱",body:"블록을 **쌓아** 탑을 만들어요.\n쌓을수록 탑이 **높아져요**.\n새 단어 **높이**를 만나 봐요."}},suggested_extras:[]},
  {id:"s13",stage:"응용문제",block:"concept",data:{title:"'높다 · 낮다' 첫 사용",bidirect:["두 탑을 나란히","더 높이 쌓은 쪽 → **더 높다**","낮게 쌓은 쪽 → **더 낮다**","높이도 비교할 수 있어요"]},suggested_extras:[]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"세 탑 — 가장 높은 것",question:"블록 탑 세 개를 쌓았어요.\n\n**가장 높은 것**과 **가장 낮은 것**은?"},suggested_extras:[]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"생활 속 5가지 속성",content:"집과 교실 그림을 보고\n길이·무게·넓이·들이·높이 중\n어울리는 비교를 찾아 말해 봐요."},suggested_extras:[]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"4단원에서 배운 5속성",points:["**길이 · 무게 · 넓이 · 들이**","+ 오늘 새로 배운 **높이**","각각 비교하는 방법이 있어요","생활 속에서 비교를 찾을 수 있어요"]},suggested_extras:[]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 평가 (3차원)",content:"점토로 5가지를 비교할 수 있나요?\n'높다·낮다'를 새로 알게 됐나요?\n친구와 즐겁게 만들고 비교했나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"4단원을 마쳐요",preview:"비교하기를 모두 배웠어요!\n실천 활동도 잊지 말고 해 봐요.\n다음 단원에서 만나요 👋",emoji:""},suggested_extras:[]}
    ],
    extras: []
  };
})();
