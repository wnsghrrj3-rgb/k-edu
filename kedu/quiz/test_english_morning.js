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

    out.items.forEach(function (it, qi) {
      oracle(g, key, it, ' q' + qi);
      var txt = it.q + ' | ' + (it.choices || []).join(' | ') + ' | ' + (it.explain || '');
      englishUnits(txt).forEach(function (u) {
        T(DATA.covered(vocab, u),
          key + ' q' + qi + ' 미배운 낱말 노출: ' + u + '  (' + it.q + ')');
      });
    });
  }
});

/* ── ② 심층 표본: 4시드 × 학년별 5일차 ─────────────────────── */
DATA.grades().forEach(function (g) {
  var n = DATA.maxDay(g);
  [1, 2, 3, Math.ceil(n / 2), n].forEach(function (i) {
    var key = keyOf(g, i);
    var today = DATA.day(g, i);
    var vocab = vocabUpto(g, i);

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
        var txt = it.q + ' | ' + (it.choices || []).join(' | ') + ' | ' + (it.explain || '');
        englishUnits(txt).forEach(function (u) {
          T(DATA.covered(vocab, u), key + ' seed' + seed + ' 미배운 낱말 노출: ' + u);
        });
      });

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

console.log('\n조합 ' + combos + ' (표본 20일차 × 4시드) · 전수 160키 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
