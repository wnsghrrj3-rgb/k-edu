/* =====================================================
 * <kedu-position-picker> v1.0
 *
 * 용도:
 *   카드 풀에서 정해진 순서대로 카드를 골라 수 배열의 빈칸을 채우는
 *   부품. "빠진 수 찾기"·"거꾸로 세기" 등에 사용. 학생 라이브
 *   .order-pick / .order-card + .num-row / .num-box 시각 호환.
 *
 * 사용:
 *   빠진 수 채우기 (sequence의 ? 를 풀의 카드로 순서대로):
 *     <kedu-position-picker
 *       sequence="0,1,?,3,4,?,6,7,8,9"
 *       pool="5,2,7"
 *       answers="2,5"
 *       prompt="빠진 수 2개를 찾아요!"></kedu-position-picker>
 *
 *   거꾸로 세기 (빈 줄을 큰 수부터 채움):
 *     <kedu-position-picker
 *       sequence="?,?,?,?,?"
 *       pool="5,9,3,7,1"
 *       answers="9,7,5,3,1"
 *       prompt="큰 수부터 순서대로!"></kedu-position-picker>
 *
 * attributes:
 *   sequence : 수 배열. 쉼표 구분. "?" = 빈칸. 그 외 = 고정 표시.
 *   pool     : 고를 카드 풀. 쉼표 구분.
 *   answers  : 빈칸을 채울 정답 순서. 쉼표 구분. sequence의 ? 등장 순.
 *   prompt   : 상단 안내 문구 (선택)
 *
 * events (bubbles: true):
 *   kedu-position-picker-fill      detail: {step, value}            — 한 칸 채움
 *   kedu-position-picker-wrong     detail: {value, expected}        — 순서 오답
 *   kedu-position-picker-complete  detail: {values}                 — 모두 채움
 *
 * methods:
 *   reset() — 초기화
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-pp-border  #1565C0
 *   --kedu-pp-color   #1976D2
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-position-picker-style';
  const CSS = `
    kedu-position-picker {
      display: block; box-sizing: border-box; width: 100%;
      --kedu-pp-border: var(--kedu-pp-border-override, #1565C0);
      --kedu-pp-color:  var(--kedu-pp-color-override,  #1976D2);
    }
    kedu-position-picker[hidden] { display: none; }

    kedu-position-picker .kedu-pp-stage {
      display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vw, 20px); width: 100%;
    }
    kedu-position-picker .kedu-pp-prompt {
      font-size: clamp(14px, 2.1vw, 19px); color: #37474F; font-weight: 700; text-align: center;
    }
    kedu-position-picker .kedu-pp-row {
      display: flex; gap: clamp(4px, 0.8vw, 8px); justify-content: center; flex-wrap: nowrap;
      padding: clamp(8px, 1.6vw, 14px); background: #F0F7FF;
      border-radius: clamp(12px, 2.2vw, 18px); overflow-x: auto; max-width: 100%;
    }
    kedu-position-picker .kedu-pp-box {
      background: white; border: clamp(2px, 0.4vw, 3px) solid var(--kedu-pp-border);
      border-radius: clamp(10px, 2vw, 16px); padding: clamp(8px, 1.6vw, 14px) clamp(6px, 1.2vw, 10px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(22px, 3.6vw, 32px); color: var(--kedu-pp-color);
      min-width: clamp(46px, 7.5vw, 64px); min-height: clamp(60px, 9.5vw, 80px);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    kedu-position-picker .kedu-pp-box.blank {
      background: #FFF8E1; border-style: dashed; color: #F57C00;
    }
    kedu-position-picker .kedu-pp-box.active {
      box-shadow: 0 0 0 4px rgba(245,124,0,0.3); border-color: #F57C00;
    }
    kedu-position-picker .kedu-pp-box.done {
      background: #C8E6C9; border-style: solid; border-color: #2E7D32; color: #2E7D32;
    }
    kedu-position-picker .kedu-pp-pick {
      display: flex; gap: clamp(8px, 1.6vw, 14px); justify-content: center; flex-wrap: wrap;
    }
    kedu-position-picker .kedu-pp-card {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-pp-border);
      border-radius: clamp(14px, 2.6vw, 22px);
      min-width: clamp(56px, 9vw, 72px); min-height: clamp(56px, 9vw, 72px);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(26px, 4.2vw, 36px); color: var(--kedu-pp-color);
      cursor: pointer; transition: all 0.2s;
    }
    kedu-position-picker .kedu-pp-card:hover { background: #E3F2FD; transform: translateY(-3px); }
    kedu-position-picker .kedu-pp-card.used { opacity: 0.3; pointer-events: none; }
    kedu-position-picker .kedu-pp-card.wrong { animation: kedu-pp-shake 0.4s ease; border-color: #C62828; }
    kedu-position-picker .kedu-pp-fb {
      min-height: 1.4em; font-size: clamp(13px, 2vw, 17px); color: #607D8B; font-weight: 700; text-align: center;
    }
    kedu-position-picker .kedu-pp-fb.good { color: #2E7D32; }
    kedu-position-picker .kedu-pp-fb.bad { color: #C62828; }

    @keyframes kedu-pp-shake {
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

  class PositionPicker extends HTMLElement {
    static get observedAttributes() {
      return ['sequence', 'pool', 'answers', 'prompt'];
    }

    constructor() {
      super();
      this._step = 0;
      this._answers = [];
      this._blanks = [];
      this._filled = {};
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
    get sequence() { return this.getAttribute('sequence') || ''; }
    set sequence(v) { this.setAttribute('sequence', String(v)); }
    get pool() { return this.getAttribute('pool') || ''; }
    set pool(v) { this.setAttribute('pool', String(v)); }
    get answers() { return this.getAttribute('answers') || ''; }
    set answers(v) { this.setAttribute('answers', String(v)); }

    // ── public methods ──
    reset() { this._build(); }

    _build() {
      this._step = 0;
      this._filled = {};
      this._completed = false;
      this._answers = parseList(this.answers);
      this.innerHTML = '';

      const stage = document.createElement('div');
      stage.className = 'kedu-pp-stage';

      const promptTxt = (this.getAttribute('prompt') || '').trim();
      if (promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-pp-prompt';
        p.textContent = promptTxt;
        stage.appendChild(p);
      }

      const row = document.createElement('div');
      row.className = 'kedu-pp-row';
      const blanks = [];
      let bi = 0;
      parseList(this.sequence).forEach(c => {
        const box = document.createElement('div');
        box.className = 'kedu-pp-box';
        if (c === '?') {
          box.classList.add('blank');
          box.dataset.blankIndex = String(bi);
          box.textContent = '?';
          blanks.push(box);
          bi++;
        } else {
          box.textContent = c;
        }
        row.appendChild(box);
      });
      stage.appendChild(row);
      this._blanks = blanks;

      const pick = document.createElement('div');
      pick.className = 'kedu-pp-pick';
      parseList(this.pool).forEach(v => {
        const card = document.createElement('div');
        card.className = 'kedu-pp-card';
        card.dataset.value = v;
        card.textContent = v;
        card.addEventListener('click', () => this._pick(card, v));
        pick.appendChild(card);
      });
      stage.appendChild(pick);

      const fb = document.createElement('div');
      fb.className = 'kedu-pp-fb';
      stage.appendChild(fb);
      this._fbEl = fb;

      this.appendChild(stage);
      this._markActive();
    }

    _markActive() {
      this._blanks.forEach(b => b.classList.remove('active'));
      const target = this._blanks[this._step];
      if (target && !target.classList.contains('done')) target.classList.add('active');
    }

    _pick(card, value) {
      if (this._completed) return;
      const expected = this._answers[this._step];
      if (value === expected) {
        const slot = this._blanks[this._step];
        slot.textContent = value;
        slot.classList.remove('blank', 'active');
        slot.classList.add('done');
        card.classList.add('used');
        this._filled[this._step] = value;
        this.dispatchEvent(new CustomEvent('kedu-position-picker-fill', {
          bubbles: true, detail: { step: this._step, value }
        }));
        this._step++;
        if (this._step >= this._answers.length) {
          this._completed = true;
          this._fb('모두 찾았어요!', 'good');
          this.dispatchEvent(new CustomEvent('kedu-position-picker-complete', {
            bubbles: true, detail: { values: Object.assign({}, this._filled) }
          }));
        } else {
          this._fb('좋아요! 다음 칸도 채워요', 'good');
          this._markActive();
        }
      } else {
        card.classList.add('wrong');
        this._fb('순서를 다시 살펴봐요', 'bad');
        this.dispatchEvent(new CustomEvent('kedu-position-picker-wrong', {
          bubbles: true, detail: { value, expected: expected ?? null }
        }));
        setTimeout(() => card.classList.remove('wrong'), 450);
      }
    }

    _fb(msg, cls) {
      if (!this._fbEl) return;
      this._fbEl.textContent = msg || '';
      this._fbEl.className = 'kedu-pp-fb' + (cls ? ' ' + cls : '');
    }
  }

  if (!customElements.get('kedu-position-picker')) {
    customElements.define('kedu-position-picker', PositionPicker);
  }
})();
