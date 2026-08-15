/* =============================================================
 * test_morning_chars.js — 「오늘의 한자」 하루 1자 활동 스모크 (jsdom)
 *   ① 획순 자산 정합성
 *   ② 1막 만나기 — 획순이 먼저, 훈음이 뒤따라
 *   ③ 2막 열 번 쓰기 — 비계(보고→떠올려→혼자)가 실제로 줄어드는가,
 *      선 판정이 마지막 구간에서 깐깐해지는가, 도장 10개가 쌓이는가
 *   ④ 3막 낱말 — 짝짓기·글자 찾기·낱말 없음 세 갈래
 *   ⑤ 완주 기록(localStorage) → 둘러보기 도장
 *   ⑥ 옛 s키·c키·이상값 주소
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
// 여기서 보는 건 "무엇을 어떤 인자로 부르는가"(배선)이지 그림 자체가 아니다.
html = html.replace('<script src="/kedu/hanja/hanzi-writer.min.js"></script>', '<script>' + [
  'window.__hw = { created: [], quizzes: [], anims: [] };',
  'window.HanziWriter = { create: function(el, ch, opt){',
  '  var rec = { ch: ch, opt: opt };',
  '  window.__hw.created.push(rec);',
  '  var w = {',
  '    animateCharacter: function(o){ window.__hw.anims.push({ ch: ch, o: o }); },',
  '    animateStroke: function(){},',
  '    cancelQuiz: function(){},',
  '    quiz: function(q){ window.__hw.quizzes.push({ ch: ch, q: q, opt: opt }); }',
  '  };',
  '  rec.w = w; return w; } };'
].join('\n') + '</script>');

var pass = 0, fail = 0;
function T(c, m){ if(c) pass++; else { fail++; if (fail <= 30) console.log('  x ' + m); } }

function open(qs, pre){
  var errs = [];
  var dom = new JSDOM(html, {
    url: 'https://keduclass.com/morning/chars.html' + (qs || ''),
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse: function(win){
      // 화면이 실제로 요청하는 경로 그대로 디스크에서 읽는다 — 경로가 틀리면 여기서 드러난다
      win.fetch = function(u){
        var m = String(u).match(/\/kedu\/hanja\/strokes\/(.+)\.json$/);
        var f = m ? path.join(STROKE_DIR, decodeURIComponent(m[1]) + '.json') : null;
        if (f && fs.existsSync(f)) {
          var j = JSON.parse(fs.readFileSync(f, 'utf8'));
          return Promise.resolve({ ok: true, json: function(){ return Promise.resolve(j); } });
        }
        return Promise.resolve({ ok: false, json: function(){ return Promise.reject(new Error('404')); } });
      };
      // 라운드 전환의 setTimeout(600ms)을 0으로 — 시험이 실시간을 기다릴 이유가 없다
      var orig = win.setTimeout.bind(win);
      win.__t0 = orig;
      win.setTimeout = function(f){ return orig(f, 0); };
      if (pre) pre(win);
    }
  });
  dom.virtualConsole.on('jsdomError', function(e){ errs.push(e.message); });
  var doc = dom.window.document;
  function seen(){ return doc.getElementById('app').textContent; }
  function tick(n){
    n = n || 2;
    var p = Promise.resolve();
    for (var i = 0; i < n; i++) p = p.then(function(){
      return new Promise(function(r){ dom.window.__t0(r, 0); });
    });
    return p;
  }
  return { dom: dom, win: dom.window, doc: doc, errs: errs, seen: seen, tick: tick,
           hw: function(){ return dom.window.__hw; } };
}

/* 오늘 글자 하나를 만나기→열 번 쓰기까지 끌고 간다 */
async function driveToWords(o){
  await o.tick(3);
  var meetAnim = o.hw().anims[o.hw().anims.length-1];
  if (meetAnim && meetAnim.o && meetAnim.o.onComplete) meetAnim.o.onComplete();
  o.doc.getElementById('go-write').click();
  for (var r = 1; r <= 10; r++) {
    await o.tick(3);
    var q = o.hw().quizzes[o.hw().quizzes.length-1];
    q.q.onComplete({});
    await o.tick(3);
  }
  await o.tick(3);
}

