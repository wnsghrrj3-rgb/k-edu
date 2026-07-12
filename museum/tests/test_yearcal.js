/* test_yearcal.js — S2 지구의 1년 E1 순수 원리 검증
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex02_year.html'),'utf8');
var m=html.match(/<script id="year-pure">([\s\S]*?)<\/script>/);
if(!m){ console.log('x pure 블록 없음'); process.exit(1); }
var hash=crypto.createHash('sha256').update(m[1],'utf8').digest('hex').slice(0,16);
var module_={exports:{}};
(new Function('module','exports',m[1]))(module_,module_.exports);
var P=module_.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; console.log('  x '+name); } }
function ev(id){ for(var i=0;i<P.EVENTS.length;i++) if(P.EVENTS[i].id===id) return P.EVENTS[i]; return null; }
function cal(id){ return P.calOf(P.eventSec(ev(id))); }

// 달력 구조: 월별 일수 합=365 · 누적 경계 정확
(function(){
  var sum=P.MONTH_DAYS.reduce(function(a,b){ return a+b; },0);
  ok('달력: 12개월 합 = 365 · SEC_YEAR 정합', sum===365 && P.SEC_YEAR===365*86400 && P.CUM[12]===365);
})();

// calOf↔dayOf 왕복: 365일 전수 + 자정 경계
(function(){
  var good=true;
  for(var mth=1;mth<=12;mth++)
    for(var d=1;d<=P.MONTH_DAYS[mth-1];d++){
      var dayIdx=P.dayOf(mth,d);
      var c=P.calOf(dayIdx*86400);
      if(c.m!==mth || c.d!==d || c.hh!==0 || c.mm!==0 || c.ss!==0) good=false;
      var c2=P.calOf(dayIdx*86400+86399);
      if(c2.m!==mth || c2.d!==d || c2.hh!==23 || c2.mm!==59 || c2.ss!==59) good=false;
    }
  ok('calOf↔dayOf 왕복: 365일 전수(자정·하루 끝 경계 포함)', good);
})();

// 월 경계 12종: 매월 1일 00:00 정확
(function(){
  var good=true;
  for(var mth=1;mth<=12;mth++){
    var c=P.calOf(P.CUM[mth-1]*86400);
    if(c.m!==mth || c.d!==1) good=false;
  }
  ok('월 경계: 12종 전수 정확', good);
})();

// secOf 단조: 과거로 갈수록 앞으로(전수 그리드)
(function(){
  var good=true, prev=-1;
  for(var y=P.AGE; y>=0; y-=P.AGE/2000){
    var s=P.secOf(y);
    if(s<prev) good=false;
    prev=s;
  }
  ok('secOf 단조: 그리드 2001표본 전수', good && P.secOf(P.AGE)===0 && P.secOf(0)===P.SEC_YEAR);
})();

// yearsAgoOf 역환산: 왕복 정합(그리드 전수)
(function(){
  var good=true;
  for(var s=0;s<=P.SEC_YEAR;s+=P.SEC_YEAR/500){
    var s2=P.secOf(P.yearsAgoOf(s));
    if(Math.abs(s2-s)>1) good=false;               // 반올림 1초 이내
  }
  ok('역환산 왕복: sec→년 전→sec 오차 ≤1초 전수', good);
})();

// 사건: 정렬·유효 범위·id 유일
(function(){
  var good=true, seen={};
  var prev=-1;
  P.EVENTS.forEach(function(e){
    var s=P.eventSec(e);
    if(s<prev) good=false; prev=s;
    if(s<0 || s>P.SEC_YEAR) good=false;
    if(seen[e.id]) good=false; seen[e.id]=1;
  });
  ok('사건: 시간 정렬·범위·id 유일 전수', good);
})();

// ★고정 단언: 사피엔스 = 12/31 23:25
(function(){
  var c=cal('sapiens');
  ok('★사피엔스 = 12월 31일 23시 25분', c.m===12 && c.d===31 && c.hh===23 && c.mm===25);
})();

// ★고정 단언: 농경 = 12/31 23:58 · 공룡 멸종 = 12/26 · 캄브리아 = 11월
(function(){
  var f=cal('farm'), de=cal('dinoend'), cb=cal('cambrian');
  ok('★농경 = 12월 31일 23시 58분', f.m===12 && f.d===31 && f.hh===23 && f.mm===58);
  ok('★공룡 멸종 = 12월 26일', de.m===12 && de.d===26);
  ok('★캄브리아 = 11월', cb.m===11);
})();

// ★고정 단언: 한글 = 자정 전 5초 이내 · 문자 = 마지막 60초 안
(function(){
  var hg=P.SEC_YEAR-P.eventSec(ev('hangul'));
  var wr=P.SEC_YEAR-P.eventSec(ev('writing'));
  ok('★한글 = 자정 전 5초 이내(실측 '+hg+'초)', hg>0 && hg<=5);
  ok('★문자 = 마지막 60초 안', wr>0 && wr<=60);
})();

// ★부재 정리 ①: 눈에 보이는 생명(burst)은 전부 11월 이후
(function(){
  var good=true;
  P.EVENTS.filter(function(e){ return e.kind==='burst'; }).forEach(function(e){
    var c=P.calOf(P.eventSec(e));
    if(c.m<11) good=false;
  });
  ok('★부재 정리①: 보이는 생명은 전부 11월 이후 전수', good);
})();

// ★부재 정리 ②: 인간은 전부 12/31 23시 이후
(function(){
  var good=true;
  P.EVENTS.filter(function(e){ return e.kind==='human'||e.kind==='record'; }).forEach(function(e){
    var c=P.calOf(P.eventSec(e));
    if(!(c.m===12 && c.d===31 && c.hh===23)) good=false;
  });
  ok('★부재 정리②: 인간·기록은 전부 12월 31일 23시 이후 전수', good);
})();

// ★부재 정리 ③: 1월~10월은 텅 비어 있다(단순 생명 이하뿐)
(function(){
  var good=true;
  P.EVENTS.forEach(function(e){
    var c=P.calOf(P.eventSec(e));
    if(c.m<=10 && !(e.kind==='cosmos'||e.kind==='life')) good=false;
  });
  ok('★부재 정리③: 10월까지 눈에 보이는 사건 0 전수', good);
})();

// 환산 소문 정합: 하루=1,250만 년 · 1초=145년(여운 문구의 정직성)
(function(){
  var perDay=P.AGE/365, perSec=P.AGE/P.SEC_YEAR;
  ok('환산 정직: 하루≈1,251만 년 · 1초≈145년',
     Math.abs(perDay-12512328.77)<1 && Math.abs(perSec-144.82)<0.01);
})();

console.log('E1: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과'));
console.log('─ year-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
