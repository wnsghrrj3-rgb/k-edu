/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v3
   v3 초점 = 기능 깊이. 단일 시연을 넘어 "여러 학습 활동(모드)"을 담는다.
     ▸ [한 개 보기] 모드 — 막대/원/격자 3표상으로 분수 개념·단위분수. (3학년)
     ▸ [두 개 비교] 모드 — 분수 A·B를 나란히 조작, 크기 자동 비교(>,<,=).
         동치분수(2/4=1/2)면 ＝ 강조, 통분·대소 학습을 한 화면에. (5·6학년)
   학년 올라가며 config 의 mode 만 바꿔 같은 도구로 단원을 받친다.
   v2 의 완성도(큰 도형·그림자·격자·분수패널)는 그대로 유지.

   - 의존: window.KLab (THREE 불필요)
   - config: { mode:"single"|"compare", shape:"bar"|"circle"|"grid",
               denom, numer, maxDenom,
               a:{denom,numer}, b:{denom,numer} }   // compare 초기값
   ============================================================================ */
(function () {
  if (!window.KLab) return;

  var C = {
    aTop:'#38D9A9', a:'#12B886', aEdge:'#0B7A5C',     // 분수 A (청록)
    bTop:'#FFB066', b:'#FF8A3D', bEdge:'#C24E0E',     // 분수 B (주황)
    empty:'#E7F1FB', emptyEdge:'#B8CFE8', seam:'#FFFFFF',
    num:'#0CA678', den:'#1565C0'
  };
  function bestCols(n){var best=1,t=Math.sqrt(n);for(var c=1;c<=n;c++)if(n%c===0&&Math.abs(c-t)<Math.abs(best-t))best=c;return best;}
  function mk(n,m){var a=[];m=Math.max(0,Math.min(m,n));for(var i=0;i<n;i++)a.push(i<m);return a;}
  function cnt(f){var c=0;for(var i=0;i<f.length;i++)if(f[i])c++;return c;}

  window.KLab.register('fraction', function (el, config) {
    var maxDenom = (typeof config.maxDenom==='number'&&config.maxDenom>=2)?config.maxDenom:12;
    var mode  = (config.mode==='compare')?'compare':'single';
    var shape = (['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';

    // single 상태
    var S = { denom:(typeof config.denom==='number'&&config.denom>=1)?Math.min(config.denom,maxDenom):4, filled:null };
    S.filled = mk(S.denom, (typeof config.numer==='number')?config.numer:0);
    // compare 상태
    var ca=config.a||{}, cb=config.b||{};
    var A={denom:Math.min(ca.denom||4,maxDenom)}; A.filled=mk(A.denom, ca.numer!=null?ca.numer:3);
    var B={denom:Math.min(cb.denom||3,maxDenom)}; B.filled=mk(B.denom, cb.numer!=null?cb.numer:2);

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function pt(cx,cy,r,d){var x=(d-90)*Math.PI/180;return[cx+r*Math.cos(x),cy+r*Math.sin(x)];}
    var VBW=940, VBH=480;

    // ---------- UI ----------
    var modeBtn='font-size:25px;padding:13px 24px;border-radius:18px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var sbtn='font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function buildUI(){
      var ctrl='';
      if(mode==='single'){
        ctrl='<button class="fr-btn" data-act="dminus" style="'+btn+'background:#fff;color:#1565C0;">－ 등분</button>'
            +'<button class="fr-btn" data-act="dplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 등분</button>'
            +'<span style="width:10px;"></span>'
            +'<button class="fr-sbtn fr-btn" data-shape="bar" style="'+sbtn+'">▭</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="circle" style="'+sbtn+'">◔</button>'
            +'<button class="fr-sbtn fr-btn" data-shape="grid" style="'+sbtn+'">▦</button>';
      } else {
        ctrl='<span style="font-size:22px;font-weight:800;color:'+C.a+';align-self:center;">분수 A</span>'
            +'<button class="fr-btn" data-set="A" data-d="-1" style="'+btn+'background:#fff;color:'+C.a+';border-color:'+C.a+';">－</button>'
            +'<button class="fr-btn" data-set="A" data-d="1" style="'+btn+'background:'+C.a+';color:#fff;border-color:'+C.a+';">＋ 등분</button>'
            +'<span style="width:14px;"></span>'
            +'<span style="font-size:22px;font-weight:800;color:'+C.b+';align-self:center;">분수 B</span>'
            +'<button class="fr-btn" data-set="B" data-d="-1" style="'+btn+'background:#fff;color:'+C.b+';border-color:'+C.b+';">－</button>'
            +'<button class="fr-btn" data-set="B" data-d="1" style="'+btn+'background:'+C.b+';color:#fff;border-color:'+C.b+';">＋ 등분</button>';
      }
      el.innerHTML=
        '<style>'
        +'.fr-btn:active,.fr-sbtn:active,.fr-mbtn:active{transform:translateY(2px);}'
        +'.fr-btn[disabled]{opacity:.35;cursor:not-allowed;}'
        +'.fr-sbtn.fr-on,.fr-mbtn.fr-on{color:#fff !important;}'
        +'.fr-sbtn.fr-on{background:#0B7285 !important;}.fr-mbtn.fr-on{background:#7048E8 !important;}'
        +'.fr-piece{cursor:pointer;transition:fill-opacity .25s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'.fr-piece:hover{transform:scale(1.04);}'
        +'.fr-pop{animation:frPop .32s cubic-bezier(.2,1.6,.4,1) both;}'
        +'@keyframes frPop{0%{transform:scale(.7);}60%{transform:scale(1.08);}100%{transform:scale(1);}}'
        +'</style>'
        +'<div style="display:flex;gap:11px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="fr-mbtn'+(mode==='single'?' fr-on':'')+'" data-mode="single" style="'+modeBtn+'">한 개 보기</button>'
          +'<button class="fr-mbtn'+(mode==='compare'?' fr-on':'')+'" data-mode="compare" style="'+modeBtn+'">두 개 비교</button>'
        +'</div>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl
          +'<span style="width:10px;"></span>'
          +'<button class="fr-btn" data-act="reset" style="font-size:25px;padding:13px 20px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="fr-stage" style="width:100%;height:54vh;min-height:380px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>';
      bindUI();
      render({});
    }

    function defs(svg){
      var d=svgEl('defs',{});
      d.innerHTML='<filter id="frSh" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#13315C" flood-opacity="0.20"/></filter>'
        +'<linearGradient id="frA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.aTop+'"/><stop offset="1" stop-color="'+C.a+'"/></linearGradient>'
        +'<linearGradient id="frB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.bTop+'"/><stop offset="1" stop-color="'+C.b+'"/></linearGradient>';
      svg.appendChild(d);
    }
    function fillOf(on,set){return on?('url(#fr'+(set||'A')+')'):C.empty;}

    // 막대 (공용): set 으로 색·data 구분
    function barAt(svg,x0,y0,W,H,denom,filled,set){
      var w=W/denom, g=svgEl('g',{filter:'url(#frSh)'});
      var edge=(set==='B')?C.bEdge:C.aEdge;
      for(var i=0;i<denom;i++){
        g.appendChild(svgEl('rect',{x:x0+i*w,y:y0,width:w,height:H,rx:(denom===1?16:5),fill:fillOf(filled[i],set),stroke:C.seam,'stroke-width':5,'data-set':set,'data-i':i,class:'fr-piece'}));
        if(filled[i])g.appendChild(svgEl('rect',{x:x0+i*w+7,y:y0+6,width:w-14,height:12,rx:6,fill:'#fff','fill-opacity':0.28,'pointer-events':'none'}));
      }
      g.appendChild(svgEl('rect',{x:x0,y:y0,width:W,height:H,rx:16,fill:'none',stroke:edge,'stroke-width':4,'pointer-events':'none'}));
      svg.appendChild(g);
    }

    function txt(svg,x,y,s,size,fill,anchor){var t=svgEl('text',{x:x,y:y,'text-anchor':anchor||'middle','font-family':'Jua, sans-serif','font-size':size,'font-weight':800,fill:fill});t.textContent=s;svg.appendChild(t);}
    function fracMark(svg,cx,cy,m,n,big){var s=big?96:54,gap=big?22:13,lw=big?150:84;txt(svg,cx,cy-gap,m,s,C.num);svg.appendChild(svgEl('rect',{x:cx-lw/2,y:cy+(big?-30:-18),width:lw,height:big?9:6,rx:4,fill:'#1B3A57'}));txt(svg,cx,cy+s-(big?6:2),n,s,C.den);}

    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.fr-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      defs(svg);
      if(mode==='single') renderSingle(svg,opts); else renderCompare(svg);
      stage.appendChild(svg);
      stage.querySelectorAll('.fr-piece').forEach(function(p){p.addEventListener('click',function(){
        var set=p.getAttribute('data-set'),i=+p.getAttribute('data-i');
        if(set==='A'){A.filled[i]=!A.filled[i];} else if(set==='B'){B.filled[i]=!B.filled[i];} else {S.filled[i]=!S.filled[i];}
        render({});
      });});
      updateButtons();
    }

    function renderSingle(svg,opts){
      var SX=40,SW=580;
      if(shape==='bar') barAt(svg,SX+20,(VBH-230)/2,SW,230,S.denom,S.filled,'S');
      else if(shape==='circle'){
        var cx=SX+SW/2,cy=VBH/2,r=175,g=svgEl('g',{filter:'url(#frSh)'});
        if(S.denom===1){g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:fillOf(S.filled[0],'S'),stroke:C.seam,'stroke-width':6,'data-set':'S','data-i':0,class:'fr-piece'}));}
        else{var st=360/S.denom;for(var i=0;i<S.denom;i++){var p0=pt(cx,cy,r,i*st),p1=pt(cx,cy,r,(i+1)*st),lg=(st>180)?1:0;g.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+p0[0]+' '+p0[1]+' A '+r+' '+r+' 0 '+lg+' 1 '+p1[0]+' '+p1[1]+' Z',fill:fillOf(S.filled[i],'S'),stroke:C.seam,'stroke-width':5,'data-set':'S','data-i':i,class:'fr-piece'}));}}
        g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:C.aEdge,'stroke-width':5,'pointer-events':'none'}));svg.appendChild(g);
      } else {
        var cols=bestCols(S.denom),rows=Math.ceil(S.denom/cols),cell=Math.min((SW)/cols,300/rows,118)-8;
        var gw=cell*cols+8*(cols-1),gh=cell*rows+8*(rows-1),x0=SX+(SW-gw)/2,y0=(VBH-gh)/2,g=svgEl('g',{filter:'url(#frSh)'});
        for(var i=0;i<S.denom;i++){var c=i%cols,r2=Math.floor(i/cols);g.appendChild(svgEl('rect',{x:x0+c*(cell+8),y:y0+r2*(cell+8),width:cell,height:cell,rx:11,fill:fillOf(S.filled[i],'S'),stroke:(S.filled[i]?C.aEdge:C.emptyEdge),'stroke-width':4,'data-set':'S','data-i':i,class:'fr-piece'}));}
        svg.appendChild(g);
      }
      // S는 frA 그라데 사용
      // 패널
      var px=720; fracMark(svg,px,150,cnt(S.filled),S.denom,true);
      txt(svg,px,375,'똑같이 '+S.denom+'로 나눈 것 중 '+cnt(S.filled)+'개',24,'#1B3A57');
      txt(svg,px,412,'한 조각 = 1/'+S.denom+' (단위분수)',21,'#5a7894');
    }

    function renderCompare(svg){
      var x0=50,W=560,H=120;
      barAt(svg,x0,80,W,H,A.denom,A.filled,'A');
      barAt(svg,x0,270,W,H,B.denom,B.filled,'B');
      // 작은 분수 표기 (각 막대 우측)
      fracMark(svg,x0+W+70,135,cnt(A.filled),A.denom,false);
      fracMark(svg,x0+W+70,325,cnt(B.filled),B.denom,false);
      // 비교 부호 (가운데 우측 큰)
      var va=cnt(A.filled)/A.denom, vb=cnt(B.filled)/B.denom;
      var sign = (Math.abs(va-vb)<1e-9)?'＝':(va>vb?'＞':'＜');
      var isEq = sign==='＝';
      txt(svg,x0+W+70,232, sign, isEq?92:84, isEq?'#7048E8':'#1B3A57');
      if(isEq && (cnt(A.filled)!==cnt(B.filled))) txt(svg,VBW/2,455,'크기가 같아요 — 동치분수!',26,'#7048E8');
    }

    function updateButtons(){
      var dp=el.querySelector('[data-act="dplus"]'),dm=el.querySelector('[data-act="dminus"]');
      if(dp)dp.disabled=S.denom>=maxDenom; if(dm)dm.disabled=S.denom<=1;
      el.querySelectorAll('[data-set]').forEach(function(b){
        if(b.classList.contains('fr-piece'))return;
        var set=b.dataset.set,d=+b.dataset.d,o=(set==='A')?A:B;
        if(d>0)b.disabled=o.denom>=maxDenom; else b.disabled=o.denom<=1;
      });
    }

    function bindUI(){
      el.querySelectorAll('.fr-mbtn').forEach(function(b){b.addEventListener('click',function(){if(mode===b.dataset.mode)return;mode=b.dataset.mode;buildUI();});});
      var dp=el.querySelector('[data-act="dplus"]'),dm=el.querySelector('[data-act="dminus"]');
      if(dp)dp.addEventListener('click',function(){if(S.denom<maxDenom){S.denom++;S.filled=mk(S.denom,0);render({});}});
      if(dm)dm.addEventListener('click',function(){if(S.denom>1){S.denom--;S.filled=mk(S.denom,0);render({});}});
      el.querySelectorAll('.fr-sbtn').forEach(function(b){b.addEventListener('click',function(){shape=b.dataset.shape;el.querySelectorAll('.fr-sbtn').forEach(function(x){x.classList.toggle('fr-on',x.dataset.shape===shape);});render({});});});
      el.querySelectorAll('.fr-btn[data-set]').forEach(function(b){b.addEventListener('click',function(){
        var set=b.dataset.set,d=+b.dataset.d,o=(set==='A')?A:B;
        var nv=o.denom+d; if(nv<1||nv>maxDenom)return; o.denom=nv; o.filled=mk(o.denom,0); render({});
      });});
      var rs=el.querySelector('[data-act="reset"]');
      if(rs)rs.addEventListener('click',function(){
        if(mode==='single'){S.denom=(typeof config.denom==='number')?Math.min(config.denom,maxDenom):4;S.filled=mk(S.denom,(typeof config.numer==='number')?config.numer:0);}
        else{A.denom=Math.min(ca.denom||4,maxDenom);A.filled=mk(A.denom,ca.numer!=null?ca.numer:3);B.denom=Math.min(cb.denom||3,maxDenom);B.filled=mk(B.denom,cb.numer!=null?cb.numer:2);}
        render({});
      });
      el.querySelectorAll('.fr-sbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.shape===shape);});
    }

    buildUI();
    return function cleanup(){};
  });
})();
