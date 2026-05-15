/* =====================================================
 * <kedu-compare-picker> v1.0
 *
 * 용도:
 *   두 수(또는 N개 수) 크기 비교 카드 선택. 학생 라이브
 *   .compare-row·.compare-card 시각 100% 호환.
 *
 * 사용:
 *   <kedu-compare-picker
 *     prompt="두 수 중 더 작은 수를 골라요"
 *     items='[{"num":0,"visual":"없음"},{"num":1,"visual":"🍎"}]'
 *     correct="0">
 *   </kedu-compare-picker>
 *
 *   <!-- 다중 정답 (예: "0개"에 해당하는 자리를 모두) -->
 *   <kedu-compare-picker
 *     prompt="'0개'에 해당하는 자리를 모두 골라요"
 *     items='[{"num":0,"visual":"없음"},{"num":2,"visual":"🍎🍎"}]'
 *     correct="0,1" mode="multi">
 *   </kedu-compare-picker>
 *
 * attributes:
 *   prompt   : 질문 문구 (생략 가능, 외부에서 prompt 직접 출력하는 경우)
 *   items    : JSON 배열 — 각 항목 {num: 숫자, visual: 이모지·텍스트}
 *              또는 단축형 attrs `nums="0,1"` + `visuals="없음,🍎"`
 *   correct  : 정답 인덱스 (0-based, 콤마 구분 가능 "0" 또는 "0,2")
 *   mode     : single | multi (default single)
 *   visual-empty-label : "없음" 등 0개 자리 라벨 (default "없음")
 *
 * events (bubbles: true):
 *   kedu-compare-picker-select  detail: {index, num, isCorrect}
 *   kedu-compare-picker-correct detail: {selected}  — 정답 도달 (multi 모드는 모두 선택 시)
 *   kedu-compare-picker-wrong   detail: {index, num} — 오답 선택 시
 *
 * methods:
 *   reset() — 모든 카드 상태 초기화
 *
 * CSS 변수:
 *   --kedu-cp-border        #1565C0
 *   --kedu-cp-num-color     #1976D2
 *   --kedu-cp-hover-bg      #E3F2FD
 *   --kedu-cp-correct-bg    #C8E6C9
 *   --kedu-cp-correct-bd    #2E7D32
 *   --kedu-cp-wrong-bg      #FFCDD2
 *   --kedu-cp-wrong-bd      #C62828
 *   --kedu-cp-empty-color   #B0BEC5
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-compare-picker-style';
  const CSS = `
    kedu-compare-picker {
      display: block;
      box-sizing: border-box;
      --kedu-cp-border:      var(--kedu-cp-border-override,      #1565C0);
      --kedu-cp-num-color:   var(--kedu-cp-num-color-override,   #1976D2);
      --kedu-cp-hover-bg:    var(--kedu-cp-hover-bg-override,    #E3F2FD);
      --kedu-cp-correct-bg:  var(--kedu-cp-correct-bg-override,  #C8E6C9);
      --kedu-cp-correct-bd:  var(--kedu-cp-correct-bd-override,  #2E7D32);
      --kedu-cp-wrong-bg:    var(--kedu-cp-wrong-bg-override,    #FFCDD2);
      --kedu-cp-wrong-bd:    var(--kedu-cp-wrong-bd-override,    #C62828);
      --kedu-cp-empty-color: var(--kedu-cp-empty-color-override, #B0BEC5);
    }
    kedu-compare-picker[hidden] { display: none; }

    kedu-compare-picker .kedu-cp-prompt {
      font-size: clamp(16px, 2.6vw, 22px);
      color: #333;
      text-align: center;
      margin-bottom: clamp(12px, 2.4vw, 20px);
    }
    kedu-compare-picker .kedu-cp-row {
      display: flex;
      gap: clamp(14px, 2.8vw, 24px);
      justify-content: center;
      flex-wrap: wrap;
      align-items: stretch;
    }
    kedu-compare-picker .kedu-cp-card {
      background: white;
      border: clamp(3px, 0.5vw, 4px) solid var(--kedu-cp-border);
      border-radius: clamp(16px, 3vw, 24px);
      padding: clamp(18px, 3.2vw, 28px) clamp(24px, 4.4vw, 38px);
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(8px, 1.6vw, 14px);
      min-width: clamp(140px, 22vw, 200px);
      font-family: inherit;
    }
    kedu-compare-picker .kedu-cp-card:hover {
      background: var(--kedu-cp-hover-bg);
      transform: translateY(-3px);
    }
    kedu-compare-picker .kedu-cp-num {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: clamp(60px, 10vw, 110px);
      color: var(--kedu-cp-num-color);
      line-height: 1;
    }
    kedu-compare-picker .kedu-cp-visual {
      font-size: clamp(28px, 4.6vw, 44px);
      min-height: clamp(50px, 8vw, 70px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    kedu-compare-picker .kedu-cp-visual.kedu-cp-empty {
      color: var(--kedu-cp-empty-color);
      font-family: 'Jua', sans-serif;
      font-size: clamp(14px, 2.2vw, 18px);
    }
    kedu-compare-picker .kedu-cp-card.kedu-cp-correct {
      background: var(--kedu-cp-correct-bg);
      border-color: var(--kedu-cp-correct-bd);
    }
    kedu-compare-picker .kedu-cp-card.kedu-cp-correct .kedu-cp-num {
      color: var(--kedu-cp-correct-bd);
    }
    kedu-compare-picker .kedu-cp-card.kedu-cp-wrong {
      background: var(--kedu-cp-wrong-bg);
      border-color: var(--kedu-cp-wrong-bd);
      animation: kedu-cp-shake 0.4s ease;
    }
    kedu-compare-picker .kedu-cp-card.kedu-cp-disabled {
      opacity: 0.4;
      pointer-events: none;
    }

    @keyframes kedu-cp-shake {
      0%, 100% { transform: translateX(0); }
      25%      { transform: translateX(-8px); }
      75%      { transform: translateX(8px); }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  class KeduComparePicker extends HTMLElement {
    static get observedAttributes() {
      return ['prompt', 'items', 'nums', 'visuals', 'correct', 'mode', 'visual-empty-label'];
    }

    constructor() {
      super();
      this._mounted = false;
      this._selectedSet = new Set();
      this._handleClick = this._handleClick.bind(this);
    }

    connectedCallback() {
      injectStyle();
      this._mounted = true;
      this._render();
    }

    attributeChangedCallback() {
      if (!this._mounted) return;
      this._selectedSet.clear();
      this._render();
    }

    // ── property API ───────────────────────────────
    get prompt() { return this.getAttribute('prompt') || ''; }
    set prompt(v) { this.setAttribute('prompt', v); }

    get items() {
      const j = this.getAttribute('items');
      if (j) {
        try {
          const parsed = JSON.parse(j);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) { /* fall through */ }
      }
      const nums = (this.getAttribute('nums') || '').split(',').map(s => s.trim()).filter(Boolean);
      const visuals = (this.getAttribute('visuals') || '').split(',').map(s => s.trim());
      return nums.map((n, i) => ({ num: Number(n), visual: visuals[i] || '' }));
    }

    get correct() {
      const c = this.getAttribute('correct');
      if (c == null) return [];
      return c.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n));
    }

    get mode() { return this.getAttribute('mode') || 'single'; }

    get emptyLabel() { return this.getAttribute('visual-empty-label') || '없음'; }

    // ── public methods ─────────────────────────────
    reset() {
      this._selectedSet.clear();
      this._render();
    }

    // ── 내부 ───────────────────────────────────────
    _render() {
      this.innerHTML = '';
      const promptText = this.prompt;
      if (promptText) {
        const p = document.createElement('div');
        p.className = 'kedu-cp-prompt';
        p.textContent = promptText;
        this.appendChild(p);
      }
      const row = document.createElement('div');
      row.className = 'kedu-cp-row';
      const items = this.items;
      items.forEach((item, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'kedu-cp-card';
        card.dataset.index = String(idx);
        card.dataset.num = String(item.num);
        const numEl = document.createElement('div');
        numEl.className = 'kedu-cp-num';
        numEl.textContent = String(item.num);
        const visEl = document.createElement('div');
        visEl.className = 'kedu-cp-visual';
        const visText = item.visual ?? '';
        if (visText === '' || visText === '0' || visText === 0) {
          visEl.classList.add('kedu-cp-empty');
          visEl.textContent = this.emptyLabel;
        } else {
          visEl.textContent = visText;
        }
        card.appendChild(numEl);
        card.appendChild(visEl);
        row.appendChild(card);
      });
      this.appendChild(row);
      row.addEventListener('click', this._handleClick);
    }

    _handleClick(e) {
      const card = e.target.closest('.kedu-cp-card');
      if (!card) return;
      if (card.classList.contains('kedu-cp-disabled')) return;
      if (card.classList.contains('kedu-cp-correct')) return;
      const idx = Number(card.dataset.index);
      const num = Number(card.dataset.num);
      const correctList = this.correct;
      const isCorrect = correctList.includes(idx);
      this.dispatchEvent(new CustomEvent('kedu-compare-picker-select', {
        bubbles: true,
        detail: { index: idx, num, isCorrect }
      }));
      if (!isCorrect) {
        card.classList.add('kedu-cp-wrong');
        setTimeout(() => card.classList.remove('kedu-cp-wrong'), 600);
        this.dispatchEvent(new CustomEvent('kedu-compare-picker-wrong', {
          bubbles: true,
          detail: { index: idx, num }
        }));
        return;
      }
      card.classList.add('kedu-cp-correct');
      this._selectedSet.add(idx);
      if (this.mode === 'single') {
        const all = this.querySelectorAll('.kedu-cp-card');
        all.forEach(c => {
          if (!c.classList.contains('kedu-cp-correct')) c.classList.add('kedu-cp-disabled');
        });
        this.dispatchEvent(new CustomEvent('kedu-compare-picker-correct', {
          bubbles: true,
          detail: { selected: [idx] }
        }));
      } else {
        const allCorrect = correctList.every(i => this._selectedSet.has(i));
        if (allCorrect) {
          const all = this.querySelectorAll('.kedu-cp-card');
          all.forEach(c => {
            if (!c.classList.contains('kedu-cp-correct')) c.classList.add('kedu-cp-disabled');
          });
          this.dispatchEvent(new CustomEvent('kedu-compare-picker-correct', {
            bubbles: true,
            detail: { selected: Array.from(this._selectedSet).sort((a, b) => a - b) }
          }));
        }
      }
    }
  }

  if (!customElements.get('kedu-compare-picker')) {
    customElements.define('kedu-compare-picker', KeduComparePicker);
  }
})();
