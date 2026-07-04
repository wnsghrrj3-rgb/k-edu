/* klab3-2d.js — 케이랩 v3 · B트랙(프리미엄 2D) 공용 런타임
   설계서 §2-B·§2-C. 클래식 스크립트(모듈 아님) = jsdom에서 그대로 실행 가능.
   제공: window.K3 = { sound, toast, cards, NOISE }
   - sound: KLab.sound 계승 v3 재튜닝(둔탁한 나무 톡·유리 팅·성공 차임). AudioContext 없으면 무음 no-op(테스트 안전).
   - toast/cards: klab3-ui.css의 .k3-toast/.k3-card 클래스 사용(2D 전용 비모듈판).
   - NOISE: feTurbulence 노이즈 dataURI 1장(§2-B 3번 — 플랫함 제거 공용 상수). */
(function () {
  'use strict';
  if (window.K3) return;

  /* ── 노이즈 텍스처 (공용 상수) ── */
  var NOISE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
    '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>' +
    '<feColorMatrix type="saturate" values="0"/></filter>' +
    '<rect width="120" height="120" filter="url(%23n)" opacity="0.55"/></svg>');

  /* ── 사운드: Web Audio 합성 (v3 톤) ── */
  var AC = window.AudioContext || window.webkitAudioContext || null;
  var ctx = null, master = null, on = true;
  function ac() {
    if (!AC) return null;
    if (!ctx) {
      try { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
      catch (e) { AC = null; return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function env(node, t0, a, peak, d) { // 어택-디케이 게인 봉투
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(g); g.connect(master);
    return g;
  }
  function osc(type, f0, t0, dur, peak, f1) {
    var o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    env(o, t0, 0.004, peak, dur);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noiseBuf() {
    var b = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  var _nb = null;
  function noise(t0, dur, peak, fc0, fc1, type) {
    if (!_nb) _nb = noiseBuf();
    var s = ctx.createBufferSource(); s.buffer = _nb; s.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type || 'bandpass';
    f.frequency.setValueAtTime(fc0, t0);
    if (fc1) f.frequency.exponentialRampToValueAtTime(fc1, t0 + dur);
    f.Q.value = 1.1;
    s.connect(f); env(f, t0, 0.003, peak, dur);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }
  var TONES = {
    /* 둔탁한 나무 톡 — 똑딱·배치 */
    tick:   function (t) { osc('sine', 190, t, 0.055, 0.5, 120); noise(t, 0.03, 0.22, 1500, 500); },
    tap:    function (t) { osc('sine', 240, t, 0.06, 0.42, 150); },
    select: function (t) { osc('triangle', 460, t, 0.07, 0.3, 380); },
    pop:    function (t) { osc('sine', 330, t, 0.09, 0.5, 620); },
    /* 유리 팅 — 마법 순간 */
    ting:   function (t) { osc('sine', 1560, t, 0.5, 0.34); osc('sine', 2340, t, 0.32, 0.14); },
    whoosh: function (t) { noise(t, 0.42, 0.4, 300, 2400); },
    charge: function (t) { osc('sine', 300, t, 0.4, 0.3, 900); },
    /* 성공 차임 (3음) */
    chime:  function (t) { osc('triangle', 660, t, 0.24, 0.34); osc('triangle', 830, t + 0.11, 0.24, 0.34); osc('triangle', 990, t + 0.22, 0.4, 0.36); },
    fail:   function (t) { osc('square', 220, t, 0.16, 0.16, 150); osc('square', 160, t + 0.14, 0.22, 0.16, 110); }
  };
  var sound = {
    get on() { return on; },
    setOn: function (v) { on = !!v; },
    play: function (name) {
      if (!on || !TONES[name]) return;
      var c = ac(); if (!c) return;
      try { TONES[name](c.currentTime + 0.01); } catch (e) {}
    }
  };

  /* ── 토스트 ── */
  var toastEl = null, toastTimer = null;
  function toast(msg, warn, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'k3-toast hide'; document.body.appendChild(toastEl); }
    toastEl.innerHTML = msg;
    toastEl.classList.toggle('warn', !!warn);
    toastEl.classList.remove('hide');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('hide'); }, ms || 3200);
  }

  /* ── 예측/결과 카드 (Promise) ── */
  var cardEl = null;
  function cardHost() {
    if (!cardEl) { cardEl = document.createElement('div'); cardEl.className = 'k3-card hide'; document.body.appendChild(cardEl); }
    return cardEl;
  }
  function predict(question, options, bottom) {
    var el = cardHost();
    el.style.bottom = bottom || '110px'; el.style.top = '';
    return new Promise(function (res) {
      el.innerHTML = '<h3>🔮 ' + question + '</h3><div class="opts"></div>';
      var box = el.querySelector('.opts');
      options.forEach(function (o) {
        var b = document.createElement('button');
        b.textContent = o.label;
        b.addEventListener('click', function () { el.classList.add('hide'); res(o.id); });
        box.appendChild(b);
      });
      el.classList.remove('hide');
    });
  }
  function result(html, buttons, bottom) {
    var el = cardHost();
    el.style.bottom = bottom || '110px'; el.style.top = '';
    return new Promise(function (res) {
      el.innerHTML = html + '<div class="opts" style="flex-direction:row;margin-top:12px"></div>';
      var box = el.querySelector('.opts');
      (buttons || [{ label: '확인', cls: 'pri', value: true }]).forEach(function (o) {
        var b = document.createElement('button');
        b.textContent = o.label;
        if (o.cls) b.className = o.cls;
        b.style.flex = '1';
        b.addEventListener('click', function () { el.classList.add('hide'); res(o.value); });
        box.appendChild(b);
      });
      el.classList.remove('hide');
    });
  }

  window.K3 = {
    NOISE: NOISE,
    sound: sound,
    toast: toast,
    cards: { predict: predict, result: result, hide: function () { if (cardEl) cardEl.classList.add('hide'); } }
  };
})();
