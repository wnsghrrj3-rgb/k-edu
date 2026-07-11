/* test_zoetrope.js — A4 12장의 마법 E1 순수 원리 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','art','ex04_zoetrope.html'),'utf8');
var m=html.match(/<script id="zoe-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0, TAU=Math.PI*2;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// norm: 음각 포함 전수 [0,2π) 보장 + 주기성
(function(){
  var good=true;
  for(var k=-500;k<=500;k++){
    var a=k*0.037;
    var n=P.norm(a);
    if(n<0 || n>=TAU) good=false;
    if(Math.abs(P.norm(a+TAU)-n)>1e-9) good=false;
  }
  ok('norm: [0,2π) 보장·2π 주기 전수(1001표본)', good);
})();

// frameOf: 경계·순환 전수 (F=12)
(function(){
  var good=true;
  for(var i=0;i<12;i++){
    var lo=i*TAU/12, hi=(i+1)*TAU/12;
    if(P.frameOf(lo+1e-6,12)!==i) good=false;
    if(P.frameOf(hi-1e-6,12)!==i) good=false;
    if(P.frameOf(lo+1e-6+TAU,12)!==i) good=false;      // 한 바퀴 돌아도 같은 장
    if(P.frameOf(lo+1e-6-TAU,12)!==i) good=false;      // 거꾸로도
  }
  ok('frameOf: 12장 경계·순환·역방향 전수', good);
  ok('frameOf: 유효 범위 [0,F)', P.frameOf(TAU-1e-12,12)<=11 && P.frameOf(0,12)===0);
})();

// frameOf 일반성: F=3·24
(function(){
  var good=true;
  [3,24].forEach(function(F){
    for(var i=0;i<F;i++)
      if(P.frameOf((i+0.5)*TAU/F, F)!==i) good=false;
  });
  ok('frameOf 일반성: F=3·24 중앙점 전수', good);
})();

// fps 선형성: fps(ω,F)=|ω|F/2π
(function(){
  var good=true;
  [[TAU,12,12],[TAU/2,12,6],[TAU,24,24],[-TAU,12,12]].forEach(function(c){
    if(Math.abs(P.fpsOf(c[0],c[1])-c[2])>1e-12) good=false;
  });
  ok('fps 선형성: ω=2π→F장/초·부호 무관', good);
})();

// alive 임계 경계: 12fps
(function(){
  var wLo=11.99*TAU/12, wHi=12.01*TAU/12;
  ok('alive 임계: 11.99fps 미달·12.01fps 생존·역방향 동일',
     !P.alive(wLo,12) && P.alive(wHi,12) && P.alive(-wHi,12) && P.ALIVE_FPS===12);
})();

// decay: 닫힌식 대조·단조·부호 보존
(function(){
  var good=true, w=5;
  for(var k=0;k<200;k++){
    var w2=P.decay(w,0.42,0.016);
    if(Math.abs(w2-w*Math.exp(-0.42*0.016))>1e-12) good=false;
    if(w2>=w || w2<=0) good=false;
    w=w2;
  }
  var wn=P.decay(-5,0.42,0.5);
  ok('decay: ω·e^(−μdt) 닫힌식·단조 감소·부호 보존 전수', good && wn<0 && wn>-5);
})();

// poseAt: 주기성
(function(){
  var good=true;
  for(var k=0;k<=100;k++){
    var p=k/100;
    var a=P.poseAt(p), b=P.poseAt(p+1), c=P.poseAt(p-2);
    ['hipL','hipR','kneeL','kneeR','armL','armR','bob'].forEach(function(j){
      if(Math.abs(a[j]-b[j])>1e-9 || Math.abs(a[j]-c[j])>1e-9) good=false;
    });
  }
  ok('poseAt: 1주기 완전 반복 전수(101표본)', good);
})();

// 다리 반대칭: hipL(p)=hipR(p+1/2), kneeL(p)=kneeR(p+1/2)
(function(){
  var good=true;
  for(var k=0;k<=100;k++){
    var p=k/100, a=P.poseAt(p), b=P.poseAt(p+0.5);
    if(Math.abs(a.hipL-b.hipR)>1e-9) good=false;
    if(Math.abs(a.kneeL-b.kneeR)>1e-9) good=false;
  }
  ok('걸음 반대칭: 왼다리(p)=오른다리(p+½) 전수', good);
})();

// 팔다리 반대: armL=−0.8·hipL
(function(){
  var good=true;
  for(var k=0;k<=100;k++){
    var a=P.poseAt(k/100);
    if(Math.abs(a.armL+0.8*a.hipL)>1e-9 || Math.abs(a.armR+0.8*a.hipR)>1e-9) good=false;
  }
  ok('팔다리 반대 진자: arm=−0.8·hip 전수', good);
})();

// 연속성: 미소 위상 변화에 관절 도약 없음
(function(){
  var good=true;
  for(var k=0;k<1000;k++){
    var p=k/1000, a=P.poseAt(p), b=P.poseAt(p+0.001);
    ['hipL','hipR','kneeL','kneeR','armL','armR','bob'].forEach(function(j){
      if(Math.abs(a[j]-b[j])>0.02) good=false;
    });
  }
  ok('연속성: Δp=0.001에 관절 도약 없음 전수', good);
})();

// 유계·무릎 비음수
(function(){
  var good=true;
  for(var k=0;k<=500;k++){
    var a=P.poseAt(k/500);
    if(Math.abs(a.hipL)>0.52+1e-9 || a.kneeL<0 || a.kneeL>0.85+1e-9) good=false;
    if(Math.abs(a.bob)>0.06+1e-9) good=false;
  }
  ok('유계: |hip|≤0.52·knee∈[0,0.85]·|bob|≤0.06 전수', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
process.exit(fail?1:0);
