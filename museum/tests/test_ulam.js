/* test_ulam.js — M3 아무도 모르는 줄무늬 E1 순수 로직 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex03_ulam.html'),'utf8');
var m=html.match(/<script id="ulam-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function eq(p,x,y){ return p && p.x===x && p.y===y; }

// 기본 좌표
ok('spiralPos(1)=(0,0)', eq(P.spiralPos(1),0,0));
ok('spiralPos(2)=(1,0)', eq(P.spiralPos(2),1,0));
ok('spiralPos(3)=(1,1)', eq(P.spiralPos(3),1,1));
ok('spiralPos(5)=(-1,1)', eq(P.spiralPos(5),-1,1));
ok('spiralPos(9)=(1,-1)', eq(P.spiralPos(9),1,-1));
ok('spiralPos(25)=(2,-2)', eq(P.spiralPos(25),2,-2));

// ★ 왕복 전수 1..20000
(function(){
  var good=true;
  for(var n=1;n<=20000;n++){
    var p=P.spiralPos(n);
    if(P.posToN(p.x,p.y)!==n){ good=false; break; }
  }
  ok('★ 왕복 posToN(spiralPos(n))=n 전수(1..20000)', good);
})();

// 홀수 제곱 코너 (2k+1)² = (k,−k) 전수
(function(){
  var good=true;
  for(var k=0;k<=40;k++){
    var v=(2*k+1)*(2*k+1);
    if(!eq(P.spiralPos(v),k,-k)) good=false;
  }
  ok('홀수 제곱 코너 (2k+1)²=(k,-k) 전수(k=0..40)', good);
})();

// 나선 연속성: 이웃 수는 이웃 칸(맨해튼 거리 1) 전수
(function(){
  var good=true;
  for(var n=1;n<10000;n++){
    var a=P.spiralPos(n), b=P.spiralPos(n+1);
    if(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)!==1){ good=false; break; }
  }
  ok('나선 연속성: |Δ|=1 전수(1..10000)', good);
})();

// ★ sieve ↔ isPrime 전수 대조
(function(){
  var s=P.sieve(10000), good=true;
  for(var n=0;n<=10000;n++)
    if(!!s[n]!==P.isPrime(n)){ good=false; break; }
  ok('★ sieve↔isPrime 전수 대조(0..10000)', good);
})();

// 소수 계수
ok('π(100)=25', P.primeCount(100)===25);
ok('π(10^4)=1229', P.primeCount(10000)===1229);

// 경계
ok('경계: 0·1·음수 비소수, 2·3 소수', !P.isPrime(0) && !P.isPrime(1) && !P.isPrime(-7) && P.isPrime(2) && P.isPrime(3));
ok('합성 검출: 91=7×13, 9409=97²', !P.isPrime(91) && !P.isPrime(9409));

// 오일러 다항식 n²+n+41
(function(){
  var good=true;
  for(var n=0;n<=39;n++) if(!P.isPrime(n*n+n+41)) good=false;
  ok('오일러 n²+n+41 소수 전수(n=0..39)', good);
})();
ok('오일러 n=40 합성(41²=1681)', !P.isPrime(40*40+40+41));

// ★ 비공선 실측 고정: 1-중심 나선에서 오일러 소수들은 한 대각선이 아니다
(function(){
  var sums={}, difs={}, ns=0, nd=0;
  for(var n=0;n<=39;n++){
    var p=P.spiralPos(n*n+n+41);
    var ks=p.x+p.y, kd=p.x-p.y;
    if(!sums[ks]){ sums[ks]=1; ns++; }
    if(!difs[kd]){ difs[kd]=1; nd++; }
  }
  ok('★ 비공선 고정: x+y 21종 · x−y 28종', ns===21 && nd===28);
})();

// 41-중심 나선(히든의 수학적 근거): v(n)−40의 위치는 한 대각선
(function(){
  var difs={}, nd=0;
  for(var n=0;n<=39;n++){
    var p=P.spiralPos(n*n+n+41-40);        // 41을 1로 이동한 나선
    var kd=p.x-p.y;
    if(!difs[kd]){ difs[kd]=1; nd++; }
  }
  ok('히든 근거: 41-중심 나선에서 오일러 소수 x−y 단일 대각(≤2종)', nd<=2);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
process.exit(fail?1:0);
