/* test_village.js — S9 100명의 마을 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex09_village.html'),'utf8');
var m=html.match(/<script id="village-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }

// 마을의 크기: 전 이항 카드 yes ∈ [1,99] (전원·전무 카드 없음) + yes+no=100 전수
(function(){
  var good=true;
  P.STATS.forEach(function(s){
    if(!(s.yes>=1 && s.yes<=99)) good=false;
    var sp=P.split(s.id);
    if(sp.yes+sp.no!==100 || sp.yes!==s.yes) good=false;
  });
  ok('마을의 크기: 이항 카드 yes∈[1,99] · yes+no=100 전수', good);
})();

// ★대륙 분할 정리: 6구획 합 = 정확히 100
(function(){
  var sum=0;
  P.CONTINENTS.forEach(function(c){ sum+=c.yes; });
  ok('★대륙 6분할 합 = 100 정확', sum===100);
})();

// ★목격자 정리: provable 집합 = 정확히 {read, power, net, korean}, 전부 yes측
(function(){
  var expected={read:1,power:1,net:1,korean:1};
  var good=true;
  P.STATS.forEach(function(s){
    var p=P.provable(s.id);
    if(p!==!!expected[s.id]) good=false;
    if(p && P.youSide(s.id)!=='yes') good=false;
    if(!p && P.youSide(s.id)!==null) good=false;
  });
  ok('★목격자 정리: provable = {read,power,net,korean} 정확 · 전부 yes · 나머지 null', good);
})();

// ★백에 하나: korean.yes === 1 · 이항 카드 유일 엄격 최솟값
(function(){
  var k=P.statOf('korean');
  var good=k.yes===1;
  P.STATS.forEach(function(s){
    if(s.id!=='korean' && s.yes<=k.yes) good=false;
  });
  ok('★백에 하나: korean=1 · 유일 엄격 최솟값', good);
})();

// ★안심 정리: korean 제외 provable 셋(read·power·net)은 전부 과반 — "나는 늘 큰 쪽"의 순수 표현
(function(){
  var good=['read','power','net'].every(function(id){ return P.statOf(id).yes>50; });
  ok('★안심 정리: read 87·power 91·net 67 전부 과반', good
     && P.statOf('read').yes===87 && P.statOf('power').yes===91 && P.statOf('net').yes===67);
})();

// membership: 트루 개수 = yes 정확 전수 · 결정론(재호출 동일) 전수 · provable에서 YOU=yes 전수
(function(){
  var good=true;
  P.STATS.forEach(function(s){
    var a=P.membership(s.id), b=P.membership(s.id);
    var cnt=0;
    for(var i=0;i<100;i++){
      if(a[i]) cnt++;
      if(a[i]!==b[i]) good=false;
    }
    if(cnt!==s.yes) good=false;
    if(P.provable(s.id) && a[P.YOU]!==true) good=false;
  });
  ok('membership: 개수 정확·결정론·provable→YOU=yes 전수', good);
})();

// membership 상호 독립성 안전: korean에서 yes는 YOU 하나뿐
(function(){
  var a=P.membership('korean'), only=true;
  for(var i=0;i<100;i++){
    if(i===P.YOU && !a[i]) only=false;
    if(i!==P.YOU && a[i]) only=false;
  }
  ok('korean membership: yes = 오직 YOU 하나', only);
})();

// continentOf: 길이 100 · 구획 크기 정확 · 결정론
(function(){
  var a=P.continentOf(), b=P.continentOf();
  var good=a.length===100;
  var count={};
  for(var i=0;i<100;i++){
    count[a[i]]=(count[a[i]]||0)+1;
    if(a[i]!==b[i]) good=false;
  }
  P.CONTINENTS.forEach(function(c){ if(count[c.id]!==c.yes) good=false; });
  ok('continentOf: 100명 전원 배정 · 구획 크기 정확 · 결정론', good);
})();

// 수치 해금 상수: 세계 82억 · 한국어 8,100만 → 100명 환산 = 1명 (반올림 정합)
(function(){
  // 8,100만 / 82억 × 100 = 0.9878... → 반올림 1
  var exact=Math.round((P.KOREAN_MILLION*1e6) / (P.WORLD_BILLION*1e8) * 100);
  ok('수치 해금 정합: 8,100만/82억 ×100 ≈ 1명(반올림)', exact===1 && P.statOf('korean').yes===exact);
})();

// statOf 미지 id = null · split 미지 id = null
(function(){
  ok('미지 카드 안전: statOf/split(null id) = null', P.statOf('nope')===null && P.split('nope')===null);
})();

console.log('E1: '+pass+'/'+(pass+fail)+' 통과 · village-pure sha256[16] = '+hash);
process.exit(fail?1:0);
