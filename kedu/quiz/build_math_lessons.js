/* =============================================================
 * build_math_lessons.js — 아침수학 정본 명세 생성기
 *
 * 기준(준호 지시, 9.7차): **자기주도에 있는 차시가 정본이다.**
 *   케이퀴즈 세트가 있는 것만 긁어모으던 방식(8차)을 버리고,
 *   grade{g}/semester1/math 의 본차시 HTML 전부를 하루 1차시 사다리로 삼는다.
 *   케이퀴즈 세트는 이 사다리에 "이름 대조"로 매단다.
 *
 * ★ 단원 번호로 잇지 않는다. 5학년이 증거다:
 *   자기주도 3단원 = 약분과통분인데 케이퀴즈는 같은 내용을 u4 로 갖고 있다
 *   (케이퀴즈가 구교과서 차례로 만들어진 것). 번호로 이으면 엉뚱한 단원을 문다.
 *   → 단원은 정규화한 "이름"으로만 대조하고, 못 찾으면 즉시 중단한다.
 *
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/build_math_lessons.js
 * 산출: kedu/quiz/templates/math_lessons.js (데이터만, UMD)
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..', '..');

function die(msg) { console.error('✗ 중단: ' + msg); process.exit(1); }
function norm(name) { return String(name).replace(/[\s_]/g, ''); }

/* 낱말 구성이 같은데 어순만 다른 단원명 별칭 — 정규화 일치가 안 될 때만 여기로 */
var ALIAS = {
  '규칙찾기': '관계와규칙',                       // g4 u6 (구교과서 명칭)
  '직육면체의부피와겉넓이': '직육면체의겉넓이와부피' // g6 u6 (어순)
};

/* ── 1) 자기주도 본차시 스캔 ── */
function scanSelfDirected() {
  var inv = {};
  for (var g = 1; g <= 6; g++) {
    var base = path.join(ROOT, 'grade' + g, 'semester1', 'math');
    if (!fs.existsSync(base)) die('폴더 없음: ' + base);
    var units = [];
    fs.readdirSync(base).sort().forEach(function (d) {
      var m = d.match(/^(\d+)단원_(.+)$/);
      if (!m) return;
      var uno = +m[1], uname = m[2];
      var folder = path.join(base, d);
      var sub = path.join(folder, '재수정_v1');
      var dirs = [folder].concat(fs.existsSync(sub) ? [sub] : []);
      var lessons = {};
      dirs.forEach(function (sd) {
        fs.readdirSync(sd).sort().forEach(function (f) {
          if (!/\.html$/.test(f)) return;
          if (/_game_|_adv_|_advanced|_extra_/.test(f)) return;
          var mm = f.match(new RegExp('^g' + g + '_math_u(\\d+)_l?(\\d+(?:_\\d+)?)(?:_(.+))?\\.html$'));
          if (!mm) die('파일명 해석 불가: ' + sd + '/' + f);
          if (+mm[1] !== uno) die('폴더 ' + uno + '단원 안에 u' + mm[1] + ' 파일: ' + f);
          var l = mm[2];
          if (lessons[l]) die('중복 차시 g' + g + ' u' + uno + ' ' + l);
          lessons[l] = { l: l, title: mm[3] || null };
        });
      });
      var ordered = Object.keys(lessons)
        .sort(function (a, b) { return (+a.split('_')[0]) - (+b.split('_')[0]); })
        .map(function (k) { return lessons[k]; });
      if (!ordered.length) die('빈 단원: g' + g + ' ' + d);
      units.push({ unitNo: uno, name: uname, lessons: ordered });
    });
    units.sort(function (a, b) { return a.unitNo - b.unitNo; });
    if (!units.length) die('g' + g + ' 단원 0개');
    inv[g] = units;
  }
  return inv;
}

/* ── 2) 케이퀴즈 실등록 키 열거(register 후킹 — 문서가 아니라 실물) ── */
function scanQuiz() {
  var K = require('./kquiz-core.js');
  var cat = JSON.parse(fs.readFileSync(path.join(__dirname, 'catalog.json'), 'utf8'));
  var seen = [];
  var orig = K.register;
  K.register = function (k, d) { seen.push(k); return orig(k, d); };
  cat.units.filter(function (u) { return u.subject === 'math'; }).forEach(function (u) {
    var mod = require('./templates/' + u.key + '.js');
    if (typeof mod === 'function') mod(K);
  });
  K.register = orig;
  var byUnit = {};   // 'g5|약분과통분' → { catUnitNo, lessons:{'01':key,...} }
  cat.units.filter(function (u) { return u.subject === 'math'; }).forEach(function (u) {
    var id = 'g' + u.grade + '|' + norm(u.name);
    byUnit[id] = { grade: u.grade, catUnitNo: u.unitNo, name: u.name, lessons: {} };
  });
  seen.forEach(function (k) {
    var m = k.match(/^g(\d)_math_u(\d+)_l([\d_]+)$/);
    if (!m) return;
    var cu = cat.units.find(function (u) {
      return u.subject === 'math' && u.grade === +m[1] && u.unitNo === +m[2];
    });
    if (!cu) die('카탈로그에 없는 단원의 키: ' + k);
    byUnit['g' + m[1] + '|' + norm(cu.name)].lessons[m[3]] = k;
  });
  return byUnit;
}

