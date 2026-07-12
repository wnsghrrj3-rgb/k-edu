/* run_room_e2.js — S6 무역 없는 방 E2 무대 실부팅 검증
   집다 → 밖에서 온 몫이 걷힌다 → 남는 것은 자급률뿐 → 방이 스스로 → 마지막에 불이 꺼진다.
   ★조작 폭은 화면 px로 단언한다(S8 교훈). */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex06_room.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex06_room.html',
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

var M=win.__S6;
if(!M){ console.error('무대 훅 없음 — 부팅 실패'); process.exit(1); }
var S=M.S, P=M.PURE;

ok('부팅: 방이 섰다', S.phase==='boot');
ok('물건은 아직 아무것도 걷히지 않았다', P.ITEMS.every(function(it){ return S.taken[it.id]===0; }));

// ── ★칠판 — 문제가 무대에 있는가 (M1 교훈: 전제가 증발하면 전시가 죽는다) ──
ok('★칠판에 아홉 자리가 있다 (전등 제외)',
   M.BOARD.length===9 && M.BOARD.every(function(it){ return it.id!=='lamp'; }));
ok('★칠판 자리는 물건마다 하나씩', P.ITEMS.filter(function(it){ return it.id!=='lamp'; })
   .every(function(it){ return M.slotOf(it.id)>=0; }));
ok('★칠판은 아직 비어 있다 (아무도 답하지 않았다)',
   M.BOARD.every(function(it){ return S.written[it.id]===0; }));
ok('★칠판 자리가 겹치지 않는다', (function(){
   for(var i=1;i<M.BOARD.length;i++){ if(!(M.slotX(i) > M.slotX(i-1)+40)) return false; }
   return true;
})());
ok('불은 켜져 있다', S.taken.lamp===0);
ok('초대는 밥 한 공기', M.nextHand()==='rice');

// ── ★조작 폭 — 화면 px로 단언 (S8 교훈) ─────────────────────────
var canvasEl=win.document.getElementById('stage-canvas');
function toClient(lx,ly){
  var sc=Math.min(1366/1600, 768/900);
  return { x: lx*sc + (1366-1600*sc)/2, y: ly*sc + (768-900*sc)/2 };
}
function pdown(lx,ly){
  var c=toClient(lx,ly);
  var e=new win.Event('pointerdown'); e.clientX=c.x; e.clientY=c.y; e.pointerId=1;
  canvasEl.dispatchEvent(e);
}
var rq=M.xyOf(P.byId('rice'));
ok('★물건은 손에 잡힌다', M.hit({x:rq[0], y:rq[1]})==='rice');
ok('★물건 곁도 잡힌다 (히트 반경 확보)', M.hit({x:rq[0]+38, y:rq[1]-28})==='rice');
ok('★빈 방바닥은 잡히지 않는다', M.hit({x:rq[0], y:rq[1]+220})===null);
ok('★전등은 손에 잡히지 않는다 — 방의 몫이다',
   M.hit({x:M.xyOf(P.byId('lamp'))[0], y:M.xyOf(P.byId('lamp'))[1]})===null);

// ── 2막: 예측 심기 → 붕괴 ───────────────────────────────────────
pdown(rq[0], rq[1]); tick(0.05);
ok('★집으면 물건이 들린다', S.lifting==='rice' && S.phase==='hand');
tick(2.0);
ok('★밥은 거의 그대로 남는다 (예측 심기 — "우리 자급 잘하네")',
   M.isDone('rice') && Math.abs(P.remainOf('rice')-0.96)<1e-9);
ok('★집은 물건은 칠판에 적힌다 (노동이 문제 위에 쌓인다)', S.written.rice===1);
ok('★칠판의 밥은 거의 꽉 찬다', P.remainOf('rice')*S.written.rice > 0.9);
ok('밥을 집어도 배반은 오지 않는다', !S.betrayed);

var tq=M.xyOf(P.byId('tofu'));
pdown(tq[0], tq[1]); tick(2.0);
ok('두부는 삼분의 일만 남는다 (첫 의심)', M.isDone('tofu') && Math.abs(P.remainOf('tofu')-0.374)<1e-9);

var nq=M.xyOf(P.byId('ramen'));
pdown(nq[0], nq[1]); tick(2.0);
ok('★라면은 밑동만 남는다 (밀 1.5% — 첫 균열)',
   M.isDone('ramen') && P.remainOf('ramen')<0.02);

var cq=M.xyOf(P.byId('coffee'));
pdown(cq[0], cq[1]); tick(2.2);
ok('★커피는 흔적도 없다 (0%)', M.isDone('coffee') && P.remainOf('coffee')===0);
ok('★칠판의 커피 자리는 텅 빈 채로 남는다', S.written.coffee===1 && P.remainOf('coffee')*S.written.coffee===0);
ok('★칠판이 이미 말하고 있다: 밥만 높고 나머지는 바닥',
   P.remainOf('rice') > 0.9 &&
   ['tofu','ramen','coffee'].every(function(id){ return P.remainOf(id) < 0.4; }));

// ── 3막: 방이 스스로 ────────────────────────────────────────────
ok('★손이 넷을 집으면 방이 스스로 걷어낸다', S.phase==='machine');
ok('마지막 차례는 전등이다', S.autoQueue[S.autoQueue.length-1]==='lamp');

