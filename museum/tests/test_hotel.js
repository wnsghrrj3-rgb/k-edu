/* test_hotel.js — M5 끝없는 호텔 E1 순수 로직 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex05_hotel.html'),'utf8');
var m=html.match(/<script id="hotel-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 사상 기본
ok('shift(1,1)=2', P.shift(1,1)===2);
ok('shift(100,1)=101', P.shift(100,1)===101);
ok('shift(7,12)=19', P.shift(7,12)===19);
// 점유/빈방
ok('occupantOf(1,1)=0 (빈방)', P.occupantOf(1,1)===0);
ok('occupantOf(2,1)=1', P.occupantOf(2,1)===1);
ok('occupantOf(50,7)=43', P.occupantOf(50,7)===43);
ok('isVacated(3,5)=true', P.isVacated(3,5)===true);
ok('isVacated(6,5)=false', P.isVacated(6,5)===false);
ok('isVacated(0,5)=false', P.isVacated(0,5)===false);
ok('vacatedCount(12)=12', P.vacatedCount(12)===12);
// 불변식 1: 단사성(충돌 0) — k=1,7에서 1..500
[1,7].forEach(function(k){
  var seen={}, dup=false;
  for(var n=1;n<=500;n++){ var r=P.shift(n,k); if(seen[r]) dup=true; seen[r]=1; }
  ok('단사성 k='+k+' (1..500 충돌 0)', !dup);
});
// 불변식 2: 손님 보존 — 아무도 사라지지 않음
var lost=false;
for(var n=1;n<=300;n++){ if(P.occupantOf(P.shift(n,9),9)!==n) lost=true; }
ok('손님 보존 occupantOf(shift(n,9),9)=n (1..300)', !lost);
// 불변식 3: 빈방 정합 — occupantOf=0 ⇔ isVacated
var mismatch=false;
for(var r=1;r<=100;r++){ if((P.occupantOf(r,15)===0)!==P.isVacated(r,15)) mismatch=true; }
ok('빈방 정합 (occupant 0 ⇔ vacated, k=15)', !mismatch);
// 히든(무한 버스) 사상
ok('evenMap(3)=6', P.evenMap(3)===6);
ok('evenMap 단사성 (1..300)', (function(){ var s={},d=false; for(var n=1;n<=300;n++){ var r=P.evenMap(n); if(s[r])d=true; s[r]=1; } return !d; })());
ok('홀수방 빈방: 7=true, 8=false', P.isOddVacatedAfterEvenMap(7)===true && P.isOddVacatedAfterEvenMap(8)===false);

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' FAIL':' 통과'));
process.exit(fail?1:0);
