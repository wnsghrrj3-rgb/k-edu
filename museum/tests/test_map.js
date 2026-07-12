/* test_map.js — S8 거짓말하는 지도 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex08_map.html'),'utf8');
var m=html.match(/<script id="map-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function rel(a,b){ return Math.abs(a-b)/Math.max(Math.abs(b),1e-12); }

// 데이터 무결
(function(){
  ok('나라 10종 · 링 전부 3점 이상', P.ORDER.length===10 && P.ORDER.every(function(id){
    var rs=P.rings(id);
    return rs.length>0 && rs.every(function(r){ return r.length>=3; });
  }));
  ok('배경 육지 링 존재', P.bgRings().length>50);
})();

// ★정리 1 — 면적 보존: 지구 위에서 나라는 줄지 않는다 (전 나라 × 안전 영역 전수)
(function(){
  var worst=0, wid='';
  P.ORDER.forEach(function(id){
    var base=P.sphericalArea(P.rings(id));
    var sgn=P.DATA[id].lat0>=0?1:-1, lim=P.safeLat(id);
    for(var v=0; v<=lim; v+=2){
      var a=P.sphericalArea(P.landAt(id, sgn*v));
      var r=rel(a, base);
      if(r>worst){ worst=r; wid=id+'@'+(sgn*v); }
    }
  });
  ok('★면적 보존 정리: 구면 회전은 면적을 정확히 보존(전 나라 × 안전 영역 전수, 최악 '+worst.toExponential(1)+' @'+wid+')', worst<1e-9);
  // 안전 영역 = 극을 넘지 않는 영역. 전시는 이 밖으로 나라를 돌리지 않는다.
  var bad=[];
  P.ORDER.forEach(function(id){
    var sgn=P.DATA[id].lat0>=0?1:-1, lim=P.safeLat(id);
    for(var v=0; v<=lim; v+=2){
      if(P.maxAbsLat(P.landAt(id, sgn*v)) > P.LIMIT+1e-9) bad.push(id+'@'+(sgn*v));
    }
    if(lim < Math.abs(P.DATA[id].lat0)) bad.push(id+' 제자리 미포함');
  });
  ok('★안전 영역: 전 나라 × 전 목표위도에서 극을 넘지 않는다 · 제자리는 항상 포함'+(bad.length?' ['+bad.slice(0,3).join(',')+']':''), bad.length===0);
  ok('그린란드 안전 상한 = 제자리 부근(극이 가깝다) · 콩고는 넓다',
     P.safeLat('greenland')>=72 && P.safeLat('greenland')<=76 && P.safeLat('congo')>=40);
})();

// ★정리 2 — 정직: 동결 폴리곤 구면면적 ↔ 통용 실측 ±5%
(function(){
  var bad=[];
  P.ORDER.forEach(function(id){
    var a=P.sphericalArea(P.rings(id));
    var pub=P.PUBLISHED[id];
    if(rel(a,pub)>0.05) bad.push(id+' '+(100*rel(a,pub)).toFixed(1)+'%');
    if(Math.abs(a-P.km2(id))>1) bad.push(id+' km2 불일치');
  });
  ok('★정직 정리: 전 나라 폴리곤 면적 = 통용 실측 ±5%'+(bad.length?' ['+bad.join(', ')+']':''), bad.length===0);
})();

// ★정리 3 — 배반의 순수 표현: 실제는 더 작은데, 화면에서는 열다섯 배
(function(){
  var gReal=P.km2('greenland'), cReal=P.km2('congo');
  var gScr=P.planarArea(P.rings('greenland')), cScr=P.planarArea(P.rings('congo'));
  ok('★배반 ①: 실제 그린란드 < 콩고민주공화국 ('+Math.round(gReal).toLocaleString()+' < '+Math.round(cReal).toLocaleString()+')', gReal<cReal);
  ok('★배반 ②: 화면 그린란드 > 콩고 ×10 (실측 '+(gScr/cScr).toFixed(1)+'배)', gScr/cScr>10);
})();

// ★정리 4 — 메르카토르 배율: 화면면적 ÷ 구면면적 = sec²φ (면적 왜곡의 정의 그 자체)
(function(){
  function box(lat){ var e=0.05; return [[[0,lat-e],[e*2,lat-e],[e*2,lat+e],[0,lat+e]]]; }
  function distort(lat){ return P.planarArea(box(lat)) / P.sphericalArea(box(lat)); }
  var base=distort(0);
  var bad=[];
  [0,15,30,45,60,75].forEach(function(lat){
    var got=distort(lat)/base;
    var want=P.areaScaleAt(lat);
    if(rel(got,want)>0.01) bad.push(lat+'도: '+got.toFixed(3)+' vs '+want.toFixed(3));
  });
  ok('★배율 정리: 화면면적÷구면면적 = sec²φ (φ=0·15·30·45·60·75, 1% 이내)'+(bad.length?' ['+bad.join(' / ')+']':''), bad.length===0);
  ok('북위 60도 = 네 배 · 75도 = 약 14.9배',
     Math.abs(P.areaScaleAt(60)-4)<0.01 && Math.abs(P.areaScaleAt(75)-14.93)<0.05);
  // 나라 규모에서도: 같은 나라를 위도만 바꾸면 화면 크기는 sec²φ 비로 간다(유한 크기라 근사)
  var g0=P.planarArea(P.landAt('congo',0)), g60=P.planarArea(P.landAt('congo',60));
  ok('콩고를 북위 60도에 놓으면 화면에서 네 배 안팎으로 부푼다 (실측 '+(g60/g0).toFixed(1)+'배)',
     g60/g0>3.4 && g60/g0<5.0);
})();

// ★정리 5 — 그린란드 = 아프리카(지도) / 1÷14(실제)
(function(){
  var g=P.planarArea(P.rings('greenland'));
  var af=P.bgRings().filter(function(r){
    var lo=r.map(function(p){return p[0];}), la=r.map(function(p){return p[1];});
    var cx=(Math.min.apply(null,lo)+Math.max.apply(null,lo))/2;
    var cy=(Math.min.apply(null,la)+Math.max.apply(null,la))/2;
    return cx>-20 && cx<53 && cy>-36 && cy<38;
  });
  var a=P.planarArea(af);
  var ratio=g/a;
  ok('★거짓말 ①: 지도에서 그린란드 ≒ 아프리카 (실측 '+ratio.toFixed(2)+'배)', ratio>0.9 && ratio<1.2);
  var real=P.PUBLISHED.greenland/P.PUBLISHED.africa;
  ok('★거짓말 ②: 실제는 아프리카의 1/14 ('+(1/real).toFixed(1)+'분의 1)', real<0.08 && (1/real)>13 && (1/real)<15);
})();

// ★정리 6 — 적도의 정직 (예측 심기의 순수 증명)
(function(){
  var base=P.planarArea(P.landAt('congo',0));
  var worst=0;
  for(var lat=-5; lat<=5; lat+=1){
    var r=rel(P.planarArea(P.landAt('congo',lat)), base);
    if(r>worst) worst=r;
  }
  ok('★적도의 정직: 콩고를 ±5도 안에서 옮겨도 화면 크기 변화 < 2% (최악 '+(100*worst).toFixed(2)+'%)', worst<0.02);
  // 그리고 적도권 나라는 제자리 ↔ 적도 사이에서 눈에 띄지 않는다
  var bad=[];
  ['brazil','australia','india','congo'].forEach(function(id){
    var home=P.planarArea(P.rings(id)), eq=P.planarArea(P.landAt(id,0));
    var chg=Math.abs(home-eq)/home;
    if(chg>0.25) bad.push(id+' '+(100*chg).toFixed(0)+'%');
  });
  ok('★예측 심기: 적도권 4국은 적도로 끌어내려도 화면 변화 25% 미만'+(bad.length?' ['+bad.join(', ')+']':''), bad.length===0);
  // 반면 그린란드는
  var gh=P.planarArea(P.rings('greenland')), ge=P.planarArea(P.landAt('greenland',0));
  ok('★배반의 크기: 그린란드는 적도에서 화면 1/9 이하로 (실측 1/'+(gh/ge).toFixed(1)+')', gh/ge>9);
})();

// 투영 왕복·단조·유계
(function(){
  var good=true;
  for(var lat=-84; lat<=84; lat+=0.5){
    if(rel(P.invMercY(P.mercY(lat)), lat)>1e-9 && Math.abs(P.invMercY(P.mercY(lat))-lat)>1e-7) good=false;
  }
  ok('투영 왕복: invMercY(mercY(φ)) = φ (−84..84 전수)', good);
  var mono=true, prev=-Infinity;
  for(var la=-84; la<=84; la+=0.5){ var y=P.mercY(la); if(y<=prev) mono=false; prev=y; }
  ok('mercY 단조 증가(전수)', mono);
  ok('mercY 극지 유계(클램프 84.5도)', isFinite(P.mercY(90)) && isFinite(P.mercY(-90)));
  ok('areaScaleAt(0)=1 · scaleAt 단조', Math.abs(P.areaScaleAt(0)-1)<1e-12 && P.scaleAt(60)>P.scaleAt(30));
})();

// 회전의 정합: 중심위도가 정확히 목표로 간다
(function(){
  var bad=[];
  P.ORDER.forEach(function(id){
    [0,20,-30,55].forEach(function(lat){
      var got=P.rotateLat([P.DATA[id].lon0, P.DATA[id].lat0], P.DATA[id].lon0, P.DATA[id].lat0-lat);
      if(Math.abs(got[1]-lat)>1e-9) bad.push(id+'@'+lat);
    });
  });
  ok('회전 정합: 중심위도 lat0 → 목표 위도 정확 착지(전 나라 × 4점)'+(bad.length?' ['+bad.slice(0,3).join(',')+']':''), bad.length===0);
})();

console.log('\nS8 거짓말하는 지도 — E1: '+pass+'/'+(pass+fail)+' 통과');
console.log('map-pure sha256[16] = '+hash);
if(fail) process.exit(1);
