/* ============================================================================
   resources/g1_korean_u1.js — 케이티처 자료층 · 1학년 1학기 국어 1단원 「글자를 만들어요」
   황금샘플 ② (2026-09-07). 표준 = resources/README.md
   - 링크는 전부 웹 검색으로 실측한 것. 지어낸 ID 0건.
   - ⚠️ 경북 온학교·온스쿨 영상은 2015 교육과정 판(「4. 글자를 만들어요」)이다.
     2022 개정 1단원과 내용은 같으나 단원 번호가 다르다 — note에 적어 두었다.
   - 못 찾은 자리(l02 글자가 필요한 까닭 · l07·l08 바른 자세 · l12 · l14)는 「미확보」.
   ============================================================================ */
(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var S = "/grade1/semester1/korean/1단원_글자를만들어요/";
  var V = "2026-09-07";
  var OLD = "2015 교육과정 판(4단원) 영상 — 내용은 같아요";

  var COMMON = [
    { id: "kd_u1_home", type: "kedu", icon: "🏠", title: "자기주도 — 1단원 차시 목록",
      description: "학생이 혼자 푸는 케이에듀 국어 차시 목록.",
      url: "/grade1/semester1/korean/index.html", source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] },
    { id: "lk_u1_onschool", type: "link", icon: "🔗", title: "온스쿨 1학년 국어 — 차시별 영상 모음(교사용)",
      description: "자음자·모음자·글자 만들기 활동 영상이 교과서 쪽수와 함께 정리된 교사 페이지.",
      url: "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EA%B5%AD%EC%96%B4",
      source: "온스쿨(교사 공개)", status: "확보", verified: V, audience: "teacher", fit_slides: ["cover"] }
  ];

  var vOnhak1 = { id: "v_u1_onhak_find", type: "video", icon: "🎥", title: "글자에서 자음자와 모음자 찾기 — 경북 온학교",
    description: "교사가 진행하는 40분 수업 영상. 2교시 「글자에서 자음자·모음자 찾기」 부분을 골라 보여 주세요.",
    url: "https://www.youtube.com/watch?v=J5RnQIaMnHM", video_id: "J5RnQIaMnHM",
    source: "경상북도교육청 온학교", status: "확보", verified: V, note: OLD, fit_slides: ["motivate", "concept"] };
  var vOnhak2 = { id: "v_u1_onhak_build", type: "video", icon: "🎥", title: "글자의 짜임 알고 읽고 쓰기 — 경북 온학교",
    description: "1교시 글자의 짜임(자음자+모음자) · 2교시 여러 가지 모음자. 차시에 맞는 교시만.",
    url: "https://www.youtube.com/watch?v=upt_P3u3Uls", video_id: "upt_P3u3Uls",
    source: "경상북도교육청 온학교", status: "확보", verified: V, note: OLD, fit_slides: ["motivate", "concept"] };
  var vKbs = { id: "v_u1_kbs_hangul", type: "video", icon: "🎥", title: "한글이 쑥쑥 — ㄱ·ㄴ·ㄷ이 모였어요(KBS)",
    description: "KBS TV유치원 한글 코너 모아보기. 자음자 이름·모양 익히기 도입에.",
    url: "https://www.youtube.com/watch?v=uzB-elqrhPE", video_id: "uzB-elqrhPE",
    source: "KBS", status: "확보", verified: V, fit_slides: ["cover", "motivate"] };
  var vGiyeok = { id: "v_u1_giyeok_song", type: "video", icon: "🎥", title: "기역 니은 노래",
    description: "자음자 이름을 노래로. 교과서 「자음+모음=글자」 노래 자리.",
    url: "https://www.youtube.com/watch?v=4KnM-JG6MXQ", video_id: "4KnM-JG6MXQ",
    source: "유튜브(2012 공개)", status: "확보", verified: V, fit_slides: ["motivate", "game"] };
  var vBuild = { id: "v_u1_build_letters", type: "video", icon: "🎥", title: "글자를 만들어요(한글 읽기)",
    description: "자음자와 모음자를 붙여 글자 만들기 짧은 설명 영상.",
    url: "https://www.youtube.com/watch?v=Y9iMLJqhNu0", video_id: "Y9iMLJqhNu0",
    source: "유튜브", status: "확보", verified: V, fit_slides: ["concept"] };
  var vVowel1 = { id: "v_u1_vowel_color", type: "video", icon: "🎥", title: "모음자 색칠하고 연결하기",
    description: "교과서 활동 영상(모음자 색칠·연결). 활동 시범으로.",
    url: "https://youtu.be/PTtwhKr7BWY", video_id: "PTtwhKr7BWY",
    source: "온스쿨(교사 공개)", status: "확보", verified: V, note: OLD, fit_slides: ["game", "concept"] };
  var vVowel2 = { id: "v_u1_vowel_laugh", type: "video", icon: "🎥", title: "웃음소리에서 모음자 찾기",
    description: "하하·히히·호호 웃음소리로 모음자 찾기 활동 영상.",
    url: "https://youtu.be/F9WjkJ2uCTg", video_id: "F9WjkJ2uCTg",
    source: "온스쿨(교사 공개)", status: "확보", verified: V, note: OLD, fit_slides: ["motivate", "game"] };
  var vVowel3 = { id: "v_u1_vowel_one", type: "video", icon: "🎥", title: "마음은 하나 — 모음자 찾기",
    description: "노래 가사에서 모음자를 찾는 활동 영상.",
    url: "https://youtu.be/YY4wGdZeCwI", video_id: "YY4wGdZeCwI",
    source: "온스쿨(교사 공개)", status: "확보", verified: V, note: OLD, fit_slides: ["game"] };

  function miss(id, title, q, fit) {
    return { id: id, type: "video", icon: "🎥", title: title,
      description: "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.",
      url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(q),
      source: "미확보", status: "미확보", verified: V, fit_slides: fit || ["cover", "motivate"] };
  }
  function kd(id, title, file, desc) {
    return { id: id, type: "kedu", icon: "🏠", title: title, description: desc || "같은 차시의 학생용 케이에듀 화면.",
      url: S + file, source: "케이에듀", status: "확보", verified: V, fit_slides: ["summary", "next_lesson"] };
  }

  var R = {
    u1_l01: [ vKbs, vOnhak1, kd("kd_u1_l01_02", "자기주도 차시 — 1~2차시", "g1_kor_u1_l01_02.html") ],
    u1_l02: [ miss("v_u1_why_letters", "글자가 필요한 까닭 — 영상", "1학년 국어 글자가 필요한 까닭"), vKbs,
              kd("kd_u1_l01_02", "자기주도 차시 — 1~2차시", "g1_kor_u1_l01_02.html") ],
    u1_l03: [ vOnhak1, vKbs, vGiyeok, kd("kd_u1_l03_04", "자기주도 차시 — 3~4차시", "g1_kor_u1_l03_04.html") ],
    u1_l04: [ vOnhak2, vBuild, vGiyeok, kd("kd_u1_l03_04", "자기주도 차시 — 3~4차시", "g1_kor_u1_l03_04.html") ],
    u1_l05: [ vOnhak2, vBuild, kd("kd_u1_l05_06", "자기주도 차시 — 5~6차시", "g1_kor_u1_l05_06.html") ],
    u1_l06: [ { id: "v_song", type: "video", icon: "🎥", title: "글자 만들기 노래·영상",
                description: vGiyeok.description, url: vGiyeok.url, video_id: vGiyeok.video_id,
                source: vGiyeok.source, status: "확보", verified: V, fit_slides: ["cover", "motivate"] },
              vBuild, kd("kd_u1_l05_06", "자기주도 차시 — 5~6차시", "g1_kor_u1_l05_06.html") ],
    u1_l07: [ miss("v_u1_posture_read", "바른 자세로 읽기 — 영상", "1학년 바른 자세로 책 읽기"),
              kd("kd_u1_l07_08", "자기주도 차시 — 7~8차시", "g1_kor_u1_l07_08.html") ],
    u1_l08: [ miss("v_u1_posture_write", "바른 자세로 글씨 쓰기 — 영상", "1학년 바른 자세 연필 잡기 글씨 쓰기"),
              kd("kd_u1_l07_08", "자기주도 차시 — 7~8차시", "g1_kor_u1_l07_08.html") ],
    u1_l09: [ vVowel1, vOnhak2, kd("kd_u1_l09_11", "자기주도 차시 — 9~11차시", "g1_kor_u1_l09_11.html") ],
    u1_l10: [ vVowel2, vOnhak2, kd("kd_u1_l09_11", "자기주도 차시 — 9~11차시", "g1_kor_u1_l09_11.html") ],
    u1_l11: [ vVowel3, vVowel1, kd("kd_u1_l09_11", "자기주도 차시 — 9~11차시", "g1_kor_u1_l09_11.html") ],
    u1_l12: [ miss("v_u1_check", "글자 짜임 점검 — 영상", "1학년 국어 글자의 짜임"), vBuild ],
    u1_l13: [ { id: "v_song", type: "video", icon: "🎥", title: "자모 놀이 영상 — 한글이 쑥쑥(KBS)",
                description: vKbs.description, url: vKbs.url, video_id: vKbs.video_id,
                source: "KBS", status: "확보", verified: V, fit_slides: ["cover", "motivate"] },
              vGiyeok, kd("kd_u1_l13", "자기주도 차시 — 13차시", "g1_kor_u1_l13.html") ],
    u1_l14: [ miss("v_u1_read_words", "낱말을 또박또박 읽기 — 영상", "1학년 국어 낱말 또박또박 읽기"),
              kd("kd_u1_l14", "자기주도 차시 — 14차시", "g1_kor_u1_l14.html") ]
  };

  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_korean"] = Object.assign(window.KT_RESOURCES["g1_korean"] || {}, R);
})();
