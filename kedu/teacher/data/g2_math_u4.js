/* ============================================================================
   2학년 1학기 수학 — 4단원 「길이 재기」 케이티처(교사주도) 차시 데이터 (9차시)
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). g2_math.html이 자동 로드·누적.
   - 성취기준 [2수03-01]~[2수03-02]. 본 차시 02~07 대응 + l01 도입·l08 확인·l09 만들어요.
   ------------------------------------------------------------
   2026-08-20 신규 제작 (40분 표준 v2 · 7요소) — 기존 파일 없음(케이티처 유일 미제작 단원)
   - 차시당 17~18슬 · extras 20~24
   - 7요소 전 차시: ①review items(l01 제외·from=이전차시) ②img 폴백
     ③서사(곰이·펭이 자연 관찰 수첩) ④offline_activity(l08 평가 제외 8차시)
     ⑤leveled_problem(기본·도전·심화 3탭·심화 open) ⑥exit_ticket(확인3+신호등3) ⑦tnote 6슬 이상
   - 근거 고정 = 학생 본차시(grade2 .../4단원_길이재기/재수정_v1/) 검증 수 계승:
     종이집게 8번(수학책 긴 쪽) · 팔 3뼘 · 긴 단위 4번=짧은 단위 8번 · 1 cm 3번=3 cm ·
     색연필 8 cm · 2~9 칸 세기=7 cm · 7과 8 사이=약 7 cm · 0에 없을 때=약 6 cm ·
     엄지손톱 약 1 cm · 가운뎃손가락 약 5 cm · 한 뼘 약 10 cm · 5 cm의 두 배=약 10 cm
   - 2학년 용어 가드: cm(센티미터)만 사용. mm·m·km·밀리미터·킬로미터·소수 표기 금지.
     조합 문자 ㎝·㎜ 금지(자 눈금 읽기 단원이라 표기 혼동 방지).
   - 선행 용어 규약: '약 몇 cm'는 l06, '어림'은 l07에서 도입.
     → l02~l05 본문에 '약 N cm', l02~l06 본문에 '어림' 선행 노출 금지.
     ⚠️ 예외 둘: ① l01은 단원 예고 차시라 여섯 걸음을 모두 이름으로 소개한다
                 ② next_lesson 블록은 다음 차시 예고 자리다. (게이트 E가 이 둘을 제외하고 검사)
   - 케이랩 매핑 없음: 길이 재기는 실물 자·종이띠가 화면 교구보다 우위(정직 원칙, g2_math_klab.js 헤더 규약).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ══════════════════ l01 — 길이 재기를 만나 볼까요 (단원 도입) ══════════════════ */
  window.LESSONS["u4_l01"] = {
    meta: { grade:2, subject:"수학", unit:4, n:1, title:"길이 재기를 만나 볼까요 (단원 도입)", std:"[2수03-01]", duration_min:40,
      lesson_format:"단원 도입 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"길이 재기를 만나 볼까요\n숲으로 관찰을 나가요", emoji:"📏"}, suggested_extras:["v_l1_intro"]},
      {id:"s02", stage:"도입", block:"objective", data:{title:"이 단원에서 배울 것", content:"**길이를 재는 법**을 차례로 배워요.\n본떠서 비교하기 → 여러 가지 단위로 재기 → **1 cm** 약속 → 자로 재기 → 약 몇 cm → 어림하기."}, suggested_extras:["t_l1_map"], tnote:{ask:["'잰다'는 말은 무슨 뜻일까요?","길이를 왜 재야 할까요?"], watch:"'비교'와 '재기'를 같은 말로 아는 아이가 많다", min:2}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 숲으로 나가요", kids:[{face:"🐻", label:"곰이\n\"나뭇잎을 적어 둘래\""},{face:"🐧", label:"펭이\n\"얼마나 긴지도 적자!\""}], question:"곰이와 펭이가 **자연 관찰 수첩**을 만들려고 해요. 나뭇잎이 얼마나 긴지 적으려면 무엇이 필요할까요?", img:"assets/photo/math/leaf_notebook.jpg"}, suggested_extras:["q_l1_why","t_l1_daily","b_l1_book"], tnote:{ask:["관찰 수첩에 무엇을 적으면 좋을까요?","'길다'만 적으면 나중에 알 수 있을까요?"], watch:"이야기만 하고 '재기'의 필요로 넘어가지 못하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"1학년 때는 맞대어 비교했어요", content:"1학년에서는 두 물건을 **나란히 놓고 끝을 맞추어** 어느 쪽이 더 긴지 보았어요.\n연필과 지우개처럼 **옮길 수 있는 것**은 이렇게 견줄 수 있어요.", note:"👉 이것을 **직접 비교**라고 해요."}, suggested_extras:["q_l1_recall"], tnote:{ask:["1학년 때 길이를 어떻게 견주었나요?","끝을 맞추지 않으면 왜 안 될까요?"], watch:"끝 맞추기를 잊고 눈대중으로 답함", min:3}},
      {id:"s05", stage:"전개", block:"compare", data:{title:"그런데 이건 어떻게 하지요?", left:{label:"✏️ **연필과 지우개**\n나란히 놓을 수 있어요"}, right:{label:"🌿 **나뭇가지에 달린 잎**\n딸 수도, 옮길 수도 없어요"}, contrast:"옮길 수 있으면 맞대면 되지만, **옮길 수 없으면** 맞댈 수가 없어요.", note:"👉 그래서 이 단원에서는 **맞대지 않고 재는 법**을 배워요."}, suggested_extras:["q_l1_why"], tnote:{ask:["교실에서 옮길 수 없는 것은 무엇이 있나요?","칠판 긴 쪽은 어떻게 견줄까요?"], watch:"'그냥 눈으로 보면 된다'고 답하는 경우 — 서로 다른 답이 나옴을 보여 줄 것", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"단원에서 만날 여섯 걸음", content:"길이를 재는 방법은 이렇게 자라나요.", items:[{emoji:"🧵", count:1, label:"**본떠서** 비교하기"},{emoji:"✋", count:1, label:"**뼘·종이집게**로 재기"},{emoji:"📏", count:1, label:"**1 cm** 약속하기"},{emoji:"📐", count:1, label:"**자**로 재기"},{emoji:"🐞", count:1, label:"**약 몇 cm** 말하기"},{emoji:"👀", count:1, label:"**어림**하기"}], note:"👉 뒤로 갈수록 **누가 재어도 같은 값**에 가까워져요."}, suggested_extras:["t_l1_map","t_l1_order"], tnote:{ask:["왜 이런 차례로 배울까요?","맨 마지막은 자 없이 하는 거래요. 될까요?"], watch:"차례의 뜻을 못 잡고 낱낱으로 기억하려 함", min:3}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"길이는 **눈으로 보면** 바로 알 수 있다고 생각한다.", right:"눈으로만 보면 사람마다 답이 달라져요. **견주거나 재어야** 누구나 같은 답을 말할 수 있어요.", hint:"두 물건을 눈으로만 보고 손을 들게 해 보세요. 답이 갈리는 순간이 이 단원의 출발점이에요."}, suggested_extras:["x_l1_eye"], tnote:{ask:["둘 중 어느 쪽이 더 길까요? (손들기)","답이 갈렸네요. 어떻게 하면 정할 수 있을까요?"], watch:"눈대중 답을 고집하는 경우 — 실물로 즉시 확인시킬 것", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"맞댈 수 있을까요 ①", scenario:{icon:"🌿", body:"곰이가 나뭇가지에 달린 잎 두 장 중 어느 쪽이 더 긴지 알고 싶어요."}, question:"두 잎을 나란히 맞대어 견줄 수 있을까요? (있다 / 없다)", input:"count_input", answer:"없다", note:"풀이: 잎을 따지 않으면 **옮길 수 없으니** 맞댈 수 없어요. 본떠서 견주어야 해요."}, suggested_extras:["q_l1_recall"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"맞댈 수 있을까요 ②", scenario:{icon:"✏️", body:"펭이가 연필과 색연필 중 어느 쪽이 더 긴지 알고 싶어요."}, question:"두 자루를 나란히 맞대어 견줄 수 있을까요? (있다 / 없다)", input:"count_input", answer:"있다", note:"풀이: 둘 다 **옮길 수 있으니** 끝을 맞추어 바로 견줄 수 있어요."}, suggested_extras:["q_l1_recall"]},
      {id:"s10", stage:"기본문제", block:"multi", data:{title:"맞대어 견주기 **어려운** 것을 모두 골라요", expectedCount:2, options:[{label:"교실 칠판의 긴 쪽", correct:true},{label:"내 지우개와 짝의 지우개"},{label:"나뭇가지에 달린 나뭇잎", correct:true},{label:"필통 속 연필 두 자루"}], note:"풀이: **옮길 수 없는 것**이 어려워요. 칠판·나뭇잎 ○ / 지우개·연필은 손으로 옮겨 맞댈 수 있어요 ✗"}, suggested_extras:["q_l1_why"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"어떻게 견줄지 말해 봐요", levels:{"기본":{q:"짝의 연필과 내 연필 중 어느 쪽이 더 긴지 알아보려면 어떻게 할까요?", a:"나란히 놓고 한쪽 끝을 맞추어 본다", steps:["옮길 수 있다 → 직접 맞대기","끝을 맞추는 것이 중요"]},"도전":{q:"교실 문의 높이와 창문의 높이 중 어느 쪽이 더 긴지 알아보려면 어떻게 할까요?", a:"끈으로 각각 본떠서 견준다", steps:["옮길 수 없다 → 직접 맞대기 불가","끈으로 본뜬 뒤 끝을 맞추어 견주기"]},"심화":{q:"우리 교실에서 **맞댈 수 없는 길이** 두 가지를 찾고, 어떻게 견줄지 말해 봐요.", a:"여러 답 (예: 칠판 긴 쪽·사물함 높이 → 끈으로 본뜨기)", open:true}}}, suggested_extras:["q_l1_why","e_l1_plan"], tnote:{ask:["옮길 수 있나요, 없나요? 먼저 물어봐요.","끈이 없으면 무엇으로 본뜰까요?"], watch:"본뜬 뒤 끝 맞추기를 빠뜨리는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"교실에서 '맞댈 수 없는 길이' 찾기", type:"group", goal:"모둠에서 옮길 수 있는 것과 없는 것을 나누고, 없는 것은 어떻게 견줄지 말하기", steps:["모둠에서 교실 물건·자리를 다섯 곳 고른다","옮길 수 있는 것과 없는 것으로 나눈다","없는 것은 '무엇으로 본뜰까'를 정한다","모둠 판에 적어 발표한다"], materials:["모둠 판","털실 또는 종이띠"], minutes:6}, suggested_extras:["q_l1_why","t_l1_daily"], tnote:{ask:["왜 그쪽으로 나누었나요?","본뜰 것이 없으면 무엇을 쓸 수 있을까요?"], watch:"물건만 고르고 나누는 까닭을 말하지 않는 모둠", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"어른들도 재고 있어요", scenario:{icon:"🏠", body:"옷 고르기, 책상 자리 정하기, 커튼 맞추기 — 모두 길이를 재고 시작해요."}, content:"가구를 사기 전에 **줄자**로 자리를 재는 것도, 옷을 살 때 팔 길이를 보는 것도 오늘 배운 재기의 어른 모습이에요."}, suggested_extras:["r_l1_home","r_l1_shop"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"관찰 수첩 첫 장을 채워 봐요", context:"곰이와 펭이가 자연 관찰 수첩 첫 장을 쓰고 있어요.", challenge:"'나뭇잎이 길다'라고만 적으면 나중에 볼 때 무엇이 아쉬울까요? 더 좋게 적으려면 무엇을 적어야 할지 말해 봐요.", note:"예: '얼마나 긴지'를 적어야 다음에 본 잎과 견줄 수 있어요."}, suggested_extras:["e_l1_plan"], tnote:{ask:["'길다'만 적으면 무엇이 아쉬울까요?","숫자로 적으면 무엇이 좋아질까요?"], watch:"기록의 필요를 못 느끼는 경우 — 두 잎을 며칠 뒤 견주는 장면을 상상시킬 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"1학년에서 배운, 나란히 놓고 끝을 맞추어 견주는 방법을?", a:"직접 비교(맞대어 비교)"},{q:"나뭇가지에 달린 잎을 맞댈 수 없는 까닭은?", a:"옮길 수 없어서"},{q:"이 단원에서 약속할, 누가 재어도 같은 단위는?", a:"1 cm"}], self:["길이를 왜 재는지 알겠어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["옮길 수 있는 것은 **끝을 맞추어** 직접 견준다.","옮길 수 없는 것은 **본떠서** 견주어야 한다.","눈으로만 보면 사람마다 답이 달라진다.","곰이와 펭이의 관찰 수첩을 채우려면 **재기**가 필요하다."], arrows:["본뜨기","단위로 재기","1 cm","자"]}, suggested_extras:["r_l1_home"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 길이를 재야 하는 까닭을 알게 되었나요?","🔧 과정·기능 — 맞댈 수 있는 것과 없는 것을 가릴 수 있나요?","💛 가치·태도 — 주변의 길이를 재어 보고 싶은가요?"], prompts:["오늘 가장 궁금해진 것은 무엇인가요?"]}, suggested_extras:["e_l1_plan"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"맞댈 수 없는 나뭇잎을 **종이띠와 끈으로 본떠** 견주어 봐요. 본뜬 뒤에는 무엇을 맞춰야 할까요?", emoji:"🧵"}, suggested_extras:["e_l1_plan"]}
    ],
    extras: [
      {id:"v_l1_intro", type:"video", icon:"🎥", title:"길이 재기 단원 미리보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EA%B8%B8%EC%9D%B4+%EC%9E%AC%EA%B8%B0+1cm", description:"본뜨기부터 자 사용까지 단원 흐름을 훑는 도입 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","objective"]},
      {id:"q_l1_why", type:"fun_question", icon:"💡", title:"왜 재야 할까요", content:"'길다'라고만 적어 둔 수첩을 한 달 뒤에 보면 무엇이 아쉬울까요? 숫자가 있으면 무엇이 달라질까요?", fit_slides:["motivate","misconception","offline_activity"]},
      {id:"q_l1_recall", type:"fun_question", icon:"💡", title:"1학년 비교 떠올리기", content:"1학년 때 무엇으로 길이를 견주었나요? 그때 꼭 지켜야 했던 약속은 무엇이었나요?", fit_slides:["concept","basic_problem"]},
      {id:"q_l1_hidden", type:"fun_question", icon:"💡", title:"교실 속 숨은 길이", content:"교실에서 '재어 보고 싶은 길이' 세 가지를 찾아볼까요? 그중 손으로 옮길 수 없는 것은 몇 개인가요?", fit_slides:["motivate","offline_activity"]},
      {id:"q_l1_body", type:"fun_question", icon:"💡", title:"내 몸으로 재기", content:"자가 없던 옛날 사람들은 무엇으로 길이를 재었을까요? 우리 몸에서 자처럼 쓸 수 있는 곳을 찾아봐요.", fit_slides:["concept","real_world"]},
      {id:"t_l1_map", type:"tip", icon:"🧩", title:"단원 지도를 먼저 보여 주기", content:"본뜨기→단위→1 cm→자→약 몇 cm→어림의 여섯 걸음을 칠판 한쪽에 붙여 두고 매 차시 짚으면 아이가 지금 어디쯤인지 압니다.", fit_slides:["objective","concept","summary"]},
      {id:"t_l1_order", type:"tip", icon:"🧩", title:"차례에는 까닭이 있어요", content:"불편함을 겪은 뒤에 다음 방법을 배우는 차례입니다. 편한 방법을 먼저 알려 주면 1 cm의 고마움이 사라져요.", fit_slides:["concept","objective"]},
      {id:"t_l1_daily", type:"tip", icon:"🧩", title:"생활 장면에서 시작", content:"옷장·책상·커튼처럼 익숙한 장면으로 열면 '재기'가 학교 안 일이 아니라는 걸 아이가 먼저 느낍니다.", fit_slides:["motivate","real_world"]},
      {id:"t_l1_split", type:"tip", icon:"🧩", title:"손들기로 답을 갈라 보기", content:"눈대중으로 손을 들게 하면 답이 갈립니다. 그 순간이 '재야 하는 까닭'을 가장 짧게 설명해 줍니다.", fit_slides:["misconception","motivate"]},
      {id:"t_l1_word", type:"tip", icon:"🧩", title:"'견주다'와 '재다' 나누기", content:"견주다=둘 중 어느 쪽인지 / 재다=얼마만큼인지. 이 두 말을 단원 내내 구별해 쓰면 개념이 흐트러지지 않아요.", fit_slides:["concept","summary"]},
      {id:"r_l1_home", type:"real_world", icon:"🌍", title:"집 안의 재기", content:"커튼 길이, 책장 자리, 신발 크기 — 집 안 물건은 거의 다 재고 나서 정해진 것들이에요.", fit_slides:["real_world","summary"]},
      {id:"r_l1_shop", type:"real_world", icon:"🌍", title:"가게에서 재는 일", content:"옷 가게, 가구 가게, 시장에서도 줄자와 자가 늘 쓰여요. 왜 눈대중으로 팔지 않을까요?", fit_slides:["real_world"]},
      {id:"r_l1_nature", type:"real_world", icon:"🌍", title:"자연을 기록하는 사람들", content:"식물과 곤충을 살피는 사람들은 크기를 꼭 적어 둡니다. 그래야 지난해와 견줄 수 있으니까요.", fit_slides:["motivate","real_world"]},
      {id:"g_l1_guess", type:"game", icon:"🎮", title:"옮길 수 있다 없다", content:"교사가 물건을 외치면 학생은 '옮길 수 있어요'면 손을 들고, '없어요'면 팔로 ✕를 만들어요. 속도를 올려 봐요.", fit_slides:["basic_problem","game"]},
      {id:"g_l1_pair", type:"game", icon:"🎮", title:"길이 스무고개", content:"교사가 교실 속 길이 하나를 마음에 정하고 '이건 책상보다 짧아요' 같은 힌트만 줍니다. 학생이 알아맞혀요.", fit_slides:["motivate","game"]},
      {id:"x_l1_eye", type:"misconception", icon:"⚠️", title:"눈대중의 함정", content:"길이가 비슷한 두 막대를 눈으로만 보게 하면 답이 갈립니다. 아이 스스로 '재야겠다'고 말하게 하는 장치예요.", fit_slides:["misconception","concept"]},
      {id:"x_l1_move", type:"misconception", icon:"⚠️", title:"'못 옮기면 못 잰다'는 생각", content:"옮길 수 없어도 본뜨면 잴 수 있습니다. 이 단원 전체가 그 답을 만들어 가는 과정이에요.", fit_slides:["misconception","concept"]},
      {id:"e_l1_plan", type:"example", icon:"📝", title:"관찰 수첩 양식", content:"'무엇을 / 어떻게 견주었나 / 결과' 세 칸짜리 수첩 양식을 나눠 주면 단원 내내 같은 틀로 기록할 수 있어요.", fit_slides:["advanced_problem","offline_activity","self_assessment"]},
      {id:"e_l1_string", type:"example", icon:"📝", title:"털실 한 뭉치 준비", content:"단원 내내 쓰는 준비물입니다. 모둠당 한 팔 길이만큼 잘라 두면 본뜨기 차시가 매끄럽게 굴러가요.", fit_slides:["offline_activity","concept"]},
      {id:"b_l1_book", type:"book", icon:"📚", title:"길이를 다룬 그림책 찾기", content:"도서관에서 '재기·크기'를 다룬 그림책을 골라 도입에 한 장면만 읽어 주면 동기가 살아납니다.", fit_slides:["motivate"]},
      {id:"c_l1_check", type:"checklist", icon:"✅", title:"단원 준비물 점검", content:"털실·종이띠·종이집게·15 cm 자·모둠 판. 1차시에 미리 안내해 두면 이후 차시가 끊기지 않아요.", fit_slides:["objective","offline_activity"]},
      {id:"q_l1_ruler", type:"fun_question", icon:"💡", title:"자는 누가 만들었을까", content:"모두가 같은 자를 쓰기로 약속한 덕분에 멀리 있는 사람과도 길이를 나눌 수 있어요. 약속이 없으면 어떤 일이 생길까요?", fit_slides:["concept","real_world"]}
    ]
  };

  /* ══════════════════ l02 — 길이를 비교하는 방법을 알아볼까요 ══════════════════ */
  window.LESSONS["u4_l02"] = {
    meta: { grade:2, subject:"수학", unit:4, n:2, title:"길이를 비교하는 방법을 알아볼까요", std:"[2수03-01]", duration_min:40,
      lesson_format:"교사주도 — 본뜨기·시작점 맞추기·간접 비교 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_02_길이를비교하는방법을알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"길이를 비교하는 방법을 알아볼까요\n맞댈 수 없으면 본떠요", emoji:"🧵"}, suggested_extras:["v_l2_string"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"옮길 수 있으면 **끝을 맞추어** 견주고, 옮길 수 없으면 **본떠서** 견준다고 했어요.", items:[{q:"1학년에서 배운, 나란히 놓고 견주는 방법은?", a:"직접 비교(맞대어 비교)"},{q:"나뭇가지에 달린 잎을 맞댈 수 없는 까닭은?", a:"옮길 수 없어서"},{q:"이 단원에서 앞으로 약속할 단위는?", a:"1 cm"}], from:"u4_l01"}, suggested_extras:["q_l2_move"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"어느 나뭇잎이 더 길까요", kids:[{face:"🐻", label:"곰이\n\"가 잎이 길어 보여\""},{face:"🐧", label:"펭이\n\"아니야, 나 잎이야\""}], question:"나뭇가지에 달린 두 나뭇잎 **가**와 **나**. 잎을 따지 않고 어떻게 길이를 견줄까요?", img:"assets/photo/math/two_leaves.jpg"}, suggested_extras:["q_l2_move","t_l2_nature","b_l2_leaf"], tnote:{ask:["잎을 따지 않고 견줄 방법이 있을까요?","무엇을 가져다 대면 좋을까요?"], watch:"'따서 대면 된다'로 끝내는 경우 — 살아 있는 잎을 지키자는 조건을 살릴 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"종이띠로 길이를 본떠요", content:"두 나뭇잎의 길이만큼 **종이띠를 잘라요**.\n본뜬 종이띠를 맞대어 보니 **나**가 더 길어요!", note:"👉 물건 대신 **본뜬 것**을 견주는 것을 **간접 비교**라고 해요."}, suggested_extras:["e_l2_strip"], tnote:{ask:["종이띠는 무엇을 대신하고 있나요?","잎이 아니라 띠를 견주어도 괜찮을까요?"], watch:"띠를 잎보다 길거나 짧게 자르고도 넘어가는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"한쪽 끝을 맞춰요", content:"본뜬 종이띠를 견줄 때는 **왼쪽 끝(시작점)**을 똑같이 맞춰야 해요.\n시작점이 어긋나면 짧은 것이 더 길어 보일 수 있어요.", note:"👉 **시작점 맞추기**는 이 단원 끝까지 계속 쓰는 약속이에요."}, suggested_extras:["x_l2_start","t_l2_start"], tnote:{ask:["시작점을 어긋나게 놓으면 어떻게 보일까요?","어느 쪽 끝을 맞추는 것이 좋을까요?"], watch:"오른쪽 끝만 보고 답을 정하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"끈으로 책상을 견주어요", content:"책상 **긴 쪽**과 **높이**는 직접 맞대기 어려워요.\n**끈**으로 각각 본떠 견주면 **긴 쪽이 더 길어요**.", items:[{emoji:"🧵", count:1, label:"**본뜨기**\n끈·종이띠로 길이만큼"},{emoji:"📍", count:1, label:"**시작점**\n한쪽 끝 맞추기"},{emoji:"⚖️", count:1, label:"**비교**\n더 길다·더 짧다"}], note:"👉 본뜰 것은 **곧게 펴서** 재야 해요. 느슨하면 길이가 달라져요."}, suggested_extras:["e_l2_strip","t_l2_taut"], tnote:{ask:["끈을 느슨하게 대면 어떻게 될까요?","책상 높이는 어디서 어디까지일까요?"], watch:"끈을 늘어뜨린 채 본떠 길이가 늘어나는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"본뜬 종이띠는 **끝을 맞추지 않아도** 어느 쪽이 긴지 알 수 있다고 생각한다.", right:"시작점을 맞추지 않으면 **짧은 것이 더 길어 보일 수 있어요**. 반드시 한쪽 끝을 맞추고 견주어요.", hint:"짧은 띠를 앞으로 쑥 내밀어 놓고 물어보면 아이들이 바로 걸려듭니다. 그때 시작점을 맞춰 다시 보여 주세요."}, suggested_extras:["x_l2_start"], tnote:{ask:["지금 어느 쪽이 길어 보이나요?","시작점을 맞추면 답이 달라질까요?"], watch:"어긋난 배치에서 눈으로만 답하는 경우", min:3}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"본뜬 나뭇잎", scenario:{icon:"🌿", body:"종이띠로 본뜬 두 나뭇잎이에요. 시작점을 맞추고 보니 나 쪽이 더 튀어나왔어요."}, question:"더 긴 잎은 가와 나 중 어느 것일까요?", input:"count_input", answer:"나", note:"풀이: 시작점을 맞췄을 때 **더 튀어나온 쪽**이 더 길어요. 그래서 **나**."}, suggested_extras:["q_l2_leaf"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"바른 방법일까요", scenario:{icon:"📏", body:"펭이가 본뜬 두 종이띠를 시작점을 맞추지 않고 아무렇게나 놓고 견주었어요."}, question:"이 방법은 바른 방법일까요? (맞다 / 아니다)", input:"count_input", answer:"아니다", note:"풀이: 시작점을 맞추지 않으면 바르게 견줄 수 없어요."}, suggested_extras:["x_l2_start"]},
      {id:"s10", stage:"기본문제", block:"match", data:{title:"끈으로 본떠 견주었어요", type:"touch_match", pairs:[{left:{label:"빨강·노랑·파랑 끈 중 **가장 긴** 것 (빨강이 가장 튀어나옴)"}, right:{num:"빨강"}},{left:{label:"책상 긴 쪽과 높이 중 **더 긴** 것"}, right:{num:"긴 쪽"}},{left:{label:"본뜬 띠를 견줄 때 맞추는 곳"}, right:{num:"시작점"}}]}, suggested_extras:["q_l2_leaf"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"본떠서 견주어 봐요", levels:{"기본":{q:"시작점을 맞춘 두 종이띠 중 오른쪽 끝이 더 튀어나온 쪽은 어떤 띠일까요?", a:"더 긴 띠", steps:["시작점 같음","더 튀어나온 쪽 = 더 길다"]},"도전":{q:"종이띠 가·나·다를 시작점을 맞추어 놓았더니 나가 가장 튀어나오고 다가 가장 덜 튀어나왔어요. 짧은 것부터 차례로 쓰면?", a:"다 · 가 · 나", steps:["가장 덜 튀어나온 다 = 가장 짧다","그다음 가","가장 튀어나온 나 = 가장 길다"]},"심화":{q:"교실에서 **맞댈 수 없는 길이** 두 곳을 골라 끈으로 본떠 견주고, 어떻게 했는지 말해 봐요.", a:"여러 답 (예: 칠판 긴 쪽 vs 창문 긴 쪽)", open:true}}}, suggested_extras:["e_l2_strip","q_l2_move"], tnote:{ask:["시작점을 맞췄는지 먼저 볼까요?","셋을 한 번에 견주려면 어떻게 놓을까요?"], watch:"두 개씩만 견주고 셋의 차례를 못 정하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"짝과 함께 본떠서 견주기", type:"pair", goal:"끈으로 교실 두 곳의 길이를 본떠 시작점을 맞추어 견주기", steps:["짝과 견줄 두 곳을 정한다 (예: 책상 긴 쪽, 의자 높이)","끈을 곧게 펴서 각각 본뜬 뒤 자른 곳을 손으로 잡는다","두 끈의 **시작점을 맞추어** 견준다","'○○이 △△보다 더 길다'로 말한다"], materials:["털실 또는 종이띠","가위"], minutes:6}, suggested_extras:["e_l2_strip","t_l2_taut"], tnote:{ask:["끈이 느슨하지 않은가요?","시작점을 맞췄나요?"], watch:"끈을 늘어뜨려 본떠 길이가 늘어나는 짝", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"놀이공원의 키 재는 줄", scenario:{icon:"🎢", body:"놀이기구 옆에는 '이 선보다 커야 탈 수 있어요' 하는 줄이 있어요."}, content:"그 줄은 **본뜬 길이**예요. 사람을 옮겨서 견줄 수 없으니 줄 하나를 정해 두고 모두를 그 줄과 견주는 거예요."}, suggested_extras:["r_l2_park","r_l2_tailor"], tnote:{ask:["왜 사람마다 재지 않고 줄 하나를 쓸까요?","이 줄은 무엇을 대신하나요?"], watch:"'키가 큰 사람만'이라는 결과만 보고 방법을 놓치는 경우", min:3}},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"끈이 하나뿐이라면", context:"곰이에게 끈이 딱 하나밖에 없어요.", challenge:"끈 하나로 나무 둘레와 나뭇가지 길이를 모두 견주려면 어떻게 하면 될까요? 방법을 말해 봐요.", note:"예: 한 곳을 본뜬 자리를 손가락으로 잡아 두고, 다른 곳에 대어 남는지 모자라는지 본다."}, suggested_extras:["q_l2_one"], tnote:{ask:["본뜬 자리를 어떻게 표시할까요?","남으면 어느 쪽이 더 긴 걸까요?"], watch:"끈을 두 번 자르려는 경우 — 표시만으로 된다는 걸 짚어 줄 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"맞댈 수 없는 길이를 견주는 방법은?", a:"끈·종이띠로 본떠서 견준다"},{q:"본뜬 것을 견줄 때 꼭 맞춰야 하는 곳은?", a:"한쪽 끝(시작점)"},{q:"본뜬 것을 견주는 방법을 무엇이라고 하나요?", a:"간접 비교"}], self:["본떠서 견줄 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["맞댈 수 없는 길이는 **끈·종이띠로 본떠** 견준다.","본뜬 것은 **시작점을 맞추어** 견준다.","본뜬 것으로 견주는 것을 **간접 비교**라고 한다.","곰이와 펭이는 나뭇잎 **나**가 더 길다는 것을 알았다."], arrows:["본뜨기","시작점 맞추기","더 길다·더 짧다"]}, suggested_extras:["r_l2_park"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 간접 비교가 무엇인지 알게 되었나요?","🔧 과정·기능 — 끈으로 본떠 시작점을 맞추어 견줄 수 있나요?","💛 가치·태도 — 나뭇잎을 따지 않고 견주려는 마음이 들었나요?"], prompts:["오늘 본뜨기를 하며 어려웠던 점은 무엇인가요?"]}, suggested_extras:["e_l2_strip"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이번엔 **뼘·종이집게** 같은 것으로 길이가 **몇 번**인지 세어 봐요. 단위가 길면 횟수는 어떻게 될까요?", emoji:"✋"}, suggested_extras:["c_l2_prep"]}
    ],
    extras: [
      {id:"v_l2_string", type:"video", icon:"🎥", title:"끈으로 길이 본뜨기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EA%B8%B8%EC%9D%B4+%EA%B0%84%EC%A0%91%EB%B9%84%EA%B5%90+%EB%B3%B8%EB%9C%A8%EA%B8%B0", description:"끈·종이띠로 본떠 견주는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l2_move", type:"fun_question", icon:"💡", title:"옮길 수 없는 길이 모으기", content:"교실에서 옮길 수 없는 길이를 세 곳 찾아볼까요? 무엇으로 본뜨면 좋을까요?", fit_slides:["motivate","leveled_problem","offline_activity"]},
      {id:"q_l2_leaf", type:"fun_question", icon:"💡", title:"나뭇잎 도감 만들기", content:"운동장에서 주운 잎을 종이띠로 본떠 붙이면 나만의 잎 도감이 돼요. 가장 긴 잎은 어떤 나무였나요?", fit_slides:["basic_problem","real_world"]},
      {id:"q_l2_one", type:"fun_question", icon:"💡", title:"끈 하나로 여러 번", content:"끈을 자르지 않고도 여러 곳을 견줄 수 있을까요? 어디를 표시해 두면 될까요?", fit_slides:["advanced_problem"]},
      {id:"q_l2_curve", type:"fun_question", icon:"💡", title:"구불구불한 길이", content:"곧은 것만 잴 수 있을까요? 나무 둘레처럼 휜 길이는 무엇으로 본뜰 수 있을까요?", fit_slides:["advanced_problem","concept"]},
      {id:"t_l2_start", type:"tip", icon:"🧩", title:"시작점은 눈으로 보여 주기", content:"말로 '끝을 맞춰라' 하기보다 어긋나게 놓고 한 번 틀리게 만든 뒤 맞춰 보이면 훨씬 오래 남습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l2_taut", type:"tip", icon:"🧩", title:"끈은 곧게 펴서", content:"느슨한 끈은 길이를 늘립니다. '팽팽하게'라는 말을 활동 내내 반복해 주세요.", fit_slides:["concept","offline_activity"]},
      {id:"t_l2_nature", type:"tip", icon:"🧩", title:"잎을 따지 않는 조건", content:"'따면 안 된다'는 조건이 있어야 간접 비교가 필요해집니다. 조건을 먼저 못 박아 두세요.", fit_slides:["motivate"]},
      {id:"t_l2_word", type:"tip", icon:"🧩", title:"'간접'이라는 말", content:"어려운 낱말이지만 '바로 대지 않고, 대신 본뜬 것으로'라고 풀어 주면 2학년도 충분히 씁니다.", fit_slides:["concept","summary"]},
      {id:"t_l2_three", type:"tip", icon:"🧩", title:"셋을 견줄 때", content:"셋 이상은 시작점을 한 줄로 나란히 맞춰 세우게 하세요. 두 개씩 견주다 순서를 잃는 아이가 많습니다.", fit_slides:["leveled_problem","match"]},
      {id:"r_l2_park", type:"real_world", icon:"🌍", title:"놀이공원 키 제한선", content:"사람을 옮겨 견줄 수 없으니 줄 하나를 정해 두고 모두를 그 줄과 견줍니다. 간접 비교의 어른 모습이에요.", fit_slides:["real_world","motivate"]},
      {id:"r_l2_tailor", type:"real_world", icon:"🌍", title:"옷 만드는 사람의 줄자", content:"몸에 대고 잰 줄자를 그대로 천에 옮겨 놓습니다. 본뜬 길이를 옮기는 일이지요.", fit_slides:["real_world"]},
      {id:"r_l2_tree", type:"real_world", icon:"🌍", title:"나무 둘레를 재는 까닭", content:"숲을 돌보는 사람들은 해마다 나무 둘레를 끈으로 재어 얼마나 자랐는지 봅니다.", fit_slides:["real_world","advanced_problem"]},
      {id:"g_l2_race", type:"game", icon:"🎮", title:"본뜨기 릴레이", content:"모둠별로 교사가 외친 곳을 끈으로 먼저 본떠 오는 놀이. 시작점을 맞추지 못한 모둠은 다시 갑니다.", fit_slides:["offline_activity","game"]},
      {id:"g_l2_blind", type:"game", icon:"🎮", title:"어느 쪽이 길까 손들기", content:"교사가 두 종이띠를 어긋나게 들고 물으면 학생이 손을 듭니다. 시작점을 맞춘 뒤 다시 물어 답이 바뀌는지 봐요.", fit_slides:["misconception","game"]},
      {id:"x_l2_start", type:"misconception", icon:"⚠️", title:"시작점 어긋남", content:"이 차시 최다 오답 원인입니다. 짧은 띠를 앞으로 내밀어 놓은 그림 한 장이면 충분히 드러납니다.", fit_slides:["misconception","concept","basic_problem"]},
      {id:"x_l2_loose", type:"misconception", icon:"⚠️", title:"느슨하게 본뜨기", content:"끈이 늘어지면 본뜬 길이가 실제보다 길어집니다. 팽팽함 점검을 활동 단계에 넣어 두세요.", fit_slides:["misconception","offline_activity"]},
      {id:"e_l2_strip", type:"example", icon:"📝", title:"종이띠 만들기", content:"색지를 손가락 두 개 너비로 길게 잘라 두면 본뜨기 띠가 됩니다. 모둠당 여섯 장이면 넉넉해요.", fit_slides:["concept","offline_activity","leveled_problem"]},
      {id:"e_l2_record", type:"example", icon:"📝", title:"본뜬 띠 붙이기", content:"견준 뒤 종이띠를 수첩에 나란히 붙이면 기록이 남습니다. 다음 차시 복습 자료로도 좋아요.", fit_slides:["offline_activity","self_assessment"]},
      {id:"b_l2_leaf", type:"book", icon:"📚", title:"나뭇잎 그림책", content:"잎 모양과 크기를 다룬 그림책 한 장면으로 도입을 열면 관찰 수첩 서사와 자연스럽게 이어져요.", fit_slides:["motivate"]},
      {id:"c_l2_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"종이집게 한 상자·지우개·모둠 판. 뼘은 몸으로 하니 준비물이 없습니다.", fit_slides:["next_lesson"]},
      {id:"q_l2_pair", type:"fun_question", icon:"💡", title:"짝과 내 팔", content:"짝과 내 팔 길이를 끈으로 본떠 견주어 볼까요? 누가 더 긴가요?", fit_slides:["offline_activity","motivate"]}
    ]
  };

  /* ══════════════════ l03 — 여러 가지 단위로 길이를 재어 볼까요 ══════════════════ */
  window.LESSONS["u4_l03"] = {
    meta: { grade:2, subject:"수학", unit:4, n:3, title:"여러 가지 단위로 길이를 재어 볼까요", std:"[2수03-01]", duration_min:40,
      lesson_format:"교사주도 — 임의 단위로 재기·단위와 횟수의 관계 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_03_여러가지단위로길이를재어볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"여러 가지 단위로 길이를 재어 볼까요\n뼘으로도 잴 수 있어요", emoji:"✋"}, suggested_extras:["v_l3_span"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"끈·종이띠로 **본떠서** 견주고, 견줄 때는 **시작점**을 맞췄어요.", items:[{q:"맞댈 수 없는 길이를 견주는 방법은?", a:"끈·종이띠로 본떠서 견준다"},{q:"본뜬 것을 견줄 때 맞추는 곳은?", a:"한쪽 끝(시작점)"},{q:"본뜬 것으로 견주는 것을?", a:"간접 비교"}], from:"u4_l02"}, suggested_extras:["q_l3_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"수찬이의 팔 길이를 어떻게 잴까요", kids:[{face:"🐻", label:"곰이\n\"자가 없는데?\""},{face:"🐧", label:"펭이\n\"손으로 재 보자!\""}], question:"본떠서 견줄 수는 있지만, **얼마만큼인지**는 아직 말할 수 없어요. 자가 없어도 길이를 잴 수 있을까요?", img:"assets/photo/math/hand_span.jpg"}, suggested_extras:["q_l3_ancient","t_l3_body","b_l3_old"], tnote:{ask:["'더 길다'와 '얼마만큼 길다'는 어떻게 다를까요?","자가 없으면 무엇으로 잴 수 있을까요?"], watch:"견주기와 재기를 같은 말로 쓰는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"종이집게로 수학책을 재요", content:"종이집게를 **빈틈없이 옮기며** 세어요.\n수학책 긴 쪽은 종이집게로 **8번**이에요!", note:"👉 겹치거나 사이를 벌리면 횟수가 달라져요. **빈틈없이 이어서**가 약속이에요."}, suggested_extras:["e_l3_clip","x_l3_gap"], tnote:{ask:["집게를 겹쳐 놓으면 횟수가 어떻게 될까요?","사이를 벌리면요?"], watch:"집게를 띄엄띄엄 놓고 세는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"뼘으로 팔 길이를 재요", content:"엄지와 검지를 편 길이가 **1뼘**이에요.\n팔 길이는 **3뼘**쯤 돼요.", note:"👉 뼘·걸음처럼 **몸을 단위로** 쓰면 준비물 없이도 잴 수 있어요."}, suggested_extras:["t_l3_body","q_l3_ancient"], tnote:{ask:["1뼘은 어디서 어디까지인가요?","팔을 잴 때 뼘이 몇 번 들어갔나요?"], watch:"뼘을 벌릴 때마다 넓이가 달라지는 아이 — 같은 뼘을 유지하도록", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"단위가 길면 횟수가 적어요", content:"같은 길이라도 **긴 단위**로 재면 **4번**, **짧은 단위**로 재면 **8번**이에요.", items:[{emoji:"📏", count:1, label:"**긴 단위**\n적은 횟수"},{emoji:"📎", count:1, label:"**짧은 단위**\n많은 횟수"},{emoji:"🔢", count:1, label:"**같은 길이**\n단위만 다름"}], note:"👉 길이가 달라진 게 아니에요. **재는 단위**가 달라진 거예요."}, suggested_extras:["t_l3_inverse","g_l3_race"], tnote:{ask:["막대는 그대로인데 왜 횟수가 달라졌을까요?","횟수가 많으면 더 긴 걸까요?"], watch:"횟수가 많으면 길이도 길다고 생각하는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"잰 **횟수가 많으면** 길이도 더 길다고 생각한다.", right:"같은 길이라도 **짧은 단위**로 재면 횟수가 많아져요. 횟수만 보고 길이를 견줄 수는 없어요.", hint:"'무엇으로 쟀는지'를 함께 말하지 않으면 횟수는 뜻이 없다는 걸 짚어 주세요."}, suggested_extras:["x_l3_count"], tnote:{ask:["'8번'이라고만 하면 알 수 있을까요?","무엇을 함께 말해야 할까요?"], watch:"단위를 빼고 횟수만 말하는 습관", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"종이집게로 재요", scenario:{icon:"📎", body:"곰이가 수학책 긴 쪽을 종이집게로 빈틈없이 이어 재었어요."}, question:"종이집게로 몇 번일까요?", input:"count_input", answer:"8번", note:"풀이: 본 차시에서 확인한 값 — 수학책 긴 쪽은 종이집게로 **8번**."}, suggested_extras:["e_l3_clip"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"뼘으로 재요", scenario:{icon:"✋", body:"펭이가 팔 길이를 뼘으로 재었어요."}, question:"팔 길이는 몇 뼘쯤일까요?", input:"count_input", answer:"3뼘", note:"풀이: 본 차시에서 확인한 값 — 팔 길이는 **3뼘**쯤."}, suggested_extras:["t_l3_body"]},
      {id:"s10", stage:"기본문제", block:"multi", data:{title:"바른 재기 방법을 모두 골라요", expectedCount:2, options:[{label:"단위를 빈틈없이 이어서 옮긴다", correct:true},{label:"단위를 겹쳐 가며 옮긴다"},{label:"몇 번인지 세어서 말한다", correct:true},{label:"단위를 띄엄띄엄 놓고 센다"}], note:"풀이: **빈틈없이 이어서 옮기고 횟수를 세는 것**이 바른 방법. 겹치거나 띄우면 횟수가 틀려져요."}, suggested_extras:["x_l3_gap"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"단위와 횟수를 생각해요", levels:{"기본":{q:"단위의 길이가 길수록 잰 횟수는 어떻게 될까요?", a:"적어져요", steps:["긴 단위 → 적은 횟수"]},"도전":{q:"같은 막대를 긴 단위로 재니 4번이었어요. 짧은 단위로 재면 8번이었어요. 짧은 단위는 긴 단위보다 길까요, 짧을까요?", a:"짧다", steps:["같은 길이인데 횟수가 늘었다","횟수가 늘었다 = 단위가 짧다"]},"심화":{q:"교실 긴 쪽을 **걸음**으로 재면 좋을까요, **엄지손톱**으로 재면 좋을까요? 고른 까닭을 말해 봐요.", a:"여러 답 (예: 걸음 — 긴 길이는 긴 단위가 편해서)", open:true}}}, suggested_extras:["t_l3_inverse","q_l3_choose"], tnote:{ask:["횟수가 늘면 단위는 어떻게 된 걸까요?","긴 길이를 잴 때 짧은 단위를 쓰면 무엇이 힘들까요?"], watch:"횟수와 단위를 반대로 잇는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"모둠 단위 정해 교실 재기", type:"group", goal:"모둠이 단위를 하나 정해 교실 물건 세 가지를 재고 횟수를 적기", steps:["모둠 단위를 하나 정한다 (뼘·종이집게·지우개 중)","잴 물건 세 가지를 고른다","빈틈없이 옮기며 몇 번인지 센다","'○○로 몇 번'까지 모둠 판에 적는다"], materials:["종이집게","지우개","모둠 판"], minutes:7}, suggested_extras:["e_l3_clip","g_l3_race"], tnote:{ask:["단위를 적지 않고 횟수만 적으면 어떻게 될까요?","다른 모둠과 횟수가 다르네요, 왜 그럴까요?"], watch:"모둠마다 단위가 달라 횟수가 갈리는 장면 — 다음 차시 동기이니 그대로 남겨 둘 것", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"옛날 사람들의 단위", scenario:{icon:"👣", body:"자가 흔하지 않던 때에는 발·팔·걸음으로 밭과 길을 쟀어요."}, content:"몸으로 재면 준비물이 없어 편했지만, **사람마다 몸이 달라서** 값이 서로 달랐어요. 이 불편함이 다음 시간 이야기예요."}, suggested_extras:["r_l3_history","r_l3_market"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"횟수가 다른 까닭", context:"같은 책상을 곰이는 5뼘, 펭이는 7뼘이라고 했어요.", challenge:"둘 다 빈틈없이 바르게 재었는데 왜 횟수가 다를까요? 까닭을 말해 봐요.", note:"예: 곰이 뼘이 펭이 뼘보다 길어서. 단위가 다르면 횟수도 달라져요."}, suggested_extras:["x_l3_count","q_l3_choose"], tnote:{ask:["누가 틀린 걸까요?","둘 다 맞다면 무엇이 문제일까요?"], watch:"한쪽이 틀렸다고 단정하는 경우 — 둘 다 옳고 단위가 다를 뿐임을 짚을 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"단위로 잴 때 지켜야 할 약속은?", a:"빈틈없이 이어서 옮기며 센다"},{q:"단위가 길수록 잰 횟수는?", a:"적어진다"},{q:"수학책 긴 쪽은 종이집게로 몇 번이었나요?", a:"8번"}], self:["단위로 재고 횟수를 셀 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["단위를 **빈틈없이 옮기며** 몇 번인지 세면 길이를 말할 수 있다.","**긴 단위 = 적은 횟수 / 짧은 단위 = 많은 횟수**.","횟수만 말하면 안 되고 **무엇으로 쟀는지** 함께 말해야 한다.","모둠마다 단위가 달라 값이 갈렸다 — 이 불편함이 다음 시간의 문제."], arrows:["단위 정하기","빈틈없이 옮기기","몇 번인지 세기"]}, suggested_extras:["r_l3_history"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 단위와 횟수의 관계를 알게 되었나요?","🔧 과정·기능 — 빈틈없이 옮기며 셀 수 있나요?","💛 가치·태도 — 옛날 사람들의 재기 방법이 궁금해졌나요?"], prompts:["우리 모둠 단위로 재어 본 것 중 가장 재미있던 것은?"]}, suggested_extras:["e_l3_record"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"모둠마다 값이 달라 불편했지요? **누가 재어도 똑같은 단위 1 cm**를 약속해요!", emoji:"📏"}, suggested_extras:["c_l3_prep"]}
    ],
    extras: [
      {id:"v_l3_span", type:"video", icon:"🎥", title:"뼘으로 재기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EC%9E%84%EC%9D%98%EB%8B%A8%EC%9C%84+%EA%B8%B8%EC%9D%B4+%EC%9E%AC%EA%B8%B0+%EB%BC%BC", description:"뼘·걸음 같은 임의 단위로 재는 장면.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l3_recall", type:"fun_question", icon:"💡", title:"견주기와 재기", content:"'더 길다'와 '몇 번이다'는 어떻게 다를까요? 어느 쪽이 더 자세한 말일까요?", fit_slides:["review","motivate"]},
      {id:"q_l3_ancient", type:"fun_question", icon:"💡", title:"몸으로 재던 시절", content:"발 길이, 팔 길이, 걸음 — 옛날에는 몸이 곧 자였어요. 어떤 점이 편하고 어떤 점이 불편했을까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l3_choose", type:"fun_question", icon:"💡", title:"어떤 단위가 좋을까", content:"운동장 긴 쪽을 잴 때와 지우개를 잴 때, 알맞은 단위가 서로 다른 까닭은 무엇일까요?", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l3_zero", type:"fun_question", icon:"💡", title:"딱 맞지 않으면", content:"단위를 옮기다 끝에서 조금 남으면 어떻게 말해야 할까요? 다음 차시들에서 답을 찾아봐요.", fit_slides:["concept","next_lesson"]},
      {id:"t_l3_body", type:"tip", icon:"🧩", title:"뼘을 고정시키기", content:"뼘은 벌릴 때마다 달라집니다. '한 번 정한 뼘을 끝까지'라고 말해 주면 값이 흔들리지 않아요.", fit_slides:["concept","basic_problem"]},
      {id:"t_l3_inverse", type:"tip", icon:"🧩", title:"반대 관계를 몸으로", content:"같은 막대를 손가락 한 마디와 뼘으로 각각 재게 하면 '길면 적다'가 설명 없이 몸에 남습니다.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l3_unitsay", type:"tip", icon:"🧩", title:"단위까지 말하게 하기", content:"'8'이 아니라 '종이집게로 8번'까지 말하게 하세요. 다음 차시 1 cm의 필요가 여기서 자랍니다.", fit_slides:["misconception","offline_activity"]},
      {id:"t_l3_leave", type:"tip", icon:"🧩", title:"불편함을 해결해 주지 않기", content:"모둠마다 값이 갈리는 장면을 정리해 주지 마세요. 그 어수선함이 1 cm를 배우는 힘이 됩니다.", fit_slides:["offline_activity","next_lesson"]},
      {id:"t_l3_count", type:"tip", icon:"🧩", title:"세다 놓치는 아이", content:"옮길 때마다 연필로 살짝 표시하게 하면 횟수를 잃지 않습니다.", fit_slides:["concept","offline_activity"]},
      {id:"r_l3_history", type:"real_world", icon:"🌍", title:"몸에서 온 옛 단위", content:"세계 곳곳의 옛 단위는 대부분 몸에서 왔어요. 그래서 나라마다, 사람마다 값이 달랐지요.", fit_slides:["real_world","motivate"]},
      {id:"r_l3_market", type:"real_world", icon:"🌍", title:"시장에서 뼘으로", content:"천이나 끈을 팔 때 뼘으로 세어 파는 모습이 아직도 남아 있어요. 편하지만 정확하진 않아요.", fit_slides:["real_world"]},
      {id:"r_l3_step", type:"real_world", icon:"🌍", title:"걸음으로 재는 사람들", content:"운동장이나 밭처럼 긴 곳은 지금도 걸음으로 어림잡아 세기도 해요. 긴 곳엔 긴 단위지요.", fit_slides:["real_world","leveled_problem"]},
      {id:"g_l3_race", type:"game", icon:"🎮", title:"단위 바꿔 재기 대결", content:"같은 물건을 모둠마다 다른 단위로 재어 횟수를 칠판에 적어요. 왜 값이 다른지 이야기해 봐요.", fit_slides:["concept","offline_activity","game"]},
      {id:"g_l3_guess", type:"game", icon:"🎮", title:"몇 뼘일까 맞히기", content:"교사가 물건을 들면 학생이 '몇 뼘일 것 같다'고 손가락으로 답한 뒤 함께 재어 확인해요.", fit_slides:["game","concept"]},
      {id:"x_l3_gap", type:"misconception", icon:"⚠️", title:"띄우거나 겹치기", content:"이 차시 최다 오류입니다. 일부러 겹쳐 세어 보이고 횟수가 줄어드는 것을 보여 주세요.", fit_slides:["misconception","concept","multi"]},
      {id:"x_l3_count", type:"misconception", icon:"⚠️", title:"횟수가 크면 길다는 착각", content:"단위를 빼고 횟수만 견주면 반드시 어긋납니다. 같은 막대·다른 단위 그림 한 장으로 깨집니다.", fit_slides:["misconception","advanced_problem"]},
      {id:"e_l3_clip", type:"example", icon:"📝", title:"종이집게 세트", content:"같은 크기 종이집게를 모둠당 열 개씩 담아 두면 재기 활동이 끊기지 않아요.", fit_slides:["concept","offline_activity","basic_problem"]},
      {id:"e_l3_record", type:"example", icon:"📝", title:"'무엇으로 몇 번' 기록표", content:"물건 / 단위 / 횟수 세 칸 표를 나눠 주면 단위를 빠뜨리지 않고 적게 됩니다.", fit_slides:["offline_activity","self_assessment"]},
      {id:"b_l3_old", type:"book", icon:"📚", title:"옛 단위 이야기 책", content:"도량형 이야기를 담은 어린이 책 한 대목을 읽어 주면 다음 차시 1 cm 약속이 더 반가워집니다.", fit_slides:["motivate","real_world"]},
      {id:"c_l3_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"15 cm 자(모둠당 여러 개)·1 cm 눈금 종이띠. 자는 다음 차시부터 계속 씁니다.", fit_slides:["next_lesson"]},
      {id:"q_l3_same", type:"fun_question", icon:"💡", title:"모두 같으려면", content:"우리 반 모두가 같은 값을 말하려면 무엇이 필요할까요? 무엇을 약속하면 될까요?", fit_slides:["offline_activity","next_lesson"]}
    ]
  };

  /* ══════════════════ l04 — 1 cm를 알아볼까요 ══════════════════ */
  window.LESSONS["u4_l04"] = {
    meta: { grade:2, subject:"수학", unit:4, n:4, title:"1 cm를 알아볼까요", std:"[2수03-02]", duration_min:40,
      lesson_format:"교사주도 — 임의 단위의 불편 → 1 cm 약속 → 1 cm가 몇 번 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_04_1cm를알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"1 cm를 알아볼까요\n누가 재어도 똑같은 단위", emoji:"📏"}, suggested_extras:["v_l4_cm"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"뼘·종이집게를 **빈틈없이 옮기며** 몇 번인지 세었어요. 그런데 모둠마다 값이 달랐지요.", items:[{q:"단위로 잴 때의 약속은?", a:"빈틈없이 이어서 옮기며 센다"},{q:"단위가 길수록 잰 횟수는?", a:"적어진다"},{q:"수학책 긴 쪽은 종이집게로 몇 번?", a:"8번"}], from:"u4_l03"}, suggested_extras:["q_l4_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"똑같이 3뼘인데 왜 길이가 다를까요", kids:[{face:"🐻", label:"곰이\n\"내 끈은 3뼘!\""},{face:"🐧", label:"펭이\n\"내 것도 3뼘인데 짧아\""}], question:"곰이 뼘과 펭이 뼘이 서로 달라요. 똑같이 3뼘을 잘라도 끈 길이가 서로 달라요. **누가 재어도 똑같은 단위**는 없을까요?", img:"assets/photo/math/span_conflict.jpg"}, suggested_extras:["q_l4_same","t_l4_conflict","b_l4_unit"], tnote:{ask:["둘 다 3뼘인데 왜 길이가 다를까요?","누가 틀린 걸까요?"], watch:"한 사람이 틀렸다고 단정하는 경우 — 둘 다 옳고 단위가 다를 뿐", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"단위가 다르면 불편해요", content:"내 뼘과 친구 뼘이 **달라요**. 모둠마다 정한 단위도 **달라요**.\n그래서 **누가 재어도 같은 단위**가 필요해요!", note:"👉 편지로 '3뼘짜리 끈을 보내 줘'라고 쓰면 무엇이 올지 알 수 없어요."}, suggested_extras:["q_l4_same","x_l4_mine"], tnote:{ask:["멀리 있는 친구에게 길이를 알려 주려면 어떻게 할까요?","'3뼘'이라고 쓰면 무엇이 문제일까요?"], watch:"불편함을 남의 일로 여기는 경우 — 편지 상황으로 끌어올 것", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"이만큼을 1 cm라고 해요", content:"이 길이를 **1 cm**라고 쓰고 **1 센티미터**라고 읽어요.\n세계 어디서나 똑같은 길이예요.", note:"👉 쓰기 **1 cm** · 읽기 **1 센티미터**. 손톱 폭이 이만큼쯤이에요."}, suggested_extras:["e_l4_strip","t_l4_write"], tnote:{ask:["1 cm는 어떻게 읽나요?","교실에서 1 cm쯤 되는 것을 찾아볼까요?"], watch:"쓰기와 읽기를 섞어 '일 시엠'이라 읽는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"1 cm를 이어 붙여요", content:"**1 cm가 3번**이면 **3 cm**예요.\n1 cm가 몇 번인지 세면 길이를 알 수 있어요!", items:[{emoji:"📏", count:1, label:"**1 cm**\n누가 재도 같음"},{emoji:"🗣️", count:1, label:"**읽기**\n1 센티미터"},{emoji:"✍️", count:1, label:"**쓰기**\n1 cm"},{emoji:"🔢", count:1, label:"**세기**\n1 cm가 몇 번"}], note:"👉 지난 시간의 '몇 번'이 그대로 이어져요. 단위만 **1 cm**로 바뀌었을 뿐이에요."}, suggested_extras:["e_l4_strip","g_l4_build"], tnote:{ask:["1 cm가 5번이면 몇 cm일까요?","지난 시간과 무엇이 같고 무엇이 다를까요?"], watch:"칸이 아니라 눈금 선을 세는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"1 cm도 **사람마다 길이가 다르다**고 생각한다.", right:"1 cm는 **누가 재어도 똑같은 길이**예요. 그래서 멀리 있는 사람과도 길이를 나눌 수 있어요.", hint:"뼘은 사람 몸에서 왔지만 1 cm는 모두의 약속이라는 점을 나란히 놓아 주세요."}, suggested_extras:["x_l4_mine"], tnote:{ask:["내 1 cm와 짝의 1 cm는 같을까요?","왜 그럴까요?"], watch:"뼘과 1 cm를 같은 종류로 묶는 경우", min:3}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"몇 cm일까요 ①", scenario:{icon:"📏", body:"종이띠에 1 cm 칸이 3칸 그려져 있어요."}, question:"이 종이띠의 길이는 몇 cm일까요?", input:"count_input", answer:"3 cm", note:"풀이: **1 cm가 3번**이니까 **3 cm**."}, suggested_extras:["e_l4_strip"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"어떻게 읽을까요", scenario:{icon:"🗣️", body:"곰이가 수첩에 '1 cm'라고 적었어요."}, question:"이것을 어떻게 읽을까요?", input:"count_input", answer:"1 센티미터", note:"풀이: 쓰기는 **1 cm**, 읽기는 **1 센티미터**."}, suggested_extras:["t_l4_write"]},
      {id:"s10", stage:"기본문제", block:"multi", data:{title:"1 cm에 대해 맞는 말을 모두 골라요", expectedCount:2, options:[{label:"누가 재어도 똑같은 길이예요", correct:true},{label:"사람마다 길이가 달라요"},{label:"1 cm가 5번이면 5 cm예요", correct:true},{label:"뼘처럼 몸으로 정해요"}], note:"풀이: 1 cm는 **모두의 약속**이라 값이 흔들리지 않아요. 몸에서 온 뼘과는 달라요."}, suggested_extras:["x_l4_mine"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"1 cm로 말해 봐요", levels:{"기본":{q:"1 cm가 4번이면 몇 cm일까요?", a:"4 cm", steps:["1 cm가 몇 번인지 센다","4번 → 4 cm"]},"도전":{q:"개미가 1 cm씩 여섯 번 갔어요. 개미가 간 길이는 몇 cm일까요?", a:"6 cm", steps:["1 cm가 6번","6 cm"]},"심화":{q:"몸이나 교실에서 **1 cm쯤 되는 것**과 **5 cm쯤 되는 것**을 찾아 말해 봐요.", a:"여러 답 (예: 엄지손톱 폭·지우개 긴 쪽)", open:true}}}, suggested_extras:["q_l4_find","e_l4_strip"], tnote:{ask:["1 cm가 몇 번인지 어떻게 셀까요?","찾은 것이 정말 1 cm쯤인지 어떻게 확인할까요?"], watch:"칸 대신 선을 세어 하나 더 많게 답하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"1 cm 띠로 재어 보기", type:"pair", goal:"1 cm 칸이 그려진 종이띠로 물건을 재고 몇 cm인지 말하기", steps:["1 cm 칸 종이띠를 짝과 나눠 갖는다","지우개·풀·연필을 하나씩 고른다","한쪽 끝을 띠의 시작에 맞추고 칸이 몇 번인지 센다","'○○은 몇 cm'라고 서로 말해 준다"], materials:["1 cm 눈금 종이띠","지우개·풀 등 작은 물건"], minutes:6}, suggested_extras:["e_l4_strip","t_l4_edge"], tnote:{ask:["시작을 어디에 맞췄나요?","칸을 세었나요, 선을 세었나요?"], watch:"시작점을 대충 맞춰 한 칸씩 어긋나는 짝", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"세계가 함께 쓰는 약속", scenario:{icon:"🌏", body:"다른 나라에서 만든 물건도 우리 자로 잴 수 있어요."}, content:"연필·공책·옷 크기까지 모두 같은 단위로 적혀 있어서, 만난 적 없는 사람끼리도 길이를 나눌 수 있어요."}, suggested_extras:["r_l4_world","r_l4_maker"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"편지로 길이를 알려 주기", context:"곰이가 먼 곳 친구에게 나뭇잎 길이를 알려 주려 해요.", challenge:"'내 뼘으로 1뼘'이라고 쓰면 어떤 일이 생길까요? 어떻게 써야 친구가 똑같은 길이를 알 수 있을까요?", note:"예: '8 cm'처럼 모두가 같은 단위로 써야 친구도 똑같은 길이를 알 수 있어요."}, suggested_extras:["q_l4_same"], tnote:{ask:["친구는 무엇을 보고 알 수 있을까요?","약속이 없으면 어떤 일이 생길까요?"], watch:"'그림을 그려 보내면 된다'로 끝나는 경우 — 숫자 약속의 힘까지 끌 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"누가 재어도 똑같은 길이의 단위는?", a:"1 cm"},{q:"1 cm는 어떻게 읽나요?", a:"1 센티미터"},{q:"1 cm가 3번이면 몇 cm?", a:"3 cm"}], self:["1 cm로 길이를 말할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뼘 같은 단위는 사람마다 달라 **값이 흔들린다**.","**1 cm**는 누가 재어도 똑같은 약속된 단위다.","쓰기는 **1 cm**, 읽기는 **1 센티미터**.","**1 cm가 몇 번**인지 세면 몇 cm인지 말할 수 있다."], arrows:["불편함","1 cm 약속","1 cm가 몇 번","몇 cm"]}, suggested_extras:["r_l4_world"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 1 cm가 왜 필요한지 알게 되었나요?","🔧 과정·기능 — 1 cm가 몇 번인지 세어 길이를 말할 수 있나요?","💛 가치·태도 — 약속의 고마움을 느꼈나요?"], prompts:["오늘 찾은 1 cm쯤 되는 물건은 무엇이었나요?"]}, suggested_extras:["q_l4_find"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"1 cm가 여러 번 그려진 도구, **자**를 써 봐요. 물체의 끝을 어디에 맞춰야 할까요?", emoji:"📐"}, suggested_extras:["c_l4_prep"]}
    ],
    extras: [
      {id:"v_l4_cm", type:"video", icon:"🎥", title:"1 cm 약속 이야기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+1cm+%EC%84%BC%ED%8B%B0%EB%AF%B8%ED%84%B0", description:"임의 단위의 불편에서 약속된 단위(1 cm)로 넘어가는 흐름 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l4_recall", type:"fun_question", icon:"💡", title:"어제의 불편 떠올리기", content:"모둠마다 값이 달랐던 일을 떠올려 볼까요? 그때 무엇이 있었으면 좋았을까요?", fit_slides:["review","motivate"]},
      {id:"q_l4_same", type:"fun_question", icon:"💡", title:"편지로 길이 보내기", content:"먼 곳 친구에게 길이를 알려 주려면 무엇으로 써야 할까요? '내 뼘으로'라고 쓰면 어떻게 될까요?", fit_slides:["concept","advanced_problem"]},
      {id:"q_l4_find", type:"fun_question", icon:"💡", title:"1 cm 찾기", content:"몸이나 교실에서 1 cm쯤 되는 것을 찾아볼까요? 손톱, 지우개 두께, 단추는 어떤가요?", fit_slides:["leveled_problem","self_assessment"]},
      {id:"q_l4_big", type:"fun_question", icon:"💡", title:"아주 긴 것도 cm로?", content:"운동장 긴 쪽도 cm로 말할 수 있을까요? 숫자가 아주 커지면 어떤 기분이 들까요?", fit_slides:["concept","real_world"]},
      {id:"t_l4_conflict", type:"tip", icon:"🧩", title:"다툼 장면을 살려 두기", content:"'둘 다 3뼘인데 다르다'는 충돌이 이 차시의 심장입니다. 서둘러 답을 주지 말고 아이들이 답답해하게 두세요.", fit_slides:["motivate","concept"]},
      {id:"t_l4_write", type:"tip", icon:"🧩", title:"쓰기와 읽기 나누기", content:"칠판에 '쓰기 1 cm / 읽기 1 센티미터'를 붙여 두면 읽기 오류가 거의 사라집니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l4_edge", type:"tip", icon:"🧩", title:"칸을 세게 하기", content:"눈금 선이 아니라 칸을 세게 하세요. 선을 세면 늘 하나가 더 많아집니다.", fit_slides:["concept","offline_activity","leveled_problem"]},
      {id:"t_l4_nail", type:"tip", icon:"🧩", title:"손톱을 자로 삼기", content:"엄지손톱 폭이 1 cm쯤이라는 감각을 여기서 심어 두면 마지막 어림 차시가 훨씬 수월합니다.", fit_slides:["concept","self_assessment"]},
      {id:"t_l4_bridge", type:"tip", icon:"🧩", title:"'몇 번'은 그대로", content:"지난 차시의 '몇 번 세기'가 단위만 1 cm로 바뀐 것임을 짚어 주면 새 개념이 아니라 이음으로 받아들입니다.", fit_slides:["concept","summary"]},
      {id:"r_l4_world", type:"real_world", icon:"🌍", title:"세계가 같은 자를 써요", content:"다른 나라에서 온 물건도 우리 자로 잴 수 있어요. 약속이 같으면 만난 적 없어도 길이를 나눌 수 있지요.", fit_slides:["real_world","summary"]},
      {id:"r_l4_maker", type:"real_world", icon:"🌍", title:"물건 만드는 곳", content:"공장에서는 아주 작은 차이도 맞춰야 해서 모두 같은 단위로 적힌 도면을 봅니다.", fit_slides:["real_world"]},
      {id:"r_l4_doctor", type:"real_world", icon:"🌍", title:"키를 재는 날", content:"학교에서 키를 잴 때도 같은 단위로 적어요. 그래야 지난해와 견주어 얼마나 자랐는지 알 수 있어요.", fit_slides:["real_world","motivate"]},
      {id:"g_l4_build", type:"game", icon:"🎮", title:"1 cm 이어 붙이기", content:"1 cm 조각을 나눠 주고 교사가 외친 길이를 만들어 드는 놀이. '4 cm!'에 네 조각을 이어요.", fit_slides:["concept","game"]},
      {id:"g_l4_quick", type:"game", icon:"🎮", title:"몇 cm 빨리 말하기", content:"교사가 칸 그림을 들면 학생이 몇 cm인지 외칩니다. 칸과 선을 헷갈리는 아이를 바로 찾을 수 있어요.", fit_slides:["basic_problem","game"]},
      {id:"x_l4_mine", type:"misconception", icon:"⚠️", title:"'내 1 cm'라는 생각", content:"뼘과 1 cm를 같은 종류로 묶는 오해입니다. 나란히 놓고 '몸에서 온 것 / 모두의 약속'으로 갈라 주세요.", fit_slides:["misconception","concept","multi"]},
      {id:"x_l4_line", type:"misconception", icon:"⚠️", title:"선을 세는 아이", content:"눈금 선을 세면 늘 하나가 더 많습니다. 칸을 손가락으로 짚으며 세게 하세요.", fit_slides:["misconception","offline_activity"]},
      {id:"e_l4_strip", type:"example", icon:"📝", title:"1 cm 눈금 종이띠", content:"1 cm 칸이 그려진 띠를 인쇄해 두면 자를 쓰기 전에 칸 세기를 충분히 연습할 수 있어요.", fit_slides:["concept","offline_activity","basic_problem"]},
      {id:"e_l4_card", type:"example", icon:"📝", title:"1 cm 조각 카드", content:"1 cm 정사각 조각을 여러 장 만들어 두면 이어 붙이기 놀이와 확인 문제에 두루 쓰입니다.", fit_slides:["game","leveled_problem"]},
      {id:"b_l4_unit", type:"book", icon:"📚", title:"단위 이야기 그림책", content:"'모두가 같은 것으로 재기로 했다'는 이야기를 다룬 책 한 대목이 약속의 뜻을 잘 살려 줍니다.", fit_slides:["motivate","real_world"]},
      {id:"c_l4_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"15 cm 자를 모둠당 넉넉히. 눈금이 0부터 뚜렷한 자로 준비하면 0 맞춤 지도가 쉬워요.", fit_slides:["next_lesson"]},
      {id:"q_l4_zero", type:"fun_question", icon:"💡", title:"자에는 왜 0이 있을까", content:"다음 시간에 쓸 자를 미리 보면 맨 앞에 0이 있어요. 0은 무엇을 뜻할까요?", fit_slides:["next_lesson","concept"]}
    ]
  };

  /* ══════════════════ l05 — 자로 길이를 재는 방법을 알아볼까요 ══════════════════ */
  window.LESSONS["u4_l05"] = {
    meta: { grade:2, subject:"수학", unit:4, n:5, title:"자로 길이를 재는 방법을 알아볼까요", std:"[2수03-02]", duration_min:40,
      lesson_format:"교사주도 — 자의 눈금·0 맞춤·칸 세기 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_05_자로길이를재는방법을알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"자로 길이를 재는 방법을 알아볼까요\n0에 맞추고 읽어요", emoji:"📐"}, suggested_extras:["v_l5_ruler"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"누가 재어도 같은 단위 **1 cm**를 약속했어요. **1 cm가 몇 번**인지 세면 몇 cm인지 알 수 있지요.", items:[{q:"누가 재어도 똑같은 단위는?", a:"1 cm"},{q:"1 cm는 어떻게 읽나요?", a:"1 센티미터"},{q:"1 cm가 3번이면?", a:"3 cm"}], from:"u4_l04"}, suggested_extras:["q_l5_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"나뭇잎의 길이는 몇 cm일까요", kids:[{face:"🐻", label:"곰이\n\"칸을 세려니 힘들어\""},{face:"🐧", label:"펭이\n\"자를 쓰면 되잖아!\""}], question:"1 cm 칸을 하나씩 세는 건 번거로워요. **자**는 1 cm가 여러 번 그려진 도구예요. 어떻게 쓰면 될까요?", img:"assets/photo/math/leaf_ruler.jpg"}, suggested_extras:["q_l5_why","t_l5_zero","b_l5_ruler"], tnote:{ask:["자를 써 본 적 있나요?","자에는 무엇이 그려져 있나요?"], watch:"자를 '선 긋는 도구'로만 아는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"자의 숫자는 무엇일까요", content:"자의 숫자는 **1 cm가 몇 번**인지를 나타내요.\n숫자 **0**은 길이의 **시작점**이에요!", note:"👉 자는 우리가 만든 1 cm 띠를 아주 여러 번 이어 붙여 둔 것이에요."}, suggested_extras:["t_l5_zero","e_l5_look"], tnote:{ask:["자의 0은 무엇을 뜻할까요?","숫자 5가 있는 자리는 1 cm가 몇 번 간 곳일까요?"], watch:"0을 '아무것도 없음'으로만 알고 시작점으로 못 보는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"물체 끝을 0에 맞춰요", content:"색연필 한쪽 끝을 눈금 **0**에 맞추고, 다른 쪽 끝의 눈금을 읽어요.\n**8 cm**예요!", note:"👉 물체는 자와 **나란히·똑바로** 놓아야 해요. 비스듬하면 값이 달라져요."}, suggested_extras:["x_l5_slant","e_l5_look"], tnote:{ask:["끝을 0에 맞췄나요?","자와 나란한가요?"], watch:"자의 왼쪽 모서리(0이 아닌 곳)에 물체를 대는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"0에 없으면 칸을 세요", content:"종이띠가 0에 없을 때는 **마지막 숫자를 그대로 읽으면 안 돼요**.\n**1 cm 칸이 몇 번**인지 세요. **2부터 9까지 7 cm**!", items:[{emoji:"0️⃣", count:1, label:"**시작점**\n0 맞춤"},{emoji:"👀", count:1, label:"**끝 눈금**\n읽기"},{emoji:"🔢", count:1, label:"**0에 없으면**\n1 cm 칸 세기"},{emoji:"📐", count:1, label:"**나란히**\n자와 똑바로"}], note:"👉 2에서 9까지는 칸이 **7개**예요. 숫자 9를 그대로 읽으면 틀려요."}, suggested_extras:["x_l5_last","t_l5_count"], tnote:{ask:["2부터 9까지 칸이 몇 개인가요?","왜 9가 아닐까요?"], watch:"끝 숫자만 읽는 최다 오류 — 칸을 손가락으로 짚어 세게 할 것", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"물체가 0에 없어도 **끝 숫자를 그대로** 읽으면 된다고 생각한다.", right:"0에서 시작하지 않았으면 **1 cm 칸이 몇 번**인지 세어야 해요. 2에서 9까지면 7 cm예요.", hint:"칸을 손가락으로 하나씩 짚으며 함께 세어 보이면 바로 무너지는 오해입니다."}, suggested_extras:["x_l5_last"], tnote:{ask:["끝 숫자는 9인데 왜 7 cm일까요?","칸을 함께 세어 볼까요?"], watch:"칸이 아니라 숫자를 세는 습관", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"0에 맞춘 색연필", scenario:{icon:"✏️", body:"색연필의 한쪽 끝을 자의 0에 맞추었더니 다른 쪽 끝이 8에 놓였어요."}, question:"색연필의 길이는 몇 cm일까요?", input:"count_input", answer:"8 cm", note:"풀이: 0에서 시작했으니 **끝 눈금 그대로 8 cm**."}, suggested_extras:["e_l5_look"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"0에 없는 종이띠", scenario:{icon:"📏", body:"종이띠가 자의 2에서 시작해서 9에서 끝났어요."}, question:"종이띠의 길이는 몇 cm일까요?", input:"count_input", answer:"7 cm", note:"풀이: 0에서 시작하지 않았으니 **칸을 세요**. 2부터 9까지 칸이 7개 → **7 cm**."}, suggested_extras:["x_l5_last","t_l5_count"]},
      {id:"s10", stage:"기본문제", block:"multi", data:{title:"자로 바르게 잰 것을 모두 골라요", expectedCount:2, options:[{label:"물체 끝을 0에 맞췄어요", correct:true},{label:"0에 없는데 마지막 숫자만 읽었어요"},{label:"0에 없어서 1 cm 칸을 세었어요", correct:true},{label:"물체를 자와 비스듬히 놓았어요"}], note:"풀이: **0 맞춤**과 **칸 세기**가 바른 방법. 끝 숫자만 읽기·비스듬히 놓기는 틀려요."}, suggested_extras:["x_l5_slant"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"자로 재어 말해 봐요", levels:{"기본":{q:"물체 끝을 0에 맞추었더니 다른 쪽 끝이 6에 있어요. 길이는 몇 cm일까요?", a:"6 cm", steps:["0에서 시작","끝 눈금 그대로 읽기 → 6 cm"]},"도전":{q:"크레파스가 자의 3에서 시작해 8에서 끝났어요. 길이는 몇 cm일까요?", a:"5 cm", steps:["0에서 시작하지 않음","3부터 8까지 칸 세기 → 5칸","5 cm"]},"심화":{q:"짝의 물건을 하나 골라 자로 재고, **어떻게 쟀는지** 순서대로 말해 봐요.", a:"여러 답 (0에 맞춤 → 나란히 → 끝 눈금 읽기)", open:true}}}, suggested_extras:["t_l5_count","e_l5_steps"], tnote:{ask:["0에서 시작했나요, 아닌가요?","칸을 셀 때 어디서 어디까지인가요?"], watch:"3에서 8을 '8칸'으로 세는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"짝과 자로 재기", type:"pair", goal:"물건을 자로 재고 잰 방법까지 서로 말해 주기", steps:["짝과 잴 물건 세 가지를 고른다","한 사람이 재고 다른 사람이 0 맞춤을 확인한다","0에 없게 놓고도 재어 칸을 세어 본다","'○○은 몇 cm'와 '어떻게 쟀는지'를 함께 말한다"], materials:["15 cm 자","연필·지우개·풀 등"], minutes:7}, suggested_extras:["e_l5_steps","t_l5_zero"], tnote:{ask:["0에 맞췄는지 짝이 확인했나요?","일부러 0에 없게 놓으면 몇 cm인가요?"], watch:"자를 움직이며 재느라 값이 흔들리는 짝 — 자를 고정하고 물체를 옮기게", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"자를 쓰는 사람들", scenario:{icon:"🪚", body:"목수·재단사·의사 모두 자로 재고 나서 일을 시작해요."}, content:"나무를 자르기 전에, 천을 마르기 전에 먼저 잽니다. **재고 나서 자르기** — 한 번 자르면 되돌릴 수 없으니까요."}, suggested_extras:["r_l5_carpenter","r_l5_tailor"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"자가 부러졌어요", context:"곰이의 자가 앞부분이 부러져 0이 없어졌어요.", challenge:"이 자로도 길이를 잴 수 있을까요? 어떻게 하면 될지 말해 봐요.", note:"예: 0이 없어도 **1 cm 칸을 세면** 잴 수 있어요. 3에서 시작해 8에서 끝나면 5 cm."}, suggested_extras:["x_l5_last","q_l5_broken"], tnote:{ask:["0이 없으면 못 재는 걸까요?","무엇을 세면 될까요?"], watch:"'못 잰다'로 끝내는 경우 — 칸 세기가 답임을 스스로 찾게 할 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"자의 숫자 0은 무엇을 뜻하나요?", a:"길이의 시작점"},{q:"0에 맞춘 색연필의 끝이 8에 있으면?", a:"8 cm"},{q:"2에서 시작해 9에서 끝난 종이띠는?", a:"7 cm"}], self:["자로 길이를 잴 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["자의 숫자는 **1 cm가 몇 번**인지를 나타내고, **0은 시작점**이다.","물체 끝을 **0에 맞추고** 다른 쪽 끝 눈금을 읽는다.","0에 없으면 **1 cm 칸이 몇 번**인지 센다 (2~9 → 7 cm).","물체는 자와 **나란히·똑바로** 놓는다."], arrows:["0 맞춤","나란히","끝 눈금 읽기","0에 없으면 칸 세기"]}, suggested_extras:["r_l5_carpenter"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 자의 0이 무엇인지 알게 되었나요?","🔧 과정·기능 — 0에 없을 때도 칸을 세어 잴 수 있나요?","💛 가치·태도 — 재고 나서 하는 일의 좋은 점을 느꼈나요?"], prompts:["자로 재어 본 것 중 가장 뜻밖이었던 길이는?"]}, suggested_extras:["e_l5_steps"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"끝이 눈금에 **딱 맞지 않으면** 어떻게 말할까요? **약 몇 cm**를 배워요!", emoji:"🐞"}, suggested_extras:["c_l5_prep"]}
    ],
    extras: [
      {id:"v_l5_ruler", type:"video", icon:"🎥", title:"자로 재는 방법", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EC%9E%90%EB%A1%9C+%EA%B8%B8%EC%9D%B4+%EC%9E%AC%EA%B8%B0+0%EB%88%88%EA%B8%88", description:"0 맞춤과 눈금 읽기를 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l5_recall", type:"fun_question", icon:"💡", title:"띠에서 자로", content:"1 cm 띠를 아주 길게 이어 붙이면 무엇이 될까요? 자와 무엇이 닮았나요?", fit_slides:["review","concept"]},
      {id:"q_l5_why", type:"fun_question", icon:"💡", title:"자가 편한 까닭", content:"칸을 하나씩 세는 것과 자를 쓰는 것, 무엇이 다를까요? 자는 무엇을 대신해 주나요?", fit_slides:["motivate","concept"]},
      {id:"q_l5_broken", type:"fun_question", icon:"💡", title:"부러진 자", content:"앞이 부러져 0이 없는 자로도 잴 수 있을까요? 무엇을 세면 될까요?", fit_slides:["advanced_problem","misconception"]},
      {id:"q_l5_order", type:"fun_question", icon:"💡", title:"재는 차례 말하기", content:"자로 재는 차례를 세 걸음으로 말해 볼까요? 어느 걸음이 가장 자주 빠질까요?", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l5_zero", type:"tip", icon:"🧩", title:"0과 자 끝은 다르다", content:"많은 자에서 0은 끝에서 조금 안쪽에 있습니다. 자의 모서리에 물체를 대는 아이가 반드시 나옵니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l5_count", type:"tip", icon:"🧩", title:"칸을 짚으며 세기", content:"손가락으로 칸을 하나씩 짚으며 소리 내어 세게 하세요. 숫자 세기와 칸 세기의 차이가 그때 드러납니다.", fit_slides:["concept","misconception","leveled_problem"]},
      {id:"t_l5_fix", type:"tip", icon:"🧩", title:"자를 고정하기", content:"자를 움직이며 재면 값이 흔들립니다. 자는 책상에 붙여 두고 물체를 옮기게 하세요.", fit_slides:["offline_activity"]},
      {id:"t_l5_onpurpose", type:"tip", icon:"🧩", title:"일부러 0에 없게 놓기", content:"교사가 일부러 3에서 시작해 재게 하면 칸 세기가 훨씬 단단해집니다. 다음 차시 준비도 됩니다.", fit_slides:["offline_activity","concept"]},
      {id:"t_l5_eye", type:"tip", icon:"🧩", title:"눈높이 맞추기", content:"자를 비스듬히 보면 눈금이 어긋나 보입니다. 눈을 자 위로 곧게 두라고 짚어 주세요.", fit_slides:["concept","offline_activity"]},
      {id:"r_l5_carpenter", type:"real_world", icon:"🌍", title:"재고 나서 자르기", content:"목수는 '두 번 재고 한 번 자른다'고 해요. 한 번 자르면 되돌릴 수 없으니까요.", fit_slides:["real_world","summary"]},
      {id:"r_l5_tailor", type:"real_world", icon:"🌍", title:"천을 마르기 전에", content:"옷을 만들 때도 먼저 재고 표시한 뒤 자릅니다. 재기가 앞이고 자르기가 뒤예요.", fit_slides:["real_world"]},
      {id:"r_l5_school", type:"real_world", icon:"🌍", title:"교실에도 자가 많아요", content:"칠판 아래 자, 미술 시간 자, 게시판 붙일 때 쓰는 자 — 찾아보면 교실에도 자가 여럿 있어요.", fit_slides:["real_world","motivate"]},
      {id:"g_l5_call", type:"game", icon:"🎮", title:"몇 cm 외치기", content:"교사가 자 위에 물체를 올려 들면 학생이 길이를 외칩니다. 가끔 0이 아닌 곳에서 시작해 함정을 넣어요.", fit_slides:["basic_problem","game"]},
      {id:"g_l5_hunt", type:"game", icon:"🎮", title:"몇 cm 찾아오기", content:"'7 cm짜리 물건을 찾아오세요!' 모둠이 교실을 돌며 재어 가장 가까운 것을 가져옵니다.", fit_slides:["offline_activity","game"]},
      {id:"x_l5_last", type:"misconception", icon:"⚠️", title:"끝 숫자 그대로 읽기", content:"이 차시 최다 오류입니다. 2~9를 함께 짚어 세면 7이라는 것이 눈으로 보입니다.", fit_slides:["misconception","concept","basic_problem"]},
      {id:"x_l5_slant", type:"misconception", icon:"⚠️", title:"비스듬히 놓기", content:"물체가 자와 나란하지 않으면 값이 커집니다. 나란함을 확인하는 단계를 짝 활동에 넣으세요.", fit_slides:["misconception","concept","multi"]},
      {id:"e_l5_look", type:"example", icon:"📝", title:"큰 자 모형", content:"칠판용 큰 자나 종이 자 모형을 만들어 두면 0 맞춤을 온 반이 함께 볼 수 있어요.", fit_slides:["concept","basic_problem"]},
      {id:"e_l5_steps", type:"example", icon:"📝", title:"재는 차례 카드", content:"①0에 맞추기 ②나란히 놓기 ③끝 눈금 읽기 — 세 장 카드를 책상에 붙여 두면 차례가 몸에 붙습니다.", fit_slides:["offline_activity","leveled_problem","self_assessment"]},
      {id:"b_l5_ruler", type:"book", icon:"📚", title:"도구 이야기 책", content:"자·저울 같은 재는 도구가 어떻게 생겨났는지 다룬 책이 도입 이야기로 좋습니다.", fit_slides:["motivate","real_world"]},
      {id:"c_l5_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"자와 함께 눈금 사이에서 끝나는 물건(곤충 모형·나뭇잎 등)을 준비하면 '약 몇 cm'가 자연스럽게 나옵니다.", fit_slides:["next_lesson"]},
      {id:"q_l5_between", type:"fun_question", icon:"💡", title:"눈금 사이에서 끝나면", content:"물체 끝이 7과 8 사이에 있으면 뭐라고 말해야 할까요? 다음 시간에 답을 찾아봐요.", fit_slides:["next_lesson","concept"]}
    ]
  };

  /* ══════════════════ l06 — 자로 길이를 재어 볼까요 (약 몇 cm) ══════════════════ */
  window.LESSONS["u4_l06"] = {
    meta: { grade:2, subject:"수학", unit:4, n:6, title:"자로 길이를 재어 볼까요", std:"[2수03-02]", duration_min:40,
      lesson_format:"교사주도 — 눈금 사이 길이·약 몇 cm · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_06_자로길이를재어볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"자로 길이를 재어 볼까요\n딱 맞지 않을 때는 '약'", emoji:"🐞"}, suggested_extras:["v_l6_about"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"물체 끝을 **0에 맞추고** 끝 눈금을 읽었어요. 0에 없으면 **1 cm 칸**을 세었지요.", items:[{q:"자의 0은 무엇을 뜻하나요?", a:"길이의 시작점"},{q:"0에 맞춘 색연필의 끝이 8이면?", a:"8 cm"},{q:"2에서 시작해 9에서 끝나면?", a:"7 cm"}], from:"u4_l05"}, suggested_extras:["q_l6_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장수풍뎅이는 몇 cm일까요", kids:[{face:"🐻", label:"곰이\n\"7도 아니고 8도 아니야\""},{face:"🐧", label:"펭이\n\"그럼 뭐라고 적지?\""}], question:"자의 눈금과 길이가 **딱 맞지 않아요**. 관찰 수첩에 이럴 때는 어떻게 적어야 할까요?", img:"assets/photo/math/beetle_ruler.jpg"}, suggested_extras:["q_l6_between","t_l6_real","b_l6_bug"], tnote:{ask:["딱 맞지 않은 적이 있었나요?","그때 뭐라고 말했나요?"], watch:"'그냥 8'이라고 잘라 말하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"가까운 눈금을 읽어요", content:"끝이 **7과 8 사이**인데 **7에 더 가까워요**.\n그래서 **약 7 cm**라고 말해요!", note:"👉 어느 눈금에 더 가까운지 보는 것이 먼저예요."}, suggested_extras:["t_l6_near","e_l6_mark"], tnote:{ask:["7과 8 중 어디에 더 가까운가요?","가운데쯤이면 어떻게 할까요?"], watch:"무조건 큰 쪽 숫자를 고르는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"'약'을 앞에 붙여요", content:"딱 맞지 않을 때는 숫자 앞에 **'약'**을 붙여 말해요.\n**약 7 cm** — '7 cm쯤 된다'는 뜻이에요.", note:"👉 딱 맞을 때는 '약'을 붙이지 않아요. 8에 정확히 맞으면 그냥 **8 cm**."}, suggested_extras:["x_l6_always","t_l6_word"], tnote:{ask:["딱 맞을 때도 '약'을 붙일까요?","'약'은 무슨 뜻일까요?"], watch:"모든 값에 '약'을 붙이는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"약값이 같아도 실제는 달라요", content:"두 종이띠 모두 **약 5 cm**예요. 하지만 실제 길이는 **서로 달라요**!\n0에 없을 때도 칸을 세고, 딱 맞지 않으면 가까운 쪽으로 **약 6 cm**처럼 말해요.", items:[{emoji:"↔️", count:1, label:"**눈금 사이**\n딱 안 맞을 때"},{emoji:"🎯", count:1, label:"**가까운 쪽**\n더 가까운 눈금"},{emoji:"🗣️", count:1, label:"**'약'**\n앞에 붙이기"},{emoji:"⚠️", count:1, label:"**약값 같아도**\n실제는 다를 수"}], note:"👉 '약'은 **가까운 값**이라는 뜻이지 **똑같다**는 뜻이 아니에요."}, suggested_extras:["x_l6_same","e_l6_two"], tnote:{ask:["둘 다 약 5 cm인데 왜 길이가 달라 보일까요?","'약'은 똑같다는 뜻일까요?"], watch:"약값이 같으면 실제도 같다고 여기는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"두 물건이 모두 **약 5 cm**면 실제 길이도 **똑같다**고 생각한다.", right:"'약'은 가까운 값이에요. 약값이 같아도 **실제 길이는 다를 수 있어요**.", hint:"약 5 cm인 두 띠를 나란히 놓고 시작점을 맞춰 보면 눈으로 바로 드러납니다."}, suggested_extras:["x_l6_same"], tnote:{ask:["두 띠를 맞대어 보면 어떨까요?","그런데 왜 둘 다 약 5 cm일까요?"], watch:"'약'을 '정확히'로 바꿔 이해하는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"약 몇 cm일까요 ①", scenario:{icon:"✏️", body:"색연필 끝이 7과 8 사이에 있는데 7에 더 가까워요."}, question:"색연필은 약 몇 cm일까요?", input:"count_input", answer:"약 7 cm", note:"풀이: 더 가까운 눈금이 **7**이니 **약 7 cm**."}, suggested_extras:["t_l6_near"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"약 몇 cm일까요 ②", scenario:{icon:"📏", body:"종이띠가 0에 없어요. 칸을 세니 6칸에 가깝고 딱 맞지는 않아요."}, question:"종이띠는 약 몇 cm일까요?", input:"count_input", answer:"약 6 cm", note:"풀이: 0에 없으면 **칸을 세고**, 딱 맞지 않으면 가까운 쪽으로 **약 6 cm**."}, suggested_extras:["x_l6_zero"]},
      {id:"s10", stage:"기본문제", block:"multi", data:{title:"'약 몇 cm'에 대해 맞는 말을 모두 골라요", expectedCount:2, options:[{label:"눈금 사이면 더 가까운 눈금을 읽어요", correct:true},{label:"눈금 사이면 큰 쪽 숫자를 읽어요"},{label:"약값이 같아도 실제 길이는 다를 수 있어요", correct:true},{label:"약 5 cm인 두 물건은 길이가 똑같아요"}], note:"풀이: **가까운 쪽 읽기**와 **약값≠실제 같음**이 오늘의 핵심이에요."}, suggested_extras:["x_l6_same"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"약 몇 cm로 말해 봐요", levels:{"기본":{q:"막대 끝이 4와 5 사이인데 5에 더 가까워요. 약 몇 cm일까요?", a:"약 5 cm", steps:["4와 5 사이","5에 더 가까움 → 약 5 cm"]},"도전":{q:"곰이는 '약 6 cm', 펭이는 '6 cm'라고 했어요. 끝이 눈금 6에 딱 맞았다면 누구 말이 알맞을까요?", a:"펭이", steps:["딱 맞으면 '약'을 붙이지 않는다","6 cm"]},"심화":{q:"약 5 cm인 물건을 **두 가지** 찾아 자로 재고, 실제 길이가 어떻게 다른지 말해 봐요.", a:"여러 답 (둘 다 약 5 cm이지만 실제는 다름)", open:true}}}, suggested_extras:["e_l6_two","q_l6_between"], tnote:{ask:["딱 맞았나요, 사이인가요?","둘 다 약 5 cm인데 무엇이 달랐나요?"], watch:"딱 맞는데도 '약'을 붙이는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"약 몇 cm 관찰 기록", type:"pair", goal:"눈금 사이에서 끝나는 물건을 재어 '약 몇 cm'로 적기", steps:["짝과 함께 물건 네 가지를 자로 잰다","딱 맞는 것과 사이에서 끝나는 것을 나눈다","사이에서 끝난 것은 '약 몇 cm'로 적는다","'약'을 붙인 것과 안 붙인 것을 서로 확인한다"], materials:["15 cm 자","나뭇잎·클립·지우개 등"], minutes:7}, suggested_extras:["e_l6_mark","t_l6_word"], tnote:{ask:["왜 여기에 '약'을 붙였나요?","딱 맞은 것은 몇 개였나요?"], watch:"모든 값에 '약'을 붙여 버리는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"어른들도 '약'이라고 말해요", scenario:{icon:"📰", body:"'약 열 걸음', '약 한 시간' — 어른들도 딱 떨어지지 않을 때 '약'을 씁니다."}, content:"딱 맞지 않는 것을 억지로 딱 맞다고 하지 않는 것이 더 **정직한 말하기**예요."}, suggested_extras:["r_l6_news","r_l6_science"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"수첩에 뭐라고 적을까", context:"곰이가 장수풍뎅이 길이를 관찰 수첩에 적으려 해요.", challenge:"'7 cm'와 '약 7 cm' 중 무엇으로 적어야 할까요? 그렇게 고른 까닭을 말해 봐요.", note:"예: 눈금에 딱 맞지 않았으니 **약 7 cm**. '약'을 빼면 딱 맞았다는 뜻이 되어 버려요."}, suggested_extras:["q_l6_honest"], tnote:{ask:["'약'을 빼면 무엇이 달라지나요?","다른 사람이 그 수첩을 보면 어떻게 생각할까요?"], watch:"'약'을 붙이면 틀린 답 같아 꺼리는 경우 — 정직한 표현임을 짚을 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"길이가 눈금 사이에 있을 때는?", a:"더 가까운 눈금을 읽는다"},{q:"끝이 7과 8 사이인데 7에 가까우면?", a:"약 7 cm"},{q:"약값이 같으면 실제 길이도 같을까요?", a:"아니다 (다를 수 있다)"}], self:["약 몇 cm로 말할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["눈금 사이면 **더 가까운 눈금**을 읽는다.","숫자 앞에 **'약'**을 붙여 말한다 (딱 맞으면 붙이지 않는다).","0에 없어도 칸을 세고 딱 맞지 않으면 **약 몇 cm**.","**약값이 같아도 실제 길이는 다를 수 있다**."], arrows:["눈금 사이","가까운 쪽","'약' 붙이기"]}, suggested_extras:["r_l6_science"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — '약 몇 cm'의 뜻을 알게 되었나요?","🔧 과정·기능 — 가까운 눈금을 골라 말할 수 있나요?","💛 가치·태도 — 딱 맞지 않을 때 정직하게 말하려는 마음이 들었나요?"], prompts:["오늘 잰 것 중 딱 맞은 것은 몇 개였나요?"]}, suggested_extras:["e_l6_mark"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이번엔 **자 없이** 길이를 알아맞혀 봐요. 내 손이 자가 되는 **어림**을 배워요!", emoji:"👀"}, suggested_extras:["c_l6_prep"]}
    ],
    extras: [
      {id:"v_l6_about", type:"video", icon:"🎥", title:"약 몇 cm 읽기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EC%95%BD+%EB%AA%87+cm+%EA%B8%B8%EC%9D%B4", description:"눈금 사이 길이를 읽는 방법 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l6_recall", type:"fun_question", icon:"💡", title:"딱 맞았던 적", content:"어제 잰 것 중 눈금에 딱 맞았던 것이 있었나요? 딱 맞지 않은 것은 어떻게 했나요?", fit_slides:["review","motivate"]},
      {id:"q_l6_between", type:"fun_question", icon:"💡", title:"가운데면 어떡하지", content:"끝이 두 눈금 딱 가운데에 있으면 어느 쪽을 읽어야 할까요? 우리 반의 약속을 정해 볼까요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l6_honest", type:"fun_question", icon:"💡", title:"'약'은 부끄러운 말일까", content:"'약'을 붙이면 틀린 것 같나요? 딱 맞지 않은 걸 딱 맞다고 하는 것과 어느 쪽이 더 정직할까요?", fit_slides:["advanced_problem","real_world"]},
      {id:"q_l6_small", type:"fun_question", icon:"💡", title:"더 잘게 나누면", content:"눈금을 더 잘게 나누면 '약'을 덜 쓸 수 있을까요? 자를 살펴보면 작은 칸이 보이나요?", fit_slides:["concept","next_lesson"]},
      {id:"t_l6_near", type:"tip", icon:"🧩", title:"'더 가까운 쪽' 먼저", content:"'약'이라는 말보다 '어느 쪽에 더 가까운가'를 먼저 묻게 하세요. 순서가 바뀌면 큰 수만 고릅니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l6_word", type:"tip", icon:"🧩", title:"딱 맞으면 '약' 없이", content:"'약'을 늘 붙이는 아이가 많습니다. 딱 맞는 예를 섞어 내면 구별이 살아납니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l6_real", type:"tip", icon:"🧩", title:"실물로 열기", content:"곤충 모형이나 나뭇잎처럼 눈금에 딱 맞지 않는 실물로 열면 '약'의 필요가 저절로 나옵니다.", fit_slides:["motivate","offline_activity"]},
      {id:"t_l6_pair", type:"tip", icon:"🧩", title:"약값 같은 두 물건 준비", content:"둘 다 약 5 cm이지만 실제가 다른 물건 한 쌍을 미리 준비해 두면 오개념 수업이 3분에 끝납니다.", fit_slides:["misconception","concept"]},
      {id:"t_l6_zero", type:"tip", icon:"🧩", title:"0에 없는 경우도 섞기", content:"지난 차시의 칸 세기와 오늘의 '약'을 겹쳐 내면 두 기능이 한 번에 단단해집니다.", fit_slides:["basic_problem","offline_activity"]},
      {id:"r_l6_news", type:"real_world", icon:"🌍", title:"어른들의 '약'", content:"'약 열 걸음', '약 한 시간'처럼 어른들도 딱 떨어지지 않을 때 '약'을 씁니다.", fit_slides:["real_world","summary"]},
      {id:"r_l6_science", type:"real_world", icon:"🌍", title:"연구하는 사람들의 정직", content:"자연을 살피는 사람들은 잰 값을 부풀리지 않습니다. 딱 맞지 않으면 그대로 '약'이라고 적어요.", fit_slides:["real_world","advanced_problem"]},
      {id:"r_l6_map", type:"real_world", icon:"🌍", title:"길 안내의 '약'", content:"'약 5분 거리'처럼 길 안내에도 '약'이 쓰입니다. 정확하지 않아도 쓸모 있는 값이에요.", fit_slides:["real_world"]},
      {id:"g_l6_call", type:"game", icon:"🎮", title:"약 몇 cm 외치기", content:"교사가 자 위 물체를 들면 학생이 '약 몇 cm'를 외칩니다. 딱 맞는 것을 섞어 함정을 넣어요.", fit_slides:["basic_problem","game"]},
      {id:"g_l6_pair", type:"game", icon:"🎮", title:"같은 약값 짝 찾기", content:"약 5 cm짜리 물건을 각자 찾아와 견주어 봐요. 약값은 같은데 실제가 다른 것을 확인해요.", fit_slides:["misconception","game","offline_activity"]},
      {id:"x_l6_same", type:"misconception", icon:"⚠️", title:"약값이 같으면 같다는 착각", content:"이 차시 핵심 오개념입니다. 약 5 cm인 두 띠를 시작점 맞춰 나란히 놓으면 즉시 깨집니다.", fit_slides:["misconception","concept","multi"]},
      {id:"x_l6_always", type:"misconception", icon:"⚠️", title:"'약'을 늘 붙이기", content:"딱 맞았는데도 '약'을 붙이면 뜻이 흐려집니다. 딱 맞는 예를 반드시 섞어 주세요.", fit_slides:["misconception","concept"]},
      {id:"x_l6_zero", type:"misconception", icon:"⚠️", title:"0에 없을 때 '약'만 붙이기", content:"칸 세기를 건너뛰고 '약'부터 붙이는 아이가 있습니다. 세고 나서 '약'이 순서입니다.", fit_slides:["basic_problem","misconception"]},
      {id:"e_l6_mark", type:"example", icon:"📝", title:"'약' 표시 기록표", content:"물건 / 잰 값 / '약' 붙였나 세 칸 표를 쓰면 붙인 까닭을 스스로 점검하게 됩니다.", fit_slides:["offline_activity","concept","self_assessment"]},
      {id:"e_l6_two", type:"example", icon:"📝", title:"약값 같은 한 쌍", content:"실제 길이가 조금 다른 종이띠 두 장을 만들어 두면 오개념 수업 준비가 끝납니다.", fit_slides:["misconception","leveled_problem"]},
      {id:"b_l6_bug", type:"book", icon:"📚", title:"곤충 도감", content:"도감에는 크기가 '약 몇'으로 적혀 있어요. 오늘 배운 말이 책에 그대로 쓰인 것을 보여 주세요.", fit_slides:["motivate","real_world"]},
      {id:"c_l6_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"자는 잠시 넣어 두고 시작합니다. 어림한 뒤에 꺼내 확인하는 순서로 준비해 주세요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l07 — 길이를 어림하고 어떻게 어림했는지 말해 볼까요 ══════════════════ */
  window.LESSONS["u4_l07"] = {
    meta: { grade:2, subject:"수학", unit:4, n:7, title:"길이를 어림하고 어떻게 어림했는지 말해 볼까요", std:"[2수03-02]", duration_min:40,
      lesson_format:"교사주도 — 기준 척도·어림·어림 후 확인 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/g2_math_u4_07_길이를어림하고어떻게어림했는지말해볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"길이를 어림해 볼까요\n내 손이 자가 돼요", emoji:"👀"}, suggested_extras:["v_l7_est"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"눈금 사이면 **더 가까운 눈금**을 읽고 앞에 **'약'**을 붙였어요.", items:[{q:"길이가 눈금 사이에 있을 때는?", a:"더 가까운 눈금을 읽는다"},{q:"7과 8 사이인데 7에 가까우면?", a:"약 7 cm"},{q:"약값이 같으면 실제 길이도 같나요?", a:"아니다 (다를 수 있다)"}], from:"u4_l06"}, suggested_extras:["q_l7_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"자가 없어도 길이를 알 수 있을까요", kids:[{face:"🐻", label:"곰이\n\"자를 두고 왔어\""},{face:"🐧", label:"펭이\n\"손으로 짐작해 보자!\""}], question:"숲에서 새싹을 만났는데 자가 없어요. 자가 없을 때는 마음속으로 **어림**해요. 어림한 길이도 **약 몇 cm**로 말해요!", img:"assets/photo/math/sprout_hand.jpg"}, suggested_extras:["q_l7_why","t_l7_body","b_l7_nature"], tnote:{ask:["자 없이 길이를 말해 본 적 있나요?","무엇을 보고 짐작했나요?"], watch:"'그냥 찍는 것'으로 여기는 경우 — 기준이 있다는 점을 곧 짚을 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"내 몸을 자처럼 써요", content:"**엄지손톱은 약 1 cm**, **가운뎃손가락은 약 5 cm**, **한 뼘은 약 10 cm**예요.\n이걸 **기준**으로 삼아 어림해요!", note:"👉 기준을 정해 두면 어림은 찍기가 아니라 **견주기**가 돼요."}, suggested_extras:["e_l7_card","t_l7_body"], tnote:{ask:["내 엄지손톱은 약 몇 cm인가요?","한 뼘은 약 몇 cm였지요?"], watch:"기준 없이 숫자만 말하는 경우", min:5}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"기준과 견주어 어림해요", content:"막대가 가운뎃손가락(**약 5 cm**)의 **두 배**쯤이에요.\n그래서 **약 10 cm**로 어림해요!", note:"👉 '무엇의 몇 배쯤'을 말하면 어림한 까닭이 드러나요."}, suggested_extras:["t_l7_say","q_l7_how"], tnote:{ask:["무엇과 견주었나요?","몇 배쯤이라고 보았나요?"], watch:"까닭 없이 숫자만 말하는 경우 — '무엇의 몇 배'를 꼭 말하게", min:5}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"어림한 뒤 자로 재어 봐요", content:"어림은 **약 10 cm**, 자로 재니 **10 cm**예요.\n어림과 실제를 견주어 보면 **어림이 더 정확해져요**!", items:[{emoji:"📌", count:1, label:"**기준 정하기**\n손톱·손가락·뼘"},{emoji:"⚖️", count:1, label:"**견주어 어림**\n기준의 몇 배쯤"},{emoji:"🗣️", count:1, label:"**약 몇 cm**\n어림값도 '약'"},{emoji:"📐", count:1, label:"**자로 확인**\n어림↔실제 견주기"}], note:"👉 어림이 빗나가도 괜찮아요. **견주어 보는 것**이 실력을 키워요."}, suggested_extras:["t_l7_check","e_l7_table"], tnote:{ask:["어림과 실제가 얼마나 달랐나요?","다음엔 무엇을 고쳐 보면 좋을까요?"], watch:"어림이 틀린 것을 실패로 느끼는 아이 — 견주기가 목적임을 짚을 것", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"어림한 길이는 자로 잰 것과 **언제나 똑같아야** 한다고 생각한다.", right:"어림은 **가까운 값**이에요. 자로 재면 다를 수 있고, 견주어 보면서 점점 가까워져요.", hint:"교사가 먼저 크게 빗나간 어림을 보여 주고 웃으며 고쳐 보세요. 틀림에 대한 두려움이 줄어듭니다."}, suggested_extras:["x_l7_exact"], tnote:{ask:["어림이 빗나가면 어떻게 하면 될까요?","무엇과 견주면 다음엔 더 가까워질까요?"], watch:"어림을 맞히기 놀이로만 여기는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"기준 길이", scenario:{icon:"👍", body:"곰이가 어림할 때 쓰는 몸의 기준을 떠올리고 있어요."}, question:"엄지손톱의 너비는 약 몇 cm일까요?", input:"count_input", answer:"약 1 cm", note:"풀이: 본 차시 기준 — 엄지손톱은 **약 1 cm**."}, suggested_extras:["e_l7_card"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"기준의 두 배", scenario:{icon:"📏", body:"막대가 가운뎃손가락(약 5 cm)의 두 배쯤 돼요."}, question:"막대는 약 몇 cm로 어림할까요?", input:"count_input", answer:"약 10 cm", note:"풀이: 약 5 cm의 두 배 → **약 10 cm**."}, suggested_extras:["t_l7_say"]},
      {id:"s10", stage:"기본문제", block:"match", data:{title:"몸의 기준과 길이를 이어요", type:"touch_match", pairs:[{left:{label:"엄지손톱 너비"}, right:{num:"약 1 cm"}},{left:{label:"가운뎃손가락 길이"}, right:{num:"약 5 cm"}},{left:{label:"한 뼘"}, right:{num:"약 10 cm"}}]}, suggested_extras:["e_l7_card"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"어림하고 까닭을 말해요", levels:{"기본":{q:"한 뼘은 약 몇 cm인가요?", a:"약 10 cm", steps:["몸의 기준 떠올리기","한 뼘 = 약 10 cm"]},"도전":{q:"연필이 한 뼘(약 10 cm)보다 조금 더 길어 보여요. 몇 cm로 어림하면 알맞을까요? 까닭도 말해 봐요.", a:"약 15 cm쯤 (뼘보다 조금 김)", steps:["기준: 한 뼘 = 약 10 cm","그보다 조금 더 길다","약 15 cm쯤으로 어림"]},"심화":{q:"교실 물건 두 가지를 골라 **어림하고 → 자로 재어** 어림과 실제를 견주어 말해 봐요.", a:"여러 답 (어림값·실제값·차이를 함께 말하기)", open:true}}}, suggested_extras:["q_l7_how","e_l7_table"], tnote:{ask:["무엇을 기준으로 삼았나요?","기준의 몇 배쯤인가요?"], watch:"까닭 없이 숫자만 말하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"어림하고 재어 견주기", type:"pair", goal:"물건을 먼저 어림한 뒤 자로 재어 어림값과 실제값을 견주기", steps:["자를 책상 서랍에 넣어 둔다","짝과 물건 네 가지를 골라 각자 어림해 적는다","무엇을 기준으로 삼았는지 서로 말한다","자를 꺼내 재고 어림값 옆에 실제값을 적는다"], materials:["15 cm 자","어림 기록표","연필·풀·나뭇잎 등"], minutes:8}, suggested_extras:["e_l7_table","t_l7_check"], tnote:{ask:["어림이 실제와 얼마나 가까웠나요?","기준을 바꾸면 더 가까워질까요?"], watch:"어림을 건너뛰고 먼저 재어 버리는 짝 — 자를 넣어 두는 단계를 지킬 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"어림하며 사는 사람들", scenario:{icon:"🛒", body:"장 볼 때, 짐을 실을 때, 자리를 옮길 때 — 어른들도 늘 어림합니다."}, content:"'저 문으로 들어갈까?' 하고 눈으로 어림한 뒤에야 줄자를 꺼내요. 어림은 **재기의 앞잡이**예요."}, suggested_extras:["r_l7_move","r_l7_cook"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"어림 실력 키우기", context:"펭이는 어림이 자꾸 빗나가요.", challenge:"어림을 더 잘하려면 무엇을 하면 좋을까요? 곰이가 해 줄 말을 만들어 봐요.", note:"예: 어림한 뒤 꼭 자로 재어 견주기, 내 몸의 기준을 정확히 알아 두기."}, suggested_extras:["x_l7_exact","q_l7_how"], tnote:{ask:["어림을 잘하는 사람은 무엇이 다를까요?","기준을 모르면 어떻게 될까요?"], watch:"'많이 하면 는다'로만 끝내는 경우 — 기준과 확인을 짚어 줄 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"엄지손톱 너비는 약 몇 cm?", a:"약 1 cm"},{q:"한 뼘은 약 몇 cm?", a:"약 10 cm"},{q:"어림한 뒤에 하면 좋은 일은?", a:"자로 재어 어림과 견주어 보기"}], self:["기준으로 어림할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**엄지손톱 약 1 cm · 가운뎃손가락 약 5 cm · 한 뼘 약 10 cm**를 기준으로 삼는다.","기준의 **몇 배쯤**인지 견주어 **약 몇 cm**로 어림한다.","어림한 뒤 **자로 재어 견주면** 어림이 더 정확해진다.","어림은 찍기가 아니라 **기준과 견주기**다."], arrows:["기준 정하기","견주어 어림","약 몇 cm","자로 확인"]}, suggested_extras:["r_l7_move"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 어림이 무엇인지 알게 되었나요?","🔧 과정·기능 — 기준과 견주어 어림하고 까닭을 말할 수 있나요?","💛 가치·태도 — 어림이 빗나가도 다시 해 보고 싶은가요?"], prompts:["오늘 어림이 가장 잘 맞았던 물건은 무엇인가요?"]}, suggested_extras:["e_l7_table"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"단원에서 배운 것을 **모아서 확인해요**. 본뜨기부터 어림까지 모두 나와요!", emoji:"✅"}, suggested_extras:["c_l7_prep"]}
    ],
    extras: [
      {id:"v_l7_est", type:"video", icon:"🎥", title:"길이 어림하기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+2%ED%95%99%EB%85%84+%EA%B8%B8%EC%9D%B4+%EC%96%B4%EB%A6%BC%ED%95%98%EA%B8%B0", description:"몸의 기준으로 어림하는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"]},
      {id:"q_l7_recall", type:"fun_question", icon:"💡", title:"'약'이 또 나왔어요", content:"어제 배운 '약'이 오늘도 쓰이네요. 어림한 값에 '약'을 붙이는 까닭은 무엇일까요?", fit_slides:["review","concept"]},
      {id:"q_l7_why", type:"fun_question", icon:"💡", title:"자가 없을 때", content:"자가 없는데 길이를 알아야 하는 때가 있을까요? 어떤 때인가요?", fit_slides:["motivate","real_world"]},
      {id:"q_l7_how", type:"fun_question", icon:"💡", title:"어떻게 어림했나요", content:"숫자만 말하지 말고 '무엇의 몇 배쯤'까지 말해 볼까요? 친구와 기준이 같았나요?", fit_slides:["concept","leveled_problem","advanced_problem"]},
      {id:"q_l7_grow", type:"fun_question", icon:"💡", title:"내 뼘도 자라요", content:"작년보다 내 뼘이 길어졌을까요? 뼘이 자라면 어림도 달라질까요?", fit_slides:["concept","self_assessment"]},
      {id:"t_l7_body", type:"tip", icon:"🧩", title:"기준을 먼저 재어 두기", content:"'약 1·5·10 cm'를 각자 자로 재어 확인시킨 뒤 어림에 들어가면 어림이 찍기가 되지 않습니다.", fit_slides:["concept","motivate"]},
      {id:"t_l7_say", type:"tip", icon:"🧩", title:"까닭을 말하게 하기", content:"이 차시의 목표는 맞히기가 아니라 '어떻게 어림했는지'입니다. 숫자만 말하면 되물어 주세요.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l7_check", type:"tip", icon:"🧩", title:"어림 → 확인 순서 지키기", content:"자를 먼저 꺼내면 어림이 사라집니다. 자는 서랍에 넣어 두고 어림을 적은 뒤 꺼내게 하세요.", fit_slides:["offline_activity","concept"]},
      {id:"t_l7_safe", type:"tip", icon:"🧩", title:"빗나가도 괜찮은 분위기", content:"교사가 먼저 크게 빗나간 어림을 보여 주면 아이들이 마음 놓고 어림합니다.", fit_slides:["misconception","offline_activity"]},
      {id:"t_l7_close", type:"tip", icon:"🧩", title:"'얼마나 가까웠나'로 칭찬", content:"맞았다·틀렸다 대신 '몇 cm 차이였나'로 이야기하면 어림이 자랍니다.", fit_slides:["offline_activity","self_assessment"]},
      {id:"r_l7_move", type:"real_world", icon:"🌍", title:"이삿날의 어림", content:"'저 문으로 들어갈까?'를 먼저 눈으로 어림하고 나서 줄자를 꺼냅니다. 어림이 앞잡이예요.", fit_slides:["real_world","summary"]},
      {id:"r_l7_cook", type:"real_world", icon:"🌍", title:"부엌의 어림", content:"'이만큼'이라며 손으로 가늠하는 일이 부엌에는 아주 많아요. 기준이 몸에 붙어 있는 거예요.", fit_slides:["real_world"]},
      {id:"r_l7_sport", type:"real_world", icon:"🌍", title:"운동장의 어림", content:"공을 던질 거리, 뛸 자리를 눈으로 먼저 어림합니다. 몸이 기준을 기억하고 있는 거예요.", fit_slides:["real_world","motivate"]},
      {id:"g_l7_close", type:"game", icon:"🎮", title:"어림 왕 뽑기", content:"교사가 물건을 들면 모두 어림을 적고, 자로 재어 가장 가까운 사람이 어림 왕이 됩니다.", fit_slides:["game","offline_activity"]},
      {id:"g_l7_cut", type:"game", icon:"🎮", title:"약 10 cm 자르기", content:"자 없이 종이띠를 약 10 cm로 잘라 봐요. 그다음 자로 재어 누가 가장 가까운지 봅니다.", fit_slides:["game","offline_activity"]},
      {id:"x_l7_exact", type:"misconception", icon:"⚠️", title:"어림은 맞혀야 한다는 부담", content:"어림을 시험처럼 여기면 아이가 입을 닫습니다. '얼마나 가까웠나'로 말을 바꿔 주세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l7_noref", type:"misconception", icon:"⚠️", title:"기준 없는 어림", content:"기준 없이 숫자만 말하면 찍기입니다. '무엇의 몇 배쯤'을 늘 함께 묻게 하세요.", fit_slides:["misconception","concept","leveled_problem"]},
      {id:"e_l7_card", type:"example", icon:"📝", title:"내 몸 기준 카드", content:"손톱·손가락·뼘을 각자 재어 적는 작은 카드를 만들어 필통에 넣어 두면 늘 자를 지니는 셈입니다.", fit_slides:["concept","basic_problem","match"]},
      {id:"e_l7_table", type:"example", icon:"📝", title:"어림 기록표", content:"물건 / 어림값 / 실제값 / 차이 네 칸 표. 차이 칸이 있어야 어림이 자랍니다.", fit_slides:["offline_activity","leveled_problem","self_assessment"]},
      {id:"b_l7_nature", type:"book", icon:"📚", title:"자연 관찰 기록책", content:"관찰 기록에는 크기가 늘 적혀 있어요. 오늘 배운 어림과 재기가 함께 쓰인 예를 보여 주세요.", fit_slides:["motivate","real_world"]},
      {id:"c_l7_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"단원 확인 차시입니다. 자·종이띠·어림 기록표를 그대로 두면 복습이 매끄럽습니다.", fit_slides:["next_lesson"]},
      {id:"q_l7_far", type:"fun_question", icon:"💡", title:"아주 긴 것도 어림할까", content:"교실 긴 쪽처럼 긴 곳은 무엇을 기준으로 어림하면 좋을까요? 뼘보다 큰 기준이 있을까요?", fit_slides:["leveled_problem","real_world"]}
    ]
  };

  /* ══════════════════ l08 — 수학이랑 확인해요 (단원 평가) ══════════════════ */
  window.LESSONS["u4_l08"] = {
    meta: { grade:2, subject:"수학", unit:4, n:8, title:"수학이랑 확인해요", std:"[2수03-01], [2수03-02]", duration_min:40,
      lesson_format:"단원 평가 — 본뜨기·단위·1 cm·자·약 몇 cm·어림 확인 · 40분 표준 v2(7요소, offline 제외)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"수학이랑 확인해요\n관찰 수첩을 펼쳐 봐요", emoji:"✅"}, suggested_extras:["t_l8_calm"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"몸의 기준으로 **어림**하고, 자로 재어 **견주어** 보았어요.", items:[{q:"엄지손톱 너비는 약 몇 cm?", a:"약 1 cm"},{q:"한 뼘은 약 몇 cm?", a:"약 10 cm"},{q:"어림한 뒤에 하면 좋은 일은?", a:"자로 재어 어림과 견주어 보기"}], from:"u4_l07"}, suggested_extras:["e_l8_map"]},
      {id:"s03", stage:"도입", block:"objective", data:{title:"오늘은 모아서 확인해요", content:"단원에서 배운 여섯 걸음을 **한 번에** 확인해요.\n틀린 곳은 **어느 걸음**에서 어긋났는지 함께 찾아봐요."}, suggested_extras:["e_l8_map","t_l8_diag"], tnote:{ask:["여섯 걸음을 차례로 말해 볼까요?","가장 자신 있는 걸음은 어디인가요?"], watch:"평가라는 말에 굳는 아이 — 확인하는 시간임을 먼저 말해 줄 것", min:3}},
      {id:"s04", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이의 관찰 수첩 검사", kids:[{face:"🐻", label:"곰이\n\"다 적었어!\""},{face:"🐧", label:"펭이\n\"'약'을 빠뜨린 데가 있어\""}], question:"둘이 함께 만든 관찰 수첩을 펼쳤어요. 잘 적힌 곳과 고칠 곳을 함께 찾아볼까요?", img:"assets/photo/math/notebook_check.jpg"}, suggested_extras:["e_l8_map","q_l8_own"], tnote:{ask:["수첩에서 무엇을 먼저 볼까요?","'약'이 빠지면 무엇이 달라지나요?"], watch:"틀린 곳 찾기를 놀림으로 여기는 분위기 — 고치는 즐거움으로 돌릴 것", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"단원 여섯 걸음 한눈에", content:"길이를 재는 방법이 이렇게 자랐어요.", items:[{emoji:"🧵", count:1, label:"**본뜨기**\n시작점 맞추기"},{emoji:"✋", count:1, label:"**단위로 재기**\n빈틈없이 몇 번"},{emoji:"📏", count:1, label:"**1 cm**\n누가 재도 같음"},{emoji:"📐", count:1, label:"**자로 재기**\n0 맞춤·칸 세기"},{emoji:"🐞", count:1, label:"**약 몇 cm**\n가까운 눈금"},{emoji:"👀", count:1, label:"**어림**\n기준과 견주기"}], note:"👉 뒤로 갈수록 **누가 재어도 같은 값**에 가까워졌어요."}, suggested_extras:["e_l8_map"], tnote:{ask:["앞의 걸음이 없으면 뒤 걸음을 배울 수 있었을까요?","가장 크게 달라진 순간은 언제였나요?"], watch:"걸음을 낱낱으로만 기억하는 경우", min:4}},
      {id:"s06", stage:"기본문제", block:"basic_problem", data:{title:"확인 ① 본뜨기", scenario:{icon:"🧵", body:"종이띠로 본뜬 두 나뭇잎을 견주려고 해요."}, question:"견주기 전에 꼭 맞춰야 하는 곳은 어디일까요?", input:"count_input", answer:"시작점", note:"풀이: 본뜬 것은 **한쪽 끝(시작점)**을 맞추어야 바르게 견줄 수 있어요."}, suggested_extras:["x_l8_start"]},
      {id:"s07", stage:"기본문제", block:"basic_problem", data:{title:"확인 ② 자로 재기", scenario:{icon:"📐", body:"종이띠가 자의 2에서 시작해 9에서 끝났어요."}, question:"종이띠의 길이는 몇 cm일까요?", input:"count_input", answer:"7 cm", note:"풀이: 0에서 시작하지 않았으니 **칸 세기**. 2부터 9까지 7칸 → **7 cm**."}, suggested_extras:["x_l8_last"]},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"확인 ③ 어림", scenario:{icon:"👍", body:"펭이가 몸의 기준을 떠올리고 있어요."}, question:"한 뼘은 약 몇 cm일까요?", input:"count_input", answer:"약 10 cm", note:"풀이: 몸의 기준 — 엄지손톱 약 1 cm · 가운뎃손가락 약 5 cm · 한 뼘 **약 10 cm**."}, suggested_extras:["e_l8_card"]},
      {id:"s09", stage:"기본문제", block:"multi", data:{title:"확인 ④ 바르게 말한 것을 모두 골라요", expectedCount:2, options:[{label:"1 cm는 누가 재어도 똑같은 길이예요", correct:true},{label:"잰 횟수가 많으면 길이도 더 길어요"},{label:"약값이 같아도 실제 길이는 다를 수 있어요", correct:true},{label:"0에 없어도 마지막 숫자를 그대로 읽어요"}], note:"풀이: 단원 오개념 세 가지가 모두 들어 있어요. 횟수는 단위와 함께, 끝 숫자는 칸 세기로."}, suggested_extras:["x_l8_count","x_l8_same"]},
      {id:"s10", stage:"기본문제", block:"match", data:{title:"확인 ⑤ 방법과 상황을 이어요", type:"touch_match", pairs:[{left:{label:"나뭇가지에 달린 잎 두 장 견주기"}, right:{num:"종이띠로 본뜨기"}},{left:{label:"자 없이 새싹 길이 말하기"}, right:{num:"어림하기"}},{left:{label:"끝이 눈금 사이에서 멈춤"}, right:{num:"약 몇 cm"}}]}, suggested_extras:["e_l8_map"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"확인 ⑥ 생각해서 풀어요", levels:{"기본":{q:"1 cm가 5번이면 몇 cm일까요?", a:"5 cm", steps:["1 cm가 몇 번인지 센다","5번 → 5 cm"]},"도전":{q:"크레파스가 자의 3에서 시작해 8에서 끝났고, 끝이 눈금에 딱 맞았어요. 길이는 몇 cm일까요?", a:"5 cm", steps:["0에서 시작하지 않음 → 칸 세기","3부터 8까지 5칸","딱 맞았으니 '약' 없이 5 cm"]},"심화":{q:"이 단원에서 **가장 어려웠던 걸음**을 하나 고르고, 왜 어려웠는지·어떻게 넘었는지 말해 봐요.", a:"여러 답 (걸음 이름 + 까닭 + 넘은 방법)", open:true}}}, suggested_extras:["t_l8_diag","e_l8_map"], tnote:{ask:["0에서 시작했나요, 아닌가요?","딱 맞았나요, 사이인가요?"], watch:"칸 세기와 '약' 붙이기를 한꺼번에 물으면 흔들리는 아이 — 두 물음으로 나눠 줄 것", min:6}},
      {id:"s12", stage:"응용문제", block:"misconception", data:{title:"자주 틀리는 세 곳", label:"단원 오답 지도", wrong:"① 시작점을 안 맞춤 ② 0에 없는데 끝 숫자만 읽음 ③ 약값이 같으면 실제도 같다고 봄", right:"① 한쪽 끝 맞추기 ② 1 cm 칸 세기 ③ '약'은 가까운 값일 뿐", hint:"틀린 문항이 어느 번호였는지 아이 스스로 표시하게 하면 다음에 무엇을 볼지 스스로 압니다."}, suggested_extras:["x_l8_start","x_l8_last","x_l8_same"], tnote:{ask:["나는 어느 곳에서 걸렸나요?","다음엔 무엇을 먼저 확인하면 될까요?"], watch:"틀린 곳을 감추려는 경우 — 표시가 곧 지도라는 점을 말해 줄 것", min:5}},
      {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"틀린 재기 고쳐 주기", context:"곰이의 수첩에 '종이띠가 2에서 9까지 → 9 cm'라고 적혀 있어요.", challenge:"어디가 잘못되었을까요? 곰이에게 어떻게 고쳐 주면 좋을지 말해 봐요.", note:"예: 0에서 시작하지 않았으니 칸을 세어야 해요. 2부터 9까지 7칸이니 7 cm."}, suggested_extras:["x_l8_last"], tnote:{ask:["곰이는 무엇을 세었을까요?","무엇을 세어야 할까요?"], watch:"'틀렸다'만 말하고 고치는 방법을 못 대는 경우", min:4}},
      {id:"s14", stage:"응용문제", block:"real_world", data:{title:"재기는 계속 쓰여요", scenario:{icon:"🌏", body:"미술 시간에도, 체육 시간에도, 집에서도 오늘 배운 재기가 그대로 쓰여요."}, content:"색종이 자르기, 줄넘기 길이 맞추기, 화분 자리 정하기 — 자와 어림이 함께 쓰이는 자리예요."}, suggested_extras:["r_l8_use"]},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"본뜬 것을 견줄 때 맞추는 곳은?", a:"한쪽 끝(시작점)"},{q:"0에 없을 때 길이를 아는 방법은?", a:"1 cm 칸이 몇 번인지 센다"},{q:"어림할 때 쓰는 몸의 기준 세 가지는?", a:"엄지손톱·가운뎃손가락·뼘"}], self:["단원 내용을 잘 알겠어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"단원을 정리해요", points:["맞댈 수 없으면 **본떠서**, 시작점을 맞추어 견준다.","단위로 잴 때는 **빈틈없이** 옮기며 세고, 무엇으로 쟀는지 함께 말한다.","**1 cm**는 누가 재어도 같은 약속. 자는 1 cm가 여러 번 그려진 도구.","**0 맞춤 / 칸 세기 / 약 몇 cm / 어림** — 네 가지를 골라 쓸 수 있다."], arrows:["본뜨기","단위","1 cm","자","약","어림"]}, suggested_extras:["e_l8_map"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 여섯 걸음을 말할 수 있나요?","🔧 과정·기능 — 자로 재고 어림할 수 있나요?","💛 가치·태도 — 틀린 곳을 찾아 고치는 일이 즐거웠나요?"], prompts:["가장 자신 있어진 걸음은 무엇인가요?"]}, suggested_extras:["t_l8_diag"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"배운 것을 모아 **자연 관찰 수첩**을 완성해요. 재고 어림한 것을 모두 담아 봐요!", emoji:"📔"}, suggested_extras:["c_l8_prep"]}
    ],
    extras: [
      {id:"e_l8_map", type:"example", icon:"📝", title:"단원 여섯 걸음 게시물", content:"본뜨기→단위→1 cm→자→약→어림을 한 장에 담아 붙여 두면 확인 차시 내내 아이가 스스로 짚습니다.", fit_slides:["objective","concept","summary","leveled_problem"]},
      {id:"e_l8_card", type:"example", icon:"📝", title:"내 몸 기준 카드 다시 보기", content:"7차시에 만든 카드를 꺼내 두면 어림 문항에서 기준을 잊지 않습니다.", fit_slides:["basic_problem","self_assessment"]},
      {id:"e_l8_mark", type:"example", icon:"📝", title:"오답 표시 칸", content:"문항 옆에 '어느 걸음인지' 적는 작은 칸을 두면 오답이 곧 학습 지도가 됩니다.", fit_slides:["misconception","self_assessment"]},
      {id:"q_l8_own", type:"fun_question", icon:"💡", title:"내 수첩 점검", content:"내가 적은 기록에 '약'이 빠진 곳은 없나요? 단위를 안 쓴 곳은요?", fit_slides:["motivate","misconception"]},
      {id:"q_l8_best", type:"fun_question", icon:"💡", title:"가장 쓸모 있던 방법", content:"여섯 걸음 중 앞으로 가장 자주 쓸 것 같은 방법은 무엇인가요? 왜 그런가요?", fit_slides:["summary","self_assessment"]},
      {id:"q_l8_why", type:"fun_question", icon:"💡", title:"왜 이 차례였을까", content:"본뜨기부터 어림까지, 왜 이 차례로 배웠을까요? 순서를 바꾸면 어땠을까요?", fit_slides:["concept","summary"]},
      {id:"q_l8_hard", type:"fun_question", icon:"💡", title:"어려웠던 걸음", content:"가장 어려웠던 걸음은 어디였나요? 무엇이 있으면 쉬웠을까요?", fit_slides:["leveled_problem","self_assessment"]},
      {id:"t_l8_calm", type:"tip", icon:"🧩", title:"평가가 아니라 확인", content:"'확인해요'라는 말 그대로 씁니다. 점수 이야기를 먼저 꺼내지 않는 것만으로 아이가 훨씬 잘 풀어요.", fit_slides:["cover","objective"]},
      {id:"t_l8_diag", type:"tip", icon:"🧩", title:"오답을 걸음으로 되돌리기", content:"틀린 문항을 여섯 걸음 중 어디인지로 분류하면 어느 차시를 다시 볼지 바로 보입니다.", fit_slides:["objective","misconception","leveled_problem"]},
      {id:"t_l8_split", type:"tip", icon:"🧩", title:"두 물음으로 나누기", content:"'0에서 시작했나?'와 '딱 맞았나?'를 나눠 물으면 도전 문항의 정답률이 확 올라갑니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"t_l8_pair", type:"tip", icon:"🧩", title:"짝과 맞춰 보기", content:"채점 전에 짝과 답을 맞춰 보게 하면 설명하는 과정에서 스스로 고칩니다.", fit_slides:["misconception","advanced_problem"]},
      {id:"t_l8_time", type:"tip", icon:"🧩", title:"시간 배분", content:"확인 문항 6개에 20분, 오답 나누기에 10분을 두면 고치는 시간이 남습니다.", fit_slides:["objective"]},
      {id:"x_l8_start", type:"misconception", icon:"⚠️", title:"시작점 놓침", content:"2차시 오개념이 단원 끝까지 따라옵니다. 본뜨기 문항에서 다시 확인해 주세요.", fit_slides:["basic_problem","misconception"]},
      {id:"x_l8_last", type:"misconception", icon:"⚠️", title:"끝 숫자 그대로 읽기", content:"단원 최다 오답입니다. 2~9를 함께 짚어 세는 장면을 한 번 더 만들어 주세요.", fit_slides:["basic_problem","misconception","advanced_problem"]},
      {id:"x_l8_same", type:"misconception", icon:"⚠️", title:"약값=실제라는 착각", content:"약 5 cm인 두 띠를 다시 꺼내 나란히 놓아 보이면 한 번에 정리됩니다.", fit_slides:["multi","misconception"]},
      {id:"x_l8_count", type:"misconception", icon:"⚠️", title:"횟수만 보고 견주기", content:"단위를 빼고 횟수만 견주는 오류. '무엇으로 쟀는지'를 되물어 주세요.", fit_slides:["multi","misconception"]},
      {id:"r_l8_use", type:"real_world", icon:"🌍", title:"교실 밖에서도", content:"색종이 자르기, 줄넘기 길이 맞추기, 화분 자리 정하기 — 자와 어림이 함께 쓰이는 자리예요.", fit_slides:["real_world","summary"]},
      {id:"r_l8_next", type:"real_world", icon:"🌍", title:"다음 학년에서는", content:"더 긴 길이를 재는 새 단위를 만나게 됩니다. 오늘의 1 cm가 그 바탕이에요.", fit_slides:["real_world","next_lesson"]},
      {id:"g_l8_relay", type:"game", icon:"🎮", title:"걸음 이름 대기", content:"교사가 상황을 말하면 학생이 여섯 걸음 중 알맞은 이름을 외칩니다. 복습이 빨라져요.", fit_slides:["concept","game","match"]},
      {id:"g_l8_fix", type:"game", icon:"🎮", title:"틀린 기록 고치기", content:"교사가 일부러 틀리게 적은 기록 카드를 보여 주면 모둠이 고쳐 씁니다.", fit_slides:["advanced_problem","game","misconception"]},
      {id:"b_l8_review", type:"book", icon:"📚", title:"관찰 기록 모음 보기", content:"도감이나 관찰 기록집을 함께 넘겨 보며 배운 표현이 실제로 쓰인 곳을 찾아봐요.", fit_slides:["real_world","motivate"]},
      {id:"c_l8_prep", type:"checklist", icon:"✅", title:"다음 차시 준비물", content:"수첩 종이·색연필·풀·자·그동안 본뜬 종이띠. 만들기 차시라 넉넉히 준비해 주세요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l09 — 수학이랑 만들어요 (단원 마무리 프로젝트) ══════════════════ */
  window.LESSONS["u4_l09"] = {
    meta: { grade:2, subject:"수학", unit:4, n:9, title:"수학이랑 만들어요", std:"[2수03-01], [2수03-02]", duration_min:40,
      lesson_format:"단원 마무리 프로젝트 — 자연 관찰 수첩 만들기 · 40분 표준 v2(7요소)", theme:"곰이·펭이 자연 관찰 수첩",
      live_url:"../../grade2/semester1/math/4단원_길이재기/재수정_v1/" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"수학이랑 만들어요\n나만의 자연 관찰 수첩", emoji:"📔"}, suggested_extras:["e_l9_page"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"단원 여섯 걸음을 **모아서 확인**하고, 자주 틀리는 곳도 함께 고쳤어요.", items:[{q:"본뜬 것을 견줄 때 맞추는 곳은?", a:"한쪽 끝(시작점)"},{q:"0에 없을 때 길이를 아는 방법은?", a:"1 cm 칸이 몇 번인지 센다"},{q:"어림할 때 쓰는 몸의 기준은?", a:"엄지손톱·가운뎃손가락·뼘"}], from:"u4_l08"}, suggested_extras:["e_l9_page"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"수첩을 완성하는 날", kids:[{face:"🐻", label:"곰이\n\"내 잎을 붙일래\""},{face:"🐧", label:"펭이\n\"길이도 적어야지!\""}], question:"단원 내내 재고 어림한 것들을 모아 **나만의 관찰 수첩**을 만들어요. 무엇을 담으면 좋을까요?", img:"assets/photo/math/nature_notebook.jpg"}, suggested_extras:["q_l9_what","t_l9_free","b_l9_field"], tnote:{ask:["수첩에 꼭 넣고 싶은 것은 무엇인가요?","길이를 어떻게 적을 건가요?"], watch:"꾸미기에만 마음이 가서 길이 기록을 빠뜨리는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"수첩 한 장에 담을 것", content:"한 장에 **하나**를 담아요.", items:[{emoji:"🌿", count:1, label:"**무엇**\n이름·그림·본뜬 띠"},{emoji:"👀", count:1, label:"**어림**\n약 몇 cm"},{emoji:"📐", count:1, label:"**잰 값**\n몇 cm / 약 몇 cm"},{emoji:"💬", count:1, label:"**어떻게**\n무엇을 기준으로 어림했나"}], note:"👉 **어림 → 재기 → 까닭** 차례로 적으면 한 장이 이야기가 돼요."}, suggested_extras:["e_l9_page","t_l9_order"], tnote:{ask:["어림을 먼저 적는 까닭은 무엇일까요?","재고 나서 어림을 적으면 어떻게 될까요?"], watch:"재고 나서 어림을 끼워 맞추는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"'약'을 붙일지 정해요", content:"자로 재어 눈금에 **딱 맞으면** 그냥 몇 cm, **사이에서 끝나면** 약 몇 cm.\n어림한 값에는 언제나 **'약'**을 붙여요.", note:"👉 수첩을 나중에 볼 사람이 오해하지 않도록 정직하게 적어요."}, suggested_extras:["x_l9_about","t_l9_honest"], tnote:{ask:["이건 딱 맞았나요, 사이인가요?","어림한 값에는 무엇을 붙일까요?"], watch:"모든 값에 '약'을 붙이거나 하나도 안 붙이는 두 극단", min:4}},
      {id:"s06", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"수첩은 **예쁘게 꾸미는 것**이 가장 중요하다고 생각한다.", right:"관찰 수첩은 **다시 볼 때 쓸모 있어야** 해요. 길이와 잰 방법이 빠지면 예뻐도 쓸모가 줄어요.", hint:"'한 달 뒤의 나에게 보여 준다'고 말해 주면 기록 칸을 스스로 채웁니다."}, suggested_extras:["q_l9_later"], tnote:{ask:["한 달 뒤에 이 장을 보면 무엇을 알 수 있을까요?","빠진 것은 없나요?"], watch:"그림만 크게 그리고 숫자를 안 적는 경우", min:4}},
      {id:"s07", stage:"기본문제", block:"basic_problem", data:{title:"수첩에 적어 봐요 ①", scenario:{icon:"🍃", body:"나뭇잎을 자로 재니 끝이 눈금 6에 딱 맞았어요."}, question:"수첩에는 뭐라고 적어야 할까요?", input:"count_input", answer:"6 cm", note:"풀이: 딱 맞았으니 **'약' 없이 6 cm**."}, suggested_extras:["x_l9_about"]},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"수첩에 적어 봐요 ②", scenario:{icon:"🌱", body:"새싹을 자 없이 어림했더니 가운뎃손가락(약 5 cm)만 해 보였어요."}, question:"수첩에는 뭐라고 적어야 할까요?", input:"count_input", answer:"약 5 cm", note:"풀이: 어림한 값이니 **'약'을 붙여 약 5 cm**."}, suggested_extras:["e_l9_card"]},
      {id:"s09", stage:"기본문제", block:"multi", data:{title:"수첩 한 장에 꼭 들어갈 것을 모두 골라요", expectedCount:2, options:[{label:"잰 길이 (몇 cm 또는 약 몇 cm)", correct:true},{label:"어떻게 어림했는지 까닭", correct:true},{label:"내가 좋아하는 색깔"},{label:"친구 이름"}], note:"풀이: 다시 볼 때 쓸모 있으려면 **길이**와 **방법**이 있어야 해요. 꾸미기는 그다음이에요."}, suggested_extras:["q_l9_later"]},
      {id:"s10", stage:"기본문제", block:"leveled_problem", data:{title:"수첩 한 장을 계획해요", levels:{"기본":{q:"내가 담을 것 하나를 정하고, 어림한 값을 적어 봐요.", a:"예: 나뭇잎 — 약 7 cm", steps:["담을 것 정하기","기준과 견주어 어림","약 몇 cm로 적기"]},"도전":{q:"어림한 뒤 자로 재었더니 값이 달랐어요. 수첩에는 어떻게 적으면 좋을까요?", a:"어림값과 잰 값을 함께 적는다", steps:["어림 약 몇 cm 적기","잰 값 몇 cm 적기","얼마나 달랐는지 한 줄 적기"]},"심화":{q:"수첩에 **본뜬 종이띠**를 붙일 자리를 정하고, 왜 그 자리에 붙였는지 말해 봐요.", a:"여러 답 (그림 옆·길이 옆 등, 까닭이 있으면 됨)", open:true}}}, suggested_extras:["e_l9_page","t_l9_order"], tnote:{ask:["무엇을 기준으로 어림했나요?","어림과 잰 값이 얼마나 달랐나요?"], watch:"어림 칸을 비워 두고 잰 값만 적는 경우", min:5}},
      {id:"s11", stage:"응용문제", block:"offline_activity", data:{title:"자연 관찰 수첩 만들기", type:"group", goal:"모둠이 함께 관찰 수첩 네 장을 만들어 길이와 방법까지 적기", steps:["모둠에서 담을 것 네 가지를 정한다 (잎·돌·나뭇가지·솔방울 등)","각자 하나를 맡아 먼저 어림해 적는다","자로 재거나 종이띠로 본떠 값을 적는다","'어떻게 어림했는지' 한 줄을 꼭 덧붙인다","네 장을 모아 모둠 수첩으로 묶는다"], materials:["수첩 종이","자","종이띠","풀·색연필"], minutes:12}, suggested_extras:["e_l9_page","t_l9_free"], tnote:{ask:["어림을 먼저 적었나요?","까닭 한 줄이 들어갔나요?"], watch:"꾸미기에 시간을 다 쓰고 기록을 못 채우는 모둠 — 기록 먼저 규칙을 걸 것", min:12}},
      {id:"s12", stage:"응용문제", block:"activity", data:{title:"모둠 수첩 함께 보기", type:"group", goal:"다른 모둠 수첩을 돌려 보며 잘 적은 곳 한 가지를 찾아 말하기", steps:["모둠 수첩을 책상 위에 펼쳐 둔다","옆 모둠으로 옮겨 한 장씩 살펴본다","'이 장은 이래서 좋다'를 한 가지 찾아 쪽지에 적는다","자기 자리로 돌아와 받은 쪽지를 읽는다"], materials:["쪽지","연필"], minutes:6}, suggested_extras:["q_l9_share"], tnote:{ask:["어느 장이 가장 다시 보기 좋았나요?","무엇 때문에 그랬나요?"], watch:"그림만 보고 칭찬하는 경우 — 기록이 잘된 곳도 찾게 할 것", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"진짜 관찰 수첩", scenario:{icon:"🔬", body:"자연을 살피는 사람들의 수첩에도 그림 옆에 늘 길이가 적혀 있어요."}, content:"해마다 같은 나무를 재어 적어 두면 **얼마나 자랐는지** 알 수 있어요. 기록이 쌓이면 이야기가 됩니다."}, suggested_extras:["r_l9_keep","b_l9_field"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"한 달 뒤에도 쓸모 있게", context:"한 달 뒤에 같은 새싹을 다시 만난다고 해요.", challenge:"오늘 수첩에 무엇을 적어 두어야 한 달 뒤에 **얼마나 자랐는지** 알 수 있을까요?", note:"예: 오늘 잰 값과 잰 날짜, 어떻게 쟀는지까지 적어 두어야 견줄 수 있어요."}, suggested_extras:["r_l9_keep","q_l9_later"], tnote:{ask:["값만 적으면 될까요?","무엇을 더 적어 두면 좋을까요?"], watch:"날짜와 방법을 빠뜨리는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"수첩 한 장에 꼭 들어갈 두 가지는?", a:"잰 길이와 어떻게 어림·측정했는지"},{q:"자로 재어 눈금에 딱 맞으면 어떻게 적나요?", a:"'약' 없이 몇 cm"},{q:"어림한 값에는 무엇을 붙이나요?", a:"'약'"}], self:["수첩을 쓸모 있게 적을 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"단원을 마무리해요", points:["관찰 수첩은 **다시 볼 때 쓸모 있게** 적는다.","한 장에 **무엇 · 어림 · 잰 값 · 까닭**을 담는다.","딱 맞으면 몇 cm, 사이면 약 몇 cm, 어림값에는 늘 '약'.","곰이와 펭이의 수첩이 우리 반 수첩이 되었다."], arrows:["어림","재기","적기","견주기"]}, suggested_extras:["r_l9_keep"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 길이를 적는 방법을 알게 되었나요?","🔧 과정·기능 — 어림하고 재어 수첩에 적을 수 있나요?","💛 가치·태도 — 기록을 정직하게 남기려는 마음이 들었나요?"], prompts:["내 수첩에서 가장 마음에 드는 한 장은 무엇인가요?"]}, suggested_extras:["q_l9_share"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원엔", preview:"이번엔 물건을 **기준에 따라 나누는** 법을 배워요. 5단원 **분류하기**로 가요!", emoji:"🗂️"}, suggested_extras:["c_l9_prep"]}
    ],
    extras: [
      {id:"e_l9_page", type:"example", icon:"📝", title:"수첩 한 장 양식", content:"이름·그림 / 어림 / 잰 값 / 어떻게 — 네 칸 양식을 나눠 주면 기록이 빠짐없이 채워집니다.", fit_slides:["concept","offline_activity","leveled_problem","review"]},
      {id:"e_l9_card", type:"example", icon:"📝", title:"내 몸 기준 카드 다시", content:"7차시 카드를 옆에 두면 어림 칸을 쓸 때 기준을 잊지 않습니다.", fit_slides:["basic_problem","offline_activity"]},
      {id:"e_l9_strip", type:"example", icon:"📝", title:"본뜬 띠 붙이기", content:"2차시에 본뜬 종이띠를 그림 옆에 붙이면 길이가 눈으로도 남습니다.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"q_l9_what", type:"fun_question", icon:"💡", title:"무엇을 담을까", content:"운동장과 화단에서 수첩에 담고 싶은 것을 세 가지 골라 볼까요?", fit_slides:["motivate","offline_activity"]},
      {id:"q_l9_later", type:"fun_question", icon:"💡", title:"한 달 뒤의 나에게", content:"한 달 뒤의 내가 이 장을 본다면 무엇을 알 수 있을까요? 무엇이 빠지면 아쉬울까요?", fit_slides:["misconception","advanced_problem","multi"]},
      {id:"q_l9_share", type:"fun_question", icon:"💡", title:"친구 수첩에서 배우기", content:"다른 모둠 수첩에서 따라 하고 싶은 점 한 가지를 찾아볼까요?", fit_slides:["activity","self_assessment"]},
      {id:"q_l9_unit", type:"fun_question", icon:"💡", title:"단위를 안 적으면", content:"숫자만 적고 cm를 안 쓰면 어떻게 될까요? 3차시에 겪은 일과 닮지 않았나요?", fit_slides:["concept","misconception"]},
      {id:"t_l9_order", type:"tip", icon:"🧩", title:"어림 먼저, 재기 나중", content:"순서를 바꾸면 어림이 사라집니다. '어림 칸을 채우기 전에는 자를 들지 않기'를 규칙으로 거세요.", fit_slides:["concept","offline_activity","leveled_problem"]},
      {id:"t_l9_honest", type:"tip", icon:"🧩", title:"'약'을 정직하게", content:"딱 맞은 것과 사이에서 끝난 것을 갈라 적게 하면 6차시 개념이 한 번 더 굳습니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l9_free", type:"tip", icon:"🧩", title:"기록 먼저, 꾸미기 나중", content:"꾸미기를 막을 필요는 없지만 순서를 정해 주세요. 네 칸을 채운 모둠부터 색연필을 꺼냅니다.", fit_slides:["motivate","offline_activity"]},
      {id:"t_l9_time", type:"tip", icon:"🧩", title:"시간 배분", content:"만들기 12분·돌려 보기 6분·정리 6분이면 40분 안에 전시까지 끝납니다.", fit_slides:["offline_activity","activity"]},
      {id:"t_l9_keep", type:"tip", icon:"🧩", title:"수첩을 교실에 남기기", content:"완성한 수첩을 교실 한쪽에 두고 한 달 뒤 같은 것을 다시 재게 하면 기록의 힘을 직접 겪습니다.", fit_slides:["advanced_problem","real_world"]},
      {id:"r_l9_keep", type:"real_world", icon:"🌍", title:"쌓이면 이야기가 돼요", content:"해마다 같은 나무를 재어 적어 두면 얼마나 자랐는지 알 수 있어요. 기록이 쌓이면 이야기가 됩니다.", fit_slides:["real_world","advanced_problem","summary"]},
      {id:"r_l9_museum", type:"real_world", icon:"🌍", title:"박물관의 기록표", content:"전시물 옆 팻말에도 크기가 적혀 있어요. 보는 사람이 짐작할 수 있게 해 주는 거예요.", fit_slides:["real_world"]},
      {id:"r_l9_garden", type:"real_world", icon:"🌍", title:"화단 돌보는 사람", content:"모종을 심을 자리도 재어서 정합니다. 너무 붙여 심으면 자랄 자리가 없으니까요.", fit_slides:["real_world","motivate"]},
      {id:"g_l9_show", type:"game", icon:"🎮", title:"수첩 전시회", content:"완성한 수첩을 책상에 펼쳐 두고 돌아보며 쪽지 칭찬을 붙이는 작은 전시회를 열어요.", fit_slides:["activity","game"]},
      {id:"g_l9_guess", type:"game", icon:"🎮", title:"길이만 보고 맞히기", content:"수첩에서 그림을 가리고 길이만 읽어 준 뒤 무엇인지 맞혀 봐요. 기록의 힘을 느낍니다.", fit_slides:["activity","game"]},
      {id:"x_l9_about", type:"misconception", icon:"⚠️", title:"'약' 남용·누락", content:"만들기 차시에서 두 극단이 함께 나옵니다. 딱 맞은 예를 하나 만들어 보여 주세요.", fit_slides:["concept","basic_problem","misconception"]},
      {id:"x_l9_decor", type:"misconception", icon:"⚠️", title:"꾸미기만 남은 수첩", content:"예쁘지만 다시 볼 수 없는 기록이 됩니다. '한 달 뒤의 나'를 기준으로 삼게 하세요.", fit_slides:["misconception","offline_activity"]},
      {id:"b_l9_field", type:"book", icon:"📚", title:"관찰 기록 그림책", content:"실제 관찰 수첩을 담은 책을 펼쳐 보이면 아이들 기록이 눈에 띄게 자세해집니다.", fit_slides:["motivate","real_world"]},
      {id:"c_l9_prep", type:"checklist", icon:"✅", title:"다음 단원 준비", content:"5단원 분류하기로 넘어갑니다. 나눌 거리(단추·블록·색종이 등)를 모아 두면 좋아요.", fit_slides:["next_lesson"]},
      {id:"c_l9_keep", type:"checklist", icon:"✅", title:"수첩 보관", content:"만든 수첩은 사물함이 아니라 교실 한쪽에 모아 두세요. 한 달 뒤 다시 재는 활동으로 이어집니다.", fit_slides:["summary","next_lesson"]}
    ]
  };

})();
