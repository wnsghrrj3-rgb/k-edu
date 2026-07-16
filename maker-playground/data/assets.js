/* ============================================================
   K-MAKER Asset System 샘플 데이터  ⚠ 전부 임시(PLACEHOLDER).
   실제 업로드·스토리지·API 연결은 후속 단계 — 여기의 스키마가
   그대로 API 응답 형태의 기준이 된다.
   ------------------------------------------------------------
   Asset 스키마:
   id · name · type(파일 유형) · category(카테고리 키) ·
   size(표시 문자열) · ratio(썸네일 비율 w/h) · tags ·
   tone(placeholder 색 계열) · date(정렬용) · meta(부가 정보)
   ============================================================ */
window.MK_ASSETS = (() => {

  /* ---- 카테고리 정의 (지시서 순서 고정) ---- */
  const CATEGORIES = [
    { key: 'templates',     name: 'Templates',     ko: '템플릿',     icon: '▦' },
    { key: 'images',        name: 'Images',        ko: '이미지',     icon: '🖼' },
    { key: 'videos',        name: 'Videos',        ko: '영상',       icon: '▶' },
    { key: 'icons',         name: 'Icons',         ko: '아이콘',     icon: '✦' },
    { key: 'shapes',        name: 'Shapes',        ko: '도형',       icon: '◆' },
    { key: 'stickers',      name: 'Stickers',      ko: '스티커',     icon: '✿' },
    { key: 'illustrations', name: 'Illustrations', ko: '일러스트',   icon: '✎' },
    { key: 'backgrounds',   name: 'Backgrounds',   ko: '배경',       icon: '▨' },
    { key: 'audio',         name: 'Audio',         ko: '오디오',     icon: '♪' },
    { key: 'uploads',       name: 'Uploads',       ko: '업로드',     icon: '⇧' },
    { key: 'brand',         name: 'Brand Assets',  ko: '브랜드',     icon: '★' },
    /* 아래 2개는 가상 카테고리 — 실데이터는 위 카테고리에서 파생 */
    { key: 'favorites',     name: 'Favorites',     ko: '즐겨찾기',   icon: '♥', virtual: true },
    { key: 'recent',        name: 'Recent',        ko: '최근 사용',  icon: '⟳', virtual: true },
  ];

  /* placeholder 색 계열 — 썸네일 톤 (tokens 계열과 별개, 데이터 속성) */
  const TONES = {
    slate:  ['#E7EAEF', '#5B6472'],
    coral:  ['#FBE9E4', '#C4573F'],
    teal:   ['#E3F1EE', '#26766B'],
    cream:  ['#F8F3E9', '#8A7A55'],
    indigo: ['#E8EAF6', '#4A54A8'],
    plum:   ['#F3E8F4', '#8E4A97'],
  };

  let seq = 0;
  const a = (category, name, type, size, ratio, tone, tags, meta = {}) => ({
    id: 'as-' + String(++seq).padStart(3, '0'),
    category, name, type, size, ratio, tone, tags,
    date: 100 - seq, /* 더미 정렬 축 — 클수록 최신 */
    meta,
  });

  const ASSETS = [
    /* Templates */
    a('templates', '단원 발표 4장', 'template', '4 scenes', '16/9', 'indigo', ['발표', '수업'], { scenes: 4, style: '모던' }),
    a('templates', '학급 소식 카드', 'template', '3 scenes', '1/1', 'coral', ['카드뉴스', '알림'], { scenes: 3, style: '소프트' }),
    a('templates', '행사 포스터', 'template', '1 scene', '3/4', 'teal', ['포스터', '행사'], { scenes: 1, style: '프리미엄' }),
    a('templates', '학예회 영상 오프닝', 'template', '5 scenes', '16/9', 'plum', ['영상', '학예회'], { scenes: 5, style: '크리에이티브' }),
    a('templates', '주간 학습 안내', 'template', '2 scenes', '1/1.414', 'cream', ['학습지', '안내'], { scenes: 2, style: '미니멀' }),
    a('templates', '과학의 날 썸네일', 'template', '1 scene', '16/9', 'slate', ['썸네일', '과학'], { scenes: 1, style: '사이언스' }),
    /* Images */
    a('images', '교실 칠판', 'jpg', '1.8 MB', '4/3', 'slate', ['교실', '수업'], { px: '2400×1800' }),
    a('images', '운동장 하늘', 'jpg', '2.4 MB', '16/9', 'teal', ['야외', '하늘'], { px: '3200×1800' }),
    a('images', '색연필 더미', 'jpg', '1.1 MB', '1/1', 'coral', ['문구', '미술'], { px: '1600×1600' }),
    a('images', '도서관 서가', 'jpg', '2.0 MB', '3/4', 'cream', ['독서', '도서관'], { px: '1800×2400' }),
    a('images', '현미경 클로즈업', 'jpg', '1.6 MB', '4/3', 'indigo', ['과학', '실험'], { px: '2000×1500' }),
    a('images', '단풍 낙엽', 'jpg', '1.3 MB', '16/9', 'plum', ['계절', '가을'], { px: '2560×1440' }),
    /* Videos */
    a('videos', '구름 타임랩스', 'mp4', '24 MB', '16/9', 'teal', ['하늘', '배경'], { dur: '0:12', px: '1920×1080' }),
    a('videos', '물결 루프', 'mp4', '18 MB', '16/9', 'indigo', ['물', '루프'], { dur: '0:08', px: '1920×1080' }),
    a('videos', '색종이 팡파레', 'webm', '9 MB', '1/1', 'coral', ['축하', '효과'], { dur: '0:05', px: '1080×1080' }),
    a('videos', '칠판 판서 모션', 'mp4', '31 MB', '16/9', 'slate', ['수업', '판서'], { dur: '0:15', px: '1920×1080' }),
    /* Icons */
    a('icons', '연필', 'svg', '2 KB', '1/1', 'slate', ['문구', '쓰기'], { stroke: '1.5px' }),
    a('icons', '책 펼침', 'svg', '2 KB', '1/1', 'slate', ['독서', '학습'], { stroke: '1.5px' }),
    a('icons', '돋보기', 'svg', '1 KB', '1/1', 'slate', ['검색', '탐구'], { stroke: '1.5px' }),
    a('icons', '별', 'svg', '1 KB', '1/1', 'cream', ['칭찬', '평가'], { stroke: '1.5px' }),
    a('icons', '말풍선', 'svg', '2 KB', '1/1', 'teal', ['대화', '발표'], { stroke: '1.5px' }),
    a('icons', '전구', 'svg', '2 KB', '1/1', 'coral', ['아이디어'], { stroke: '1.5px' }),
    a('icons', '지구본', 'svg', '3 KB', '1/1', 'indigo', ['사회', '세계'], { stroke: '1.5px' }),
    a('icons', '음표', 'svg', '1 KB', '1/1', 'plum', ['음악'], { stroke: '1.5px' }),
    /* Shapes */
    a('shapes', '둥근 사각형', 'shape', 'vector', '4/3', 'slate', ['기본'], { fill: '단색' }),
    a('shapes', '원', 'shape', 'vector', '1/1', 'teal', ['기본'], { fill: '단색' }),
    a('shapes', '삼각형', 'shape', 'vector', '1/1', 'coral', ['기본'], { fill: '단색' }),
    a('shapes', '별 모양', 'shape', 'vector', '1/1', 'cream', ['장식'], { fill: '단색' }),
    a('shapes', '화살표', 'shape', 'vector', '2/1', 'indigo', ['흐름'], { fill: '단색' }),
    a('shapes', '리본 배너', 'shape', 'vector', '3/1', 'plum', ['제목', '장식'], { fill: '단색' }),
    /* Stickers */
    a('stickers', '참 잘했어요 도장', 'png', '84 KB', '1/1', 'coral', ['칭찬', '도장'], { px: '512×512' }),
    a('stickers', '엄지 척', 'png', '61 KB', '1/1', 'teal', ['칭찬'], { px: '512×512' }),
    a('stickers', '반짝이 하트', 'png', '77 KB', '1/1', 'plum', ['하트', '축하'], { px: '512×512' }),
    a('stickers', '왕관', 'png', '58 KB', '1/1', 'cream', ['시상', '축하'], { px: '512×512' }),
    a('stickers', '무지개', 'png', '92 KB', '4/3', 'indigo', ['날씨', '장식'], { px: '640×480' }),
    /* Illustrations */
    a('illustrations', '책 읽는 아이', 'svg', '14 KB', '4/3', 'cream', ['독서', '인물'], { style: '플랫' }),
    a('illustrations', '실험하는 과학자', 'svg', '18 KB', '4/3', 'indigo', ['과학', '인물'], { style: '플랫' }),
    a('illustrations', '발표하는 학생', 'svg', '15 KB', '4/3', 'teal', ['발표', '인물'], { style: '플랫' }),
    a('illustrations', '함께 달리기', 'svg', '20 KB', '16/9', 'coral', ['체육', '협동'], { style: '플랫' }),
    a('illustrations', '텃밭 가꾸기', 'svg', '17 KB', '4/3', 'plum', ['자연', '활동'], { style: '플랫' }),
    /* Backgrounds */
    a('backgrounds', '파스텔 그라디언트', 'bg', 'vector', '16/9', 'plum', ['그라디언트'], { kind: 'gradient' }),
    a('backgrounds', '모눈 종이', 'bg', 'vector', '16/9', 'slate', ['패턴', '학습지'], { kind: 'pattern' }),
    a('backgrounds', '수채화 번짐', 'bg', '1.2 MB', '16/9', 'teal', ['질감'], { kind: 'texture' }),
    a('backgrounds', '크라프트 종이', 'bg', '980 KB', '16/9', 'cream', ['질감', '종이'], { kind: 'texture' }),
    a('backgrounds', '밤하늘 별', 'bg', 'vector', '16/9', 'indigo', ['밤', '별'], { kind: 'pattern' }),
    /* Audio */
    a('audio', '밝은 피아노 루프', 'mp3', '1.4 MB', '1/1', 'teal', ['BGM', '밝음'], { dur: '0:30', bpm: 112 }),
    a('audio', '잔잔한 어쿠스틱', 'mp3', '2.1 MB', '1/1', 'cream', ['BGM', '잔잔'], { dur: '0:45', bpm: 88 }),
    a('audio', '박수 효과음', 'wav', '320 KB', '1/1', 'coral', ['효과음', '축하'], { dur: '0:03' }),
    a('audio', '딩동 알림', 'wav', '96 KB', '1/1', 'indigo', ['효과음', '알림'], { dur: '0:01' }),
    /* Uploads */
    a('uploads', '우리반_단체사진.jpg', 'jpg', '3.2 MB', '4/3', 'slate', ['업로드'], { px: '4000×3000', owner: '내 파일' }),
    a('uploads', '학교_로고_원본.png', 'png', '440 KB', '1/1', 'indigo', ['업로드', '로고'], { px: '1024×1024', owner: '내 파일' }),
    a('uploads', '운동회_안내문.pdf', 'pdf', '1.1 MB', '1/1.414', 'cream', ['업로드', '문서'], { pages: 2, owner: '내 파일' }),
    /* Brand Assets */
    a('brand', 'K-edu 로고 (기본)', 'svg', '6 KB', '3/1', 'indigo', ['로고'], { usage: '밝은 배경 전용' }),
    a('brand', 'K-edu 로고 (반전)', 'svg', '6 KB', '3/1', 'slate', ['로고'], { usage: '어두운 배경 전용' }),
    a('brand', '브랜드 컬러 팔레트', 'palette', 'vector', '4/3', 'teal', ['색상'], { colors: 6 }),
    a('brand', '기본 서체 세트', 'font', '—', '4/3', 'cream', ['타이포'], { fonts: 'Pretendard' }),
  ];

  return { CATEGORIES, TONES, ASSETS };
})();
