/* kedu_fit_main.js — KEDU fit-to-frame v2 (#main 렌더형 공유 모듈, 중심 기준 축소·이동 클램프)
   kedu_fit.js는 `.slide.active` 구조 전용이라 #main을 다시 그리는 차시형(ka형·stage형)에는
   걸리지 않는다. 이 모듈이 그 형태를 맡는다. 계산 규칙은 kedu_fit v12와 동일:
   무개입 우선 / 축소영향 요소 전수 union / 3-pass / 하한 0.33.
   - ka형   : <div class="ka-m" id="main"></div>            → 프레임 = #main 자신, #main의 자식들을 감싼다
   - stage형: <div class="stage"><div class="stage-inner" id="main"></div></div>
              → 프레임 = 경계를 가진 조상(.stage), #main을 통째로 감싼다(원본 여백 보존)
   #main은 render()가 innerHTML을 갈아끼우므로 childList 변화를 관찰해 재측정한다.
   공통 로드: <script src="/kedu_fit_main.js"><\/script>  (</body> 직전) */
(function(){
  var MINK=0.33, TOL=2, busy=false;

  function setTF(w,v){
    w.style.setProperty('transform',v,'important');
    if(getComputedStyle(w).animationName!=='none'){ w.style.setProperty('animation','none','important'); }
  }
  function frame(s){
    var cs=getComputedStyle(s), sr=s.getBoundingClientRect();
    var bl=parseFloat(cs.borderLeftWidth)||0, bt=parseFloat(cs.borderTopWidth)||0;
    var pl=parseFloat(cs.paddingLeft)||0, pr=parseFloat(cs.paddingRight)||0;
    var pt=parseFloat(cs.paddingTop)||0, pb=parseFloat(cs.paddingBottom)||0;
    return {l:sr.left+bl+pl, t:sr.top+bt+pt, w:s.clientWidth-pl-pr, h:s.clientHeight-pt-pb};
  }
  function union(root){
    var a={top:1e9,bot:-1e9,left:1e9,right:-1e9,any:false};
    (function walk(node,depth){
      for(var c=node.firstElementChild;c;c=c.nextElementSibling){
        var cs=getComputedStyle(c);
        if(cs.display==='none'||cs.visibility==='hidden') continue;
        if(depth===0&&(cs.position==='absolute'||cs.position==='fixed')) continue;
        var r=c.getBoundingClientRect();
        if(r.width>=1||r.height>=1){
          a.any=true;
          if(r.top<a.top)a.top=r.top; if(r.bottom>a.bot)a.bot=r.bottom;
          if(r.left<a.left)a.left=r.left; if(r.right>a.right)a.right=r.right;
        }
        walk(c,depth+1);
      }
    })(root,0);
    a.cw=a.right-a.left; a.ch=a.bot-a.top;
    return a;
  }
  function over(f,u){
    return {v:Math.max(0,f.t-u.top)+Math.max(0,u.bot-(f.t+f.h)),
            h:Math.max(0,f.l-u.left)+Math.max(0,u.right-(f.l+f.w))};
  }

  /* 경계를 가진 프레임 찾기 — #main 자신부터 위로, flex-grow≥1 이거나 overflow 스크롤/은폐인 첫 상자 */
  function findFrame(main){
    var n=main, depth=0;
    while(n && n!==document.body && depth<6){
      var cs=getComputedStyle(n);
      var grow=parseFloat(cs.flexGrow)||0;
      var oy=cs.overflowY;
      if((grow>=1 || oy==='auto' || oy==='scroll' || oy==='hidden') && n.clientHeight>0) return n;
      n=n.parentElement; depth++;
    }
    return main.parentElement || main;
  }

  function makeWrap(gap){
    var w=document.createElement('div');
    w.className='__fitwrap';
    w.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;'+
                    'width:100%;height:100%;gap:'+(gap||'normal')+';transform-origin:50% 50%;';
    w.style.setProperty('animation','none','important');
    w.style.setProperty('transition','none','important');
    return w;
  }
  /* 프레임이 #main 자신(ka형) → 자식들을 감싼다 / 프레임이 조상(stage형) → #main을 통째로 감싼다 */
  function ensureWrap(main, fr){
    if(main.__fw && main.__fw.isConnected) return main.__fw;
    var w;
    if(fr===main){
      w=makeWrap(getComputedStyle(main).gap);
      [].slice.call(main.childNodes).forEach(function(n){
        if(n.nodeType===1){var p=getComputedStyle(n).position; if(p==='absolute'||p==='fixed')return;}
        w.appendChild(n);
      });
      main.appendChild(w);
    }else{
      w=makeWrap('normal');
      fr.insertBefore(w, main);
      w.appendChild(main);
    }
    main.__fw=w; return w;
  }


  /* 껍데기 클램프 — .ka 처럼 aspect-ratio로 높이가 정해지는 바깥 카드가
     뷰포트를 넘치면 비율을 지킨 채 화면 높이에 맞춘다. 넘치지 않으면 손대지 않는다. */
  function shellOf(main){
    var n=main;
    while(n && n.parentElement && n.parentElement!==document.body) n=n.parentElement;
    return (n && n.parentElement===document.body) ? n : null;
  }
  function fitShell(main){
    var sh=shellOf(main); if(!sh) return;
    var bs=getComputedStyle(document.body);
    var avail=document.documentElement.clientHeight
              -(parseFloat(bs.paddingTop)||0)-(parseFloat(bs.paddingBottom)||0)
              -(parseFloat(bs.marginTop)||0)-(parseFloat(bs.marginBottom)||0);
    if(avail<=0) return;
    var h=sh.getBoundingClientRect().height;
    if(h<=avail+TOL && !sh.__clamped) return;
    var cs=getComputedStyle(sh), ar=cs.aspectRatio||'auto', r=NaN;
    var m=/^\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/.exec(ar);
    if(m) r=parseFloat(m[1])/parseFloat(m[2]);
    else if(/^[\d.]+$/.test(ar.trim())) r=parseFloat(ar);
    sh.style.setProperty('max-height', avail+'px', 'important');
    if(isFinite(r)&&r>0) sh.style.setProperty('max-width', Math.floor(avail*r)+'px', 'important');
    sh.__clamped=true;
  }

  function fitMain(){
    var main=document.getElementById('main'); if(!main) return;
    busy=true;
    fitShell(main);
    var fr=findFrame(main); if(!fr||!fr.clientHeight){ busy=false; return; }
    try{
      var w=main.__fw && main.__fw.isConnected ? main.__fw : null, f, u, o;
      if(w){ setTF(w,'none'); void w.offsetHeight; }
      f=frame(fr); u=union(w || (fr===main ? main : fr));
      if(!u.any){ if(w) w.style.justifyContent='center'; return; }
      o=over(f,u);
      if(o.v<=TOL && o.h<=TOL){            /* 원본이 프레임 안 → 개입 없음 */
        if(w){ w.style.justifyContent='center'; setTF(w,'none'); }
        return;
      }
      if(!w){                              /* 넘칠 때만 감싼다 */
        w=ensureWrap(main, fr);
        void w.offsetHeight;
        f=frame(fr); u=union(w); o=over(f,u);
        if(o.v<=TOL && o.h<=TOL){ w.style.justifyContent='center'; setTF(w,'none'); return; }
      }
      var k=Math.min(u.ch>f.h?f.h/u.ch:1, u.cw>f.w?f.w/u.cw:1);
      k=Math.max(k*0.995, MINK);
      var dx=0, dy=0;
      for(var pass=0; pass<3; pass++){
        setTF(w,'translate('+dx+'px,'+dy+'px) scale('+k+')');
        void w.offsetHeight;
        var u2=union(w); if(!u2.any) break;
        dx += (f.l+f.w/2)-(u2.left+u2.right)/2;
        dy += (f.t+f.h/2)-(u2.top+u2.bot)/2;
        /* 래퍼 시각 박스가 프레임 밖으로 나가지 않도록 이동량 클램프 — transform은 레이아웃 박스를 안 바꾸지만
           스크롤 영역(scrollHeight)은 넓히므로, overflow:auto 슬라이드에서 헛스크롤·hidden에서 유령 넘침이 생기던 원인 */
        var wr=w.getBoundingClientRect();
        var cxl=(wr.left+wr.right)/2-dx, cyl=(wr.top+wr.bottom)/2-dy;
        var xlo=f.l-cxl+wr.width/2, xhi=f.l+f.w-cxl-wr.width/2;
        var ylo=f.t-cyl+wr.height/2, yhi=f.t+f.h-cyl-wr.height/2;
        dx = xlo>xhi ? (xlo+xhi)/2 : Math.min(Math.max(dx,xlo),xhi);
        dy = ylo>yhi ? (ylo+yhi)/2 : Math.min(Math.max(dy,ylo),yhi);
        var need=Math.min(u2.ch>f.h?f.h/u2.ch:1, u2.cw>f.w?f.w/u2.cw:1);
        if(need<1){ k=Math.max(k*need*0.985, MINK); }
        else if(pass>0) break;
      }
      setTF(w,'translate('+dx+'px,'+dy+'px) scale('+k+')');
    } finally {
      /* 관찰자에게 우리가 만든 변화는 무시시키기 위해 한 틱 뒤에 푼다 */
      requestAnimationFrame(function(){ busy=false; });
    }
  }

  window.__fitActive=fitMain;   /* 화면점검 하네스 호환 이름 */
  window.__fitMain=fitMain;

  var raf=function(){ if(busy) return; requestAnimationFrame(function(){ requestAnimationFrame(fitMain); }); };
  function bind(){
    var main=document.getElementById('main'); if(!main) return;
    new MutationObserver(raf).observe(main,{childList:true,subtree:true,characterData:true});
    main.addEventListener('animationend', raf);
    raf(); setTimeout(raf,120); setTimeout(raf,500);
  }
  if(document.readyState!=='loading') bind(); else document.addEventListener('DOMContentLoaded',bind);
  window.addEventListener('resize',raf);
})();
