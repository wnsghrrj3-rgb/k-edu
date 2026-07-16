/* ============================================================
   K-MAKER Playground 샘플 데이터  ⚠ 전부 임시(SAMPLE) 데이터.
   실서비스 템플릿(kmake/templates/docs)과 무관하며
   디자인 검토용 더미다. 실데이터 연결은 후속 단계.
   ------------------------------------------------------------
   Scene 스키마(지시서 §3): id·name·width·height·duration·
   background·elements·transition·order  (thumbnail은 요소로 대체 렌더)
   ============================================================ */
window.MK_SAMPLE = (() => {
  const t = (x, y, w, size, text, weight) => ({ kind: 'text', x, y, w, size, text, weight: weight || 400 });
  const img = (x, y, w, h, label) => ({ kind: 'image', x, y, w, h, label });

  /* 좌표는 캔버스 기준 % (디자인 검토용 단순화) */
  const TEMPLATES = [
    {
      templateId: 'smp-pres-01', styleEn: 'Modern', recent: true, uses: '수업 도입·단원 발표·학예회 소개', title: '단원 발표 (샘플)', description: '수업·발표용 기본 4장 구성',
      contentType: 'presentation', category: '발표자료', style: '모던', ratio: '16:9', difficulty: '쉬움',
      targetUser: 'teacher', gradeRange: '3-6', tags: ['수업', '발표'],
      scenes: [
        { id: 's1', name: '표지', width: 1280, height: 720, duration: 5, background: '#FFFFFF', transition: 'fade', order: 0,
          elements: [t(8, 16, 60, 13, '단원 제목이 들어갑니다', 700), t(8, 46, 55, 4.2, '부제목 · 한 줄 설명'), t(8, 82, 40, 3, '발표자 이름 · 날짜')] },
        { id: 's2', name: '목차', width: 1280, height: 720, duration: 5, background: '#FFFFFF', transition: 'fade', order: 1,
          elements: [t(8, 12, 30, 7, '목차', 700), t(8, 34, 50, 4, '1. 첫 번째 주제'), t(8, 48, 50, 4, '2. 두 번째 주제'), t(8, 62, 50, 4, '3. 세 번째 주제')] },
        { id: 's3', name: '본문', width: 1280, height: 720, duration: 6, background: '#FFFFFF', transition: 'slide', order: 2,
          elements: [t(8, 10, 50, 6.5, '본문 제목', 700), t(8, 30, 44, 3.6, '설명 문장이 들어가는 자리입니다. 두세 줄 분량.'), img(58, 26, 34, 52, '이미지 영역')] },
        { id: 's4', name: '마무리', width: 1280, height: 720, duration: 4, background: '#FFFFFF', transition: 'fade', order: 3,
          elements: [t(20, 38, 60, 9, '감사합니다', 700), t(20, 62, 60, 3.4, '질문을 받아요')] },
      ],
    },
    {
      templateId: 'smp-card-01', styleEn: 'Kids', recent: false, uses: '학급 알림·주간 소식·안내 카드', title: '학급 소식 카드 (샘플)', description: '알림·소식 3장 카드뉴스',
      contentType: 'cardnews', category: '카드뉴스', style: '소프트', ratio: '1:1',
      targetUser: 'teacher', gradeRange: '전학년', tags: ['알림', '소식'],
      scenes: [
        { id: 'c1', name: '첫 장', width: 1080, height: 1080, duration: 4, background: '#FFF7F2', transition: 'fade', order: 0,
          elements: [t(10, 14, 80, 5, 'CLASS NEWS'), t(10, 26, 80, 10, '이번 주\n우리 반 소식', 700), t(10, 74, 80, 3.6, '1학년 0반 알림 카드')] },
        { id: 'c2', name: '내용', width: 1080, height: 1080, duration: 5, background: '#FFFFFF', transition: 'slide', order: 1,
          elements: [t(10, 10, 80, 6.5, '이번 주 일정', 700), t(10, 30, 80, 3.8, '· 수요일 현장체험 동의서'), t(10, 42, 80, 3.8, '· 금요일 받아쓰기 5회'), img(10, 56, 80, 30, '사진 영역')] },
        { id: 'c3', name: '마지막 장', width: 1080, height: 1080, duration: 4, background: '#FFF7F2', transition: 'fade', order: 2,
          elements: [t(10, 40, 80, 7, '함께해 주세요!', 700), t(10, 58, 80, 3.4, '문의는 알림장으로')] },
      ],
    },
    {
      templateId: 'smp-vid-01', styleEn: 'Creative', recent: true, uses: '행사 안내·하이라이트·학급 소개 영상', title: '학교 행사 안내 영상 (샘플)', description: '사진·문구만 바꾸는 15초 안내 영상',
      contentType: 'video', category: '영상', style: '행사', ratio: '16:9', difficulty: '보통',
      targetUser: 'teacher', gradeRange: '전학년', tags: ['행사', '안내'], musicPreset: 'bright-01', animationPreset: 'fade-up',
      scenes: [
        { id: 'v1', name: '인트로', width: 1280, height: 720, duration: 3, background: '#1F2733', transition: 'fade', order: 0,
          elements: [t(14, 34, 72, 10, '행사 제목 입력', 700), img(14, 62, 30, 22, '대표 사진')] },
        { id: 'v2', name: '본문 1', width: 1280, height: 720, duration: 4, background: '#FFFFFF', transition: 'slide', order: 1,
          elements: [img(6, 14, 40, 60, '사진 1'), t(52, 22, 40, 5.5, '일시와 장소', 700), t(52, 42, 40, 3.6, '문구를 교체해 주세요')] },
        { id: 'v3', name: '본문 2', width: 1280, height: 720, duration: 5, background: '#FFFFFF', transition: 'slide', order: 2,
          elements: [img(6, 14, 28, 52, '사진 2'), img(36, 14, 28, 52, '사진 3'), img(66, 14, 28, 52, '사진 4'), t(6, 74, 88, 3.8, '설명 문구 자리')] },
        { id: 'v4', name: '엔딩', width: 1280, height: 720, duration: 3, background: '#1F2733', transition: 'fade', order: 3,
          elements: [t(20, 40, 60, 7.5, '함께해요!', 700), t(20, 62, 60, 3.2, '학교 로고 · 음악 종료')] },
      ],
    },
    {
      templateId: 'smp-post-01', styleEn: 'Magazine', recent: false, uses: '행사 포스터·게시판 부착물', title: '독서 주간 포스터 (샘플)', description: 'A4 단일 장면 포스터',
      contentType: 'poster', category: '포스터', style: '페이퍼', ratio: 'A4', difficulty: '쉬움',
      targetUser: 'teacher', gradeRange: '전학년', tags: ['독서', '행사'],
      scenes: [
        { id: 'p1', name: '단일 장면', width: 794, height: 1123, duration: 0, background: '#FAF7F0', transition: 'none', order: 0,
          elements: [t(10, 10, 80, 4, 'READING WEEK'), t(10, 20, 80, 9.5, '가을\n독서 주간', 700), img(14, 44, 72, 26, '메인 그림'), t(10, 76, 80, 3.4, '10월 13일 ~ 17일 · 도서관')] },
      ],
    },
    {
      templateId: 'smp-work-01', styleEn: 'Minimal', recent: false, uses: '받아쓰기·연산 연습·평가지', title: '받아쓰기 학습지 (샘플)', description: 'A4 학습지 머리판 + 문항',
      contentType: 'worksheet', category: '학습지', style: '에듀', ratio: 'A4',
      targetUser: 'teacher', gradeRange: '1-2', tags: ['국어', '학습'],
      scenes: [
        { id: 'w1', name: '단일 장면', width: 794, height: 1123, duration: 0, background: '#FFFFFF', transition: 'none', order: 0,
          elements: [t(8, 6, 60, 5, '받아쓰기 5회', 700), t(70, 6, 24, 2.8, '이름: ______'), t(8, 16, 84, 3, '1. ________________________'), t(8, 24, 84, 3, '2. ________________________'), t(8, 32, 84, 3, '3. ________________________')] },
      ],
    },
    {
      templateId: 'smp-thumb-01', styleEn: 'Premium', recent: false, uses: '수업 영상 표지·채널 썸네일', title: '수업 영상 썸네일 (샘플)', description: '유튜브형 썸네일',
      contentType: 'thumbnail', category: '썸네일', style: '볼드', ratio: '16:9',
      targetUser: 'student', gradeRange: '3-6', tags: ['영상', '썸네일'],
      scenes: [
        { id: 'th1', name: '단일 장면', width: 1280, height: 720, duration: 0, background: '#F5F2EA', transition: 'none', order: 0,
          elements: [t(6, 26, 64, 12, '큰 제목', 700), img(70, 18, 26, 64, '인물/사진'), t(6, 66, 50, 4, '부제 한 줄')] },
      ],
    },
  {
      templateId: 'smp-act-01', styleEn: 'Kids', recent: false, uses: '학급 이름표·자리 배치·사물함', title: '학급 이름표 세트 (샘플)', description: '이름표 2장 구성 활동자료',
      contentType: 'activity', category: '활동자료', style: '에듀', ratio: '4:3', difficulty: '쉬움',
      targetUser: 'teacher', gradeRange: '1-2', tags: ['이름표', '학급운영'],
      scenes: [
        { id: 'a1', name: '이름표 A', width: 800, height: 600, duration: 0, background: '#E3F1EE', transition: 'none', order: 0,
          elements: [t(12, 18, 76, 8, '이름', 700), t(12, 52, 76, 4.5, '1학년 0반'), img(70, 12, 20, 26, '아이콘')] },
        { id: 'a2', name: '이름표 B', width: 800, height: 600, duration: 0, background: '#FBE9E4', transition: 'none', order: 1,
          elements: [t(12, 18, 76, 8, '이름', 700), t(12, 52, 76, 4.5, '내가 좋아하는 것'), img(70, 12, 20, 26, '아이콘')] },
      ],
    },
    {
      templateId: 'smp-sns-01', styleEn: 'Modern', recent: false, uses: '학급 밴드·알림장 공지·행사 후기', title: '학급 SNS 공지 (샘플)', description: '밴드·SNS용 정방형 2장',
      contentType: 'sns', category: 'SNS', style: '모던', ratio: '1:1', difficulty: '쉬움',
      targetUser: 'teacher', gradeRange: '전학년', tags: ['SNS', '공지'],
      scenes: [
        { id: 'n1', name: '공지', width: 1080, height: 1080, duration: 4, background: '#1F2733', transition: 'fade', order: 0,
          elements: [t(10, 16, 80, 4, 'NOTICE'), t(10, 30, 80, 9, '알려드립니다', 700), t(10, 70, 80, 3.6, '자세한 내용은 알림장을 확인해 주세요')] },
        { id: 'n2', name: '내용', width: 1080, height: 1080, duration: 5, background: '#FFFFFF', transition: 'slide', order: 1,
          elements: [t(10, 12, 80, 6, '이번 주 안내', 700), t(10, 32, 80, 3.8, '· 준비물을 확인해 주세요'), img(10, 50, 80, 36, '사진 영역')] },
      ],
    },
  ];

  /* 제작 유형 (Home) — §4 */
  const TYPES = [
    { key: 'presentation', name: '발표자료', ico: '🖥', desc: '수업·발표 슬라이드' },
    { key: 'video', name: '영상', ico: '🎬', desc: '안내·행사 영상' },
    { key: 'worksheet', name: '학습지', ico: '📝', desc: '활동지·평가지' },
    { key: 'poster', name: '포스터', ico: '🪧', desc: '안내문·행사' },
    { key: 'cardnews', name: '카드뉴스', ico: '🗂', desc: '알림·정리 카드' },
    { key: 'thumbnail', name: '썸네일', ico: '🖼', desc: '영상 표지' },
    { key: 'sns', name: 'SNS 콘텐츠', ico: '💬', desc: '학급 SNS·밴드' },
    { key: 'activity', name: '활동자료', ico: '✂️', desc: '이름표·상장·쿠폰' },
    { key: 'ai', name: 'AI로 만들기', ico: '✨', desc: '설명하면 AI가 구성' },
  ];

  const STYLES = ['전체', '모던', '소프트', '에듀', '페이퍼', '볼드', '행사'];

  return { TEMPLATES, TYPES, STYLES };
})();
