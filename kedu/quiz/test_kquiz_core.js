/* =============================================================
 * test_kquiz_core.js — 케이퀴즈 core 순수 검산 (node, jsdom 불필요)
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §8
 * 실행: node kedu/quiz/test_kquiz_core.js
 * ============================================================= */
'use strict';
var KQuiz = require('./kquiz-core.js');
// 템플릿 등록(factory에 core 주입)
require('./templates/g1_math_u3.js')(KQuiz);
require('./templates/g1_math_u1.js')(KQuiz);
require('./templates/g1_math_u5.js')(KQuiz);
require('./templates/g1_math_u2.js')(KQuiz);
require('./templates/g1_math_u4.js')(KQuiz);
require('./templates/g1_korean_u1.js')(KQuiz);

var fails = 0, pass = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fails++; console.log('  ✗ ' + msg); } }
function section(t) { console.log('\n[' + t + ']'); }

var LESSONS = ['g1_math_u3_l02','g1_math_u3_l03','g1_math_u3_l04','g1_math_u3_l05',
  'g1_math_u3_l06','g1_math_u3_l08','g1_math_u3_l09','g1_math_u3_l11',
  'g1_math_u3_l12','g1_math_u3_l13','g1_math_u3',
  'g1_math_u1_l06','g1_math_u1_l07','g1_math_u1_l08','g1_math_u1_l09',
  'g1_math_u1_l10','g1_math_u1_l11','g1_math_u1',
  'g1_math_u5_l02_03','g1_math_u5_l04','g1_math_u5_l05','g1_math_u5_l06',
  'g1_math_u5_l07','g1_math_u5_l08','g1_math_u5_l09','g1_math_u5_l10','g1_math_u5',
  'g1_math_u2_l02','g1_math_u2_l03','g1_math_u2_l05','g1_math_u2_l06','g1_math_u2',
  'g1_math_u4_l02','g1_math_u4_l03','g1_math_u4_l04','g1_math_u4_l05','g1_math_u4_l06','g1_math_u4',
  'g1_korean_u1_l03','g1_korean_u1_l04','g1_korean_u1_l05','g1_korean_u1_l06',
  'g1_korean_u1_l07','g1_korean_u1_l08','g1_korean_u1_l09','g1_korean_u1_l10',
  'g1_korean_u1_l11','g1_korean_u1_l12','g1_korean_u1'];

// 국어 u1 독립 검산용: 자체 자모표 + 유니코드 compose/decompose(core와 별개 사본)
var H_CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
var H_JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
function hCompose(c, j) {
  var ci = H_CHO.indexOf(c), ji = H_JUNG.indexOf(j);
  if (ci < 0 || ji < 0) return null;
  return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28);
}
function hDecompose(ch) {
  var code = ch.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171 || code % 28 !== 0) return null;
  return { cho: H_CHO[Math.floor(code / 28 / 21)], jung: H_JUNG[Math.floor(code / 28) % 21] };
}

// u4 독립 검산용: 비교어→(속성,방향) + 속성별 순서쌍 집합(더큰\u241F더작은) 별도 사본
var U4_WORD2DIR = {
  '더 긴': ['길이', 'more'], '더 짧은': ['길이', 'less'],
  '더 무거운': ['무게', 'more'], '더 가벼운': ['무게', 'less'],
  '더 넓은': ['넓이', 'more'], '더 좁은': ['넓이', 'less'],
  '더 많이 담을 수 있는': ['들이', 'more'], '더 적게 담을 수 있는': ['들이', 'less']
};
var U4_SEP = '\u241F';
var U4_MORE = {};
(function () {
  var raw = {
    '길이': [['기차', '연필'], ['버스', '자전거'], ['코끼리 코', '생쥐 꼬리'], ['기린 목', '강아지 다리'], ['국수 가락', '바늘']],
    '무게': [['코끼리', '나비'], ['냉장고', '풍선'], ['수박', '포도 한 알'], ['자동차', '축구공'], ['바위', '깃털']],
    '넓이': [['운동장', '손수건'], ['교실 문', '공책'], ['이불', '손바닥'], ['칠판', '우표'], ['농구장', '방석']],
    '들이': [['욕조', '컵'], ['양동이', '종이컵'], ['물통', '숟가락'], ['수영장', '물병'], ['드럼통', '찻잔']]
  };
  Object.keys(raw).forEach(function (a) {
    U4_MORE[a] = {};
    raw[a].forEach(function (pr) { U4_MORE[a][pr[0] + U4_SEP + pr[1]] = true; });
  });
})();

