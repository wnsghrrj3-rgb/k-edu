/* ============================================================================
   케이랩 도구 모듈 — 파닉스 블록 (phonics_blocks) v1  [영어 1호]
   영어 v3 Lv1 파닉스의 심장 — "낱소리를 손으로 끌어 붙이면 단어 소리가 된다".
   호출 차시: Lv1 #4·6·7·11·12·14·16 (블렌딩 파닉스 전부).

   모드 4종 = 펼침 단계와 1:1 매핑 (v3/lv1/04_aCVC.md):
     ▸ build  — 합치기(4-2 심장): 소리 블록을 슬롯에 붙임 → 다 차면 블렌딩
                (느리게→빠르게→단어). 블록을 떼면 다시 낱소리로 분리(가역).
     ▸ swap   — 첫소리 교체(4-3 연습 / 4-B 보조): 끝소리 고정, 첫소리만 끼움.
                "듣고 만들기" 출제 포함 — 게이트① 판정 재료.
     ▸ read   — 스스로 읽기(4-4 응용): 처음 보는 단어 표시 → 아이가 소리 내
                읽음 → [정답 듣기]로 TTS 자기 확인 → 읽었어요 체크.
     ▸ listen — 듣고 고르기(4-5 숙달): 소리 듣고 맞는 단어 고르기. 점수 누적.

   - 의존: window.KLab + window.KTTS (k-tts.js — 영어 v3 소리 엔진)
   - 조작: 드래그(포인터)와 탭(블록 탭→첫 빈 칸 장착) 둘 다 지원 — 저학년·모바일.
   - 색 관례: 모음 블록 주황 / 자음 블록 파랑 (파닉스 표준 색 구분).
   - config:
       { mode:'build'|'swap'|'read'|'listen',
         words:['cat','mat','sat'],          // build·read·listen 단어 목록
         ending:'at', onsets:['c','m','s'],  // swap 전용 (끝소리 고정·첫소리 후보)
         quiz:true }                          // swap·listen 출제 여부 (기본 true)
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  var VOWELS = { a: 1, e: 1, i: 1, o: 1, u: 1 };
  var DIGRAPHS = ['sh', 'ch', 'th'];

  /* 단어 → 소리조각 분해 (이중자음 우선 매칭) */
  function split(word) {
    var out = [], i = 0, w = word.toLowerCase();
    while (i < w.length) {
      var two = w.slice(i, i + 2);
      if (DIGRAPHS.indexOf(two) >= 0) { out.push(two); i += 2; }
      else { out.push(w[i]); i += 1; }
    }
    return out;
  }
  function isVowel(p) { return !!VOWELS[p]; }

  /* 공통 스타일 */
  var C = { vow: '#FF8A3D', con: '#1565C0', slot: '#E9ECF5', ink: '#2B3149', ok: '#12B886' };
  function blockCss(p, size) {
    var col = isVowel(p) ? C.vow : C.con;
    return 'display:flex;align-items:center;justify-content:center;'
      + 'width:' + size + 'px;height:' + size + 'px;border-radius:18px;'
      + 'background:' + col + ';color:#fff;font-weight:800;font-family:inherit;'
      + 'font-size:' + Math.round(size * 0.46) + 'px;cursor:pointer;user-select:none;'
      + 'box-shadow:0 4px 0 rgba(0,0,0,.18);touch-action:none;transition:transform .08s;';
  }

  window.KLab.register('phonics_blocks', function (el, config) {
    config = config || {};
    var mode = config.mode || 'build';
    var TTS = window.KTTS;
    var unlocked = false;
    function tts() {
      if (!TTS) return null;
      if (!unlocked) { TTS.unlock(); unlocked = true; }
      return TTS;
    }

    el.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'kl-stage-host';
    root.style.cssText = 'position:relative;padding:8px 4px;font-family:inherit;color:' + C.ink + ';';
    el.appendChild(root);

    if (!TTS) {
      root.innerHTML = '<div style="padding:24px;text-align:center;color:#c0392b;font-weight:800;">'
        + '소리 엔진(KTTS)이 로드되지 않았어요 — english/v3/engine/k-tts.js 필요</div>';
      return;
    }

    /* ── 모드별 화면 ─────────────────────────────────────────── */
    var screens = { build: buildMode, swap: swapMode, read: readMode, listen: listenMode };
    (screens[mode] || buildMode)();

    /* ============================================================
       build — 합치기 (심장). 블록 트레이 → 슬롯. 가역.
       ============================================================ */
    function buildMode() {
      var words = config.words || ['cat', 'mat', 'sat'];
      var wi = 0;

      function render() {
        var pieces = split(words[wi]);
        var size = pieces.length >= 4 ? 86 : 104;
        var placed = pieces.map(function () { return false; });
        var order = pieces.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; });

        root.innerHTML =
          '<div style="text-align:center;font-size:21px;font-weight:800;margin-bottom:10px;">'
            + '🧩 소리 블록을 칸에 붙여 봐요! <span style="color:#7048E8;">(' + (wi + 1) + '/' + words.length + ')</span></div>'
          + '<div class="pb-slots" style="display:flex;gap:12px;justify-content:center;margin-bottom:18px;">'
            + pieces.map(function (p, i) {
                return '<div class="pb-slot" data-i="' + i + '" style="' + blockCss(p, size)
                  + 'background:' + C.slot + ';color:#B8C0D8;box-shadow:inset 0 3px 8px rgba(0,0,0,.08);border:3px dashed #C5CCE0;">?</div>';
              }).join('')
          + '</div>'
          + '<div class="pb-tray" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;min-height:' + (size + 8) + 'px;">'
            + order.map(function (i) {
                return '<div class="pb-block" data-i="' + i + '" style="' + blockCss(pieces[i], size) + '">' + pieces[i] + '</div>';
              }).join('')
          + '</div>'
          + '<div style="text-align:center;margin-top:14px;">'
            + '<button class="pb-again" style="display:none;font-size:22px;padding:11px 22px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;font-weight:800;cursor:pointer;font-family:inherit;">🔊 다시 듣기</button> '
            + '<button class="pb-next" style="display:none;font-size:22px;padding:11px 22px;border-radius:14px;border:0;background:' + C.ok + ';color:#fff;font-weight:800;cursor:pointer;font-family:inherit;">다음 단어 →</button>'
          + '</div>';

        var slots = root.querySelectorAll('.pb-slot');
        var blocks = root.querySelectorAll('.pb-block');

        function put(bEl) {
          var i = +bEl.dataset.i;
          var s = slots[i];
          if (placed[i]) return;
          placed[i] = true;
          s.textContent = pieces[i];
          s.style.cssText = blockCss(pieces[i], size);
          s.classList.add('pb-filled');
          bEl.style.visibility = 'hidden';
          tts().sound(pieces[i]);
          if (placed.every(Boolean)) setTimeout(playBlend, 420);
        }
        /* 가역 — 슬롯 탭하면 다시 분리 */
        function takeOut(sEl) {
          var i = +sEl.dataset.i;
          if (!placed[i]) return;
          placed[i] = false;
          sEl.textContent = '?';
          sEl.style.cssText = blockCss(pieces[i], size)
            + 'background:' + C.slot + ';color:#B8C0D8;box-shadow:inset 0 3px 8px rgba(0,0,0,.08);border:3px dashed #C5CCE0;';
          root.querySelector('.pb-block[data-i="' + i + '"]').style.visibility = 'visible';
          tts().sound(pieces[i]);
          root.querySelector('.pb-again').style.display = 'none';
          root.querySelector('.pb-next').style.display = 'none';
        }
        function playBlend() {
          var keys = pieces.slice();
          tts().blend(keys, {
            word: words[wi],
            onPiece: function (i) {
              slots.forEach(function (s, j) { s.style.transform = j === i ? 'scale(1.18)' : 'scale(1)'; });
            },
            onWord: function () {
              slots.forEach(function (s) { s.style.transform = 'scale(1.08)'; s.style.boxShadow = '0 0 0 5px ' + C.ok; });
              setTimeout(function () { slots.forEach(function (s) { s.style.transform = ''; s.style.boxShadow = ''; }); }, 900);
            }
          }).then(function () {
            root.querySelector('.pb-again').style.display = 'inline-block';
            root.querySelector('.pb-next').style.display = wi < words.length - 1 ? 'inline-block' : 'none';
            if (wi === words.length - 1) window.KLab.ui.toast(root, true, '🏆 블록 합치기 완성!');
          });
        }

        /* 탭 장착 + 간단 드래그 (포인터) */
        blocks.forEach(function (b) {
          var drag = null;
          b.addEventListener('pointerdown', function (e) {
            drag = { x: e.clientX, y: e.clientY, moved: false };
            b.setPointerCapture(e.pointerId);
            tts().sound(split(words[wi])[+b.dataset.i], { interrupt: true });
          });
          b.addEventListener('pointermove', function (e) {
            if (!drag) return;
            var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
            b.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
            b.style.zIndex = 20;
          });
          b.addEventListener('pointerup', function (e) {
            if (!drag) return;
            b.style.transform = ''; b.style.zIndex = '';
            if (drag.moved) {
              var t = document.elementFromPoint(e.clientX, e.clientY);
              var slot = t && t.closest ? t.closest('.pb-slot') : null;
              /* 제 자리 슬롯에만 장착 — 아니면 트레이로 복귀 */
              if (slot && +slot.dataset.i === +b.dataset.i && !placed[+b.dataset.i]) put(b);
            } else {
              put(b); /* 탭 = 제 칸에 자동 장착 */
            }
            drag = null;
          });
        });
        slots.forEach(function (s) { s.addEventListener('click', function () { takeOut(s); }); });
        root.querySelector('.pb-again').addEventListener('click', playBlend);
        root.querySelector('.pb-next').addEventListener('click', function () { wi++; render(); });
      }
      render();
    }

    /* ============================================================
       swap — 첫소리 교체 (연습·보조). 끝소리 고정.
       quiz=true면 "듣고 만들기" 출제 + 정오 판정.
       ============================================================ */
    function swapMode() {
      var ending = config.ending || 'at';
      var onsets = config.onsets || ['c', 'm', 's'];
      var quiz = config.quiz !== false;
      var qi = 0, score = 0, order = onsets.slice().sort(function () { return Math.random() - .5; });
      var endPieces = split(ending);
      var size = 96;

      function render() {
        var target = quiz ? order[qi % order.length] : null;
        root.innerHTML =
          (quiz ? window.KLab.ui.quizBar('🔊 듣고 첫소리 블록을 끼워 봐요!', score, order.length)
                : '<div style="text-align:center;font-size:21px;font-weight:800;margin-bottom:10px;">첫소리를 바꿔 끼우면 새 단어!</div>')
          + '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:18px;align-items:center;">'
            + '<div class="pb-onset-slot" style="' + blockCss('b', size) + 'background:' + C.slot + ';color:#B8C0D8;border:3px dashed #C5CCE0;box-shadow:none;">?</div>'
            + endPieces.map(function (p) { return '<div style="' + blockCss(p, size) + 'opacity:.95;cursor:default;">' + p + '</div>'; }).join('')
          + '</div>'
          + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
            + onsets.map(function (o) { return '<div class="pb-onset" data-o="' + o + '" style="' + blockCss(o, size) + '">' + o + '</div>'; }).join('')
          + '</div>'
          + (quiz ? '<div style="text-align:center;margin-top:12px;"><button class="pb-hear" style="font-size:22px;padding:11px 22px;border-radius:14px;border:3px solid #1565C0;background:#fff;color:#1565C0;font-weight:800;cursor:pointer;font-family:inherit;">🔊 문제 다시 듣기</button></div>' : '');

        function ask() { if (quiz) tts().word(target + ending); }
        if (quiz) setTimeout(ask, 350);
        var hear = root.querySelector('.pb-hear');
        if (hear) hear.addEventListener('click', ask);

        root.querySelectorAll('.pb-onset').forEach(function (b) {
          b.addEventListener('click', function () {
            var o = b.dataset.o;
            var slot = root.querySelector('.pb-onset-slot');
            slot.textContent = o;
            slot.style.cssText = blockCss(o, size);
            tts().blend(split(o + ending), { word: o + ending }).then(function () {
              if (!quiz) return;
              var ok = (o === target);
              window.KLab.ui.toast(root, ok);
              if (ok) {
                score++; qi++;
                setTimeout(function () {
                  if (qi >= order.length) {
                    root.innerHTML = window.KLab.ui.doneBar()
                      + '<div style="text-align:center;font-size:22px;font-weight:800;">_' + ending + ' 첫소리 바꾸기 끝! (' + score + '/' + order.length + ')</div>';
                  } else render();
                }, 900);
              }
            });
          });
        });
      }
      render();
    }

    /* ============================================================
       read — 스스로 읽기 (응용). 자기 확인 = TTS 대조.
       ============================================================ */
    function readMode() {
      var words = config.words || ['bat', 'tap', 'rag', 'nap'];
      var wi = 0, done = [];
      function render() {
        var w = words[wi];
        root.innerHTML =
          '<div style="text-align:center;font-size:21px;font-weight:800;margin-bottom:8px;">'
            + '📖 처음 보는 단어! 소리 내어 읽어 봐요 <span style="color:#7048E8;">(' + (wi + 1) + '/' + words.length + ')</span></div>'
          + '<div style="display:flex;gap:10px;justify-content:center;margin:16px 0 20px;">'
            + split(w).map(function (p) { return '<div style="' + blockCss(p, 104) + 'cursor:default;">' + p + '</div>'; }).join('')
          + '</div>'
          + '<div style="text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
            + '<button class="pb-check" style="font-size:23px;padding:12px 24px;border-radius:14px;border:3px solid #1565C0;background:#fff;color:#1565C0;font-weight:800;cursor:pointer;font-family:inherit;">🔊 정답 듣고 맞춰보기</button>'
            + '<button class="pb-ok" style="font-size:23px;padding:12px 24px;border-radius:14px;border:0;background:' + C.ok + ';color:#fff;font-weight:800;cursor:pointer;font-family:inherit;">읽었어요! ✓</button>'
          + '</div>'
          + '<div style="text-align:center;margin-top:10px;font-size:16px;color:#7a849e;">먼저 스스로 읽고 → 정답을 들어 확인해요</div>';
        root.querySelector('.pb-check').addEventListener('click', function () { tts().word(w, { natural: true }); });
        root.querySelector('.pb-ok').addEventListener('click', function () {
          done.push(w); wi++;
          if (wi >= words.length) {
            root.innerHTML = window.KLab.ui.doneBar()
              + '<div style="text-align:center;font-size:22px;font-weight:800;">처음 보는 단어 ' + done.length + '개를 스스로 읽었어요! 📚</div>';
          } else render();
        });
      }
      render();
    }

    /* ============================================================
       listen — 듣고 고르기 (숙달·게이트②). 점수 누적.
       ============================================================ */
    function listenMode() {
      var words = (config.words || ['cat', 'mat', 'sat', 'man', 'nap']).slice();
      var order = words.slice().sort(function () { return Math.random() - .5; });
      var qi = 0, score = 0;
      function render() {
        var target = order[qi];
        var choices = words.slice().sort(function () { return Math.random() - .5; }).slice(0, Math.min(4, words.length));
        if (choices.indexOf(target) < 0) choices[Math.floor(Math.random() * choices.length)] = target;
        root.innerHTML =
          window.KLab.ui.quizBar('🔊 듣고 맞는 단어를 골라요!', score, order.length)
          + '<div style="text-align:center;margin-bottom:14px;">'
            + '<button class="pb-hear" style="font-size:24px;padding:13px 26px;border-radius:16px;border:3px solid #1565C0;background:#fff;color:#1565C0;font-weight:800;cursor:pointer;font-family:inherit;">🔊 듣기</button></div>'
          + window.KLab.ui.choices(choices.map(function (c) { return { v: c, label: c }; }));
        function ask() { tts().word(target); }
        setTimeout(ask, 300);
        root.querySelector('.pb-hear').addEventListener('click', ask);
        root.querySelectorAll('.kl-choice').forEach(function (b) {
          b.addEventListener('click', function () {
            var ok = b.dataset.v === target;
            window.KLab.ui.toast(root, ok);
            if (ok) {
              score++; qi++;
              setTimeout(function () {
                if (qi >= order.length) {
                  root.innerHTML = window.KLab.ui.doneBar()
                    + '<div style="text-align:center;font-size:22px;font-weight:800;">⭐ ' + score + ' / ' + order.length + ' — 듣고 고르기 끝!</div>';
                } else render();
              }, 900);
            }
          });
        });
      }
      render();
    }

    /* cleanup — 슬라이드 이동 시 소리 정지 */
    return function () { if (TTS) TTS.stop(); };
  });
})();
