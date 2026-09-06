/* ============================================================================
   resources/g1_math_u3.js — 케이티처 자료층 · 1학년 1학기 수학 3단원 「덧셈과 뺄셈」
   자료 표준 v1(resources/README.md) · 황금샘플 g1_math_u1.js 꼴 복제 (2026-09-07)
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다.
   - 같은 id를 쓰면 data/g1_math_u3.js의 검색 카드를 덮어쓴다(승격).
   - 온스쿨 13차시와 케이티처 13항목(묶음 둘)이 1:1이 아니라 내용으로 맞춰 붙였다.
   ============================================================================ */

(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    {"id": "kd_u3_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 3단원 차시 목록", "description": "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.", "url": "/grade1/semester1/math/index.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]},
    {"id": "lk_u3_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임이 정리한 차시별 영상·과제 페이지. 이 단원 카드의 영상 대부분이 여기서 왔어요.", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99", "source": "온스쿨(교사 공개)", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u3_ebs_open", "type": "link", "icon": "🔗", "title": "EBS 온라인 개학 — 초등 수학 1-1(교사용)", "description": "EBS 온라인 개학 강좌 16~34강이 3단원 덧셈과 뺄셈(19강). 회원 가입 뒤 무료.", "url": "https://primary.ebs.co.kr/course/view?courseId=10205266", "source": "EBS 초등", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"}
  ];

  var R = {
    /* 1차시 — 자연과 함께해요(단원 도입) */
    u3_l01: [
      {"id": "v_l1_count", "type": "video", "icon": "🎥", "title": "덧셈과 뺄셈 — 단원 도입(놀이동산)", "description": "놀이동산 장면으로 덧셈·뺄셈이 필요한 때를 보여 주는 도입 영상.", "url": "https://www.youtube.com/watch?v=V9t1SoPSrnU", "video_id": "V9t1SoPSrnU", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u3_l01", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1차시", "description": "단원 도입 학생용 차시.", "url": S + "g1_math_u3_01_자연과함께해요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 2차시 — 모으기와 가르기 (1) */
    u3_l02: [
      {"id": "v_l2_gather", "type": "video", "icon": "🎥", "title": "모으기와 가르기 (1)", "description": "인형·물병을 가르고 모으는 영상. 모으기·가르기 첫 차시 도입.", "url": "https://www.youtube.com/watch?v=2miRGtazHKs", "video_id": "2miRGtazHKs", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_u3_gather2", "type": "video", "icon": "🎥", "title": "가르기와 모으기 — 바둑돌로", "description": "바둑돌·공깃돌로 여러 가지 방법으로 가르고 모으는 영상.", "url": "https://www.youtube.com/watch?v=jYh56qhCEr8", "video_id": "jYh56qhCEr8", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "offline_activity"]},
      {"id": "kd_u3_l02", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2차시", "description": "모으기·가르기 (1) 학생용 차시.", "url": S + "g1_math_u3_02_모으기와가르기1.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 3차시 — 모으기와 가르기 (2) */
    u3_l03: [
      {"id": "v_l3_link", "type": "video", "icon": "🎥", "title": "가르기와 모으기 — 바둑돌로 여러 방법", "description": "바둑돌·공깃돌로 여러 가지 방법으로 가르고 모으는 영상.", "url": "https://www.youtube.com/watch?v=jYh56qhCEr8", "video_id": "jYh56qhCEr8", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "offline_activity"]},
      {"id": "v_u3_gather1", "type": "video", "icon": "🎥", "title": "모으기와 가르기 (1)", "description": "인형·물병을 가르고 모으는 영상. 모으기·가르기 첫 차시 도입.", "url": "https://www.youtube.com/watch?v=2miRGtazHKs", "video_id": "2miRGtazHKs", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u3_l03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 3차시", "description": "모으기·가르기 (2) 학생용 차시.", "url": S + "g1_math_u3_03_모으기와가르기2.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 4차시 — 이야기를 만들어 볼까요 */
    u3_l04: [
      {"id": "v_l04_story", "type": "video", "icon": "🎥", "title": "그림을 보고 이야기 만들기 — 또리샘 수학교실", "description": "그네·사람·자전거 그림으로 덧셈·뺄셈 이야기를 만드는 영상.", "url": "https://www.youtube.com/watch?v=I4-Ba_zDWf8", "video_id": "I4-Ba_zDWf8", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u3_l04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4차시", "description": "이야기 만들기 학생용 차시.", "url": S + "g1_math_u3_04_이야기를만들어볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 5차시 — 덧셈을 알아볼까요 */
    u3_l05: [
      {"id": "v_l05_add", "type": "video", "icon": "🎥", "title": "더하기 나타내기 — + 와 =", "description": "기차를 기다리는 아이들 상황을 덧셈식으로 적는 영상.", "url": "https://www.youtube.com/watch?v=rVPnevVbF98", "video_id": "rVPnevVbF98", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u3_l05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5차시", "description": "덧셈 기호 학생용 차시.", "url": S + "g1_math_u3_05_덧셈을알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 6~7차시 — 덧셈을 해 볼까요(묶음) */
    u3_l06_07: [
      {"id": "v_l67_add", "type": "video", "icon": "🎥", "title": "덧셈 익히기 — 여러 가지 방법", "description": "하나씩 더하기·그림 그려 풀기 등 여러 덧셈 방법.", "url": "https://www.youtube.com/watch?v=8ndk-i4AC0A", "video_id": "8ndk-i4AC0A", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_u3_add_game", "type": "video", "icon": "🎥", "title": "덧셈 놀이", "description": "주사위를 던지며 덧셈 미션을 하는 놀이 영상. 놀이 안내에.", "url": "https://www.youtube.com/watch?v=cvZbQmdIdBM", "video_id": "cvZbQmdIdBM", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["game", "offline_activity"]},
      {"id": "lk_u3_l06_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 덧셈 알기", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=fIusjmFQK", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u3_l06_07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6~7차시", "description": "덧셈 하기 학생용 차시(묶음).", "url": S + "g1_math_u3_06_07_덧셈을해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 8차시 — 뺄셈을 알아볼까요 */
    u3_l08: [
      {"id": "v_l08_sub", "type": "video", "icon": "🎥", "title": "뺄셈 나타내기 — − 기호", "description": "여러 뺄셈 문제를 식으로 나타내 푸는 영상.", "url": "https://www.youtube.com/watch?v=9Hc1CnbUgIs", "video_id": "9Hc1CnbUgIs", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "lk_u3_l08_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 빼기 나타내기", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls11.edunet.net/play/view.do?e=C4dTYiIGQ", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u3_l08", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 8차시", "description": "뺄셈 기호 학생용 차시.", "url": S + "g1_math_u3_08_뺄셈을알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 9~10차시 — 뺄셈을 해 볼까요(묶음) */
    u3_l09_10: [
      {"id": "v_l910_sub", "type": "video", "icon": "🎥", "title": "뺄셈 — 그림 그리기·식 만들기", "description": "그림 그리기 전략과 식 만들기 전략으로 뺄셈을 하는 영상.", "url": "https://www.youtube.com/watch?v=bSses3v3QsE", "video_id": "bSses3v3QsE", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_u3_sub_write", "type": "video", "icon": "🎥", "title": "뺄셈 나타내기", "description": "여러 뺄셈 문제를 식으로 나타내 푸는 영상.", "url": "https://www.youtube.com/watch?v=9Hc1CnbUgIs", "video_id": "9Hc1CnbUgIs", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["basic_problem", "review"]},
      {"id": "kd_u3_l09_10", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 9~10차시", "description": "뺄셈 하기 학생용 차시(묶음).", "url": S + "g1_math_u3_09_10_뺄셈을해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 11차시 — 0이 있는 덧셈과 뺄셈 */
    u3_l11: [
      {"id": "v_l11_zero", "type": "video", "icon": "🎥", "title": "0을 더하거나 빼면?", "description": "아무도 안 탄 열차 장면으로 0이 있는 덧셈·뺄셈을 보는 영상.", "url": "https://www.youtube.com/watch?v=bEgzpp_rvWA", "video_id": "bEgzpp_rvWA", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u3_l11", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 11차시", "description": "0이 있는 계산 학생용 차시.", "url": S + "g1_math_u3_11_0이있는덧셈과뺄셈.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 12차시 — 덧셈과 뺄셈을 해 볼까요 */
    u3_l12: [
      {"id": "v_l12_mix", "type": "video", "icon": "🎥", "title": "덧셈과 뺄셈하기 — 정리", "description": "온스쿨이 13차시 「덧셈과 뺄셈하기」에 건 영상. 모으기·가르기로 덧셈·뺄셈을 되짚어요.", "url": "https://www.youtube.com/watch?v=2miRGtazHKs", "video_id": "2miRGtazHKs", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "review"], "note": "온스쿨 13/13차시 링크가 잘려 있어 2차시 영상과 같은 ID로 실측됨"},
      {"id": "v_u3_add_game", "type": "video", "icon": "🎥", "title": "덧셈 놀이", "description": "주사위를 던지며 덧셈 미션을 하는 놀이 영상. 놀이 안내에.", "url": "https://www.youtube.com/watch?v=cvZbQmdIdBM", "video_id": "cvZbQmdIdBM", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["game", "offline_activity"]},
      {"id": "kd_u3_l12", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 12차시", "description": "덧셈·뺄셈 종합 학생용 차시.", "url": S + "g1_math_u3_12_덧셈과뺄셈을해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 13차시 — 수학이랑 확인해요 */
    u3_l13: [
      {"id": "v_l13_review", "type": "video", "icon": "🎥", "title": "3단원 복습 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%8D%A7%EC%85%88%EA%B3%BC%20%EB%BA%84%EC%85%88%20%EC%A0%95%EB%A6%AC", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "review"]},
      {"id": "v_u3_intro", "type": "video", "icon": "🎥", "title": "덧셈과 뺄셈 — 단원 도입", "description": "놀이동산 장면으로 덧셈·뺄셈이 필요한 때를 보여 주는 도입 영상.", "url": "https://www.youtube.com/watch?v=V9t1SoPSrnU", "video_id": "V9t1SoPSrnU", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u3_game1", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 3단원 ①", "description": "덧셈·뺄셈 게임. TV에 띄우고 다 같이.", "url": "/grade1/semester1/math/3단원_덧셈과뺄셈/g1_math_u3_game_01.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u3_adv7", "type": "kedu", "icon": "🏠", "title": "자기주도 — 덧셈뺄셈 응용", "description": "확인 뒤 더 풀 아이용 응용 차시.", "url": "/grade1/semester1/math/3단원_덧셈과뺄셈/g1_math_adv_07_덧셈뺄셈_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["leveled_problem", "summary"]},
      {"id": "kd_u3_l13", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 13차시", "description": "단원 확인 학생용 차시.", "url": S + "g1_math_u3_13_수학이랑확인해요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
