/* =============================================================
 * test_morning_chars.js — 「오늘의 한자」 학습 화면 스모크 (jsdom)
 *   ① 획순 자산 정합성 — 화면이 부를 경로에 파일이 실제로 있는가
 *   ② 한눈에 보기 — 회차 글자·훈음이 빠짐없이 렌더되는가
 *   ③ 한 자씩 띄우기 — 훈·음 은닉 → 공개 → 이동 시 재은닉, 응용 낱말
 *   ④ 따라쓰기 — 획순 엔진에 quiz 를 옳은 인자로 붙이는가
 *   ⑤ 획순 자료 없는 글자 — 조용히 깨지지 않고 정직하게 비우는가
 *   ⑥ 이상값 방어
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_chars.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
var STROKE_DIR = path.join(ROOT, 'kedu', 'hanja', 'strokes');
var D = require('./templates/hanja_data.js');

var html = fs.readFileSync(path.join(ROOT, 'morning', 'chars.html'), 'utf8');
html = html.replace('<script src="/kedu/quiz/templates/hanja_data.js"></script>',
  '<script>' + fs.readFileSync(path.join(ROOT,'kedu','quiz','templates','hanja_data.js'),'utf8') + '</script>');
// 획순 엔진은 SVG 애니메이션이라 jsdom 에서 돌릴 게 못 된다.
// 여기서 보는 건 "무엇을 어떤 인자로 부르는가"(배선)이지 애니메이션 자체가 아니다.
html = html.replace('<script src="/kedu/hanja/hanzi-writer.min.js"></script>', '<script>' + [
  'window.__hw = { created: [], quizzes: [] };',
  'window.HanziWriter = { create: function(el, ch, opt){',
  '  window.__hw.created.push({ ch: ch, opt: opt });',
  '  var w = { animateCharacter: function(){ window.__hw.played = ch; },',
  '            animateStroke: function(){},',
  '            quiz: function(q){ window.__hw.quizzes.push({ ch: ch, q: q }); } };',
  '  return w; } };'
].join('\n') + '</script>');

var pass = 0, fail = 0;
function T(c, m){ if(c) pass++; else { fail++; if (fail <= 25) console.log('  x ' + m); } }

function open(qs){
  var errs = [];
  var dom = new JSDOM(html, {
    url: 'https://keduclass.com/morning/chars.html' + (qs || ''),
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse: function(win){
      // 화면이 실제로 요청하는 경로 그대로 디스크에서 읽는다 -> 경로가 틀리면 여기서 드러난다
      win.fetch = function(u){
        var m = String(u).match(/\/kedu\/hanja\/strokes\/(.+)\.json$/);
        var f = m ? path.join(STROKE_DIR, decodeURIComponent(m[1]) + '.json') : null;
        if (f && fs.existsSync(f)) {
          var j = JSON.parse(fs.readFileSync(f, 'utf8'));
          return Promise.resolve({ ok: true, json: function(){ return Promise.resolve(j); } });
        }
        return Promise.resolve({ ok: false, json: function(){ return Promise.reject(new Error('404')); } });
      };
    }
  });
  dom.virtualConsole.on('jsdomError', function(e){ errs.push(e.message); });
  var doc = dom.window.document;
  // body.textContent 는 인라인 스크립트 원문까지 포함하므로 보이는 .wrap 만 본다
  function seen(){ return doc.querySelector('.wrap').textContent; }
  function tick(){ return new Promise(function(r){ setTimeout(r, 0); }); }
  return { dom: dom, win: dom.window, doc: doc, errs: errs, seen: seen, tick: tick,
           hw: function(){ return dom.window.__hw; } };
}

(async function(){

/* -- (1) 획순 자산 정합성 -- */
var missing = JSON.parse(fs.readFileSync(path.join(ROOT,'kedu','hanja','MISSING.json'),'utf8'));
var missSet = {}; missing.forEach(function(c){ missSet[c]=1; });
var haveCount = 0;
D.grades().forEach(function(g){
  D.all(g).forEach(function(r){
    var f = path.join(STROKE_DIR, r.c + '.json');
    if (missSet[r.c]) {
      T(!fs.existsSync(f), '누락 목록에 있는데 파일이 있음: ' + r.c);
    } else {
      T(fs.existsSync(f), 'g'+g+' 「'+r.c+'」 획순 파일 없음(MISSING.json 에도 없음)');
      if (fs.existsSync(f)) {
        haveCount++;
        var j = JSON.parse(fs.readFileSync(f,'utf8'));
        T(Array.isArray(j.strokes) && j.strokes.length > 0, '「'+r.c+'」 strokes 비어 있음');
        T(Array.isArray(j.medians) && j.medians.length === j.strokes.length,
          '「'+r.c+'」 medians 수가 strokes 와 불일치');
      }
    }
  });
});
T(haveCount + missing.length === 400, '획순 파일 '+haveCount+' + 누락 '+missing.length+' != 400');
T(fs.existsSync(path.join(ROOT,'kedu','hanja','ARPHICPL.TXT')), '라이선스 사본 없음');
T(fs.existsSync(path.join(ROOT,'kedu','hanja','hanzi-writer.min.js')), '획순 엔진 파일 없음');

