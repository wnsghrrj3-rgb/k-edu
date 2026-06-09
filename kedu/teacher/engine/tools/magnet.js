/* ============================================================================
   케이랩 도구 모듈 — 자석·자기장 (magnet) v1  [과학 3호]
   3학년 자석의 이용.
     변수 → 현상 → 발견:
       ▸ 막대자석을 끌어 옮기고(드래그) 회전, 1개/2개 전환
       ▸ 나침반 격자가 실제 자기장 방향을 가리킴(쌍극자 필드 계산) = 자기력선 시각화
       ▸ 두 자석: 다른 극끼리는 자기장이 이어지고(끌림), 같은 극끼리는 밀어내는 모양
       ▸ "자석 둘레엔 눈에 안 보이는 자기장이 있고, 나침반은 그 방향을 따른다"
   - 의존: window.KLab (순수 SVG)
   - config: { count(자석 1|2, 기본1) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={N:'#E03131',S:'#1C7ED6',ink:'#1B3A57',sub:'#5a7894',needle:'#E03131'};
  window.KLab.register('magnet', function (el, config) {
    var mags = (config.count===2)
      ? [{x:330,y:250,ang:0},{x:580,y:250,ang:0}]
      : [{x:450,y:250,ang:0}];
    var btn='font-size:22px;padding:11px 18px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, ML=80, MW=42; // 자석 반길이/폭

    function poles(){var ps=[];mags.forEach(function(m){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
      ps.push({x:m.x+dx,y:m.y+dy,q:1}); ps.push({x:m.x-dx,y:m.y-dy,q:-1});});return ps;}
    function field(px,py){var bx=0,by=0,P=poles();for(var i=0;i<P.length;i++){var p=P[i],rx=px-p.x,ry=py-p.y,r2=rx*rx+ry*ry,r=Math.sqrt(r2);if(r<14)r=14;var inv=p.q/(r2*r);bx+=rx*inv;by+=ry*inv;}return [bx,by];}

    function buildUI(){
      var rot=mags.map(function(m,i){return '<button class="mg-btn" data-rot="'+i+'" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">↻ 자석'+(mags.length>1?(i+1):'')+' 돌리기</button>';}).join('');
      el.innerHTML='<style>.mg-btn:active{transform:translateY(2px);}.mg-stage{cursor:default;touch-action:none;}.mg-mag{cursor:grab;}.mg-stage.drag .mg-mag{cursor:grabbing;}</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-btn" data-cnt="1" style="'+btn+(mags.length===1?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 1개</button>'
          +'<button class="mg-btn" data-cnt="2" style="'+btn+(mags.length===2?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 2개</button>'
          +'<span style="width:6px;"></span>'+rot
        +'</div>'
        +'<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">자석을 끌어 옮기고, \'돌리기\'로 방향을 바꿔요. 나침반 바늘(빨강이 N극)이 자기장 방향을 가리켜요.</div>'
        +'<div class="mg-stage" style="width:100%;height:46vh;min-height:340px;background:radial-gradient(120% 120% at 50% 25%,#FCFEFF 0%,#EFF4F9 75%,#E2EAF3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="mg-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>';
      bind(); render();
    }

    var stage;
    function compass(svg,x,y){
      var f=field(x,y), ang=Math.atan2(f[1],f[0]), L=15;
      var nx=x+Math.cos(ang)*L, ny=y+Math.sin(ang)*L, sx=x-Math.cos(ang)*L, sy=y-Math.sin(ang)*L;
      var px=Math.cos(ang+Math.PI/2)*4, py=Math.sin(ang+Math.PI/2)*4;
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:17,fill:'#fff','fill-opacity':0.5,stroke:'#C7D4E0','stroke-width':1}));
      svg.appendChild(svgEl('path',{d:'M '+nx+' '+ny+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:C.needle})); // N 빨강
      svg.appendChild(svgEl('path',{d:'M '+sx+' '+sy+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:'#ADB5BD'})); // S 회색
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:2.5,fill:C.ink}));
    }
    function magnet(svg,m,i){
      var g=svgEl('g',{class:'mg-mag','data-mag':i,transform:'rotate('+(m.ang*180/Math.PI)+' '+m.x+' '+m.y+')'});
      // 그림자
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2+4,width:ML*2,height:MW,rx:8,fill:'#1A3357','fill-opacity':0.16}));
      // S(뒤, 파랑) | N(앞, 빨강)
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.S}));
      g.appendChild(svgEl('rect',{x:m.x,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.N}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW,rx:8,fill:'none',stroke:'#fff','stroke-width':2,'stroke-opacity':0.5}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW*0.4,rx:8,fill:'#fff','fill-opacity':0.18}));
      var tS=svgEl('text',{x:m.x-ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:m.x+ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
      svg.appendChild(g);
    }
    function render(){
      stage=el.querySelector('.mg-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      // 나침반 격자
      var cols=11, rows=6, mx=70, my=60;
      for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var x=mx+(VBW-2*mx)*c/(cols-1), y=my+(VBH-2*my)*r/(rows-1); compass(svg,x,y);}
      // 자석
      mags.forEach(function(m,i){magnet(svg,m,i);});
      stage.appendChild(svg);
      renderStatus();
    }
    function renderStatus(){
      var s=el.querySelector('.mg-status');
      if(mags.length===1) s.textContent='나침반 바늘이 자석을 빙 둘러 N극에서 나와 S극으로 들어가는 모양을 그려요 — 이게 자기력선이에요.';
      else s.textContent='두 자석을 가까이/멀리, 같은 극끼리 또는 다른 극끼리 마주보게 돌려 보세요. 자기장 모양이 달라져요.';
    }

    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){var g=e.target.closest?e.target.closest('.mg-mag'):null;if(!g)return;var i=+g.getAttribute('data-mag');var P=pt(e);drag={i:i,ox:P[0]-mags[i].x,oy:P[1]-mags[i].y};stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);mags[drag.i].x=Math.max(ML,Math.min(P[0]-drag.ox,VBW-ML));mags[drag.i].y=Math.max(MW,Math.min(P[1]-drag.oy,VBH-MW));render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.mg-stage');
      stage.addEventListener('mousedown',down); stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      el.querySelectorAll('[data-cnt]').forEach(function(b){b.addEventListener('click',function(){var n=+b.dataset.cnt;if(n!==mags.length){mags=(n===2)?[{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]:[{x:450,y:250,ang:0}];buildUI();}});});
      el.querySelectorAll('[data-rot]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.rot;mags[i].ang+=Math.PI/6;render();});});
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
