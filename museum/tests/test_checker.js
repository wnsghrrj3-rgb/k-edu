/* test_checker.js — C3 속지 마 눈 E1 순수 모형 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','science','ex03_checker.html'),'utf8');
var m=html.match(/<script id="checker-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
var b=P.make(), N=b.N, A=b.A, B=b.B;

// 판: 5×5 · 체커 패리티 · 반사율 두 값 전수
(function(){
  var good = N===5;
  for(var i=0;i<N;i++)for(var j=0;j<N;j++){
    var r=b.reflect(i,j);
    if(((i+j)%2===0 && r!==b.DARK) || ((i+j)%2===1 && r!==b.LIGHT)) good=false;
  }
  ok('체커 패리티: 반사율 두 값 전수', good);
})();

// A/B 배역: A=빛 속 어두운 칸 · B=그림자 중심 밝은 칸
ok('A = 어두운 칸 · B = 밝은 칸', b.reflect(A.i,A.j)===b.DARK && b.reflect(B.i,B.j)===b.LIGHT);
ok('A는 그림자 밖(g=0 정확) · B는 중심(g=1 정확)',
   b.gAt(A.i+0.5,A.j+0.5)===0 && b.gAt(B.i+0.5,B.j+0.5)===1);

// ★ 서명: 두 칸의 도달 휘도가 같다
(function(){
  var d=Math.abs(b.lum(A.i,A.j)-b.lum(B.i,B.j));
  ok('★ lum(A) = lum(B) (오차 '+d.toExponential(1)+')', d<1e-12);
})();

// D의 해석 유도: D=1−dark/light · 0<D<1
ok('그림자 깊이 D=1−dark/light 유도', Math.abs(b.D-(1-b.DARK/b.LIGHT))<1e-15 && b.D>0 && b.D<1);

// ★ 착시의 기제: B는 그림자 속 이웃보다 밝고, A는 빛 속 이웃보다 어둡다
(function(){
  var good=true;
  [[B.i-1,B.j],[B.i+1,B.j],[B.i,B.j-1],[B.i,B.j+1]].forEach(function(nb){
    if(nb[0]<0||nb[0]>=N||nb[1]<0||nb[1]>=N) return;
    if(b.reflect(nb[0],nb[1])!==b.DARK) good=false;          // 체커: B의 이웃은 전부 어두운 칸
    if(b.lum(nb[0],nb[1]) >= b.lum(B.i,B.j)) good=false;     // 그림자 속에서 B가 국소 최고 밝기
  });
  [[A.i+1,A.j],[A.i,A.j-1],[A.i,A.j+1]].forEach(function(nb){
    if(b.reflect(nb[0],nb[1])!==b.LIGHT) good=false;
    if(b.lum(nb[0],nb[1]) <= b.lum(A.i,A.j)) good=false;     // 빛 속에서 A가 국소 최저 밝기
  });
  ok('★ 착시 기제: 국소 명암 역전(B 국소 최고·A 국소 최저) 전수', good);
})();

// 대비 실재: 이웃과의 휘도비가 속을 만큼 크다
(function(){
  var rB=b.lum(B.i,B.j)/b.lum(B.i-1,B.j);
  var rA=b.lum(A.i+1,A.j)/b.lum(A.i,A.j);
  ok('대비 실재: 이웃 휘도비 > 1.35 (B '+rB.toFixed(2)+' · A '+rA.toFixed(2)+')', rB>1.35 && rA>1.35);
})();

// g 유계 · 컴팩트 지지 · 중심에서 단조 감쇠
(function(){
  var good=true;
  for(var k=0;k<=400;k++){
    var r=k/400*3.0;
    var g=b.gAt(B.i+0.5+r, B.j+0.5);
    if(g<0||g>1) good=false;
    if(r<=b.R0 && g!==1) good=false;
    if(r>=b.R1 && g!==0) good=false;
  }
  var prev=1;
  for(var k2=0;k2<=200;k2++){
    var g2=b.gAt(B.i+0.5+k2/200*2.4, B.j+0.5);
    if(g2>prev+1e-12) good=false;
    prev=g2;
  }
  ok('g: 유계·컴팩트 지지·반경 단조 감쇠 전수', good);
})();

// shade 유계: (1−D, 1]
(function(){
  var good=true, seed=7;
  function R(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  for(var k=0;k<600;k++){
    var s=b.shade(R()*N, R()*N);
    if(!(s>=1-b.D-1e-12 && s<=1+1e-12)) good=false;
  }
  ok('shade ∈ [1−D, 1] 전수', good);
})();

// 전 칸 lum ∈ (0,1)
(function(){
  var good=true;
  for(var i=0;i<N;i++)for(var j=0;j<N;j++){
    var v=b.lum(i,j); if(!(v>0&&v<1)) good=false;
  }
  ok('전 칸 lum ∈ (0,1)', good);
})();

// lumXY = reflect·shade 정합(칸 경계 포함)
(function(){
  var good=true, seed=11;
  function R(){ seed=(seed*16807)%2147483647; return seed/2147483647; }
  for(var k=0;k<400;k++){
    var x=R()*N, y=R()*N;
    var i=Math.min(N-1,Math.floor(x)), j=Math.min(N-1,Math.floor(y));
    if(Math.abs(b.lumXY(x,y)-b.reflect(i,j)*b.shade(x,y))>1e-15) good=false;
  }
  ok('lumXY = reflect·shade 정합 전수', good);
})();

// rgb: 단조·유계·양끝
(function(){
  var good = b.rgb(0)===0 && b.rgb(1)===255;
  var prev=-1;
  for(var k=0;k<=100;k++){
    var c=b.rgb(k/100);
    if(c<prev || c<0 || c>255) good=false;
    prev=c;
  }
  ok('rgb: 감마 단조·유계·양끝 고정', good);
})();

// 눈이 다투는 실물: 렌더 회색값도 정확히 같다
ok('rgb(lum A) = rgb(lum B)', b.rgb(b.lum(A.i,A.j))===b.rgb(b.lum(B.i,B.j)));

// 재현성
(function(){
  var c=P.make(), good=true;
  for(var i=0;i<N;i++)for(var j=0;j<N;j++)
    if(c.lum(i,j)!==b.lum(i,j)) good=false;
  ok('재현성: make() 불변', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ checker-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
