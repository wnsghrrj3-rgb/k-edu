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
    },
    leafhat: function () {   /* 소리 숲(Lv1) — 나뭇잎 모자 */
      return '<g data-part="leafhat"><path d="M54 46c8-26 30-34 46-34s38 8 46 34c-14-8-30-12-46-12s-32 4-46 12z" fill="var(--a-leaf)"/>' +
             '<path d="M100 12c-2 10 0 18 4 22" stroke="var(--a-wood)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
             '<path d="M104 14c10-10 22-8 26-2-8 6-18 6-26 2z" fill="var(--a-leaf)"/><path d="M70 36c10-6 22-9 30-9" stroke="var(--surface)" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/></g>';
    },
    backpack: function () {   /* 교실(Lv2) — 책가방 멜빵 */
      return '<g data-part="backpack"><path d="M80 136l-6 50M120 136l6 50" stroke="var(--a-fish)" stroke-width="7" stroke-linecap="round"/>' +
             '<rect x="128" y="146" width="18" height="30" rx="6" fill="var(--a-fish)"/><path d="M131 158h12" stroke="var(--surface)" stroke-width="2" opacity=".5"/></g>';
    },
    sneakers: function () {   /* 운동장(Lv2) — 운동화 */
      return '<g data-part="sneakers"><path d="M70 186h24c4 0 6 3 6 6H66c0-3 1-6 4-6zM106 186h24c3 0 4 3 4 6H100c0-3 2-6 6-6z" fill="var(--a-red)"/>' +
             '<path d="M70 190h28M104 190h28" stroke="var(--surface)" stroke-width="2" opacity=".7"/></g>';
    },
    key: function () {   /* 마법 자판기(Lv2) — 목에 건 자판기 열쇠 */
      return '<g data-part="key"><path d="M86 130l14 18 14-18" stroke="var(--stage-2)" stroke-width="3" fill="none"/><circle cx="100" cy="152" r="6" fill="var(--warm)"/><path d="M100 158v10M100 164h5" stroke="var(--warm)" stroke-width="4"/></g>';
    },
    hat: function () {   /* 변신 거울(Lv2) — 챙 모자 */
      return '<g data-part="hat"><path d="M40 44c0 0 20-6 60-6s60 6 60 6c-8 6-30 8-60 8s-52-2-60-8z" fill="var(--a-plum)"/><path d="M62 42c0-20 16-30 38-30s38 10 38 30z" fill="var(--a-plum)"/><path d="M62 36h76" stroke="var(--warm)" stroke-width="5"/></g>';
    },
    bookmark: function () {   /* 그림책방(Lv2) — 손에 든 책갈피 */
      return '<g data-part="bookmark"><path d="M136 140h12v30l-6-5-6 5z" fill="var(--a-red)"/><circle cx="142" cy="146" r="2.5" fill="var(--surface)"/></g>';
    },
    bandana: function () {   /* 동물 농장(Lv1) — 목수건 */
      return '<g data-part="bandana"><path d="M72 128c18 8 38 8 56 0l-6 12c-14 5-30 5-44 0z" fill="var(--a-red)"/>' +
             '<path d="M92 136l8 22 8-22z" fill="var(--a-red)"/><circle cx="90" cy="134" r="2" fill="var(--surface)" opacity=".6"/><circle cx="110" cy="134" r="2" fill="var(--surface)" opacity=".6"/></g>';
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
