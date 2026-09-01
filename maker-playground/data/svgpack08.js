/* ============================================================
   MK_SVGPACK — SVG 템플릿 pack08 (자동 생성 — 손으로 고치지 말 것)
   ------------------------------------------------------------
   원본: assets/templates/pack08/*.svg
   생성: node maker-playground/tplpack-build.mjs
   MK_TPLSVG 파서가 SVG 를 요소로 푼 결과를 굳힌 것이다. 로드되면
   Template Engine 레지스트리에 바로 등록돼 Templates 화면에 선다.
   ⚠ 이름 주의: data/tplpack.js 의 MK_TPLPACK 은 별개 모듈이다(실전 템플릿
   팩 v1). 전역명을 겹치면 그쪽 API(install·ids)가 통째로 사라진다.
   ============================================================ */
window.MK_SVGPACK = (() => {
  const PACK = window.MK_SVGPACK || {};   /* 팩은 여러 장 — 앞 팩에 덧쌓는다 */
  Object.assign(PACK, {
  "movie-poster-01": {"width":1080,"height":1350,"background":"#101114","elements":[{"kind":"shape","shape":"ellipse","label":"","x":21.3,"y":19.26,"w":57.41,"h":45.93,"fill":"none","stroke":"#E94444","strokeWidth":4},{"kind":"shape","shape":"ellipse","label":"","x":30.56,"y":26.67,"w":38.89,"h":31.11,"fill":"none","stroke":"#555","strokeWidth":2},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22228%20258%20624%20624%22%20width%3D%22624%22%20height%3D%22624%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M540%20260%20L610%20500%20L850%20570%20L610%20640%20L540%20880%20L470%20640%20L230%20570%20L470%20500Z%22%20fill%3D%22%23E94444%22%20opacity%3D%22.75%22%2F%3E%3C%2Fsvg%3E","x":21.11,"y":19.11,"w":57.78,"h":46.22},{"kind":"text","x":6.48,"y":7.18,"w":27.16,"size":1.63,"text":"CINEMA / 2026","weight":400,"color":"#AAA","letterSpacing":0.27},{"kind":"text","x":6.48,"y":72.19,"w":51.03,"size":6.81,"text":"THE LAST","weight":900,"color":"#FFF"},{"kind":"text","x":6.48,"y":78.86,"w":39.48,"size":6.81,"text":"SIGNAL","weight":900,"color":"#E94444"},{"kind":"text","x":6.48,"y":88.29,"w":47.93,"size":1.63,"text":"WHEN THE SKY ANSWERS BACK","weight":400,"color":"#AAA","letterSpacing":0.18}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  "realestate-social-01": {"width":1080,"height":1080,"background":"#E8E4DC","elements":[{"kind":"image","label":"","fill":"#233F38","x":6.02,"y":6.02,"w":87.96,"h":54.63},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22188%20428%20144%20229%22%20width%3D%22144%22%20height%3D%22229%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M210%20655%20V330%20L430%20190%20L650%20330%20V655Z%22%20fill%3D%22%23D8D0C3%22%2F%3E%3C%2Fsvg%3E","x":17.41,"y":39.63,"w":13.33,"h":21.2},{"kind":"image","label":"","fill":"#A79E91","x":29.17,"y":40.74,"w":10.65,"h":19.91},{"kind":"image","label":"","fill":"#9DB3AC","x":44.91,"y":36.11,"w":9.72,"h":9.72},{"kind":"text","x":6.48,"y":67.7,"w":21.08,"size":2.13,"text":"OPEN HOUSE","weight":800,"color":"#233F38","letterSpacing":0.22},{"kind":"text","x":6.48,"y":73.54,"w":37.86,"size":6.3,"text":"SPACE TO","weight":400,"color":"#222"},{"kind":"text","x":6.48,"y":80.49,"w":34.12,"size":6.3,"text":"BREATHE","weight":400,"color":"#233F38"},{"kind":"text","x":6.48,"y":90.85,"w":53.39,"size":2.13,"text":"3 BED · 2 BATH · TERRACE · SUNLIGHT","weight":400,"color":"#555"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다","기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  "worksheet-01": {"width":1600,"height":1100,"background":"#FFFDF6","elements":[{"kind":"shape","shape":"rect","label":"","x":4.06,"y":5.91,"w":91.88,"h":88.18,"fill":"#FFF","stroke":"#DDE5EF","strokeWidth":3,"radius":35},{"kind":"text","x":6.88,"y":11.54,"w":18.44,"size":2,"text":"LEARNING SHEET","weight":800,"color":"#3B82F6","letterSpacing":0.18},{"kind":"text","x":6.88,"y":17.04,"w":47.43,"size":5.27,"text":"오늘 배운 것을 정리해요","weight":900,"color":"#243142"},{"kind":"image","label":"","fill":"#EAF3FF","x":6.88,"y":28.64,"w":40.63,"h":22.27,"radius":28},{"kind":"text","x":9.38,"y":32.15,"w":23.33,"size":2.36,"text":"1. 가장 기억에 남는 것은?","weight":800,"color":"#243142"},{"kind":"shape","shape":"line","label":"","x":9.38,"y":40.82,"w":35,"h":0.18,"stroke":"#AAB8C8","strokeWidth":2,"fill":"none"},{"kind":"shape","shape":"line","label":"","x":9.38,"y":45.82,"w":35,"h":0.18,"stroke":"#AAB8C8","strokeWidth":2,"fill":"none"},{"kind":"image","label":"","fill":"#FFF1D9","x":51.25,"y":28.64,"w":40.63,"h":22.27,"radius":28},{"kind":"text","x":53.75,"y":32.15,"w":21.51,"size":2.36,"text":"2. 새롭게 알게 된 것은?","weight":800,"color":"#243142"},{"kind":"shape","shape":"line","label":"","x":53.75,"y":40.82,"w":35,"h":0.18,"stroke":"#C8B99F","strokeWidth":2,"fill":"none"},{"kind":"shape","shape":"line","label":"","x":53.75,"y":45.82,"w":35,"h":0.18,"stroke":"#C8B99F","strokeWidth":2,"fill":"none"},{"kind":"image","label":"","fill":"#EDF8ED","x":6.88,"y":56.36,"w":85,"h":25.45,"radius":28},{"kind":"text","x":9.38,"y":60.33,"w":31.97,"size":2.36,"text":"3. 그림이나 글로 자유롭게 표현해요.","weight":800,"color":"#243142"}],"notes":[]},
  "grand-opening-01": {"width":1080,"height":1350,"background":"#F7E35F","elements":[{"kind":"shape","shape":"rect","label":"","x":6.48,"y":5.19,"w":87.04,"h":89.63,"fill":"none","stroke":"#111111","strokeWidth":5},{"kind":"image","label":"","fill":"#FF6A4D","x":66.67,"y":7.41,"w":24.07,"h":19.26,"radius":999},{"kind":"image","label":"","fill":"#5B63E8","x":2.78,"y":66.67,"w":35.19,"h":28.15,"radius":999},{"kind":"text","x":8.33,"y":9.9,"w":18.45,"size":1.93,"text":"NOW OPEN","weight":900,"color":"#111111","letterSpacing":0.19},{"kind":"text","x":8.33,"y":25.05,"w":43.3,"size":8.3,"text":"HELLO,","weight":900,"color":"#111111"},{"kind":"text","x":8.33,"y":33.2,"w":66.99,"size":8.3,"text":"NEIGHBOR!","weight":900,"color":"#FF6A4D"},{"kind":"text","x":8.33,"y":46.22,"w":47.33,"size":3.26,"text":"Come see what's new.","weight":400,"color":"#111111"},{"kind":"image","label":"","fill":"#111111","x":8.33,"y":58.52,"w":36.11,"h":7.04,"radius":999},{"kind":"text","x":14.48,"y":61.26,"w":23.81,"size":2.07,"text":"OPENING WEEK","weight":900,"color":"#FFF","align":"center"},{"kind":"text","x":8.33,"y":70.09,"w":60.79,"size":2.15,"text":"SPECIAL OFFERS · GIFTS · EVENTS","weight":800,"color":"#111111"}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  "quote-social-01": {"width":1080,"height":1080,"background":"#E9E1F5","elements":[{"kind":"image","label":"","fill":"#6D4C91","x":67.59,"y":3.7,"w":25.93,"h":25.93,"radius":999,"opacity":0.14},{"kind":"text","x":8.33,"y":10.37,"w":20.39,"size":2.04,"text":"DAILY NOTE","weight":800,"color":"#6D4C91","letterSpacing":0.23},{"kind":"text","x":8.33,"y":31.9,"w":47.5,"size":8.52,"text":"Make room","weight":400,"color":"#29252D"},{"kind":"text","x":8.33,"y":41.16,"w":64.19,"size":8.52,"text":"for curiosity.","weight":400,"color":"#6D4C91"},{"kind":"shape","shape":"line","label":"","x":8.33,"y":60.09,"w":83.33,"h":0.19,"stroke":"#6D4C91","strokeWidth":2,"fill":"none"},{"kind":"text","x":8.33,"y":66.16,"w":49.32,"size":2.31,"text":"Ask more. Notice more. Discover more.","weight":400,"color":"#665F6B"},{"kind":"text","x":8.33,"y":86.44,"w":35.4,"size":1.85,"text":"KEDU / DAILY THOUGHT","weight":400,"color":"#6D4C91","letterSpacing":0.2}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  });

  /* Template Engine 등록 — MK_TPL 이 없으면 조용히 건너뛴다(파서만 쓰는 환경) */
  const REG = [
    { src: {
      templateId: 'tpl-movie-poster-01', title: "영화 포스터", description: "어두운 바탕에 제목만 세운 영화식 포스터",
      contentType: "poster", category: "포스터", style: "볼드", styleEn: "Cinematic",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학급 영화제·영상 상영회·연극 홍보", tags: ["영화","포스터","어두움"], recent: false, svgTemplate: "movie-poster-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "영화 포스터", width: 1080, height: 1350, duration: 5, background: "#101114", transition: 'fade', order: 0, elements: PACK["movie-poster-01"].elements }],
    }, ov: { styleId: "st-bold", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["영화","포스터","어두움"], hints: ["제목 한 단어가 가장 세다","아래 정보는 작게"] } } },
    { src: {
      templateId: 'tpl-realestate-social-01', title: "공간 소개 카드", description: "사진 자리와 정보 줄로 나눈 정사각 소개면",
      contentType: "sns", category: "SNS", style: "모던", styleEn: "Clean",
      ratio: "1:1", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "교실 소개·학교 공간 안내·시설 홍보", tags: ["소개","SNS","공간"], recent: false, svgTemplate: "realestate-social-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "공간 소개 카드", width: 1080, height: 1080, duration: 5, background: "#E8E4DC", transition: 'fade', order: 0, elements: PACK["realestate-social-01"].elements }],
    }, ov: { styleId: "st-modern", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["소개","SNS","공간"], hints: ["위 판을 눌러 「이미지 교체」로 실제 사진을","정보는 세 줄까지"] } } },
    { src: {
      templateId: 'tpl-worksheet-01', title: "학습 정리지", description: "질문 칸 셋과 밑줄로 짜인 수업 마무리 학습지",
      contentType: "worksheet", category: "학습지", style: "에듀", styleEn: "Classroom",
      ratio: "3:2", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "배움 공책·수업 정리·되돌아보기 활동", tags: ["학습지","수업","정리"], recent: false, svgTemplate: "worksheet-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "학습 정리지", width: 1600, height: 1100, duration: 5, background: "#FFFDF6", transition: 'fade', order: 0, elements: PACK["worksheet-01"].elements }],
    }, ov: { styleId: "st-edu", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["학습지","수업","정리"], hints: ["질문만 바꾸면 어느 과목에나 쓰인다","밑줄은 복제해 늘리세요"] } } },
    { src: {
      templateId: 'tpl-grand-opening-01', title: "개장 안내", description: "노랑 바탕에 색 원을 던진 팝 스타일 안내면",
      contentType: "poster", category: "포스터", style: "행사", styleEn: "Pop",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학급 가게·바자회 개장·부스 안내", tags: ["개장","행사","팝"], recent: false, svgTemplate: "grand-opening-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "개장 안내", width: 1080, height: 1350, duration: 5, background: "#F7E35F", transition: 'fade', order: 0, elements: PACK["grand-opening-01"].elements }],
    }, ov: { styleId: "st-event", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["개장","행사","팝"], hints: ["인사말 두 줄이 주인공","주황 글자는 색을 바꾸면 더 잘 읽힌다"] } } },
    { src: {
      templateId: 'tpl-quote-social-01', title: "문구 카드", description: "한 문장만 놓은 조용한 정사각 카드",
      contentType: "sns", category: "SNS", style: "소프트", styleEn: "Minimal",
      ratio: "1:1", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "오늘의 문장·급훈 게시·학급 SNS", tags: ["문구","SNS","한문장"], recent: false, svgTemplate: "quote-social-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "문구 카드", width: 1080, height: 1080, duration: 5, background: "#E9E1F5", transition: 'fade', order: 0, elements: PACK["quote-social-01"].elements }],
    }, ov: { styleId: "st-soft", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["문구","SNS","한문장"], hints: ["문장은 두 줄까지","여백을 겁내지 말 것"] } } },
  ];
  if (window.MK_TPL && window.MK_TPL.register) {
    REG.forEach((r) => { try { window.MK_TPL.register(r.src, r.ov); } catch (_) { /* 등록 실패는 무해 */ } });
  }

  return PACK;
})();
