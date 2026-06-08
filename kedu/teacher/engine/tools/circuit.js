/* ============================================================================
   케이랩 도구 모듈 — 전기 회로 (circuit) v2  [과학 1호 · 비주얼 재작업]
   v2 = 정교한 비주얼 (준호 "휑하고 도식적" + Claude가 렌더로 직접 확인).
     사실적 전구(유리구·코일 필라멘트·나사 베이스·발광), 실물 건전지, 레버 스위치.
   물리 로직은 v1(jsdom 14건 통과) 그대로.
   - config: { mode, batteries(1~3), bulbs(0~3), maxBatt(3), maxBulb(3) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wire:'#7C93AD',wireOn:'#FF9500',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',warn:'#E03131'};

  window.KLab.register('circuit', function (el, config) {
    var maxBatt=config.maxBatt||3, maxBulb=config.maxBulb||3;
    var mode=(config.mode==='parallel')?'parallel':'series';
    var batt=Math.max(1,Math.min(config.batteries||1,maxBatt));
    var nb=Math.max(0,Math.min(config.bulbs!=null?config.bulbs:2,maxBulb));
    var bulbs=[]; for(var i=0;i<nb;i++)bulbs.push(true);
    var sw=true;

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460;
    var btn='font-size:23px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:22px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function inCount(){var c=0;for(var i=0;i<bulbs.length;i++)if(bulbs[i])c++;return c;}
    function shorted(){return sw && bulbs.length===0;}
    function brightOf(i){
      if(!sw)return 0;
      if(mode==='series'){if(bulbs.length===0)return 0;for(var k=0;k<bulbs.length;k++)if(!bulbs[k])return 0;return batt/bulbs.length;}
      return bulbs[i]?batt:0;
    }
    function anyOn(){for(var i=0;i<bulbs.length;i++)if(brightOf(i)>0)return true;return false;}

    function buildUI(){
      el.innerHTML='<style>'
        +'.cir-btn:active,.cir-mbtn:active{transform:translateY(2px);}'
        +'.cir-btn[disabled]{opacity:.32;cursor:not-allowed;}'
        +'.cir-mbtn.on{background:#7048E8 !important;color:#fff !important;}'
        +'.cir-bulb{cursor:pointer;}'
        +'@keyframes cirFlow{to{stroke-dashoffset:-30;}}'
        +'.cir-flow{stroke-dasharray:3 13;stroke-linecap:round;animation:cirFlow .55s linear infinite;}'
        +'</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
          +'<button class="cir-mbtn'+(mode==='series'?' on':'')+'" data-mode="series" style="'+mbtn+'">직렬</button>'
          +'<button class="cir-mbtn'+(mode==='parallel'?' on':'')+'" data-mode="parallel" style="'+mbtn+'">병렬</button>'
        +'</div>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="cir-btn" data-act="bminus" style="'+btn+'background:#fff;color:#1565C0;">－ 전지</button>'
          +'<button class="cir-btn" data-act="bplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 전지</button>'
          +'<span style="width:6px;"></span>'
          +'<button class="cir-btn" data-act="lminus" style="'+btn+'background:#fff;color:#0B7285;border-color:#0B7285;">－ 전구</button>'
          +'<button class="cir-btn" data-act="lplus" style="'+btn+'background:#0B7285;color:#fff;border-color:#0B7285;">＋ 전구</button>'
          +'<span style="width:6px;"></span>'
          +'<button class="cir-btn" data-act="sw" style="'+btn+'background:#fff;color:#E8590C;border-color:#E8590C;">스위치 켜고 끄기</button>'
          +'<button class="cir-btn" data-act="reset" style="font-size:23px;padding:12px 16px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="cir-stage" style="width:100%;height:48vh;min-height:340px;background:radial-gradient(120% 120% at 50% 30%,#FCFDFF 0%,#EAF1FA 70%,#DCE8F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="cir-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
      bind(); render();
    }

    function defs(svg){
      var d=svgEl('defs',{});
      d.innerHTML=
        '<radialGradient id="cGlassOn" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FFFEF2"/><stop offset="45%" stop-color="#FFE98A"/><stop offset="100%" stop-color="#FFC53D"/></radialGradient>'
       +'<radialGradient id="cGlassOff" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FBFDFF"/><stop offset="100%" stop-color="#C9D7E6"/></radialGradient>'
       +'<radialGradient id="cHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE066" stop-opacity="0.95"/><stop offset="55%" stop-color="#FFD43B" stop-opacity="0.4"/><stop offset="100%" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>'
       +'<linearGradient id="cBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7DEE7"/><stop offset="50%" stop-color="#A9B8C8"/><stop offset="100%" stop-color="#8497AA"/></linearGradient>'
       +'<linearGradient id="cBatt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6B7D"/><stop offset="50%" stop-color="#3A4A5C"/><stop offset="100%" stop-color="#27323F"/></linearGradient>'
       +'<linearGradient id="cMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0F3F7"/><stop offset="50%" stop-color="#C2CEDB"/><stop offset="100%" stop-color="#94A6B8"/></linearGradient>'
       +'<filter id="cSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#1A3357" flood-opacity="0.22"/></filter>';
      svg.appendChild(d);
    }

    function bulb(svg,x,y,bright,inFlag,idx){
      var on=bright>0, r=38, g=svgEl('g',{class:'cir-bulb','data-idx':idx,'data-bright':bright,'data-in':inFlag?1:0,style:'cursor:pointer;'});
      if(on){
        var ro=Math.min(0.4+bright*0.25,1);
        for(var a=0;a<360;a+=45){var rad=a*Math.PI/180,r1=r+14,r2=r+14+18*Math.min(bright,2);
          g.appendChild(svgEl('line',{x1:x+r1*Math.cos(rad),y1:y+r1*Math.sin(rad),x2:x+r2*Math.cos(rad),y2:y+r2*Math.sin(rad),stroke:'#FFD43B','stroke-width':4,'stroke-linecap':'round','stroke-opacity':ro}));}
        g.appendChild(svgEl('circle',{cx:x,cy:y,r:r+30+bright*10,fill:'url(#cHalo)'}));
      }
      var by=y+r-6;
      g.appendChild(svgEl('path',{d:'M '+(x-16)+' '+by+' L '+(x+16)+' '+by+' L '+(x+13)+' '+(by+30)+' L '+(x-13)+' '+(by+30)+' Z',fill:'url(#cBase)',stroke:'#7E909F','stroke-width':1.5}));
      for(var s=0;s<3;s++)g.appendChild(svgEl('line',{x1:x-15+s,y1:by+7+s*9,x2:x+15-s,y2:by+7+s*9,stroke:'#7E909F','stroke-width':2,'stroke-opacity':0.7}));
      g.appendChild(svgEl('rect',{x:x-7,y:by+30,width:14,height:7,rx:2,fill:'#6B7E8F'}));
      g.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:on?'url(#cGlassOn)':'url(#cGlassOff)',stroke:on?'#F0A500':'#A9BACB','stroke-width':3,filter:'url(#cSh)'}));
      if(inFlag){
        var fil='M '+(x-9)+' '+(by-2)+' L '+(x-9)+' '+(y+2);
        for(var c=0;c<5;c++){var fx=x-9+c*4.5;fil+=' Q '+(fx+2.25)+' '+(y-13)+' '+(fx+4.5)+' '+(y+2);}
        fil+=' L '+(x+9)+' '+(by-2);
        g.appendChild(svgEl('path',{d:fil,fill:'none',stroke:on?'#FF7A00':'#9AB0C5','stroke-width':on?3.5:2.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
      } else {
        g.appendChild(svgEl('line',{x1:x-15,y1:y-15,x2:x+15,y2:y+15,stroke:C.warn,'stroke-width':5,'stroke-linecap':'round'}));
        g.appendChild(svgEl('line',{x1:x+15,y1:y-15,x2:x-15,y2:y+15,stroke:C.warn,'stroke-width':5,'stroke-linecap':'round'}));
      }
      g.appendChild(svgEl('ellipse',{cx:x-12,cy:y-14,rx:7,ry:11,fill:'#fff','fill-opacity':on?0.55:0.4,transform:'rotate(-25 '+(x-12)+' '+(y-14)+')'}));
      svg.appendChild(g);
    }

    function batteries(svg,cx,cy){
      var unitW=58, gap=3, total=batt*unitW+(batt-1)*gap, sx=cx-total/2;
      for(var b=0;b<batt;b++){
        var x=sx+b*(unitW+gap), g=svgEl('g',{filter:'url(#cSh)'});
        g.appendChild(svgEl('rect',{x:x+5,y:cy-22,width:unitW-8,height:44,rx:5,fill:'url(#cBatt)',stroke:'#1B2733','stroke-width':2}));
        g.appendChild(svgEl('rect',{x:x+5,y:cy-3,width:unitW-8,height:9,fill:'#FFD43B'}));      // 노란 라벨 띠
        g.appendChild(svgEl('rect',{x:x+5,y:cy-22,width:unitW-8,height:9,rx:5,fill:'#fff','fill-opacity':0.18}));
        g.appendChild(svgEl('rect',{x:x+unitW-3,y:cy-9,width:6,height:18,rx:2,fill:'url(#cMetal)',stroke:'#8497AA','stroke-width':1})); // + 단자
        var t=svgEl('text',{x:x+unitW/2,y:cy-7,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:'#fff'});t.textContent='+';g.appendChild(t);
        svg.appendChild(g);
      }
    }
    function leverSwitch(svg,x,y){
      svg.appendChild(svgEl('rect',{x:x-30,y:y-6,width:60,height:12,rx:6,fill:'#E3EAF2',stroke:'#A9BACB','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x-22,cy:y,r:7,fill:'url(#cMetal)',stroke:'#7E909F','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x+22,cy:y,r:7,fill:'url(#cMetal)',stroke:'#7E909F','stroke-width':2}));
      var ex=sw?x+22:x+10, ey=sw?y:y-26;
      svg.appendChild(svgEl('line',{x1:x-22,y1:y,x2:ex,y2:ey,stroke:sw?C.wireOn:'#7E909F','stroke-width':8,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:x-22,cy:y,r:4,fill:C.ink}));
    }
    function wire(svg,pts,on){
      var d='M '+pts[0][0]+' '+pts[0][1]; for(var i=1;i<pts.length;i++)d+=' L '+pts[i][0]+' '+pts[i][1];
      svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#415062','stroke-width':11,'stroke-linecap':'round','stroke-linejoin':'round','stroke-opacity':0.16}));
      svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:on?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'}));
      if(on)svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#FFF7E0','stroke-width':5,'stroke-linecap':'round',class:'cir-flow'}));
    }

    function render(){
      var stage=el.querySelector('.cir-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      var on=anyOn(), short=shorted(), L=bulbs.length, top=120, bot=372, lft=110, rgt=790;

      if(mode==='series'){
        var sOn=(brightOf(0)>0), xs=[]; for(var i=0;i<L;i++)xs.push(L===1?(lft+rgt)/2:lft+(rgt-lft)*i/(L-1));
        wire(svg,[[lft,bot],[lft,top]],sOn);
        for(var i=0;i<=L;i++){var x1=(i===0)?lft:xs[i-1]+40,x2=(i===L)?rgt:xs[i]-40;if(x2>x1)wire(svg,[[x1,top],[x2,top]],sOn);}
        wire(svg,[[rgt,top],[rgt,bot]],sOn);
        var midx=(lft+rgt)/2;
        wire(svg,[[rgt,bot],[midx+115,bot]],sOn); wire(svg,[[midx-120,bot],[lft,bot]],sOn);
        batteries(svg,midx-50,bot); leverSwitch(svg,midx+72,bot);
        for(var i=0;i<L;i++)bulb(svg,xs[i],top,brightOf(i),bulbs[i],i);
        if(L===0)svg.appendChild(svgEl('text',{x:midx,y:top,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,fill:C.warn})).textContent='전구가 없어요';
      } else {
        var busOn=on, midy=(top+bot)/2;
        wire(svg,[[lft,top],[rgt,top]],busOn);
        wire(svg,[[lft,bot],[lft+40,bot]],busOn); wire(svg,[[lft+140,bot],[rgt,bot]],busOn);
        wire(svg,[[lft,top],[lft,midy-12]],busOn); wire(svg,[[lft,midy+12],[lft,bot]],busOn);
        leverSwitch(svg,lft,midy); batteries(svg,lft+90,bot);
        var xs2=[]; for(var i=0;i<L;i++)xs2.push(L===1?(lft+rgt)/2:lft+170+(rgt-lft-220)*i/Math.max(L-1,1));
        for(var i=0;i<L;i++){var bx=xs2[i],bon=brightOf(i)>0;wire(svg,[[bx,top],[bx,midy-40]],bon);wire(svg,[[bx,midy+40],[bx,bot]],bon);bulb(svg,bx,midy,brightOf(i),bulbs[i],i);}
      }
      if(short)svg.appendChild(svgEl('text',{x:VBW/2,y:VBH/2,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':28,'font-weight':800,fill:C.warn})).textContent='⚠ 합선! 전구 없이 이으면 전지가 뜨거워져요';
      stage.appendChild(svg);
      renderStatus(on,short); updateBtns();
    }
    function renderStatus(on,short){
      var s=el.querySelector('.cir-status'),msg='',sub='';
      if(short){msg='<span style="color:'+C.warn+';">합선됐어요</span>';sub='전구를 넣어야 해요.';}
      else if(!sw){msg='<span style="color:'+C.sub+';">스위치가 열렸어요</span>';sub='스위치를 닫으면 불이 들어와요.';}
      else if(mode==='series'){sub='직렬 — 한 줄로 이어져요. 전구 하나라도 빼면 길이 끊겨 전부 꺼지고, 전지가 많으면 밝고 전구가 많으면 나눠 써서 어두워요.';msg=on?'<span style="color:'+C.good+';">직렬: 모두 켜짐 ✨</span>':'<span style="color:'+C.sub+';">직렬: 길이 끊겨 꺼짐</span>';}
      else{sub='병렬 — 갈래가 여러 개라 따로 흘러요. 전구 하나를 빼도 나머지는 켜져 있고, 전구가 많아도 밝기가 유지돼요.';msg=on?'<span style="color:'+C.good+';">병렬: 따로따로 켜짐 ✨</span>':'<span style="color:'+C.sub+';">병렬: 모두 꺼짐</span>';}
      s.innerHTML='<div style="font-size:26px;">'+msg+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
    }
    function updateBtns(){function st(sel,d){var b=el.querySelector(sel);if(b)b.disabled=d;}
      st('[data-act="bplus"]',batt>=maxBatt);st('[data-act="bminus"]',batt<=1);st('[data-act="lplus"]',bulbs.length>=maxBulb);st('[data-act="lminus"]',bulbs.length<=0);}
    function bind(){
      var h={bplus:function(){if(batt<maxBatt){batt++;render();}},bminus:function(){if(batt>1){batt--;render();}},
        lplus:function(){if(bulbs.length<maxBulb){bulbs.push(true);render();}},lminus:function(){if(bulbs.length>0){bulbs.pop();render();}},
        sw:function(){sw=!sw;render();},
        reset:function(){mode=(config.mode==='parallel')?'parallel':'series';batt=Math.max(1,Math.min(config.batteries||1,maxBatt));var n=Math.max(0,Math.min(config.bulbs!=null?config.bulbs:2,maxBulb));bulbs=[];for(var i=0;i<n;i++)bulbs.push(true);sw=true;buildUI();}};
      el.querySelectorAll('.cir-btn[data-act]').forEach(function(b){b.addEventListener('click',function(){var f=h[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.cir-mbtn').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;buildUI();}});});
      el.querySelector('.cir-stage').addEventListener('click',function(e){var g=e.target.closest?e.target.closest('.cir-bulb'):null;if(g){var i=+g.getAttribute('data-idx');bulbs[i]=!bulbs[i];render();}});
    }
    buildUI();
    return function cleanup(){};
  });
})();
