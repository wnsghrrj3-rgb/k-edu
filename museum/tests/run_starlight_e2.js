/* run_starlight_e2.js — C4 별빛의 시간 E2 무대 실부팅 검증
   jsdom으로 ex04_starlight.html 실행 → 짚기·되감기 단조·도착 연도/시대 E1 정합·
   데네브 잠김/각성·배반 문장→betray 700ms·여운·슬라이더 환산·freeze 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','science','ex04_starlight.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/science/ex04_starlight.html',
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

try{
  var M=win.__C4, S=M.S, PURE=M.PURE, D=M.DENEB;
  ok('부팅: __C4 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 13별 · 항등식 E1 정합', PURE.STARS.length===13 &&
     Math.abs((2026-PURE.departure(PURE.STARS[D].ly))-PURE.STARS[D].ly)<=0.5);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  // 빈 하늘 짚기 → 전제만
  var c0=M.toClient(60, 700);
  pdown(c0.x,c0.y); tick(1);
  ok('별 아닌 곳: 전제만 등장(sky)', S.phase==='sky');
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));

  // 데네브는 아직 잠들어 있다
  ok('데네브 3픽 전 잠김', M.pick(D)===false && S.phase==='sky');

  // 첫 별 짚기(시리우스) — 되감기 단조 전진
  var p0=M.toClient(M.POS[0][0], M.POS[0][1]);
  pdown(p0.x,p0.y); tick(2);
  ok('짚기 → rewind · 표적=시리우스', S.phase==='rewind' && S.target===0);
  var y1=S.yearsAgo; tick(10);
  ok('되감기 단조 전진', S.yearsAgo>y1);
  M.fastForward(); tick(3);
  ok('도착: yearsAgo = 광년', Math.abs(S.yearsAgo-PURE.STARS[0].ly)<1e-9);
  ok('도착 분필: 시대·연도 E1 정합(현대·2017)',
     /현대/.test(win.document.body.innerHTML) && /2017/.test(win.document.body.innerHTML));
  M.holdSkip(); tick(3);
  ok('하늘 복귀 · 방문 1', S.phase==='sky' && S.visits===1);

  // 두 별 더(훅) → 데네브 각성
  M.pick(1); M.fastForward(); tick(3); M.holdSkip(); tick(3);
  M.pick(2); M.fastForward(); tick(3); M.holdSkip(); tick(3);
  ok('세 별 뒤 하늘이 깊어진다(데네브 각성)', S.visits===3 && M.pick(D)===true);

  // 데네브 — 삼국 526 · 배반 문장 · betray
  M.fastForward(); tick(3);
  ok('데네브 도착: 삼국 · 526 (E1 정합)',
     /삼국/.test(win.document.body.innerHTML) && /526/.test(win.document.body.innerHTML));
  tick(120);
  ok('두 번째 문장: 그 자리에 없을지도', /그 자리에 없을지도/.test(win.document.body.innerHTML));
  tick(140);
  ok('배반 발동', S.betrayed===true && S.phase==='betrayed');
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__C4, S=M.S, PURE=M.PURE;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(도착한 옛날들)', f && /도착한 옛날들이다/.test(f.innerHTML));
    ok('명판(별이 보낸 옛날)', /별이 보낸 옛날/.test(win.document.body.innerHTML));
    ok('티켓 c4_starlight 발급', win.localStorage.getItem('kmuseum.tickets') && /c4_starlight/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 환산 — E1 정합
    var slider=win.document.querySelector('#reexp input');
    slider.value='500'; slider.dispatchEvent(new win.Event('input')); tick(2);
    var cv=win.document.getElementById('convert');
    ok('환산 500광년 → 조선(1526)', /조선/.test(cv.innerHTML) && /1526/.test(cv.innerHTML));
    slider.value='1200'; slider.dispatchEvent(new win.Event('input')); tick(2);
    ok('환산 1200광년 → 남북국(826)', /남북국/.test(cv.innerHTML) && /826/.test(cv.innerHTML));

    // 여운 재짚기 — 전부 열림 · 재배반 없음
    ok('여운: 데네브 포함 재짚기 열림', M.pick(M.DENEB)===true);
    M.fastForward(); tick(3); M.holdSkip(); tick(3);
    ok('재짚기 완료 · after 복귀 · 재배반 없음', S.phase==='after' && S.betrayed===true && win.Museum.isLocked()===false);

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
