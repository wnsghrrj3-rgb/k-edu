/* run_water_e2.js — S11 물 한 방울의 여정 E2 무대 검증(jsdom 실부팅)
   되짚는 손 → 이정표 점등 → 이양 → 발원 → 하늘 → 바다 → 고리 폐합 → 배반.
   ★부팅 검사는 "화면에 그려졌는가"를 단언한다(§8.6 교훈 — 훅만 찌르면 실렌더 정지를 못 잡는다). */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
var html=fs.readFileSync(path.join(__dirname,'..','social','ex11_water.html'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

var drawn=[], rafQueue=[], vclock=1000;
function nowFn(){ vclock+=16; return vclock; }
function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={ globalAlpha:1, textAlign:'left', font:'', lineWidth:1, fillStyle:'', strokeStyle:'', globalCompositeOperation:'source-over', filter:'none', lineCap:'butt', lineJoin:'miter', shadowBlur:0, shadowColor:'' };
  ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
   'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
   'drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse','setLineDash',
   'createPattern','putImageData','transform','resetTransform'].forEach(function(m){ c[m]=function(){}; });
  c.fillText=function(t){ drawn.push(String(t)); };
  c.strokeText=function(t){ drawn.push(String(t)); };
  c.measureText=function(t){ return {width:String(t).length*11}; };
  c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
  c.getImageData=function(){ return { data:new Uint8ClampedArray(4) }; };
  c.canvas={width:1366,height:768};
  return c;
}
var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true,
  url:'https://keduclass.com/museum/social/ex11_water.html',
  beforeParse:function(win){
    win.HTMLCanvasElement.prototype.getContext=function(){ return ctxStub(); };
    win.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:1366,height:768}; };
    win.HTMLCanvasElement.prototype.setPointerCapture=function(){};
    win.HTMLCanvasElement.prototype.releasePointerCapture=function(){};
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
    q.forEach(function(fn){ try{ fn(vclock); }catch(e){ console.error(e); } });
    nowFn();
  }
}
function hand(type,x,y){
  var ev;
  try{ ev=new win.PointerEvent(type,{pointerId:1,clientX:x,clientY:y,bubbles:true,cancelable:true}); }
  catch(_){
    ev=win.document.createEvent('Event'); ev.initEvent(type,true,true);
    try{ Object.defineProperty(ev,'pointerId',{value:1}); Object.defineProperty(ev,'clientX',{value:x}); Object.defineProperty(ev,'clientY',{value:y}); }
    catch(__){ ev.pointerId=1; ev.clientX=x; ev.clientY=y; }
  }
  (type==='pointerup'? win : H.canvas).dispatchEvent(ev);
}
/* 논리좌표(1600×900) → 화면 클라이언트 좌표. stage.toLogical의 역 */
function toClient(lx,ly){
  var scale=Math.min(1366/1600, 768/900);
  var ox=(1366-1600*scale)/2, oy=(768-900*scale)/2;
  return [ lx*scale+ox, ly*scale+oy ];
}
function grabDrop(){ var d=H.dropXY(); return toClient(d[0],d[1]); }
/* 논리좌표에서 물길 위 s 지점으로 손을 옮긴다 */
function moveToS(s){ var p=H.toXY(H.PURE.at(s)); var c=toClient(p[0],p[1]); hand('pointermove',c[0],c[1]); }

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function near(a,b,e){ return Math.abs(a-b)<=(e||1e-6); }

tick(1.0);
var H=win.__WATER;
ok('부팅 — 훅이 있다', !!H);
if(!H){ console.log('\nE2: '+pass+'/'+(pass+fail)); process.exit(1); }
var P=H.PURE, S=H.S;

