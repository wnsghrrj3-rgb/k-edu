/* =============================================================
 * test_hanja_morning.js — 아침활동 한자: 학년×회차 전수 검산 (node)
 *   1~6학년 41회차 × 4시드 = 164조합
 *   실행: node kedu/quiz/test_hanja_morning.js
 * ============================================================= */
'use strict';
var CORE = require('./kquiz-core.js');            // node에서는 core 자체가 export된다
var D    = require('./templates/hanja_data.js');
require('./templates/hanja.js')({ core: CORE }, D); // 템플릿은 {core} 껍데기를 기대한다

var C = CORE;
var pass = 0, fail = 0, combos = 0;
function T(c, m) { if (c) pass++; else { fail++; if (fail <= 25) console.log('  ✗ ' + m); } }

var SEEDS = [1, 7, 424242, 987654321];

D.grades().forEach(function (g) {
  // 이 학년까지 누적 배정 글자(문항에 이 밖의 한자가 나오면 안 됨)
  var cum = {};
  D.grades().filter(function (x) { return x <= g; })
            .forEach(function (x) { D.all(x).forEach(function (r) { cum[r.c] = 1; }); });

  var n = D.stepCount(g);
  for (var s = 1; s <= n; s++) {
    var key = 'g' + g + '_hanja_s' + (s < 10 ? '0' + s : s);
    T(C.has(key), key + ' 미등록');
    if (!C.has(key)) continue;

    SEEDS.forEach(function (seed) {
      combos++;
      var out = C.generate({ lesson: key, n: 10, seed: seed });
      var items = out.items;
      T(items.length === 10, key + ' seed' + seed + ' 문항수 ' + items.length);

      var qs = {};
      items.forEach(function (it, i) {
        T(!qs[it.q], key + ' seed' + seed + ' 발문 중복: ' + it.q);
        qs[it.q] = 1;

        T(!!it.q && it.q.indexOf('undefined') < 0 && it.q.indexOf('null') < 0,
          key + ' seed' + seed + ' q' + i + ' 발문 이상: ' + it.q);

        if (it.type === 'choice') {
          T(it.choices && it.choices.length === 4, key + ' seed' + seed + ' q' + i + ' 보기 4개 아님');
          T(typeof it.answer === 'number' && it.answer >= 0 && it.answer < it.choices.length,
            key + ' seed' + seed + ' q' + i + ' 정답 인덱스 범위 밖');
          var dup = {}, bad = 0;
          it.choices.forEach(function (c) { if (dup[c]) bad++; dup[c] = 1; });
          T(bad === 0, key + ' seed' + seed + ' q' + i + ' 보기 안에 같은 값 중복');
        } else if (it.type === 'ox') {
          T(typeof it.answer === 'boolean', key + ' seed' + seed + ' q' + i + ' OX 정답이 boolean 아님');
        } else if (it.type === 'short') {
          T(typeof it.answer === 'string' && it.answer.length > 0,
            key + ' seed' + seed + ' q' + i + ' 단답 정답 비어 있음');
        }

        // 어휘 사다리: 발문·보기·해설에 아직 안 배운 한자가 등장하면 안 된다
        var txt = it.q + '|' + (it.choices || []).join('|') + '|' + (it.explain || '');
        Array.from(txt).forEach(function (ch) {
          if (/[\u4e00-\u9fff]/.test(ch)) {
            T(!!cum[ch], key + ' seed' + seed + ' q' + i + ' 미배운 한자 노출: ' + ch + ' (' + it.q + ')');
          }
        });
      });

      // 만점 채점 일치
      var gr = C.gradeSet(items, items.map(function (it) { return it.answer; }));
      T(gr.score === gr.max && gr.max === 10,
        key + ' seed' + seed + ' 만점 채점 불일치 ' + gr.score + '/' + gr.max);

      // 재현성: 같은 seed면 같은 문항
      var again = C.generate({ lesson: key, n: 10, seed: seed });
      T(again.items.map(function (i2) { return i2.q; }).join('§') ===
        items.map(function (i2) { return i2.q; }).join('§'),
        key + ' seed' + seed + ' 같은 시드 재생성 불일치');
    });

    // 2회차부터는 복습 문항이 섞여야 한다
    if (s >= 2) {
      var o = C.generate({ lesson: key, n: 10, seed: 1 });
      var rev = o.items.filter(function (it) { return /_rev_|_rev\b/.test(it.id || ''); }).length;
      T(rev > 0, key + ' 복습 문항 0개(2회차 이상인데 누적 미반영)');
    }
  }
});


/* ── SQL 회차표 드리프트 검사 ────────────────────────────────
 *  sql/setup_morning.sql 의 ma_max_step() 이 hanja_data.js 와 어긋나면
 *  4~6학년 학생이 뒷 회차를 영영 못 받는다(조용히 복습으로 빠짐). 여기서 잡는다. */
var fs = require('fs'), path = require('path');
var sqlPath = path.join(__dirname, '..', '..', 'sql', 'setup_morning.sql');
var sql = fs.readFileSync(sqlPath, 'utf8');
// 종료 표지는 달러 태그 이름을 가리지 않는다($$ · $fn$ 등 무엇이든 받는다).
// 태그를 바꿨다고 검사기가 조용히 눈감는 일이 없도록.
var body = (sql.match(/CREATE OR REPLACE FUNCTION ma_max_step[\s\S]*?\$[A-Za-z_]*\$;/) || [''])[0];
T(!!body, 'SQL 에서 ma_max_step 을 못 찾음');

