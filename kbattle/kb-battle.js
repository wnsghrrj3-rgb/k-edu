/* ============================================================================
   K-edu 케이배틀(KBattle) — 대결 코어 민짜 (kbattle)
   ----------------------------------------------------------------------------
   헌법 근거: 제7조(트랙 A 방 생명주기)·제3조(배점)·제5조(노출 규칙).
   케이플 게임 모듈로 등록 — 케이플 코어·기존 게임·css 불변(승계 원칙).

   흐름(모드 연출 없이 민짜):
     lobby → question → reveal → (반복) → end

   함정 준수:
     KP-1  출제 state에 answer 안 실림 — pubQ()가 정답 필드를 벗겨서 전파.
           채점·배점·스트릭은 전부 호스트 단독(KP-4와 동일 축).
     KB-2  참가자 화면 = 본인 것만(내 점수·내 정오·내 스트릭). 타인 점수·등수 없음.
           호스트 화면도 응답 수 + 결과에서 1등 한 명만 가볍게(불변 원칙 5).

   시간·배점:
     참가자가 elapsedMs(로컬 delta)를 실어 보냄 → 호스트가
     remainRatio = 1 - elapsed/timeLimit 로 환산 후 KBQ.score() 호출.
     스트릭은 호스트가 이름별 누적(정답 +1, 오답 리셋), 3/5/7 도달 보너스.

   지각 입장(제7조 엣지 ②): 호스트가 join 이벤트마다 현재 state resync —
     늦게 온 아이는 현재 문제부터 합류, 이전 점수만 없음.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[kbattle] kple-core.js 먼저 로드'); return; }
  if (!window.KBQ) { console.error('[kbattle] kb-questions.js 먼저 로드'); return; }

  var KBQ = window.KBQ;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // KP-1: 참가자에게 보내도 되는 필드만 추림 (answer 절대 미포함)
  function pubQ(q) {
    return { id: q.id, type: q.type, difficulty: q.difficulty,
             prompt: q.prompt, payload: q.payload, timeLimit: q.timeLimit };
  }

  /* ---------------- 호스트(전자칠판) ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length)
      ? ctx.config.questions.filter(function (q) { return KBQ.validate(q).length === 0; })
      : KBQ.SAMPLE;

    var phase = 'lobby';
    var qi = -1;
    var answered = {};   // { name: { correct, gained } }  (현재 문제)
    var scores = {};     // { name: 누적 점수 }
    var streaks = {};    // { name: 연속 정답 수 }

    // 모드 플러그인 (헌법 제4조) — 없으면 민짜 그대로. 훅은 전부 optional.
    var modeFactory = ctx.config.mode && window.KBModes && window.KBModes[ctx.config.mode];
    var mode = modeFactory ? modeFactory({
      getRoster: ctx.getRoster, questions: questions, roomCode: ctx.roomCode
    }) : null;
    var modeEl = null;   // 노드 재사용(재생성 금지) → 모드의 CSS transition 유지

    function modeState() { return (mode && mode.publicState) ? mode.publicState() : undefined; }

    function curQ() { return questions[qi]; }

    function render() {
      var el = ctx.el; if (!el) return;
      var roster = ctx.getRoster();
      var head =
        '<div class="kb-host-bar">' +
          '<span class="kb-code">' + esc(ctx.roomCode) + '</span>' +
          '<span class="kb-qpos">' + (qi >= 0 ? (qi + 1) + ' / ' + questions.length : '') + '</span>' +
        '</div>';

      if (phase === 'lobby') {
        el.innerHTML = head +
          '<div class="kb-stage">' +
            '<div class="kb-big">참가자 ' + roster.length + '명</div>' +
            '<div class="kb-roster">' + roster.map(function (n) {
              return '<span class="kb-chip">' + esc(n) + '</span>'; }).join('') + '</div>' +
            '<button class="kb-btn" id="kbStart"' + (roster.length ? '' : ' disabled') + '>시작 ▶</button>' +
          '</div>';
        var b = el.querySelector('#kbStart'); if (b) b.onclick = next;

      } else if (phase === 'question') {
        el.innerHTML = head +
          '<div class="kb-stage">' +
            '<div class="kb-host-q">' + esc(curQ().prompt.text) + '</div>' +
            '<div class="kb-resp-count">응답 ' + Object.keys(answered).length + ' / ' + roster.length + '</div>' +
            '<button class="kb-btn" id="kbReveal">공개 ▶</button>' +
          '</div>';
        var r = el.querySelector('#kbReveal'); if (r) r.onclick = reveal;

      } else if (phase === 'reveal') {
        el.innerHTML = head +
          '<div class="kb-stage">' +
            '<div class="kb-host-q">' + esc(curQ().prompt.text) + '</div>' +
            '<div class="kb-resp-count">정답 ' + Object.keys(answered).filter(function (n) {
              return answered[n].correct; }).length + '명</div>' +
            '<button class="kb-btn" id="kbNext">' + (qi + 1 < questions.length ? '다음 문제 ▶' : '결과 보기 🏁') + '</button>' +
          '</div>';
        var nx = el.querySelector('#kbNext'); if (nx) nx.onclick = next;

      } else { // end — 1등 한 명만 가볍게 (불변 원칙 5)
        var top = null;
        Object.keys(scores).forEach(function (n) { if (!top || scores[n] > scores[top]) top = n; });
        el.innerHTML = head +
          '<div class="kb-stage">' +
            '<div class="kb-big">🏁 끝!</div>' +
            (top ? '<div class="kb-top1">⭐ ' + esc(top) + '</div>' : '') +
          '</div>';
      }
      mountMode(el);
    }

    // 모드 연출 자리 = 스테이지 맨 위. innerHTML 재작성 뒤에도 같은 노드를 다시 꽂아
    // 내부 DOM(말 등)의 정체성을 지킨다 → 전진 애니메이션이 살아남는다.
    function mountMode(el) {
      if (!mode || phase === 'lobby') return;
      var stage = el.querySelector('.kb-stage');
      if (!stage) return;
      if (!modeEl) modeEl = document.createElement('div');
      stage.insertBefore(modeEl, stage.firstChild);
      if (mode.hostLayer) mode.hostLayer(modeEl);
    }

    function next() {
      qi++;
      if (qi >= questions.length) { end(); return; }
      phase = 'question';
      answered = {};
      ctx.sendState({ phase: 'question', qi: qi, q: pubQ(curQ()), mode: modeState() }); // KP-1
      render();
    }

    function reveal() {
      if (phase !== 'question') return;
      phase = 'reveal';
      // 미응답자 스트릭 리셋(오답 취급, 점수 0 — 감점 없음)
      ctx.getRoster().forEach(function (n) { if (!answered[n]) streaks[n] = 0; });
      if (mode && mode.onReveal) mode.onReveal({ qi: qi, results: answered }); // 칸 확정 → 다음 부스트 산정
      ctx.sendState({
        phase: 'reveal', qi: qi,
        answer: curQ().answer,           // 공개 시점에만 실림 (KP-1 충족)
        results: answered,               // 참가자는 본인 것만 표시 (KB-2)
        mode: modeState()
      });
      render();
    }

    function end() {
      phase = 'end';
      ctx.sendState({ phase: 'end', totals: scores, mode: modeState() }); // 참가자는 본인 것만 표시
      render();
    }

    function resync() {
      if (phase === 'lobby') ctx.sendState({ phase: 'lobby' });
      else if (phase === 'question') ctx.sendState({ phase: 'question', qi: qi, q: pubQ(curQ()), mode: modeState() });
      else if (phase === 'reveal') ctx.sendState({ phase: 'reveal', qi: qi, answer: curQ().answer, results: answered, mode: modeState() });
      else ctx.sendState({ phase: 'end', totals: scores, mode: modeState() });
    }

    ctx.on('join', function () { resync(); render(); }); // 지각 입장 = 현재부터 합류
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase !== 'question' || p.qi !== qi) return;   // 늦은/엉뚱한 응답 무시
      if (answered[p.name]) return;                      // 1문제 1응답 (호스트 측 방어)
      var q = curQ();
      var correct = KBQ.grade(q, p.response);
      var streak = correct ? (streaks[p.name] = (streaks[p.name] || 0) + 1) : (streaks[p.name] = 0);
      var remain = Math.max(0, 1 - (p.elapsedMs || 0) / (q.timeLimit * 1000));
      var gained = KBQ.score({ correct: correct, difficulty: q.difficulty, remainRatio: remain, streak: streak });
      // 모드 배수(레이스 아이템 칸 = 2배). 배점 공식(제3조)은 KBQ 그대로 두고 곱만 얹는다.
      var mult = (mode && mode.pointMultiplier) ? (mode.pointMultiplier(p.name) || 1) : 1;
      gained = Math.round(gained * mult);
      scores[p.name] = (scores[p.name] || 0) + gained;
      answered[p.name] = { correct: correct, gained: gained, streak: streak, mult: (mult > 1 ? mult : undefined) };
      // 모드는 "정답 이벤트 스트림"만 구독한다 (헌법 제4조) — 채점·배점 권위는 코어 단독
      if (mode && mode.onAnswer) mode.onAnswer({ name: p.name, correct: correct, gained: gained, streak: streak, qi: qi });
      render();
    });

    render();
    ctx._test = { get phase() { return phase; }, get scores() { return scores; },
                  get streaks() { return streaks; }, get mode() { return mode; } };
  }

  /* ---------------- 참가자(학생 폰) ---------------- */
  function joinView(ctx) {
    var el = ctx.el;
    var myTotal = 0;
    var lastQi = -1;

    function waitScreen(msg) {
      if (el) el.innerHTML = '<div class="kb-wait">' + esc(msg) + '</div>';
    }

    // 모드 바 = 본인 칸·부스트만 (KB-2: 타인 위치·점수 폰에 안 그림)
    function modeBar(ms) {
      if (!el || !ms || !ms.id) return;
      var def = window.KBModes && window.KBModes[ms.id];
      var inst = def && def({ getRoster: function () { return []; }, questions: [] });
      if (!inst || !inst.playerLayer) return;
      var bar = document.createElement('div');
      el.insertBefore(bar, el.firstChild);
      inst.playerLayer(bar, {
        pos: (ms.pos && ms.pos[ctx.name]) || 0,
        total: ms.total,
        boost: !!(ms.boost && ms.boost[ctx.name])
      });
    }

    ctx.on('state', function (s) {
      if (s.phase === 'lobby') { waitScreen('곧 시작해요!'); return; }

      if (s.phase === 'question') {
        if (s.qi === lastQi) return;      // resync 중복 마운트 방지
        lastQi = s.qi;
        if (!el) return;
        el.innerHTML = '';
        var slot = document.createElement('div');
        el.appendChild(slot);
        KBQ.render(s.q, slot, function (a) {
          ctx.answer({ qi: s.qi, response: a.response, elapsedMs: a.elapsedMs });
          waitScreen('제출 완료! 친구들을 기다려요');
        });
        modeBar(s.mode);

      } else if (s.phase === 'reveal') {
        var mine = s.results && s.results[ctx.name];   // 본인 것만 (KB-2)
        if (mine) {
          myTotal += 0; // 누적은 gained 반영 아래에서
          if (el) el.innerHTML =
            '<div class="kb-my-result ' + (mine.correct ? 'kb-good' : 'kb-soft') + '">' +
              '<div class="kb-mark">' + (mine.correct ? '⭕ 정답!' : '조금 아쉬워요') + '</div>' +
              (mine.correct ? '<div class="kb-gained">+' + mine.gained +
                 (mine.mult > 1 ? ' <span class="kb-x2">⭐×' + mine.mult + '</span>' : '') + '</div>' : '') +
              (mine.streak >= 3 ? '<div class="kb-streak">🔥 ' + mine.streak + '연속!</div>' : '') +
            '</div>';
        } else {
          waitScreen('다음 문제를 기다려요');
        }
        modeBar(s.mode);   // 내 칸 + 다음 문제 부스트 예고

      } else if (s.phase === 'end') {
        var total = (s.totals && s.totals[ctx.name]) || 0;   // 본인 것만
        if (el) el.innerHTML =
          '<div class="kb-my-result kb-final">' +
            '<div class="kb-mark">🏁 수고했어요!</div>' +
            '<div class="kb-gained">내 점수 ' + total + '</div>' +
          '</div>';
      }
    });

    waitScreen('입장했어요!');
  }

  window.Kple.register('kbattle', { host: hostView, join: joinView });
})();
