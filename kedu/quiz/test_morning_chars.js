/* =============================================================
 * test_morning_chars.js — 「오늘의 한자」 하루 1자 활동 스모크 (jsdom)
 *   ① 획순 자산 정합성
 *   ② 1막 만나기 — 획순이 먼저, 훈음이 뒤따라
 *   ③ 2막 열 번 쓰기 — 비계(보고→떠올려→혼자)가 실제로 줄어드는가,
 *      선 판정이 마지막 구간에서 깐깐해지는가, 도장 10개가 쌓이는가
 *   ④ 3막 낱말 — 짝짓기·글자 찾기·낱말 없음 세 갈래
 *   ⑤ 완주 기록(localStorage) → 둘러보기 도장
 *   ⑥ 옛 s키·c키·이상값 주소
 *   ⑧ 시간 표기 규약(D8-ⓗ) — 주·요일·「어제/내일」을 지어내지 않는가,
 *      「오늘」이라 말할 자격(c키 통로)을 갖췄는가. **두 갈래**로 본다.
 *   ⑨ peek — 미리보기로 열면 기록이 남지 않는가(그리고 평소엔 남는가)
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_chars.js
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
var STROKE_DIR = path.join(ROOT, 'kedu', 'hanja', 'strokes');
var D = require('./templates/hanja_data.js');

/* 검사할 화면 폴더를 인자로 받는다(기본 = 레포 실물).
   역검증 드라이버가 `morning/` 사본을 `/tmp/rv/cN/` 로 떠서 변조한 뒤 그 경로를 넘긴다 —
   레포 원본을 건드리지 않고 「이 검사가 정말 그 결함을 잡는가」를 물어보기 위해서다.
   ★원장(hanja_data.js)·획순 자산은 ROOT 에서 그대로 읽는다: 이 검사가 묻는 것은 **화면**이고,
     원장까지 사본에서 읽으면 변조가 원장으로 새어 무엇이 잡혔는지 갈리지 않는다.
   (`test_morning_english_screen.js` 가 `process.argv[2]` 로 쓰는 것과 같은 계약.) */
var PAGES = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'morning');

var html = fs.readFileSync(path.join(PAGES, 'chars.html'), 'utf8');
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
/* ★D8-ⓗ: 여기서 「3주」를 요구하고 있었다 — 15일째가 3주째라는 근거는 원장에 없다.
   원장이 아는 묶음(10자 step)으로 갈았고 기대값은 원장에서 뽑는다. */
T(o.seen().indexOf('2번째 묶음') >= 0, '묶음 표기 누락(15일째 = 2번째 묶음)');
T(o.seen().indexOf('10자 중 5번째') >= 0, '묶음 안 진행 표기 누락');
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
/* ★D8-ⓗ 개정: 옛 기준은 「주가 몇 개인가」였는데 그 수 자체가 **「1주 = 5일」이라는 근거
   없는 가정**에서 나온 것이었다(검사기가 화면에 거짓을 요구하고 있었다). 원장이 아는
   묶음은 10자 step 뿐이므로 기대값을 `D.stepCount` 에서 뽑아 **원장을 따라가게** 한다 —
   숫자를 손으로 바꾸지 않는다(원장이 자라거나 STEP_SIZE 가 바뀌면 검사가 함께 따라온다). */
var allG = D.all(gM), steps = D.stepCount(gM);
T(b.doc.querySelectorAll('.stepbox').length === steps, '둘러보기 묶음 수 '+b.doc.querySelectorAll('.stepbox').length+' != '+steps);
T(b.doc.querySelectorAll('.wg').length === allG.length, '둘러보기 글자 칸 수 불일치');
T(b.seen().indexOf(steps+'개 묶음') >= 0, '묶음이 몇 개인지 안내 누락');
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


