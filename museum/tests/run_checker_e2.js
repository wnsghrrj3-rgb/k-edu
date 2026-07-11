/* run_checker_e2.js — C3 속지 마 눈 E2 무대 실부팅 검증
   jsdom으로 ex03_checker.html 실행 → 그립(A에서만)·밀기 전진·띠 색 불변·
   닿음(정적)→자동 소등(이양)→전멸→betray 700ms→여운·슬라이더(불 되살리기)·freeze 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','science','ex03_checker.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={};
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/science/ex03_checker.html',
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
      gain:{value:0,setValueAtTime:function(){},exponentialRampToValueAtTime:function(){},linearRampToValueAtTime:function(){}},
      frequency:{value:0,setValueAtTime:function(){},exponentialRampToValueAtTime:function(){},linearRampToValueAtTime:function(){}},
      Q:{value:0}, type:'', buffer:null, loop:false }; }
    function AC(){ this.currentTime=0; this.state='running'; this.sampleRate=44100; this.destination={}; this.resume=function(){}; }
    AC.prototype.createGain=nodeStub; AC.prototype.createOscillator=nodeStub;
    AC.prototype.createBufferSource=nodeStub; AC.prototype.createBiquadFilter=nodeStub;
    AC.prototype.createBuffer=function(ch,len){ return { getChannelData:function(){ return new Float32Array(len); } }; };
    win.AudioContext=AC; win.webkitAudioContext=AC;
  }
});
var win=dom.window;
function tick(times){ for(var t=0;t<times;t++){ var q=rafQueue; rafQueue=[];
  for(var i=0;i<q.length;i++){ try{ q[i](nowFn()); }catch(e){ process.stdout.write('rAF err: '+e.message+'\n'); } } } }
function pdown(x,y){ var e=new win.Event('pointerdown'); e.clientX=x; e.clientY=y; e.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(e); }
function pmove(x,y){ var e=new win.Event('pointermove'); e.clientX=x; e.clientY=y; e.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(e); }

try{
  var M=win.__C3, S=M.S, PURE=M.PURE;
  ok('부팅: __C3 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 판 5×5 · A/B 동일 휘도(E1 정합)',
     PURE.N===5 && Math.abs(PURE.lum(PURE.A.i,PURE.A.j)-PURE.lum(PURE.B.i,PURE.B.j))<1e-12);
  ok('부팅: 띠 회색 = rgb(lum A) = rgb(lum B)',
     M.GRAY===PURE.rgb(PURE.lum(PURE.A.i,PURE.A.j)) && M.GRAY===PURE.rgb(PURE.lum(PURE.B.i,PURE.B.j)));
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  // 그립은 A(또는 띠 머리)에서만
  var far=M.toClient(4.5,0.5);
  pdown(far.x,far.y); tick(1);
  ok('먼 칸 그립 거부(전제만 등장)', S.phase==='arm' && S.progress===0);
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));

  // A에서 그립 → 밀다
  var a=M.toClient(M.AC.x, M.AC.y);
  pdown(a.x,a.y);
  var mid=M.toClient(M.AC.x+1.2, M.AC.y);
  pmove(mid.x,mid.y); tick(2);
  ok('A 그립 → 밀기 전진', S.phase==='push' && S.progress>0.3);

  // 밀다 = 앞으로만(뒤로 끌어도 줄지 않는다)
  var back=M.toClient(M.AC.x+0.4, M.AC.y);
  var pBefore=S.progress;
  pmove(back.x,back.y); tick(1);
  ok('밀다: 되돌아가지 않는다(단조)', S.progress===pBefore);

  // 끝까지 → 닿음(정적 reveal)
  M.pushTo(1); tick(2);
  ok('B에 닿음 → reveal(정적)', S.phase==='reveal');

  // 정적 뒤 판이 스스로 소등(이양)
  tick(70);
  ok('판이 스스로 소등 시작(dim 이양)', S.phase==='dim' && M.offCount()>0);
  pdown(a.x,a.y); tick(1);
  ok('소등 중 입력 무시', S.phase==='dim');
  var off1=M.offCount(); tick(40);
  ok('소등 진전: 꺼진 칸 증가', M.offCount()>off1);

  // 전멸 → 배반
  tick(400);
  ok('마지막 불이 꺼짐 → 배반 발동', S.betrayed===true && S.phase==='betrayed');
  ok('배반 프레임: A·B·띠만 남음(주변 알파 0·기둥 소등)',
     M.tileAlpha(2,2)<0.03 && M.tileAlpha(4,4)<0.03 && M.cylAlpha()<0.03 &&
     M.tileAlpha(PURE.A.i,PURE.A.j)===1 && M.tileAlpha(PURE.B.i,PURE.B.j)===1 && S.progress===1);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__C3, S=M.S, PURE=M.PURE;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(당신의 눈)', f && /당신의 눈이었다/.test(f.innerHTML) && /그림자/.test(f.innerHTML));
    ok('명판(애덜슨 1995)', /1995/.test(win.document.body.innerHTML));
    ok('티켓 c3_checker 발급', win.localStorage.getItem('kmuseum.tickets') && /c3_checker/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 = 불을 되살리기 — 알면서도 또 속는다
    var slider=win.document.querySelector('#reexp input');
    slider.value='100'; slider.dispatchEvent(new win.Event('input')); tick(90);
    ok('불이 돌아온다: 주변 알파 회복·기둥 재등장', M.tileAlpha(2,2)>0.9 && M.cylAlpha()>0.85);
    slider.value='0'; slider.dispatchEvent(new win.Event('input')); tick(90);
    ok('다시 둘만: 주변 알파 소등', M.tileAlpha(2,2)<0.05);
    ok('왕복 내내 A·B·띠 불변', M.tileAlpha(PURE.A.i,PURE.A.j)===1 && M.tileAlpha(PURE.B.i,PURE.B.j)===1 && S.progress===1);
    ok('재배반 없음 · 잠금 해제', S.betrayed===true && win.Museum.isLocked()===false);

    // freeze 존중
    var t0=S.time;
    win.dispatchEvent(new win.Event('museum:freeze'));
    tick(6);
    ok('freeze 존중: 시간 정지', S.time===t0);
    win.dispatchEvent(new win.Event('museum:unfreeze'));
    tick(3);
    ok('unfreeze: 시간 재개', S.time>t0);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
