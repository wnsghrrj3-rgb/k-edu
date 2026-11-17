/* ============================================================
 * 영어 놀이터 — 그린 그림 : 글자 숲 빈터(한 해 길 A02~A05 — WA1)
 *   규격·색 규칙은 content/art/art.js 머리말(viewBox 96 · 평면 · 외곽선 없음 · 토큰 색만 · 큰 면 하나는 --art-main).
 *   A02 car · dad / A03 elephant · elbow · elf · fan · fox · frog / A04 gum · girl · hat / A05 igloo · ink · insect · iguana · jet · jug / king(A05 쪽지 서명 · A06 낱말)
 *   WA2: A06 kite · kick · leg · lip · lamp · lion / A07 mom · map · milk · moon · net · nut · nest / A08 octopus · ox · olive · otter · panda / A09 queen · quilt · quiz · quack · red · rain · ring · robot
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
  /* ── A06 연 날리는 언덕 (WA2) ── */
  A.add('kite',
    '<path d="M48 8l26 30-26 40-26-40z" fill="' + M('var(--a-red)') + '"/>' + hi('M48 8l26 30H48z', '.25') + ln('M22 38h52M48 8v70', 2, '.3') +
    '<path d="M48 78c-8 4 8 6 0 10" stroke="var(--a-gold)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 82l6 3-6 3zM56 88l-6 3 6 3z" fill="var(--a-fish)"/>');
  A.add('kick',
    '<circle cx="62" cy="62" r="20" fill="' + M('var(--surface)') + '"/><path d="M62 50l8 6-3 10H57l-3-10z" fill="var(--ink-2)"/>' + ln('M62 42v8M70 56l9-4M67 66l6 9M57 66l-6 9M54 56l-9-4', 2, '.5') +
    '<path d="M10 40l22 12" stroke="var(--skin-2)" stroke-width="11" stroke-linecap="round"/><path d="M28 46l14 10-4 8-16-8z" fill="var(--a-red)"/>' + ln('M8 70h12M12 80h10', 2.5, '.35'));
  A.add('leg',
    '<path d="M40 10v44l-2 22" stroke="var(--skin-2)" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M30 10h22v22H30z" fill="' + M('var(--a-fish)') + '"/><path d="M28 74h22l16 8c4 2 2 6-2 6H28z" fill="var(--a-red)"/>' + sh('M28 84h38v4H28z', '.15'));
  A.add('lip',
    '<path d="M14 48c10-14 22-16 34-8 12-8 24-6 34 8-10 16-22 22-34 22S24 64 14 48z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M14 48c12 4 22 6 34 6s22-2 34-6" stroke="' + INK + '" stroke-width="2.5" fill="none" opacity=".45"/>' + hi('M30 42c4-3 9-3 13 0-5 0-9 0-13 0z', '.6'));
  A.add('lamp',
    '<rect x="44" y="40" width="8" height="46" rx="3" fill="var(--ink-2)"/><rect x="34" y="84" width="28" height="6" rx="3" fill="var(--ink-2)"/>' +
    '<path d="M32 16h32l6 26H26z" fill="' + M('var(--a-gold)') + '"/><path d="M36 22h24l3 14H33z" fill="var(--surface)" opacity=".6"/><path d="M30 12h36v6H30z" fill="var(--ink-2)"/>' +
    ln('M18 24l-8-4M78 24l8-4M14 36H6M82 36h8', 2.5, '.4'));
  A.add('lion',
    '<circle cx="48" cy="46" r="32" fill="var(--warm)"/><circle cx="48" cy="48" r="22" fill="' + M('var(--a-gold)') + '"/>' +
    '<circle cx="30" cy="26" r="7" fill="' + M('var(--a-gold)') + '"/><circle cx="66" cy="26" r="7" fill="' + M('var(--a-gold)') + '"/>' +
    eye(40, 44) + eye(56, 44) + '<path d="M44 52h8l-4 5z" fill="' + INK + '"/>' + ln('M48 57v4M42 63q6 4 12 0', 2) + '<ellipse cx="48" cy="58" rx="9" ry="7" fill="var(--a-cream)" opacity=".6"/>');
  /* ── A07 달빛 둥지 ── */
  A.add('mom',
    '<ellipse cx="46" cy="58" rx="26" ry="22" fill="' + M('var(--a-plum)') + '"/><circle cx="62" cy="34" r="15" fill="' + M('var(--a-plum)') + '"/>' +
    '<path d="M76 34l12 4-12 5z" fill="var(--a-gold)"/>' + eye(66, 32, 2.6) + '<path d="M30 52c8-6 20-4 24 6-8 6-20 4-24-6z" fill="var(--surface)" opacity=".35"/>' +
    '<ellipse cx="46" cy="66" rx="14" ry="10" fill="var(--a-cream)" opacity=".7"/>' + ln('M40 80v8M52 80v8', 2.5) + '<circle cx="22" cy="74" r="8" fill="var(--a-gold)"/>' + eye(24, 72, 1.6) + '<path d="M29 74l6 2-6 3z" fill="var(--warm)"/>');
  A.add('map',
    '<path d="M12 22l24-8 24 8 24-8v60l-24 8-24-8-24 8z" fill="' + M('var(--a-cream)') + '"/>' + ln('M36 14v60M60 22v60', 2, '.2') +
    '<path d="M22 60c8-10 14 0 22-8s10-14 26-14" stroke="var(--a-red)" stroke-width="3" fill="none" stroke-dasharray="4 5" stroke-linecap="round"/>' +
    '<circle cx="22" cy="60" r="4" fill="var(--a-fish)"/><path d="M68 30l8 8M76 30l-8 8" stroke="var(--a-red)" stroke-width="3" stroke-linecap="round"/><path d="M40 30l6-10 6 10z" fill="var(--a-leaf)"/>');
  A.add('milk',
    '<path d="M30 30l6-12h20l6 12v50c0 4-3 6-6 6H36c-3 0-6-2-6-6z" fill="' + M('var(--surface)') + '"/><rect x="36" y="10" width="20" height="10" rx="3" fill="var(--a-fish)"/>' +
    '<path d="M30 46h32v22H30z" fill="var(--a-fish)" opacity=".5"/>' + sh('M54 30h8v50c0 4-3 6-6 6h-2z', '.08') + '<rect x="66" y="62" width="18" height="24" rx="4" fill="var(--surface)"/><rect x="66" y="62" width="18" height="6" fill="var(--a-fish)" opacity=".3"/>');
  A.add('moon',
    '<circle cx="48" cy="48" r="32" fill="' + M('var(--a-gold)') + '"/><circle cx="62" cy="40" r="28" fill="var(--surface)" opacity=".0"/>' +
    '<path d="M66 20a32 32 0 100 56 26 26 0 010-56z" fill="var(--ink)" opacity=".12"/><circle cx="36" cy="40" r="5" fill="' + INK + '" opacity=".1"/><circle cx="46" cy="60" r="7" fill="' + INK + '" opacity=".1"/><circle cx="56" cy="34" r="3.5" fill="' + INK + '" opacity=".1"/>' +
    '<path d="M82 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM14 70l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="var(--a-gold)"/>');
  A.add('net',
    '<path d="M12 20c20 16 52 16 72 0v50c-20 14-52 14-72 0z" fill="' + M('var(--a-fish)') + '" opacity=".25"/>' +
    ln('M12 20c20 16 52 16 72 0M12 36c20 16 52 16 72 0M12 52c20 16 52 16 72 0M12 70c20 14 52 14 72 0M12 20v50M30 29v50M48 32v50M66 29v50M84 20v50', 2.2, '.55') +
    '<rect x="8" y="12" width="6" height="66" rx="3" fill="var(--a-wood)"/><rect x="82" y="12" width="6" height="66" rx="3" fill="var(--a-wood)"/>');
  A.add('nut',
    '<path d="M24 44c0 24 10 40 24 40s24-16 24-40z" fill="' + M('var(--a-wood)') + '"/>' + hi('M32 50c0 12 4 22 9 28-7-6-11-16-11-28z', '.5') +
    '<path d="M20 44c0-14 12-22 28-22s28 8 28 22z" fill="var(--stage-2)"/>' + ln('M26 36h44M24 42h48M34 28l-4 14M48 24v18M62 28l4 14', 1.8, '.25') + '<rect x="45" y="12" width="6" height="12" rx="3" fill="var(--a-wood)"/>');
  A.add('nest',
    '<path d="M12 52c0 22 16 32 36 32s36-10 36-32z" fill="' + M('var(--a-wood)') + '"/>' + ln('M16 60c20 8 44 8 64 0M22 70c16 6 36 6 52 0M30 54l10 26M56 54l-6 28M70 56l-12 22', 2, '.3') +
    '<circle cx="34" cy="44" r="10" fill="var(--a-gold)"/><circle cx="50" cy="40" r="10" fill="var(--a-gold)"/><circle cx="64" cy="45" r="10" fill="var(--a-gold)"/>' +
    eye(32, 42, 1.8) + eye(48, 38, 1.8) + eye(62, 43, 1.8) + '<path d="M36 46l5 2-5 2zM52 42l5 2-5 2zM66 47l5 2-5 2z" fill="var(--warm)"/>');
  /* ── A08 문어 연못 ── */
  A.add('octopus',
    '<path d="M22 44c0-18 12-30 26-30s26 12 26 30v12H22z" fill="' + M('var(--a-plum)') + '"/>' +
    '<path d="M22 54c-10 6-12 16-4 22M32 56c-6 10-4 20 4 24M44 58c-2 10 0 18 6 22M54 58c2 10 6 16 12 18M64 56c6 8 12 12 18 10M72 52c8 2 14 0 16-6" stroke="' + M('var(--a-plum)') + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    '<circle cx="40" cy="38" r="6" fill="var(--surface)"/><circle cx="58" cy="38" r="6" fill="var(--surface)"/>' + eye(41, 39, 2.6) + eye(57, 39, 2.6) + ln('M44 48q5 4 10 0', 2) + hi('M32 26c4-6 10-8 14-8-6 2-10 4-14 8z', '.4'));
  A.add('ox',
    '<ellipse cx="52" cy="60" rx="28" ry="18" fill="' + M('var(--a-wood)') + '"/><path d="M34 72v14h8V74M62 74v12h8V72" fill="' + M('var(--a-wood)') + '"/>' +
    '<circle cx="26" cy="48" r="16" fill="' + M('var(--a-wood)') + '"/><path d="M12 36c-8-2-8-12 0-16M40 36c8-2 8-12 0-16" stroke="var(--a-cream)" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="24" cy="56" rx="10" ry="7" fill="var(--a-cream)"/><circle cx="20" cy="56" r="1.8" fill="' + INK + '"/><circle cx="28" cy="56" r="1.8" fill="' + INK + '"/>' + eye(20, 44, 2.4) + eye(32, 44, 2.4) + '<circle cx="24" cy="64" r="4" fill="none" stroke="var(--a-gold)" stroke-width="2"/>');
  A.add('olive',
    '<ellipse cx="34" cy="56" rx="16" ry="20" fill="' + M('var(--a-leaf)') + '" transform="rotate(-18 34 56)"/><ellipse cx="62" cy="58" rx="15" ry="19" fill="var(--stage-deep)" transform="rotate(14 62 58)"/>' +
    '<circle cx="34" cy="62" r="5" fill="var(--a-red)"/>' + hi('M24 46c2-6 6-9 10-10-4 3-7 6-10 10z', '.5') + '<path d="M40 30c6-12 16-16 28-14-4 10-14 16-28 14z" fill="var(--a-leaf)"/>' + ln('M36 36c4-6 8-10 14-12', 2.5, '.6'));
  A.add('otter',
    '<ellipse cx="48" cy="58" rx="20" ry="26" fill="' + M('var(--a-wood)') + '"/><ellipse cx="48" cy="64" rx="12" ry="16" fill="var(--a-cream)"/>' +
    '<circle cx="48" cy="28" r="16" fill="' + M('var(--a-wood)') + '"/><circle cx="36" cy="16" r="5" fill="' + M('var(--a-wood)') + '"/><circle cx="60" cy="16" r="5" fill="' + M('var(--a-wood)') + '"/>' +
    '<ellipse cx="48" cy="34" rx="9" ry="6" fill="var(--a-cream)"/>' + eye(42, 26, 2.4) + eye(54, 26, 2.4) + '<circle cx="48" cy="31" r="2.6" fill="' + INK + '"/>' + ln('M40 34l-8 2M56 34l8 2', 1.5, '.5') +
    '<path d="M32 52l12 6M64 52l-12 6" stroke="' + M('var(--a-wood)') + '" stroke-width="6" stroke-linecap="round"/><path d="M66 78c10 2 16-4 14-12" stroke="' + M('var(--a-wood)') + '" stroke-width="7" fill="none" stroke-linecap="round"/>');
  A.add('panda',
    '<circle cx="28" cy="24" r="10" fill="' + INK + '"/><circle cx="68" cy="24" r="10" fill="' + INK + '"/><circle cx="48" cy="46" r="28" fill="' + M('var(--surface)') + '"/>' +
    '<ellipse cx="36" cy="42" rx="8" ry="10" fill="' + INK + '" transform="rotate(-20 36 42)"/><ellipse cx="60" cy="42" rx="8" ry="10" fill="' + INK + '" transform="rotate(20 60 42)"/>' +
    '<circle cx="37" cy="42" r="3" fill="var(--surface)"/><circle cx="59" cy="42" r="3" fill="var(--surface)"/><ellipse cx="48" cy="54" rx="4" ry="3" fill="' + INK + '"/>' + ln('M42 60q6 5 12 0', 2) +
    '<path d="M72 60l6 30" stroke="var(--a-leaf)" stroke-width="5" stroke-linecap="round"/><path d="M74 66c8-6 12-4 14 0-6 2-10 2-14 0z" fill="var(--a-leaf)"/>');
  /* ── A09 비 오는 여왕의 뜰 ── */
  A.add('queen',
    '<path d="M24 92c0-22 10-32 24-32s24 10 24 32z" fill="' + M('var(--a-plum)') + '"/>' + face(48, 46, '--skin-1') +
    '<path d="M32 44c0-14 7-20 16-20s16 6 16 20c-4-8-28-8-32 0z" fill="var(--hair-1)"/><path d="M32 26l4-14 8 8 4-12 4 12 8-8 4 14z" fill="var(--a-gold)"/><circle cx="48" cy="20" r="2.6" fill="var(--a-red)"/>' +
    '<path d="M40 64l8 8 8-8" stroke="var(--a-gold)" stroke-width="3" fill="none"/>');
  A.add('quilt',
    '<rect x="12" y="16" width="72" height="64" rx="8" fill="' + M('var(--a-cream)') + '"/>' +
    '<rect x="12" y="16" width="24" height="21" fill="var(--a-pink)"/><rect x="60" y="16" width="24" height="21" fill="var(--a-fish)"/><rect x="36" y="37" width="24" height="22" fill="var(--a-leaf)"/><rect x="12" y="59" width="24" height="21" fill="var(--a-gold)"/><rect x="60" y="59" width="24" height="21" fill="var(--a-plum)"/>' +
    '<rect x="12" y="16" width="72" height="64" rx="8" fill="none" stroke="var(--surface)" stroke-width="3" stroke-dasharray="5 5"/>' + ln('M36 16v64M60 16v64M12 37h72M12 59h72', 2, '.2'));
  A.add('quiz',
    '<rect x="10" y="20" width="76" height="56" rx="8" fill="' + M('var(--a-wood)') + '"/><rect x="18" y="30" width="18" height="36" rx="4" fill="var(--a-cream)"/><rect x="39" y="30" width="18" height="36" rx="4" fill="var(--a-cream)"/><rect x="60" y="30" width="18" height="36" rx="4" fill="var(--a-gold)"/>' +
    '<path d="M44 42c0-6 8-6 8 0 0 4-4 4-4 8" stroke="var(--stage-deep)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="48" cy="57" r="2" fill="var(--stage-deep)"/>' +
    '<path d="M23 42c0-6 8-6 8 0 0 4-4 4-4 8" stroke="var(--stage-deep)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="27" cy="57" r="2" fill="var(--stage-deep)"/>' + ln('M64 48l4 5 8-10', 3));
  A.add('quack',
    '<ellipse cx="40" cy="66" rx="24" ry="15" fill="' + M('var(--a-cream)') + '"/><circle cx="56" cy="44" r="13" fill="' + M('var(--a-cream)') + '"/>' + eye(60, 42, 2.4) +
    '<path d="M66 44l16-6v6zM66 48l16 6v-5z" fill="var(--warm)"/>' + ln('M84 28c4 4 4 10 0 14M90 22c7 8 7 18 0 26', 2.5, '.5') + '<ellipse cx="42" cy="84" rx="34" ry="5" fill="var(--a-fish)" opacity=".5"/>');
  A.add('red',
    '<path d="M22 14h20v44l22 8c6 2 8 6 8 12v6H22z" fill="' + M('var(--a-red)') + '"/>' + hi('M26 18h6v40h-6z', '.3') + sh('M22 78h50v6H22z', '.18') +
    '<path d="M22 14h20v8H22z" fill="var(--surface)" opacity=".35"/><ellipse cx="78" cy="88" rx="12" ry="3" fill="var(--a-fish)" opacity=".5"/>');
  A.add('rain',
    '<path d="M24 46a14 14 0 012-28 20 20 0 0138-4 15 15 0 016 32z" fill="' + M('var(--a-steel)') + '"/>' + hi('M30 24c4-6 10-8 16-7-6 1-12 3-16 7z', '.5') +
    '<path d="M28 58l-5 12M44 58l-5 12M60 58l-5 12M36 74l-5 12M52 74l-5 12M68 72l-5 12" stroke="var(--a-fish)" stroke-width="4" stroke-linecap="round"/>');
  A.add('ring',
    '<circle cx="48" cy="60" r="22" fill="none" stroke="' + M('var(--a-gold)') + '" stroke-width="9"/><path d="M34 26l14-14 14 14-14 16z" fill="var(--a-red)"/>' + hi('M40 26l8-8 4 4-8 8z', '.5') + hi('M32 50c2-6 6-10 10-12-4 4-7 8-8 14z', '.5'));
  A.add('robot',
    '<rect x="26" y="20" width="44" height="34" rx="8" fill="' + M('var(--a-steel)') + '"/><rect x="30" y="58" width="36" height="26" rx="6" fill="' + M('var(--a-steel)') + '"/>' +
    '<circle cx="38" cy="36" r="6" fill="var(--a-gold)"/><circle cx="58" cy="36" r="6" fill="var(--a-gold)"/>' + eye(38, 36, 2.2) + eye(58, 36, 2.2) + '<rect x="40" y="45" width="16" height="4" rx="2" fill="var(--ink-2)"/>' +
    '<rect x="46" y="8" width="4" height="12" fill="var(--ink-2)"/><circle cx="48" cy="8" r="4" fill="var(--a-red)"/><rect x="14" y="60" width="12" height="6" rx="3" fill="var(--ink-2)"/><rect x="70" y="60" width="12" height="6" rx="3" fill="var(--ink-2)"/>' +
    '<circle cx="48" cy="70" r="5" fill="var(--a-red)"/><rect x="34" y="84" width="8" height="8" rx="2" fill="var(--ink-2)"/><rect x="54" y="84" width="8" height="8" rx="2" fill="var(--ink-2)"/>');
})(window);
