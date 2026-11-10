/* ============================================================
 * 영어 놀이터 — 그린 그림 : 운동장 동작 (Lv2 #7 동작① · #32 동작②)
 *   펼침 「동사는 정지 그림이 근거로 약하다 → 동작 그림 + 짧은 CSS 움직임을 근거로」 — 아이 한 명이 동작마다 자세를 바꾼다.
 *   움직임은 play.css 의 svg[data-art="jump"] 같은 규칙(.act-go 안에서만 움직인다). 규격·색은 content/art/art.js 머리말.
 *   몸은 --art-main(기본 무대색) — 옷 색만 바뀐다. 팔다리 = 굵은 둥근 선(외곽선 아님).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = 'var(--art-main, var(--stage))', SKIN = 'var(--skin-2)', HAIR = 'var(--hair-2)', PANTS = 'var(--ink-2)';
  var limb = function (pts, col, w) { return '<polyline points="' + pts + '" fill="none" stroke="' + (col || SKIN) + '" stroke-width="' + (w || 7) + '" stroke-linecap="round" stroke-linejoin="round"/>'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.5) + '" fill="none" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };
  /* 머리 — 얼굴 방향 그대로, 입 모양만 고른다 */
  function head(x, y, mouth) {
    return '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + SKIN + '"/>' +
      '<path d="M' + (x - 11) + ' ' + (y - 1) + 'c1-9 21-11 22 0-5-5-17-5-22 0z" fill="' + HAIR + '"/>' +
      '<circle cx="' + (x - 4) + '" cy="' + (y + 1) + '" r="1.5" fill="' + INK + '"/><circle cx="' + (x + 4) + '" cy="' + (y + 1) + '" r="1.5" fill="' + INK + '"/>' +
      (mouth === 'open' ? '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="2.6" ry="3" fill="' + INK + '"/>' : ln('M' + (x - 3) + ' ' + (y + 5) + 'q3 3 6 0', 1.8));
  }
  /* 몸통 — 어깨 (x, y) 에서 엉덩이까지 */
  function torso(x, y, rot) { return '<path d="M' + (x - 9) + ' ' + y + 'h18l2 22h-22z" fill="' + M + '"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + (y + 11) + ')"' : '') + '/>'; }
  function shadow(y, rx) { return '<ellipse cx="48" cy="' + (y || 90) + '" rx="' + (rx || 16) + '" ry="3" fill="' + INK + '" opacity=".1"/>'; }
  /* 서 있는 기본 몸 — 팔 둘(어깨→팔꿈치→손)을 바꿔 끼운다 */
  function body(armL, armR, legs, mouth, extra) {
    return shadow() + limb(legs || '43,56 42,72 41,88', PANTS) + limb('53,56 54,72 55,88', PANTS) +
      torso(48, 34) + limb(armL) + limb(armR) + head(48, 21, mouth) + (extra || '');
  }

  /* ── 동작① (lv2-07) ── */
  A.add('stop', body('39,36 32,48 31,58', '57,36 70,36 82,36', null, null,
    '<circle cx="84" cy="36" r="5" fill="' + SKIN + '"/>' + '<path d="M76 18h12l6 6v12l-6 6H76l-6-6V24z" fill="var(--a-red)" opacity=".9"/>' + '<path d="M75 30h14" stroke="' + SURF + '" stroke-width="3" stroke-linecap="round"/>'));
  A.add('swim',
    '<path d="M8 66c8-6 16-6 24 0s16 6 24 0 16-6 24 0 8 4 8 4v14H8z" fill="var(--a-fish)" opacity=".55"/>' +
    '<path d="M26 54h30l2 10H26z" fill="' + M + '"/>' + limb('56,56 70,46 82,50') + limb('28,58 16,52 8,56') + limb('56,62 68,66 80,64', PANTS) +
    head(20, 52) + '<path d="M8 74c8-5 16-5 24 0s16 5 24 0 16-5 24 0" stroke="' + SURF + '" stroke-width="3" fill="none" opacity=".6"/>');
  A.add('clap', body('39,36 40,46 46,44', '57,36 56,46 50,44', null, 'open',
    ln('M40 32l-4-6M48 30v-7M56 32l4-6', 2.5, '.55')));
  A.add('drop', body('39,36 32,48 31,58', '57,36 64,46 66,54', null, null,
    '<circle cx="70" cy="76" r="7" fill="var(--a-red)"/>' + ln('M70 58v8M64 60l2 6M76 60l-2 6', 2.2, '.45')));
  A.add('grab', body('39,36 32,48 31,58', '57,36 66,24 72,14', null, null,
    '<circle cx="76" cy="10" r="7" fill="var(--a-red)"/>' + '<circle cx="72" cy="14" r="4" fill="' + SKIN + '"/>'));
  A.add('spin', body('39,36 26,34 14,34', '57,36 70,34 82,34', null, 'open',
    '<path d="M16 62c4 18 60 18 64 0" stroke="' + INK + '" stroke-width="2.5" fill="none" opacity=".45" stroke-dasharray="4 5"/><path d="M80 62l2 8-8-2z" fill="' + INK + '" opacity=".45"/>'));
  A.add('snap', body('39,36 32,48 31,58', '57,36 64,26 60,16', null, null,
    '<circle cx="60" cy="15" r="4" fill="' + SKIN + '"/>' + ln('M66 10l5-4M68 16h6M66 21l5 3', 2.4, '.6')));
  A.add('jump',
    shadow(92, 12) + limb('43,52 36,62 42,70', PANTS) + limb('53,52 60,62 54,70', PANTS) + torso(48, 30) +
    limb('39,32 30,20 26,8') + limb('57,32 66,20 70,8') + head(48, 17, 'open') + ln('M36 80h-8M68 80h-8M48 84v6', 2.4, '.35'));

  /* ── 동작② (lv2-32) ── */
  A.add('ride',
    '<circle cx="24" cy="76" r="12" fill="none" stroke="' + INK + '" stroke-width="4"/><circle cx="72" cy="76" r="12" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
    '<path d="M24 76l18-20h22l8 20M42 56l6 20h16" stroke="var(--a-steel)" stroke-width="4" fill="none" stroke-linejoin="round"/>' +
    limb('46,48 52,62 48,74', PANTS) + '<path d="M38 28h16l4 20H38z" fill="' + M + '"/>' + limb('52,30 62,42 64,52') + head(46, 17));
  A.add('wave', body('39,36 32,48 31,58', '57,36 66,26 66,14', null, 'open',
    '<circle cx="66" cy="12" r="5" fill="' + SKIN + '"/>' + ln('M74 6c4 4 4 10 0 14M79 3c6 6 6 16 0 22', 2.4, '.45')));
  A.add('stand', body('39,36 38,48 38,58', '57,36 58,48 58,58', null, null,
    '<path d="M20 90h56" stroke="' + INK + '" stroke-width="2" opacity=".2"/>'));
  A.add('sweep', body('39,36 46,48 54,54', '57,36 60,46 58,54', null, null,
    '<path d="M64 26L54 76" stroke="var(--a-wood)" stroke-width="4" stroke-linecap="round"/><path d="M46 74h18l4 14H42z" fill="var(--a-gold)"/>' + ln('M30 88c-4 0-8-2-10-4M24 84c-3-1-5-3-6-5', 2, '.3')));
  A.add('sing', body('39,36 34,46 40,54', '57,36 66,40 72,34', null, 'open',
    '<path d="M76 10v16" stroke="' + INK + '" stroke-width="2.6"/><ellipse cx="73" cy="27" rx="4" ry="3" fill="' + INK + '"/><path d="M76 10l8 3" stroke="' + INK + '" stroke-width="2.6"/>' +
    '<path d="M86 30v10" stroke="' + INK + '" stroke-width="2.2" opacity=".6"/><ellipse cx="84" cy="41" rx="3" ry="2.4" fill="' + INK + '" opacity=".6"/>'));
  A.add('wake',
    '<path d="M8 62h80v14H8z" fill="' + M + '" opacity=".35"/><path d="M8 56h4v32H8zM84 50h4v38h-4z" fill="var(--a-wood)"/>' +
    '<path d="M38 44h18l2 18H36z" fill="' + M + '"/>' + limb('40,46 30,34 26,22') + limb('56,46 66,34 70,22') + head(47, 33, 'open') +
    '<circle cx="80" cy="14" r="7" fill="var(--warm)"/>' + '<path d="M80 2v4M92 14h-4M88 6l-3 3" stroke="var(--warm)" stroke-width="2.6" stroke-linecap="round"/>');
  A.add('smile',
    '<circle cx="48" cy="48" r="30" fill="' + SKIN + '"/><path d="M18 44c2-24 58-26 60 0-10-12-50-12-60 0z" fill="' + HAIR + '"/>' +
    '<path d="M36 46q4-4 8 0M52 46q4-4 8 0" stroke="' + INK + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M34 58q14 14 28 0z" fill="' + INK + '"/><path d="M38 60q10 6 20 0" fill="' + SURF + '"/>' +
    '<circle cx="28" cy="56" r="5" fill="var(--cheek)" opacity=".5"/><circle cx="68" cy="56" r="5" fill="var(--cheek)" opacity=".5"/>');
})(window);
