/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #2 「퍼즐 완성」 (kb-mode-puzzle.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 6종 중 **협동**·학년칸 저 / "협동 모드가 절반"),
             제3조(감점 없음), 제5조·KB-2(타인 노출 금지), KB-1(오답에 벌 없음).

   ⭐ 이 모드가 존재하는 이유 (헌법 제4조의 문장 그대로):
      **"경쟁만 있으면 하위권이 게임 자체를 싫어하게 된다."**
      레이스는 개인전이다. 잘하는 아이가 앞서고 못하는 아이는 뒤에 남는다 —
      그게 재미인 아이도 있지만, 그게 상처인 아이도 있다.
      퍼즐은 **줄을 세우지 않는다.** 반 전체의 정답이 한 그림을 함께 걷어낸다.
      느린 아이의 1정답과 빠른 아이의 1정답이 **똑같이 조각 하나**다.

   규칙:
     - 반 전체 정답 1개 = 조각이 걷힌다(진행률 비례). 전자칠판이 주인공.
     - 오답·미응답 = **아무 일도 일어나지 않는다.** 조각이 다시 덮이지 않는다(뒤로 없음).
     - 목표(target) = 첫 응답 시점 인원 × 문제 수 × 60%. 지각 입장이 목표를 늘리지 않는다(보너스).
     - 다 걷으면 → 완성. 참가자 전원 **협동 보너스 XP**(제5조 coopCleared).

   🎨 구현 결정 (2026-07-13):
     헌법 표기는 "그림 조각"이나, 지금 조각 아래 깔리는 것은 **숨은 문구**다
     (교사가 방 만들 때 입력 · 기본 "우리 반 최고!").
     이유 ① 원화 없이도 지금 교실에서 쓸 수 있다 ② 교사가 그날 문장을 정하는 재미
     ("내일 소풍!" "급식 돈까스!") ③ 이미지 0장 = 저속·저사양(제0조).
     원화가 붙는 날 `.kb-pz-under` 레이어에 배경만 깔면 그대로 그림 퍼즐이 된다 — 구조는 이미 그 자리.
     (헌법 개정 아님. `order` 탭-어펜딩과 같은 성격의 구현 순서 결정.)

   ⛔ 불변 계약: 코어(kb-battle.js)는 이 모드를 몰라도 돈다. 훅은 전부 optional.
      CSS 는 이 파일이 <style> 1회 주입(파티 레이어 패턴 — 코어 css 불변).
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.puzzle) return;

  var COLS = 5, ROWS = 4;              // 조각 20개
  var TILES = COLS * ROWS;
  var NEED_RATIO = 0.6;               // 반이 60% 맞히면 완성 (전원 만점을 요구하지 않는다)
  var DEFAULT_TEXT = '우리 반 최고!';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-puzzle-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-puzzle-style';
    s.textContent = [
      '.kb-pz{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-pz-head{display:flex;align-items:center;justify-content:space-between;',
      '  font-weight:900;font-size:20px;margin-bottom:12px}',
      '.kb-pz-head .kb-pz-n{color:#ffd23f}',
      '.kb-pz-board{position:relative;border-radius:14px;overflow:hidden;',
      '  aspect-ratio:5/2.4;min-height:180px;background:linear-gradient(135deg,#2dd4bf22,#38bdf822)}',
      '.kb-pz-under{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
      '  text-align:center;padding:12px}',            /* ← 원화가 오면 여기에 배경만 깔면 그림 퍼즐 */
      '.kb-pz-word{font-weight:900;font-size:clamp(28px,5vw,62px);line-height:1.25;',
      '  color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.35)}',
      '.kb-pz-grid{position:absolute;inset:0;display:grid;',
      '  grid-template-columns:repeat(' + COLS + ',1fr);grid-template-rows:repeat(' + ROWS + ',1fr)}',
      '.kb-pz-tile{background:#1f2147;border:1px solid rgba(255,255,255,.12);',
      '  transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1)}',
      '.kb-pz-tile.gone{opacity:0;transform:scale(.4) rotate(8deg);pointer-events:none}',
      '.kb-pz-done{margin-top:12px;font-weight:900;font-size:26px;color:#2dd4bf;text-align:center}',
      /* 참가자 폰 — 우리 반 진행 + 내 기여만 (KB-2: 남의 점수·등수 없음) */
      '.kb-pz-bar{margin:0 0 14px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06)}',
      '.kb-pz-bar-t{display:flex;justify-content:space-between;font-weight:900;font-size:14px;margin-bottom:7px}',
      '.kb-pz-bar-track{height:10px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}',
      '.kb-pz-bar-fill{display:block;height:100%;background:#2dd4bf;',
      '  transition:width .5s cubic-bezier(.22,1,.36,1)}',
      '.kb-pz-mine{margin-top:7px;font-weight:800;font-size:13px;color:rgba(255,255,255,.6)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function puzzle(ctx) {
    injectStyle();
    var getRoster = ctx.getRoster;
    var qCount = (ctx.questions || []).length || 1;
    var word = ((ctx.config && ctx.config.puzzleText) || DEFAULT_TEXT).toString().slice(0, 40);

    var correct = 0;        // 반 전체 누적 정답 수 (절대 안 줄어든다)
    var mine = {};          // { name: 내가 연 조각에 기여한 정답 수 }  ← 순위 아님, 기여
    var target = 0;         // 첫 응답 때 확정
    var boardEl = null, tiles = [], builtWord = null;

    // 목표는 한 번만 굳는다. 지각 입장이 목표를 늘리면 앞서 푼 아이들의 조각이
    // 상대적으로 줄어드는 셈 → 뒤로 미는 연출 금지(제3조 정신)와 같은 축.
    function ensureTarget() {
      if (target) return target;
      var n = Math.max(1, getRoster().length);
      target = Math.max(1, Math.round(n * qCount * NEED_RATIO));
      return target;
    }

    function opened() {
      var t = ensureTarget();
      return Math.min(TILES, Math.floor(correct / t * TILES));
    }
    function cleared() { return correct >= ensureTarget(); }

    function onAnswer(e) {
      ensureTarget();
      if (!e.correct) return;                 // 오답 = 아무 일도 없음 (조각 안 덮임 — KB-1)
      correct++;
      mine[e.name] = (mine[e.name] || 0) + 1;
    }

    function publicState() {
      return { id: 'puzzle', tiles: TILES, opened: opened(), correct: correct,
               target: ensureTarget(), cleared: cleared(), mine: mine, word: cleared() ? word : null };
      // ⛔ word 는 완성 전엔 참가자에게 안 보낸다 — 폰에서 미리 보면 전자칠판의 마법이 죽는다.
    }

    /* ---- 전자칠판 (주인공) ---- */
    function hostLayer(el) {
      if (builtWord !== word) { build(el); builtWord = word; }
      var n = opened();
      var head = el.querySelector('.kb-pz-n');
      if (head) head.textContent = n + ' / ' + TILES;
      tiles.forEach(function (t, i) {
        if (i < n) t.classList.add('gone'); else t.classList.remove('gone');
      });
      var done = el.querySelector('.kb-pz-done');
      if (done) done.textContent = cleared() ? '🎉 우리 반이 다 걷었어요!' : '';
    }

    function build(el) {
      el.className = 'kb-pz';
      el.innerHTML =
        '<div class="kb-pz-head"><span>🧩 우리 반이 함께 걷어요</span>' +
          '<span class="kb-pz-n">0 / ' + TILES + '</span></div>' +
        '<div class="kb-pz-board">' +
          '<div class="kb-pz-under"><div class="kb-pz-word">' + esc(word) + '</div></div>' +
          '<div class="kb-pz-grid"></div>' +
        '</div>' +
        '<div class="kb-pz-done"></div>';
      var grid = el.querySelector('.kb-pz-grid');
      tiles = [];
      // 조각이 걷히는 순서는 섞는다 — 왼쪽부터 벗겨지면 글자가 순서대로 읽혀 재미가 죽는다.
      var order = [];
      for (var i = 0; i < TILES; i++) order.push(i);
      for (var j = order.length - 1; j > 0; j--) {          // 결정적 셔플(방마다 같아도 무방)
        var k = (j * 7 + 3) % (j + 1);
        var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
      }
      var slots = [];
      for (var m = 0; m < TILES; m++) {
        var d = document.createElement('div');
        d.className = 'kb-pz-tile';
        grid.appendChild(d);
        slots.push(d);
      }
      tiles = order.map(function (idx) { return slots[idx]; });   // 걷히는 순서 = order
    }

    /* ---- 참가자 폰: 우리 반 진행 + 내 기여 (KB-2) ---- */
    function playerLayer(el, my) {
      var st = my && my.state;
      if (!st || st.id !== 'puzzle') return;
      var mineN = (st.mine && st.mine[my.name]) || 0;
      var pct = Math.round(st.opened / st.tiles * 100);
      el.className = 'kb-pz-bar';
      el.innerHTML =
        '<div class="kb-pz-bar-t"><span>🧩 우리 반</span><span>' + st.opened + ' / ' + st.tiles + '</span></div>' +
        '<div class="kb-pz-bar-track"><i class="kb-pz-bar-fill" style="width:' + pct + '%"></i></div>' +
        '<div class="kb-pz-mine">' +
          (st.cleared ? '🎉 우리 반이 다 걷었어요!' :
            (mineN ? '내가 연 조각 ' + mineN + '개' : '한 문제만 맞혀도 조각이 걷혀요')) +
        '</div>';
      // ⛔ 여기에 누가 몇 개 열었는지 목록은 절대 안 그린다 (KB-2 · 협동의 정신)
    }

    return {
      onAnswer: onAnswer,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get correct() { return correct; }, get target() { return ensureTarget(); },
               get opened() { return opened(); }, get cleared() { return cleared(); } }
    };
  }

  KBModes.puzzle = puzzle;
})();
