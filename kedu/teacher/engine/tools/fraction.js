/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v4
   v4 초점 = 범위 완전성. 진분수에서 멈추지 않고 분수의 모든 모습을 담는다.
     ▸ 진분수(3/4) · 가분수(7/4) · 대분수(1과 3/4) · 자연수(8/4=2) 전부 표현.
     ▸ "전체(1)"를 여러 개(maxWholes) 둘 수 있어 1을 넘는 양도 눈으로.
     ▸ 가분수 ⇄ 대분수 표기 토글 — 같은 양의 두 이름을 동시에. (4학년 핵심)
     ▸ 표상 3종(막대/원/격자) + [한 개 보기]/[두 개 비교](대소·동치) 모드.
   학년·단원별 config 로 같은 도구가 분수 단원 전체(3~6학년)를 받친다.

   - 의존: window.KLab (THREE 불필요)
   - config: { mode:"single"|"compare", shape:"bar"|"circle"|"grid",
               denom, numer, maxDenom, maxWholes(기본3), notation:"improper"|"mixed",
               a:{denom,numer}, b:{denom,numer} }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={aTop:'#38D9A9',a:'#12B886',aEdge:'#0B7A5C',bTop:'#FFB066',b:'#FF8A3D',bEdge:'#C24E0E',
         empty:'#E7F1FB',emptyEdge:'#B8CFE8',seam:'#FFFFFF',num:'#0CA678',den:'#1565C0',whole:'#7048E8'};
  function bestCols(n){var x=1,t=Math.sqrt(n);for(var c=1;c<=n;c++)if(n%c===0&&Math.abs(c-t)<Math.abs(x-t))x=c;return x;}

  window.KLab.register('fraction', function (el, config) {
    var maxDenom=(typeof config.maxDenom==='number'&&config.maxDenom>=2)?config.maxDenom:12;
    var maxWholes=(typeof config.maxWholes==='number'&&config.maxWholes>=1)?config.maxWholes:3;
    var mode=(config.mode==='compare')?'compare':'single';
    var shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';
    var notation=(config.notation==='mixed')?'mixed':'improper';
    // single: denom 등분, numer 색칠(0 ~ denom*maxWholes)
    var Sd=(typeof config.denom==='number'&&config.denom>=1)?Math.min(config.denom,maxDenom):4;
    var Sn=(typeof config.numer==='number')?Math.max(0,Math.min(config.numer,Sd*maxWholes)):0;
    // compare
    var ca=config.a||{},cb=config.b||{};
    var Ad=Math.min(ca.denom||4,maxDenom),An=(ca.numer!=null?ca.numer:3);
    var Bd=Math.min(cb.denom||3,maxDenom),Bn=(cb.numer!=null?cb.numer:2);

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function pt(cx,cy,r,d){var x=(d-90)*Math.PI/180;return[cx+r*Math.cos(x),cy+r*Math.sin(x)];}
    var VBW=940,VBH=480;

    var modeBtn='font-size:24px;padding:12px 22px;border-radius:18px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var nbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #C24E0E;background:#fff;color:#C24E0E;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function buildUI(){
      var ctrl;
      if(mode==='single'){
        ctrl='<button class="fr-btn" data-act="nminus" style="'+btn+'background:#fff;color:'+C.num+';border-color:'+C.num+';">－ 조각</button>'
            +'<button class="fr-btn" data-act="nplus" style="'+btn+'background:'+C.num+';color:#fff;border-color:'+C.num+';">＋ 조각</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-btn" data-act="dminus" style="'+btn+'background:#fff;color:#1565C0;">－ 등분</button>'
            +'<button class="fr-btn" data-act="dplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 등분</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-sbtn fr-btn" data-shape="bar" style="'+sbtn+'">▭</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="circle" style="'+sbtn+'">◔</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="grid" style="'+sbtn+'">▦</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-nbtn fr-btn" data-notation="improper" style="'+nbtn+'">가분수</button>'
            +'<button class="fr-nbtn fr-btn" data-notation="mixed" style="'+nbtn+'">대분수</button>';
      } else {
        ctrl='<span style="font-size:21px;font-weight:800;color:'+C.a+';align-self:center;">A</span>'
            +'<button class="fr-btn" data-set="A" data-k="n" data-d="-1" style="'+btn+'background:#fff;color:'+C.a+';border-color:'+C.a+';">－조각</button>'
            +'<button class="fr-btn" data-set="A" data-k="n" data-d="1" style="'+btn+'background:'+C.a+';color:#fff;border-color:'+C.a+';">＋조각</button>'
            +'<button class="fr-btn" data-set="A" data-k="d" data-d="-1" style="'+btn+'background:#fff;color:'+C.a+';border-color:'+C.a+';">－등분</button>'
            +'<button class="fr-btn" data-set="A" data-k="d" data-d="1" style="'+btn+'background:'+C.a+';color:#fff;border-color:'+C.a+';">＋등분</button>'
            +'<span style="width:12px;"></span>'
            +'<span style="font-size:21px;font-weight:800;color:'+C.b+';align-self:center;">B</span>'
            +'<button class="fr-btn" data-set="B" data-k="n" data-d="-1" style="'+btn+'background:#fff;color:'+C.b+';border-color:'+C.b+';">－조각</button>'
            +'<button class="fr-btn" data-set="B" data-k="n" data-d="1" style="'+btn+'background:'+C.b+';color:#fff;border-color:'+C.b+';">＋조각</button>'
            +'<button class="fr-btn" data-set="B" data-k="d" data-d="-1" style="'+btn+'background:#fff;color:'+C.b+';border-color:'+C.b+';">－등분</button>'
            +'<button class="fr-btn" data-set="B" data-k="d" data-d="1" style="'+btn+'background:'+C.b+';color:#fff;border-color:'+C.b+';">＋등분</button>';
      }
      el.innerHTML='<style>'
        +'.fr-btn:active,.fr-sbtn:active,.fr-mbtn:active,.fr-nbtn:active{transform:translateY(2px);}'
        +'.fr-btn[disabled]{opacity:.32;cursor:not-allowed;}'
        +'.fr-sbtn.fr-on{background:#0B7285 !important;color:#fff !important;}'
        +'.fr-nbtn.fr-on{background:#C24E0E !important;color:#fff !important;}'
        +'.fr-mbtn.fr-on{background:#7048E8 !important;color:#fff !important;}'
        +'.fr-piece{cursor:pointer;transition:fill-opacity .25s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'.fr-piece:hover{transform:scale(1.04);}'
        +'</style>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="fr-mbtn'+(mode==='single'?' fr-on':'')+'" data-mode="single" style="'+modeBtn+'">한 개 보기</button>'
          +'<button class="fr-mbtn'+(mode==='compare'?' fr-on':'')+'" data-mode="compare" style="'+modeBtn+'">두 개 비교</button>'
        +'</div>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'+ctrl
          +'<span style="width:8px;"></span>'
          +'<button class="fr-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="fr-stage" style="width:100%;height:52vh;min-height:370px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>';
      bindUI(); render();
    }

    function defs(svg){var d=svgEl('defs',{});d.innerHTML=
      '<filter id="frSh" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#13315C" flood-opacity="0.20"/></filter>'
      +'<linearGradient id="frA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.aTop+'"/><stop offset="1" stop-color="'+C.a+'"/></linearGradient>'
      +'<linearGradient id="frB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.bTop+'"/><stop offset="1" stop-color="'+C.b+'"/></linearGradient>';
      svg.appendChild(d);}
    function fillOf(on,set){return on?('url(#fr'+(set==='B'?'B':'A')+')'):C.empty;}

    // 여러 전체에 걸친 막대들: wholes개, 각 denom등분, 전역 numer 색칠
    function barsAt(svg,x0,y0,W,H,denom,numer,set){
      var wholes=Math.max(1,Math.min(Math.ceil(numer/denom)||1,maxWholes)); if(numer===0)wholes=1;
      var gap=18, ww=(W-gap*(wholes-1))/wholes, edge=(set==='B')?C.bEdge:C.aEdge;
      var gk=0;
      for(var w=0;w<wholes;w++){
        var wx=x0+w*(ww+gap), cw=ww/denom, g=svgEl('g',{filter:'url(#frSh)'});
        for(var i=0;i<denom;i++){
          var on=gk<numer;
          g.appendChild(svgEl('rect',{x:wx+i*cw,y:y0,width:cw,height:H,rx:(denom===1?14:4),fill:fillOf(on,set),stroke:C.seam,'stroke-width':4,'data-gk':gk,'data-set':set,class:'fr-piece'}));
          if(on)g.appendChild(svgEl('rect',{x:wx+i*cw+5,y:y0+5,width:cw-10,height:10,rx:5,fill:'#fff','fill-opacity':0.28,'pointer-events':'none'}));
          gk++;
        }
        g.appendChild(svgEl('rect',{x:wx,y:y0,width:ww,height:H,rx:13,fill:'none',stroke:edge,'stroke-width':4,'pointer-events':'none'}));
        svg.appendChild(g);
      }
    }
    function circlesAt(svg,cxC,cy,rBase,denom,numer,set){
      var wholes=Math.max(1,Math.min(Math.ceil(numer/denom)||1,maxWholes)); if(numer===0)wholes=1;
      var r=Math.min(rBase,(580/wholes-30)/2), gap=24, total=wholes*(2*r)+gap*(wholes-1), startx=cxC-total/2+r, gk=0, edge=(set==='B')?C.bEdge:C.aEdge;
      for(var w=0;w<wholes;w++){
        var cx=startx+w*(2*r+gap), g=svgEl('g',{filter:'url(#frSh)'});
        if(denom===1){g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:fillOf(gk<numer,set),stroke:C.seam,'stroke-width':5,'data-gk':gk,'data-set':set,class:'fr-piece'}));gk++;}
        else{var st=360/denom;for(var i=0;i<denom;i++){var p0=pt(cx,cy,r,i*st),p1=pt(cx,cy,r,(i+1)*st),lg=(st>180)?1:0;g.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+p0[0]+' '+p0[1]+' A '+r+' '+r+' 0 '+lg+' 1 '+p1[0]+' '+p1[1]+' Z',fill:fillOf(gk<numer,set),stroke:C.seam,'stroke-width':4,'data-gk':gk,'data-set':set,class:'fr-piece'}));gk++;}}
        g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:edge,'stroke-width':4,'pointer-events':'none'}));
        svg.appendChild(g);
      }
    }

    function txt(svg,x,y,s,size,fill,anchor){var t=svgEl('text',{x:x,y:y,'text-anchor':anchor||'middle','font-family':'Jua, sans-serif','font-size':size,'font-weight':800,fill:fill});t.textContent=s;svg.appendChild(t);}
    // 분수 표기 (가분수 or 대분수)
    function notate(m,n,style){
      var W=Math.floor(m/n), r=m%n;
      if(style==='mixed'){ if(r===0) return {whole:String(W),m:null,n:null}; return {whole:(W>0?String(W):''),m:String(r),n:String(n)}; }
      return {whole:'',m:String(m),n:String(n)}; // improper
    }
    function drawFrac(svg,cx,cy,m,n,style,big){
      var o=notate(m,n,style), s=big?86:48, gap=big?20:12, lw=big?130:74, fx=cx;
      if(o.whole){ txt(svg,cx-(o.m?(big?95:55):0),cy+ (o.m?(big?30:18):0), o.whole, big?108:60, C.whole); fx=cx+(o.m?(big?45:28):0); }
      if(o.m!==null){ txt(svg,fx,cy-gap,o.m,s,C.num); svg.appendChild(svgEl('rect',{x:fx-lw/2,y:cy+(big?-28:-16),width:lw,height:big?8:6,rx:4,fill:'#1B3A57'})); txt(svg,fx,cy+s-(big?4:0),o.n,s,C.den); }
    }

    function render(){
      var stage=el.querySelector('.fr-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      if(mode==='single') renderSingle(svg); else renderCompare(svg);
      stage.appendChild(svg);
      stage.querySelectorAll('.fr-piece').forEach(function(p){p.addEventListener('click',function(){
        var gk=+p.getAttribute('data-gk'), set=p.getAttribute('data-set');
        if(set==='A'){An=(An===gk+1)?gk:gk+1;} else if(set==='B'){Bn=(Bn===gk+1)?gk:gk+1;} else {Sn=(Sn===gk+1)?gk:gk+1;}
        render();
      });});
      updateButtons();
    }

    function renderSingle(svg){
      var SX=40,SW=600;
      if(shape==='bar') barsAt(svg,SX,(VBH-200)/2-10,SW,200,Sd,Sn,'S');
      else if(shape==='circle') circlesAt(svg,SX+SW/2,VBH/2-10,150,Sd,Sn,'S');
      else { // 격자: 전체별 블록
        var wholes=Math.max(1,Math.min(Math.ceil(Sn/Sd)||1,maxWholes)); if(Sn===0)wholes=1;
        var cols=bestCols(Sd),rows=Math.ceil(Sd/cols),gap=20,bw=(SW-gap*(wholes-1))/wholes;
        var cell=Math.min(bw/cols,260/rows,90)-6, gk=0;
        for(var w=0;w<wholes;w++){
          var gw=cell*cols+6*(cols-1),gh=cell*rows+6*(rows-1),bx=SX+w*(bw+gap)+(bw-gw)/2,by=(VBH-gh)/2-10,g=svgEl('g',{filter:'url(#frSh)'});
          for(var i=0;i<Sd;i++){var c=i%cols,r2=Math.floor(i/cols),on=gk<Sn;g.appendChild(svgEl('rect',{x:bx+c*(cell+6),y:by+r2*(cell+6),width:cell,height:cell,rx:9,fill:fillOf(on,'S'),stroke:(on?C.aEdge:C.emptyEdge),'stroke-width':3,'data-gk':gk,'data-set':'S',class:'fr-piece'}));gk++;}
          svg.appendChild(g);
        }
      }
      // 패널: 선택 표기 크게 + 다른 표기 보조
      var px=750, other=(notation==='improper')?'mixed':'improper';
      drawFrac(svg,px,140,Sn,Sd,notation,true);
      var o2=notate(Sn,Sd,other);
      var sub=(other==='mixed')?(o2.m!==null?(o2.whole?o2.whole+'과 ':'')+o2.m+'/'+o2.n:o2.whole):(o2.m+'/'+o2.n);
      txt(svg,px,300,'＝ '+sub,30,'#5a7894');
      txt(svg,px,360,'전체 1을 '+Sd+'로 나눈 조각 '+Sn+'개',23,'#1B3A57');
      txt(svg,px,396,'한 조각 = 1/'+Sd,21,'#5a7894');
    }

    function renderCompare(svg){
      var x0=50,W=540,H=110;
      barsAt(svg,x0,75,W,H,Ad,An,'A');
      barsAt(svg,x0,275,W,H,Bd,Bn,'B');
      drawFrac(svg,x0+W+75,128,An,Ad,'improper',false);
      drawFrac(svg,x0+W+75,328,Bn,Bd,'improper',false);
      var va=An/Ad, vb=Bn/Bd, eq=Math.abs(va-vb)<1e-9, sign=eq?'＝':(va>vb?'＞':'＜');
      txt(svg,VBW/2,238,sign,eq?86:78,eq?C.whole:'#1B3A57');
      if(eq && An!==Bn) txt(svg,VBW/2,455,'크기가 같아요 — 동치분수!',25,C.whole);
    }

    function updateButtons(){
      function set(sel,dis){var b=el.querySelector(sel);if(b)b.disabled=dis;}
      if(mode==='single'){
        set('[data-act="nplus"]',Sn>=Sd*maxWholes); set('[data-act="nminus"]',Sn<=0);
        set('[data-act="dplus"]',Sd>=maxDenom); set('[data-act="dminus"]',Sd<=1);
      } else {
        el.querySelectorAll('.fr-btn[data-set]').forEach(function(b){
          var s=b.dataset.set,k=b.dataset.k,d=+b.dataset.d, dn=(s==='A')?Ad:Bd, nm=(s==='A')?An:Bn;
          if(k==='n')b.disabled=(d>0)?nm>=dn*maxWholes:nm<=0; else b.disabled=(d>0)?dn>=maxDenom:dn<=1;
        });
      }
    }

    function bindUI(){
      el.querySelectorAll('.fr-mbtn').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;buildUI();}});});
      function clampN(){Sn=Math.max(0,Math.min(Sn,Sd*maxWholes));}
      var h={
        nplus:function(){if(Sn<Sd*maxWholes){Sn++;render();}},
        nminus:function(){if(Sn>0){Sn--;render();}},
        dplus:function(){if(Sd<maxDenom){Sd++;clampN();render();}},
        dminus:function(){if(Sd>1){Sd--;clampN();render();}},
        reset:function(){
          if(mode==='single'){Sd=(typeof config.denom==='number')?Math.min(config.denom,maxDenom):4;Sn=(typeof config.numer==='number')?config.numer:0;notation=(config.notation==='mixed')?'mixed':'improper';shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';}
          else{Ad=Math.min(ca.denom||4,maxDenom);An=(ca.numer!=null?ca.numer:3);Bd=Math.min(cb.denom||3,maxDenom);Bn=(cb.numer!=null?cb.numer:2);}
          buildUI();
        }
      };
      el.querySelectorAll('.fr-btn[data-act]').forEach(function(b){b.addEventListener('click',function(){var f=h[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.fr-sbtn').forEach(function(b){b.addEventListener('click',function(){shape=b.dataset.shape;el.querySelectorAll('.fr-sbtn').forEach(function(x){x.classList.toggle('fr-on',x.dataset.shape===shape);});render();});});
      el.querySelectorAll('.fr-nbtn').forEach(function(b){b.addEventListener('click',function(){notation=b.dataset.notation;el.querySelectorAll('.fr-nbtn').forEach(function(x){x.classList.toggle('fr-on',x.dataset.notation===notation);});render();});});
      el.querySelectorAll('.fr-btn[data-set]').forEach(function(b){b.addEventListener('click',function(){
        var s=b.dataset.set,k=b.dataset.k,d=+b.dataset.d;
        if(s==='A'){if(k==='n'){An=Math.max(0,Math.min(An+d,Ad*maxWholes));}else{var nd=Ad+d;if(nd>=1&&nd<=maxDenom){Ad=nd;An=Math.min(An,Ad*maxWholes);}}}
        else{if(k==='n'){Bn=Math.max(0,Math.min(Bn+d,Bd*maxWholes));}else{var nd2=Bd+d;if(nd2>=1&&nd2<=maxDenom){Bd=nd2;Bn=Math.min(Bn,Bd*maxWholes);}}}
        render();
      });});
      el.querySelectorAll('.fr-sbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.shape===shape);});
      el.querySelectorAll('.fr-nbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.notation===notation);});
    }

    buildUI();
    return function cleanup(){};
  });
})();
