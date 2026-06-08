/* ============================================================================
   케이랩 도구 모듈 — 분수 모형 (fraction) v5
   v5 초점 = 깊이. "보여주는 분수기"에서 "가르치는 분수기"로.
     ▸ [통분 시각화 + 오개념 가드] 두 개 비교에서 분모가 다르면 그냥 조각 수로
       비교 못 한다는 걸 짚고, [같은 크기로 맞추기]로 공통분모 등분을 눈으로.
       (분수 최대 오개념 "분모 큰 게 큰 수 / 분자만 비교" 직격 · 덧뺄셈 디딤돌)
     ▸ [동치 발견] 한 개 보기에서 약분 가능하면 기약분수를 같은 길이로 나란히
       보여줘 "2/4 = 1/2, 색칠한 양이 같네!"를 스스로 발견.
     ▸ [자기점검 퀴즈] "□/□ 만큼 색칠해봐" 목표 제시 → 직접 만들고 확인 →
       맞다/다시 판정. 같은 양이면 동치도 정답(2/4로 1/2 정답 인정).
       → 케이티처(교사 시연) + 자기주도(혼자 풀고 점검) 양쪽에서 살아남.
   v4 자산(완성도·다양성)은 그대로 유지. 깊이는 전부 config 토글 → 기존 동작 불변.

   - 의존: window.KLab (THREE 불필요)
   - config: { mode:"single"|"compare"|"quiz", shape:"bar"|"circle"|"grid",
               denom, numer, maxDenom, maxWholes(기본3), notation:"improper"|"mixed",
               a:{denom,numer}, b:{denom,numer},
               equiv(기본true), commonize(기본true), showQuiz(기본false) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={aTop:'#38D9A9',a:'#12B886',aEdge:'#0B7A5C',bTop:'#FFB066',b:'#FF8A3D',bEdge:'#C24E0E',
         empty:'#E7F1FB',emptyEdge:'#B8CFE8',seam:'#FFFFFF',num:'#0CA678',den:'#1565C0',whole:'#7048E8',
         warn:'#E8590C',good:'#12B886',hint:'#1565C0'};
  function bestCols(n){var x=1,t=Math.sqrt(n);for(var c=1;c<=n;c++)if(n%c===0&&Math.abs(c-t)<Math.abs(x-t))x=c;return x;}
  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
  function lcm(a,b){return a/gcd(a,b)*b;}

  window.KLab.register('fraction', function (el, config) {
    var maxDenom=(typeof config.maxDenom==='number'&&config.maxDenom>=2)?config.maxDenom:12;
    var maxWholes=(typeof config.maxWholes==='number'&&config.maxWholes>=1)?config.maxWholes:3;
    var mode=(['single','compare','quiz'].indexOf(config.mode)>=0)?config.mode:'single';
    var shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';
    var notation=(config.notation==='mixed')?'mixed':'improper';
    // v5 깊이 토글
    var equivOn=(config.equiv!==false);
    var commonOn=(config.commonize!==false);
    var showQuiz=(config.showQuiz===true);
    if(mode==='quiz') showQuiz=true; // 시작이 퀴즈면 버튼도 당연히 노출
    // single: denom 등분, numer 색칠(0 ~ denom*maxWholes)
    var Sd=(typeof config.denom==='number'&&config.denom>=1)?Math.min(config.denom,maxDenom):4;
    var Sn=(typeof config.numer==='number')?Math.max(0,Math.min(config.numer,Sd*maxWholes)):0;
    // compare
    var ca=config.a||{},cb=config.b||{};
    var Ad=Math.min(ca.denom||4,maxDenom),An=(ca.numer!=null?ca.numer:3);
    var Bd=Math.min(cb.denom||3,maxDenom),Bn=(cb.numer!=null?cb.numer:2);
    var commonized=false; // 통분 토글 상태
    // quiz
    var qN=0,qD=2,qPhase='try'; // try | right | wrong

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function pt(cx,cy,r,d){var x=(d-90)*Math.PI/180;return[cx+r*Math.cos(x),cy+r*Math.sin(x)];}
    var VBW=940,VBH=480;

    var modeBtn='font-size:24px;padding:12px 22px;border-radius:18px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var sbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var nbtn='font-size:22px;padding:11px 16px;border-radius:16px;border:3px solid #C24E0E;background:#fff;color:#C24E0E;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var cmnBtn='font-size:23px;padding:12px 20px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var okBtn='font-size:24px;padding:12px 24px;border-radius:16px;border:3px solid #12B886;background:#12B886;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var nextBtn='font-size:24px;padding:12px 22px;border-radius:16px;border:3px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function newQuiz(){
      var topD=Math.max(2,Math.min(6,maxDenom));
      qD=2+Math.floor(Math.random()*(topD-1));            // 2 ~ topD
      qN=1+Math.floor(Math.random()*qD);                  // 1 ~ qD (진분수~딱1)
      qPhase='try'; Sd=qD; Sn=0;                           // 등분은 목표대로 제시, 색칠은 0부터
    }

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
      } else if(mode==='compare') {
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
        if(commonOn){
          ctrl+='<span style="width:10px;"></span>'
            +'<button class="fr-cmn fr-btn'+(commonized?' fr-on':'')+'" style="'+cmnBtn+'">⚖ 같은 크기로 맞추기</button>';
        }
      } else { // quiz
        ctrl='<button class="fr-btn" data-act="nminus" style="'+btn+'background:#fff;color:'+C.num+';border-color:'+C.num+';">－ 조각</button>'
            +'<button class="fr-btn" data-act="nplus" style="'+btn+'background:'+C.num+';color:#fff;border-color:'+C.num+';">＋ 조각</button>'
            +'<span style="width:8px;"></span>'
            +'<button class="fr-btn" data-act="dminus" style="'+btn+'background:#fff;color:#1565C0;">－ 등분</button>'
            +'<button class="fr-btn" data-act="dplus" style="'+btn+'background:#1565C0;color:#fff;">＋ 등분</button>'
            +'<span style="width:10px;"></span>'
            +'<button class="fr-chk fr-btn" style="'+okBtn+'">✓ 확인</button>'
            +'<button class="fr-next fr-btn" style="'+nextBtn+'">↻ 다음 문제</button>';
      }
      var modeButtons='<button class="fr-mbtn'+(mode==='single'?' fr-on':'')+'" data-mode="single" style="'+modeBtn+'">한 개 보기</button>'
          +'<button class="fr-mbtn'+(mode==='compare'?' fr-on':'')+'" data-mode="compare" style="'+modeBtn+'">두 개 비교</button>';
      if(showQuiz) modeButtons+='<button class="fr-mbtn'+(mode==='quiz'?' fr-on':'')+'" data-mode="quiz" style="'+modeBtn+'">✏ 퀴즈</button>';
      var resetBtn=(mode==='quiz')?'':'<span style="width:8px;"></span><button class="fr-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      el.innerHTML='<style>'
        +'.fr-btn:active,.fr-sbtn:active,.fr-mbtn:active,.fr-nbtn:active,.fr-cmn:active,.fr-chk:active,.fr-next:active{transform:translateY(2px);}'
        +'.fr-btn[disabled]{opacity:.32;cursor:not-allowed;}'
        +'.fr-sbtn.fr-on{background:#0B7285 !important;color:#fff !important;}'
        +'.fr-nbtn.fr-on{background:#C24E0E !important;color:#fff !important;}'
        +'.fr-mbtn.fr-on{background:#7048E8 !important;color:#fff !important;}'
        +'.fr-cmn.fr-on{background:#7048E8 !important;color:#fff !important;}'
        +'.fr-piece{cursor:pointer;transition:fill-opacity .25s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'.fr-piece:hover{transform:scale(1.04);}'
        +'@keyframes frPop{0%{transform:scale(.6);opacity:0;}60%{transform:scale(1.12);}100%{transform:scale(1);opacity:1;}}'
        +'.fr-pop{animation:frPop .42s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'</style>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'+modeButtons+'</div>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'+ctrl+resetBtn+'</div>'
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
      if(mode==='single') renderSingle(svg);
      else if(mode==='compare') renderCompare(svg);
      else renderQuiz(svg);
      stage.appendChild(svg);
      stage.querySelectorAll('.fr-piece').forEach(function(p){p.addEventListener('click',function(){
        var gk=+p.getAttribute('data-gk'), set=p.getAttribute('data-set');
        if(set==='A'){An=(An===gk+1)?gk:gk+1;} else if(set==='B'){Bn=(Bn===gk+1)?gk:gk+1;}
        else {Sn=(Sn===gk+1)?gk:gk+1; if(mode==='quiz'&&qPhase!=='try')qPhase='try';}
        render();
      });});
      updateButtons();
    }

    function renderSingle(svg){
      var SX=40,SW=600, g=gcd(Sn,Sd), reduced=(Sn>0&&g>1&&Sn%Sd!==0), isWhole=(Sn>0&&Sn%Sd===0);
      var mainY=(reduced)?70:((VBH-200)/2-10);  // 동치 막대 자리 확보 시 위로
      if(shape==='bar') barsAt(svg,SX,mainY,SW,(reduced?150:200),Sd,Sn,'S');
      else if(shape==='circle') circlesAt(svg,SX+SW/2,VBH/2-10,150,Sd,Sn,'S');
      else { // 격자: 전체별 블록
        var wholes=Math.max(1,Math.min(Math.ceil(Sn/Sd)||1,maxWholes)); if(Sn===0)wholes=1;
        var cols=bestCols(Sd),rows=Math.ceil(Sd/cols),gap=20,bw=(SW-gap*(wholes-1))/wholes;
        var cell=Math.min(bw/cols,260/rows,90)-6, gk=0;
        for(var w=0;w<wholes;w++){
          var gw=cell*cols+6*(cols-1),gh=cell*rows+6*(rows-1),bx=SX+w*(bw+gap)+(bw-gw)/2,by=(VBH-gh)/2-10,gg=svgEl('g',{filter:'url(#frSh)'});
          for(var i=0;i<Sd;i++){var c=i%cols,r2=Math.floor(i/cols),on=gk<Sn;gg.appendChild(svgEl('rect',{x:bx+c*(cell+6),y:by+r2*(cell+6),width:cell,height:cell,rx:9,fill:fillOf(on,'S'),stroke:(on?C.aEdge:C.emptyEdge),'stroke-width':3,'data-gk':gk,'data-set':'S',class:'fr-piece'}));gk++;}
          svg.appendChild(gg);
        }
      }
      // ── 깊이: 동치 발견 (막대 모드에서, 약분 가능할 때 기약분수를 같은 길이로 나란히)
      if(equivOn && reduced && shape==='bar'){
        var rn=Sn/g, rd=Sd/g;
        barsAt(svg,SX,300,SW,120,rd,rn,'S');
        txt(svg,SX,290,'↓ 같은 양을 더 적은 조각으로 (약분)',22,C.whole,'start');
        drawFrac(svg,SX+SW+95,360,rn,rd,'improper',false);
      }
      // 패널: 선택 표기 크게 + 다른 표기 보조
      var px=750, other=(notation==='improper')?'mixed':'improper';
      drawFrac(svg,px,140,Sn,Sd,notation,true);
      var o2=notate(Sn,Sd,other);
      var sub=(other==='mixed')?(o2.m!==null?(o2.whole?o2.whole+'과 ':'')+o2.m+'/'+o2.n:o2.whole):(o2.m+'/'+o2.n);
      txt(svg,px,300,'＝ '+sub,30,'#5a7894');
      txt(svg,px,360,'전체 1을 '+Sd+'로 나눈 조각 '+Sn+'개',23,'#1B3A57');
      // ── 깊이: 동치 안내 텍스트 (모든 shape 공통)
      if(equivOn && reduced) txt(svg,px,400,'＝ '+(Sn/g)+'/'+(Sd/g)+' 로 약분돼요!',23,C.good);
      else if(equivOn && Sn>0 && !isWhole && g===1) txt(svg,px,400,'더 약분 못 해요 (기약분수)',22,'#5a7894');
      else if(equivOn && isWhole) txt(svg,px,400,'＝ '+(Sn/Sd)+' (자연수가 됐어요!)',23,C.whole);
      else txt(svg,px,400,'한 조각 = 1/'+Sd,21,'#5a7894');
    }

    function renderCompare(svg){
      var x0=50,W=540,H=110;
      var dA=Ad,nA=An,dB=Bd,nB=Bn, showCommon=(commonOn&&commonized&&Ad!==Bd);
      if(showCommon){ var L=lcm(Ad,Bd); nA=An*(L/Ad); nB=Bn*(L/Bd); dA=L; dB=L; }
      barsAt(svg,x0,75,W,H,dA,nA,'A');
      barsAt(svg,x0,275,W,H,dB,nB,'B');
      drawFrac(svg,x0+W+75,128,nA,dA,'improper',false);
      drawFrac(svg,x0+W+75,328,nB,dB,'improper',false);
      var va=An/Ad, vb=Bn/Bd, eq=Math.abs(va-vb)<1e-9, sign=eq?'＝':(va>vb?'＞':'＜');
      txt(svg,VBW/2,238,sign,eq?86:78,eq?C.whole:'#1B3A57');
      // ── 깊이: 오개념 가드 + 통분 안내
      if(commonOn && Ad!==Bd){
        if(!commonized) txt(svg,VBW/2,455,'분모가 달라요 — 조각 수로 바로 못 비교해요. ⚖ 를 눌러봐요',22,C.warn);
        else txt(svg,VBW/2,455,'분모를 '+lcm(Ad,Bd)+'로 같게! 이제 조각 수로 바로 비교돼요',23,C.good);
      } else if(eq && An!==Bn) txt(svg,VBW/2,455,'크기가 같아요 — 동치분수!',25,C.whole);
    }

    function renderQuiz(svg){
      var SX=40,SW=600;
      // 목표 패널 (오른쪽)
      var px=770;
      txt(svg,px,90,'이만큼 색칠해 봐요',26,'#1B3A57');
      drawFrac(svg,px,210,qN,qD,'improper',true);
      // 그림 (왼쪽) — 현재 만든 분수
      if(shape==='circle') circlesAt(svg,SX+SW/2,VBH/2-30,150,Sd,Sn,'S');
      else barsAt(svg,SX,(VBH-200)/2-30,SW,200,Sd,Sn,'S');
      txt(svg,SX+SW/2,VBH-80,'지금: '+Sn+'/'+Sd,28,'#5a7894');
      // 판정
      if(qPhase==='right'){
        var same=(Sn!==qN || Sd!==qD); // 값은 맞췄는데 표기가 다르면(동치) 안내
        txt(svg,px,320,'⭕ 정답!',46,C.good);
        if(same) txt(svg,px,372,Sn+'/'+Sd+' = '+qN+'/'+qD+' 같은 양이에요!',22,C.whole);
        txt(svg,px,(same?412:372),'↻ 다음 문제를 눌러요',22,'#5a7894');
      } else if(qPhase==='wrong'){
        txt(svg,px,320,'다시 해 볼까요?',34,C.warn);
        txt(svg,px,366,'목표는 '+qN+'/'+qD+', 지금은 '+Sn+'/'+Sd,23,'#5a7894');
      } else {
        txt(svg,px,320,'다 만들면 ✓ 확인',24,'#5a7894');
      }
    }

    function updateButtons(){
      function set(sel,dis){var b=el.querySelector(sel);if(b)b.disabled=dis;}
      if(mode==='single'){
        set('[data-act="nplus"]',Sn>=Sd*maxWholes); set('[data-act="nminus"]',Sn<=0);
        set('[data-act="dplus"]',Sd>=maxDenom); set('[data-act="dminus"]',Sd<=1);
      } else if(mode==='quiz'){
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
      el.querySelectorAll('.fr-mbtn').forEach(function(b){b.addEventListener('click',function(){
        if(mode!==b.dataset.mode){mode=b.dataset.mode; if(mode==='quiz')newQuiz(); commonized=false; buildUI();}
      });});
      function clampN(){Sn=Math.max(0,Math.min(Sn,Sd*maxWholes));}
      var h={
        nplus:function(){if(Sn<Sd*maxWholes){Sn++; if(mode==='quiz'&&qPhase!=='try')qPhase='try'; render();}},
        nminus:function(){if(Sn>0){Sn--; if(mode==='quiz'&&qPhase!=='try')qPhase='try'; render();}},
        dplus:function(){if(Sd<maxDenom){Sd++;clampN(); if(mode==='quiz'&&qPhase!=='try')qPhase='try'; render();}},
        dminus:function(){if(Sd>1){Sd--;clampN(); if(mode==='quiz'&&qPhase!=='try')qPhase='try'; render();}},
        reset:function(){
          if(mode==='single'){Sd=(typeof config.denom==='number')?Math.min(config.denom,maxDenom):4;Sn=(typeof config.numer==='number')?config.numer:0;notation=(config.notation==='mixed')?'mixed':'improper';shape=(['bar','circle','grid'].indexOf(config.shape)>=0)?config.shape:'bar';}
          else{Ad=Math.min(ca.denom||4,maxDenom);An=(ca.numer!=null?ca.numer:3);Bd=Math.min(cb.denom||3,maxDenom);Bn=(cb.numer!=null?cb.numer:2);commonized=false;}
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
      // v5 통분 토글
      var cmn=el.querySelector('.fr-cmn');
      if(cmn) cmn.addEventListener('click',function(){commonized=!commonized;cmn.classList.toggle('fr-on',commonized);render();});
      // v5 퀴즈 확인 / 다음
      var chk=el.querySelector('.fr-chk');
      if(chk) chk.addEventListener('click',function(){
        if(Sn===0){qPhase='wrong';render();return;}
        qPhase=(Math.abs(Sn/Sd-qN/qD)<1e-9)?'right':'wrong'; render();
      });
      var nx=el.querySelector('.fr-next');
      if(nx) nx.addEventListener('click',function(){newQuiz();render();});
      el.querySelectorAll('.fr-sbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.shape===shape);});
      el.querySelectorAll('.fr-nbtn').forEach(function(b){b.classList.toggle('fr-on',b.dataset.notation===notation);});
    }

    if(mode==='quiz') newQuiz();
    buildUI();
    return function cleanup(){};
  });
})();
