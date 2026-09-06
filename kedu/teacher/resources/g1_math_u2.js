/* ============================================================================
   resources/g1_math_u2.js — 케이티처 자료층 · 1학년 1학기 수학 2단원 「여러 가지 모양」
   자료 표준 v1(resources/README.md) · 황금샘플 g1_math_u1.js 꼴 복제 (2026-09-07)
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다.
   - 같은 id를 쓰면 data/g1_math_u2.js의 검색 카드를 덮어쓴다(승격).
   - 온스쿨은 이 단원을 6차시로 적어 케이티처 7차시와 번호가 어긋난다 — 내용으로 맞춰 붙였다.
   ============================================================================ */

(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/2단원_여러가지모양/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    {"id": "kd_u2_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 2단원 차시 목록", "description": "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.", "url": "/grade1/semester1/math/index.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]},
    {"id": "lk_u2_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임이 정리한 차시별 영상·과제 페이지. 이 단원 카드의 영상 대부분이 여기서 왔어요.", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99", "source": "온스쿨(교사 공개)", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u2_ebs_open", "type": "link", "icon": "🔗", "title": "EBS 온라인 개학 — 초등 수학 1-1(교사용)", "description": "EBS 온라인 개학 강좌 11~15강이 2단원 여러 가지 모양. 회원 가입 뒤 무료.", "url": "https://primary.ebs.co.kr/course/view?courseId=10205266", "source": "EBS 초등", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"}
  ];

  var R = {
    /* 1차시 — 단원 도입 */
    u2_l01: [
      {"id": "v_shape_song", "type": "video", "icon": "🎥", "title": "모양 노래 — 상자·기둥·공(랄랄라 모양 여행)", "description": "상자·기둥·공 모양을 노래로 만나는 도입 영상. 신나게 따라 부르며 단원을 열어요.", "url": "https://www.youtube.com/watch?v=iRSy1ddLo8Q", "video_id": "iRSy1ddLo8Q", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u2_shape_know", "type": "video", "icon": "🎥", "title": "여러 가지 모양 알아보기", "description": "세 가지 모양의 이름과 특징(평평·뾰족·굴러감)을 짚어 주는 영상.", "url": "https://www.youtube.com/watch?v=VohT21R_nBE", "video_id": "VohT21R_nBE", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["concept", "review"]},
      {"id": "lk_u2_l03_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 여러 가지 모양 만들기", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls.edunet.net/play/view.do?e=rjhUas4ey", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["next_lesson"], "note": "로그인 필요"},
      {"id": "kd_u2_l01", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1차시", "description": "단원 도입 학생용 차시.", "url": S + "g1_math_u2_01_단원도입.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 2차시 — 여러 가지 모양을 찾아볼까요 */
    u2_l02: [
      {"id": "v_u2_shape_trip", "type": "video", "icon": "🎥", "title": "랄랄라 모양 여행 — 노래", "description": "상자·기둥·공 모양을 노래로 만나는 도입 영상. 신나게 따라 부르며 단원을 열어요.", "url": "https://www.youtube.com/watch?v=iRSy1ddLo8Q", "video_id": "iRSy1ddLo8Q", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u2_shape_know", "type": "video", "icon": "🎥", "title": "여러 가지 모양 알아보기", "description": "세 가지 모양의 이름과 특징(평평·뾰족·굴러감)을 짚어 주는 영상.", "url": "https://www.youtube.com/watch?v=VohT21R_nBE", "video_id": "VohT21R_nBE", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["concept", "review"]},
      {"id": "kd_u2_l02", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2차시", "description": "모양 찾기 학생용 차시.", "url": S + "g1_math_u2_02_여러가지모양을찾아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 3차시 — 여러 가지 모양을 알아볼까요 */
    u2_l03: [
      {"id": "v_u2_shape_know", "type": "video", "icon": "🎥", "title": "여러 가지 모양 알아보기", "description": "세 가지 모양의 이름과 특징(평평·뾰족·굴러감)을 짚어 주는 영상.", "url": "https://www.youtube.com/watch?v=VohT21R_nBE", "video_id": "VohT21R_nBE", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_u2_shape_trip", "type": "video", "icon": "🎥", "title": "랄랄라 모양 여행 — 노래", "description": "상자·기둥·공 모양을 노래로 만나는 도입 영상. 신나게 따라 부르며 단원을 열어요.", "url": "https://www.youtube.com/watch?v=iRSy1ddLo8Q", "video_id": "iRSy1ddLo8Q", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u2_l03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 3차시", "description": "모양 특징 학생용 차시.", "url": S + "g1_math_u2_03_여러가지모양을알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 4차시 — 여러 가지 모양으로 만들어 볼까요 */
    u2_l04: [
      {"id": "v_u2_shape_make", "type": "video", "icon": "🎥", "title": "여러 가지 모양 만들기", "description": "집에 있는 상자·기둥·공 모양으로 마을을 만드는 영상. 만들기 활동 앞에.", "url": "https://www.youtube.com/watch?v=bKXvFSWrj1w", "video_id": "bKXvFSWrj1w", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "offline_activity"]},
      {"id": "lk_u2_l04_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 여러 가지 모양 만들기", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls.edunet.net/play/view.do?e=rjhUas4ey", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["concept"], "note": "로그인 필요"},
      {"id": "kd_u2_l04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4차시", "description": "모양으로 만들기 학생용 차시.", "url": S + "g1_math_u2_04_여러가지모양으로만들어볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 5차시 — 모양 찾기 놀이를 해 볼까요 */
    u2_l05: [
      {"id": "v_u2_shape_play", "type": "video", "icon": "🎥", "title": "여러 가지 모양 수학 놀이", "description": "집·교실에서 할 수 있는 모양 놀이 모음. 놀이 차시와 확인 차시에.", "url": "https://www.youtube.com/watch?v=s8okfpphoI0", "video_id": "s8okfpphoI0", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "game"]},
      {"id": "lk_u2_l05_edunet", "type": "link", "icon": "🔗", "title": "e학습터 — 여러 가지 모양 찾기 놀이", "description": "교육부 e학습터 강의. 로그인이 필요해요.", "url": "https://cls.edunet.net/play/view.do?e=Sh6v92OxS", "source": "에듀넷 e학습터", "status": "확보", "verified": V, "fit_slides": ["game"], "note": "로그인 필요"},
      {"id": "kd_u2_game1", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 2단원 ①", "description": "모양 놀이 게임. TV에 띄우고 다 같이.", "url": S + "g1_math_u2_game_01.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u2_l05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5차시", "description": "모양 찾기 놀이 학생용 차시.", "url": S + "g1_math_u2_05_모양찾기놀이를해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 6차시 — 수학이랑 확인해요 */
    u2_l06: [
      {"id": "v_u2_shape_know", "type": "video", "icon": "🎥", "title": "여러 가지 모양 알아보기", "description": "세 가지 모양의 이름과 특징(평평·뾰족·굴러감)을 짚어 주는 영상.", "url": "https://www.youtube.com/watch?v=VohT21R_nBE", "video_id": "VohT21R_nBE", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["review", "cover"]},
      {"id": "v_u2_shape_play", "type": "video", "icon": "🎥", "title": "여러 가지 모양 수학 놀이", "description": "집·교실에서 할 수 있는 모양 놀이 모음. 놀이 차시와 확인 차시에.", "url": "https://www.youtube.com/watch?v=s8okfpphoI0", "video_id": "s8okfpphoI0", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["game", "summary"]},
      {"id": "kd_u2_adv4", "type": "kedu", "icon": "🏠", "title": "자기주도 — 입체도형 응용", "description": "확인 뒤 더 풀 아이용 응용 차시.", "url": S + "g1_math_adv_04_입체도형_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["leveled_problem", "summary"]},
      {"id": "kd_u2_l06", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6차시", "description": "단원 확인 학생용 차시.", "url": S + "g1_math_u2_06_수학이랑확인해요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 7차시 — 수학이랑 만들어요 */
    u2_l07: [
      {"id": "v_u2_shape_make", "type": "video", "icon": "🎥", "title": "여러 가지 모양 만들기", "description": "집에 있는 상자·기둥·공 모양으로 마을을 만드는 영상. 만들기 활동 앞에.", "url": "https://www.youtube.com/watch?v=bKXvFSWrj1w", "video_id": "bKXvFSWrj1w", "source": "유튜브(온스쿨 추천)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "offline_activity"]},
      {"id": "kd_u2_game2", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 2단원 ②", "description": "단원 마무리 게임 두 번째.", "url": S + "g1_math_u2_game_02.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u2_l07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 7차시", "description": "모양으로 작품 만들기 학생용 차시.", "url": S + "g1_math_u2_07_수학이랑만들어요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
