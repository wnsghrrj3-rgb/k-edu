/* run_room_e2.js — S6 만 원의 해부 E2 무대 실부팅 검증
   집다 → 밖에서 온 몫이 걷힌다 → 남는 것은 자급률뿐 → 방이 스스로 → 마지막에 불이 꺼진다.
   ★조작 폭은 화면 px로 단언한다(S8 교훈). */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex04_share.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={ globalAlpha:1, textAlign:'left', font:'', lineWidth:1, fillStyle:'', strokeStyle:'' };
  ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
   'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
   'fillText','drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse',
   'setLineDash'].forEach(function(m){ c[m]=function(){}; });
  c.measureText=function(){ return {width:12}; };
  c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
  c.canvas={width:1366,height:768};
  return c;
}
var pass=0, fail=0, rafQueue=[], vclock=1000;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function nowFn(){ vclock+=16; return vclock; }

var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex04_share.html',
  beforeParse:function(win){
    win.HTMLCanvasElement.prototype.getContext=function(){ return ctxStub(); };
    win.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:1366,height:768}; };
    Object.defineProperty(win,'devicePixelRatio',{value:1});
    win.matchMedia=function(){ return {matches:false, addEventListener:function(){}, addListener:function(){}}; };
    win.requestAnimationFrame=function(fn){ rafQueue.push(fn); return rafQueue.length; };
    win.cancelAnimationFrame=function(){};
    if(!win.performance) win.performance={};
    win.performance.now=nowFn;
    function nodeStub(){ return { connect:function(){}, disconnect:function(){}, start:function(){}, stop:function(){},
      frequency:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
      gain:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
      type:'sine', buffer:null, loop:false, Q:{value:0}, detune:{value:0} }; }
    win.AudioContext=function(){ return {
      currentTime:0, destination:{}, sampleRate:44100, state:'running', resume:function(){},
      createOscillator:nodeStub, createGain:nodeStub, createBiquadFilter:nodeStub,
      createBufferSource:nodeStub, createBuffer:function(){ return { getChannelData:function(){ return new Float32Array(8); } }; },
      createDynamicsCompressor:nodeStub, createStereoPanner:nodeStub, createConvolver:nodeStub
    }; };
    win.localStorage.clear();
  }
});
var win=dom.window;
function tick(sec){
  var steps=Math.max(1, Math.round(sec/0.016));
  for(var i=0;i<steps;i++){
    var q=rafQueue.slice(); rafQueue.length=0;
    q.forEach(function(fn){ try{ fn(vclock); }catch(e){} });
    nowFn();
  }
}

tick(1.2);
var M=win.__S4;
if(!M){ console.error('무대 훅 없음 — 부팅 실패'); process.exit(1); }
var S=M.S, P=M.PURE;

ok('부팅: 좌판이 섰다', S.phase==='boot');
ok('아무것도 아직 갈라지지 않았다', P.GOODS.every(function(g){ return S.split[g.id]===0; }));

// ── ★칠판 — 문제가 무대에 있는가 (M1 교훈) ──────────────────────
ok('★칠판에 다섯 자리가 있다', P.GOODS.length===5 &&
   P.GOODS.every(function(g){ return M.slotOf(g.id)>=0; }));
ok('★칠판은 아직 비어 있다', P.GOODS.every(function(g){ return S.split[g.id]===0; }));
ok('★칠판 자리가 겹치지 않는다', (function(){
   for(var i=1;i<P.GOODS.length;i++){ if(!(M.slotX(i) > M.slotX(i-1)+60)) return false; }
   return true;
})());
ok('★관람 중에는 칠판이 제자리(위)에 있다', M.boardDY()===0);
ok('★초대는 쌀', M.nextHand()==='rice');

// ── ★조작 폭 — 화면 px로 단언 (S8 교훈) ────────────────────────
var canvasEl=win.document.getElementById('stage-canvas');
function toClient(lx,ly){
  var sc=Math.min(1366/1600, 768/900);
  return { x: lx*sc + (1366-1600*sc)/2, y: ly*sc + (768-900*sc)/2 };
}
function pev(type, lx, ly){
  var c=toClient(lx,ly);
  var e=new win.Event(type); e.clientX=c.x; e.clientY=c.y; e.pointerId=1;
  (type==='pointerup'? win : canvasEl).dispatchEvent(e);
}
var rq=M.xyOf(P.byId('rice'));
ok('★물건은 손에 잡힌다', M.hit({x:rq[0], y:rq[1]})==='rice');
ok('★물건 곁도 잡힌다 (히트 반경 확보)', M.hit({x:rq[0]+42, y:rq[1]-32})==='rice');
ok('★빈 좌판은 잡히지 않는다', M.hit({x:rq[0], y:rq[1]+300})===null);

// ── 2막: 가르다 — 예측 심기 → 붕괴 ──────────────────────────────
pev('pointerdown', rq[0], rq[1]); tick(0.05);
ok('★잡으면 가르기가 시작된다', S.cutting==='rice' && S.phase==='hand');
ok('★잡는 순간 아직 갈라지지 않는다', S.split.rice===0);
pev('pointermove', rq[0], rq[1]+110); tick(0.05);
ok('★반쯤 당기면 반쯤 갈라진다 (손이 간 만큼)', S.split.rice>0.4 && S.split.rice<0.6);
pev('pointermove', rq[0], rq[1]+230); tick(0.05);
ok('★끝까지 당기면 갈라진다 (220px)', M.isDone('rice'));
ok('★쌀 — 농부가 절반을 넘게 가져간다 (예측 심기)', P.farmOf('rice')>50);
ok('★칠판에 쌀의 몫이 적혔다 (절반 눈금 위)', P.farmOf('rice')/100 > 0.5);
ok('쌀을 갈라도 배반은 오지 않는다', !S.betrayed);

