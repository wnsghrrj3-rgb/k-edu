/* ============================================================
 * K-edu 영어 v3 — 사다리 데이터 (단일 원천: handoff v3/_LV1.md 차시 배열)
 * 칸 = 차시 1개. track: P 파닉스 · V 어휘 · G 문법 · R 독해 · M 미션
 * star: 합류(심장) · mission: 레벨 종료 — 둘 다 「먼저 풀기」 불가
 * 제목 원칙(2026-06-11): 무엇을 배우는지 직설. 장식·비유·이모지 금지.
 * ============================================================ */
window.EN_LADDER = {
  current: 'lv1',
  levels: [
    {
      id: 'lv1', num: 1, name: '알파벳과 단어 읽기', open: true,
      desc: '알파벳 소리를 익히고, 소리를 합쳐 단어와 짧은 문장을 읽습니다.',
      steps: [
        { id: 'lv1-01', track: 'V', name: '기본 단어 익히기 1', en: 'I · you · like' },
        { id: 'lv1-02', track: 'G', name: '"I like ~" 문장 익히기', en: 'I like ~' },
        { id: 'lv1-03', track: 'P', name: '알파벳 A~Z 소리', en: 'A~Z sounds' },
        { id: 'lv1-04', track: 'P', name: 'a 단어 읽기 (cat)', en: 'c+a+t → cat', star: true },
        { id: 'lv1-05', track: 'V', name: '동물 단어', en: 'cat · dog · pig' },
        { id: 'lv1-06', track: 'P', name: 'i 단어 읽기 (pig)', en: 'p+i+g → pig' },
        { id: 'lv1-07', track: 'P', name: 'o 단어 읽기 (dog)', en: 'd+o+g → dog' },
        { id: 'lv1-08', track: 'R', name: '단어와 그림 연결하기', en: 'word ↔ picture' },
        { id: 'lv1-09', track: 'V', name: '기본 단어 익히기 2', en: 'my · is · this' },
        { id: 'lv1-10', track: 'G', name: '"I am ~" 문장 익히기', en: 'I am ~' },
        { id: 'lv1-11', track: 'P', name: 'e 단어 읽기 (pen)', en: 'p+e+n → pen' },
        { id: 'lv1-12', track: 'P', name: 'u 단어 읽기 (sun)', en: 's+u+n → sun' },
        { id: 'lv1-13', track: 'V', name: '가족·색깔 단어', en: 'mom · dad · red' },
        { id: 'lv1-14', track: 'P', name: '여러 자음으로 단어 읽기', en: 'b · d · g · h …' },
        { id: 'lv1-15', track: 'V', name: '숫자·꾸미는 단어', en: 'one~five · big' },
        { id: 'lv1-16', track: 'P', name: '여러 단어 섞어 읽기', en: 'new CVC words' },
        { id: 'lv1-17', track: 'R', name: '짧은 문장 읽기', en: 'I see a cat.', star: true },
        { id: 'lv1-18', track: 'M', name: 'Lv1 마무리 평가', en: 'make & read', mission: true }
      ]
    },
    { id: 'lv2', num: 2, name: '긴 단어와 짧은 글 읽기', desc: '자음·모음 묶음과 매직 e까지 익혀 짧은 글을 읽습니다.', count: 9,
      preview: ['sh·ch·th 소리', '음식·일상 단어', 'st·gr·fr 소리', 'be동사 am·are·is', '가족·색깔·숫자 단어', '매직 e (cake·bike)', '모음 ai·ee·oa', '짧은 글 12편 읽기', 'Lv2 마무리 평가'] },
    { id: 'lv3', num: 3, name: '일반동사 문장과 짧은 글', desc: '일반동사의 의문·부정문을 익히고 3~5문장 글을 읽습니다.', count: 5,
      preview: ['학교·동물·날씨 단어', '의문문·부정문 (Do you ~?)', '움직임 단어 read·run·eat', '짧은 글 20편 (3~5문장)', '읽고 답하기 평가'] },
    { id: 'lv4', num: 4, name: '현재진행형과 단락 읽기', desc: '현재진행형(-ing)을 익히고 5~8문장 단락을 읽습니다.', count: 5,
      preview: ['자연·시간·몸·옷 단어', '현재진행형 (-ing)', '단락 25편 (5~8문장)', '읽고 한 문장 쓰기'] },
    { id: 'lv5', num: 5, name: '과거형과 이야기 읽기', desc: '과거형과 의문사를 익히고 이야기 글을 읽습니다.', count: 4,
      preview: ['감정·장소·교통 단어', '과거형 (played·went)', '이야기 30편 (처음-중간-끝)', '이야기 읽기 평가'] },
    { id: 'lv6', num: 6, name: '조동사와 설명문 읽기', desc: '미래·조동사를 익히고 설명문에서 주제문을 찾습니다.', count: 4,
      preview: ['직업·사회 단어', '미래·조동사 (will·can)', '설명문 35편 + 주제문 찾기', '요약하기 평가'] },
    { id: 'lv7', num: 7, name: '비교급과 긴 글 읽기', desc: '비교급·접속사를 익히고 긴 글에서 주어·동사를 찾습니다.', count: 4,
      preview: ['의견·과학 단어', '비교급·접속사 (-er·more)', '소설·전기·과학 40편', '주어·동사 찾기', '추론하기 평가'] },
    { id: 'lv8', num: 8, name: '복문과 구문 독해', desc: '현재완료·관계사·복문을 익혀 긴 지문을 정확히 읽습니다.', count: 4,
      preview: ['고급 어휘 (누적 2400)', '관계사·복문 (who·if)', '긴 지문 45편 구문 독해', '요지·추론 평가'] }
  ]
};
