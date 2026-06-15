/* 케이메이커 꾸밈 요소 — 직접 제작 (자유 라이선스). viewBox 0 0 100 100. 색 #5B8EF8 기본, 변경 가능 */
window.SHAPE_CATS = [["basic","도형"],["bubble","말풍선"],["frame","테두리"],["ribbon","리본·배너"],["divider","구분선"],["badge","배지·라벨"]];
window.SHAPES = [
 {n:"star 5",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,6 61,38 95,38 67,59 78,92 50,72 22,92 33,59 5,38 39,38" fill="#5B8EF8"/>'},
 {n:"star 6",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,5 60,28 85,28 65,45 73,70 50,55 27,70 35,45 15,28 40,28" fill="#5B8EF8"/><polygon points="50,95 40,72 15,72 35,55 27,30 50,45 73,30 65,55 85,72 60,72" fill="#5B8EF8" opacity="0.55"/>'},
 {n:"heart",c:"basic",vb:"0 0 100 100",s:'<path d="M50 86 C18 60 6 40 18 26 C28 14 44 18 50 32 C56 18 72 14 82 26 C94 40 82 60 50 86 Z" fill="#5B8EF8"/>'},
 {n:"triangle",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,12 90,84 10,84" fill="#5B8EF8"/>'},
 {n:"pentagon",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,8 92,40 76,90 24,90 8,40" fill="#5B8EF8"/>'},
 {n:"hexagon",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,6 89,28 89,72 50,94 11,72 11,28" fill="#5B8EF8"/>'},
 {n:"diamond",c:"basic",vb:"0 0 100 100",s:'<polygon points="50,8 88,50 50,92 12,50" fill="#5B8EF8"/>'},
 {n:"droplet",c:"basic",vb:"0 0 100 100",s:'<path d="M50 8 C50 8 82 46 82 66 A32 32 0 0 1 18 66 C18 46 50 8 50 8 Z" fill="#5B8EF8"/>'},
 {n:"lightning",c:"basic",vb:"0 0 100 100",s:'<polygon points="56,6 24,56 46,56 40,94 78,40 54,40" fill="#5B8EF8"/>'},
 {n:"cross plus",c:"basic",vb:"0 0 100 100",s:'<path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 Z" fill="#5B8EF8"/>'},
 {n:"cloud",c:"basic",vb:"0 0 100 100",s:'<path d="M28 72 A20 20 0 0 1 30 33 A24 24 0 0 1 74 38 A18 18 0 0 1 74 72 Z" fill="#5B8EF8"/>'},
 {n:"shield",c:"basic",vb:"0 0 100 100",s:'<path d="M50 8 L86 22 V52 C86 74 70 88 50 94 C30 88 14 74 14 52 V22 Z" fill="#5B8EF8"/>'},

 {n:"speech round",c:"bubble",vb:"0 0 100 100",s:'<path d="M16 18 H84 A8 8 0 0 1 92 26 V60 A8 8 0 0 1 84 68 H44 L26 86 V68 H16 A8 8 0 0 1 8 60 V26 A8 8 0 0 1 16 18 Z" fill="#5B8EF8"/>'},
 {n:"speech square",c:"bubble",vb:"0 0 100 100",s:'<path d="M10 16 H90 V64 H40 L24 82 V64 H10 Z" fill="#5B8EF8"/>'},
 {n:"thought",c:"bubble",vb:"0 0 100 100",s:'<ellipse cx="54" cy="38" rx="38" ry="26" fill="#5B8EF8"/><circle cx="26" cy="74" r="10" fill="#5B8EF8"/><circle cx="14" cy="90" r="6" fill="#5B8EF8"/>'},
 {n:"burst speech",c:"bubble",vb:"0 0 100 100",s:'<polygon points="50,8 60,24 78,18 74,38 92,44 76,56 86,74 66,70 60,90 48,74 30,84 32,62 12,62 26,48 12,32 32,34 34,14" fill="#5B8EF8"/>'},

 {n:"frame square",c:"frame",vb:"0 0 100 100",s:'<rect x="8" y="8" width="84" height="84" rx="4" fill="none" stroke="#5B8EF8" stroke-width="5"/>'},
 {n:"frame round",c:"frame",vb:"0 0 100 100",s:'<rect x="8" y="8" width="84" height="84" rx="18" fill="none" stroke="#5B8EF8" stroke-width="5"/>'},
 {n:"frame dashed",c:"frame",vb:"0 0 100 100",s:'<rect x="8" y="8" width="84" height="84" rx="10" fill="none" stroke="#5B8EF8" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/>'},
 {n:"frame double",c:"frame",vb:"0 0 100 100",s:'<rect x="8" y="8" width="84" height="84" fill="none" stroke="#5B8EF8" stroke-width="3"/><rect x="15" y="15" width="70" height="70" fill="none" stroke="#5B8EF8" stroke-width="1.5"/>'},
 {n:"frame circle",c:"frame",vb:"0 0 100 100",s:'<circle cx="50" cy="50" r="42" fill="none" stroke="#5B8EF8" stroke-width="5"/>'},

 {n:"banner ribbon",c:"ribbon",vb:"0 0 100 100",s:'<path d="M14 30 H86 V62 H14 Z" fill="#5B8EF8"/><polygon points="14,30 4,40 14,50" fill="#3A6FD8"/><polygon points="86,30 96,40 86,50" fill="#3A6FD8"/><polygon points="14,62 4,72 14,82 24,72 24,62" fill="#3A6FD8"/><polygon points="86,62 96,72 86,82 76,72 76,62" fill="#3A6FD8"/>'},
 {n:"flag banner",c:"ribbon",vb:"0 0 100 100",s:'<path d="M16 24 H84 V64 L50 50 L16 64 Z" fill="#5B8EF8"/>'},
 {n:"award ribbon",c:"ribbon",vb:"0 0 100 100",s:'<circle cx="50" cy="38" r="28" fill="#5B8EF8"/><circle cx="50" cy="38" r="18" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/><polygon points="38,60 30,92 50,80 70,92 62,60" fill="#3A6FD8"/>'},
 {n:"corner ribbon",c:"ribbon",vb:"0 0 100 100",s:'<path d="M10 30 H78 L90 44 L78 58 H10 Z" fill="#5B8EF8"/>'},
 {n:"bookmark",c:"ribbon",vb:"0 0 100 100",s:'<path d="M30 10 H70 V90 L50 72 L30 90 Z" fill="#5B8EF8"/>'},

 {n:"wave line",c:"divider",vb:"0 0 100 30",s:'<path d="M4 15 Q19 2 34 15 T64 15 T94 15" fill="none" stroke="#5B8EF8" stroke-width="4" stroke-linecap="round"/>'},
 {n:"dotted line",c:"divider",vb:"0 0 100 20",s:'<g fill="#5B8EF8"><circle cx="12" cy="10" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="52" cy="10" r="4"/><circle cx="72" cy="10" r="4"/><circle cx="92" cy="10" r="4"/></g>'},
 {n:"star line",c:"divider",vb:"0 0 100 24",s:'<line x1="8" y1="12" x2="40" y2="12" stroke="#5B8EF8" stroke-width="3" stroke-linecap="round"/><polygon points="50,2 54,10 62,10 56,15 58,23 50,18 42,23 44,15 38,10 46,10" fill="#5B8EF8"/><line x1="60" y1="12" x2="92" y2="12" stroke="#5B8EF8" stroke-width="3" stroke-linecap="round"/>'},
 {n:"zigzag",c:"divider",vb:"0 0 100 24",s:'<polyline points="6,18 22,6 38,18 54,6 70,18 86,6 94,12" fill="none" stroke="#5B8EF8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'},

 {n:"medal cog",c:"badge",vb:"0 0 100 100",s:'<g fill="#5B8EF8"><circle cx="50" cy="50" r="40"/></g><g fill="#5B8EF8"><circle cx="50" cy="8" r="8"/><circle cx="80" cy="20" r="8"/><circle cx="92" cy="50" r="8"/><circle cx="80" cy="80" r="8"/><circle cx="50" cy="92" r="8"/><circle cx="20" cy="80" r="8"/><circle cx="8" cy="50" r="8"/><circle cx="20" cy="20" r="8"/></g><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="3" opacity="0.55"/>'},
 {n:"starburst",c:"badge",vb:"0 0 100 100",s:'<polygon points="50,4 58,22 78,14 72,34 92,38 76,52 90,68 70,68 72,90 54,78 50,98 46,78 28,90 30,68 10,68 24,52 8,38 28,34 22,14 42,22" fill="#5B8EF8"/>'},
 {n:"seal",c:"badge",vb:"0 0 100 100",s:'<circle cx="50" cy="50" r="40" fill="none" stroke="#5B8EF8" stroke-width="4"/><circle cx="50" cy="50" r="32" fill="none" stroke="#5B8EF8" stroke-width="2"/><polygon points="50,30 55,44 70,44 58,53 62,68 50,59 38,68 42,53 30,44 45,44" fill="#5B8EF8"/>'},
 {n:"tag label",c:"badge",vb:"0 0 100 100",s:'<path d="M12 24 H64 L88 50 L64 76 H12 Z" fill="#5B8EF8"/><circle cx="26" cy="50" r="6" fill="#fff"/>'},
];
