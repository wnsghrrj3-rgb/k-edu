/* ============================================================================
   resources/g1_math_u4.js — 케이티처 자료층 · 1학년 1학기 수학 4단원 「비교하기」
   자료 표준 v1(resources/README.md) · 황금샘플 g1_math_u1.js 꼴 복제 (2026-09-07)
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다.
   - 같은 id를 쓰면 data/g1_math_u4.js의 검색 카드를 덮어쓴다(승격).
   - 길이·무게·넓이·들이 도입 영상은 e학습터(로그인) 링크만 실측됐다 — 유튜브 공개 영상은 미확보로 정직하게 남겼다.
   ============================================================================ */

(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/4단원_비교하기/재수정_v1/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    {"id": "kd_u4_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 4단원 차시 목록", "description": "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.", "url": "/grade1/semester1/math/index.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]},
    {"id": "lk_u4_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임이 정리한 차시별 영상·과제 페이지. 이 단원 카드의 영상 대부분이 여기서 왔어요.", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99", "source": "온스쿨(교사 공개)", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u4_ebs_open", "type": "link", "icon": "🔗", "title": "EBS 온라인 개학 — 초등 수학 1-1(교사용)", "description": "EBS 온라인 개학 강좌 35~39강이 4단원 비교하기. 회원 가입 뒤 무료.", "url": "https://primary.ebs.co.kr/course/view?courseId=10205266", "source": "EBS 초등", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"}
  ];

  var R = {
    /* 1차시 — 비교하기를 시작해요 */
    u4_l01: [
      {"id": "v_l1_intro", "type": "video", "icon": "🎥", "title": "비교하기 네 가지 미리보기", "description": "길이·무게·넓이·들이 네 갈래를 한 번에 훑는 영상. 단원 예고에.", "url": "https://www.youtube.com/watch?v=JywNOZCBVMw", "video_id": "JywNOZCBVMw", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u4_l01", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1차시", "description": "단원 도입 학생용 차시.", "url": S + "g1_math_u4_01_단원도입.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 2차시 — 어느 것이 더 길까요 */
    u4_l02: [
      {"id": "v_l2_len", "type": "video", "icon": "🎥", "title": "길이를 비교해요 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%96%B4%EB%8A%90%20%EA%B2%83%EC%9D%B4%20%EB%8D%94%20%EA%B8%B8%EA%B9%8C%EC%9A%94", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "lk_u4_l02_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 어느 것이 더 길까?", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=7rHVMgnd8", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "v_u4_play", "type": "video", "icon": "🎥", "title": "비교하기 놀이 — 점토 길게 만들기", "description": "정해진 시간에 점토를 길게 만드는 비교 놀이. 놀이·만들기 차시에.", "url": "https://www.youtube.com/watch?v=VGVTxeui8Uc", "video_id": "VGVTxeui8Uc", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["game", "offline_activity"]},
      {"id": "kd_u4_l02", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2차시", "description": "길이 비교 학생용 차시.", "url": S + "g1_math_u4_02_어느것이더길까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 3차시 — 어느 것이 더 무거울까요 */
    u4_l03: [
      {"id": "v_l3_wt", "type": "video", "icon": "🎥", "title": "무게를 비교해요 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%96%B4%EB%8A%90%20%EA%B2%83%EC%9D%B4%20%EB%8D%94%20%EB%AC%B4%EA%B1%B0%EC%9A%B8%EA%B9%8C%EC%9A%94", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "lk_u4_l03_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 어느 것이 더 무거울까?", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=9NkdY40xF", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u4_l03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 3차시", "description": "무게 비교 학생용 차시.", "url": S + "g1_math_u4_03_어느것이더무거울까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 4차시 — 어느 것이 더 넓을까요 */
    u4_l04: [
      {"id": "v_l4_area", "type": "video", "icon": "🎥", "title": "넓이를 비교해요 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%96%B4%EB%8A%90%20%EA%B2%83%EC%9D%B4%20%EB%8D%94%20%EB%84%93%EC%9D%84%EA%B9%8C%EC%9A%94", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "lk_u4_l04_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 어느 것이 더 넓을까?", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=NLc7wRON3", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u4_l04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4차시", "description": "넓이 비교 학생용 차시.", "url": S + "g1_math_u4_04_어느것이더넓을까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 5차시 — 어느 것에 더 많이 담을 수 있을까요 */
    u4_l05: [
      {"id": "v_l5_vol", "type": "video", "icon": "🎥", "title": "들이를 비교해요 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%96%B4%EB%8A%90%20%EA%B2%83%EC%97%90%20%EB%8D%94%20%EB%A7%8E%EC%9D%B4%20%EB%8B%B4%EC%9D%84%20%EC%88%98%20%EC%9E%88%EC%9D%84%EA%B9%8C%EC%9A%94", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "lk_u4_l05_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 어느 것에 더 많이 담을까?", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=1irymNOxg", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u4_l05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5차시", "description": "들이 비교 학생용 차시.", "url": S + "g1_math_u4_05_어느것에더많이담을수있을까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 6차시 — 수학이랑 확인해요 */
    u4_l06: [
      {"id": "v_l6_review", "type": "video", "icon": "🎥", "title": "비교하기 — 얼마나 알고 있나요", "description": "길이·무게·넓이·들이 비교를 한 번에 되짚는 정리 영상.", "url": "https://www.youtube.com/watch?v=JywNOZCBVMw", "video_id": "JywNOZCBVMw", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "review", "summary"]},
      {"id": "kd_u4_game1", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 4단원 ①", "description": "비교하기 게임. TV에 띄우고 다 같이.", "url": "/grade1/semester1/math/4단원_비교하기/g1_math_u4_game_01.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u4_adv10", "type": "kedu", "icon": "🏠", "title": "자기주도 — 비교하기 응용", "description": "확인 뒤 더 풀 아이용 응용 차시.", "url": "/grade1/semester1/math/4단원_비교하기/g1_math_adv_10_비교하기_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["leveled_problem", "summary"]},
      {"id": "kd_u4_l06", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6차시", "description": "단원 확인 학생용 차시.", "url": S + "g1_math_u4_06_수학이랑확인해요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 7차시 — 수학이랑 만들어요 */
    u4_l07: [
      {"id": "v_l7_make", "type": "video", "icon": "🎥", "title": "비교하기 놀이 — 점토 길게 만들기", "description": "정해진 시간에 점토를 길게 만드는 비교 놀이. 놀이·만들기 차시에.", "url": "https://www.youtube.com/watch?v=VGVTxeui8Uc", "video_id": "VGVTxeui8Uc", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "offline_activity"]},
      {"id": "kd_u4_game2", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 4단원 ②", "description": "단원 마무리 게임 두 번째.", "url": "/grade1/semester1/math/4단원_비교하기/g1_math_u4_game_02.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u4_l07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 7차시", "description": "비교 작품 만들기 학생용 차시.", "url": S + "g1_math_u4_07_수학이랑만들어요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
