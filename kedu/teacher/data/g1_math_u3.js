/* ============================================================
   1학년 1학기 수학 — 3단원 「덧셈과 뺄셈」 (11차시 + 단원 도입 포함)
   양산 — LESSONS["u3_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 케이티처 단원 3 채팅
   다른 단원 .js (g1_math_u1.js·u2.js·u4~6.js) = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   2026-05-20 cycle A — 11차시 18슬 인덱스 양산 (학생 HTML 자동 추출)
   차시: 01(자연과함께해요·단원도입)·02·03·04·05·06~07(병합)·08·09~10(병합)·11·12·13
   14차시 = 안 B 유지 (별도 결정 영역, 본 차시 미양산)
============================================================ */

LESSONS["u3_l1"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 1,
    title: "자연과 함께해요 (단원 도입)",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 밭 채소 모두 세기로 모으기 동기 유발",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_01_자연과함께해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"밭에서 무엇을 보았나요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 무엇을 배워요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"1단원에서 무엇을 배웠나요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 토마토만 세어 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"오이와 참외도 따로따로 세요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"이제 모두 합쳐 세어 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"빠짐없이 세는 방법", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l2"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 2,
    title: "모으기와 가르기 (1)",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 두 수 모으기·한 수 가르기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_02_모으기와가르기1.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"고구마는 모두 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 모으기와 가르기를 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"우리 생활에서도 모으기·가르기를 해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"두 수를 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"한 수를 둘로 갈라 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"7을 다양하게 갈라 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"모으기와 가르기는 함께해요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l3"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 3,
    title: "모으기와 가르기 (2)",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 모으기·가르기 숙달과 여러 가지 가르기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_03_모으기와가르기2.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"닭은 모두 몇 마리일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 9까지 모으기·가르기 해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"연결 모형으로 닭을 나타내요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"연결 모형으로 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"달걀 8개를 두 바구니로 갈라요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"9는 여러 방법으로 가를 수 있어요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l4"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 4,
    title: "이야기를 만들어 볼까요",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 그림 상황으로 덧셈·뺄셈 이야기 만들기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_04_이야기를만들어볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"농장에 무슨 이야기가 있을까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 이야기를 만들어요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"꿀을 함께 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"나비가 더 날아와요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"벌이 날아가요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"꽃은 얼마나 더 많을까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l5"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 5,
    title: "덧셈을 알아볼까요",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 덧셈식 쓰기·읽기 도입",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_05_덧셈을알아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"벌은 모두 몇 마리일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 덧셈을 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"벌이 날아와요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"`+`와 `=`를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"나비가 모여요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"두 상황 모두 덧셈식이에요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"`+`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"`=`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l6~7"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: "6~7",
    title: "덧셈을 해 볼까요",
    std: "[2수01-02]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (6·7차시 블록) — 덧셈 계산 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_06_07_덧셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"딸기는 모두 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"딸기를 모두 모으면", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"모두 세기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"이어 세기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"십 배열판으로 묶어 세기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"방법을 골라 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판으로 6 + 2를 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"자리를 바꿔도 합이 같을까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"달걀을 두 식으로 써 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"공깃돌 놀이", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"규칙을 찾아 빈칸을 채워요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"합이 6인 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l8"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 8,
    title: "뺄셈을 알아볼까요",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 뺄셈식 쓰기·읽기 도입",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_08_뺄셈을알아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"남은 딸기는 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 뺄셈을 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"딸기를 따 가요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"`-`를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"두 모양의 차이를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"두 상황 모두 뺄셈식이에요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"`-`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l9~10"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: "9~10",
    title: "뺄셈을 해 볼까요",
    std: "[2수01-02]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (9·10차시 블록) — 뺄셈 계산 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_09_10_뺄셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"남은 오이는 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"오이 9개에서 3개를 빼면", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"모두 세기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"거꾸로 세기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"십 배열판으로 빼기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"방법을 골라 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판으로 7 - 2를 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"어떤 상황의 뺄셈일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"두 가지 뺄셈식을 써 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"의자 앉기 놀이", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"규칙을 찾아 빈칸을 채워요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"뽑기 기계로 뺄셈을 해 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l11"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 11,
    title: "0이 있는 덧셈과 뺄셈",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 0을 더하거나 빼는 계산",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_11_0이있는덧셈과뺄셈.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"콩이 몇 개씩 있을까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"0에 더하기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"0을 더하기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"0을 빼기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"모두 빼기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드로 덧셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드로 모두 빼기 식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"내가 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구가 낸 문제", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l12"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 12,
    title: "덧셈과 뺄셈을 해 볼까요",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 덧셈·뺄셈 종합 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_12_덧셈과뺄셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"오늘의 수를 골라요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"5가 되는 덧셈식", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"5에서 만드는 뺄셈식", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"6이 되는 식 모으기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"7이 되는 식 모으기", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 5인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 6인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 4인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 3인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"오늘의 수로 덧셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"오늘의 수로 뺄셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"내가 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구 식과 비교하기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u3_l13"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 13,
    title: "수학이랑 확인해요",
    std: "[2수01-02]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 단원 평가와 자기 평가",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_13_수학이랑확인해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"단원을 마무리해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 점검할 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"motivate", data:{title:"단원에서 배운 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"모으기·가르기를 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"덧셈을 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"뺄셈을 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"0의 자리와 다양한 식", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"덧셈식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"뺄셈식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"0이 있는 식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"8을 가르기", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"꽃은 모두 몇 송이일까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"개구리는 몇 마리 남았을까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"농장에서 덧셈식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"농장에서 뺄셈식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원 점수와 결과", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};