/* -- (2) 한눈에 보기 : 41회차 전수 -- */
var gs = D.grades();
for (var gi = 0; gi < gs.length; gi++) {
  var g = gs[gi];
  for (var s = 1; s <= D.stepCount(g); s++) {
    var o = open('?grade='+g+'&step='+s);
    var rws = D.step(g, s);
    T(o.doc.querySelectorAll('.ch').length === rws.length,
      'g'+g+' s'+s+' 카드 '+o.doc.querySelectorAll('.ch').length+' != 글자 '+rws.length);
    var shown = Array.prototype.map.call(o.doc.querySelectorAll('.ch .g'), function(e){ return e.textContent; });
    var hy = Array.prototype.map.call(o.doc.querySelectorAll('.ch .hy'), function(e){ return e.textContent; });
    var gg = g, ss = s;
    rws.forEach(function(r){
      T(shown.indexOf(r.c) >= 0, 'g'+gg+' s'+ss+' 「'+r.c+'」 미표시');
      T(hy.indexOf(r.hun+' '+r.eum) >= 0, 'g'+gg+' s'+ss+' 「'+r.c+'」 훈음 미표시');
    });
    var body = o.seen();
    T(body.indexOf('undefined') < 0 && body.indexOf('[object') < 0, 'g'+g+' s'+s+' 화면에 undefined/[object');
    T(body.indexOf('null') < 0, 'g'+g+' s'+s+' 화면에 null 노출');
    T(body.indexOf(g+'학년') >= 0, 'g'+g+' s'+s+' 학년 안내 누락');
    T(o.errs.length === 0, 'g'+g+' s'+s+' 콘솔 에러: ' + o.errs[0]);
    o.dom.window.close();
  }
}

/* -- (3) key= 주소(교사 현황판에서 넘어오는 경로) -- */
var k = open('?key=g6_hanja_s10');
T(k.doc.getElementById('g').value === '6', 'key= 로 학년 6 반영 안 됨');
T(k.doc.getElementById('s').value === '10', 'key= 로 회차 10 반영 안 됨');
T(k.doc.querySelectorAll('.ch').length === 10, 'key= 회차 카드 10개 아님');
k.dom.window.close();

/* -- (4) 한 자씩 띄우기 -- */
var v = open('?grade=4&step=1');
v.doc.getElementById('m-show').click();
var first = D.step(4,1)[0];
T(v.doc.getElementById('ghost').textContent === first.c, '제시 모드 첫 글자 불일치');
T(v.doc.querySelector('.reveal .ask') !== null, '처음엔 훈·음이 감춰져 있어야 함');
T(v.seen().indexOf(first.hun+' '+first.eum) < 0, '누르기 전에 훈·음이 새어 나옴');
await v.tick();
T(v.hw().created.length >= 1, '획순 엔진이 안 붙음');
T(v.hw().created[v.hw().created.length-1].ch === first.c, '엔진에 넘긴 글자 불일치');
T(v.hw().created[v.hw().created.length-1].opt.showCharacter === true, '제시 모드인데 글자가 안 보이는 설정');
T(v.doc.getElementById('sc').textContent.indexOf('획') > 0, '획수 표시 누락');

v.doc.getElementById('peek').click();
T(v.doc.querySelector('.reveal .hy') !== null, '누른 뒤 훈·음이 안 드러남');
T(v.doc.querySelector('.reveal .hy').textContent === first.hun+' '+first.eum, '드러난 훈·음 불일치');
T(v.doc.querySelector('.uses') !== null, '응용 낱말 영역 없음');
var uses = Array.prototype.map.call(v.doc.querySelectorAll('.use b'), function(e){ return e.textContent; });
T(uses.length > 0, '응용 낱말이 하나도 없음');
uses.forEach(function(w2){ T(w2.indexOf(first.c) >= 0, '응용 낱말 '+w2+' 에 「'+first.c+'」가 없음'); });

