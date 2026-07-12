/* run_village_e2.js — S9 100명의 마을 E2 무대 실부팅 검증
   jsdom으로 ex09_village.html 실행 → 카드 뒤집기·분할 정합·목격자 배치·이양·소등→betray 700ms·여운·슬라이더·재뒤집기 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex09_village.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex09_village.html',
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
function tap(x,y){
  var d=new win.Event('pointerdown'); d.clientX=x; d.clientY=y; d.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(d);
}
function groupSideCounts(M){
  // 목표 좌표(tx) 기준: 왼 무리(x<0.45W) / 오른 무리 / 그림자(중간)
  var W=1600, L=0, R=0;
  M.folk.forEach(function(f){ if(f.tx < W*0.53) L++; else R++; });
  return {L:L,R:R};
}

try{
  var M=win.__S9, S=M.S, P=M.PURE;
  ok('부팅: __S9 노출 · Museum API', !!M && !!S && !!win.Museum && typeof win.Museum.betray==='function');
  tick(3);
  ok('부팅: 등불 100 · phase=boot · 당신 미점등', M.folk.length===100 && S.phase==='boot' && !M.youDot().brass);
  ok('전제: premise 요소 존재', !!win.document.getElementById('premise'));

  // 1카드(대륙) — 손 뒤집기
  tap(683, 128); tick(4);
  ok('카드 탭 → flip 진입 · 1카드(대륙) 뒤집힘', S.phase==='flip' && S.cardIdx===0 && M.CARDS[0].id==='continents');
  ok('대륙 카드: 당신 미배치(증명 불가)', !M.youDot().brass);
  // 뒤집힘 완료까지 진행
  for(var w=0; w<40 && S.flipT<1; w++) tick(2);
  ok('뒤집힘 완주(flipT=1)', S.flipT>=1);

  // 2카드(read) — 당신 점등 + yes측
  tap(683, 128); tick(4);
  for(w=0; w<40 && S.flipT<1; w++) tick(2);
  ok('2카드 = read', S.cardIdx===1 && M.CARDS[1].id==='read');
  ok('★목격자: 당신 등불 놋쇠 점등', M.youDot().brass===true);
  (function(){
    var mem=P.membership('read');
    var g=groupSideCounts(M);
    ok('read 분할 = E1 정합(왼 87·오른 13)', g.L===87 && g.R===13 && mem[P.YOU]===true);
  })();

  // 3카드(power)
  tap(683, 128); tick(4);
  for(w=0; w<40 && S.flipT<1; w++) tick(2);
  ok('3카드 = power · 당신 유지', S.cardIdx===2 && M.youDot().brass===true);

  // 4카드(net) → 기계의 밤 예약
  tap(683, 128); tick(4);
  for(w=0; w<40 && S.flipT<1; w++) tick(2);
  ok('4카드 = net · autoAt 예약', S.cardIdx===3 && S.autoAt>0);
  // 손 카드 한계: 다섯째 탭은 무시
  var before=S.cardIdx;
  tap(683, 128); tick(2);
  ok('손 카드 한계: 다섯째 탭 무시', S.cardIdx===before);

  // 이양 — 줄이 스스로
  for(w=0; w<400 && S.phase!=='auto'; w++) tick(3);
  ok('이양: phase=auto', S.phase==='auto');
  tap(683, 128); tick(2);
  ok('이양 중 손 무시', S.cardIdx===before);

  // 자동 카드 소비 → 증명 불가 카드에서 당신 그림자
  for(w=0; w<600 && S.cardIdx<4; w++) tick(3);
  ok('자동 5카드(city) 소비', S.cardIdx>=4);
  (function(){
    // city는 증명 불가 — 당신은 무리 사이 그림자로
    for(var v=0; v<600 && S.cardIdx<5; v++){ if(S.shadowNote) break; tick(3); }
    ok('증명 불가 카드: 당신 그림자 멈춤(shadowNote)', S.shadowNote===true);
  })();

  // 마지막 카드(korean) → final → 99 소등 → betray
  var betrayed=false, betrayResolve=null;
  var origBetray=win.Museum.betray;
  win.Museum.betray=function(pt){ betrayed=true; return origBetray.call(win.Museum, pt); };
  for(w=0; w<3000 && S.phase!=='final'; w++) tick(3);
  ok('마지막 카드 = korean · phase=final', S.phase==='final' && M.CARDS[S.cardIdx].id==='korean');
  for(w=0; w<3000 && !S.betrayed; w++) tick(3);
  ok('99 소등 → betray 호출', betrayed===true && S.betrayed===true);
  (function(){
    var offs=0;
    M.folk.forEach(function(f,i){ if(i!==P.YOU && !f.lit) offs++; });
    ok('소등 정합: 아흔아홉 전부 어둠 · 당신만 등불', offs===99 && M.folk[P.YOU].lit===true);
  })();
  ok('betray 중 입력 잠금', win.Museum.isLocked()===true);
}catch(e){
  console.log('E2 예외: '+e.message);
  console.log(e.stack.split('\n').slice(0,4).join('\n'));
  process.exit(1);
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__S9, S=M.S, P=M.PURE;
    tick(8);
    ok('700ms 정지 후 after 진입 · 입력 해제', S.phase==='after' && win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운: 수치 해금(82억·8,100만·백 명 중 하나)',
       f && /82/.test(f.innerHTML) && /8,?100만|8100만|81\d*00만/.test(f.innerHTML) && /백 명 중/.test(f.innerHTML));
    ok('티켓 s9_village 발급',
       win.localStorage.getItem('kmuseum.tickets') && /s9_village/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 — 카드 서가(E1 정합)
    var slider=win.document.querySelector('#reexp input');
    slider.value='5'; slider.dispatchEvent(new win.Event('input')); tick(6);
    ok('슬라이더 water: 분할 73/27 E1 정합', (function(){
      if(M.CARDS[5].id!=='water') return false;
      var g=groupSideCounts(M);
      return g.L===73 && g.R===27 && M.shelfChalk().indexOf('73')>=0;
    })());
    slider.value='0'; slider.dispatchEvent(new win.Event('input')); tick(6);
    ok('슬라이더 대륙: 6분할 명세 분필',
       M.shelfChalk().indexOf('아시아 59')>=0 && M.shelfChalk().indexOf('오세아니아 1')>=0);

    // 재뒤집기 재배반 없음
    var betrayCount=0, orig=win.Museum.betray;
    win.Museum.betray=function(pt){ betrayCount++; return orig.call(win.Museum, pt); };
    slider.value='7'; slider.dispatchEvent(new win.Event('input')); tick(8);
    ok('재뒤집기(korean 재선택): 재배반 없음', betrayCount===0 && S.phase==='after');
    win.Museum.betray=orig;

    // freeze 존중
    var t0=S.time;
    win.dispatchEvent(new win.Event('museum:freeze'));
    tick(6);
    ok('freeze 존중: 시간 정지', S.time===t0);
    win.dispatchEvent(new win.Event('museum:unfreeze'));
    tick(3);
    ok('unfreeze: 시간 재개', S.time>t0);

    console.log('E2: '+pass+'/'+(pass+fail)+' 통과');
    process.exit(fail?1:0);
  }catch(e){
    console.log('마무리 예외: '+e.message);
    process.exit(1);
  }
}, 1400);
