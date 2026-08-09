/* test_chess.js — M7 체스판의 공포 E1 순수 로직 검증
   BigInt 배가의 수학을 독립 재계산(낟알을 실제로 다 더해서)으로 대조하고,
   "다음 칸 하나가 앞선 전부보다 한 톨 많다"는 배반의 핵을 전수로 고정한다. */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex07_chess.html'),'utf8');
var m=html.match(/<script id="chess-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 기본값
ok('grains(1)=1', P.grains(1)===1n);
ok('grains(2)=2', P.grains(2)===2n);
ok('grains(64)=2^63', P.grains(64)===2n**63n);
ok('cumulative(1)=1', P.cumulative(1)===1n);
ok('total64 = 18,446,744,073,709,551,615', P.total64().toString()==='18446744073709551615');
ok('total64 = cumulative(64)', P.total64()===P.cumulative(64));
ok('digits(1)=1 · digits(64)=20', P.digits(1)===1 && P.digits(64)===20);

// ★독립 재계산 — 누적을 공식이 아니라 실제 합산으로: Σ grains(1..k) = cumulative(k) 전수
(function(){
  var sum=0n, all=true;
  for(var k=1;k<=64;k++){ sum+=P.grains(k); if(sum!==P.cumulative(k)) all=false; }
  ok('★독립 합산 Σgrains = cumulative (k=1..64 전수)', all);
})();

// 배가 구조 전수
(function(){
  var all=true;
  for(var k=1;k<64;k++){ if(P.grains(k+1)!==2n*P.grains(k)) all=false; }
  ok('배가: grains(k+1)=2·grains(k) (전수)', all);
})();
(function(){
  var all=true;
  for(var k=2;k<=64;k++){ if(P.grains(k)!==P.cumulative(k)-P.cumulative(k-1)) all=false; }
  ok('정합: grains(k)=cumulative(k)−cumulative(k−1) (전수)', all);
})();

// ★배반의 핵 — 다음 칸 하나 = 앞선 전부 + 한 톨 (전수)
(function(){
  var all=true;
  for(var k=1;k<64;k++){ if(P.grains(k+1)!==P.cumulative(k)+1n) all=false; }
  ok('★배반의 핵: grains(k+1)=cumulative(k)+1 (전수)', all);
})();

// 자릿수 폭주 — 단조 비감소·정확값 표본
(function(){
  var mono=true;
  for(var k=1;k<64;k++){ if(P.digits(k+1)<P.digits(k)) mono=false; }
  ok('digits 단조 비감소 (전수)', mono);
})();
ok('digits(10)=4 (1023) · digits(20)=7 (1048575) · digits(32)=10', P.digits(10)===4 && P.digits(20)===7 && P.digits(32)===10);

// firstOverflowCol — 경계·단조·무초과
ok('firstOverflowCol(0)=1 (첫 톨부터 초과)', P.firstOverflowCol(0)===1);
ok('firstOverflowCol(1)=2', P.firstOverflowCol(1)===2);
ok('firstOverflowCol(1000000)=20 (2^20−1=1,048,575)', P.firstOverflowCol(1000000)===20);
ok('firstOverflowCol(total64)=-1 (넘는 칸 없음)', P.firstOverflowCol(P.total64().toString())===-1);
ok('firstOverflowCol(total64−1)=64', P.firstOverflowCol((P.total64()-1n).toString())===64);
(function(){
  // cap이 클수록 초과 칸은 뒤로만 간다 — 2^k 경계 전수(단조)
  var mono=true, prev=0;
  for(var k=0;k<63;k++){
    var c=P.firstOverflowCol((2n**BigInt(k)).toString());
    if(c<prev) mono=false; prev=c;
  }
  ok('firstOverflowCol 단조 (2^k 전수)', mono);
  // 정의 검산: cap=2^k일 때 cumulative(c−1)≤cap<cumulative(c)
  var defOK=true;
  for(k=0;k<63;k++){
    var cap=2n**BigInt(k), c2=P.firstOverflowCol(cap.toString());
    if(!(P.cumulative(c2)>cap && (c2===1 || P.cumulative(c2-1)<=cap))) defOK=false;
  }
  ok('firstOverflowCol 정의 검산: 직전 칸 이하·해당 칸 초과 (2^k 전수)', defOK);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' FAIL':' 통과'));
process.exit(fail?1:0);
