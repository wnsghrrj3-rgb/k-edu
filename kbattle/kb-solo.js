/* ============================================================================
   K-edu 케이배틀 — 혼자 모드 플레이어 (kb-solo.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제7조 트랙 C(방 없음 · 케이플 없이 성립), 제3조(배점), KB-1(오답 응원).

   ⛔ 이 파일은 Kple 를 모른다. 실시간 채널·방·호스트 없음.
      "방이 없어도 케이배틀은 완전히 살아있어야 한다"의 코드적 증명.

   흐름: 문제 n개 순차 → 탭 응답 → 즉시 판정 → 다음 → 결과.
     - 채점·배점은 KBQ 그대로(제3조). 오답 0점·감점 없음.
     - KB-1: 오답 화면에 ❌·시무룩 없음. "다음엔 맞힐 수 있어" — 파트너는 무조건 내 편.
       (파트너 시스템 5번 완성 시 이 자리에 토닥 모션이 들어간다)

   공개 API:
     KBSolo.play(el, { questions, kind, onDone })
       onDone({ correct, hardCorrect, bestStreak, score, total })
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBSolo) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function play(el, opts) {
    var KBQ = root.KBQ;
    if (!KBQ) throw new Error('kb-questions.js 먼저 로드');
    opts = opts || {};
    var qs = (opts.questions || []).filter(function (q) { return KBQ.validate(q).length === 0; });
    if (!qs.length) { el.innerHTML = '<div class="kb-error">문제가 없어요</div>'; return null; }

    var i = -1;
    var score = 0, correct = 0, hardCorrect = 0, streak = 0, bestStreak = 0;

    function head() {
      return '<div class="kb-solo-head">' +
        '<div class="kb-solo-pos">' + (i + 1) + ' / ' + qs.length + '</div>' +
        '<div class="kb-solo-bar"><i style="width:' + ((i / qs.length) * 100) + '%"></i></div>' +
        '<div class="kb-solo-score">' + score + '점</div>' +
      '</div>';
    }

    function next() {
      i++;
      if (i >= qs.length) return done();
      el.innerHTML = head() + '<div class="kb-solo-q"></div>';
      var slot = el.querySelector('.kb-solo-q');
      var q = qs[i];
      KBQ.render(q, slot, function (a) {
        var ok = KBQ.grade(q, a.response);
        streak = ok ? streak + 1 : 0;
        bestStreak = Math.max(bestStreak, streak);
        var remain = Math.max(0, 1 - (a.elapsedMs || 0) / (q.timeLimit * 1000));
        var gained = KBQ.score({ correct: ok, difficulty: q.difficulty, remainRatio: remain, streak: streak });
        score += gained;
        if (ok) { correct++; if (q.difficulty === 3) hardCorrect++; }
        feedback(ok, gained);
      });
    }

    // KB-1: 오답에도 응원. 심판이 아니라 내 편.
    function feedback(ok, gained) {
      el.innerHTML = head() +
        '<div class="kb-my-result ' + (ok ? 'kb-good' : 'kb-soft') + '">' +
          '<div class="kb-partner-slot">' + (ok ? '🥚' : '🥚') + '</div>' +  // ← 파트너 자리(제6조)
          '<div class="kb-mark">' + (ok ? '⭕ 정답!' : '괜찮아, 다음 문제 가자') + '</div>' +
          (ok ? '<div class="kb-gained">+' + gained + '</div>' : '') +
          (streak >= 3 ? '<div class="kb-streak">🔥 ' + streak + '연속!</div>' : '') +
          '<button class="kb-btn kb-solo-next">' + (i + 1 < qs.length ? '다음 ▶' : '결과 보기 🏁') + '</button>' +
        '</div>';
      el.querySelector('.kb-solo-next').onclick = next;
    }

    function done() {
      var r = { correct: correct, hardCorrect: hardCorrect, bestStreak: bestStreak,
                score: score, total: qs.length, kind: opts.kind || 'daily' };
      el.innerHTML =
        '<div class="kb-my-result kb-final">' +
          '<div class="kb-mark">🏁 오늘 도전 끝!</div>' +
          '<div class="kb-gained">' + correct + ' / ' + qs.length + '</div>' +
          '<div class="kb-dim">' + score + '점' + (bestStreak >= 3 ? ' · 최고 ' + bestStreak + '연속' : '') + '</div>' +
        '</div>';
      if (opts.onDone) opts.onDone(r);
      return r;
    }

    next();
    return { get score() { return score; } };
  }

  root.KBSolo = { play: play };
})();
