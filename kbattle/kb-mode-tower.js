/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #3 「타워 쌓기」 (kb-mode-tower.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 6종 — **팀전**·학년칸 중), 제3조(감점 없음),
             제5조·KB-2(개인 등급·XP 타인 노출 금지).

   ⭐ 이 모드가 여는 세 번째 축:
      레이스 = 나 혼자 달린다 (개인전)
      퍼즐   = 우리 반 전체가 하나다 (협동)
      타워   = **나는 못해도 우리 팀이 있다** (팀전)
      개인전에서 뒤처지는 아이도 팀 안에서는 "우리 3층까지 올렸어"가 된다.
      소외를 막는 방식이 셋 다 다르다 — 그래서 셋이 다 필요하다.

   규칙:
     - 팀 정답 1개 = 블록 1개. 팀 타워가 나란히 올라간다.
     - **오답 = 흔들림뿐. 블록은 절대 안 내려간다.** (헌법 "오답 = 흔들림"의 해석 고정:
       흔들리는 건 연출이고, 무너뜨리면 그게 곧 감점이다 — 제3조 위반. **무너짐 없음.**)
     - 팀 배정 = 입장 순서 라운드로빈. 지각 입장은 **가장 적은 팀**으로(즉시 합류, 기다림 없음).
     - 판이 끝나면 가장 높은 탑 하나만 가볍게 (개인 순위표 없음 — 불변 원칙 5).

   KB-2 준수:
     - 화면에 뜨는 숫자는 **팀 블록 수**뿐. 개인 점수·등급·XP 없음.
     - 폰엔 우리 팀 블록 + 내가 올린 블록. 남이 몇 개 올렸는지 목록 없음.

   ⛔ 불변 계약: 코어(kb-battle.js)는 이 모드를 몰라도 돈다. 훅 전부 optional.
      CSS 는 이 파일이 <style> 1회 주입 (코어 css 불변 — 파티 레이어 패턴).
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.tower) return;

  var TEAM_META = [
    { name: '빨강', color: '#ff6b6b', emoji: '🔴' },
    { name: '파랑', color: '#4dabf7', emoji: '🔵' },
    { name: '초록', color: '#51cf66', emoji: '🟢' },
    { name: '노랑', color: '#ffd43b', emoji: '🟡' }
  ];
  var MAX_SHOW = 12;    // 타워가 화면을 넘지 않도록 보이는 블록 상한(수치는 계속 올라간다)

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-tower-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-tower-style';
    s.textContent = [
      '.kb-tw{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-tw-yard{display:flex;align-items:flex-end;justify-content:center;gap:28px;min-height:230px}',
      '.kb-tw-col{display:flex;flex-direction:column;align-items:center;gap:8px}',
      '.kb-tw-stack{display:flex;flex-direction:column-reverse;gap:4px;min-height:150px;justify-content:flex-start}',
      '.kb-tw-brick{width:84px;height:20px;border-radius:5px;box-shadow:0 2px 0 rgba(0,0,0,.25);',
      '  animation:kbTwDrop .45s cubic-bezier(.22,1,.36,1)}',
      '@keyframes kbTwDrop{from{transform:translateY(-26px);opacity:0}to{transform:translateY(0);opacity:1}}',
      '.kb-tw-base{width:104px;height:9px;border-radius:5px;background:rgba(255,255,255,.22)}',
      '.kb-tw-label{font-weight:900;font-size:16px}',
      '.kb-tw-n{font-weight:900;font-size:22px;color:#ffd23f}',
      '.kb-tw-shake{animation:kbTwShake .5s ease}',
      '@keyframes kbTwShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}',
      '  40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}',
      '.kb-tw-top{margin-top:12px;text-align:center;font-weight:900;font-size:24px;color:#ffd23f}',
      /* 참가자 폰 — 우리 팀 + 내 기여만 (KB-2) */
      '.kb-tw-bar{margin:0 0 14px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06)}',
      '.kb-tw-bar-t{display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:15px}',
      '.kb-tw-mine{margin-top:6px;font-weight:800;font-size:13px;color:rgba(255,255,255,.6)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function tower(ctx) {
    injectStyle();
    var getRoster = ctx.getRoster;
    var nTeams = Math.max(2, Math.min(4, (ctx.config && ctx.config.teams) | 0 || 2));

    var teamOf = {};        // name → 팀 index
    var blocks = [];        // 팀별 블록 수
    var mine = {};          // name → 내가 올린 블록 수 (순위 아님, 기여)
    var shake = {};         // 팀별 흔들림 1회 플래그 (오답 연출 — 블록은 안 잃는다)
    var built = false, colEls = [];
    for (var i = 0; i < nTeams; i++) blocks.push(0);

    // 입장 순서 라운드로빈. 지각 입장은 가장 적은 팀으로 — 팀 인원이 벌어지지 않게.
    function assign(name) {
      if (teamOf[name] != null) return teamOf[name];
      var count = [];
      for (var i = 0; i < nTeams; i++) count.push(0);
      Object.keys(teamOf).forEach(function (n) { count[teamOf[n]]++; });
      var min = 0;
      for (var j = 1; j < nTeams; j++) if (count[j] < count[min]) min = j;
      teamOf[name] = min;
      return min;
    }
    function syncTeams() { getRoster().forEach(assign); }

    function onAnswer(e) {
      var t = assign(e.name);
      if (e.correct) {
        blocks[t] += 1;                        // 팀 블록 +1
        mine[e.name] = (mine[e.name] || 0) + 1;
      } else {
        shake[t] = true;                       // 흔들리기만 한다. ⛔ 블록은 안 내려간다(제3조)
      }
    }

    function onReveal() { shake = {}; }        // 흔들림은 그 문제에서만

    function publicState() {
      syncTeams();
      return { id: 'tower', teams: nTeams, blocks: blocks.slice(),
               teamOf: teamOf, mine: mine, shake: shake,
               names: TEAM_META.slice(0, nTeams).map(function (m) { return m.name; }) };
    }

    /* ---- 전자칠판 ---- */
    function hostLayer(el) {
      syncTeams();
      if (!built) build(el);
      var top = 0;
      blocks.forEach(function (b) { if (b > top) top = b; });

      colEls.forEach(function (c, t) {
        // 블록 개수 맞추기 (기존 노드 유지 → 새로 떨어지는 블록만 애니메이션)
        var have = c.stack.childNodes.length;
        var want = Math.min(MAX_SHOW, blocks[t]);
        for (var k = have; k < want; k++) {
          var b = document.createElement('div');
          b.className = 'kb-tw-brick';
          b.style.background = TEAM_META[t].color;
          c.stack.appendChild(b);
        }
        c.num.textContent = blocks[t];
        var count = getRoster().filter(function (n) { return teamOf[n] === t; }).length;
        c.label.textContent = TEAM_META[t].emoji + ' ' + TEAM_META[t].name + ' (' + count + '명)';
        if (shake[t]) {
          c.stack.classList.remove('kb-tw-shake');
          void c.stack.offsetWidth;                 // 리플로우 → 애니메이션 재시작
          c.stack.classList.add('kb-tw-shake');
        }
      });

      var tp = el.querySelector('.kb-tw-top');
      if (tp) {
        var leaders = [];
        blocks.forEach(function (b, t) { if (b === top && top > 0) leaders.push(TEAM_META[t].name); });
        tp.textContent = (leaders.length === 1) ? ('🏗 ' + leaders[0] + ' 팀이 제일 높아요')
                       : (leaders.length > 1 ? '🏗 같은 높이!' : '');
      }
    }

    function build(el) {
      el.className = 'kb-tw';
      el.innerHTML = '<div class="kb-tw-yard"></div><div class="kb-tw-top"></div>';
      var yard = el.querySelector('.kb-tw-yard');
      colEls = [];
      for (var t = 0; t < nTeams; t++) {
        var col = document.createElement('div');
        col.className = 'kb-tw-col';
        col.innerHTML =
          '<div class="kb-tw-n">0</div>' +
          '<div class="kb-tw-stack"></div>' +
          '<div class="kb-tw-base"></div>' +
          '<div class="kb-tw-label"></div>';
        yard.appendChild(col);
        colEls.push({
          num: col.querySelector('.kb-tw-n'),
          stack: col.querySelector('.kb-tw-stack'),
          label: col.querySelector('.kb-tw-label')
        });
      }
      built = true;
    }

    /* ---- 참가자 폰: 우리 팀 + 내 기여 (KB-2) ---- */
    function playerLayer(el, my) {
      var st = my && my.state;
      if (!st || st.id !== 'tower') return;
      var t = st.teamOf && st.teamOf[my.name];
      if (t == null) { el.innerHTML = ''; return; }
      var meta = TEAM_META[t];
      var mineN = (st.mine && st.mine[my.name]) || 0;
      el.className = 'kb-tw-bar';
      el.innerHTML =
        '<div class="kb-tw-bar-t">' +
          '<span style="color:' + meta.color + '">' + meta.emoji + ' ' + esc(meta.name) + ' 팀</span>' +
          '<span>블록 ' + st.blocks[t] + '개</span>' +
        '</div>' +
        '<div class="kb-tw-mine">' +
          (mineN ? '내가 올린 블록 ' + mineN + '개' : '한 문제만 맞혀도 우리 팀이 한 층 올라가요') +
        '</div>';
      // ⛔ 팀원 개인 기여 목록·개인 점수 없음 (KB-2)
    }

    return {
      onAnswer: onAnswer,
      onReveal: onReveal,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get blocks() { return blocks.slice(); }, get teamOf() { return teamOf; },
               get shake() { return shake; }, get teams() { return nTeams; } }
    };
  }

  KBModes.tower = tower;
})();
