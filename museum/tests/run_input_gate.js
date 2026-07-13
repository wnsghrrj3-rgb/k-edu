/* run_input_gate.js — ★입력 게이트(§5.5) 전 전시 일괄 검증
   M4·M7 정지화면 사건의 형제: E2는 무대 훅(window.__XX)을 직접 찔러 막을 넘기므로,
   실제 손이 닿는 경로가 죽어 있어도 E2는 전부 초록이다. 실기기에서만 죽는다.
   준호의 무대는 전자칠판 — 아래 셋은 그 위에서 상시로 터진다:

     ① 놓친 손   — 손이 캔버스를 벗어나면 pointermove가 끊긴다("끌다가 만다")
     ② 굳은 손   — pointerup을 canvas에 건 전시는 밖에서 뗀 손을 영영 못 받는다
                    → dragging이 참인 채로 남아, 이후 스치는 손에도 세계가 끌려간다
     ③ 취소된 손 — 팜 리젝션·제스처 가로채기는 pointerup 없이 pointercancel만 보낸다

   Museum.grip(canvas)이 셋을 한자리에서 막는다. 이 게이트는 그것이
   전 드래그 전시에 실제로 붙어 있고 실제로 작동하는지를 전수로 단언한다.
   신규 전시는 이 게이트 없이 라이브 금지.

   ※ M1 가우스의 방은 pointer 이전 세대(mouse+touch 이중)이며 준호 실기기 검수 통과분 —
     칠판 게이트와 같은 기준으로 구조 검사만 하고 grip 대상에서 제외한다. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

/* 드래그·홀드 전시 — 손이 눌린 채 이동하거나 머무는 전시. grip 필수. */
var DRAG = [
  ['math/ex03_ulam.html','M3 아무도 모르는 줄무늬'],
  ['math/ex04_mobius.html','M4 가위의 배신'],
  ['math/ex05_hotel.html','M5 끝없는 호텔'],
  ['math/ex06_nines.html','M6 0.999…의 방'],
  ['math/ex08_fold.html','M8 접어서 달까지'],
  ['math/ex09_galton.html','M9 우연이 만드는 산'],
  ['science/ex01_wave.html','C1 진자의 파도'],
  ['science/ex02_chladni.html','C2 소리가 그리는 그림'],
  ['science/ex03_checker.html','C3 속지 마 눈'],
  ['science/ex05_crown.html','C5 물방울의 왕관'],
  ['art/ex02_anamorph.html','A2 엉망진창의 정체'],
  ['art/ex03_light.html','A3 빛은 거꾸로'],
  ['art/ex04_zoetrope.html','A4 12장의 마법'],
  ['social/ex02_year.html','S2 지구의 1년'],
  ['social/ex04_share.html','S4 만 원의 해부'],
  ['social/ex05_time.html','S5 짜장면 타임머신'],
  ['social/ex07_snowball.html','S7 눈덩이의 방'],
  ['social/ex08_map.html','S8 거짓말하는 지도'],
  ['social/ex10_fold.html','S10 한반도를 접는 방']
];

/* 탭 전시 — 누르는 순간 끝난다(드래그 없음). grip 불필요, 손이 닿기만 하면 된다. */
var TAP = [
  ['math/ex01_gauss.html','M1 가우스의 방'],
  ['math/ex02_pascal.html','M2 숨은 그림'],
  ['math/ex07_chess.html','M7 체스판의 공포'],
  ['math/ex10_birthday.html','M10 생일 쌍둥이'],
  ['math/ex11_monty.html','M11 바꿔야 이기는 문'],
  ['science/ex04_starlight.html','C4 별빛의 시간'],
  ['social/ex06_room.html','S6 무역 없는 방'],
  ['social/ex09_village.html','S9 100명의 마을']
];

var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');

