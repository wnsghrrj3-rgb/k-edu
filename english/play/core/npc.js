/* ============================================================
 * 영어 놀이터 — 등장인물(PlayNpc) (게임설계 v1 §6 · §15 캐릭터 규범)
 *   다섯 사람: Sam(가게 주인·튜터) · Mina(친절한 첫 손님) · Ben(장난꾸러기) · Amy(조용) · Max(활동·리듬)
 *   §15: 머리 큰 2.5등신 · 눈·입은 선 · 표정은 눈썹·입 두 선으로 · 옷은 무대 주조색(var(--stage)) — 색은 토큰만.
 *   SVG 한 장에 표정 5(기본 idle · 웃음 smile · 놀람 wow · 갸웃 tilt · 환호 cheer)와
 *   몸짓 3(대기 wait · 성공 ok · 실패 no)을 모두 그려 두고 보이는 것만 바꾼다(다시 그리지 않음).
 *   무대마다 덧입는 것은 한 장(wear) — apron(가게) · bag(교실) · scarf(바깥).
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
    tilt: -9        /* 갸웃 각도(도) */
  };
  var FACES = ['idle', 'smile', 'wow', 'tilt', 'cheer'];
  var POSES = ['wait', 'ok', 'no'];
  var INK = 'var(--ink)', CLOTH = 'var(--stage)';
  /* ok = 그 사람이 기쁠 때 짓는 표정(§6 표) */
  var WHO = {
    sam:  { name: 'Sam',  skin: 'var(--skin-1)', hair: 'var(--hair-2)', style: 'chef',  ok: 'smile' },
    mina: { name: 'Mina', skin: 'var(--skin-1)', hair: 'var(--hair-1)', style: 'buns',  ok: 'smile' },
    ben:  { name: 'Ben',  skin: 'var(--skin-2)', hair: 'var(--hair-3)', style: 'spiky', ok: 'wow' },
    amy:  { name: 'Amy',  skin: 'var(--skin-3)', hair: 'var(--hair-2)', style: 'long',  ok: 'smile' },
    max:  { name: 'Max',  skin: 'var(--skin-4)', hair: 'var(--hair-4)', style: 'band',  ok: 'cheer' }
  };
  var REACT = {
    ok:    function (L) { return { face: L.ok || 'smile', pose: 'ok' }; },
    no:    function () { return { face: 'tilt', pose: 'no' }; },
    wait:  function () { return { face: 'idle', pose: 'wait' }; },
    wow:   function () { return { face: 'wow', pose: 'wait' }; },
    cheer: function () { return { face: 'cheer', pose: 'ok' }; }
  };
  /* 무대 덧입기 — 몸통 위에 한 장 */
  var WEAR = {
    apron: '<path d="M46 104h28l4 26H42z" fill="var(--a-cream)"/><path d="M50 104c2-6 18-6 20 0" stroke="var(--a-cream)" stroke-width="3" fill="none"/>',
    bag:   '<path d="M42 100l38 30" stroke="var(--a-wood)" stroke-width="5" stroke-linecap="round"/><rect x="72" y="116" width="14" height="12" rx="3" fill="var(--a-wood)"/>',
    scarf: '<path d="M44 98c10 6 22 6 32 0v7c-10 6-22 6-32 0z" fill="var(--stage-2)"/><path d="M68 104l4 14-8-1z" fill="var(--stage-2)"/>'
  };

  function line(d, w, o) { return '<path d="' + d + '" stroke="' + INK + '" stroke-width="' + (w || 2.6) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"' + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  /* 머리 뒤쪽(머리통보다 먼저) · 앞쪽(머리통 다음) */
  function hairBack(L) {
    if (L.style === 'long') return '<path d="M26 54c0-24 14-36 34-36s34 12 34 36v40H26z" fill="' + L.hair + '"/>';
    if (L.style === 'buns') return '<circle cx="30" cy="28" r="11" fill="' + L.hair + '"/><circle cx="90" cy="28" r="11" fill="' + L.hair + '"/>';
    return '';
  }
  function hair(L) {
    if (L.style === 'chef') return '<path d="M28 50c0-12 6-20 14-24h36c8 4 14 12 14 24-6-8-14-12-32-12s-26 4-32 12z" fill="' + L.hair + '"/>' +
      '<path d="M34 30c-8-12 6-20 14-14 4-8 20-8 24 0 8-6 22 2 14 14z" fill="var(--a-cream)"/><rect x="34" y="27" width="52" height="9" rx="3" fill="var(--a-cream)"/>';
    if (L.style === 'buns') return '<path d="M26 54c0-22 14-32 34-32s34 10 34 32c-8-12-20-16-34-16s-26 4-34 16z" fill="' + L.hair + '"/>' +
      '<circle cx="34" cy="34" r="3" fill="var(--warm)"/><circle cx="86" cy="34" r="3" fill="var(--warm)"/>';
    if (L.style === 'long') return '<path d="M26 56c0-22 14-34 34-34s34 12 34 34c-6-12-16-18-28-18-6 4-14 8-24 8-8 0-12 4-16 10z" fill="' + L.hair + '"/>';
    if (L.style === 'band') return '<path d="M26 52c0-20 14-32 34-32s34 12 34 32c-8-10-20-14-34-14s-26 4-34 14z" fill="' + L.hair + '"/>' +
      '<path d="M27 44c16-9 50-9 66 0" stroke="var(--stage-2)" stroke-width="6" fill="none" stroke-linecap="round"/>';
    return '<path d="M26 52l6-24 9 9 7-17 10 15 10-15 7 17 9-9 6 24c-8-10-20-14-34-14s-26 4-34 14z" fill="' + L.hair + '"/>';
  }
  function extra(L) {
    if (L.style === 'long') return '<circle cx="48" cy="58" r="8" fill="none" stroke="' + INK + '" stroke-width="2" opacity=".8"/><circle cx="72" cy="58" r="8" fill="none" stroke="' + INK + '" stroke-width="2" opacity=".8"/><path d="M56 58h8" stroke="' + INK + '" stroke-width="2" opacity=".8"/>';
    if (L.style === 'spiky') return '<path d="M41 67h.1M45 70h.1M75 70h.1M79 67h.1" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" opacity=".3"/>';
    return '';
  }
  /* 표정 — 눈은 점·호, 눈썹·입은 선 */
  function faces(face) {
    function grp(f, inner) { return '<g data-f="' + f + '"' + (f === face ? '' : ' style="display:none"') + '>' + inner + '</g>'; }
    var cheek = function (o) { return '<circle cx="38" cy="68" r="5" fill="var(--cheek)" opacity="' + o + '"/><circle cx="82" cy="68" r="5" fill="var(--cheek)" opacity="' + o + '"/>'; };
    var dot = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/>'; };
    return grp('idle', cheek('.35') + dot(48, 58, 2.6) + dot(72, 58, 2.6) + line('M43 49h9M68 49h9', 2.2, '.7') + line('M54 70q6 4 12 0')) +
      grp('smile', cheek('.55') + line('M44 59q4-5 8 0M68 59q4-5 8 0') + line('M43 47q4-2 9-1M68 46q5-1 9 1', 2.2, '.7') + line('M50 68q10 9 20 0')) +
      grp('wow', cheek('.4') + dot(48, 57, 3) + dot(72, 57, 3) + line('M42 45q5-4 10 0M68 45q5-4 10 0', 2.2, '.7') + '<ellipse cx="60" cy="72" rx="3.5" ry="4.2" fill="none" stroke="' + INK + '" stroke-width="2.6"/>') +
      grp('tilt', cheek('.35') + dot(48, 59, 2.6) + dot(72, 57, 2.9) + line('M43 50h9M68 46q5-4 10 0', 2.2, '.7') + line('M53 71q3.5-3 7 0t7 0')) +
      grp('cheer', cheek('.6') + line('M43 58q5-6 10 0M67 58q5-6 10 0') + line('M42 45q5-3 10-1M68 44q5-2 10 1', 2.2, '.7') + line('M48 66h24q-3 12-12 12t-12-12z'));
  }
  /* 몸짓 — 대기: 손을 내림 · 성공: 두 손 번쩍 · 실패: 한 손을 턱에 */
  function poses(L, pose) {
    function grp(p, inner) { return '<g data-p="' + p + '"' + (p === pose ? '' : ' style="display:none"') + '>' + inner + '</g>'; }
    var hand = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="' + L.skin + '"/>'; };
    var arm = function (d) { return '<path d="' + d + '" stroke="' + CLOTH + '" stroke-width="8" stroke-linecap="round" fill="none"/>'; };
    return grp('wait', hand(38, 124) + hand(82, 124)) +
      grp('ok', arm('M42 106L28 88') + arm('M78 106L92 88') + hand(26, 84) + hand(94, 84)) +
      grp('no', hand(38, 124) + arm('M80 110L74 98') + hand(72, 92));
  }
  function spark(x, y, r, show) {
    var q = r * 0.28;
    return '<path data-f="cheer"' + (show ? '' : ' style="display:none"') + ' fill="var(--warm)" d="M' + x + ' ' + (y - r) + 'L' + (x + q) + ' ' + (y - q) + 'L' + (x + r) + ' ' + y + 'L' + (x + q) + ' ' + (y + q) + 'L' + x + ' ' + (y + r) + 'L' + (x - q) + ' ' + (y + q) + 'L' + (x - r) + ' ' + y + 'L' + (x - q) + ' ' + (y - q) + 'Z"/>';
  }
  function svg(who, opt) {
    if (typeof opt === 'string') opt = { face: opt };
    opt = opt || {};
    var id = WHO[who] ? who : 'sam', L = WHO[id];
    var face = FACES.indexOf(opt.face) >= 0 ? opt.face : 'idle', pose = POSES.indexOf(opt.pose) >= 0 ? opt.pose : 'wait';
    var wear = WEAR[opt.wear] ? opt.wear : '';
    return '<svg viewBox="0 0 120 130" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + L.name + '" data-who="' + id + '" data-face="' + face + '" data-pose="' + pose + '"' + (wear ? ' data-wear="' + wear + '"' : '') + '>' +
      '<path d="M38 130c0-24 8-34 22-34s22 10 22 34z" fill="' + CLOTH + '"/>' +
      (wear ? '<g data-w="' + wear + '">' + WEAR[wear] + '</g>' : '') +
      '<g class="hd"' + (face === 'tilt' ? ' style="transform:rotate(' + CONF.tilt + 'deg)"' : '') + '>' +
        hairBack(L) + '<circle cx="60" cy="58" r="34" fill="' + L.skin + '"/>' + hair(L) + extra(L) + faces(face) +
      '</g>' +
      poses(L, pose) +
      spark(16, 34, 7, face === 'cheer') + spark(106, 26, 5, face === 'cheer') +
      '<text data-f="tilt"' + (face === 'tilt' ? '' : ' style="display:none"') + ' x="102" y="30" font-size="22" font-weight="700" font-family="var(--font)" fill="var(--ink-3)" text-anchor="middle">?</text>' +
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
