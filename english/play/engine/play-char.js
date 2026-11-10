/* ============================================================
 * 영어 놀이터 — 내 캐릭터(PlayChar) : 2D 파츠 조립(SVG 레이어) (설계 v1 §4 · 게임설계 §15 캐릭터 규범)
 *   처음엔 빈 모습(옅은 윤곽만). 열매(§5)가 쌓일수록 완성 — 「입은 것은 전부 내가 말해서 얻은 영어」.
 *   파츠는 PlaySeed.parts() 에 있는 것만 그린다. 머리 큰 2.5등신·선 표정·색은 토큰만. 3D 는 공간이 들어올 때.
 *   PlayChar.render(el, { parts:{apron:'2026-11-09'}, mood:'happy'|'blank'|'cheer' })
 * ============================================================ */
(function (g) {
  'use strict';
  var INK = 'var(--ink)';
  var PARTS = {
    apron: function () {   /* 점심 가게 — 앞치마 */
      return '<g data-part="apron"><path d="M76 132h48l7 52c-20 8-42 8-62 0z" fill="var(--stage)"/>' +
             '<path d="M84 132c2-10 30-10 32 0" stroke="var(--stage)" stroke-width="5" fill="none"/>' +
             '<rect x="88" y="150" width="24" height="14" rx="4" fill="var(--a-cream)"/></g>';
    },
    goggles: function () {   /* 소리 공방 — 보안경 */
      return '<g data-part="goggles"><path d="M58 70h84" stroke="var(--stage-deep)" stroke-width="5" stroke-linecap="round"/>' +
             '<circle cx="86" cy="72" r="13" fill="var(--a-fish)" opacity=".45"/><circle cx="114" cy="72" r="13" fill="var(--a-fish)" opacity=".45"/>' +
             '<circle cx="86" cy="72" r="13" fill="none" stroke="var(--stage-deep)" stroke-width="4"/><circle cx="114" cy="72" r="13" fill="none" stroke="var(--stage-deep)" stroke-width="4"/></g>';
    }
  };
  function line(d, w) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 4) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function face(mood) {
    if (mood === 'blank') return '<circle cx="86" cy="74" r="3" fill="var(--ink-4)"/><circle cx="114" cy="74" r="3" fill="var(--ink-4)"/>';
    var cheek = '<circle cx="72" cy="88" r="7" fill="var(--cheek)" opacity=".45"/><circle cx="128" cy="88" r="7" fill="var(--cheek)" opacity=".45"/>';
    if (mood === 'cheer') return cheek + line('M79 75q7-8 14 0M107 75q7-8 14 0') + line('M86 88h28q-4 14-14 14t-14-14z');
    return cheek + '<circle cx="86" cy="74" r="4" fill="' + INK + '"/><circle cx="114" cy="74" r="4" fill="' + INK + '"/>' + line('M90 90q10 7 20 0');
  }
  g.PlayChar = {
    PARTS: PARTS,
    svg: function (opt) {
      opt = opt || {}; var parts = opt.parts || {}; var blank = !Object.keys(parts).length && opt.mood !== 'cheer';
      var skin = blank ? 'var(--surface-3)' : 'var(--skin-2)', body = blank ? 'var(--surface-2)' : 'var(--stage-2)';
      var s = '<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" data-mood="' + (blank ? 'blank' : (opt.mood || 'happy')) + '">' +
        '<ellipse cx="100" cy="192" rx="44" ry="6" fill="' + INK + '" opacity=".08"/>' +
        '<path d="M70 192c0-40 12-58 30-58s30 18 30 58z" fill="' + body + '"/>' +
        '<circle cx="100" cy="76" r="50" fill="' + skin + '"/>' +
        (blank ? '' : '<path d="M50 72c0-30 22-48 50-48s50 18 50 48c-10-16-28-22-50-22s-40 6-50 22z" fill="var(--hair-2)"/>') +
        face(blank ? 'blank' : (opt.mood || 'happy'));
      Object.keys(parts).forEach(function (k) { if (PARTS[k]) s += PARTS[k](); });
      return s + '</svg>';
    },
    render: function (el, opt) { el.innerHTML = this.svg(opt); }
  };
})(window);
