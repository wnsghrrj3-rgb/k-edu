/* ============================================================================
   케이랩 도구 모듈 — 곱셈 배열판 (array) v3
   초점 (2~4학년 곱셈) = 곱셈을 "몇 줄(행) × 한 줄에 몇 개(열)"의 배열로.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = ★묶어세기 닻 — ×기호 대신 동수누가 덧셈식(2+2+2)과 "몇씩 몇 묶음"
            일상어로 곱셈의 씨앗을 봄·교환법칙/퀴즈 숨김·작은 배열(5×5).
     · 중 = 곱셈식(3×4)·교환법칙(⇄)·퀴즈(9×9).
     · 고 = 기존 전부 유지(config maxR/maxC·교환·퀴즈).
   - 의존: window.KLab (THREE 불필요)
   - config: { rows(기본3), cols(기본4), maxR, maxC, grade:"low|mid|high",
               shape:"dot"|"square", mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={topD:'#4DABF7',dot:'#1565C0',dotEdge:'#0B447C',empty:'#E7F1FB'};
  window.KLab.register('array', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ──
       저=묶어세기 동수누가 닻(×기호 없음)·퀴즈/교환 숨김 / 중=곱셈식·교환·퀴즈 /
       고=기존 유지(config maxR/maxC 우선). */
    var GRADES={
      low:  { modes:['free','mission'],        maxR:5,    maxC:5,    addForm:true,  swap:false },
      mid:  { modes:['free','mission','quiz'], maxR:9,    maxC:9,    addForm:false, swap:true  },
      high: { modes:['free','mission','quiz'], maxR:null, maxC:null, addForm:false, swap:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function maxRFor(){ if(config.maxR>=1) return config.maxR; return G().maxR||10; }
    function maxCFor(){ if(config.maxC>=1) return config.maxC; return G().maxC||10; }

    var maxR=maxRFor(), maxC=maxCFor();
    var rows=Math.min(config.rows||3,maxR), cols=Math.min(config.cols||4,maxC);
    var shape=(config.shape==='square')?'square':'dot';
    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; maxR=maxRFor(); maxC=maxCFor();
      rows=Math.min(rows,maxR); cols=Math.min(cols,maxC);
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false; mFound={};
      if(mode==='quiz'){ qScore=0; qCount=0; newQuiz(); }
      build();
    }});

    // ---- 미션 (학년칸별 풀) ----
    var mFound={}; // 다른 배열 찾기에서 기록
    var LOW_MISSIONS=[
      {text:'한 줄에 <b style="color:#7048E8;">2개씩 3줄</b>을 만들어 봐요 — 모두 몇 개? (2 + 2 + 2)',
        check:function(){ return rows===3 && cols===2; }},
      {text:'한 줄에 <b style="color:#7048E8;">5개씩 2줄</b>을 만들어 봐요 — 5 + 5 = 10!',
        check:function(){ return rows===2 && cols===5; }},
      {text:'한 줄에 <b style="color:#7048E8;">3개씩 4줄</b>을 만들어 모두 12개! (3 + 3 + 3 + 3)',
        check:function(){ return rows===4 && cols===3; }}
    ];
    var FULL_MISSIONS=[
      {text:'곱이 <b style="color:#7048E8;">12</b>가 되는 배열을 만들어 봐요!',
        check:function(){ if(rows*cols===12){mFound[rows+'x'+cols]=1;mFound[cols+'x'+rows]=1;return true;} return false;}},
      {text:'곱이 12가 되는 <b style="color:#7048E8;">다른 배열</b>도 찾아 봐요! (아까와 줄 수가 달라야 해요)',
        check:function(){ return rows*cols===12 && !mFound[rows+'x'+cols]; }},
      {text:'<b style="color:#0B7285;">⇄ 가로세로</b> 버튼을 눌러 보세요 — 곱이 그대로인가요? (교환법칙)',
        check:function(act){ return act==='swap'; }},
      {text:'곱이 <b style="color:#7048E8;">18</b>이 되는 배열을 만들어 봐요!',
        check:function(){ return rows*cols===18; }}
    ];
    function curMissions(){
      var pool=(grade==='low')?LOW_MISSIONS:FULL_MISSIONS;
      // swap 미션은 교환법칙 노출 학년만, 18 미션은 9×9 이상 필요
      var f=pool.filter(function(m){
        if(/⇄|교환법칙/.test(m.text)) return !!G().swap;
        if(m.text.indexOf('18')>=0) return maxR*maxC>=18;
        if(m.text.indexOf('12')>=0||/다른 배열/.test(m.text)) return maxR*maxC>=12;
        return true;
      });
      return f.length?f:pool.slice(0,1);
    }
    var mStep=0, mDone=false, mLock=false;
    var H={}; // 동작 핸들러(클로저 — render의 탭-회전에서도 참조)

    // ---- 퀴즈 ----
    var qR=3,qC=4,qScore=0,qCount=0,qLock=false;
    function newQuiz(){ qR=2+Math.floor(Math.random()*Math.min(maxR-1,5)); qC=2+Math.floor(Math.random()*Math.min(maxC-1,5)); qLock=false; }
    function quizChoices(){
      var ans=qR*qC,set={},out=[ans];set[ans]=1;
      var near=[ans+qR,ans-qR,ans+qC,ans-qC,ans+1,ans-1,ans+2];
      for(var i=0;i<near.length&&out.length<4;i++){var d=near[i];if(d>1&&!set[d]){set[d]=1;out.push(d);}}
      out.sort(function(a,b){return a-b;});
      return out.map(function(v){return {v:v};});
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', ctrl='', foot='';
      var swapBtn=G().swap?('<button class="ar-btn" data-act="swap" style="'+btn+'background:#fff;color:#0B7285;border-color:#0B7285;">⇄ 가로세로</button>'):'';
      var ctlHtml='<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">'+(G().addForm?'줄 수':'줄(행)')+'</span>'
        +'<button class="ar-btn" data-act="rm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="rp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">한 줄 개수'+(G().addForm?'':'(열)')+'</span>'
        +'<button class="ar-btn" data-act="cm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="cp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +swapBtn
        +'<button class="ar-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>';
      if(mode==='mission'){ var _M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(_M[mStep].text,mStep,_M.length); ctrl=ctlHtml; }
      else if(mode==='quiz'){ bar=ui.quizBar('이 배열의 곱은 얼마일까요?',qScore,qCount); foot=ui.choices(quizChoices()); }
      else ctrl=ctlHtml;
      el.innerHTML='<style>.ar-btn:active,.kl-choice:active{transform:translateY(2px);}.ar-btn[disabled]{opacity:.35;cursor:not-allowed;}'
        +'.ar-cell{transition:transform .2s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}'
        +'.ar-rotate{animation:arRotate .5s cubic-bezier(.3,1.2,.4,1) both;transform-origin:center;transform-box:fill-box;}'
        +'@keyframes arRotate{0%{transform:rotate(-90deg) scale(.82);}60%{transform:rotate(8deg) scale(1.02);}100%{transform:rotate(0) scale(1);}}'
        +'.ar-flash{animation:arFlashKf 1.6s ease both;}@keyframes arFlashKf{0%{opacity:0;}15%{opacity:1;}80%{opacity:1;}100%{opacity:0;}}'
        +'.ar-tappable{cursor:pointer;}.kl-choice:hover{background:#1565C0 !important;color:#fff !important;}</style>'
        +top+bar
        +(ctrl?'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'+ctrl+'</div>':'')
        +'<div class="kl-stage-host" style="position:relative;"><div class="ar-stage" style="width:100%;height:'+(mode==='quiz'?'42vh':'50vh')+';min-height:330px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +foot
        +'<div class="ar-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){mode=m;mStep=0;mDone=false;mFound={};
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();}
        build();});
      bind(); bands.bind(el); render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=440;
    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.ar-stage'); stage.innerHTML='';
      var R=(mode==='quiz')?qR:rows, Co=(mode==='quiz')?qC:cols;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="arSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.22"/></filter>'
        +'<linearGradient id="arG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.topD+'"/><stop offset="1" stop-color="'+C.dot+'"/></linearGradient>';svg.appendChild(d);
      var padX=80,padY=50,areaW=VBW-padX*2,areaH=VBH-padY*2;
      var cw=areaW/Co, ch=areaH/R, s=Math.min(cw,ch,86), size=s*0.66;
      var gridW=s*Co, gridH=s*R, x0=(VBW-gridW)/2, y0=(VBH-gridH)/2;
      var canRotate=(mode!=='quiz' && !!G().swap);   // 와우 ①: 배열 직접 탭→회전(교환법칙 노출 학년만)
      var g=svgEl('g',{filter:'url(#arSh)',class:'ar-grid'+(opts.rotate?' ar-rotate':'')+(canRotate?' ar-tappable':'')});
      for(var r=0;r<R;r++)for(var c=0;c<Co;c++){
        var cx=x0+c*s+s/2, cy=y0+r*s+s/2;
        if(shape==='square') g.appendChild(svgEl('rect',{x:cx-size/2,y:cy-size/2,width:size,height:size,rx:8,fill:'url(#arG)',stroke:'#fff','stroke-width':3,class:'ar-cell'}));
        else g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:size/2,fill:'url(#arG)',stroke:C.dotEdge,'stroke-width':3,class:'ar-cell'}));
      }
      svg.appendChild(g);
      // 와우 ④ 마법모먼트: 돌려도 개수 그대로(교환법칙)
      if(opts.flash){
        var fl=svgEl('text',{x:VBW/2,y:34,'text-anchor':'middle','font-family':'Gowun Dodum, "Apple SD Gothic Neo", sans-serif','font-size':26,'font-weight':800,fill:'#7048E8',class:'ar-flash'});
        fl.textContent='돌려도 개수는 그대로! '+cols+' × '+rows+' ＝ '+rows+' × '+cols+' ＝ '+(rows*cols)+' (교환법칙)';
        svg.appendChild(fl);
      }
      stage.appendChild(svg);
      if(canRotate){ g.addEventListener('click',function(){ H.swap(); }); }
      var st=el.querySelector('.ar-status');
      if(mode==='quiz'){
        st.innerHTML='<span style="font-size:34px;color:#1565C0;">'+qR+'</span><span style="font-size:26px;color:#1B3A57;"> 줄 × 한 줄 </span><span style="font-size:34px;color:#1565C0;">'+qC+'</span><span style="font-size:26px;color:#1B3A57;">개 ＝ </span><span style="font-size:40px;color:#F59F00;">?</span>';
      } else if(G().addForm){
        // ★저학년 묶어세기 닻 — ×기호 없이 동수누가 덧셈식
        var parts=[]; for(var i=0;i<rows;i++) parts.push(cols);
        st.innerHTML='<span style="font-size:30px;color:#1B3A57;">한 줄에 </span>'
          +'<span style="font-size:40px;color:#1565C0;">'+cols+'</span>'
          +'<span style="font-size:30px;color:#1B3A57;">개씩 </span>'
          +'<span style="font-size:40px;color:#1565C0;">'+rows+'</span>'
          +'<span style="font-size:30px;color:#1B3A57;">줄</span>'
          +'<div style="font-size:34px;margin-top:8px;color:#0CA678;">'+parts.join(' ＋ ')+' ＝ <span style="font-size:46px;">'+(rows*cols)+'</span></div>'
          +'<div style="font-size:23px;margin-top:2px;color:#7048E8;">'+cols+'씩 '+rows+'묶음 = 모두 '+(rows*cols)+'개</div>';
        var bp0=el.querySelector('[data-act="rp"]');if(bp0)bp0.disabled=rows>=maxR;
        var bm0=el.querySelector('[data-act="rm"]');if(bm0)bm0.disabled=rows<=1;
        var cp0=el.querySelector('[data-act="cp"]');if(cp0)cp0.disabled=cols>=maxC;
        var cm0=el.querySelector('[data-act="cm"]');if(cm0)cm0.disabled=cols<=1;
      } else {
        st.innerHTML='<span style="font-size:38px;color:#1565C0;">'+rows+'</span>'
          +'<span style="font-size:28px;color:#1B3A57;"> 줄 × 한 줄 </span>'
          +'<span style="font-size:38px;color:#1565C0;">'+cols+'</span>'
          +'<span style="font-size:28px;color:#1B3A57;">개 ＝ </span>'
          +'<span style="font-size:30px;color:#0CA678;">'+rows+' × '+cols+' ＝ </span>'
          +'<span style="font-size:52px;color:#0CA678;">'+(rows*cols)+'</span>';
        var bp=el.querySelector('[data-act="rp"]');if(bp)bp.disabled=rows>=maxR;
        var bm=el.querySelector('[data-act="rm"]');if(bm)bm.disabled=rows<=1;
        var cp=el.querySelector('[data-act="cp"]');if(cp)cp.disabled=cols>=maxC;
        var cm=el.querySelector('[data-act="cm"]');if(cm)cm.disabled=cols<=1;
      }
    }

    function checkMission(act){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check(act)){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<curMissions().length-1)mStep++; else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      H={rp:function(){if(rows<maxR){rows++;snd('pop');render();checkMission();}},rm:function(){if(rows>1){rows--;snd('pop');render();checkMission();}},
        cp:function(){if(cols<maxC){cols++;snd('pop');render();checkMission();}},cm:function(){if(cols>1){cols--;snd('pop');render();checkMission();}},
        swap:function(){var t=rows;rows=Math.min(cols,maxR);cols=Math.min(t,maxC);snd('whoosh');render({rotate:true,flash:true});checkMission('swap');},
        reset:function(){rows=Math.min(config.rows||3,maxR);cols=Math.min(config.cols||4,maxC);render();}};
      el.querySelectorAll('.ar-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return;qLock=true;
          var ok=(+b.dataset.v===qR*qC);
          qCount++;if(ok)qScore++;
          window.KLab.ui.toast(el,ok,ok?null:('🤔 정답은 '+qR+'×'+qC+'='+(qR*qC)+'!'));
          b.style.background=ok?'#12B886':'#FF8A3D';b.style.color='#fff';b.style.borderColor=ok?'#12B886':'#FF8A3D';
          setTimeout(function(){newQuiz();build();},1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build();
    return function cleanup(){};
  });
})();
