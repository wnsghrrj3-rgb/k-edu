/* run_snowball_e2.js — S7 눈덩이의 방 E2 무대 실부팅 검증
   jsdom으로 ex07_snowball.html 실행 → 크랭크 한 해·동행 실증·이양·이탈·일흔 해→betray 700ms·여운·슬라이더 72법칙·재굴림 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex07_snowball.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={ globalAlpha:1, textAlign:'left', font:'' };
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex07_snowball.html',
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
  var M=win.__S7, S=M.S, P=M.PURE;
  ok('부팅: __S7 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  tick(3);
  ok('초기 phase = boot · 0해 · 두 항아리 원금 동일', S.phase==='boot' && S.years===0
     && M.totals().L===50000 && M.totals().R===50000);

  // 첫 잡음 → roll
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=520; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('크랭크 잡기 → roll', S.phase==='roll');

  // 한 해 — 총액 = E1 정합, 방울 2개(왼 상수·오른 비례)
  M.handYear(); tick(2);
  ok('한 해: 총액 = E1 정합', S.years===1
     && M.totals().L===P.simpleWon(1,7) && M.totals().R===P.compoundWon(1,7));
  ok('이자 방울 좌우 낙하', S.drops.length>=2);

  // 열 해 — 동행 실증("똑같네")
  for(var i=0;i<9;i++) M.handYear();
  tick(2);
  ok('열 해: 복리/단리 < 1.2배 — 동행의 실증(E1 정합)',
     S.years===10 && P.ratioPermille(10,7)<1200);

  // 열다섯 해 → 이양 예약 → 자동
  for(var j=0;j<5;j++) M.handYear();
  tick(80);
  ok('열다섯 해 → 크랭크가 스스로 돈다(이양)', S.phase==='auto');
  var y0=S.years;
  M.handYear(); tick(1);
  ok('이양 중 손 무시', S.years===y0 || S.phase==='auto');

  // 자동 항해 — 쉰 해 부근 이탈 실증
  var guard=0;
  while(S.years<50 && guard++<3000 && !S.betrayed) tick(10);
  ok('쉰 해 도달: 복리/단리 ≥ 6배 — 이탈의 목격', S.years>=50 && P.ratioPermille(50,7)>=6000);
  ok('오른 항아리 만수위 초과(기둥)', M.pillarTopY() < 790-310);

  // 일흔 해 → betray
  guard=0;
  while(!S.betrayed && guard++<3000) tick(10);
  ok('일흔 해 → 배반 발화', S.betrayed===true && S.years===M.END_YEAR);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__S7, S=M.S, P=M.PURE;
    tick(8);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    ok('여운 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운 수식(이자가 이자를)', f && /이자가 이자를 낳았다/.test(f.innerHTML));
    ok('여운 해금: 단리 6배·복리 114배 수치', /114배/.test(f.innerHTML) && /만원/.test(f.innerHTML));
    ok('전제 한 줄 표시됨', win.document.getElementById('premise').classList.contains('is-in'));
    ok('명판(72의 법칙)', /72/.test(win.document.body.innerHTML));
    ok('티켓 s7_snow 발급', win.localStorage.getItem('kmuseum.tickets') && /s7_snow/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 = 이율의 손잡이 — 72법칙 E1 정합
    var slider=win.document.querySelector('#reexp input');
    slider.value='12'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더 r=12: 분필 "두 배까지 7해" (E1 정합)',
       S.rate===12 && M.chalk72()==='이율 12% — 두 배까지 '+P.doubleYear(12)+'해' && P.doubleYear(12)===7);
    slider.value='1'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더 r=1: 두 배까지 70해 (72법칙의 몸)', P.doubleYear(1)===70 && /70해/.test(M.chalk72()));

    // 여운 자유 재굴림 — 재배반 없음(END_YEAR 캡)
    var yr=S.years;
    M.yearPass(); tick(4);
    ok('여운 재굴림: 일흔 해 캡·재배반 없음', S.years===yr && S.phase==='after' && win.Museum.isLocked()===false);

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
}, 1400);
