/* ============================================================================
   케이랩 도구 모듈 — 전기 회로 (circuit) v1  [과학 1호]
   초점 (6학년 전기) = 직렬·병렬을 "외우기"가 아니라 "만지다 발견".
     변수 → 현상 → 발견:
       ▸ 직렬/병렬 토글, 전지 ±, 전구 ±, 메인 스위치, 전구 개별 빼기(클릭)
       ▸ 직렬: 전지↑밝아짐·전구↑어두워짐·하나라도 빼면 **전부 꺼짐**
       ▸ 병렬: 밝기 유지·전구 하나 빼도 **나머지는 켜짐**
       ▸ 전구 0개로 닫으면 **합선 경고**
     "실제 실험 못 해도 어떤 경우가 되는지" — 잘못 이어도 안전하게.
   - 의존: window.KLab (THREE 불필요, 순수 SVG)
   - config: { mode:"series"|"parallel"(기본series), batteries(기본1), bulbs(기본2),
               maxBatt(기본3), maxBulb(기본3) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wire:'#5a7894',wireOn:'#FFB703',glow:'#FFD43B',bulbOff:'#CED9E6',bulbEdge:'#8AA6C2',
         batt:'#1565C0',battTip:'#E8590C',good:'#12B886',warn:'#E03131',ink:'#1B3A57',sub:'#5a7894'};

  window.KLab.register('circuit', function (el, config) {
    var maxBatt=config.maxBatt||3, maxBulb=config.maxBulb||3;
    var mode=(config.mode==='parallel')?'parallel':'series';
    var batt=Math.max(1,Math.min(config.batteries||1,maxBatt));
    var nb=Math.max(0,Math.min(config.bulbs!=null?config.bulbs:2,maxBulb));
    var bulbs=[]; for(var i=0;i<nb;i++)bulbs.push(true);   // true=끼워짐
    var sw=true;                                           // 메인 스위치 닫힘

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460;
    var btn='font-size:23px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:22px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    // ── 물리 (초등 수준 단순화) ──
    // 직렬: 닫힘 && 모든 전구 끼움 && 전구>=1 → 각 전구 밝기 = batt/nbIn ; 아니면 전부 0
    // 병렬: 각 전구 독립 → 끼움 && 닫힘 → 밝기 = batt ; 아니면 0
    // 합선: 전구 0개 && 닫힘 → 경고
    function inCount(){var c=0;for(var i=0;i<bulbs.length;i++)if(bulbs[i])c++;return c;}
    function shorted(){return sw && bulbs.length>0 && inCount()===0 ? false : (sw && bulbs.length===0);}
    function brightOf(i){
      if(!sw) return 0;
      if(mode==='series'){
        if(bulbs.length===0) return 0;
        for(var k=0;k<bulbs.length;k++) if(!bulbs[k]) return 0; // 하나라도 빠지면 전체 0
        return batt/bulbs.length;
      } else {
        return bulbs[i] ? batt : 0;
      }
    }
    function anyOn(){for(var i=0;i<bulbs.length;i++)if(brightOf(i)>0)return true;return false;}

    function buildUI(){
      el.innerHTML='<style>'
        +'.cir-btn:active,.cir-mbtn:active{transform:translateY(2px);}'
        +'.cir-btn[disabled]{opacity:.32;cursor:not-allowed;}'
        +'.cir-mbtn.on{background:#7048E8 !important;color:#fff !important;}'
        +'.cir-bulb{cursor:pointer;}'
        +'@keyframes cirFlow{to{stroke-dashoffset:-28;}}'
        +'.cir-flow{stroke-dasharray:8 6;animation:cirFlow .6s linear infinite;}'
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
          +'<button class="cir-btn" data-act="sw" style="'+btn+'background:#fff;color:#E8590C;border-color:#E8590C;">스위치</button>'
          +'<button class="cir-btn" data-act="reset" style="font-size:23px;padding:12px 16px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="cir-stage" style="width:100%;height:48vh;min-height:340px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="cir-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
      bind(); render();
    }

    function bulbGlyph(svg,x,y,bright,inFlag,idx){
      var r=30, on=bright>0;
      if(on){ var gr=r+8+bright*16;
        svg.appendChild(svgEl('circle',{cx:x,cy:y,r:gr,fill:C.glow,'fill-opacity':Math.min(0.18+bright*0.16,0.6)}));
        svg.appendChild(svgEl('circle',{cx:x,cy:y,r:gr*0.7,fill:C.glow,'fill-opacity':Math.min(0.2+bright*0.18,0.7)})); }
      var g=svgEl('g',{class:'cir-bulb','data-idx':idx,'data-bright':bright,'data-in':inFlag?1:0});
      g.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:on?'#FFF3BF':C.bulbOff,stroke:on?C.wireOn:C.bulbEdge,'stroke-width':4}));
      if(inFlag){ // 필라멘트 (켜짐=주황, 꺼짐=회색)
        g.appendChild(svgEl('path',{d:'M '+(x-11)+' '+(y+8)+' L '+(x-5)+' '+(y-6)+' L '+x+' '+(y+6)+' L '+(x+5)+' '+(y-6)+' L '+(x+11)+' '+(y+8),fill:'none',stroke:on?'#E8590C':'#9AB7D4','stroke-width':3,'stroke-linejoin':'round'}));
      } else { // 빠짐 = X
        g.appendChild(svgEl('line',{x1:x-12,y1:y-12,x2:x+12,y2:y+12,stroke:C.warn,'stroke-width':4,'stroke-linecap':'round'}));
        g.appendChild(svgEl('line',{x1:x+12,y1:y-12,x2:x-12,y2:y+12,stroke:C.warn,'stroke-width':4,'stroke-linecap':'round'}));
      }
      // 소켓 다리
      g.appendChild(svgEl('rect',{x:x-9,y:y+r-2,width:18,height:12,rx:3,fill:'#B0C4DA'}));
      svg.appendChild(g);
    }
    function battGlyph(svg,x,y,horiz){
      // 전지 b개 묶음(한 칸으로 표현 + 개수 라벨)
      var w=horiz?54:30,h=horiz?30:54;
      svg.appendChild(svgEl('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:5,fill:'#fff',stroke:C.batt,'stroke-width':4}));
      svg.appendChild(svgEl('rect',{x:x-w/2-(horiz?6:0),y:y-(horiz?9:h/2-6),width:horiz?6:30,height:horiz?18:6,rx:2,fill:C.battTip}));
      var t=svgEl('text',{x:x,y:y+7,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:C.batt});t.textContent='🔋'+batt;svg.appendChild(t);
    }
    function wire(svg,pts,on){
      var d='M '+pts[0][0]+' '+pts[0][1]; for(var i=1;i<pts.length;i++)d+=' L '+pts[i][0]+' '+pts[i][1];
      svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:on?C.wireOn:C.wire,'stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'}));
      if(on) svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#fff','stroke-width':3,'stroke-linecap':'round',class:'cir-flow','stroke-opacity':0.9}));
    }

    function render(){
      var stage=el.querySelector('.cir-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var on=anyOn(), short=shorted();
      var L=bulbs.length, top=120, bot=360, lft=120, rgt=780;

      if(mode==='series'){
        // 사각 루프: 아래변 전지, 윗변 전구들
        var seriesOn=(brightOf(0)>0);
        // 윗변에 전구 위치
        var xs=[]; for(var i=0;i<L;i++){xs.push(L===1?(lft+rgt)/2:lft+ (rgt-lft)*i/(L-1));}
        // 전선: 좌하→좌상→(윗변 전구 사이)→우상→우하→(아래 전지)→좌하
        wire(svg,[[lft,bot],[lft,top]],seriesOn);
        for(var i=0;i<=L;i++){
          var x1=(i===0)?lft:xs[i-1]+34, x2=(i===L)?rgt:xs[i]-34;
          if(x2>x1) wire(svg,[[x1,top],[x2,top]],seriesOn);
        }
        wire(svg,[[rgt,top],[rgt,bot]],seriesOn);
        // 아래변 + 스위치 + 전지
        var midx=(lft+rgt)/2;
        wire(svg,[[rgt,bot],[midx+70,bot]],seriesOn);
        wire(svg,[[midx-70,bot],[lft,bot]],seriesOn);
        drawSwitch(svg,midx+30,bot);
        battGlyph(svg,midx-30,bot,true);
        // 전구
        for(var i=0;i<L;i++) bulbGlyph(svg,xs[i],top,brightOf(i),bulbs[i],i);
        if(L===0){ var t=svgEl('text',{x:midx,y:top,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,fill:C.warn});t.textContent='전구가 없어요';svg.appendChild(t);}
      } else {
        // 병렬: 위 버스 + 아래 버스, 전구 세로 가지, 왼쪽 전지
        var busOn=on;
        wire(svg,[[lft,top],[rgt,top]],busOn);     // 위 버스(+)
        wire(svg,[[lft,bot],[rgt,bot]],busOn);     // 아래 버스(-)
        // 왼쪽 전지 + 스위치 (두 버스 연결)
        wire(svg,[[lft,top],[lft,bot]], busOn);
        drawSwitch(svg,lft,(top+bot)/2-40);
        battGlyph(svg,lft,(top+bot)/2+30,false);
        // 전구 가지
        var xs2=[]; for(var i=0;i<L;i++){xs2.push(L===1?(lft+rgt)/2:lft+120+ (rgt-lft-160)*i/(Math.max(L-1,1)));}
        for(var i=0;i<L;i++){
          var bx=xs2[i], bon=brightOf(i)>0;
          wire(svg,[[bx,top],[bx,(top+bot)/2-34]],bon);
          wire(svg,[[bx,(top+bot)/2+34],[bx,bot]],bon);
          bulbGlyph(svg,bx,(top+bot)/2,brightOf(i),bulbs[i],i);
        }
      }
      // 합선 표시
      if(short){ svg.appendChild(svgEl('text',{x:VBW/2,y:VBH/2,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':30,'font-weight':800,fill:C.warn})).textContent='⚠ 합선! 전구 없이 이으면 전지가 뜨거워져요'; }
      stage.appendChild(svg);
      renderStatus(on,short);
      updateBtns();
    }
    function drawSwitch(svg,x,y){
      svg.appendChild(svgEl('circle',{cx:x-16,cy:y,r:6,fill:C.ink}));
      svg.appendChild(svgEl('circle',{cx:x+16,cy:y,r:6,fill:C.ink}));
      svg.appendChild(svgEl('line',{x1:x-16,y1:y,x2:(sw?x+16:x+8),y2:(sw?y:y-22),stroke:sw?C.wireOn:C.sub,'stroke-width':6,'stroke-linecap':'round'}));
    }
    function renderStatus(on,short){
      var statusEl=el.querySelector('.cir-status'), msg='', sub='';
      if(short){ msg='<span style="color:'+C.warn+';">합선됐어요</span>'; sub='전구를 넣어야 해요.'; }
      else if(!sw){ msg='<span style="color:'+C.sub+';">스위치가 열렸어요</span>'; sub='스위치를 닫으면 불이 들어와요.'; }
      else if(mode==='series'){
        sub='직렬 — 한 줄로 이어져요. 전구 하나라도 빼면 길이 끊겨 전부 꺼져요. 전지가 많으면 밝고, 전구가 많으면 나눠 써서 어두워요.';
        msg=on?'<span style="color:'+C.good+';">직렬: 모두 켜짐 ✨</span>':'<span style="color:'+C.sub+';">직렬: 길이 끊겨 꺼짐</span>';
      } else {
        sub='병렬 — 갈래가 여러 개라 따로 흘러요. 전구 하나를 빼도 나머지는 켜져 있고, 전구가 많아도 밝기가 유지돼요.';
        msg=on?'<span style="color:'+C.good+';">병렬: 켜진 전구 따로따로 ✨</span>':'<span style="color:'+C.sub+';">병렬: 모두 꺼짐</span>';
      }
      statusEl.innerHTML='<div style="font-size:26px;">'+msg+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:6px;line-height:1.4;">'+sub+'</div>';
    }
    function updateBtns(){
      function s(sel,d){var b=el.querySelector(sel);if(b)b.disabled=d;}
      s('[data-act="bplus"]',batt>=maxBatt); s('[data-act="bminus"]',batt<=1);
      s('[data-act="lplus"]',bulbs.length>=maxBulb); s('[data-act="lminus"]',bulbs.length<=0);
    }
    function bind(){
      var h={
        bplus:function(){if(batt<maxBatt){batt++;render();}},
        bminus:function(){if(batt>1){batt--;render();}},
        lplus:function(){if(bulbs.length<maxBulb){bulbs.push(true);render();}},
        lminus:function(){if(bulbs.length>0){bulbs.pop();render();}},
        sw:function(){sw=!sw;render();},
        reset:function(){mode=(config.mode==='parallel')?'parallel':'series';batt=Math.max(1,Math.min(config.batteries||1,maxBatt));var n=Math.max(0,Math.min(config.bulbs!=null?config.bulbs:2,maxBulb));bulbs=[];for(var i=0;i<n;i++)bulbs.push(true);sw=true;buildUI();}
      };
      el.querySelectorAll('.cir-btn[data-act]').forEach(function(b){b.addEventListener('click',function(){var f=h[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.cir-mbtn').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;buildUI();}});});
      // 전구 클릭 = 빼기/끼우기
      el.querySelector('.cir-stage').addEventListener('click',function(e){
        var g=e.target.closest?e.target.closest('.cir-bulb'):null;
        if(g){var i=+g.getAttribute('data-idx');bulbs[i]=!bulbs[i];render();}
      });
    }

    buildUI();
    return function cleanup(){};
  });
})();
