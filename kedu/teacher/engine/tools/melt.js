/* ============================================================================
   케이랩 도구 — 상태변화 (melt)  ★실사 스프라이트 + 코드 물리 통합 프리미엄판
   준호의 GPT 실사 PNG(얼음)를 코드 연출과 합쳐 "영상급 비주얼 + 살아있는 조작".
   −20℃ → 120℃ 한 슬라이더(가한 열)로:
     고체 → [0℃ 융해 정체] → 액체 → [100℃ 기화 정체] → 기체
   유리비커 · 찰랑이는 물(파동/윤슬) · 떠오르는 기포 · 모락모락 김 · 떨어지는 물방울 ·
   온도계(어는점/끓는점 정체구간 자동 표시). 슬라이더 거꾸로 = 식히기(응결·응고).
   - 자산: /kedu/teacher/engine/tools/assets/states/{ice,water}.png (루트 절대경로)
   - 의존: window.KLab (SVG 스테이지 + requestAnimationFrame + KLab.sound)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var ICE   = '/kedu/teacher/engine/tools/assets/states/ice.png';
  var WATER = '/kedu/teacher/engine/tools/assets/states/water.png';
  var SVGNS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink';

  window.KLab.register('melt', function (el, config) {
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play){ try{window.KLab.sound.play(n);}catch(e){} } }
    function S(tag, attrs){ var e=document.createElementNS(SVGNS,tag); if(attrs)for(var k in attrs)e.setAttribute(k,attrs[k]); return e; }

    /* ── 무대 좌표계 (viewBox 0 0 780 470) ─────────────────────────── */
    var BX=322, BY=168, BW=336, BH=252;           // 비커 내부
    var BB=BY+BH;                                   // 비커 바닥 y
    var ICE_X=BX+BW/2-78, ICE_W=156, ICE_FULLH=176, ICE_BASE=BB-6;
    var WATER_MAX=232;                              // 물 최대 높이
    var TH_X=120, TH_TOP=180, TH_BOT=392, TH_R=15;  // 온도계 관
    var T_MIN=-20, T_MAX=120;

    /* ── 상태 유도: 가한 열 e(0..100) → 물리량 ─────────────────────── */
    function derive(e){
      var A=15,B=30,C=60,D=85,E=100, t,melt=0,vapor=0,iceH=0,water=0,phase;
      if(e<=A){ t=-20+(e/A)*20; iceH=1; phase='solid'; }
      else if(e<=B){ var f=(e-A)/(B-A); t=0; melt=f; iceH=1-f; water=f; phase='melt'; }
      else if(e<=C){ t=((e-B)/(C-B))*100; water=1; phase='liquid'; }
      else if(e<=D){ var v=(e-C)/(D-C); t=100; vapor=v; water=1-v; phase='boil'; }
      else { t=100+((e-D)/(E-D))*20; vapor=1; phase='steam'; }
      return {t:t,melt:melt,vapor:vapor,iceH:iceH,water:water,phase:phase};
    }
    var LABEL={
      solid:['고체 (얼음)','#1971C2','입자가 제자리에서 규칙적으로 진동만 해요.'],
      melt :['녹는 중 — 융해 (0℃ 정체)','#1C7ED6','열을 받아도 0℃에 머물러요. 얼음이 줄고 물이 늘어요.'],
      liquid:['액체 (물)','#1C7ED6','입자가 서로 미끄러지며 자유롭게 움직여요.'],
      boil :['끓는 중 — 기화 (100℃ 정체)','#E8590C','100℃에 머물며 물이 수증기로 바뀌어 날아가요.'],
      steam:['기체 (수증기)','#E8590C','입자가 멀리 흩어져 빠르게 날아다녀요.']
    };

    /* ── DOM 골격 ──────────────────────────────────────────────────── */
    var btn='font-size:21px;padding:11px 18px;border-radius:15px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;background:#fff;';
    el.innerHTML =
      '<style>'
      +'.mlt-btn:active{transform:translateY(2px);}'
      +'.mlt-rng{-webkit-appearance:none;appearance:none;height:16px;border-radius:9px;outline:none;'
        +'background:linear-gradient(90deg,#74C0FC 0%,#A5D8FF 22%,#D0EBFF 42%,#FFE3BF 62%,#FFA94D 82%,#FF6B3D 100%);}'
      +'.mlt-rng::-webkit-slider-thumb{-webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:#fff;border:5px solid #1565C0;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2);}'
      +'.mlt-rng::-moz-range-thumb{width:32px;height:32px;border-radius:50%;background:#fff;border:5px solid #1565C0;cursor:pointer;}'
      +'.mlt-chip{font-size:18px;padding:9px 15px;border-radius:13px;border:2.5px solid #C5D7E8;background:#fff;cursor:pointer;font-weight:800;font-family:inherit;color:#37536e;}'
      +'.mlt-chip.on{border-color:#1565C0;color:#1565C0;background:#EAF3FB;}'
      +'</style>'
      +'<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
        +'<span style="font-size:19px;font-weight:800;color:#1971C2;">❄️ 식히기</span>'
        +'<input class="mlt-rng" type="range" min="0" max="100" value="6" aria-label="가한 열" style="width:min(54vw,420px);">'
        +'<span style="font-size:19px;font-weight:800;color:#E8590C;">데우기 🔥</span>'
      +'</div>'
      +'<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:12px;flex-wrap:wrap;">'
        +'<button class="mlt-chip" data-e="6">🧊 얼음</button>'
        +'<button class="mlt-chip" data-e="22">💧 녹이기</button>'
        +'<button class="mlt-chip" data-e="45">🌊 물</button>'
        +'<button class="mlt-chip" data-e="72">♨️ 끓이기</button>'
        +'<button class="mlt-chip" data-e="95">💨 수증기</button>'
        +'<button class="mlt-btn" data-act="auto" style="'+btn+'color:#E8590C;border-color:#E8590C;">▶ 천천히 가열</button>'
      +'</div>'
      +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="mlt-stage" style="width:100%;max-width:860px;margin:0 auto;background:radial-gradient(130% 130% at 50% 12%,#FCFEFF 0%,#EAF3FB 70%,#DBE9F6 100%);border-radius:26px;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);overflow:hidden;"></div>'
      +'</div>'
      +'<div class="mlt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';

    var stageHost = el.querySelector('.mlt-stage');
    var rng = el.querySelector('.mlt-rng');
    var statusEl = el.querySelector('.mlt-status');

    /* ── SVG 무대 ─────────────────────────────────────────────────── */
    var svg = S('svg',{viewBox:'0 0 780 470',width:'100%',style:'display:block;height:auto;'});
    stageHost.appendChild(svg);
    var defs = S('defs'); svg.appendChild(defs);

    // 그라디언트
    defs.innerHTML =
      '<linearGradient id="mWater" x1="0" y1="0" x2="0" y2="1">'
        +'<stop offset="0" stop-color="#cdeeff" stop-opacity="0.92"/>'
        +'<stop offset="0.5" stop-color="#74c0f7" stop-opacity="0.92"/>'
        +'<stop offset="1" stop-color="#2b8fde" stop-opacity="0.95"/></linearGradient>'
      +'<linearGradient id="mGlass" x1="0" y1="0" x2="1" y2="0">'
        +'<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>'
        +'<stop offset="0.12" stop-color="#ffffff" stop-opacity="0.06"/>'
        +'<stop offset="0.85" stop-color="#cfe2f2" stop-opacity="0.04"/>'
        +'<stop offset="1" stop-color="#ffffff" stop-opacity="0.4"/></linearGradient>'
      +'<radialGradient id="mSteam" cx="0.5" cy="0.5" r="0.5">'
        +'<stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>'
        +'<stop offset="0.6" stop-color="#eef6ff" stop-opacity="0.45"/>'
        +'<stop offset="1" stop-color="#eef6ff" stop-opacity="0"/></radialGradient>'
      +'<linearGradient id="mMerc" x1="0" y1="1" x2="0" y2="0">'
        +'<stop offset="0" stop-color="#ff5a4d"/><stop offset="1" stop-color="#ff8a5c"/></linearGradient>'
      +'<filter id="mBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'
      +'<clipPath id="mIceClip"><rect id="mIceRect" x="'+ICE_X+'" y="'+(ICE_BASE-ICE_FULLH)+'" width="'+ICE_W+'" height="'+ICE_FULLH+'" rx="14"/></clipPath>'
      +'<clipPath id="mBeakerClip"><path d="M'+(BX+4)+' '+BY+' L'+(BX+BW-4)+' '+BY+' L'+(BX+BW-4)+' '+(BB-20)+' Q'+(BX+BW-4)+' '+BB+' '+(BX+BW-24)+' '+BB+' L'+(BX+24)+' '+BB+' Q'+(BX+4)+' '+BB+' '+(BX+4)+' '+(BB-20)+' Z"/></clipPath>';

    // 온도계
    var thermo = S('g'); svg.appendChild(thermo);
    thermo.appendChild(S('rect',{x:TH_X-TH_R,y:TH_TOP,width:TH_R*2,height:(TH_BOT-TH_TOP+10),rx:TH_R,fill:'#fff',stroke:'#b9c9da','stroke-width':3}));
    thermo.appendChild(S('circle',{cx:TH_X,cy:TH_BOT+26,r:24,fill:'#fff',stroke:'#b9c9da','stroke-width':3}));
    var merc = S('rect',{x:TH_X-7,y:TH_BOT,width:14,height:0,rx:7,fill:'url(#mMerc)'}); thermo.appendChild(merc);
    var mercBulb = S('circle',{cx:TH_X,cy:TH_BOT+26,r:17,fill:'url(#mMerc)'}); thermo.appendChild(mercBulb);
    function tY(t){ return TH_BOT - (t-T_MIN)/(T_MAX-T_MIN)*(TH_BOT-TH_TOP); }
    [['0℃ 어는·녹는점',0,'#1971C2'],['100℃ 끓는점',100,'#E8590C']].forEach(function(m){
      var y=tY(m[1]);
      thermo.appendChild(S('line',{x1:TH_X+TH_R,y1:y,x2:TH_X+TH_R+10,y2:y,stroke:m[2],'stroke-width':2.5,'stroke-dasharray':'4 3'}));
      var tx=S('text',{x:TH_X+TH_R+14,y:y+5,'font-size':14,'font-weight':800,fill:m[2],'font-family':'inherit'}); tx.textContent=m[0]; thermo.appendChild(tx);
    });
    var tempTxt=S('text',{x:TH_X,y:TH_TOP-12,'font-size':22,'font-weight':800,fill:'#37536e','text-anchor':'middle','font-family':'inherit'}); thermo.appendChild(tempTxt);

    // 비커 뒤판 + 물 + 얼음 + 입자층 + 유리 앞면
    var beakerBack = S('path',{d:'M'+BX+' '+BY+' L'+(BX+BW)+' '+BY+' L'+(BX+BW)+' '+(BB-22)+' Q'+(BX+BW)+' '+(BB+4)+' '+(BX+BW-26)+' '+(BB+4)+' L'+(BX+26)+' '+(BB+4)+' Q'+BX+' '+(BB+4)+' '+BX+' '+(BB-22)+' Z',
      fill:'#f2f9ff',opacity:0.5,stroke:'#bcd6ec','stroke-width':3});
    svg.appendChild(beakerBack);

    var waterG = S('g',{'clip-path':'url(#mBeakerClip)'}); svg.appendChild(waterG);
    var waterBody = S('path',{fill:'url(#mWater)'}); waterG.appendChild(waterBody);
    var shimmer1 = S('ellipse',{rx:60,ry:5,fill:'#ffffff',opacity:0.35}); waterG.appendChild(shimmer1);
    var shimmer2 = S('ellipse',{rx:38,ry:3.5,fill:'#ffffff',opacity:0.3}); waterG.appendChild(shimmer2);
    var bubbleLayer = S('g'); waterG.appendChild(bubbleLayer);

    var iceFallback = S('rect',{x:ICE_X,y:ICE_BASE-ICE_FULLH,width:ICE_W,height:ICE_FULLH,rx:16,fill:'#e9f6ff',stroke:'#bfe0f5','stroke-width':2,'clip-path':'url(#mIceClip)',opacity:0});
    svg.appendChild(iceFallback);
    var iceImg = S('image',{x:ICE_X,y:ICE_BASE-ICE_FULLH,width:ICE_W,height:ICE_FULLH,'clip-path':'url(#mIceClip)',preserveAspectRatio:'xMidYMax meet'});
    iceImg.setAttributeNS(XLINK,'href',ICE); iceImg.setAttribute('href',ICE);
    iceImg.addEventListener('error',function(){ iceImg.setAttribute('opacity','0'); iceFallback.setAttribute('opacity','0.95'); });
    svg.appendChild(iceImg);
    var iceRect = svg.querySelector('#mIceRect');

    // 유리 앞면 하이라이트 + 입(테두리)
    var glassFront = S('path',{d:'M'+BX+' '+BY+' L'+(BX+BW)+' '+BY+' L'+(BX+BW)+' '+(BB-22)+' Q'+(BX+BW)+' '+(BB+4)+' '+(BX+BW-26)+' '+(BB+4)+' L'+(BX+26)+' '+(BB+4)+' Q'+BX+' '+(BB+4)+' '+BX+' '+(BB-22)+' Z',
      fill:'url(#mGlass)',stroke:'#a9cbe6','stroke-width':3.5}); svg.appendChild(glassFront);
    svg.appendChild(S('rect',{x:BX-10,y:BY-9,width:BW+20,height:11,rx:5,fill:'#dfeefb',stroke:'#a9cbe6','stroke-width':3})); // 비커 입
    svg.appendChild(S('rect',{x:BX+14,y:BY+8,width:10,height:BH-30,rx:5,fill:'#ffffff',opacity:0.5})); // 세로 윤기

    var steamLayer = S('g'); svg.appendChild(steamLayer);  // 김 (비커 위로)
    var dripLayer  = S('g'); svg.appendChild(dripLayer);   // 떨어지는 물방울

    /* ── 동적 상태 ─────────────────────────────────────────────────── */
    var cur={e:6,t:derive(6).t,iceH:1,water:0,vapor:0};
    var bubbles=[], steams=[], drips=[], frame=0, auto=false, lastPhase='solid', tDrip=0;

    function waterTopY(wf){ return BB - wf*WATER_MAX; }

    function setWaterPath(topY, amp, ph){
      var d='M'+(BX+4)+' '+topY.toFixed(1);
      for(var x=BX+4;x<=BX+BW-4;x+=14){
        var y=topY + Math.sin(x*0.06+ph)*amp + Math.sin(x*0.13+ph*1.7)*amp*0.5;
        d+=' L'+x.toFixed(1)+' '+y.toFixed(1);
      }
      d+=' L'+(BX+BW-4)+' '+(BB+4)+' L'+(BX+4)+' '+(BB+4)+' Z';
      waterBody.setAttribute('d',d);
    }

    function spawnBubble(){
      var c=S('circle',{cx:BX+30+Math.random()*(BW-60),cy:BB-8,r:2+Math.random()*4,fill:'#ffffff',opacity:0.0});
      bubbleLayer.appendChild(c);
      bubbles.push({el:c,x:+c.getAttribute('cx'),y:BB-8,vy:0.8+Math.random()*1.4,r:+c.getAttribute('r')});
    }
    function spawnSteam(x){
      var e=S('ellipse',{cx:x,cy:BY-4,rx:16+Math.random()*14,ry:12+Math.random()*8,fill:'url(#mSteam)',filter:'url(#mBlur)',opacity:0});
      steamLayer.appendChild(e);
      steams.push({el:e,x:x,y:BY-4,vy:0.7+Math.random()*0.7,drift:(Math.random()-0.5)*0.5,life:0,max:90+Math.random()*60});
    }
    function spawnDrip(){
      var m=derive(cur.e); var w=ICE_W*(0.7);
      var x=ICE_X+ICE_W/2+(Math.random()-0.5)*w;
      var topY=ICE_BASE-cur.iceH*ICE_FULLH+6;
      var im=S('image',{x:x-11,y:topY,width:22,height:22}); im.setAttributeNS(XLINK,'href',WATER); im.setAttribute('href',WATER);
      dripLayer.appendChild(im); drips.push({el:im,x:x,y:topY,vy:1.2+Math.random()*0.6});
    }

    function render(){
      var m=derive(cur.e);
      // 온도계
      cur.t += (m.t-cur.t)*0.18;
      var my=tY(cur.t); merc.setAttribute('y',my); merc.setAttribute('height',Math.max(0,(TH_BOT-my)));
      tempTxt.textContent=Math.round(cur.t)+'℃';
      // 얼음 클립
      cur.iceH += (m.iceH-cur.iceH)*0.16;
      var ih=cur.iceH*ICE_FULLH;
      iceRect.setAttribute('y',(ICE_BASE-ih).toFixed(1));
      iceRect.setAttribute('height',Math.max(0,ih).toFixed(1));
      iceRect.setAttribute('rx',(14+(1-cur.iceH)*60).toFixed(1));
      var iceOp=cur.iceH<0.04?0:Math.min(1,0.35+cur.iceH*0.8);
      iceImg.setAttribute('opacity',iceImg.getAttribute('opacity')==='0'?'0':iceOp);
      if(iceFallback.getAttribute('opacity')!=='0') iceFallback.setAttribute('opacity',(iceOp*0.95).toFixed(2));
      // 물
      cur.water += (m.water-cur.water)*0.14;
      var topY=waterTopY(cur.water);
      var agit = m.phase==='boil'?5.5:(cur.t>70?3.2:2.0);
      setWaterPath(topY, cur.water>0.02?agit:0, frame*0.07);
      if(cur.water>0.02){
        shimmer1.setAttribute('opacity',0.32); shimmer2.setAttribute('opacity',0.28);
        shimmer1.setAttribute('cx',BX+BW*0.42+Math.sin(frame*0.04)*40); shimmer1.setAttribute('cy',topY+8);
        shimmer2.setAttribute('cx',BX+BW*0.62+Math.cos(frame*0.05)*30); shimmer2.setAttribute('cy',topY+14);
      } else { shimmer1.setAttribute('opacity',0); shimmer2.setAttribute('opacity',0); }
      // 상태 텍스트
      var L=LABEL[m.phase];
      statusEl.innerHTML='<div style="font-size:28px;color:'+L[1]+';">'+L[0]+'</div>'
        +'<div style="font-size:17px;color:#5a7894;margin-top:5px;line-height:1.4;">'+L[2]+'</div>';
      // 상태 전환음
      if(m.phase!==lastPhase){ snd(m.phase==='boil'||m.phase==='steam'?'charge':'success'); lastPhase=m.phase; }
      return m;
    }

    function loop(){
      frame++;
      if(auto){ var nv=Math.min(100,+rng.value+0.45); rng.value=nv; if(nv>=100)auto=false; }
      cur.e += ((+rng.value)-cur.e)*0.2;
      var m=render();
      // 기포 (끓을 때)
      if(m.phase==='boil' && frame%3===0) spawnBubble();
      if((cur.t>92) && frame%9===0 && m.water>0.05) spawnBubble();
      var topY=waterTopY(cur.water);
      for(var i=bubbles.length-1;i>=0;i--){ var b=bubbles[i]; b.y-=b.vy; b.vy+=0.02; b.el.setAttribute('cy',b.y); b.el.setAttribute('opacity',Math.min(0.7,b.el.getAttribute('opacity')*1+0.06));
        if(b.y<=topY+2){ if(b.el.parentNode)b.el.parentNode.removeChild(b.el); bubbles.splice(i,1); } }
      // 김 (기화 진행)
      if(m.vapor>0.02 && frame%Math.max(3,Math.round(9-m.vapor*6))===0) spawnSteam(BX+BW/2+(Math.random()-0.5)*BW*0.55);
      for(var j=steams.length-1;j>=0;j--){ var s=steams[j]; s.life++; s.y-=s.vy; s.x+=s.drift; var k=s.life/s.max;
        s.el.setAttribute('cx',s.x.toFixed(1)); s.el.setAttribute('cy',s.y.toFixed(1));
        s.el.setAttribute('opacity',(Math.sin(Math.min(1,k)*Math.PI)*0.7).toFixed(2));
        var sc=1+k*1.3; s.el.setAttribute('rx',(16*sc).toFixed(1)); s.el.setAttribute('ry',(13*sc).toFixed(1));
        if(s.life>=s.max){ if(s.el.parentNode)s.el.parentNode.removeChild(s.el); steams.splice(j,1); } }
      // 물방울 (녹을 때)
      if(m.phase==='melt' && m.iceH>0.03){ tDrip++; if(tDrip%20===0){ spawnDrip(); snd('tap'); } }
      var floorY=waterTopY(cur.water)-4;
      for(var d2=drips.length-1;d2>=0;d2--){ var dp=drips[d2]; dp.vy+=0.16; dp.y+=dp.vy; dp.el.setAttribute('y',dp.y.toFixed(1));
        if(dp.y>=floorY){ if(dp.el.parentNode)dp.el.parentNode.removeChild(dp.el); drips.splice(d2,1); } }
      raf=requestAnimationFrame(loop);
    }

    /* ── 바인딩 ───────────────────────────────────────────────────── */
    var raf=null;
    rng.addEventListener('input',function(){ auto=false; });
    el.querySelectorAll('.mlt-chip').forEach(function(c){ c.addEventListener('click',function(){
      auto=false; var tv=+c.dataset.e; var st=+rng.value, t0=Date.now();
      el.querySelectorAll('.mlt-chip').forEach(function(x){x.classList.remove('on');}); c.classList.add('on'); snd('select');
      (function tween(){ var k=Math.min(1,(Date.now()-t0)/520); rng.value=(st+(tv-st)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2)); if(k<1)requestAnimationFrame(tween); })();
    }); });
    el.querySelector('[data-act="auto"]').addEventListener('click',function(){ auto=true; if(+rng.value>=99)rng.value=6; snd('charge'); });

    render(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
