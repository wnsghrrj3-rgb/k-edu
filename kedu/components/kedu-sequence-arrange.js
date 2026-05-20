/* =====================================================
 * <kedu-sequence-arrange> v1.0
 *
 * 용도:
 *   수의 순서를 가로 카드 줄로 보여주는 정적 시각 부품 (1~9 / 9~1).
 *   카드별 상태(강조·범위·흐림·빈칸)로 빠진 수·관심 수를 표시.
 *   인터랙티브 빈칸 채우기는 <kedu-count-input> 사용.
 *
 * 사용:
 *   <kedu-sequence-arrange from="1" to="9"></kedu-sequence-arrange>
 *   <kedu-sequence-arrange from="9" to="1"></kedu-sequence-arrange>
 *   <kedu-sequence-arrange numbers="1,2,3,4,5" states="normal,highlight,blank,normal,range"></kedu-sequence-arrange>
 *
 * attributes:
 *   numbers   : 쉼표 구분 수 목록 (예 "1,2,3,4,5"). from/to 보다 우선.
 *   from, to  : numbers 미지정 시 자동 생성 범위 (to<from 이면 내림차)
 *   states    : 카드별 상태, 쉼표 구분. numbers/범위 길이에 맞춤.
 *               값: normal | highlight | range | dim | blank (빈칸은 "?" 표시)
 *   note      : 하단 설명 문구 (선택)
 *
 * events: 없음 (정적 표시 부품)
 *
 * methods:
 *   setStates(arr) — 상태 배열 갱신
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-sa-card-border  #1565C0
 *   --kedu-sa-card-color   #1976D2
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-sequence-arrange-style';
  const CSS = `
    kedu-sequence-arrange {
      display: block;
      box-sizing: border-box;
      --kedu-sa-card-border: var(--kedu-sa-card-border-override, #1565C0);
      --kedu-sa-card-color:  var(--kedu-sa-card-color-override,  #1976D2);
    }
    kedu-sequence-arrange[hidden] { display: none; }

    kedu-sequence-arrange .kedu-sa-stage {
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(12px, 2.4vw, 20px); width: 100%;
    }
    kedu-sequence-arrange .kedu-sa-row {
      display: flex; gap: clamp(4px, 0.8vw, 8px); justify-content: center;
      flex-wrap: nowrap; padding: clamp(8px, 1.6vw, 14px);
      background: #F0F7FF; border-radius: clamp(12px, 2.2vw, 18px);
      overflow-x: auto; max-width: 100%;
    }
    kedu-sequence-arrange .kedu-sa-card {
      background: white;
      border: clamp(2px, 0.4vw, 3px) solid var(--kedu-sa-card-border);
      border-radius: clamp(10px, 2vw, 16px);
      padding: clamp(8px, 1.6vw, 14px) clamp(6px, 1.2vw, 10px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(22px, 3.6vw, 32px); color: var(--kedu-sa-card-color);
      min-width: clamp(46px, 7.5vw, 64px); min-height: clamp(60px, 9.5vw, 80px);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; animation: kedu-sa-pop 0.3s ease both;
    }
    kedu-sequence-arrange .kedu-sa-card:nth-child(1) { animation-delay: 0.05s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(2) { animation-delay: 0.10s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(3) { animation-delay: 0.15s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(4) { animation-delay: 0.20s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(5) { animation-delay: 0.25s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(6) { animation-delay: 0.30s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(7) { animation-delay: 0.35s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(8) { animation-delay: 0.40s; }
    kedu-sequence-arrange .kedu-sa-card:nth-child(9) { animation-delay: 0.45s; }
    kedu-sequence-arrange .kedu-sa-card.kedu-sa-highlight {
      background: #FFE0B2; border-color: #F57C00; color: #F57C00; transform: scale(1.1);
      animation: kedu-sa-highlight 1.4s ease-in-out infinite;
    }
    kedu-sequence-arrange .kedu-sa-card.kedu-sa-range {
      background: #C8E6C9; border-color: #2E7D32; color: #2E7D32;
    }
    kedu-sequence-arrange .kedu-sa-card.kedu-sa-blank {
      background: #FFF8E1; border-style: dashed; color: #F57C00;
    }
    kedu-sequence-arrange .kedu-sa-card.kedu-sa-dim { opacity: 0.35; }
    kedu-sequence-arrange .kedu-sa-note {
      font-size: clamp(13px, 1.9vw, 17px); color: #6D4C41; text-align: center;
    }

    @keyframes kedu-sa-pop {
      from { transform: scale(0.6); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    @keyframes kedu-sa-highlight {
      0%,100% { transform: scale(1.1); }
      50% { transform: scale(1.18); }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const STATE_CLASS = {
    highlight: 'kedu-sa-highlight',
    range: 'kedu-sa-range',
    blank: 'kedu-sa-blank',
    dim: 'kedu-sa-dim'
  };

  class KeduSequenceArrange extends HTMLElement {
    static get observedAttributes() {
      return ['numbers', 'from', 'to', 'states', 'note'];
    }

    constructor() {
      super();
      this._rowEl = null;
      this._cards = [];
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

    // ── property API ───────────────────────────────
    get numbers() { return this.getAttribute('numbers') || ''; }
    set numbers(v) { this.setAttribute('numbers', v); }

    get states() { return this.getAttribute('states') || ''; }
    set states(v) { this.setAttribute('states', v); }

    get note() { return this.getAttribute('note') || ''; }
    set note(v) { this.setAttribute('note', v); }

    // ── public methods ─────────────────────────────
    setStates(arr) {
      this.setAttribute('states', Array.isArray(arr) ? arr.join(',') : String(arr));
    }

    // ── 내부 ───────────────────────────────────────
    _numList() {
      const raw = this.numbers.trim();
      if (raw) {
        return raw.split(',').map(s => s.trim());
      }
      const from = parseInt(this.getAttribute('from'), 10);
      const to = parseInt(this.getAttribute('to'), 10);
      if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
      const arr = [];
      if (from <= to) { for (let n = from; n <= to; n++) arr.push(String(n)); }
      else { for (let n = from; n >= to; n--) arr.push(String(n)); }
      return arr;
    }

    _stateList(len) {
      const raw = this.states.trim();
      const arr = raw ? raw.split(',').map(s => s.trim()) : [];
      while (arr.length < len) arr.push('normal');
      return arr;
    }

    _build() {
      const nums = this._numList();
      const states = this._stateList(nums.length);
      this.innerHTML = '';

      const stage = document.createElement('div');
      stage.className = 'kedu-sa-stage';

      const row = document.createElement('div');
      row.className = 'kedu-sa-row';
      const cards = [];
      nums.forEach((n, i) => {
        const card = document.createElement('div');
        card.className = 'kedu-sa-card';
        const st = states[i] || 'normal';
        if (STATE_CLASS[st]) card.classList.add(STATE_CLASS[st]);
        card.textContent = (st === 'blank') ? '?' : n;
        row.appendChild(card);
        cards.push(card);
      });
      stage.appendChild(row);

      const note = this.note.trim();
      if (note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'kedu-sa-note';
        noteEl.textContent = note;
        stage.appendChild(noteEl);
      }

      this.appendChild(stage);
      this._rowEl = row;
      this._cards = cards;
    }
  }

  if (!customElements.get('kedu-sequence-arrange')) {
    customElements.define('kedu-sequence-arrange', KeduSequenceArrange);
  }
})();
