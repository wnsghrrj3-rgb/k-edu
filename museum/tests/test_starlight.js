/* test_starlight.js — C4 별빛의 시간 E1 순수 모형 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','science','ex04_starlight.html'),'utf8');
var m=html.match(/<script id="starlight-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
var sky=P.make(2026), ST=sky.STARS, N=ST.length;

// 13별 · 광년 비내림 · 유일
(function(){
  var good=N===13, seen={};
  for(var i=0;i<N;i++){
    if(seen[ST[i].name]) good=false; seen[ST[i].name]=1;
    if(i>0 && ST[i].ly<=ST[i-1].ly) good=false;
    if(!(ST[i].ly>0)) good=false;
  }
  ok('13별 · 광년 비내림 · 유일 전수', good);
})();

// ★ 빛의 여행 항등식: 출발+광년=도착(반올림 0.5 이내) 전수
(function(){
  var good=true;
  for(var i=0;i<N;i++){
    var d=sky.departure(ST[i].ly);
    if(Math.abs((2026-d)-ST[i].ly)>0.5) good=false;
  }
  ok('★ 빛의 여행 항등식: |도착−출발−광년|≤0.5 전수', good);
})();

// 시대 경계: 단조 감소 · 빈틈 0(전 연도 커버)
(function(){
  var good=true;
  for(var e=1;e<sky.ERAS.length;e++) if(sky.ERAS[e].from>=sky.ERAS[e-1].from) good=false;
  for(var y=-500;y<=2026;y++) if(!sky.eraOf(y)) good=false;
  ok('시대 경계 단조 · 전 연도 커버(빈틈 0)', good);
})();

// 경계값 정확 전수
(function(){
  var good = sky.eraOf(1945)==='현대' && sky.eraOf(1944)==='근대'
    && sky.eraOf(1876)==='근대' && sky.eraOf(1875)==='조선'
    && sky.eraOf(1392)==='조선' && sky.eraOf(1391)==='고려'
    && sky.eraOf(918)==='고려' && sky.eraOf(917)==='남북국'
    && sky.eraOf(676)==='남북국' && sky.eraOf(675)==='삼국'
    && sky.eraOf(-57)==='삼국' && sky.eraOf(-58)==='그 이전';
  ok('시대 경계값 전수(현대~그 이전)', good);
})();

// ★ 별→시대 실측 고정: 폴라리스=조선(1593) · 베텔게우스=고려(1386) · 데네브=삼국(526)
(function(){
  function find(nm){ for(var i=0;i<N;i++) if(ST[i].name===nm) return ST[i]; }
  var p=find('폴라리스'), b=find('베텔게우스'), d=find('데네브');
  var good = sky.departure(p.ly)===1593 && sky.eraOf(1593)==='조선'
    && sky.departure(b.ly)===1386 && sky.eraOf(1386)==='고려'
    && sky.departure(d.ly)===526 && sky.eraOf(526)==='삼국';
  ok('★ 실측 고정: 폴라리스→조선 1593 · 베텔게우스→고려 1386 · 데네브→삼국 526', good);
})();

// 시리우스는 현대 — 아이보다 조금 나이 많은 빛
ok('시리우스 → 현대(2017)', sky.departure(8.6)===2017 && sky.eraOf(2017)==='현대');

// 로그축 u: 양끝 고정 · 단조 · 유계 전수
(function(){
  var good = sky.u(0)===0 && Math.abs(sky.u(sky.MAX)-1)<1e-12;
  var prev=-1;
  for(var k=0;k<=600;k++){
    var v=sky.u(sky.MAX*k/600);
    if(v<prev-1e-15 || v<0 || v>1+1e-12) good=false;
    prev=v;
  }
  ok('로그축 u: u(0)=0 · u(MAX)=1 · 단조·유계 전수', good);
})();

// ★ 역함수 왕복 전수
(function(){
  var good=true, worst=0;
  for(var k=0;k<=400;k++){
    var y=sky.MAX*k/400;
    var e=Math.abs(sky.yearsOf(sky.u(y))-y);
    if(e>worst) worst=e;
    if(e>1e-8*Math.max(1,y)) good=false;
  }
  ok('★ u↔yearsOf 왕복 전수(최대 상대오차 이내)', good);
})();

// 역제곱 밝기: 정확비 · 단조 감소 전수
(function(){
  var good=Math.abs(sky.brightnessRel(8.6)-1)<1e-12;
  var r=sky.brightnessRel(25);
  if(Math.abs(r-(8.6*8.6)/(25*25))>1e-15) good=false;
  for(var i=1;i<N;i++)
    if(sky.brightnessRel(ST[i].ly)>=sky.brightnessRel(ST[i-1].ly)) good=false;
  ok('역제곱 밝기: 시리우스=1 · 정확비 · 단조 감소 전수', good);
})();

// 다른 도착 연도에서도 항등식(일반성)
(function(){
  var s2=P.make(2100), good=true;
  for(var i=0;i<N;i++)
    if(Math.abs((2100-s2.departure(ST[i].ly))-ST[i].ly)>0.5) good=false;
  ok('일반성: 도착=2100에서도 항등식 전수', good);
})();

// 재현성
(function(){
  var s3=P.make(2026), good=true;
  for(var i=0;i<N;i++) if(s3.departure(ST[i].ly)!==sky.departure(ST[i].ly)) good=false;
  for(var k=0;k<=50;k++) if(s3.u(k*30)!==sky.u(k*30)) good=false;
  ok('재현성: make() 불변', good);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ starlight-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
