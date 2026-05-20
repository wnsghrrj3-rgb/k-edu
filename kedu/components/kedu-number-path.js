/* =====================================================
 * <kedu-number-path> v1.0
 *
 * 용도:
 *   수의 순서 길 (1~9 / 9~1). 시작 타일에서 다음 수를 차례로 눌러
 *   끝까지 밟는 인터랙티브 부품. 학생 라이브 .np-path 시각 호환 +
 *   케이티처 엔진의 동일 출력.
 *
 * 사용:
 *   <kedu-number-path start="1" end="9" direction="asc"></kedu-number-path>
 *   <kedu-number-path start="9" end="1" direction="desc"></kedu-number-path>
 *
 * attributes:
 *   start     : 시작 수 (default 1)
 *   end       : 끝 수 (default 9)
 *   direction : asc | desc (default asc) — 오름차/내림차 길
 *   walker    : 워커 이모지 (default 🐰)
 *
 * events (bubbles: true):
 *   kedu-number-path-step      detail: {current, step, total}   — 한 칸 전진 시
 *   kedu-number-path-wrong     detail: {clicked, expected}       — 틀린 칸 클릭 시
 *   kedu-number-path-complete  detail: {start, end}              — 끝 도달 시 1회
 *
 * methods:
 *   reset() — 시작점으로 복귀
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-np-tile-border   #1565C0
 *   --kedu-np-tile-color    #1976D2
 *   --kedu-np-done-bg       #C8E6C9
 *   --kedu-np-done-border   #2E7D32
 *   --kedu-np-cur-bg        #FFE0B2
 *   --kedu-np-cur-border    #F57C00
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-number-path-style';
  const CSS = `
    kedu-number-path {
      display: block;
      box-sizing: border-box;
      --kedu-np-tile-border: var(--kedu-np-tile-border-override, #1565C0);
      --kedu-np-tile-color:  var(--kedu-np-tile-color-override,  #1976D2);
      --kedu-np-done-bg:     var(--kedu-np-done-bg-override,     #C8E6C9);
      --kedu-np-done-border: var(--kedu-np-done-border-override, #2E7D32);
      --kedu-np-cur-bg:      var(--kedu-np-cur-bg-override,      #FFE0B2);
      --kedu-np-cur-border:  var(--kedu-np-cur-border-override,  #F57C00);
    }
    kedu-number-path[hidden] { display: none; }

    kedu-number-path .kedu-np-stage {
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(12px, 2.4vw, 20px); width: 100%;
    }
    kedu-number-path .kedu-np-path {
      display: flex; gap: clamp(6px, 1.2vw, 10px); justify-content: center;
      padding: clamp(14px, 2.8vw, 22px) clamp(10px, 2vw, 16px);
      background: linear-gradient(to right, #FFF8E1 0%, #FFE0B2 50%, #FFCC80 100%);
      border-radius: clamp(14px, 2.6vw, 22px);
      flex-wrap: nowrap; overflow-x: auto; max-width: 100%; position: relative;
    }
    kedu-number-path[direction="desc"] .kedu-np-path {
      background: linear-gradient(to left, #FFF8E1 0%, #FFE0B2 50%, #FFCC80 100%);
    }
    kedu-number-path .kedu-np-tile {
      background: white;
      border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-np-tile-border);
      border-radius: 50%;
      width: clamp(54px, 9vw, 76px); height: clamp(54px, 9vw, 76px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(22px, 3.6vw, 32px); color: var(--kedu-np-tile-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0; position: relative;
    }
    kedu-number-path .kedu-np-tile:hover:not(.kedu-np-visited):not(.kedu-np-locked) {
      background: #E3F2FD; transform: scale(1.1);
    }
    kedu-number-path .kedu-np-tile.kedu-np-start {
      background: var(--kedu-np-done-bg); border-color: var(--kedu-np-done-border); color: var(--kedu-np-done-border);
    }
    kedu-number-path .kedu-np-tile.kedu-np-visited {
      background: var(--kedu-np-done-bg); border-color: var(--kedu-np-done-border); color: var(--kedu-np-done-border); cursor: default;
    }
    kedu-number-path .kedu-np-tile.kedu-np-current {
      background: var(--kedu-np-cur-bg); border-color: var(--kedu-np-cur-border);
      transform: scale(1.15); box-shadow: 0 0 0 5px rgba(245,124,0,0.3);
    }
    kedu-number-path .kedu-np-tile.kedu-np-locked { opacity: 0.55; cursor: not-allowed; }
    kedu-number-path .kedu-np-tile.kedu-np-wrong {
      animation: kedu-np-shake 0.4s ease; background: #FFCDD2; border-color: #C62828;
    }
    kedu-number-path .kedu-np-tile.kedu-np-walker::before {
      content: attr(data-walker); position: absolute; top: -28px; left: 50%;
      transform: translateX(-50%); font-size: clamp(22px, 3.4vw, 30px);
      animation: kedu-np-jump 0.5s ease;
    }
    kedu-number-path .kedu-np-progress { font-size: clamp(14px, 2vw, 18px); color: #6D4C41; }
    kedu-number-path .kedu-np-progress strong { font-family: 'Nunito', sans-serif; font-weight: 800; color: #F57F17; }

    @keyframes kedu-np-shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    @keyframes kedu-np-jump {
      0% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
      100% { transform: translateX(-50%) translateY(0); }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function toInt(v, dflt) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : dflt;
  }

  class KeduNumberPath extends HTMLElement {
    static get observedAttributes() {
      return ['start', 'end', 'direction', 'walker'];
    }

    constructor() {
      super();
      this._pathEl = null;
      this._progressEl = null;
      this._tiles = [];
      this._curStep = 0;
      this._completed = false;
      this._handleClick = this._handleClick.bind(this);
    }

    connectedCallback() {
      injectStyle();
      this._build();
      this._pathEl.addEventListener('click', this._handleClick);
    }

    disconnectedCallback() {
      if (this._pathEl) this._pathEl.removeEventListener('click', this._handleClick);
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (!this.isConnected) return;
      this._build();
    }

    // ── property API ───────────────────────────────
    get start() { return toInt(this.getAttribute('start'), 1); }
    set start(v) { this.setAttribute('start', String(v)); }

    get end() { return toInt(this.getAttribute('end'), 9); }
    set end(v) { this.setAttribute('end', String(v)); }

    get direction() { return this.getAttribute('direction') || 'asc'; }
    set direction(v) { this.setAttribute('direction', v); }

    get walker() { return this.getAttribute('walker') || '🐰'; }
    set walker(v) { this.setAttribute('walker', v); }

    // ── public methods ─────────────────────────────
    reset() {
      this._curStep = 0;
      this._completed = false;
      this._render();
    }

    // ── 내부 ───────────────────────────────────────
    _numbers() {
      const s = this.start, e = this.end;
      const arr = [];
      if (this.direction === 'desc' || s > e) {
        for (let n = s; n >= e; n--) arr.push(n);
      } else {
        for (let n = s; n <= e; n++) arr.push(n);
      }
      return arr;
    }

    _expected(step) {
      const nums = this._numbers();
      return nums[step];
    }

    _build() {
      const nums = this._numbers();
      this._curStep = 0;
      this._completed = false;
      this.innerHTML = '';

      const stage = document.createElement('div');
      stage.className = 'kedu-np-stage';

      const path = document.createElement('div');
      path.className = 'kedu-np-path';
      const tiles = [];
      nums.forEach(n => {
        const tile = document.createElement('div');
        tile.className = 'kedu-np-tile';
        tile.dataset.num = String(n);
        tile.dataset.walker = this.walker;
        tile.textContent = String(n);
        path.appendChild(tile);
        tiles.push(tile);
      });

      const progress = document.createElement('div');
      progress.className = 'kedu-np-progress';

      stage.appendChild(path);
      stage.appendChild(progress);
      this.appendChild(stage);

      this._pathEl = path;
      this._progressEl = progress;
      this._tiles = tiles;
      this._render();
    }

    _render() {
      const nums = this._numbers();
      const total = nums.length;
      this._tiles.forEach(t => {
        t.className = 'kedu-np-tile';
      });
      for (let i = 0; i <= this._curStep; i++) {
        const n = this._expected(i);
        const tile = this._tiles.find(t => toInt(t.dataset.num) === n);
        if (!tile) continue;
        if (i < this._curStep) {
          tile.classList.add('kedu-np-visited');
        } else {
          tile.classList.add('kedu-np-current', 'kedu-np-walker');
        }
      }
      this._tiles.forEach(t => {
        if (!t.classList.contains('kedu-np-visited') && !t.classList.contains('kedu-np-current')) {
          t.classList.add('kedu-np-locked');
        }
      });
      this._progressEl.innerHTML = '<strong>' + (this._curStep + 1) + '</strong> / ' + total;
    }

    _handleClick(e) {
      if (this._completed) return;
      const tile = e.target.closest('.kedu-np-tile');
      if (!tile || !this._pathEl.contains(tile)) return;
      const nums = this._numbers();
      const total = nums.length;
      if (this._curStep + 1 >= total) return;

      const clicked = toInt(tile.dataset.num);
      const expected = this._expected(this._curStep + 1);
      if (clicked === expected) {
        this._curStep++;
        this._render();
        this.dispatchEvent(new CustomEvent('kedu-number-path-step', {
          bubbles: true,
          detail: { current: clicked, step: this._curStep, total }
        }));
        if (this._curStep + 1 === total) {
          this._completed = true;
          this.dispatchEvent(new CustomEvent('kedu-number-path-complete', {
            bubbles: true,
            detail: { start: this.start, end: this.end }
          }));
        }
      } else {
        tile.classList.add('kedu-np-wrong');
        setTimeout(() => tile.classList.remove('kedu-np-wrong'), 420);
        this.dispatchEvent(new CustomEvent('kedu-number-path-wrong', {
          bubbles: true,
          detail: { clicked, expected }
        }));
      }
    }
  }

  if (!customElements.get('kedu-number-path')) {
    customElements.define('kedu-number-path', KeduNumberPath);
  }
})();
