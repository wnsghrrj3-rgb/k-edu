/* run_price_e2.js — S5 짜장면 타임머신 E2 무대 실부팅 검증
   jsdom으로 ex05_time.html 실행 → 지폐 한 장=한 그릇·시계 거스름 앵커 정합·이양·1970 도착·일흔 그릇→betray 700ms·여운·슬라이더 E1 정합·재배반 없음 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex05_time.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex05_time.html',
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
  var M=win.__S5, S=M.S, P=M.PURE;
  ok('부팅: __S5 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  tick(3);
  ok('초기: boot · 2026년 · 메뉴판 = E1 오늘 값', S.phase==='boot'
     && Math.round(S.year)===2026 && S.menuPrice===P.priceAt(2026) && S.menuPrice===7000);

  // 지폐 잡기 → pay
  var down=new win.Event('pointerdown'); down.clientX=290; down.clientY=620; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('지폐 잡기 → pay · 손에 들림', S.phase==='pay' && S.bill.held===true);
  var up=new win.Event('pointerup'); win.dispatchEvent(up); tick(2);

  // 지폐 한 장 = 한 그릇
  M.serveOnce(); tick(2);
  ok('한 장 = 한 그릇', S.paid===1 && !!S.served);
  M.serveOnce(); tick(2);
  ok('그릇이 접시에 있는 동안 두 그릇 안 나온다', S.paid===1);
  tick(100);                                   // 1.6s — 그릇 치워짐
  ok('그릇은 치워지고 지폐는 돌아온다(무대 순환)', S.served===null
     && S.bill.x===340);
  M.serveOnce(); tick(100); M.serveOnce(); tick(100);
  ok('세 그릇 → 괘종시계 숨쉼(초대)', S.paid===3 && S.invite===true);

  // 거스르다 — 앵커마다 메뉴판이 E1 기록으로 다시 씌어진다
  M.beginRewind();
  M.handRewind(4);  tick(3);
  ok('거스름 ①: 2022년 → 메뉴판 '+P.priceAt(2022)+'원 (E1 정합)',
     Math.round(S.year)===2022 && S.menuPrice===P.priceAt(2022) && S.handAnchors===1);
  M.handRewind(5);  tick(3);
  ok('거스름 ②: 2017년 → 메뉴판 '+P.priceAt(2017)+'원 (E1 정합)',
     Math.round(S.year)===2017 && S.menuPrice===P.priceAt(2017) && S.handAnchors===2);
  M.handRewind(5);  tick(3);
  ok('거스름 ③ → 시계가 스스로 돈다(이양)', S.handAnchors===3 && S.phase==='auto');

  // 이양 중 손 무시
  var held0=S.bill.held;
  var d2=new win.Event('pointerdown'); d2.clientX=290; d2.clientY=620; d2.pointerId=2;
  win.document.getElementById('stage-canvas').dispatchEvent(d2); tick(1);
  ok('이양 중 지폐 무시', S.bill.held===held0 && S.bill.held===false);

  // 자동 되감기 → 1970 도착
  var guard=0;
  while(S.phase==='auto' && guard++<2000) tick(10);
  ok('1970 도착 · 정지 · 메뉴판 100원', S.phase==='arrived'
     && S.year===P.YEAR_MIN && S.menuPrice===100);

  // 일흔 그릇 → betray
  guard=0;
  while(!S.betrayed && guard++<4000) tick(10);
  ok('일흔 그릇 연쇄 → 배반 발화', S.betrayed===true && S.pile.length===M.FEAST_N);
  ok('그릇 수 = E1 정합(7000원 ÷ 100원)', M.FEAST_N===P.bowlsFor(P.NOTE,1970) && M.FEAST_N===70);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__S5, S=M.S, P=M.PURE;
    tick(8);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    ok('여운 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운 수식(같은 한 장·일흔 그릇 해금)', f && /같은 한 장이었다/.test(f.innerHTML) && /일흔 그릇/.test(f.innerHTML));
    ok('전제 한 줄 표시됨', win.document.getElementById('premise').classList.contains('is-in'));
    ok('명판 출처 소문(한국물가정보)', /한국물가정보/.test(win.document.body.innerHTML));
    ok('티켓 s5_time 발급', win.localStorage.getItem('kmuseum.tickets') && /s5_time/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 = 아무 해나 짚기 — 분필 즉석 환산 E1 정합
    var slider=win.document.querySelector('#reexp input');
    slider.value='1988'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('1988년 짚기: 한 그릇 350원 · 지폐 한 장이면 20그릇 (E1 정합)',
       S.year===1988 && S.menuPrice===350
       && M.chalkEra()==='1988년 — 한 그릇 350원 · 지폐 한 장이면 20그릇'
       && P.bowlsFor(P.NOTE,1988)===20);
    slider.value='2026'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('2026년 짚기: 오늘은 한 그릇', /1그릇/.test(M.chalkEra()) && S.menuPrice===7000);
    slider.value='1970'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('1970년 짚기: 일흔 그릇', /70그릇/.test(M.chalkEra()) && S.menuPrice===100);

    // 여운 자유 — 재배반 없음
    M.syncEra(); tick(4);
    ok('여운 자유 짚기: 재배반 없음', S.phase==='after' && win.Museum.isLocked()===false);

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