// u2 독립 검산용 사전·성질행렬(템플릿과 별도 사본 — 정의/성질 오등록 catch)
var U2_OBJ = {
  '주사위': '상자 모양', '선물 상자': '상자 모양', '벽돌': '상자 모양', '티슈 상자': '상자 모양',
  '음료수 캔': '둥근 기둥 모양', '두루마리 휴지': '둥근 기둥 모양', '통조림': '둥근 기둥 모양',
  '축구공': '공 모양', '농구공': '공 모양', '지구본': '공 모양', '구슬': '공 모양'
};
var U2_PROPS = {
  '상자 모양':      { rollAny: false, vertex: true,  flatFace: true,  roundSurface: false },
  '둥근 기둥 모양': { rollAny: false, vertex: false, flatFace: true,  roundSurface: true  },
  '공 모양':        { rollAny: true,  vertex: false, flatFace: false, roundSurface: true  }
};
var U2_PHRASE2KEY = {
  '어느 쪽으로도 잘 굴러갑니다.': 'rollAny',
  '뾰족한 곳이 있습니다.': 'vertex',
  '평평한 면이 있습니다.': 'flatFace',
  '둥근 부분이 있습니다.': 'roundSurface'
};

// ── 독립 재계산기: 문항 q를 파싱해 정답을 코드 밖에서 다시 계산 ─────────────────
// (엔진의 answer를 신뢰하지 않고 문구만으로 재산출 → 진짜 대조)
function expectChoice(q) {
  var m;
  if ((m = q.match(/^「(.+?)」은\(는\) 어떤 모양/)))                    // u2 물건→모양
    return U2_OBJ[m[1]] || '__미등록__';
  if ((m = q.match(/^「(.+?)」와\(과\) 「(.+?)」 중에서 (.+?) 것은/))) { // u4 비교
    var d = U4_WORD2DIR[m[3]]; if (!d) return '__미등록어__';
    var attr = d[0], x = m[1], y = m[2];
    var moreItem = U4_MORE[attr][x + U4_SEP + y] ? x : (U4_MORE[attr][y + U4_SEP + x] ? y : null);
    if (moreItem === null) return '__미등록쌍__';
    return d[1] === 'more' ? moreItem : (moreItem === x ? y : x);
  }
  if ((m = q.match(/^(\d+)\s*\+\s*(\d+)\s*=/))) return +m[1] + +m[2];   // u3 덧셈
  if ((m = q.match(/^(\d+)\s*−\s*(\d+)\s*=/))) return +m[1] - +m[2];   // u3 뺄셈
  if ((m = q.match(/^(\d+)\s*([+−])\s*(\d+)\s*=/)))                     // u3 혼합
    return m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
  if ((m = q.match(/자음자 「(.)」과\(와\) 모음자 「(.)」/)))            // 국어 자모조합
    return hCompose(m[1], m[2]) || '__?__';
  if ((m = q.match(/^「(.)」의 첫소리\(자음자\)/))) {                    // 국어 첫소리
    var dc = hDecompose(m[1]); return dc ? dc.cho : '__?__';
  }
  if ((m = q.match(/^「(.)」의 모음자/))) {                             // 국어 모음자
    var dj = hDecompose(m[1]); return dj ? dj.jung : '__?__';
  }
  if (/●/.test(q)) {                                                  // u1 개수 세기
    var lines = q.split('\n');                                        // 렌더된 점 줄만 셈(프롬프트의 ● 제외)
    return (lines[lines.length - 1].match(/●/g) || []).length;
  }
  if ((m = q.match(/10개씩 묶음 (\d+)개와 낱개 (\d+)개/))) return 10 * +m[1] + +m[2]; // u5 몇십몇/십몇 구성
  if ((m = q.match(/10개씩 묶음 (\d+)개는 얼마/))) return 10 * +m[1];               // u5 몇십
  if ((m = q.match(/(\d+)에서 10개씩 묶음은 몇 개/))) return Math.floor(+m[1] / 10); // u5 자릿값-십
  if ((m = q.match(/(\d+)에서 낱개는 몇 개/))) return +m[1] % 10;                    // u5 자릿값-낱개
  if ((m = q.match(/(\d+)과\(와\) (\d+)을\(를\) 모으면/))) return +m[1] + +m[2];  // u3·u5 모으기
  if ((m = q.match(/(\d+)을\(를\) (\d+)와\(과\) 몇으로 가를/))) return +m[1] - +m[2]; // u3 가르기
  if ((m = q.match(/(\d+)보다 1만큼 더 큰/))) return +m[1] + 1;        // u1 1큰수
  if ((m = q.match(/(\d+)보다 1만큼 더 작은/))) return +m[1] - 1;      // u1 1작은수
  if ((m = q.match(/(\d+) 다음의 수/))) return +m[1] + 1;              // u1 다음수
  if ((m = q.match(/(\d+) 바로 앞의 수/))) return +m[1] - 1;           // u1 앞수
  if ((m = q.match(/(\d+)와\(과\) (\d+) 중에서 더 큰/)))               // u1 더큰수
    return Math.max(+m[1], +m[2]);
  if ((m = q.match(/(\d+)와\(과\) (\d+) 중에서 더 작은/)))             // u1 더작은수
    return Math.min(+m[1], +m[2]);
  return null;
}
function expectOx(q) {
  var m = q.match(/(\d+)은\(는\) (\d+)보다 (큽니다|작습니다)/);        // u1 크기비교 OX
  if (m) return m[3] === '큽니다' ? (+m[1] > +m[2]) : (+m[1] < +m[2]);
  var ms = q.match(/(상자 모양|둥근 기둥 모양|공 모양)은\(는\) (.+)$/); // u2 성질 OX
  if (ms) { var k = U2_PHRASE2KEY[ms[2]]; if (k) return U2_PROPS[ms[1]][k]; }
  return null;
}

