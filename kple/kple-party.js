/* ============================================================================
   K-edu 케이플(Kple) — K1 파티 레이어 (kple-party.js)
   ----------------------------------------------------------------------------
   "전 게임이 공짜로 입는 옷" — 팀전 · 이모지 리액션 · 게임쇼 연출 3종.
   설계: kple/KPLE_대확장_설계.md K1.

   ⛔ 불변 원칙(생존 조건):
     - kple-core.js 안 건드림. 게임 모듈(games/*.js) 안 건드림. kple.css 안 건드림.
     - 파티는 코어의 공개 계약 위에만 얹힌다:
         호스트: hostCtx.on('answer'|'join'|'bye'), hostCtx.sendState, hostCtx.getRoster
         참가자: joinCtx.on('state'), joinCtx.answer
     - 파티 메시지는 전부 `__pty` 마커를 달아 게임과 섞이지 않는다.
         리액션(참가자→호스트): joinCtx.answer({ __pty:'react', e:'🔥' })
           → 모든 게임 answer 핸들러는 choice/seg/guess/stroke 필드 가드라 자연 무시.
         팀배정(호스트→참가자): hostCtx.sendState({ __pty:'teams', ... })
           → 모든 게임 state 핸들러는 phase/topic/clear 가드라 자연 무시(무해한 재렌더만).
     - CSS 는 이 파일이 <style> 1회 주입(kple.css 불변 유지).

   공개 API:
     KpleParty.attach(hostCtx, { el })        → hostHandle
     KpleParty.attachPlayer(joinCtx, { el })  → playerHandle
   ============================================================================ */
