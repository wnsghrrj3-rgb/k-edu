/* run_wave_e2.js — C1 진자의 파도 E2 무대 실부팅 검증
   jsdom으로 ex01_wave.html 실행 → 당김·놓음·물결·Γ/2 지그재그·Γ 귀환 betray 700ms·여운·슬라이더·재당김 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','science','ex01_wave.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/science/ex01_wave.html',
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

try{
  var M=win.__C1, S=M.S, GAMMA=M.GAMMA;
  ok('부팅: __C1 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 열다섯 진자·길이 단조', S.N===15 && S.lens.length===15 && S.lens[0]>S.lens[14]);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  // 당기다 → 전제 + 공통 각
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=400; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  M.pullTo(0.3);
  tick(2);
  ok('당김 → pull + 공통 각', S.phase==='pull' && Math.abs(S.pull-0.3)<1e-9);
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));
  (function(){
    var a=M.anglesNow(), good=true;
    for(var i=0;i<a.length;i++) if(Math.abs(a[i]-0.3)>1e-9) good=false;
    ok('당김 중 전원 한 각도(평행)', good);
  })();

  // 놓다 → 일제 출발
  M.release(); tick(4);
  ok('놓음 → swing · t 전진', S.phase==='swing' && S.t>0 && S.amp>=0.16);

  // 각도 = E1 disp 정합
  (function(){
    var a=M.anglesNow(), good=true;
    for(var i=0;i<S.N;i++)
      if(Math.abs(a[i]-S.amp*S.dir*S.wave.disp(i,S.t))>1e-9) good=false;
    ok('각도 = amp·disp(i,t) 정합(전원)', good);
  })();

  // 초반 물결: 각도열이 인접 위상차 균일(수식 검증은 E1 — 여기선 단조 위상 진행 확인)
  M.jumpTo(1.5); tick(1);
  (function(){
    var a=M.anglesNow(), changes=0;
    for(var i=1;i<a.length;i++) if((a[i]-a[i-1])!==0) changes++;
    ok('초반 물결: 이웃 각도 서로 다름(펼쳐짐)', changes===S.N-1);
  })();

  // Γ/2 지그재그: 부호 교대
  M.jumpTo(GAMMA/2); tick(1);
  (function(){
    var a=M.anglesNow(), good=true;
    for(var i=1;i<a.length;i++) if(a[i]*a[i-1]>=0) good=false;
    ok('Γ/2 지그재그: 이웃 부호 교대 전원', good);
  })();
  ok('Γ/2 chime 1회 소진', S.halfChimed===true);

  // 첫 항해 중 재당김 차단
  var down2=new win.Event('pointerdown'); down2.clientX=600; down2.clientY=400; down2.pointerId=2;
  win.document.getElementById('stage-canvas').dispatchEvent(down2);
  tick(1);
  ok('첫 항해는 끊지 않는다(재당김 차단)', S.phase==='swing');

  // Γ 도달 → 귀환 배반
  M.jumpTo(GAMMA-0.03); tick(6);
  ok('Γ 귀환 → 배반 발동', S.betrayed===true && S.phase==='betrayed');
  ok('배반 순간 t=Γ 고정(완벽한 평행)', Math.abs(S.t-GAMMA)<1e-9);
  (function(){
    var a=M.anglesNow(), good=true;
    for(var i=1;i<a.length;i++) if(Math.abs(a[i]-a[0])>1e-6) good=false;
    ok('배반 프레임: 열다섯 줄 한 각도', good);
  })();
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__C1, S=M.S;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(부서진 게 아니었다·박자)', f && /부서진 게 아니었다/.test(f.innerHTML) && /박자/.test(f.innerHTML));
    ok('티켓 c1_wave 발급', win.localStorage.getItem('kmuseum.tickets') && /c1_wave/.test(win.localStorage.getItem('kmuseum.tickets')));
    tick(30);
    ok('여운: 진자는 계속 흔들린다(t 전진)', S.t>M.GAMMA);

    // 슬라이더: 진자 수 재구성
    var slider=win.document.querySelector('#reexp input');
    slider.value='9';
    slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더: N=9 재구성·즉시 항해', S.N===9 && S.phase==='after' && S.amp>0);
    slider.value='30';
    slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더: N=30 재구성', S.N===30 && S.lens.length===30);

    // 재당김 → 재출발, 재배반 없음
    M.pullTo(-0.25); tick(1);
    ok('여운 재당김 허용', S.phase==='pull' && S.pull===-0.25);
    M.release(); tick(4);
    ok('재출발: 방향 반영·배반 1회 유지', S.phase==='after' && S.dir===-1 && S.betrayed===true && win.Museum.isLocked()===false);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
