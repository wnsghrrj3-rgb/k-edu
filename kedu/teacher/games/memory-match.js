/* ============================================================
   K-edu Teacher · Memory Match (보편 컴포넌트)
   ============================================================
   사용: KeduMemoryMatch.mount(container, extraData)
   데이터 스펙:
     extra.game_kind = 'memory_match'
     extra.pairs = [{ a: <Face>, b: <Face> }, ...]
     Face = { text?: string } | { emoji: string, count: number }
   ============================================================ */
(function() {
  'use strict';

  let state = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderFace(face) {
    if (!face) return '';
    if (face.text !== undefined) {
      return `<span class="mm-face mm-face-text">${face.text}</span>`;
    }
    if (face.emoji && face.count) {
      const items = Array(face.count).fill(face.emoji)
        .map(em => `<span class="mm-emoji">${em}</span>`).join('');
      return `<span class="mm-face mm-face-emojis mm-count-${face.count}">${items}</span>`;
    }
    if (typeof face.ten_frame === 'number') {
      const n = Math.max(0, Math.min(10, face.ten_frame));
      let cells = '';
      for (let i = 0; i < 10; i++) {
        cells += `<span class="mm-tf-cell ${i < n ? 'filled' : ''}"></span>`;
      }
      return `<span class="mm-face mm-face-tenframe">${cells}</span>`;
    }
    return '';
  }

  function gridColumns(total) {
    if (total <= 4) return 2;
    if (total <= 6) return 3;
    if (total <= 9) return 3;
    if (total <= 12) return 4;
    return 4;
  }

  function mount(container, extra) {
    if (!container) return;
    if (!extra || !Array.isArray(extra.pairs) || extra.pairs.length === 0) {
      container.innerHTML = `<div class="mm-empty">게임 데이터가 비어 있습니다.</div>`;
      return;
    }

    const cards = [];
    extra.pairs.forEach((p, i) => {
      cards.push({ pairId: i, face: p.a, side: 'a' });
      cards.push({ pairId: i, face: p.b, side: 'b' });
    });

    state = {
      container,
      title: extra.title || '',
      hint: extra.hint || '같은 짝을 찾아 카드를 뒤집어 보세요.',
      cards: shuffle(cards),
      flipped: [],
      matched: new Set(),
      moves: 0,
      isAnimating: false
    };

    render();
  }

  function render() {
    if (!state) return;
    const total = state.cards.length;
    const totalPairs = total / 2;
    const matchedCount = state.matched.size;
    const isDone = matchedCount === totalPairs;
    const cols = gridColumns(total);

    const cardsHtml = state.cards.map((c, idx) => {
      const isFlipped = state.flipped.includes(idx);
      const isMatched = state.matched.has(c.pairId);
      const cls = ['mm-card'];
      if (isFlipped || isMatched) cls.push('flipped');
      if (isMatched) cls.push('matched');
      return `<button class="${cls.join(' ')}" data-idx="${idx}" ${isMatched ? 'disabled' : ''} aria-label="카드 ${idx + 1}">
        <span class="mm-card-inner">
          <span class="mm-card-back">?</span>
          <span class="mm-card-front">${renderFace(c.face)}</span>
        </span>
      </button>`;
    }).join('');

    state.container.innerHTML = `
      <div class="mm-wrap">
        <div class="mm-hud">
          <div class="mm-stats">
            <span class="mm-stat">맞춘 짝 <strong>${matchedCount}</strong> / ${totalPairs}</span>
            <span class="mm-stat mm-stat-sub">시도 <strong>${state.moves}</strong>회</span>
          </div>
          <button class="mm-reset" id="mm-reset" type="button">↻ 다시 섞기</button>
        </div>
        ${isDone ? `<div class="mm-done">🎉 모두 맞췄어요! ${state.moves}번 만에 끝!</div>` : `<div class="mm-hint">${state.hint}</div>`}
        <div class="mm-board" style="--mm-cols: ${cols};">${cardsHtml}</div>
      </div>
    `;

    state.container.querySelectorAll('.mm-card').forEach(btn => {
      btn.addEventListener('click', () => handleCardClick(parseInt(btn.dataset.idx, 10)));
    });
    const resetBtn = state.container.querySelector('#mm-reset');
    if (resetBtn) resetBtn.addEventListener('click', reset);
  }

  function handleCardClick(idx) {
    if (!state || state.isAnimating) return;
    if (Number.isNaN(idx)) return;
    const card = state.cards[idx];
    if (!card) return;
    if (state.matched.has(card.pairId)) return;
    if (state.flipped.includes(idx)) return;
    if (state.flipped.length >= 2) return;

    state.flipped.push(idx);

    if (state.flipped.length === 2) {
      state.moves += 1;
      const [aIdx, bIdx] = state.flipped;
      const a = state.cards[aIdx];
      const b = state.cards[bIdx];

      if (a.pairId === b.pairId && a.side !== b.side) {
        state.matched.add(a.pairId);
        state.flipped = [];
        render();
      } else {
        state.isAnimating = true;
        render();
        setTimeout(() => {
          if (!state) return;
          state.flipped = [];
          state.isAnimating = false;
          render();
        }, 900);
      }
    } else {
      render();
    }
  }

  function reset() {
    if (!state) return;
    state.cards = shuffle(state.cards);
    state.flipped = [];
    state.matched = new Set();
    state.moves = 0;
    state.isAnimating = false;
    render();
  }

  function unmount() {
    state = null;
  }

  window.KeduMemoryMatch = { mount, unmount };
})();
