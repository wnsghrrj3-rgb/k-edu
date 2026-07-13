/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #5 「서바이벌」 (kb-mode-survival.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 6종 — 개인전·**참거짓 폭풍 전용**·학년칸 **고** /
             "3오답 시 관전" · **"탈락자도 화면에서 할 일이 있다 — 죽으면 멍하니 구경은 교실 사고 지점, 금지"**),
             KP-2(탈락자 관전 플래그), 제3조(감점 없음), KB-2.

   ⭐ 이 모드의 진짜 문제는 탈락이 아니라 **탈락한 다음**이다.
      서바이벌은 케이배틀에서 유일하게 아이를 **떨어뜨리는** 모드다(그래서 학년칸 = 고).
      그런데 헌법은 "죽으면 멍하니 구경"을 **교실 사고 지점**이라 부르며 금지한다.
      둘 다 지키는 유일한 길:

        **탈락자는 구경꾼이 아니라 구조대가 된다.**

      떨어진 아이도 문제를 계속 푼다. 자기 점수는 안 오른다.
      대신 맞히면 **아직 살아 있는 친구 중 가장 위태로운 아이의 생명을 1 되살린다.**
      → 떨어진 아이가 화면에서 제일 바빠진다. "야 내가 살려줄게"가 성립한다.
      → 아이는 떨어져도 게임을 안 떠난다. 그게 이 모드가 교실에서 살아남는 유일한 방법이다.

   규칙:
     - 생명 3개. 오답·미응답 = 생명 −1. (⛔ **점수는 안 깎인다** — 제3조. 깎이는 건 생명뿐이다.)
     - 생명 0 → 관전(구조대) 전환. 문제는 계속 뜬다.
     - 구조대 정답 2개 = 생존자 1명 생명 +1 (가장 생명이 적은 아이부터).
     - 마지막까지 살아남은 아이 = 생존자. **전원 탈락해도 판은 안 끝난다**(구조대가 서로를 살리면 부활한다).
     - 화면엔 생명(하트)만. ⛔ 점수·등수 없음(KB-2).
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.survival) return;

  var LIVES = 3;
  var RESCUE_PER_LIFE = 2;    // 구조대 정답 2개 = 생명 1 되살림

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-survival-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-survival-style';
    s.textContent = [
      '.kb-sv{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-sv-head{display:flex;justify-content:space-between;align-items:center;',
      '  font-weight:900;font-size:19px;margin-bottom:12px}',
      '.kb-sv-n{color:#ffd23f}',
      '.kb-sv-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}',
      '.kb-sv-p{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 13px;',
      '  border-radius:13px;background:#1f2147;border:2px solid rgba(255,255,255,.1);min-width:92px;',
      '  transition:opacity .4s ease}',
      '.kb-sv-p.out{background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.45)}',
      '.kb-sv-nm{font-weight:900;font-size:15px}',
      '.kb-sv-h{font-size:14px;letter-spacing:1px}',
      '.kb-sv-role{font-size:10px;font-weight:800;color:#38bdf8}',
      '.kb-sv-msg{margin-top:12px;text-align:center;font-weight:900;font-size:20px;color:#2dd4bf;min-height:26px}',
      /* 폰 — 내 생명 / 내 구조 진행 (KB-2) */
      '.kb-sv-bar{margin:0 0 14px;padding:11px 14px;border-radius:14px;background:rgba(255,255,255,.06);',
      '  text-align:center}',
      '.kb-sv-bar b{display:block;font-weight:900;font-size:20px;letter-spacing:2px}',
      '.kb-sv-bar span{display:block;font-weight:800;font-size:12px;color:rgba(255,255,255,.6);margin-top:4px}',
      '.kb-sv-rescue{background:rgba(56,189,248,.14);border:2px solid rgba(56,189,248,.45);',
      '  border-radius:14px;padding:11px 14px;text-align:center;margin:0 0 14px;animation:kbPop .35s ease}',
      '.kb-sv-rescue b{display:block;font-weight:900;font-size:16px;color:#38bdf8}',
      '.kb-sv-rescue span{display:block;font-size:12px;font-weight:800;color:rgba(255,255,255,.7);margin-top:4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function survival(ctx) {
    injectStyle();
    var getRoster = ctx.getRoster;

    var lives = {};        // name → 남은 생명
    var rescue = {};       // name → 구조대가 된 뒤 맞힌 수
    var saved = {};        // name → 내가 살려낸 횟수 (구조대의 자랑거리)
    var lastEvent = '';    // 전자칠판 한 줄
    var built = false, box = null;

    function ensure(n) { if (lives[n] == null) lives[n] = LIVES; return lives[n]; }
    function alive(n) { return ensure(n) > 0; }
    function survivors() { return getRoster().filter(alive); }

    function onAnswer(e) {
      var n = e.name;
      ensure(n);

      if (alive(n)) {
        if (!e.correct) {
          lives[n] -= 1;                       // ⛔ 점수는 안 깎인다. 깎이는 건 생명뿐(제3조).
          if (lives[n] <= 0) {
            lives[n] = 0;
            lastEvent = esc(n) + ' 구조대 합류!';   // "탈락"이라 말하지 않는다 — 역할이 바뀐 것이다
          }
        }
        return;
      }

      /* 구조대 (KP-2 · 제4조 "탈락자도 할 일이 있다") */
      if (!e.correct) return;
      rescue[n] = (rescue[n] || 0) + 1;
      if (rescue[n] % RESCUE_PER_LIFE !== 0) return;

      // 가장 위태로운 생존자부터 살린다 (생명이 적은 순 → 이름 순으로 결정적)
      var alives = survivors().sort(function (a, b) {
        return (lives[a] - lives[b]) || (a < b ? -1 : 1);
      });
      var target = alives.filter(function (x) { return lives[x] < LIVES; })[0] || alives[0];
      if (!target) return;
      lives[target] = Math.min(LIVES, lives[target] + 1);
      saved[n] = (saved[n] || 0) + 1;
      lastEvent = esc(n) + ' → ' + esc(target) + ' 살렸다!';
    }

    function onReveal(e) {
      // 미응답도 생명 −1 (서바이벌은 침묵이 곧 오답이다 — 고학년 모드)
      var res = (e && e.results) || {};
      getRoster().forEach(function (n) {
        ensure(n);
        if (!alive(n)) return;
        if (!res[n]) {
          lives[n] -= 1;
          if (lives[n] <= 0) { lives[n] = 0; lastEvent = esc(n) + ' 구조대 합류!'; }
        }
      });
    }

    function publicState() {
      getRoster().forEach(ensure);
      return { id: 'survival', max: LIVES, lives: lives, rescue: rescue, saved: saved,
               need: RESCUE_PER_LIFE, alive: survivors().length, total: getRoster().length,
               event: lastEvent };
    }

    /* ---- 전자칠판 ---- */
    function hostLayer(el) {
      if (!built) build(el);
      var roster = getRoster();
      roster.forEach(ensure);
      var head = el.querySelector('.kb-sv-n');
      if (head) head.textContent = survivors().length + ' / ' + roster.length + ' 생존';
      box.innerHTML = roster.map(function (n) {
        var out = !alive(n);
        var hearts = out ? '🛟' : new Array(lives[n] + 1).join('❤️');
        return '<div class="kb-sv-p' + (out ? ' out' : '') + '">' +
          '<span class="kb-sv-nm">' + esc(n) + '</span>' +
          '<span class="kb-sv-h">' + hearts + '</span>' +
          (out ? '<span class="kb-sv-role">구조대' + (saved[n] ? ' · ' + saved[n] + '명 살림' : '') + '</span>' : '') +
        '</div>';
      }).join('');
      var msg = el.querySelector('.kb-sv-msg');
      if (msg) msg.textContent = lastEvent;
      // ⛔ 점수·등수는 안 그린다 (KB-2). 뜨는 건 생명뿐.
    }

    function build(el) {
      el.className = 'kb-sv';
      el.innerHTML =
        '<div class="kb-sv-head"><span>💥 서바이벌</span><span class="kb-sv-n"></span></div>' +
        '<div class="kb-sv-grid"></div>' +
        '<div class="kb-sv-msg"></div>';
      box = el.querySelector('.kb-sv-grid');
      built = true;
    }

    /* ---- 폰: 내 생명 / 내 구조 (KB-2 — 남의 생명 목록 없음) ---- */
    function playerLayer(el, my) {
      var st = my && my.state;
      if (!st || st.id !== 'survival') return;
      var lv = st.lives[my.name];
      if (lv == null) lv = st.max;

      if (lv > 0) {
        el.className = 'kb-sv-bar';
        el.innerHTML = '<b>' + new Array(lv + 1).join('❤️') + '</b>' +
          '<span>' + (lv === 1 ? '생명 하나 남았어요. 천천히 읽어요' : '생명 ' + lv + '개') + '</span>';
        return;
      }
      // 구조대 — 화면에서 제일 바쁜 사람이 된다
      var r = (st.rescue && st.rescue[my.name]) || 0;
      var sv = (st.saved && st.saved[my.name]) || 0;
      var to = st.need - (r % st.need);
      el.className = 'kb-sv-rescue';
      el.innerHTML = '<b>🛟 나는 구조대</b>' +
        '<span>' + to + '개 더 맞히면 <b style="display:inline">친구 하나를 살려요</b>' +
        (sv ? ' · 지금까지 ' + sv + '명 살림' : '') + '</span>';
    }

    return {
      onAnswer: onAnswer,
      onReveal: onReveal,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get lives() { return lives; }, get rescue() { return rescue; },
               get saved() { return saved; }, LIVES: LIVES, NEED: RESCUE_PER_LIFE }
    };
  }

  KBModes.survival = survival;
})();
