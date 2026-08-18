/* =============================================================
 * test_english_morning.js — 아침활동 영어: 학년 × 일차 전수 검산 (node)
 *   실행: node kedu/quiz/test_english_morning.js
 *   역검증: node kedu/quiz/test_english_morning.js /tmp/변조사본/english.js
 *
 * ★경로 인자는 절대경로도 받는다. 9.10차에 __dirname 기준으로만 풀려
 *   변조 사본 대신 원본을 읽고도 "0건 검출"로 그린이 나던 함정이 있었다.
 *   못 읽으면 조용히 넘어가지 않고 즉시 FAIL 한다.
 *
 * 검사 축
 *   ① 전수 — 학년 4 × 40일 = 160키 등록·문항수·만점 채점 일치
 *   ② 심층 — 표본 일차 × 4시드: 발문 중복(2일차부터 0)·보기 중복 0·정답 인덱스·
 *            재현성·오늘 문장 등장·복습 혼입
 *   ③ ★어휘 사다리 전수 — 발문·보기·해설의 모든 영어 낱말이 그날까지
 *            누적 단어장 안에 있는가 (설계 §3 헌법의 문항 연장)
 *   ④ SQL 드리프트 — sql/setup_morning.sql 의 ma_max_step english 행 대조
 *   ⑤ 진도 시뮬 — ma_today 규칙대로 돌려 키가 전부 실재하는가
 *   ⑥ ★소리 — 들려주는 말이 화면과 어긋나지 않는가 (D8-ⓓ)
 *            onscreen 참값 대조 · 소리의 어휘 사다리 · 답 누설 금지 ·
 *            소리 금지 템플릿 · 세트당 듣기 1문항(라운드로빈 굶김 가드)
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var CORE = require('./kquiz-core.js');
var DATA = require('./templates/english_data.js');

var pass = 0, fail = 0, combos = 0;
function T(c, m) { if (c) pass++; else { fail++; if (fail <= 25) console.log('  ✗ ' + m); } }

/* ── 템플릿 로드(경로 인자 지원) ───────────────────────────── */
var arg = process.argv[2];
var tplPath = arg
  ? (path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg))
  : path.join(__dirname, 'templates', 'english.js');
var loaded = false;
try {
  require(tplPath)({ core: CORE }, DATA);
  loaded = true;
} catch (e) {
  console.log('  ✗ 템플릿 로드 실패: ' + tplPath + ' — ' + e.message);
}
T(loaded, '템플릿을 못 읽었다 — 이 상태의 그린은 무의미하다');
if (!loaded) { console.log('\n0 PASS / 1 FAIL'); process.exit(1); }
if (arg) console.log('  · 검사 대상: ' + tplPath);

var C = CORE;
var SEEDS = [1, 7, 424242, 987654321];
var N = 10;

function keyOf(g, d) { return 'g' + g + '_english_c' + ('00' + d).slice(-3); }

/* 그날까지 누적 단어장 — 원장이 상주시킨 규약(learn/covered)을 그대로 쓴다.
   검사기가 자기만의 규칙을 새로 쓰면 원장과 갈라진다(드리프트 원천 차단). */
