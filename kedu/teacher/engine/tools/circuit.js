/* ============================================================================
   케이랩 도구 모듈 — 전기 회로 (circuit) v3  [과학 1호 · 자유 배치 작업판]
   v3 = 조작 자유도 (준호 "스위치 넣다뺐다·전지 위치 바꾸기·섬세하게").
     루프 둘레 8개 자리(slot)에 부품을 자유롭게:
       ▸ 팔레트에서 전지/전구/스위치 골라 빈 자리를 탭 → 놓기
       ▸ 지우기 도구로 부품 빼기 (자리는 전선이 됨)
       ▸ 스위치는 '스위치' 도구로 탭하면 여닫기 (넣다뺐다·켜고 끄기)
       ▸ 전지·전구·스위치를 어느 자리에든 = 위치 자유
     물리: 전지≥1 · 전구≥1 · 열린 스위치 없음 → 흐름. 전구 0개=합선. 밝기 b/L.
   비주얼은 v2 자산(사실적 전구·건전지·레버) 유지.
   - config: { slots:[...8], max? } / 미지정 시 기본 배치(전지1·전구2·스위치1)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wire:'#7C93AD',wireOn:'#FF9500',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',warn:'#E03131'};
  var TOOLS=[{k:'battery',l:'🔋 전지'},{k:'bulb',l:'💡 전구'},{k:'switch',l:'⏻ 스위치'},{k:'erase',l:'✖ 지우기'}];

  window.KLab.register('circuit', function (el, config) {
    function defSlots(){return [
      {t:'battery'},{t:'wire'},{t:'bulb'},{t:'wire'},
      {t:'switch',open:false},{t:'wire'},{t:'bulb'},{t:'wire'}];}
    var slots=(Array.isArray(config.slots)&&config.slots.length===8)?config.slots.map(function(s){return {t:s.t,open:!!s.open};}):defSlots();
    var tool='bulb';

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=470, lft=130,rgt=770,top=140,bot=360, midx=(lft+rgt)/2, midy=(top+bot)/2;
    var SLOT=[[midx-185,top],[midx,top],[midx+185,top],[rgt,midy],[midx+185,bot],[midx,bot],[midx-185,bot],[lft,midy]];
    var btn='font-size:22px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function counts(){var b=0,L=0,openSw=false;slots.forEach(function(s){if(s.t==='battery')b++;else if(s.t==='bulb')L++;else if(s.t==='switch'&&s.open)openSw=true;});return {b:b,L:L,openSw:openSw};}
    function flowOn(){var c=counts();return c.b>=1&&c.L>=1&&!c.openSw;}
    function shorted(){var c=counts();return c.b>=1&&c.L===0&&!c.openSw;}
    function bright(){var c=counts();return flowOn()?c.b/c.L:0;}

    function buildUI(){
      var pal=TOOLS.map(function(t){return '<button class="cir-tool'+(t.k===tool?' on':'')+'" data-tool="'+t.k+'" style="'+btn+(t.k===tool?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+t.l+'</button>';}).join('');
      el.innerHTML='<style>'
        +'.cir-tool:active{transform:translateY(2px);}'
        +'.cir-tool.on{background:#1565C0 !important;color:#fff !important;}'
        +'.cir-hit{cursor:pointer;}'
        +'@keyframes cirFlow{to{stroke-dashoffset:-30;}}'
        +'.cir-flow{stroke-dasharray:3 13;stroke-linecap:round;animation:cirFlow .55s linear infinite;}'
        +'</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'+pal
          +'<button class="cir-tool" data-tool="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 처음</button></div>'
        +'<div style="text-align:center;font-size:16px;color:'+C.sub+';margin-bottom:6px;">부품을 고른 뒤 회로의 빈 자리를 탭해서 놓아요. 스위치는 \'스위치\'로 탭하면 켜고 꺼져요.</div>'
        +'<div class="cir-stage" style="width:100%;height:46vh;min-height:330px;background:radial-gradient(120% 120% at 50% 30%,#FCFDFF 0%,#EAF1FA 70%,#DCE8F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="cir-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;"></div>';
      bind(); render();
    }

    function defs(svg){var d=svgEl('defs',{});d.innerHTML=
      '<radialGradient id="cGlassOn" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FFFEF2"/><stop offset="45%" stop-color="#FFE98A"/><stop offset="100%" stop-color="#FFC53D"/></radialGradient>'
     +'<radialGradient id="cGlassOff" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FBFDFF"/><stop offset="100%" stop-color="#C9D7E6"/></radialGradient>'
     +'<radialGradient id="cHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE066" stop-opacity="0.95"/><stop offset="55%" stop-color="#FFD43B" stop-opacity="0.4"/><stop offset="100%" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>'
     +'<linearGradient id="cBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7DEE7"/><stop offset="50%" stop-color="#A9B8C8"/><stop offset="100%" stop-color="#8497AA"/></linearGradient>'
     +'<linearGradient id="cBatt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A6B7D"/><stop offset="50%" stop-color="#3A4A5C"/><stop offset="100%" stop-color="#27323F"/></linearGradient>'
     +'<linearGradient id="cMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0F3F7"/><stop offset="50%" stop-color="#C2CEDB"/><stop offset="100%" stop-color="#94A6B8"/></linearGradient>'
     +'<filter id="cSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#1A3357" flood-opacity="0.22"/></filter>';
      svg.appendChild(d);}

    function bulb(svg,x,y,br){
      var on=br>0,r=34;
      if(on){var ro=Math.min(0.4+br*0.25,1);for(var a=0;a<360;a+=45){var rad=a*Math.PI/180,r1=r+12,r2=r+12+16*Math.min(br,2);svg.appendChild(svgEl('line',{x1:x+r1*Math.cos(rad),y1:y+r1*Math.sin(rad),x2:x+r2*Math.cos(rad),y2:y+r2*Math.sin(rad),stroke:'#FFD43B','stroke-width':4,'stroke-linecap':'round','stroke-opacity':ro}));}svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r+26+br*9,fill:'url(#cHalo)'}));}
      var by=y+r-5;
      svg.appendChild(svgEl('path',{d:'M '+(x-14)+' '+by+' L '+(x+14)+' '+by+' L '+(x+11)+' '+(by+26)+' L '+(x-11)+' '+(by+26)+' Z',fill:'url(#cBase)',stroke:'#7E909F','stroke-width':1.5}));
      for(var s=0;s<3;s++)svg.appendChild(svgEl('line',{x1:x-13+s,y1:by+6+s*8,x2:x+13-s,y2:by+6+s*8,stroke:'#7E909F','stroke-width':2,'stroke-opacity':0.7}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:on?'url(#cGlassOn)':'url(#cGlassOff)',stroke:on?'#F0A500':'#A9BACB','stroke-width':3,filter:'url(#cSh)'}));
      var fil='M '+(x-8)+' '+(by-2)+' L '+(x-8)+' '+(y+2);for(var c=0;c<5;c++){var fx=x-8+c*4;fil+=' Q '+(fx+2)+' '+(y-11)+' '+(fx+4)+' '+(y+2);}fil+=' L '+(x+8)+' '+(by-2);
      svg.appendChild(svgEl('path',{d:fil,fill:'none',stroke:on?'#FF7A00':'#9AB0C5','stroke-width':on?3.5:2.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
      svg.appendChild(svgEl('ellipse',{cx:x-11,cy:y-12,rx:6,ry:10,fill:'#fff','fill-opacity':on?0.55:0.4,transform:'rotate(-25 '+(x-11)+' '+(y-12)+')'}));
    }
    function batteryUnit(svg,x,y){
      var g=svgEl('g',{}), w=66, h=42;
      g.appendChild(svgEl('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:6,fill:'#3A4A5C',stroke:'#15202B','stroke-width':3}));
      g.appendChild(svgEl('rect',{x:x-w/2,y:y-h/2,width:15,height:h,rx:6,fill:'#C0392B'}));
      g.appendChild(svgEl('rect',{x:x-w/2,y:y-5,width:w,height:10,fill:'#FFD43B'}));
      g.appendChild(svgEl('rect',{x:x+w/2-2,y:y-9,width:7,height:18,rx:2,fill:'#D7DEE7',stroke:'#8497AA','stroke-width':1}));
      var t=svgEl('text',{x:x+12,y:y+7,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':20,'font-weight':800,fill:'#fff'});t.textContent='＋';g.appendChild(t);
      svg.appendChild(g);
    }
    function leverSwitch(svg,x,y,open){
      svg.appendChild(svgEl('rect',{x:x-32,y:y-7,width:64,height:14,rx:7,fill:'#E3EAF2',stroke:'#A9BACB','stroke-width':2,filter:'url(#cSh)'}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:8,fill:'url(#cMetal)',stroke:'#7E909F','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x+23,cy:y,r:8,fill:'url(#cMetal)',stroke:'#7E909F','stroke-width':2}));
      var ex=open?x+11:x+23, ey=open?y-28:y;
      svg.appendChild(svgEl('line',{x1:x-23,y1:y,x2:ex,y2:ey,stroke:open?'#7E909F':C.wireOn,'stroke-width':9,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:4,fill:C.ink}));
    }

    function render(){
      var stage=el.querySelector('.cir-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      var flow=flowOn(), short=shorted(), br=bright();
      // 루프 전선(둥근 사각)
      var rr=26, d='M '+(lft+rr)+' '+top+' L '+(rgt-rr)+' '+top+' Q '+rgt+' '+top+' '+rgt+' '+(top+rr)
        +' L '+rgt+' '+(bot-rr)+' Q '+rgt+' '+bot+' '+(rgt-rr)+' '+bot+' L '+(lft+rr)+' '+bot
        +' Q '+lft+' '+bot+' '+lft+' '+(bot-rr)+' L '+lft+' '+(top+rr)+' Q '+lft+' '+top+' '+(lft+rr)+' '+top+' Z';
      svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#415062','stroke-width':12,'stroke-opacity':0.16,'stroke-linejoin':'round'}));
      svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:flow?C.wireOn:C.wire,'stroke-width':7,'stroke-linejoin':'round'}));
      if(flow)svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));
      // 슬롯 부품
      slots.forEach(function(s,i){var x=SLOT[i][0],y=SLOT[i][1];
        if(s.t==='bulb')bulb(svg,x,y,br);
        else if(s.t==='battery')batteryUnit(svg,x,y);
        else if(s.t==='switch')leverSwitch(svg,x,y,s.open);
        // wire = 루프 전선이 지나가므로 생략
      });
      // 빈 자리 점 표시(탭 가능 힌트) + 히트박스
      slots.forEach(function(s,i){var x=SLOT[i][0],y=SLOT[i][1];
        if(s.t==='wire')svg.appendChild(svgEl('circle',{cx:x,cy:y,r:7,fill:'#fff',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'3 3'}));
        svg.appendChild(svgEl('circle',{cx:x,cy:y,r:46,fill:'transparent',class:'cir-hit','data-slot':i}));
      });
      if(short)svg.appendChild(svgEl('text',{x:midx,y:midy,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':26,'font-weight':800,fill:C.warn})).textContent='⚠ 합선! 전구를 넣어요';
      stage.appendChild(svg);
      renderStatus(flow,short);
    }
    function renderStatus(flow,short){
      var c=counts(), s=el.querySelector('.cir-status'), msg,sub;
      if(short){msg='<span style="color:'+C.warn+';">합선됐어요</span>';sub='전구 없이 전지만 이으면 위험해요. 전구를 넣어요.';}
      else if(c.b===0){msg='<span style="color:'+C.sub+';">전지가 없어요</span>';sub='전지를 놓아야 전류가 흘러요.';}
      else if(c.openSw){msg='<span style="color:'+C.sub+';">스위치가 열렸어요</span>';sub='스위치를 닫으면 불이 들어와요.';}
      else if(c.L===0){msg='<span style="color:'+C.sub+';">전구가 없어요</span>';sub='전구를 놓아 보세요.';}
      else{msg='<span style="color:'+C.good+';">불이 들어왔어요 ✨</span>';sub='전지 '+c.b+'개·전구 '+c.L+'개 — 한 줄(직렬)이라 전지가 많으면 밝고, 전구가 많으면 나눠 써서 어두워요.';}
      s.innerHTML='<div style="font-size:25px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:5px;line-height:1.4;">'+sub+'</div>';
    }

    function bind(){
      el.querySelectorAll('.cir-tool').forEach(function(b){b.addEventListener('click',function(){
        var k=b.dataset.tool;
        if(k==='reset'){slots=defSlots();tool='bulb';buildUI();return;}
        tool=k; el.querySelectorAll('.cir-tool').forEach(function(x){x.classList.toggle('on',x.dataset.tool===tool);});
      });});
      el.querySelector('.cir-stage').addEventListener('click',function(e){
        var h=e.target.closest?e.target.closest('.cir-hit'):null; if(!h)return;
        var i=+h.getAttribute('data-slot'), s=slots[i];
        if(tool==='erase') s.t='wire';
        else if(tool==='switch'){ if(s.t==='switch') s.open=!s.open; else {s.t='switch';s.open=false;} }
        else { s.t=tool; }
        render();
      });
    }
    buildUI();
    return function cleanup(){};
  });
})();
