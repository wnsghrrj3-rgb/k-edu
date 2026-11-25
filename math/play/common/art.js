/* 수학 놀이터 그림 이름표 — 섬 페이지는 그림을 직접 쓰지 않고 art('fruit.apple') 처럼 이름으로 부른다.
 * 지금은 전부 이모지다. 나중에 그린 그림으로 바꿀 때는 이 표만 고친다(값을 { src: '/math/play/art/fruit.apple.png?v=2' } 로 두면 <img> 가 된다).
 * 파일 이름 규칙: /math/play/art/<이름표>.png (예: fruit.apple.png · guest.bear.png) */
const ART = {
  'coin': '🪙',
  // 가게 섬
  'fruit.apple': '🍎', 'fruit.orange': '🍊', 'fruit.banana': '🍌', 'fruit.grape': '🍇', 'shop.box': '📦',
  'shop.hammer': '🔨', 'shop.basket': '🧺', 'shop.awning': '⛱️', 'shop.bell': '🔔', 'shop.sign': '🪧', 'shop.pot': '🪴', 'shop.lamp': '🏮',
  'bake.bread': '🍞', 'bake.croissant': '🥐', 'shop.cart': '🛒', 'shop.till': '💰', 'shop.safe': '🏦', 'shop.door': '🚪', 'shop.memo': '📝', 'day.morning': '🌅', 'day.evening': '🌇',
  // 항구 장터·광장(N05 검수): 물건은 Pirate Kit 모형을 찍은 그림(/math/play/art/, CC0 재료에서 만듦)
  'market.wood': { src: '/math/play/art/market.wood.png?v=2' }, 'market.stone': { src: '/math/play/art/market.stone.png?v=2' }, 'market.barrel': { src: '/math/play/art/market.barrel.png?v=2' }, 'market.fish': { src: '/math/play/art/market.fish.png?v=2' },
  'rod.1': { src: '/math/play/art/rod.1.png?v=2' }, 'rod.2': { src: '/math/play/art/rod.2.png?v=2' }, 'rod.3': { src: '/math/play/art/rod.3.png?v=2' }, 'rod.4': { src: '/math/play/art/rod.4.png?v=2' }, 'rod.5': { src: '/math/play/art/rod.5.png?v=2' },
  // 낚시 섬 도감(모형을 찍은 그림)
  'fishbook.Clownfish': { src: '/math/play/art/fishbook.Clownfish.png' }, 'fishbook.BlueTang': { src: '/math/play/art/fishbook.BlueTang.png' }, 'fishbook.YellowTang': { src: '/math/play/art/fishbook.YellowTang.png' }, 'fishbook.Koi': { src: '/math/play/art/fishbook.Koi.png' }, 'fishbook.Tetra': { src: '/math/play/art/fishbook.Tetra.png' }, 'fishbook.ButterflyFish': { src: '/math/play/art/fishbook.ButterflyFish.png' }, 'fishbook.CardinalFish': { src: '/math/play/art/fishbook.CardinalFish.png' }, 'fishbook.RoyalGramma': { src: '/math/play/art/fishbook.RoyalGramma.png' }, 'fishbook.Betta': { src: '/math/play/art/fishbook.Betta.png' }, 'fishbook.Tang': { src: '/math/play/art/fishbook.Tang.png' }, 'fishbook.Goldfish': { src: '/math/play/art/fishbook.Goldfish.png' }, 'fishbook.Puffer': { src: '/math/play/art/fishbook.Puffer.png' }, 'fishbook.Shark': { src: '/math/play/art/fishbook.Shark.png' }, 'fishbook.Anglerfish': { src: '/math/play/art/fishbook.Anglerfish.png' },
  'plaza.wood': { src: '/math/play/art/plaza.wood.png?v=2' }, 'map.piece': '🧩', 'sound.on': '🔊', 'sound.off': '🔇', 'hint.hand': '👆', 'flag': '🚩', 'flag.star': '⭐',
  'shop.heart': '❤️', 'shop.heart.empty': '🤍', 'guest.mark.hurry': '💦', 'guest.mark.regular': '💛',
  'guest.bear': '🐻', 'guest.rabbit': '🐰', 'guest.cat': '🐱', 'guest.dog': '🐶', 'guest.fox': '🦊', 'guest.panda': '🐼', 'guest.frog': '🐸', 'guest.monkey': '🐵',
  // 낚시 섬
  'fish.blue': '🐟', 'fish.tropical': '🐠', 'fish.puffer': '🐡', 'fish.shrimp': '🦐', 'fish.octopus': '🐙', 'fisher.cat': '🐱',
  // 배경
  'deco.sun': '☀️', 'ride.paw': '🐾', 'flash.fuse': '🧨', 'flash.burst': '🎆', 'flash.spark': '🎇', 'deco.cloud': '☁️', 'deco.palm': '🌴', 'deco.sailboat': '⛵', 'deco.isle': '🏝️',
  // 광장 게시판
  'board.shop': '🍎', 'board.fish': '🐟', 'board.course': '🎁', 'board.stamp': '💮', 'board.pin': '📌' };
const GROUPS = { guest: Object.keys(ART).filter(k => k.startsWith('guest.') && !k.startsWith('guest.mark.')), fish: Object.keys(ART).filter(k => k.startsWith('fish.')) };

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