// ── 1막 ─────────────────────────────────────────────────────────
ok('★부팅이 실제로 그려진다(정지 화면이 아니다)', drawn.length>0);
ok('★문제가 무대에 상주한다', drawn.indexOf('이 물은 — 어디서 왔을까요?')>=0);
ok('물길이 그려진다(이정표 이름은 아직 없다)', drawn.indexOf('검룡소')<0);
ok('시작 지점 = 뚝도정수센터', near(S.s, H.START_S, 1e-9));
ok('시작 지점의 이름이 실제로 뚝도정수센터다', P.nameAt(S.s).id==='ttukdo');
ok('1막에서는 아직 아무 이정표도 켜지지 않았다', S.litOrder.length===0);
ok('막 = boot', S.phase==='boot');

// ── 2막 되짚다 ───────────────────────────────────────────────────
var far=toClient(200,200);
hand('pointerdown', far[0], far[1]);
tick(0.05);
ok('★방울에서 먼 손은 잡히지 않는다', S.dragging===false && S.phase==='boot');

var g=grabDrop();
hand('pointerdown', g[0], g[1]);
tick(0.05);
ok('방울을 잡으면 손이 붙는다', S.dragging===true);
ok('잡으면 2막이 열린다', S.phase==='hand');
var s0=S.s;
hand('pointermove', g[0], g[1]);
tick(0.05);
ok('★잡는 순간 방울은 움직이지 않는다(오프셋 보존)', near(S.s, s0, 1e-6));

moveToS(0.8184);                       // 팔당댐까지 되짚는다
tick(0.05);
ok('★되짚으면 s가 준다(거슬러 오른다)', S.s < s0);
ok('★되짚은 자리가 E1과 정합(팔당댐)', Math.abs(S.s-0.8184) < 0.02);
ok('지나온 이정표가 켜진다(뚝도·암사·강북·팔당 넷)', S.litOrder.length===4);
ok('★점등이 E1.passed와 정합', S.litOrder.length===P.passed(S.s).length);
ok('이정표 이름이 화면에 그려진다', drawn.indexOf('팔당댐')>=0 && drawn.indexOf('뚝도정수센터')>=0);

// 하류로는 돌아가지 않는다 — 되짚기는 방향이 하나다
var sBefore=S.s;
moveToS(0.95);
tick(0.05);
ok('★물길을 거슬러만 오른다(하류로 되돌아가지 않는다)', near(S.s, sBefore, 1e-9));

// ── 3막 이양 ────────────────────────────────────────────────────
moveToS(0.66);                          // 여주 — 다섯째 이정표
tick(0.1);
ok('★이정표 다섯을 손으로 지나면 물길이 스스로 당긴다', S.phase==='auto');
ok('이양되면 손이 풀린다', S.dragging===false);
var sAuto=S.s;
var g2=grabDrop();
hand('pointerdown', g2[0], g2[1]); moveToS(0.9);
tick(0.05);
ok('★이양 중에는 손이 무시된다', S.dragging===false && S.s <= sAuto + 1e-9);

// ── 4막 발원 → 하늘 → 바다 → 고리 ────────────────────────────────
tick(9.0);
ok('★되짚기는 반드시 발원에 닿는다', near(S.s, 0, 1e-9));
ok('발원의 이름은 검룡소다', P.nameAt(S.s).name==='검룡소');
ok('열 이정표가 전부 켜졌다', S.litOrder.length===10);
ok('마지막에 켜진 것이 발원이다', S.litOrder[S.litOrder.length-1]==='spring');

tick(1.2);
ok('★발원에서 비가 내린다(물은 땅에서 솟은 것이 아니다)', S.rain>0);
tick(3.0);
ok('비 뒤에 구름이 있다', S.cloud>0);
tick(3.0);
ok('구름 뒤에 바다가 있다', S.sea>0);
tick(3.0);
ok('★바다 뒤에 하수구가 있다(그 물은 당신이 흘려보낸 물이다)', S.sewer>0);

tick(4.0);
ok('★고리가 닫힌다', S.ring>=1 && S.closed===true);
ok('★배반이 왔다', S.betrayed===true);

