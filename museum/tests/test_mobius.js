/* test_mobius.js — M4 가위의 배신 E1 순수 로직 검증
   위상 판정(centerCut/thirdCut/edgeCount/sideCount)을 홀짝 전수로 대조하고,
   point 파라메트릭 기하로 "모서리가 하나로 이어지는가"를 독립 재계산해
   위상 판정과 기하가 서로를 증언하는지 본다. */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex04_mobius.html'),'utf8');
var m=html.match(/<script id="mobius-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function near(a,b){ return Math.abs(a-b)<1e-9; }
function samePt(a,b){ return near(a.x,b.x)&&near(a.y,b.y)&&near(a.z,b.z); }

var R=100, W=24;

// 파라메트릭 기본형
ok('point(1,0,0) = 중심원 시작점 (R,0,0)', samePt(P.point(1,0,0,R,W), {x:R,y:0,z:0}));
// 중심선(v=0)은 꼬임과 무관하게 닫힌 원 — 꼬임 0..5 전수
(function(){
  var all=true;
  for(var t=0;t<=5;t++){ if(!samePt(P.point(t,0,0,R,W), P.point(t,2*Math.PI,0,R,W))) all=false; }
  ok('중심선 폐곡선: point(t,0,0)=point(t,2π,0) (t=0..5 전수)', all);
})();

// ★독립 재계산 — 기하로 모서리 이어짐 판정:
//   u=2π에서 v=+1 끝점이 u=0의 v=-1 시작점과 만나면(홀수 꼬임) 모서리는 하나다.
//   짝수 꼬임이면 v=+1 → v=+1로 제자리 복귀(모서리 둘).
(function(){
  var all=true;
  for(var t=0;t<=8;t++){
    var end=P.point(t,2*Math.PI,1,R,W);
    var geoOne = samePt(end, P.point(t,0,-1,R,W));   // 반대 모서리에 접속
    var geoTwo = samePt(end, P.point(t,0, 1,R,W));   // 제 모서리로 복귀
    var claim = P.edgeCount(t);
    if(t%2===1){ if(!(geoOne && !geoTwo && claim===1)) all=false; }
    else       { if(!(geoTwo && !geoOne && claim===2)) all=false; }
  }
  ok('★기하↔위상 정합: 모서리 이어짐(기하) ⇔ edgeCount(홀=1/짝=2) (t=0..8 전수)', all);
})();

// edgeCount/sideCount — 홀짝 전수 + 항상 동수(뫼비우스의 본질: 면 수=모서리 수)
(function(){
  var all=true, eq=true;
  for(var t=0;t<=20;t++){
    var want=(t%2===1)?1:2;
    if(P.edgeCount(t)!==want || P.sideCount(t)!==want) all=false;
    if(P.edgeCount(t)!==P.sideCount(t)) eq=false;
  }
  ok('edgeCount·sideCount 홀=1/짝=2 (t=0..20 전수)', all);
  ok('면 수 = 모서리 수 (t=0..20 전수)', eq);
})();

// centerCut — 배반의 수학: 홀수 꼬임은 잘라도 하나(2배), 짝수는 둘
ok('centerCut(0): 두 조각·같은 길이·비연결', (function(){ var c=P.centerCut(0); return c.pieces===2&&c.lenFactor===1&&c.linked===false; })());
ok('centerCut(1): 한 조각·2배 길이 (배반의 실체)', (function(){ var c=P.centerCut(1); return c.pieces===1&&c.lenFactor===2; })());
ok('centerCut(2): 두 조각·서로 얽힘', (function(){ var c=P.centerCut(2); return c.pieces===2&&c.linked===true; })());
(function(){
  var all=true;
  for(var t=0;t<=12;t++){
    var c=P.centerCut(t);
    if(t%2===1){ if(!(c.pieces===1 && c.lenFactor===2 && c.twists===2*t && c.linked===false)) all=false; }
    else       { if(!(c.pieces===2 && c.lenFactor===1 && c.linked===(t>=2))) all=false; }
  }
  ok('centerCut 홀짝 전수 (t=0..12): 홀=하나로 펼침·꼬임 2배 / 짝=둘·t≥2 얽힘', all);
})();

// thirdCut — 히든·재체험 재료
(function(){
  var all=true;
  for(var t=0;t<=12;t++){
    var c=P.thirdCut(t);
    if(t%2===1){ if(!(c.pieces===2 && c.linked===true && c.lenFactor[0]===1 && c.lenFactor[1]===2)) all=false; }
    else       { if(!(c.pieces===3 && c.linked===false && c.lenFactor===1)) all=false; }
  }
  ok('thirdCut 홀짝 전수 (t=0..12): 홀=둘(1배+2배 얽힘) / 짝=셋', all);
})();

// 전시 서사 고정점: 보통 고리는 예측대로 둘, 꼬인 고리는 배반으로 하나
ok('서사 고정: 보통(0)=예측(2조각) · 뫼비우스(1)=배반(1조각)',
   P.centerCut(0).pieces===2 && P.centerCut(1).pieces===1);

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' FAIL':' 통과'));
process.exit(fail?1:0);
