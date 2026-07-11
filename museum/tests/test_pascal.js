/* test_pascal.js — M2 숨은 그림 E1 순수 로직 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','math','ex02_pascal.html'),'utf8');
var m=html.match(/<script id="pascal-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 기본값 — 행 0..4 알려진 홀짝
ok('parity 행0 = [1]', P.rowParity(0).join('')==='1');
ok('parity 행1 = [1,1]', P.rowParity(1).join('')==='11');
ok('parity 행2 = [1,0,1]', P.rowParity(2).join('')==='101');
ok('parity 행3 = [1,1,1,1]', P.rowParity(3).join('')==='1111');
ok('parity 행4 = [1,0,0,0,1]', P.rowParity(4).join('')==='10001');
ok('parity 경계(k<0, k>n) = 0', P.parity(5,-1)===0 && P.parity(5,6)===0);

// ★ 전수 대조 1: 가산 DP mod 2 (행 0..128) — 뤼카가 파스칼과 같은 그림
(function(){
  var same=true, row=[1];
  for(var n=0;n<=128;n++){
    for(var k=0;k<=n;k++) if(P.parity(n,k)!==row[k]) same=false;
    var next=[1];
    for(var k2=1;k2<=n;k2++) next.push((row[k2-1]+row[k2])&1);
    next.push(1); row=next;
  }
  ok('★ 가산 DP mod2 전수 대조(행 0..128)', same);
})();

// 대칭성 전수
(function(){
  var sym=true;
  for(var n=0;n<=128;n++) for(var k=0;k<=n;k++)
    if(P.parity(n,k)!==P.parity(n,n-k)) sym=false;
  ok('대칭 parity(n,k)=parity(n,n-k) 전수(행 0..128)', sym);
})();

// oddCount = 2^popcount — rowParity 합과 전수 대조(0..256)
(function(){
  var good=true;
  for(var n=0;n<=256;n++){
    var s=P.rowParity(n).reduce(function(a,b){return a+b;},0);
    if(P.oddCount(n)!==s) good=false;
    if(P.oddCount(n)!==(1<<P.popcount(n))) good=false;
  }
  ok('oddCount=2^popcount=행 홀수합 전수(0..256)', good);
})();
ok('popcount 기본(0,1,255,128)', P.popcount(0)===0 && P.popcount(1)===1 && P.popcount(255)===8 && P.popcount(128)===1);

// ★ oddTotal(2^m) = 3^m — 프랙탈 차원의 순수 표현 (m=0..8)
(function(){
  var good=true, p3=1;
  for(var mm=0;mm<=8;mm++){
    if(P.oddTotal(Math.pow(2,mm))!==p3) good=false;
    p3*=3;
  }
  ok('★ oddTotal(2^m)=3^m 전수(m=0..8)', good);
})();
ok('oddTotal(128)=3^7=2187', P.oddTotal(128)===2187);

// ★ 자기유사 전수(m=5): 세 채의 삼각형·가운데 구멍
(function(){
  var M=32, threeCopies=true, holeEmpty=true;
  for(var n=0;n<M;n++) for(var k=0;k<=n;k++){
    if(P.parity(M+n,k)!==P.parity(n,k)) threeCopies=false;           // 좌하 채
    if(P.parity(M+n,M+k)!==P.parity(n,k)) threeCopies=false;         // 우하 채
  }
  for(var n2=M;n2<2*M;n2++) for(var k2=n2-M+1;k2<M;k2++)
    if(P.parity(n2,k2)!==0) holeEmpty=false;                         // 중앙 역삼각 전부 0
  ok('★ 자기유사: 좌하·우하 채 = 원본 전수(2^5 블록)', threeCopies);
  ok('★ 자기유사: 중앙 역삼각 구멍 전부 0', holeEmpty);
})();

// modP=3 — 가산 DP mod 3 전수 대조(행 0..81)
(function(){
  var same=true, row=[1];
  for(var n=0;n<=81;n++){
    for(var k=0;k<=n;k++) if(P.modP(n,k,3)!==row[k]) same=false;
    var next=[1];
    for(var k2=1;k2<=n;k2++) next.push((row[k2-1]+row[k2])%3);
    next.push(1); row=next;
  }
  ok('modP(·,·,3) 가산 DP 전수 대조(행 0..81)', same);
})();

// modP=5 — 가산 DP mod 5 전수 대조(행 0..50)
(function(){
  var same=true, row=[1];
  for(var n=0;n<=50;n++){
    for(var k=0;k<=n;k++) if(P.modP(n,k,5)!==row[k]) same=false;
    var next=[1];
    for(var k2=1;k2<=n;k2++) next.push((row[k2-1]+row[k2])%5);
    next.push(1); row=next;
  }
  ok('modP(·,·,5) 가산 DP 전수 대조(행 0..50)', same);
})();

// modP 비영 밀도: p=3, 행 0..3^m-1 비영 개수 = 6^m (m=3 → 행 27, 216)
(function(){
  var cnt=0;
  for(var n=0;n<27;n++) for(var k=0;k<=n;k++) if(P.modP(n,k,3)!==0) cnt++;
  ok('modP=3 비영 밀도: 행 0..26 비영 = 6^3 = 216', cnt===216);
})();

// parity ↔ modP(2) 정합 전수(행 0..64)
(function(){
  var same=true;
  for(var n=0;n<=64;n++) for(var k=0;k<=n;k++)
    if(P.parity(n,k)!==P.modP(n,k,2)) same=false;
  ok('parity = modP(·,·,2) 전수(행 0..64)', same);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
process.exit(fail?1:0);
