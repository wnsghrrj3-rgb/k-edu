/* ============================================================
 * 영어 놀이터 — 등장인물(PlayNpc) 최소판 (게임설계 v1 §6)
 *   SVG 한 장에 표정 3종(기본 idle · 웃음 smile · 갸웃 tilt)을 모두 그려 두고 보이는 것만 바꾼다.
 *   맛보기: 가게 주인 Sam + 손님 Mina·Ben. (표정 5 × 몸짓 3 · Amy·Max 는 공통 연출 묶음에서 늘린다)
 *   PlayNpc.render(el, 'sam', { face:'idle' })
 *   PlayNpc.face(el, 'smile')                — 표정만 바꿈(그대로 유지)
 *   PlayNpc.react(el, 'ok'|'no'|'wait')      — 성공=웃음 · 실패=갸웃 · 대기=기본. ok·no 는 잠시 뒤 기본으로 돌아온다
 *   아이 화면에 「틀렸다」는 없다 — 갸웃은 「응? 다시 말해 줄래?」 의 몸짓.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    hold: 1100,     /* 웃음·갸웃을 유지하는 시간(ms) — 지나면 기본 표정 */
    tilt: -11       /* 갸웃 각도(도) */
  };
  var FACES = ['idle', 'smile', 'tilt'];
  var REACT = { ok: 'smile', no: 'tilt', wait: 'idle' };
  var INK = '#2D3748';
  var WHO = {
    sam:  { name: 'Sam',  skin: '#FFD9B3', hair: '#6B4226', top: '#FFFFFF', line: '#E2E8F0', accent: '#FF8A3D', style: 'chef' },
    mina: { name: 'Mina', skin: '#FFE2C4', hair: '#3E2723', top: '#F783AC', line: '#E64980', accent: '#FFD43B', style: 'buns' },
    ben:  { name: 'Ben',  skin: '#F7CFA8', hair: '#D9730D', top: '#51CF66', line: '#2F9E44', accent: '#FFFFFF', style: 'spiky' }
  };

  function hair(L) {
    if (L.style === 'chef') return '<path d="M27 50 Q26 36 36 30 L84 30 Q94 36 93 50 Q88 40 82 38 L38 38 Q32 40 27 50 Z" fill="' + L.hair + '"/>' +
      '<path d="M36 32 Q24 12 44 10 Q52 -2 66 6 Q86 0 86 16 Q98 24 84 34 Z" fill="#fff" stroke="#E2E8F0" stroke-width="2"/>' +
      '<rect x="34" y="28" width="52" height="11" rx="4" fill="#fff" stroke="#E2E8F0" stroke-width="2"/>';
    if (L.style === 'buns') return '<circle cx="30" cy="26" r="12" fill="' + L.hair + '"/><circle cx="90" cy="26" r="12" fill="' + L.hair + '"/>' +
      '<circle cx="30" cy="34" r="4" fill="' + L.accent + '"/><circle cx="90" cy="34" r="4" fill="' + L.accent + '"/>' +
      '<path d="M26 54 Q28 20 60 20 Q92 20 94 54 Q80 36 60 38 Q40 36 26 54 Z" fill="' + L.hair + '"/>';
    return '<path d="M26 52 L32 24 L43 34 L51 14 L61 31 L71 14 L79 34 L89 24 L94 52 Q78 36 60 38 Q42 36 26 52 Z" fill="' + L.hair + '"/>';
  }
  function extra(L) {
    if (L.style === 'chef') return '<path d="M46 98 L60 112 L74 98 Z" fill="' + L.accent + '"/>';
    if (L.style === 'spiky') return '<circle cx="42" cy="64" r="1.3" fill="#C98A52"/><circle cx="46" cy="67" r="1.3" fill="#C98A52"/><circle cx="74" cy="67" r="1.3" fill="#C98A52"/><circle cx="78" cy="64" r="1.3" fill="#C98A52"/>';
    return '';
  }
  function faces(face) {
    function grp(f, inner) { return '<g data-f="' + f + '"' + (f === face ? '' : ' style="display:none"') + '>' + inner + '</g>'; }
    var st = ' stroke="' + INK + '" fill="none" stroke-linecap="round"';
    var cheek = function (o) { return '<circle cx="38" cy="67" r="6" fill="#FF9E8A" opacity="' + o + '"/><circle cx="82" cy="67" r="6" fill="#FF9E8A" opacity="' + o + '"/>'; };
    return grp('idle', cheek('.45') + '<circle cx="48" cy="56" r="3.8" fill="' + INK + '"/><circle cx="72" cy="56" r="3.8" fill="' + INK + '"/>' +
        '<path d="M52 70 Q60 77 68 70" stroke-width="3.2"' + st + '/>') +
      grp('smile', cheek('.85') + '<path d="M42 58 Q48 49 54 58 M66 58 Q72 49 78 58" stroke-width="3.4"' + st + '/>' +
        '<path d="M49 67 Q60 86 71 67 Z" fill="#E5484D"/>') +
      grp('tilt', cheek('.45') + '<circle cx="48" cy="57" r="3.8" fill="' + INK + '"/><circle cx="72" cy="55" r="4.4" fill="' + INK + '"/>' +
        '<path d="M42 48 L54 48 M66 45 Q72 40 78 45" stroke-width="2.8"' + st + '/>' +
        '<ellipse cx="60" cy="73" rx="4.2" ry="5" fill="' + INK + '"/>');
  }
  function svg(who, face) {
    var id = WHO[who] ? who : 'sam', L = WHO[id];
    face = FACES.indexOf(face) >= 0 ? face : 'idle';
    return '<svg viewBox="0 0 120 130" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + L.name + '" data-who="' + id + '" data-face="' + face + '">' +
      '<path d="M20 130 Q20 98 60 98 Q100 98 100 130 Z" fill="' + L.top + '" stroke="' + L.line + '" stroke-width="2"/>' +
      (L.style === 'chef' ? extra(L) : '') +
      '<g class="hd"' + (face === 'tilt' ? ' style="transform:rotate(' + CONF.tilt + 'deg)"' : '') + '>' +
        '<circle cx="60" cy="56" r="34" fill="' + L.skin + '"/>' + hair(L) + (L.style === 'chef' ? '' : extra(L)) + faces(face) +
      '</g>' +
      '<text data-f="tilt"' + (face === 'tilt' ? '' : ' style="display:none"') + ' x="100" y="30" font-size="26" font-weight="700" font-family="Jua,sans-serif" fill="#F59F00" text-anchor="middle">?</text>' +
      '</svg>';
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  var PlayNpc = {
    CONF: CONF, WHO: WHO, FACES: FACES,
    svg: svg,
    render: function (el, who, opt) {
      var face = (opt && opt.face) || 'idle';
      clearTimeout(el._npcT);
      el.innerHTML = svg(who, face);
      el.classList.add('npc');
      el.setAttribute('data-who', WHO[who] ? who : 'sam');
      el.setAttribute('data-face', FACES.indexOf(face) >= 0 ? face : 'idle');
      return el;
    },
    /* 표정만 바꾼다 — 다시 그리지 않아 고개 기울임이 부드럽게 이어진다 */
    face: function (el, face) {
      if (!el) return;
      if (FACES.indexOf(face) < 0) face = 'idle';
      clearTimeout(el._npcT);
      var sv = el.querySelector('svg');
      if (!sv) return this.render(el, el.getAttribute('data-who') || 'sam', { face: face });
      el.setAttribute('data-face', face); sv.setAttribute('data-face', face);
      each(el.querySelectorAll('[data-f]'), function (n) { n.style.display = n.getAttribute('data-f') === face ? '' : 'none'; });
      var hd = el.querySelector('.hd'); if (hd) hd.style.transform = face === 'tilt' ? 'rotate(' + CONF.tilt + 'deg)' : '';
    },
    react: function (el, kind) {
      if (!el) return;
      var face = REACT[kind] || 'idle', self = this;
      this.face(el, face);
      el.classList.remove('npc-ok'); el.classList.remove('npc-no');
      if (kind === 'ok' || kind === 'no') {
        void el.offsetWidth;                      /* 같은 반응이 이어져도 몸짓이 다시 시작되게 */
        el.classList.add(kind === 'ok' ? 'npc-ok' : 'npc-no');
        el._npcT = setTimeout(function () { self.face(el, 'idle'); el.classList.remove('npc-ok'); el.classList.remove('npc-no'); }, CONF.hold);
      }
    }
  };
  g.PlayNpc = PlayNpc;
})(window);