/* ══════════════════════════════════════════════════════════════
   (8) 시간 표기 규약 — D8-ⓗ
   영어 화면(sents.html)이 D8-ⓔ·ⓕ 로 걷어낸 것과 **같은 종류의 거짓**이 이 화면에
   그대로 남아 있었다(원본이 사본보다 늦게 고쳐진 자리다):
     ⓐ 머리 `['월','화','수','목','금'][(일째-1)%5]` → 「2주 화」
     ⓑ 이동 칩 「← 어제」·「내일 →」 = 다음 글자가 **하루 뒤**라는 주장
     ⓒ 완주 「내일은 새 글자가 기다려요」 · 둘러보기 「N주면 다 만나요」·주 격자·요일 라벨
   한자를 어느 요일에 넣을지는 교사 시간표(`ma_routines`)가 정하고 원장에는 없다.

   ★**두 갈래로 본다. 그 필요성은 이 원장에서 실측된다.**
     (b) `ownLeft` = 원장 문자열을 전부 걷어낸 나머지 — 나중에 새 문구를 아무 데나 붙여도 걸린다.
         그러나 **원장에 `昨 「어제 작」`(g4 14일째)·`週 「주일 주」`(g6 97일째)가 실재**하므로,
         그 글자를 여는 날에는 「어제」가 본문에서 통째로 지워져 **눈이 먼다**.
     (a) `ownSaid` = 화면이 **자기 말**을 하는 마디만 지정해 정면 대조 — (b)가 눈머는 자리를 본다.
         거꾸로 (a)는 지정 안 한 자리를 못 본다. 어느 한쪽도 다른 쪽을 대신하지 못한다.
     ★메시지 이름을 갈라 둔다(「본문 나머지가 …」/「지정 마디가 …」) — 안 그러면 역검증이
       어느 갈래가 잡았는지 못 가린다.
   ══════════════════════════════════════════════════════════════ */
