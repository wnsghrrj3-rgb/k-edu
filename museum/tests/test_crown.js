/* test_crown.js — C5 물방울의 왕관 E1 순수 물리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','science','ex05_crown.html'),'utf8');
var m=html.match(/<script id="crown-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
var d=P.make(), T=d.T;

// 자유낙하 항등식: 정확
(function(){
  var ti=d.tImpact();
  var good = Math.abs(ti-Math.sqrt(2*d.H/d.G))<1e-15
    && Math.abs(d.vImpact()-Math.sqrt(2*d.G*d.H))<1e-15
    && Math.abs(d.y(ti))<1e-12
    && Math.abs(d.vImpact()-d.G*ti)<1e-12;
  ok('자유낙하 항등식: t=√(2H/g)·v=√(2gH)·y(t)=0·v=gt 정확', good);
})();

// ★ √t 성장: R(4a)=2R(a) 전수
(function(){
  var good=true, worst=0;
  for(var k=1;k<=100;k++){
    var a=T*0.25*k/100;
    var e=Math.abs(d.crownR(4*a)-2*d.crownR(a));
    if(e>worst) worst=e;
    if(e>1e-12) good=false;
  }
  ok('★ √t 성장: R(4a)=2R(a) 전수(최대 '+worst.toExponential(1)+')', good);
})();

// crownR: 단조·유계·양끝
(function(){
  var good = d.crownR(0)===0 && Math.abs(d.crownR(T)-1)<1e-12;
  var prev=-1;
  for(var k=0;k<=300;k++){
    var r=d.crownR(T*k/300);
    if(r<prev-1e-15 || r<0 || r>1+1e-12) good=false;
    prev=r;
  }
  ok('crownR: 단조·유계 [0,1]·양끝 고정 전수', good);
})();

// 위상 분할: 빈틈·겹침 0 · 경계 정확
(function(){
  var names={};
  var good=true;
  for(var k=0;k<2000;k++){
    var ph=d.phaseOf(T*k/2000);
    if(!ph) good=false;
    names[ph]=1;
  }
  var want=['접촉','분화구','왕관','구슬','무너짐','물기둥'];
  want.forEach(function(w){ if(!names[w]) good=false; });
  if(Object.keys(names).length!==6) good=false;
  if(d.phaseOf(0)!=='접촉' || d.phaseOf(T*0.06)!=='분화구' || d.phaseOf(T*0.22)!=='왕관'
    || d.phaseOf(T*0.55)!=='구슬' || d.phaseOf(T*0.68)!=='무너짐' || d.phaseOf(T*0.85)!=='물기둥') good=false;
  ok('위상 분할: 6위상 전부 등장·빈틈 0·경계값 정확', good);
})();

// 스파이크 각: 등각 2π/N · 합 일주
(function(){
  var good=true;
  for(var i=1;i<d.N;i++)
    if(Math.abs((d.spikeAngle(i)-d.spikeAngle(i-1))-2*Math.PI/d.N)>1e-12) good=false;
  if(Math.abs(d.spikeAngle(d.N-1)+2*Math.PI/d.N - 2*Math.PI)>1e-12) good=false;
  ok('스파이크 16갈래 등각 2π/N 전수', good);
})();

// 스파이크 높이: 지지 밖 0 · 단봉 · 정점=구슬 시작 · 정점값 1
(function(){
  var good = d.spikeH(0)===0 && d.spikeH(T)===0 && d.spikeH(T*0.1)===0;
  if(Math.abs(d.spikeH(d.beadTs)-1)>1e-12) good=false;
  if(Math.abs(d.beadTs-T*0.55)>1e-15) good=false;
  var rising=true, seenPeak=false;
  var prev=-1;
  for(var k=0;k<=400;k++){
    var h=d.spikeH(T*(0.22+0.66*k/400));
    if(h<prev-1e-12){ if(rising){ rising=false; seenPeak=true; } }
    else if(!rising && h>prev+1e-12) good=false;   // 두 번째 봉우리 금지
    prev=h;
  }
  if(!seenPeak) good=false;
  ok('스파이크 높이: 단봉·정점=구슬 순간(0.55T)·정점값 1', good);
})();

// 순서 단언: 왕관 시작 < 구슬(정점) < 무너짐 < 물기둥 정점
(function(){
  var jetPeak=T*(0.85+0.15/2);
  var good = T*0.22 < d.beadTs && d.beadTs < T*0.68 && T*0.68 < T*0.85 && T*0.85 < jetPeak;
  var mx=0, at=0;
  for(var k=0;k<=300;k++){ var t=T*(0.85+0.15*k/300); var j=d.jetH(t); if(j>mx){ mx=j; at=t; } }
  if(!(at>T*0.85 && Math.abs(mx-1)<1e-6)) good=false;
  ok('순서: 왕관 < 구슬 < 무너짐 < 물기둥 정점(정점값 1)', good);
})();

// jetH 유계·지지 밖 0
(function(){
  var good = d.jetH(T*0.5)===0 && d.jetH(T)===0;
  for(var k=0;k<=200;k++){
    var j=d.jetH(T*k/200);
    if(j<0||j>1+1e-12) good=false;
  }
  ok('물기둥: 유계·지지 밖 0 전수', good);
})();

// ★ 지각 문턱: 실시간의 눈은 왕관을 볼 수 없다
(function(){
  var mf=d.minFactor();
  var good = d.onScreen(1)===T && T<d.PERCEIVE
    && d.onScreen(mf)>=d.PERCEIVE
    && d.onScreen(mf-1)<d.PERCEIVE;                // 최소성
  ok('★ 지각 문턱: onScreen(1)=8ms < 0.25s ≤ onScreen('+mf+') · 최소성', good);
})();

// onScreen 선형·단조
(function(){
  var good=true;
  for(var f=1;f<=2000;f+=37){
    if(Math.abs(d.onScreen(f)-T*f)>1e-15) good=false;
    if(d.onScreen(f+1)<=d.onScreen(f)) good=false;
  }
  ok('onScreen: 선형 T·f · 단조 전수', good);
})();

// 재현성
(function(){
  var e=P.make(), good=e.beadTs===d.beadTs && e.minFactor()===d.minFactor();
  for(var k=0;k<=60;k++){ var t=T*k/60;
    if(e.crownR(t)!==d.crownR(t) || e.spikeH(t)!==d.spikeH(t)) good=false; }
  ok('재현성: make() 불변', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ crown-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
