/* test_wave.js — C1 진자의 파도 E1 순수 물리 검증 */
'use strict';
var fs=require('fs'), path=require('path');
var html=fs.readFileSync(path.join(__dirname,'..','science','ex01_wave.html'),'utf8');
var m=html.match(/<script id="wave-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
var w=P.make(15,20,30), TAU=Math.PI*2;

// 진동수: 균일 간격 1/Γ
(function(){
  var good=true;
  for(var i=0;i<15;i++) if(Math.abs(w.freqs[i]-(20+i)/30)>1e-15) good=false;
  for(var i=1;i<15;i++) if(Math.abs((w.freqs[i]-w.freqs[i-1])-1/30)>1e-15) good=false;
  ok('진동수 f_i=(N0+i)/Γ · 간격 균일 1/Γ', good);
})();

// ★ 귀환: t=0·Γ·2Γ 전원 위상 복귀
(function(){
  var good=true;
  [0,30,60].forEach(function(t){
    for(var i=0;i<15;i++) if(Math.abs(w.disp(i,t)-1)>1e-9) good=false;
  });
  ok('★ 귀환: disp(i,kΓ)=1 전원(k=0,1,2)', good);
})();

// Γ/2 반위상: 부호 = (−1)^(N0+i)
(function(){
  var good=true;
  for(var i=0;i<15;i++){
    var want=((20+i)%2===0)?1:-1;
    if(Math.abs(w.disp(i,15)-want)>1e-9) good=false;
  }
  ok('Γ/2 지그재그: 부호 (−1)^(N0+i) 전원', good);
})();

// 질서도 경계값
ok('R(0)=1', Math.abs(w.order(0)-1)<1e-12);
ok('R(Γ)=1', Math.abs(w.order(30)-1)<1e-9);
ok('R(Γ/2)=1/N(홀수 N)', Math.abs(w.order(15)-1/15)<1e-9);

// ★ 디리클레 핵 닫힌식 전수 대조 (600 표본)
(function(){
  var good=true, worst=0;
  for(var k=0;k<=600;k++){
    var t=30*k/600;
    var d=Math.abs(w.order(t)-w.dirichlet(t));
    if(d>worst) worst=d;
    if(d>1e-9) good=false;
  }
  ok('★ R(t) = 디리클레 |sin(Nπt/Γ)/(N sin(πt/Γ))| 전수 대조(600표본, 최대오차 '+worst.toExponential(1)+')', good);
})();

// 완전 흩어짐의 좌표: R(kΓ/N)=0 (k=1..N-1)
(function(){
  var good=true;
  for(var k=1;k<15;k++) if(w.order(30*k/15)>1e-9) good=false;
  ok('완전 흩어짐: R(kΓ/N)=0 전수(k=1..14)', good);
})();

// 카오스 실재: 중간 최소 질서도
(function(){
  var mn=1;
  for(var k=1;k<600;k++){ var r=w.order(30*k/600); if(r<mn) mn=r; }
  ok('카오스 실재: min R < 0.01', mn<0.01);
})();

// 길이: 단조 감소 + 주기 왕복 T=2π√(L/g)=Γ/n
(function(){
  var L=w.lengths(9.81), good=true;
  for(var i=1;i<15;i++) if(L[i]>=L[i-1]) good=false;
  for(var i=0;i<15;i++){
    var T=TAU*Math.sqrt(L[i]/9.81);
    if(Math.abs(T-30/(20+i))>1e-12) good=false;
  }
  ok('길이 단조 감소 · 주기 왕복 T=2π√(L/g)=Γ/n 전수', good);
})();

// nextRealign 경계
ok('nextRealign: 0→30 · 0.1→30 · 29.999→30 · 30→60',
   w.nextRealign(0)===30 && w.nextRealign(0.1)===30 && w.nextRealign(29.999)===30 && w.nextRealign(30)===60);

// 초반 물결: 인접 위상차 균일 = 2πt/Γ
(function(){
  var t=2, good=true;
  for(var i=1;i<15;i++){
    var d=TAU*(w.freqs[i]-w.freqs[i-1])*t;
    if(Math.abs(d-TAU*t/30)>1e-12) good=false;
  }
  ok('초반 물결: 인접 위상차 = 2πt/Γ 균일', good);
})();

// 일반성: N=9 · N=30도 Γ에서 귀환
(function(){
  var good=true;
  [9,30].forEach(function(n){
    var v=P.make(n,20,30);
    for(var i=0;i<n;i++) if(Math.abs(v.disp(i,30)-1)>1e-9) good=false;
    if(Math.abs(v.order(30)-1)>1e-9) good=false;
  });
  ok('일반성: N=9·30 모두 Γ 귀환', good);
})();

// 유계: disp ∈ [−1,1]
(function(){
  var good=true;
  for(var k=0;k<400;k++){
    var t=30*k/400;
    for(var i=0;i<15;i++){ var d=w.disp(i,t); if(d<-1-1e-12||d>1+1e-12) good=false; }
  }
  ok('유계: disp∈[−1,1] 전수', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
process.exit(fail?1:0);
