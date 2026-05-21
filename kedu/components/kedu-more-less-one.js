/* =====================================================
 * <kedu-more-less-one> v1.0
 *
 * 용도:
 *   "1만큼 더 큰/작은 수" 활동 부품. 학생 라이브 .mlo-* 시각 호환.
 *   세 mode 자족: match(짝짓기) · free(버튼 탐색) · choice4(단서 4지선다).
 *
 * 사용:
 *   짝짓기 (기준 수들 → 1 큰 수와 매칭):
 *     <kedu-more-less-one mode="match" direction="more"
 *       pairs="4,5,6,7"></kedu-more-less-one>
 *
 *   자유 탐색 (기준 수에 +1/-1, 둘 다 눌러야 완료):
 *     <kedu-more-less-one mode="free" base="5"></kedu-more-less-one>
 *
 *   단서 4지선다 (? 의 1 큰 수가 6 → ? 고르기):
 *     <kedu-more-less-one mode="choice4" direction="more"
 *       result="6" options="4,5,6,7"></kedu-more-less-one>
 *
 * attributes:
 *   mode      : match | free | choice4 (필수)
 *   direction : more | less (default more) — "1만큼 더 큰/작은"
 *   pairs     : match — 기준 수 목록. 쉼표 구분. target = 각 수 ±1.
 *   base      : free — 기준 수 (default 5)
 *   result    : choice4 — 단서의 결과 수 (정답 = result ∓ 1)
 *   options   : choice4 — 보기 4개. 쉼표 구분.
 *   prompt    : 상단 안내 문구 (선택, mode별 기본값 있음)
 *
 * events (bubbles: true):
 *   kedu-more-less-one-step      detail: {mode, ...}    — 한 단계 진행
 *   kedu-more-less-one-wrong     detail: {mode, ...}    — 오답
 *   kedu-more-less-one-complete  detail: {mode}         — 활동 완료 1회
 *
 * methods:
 *   reset() — 초기 상태로 재구성
 *
 * CSS 변수 (외부 주입 우선, 내부 fallback):
 *   --kedu-mlo-border  #1565C0
 *   --kedu-mlo-color   #1976D2
 * ===================================================== */

