/* run_lightmix_e2.js — A3 빛은 거꾸로 E2 무대 실부팅 검증
   jsdom으로 ex03_light.html 실행 → 붓기(paintMix 정합)·어두움 실증·전환 이양·등 걸기(addMix 정합)·3빛→betray 700ms·여운·슬라이더·재걸기 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','art','ex03_light.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={ globalAlpha:1, globalCompositeOperation:'source-over' };
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
function eq3(a,b,t){ t=t||1e-12; return a && b && Math.abs(a[0]-b[0])<=t && Math.abs(a[1]-b[1])<=t && Math.abs(a[2]-b[2])<=t; }

var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/art/ex03_light.html',
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
  var M=win.__A3, S=M.S, P=M.PURE;
  ok('부팅: __A3 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  tick(3);
  ok('초기 phase = boot · 접시 비어 있음', S.phase==='boot' && S.dish===null);

  // 첫 터치 → paint
  var down=new win.Event('pointerdown'); down.clientX=500; down.clientY=650; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 터치 → paint(물감의 세계)', S.phase==='paint');

  // 붓다 ① 빨강 — 접시색 = E1 그대로
  M.pour('R'); tick(2);
  ok('붓기 R: 접시 = 안료 R 그대로(정직)', eq3(M.dish(), P.PAINTS.R));

  // 붓다 ② 초록 — paintMix 정합 + 어두움 실증
  var lumBefore=P.lum(M.dish());
  M.pour('G'); tick(2);
  ok('붓기 G: 접시 = paintMix(R,G) 정합', eq3(M.dish(), P.paintMix(P.PAINTS.R,P.PAINTS.G)));
  ok('어두움 실증: 섞을수록 어두워진다(밝기 절반 이하)', P.lum(M.dish()) < lumBefore*0.5);

  // 붓다 ③ 파랑 — 거의 검정 → 정적 → 전환 이양
  M.pour('B'); tick(2);
  ok('붓기 B: 세 물감 = 거의 검정(lum<0.02)', P.lum(M.dish())<0.02);
  ok('아직 배반 없음(어둠은 배반이 아니다)', S.betrayed===false);
  tick(70);
  ok('정적 0.9s → 전환(shift) 진입', S.phase==='shift' || S.phase==='light');

  // 전환 중 입력 무시(이양)
  if(S.phase==='shift'){
    M.pour('R'); M.hang('R'); tick(1);
    ok('전환 중 입력 무시', S.hung.R===false);
  } else { ok('전환 중 입력 무시', true); }
  tick(80);
  ok('전환 완료 → light(빛의 세계)', S.phase==='light');

  // 걸다 ①② 빨강·초록 — 겹침 = addMix 노랑 정확(E1 정합)
  M.hang('R'); M.hang('G'); tick(2);
  var y=P.addMix(P.LIGHTS.R, P.LIGHTS.G);
  ok('빨강빛+초록빛 = (1,1,0) 노랑 정확', S.hung.R && S.hung.G && y[0]===1 && y[1]===1 && y[2]===0);
  ok('두 빛으로는 아직 배반 없음', S.betrayed===false);

  // 걸다 ③ 파랑 — 하양 → 정적 0.5s → betray
  M.hang('B'); tick(2);
  ok('세 빛 걸림·하양 = (1,1,1) 정확',
     S.hung.B && eq3(P.mixAll(P.addMix,[P.LIGHTS.R,P.LIGHTS.G,P.LIGHTS.B]), [1,1,1]));
  tick(40);
  ok('정적 → 배반 발화', S.betrayed===true);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__A3, S=M.S, P=M.PURE;
    tick(8);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    ok('여운 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운 수식(두 세계에서 거꾸로)', f && /거꾸로 흘렀다/.test(f.innerHTML));
    ok('전제 한 줄 표시됨', win.document.getElementById('premise').classList.contains('is-in'));
    ok('명판(RGB·CMY 거울)', /CMY/.test(win.document.body.innerHTML));
    ok('티켓 a3_light 발급', win.localStorage.getItem('kmuseum.tickets') && /a3_light/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 = 색의 고리 — 임의 쌍에서 거울 정리 실측(E1 정합)
    var slider=win.document.querySelector('#reexp input');
    slider.value='135'; slider.dispatchEvent(new win.Event('input')); tick(3);
    var hp=M.huePair();
    ok('슬라이더: hue 135° 반영', Math.abs(hp[0]-135*Math.PI/180)<1e-9);
    var a=P.hueColor(hp[0]), b=P.hueColor(hp[1]);
    var pa=P.paintOf(hp[0]), pb=P.paintOf(hp[1]);
    ok('거울 실측: 빛은 밝아지고', P.lum(P.addMix(a,b)) >= Math.max(P.lum(a),P.lum(b))-1e-12);
    ok('거울 실측: 물감은 어두워진다', P.lum(P.paintMix(pa,pb)) < Math.min(P.lum(pa),P.lum(pb)));

    // 여운 재걸기 — 내렸다 다시 걸어도 재배반 없음
    M.unhang('B'); tick(2);
    ok('여운: 등 내리기 허용', S.hung.B===false);
    M.hang('B'); tick(30);
    ok('재걸기 = 재배반 없음', S.hung.B===true && S.phase==='after' && win.Museum.isLocked()===false);

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
