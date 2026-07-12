/* test_share.js — S4 만 원의 해부 E1 순수 검증
   조각의 크기 = 그 몫의 비율 그대로. 배반은 aT 통계 안에 이미 들어 있다. */
'use strict';
var fs=require('fs'), path=require('path'), crypto=require('crypto');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex04_share.html'),'utf8');
var m=html.match(/<script id="share-pure">([\s\S]*?)<\/script>/);
if(!m){ console.error('E1 블록 없음'); process.exit(1); }
var src=m[1];
var sha=crypto.createHash('sha256').update(src,'utf8').digest('hex').slice(0,16);
var g_=global;
eval(src.replace("typeof window!=='undefined'? window : global", 'g_'));
var P=g_.KMuseumShare;

var pass=0, fail=0;
function ok(n,c){ if(c) pass++; else { fail++; process.stdout.write('  x '+n+'\n'); } }
function near(a,b,e){ return Math.abs(a-b)<=(e||1e-9); }

// ── 공표 상수 (aT 2023년 유통실태 종합) ─────────────────────────
ok('쌀(식량작물) 유통 35.9%', P.costOf('rice')===35.9);
ok('토마토(과채류) 유통 51.0%', P.costOf('tomato')===51.0);
ok('배추(엽근채소) 유통 64.3%', P.costOf('cabbage')===64.3);
ok('양파 유통 72.4%', P.costOf('onion')===72.4);
ok('무(월동무) 유통 78.1%', P.costOf('radish')===78.1);
ok('평균 유통비용률 49.2%', P.AVG_COST===49.2);
ok('손님이 낸 돈 만 원', P.PRICE===10000);

// ── ★단계의 합이 평균과 정확히 맞는다 ───────────────────────────
ok('★출하 9.5 + 도매 14.5 + 가게 25.2 = 평균 유통비용률 49.2 (정확)',
   near(P.STAGE_SUM, P.AVG_COST, 1e-9) && P.STAGES.length===3);

// ── 몫은 나뉘고, 합은 만 원이다 ─────────────────────────────────
var exact=true;
P.GOODS.forEach(function(g){
  if(!near(P.farmOf(g.id) + P.costOf(g.id), 100, 1e-9)) exact=false;
  if(P.farmWon(g.id) + P.costWon(g.id) !== P.PRICE) exact=false;
});
ok('★농부의 몫 + 길에서 갈린 몫 = 만 원 (전수 · 보정 0)', exact);

// ── ★배반은 통계 안에 이미 있다 ─────────────────────────────────
var h=P.halfOrMore();
ok('★만 원의 절반이라도 가져가는 농부는 다섯 중 쌀 하나뿐이다',
   h.length===1 && h[0]==='rice');
ok('★가장 적게 가져가는 것은 무 — 만 원 중 2,190원',
   P.worst()==='radish' && P.farmWon('radish')===2190);
ok('★무를 기른 사람의 몫은 오분의 일 남짓', P.farmOf('radish') < 22.0 && P.farmOf('radish') > 20.0);

// ── 예측 심기: 손이 가를수록 농부의 몫이 줄어든다 ───────────────
var desc=true;
for(var i=1;i<P.GOODS.length;i++){
  if(!(P.farmOf(P.GOODS[i].id) < P.farmOf(P.GOODS[i-1].id))) desc=false;
}
ok('★가를수록 농부의 몫이 줄어든다 (쌀 64.1 → 토마토 49 → 배추 35.7 → 양파 27.6 → 무 21.9)', desc);
ok('★첫 물건은 쌀 — 농부가 절반을 넘게 가져간다(예측 심기)',
   P.GOODS[0].id==='rice' && P.farmOf('rice') > 50);
ok('★마지막은 무 — 예측이 무너진다', P.GOODS[4].id==='radish' && P.farmOf('radish') < 25);

// ── 정확한 돈 ────────────────────────────────────────────────────
ok('쌀 6,410원', P.farmWon('rice')===6410);
ok('토마토 4,900원', P.farmWon('tomato')===4900);
ok('배추 3,570원', P.farmWon('cabbage')===3570);
ok('양파 2,760원', P.farmWon('onion')===2760);

// ── 유계 ─────────────────────────────────────────────────────────
ok('모든 유통비용률이 0~100 안에 있다',
   P.GOODS.every(function(g){ return g.cost>=0 && g.cost<=100; }));
ok('모든 물건이 좌판 위에 있다', P.GOODS.every(function(g){ return g.x>0 && g.x<1; }));
ok('물건 다섯', P.GOODS.length===5);
ok('없는 물건은 0', P.costOf('nothing')===0 && P.byId('nothing')===null);

process.stdout.write('\nS4 만 원의 해부 — E1: '+pass+'/'+(pass+fail)+' 통과\n');
process.stdout.write('share-pure sha256[16] = '+sha+'\n');
process.exit(fail?1:0);
