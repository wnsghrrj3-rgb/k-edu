/* ============================================================================
   케이랩 도구 모듈 — 입자/상태변화 (states) v2  [과학 2호]
   3학년 물질의 상태 / 4학년 물의 상태변화.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 상태 전환 시각화 — 0℃ 부근(녹는·어는 중)·100℃ 부근(끓는·식는 중)에서
        입자가 한꺼번에 안 바뀌고 비율로 섞이며 전환. 끓을 땐 기포처럼 떠오름.
     ▸ 전환 용어 — 데우는 중이면 융해·기화, 식히는 중이면 응고·액화로 표시.
     ▸ 탐구 미션 3종 — 🧊 얼음·💧 물·☁️ 수증기 만들기. 달성하면 ✓.
   변수 → 현상 → 발견:
     온도 슬라이더(가열🔥/냉각❄️) → 입자 운동·배열 → "상태는 눈에 안 보이는
     입자의 배열·운동 차이" (물 기준 0℃·100℃ 경계).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame)
   - config: { temp(기본25), count(기본28) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('states', function (el, config) {
    var temp=(config.temp!=null)?config.temp:25, N=config.count||28;
    var lastDir=1;                 // +1 데우는 중 / -1 식히는 중 (전환 용어용)
    var BX=250, BY=95, BW=470, BH=300;           // 비커 내부 영역
    var raf=null, t0=Date.now();
    var done={solid:false,liquid:false,gas:false};
    var C={ink:'#1B3A57',sub:'#5a7894',good:'#12B886',cold:'#1971C2',hot:'#E8590C'};
    var btn='font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function clamp(v,a,b){return Math.max(a,Math.min(v,b));}

    // ── 물리: 온도 → 자유도(고체→액체)·기화비율(액체→기체)·속도
    function liqFrac(t){ if(t<=-3)return 0; if(t>=3)return 1; return (t+3)/6; }      // 0℃ 부근 녹음
    function gasFrac(t){ if(t<=97)return 0; if(t>=103)return 1; return (t-97)/6; }   // 100℃ 부근 끓음
    function speed(t){return 0.22+(clamp(t,-20,120)+20)/140*3.3;}
    function phase(t){ if(t<-3)return 'solid'; if(t<3)return 'melt'; if(t<97)return 'liquid'; if(t<103)return 'boil'; return 'gas'; }

    // 입자 초기화 (격자 평형 위치 + 전환 임계값)
    var cols=7, rows=Math.ceil(N/cols), gx=BW/(cols+1), gy=Math.min(40,BH/(rows+1)), ps=[];
    for(var i=0;i<N;i++){var c=i%cols, r=Math.floor(i/cols);
      var ex=BX+gx*(c+1), ey=BY+BH-gy*(r+1)-10;
      ps.push({eqx:ex,eqy:ey,x:ex,y:ey,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2,
               ph:Math.random()*6.28, thr:Math.random(), thrG:Math.random(), el:null});}

    var MISSIONS=[
      {k:'solid', l:'🧊 얼음 만들기', tip:'0℃보다 낮게 식혀요'},
      {k:'liquid',l:'💧 물 만들기',   tip:'0~100℃ 사이로 맞춰요'},
      {k:'gas',   l:'☁️ 수증기 만들기',tip:'100℃보다 높이 데워요'}
    ];

    function buildUI(){
      var chips=MISSIONS.map(function(m){return '<button class="st-chip'+(done[m.k]?' done':'')+'" data-k="'+m.k+'" style="font-size:17px;padding:8px 14px;border-radius:13px;border:2.5px solid #C9D7E6;background:#fff;color:'+C.sub+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">'+(done[m.k]?'✓ ':'')+m.l+'</button>';}).join('');
      el.innerHTML='<style>.st-btn:active,.st-chip:active{transform:translateY(2px);}'
        +'.st-chip.done{background:#E6FCF5 !important;border-color:'+C.good+' !important;color:'+C.good+' !important;}'
        +'.st-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#4DABF7,#FFD43B,#FF6B6B);outline:none;}'
        +'.st-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.st-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:9px;flex-wrap:wrap;"><span style="font-size:16px;color:'+C.sub+';align-self:center;font-weight:800;">미션</span>'+chips+'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
          +'<button class="st-btn" data-act="cool" style="'+btn+'background:#fff;color:'+C.cold+';border-color:'+C.cold+';">❄️ 식히기</button>'
          +'<input class="st-range" type="range" min="-20" max="120" value="'+temp+'" style="width:min(44vw,300px);">'
          +'<button class="st-btn" data-act="heat" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 데우기</button>'
        +'</div>'
        +'<div class="st-stage" style="width:100%;height:44vh;min-height:330px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="st-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      drawStage(); bind(); renderStatus(); loop();
    }

    var stage, mercuryEl, partsLayer, bubbleLayer;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML=
         '<radialGradient id="stSol" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1864AB"/></radialGradient>'
        +'<radialGradient id="stLiq" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#A5D8FF"/><stop offset="100%" stop-color="#1C7ED6"/></radialGradient>'
        +'<radialGradient id="stGas" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#E9ECEF"/><stop offset="100%" stop-color="#ADB5BD"/></radialGradient>';
      svg.appendChild(d);
      // 온도계
      var TX=140, TT=70, TB=380;
      svg.appendChild(svgEl('rect',{x:TX-13,y:TT,width:26,height:TB-TT,rx:13,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:24,fill:'#fff',stroke:'#ADB5BD','stroke-width':3}));
      mercuryEl=svgEl('rect',{x:TX-7,y:TT,width:14,height:0,rx:7,fill:'#FA5252'}); svg.appendChild(mercuryEl);
      svg.appendChild(svgEl('circle',{cx:TX,cy:TB+18,r:15,fill:'#FA5252'}));
      [[0,'0℃ 어는점','#1971C2'],[100,'100℃ 끓는점','#E8590C']].forEach(function(m){var yy=TB-((m[0]+20)/140)*(TB-TT);
        svg.appendChild(svgEl('line',{x1:TX-16,y1:yy,x2:TX+30,y2:yy,stroke:m[2],'stroke-width':2.5,'stroke-dasharray':'5 4'}));
        var tx=svgEl('text',{x:TX+34,y:yy+6,'font-family':'Jua,sans-serif','font-size':16,fill:m[2],'font-weight':800});tx.textContent=m[1];svg.appendChild(tx);});
      mercuryEl._tt=TT; mercuryEl._tb=TB;
      // 비커
      svg.appendChild(svgEl('path',{d:'M '+(BX-14)+' '+(BY-8)+' L '+(BX-14)+' '+(BY+BH+16)+' Q '+(BX-14)+' '+(BY+BH+30)+' '+BX+' '+(BY+BH+30)+' L '+(BX+BW)+' '+(BY+BH+30)+' Q '+(BX+BW+14)+' '+(BY+BH+30)+' '+(BX+BW+14)+' '+(BY+BH+16)+' L '+(BX+BW+14)+' '+(BY-8),fill:'rgba(214,234,248,0.4)',stroke:'#74A4C9','stroke-width':4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      bubbleLayer=svgEl('g',{}); svg.appendChild(bubbleLayer);
      partsLayer=svgEl('g',{}); svg.appendChild(partsLayer);
      ps.forEach(function(p){p.el=svgEl('circle',{cx:p.x,cy:p.y,r:12,fill:'url(#stLiq)',stroke:'#1864AB','stroke-width':1.5}); partsLayer.appendChild(p.el);});
      stage.appendChild(svg);
    }

    function loop(){ update(); raf=requestAnimationFrame(loop); }
    function update(){
      var lf=liqFrac(temp), gf=gasFrac(temp), sp=speed(temp), now=(Date.now()-t0)/300;
      var amp=2.0+Math.max(0,(temp+20))/140*2.0;     // 격자 진동 폭(온도↑ 조금 커짐)
      for(var i=0;i<ps.length;i++){var p=ps[i];
        var free=(lf>p.thr), gas=(gf>p.thrG);
        if(!free){ // 고체 — 격자 진동
          p.x=p.eqx+Math.sin(now+p.ph)*amp; p.y=p.eqy+Math.cos(now*1.1+p.ph)*amp;
          p.vx=(Math.random()-0.5)*2; p.vy=(Math.random()-0.5)*2;
        } else {   // 액체/기체 — 자유 운동
          p.x+=p.vx*sp; p.y+=p.vy*sp;
          var top=gas?(BY+6):(BY+BH*0.34);
          if(p.x<BX+12){p.x=BX+12;p.vx=Math.abs(p.vx);} if(p.x>BX+BW-12){p.x=BX+BW-12;p.vx=-Math.abs(p.vx);}
          if(p.y<top){p.y=top;p.vy=Math.abs(p.vy);} if(p.y>BY+BH-12){p.y=BY+BH-12;p.vy=-Math.abs(p.vy);}
          if(gas){ p.vy-=0.05; if(p.vy<-2.6)p.vy=-2.6; }   // 기체 부력(위로)
          else { p.vy+=0.045; }                            // 액체 약한 중력(아래 고임)
        }
        if(p.el){p.el.setAttribute('cx',p.x.toFixed(1));p.el.setAttribute('cy',p.y.toFixed(1));
          p.el.setAttribute('fill', gas?'url(#stGas)':(free?'url(#stLiq)':'url(#stSol)'));}
      }
      // 끓는 중 기포 (바닥에서 솟는 작은 거품)
      if(bubbleLayer){ bubbleLayer.innerHTML='';
        if(phase(temp)==='boil'||phase(temp)==='gas'){
          var nb=phase(temp)==='gas'?5:3;
          for(var b=0;b<nb;b++){var tt=((now*0.6+b*1.7)%1);
            var bx=BX+60+((b*137)%(BW-120)), by=BY+BH-10-tt*(BH-40), rr=4+tt*5;
            bubbleLayer.appendChild(svgEl('circle',{cx:bx,cy:by,r:rr,fill:'none',stroke:'#A5D8FF','stroke-width':2,'stroke-opacity':(1-tt)*0.8}));}
        }
      }
      if(mercuryEl){var f=(clamp(temp,-20,120)+20)/140, h=(mercuryEl._tb-mercuryEl._tt)*f;
        mercuryEl.setAttribute('y',(mercuryEl._tb-h).toFixed(1)); mercuryEl.setAttribute('height',h.toFixed(1));}
    }

    function renderStatus(){
      var p=phase(temp), s=el.querySelector('.st-status'), nm,col,sub;
      if(p==='solid'){nm='고체 (얼음)';col=C.cold;sub='입자가 제자리에서 규칙적으로 정렬해 진동만 해요. 모양도 부피도 일정해요.';}
      else if(p==='melt'){
        if(lastDir>=0){nm='융해 — 녹는 중';sub='0℃ 부근에서 얼음(고체) 입자가 하나둘 풀려나 물(액체)이 돼요. 고체와 액체가 섞여 있어요.';}
        else{nm='응고 — 어는 중';sub='0℃ 부근에서 물(액체) 입자가 하나둘 제자리를 잡아 얼음(고체)이 돼요.';}
        col=C.cold;
      }
      else if(p==='liquid'){nm='액체 (물)';col='#1C7ED6';sub='입자가 서로 붙어 있지만 자유롭게 미끄러져요. 부피는 그대로, 모양은 그릇에 따라 변해요.';}
      else if(p==='boil'){
        if(lastDir>=0){nm='기화 — 끓는 중';sub='100℃ 부근에서 물(액체) 입자가 빠르게 튀어 올라 수증기(기체)가 돼요. 거품이 올라와요.';}
        else{nm='액화 — 식는 중';sub='100℃ 부근에서 수증기(기체) 입자가 다시 모여 물(액체)이 돼요.';}
        col=C.hot;
      }
      else{nm='기체 (수증기)';col='#868E96';sub='입자가 멀리 흩어져 빠르게 날아다녀요. 공간을 가득 채워요.';}
      s.innerHTML='<div style="font-size:29px;color:'+col+';">'+temp+'℃ — '+nm+'</div>'
        +'<div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
      checkMission(p);
    }

    function checkMission(p){
      if(p==='solid')done.solid=true; else if(p==='liquid')done.liquid=true; else if(p==='gas')done.gas=true;
      el.querySelectorAll('.st-chip').forEach(function(c){var k=c.dataset.k;
        if(done[k]&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
      if(done.solid&&done.liquid&&done.gas){
        var s=el.querySelector('.st-status');
        if(s&&s.innerHTML.indexOf('세 가지')<0)s.innerHTML+='<div style="font-size:19px;color:'+C.good+';margin-top:6px;">세 가지 상태를 모두 만들었어요! ✨ 온도만 바꿨는데 입자 모습이 이렇게 달라져요.</div>';
      }
    }

    function setTemp(v){ var prev=temp; temp=clamp(Math.round(v),-20,120);
      if(temp>prev)lastDir=1; else if(temp<prev)lastDir=-1;
      var r=el.querySelector('.st-range'); if(r&&+r.value!==temp)r.value=temp; renderStatus(); }

    function bind(){
      el.querySelector('.st-range').addEventListener('input',function(e){setTemp(+e.target.value);});
      el.querySelector('[data-act="heat"]').addEventListener('click',function(){setTemp(temp+15);});
      el.querySelector('[data-act="cool"]').addEventListener('click',function(){setTemp(temp-15);});
      el.querySelectorAll('.st-chip').forEach(function(c){c.addEventListener('click',function(){
        var m=MISSIONS.filter(function(x){return x.k===c.dataset.k;})[0];
        var s=el.querySelector('.st-status');
        if(s&&m)s.innerHTML='<div style="font-size:22px;color:'+C.ink+';">'+m.l+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:6px;">'+m.tip+'</div>';
      });});
    }
    buildUI();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
