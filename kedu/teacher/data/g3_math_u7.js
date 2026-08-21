/* ============================================================================
   3학년 1학기 수학 — 7단원 「학기 마무리」 케이티처(교사주도) 차시 데이터 (1차시)
   - 키: window.LESSONS["u7_l01"] (zero-pad). g3_math.html이 자동 로드·누적.
   - 학생 본차시 01 대응(1:1). g3 유일한 1차시 단원 — 앞 단원(8~11차시)과 규모가 다르다.
   ------------------------------------------------------------
   2026-08-21 신규 제작 (40분 표준 v2 · 7요소) — g3 수학 라인 일곱 번째 단원 = 1학기 완주
   - 19슬 · extras 24
   - 7요소: (1)review items(from u6_l11 · 직전 단원 마지막 차시 exit 계승) (2)img 폴백
     (3)서사(곰이·펭이 1학기 마무리 말판 여행) (4)offline_activity
     (5)leveled_problem(기본·도전·심화 3탭·심화 open) (6)exit_ticket(확인3+신호등3) (7)tnote 9슬
   ------------------------------------------------------------
   ⚠️ 1차시 단원이라 앞 단원과 다른 규약 세 가지 (게이트가 그대로 검사한다)
   (1) review 계보가 단원을 넘는다: u7_l01.review.from = "u6_l11".
       u1~u6은 "l01 = review 없음"이 규약이었으나, 이 차시는 단원 첫 차시이면서
       동시에 학기 마무리 차시라 되짚기가 차시의 본질이다. 그래서 예외를 둔다.
       -> 게이트를 돌릴 때 u6 데이터도 함께 로드해야 review 렌더가 성립한다.
   (2) offline_activity 유지: u6 l11 같은 마무리 차시는 offline을 뺐지만,
       이 차시는 본차시 자체가 말판 놀이라 실물 말판이 화면보다 우위다(u5 l09 놀이 차시 선례).
   (3) meta.std = "1학기 종합": 여섯 단원을 가로지르는 차시라 단일 성취기준에 속하지 않는다.
   ------------------------------------------------------------
   - 근거 고정 = 학생 본차시(grade3/semester1/math/7단원_학기마무리/) QBANK 12문항 +
     LINKS 5쌍 전수 계승. 게이트 D가 본문에서 식을 긁어 전수 검산한다
     (덧셈·뺄셈 / 나눗셈 / 곱셈 / 시간의 합 초 환산 / 소수 부등호 / 단위분수 비교 / mm↔cm).
   - 학기 마무리 단원이므로 u1~u6에서 도입된 모든 용어가 해제된다
     (분수·소수·mm·km·초·직선·반직선·직각삼각형·몫 전부 사용 가능).
     대신 미도입 갈래 = 3학년 2학기 이후 소관: 가분수·대분수·통분·약분·기약분수·약수·배수·
     백분율·자연수·넓이·부피·각도·둘레·나머지·무게·들이와 무게·분수의 덧셈.
     ⚠️ '원'과 '들이'는 단독 낱말로 걸면 안 된다 — '단원·응원'과 '아이들이'가 통째로 오탐이다.
        그래서 '들이와 무게'라는 묶음으로만 검사한다(u5의 '들이' 제외 선례 계승).
   - 2학기 예고는 next_lesson 블록의 몫이다: 원·들이와 무게·분수의 덧셈은 그 블록에서만 쓴다.
     게이트 E가 next_lesson을 걷어낸 본문으로 가드를 건다.
   - 어려운 용어 가드(학생 노출 0 · 교사 몫은 tnote): 등분할·역연산·60진법·환산·양감.
   - 틀린 값은 등호로 쓰지 않는다(u4~u6 규약 계승): 오개념 자리의 잘못된 생각은
     "단원이 끝나면 그 내용도 끝났다고 말한다"처럼 등호 없이 서술한다.
   - 소수 한 자리 정규화(u6 계승): 학생 노출 자리의 소수는 0.1~0.9 한 자리만 쓴다.
   - 케이랩 매핑 없음: 종이 말판·주사위·말 실물이 화면 교구보다 우위 (정직 원칙 계승).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ══════════════════ l01 — 말판 놀이로 1학기를 마무리해요 (학기 마무리) ══════════════════ */
  window.LESSONS["u7_l01"] = {
    meta: {"grade": 3, "subject": "수학", "unit": 7, "n": 1, "title": "말판 놀이로 1학기를 마무리해요", "std": "1학기 종합", "duration_min": 40, "lesson_format": "학기 마무리 · 40분 표준 v2 신규 제작(7요소)", "theme": "곰이·펭이 1학기 마무리 말판 여행", "live_url": "../../grade3/semester1/math/7단원_학기마무리/g3_math_u7_01_말판놀이로마무리해요.html"},
    slides: [
      {"id": "s01", "stage": "도입", "block": "cover", "data": {"title": "말판 놀이로 1학기를 마무리해요\n여섯 단원을 한 바퀴 돌아요", "emoji": "🎲"}, "suggested_extras": ["v_l1_review", "g_l1_board"]},
      {"id": "s02", "stage": "도입", "block": "objective", "data": {"title": "이 시간에 할 것", "content": "한 학기 동안 배운 **여섯 단원**을 말판 한 바퀴로 되돌아봐요.\n주사위를 굴려 도착한 칸의 **문제를 풀어요**.\n마지막에 **이어지는 단원끼리 이어 보고** 그 까닭을 말해요."}, "suggested_extras": ["t_l1_pace"], "tnote": {"ask": ["1학기에 배운 단원을 몇 개나 말할 수 있나요?", "가장 기억에 남는 단원은 무엇인가요?"], "watch": "단원 이름을 하나도 떠올리지 못하는 아이 — 교과서 차례를 함께 펴 보게 한다", "min": 2}},
      {"id": "s03", "stage": "도입", "block": "review", "data": {"title": "지난 시간 떠올리기", "from": "u6_l11", "items": [{"q": "분모가 같은 분수는 분자가 클수록 어떤 분수인가요?", "a": "큰 분수"}, {"q": "단위분수는 분모가 클수록 어떤 수인가요?", "a": "작은 수"}, {"q": "10분의 7을 소수로 나타내면 무엇인가요?", "a": "0.7"}]}, "suggested_extras": ["q_l1_last"]},
      {"id": "s04", "stage": "도입", "block": "motivate", "data": {"scene_title": "곰이와 펭이가 커다란 말판 앞에 섰어요", "kids": [{"face": "🐻", "label": "곰이\n\"한 학기가 벌써 끝났네!\""}, {"face": "🐧", "label": "펭이\n\"단원마다 따로 배운 것 같아\""}], "question": "여섯 단원은 정말 **따로따로**일까요, 아니면 **서로 이어져** 있을까요?", "img": "assets/photo/math/board_finale.jpg"}, "suggested_extras": ["q_l1_link", "q_l1_last", "r_l1_play"], "tnote": {"ask": ["단원끼리 닮은 점을 찾아본 적 있나요?", "어떤 두 단원이 닮았다고 생각하나요?"], "watch": "단원을 서로 남남으로 여기는 경우 — 오늘의 마지막 활동이 이 생각을 뒤집는 자리다", "min": 3}},
      {"id": "s05", "stage": "전개", "block": "concept", "data": {"title": "말판 놀이 규칙을 알아봐요", "content": "① 주사위를 굴려 나온 수만큼 말을 옮겨요.\n② 도착한 칸의 **문제를 풀어요**.\n③ 도착 칸까지 **한 바퀴**를 돌면 놀이가 끝나요.\n④ 마지막에 **이어지는 단원끼리 이어** 보고 그 까닭을 알아봐요.", "note": "👉 쉬어 가는 칸도 있어요. 급하게 가지 않아도 돼요."}, "suggested_extras": ["g_l1_board", "t_l1_rule"], "tnote": {"ask": ["규칙을 한 사람이 다시 말해 볼까요?", "쉬는 칸에서는 무엇을 하나요?"], "watch": "규칙보다 이기는 데 마음이 쏠린 아이 — 도착이 목표가 아니라 되짚기가 목표임을 짚는다", "min": 3}},
      {"id": "s06", "stage": "전개", "block": "concept", "data": {"title": "1·2·3단원을 되짚어요", "content": "**1단원 덧셈과 뺄셈** — 세 자리 수를 더하고 뺐어요. 759 − 413 = 346 처럼요.\n**2단원 평면도형** — 선분·직선·반직선을 가르고, 직각과 직각삼각형을 배웠어요.\n**3단원 나눗셈** — 똑같이 나누어 **몫**을 구했어요.", "note": "👉 세 단원 모두 말판 칸에 나와요."}, "suggested_extras": ["q_l1_recall", "t_l1_map"], "tnote": {"ask": ["세 자리 수 뺄셈에서 무엇을 조심했나요?", "직각삼각형은 어떤 삼각형인가요?"], "watch": "단원 이름과 내용을 짝지어 말하지 못하는 경우 — 칸을 짚으며 함께 세어 준다", "min": 4}},
      {"id": "s07", "stage": "전개", "block": "concept", "data": {"title": "4·5·6단원을 되짚어요", "content": "**4단원 곱셈** — (몇십) × (몇)과 (몇십몇) × (몇)을 계산했어요. 20 × 4 = 80 처럼요.\n**5단원 길이와 시간** — mm와 km, 그리고 초를 배웠어요.\n**6단원 분수와 소수** — 1보다 작은 수를 분수와 소수로 나타냈어요.", "note": "👉 여섯 단원이 모두 말판 위에 있어요."}, "suggested_extras": ["q_l1_recall", "r_l1_life"], "tnote": {"ask": ["(몇십몇) × (몇)은 어떻게 나누어 계산했나요?", "1 mm는 어떻게 읽나요?"], "watch": "단위 이름만 외우고 양감이 없는 아이 — 자를 꺼내 실제 길이를 짚어 보인다", "min": 4}},
      {"id": "s08", "stage": "전개", "block": "misconception", "data": {"title": "이런 생각을 조심해요", "label": "자주 하는 생각", "wrong": "여섯 단원은 **서로 남남**이라고 여긴다. 곱셈은 곱셈끼리, 나눗셈은 나눗셈끼리만 쓰는 것으로 생각해 단원이 끝나면 그 내용도 끝났다고 말한다.", "right": "단원은 **서로 이어져** 있어요. 곱셈을 알면 나눗셈의 몫이 보이고, 덧셈을 할 줄 알아야 시간의 합도 구할 수 있어요. 똑같이 나누는 활동은 분수의 시작이에요.", "hint": "\"곱셈 없이 몫을 구할 수 있을까?\" 하고 되물으면 아이가 스스로 이어 말합니다."}, "suggested_extras": ["x_l1_apart", "x_l1_done", "q_l1_link"], "tnote": {"ask": ["곱셈을 모르면 몫을 구할 수 있을까요?", "어느 두 단원이 이어진다고 생각하나요?"], "watch": "이어짐을 말로만 따라 하는 경우 — 까닭까지 말하게 한다", "min": 4}},
      {"id": "s09", "stage": "기본문제", "block": "basic_problem", "data": {"title": "1단원 칸 — 세 자리 수의 덧셈", "scenario": {"icon": "➕", "body": "말이 1단원 칸에 도착했어요."}, "question": "724 + 297은 얼마일까요?", "answer": "1021", "note": "풀이: 일의 자리 4 + 7 = 11에서 받아올림, 십의 자리 2 + 9 + 1 = 12에서 또 받아올림, 백의 자리 7 + 2 + 1 = 10이에요. 그래서 **724 + 297 = 1021**이에요."}, "suggested_extras": ["q_l1_carry", "t_l1_carry"]},
      {"id": "s10", "stage": "기본문제", "block": "basic_problem", "data": {"title": "2단원 칸 — 곧은 선의 이름", "scenario": {"icon": "📐", "body": "말이 2단원 칸에 도착했어요."}, "question": "끝이 양쪽으로 끝없이 늘어나는 곧은 선은 무엇일까요?", "answer": "직선", "note": "풀이: 양쪽 끝이 없는 곧은 선이 **직선**이에요. 두 점을 곧게 이은 선은 선분, 한쪽으로만 끝없이 늘어나는 선은 반직선이에요."}, "suggested_extras": ["g_l1_line", "q_l1_shape"]},
      {"id": "s11", "stage": "기본문제", "block": "basic_problem", "data": {"title": "3단원 칸 — 나눗셈의 몫", "scenario": {"icon": "➗", "body": "말이 3단원 칸에 도착했어요."}, "question": "12 ÷ 4의 몫은 얼마일까요?", "answer": "3", "note": "풀이: 4단 곱셈구구에서 4 × 3 = 12예요. 그래서 **12 ÷ 4 = 3**이에요."}, "suggested_extras": ["q_l1_pair", "t_l1_gugu"]},
      {"id": "s12", "stage": "기본문제", "block": "leveled_problem", "data": {"title": "말판 칸 문제를 풀어요", "levels": {"기본": {"q": "4단원 칸에 도착했어요. 72 × 3은 얼마일까요?", "a": "216", "steps": ["70 × 3 = 210", "2 × 3 = 6", "210 + 6 = 216", "216"]}, "도전": {"q": "5단원 칸에 도착했어요. 11시 30분 50초 + 4분 20초는 몇 시 몇 분 몇 초일까요?", "a": "11시 35분 10초", "steps": ["초끼리 더하면 50초 + 20초 = 70초", "70초는 1분 10초이므로 1분을 받아올림한다", "분끼리 더하면 30분 + 4분 + 1분 = 35분", "11시 30분 50초 + 4분 20초 = 11시 35분 10초"]}, "심화": {"q": "여섯 단원 중 하나를 골라 말판 칸에 넣을 문제를 하나 만들고, 짝에게 내 보세요. 어느 단원 문제인지도 함께 말해 봐요.", "a": "여러 답 (예: 3단원 칸 — 20 ÷ 5의 몫은? · 2단원 칸 — 직각이 하나인 삼각형의 이름은?)", "open": true}}}, "suggested_extras": ["e_l1_make", "g_l1_board"], "tnote": {"ask": ["70 × 3과 2 × 3으로 나누어 계산했나요?", "70초를 그대로 두면 무엇이 이상한가요?"], "watch": "초를 60에서 받아올리지 않고 70초로 그냥 두는 경우", "min": 6}},
      {"id": "s13", "stage": "응용문제", "block": "offline_activity", "data": {"title": "우리 모둠 종이 말판 놀이", "type": "group", "goal": "종이 말판을 돌며 여섯 단원 문제를 함께 풀고, 어느 단원 문제인지 말하기", "steps": ["모둠마다 종이 말판과 주사위, 말을 받는다", "칸마다 붙은 문제 카드를 뒤집어 함께 푼다", "맞히면 그 칸의 단원 이름을 소리 내어 말한다", "도착 칸까지 한 바퀴를 돌면 모둠 판에 여섯 단원 이름을 모두 적는다"], "materials": ["종이 말판", "주사위", "말", "문제 카드", "모둠 판"], "minutes": 12}, "suggested_extras": ["g_l1_board", "e_l1_make", "t_l1_group"], "tnote": {"ask": ["이 칸은 어느 단원 문제인가요?", "모둠에서 가장 어려웠던 칸은 어디였나요?"], "watch": "먼저 도착하는 데만 마음이 쏠린 모둠 — 칸마다 단원 이름을 말하게 하면 속도가 잡힌다", "min": 12}},
      {"id": "s14", "stage": "응용문제", "block": "real_world", "data": {"title": "놀이 속에도 수학이 있어요", "scenario": {"icon": "🎲", "body": "윷놀이와 보드게임에서도 칸을 세고 차례를 정해요."}, "content": "말을 옮길 때는 **수를 세고**, 남은 칸을 알아볼 때는 **빼기**를 해요. 놀이 규칙 안에 수학이 숨어 있어요."}, "suggested_extras": ["r_l1_play", "b_l1_book"]},
      {"id": "s15", "stage": "응용문제", "block": "advanced_problem", "data": {"title": "이어지는 단원을 찾아요", "context": "말판을 한 바퀴 돈 곰이가 말했어요. \"1 mm = 0.1 cm 라니! 길이랑 소수가 이어지네?\"", "challenge": "이어진다고 생각하는 단원 두 쌍을 찾아, 왜 이어지는지 짝에게 말해 봐요.", "note": "풀이: 곱셈과 나눗셈은 4 × 3 = 12에서 12 ÷ 3 = 4가 보이니 이어져요. 덧셈을 할 줄 알아야 시간의 합도 구할 수 있어요. 똑같이 나누는 활동이 곧 분수의 시작이고, 직사각형을 똑같이 나눈 한 조각이 분수예요. 길이는 **1 mm = 0.1 cm**처럼 소수로도 나타낼 수 있어요."}, "suggested_extras": ["q_l1_link", "x_l1_apart", "e_l1_map"], "tnote": {"ask": ["두 단원이 왜 이어진다고 생각했나요?", "또 이어지는 짝이 있을까요?"], "watch": "짝만 고르고 까닭을 말하지 못하는 아이 — 한 문장으로 말해 보게 한다", "min": 6}},
      {"id": "s16", "stage": "정리", "block": "exit_ticket", "data": {"title": "오늘 확인해요", "items": [{"q": "724 + 297은 얼마인가요?", "a": "1021"}, {"q": "4 × 3 = 12일 때 12 ÷ 3은 얼마인가요?", "a": "4"}, {"q": "0.9와 0.7 중 더 큰 수는 무엇인가요?", "a": "0.9"}], "self": ["잘 알겠어요", "조금 헷갈려요", "다시 배우고 싶어요"]}, "suggested_extras": []},
      {"id": "s17", "stage": "정리", "block": "summary", "data": {"title": "1학기를 마무리해요", "points": ["말판을 한 바퀴 돌며 **여섯 단원**을 모두 되짚었다.", "덧셈과 뺄셈·평면도형·나눗셈·곱셈·길이와 시간·분수와 소수를 배웠다.", "단원은 서로 **남남이 아니라 이어져** 있다.", "곰이와 펭이의 1학기 마무리 말판 여행이 끝났다."], "arrows": ["여섯 단원", "말판 한 바퀴", "이어 보기"]}, "suggested_extras": ["e_l1_map", "r_l1_life"]},
      {"id": "s18", "stage": "정리", "block": "self_assessment", "data": {"title": "1학기를 스스로 점검해요", "items": ["📚 지식·이해 — 여섯 단원에서 배운 것을 하나씩 말할 수 있나요?", "🔧 과정·기능 — 말판 칸의 문제를 스스로 풀 수 있었나요?", "💛 가치·태도 — 모둠에서 차례를 지키며 함께 놀이했나요?"], "prompts": ["1학기에 가장 재미있었던 단원은 무엇인가요? 그 까닭도 말해 봐요."]}, "suggested_extras": ["c_l1_next"]},
      {"id": "s19", "stage": "정리", "block": "next_lesson", "data": {"title": "2학기에는", "preview": "더 큰 수의 **곱셈과 나눗셈**을 만나요. **원**을 배우고, **들이와 무게**를 재요. **분수의 덧셈**도 나와요. 오늘 이은 단원들이 그때 또 이어질 거예요.", "emoji": "🚀"}, "suggested_extras": ["c_l1_next", "e_l1_map"]}
    ],
    extras: [
      {"id": "v_l1_review", "type": "video", "icon": "🎥", "title": "3학년 1학기 수학 한눈에", "url": "https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+1%ED%95%99%EA%B8%B0+%EC%88%98%ED%95%99+%EC%A0%84%EC%B2%B4+%EB%B3%B5%EC%8A%B5", "description": "1학기 마무리 말판 여행과 이어지는 짧은 영상.", "source": "유튜브 검색 (교사 사전 확인 권장)", "fit_slides": ["cover", "objective"]},
      {"id": "v_l1_game", "type": "video", "icon": "🎥", "title": "수학 말판 놀이 만들기", "url": "https://www.youtube.com/results?search_query=%EC%88%98%ED%95%99+%EB%A7%90%ED%8C%90+%EB%86%80%EC%9D%B4+%EB%B3%B4%EB%93%9C%EA%B2%8C%EC%9E%84+%EC%B4%88%EB%93%B1", "description": "1학기 마무리 말판 여행과 이어지는 짧은 영상.", "source": "유튜브 검색 (교사 사전 확인 권장)", "fit_slides": ["concept", "offline_activity"]},
      {"id": "q_l1_last", "type": "fun_question", "icon": "💡", "title": "가장 기억에 남는 단원", "content": "1학기 여섯 단원 중 가장 기억에 남는 단원은 무엇인가요? 왜 그런가요?", "fit_slides": ["review", "motivate"]},
      {"id": "q_l1_link", "type": "fun_question", "icon": "💡", "title": "이어지는 단원 찾기", "content": "곱셈과 나눗셈처럼 서로 이어지는 단원이 또 있을까요?", "fit_slides": ["motivate", "advanced_problem"]},
      {"id": "q_l1_recall", "type": "fun_question", "icon": "💡", "title": "단원 이름 말하기", "content": "1학기 여섯 단원의 이름을 차례대로 말해 볼 수 있나요?", "fit_slides": ["concept", "summary"]},
      {"id": "q_l1_carry", "type": "fun_question", "icon": "💡", "title": "받아올림은 언제", "content": "더한 값이 10이 넘으면 어떻게 하나요? 어느 자리로 올려 주나요?", "fit_slides": ["basic_problem", "concept"]},
      {"id": "q_l1_pair", "type": "fun_question", "icon": "💡", "title": "곱셈으로 몫 찾기", "content": "12 ÷ 4의 몫을 곱셈구구로 찾으려면 몇 단을 떠올려야 할까요?", "fit_slides": ["basic_problem", "leveled_problem"]},
      {"id": "q_l1_shape", "type": "fun_question", "icon": "💡", "title": "교실에서 직각 찾기", "content": "교실에서 직각을 찾아 손가락으로 짚어 볼까요? 몇 군데나 있나요?", "fit_slides": ["basic_problem", "real_world"]},
      {"id": "t_l1_pace", "type": "tip", "icon": "🧩", "title": "속도보다 되짚기", "content": "말판은 빨리 도는 것이 목표가 아닙니다. 칸마다 어느 단원인지 말하게 하면 되짚기가 살아납니다.", "fit_slides": ["objective", "concept"]},
      {"id": "t_l1_rule", "type": "tip", "icon": "🧩", "title": "규칙은 아이 입으로", "content": "교사가 네 줄을 다 읽어 주기보다 한 아이에게 다시 말하게 하면 모둠 활동이 훨씬 매끄럽습니다.", "fit_slides": ["concept", "offline_activity"]},
      {"id": "t_l1_map", "type": "tip", "icon": "🧩", "title": "칠판에 단원 지도", "content": "여섯 단원 이름을 칠판에 둥글게 적어 두면 마지막 잇기 활동에서 그대로 선을 그을 수 있습니다.", "fit_slides": ["concept", "summary"]},
      {"id": "t_l1_carry", "type": "tip", "icon": "🧩", "title": "받아올림 두 번", "content": "724 + 297은 받아올림이 두 번 일어납니다. 1학기 내내 가장 자주 틀린 자리이니 한 번 더 짚어 주세요.", "fit_slides": ["basic_problem", "misconception"]},
      {"id": "t_l1_gugu", "type": "tip", "icon": "🧩", "title": "곱셈구구표를 곁에", "content": "몫을 구할 때 곱셈구구가 흔들리는 아이가 있습니다. 표를 책상에 두게 하면 되짚기에 집중할 수 있습니다.", "fit_slides": ["basic_problem", "leveled_problem"]},
      {"id": "t_l1_group", "type": "tip", "icon": "🧩", "title": "차례를 눈에 보이게", "content": "모둠마다 차례 카드를 돌리면 주사위를 독차지하는 일이 줄어듭니다.", "fit_slides": ["offline_activity", "self_assessment"]},
      {"id": "e_l1_make", "type": "extension", "icon": "⬆", "title": "우리 반 말판 만들기", "content": "모둠마다 칸을 여섯 개씩 맡아 단원별 문제를 적고, 반 전체 말판을 이어 붙여 봐요.", "fit_slides": ["leveled_problem", "offline_activity"]},
      {"id": "e_l1_map", "type": "extension", "icon": "⬆", "title": "1학기 단원 지도 그리기", "content": "여섯 단원을 동그라미로 그리고, 이어지는 단원끼리 선으로 이어 까닭을 적어 봐요.", "fit_slides": ["advanced_problem", "next_lesson"]},
      {"id": "g_l1_board", "type": "game", "icon": "🎮", "title": "말판 한 바퀴", "content": "주사위를 굴려 말을 옮기고 도착한 칸의 문제를 푸는 모둠 놀이입니다.", "fit_slides": ["cover", "offline_activity"]},
      {"id": "g_l1_line", "type": "game", "icon": "🎮", "title": "선분·직선·반직선 몸으로", "content": "두 팔을 써서 선분·직선·반직선을 몸으로 나타내는 짧은 놀이입니다.", "fit_slides": ["basic_problem", "concept"]},
      {"id": "r_l1_play", "type": "real_world", "icon": "🌍", "title": "윷놀이 속 수학", "content": "윷놀이에서도 칸을 세고 남은 칸을 헤아려요. 놀이 규칙 안에 수학이 있어요.", "fit_slides": ["motivate", "real_world"]},
      {"id": "r_l1_life", "type": "real_world", "icon": "🌍", "title": "생활 속 여섯 단원", "content": "장을 볼 때 덧셈, 나눠 먹을 때 나눗셈, 키를 잴 때 길이가 쓰여요. 어디에서 봤는지 말해 봐요.", "fit_slides": ["concept", "summary"]},
      {"id": "b_l1_book", "type": "book", "icon": "📖", "title": "놀이로 배우는 수학 그림책", "content": "놀이와 수학이 함께 나오는 그림책을 읽고, 어떤 단원과 이어지는지 찾아봐요.", "fit_slides": ["real_world", "motivate"]},
      {"id": "x_l1_apart", "type": "misconception", "icon": "❓", "title": "단원은 서로 남남", "content": "단원이 끝나면 그 내용도 끝났다고 여기는 생각입니다. 곱셈 없이 몫을 구해 보라고 하면 스스로 이어 말합니다.", "fit_slides": ["misconception", "advanced_problem"]},
      {"id": "x_l1_done", "type": "misconception", "icon": "❓", "title": "다 배웠으니 다 안다", "content": "한 번 배웠으니 다 안다고 여기는 태도입니다. 말판 칸에서 막히는 자리가 곧 다시 볼 자리입니다.", "fit_slides": ["misconception", "self_assessment"]},
      {"id": "c_l1_next", "type": "other_activity", "icon": "📚", "title": "2학기 준비", "content": "교과서 뒤쪽 2학기 차례를 함께 펴 봅니다. 오늘 이은 단원들이 어디서 다시 나오는지 짚어 줍니다.", "fit_slides": ["next_lesson", "self_assessment"]}
    ]
  };
})();
