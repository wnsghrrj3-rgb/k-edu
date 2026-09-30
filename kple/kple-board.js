/* ============================================================================
   K-edu 케이플(Kple) — 보드 공통 레이어 (kple-board.js)   [S0, 2026-09-29]
   ----------------------------------------------------------------------------
   "보드게임 10종이 공짜로 입는 옷". 설계: kple/KPLE_보드게임_설계.md §1.
   kple-party.js 와 같은 급의 유틸 레이어 — **코어(kple-core.js) 불변**, 게임(games/board-*.js)이 부품을 조립한다.
   CSS 는 이 파일이 <style> 1회 주입(kple.css 불변). **글씨 크기 원칙(준호 2026-09-30): 전자칠판은 교실 뒤에서도, 폰은 한눈에 — 작은 글씨 금지, clamp 로 화면 따라 키운다.**

   교실 보드게임 4법칙(설계 §0)을 부품이 강제한다:
     1. 턴 권위·랜덤 = 호스트 단독 (KP-4 / BP-1·2) — dice/yut/shuffle 은 호스트에서만 굴리고 결과만 state 로.
     2. 전원 참여 — qgate 「팀 전원」 모드: 이동력은 팀 전원의 정답률(전원/과반/미달 3등급).
     3. 모든 보드게임에 덱 — qgate 가 그 장치. 게이트 OFF = 일반 모드.
     4. 한 판 10~15분 — end() 에 라운드·시간 상한 훅.

   공개 API (window.KpleBoard):
     teams.build(ctx, count)             → [{name,emoji,color,members[]}] (파티 👥팀전 켜져 있으면 그 배정 인계, KP-5)
     teams.add(teams, name) / teams.remove(teams, name) / teams.of(teams, name)
     dice.roll(n) / yut.throw()          → 호스트 랜덤(BP-1)
     track.layout(n, cols)              → 뱀 모양(serpentine) 칸 좌표
     track.html(cells, opts)            → 트랙 렌더러(칸·사다리·미끄럼·이벤트·말)
     grid.html(rows, cols, cellFn)      → 격자 렌더러
     turn(teams)                        → 턴 매니저 { team, runner(), next(), skipTeam(i), rounds }
     qgate(opts)                        → 문제 게이트 수집기 { onAnswer(p), cancel(), pub() }  (호스트)
     phone.question(el, q, onPick, opts) / phone.action(el, label, onTap, opts) / phone.pick(el, grid, onPick)
     phone.wait(el, html) / phone.rank(...)
     grade(correct, total)              → 'all' | 'most' | 'few'
     end(rank, ctx)                     → 세리머니(party.champion) + 종료 state 도우미
   ============================================================================ */
