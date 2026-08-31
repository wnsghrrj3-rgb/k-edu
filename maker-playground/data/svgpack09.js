/* ============================================================
   MK_SVGPACK — SVG 템플릿 pack09 (자동 생성 — 손으로 고치지 말 것)
   ------------------------------------------------------------
   원본: assets/templates/pack09/*.svg
   생성: node maker-playground/tplpack-build.mjs
   MK_TPLSVG 파서가 SVG 를 요소로 푼 결과를 굳힌 것이다. 로드되면
   Template Engine 레지스트리에 바로 등록돼 Templates 화면에 선다.
   ⚠ 이름 주의: data/tplpack.js 의 MK_TPLPACK 은 별개 모듈이다(실전 템플릿
   팩 v1). 전역명을 겹치면 그쪽 API(install·ids)가 통째로 사라진다.
   ============================================================ */
window.MK_SVGPACK = (() => {
  const PACK = window.MK_SVGPACK || {};   /* 팩은 여러 장 — 앞 팩에 덧쌓는다 */
  Object.assign(PACK, {
  "y2k-event-01": {"width":1080,"height":1350,"background":"#D8FF3E","elements":[{"kind":"image","label":"","fill":"#FF4FD8","x":58.33,"y":5.19,"w":35.19,"h":28.15,"radius":999},{"kind":"image","label":"","fill":"#D8FF3E","x":65.28,"y":10.74,"w":21.3,"h":17.04,"radius":999},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%2260.5%20480.5%201039%20189%22%20width%3D%221039%22%20height%3D%22189%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M80%20650%20Q280%20500%20480%20650%20T880%20650%20T1080%20650%22%20fill%3D%22none%22%20stroke%3D%22%23FF4FD8%22%20stroke-width%3D%2235%22%2F%3E%3C%2Fsvg%3E","x":5.6,"y":35.59,"w":96.2,"h":14},{"kind":"text","x":6.48,"y":7.86,"w":35.71,"size":1.7,"text":"Y2K CREATIVE CLUB","weight":900,"color":"#191919","letterSpacing":0.22},{"kind":"text","x":6.48,"y":24.73,"w":44.98,"size":7.78,"text":"FUTURE","weight":900,"color":"#191919"},{"kind":"text","x":6.48,"y":32.14,"w":43.35,"size":7.78,"text":"IS FUN","weight":900,"color":"#FF4FD8"},{"kind":"text","x":6.48,"y":63.36,"w":56.52,"size":2.22,"text":"MUSIC · DESIGN · DIGITAL ART","weight":800,"color":"#191919"},{"kind":"image","label":"","fill":"#191919","x":6.48,"y":71.85,"w":30.56,"h":6.52,"radius":999},{"kind":"text","x":14.24,"y":74.54,"w":15.04,"size":1.78,"text":"SAT 19:00","weight":900,"color":"#FFF","align":"center"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  "museum-exhibition-01": {"width":1080,"height":1350,"background":"#EEE9E0","elements":[{"kind":"image","label":"","fill":"#191919","x":0,"y":0,"w":28.7,"h":100},{"kind":"shape","shape":"rect","label":"","x":37.96,"y":14.07,"w":47.22,"h":37.78,"fill":"none","stroke":"#C3482D","strokeWidth":3},{"kind":"image","label":"","fill":"#C3482D","x":47.22,"y":21.48,"w":28.7,"h":22.96,"radius":999},{"kind":"image","label":"","fill":"#EEE9E0","x":51.85,"y":25.19,"w":19.44,"h":15.56},{"kind":"text","x":33.8,"y":6.5,"w":31.15,"size":1.56,"text":"EXHIBITION 2026","weight":400,"color":"#191919","letterSpacing":0.29},{"kind":"text","x":33.8,"y":58.21,"w":53.33,"size":4.89,"text":"FORM / SPACE","weight":400,"color":"#191919"},{"kind":"text","x":33.8,"y":63.77,"w":40.39,"size":4.89,"text":"/ SILENCE","weight":400,"color":"#C3482D"},{"kind":"text","x":33.8,"y":74.22,"w":47.53,"size":1.63,"text":"09.12 — 11.08 · CONTEMPORARY HALL","weight":400,"color":"#555"}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  "school-election-01": {"width":1080,"height":1350,"background":"#EAF4FF","elements":[{"kind":"image","label":"","fill":"#FF7A45","x":64.35,"y":5.56,"w":28.7,"h":22.96,"radius":999},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22767%20162%20176%20136%22%20width%3D%22176%22%20height%3D%22136%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M780%20230%20L835%20285%20L930%20175%22%20fill%3D%22none%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%2222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E","x":71.02,"y":12,"w":16.3,"h":10.07},{"kind":"text","x":6.94,"y":8.17,"w":31.38,"size":1.78,"text":"STUDENT COUNCIL","weight":900,"color":"#173B67","letterSpacing":0.17},{"kind":"text","x":6.94,"y":26.14,"w":65.38,"size":6.96,"text":"YOUR VOICE","weight":900,"color":"#173B67"},{"kind":"text","x":6.94,"y":33.18,"w":46.96,"size":6.96,"text":"MATTERS","weight":900,"color":"#FF7A45"},{"kind":"image","label":"","fill":"#FFF","x":6.94,"y":49.63,"w":86.11,"h":22.96,"radius":42},{"kind":"text","x":11.11,"y":53.79,"w":33.25,"size":2.15,"text":"우리 학교를 더 즐겁게!","weight":800,"color":"#173B67"},{"kind":"text","x":11.11,"y":59.22,"w":30.11,"size":1.85,"text":"① 의견을 잘 듣겠습니다.","weight":400,"color":"#52677D"},{"kind":"text","x":11.11,"y":62.93,"w":44.45,"size":1.85,"text":"② 함께 만드는 행사를 늘리겠습니다.","weight":400,"color":"#52677D"},{"kind":"text","x":6.94,"y":80.64,"w":33.77,"size":1.93,"text":"VOTE · SEPTEMBER 18","weight":800,"color":"#173B67"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  "finance-report-01": {"width":1600,"height":900,"background":"#F5F7F8","elements":[{"kind":"text","x":5,"y":9.2,"w":21.4,"size":2.33,"text":"QUARTERLY REVIEW","weight":900,"color":"#62A989","letterSpacing":0.24},{"kind":"text","x":5,"y":17.13,"w":55.15,"size":6.89,"text":"GROWTH WITH CLARITY","weight":900,"color":"#12362D"},{"kind":"image","label":"","fill":"#FFF","x":5,"y":33.33,"w":27.5,"h":46.67,"radius":30},{"kind":"text","x":7.5,"y":39.11,"w":7.71,"size":2.44,"text":"REVENUE","weight":800,"color":"#64736F"},{"kind":"text","x":7.5,"y":44.63,"w":12.07,"size":7.22,"text":"+24%","weight":900,"color":"#12362D"},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22112%20472%20316%20156%22%20width%3D%22316%22%20height%3D%22156%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M120%20620%20L220%20560%20L320%20590%20L420%20480%22%20fill%3D%22none%22%20stroke%3D%22%2362A989%22%20stroke-width%3D%2212%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E","x":7,"y":52.44,"w":19.75,"h":17.33},{"kind":"image","label":"","fill":"#FFF","x":35.63,"y":33.33,"w":27.5,"h":46.67,"radius":30},{"kind":"text","x":38.13,"y":39.11,"w":9.8,"size":2.44,"text":"RETENTION","weight":800,"color":"#64736F"},{"kind":"text","x":38.13,"y":44.63,"w":9.66,"size":7.22,"text":"91%","weight":900,"color":"#12362D"},{"kind":"shape","shape":"ellipse","label":"","x":43.75,"y":55.56,"w":11.25,"h":20,"fill":"none","stroke":"#DDE8E4","strokeWidth":28},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22-16%20-15%20822%20741%22%20width%3D%22822%22%20height%3D%22741%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M790%20500%20A90%2090%200%201%201%20710%20630%22%20fill%3D%22none%22%20stroke%3D%22%2362A989%22%20stroke-width%3D%2228%22%2F%3E%3C%2Fsvg%3E","x":-1,"y":-1.67,"w":51.38,"h":82.33},{"kind":"image","label":"","fill":"#12362D","x":66.25,"y":33.33,"w":28.75,"h":46.67,"radius":30},{"kind":"text","x":68.75,"y":39.11,"w":4.56,"size":2.44,"text":"NEXT","weight":800,"color":"#BFD8CF"},{"kind":"text","x":68.75,"y":46.73,"w":13.28,"size":4.67,"text":"Focus on","weight":400,"color":"#FFF"},{"kind":"text","x":68.75,"y":52.84,"w":21.54,"size":4.67,"text":"quality growth.","weight":400,"color":"#FFF"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  "pet-adoption-01": {"width":1080,"height":1350,"background":"#FFF3DE","elements":[{"kind":"image","label":"","fill":"#F6C99E","x":28.7,"y":12.59,"w":42.59,"h":34.07,"radius":999},{"kind":"image","label":"","fill":"#50352A","x":36.11,"y":19.26,"w":12.96,"h":10.37,"radius":999},{"kind":"image","label":"","fill":"#50352A","x":50.93,"y":19.26,"w":12.96,"h":10.37,"radius":999},{"kind":"image","label":"","fill":"#E6B27E","x":36.57,"y":22.96,"w":26.85,"h":17.78,"radius":999},{"kind":"image","label":"","fill":"#222","x":44.54,"y":28.96,"w":2.59,"h":2.07,"radius":999},{"kind":"image","label":"","fill":"#222","x":52.87,"y":28.96,"w":2.59,"h":2.07,"radius":999},{"kind":"image","label":"","fill":"#222","x":47.22,"y":32.81,"w":5.56,"h":3.26,"radius":999},{"kind":"text","x":6.94,"y":7.18,"w":26.26,"size":1.63,"text":"FIND A FRIEND","weight":900,"color":"#E8785D","letterSpacing":0.23},{"kind":"text","x":6.94,"y":51.92,"w":64.32,"size":5.33,"text":"MEET YOUR NEW","weight":900,"color":"#50352A"},{"kind":"text","x":6.94,"y":57.85,"w":55.29,"size":5.33,"text":"BEST FRIEND","weight":900,"color":"#E8785D"},{"kind":"text","x":6.94,"y":67.75,"w":45.6,"size":2.3,"text":"Adopt. Love. Grow together.","weight":400,"color":"#50352A"},{"kind":"image","label":"","fill":"#50352A","x":6.94,"y":77.04,"w":27.78,"h":6.07,"radius":999},{"kind":"text","x":10.37,"y":79.49,"w":20.93,"size":1.7,"text":"MEET THE PETS","weight":900,"color":"#FFF","align":"center"}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  });

  /* Template Engine 등록 — MK_TPL 이 없으면 조용히 건너뛴다(파서만 쓰는 환경) */
  const REG = [
    { src: {
      templateId: 'tpl-y2k-event-01', title: "Y2K 행사면", description: "형광 연두에 크롬 느낌을 얹은 젊은 행사면",
      contentType: "poster", category: "포스터", style: "볼드", styleEn: "Y2K",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학예회·동아리 공연·청소년 행사", tags: ["행사","Y2K","형광"], recent: false, svgTemplate: "y2k-event-01",
      scenes: [{ id: 'p1', name: "Y2K 행사면", width: 1080, height: 1350, duration: 5,
        background: "#D8FF3E", transition: 'fade', order: 0, elements: PACK["y2k-event-01"].elements }],
    }, ov: { styleId: "st-bold", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["행사","Y2K","형광"], hints: ["제목은 두 단어로 끊을 것","흰 글자는 색을 바꾸면 더 잘 읽힌다"] } } },
    { src: {
      templateId: 'tpl-museum-exhibition-01', title: "전시 안내", description: "판을 크게 나눠 세운 스위스풍 전시면",
      contentType: "poster", category: "포스터", style: "페이퍼", styleEn: "Swiss",
      ratio: "4:5", difficulty: "보통", targetUser: 'teacher', gradeRange: '전학년',
      uses: "작품 전시·학급 갤러리·과학전 안내", tags: ["전시","갤러리","편집"], recent: false, svgTemplate: "museum-exhibition-01",
      scenes: [{ id: 'p1', name: "전시 안내", width: 1080, height: 1350, duration: 5,
        background: "#EEE9E0", transition: 'fade', order: 0, elements: PACK["museum-exhibition-01"].elements }],
    }, ov: { styleId: "st-paper", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["전시","갤러리","편집"], hints: ["제목·기간·장소 셋만 남길 것","판 색으로 분위기를 잡는다"] } } },
    { src: {
      templateId: 'tpl-school-election-01', title: "학급 선거", description: "기호와 이름을 크게 세운 선거 벽보",
      contentType: "poster", category: "포스터", style: "에듀", styleEn: "Friendly",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학급 임원 선거·전교 회장 선거·공약 게시", tags: ["선거","학급운영","벽보"], recent: false, svgTemplate: "school-election-01",
      scenes: [{ id: 'p1', name: "학급 선거", width: 1080, height: 1350, duration: 5,
        background: "#EAF4FF", transition: 'fade', order: 0, elements: PACK["school-election-01"].elements }],
    }, ov: { styleId: "st-edu", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["선거","학급운영","벽보"], hints: ["기호와 이름이 주인공","공약은 세 줄까지"] } } },
    { src: {
      templateId: 'tpl-finance-report-01', title: "실적 보고", description: "수치와 꺾은선으로 정리한 가로 보고 표지",
      contentType: "presentation", category: "발표자료", style: "모던", styleEn: "Professional",
      ratio: "16:9", difficulty: "보통", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학급 통계 발표·설문 결과·프로젝트 보고", tags: ["보고","통계","발표"], recent: false, svgTemplate: "finance-report-01",
      scenes: [{ id: 'p1', name: "실적 보고", width: 1600, height: 900, duration: 5,
        background: "#F5F7F8", transition: 'fade', order: 0, elements: PACK["finance-report-01"].elements }],
    }, ov: { styleId: "st-modern", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["보고","통계","발표"], hints: ["큰 숫자 하나가 중심","작은 라벨은 색을 진하게"] } } },
    { src: {
      templateId: 'tpl-pet-adoption-01', title: "반려동물 안내", description: "동그란 도형을 모아 만든 따뜻한 안내면",
      contentType: "poster", category: "포스터", style: "소프트", styleEn: "Warm",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "동물 사랑 캠페인·생명 존중 수업·학급 게시", tags: ["동물","캠페인","따뜻함"], recent: false, svgTemplate: "pet-adoption-01",
      scenes: [{ id: 'p1', name: "반려동물 안내", width: 1080, height: 1350, duration: 5,
        background: "#FFF3DE", transition: 'fade', order: 0, elements: PACK["pet-adoption-01"].elements }],
    }, ov: { styleId: "st-soft", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["동물","캠페인","따뜻함"], hints: ["도형을 옮겨 다른 동물로","작은 라벨은 색을 진하게"] } } },
  ];
  if (window.MK_TPL && window.MK_TPL.register) {
    REG.forEach((r) => { try { window.MK_TPL.register(r.src, r.ov); } catch (_) { /* 등록 실패는 무해 */ } });
  }

  return PACK;
})();
