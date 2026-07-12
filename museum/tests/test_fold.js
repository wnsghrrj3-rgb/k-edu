/* test_fold.js — S10 한반도를 접는 방 E1 순수 검증
   접힘 = 서울을 고정점으로 한 닮음 변환. 축척은 오직 소요시간의 비.
   땅은 줄지 않는다 — 줄어드는 것은 시간뿐이라는 것이 여기서 증명된다. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex10_fold.html'),'utf8');
var m=html.match(/<script id="fold-pure">([\s\S]*?)<\/script>/);
if(!m){ console.error('E1 블록을 찾지 못했다'); process.exit(1); }
var src=m[1];
var sha=crypto.createHash('sha256').update(src,'utf8').digest('hex').slice(0,16);

var global_=global;
eval(src.replace("typeof window!=='undefined'? window : global", 'global_'));
var F=global_.KMuseumFold;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function near(a,b,e){ return Math.abs(a-b)<=(e||1e-9); }

// ── 실측 상수 ────────────────────────────────────────────────────
ok('시대 여섯', F.N===6);
ok('조선 도보 = 열나흘(20,160분)', F.minutesOf(0)===20160);
ok('1905 융희호 = 14시간(840분)', F.minutesOf(1)===840);
ok('1955 통일호 = 7시간(420분)', F.minutesOf(2)===420);
ok('1985 새마을호 = 4시간 10분(250분)', F.minutesOf(3)===250);
ok('2004 KTX = 2시간 40분(160분)', F.minutesOf(4)===160);
ok('2010 KTX = 1시간 56분(116분)', F.minutesOf(5)===116);

// ── ★하루가 한 시간이 되었다 ─────────────────────────────────────
// 열나흘(14일) → 열네 시간. 날이 시간으로 바뀌었을 뿐 숫자는 그대로다.
ok('★1905: 하루가 한 시간이 되었다 (정확히 24배)', F.foldOf(1)===24);
ok('★열나흘 = 336시간 · 융희호 = 14시간 (같은 열넷)',
   F.minutesOf(0)/60===336 && F.minutesOf(1)/60===14);
ok('★1955: 다시 절반 (정확히 48배)', F.foldOf(2)===48);

// ── 접힘의 단조 ──────────────────────────────────────────────────
var mono=true, monoS=true;
for(var i=1;i<F.N;i++){
  if(!(F.minutesOf(i) < F.minutesOf(i-1))) mono=false;
  if(!(F.scaleOf(i) < F.scaleOf(i-1))) monoS=false;
}
ok('시대는 언제나 짧아진다(전수)', mono);
ok('국토는 언제나 더 접힌다(전수)', monoS);
ok('도보는 접히지 않은 원본 (축척 1)', F.scaleOf(0)===1 && F.foldOf(0)===1);
ok('★총 접힘 = 173.79겹', near(F.foldOf(5), 20160/116, 1e-9) && near(F.foldOf(5), 173.7931, 1e-3));

// ── ★서울은 움직이지 않는다 (고정점 정리) ────────────────────────
var fixed=true;
for(var s=0.001; s<=1.0001; s+=0.0137){
  var a=F.fold(F.SEOUL, s), b=F.proj(F.SEOUL);
  if(!near(a[0],b[0],1e-12) || !near(a[1],b[1],1e-12)) fixed=false;
}
ok('★고정점 정리: 어떤 축척에서도 서울은 제자리(전수)', fixed);

// ── ★닮음 정리: 서울–부산 화면 거리비 = 축척 (정확) ──────────────
function dist(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }
var d0=dist(F.fold(F.SEOUL,1), F.fold(F.BUSAN,1));
var simil=true, worst=0;
for(var k=0;k<F.N;k++){
  var s2=F.scaleOf(k);
  var d=dist(F.fold(F.SEOUL,s2), F.fold(F.BUSAN,s2));
  var err=Math.abs(d/d0 - s2);
  if(err>worst) worst=err;
  if(err>1e-12) simil=false;
}
ok('★닮음 정리: 서울–부산 거리비 = 시간비 (전 시대, 오차 '+worst.toExponential(1)+')', simil);

// ── ★닮음은 모든 점에 대해 성립한다 (국토 전체 전수) ─────────────
var R=F.rings(), allSim=true, wo=0, cnt=0;
[R.south, R.north].forEach(function(rs){
  rs.forEach(function(ring){
    ring.forEach(function(p){
      var s3=0.041667;                                    // 1905
      var a=F.fold(p, s3), o=F.proj(F.SEOUL), q=F.proj(p);
      var ex=[ o[0]+(q[0]-o[0])*s3, o[1]+(q[1]-o[1])*s3 ];
      var e=Math.hypot(a[0]-ex[0], a[1]-ex[1]);
      if(e>wo) wo=e;
      if(e>1e-12) allSim=false;
      cnt++;
    });
  });
});
ok('★국토의 모든 점이 같은 닮음을 따른다 ('+cnt+'점 전수)', allSim && cnt>150);

// ── ★땅은 줄지 않았다 (정직 정리) ────────────────────────────────
// 접힘은 화면 위의 일이다. 실제 좌표는 단 한 번도 손대지 않는다.
var km=F.havKm(F.SEOUL, F.BUSAN);
ok('★서울–부산 대권거리 = 325km (땅은 그대로)', near(km, 325.1, 0.3));
var untouched = (F.SEOUL[0]===126.9780 && F.SEOUL[1]===37.5665 &&
                 F.BUSAN[0]===129.0756 && F.BUSAN[1]===35.1796);
ok('★실좌표 무변형 — 접는 것은 화면이지 땅이 아니다', untouched);

// ── 여행자 ───────────────────────────────────────────────────────
var t0=F.travelerAt(0), t1=F.travelerAt(1);
ok('여행자 u=0 → 서울', near(t0[0],F.SEOUL[0]) && near(t0[1],F.SEOUL[1]));
ok('여행자 u=1 → 부산', near(t1[0],F.BUSAN[0]) && near(t1[1],F.BUSAN[1]));
var tm=true;
for(var u=0; u<=1.0001; u+=0.02){
  var a2=F.travelerAt(u), b2=F.travelerAt(Math.min(1,u+0.02));
  if(!(b2[1] <= a2[1]+1e-12)) tm=false;                  // 남으로만 간다
}
ok('여행자는 남으로만 간다(전수)', tm);
ok('여행자 u 유계 (범위 밖도 안전)',
   F.travelerAt(-3)[1]===F.SEOUL[1] && F.travelerAt(9)[1]===F.BUSAN[1]);

// ── 시간 분해 (여운 전용) ────────────────────────────────────────
var p0=F.partsOf(20160), p5=F.partsOf(116), p3=F.partsOf(250);
ok('분해: 20,160분 = 14일', p0.day===14 && p0.hour===0 && p0.min===0);
ok('분해: 116분 = 1시간 56분', p5.day===0 && p5.hour===1 && p5.min===56);
ok('분해: 250분 = 4시간 10분', p3.day===0 && p3.hour===4 && p3.min===10);

// ── 지형 (Natural Earth · 퍼블릭 도메인) ─────────────────────────
ok('남한 링 · 북한 링 존재', R.south.length>=1 && R.north.length>=1);
var closed=true, lonOK=true, latOK=true;
[R.south,R.north].forEach(function(rs){ rs.forEach(function(r){
  if(r.length<4) closed=false;
  if(r[0][0]!==r[r.length-1][0] || r[0][1]!==r[r.length-1][1]) closed=false;
  r.forEach(function(p){
    if(p[0]<123 || p[0]>132.5) lonOK=false;
    if(p[1]<32.5 || p[1]>43.5) latOK=false;
  });
}); });
ok('모든 링이 닫혀 있다', closed);
ok('윤곽이 한반도 범위 안에 있다', lonOK && latOK);

process.stdout.write('\nS10 한반도를 접는 방 — E1: '+pass+'/'+(pass+fail)+' 통과\n');
process.stdout.write('fold-pure sha256[16] = '+sha+'\n');
process.exit(fail? 1:0);
