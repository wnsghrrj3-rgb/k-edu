/* =====================================================
 * <kedu-count-input> v1.0
 *
 * 용도:
 *   수 카드 줄의 빈칸을 숫자 패드로 채우는 인터랙티브 부품.
 *   빈칸 선택(active) → 패드 클릭 → 채움(filled). 학생 라이브
 *   .cm-slot / .cm-pad 시각 호환 + 케이티처 엔진 동일 출력.
 *
 * 사용:
 *   단일 빈칸 (cells의 빈칸 1개, 정답 answer):
 *     <kedu-count-input cells="1,?,3" answers="2"
 *       prompt="빠진 수는?"></kedu-count-input>
 *
 *   다중 빈칸 (cells의 ? 순서대로 answers 매핑):
 *     <kedu-count-input cells="1,?,3,?,5,6,?,8,?"
 *       answers="2,4,7,9"></kedu-count-input>
 *
 *   허용 범위/값 (빈칸 1개 + 여러 정답 허용):
 *     <kedu-count-input cells="?" accept-range="3,6"></kedu-count-input>
 *     <kedu-count-input cells="?" accept-values="2,4,6"></kedu-count-input>
 *
 * attributes:
 *   cells        : 카드 줄. 쉼표 구분. "?" = 빈칸, 그 외 = 고정 표시 수.
 *   answers      : 빈칸 정답. 쉼표 구분. cells의 ? 등장 순서와 1:1.
 *   accept-range : "a,b" — 빈칸 1개에 한해 a~b 모두 정답 허용 (answers 대체)
 *   accept-values: "a,b,c" — 빈칸 1개에 한해 나열된 값 모두 정답 허용
 *   prompt       : 상단 안내 문구 (선택)
 *   pad-min      : 패드 최소 수 (default 1)
 *   pad-max      : 패드 최대 수 (default 9)
 *
 * events (bubbles: true):
 *   kedu-count-input-fill      detail: {blankIndex, value}            — 한 칸 채움
 *   kedu-count-input-wrong     detail: {blankIndex, value, expected}  — 오답 입력
 *   kedu-count-input-complete  detail: {values}                       — 모든 빈칸 정답 1회
 *
 * methods:
 *   reset() — 모든 빈칸 비우고 첫 빈칸 활성
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-ci-border  #1565C0
 *   --kedu-ci-color   #1976D2
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-count-input-style';
  const CSS = `
    kedu-count-input {
      display: block;
      box-sizing: border-box;
      --kedu-ci-border: var(--kedu-ci-border-override, #1565C0);
      --kedu-ci-color:  var(--kedu-ci-color-override,  #1976D2);
    }
    kedu-count-input[hidden] { display: none; }

    kedu-count-input .kedu-ci-stage {
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(10px, 2vw, 16px); width: 100%;
    }
    kedu-count-input .kedu-ci-prompt {
      font-size: clamp(14px, 2.1vw, 19px); color: #37474F; font-weight: 700; text-align: center;
    }
    kedu-count-input .kedu-ci-row {
      display: flex; gap: clamp(4px, 0.8vw, 8px); justify-content: center;
      flex-wrap: nowrap; padding: clamp(8px, 1.6vw, 14px);
      background: #F0F7FF; border-radius: clamp(12px, 2.2vw, 18px);
      overflow-x: auto; max-width: 100%;
    }
    kedu-count-input .kedu-ci-slot {
      background: white;
      border: clamp(2px, 0.4vw, 3px) solid var(--kedu-ci-border);
      border-radius: clamp(10px, 2vw, 16px);
      padding: clamp(8px, 1.6vw, 14px) clamp(6px, 1.2vw, 10px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(22px, 3.6vw, 32px); color: var(--kedu-ci-color);
      min-width: clamp(46px, 7.5vw, 64px); min-height: clamp(60px, 9.5vw, 80px);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    kedu-count-input .kedu-ci-slot.kedu-ci-blank {
      background: #FFF8E1; border-style: dashed; color: #F57C00; cursor: pointer; transition: all 0.2s;
    }
    kedu-count-input .kedu-ci-slot.kedu-ci-blank:hover { background: #FFE0B2; }
    kedu-count-input .kedu-ci-slot.kedu-ci-active {
      background: #FFE0B2; border-style: solid; border-color: #F57C00;
      box-shadow: 0 0 0 4px rgba(245,124,0,0.3);
    }
    kedu-count-input .kedu-ci-slot.kedu-ci-filled {
      background: #C8E6C9; border-style: solid; border-color: #2E7D32; color: #2E7D32;
    }
    kedu-count-input .kedu-ci-slot.kedu-ci-shake { animation: kedu-ci-shake 0.4s ease; background: #FFCDD2; border-color: #C62828; }

    kedu-count-input .kedu-ci-pad {
      display: grid; gap: clamp(4px, 0.8vw, 7px);
      max-width: clamp(360px, 60vw, 540px); margin-top: clamp(2px, 0.6vw, 6px);
    }
    kedu-count-input .kedu-ci-pad-btn {
      background: white; border: clamp(2px, 0.4vw, 3px) solid var(--kedu-ci-border);
      border-radius: clamp(10px, 2vw, 16px); padding: clamp(8px, 1.6vw, 14px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(18px, 2.8vw, 26px); color: var(--kedu-ci-color);
      cursor: pointer; transition: all 0.15s;
    }
    kedu-count-input .kedu-ci-pad-btn:hover { background: #E3F2FD; }
    kedu-count-input .kedu-ci-pad-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    @keyframes kedu-ci-shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function parseList(v) {
    if (!v) return [];
    return String(v).split(',').map(s => s.trim()).filter(s => s !== '');
  }

  class KeduCountInput extends HTMLElement {
    static get observedAttributes() {
      return ['cells', 'answers', 'accept-range', 'accept-values', 'prompt', 'pad-min', 'pad-max'];
    }

    constructor() {
      super();
      this._rowEl = null;
      this._padEl = null;
      this._blanks = [];
      this._activeBlank = null;
      this._filled = new Map();
      this._completed = false;
      this._handleSlotClick = this._handleSlotClick.bind(this);
      this._handlePadClick = this._handlePadClick.bind(this);
    }

    connectedCallback() {
      injectStyle();
      this._build();
    }

    disconnectedCallback() {
      if (this._rowEl) this._rowEl.removeEventListener('click', this._handleSlotClick);
      if (this._padEl) this._padEl.removeEventListener('click', this._handlePadClick);
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (!this.isConnected) return;
      this._build();
    }

    // ── property API ───────────────────────────────
    get cells() { return this.getAttribute('cells') || ''; }
    set cells(v) { this.setAttribute('cells', v); }

    get answers() { return this.getAttribute('answers') || ''; }
    set answers(v) { this.setAttribute('answers', v); }

    get prompt() { return this.getAttribute('prompt') || ''; }
    set prompt(v) { this.setAttribute('prompt', v); }

    // ── public methods ─────────────────────────────
    reset() {
      this._build();
    }

    // ── 내부 ───────────────────────────────────────
    // 빈칸 idx의 정답 검사 (단일 정답 / 허용 범위 / 허용 값)
    _isCorrect(blankIndex, value) {
      const range = parseList(this.getAttribute('accept-range'));
      const vals = parseList(this.getAttribute('accept-values'));
      // 허용 범위/값은 빈칸 1개 전제
      if (range.length === 2) {
        const a = parseInt(range[0], 10), b = parseInt(range[1], 10);
        return value >= Math.min(a, b) && value <= Math.max(a, b);
      }
      if (vals.length > 0) {
        return vals.map(s => parseInt(s, 10)).includes(value);
      }
      const answers = parseList(this.answers).map(s => parseInt(s, 10));
      return value === answers[blankIndex];
    }

    _padRange() {
      const min = parseInt(this.getAttribute('pad-min'), 10);
      const max = parseInt(this.getAttribute('pad-max'), 10);
      return {
        min: Number.isFinite(min) ? min : 1,
        max: Number.isFinite(max) ? max : 9
      };
    }

    _build() {
      this._filled = new Map();
      this._activeBlank = null;
      this._completed = false;
      this.innerHTML = '';

      const cellList = parseList(this.cells);
      const stage = document.createElement('div');
      stage.className = 'kedu-ci-stage';

      const promptTxt = this.prompt.trim();
      if (promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-ci-prompt';
        p.textContent = promptTxt;
        stage.appendChild(p);
      }

      const row = document.createElement('div');
      row.className = 'kedu-ci-row';
      const blanks = [];
      let blankIdx = 0;
      cellList.forEach(c => {
        const slot = document.createElement('div');
        slot.className = 'kedu-ci-slot';
        if (c === '?') {
          slot.classList.add('kedu-ci-blank');
          slot.dataset.blankIndex = String(blankIdx);
          slot.textContent = '?';
          blanks.push(slot);
          blankIdx++;
        } else {
          slot.textContent = c;
        }
        row.appendChild(slot);
      });
      stage.appendChild(row);

      const { min, max } = this._padRange();
      const pad = document.createElement('div');
      pad.className = 'kedu-ci-pad';
      const cols = (max - min + 1);
      pad.style.gridTemplateColumns = `repeat(${Math.min(cols, 10)}, 1fr)`;
      for (let n = min; n <= max; n++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kedu-ci-pad-btn';
        btn.dataset.num = String(n);
        btn.textContent = String(n);
        pad.appendChild(btn);
      }
      stage.appendChild(pad);

      this.appendChild(stage);
      this._rowEl = row;
      this._padEl = pad;
      this._blanks = blanks;

      row.addEventListener('click', this._handleSlotClick);
      pad.addEventListener('click', this._handlePadClick);

      // 첫 빈칸 자동 활성
      if (blanks.length > 0) this._setActive(blanks[0]);
    }

    _setActive(slot) {
      this._blanks.forEach(b => b.classList.remove('kedu-ci-active'));
      if (slot && !slot.classList.contains('kedu-ci-filled')) {
        slot.classList.add('kedu-ci-active');
        this._activeBlank = slot;
      } else {
        this._activeBlank = null;
      }
    }

    _handleSlotClick(e) {
      if (this._completed) return;
      const slot = e.target.closest('.kedu-ci-blank');
      if (!slot || !this._rowEl.contains(slot)) return;
      if (slot.classList.contains('kedu-ci-filled')) return;
      this._setActive(slot);
    }

    _handlePadClick(e) {
      if (this._completed) return;
      const btn = e.target.closest('.kedu-ci-pad-btn');
      if (!btn || btn.disabled) return;
      if (!this._activeBlank) {
        // 활성 빈칸 없으면 첫 미완성 빈칸 자동 선택
        const next = this._blanks.find(b => !b.classList.contains('kedu-ci-filled'));
        if (next) this._setActive(next);
        if (!this._activeBlank) return;
      }
      const value = parseInt(btn.dataset.num, 10);
      const blankIndex = parseInt(this._activeBlank.dataset.blankIndex, 10);

      if (this._isCorrect(blankIndex, value)) {
        this._activeBlank.textContent = String(value);
        this._activeBlank.classList.remove('kedu-ci-active');
        this._activeBlank.classList.add('kedu-ci-filled');
        this._filled.set(blankIndex, value);
        this.dispatchEvent(new CustomEvent('kedu-count-input-fill', {
          bubbles: true,
          detail: { blankIndex, value }
        }));
        // 다음 빈칸 자동 활성
        const next = this._blanks.find(b => !b.classList.contains('kedu-ci-filled'));
        if (next) {
          this._setActive(next);
        } else {
          this._completed = true;
          this._padEl.querySelectorAll('.kedu-ci-pad-btn').forEach(b => b.disabled = true);
          this.dispatchEvent(new CustomEvent('kedu-count-input-complete', {
            bubbles: true,
            detail: { values: Object.fromEntries(this._filled) }
          }));
        }
      } else {
        const slot = this._activeBlank;
        slot.classList.add('kedu-ci-shake');
        setTimeout(() => slot.classList.remove('kedu-ci-shake'), 420);
        const answers = parseList(this.answers).map(s => parseInt(s, 10));
        this.dispatchEvent(new CustomEvent('kedu-count-input-wrong', {
          bubbles: true,
          detail: { blankIndex, value, expected: answers[blankIndex] ?? null }
        }));
      }
    }
  }

  if (!customElements.get('kedu-count-input')) {
    customElements.define('kedu-count-input', KeduCountInput);
  }
})();
