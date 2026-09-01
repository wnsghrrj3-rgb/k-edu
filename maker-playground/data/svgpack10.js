/* ============================================================
   MK_SVGPACK — SVG 템플릿 pack10 (자동 생성 — 손으로 고치지 말 것)
   ------------------------------------------------------------
   원본: assets/templates/pack10/*.svg
   생성: node maker-playground/tplpack-build.mjs
   MK_TPLSVG 파서가 SVG 를 요소로 푼 결과를 굳힌 것이다. 로드되면
   Template Engine 레지스트리에 바로 등록돼 Templates 화면에 선다.
   ⚠ 이름 주의: data/tplpack.js 의 MK_TPLPACK 은 별개 모듈이다(실전 템플릿
   팩 v1). 전역명을 겹치면 그쪽 API(install·ids)가 통째로 사라진다.
   ============================================================ */
window.MK_SVGPACK = (() => {
  const PACK = window.MK_SVGPACK || {};   /* 팩은 여러 장 — 앞 팩에 덧쌓는다 */
  Object.assign(PACK, {
  "tech-conference-01": {"width":1080,"height":1350,"background":"#071827","elements":[{"kind":"shape","shape":"line","label":"","x":0,"y":22.15,"w":100,"h":0.15,"stroke":"#12364D","strokeWidth":2,"fill":"none"},{"kind":"shape","shape":"line","label":"","x":0,"y":36.96,"w":100,"h":0.15,"stroke":"#12364D","strokeWidth":2,"fill":"none"},{"kind":"shape","shape":"line","label":"","x":0,"y":51.78,"w":100,"h":0.15,"stroke":"#12364D","strokeWidth":2,"fill":"none"},{"kind":"shape","shape":"rect","label":"","x":20.28,"y":0,"w":0.19,"h":100,"fill":"#12364D"},{"kind":"shape","shape":"rect","label":"","x":49.91,"y":0,"w":0.19,"h":100,"fill":"#12364D"},{"kind":"shape","shape":"rect","label":"","x":79.54,"y":0,"w":0.19,"h":100,"fill":"#12364D"},{"kind":"shape","shape":"ellipse","label":"","x":57.41,"y":11.11,"w":33.33,"h":26.67,"fill":"none","stroke":"#00D9FF","strokeWidth":5},{"kind":"image","label":"","fill":"#00D9FF","x":64.35,"y":16.67,"w":19.44,"h":15.56,"radius":999,"opacity":0.15},{"kind":"text","x":6.48,"y":7.49,"w":34.41,"size":1.7,"text":"NEXT / TECH 2026","weight":800,"color":"#00D9FF","letterSpacing":0.26},{"kind":"text","x":6.48,"y":42.32,"w":34.4,"size":7.11,"text":"BUILD","weight":900,"color":"#EAF7FF"},{"kind":"text","x":6.48,"y":49.35,"w":69.55,"size":7.11,"text":"WHAT'S NEXT","weight":900,"color":"#00D9FF"},{"kind":"text","x":6.48,"y":61.32,"w":59.61,"size":2,"text":"AI · DESIGN · PRODUCT · EDUCATION","weight":400,"color":"#A9C3D2"},{"kind":"image","label":"","fill":"#00D9FF","x":6.48,"y":74.81,"w":33.33,"h":6.52,"radius":8},{"kind":"text","x":11.77,"y":77.51,"w":22.76,"size":1.78,"text":"SEP 26 · SEOUL","weight":900,"color":"#071827","align":"center"}],"notes":[]},
  "school-invite-01": {"width":1080,"height":1350,"background":"#FFF8E9","elements":[{"kind":"image","label":"","fill":"#FFD66B","x":70.37,"y":5.56,"w":21.3,"h":17.04,"radius":999},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22823%20118%20104%20139%22%20width%3D%22104%22%20height%3D%22139%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M825%20190%20Q875%20120%20925%20190%20Q875%20255%20825%20190Z%22%20fill%3D%22%23EF6A4B%22%2F%3E%3C%2Fsvg%3E","x":76.2,"y":8.74,"w":9.63,"h":10.3},{"kind":"text","x":6.94,"y":7.74,"w":12.3,"size":1.85,"text":"학교 안내","weight":900,"color":"#EF6A4B"},{"kind":"text","x":6.94,"y":20.37,"w":56.56,"size":4.96,"text":"우리 반 학예회에","weight":900,"color":"#24344B"},{"kind":"text","x":6.94,"y":25.93,"w":35.3,"size":4.96,"text":"초대합니다","weight":900,"color":"#EF6A4B"},{"kind":"image","label":"","fill":"#FFF","x":6.94,"y":38.15,"w":86.11,"h":35.56,"radius":38},{"kind":"text","x":11.57,"y":42.74,"w":37.11,"size":2.07,"text":"아이들이 준비한 작은 무대","weight":800,"color":"#24344B"},{"kind":"text","x":11.57,"y":47.8,"w":49.91,"size":1.78,"text":"노래 · 연극 · 작품 발표 · 함께하는 시간","weight":400,"color":"#667085"},{"kind":"shape","shape":"line","label":"","x":11.57,"y":54.41,"w":76.85,"h":0.07,"stroke":"#E8DED0","strokeWidth":1,"fill":"none"},{"kind":"text","x":11.57,"y":58.17,"w":5.53,"size":1.78,"text":"일시","weight":800,"color":"#24344B"},{"kind":"text","x":24.07,"y":58.17,"w":30.12,"size":1.78,"text":"9월 25일 금요일 10:00","weight":400,"color":"#667085"},{"kind":"text","x":11.57,"y":62.62,"w":5.53,"size":1.78,"text":"장소","weight":800,"color":"#24344B"},{"kind":"text","x":24.07,"y":62.62,"w":15.64,"size":1.78,"text":"우리 반 교실","weight":400,"color":"#667085"},{"kind":"text","x":6.94,"y":81.02,"w":49.9,"size":2.37,"text":"함께해 주시면 더 특별해집니다.","weight":400,"color":"#EF6A4B"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다","기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  "brand-moodboard-01": {"width":1600,"height":1100,"background":"#EAE2D8","elements":[{"kind":"text","x":5,"y":7.53,"w":13.93,"size":1.91,"text":"BRAND MOOD","weight":800,"color":"#A87558","letterSpacing":0.29},{"kind":"text","x":5,"y":13.79,"w":64.35,"size":5.91,"text":"QUIET / WARM / TACTILE","weight":400,"color":"#2B2724"},{"kind":"image","label":"","fill":"#B9A28E","x":5,"y":26.36,"w":29.38,"h":48.18},{"kind":"image","label":"","fill":"#E8D6C6","x":10.63,"y":37.27,"w":18.13,"h":26.36,"radius":999},{"kind":"image","label":"","fill":"#C9B8A8","x":36.88,"y":26.36,"w":19.38,"h":22.73},{"kind":"image","label":"","fill":"#765D50","x":58.75,"y":26.36,"w":36.25,"h":22.73},{"kind":"image","label":"","fill":"#F4EEE7","x":36.88,"y":52.73,"w":28.75,"h":21.82},{"kind":"image","label":"","fill":"#9D806D","x":68.13,"y":52.73,"w":26.88,"h":21.82},{"kind":"text","x":5,"y":82.15,"w":7.04,"size":1.82,"text":"PALETTE","weight":800,"color":"#2B2724"},{"kind":"image","label":"","fill":"#765D50","x":12.5,"y":80.45,"w":3.75,"h":5.45,"radius":999},{"kind":"image","label":"","fill":"#A87558","x":17.19,"y":80.45,"w":3.75,"h":5.45,"radius":999},{"kind":"image","label":"","fill":"#D5C1AF","x":21.88,"y":80.45,"w":3.75,"h":5.45,"radius":999},{"kind":"image","label":"","fill":"#F4EEE7","x":26.56,"y":80.45,"w":3.75,"h":5.45,"radius":999},{"kind":"text","x":56.25,"y":82.38,"w":26.79,"size":2.64,"text":"Material. Light. Restraint.","weight":400,"color":"#2B2724"}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요"]},
  "travel-itinerary-01": {"width":1080,"height":1350,"background":"#E8F2F2","elements":[{"kind":"text","x":6.48,"y":7.55,"w":35.58,"size":1.63,"text":"3 DAYS / CITY TRIP","weight":900,"color":"#E46E4F","letterSpacing":0.23},{"kind":"text","x":6.48,"y":13.16,"w":35.11,"size":5.19,"text":"FUKUOKA","weight":900,"color":"#173B40"},{"kind":"text","x":6.48,"y":19.31,"w":21.33,"size":4,"text":"weekend","weight":400,"color":"#E46E4F"},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22662%20122%20266%20506%22%20width%3D%22266%22%20height%3D%22506%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M750%20130%20Q920%20220%20800%20380%20Q670%20520%20875%20620%22%20fill%3D%22none%22%20stroke%3D%22%23E46E4F%22%20stroke-width%3D%2212%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E","x":61.3,"y":9.04,"w":24.63,"h":37.48},{"kind":"image","label":"","fill":"#173B40","x":67.59,"y":8.15,"w":3.7,"h":2.96,"radius":999},{"kind":"image","label":"","fill":"#173B40","x":79.17,"y":44.44,"w":3.7,"h":2.96,"radius":999},{"kind":"image","label":"","fill":"#FFF","x":6.48,"y":31.85,"w":87.04,"h":51.11,"radius":36},{"kind":"text","x":11.11,"y":36.45,"w":9.99,"size":2.07,"text":"DAY 1","weight":900,"color":"#173B40"},{"kind":"text","x":25.93,"y":36.63,"w":45.43,"size":1.85,"text":"TENJIN · CANAL CITY · YATAI","weight":400,"color":"#52676A"},{"kind":"shape","shape":"line","label":"","x":11.11,"y":42.19,"w":76.85,"h":0.07,"stroke":"#DDE8E8","strokeWidth":1,"fill":"none"},{"kind":"text","x":11.11,"y":46.82,"w":9.99,"size":2.07,"text":"DAY 2","weight":900,"color":"#173B40"},{"kind":"text","x":25.93,"y":47,"w":37.01,"size":1.85,"text":"DAZAIFU · CAFE · ONSEN","weight":400,"color":"#52676A"},{"kind":"shape","shape":"line","label":"","x":11.11,"y":52.56,"w":76.85,"h":0.07,"stroke":"#DDE8E8","strokeWidth":1,"fill":"none"},{"kind":"text","x":11.11,"y":57.19,"w":9.99,"size":2.07,"text":"DAY 3","weight":900,"color":"#173B40"},{"kind":"text","x":25.93,"y":57.37,"w":45.82,"size":1.85,"text":"MARKET · SHOPPING · AIRPORT","weight":400,"color":"#52676A"},{"kind":"image","label":"","fill":"#173B40","x":11.11,"y":67.41,"w":25,"h":5.93,"radius":999},{"kind":"text","x":16.52,"y":69.85,"w":14.18,"size":1.63,"text":"SAVE PLAN","weight":800,"color":"#FFF","align":"center"}],"notes":["기울임(italic)은 요소에 자리가 없어 곧게 들어가요","path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  "course-promo-01": {"width":1080,"height":1350,"background":"#191724","elements":[{"kind":"image","label":"","fill":"#A8FF60","x":0,"y":0,"w":100,"h":37.04},{"kind":"image","label":"","fill":"#FFFFFF","x":60.19,"y":5.93,"w":31.48,"h":25.19,"radius":999},{"kind":"image","label":"path","fit":"contain","src":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22753%20183%20154%20124%22%20width%3D%22154%22%20height%3D%22124%22%3E%3Cpath%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M765%20250%20L810%20295%20L895%20195%22%20fill%3D%22none%22%20stroke%3D%22%23A8FF60%22%20stroke-width%3D%2220%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E","x":69.72,"y":13.56,"w":14.26,"h":9.19},{"kind":"text","x":6.48,"y":7.12,"w":25.36,"size":1.7,"text":"ONLINE CLASS","weight":900,"color":"#191724","letterSpacing":0.22},{"kind":"text","x":6.48,"y":43.17,"w":35.25,"size":6.07,"text":"CREATE","weight":900,"color":"#FFFFFF"},{"kind":"text","x":6.48,"y":49.46,"w":80.24,"size":6.07,"text":"SOMETHING REAL","weight":900,"color":"#A8FF60"},{"kind":"text","x":6.48,"y":60.21,"w":50.2,"size":2,"text":"From first idea to finished project.","weight":400,"color":"#C9C5D4"},{"kind":"image","label":"","fill":"#252232","x":6.48,"y":70.37,"w":87.04,"h":11.85,"radius":28},{"kind":"text","x":10.65,"y":73.79,"w":70.32,"size":1.7,"text":"6 LESSONS · PROJECT BASED · BEGINNER FRIENDLY","weight":800,"color":"#A8FF60"},{"kind":"text","x":10.65,"y":77.55,"w":41.33,"size":1.63,"text":"Design · Build · Present · Improve","weight":400,"color":"#E5E1EA"},{"kind":"image","label":"","fill":"#A8FF60","x":6.48,"y":87.41,"w":27.78,"h":6.07,"radius":999},{"kind":"text","x":11.35,"y":89.86,"w":18.04,"size":1.7,"text":"START CLASS","weight":900,"color":"#191724","align":"center"}],"notes":["path 는 조각으로 — 이동·크기·회전은 됩니다"]},
  });

  /* Template Engine 등록 — MK_TPL 이 없으면 조용히 건너뛴다(파서만 쓰는 환경) */
  const REG = [
    { src: {
      templateId: 'tpl-tech-conference-01', title: "발표회 안내", description: "어두운 바탕에 격자를 깔고 제목을 세운 발표회면",
      contentType: "poster", category: "포스터", style: "모던", styleEn: "Futuristic",
      ratio: "4:5", difficulty: "보통", targetUser: 'teacher', gradeRange: '전학년',
      uses: "프로젝트 발표회·정보 수업 행사·과학전", tags: ["발표회","행사","격자"], recent: false, svgTemplate: "tech-conference-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "발표회 안내", width: 1080, height: 1350, duration: 5, background: "#071827", transition: 'fade', order: 0, elements: PACK["tech-conference-01"].elements }],
    }, ov: { styleId: "st-modern", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["발표회","행사","격자"], hints: ["격자 선은 옮기거나 지워도 된다","제목은 두 줄까지"] } } },
    { src: {
      templateId: 'tpl-school-invite-01', title: "학예회 초대장", description: "일시·장소 칸을 갖춘 한국어 학부모 초대장",
      contentType: "poster", category: "포스터", style: "소프트", styleEn: "Warm",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "학예회 초대·공개수업 안내·학급 행사", tags: ["초대장","학예회","학부모"], recent: false, svgTemplate: "school-invite-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "학예회 초대장", width: 1080, height: 1350, duration: 5, background: "#FFF8E9", transition: 'fade', order: 0, elements: PACK["school-invite-01"].elements }],
    }, ov: { styleId: "st-soft", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["초대장","학예회","학부모"], hints: ["일시·장소만 바꾸면 바로 나간다","주황 글자는 조금 더 진하게 하면 잘 읽힌다"] } } },
    { src: {
      templateId: 'tpl-brand-moodboard-01', title: "무드보드", description: "색 견본과 판을 늘어놓은 가로 정리면",
      contentType: "presentation", category: "발표자료", style: "페이퍼", styleEn: "Editorial",
      ratio: "3:2", difficulty: "보통", targetUser: 'teacher', gradeRange: '전학년',
      uses: "색 조사·디자인 수업·모둠 자료 정리", tags: ["무드보드","색","정리"], recent: false, svgTemplate: "brand-moodboard-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "무드보드", width: 1600, height: 1100, duration: 5, background: "#EAE2D8", transition: 'fade', order: 0, elements: PACK["brand-moodboard-01"].elements }],
    }, ov: { styleId: "st-paper", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["무드보드","색","정리"], hints: ["색 칸을 눌러 색을 바꿔 보세요","판은 복제해 늘릴 수 있다"] } } },
    { src: {
      templateId: 'tpl-travel-itinerary-01', title: "일정표", description: "날짜별로 줄을 나눠 적는 일정면",
      contentType: "poster", category: "포스터", style: "에듀", styleEn: "Clean",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "현장체험 일정·수학여행 안내·행사 순서", tags: ["일정","체험학습","안내"], recent: false, svgTemplate: "travel-itinerary-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "일정표", width: 1080, height: 1350, duration: 5, background: "#E8F2F2", transition: 'fade', order: 0, elements: PACK["travel-itinerary-01"].elements }],
    }, ov: { styleId: "st-edu", animationId: 'an-none', assetIds: [],
      ai: { recommended: true, tags: ["일정","체험학습","안내"], hints: ["줄을 복제해 날짜를 늘리세요","한 줄에 한 일정"] } } },
    { src: {
      templateId: 'tpl-course-promo-01', title: "수업 안내", description: "형광 연두 머리판에 강한 글자를 얹은 모집면",
      contentType: "poster", category: "포스터", style: "볼드", styleEn: "Creator",
      ratio: "4:5", difficulty: "쉬움", targetUser: 'teacher', gradeRange: '전학년',
      uses: "방과후 수업 모집·동아리 안내·특강 홍보", tags: ["수업","모집","볼드"], recent: false, svgTemplate: "course-promo-01",
      pageCount: 1,
      scenes: [{ id: 'p1', name: "수업 안내", width: 1080, height: 1350, duration: 5, background: "#191724", transition: 'fade', order: 0, elements: PACK["course-promo-01"].elements }],
    }, ov: { styleId: "st-bold", animationId: 'an-none', assetIds: [],
      ai: { recommended: false, tags: ["수업","모집","볼드"], hints: ["차시 수와 대상을 아래 칸에","제목 두 줄이 주인공"] } } },
  ];
  if (window.MK_TPL && window.MK_TPL.register) {
    REG.forEach((r) => { try { window.MK_TPL.register(r.src, r.ov); } catch (_) { /* 등록 실패는 무해 */ } });
  }

  return PACK;
})();