(function () {
  if (window.KpleBoard) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var KEYS = ['①', '②', '③', '④'];
  var PRESETS = [
    { name: '불꽃', emoji: '🔥', color: '#ff5d5d' },
    { name: '파도', emoji: '🌊', color: '#38bdf8' },
    { name: '번개', emoji: '⚡', color: '#ffd23f' },
    { name: '새싹', emoji: '🌱', color: '#2dd4bf' }
  ];

  /* ── CSS 1회 주입 ── */
  var CSS_ID = 'kple-board-style';
  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return;
    var s = document.createElement('style'); s.id = CSS_ID;
    s.textContent = [
      '.kpb-track{display:grid;gap:6px;width:100%;max-width:980px;margin:6px auto 10px;}',
      '.kpb-cell{position:relative;aspect-ratio:1.35/1;border-radius:14px;background:rgba(255,255,255,.08);',
        'border:2px solid rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:flex-start;padding:6px 8px;overflow:hidden;}',
      '.kpb-cell.start{background:rgba(45,212,191,.16);border-color:var(--kp-mint,#2dd4bf);}',
      '.kpb-cell.goal{background:rgba(255,210,63,.18);border-color:var(--kp-yellow,#ffd23f);}',
      '.kpb-cell.up{background:rgba(74,222,128,.14);} .kpb-cell.down{background:rgba(255,93,93,.14);} .kpb-cell.ev{background:rgba(56,189,248,.14);}',
      '.kpb-n{font-weight:900;font-size:clamp(16px,1.6vw,24px);opacity:.7;}',
      '.kpb-mark{font-size:clamp(24px,2.4vw,36px);line-height:1;position:absolute;right:8px;top:6px;}',
      '.kpb-to{position:absolute;right:8px;bottom:6px;font-size:clamp(14px,1.4vw,20px);font-weight:900;opacity:.85;}',
      '.kpb-tokens{position:absolute;left:6px;bottom:5px;display:flex;gap:3px;flex-wrap:wrap;}',
      '.kpb-token{width:clamp(30px,3.2vw,46px);height:clamp(30px,3.2vw,46px);border-radius:50%;display:flex;align-items:center;justify-content:center;',
        'font-size:clamp(17px,1.9vw,28px);border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35);}',
      '.kpb-token.moved{animation:kpbPop .6s ease;}',
      '@keyframes kpbPop{0%{transform:scale(.4) translateY(-14px);}60%{transform:scale(1.25);}100%{transform:scale(1);}}',
      '.kpb-dice{display:flex;gap:16px;justify-content:center;margin:10px 0;}',
      '.kpb-die{width:96px;height:96px;border-radius:20px;background:#fff;color:#1a2540;font-size:60px;font-weight:900;',
        'display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.35);animation:kpbRoll .9s ease;}',
      '@keyframes kpbRoll{0%{transform:rotate(-540deg) scale(.3);opacity:0;}70%{transform:rotate(20deg) scale(1.15);}100%{transform:none;opacity:1;}}',
      '.kpb-teams{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:4px 0 8px;}',
      '.kpb-team{padding:10px 18px;border-radius:14px;background:rgba(255,255,255,.08);font-weight:900;font-size:clamp(18px,2vw,28px);border:3px solid transparent;}',
      '.kpb-team.turn{border-color:#fff;background:rgba(255,255,255,.16);}',
      '.kpb-team small{opacity:.8;font-weight:800;margin-left:8px;font-size:.85em;}',
      '.kpb-grid{display:grid;gap:6px;margin:6px auto;max-width:720px;}',
      '.kpb-gcell{aspect-ratio:1/1;border-radius:12px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:32px;}',
      '.kpb-banner{font-size:clamp(24px,3.6vw,44px);font-weight:900;text-align:center;margin:8px 0 6px;}',
      '.kpb-gate{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px 0;}',
      '.kpb-act{width:100%;padding:34px 20px;border:none;border-radius:24px;font-family:inherit;font-weight:900;font-size:30px;',
        'cursor:pointer;color:#1a2540;background:linear-gradient(135deg,#ffd23f,#ffb03f);box-shadow:0 8px 24px rgba(0,0,0,.35);margin-top:18px;}',
      '.kpb-act:active{transform:scale(.97);} .kpb-act[disabled]{opacity:.4;}',
      '.kpb-pick{display:grid;gap:8px;margin:12px 0;}',
      '.kpb-pbtn{aspect-ratio:1/1;border:none;border-radius:12px;background:rgba(255,255,255,.14);color:#fff;font-size:clamp(20px,6vw,30px);font-weight:900;cursor:pointer;font-family:inherit;}',
      '.kpb-pbtn:active{transform:scale(.94);} .kpb-pbtn[disabled]{opacity:.3;}',
      '.kpb-myteam{display:inline-block;padding:8px 16px;border-radius:999px;font-weight:900;font-size:20px;margin-bottom:10px;border:3px solid;}',
      '.kpb-rank{list-style:none;padding:0;margin:14px auto;max-width:520px;text-align:left;}',
      '.kpb-bingo{display:grid;gap:5px;margin:6px 0;}',
      '.kpb-bcell{aspect-ratio:1/1;border:2px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;',
        'font-weight:900;font-size:clamp(15px,4.2vw,22px);font-family:inherit;padding:3px;word-break:keep-all;line-height:1.15;}',
      '.kpb-bcell[disabled]{opacity:.9;} .kpb-bcell.on{background:var(--kp-mint,#2dd4bf);color:#0f172a;border-color:#fff;text-decoration:line-through;}',
      '.kpb-bcell.find{border-color:var(--kp-yellow,#ffd23f);box-shadow:0 0 0 3px rgba(255,210,63,.35);animation:kpbPulse 1s infinite;cursor:pointer;}',
      '@keyframes kpbPulse{50%{transform:scale(1.06);}}',
      '.kpb-bcell.shake{animation:kpbShake .4s;} @keyframes kpbShake{25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}',
      '.kpb-race{max-width:1100px;margin:10px auto;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));}',
      '.kpb-race-row{display:flex;align-items:center;gap:10px;font-weight:900;font-size:clamp(18px,1.8vw,24px);}',
      '.kpb-race-row.bingo .kpb-race-name{color:var(--kp-yellow,#ffd23f);}',
      '.kpb-race-name{width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.kpb-race-bar{flex:1;height:16px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;}',
      '.kpb-race-bar span{display:block;height:100%;background:linear-gradient(90deg,var(--kp-mint,#2dd4bf),var(--kp-yellow,#ffd23f));transition:width .4s;}',
      '.kpb-race-n{opacity:.85;font-size:.85em;width:110px;text-align:right;}',
      '.kpb-four .kpb-grid{max-width:700px;gap:5px;background:rgba(56,189,248,.18);padding:8px;border-radius:16px;}',
      '.kpb-four .kpb-gcell{background:rgba(0,0,0,.35);border-radius:50%;}',
      '.kpb-four.mini .kpb-grid{max-width:300px;gap:3px;padding:5px;margin:14px auto 0;}',
      '.kpb-disc{width:82%;height:82%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(22px,2.6vw,36px);box-shadow:inset 0 -4px 8px rgba(0,0,0,.25);}',
      '.kpb-disc.moved{animation:kpbDrop .5s cubic-bezier(.3,1.4,.5,1);} @keyframes kpbDrop{from{transform:translateY(-260px);}to{transform:none;}}',
      '.kpb-disc.win{outline:4px solid #fff;animation:kpbPulse .8s infinite;}',
      '.kpb-four.mini .kpb-disc{font-size:0;}',
      '.kpb-match .kpb-grid{max-width:1100px;gap:10px;} .kpb-match .kpb-gcell{aspect-ratio:1.3/1;background:transparent;}',
      '.kpb-card{width:100%;height:100%;border-radius:12px;display:flex;align-items:center;justify-content:center;text-align:center;padding:6px;',
        'font-weight:900;font-size:clamp(18px,2.2vw,30px);line-height:1.2;word-break:keep-all;}',
      '.kpb-card.back{background:linear-gradient(135deg,#4c5fd5,#7b3fe4);color:rgba(255,255,255,.75);font-size:clamp(24px,2.6vw,36px);}',
      '.kpb-card.face{background:#fff;color:#1a2540;border:4px solid transparent;animation:kpbFlip .45s ease;}',
      '.kpb-card.face.open{border-color:var(--kp-yellow,#ffd23f);} .kpb-card.face.done{opacity:.75;}',
      '@keyframes kpbFlip{from{transform:rotateY(90deg);}to{transform:none;}}',
      '.kpb-rank li{padding:12px 20px;border-radius:14px;background:rgba(255,255,255,.08);margin:8px 0;font-weight:900;font-size:clamp(24px,2.6vw,34px);display:flex;justify-content:space-between;}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── 팀 ── */
  var teams = {
    build: function (ctx, count) {
      var r = ctx.getRoster(), p = ctx.party || null, map = null, n = count || 2;
      if (p && p.isTeams && p.isTeams()) {
        map = {}; var maxT = 0;
        r.forEach(function (nm) { var t = p.teamOf(nm); if (t >= 0) { map[nm] = t; if (t > maxT) maxT = t; } });
        n = Math.max(2, Math.min(4, maxT + 1));
      }
      n = Math.max(2, Math.min(4, n));
      var out = PRESETS.slice(0, n).map(function (pr, i) { return { i: i, name: pr.name, emoji: pr.emoji, color: pr.color, members: [] }; });
      r.forEach(function (nm, k) { var t = map && (nm in map) ? map[nm] : (k % n); out[t % n].members.push(nm); });
      return out;
    },
    of: function (ts, name) { for (var i = 0; i < ts.length; i++) if (ts[i].members.indexOf(name) >= 0) return i; return -1; },
    add: function (ts, name) {                // 늦은 입장 = 가장 적은 팀 뒤
      if (teams.of(ts, name) >= 0) return teams.of(ts, name);
      var best = 0; ts.forEach(function (t, i) { if (t.members.length < ts[best].members.length) best = i; });
      ts[best].members.push(name); return best;
    },
    remove: function (ts, name) { var i = teams.of(ts, name); if (i < 0) return -1; ts[i].members.splice(ts[i].members.indexOf(name), 1); return i; },
    pub: function (ts) { return ts.map(function (t) { return { name: t.name, emoji: t.emoji, color: t.color, members: t.members.slice() }; }); },
    html: function (ts, turnIdx, extra) {
      return '<div class="kpb-teams">' + ts.map(function (t, i) {
        return '<span class="kpb-team' + (i === turnIdx ? ' turn' : '') + '" style="color:' + t.color + '">' + t.emoji + ' ' + esc(t.name) + '팀' +
          (extra ? '<small>' + extra(t, i) + '</small>' : '') + '</span>';
      }).join('') + '</div>';
    }
  };

  /* ── 랜덤(호스트 전용, BP-1) ── */
  var dice = {
    roll: function (n) { var out = []; for (var i = 0; i < (n || 1); i++) out.push(1 + Math.floor(Math.random() * 6)); return out; },
    html: function (vals) { return '<div class="kpb-dice">' + vals.map(function (v) { return '<div class="kpb-die">' + v + '</div>'; }).join('') + '</div>'; }
  };
  var YUT = [['도', 1, .15], ['개', 2, .35], ['걸', 3, .35], ['윷', 4, .10], ['모', 5, .05]];
  var yut = { throw: function () { var r = Math.random(), acc = 0; for (var i = 0; i < YUT.length; i++) { acc += YUT[i][2]; if (r < acc) return { name: YUT[i][0], steps: YUT[i][1], again: YUT[i][1] >= 4 }; } return { name: '모', steps: 5, again: true }; } };
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ── 트랙 렌더러 ── */
  var track = {
    layout: function (n, cols) {             // 0 = 출발, n = 골인. 아래→위 뱀 모양.
      cols = cols || 6; var rows = Math.ceil((n + 1) / cols), cells = [];
      for (var i = 0; i <= n; i++) {
        var r = Math.floor(i / cols), c = i % cols; if (r % 2 === 1) c = cols - 1 - c;
        cells.push({ i: i, row: rows - 1 - r, col: c });
      }
      return { cells: cells, cols: cols, rows: rows };
    },
    // opts: { ladders:{from:to}, slides:{from:to}, events:{i:emoji}, tokens:[{i, pos, emoji, color, moved}], labels }
    html: function (lay, opts) {
      opts = opts || {}; var lad = opts.ladders || {}, sl = opts.slides || {}, ev = opts.events || {}, toks = opts.tokens || [];
      var byCell = {}; toks.forEach(function (t) { (byCell[t.pos] || (byCell[t.pos] = [])).push(t); });
      var n = lay.cells.length - 1;
      return '<div class="kpb-track" style="grid-template-columns:repeat(' + lay.cols + ',1fr)">' + lay.cells.map(function (c) {
        var cls = 'kpb-cell' + (c.i === 0 ? ' start' : '') + (c.i === n ? ' goal' : '') + (lad[c.i] ? ' up' : '') + (sl[c.i] ? ' down' : '') + (ev[c.i] ? ' ev' : '');
        var mark = c.i === 0 ? '🚩' : c.i === n ? '🏁' : lad[c.i] ? '🪜' : sl[c.i] ? '🛝' : (ev[c.i] || '');
        var to = lad[c.i] ? '↑' + lad[c.i] : sl[c.i] ? '↓' + sl[c.i] : '';
        return '<div class="' + cls + '" data-i="' + c.i + '" style="grid-row:' + (c.row + 1) + ';grid-column:' + (c.col + 1) + '">' +
          '<span class="kpb-n">' + (c.i === 0 ? '출발' : c.i === n ? '골인' : c.i) + '</span>' +
          (mark ? '<span class="kpb-mark">' + mark + '</span>' : '') + (to ? '<span class="kpb-to">' + to + '</span>' : '') +
          '<div class="kpb-tokens">' + (byCell[c.i] || []).map(function (t) {
            return '<span class="kpb-token' + (t.moved ? ' moved' : '') + '" style="background:' + t.color + '" title="' + esc(t.name || '') + '">' + t.emoji + '</span>'; }).join('') + '</div>' +
        '</div>';
      }).join('') + '</div>';
    }
  };
  var grid = {
    html: function (rows, cols, cellFn) {
      var out = '<div class="kpb-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) out += '<div class="kpb-gcell" data-r="' + r + '" data-c="' + c + '">' + (cellFn ? cellFn(r, c) : '') + '</div>';
      return out + '</div>';
    }
  };

  /* ── 턴 매니저 ── */
  function turn(ts) {
    var st = { team: 0, round: 1, counters: ts.map(function () { return 0; }) };
    function alive(i) { return ts[i] && ts[i].members.length > 0; }
    return {
      get team() { return st.team; },
      get round() { return st.round; },
      runner: function (i) { var t = ts[i == null ? st.team : i]; if (!t || !t.members.length) return null; return t.members[st.counters[t.i] % t.members.length]; },
      advanceRunner: function (i) { st.counters[i == null ? st.team : i] += 1; },
      next: function () {                     // 다음 살아 있는 팀; 한 바퀴 돌면 round+1
        var n = ts.length, tries = 0;
        do { st.team = (st.team + 1) % n; if (st.team === 0) st.round += 1; tries++; } while (!alive(st.team) && tries <= n);
        return st.team;
      },
      set: function (i) { st.team = i; },
      state: function () { return { team: st.team, round: st.round }; }
    };
  }

  /* ── 등급 ── */
  function grade(correct, total) {
    if (total <= 0) return 'few';
    if (correct >= total) return 'all';
    if (correct * 2 >= total) return 'most';
    return 'few';
  }

  /* ── 문제 게이트(호스트) ──
     opts: { members:[names], question:{q,choices,answer}, timeout(ms), mode:'team'|'runner', runner, onDone(result) }
     result: { grade, correct:[names], wrong:[names], answered:{name:choice}, total } */
  var gateSeq = 0;
  function qgate(opts) {
    var members = (opts.members || []).slice(), Q = opts.question, done = false, timer = null;
    var answered = {}, seq = ++gateSeq;
    var expected = opts.mode === 'runner' ? [opts.runner].filter(Boolean) : members;
    function finish(reason) {
      if (done) return; done = true; if (timer) clearTimeout(timer);
      var correct = [], wrong = [];
      expected.forEach(function (n) { if (n in answered) (answered[n] === Q.answer ? correct : wrong).push(n); else wrong.push(n); });
      var res = { seq: seq, grade: opts.mode === 'runner' ? (correct.length ? 'all' : 'few') : grade(correct.length, expected.length),
                  correct: correct, wrong: wrong, answered: answered, total: expected.length, reason: reason, answer: Q.answer };
      if (opts.onDone) opts.onDone(res);
    }
    if (opts.timeout) timer = setTimeout(function () { finish('timeout'); }, opts.timeout);
    if (!expected.length) setTimeout(function () { finish('empty'); }, 0);
    return {
      seq: seq,
      onAnswer: function (p) {              // 게임 answer 핸들러에서 위임. 수용하면 true
        if (done || p.gate !== seq || typeof p.choice !== 'number') return false;
        if (expected.indexOf(p.name) < 0 || (p.name in answered)) return false;
        answered[p.name] = p.choice;
        if (Object.keys(answered).length >= expected.length) finish('all');
        return true;
      },
      drop: function (name) {               // 이탈자 = 기대 목록에서 제거(BP-5)
        var i = expected.indexOf(name); if (i >= 0 && !(name in answered)) expected.splice(i, 1);
        if (!done && Object.keys(answered).length >= expected.length) finish('all');
      },
      finish: function () { finish('host'); },   // 호스트 「지금 공개」 — 지금까지의 답으로 마감
      cancel: function () { done = true; if (timer) clearTimeout(timer); },
      pub: function () { return { gate: seq, q: Q.q, choices: Q.choices, to: expected.slice(), answered: Object.keys(answered), timeout: opts.timeout || 0 }; },   // KP-1: answer 없음
      isDone: function () { return done; }
    };
  }

  /* ── 폰 컨트롤러 3종 ── */
  var phone = {
    question: function (el, q, onPick, opts) {  // ① 답안 컨트롤러
      opts = opts || {}; var picked = null;
      el.innerHTML = (opts.head || '') +
        (q.timeout ? '<div class="kp-timerbar"><span style="animation-duration:' + q.timeout + 'ms"></span></div>' : '') +
        '<div class="kp-pq">' + esc(q.q) + '</div>' +
        '<div class="kp-choices">' + (q.choices || []).map(function (c, i) {
          return '<button class="kp-pbtn kp-c' + i + '" data-i="' + i + '"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</button>'; }).join('') + '</div>' +
        '<div class="kp-locked" id="kpbLock"></div>';
      [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (b) {
        b.onclick = function () {
          if (picked !== null) return; picked = +b.getAttribute('data-i');
          b.classList.add('selected');
          [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (x) { x.disabled = true; });
          var lk = el.querySelector('#kpbLock'); if (lk) lk.textContent = '✅ 제출! 팀 친구들을 기다려요';
          onPick(picked);
        };
      });
    },
    action: function (el, label, onTap, opts) {  // ③ 액션 버튼
      opts = opts || {};
      el.innerHTML = (opts.head || '') + '<button class="kpb-act" id="kpbAct">' + label + '</button>' + (opts.foot || '');
      var b = el.querySelector('#kpbAct');
      b.onclick = function () { b.disabled = true; b.textContent = opts.doneLabel || '⏳'; onTap(); };
    },
    pick: function (el, g, onPick, opts) {      // ② 선택 컨트롤러 — g:{rows,cols,label(r,c),enabled(r,c)}
      opts = opts || {}; var out = '';
      for (var r = 0; r < g.rows; r++) for (var c = 0; c < g.cols; c++) {
        var en = g.enabled ? g.enabled(r, c) : true;
        out += '<button class="kpb-pbtn" data-r="' + r + '" data-c="' + c + '"' + (en ? '' : ' disabled') + '>' + (g.label ? g.label(r, c) : '') + '</button>';
      }
      el.innerHTML = (opts.head || '') + '<div class="kpb-pick" style="grid-template-columns:repeat(' + g.cols + ',1fr)">' + out + '</div>';
      [].forEach.call(el.querySelectorAll('.kpb-pbtn'), function (b) {
        b.onclick = function () { [].forEach.call(el.querySelectorAll('.kpb-pbtn'), function (x) { x.disabled = true; }); onPick(+b.getAttribute('data-r'), +b.getAttribute('data-c')); };
      });
    },
    wait: function (el, html, sub) { el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + html + '</div>' + (sub ? '<div class="kp-dim">' + sub + '</div>' : '') + '</div>'; },
    teamBadge: function (t) { return t ? '<div class="kpb-myteam" style="color:' + t.color + ';border-color:' + t.color + '">' + t.emoji + ' 내 팀: ' + esc(t.name) + '</div>' : ''; }
  };

  /* ── 종료 ── */
  function rankHTML(rank) {
    var medal = ['🥇', '🥈', '🥉', '4️⃣'];
    return '<ul class="kpb-rank">' + rank.map(function (r, i) {
      return '<li><span style="color:' + r.color + '">' + medal[i] + ' ' + r.emoji + ' ' + esc(r.name) + '팀</span><span>' + esc(r.label || '') + '</span></li>'; }).join('') + '</ul>';
  }
  function end(ctx, rank) {
    var p = ctx.party;
    if (p && p.champion && rank.length) { try { p.champion(rank[0].emoji + ' ' + rank[0].name + '팀', rank[0].color); } catch (e) {} }
  }

  injectCSS();
  window.KpleBoard = {
    PRESETS: PRESETS, esc: esc, KEYS: KEYS,
    teams: teams, dice: dice, yut: yut, shuffle: shuffle,
    track: track, grid: grid, turn: turn, grade: grade, qgate: qgate,
    phone: phone, rankHTML: rankHTML, end: end, injectCSS: injectCSS
  };
})();