/* museum.js 뒤에 스파이를 끼운다 — grip 호출과, grip이 아닌 "전시 소유" 손 핸들러를 구분해 기록 */
var SPY = [
  '<script>(function(){',
  '  var W=window; W.__gripped=[]; W.__inGrip=false; W.__capture=0;',
  '  W.__hands={};',                                   // type → [전시 소유 리스너 호출 횟수]
  '  var g=W.Museum.grip;',
  '  W.Museum.grip=function(c){ W.__inGrip=true; try{ return g(c); } finally { W.__inGrip=false; W.__gripped.push(c); } };',
  '  var add=EventTarget.prototype.addEventListener;',
  '  EventTarget.prototype.addEventListener=function(type, fn, opt){',
  '    if(/^pointer|^touch|^mouse/.test(type) && typeof fn==="function" && !W.__inGrip){',
  '      var box=(W.__hands[type]=W.__hands[type]||{n:0});',
  '      var wrapped=function(e){ box.n++; return fn.apply(this, arguments); };',
  '      return add.call(this, type, wrapped, opt);',
  '    }',
  '    return add.call(this, type, fn, opt);',
  '  };',
  '})();</script>'
].join('\n');

function boot(file){
  var html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>\n'+SPY);
  html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

  var rafQueue=[], vclock=1000;
  function nowFn(){ vclock+=16; return vclock; }
  function gradientStub(){ return { addColorStop:function(){} }; }
  function ctxStub(){
    var c={ globalAlpha:1, textAlign:'left', font:'', lineWidth:1, fillStyle:'', strokeStyle:'', globalCompositeOperation:'source-over', filter:'none', lineCap:'butt', lineJoin:'miter', shadowBlur:0, shadowColor:'' };
    ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
     'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
     'drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse','setLineDash',
     'createPattern','putImageData','transform','resetTransform','fillText','strokeText'].forEach(function(m){ c[m]=function(){}; });
    c.measureText=function(t){ return {width:String(t).length*11}; };
    c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
    c.getImageData=function(){ return { data:new Uint8ClampedArray(4) }; };
    c.canvas={width:1366,height:768};
    return c;
  }
  var dom=new JSDOM(html,{
    runScripts:'dangerously', pretendToBeVisual:true,
    url:'https://keduclass.com/museum/'+file,
    beforeParse:function(win){
      win.HTMLCanvasElement.prototype.getContext=function(){ return ctxStub(); };
      win.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:1366,height:768}; };
      // jsdom에는 포인터 캡처가 없다 — 호출 여부만 센다(캡처 의미론은 브라우저가 보장)
      win.HTMLCanvasElement.prototype.setPointerCapture=function(){ win.__capture=(win.__capture||0)+1; };
      win.HTMLCanvasElement.prototype.releasePointerCapture=function(){};
      Object.defineProperty(win,'devicePixelRatio',{value:1});
      win.matchMedia=function(){ return {matches:false, addEventListener:function(){}, addListener:function(){}}; };
      win.requestAnimationFrame=function(fn){ rafQueue.push(fn); return rafQueue.length; };
      win.cancelAnimationFrame=function(){};
      if(!win.performance) win.performance={};
      win.performance.now=nowFn;
      function nodeStub(){ return { connect:function(){}, disconnect:function(){}, start:function(){}, stop:function(){},
        frequency:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
        gain:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
        type:'sine', buffer:null, loop:false, Q:{value:0}, detune:{value:0} }; }
      win.AudioContext=function(){ return {
        currentTime:0, destination:{}, sampleRate:44100, state:'running', resume:function(){},
        createOscillator:nodeStub, createGain:nodeStub, createBiquadFilter:nodeStub,
        createBufferSource:nodeStub, createBuffer:function(){ return { getChannelData:function(){ return new Float32Array(8); } }; },
        createDynamicsCompressor:nodeStub, createStereoPanner:nodeStub, createConvolver:nodeStub
      }; };
      win.localStorage.clear();
    }
  });
  var win=dom.window;
  function tick(sec){
    var steps=Math.max(1, Math.round(sec/0.016));
    for(var i=0;i<steps;i++){
      var q=rafQueue.slice(); rafQueue.length=0;
      q.forEach(function(fn){ try{ fn(vclock); }catch(e){} });
      nowFn();
    }
  }
  return { win:win, tick:tick, canvas:win.document.querySelector('canvas') };
}

