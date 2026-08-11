/* kedu_fit.js — KEDU fit-to-frame v12 (공유 모듈)
   슬라이드 콘텐츠가 프레임을 넘칠 때만 래퍼로 감싸 실측 축소·중앙정렬.
   무개입 우선 / 축소영향 요소 전수 union / 3-pass / 하한 0.33.
   ★래퍼 애니메이션 차단: 원본 `.slide.active>*{animation}`이 래퍼에 걸리면
     키프레임 transform이 인라인보다 우선해 fit가 통째로 무력화되므로
     animation/transition none !important + transform은 항상 !important로 적용.
   자기주도 slide형 전 차시 공통 로드: <script src="/kedu_fit.js"><\/script> */
/* KEDU fit-to-frame v12 — 원본 실측 후 넘칠 때만 감싸 축소·정렬(무개입 우선, 축소영향 요소 전수 측정, 3-pass, 래퍼 애니메이션 무력화 차단) */
(function(){
  var MINK=0.33, TOL=2;
  /* 애니메이션 우선순위를 이기기 위해 transform은 항상 !important 로 */
  function setTF(w,v){ w.style.setProperty('transform',v,'important');
    if(getComputedStyle(w).animationName!=='none'){ w.style.setProperty('animation','none','important'); } }
  function frame(s){
    var cs=getComputedStyle(s), sr=s.getBoundingClientRect();
    var bl=parseFloat(cs.borderLeftWidth)||0, bt=parseFloat(cs.borderTopWidth)||0;
    var pl=parseFloat(cs.paddingLeft)||0, pr=parseFloat(cs.paddingRight)||0;
    var pt=parseFloat(cs.paddingTop)||0, pb=parseFloat(cs.paddingBottom)||0;
    return {l:sr.left+bl+pl, t:sr.top+bt+pt, w:s.clientWidth-pl-pr, h:s.clientHeight-pt-pb};
  }
  /* 축소 영향을 받는 요소 전수 union — 최상위 직속 absolute/fixed(슬라이드 고정 UI)만 제외,
     그 아래 컨테이너 내부 absolute(도형 등)는 함께 축소되므로 포함. 안 보이는 것은 제외. */
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
  function wrap(s){
    if(s.__fw) return s.__fw;
    var cs=getComputedStyle(s);
    var w=document.createElement('div');
    w.className='__fitwrap';
    w.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:'+cs.gap+';transform-origin:0 0;';
    /* 원본 CSS의 `.slide.active>*{animation:...}` 류가 래퍼에 걸리면 키프레임 transform이
       인라인 transform을 이겨 fit가 통째로 무력화됨 → !important로 차단 */
    w.style.setProperty('animation','none','important');
    w.style.setProperty('transition','none','important');
    [].slice.call(s.childNodes).forEach(function(n){
      if(n.nodeType===1){var p=getComputedStyle(n).position; if(p==='absolute'||p==='fixed')return;}
      w.appendChild(n);
    });
    s.appendChild(w); s.__fw=w; return w;
  }
  function fitActive(){
    var s=document.querySelector('.slide.active'); if(!s) return;
    var w=s.__fw, f, u, o;
    if(w){ setTF(w,'none'); w.style.justifyContent='flex-start'; void w.offsetHeight; }
    f=frame(s); u=union(w||s);
    if(!u.any){ if(w) w.style.justifyContent='center'; return; }
    o=over(f,u);
    if(o.v<=TOL && o.h<=TOL){        /* 원본이 프레임 안 → 개입 없음 */
      if(w){ w.style.justifyContent='center'; setTF(w,'none'); }
      return;
    }
    if(!w){                          /* 넘칠 때만 감싼다 */
      w=wrap(s); w.style.justifyContent='flex-start'; void w.offsetHeight;
      f=frame(s); u=union(w);
      o=over(f,u);
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
      var need=Math.min(u2.ch>f.h?f.h/u2.ch:1, u2.cw>f.w?f.w/u2.cw:1);
      if(need<1){ k=Math.max(k*need*0.985, MINK); }
      else if(pass>0) break;
    }
    setTF(w,'translate('+dx+'px,'+dy+'px) scale('+k+')');
  }
  window.__fitActive=fitActive;
  var raf=function(){ requestAnimationFrame(function(){ requestAnimationFrame(fitActive); }); };
  var mo=new MutationObserver(raf);
  function bind(){
    document.querySelectorAll('.slide').forEach(function(s){
      mo.observe(s,{attributes:true,attributeFilter:['class']});
      s.addEventListener('animationend', raf);
    });
    raf(); setTimeout(raf,120); setTimeout(raf,500);
  }
  if(document.readyState!=='loading') bind(); else document.addEventListener('DOMContentLoaded',bind);
  window.addEventListener('resize',raf);
})();
