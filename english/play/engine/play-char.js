/* ============================================================
 * 영어 놀이터 — 내 캐릭터(PlayChar) : 2D 파츠 조립(SVG 레이어) (설계 v1 §4)
 *   처음엔 빈 모습(연한 회색 몸만). 열매(§5)가 쌓일수록 완성 — 「입은 것은 전부 내가 말해서 얻은 영어」.
 *   파츠는 PlaySeed.parts() 에 있는 것만 그린다. 3D 는 공간이 들어올 때.
 *   PlayChar.render(el, { parts:{apron:'2026-11-09'}, mood:'happy'|'blank'|'cheer' })
 * ============================================================ */
(function (g) {
  'use strict';
  var PARTS = {
    apron: function () {   /* 점심 가게 — 앞치마 */
      return '<path d="M70 118 L130 118 L136 178 Q100 190 64 178 Z" fill="#FF8A3D"/>' +
             '<rect x="86" y="104" width="28" height="16" rx="4" fill="#FF8A3D"/>' +
             '<path d="M90 104 L72 92 M110 104 L128 92" stroke="#C77C00" stroke-width="4" stroke-linecap="round"/>' +
             '<rect x="86" y="140" width="28" height="16" rx="5" fill="#FFF3E0"/>';
    }
  };
  function face(mood) {
    if (mood === 'blank') return '<circle cx="86" cy="64" r="3" fill="#CBD5E0"/><circle cx="114" cy="64" r="3" fill="#CBD5E0"/>';
    var mouth = mood === 'cheer' ? '<path d="M84 80 Q100 98 116 80 Z" fill="#E53E3E"/>' : '<path d="M86 80 Q100 92 114 80" stroke="#2D3748" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return '<circle cx="86" cy="64" r="4" fill="#2D3748"/><circle cx="114" cy="64" r="4" fill="#2D3748"/>' + mouth +
           '<circle cx="74" cy="76" r="6" fill="#FFB4A2" opacity=".7"/><circle cx="126" cy="76" r="6" fill="#FFB4A2" opacity=".7"/>';
  }
  g.PlayChar = {
    PARTS: PARTS,
    svg: function (opt) {
      opt = opt || {}; var parts = opt.parts || {}; var blank = !Object.keys(parts).length && opt.mood !== 'cheer';
      var skin = blank ? '#E2E8F0' : '#FFE0B2', body = blank ? '#EDF2F7' : '#90CAF9';
      var s = '<svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="100" cy="190" rx="46" ry="8" fill="rgba(0,0,0,.08)"/>' +
        '<path d="M62 118 Q100 100 138 118 L142 182 Q100 194 58 182 Z" fill="' + body + '"/>' +
        '<circle cx="100" cy="66" r="42" fill="' + skin + '"/>' +
        (blank ? '' : '<path d="M60 60 Q100 10 140 60 Q120 44 100 48 Q80 44 60 60 Z" fill="#5D4037"/>') +
        face(blank ? 'blank' : (opt.mood || 'happy'));
      Object.keys(parts).forEach(function (k) { if (PARTS[k]) s += PARTS[k](); });
      return s + '</svg>';
    },
    render: function (el, opt) { el.innerHTML = this.svg(opt); }
  };
})(window);
