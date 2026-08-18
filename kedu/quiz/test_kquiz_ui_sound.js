/* =============================================================
 * test_kquiz_ui_sound.js — 확인 문제의 소리가 화면에서 실제로 구르는가 (jsdom)
 *   실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_kquiz_ui_sound.js
 *   역검증: node kedu/quiz/test_kquiz_ui_sound.js /tmp/변조사본/kquiz-ui.js
 *
 * ★왜 별도 검사기인가 — test_english_morning.js 는 **문항 데이터**만 본다.
 *   tts 필드가 완벽해도 화면이 그걸 안 그리면 아이에게는 아무 일도 안 일어난다.
 *   그래서 여기서는 브라우저처럼 스크립트를 싣고, 실제로 눌러서 굴린다.
 *
 * 검사 축
 *   ① 소리 있는 기기 — 듣기 문항이 뜨는 순간 1회 발화 · 재렌더로 말을 끊지 않음 ·
 *      🔊 버튼 누르면 다시 들려줌 · 「다시 풀기」 뒤에는 다시 들려줌
 *   ② ★소리 없는 기기 — 듣기 문항이 **답할 수 있는 문항으로 남는가**(글 대체) ·
 *      그러면서 **답이 거저 나오지는 않는가**(보기는 여전히 한국어 뜻) ·
 *      onscreen:true 는 아무것도 안 그리는가(발문에 이미 있으니 두 번 쓰지 않는다)
 *   ③ 교사 미리보기 — 「들려주는 말」이 뜨는가(교사가 본 것이 아이가 만날 것)
 *   ④ ★공유 엔진 회귀 — tts 없는 세트(한자·수학)에 소리 흔적이 0 인가
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var DIR = __dirname;
/* 검사 대상 UI 파일을 인자로 받는다 — 역검증은 변조 사본을 넘기므로 원본 무접촉. */
var UI = process.argv[2] ? path.resolve(process.argv[2]) : path.join(DIR, 'kquiz-ui.js');

var pass = 0, fail = 0;
function T(c, m) { if (c) pass++; else { fail++; if (fail <= 25) console.log('  ✗ ' + m); } }

if (!fs.existsSync(UI)) { console.log('  ✗ UI 파일을 못 읽었다: ' + UI + '\n\n0 PASS / 1 FAIL'); process.exit(1); }
if (process.argv[2]) console.log('  · 검사 대상: ' + UI);

function read(p) { return fs.readFileSync(p, 'utf8'); }
var SRC = {
  core: read(path.join(DIR, 'kquiz-core.js')),
  ui: read(UI),
  englishData: read(path.join(DIR, 'templates', 'english_data.js')),
  english: read(path.join(DIR, 'templates', 'english.js')),
  hanjaData: read(path.join(DIR, 'templates', 'hanja_data.js')),
  hanja: read(path.join(DIR, 'templates', 'hanja.js'))
};

/* ── 브라우저 흉내 ───────────────────────────────────────────────
 *  sound: 'on'     스피커 살아 있음
 *         'off'    엔진은 실려 있는데 기기가 소리를 못 냄(available() false)
 *         'absent' 엔진 자체가 화면에 안 실림 — 배선 전 상태가 이렇다
 *  KTTS 스파이는 실제 엔진의 공개 API(available·unlock·sentence)와 같은 모양이다. */
function boot(opts) {
  var dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
    { runScripts: 'outside-only' });
  var w = dom.window;
  var log = { spoken: [], unlocks: 0 };

  w.eval(SRC.core);
  w.eval(SRC.englishData); w.eval(SRC.english);
  if (opts.hanja) { w.eval(SRC.hanjaData); w.eval(SRC.hanja); }

  if (opts.sound !== 'absent') {
    w.KTTS = {
      available: function () { return opts.sound === 'on'; },
      unlock: function () { log.unlocks++; },
      sentence: function (t) { log.spoken.push(String(t)); return Promise.resolve(true); }
    };
  }
  w.eval(SRC.ui);

  return { w: w, log: log, app: w.document.getElementById('app') };
}

