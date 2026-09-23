/* ============================================================================
   resources/g1_korean_u4.js — 케이티처 자료층 · 1학년 1학기 국어 4단원 「여러 가지 낱말을 익혀요」
   2026-09-23 (자료층 3차, 베프). 표준 = resources/README.md · 꼴 = g1_korean_u1.js
   - 링크는 전부 웹 검색으로 실측한 것(온스쿨 1학년 국어 페이지·EBS 한글이 야호·울산 교육연구정보원 등). 지어낸 ID 0건.
   - ⚠️ 온스쿨 영상은 2015 교육과정 판이다 — 단원 번호·교과서 쪽수가 다르다(note에 적음).
   - 미확보 4자리: l01, l06, l08, l11 — 검색 카드로 남긴다.
   - 살아 있는지는 사람이 재생해 본다(삭제·비공개는 실기기에서만 잡힌다).
   ============================================================================ */
(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var COMMON = [{"id": "kd_u4_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 4단원 차시 목록", "description": "학생이 혼자 푸는 케이에듀 국어 차시 목록.", "url": "/grade1/semester1/korean/index.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}, {"id": "lk_u4_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 국어 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임 온스쿨. 이 단원 영상 대부분의 출처(2015 판 단원·쪽수).", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EA%B5%AD%EC%96%B4", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover"]}, {"id": "lk_gg_onbaeum", "type": "link", "icon": "🔗", "title": "경기초등온배움교실 — 국어 1학년 1학기", "description": "경기도교육청 교사 지원 사이트의 1-1 국어 단원별 자료.", "url": "https://sites.google.com/ssem.re.kr/on-learning-class/1%ED%95%99%EB%85%84/%EA%B5%AD%EC%96%B4-1%ED%95%99%EB%85%84-1%ED%95%99%EA%B8%B0", "source": "경기도교육청 온배움교실", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover"]}, {"id": "lk_ham_g1kor", "type": "link", "icon": "🔗", "title": "함쌤 초등교실 — 1학년 국어 재생목록", "description": "1학년 국어 플립러닝용 교사 제작 영상 목록.", "url": "https://www.youtube.com/playlist?list=PLPMdOUL8kbAl_S1_t1Zv-gg_9KgT_VEQR", "source": "교사 공개 채널", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover"]}];
  var R = {
    u4_l01: [
      {"id": "v_story_words", "type": "video", "icon": "🎥", "title": "이야기를 듣고 낱말 읽기", "description": "이야기를 들은 뒤 나온 낱말을 따라 읽는 영상.", "url": "https://www.youtube.com/watch?v=k2-o764P-5c", "video_id": "k2-o764P-5c", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "cover"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "v_u4_why_words", "type": "video", "icon": "🎥", "title": "낱말을 알면 좋은 점 — 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=1%ED%95%99%EB%85%84%20%EA%B5%AD%EC%96%B4%20%EB%82%B1%EB%A7%90%EC%9D%84%20%EC%95%8C%EB%A9%B4%20%EC%A2%8B%EC%9D%80%20%EC%A0%90", "source": "미확보", "status": "미확보", "verified": "2026-09-23", "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u4_l01_02", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1~2차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l01_02.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb24", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 낱말 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_24_낱말읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u4_l02: [
      {"id": "v_squirrel", "type": "video", "icon": "🎥", "title": "다람쥐에게 일어난 일 — 받침이 빠지면?", "description": "받침을 빠뜨린 글자 때문에 생긴 일. 받침이 왜 필요한지 여는 도입 영상.", "url": "https://www.youtube.com/watch?v=QuD0rM0rnwA", "video_id": "QuD0rM0rnwA", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_story_words", "type": "video", "icon": "🎥", "title": "이야기를 듣고 낱말 읽기", "description": "이야기를 들은 뒤 나온 낱말을 따라 읽는 영상.", "url": "https://www.youtube.com/watch?v=k2-o764P-5c", "video_id": "k2-o764P-5c", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["read_aloud", "concept"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l01_02", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1~2차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l01_02.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l03: [
      {"id": "v_body", "type": "video", "icon": "🎥", "title": "몸의 각 부분 낱말 읽고 쓰기", "description": "우리 몸 이름을 말하고 읽고 따라 쓰는 교과서 활동 영상.", "url": "https://www.youtube.com/watch?v=5Ecm7kDkKJk", "video_id": "5Ecm7kDkKJk", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "v_ri_song", "type": "video", "icon": "🎥", "title": "'리'자로 끝나는 말(노래)", "description": "이어 말하기 말놀이 노래.", "url": "https://www.youtube.com/watch?v=UZXGRyoxdOE", "video_id": "UZXGRyoxdOE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "offline_activity"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l03_04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 3~4차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l03_04.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l04: [
      {"id": "v_family", "type": "video", "icon": "🎥", "title": "가족을 부르는 낱말 익히기", "description": "엄마·아빠·할머니… 가족 호칭 낱말 영상.", "url": "https://www.youtube.com/watch?v=MXymHQgNBHQ", "video_id": "MXymHQgNBHQ", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "v_body", "type": "video", "icon": "🎥", "title": "몸의 각 부분 낱말 읽고 쓰기", "description": "우리 몸 이름을 말하고 읽고 따라 쓰는 교과서 활동 영상.", "url": "https://www.youtube.com/watch?v=5Ecm7kDkKJk", "video_id": "5Ecm7kDkKJk", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l03_04", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 3~4차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l03_04.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l05: [
      {"id": "v_intro", "type": "video", "icon": "🎥", "title": "요리 재료 이름 찾아 읽고 쓰기", "description": "요리책 속 재료 이름을 찾아 읽는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=JnBTEZxGxUs", "video_id": "JnBTEZxGxUs", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["card_quiz", "cover", "motivate"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l05_06", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5~6차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l05_06.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb25", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 생활 속 낱말 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_25_생활속낱말읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u4_l06: [
      {"id": "v_u4_modifier", "type": "video", "icon": "🎥", "title": "꾸며 주는 말 — 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EA%BE%B8%EB%A9%B0%20%EC%A3%BC%EB%8A%94%20%EB%A7%90", "source": "미확보", "status": "미확보", "verified": "2026-09-23", "fit_slides": ["cover", "motivate"]},
      {"id": "v_food", "type": "video", "icon": "🎥", "title": "요리 재료 이름 찾아 읽고 쓰기", "description": "요리책 속 재료 이름을 찾아 읽는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=JnBTEZxGxUs", "video_id": "JnBTEZxGxUs", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["card_quiz"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l05_06", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 5~6차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l05_06.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l07: [
      {"id": "v_school", "type": "video", "icon": "🎥", "title": "학교와 관련된 낱말 익히기", "description": "교실·운동장처럼 학교에서 보는 낱말 영상.", "url": "https://www.youtube.com/watch?v=6RQlNiLoh5o", "video_id": "6RQlNiLoh5o", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l07_08", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 7~8차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l07_08.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb25", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 생활 속 낱말 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_25_생활속낱말읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u4_l08: [
      {"id": "v_mart", "type": "video", "icon": "🎥", "title": "마트 물건 이름 읽기", "description": "진열된 물건 이름을 읽고 받침 글자를 찾는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=FtJExFQ_ItE", "video_id": "FtJExFQ_ItE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_u4_town_words", "type": "video", "icon": "🎥", "title": "동네에서 보는 낱말(간판) — 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%9A%B0%EB%A6%AC%20%EB%8F%99%EB%84%A4%20%EA%B0%84%ED%8C%90%20%EB%82%B1%EB%A7%90", "source": "미확보", "status": "미확보", "verified": "2026-09-23", "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u4_l07_08", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 7~8차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l07_08.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l09: [
      {"id": "v_tooth", "type": "video", "icon": "🎥", "title": "「이가 아파서 치과에 가요」 듣기", "description": "동물 친구들이 나오는 이야기를 들으며 낱말 만나기.", "url": "https://www.youtube.com/watch?v=rF_tRzJFwIM", "video_id": "rF_tRzJFwIM", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["read_aloud", "motivate"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "v_animal_names", "type": "video", "icon": "🎥", "title": "이야기 속 동물 이름 찾기", "description": "들은 이야기에서 동물 이름 낱말을 찾아 써요.", "url": "https://www.youtube.com/watch?v=f90VMK5hRcM", "video_id": "f90VMK5hRcM", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "question"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l09_10", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 9~10차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l09_10.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l10: [
      {"id": "v_pic_sent", "type": "video", "icon": "🎥", "title": "그림에 맞는 문장 만들기", "description": "그림을 보고 낱말을 골라 문장을 만드는 도입 영상.", "url": "https://www.youtube.com/watch?v=8L4Us-fK12Y", "video_id": "8L4Us-fK12Y", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "motivate"], "note": "2015 교육과정 판(7단원 생각을 나타내요) 영상 — 교과서 쪽수는 달라요"},
      {"id": "v_story_words", "type": "video", "icon": "🎥", "title": "이야기를 듣고 낱말 읽기", "description": "이야기를 들은 뒤 나온 낱말을 따라 읽는 영상.", "url": "https://www.youtube.com/watch?v=k2-o764P-5c", "video_id": "k2-o764P-5c", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l09_10", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 9~10차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l09_10.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb29", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 짧은 문장 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_29_짧은문장읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u4_l11: [
      {"id": "v_u4_picture_letters", "type": "video", "icon": "🎥", "title": "그림 글자 만들기 — 영상", "description": "아직 알맞은 공개 영상을 못 찾았어요 — 유튜브에서 골라 주세요.", "url": "https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%20%EA%B7%B8%EB%A6%BC%20%EA%B8%80%EC%9E%90%20%EB%A7%8C%EB%93%A4%EA%B8%B0", "source": "미확보", "status": "미확보", "verified": "2026-09-23", "fit_slides": ["cover", "motivate"]},
      {"id": "kd_u4_l11_12", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 11~12차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l11_12.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l12: [
      {"id": "v_ri_song", "type": "video", "icon": "🎥", "title": "'리'자로 끝나는 말(노래)", "description": "이어 말하기 말놀이 노래.", "url": "https://www.youtube.com/watch?v=UZXGRyoxdOE", "video_id": "UZXGRyoxdOE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "offline_activity"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l11_12", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 11~12차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l11_12.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb44", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 재미있는 말놀이", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/5_문학/g1_kor_tb_44_재미있는말놀이.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u4_l13: [
      {"id": "v_family", "type": "video", "icon": "🎥", "title": "가족을 부르는 낱말 익히기", "description": "엄마·아빠·할머니… 가족 호칭 낱말 영상.", "url": "https://www.youtube.com/watch?v=MXymHQgNBHQ", "video_id": "MXymHQgNBHQ", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "v_school", "type": "video", "icon": "🎥", "title": "학교와 관련된 낱말 익히기", "description": "교실·운동장처럼 학교에서 보는 낱말 영상.", "url": "https://www.youtube.com/watch?v=6RQlNiLoh5o", "video_id": "6RQlNiLoh5o", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review"], "note": "2015 교육과정 판(1단원 바른 자세로 읽고 쓰기) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l13_14", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 13~14차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l13_14.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u4_l14: [
      {"id": "v_body", "type": "video", "icon": "🎥", "title": "몸의 각 부분 낱말 읽고 쓰기", "description": "우리 몸 이름을 말하고 읽고 따라 쓰는 교과서 활동 영상.", "url": "https://www.youtube.com/watch?v=5Ecm7kDkKJk", "video_id": "5Ecm7kDkKJk", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review", "concept"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "v_food", "type": "video", "icon": "🎥", "title": "요리 재료 이름 찾아 읽고 쓰기", "description": "요리책 속 재료 이름을 찾아 읽는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=JnBTEZxGxUs", "video_id": "JnBTEZxGxUs", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review"], "note": "2015 교육과정 판(4단원 글자를 만들어요) 영상 — 내용은 같아요"},
      {"id": "kd_u4_l13_14", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 13~14차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/4단원_여러가지낱말을익혀요/g1_kor_u4_l13_14.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ]
  };
  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_korean"] = Object.assign(window.KT_RESOURCES["g1_korean"] || {}, R);
})();
