/* ============================================================
 * K-edu 영어 v3 — KTTS (소리 엔진 v1)
 * ------------------------------------------------------------
 * 3단위: sound(소리조각) · word(단어) · sentence(통문장)
 * + blend(블렌딩: 소리조각 나열 → 점점 빠르게 → 단어 합침)
 *
 * 어댑터 구조:
 *   - WebSpeechProvider (현재 기본 — 브라우저 내장, 비용·키·서버 0)
 *   - AudioFileProvider (나중 — 음원 mp3 폴더만 부으면 교체, 차시 코드 무변경)
 * 차시는 KTTS.* 만 호출한다. provider를 직접 만지지 않는다.
 *
 * 모바일 주의: iOS/안드로이드는 첫 사용자 터치 안에서 KTTS.unlock() 필요.
 * 소리조각 근사값(PHONEMES.say)은 튜닝 대상 — engine/tts-test.html 에서 귀로 확정.
 * ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   * 1. 소리조각 사전 (Lv1~2 범위)
   *    say    : 단독 소리 근사 텍스트 (Web Speech가 읽었을 때 가장 가까운 것)
   *    anchor : 닻 단어 ("a, a, apple" 식 제시용 — 도입 차시)
   *    cont   : 이어지는 소리(continuant) 여부 — 블렌딩 간격 계산에 사용
   *    ⚠ say 값은 tts-test.html에서 귀로 듣고 튜닝 후 잠근다.
   * ---------------------------------------------------------- */
  var PHONEMES = {
    /* 단모음 (Lv1) */
    a: { say: 'ah',  anchor: 'apple',  cont: true,  label: '/æ/' },
    e: { say: 'eh',  anchor: 'egg',    cont: true,  label: '/e/' },
    i: { say: 'ih',  anchor: 'igloo',  cont: true,  label: '/i/' },
    o: { say: 'aw',  anchor: 'otter',  cont: true,  label: '/o/' },
    u: { say: 'uh',  anchor: 'up',     cont: true,  label: '/u/' },
    /* 자음 (Lv1 — #3·#4·#14 범위) */
    b: { say: 'buh', anchor: 'bear',   cont: false }, c: { say: 'kuh', anchor: 'cat',  cont: false },
    d: { say: 'duh', anchor: 'dog',    cont: false }, f: { say: 'fff', anchor: 'fish', cont: true  },
    g: { say: 'guh', anchor: 'goat',   cont: false }, h: { say: 'huh', anchor: 'hat',  cont: false },
    j: { say: 'juh', anchor: 'jam',    cont: false }, k: { say: 'kuh', anchor: 'kite', cont: false },
    l: { say: 'lll', anchor: 'lion',   cont: true  }, m: { say: 'mmm', anchor: 'milk', cont: true  },
    n: { say: 'nnn', anchor: 'nut',    cont: true  }, p: { say: 'puh', anchor: 'pig',  cont: false },
    q: { say: 'kwuh',anchor: 'queen',  cont: false }, r: { say: 'rrr', anchor: 'rain', cont: true  },
    s: { say: 'sss', anchor: 'sun',    cont: true  }, t: { say: 'tuh', anchor: 'top',  cont: false },
    v: { say: 'vvv', anchor: 'van',    cont: true  }, w: { say: 'wuh', anchor: 'wind', cont: false },
    x: { say: 'ks',  anchor: 'box',    cont: true  }, y: { say: 'yuh', anchor: 'yo-yo',cont: false },
    z: { say: 'zzz', anchor: 'zoo',    cont: true  },
    /* 이중자음 (Lv2 #1·#3) */
    sh: { say: 'shh',  anchor: 'ship',  cont: true  },
    ch: { say: 'chuh', anchor: 'chick', cont: false },
    th: { say: 'thh',  anchor: 'bath',  cont: true  },   /* 무성 /쓰/ — bath·math */
    dh: { say: 'thuh', anchor: 'this',  cont: true  },   /* ★유성 /드/ — this·that.
           글자는 둘 다 th 지만 소리가 갈리므로 키를 나눈다(블록 라벨은 HTML이 정한다).
           키 이름 dh 는 IPA ð 관례 — 대문자 키를 만들지 않기 위한 선택. */
    ck: { say: 'kuh',  anchor: 'duck',  cont: false, same: 'K' },

    /* 매직e 장모음 (Lv2 #11·#13·#14) */
    a_e: { say: 'ay',  anchor: 'cake',  cont: true, same: 'longA' },
    i_e: { say: 'eye', anchor: 'bike',  cont: true, same: 'longI' },
    o_e: { say: 'oh',  anchor: 'home',  cont: true, same: 'longO' },
    u_e: { say: 'yoo', anchor: 'cute',  cont: true, same: 'longU' },

    /* 모음팀 (Lv2 #19·#21·#23) */
    ai: { say: 'ay', anchor: 'rain',  cont: true, same: 'longA' },
    ay: { say: 'ay', anchor: 'day',   cont: true, same: 'longA' },
    ee: { say: 'ee', anchor: 'tree',  cont: true, same: 'longE' },
    ea: { say: 'ee', anchor: 'eat',   cont: true, same: 'longE' },
    oa: { say: 'oh', anchor: 'boat',  cont: true, same: 'longO' },
    ow: { say: 'oh', anchor: 'snow',  cont: true, same: 'longO' }
        /* ow 는 cow /아우/ 도 되지만 Lv2 는 snow·slow 계열만 다룬다 */
  };

  /* ----------------------------------------------------------
   * 같은 소리 그룹 (same) — 한 문항 안에 함께 선택지로 내면 안 되는 짝.
   * Lv1 #3 에서 c/k 충돌을 차시마다 손으로 SAME 맵을 짜 막았던 것을
   * 엔진 사전으로 올린 것. KTTS.sameAs('c') → ['c','k','ck']
   * ---------------------------------------------------------- */
  var SAME_EXTRA = { c: 'K', k: 'K' };   /* 기존 키 소급 지정(사전 구조 보존) */

  /* 속도 프리셋 (저학년 기본) */
  var RATES = {
    sound: 0.7,        /* 소리조각 단독 */
    word: 0.62,        /* 단어 또박또박 (구 g1 차시 0.6 계승) */
    wordNormal: 0.85,  /* 단어 자연 속도 (숙달 단계) */
    sentence: 0.78,    /* 통문장 */
    blendFrom: 0.5,    /* 블렌딩 시작(느리게) */
    blendTo: 0.95      /* 블렌딩 끝(합쳐서 자연스럽게) */
  };

  /* ----------------------------------------------------------
   * 2. Provider — WebSpeech (현재 기본)
   * ---------------------------------------------------------- */
  function WebSpeechProvider() {
    var voice = null, ready = false, self = this;
    function pickVoice() {
      var vs = global.speechSynthesis ? global.speechSynthesis.getVoices() : [];
      if (!vs.length) return;
      var prefer = ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Zira'];
      for (var i = 0; i < prefer.length; i++) {
        var hit = vs.find(function (v) { return v.name.indexOf(prefer[i]) === 0; });
        if (hit) { voice = hit; ready = true; return; }
      }
      voice = vs.find(function (v) { return v.lang === 'en-US'; }) ||
              vs.find(function (v) { return v.lang && v.lang.indexOf('en') === 0; }) || vs[0];
      ready = true;
    }
    if (global.speechSynthesis) {
      pickVoice();
      global.speechSynthesis.onvoiceschanged = pickVoice;
    }
    this.available = function () { return !!global.speechSynthesis; };
    /* speak: Promise — 끝나면 resolve (blend·듣고고르기 흐름이 의존) */
    this.speak = function (text, opt) {
      opt = opt || {};
      return new Promise(function (resolve) {
        if (!global.speechSynthesis) return resolve(false);
        if (opt.interrupt !== false) global.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        if (voice) u.voice = voice;
        u.rate = opt.rate || 1;
        u.pitch = opt.pitch || 1.05; /* 살짝 밝게 — 저학년 톤 */
        u.onend = function () { resolve(true); };
        u.onerror = function () { resolve(false); };
        global.speechSynthesis.speak(u);
      });
    };
    this.stop = function () { if (global.speechSynthesis) global.speechSynthesis.cancel(); };
    /* iOS/안드로이드 첫 터치 잠금 해제 */
    this.unlock = function () {
      if (!global.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; global.speechSynthesis.speak(u);
    };
  }

  /* ----------------------------------------------------------
   * 3. Provider — AudioFile (나중 교체용 스텁)
   *    음원 생기면: KTTS.config({ provider:'audiofile', baseUrl:'/audio/en' })
   *    파일 규약: {base}/sound/{key}.mp3 · {base}/word/{단어소문자}.mp3 · {base}/sent/{slug}.mp3
   *    파일 없으면(404) WebSpeech로 자동 폴백 — 부분 입고도 안전.
   * ---------------------------------------------------------- */
  function AudioFileProvider(baseUrl, fallback) {
    var cur = null;
    function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
    this.available = function () { return true; };
    this.urlFor = function (unit, text) {
      if (unit === 'sound') return baseUrl + '/sound/' + text + '.mp3';
      if (unit === 'word') return baseUrl + '/word/' + slug(text) + '.mp3';
      return baseUrl + '/sent/' + slug(text) + '.mp3';
    };
    this.speak = function (text, opt) {
      opt = opt || {};
      var url = this.urlFor(opt.unit || 'word', opt.fileKey || text);
      var self = this;
      return new Promise(function (resolve) {
        if (cur) { cur.pause(); cur = null; }
        var a = new Audio(url);
        if (opt.rate) a.playbackRate = opt.rate;
        a.onended = function () { resolve(true); };
        a.onerror = function () { /* 폴백 */ 
          if (fallback) fallback.speak(text, opt).then(resolve); else resolve(false);
        };
        cur = a; a.play().catch(function () {
          if (fallback) fallback.speak(text, opt).then(resolve); else resolve(false);
        });
      });
    };
    this.stop = function () { if (cur) { cur.pause(); cur = null; } if (fallback) fallback.stop(); };
    this.unlock = function () { if (fallback) fallback.unlock(); };
  }

  /* ----------------------------------------------------------
   * 4. KTTS 본체 — 차시가 호출하는 유일한 면
   * ---------------------------------------------------------- */
  var web = new WebSpeechProvider();
  var provider = web;

  var KTTS = {
    PHONEMES: PHONEMES,
    RATES: RATES,

    config: function (opt) {
      opt = opt || {};
      if (opt.provider === 'audiofile') provider = new AudioFileProvider(opt.baseUrl || '/audio/en', web);
      if (opt.provider === 'webspeech') provider = web;
      if (opt.rates) Object.assign(RATES, opt.rates);
      return KTTS;
    },

    available: function () { return provider.available(); },
    unlock: function () { provider.unlock(); },   /* 첫 사용자 터치에서 1회 호출 */
    stop: function () { provider.stop(); },

    /* 소리조각: KTTS.sound('a') / 닻단어 제시: KTTS.sound('a',{anchor:true}) */
    sound: function (key, opt) {
      opt = opt || {};
      var p = PHONEMES[key];
      if (!p) return Promise.resolve(false);
      var text = opt.anchor ? p.anchor : p.say;
      return provider.speak(text, { unit: 'sound', fileKey: key + (opt.anchor ? '_anchor' : ''),
        rate: opt.rate || RATES.sound, interrupt: opt.interrupt });
    },

    /* 단어: KTTS.word('cat') / 자연속도: {natural:true} */
    word: function (text, opt) {
      opt = opt || {};
      return provider.speak(text, { unit: 'word',
        rate: opt.rate || (opt.natural ? RATES.wordNormal : RATES.word), interrupt: opt.interrupt });
    },

    /* 통문장: KTTS.sentence('I like a cat.') */
    sentence: function (text, opt) {
      opt = opt || {};
      return provider.speak(text, { unit: 'sentence',
        rate: opt.rate || RATES.sentence, interrupt: opt.interrupt });
    },

    /* 같은 소리를 내는 키들 — 선택지 충돌 회피용.
       KTTS.sameAs('a_e') → ['a_e','ai','ay'] (자기 자신 포함) */
    sameAs: function (key) {
      var g = (PHONEMES[key] && PHONEMES[key].same) || SAME_EXTRA[key];
      if (!g) return [key];
      return Object.keys(PHONEMES).filter(function (k) {
        return ((PHONEMES[k] && PHONEMES[k].same) || SAME_EXTRA[k]) === g;
      });
    },

    /* ----------------------------------------------------------
     * 블렌딩 — phonics_blocks의 소리 코어
     * KTTS.blend(['c','a','t'], { word:'cat', passes:2 })
     *   pass 1: 느리게  /크/ … /애/ … /트/
     *   pass 2: 빠르게  /크/·/애/·/트/  (간격 축소·속도 상승)
     *   마지막: 단어 통째 "cat"
     * 반환 Promise — 연출(블록 하이라이트)과 await로 동기화.
     * onPiece(i, pass) 콜백: 지금 우는 조각 인덱스 — 블록 하이라이트용.
     * ---------------------------------------------------------- */
    blend: function (keys, opt) {
      opt = opt || {};
      var passes = opt.passes || 2;
      var doWord = opt.word !== undefined ? opt.word : keys.join('');
      function gapFor(key, pass) {
        var base = pass === 0 ? 420 : 140;            /* 1차 느림 → 2차 촘촘 */
        var p = PHONEMES[key];
        return p && p.cont ? base : base + 80;        /* 파열음은 살짝 더 띄움 */
      }
      function rateFor(pass) {
        if (passes === 1) return RATES.blendFrom;
        return RATES.blendFrom + (RATES.blendTo - RATES.blendFrom) * (pass / (passes - 1));
      }
      var chain = Promise.resolve();
      var self = this;
      for (var pass = 0; pass < passes; pass++) {
        (function (pass) {
          keys.forEach(function (key, i) {
            chain = chain.then(function () {
              if (opt.onPiece) opt.onPiece(i, pass);
              return self.sound(key, { rate: rateFor(pass), interrupt: false });
            }).then(function () {
              return new Promise(function (r) { setTimeout(r, gapFor(key, pass)); });
            });
          });
          chain = chain.then(function () {
            return new Promise(function (r) { setTimeout(r, pass === passes - 1 ? 350 : 600); });
          });
        })(pass);
      }
      if (doWord) {
        chain = chain.then(function () {
          if (opt.onWord) opt.onWord();
          return self.word(doWord, { natural: true, interrupt: false });
        });
      }
      return chain;
    }
  };

  global.KTTS = KTTS;
})(window);