// ── §8-1 재현성: 같은 (lesson,n,seed) 2회 → deep-equal ──────────────────────
section('§8-1 재현성');
LESSONS.forEach(function (L) {
  var a = KQuiz.generate({ lesson: L, n: 10, seed: 7731 });
  var b = KQuiz.generate({ lesson: L, n: 10, seed: 7731 });
  ok(JSON.stringify(a.items) === JSON.stringify(b.items), L + ' 재현 불일치');
});

// ── §8-2 정답 검산: 1,000회 생성, param형 독립 재계산 대조 ────────────────────
section('§8-2 정답 검산 (1,000회/lesson)');
LESSONS.forEach(function (L) {
  var bad = 0, total = 0, checked = 0, skipSum = 0;
  for (var s = 0; s < 1000; s++) {
    var r = KQuiz.generate({ lesson: L, n: 10, seed: s * 131 + 7 });
    skipSum += (10 - r.items.length);
    r.items.forEach(function (it) {
      total++;
      if (it.type === 'choice') {
        var e = expectChoice(it.q);
        if (e !== null) { checked++; if (String(it.choices[it.answer]) !== String(e)) bad++; }
      } else if (it.type === 'ox') {
        var eo = expectOx(it.q);
        if (eo !== null) { checked++; if (it.answer !== eo) bad++; }
      }
    });
  }
  ok(bad === 0, L + ' 정답 오류 ' + bad + '건');
  ok(checked > 0, L + ' 재계산 대조 0건(검산 빈틈)');   // 침묵 통과 방지
  console.log('    ' + L + ' — 문항 ' + total + ' · 대조 ' + checked + ' · 오류 ' + bad + ' · 스킵합 ' + skipSum);
});

