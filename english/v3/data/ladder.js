/* ============================================================
 * K-edu 영어 v3 — 사다리 데이터 (단일 원천: handoff v3/_LV1.md 차시 배열)
 * 칸 = 씨앗/묶음 1개. 펼친 본·보조 차시는 칸 내부 진행(차시 쪽 소관).
 * track: P 파닉스 · V 어휘 · G 문법 · R 독해 · M 미션
 * star: ★합류(심장) · mission: 레벨 종료 — 둘 다 「먼저 풀기」 불가 (_V3_ENGAGEMENT 규칙)
 * ============================================================ */
window.EN_LADDER = {
  current: 'lv1',
  levels: [
    {
      id: 'lv1', num: 1, name: '읽기 진입로', open: true,
      desc: '글자를 소리로 떼고, 첫 문장을 스스로 읽어요',
      /* 계단참 — 칸 8~12개 묶음. 현재 계단참만 펼침, 나머지는 띠(탭하면 구경 가능) */
      landings: [
        { name: '첫 소리 합치기', emoji: '🔤', from: 0, to: 7 },
        { name: '단어가 늘어나요', emoji: '🍎', from: 8, to: 14 },
        { name: '첫 문장과 졸업', emoji: '🏁', from: 15, to: 17 }
      ],
      steps: [
        { id: 'lv1-01', track: 'V', name: '통째로 아는 단어 ①', en: 'I · you · like' },
        { id: 'lv1-02', track: 'G', name: '나는 ~이 좋아', en: 'I like ~' },
        { id: 'lv1-03', track: 'P', name: '알파벳 소리 만나기', en: 'A~Z sounds' },
        { id: 'lv1-04', track: 'P', name: '소리 합치기 첫 도전!', en: 'c+a+t → cat', star: true },
        { id: 'lv1-05', track: 'V', name: '동물 단어', en: 'cat · dog · pig' },
        { id: 'lv1-06', track: 'P', name: 'i 소리 합치기', en: 'p+i+g → pig' },
        { id: 'lv1-07', track: 'P', name: 'o 소리 합치기', en: 'd+o+g → dog' },
        { id: 'lv1-08', track: 'R', name: '그림에 단어 붙이기', en: 'word ↔ picture' },
        { id: 'lv1-09', track: 'V', name: '통째로 아는 단어 ②', en: 'my · is · this' },
        { id: 'lv1-10', track: 'G', name: '나는 ~이야', en: 'I am ~' },
        { id: 'lv1-11', track: 'P', name: 'e 소리 합치기', en: 'p+e+n → pen' },
        { id: 'lv1-12', track: 'P', name: 'u 소리 합치기', en: 's+u+n → sun' },
        { id: 'lv1-13', track: 'V', name: '가족·색 단어', en: 'mom · dad · red' },
        { id: 'lv1-14', track: 'P', name: '새 자음 끼우기', en: 'b · d · g · h …' },
        { id: 'lv1-15', track: 'V', name: '수·꾸미는 말', en: 'one~five · big' },
        { id: 'lv1-16', track: 'P', name: '섞어서 읽기 도전', en: 'new CVC words' },
        { id: 'lv1-17', track: 'R', name: '첫 문장을 스스로!', en: 'I see a cat.', star: true },
        { id: 'lv1-18', track: 'M', name: 'Lv1 졸업 미션', en: 'make & read!', mission: true }
      ]
    },
    { id: 'lv2', num: 2, name: '읽기 진입로 완성', desc: '매직e까지 — 짧은 글을 소리 내어 읽어요', count: 9,
      preview: ['🔤 짝꿍 자음 sh·ch·th', '🍎 음식·일상 단어', '🔤 자음 블렌드 st·gr·fr', '💬 am·are·is의 비밀 발견!', '🍎 가족·색·수 단어', '🔤 마법의 e (cake·bike)', '🔤 모음 팀 ai·ee·oa', '📖 짧은 글 12편 소리 내어 읽기', '🏁 졸업 미션'] },
    { id: 'lv3', num: 3, name: '문법·독해 등장', desc: 'Do가 붙는 비밀을 스스로 발견해요', count: 5,
      preview: ['🍎 학교·동물·날씨 단어', '💬 물어볼 땐 Do가 붙네! (발견)', '🍎 움직임 단어 read·run·eat', '📖 짧은 글 20편 (3~5문장)', '🏁 읽고 답하기 미션'] },
    { id: 'lv4', num: 4, name: '짧은 단락 읽기', desc: '-ing의 비밀 + 5~8문장 글', count: 5,
      preview: ['🍎 자연·시간·몸·옷 단어', '💬 지금 하는 중! -ing 발견', '📖 짧은 단락 25편', '🏁 읽고 한 문장 쓰기'] },
    { id: 'lv5', num: 5, name: '이야기 독해', desc: '과거형으로 이야기를 읽어요', count: 4,
      preview: ['🍎 감정·장소·탈것 단어', '💬 끝이 변하네! played·went (발견)', '📖 이야기 30편 (처음-중간-끝)', '🏁 이야기 미션'] },
    { id: 'lv6', num: 6, name: '설명문 읽기', desc: '주제문 찾기 — 글의 뼈대가 보여요', count: 4,
      preview: ['🍎 직업·사회 단어', '💬 will·can 뒤엔 동사 그대로 (발견)', '📖 설명문 35편 + 근거 찾기', '🏁 요약 미션'] },
    { id: 'lv7', num: 7, name: '긴 글 · 구문 발견', desc: '긴 문장의 주어·동사가 보이기 시작!', count: 4,
      preview: ['🍎 의견·과학 단어', '💬 더 크다! -er·more (발견)', '📖 소설·전기·과학 40편', '🔍 문장 뼈대 찾기 (주어·동사)', '🏁 추론 미션'] },
    { id: 'lv8', num: 8, name: '구문독해 완성', desc: '어떤 글이든 뼈대를 잡고 읽어요', count: 4,
      preview: ['🍎 마지막 단어들 (도감 2400 완성!)', '💬 who로 문장을 잇네 (발견)', '📖 긴 지문 45편 — 절 접기 독해', '🏆 사다리 꼭대기!'] }
  ]
};
