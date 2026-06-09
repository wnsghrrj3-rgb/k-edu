/* ============================================================================
   케이랩 도구 모듈 — 소리·진동 (sound) v1  [과학 5호]
   3학년 소리의 성질.
     변수 → 현상 → 발견:
       ▸ 진폭(소리 크기)·진동수(소리 높이) 슬라이더
       ▸ 파형이 실시간으로 변함: 진폭↑ → 파형 큼(큰 소리) / 진동수↑ → 촘촘(높은 소리)
       ▸ [소리 듣기]로 실제 음을 들으며 파형과 연결
       ▸ "소리는 떨림(진동). 크게 떨리면 큰 소리, 빠르게 떨리면 높은 소리"
   - 의존: window.KLab (SVG + rAF + Web Audio, 오디오는 안전 try/catch)
   - config: { amp(1~5,기본3), freq(1~8,기본3) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wave:'#7048E8',speaker:'#495057',ink:'#1B3A57',sub:'#5a7894',ring:'#9775FA'};
  window.KLab.register('sound', function (el, config) {
    var amp=config.amp||3, freq=config.freq||3, playing=false, raf=null, ph=0;
    var actx=null, osc=null, gain=null;
    var btn='font-size:22px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, SPK={x:135,y:230}, X0=235, X1=850, MID=230;

    function hz(){return 200+freq*80;}
    function vol(){return amp*0.04;}

    function buildUI(){
      el.innerHTML='<style>.sd-btn:active{transform:translateY(2px);}'
        +'.sd-range{-webkit-appearance:none;appearance:none;height:12px;border-radius:7px;background:#D0BFFF;outline:none;}'
        +'.sd-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid #7048E8;cursor:pointer;}'
        +'.sd-lab{font-size:17px;font-weight:800;color:#5a3fb8;font-family:inherit;}</style>'
        +'<div style="display:flex;gap:22px;align-items:center;justify-content:center;margin-bottom:8px;flex-wrap:wrap;">'
          +'<span class="sd-lab">소리 크기(진폭)</span><input class="sd-range" data-k="amp" type="range" min="1" max="5" value="'+amp+'" style="width:min(28vw,180px);">'
          +'<span class="sd-lab">소리 높이(진동수)</span><input class="sd-range" data-k="freq" type="range" min="1" max="8" value="'+freq+'" style="width:min(28vw,180px);">'
          +'<button class="sd-btn" data-act="play" style="'+btn+(playing?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">'+(playing?'■ 멈춤':'▶ 소리 듣기')+'</button>'
        +'</div>'
        +'<div class="sd-stage" style="width:100%;height:44vh;min-height:320px;background:radial-gradient(120% 120% at 16% 50%,#FBFAFF 0%,#F1EEFA 70%,#E7E0F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(112,72,232,0.10);"></div>'
        +'<div class="sd-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>';
      drawStage(); bind(); if(!raf)loop(); renderStatus();
    }

    var stage, waveEl, coneEl, ringEls=[];
    function drawStage(){
      stage=el.querySelector('.sd-stage'); stage.innerHTML=''; ringEls=[];
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      // 음파 동심원 (퍼짐)
      for(var i=0;i<4;i++){var r=svgEl('circle',{cx:SPK.x+40,cy:SPK.y,r:0,fill:'none',stroke:C.ring,'stroke-width':3,'stroke-opacity':0});svg.appendChild(r);ringEls.push(r);}
      // 기준선
      svg.appendChild(svgEl('line',{x1:X0,y1:MID,x2:X1,y2:MID,stroke:'#C7BCE8','stroke-width':1.5,'stroke-dasharray':'5 5'}));
      // 파형
      waveEl=svgEl('path',{d:'',fill:'none',stroke:C.wave,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'}); svg.appendChild(waveEl);
      // 스피커
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
      // 파형
      var wl=(X1-X0)/(freq*1.1), A=amp*15, d='M '+X0+' '+MID;
      for(var x=X0;x<=X1;x+=6){var y=MID - A*Math.sin((x-X0)/wl*2*Math.PI - t);d+=' L '+x.toFixed(1)+' '+y.toFixed(1);}
      if(waveEl)waveEl.setAttribute('d',d);
      // 스피커 콘 떨림
      drawCone(Math.sin(t*3)*amp*0.8);
      // 음파 동심원
      for(var i=0;i<ringEls.length;i++){var prog=((t*8 + i*40)% 160)/160; var r=prog*180;
        ringEls[i].setAttribute('r',r.toFixed(1));ringEls[i].setAttribute('stroke-opacity',(0.5*(1-prog)*(amp/5)).toFixed(2));}
      raf=requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.sd-status');
      var big=amp>=4?'큰':(amp<=2?'작은':'보통'), high=freq>=6?'높은':(freq<=2?'낮은':'보통');
      s.innerHTML='파형이 '+(amp>=4?'크게':'작게')+' '+(freq>=6?'촘촘하게':'천천히')+' 떨려요 — '+big+' 소리·'+high+' 소리. 진폭은 소리 크기, 진동수는 소리 높이예요.';
    }

    // ── 오디오 (안전)
    function ensureCtx(){ try{ if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){actx=null;} return actx; }
    function startAudio(){ try{ var c=ensureCtx(); if(!c)return; osc=c.createOscillator(); gain=c.createGain(); osc.type='sine'; osc.frequency.value=hz(); gain.gain.value=vol(); osc.connect(gain); gain.connect(c.destination); osc.start(); }catch(e){} }
    function stopAudio(){ try{ if(osc){osc.stop();osc.disconnect();osc=null;} }catch(e){} }
    function updateAudio(){ try{ if(osc){osc.frequency.value=hz();} if(gain){gain.gain.value=vol();} }catch(e){} }

    function bind(){
      el.querySelectorAll('.sd-range').forEach(function(r){r.addEventListener('input',function(e){
        var v=+e.target.value; if(e.target.dataset.k==='amp')amp=v; else freq=v;
        updateAudio(); renderStatus();
      });});
      el.querySelector('[data-act="play"]').addEventListener('click',function(){
        playing=!playing; if(playing)startAudio(); else stopAudio();
        var b=el.querySelector('[data-act="play"]');
        b.textContent=playing?'■ 멈춤':'▶ 소리 듣기';
        b.style.background=playing?'#7048E8':'#fff'; b.style.color=playing?'#fff':'#7048E8';
      });
    }
    buildUI();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); stopAudio(); try{actx&&actx.close();}catch(e){} };
  });
})();