/* 손 이벤트 발사 — jsdom엔 PointerEvent가 없으므로 코어와 같은 폴백을 쓴다 */
function hand(win, target, type, x, y, id){
  var ev;
  try{ ev = new win.PointerEvent(type, {pointerId:id||1, clientX:x, clientY:y, bubbles:true, cancelable:true}); }
  catch(_){
    ev = win.document.createEvent('Event');
    ev.initEvent(type, true, true);
    try{
      Object.defineProperty(ev,'pointerId',{value:id||1});
      Object.defineProperty(ev,'clientX',{value:x});
      Object.defineProperty(ev,'clientY',{value:y});
    }catch(__){ ev.pointerId=id||1; ev.clientX=x; ev.clientY=y; }
  }
  target.dispatchEvent(ev);
  return ev;
}
function upCount(win){ var h=win.__hands['pointerup']; return h?h.n:0; }

var pass=0, fail=0;
function ok(ex,name,cond){
  if(cond) pass++;
  else { fail++; process.stdout.write('  x '+ex+' — '+name+'\n'); }
}

/* ── 드래그·홀드 전시 5항 ─────────────────────────────────────────── */
DRAG.forEach(function(row){
  var file=row[0], name=row[1], b;
  try { b=boot(file); } catch(e){ ok(name,'부팅', false); return; }
  b.tick(1.2);
  var win=b.win, cv=b.canvas;

  ok(name, '① grip이 붙어 있다', (win.__gripped||[]).indexOf(cv) >= 0);
  ok(name, '② 전시가 손을 뗄 자리를 갖는다(pointerup 핸들러)', !!win.__hands['pointerup']);

  // 손을 잡는다 — 캡처가 걸려야 캔버스 밖으로 나가도 손을 놓치지 않는다
  var cap0 = win.__capture;
  hand(win, cv, 'pointerdown', 700, 450);
  b.tick(0.1);
  ok(name, '③ 잡는 순간 포인터를 캡처한다(놓친 손 방어)', win.__capture > cap0);

  // 캔버스 밖으로 끌고 나간다 — 실브라우저에선 캡처 덕에 move가 계속 온다
  hand(win, cv, 'pointermove', 900, 470);
  hand(win, cv, 'pointermove', 1500, 900);   // 캔버스 밖
  b.tick(0.1);

  // ★취소된 손 — pointerup 없이 pointercancel만 온다(전자칠판 팜 리젝션)
  var up0 = upCount(win);
  hand(win, cv, 'pointercancel', 1500, 900);
  b.tick(0.1);
  ok(name, '④ 취소된 손이 풀린다(pointercancel → 손을 뗀다)', upCount(win) > up0);

  // ★캡처 상실 — 브라우저가 포인터를 뺏어간 경우
  hand(win, cv, 'pointerdown', 700, 450, 2);
  b.tick(0.05);
  var up1 = upCount(win);
  hand(win, cv, 'lostpointercapture', 700, 450, 2);
  b.tick(0.05);
  ok(name, '⑤ 빼앗긴 손이 풀린다(lostpointercapture → 손을 뗀다)', upCount(win) > up1);
});

/* ── 탭 전시 1항 — 손이 닿기만 하면 된다 ──────────────────────────── */
TAP.forEach(function(row){
  var file=row[0], name=row[1], b;
  try { b=boot(file); } catch(e){ ok(name,'부팅', false); return; }
  b.tick(1.2);
  var h=b.win.__hands||{};
  ok(name, '① 손이 닿는다(pointerdown 또는 touchstart)', !!(h['pointerdown'] || h['touchstart'] || h['mousedown']));
});

console.log('\n입력 게이트: '+pass+'/'+(pass+fail)+' 통과  (드래그 '+DRAG.length+'전시 × 5항 + 탭 '+TAP.length+'전시 × 1항)');
process.exit(fail ? 1 : 0);
