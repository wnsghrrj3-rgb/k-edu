/* ============================================================================
   케이랩 도구 모듈 — 소리·진동 (sound) v3  [과학 5호 · 3모드]
   3학년 소리의 성질.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 탐구 미션 4종 — 🔊 큰 / 🔉 작은 / ⬆️ 높은 / ⬇️ 낮은 소리 만들기.
     ▸ 슬라이더 현재값 표시(크기 1~5·높이 1~8)로 변수-현상 연결 강화.
     ▸ 발견 안내 — "진폭만 바꾸면 크기만, 진동수만 바꾸면 높이만 달라진다"
        (한 변수만 움직였을 때 감지해 분리 인과를 짚어 줌).
   변수 → 현상 → 발견:
     진폭(소리 크기)·진동수(소리 높이) 슬라이더 → 파형·떨림·실제 음 →
     "소리는 떨림(진동). 크게 떨리면 큰 소리, 빠르게 떨리면 높은 소리."
   - 의존: window.KLab (SVG + rAF + Web Audio, 오디오는 안전 try/catch)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 움직이는 파형을 보고 답하기.
   - config: { amp(1~5,기본3), freq(1~8,기본3), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wave:'#7048E8',speaker:'#495057',ink:'#1B3A57',sub:'#5a7894',ring:'#9775FA',good:'#12B886'};
  window.KLab.register('sound', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var amp=config.amp||3, freq=config.freq||3, playing=false, raf=null, ph=0;
    var actx=null, osc=null, gain=null, lastK=null;
    var btn='font-size:22px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, SPK={x:135,y:230}, X0=235, X1=850, MID=230;

    function hz(){return 200+freq*80;}
    function vol(){return amp*0.04;}

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'🔊 진폭 슬라이더로 <b style="color:#7048E8;">가장 큰 소리</b>를 만들어 봐요!',
        check:function(){ return amp>=5; } },
      { text:'🔉 이번엔 <b style="color:#7048E8;">가장 작은 소리</b> — 파형이 어떻게 변하나요?',
        check:function(){ return amp<=1; } },
      { text:'⬆️ 진동수 슬라이더로 <b style="color:#7048E8;">가장 높은 소리</b>를 만들어 봐요!',
        check:function(){ return freq>=8; } },
      { text:'⬇️ 마지막 — <b style="color:#7048E8;">가장 낮은 소리</b>! 파형이 느긋해져요.',
        check:function(){ return freq<=1; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function checkMissionStep(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1)mStep++; else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (파형 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { amp:5, freq:3, q:'파형이 이렇게 크게 떨리면 어떤 소리일까요?', ch:['큰 소리','작은 소리','높은 소리'], a:0 },
      { amp:1, freq:3, q:'파형이 이렇게 작게 떨리면 어떤 소리일까요?', ch:['작은 소리','큰 소리','낮은 소리'], a:0 },
      { amp:3, freq:8, q:'파형이 이렇게 촘촘하면 어떤 소리일까요?', ch:['높은 소리','낮은 소리','큰 소리'], a:0 },
      { amp:3, freq:1, q:'파형이 이렇게 느긋하면 어떤 소리일까요?', ch:['낮은 소리','높은 소리','작은 소리'], a:0 },
      { amp:3, freq:3, q:'소리는 무엇 때문에 생길까요?', ch:['물체의 떨림(진동)','물체의 색깔','물체의 무게'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      amp=QUIZ[qIdx].amp; freq=QUIZ[qIdx].freq; lastK=null;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      var ctrl='<div style="display:flex;gap:18px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<span class="sd-lab">소리 크기(진폭)</span><input class="sd-range" data-k="amp" type="range" min="1" max="5" value="'+amp+'" style="width:min(26vw,170px);"><span class="sd-val" data-v="amp">'+amp+'/5</span>'
          +'<span class="sd-lab">소리 높이(진동수)</span><input class="sd-range" data-k="freq" type="range" min="1" max="8" value="'+freq+'" style="width:min(26vw,170px);"><span class="sd-val" data-v="freq">'+freq+'/8</span>'
          +'<button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button>'
        +'</div>';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); ctrl='<div style="display:flex;justify-content:center;margin-bottom:8px;"><button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button></div>'; foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.sd-btn:active,.kl-choice:active{transform:translateY(2px);}'
        +'.kl-choice{min-width:auto !important;padding:14px 22px !important;}'
        +'.sd-range{-webkit-appearance:none;appearance:none;height:12px;border-radius:7px;background:#D0BFFF;outline:none;}'
        +'.sd-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-lab{font-size:17px;font-weight:800;color:#5a3fb8;font-family:inherit;}.sd-val{font-size:16px;font-weight:800;color:#7048E8;font-family:inherit;min-width:34px;display:inline-block;text-align:center;}</style>'
        + top + bar + ctrl
        +'<div class="kl-stage-host" style="position:relative;"><div class="sd-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'42vh')+';min-height:'+(mode==='quiz'?'240':'310')+'px;background:radial-gradient(120% 120% at 16% 50%,#FBFAFF 0%,#F1EEFA 70%,#E7E0F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(112,72,232,0.10);"></div></div>'
        + foot
        +'<div class="sd-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; amp=3; freq=3; lastK=null;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      drawStage(); bind(); if(!raf)loop(); renderStatus(); updateAudio();
    }

    var stage, waveEl, coneEl, ringEls=[];
    function drawStage(){
      stage=el.querySelector('.sd-stage'); stage.innerHTML=''; ringEls=[];
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      for(var i=0;i<4;i++){var r=svgEl('circle',{cx:SPK.x+40,cy:SPK.y,r:0,fill:'none',stroke:C.ring,'stroke-width':3,'stroke-opacity':0});svg.appendChild(r);ringEls.push(r);}
      svg.appendChild(svgEl('line',{x1:X0,y1:MID,x2:X1,y2:MID,stroke:'#C7BCE8','stroke-width':1.5,'stroke-dasharray':'5 5'}));
      waveEl=svgEl('path',{d:'',fill:'none',stroke:C.wave,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'}); svg.appendChild(waveEl);
      svg.appendChild(svgEl('rect',{x:SPK.x-42,y:SPK.y-58,width:74,height:116,rx:12,fill:C.speaker,stroke:'#212529','stroke-width':3}));
      coneEl=svgEl('g',{}); svg.appendChild(coneEl);
      stage.appendChild(svg);
    }
    function drawCone(shift){
      coneEl.innerHTML='';
      var x=SPK.x+8+shift;
      coneEl.appendChild(svgEl('path',{d:'M '+(x-10)+' '+(SPK.y-30)+' L '+(x+18)+' '+(SPK.y-44)+' L '+(x+18)+' '+(SPK.y+44)+' L '+(x-10)+' '+(SPK.y+30)+' Z',fill:'#868E96',stroke:'#343A40','stroke-width':2}));
      coneEl.appendChild(svgEl('circle',{cx:x-6,cy:SPK.y,r:13,fill:'#ADB5BD',stroke:'#343A40','stroke-width':2}));
    }

    function loop(){ ph+=0.05+freq*0.02; var t=ph;
      var wl=(X1-X0)/(freq*1.1), A=amp*15, d='M '+X0+' '+MID;
      for(var x=X0;x<=X1;x+=6){var y=MID - A*Math.sin((x-X0)/wl*2*Math.PI - t);d+=' L '+x.toFixed(1)+' '+y.toFixed(1);}
      if(waveEl)waveEl.setAttribute('d',d);
      drawCone(Math.sin(t*3)*amp*0.8);
      for(var i=0;i<ringEls.length;i++){var prog=((t*8 + i*40)% 160)/160; var r=prog*180;
        ringEls[i].setAttribute('r',r.toFixed(1));ringEls[i].setAttribute('stroke-opacity',(0.5*(1-prog)*(amp/5)).toFixed(2));}
      raf=requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.sd-status');
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;">떨리는 파형을 잘 보고 (들어 보고) 답을 골라요!</div>'; return; }
      var big=amp>=4?'큰':(amp<=2?'작은':'보통'), high=freq>=6?'높은':(freq<=2?'낮은':'보통');
      var base='파형이 '+(amp>=4?'크게':(amp<=2?'작게':'적당히'))+' '+(freq>=6?'촘촘하게':(freq<=2?'천천히':'적당히'))+' 떨려요 — '+big+' 소리·'+high+' 소리. <b>진폭</b>은 소리 크기, <b>진동수</b>는 소리 높이예요.';
      var hint='';
      if(lastK==='amp')hint='<div style="font-size:16px;color:'+C.ring+';margin-top:4px;">크기(진폭)만 바꿨더니 파형 높이만 달라지고 촘촘함(높이)은 그대로예요.</div>';
      else if(lastK==='freq')hint='<div style="font-size:16px;color:'+C.ring+';margin-top:4px;">높이(진동수)만 바꿨더니 촘촘함만 달라지고 파형 높이(크기)는 그대로예요.</div>';
      s.innerHTML='<div>'+base+'</div>'+hint;
      checkMissionStep();
    }

    function ensureCtx(){ try{ if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){actx=null;} return actx; }
    function startAudio(){ try{ var c=ensureCtx(); if(!c)return; osc=c.createOscillator(); gain=c.createGain(); osc.type='sine'; osc.frequency.value=hz(); gain.gain.value=vol(); osc.connect(gain); gain.connect(c.destination); osc.start(); }catch(e){} }
    function stopAudio(){ try{ if(osc){osc.stop();osc.disconnect();osc=null;} }catch(e){} }
    function updateAudio(){ try{ if(osc){osc.frequency.value=hz();} if(gain){gain.gain.value=vol();} }catch(e){} }

    function bind(){
      el.querySelectorAll('.sd-range').forEach(function(r){r.addEventListener('input',function(e){
        var v=+e.target.value, k=e.target.dataset.k; if(k==='amp')amp=v; else freq=v; lastK=k;
        var vv=el.querySelector('.sd-val[data-v="'+k+'"]'); if(vv)vv.textContent=v+'/'+(k==='amp'?'5':'8');
        updateAudio(); renderStatus();
      });});
      el.querySelector('[data-act="play"]').addEventListener('click',function(){
        playing=!playing; if(playing)startAudio(); else stopAudio();
        var b=el.querySelector('[data-act="play"]');
        b.textContent=playing?'■ 멈춤':'▶ 소리 듣기';
        b.style.background=playing?'#7048E8':'#fff'; b.style.color=playing?'#fff':'#7048E8';
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); buildUI(); },1500);
        });
      });
    }
    buildUI();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); stopAudio(); try{actx&&actx.close();}catch(e){} };
  });
})();
