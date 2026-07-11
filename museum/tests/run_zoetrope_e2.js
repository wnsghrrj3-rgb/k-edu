/* run_zoetrope_e2.js — A4 12장의 마법 E2 무대 실부팅 검증
   jsdom으로 ex04_zoetrope.html 실행 → 돌림·저속 비생존·임계 지속→betray 700ms·여운·슬라이더·그리기 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','art','ex04_zoetrope.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/art/ex04_zoetrope.html',
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
  var M=win.__A4, S=M.S, P=M.PURE, TAU=Math.PI*2;
  ok('부팅: __A4 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 열두 장·획 저장소', S.F===12 && M.strokes().length===12);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  // 첫 터치 → spin + 전제
  var down=new win.Event('pointerdown'); down.clientX=500; down.clientY=400; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 터치 → spin', S.phase==='spin');
  ok('전제 한 줄 등장', win.document.getElementById('premise').classList.contains('is-in'));

  // 정면 장 = E1 frameOf 정합
  M.spinTo(-3*TAU/12 - 0.05); tick(1);
  ok('정면 장 = frameOf(−angle,F) 정합', M.frontFrame()===P.frameOf(-S.S? -S.angle : -S.angle, 12) && M.frontFrame()===P.frameOf(-S.angle,12));

  // 손 뗌(감쇠 활성)
  win.dispatchEvent(new win.Event('pointerup'));

  // 저속: 낱장일 뿐 — 비생존
  M.setOmega(3.0); tick(40);                            // fps=3·12/2π≈5.7 <12
  ok('저속: 원판은 돌지만(angle 전진) 살아나지 않음', S.angle!==0 && S.betrayed===false && S.aliveT===0);

  // 감속 실재: 손 떼면 느려진다
  var w0=S.omega; tick(20);
  ok('감속 실재: |ω| 단조 감소', Math.abs(S.omega)<Math.abs(w0));

  // 임계 지속 → 배반 (사용자가 계속 돌린다 = ω 지속 공급)
  for(var d=0; d<12 && !S.betrayed; d++){ M.setOmega(9.0); tick(10); }  // fps≈17 >12, 1.9s 상당
  ok('임계 1.2s 지속 → 탄생 배반', S.betrayed===true && S.phase==='betrayed');
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운·그리기 검사
setTimeout(function(){
  try{
    var M=win.__A4, S=M.S;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(한 장도·눈이 이어)', f && /한 장도 움직이지 않았다/.test(f.innerHTML) && /눈이 이어 붙였다/.test(f.innerHTML));
    ok('티켓 a4_zoetrope 발급', win.localStorage.getItem('kmuseum.tickets') && /a4_zoetrope/.test(win.localStorage.getItem('kmuseum.tickets')));

    // 슬라이더: 장수 재구성
    var slider=win.document.querySelector('#reexp input');
    slider.value='6';
    slider.dispatchEvent(new win.Event('input')); tick(2);
    ok('슬라이더: F=6 재구성', S.F===6 && M.strokes().length===6);
    slider.value='24';
    slider.dispatchEvent(new win.Event('input')); tick(2);
    ok('슬라이더: F=24 재구성', S.F===24);

    // 그리기: 진입 → 획 기록 → 이탈 → 원판 재가동
    M.enterEdit(); tick(1);
    ok('그리기 진입: 원판 정지·앞장 선택', S.edit>=0 && S.omega===0);
    M.addStroke([{x:0.3,y:0.3},{x:0.6,y:0.65},{x:0.7,y:0.7}]);
    ok('획 기록: 해당 장에 저장', M.strokes()[S.edit].length===1 && M.strokes()[S.edit][0].pts.length===3);
    var editIdx=S.edit;
    M.exitEdit(); tick(1);
    ok('그리기 이탈: 제자리로', S.edit===-1 && M.strokes()[editIdx].length===1);
    M.setOmega(2.0); tick(10);
    ok('여운: 다시 돌 수 있다·재배반 없음', S.angle!==0 && S.betrayed===true && win.Museum.isLocked()===false);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