// ── 5막 여운 ────────────────────────────────────────────────────
// betray는 rAF와 실타이머를 번갈아 탄다 — 기다리는 동안에도 프레임을 계속 공급한다.
var pump=setInterval(function(){ tick(0.2); }, 10);
setTimeout(function(){
  clearInterval(pump);
  tick(4);

  ok('★betray 후 여운 진입(700ms 정지 후 해제)', S.phase==='after' && !win.Museum.isLocked());
  var f=win.document.getElementById('formula');
  ok('여운 문장: 물은 오지 않았다 — 돌고 있었다', /돌고 있었다/.test(f.textContent));
  ok('★여운 수치 해금: 514.4km · 2,000톤 · 9℃', /514\.4/.test(f.textContent) && /2,000톤/.test(f.textContent) && /9℃/.test(f.textContent));
  ok('★여운 수치 해금: 취수 25km · 정수센터 여섯 · 1908', /25km/.test(f.textContent) && /여섯/.test(f.textContent) && /1908/.test(f.textContent));
  ok('여운: 발원의 이름을 밝힌다', /검룡소/.test(f.textContent));
  ok('손잡이가 열린다', win.document.getElementById('reexp').className.indexOf('is-in')>=0);
  ok('전제 한 줄은 물러난다', win.document.getElementById('premise').className.indexOf('is-in')<0);
  ok('★티켓이 주어진다', (win.localStorage.getItem('kmuseum.tickets')||'').indexOf('s11_water')>=0);
  ok('★명판: 이무기도 같은 길을 거슬러 올랐다', /이무기/.test(win.document.body.textContent));

  // 칠판이 답이 된다
  ok('★칠판이 여운에서 답이 된다', H.board._state.answer==='물은 오지 않았다 — 돌고 있었다');
  ok('★답이 무대에 그려진다', drawn.lastIndexOf('물은 오지 않았다 — 돌고 있었다') > drawn.lastIndexOf('이 물은 — 어디서 왔을까요?'));
  ok('★칠판이 무대 한가운데로 내려온다', H.board._state.move > 0.9);

  // ── 손잡이 — 물길 짚기 ──────────────────────────────────────────
  var cap1=H.slide(0.8184);
  ok('★팔당댐을 짚으면 팔당댐이라 한다', cap1.indexOf('팔당댐')>=0);
  ok('★거리는 실측 환산이다(514.4×0.8184 ≈ 421km)', cap1.indexOf('421km')>=0);
  var cap2=H.slide(0);
  ok('발원을 짚으면 검룡소 — 0km', cap2.indexOf('검룡소')>=0 && cap2.indexOf('0km')>=0);
  var cap3=H.slide(0.5);
  ok('한가운데를 짚으면 실측 257km', cap3.indexOf('257km')>=0);
  var cap4=H.slide(0.7914);
  ok('두물머리를 짚으면 두물머리', cap4.indexOf('두물머리')>=0);

  // ── 재배반 없음 ─────────────────────────────────────────────────
  tick(3.0);
  ok('여운에서 다시 배반하지 않는다', S.phase==='after');

  // ── freeze 존중 ────────────────────────────────────────────────
  var t0=S.t;
  win.dispatchEvent(new win.Event('museum:freeze'));
  tick(1.0);
  ok('freeze를 존중한다(무대가 멈춘다)', near(S.t, t0, 1e-6));
  win.dispatchEvent(new win.Event('museum:unfreeze'));
  tick(0.2);
  ok('unfreeze로 되살아난다', S.t > t0);

  // ── §8.5 원칙3 — 관람 중 수치 표기 0 ────────────────────────────
  var bIdx = drawn.indexOf('물은 오지 않았다 — 돌고 있었다');
  var during = drawn.slice(0, bIdx<0? drawn.length : bIdx);
  var num = during.filter(function(t){ return /\d+\s*(km|톤|℃|%)|\d+\s*\/\s*\d+/.test(t); });
  ok('★관람 중 수치 표기 0(수치는 여운에서만 해금)', num.length===0);

  console.log('\nE2 jsdom: '+pass+'/'+(pass+fail)+' 통과');
  process.exit(fail?1:0);
}, 1400);
