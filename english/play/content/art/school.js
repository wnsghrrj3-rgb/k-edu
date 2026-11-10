/* ============================================================
 * 영어 놀이터 — 그린 그림 : 교실 (Lv2 #4 학교① · #22 학교②·읽기)
 *   규격·색 규칙은 content/art/art.js 머리말. book(그림책)·pen(소리 숲)·see(우리 집)는 앞 무대 그림을 같이 쓴다 — 없을 때만 여기서 그린다.
 *   학교② 의 동사(read·teach·speak·clean)는 교실 장면 한 칸(펼침 22_2 「책 읽기·칠판·청소·달력」)으로 뜻을 붙인다.
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" fill="none" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };
  var add = function (n, s) { if (!A.has(n)) A.add(n, s); };
  /* 작은 사람(선생님·아이) — 장면 그림에 쓴다 */
  function person(x, y, col, hair) {
    return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="var(--skin-3)"/><path d="M' + (x - 9) + ' ' + (y - 1) + 'c1-8 17-9 18 0-4-4-14-4-18 0z" fill="' + (hair || 'var(--hair-1)') + '"/>' +
      '<path d="M' + (x - 9) + ' ' + (y + 12) + 'h18l3 26h-24z" fill="' + col + '"/>';
  }

  /* ── 학교①(lv2-04) ── */
  A.add('desk', '<path d="M12 40h72v8H12z" fill="' + M('var(--a-wood)') + '"/><path d="M18 48h6v36h-6zM72 48h6v36h-6z" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M30 48h36v14H30z" fill="' + M('var(--a-wood)') + '" opacity=".75"/><path d="M44 54h8" stroke="' + SURF + '" stroke-width="3" stroke-linecap="round" opacity=".6"/>' + sh('M12 46h72v2H12z', '.15'));
  A.add('chair', '<path d="M30 12h36v34H30z" fill="' + M('var(--a-red)') + '"/><path d="M26 46h44v8H26z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M30 54h5v32h-5zM61 54h5v32h-5z" fill="var(--a-steel)"/><path d="M36 20h24" stroke="' + SURF + '" stroke-width="3" opacity=".35" stroke-linecap="round"/>' + sh('M26 52h44v2H26z', '.15'));
  A.add('bag', '<path d="M36 24c0-12 24-12 24 0" stroke="' + INK + '" stroke-width="4" fill="none" opacity=".6"/>' +
    '<rect x="22" y="24" width="52" height="60" rx="12" fill="' + M('var(--a-fish)') + '"/><rect x="30" y="52" width="36" height="22" rx="6" fill="' + INK + '" opacity=".14"/>' +
    '<path d="M30 40h36" stroke="' + SURF + '" stroke-width="3" opacity=".4" stroke-linecap="round"/><circle cx="48" cy="58" r="3" fill="var(--warm)"/>');
  add('book', '<path d="M48 26c-10-6-24-8-36-6v54c12-2 26 0 36 6z" fill="var(--surface)"/><path d="M48 26c10-6 24-8 36-6v54c-12-2-26 0-36 6z" fill="var(--surface-2)"/>' +
    '<path d="M12 74c12-2 26 0 36 6 10-6 24-8 36-6v4c-12-2-26 0-36 6-10-6-24-8-36-6z" fill="' + M('var(--stage)') + '"/>');
  add('pen', '<path d="M24 76l6-18 40-40c3-3 8-3 11 0s3 8 0 11L41 69z" fill="' + M('var(--stage)') + '"/><path d="M24 76l6-18 11 11z" fill="var(--a-cream)"/><path d="M24 76l2.5-7.5 5 5z" fill="' + INK + '"/>');
  A.add('bench', '<path d="M8 50h80v8H8z" fill="' + M('var(--a-wood)') + '"/><path d="M8 34h80v7H8z" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M16 58h5v28h-5zM75 58h5v28h-5zM16 41h5v9h-5zM75 41h5v9h-5z" fill="' + INK + '" opacity=".55"/>' + sh('M8 56h80v2H8z', '.15'));
  A.add('clock', '<circle cx="48" cy="50" r="32" fill="' + M('var(--stage)') + '"/><circle cx="48" cy="50" r="25" fill="var(--surface)"/>' +
    '<path d="M48 50V34M48 50l11 7" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/><circle cx="48" cy="50" r="3" fill="' + INK + '"/>' +
    '<path d="M48 28v3M48 69v3M26 50h3M67 50h3" stroke="' + INK + '" stroke-width="2.4" opacity=".4" stroke-linecap="round"/>');
  A.add('pencil', '<path d="M18 70l52-52 9 9-52 52z" fill="' + M('var(--warm)') + '"/><path d="M18 70l9 9-14 5z" fill="var(--a-cream)"/><path d="M13 84l2.8-7 4.2 4.2z" fill="' + INK + '"/>' +
    '<path d="M70 18l5-5c2-2 5-2 7 0l2 2c2 2 2 5 0 7l-5 5z" fill="var(--a-pink)"/><path d="M66 22l9 9" stroke="var(--a-steel)" stroke-width="4"/>');

  /* ── 학교②·읽기(lv2-22) — 동사는 교실 장면으로 ── */
  A.add('read', '<path d="M48 44c-8-5-20-6-30-4v38c10-2 22-1 30 4z" fill="var(--surface)"/><path d="M48 44c8-5 20-6 30-4v38c-10-2-22-1-30 4z" fill="var(--surface-2)"/>' +
    '<path d="M48 44v38" stroke="' + INK + '" stroke-width="2" opacity=".25"/>' + '<circle cx="48" cy="22" r="11" fill="var(--skin-2)"/><path d="M37 21c1-9 21-11 22 0-5-5-17-5-22 0z" fill="var(--hair-2)"/>' +
    '<path d="M43 25h3M50 25h3" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' + '<path d="M24 52h16M24 60h12M56 52h16M56 60h12" stroke="' + M('var(--stage)') + '" stroke-width="2.6" stroke-linecap="round"/>');
  A.add('green', '<path d="M48 14c18 10 28 26 24 44-4 18-20 26-24 26s-20-8-24-26c-4-18 6-34 24-44z" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M48 22v58M48 42l-12-8M48 56l13-9" stroke="' + SURF + '" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>');
  A.add('tree', '<path d="M44 58h8v28h-8z" fill="var(--a-wood)"/><circle cx="48" cy="36" r="24" fill="' + M('var(--a-leaf)') + '"/>' +
    '<circle cx="32" cy="48" r="14" fill="' + M('var(--a-leaf)') + '"/><circle cx="64" cy="48" r="14" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M38 26c4-6 12-8 18-6" stroke="' + SURF + '" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>' + sh('M24 86h48v2H24z', '.12'));
  A.add('teach', '<rect x="30" y="14" width="58" height="40" rx="4" fill="' + M('var(--a-leaf)') + '"/><path d="M38 26h22M38 36h30M38 46h16" stroke="' + SURF + '" stroke-width="3" opacity=".7" stroke-linecap="round"/>' +
    person(20, 50, 'var(--stage-2)', 'var(--hair-3)') + '<path d="M26 64l12-20" stroke="var(--skin-3)" stroke-width="5" stroke-linecap="round"/>');
  A.add('speak', person(30, 40, M('var(--stage)')) + '<path d="M50 20h34c4 0 6 2 6 6v18c0 4-2 6-6 6H62l-8 8v-8h-4c-4 0-6-2-6-6V26c0-4 2-6 6-6z" fill="var(--surface)"/>' +
    '<path d="M54 30h26M54 38h18" stroke="' + INK + '" stroke-width="2.6" opacity=".35" stroke-linecap="round"/>' + '<ellipse cx="30" cy="45" rx="2.4" ry="2.8" fill="' + INK + '"/>');
  A.add('clean', '<path d="M60 12L40 70" stroke="var(--a-wood)" stroke-width="5" stroke-linecap="round"/><path d="M30 66h22l6 18H24z" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M68 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM80 30l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="var(--warm)"/>' + sh('M18 86h56v2H18z', '.12'));
  A.add('week', '<rect x="14" y="20" width="68" height="62" rx="8" fill="var(--surface)"/><path d="M14 28c0-4 4-8 8-8h52c4 0 8 4 8 8v8H14z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M28 14v12M68 14v12" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" opacity=".6"/>' +
    [0, 1, 2, 3, 4, 5, 6].map(function (k) { return '<rect x="' + (19 + k * 9) + '" y="50" width="6" height="6" rx="1.5" fill="' + (k === 3 ? 'var(--warm)' : INK) + '" opacity="' + (k === 3 ? '1' : '.25') + '"/>'; }).join(''));

  /* ── 소품 ── */
  A.add('locker', '<rect x="20" y="10" width="56" height="78" rx="6" fill="' + M('var(--a-fish)') + '"/><path d="M48 10v78" stroke="' + INK + '" stroke-width="2" opacity=".25"/>' +
    '<path d="M28 20h14M28 26h14M54 20h14M54 26h14" stroke="' + INK + '" stroke-width="2.4" opacity=".3" stroke-linecap="round"/><circle cx="42" cy="52" r="2.5" fill="' + SURF + '"/><circle cx="54" cy="52" r="2.5" fill="' + SURF + '"/>');
})(window);
