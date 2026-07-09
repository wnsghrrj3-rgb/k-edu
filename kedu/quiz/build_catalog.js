/* build_catalog.js — 케이퀴즈 카탈로그 생성기
 * 전 템플릿을 로드해 '단원 전체' 키(_l 없는 키)만 추출 → catalog.json.
 * 교사가 케이박스 빌더에서 단원을 고를 재료(학년·과목·단원명·차시수).
 * 케이퀴즈 양산 때마다 재실행: node kedu/quiz/build_catalog.js
 */
'use strict';
global.self = global; global.window = global;
require('./kquiz-core.js');
var KQ = global.KQuiz;
var fs = require('fs');

var captured = [];
var origReg = KQ.core.register;
KQ.core.register = function (key, def) { captured.push(key); return origReg(key, def); };

var SUBJ = { math: '수학', korean: '국어', science: '과학', social: '사회', english: '영어' };
var files = fs.readdirSync('./templates').filter(function (f) { return /\.js$/.test(f); }).sort();

var units = [];
files.forEach(function (f) {
  captured.length = 0;
  var factory = require('./templates/' + f);
  if (typeof factory === 'function') factory(KQ);
  // 단원 전체 키 = g{N}_{subj}_u{N} 정확히 (뒤에 _l 또는 _l06_07 붙은 건 차시)
  var unitKey = null;
  var lessonCount = 0;
  captured.forEach(function (k) {
    if (/^g\d+_[a-z]+_u\d+$/.test(k)) unitKey = k;           // 단원 전체
    else if (/^g\d+_[a-z]+_u\d+_l/.test(k)) lessonCount++;    // 개별 차시(복합 차시키 포함)
  });
  if (!unitKey) return;
  var m = unitKey.match(/^g(\d+)_([a-z]+)_u(\d+)$/);
  // 단원명: 파일 앞부분 주석의 첫 「…」
  var txt = fs.readFileSync('./templates/' + f, 'utf8').slice(0, 900);
  var nm = txt.match(/[「『]([^」』]+)[」』]/);
  units.push({
    key: unitKey,
    grade: +m[1], subject: m[2], subjectKo: SUBJ[m[2]] || m[2],
    unit: 'u' + m[3], unitNo: +m[3],
    name: nm ? nm[1] : ('u' + m[3]),
    lessonCount: lessonCount
  });
});

// 정렬: 학년 → 과목 → 단원번호
units.sort(function (a, b) {
  return a.grade - b.grade || a.subject.localeCompare(b.subject) || a.unitNo - b.unitNo;
});

var out = { generated: new Date().toISOString(), version: 1, units: units };
fs.writeFileSync('./catalog.json', JSON.stringify(out, null, 2));
console.log('catalog.json 생성 — 단원 ' + units.length + '개');
units.forEach(function (u) {
  console.log('  ' + u.key + '  [' + u.grade + '학년 ' + u.subjectKo + ' ' + u.unitNo + '단원] 「' + u.name + '」 · 차시 ' + u.lessonCount);
});
