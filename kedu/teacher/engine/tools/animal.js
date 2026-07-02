/* ============================================================================
   케이랩 도구 모듈 — 동물의 한살이 (animal) v1  [과학 11호 · 생명 2호]
   3학년 동물의 한살이. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준. plant 패턴 재활용.
   디지털 우위: 몇 주~몇 달 걸리는 한살이를 시간 압축 + 두 동물 나란히 비교.
   변수 → 현상 → 발견:
     ▸ 왼쪽 🦋 배추흰나비(완전 변태): 알→애벌레(허물벗기)→번데기→어른벌레.
     ▸ 오른쪽 🜲 잠자리(불완전 변태): 알→애벌레(약충, 물속)→어른벌레. 번데기 없음!
     ▸ 같은 시간을 나란히 흘려 보며 "번데기 단계가 있고 없고" 차이를 스스로 발견.
     ▸ 어른이 되면 다시 알을 낳음 → 한살이 순환.
   미션 4종(번데기/나비 어른/잠자리 어른+차이/번데기 있는 쪽 찾기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('animal', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        compare:false, quiz:false, missionN:2, terms:false, showWow:false },
      mid:  { modes:['free','mission','quiz'], compare:true,  quiz:true,  missionN:3, terms:false, showWow:true  },
      high: { modes:['free','mission','quiz'], compare:true,  quiz:true,  missionN:4, terms:true,  showWow:true  }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', vio:'#7048E8', leaf:'#51CF66', water:'#74C0FC' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 와우(예측 빗나감형): 「어른벌레는 (사람·강아지처럼) 더 자란다」 반증 ──
       라이브 drawButterfly는 애벌레만 grow로 몸을 키우고, 어른 나비는 크기 고정이다.
       그 「어른이 되면 더 안 자란다」를 전면화 = 흔한 성장 오개념(작은 곤충=아기) 직격.
       곤충은 애벌레(유충) 때 다 자라고, 어른벌레가 되면 탈피가 끝나 크기가 고정된다.
       (교과: 3학년 「애벌레는 허물을 벗으며 자란다」의 정확한 짝. 새 개념 아님.)
       2단 예측→확인: 🔮 무장(갓 나온 어른 나비 셋업) → 🍃 드러냄(며칠 흘려도 크기 그대로). */
    var day, playing, picked;
    var growArmed=false, growRevealed=false, anSeq=null, anSeq2=null;
    function reset(){ day=0; playing=false; picked=''; }
    reset();
    function clearAnFlash(){ var host=el&&el.querySelector('.kl-stage-host'); if(!host)return;
      host.querySelectorAll('.an-flash,.an-flash-magic,.an-nudge').forEach(function(n){ n.remove(); }); }
    function anFlash(cls, html, ms){
      var host=el.querySelector('.kl-stage-host'); if(!host)return; clearAnFlash();
      var col=(cls==='an-flash-magic')?C.vio:((cls==='an-flash')?C.water:'#868E96');
      var d=document.createElement('div'); d.className=cls;
      d.style.cssText='position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:90%;'
        +'background:'+col+';color:#fff;font-family:Jua,sans-serif;font-weight:800;font-size:19px;'
        +'padding:13px 20px;border-radius:18px;box-shadow:0 6px 22px rgba(0,0,0,0.22);'
        +'text-align:center;line-height:1.45;z-index:20;';
      d.innerHTML=html; host.appendChild(d);
      if(anSeq2)clearTimeout(anSeq2); anSeq2=setTimeout(function(){ if(d.parentNode)d.remove(); }, ms||3000);
    }
    function disarm(){ growArmed=false; growRevealed=false; if(anSeq){clearTimeout(anSeq);anSeq=null;} clearAnFlash(); }
    function wowArm(){
      if(mode==='quiz')return;
      reset(); growRevealed=false;
      day=15; // 배추흰나비가 막 어른벌레(나비)가 된 직후(BF[3]=15일)
      growArmed=true; snd('charge');
      build();
      anFlash('an-flash',
        '🦋 방금 번데기에서 나온 <b>어른 나비</b>예요.<br>먹이를 잔뜩 먹고 며칠 더 지나면 — 강아지처럼 <b>몸이 더 커질까요</b>, <b>그대로일까요</b>? 예상해 봐요!', 4200);
    }
    function wowReveal(){
      if(mode==='quiz')return;
      if(!growArmed){ snd('select');
        anFlash('an-nudge', '먼저 🔮 버튼으로 “더 클까, 그대로일까” 예상부터 해 봐요!', 2600); return; }
      // 즉시 마법(jsdom 검증 가능) — 어른 나비 구간(15~19일)을 흘려도 크기 상수(안 커짐)
      snd('whoosh'); snd('success');
      for(var d2=0; d2<4 && day<19; d2++){ day=Math.min(19,day+1); }
      growRevealed=true;
      renderScene(); renderStatus();
      anFlash('an-flash-magic',
        '🦋 며칠이 지나도 나비는 <b>조금도 더 자라지 않았어요!</b> 곤충은 <b>애벌레 때 다 자라고</b>,<br>'
        +'어른벌레가 되면 <b>크기가 고정</b>돼요 — 그러니 <b>작은 곤충도 아기가 아니라 다 자란 어른</b>이에요.', 5200);
    }
    // 단계: [시작일, 이름]
    var BF=[[0,'알'],[3,'애벌레'],[10,'번데기'],[15,'어른벌레(나비)'],[20,'다시 알!']];
    var DF=[[0,'알'],[4,'애벌레(약충)'],[14,'어른벌레(잠자리)'],[20,'다시 알!']];

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false; disarm(); reset();
      if(mode==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
      build();
    }});
    function stageOf(T){ var s=0; for(var i=0;i<T.length;i++)if(day>=T[i][0])s=i; return s; }
    function tickDay(){ day=Math.min(24,day+1); renderScene(); renderStatus(); checkMission(); }
    function pick(which){
      picked=which; renderScene(); renderStatus();
      if(mode==='mission'&&mStep===3&&!mLock&&which!=='bf')ui.toast(el,false);
      checkMission();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'▶ 시간을 흘려 배추흰나비의 <b style="color:#7048E8;">번데기</b> 단계를 봐요!',
        keep:false, check:function(){ return stageOf(BF)>=2; } },
      { text:'계속 흘려 <b style="color:#7048E8;">나비(어른벌레)</b>가 되는 순간까지!',
        keep:true, check:function(){ return stageOf(BF)>=3; } },
      { text:'잠자리도 <b style="color:#7048E8;">어른벌레</b>가 됐어요 — 나비와 달리 <b style="color:#7048E8;">없었던 단계</b>는 뭘까요? 끝까지 지켜봐요!',
        keep:true, check:function(){ return stageOf(DF)>=2; } },
      { text:'🔍 <b style="color:#7048E8;">번데기 단계를 거친 동물</b>의 그림(이름표)을 클릭해요!',
        keep:true, check:function(){ return picked==='bf'; } }
    ];
    function curMissions(){ return MISSIONS.slice(0, G().missionN); }
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; playing=false; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<M.length-1){ mStep++; if(!M[mStep].keep)reset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'배추흰나비 한살이의 순서로 맞는 것은?',
        ch:['알→애벌레→번데기→어른벌레','알→번데기→애벌레→어른벌레','애벌레→알→어른벌레'], a:0 },
      { q:'완전 변태와 불완전 변태의 차이는?',
        ch:['번데기 단계가 있고 없고','날개가 있고 없고','알을 낳고 안 낳고'], a:0 },
      { q:'잠자리의 한살이는 어느 쪽일까요?',
        ch:['불완전 변태 — 번데기가 없어요','완전 변태 — 번데기가 있어요','한살이가 없어요'], a:0 },
      { q:'애벌레는 어떻게 몸이 커질까요?',
        ch:['허물을 벗으면서 자라요','몸이 풍선처럼 부풀어요','크기가 변하지 않아요'], a:0 },
      { q:'동물의 한살이란 무엇일까요?',
        ch:['태어나 자라서 다시 자손을 남기기까지의 과정','하루 동안 하는 일','겨울잠을 자는 것'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    // 중학년 = 기본 3문(한살이 순서·허물 벗기·한살이 뜻), 고학년 = 전체 5문(완전/불완전 변태 용어 포함)
    function quizIdxPool(){ return (grade==='mid') ? [0,3,4] : [0,1,2,3,4]; }
    function newQuiz(){
      var pool=quizIdxPool();
      if(qUsed.length>=pool.length)qUsed=[];
      var cand=[]; for(var i=0;i<pool.length;i++)if(qUsed.indexOf(pool[i])<0)cand.push(pool[i]);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function ctrlRow(){
      return '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
        +'<button class="an-btn" data-act="play" style="'+btn+(playing?'background:'+C.vio+';color:#fff;border-color:'+C.vio:'background:#fff;color:'+C.vio+';border-color:'+C.vio)+';">'+(playing?'⏸ 멈춤':'▶ 시간 흐르기')+'</button>'
        +'<button class="an-btn" data-act="step" style="'+btn+'background:#fff;color:'+C.ink+';border-color:'+C.ink+';">+1일</button>'
        +'<span class="an-day" style="font-size:23px;font-weight:800;color:'+C.ink+';min-width:74px;text-align:center;">'+day+'일째</span>'
        +'<button class="an-btn" data-act="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시 알부터</button>'
        +'</div>';
    }
    function wowRow(){
      if(!(G().showWow && mode==='free')) return '';
      return '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:0 0 10px;">'
        +'<button class="an-wow" data-wow="arm" style="'+btn+'background:#fff;color:'+C.water+';border-color:'+C.water+';">🔮 어른이 되면 더 클까?</button>'
        +'<button class="an-wow" data-wow="reveal" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">🍃 며칠 더 키워보기</button>'
        +'</div>';
    }
    function holdPulse(txt){ return '<div class="an-hold" style="display:inline-block;margin-top:8px;font-size:18px;'
      +'font-weight:800;color:'+C.vio+';background:#F3F0FF;border:2px solid '+C.vio+';border-radius:12px;'
      +'padding:6px 14px;animation:anPulse 1s ease-in-out infinite;">'+txt+'</div>'; }
    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=ctrlRow()+wowRow();
      el.innerHTML='<style>.an-btn:active,.kl-choice:active,.an-wow:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.an-pane{cursor:pointer;}@keyframes anPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="an-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:linear-gradient(180deg,#E7F5FF 0%,#F4FCE3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="an-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; disarm(); reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      bands.bind(el);
      drawStage(); bind(); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage(){
      stage=el.querySelector('.an-stage'); stage.innerHTML='';
      svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      stage.appendChild(svg);
    }
    function drawButterfly(g,cx){ // 완전 변태 패널
      var s=stageOf(BF), gy=380;
      // 배경: 풀밭 + 배춧잎
      g.appendChild(svgEl('rect',{x:cx-200,y:gy,width:400,height:80,fill:'#B2F2BB'}));
      g.appendChild(svgEl('ellipse',{cx:cx,cy:gy-4,rx:120,ry:34,fill:C.leaf,stroke:'#2F9E44','stroke-width':3}));
      g.appendChild(svgEl('path',{d:'M '+(cx-110)+' '+(gy-4)+' Q '+cx+' '+(gy-26)+' '+(cx+110)+' '+(gy-4),fill:'none',stroke:'#2F9E44','stroke-width':2.5}));
      if(s===0){ // 알
        for(var e2=0;e2<4;e2++)g.appendChild(svgEl('ellipse',{cx:cx-24+e2*16,cy:gy-16,rx:5,ry:7,fill:'#FFE066',stroke:'#E6B400','stroke-width':1.5}));
      } else if(s===1){ // 애벌레 (허물 벗으며 자람)
        var grow=Math.min(1,(day-3)/6), segs=4+Math.round(grow*3), r=9+grow*6;
        for(var sg=0;sg<segs;sg++)g.appendChild(svgEl('circle',{cx:cx-segs*r*0.8+sg*r*1.6,cy:gy-14-r,r:r,fill:'#69DB7C',stroke:'#2F9E44','stroke-width':2.5}));
        g.appendChild(svgEl('circle',{cx:cx-segs*r*0.8-r*0.4,cy:gy-14-r-2,r:r*0.6,fill:'#2F9E44'}));
        if(grow>0.3)for(var m2=0;m2<Math.floor(grow*3);m2++){ // 벗어 놓은 허물
          var ht=svgEl('text',{x:cx+90+m2*26,y:gy-10,'font-size':16,opacity:0.55}); ht.textContent='〰️'; g.appendChild(ht); }
      } else if(s===2){ // 번데기 (가지에 매달림)
        g.appendChild(svgEl('line',{x1:cx-90,y1:gy-160,x2:cx+90,y2:gy-180,stroke:'#8D6E63','stroke-width':6,'stroke-linecap':'round'}));
        g.appendChild(svgEl('line',{x1:cx,y1:gy-170,x2:cx,y2:gy-150,stroke:'#A07855','stroke-width':3}));
        g.appendChild(svgEl('path',{d:'M '+cx+' '+(gy-150)+' q 20 18 14 50 q -5 26 -14 32 q -9 -6 -14 -32 q -6 -32 14 -50',fill:'#C8B08A',stroke:'#9C7E54','stroke-width':2.5,'data-pupa':'1'}));
      } else { // 어른벌레 나비 (날갯짓)
        var fl=Math.abs(Math.sin(frame/7)), wx=26+fl*16, by2=gy-190+Math.sin(frame/16)*10;
        g.appendChild(svgEl('ellipse',{cx:cx-wx,cy:by2-12,rx:30,ry:20,fill:'#fff',stroke:'#495057','stroke-width':2.5,transform:'rotate(-22 '+(cx-wx)+' '+(by2-12)+')'}));
        g.appendChild(svgEl('ellipse',{cx:cx+wx,cy:by2-12,rx:30,ry:20,fill:'#fff',stroke:'#495057','stroke-width':2.5,transform:'rotate(22 '+(cx+wx)+' '+(by2-12)+')'}));
        g.appendChild(svgEl('circle',{cx:cx-wx-6,cy:by2-16,r:4.5,fill:'#343A40'}));
        g.appendChild(svgEl('circle',{cx:cx+wx+6,cy:by2-16,r:4.5,fill:'#343A40'}));
        g.appendChild(svgEl('ellipse',{cx:cx,cy:by2,rx:7,ry:22,fill:'#495057'}));
        // 와우: 어른 나비 크기 고정 눈금(day 무관 상수 = "며칠 지나도 안 커짐"을 가시화)
        if(growArmed||growRevealed){
          var mkY0=gy-232, mkY1=gy-168, mkX=cx+72; // 나비 몸 높이 기준(64px 고정, sin 흔들림 제외)
          g.appendChild(svgEl('line',{x1:mkX,y1:mkY0,x2:mkX,y2:mkY1,stroke:C.vio,'stroke-width':3,'stroke-linecap':'round','data-bfsize':'64'}));
          g.appendChild(svgEl('line',{x1:mkX-9,y1:mkY0,x2:mkX+9,y2:mkY0,stroke:C.vio,'stroke-width':3,'stroke-linecap':'round'}));
          g.appendChild(svgEl('line',{x1:mkX-9,y1:mkY1,x2:mkX+9,y2:mkY1,stroke:C.vio,'stroke-width':3,'stroke-linecap':'round'}));
          var lbl=svgEl('text',{x:mkX+15,y:(mkY0+mkY1)/2+6,'font-family':'Jua,sans-serif','font-size':16,'font-weight':800,fill:C.vio}); lbl.textContent='크기 그대로'; g.appendChild(lbl);
        }
        if(s>=4){ for(var e3=0;e3<3;e3++)g.appendChild(svgEl('ellipse',{cx:cx-16+e3*16,cy:gy-16,rx:5,ry:7,fill:'#FFE066',stroke:'#E6B400','stroke-width':1.5}));
          var t4=svgEl('text',{x:cx,y:gy-60,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:C.good}); t4.textContent='🥚 다시 알! 한살이 완성'; g.appendChild(t4); }
      }
      // 이름표 + 단계
      var nm=svgEl('text',{x:cx,y:62,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':25,'font-weight':800,fill:(picked==='bf'?C.vio:C.ink)}); nm.textContent='🦋 배추흰나비'; g.appendChild(nm);
      var st=svgEl('text',{x:cx,y:444,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.sub,'data-bfstage':s}); st.textContent=BF[s][1]; g.appendChild(st);
    }
    function drawDragonfly(g,cx){ // 불완전 변태 패널
      var s=stageOf(DF), wy=300;
      // 연못
      g.appendChild(svgEl('rect',{x:cx-200,y:wy,width:400,height:160,fill:C.water,'fill-opacity':0.5}));
      g.appendChild(svgEl('path',{d:'M '+(cx-190)+' '+(wy+6)+' q 30 -10 60 0 q 30 10 60 0 q 30 -10 60 0 q 30 10 60 0 q 30 -10 60 0',fill:'none',stroke:'#fff','stroke-width':3,'stroke-opacity':0.6}));
      // 갈대
      g.appendChild(svgEl('line',{x1:cx-140,y1:wy+10,x2:cx-150,y2:wy-130,stroke:'#2F9E44','stroke-width':6,'stroke-linecap':'round'}));
      if(s===0){ // 알 (물속)
        for(var e2=0;e2<5;e2++)g.appendChild(svgEl('circle',{cx:cx-30+e2*14,cy:wy+70,r:4.5,fill:'#FFE066',stroke:'#E6B400','stroke-width':1.5}));
      } else if(s===1){ // 약충 (물속, 번데기 없이 점점 어른 닮아 감)
        var grow=Math.min(1,(day-4)/9), len=34+grow*26, ny=wy+70;
        g.appendChild(svgEl('ellipse',{cx:cx,cy:ny,rx:len/2,ry:11+grow*3,fill:'#A9845C',stroke:'#7B5E3C','stroke-width':2.5,'data-nymph':'1'}));
        g.appendChild(svgEl('circle',{cx:cx-len/2-7,cy:ny-2,r:9,fill:'#7B5E3C'}));
        for(var l2=0;l2<3;l2++){ g.appendChild(svgEl('line',{x1:cx-12+l2*12,y1:ny+9,x2:cx-18+l2*12,y2:ny+22,stroke:'#7B5E3C','stroke-width':2.5})); }
        if(grow>0.5){ // 날개싹(점점 어른을 닮아 감)
          g.appendChild(svgEl('ellipse',{cx:cx+6,cy:ny-10,rx:12,ry:5,fill:'#C8B08A','fill-opacity':0.8})); }
      } else { // 어른 잠자리 (물 위)
        var by2=wy-110+Math.sin(frame/13)*9, fl=Math.abs(Math.sin(frame/5));
        for(var w2=0;w2<2;w2++){ var sx=(w2?1:-1);
          g.appendChild(svgEl('ellipse',{cx:cx+sx*34,cy:by2-8,rx:38,ry:6+fl*3,fill:'#D0EBFF','fill-opacity':0.85,stroke:'#74C0FC','stroke-width':2,transform:'rotate('+(sx*10)+' '+(cx+sx*34)+' '+(by2-8)+')'}));
          g.appendChild(svgEl('ellipse',{cx:cx+sx*30,cy:by2+4,rx:32,ry:5+fl*3,fill:'#D0EBFF','fill-opacity':0.85,stroke:'#74C0FC','stroke-width':2,transform:'rotate('+(sx*-8)+' '+(cx+sx*30)+' '+(by2+4)+')'}));
        }
        g.appendChild(svgEl('rect',{x:cx-5,y:by2-6,width:10,height:64,rx:5,fill:'#1098AD'}));
        g.appendChild(svgEl('circle',{cx:cx,cy:by2-14,r:9,fill:'#0B7285'}));
        if(s>=3){ for(var e3=0;e3<4;e3++)g.appendChild(svgEl('circle',{cx:cx-24+e3*14,cy:wy+70,r:4.5,fill:'#FFE066',stroke:'#E6B400','stroke-width':1.5}));
          var t4=svgEl('text',{x:cx,y:wy-30,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:C.good}); t4.textContent='🥚 다시 알! 한살이 완성'; g.appendChild(t4); }
      }
      var nm=svgEl('text',{x:cx,y:62,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':25,'font-weight':800,fill:(picked==='df'?C.vio:C.ink)}); nm.textContent='🜲 잠자리'; g.appendChild(nm);
      var st=svgEl('text',{x:cx,y:444,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.sub,'data-dfstage':s});
      st.textContent=DF[s][1]+(s>=2?' — 번데기 없이!':''); g.appendChild(st);
    }
    function renderScene(){
      if(!svg)return;
      svg.innerHTML='';
      if(!G().compare){
        // 저학년: 나비 한 가지만 가운데
        var gOnly=svgEl('g',{'class':'an-pane','data-pick':'bf'}); svg.appendChild(gOnly); drawButterfly(gOnly,450);
        var dEl0=el.querySelector('.an-day'); if(dEl0)dEl0.textContent=day+'일째';
        svg.querySelectorAll('.an-pane').forEach(function(g2){ g2.addEventListener('click',function(){ pick(g2.getAttribute('data-pick')); }); });
        return;
      }
      svg.appendChild(svgEl('line',{x1:450,y1:30,x2:450,y2:440,stroke:'#B6C9DC','stroke-width':3,'stroke-dasharray':'8 8'}));
      var gb=svgEl('g',{'class':'an-pane','data-pick':'bf'}); svg.appendChild(gb); drawButterfly(gb,225);
      var gd=svgEl('g',{'class':'an-pane','data-pick':'df'}); svg.appendChild(gd); drawDragonfly(gd,675);
      var dEl=el.querySelector('.an-day'); if(dEl)dEl.textContent=day+'일째';
      svg.querySelectorAll('.an-pane').forEach(function(g2){
        g2.addEventListener('click',function(){ pick(g2.getAttribute('data-pick')); });
      });
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ frame++;
      if(mode!=='quiz' && playing && frame%26===0) tickDay();
      else if(mode!=='quiz' && frame%4===0) renderScene();
      raf=requestAnimationFrame(loop);
    }
    function renderStatus(){
      var s=el.querySelector('.an-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">키워 본 걸 떠올리며 답을 골라요</div>'; return; }
      var sb=stageOf(BF), sd=stageOf(DF), h;
      if(!G().compare){
        // 저학년: 나비 한살이 순서 일상어 닻(변태 용어·비교 없이)
        var tipsB=['🥚 알에서 시작해요 — ▶로 시간을 흘려 봐요!','애벌레가 잎을 먹고 무럭무럭 자라요.','번데기 속에서 몸이 바뀌고 있어요.','예쁜 나비가 됐어요! 🦋','나비가 다시 알을 낳았어요 — 알→애벌레→번데기→나비, 한살이 완성!'];
        h='<div style="font-size:24px;color:'+(sb>=3?C.good:C.ink)+';">'+day+'일째 — '+BF[sb][1]+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+tipsB[sb]+'</div>';
        s.innerHTML=h; return;
      }
      if(day===0)h='<div style="font-size:24px;color:'+C.ink+';">🥚 두 동물이 알에서 출발해요 — ▶로 시간을 흘려 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">나비와 잠자리의 한살이가 <b>어디가 같고 어디가 다른지</b> 나란히 비교해요.</div>';
      else if(sb===2&&sd<2)h='<div style="font-size:24px;color:'+C.vio+';">나비는 번데기 속에서 몸이 바뀌는 중!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">잠자리 애벌레(약충)는 번데기 없이 물속에서 점점 어른을 닮아 가요 — 차이가 보이나요?</div>';
      else if(sb>=3&&sd>=2)h='<div style="font-size:24px;color:'+C.good+';">둘 다 어른벌레! 그런데 길이 달랐어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(G().terms?'나비처럼 <b>번데기를 거치면 완전 변태</b>, 잠자리처럼 <b>번데기 없이 자라면 불완전 변태</b>예요.':'나비는 <b>번데기를 거쳐서</b>, 잠자리는 <b>번데기 없이</b> 어른이 됐어요!')+'</div>';
      else { h='<div style="font-size:24px;color:'+C.ink+';">'+day+'일째 — 나비: '+BF[sb][1]+' / 잠자리: '+DF[sd][1]+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(sb===1?'애벌레는 허물을 벗으며 자라요. 잠자리 약충은 물속에서 살아요!':'두 동물을 잘 지켜봐요 — 단계가 어떻게 다른가요?')+'</div>'; }
      if((growArmed||growRevealed)&&mode==='free') h+='<div>'+holdPulse('애벌레는 허물을 벗으며 쑥쑥 컸지요 — 어른벌레가 되면?')+'</div>';
      s.innerHTML=h;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.an-btn').forEach(function(b){ b.addEventListener('click',function(){
        var a=b.dataset.act;
        if(a==='play'){ disarm(); playing=!playing; build(); }
        else if(a==='step'){ disarm(); tickDay(); }
        else if(a==='reset'){ disarm(); reset(); build(); }
      }); });
      el.querySelectorAll('.an-wow').forEach(function(b){ b.addEventListener('click',function(){
        if(b.dataset.wow==='arm') wowArm(); else wowReveal();
      }); });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok,ok?null:('🤔 정답은 "'+q.ch[q.a]+'"!'));
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
