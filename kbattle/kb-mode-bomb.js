/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #6 「폭탄 릴레이」 (kb-mode-bomb.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 6종 — **팀전**·학년칸 **고** / "못 풀면 폭탄이 다음 팀원에게"),
             제3조(감점 없음), 제4조("탈락자도 화면에서 할 일이 있다"), KB-2.

   ⭐ 설계에서 걸린 지점 하나:
      "폭탄 든 사람만 문제를 푼다"로 만들면 **나머지 팀원은 구경꾼**이 된다.
      그건 헌법이 금지한 바로 그 그림이다("죽으면 멍하니 구경" = 교실 사고 지점).
      그래서 **전원이 매 문제를 푼다.** 다만 각자의 정답이 하는 일이 다르다:

        폭탄 든 사람이 맞히면  → 폭탄이 **다음 팀원에게 넘어간다** (살았다)
        폭탄 든 사람이 틀리면  → **심지가 1 탄다** (폭탄은 그대로)
        다른 팀원이 맞히면    → **심지를 1 늘려 준다** (최대치까지)

      → 폭탄 든 친구가 헤매는 동안, 팀원들이 **심지를 벌어 준다.**
        "빨리 풀어!"가 아니라 "내가 시간 벌어줄게"가 되는 구조.
        이게 팀전을 만드는 진짜 방법이다 — 팀원 점수를 합산하는 게 아니라.

   규칙:
     - 팀마다 폭탄 1개. 심지 3칸에서 시작(최대 5).
     - 심지 0 → 💥 터진다. 그 팀 **폭발 +1**, 심지 리셋, 폭탄은 다음 사람에게(벌 없이 계속 간다).
     - ⛔ **점수는 안 깎인다**(제3조). 터져도 잃는 건 '안 터진 기록'뿐이다.
     - 판 끝 = **덜 터진 팀**. 폭발 0이면 「무사고」.
     - 팀 배정 = 입장 순서 라운드로빈, 지각 입장은 가장 적은 팀으로(타워와 동일).
     - KB-2: 화면엔 폭탄 보유자·심지·폭발 수만. ⛔ 개인 점수·등수 없음.
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.bomb) return;

  var TEAM_META = [
    { name: '빨강', color: '#ff6b6b', emoji: '🔴' },
    { name: '파랑', color: '#4dabf7', emoji: '🔵' },
    { name: '초록', color: '#51cf66', emoji: '🟢' },
    { name: '노랑', color: '#ffd43b', emoji: '🟡' }
  ];
  var FUSE_START = 3, FUSE_MAX = 5;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-bomb-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-bomb-style';
    s.textContent = [
      '.kb-bo{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-bo-row{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}',
      '.kb-bo-team{flex:1;min-width:210px;max-width:300px;padding:14px;border-radius:16px;',
      '  background:#1f2147;border:2px solid rgba(255,255,255,.1)}',
      '.kb-bo-t{font-weight:900;font-size:17px;margin-bottom:8px;display:flex;',
      '  justify-content:space-between;align-items:center}',
      '.kb-bo-boom{font-size:13px;font-weight:800;color:rgba(255,255,255,.55)}',
      '.kb-bo-holder{font-weight:900;font-size:22px;margin:6px 0 10px;text-align:center}',
      '.kb-bo-fuse{display:flex;gap:5px;justify-content:center}',
      '.kb-bo-f{width:26px;height:11px;border-radius:999px;background:rgba(255,255,255,.12)}',
      '.kb-bo-f.on{background:linear-gradient(90deg,#ffd23f,#ff5d5d)}',
      '.kb-bo-team.blow{animation:kbBoBlow .6s ease}',
      '@keyframes kbBoBlow{0%{transform:scale(1)}25%{transform:scale(1.06) rotate(-1.5deg)}',
      '  55%{transform:scale(.97) rotate(1.5deg)}100%{transform:scale(1)}}',
      '.kb-bo-msg{margin-top:12px;text-align:center;font-weight:900;font-size:20px;color:#ffd23f;min-height:26px}',
      /* 폰 — 내가 폭탄을 들었나 / 심지를 벌어 주는가 (KB-2) */
      '.kb-bo-bar{margin:0 0 14px;padding:11px 14px;border-radius:14px;text-align:center;',
      '  background:rgba(255,255,255,.06)}',
      '.kb-bo-bar.hot{background:rgba(255,93,93,.16);border:2px solid rgba(255,93,93,.5);',
      '  animation:kbPop .35s ease}',
      '.kb-bo-bar b{display:block;font-weight:900;font-size:18px}',
      '.kb-bo-bar span{display:block;font-weight:800;font-size:12px;color:rgba(255,255,255,.65);margin-top:4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function bomb(ctx) {
    injectStyle();
    var getRoster = ctx.getRoster;
    var nTeams = Math.max(2, Math.min(4, (ctx.config && ctx.config.teams) | 0 || 2));

    var teamOf = {};
    var members = [];      // 팀별 이름 배열 (폭탄 순환 순서)
    var holder = [];       // 팀별 폭탄 보유자 이름
    var fuse = [];         // 팀별 심지
    var booms = [];        // 팀별 폭발 횟수
    var blown = {};        // 이번 문제에 터진 팀 (연출 1회)
    var lastEvent = '';
    var built = false, teamEls = [];

    for (var i = 0; i < nTeams; i++) {
      members.push([]); holder.push(null); fuse.push(FUSE_START); booms.push(0);
    }

    function assign(name) {
      if (teamOf[name] != null) return teamOf[name];
      var min = 0;
      for (var j = 1; j < nTeams; j++) if (members[j].length < members[min].length) min = j;
      teamOf[name] = min;
      members[min].push(name);
      if (!holder[min]) holder[min] = name;      // 첫 사람이 폭탄을 든다
      return min;
    }
    function syncTeams() { getRoster().forEach(assign); }

    function passBomb(t) {
      var list = members[t].filter(function (n) { return getRoster().indexOf(n) >= 0; });
      if (!list.length) { holder[t] = null; return; }
      var i = list.indexOf(holder[t]);
      holder[t] = list[(i + 1) % list.length];
    }

    function onAnswer(e) {
      var t = assign(e.name);
      syncTeams();
      if (!holder[t]) holder[t] = e.name;

      if (e.name === holder[t]) {
        if (e.correct) {
          passBomb(t);                                   // 살았다 — 다음 사람에게
          lastEvent = esc(e.name) + ' 넘겼다!';
        } else {
          fuse[t] -= 1;                                  // 심지가 탄다 (⛔ 점수는 안 깎인다)
          if (fuse[t] <= 0) {
            booms[t] += 1;
            fuse[t] = FUSE_START;
            blown[t] = true;
            passBomb(t);                                 // 터져도 판은 계속 간다 (벌 없음)
            lastEvent = '💥 ' + TEAM_META[t].name + ' 팀 폭발!';
          }
        }
        return;
      }

      // 폭탄을 안 든 팀원 — 맞히면 **심지를 벌어 준다** ("내가 시간 벌어줄게")
      if (e.correct && fuse[t] < FUSE_MAX) {
        fuse[t] += 1;
        lastEvent = esc(e.name) + ' → 심지 벌어줌!';
      }
    }

    function onReveal() { blown = {}; }

    function publicState() {
      syncTeams();
      return { id: 'bomb', teams: nTeams, teamOf: teamOf, holder: holder.slice(),
               fuse: fuse.slice(), booms: booms.slice(), max: FUSE_MAX,
               names: TEAM_META.slice(0, nTeams).map(function (m) { return m.name; }),
               event: lastEvent };
    }

    /* ---- 전자칠판 ---- */
    function hostLayer(el) {
      syncTeams();
      if (!built) build(el);
      teamEls.forEach(function (c, t) {
        c.holder.textContent = holder[t] ? ('💣 ' + holder[t]) : '—';
        c.boom.textContent = booms[t] ? ('💥 ' + booms[t] + '번') : '무사고';
        c.fuse.innerHTML = '';
        for (var k = 0; k < FUSE_MAX; k++) {
          var f = document.createElement('div');
          f.className = 'kb-bo-f' + (k < fuse[t] ? ' on' : '');
          c.fuse.appendChild(f);
        }
        if (blown[t]) {
          c.box.classList.remove('blow');
          void c.box.offsetWidth;
          c.box.classList.add('blow');
        }
      });
      var msg = el.querySelector('.kb-bo-msg');
      if (msg) msg.textContent = lastEvent;
      // ⛔ 개인 점수·등수 없음 (KB-2)
    }

    function build(el) {
      el.className = 'kb-bo';
      el.innerHTML = '<div class="kb-bo-row"></div><div class="kb-bo-msg"></div>';
      var row = el.querySelector('.kb-bo-row');
      teamEls = [];
      for (var t = 0; t < nTeams; t++) {
        var d = document.createElement('div');
        d.className = 'kb-bo-team';
        d.innerHTML =
          '<div class="kb-bo-t"><span>' + TEAM_META[t].emoji + ' ' + TEAM_META[t].name + '</span>' +
            '<span class="kb-bo-boom">무사고</span></div>' +
          '<div class="kb-bo-holder">—</div>' +
          '<div class="kb-bo-fuse"></div>';
        row.appendChild(d);
        teamEls.push({ box: d, holder: d.querySelector('.kb-bo-holder'),
                       boom: d.querySelector('.kb-bo-boom'), fuse: d.querySelector('.kb-bo-fuse') });
      }
      built = true;
    }

    /* ---- 폰: 내가 폭탄을 들었나 (KB-2) ---- */
    function playerLayer(el, my) {
      var st = my && my.state;
      if (!st || st.id !== 'bomb') return;
      var t = st.teamOf && st.teamOf[my.name];
      if (t == null) { el.innerHTML = ''; return; }
      var meta = TEAM_META[t];
      var hot = st.holder[t] === my.name;
      el.className = 'kb-bo-bar' + (hot ? ' hot' : '');
      el.innerHTML = hot
        ? '<b>💣 내가 폭탄을 들었어요</b>' +
          '<span>맞히면 다음 친구에게 넘어가요 · 심지 ' + st.fuse[t] + '칸</span>'
        : '<b style="color:' + meta.color + '">' + meta.emoji + ' ' + esc(meta.name) + ' 팀</b>' +
          '<span>💣 ' + esc(st.holder[t] || '—') + ' · 내가 맞히면 <b style="display:inline">심지를 벌어줘요</b> (' +
            st.fuse[t] + '/' + st.max + ')</span>';
    }

    return {
      onAnswer: onAnswer,
      onReveal: onReveal,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get fuse() { return fuse.slice(); }, get booms() { return booms.slice(); },
               get holder() { return holder.slice(); }, get teamOf() { return teamOf; },
               FUSE_START: FUSE_START, FUSE_MAX: FUSE_MAX }
    };
  }

  KBModes.bomb = bomb;
})();