(async function(){

/* -- (1) 획순 자산 정합성 -- */
var missing = JSON.parse(fs.readFileSync(path.join(ROOT,'kedu','hanja','MISSING.json'),'utf8'));
var missSet = {}; missing.forEach(function(c){ missSet[c]=1; });
var haveCount = 0;
D.grades().forEach(function(g){
  D.all(g).forEach(function(r){
    var f = path.join(STROKE_DIR, r.c + '.json');
    if (missSet[r.c]) { T(!fs.existsSync(f), '누락 목록에 있는데 파일이 있음: ' + r.c); return; }
    T(fs.existsSync(f), 'g'+g+' 「'+r.c+'」 획순 파일 없음');
    if (fs.existsSync(f)) {
      haveCount++;
      var j = JSON.parse(fs.readFileSync(f,'utf8'));
      T(Array.isArray(j.strokes) && j.strokes.length > 0, '「'+r.c+'」 strokes 비어 있음');
      T(Array.isArray(j.medians) && j.medians.length === j.strokes.length, '「'+r.c+'」 medians 수 불일치');
    }
  });
});
T(haveCount + missing.length === 400, '획순 '+haveCount+' + 누락 '+missing.length+' != 400');
T(fs.existsSync(path.join(ROOT,'kedu','hanja','ARPHICPL.TXT')), '라이선스 사본 없음');

/* -- (2) 1막 만나기 -- */
var o = open('?grade=4&char=15');
await o.tick(3);
var x15 = D.all(4)[14];
T(o.seen().indexOf('15일째') >= 0, '일차 표기 누락');
T(o.seen().indexOf('3주') >= 0, '주 표기 누락(15일째 = 3주)');
var hy = o.doc.getElementById('hy');
T(!hy.classList.contains('in'), '획순이 끝나기 전에 훈음이 먼저 떠 있음');
var created = o.hw().created[o.hw().created.length-1];
T(created.ch === x15.c, '만나기 글자 불일치');
T(created.opt.showCharacter === false, '만나기: 글자를 미리 보여주면 획순 연출이 무의미');
T(o.hw().anims.length >= 1, '만나기에서 획순이 자동 재생되지 않음');
var an = o.hw().anims[o.hw().anims.length-1];
an.o.onComplete();
T(hy.classList.contains('in'), '획순이 끝나도 훈음이 안 나타남');
T(hy.textContent.indexOf(x15.hun) >= 0 && hy.textContent.indexOf(x15.eum) >= 0, '훈음 내용 불일치');
T(o.doc.getElementById('sc').textContent.indexOf('획') > 0, '획수 표기 누락');

/* -- (3) 2막 열 번 쓰기: 비계와 판정 -- */
o.doc.getElementById('go-write').click();
var expect = [
  {r:1,outline:true, hint:2, len:1.0}, {r:3,outline:true, hint:2, len:1.0},
  {r:4,outline:false,hint:2, len:1.0}, {r:7,outline:false,hint:2, len:1.0},
  {r:8,outline:false,hint:3, len:0.85},{r:10,outline:false,hint:3, len:0.85}
];
var seenCfg = {};
for (var r = 1; r <= 10; r++) {
  await o.tick(3);
  T(o.seen().indexOf(r+'번째') >= 0, r+'회: 몇 번째인지 표기 누락');
  T(o.doc.querySelectorAll('.cell').length === 10, r+'회: 도장 받침이 10칸이 아님');
  T(o.doc.querySelectorAll('.cell .seal').length === r-1, r+'회: 쌓인 도장 '+o.doc.querySelectorAll('.cell .seal').length+' != '+(r-1));
  var q = o.hw().quizzes[o.hw().quizzes.length-1];
  T(q.ch === x15.c, r+'회: quiz 글자 불일치');
  T(q.opt.showCharacter === false, r+'회: 정답 글자가 그대로 보임');
  T(typeof q.q.onComplete === 'function' && typeof q.q.onMistake === 'function', r+'회: 콜백 미배선');
  seenCfg[r] = { outline:q.opt.showOutline, hint:q.q.showHintAfterMisses, len:q.opt.leniency };
  q.q.onComplete({});
  await o.tick(3);
}
expect.forEach(function(e){
  var c = seenCfg[e.r];
  T(c.outline === e.outline, e.r+'회 본(윤곽) '+c.outline+' != '+e.outline+' — 비계가 안 줄어듦');
  T(c.hint === e.hint, e.r+'회 힌트 문턱 '+c.hint+' != '+e.hint);
  T(Math.abs(c.len - e.len) < 1e-9, e.r+'회 판정 '+c.len+' != '+e.len+' — 혼자 쓰기 구간이 깐깐해지지 않음');
});
T(seenCfg[8].len < seenCfg[1].len, '마지막 구간 판정이 처음보다 엄격하지 않음');
await o.tick(3);

/* -- (4) 3막 낱말: 짝짓기(≥2) -- */
T(o.seen().indexOf('낱말') >= 0, '열 번을 다 썼는데 낱말 마당으로 안 넘어감');
var ws15 = D.wordsWith(x15.c, 4);
if (ws15.length >= 2) {
  T(o.doc.querySelectorAll('.mitem.hj').length === ws15.length, '짝짓기 낱말 수 불일치');
} // 短 은 낱말 1개일 수 있음 — 아래에서 두 갈래를 각각 따로 검증한다
o.dom.window.close();

/* 짝짓기 갈래: 낱말 2개 이상인 글자를 골라 정면 검증 */
var gM = null, ciM = 0;
D.grades().some(function(g){
  return D.all(g).some(function(r,i){
    if (D.wordsWith(r.c, g).length >= 2) { gM = g; ciM = i+1; return true; } return false;
  });
});
T(gM !== null, '낱말 2개 이상인 글자를 못 찾음(사전 이상)');
var m = open('?grade='+gM+'&char='+ciM);
await driveToWords(m);
var wsM = D.wordsWith(D.all(gM)[ciM-1].c, gM);
T(m.doc.querySelectorAll('.mitem.hj').length === wsM.length, '짝짓기: 낱말 칸 수 불일치');
T(m.doc.querySelectorAll('.mitem:not(.hj)').length === wsM.length, '짝짓기: 뜻 칸 수 불일치');
// 오늘 글자는 낱말 안에서 인주색으로 짚인다
T(m.doc.querySelectorAll('.mitem.hj .hit').length >= wsM.length, '낱말 속 오늘 글자 강조 누락');
// 틀린 짝: 잠기지 않는다
var hj0 = m.doc.querySelector('.mitem.hj[data-w="0"]');
hj0.click();
var wrongK = m.doc.querySelector('.mitem[data-k]:not(.hj):not([data-k="0"])');
wrongK.click();
T(!wrongK.classList.contains('lock'), '틀린 짝이 잠김');
T(m.seen().indexOf('다시 생각') >= 0, '틀린 짝 안내 없음');
// 전부 옳게 짝짓기
for (var wi = 0; wi < wsM.length; wi++) {
  m.doc.querySelector('.mitem.hj[data-w="'+wi+'"]').click();
  m.doc.querySelector('.mitem[data-k="'+wi+'"]:not(.hj)').click();
}
T(m.doc.querySelectorAll('.mitem.lock').length === wsM.length*2, '짝짓기 완주 후 잠김 수 불일치');
T(m.doc.getElementById('finrow').style.display !== 'none', '짝짓기 끝났는데 마무리 버튼이 안 열림');
m.doc.getElementById('fin').click();
T(m.doc.querySelector('.bigseal') !== null, '완주 낙관이 안 찍힘');
T(m.seen().indexOf('완성') >= 0, '완주 안내 없음');
var doneStored = JSON.parse(m.win.localStorage.getItem('kedu_hanja_done_g'+gM) || '{}');
T(doneStored[ciM] === 1, '완주 기록이 남지 않음');
T(m.errs.length === 0, '짝짓기 콘솔 에러: ' + m.errs[0]);
m.dom.window.close();

/* 글자 찾기 갈래: 낱말이 정확히 1개인 글자 */
var gF = null, ciF = 0;
D.grades().some(function(g){
  return D.all(g).some(function(r,i){
    if (D.wordsWith(r.c, g).length === 1) { gF = g; ciF = i+1; return true; } return false;
  });
});
T(gF !== null, '낱말 1개인 글자를 못 찾음');
var f = open('?grade='+gF+'&char='+ciF);
await driveToWords(f);
var xf = D.all(gF)[ciF-1], wf = D.wordsWith(xf.c, gF)[0];
T(f.doc.getElementById('fw') !== null, '글자 찾기 판이 안 뜸');
T(f.doc.querySelectorAll('#fw button').length === wf.word.length, '글자 버튼 수가 낱말 길이와 다름');
// 오답 글자 먼저
var wrongBtn = null;
f.doc.querySelectorAll('#fw button').forEach(function(b){ if (b.dataset.c !== xf.c && !wrongBtn) wrongBtn = b; });
if (wrongBtn) { wrongBtn.click();
  T(f.seen().indexOf('그 글자가 아니에요') >= 0, '오답 글자 안내 없음');
  T(f.doc.getElementById('finrow').style.display === 'none', '오답인데 마무리가 열림'); }
// 정답 글자
var rightBtn = null;
f.doc.querySelectorAll('#fw button').forEach(function(b){ if (b.dataset.c === xf.c && !rightBtn) rightBtn = b; });
rightBtn.click();
T(f.seen().indexOf('찾았어요') >= 0, '정답 글자 안내 없음');
T(f.doc.getElementById('finrow').style.display !== 'none', '정답인데 마무리가 안 열림');
T(f.errs.length === 0, '글자 찾기 콘솔 에러: ' + f.errs[0]);
f.dom.window.close();

/* 낱말 없음 갈래 */
var gZ = null, ciZ = 0;
D.grades().some(function(g){
  return D.all(g).some(function(r,i){
    if (D.wordsWith(r.c, g).length === 0) { gZ = g; ciZ = i+1; return true; } return false;
  });
});
if (gZ !== null) {
  var z = open('?grade='+gZ+'&char='+ciZ);
  await driveToWords(z);
  T(z.seen().indexOf('낱말은 아직 사전에 없어요') >= 0, '낱말 없음 안내 누락');
  T(z.doc.getElementById('fin') !== null, '낱말 없어도 끝낼 수 있어야 함');
  z.dom.window.close();
}

/* -- (5) 완주 기록 → 둘러보기 도장 -- */
var b = open('?grade='+gM, function(win){
  var mm = {}; mm[ciM] = 1;
  win.localStorage.setItem('kedu_hanja_done_g'+gM, JSON.stringify(mm));
});
await b.tick(2);
var allG = D.all(gM), weeks = Math.ceil(allG.length/5);
T(b.doc.querySelectorAll('.week').length === weeks, '둘러보기 주 수 '+b.doc.querySelectorAll('.week').length+' != '+weeks);
T(b.doc.querySelectorAll('.wg').length === allG.length, '둘러보기 글자 칸 수 불일치');
T(b.seen().indexOf(weeks+'주') >= 0, '몇 주 걸리는지 안내 누락');
T(b.doc.querySelectorAll('.wg .mini').length === 1, '완주 도장이 둘러보기에 안 찍힘');
T(b.errs.length === 0, '둘러보기 콘솔 에러: ' + b.errs[0]);
b.dom.window.close();

/* -- (6) 주소 세 갈래 + 이상값 -- */
var l1 = open('?key=g4_hanja_c015'); await l1.tick(2);
T(l1.seen().indexOf('15일째') >= 0, 'c키 주소가 일차로 안 풀림'); l1.dom.window.close();
var l2 = open('?key=g4_hanja_s08'); await l2.tick(2);
T(l2.seen().indexOf('71일째') >= 0, '옛 s키(8회차)가 71일째(그 회차 첫 글자)로 안 풀림'); l2.dom.window.close();
var l3 = open('?grade=9&char=999'); await l3.tick(2);
T(l3.seen().length > 0 && l3.errs.length === 0, '이상값에서 깨짐'); l3.dom.window.close();
var l4 = open(''); await l4.tick(2);
T(l4.doc.querySelectorAll('.wg').length > 0, '주소 없이 열면 둘러보기가 나와야 함'); l4.dom.window.close();

/* -- (7) 획순 자료 없는 글자(敎·飮·窓·淸) -- */
for (var mi = 0; mi < missing.length; mi++) {
  var chm = missing[mi], gm2 = null, cim2 = 0;
  D.grades().forEach(function(g){
    D.all(g).forEach(function(r,i){ if (r.c === chm) { gm2 = g; cim2 = i+1; } });
  });
  var o2 = open('?grade='+gm2+'&char='+cim2);
  await o2.tick(3);
  T(o2.seen().indexOf('획순 자료가 아직 없어요') >= 0, chm+' : 만나기에서 안내 누락');
  T(o2.doc.getElementById('replay').disabled === true, chm+' : 죽은 재생 버튼');
  T(o2.doc.getElementById('hy').classList.contains('in'), chm+' : 자료가 없다고 훈음까지 막힘');
  o2.doc.getElementById('go-write').click();
  await o2.tick(3);
  T(o2.seen().indexOf('쓰기 연습을 건너뛰어요') >= 0, chm+' : 쓰기 건너뛰기 안내 누락');
  var skipBtns = Array.prototype.filter.call(o2.doc.querySelectorAll('.bt'),
    function(bn){ return bn.textContent.indexOf('낱말 배우러') >= 0; });
  T(skipBtns.length === 1, chm+' : 낱말로 가는 길이 없음');
  skipBtns[0].click();
  T(o2.seen().indexOf('낱말') >= 0, chm+' : 낱말 마당 진입 실패');
  T(o2.errs.length === 0, chm+' : 콘솔 에러 '+o2.errs[0]);
  o2.dom.window.close();
}

console.log('\n하루 1자 활동 스모크 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
})();