(function () {
  'use strict';

  const STYLE_ID = 'kedu-more-less-one-style';
  const CSS = `
    kedu-more-less-one {
      display: block; box-sizing: border-box; width: 100%;
      --kedu-mlo-border: var(--kedu-mlo-border-override, #1565C0);
      --kedu-mlo-color:  var(--kedu-mlo-color-override,  #1976D2);
    }
    kedu-more-less-one[hidden] { display: none; }

    kedu-more-less-one .kedu-mlo-prompt {
      font-size: clamp(14px, 2.1vw, 19px); color: #37474F;
      font-weight: 700; text-align: center; margin-bottom: clamp(8px, 1.6vw, 14px);
    }
    kedu-more-less-one .kedu-mlo-fb {
      min-height: 1.4em; text-align: center; margin-top: clamp(8px, 1.6vw, 14px);
      font-size: clamp(13px, 2vw, 17px); color: #607D8B; font-weight: 700;
    }
    kedu-more-less-one .kedu-mlo-fb.wrong { color: #C62828; }

    /* ── match ── */
    kedu-more-less-one .kedu-mlo-match-stage {
      display: flex; flex-direction: column; gap: clamp(10px, 2vw, 18px);
      width: 100%; align-items: center;
    }
    kedu-more-less-one .kedu-mlo-match-header {
      display: flex; gap: clamp(20px, 4vw, 40px); justify-content: center;
      font-size: clamp(12px, 1.8vw, 15px); color: #607D8B; flex-wrap: wrap;
    }
    kedu-more-less-one .kedu-mlo-match-header .em {
      color: #2E7D32; font-family: 'Nunito', sans-serif; font-weight: 800;
    }
    kedu-more-less-one .kedu-mlo-match-row {
      display: flex; gap: clamp(10px, 2vw, 18px); justify-content: center; flex-wrap: wrap;
    }
    kedu-more-less-one .kedu-mlo-match-item {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-mlo-border);
      border-radius: clamp(14px, 2.6vw, 22px);
      padding: clamp(10px, 2vw, 16px) clamp(16px, 3vw, 22px);
      cursor: pointer; transition: all 0.2s;
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(26px, 4.2vw, 38px); color: var(--kedu-mlo-color);
      min-width: clamp(64px, 10vw, 86px); min-height: clamp(64px, 10vw, 86px);
      display: flex; align-items: center; justify-content: center;
    }
    kedu-more-less-one .kedu-mlo-match-item.target { color: #DC2626; }
    kedu-more-less-one .kedu-mlo-match-item.selected { border-color: #DC2626; transform: scale(1.08); }
    kedu-more-less-one .kedu-mlo-match-item.done {
      background: #C8E6C9; border-color: #2E7D32; color: #2E7D32; opacity: 0.7; pointer-events: none;
    }
    kedu-more-less-one .kedu-mlo-match-item.wrong { animation: kedu-mlo-shake 0.4s ease; border-color: #C62828; }

    /* ── free ── */
    kedu-more-less-one .kedu-mlo-int-stage {
      display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vw, 20px); width: 100%;
    }
    kedu-more-less-one .kedu-mlo-int-base {
      background: #E3F2FD; padding: clamp(12px, 2.4vw, 20px) clamp(20px, 3.6vw, 30px);
      border-radius: clamp(14px, 2.6vw, 22px); display: flex; flex-direction: column;
      align-items: center; gap: clamp(8px, 1.6vw, 14px);
    }
    kedu-more-less-one .kedu-mlo-int-base-label { font-size: clamp(12px, 1.8vw, 15px); color: var(--kedu-mlo-color); }
    kedu-more-less-one .kedu-mlo-int-base-num {
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(50px, 8vw, 80px); color: var(--kedu-mlo-color); line-height: 1;
    }
    kedu-more-less-one .kedu-mlo-int-btns { display: flex; gap: clamp(14px, 2.8vw, 24px); justify-content: center; flex-wrap: wrap; }
    kedu-more-less-one .kedu-mlo-int-btn {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-mlo-border);
      border-radius: clamp(14px, 2.6vw, 22px);
      padding: clamp(14px, 2.6vw, 22px) clamp(20px, 3.6vw, 30px);
      cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column;
      align-items: center; gap: clamp(4px, 1vw, 8px); min-width: clamp(140px, 22vw, 200px);
    }
    kedu-more-less-one .kedu-mlo-int-btn:hover { background: #E3F2FD; transform: translateY(-3px); }
    kedu-more-less-one .kedu-mlo-int-btn-icon { font-size: clamp(28px, 4.6vw, 44px); }
    kedu-more-less-one .kedu-mlo-int-btn-label { font-family: 'Jua', sans-serif; font-size: clamp(12px, 1.8vw, 15px); }
    kedu-more-less-one .kedu-mlo-int-btn.more { border-color: #2E7D32; }
    kedu-more-less-one .kedu-mlo-int-btn.more .kedu-mlo-int-btn-icon,
    kedu-more-less-one .kedu-mlo-int-btn.more .kedu-mlo-int-btn-label { color: #2E7D32; }
    kedu-more-less-one .kedu-mlo-int-btn.less { border-color: #C62828; }
    kedu-more-less-one .kedu-mlo-int-btn.less .kedu-mlo-int-btn-icon,
    kedu-more-less-one .kedu-mlo-int-btn.less .kedu-mlo-int-btn-label { color: #C62828; }
    kedu-more-less-one .kedu-mlo-int-btn.picked { transform: scale(1.05); }
    kedu-more-less-one .kedu-mlo-int-btn.picked.more { background: #C8E6C9; }
    kedu-more-less-one .kedu-mlo-int-btn.picked.less { background: #FFCDD2; }
    kedu-more-less-one .kedu-mlo-int-result {
      background: #FFF8E1; padding: clamp(10px, 2vw, 16px) clamp(16px, 3vw, 24px);
      border-radius: clamp(12px, 2.2vw, 18px); font-size: clamp(14px, 2vw, 18px);
      color: #6D4C41; display: flex; align-items: center; gap: clamp(8px, 1.6vw, 14px); min-height: 1em;
    }
    kedu-more-less-one .kedu-mlo-int-result .res-num {
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(32px, 5vw, 50px); color: #F57F17; line-height: 1;
    }

    /* ── choice4 ── */
    kedu-more-less-one .kedu-mlo-c4-stage {
      display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vw, 20px); width: 100%;
    }
    kedu-more-less-one .kedu-mlo-c4-clue {
      background: #FFF8E1; padding: clamp(12px, 2.4vw, 20px) clamp(20px, 3.6vw, 30px);
      border-radius: clamp(14px, 2.6vw, 22px); display: flex; flex-direction: column;
      align-items: center; gap: clamp(8px, 1.6vw, 14px);
    }
    kedu-more-less-one .kedu-mlo-c4-clue-label { font-family: 'Jua', sans-serif; font-size: clamp(12px, 1.8vw, 15px); color: #6D4C41; }
    kedu-more-less-one .kedu-mlo-c4-clue-eq {
      display: flex; gap: clamp(8px, 1.6vw, 14px); align-items: center;
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(28px, 4.6vw, 44px); color: var(--kedu-mlo-color);
    }
    kedu-more-less-one .kedu-mlo-c4-clue-q {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) dashed #F57C00;
      border-radius: clamp(10px, 2vw, 16px); padding: clamp(6px, 1.2vw, 10px) clamp(14px, 2.8vw, 22px); color: #F57C00;
    }
    kedu-more-less-one .kedu-mlo-c4-clue-eq .arrow { font-size: clamp(22px, 3.6vw, 32px); color: #2E7D32; }
    kedu-more-less-one .kedu-mlo-c4-clue-eq .ans { color: var(--kedu-mlo-color); }
    kedu-more-less-one .kedu-mlo-c4-opts {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(8px, 1.6vw, 14px);
      max-width: clamp(380px, 62vw, 560px); width: 100%;
    }
    kedu-more-less-one .kedu-mlo-c4-opt {
      background: white; border: clamp(2.5px, 0.45vw, 3.5px) solid var(--kedu-mlo-border);
      border-radius: clamp(14px, 2.6vw, 22px); padding: clamp(12px, 2.4vw, 20px);
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(28px, 4.6vw, 44px); color: var(--kedu-mlo-color);
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
      justify-content: center; min-height: clamp(70px, 11vw, 100px);
    }
    kedu-more-less-one .kedu-mlo-c4-opt:hover { background: #E3F2FD; }
    kedu-more-less-one .kedu-mlo-c4-opt.correct { background: #C8E6C9; border-color: #2E7D32; color: #2E7D32; }
    kedu-more-less-one .kedu-mlo-c4-opt.wrong { animation: kedu-mlo-shake 0.4s ease; border-color: #C62828; }

    @keyframes kedu-mlo-shake {
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

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  class MoreLessOne extends HTMLElement {
    static get observedAttributes() {
      return ['mode', 'direction', 'pairs', 'base', 'result', 'options', 'prompt'];
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
    get mode() { return this.getAttribute('mode') || 'match'; }
    set mode(v) { this.setAttribute('mode', String(v)); }
    get direction() { return this.getAttribute('direction') || 'more'; }
    set direction(v) { this.setAttribute('direction', String(v)); }
    get base() { return this.getAttribute('base') || '5'; }
    set base(v) { this.setAttribute('base', String(v)); }

    // ── public methods ──
    reset() { this._build(); }

    _delta() { return this.direction === 'less' ? -1 : 1; }
    _dirWord() { return this.direction === 'less' ? '더 작은' : '더 큰'; }
    _dirIcon() { return this.direction === 'less' ? '➖1' : '➕1'; }

    _fb(msg, wrong) {
      if (!this._fbEl) return;
      this._fbEl.textContent = msg || '';
      this._fbEl.classList.toggle('wrong', !!wrong);
    }

    _emit(type, detail) {
      this.dispatchEvent(new CustomEvent('kedu-more-less-one-' + type, {
        bubbles: true,
        detail: Object.assign({ mode: this.mode }, detail || {})
      }));
    }

    _build() {
      this._completed = false;
      this.innerHTML = '';

      const wrap = document.createElement('div');
      const promptTxt = (this.getAttribute('prompt') || '').trim();
      if (promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-mlo-prompt';
        p.textContent = promptTxt;
        wrap.appendChild(p);
      }

      const mode = this.mode;
      if (mode === 'free') this._buildFree(wrap, promptTxt);
      else if (mode === 'choice4') this._buildChoice4(wrap, promptTxt);
      else this._buildMatch(wrap, promptTxt);

      const fb = document.createElement('div');
      fb.className = 'kedu-mlo-fb';
      wrap.appendChild(fb);
      this._fbEl = fb;

      this.appendChild(wrap);
    }

    // ── match ──
    _buildMatch(wrap, promptTxt) {
      const delta = this._delta();
      const bases = parseList(this.getAttribute('pairs')).map(s => parseInt(s, 10));
      const stage = document.createElement('div');
      stage.className = 'kedu-mlo-match-stage';

      if (!promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-mlo-prompt';
        p.innerHTML = '각 수와 <span class="em">1만큼 ' + this._dirWord() + ' 수</span>를 짝지어요';
        stage.appendChild(p);
      }

      const header = document.createElement('div');
      header.className = 'kedu-mlo-match-header';
      header.innerHTML = '<span>기준 수</span><span class="em">1만큼 ' + this._dirWord() + ' 수</span>';
      stage.appendChild(header);

      const baseRow = document.createElement('div');
      baseRow.className = 'kedu-mlo-match-row kedu-mlo-base-row';
      bases.forEach(n => {
        const it = document.createElement('div');
        it.className = 'kedu-mlo-match-item';
        it.dataset.match = String(n + delta);
        it.textContent = String(n);
        baseRow.appendChild(it);
      });
      stage.appendChild(baseRow);

      const targets = shuffle(bases.map(n => n + delta));
      const moreRow = document.createElement('div');
      moreRow.className = 'kedu-mlo-match-row kedu-mlo-target-row';
      targets.forEach(n => {
        const it = document.createElement('div');
        it.className = 'kedu-mlo-match-item target';
        it.dataset.shape = String(n);
        it.textContent = String(n);
        moreRow.appendChild(it);
      });
      stage.appendChild(moreRow);
      wrap.appendChild(stage);

      const baseItems = baseRow.querySelectorAll('.kedu-mlo-match-item');
      const moreItems = moreRow.querySelectorAll('.kedu-mlo-match-item');
      const total = baseItems.length;
      let selected = null;
      let done = 0;

      baseItems.forEach(item => {
        item.addEventListener('click', () => {
          if (this._completed || item.classList.contains('done')) return;
          baseItems.forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          selected = item;
          this._fb('1만큼 ' + this._dirWord() + ' 수를 골라요', false);
        });
      });

      moreItems.forEach(target => {
        target.addEventListener('click', () => {
          if (this._completed || !selected) return;
          if (selected.dataset.match === target.dataset.shape) {
            selected.classList.add('done');
            target.classList.add('done');
            selected.classList.remove('selected');
            done++;
            this._emit('step', { base: parseInt(selected.textContent, 10), target: parseInt(target.textContent, 10) });
            selected = null;
            if (done === total) {
              this._completed = true;
              this._fb('모두 짝지었어요!', false);
              this._emit('complete', {});
            } else {
              this._fb('맞아요! 다음 짝도 골라요', false);
            }
          } else {
            target.classList.add('wrong');
            this._fb('기준 수 ' + (delta > 0 ? '+' : '-') + '1 인지 다시 봐요', true);
            this._emit('wrong', { picked: parseInt(target.textContent, 10) });
            setTimeout(() => target.classList.remove('wrong'), 500);
          }
        });
      });
    }

    // ── free ──
    _buildFree(wrap, promptTxt) {
      const base = parseInt(this.base, 10);
      const stage = document.createElement('div');
      stage.className = 'kedu-mlo-int-stage';

      if (!promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-mlo-prompt';
        p.textContent = '기준 수에서 한 개 더하거나 한 개 빼 보세요';
        stage.appendChild(p);
      }

      const baseBox = document.createElement('div');
      baseBox.className = 'kedu-mlo-int-base';
      baseBox.innerHTML =
        '<span class="kedu-mlo-int-base-label">기준 수</span>' +
        '<span class="kedu-mlo-int-base-num">' + base + '</span>';
      stage.appendChild(baseBox);

      const btns = document.createElement('div');
      btns.className = 'kedu-mlo-int-btns';
      btns.innerHTML =
        '<button type="button" class="kedu-mlo-int-btn more" data-action="more">' +
          '<span class="kedu-mlo-int-btn-icon">➕1</span>' +
          '<span class="kedu-mlo-int-btn-label">1만큼 더 크게</span></button>' +
        '<button type="button" class="kedu-mlo-int-btn less" data-action="less">' +
          '<span class="kedu-mlo-int-btn-icon">➖1</span>' +
          '<span class="kedu-mlo-int-btn-label">1만큼 더 작게</span></button>';
      stage.appendChild(btns);

      const result = document.createElement('div');
      result.className = 'kedu-mlo-int-result';
      result.textContent = '버튼을 눌러 봐요';
      stage.appendChild(result);
      wrap.appendChild(stage);

      const btnEls = btns.querySelectorAll('.kedu-mlo-int-btn');
      const pressed = { more: false, less: false };

      btnEls.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this._completed) return;
          const action = btn.dataset.action;
          pressed[action] = true;
          const val = action === 'more' ? base + 1 : base - 1;
          btnEls.forEach(b => b.classList.remove('picked'));
          btn.classList.add('picked');
          result.innerHTML = '결과: <span class="res-num">' + val + '</span>';
          this._emit('step', { action, value: val });
          if (pressed.more && pressed.less) {
            this._completed = true;
            btnEls.forEach(b => b.style.pointerEvents = 'none');
            this._fb('둘 다 확인했어요!', false);
            this._emit('complete', {});
          } else {
            this._fb((action === 'more' ? '➖1' : '➕1') + ' 도 눌러 봐요', false);
          }
        });
      });
    }

    // ── choice4 ──
    _buildChoice4(wrap, promptTxt) {
      const delta = this._delta();
      const result = parseInt(this.getAttribute('result'), 10);
      const answer = result - delta; // result = answer ± 1  →  answer = result ∓ 1
      const options = parseList(this.getAttribute('options')).map(s => parseInt(s, 10));

      const stage = document.createElement('div');
      stage.className = 'kedu-mlo-c4-stage';

      if (!promptTxt) {
        const p = document.createElement('div');
        p.className = 'kedu-mlo-prompt';
        p.textContent = '단서를 보고 어떤 수인지 골라요';
        stage.appendChild(p);
      }

      const clue = document.createElement('div');
      clue.className = 'kedu-mlo-c4-clue';
      clue.innerHTML =
        '<span class="kedu-mlo-c4-clue-label">어떤 수의 1만큼 ' + this._dirWord() + ' 수가 ' + result + '이에요</span>' +
        '<div class="kedu-mlo-c4-clue-eq">' +
          '<span class="kedu-mlo-c4-clue-q">?</span>' +
          '<span class="arrow">' + this._dirIcon() + '</span>' +
          '<span class="ans">' + result + '</span>' +
        '</div>';
      stage.appendChild(clue);

      const opts = document.createElement('div');
      opts.className = 'kedu-mlo-c4-opts';
      options.forEach(n => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kedu-mlo-c4-opt';
        b.dataset.num = String(n);
        b.textContent = String(n);
        opts.appendChild(b);
      });
      stage.appendChild(opts);
      wrap.appendChild(stage);

      opts.querySelectorAll('.kedu-mlo-c4-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (this._completed) return;
          const val = parseInt(btn.dataset.num, 10);
          if (val === answer) {
            btn.classList.add('correct');
            this._completed = true;
            this._fb('정답이에요!', false);
            this._emit('step', { value: val, correct: true });
            this._emit('complete', {});
          } else {
            btn.classList.add('wrong');
            this._fb('? 에 1을 ' + (delta > 0 ? '더하면' : '빼면') + ' ' + result + '이 되는 수예요', true);
            this._emit('wrong', { value: val });
            setTimeout(() => btn.classList.remove('wrong'), 500);
          }
        });
      });
    }
  }

  if (!customElements.get('kedu-more-less-one')) {
    customElements.define('kedu-more-less-one', MoreLessOne);
  }
})();
