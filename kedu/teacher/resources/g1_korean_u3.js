/* ============================================================================
   resources/g1_korean_u3.js — 케이티처 자료층 · 1학년 1학기 국어 3단원 「낱말과 친해져요」
   2026-09-23 (자료층 3차, 베프). 표준 = resources/README.md · 꼴 = g1_korean_u1.js
   - 링크는 전부 웹 검색으로 실측한 것(온스쿨 1학년 국어 페이지·EBS 한글이 야호·울산 교육연구정보원 등). 지어낸 ID 0건.
   - ⚠️ 온스쿨 영상은 2015 교육과정 판이다 — 단원 번호·교과서 쪽수가 다르다(note에 적음).
   - 미확보 0자리: 없음 — 검색 카드로 남긴다.
   - 살아 있는지는 사람이 재생해 본다(삭제·비공개는 실기기에서만 잡힌다).
   ============================================================================ */
(function () {
  window.KT_RESOURCES = window.KT_RESOURCES || {};
  var COMMON = [{"id": "kd_u3_home", "type": "kedu", "icon": "🏠", "title": "자기주도 — 3단원 차시 목록", "description": "학생이 혼자 푸는 케이에듀 국어 차시 목록.", "url": "/grade1/semester1/korean/index.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}, {"id": "lk_u3_onschool", "type": "link", "icon": "🔗", "title": "온스쿨 1학년 국어 — 차시별 영상 모음(교사용)", "description": "실천교육교사모임 온스쿨. 이 단원 영상 대부분의 출처(2015 판 단원·쪽수).", "url": "https://sites.google.com/view/onschool/1%ED%95%99%EB%85%84/1%ED%95%99%EB%85%84-%EA%B5%AD%EC%96%B4", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover"]}, {"id": "lk_ebs_yaho2", "type": "link", "icon": "🔗", "title": "EBS 한글이 야호 2 — 받침 글자 회차 모음", "description": "니은·리을 받침 등 받침 글자 회차를 골라 볼 수 있는 EBS 공식 페이지.", "url": "https://home.ebs.co.kr/yaho2/main", "source": "EBS", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover", "concept"]}, {"id": "lk_ham_g1kor", "type": "link", "icon": "🔗", "title": "함쌤 초등교실 — 1학년 국어 재생목록", "description": "1학년 국어 플립러닝용 교사 제작 영상 목록.", "url": "https://www.youtube.com/playlist?list=PLPMdOUL8kbAl_S1_t1Zv-gg_9KgT_VEQR", "source": "교사 공개 채널", "status": "확보", "verified": "2026-09-23", "audience": "teacher", "fit_slides": ["cover"]}];
  var R = {
    u3_l01: [
      {"id": "v_smart_read", "type": "video", "icon": "🎥", "title": "받침이 있는 글자 읽기", "description": "받침 글자를 소리 내어 읽는 짧은 설명 영상.", "url": "https://www.youtube.com/watch?v=jMiPdGRiOjs", "video_id": "jMiPdGRiOjs", "source": "스마트올(온스쿨 수록)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "cover"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_ebs_mnol", "type": "video", "icon": "🎥", "title": "한글이 야호 — 받침 한글동화(곰·밤·눈·말…)", "description": "EBS 한글이 야호. ㅁ·ㄴ·ㅇ·ㄹ 받침 낱말이 이야기로 나와요.", "url": "https://www.youtube.com/watch?v=y6R9CJxLthQ", "video_id": "y6R9CJxLthQ", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"]},
      {"id": "kd_u3_l01", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 1차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l01.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l02: [
      {"id": "v_smart_bat", "type": "video", "icon": "🎥", "title": "받침이 있는 글자의 짜임", "description": "자음자+모음자+받침 자리를 짚어 주는 짧은 설명 영상.", "url": "https://www.youtube.com/watch?v=Yy4PW-HU_q4", "video_id": "Yy4PW-HU_q4", "source": "스마트올(온스쿨 수록)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_act_make", "type": "video", "icon": "🎥", "title": "받침이 있는 글자 만들기(국어활동)", "description": "국어활동 받침 글자 만들기 풀이 영상.", "url": "https://www.youtube.com/watch?v=rNzIMTm6_sM", "video_id": "rNzIMTm6_sM", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "offline_activity"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l02_03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2~3차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l02_03.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l03: [
      {"id": "v_act_fit", "type": "video", "icon": "🎥", "title": "알맞은 받침 찾아 쓰기", "description": "세 글자에 모두 들어가는 받침 찾기 등 국어활동 풀이.", "url": "https://www.youtube.com/watch?v=XkFfx56drNY", "video_id": "XkFfx56drNY", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "card_quiz"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_maze", "type": "video", "icon": "🎥", "title": "받침이 있는 글자 미로 놀이", "description": "받침 글자를 따라 길을 찾는 놀이 영상.", "url": "https://www.youtube.com/watch?v=BWhxcMT_VeQ", "video_id": "BWhxcMT_VeQ", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["offline_activity"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l02_03", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 2~3차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l02_03.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l04: [
      {"id": "v_make_bat", "type": "video", "icon": "🎥", "title": "받침을 넣어 글자 만들어 보기", "description": "모음자 아래 받침을 넣어 새 글자를 만드는 교과서 활동 영상.", "url": "https://www.youtube.com/watch?v=-4l02jhwFYA", "video_id": "-4l02jhwFYA", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "card_quiz"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_mart", "type": "video", "icon": "🎥", "title": "마트 물건 이름 읽기", "description": "진열된 물건 이름을 읽고 받침 글자를 찾는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=FtJExFQ_ItE", "video_id": "FtJExFQ_ItE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l04_05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4~5차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l04_05.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l05: [
      {"id": "v_rightwrite", "type": "video", "icon": "🎥", "title": "받침이 있는 글자 바르게 쓰기", "description": "그림에 맞는 낱말 완성·잘못 쓴 받침 고쳐 쓰기(국어활동).", "url": "https://www.youtube.com/watch?v=k5SAZX4TXUE", "video_id": "k5SAZX4TXUE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_trace", "type": "video", "icon": "🎥", "title": "받침 글자 따라 쓰기", "description": "국어활동 따라 쓰기 풀이 영상.", "url": "https://www.youtube.com/watch?v=19J5Y9OeD5g", "video_id": "19J5Y9OeD5g", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["offline_activity"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l04_05", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 4~5차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l04_05.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l06: [
      {"id": "v_ebs_b", "type": "video", "icon": "🎥", "title": "한글이 야호 — 한글동화(밥·집·탑·쌍둥이·짝짜꿍)", "description": "EBS 한글이 야호. ㅂ 받침 낱말과 쌍자음 낱말이 이어 나와요.", "url": "https://www.youtube.com/watch?v=IJ3I6Yay1rs", "video_id": "IJ3I6Yay1rs", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"]},
      {"id": "v_ebs_dd", "type": "video", "icon": "🎥", "title": "한글이 야호 — 한글공부(돼지·딱지·참외)", "description": "EBS 한글이 야호. 쌍자음 ㄸ이 든 낱말.", "url": "https://www.youtube.com/watch?v=8OJPQV7HBNM", "video_id": "8OJPQV7HBNM", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"]},
      {"id": "kd_u3_l06_07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6~7차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l06_07.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb15", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 쌍자음", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/1_문법/g1_kor_tb_15_쌍자음.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u3_l07: [
      {"id": "v_snd_diff", "type": "video", "icon": "🎥", "title": "자음자 소리의 차이 알아보기", "description": "자/차, 가/카처럼 소리가 어떻게 다른지 들어 보는 영상.", "url": "https://www.youtube.com/watch?v=oIkbCn5wyKs", "video_id": "oIkbCn5wyKs", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(2단원 재미있게 ㄱㄴㄷ) 영상 — 내용은 같아요"},
      {"id": "v_organ", "type": "video", "icon": "🎥", "title": "발음 기관 모양과 소리(노래)", "description": "입 모양·혀 자리와 자음자 소리를 노래로.", "url": "https://www.youtube.com/watch?v=9-7CmbQSdFo", "video_id": "9-7CmbQSdFo", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["cover", "concept"], "note": "2015 교육과정 판(2단원 재미있게 ㄱㄴㄷ) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l06_07", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 6~7차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l06_07.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb15", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 쌍자음", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/1_문법/g1_kor_tb_15_쌍자음.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u3_l08: [
      {"id": "v_cloud", "type": "video", "icon": "🎥", "title": "그림책 「구름 놀이」 함께 읽기", "description": "구름 모양 이야기를 교사와 함께 읽는 영상.", "url": "https://www.youtube.com/watch?v=SKLLR3iVE1g", "video_id": "SKLLR3iVE1g", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["read_aloud", "motivate"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_cloud_find", "type": "video", "icon": "🎥", "title": "「구름 놀이」에서 받침 글자 찾기", "description": "읽은 이야기에서 받침 있는 글자를 골라 보는 활동.", "url": "https://www.youtube.com/watch?v=yOvcAZZ2Y4M", "video_id": "yOvcAZZ2Y4M", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "question"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l08_09", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 8~9차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l08_09.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb49", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 그림책 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/5_문학/g1_kor_tb_49_그림책읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u3_l09: [
      {"id": "v_plas", "type": "video", "icon": "🎥", "title": "받침이 있는 글자와 낱말 읽기", "description": "배이스캠프(교육 공익 프로그램) 1학년 국어 영상.", "url": "https://www.youtube.com/watch?v=5pqJnc47Zk4", "video_id": "5pqJnc47Zk4", "source": "PLAS 배이스캠프", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "read_aloud"]},
      {"id": "v_smart_read", "type": "video", "icon": "🎥", "title": "받침이 있는 글자 읽기", "description": "받침 글자를 소리 내어 읽는 짧은 설명 영상.", "url": "https://www.youtube.com/watch?v=jMiPdGRiOjs", "video_id": "jMiPdGRiOjs", "source": "스마트올(온스쿨 수록)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["concept", "read_aloud"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l08_09", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 8~9차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l08_09.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb24", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 낱말 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_24_낱말읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u3_l10: [
      {"id": "v_mart", "type": "video", "icon": "🎥", "title": "마트 물건 이름 읽기", "description": "진열된 물건 이름을 읽고 받침 글자를 찾는 국어활동 영상.", "url": "https://www.youtube.com/watch?v=FtJExFQ_ItE", "video_id": "FtJExFQ_ItE", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_ebs_mnol", "type": "video", "icon": "🎥", "title": "한글이 야호 — 받침 한글동화(곰·밤·눈·말…)", "description": "EBS 한글이 야호. ㅁ·ㄴ·ㅇ·ㄹ 받침 낱말이 이야기로 나와요.", "url": "https://www.youtube.com/watch?v=y6R9CJxLthQ", "video_id": "y6R9CJxLthQ", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"]},
      {"id": "kd_u3_l10_11", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 10~11차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l10_11.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]},
      {"id": "kd_tb25", "type": "kedu", "icon": "🏠", "title": "자기주도 교과 밖 — 생활 속 낱말 읽기", "description": "교과서 차시와 따로 도는 케이에듀 연습 화면. 더 연습할 아이에게.", "url": "/grade1/semester1/korean/2_읽기/g1_kor_tb_25_생활속낱말읽기.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["leveled_problem", "summary"]}
    ],
    u3_l11: [
      {"id": "v_reverse", "type": "video", "icon": "🎥", "title": "거꾸로 읽어도 글자가 되는 낱말", "description": "글자 순서를 바꾸면 무엇이 달라지는지 보는 읽기 활동.", "url": "https://www.youtube.com/watch?v=9G-Z_Q_K6mY", "video_id": "9G-Z_Q_K6mY", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["motivate", "concept"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "v_cards", "type": "video", "icon": "🎥", "title": "글자 카드 놀이와 단원 정리", "description": "받침 글자 카드 놀이 후 정리 활동.", "url": "https://www.youtube.com/watch?v=cqsMAhKbcxA", "video_id": "cqsMAhKbcxA", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["offline_activity"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l10_11", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 10~11차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l10_11.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l12: [
      {"id": "v_ebs_all", "type": "video", "icon": "🎥", "title": "한글이 야호 — 기본받침·쌍자음·이중모음 총 복습", "description": "EBS 한글이 야호 복습편. 단원 마무리·기초 다지기에.", "url": "https://www.youtube.com/watch?v=aSbbf_GOIMw", "video_id": "aSbbf_GOIMw", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review", "summary"]},
      {"id": "v_cards", "type": "video", "icon": "🎥", "title": "글자 카드 놀이와 단원 정리", "description": "받침 글자 카드 놀이 후 정리 활동.", "url": "https://www.youtube.com/watch?v=cqsMAhKbcxA", "video_id": "cqsMAhKbcxA", "source": "온스쿨(교사 공개)", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review", "offline_activity"], "note": "2015 교육과정 판(6단원 받침이 있는 글자) 영상 — 내용은 같아요"},
      {"id": "kd_u3_l12_13", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 12~13차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l12_13.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ],
    u3_l13: [
      {"id": "v_ebs_b", "type": "video", "icon": "🎥", "title": "한글이 야호 — 한글동화(밥·집·탑·쌍둥이·짝짜꿍)", "description": "EBS 한글이 야호. ㅂ 받침 낱말과 쌍자음 낱말이 이어 나와요.", "url": "https://www.youtube.com/watch?v=IJ3I6Yay1rs", "video_id": "IJ3I6Yay1rs", "source": "EBS", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review", "concept"]},
      {"id": "v_plas", "type": "video", "icon": "🎥", "title": "받침이 있는 글자와 낱말 읽기", "description": "배이스캠프(교육 공익 프로그램) 1학년 국어 영상.", "url": "https://www.youtube.com/watch?v=5pqJnc47Zk4", "video_id": "5pqJnc47Zk4", "source": "PLAS 배이스캠프", "status": "확보", "verified": "2026-09-23", "fit_slides": ["review", "read_aloud"]},
      {"id": "kd_u3_l12_13", "type": "kedu", "icon": "🏠", "title": "자기주도 차시 — 12~13차시", "description": "같은 차시의 학생용 케이에듀 화면.", "url": "/grade1/semester1/korean/3단원_낱말과친해져요/g1_kor_u3_l12_13.html", "source": "케이에듀", "status": "확보", "verified": "2026-09-23", "fit_slides": ["summary", "next_lesson"]}
    ]
  };
  Object.keys(R).forEach(function (k) { R[k] = R[k].concat(COMMON); });
  window.KT_RESOURCES["g1_korean"] = Object.assign(window.KT_RESOURCES["g1_korean"] || {}, R);
})();
