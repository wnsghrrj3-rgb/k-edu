/* ============================================================
   K-edu Teacher · Compare Pair (두 수 크기 비교)
   ============================================================
   사용: KeduComparePair.mount(container, extraData)
   데이터 스펙:
     extra.game_kind = 'compare_pair'
     extra.rounds_total: 10        (기본 10)
     extra.range: [0, 9]           (기본 [0, 9])
     extra.visual: 'ten_frame'     ('ten_frame' | 'number', 기본 'ten_frame')
   ============================================================ */
(function() {
  'use strict';

  let state = null;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeRound(range) {
    const [lo, hi] = range;
    let a = randInt(lo, hi);
    let b = randInt(lo, hi);
    while (b === a) b = randInt(lo, hi);
    // 좌우 위치도 랜덤
    const swap = Math.random() < 0.5;
    const left = swap ? b : a;
    const right = swap ? a : b;
    const target = Math.random() < 0.5 ? 'larger' : 'smaller';
    return { left, right, target };
  }

  function renderTenFrame(n) {
    const v = Math.max(0, Math.min(10, n));
    let cells = '';
    for (let i = 0; i < 10; i++) {
      cells += `<span class="cp-tf-cell ${i < v ? 'filled' : ''}"></span>`;
    }
    return `<div class="cp-tenframe">${cells}</div>`;
  }

  function renderCardFace(n, visual) {
    if (visual === 'number') {
      return `<div class="cp-number">${n}</div>`;
    }
    // 기본: 십 배열판 + 숫자 보조
    return `<div class="cp-card-stack">
      ${renderTenFrame(n)}
      <div class="cp-num-label">${n}</div>
    </div>`;
  }

  function targetLabel(target) {
    return target === 'larger' ? '더 큰 수' : '더 작은 수';
  }

  function getCorrectSide(round) {
    if (round.target === 'larger') {
      return round.left > round.right ? 'left' : 'right';
    }
    return round.left < round.right ? 'left' : 'right';
  }

  function mount(container, extra) {
    if (!container) return;
    const range = Array.isArray(extra && extra.range) ? extra.range : [0, 9];
    const total = (extra && extra.rounds_total) || 10;
    const visual = (extra && extra.visual) || 'ten_frame';

    state = {
      container,
      range,
      total,
      visual,
      hint: (extra && extra.hint) || '지시에 맞게 카드를 골라 보세요.',
      current: 0,
      correct: 0,
      round: makeRound(range),
      phase: 'question',  // 'question' | 'feedback' | 'done'
      pickedSide: null,
      wasCorrect: false
    };

    render();
  }

  function render() {
    if (!state) return;

    if (state.phase === 'done') {
      renderDone();
      return;
    }

    const r = state.round;
    const correctSide = getCorrectSide(r);

    const leftCls = ['cp-card'];
    const rightCls = ['cp-card'];
    if (state.phase === 'feedback') {
      // 정답·오답 표시
      if (correctSide === 'left') leftCls.push('correct');
      else rightCls.push('correct');
      if (state.pickedSide && state.pickedSide !== correctSide) {
        (state.pickedSide === 'left' ? leftCls : rightCls).push('wrong');
      }
    }

    const expression = `<div class="cp-expression">
      <div class="cp-line">${r.left}은 ${r.right}보다 <strong>${r.left > r.right ? '크다' : '작다'}</strong></div>
      <div class="cp-line cp-line-sub">${r.right}은 ${r.left}보다 <strong>${r.right > r.left ? '크다' : '작다'}</strong></div>
    </div>`;

    state.container.innerHTML = `
      <div class="cp-wrap">
        <div class="cp-hud">
          <div class="cp-stat">문제 <strong>${state.current + 1}</strong> / ${state.total}</div>
          <div class="cp-stat cp-stat-sub">맞은 개수 <strong>${state.correct}</strong></div>
        </div>
        <div class="cp-prompt">
          ${targetLabel(r.target)}<span class="cp-prompt-tail">를 골라요</span>
        </div>
        <div class="cp-board">
          <button class="${leftCls.join(' ')}" data-side="left" ${state.phase !== 'question' ? 'disabled' : ''}>
            ${renderCardFace(r.left, state.visual)}
          </button>
          <div class="cp-vs">vs</div>
          <button class="${rightCls.join(' ')}" data-side="right" ${state.phase !== 'question' ? 'disabled' : ''}>
            ${renderCardFace(r.right, state.visual)}
          </button>
        </div>
        ${state.phase === 'feedback' ? `
          <div class="cp-feedback ${state.wasCorrect ? 'ok' : 'ng'}">
            <div class="cp-fb-head">${state.wasCorrect ? '✓ 잘했어요!' : '✗ 다시 봐요'}</div>
            ${expression}
            <button class="cp-next" id="cp-next" type="button">
              ${state.current + 1 >= state.total ? '결과 보기 →' : '다음 문제 →'}
            </button>
          </div>
        ` : `<div class="cp-hint">${state.hint}</div>`}
      </div>
    `;

    if (state.phase === 'question') {
      state.container.querySelectorAll('.cp-card').forEach(btn => {
        btn.addEventListener('click', () => handlePick(btn.dataset.side));
      });
    } else if (state.phase === 'feedback') {
      const nextBtn = state.container.querySelector('#cp-next');
      if (nextBtn) nextBtn.addEventListener('click', nextRound);
    }
  }

  function renderDone() {
    const pct = Math.round((state.correct / state.total) * 100);
    let msg;
    if (pct === 100) msg = '🎉 모두 맞췄어요! 완벽!';
    else if (pct >= 80) msg = '🌟 정말 잘했어요!';
    else if (pct >= 60) msg = '👍 잘했어요! 한 번 더 해 봐요.';
    else msg = '💪 다시 해 보면 더 잘할 수 있어요!';

    state.container.innerHTML = `
      <div class="cp-wrap">
        <div class="cp-done">
          <div class="cp-done-msg">${msg}</div>
          <div class="cp-done-score">${state.correct} / ${state.total} 맞춤</div>
          <button class="cp-reset" id="cp-reset" type="button">↻ 다시 하기</button>
        </div>
      </div>
    `;
    const resetBtn = state.container.querySelector('#cp-reset');
    if (resetBtn) resetBtn.addEventListener('click', reset);
  }

  function handlePick(side) {
    if (!state || state.phase !== 'question') return;
    const correctSide = getCorrectSide(state.round);
    state.pickedSide = side;
    state.wasCorrect = side === correctSide;
    if (state.wasCorrect) state.correct += 1;
    state.phase = 'feedback';
    render();
  }

  function nextRound() {
    if (!state) return;
    state.current += 1;
    if (state.current >= state.total) {
      state.phase = 'done';
      render();
      return;
    }
    state.round = makeRound(state.range);
    state.phase = 'question';
    state.pickedSide = null;
    state.wasCorrect = false;
    render();
  }

  function reset() {
    if (!state) return;
    state.current = 0;
    state.correct = 0;
    state.round = makeRound(state.range);
    state.phase = 'question';
    state.pickedSide = null;
    state.wasCorrect = false;
    render();
  }

  function unmount() {
    state = null;
  }

  window.KeduComparePair = { mount, unmount };
})();