await (async function () {
  var SPAN  = /어제|내일|모레|이번\s*주|다음\s*주|지난\s*주|[0-9]+\s*주(?!일)|요일|[월화수목금]요/;
  var TODAY = /오늘/;
  var NAMES = ['오늘의 한자'];   /* 활동 **이름**(제목·로고) — 규약 대상이 아니다 */

  /* 원장이 낸 문자열을 먼저 걷어내고 남은 말만 본다. 걷어낼 때는 **공백으로** 바꾼다 —
     이어붙이면 없던 낱말이 생긴다. `<script>` 는 제외(하니스가 원장 소스를 인라인 주입한다). */
  /* ★함정(실측): 「오늘 글자로 ↩」 칩을 그냥 두면 **오늘을 벗어난 화면이 「오늘」이라 말한
       것으로 세어진다**(1차 실행에서 6 FAIL). 칩은 지금 보는 것이 오늘이라는 주장이 아니라
       **되돌아갈 길의 이름**이다. 그래서 두 갈래 모두에서 떼어 내고, 대신 칩의 **있음/없음**을
       짝으로 본다(A·B 는 없어야 하고 C 는 있어야 한다). 영어 화면 절 ⑫ 와 같은 처리다. */
  function strip(body) {
    var bk = body.querySelector('#bk');
    if (bk) bk.parentNode.removeChild(bk);
    return body;
  }
  function ownLeft(o, g) {
    var body = strip(o.doc.body.cloneNode(true));
    Array.prototype.slice.call(body.querySelectorAll('script,style,template'))
      .forEach(function (e) { e.parentNode.removeChild(e); });
    var t = body.textContent;
    var led = NAMES.slice();
    D.grades().forEach(function (gg) {
      D.all(gg).forEach(function (x) {
        led.push(x.c, x.hun, x.eum, x.word, x.wordKo);
        (x.extra || []).forEach(function (w) { led.push(w[0], w[1]); });
      });
    });
    led = led.filter(Boolean).sort(function (a, b) { return String(b).length - String(a).length; });
    led.forEach(function (w) { t = t.split(w).join(' '); });
    return t;
  }

  /* ★지정 마디는 **원장 훈음·낱말이 실리지 않는 곳만** 고른다 —
     3막 안내(`.lead`·`.say`)는 훈음을 그대로 이고 있어 여기서 뺀다((b)가 본다). */
  var OWN = ['.head .day', '.nav-ch', '.hy-sub', '.browse-meta', '.stepbox h3', '.wg .d',
             '.peeknote', '#fin'];
  function ownSaid(o) {
    var body = strip(o.doc.body.cloneNode(true));
    var t = OWN.map(function (sel) {
      return Array.prototype.slice.call(body.querySelectorAll(sel))
        .map(function (e) { return e.textContent; }).join(' ');
    }).join(' ');
    NAMES.forEach(function (n) { t = t.split(n).join(' '); });
    return t;
  }
  function tidy(x){ return x.replace(/\s+/g, ' ').slice(0, 130); }

  var cases = [];
  D.grades().forEach(function (g) {
    var n = D.all(g).length;
    var d0 = Math.min(15, n);                 /* 오늘이라 칠 일차 */
    var dAway = d0 > 3 ? 3 : d0 + 1;          /* 오늘에서 벗어난 일차 */
    cases.push({ g: g, d0: d0, dAway: dAway,
                 key: 'g' + g + '_hanja_c' + ('00' + d0).slice(-3) });
  });

  for (var ci2 = 0; ci2 < cases.length; ci2++) {
    var C = cases[ci2], g = C.g;

    /* ── A. 모르는 통로(`?grade&char`) — 아무 날이나 여는 통로다. 「오늘」이 한 번도 없어야 한다. */
    var a = open('?grade=' + g + '&char=' + C.d0);
    await a.tick(3);
    var aLeft = ownLeft(a, g), aSaid = ownSaid(a);
    T(SPAN.test(aLeft) === false, 'g' + g + ' 모르는 통로: 본문 나머지가 주·요일·「어제/내일」을 지어냄: ' + tidy(aLeft));
    T(TODAY.test(aLeft) === false, 'g' + g + ' 모르는 통로: 본문 나머지가 진도를 모르면서 「오늘」이라 말함: ' + tidy(aLeft));
    T(SPAN.test(aSaid) === false, 'g' + g + ' 모르는 통로: 지정 마디가 주·요일·「어제/내일」을 지어냄: ' + tidy(aSaid));
    T(TODAY.test(aSaid) === false, 'g' + g + ' 모르는 통로: 지정 마디가 진도를 모르면서 「오늘」이라 말함: ' + tidy(aSaid));
    T(aLeft.replace(/\s+/g, '').length > 20, 'g' + g + ' 모르는 통로가 사실상 빈 화면인데 통과함');
    T(aSaid.replace(/\s+/g, '').length > 10, 'g' + g + ' 모르는 통로의 지정 마디가 통째로 비어 있는데 통과함');
    T(a.doc.getElementById('bk') === null, 'g' + g + ' 오늘을 모르는데 「오늘 글자로 ↩」 칩을 띄움');
    a.dom.window.close();

    /* ── B. 아는 통로(c키) — 「오늘」이라 말할 자격이 있다. 말하지 않으면 그것도 결함이다
           (**시간 주장 0 만 보면 아무 말도 안 하는 화면이 통과한다**). 단 주·요일은 여전히 0. */
    var b2 = open('?key=' + C.key);
    await b2.tick(3);
    var bLeft = ownLeft(b2, g), bSaid = ownSaid(b2);
    T(TODAY.test(bSaid) === true, 'g' + g + ' 아는 통로인데 지정 마디가 「오늘」이라 말하지 않음: ' + tidy(bSaid));
    T(SPAN.test(bLeft) === false, 'g' + g + ' 아는 통로: 본문 나머지가 주·요일·「어제/내일」을 지어냄: ' + tidy(bLeft));
    T(SPAN.test(bSaid) === false, 'g' + g + ' 아는 통로: 지정 마디가 주·요일·「어제/내일」을 지어냄: ' + tidy(bSaid));
    T(b2.doc.getElementById('bk') === null, 'g' + g + ' 오늘 위에 서 있는데 되돌아가기 칩이 뜸');
    b2.dom.window.close();

    /* ── C. 아는 통로로 들어와 **옆으로 옮긴** 자리 — 「오늘」을 거두고, 되돌아갈 길을 남긴다.
           (정직해지면서 정보가 줄면 안 된다 — 칩 이름만 갈고 이걸 안 두면 「움직였다」는
            사실조차 사라진다.) */
    var c2 = open('?key=' + C.key);
    await c2.tick(3);
    var steps2 = Math.abs(C.d0 - C.dAway);
    var btn = c2.doc.getElementById(C.dAway < C.d0 ? 'pv' : 'nx');
    for (var k2 = 0; k2 < steps2; k2++) { btn.click(); await c2.tick(2); btn = c2.doc.getElementById(C.dAway < C.d0 ? 'pv' : 'nx'); }
    var cLeft = ownLeft(c2, g), cSaid = ownSaid(c2);
    T(c2.seen().indexOf(C.dAway + '일째') >= 0, 'g' + g + ' 옆으로 옮겨지지 않음');
    T(TODAY.test(cSaid) === false, 'g' + g + ' 오늘을 벗어났는데 지정 마디가 여전히 「오늘」이라 말함: ' + tidy(cSaid));
    T(TODAY.test(cLeft) === false, 'g' + g + ' 오늘을 벗어났는데 본문 나머지가 여전히 「오늘」이라 말함: ' + tidy(cLeft));
    T(c2.doc.getElementById('bk') !== null, 'g' + g + ' 오늘을 벗어났는데 되돌아갈 길이 없음');
    c2.doc.getElementById('bk').click(); await c2.tick(2);
    T(c2.seen().indexOf(C.d0 + '일째') >= 0, 'g' + g + ' 되돌아가기 칩이 오늘로 안 데려감');
    T(TODAY.test(ownSaid(c2)) === true, 'g' + g + ' 오늘로 돌아왔는데 「오늘」이라 말하지 않음');
    c2.dom.window.close();
  }

  /* ── D. 둘러보기 — 주·요일 격자가 사라지고 원장이 아는 묶음만 남았는가 */
  var gB = D.grades()[D.grades().length - 1];
  var d2 = open('?grade=' + gB);
  await d2.tick(2);
  var dLeft = ownLeft(d2, gB), dSaid = ownSaid(d2);
  T(SPAN.test(dLeft) === false, '둘러보기: 본문 나머지가 주·요일을 지어냄: ' + tidy(dLeft));
  T(SPAN.test(dSaid) === false, '둘러보기: 지정 마디가 주·요일을 지어냄: ' + tidy(dSaid));
  T(TODAY.test(dSaid) === false, '둘러보기는 진도를 모르는데 「오늘」이라 말함: ' + tidy(dSaid));
  T(d2.doc.querySelectorAll('.stepbox').length === D.stepCount(gB), '둘러보기 묶음 수가 원장과 어긋남');
  T(d2.doc.querySelectorAll('.wg .d').length === D.all(gB).length, '격자 칸 라벨 수 불일치');
  T(/1일째/.test(d2.doc.querySelector('.wg .d').textContent), '격자 칸이 일차로 안 불림');
  d2.dom.window.close();

  /* ── E. 구간 밖 진도일은 **당기지 않고 버린다** — 당기면 「엉뚱한 글자를 오늘이라 우기는」
         상태가 만들어진다. 학년마다 자수가 다르므로(50·50·50·75·75·100) 이 자리는 실제로
         닿는다: 1학년(50자) 반이 99일째 c키를 들고 오는 경우.
     ★`renderBrowse` 의 학년 되돌림(`st.today = null`)은 **지금은 닿을 수 없는 방어**다 —
       학년 select 는 둘러보기에만 있고 둘러보기는 c키 없이만 열리므로 그 시점의 today 는
       이미 null 이다. 검사기가 못 만드는 자리라는 사실을 숨기지 않고 여기 적어 둔다
       (미래에 c키를 문 채 둘러보기를 열게 되면 그때 바로 필요해진다). */
  var e2 = open('?key=g1_hanja_c099');
  await e2.tick(3);
  T(e2.seen().indexOf('50일째') >= 0, '구간 밖 일차가 마지막 글자로 안 당겨짐');
  T(TODAY.test(ownSaid(e2)) === false, '구간 밖 진도일을 당겨 와 엉뚱한 글자를 「오늘」이라 함');
  T(e2.doc.getElementById('bk') === null, '버린 진도일로 되돌아가는 길이 남아 있음');
  e2.dom.window.close();
})();

