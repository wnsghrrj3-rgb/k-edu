/* ============================================================
 * 영어 놀이터 — 메아리(PlayEcho) #35 · 목소리 켜짐(PlayVoice) (설계 v2 §4-35 · 한 해 길 v1 §3)
 *   메아리: 내 목소리를 바로 다시 들려준다(시범 → 내 소리). 판정 0 — 놀이가 아니라 말하기 놀이들에 붙는 단추.
 *     녹음은 이 화면의 메모리 안에서만 — 한 번 들려준 뒤 바로 버린다. 기기 저장 0 · 서버 전송 0. 마이크가 없으면 단추가 없다.
 *   목소리 켜짐: 소리 챈트(#37)의 낱말 자리에서 「목소리가 켜졌는지」만 본다 — 마이크 소리 크기뿐, 무슨 말인지는 보지 않는다. 기기 안에서만.
 *   상수는 CONF 한 곳.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    echoMs: 2500,        /* 메아리 한 번 녹음 길이(ms) */
    voiceLevel: 0.06,    /* 목소리가 켜졌다고 보는 크기(0~1) */
    voiceMs: 120         /* 그 크기가 이만큼 이어지면 켜진 것 */
  };
  function media() { return g.navigator && g.navigator.mediaDevices && g.navigator.mediaDevices.getUserMedia ? g.navigator.mediaDevices : null; }

  var PlayEcho = {
    CONF: CONF,
    available: function () { return !!(media() && g.MediaRecorder); },
    /* 한 번 듣고 바로 들려준다. → Promise(bool 들려줬나). 남는 것 0 */
    once: function (ms) {
      if (!this.available()) return Promise.resolve(false);
      return media().getUserMedia({ audio: true }).then(function (stream) {
        return new Promise(function (resolve) {
          var chunks = [], rec = new g.MediaRecorder(stream);
          rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
          rec.onstop = function () {
            stream.getTracks().forEach(function (t) { t.stop(); });
            if (!chunks.length) return resolve(false);
            var url = g.URL.createObjectURL(new g.Blob(chunks)), a = new g.Audio(url);
            var done = function (v) { try { g.URL.revokeObjectURL(url); } catch (e) {} chunks = []; resolve(v); };      /* 들려준 뒤 바로 버린다 */
            a.onended = function () { done(true); }; a.onerror = function () { done(false); };
            var p = a.play(); if (p && p.catch) p.catch(function () { done(false); });
          };
          rec.start(); setTimeout(function () { try { rec.stop(); } catch (e) { resolve(false); } }, ms || CONF.echoMs);
        });
      }).catch(function () { return false; });
    },
    /* 말하기 놀이에 붙이는 단추 — 마이크가 없으면 null */
    button: function (host) {
      if (!this.available() || !host) return null;
      var b = g.document.createElement('button'); b.type = 'button'; b.className = 'echo'; b.title = '메아리 — 내 소리 듣기';
      b.innerHTML = g.PlayIcon ? g.PlayIcon.html('radio') : '';
      b.onclick = function () { if (b.classList.contains('on')) return; b.classList.add('on'); PlayEcho.once().then(function () { b.classList.remove('on'); }); };
      host.appendChild(b);
      return b;
    }
  };

  var ctxA = null, stream = null, an = null, buf = null;
  var PlayVoice = {
    CONF: CONF,
    available: function () { return !!(media() && (g.AudioContext || g.webkitAudioContext)); },
    running: function () { return !!an; },
    start: function () {
      if (!this.available()) return Promise.resolve(false);
      if (an) return Promise.resolve(true);
      return media().getUserMedia({ audio: true }).then(function (s) {
        var AC = g.AudioContext || g.webkitAudioContext; ctxA = new AC(); stream = s;
        an = ctxA.createAnalyser(); an.fftSize = 512; buf = new Uint8Array(an.fftSize);
        ctxA.createMediaStreamSource(s).connect(an);                 /* 스피커로는 잇지 않는다 — 크기만 본다 */
        return true;
      }).catch(function () { return false; });
    },
    stop: function () { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); if (ctxA && ctxA.close) ctxA.close(); ctxA = stream = an = buf = null; },
    level: function () { if (!an) return 0; an.getByteTimeDomainData(buf); var m = 0; for (var i = 0; i < buf.length; i++) { var v = Math.abs(buf[i] - 128) / 128; if (v > m) m = v; } return m; },
    /* ms 안에 목소리가 켜졌나 → Promise(bool) */
    heard: function (ms) {
      var self = this;
      return new Promise(function (resolve) {
        if (!an) return setTimeout(function () { resolve(false); }, ms || 0);
        var t0 = Date.now(), on = 0;
        (function tick() {
          var now = Date.now();
          if (self.level() >= CONF.voiceLevel) { if (!on) on = now; else if (now - on >= CONF.voiceMs) return resolve(true); } else on = 0;
          if (now - t0 >= ms) return resolve(false);
          setTimeout(tick, 30);
        })();
      });
    }
  };
  g.PlayEcho = PlayEcho; g.PlayVoice = PlayVoice;
})(window);
