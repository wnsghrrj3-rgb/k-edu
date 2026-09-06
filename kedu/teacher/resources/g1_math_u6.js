/* ============================================================================
   resources/g1_math_u6.js — 케이티처 자료층 · 1학년 1학기 수학 6단원 「수학이랑 함께해요」
   자료 표준 v1(resources/README.md) · 황금샘플 g1_math_u1.js 꼴 복제 (2026-09-07)
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다.
   - 같은 id를 쓰면 data/g1_math_u6.js의 검색 카드를 덮어쓴다(승격).
   - 프로젝트 단원이라 학생 본차시가 없다(교사 안내형). 케이에듀 연결은 단원 목록·응용·게임으로 대신했다.
   ============================================================================ */

(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    {"id": "kd_u6_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 6단원 차시 목록", "description": "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.", "url": S + "index.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]},
    {"id": "lk_u6_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임이 정리한 차시별 영상·과제 페이지. 이 단원 카드의 영상 대부분이 여기서 왔어요.", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99", "source": "온스쿨(교사 공개)", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u6_ebs_open", "type": "link", "icon": "🔗", "title": "EBS 온라인 개학 — 초등 수학 1-1(교사용)", "description": "EBS 온라인 개학 강좌 1-1 전체. 학기 마무리 되짚기용. 회원 가입 뒤 무료.", "url": "https://primary.ebs.co.kr/course/view?courseId=10205266", "source": "EBS 초등", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"}
  ];

  var R = {
    /* 1차시 — 수학 보물찾기 */
    u6_l01: [
      {"id": "v_treasure_intro", "type": "video", "icon": "🎥", "title": "주변에서 수학 찾기 — 숨은 숫자 찾기", "description": "주변 물건 속에 숨은 숫자를 찾는 영상. 수학 보물찾기 도입에.", "url": "https://www.youtube.com/watch?v=hpvZAT0ret8", "video_id": "hpvZAT0ret8", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u6_games", "type": "video", "icon": "🎥", "title": "수학 놀이 모음", "description": "배운 것으로 하는 수학 놀이 모음. 표현하기·전시회 아이디어에.", "url": "https://www.youtube.com/watch?v=SqxtKFd91ro", "video_id": "SqxtKFd91ro", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["motivate", "offline_activity"]},
      {"id": "kd_u6_adv1", "type": "kedu", "icon": "🏠", "title": "자기주도 — 1학기 응용 묶음(1단원 응용부터)", "description": "보물찾기에서 찾은 수·모양을 더 풀어 볼 아이용.", "url": S + "1단원_9까지의수/g1_math_adv_01_9까지의수_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary"]}
    ],

    /* 2차시 — 여러 방법으로 표현하기 */
    u6_l02: [
      {"id": "v_express_intro", "type": "video", "icon": "🎥", "title": "수학을 몸·그림으로 표현하기 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%ED%91%9C%ED%98%84%ED%95%98%EA%B8%B0%20%ED%83%80%EB%B8%94%EB%A1%9C", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u6_games", "type": "video", "icon": "🎥", "title": "수학 놀이 모음", "description": "배운 것으로 하는 수학 놀이 모음. 표현하기·전시회 아이디어에.", "url": "https://www.youtube.com/watch?v=SqxtKFd91ro", "video_id": "SqxtKFd91ro", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["motivate", "game"]},
      {"id": "kd_u6_game", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 5단원 ① (표현 놀이 자리)", "description": "전시 준비 사이에 다 같이 하는 게임.", "url": S + "5단원_50까지의수/g1_math_u5_game_01.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game"]}
    ],

    /* 3차시 — 수학 전시회 */
    u6_l03: [
      {"id": "v_exhibit_intro", "type": "video", "icon": "🎥", "title": "어린이 전시회 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=%EC%96%B4%EB%A6%B0%EC%9D%B4%20%EC%9E%91%ED%92%88%20%EC%A0%84%EC%8B%9C%ED%9A%8C%201%ED%95%99%EB%85%84", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u6_hidden", "type": "video", "icon": "🎥", "title": "숨은 숫자 찾기", "description": "주변 물건 속에 숨은 숫자를 찾는 영상. 수학 보물찾기 도입에.", "url": "https://www.youtube.com/watch?v=hpvZAT0ret8", "video_id": "hpvZAT0ret8", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u6_adv15", "type": "kedu", "icon": "🏠", "title": "자기주도 — 50까지의 수 응용", "description": "전시회 뒤 더 풀 아이용.", "url": S + "5단원_50까지의수/g1_math_adv_13_50까지의수_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary"]}
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
