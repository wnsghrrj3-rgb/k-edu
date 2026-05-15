/* =====================================================
 * <kedu-ten-frame> v1.0
 *
 * 용도:
 *   십 배열판 (5×2 grid). 학생 라이브 .ten-frame 시각 100% 호환 +
 *   케이티처 엔진의 SVG/DOM 호출을 한 줄 태그로 치환.
 *
 * 사용:
 *   <kedu-ten-frame count="6" size="md"></kedu-ten-frame>
 *   <kedu-ten-frame count="0" size="lg" mode="interactive" target="8"></kedu-ten-frame>
 *
 * attributes:
 *   count   : 0~10 정수 (default 0) — 채운 칸 수
 *   size    : sm | md | lg | xl (default md)
 *   mode    : default | interactive (default default)
 *             - default     : 표시 전용 (count 만큼 왼쪽부터 채움)
 *             - interactive : 빈 칸 클릭으로 채움
 *   target  : interactive 모드의 목표 수 (없으면 complete/overflow 미발생)
 *
 * events (bubbles: true):
 *   kedu-ten-frame-change      detail: {count, target}     — count 변경 시
 *   kedu-ten-frame-complete    detail: {count, target}     — count === target 도달 시 1회
 *   kedu-ten-frame-overflow    detail: {count, target}     — count > target 도달 시
 *   kedu-ten-frame-out-of-order detail: {clickedIndex, firstEmpty} — 빈 첫 칸이 아닌 칸 클릭 시
 *
 * methods:
 *   reset()       — count = 0
 *   setCount(n)   — count attribute 갱신
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-tf-fill-color   #1565C0
 *   --kedu-tf-dot-color    #1976D2
 *   --kedu-tf-cell-bg      #FFFFFF
 *   --kedu-tf-cell-hover   #E3F2FD
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-ten-frame-style';
  const CSS = `
    kedu-ten-frame {
      display: inline-block;
      box-sizing: border-box;
      --kedu-tf-fill-color: var(--kedu-tf-fill-color-override, #1565C0);
      --kedu-tf-dot-color:  var(--kedu-tf-dot-color-override,  #1976D2);
      --kedu-tf-cell-bg:    var(--kedu-tf-cell-bg-override,    #FFFFFF);
      --kedu-tf-cell-hover: var(--kedu-tf-cell-hover-override, #E3F2FD);
    }
    kedu-ten-frame[hidden] { display: none; }

    kedu-ten-frame .kedu-tf-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(3px, 0.6vw, 5px);
      background: var(--kedu-tf-fill-color);
      padding: clamp(3px, 0.6vw, 5px);
      border-radius: clamp(8px, 1.4vw, 12px);
      box-sizing: border-box;
    }
    kedu-ten-frame[size="sm"] .kedu-tf-grid { width: clamp(120px, 19vw, 180px); height: clamp(50px, 7.8vw, 74px); }
    kedu-ten-frame[size="md"] .kedu-tf-grid,
    kedu-ten-frame:not([size]) .kedu-tf-grid { width: clamp(170px, 26vw, 250px); height: clamp(70px, 10.7vw, 102px); }
    kedu-ten-frame[size="lg"] .kedu-tf-grid { width: clamp(220px, 34vw, 320px); height: clamp(90px, 14vw, 132px); }
    kedu-ten-frame[size="xl"] .kedu-tf-grid { width: clamp(280px, 42vw, 400px); height: clamp(116px, 17.6vw, 168px); }

    kedu-ten-frame .kedu-tf-cell {
      background: var(--kedu-tf-cell-bg);
      border-radius: clamp(4px, 0.8vw, 7px);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    kedu-ten-frame .kedu-tf-dot {
      width: 70%;
      height: 70%;
      border-radius: 50%;
      background: var(--kedu-tf-dot-color);
      transform: scale(0);
      animation: kedu-tf-fillCell 0.35s ease both;
    }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill .kedu-tf-dot { transform: scale(1); }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(1)  .kedu-tf-dot { animation-delay: 0.05s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(2)  .kedu-tf-dot { animation-delay: 0.12s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(3)  .kedu-tf-dot { animation-delay: 0.19s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(4)  .kedu-tf-dot { animation-delay: 0.26s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(5)  .kedu-tf-dot { animation-delay: 0.33s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(6)  .kedu-tf-dot { animation-delay: 0.45s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(7)  .kedu-tf-dot { animation-delay: 0.52s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(8)  .kedu-tf-dot { animation-delay: 0.59s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(9)  .kedu-tf-dot { animation-delay: 0.66s; }
    kedu-ten-frame .kedu-tf-cell.kedu-tf-fill:nth-child(10) .kedu-tf-dot { animation-delay: 0.73s; }

    @keyframes kedu-tf-fillCell {
      from { transform: scale(0); }
      to   { transform: scale(1); }
    }

    kedu-ten-frame[mode="interactive"] .kedu-tf-cell {
      cursor: pointer;
      transition: background 0.15s;
    }
    kedu-ten-frame[mode="interactive"] .kedu-tf-cell:hover {
      background: var(--kedu-tf-cell-hover);
    }
    kedu-ten-frame[mode="interactive"] .kedu-tf-cell.kedu-tf-fill {
      cursor: default;
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function clampInt(n, min, max) {
    n = Math.floor(Number(n));
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  class KeduTenFrame extends HTMLElement {
    static get observedAttributes() {
      return ['count', 'size', 'mode', 'target'];
    }

    constructor() {
      super();
      this._grid = null;
      this._cells = [];
      this._completed = false;
      this._handleClick = this._handleClick.bind(this);
    }

    connectedCallback() {
      injectStyle();
      if (!this._grid) this._buildDom();
      this._render();
      this._grid.addEventListener('click', this._handleClick);
    }

    disconnectedCallback() {
      if (this._grid) this._grid.removeEventListener('click', this._handleClick);
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (!this.isConnected || !this._grid) return;
      if (name === 'target') this._completed = false;
      this._render();
    }

    // ── property API ───────────────────────────────
    get count() { return clampInt(this.getAttribute('count') || 0, 0, 10); }
    set count(v) { this.setAttribute('count', String(v)); }

    get size() { return this.getAttribute('size') || 'md'; }
    set size(v) { this.setAttribute('size', v); }

    get mode() { return this.getAttribute('mode') || 'default'; }
    set mode(v) { this.setAttribute('mode', v); }

    get target() {
      const t = this.getAttribute('target');
      if (t == null) return null;
      const n = Number(t);
      return Number.isFinite(n) ? n : null;
    }
    set target(v) {
      if (v == null) this.removeAttribute('target');
      else this.setAttribute('target', String(v));
    }

    // ── public methods ─────────────────────────────
    reset() {
      this._completed = false;
      this.count = 0;
    }
    setCount(n) {
      this.count = clampInt(n, 0, 10);
    }

    // ── 내부 ───────────────────────────────────────
    _buildDom() {
      this.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'kedu-tf-grid';
      const cells = [];
      for (let i = 0; i < 10; i++) {
        const cell = document.createElement('div');
        cell.className = 'kedu-tf-cell';
        cell.dataset.index = String(i);
        const dot = document.createElement('div');
        dot.className = 'kedu-tf-dot';
        cell.appendChild(dot);
        grid.appendChild(cell);
        cells.push(cell);
      }
      this.appendChild(grid);
      this._grid = grid;
      this._cells = cells;
    }

    _render() {
      const c = this.count;
      for (let i = 0; i < 10; i++) {
        this._cells[i].classList.toggle('kedu-tf-fill', i < c);
      }
    }

    _handleClick(e) {
      if (this.mode !== 'interactive') return;
      const cell = e.target.closest('.kedu-tf-cell');
      if (!cell || !this._grid.contains(cell)) return;
      if (cell.classList.contains('kedu-tf-fill')) return;
      const idx = Number(cell.dataset.index);
      const firstEmpty = this._cells.findIndex(c => !c.classList.contains('kedu-tf-fill'));
      if (idx !== firstEmpty) {
        this.dispatchEvent(new CustomEvent('kedu-ten-frame-out-of-order', {
          bubbles: true,
          detail: { clickedIndex: idx, firstEmpty }
        }));
        return;
      }
      const newCount = this.count + 1;
      this.setAttribute('count', String(newCount));
      this.dispatchEvent(new CustomEvent('kedu-ten-frame-change', {
        bubbles: true,
        detail: { count: newCount, target: this.target }
      }));
      const tgt = this.target;
      if (tgt != null) {
        if (newCount === tgt && !this._completed) {
          this._completed = true;
          this.dispatchEvent(new CustomEvent('kedu-ten-frame-complete', {
            bubbles: true,
            detail: { count: newCount, target: tgt }
          }));
        } else if (newCount > tgt) {
          this.dispatchEvent(new CustomEvent('kedu-ten-frame-overflow', {
            bubbles: true,
            detail: { count: newCount, target: tgt }
          }));
        }
      }
    }
  }

  if (!customElements.get('kedu-ten-frame')) {
    customElements.define('kedu-ten-frame', KeduTenFrame);
  }
})();
