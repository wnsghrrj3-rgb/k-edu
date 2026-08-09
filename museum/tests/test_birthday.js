/* test_birthday.js — M10 생일 쌍둥이 E1 순수 로직 검증
   BigInt 정확분수를 부동소수 독립 재계산과 대조하고(±1 천분율),
   halfN=23·certainN=366(비둘기집)·simulate↔firstCollision 전수 정합을 고정한다. */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex10_birthday.html'),'utf8');
var m=html.match(/<script id="birthday-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// mulberry32 — 코어 rng와 동일 계보의 시드 고정 난수(하니스 독립 사본)
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0;
  var t=Math.imul(a^a>>>15, 1|a); t=t+Math.imul(t^t>>>7, 61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296; }; }

// 정확분수 기본
ok('DAYS=365', P.DAYS===365);
ok('pNoMatch(1)=365/365', (function(){ var f=P.pNoMatch(1); return f.num===365n&&f.den===365n; })());
ok('pNoMatch(2).num=365·364', P.pNoMatch(2).num===365n*364n);
ok('pNoMatch(366).num=0 (비둘기집)', P.pNoMatch(366).num===0n);

// ★독립 재계산 — 부동소수로 같은 곱을 따로 쌓아 천분율 ±1 이내 대조 (n=1..80 전수)
(function(){
  var all=true, p=1;
  for(var n=1;n<=80;n++){
    p*= (365-(n-1))/365;
    var floatPermille=Math.round((1-p)*1000);
    if(Math.abs(P.pMatchPermille(n)-floatPermille)>1) all=false;
  }
  ok('★독립 부동소수 대조: pMatchPermille ±1‰ (n=1..80 전수)', all);
})();

// 이정표 — 전시의 여운·슬라이더가 딛는 값
ok('스물셋 = 절반: pMatchPermille(23)=507', P.pMatchPermille(23)===507);
ok('pMatchPermille(22)<500≤pMatchPermille(23)', P.pMatchPermille(22)<500 && P.pMatchPermille(23)>=500);
ok('pMatchPermille(50)=970', P.pMatchPermille(50)===970);
ok('pMatchPermille(366)=1000 (확실)', P.pMatchPermille(366)===1000);
ok('n=365는 반올림상 1000‰이나 정확분수로는 아직 확실 아님(num>0)', P.pMatchPermille(365)===1000 && P.pNoMatch(365).num>0n);

// 단조 — 손님이 늘수록 확률은 줄지 않는다 (분수 교차곱, 부동소수 0)
(function(){
  var mono=true, prev=P.pNoMatch(1);
  for(var n=2;n<=120;n++){
    var cur=P.pNoMatch(n);
    if(cur.num*prev.den > prev.num*cur.den) mono=false;   // pNoMatch 비증가
    prev=cur;
  }
  ok('pNoMatch 단조 비증가 (n=1..120, BigInt 교차곱 전수)', mono);
})();

// halfN·certainN
ok('halfN()=23', P.halfN()===23);
ok('certainN()=366 (비둘기집 정확점)', P.certainN()===366);

// firstCollision
ok('firstCollision([])=-1', P.firstCollision([])===-1);
ok('firstCollision([1,2,3])=-1', P.firstCollision([1,2,3])===-1);
ok('firstCollision([1,2,3,2])=4', P.firstCollision([1,2,3,2])===4);
ok('firstCollision([5,5])=2 (즉시)', P.firstCollision([5,5])===2);
ok('firstCollision 최초 위치: [1,2,1,2]=3', P.firstCollision([1,2,1,2])===3);

// simulate — 시드 재현·정합·산포
(function(){
  var a=P.simulate(mulberry32(42)), b=P.simulate(mulberry32(42));
  ok('simulate 시드 재현: 같은 시드=같은 결과', a.n===b.n && a.day===b.day);
  ok('simulate↔firstCollision 정합', P.firstCollision(a.days)===a.n);
  ok('simulate 충돌 실물: 마지막 생일이 앞에 이미 있다',
     a.days.slice(0,-1).indexOf(a.days[a.days.length-1])>=0);
})();
(function(){
  // 200 시드 전수 — 정합·범위·중앙값(≈23) 산포
  var all=true, inRange=true, ns=[];
  for(var s=1;s<=200;s++){
    var r=P.simulate(mulberry32(s));
    if(P.firstCollision(r.days)!==r.n) all=false;
    if(!(r.n>=2 && r.n<=366)) inRange=false;
    ns.push(r.n);
  }
  ns.sort(function(x,y){return x-y;});
  var med=ns[100];
  ok('simulate 200시드: firstCollision 정합 전수', all);
  ok('simulate 200시드: 2≤n≤366 (비둘기집 상한)', inRange);
  ok('simulate 200시드: 중앙값∈[20,26] (스물셋 언저리)', med>=20 && med<=26);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' FAIL':' 통과'));
process.exit(fail?1:0);
