/* test_anamorph.js — A2 엉망진창의 정체 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','art','ex02_anamorph.html'),'utf8');
var m=html.match(/<script id="anam-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
var THE_SET=[0.9, 1.4, 2.1, 2.5];
function lerp(a,b,u){ return {x:a.x+(b.x-a.x)*u, y:a.y+(b.y-a.y)*u, z:a.z+(b.z-a.z)*u}; }

// 구조: 8꼭짓점(아래4·위4)·12모서리·모서리 길이 전수 = 한 변 200
(function(){
  var vs=P.vertices(), es=P.edges(), good=vs.length===8 && es.length===12;
  for(var i=0;i<4;i++){ if(vs[i].z!==0) good=false; if(vs[i+4].z!==2*P.A) good=false; }
  es.forEach(function(e){
    var a=vs[e[0]], b=vs[e[1]];
    var L=Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2)+Math.pow(a.z-b.z,2));
    if(Math.abs(L-2*P.A)>1e-9) good=false;
  });
  ok('구조: 8꼭짓점(z=0/2A)·12모서리·전 모서리 길이=한 변 전수', good);
})();

// floorFrom: 바닥 착지(z=0) 전수 — 꼭짓점 + 모서리 11분할, thE 4종
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    var E=P.eyeAt(thE), vs=P.vertices();
    P.edges().forEach(function(e){
      for(var k=0;k<=10;k++){
        var F=P.floorFrom(E, lerp(vs[e[0]],vs[e[1]],k/10));
        if(Math.abs(F.z)>1e-9) good=false;
      }
    });
  });
  ok('floorFrom: 바닥 착지 z=0 전수(thE 4종 × 12모서리 × 11표본)', good);
})();

// 공선성: E·P·F 한 직선 전수 (외적 ~0)
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    var E=P.eyeAt(thE);
    P.vertices().forEach(function(V){
      var F=P.floorFrom(E,V);
      var ax=V.x-E.x, ay=V.y-E.y, az=V.z-E.z;
      var bx=F.x-E.x, by=F.y-E.y, bz=F.z-E.z;
      var cx=ay*bz-az*by, cy=az*bx-ax*bz, cz=ax*by-ay*bx;
      var la=Math.sqrt(ax*ax+ay*ay+az*az), lb=Math.sqrt(bx*bx+by*by+bz*bz);
      if(Math.sqrt(cx*cx+cy*cy+cz*cz)/(la*lb)>1e-9) good=false;
    });
  });
  ok('공선성: 눈·입체점·바닥점이 한 직선 전수', good);
})();

// 바닥 꼭짓점 부동: z=0 꼭짓점은 낙서가 곧 자기 자신
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    var E=P.eyeAt(thE), vs=P.vertices();
    for(var i=0;i<4;i++){
      var F=P.floorFrom(E,vs[i]);
      if(Math.abs(F.x-vs[i].x)>1e-12 || Math.abs(F.y-vs[i].y)>1e-12) good=false;
    }
  });
  ok('바닥 꼭짓점 부동: 아랫면 네 점은 제자리 전수', good);
})();

// ★직선 보존: 모서리 위 임의 점의 바닥 투영은 두 끝 투영의 직선 위 전수
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    var E=P.eyeAt(thE), vs=P.vertices();
    P.edges().forEach(function(e){
      var Fa=P.floorFrom(E,vs[e[0]]), Fb=P.floorFrom(E,vs[e[1]]);
      var dx=Fb.x-Fa.x, dy=Fb.y-Fa.y, L=Math.sqrt(dx*dx+dy*dy);
      for(var k=1;k<10;k++){
        var Fm=P.floorFrom(E, lerp(vs[e[0]],vs[e[1]],k/10));
        var cross=Math.abs((Fm.x-Fa.x)*dy-(Fm.y-Fa.y)*dx)/Math.max(L,1e-9);
        if(cross>1e-6) good=false;
      }
    });
  });
  ok('★직선 보존: 중심투영은 직선을 직선으로(전수)', good);
})();

// ★정렬 항등식: 설계 자리에서 낙서와 이상 정육면체가 화면에서 한 점씩 정확히 겹침
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    if(P.misalign(thE,thE)>1e-9) good=false;
    var E=P.eyeAt(thE);
    P.vertices().forEach(function(V){
      var sF=P.screenOf(E, P.floorFrom(E,V)), sP=P.screenOf(E,V);
      if(Math.abs(sF.x-sP.x)>1e-9 || Math.abs(sF.y-sP.y)>1e-9) good=false;
    });
  });
  ok('★정렬 항등식: misalign(thE,thE)=0·꼭짓점별 화면 일치 전수(thE 4종)', good);
})();

// 전방성: 걸을 수 있는 전 구간에서 그림이 언제나 눈앞(z_cam>0)
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    var E=P.eyeAt(thE), vs=P.vertices();
    for(var th=P.TH_MIN; th<=P.TH_MAX+1e-9; th+=0.02){
      var C=P.eyeAt(th);
      vs.forEach(function(V){
        if(P.screenOf(C,V).z<=0) good=false;
        if(P.screenOf(C,P.floorFrom(E,V)).z<=0) good=false;
      });
    }
  });
  ok('전방성: 전 경로에서 낙서·입체 전부 z_cam>0 전수', good);
})();

// 국소 단조: 설계 자리에서 멀어질수록 어긋남이 커진다(양쪽 표본 전수)
(function(){
  var good=true;
  THE_SET.forEach(function(thE){
    [1,-1].forEach(function(sgn){
      var prev=0;
      for(var d=0.005; d<=0.5; d+=0.005){
        var th=thE+sgn*d;
        if(th<P.TH_MIN || th>P.TH_MAX) break;
        var mis=P.misalign(th,thE);
        if(mis<=prev) good=false;
        prev=mis;
      }
    });
  });
  ok('국소 단조: |th−thE| 증가 → misalign 단조 증가(양쪽 전수)', good);
})();

// 잠금창: 연속 구간·thE 포함·폭 유계 — 그리고 창 밖은 전부 엉망
(function(){
  var good=true, widths=[];
  THE_SET.forEach(function(thE){
    var w=P.lockWindow(thE, 0.002);
    if(!w.contiguous || w.lo===null) good=false;
    if(!(w.lo<=thE && thE<=w.hi)) good=false;
    widths.push(w.hi-w.lo);
    for(var th=P.TH_MIN; th<=P.TH_MAX+1e-9; th+=0.004){
      var inside=th>=w.lo-1e-9 && th<=w.hi+1e-9;
      var mis=P.misalign(th,thE);
      if(!inside && mis<P.TOL_LOCK) good=false;
      if(inside && mis>=P.TOL_LOCK && Math.abs(th-w.lo)>0.003 && Math.abs(th-w.hi)>0.003) good=false;
    }
  });
  var wOk=widths.every(function(w){ return w>0.008 && w<0.25; });
  ok('잠금창: 연속·thE 포함·창 밖=엉망 전수', good);
  ok('잠금창 폭 유계: 사람 손이 설 수 있되 아무 데나는 아님', wOk);
})();

// 시작 자리 정직: 기본 배치(th0=0.75, thE=2.10)는 확실한 엉망
(function(){
  ok('시작 자리: misalign(0.75, 2.10) ≥ TOL×5 (엉망 보장)', P.misalign(0.75,2.10)>=P.TOL_LOCK*5);
})();

// 눈높이 우위: 눈은 언제나 입체 꼭대기보다 높다(투영 항상 성립)
(function(){
  ok('눈높이 우위: EYE_H > 2A (t>0 보장)', P.EYE_H>2*P.A);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ anam-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