var sqlMax = {};
// ★ p_subject 를 반드시 함께 물린다. 과목이 한자뿐일 때는 p_grade 만 봐도 맞았지만,
//   수학 행이 추가되자 뒤에 오는 math 값이 hanja 값을 덮어써 6건이 오검출됐다.
//   과목이 더 늘어도(영어 등) 이 검사가 흔들리지 않게 한다.
body.replace(/p_subject\s*=\s*'hanja'\s*AND\s*p_grade\s+IN\s*\(([\d,\s]+)\)\s*THEN\s*(\d+)/g, function (_, gs, v) {
  gs.split(',').forEach(function (g) { sqlMax[Number(g.trim())] = Number(v); }); return '';
});
body.replace(/p_subject\s*=\s*'hanja'\s*AND\s*p_grade\s*=\s*(\d+)\s*THEN\s*(\d+)/g, function (_, g, v) {
  sqlMax[Number(g)] = Number(v); return '';
});

D.grades().forEach(function (g) {
  // ★ 진도 단위 = 하루 1자. SQL 상한은 그 학년 글자 수와 같아야 한다.
  T(sqlMax[g] === D.all(g).length,
    'g' + g + ' 일차 불일치 — SQL ma_max_step=' + sqlMax[g] + ' vs 글자 수=' + D.all(g).length);
});

/* ── 진도 시뮬 : ma_today 규칙대로 회차를 돌려 키가 전부 실재하는지 ── */
D.grades().forEach(function (g) {
  var max = sqlMax[g], nextStep = 1;
  for (var day = 1; day <= max + 4; day++) {          // 전체 글자 + 복습 4일
    var step = nextStep, mode = 'new';
    if (step > max) { mode = 'review'; step = ((step - 1) % max) + 1; }
    var key = 'g' + g + '_hanja_c' + ('00' + step).slice(-3);   // ma_today 의 lpad(3) 그대로
    T(C.has(key), 'g' + g + ' ' + day + '일차 미등록 키 ' + key);
    T(day > max ? mode === 'review' : mode === 'new',
      'g' + g + ' ' + day + '일차 모드 이상: ' + mode);
    nextStep++;
  }
});


/* ── 하루 1자(c 키) 전수 + 표본 심층 ────────────────────────────
 *  전수(400키 × 1시드): 등록·문항수·만점 채점.
 *  표본(학년별 1·2·중간·마지막 일차 × 4시드): 발문 중복 0·보기·재현성·복습 혼입·오늘 글자 포함. */
D.grades().forEach(function (g) {
  var all = D.all(g), n = all.length;
  var cum = {};
  D.grades().filter(function (x) { return x <= g; })
            .forEach(function (x) { D.all(x).forEach(function (r) { cum[r.c] = 1; }); });

  for (var i = 1; i <= n; i++) {
    var key = 'g' + g + '_hanja_c' + ('00' + i).slice(-3);
    T(C.has(key), key + ' 미등록');
    var out = C.generate({ lesson: key, n: 10, seed: 3 });
    T(out.items.length === 10, key + ' 문항수 ' + out.items.length);
    var gr = C.gradeSet(out.items, out.items.map(function (it) { return it.answer; }));
    T(gr.score === gr.max && gr.max === 10, key + ' 만점 채점 ' + gr.score + '/' + gr.max);
  }

  [1, 2, Math.ceil(n / 2), n].forEach(function (i2) {
    var key2 = 'g' + g + '_hanja_c' + ('00' + i2).slice(-3);
    var today = all[i2 - 1].c;
    SEEDS.forEach(function (seed) {
      combos++;
      var o = C.generate({ lesson: key2, n: 10, seed: seed });
      var qs = {}, hasToday = false, hasRev = false;
      o.items.forEach(function (it, qi) {
        T(!qs[it.q], key2 + ' seed' + seed + ' 발문 중복: ' + it.q);
        qs[it.q] = 1;
        if (it.q.indexOf(today) >= 0 || String(it.answer).indexOf(today) >= 0) hasToday = true;
        if (/_rev_/.test(it.id || '')) hasRev = true;
        if (it.type === 'choice') {
          T(it.choices && it.choices.length === 4, key2 + ' seed' + seed + ' q' + qi + ' 보기 4개 아님');
          var dup = {}, bad = 0;
          it.choices.forEach(function (c) { if (dup[c]) bad++; dup[c] = 1; });
          T(bad === 0, key2 + ' seed' + seed + ' q' + qi + ' 보기 중복');
        }
        var txt = it.q + '|' + (it.choices || []).join('|') + '|' + (it.explain || '');
        Array.from(txt).forEach(function (chx) {
          if (/[\u4e00-\u9fff]/.test(chx))
            T(!!cum[chx], key2 + ' seed' + seed + ' 미배운 한자 노출: ' + chx);
        });
      });
      T(hasToday, key2 + ' seed' + seed + ' 오늘 글자 「' + today + '」 문항이 하나도 없음');
      if (i2 >= 2) T(hasRev, key2 + ' seed' + seed + ' 복습 문항 0개');
      var again = C.generate({ lesson: key2, n: 10, seed: seed });
      T(again.items.map(function (a) { return a.q; }).join('§') ===
        o.items.map(function (a) { return a.q; }).join('§'),
        key2 + ' seed' + seed + ' 같은 시드 재생성 불일치');
    });
  });
});

console.log('\n조합 ' + combos + ' (s키 41 + c키 표본 24, 각 × 4시드) — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
