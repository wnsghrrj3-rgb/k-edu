/* ============================================================
 * 영어 놀이터 — 그린 그림 : 자판기·그림책방에서 쓰는 사물·동물 (Lv2 #9·#17·#24·#26·#29·#33)
 *   a/an 칸(#24) — a dog·a cat·a cake·a boat / an ant·an egg·an apple·an eye(눈 = mirror.js)
 *   그림책 지문 — duck·goat·boat·snow·coat. 규격·색 규칙은 content/art/art.js 머리말.
 *   mouth — a/an 칸의 「입이 크게 벌어지는 소리」 표시(펼침 24 의 입 모양 아이콘 — 이모지 대신 그린 그림).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };

  A.add('egg', '<path d="M48 14c16 0 28 26 28 44 0 16-12 26-28 26S20 74 20 58c0-18 12-44 28-44z" fill="' + M('var(--a-cream)') + '"/>' +
    '<path d="M34 40c2-8 6-14 10-16" stroke="' + SURF + '" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>' + sh('M22 64c4 14 14 20 26 20s22-6 26-20c-6 10-14 14-26 14s-20-4-26-14z', '.1'));
  A.add('apple', '<path d="M48 30c-8-6-30-6-32 18-2 22 14 38 24 38 4 0 6-2 8-2s4 2 8 2c10 0 26-16 24-38-2-24-24-24-32-18z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M48 30c0-8 2-14 6-18" stroke="var(--a-wood)" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M54 18c8-6 16-4 18 0-6 6-12 6-18 0z" fill="var(--a-leaf)"/>' +
    '<path d="M28 44c2-6 6-8 10-8" stroke="' + SURF + '" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>');
  A.add('ant', '<ellipse cx="26" cy="54" rx="11" ry="9" fill="' + M('var(--ink)') + '"/><ellipse cx="46" cy="54" rx="8" ry="7" fill="' + M('var(--ink)') + '"/><circle cx="64" cy="48" r="9" fill="' + M('var(--ink)') + '"/>' +
    '<path d="M36 60l-8 14M44 61l0 15M50 60l8 14M36 48l-8-12M46 47v-14M52 48l8-12M66 40l6-14M70 42l10-10" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' +
    '<circle cx="67" cy="46" r="2" fill="' + SURF + '"/>');
  A.add('duck', '<ellipse cx="46" cy="62" rx="28" ry="18" fill="' + M('var(--a-gold)') + '"/><circle cx="66" cy="36" r="13" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M78 38l12 3-12 5z" fill="var(--warm)"/><circle cx="69" cy="33" r="2.4" fill="' + INK + '"/>' +
    '<path d="M28 56c8-6 20-6 26 2-8 6-18 6-26-2z" fill="' + INK + '" opacity=".1"/><path d="M18 58l-8-6 2 12z" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M8 80c10-4 20-4 30 0s20 4 30 0 16-3 20-2" stroke="var(--a-fish)" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>');
  A.add('goat', '<ellipse cx="44" cy="58" rx="24" ry="15" fill="' + M('var(--a-cream)') + '"/><path d="M28 70v16M38 72v14M52 72v14M62 70v16" stroke="' + M('var(--a-cream)') + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M62 46c4-10 14-12 18-6 4 6 0 18-6 20-6 2-12-6-12-14z" fill="' + M('var(--a-cream)') + '"/><path d="M68 40c-2-8-6-12-10-12M76 38c2-8 6-12 10-12" stroke="var(--a-wood)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="72" cy="46" r="2.2" fill="' + INK + '"/><path d="M74 60l2 8" stroke="var(--a-cream)" stroke-width="3" stroke-linecap="round"/>' + sh('M20 62c6 10 40 12 48 0-10 6-38 6-48 0z', '.1'));
  A.add('boat', '<path d="M10 58h76l-10 20H22z" fill="' + M('var(--a-wood)') + '"/><path d="M48 14v42" stroke="' + INK + '" stroke-width="3" opacity=".6"/>' +
    '<path d="M50 16l26 34H50z" fill="var(--surface)"/><path d="M46 22L26 50h20z" fill="var(--a-cream)"/>' +
    '<path d="M6 84c10-4 20-4 30 0s20 4 30 0 20-4 26-2" stroke="var(--a-fish)" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>');
  A.add('snow', '<path d="M48 14v68M20 30l56 36M76 30L20 66" stroke="' + M('var(--a-fish)') + '" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M40 20l8 6 8-6M40 76l8-6 8 6M18 40l10-1 2-9M78 56l-10 1-2 9M18 56l10 1 2 9M78 40l-10-1-2-9" stroke="' + M('var(--a-fish)') + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="48" cy="48" r="5" fill="var(--surface)"/>');
  A.add('coat', '<path d="M30 16h36l16 18-8 8-6-6v50H28V36l-6 6-8-8z" fill="' + M('var(--a-red)') + '"/><path d="M48 16v70" stroke="' + INK + '" stroke-width="2" opacity=".2"/>' +
    '<path d="M38 16l10 14 10-14" fill="var(--a-cream)"/><circle cx="52" cy="46" r="2.4" fill="' + INK + '" opacity=".5"/><circle cx="52" cy="60" r="2.4" fill="' + INK + '" opacity=".5"/><circle cx="52" cy="74" r="2.4" fill="' + INK + '" opacity=".5"/>' +
    '<path d="M32 62h10v10H32z" fill="' + INK + '" opacity=".12"/>');
  A.add('mouth', '<ellipse cx="48" cy="52" rx="22" ry="26" fill="' + M('var(--a-red)') + '"/><ellipse cx="48" cy="56" rx="14" ry="17" fill="' + INK + '" opacity=".75"/>' +
    '<ellipse cx="48" cy="66" rx="9" ry="5" fill="var(--a-pink)"/>');
  /* 가게(It is a shop. · I like a shop.) — 점심 가게 차양 */
  A.add('shop', '<path d="M14 40h68v44H14z" fill="var(--surface)"/><path d="M10 24h76l-4 18H14z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M24 24l-4 18M38 24l-2 18M52 24v18M66 24l2 18" stroke="' + SURF + '" stroke-width="4" opacity=".6"/>' +
    '<path d="M22 52h22v32H22z" fill="var(--a-wood)"/><path d="M52 52h22v16H52z" fill="var(--a-fish)" opacity=".55"/>' + sh('M14 80h68v4H14z', '.15'));
  /* 자판기 열쇠(파츠 그림 보기용) */
  A.add('key', '<circle cx="30" cy="48" r="16" fill="' + M('var(--warm)') + '"/><circle cx="30" cy="48" r="6" fill="var(--surface)"/>' +
    '<path d="M44 48h40M70 48v12M80 48v8" stroke="' + M('var(--warm)') + '" stroke-width="8" stroke-linecap="round"/>');
})(window);
