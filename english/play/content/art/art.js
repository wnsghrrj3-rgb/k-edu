/* ============================================================
 * 영어 놀이터 — 그린 그림(PlayArt) 등록소 (게임설계 v1 §15 — 이모지 대신 같은 손으로 그린 SVG 일러스트)
 *   규격: viewBox 0 0 96 96 · 평면 · 외곽선 없음 · 면 색은 토큰(var(--a-*)·var(--stage*))만 — 색 값을 직접 적지 않는다.
 *   그림자·빛은 잉크(var(--ink))·면(var(--surface))을 옅게 겹쳐서 낸다(색 수를 늘리지 않게).
 *   큰 면 하나는 var(--art-main, 기본색) — 「Red jam!」처럼 색을 바꾸는 연출은 --art-main 만 갈아 끼운다(core/fx.js tint).
 *   크기는 1em — 글자 크기로 키우고 줄인다.
 *
 *   PlayArt.add(name, inner)          그림 하나 등록(무대별 파일 content/art/<무대>.js 가 부른다)
 *   PlayArt.html(name, cls)           → '<svg class="art" …>' (없으면 '')
 *   PlayArt.pic(word)                 → 그림이 있으면 그림, 없으면 글자 카드(<span class="art-word">)
 *   PlayArt.dress(words)              구역 단어 목록의 pic 을 그림으로 채운다(구역 자료에는 그림 문자를 적지 않는다)
 * ============================================================ */
(function (g) {
  'use strict';
  var A = {};
  var INK = 'var(--ink)', SURF = 'var(--surface)';
  function html(name, cls) {
    var d = A[name]; if (!d) return '';
    return '<svg class="art' + (cls ? ' ' + cls : '') + '" viewBox="0 0 96 96" width="1em" height="1em" aria-hidden="true" data-art="' + name + '">' + d + '</svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var PlayArt = {
    INK: INK, SURF: SURF,
    add: function (name, inner) { A[name] = inner; return name; },
    has: function (name) { return !!A[name]; },
    names: function () { return Object.keys(A); },
    html: html,
    pic: function (w) { return A[w] ? html(w) : '<span class="art-word">' + esc(w) + '</span>'; },
    dress: function (words) { (words || []).forEach(function (x) { if (x && x.w) x.pic = PlayArt.pic(x.w); }); return words; }
  };
  g.PlayArt = PlayArt;

  /* ── 무대 소품(단어가 아닌 그림) ── */
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  /* 식빵 한 장 */
  PlayArt.add('bread', '<path d="M22 42c0-16 12-22 26-22s26 6 26 22c0 4-2 6-4 7v27c0 3-2 5-5 5H31c-3 0-5-2-5-5V49c-2-1-4-3-4-7z" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M30 44c0-10 8-15 18-15s18 5 18 15v30H30z" fill="var(--a-cream)"/>');
  /* 몬스터 셋 — 소리 몬스터·배고픈 몬스터 */
  PlayArt.add('monster', '<path d="M20 80V46c0-17 12-28 28-28s28 11 28 28v34l-7-6-7 6-7-6-7 6-7-6-7 6-7-6z" fill="' + M('var(--stage-2)') + '"/>' +
    '<path d="M30 24l-6-10 M66 24l6-10" stroke="' + M('var(--stage-2)') + '" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="38" cy="44" r="8" fill="' + SURF + '"/><circle cx="58" cy="44" r="8" fill="' + SURF + '"/>' +
    '<circle cx="39" cy="45" r="3.5" fill="' + INK + '"/><circle cx="59" cy="45" r="3.5" fill="' + INK + '"/>' +
    '<path d="M38 60c6 5 14 5 20 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M24 66c8 6 40 6 48 0" stroke="' + INK + '" stroke-width="0" fill="' + INK + '" opacity=".08"/>');
  PlayArt.add('monster2', '<path d="M26 82V36c0-12 10-22 22-22s22 10 22 22v46c-5 0-8-4-11-4s-6 4-11 4-8-4-11-4-6 4-11 4z" fill="' + M('var(--a-plum)') + '"/>' +
    '<circle cx="48" cy="38" r="11" fill="' + SURF + '"/><circle cx="49" cy="39" r="4.5" fill="' + INK + '"/>' +
    '<path d="M40 58h16" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M26 54c-8 2-12 8-12 14 M70 54c8 2 12 8 12 14" stroke="' + M('var(--a-plum)') + '" stroke-width="6" stroke-linecap="round" fill="none"/>');
  PlayArt.add('monster3', '<path d="M12 70c0-22 16-40 36-40s36 18 36 40c0 8-6 12-14 12H26c-8 0-14-4-14-12z" fill="' + M('var(--stage)') + '"/>' +
    '<circle cx="34" cy="54" r="6" fill="' + SURF + '"/><circle cx="62" cy="54" r="6" fill="' + SURF + '"/>' +
    '<circle cx="35" cy="55" r="2.8" fill="' + INK + '"/><circle cx="63" cy="55" r="2.8" fill="' + INK + '"/>' +
    '<path d="M40 68c5 3 11 3 16 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M30 34l-4-12 10 8 M66 34l4-12-10 8" fill="' + M('var(--stage)') + '"/>');
  /* 걸어가는 아이(소리 다리) · 기차(소리 기차) */
  PlayArt.add('kid', '<circle cx="48" cy="28" r="15" fill="var(--skin-2)"/><path d="M33 26c2-12 28-14 30 0-6-6-24-6-30 0z" fill="var(--hair-2)"/>' +
    '<path d="M36 46h24l3 22H33z" fill="var(--stage)"/><path d="M40 68l-4 18 M56 68l4 18" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="43" cy="29" r="1.8" fill="' + INK + '"/><circle cx="53" cy="29" r="1.8" fill="' + INK + '"/>');
  PlayArt.add('train', '<path d="M14 34h40c12 0 20 8 20 20v16H14z" fill="var(--stage)"/><path d="M20 40h14v12H20zM40 40h12v12H40z" fill="var(--a-cream)"/>' +
    '<path d="M60 26h8v14h-8z" fill="' + INK + '" opacity=".75"/><path d="M74 62l10 8H74z" fill="var(--stage-deep)"/>' +
    '<circle cx="26" cy="74" r="7" fill="' + INK + '"/><circle cx="56" cy="74" r="7" fill="' + INK + '"/>');
})(window);
