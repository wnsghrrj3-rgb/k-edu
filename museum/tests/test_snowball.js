/* test_snowball.js — S7 눈덩이의 방 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex07_snowball.html'),'utf8');
var m=html.match(/<script id="snow-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 출발선: n=0에서 두 항아리는 정확히 같다(r 전수)
(function(){
  var good=true;
  for(var r=1;r<=12;r++)
    if(P.compoundWon(0,r)!==50000 || P.simpleWon(0,r)!==50000) good=false;
  ok('출발선: n=0 두 항아리 = 원금 5만원 정확(r=1..12 전수)', good);
})();

// ★동행→이탈 정리 ①: 복리 ≥ 단리 전수 (n=0..120 × r=1..12, n≥2 엄격)
(function(){
  var good=true;
  for(var r=1;r<=12;r++)
    for(var n=0;n<=120;n++){
      var c=P.compoundNum(n,r), s=BigInt(P.simpleWon(n,r))*P.compoundDen(n);
      if(c<s) good=false;
      if(n>=2 && c<=s) good=false;
    }
  ok('★동행→이탈①: 복리 ≥ 단리(n≥2 엄격) — 1,452조합 전수', good);
})();

// ★동행→이탈 정리 ②: 차이 단조 증가 전수
(function(){
  var good=true;
  for(var r=1;r<=12;r++){
    var prev=-1;
    for(var n=1;n<=120;n++){
      var d=P.compoundWon(n,r)-P.simpleWon(n,r);
      if(d<prev) good=false;
      prev=d;
    }
  }
  ok('★동행→이탈②: (복리−단리) 단조 증가 전수', good);
})();

// ★동행→이탈 정리 ③: 배율(‰) 단조 전수 (n≥1)
(function(){
  var good=true;
  for(var r=1;r<=12;r++){
    var prev=0;
    for(var n=1;n<=120;n++){
      var q=P.ratioPermille(n,r);
      if(q<prev) good=false;
      prev=q;
    }
  }
  ok('★동행→이탈③: 복리/단리 배율 단조 전수', good);
})();

// ★72의 법칙: r=1..12 전수에서 |doubleYear − 72/r| ≤ 2
(function(){
  var good=true, table=[];
  for(var r=1;r<=12;r++){
    var d=P.doubleYear(r);
    table.push(r+'%→'+d+'해');
    if(Math.abs(d-72/r)>2) good=false;
    // 정의 검증: d-1해엔 미달, d해엔 도달(BigInt 정확)
    if(!(P.compoundNum(d,r) >= 2n*50000n*P.compoundDen(d))) good=false;
    if(d>0 && !(P.compoundNum(d-1,r) < 2n*50000n*P.compoundDen(d-1))) good=false;
  }
  ok('★72의 법칙: |두 배 해 − 72/r| ≤ 2 · 경계 정확(r=1..12 전수)', good);
})();

// 고정 단언(r=7): 두 배 = 11해 · 10해 98,357원 · 단리 70해 295,000원
(function(){
  ok('★고정: doubleYear(7) = 11', P.doubleYear(7)===11);
  ok('★고정: 복리 10해 = 98,357원(1.16배 — "똑같네"의 실증)',
     P.compoundWon(10,7)===98357 && P.ratioPermille(10,7)<1200);
  ok('★고정: 단리 70해 = 295,000원(5.9배)', P.simpleWon(70,7)===295000);
})();

// 70해 복리: 정확분수 ↔ 부동소수 독립 대조 + 114배 대역
(function(){
  var w=P.compoundWon(70,7);
  var f=50000*Math.pow(1.07,70);
  ok('70해 복리: BigInt ↔ 부동소수 상대오차 <1e-6(내림 1원 여유)', Math.abs(w-f)/f < 1e-6);
  ok('70해 복리: 약 570만원(114배)·비율 19배대',
     w>5690000 && w<5710000 && P.ratioPermille(70,7)>=19000 && P.ratioPermille(70,7)<20000);
})();

// 지수법칙: (100+r)^(a+b) = (100+r)^a·(100+r)^b — BigInt 전수 표본
(function(){
  var good=true;
  for(var r=1;r<=12;r++)
    for(var a=0;a<=30;a+=5)
      for(var b=0;b<=30;b+=7){
        var lhs=P.compoundNum(a+b,r)*50000n;
        var rhs=P.compoundNum(a,r)*P.compoundNum(b,r);
        if(lhs!==rhs) good=false;
      }
  ok('지수법칙: 굴린 해는 쪼개도 같다(BigInt 전수 표본)', good);
})();

// simple 선형성: 증분 = 500·r 상수 전수
(function(){
  var good=true;
  for(var r=1;r<=12;r++)
    for(var n=1;n<=120;n++)
      if(P.simpleWon(n,r)-P.simpleWon(n-1,r)!==500*r) good=false;
  ok('단리 선형성: 매년 같은 방울(증분 500·r) 전수', good);
})();

// interestWon: 복리의 방울은 해마다 자란다(전수 단조)
(function(){
  var good=true;
  for(var r=3;r<=12;r++){
    var prev=0;
    for(var n=1;n<=120;n++){
      var i=P.interestWon(n,r);
      if(i<prev) good=false;
      prev=i;
    }
  }
  ok('복리의 방울: 해마다 자란다(r=3..12 단조 전수)', good);
})();

// 방울 합 = 항아리: Σ이자 + 원금 = 복리 총액(전수)
(function(){
  var good=true;
  for(var r=1;r<=12;r+=3){
    var sum=50000;
    for(var n=1;n<=120;n++){
      sum+=P.interestWon(n,r);
      if(sum!==P.compoundWon(n,r)) good=false;
    }
  }
  ok('보존: 원금+방울들의 합 = 항아리 총액 전수', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ snow-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
