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
     · u2_l01 = 단원 도입 (18슬, 본 차시 자리 — 안 B 5슬 X)
     · u2_l02~07 = 본 차시 5단계 18슬
     · 새 메카닉 「모양 찾기 놀이(메모리 카드)」 = u2_l05 자리
   향후 사이클:
     · cycle B — CURRICULUM 7 차시 갱신 + ready: true 자리
     · cycle C — 슬라이드 풍부화 (data 시각 자료 props + extras 양산)
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
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ①",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것 ②",desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s04", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 분류 1"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 분류 2"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 분류 3"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"",desc:"2단계 · 전개 · 분류 종합"}, suggested_extras:[]},
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
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
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시",desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};