function vocabUpto(g, d) {
  var set = {};
  for (var k = 1; k <= d; k++) {
    DATA.day(g, k).words.forEach(function (w) { DATA.learn(set, w); });
  }
  return set;
}
/* 문항 텍스트에서 영어 낱말 단위만 뽑는다(한글·구두점·밑줄 제거 후 원장 tokenize) */
function englishUnits(txt) {
  var only = String(txt == null ? '' : txt).replace(/[^A-Za-z']+/g, ' ');
  return DATA.tokenize(only).filter(function (u) { return /[a-z]/.test(u); });
}

/* ── ★독립 오라클 — 문항이 스스로 말하는 정답을 믿지 않는다 ─────
 *  gradeSet 은 item.answer 를 정답으로 놓고 채점하므로, 템플릿이 틀린 정답을
 *  달아도 만점이 나온다(역검증 M6 로 실측된 구멍). 그래서 발문을 되읽어
 *  **원장의 문장·뜻 짝**과 대조한다. 오답 보기도 정답이 아님을 함께 본다. */
var PAIR = {}, TILES = {};
DATA.grades().forEach(function (g) {
  PAIR[g] = {}; TILES[g] = {};
  DATA.days(g).forEach(function (dy) {
    PAIR[g][dy.sent + '\u241F' + dy.ko] = 1;
    TILES[g][dy.sent] = dy.tiles.slice();
    if (dy.expand) PAIR[g][dy.expand.sent + '\u241F' + dy.expand.ko] = 1;
  });
});
function isPair(g, s, k) { return !!PAIR[g][s + '\u241F' + k]; }

/* 늘 대문자인 낱말 — 원장에서 직접 뽑는다(엔진이 뭘 하든 상관없이 독립적으로). */
var CAPMID = {};
DATA.grades().forEach(function (g) {
  CAPMID[g] = {};
  DATA.days(g).forEach(function (dy) {
    dy.tiles.forEach(function (t, i) {
      if (i > 0) { var b = t.replace(/[.,!?]+$/, ''); if (/^[A-Z]/.test(b)) CAPMID[g][b] = 1; }
    });
  });
  ['I', "I'm", 'Ben', 'Mia', 'Kai'].forEach(function (w) { CAPMID[g][w] = 1; });
});

function oracle(g, key, it, tag) {
  var tid = (it.gen && it.gen.template_id) || '';
  var ans = it.type === 'choice' ? it.choices[it.answer] : null;
  var others = it.type === 'choice'
    ? it.choices.filter(function (_, ix) { return ix !== it.answer; }) : [];
  var m;

  if (/^t_order_/.test(tid)) {
    m = it.q.match(/^「(.+?)」 낱말 카드를 바르게 늘어놓은 문장은\?  \[ (.+) \]$/);
    T(!!m, key + tag + ' t_order 발문 형식 이탈: ' + it.q);
    if (!m) return;
    T(isPair(g, ans, m[1]), key + tag + ' t_order 정답이 원장 짝이 아님: ' + ans + ' / ' + m[1]);
    var tl = TILES[g][ans];
    if (tl) {
      T(m[2].split(' / ').slice().sort().join('|') === tl.slice().sort().join('|'),
        key + tag + ' t_order 흩뿌린 카드가 그 문장의 낱말이 아님');
    }
    others.forEach(function (o) {
      T(!isPair(g, o, m[1]), key + tag + ' t_order 오답도 정답임: ' + o);
    });

  } else if (/^t_blank_/.test(tid)) {
    m = it.q.match(/^「(.+?)」  (.+?)  빈칸에 알맞은 말은\?$/);
    T(!!m, key + tag + ' t_blank 발문 형식 이탈: ' + it.q);
    if (!m) return;
    T(isPair(g, m[2].replace('____', ans), m[1]),
      key + tag + ' t_blank 정답을 채워도 원장 문장이 안 됨: ' + m[2].replace('____', ans));
    others.forEach(function (o) {
      T(!isPair(g, m[2].replace('____', o), m[1]), key + tag + ' t_blank 오답도 정답임: ' + o);
    });
    /* 보기의 대소문자가 그 빈칸 자리에 맞는 형태인가 —
       문장 중간 빈칸에 "It" 같은 대문자 보기가 서면 읽기에 어긋난다. */
    var atStart = /^____/.test(m[2]);
    it.choices.forEach(function (c) {
      if (atStart) T(/^[A-Z]/.test(c), key + tag + ' 첫 자리 빈칸인데 소문자 보기: ' + c);
      else T(!/^[A-Z]/.test(c) || CAPMID[g][c],
        key + tag + ' 문장 중간 빈칸인데 대문자 보기: ' + c + ' (' + it.q + ')');
    });
    /* ★대소문자 누설 금지 — 뜻을 몰라도 첫 글자 모양만 보고 답이 보이면 안 된다.
       정답만 대문자로 시작하거나, 정답만 소문자로 시작하는 상태를 막는다. */
    var up = it.choices.filter(function (c) { return /^[A-Z]/.test(c); }).length;
    var ansUp = /^[A-Z]/.test(ans);
    T(!(ansUp && up === 1) && !(!ansUp && up === it.choices.length - 1),
      key + tag + ' t_blank 대소문자로 정답이 드러남: ' + JSON.stringify(it.choices) + ' 정답=' + ans);

  } else if (/^t_ko2en_/.test(tid)) {
    m = it.q.match(/^「(.+?)」 를 영어로 바르게 말한 것은\?$/);
    T(!!m, key + tag + ' t_ko2en 발문 형식 이탈: ' + it.q);
    if (!m) return;
    T(isPair(g, ans, m[1]), key + tag + ' t_ko2en 정답이 원장 짝이 아님: ' + ans);
    others.forEach(function (o) { T(!isPair(g, o, m[1]), key + tag + ' t_ko2en 오답도 정답임: ' + o); });

  } else if (/^t_en2ko_/.test(tid)) {
    m = it.q.match(/^「(.+?)」 는 무슨 뜻일까요\?$/);
    T(!!m, key + tag + ' t_en2ko 발문 형식 이탈: ' + it.q);
    if (!m) return;
    T(isPair(g, m[1], ans), key + tag + ' t_en2ko 정답이 원장 짝이 아님: ' + ans);
    others.forEach(function (o) { T(!isPair(g, m[1], o), key + tag + ' t_en2ko 오답도 정답임: ' + o); });

  } else if (/^t_listen_/.test(tid)) {
    /* ★듣기 문항의 근거는 발문이 아니라 들려주는 말에 있다.
       그러니 오라클도 소리를 읽어 원장 짝과 대조한다. 소리가 비면 이 문항은
       화면에 답할 근거가 아무것도 없는 상태다 — 그 자체가 FAIL 이어야 한다. */
    T(it.q === '잘 듣고 알맞은 뜻을 고르세요.', key + tag + ' t_listen 발문 형식 이탈: ' + it.q);
    T(!!(it.tts && it.tts.text), key + tag + ' t_listen 인데 들려주는 말이 없다 — 답할 근거가 사라진다');
    if (!it.tts || !it.tts.text) return;
    var snd = it.tts.text;
    T(it.tts.onscreen === false,
      key + tag + ' t_listen 이 onscreen:true — 문장을 글로 보여 주면 듣기가 아니다');
    T(it.q.indexOf(snd) < 0, key + tag + ' t_listen 발문에 문장이 새어 나옴: ' + it.q);
    T(isPair(g, snd, ans), key + tag + ' t_listen 정답이 원장 짝이 아님: ' + snd + ' / ' + ans);
    others.forEach(function (o) { T(!isPair(g, snd, o), key + tag + ' t_listen 오답도 정답임: ' + o); });

  } else if (/^t_ox_/.test(tid)) {
    m = it.q.match(/^「(.+?)」 는 「(.+?)」 라는 뜻이다\.$/);
    T(!!m, key + tag + ' t_ox 발문 형식 이탈: ' + it.q);
    if (!m) return;
    T(it.answer === isPair(g, m[1], m[2]),
      key + tag + ' t_ox 참거짓이 원장과 어긋남: 「' + m[1] + '」/「' + m[2] + '」 → ' + it.answer);

  } else {
    T(false, key + tag + ' 알 수 없는 템플릿 id: ' + tid);
  }
}

/* ── ⑥ 소리 ────────────────────────────────────────────────────
 *  화면 검사는 아이가 **보는 것**만 훑는다(q|choices|explain). 그런데 D8-ⓓ 부터
 *  아이는 **듣기도** 한다 — 소리로 나가는 영어가 검사망 밖에 있으면, 화면은
 *  그린인데 스피커만 딴소리를 하는 상태가 통과한다(역검증 A 로 실측된 구멍).
 *
 *  ★핵심은 `onscreen` 이 **주장**이라는 것이다. "이 말은 발문에 이미 글로 있다"는
 *    주장이 참인지 아무도 안 보면, 화면엔 「I like apples.」가 뜨고 스피커는
 *    「He has big eyes.」를 읽는 문항이 그린을 받는다. 교사 미리보기의
 *    「들려주는 말」까지 거짓을 표시한다. 그래서 주장을 발문과 대조한다.
 *
 *  소리 규약(설계 §5, 헌법급) — 소리는 이미 화면에 다 보이는 문장에만 붙는다.
 *    t_order·t_blank·t_ko2en → 정답이 문장(또는 그 일부)이라 읽어 주면 답이 샌다 → 소리 금지
 *    t_en2ko·t_ox           → 문장이 발문에 그대로 있고 답은 뜻 쪽 → onscreen:true
 *    t_listen               → 문장을 발문에서 빼고 소리에 싣는다 → onscreen:false          */
var SOUND_BAN = /^(t_order_|t_blank_|t_ko2en_)/;   // 소리가 붙으면 답이 새는 자리
var SOUND_REQ = /^(t_en2ko_|t_ox_|t_listen_)/;     // 소리가 사라지면 설계가 조용히 죽는 자리
var sndItems = 0, sndWords = 0;

/* 그날까지 원장에 실재하는 문장(확장 문장 포함) — 템플릿을 거치지 않고 원장에서 직접 만든다.
   템플릿이 준 값으로 템플릿을 검사하면 둘이 함께 틀려도 그린이 난다(D8-ⓐ 에서 겪은 자리). */
function sentsUpto(g, d) {
  var set = {};
  for (var k = 1; k <= d; k++) {
    var dy = DATA.day(g, k);
    set[dy.sent] = 1;
    if (dy.expand) set[dy.expand.sent] = 1;
  }
  return set;
}
/* 그날 열려 있는 짝의 수 — 듣기 템플릿은 짝이 3개 미만이면 서지 못한다(english.js validate).
   ★날짜로 "2일차부터"라고 적지 않는다: 원장에 확장 문장이 늘거나 줄면 그 날짜가 달라지고,
   그때 검사기만 옛 날짜를 붙들고 있으면 틀린 쪽이 검사기가 된다. 조건 자체를 적는다. */
function pairsUptoCount(g, d) {
  var n = 0;
  for (var k = 1; k <= d; k++) n += 1 + (DATA.day(g, k).expand ? 1 : 0);
  return n;
}

function soundCheck(g, key, it, tag, vocab, sents) {
  var tid = (it.gen && it.gen.template_id) || '';

  /* ⓓ 소리 금지 템플릿 */
  if (SOUND_BAN.test(tid)) {
    T(!it.tts, key + tag + ' ' + tid + ' 에 소리가 붙었다 — 정답이 문장 쪽이라 읽어 주면 답이 샌다');
    return;
  }
  /* 소리를 실어야 할 자리에서 소리가 사라진 회귀(훅이 지워져도 전부 그린이던 상태) */
  if (SOUND_REQ.test(tid)) {
    T(!!(it.tts && it.tts.text), key + tag + ' ' + tid + ' 에 들려주는 말이 없다 — 3막이 다시 읽기만 측정한다');
  }
  if (!it.tts || !it.tts.text) return;

  var snd = String(it.tts.text);
  sndItems++;
  T(typeof it.tts.onscreen === 'boolean',
    key + tag + ' tts.onscreen 이 참·거짓이 아님: ' + JSON.stringify(it.tts.onscreen));

  /* ⓐ ★onscreen 참값 대조 — 주장이 아니라 사실인지 본다 */
  if (it.tts.onscreen) {
    T(it.q.indexOf(snd) >= 0,
      key + tag + ' onscreen:true 인데 발문에 그 말이 없다 — 보는 것과 듣는 것이 어긋남: 발문「' + it.q + '」 소리「' + snd + '」');
  } else {
    T(it.q.indexOf(snd) < 0,
      key + tag + ' onscreen:false 인데 발문이 그 문장을 이미 보여 준다 — 듣기가 아니게 됨: ' + it.q);
  }

  /* ⓑ 소리의 어휘 사다리 전수 — 귀로 나가는 영어도 그날까지 배운 것뿐이어야 한다.
     화면 검사(q|choices|explain)는 소리를 한 낱말도 보지 않는다. */
  englishUnits(snd).forEach(function (u) {
    sndWords++;
    T(DATA.covered(vocab, u), key + tag + ' 소리로 미배운 낱말이 나감: ' + u + '  (' + snd + ')');
  });

  /* ⓒ 누설 금지 — 보기를 그대로 읽어 주면 뜻을 몰라도 답이 들린다 */
  (it.choices || []).forEach(function (c) {
    T(String(c) !== snd, key + tag + ' 소리가 보기와 같다 — 답을 소리로 읽어 주는 꼴: ' + snd);
  });

  /* ⓕ 그날까지 원장에 실재하는 문장인가 */
  T(!!sents[snd], key + tag + ' 원장에 없거나 아직 안 배운 문장을 읽어 줌: ' + snd);
}

/* ⓔ 세트당 듣기 문항 수 — 라운드로빈 굶김 회귀 가드.
   core 는 usable[ti % 길이] 를 앞에서부터 돌며 10문항을 채우고 멈춘다. 듣기는 마지막 자리라
   템플릿이 11개가 되는 순간 **영영 안 뽑힌다**(전량 그린인 채로 듣기만 사라진다). */
function earCountCheck(g, key, d, items, tag) {
  var ear = items.filter(function (it) {
    return /^t_listen_/.test((it.gen && it.gen.template_id) || '');
  }).length;
  var want = pairsUptoCount(g, d) >= 3 ? 1 : 0;
  T(ear === want,
    key + tag + ' 세트당 듣기 문항 ' + ear + '개 (기대 ' + want + ') — 라운드로빈에서 굶었거나 겹쳤다');
}

/* ── ①③ 전수: 등록 · 문항수 · 만점 채점 · 어휘 사다리 ───────── */
DATA.grades().forEach(function (g) {
  var days = DATA.days(g);
  for (var i = 1; i <= days.length; i++) {
    var key = keyOf(g, i);
    T(C.has(key), key + ' 미등록');
    if (!C.has(key)) continue;

    var vocab = vocabUpto(g, i);
    var out = C.generate({ lesson: key, n: N, seed: 3 });
    T(out.items.length === N, key + ' 문항수 ' + out.items.length);

    var gr = C.gradeSet(out.items, out.items.map(function (it) { return it.answer; }));
    T(gr.score === gr.max && gr.max === N, key + ' 만점 채점 ' + gr.score + '/' + gr.max);

    var sents = sentsUpto(g, i);
    out.items.forEach(function (it, qi) {
      oracle(g, key, it, ' q' + qi);
      soundCheck(g, key, it, ' q' + qi, vocab, sents);
      var txt = it.q + ' | ' + (it.choices || []).join(' | ') + ' | ' + (it.explain || '');
      englishUnits(txt).forEach(function (u) {
        T(DATA.covered(vocab, u),
          key + ' q' + qi + ' 미배운 낱말 노출: ' + u + '  (' + it.q + ')');
      });
    });
    earCountCheck(g, key, i, out.items, '');
  }
});

/* ── ② 심층 표본: 4시드 × 학년별 5일차 ─────────────────────── */
DATA.grades().forEach(function (g) {
  var n = DATA.maxDay(g);
  [1, 2, 3, Math.ceil(n / 2), n].forEach(function (i) {
    var key = keyOf(g, i);
    var today = DATA.day(g, i);
    var vocab = vocabUpto(g, i);
    var sents = sentsUpto(g, i);

    SEEDS.forEach(function (seed) {
      combos++;
      var o = C.generate({ lesson: key, n: N, seed: seed });
      var qs = {}, hasToday = false, hasRev = false, dupQ = 0;

      o.items.forEach(function (it, qi) {
        if (qs[it.q]) dupQ++;
        qs[it.q] = 1;

        T(!!it.q && it.q.indexOf('undefined') < 0 && it.q.indexOf('null') < 0,
          key + ' seed' + seed + ' q' + qi + ' 발문 이상: ' + it.q);

        if (it.type === 'choice') {
          /* 보기 개수는 강제하지 않는다(설계 §5) — 대신 중복 0 과 정답 인덱스를 본다.
             다만 2지선다는 문제로 서지 않으므로 3개 이상은 요구한다. */
          T(it.choices && it.choices.length >= 3,
            key + ' seed' + seed + ' q' + qi + ' 보기 ' + ((it.choices || []).length) + '개');
          T(typeof it.answer === 'number' && it.answer >= 0 && it.answer < it.choices.length,
            key + ' seed' + seed + ' q' + qi + ' 정답 인덱스 범위 밖');
          var dup = {}, bad = 0;
          it.choices.forEach(function (c) { if (dup[c]) bad++; dup[c] = 1; });
          T(bad === 0, key + ' seed' + seed + ' q' + qi + ' 보기 안에 같은 값 중복');
        } else if (it.type === 'ox') {
          T(typeof it.answer === 'boolean', key + ' seed' + seed + ' q' + qi + ' OX 정답이 boolean 아님');
        }

        if (it.q.indexOf(today.sent) >= 0 || String(it.answer) === today.sent
          || it.q.indexOf(today.ko) >= 0 || String(it.answer) === today.ko
          || (it.explain || '').indexOf(today.sent) >= 0) hasToday = true;
        if (/_rev\b/.test(it.id || '') || /_rev_/.test(it.id || '')) hasRev = true;

        oracle(g, key, it, ' seed' + seed + ' q' + qi);
        soundCheck(g, key, it, ' seed' + seed + ' q' + qi, vocab, sents);
        var txt = it.q + ' | ' + (it.choices || []).join(' | ') + ' | ' + (it.explain || '');
        englishUnits(txt).forEach(function (u) {
          T(DATA.covered(vocab, u), key + ' seed' + seed + ' 미배운 낱말 노출: ' + u);
        });
      });
      earCountCheck(g, key, i, o.items, ' seed' + seed);

      /* 1일차는 문장이 하나뿐이라 서로 다른 발문 수가 문장 길이에 묶인다 —
         없는 재료를 지어내느니 중복을 허용한다(english.js 머리 주석). 2일차부터 0. */
      if (i >= 2) T(dupQ === 0, key + ' seed' + seed + ' 발문 중복 ' + dupQ + '건');

      T(hasToday, key + ' seed' + seed + ' 오늘 문장이 한 문항도 안 나옴');
      if (i >= 2) T(hasRev, key + ' seed' + seed + ' 복습 문항 0개(누적 미반영)');

      var again = C.generate({ lesson: key, n: N, seed: seed });
      T(again.items.map(function (a) { return a.q; }).join('§') ===
        o.items.map(function (a) { return a.q; }).join('§'),
        key + ' seed' + seed + ' 같은 시드 재생성 불일치');
    });
  });
});

/* ── ④ SQL 드리프트 ────────────────────────────────────────── */
var sqlPath = path.join(__dirname, '..', '..', 'sql', 'setup_morning.sql');
var sql = fs.readFileSync(sqlPath, 'utf8');
var body = (sql.match(/CREATE OR REPLACE FUNCTION ma_max_step[\s\S]*?\$[A-Za-z_]*\$;/) || [''])[0];
T(!!body, 'SQL 에서 ma_max_step 을 못 찾음');

var sqlMax = {};
body.replace(/p_subject\s*=\s*'english'\s*AND\s*p_grade\s+IN\s*\(([\d,\s]+)\)\s*THEN\s*(\d+)/g,
  function (_, gs, v) { gs.split(',').forEach(function (x) { sqlMax[Number(x.trim())] = Number(v); }); return ''; });
body.replace(/p_subject\s*=\s*'english'\s*AND\s*p_grade\s*=\s*(\d+)\s*THEN\s*(\d+)/g,
  function (_, gx, v) { sqlMax[Number(gx)] = Number(v); return ''; });

DATA.grades().forEach(function (g) {
  T(sqlMax[g] === DATA.maxDay(g),
    'g' + g + ' 일수 불일치 — SQL ma_max_step(english)=' + sqlMax[g] + ' vs 원장=' + DATA.maxDay(g));
});
/* ★원장에 없는 학년에 english 행이 있으면 안 된다.
   행이 있으면 교사가 그 학년에 영어를 걸었을 때 SQL 은 일차를 주는데 문제 세트가
   없어 학생 화면이 조용히 "준비 중"으로 죽는다 — 없는 학년은 없다고 말해야 한다. */
[1, 2, 3, 4, 5, 6].forEach(function (g) {
  if (DATA.grades().indexOf(g) >= 0) return;
  T(sqlMax[g] === undefined,
    'g' + g + ' 는 원장이 없는데 SQL english 행이 있음(' + sqlMax[g] + ') — 빈 과목을 약속하는 셈');
});

/* ── ⑤ 진도 시뮬 (ma_today 규칙 그대로) ───────────────────── */
DATA.grades().forEach(function (g) {
  var max = sqlMax[g], nextStep = 1;
  if (!max) return;
  for (var day = 1; day <= max + 4; day++) {
    var step = nextStep, mode = 'new';
    if (step > max) { mode = 'review'; step = ((step - 1) % max) + 1; }
    T(C.has(keyOf(g, step)), 'g' + g + ' ' + day + '일차 미등록 키 ' + keyOf(g, step));
    T(day > max ? mode === 'review' : mode === 'new', 'g' + g + ' ' + day + '일차 모드 이상: ' + mode);
    nextStep++;
  }
});

/* ★소리 절이 한 건도 안 돈 채로 그린이 나면 그건 검사가 아니라 침묵이다. */
T(sndItems > 0, '소리 문항을 한 건도 못 봤다 — 소리 절이 통째로 안 돌았다');
T(sndWords > 0, '소리의 영어 낱말을 한 개도 검사 못 했다 — 사다리 검사가 헛돌았다');

console.log('  · 소리 문항 ' + sndItems + '건 · 소리 영어 낱말 ' + sndWords + '개 사다리 대조');
console.log('\n조합 ' + combos + ' (표본 20일차 × 4시드) · 전수 160키 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
