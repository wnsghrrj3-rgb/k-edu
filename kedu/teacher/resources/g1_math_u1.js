/* ============================================================================
   resources/g1_math_u1.js — 케이티처 자료층 · 1학년 1학기 수학 1단원 「9까지의 수」
   황금샘플 ① (2026-09-07). 표준 = resources/README.md
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - 못 찾은 자리는 status "미확보" + 검색 url로 남겼다(l09 「0」 · l12 그림책).
   - 같은 id를 쓰면 data/g1_math_u1.js의 검색 카드를 덮어쓴다(승격).
   ============================================================================ */
(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/math/1단원_9까지의수/";
  var V = "2026-09-07";

  /* 단원 공통 — 모든 차시에 붙는다 */
  var COMMON = [
    { id: "kd_u1_home", type: "kedu", icon: "🏠", title: "자기주도 — 1단원 차시 목록",
      description: "학생이 집·교실에서 혼자 푸는 케이에듀 차시. 수업 뒤 과제로 열어 주세요.",
      url: "/grade1/semester1/math/index.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] },
    { id: "lk_u1_onschool", type: "link", icon: "🔗", title: "온스쿨 1학년 수학 — 차시별 영상 모음(교사용)",
      description: "차시마다 쓸 수 있는 영상 링크가 정리된 교사 페이지. 여기 실린 영상 대부분을 아래 카드로 옮겨 두었어요.",
      url: "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EC%88%98%ED%95%99",
      source: "온스쿨(교사 공개)", status: "확보", verified: V, audience: "teacher", fit_slides: ["cover"] },
    { id: "lk_u1_ebs_live", type: "link", icon: "🔗", title: "EBS 초등 — 1학년 수학 라이브 특강(9까지의 수 1~5강)",
      description: "EBS 초등 사이트 강좌. 1단원이 5강으로 나뉘어 있어 차시와 대응하기 쉬워요. 회원 가입 뒤 무료.",
      url: "https://primary.ebs.co.kr/course/view?courseId=10204683",
      source: "EBS 초등", status: "확보", verified: V, audience: "teacher", fit_slides: ["cover"] }
  ];

  var R = {
    /* 1차시 — 단원 도입 · 학교가 즐거워요 */
    u1_l01: [
      { id: "v_u1_count_song", type: "video", icon: "🎥", title: "숫자송 — 1부터 9까지",
        description: "노래로 1~9를 소리 내어 세며 단원을 열어요. 도입 2분.",
        url: "https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id: "Qxi-dPmsl-Q",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["cover", "motivate"] },
      { id: "v_u1_play_ytn", type: "video", icon: "🎥", title: "9까지의 수 수학놀이 — YTN 사이언스",
        description: "초등 교사들이 만든 1단원 수학 놀이 소개. 놀이 장면만 골라 보여 주면 「수학은 놀이」로 시작할 수 있어요.",
        url: "https://www.youtube.com/watch?v=3kmVnBNAPgQ", video_id: "3kmVnBNAPgQ",
        source: "YTN 사이언스", status: "확보", verified: V, fit_slides: ["motivate", "game"] },
      { id: "v_u1_overview_t", type: "video", icon: "🎥", title: "1단원 개관 — 무엇을 왜 배우나(교사용)",
        description: "9까지의 수 단원이 어디로 가는지 5분 훑기. 수업 전 한 번.",
        url: "https://www.youtube.com/watch?v=05RI9pFUbyI", video_id: "05RI9pFUbyI",
        source: "유튜브(초등수학 교사 채널)", status: "확보", verified: V, audience: "teacher", fit_slides: ["cover"] },
      { id: "v_u1_teach_count", type: "video", icon: "🎥", title: "수 세기·수 쓰기 지도하기(교사용)",
        description: "하나씩 짚어 세기, 마지막 수가 개수, 숫자 쓰는 순서 — 지도 요령.",
        url: "https://www.youtube.com/watch?v=0dwUabouWak", video_id: "0dwUabouWak",
        source: "유튜브(초등수학 교사 채널)", status: "확보", verified: V, audience: "teacher", fit_slides: ["concept"] },
      { id: "kd_u1_l01", type: "kedu", icon: "🏠", title: "자기주도 차시 — 1차시",
        description: "같은 차시의 학생용 케이에듀 화면. 수업 뒤 과제로 열어 주세요.",
        url: S + "g1_math_u1_l01.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 2~3차시 — 1, 2, 3, 4, 5 */
    u1_l02_03: [
      { id: "v_count_to_5_song", type: "video", icon: "🎥", title: "5까지의 수 알기",
        description: "1~5를 세고 읽는 짧은 영상. 도입 자리.",
        url: "https://youtu.be/WBvC4_ci42I", video_id: "WBvC4_ci42I",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["cover", "motivate"] },
      { id: "v_u1_count_song", type: "video", icon: "🎥", title: "숫자송 — 1부터 9까지",
        description: "노래로 세기. 1~5 구간까지만 틀어도 좋아요.",
        url: "https://www.youtube.com/watch?v=Qxi-dPmsl-Q", video_id: "Qxi-dPmsl-Q",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["review"] },
      { id: "kd_u1_l02_03", type: "kedu", icon: "🏠", title: "자기주도 차시 — 2~3차시",
        description: "1~5 세기·쓰기 학생용 차시.",
        url: S + "g1_math_u1_l02_03.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 4~5차시 — 6, 7, 8, 9 */
    u1_l04_05: [
      { id: "v_u1_6to9", type: "video", icon: "🎥", title: "6~9까지 어떻게 셀까?",
        description: "5 다음 수를 세는 법. 「5와 몇」으로 보는 흐름과 맞아요.",
        url: "https://www.youtube.com/watch?v=6TlxkYD4qC0", video_id: "6TlxkYD4qC0",
        source: "유튜브", status: "확보", verified: V, fit_slides: ["cover", "motivate", "concept"] },
      { id: "v_u1_9_know", type: "video", icon: "🎥", title: "9까지의 수 알기",
        description: "6·7·8·9 모양과 개수 익히기.",
        url: "https://youtu.be/UCtzJG97WyU", video_id: "UCtzJG97WyU",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["concept"] },
      { id: "v_u1_9_write", type: "video", icon: "🎥", title: "9까지의 수 쓰기",
        description: "6~9 쓰는 순서. 따라 쓰기 자리에 틀어 두세요.",
        url: "https://youtu.be/qXQSB7OxJGA", video_id: "qXQSB7OxJGA",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["basic_problem", "game"] },
      { id: "kd_u1_l04_05", type: "kedu", icon: "🏠", title: "자기주도 차시 — 4~5차시",
        description: "6~9 세기·쓰기 학생용 차시.",
        url: S + "g1_math_u1_l04_05.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 6차시 — 몇째 */
    u1_l06: [
      { id: "v_order_song", type: "video", icon: "🎥", title: "몇 번째일까?",
        description: "줄 서기로 첫째·둘째·셋째를 익히는 영상. 개수와 순서가 다르다는 자리에.",
        url: "https://youtu.be/5kJAp7BIwgw", video_id: "5kJAp7BIwgw",
        source: "유튜브(온스쿨 추천)", status: "확보", verified: V, fit_slides: ["cover", "motivate", "concept"] },
      { id: "lk_u1_l06_edunet", type: "link", icon: "🔗", title: "e학습터 — 수의 순서와 몇째",
        description: "교육부 e학습터 강의. 로그인이 필요해요.",
        url: "https://cls.edunet.net/play/view.do?e=USJeNLWGU",
        source: "에듀넷 e학습터", status: "확보", verified: V, note: "로그인 필요", fit_slides: ["concept"] },
      { id: "kd_u1_l06", type: "kedu", icon: "🏠", title: "자기주도 차시 — 6차시",
        description: "몇째 학생용 차시.",
        url: S + "g1_math_u1_l06.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 7차시 — 수의 순서 */
    u1_l07: [
      { id: "v_u1_order_anim", type: "video", icon: "🎥", title: "수의 순서를 알아볼까요 — 애니메이션",
        description: "1→9 순서를 애니메이션으로. 도입 3분.",
        url: "https://www.youtube.com/watch?v=qEDd7eq3Eo4", video_id: "qEDd7eq3Eo4",
        source: "밀크T(상업 채널)", status: "확보", verified: V, fit_slides: ["cover", "motivate"] },
      { id: "v_u1_order_compare", type: "video", icon: "🎥", title: "수의 순서와 크기 비교 — 개념 설명",
        description: "순서·1 큰 수·크기 비교를 한 번에 설명. 7·8·10차시에 걸쳐 써요.",
        url: "https://www.youtube.com/watch?v=88dFSVafleQ", video_id: "88dFSVafleQ",
        source: "대교 써밋(상업 채널)", status: "확보", verified: V, fit_slides: ["concept", "review"] },
      { id: "kd_u1_l07", type: "kedu", icon: "🏠", title: "자기주도 차시 — 7차시",
        description: "수의 순서 학생용 차시.",
        url: S + "g1_math_u1_l07.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 8차시 — 1만큼 더 큰 수·작은 수 */
    u1_l08: [
      { id: "v_u1_order_compare", type: "video", icon: "🎥", title: "수의 순서와 크기 비교 — 개념 설명",
        description: "1 큰 수·1 작은 수가 수의 순서에서 어떻게 보이는지.",
        url: "https://www.youtube.com/watch?v=88dFSVafleQ", video_id: "88dFSVafleQ",
        source: "대교 써밋(상업 채널)", status: "확보", verified: V, fit_slides: ["motivate", "concept"] },
      { id: "kd_u1_l08", type: "kedu", icon: "🏠", title: "자기주도 차시 — 8차시",
        description: "1 큰 수·1 작은 수 학생용 차시.",
        url: S + "g1_math_u1_l08.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 9차시 — 0 */
    u1_l09: [
      { id: "v_zero_song", type: "video", icon: "🎥", title: "0을 알아볼까요 — 영상",
        description: "「아무것도 없음」을 보여 주는 짧은 영상. 아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.",
        url: "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84+%EC%88%98%ED%95%99+0%EC%9D%84+%EC%95%8C%EC%95%84%EB%B3%BC%EA%B9%8C%EC%9A%94",
        source: "미확보", status: "미확보", verified: V, fit_slides: ["cover", "motivate"] },
      { id: "kd_u1_l09", type: "kedu", icon: "🏠", title: "자기주도 차시 — 9차시",
        description: "0 학생용 차시.",
        url: S + "g1_math_u1_l09.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 10차시 — 크기 비교 */
    u1_l10: [
      { id: "v_compare_song", type: "video", icon: "🎥", title: "수의 크기 비교 — 개념 설명",
        description: "하나씩 짝지어 「더 많다·더 적다」를 보는 자리. 크기 비교 부분부터 틀어 주세요.",
        url: "https://www.youtube.com/watch?v=88dFSVafleQ", video_id: "88dFSVafleQ",
        source: "대교 써밋(상업 채널)", status: "확보", verified: V, fit_slides: ["cover", "motivate", "concept"] },
      { id: "kd_u1_l10", type: "kedu", icon: "🏠", title: "자기주도 차시 — 10차시",
        description: "크기 비교 학생용 차시.",
        url: S + "g1_math_u1_l10.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 11차시 — 수학이랑 확인해요 */
    u1_l11: [
      { id: "v_u1_order_compare", type: "video", icon: "🎥", title: "수의 순서와 크기 비교 — 단원 복습",
        description: "평가 전 단원 전체를 한 번 훑는 복습용. 순서·크기 비교 자리.",
        url: "https://www.youtube.com/watch?v=88dFSVafleQ", video_id: "88dFSVafleQ",
        source: "대교 써밋(상업 채널)", status: "확보", verified: V, fit_slides: ["review", "cover"] },
      { id: "kd_u1_game1", type: "kedu", icon: "🎮", title: "케이에듀 게임 — 1단원 ①",
        description: "단원 마무리 게임. TV에 띄우고 다 같이.",
        url: S + "g1_math_u1_game_01.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["game", "cover"] },
      { id: "kd_u1_adv1", type: "kedu", icon: "🏠", title: "자기주도 — 9까지의 수 응용",
        description: "평가 뒤 더 풀 아이용 응용 차시.",
        url: S + "g1_math_adv_01_9까지의수_응용.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["advanced_problem", "summary"] },
      { id: "kd_u1_l11", type: "kedu", icon: "🏠", title: "자기주도 차시 — 11차시",
        description: "단원 확인 학생용 차시.",
        url: S + "g1_math_u1_l11.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ],

    /* 12차시 — 수학이랑 만들어요(수 그림책) */
    u1_l12: [
      { id: "v_picture_book_intro", type: "video", icon: "🎥", title: "수 그림책 만들기 — 영상",
        description: "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.",
        url: "https://www.youtube.com/results?search_query=%EC%88%98+%EA%B7%B8%EB%A6%BC%EC%B1%85+%EB%A7%8C%EB%93%A4%EA%B8%B0+1%ED%95%99%EB%85%84",
        source: "미확보", status: "미확보", verified: V, fit_slides: ["cover", "motivate"] },
      { id: "kd_u1_game2", type: "kedu", icon: "🎮", title: "케이에듀 게임 — 1단원 ②",
        description: "단원 마무리 게임 두 번째.",
        url: S + "g1_math_u1_game_02.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["game", "cover"] },
      { id: "kd_u1_l12", type: "kedu", icon: "🏠", title: "자기주도 차시 — 12차시",
        description: "수 그림책 학생용 차시.",
        url: S + "g1_math_u1_l12.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] }
    ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, R);
})();
