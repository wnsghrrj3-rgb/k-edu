/* ============================================================================
   K-edu 케이배틀(KBattle) — 1층 문제 어댑터 · 유형 4종 (①②⑤⑦)
   ----------------------------------------------------------------------------
   헌법 근거: kbattle/KBATTLE_헌법.md 제2조(스키마·유형)·제3조(배점).

   역할:
     - 문제 공통 스키마 검증(validate) — payload/answer만 유형별로 다름.
     - 유형별 렌더러(render) — 참가자 화면. 조작은 탭만(타이핑 없음).
       ① mcq  객관식(4지)   ② ox  OX   ⑤ numpad  숫자 입력   ⑦ order  순서 배열
     - 채점(grade) — 유형별 정오 판정. 렌더러와 분리(모드 연출이 유형을 몰라도 됨).
     - 배점(score) — 제3조 공식. 오답 0점 감점 없음.

   설계 메모:
     - ⑦ order 조작은 "탭-어펜딩"(항목 탭 → 순서대로 담김, 담긴 것 탭 → 해제)로 구현.
       헌법 표기는 드래그지만 저사양·저학년(제0조)에서 탭이 더 안전 — 드래그는 후속 폴리시.
       (이 결정은 _KBATTLE_STATUS.md에 기록)
     - 시간 측정은 렌더러가 mount 시각부터 elapsedMs로 넘긴다. 남은시간비율은
       호출자(대결 코어)가 timeLimit 기준으로 환산 — 케이플 speed-quiz의
       "참가자 로컬 delta" 방식 승계(기기·서버 시계 무관).
     - 코어/모드는 이 모듈만 알면 됨: KBQ.render(q, el, onAnswer) / KBQ.grade(q, resp).
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  if (root.KBQ) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var TYPES = ['mcq', 'ox', 'numpad', 'order']; // ①②⑤⑦ — 이후 12종까지 증식

  /* ---------------- 스키마 검증 ---------------- */
  // 공통 필드: id, type, difficulty(1~3), gradeBand(저/중/고), concept,
  //            prompt{text,image,audio}, payload, answer, timeLimit(초)
  // opts.pub = true → 정답·gradeBand 검사 생략. KP-1로 answer를 벗겨 전파한
  //   "공개 문제"를 참가자 렌더러가 받을 때 쓴다(정답은 호스트만 안다).
  function validate(q, opts) {
    var pub = !!(opts && opts.pub);
    var errs = [];
    if (!q || typeof q !== 'object') return ['문제가 객체가 아님'];
    if (!q.id) errs.push('id 없음');
    if (TYPES.indexOf(q.type) < 0) errs.push('미지원 type: ' + q.type);
    if (!(q.difficulty >= 1 && q.difficulty <= 3)) errs.push('difficulty 1~3 아님');
    if (!pub && ['저', '중', '고'].indexOf(q.gradeBand) < 0) errs.push('gradeBand 저/중/고 아님');
    if (!q.prompt || typeof q.prompt.text !== 'string' || !q.prompt.text) errs.push('prompt.text 없음');
    if (!(q.timeLimit > 0)) errs.push('timeLimit 양수 아님');

    var p = q.payload, a = q.answer;
    if (pub) { // 공개 문제: payload 형태만 확인
      if (q.type === 'mcq' && !(p && Array.isArray(p.choices) && p.choices.length === 4)) errs.push('mcq: choices 4개 아님');
      if (q.type === 'order' && !(p && Array.isArray(p.items) && p.items.length >= 3 && p.items.length <= 6)) errs.push('order: items 3~6개 아님');
      return errs;
    }
    if (q.type === 'mcq') {
      if (!p || !Array.isArray(p.choices) || p.choices.length !== 4) errs.push('mcq: choices 4개 아님');
      else if (!(a && a.index >= 0 && a.index < 4)) errs.push('mcq: answer.index 0~3 아님');
    } else if (q.type === 'ox') {
      if (!(a && (a.value === true || a.value === false))) errs.push('ox: answer.value 불리언 아님');
    } else if (q.type === 'numpad') {
      if (!(a && typeof a.value === 'number' && isFinite(a.value))) errs.push('numpad: answer.value 수 아님');
      else if (a.value < 0 && !(p && p.allowMinus)) errs.push('numpad: 음수 정답인데 allowMinus 없음');
    } else if (q.type === 'order') {
      if (!p || !Array.isArray(p.items) || p.items.length < 3 || p.items.length > 6) errs.push('order: items 3~6개 아님');
      else {
        if (!(a && Array.isArray(a.sequence) && a.sequence.length === p.items.length)) errs.push('order: answer.sequence 길이 불일치');
        else {
          var seen = {};
          for (var i = 0; i < a.sequence.length; i++) {
            var v = a.sequence[i];
            if (!(v >= 0 && v < p.items.length) || seen[v]) { errs.push('order: sequence가 items 순열 아님'); break; }
            seen[v] = 1;
          }
        }
      }
    }
    return errs;
  }

  /* ---------------- 채점 ---------------- */
  // response 모양(렌더러가 만드는 것과 동일):
  //   mcq    { index }        ox { value }
  //   numpad { value }        order { sequence:[...] }
  function grade(q, resp) {
    if (!resp) return false;
    if (q.type === 'mcq') return resp.index === q.answer.index;
    if (q.type === 'ox') return resp.value === q.answer.value;
    if (q.type === 'numpad') return Number(resp.value) === q.answer.value;
    if (q.type === 'order') {
      var a = q.answer.sequence, r = resp.sequence;
      if (!Array.isArray(r) || r.length !== a.length) return false;
      for (var i = 0; i < a.length; i++) if (r[i] !== a[i]) return false;
      return true;
    }
    return false;
  }

  /* ---------------- 배점 (헌법 제3조) ---------------- */
  var BASE = 100;
  var MULT = { 1: 1.0, 2: 1.5, 3: 2.2 };
  var SPEED_MAX = 30;
  function streakBonus(streak) { // 도달 시 1회 지급
    if (streak === 3) return 20;
    if (streak === 5) return 50;
    if (streak === 7) return 100;
    return 0;
  }
  // opts = { correct, difficulty, remainRatio(0~1), streak(이번 정답 반영 후 연속 수) }
  function score(opts) {
    if (!opts || !opts.correct) return 0; // 오답 0점, 감점 없음
    var mult = MULT[opts.difficulty] || 1.0;
    var rr = Math.max(0, Math.min(1, opts.remainRatio || 0));
    return Math.round(BASE * mult + rr * SPEED_MAX + streakBonus(opts.streak | 0));
  }

  /* ---------------- 렌더러 (참가자 화면 · 탭 전용) ---------------- */
  // KBQ.render(q, el, onAnswer)
  //   onAnswer({ response, elapsedMs }) — 1문제 1응답, 응답 후 입력 잠금.
  // 화면엔 문제·조작만. 등급·XP·타인 점수 노출 없음(헌법 제5조, KB-2).
  function now() { return (root.performance && root.performance.now) ? root.performance.now() : Date.now(); }

  function lockAll(el) {
    var btns = el.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  }

  function promptHtml(q) {
    return '<div class="kb-prompt">' +
      (q.prompt.image ? '<img class="kb-prompt-img" src="' + esc(q.prompt.image) + '" alt="">' : '') +
      '<div class="kb-prompt-text">' + esc(q.prompt.text) + '</div>' +
    '</div>';
  }

  function renderMcq(q, el, done) {
    el.innerHTML = promptHtml(q) +
      '<div class="kb-choices">' + q.payload.choices.map(function (c, i) {
        return '<button class="kb-choice" data-i="' + i + '">' + esc(c) + '</button>';
      }).join('') + '</div>';
    var btns = el.querySelectorAll('.kb-choice');
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function () {
        var idx = Number(this.getAttribute('data-i'));
        this.classList.add('kb-picked'); lockAll(el);
        done({ index: idx });
      };
    }
  }

  function renderOx(q, el, done) {
    el.innerHTML = promptHtml(q) +
      '<div class="kb-ox">' +
        '<button class="kb-ox-btn kb-o" data-v="1">O</button>' +
        '<button class="kb-ox-btn kb-x" data-v="0">X</button>' +
      '</div>';
    var btns = el.querySelectorAll('.kb-ox-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function () {
        this.classList.add('kb-picked'); lockAll(el);
        done({ value: this.getAttribute('data-v') === '1' });
      };
    }
  }

  function renderNumpad(q, el, done) {
    var allowMinus = !!(q.payload && q.payload.allowMinus);
    var buf = '';
    el.innerHTML = promptHtml(q) +
      '<div class="kb-num-display" id="kbNumDisp">&nbsp;</div>' +
      '<div class="kb-numpad">' +
        [1,2,3,4,5,6,7,8,9].map(function (d) { return '<button class="kb-key" data-k="' + d + '">' + d + '</button>'; }).join('') +
        (allowMinus ? '<button class="kb-key" data-k="-">−</button>' : '<button class="kb-key kb-key-blank" disabled></button>') +
        '<button class="kb-key" data-k="0">0</button>' +
        '<button class="kb-key kb-key-del" data-k="del">⌫</button>' +
      '</div>' +
      '<button class="kb-confirm" id="kbConfirm" disabled>확인</button>';
    var disp = el.querySelector('#kbNumDisp');
    var confirm = el.querySelector('#kbConfirm');
    function refresh() {
      disp.textContent = buf || '\u00a0';
      confirm.disabled = !(buf && buf !== '-');
    }
    var keys = el.querySelectorAll('.kb-key');
    for (var i = 0; i < keys.length; i++) {
      keys[i].onclick = function () {
        var k = this.getAttribute('data-k');
        if (k === 'del') buf = buf.slice(0, -1);
        else if (k === '-') { if (!buf) buf = '-'; }
        else if (buf.replace('-', '').length < 7) buf += k; // 자릿수 상한
        refresh();
      };
    }
    confirm.onclick = function () { lockAll(el); done({ value: Number(buf) }); };
    refresh();
  }

  function renderOrder(q, el, done) {
    var items = q.payload.items;
    var picked = []; // item index 순서
    el.innerHTML = promptHtml(q) +
      '<div class="kb-order-slots" id="kbSlots"></div>' +
      '<div class="kb-order-pool">' + items.map(function (it, i) {
        return '<button class="kb-order-item" data-i="' + i + '">' + esc(it) + '</button>';
      }).join('') + '</div>' +
      '<button class="kb-confirm" id="kbConfirm" disabled>확인</button>';
    var slots = el.querySelector('#kbSlots');
    var confirm = el.querySelector('#kbConfirm');
    function refresh() {
      slots.innerHTML = picked.length
        ? picked.map(function (i, pos) {
            return '<button class="kb-order-slot" data-pos="' + pos + '">' + (pos + 1) + '. ' + esc(items[i]) + '</button>';
          }).join('')
        : '<span class="kb-dim">순서대로 눌러 담아요</span>';
      var pool = el.querySelectorAll('.kb-order-item');
      for (var i = 0; i < pool.length; i++) {
        var used = picked.indexOf(Number(pool[i].getAttribute('data-i'))) >= 0;
        pool[i].disabled = used;
        pool[i].classList.toggle('kb-used', used);
      }
      var sBtns = slots.querySelectorAll('.kb-order-slot');
      for (var s = 0; s < sBtns.length; s++) {
        sBtns[s].onclick = function () { // 담긴 것 탭 → 해제
          picked.splice(Number(this.getAttribute('data-pos')), 1);
          refresh();
        };
      }
      confirm.disabled = picked.length !== items.length;
    }
    var pool = el.querySelectorAll('.kb-order-item');
    for (var i = 0; i < pool.length; i++) {
      pool[i].onclick = function () {
        picked.push(Number(this.getAttribute('data-i')));
        refresh();
      };
    }
    confirm.onclick = function () { lockAll(el); done({ sequence: picked.slice() }); };
    refresh();
  }

  var RENDERERS = { mcq: renderMcq, ox: renderOx, numpad: renderNumpad, order: renderOrder };

  function render(q, el, onAnswer) {
    var errs = validate(q, { pub: true }); // 참가자는 정답 없는 공개 문제를 받음(KP-1)
    if (errs.length) { el.innerHTML = '<div class="kb-error">문제 형식 오류</div>'; return false; }
    var t0 = now();
    var fired = false;
    RENDERERS[q.type](q, el, function (response) {
      if (fired) return; fired = true; // 1문제 1응답
      onAnswer({ response: response, elapsedMs: Math.max(0, now() - t0) });
    });
    return true;
  }

  /* ---------------- 샘플 문제 (PoC용 · 학습 모드는 차시 문제.json 주입) ---------------- */
  var SAMPLE = [
    { id: 'kb-poc-01', type: 'mcq', difficulty: 1, gradeBand: '저', concept: '덧셈',
      prompt: { text: '5 + 3 은?', image: null, audio: null },
      payload: { choices: ['6', '7', '8', '9'] }, answer: { index: 2 }, timeLimit: 20 },
    { id: 'kb-poc-02', type: 'ox', difficulty: 1, gradeBand: '저', concept: '수 비교',
      prompt: { text: '9는 7보다 큽니다.', image: null, audio: null },
      payload: {}, answer: { value: true }, timeLimit: 10 },
    { id: 'kb-poc-03', type: 'numpad', difficulty: 2, gradeBand: '저', concept: '받아올림 덧셈',
      prompt: { text: '27 + 15 = ?', image: null, audio: null },
      payload: {}, answer: { value: 42 }, timeLimit: 30 },
    { id: 'kb-poc-04', type: 'order', difficulty: 2, gradeBand: '중', concept: '크기 순서',
      prompt: { text: '작은 수부터 순서대로 담아요.', image: null, audio: null },
      payload: { items: ['34', '7', '120', '58'] }, answer: { sequence: [1, 0, 3, 2] }, timeLimit: 40 }
  ];

  root.KBQ = {
    TYPES: TYPES,
    validate: validate,
    grade: grade,
    score: score,
    render: render,
    SAMPLE: SAMPLE,
    _streakBonus: streakBonus // 테스트용
  };
})();
