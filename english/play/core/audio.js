/* ============================================================
 * 영어 놀이터 — 효과음(PlayAudio) (게임설계 v1 §7)
 *   Web Audio 로 그 자리에서 만든다(소리 파일 0). §15 — 따뜻한 목관·마림바 계열 짧은 음: 사인파 바탕음 + 4배음을 살짝, 배음은 더 빨리 사라진다. 전자음·버저 0.
 *   8종: 등장 enter · 성공 ok · 실패(부드럽게) soft · 콤보 3단 combo/combo2/combo3 · 완료 done · 쟁반 tray · 벨트 belt · 톡톡 pop
 *   첫 터치에서 PlayAudio.unlock() — 그 전에 난 소리는 버린다(나중에 몰아서 울리지 않게).
 *   AudioContext 가 없는 곳(옛 브라우저·검사 환경)에서도 예외 0 — play() 가 false 만 돌려준다.
 *   끄기: PlayAudio.setEnabled(false) → localStorage 'kedu-en-play-pref' 의 sound 칸.
 *     이 키는 화면 설정이라 kedu_scope 의 PREF 예외(동의 전에도 기기에 남음) — 기록·진도는 여기에 넣지 않는다.
 *   PlayAudio.play('ok') · PlayAudio.combo(1|2|3)
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 듣고 바꾼다 ──
     notes = [주파수(Hz), 시작(초), 길이(초), (있으면) 끝 주파수 — 그쪽으로 미끄러진다] · vol = 그 소리의 크기(0~1) · master = 전체 크기 */
  var CONF = {
    master: 0.6,
    attack: 0.008,          /* 소리가 올라오는 시간 — 짧을수록 또렷(나무 건반처럼 톡) */
    partials: [[1, 1, 1], [4, 0.16, 0.4], [10, 0.05, 0.18]],   /* [배수, 크기, 길이 비율] — 마림바처럼 바탕음 + 맑은 배음 */
    late: 300,              /* 잠금이 풀리기 전에 난 소리는 이 시간(ms) 안에 풀릴 때만 울린다 */
    sounds: {
      enter:  { wave: 'sine',     vol: 0.22, notes: [[784, 0, 0.18], [659, 0.14, 0.30]] },                                   /* 딩-동 */
      ok:     { wave: 'sine', vol: 0.28, notes: [[659, 0, 0.11], [988, 0.09, 0.24]] },                                   /* 맑게 두 음 위로 */
      soft:   { wave: 'sine',     vol: 0.14, notes: [[392, 0, 0.18], [349, 0.13, 0.28]] },                                   /* 낮고 작게, 살짝 아래로 */
      combo:  { wave: 'sine', vol: 0.26, notes: [[523, 0, 0.11], [659, 0.09, 0.11], [784, 0.18, 0.11], [1047, 0.27, 0.34]] },                                        /* 1단: 도-미-솔-도 */
      combo2: { wave: 'sine', vol: 0.27, notes: [[523, 0, 0.10], [659, 0.08, 0.10], [784, 0.16, 0.10], [1047, 0.24, 0.12], [1319, 0.33, 0.38]] },                    /* 2단: 한 음 더 위로 */
      combo3: { wave: 'sine', vol: 0.28, notes: [[523, 0, 0.09], [659, 0.07, 0.09], [784, 0.14, 0.09], [1047, 0.21, 0.10], [1319, 0.29, 0.10], [1568, 0.37, 0.40], [1047, 0.37, 0.40]] }, /* 3단: 끝에 두 음 겹침 */
      done:   { wave: 'sine', vol: 0.26, notes: [[392, 0, 0.12], [523, 0.10, 0.12], [659, 0.20, 0.12], [784, 0.30, 0.14], [1047, 0.42, 0.36]] },                     /* 완료: 솔-도-미-솔-도 */
      tray:   { wave: 'sine',     vol: 0.15, notes: [[420, 0, 0.14, 720]] },                                                 /* 쟁반: 슉 */
      belt:   { wave: 'sine', vol: 0.15, notes: [[147, 0, 0.07], [147, 0.12, 0.07], [147, 0.24, 0.07]] },                /* 벨트: 낮게 톡 톡 톡 */
      pop:    { wave: 'sine',     vol: 0.16, notes: [[560, 0, 0.07, 300], [640, 0.10, 0.07, 340]] }                          /* 톡톡 */
    }
  };
  var PREF_KEY = 'kedu-en-play-pref';
  var ctx = null, out = null, log = [];

  function loadPref() { try { return JSON.parse(g.localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; } }
  function savePref(p) { try { g.localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) {} }

  function ensure() {
    if (ctx) return ctx;
    var AC = g.AudioContext || g.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); out = ctx.createGain(); out.gain.value = CONF.master; out.connect(ctx.destination); }
    catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, at, dur, wave, vol, f2) {
    var o = ctx.createOscillator(), a = ctx.createGain(), t0 = ctx.currentTime + at;
    o.type = wave; o.frequency.setValueAtTime(f, t0);
    if (f2 && o.frequency.exponentialRampToValueAtTime) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    a.gain.setValueAtTime(0.0001, t0);
    a.gain.exponentialRampToValueAtTime(vol, t0 + CONF.attack);
    a.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(a); a.connect(out);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function schedule(s) {
    s.notes.forEach(function (n) {
      CONF.partials.forEach(function (p) { tone(n[0] * p[0], n[1], Math.max(0.05, n[2] * p[2]), s.wave, s.vol * p[1], n[3] ? n[3] * p[0] : 0); });
    });
  }

  var PlayAudio = {
    CONF: CONF, PREF_KEY: PREF_KEY,
    NAMES: Object.keys(CONF.sounds),
    COMBO: ['combo', 'combo2', 'combo3'],
    available: function () { return !!(g.AudioContext || g.webkitAudioContext); },
    /* 효과음 켜짐? (설정에 sound:false 가 있을 때만 꺼짐) */
    enabled: function () { return loadPref().sound !== false; },
    setEnabled: function (on) { var p = loadPref(); p.sound = !!on; savePref(p); return !!on; },
    /* 첫 사용자 터치에서 1회 */
    unlock: function () {
      try { if (ensure() && ctx.state === 'suspended' && ctx.resume) { var p = ctx.resume(); if (p && p.catch) p.catch(function () {}); } } catch (e) {}
    },
    /* 울렸으면 true. 없는 이름·꺼짐·소리 장치 없음·아직 잠김 = false (예외 0) */
    play: function (name) {
      var s = CONF.sounds[name];
      if (!s) return false;
      if (!this.enabled()) return false;
      log.push({ name: name, at: Date.now() }); if (log.length > 80) log.shift();
      try {
        if (!ensure()) return false;
        if (ctx.state === 'running' || !ctx.state) { schedule(s); return true; }
        var at = Date.now(), p = ctx.resume && ctx.resume();
        if (p && p.then) p.then(function () { try { if (Date.now() - at < CONF.late) schedule(s); } catch (e) {} }, function () {});
        return false;
      } catch (e) { return false; }
    },
    /* 콤보 1·2·3단 */
    combo: function (level) { return this.play(this.COMBO[Math.max(1, Math.min(3, level || 1)) - 1]); },
    /* 요청된 소리 기록(검사·점검용 — 화면 밖으로 안 나감) */
    played: function () { return log.map(function (x) { return x.name; }); },
    log: function () { return log.slice(); }
  };
  g.PlayAudio = PlayAudio;
})(window);
