/* test_water.js — S11 물 한 방울의 여정 E1 순수 검증
   물길 = Natural Earth 원본 무변형. 길이는 물길에서 재지 않는다(정직 정리).
   그리고 여정의 끝이 출발점이라는 것 — 고리가 닫힌다는 것이 여기서 증명된다. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex11_water.html'),'utf8');
var m=html.match(/<script id="water-pure">([\s\S]*?)<\/script>/);
if(!m){ console.error('E1 블록을 찾지 못했다'); process.exit(1); }
var src=m[1];
var sha=crypto.createHash('sha256').update(src,'utf8').digest('hex').slice(0,16);

var global_=global;
eval(src.replace("typeof window!=='undefined'? window : global", 'global_'));
var P=global_.KMuseumWater;

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function near(a,b,e){ return Math.abs(a-b)<=(e||1e-9); }

// ── 물길 — 원본 무변형 ────────────────────────────────────────────
ok('물길 174점', P.PATH.length===174);
ok('발원측 끝점 = 원본 그대로', P.PATH[0][0]===128.8789 && P.PATH[0][1]===37.4051);
ok('서울측 끝점 = 원본 그대로', P.PATH[173][0]===126.7555 && P.PATH[173][1]===37.6379);
ok('물길은 동에서 서로 간다(발원이 상류)', P.PATH[0][0] > P.PATH[173][0]);

// 물길이 한반도 중부를 벗어나지 않는다 — 연출용 좌표가 섞이지 않았다는 증거
var inBox=true;
for(var i=0;i<P.PATH.length;i++){
  var p=P.PATH[i];
  if(!(126.7<=p[0] && p[0]<=129.0 && 36.9<=p[1] && p[1]<=37.7)) inBox=false;
}
ok('전 좌표가 한강 유역 안에 있다(전수)', inBox);

// ── ★정직 정리 — 길이는 물길에서 재지 않는다 ──────────────────────
ok('폴리라인 길이 ≈ 324.7km(단순화판)', Math.abs(P.POLY_KM-324.7) < 1.0);
ok('★실측 한강 길이는 514.4km — 폴리라인과 다르다', P.FACT.RIVER_KM===514.4 && Math.abs(P.FACT.RIVER_KM-P.POLY_KM) > 150);
ok('★표시 거리는 실측 상수에서만 나온다(발원=0)', P.kmFromSpring(0)===0);
ok('★표시 거리는 실측 상수에서만 나온다(끝=514.4)', near(P.kmFromSpring(1), 514.4, 1e-9));
ok('★표시 거리에 폴리라인 길이가 새어들지 않는다', !near(P.kmFromSpring(1), P.POLY_KM, 1));

// ── 실측 상수 ────────────────────────────────────────────────────
ok('발원 = 검룡소', P.FACT.SPRING==='검룡소');
ok('검룡소 하루 2,000톤', P.FACT.SPRING_TONS===2000);
ok('검룡소 사철 9℃', P.FACT.SPRING_TEMP===9);
ok('금대봉 1,418m', P.FACT.PEAK_M===1418);
ok('취수 구간 25km', P.FACT.INTAKE_KM===25);
ok('취수장 다섯 · 정수센터 여섯', P.FACT.INTAKES===5 && P.FACT.PLANTS===6);
ok('서울 수돗물의 시작 = 1908 뚝도', P.FACT.FIRST_YEAR===1908);

// ── at(s) — 물길 위의 점 ──────────────────────────────────────────
ok('★at(0) = 물길의 첫 점(발원은 물길이 시작하는 곳)',
   P.at(0)[0]===P.PATH[0][0] && P.at(0)[1]===P.PATH[0][1]);
ok('at(1) = 물길의 끝 점', near(P.at(1)[0], P.PATH[173][0], 1e-9) && near(P.at(1)[1], P.PATH[173][1], 1e-9));
var mono=true, prevLon=P.at(0)[0], off=0;
for(var s=0.01;s<=1.0001;s+=0.01){
  var q=P.at(s);
  if(P.distTo(q) > 0.6) off++;                     // at(s)는 언제나 물길 위(보간 오차만)
  prevLon=q[0];
}
ok('★at(s)는 언제나 물길 위에 있다(전수 100표본)', off===0);
var bounded=true;
for(var s2=0;s2<=1.0001;s2+=0.005){
  var q2=P.at(s2);
  if(!(126.7<=q2[0]&&q2[0]<=129.0&&36.9<=q2[1]&&q2[1]<=37.7)) bounded=false;
}
ok('at(s) 유계(전수 200표본)', bounded);
ok('at(s) 구간 밖 입력은 물린다', P.at(-5)[0]===P.PATH[0][0] && near(P.at(9)[0], P.PATH[173][0], 1e-9));

// ── 이정표 ───────────────────────────────────────────────────────
ok('이정표 열 개', P.MARKS.length===10);
ok('첫 이정표 = 발원(s=0)', P.MARKS[0].id==='spring' && P.MARKS[0].s===0);
var msMono=true;
for(var i=1;i<P.MARKS.length;i++) if(!(P.MARKS[i].s > P.MARKS[i-1].s)) msMono=false;
ok('★이정표 s 단조 증가(상류→하류, 전수)', msMono);
var onRiver=true, worst=0;
for(var i=0;i<P.MARKS.length;i++){
  var d=P.distTo(P.at(P.MARKS[i].s));
  if(d>worst) worst=d;
  if(d>0.6) onRiver=false;
}
ok('★이정표는 전부 물길 위에 있다(전수, 최악 '+worst.toFixed(2)+'km)', onRiver);
ok('두물머리에서 북한강이 합쳐진다', P.MARKS[5].name==='두물머리' && P.MARKS[5].note.indexOf('북한강')>=0);
ok('뚝도정수센터가 가장 하류의 이정표', P.MARKS[9].id==='ttukdo' && P.MARKS[9].s===Math.max.apply(null,P.MARKS.map(function(x){return x.s;})));

// ── ★고리 정리 — 여정의 끝이 출발점이다 ──────────────────────────
var C=P.CYCLE;
ok('★고리가 닫힌다(마지막 = 첫 노드)', C[0]==='수도꼭지' && C[C.length-1]==='수도꼭지');
ok('★고리에 발원이 있고, 발원이 끝이 아니다',
   C.indexOf('검룡소')>0 && C.indexOf('검룡소') < C.length-1);
ok('★발원 뒤에 하늘이 있다(땅속→비→구름)',
   C.indexOf('비') > C.indexOf('검룡소') && C.indexOf('구름') > C.indexOf('비'));
ok('★하늘 뒤에 바다가 있다', C.indexOf('바다') > C.indexOf('구름') && C.indexOf('서해') > C.indexOf('바다'));
ok('★바다로 흘러든 것은 이 강이 실어 나른 물이다(하구→서울→하수구)',
   C.indexOf('한강 하구') > C.indexOf('서해') &&
   C.indexOf('서울') > C.indexOf('한강 하구') &&
   C.indexOf('하수구') > C.indexOf('서울'));
var uniq={}, dupTapOnly=true;
for(var i=0;i<C.length;i++){ if(uniq[C[i]] && C[i]!=='수도꼭지') dupTapOnly=false; uniq[C[i]]=1; }
ok('★고리에서 두 번 나오는 것은 수도꼭지뿐(끝이 곧 시작)', dupTapOnly);
ok('고리 스무 마디', C.length===20);

// ── 되짚다 — s는 줄기만 하고 발원에서 멈춘다 ──────────────────────
ok('되짚으면 s가 준다', P.retrace(0.9, 0.1) === 0.8);
ok('★되짚기는 방향이 없다 — 어느 부호를 줘도 거슬러 오른다', P.retrace(0.9,-0.1)===0.8);
ok('★발원에서 멈춘다(음수로 새지 않는다)', P.retrace(0.05, 0.9)===0);
var rs=0.8972, steps=0;
while(rs>0 && steps<10000){ rs=P.retrace(rs, 0.001); steps++; }
ok('★되짚기는 반드시 발원에 닿는다(전수 반복)', rs===0 && steps<1000);

// ── 되짚어 지나온 이정표 ────────────────────────────────────────
ok('출발(뚝도)에서는 뚝도 하나만 지났다', P.passed(0.8972).length===1);
ok('팔당까지 되짚으면 넷', P.passed(0.8184).length===4);
ok('발원까지 되짚으면 열 전부', P.passed(0).length===10);
var order=P.passed(0).map(function(x){return x.id;});
ok('★지나온 순서는 하류에서 상류다', order[0]==='ttukdo' && order[order.length-1]==='spring');

// ── 물길 짚기(여운 손잡이) ──────────────────────────────────────
ok('발원을 짚으면 검룡소', P.nameAt(0).name==='검룡소');
ok('0.8184를 짚으면 팔당댐', P.nameAt(0.8184).name==='팔당댐');
ok('0.79를 짚으면 두물머리', P.nameAt(0.79).name==='두물머리');
ok('짚은 곳의 거리 = 실측 환산(0.5 → 257.2km)', near(P.kmFromSpring(0.5), 257.2, 1e-9));

// ── sNear — 되짚는 손이 물길에 붙는다 ───────────────────────────
var snapOK=true;
for(var s3=0.05;s3<=0.95;s3+=0.05){
  var q3=P.at(s3);
  var back=P.sNear(q3);
  if(Math.abs(back-s3) > 0.02) snapOK=false;        // 물길 위 점은 제 s로 돌아온다
}
ok('★물길 위의 점은 제 자리로 붙는다(왕복, 전수 19표본)', snapOK);
var offRiver = P.sNear([127.9, 37.05]);              // 물길에서 떨어진 손
ok('물길 밖의 손도 물길 위 한 점으로 붙는다', offRiver>=0 && offRiver<=1);

// ── 거리 ─────────────────────────────────────────────────────────
ok('haversine 자기 자신 = 0', P.haversine([127,37],[127,37])===0);
ok('haversine 대칭', near(P.haversine([127,37],[128,37.5]), P.haversine([128,37.5],[127,37]), 1e-9));

console.log('─ E1 순수 로직: '+pass+' pass / '+fail+' fail');
console.log('─ water-pure sha256[16] = '+sha+'  (동결 기준)');
process.exit(fail?1:0);
