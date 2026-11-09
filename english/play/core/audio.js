/* ============================================================
 * 영어 놀이터 — 효과음(PlayAudio) (게임설계 v1 §7)
 *   Web Audio 로 그 자리에서 만든다(소리 파일 0). 맛보기 4종: 등장·성공·실패(부드럽게)·콤보.
 *   첫 터치에서 PlayAudio.unlock() — 그 전에 난 소리는 버린다(나중에 몰아서 울리지 않게).
 *   AudioContext 가 없는 곳(옛 브라우저·검사 환경)에서도 예외 0 — play() 가 false 만 돌려준다.
 *   PlayAudio.play('ok'|'soft'|'combo'|'enter')
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 듣고 바꾼다 ──
     notes = [주파수(Hz), 시작(초), 길이(초)] · vol = 그 소리의 크기(0~1) · master = 전체 크기 */
  var CONF = {
    master: 0.6,
    attack: 0.012,          /* 소리가 올라오는 시간 — 짧을수록 또렷, 길수록 둥글다 */
    late: 300,              /* 잠금이 풀리기 전에 난 소리는 이 시간(ms) 안에 풀릴 때만 울린다 */
    sounds: {
      enter: { wave: 'sine',     vol: 0.22, notes: [[784, 0, 0.18], [659, 0.14, 0.30]] },                                   /* 딩-동 */
      ok:    { wave: 'triangle', vol: 0.28, notes: [[659, 0, 0.11], [988, 0.09, 0.24]] },                                   /* 맑게 두 음 위로 */
      soft:  { wave: 'sine',     vol: 0.14, notes: [[392, 0, 0.18], [349, 0.13, 0.28]] },                                   /* 낮고 작게, 살짝 아래로 */
      combo: { wave: 'triangle', vol: 0.26, notes: [[523, 0, 0.11], [659, 0.09, 0.11], [784, 0.18, 0.11], [1047, 0.27, 0.34]] } /* 도-미-솔-도 */
    }
  };
  var ctx = null, out = null, played = [];

  function ensure() {
    if (ctx) return ctx;
    var AC = g.AudioContext || g.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); out = ctx.createGain(); out.gain.value = CONF.master; out.connect(ctx.destination); }
    catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, at, dur, wave, vol) {
    var o = ctx.createOscillator(), a = ctx.createGain(), t0 = ctx.currentTime + at;
    o.type = wave; o.frequency.setValueAtTime(f, t0);
    a.gain.setValueAtTime(0.0001, t0);
    a.gain.exponentialRampToValueAtTime(vol, t0 + CONF.attack);
    a.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(a); a.connect(out);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function schedule(s) { s.notes.forEach(function (n) { tone(n[0], n[1], n[2], s.wave, s.vol); }); }

  var PlayAudio = {
    CONF: CONF,
    NAMES: Object.keys(CONF.sounds),
    available: function () { return !!(g.AudioContext || g.webkitAudioContext); },
    /* 첫 사용자 터치에서 1회 */
    unlock: function () {
      try { if (ensure() && ctx.state === 'suspended' && ctx.resume) { var p = ctx.resume(); if (p && p.catch) p.catch(function () {}); } } catch (e) {}
    },
    /* 울렸으면 true. 없는 이름·소리 장치 없음·아직 잠김 = false (예외 0) */
    play: function (name) {
      var s = CONF.sounds[name];
      if (!s) return false;
      played.push(name); if (played.length > 60) played.shift();
      try {
        if (!ensure()) return false;
        if (ctx.state === 'running' || !ctx.state) { schedule(s); return true; }
        var at = Date.now(), p = ctx.resume && ctx.resume();
        if (p && p.then) p.then(function () { try { if (Date.now() - at < CONF.late) schedule(s); } catch (e) {} }, function () {});
        return false;
      } catch (e) { return false; }
    },
    /* 요청된 소리 이름 기록(검사·점검용 — 화면 밖으로 안 나감) */
    played: function () { return played.slice(); }
  };
  g.PlayAudio = PlayAudio;
})(window);
