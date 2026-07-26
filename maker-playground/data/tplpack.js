/* ============================================================
   K-MAKER 실전 템플릿 팩 v1 (R42) — window.MK_TPLPACK
   ------------------------------------------------------------
   · MK_TPL.register() 확장점으로 등록 — sample.js 무수정 (add-only)
   · 렌더러 실지원 표현력만 사용: color·align·tracking·radius(원)·
     rot·chart(bar/pie)·table·el.anim(9종)·transition·scene.music
   · 원칙: 팔레트 1템플릿 1계열 · 타이포 3단(제목/본문/캡션) ·
     여백 우선 · 아동틱 금지 · "여는 순간 완성, 글자만 교체"
   ============================================================ */
window.MK_TPLPACK = (() => {
  'use strict';

  /* ---------- 요소 헬퍼 ---------- */
  const t = (x, y, w, size, text, o = {}) => ({ kind: 'text', x, y, w, size, text, weight: o.weight || 400, ...(o.color ? { color: o.color } : {}), ...(o.align ? { align: o.align } : {}), ...(o.tracking ? { tracking: o.tracking } : {}), ...(o.anim ? { anim: o.anim } : {}) });
  const box = (x, y, w, h, fill, o = {}) => ({ kind: 'image', x, y, w, h, label: '', fill, ...(o.radius ? { radius: o.radius } : {}), ...(o.rot ? { rot: o.rot } : {}), ...(o.anim ? { anim: o.anim } : {}) });
  const img = (x, y, w, h, label, o = {}) => ({ kind: 'image', x, y, w, h, label, ...(o.radius ? { radius: o.radius } : {}), ...(o.anim ? { anim: o.anim } : {}) });
  const A = (preset, delay, o = {}) => ({ preset, delay, duration: o.duration || 0.55, direction: o.direction || 'up', ease: o.ease || 'ease-out', repeat: 1 });
  const chip = (x, y, d, fill, num, numColor) => [box(x, y, d, d * (16 / 9), fill, { radius: 999 }), t(x, y + d * (16 / 9) * 0.22, d, d * (16 / 9) * 0.52, String(num), { weight: 800, align: 'center', color: numColor })];

  /* ============================================================
     TP-01 발표자료 · 「개념 한 장 수업」 16:9 · 딥 포레스트
     ============================================================ */
  const P1 = { deep: '#2F6B54', tint: '#EAF2EE', tint2: '#DDEAE3', ink: '#22302B', sub: '#5C6B63', point: '#D97757', paper: '#F7F6F2' };
  const presDeep = {
    templateId: 'pk-pres-01', title: '개념 한 장 수업', description: '도입 질문→목표→개념→데이터→정리, 40분 수업의 뼈대 5장',
    contentType: 'presentation', category: '발표자료', style: '딥 포레스트', styleEn: 'Calm', ratio: '16:9', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '3-6', uses: '단원 도입·개념 수업·공개수업', tags: ['수업', '개념', '발표'], recent: true,
    scenes: [
      { id: 'p1', name: '표지', width: 1280, height: 720, duration: 5, background: P1.paper, transition: 'fade', order: 0,
        elements: [
          box(0, 0, 38, 100, P1.deep),
          box(4.6, 12, 5.5, 1.1, P1.point, { anim: A('wipe', 0.1, { direction: 'right' }) }),
          t(4.6, 20, 30, 9.5, '단원명을\n입력하세요', { weight: 800, color: '#FFFFFF', tracking: -0.01, anim: A('fade', 0.25) }),
          t(4.6, 58, 28, 3.0, '학년 · 과목 · 차시', { color: '#CBDDD4', anim: A('fade', 0.45) }),
          t(4.6, 88, 28, 2.4, '이름 · 날짜', { color: '#9DB8AC' }),
          t(44, 16, 44, 3.2, '오늘의 질문', { weight: 700, color: P1.deep, tracking: 0.12, anim: A('fade', 0.5) }),
          t(44, 26, 50, 6.2, '궁금한 것을 큰 질문으로\n바꿔 써 보세요', { weight: 700, color: P1.ink, anim: A('slide', 0.65, { direction: 'up' }) }),
          box(44, 52, 7, 1.1, P1.deep),
          t(44, 60, 48, 2.9, '아래 세 갈래로 답을 찾아갑니다', { color: P1.sub, anim: A('fade', 0.85) }),
          ...chip(44, 70, 4.4, P1.tint2, 1, P1.deep), t(51, 72.4, 14, 2.7, '관찰하기', { weight: 600, color: P1.ink }),
          ...chip(61, 70, 4.4, P1.tint2, 2, P1.deep), t(68, 72.4, 14, 2.7, '실험하기', { weight: 600, color: P1.ink }),
          ...chip(78, 70, 4.4, P1.tint2, 3, P1.deep), t(85, 72.4, 12, 2.7, '정리하기', { weight: 600, color: P1.ink }),
        ] },
      { id: 'p2', name: '배움 목표', width: 1280, height: 720, duration: 5, background: '#FFFFFF', transition: 'fade', order: 1,
        elements: [
          box(8, 12, 12.5, 6, P1.tint), t(9.6, 13.7, 10, 2.6, '배움 목표', { weight: 700, color: P1.deep }),
          t(8, 25, 70, 6.4, '이 시간이 끝나면\n무엇을 할 수 있게 될까요?', { weight: 700, color: P1.ink, anim: A('fade', 0.15) }),
          box(8, 50, 84, 11, P1.tint, { anim: A('slide', 0.35, { direction: 'up' }) }),
          t(11, 53.2, 4, 4.2, '1', { weight: 800, color: P1.deep }), t(17, 54.2, 72, 3.0, '핵심 개념을 내 말로 설명할 수 있어요', { weight: 600, color: P1.ink }),
          box(8, 64, 84, 11, P1.tint, { anim: A('slide', 0.5, { direction: 'up' }) }),
          t(11, 67.2, 4, 4.2, '2', { weight: 800, color: P1.deep }), t(17, 68.2, 72, 3.0, '생활 속 예를 두 가지 찾을 수 있어요', { weight: 600, color: P1.ink }),
          box(8, 78, 84, 11, P1.tint, { anim: A('slide', 0.65, { direction: 'up' }) }),
          t(11, 81.2, 4, 4.2, '3', { weight: 800, color: P1.deep }), t(17, 82.2, 72, 3.0, '배운 것을 그림 한 장으로 정리할 수 있어요', { weight: 600, color: P1.ink }),
        ] },
      { id: 'p3', name: '핵심 개념', width: 1280, height: 720, duration: 6, background: '#FFFFFF', transition: 'slide', order: 2,
        elements: [
          box(8, 12, 12.5, 6, P1.tint), t(9.6, 13.7, 10, 2.6, '핵심 개념', { weight: 700, color: P1.deep }),
          t(8, 24, 46, 6.8, '개념 이름', { weight: 800, color: P1.ink, anim: A('fade', 0.1) }),
          box(8, 36, 7, 1.1, P1.point),
          t(8, 42, 44, 3.2, '개념을 두 줄로 풀어 쓰세요.\n짧을수록 오래 남습니다.', { color: P1.sub, anim: A('fade', 0.3) }),
          t(8, 62, 44, 2.8, '예) 생활 속 예시 하나 · 교실 속 예시 하나', { color: P1.deep, weight: 600, anim: A('fade', 0.5) }),
          img(56, 16, 36, 62, '개념 사진 · 실험 장면', { radius: 14, anim: A('scale', 0.4) }),
          t(56, 82, 36, 2.2, '사진 출처를 적어 주세요', { color: P1.sub, align: 'center' }),
        ] },
      { id: 'p4', name: '데이터로 보기', width: 1280, height: 720, duration: 6, background: P1.paper, transition: 'slide', order: 3,
        elements: [
          box(8, 12, 15, 6, P1.tint2), t(9.6, 13.7, 12, 2.6, '데이터로 보기', { weight: 700, color: P1.deep }),
          { kind: 'chart', x: 8, y: 26, w: 50, h: 56, chartType: 'bar', title: '우리 반 관찰 결과', accent: P1.deep,
            series: [{ k: '월', v: 3 }, { k: '화', v: 5 }, { k: '수', v: 6 }, { k: '목', v: 8 }, { k: '금', v: 11 }], anim: A('fade', 0.3) },
          t(64, 30, 28, 4.4, '숫자가 말해 주는 것', { weight: 700, color: P1.ink, anim: A('fade', 0.45) }),
          t(64, 46, 28, 2.9, '그래프에서 찾은 변화를\n한 문장으로 써 보세요', { color: P1.sub, anim: A('fade', 0.6) }),
          box(64, 62, 28, 12, '#FFFFFF', { anim: A('slide', 0.75, { direction: 'up' }) }),
          t(66, 65.4, 24, 2.8, '“                              ”', { color: P1.point, weight: 600 }),
        ] },
      { id: 'p5', name: '정리', width: 1280, height: 720, duration: 4, background: '#1E3A2E', transition: 'fade', order: 4,
        elements: [
          box(20, 30, 7, 1.2, P1.point, { anim: A('wipe', 0.1, { direction: 'right' }) }),
          t(20, 37, 60, 8.4, '오늘 기억할 한 문장', { weight: 800, color: '#FFFFFF', anim: A('fade', 0.3) }),
          t(20, 58, 60, 3.2, '학생들 말로 완성해 보세요\n다음 시간 예고 한 줄', { color: '#BCD3C7', anim: A('fade', 0.55) }),
          t(20, 84, 60, 2.3, '수고했어요 · 다음 차시에 만나요', { color: '#7FA491' }),
        ] },
    ],
  };

  /* ============================================================
     TP-02 카드뉴스 · 「학부모 안내 · 미드나잇」 1:1
     ============================================================ */
  const P2 = { bg: '#182230', card: '#20304354', ink: '#F1F5F9', mint: '#7FB4A6', mut: '#9DB0C4', line: '#2C3B4F' };
  const cardMid = {
    templateId: 'pk-card-01', title: '학부모 안내 · 미드나잇', description: '가정통신을 카드 4장으로 — 일정 표·준비물까지',
    contentType: 'cardnews', category: '카드뉴스', style: '미드나잇', styleEn: 'Night', ratio: '1:1', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '전학년', uses: '행사 안내·주간 소식·준비물 공지', tags: ['안내', '학부모', '소식'], recent: true,
    scenes: [
      { id: 'c1', name: '커버', width: 1080, height: 1080, duration: 4, background: P2.bg, transition: 'fade', order: 0,
        elements: [
          t(10, 13, 80, 2.6, 'CLASS LETTER', { color: P2.mint, tracking: 0.32, weight: 600 }),
          box(10, 20, 8, 0.5, P2.mint),
          t(10, 30, 80, 8.6, '행사 이름을\n여기에 쓰세요', { weight: 800, color: P2.ink, anim: A('fade', 0.2) }),
          t(10, 62, 80, 3.0, '날짜 · 장소 한 줄 요약', { color: P2.mut, anim: A('fade', 0.4) }),
          t(10, 86, 80, 2.3, '0학년 0반 · 담임 000', { color: P2.mut }),
          box(84, 80, 6, 6, '#22344A', { radius: 999 }), t(84, 81.6, 6, 2.6, '→', { align: 'center', color: P2.mint, weight: 700 }),
        ] },
      { id: 'c2', name: '일정', width: 1080, height: 1080, duration: 5, background: P2.bg, transition: 'slide', order: 1,
        elements: [
          t(10, 10, 60, 4.6, '일정 한눈에', { weight: 800, color: P2.ink }),
          { kind: 'table', x: 10, y: 22, w: 80, h: 52, title: '', cols: ['시간', '내용'],
            rows: [['09:00', '등교 · 모둠 자리 확인'], ['09:30', '1부 — 활동 · 발표'], ['11:00', '2부 — 참관 · 상담'], ['12:00', '마침 · 하교']], anim: A('fade', 0.25) },
          t(10, 82, 80, 2.5, '시간은 사정에 따라 조금 달라질 수 있어요', { color: P2.mut }),
        ] },
      { id: 'c3', name: '준비물', width: 1080, height: 1080, duration: 5, background: P2.bg, transition: 'slide', order: 2,
        elements: [
          t(10, 10, 60, 4.6, '준비해 주세요', { weight: 800, color: P2.ink }),
          box(10, 24, 3.4, 3.4, P2.mint, { radius: 999, anim: A('pop', 0.2) }), t(16.5, 24.5, 72, 3.1, '실내화 · 물통', { color: P2.ink, weight: 600, anim: A('fade', 0.25) }),
          box(10, 36, 3.4, 3.4, P2.mint, { radius: 999, anim: A('pop', 0.35) }), t(16.5, 36.5, 72, 3.1, '동의서 (알림장 참고)', { color: P2.ink, weight: 600, anim: A('fade', 0.4) }),
          box(10, 48, 3.4, 3.4, P2.mint, { radius: 999, anim: A('pop', 0.5) }), t(16.5, 48.5, 72, 3.1, '간편한 복장', { color: P2.ink, weight: 600, anim: A('fade', 0.55) }),
          box(10, 64, 80, 20, '#203043'),
          t(13, 68, 74, 2.7, 'TIP', { color: P2.mint, weight: 700, tracking: 0.2 }),
          t(13, 73.5, 74, 2.7, '당일 주차가 어려워요 — 대중교통을 권해요', { color: P2.mut }),
        ] },
      { id: 'c4', name: '마무리', width: 1080, height: 1080, duration: 4, background: P2.bg, transition: 'fade', order: 3,
        elements: [
          box(10, 40, 8, 0.5, P2.mint),
          t(10, 46, 80, 6.4, '함께해 주셔서\n감사합니다', { weight: 800, color: P2.ink, anim: A('fade', 0.2) }),
          t(10, 70, 80, 2.8, '궁금한 점은 알림장·전화로 문의해 주세요', { color: P2.mut, anim: A('fade', 0.4) }),
        ] },
    ],
  };

  /* ============================================================
     TP-03 영상 · 「행사 하이라이트 15초」 16:9 · 비트
     ============================================================ */
  const P3 = { dark: '#151B26', yellow: '#FFD166', ink: '#F5F7FA', mut: '#8E9AAC' };
  const vidBeat = {
    templateId: 'pk-vid-01', title: '행사 하이라이트 15초', description: '사진 2장·문구 4개만 바꾸면 끝 — 배경음 포함 15초',
    contentType: 'video', category: '영상', style: '비트', styleEn: 'Punch', ratio: '16:9', difficulty: '보통',
    targetUser: 'teacher', gradeRange: '전학년', uses: '행사 예고·하이라이트·학급 소개', tags: ['영상', '행사', '하이라이트'], recent: true,
    musicPreset: 'beat', animationPreset: 'pop',
    scenes: [
      { id: 'v1', name: '타이틀', width: 1280, height: 720, duration: 3, background: P3.dark, transition: 'fade', order: 0, music: { name: '신나는 비트', synth: 'beat' },
        elements: [
          box(0, 84, 100, 16, P3.yellow, { anim: A('wipe', 0.1, { direction: 'right', duration: 0.5 }) }),
          t(10, 30, 80, 11, '행사 이름', { weight: 800, color: P3.ink, align: 'center', tracking: -0.01, anim: A('pop', 0.2, { duration: 0.6 }) }),
          t(10, 55, 80, 3.4, '한 줄 소개를 쓰세요', { color: P3.mut, align: 'center', anim: A('fade', 0.55) }),
          t(10, 87.5, 80, 3.6, '이번 주 금요일 · 강당', { weight: 800, color: '#1F2733', align: 'center', anim: A('slide', 0.5, { direction: 'up' }) }),
        ] },
      { id: 'v2', name: '장면 1', width: 1280, height: 720, duration: 4, background: '#FFFFFF', transition: 'slide', order: 1, music: { name: '신나는 비트', synth: 'beat' },
        elements: [
          img(0, 0, 62, 100, '현장 사진 1', { anim: A('fade', 0.05, { duration: 0.5 }) }),
          box(66, 30, 6, 1.2, P3.yellow, { anim: A('wipe', 0.3, { direction: 'right' }) }),
          t(66, 37, 30, 5.4, '순간 하나', { weight: 800, color: '#1F2733', anim: A('slide', 0.45, { direction: 'up' }) }),
          t(66, 52, 30, 2.9, '사진이 말하게 두고\n글은 짧게', { color: '#525C6A', anim: A('fade', 0.65) }),
        ] },
      { id: 'v3', name: '장면 2', width: 1280, height: 720, duration: 4, background: '#FFFFFF', transition: 'slide', order: 2, music: { name: '신나는 비트', synth: 'beat' },
        elements: [
          img(38, 0, 62, 100, '현장 사진 2', { anim: A('fade', 0.05, { duration: 0.5 }) }),
          box(6, 30, 6, 1.2, P3.yellow, { anim: A('wipe', 0.3, { direction: 'right' }) }),
          t(6, 37, 28, 5.4, '순간 둘', { weight: 800, color: '#1F2733', anim: A('slide', 0.45, { direction: 'up' }) }),
          t(6, 52, 28, 2.9, '두 번째 자랑거리를\n한 줄로', { color: '#525C6A', anim: A('fade', 0.65) }),
        ] },
      { id: 'v4', name: '엔딩', width: 1280, height: 720, duration: 4, background: P3.dark, transition: 'fade', order: 3, music: { name: '신나는 비트', synth: 'beat' },
        elements: [
          t(10, 34, 80, 7.6, '함께 만들어요', { weight: 800, color: P3.ink, align: 'center', anim: A('zoom', 0.15, { duration: 0.6 }) }),
          box(46, 52, 8, 1.2, P3.yellow, { anim: A('wipe', 0.5, { direction: 'right' }) }),
          t(10, 60, 80, 3.0, '날짜 · 장소 · 문의를 여기에', { color: P3.mut, align: 'center', anim: A('fade', 0.7) }),
        ] },
    ],
  };

  /* ============================================================
     TP-04 포스터 · 「행사 포스터 · 페이퍼」 3:4 · 인쇄
     ============================================================ */
  const P4 = { paper: '#F8F3E9', ink: '#2B2620', brick: '#C4573F', sand: '#E9DFCB', mut: '#8A7A55' };
  const postPaper = {
    templateId: 'pk-post-01', title: '행사 포스터 · 페이퍼', description: '복도에 붙이는 인쇄 포스터 — 큰 제목·일시 블록·안내 표',
    contentType: 'poster', category: '포스터', style: '페이퍼', styleEn: 'Paper', ratio: '3:4', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '전학년', uses: '행사 안내·모집·전시 알림', tags: ['포스터', '인쇄', '안내'],
    scenes: [
      { id: 'po1', name: '포스터', width: 960, height: 1280, duration: 5, background: P4.paper, transition: 'none', order: 0,
        elements: [
          box(8, 6, 84, 0.35, P4.ink),
          t(8, 8.6, 84, 1.7, '제00회 · 우리 학교', { color: P4.mut, align: 'center', tracking: 0.22 }),
          t(8, 16, 84, 8.2, '행사 이름을\n크게 쓰세요', { weight: 800, color: P4.ink, align: 'center', tracking: -0.01 }),
          box(44, 36.5, 12, 0.5, P4.brick),
          t(8, 40.5, 84, 2.0, '한 줄 초대 문구 — 누구나 환영해요', { color: P4.mut, align: 'center' }),
          img(14, 46, 72, 26, '대표 사진 · 포스터 그림', { radius: 10 }),
          { kind: 'table', x: 14, y: 76, w: 72, h: 14, title: '', cols: ['안내', ''],
            rows: [['일시', '0월 0일 (금) 10:00'], ['장소', '본관 1층 강당'], ['문의', '교무실 · 000-0000']] },
          box(8, 93.5, 84, 0.35, P4.ink),
          t(8, 95.2, 84, 1.6, '00초등학교', { color: P4.mut, align: 'center', tracking: 0.3 }),
        ] },
    ],
  };

  /* ============================================================
     TP-05 학습지 · 「탐구 학습지 A4」 인쇄 2면
     ============================================================ */
  const P5 = { ink: '#1F2733', mut: '#525C6A', line: '#E4E7EC', tint: '#EEF3F1', green: '#2F6B54' };
  const workA4 = {
    templateId: 'pk-work-01', title: '탐구 학습지 A4', description: '이름칸·문항 3개·정리칸 — 인쇄해서 바로 쓰는 2면',
    contentType: 'worksheet', category: '학습지', style: '클린', styleEn: 'Clean', ratio: 'A4', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '3-6', uses: '탐구 활동·수업 정리·형성평가', tags: ['학습지', '인쇄', '탐구'],
    scenes: [
      { id: 'w1', name: '1면 · 탐구', width: 1240, height: 1754, duration: 5, background: '#FFFFFF', transition: 'none', order: 0,
        elements: [
          box(7, 4.5, 86, 0.22, P5.ink),
          t(7, 6, 50, 2.6, '탐구 학습지', { weight: 800, color: P5.ink }),
          t(7, 9.2, 50, 1.5, '단원 · 차시명을 쓰세요', { color: P5.mut }),
          { kind: 'table', x: 58, y: 5.8, w: 35, h: 5.5, title: '', cols: ['', ''], rows: [['학년 반', ''], ['이름', '']] },
          box(7, 14, 86, 0.12, P5.line),
          box(7, 17, 3, 3 * (1240 / 1754) * (1754 / 1240), P5.green, { radius: 999 }), t(7, 17.6, 3, 1.6, '1', { weight: 800, align: 'center', color: '#FFFFFF' }),
          t(12, 17.7, 81, 1.9, '오늘의 질문을 내 말로 다시 써 보세요.', { weight: 600, color: P5.ink }),
          box(7, 21.5, 86, 8, P5.tint),
          box(7, 33, 3, 3, P5.green, { radius: 999 }), t(7, 33.6, 3, 1.6, '2', { weight: 800, align: 'center', color: '#FFFFFF' }),
          t(12, 33.7, 81, 1.9, '관찰한 것을 그림과 글로 기록해 보세요.', { weight: 600, color: P5.ink }),
          box(7, 37.5, 42, 26, P5.tint), t(8.5, 39, 20, 1.4, '그림', { color: P5.mut }),
          box(51, 37.5, 42, 26, P5.tint), t(52.5, 39, 20, 1.4, '글', { color: P5.mut }),
          box(7, 67, 3, 3, P5.green, { radius: 999 }), t(7, 67.6, 3, 1.6, '3', { weight: 800, align: 'center', color: '#FFFFFF' }),
          t(12, 67.7, 81, 1.9, '왜 그렇게 되었을까요? 까닭을 적어 보세요.', { weight: 600, color: P5.ink }),
          box(7, 71.5, 86, 10, P5.tint),
          t(7, 95.5, 86, 1.3, '스스로 배움 · K-MAKER 학습지', { color: P5.mut, align: 'center', tracking: 0.2 }),
        ] },
      { id: 'w2', name: '2면 · 정리', width: 1240, height: 1754, duration: 5, background: '#FFFFFF', transition: 'none', order: 1,
        elements: [
          box(7, 4.5, 86, 0.22, P5.ink),
          t(7, 6, 60, 2.4, '배움 정리', { weight: 800, color: P5.ink }),
          t(7, 11, 86, 1.8, '오늘 배운 것을 한 문장으로 쓰면?', { weight: 600, color: P5.ink }),
          box(7, 14.5, 86, 7, P5.tint),
          t(7, 25, 86, 1.8, '더 알아보고 싶은 것은?', { weight: 600, color: P5.ink }),
          box(7, 28.5, 86, 7, P5.tint),
          t(7, 39, 86, 1.8, '스스로 평가 — 해당 칸에 ○ 하세요', { weight: 600, color: P5.ink }),
          { kind: 'table', x: 7, y: 43, w: 86, h: 12, title: '', cols: ['오늘의 나', '잘함', '보통', '노력'],
            rows: [['개념을 설명할 수 있어요', '', '', ''], ['모둠 활동에 참여했어요', '', '', ''], ['기록을 끝까지 했어요', '', '', '']] },
          t(7, 60, 86, 1.8, '선생님 한마디', { weight: 600, color: P5.ink }),
          box(7, 63.5, 86, 8, P5.tint),
          t(7, 95.5, 86, 1.3, '수고했어요!', { color: P5.mut, align: 'center' }),
        ] },
    ],
  };

  /* ============================================================
     TP-06 썸네일 · 「수업 영상 썸네일」 16:9 · 볼드
     ============================================================ */
  const thumbBold = {
    templateId: 'pk-thumb-01', title: '수업 영상 썸네일', description: '8자 이내 큰 제목 — 멀리서도 읽히는 대비',
    contentType: 'thumbnail', category: '썸네일', style: '볼드', styleEn: 'Bold', ratio: '16:9', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '전학년', uses: '수업 영상·유튜브·온라인 클래스', tags: ['썸네일', '영상'],
    scenes: [
      { id: 'th1', name: '썸네일', width: 1280, height: 720, duration: 4, background: '#151B26', transition: 'none', order: 0,
        elements: [
          box(0, 0, 40, 100, '#FFD166'),
          t(5, 14, 30, 3.2, '4학년 과학', { weight: 800, color: '#1F2733', tracking: 0.06 }),
          t(5, 24, 32, 13, '물의\n여행', { weight: 800, color: '#1F2733', tracking: -0.01 }),
          box(5, 78, 20, 7, '#1F2733'), t(5, 79.8, 20, 3.2, '3차시', { weight: 800, color: '#FFD166', align: 'center' }),
          img(46, 12, 48, 76, '수업 대표 사진', { radius: 12 }),
          t(46, 91, 48, 2.6, '핵심 미리보기 한 줄', { color: '#8E9AAC' }),
        ] },
    ],
  };

  /* ============================================================
     TP-07 활동자료 · 「모둠 활동판」 16:9 3장
     ============================================================ */
  const P7 = { ink: '#22302B', a: '#EAF2EE', b: '#F5EFE2', c: '#EFE7F1', d: '#E7EEF6', da: '#2F6B54', db: '#8A7A55', dc: '#7A5B86', dd: '#4A6B96', mut: '#5C6B63' };
  const actBoard = {
    templateId: 'pk-act-01', title: '모둠 활동판', description: '역할 4분면·활동 순서·발표 규칙 — TV에 띄우는 진행판 3장',
    contentType: 'activity', category: '활동자료', style: '보드', styleEn: 'Board', ratio: '16:9', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '1-6', uses: '모둠 활동·프로젝트·역할 정하기', tags: ['활동', '모둠', '진행'],
    scenes: [
      { id: 'a1', name: '역할판', width: 1280, height: 720, duration: 6, background: '#FFFFFF', transition: 'fade', order: 0,
        elements: [
          t(8, 8, 60, 5.2, '오늘의 모둠 역할', { weight: 800, color: P7.ink }),
          box(8, 22, 41, 34, P7.a, { anim: A('fade', 0.1) }), t(11, 26, 20, 3.4, '이끔이', { weight: 800, color: P7.da }), t(11, 36, 35, 2.5, '순서를 챙기고 목소리를 모아요', { color: P7.mut }),
          box(51, 22, 41, 34, P7.b, { anim: A('fade', 0.25) }), t(54, 26, 20, 3.4, '기록이', { weight: 800, color: P7.db }), t(54, 36, 35, 2.5, '나온 생각을 활동지에 적어요', { color: P7.mut }),
          box(8, 58, 41, 34, P7.c, { anim: A('fade', 0.4) }), t(11, 62, 20, 3.4, '지킴이', { weight: 800, color: P7.dc }), t(11, 72, 35, 2.5, '시간과 약속을 지켜요', { color: P7.mut }),
          box(51, 58, 41, 34, P7.d, { anim: A('fade', 0.55) }), t(54, 62, 22, 3.4, '나눔이', { weight: 800, color: P7.dd }), t(54, 72, 35, 2.5, '준비물을 나누고 정리해요', { color: P7.mut }),
        ] },
      { id: 'a2', name: '활동 순서', width: 1280, height: 720, duration: 6, background: '#FFFFFF', transition: 'slide', order: 1,
        elements: [
          t(8, 8, 60, 5.2, '활동 순서', { weight: 800, color: P7.ink }),
          { kind: 'table', x: 8, y: 22, w: 56, h: 60, title: '', cols: ['단계', '할 일 · 시간'],
            rows: [['1', '역할 정하기 — 2분'], ['2', '생각 모으기 — 5분'], ['3', '정리하기 — 5분'], ['4', '발표 준비 — 3분']], anim: A('fade', 0.2) },
          box(68, 22, 24, 24, P7.a, { radius: 18, anim: A('pop', 0.4) }),
          t(68, 28, 24, 7.5, '15분', { weight: 800, color: P7.da, align: 'center' }),
          t(68, 40, 24, 2.4, '전체 활동 시간', { color: P7.mut, align: 'center' }),
          t(68, 56, 24, 2.6, '타이머는 화면 오른쪽 위!\n다 되면 손 머리 위로', { color: P7.mut, align: 'center', anim: A('fade', 0.6) }),
        ] },
      { id: 'a3', name: '발표 규칙', width: 1280, height: 720, duration: 5, background: P7.a, transition: 'fade', order: 2,
        elements: [
          t(8, 10, 70, 5.2, '발표할 때 약속', { weight: 800, color: P7.ink }),
          box(8, 26, 3.6, 3.6 * (16 / 9), P7.da, { radius: 999, anim: A('pop', 0.15) }), t(14, 28.6, 74, 3.0, '발표하는 친구를 바라봐요', { weight: 600, color: P7.ink, anim: A('fade', 0.2) }),
          box(8, 42, 3.6, 3.6 * (16 / 9), P7.da, { radius: 999, anim: A('pop', 0.3) }), t(14, 44.6, 74, 3.0, '끝나면 박수 — 질문은 한 가지씩', { weight: 600, color: P7.ink, anim: A('fade', 0.35) }),
          box(8, 58, 3.6, 3.6 * (16 / 9), P7.da, { radius: 999, anim: A('pop', 0.45) }), t(14, 60.6, 74, 3.0, '“좋은 점 하나 + 궁금한 점 하나”', { weight: 600, color: P7.ink, anim: A('fade', 0.5) }),
        ] },
    ],
  };

  /* ============================================================
     TP-08 SNS · 「학급 계정 소식」 4:5 3장
     ============================================================ */
  const P8 = { cream: '#FBF7F0', ink: '#2B2A26', coral: '#D97757', mut: '#8B8578' };
  const snsFeed = {
    templateId: 'pk-sns-01', title: '학급 계정 소식', description: '피드용 4:5 — 커버·사진·엔딩 3장 세트',
    contentType: 'sns', category: 'SNS', style: '크림', styleEn: 'Warm', ratio: '4:5', difficulty: '쉬움',
    targetUser: 'teacher', gradeRange: '전학년', uses: '학급 SNS·활동 공유·주간 회고', tags: ['SNS', '피드', '공유'],
    scenes: [
      { id: 's1', name: '커버', width: 1080, height: 1350, duration: 4, background: P8.cream, transition: 'fade', order: 0,
        elements: [
          t(10, 12, 80, 2.2, 'OUR CLASS · WEEKLY', { color: P8.coral, tracking: 0.3, weight: 600 }),
          t(10, 22, 80, 7.4, '이번 주\n우리 반 이야기', { weight: 800, color: P8.ink, anim: A('fade', 0.2) }),
          box(10, 44, 9, 0.6, P8.coral),
          img(10, 52, 80, 34, '이번 주 대표 사진', { radius: 16, anim: A('scale', 0.35) }),
          t(10, 91, 80, 2.1, '@class_account · 0월 0주', { color: P8.mut }),
        ] },
      { id: 's2', name: '사진 카드', width: 1080, height: 1350, duration: 4, background: '#FFFFFF', transition: 'slide', order: 1,
        elements: [
          img(0, 0, 100, 66, '활동 사진 (꽉 채움)', { anim: A('fade', 0.05) }),
          t(10, 72, 80, 4.6, '순간의 제목', { weight: 800, color: P8.ink, anim: A('slide', 0.3, { direction: 'up' }) }),
          t(10, 82, 80, 2.6, '무슨 활동이었는지, 아이들이 뭐라고 했는지\n두 줄이면 충분해요', { color: P8.mut, anim: A('fade', 0.5) }),
        ] },
      { id: 's3', name: '엔딩', width: 1080, height: 1350, duration: 4, background: P8.cream, transition: 'fade', order: 2,
        elements: [
          box(10, 40, 9, 0.6, P8.coral, { anim: A('wipe', 0.1, { direction: 'right' }) }),
          t(10, 46, 80, 5.8, '다음 주에 또 만나요', { weight: 800, color: P8.ink, anim: A('fade', 0.3) }),
          t(10, 60, 80, 2.5, '좋아요·팔로우는 아이들에게 큰 응원이 돼요', { color: P8.mut, anim: A('fade', 0.5) }),
        ] },
    ],
  };

  /* ---------- 등록 (MK_TPL.register 확장점 — 정식 경로) ---------- */
  const PACK = [presDeep, cardMid, vidBeat, postPaper, workA4, thumbBold, actBoard, snsFeed];
  const OVERLAYS = {
    'pk-pres-01':  { styleId: 'st-edu',   animationId: 'an-seq',   assetIds: [], ai: { recommended: true,  tags: ['수업', '개념', '발표'], hints: ['표지 질문만 바꿔도 수업이 서요', '데이터 장은 차트 숫자만 교체'] } },
    'pk-card-01':  { styleId: 'st-modern', animationId: 'an-slide', assetIds: [], ai: { recommended: true,  tags: ['안내', '학부모'], hints: ['일정 표 행을 추가·삭제해 맞추세요'] } },
    'pk-vid-01':   { styleId: 'st-bold',  animationId: 'an-pop',   assetIds: [], ai: { recommended: true,  tags: ['영상', '행사'], hints: ['사진 2장 + 문구 4개면 완성', '내보내기 → MP4 (소리 포함)'] } },
    'pk-post-01':  { styleId: 'st-paper', animationId: 'an-none',  assetIds: [], ai: { recommended: false, tags: ['포스터', '인쇄'], hints: ['내보내기 → PDF로 인쇄하세요'] } },
    'pk-work-01':  { styleId: 'st-edu',   animationId: 'an-none',  assetIds: [], ai: { recommended: true,  tags: ['학습지', '인쇄'], hints: ['문항 텍스트만 바꾸면 어느 과목에도'] } },
    'pk-thumb-01': { styleId: 'st-bold',  animationId: 'an-none',  assetIds: [], ai: { recommended: false, tags: ['썸네일'], hints: ['제목은 8자 이내가 읽혀요'] } },
    'pk-act-01':   { styleId: 'st-edu',   animationId: 'an-calm',  assetIds: [], ai: { recommended: true,  tags: ['활동', '모둠'], hints: ['역할 이름은 우리 반 말로 바꾸세요'] } },
    'pk-sns-01':   { styleId: 'st-soft',  animationId: 'an-slide', assetIds: [], ai: { recommended: false, tags: ['SNS', '공유'], hints: ['사진 카드 장을 복제해 늘리세요'] } },
  };
  let registered = 0;
  function install() {
    if (!window.MK_TPL || !window.MK_TPL.register) return { ok: false, msg: 'MK_TPL 없음' };
    if (registered) return { ok: true, count: registered, already: true };
    PACK.forEach((tpl) => { window.MK_TPL.register(tpl, OVERLAYS[tpl.templateId]); registered++; });
    return { ok: true, count: registered };
  }
  const result = install();

  return { PACK, OVERLAYS, install, ids: PACK.map((p) => p.templateId), result };
})();