v.doc.getElementById('next').click();
T(v.doc.getElementById('ghost').textContent === D.step(4,1)[1].c, '다음 글자 이동 실패');
T(v.doc.querySelector('.reveal .ask') !== null, '글자를 넘기면 훈·음이 다시 감춰져야 함');
T(v.errs.length === 0, '제시 모드 콘솔 에러: ' + v.errs[0]);
v.dom.window.close();

/* -- (5) 따라쓰기 -- */
var w = open('?grade=4&step=1');
w.doc.getElementById('m-write').click();
await w.tick();
var c0 = D.step(4,1)[0].c;   // step() 은 객체를 준다 — 글자만 꺼낸다
T(w.hw().quizzes.length >= 1, '따라쓰기인데 quiz 가 안 붙음');
var q = w.hw().quizzes[w.hw().quizzes.length-1];
T(q.ch === c0, 'quiz 대상 글자 불일치');
T(typeof q.q.onComplete === 'function', 'onComplete 미배선(다 써도 표시가 안 남)');
T(typeof q.q.onMistake === 'function', 'onMistake 미배선');
T(q.q.showHintAfterMisses > 0, '틀렸을 때 힌트가 안 나옴');
var opt = w.hw().created[w.hw().created.length-1].opt;
T(opt.showCharacter === false, '따라쓰기인데 정답 글자가 그대로 보임');
T(opt.showOutline === true, '따라쓰기 안내선(윤곽)이 꺼져 있음');
T(w.doc.getElementById('hint') && !w.doc.getElementById('hint').disabled, '힌트 버튼 잠김');
T(w.doc.getElementById('again') && !w.doc.getElementById('again').disabled, '다시 버튼 잠김');
q.q.onComplete({});
T(w.seen().indexOf('다 썼어요') >= 0, '완주 안내 없음');
T(w.doc.querySelector('.dot[data-i="0"]').classList.contains('cleared'), '완주한 글자 표시 안 됨');
T(w.errs.length === 0, '따라쓰기 콘솔 에러: ' + w.errs[0]);
w.dom.window.close();

/* -- (6) 획순 자료 없는 글자는 정직하게 비운다 -- */
for (var mi = 0; mi < missing.length; mi++) {
  var ch = missing[mi];
  var loc = null;
  gs.forEach(function(g2){
    for (var s2 = 1; s2 <= D.stepCount(g2); s2++) {
      var arr = D.step(g2, s2);
      for (var i2 = 0; i2 < arr.length; i2++) if (arr[i2].c === ch) loc = { g:g2, s:s2, i:i2 };
    }
  });
  T(!!loc, '누락 글자 '+ch+' 의 회차를 못 찾음');
  if (!loc) continue;
  var o2 = open('?grade='+loc.g+'&step='+loc.s);
  o2.doc.getElementById('m-show').click();
  o2.doc.querySelector('.dot[data-i="'+loc.i+'"]').click();
  await o2.tick();
  T(o2.doc.querySelector('.nodata') !== null, ch+' : 획순 자료 없음 안내가 안 뜸');
  T(o2.seen().indexOf('획순 자료가 아직 없어요') >= 0, ch+' : 안내 문구 누락');
  T(o2.doc.getElementById('play').disabled === true, ch+' : 누를 수 없는 획순 버튼이 살아 있음');
  o2.doc.getElementById('peek').click();
  T(o2.doc.querySelector('.reveal .hy') !== null, ch+' : 자료가 없다고 뜻까지 막힘');
  T(o2.errs.length === 0, ch+' : 콘솔 에러 '+o2.errs[0]);
  o2.dom.window.close();
}

/* -- (7) 이상값 방어 -- */
[['?grade=9&step=1','학년'], ['?grade=4&step=99','회차'], ['?key=쓰레기','키'], ['','기본값']].forEach(function(c){
  var o3 = open(c[0]);
  T(o3.doc.querySelectorAll('.ch').length > 0, c[1]+' 이상값에서 빈 화면');
  T(o3.errs.length === 0, c[1]+' 이상값에서 콘솔 에러: ' + o3.errs[0]);
  o3.dom.window.close();
});

console.log('\n한자 학습 화면 스모크 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
})();
