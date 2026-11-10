/* ============================================================
 * 영어 놀이터 — 등장인물(PlayNpc) (게임설계 v1 §6)
 *   다섯 사람: Sam(가게 주인·튜터) · Mina(친절한 첫 손님) · Ben(장난꾸러기) · Amy(조용) · Max(활동·리듬)
 *   SVG 한 장에 표정 5(기본 idle · 웃음 smile · 놀람 wow · 갸웃 tilt · 환호 cheer)와
 *   몸짓 3(대기 wait · 성공 ok · 실패 no)을 모두 그려 두고 보이는 것만 바꾼다(다시 그리지 않음).
 *   무대마다 옷은 파츠 한 장(wear)만 바꾼다 — apron(가게) · bag(교실) · scarf(바깥).
 *
 *   PlayNpc.render(el, 'sam', { face:'idle', pose:'wait', wear:'apron' })
 *   PlayNpc.face(el, 'smile') · PlayNpc.pose(el, 'ok')     — 하나만 바꿈(그대로 유지)
 *   PlayNpc.react(el, 'ok'|'no'|'wait'|'wow'|'cheer', { stay:true })
 *       ok = 그 사람의 기쁜 표정 + 손 들기 · no = 갸웃 + 손을 턱에 · wait = 기본. ok·no·wow·cheer 는 잠시 뒤 기본으로(stay 면 유지)
 *   아이 화면에 「틀렸다」는 없다 — 갸웃은 「응? 다시 말해 줄래?」 의 몸짓.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    hold: 1100,     /* 반응 표정·몸짓을 유지하는 시간(ms) — 지나면 기본 */
    tilt: -11       /* 갸웃 각도(도) */
  };
  var FACES = ['idle', 'smile', 'wow', 'tilt', 'cheer'];
  var POSES = ['wait', 'ok', 'no'];
  var INK = '#2D3748';
  /* ok = 그 사람이 기쁠 때 짓는 표정(§6 표) */
  var WHO = {
    sam:  { name: 'Sam',  skin: '#FFD9B3', hair: '#6B4226', top: '#FFFFFF', line: '#E2E8F0', accent: '#FF8A3D', style: 'chef',  ok: 'smile' },
    mina: { name: 'Mina', skin: '#FFE2C4', hair: '#3E2723', top: '#F783AC', line: '#E64980', accent: '#FFD43B', style: 'buns',  ok: 'smile' },
    ben:  { name: 'Ben',  skin: '#F7CFA8', hair: '#D9730D', top: '#51CF66', line: '#2F9E44', accent: '#FFFFFF', style: 'spiky', ok: 'wow' },
    amy:  { name: 'Amy',  skin: '#FFE8D1', hair: '#5C3D2E', top: '#B197FC', line: '#7950F2', accent: '#4A5568', style: 'long',  ok: 'smile' },
    max:  { name: 'Max',  skin: '#C98F62', hair: '#2B2B2B', top: '#4DABF7', line: '#1C7ED6', accent: '#FF6B6B', style: 'band',  ok: 'cheer' }
  };
  var REACT = {
    ok:    function (L) { return { face: L.ok || 'smile', pose: 'ok' }; },
    no:    function () { return { face: 'tilt', pose: 'no' }; },
    wait:  function () { return { face: 'idle', pose: 'wait' }; },
    wow:   function () { return { face: 'wow', pose: 'wait' }; },
    cheer: function () { return { face: 'cheer', pose: 'ok' }; }
  };
  /* 무대 옷 — 몸통 위에 한 장 */
  var WEAR = {
    apron: '<path d="M41 106 L79 106 L83 130 L37 130 Z" fill="#FF8A3D"/><path d="M45 106 Q60 95 75 106" stroke="#C77C00" stroke-width="3" fill="none" stroke-linecap="round"/>',
    bag:   '<path d="M36 101 L86 130" stroke="#8D6E63" stroke-width="7" stroke-linecap="round"/><rect x="72" y="116" width="18" height="14" rx="4" fill="#A1887F"/>',
    scarf: '<path d="M38 98 Q60 111 82 98 L83 107 Q60 120 37 107 Z" fill="#4DABF7"/><path d="M70 108 L76 126 L66 124 Z" fill="#339AF0"/>'
  };

  /* 머리 뒤쪽(머리통보다 먼저) · 앞쪽(머리통 다음) */
  function hairBack(L) {
    if (L.style === 'long') return '<path d="M23 60 Q20 16 60 16 Q100 16 97 60 L99 102 L21 102 Z" fill="' + L.hair + '"/>';
    return '';
  }
  function hair(L) {
    if (L.style === 'chef') return '<path d="M27 50 Q26 36 36 30 L84 30 Q94 36 93 50 Q88 40 82 38 L38 38 Q32 40 27 50 Z" fill="' + L.hair + '"/>' +
      '<path d="M36 32 Q24 12 44 10 Q52 -2 66 6 Q86 0 86 16 Q98 24 84 34 Z" fill="#fff" stroke="#E2E8F0" stroke-width="2"/>' +
      '<rect x="34" y="28" width="52" height="11" rx="4" fill="#fff" stroke="#E2E8F0" stroke-width="2"/>';
    if (L.style === 'buns') return '<circle cx="30" cy="26" r="12" fill="' + L.hair + '"/><circle cx="90" cy="26" r="12" fill="' + L.hair + '"/>' +
      '<circle cx="30" cy="34" r="4" fill="' + L.accent + '"/><circle cx="90" cy="34" r="4" fill="' + L.accent + '"/>' +
      '<path d="M26 54 Q28 20 60 20 Q92 20 94 54 Q80 36 60 38 Q40 36 26 54 Z" fill="' + L.hair + '"/>';
    if (L.style === 'long') return '<path d="M26 56 Q26 20 60 20 Q94 20 94 56 Q84 34 60 36 Q52 36 46 40 Q36 44 26 56 Z" fill="' + L.hair + '"/>' +
      '<circle cx="48" cy="56" r="9" fill="none" stroke="' + L.accent + '" stroke-width="2.2"/><circle cx="72" cy="56" r="9" fill="none" stroke="' + L.accent + '" stroke-width="2.2"/>' +
      '<path d="M57 56 L63 56" stroke="' + L.accent + '" stroke-width="2.2"/>';
    if (L.style === 'band') return '<path d="M27 50 Q24 20 60 19 Q96 20 93 50 Q82 36 60 36 Q38 36 27 50 Z" fill="' + L.hair + '"/>' +
      '<path d="M28 44 Q60 30 92 44" stroke="' + L.accent + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    return '<path d="M26 52 L32 24 L43 34 L51 14 L61 31 L71 14 L79 34 L89 24 L94 52 Q78 36 60 38 Q42 36 26 52 Z" fill="' + L.hair + '"/>';
  }
  function extra(L) {
    if (L.style === 'spiky') return '<circle cx="42" cy="64" r="1.3" fill="#C98A52"/><circle cx="46" cy="67" r="1.3" fill="#C98A52"/><circle cx="74" cy="67" r="1.3" fill="#C98A52"/><circle cx="78" cy="64" r="1.3" fill="#C98A52"/>';
    return '';
  }
  function faces(face) {
    function grp(f, inner) { return '<g data-f="' + f + '"' + (f === face ? '' : ' style="display:none"') + '>' + inner + '</g>'; }
    var st = ' stroke="' + INK + '" fill="none" stroke-linecap="round"';
    var cheek = function (o) { return '<circle cx="38" cy="67" r="6" fill="#FF9E8A" opacity="' + o + '"/><circle cx="82" cy="67" r="6" fill="#FF9E8A" opacity="' + o + '"/>'; };
    var dot = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>'; };
    return grp('idle', cheek('.45') + dot(48, 56, 3.8) + dot(72, 56, 3.8) + '<path d="M52 70 Q60 77 68 70" stroke-width="3.2"' + st + '/>') +
      grp('smile', cheek('.85') + '<path d="M42 58 Q48 49 54 58 M66 58 Q72 49 78 58" stroke-width="3.4"' + st + '/>' +
        '<path d="M49 67 Q60 86 71 67 Z" fill="#E5484D"/>') +
      grp('wow', cheek('.6') + '<circle cx="48" cy="56" r="6.2" fill="#fff"/><circle cx="72" cy="56" r="6.2" fill="#fff"/>' + dot(48, 56, 3.4) + dot(72, 56, 3.4) +
        '<path d="M41 44 Q48 38 55 44 M65 44 Q72 38 79 44" stroke-width="2.8"' + st + '/>' +
        '<ellipse cx="60" cy="75" rx="6" ry="7.5" fill="#B83A3A"/>') +
      grp('tilt', cheek('.45') + dot(48, 57, 3.8) + dot(72, 55, 4.4) +
        '<path d="M42 48 L54 48 M66 45 Q72 40 78 45" stroke-width="2.8"' + st + '/>' +
        '<ellipse cx="60" cy="73" rx="4.2" ry="5" fill="' + INK + '"/>') +
      grp('cheer', cheek('.95') + '<path d="M40 59 Q48 46 56 59 M64 59 Q72 46 80 59" stroke-width="3.6"' + st + '/>' +
        '<path d="M45 65 Q60 93 75 65 Z" fill="#E5484D"/><ellipse cx="60" cy="79" rx="6.5" ry="4" fill="#FF8FA3"/>');
  }
  /* 몸짓 — 대기: 손을 내림 · 성공: 두 손 번쩍 · 실패: 한 손을 턱에 */
  function poses(L, pose) {
    function grp(p, inner) { return '<g data-p="' + p + '"' + (p === pose ? '' : ' style="display:none"') + '>' + inner + '</g>'; }
    var hand = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + L.skin + '" stroke="rgba(0,0,0,.08)" stroke-width="1"/>'; };
    var arm = function (d) { return '<path d="' + d + '" stroke="' + L.line + '" stroke-width="13" stroke-linecap="round" fill="none"/><path d="' + d + '" stroke="' + L.top + '" stroke-width="9.5" stroke-linecap="round" fill="none"/>'; };
    return grp('wait', hand(25, 125) + hand(95, 125)) +
      grp('ok', arm('M29 110 L15 88') + arm('M91 110 L105 88') + hand(13, 81) + hand(107, 81)) +
      grp('no', hand(25, 125) + arm('M93 114 L82 102') + hand(78, 96));
  }
  function star(x, y, r, show) {
    var q = r * 0.3;
    return '<path data-f="cheer"' + (show ? '' : ' style="display:none"') + ' fill="#FFD43B" d="M' + x + ' ' + (y - r) + ' L' + (x + q) + ' ' + (y - q) + ' L' + (x + r) + ' ' + y + ' L' + (x + q) + ' ' + (y + q) + ' L' + x + ' ' + (y + r) + ' L' + (x - q) + ' ' + (y + q) + ' L' + (x - r) + ' ' + y + ' L' + (x - q) + ' ' + (y - q) + ' Z"/>';
  }
  function svg(who, opt) {
    if (typeof opt === 'string') opt = { face: opt };
    opt = opt || {};
    var id = WHO[who] ? who : 'sam', L = WHO[id];
    var face = FACES.indexOf(opt.face) >= 0 ? opt.face : 'idle', pose = POSES.indexOf(opt.pose) >= 0 ? opt.pose : 'wait';
    var wear = WEAR[opt.wear] ? opt.wear : '';
    return '<svg viewBox="0 0 120 130" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + L.name + '" data-who="' + id + '" data-face="' + face + '" data-pose="' + pose + '"' + (wear ? ' data-wear="' + wear + '"' : '') + '>' +
      '<path d="M20 130 Q20 98 60 98 Q100 98 100 130 Z" fill="' + L.top + '" stroke="' + L.line + '" stroke-width="2"/>' +
      (L.style === 'chef' ? '<path d="M46 98 L60 112 L74 98 Z" fill="' + L.accent + '"/>' : '') +
      (wear ? '<g data-w="' + wear + '">' + WEAR[wear] + '</g>' : '') +
      '<g class="hd"' + (face === 'tilt' ? ' style="transform:rotate(' + CONF.tilt + 'deg)"' : '') + '>' +
        hairBack(L) + '<circle cx="60" cy="56" r="34" fill="' + L.skin + '"/>' + hair(L) + extra(L) + faces(face) +
      '</g>' +
      poses(L, pose) +
      star(13, 30, 8, face === 'cheer') + star(108, 22, 6, face === 'cheer') +
      '<text data-f="tilt"' + (face === 'tilt' ? '' : ' style="display:none"') + ' x="100" y="30" font-size="26" font-weight="700" font-family="Jua,sans-serif" fill="#F59F00" text-anchor="middle">?</text>' +
      '</svg>';
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  var PlayNpc = {
    CONF: CONF, WHO: WHO, FACES: FACES, POSES: POSES, WEAR: Object.keys(WEAR),
    svg: svg,
    render: function (el, who, opt) {
      opt = opt || {};
      var id = WHO[who] ? who : 'sam';
      clearTimeout(el._npcT);
      el.innerHTML = svg(id, opt);
      el.classList.add('npc');
      el.setAttribute('data-who', id);
      el.setAttribute('data-face', FACES.indexOf(opt.face) >= 0 ? opt.face : 'idle');
      el.setAttribute('data-pose', POSES.indexOf(opt.pose) >= 0 ? opt.pose : 'wait');
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
    pose: function (el, pose) {
      if (!el) return;
      if (POSES.indexOf(pose) < 0) pose = 'wait';
      var sv = el.querySelector('svg'); if (!sv) return;
      el.setAttribute('data-pose', pose); sv.setAttribute('data-pose', pose);
      each(el.querySelectorAll('[data-p]'), function (n) { n.style.display = n.getAttribute('data-p') === pose ? '' : 'none'; });
    },
    react: function (el, kind, opt) {
      if (!el) return;
      var L = WHO[el.getAttribute('data-who')] || WHO.sam, self = this;
      var r = (REACT[kind] || REACT.wait)(L);
      this.face(el, r.face); this.pose(el, r.pose);
      el.classList.remove('npc-ok'); el.classList.remove('npc-no');
      if (kind && kind !== 'wait' && REACT[kind]) {
        void el.offsetWidth;                      /* 같은 반응이 이어져도 몸짓이 다시 시작되게 */
        el.classList.add(kind === 'no' ? 'npc-no' : 'npc-ok');
        if (!(opt && opt.stay)) el._npcT = setTimeout(function () { self.face(el, 'idle'); self.pose(el, 'wait'); el.classList.remove('npc-ok'); el.classList.remove('npc-no'); }, CONF.hold);
      }
    }
  };
  g.PlayNpc = PlayNpc;
})(window);