(function () {
  if (window.KpleParty) return;

  // ── 프리셋 ────────────────────────────────────────────────────────────
  var TEAM_PRESETS = [
    { key: 'fire',  name: '불꽃', emoji: '🔥', color: '#ff5a4d' },
    { key: 'wave',  name: '파도', emoji: '🌊', color: '#3aa0ff' },
    { key: 'bolt',  name: '번개', emoji: '⚡', color: '#ffc531' },
    { key: 'sprout',name: '새싹', emoji: '🌱', color: '#4bd07a' }
  ];
  var REACTS = ['👏', '🔥', '😂', '😮', '❤️'];
  var REACT_MIN_GAP = 500;   // 클라 송신 상한: 인당 초당 2회(KP-3, 송신단 제한)
  var FLOAT_MAX = 40;        // 호스트 동시 표시 상한

  // ── 유틸 ──────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ── CSS 1회 주입(kple.css 불변) ───────────────────────────────────────
  var CSS_ID = 'kple-party-style';
  function injectCSS() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '.kpty-bar{position:fixed;top:14px;right:14px;z-index:9998;display:flex;gap:8px;',
        'align-items:center;font-family:inherit;}',
      '.kpty-btn{border:none;border-radius:12px;padding:9px 14px;cursor:pointer;font-weight:800;',
        'font-size:14px;font-family:inherit;background:rgba(255,255,255,.92);color:#1a2540;',
        'box-shadow:0 2px 10px rgba(0,0,0,.22);transition:.12s;}',
      '.kpty-btn:hover{filter:brightness(1.05);transform:translateY(-1px);}',
      '.kpty-btn.on{background:var(--kp-yellow,#ffd23f);}',
      '.kpty-btn.mini{padding:9px 12px;font-size:13px;}',
      '.kpty-teamnum{display:none;gap:6px;align-items:center;background:rgba(20,29,51,.9);',
        'border-radius:12px;padding:6px 8px;box-shadow:0 2px 10px rgba(0,0,0,.22);}',
      '.kpty-teamnum.show{display:flex;}',
      '.kpty-teamnum button{border:none;border-radius:9px;width:34px;height:32px;cursor:pointer;',
        'font-weight:800;font-size:15px;font-family:inherit;background:rgba(255,255,255,.14);color:#fff;}',
      '.kpty-teamnum button.on{background:var(--kp-yellow,#ffd23f);color:#1a2540;}',
      /* 팀 스코어보드(호스트) */
      '.kpty-board{position:fixed;top:64px;right:14px;z-index:9997;display:none;flex-direction:column;',
        'gap:8px;width:210px;font-family:inherit;}',
      '.kpty-board.show{display:flex;}',
      '.kpty-team{border-radius:14px;padding:11px 13px;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.28);}',
      '.kpty-team-h{display:flex;align-items:center;gap:7px;font-weight:800;font-size:16px;}',
      '.kpty-team-h .n{margin-left:auto;font-size:15px;opacity:.95;}',
      '.kpty-team-m{font-size:12px;opacity:.9;margin-top:5px;line-height:1.5;word-break:break-all;}',
      /* 리액션 떠오름 레이어(호스트, 클릭 통과) */
      '.kpty-float{position:fixed;inset:0;z-index:9996;pointer-events:none;overflow:hidden;}',
      '.kpty-emo{position:absolute;bottom:8%;font-size:40px;will-change:transform,opacity;',
        'animation:kpty-rise 1.9s ease-out forwards;text-shadow:0 2px 8px rgba(0,0,0,.3);}',
      '.kpty-emo .who{display:block;font-size:12px;text-align:center;margin-top:-4px;',
        'color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.6);font-weight:700;}',
      '@keyframes kpty-rise{0%{transform:translateY(0) scale(.6);opacity:0;}',
        '12%{opacity:1;transform:translateY(-10px) scale(1.05);}',
        '100%{transform:translateY(-260px) scale(1);opacity:0;}}',
      /* 게임쇼 연출 풀스크린 씬 */
      '.kpty-scene{position:fixed;inset:0;z-index:10001;display:flex;align-items:center;',
        'justify-content:center;flex-direction:column;background:rgba(10,16,32,.86);',
        'backdrop-filter:blur(4px);font-family:inherit;color:#fff;}',
      '.kpty-count{font-size:min(42vw,340px);font-weight:900;line-height:1;',
        'animation:kpty-pop .9s ease-out;color:var(--kp-yellow,#ffd23f);',
        'text-shadow:0 8px 40px rgba(0,0,0,.5);}',
      '@keyframes kpty-pop{0%{transform:scale(.2);opacity:0;}30%{transform:scale(1.15);opacity:1;}',
        '70%{transform:scale(1);}100%{transform:scale(1.4);opacity:0;}}',
      '.kpty-drum{font-size:min(14vw,110px);font-weight:900;letter-spacing:.06em;',
        'animation:kpty-shake .12s linear infinite;}',
      '@keyframes kpty-shake{0%,100%{transform:translateX(-3px) rotate(-1deg);}50%{transform:translateX(3px) rotate(1deg);}}',
      '.kpty-boom{font-size:min(22vw,220px);font-weight:900;animation:kpty-pop .8s ease-out forwards;}',
      /* 순위 바 레이스 */
      '.kpty-ranks{width:min(680px,88vw);display:flex;flex-direction:column;gap:12px;}',
      '.kpty-ranks h2{font-size:26px;font-weight:900;margin:0 0 6px;text-align:center;}',
      '.kpty-rank{position:relative;height:46px;border-radius:12px;background:rgba(255,255,255,.1);overflow:hidden;}',
      '.kpty-rank .fill{position:absolute;inset:0;width:0;border-radius:12px;transition:width 1.1s cubic-bezier(.2,.7,.2,1);}',
      '.kpty-rank .lbl{position:absolute;inset:0;display:flex;align-items:center;gap:9px;',
        'padding:0 16px;font-weight:800;font-size:17px;z-index:1;}',
      '.kpty-rank .lbl .sc{margin-left:auto;font-variant-numeric:tabular-nums;}',
      '.kpty-champ{text-align:center;}',
      '.kpty-champ .crown{font-size:64px;animation:kpty-pop .9s ease-out;}',
      '.kpty-champ .nm{font-size:min(11vw,84px);font-weight:900;margin:8px 0;',
        'text-shadow:0 6px 30px rgba(0,0,0,.5);}',
      '.kpty-champ .sub{font-size:20px;opacity:.85;}',
      '.kpty-gold{position:absolute;top:-10px;font-size:22px;animation:kpty-fall 2.6s linear forwards;pointer-events:none;}',
      '@keyframes kpty-fall{0%{transform:translateY(-20px) rotate(0);opacity:1;}',
        '100%{transform:translateY(110vh) rotate(540deg);opacity:.85;}}',
      '.kpty-scene-x{position:absolute;top:16px;right:18px;width:40px;height:40px;border:none;',
        'border-radius:12px;background:rgba(255,255,255,.14);color:#fff;font-size:24px;cursor:pointer;}',
      /* 참가자 리액션 바(폰) — 접힘식: 평소엔 우하단 토글 하나, 누르면 펼침
         (전면 바가 문제·답 버튼을 가리던 문제, 2026-08-27) */
      '.kpty-react{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0));',
        'z-index:9998;display:flex;justify-content:flex-end;gap:8px;font-family:inherit;}',
      '.kpty-react button{width:48px;height:48px;border:none;border-radius:16px;font-size:24px;',
        'cursor:pointer;background:rgba(255,255,255,.94);box-shadow:0 3px 10px rgba(0,0,0,.25);',
        'transition:transform .08s;}',
      '.kpty-react button:active{transform:scale(.86);}',
      '.kpty-react button.kpty-emo-btn{display:none;}',
      '.kpty-react.open button.kpty-emo-btn{display:block;}',
      '.kpty-toggle{opacity:.85;}',
      '.kpty-react.open .kpty-toggle{opacity:1;}',
      '.kpty-mine{position:fixed;left:12px;bottom:76px;z-index:9998;display:none;align-items:center;',
        'gap:6px;padding:7px 12px;border-radius:999px;font-family:inherit;font-weight:800;',
        'font-size:14px;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.3);}',
      '.kpty-mine.show{display:inline-flex;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── 합성 사운드(외부 파일 없음, jsdom 안전) ───────────────────────────
  var AC = null;
  function ac() {
    if (AC) return AC;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { AC = new C(); } catch (e) { AC = null; }
    return AC;
  }
  function beep(freq, dur, when, type, vol) {
    var a = ac(); if (!a) return;
    try {
      var t = a.currentTime + (when || 0);
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  function sndTick() { beep(880, 0.09, 0, 'square', 0.15); }
  function sndGo() { beep(1320, 0.28, 0, 'triangle', 0.22); }
  function sndDrum() { var a = ac(); if (!a) return; for (var i = 0; i < 10; i++) beep(90 + i * 4, 0.06, i * 0.08, 'sawtooth', 0.12); }
  function sndPang() { beep(660, 0.5, 0, 'triangle', 0.25); beep(990, 0.5, 0.02, 'sine', 0.18); }
  function sndFanfare() {
    [523, 659, 784, 1046].forEach(function (f, i) { beep(f, 0.4, i * 0.12, 'triangle', 0.2); });
  }

  // ══════════════════════════════════════════════════════════════════════
  //  호스트 부착
  // ══════════════════════════════════════════════════════════════════════
  function attach(hostCtx, opts) {
    opts = opts || {};
    injectCSS();
    var mount = (opts.el && opts.el.ownerDocument) ? opts.el : document.body;
    var docBody = document.body;

    // 상태
    var teamsOn = false;
    var teamCount = 2;
    var assign = {};          // name -> teamIndex
    var teamScores = [0, 0, 0, 0];   // 게임 협조 훅으로만 채워짐(optional)

    // ── 툴바 ──
    var bar = el('div', 'kpty-bar');
    var teamBtn = el('button', 'kpty-btn', '👥 팀전');
    var numWrap = el('div', 'kpty-teamnum');
    [2, 3, 4].forEach(function (n) {
      var b = el('button', n === teamCount ? 'on' : '', String(n));
      b.onclick = function () {
        teamCount = n;
        [].forEach.call(numWrap.children, function (c) { c.classList.toggle('on', c.textContent === String(n)); });
        if (teamsOn) { reassign(); pushTeams(); renderBoard(); }
      };
      numWrap.appendChild(b);
    });
    var rankBtn = el('button', 'kpty-btn mini', '🏆 순위');
    var champBtn = el('button', 'kpty-btn mini', '🎉 세리머니');
    bar.appendChild(teamBtn); bar.appendChild(numWrap);
    bar.appendChild(rankBtn); bar.appendChild(champBtn);
    docBody.appendChild(bar);

    var board = el('div', 'kpty-board');
    docBody.appendChild(board);

    var floatLayer = el('div', 'kpty-float');
    docBody.appendChild(floatLayer);

    // ── 팀 배정 ──
    function reassign() {
      var roster = hostCtx.getRoster ? hostCtx.getRoster() : [];
      assign = {};
      roster.forEach(function (nm, i) { assign[nm] = i % teamCount; });
    }
    function teamOf(name) { return teamsOn && (name in assign) ? assign[name] : -1; }
    function colorOf(name) { var t = teamOf(name); return t >= 0 ? TEAM_PRESETS[t].color : '#8fa0c8'; }

    function pushTeams() {
      // 게임 state 핸들러가 무시하는 __pty 마커 메시지(늦은입장 resync 포함)
      if (!hostCtx.sendState) return;
      var teams = TEAM_PRESETS.slice(0, teamCount).map(function (p) { return { name: p.name, emoji: p.emoji, color: p.color }; });
      hostCtx.sendState({ __pty: 'teams', on: teamsOn, count: teamCount, map: Object.assign({}, assign), teams: teams });
    }

    function renderBoard() {
      if (!teamsOn) { board.classList.remove('show'); board.innerHTML = ''; return; }
      var members = [];
      for (var i = 0; i < teamCount; i++) members.push([]);
      Object.keys(assign).forEach(function (nm) { var t = assign[nm]; if (members[t]) members[t].push(nm); });
      board.innerHTML = TEAM_PRESETS.slice(0, teamCount).map(function (p, i) {
        return '<div class="kpty-team" style="background:' + p.color + '">' +
          '<div class="kpty-team-h">' + p.emoji + '<span>' + p.name + '팀</span>' +
          '<span class="n">' + members[i].length + '명' + (teamScores[i] ? ' · ' + teamScores[i] + '점' : '') + '</span></div>' +
          '<div class="kpty-team-m">' + (members[i].map(esc).join(', ') || '—') + '</div></div>';
      }).join('');
      board.classList.add('show');
    }

    teamBtn.onclick = function () {
      teamsOn = !teamsOn;
      teamBtn.classList.toggle('on', teamsOn);
      numWrap.classList.toggle('show', teamsOn);
      if (teamsOn) reassign();
      pushTeams();
      renderBoard();
    };

    // 늦은 입장/이탈 시 팀 재계산·재전파
    hostCtx.on('join', function () { if (teamsOn) { reassign(); pushTeams(); renderBoard(); } });
    hostCtx.on('bye', function () { if (teamsOn) { renderBoard(); } });

    // ── 이모지 리액션 수신(참가자 answer 의 __pty 마커) ──
    hostCtx.on('answer', function (p) {
      if (!p || p.__pty !== 'react') return;   // 게임 answer 는 그대로 게임으로
      floatEmoji(p.e || '👏', p.name, colorOf(p.name));
    });

    function floatEmoji(emo, name, color) {
      if (floatLayer.childElementCount >= FLOAT_MAX) {
        try { floatLayer.removeChild(floatLayer.firstChild); } catch (e) {}
      }
      var n = el('div', 'kpty-emo');
      n.style.left = (6 + Math.random() * 86) + '%';
      n.style.fontSize = (34 + Math.random() * 14) + 'px';
      n.innerHTML = esc(emo) + (name ? '<span class="who" style="color:' + color + '">' + esc(name) + '</span>' : '');
      floatLayer.appendChild(n);
      setTimeout(function () { try { floatLayer.removeChild(n); } catch (e) {} }, 2000);
    }

    // ══ 게임쇼 연출(호스트 화면 전용) ══
    function scene(closable) {
      var sc = el('div', 'kpty-scene');
      if (closable) {
        var x = el('button', 'kpty-scene-x', '×');
        x.onclick = function () { try { docBody.removeChild(sc); } catch (e) {} };
        sc.appendChild(x);
      }
      docBody.appendChild(sc);
      return sc;
    }
    function removeScene(sc) { try { docBody.removeChild(sc); } catch (e) {} }

    function countdown(n, cb) {
      n = n || 3;
      var sc = scene(false);
      var num = el('div', 'kpty-count');
      sc.appendChild(num);
      var i = n;
      (function tick() {
        if (i <= 0) { num.textContent = '시작!'; sndGo(); setTimeout(function () { removeScene(sc); if (cb) cb(); }, 700); return; }
        num.textContent = String(i); sndTick();
        num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
        i--; setTimeout(tick, 1000);
      })();
      return sc;
    }

    function drumroll(cb) {
      var sc = scene(false);
      var d = el('div', 'kpty-drum', '두구두구두구…');
      sc.appendChild(d); sndDrum();
      setTimeout(function () {
        d.className = 'kpty-boom'; d.textContent = '팡! 🎉'; sndPang();
        setTimeout(function () { removeScene(sc); if (cb) cb(); }, 1100);
      }, 1400);
      return sc;
    }

    // rows: [{ name, score, color? }] — 게임/팀이 넘기는 점수. 미제공 시 팀보드/roster 로 폴백.
    function rankBars(rows, title) {
      rows = (rows && rows.length) ? rows.slice() : fallbackRows();
      rows.sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
      rows = rows.slice(0, 8);
      var max = Math.max(1, rows.length ? rows[0].score || 0 : 1);
      var sc = scene(true);
      var box = el('div', 'kpty-ranks');
      box.innerHTML = '<h2>' + esc(title || '순위 발표') + '</h2>' + rows.map(function (r, i) {
        var c = r.color || TEAM_PRESETS[i % 4].color;
        return '<div class="kpty-rank"><div class="fill" data-w="' + Math.round((r.score || 0) / max * 100) +
          '" style="background:' + c + '"></div><div class="lbl"><span>' +
          (['🥇', '🥈', '🥉'][i] || '•') + '</span>' + esc(r.name) +
          '<span class="sc">' + (r.score || 0) + '</span></div></div>';
      }).join('');
      sc.appendChild(box); sndDrum();
      requestAnimationFrame(function () {
        [].forEach.call(box.querySelectorAll('.fill'), function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
      });
      return sc;
    }

    function fallbackRows() {
      if (teamsOn) {
        return TEAM_PRESETS.slice(0, teamCount).map(function (p, i) {
          return { name: p.emoji + ' ' + p.name + '팀', score: teamScores[i] || 0, color: p.color };
        });
      }
      var roster = hostCtx.getRoster ? hostCtx.getRoster() : [];
      return roster.map(function (nm) { return { name: nm, score: 0 }; });
    }

    function champion(name, color) {
      if (!name) {
        var rows = fallbackRows().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
        name = rows.length ? rows[0].name : '우리 반';
        color = rows.length ? rows[0].color : null;
      }
      var sc = scene(true);
      var box = el('div', 'kpty-champ');
      box.innerHTML = '<div class="crown">👑</div><div class="nm" style="color:' + (color || 'var(--kp-yellow,#ffd23f)') +
        '">' + esc(name) + '</div><div class="sub">축하합니다!</div>';
      sc.appendChild(box); sndFanfare();
      for (var i = 0; i < 60; i++) {
        (function (i) {
          var g = el('div', 'kpty-gold', ['✨', '🎉', '⭐', '💛'][i % 4]);
          g.style.left = (Math.random() * 100) + '%';
          g.style.animationDelay = (Math.random() * 1.2) + 's';
          sc.appendChild(g);
        })(i);
      }
      return sc;
    }

    rankBtn.onclick = function () { rankBars(handle._rows, teamsOn ? '팀 순위' : '순위 발표'); };
    champBtn.onclick = function () { champion(); };

    // ── 핸들(K2 게임이 점수로 연출을 부를 수 있게 공개) ──
    var handle = {
      _rows: null,
      countdown: countdown,
      drumroll: drumroll,
      rankBars: rankBars,
      champion: champion,
      floatEmoji: floatEmoji,
      // 게임 협조 훅(optional): 게임이 점수를 넘기면 팀 합산·순위 데이터 갱신
      setScores: function (scoreMap) {
        var rows = [];
        teamScores = [0, 0, 0, 0];
        Object.keys(scoreMap || {}).forEach(function (nm) {
          var v = scoreMap[nm] || 0;
          rows.push({ name: nm, score: v, color: colorOf(nm) });
          var t = teamOf(nm); if (t >= 0) teamScores[t] += v;
        });
        handle._rows = rows;
        if (teamsOn) renderBoard();
        return handle;
      },
      teamOf: teamOf,
      isTeams: function () { return teamsOn; },
      dispose: function () {
        [bar, board, floatLayer].forEach(function (n) { try { docBody.removeChild(n); } catch (e) {} });
        [].forEach.call(docBody.querySelectorAll('.kpty-scene'), function (s) { try { docBody.removeChild(s); } catch (e) {} });
      }
    };
    return handle;
  }

  // ══════════════════════════════════════════════════════════════════════
  //  참가자(폰) 부착 — 리액션 바 + 팀 뱃지
  // ══════════════════════════════════════════════════════════════════════
  function attachPlayer(joinCtx, opts) {
    opts = opts || {};
    injectCSS();
    var docBody = document.body;
    var lastReact = 0;

    // 리액션 바 — 접힘식(토글을 눌러야 이모지 줄이 펼쳐지고, 보내면 다시 접힌다)
    var bar = el('div', 'kpty-react');
    REACTS.forEach(function (e) {
      var b = el('button', 'kpty-emo-btn', e);
      b.onclick = function () {
        var now = Date.now();
        if (now - lastReact < REACT_MIN_GAP) return;   // 송신단 상한(KP-3)
        lastReact = now;
        try { joinCtx.answer({ __pty: 'react', e: e }); } catch (err) {}
        b.style.transform = 'scale(.86)';
        setTimeout(function () {
          b.style.transform = '';
          bar.classList.remove('open');                // 보냈으면 접기 — 화면 가림 최소화
        }, 90);
      };
      bar.appendChild(b);
    });
    var toggle = el('button', 'kpty-toggle', '🙌');
    toggle.setAttribute('aria-label', '반응 보내기');
    toggle.onclick = function () { bar.classList.toggle('open'); };
    bar.appendChild(toggle);
    docBody.appendChild(bar);

    // 내 팀 뱃지
    var mine = el('div', 'kpty-mine');
    docBody.appendChild(mine);

    // 팀 배정 수신(__pty state — 게임 state 핸들러는 무시)
    joinCtx.on('state', function (p) {
      if (!p || p.__pty !== 'teams') return;
      if (!p.on) { mine.classList.remove('show'); return; }
      var idx = p.map && (joinCtx.name in p.map) ? p.map[joinCtx.name] : -1;
      var t = (idx >= 0 && p.teams && p.teams[idx]) ? p.teams[idx] : null;
      if (!t) { mine.classList.remove('show'); return; }
      mine.innerHTML = t.emoji + ' ' + esc(t.name) + '팀';
      mine.style.background = t.color;
      mine.classList.add('show');
    });

    return {
      dispose: function () {
        [bar, mine].forEach(function (n) { try { docBody.removeChild(n); } catch (e) {} });
      }
    };
  }

  window.KpleParty = {
    TEAM_PRESETS: TEAM_PRESETS,
    REACTS: REACTS,
    attach: attach,
    attachPlayer: attachPlayer
  };
})();
