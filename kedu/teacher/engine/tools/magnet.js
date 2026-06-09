/* ============================================================================
   케이랩 도구 모듈 — 자석·자기장 (magnet) v2  [과학 3호]
   3학년 자석의 이용.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 자기력선(field line) 실제 곡선 — N극에서 나와 S극으로 휘어 들어가는
        눈에 안 보이는 자기장을 그려서 보여줌. (v1은 나침반 격자뿐)
     ▸ 보기 토글 — [자기력선]/[나침반]. 두 방식으로 같은 자기장을 봄.
     ▸ 끌림·밀림 — 두 자석이 마주본 극을 판정해 끌리는지 미는지 설명.
     ▸ 탐구 미션 2종 — 끌리게(다른 극 마주) / 밀리게(같은 극 마주) 만들기.
   변수 → 현상 → 발견:
     자석을 옮기고 돌리고 1·2개 전환 → 자기장 모양 변화 →
     "자석 둘레엔 눈에 안 보이는 자기장이 있고, 다른 극은 당기고 같은 극은 민다."
   - 의존: window.KLab (순수 SVG)
   - config: { count(자석 1|2, 기본1) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={N:'#E03131',S:'#1C7ED6',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',line:'#7048E8'};
  window.KLab.register('magnet', function (el, config) {
    var mags = (config.count===2)
      ? [{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]
      : [{x:450,y:250,ang:0}];
    var view='lines';                 // 'lines' | 'compass'
    var done={attract:false,repel:false};
    var btn='font-size:21px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, ML=80, MW=42; // 자석 반길이/폭

    function poles(){var ps=[];mags.forEach(function(m){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
      ps.push({x:m.x+dx,y:m.y+dy,q:1}); ps.push({x:m.x-dx,y:m.y-dy,q:-1});});return ps;}
    function field(px,py){var bx=0,by=0,P=poles();for(var i=0;i<P.length;i++){var p=P[i],rx=px-p.x,ry=py-p.y,r2=rx*rx+ry*ry,r=Math.sqrt(r2);if(r<14)r=14;var inv=p.q/(r2*r);bx+=rx*inv;by+=ry*inv;}return [bx,by];}

    // 자기력선: N극 둘레 시작점에서 필드 방향을 따라 적분하며 S극으로 추적
    function trace(sx,sy){
      var pts=[sx+','+sy], x=sx, y=sy, step=5, P=poles();
      for(var k=0;k<260;k++){
        var f=field(x,y), m=Math.sqrt(f[0]*f[0]+f[1]*f[1]); if(m<1e-9)break;
        x+=f[0]/m*step; y+=f[1]/m*step;
        if(x<-40||x>VBW+40||y<-40||y>VBH+40)break;
        pts.push(x.toFixed(1)+','+y.toFixed(1));
        var stop=false;                       // S극에 충분히 가까우면 멈춤
        for(var j=0;j<P.length;j++){if(P[j].q<0&&Math.hypot(x-P[j].x,y-P[j].y)<14){stop=true;break;}}
        if(stop)break;
      }
      return pts.join(' ');
    }
    function fieldLines(svg){
      mags.forEach(function(m){
        var nx=m.x+Math.cos(m.ang)*ML, ny=m.y+Math.sin(m.ang)*ML;   // 이 자석 N극
        for(var a=0;a<360;a+=45){var rad=a*Math.PI/180;
          var sx=nx+Math.cos(rad)*16, sy=ny+Math.sin(rad)*16;
          svg.appendChild(svgEl('polyline',{points:trace(sx,sy),fill:'none',stroke:C.line,'stroke-width':2,'stroke-opacity':0.5,'stroke-linecap':'round'}));
        }
      });
    }

    function facing(){
      if(mags.length<2)return null;
      function near(m,t){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
        return Math.hypot(m.x+dx-t.x,m.y+dy-t.y) < Math.hypot(m.x-dx-t.x,m.y-dy-t.y) ? 'N':'S';}
      var pa=near(mags[0],mags[1]), pb=near(mags[1],mags[0]);
      var dist=Math.hypot(mags[0].x-mags[1].x,mags[0].y-mags[1].y);
      return {kind:(pa===pb?'repel':'attract'), pa:pa, pb:pb, near:dist<320};
    }

    function buildUI(){
      var rot=mags.map(function(m,i){return '<button class="mg-btn" data-rot="'+i+'" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">↻ 자석'+(mags.length>1?(i+1):'')+' 돌리기</button>';}).join('');
      var chips='';
      if(mags.length===2){
        chips='<div style="display:flex;gap:7px;justify-content:center;margin-bottom:7px;flex-wrap:wrap;"><span style="font-size:15px;color:'+C.sub+';align-self:center;font-weight:800;">미션</span>'
          +'<button class="mg-chip'+(done.attract?' done':'')+'" data-mi="attract" style="font-size:16px;padding:7px 13px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:'+C.sub+';cursor:pointer;font-weight:800;font-family:inherit;">'+(done.attract?'✓ ':'')+'🧲 끌리게 (다른 극 마주)</button>'
          +'<button class="mg-chip'+(done.repel?' done':'')+'" data-mi="repel" style="font-size:16px;padding:7px 13px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:'+C.sub+';cursor:pointer;font-weight:800;font-family:inherit;">'+(done.repel?'✓ ':'')+'💢 밀리게 (같은 극 마주)</button></div>';
      }
      el.innerHTML='<style>.mg-btn:active,.mg-chip:active{transform:translateY(2px);}.mg-stage{cursor:default;touch-action:none;}.mg-mag{cursor:grab;}.mg-stage.drag .mg-mag{cursor:grabbing;}'
        +'.mg-chip.done{background:#E6FCF5 !important;border-color:'+C.good+' !important;color:'+C.good+' !important;}'
        +'.mg-view.on{background:#7048E8 !important;color:#fff !important;}</style>'
        +'<div style="display:flex;gap:7px;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-view'+(view==='lines'?' on':'')+'" data-view="lines" style="'+btn+'border-color:#7048E8;'+(view==='lines'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧲 자기력선</button>'
          +'<button class="mg-view'+(view==='compass'?' on':'')+'" data-view="compass" style="'+btn+'border-color:#7048E8;'+(view==='compass'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧭 나침반</button>'
        +'</div>'
        +chips
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-btn" data-cnt="1" style="'+btn+(mags.length===1?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 1개</button>'
          +'<button class="mg-btn" data-cnt="2" style="'+btn+(mags.length===2?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 2개</button>'
          +'<span style="width:6px;"></span>'+rot
        +'</div>'
        +'<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">자석을 끌어 옮기고, \'돌리기\'로 방향을 바꿔요. '+(view==='lines'?'보라색 선이 자기력선이에요(N극→S극).':'나침반 바늘(빨강이 N극)이 자기장 방향을 가리켜요.')+'</div>'
        +'<div class="mg-stage" style="width:100%;height:42vh;min-height:330px;background:radial-gradient(120% 120% at 50% 25%,#FCFEFF 0%,#EFF4F9 75%,#E2EAF3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="mg-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>';
      bind(); render();
    }

    var stage;
    function compass(svg,x,y){
      var f=field(x,y), ang=Math.atan2(f[1],f[0]), L=15;
      var nx=x+Math.cos(ang)*L, ny=y+Math.sin(ang)*L, sx=x-Math.cos(ang)*L, sy=y-Math.sin(ang)*L;
      var px=Math.cos(ang+Math.PI/2)*4, py=Math.sin(ang+Math.PI/2)*4;
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:17,fill:'#fff','fill-opacity':0.5,stroke:'#C7D4E0','stroke-width':1}));
      svg.appendChild(svgEl('path',{d:'M '+nx+' '+ny+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:C.N}));
      svg.appendChild(svgEl('path',{d:'M '+sx+' '+sy+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:'#ADB5BD'}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:2.5,fill:C.ink}));
    }
    function magnet(svg,m,i){
      var g=svgEl('g',{class:'mg-mag','data-mag':i,transform:'rotate('+(m.ang*180/Math.PI)+' '+m.x+' '+m.y+')'});
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2+4,width:ML*2,height:MW,rx:8,fill:'#1A3357','fill-opacity':0.16}));
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
      if(view==='lines'){ fieldLines(svg); }
      else { var cols=11, rows=6, mx=70, my=60;
        for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var x=mx+(VBW-2*mx)*c/(cols-1), y=my+(VBH-2*my)*r/(rows-1); compass(svg,x,y);} }
      mags.forEach(function(m,i){magnet(svg,m,i);});
      stage.appendChild(svg);
      renderStatus();
    }
    function renderStatus(){
      var s=el.querySelector('.mg-status');
      if(mags.length===1){
        s.textContent='자기력선이 자석을 빙 둘러 N극에서 나와 S극으로 들어가요 — 이게 눈에 안 보이는 자기장이에요. 자석을 돌려도 자기장이 함께 따라 돌아요.';
        return;
      }
      var f=facing(), msg, sub, col=C.sub;
      if(!f.near){ msg='두 자석이 멀어요'; sub='가까이 옮기면 두 자석 사이 자기장이 서로 영향을 줘요.'; }
      else if(f.kind==='attract'){ msg='<span style="color:'+C.good+';">서로 끌려요 🧲</span>'; sub='마주본 극이 다르면(N–S) 자기력선이 한 자석에서 다른 자석으로 이어져 서로 당겨요.';
        if(!done.attract)mark('attract'); }
      else { msg='<span style="color:'+C.N+';">서로 밀어내요 💢</span>'; sub='마주본 극이 같으면(N–N 또는 S–S) 자기력선이 부딪쳐 갈라지고 서로 밀어내요.';
        if(!done.repel)mark('repel'); }
      s.innerHTML='<div style="font-size:21px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:4px;">'+sub+'</div>';
    }
    function mark(k){ done[k]=true;
      el.querySelectorAll('.mg-chip').forEach(function(c){if(c.dataset.mi===k&&!c.classList.contains('done')){c.classList.add('done');if(c.textContent.indexOf('✓')<0)c.textContent='✓ '+c.textContent;}});
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
      el.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){if(view!==b.dataset.view){view=b.dataset.view;buildUI();}});});
      el.querySelectorAll('[data-cnt]').forEach(function(b){b.addEventListener('click',function(){var n=+b.dataset.cnt;if(n!==mags.length){mags=(n===2)?[{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]:[{x:450,y:250,ang:0}];buildUI();}});});
      el.querySelectorAll('[data-rot]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.rot;mags[i].ang+=Math.PI/6;render();});});
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
