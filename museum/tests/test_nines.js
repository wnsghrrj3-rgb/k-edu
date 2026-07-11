/* test_nines.js — M6 0.999…의 방 E1 순수 로직 검증 (BigInt 분수) */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex06_nines.html'),'utf8');
var m=html.match(/<script id="nines-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 표기
ok("nines(1)='0.9'", P.nines(1)==='0.9');
ok("nines(3)='0.999'", P.nines(3)==='0.999');
ok("nines(0)='0.'", P.nines(0)==='0.');
// 부분합(BigInt 분수)
ok('partialNum(3)=999n', P.partialNum(3)===999n);
ok('partialDen(3)=1000n', P.partialDen(3)===1000n);
ok('partialNum(20)=10^20-1', P.partialNum(20)===10n**20n-1n);
// ★ 간극 분자 = 항상 1 (자기유사의 순수 표현) — n=1..40 전수
var gap1=true;
for(var n=1;n<=40;n++){ if(P.gapNumerator(n)!==1n) gap1=false; }
ok('gapNumerator(n)=1n (n=1..40 전수)', gap1);
ok('gapDen(5)=100000n', P.gapDen(5)===100000n);
// 자기유사: gapDen(n+1) = 10 × gapDen(n)
var selfSim=true;
for(var n=1;n<=30;n++){ if(P.gapDen(n+1)!==10n*P.gapDen(n)) selfSim=false; }
ok('자기유사 gapDen(n+1)=10·gapDen(n) (1..30)', selfSim);
// 유한이면 언제나 간극
ok('lessThanOne(1)=true', P.lessThanOne(1)===true);
ok('lessThanOne(50)=true', P.lessThanOne(50)===true);
// 단조증가(교차곱): partial(n+1) > partial(n)
var mono=true;
for(var n=1;n<=25;n++){
  if(P.partialNum(n+1)*P.partialDen(n) <= P.partialNum(n)*P.partialDen(n+1)) mono=false;
}
ok('단조증가 partial(n+1)>partial(n) (1..25)', mono);
// 히든(1/3의 문): 0.33…3 × 3 = 0.99…9
ok("thirds(4)='0.3333'", P.thirds(4)==='0.3333');
ok('timesThree(4)=nines(4)', P.timesThree(4)===P.nines(4));
var t3=true;
for(var n=1;n<=15;n++){ if(P.timesThree(n)!==P.nines(n)) t3=false; }
ok('timesThree(n)=nines(n) (1..15 전수)', t3);

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' FAIL':' 통과'));
process.exit(fail?1:0);
