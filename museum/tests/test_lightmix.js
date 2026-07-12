/* test_lightmix.js — A3 빛은 거꾸로 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','art','ex03_light.html'),'utf8');
var m=html.match(/<script id="light-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0, TAU=Math.PI*2;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function eq3(a,b,t){ t=t||1e-12; return Math.abs(a[0]-b[0])<=t && Math.abs(a[1]-b[1])<=t && Math.abs(a[2]-b[2])<=t; }
var HUES=[]; for(var h=0;h<72;h++) HUES.push(h/72*TAU);

// hueColor: 범위·주기·순색(최대 채널=1·최소 채널=0) 전수
(function(){
  var good=true;
  HUES.forEach(function(h){
    var c=P.hueColor(h);
    var mx=Math.max(c[0],c[1],c[2]), mn=Math.min(c[0],c[1],c[2]);
    if(Math.abs(mx-1)>1e-12 || Math.abs(mn)>1e-12) good=false;
    c.forEach(function(v){ if(v<0||v>1) good=false; });
    if(!eq3(P.hueColor(h+TAU), c, 1e-9)) good=false;
  });
  ok('hueColor: 순색(max=1·min=0)·범위·2π 주기 전수(72색)', good);
})();

// paintOf: 실물 안료 범위 [0.06, 0.94] 전수
(function(){
  var good=true;
  HUES.forEach(function(h){
    P.paintOf(h).forEach(function(v){ if(v<0.06-1e-12 || v>0.94+1e-12) good=false; });
  });
  ok('paintOf: 바닥 반사율 [0.06,0.94] 전수', good);
})();

// addMix: 교환·클램프·항등(검은 빛)
(function(){
  var good=true;
  HUES.forEach(function(h1){ HUES.forEach(function(h2){
    var a=P.hueColor(h1), b=P.hueColor(h2);
    if(!eq3(P.addMix(a,b), P.addMix(b,a))) good=false;
  }); });
  var w=P.addMix([0.8,0.9,0.7],[0.8,0.9,0.7]);
  ok('addMix: 교환 전수(72×72)·클램프·검은 빛 항등',
     good && w[0]===1 && w[1]===1 && w[2]===1 && eq3(P.addMix([0.3,0.5,0.7],[0,0,0]),[0.3,0.5,0.7]));
})();

// paintMix: 교환·흰 물감 항등·채널별 곱
(function(){
  var good=true;
  HUES.forEach(function(h1){ HUES.forEach(function(h2){
    var a=P.paintOf(h1), b=P.paintOf(h2);
    if(!eq3(P.paintMix(a,b), P.paintMix(b,a))) good=false;
  }); });
  ok('paintMix: 교환 전수·흰 물감(1,1,1) 항등',
     good && eq3(P.paintMix([0.3,0.5,0.7],[1,1,1]),[0.3,0.5,0.7]));
})();

// ★거울 정리 ①: 빛은 보탠다 — lum(add) ≥ max(lum) 전수
(function(){
  var good=true;
  HUES.forEach(function(h1){ HUES.forEach(function(h2){
    var a=P.hueColor(h1), b=P.hueColor(h2);
    if(P.lum(P.addMix(a,b)) < Math.max(P.lum(a),P.lum(b))-1e-12) good=false;
  }); });
  ok('★거울 정리①: 빛은 절대 어두워지지 않는다(72×72 전수)', good);
})();

// ★거울 정리 ②: 물감은 거른다 — 채널별 ≤ min·lum ≤ min(lum) 전수
(function(){
  var good=true;
  HUES.forEach(function(h1){ HUES.forEach(function(h2){
    var a=P.paintOf(h1), b=P.paintOf(h2);
    var mix=P.paintMix(a,b);
    for(var k=0;k<3;k++) if(mix[k] > Math.min(a[k],b[k])+1e-12) good=false;
    if(P.lum(mix) > Math.min(P.lum(a),P.lum(b))+1e-12) good=false;
  }); });
  ok('★거울 정리②: 물감은 절대 밝아지지 않는다(채널·밝기 전수)', good);
})();

// ★거울 정리 ③(결합): 같은 색상쌍이 두 세계에서 반대 방향 — 서로 다른 색상은 엄격 부등
(function(){
  var good=true;
  HUES.forEach(function(h1){ HUES.forEach(function(h2){
    if(h1===h2) return;
    var la=P.lum(P.hueColor(h1)), lb=P.lum(P.hueColor(h2));
    var lAdd=P.lum(P.addMix(P.hueColor(h1),P.hueColor(h2)));
    var lSub=P.lum(P.paintMix(P.paintOf(h1),P.paintOf(h2)));
    var pa=P.lum(P.paintOf(h1)), pb=P.lum(P.paintOf(h2));
    if(!(lAdd >= Math.max(la,lb)-1e-12 && lSub < Math.min(pa,pb)-1e-9)) good=false;
  }); });
  ok('★거울 정리③(쌍대): 같은 쌍, 위로·아래로 — 물감쪽은 엄격 감소 전수', good);
})();

// 정확 사실: 빨강빛+초록빛 = 노랑 정확 · 세 빛 = 하양 정확
(function(){
  var y=P.addMix(P.LIGHTS.R, P.LIGHTS.G);
  var w=P.mixAll(P.addMix, [P.LIGHTS.R, P.LIGHTS.G, P.LIGHTS.B]);
  ok('정확: R빛+G빛=(1,1,0) 노랑', y[0]===1 && y[1]===1 && y[2]===0);
  ok('정확: R+G+B 빛=(1,1,1) 하양', w[0]===1 && w[1]===1 && w[2]===1);
})();

// 정확 사실: 세 물감 = 거의 검정 · 두 물감(R,G)부터 이미 어둡다
(function(){
  var k3=P.mixAll(P.paintMix, [P.PAINTS.R, P.PAINTS.G, P.PAINTS.B]);
  var k2=P.paintMix(P.PAINTS.R, P.PAINTS.G);
  ok('정확: 세 물감 lum < 0.02 (거의 검정)', P.lum(k3)<0.02);
  ok('정확: 두 물감(R·G)만으로 각 원색보다 훨씬 어둡다',
     P.lum(k2) < Math.min(P.lum(P.PAINTS.R), P.lum(P.PAINTS.G))*0.5);
})();

// 결합법칙(순서 무관 — 붓는 순서는 결과를 바꾸지 않는다)
(function(){
  var good=true;
  var A=P.PAINTS.R, B=P.PAINTS.G, C=P.PAINTS.B;
  if(!eq3(P.paintMix(P.paintMix(A,B),C), P.paintMix(A,P.paintMix(B,C)), 1e-15)) good=false;
  var a=P.LIGHTS.R, b=P.LIGHTS.G, c=P.LIGHTS.B;
  if(!eq3(P.addMix(P.addMix(a,b),c), P.addMix(a,P.addMix(b,c)), 1e-15)) good=false;
  HUES.forEach(function(h1){
    var x=P.paintOf(h1), y=P.paintOf(h1+1), z=P.paintOf(h1+2);
    if(!eq3(P.paintMix(P.paintMix(x,y),z), P.paintMix(x,P.paintMix(y,z)), 1e-12)) good=false;
  });
  ok('결합법칙: 붓는 순서 무관(물감·빛, hue 표본 전수)', good);
})();

// lum: 하양=1·검정=0·선형
(function(){
  ok('lum: 하양 1·검정 0·Rec.709 합=1',
     Math.abs(P.lum([1,1,1])-1)<1e-12 && P.lum([0,0,0])===0
     && Math.abs(P.LUM[0]+P.LUM[1]+P.LUM[2]-1)<1e-12);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ light-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
