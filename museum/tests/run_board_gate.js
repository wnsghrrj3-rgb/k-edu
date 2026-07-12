/* run_board_gate.js — ★칠판 게이트(§8.6) 전 전시 일괄 검증
   준호 실기기 확진: "뭘 의미하는지 모르겠다" — 문제가 없으면 배반할 예측이 생기지 않는다.
   그래서 모든 전시는 다음을 만족해야 한다(전시 하나라도 어기면 반려):
     ① 무대에 칠판이 있다(Museum.board 부품 — 손으로 그린 칠판 금지)
     ② 문제 한 줄이 1막부터 무대에 상주한다(실제로 화면에 그려지는지 fillText로 확인)
     ③ 문제는 질문이다(물음표) — 관람자가 무엇을 보는지 알 수 있어야 한다
     ④ 여운에서 칠판이 답이 된다(문장 교체 + 무대 한가운데로 하강)
     ⑤ 칠판은 진행도를 적지 않는다(수치·퍼센트·n/N 금지 — §8.5 원칙3 유지)
   부팅만으로 검사하므로 전시별 E2가 없는 전시(M4·M7·M8·M10·M11)도 여기서 걸린다. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var EXHIBITS = [
  ['math/ex02_pascal.html','M2 숨은 그림'],
  ['math/ex03_ulam.html','M3 아무도 모르는 줄무늬'],
  ['math/ex04_mobius.html','M4 가위의 배신'],
  ['math/ex05_hotel.html','M5 끝없는 호텔'],
  ['math/ex06_nines.html','M6 0.999…의 방'],
  ['math/ex07_chess.html','M7 체스판의 공포'],
  ['math/ex08_fold.html','M8 접어서 달까지'],
  ['math/ex09_galton.html','M9 우연이 만드는 산'],
  ['math/ex10_birthday.html','M10 생일 쌍둥이'],
  ['math/ex11_monty.html','M11 바꿔야 이기는 문'],
  ['science/ex01_wave.html','C1 진자의 파도'],
  ['science/ex02_chladni.html','C2 소리가 그리는 그림'],
  ['science/ex03_checker.html','C3 속지 마 눈'],
  ['science/ex04_starlight.html','C4 별빛의 시간'],
  ['science/ex05_crown.html','C5 물방울의 왕관'],
  ['art/ex02_anamorph.html','A2 엉망진창의 정체'],
  ['art/ex03_light.html','A3 빛은 거꾸로'],
  ['art/ex04_zoetrope.html','A4 12장의 마법'],
  ['social/ex02_year.html','S2 지구의 1년'],
  ['social/ex05_time.html','S5 짜장면 타임머신'],
  ['social/ex07_snowball.html','S7 눈덩이의 방'],
  ['social/ex08_map.html','S8 거짓말하는 지도'],
  ['social/ex09_village.html','S9 100명의 마을'],
  ['social/ex10_fold.html','S10 한반도를 접는 방']
];

// 진행도 어휘 — 칠판에 있으면 §8.5 원칙3 위반
var PROGRESS = /\d+\s*\/\s*\d+|\d+\s*%|퍼센트|진행률|남은\s*\d+개/;

/* M1 가우스의 방은 칠판 문법의 원조 — 자체 칠판(수식이 분필로 쓰이고 지워지는 노동)을
   갖고 있고 준호 실기기 검수를 통과했다. S6·S4도 부품 이전에 태어난 자체 칠판이다.
   이 셋은 부품으로 대체하지 않는다(게이트 대상 제외 — 준호 실기기로 이미 검증됨). */

var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');

function boot(file){
  var html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
  html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

  var drawn=[];                                     // 화면에 실제로 그려진 글자
  var rafQueue=[], vclock=1000;
  function nowFn(){ vclock+=16; return vclock; }
  function gradientStub(){ return { addColorStop:function(){} }; }
  function ctxStub(){
    var c={ globalAlpha:1, textAlign:'left', font:'', lineWidth:1, fillStyle:'', strokeStyle:'', globalCompositeOperation:'source-over', filter:'none', lineCap:'butt', lineJoin:'miter', shadowBlur:0, shadowColor:'' };
    ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
     'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
     'drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse','setLineDash',
     'createPattern','putImageData','transform','resetTransform'].forEach(function(m){ c[m]=function(){}; });
    c.fillText=function(t){ drawn.push(String(t)); };
    c.strokeText=function(t){ drawn.push(String(t)); };
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
  return { win:win, tick:tick, drawn:drawn };
}

var pass=0, fail=0, failed=[];
function ok(ex,name,cond){
  if(cond) pass++;
  else { fail++; failed.push(ex+' — '+name); process.stdout.write('  x '+ex+' — '+name+'\n'); }
}

EXHIBITS.forEach(function(row){
  var file=row[0], name=row[1], b;
  try { b=boot(file); } catch(e){ ok(name,'부팅', false); return; }
  b.tick(1.6);

  var board = b.win.__BOARD;
  ok(name, '① 칠판이 있다(Museum.board 부품)', !!board && typeof board.mark==='function');
  if(!board) return;

  var q = board._state.question;
  ok(name, '② 문제가 있다', !!q && q.length>4);
  ok(name, '③ 문제는 질문이다', /\?|까요|까\?|을까|를까/.test(q));
  ok(name, '④ 문제가 무대에 상주한다(그려진다)', b.drawn.indexOf(q)>=0);
  ok(name, '⑤ 칠판은 진행도를 적지 않는다', !PROGRESS.test(q) && !PROGRESS.test(board._state.answer||'') && !PROGRESS.test(board.chalk()||''));

  // 여운 — 문제가 답이 되고, 칠판이 무대 한가운데로 내려온다
  var before = board._state.move;
  board.resolve();
  b.tick(1.4);
  var a = board._state.answer;
  ok(name, '⑥ 여운에서 답이 된다', !!a && a!==q && b.drawn.lastIndexOf(a) > b.drawn.lastIndexOf(q));
  ok(name, '⑦ 칠판이 무대 한가운데로 내려온다', board._state.move > before && board._state.move>0.9);
});

console.log('\n칠판 게이트: '+pass+'/'+(pass+fail)+' 통과  ('+EXHIBITS.length+'전시)');
if(fail){ console.log('반려 항목:\n  - '+failed.join('\n  - ')); process.exit(1); }
