/* ============================================================
 * 영어 놀이터 — 그린 그림 : 소리 숲 (Lv1 CVC 칸에서 그림으로 뜻을 붙일 수 있는 사물)
 *   규격·색 규칙은 content/art/art.js 머리말. 단어는 생성 파일 content/phonics-lv1.js 의 재료에서만.
 *   그림이 없는 단어는 글자 카드로 읽는다(소리 숲은 읽기가 먼저 — 그림은 읽은 뒤에 나타난다).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };

  A.add('sun',
    '<circle cx="48" cy="48" r="20" fill="' + M('var(--warm)') + '"/>' +
    '<path d="M48 14v10M48 72v10M14 48h10M72 48h10M24 24l7 7M65 65l7 7M24 72l7-7M65 31l7-7" stroke="' + M('var(--warm)') + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M38 40c3-4 8-6 12-5" stroke="' + SURF + '" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>');
  A.add('cup',
    '<path d="M22 30h44l-4 46c0 4-4 6-8 6H34c-4 0-8-2-8-6z" fill="' + M('var(--a-fish)') + '"/>' +
    '<path d="M66 40c10 0 14 6 14 12s-6 12-16 12" stroke="' + M('var(--a-fish)') + '" stroke-width="6" fill="none"/>' +
    '<path d="M22 30h44v6H22z" fill="' + INK + '" opacity=".12"/>' + sh('M26 66h36l-1 10c0 4-4 6-8 6H34c-4 0-8-2-8-6z', '.12') +
    '<path d="M32 40v24" stroke="' + SURF + '" stroke-width="4" opacity=".35" stroke-linecap="round"/>');
  A.add('bed',
    '<path d="M12 30h8v50h-8zM76 46h8v34h-8z" fill="var(--a-wood)"/>' +
    '<path d="M20 52h56v18H20z" fill="' + M('var(--a-fish)') + '"/>' +
    '<rect x="22" y="42" width="20" height="12" rx="5" fill="var(--a-cream)"/>' +
    '<path d="M40 50h36v4H40z" fill="' + SURF + '" opacity=".3"/>' + sh('M20 66h56v4H20z', '.14'));
  A.add('hen',
    '<ellipse cx="46" cy="58" rx="24" ry="19" fill="' + M('var(--a-cream)') + '"/>' +
    '<circle cx="62" cy="36" r="12" fill="' + M('var(--a-cream)') + '"/>' +
    '<path d="M56 24c2-6 6-6 7 0 2-6 6-6 7 0-2 3-12 3-14 0z" fill="var(--a-red)"/>' +
    '<path d="M73 36l9 3-9 4z" fill="var(--a-gold)"/><path d="M64 44c2 4 2 8-1 9-2-3-2-6 1-9z" fill="var(--a-red)"/>' +
    '<circle cx="64" cy="34" r="2.4" fill="' + INK + '"/>' +
    '<path d="M22 50c-8-4-10-12-6-18 6 2 10 8 10 14z" fill="' + M('var(--a-cream)') + '"/>' +
    '<path d="M36 56c8-6 18-4 22 4-8 6-18 4-22-4z" fill="' + INK + '" opacity=".1"/>' +
    '<path d="M42 76v8M52 76v8" stroke="var(--a-gold)" stroke-width="3.5" stroke-linecap="round"/>');
  A.add('bus',
    '<rect x="10" y="26" width="76" height="44" rx="10" fill="' + M('var(--warm)') + '"/>' +
    '<path d="M18 34h14v14H18zM36 34h14v14H36zM54 34h14v14H54z" fill="var(--a-cream)"/>' +
    '<path d="M72 34h8v22h-8z" fill="var(--a-cream)" opacity=".8"/>' +
    '<path d="M10 56h76v6H10z" fill="' + INK + '" opacity=".14"/>' +
    '<circle cx="28" cy="72" r="8" fill="' + INK + '"/><circle cx="68" cy="72" r="8" fill="' + INK + '"/>' +
    '<circle cx="28" cy="72" r="3" fill="var(--a-steel)"/><circle cx="68" cy="72" r="3" fill="var(--a-steel)"/>');
  A.add('pen',
    '<path d="M24 76l6-18 40-40c3-3 8-3 11 0s3 8 0 11L41 69z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M24 76l6-18 11 11z" fill="var(--a-cream)"/><path d="M24 76l2.5-7.5 5 5z" fill="' + INK + '"/>' +
    '<path d="M62 26l8 8" stroke="' + SURF + '" stroke-width="3" opacity=".4"/>' +
    '<path d="M56 32l8 8" stroke="' + INK + '" stroke-width="3" opacity=".2"/>');
  /* ── 글자 숲 첫 걸음(A01 사과나무 빈터)의 입말 낱말 — 지은 그림이 없던 둘 ── */
  A.add('ax',
    '<path d="M44 20h8v64h-8z" fill="var(--a-wood)"/>' +
    '<path d="M52 22c14-4 26 2 30 14-6 8-18 12-30 8z" fill="' + M('var(--a-steel)') + '"/>' +
    '<path d="M76 30c3 3 5 5 6 6-2 3-5 5-9 7 3-4 4-8 3-13z" fill="' + SURF + '" opacity=".5"/>' + sh('M44 76h8v8h-8z', '.15'));
  A.add('alligator',
    '<path d="M8 58c0-10 12-16 30-16h26c12 0 24 4 24 12 0 6-8 10-20 10H26c-10 0-18-2-18-6z" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M60 44c2-8 10-10 14-4-4 0-8 2-10 6z" fill="' + M('var(--a-leaf)') + '"/><circle cx="68" cy="42" r="2.4" fill="' + INK + '"/>' +
    '<path d="M62 60h26c0 4-6 6-14 6H64z" fill="var(--a-cream)"/><path d="M66 60l2 4 2-4 2 4 2-4 2 4 2-4 2 4 2-4" stroke="' + SURF + '" stroke-width="1.6" fill="none"/>' +
    '<path d="M22 64v8M36 64v8M52 64v8" stroke="' + M('var(--a-leaf)') + '" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M14 50l4-5 4 5 4-5 4 5 4-5 4 5" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".25"/>' + sh('M10 60c8 4 40 4 52 0-10 6-44 6-52 0z', '.12'));
})(window);
