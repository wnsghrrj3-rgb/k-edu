/* test_galton.js — M9 우연이 만드는 산 E1 순수 로직 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex09_galton.html'),'utf8');
var m=html.match(/<script id="galton-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 기본값
ok('binom(12,6)=924', P.binom(12,6)===924n);
ok('binom(4,2)=6', P.binom(4,2)===6n);
ok('binom(24,12)=2704156', P.binom(24,12)===2704156n);
ok('binom 경계(k<0)=0', P.binom(5,-1)===0n);
ok('binom 경계(k>n)=0', P.binom(5,6)===0n);
ok('rowSum(10)=1024', P.rowSum(10)===1024n);
ok('modeBin(12)=6', P.modeBin(12)===6);
ok('modeBin(9)=4', P.modeBin(9)===4);

// 불변식 1: 대칭성 — n=1..24 전수
var sym=true;
for(var n=1;n<=24;n++) for(var k=0;k<=n;k++) if(P.binom(n,k)!==P.binom(n,n-k)) sym=false;
ok('대칭성 binom(n,k)=binom(n,n-k) 전수(n=1..24)', sym);

// 불변식 2: 합 = 2^n — 전수
var sum=true;
for(n=1;n<=24;n++){ var s=0n; for(k=0;k<=n;k++) s+=P.binom(n,k); if(s!==P.rowSum(n)) sum=false; }
ok('Σbinom(n,k)=2^n 전수(n=1..24)', sum);

// 불변식 3: 단봉성 — 증가→감소
var uni=true;
for(n=2;n<=24;n++){ var up=true;
  for(k=1;k<=n;k++){ var inc=P.binom(n,k)>=P.binom(n,k-1);
    if(up && !inc) up=false; else if(!up && inc){ uni=false; } } }
ok('단봉성(증가→감소) 전수(n=2..24)', uni);

// 불변식 4: ★전경로 전수(n=10) — 우연 1024개를 전부 세면 정확히 파스칼 행
var counts=[]; for(k=0;k<=10;k++) counts.push(0);
for(var b=0;b<1024;b++){
  var bits=[]; for(var i=0;i<10;i++) bits.push((b>>i)&1);
  counts[P.pathBin(bits,10)]++;
}
var exact=true;
for(k=0;k<=10;k++) if(BigInt(counts[k])!==P.binom(10,k)) exact=false;
ok('★전경로 전수(2^10) = 파스칼 행 정확 일치', exact);

// pathBin 개별
ok('pathBin 전부 좌 = 0', P.pathBin([0,0,0,0,0],5)===0);
ok('pathBin 전부 우 = n', P.pathBin([1,1,1,1,1],5)===5);
ok('pathBin 혼합', P.pathBin([1,0,1,1,0,0,1],7)===4);

// heights — 이론 능선
var h=P.heights(12,10000);
ok('heights 길이 = n+1', h.length===13);
var tot=h.reduce(function(a,b){return a+b;},0);
ok('heights 합 = total(±1e-6)', Math.abs(tot-10000)<1e-6);
ok('heights 꼭대기 = modeBin', h[6]>=h[5] && h[6]>=h[7]);
ok('heights(12,10000) 꼭대기 ≈ 2256', Math.abs(h[6]-2255.859375)<1e-6);

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 전부 통과'));
process.exit(fail?1:0);
