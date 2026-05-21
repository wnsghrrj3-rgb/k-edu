/* =====================================================
 * <kedu-self-assessment> v1.0
 *
 * 용도:
 *   차시 마무리 자기 평가 부품 (점수 집계 X, 메타인지 자리).
 *   단일 모드(별점 3택1) + 3차원 모드(차원별 별점). 학생 라이브
 *   .self-* (단일) / .self3d-* (3차원) 시각 호환.
 *
 * 사용:
 *   단일 (기본 3택 별점):
 *     <kedu-self-assessment></kedu-self-assessment>
 *
 *   단일 (보기 문구 지정):
 *     <kedu-self-assessment
 *       items="조금 어려웠어요|잘 했어요|아주 잘 했어요"></kedu-self-assessment>
 *
 *   3차원 (평가 차시):
 *     <kedu-self-assessment mode="3d"
 *       dimensions="① 지식·이해 — 수를 세고 비교할 수 있나요?|② 과정·기능 — 교구를 잘 썼나요?|③ 가치·태도 — 끝까지 노력했나요?"
 *       options="조금|잘함|매우 잘함"></kedu-self-assessment>
 *
 * attributes:
 *   mode        : single | 3d (default single)
 *   items       : single — 보기 문구. "|" 구분. (default 3개)
 *   dimensions  : 3d — 차원 라벨. "|" 구분.
 *   options     : 3d — 각 차원의 보기 문구. "|" 구분. (default "조금|잘함|매우 잘함")
 *
 * events (bubbles: true):
 *   kedu-self-assessment-pick      detail: {mode, value, ...}  — 하나 선택
 *   kedu-self-assessment-complete  detail: {mode, ...}         — (3d) 모든 차원 선택 1회
 *
 * methods:
 *   reset() — 선택 초기화
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-sa-border  #1565C0
 *   --kedu-sa-color   #1976D2
 *   --kedu-sa-star    #F57F17
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-self-assessment-style';
  const CSS = `
    kedu-self-assessment {
      display: block; box-sizing: border-box; width: 100%;
      --kedu-sa-border: var(--kedu-sa-border-override, #1565C0);
      --kedu-sa-color:  var(--kedu-sa-color-override,  #1976D2);
      --kedu-sa-star:   var(--kedu-sa-star-override,   #F57F17);
    }
    kedu-self-assessment[hidden] { display: none; }

    /* ── 단일 ── */
    kedu-self-assessment .kedu-sa-stage {
      display: flex; flex-direction: column; align-items: center; gap: clamp(14px, 2.6vw, 22px);
    }
    kedu-self-assessment .kedu-sa-row { display: flex; gap: clamp(10px, 2vw, 16px); flex-wrap: wrap; justify-content: center; }
    kedu-self-assessment .kedu-sa-btn {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-sa-border);
      border-radius: clamp(14px, 2.6vw, 22px);
      padding: clamp(12px, 2.4vw, 20px) clamp(16px, 3vw, 24px);
      cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column;
      align-items: center; gap: clamp(4px, 1vw, 8px);
    }
    kedu-self-assessment .kedu-sa-btn-stars {
      font-size: clamp(22px, 3.6vw, 32px); color: var(--kedu-sa-star); letter-spacing: 2px;
    }
    kedu-self-assessment .kedu-sa-btn-name { font-size: clamp(12px, 1.8vw, 15px); color: var(--kedu-sa-color); }
    kedu-self-assessment .kedu-sa-btn.picked {
      background: #FFF8E1; border-color: #F57C00; transform: scale(1.05);
    }
    kedu-self-assessment .kedu-sa-fb {
      min-height: 1.4em; font-size: clamp(13px, 2vw, 17px); color: #607D8B; font-weight: 700;
    }

    /* ── 3차원 ── */
    kedu-self-assessment .kedu-sa-3d-stage {
      display: flex; flex-direction: column; align-items: center; gap: clamp(14px, 2.6vw, 22px); width: 100%;
    }
    kedu-self-assessment .kedu-sa-3d-dim {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-sa-border);
      border-radius: clamp(14px, 2.6vw, 22px); padding: clamp(12px, 2.4vw, 18px);
      display: flex; flex-direction: column; align-items: center; gap: clamp(8px, 1.6vw, 14px);
      width: 100%; max-width: clamp(360px, 60vw, 540px);
    }
    kedu-self-assessment .kedu-sa-3d-label {
      font-family: 'Jua', sans-serif; font-size: clamp(14px, 2.1vw, 18px);
      color: var(--kedu-sa-color); text-align: center;
    }
    kedu-self-assessment .kedu-sa-3d-row { display: flex; gap: clamp(8px, 1.6vw, 14px); flex-wrap: wrap; justify-content: center; }
    kedu-self-assessment .kedu-sa-3d-btn {
      background: #F4F4F8; border: clamp(2px, 0.4vw, 3px) solid #E0E0E0;
      border-radius: clamp(10px, 2vw, 16px); padding: clamp(8px, 1.6vw, 14px) clamp(14px, 2.8vw, 22px);
      cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column;
      align-items: center; gap: clamp(2px, 0.4vw, 4px);
    }
    kedu-self-assessment .kedu-sa-3d-btn .stars { font-size: clamp(18px, 2.8vw, 26px); color: #BDBDBD; letter-spacing: 2px; }
    kedu-self-assessment .kedu-sa-3d-btn .name { font-size: clamp(12px, 1.9vw, 16px); color: #757575; }
    kedu-self-assessment .kedu-sa-3d-btn.picked { background: #FFF8E1; border-color: #F57C00; }
    kedu-self-assessment .kedu-sa-3d-btn.picked .stars { color: var(--kedu-sa-star); }
    kedu-self-assessment .kedu-sa-3d-btn.picked .name { color: var(--kedu-sa-color); }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function parsePipe(v) {
    if (!v) return [];
    return String(v).split('|').map(s => s.trim()).filter(s => s !== '');
  }

  function stars(n) {
    return '★'.repeat(n);
  }

  const DEFAULT_ITEMS = ['조금 어려웠어요', '잘 했어요', '아주 잘 했어요'];
  const DEFAULT_OPTIONS = ['조금', '잘함', '매우 잘함'];

  class SelfAssessment extends HTMLElement {
    static get observedAttributes() {
      return ['mode', 'items', 'dimensions', 'options'];
    }

    constructor() {
      super();
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
    get mode() { return this.getAttribute('mode') || 'single'; }
    set mode(v) { this.setAttribute('mode', String(v)); }

    // ── public methods ──
    reset() { this._build(); }

    _emit(type, detail) {
      this.dispatchEvent(new CustomEvent('kedu-self-assessment-' + type, {
        bubbles: true,
        detail: Object.assign({ mode: this.mode }, detail || {})
      }));
    }

    _build() {
      this._completed = false;
      this.innerHTML = '';
      if (this.mode === '3d') this._build3d();
      else this._buildSingle();
    }

    // ── 단일 ──
    _buildSingle() {
      const items = parsePipe(this.getAttribute('items'));
      const labels = items.length ? items : DEFAULT_ITEMS;

      const stage = document.createElement('div');
      stage.className = 'kedu-sa-stage';

      const row = document.createElement('div');
      row.className = 'kedu-sa-row';
      labels.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'kedu-sa-btn';
        btn.dataset.value = String(i + 1);
        btn.innerHTML =
          '<div class="kedu-sa-btn-stars">' + stars(i + 1) + '</div>' +
          '<div class="kedu-sa-btn-name">' + name + '</div>';
        row.appendChild(btn);
      });
      stage.appendChild(row);

      const fb = document.createElement('div');
      fb.className = 'kedu-sa-fb';
      stage.appendChild(fb);
      this.appendChild(stage);

      const btns = row.querySelectorAll('.kedu-sa-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('picked'));
          btn.classList.add('picked');
          const name = btn.querySelector('.kedu-sa-btn-name').textContent;
          fb.textContent = name + '을 골랐어요!';
          this._emit('pick', { value: parseInt(btn.dataset.value, 10), name });
        });
      });
    }

    // ── 3차원 ──
    _build3d() {
      const dims = parsePipe(this.getAttribute('dimensions'));
      const opts = parsePipe(this.getAttribute('options'));
      const options = opts.length ? opts : DEFAULT_OPTIONS;

      const stage = document.createElement('div');
      stage.className = 'kedu-sa-3d-stage';

      dims.forEach((label, di) => {
        const dim = document.createElement('div');
        dim.className = 'kedu-sa-3d-dim';
        dim.dataset.dim = String(di);

        const lbl = document.createElement('div');
        lbl.className = 'kedu-sa-3d-label';
        lbl.textContent = label;
        dim.appendChild(lbl);

        const drow = document.createElement('div');
        drow.className = 'kedu-sa-3d-row';
        options.forEach((name, oi) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kedu-sa-3d-btn';
          btn.dataset.score = String(oi + 1);
          btn.innerHTML =
            '<div class="stars">' + stars(oi + 1) + '</div>' +
            '<div class="name">' + name + '</div>';
          drow.appendChild(btn);
        });
        dim.appendChild(drow);
        stage.appendChild(dim);
      });
      this.appendChild(stage);

      const allDims = stage.querySelectorAll('.kedu-sa-3d-dim');
      const totalDims = allDims.length;

      allDims.forEach(dim => {
        const btns = dim.querySelectorAll('.kedu-sa-3d-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('picked'));
            btn.classList.add('picked');
            this._emit('pick', {
              dimension: parseInt(dim.dataset.dim, 10),
              score: parseInt(btn.dataset.score, 10)
            });
            // 모든 차원에 picked가 하나씩 있으면 완료
            let pickedCount = 0;
            allDims.forEach(d => {
              if (d.querySelector('.kedu-sa-3d-btn.picked')) pickedCount++;
            });
            if (!this._completed && pickedCount === totalDims && totalDims > 0) {
              this._completed = true;
              this._emit('complete', { dimensions: totalDims });
            }
          });
        });
      });
    }
  }

  if (!customElements.get('kedu-self-assessment')) {
    customElements.define('kedu-self-assessment', SelfAssessment);
  }
})();
