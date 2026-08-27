/* ============================================================
   케이에듀 공용 돌아가기 버튼 (2026-07-25 · 2026-08-25 슬라이드 전환 재판정)
   목적: 모든 도구 화면에서 같은 자리(좌측 상단)·같은 문구·같은 모양.
   규칙:
     · 선생님 도구(/?role=teacher)에서 들어온 흐름 → 「← 선생님 도구」 → /?role=teacher
     · 그 외(학생·직접 진입 등)                   → 「🏠 케이에듀로 가기」 → /
     · 판단은 referrer + sessionStorage(같은 탭에서는 새로고침해도 유지)
   사용:
     <script src="/kedu_back.js"></script>                       → fixed 좌상단 흰 필 버튼
     <script src="/kedu_back.js" data-mount=".topbar"></script>  → 해당 요소 맨 앞에 인라인 삽입
     <script src="/kedu_back.js" data-mode="context"></script>   → 버튼 없이 window.KEDU_BACK만 제공
   제공: window.KEDU_BACK = { el, label, href, fromTeacher }
   ============================================================ */
(function () {
  var KEY = 'kedu_from_teacher';

  /* 0) 전면 롤아웃 가드 — 중복 로드 / iframe 임베드 / 홈 자체에서는 조용히 물러남 */
  try {
    if (document.getElementById('kedu-back')) return;              // 이미 버튼 있음
    if (window.top !== window) return;                             // 도구가 오버레이/iframe 으로 박힌 경우
    if (location.pathname === '/' || location.pathname === '/index.html') return;  // 홈에서 홈으로는 무의미
  } catch (e) {}

  /* 1) 진입 맥락 갱신 — 케이에듀 홈에서 넘어온 순간에만 기록을 덮어쓴다 */
  try {
    var ref = document.referrer || '';
    if (ref === location.origin || ref.indexOf(location.origin + '/') === 0) {
      var u = new URL(ref);
      if (u.pathname === '/' || u.pathname === '/index.html') {
        var t = /(\?|&)role=teacher(&|$)/.test(u.search) || u.hash === '#teacher';
        sessionStorage.setItem(KEY, t ? '1' : '0');
      }
    }
  } catch (e) {}

  var fromTeacher = false;
  try { fromTeacher = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  /* ============================================================
     1.5) 돌아갈 곳 판정 v2 (2026-08-27 · 동선 점검 트랙)
     v1 은 발자국(트레일)만 믿었다 → 발자국을 안 찍는 페이지가 끼면 한 층 건너뛰고,
     새 탭이면 발자국이 없어 홈으로 떨어지고, 옆 차시로 넘어가면 형제 차시로 나갔다.
     v2 우선순위:
       ① 트레일에 남은 **구조상 조상 허브** 중 가장 최근 것 (형제·후손·무관 페이지는 후보 제외)
       ② 없으면 **구조상 부모 허브** = 가장 가까운 상위 index.html (+ 예외표)
       ③ 그것도 없으면(최상위 화면) 트레일에 남은 **가장 최근 허브** (교사 학급과제 → 학년허브 같은 가로 이동)
       ④ 끝으로 **자격 홈**: 교사 → /teacher/, 학부모 → /parent/, 그 외 → /
     ============================================================ */

  /* 1.5-a) 허브 명부 — 실제 index.html 이 있는 디렉터리(71) + 자체 허브 페이지 */
  var HUB_DIRS = [
    '/admin/','/auth/','/board/','/classwork/','/draw/','/draw/coloring/','/draw/masterpiece/','/english/',
    '/english/v3/','/english/v3/samples/','/gifted/','/gifted/math/','/grade1/semester1/korean/',
    '/grade1/semester1/math/','/grade1/semester2/math/','/grade2/semester1/korean/','/grade2/semester1/math/',
    '/grade3/semester1/korean/','/grade3/semester1/math/','/grade3/semester1/science/',
    '/grade3/semester1/social/','/grade4/semester1/korean/','/grade4/semester1/math/',
    '/grade4/semester1/science/','/grade4/semester1/social/','/grade5/semester1/korean/',
    '/grade5/semester1/math/','/grade5/semester1/science/','/grade5/semester1/social/',
    '/grade6/semester1/math/','/grade6/semester1/science/','/hub2/','/kbattle/','/kedu/activities/',
    '/kedu/quiz/','/kedu/teacher/','/kedu/teacher/tools3/','/kmake/','/kmake/card/','/kmake/invite/',
    '/kpark/','/kpark/board/','/kpark/board/bolt/','/kpark/board/four/','/kpark/board/kmarble/',
    '/kpark/board/ladder/','/kpark/board/land/','/kpark/board/mafia/','/kpark/board/mooncode/',
    '/kpark/board/rainbow/','/kpark/board/scale/','/kpark/board/tilemagic/','/kpark/board/travel/',
    '/kpark/kmarble/','/kpark/marblerun/','/kpark/shooting/','/kpark/tangram/','/labs/draw/paint/','/live/',
    '/maker-playground/','/maker-playground/report/','/maker/','/maker/card/','/maker/invite/','/morning/',
    '/museum/','/parent/','/pick/','/privacy/','/teacher/','/terms/'
  ];
  /* index.html 이 아니면서 허브 노릇을 하는 페이지 = 그 아래 화면들의 목록 */
  var HUB_PAGES = { '/kedu/hub/klab.html': '/labs/', '/kedu/hub/science.html': null };
  /* 예외표 — 구조상 부모가 없거나(최상위 폴더) 실제 목록이 다른 곳인 화면 */
  var HUB_EXCEPT = [
    ['/labs/', '/kedu/hub/klab.html'],
    ['/kpark/board/', '/kpark/index.html'],          /* 보드게임 폴더는 안내판만 남았다 — 케이파크 정문으로 */
    ['/kedu/전시실.html', '/museum/index.html']
  ];

  function pathOnly(u) { var i = u.indexOf('?'); return i < 0 ? u : u.slice(0, i); }
  function dirOf(p) { return p.slice(0, p.lastIndexOf('/') + 1); }
  function isIndex(p) { return p === '/' || /\/index\.html$/.test(p); }

  /* 구조상 부모 허브 — 없으면 null(=자격 홈이 맡는다) */
  function hubOf(p) {
    p = pathOnly(p);
    for (var e = 0; e < HUB_EXCEPT.length; e++) {
      var pre = HUB_EXCEPT[e][0];
      if (pre.slice(-1) === '/' ? p.indexOf(pre) === 0 : p === pre) {
        return HUB_EXCEPT[e][1] === p ? null : HUB_EXCEPT[e][1];
      }
    }
    if (HUB_PAGES.hasOwnProperty(p)) return null;          /* 허브 자신은 자격 홈으로 */
    var d = dirOf(p);
    if (isIndex(p)) d = dirOf(d.slice(0, -1));             /* index 는 자기 폴더 위부터 */
    while (d && d !== '/') {
      for (var i = 0; i < HUB_DIRS.length; i++) if (HUB_DIRS[i] === d) return d + 'index.html';
      d = dirOf(d.slice(0, -1));
    }
    return null;
  }

  /* 그 발자국이 「허브」인가 — index.html 이거나 명부에 있는 허브 페이지 */
  function isHub(u) {
    var p = pathOnly(u);
    return isIndex(p) || HUB_PAGES.hasOwnProperty(p);
  }
  /* 그 허브가 현재 화면의 조상인가 (같은 폴더의 index 포함, 형제·후손은 제외) */
  function isAncestorHub(u, hereP) {
    if (!isHub(u)) return false;
    var p = pathOnly(u);
    if (p === pathOnly(hereP)) return false;
    var cd = HUB_PAGES.hasOwnProperty(p) ? HUB_PAGES[p] : (p === '/' ? null : dirOf(p));
    if (!cd) return false;
    return dirOf(pathOnly(hereP)).indexOf(cd) === 0;
  }

  /* 1.5-b) 자격(역할) — RPC 없이 지금 경로·referrer·이 탭 기록만으로 */
  var ROLEKEY = 'kedu_back_role_v1';
  var TEACHER_AREA = /^\/(teacher|classwork|admin)\//;
  var TEACHER_TOOL = /^\/kedu\/(teacher|quiz|activities)\//;
  var PARENT_AREA  = /^\/parent\//;
  function roleFromPath(p, q) {
    if (PARENT_AREA.test(p)) return 'parent';
    if (TEACHER_AREA.test(p) || TEACHER_TOOL.test(p)) return 'teacher';
    if (/(\?|&)role=teacher(&|$)/.test(q || '')) return 'teacher';
    if (/(\?|&)role=parent(&|$)/.test(q || '')) return 'parent';
    return null;
  }
  var role = null;
  try { role = sessionStorage.getItem(ROLEKEY) || null; } catch (e) {}
  var roleNow = roleFromPath(location.pathname, location.search);
  if (!roleNow) {                                          /* 앞 화면이 교사·학부모 자리였으면 그 맥락을 잇는다 */
    try {
      var rf = document.referrer || '';
      if (rf && (rf === location.origin || rf.indexOf(location.origin + '/') === 0)) {
        var ru = new URL(rf);
        roleNow = roleFromPath(ru.pathname, ru.search);
      }
    } catch (e) {}
  }
  try {                                                    /* 홈을 거치면 자격 맥락을 홈이 말한 대로 다시 세운다
                                                              (한 기기에서 교사 뒤 학생이 들어오면 교사 맥락이 남는 함정 방지) */
    var rf2 = document.referrer || '';
    if (rf2 && (rf2 === location.origin || rf2.indexOf(location.origin + '/') === 0)) {
      var ru2 = new URL(rf2);
      if (ru2.pathname === '/' || ru2.pathname === '/index.html') {
        roleNow = roleFromPath(location.pathname, location.search) || roleFromPath(ru2.pathname, ru2.search);
        role = roleNow;
        try { if (role) sessionStorage.setItem(ROLEKEY, role); else sessionStorage.removeItem(ROLEKEY); } catch (e) {}
      }
    }
  } catch (e) {}
  if (roleNow) { role = roleNow; try { sessionStorage.setItem(ROLEKEY, role); } catch (e) {} }
  if (!role) {                                             /* 교사 도구 캐시(케이박스)도 교사 표식으로 인정 */
    try { if (localStorage.getItem('kedu_boxbar_teacher_v1')) role = 'teacher'; } catch (e) {}
  }
  if (role === 'teacher' && !fromTeacher) fromTeacher = true;
  function roleHome() { return role === 'teacher' ? '/teacher/index.html' : (role === 'parent' ? '/parent/index.html' : '/'); }

  /* 1.5-c) 발자국 — 판정 재료. 홈을 거치면 끊는다(옛 하강 위에 새 하강이 이어붙는 함정 방지) */
  var TRAIL = 'kedu_back_trail_v1', BACKFLAG = 'kedu_back_going_v1', CAP = 40;
  function readTrail() { try { var t = JSON.parse(sessionStorage.getItem(TRAIL)); return Array.isArray(t) ? t : []; } catch (e) { return []; } }
  function writeTrail(t) { try { sessionStorage.setItem(TRAIL, JSON.stringify(t.slice(-CAP))); } catch (e) {} }
  var here = location.pathname + location.search;
  var trail = readTrail();
  try {
    var refH = document.referrer || '';
    if (refH && (refH === location.origin || refH.indexOf(location.origin + '/') === 0)) {
      var uH = new URL(refH);
      if (uH.pathname === '/' || uH.pathname === '/index.html') trail = [];
    }
  } catch (e) {}
  var arrivedByBack = false;
  try { arrivedByBack = sessionStorage.getItem(BACKFLAG) === '1'; sessionStorage.removeItem(BACKFLAG); } catch (e) {}
  if (!arrivedByBack && trail[trail.length - 1] !== here) { trail.push(here); writeTrail(trail); }

  /* 1.5-d) 판정 */
  function resolveBack() {
    var t = readTrail(), i;
    for (i = t.length - 1; i >= 0; i--) if (isAncestorHub(t[i], here)) return t[i];   /* ① 조상 허브 */
    var up = hubOf(here);
    if (up) return up;                                                                /* ② 구조상 부모 */
    for (i = t.length - 1; i >= 0; i--) {                                             /* ③ 최근 허브(가로 이동) */
      if (isHub(t[i]) && pathOnly(t[i]) !== pathOnly(here)) return t[i];
    }
    var rh = roleHome();                                                              /* ④ 자격 홈 */
    return pathOnly(rh) === pathOnly(here) ? '/' : rh;                                 /* 자기 자신으로 나가지 않는다 */
  }
  var dest = resolveBack();
  var atHome = pathOnly(dest) === '/' || pathOnly(dest) === '/index.html';

  function goBack() {
    var t = readTrail(), target = resolveBack();
    var cut = -1;
    for (var i = t.length - 1; i >= 0; i--) if (t[i] === target) { cut = i; break; }
    if (cut >= 0) t = t.slice(0, cut + 1); else t = [target];
    writeTrail(t);
    try { sessionStorage.setItem(BACKFLAG, '1'); } catch (e) {}
    location.href = target;
  }

  var label = atHome ? '🏠 케이에듀로 가기' : (pathOnly(dest) === '/teacher/index.html' ? '← 선생님 도구' : '← 나가기');
  var href  = dest;
  var prev  = atHome ? null : dest;   /* 아래 겹침·문구 규칙이 쓰는 「한 층 위가 있는가」 표시 */

  var script = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var mode  = script && script.getAttribute('data-mode');
  var mount = script && script.getAttribute('data-mount');

  window.KEDU_BACK = { el: null, label: label, href: href, fromTeacher: fromTeacher, go: goBack };
  if (mode === 'context') return; /* 버튼 없이 맥락만 제공 (케이뮤지엄·케이메이크처럼 자체 버튼이 있는 화면) */

  /* 2) 공용 스타일 (1회 주입) */
  if (!document.getElementById('kedu-back-style')) {
    var css = ''
      + '#kedu-back{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;'
      + 'border-radius:12px;border:none;background:#fff;color:#1a2540;font-weight:800;'
      + 'font-size:14px;line-height:1;text-decoration:none;cursor:pointer;'
      + 'box-shadow:0 2px 10px rgba(0,0,0,.22);font-family:inherit;white-space:nowrap;'
      + 'transition:transform .15s,box-shadow .15s}'
      + '#kedu-back:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(0,0,0,.26)}'
      + '#kedu-back.kb-fixed{position:fixed;top:14px;left:14px;z-index:9999}'
      + '#kedu-back.kb-inline{padding:7px 13px;font-size:13px;box-shadow:none;'
      + 'border:1.5px solid rgba(0,0,0,.12);margin-right:12px;flex-shrink:0}'
      + '@media(max-width:640px){#kedu-back{font-size:12.5px;padding:8px 12px}}';
    var st = document.createElement('style');
    st.id = 'kedu-back-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* 3) 버튼 생성 */
  /* 3-0) 좌상단 충돌 처리 (2026-08-10 준호 전수 보고: 「모든 곳이 겹쳐 있다」)
     페이지가 자기 나가기 수단을 좌상단에 이미 갖고 있으면(허브 「← 홈」,
     차시 「📋 차시 목록」) 고정 버튼이 그 위를 덮어 글자를 가렸다.
       규칙 A(중복 억제) — 그 수단의 목적지가 우리와 같으면 버튼을 아예 안 낸다.
                           (한 자리에 같은 문 두 개를 두지 않는다)
       규칙 B(충돌 회피) — 목적지가 다르면(교사 맥락 등) 서로 안 겹치게 비킨다. */
  var ZONE = { l: 0, t: 0, r: 380, b: 76 };
  function sameDest(el) {
    var h = el.getAttribute && el.getAttribute('href');
    if (!h) {
      /* onclick="location.href='../index.html'" 형태의 자체 나가기도 목적지로 읽는다
         (차시 195곳의 「📚 차시 목록」 버튼 유형) */
      var oc = el.getAttribute && el.getAttribute('onclick');
      var m = oc && oc.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (m) h = m[1]; else return false;
    }
    try {
      var A = new URL(h, location.href), B = new URL(href, location.href);
      if (A.pathname !== B.pathname) return false;
      /* 둘 다 홈 셸(/)로 가면 화면 파라미터(?view=subject 등)가 달라도 같은 문으로 본다.
         단 교사 맥락(/?role=teacher)은 목적지가 실제로 다르므로 예외. */
      if (A.pathname === '/' && !fromTeacher) return true;
      return A.search === B.search;
    } catch (e) { return false; }
  }
  function topLeftControls(self) {
    var out = [];
    var nodes = document.querySelectorAll('a,button');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n === self || (self && self.contains(n))) continue;
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.left > ZONE.r || r.top > ZONE.b) continue;      /* 좌상단 구역 밖 */
      var txt = (n.textContent || '').trim();
      if (txt.length > 24) continue;                         /* 큰 배너·카드 제외 */
      out.push({ el: n, rect: r });
    }
    return out;
  }
  /* 띠 안의 짧은 텍스트 요소 전부 — a/button/제목뿐 아니라 JS가 그리는 div/span 태그
     (「③ 알맞은 문장 모으기」류)도 잡는다. limitTop: 이 높이까지만 본다. */
  function bandRects(a, limitTop) {
    var res = [], nodes = document.body.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], tg = n.tagName;
      if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'SVG' || tg === 'PATH') continue;
      if (n === a || a.contains(n)) continue;
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height || r.top > limitTop || r.bottom < 0) continue;
      var t;
      if (tg === 'A' || tg === 'BUTTON' || tg === 'H1' || tg === 'H2') t = (n.textContent || '').trim();
      else {
        t = '';
        for (var c = n.firstChild; c; c = c.nextSibling) if (c.nodeType === 3) t += c.textContent;
        t = t.trim();
      }
      if (!t || t.length > 40) continue;
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;   /* 페이드 중(opacity 0)도 곧 보이므로 포함 */
      res.push(r);
    }
    return res;
  }
  function clashesAt(a, limitTop) {
    var mine = a.getBoundingClientRect();
    return bandRects(a, limitTop).filter(function (r) {
      return !(r.right <= mine.left || r.left >= mine.right || r.bottom <= mine.top || r.top >= mine.bottom);
    });
  }
  var CLASH_TOP = 240;                                       /* 겹침 판정 범위 — 헤더 아래로 내려간 버튼까지 */
  function placeAvoiding(a) {
    function clashes() { return clashesAt(a, CLASH_TOP); }
    if (!clashes().length) return;                            /* 이미 안 겹침 */

    var band = bandRects(a, 110);                             /* 헤더 기하는 최상단 띠만으로 */
    if (!band.length) return;
    var leftMost = Infinity, rightMost = 0, headerBottom = 0;
    for (var i = 0; i < band.length; i++) {
      leftMost = Math.min(leftMost, band[i].left);
      rightMost = Math.max(rightMost, band[i].right);
      headerBottom = Math.max(headerBottom, band[i].bottom);
    }
    var w = a.getBoundingClientRect().width;

    /* 시도 1 — 오른쪽 끝 여백 (제목 뒤) */
    if (window.innerWidth - rightMost > w + 20) {
      a.style.left = 'auto'; a.style.right = '14px';
      if (!clashes().length) return;
    }
    /* 시도 2 — 왼쪽 끝 여백 (컨트롤 왼쪽) */
    if (leftMost > w + 20) {
      a.style.right = 'auto'; a.style.left = '14px';
      if (!clashes().length) return;
    }
    /* 시도 3 — 헤더 아래로 (넓은 헤더가 폭을 다 차지) */
    a.style.right = 'auto'; a.style.left = '14px';
    a.style.top = Math.round(headerBottom + 8) + 'px';
    if (!clashes().length) return;
    /* 시도 4 — 우측 여백으로 한 번 더 (아래에도 무언가 있는 경우) */
    a.style.left = 'auto'; a.style.right = '14px'; a.style.top = '14px';
    if (!clashes().length) return;
    /* 최후 — 어디에도 빈 자리가 없다: 페이지가 자체 나가기 수단을 이미 가졌다는
       뜻이므로(상단바 가득) 공용 버튼을 감춘다. 갈 곳이 없어지지 않도록
       자체 나가기가 최상단 띠에 실재할 때만. 한 번 감추면 이 화면 세션 동안 유지. */
    var hasOwnExit = false, bb = document.querySelectorAll('a,button');
    for (var q = 0; q < bb.length; q++) {
      var rr = bb[q].getBoundingClientRect();
      if (rr.width && rr.top <= 110 && /목록|홈|나가기|뒤로|나오기/.test((bb[q].textContent || ''))) { hasOwnExit = true; break; }
    }
    if (hasOwnExit) suppress(a);
    else { a.style.left = '14px'; a.style.right = 'auto'; a.style.top = Math.round(headerBottom + 8) + 'px'; }
  }
  var HIDE = 'kedu_back_hidden_v1';
  function hiddenHere() { try { return sessionStorage.getItem(HIDE) === location.pathname; } catch (e) { return false; } }
  function suppress(a) {
    a.style.display = 'none'; window.KEDU_BACK.suppressed = true;
    try { sessionStorage.setItem(HIDE, location.pathname); } catch (e) {}
    if (window.__keduBackMO) { window.__keduBackMO.disconnect(); window.__keduBackMO = null; }
  }
  /* 슬라이드 전환마다 재판정 — 로드 시 1회만 보면 JS가 나중에 그리는 상단 태그와 겹친다
     (세로폰에서 카드가 화면을 꽉 채운 뒤 드러난 문제, 2026-08-25). 겹칠 때만 자리를 다시 잡는다. */
  function watch(a) {
    var pending = null, trailing = null;
    function recheck(isTrail) {
      pending = null;
      if (!isTrail && !trailing) trailing = setTimeout(function () { trailing = null; recheck(true); }, 700);   /* 늦게 그려지는 요소용 1회 재확인 */
      if (window.KEDU_BACK.suppressed || !document.body.contains(a)) return;
      if (!clashesAt(a, CLASH_TOP).length) return;
      a.style.left = ''; a.style.right = ''; a.style.top = '';
      placeAvoiding(a);
    }
    function schedule() { if (!pending) pending = setTimeout(function () { recheck(false); }, 200); }
    try {
      var mo = new MutationObserver(function (recs) {
        for (var i = 0; i < recs.length; i++) {
          var tgt = recs[i].target;
          if (tgt === a || (tgt.nodeType === 1 && a.contains(tgt))) continue;
          schedule(); return;
        }
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
      window.__keduBackMO = mo;
    } catch (e) {}
    window.addEventListener('resize', schedule);
  }

  function build() {
    if (document.getElementById('kedu-back')) return;
    /* 규칙 A — 같은 목적지의 자체 수단이 이미 좌상단에 있으면 물러난다 */
    if (!mount) {
      /* 최상단 띠의 자체 나가기 컨트롤 — 목적지가 우리와 같으면 물러난다.
         차시의 넓은 헤더(📚 차시 목록 = 허브로)까지 포괄하도록 구역을 띠 전체로. */
      var band = document.querySelectorAll('a,button');
      for (var i = 0; i < band.length; i++) {
        var n = band[i];
        var r = n.getBoundingClientRect();
        if (!r.width || r.top > 110) continue;                 /* 최상단 띠만 */
        var txt = (n.textContent || '').trim();
        var looksExit = /목록|홈|나가기|뒤로|나오기|케이에듀|케이파크/.test(txt);
        if (looksExit && sameDest(n)) { window.KEDU_BACK.suppressed = true; return; }
      }
    }
    var a = document.createElement('a');
    a.id = 'kedu-back';
    a.href = href;
    a.textContent = label;
    a.title = prev ? '한 층 나가기' : (fromTeacher ? '선생님 도구로 돌아가기' : '케이에듀 시작 화면으로');
    a.onclick = function (e) { e.preventDefault(); goBack(); };
    var target = mount ? document.querySelector(mount) : null;
    if (target) { a.className = 'kb-inline'; target.insertBefore(a, target.firstChild); }
    else {
      a.className = 'kb-fixed'; document.body.appendChild(a);
      if (hiddenHere()) { suppress(a); window.KEDU_BACK.el = a; return; }   /* 이 화면에서 이미 감췄던 세션 */
      placeAvoiding(a);                                       /* 규칙 B */
      /* 폰트·늦은 렌더로 자체 버튼이 뒤늦게 커지는 경우 1회 재판정 */
      setTimeout(function () { if (window.KEDU_BACK.suppressed) return; a.style.left = ''; a.style.right = ''; a.style.top = ''; placeAvoiding(a); }, 350);
      watch(a);                                               /* 이후 슬라이드 전환마다 */
    }
    window.KEDU_BACK.el = a;
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
