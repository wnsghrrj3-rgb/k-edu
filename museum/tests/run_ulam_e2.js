/* run_ulam_e2.js — M3 아무도 모르는 줄무늬 E2 무대 실부팅 검증
   jsdom으로 ex03_ulam.html 실행 → 감기·소수 불·이양·연속 줌아웃·10,000→스윕→betray 700ms·여운·슬라이더 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex03_ulam.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex03_ulam.html',
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
  var M=win.__M3, S=M.S, P=M.PURE;
  ok('부팅: __M3 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: E1 정합(왕복·π)', P.posToN(1,-1)===9 && P.primeCount(100)===25);
  ok('부팅: sieve 41000 장전', M.SIEVE.length===41001 && M.SIEVE[2]===1 && M.SIEVE[4]===0);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  // 첫 포인터 → wind + 전제 등장
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=300; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 드래그 → wind', S.phase==='wind');
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));

  // 감기: 각변위 → 칸 (한 바퀴 반 → 링1 일부)
  M.windBy(Math.PI); tick(2);
  ok('감기: 각변위로 칸 깔림', S.n>1 && S.n<30);

  // 50칸까지 — 소수 불 E1 전수 정합(불은 SIEVE로만 켜짐 = 설계상 동치, 여기선 SIEVE↔isPrime 표본 재확인)
  M.windTo(50); tick(2);
  ok('50칸 도달', S.n===50);
  (function(){
    var good=true;
    for(var n=1;n<=50;n++) if(!!M.SIEVE[n]!==P.isPrime(n)) good=false;
    ok('소수 불 E1 전수 정합(1..50)', good);
  })();

  // 220칸 → 이양(auto)
  M.windTo(M.N_MANUAL); tick(2);
  ok('220칸 → 이양(auto)', S.phase==='auto' && S.autoV>0);
  var n0=S.n, cam0=M.cam.s;
  tick(120);
  ok('auto: 스스로 감김(칸 증가)', S.n>n0);
  ok('연속 줌아웃: 카메라 물러남', M.cam.s<cam0);

  // 10,000 → still → sweep
  M.windTo(M.N_MAX); tick(2);
  ok('10,000 도달 → 정적(still)', S.n===M.N_MAX && S.phase==='still');
  tick(60);
  ok('0.8s 정적 → 스윕 진입', S.phase==='sweep');
  tick(110);   // 1.6s 스윕 완주
  ok('스윕 완료 → 배반 발동', S.betrayed===true);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
  var nLock=S.n;
  M.windBy(10);
  ok('잠금 중 감기 무시 아님(칸 상한 고정)', S.n===nLock);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray의 setTimeout(700ms 정지) 소화 후 마무리
setTimeout(function(){
  try{
    var M=win.__M3, S=M.S;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(아무도 모른다·울람)', f && /아무도 모른다/.test(f.innerHTML) && /울람/.test(f.innerHTML));
    ok('티켓 m3_ulam 발급', win.localStorage.getItem('kmuseum.tickets') && /m3_ulam/.test(win.localStorage.getItem('kmuseum.tickets')));

    // 재체험 슬라이더 — 크기 재구성
    var slider=win.document.querySelector('#reexp input');
    slider.value='2500';
    slider.dispatchEvent(new win.Event('input'));
    tick(4);
    ok('슬라이더: 2,500 재구성', S.view.n===2500);
    slider.value='40000';
    slider.dispatchEvent(new win.Event('input'));
    tick(4);
    ok('슬라이더: 40,000 재구성', S.view.n===40000);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
