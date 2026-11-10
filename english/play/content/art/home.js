/* ============================================================
 * 영어 놀이터 — 그린 그림 : 우리 집 입구 (Lv1 첫 단어 칸 · I like 칸)
 *   규격·색 규칙은 content/art/art.js 머리말.
 *   펼침 Lv1 #1 1-1 「I 는 나를 가리키는 아이 · you 는 가리키는 손 · like 는 좋아함 · see 는 눈 · it·a·the 는 상황 그림」.
 *   a·the 는 그림으로 뜻을 나눌 수 없어 글자 카드로 둔다(통째로 보는 단어). it = 선물 상자(「I like it.」의 그것).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" fill="none" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };

  /* I — 자기 가슴을 가리키는 아이 */
  A.add('I',
    '<circle cx="48" cy="28" r="15" fill="var(--skin-2)"/><path d="M33 26c2-12 28-14 30 0-6-6-24-6-30 0z" fill="var(--hair-2)"/>' +
    '<circle cx="43" cy="29" r="1.8" fill="' + INK + '"/><circle cx="53" cy="29" r="1.8" fill="' + INK + '"/>' + ln('M44 35q4 3 8 0', 1.8) +
    '<path d="M34 48h28l3 26H31z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M62 52c-4 6-10 8-14 8" stroke="var(--skin-2)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<path d="M38 74l-3 14M58 74l3 14" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>');
  /* you — 앞을 가리키는 손 */
  A.add('you',
    '<path d="M50 40h32c4 0 6 2 6 5s-2 5-6 5H56z" fill="var(--skin-2)"/>' +
    '<path d="M22 34h30c6 0 8 6 6 12l-4 22c-1 5-5 8-10 8H28c-6 0-10-4-10-10V40c0-4 2-6 4-6z" fill="var(--skin-2)"/>' +
    '<path d="M30 52h22M30 60h20" stroke="' + INK + '" stroke-width="2" opacity=".2" stroke-linecap="round"/>' +
    '<path d="M8 40h12v34H8z" fill="' + M('var(--stage)') + '"/>');
  /* like — 하트 */
  A.add('like',
    '<path d="M48 80C28 66 14 54 14 38c0-10 8-18 18-18 7 0 12 4 16 10 4-6 9-10 16-10 10 0 18 8 18 18 0 16-14 28-34 42z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M26 34c2-6 8-8 12-6" stroke="' + SURF + '" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>');
  /* see — 눈 */
  A.add('see',
    '<path d="M10 48c10-16 24-24 38-24s28 8 38 24c-10 16-24 24-38 24S20 64 10 48z" fill="var(--surface)"/>' +
    '<circle cx="48" cy="48" r="15" fill="' + M('var(--a-fish)') + '"/><circle cx="48" cy="48" r="7" fill="' + INK + '"/><circle cx="44" cy="44" r="3" fill="' + SURF + '"/>' +
    ln('M10 48c10-16 24-24 38-24s28 8 38 24c-10 16-24 24-38 24S20 64 10 48z', 3, '.6') + ln('M30 20l-3-7M48 16v-7M66 20l3-7', 3, '.5'));
  /* it — 선물 상자(그것) · gift 는 같은 그림의 소품 이름 */
  var gift = '<path d="M18 44h60v36H18z" fill="' + M('var(--stage)') + '"/><path d="M14 34h68v12H14z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M14 34h68v12H14z" fill="' + SURF + '" opacity=".18"/><path d="M44 34h8v46h-8z" fill="var(--warm)"/>' +
    '<path d="M48 34c-6-12-20-14-20-6 0 6 12 6 20 6zM48 34c6-12 20-14 20-6 0 6-12 6-20 6z" fill="var(--warm)"/>' +
    '<path d="M18 70h60v10H18z" fill="' + INK + '" opacity=".1"/>';
  A.add('it', gift);
  A.add('gift', gift);
})(window);
