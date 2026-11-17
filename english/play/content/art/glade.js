/* ============================================================
 * 영어 놀이터 — 그린 그림 : 글자 숲 빈터(한 해 길 A02~A05 — WA1)
 *   규격·색 규칙은 content/art/art.js 머리말(viewBox 96 · 평면 · 외곽선 없음 · 토큰 색만 · 큰 면 하나는 --art-main).
 *   A02 car · dad / A03 elephant · elbow · elf · fan · fox · frog / A04 gum · girl · hat / A05 igloo · ink · insect · iguana · jet · jug / 쪽지 서명 king
 *   (나머지 낱말은 이미 있는 그림 — cat · cup · cake · dog · duck · desk · egg · fish · goat · game · hen · ham · hand · jam · jump)
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };
  var hi = function (d, o) { return '<path d="' + d + '" fill="' + SURF + '" opacity="' + (o || '.35') + '"/>'; };
  var eye = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2.8) + '" fill="' + INK + '"/>'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };
  var face = function (x, y, skin) { return '<circle cx="' + x + '" cy="' + y + '" r="15" fill="var(' + skin + ')"/>' + eye(x - 5, y, 2.2) + eye(x + 5, y, 2.2) + ln('M' + (x - 4) + ' ' + (y + 6) + 'q4 4 8 0', 2) + '<circle cx="' + (x - 9) + '" cy="' + (y + 5) + '" r="2.6" fill="var(--cheek)" opacity=".7"/><circle cx="' + (x + 9) + '" cy="' + (y + 5) + '" r="2.6" fill="var(--cheek)" opacity=".7"/>'; };

  /* ── A02 그루터기 찻집 ── */
  A.add('car',
    '<path d="M14 60c0-8 4-12 12-13l10-14c2-3 5-4 9-4h16c4 0 7 2 9 5l7 13c8 1 13 5 13 13v4H14z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M40 34h10v13H31zM54 34h7c2 0 3 1 4 2l6 11H54z" fill="var(--a-fish)" opacity=".85"/>' + hi('M18 54h60v4H18z', '.25') +
    '<circle cx="30" cy="66" r="9" fill="var(--ink-2)"/><circle cx="30" cy="66" r="3.5" fill="var(--a-cream)"/><circle cx="68" cy="66" r="9" fill="var(--ink-2)"/><circle cx="68" cy="66" r="3.5" fill="var(--a-cream)"/>' +
    '<rect x="78" y="54" width="6" height="4" rx="2" fill="var(--warm)"/>');
  A.add('dad',
    '<path d="M26 92c0-20 10-30 22-30s22 10 22 30z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M36 64h24v28H36z" fill="var(--a-cream)"/>' + ln('M36 66l-6 26M60 66l6 26', 2, '.25') +
    face(48, 40, '--skin-2') + '<path d="M33 36c0-12 7-18 15-18s15 6 15 18c-4-6-9-8-15-8s-11 2-15 8z" fill="var(--hair-3)"/>' +
    '<path d="M40 52c3 3 13 3 16 0-1 6-15 6-16 0z" fill="var(--hair-3)" opacity=".85"/>');

  /* ── A03 코끼리 폭포 ── */
  A.add('elephant',
    '<ellipse cx="50" cy="56" rx="28" ry="20" fill="' + M('var(--a-steel)') + '"/>' +
    '<path d="M30 70v14h9V72M58 72v12h9V68" fill="' + M('var(--a-steel)') + '"/>' +
    '<circle cx="26" cy="46" r="16" fill="' + M('var(--a-steel)') + '"/>' +
    '<path d="M14 50c-6 6-6 16 0 22" stroke="' + M('var(--a-steel)') + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="38" cy="40" rx="10" ry="13" fill="var(--a-pink)" opacity=".85"/>' + eye(24, 42) + sh('M30 66c10 8 30 8 44 0v6c-14 6-34 6-44 0z'));
  A.add('elbow',
    '<path d="M18 30l26 30 34-18" stroke="var(--skin-2)" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M18 30l26 30" stroke="' + M('var(--a-fish)') + '" stroke-width="20" fill="none" stroke-linecap="round"/>' +
    '<circle cx="44" cy="60" r="11" fill="var(--warm)"/><circle cx="44" cy="60" r="5" fill="var(--surface)" opacity=".6"/>' +
    '<circle cx="80" cy="41" r="9" fill="var(--skin-2)"/>');
  A.add('elf',
    '<path d="M30 92c0-16 8-26 18-26s18 10 18 26z" fill="' + M('var(--a-leaf)') + '"/>' +
    face(48, 52, '--skin-1') + '<path d="M30 46c4-18 12-34 30-38-6 10-6 22-4 34z" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M30 46h28" stroke="var(--a-gold)" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="8" r="4" fill="var(--a-gold)"/>' +
    '<path d="M32 52l-8-6 2 10zM64 52l8-6-2 10z" fill="var(--skin-1)"/>');
  A.add('fan',
    '<path d="M48 82L14 30c10-12 58-12 68 0z" fill="' + M('var(--a-leaf)') + '"/>' +
    ln('M48 82L26 24M48 82L48 20M48 82L70 24', 2.5, '.35') + hi('M22 30c10-8 42-8 52 0-14-4-38-4-52 0z') +
    '<rect x="44" y="78" width="8" height="14" rx="3" fill="var(--a-wood)"/>');
  A.add('fox',
    '<path d="M70 70c18-2 20-20 8-26-2 12-8 18-16 20z" fill="' + M('var(--warm)') + '"/><path d="M78 44c4 4 4 10 0 14-1-5-2-9 0-14z" fill="var(--surface)"/>' +
    '<ellipse cx="50" cy="66" rx="20" ry="14" fill="' + M('var(--warm)') + '"/>' +
    '<path d="M22 30l8 20h20l8-20-12 8H34z" fill="' + M('var(--warm)') + '"/>' +
    '<path d="M28 46l12 18 12-18z" fill="var(--surface)"/>' + eye(34, 44) + eye(46, 44) + '<circle cx="40" cy="62" r="3" fill="' + INK + '"/>');
  A.add('frog',
    '<ellipse cx="48" cy="62" rx="28" ry="18" fill="' + M('var(--a-leaf)') + '"/>' +
    '<circle cx="34" cy="40" r="10" fill="' + M('var(--a-leaf)') + '"/><circle cx="62" cy="40" r="10" fill="' + M('var(--a-leaf)') + '"/>' +
    '<circle cx="34" cy="39" r="5" fill="var(--surface)"/><circle cx="62" cy="39" r="5" fill="var(--surface)"/>' + eye(35, 40, 2.6) + eye(61, 40, 2.6) +
    ln('M36 62q12 8 24 0', 2.5) + '<path d="M22 76c-6 4-6 8 2 8h10M74 76c6 4 6 8-2 8H62" stroke="' + M('var(--a-leaf)') + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + hi('M30 54c10-6 26-6 36 0-12-2-24-2-36 0z'));

  /* ── A04 염소 언덕 ── */
  A.add('gum',
    '<circle cx="48" cy="34" r="24" fill="' + M('var(--a-pink)') + '"/>' + hi('M34 24c4-6 12-9 18-8-8 2-14 6-18 8z', '.6') +
    '<path d="M30 58h36l-4 30H34z" fill="var(--a-fish)" opacity=".7"/><rect x="28" y="54" width="40" height="8" rx="3" fill="var(--a-red)"/>' +
    '<circle cx="40" cy="74" r="4" fill="var(--a-pink)"/><circle cx="52" cy="70" r="4" fill="var(--a-gold)"/><circle cx="48" cy="80" r="4" fill="var(--a-leaf)"/>');
  A.add('girl',
    '<path d="M28 92l8-26h24l8 26z" fill="' + M('var(--a-pink)') + '"/>' +
    '<circle cx="30" cy="36" r="8" fill="var(--hair-2)"/><circle cx="66" cy="36" r="8" fill="var(--hair-2)"/>' +
    face(48, 44, '--skin-1') + '<path d="M33 40c0-12 7-18 15-18s15 6 15 18c-6-6-24-6-30 0z" fill="var(--hair-2)"/>' +
    '<circle cx="66" cy="28" r="4" fill="var(--a-gold)"/>');
  A.add('hat',
    '<ellipse cx="48" cy="64" rx="38" ry="12" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M28 62c0-20 8-32 20-32s20 12 20 32z" fill="' + M('var(--a-gold)') + '"/>' +
    '<path d="M28 56c12 4 28 4 40 0v6c-12 4-28 4-40 0z" fill="var(--a-red)"/>' + sh('M10 66c20 8 56 8 76 0-2 4-6 6-10 8-18 4-38 4-56 0-4-2-8-4-10-8z') + hi('M36 40c2-4 6-6 10-6-4 2-8 4-10 6z', '.5'));

  /* ── A05 얼음 그늘 골짜기 ── */
  A.add('igloo',
    '<path d="M10 78c0-30 18-50 38-50s38 20 38 50z" fill="' + M('var(--stage-soft)') + '"/>' + hi('M18 66c2-18 14-32 30-34-12 6-24 18-30 34z', '.7') +
    ln('M14 62h68M22 46h52M48 28v18M30 46v16M66 46v16M40 62v16M56 62v16', 2, '.18') +
    '<path d="M36 78c0-12 5-18 12-18s12 6 12 18z" fill="var(--ink-2)"/><path d="M40 78c0-8 3-13 8-13s8 5 8 13z" fill="var(--warm)" opacity=".85"/>' + sh('M10 78h76v4H10z', '.12'));
  A.add('ink',
    '<ellipse cx="54" cy="80" rx="34" ry="8" fill="' + M('var(--word-blue)') + '" opacity=".85"/>' +
    '<path d="M24 40h28l4 34H20z" fill="' + M('var(--word-blue)') + '"/><rect x="28" y="28" width="20" height="12" rx="3" fill="var(--ink-2)"/>' +
    hi('M26 46h5l-1 22h-6z') + '<circle cx="72" cy="66" r="4" fill="' + M('var(--word-blue)') + '"/><circle cx="80" cy="72" r="2.5" fill="' + M('var(--word-blue)') + '"/>');
  A.add('insect',
    '<ellipse cx="50" cy="54" rx="26" ry="24" fill="' + M('var(--a-red)') + '"/>' + ln('M50 30v48', 2.5, '.5') +
    '<circle cx="38" cy="48" r="5" fill="' + INK + '"/><circle cx="62" cy="48" r="5" fill="' + INK + '"/><circle cx="40" cy="66" r="4" fill="' + INK + '"/><circle cx="60" cy="66" r="4" fill="' + INK + '"/>' +
    '<circle cx="50" cy="28" r="10" fill="var(--ink-2)"/>' + ln('M44 20l-6-8M56 20l6-8', 2.5) + ln('M24 50h-8M24 62l-8 4M76 50h8M76 62l8 4', 2.5, '.7'));
  A.add('iguana',
    '<path d="M70 62c14 0 20 10 10 18-4-6-10-8-16-8" fill="' + M('var(--a-leaf)') + '"/>' +
    '<ellipse cx="50" cy="58" rx="24" ry="12" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M16 50c0-8 8-12 16-10l6 10-6 8c-8 2-16 0-16-8z" fill="' + M('var(--a-leaf)') + '"/>' +
    '<path d="M32 44l4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8" fill="var(--a-gold)"/>' + eye(24, 47, 2.4) +
    '<path d="M36 68l-4 12M60 68l4 12" stroke="' + M('var(--a-leaf)') + '" stroke-width="5" stroke-linecap="round"/>' + sh('M30 62c12 6 28 6 42 0v4c-14 6-30 6-42 0z'));
  A.add('jet',
    '<path d="M8 50l80-30-26 62-14-22z" fill="' + M('var(--surface)') + '"/>' +
    '<path d="M48 60l40-40-54 30z" fill="var(--a-fish)" opacity=".55"/>' + ln('M8 50l40 10 40-40', 2, '.25') +
    ln('M10 70c8 0 12-4 16-8M18 82c8 0 14-4 18-10', 2, '.3'));
  A.add('jug',
    '<path d="M30 30h32l6 12c4 10 4 32-4 44H32c-8-12-8-34-4-44z" fill="' + M('var(--a-fish)') + '"/>' +
    '<path d="M68 40c14 0 14 26 0 26" stroke="' + M('var(--a-fish)') + '" stroke-width="7" fill="none"/>' +
    '<path d="M28 24h36l-2 8H30z" fill="var(--a-steel)"/><path d="M28 24l-8-6 10 2z" fill="var(--a-steel)"/>' + hi('M36 44h6v34h-5c-3-10-3-24-1-34z'));
  /* 쪽지 서명 — 왕관 그림자(A05 쪽지 3 · 다음 빈터 친구) */
  A.add('king',
    '<path d="M14 70l6-40 16 18 12-26 12 26 16-18 6 40z" fill="' + M('var(--a-gold)') + '"/>' +
    '<rect x="14" y="70" width="68" height="12" rx="3" fill="' + M('var(--a-gold)') + '"/>' + sh('M14 76h68v6H14z', '.15') +
    '<circle cx="48" cy="58" r="5" fill="var(--a-red)"/><circle cx="30" cy="62" r="4" fill="var(--a-fish)"/><circle cx="66" cy="62" r="4" fill="var(--a-leaf)"/>');
})(window);
