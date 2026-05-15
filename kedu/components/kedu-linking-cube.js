/* =====================================================
 * <kedu-linking-cube> v1.0
 *
 * 용도:
 *   연결 모형 큐브. 학생 라이브 .lc-stage(stairs)·.lc-stage-single 호환 +
 *   케이티처 엔진의 stair·single 호출을 한 줄 태그로 치환.
 *
 * 사용:
 *   <kedu-linking-cube display="stairs" range="1,9"></kedu-linking-cube>
 *   <kedu-linking-cube display="stairs" range="0,5" show-zero highlight="3"></kedu-linking-cube>
 *   <kedu-linking-cube display="single" count="5"></kedu-linking-cube>
 *   <kedu-linking-cube display="row" count="7"></kedu-linking-cube>
 *
 * attributes:
 *   display       : stairs | single | row (default stairs)
 *   count         : 0~10 — single·row 모드 큐브 개수 (default 0)
 *   range         : "min,max" — stairs 모드 범위 (default "1,9")
 *   highlight     : 정수 — stairs에서 강조할 수 (없으면 미강조)
 *   show-zero     : boolean — stairs에서 0을 표시할지 (range 에 0 포함되어야 의미 있음)
 *   highlight-zero: boolean — 0을 강조 표시
 *   cube-size     : sm | md | lg (default md)
 *
 * events:
 *   (v1 비인터랙티브, 이벤트 없음)
 *
 * methods:
 *   setCount(n)         — count attribute 갱신 (single·row)
 *   setRange(min, max)  — range attribute 갱신 (stairs)
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-lc-cube-color        #64B5F6
 *   --kedu-lc-cube-border       #1976D2
 *   --kedu-lc-cube-highlight    #FFB74D
 *   --kedu-lc-cube-highlight-bd #E65100
 *   --kedu-lc-label-color       #1976D2
 *   --kedu-lc-single-bg         #F0F7FF
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-linking-cube-style';
  const CSS = `
    kedu-linking-cube {
      display: inline-block;
      box-sizing: border-box;
      --kedu-lc-cube-color:        var(--kedu-lc-cube-color-override,        #64B5F6);
      --kedu-lc-cube-border:       var(--kedu-lc-cube-border-override,       #1976D2);
      --kedu-lc-cube-highlight:    var(--kedu-lc-cube-highlight-override,    #FFB74D);
      --kedu-lc-cube-highlight-bd: var(--kedu-lc-cube-highlight-bd-override, #E65100);
      --kedu-lc-label-color:       var(--kedu-lc-label-color-override,       #1976D2);
      --kedu-lc-single-bg:         var(--kedu-lc-single-bg-override,         #F0F7FF);
    }
    kedu-linking-cube[hidden] { display: none; }

    /* ── stairs ────────────────────────────────────────── */
    kedu-linking-cube .kedu-lc-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(10px, 2vw, 16px);
    }
    kedu-linking-cube .kedu-lc-row {
      display: flex;
      gap: clamp(4px, 0.8vw, 8px);
      align-items: flex-end;
      justify-content: center;
      flex-wrap: nowrap;
    }
    kedu-linking-cube .kedu-lc-bar {
      display: flex;
      flex-direction: column;
      gap: clamp(2px, 0.4vw, 4px);
      align-items: center;
      animation: kedu-lc-pop 0.4s ease both;
    }
    kedu-linking-cube .kedu-lc-bar:nth-child(1) { animation-delay: 0.05s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(2) { animation-delay: 0.12s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(3) { animation-delay: 0.19s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(4) { animation-delay: 0.26s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(5) { animation-delay: 0.33s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(6) { animation-delay: 0.4s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(7) { animation-delay: 0.47s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(8) { animation-delay: 0.54s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(9) { animation-delay: 0.61s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(10) { animation-delay: 0.68s; }
    kedu-linking-cube .kedu-lc-bar:nth-child(11) { animation-delay: 0.75s; }
    kedu-linking-cube .kedu-lc-cubes {
      display: flex;
      flex-direction: column-reverse;
      gap: clamp(1px, 0.3vw, 3px);
    }
    kedu-linking-cube .kedu-lc-cube {
      background: var(--kedu-lc-cube-color);
      border: clamp(1.5px, 0.3vw, 2.5px) solid var(--kedu-lc-cube-border);
      border-radius: clamp(3px, 0.6vw, 5px);
    }
    kedu-linking-cube[cube-size="sm"] .kedu-lc-cube { width: clamp(14px, 2.4vw, 22px); height: clamp(14px, 2.4vw, 22px); }
    kedu-linking-cube[cube-size="md"] .kedu-lc-cube,
    kedu-linking-cube:not([cube-size]) .kedu-lc-cube { width: clamp(18px, 3vw, 30px); height: clamp(18px, 3vw, 30px); }
    kedu-linking-cube[cube-size="lg"] .kedu-lc-cube { width: clamp(24px, 4vw, 40px); height: clamp(24px, 4vw, 40px); }

    kedu-linking-cube .kedu-lc-label {
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: clamp(14px, 2.2vw, 20px);
      color: var(--kedu-lc-label-color);
    }
    kedu-linking-cube .kedu-lc-bar.kedu-lc-highlight .kedu-lc-cube {
      background: var(--kedu-lc-cube-highlight);
      border-color: var(--kedu-lc-cube-highlight-bd);
    }
    kedu-linking-cube .kedu-lc-bar.kedu-lc-highlight .kedu-lc-label {
      color: var(--kedu-lc-cube-highlight-bd);
    }
    kedu-linking-cube .kedu-lc-bar.kedu-lc-zero .kedu-lc-cubes {
      min-height: clamp(18px, 3vw, 30px);
    }

    /* ── single (배경 박스 있음) ─────────────────────────── */
    kedu-linking-cube .kedu-lc-stage-single {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(14px, 2.6vw, 22px);
    }
    kedu-linking-cube .kedu-lc-row-single {
      display: flex;
      gap: clamp(4px, 0.8vw, 8px);
      align-items: center;
      padding: clamp(10px, 2vw, 16px);
      background: var(--kedu-lc-single-bg);
      border-radius: clamp(12px, 2.2vw, 18px);
    }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h {
      background: var(--kedu-lc-cube-color);
      border: clamp(2px, 0.4vw, 3px) solid var(--kedu-lc-cube-border);
      border-radius: clamp(4px, 0.8vw, 7px);
      animation: kedu-lc-pop 0.35s ease both;
    }
    kedu-linking-cube[cube-size="sm"] .kedu-lc-row-single .kedu-lc-cube-h { width: clamp(20px, 3.4vw, 32px); height: clamp(20px, 3.4vw, 32px); }
    kedu-linking-cube[cube-size="md"] .kedu-lc-row-single .kedu-lc-cube-h,
    kedu-linking-cube:not([cube-size]) .kedu-lc-row-single .kedu-lc-cube-h { width: clamp(28px, 4.5vw, 44px); height: clamp(28px, 4.5vw, 44px); }
    kedu-linking-cube[cube-size="lg"] .kedu-lc-row-single .kedu-lc-cube-h { width: clamp(36px, 5.8vw, 56px); height: clamp(36px, 5.8vw, 56px); }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(1) { animation-delay: 0.05s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(2) { animation-delay: 0.12s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(3) { animation-delay: 0.19s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(4) { animation-delay: 0.26s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(5) { animation-delay: 0.33s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(6) { animation-delay: 0.4s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(7) { animation-delay: 0.47s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(8) { animation-delay: 0.54s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(9) { animation-delay: 0.61s; }
    kedu-linking-cube .kedu-lc-row-single .kedu-lc-cube-h:nth-child(10) { animation-delay: 0.68s; }

    /* ── row (배경 없이 단순 가로 나열) ──────────────────── */
    kedu-linking-cube .kedu-lc-row-plain {
      display: flex;
      gap: clamp(3px, 0.6vw, 6px);
      align-items: center;
      justify-content: center;
    }
    kedu-linking-cube .kedu-lc-row-plain .kedu-lc-cube-h {
      background: var(--kedu-lc-cube-color);
      border: clamp(1.5px, 0.3vw, 2.5px) solid var(--kedu-lc-cube-border);
      border-radius: clamp(3px, 0.6vw, 5px);
      animation: kedu-lc-pop 0.35s ease both;
    }
    kedu-linking-cube[cube-size="sm"] .kedu-lc-row-plain .kedu-lc-cube-h { width: clamp(14px, 2.4vw, 22px); height: clamp(14px, 2.4vw, 22px); }
    kedu-linking-cube[cube-size="md"] .kedu-lc-row-plain .kedu-lc-cube-h,
    kedu-linking-cube:not([cube-size]) .kedu-lc-row-plain .kedu-lc-cube-h { width: clamp(18px, 3vw, 30px); height: clamp(18px, 3vw, 30px); }
    kedu-linking-cube[cube-size="lg"] .kedu-lc-row-plain .kedu-lc-cube-h { width: clamp(24px, 4vw, 40px); height: clamp(24px, 4vw, 40px); }

    @keyframes kedu-lc-pop {
      0%   { opacity: 0; transform: scale(0.3); }
      60%  { opacity: 1; transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
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

  class KeduLinkingCube extends HTMLElement {
    static get observedAttributes() {
      return ['display', 'count', 'range', 'highlight', 'show-zero', 'highlight-zero', 'cube-size'];
    }

    constructor() {
      super();
      this._mounted = false;
    }

    connectedCallback() {
      injectStyle();
      this._mounted = true;
      this._render();
    }

    attributeChangedCallback() {
      if (!this._mounted) return;
      this._render();
    }

    // ── property API ───────────────────────────────
    get display() { return this.getAttribute('display') || 'stairs'; }
    set display(v) { this.setAttribute('display', v); }

    get count() { return clampInt(this.getAttribute('count') || 0, 0, 10); }
    set count(v) { this.setAttribute('count', String(v)); }

    get range() {
      const raw = this.getAttribute('range') || '1,9';
      const parts = raw.split(',').map(s => Number(s.trim()));
      const a = Number.isFinite(parts[0]) ? parts[0] : 1;
      const b = Number.isFinite(parts[1]) ? parts[1] : 9;
      return [Math.min(a, b), Math.max(a, b)];
    }
    set range(v) {
      if (Array.isArray(v)) this.setAttribute('range', `${v[0]},${v[1]}`);
      else this.setAttribute('range', String(v));
    }

    get highlight() {
      const h = this.getAttribute('highlight');
      if (h == null) return null;
      const n = Number(h);
      return Number.isFinite(n) ? n : null;
    }
    set highlight(v) {
      if (v == null) this.removeAttribute('highlight');
      else this.setAttribute('highlight', String(v));
    }

    // ── public methods ─────────────────────────────
    setCount(n) { this.count = clampInt(n, 0, 10); }
    setRange(min, max) { this.range = [min, max]; }

    // ── 내부 ───────────────────────────────────────
    _render() {
      const display = this.display;
      this.innerHTML = '';
      if (display === 'stairs') this._renderStairs();
      else if (display === 'single') this._renderSingle();
      else if (display === 'row') this._renderRow();
      else this._renderStairs();
    }

    _renderStairs() {
      const [min, max] = this.range;
      const showZero = this.hasAttribute('show-zero');
      const highlightZero = this.hasAttribute('highlight-zero');
      const hl = this.highlight;
      const stage = document.createElement('div');
      stage.className = 'kedu-lc-stage';
      const row = document.createElement('div');
      row.className = 'kedu-lc-row';
      const start = (min <= 0 && !showZero) ? 1 : min;
      for (let n = start; n <= max; n++) {
        const bar = document.createElement('div');
        bar.className = 'kedu-lc-bar';
        if (hl != null && n === hl) bar.classList.add('kedu-lc-highlight');
        if (n === 0) bar.classList.add('kedu-lc-zero');
        if (n === 0 && highlightZero) bar.classList.add('kedu-lc-highlight');
        const cubes = document.createElement('div');
        cubes.className = 'kedu-lc-cubes';
        for (let i = 0; i < n; i++) {
          const c = document.createElement('div');
          c.className = 'kedu-lc-cube';
          cubes.appendChild(c);
        }
        const label = document.createElement('div');
        label.className = 'kedu-lc-label';
        label.textContent = String(n);
        bar.appendChild(cubes);
        bar.appendChild(label);
        row.appendChild(bar);
      }
      stage.appendChild(row);
      this.appendChild(stage);
    }

    _renderSingle() {
      const n = this.count;
      const stage = document.createElement('div');
      stage.className = 'kedu-lc-stage-single';
      const row = document.createElement('div');
      row.className = 'kedu-lc-row-single';
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'kedu-lc-cube-h';
        row.appendChild(c);
      }
      stage.appendChild(row);
      this.appendChild(stage);
    }

    _renderRow() {
      const n = this.count;
      const row = document.createElement('div');
      row.className = 'kedu-lc-row-plain';
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'kedu-lc-cube-h';
        row.appendChild(c);
      }
      this.appendChild(row);
    }
  }

  if (!customElements.get('kedu-linking-cube')) {
    customElements.define('kedu-linking-cube', KeduLinkingCube);
  }
})();
