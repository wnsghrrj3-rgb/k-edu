/* test_chladni.js — C2 소리가 그리는 그림 E1 순수 물리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','science','ex02_chladni.html'),'utf8');
var m=html.match(/<script id="chladni-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function rng(seed){ var a=seed|0; return function(){ a|=0; a=a+0x6D2B79F5|0;
  var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
var pl=P.make(), K=pl.count, R=rng(7);

// 모드 12곡 · 주파수 비내림 · m<n · s=±1
(function(){
  var good = K===12;
  for(var k=0;k<K;k++){
    var d=pl.MODES[k];
    if(!(d.m<d.n) || (d.s!==1 && d.s!==-1)) good=false;
    if(pl.freq(k)!==d.m*d.m+d.n*d.n) good=false;
    if(k>0 && pl.freq(k)<pl.freq(k-1)) good=false;
  }
  ok('모드 12곡 · freq=m²+n² · 비내림 · m<n 전수', good);
})();

// 최종 모드 = 최고 주파수(엄격)
(function(){
  var good=true, f=pl.freq(K-1);
  for(var k=0;k<K-1;k++) if(pl.freq(k)>=f) good=false;
  ok('최종 모드 = 단독 최고 주파수', good);
})();

// ★ 자유 경계: 가장자리 법선 미분 0 전수 (판이 자유롭게 우는 물리 근거)
(function(){
  var good=true, worst=0;
  for(var k=0;k<K;k++) for(var j=0;j<=40;j++){
    var t=j/40;
    var e=[ Math.abs(pl.grad(k,0,t).gx), Math.abs(pl.grad(k,1,t).gx),
            Math.abs(pl.grad(k,t,0).gy), Math.abs(pl.grad(k,t,1).gy) ];
    for(var q=0;q<4;q++){ if(e[q]>worst) worst=e[q]; if(e[q]>1e-9) good=false; }
  }
  ok('★ 자유 경계: ∂χ/∂n=0 네 변 전수(최대 '+worst.toExponential(1)+')', good);
})();

// ★ s=−1 대각 마디: χ(t,t)=0 전수 — 첫 무늬(대각 십자)의 순수 증명
(function(){
  var good=true;
  for(var k=0;k<K;k++){
    if(pl.MODES[k].s!==-1) continue;
    for(var j=0;j<=200;j++) if(Math.abs(pl.chi(k,j/200,j/200))>1e-9) good=false;
  }
  ok('★ s=−1 대각 마디: χ(t,t)=0 전수', good);
})();

// 대칭/반대칭: s=+1 → χ(x,y)=χ(y,x) · s=−1 → χ(x,y)=−χ(y,x)
(function(){
  var good=true;
  for(var k=0;k<K;k++) for(var j=0;j<160;j++){
    var x=R(), y=R(), a=pl.chi(k,x,y), b=pl.chi(k,y,x);
    if(Math.abs(a - pl.MODES[k].s*b)>1e-9) good=false;
  }
  ok('대칭/반대칭: χ(x,y)=s·χ(y,x) 전수', good);
})();

// ★ 해석 도함수 ↔ 중앙차분 전수 대조
(function(){
  var good=true, worst=0, h=1e-5;
  for(var k=0;k<K;k++) for(var j=0;j<100;j++){
    var x=0.02+R()*0.96, y=0.02+R()*0.96, g=pl.grad(k,x,y);
    var nx=(pl.chi(k,x+h,y)-pl.chi(k,x-h,y))/(2*h);
    var ny=(pl.chi(k,x,y+h)-pl.chi(k,x,y-h))/(2*h);
    var e=Math.max(Math.abs(g.gx-nx), Math.abs(g.gy-ny));
    if(e>worst) worst=e;
    if(e>1e-5) good=false;
  }
  ok('★ ∇χ 해석식 = 중앙차분 전수 대조(12곡×100점, 최대오차 '+worst.toExponential(1)+')', good);
})();

// 유계: |χ|≤2 전수
(function(){
  var good=true;
  for(var k=0;k<K;k++) for(var j=0;j<400;j++)
    if(pl.amp(k,R(),R())>2+1e-12) good=false;
  ok('유계: |χ|≤2 전수', good);
})();

// 마디 실재: 각 곡의 min|χ| ≈ 0
(function(){
  var good=true;
  for(var k=0;k<K;k++){
    var mn=9;
    for(var i=0;i<=120;i++)for(var j=0;j<=120;j++){
      var a=pl.amp(k,i/120,j/120); if(a<mn) mn=a;
    }
    if(mn>2e-2) good=false;
  }
  ok('마디 실재: 전 곡 min|χ|≈0', good);
})();

// 무늬는 곡선: nodeShare(|χ|<0.1) ∈ (2%, 45%) 전수
(function(){
  var good=true;
  for(var k=0;k<K;k++){
    var sh=pl.nodeShare(k,90,0.1);
    if(!(sh>0.02 && sh<0.45)) good=false;
  }
  ok('무늬=곡선: 마디 비율 유계(2%~45%) 전수', good);
})();

// ★ 모래 한 걸음의 하강성: χ²(step) < χ²(p) 전수 (기울기 있는 곳)
(function(){
  var good=true, h=1e-4;
  for(var k=0;k<K;k++) for(var j=0;j<200;j++){
    var x=R(), y=R(), c=pl.chi(k,x,y), g=pl.grad(k,x,y);
    var mag=Math.abs(c)*Math.sqrt(g.gx*g.gx+g.gy*g.gy);
    if(mag<1e-3) continue;
    var p=pl.settleStep(k,x,y,h);
    var c2=pl.chi(k,p.x,p.y);
    if(c2*c2 >= c*c) good=false;
  }
  ok('★ 하강성: settleStep마다 χ² 감소 전수(모래는 마디로 간다)', good);
})();

// 마디 고정점: χ=0이면 제자리
(function(){
  var good=true;
  for(var j=0;j<=60;j++){                       // s=−1 대각 = 마디
    var t=j/60, p=pl.settleStep(0,t,t,0.01);
    if(Math.abs(p.x-t)>1e-12 || Math.abs(p.y-t)>1e-12) good=false;
  }
  ok('마디 고정점: χ=0 위 모래는 움직이지 않는다', good);
})();

// 곡마다 다른 무늬: 인접 모드 평균 |χ_k−χ_{k+1}| > 0.05
(function(){
  var good=true;
  for(var k=0;k<K-1;k++){
    var s=0, n=0;
    for(var i=0;i<=40;i++)for(var j=0;j<=40;j++){
      s+=Math.abs(pl.chi(k,i/40,j/40)-pl.chi(k+1,i/40,j/40)); n++;
    }
    if(s/n<=0.05) good=false;
  }
  ok('곡마다 다른 무늬: 인접 모드 평균차 > 0.05 전수', good);
})();

// 재현성: make() 두 번 = 같은 장
(function(){
  var q=P.make(), good=q.count===K;
  for(var j=0;j<50;j++){ var x=R(),y=R(),k=(j%K);
    if(Math.abs(q.chi(k,x,y)-pl.chi(k,x,y))>1e-15) good=false; }
  ok('재현성: make() 불변', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ chladni-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
