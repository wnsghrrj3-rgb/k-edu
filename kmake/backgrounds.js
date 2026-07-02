/* ============================================================
   케이메이커 배경 재료 — v2 실사 파이프라인 (GPT 생산 · 베프 검수)
   형식: {n:이름, c:카테고리, img:경로}  — img형은 fabric.Image로 적용
        {n, c, s:SVG조각}              — 레거시 SVG형 (현재 없음)
   규격: 3:4 세로 · 풀블리드 · 글자 0 · 실물 질감
   ============================================================ */
window.BG_CATS = [
  ['paper', '종이·질감'],
  ['water', '수채'],
];
window.BACKGROUNDS = [
  { n: '수채 워시 · 아이보리 블러시', c: 'water', img: 'assets/v2/bg/watercolor-blush.jpg' },
  { n: '수채 워시 · 세이지 블루',     c: 'water', img: 'assets/v2/bg/watercolor-sage.jpg' },
  { n: '크라프트지',                 c: 'paper', img: 'assets/v2/bg/kraft.jpg' },
];