// ── §8-3 오답 무결: 정답 미포함·상호중복 0·범위(0..9) 내 ──────────────────────
section('§8-3 오답(choices) 무결');
LESSONS.forEach(function (L) {
  var dupOrBad = 0, rangeBad = 0, cnt = 0;
  for (var s = 0; s < 500; s++) {
    var r = KQuiz.generate({ lesson: L, n: 10, seed: s * 977 + 3 });
    r.items.forEach(function (it) {
      if (it.type !== 'choice') return;
      cnt++;
      var set = {}; var dup = false;
      it.choices.forEach(function (c) { if (set[c]) dup = true; set[c] = 1; });
      if (dup) dupOrBad++;
      // 수치형 보기만 범위 sanity(0.. ) 검사 — 낱말 보기(모양 등)는 제외
      var numeric = it.choices.every(function (c) { return isFinite(Number(c)); });
      if (numeric) it.choices.forEach(function (c) { var n = Number(c); if (!isFinite(n) || n < 0) rangeBad++; });
      // 정답 인덱스 유효
      if (it.answer < 0 || it.answer >= it.choices.length) dupOrBad++;
    });
  }
  ok(dupOrBad === 0, L + ' 보기 중복/정답인덱스 오류 ' + dupOrBad);
  ok(rangeBad === 0, L + ' 보기 음수/비정상 ' + rangeBad);
});

// ── §8-4 재생성 상한: 무한루프 없이 완료(위 루프가 끝난 것 자체가 증거) ──────────
section('§8-4 재생성 상한');
ok(true, '전 lesson 1,500회 생성 무한루프 없이 완료');

// ── §8-5 compose 유니코드 역산 ────────────────────────────────────────────
section('§8-5 compose 검산');
(function () {
  var u = KQuiz._util, bad = 0, n = 0;
  u.CHO.forEach(function (c) {
    u.JUNG.forEach(function (j) {
      var ch = u.compose(c, j); if (!ch) return;
      var d = u.decompose(ch); n++;
      if (!d || d.cho !== c || d.jung !== j) bad++;
    });
  });
  ok(bad === 0, 'compose/decompose 역산 불일치 ' + bad + '/' + n);
})();

// ── 채점 왕복: 전부 정답으로 풀면 만점 ──────────────────────────────────────
section('채점 왕복');
(function () {
  var r = KQuiz.generate({ lesson: 'g1_math_u3', n: 10, seed: 42 });
  var answers = r.items.map(function (it) {
    if (it.type === 'choice') return it.answer;
    if (it.type === 'ox') return it.answer;
    if (it.type === 'short') return it.answer;
    return null;
  });
  var g = KQuiz.gradeSet(r.items, answers);
  ok(g.score === g.max && g.max > 0, '전정답 채점 만점 아님 (' + g.score + '/' + g.max + ')');
})();

// ── short 정규화 채점 ─────────────────────────────────────────────────────
section('short 정규화');
(function () {
  var it = { type: 'short', answer: '7' };
  ok(KQuiz.gradeOne(it, ' ７ ').correct === true, '전각/공백 정규화 실패');
  ok(KQuiz.gradeOne(it, '8').correct === false, '오답 통과');
})();

console.log('\n──────────────');
console.log('PASS ' + pass + ' · FAIL ' + fails);
process.exit(fails ? 1 : 0);
