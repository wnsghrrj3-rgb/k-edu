/* ============================================================================
   케이랩 도구 모듈 — 융해 연출 (melt)  [과학 · 물질변화군 · 실사 스프라이트 검증]
   준호가 GPT로 만든 실사 PNG(얼음·물방울)를 그대로 써서 "얼음 → 물" 상태 변화를
   눈앞에서 보여준다. 슬라이더(얼음↔물)로 얼음 사진이 줄고, 물방울 사진이 떨어지고,
   물웅덩이가 차오른다. 양 보존(얼음 줄어든 만큼 물 늘어남)을 시각으로 전달.
   - 자산: /kedu/teacher/engine/tools/assets/states/{ice,water}.png (절대경로 = 루트served)
   - 의존: window.KLab (HTML 스테이지 + requestAnimationFrame + KLab.sound)
   - config: {} (자유탐구 단일 모드 — 케이랩 갈아엎기 프로토타입/실사 검증용)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var ICE = '/kedu/teacher/engine/tools/assets/states/ice.png';
  var WATER = '/kedu/teacher/engine/tools/assets/states/water.png';
  window.KLab.register('melt', function (el, config) {
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }
    var btn='font-size:23px;padding:12px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;background:#fff;';
    var raf=null, drips=[], ripples=[], frame=0, auto=false, autoV=0, done=false;
    var stage, iceEl, puddleEl, dripLayer;

    function build(){
      el.innerHTML='<style>'
        +'.mlt-btn:active{transform:translateY(2px);}'
        +'.mlt-range{-webkit-appearance:none;appearance:none;height:14px;border-radius:8px;background:linear-gradient(90deg,#A5D8FF,#4DABF7,#1C7ED6);outline:none;}'
        +'.mlt-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.mlt-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:#fff;border:4px solid #1565C0;cursor:pointer;}'
        +'.mlt-drip{position:absolute;width:24px;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(30,80,140,.25));}'
        +'.mlt-ripple{position:absolute;border:2.5px solid rgba(255,255,255,.7);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%) scaleY(.42);}'
        +'</style>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:12px;flex-wrap:wrap;">'
          +'<span style="font-size:18px;font-weight:800;color:#1971C2;">❄️ 얼음</span>'
          +'<input class="mlt-range" type="range" min="0" max="100" value="0" style="width:min(50vw,360px);">'
          +'<span style="font-size:18px;font-weight:800;color:#1C7ED6;">물 💧</span>'
        +'</div>'
        +'<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
          +'<button class="mlt-btn" data-act="auto" style="'+btn+'color:#E8590C;border-color:#E8590C;">🔥 천천히 녹이기</button>'
          +'<button class="mlt-btn" data-act="reset" style="'+btn+'color:#1971C2;border-color:#1971C2;">❄️ 다시 얼리기</button>'
        +'</div>'
        +'<div class="kl-stage-host" style="position:relative;"><div class="mlt-stage" style="position:relative;width:100%;height:44vh;min-height:330px;background:radial-gradient(120% 120% at 50% 18%,#FCFEFF 0%,#EAF3FB 72%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);">'
          +'<div class="mlt-puddle" style="position:absolute;left:50%;bottom:34px;transform:translateX(-50%);width:120px;height:30px;border-radius:50%;background:radial-gradient(circle at 42% 35%,rgba(190,232,255,.95),rgba(92,182,245,.92) 55%,rgba(31,127,214,.88));box-shadow:0 6px 14px rgba(31,110,180,.25);"></div>'
          +'<img class="mlt-ice" src="'+ICE+'" alt="얼음" style="position:absolute;left:50%;bottom:42px;transform:translateX(-50%);width:min(40vw,230px);transform-origin:bottom center;filter:drop-shadow(0 8px 16px rgba(60,120,180,.28));">'
          +'<div class="mlt-driplayer" style="position:absolute;inset:0;"></div>'
        +'</div></div>'
        +'<div class="mlt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
      stage=el.querySelector('.mlt-stage'); iceEl=el.querySelector('.mlt-ice');
      puddleEl=el.querySelector('.mlt-puddle'); dripLayer=el.querySelector('.mlt-driplayer');
      bind(); render(); if(!raf)loop();
    }

    function curM(){ var r=el.querySelector('.mlt-range'); return r?(+r.value/100):0; }

    function render(){
      var m=curM();
      iceEl.style.transform='translateX(-50%) scaleX('+(1-m*0.28).toFixed(3)+') scaleY('+(1-m*0.82).toFixed(3)+')';
      iceEl.style.opacity=(1-m*0.86).toFixed(2);
      puddleEl.style.width=(120+m*150).toFixed(0)+'px';
      puddleEl.style.height=(30+m*14).toFixed(0)+'px';
      var s=el.querySelector('.mlt-status'), nm,col,sub;
      if(m<0.05){nm='꽁꽁 언 얼음 (고체)';col='#1971C2';sub='단단해서 모양과 부피가 그대로예요.';}
      else if(m<0.95){nm='녹는 중 — 융해';col='#1C7ED6';sub='얼음이 줄어든 만큼 물이 차올라요. 양은 그대로!';}
      else {nm='다 녹은 물 (액체)';col='#1C7ED6';sub='줄줄 흘러 그릇 모양대로 변해요.';}
      if(s)s.innerHTML='<div style="font-size:29px;color:'+col+';">'+nm+'</div>'
        +'<div style="font-size:18px;color:#5a7894;margin-top:6px;line-height:1.4;">'+sub+'</div>';
      if(m>=0.95&&!done){ done=true; snd('success'); } if(m<0.95)done=false;
    }

    function spawnDrip(){
      if(!stage)return; var m=curM(); if(m<=0.04||m>=0.96)return;
      var sw=stage.clientWidth, sh=stage.clientHeight;
      var iceW=Math.min(sw*0.4,230)*(1-m*0.28);
      var iceH=(iceEl.clientHeight||230)*(1-m*0.82);
      var x=sw/2+(Math.random()-0.5)*iceW*0.7;
      var topY=sh-42-iceH+8;
      var im=document.createElement('img'); im.src=WATER; im.className='mlt-drip';
      im.style.left=(x-12)+'px'; im.style.top=topY+'px';
      dripLayer.appendChild(im);
      drips.push({el:im,x:x,y:topY,vy:1.3+Math.random()*0.7});
    }

    function ripple(x){
      var d=document.createElement('div'); d.className='mlt-ripple';
      d.style.left=x+'px'; d.style.top=(stage.clientHeight-50)+'px'; d.style.width='0px'; d.style.height='0px';
      dripLayer.appendChild(d); ripples.push({el:d,r:0,life:0});
    }

    function loop(){
      frame++; var m=curM();
      if(auto){ autoV=Math.min(100,autoV+0.5); var r=el.querySelector('.mlt-range'); if(r)r.value=Math.round(autoV); render(); if(autoV>=100)auto=false; }
      if(m>0.04&&m<0.96&&frame%18===0)spawnDrip();
      var floorY=stage?stage.clientHeight-56:0;
      for(var i=drips.length-1;i>=0;i--){ var d=drips[i]; d.vy+=0.16; d.y+=d.vy; d.el.style.top=d.y.toFixed(1)+'px';
        if(d.y>=floorY){ if(d.el.parentNode)d.el.parentNode.removeChild(d.el); drips.splice(i,1); if(stage){ripple(d.x); snd('tap');} } }
      for(var j=ripples.length-1;j>=0;j--){ var p=ripples[j]; p.r+=1.6; p.life+=0.06;
        p.el.style.width=p.el.style.height=(p.r*2).toFixed(0)+'px'; p.el.style.opacity=(1-p.life).toFixed(2);
        if(p.life>=1){ if(p.el.parentNode)p.el.parentNode.removeChild(p.el); ripples.splice(j,1);} }
      raf=requestAnimationFrame(loop);
    }

    function bind(){
      var r=el.querySelector('.mlt-range'); if(r)r.addEventListener('input',function(){ auto=false; render(); });
      el.querySelectorAll('.mlt-btn').forEach(function(b){ b.addEventListener('click',function(){
        if(b.dataset.act==='auto'){ var rr=el.querySelector('.mlt-range'); auto=true; autoV=rr?+rr.value:0; snd('charge'); }
        else { auto=false; var rr=el.querySelector('.mlt-range'); if(rr)rr.value=0;
          drips.forEach(function(d){if(d.el.parentNode)d.el.parentNode.removeChild(d.el);}); drips=[]; render(); snd('select'); }
      }); });
    }

    build();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
