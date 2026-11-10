/* ============================================================
 * 영어 놀이터 — 그린 그림 : 동물 농장 (Lv1 동물 칸 · 단어와 그림 칸) + 소리 숲에서 같이 쓰는 CVC 사물
 *   규격·색 규칙은 content/art/art.js 머리말. 큰 면 하나는 --art-main(색 바꾸기 연출용).
 *   단어 = 펼침 Lv1 #5(cat·dog·pig·fish·bird — fish 는 점심 가게 그림을 같이 쓴다) · #8(cat·mat·man·pig·pin·dog·box·pot).
 *   소품 = 도둑 너구리(#6)·덤불·그림책.
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };
  var eye = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2.8) + '" fill="' + INK + '"/>'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" fill="none" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };

  /* ── 동물 칸(lv1-05) ── */
  A.add('cat',
    '<path d="M64 80c16 0 22-10 18-24" stroke="' + M('var(--a-gold)') + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="46" cy="68" rx="20" ry="15" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M29 24l3 18 13-7zM63 24l-3 18-13-7z" fill="' + M('var(--a-gold)') + '"/>' +
    '<circle cx="46" cy="44" r="18" fill="' + M('var(--a-gold)') + '"/>' +
    sh('M30 74c8 9 24 9 32 0-8 4-24 4-32 0z', '.12') +
    eye(39, 43) + eye(53, 43) + '<path d="M43 49h6l-3 3z" fill="var(--a-pink)"/>' +
    ln('M28 50h8M56 50h8', 1.8, '.35'));
  A.add('dog',
    '<ellipse cx="50" cy="70" rx="21" ry="14" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M70 66c8-4 10-12 8-18" stroke="' + M('var(--a-wood)') + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="44" cy="42" r="18" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M27 32c-6 4-8 16-3 22 4-2 7-8 7-14zM61 32c6 4 8 16 3 22-4-2-7-8-7-14z" fill="' + INK + '" opacity=".55"/>' +
    '<ellipse cx="44" cy="51" rx="9" ry="6" fill="var(--a-cream)"/>' +
    eye(38, 40) + eye(50, 40) + '<ellipse cx="44" cy="48" rx="3.4" ry="2.4" fill="' + INK + '"/>' +
    sh('M32 76c10 8 26 8 36 0-10 4-26 4-36 0z', '.12'));
  A.add('pig',
    '<ellipse cx="50" cy="56" rx="30" ry="22" fill="' + M('var(--a-pink)') + '"/>' +
    '<path d="M28 40l-4-12 12 6zM60 36l6-10 2 13z" fill="' + M('var(--a-pink)') + '"/>' +
    '<path d="M32 74v10M44 76v9M58 76v9M70 72v10" stroke="' + M('var(--a-pink)') + '" stroke-width="6" stroke-linecap="round"/>' +
    '<ellipse cx="30" cy="56" rx="8" ry="6.5" fill="' + INK + '" opacity=".12"/>' +
    '<circle cx="27.5" cy="56" r="1.6" fill="' + INK + '"/><circle cx="32.5" cy="56" r="1.6" fill="' + INK + '"/>' +
    eye(36, 46) + ln('M80 52c5-2 5 6 9 3', 2.2, '.5') + sh('M24 64c12 14 40 16 54 2-14 8-40 6-54-2z', '.1'));
  A.add('bird',
    '<ellipse cx="46" cy="54" rx="22" ry="19" fill="' + M('var(--a-fish)') + '"/>' +
    '<circle cx="58" cy="38" r="12" fill="' + M('var(--a-fish)') + '"/>' +
    '<path d="M36 52c8-6 20-4 24 6-10 4-20 2-24-6z" fill="' + INK + '" opacity=".14"/>' +
    '<path d="M24 48l-12-4 8 12z" fill="' + M('var(--a-fish)') + '"/>' +
    '<path d="M69 37l11 3-11 4z" fill="var(--a-gold)"/>' + eye(61, 35, 2.4) +
    ln('M42 72v10M52 72v10M38 82h8M48 82h8', 2.4, '.7'));

  /* ── 단어와 그림 칸(lv1-08)·소리 숲 CVC ── */
  A.add('mat',
    '<path d="M18 50l24-14h40L58 50z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M18 50h40v18H18z" fill="' + M('var(--a-red)') + '"/><path d="M58 50l24-14v18L58 68z" fill="' + INK + '" opacity=".18"/>' +
    '<path d="M24 47l24-14M34 47l24-14M44 47l24-14" stroke="var(--a-cream)" stroke-width="3" opacity=".8"/>' +
    '<path d="M18 72h40M22 76h32" stroke="' + INK + '" stroke-width="2" opacity=".12"/>');
  A.add('man',
    '<circle cx="48" cy="24" r="13" fill="var(--skin-3)"/><path d="M35 22c1-10 25-12 26 0-5-4-21-4-26 0z" fill="var(--hair-4)"/>' +
    eye(43, 25, 1.8) + eye(53, 25, 1.8) + ln('M44 31q4 3 8 0', 1.8) +
    '<path d="M30 44c0-4 6-6 18-6s18 2 18 6v24H30z" fill="' + M('var(--stage-2)') + '"/>' +
    '<path d="M34 68h28l-2 20h-9l-3-14-3 14h-9z" fill="' + INK + '" opacity=".7"/>' +
    '<path d="M30 46l-6 20M66 46l6 20" stroke="var(--skin-3)" stroke-width="6" stroke-linecap="round"/>');
  A.add('pin',
    '<path d="M46 52l4 0-1 34h-2z" fill="var(--a-steel)"/>' +
    '<path d="M34 50h28l-4-10h-20z" fill="' + M('var(--a-red)') + '"/>' +
    '<rect x="40" y="18" width="16" height="22" rx="4" fill="' + M('var(--a-red)') + '"/>' +
    '<ellipse cx="48" cy="18" rx="14" ry="6" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M43 22v14" stroke="' + SURF + '" stroke-width="3" opacity=".4" stroke-linecap="round"/>');
  A.add('box',
    '<path d="M18 40h60v40H18z" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M18 40l10-12h40l10 12z" fill="var(--a-gold)"/>' +
    '<path d="M18 40l-6 10h28l6-10zM78 40l6 10H56l-6-10z" fill="var(--a-gold)" opacity=".85"/>' +
    '<path d="M42 40h12v14H42z" fill="var(--a-cream)" opacity=".7"/>' + sh('M18 70h60v10H18z', '.12'));
  A.add('pot',
    '<path d="M20 44h56v26c0 8-6 14-14 14H34c-8 0-14-6-14-14z" fill="' + M('var(--a-steel)') + '"/>' +
    '<path d="M16 44h64" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
    '<path d="M20 52h-8M76 52h8" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" opacity=".55"/>' +
    '<path d="M26 40c4-10 40-10 44 0z" fill="' + M('var(--a-steel)') + '"/><circle cx="48" cy="30" r="4" fill="' + INK + '" opacity=".55"/>' +
    sh('M20 64h56v6c0 8-6 14-14 14H34c-8 0-14-6-14-14z', '.12'));

  /* ── 소품 ── */
  /* 도둑 너구리(#6) — 회색 몸·검은 눈가리개·줄무늬 꼬리 */
  A.add('raccoon',
    '<path d="M66 70c14 2 22-6 22-16" stroke="var(--ink-3)" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<path d="M80 62l7-4M84 52l6 0" stroke="' + INK + '" stroke-width="4" opacity=".55" stroke-linecap="round"/>' +
    '<ellipse cx="48" cy="68" rx="22" ry="16" fill="var(--ink-3)"/>' +
    '<path d="M30 26l2 14 10-6zM66 26l-2 14-10-6z" fill="var(--ink-3)"/>' +
    '<circle cx="48" cy="44" r="19" fill="var(--ink-3)"/>' +
    '<path d="M29 44c4-8 34-8 38 0-4 6-10 6-14 2h-10c-4 4-10 4-14-2z" fill="' + INK + '" opacity=".75"/>' +
    '<circle cx="40" cy="43" r="2.6" fill="' + SURF + '"/><circle cx="56" cy="43" r="2.6" fill="' + SURF + '"/>' +
    '<path d="M40 52c4 6 12 6 16 0z" fill="var(--surface-2)"/><circle cx="48" cy="52" r="2.4" fill="' + INK + '"/>');
  /* 덤불 — 너구리가 무언가를 숨기는 곳 */
  A.add('bush',
    '<circle cx="30" cy="60" r="18" fill="' + M('var(--a-leaf)') + '"/><circle cx="66" cy="60" r="18" fill="' + M('var(--a-leaf)') + '"/>' +
    '<circle cx="48" cy="46" r="22" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M12 64h72v8c0 4-4 8-8 8H20c-4 0-8-4-8-8z" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M36 40c4-6 12-8 18-4M56 54c4-2 10-1 12 3M24 58c3-3 8-3 10 0" stroke="' + SURF + '" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>' +
    sh('M12 72h72v2c0 3-4 6-8 6H20c-4 0-8-3-8-6z', '.14'));
  /* 펼친 그림책(#22) */
  A.add('book',
    '<path d="M48 26c-10-6-24-8-36-6v54c12-2 26 0 36 6z" fill="var(--surface)"/>' +
    '<path d="M48 26c10-6 24-8 36-6v54c-12-2-26 0-36 6z" fill="var(--surface-2)"/>' +
    '<path d="M48 26v54" stroke="' + INK + '" stroke-width="2" opacity=".25"/>' +
    '<path d="M12 74c12-2 26 0 36 6 10-6 24-8 36-6v4c-12-2-26 0-36 6-10-6-24-8-36-6z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M20 36h20M20 44h16M56 36h20M56 44h16" stroke="' + INK + '" stroke-width="2.5" opacity=".2" stroke-linecap="round"/>');
})(window);