// 기계의 밤 중에는 손이 닿지 않는다
var bq=M.xyOf(P.byId('bread'));
var before=S.taken.bread;
pdown(bq[0], bq[1]); tick(0.05);
ok('기계의 밤 — 손은 무대에 닿지 않는다', S.lifting!=='bread' || before===S.taken.bread);

var guard=0;
while(!S.betrayed && guard++<900) tick(0.05);
ok('★모든 물건이 걷혔다', P.ITEMS.every(function(it){ return S.taken[it.id]>=1; }));
ok('★마지막에 꺼진 것은 불이다', S.taken.lamp>=1);
ok('배반이 일어났다', S.betrayed===true);

// betray는 rAF와 실타이머를 번갈아 탄다 — 기다리는 동안 프레임을 계속 공급한다
var pump=setInterval(function(){ tick(0.2); }, 10);
setTimeout(function(){
  clearInterval(pump);
  tick(4);
  ok('★betray 후 여운 진입(700ms 정지 후 해제)', S.phase==='after' && !win.Museum.isLocked());

  var f=win.document.getElementById('formula');
  ok('★여운: 아홉 중 하나 — 우리 것은 밥 한 공기뿐이었다',
     /아홉 중 하나/.test(f.textContent) && /밥 한 공기뿐이었다/.test(f.textContent));
  ok('★칠판이 답을 다 채웠다 — 아홉 자리 전부 기록됨',
     M.BOARD.every(function(it){ return S.written[it.id]>=1; }));
  ok('★칠판의 답: 절반을 넘긴 자리는 밥 하나뿐',
     M.BOARD.filter(function(it){ return P.remainOf(it.id) >= 0.5; }).length===1);
  ok('★여운 수치 해금: 쌀 96.0 · 밀 1.5 · 곡물자급률 21.6',
     /96\.0/.test(f.textContent) && /1\.5/.test(f.textContent) && /21\.6/.test(f.textContent));
  ok('★여운: 에너지 수입의존도 94%', /94/.test(f.textContent));
  ok('여운: 출처를 밝힌다', /농림축산식품 통계연보/.test(win.document.body.textContent));
  ok('티켓 발급 s6_room', (win.localStorage.getItem('kmuseum.tickets')||'').indexOf('s6_room')>=0);
  ok('재체험 손잡이 노출', win.document.getElementById('reexp').className.indexOf('is-in')>=0);

  // ── 물건 손잡이 ────────────────────────────────────────────────
  M.setPick(0);
  ok('★손잡이: 밥 — 쌀 96.0% · 거의 그대로 남는다',
     /밥/.test(M.chalkOf(0)) && /96\.0%/.test(M.chalkOf(0)) && /거의 그대로/.test(M.chalkOf(0)));
  M.setPick(8);
  ok('★손잡이: 커피 — 0% · 흔적도 없다',
     /커피/.test(M.chalkOf(8)) && /0\.0%/.test(M.chalkOf(8)) && /흔적도 없다/.test(M.chalkOf(8)));
  M.setPick(4);
  ok('★손잡이: 라면 — 밀 1.5%', /라면/.test(M.chalkOf(4)) && /1\.5%/.test(M.chalkOf(4)));
  M.setPick(9);
  ok('★손잡이: 전등 — 에너지 6.0%', /전등/.test(M.chalkOf(9)) && /6\.0%/.test(M.chalkOf(9)));

  var bc=S.betrayed;
  M.setPick(0); tick(0.5); M.setPick(9); tick(0.5);
  ok('여운에서 물건을 짚어도 재배반은 없다', S.betrayed===bc && S.phase==='after');

  // ── ★가림 방어 (준호 실기기: "글씨가 가려진다") ────────────────
  // 여운에는 명판이 좌상단을 차지한다. 칠판이 그 자리에 있으면 문제가 덮인다.
  tick(2.0);
  ok('★여운에서 칠판이 명판을 피해 내려온다', M.boardDY() > 200);
  ok('★내려온 칠판이 화면 밖으로 나가지 않는다', M.BASE + M.boardDY() < 900);
  ok('★칠판이 여운 자막과 겹치지 않는다', M.BASE + M.boardDY() < 900*0.72);
  ok('★관람 중에는 칠판이 제자리(위)에 있다', (function(){
     var keep=S.phase; S.phase='hand';
     var dy=M.boardDY(); S.phase=keep; return dy===0;
  })());

  // ── ★남는 정도 = 자급률. 무대는 E1을 한 자도 고치지 않았다 ────
  ok('★무대의 남은 몫 = E1 자급률 (전수 정합)',
     P.ITEMS.every(function(it){
       var keep = 1 - (1-P.remainOf(it.id))*S.taken[it.id];
       return Math.abs(keep - P.remainOf(it.id)) < 1e-9;
     }));

  win.dispatchEvent(new win.Event('museum:freeze'));
  tick(1);
  var tf=S.time;
  tick(3);
  ok('freeze 존중: 무대 시간 정지', S.time===tf);
  win.dispatchEvent(new win.Event('museum:unfreeze'));

  process.stdout.write('\nS6 무역 없는 방 — E2: '+pass+'/'+(pass+fail)+' 통과\n');
  process.exit(fail?1:0);
}, 1800);
