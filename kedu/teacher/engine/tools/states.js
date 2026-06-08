/* ============================================================================
   케이랩 도구 모듈 — 입자/상태변화 (states) v1  [과학 2호]
   3학년 물질의 상태 / 4학년 물의 상태변화.
     변수 → 현상 → 발견:
       ▸ 온도 슬라이더(가열🔥/냉각❄️)
       ▸ 온도↑ → 입자가 빨라지고 멀어짐: 고체(규칙적 격자·진동) → 액체(붙어서 미끄러짐)
         → 기체(흩어져 빠르게 날아다님)
       ▸ "상태는 눈에 안 보이는 입자의 배열·운동 차이" (물 기준 0℃·100℃ 경계)
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   - config: { temp(기본25), count(기본24) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('states', function (el, config) {
    var temp=(config.temp!=null)?config.temp:25, N=config.count||24;
    var BX=250, BY=95, BW=470, BH=300;           // 비커 내부 영역
    var raf=null, t0=Date.now();
    var btn='font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    function stateOf(t){return t<0?'solid':(t<=100?'liquid':'gas');}
    function clamp(v,a,b){return Math.max(a,Math.min(v,b));}
    function speed(t){return 0.25+ (clamp(t,-20,120)+20)/140*3.2;}   // 0.25~3.45

    // 입자 초기화 (격자 평형 위치)
    var cols=6, rows=Math.ceil(N/cols), gx=BW/(cols+1), gy=Math.min(40,BH/(rows+1)), ps=[];
    for(var i=0;i<N;i++){var c=i%cols, r=Math.floor(i/cols);
      var ex=BX+gx*(c+1), ey=BY+BH-gy*(r+1)-10;
      ps.push({eqx:ex,eqy:ey,x:ex,y:ey,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,ph:Math.random()*6.28,el:null});}

    function buildUI(){
      el.innerHTML='<style>.st-btn:active{transform:translateY(2px);}'
        +'.st-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.st-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.st-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'</style>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
          +'<button class="st-btn" data-act="cool" style="'+btn+'background:#fff;color:#1971C2;border-color:#1971C2;">❄️ 식히기</button>'
          +'<input class="st-range" type="range" min="-20" max="120" value="'+temp+'" style="width:min(46vw,320px);">'
          +'<button class="st-btn" data-act="heat" style="'+btn+'background:#fff;color:#E8590C;border-color:#E8590C;">🔥 데우기</button>'
        +'</div>'
        +'<div class="st-stage" style="width:100%;height:46vh;min-height:340px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="st-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
      drawStage(); bind(); loop();
    }

    var stage, mercuryEl, partsLayer;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<radialGradient id="stP" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1C7ED6"/></radialGradient>'
        +'<radialGradient id="stG" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#E9ECEF"/><stop offset="100%" stop-color="#ADB5BD"/></radialGradient>';
      svg.appendChild(d);
      // 온도계
      var TX=140, TT=70, TB=380;
      svg.appendChild(svgEl('rect',{x:TX-13,y:TT,width:26,height:TB-TT,rx:13,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:24,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      mercuryEl=svgEl('rect',{x:TX-7,y:TT,width:14,height:0,rx:7,fill:'#FA5252'}); svg.appendChild(mercuryEl);
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:15,fill:'#FA5252'}));
      [[0,'0℃'],[100,'100℃']].forEach(function(m){var yy=TB-((m[0]+20)/140)*(TB-TT);
        svg.appendChild(svgEl('line',{x1:TX+14,y1:yy,x2:TX+30,y2:yy,stroke:'#868E96','stroke-width':2}));
        var tx=svgEl('text',{x:TX+34,y:yy+6,'font-family':'Jua,sans-serif','font-size':18,fill:'#495057'});tx.textContent=m[1];svg.appendChild(tx);});
      mercuryEl._tt=TT; mercuryEl._tb=TB;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(BX-14)+' '+(BY-8)+' L '+(BX-14)+' '+(BY+BH+16)+' Q '+(BX-14)+' '+(BY+BH+30)+' '+BX+' '+(BY+BH+30)+' L '+(BX+BW)+' '+(BY+BH+30)+' Q '+(BX+BW+14)+' '+(BY+BH+30)+' '+(BX+BW+14)+' '+(BY+BH+16)+' L '+(BX+BW+14)+' '+(BY-8),fill:'rgba(214,234,248,0.4)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      partsLayer=svgEl('g',{}); svg.appendChild(partsLayer);
      ps.forEach(function(p){p.el=svgEl('circle',{cx:p.x,cy:p.y,r:12,fill:'url(#stP)',stroke:'#1864AB','stroke-width':1.5}); partsLayer.appendChild(p.el);});
      stage.appendChild(svg);
    }

    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var st=stateOf(temp), sp=speed(temp), now=(Date.now()-t0)/300;
      for(var i=0;i<ps.length;i++){var p=ps[i];
        if(st==='solid'){ p.x=p.eqx+Math.sin(now+p.ph)*2.2; p.y=p.eqy+Math.cos(now*1.1+p.ph)*2.2; }
        else {
          p.x+=p.vx*sp; p.y+=p.vy*sp;
          var top = (st==='gas')? BY+6 : BY+BH*0.32;   // 액체는 아래쪽에 고임 / 기체는 전체
          if(p.x<BX+12){p.x=BX+12;p.vx=Math.abs(p.vx);} if(p.x>BX+BW-12){p.x=BX+BW-12;p.vx=-Math.abs(p.vx);}
          if(p.y<top){p.y=top;p.vy=Math.abs(p.vy);} if(p.y>BY+BH-12){p.y=BY+BH-12;p.vy=-Math.abs(p.vy);}
          if(st==='liquid'){p.vy+=0.04;}              // 약한 중력 → 바닥에 고임
        }
        if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));
          p.el.setAttribute('fill', st==='gas'?'url(#stG)':'url(#stP)');}
      }
      // 온도계 수은
      if(mercuryEl){var f=(clamp(temp,-20,120)+20)/140, h=(mercuryEl._tb-mercuryEl._tt)*f;
        mercuryEl.setAttribute('y',(mercuryEl._tb-h).toFixed(1)); mercuryEl.setAttribute('height',h.toFixed(1));}
    }

    function renderStatus(){
      var st=stateOf(temp), s=el.querySelector('.st-status'), nm,col,sub;
      if(st==='solid'){nm='고체 (얼음)';col='#1971C2';sub='입자가 제자리에서 규칙적으로 정렬해 진동만 해요. 모양도 부피도 일정해요.';}
      else if(st==='liquid'){nm='액체 (물)';col='#1C7ED6';sub='입자가 서로 붙어 있지만 자유롭게 미끄러져요. 부피는 그대로, 모양은 그릇에 따라 변해요.';}
      else{nm='기체 (수증기)';col='#868E96';sub='입자가 멀리 흩어져 빠르게 날아다녀요. 공간을 가득 채워요.';}
      s.innerHTML='<div style="font-size:30px;color:'+col+';">'+temp+'℃ — '+nm+'</div><div style="font-size:18px;color:#5a7894;margin-top:6px;line-height:1.4;">'+sub+'</div>';
    }
    function setTemp(v){temp=clamp(Math.round(v),-20,120);var r=el.querySelector('.st-range');if(r&&+r.value!==temp)r.value=temp;renderStatus();}

    function bind(){
      el.querySelector('.st-range').addEventListener('input',function(e){setTemp(+e.target.value);});
      el.querySelector('[data-act="heat"]').addEventListener('click',function(){setTemp(temp+15);});
      el.querySelector('[data-act="cool"]').addEventListener('click',function(){setTemp(temp-15);});
    }
    buildUI(); renderStatus();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
