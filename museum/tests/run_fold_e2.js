/* run_fold_e2.js — S10 한반도를 접는 방 E2 무대 실부팅 검증
   jsdom으로 ex10_fold.html 실행 → 걸음의 노동·주막·열나흘 도착·철길·국토 접힘·
   기계의 밤 이양·betray 700ms·여운 해금·시대 슬라이더·유령 불변·freeze 존중 검사.
   ★S8 교훈: 조작 폭은 모델 단위가 아니라 실제 화면 px로 단언한다. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex10_fold.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex10_fold.html',
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

var M=win.__S10;
if(!M){ console.error('무대 훅이 없다 — 부팅 실패'); process.exit(1); }
var S=M.S, P=M.PURE;

ok('부팅: 무대가 섰다', !!M && !!S && S.phase==='boot');
ok('시작은 접히지 않은 국토 (축척 1)', Math.abs(S.scale-1)<1e-9);
ok('전제 한 줄이 뜬다', /구백육십 리/.test(win.document.getElementById('premise').textContent));
ok('여행자는 서울에서 출발한다', M.uOf()===0);

// ── ★조작 폭 — 화면 px로 단언한다 (S8 교훈) ─────────────────────
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
var t0=M.travelerXY();
ok('★여행자는 손에 잡힌다', M.hitTraveler({x:t0[0], y:t0[1]}));
ok('★여행자 곁도 잡힌다 (히트 반경 확보)', M.hitTraveler({x:t0[0]+24, y:t0[1]-18}));
ok('★빈 바다는 잡히지 않는다', !M.hitTraveler({x:t0[0]+300, y:t0[1]+300}));

pev('pointerdown', t0[0], t0[1]); tick(0.05);
ok('★잡으면 걷기가 시작된다', S.grabbed===true && S.phase==='walk');
ok('★잡는 순간 여행자는 튀지 않는다', M.uOf()===0);

// 하루치 손목 = DAY_PX. 손은 많이 끌지만 여행자는 조금 간다 — 그 어긋남이 막막함이다.
var before=M.travelerXY();
pev('pointermove', t0[0], t0[1]+M.DAY_PX); tick(0.05);
ok('★하루치 손목(180px)에 하루가 간다', S.day===1);
var after=M.travelerXY();
var moved=Math.hypot(after[0]-before[0], after[1]-before[1]);
ok('★손은 180px 끌었는데 여행자는 '+moved.toFixed(0)+'px 갔다 (막막함이 손에 온다)',
   moved>4 && moved<30);
ok('★주막에 불이 하나 켜졌다', S.inns.length===1);

// 되돌아가지 않는다
var toilBefore=S.toil;
pev('pointermove', t0[0], t0[1]+M.DAY_PX-400); tick(0.05);
ok('★걸은 것은 걸은 것 — 위로 끌어도 되돌아가지 않는다', S.toil===toilBefore && S.day===1);
pev('pointerup', 0,0); tick(0.05);
ok('손을 놓으면 걷기가 멈춘다', S.grabbed===false);

// ── 열나흘 ───────────────────────────────────────────────────────
var totalPx=M.DAY_PX*M.DAYS;
ok('★열나흘의 총 노동 = '+totalPx+'px (손목 여러 번 — 지겨움이 재료)', totalPx>=2000 && totalPx<=3600);
M.walkBy(M.DAY_PX*(M.DAYS-1)); tick(0.1);
ok('열나흘째 — 동래에 닿는다', S.day===M.DAYS && S.phase==='arrive');
ok('주막은 열넷', S.inns.length===M.DAYS);
ok('여행자는 부산에 있다', Math.abs(M.uOf()-1)<1e-9);
ok('도착해도 국토는 아직 접히지 않았다', Math.abs(S.scale-1)<1e-9);

// 도착 정적 중 손 무시
var d0=S.day;
pev('pointerdown', M.travelerXY()[0], M.travelerXY()[1]); tick(0.05);
ok('도착의 정적 중에는 손이 닿지 않는다', S.grabbed===false && S.day===d0);

// ── 철길 · 기계의 밤 ─────────────────────────────────────────────
tick(1.3);
ok('철길이 스스로 놓인다 (1905)', S.phase==='rail');
tick(2.2);
ok('기차가 달리고 — 국토가 접히기 시작한다', S.phase==='machine' && S.era===1);
tick(1.6);
ok('★1905: 국토가 정확히 1/24로 접혔다',
   Math.abs(S.scale - P.scaleOf(1))<1e-6 && Math.abs(P.foldOf(1)-24)<1e-12);

// 접히는 동안 손은 닿지 않는다
var sc0=S.scale;
pev('pointerdown', M.SEOUL_XY[0], M.SEOUL_XY[1]+20); tick(0.05);
ok('기계의 밤 — 손은 무대에 닿지 않는다', S.grabbed===false);

// ── 접힘의 연쇄 → 배반 ───────────────────────────────────────────
var guard=0;
while(!S.betrayed && guard++<900) tick(0.05);
ok('★마지막 시대까지 접힌다 (2010)', S.era===P.N-1);
ok('★국토가 174겹으로 접혔다',
   Math.abs(S.scale - P.scaleOf(5))<1e-6 && Math.abs(P.foldOf(5)-173.7931)<1e-3);
ok('배반이 일어났다', S.betrayed===true);
ok('배반 중 무대 잠금(isLocked)', S.phase==='after' || win.Museum.isLocked());

// betray는 rAF와 실타이머를 번갈아 탄다 — 기다리는 동안에도 프레임을 계속 공급한다.
var pump=setInterval(function(){ tick(0.2); }, 10);
setTimeout(function(){
  clearInterval(pump);
  tick(4);
  ok('★betray 후 여운 진입(700ms 정지 후 해제)', S.phase==='after' && !win.Museum.isLocked());

  var f=win.document.getElementById('formula');
  ok('여운 문장: 국토는 한 치도 줄지 않았다', /한 치도 줄지 않았다/.test(f.textContent));
  ok('★여운 수치 해금: 20,160분 → 116분 · 174겹',
     /20,160/.test(f.textContent) && /116/.test(f.textContent) && /174/.test(f.textContent));
  ok('★여운: 하루가 한 시간이 되었다', /하루가 한 시간/.test(f.textContent));
  ok('★여운: 땅은 325km 그대로였다', /325/.test(f.textContent));
  ok('여운: 출처를 밝힌다', /한국경제 60년사/.test(win.document.body.textContent));
  ok('티켓 발급 s10_fold', (win.localStorage.getItem('kmuseum.tickets')||'').indexOf('s10_fold')>=0);
  ok('재체험 손잡이 노출', win.document.getElementById('reexp').className.indexOf('is-in')>=0);

  // ── 시대 손잡이 ────────────────────────────────────────────────
  M.setLatByEra(0); tick(1.2);
  ok('★손잡이: 조선으로 되돌리면 국토가 다시 펴진다', Math.abs(S.scale-1)<1e-3);
  ok('분필: 조선 · 걸어서 · 14일', /조선/.test(M.chalkOf(0)) && /14일/.test(M.chalkOf(0)));
  M.setLatByEra(3); tick(1.2);
  ok('★손잡이: 1985 새마을호 = 4시간 10분 · 축척 E1 정합',
     /1985/.test(M.chalkOf(3)) && /4시간 10분/.test(M.chalkOf(3)) &&
     Math.abs(S.scale-P.scaleOf(3))<1e-3);
  M.setLatByEra(1); tick(1.2);
  ok('★손잡이: 1905 융희호 = 14시간 (국토 1/24)',
     /14시간/.test(M.chalkOf(1)) && Math.abs(S.scale-P.scaleOf(1))<1e-3);
  M.setLatByEra(5); tick(1.2);
  ok('손잡이: 2010 = 1시간 56분', /1시간 56분/.test(M.chalkOf(5)));

  var bc=S.betrayed;
  M.setLatByEra(0); tick(1.2); M.setLatByEra(5); tick(1.2);
  ok('여운에서 시대를 오가도 재배반은 없다', S.betrayed===bc && S.phase==='after');

  // ── ★땅은 줄지 않았다 — 실좌표 무변형 ─────────────────────────
  ok('★서울의 실좌표는 한 번도 손대지 않았다', P.SEOUL[0]===126.9780 && P.SEOUL[1]===37.5665);
  ok('★부산의 실좌표는 한 번도 손대지 않았다', P.BUSAN[0]===129.0756 && P.BUSAN[1]===35.1796);
  ok('★서울–부산의 땅은 여전히 325km', Math.abs(P.havKm(P.SEOUL,P.BUSAN)-325.1)<0.3);

  // ── freeze ─────────────────────────────────────────────────────
  win.dispatchEvent(new win.Event('museum:freeze'));
  tick(1);
  var tf=S.time;
  tick(3);
  ok('freeze 존중: 무대 시간 정지', S.time===tf);
  win.dispatchEvent(new win.Event('museum:unfreeze'));

  process.stdout.write('\nS10 한반도를 접는 방 — E2: '+pass+'/'+(pass+fail)+' 통과\n');
  process.exit(fail? 1:0);
}, 1800);