/* ── 3) 이름 대조로 매달기 ── */
function link(inv, quiz) {
  var usedQuizUnits = {}, report = [];
  for (var g = 1; g <= 6; g++) {
    inv[g].forEach(function (u) {
      var key = 'g' + g + '|' + norm(u.name);
      var q = quiz[key];
      if (!q && ALIAS[norm(u.name)]) q = null;               // 별칭은 반대 방향(퀴즈→자기주도)으로 찾는다
      if (!q) {
        // 퀴즈 쪽 이름에 별칭을 적용해 재시도
        Object.keys(quiz).forEach(function (qk) {
          var parts = qk.split('|');
          if (+parts[0].slice(1) !== g) return;
          var qn = ALIAS[parts[1]] || parts[1];
          if (qn === norm(u.name)) q = quiz[qk];
        });
      }
      if (q) usedQuizUnits['g' + g + '|' + norm(q.name)] = true;
      var matched = 0;
      u.lessons.forEach(function (les) {
        les.quiz = null;
        if (q) {
          // 정확 일치('02_03'='02_03') 우선, 합본 차시는 첫 번호로도 대조('06_07'↔'06')
          if (q.lessons[les.l]) les.quiz = q.lessons[les.l];
          else if (les.l.indexOf('_') > 0 && q.lessons[les.l.split('_')[0]]) {
            les.quiz = q.lessons[les.l.split('_')[0]];
          }
        }
        if (les.quiz) matched++;
      });
      report.push('g' + g + ' ' + u.unitNo + '.' + u.name + ': ' + matched + '/' + u.lessons.length
        + (q ? (q.catUnitNo !== u.unitNo ? ' (퀴즈 u' + q.catUnitNo + ' ← 번호 불일치, 이름으로 연결)' : '')
             : ' (퀴즈 세트 없음 — 복습 구성)'));
    });
  }
  // 퀴즈 쪽 고아 단원(사다리에 못 매달린 세트) — 조용히 사라지면 안 되므로 중단
  Object.keys(quiz).forEach(function (qk) {
    if (!usedQuizUnits[qk] && Object.keys(quiz[qk].lessons).length) {
      die('케이퀴즈 단원이 자기주도에 연결되지 않음(별칭 필요?): ' + qk);
    }
  });
  // 퀴즈 쪽 고아 차시 검산
  var linkedKeys = {};
  for (var g2 = 1; g2 <= 6; g2++) inv[g2].forEach(function (u) {
    u.lessons.forEach(function (l) { if (l.quiz) linkedKeys[l.quiz] = true; });
  });
  Object.keys(quiz).forEach(function (qk) {
    Object.keys(quiz[qk].lessons).forEach(function (l) {
      var k = quiz[qk].lessons[l];
      if (!linkedKeys[k]) report.push('  ⚠ 고아 세트(자기주도에 짝 없음, 사다리 제외): ' + k);
    });
  });
  return report;
}

/* ── 4) 산출 ── */
var inv = scanSelfDirected();
var quiz = scanQuiz();
var report = link(inv, quiz);
report.forEach(function (r) { console.log(r); });

var counts = {};
for (var g = 1; g <= 6; g++) counts[g] = inv[g].reduce(function (s, u) { return s + u.lessons.length; }, 0);
console.log('\n일수: ' + [1,2,3,4,5,6].map(function (g) { return 'g' + g + ':' + counts[g]; }).join(' · ')
  + ' (합계 ' + Object.values(counts).reduce(function (a, b) { return a + b; }, 0) + ')');

var out = '/* 자동 생성 — 수정 금지. kedu/quiz/build_math_lessons.js 가 만든다.\n'
  + ' * 아침수학 정본 사다리: 자기주도 본차시 = 하루 1차시(준호 지시, 9.7차).\n'
  + ' * quiz 필드는 이름 대조로 매단 케이퀴즈 세트 키(없으면 null = 그날은 복습 구성). */\n'
  + '(function (root, factory) {\n'
  + "  if (typeof module === 'object' && module.exports) { module.exports = factory(); return; }\n"
  + '  root.KEDU_MATH_LESSONS = factory();\n'
  + "})(typeof self !== 'undefined' ? self : this, function () {\n"
  + "  'use strict';\n"
  + '  return ' + JSON.stringify(inv, null, 1).replace(/\n/g, '\n  ') + ';\n'
  + '});\n';
fs.writeFileSync(path.join(__dirname, 'templates', 'math_lessons.js'), out);
console.log('\n✅ templates/math_lessons.js 생성');