var HANGUL = /[\uAC00-\uD7A3]/;
function q1(root, sel) { return root.querySelector(sel); }
function txt(n) { return n ? n.textContent : ''; }

/* 한 세트를 처음부터 끝까지 실제로 풀어 나가며 문항마다 소리를 확인한다.
   화면이 그리는 것만 믿고, 문항 데이터는 "무엇을 기대할지"에만 쓴다.

   ★발화는 **그 문항이 화면에 뜨는 순간** 일어난다 — 즉 앞 문항의 「다음 문제」를 누른 그때다.
     그래서 발화 수를 재는 자리는 "다음을 누르기 직전"이어야 한다. 문항 안에서 재면
     이미 일어난 발화를 0 으로 세어 **멀쩡한 화면을 결함으로 몬다**(첫 실행에서 실제로 겪었다).
   마운트도 여기서 한다 — 첫 문항의 발화도 같은 자로 재기 위해서다. */
function walk(env, cfg, items, tagBase, expect) {
  var app = env.app, log = env.log;

  var mark = log.spoken.length;          // 문항이 뜨기 직전의 발화 수
  env.w.KQuiz.mount(app, cfg);

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var tag = tagBase + ' q' + i;
    var before = mark;
    var tts = q1(app, '.kq-tts');
    var mute = q1(app, '.kq-mute');
    var qt = txt(q1(app, '.kq-qt'));

    if (!it.tts) {
      /* ④ 소리를 안 실은 문항은 소리 흔적이 하나도 없어야 한다 */
      T(!tts && !mute, tag + ' tts 없는 문항인데 소리 자리가 그려졌다');
      T(log.spoken.length === before, tag + ' tts 없는 문항인데 말했다');
    } else if (expect === 'on') {
      T(!!tts, tag + ' 소리 있는 기기인데 🔊 자리가 없다');
      T(!mute, tag + ' 소리가 나는데 글 대체까지 그렸다 — 둘 중 하나여야 한다');
      if (it.tts.onscreen) {
        /* 이미 발문에 있는 문장이라 저절로 말하지 않는다(읽는 중에 끼어들지 않는다) */
        T(log.spoken.length === before, tag + ' onscreen:true 인데 저절로 말했다');
        T(/다시 듣기/.test(txt(tts)), tag + ' onscreen:true 버튼 문구가 「다시 듣기」가 아님: ' + txt(tts));
      } else {
        /* 소리가 곧 문제 — 뜨는 순간 정확히 한 번 */
        T(log.spoken.length === before + 1,
          tag + ' onscreen:false 자동 발화 ' + (log.spoken.length - before) + '회 (1회여야 함)');
        T(log.spoken[log.spoken.length - 1] === it.tts.text,
          tag + ' 읽어 준 말이 문항의 말과 다름: ' + log.spoken[log.spoken.length - 1]);
      }
      /* 🔊 버튼을 누르면 그 말을 다시 들려준다 */
      var n0 = log.spoken.length;
      var btn = q1(app, '.kq-tts button');
      T(!!btn, tag + ' 🔊 버튼이 없다');
      if (btn) {
        btn.onclick();
        T(log.spoken.length === n0 + 1, tag + ' 🔊 버튼을 눌러도 다시 안 들려준다');
        T(log.spoken[log.spoken.length - 1] === it.tts.text, tag + ' 버튼이 딴 말을 읽는다');
      }
    } else { /* expect === 'off' — 스피커 죽은 교실 */
      T(log.spoken.length === before, tag + ' 소리 못 내는 기기인데 발화를 시도했다');
      T(!tts, tag + ' 소리 못 내는 기기에 🔊 버튼을 그렸다 — 눌러도 안 나는 버튼');
      if (it.tts.onscreen) {
        T(!mute, tag + ' onscreen:true 인데 글 대체까지 그렸다 — 발문에 이미 있는 문장을 두 번 쓴다');
      } else {
        /* ★여기가 이 검사기의 핵심 — 답할 수 없는 문항이 되지 않는가 */
        T(!!mute, tag + ' onscreen:false 인데 글 대체가 없다 — 아이가 답할 근거가 아예 없는 문항');
        if (mute) {
          T(txt(mute).indexOf(it.tts.text) >= 0, tag + ' 글 대체에 그 문장이 없다: ' + txt(mute));
          /* ★그러면서 답이 거저 나와서도 안 된다 — 보기는 여전히 한국어 뜻이어야 한다.
             (문장이 보여도 뜻은 스스로 골라야 한다 = t_en2ko 로 내려앉은 상태) */
          var opts = [].map.call(app.querySelectorAll('.kq-opt'), function (o) { return txt(o); });
          T(opts.length >= 3, tag + ' 글 대체 상태에서 보기가 ' + opts.length + '개');
          T(opts.every(function (o) { return o.indexOf(it.tts.text) < 0; }),
            tag + ' 보기 안에 들려줄 문장이 그대로 있다 — 답이 거저 나온다');
          T(opts.some(function (o) { return HANGUL.test(o); }),
            tag + ' 글 대체 상태의 보기에 한국어 뜻이 없다 — 뜻 고르기가 아니게 됨');
        }
      }
    }

    /* onscreen:false 문항은 발문이 문장을 보여 주지 않아야 듣기다 */
    if (it.tts && !it.tts.onscreen) {
      T(qt.indexOf(it.tts.text) < 0, tag + ' 발문이 들려줄 문장을 이미 보여 준다: ' + qt);
    }

    /* 답을 넣어 재렌더시킨다 — 그때 말을 다시 끊는지 본다.
       객관식·OX 는 보기를 누르고, 단답형(한자 세트에 있다)은 글자를 넣는다. */
    var n1 = log.spoken.length;
    var pick = q1(app, '.kq-opt');
    if (pick) {
      pick.onclick();
    } else {
      var inp = q1(app, '.kq-short input');
      T(!!inp, tag + ' 답할 자리가 없다(보기도 입력칸도 없음)');
      if (!inp) return;
      inp.value = '답';
      if (inp.oninput) inp.oninput();
    }
    T(log.spoken.length === n1,
      tag + ' 답을 넣자 다시 말했다 — 고칠 때마다 말을 끊는다');

    var check = q1(app, '.kq-foot .kq-btn.pri');
    T(!!check && txt(check) === '확인', tag + ' 확인 버튼이 없다');
    if (!check) return;
    check.onclick();                       // 채점

    var next = q1(app, '.kq-foot .kq-btn.pri');
    T(!!next, tag + ' 다음 버튼이 없다');
    if (!next) return;
    mark = log.spoken.length;              // ★다음 문항이 뜨기 직전 — 여기서 재야 한다
    next.onclick();                        // 다음 문제(마지막이면 결과)
  }
  return mark;
}