/* ══════════════════════════════════════════════════════════════
   (9) peek — 미리보기로 열면 기록이 남지 않는다 (D8-ⓗ)
   교사가 준비하려고 한 번 돌려 본 것이 교실 공용 기기에 완주 도장으로 남으면,
   아이가 아직 만나지도 않은 날이 이미 끝난 것으로 뜬다.
   ★**짝으로 강제한다** — 끄는 쪽만 보면 「늘 안 남는 화면」도 통과한다.
   ══════════════════════════════════════════════════════════════ */
await (async function () {
  /* 낱말 2개 이상인 글자(gM·ciM)를 그대로 쓴다 — 3막 짝짓기를 실제로 끝내야 `fin` 이 눌리고
     그때 `markDone` 이 불린다. 상수 대조가 아니라 **실제로 완주시켜 본다.** */
  var ws = D.wordsWith(D.all(gM)[ciM - 1].c, gM);
  async function runToDone(qs) {
    var o = open(qs);
    await driveToWords(o);
    for (var wi = 0; wi < ws.length; wi++) {
      o.doc.querySelector('.mitem.hj[data-w="' + wi + '"]').click();
      o.doc.querySelector('.mitem[data-k="' + wi + '"]:not(.hj)').click();
    }
    o.doc.getElementById('fin').click();
    await o.tick(2);
    var sealed = o.doc.querySelector('.bigseal') !== null;
    var raw = o.win.localStorage.getItem('kedu_hanja_done_g' + gM);
    var done = raw ? JSON.parse(raw) : {};
    var note = !!o.doc.querySelector('.peeknote');
    var hrefs = Array.prototype.slice.call(o.doc.querySelectorAll('a[href*="chars.html"]'))
      .map(function (a) { return a.getAttribute('href'); });
    o.dom.window.close();
    return { done: done, note: note, hrefs: hrefs, sealed: sealed };
  }

  var norm = await runToDone('?grade=' + gM + '&char=' + ciM);
  T(norm.sealed === true, '평소 열기: 완주 낙관이 안 찍힘(이 경로가 안 돌면 아래 검사는 무의미하다)');
  T(norm.done[ciM] === 1, '평소 열기인데 완주 기록이 안 남음 — 끄는 쪽만 보면 「늘 안 남는 화면」도 통과한다');
  T(norm.note === false, '평소 열기인데 미리보기 안내 띠가 뜸');
  T(norm.hrefs.length > 0 && norm.hrefs.every(function (h) { return h.indexOf('peek=1') < 0; }),
    '평소 열기인데 화면 안 통로가 peek 를 달고 있음');

  var pk = await runToDone('?grade=' + gM + '&char=' + ciM + '&peek=1');
  T(pk.sealed === true, 'peek 열기: 낙관이 안 찍힘 — 기록만 끄고 손맛까지 죽이면 안 된다');
  T(Object.keys(pk.done).length === 0, '미리보기로 열었는데 기록이 남음');
  T(pk.note === true, '미리보기로 열었는데 끈 사실을 화면에 안 적음 — 조용히 다르게 도는 화면은 신뢰를 잃는다');
  T(pk.hrefs.length > 0 && pk.hrefs.every(function (h) { return h.indexOf('peek=1') >= 0; }),
    '화면 안 통로가 peek 를 안 물고 감 — 한 칸 옮기자 기록이 살아난다');

  /* c키 통로로 열어도 같다 — **교사 현황판이 여는 주소가 바로 이것이다.** */
  var pk2 = await runToDone('?key=g' + gM + '_hanja_c' + ('00' + ciM).slice(-3) + '&peek=1');
  T(Object.keys(pk2.done).length === 0, 'c키+peek 인데 기록이 남음');
  T(pk2.note === true, 'c키+peek 인데 안내 띠가 없음');
})();

console.log('\n하루 1자 활동 스모크 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
})();
