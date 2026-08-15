/* =============================================================
 * test_morning_chars.js — 교사용 「오늘의 한자」 제시 화면 스모크 (jsdom)
 *   실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_chars.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
var html = fs.readFileSync(path.join(ROOT, 'morning', 'chars.html'), 'utf8');
var dataJs = fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'templates', 'hanja_data.js'), 'utf8');
// 외부 스크립트 태그를 인라인으로 치환(jsdom이 네트워크/파일 로드를 안 하게)
html = html.replace('<script src="/kedu/quiz/templates/hanja_data.js"></script>',
                    '<script>' + dataJs + '</script>');

var pass = 0, fail = 0;
function T(c, m){ if(c) pass++; else { fail++; console.log('  ✗ ' + m); } }

function open(qs){
  var errs = [];
  var dom = new JSDOM(html, {
    url: 'https://keduclass.com/morning/chars.html' + (qs || ''),
    runScripts: 'dangerously', pretendToBeVisual: true
  });
  dom.virtualConsole.on('jsdomError', function(e){ errs.push(e.message); });
  var doc = dom.window.document;
  // ★ body.textContent 는 인라인 스크립트 원문까지 포함하므로 화면에 보이는 .wrap 만 본다
  function seen(){ return doc.querySelector('.wrap').textContent; }
  return { dom: dom, win: dom.window, doc: doc, errs: errs, seen: seen };
}

var D = require('./templates/hanja_data.js');

/* ── ① 회차별 목록 모드: 그 회차 글자가 빠짐없이 렌더되는가 ── */
D.grades().forEach(function(g){
  for (var s = 1; s <= D.stepCount(g); s++){
    var o = open('?grade=' + g + '&step=' + s);
    var cards = o.doc.querySelectorAll('.ch');
    var rows = D.step(g, s);
    T(cards.length === rows.length, 'g'+g+' s'+s+' 카드 '+cards.length+' ≠ 글자 '+rows.length);

    var shown = Array.prototype.map.call(o.doc.querySelectorAll('.ch .g'), function(e){ return e.textContent; });
    rows.forEach(function(r){ T(shown.indexOf(r.c) >= 0, 'g'+g+' s'+s+' 「'+r.c+'」 미표시'); });

    var hy = Array.prototype.map.call(o.doc.querySelectorAll('.ch .hy'), function(e){ return e.textContent; });
    rows.forEach(function(r){
      T(hy.indexOf(r.hun + ' ' + r.eum) >= 0, 'g'+g+' s'+s+' 「'+r.c+'」 훈음 미표시');
    });

    var body = o.seen();
    T(body.indexOf('undefined') < 0 && body.indexOf('[object') < 0, 'g'+g+' s'+s+' 화면에 undefined/[object');
    T(body.indexOf('null') < 0, 'g'+g+' s'+s+' 화면에 null 노출');
    T(body.indexOf(g+'학년') >= 0, 'g'+g+' s'+s+' 학년 안내 누락');
    T(o.errs.length === 0, 'g'+g+' s'+s+' 콘솔 에러: ' + o.errs[0]);
    o.dom.window.close();
  }
});

/* ── ② key= 형식 주소 (교사 현황판에서 넘어오는 경로) ── */
var k = open('?key=g6_hanja_s10');
T(k.doc.getElementById('g').value === '6', 'key= 로 학년 6 반영 안 됨');
T(k.doc.getElementById('s').value === '10', 'key= 로 회차 10 반영 안 됨');
T(k.doc.querySelectorAll('.ch').length === 10, 'key= 로 연 회차 카드 10개 아님');
k.dom.window.close();

/* ── ③ 제시 모드: 글자만 먼저, 누르면 훈·음이 드러난다 ── */
var v = open('?grade=4&step=1');
v.doc.getElementById('m-show').click();
var first = D.step(4,1)[0];
T(v.doc.querySelector('.stage .big').textContent === first.c, '제시 모드 첫 글자 불일치');
T(v.doc.querySelector('.reveal .ask') !== null, '처음엔 훈·음이 감춰져 있어야 함');
T(v.seen().indexOf(first.hun + ' ' + first.eum) < 0, '누르기 전에 훈·음이 새어 나옴');

v.doc.getElementById('big').click();
T(v.doc.querySelector('.reveal .hy') !== null, '누른 뒤 훈·음이 안 드러남');
T(v.doc.querySelector('.reveal .hy').textContent === first.hun + ' ' + first.eum, '드러난 훈·음 불일치');

v.doc.getElementById('next').click();
var second = D.step(4,1)[1];
T(v.doc.querySelector('.stage .big').textContent === second.c, '다음 글자 이동 실패');
T(v.doc.querySelector('.reveal .ask') !== null, '글자를 넘기면 훈·음이 다시 감춰져야 함');
T(v.doc.getElementById('prev').disabled === false, '두 번째에서 앞 버튼이 잠김');

// 마지막 글자까지 이동 → 뒤 버튼 잠김
var n4 = D.step(4,1).length;
for (var i = 1; i < n4 - 1; i++) v.doc.getElementById('next').click();
T(v.doc.getElementById('next').disabled === true, '마지막 글자에서 뒤 버튼이 안 잠김');
T(v.errs.length === 0, '제시 모드 콘솔 에러: ' + v.errs[0]);
v.dom.window.close();

/* ── ④ 마지막 5자 회차(4·5학년 8회차)도 제시 모드가 성립하는가 ── */
[4,5].forEach(function(g){
  var o = open('?grade='+g+'&step=8');
  o.doc.getElementById('m-show').click();
  T(o.doc.querySelectorAll('.dot').length === 5, 'g'+g+' s8 점 개수 5 아님');
  T(o.doc.getElementById('prev').disabled === true, 'g'+g+' s8 첫 글자에서 앞 버튼 안 잠김');
  T(o.seen().indexOf('마지막 회차라 조금 적어요') >= 0, 'g'+g+' s8 짧은 회차 안내 누락');
  o.dom.window.close();
});

/* ── ⑤ 범위 밖 주소를 넣어도 깨지지 않는가 ── */
[['?grade=9&step=1','학년'], ['?grade=4&step=99','회차'], ['?key=쓰레기','키'], ['','기본값']].forEach(function(c){
  var o = open(c[0]);
  T(o.doc.querySelectorAll('.ch').length > 0, c[1]+' 이상값에서 빈 화면');
  T(o.errs.length === 0, c[1]+' 이상값에서 콘솔 에러: ' + o.errs[0]);
  o.dom.window.close();
});

console.log('\n제시 화면 스모크 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