/* 듣기 문항이 반드시 들어 있는 세트를 고른다(재료가 열린 날). */
var LESSON = 'g3_english_c020', SEED = 7, N = 10;
/* ★난이도를 명시한다 — renderTeacher 는 안 주면 [1,2] 로 좁혀 뽑는다(kquiz-ui).
   기대 세트를 필터 없이 만들면 OX(난이도 3)가 빠진 미리보기와 어긋나 검사기가 거짓 실패한다.
   실제로 첫 실행에서 겪었다: 화면은 멀쩡한데 「들려주는 말이 없다」가 3건 났다. */
var DIFF = [1, 2, 3];
var CFG = { lesson: LESSON, n: N, seed: SEED, difficulty: DIFF };

/* ── ① 소리 있는 기기 ──────────────────────────────────────── */
(function () {
  var env = boot({ sound: 'on' });
  var gen = env.w.KQuiz.core.generate(CFG);
  var items = gen.items;
  T(items.some(function (it) { return it.tts && !it.tts.onscreen; }),
    '표본 세트에 듣기 문항이 없다 — 이 검사기가 헛돈다');
  T(items.some(function (it) { return it.tts && it.tts.onscreen; }),
    '표본 세트에 다시 듣기 문항이 없다 — 이 검사기가 헛돈다');

  var mark = walk(env, CFG, items, '[소리O]', 'on');

  /* 첫 터치 안에서 엔진을 열어 줬는가(모바일에서 이게 없으면 소리가 안 난다) */
  T(env.log.unlocks > 0, '[소리O] KTTS.unlock 을 한 번도 안 불렀다 — 모바일에서 첫 소리가 죽는다');

  /* 「다시 풀기」 — 처음부터 다시 푸는 것이니 소리도 다시 들려줘야 한다 */
  var before = mark;
  var retry = q1(env.app, '.kq-foot .kq-btn.ghost');
  T(!!retry && txt(retry) === '다시 풀기', '[소리O] 결과 화면에 「다시 풀기」가 없다');
  if (retry) {
    retry.onclick();
    var first = items[0];
    if (first.tts && !first.tts.onscreen) {
      T(env.log.spoken.length === before + 1, '[소리O] 다시 풀기 뒤에 첫 듣기 문항이 말을 안 한다');
    } else {
      T(env.log.spoken.length === before, '[소리O] 다시 풀기 뒤에 말하면 안 되는 문항이 말했다');
    }
  }
})();

