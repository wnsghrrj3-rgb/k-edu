/* test_room.js — S6 무역 없는 방 E1 순수 검증
   물건이 남는 정도 = 그 물건의 자급률. 그대로다.
   이 방에서 절반이라도 남는 물건이 무엇인지가 곧 배반이다. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex06_room.html'),'utf8');
var m=html.match(/<script id="room-pure">([\s\S]*?)<\/script>/);
if(!m){ console.error('E1 블록 없음'); process.exit(1); }
var src=m[1];
var sha=crypto.createHash('sha256').update(src,'utf8').digest('hex').slice(0,16);
var global_=global;
eval(src.replace("typeof window!=='undefined'? window : global", 'global_'));
var R=global_.KMuseumRoom;

var pass=0, fail=0;
function ok(n,c){ if(c) pass++; else { fail++; process.stdout.write('  x '+n+'\n'); } }
function near(a,b,e){ return Math.abs(a-b)<=(e||1e-9); }

// ── 공표 상수 (2024 양곡연도 · 2025 농림축산식품 통계연보) ────────
ok('쌀 96.0%', R.rateOf('rice')===96.0);
ok('콩(두부) 37.4%', R.rateOf('tofu')===37.4);
ok('보리 22.0%', R.rateOf('barley')===22.0);
ok('옥수수 4.3%', R.rateOf('corn')===4.3);
ok('밀(라면·빵) 1.5%', R.rateOf('ramen')===1.5 && R.rateOf('bread')===1.5);
ok('커피·설탕·식용유 0%', R.rateOf('coffee')===0 && R.rateOf('sugar')===0 && R.rateOf('oil')===0);
ok('전기 = 에너지 자급 6% (수입의존도 94%)',
   R.rateOf('lamp')===6.0 && R.PUBLISHED.energyImport===94);
ok('곡물자급률 21.6% · 식량자급률 47.9%',
   R.PUBLISHED.grain===21.6 && R.PUBLISHED.food===47.9);

// ── 남는 정도 = 자급률. 보정 0. ──────────────────────────────────
var exact=true;
R.ITEMS.forEach(function(it){
  if(!near(R.remainOf(it.id), it.rate/100, 1e-12)) exact=false;
  if(!near(R.remainOf(it.id)+R.importedOf(it.id), 1, 1e-12)) exact=false;
});
ok('★남는 정도 = 자급률 그대로 (전수 · 연출 0)', exact);

// ── ★배반은 데이터 안에 이미 있다 ───────────────────────────────
var surv=R.survivors();
ok('★이 방에서 절반이라도 남는 물건은 밥 한 공기 하나뿐이다',
   surv.length===1 && surv[0]==='rice');
var van=R.vanished();
ok('★흔적도 없이 사라지는 것 셋: 식용유·설탕·커피',
   van.length===3 && van.indexOf('oil')>=0 && van.indexOf('sugar')>=0 && van.indexOf('coffee')>=0);
ok('★마지막에 꺼지는 것은 불이다 (전등이 남는 정도 6%)',
   near(R.remainOf('lamp'), 0.06, 1e-12) && R.remainOf('lamp') < 0.5);
ok('★밥을 뺀 모든 물건은 절반도 남지 않는다',
   R.ITEMS.every(function(it){ return it.id==='rice' || it.rate < 50; }));

// ── 손이 집는 넷 = 예측을 심고, 깨뜨린다 ────────────────────────
ok('손의 순서 넷', R.HAND.length===4);
ok('★첫 물건은 밥 — 거의 그대로 남는다(예측 심기)',
   R.HAND[0]==='rice' && R.remainOf('rice')>0.9);
ok('★마지막 손은 커피 — 흔적도 없다(예측 붕괴)',
   R.HAND[3]==='coffee' && R.remainOf('coffee')===0);
var descending=true;
for(var i=1;i<R.HAND.length;i++){
  if(!(R.rateOf(R.HAND[i]) < R.rateOf(R.HAND[i-1]))) descending=false;
}
ok('★손이 집을수록 남는 것이 줄어든다 (밥 96 → 두부 37.4 → 라면 1.5 → 커피 0)', descending);
ok('전등은 손에 잡히지 않는다 (손의 순서에 없다)', R.HAND.indexOf('lamp')<0);

// ── 유계·정합 ────────────────────────────────────────────────────
ok('모든 자급률이 0~100 안에 있다',
   R.ITEMS.every(function(it){ return it.rate>=0 && it.rate<=100; }));
ok('모든 물건이 방 안에 있다',
   R.ITEMS.every(function(it){ return it.x>0 && it.x<1 && it.y>0 && it.y<1; }));
ok('물건 열 개 · 전등 포함', R.ITEMS.length===10 && !!R.byId(R.LAMP));
ok('없는 물건은 0', R.rateOf('nothing')===0 && R.byId('nothing')===null);

process.stdout.write('\nS6 무역 없는 방 — E1: '+pass+'/'+(pass+fail)+' 통과\n');
process.stdout.write('room-pure sha256[16] = '+sha+'\n');
process.exit(fail?1:0);
