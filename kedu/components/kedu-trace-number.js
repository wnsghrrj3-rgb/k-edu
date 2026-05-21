/* =====================================================
 * <kedu-trace-number> v1.0
 *
 * 용도:
 *   숫자 0~9 필순 따라쓰기 부품. 클릭하면 시작점(빨간 점)부터
 *   파란 획이 그려지며 완성. 학생 라이브 .trace-cell / .tn-* 시각 호환.
 *
 * 사용:
 *   여러 숫자 한 줄 (각각 클릭):
 *     <kedu-trace-number digits="1,2,3,4,5"></kedu-trace-number>
 *
 *   한 숫자 크게 (size="lg"):
 *     <kedu-trace-number digits="0" size="lg"></kedu-trace-number>
 *
 *   라벨 숨김:
 *     <kedu-trace-number digits="6,7,8,9" no-label></kedu-trace-number>
 *
 * attributes:
 *   digits   : 표시할 숫자 목록 (0~9). 쉼표 구분. (default "1,2,3,4,5,6,7,8,9")
 *   size     : sm | md | lg (default md)
 *   no-label : 있으면 숫자 라벨 숨김
 *
 * events (bubbles: true):
 *   kedu-trace-number-trace     detail: {digit, done}  — 한 숫자 그림/지움 토글
 *   kedu-trace-number-complete  detail: {}             — 모든 숫자 1회씩 그림
 *
 * methods:
 *   reset() — 모든 획 초기화
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-tn-color   #1976D2   (획 색)
 *   --kedu-tn-out     #E0E0E0   (가이드 색)
 *   --kedu-tn-start   #DC2626   (시작점 색)
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-trace-number-style';

  // 60×80 좌표계 기준 path (학생 라이브 l02_03·l04_05에서 추출).
  // 0은 학생 라이브 100×130을 60×80으로 환산 (스케일 ×0.6, ×0.615).
  const DIGITS = {
    '0': { d: 'M 30 10 Q 13 10 13 40 Q 13 70 30 70 Q 47 70 47 40 Q 47 10 30 10 Z', sx: 30, sy: 10 },
    '1': { d: 'M 22 22 L 30 12 L 30 70', sx: 22, sy: 22 },
    '2': { d: 'M 16 22 Q 30 8 44 22 Q 44 36 30 46 Q 16 56 14 70 L 46 70', sx: 16, sy: 22 },
    '3': { d: 'M 14 20 Q 30 6 46 20 Q 46 36 30 42 Q 46 48 46 64 Q 30 78 14 64', sx: 14, sy: 20 },
    '4': { d: 'M 36 10 L 12 50 L 50 50 M 36 30 L 36 70', sx: 36, sy: 10 },
    '5': { d: 'M 46 12 L 18 12 L 16 38 Q 30 30 42 38 Q 50 50 42 62 Q 28 72 14 64', sx: 46, sy: 12 },
    '6': { d: 'M 42 14 Q 24 18 18 38 Q 14 56 28 64 Q 46 66 46 50 Q 44 38 28 40 Q 18 44 18 52', sx: 42, sy: 14 },
    '7': { d: 'M 14 14 L 48 14 L 22 70', sx: 14, sy: 14 },
    '8': { d: 'M 30 14 Q 14 16 16 28 Q 18 38 30 40 Q 14 44 14 58 Q 16 70 30 70 Q 46 70 46 58 Q 46 44 30 40 Q 44 38 44 28 Q 46 16 30 14', sx: 30, sy: 14 },
    '9': { d: 'M 44 26 Q 44 12 30 12 Q 16 12 16 26 Q 16 40 30 40 Q 44 40 44 26 L 44 70', sx: 44, sy: 26 }
  };

  const SIZES = {
    sm: { w: 'clamp(50px, 8vw, 80px)',  h: 'clamp(66px, 10vw, 106px)' },
    md: { w: 'clamp(70px, 11vw, 110px)', h: 'clamp(90px, 14vw, 140px)' },
    lg: { w: 'clamp(120px, 20vw, 200px)', h: 'clamp(160px, 26vw, 264px)' }
  };

  const CSS = `
    kedu-trace-number {
      display: block; box-sizing: border-box; width: 100%;
      --kedu-tn-color: var(--kedu-tn-color-override, #1976D2);
      --kedu-tn-out:   var(--kedu-tn-out-override,   #E0E0E0);
      --kedu-tn-start: var(--kedu-tn-start-override, #DC2626);
    }
    kedu-trace-number[hidden] { display: none; }

    kedu-trace-number .kedu-tn-stage {
      display: flex; gap: clamp(8px, 1.6vw, 16px); justify-content: center; flex-wrap: wrap;
    }
    kedu-trace-number .kedu-tn-cell {
      background: white; border: clamp(2px, 0.4vw, 3px) solid var(--kedu-tn-out);
      border-radius: clamp(12px, 2.2vw, 18px); padding: clamp(8px, 1.6vw, 14px);
      display: flex; flex-direction: column; align-items: center; gap: clamp(4px, 1vw, 8px);
      cursor: pointer; transition: transform 0.15s;
    }
    kedu-trace-number .kedu-tn-cell:hover { transform: scale(1.04); }
    kedu-trace-number .kedu-tn-out {
      fill: none; stroke: var(--kedu-tn-out); stroke-width: 12;
      stroke-linecap: round; stroke-linejoin: round;
    }
    kedu-trace-number .kedu-tn-line {
      fill: none; stroke: var(--kedu-tn-color); stroke-width: 8;
      stroke-linecap: round; stroke-linejoin: round;
      stroke-dasharray: 400; stroke-dashoffset: 400; transition: stroke-dashoffset 1.2s ease;
    }
    kedu-trace-number .kedu-tn-cell.done .kedu-tn-line { stroke-dashoffset: 0; }
    kedu-trace-number .kedu-tn-startdot { fill: var(--kedu-tn-start); }
    kedu-trace-number .kedu-tn-label {
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(18px, 2.8vw, 24px); color: var(--kedu-tn-color);
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

  const SVGNS = 'http://www.w3.org/2000/svg';

  class TraceNumber extends HTMLElement {
    static get observedAttributes() {
      return ['digits', 'size', 'no-label'];
    }

    constructor() {
      super();
      this._traced = new Set();
      this._total = 0;
      this._completed = false;
    }

    connectedCallback() {
      injectStyle();
      this._build();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (!this.isConnected) return;
      this._build();
    }

    // ── property API ──
    get digits() { return this.getAttribute('digits') || '1,2,3,4,5,6,7,8,9'; }
    set digits(v) { this.setAttribute('digits', String(v)); }
    get size() { return this.getAttribute('size') || 'md'; }
    set size(v) { this.setAttribute('size', String(v)); }

    // ── public methods ──
    reset() { this._build(); }

    _build() {
      this._traced = new Set();
      this._completed = false;
      this.innerHTML = '';

      const list = parseList(this.digits).filter(d => DIGITS[d]);
      this._total = list.length;
      const sz = SIZES[this.size] || SIZES.md;
      const showLabel = !this.hasAttribute('no-label');

      const stage = document.createElement('div');
      stage.className = 'kedu-tn-stage';

      list.forEach(d => {
        const def = DIGITS[d];
        const cell = document.createElement('div');
        cell.className = 'kedu-tn-cell';
        cell.dataset.digit = d;

        const svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('viewBox', '0 0 60 80');
        svg.style.width = sz.w;
        svg.style.height = sz.h;

        const out = document.createElementNS(SVGNS, 'path');
        out.setAttribute('class', 'kedu-tn-out');
        out.setAttribute('d', def.d);
        svg.appendChild(out);

        const line = document.createElementNS(SVGNS, 'path');
        line.setAttribute('class', 'kedu-tn-line');
        line.setAttribute('d', def.d);
        svg.appendChild(line);

        const dot = document.createElementNS(SVGNS, 'circle');
        dot.setAttribute('class', 'kedu-tn-startdot');
        dot.setAttribute('cx', String(def.sx));
        dot.setAttribute('cy', String(def.sy));
        dot.setAttribute('r', '4');
        svg.appendChild(dot);

        cell.appendChild(svg);

        if (showLabel) {
          const label = document.createElement('span');
          label.className = 'kedu-tn-label';
          label.textContent = d;
          cell.appendChild(label);
        }

        cell.addEventListener('click', () => this._toggle(cell, d));
        stage.appendChild(cell);
      });

      this.appendChild(stage);
    }

    _toggle(cell, digit) {
      const done = cell.classList.toggle('done');
      if (done) this._traced.add(digit);
      this.dispatchEvent(new CustomEvent('kedu-trace-number-trace', {
        bubbles: true,
        detail: { digit, done }
      }));
      if (!this._completed && this._traced.size >= this._total && this._total > 0) {
        this._completed = true;
        this.dispatchEvent(new CustomEvent('kedu-trace-number-complete', {
          bubbles: true,
          detail: {}
        }));
      }
    }
  }

  if (!customElements.get('kedu-trace-number')) {
    customElements.define('kedu-trace-number', TraceNumber);
  }
})();
