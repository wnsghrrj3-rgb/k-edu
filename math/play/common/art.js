/* 수학 놀이터 그림 이름표 — 섬 페이지는 그림을 직접 쓰지 않고 art('fruit.apple') 처럼 이름으로 부른다.
 * 지금은 전부 이모지다. 나중에 그린 그림으로 바꿀 때는 이 표만 고친다(값을 { src: '/math/play/art/fruit.apple.png' } 로 두면 <img> 가 된다).
 * 파일 이름 규칙: /math/play/art/<이름표>.png (예: fruit.apple.png · guest.bear.png) */
const ART = {
  'coin': '🪙',
  // 가게 섬
  'fruit.apple': '🍎', 'fruit.orange': '🍊', 'fruit.banana': '🍌', 'shop.box': '📦',
  'guest.bear': '🐻', 'guest.rabbit': '🐰', 'guest.cat': '🐱', 'guest.dog': '🐶', 'guest.fox': '🦊', 'guest.panda': '🐼', 'guest.frog': '🐸', 'guest.monkey': '🐵',
  // 낚시 섬
  'fish.blue': '🐟', 'fish.tropical': '🐠', 'fish.puffer': '🐡', 'fish.shrimp': '🦐', 'fish.octopus': '🐙', 'fisher.cat': '🐱',
  // 배경
  'deco.sun': '☀️', 'deco.cloud': '☁️', 'deco.palm': '🌴', 'deco.sailboat': '⛵', 'deco.isle': '🏝️',
  // 광장 게시판
  'board.shop': '🍎', 'board.fish': '🐟', 'board.course': '🎁', 'board.stamp': '💮', 'board.pin': '📌' };
const GROUPS = { guest: Object.keys(ART).filter(k => k.startsWith('guest.')), fish: Object.keys(ART).filter(k => k.startsWith('fish.')) };

/** 그림 한 개. 글자(이모지)면 그 글자, 그린 그림이면 <img> 글. */
export function art(name){ const a = ART[name]; if (a == null) return '?'; return typeof a === 'string' ? a : `<img class="art" alt="" draggable="false" src="${a.src}">`; }
/** 같은 그림을 n 개 이어 붙인다. */
export function arts(name, n){ return art(name).repeat(Math.max(0, n)); }
/** 그림 묶음의 이름표들(손님·물고기). */
export function group(g){ return (GROUPS[g] || []).slice(); }
/** 캔버스(3D 팻말)에 그릴 수 있는 글자인지 — 그린 그림이면 null. */
export function glyph(name){ const a = ART[name]; return typeof a === 'string' ? a : null; }
/** 문서 안의 data-art="이름표" 자리를 그림으로 채운다(배경 꾸밈처럼 HTML 에 적어 둔 것). */
export function paint(root = document){ root.querySelectorAll('[data-art]').forEach(e => { e.innerHTML = art(e.dataset.art); }); }
export const ART_NAMES = Object.keys(ART);