/* ── ② 소리 없는 기기 (엔진은 있는데 기기가 못 냄) ─────────── */
(function () {
  var env = boot({ sound: 'off' });
  var gen = env.w.KQuiz.core.generate(CFG);
  walk(env, CFG, gen.items, '[소리X]', 'off');
  T(env.log.spoken.length === 0, '[소리X] 소리를 못 내는 기기인데 발화를 시도했다');
})();

/* ── ②' 엔진이 아예 안 실린 화면 (배선 전 상태) ─────────────
   ★배선을 빠뜨려도 아이가 답할 수 있어야 한다 — 깨지지 않고 조용히 글로 내려앉는다. */
(function () {
  var env = boot({ sound: 'absent' });
  var gen = env.w.KQuiz.core.generate(CFG);
  walk(env, CFG, gen.items, '[엔진없음]', 'off');
})();

/* ── ③ 교사 미리보기 ───────────────────────────────────────── */
(function () {
  var env = boot({ sound: 'on' });
  var gen = env.w.KQuiz.core.generate(CFG);
  env.w.KQuiz.mount(env.app, { mode: 'teacher', lesson: LESSON, n: N, seed: SEED, difficulty: DIFF });
  var body = env.app.textContent;
  var sounded = gen.items.filter(function (it) { return it.tts && it.tts.text; });
  T(sounded.length > 0, '[교사] 표본에 소리 문항이 없다');
  sounded.forEach(function (it, k) {
    T(body.indexOf('들려주는 말: ' + it.tts.text) >= 0,
      '[교사] ' + k + '번 들려주는 말이 미리보기에 없다: ' + it.tts.text);
  });
  /* 교사 미리보기에서 저절로 소리가 나면 교실에서 사고가 난다(수업 중 스피커) */
  T(env.log.spoken.length === 0, '[교사] 미리보기가 저절로 말했다');
})();

/* ── ④ 공유 엔진 회귀 — 한자 세트에 소리 흔적 0 ──────────── */
(function () {
  var env = boot({ sound: 'on', hanja: true });
  var lesson = null;
  for (var g = 3; g <= 6 && !lesson; g++) {
    for (var d = 1; d <= 40; d++) {
      var k = 'g' + g + '_hanja_c' + ('00' + d).slice(-3);
      if (env.w.KQuiz.core.has(k)) { lesson = k; break; }
    }
  }
  T(!!lesson, '[한자] 한자 세트 키를 못 찾음 — 공유 엔진 회귀 가드가 헛돈다');
  if (!lesson) return;

  var hcfg = { lesson: lesson, n: 10, seed: 5 };
  var gen = env.w.KQuiz.core.generate(hcfg);
  T(gen.items.every(function (it) { return !it.tts; }),
    '[한자] 한자 문항에 tts 가 실렸다 — 영어 전용 훅이 새어 나갔다');

  walk(env, hcfg, gen.items, '[한자]', 'on');
  T(env.log.spoken.length === 0, '[한자] 한자 세트에서 소리가 났다');
  T(!q1(env.app, '.kq-tts') && !q1(env.app, '.kq-mute'), '[한자] 소리 자리가 남아 있다');
})();

console.log('\n케이퀴즈 소리 화면 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
