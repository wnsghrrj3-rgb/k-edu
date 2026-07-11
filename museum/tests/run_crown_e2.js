/* run_crown_e2.js — C5 물방울의 왕관 E2 무대 실부팅 검증
   jsdom으로 ex05_crown.html 실행 → 붙잡기(F 상승)·놓기(복귀)·깊어지는 손·
   자동 침강(이양)→구슬 순간 betray 700ms→여운·슬라이더 배율·순환·freeze 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','science','ex05_crown.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/science/ex05_crown.html',
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
  var M=win.__C5, S=M.S, PURE=M.PURE;
  ok('부팅: __C5 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: E1 정합(자유낙하·지각 문턱)',
     Math.abs(M.TI-Math.sqrt(2*PURE.H/PURE.G))<1e-12 &&
     PURE.onScreen(1)<PURE.PERCEIVE && PURE.onScreen(PURE.minFactor())>=PURE.PERCEIVE);
  tick(3);
  ok('초기: boot · 방울 맺힘 · F=1', S.phase==='boot' && S.cphase==='form' && Math.abs(S.F-1)<1e-9);

  // 붙잡다 → 세계가 느려진다(첫 깊이 1/4)
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=380; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('붙잡기 → live · 전제 등장', S.phase==='live' &&
     win.document.getElementById('premise').classList.contains('is-in'));
  tick(40);
  ok('첫 깊이: F → 4 부근(캡)', S.F>3.2 && S.F<=4.01 && M.cap()===4);

  // 놓다 → 실시간 복귀
  M.holdEnd(true); tick(60);
  ok('놓음 → 실시간 복귀(F→1) · 손 한 뼘 깊어짐', S.F<1.3 && S.holdCount===1 && M.cap()===12);

  // 손이 깊어진다: 12 → 50
  M.holdStart(); tick(60);
  ok('둘째 깊이: F → 12 부근', S.F>9 && S.F<=12.01);
  M.holdEnd(true);
  M.holdStart(); tick(80);
  ok('셋째 깊이: F → 50 부근', S.F>38 && S.F<=50.5 && S.holdCount===2);
  M.holdEnd(true); tick(40);
  ok('세 번 붙잡음 완료', S.holdCount===3);

  // 이양 — 다음 방울이 닿기 직전 세계가 스스로 가라앉는다
  M.gotoImpact(); tick(6);
  ok('자동 침강(이양)', S.auto===true);
  tick(60);
  ok('사건의 시간: F=1000 · 사건 진입', S.cphase==='event' && S.F>=999);
  var ts1=S.ts; tick(10);
  ok('사건이 아주 천천히 흐른다(16µs/틱)', S.ts>ts1 && (S.ts-ts1)<0.001);

  // 구슬이 맺히는 순간 — 배반
  tick(320);
  ok('구슬 순간 정지 → 배반', S.betrayed===true && S.phase==='betrayed' &&
     Math.abs(S.ts-PURE.beadTs)<1e-9);
  ok('배반 프레임: 정점(스파이크 높이 1)', Math.abs(PURE.spikeH(S.ts)-1)<1e-9);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__C5, S=M.S, PURE=M.PURE;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(없었던 것이 아니다)', f && /없었던 것이 아니다/.test(f.innerHTML));
    ok('명판(에저튼 1957)', /1957/.test(win.document.body.innerHTML));
    ok('티켓 c5_crown 발급', win.localStorage.getItem('kmuseum.tickets') && /c5_crown/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));
    ok('여운 기본 배율 1000 · 사건 이어짐', S.sliderF===1000);

    // 사건의 나머지 — 무너짐과 물기둥이 느린 채로
    tick(500);
    ok('무너짐→물기둥→순환 계속', ['event','ripple','form','fall'].indexOf(S.cphase)>=0);

    // 슬라이더 — 문턱을 몸으로
    var slider=win.document.querySelector('#reexp input');
    slider.value='0'; slider.dispatchEvent(new win.Event('input')); tick(120);
    ok('배율 1: 실시간 복귀(왕관은 다시 눈 밖으로)', S.sliderF===1 && S.F<1.5);
    slider.value='100'; slider.dispatchEvent(new win.Event('input')); tick(160);
    ok('배율 2000: 가장 깊은 시간', S.sliderF===2000 && S.F>1500);
    ok('슬라이더 로그 매핑 정합', M.sliderToF(0)===1 && M.sliderToF(100)===2000);

    // 재붙잡기 — 재배반 없음
    M.holdStart(); tick(20); M.holdEnd(true);
    ok('여운 재붙잡기 허용 · 재배반 없음', S.phase==='after' && S.betrayed===true && win.Museum.isLocked()===false);

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
