/* test_price.js — S5 짜장면 타임머신 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex05_time.html'),'utf8');
var m=html.match(/<script id="price-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 앵커 무결: 연도·가격 순증 전수 + 양 끝
(function(){
  var good=P.ANCHORS[0][0]===1970 && P.ANCHORS[0][1]===100
        && P.ANCHORS[P.ANCHORS.length-1][0]===2026 && P.ANCHORS[P.ANCHORS.length-1][1]===7000;
  for(var i=1;i<P.ANCHORS.length;i++){
    if(!(P.ANCHORS[i][0]>P.ANCHORS[i-1][0])) good=false;
    if(!(P.ANCHORS[i][1]>P.ANCHORS[i-1][1])) good=false;
  }
  ok('앵커: 연도·가격 순증 전수 + 1970=100·2026=7000', good);
})();

// 계단 정확: 전연도 1970..2026 — 앵커 연도 일치, 사이는 직전 기록 유지
(function(){
  var good=true;
  for(var y=1970;y<=2026;y++){
    var expect=null;
    for(var i=0;i<P.ANCHORS.length;i++) if(P.ANCHORS[i][0]<=y) expect=P.ANCHORS[i][1];
    if(P.priceAt(y)!==expect) good=false;
  }
  ok('계단 함수: 마지막 기록 유지 — 전연도 전수', good);
})();

// 클램프: 범위 밖은 양 끝 기록으로
(function(){
  ok('클램프: 1960→100 · 2100→7000 · 소수 연도 내림',
     P.priceAt(1960)===100 && P.priceAt(2100)===7000 && P.priceAt(1990.9)===1000);
})();

// ★고정 단언 — 지폐 한 장(7,000원)의 시대별 그릇 수
(function(){
  ok('★고정: 7000원 → 1970년 70그릇', P.bowlsFor(7000,1970)===70);
  ok('★고정: 7000원 → 2026년 1그릇', P.bowlsFor(7000,2026)===1);
  ok('★고정: 7000원 → 1980년 20그릇 · 1990년 7그릇 · 2000년 2그릇',
     P.bowlsFor(7000,1980)===20 && P.bowlsFor(7000,1990)===7 && P.bowlsFor(7000,2000)===2);
})();

// 그릇 수 단조 비증가: 고정 돈, 연도 오름 전수
(function(){
  var good=true;
  [1000,7000,50000].forEach(function(won){
    var prev=Infinity;
    for(var y=1970;y<=2026;y++){
      var n=P.bowlsFor(won,y);
      if(n>prev) good=false;
      prev=n;
    }
  });
  ok('단조: 같은 돈은 해가 갈수록 그릇이 줄기만 한다 — 전수', good);
})();

// 등가 항등식: k그릇 값이면 정확히 k그릇 — k=1..100 × 전 앵커 전수
(function(){
  var good=true;
  for(var i=0;i<P.ANCHORS.length;i++){
    var y=P.ANCHORS[i][0], p=P.ANCHORS[i][1];
    for(var k=1;k<=100;k++){
      if(P.bowlsFor(k*p,y)!==k) good=false;
      if(P.bowlsFor(k*p-1,y)!==k-1) good=false;   // 한 푼 모자라면 한 그릇 모자란다
    }
  }
  ok('등가 항등식: bowlsFor(k·가격,그 해)=k (경계 포함 전수)', good);
})();

// 역방향: 1970년 한 그릇 값(100원)으로 오늘은 빈손
(function(){
  ok('역방향: 100원 → 2026년 0그릇 · 0원·음수 = 0그릇',
     P.bowlsFor(100,2026)===0 && P.bowlsFor(0,1970)===0 && P.bowlsFor(-500,1970)===0);
})();

// 배율: 일흔 배 정확 · NOTE = 오늘 정확히 한 그릇
(function(){
  ok('배율: priceAt(2026)/priceAt(1970) = 70 정확', P.priceAt(2026)/P.priceAt(1970)===70);
  ok('NOTE: 오늘의 지폐 = 오늘 한 그릇 값 정확', P.NOTE===P.priceAt(P.YEAR_MAX)
     && P.bowlsFor(P.NOTE,P.YEAR_MAX)===1);
})();

// anchorIndexAt 정합: priceAt과 단일 원천
(function(){
  var good=true;
  for(var y=1970;y<=2026;y++)
    if(P.ANCHORS[P.anchorIndexAt(y)][1]!==P.priceAt(y)) good=false;
  ok('anchorIndexAt ↔ priceAt 단일 원천 전수', good);
})();

console.log((fail===0?'✓':'x')+' S5 E1: '+pass+'/'+(pass+fail)+' · pure sha256 '+hash);
process.exit(fail===0?0:1);
