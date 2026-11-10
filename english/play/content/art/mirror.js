/* ============================================================
 * 영어 놀이터 — 그린 그림 : 변신 거울 (Lv2 #15 몸·얼굴 · #30 기분·상태) + 인물 얼굴 카드(Ben·Max·Mina·Amy·Sam)
 *   규격·색 규칙은 content/art/art.js 머리말. 기분 여덟은 같은 얼굴에 눈썹·입·소품만 바꾼다(얼굴 하나 = 기분 하나).
 *   eye 는 우리 집 see(눈) 그림을 같은 모양으로 다시 그린다(이름이 다름).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var ln = function (d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.8) + '" fill="none" stroke-linecap="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };

  /* ── 몸·얼굴(lv2-15) ── */
  A.add('face', '<circle cx="48" cy="50" r="32" fill="' + M('var(--skin-2)') + '"/><path d="M16 46c2-28 62-30 64 0-10-14-54-14-64 0z" fill="var(--hair-2)"/>' +
    '<circle cx="37" cy="50" r="3" fill="' + INK + '"/><circle cx="59" cy="50" r="3" fill="' + INK + '"/>' + ln('M40 64q8 6 16 0') +
    '<circle cx="28" cy="60" r="5" fill="var(--cheek)" opacity=".45"/><circle cx="68" cy="60" r="5" fill="var(--cheek)" opacity=".45"/>');
  A.add('nose', '<circle cx="48" cy="50" r="32" fill="var(--skin-2)" opacity=".45"/><path d="M48 28c6 10 12 22 12 30 0 6-6 8-12 8s-12-2-12-8c0-8 6-20 12-30z" fill="' + M('var(--skin-3)') + '"/>' +
    '<ellipse cx="42" cy="62" rx="3" ry="2" fill="' + INK + '" opacity=".5"/><ellipse cx="54" cy="62" rx="3" ry="2" fill="' + INK + '" opacity=".5"/>');
  A.add('bone', '<path d="M30 40l36 16" stroke="' + M('var(--a-cream)') + '" stroke-width="12" stroke-linecap="round"/>' +
    '<circle cx="24" cy="34" r="8" fill="' + M('var(--a-cream)') + '"/><circle cx="30" cy="46" r="8" fill="' + M('var(--a-cream)') + '"/><circle cx="66" cy="50" r="8" fill="' + M('var(--a-cream)') + '"/><circle cx="72" cy="62" r="8" fill="' + M('var(--a-cream)') + '"/>' +
    '<path d="M28 44l36 16" stroke="' + INK + '" stroke-width="2" opacity=".12"/>');
  A.add('hand', '<path d="M30 86V56l-6-14c-2-4 4-7 6-3l6 12V24c0-4 6-4 6 0v22-26c0-4 6-4 6 0v26-22c0-4 6-4 6 0v24-18c0-4 6-4 6 0v34c0 14-6 24-18 24z" fill="' + M('var(--skin-2)') + '"/>' +
    '<path d="M42 70h14" stroke="' + INK + '" stroke-width="2" opacity=".2" stroke-linecap="round"/>');
  A.add('feet', '<path d="M18 40c0-8 12-8 12 0v30c0 6 14 4 14 12 0 4-4 6-10 6H22c-4 0-6-4-6-8z" fill="' + M('var(--skin-2)') + '"/>' +
    '<path d="M56 40c0-8 12-8 12 0v30c0 6 14 4 14 12 0 4-4 6-10 6H60c-4 0-6-4-6-8z" fill="' + M('var(--skin-2)') + '"/>' +
    '<circle cx="40" cy="82" r="2" fill="' + INK + '" opacity=".2"/><circle cx="78" cy="82" r="2" fill="' + INK + '" opacity=".2"/>');
  A.add('eye', '<path d="M10 48c10-16 24-24 38-24s28 8 38 24c-10 16-24 24-38 24S20 64 10 48z" fill="var(--surface)"/>' +
    '<circle cx="48" cy="48" r="15" fill="' + M('var(--a-leaf)') + '"/><circle cx="48" cy="48" r="7" fill="' + INK + '"/><circle cx="44" cy="44" r="3" fill="' + SURF + '"/>' +
    ln('M10 48c10-16 24-24 38-24s28 8 38 24c-10 16-24 24-38 24S20 64 10 48z', 3, '.6'));
  A.add('hair', '<path d="M14 62c-2-30 14-48 34-48s36 18 34 48c-4-10-8-18-12-22-6 6-16 8-22 4-6 4-16 4-22-2-4 6-8 12-12 20z" fill="' + M('var(--hair-3)') + '"/>' +
    '<path d="M30 30c6-6 14-8 22-6" stroke="' + SURF + '" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>');

  /* ── 기분·상태(lv2-30) — 같은 얼굴, 눈썹·입·소품만 ── */
  function mood(eyes, mouth, extra) {
    return '<circle cx="48" cy="52" r="32" fill="' + M('var(--skin-2)') + '"/><path d="M16 48c2-28 62-30 64 0-10-14-54-14-64 0z" fill="var(--hair-1)"/>' + eyes + mouth + (extra || '');
  }
  var dots = '<circle cx="37" cy="52" r="3" fill="' + INK + '"/><circle cx="59" cy="52" r="3" fill="' + INK + '"/>';
  A.add('happy', mood(ln('M32 52q5-6 10 0M54 52q5-6 10 0'), '<path d="M34 64q14 16 28 0z" fill="' + INK + '"/>', '<circle cx="26" cy="62" r="5" fill="var(--cheek)" opacity=".5"/><circle cx="70" cy="62" r="5" fill="var(--cheek)" opacity=".5"/>'));
  A.add('sad', mood(dots + ln('M31 44l10 3M65 44l-10 3', 2.4), ln('M38 72q10-8 20 0'), '<path d="M36 58c-2 4-2 8 1 9 2-1 2-5-1-9z" fill="var(--a-fish)"/>'));
  A.add('mad', mood(dots + ln('M30 42l12 6M66 42l-12 6', 3), ln('M38 70h20', 3), '<path d="M72 26l4 8M78 22l-2 8M84 28l-8 2" stroke="var(--a-red)" stroke-width="3" stroke-linecap="round"/>'));
  A.add('fine', mood(dots, ln('M40 66q8 5 16 0'), '<path d="M74 70h10v4H74zM76 62h6v8h-6z" fill="var(--ok)" opacity=".7"/>'));
  A.add('nice', mood(dots, ln('M38 64q10 8 20 0'), '<path d="M78 24l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="var(--warm)"/>'));
  A.add('sick', mood(ln('M32 52h10M54 52h10', 2.6), ln('M40 70q8-4 16 0', 2.4), '<rect x="64" y="66" width="22" height="6" rx="3" fill="var(--a-steel)" transform="rotate(-30 75 69)"/><path d="M66 74l4-2" stroke="var(--a-red)" stroke-width="3"/>'));
  A.add('hot', mood(dots, '<ellipse cx="48" cy="68" rx="5" ry="4" fill="' + INK + '"/>', '<path d="M24 34c-2 4-2 8 1 9 2-1 2-5-1-9zM76 36c-2 4-2 8 1 9 2-1 2-5-1-9z" fill="var(--a-fish)"/><circle cx="80" cy="16" r="8" fill="var(--warm)"/>'));
  A.add('wet', mood(dots, ln('M40 68q8 4 16 0'), '<path d="M20 20c-2 4-2 8 1 9 2-1 2-5-1-9zM48 8c-2 4-2 8 1 9 2-1 2-5-1-9zM76 18c-2 4-2 8 1 9 2-1 2-5-1-9z" fill="var(--a-fish)"/><path d="M20 30l-6 12M78 30l6 12" stroke="var(--a-fish)" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>'));

  /* ── 인물 얼굴 카드(문장 카드의 그림 — I am Ben. 등) — core/npc.js 의 머리 모양을 단순하게 ── */
  function portrait(skin, hair, style) {
    var h = style === 'spiky' ? '<path d="M16 48l6-22 8 10 8-16 8 14 10-16 6 16 10-10 4 24c-12-10-48-10-60 0z" fill="' + hair + '"/>'
      : style === 'buns' ? '<circle cx="22" cy="24" r="10" fill="' + hair + '"/><circle cx="74" cy="24" r="10" fill="' + hair + '"/><path d="M16 50c2-30 62-32 64 0-10-14-54-14-64 0z" fill="' + hair + '"/>'
      : style === 'long' ? '<path d="M14 80c-4-40 6-62 34-62s38 22 34 62h-10V54H24v26z" fill="' + hair + '"/>'
      : style === 'band' ? '<path d="M16 50c2-30 62-32 64 0-10-14-54-14-64 0z" fill="' + hair + '"/><path d="M18 40h60" stroke="var(--a-red)" stroke-width="5"/>'
      : '<path d="M16 50c2-30 62-32 64 0-10-14-54-14-64 0z" fill="' + hair + '"/>';
    return (style === 'long' ? h : '') + '<circle cx="48" cy="54" r="30" fill="' + skin + '"/>' + (style === 'long' ? '<path d="M18 50c2-26 58-28 60 0-10-12-50-12-60 0z" fill="' + hair + '"/>' : h) +
      '<circle cx="38" cy="56" r="2.8" fill="' + INK + '"/><circle cx="58" cy="56" r="2.8" fill="' + INK + '"/>' + ln('M42 68q6 4 12 0', 2.4);
  }
  A.add('ben', portrait('var(--skin-2)', 'var(--hair-3)', 'spiky'));
  A.add('mina', portrait('var(--skin-1)', 'var(--hair-1)', 'buns'));
  A.add('amy', portrait('var(--skin-3)', 'var(--hair-2)', 'long'));
  A.add('max', portrait('var(--skin-4)', 'var(--hair-4)', 'band'));
  A.add('sam', portrait('var(--skin-2)', 'var(--hair-1)', 'plain'));
  /* 로봇 몸통(로봇 공장 — 부품을 붙이는 자리) */
  A.add('robot-body', '<rect x="22" y="10" width="52" height="40" rx="10" fill="' + M('var(--a-steel)') + '"/><path d="M48 2v8" stroke="' + INK + '" stroke-width="3" opacity=".5"/><circle cx="48" cy="3" r="3" fill="var(--warm)"/>' +
    '<rect x="28" y="54" width="40" height="34" rx="8" fill="' + M('var(--a-steel)') + '"/><circle cx="48" cy="68" r="5" fill="var(--warm)"/><path d="M36 80h24" stroke="' + INK + '" stroke-width="2" opacity=".25"/>');
  /* 크다 · 여기 */
  A.add('big', '<path d="M14 88h68" stroke="' + INK + '" stroke-width="2" opacity=".2"/><circle cx="34" cy="30" r="12" fill="var(--skin-2)"/><path d="M22 46h24l4 42H18z" fill="' + M('var(--stage)') + '"/>' +
    '<circle cx="72" cy="70" r="5" fill="var(--skin-2)"/><path d="M67 76h10l2 12H65z" fill="var(--stage-2)"/>' + ln('M58 20v18M52 26l6-6 6 6', 2.4, '.5'));
  A.add('here', '<path d="M48 86c-14-18-24-30-24-44a24 24 0 0 1 48 0c0 14-10 26-24 44z" fill="' + M('var(--a-red)') + '"/><circle cx="48" cy="42" r="9" fill="' + SURF + '"/>' +
    '<ellipse cx="48" cy="88" rx="14" ry="3" fill="' + INK + '" opacity=".12"/>');
})(window);
