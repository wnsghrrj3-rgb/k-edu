/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #1 「레이스」 (kb-mode-race.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 = 정답 이벤트 스트림을 구독해 연출만 바꾸는 플러그인),
             제3조(감점 없음), 제5조·KB-2(게임 중 타인 노출 최소).

   레이스(개인전 · 학년칸 저·중):
     - 정답 1개 = 1칸 전진. 오답·미응답 = 제자리 (뒤로 밀지 않는다 — 감점 금지 정신).
     - 아이템 칸(⭐, 3칸마다): 말이 그 칸에 서 있으면 **다음 문제 점수 2배**.
       · 정답으로 칸을 떠나면 자동 소진. 못 풀어서 머물면 2배 기회가 유지된다
         (의도된 하위권 통로 — 헌법 제3조 스트릭과 같은 축).
     - 결승(마지막 칸) 도달해도 판은 안 끝난다. 문제는 끝까지 간다
         (먼저 끝낸 아이가 나머지를 기다리게 만드는 구조 = 소외. 제4조 "탈락자도 할 일" 정신).

   ⛔ 불변 계약 (kb-battle.js 는 이 모드를 몰라도 돈다):
     - 코어가 부르는 훅만 노출. 전부 optional — 하나도 없어도 코어는 민짜로 굴러간다.
         pointMultiplier(name) → 배점 배수 (채점 직전, 아이템 칸 판정)
         onAnswer({name, correct, gained, streak, qi})   정답 스트림 구독
         onReveal({qi, results})                          칸 도착 확정 → 다음 문제 부스트 산정
         publicState()  → 참가자에게 실어보낼 모드 상태
         hostLayer(el)  → 전자칠판 트랙 (노드 재사용 → CSS transition 유지)
         playerLayer(el, my) → 참가자 폰의 얇은 바 (본인 칸·부스트만, KB-2)
     - CSS 는 이 파일이 <style> 1회 주입 (kple.css·kbattle 코어 css 불변 — 파티 레이어 패턴).

   말(馬) = 파트너 자리:
     지금은 색 원 + 닉네임. 파트너 시스템(헌법 제6조, 양산 5번) 완성 시
     profile.partner 를 그대로 이 자리에 꽂으면 "레이스에선 파트너가 말"이 성립한다.
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.race) return;

  var LANE_COLORS = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b', '#cc5de8',
                     '#ff922b', '#22b8cf', '#f06595', '#94d82d', '#845ef7'];
  var ITEM_EVERY = 3;   // 3칸마다 ⭐

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-race-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-race-style';
    s.textContent = [
      '.kb-race{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-race-lane{position:relative;height:44px;margin:6px 0;border-radius:22px;',
      '  background:rgba(255,255,255,.05);overflow:hidden}',
      '.kb-race-cells{position:absolute;inset:0;display:flex}',
      '.kb-race-cell{flex:1;border-right:1px dashed rgba(255,255,255,.10);',
      '  display:flex;align-items:center;justify-content:center;font-size:14px;opacity:.55}',
      '.kb-race-cell:last-child{border-right:0}',
      '.kb-race-goal{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:20px;opacity:.8}',
      '.kb-race-horse{position:absolute;top:50%;left:0;transform:translate(0,-50%);',
      '  transition:left .55s cubic-bezier(.22,1,.36,1);display:flex;align-items:center;gap:8px;',
      '  padding-left:6px;white-space:nowrap}',
      '.kb-race-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;',
      '  justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.28)}',
      '.kb-race-name{font-size:14px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}',
      '.kb-race-horse.kb-boost .kb-race-dot{box-shadow:0 0 0 3px rgba(255,212,59,.85),0 0 16px rgba(255,212,59,.7)}',
      '.kb-race-horse.kb-done .kb-race-name:after{content:" 🏁"}',
      // 참가자 폰 바 (본인 것만)
      '.kb-race-bar{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:8px 12px;',
      '  border-radius:12px;background:rgba(255,255,255,.07);font-size:14px;color:#fff}',
      '.kb-race-bar .kb-race-mypos{font-weight:800}',
      '.kb-race-bar .kb-race-boost{margin-left:auto;font-weight:800;color:#ffd43b}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---------------- 모드 팩토리 ----------------
     opts = { getRoster(), questions, roomCode }  (코어가 넘김) */
  function race(opts) {
    injectStyle();

    var questions = (opts && opts.questions) || [];
    var getRoster = (opts && opts.getRoster) || function () { return []; };
    var total = Math.max(1, questions.length);     // 결승 = 전 문제 정답
    var items = [];                                // 아이템 칸 (결승 칸 제외)
    for (var c = ITEM_EVERY; c < total; c += ITEM_EVERY) items.push(c);

    var pos = {};      // name → 현재 칸 (0 = 출발선)
    var boost = {};    // name → true (이번 문제 2배)
    var laneEls = {};  // name → { lane, horse }
    var builtKey = ''; // roster 지문 (지각 입장 시 레인 추가)

    function ensure(n) { if (pos[n] == null) pos[n] = 0; }

    /* ---- 코어 훅 ---- */
    function pointMultiplier(name) { return boost[name] ? 2 : 1; }

    function onAnswer(e) {
      ensure(e.name);
      if (e.correct) pos[e.name] = Math.min(total, pos[e.name] + 1);
      // 오답·미응답 = 제자리 (뒤로 없음)
    }

    function onReveal() {
      // 이번 문제로 확정된 칸 기준으로 다음 문제 부스트 재산정 (= 자동 소진)
      boost = {};
      getRoster().forEach(function (n) {
        ensure(n);
        if (items.indexOf(pos[n]) >= 0) boost[n] = true;
      });
    }

    function publicState() {
      return { id: 'race', total: total, items: items, pos: pos, boost: boost };
    }

    /* ---- 전자칠판 트랙 ---- */
    function hostLayer(el) {
      var roster = getRoster();
      roster.forEach(ensure);
      var key = roster.join('|');
      if (key !== builtKey) { build(el, roster); builtKey = key; }
      roster.forEach(function (n) {
        var L = laneEls[n]; if (!L) return;
        var ratio = pos[n] / total;                                  // 0~1
        L.horse.style.left = 'calc(' + (ratio * 100) + '% - ' + (ratio * 96) + 'px)';
        L.horse.className = 'kb-race-horse' +
          (boost[n] ? ' kb-boost' : '') + (pos[n] >= total ? ' kb-done' : '');
      });
    }

    function build(el, roster) {
      el.className = 'kb-race';
      el.innerHTML = '';
      laneEls = {};
      roster.forEach(function (n, i) {
        var lane = document.createElement('div');
        lane.className = 'kb-race-lane';

        var cells = document.createElement('div');
        cells.className = 'kb-race-cells';
        for (var c = 1; c <= total; c++) {
          var cell = document.createElement('div');
          cell.className = 'kb-race-cell';
          cell.textContent = (items.indexOf(c) >= 0) ? '⭐' : '';
          cells.appendChild(cell);
        }
        lane.appendChild(cells);

        var goal = document.createElement('div');
        goal.className = 'kb-race-goal';
        goal.textContent = '🏁';
        lane.appendChild(goal);

        var horse = document.createElement('div');
        horse.className = 'kb-race-horse';
        var dot = document.createElement('div');
        dot.className = 'kb-race-dot';
        dot.style.background = LANE_COLORS[i % LANE_COLORS.length];
        dot.textContent = '●';                       // ← 파트너 자리 (제6조)
        var name = document.createElement('div');
        name.className = 'kb-race-name';
        name.textContent = n;                        // 닉네임만 (KB-2)
        horse.appendChild(dot); horse.appendChild(name);
        lane.appendChild(horse);

        laneEls[n] = { lane: lane, horse: horse };
        el.appendChild(lane);
      });
    }

    /* ---- 참가자 폰 (본인 것만 · KB-2) ---- */
    function playerLayer(el, my) {
      if (!my) { el.innerHTML = ''; return; }
      el.className = 'kb-race-bar';
      el.innerHTML =
        '<span class="kb-race-mypos">🏇 ' + esc(my.pos) + ' / ' + esc(my.total) + '칸</span>' +
        (my.pos >= my.total ? '<span>🏁 결승!</span>' : '') +
        (my.boost ? '<span class="kb-race-boost">⭐ 이번 문제 2배!</span>' : '');
    }

    return {
      id: 'race',
      pointMultiplier: pointMultiplier,
      onAnswer: onAnswer,
      onReveal: onReveal,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get pos() { return pos; }, get boost() { return boost; }, get items() { return items; } }
    };
  }

  KBModes.race = race;
})();
