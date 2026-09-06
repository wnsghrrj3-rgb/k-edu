/* ============================================================================
   resources/g1_math_u5.js — 케이티처 자료층 · 1학년 1학기 수학 5단원 「50까지의 수」
   자료 표준 v1(resources/README.md) · 황금샘플 g1_math_u1.js 꼴 복제 (2026-09-07)
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다.
   - 같은 id를 쓰면 data/g1_math_u5.js의 검색 카드를 덮어쓴다(승격).
   - 온스쿨 페이지는 4단원까지라 5단원은 유튜브·칸아카데미를 따로 실측했다.
   ============================================================================ */

(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/5단원_50까지의수/재수정_v1/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    {"id": "kd_u5_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 5단원 차시 목록", "description": "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.", "url": "/grade1/semester1/math/index.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]},
    {"id": "lk_u5_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임이 정리한 차시별 영상·과제 페이지. 이 단원 카드의 영상 대부분이 여기서 왔어요.", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99", "source": "온스쿨(교사 공개)", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u5_ebs_open", "type": "link", "icon": "🔗", "title": "EBS 온라인 개학 — 초등 수학 1-1(교사용)", "description": "EBS 온라인 개학 강좌 40~49강이 5단원 50까지의 수(10강). 회원 가입 뒤 무료.", "url": "https://primary.ebs.co.kr/course/view?courseId=10205266", "source": "EBS 초등", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"},
    {"id": "lk_u5_khan", "type": "link", "icon": "🔗", "title": "칸아카데미 — 5. 50까지의 수", "description": "단원 전체 강의 영상 + 연습 문제. 무료·로그인 없이 볼 수 있어요.", "url": "https://ko.khanacademy.org/math/kor-1st-1/x22720cd23d5246e1:1-1-5", "source": "칸아카데미", "status": "확보", "verified": V, "fit_slides": ["concept", "summary"]},
    {"id": "lk_u5_guide", "type": "link", "icon": "🔗", "title": "지도서 각론 — 5단원 1차시 단원 도입(교사용)", "description": "50까지의 수 단원 목표·지도 유의점 요약 글. 수업 전 한 번.", "url": "https://cukey.net/page.php?menuSeq=239&page=14&returnPath=L3BhZ2UucGhwP3BhZ2U9MTQmc3RlcD1saXN0Jm1lbnVTZXE9MjM5Jg%3D%3D&seq=13371&step=view", "source": "교사 공개 자료", "status": "확보", "verified": V, "fit_slides": ["cover"], "audience": "teacher"}
  ];

  var R = {
    /* 2~3차시 — 9 다음 수를 알아볼까요(묶음) */
    u5_l02_03: [
      {"id": "v_ten_concept_song", "type": "video", "icon": "🎥", "title": "10 알아보기 — 9 다음 수(개념 설명)", "description": "9 다음 수 10, 십몇, 10개씩 묶음을 한 번에 설명. 2~4차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=05L3sBp6kSw", "video_id": "05L3sBp6kSw", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_ten_split_song", "type": "video", "icon": "🎥", "title": "10 가르기·모으기 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%2010%20%EA%B0%80%EB%A5%B4%EA%B8%B0%20%EB%AA%A8%EC%9C%BC%EA%B8%B0", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["concept", "basic_problem"]},
      {"id": "kd_u5_l02_03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2~3차시", "description": "10 알아보기 학생용 차시(묶음).", "url": S + "g1_math_u5_02_03_9다음수를알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 4차시 — 십몇을 알아볼까요 */
    u5_l04: [
      {"id": "v_teens_intro", "type": "video", "icon": "🎥", "title": "십몇 알아보기 — 개념 설명", "description": "9 다음 수 10, 십몇, 10개씩 묶음을 한 번에 설명. 2~4차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=05L3sBp6kSw", "video_id": "05L3sBp6kSw", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u5_l04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4차시", "description": "십몇 학생용 차시.", "url": S + "g1_math_u5_04_십몇을알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 5차시 — 모으기와 가르기를 해 볼까요 */
    u5_l05: [
      {"id": "v_count_on_gather", "type": "video", "icon": "🎥", "title": "십몇 모으기·가르기 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%8B%AD%EB%AA%87%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%EC%99%80%20%EA%B0%80%EB%A5%B4%EA%B8%B0", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "v_u5_ten_teens", "type": "video", "icon": "🎥", "title": "10과 십몇, 50까지의 수 — 개념 설명", "description": "9 다음 수 10, 십몇, 10개씩 묶음을 한 번에 설명. 2~4차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=05L3sBp6kSw", "video_id": "05L3sBp6kSw", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u5_l05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5차시", "description": "십몇 모으기·가르기 학생용 차시.", "url": S + "g1_math_u5_05_모으기와가르기를해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 6차시 — 10개씩 묶어 세어 볼까요 */
    u5_l06: [
      {"id": "v_count_by_tens", "type": "video", "icon": "🎥", "title": "10개씩 묶어 세기 — 수 개념", "description": "10개씩 묶어 세는 과정을 보여 주는 개념 영상.", "url": "https://www.youtube.com/watch?v=xST68FnO-5o", "video_id": "xST68FnO-5o", "source": "유튜브(초등 수개념 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u5_l06", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6차시", "description": "10개씩 묶어 세기 학생용 차시.", "url": S + "g1_math_u5_06_10개씩묶어세어볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 7차시 — 50까지의 수를 세어 볼까요 */
    u5_l07: [
      {"id": "v_two_digit_intro", "type": "video", "icon": "🎥", "title": "10개씩 묶음과 낱개의 수 — 개념 설명", "description": "50까지의 수를 10개씩 묶음과 낱개로 쓰는 개념 설명(교과 6차시).", "url": "https://www.youtube.com/watch?v=XVLZ6xtg7Sk", "video_id": "XVLZ6xtg7Sk", "source": "유튜브(초등 교과 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "v_u5_count_tens", "type": "video", "icon": "🎥", "title": "10개씩 묶어 세기 — 수 개념", "description": "10개씩 묶어 세는 과정을 보여 주는 개념 영상.", "url": "https://www.youtube.com/watch?v=xST68FnO-5o", "video_id": "xST68FnO-5o", "source": "유튜브(초등 수개념 채널)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u5_l07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 7차시", "description": "50까지의 수 학생용 차시.", "url": S + "g1_math_u5_07_50까지의수를세어볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 8차시 — 50까지 수의 순서를 알아볼까요 */
    u5_l08: [
      {"id": "v_number_order_50", "type": "video", "icon": "🎥", "title": "50까지 수의 순서 — 개념 설명", "description": "50까지 수의 순서와 두 수 크기 비교를 한 번에. 8·9차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=NYIwXYlzbJU", "video_id": "NYIwXYlzbJU", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u5_l08", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 8차시", "description": "수의 순서 학생용 차시.", "url": S + "g1_math_u5_08_50까지수의순서를알아볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 9차시 — 수의 크기를 비교해 볼까요 */
    u5_l09: [
      {"id": "v_compare_numbers_50", "type": "video", "icon": "🎥", "title": "50까지 두 수의 크기 비교 — 개념 설명", "description": "50까지 수의 순서와 두 수 크기 비교를 한 번에. 8·9차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=NYIwXYlzbJU", "video_id": "NYIwXYlzbJU", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["cover", "motivate", "concept"]},
      {"id": "kd_u5_l09", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 9차시", "description": "크기 비교 학생용 차시.", "url": S + "g1_math_u5_09_수의크기를비교해볼까요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 10차시 — 수학이랑 확인해요 */
    u5_l10: [
      {"id": "v_unit_review", "type": "video", "icon": "🎥", "title": "5단원 전체 복습 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%2050%EA%B9%8C%EC%A7%80%EC%9D%98%20%EC%88%98%20%EC%A0%95%EB%A6%AC", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "review"]},
      {"id": "v_u5_order_compare", "type": "video", "icon": "🎥", "title": "수의 순서와 크기 비교 — 개념 설명", "description": "50까지 수의 순서와 두 수 크기 비교를 한 번에. 8·9차시에 걸쳐 써요.", "url": "https://www.youtube.com/watch?v=NYIwXYlzbJU", "video_id": "NYIwXYlzbJU", "source": "대교 써밋(상업 채널)", "status": "확보", "verified": V, "fit_slides": ["review"]},
      {"id": "kd_u5_game1", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 5단원 ①", "description": "50까지의 수 게임. TV에 띄우고 다 같이.", "url": "/grade1/semester1/math/5단원_50까지의수/g1_math_u5_game_01.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u5_adv13", "type": "kedu", "icon": "🏠", "title": "자기주도 — 50까지의 수 응용", "description": "확인 뒤 더 풀 아이용 응용 차시.", "url": "/grade1/semester1/math/5단원_50까지의수/g1_math_adv_13_50까지의수_응용.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["leveled_problem", "summary"]},
      {"id": "kd_u5_l10", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 10차시", "description": "단원 확인 학생용 차시.", "url": S + "g1_math_u5_10_수학이랑확인해요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ],

    /* 11차시 — 수학이랑 만들어요 */
    u5_l11: [
      {"id": "v_color_by_number", "type": "video", "icon": "🎥", "title": "수로 색칠하는 미술 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EC%88%98%20%EC%83%89%EC%B9%A0%ED%95%98%EA%B8%B0%20%EB%A7%8C%EB%93%A4%EA%B8%B0", "source": "미확보", "status": "미확보", "verified": V, "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u5_game2", "type": "kedu", "icon": "🎮", "title": "케이에듀 게임 — 5단원 ②", "description": "단원 마무리 게임 두 번째.", "url": "/grade1/semester1/math/5단원_50까지의수/g1_math_u5_game_02.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["game", "cover"]},
      {"id": "kd_u5_l11", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 11차시", "description": "수로 만들기 학생용 차시.", "url": S + "g1_math_u5_11_수학이랑만들어요.html", "source": "케이에듀", "status": "확보", "verified": V, "fit_slides": ["summary", "next_lesson"]}
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