// 끝까지 당기지 않으면 도로 붙는다
var tq=M.xyOf(P.byId('tomato'));
pev('pointerdown', tq[0], tq[1]); tick(0.05);
pev('pointermove', tq[0], tq[1]+80); tick(0.05);
ok('덜 갈랐을 때는 아직 갈라지지 않았다', S.split.tomato>0 && S.split.tomato<1);
pev('pointerup', 0, 0); tick(0.05);
ok('★끝까지 가르지 않으면 도로 붙는다', S.split.tomato===0 && !M.isDone('tomato'));

pev('pointerdown', tq[0], tq[1]); tick(0.05);
pev('pointermove', tq[0], tq[1]+240); tick(0.05);
ok('토마토 — 농부의 몫이 절반 아래로 내려간다 (첫 균열)',
   M.isDone('tomato') && P.farmOf('tomato')<50);

var cq=M.xyOf(P.byId('cabbage'));
pev('pointerdown', cq[0], cq[1]); tick(0.05);
pev('pointermove', cq[0], cq[1]+240); tick(0.05);
ok('배추 — 삼분의 일', M.isDone('cabbage') && Math.abs(P.farmOf('cabbage')-35.7)<1e-9);

// ── 3막: 좌판이 스스로 ──────────────────────────────────────────
ok('★손이 셋을 가르면 좌판이 스스로 가른다', S.phase==='machine');
var oq=M.xyOf(P.byId('onion'));
pev('pointerdown', oq[0], oq[1]); tick(0.05);
ok('기계의 밤 — 손은 무대에 닿지 않는다', S.phase==='machine');

var guard=0;
while(!S.betrayed && guard++<900) tick(0.05);
ok('★다섯이 모두 갈라졌다', P.GOODS.every(function(g){ return S.split[g.id]>=1; }));
ok('배반이 일어났다', S.betrayed===true);

var pump=setInterval(function(){ tick(0.2); }, 10);
setTimeout(function(){
  clearInterval(pump);
  tick(4);
  ok('★betray 후 여운 진입', S.phase==='after' && !win.Museum.isLocked());

  var f=win.document.getElementById('formula');
  ok('★여운: 무를 기른 사람에게는 2,190원이 갔다',
     /2,190원이 갔다/.test(f.textContent));
  ok('★여운 수치 해금: 쌀 6,410 · 무 2,190',
     /6,410/.test(f.textContent) && /2,190/.test(f.textContent));
  ok('★여운: 절반이라도 가져가는 농부는 쌀 하나뿐',
     /쌀 하나뿐이었다/.test(f.textContent));
  ok('★여운: 유통 단계 분해 (출하 9.5 · 도매 14.5 · 가게 25.2)',
     /9\.5/.test(f.textContent) && /14\.5/.test(f.textContent) && /25\.2/.test(f.textContent));
  ok('여운: 출처를 밝힌다 (aT)', /aT/.test(win.document.body.textContent));
  ok('티켓 발급 s4_share', (win.localStorage.getItem('kmuseum.tickets')||'').indexOf('s4_share')>=0);
  ok('재체험 손잡이 노출', win.document.getElementById('reexp').className.indexOf('is-in')>=0);

  // ── ★가림 방어 (S6 교훈) ──────────────────────────────────────
  tick(2.0);
  ok('★여운에서 칠판이 명판을 피해 내려온다', M.boardDY() > 200);
  ok('★내려온 칠판이 화면 밖으로 나가지 않는다', M.BASE + M.boardDY() < 900);
  ok('★칠판이 여운 자막과 겹치지 않는다', M.BASE + M.boardDY() < 900*0.72);

  // ── 물건 손잡이 ───────────────────────────────────────────────
  M.setPick(0);
  ok('★손잡이: 쌀 — 6,410원', /쌀/.test(M.chalkOf(0)) && /6,410원/.test(M.chalkOf(0)));
  M.setPick(4);
  ok('★손잡이: 무 — 2,190원 · 유통 78.1%',
     /무/.test(M.chalkOf(4)) && /2,190원/.test(M.chalkOf(4)) && /78\.1%/.test(M.chalkOf(4)));
  M.setPick(3);
  ok('★손잡이: 양파 — 2,760원', /양파/.test(M.chalkOf(3)) && /2,760원/.test(M.chalkOf(3)));

  var bc=S.betrayed;
  M.setPick(0); tick(0.5); M.setPick(4); tick(0.5);
  ok('여운에서 물건을 짚어도 재배반은 없다', S.betrayed===bc && S.phase==='after');

  // ── ★조각의 크기 = 몫의 비율. 무대는 E1을 한 자도 고치지 않았다 ──
  ok('★무대의 농부 몫 = E1 비율 (전수 정합)',
     P.GOODS.every(function(g){
       return Math.abs(P.farmOf(g.id) + P.costOf(g.id) - 100) < 1e-9;
     }));

  win.dispatchEvent(new win.Event('museum:freeze'));
  tick(1);
  var tf=S.time;
  tick(3);
  ok('freeze 존중: 무대 시간 정지', S.time===tf);
  win.dispatchEvent(new win.Event('museum:unfreeze'));

  process.stdout.write('\nS4 만 원의 해부 — E2: '+pass+'/'+(pass+fail)+' 통과\n');
  process.exit(fail?1:0);
}, 1800);
