/* ============================================================================
   케이랩 도구 모듈 — 식물의 한살이 (plant) v1  [과학 8호 · 생명 1호]
   4학년 식물의 한살이(강낭콩). KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 교실에서 몇 달 걸리는 한살이를 시간 압축 + 변인 통제 비교 실험.
   변수 → 현상 → 발견:
     ▸ 화분 2개 나란히, 각각 💧물·☀️빛 토글 + ▶시간 재생/+1일.
     ▸ 물·빛 OK → 씨앗→싹(떡잎)→잎·줄기→꽃→열매(꼬투리)→씨앗 (한살이 순환!).
     ▸ 물 없음 → 자람 멈추고 시들음(다시 주면 회복).
     ▸ 빛 없음 → 가늘고 길게 웃자라고 잎이 노래짐(황화) + 꽃은 못 피움.
     ▸ 두 화분의 조건을 하나만 다르게 → 변인 통제 비교 실험의 본질 체험.
   미션 4종(싹/꽃/한살이 완성/비교 실험) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('plant', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        compare:false, quiz:false, missionN:2, showWow:false },
      mid:  { modes:['free','mission','quiz'], compare:true,  quiz:true,  missionN:3, showWow:true  },
      high: { modes:['free','mission','quiz'], compare:true,  quiz:true,  missionN:4, showWow:true  }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null;
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', vio:'#7048E8', soil:'#8B5E3C', pot:'#C9763D',
              green:'#2F9E44', pale:'#C9C13B', brown:'#A07855', sun:'#F59F00', water:'#339AF0' };
    var btn = 'font-size:22px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }
    function clamp(v,a,b){ return Math.max(a,Math.min(v,b)); }
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 와우(예측 빗나감형): 「발아엔 빛이 꼭 필요하다」 반증 ──
       라이브 tickDay는 빛이 꺼져 있어도 g를 올려 싹을 틔운다(else 분기 p.g+=0.6).
       그 「빛 없이도 발아」를 전면화 = 흔한 오개념(빛=발아 필수) 직격.
       2단 예측→확인: 🌑 무장(물O·빛X 깜깜 셋업) → ⏩ 드러냄(며칠 → 깜깜한데도 싹틈). */
    var germArmed=false, germRevealed=false, germSeq=null;
    function clearPlFlash(){ var host=el&&el.querySelector('.kl-stage-host'); if(!host)return;
      host.querySelectorAll('.pl-flash,.pl-flash-magic,.pl-nudge').forEach(function(n){ n.remove(); }); }
    function plFlash(cls, html, ms){
      var host=el.querySelector('.kl-stage-host'); if(!host)return; clearPlFlash();
      var col=(cls==='pl-flash-magic')?C.vio:((cls==='pl-flash')?C.water:'#868E96');
      var d=document.createElement('div'); d.className=cls;
      d.style.cssText='position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:90%;'
        +'background:'+col+';color:#fff;font-family:Jua,sans-serif;font-weight:800;font-size:19px;'
        +'padding:13px 20px;border-radius:18px;box-shadow:0 6px 22px rgba(0,0,0,0.22);'
        +'text-align:center;line-height:1.45;z-index:20;';
      d.innerHTML=html; host.appendChild(d);
      if(germSeq2)clearTimeout(germSeq2); germSeq2=setTimeout(function(){ if(d.parentNode)d.remove(); }, ms||3000);
    }
    var germSeq2=null;
    function holdPulse(txt){ return '<div class="pl-hold" style="display:inline-block;margin-top:8px;font-size:18px;'
      +'font-weight:800;color:'+C.vio+';background:#F3F0FF;border:2px solid '+C.vio+';border-radius:12px;'
      +'padding:6px 14px;animation:plPulse 1s ease-in-out infinite;">'+txt+'</div>'; }
    function disarm(){ germArmed=false; germRevealed=false; if(germSeq){clearTimeout(germSeq);germSeq=null;} clearPlFlash(); }
    function wowArm(){
      if(mode==='quiz')return;
      reset(); germRevealed=false;
      pots[0].water=true; pots[0].light=false;
      if(G().compare){ pots[1].water=true; pots[1].light=false; }
      germArmed=true; snd('charge');
      build();
      plFlash('pl-flash',
        '🌑 💧물은 주고 ☀️빛은 껐어요 — 깜깜한 곳이에요.<br>이대로 며칠 지나면 씨앗이 <b>싹틀까요</b>, 빛이 없어 <b>못 틀까요</b>? 예상해 봐요!', 4200);
    }
    function wowReveal(){
      if(mode==='quiz')return;
      if(!germArmed){ snd('select');
        plFlash('pl-nudge', '먼저 🌑 버튼으로 “싹틀까, 못 틀까” 예상부터 해 봐요!', 2600); return; }
      // 즉시 마법(jsdom 검증 가능) — 빛 꺼진 채 발아까지 진행(라이브 로직 그대로: 빛 없어도 g 상승)
      snd('whoosh'); snd('success');
      for(var d2=0; d2<8 && stageOf(pots[0])<1; d2++){ tickDay(); }
      germRevealed=true;
      renderScene(); renderStatus();
      plFlash('pl-flash-magic',
        '🌱 깜깜한데도 <b>싹이 텄어요!</b> 씨앗은 빛이 없어도 <b>물·온도·공기</b>만 있으면 싹터요 —<br>'
        +'빛은 <b>싹이 튼 뒤 잎이 자랄 때</b> 필요해요. (그래서 빛 없이 자란 싹은 가늘고 노랗게 웃자라요)', 5200);
    }

    /* ───────────── 상태 ───────────── */
    var day, playing, pots, frame=0;
    function newPot(){ return { water:true, light:true, g:0, wilt:0, etio:0 }; }
    function reset(){ day=0; playing=false; pots=[newPot(),newPot()]; }
    reset();
    var STAGES=[['seed','씨앗'],['sprout','싹(떡잎)'],['leaf','잎·줄기'],['flower','꽃'],['fruit','열매(꼬투리)'],['seedDone','다시 씨앗!']];

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false; disarm(); reset();
      if(mode==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
      build();
    }});

    function stageOf(p){ var g=p.g;
      if(g<2)return 0; if(g<6)return 1; if(g<12)return 2; if(g<18)return 3; if(g<24)return 4; return 5; }
    function tickDay(){
      day++;
      for(var i=0;i<2;i++){ var p=pots[i];
        if(!p.water){ p.wilt=clamp(p.wilt+1,0,5); continue; }       // 물 없음 → 멈춤·시들음
        p.wilt=clamp(p.wilt-1,0,5);                                  // 물 주면 회복
        if(p.light){ p.g=clamp(p.g+1,0,24); p.etio=clamp(p.etio-0.5,0,6); }
        else { p.etio=clamp(p.etio+1,0,6); if(p.g<10)p.g+=0.6; }     // 빛 없음 → 웃자람, 꽃 전엔 멈춤
      }
      renderScene(); renderStatus(); checkMission();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'💧물과 ☀️빛을 주고 시간을 흘려 <b style="color:#7048E8;">싹(떡잎)</b>을 틔워 봐요!',
        keep:false, check:function(){ return stageOf(pots[0])>=1; } },
      { text:'계속 잘 보살펴서 <b style="color:#7048E8;">꽃</b>을 피워 봐요!',
        keep:true,  check:function(){ return stageOf(pots[0])>=3; } },
      { text:'열매(꼬투리) 속 <b style="color:#7048E8;">씨앗</b>까지! 씨앗에서 씨앗으로 — <b style="color:#7048E8;">한살이 완성</b>!',
        keep:true,  check:function(){ return stageOf(pots[0])>=5; } },
      { text:'🔬 비교 실험! 두 화분 모두 물은 주고, <b style="color:#7048E8;">오른쪽만 빛을 꺼서</b> 며칠 키워 차이를 확인해요!',
        keep:false, check:function(){ return pots[0].water&&pots[1].water&&pots[0].light&&!pots[1].light&&pots[0].g>=6&&pots[1].etio>=3; } }
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
      { q:'강낭콩 한살이의 순서로 맞는 것은?',
        ch:['씨앗→싹→잎·줄기→꽃→열매','꽃→씨앗→열매→싹','열매→꽃→씨앗→싹'], a:0 },
      { q:'씨앗이 싹 트는 데 꼭 필요한 것은?',
        ch:['적당한 물과 알맞은 온도','아주 큰 화분','시끄러운 소리'], a:0 },
      { q:'빛을 받지 못하고 자란 식물은 어떻게 될까요?',
        ch:['가늘고 길게 웃자라고 잎이 노래져요','더 굵고 튼튼해져요','꽃이 더 빨리 펴요'], a:0 },
      { q:'두 화분으로 비교 실험을 할 때, 다르게 해야 하는 조건은?',
        ch:['알아보려는 한 가지만','모든 조건','아무거나 두세 가지'], a:0 },
      { q:'열매(꼬투리) 속에 들어 있는 것은?',
        ch:['씨앗 — 한살이가 다시 시작돼요','물','뿌리'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    // 중학년 = 기본 개념 3문(한살이 순서·싹트는 조건·열매 속 씨앗), 고학년 = 전체 5문
    function quizIdxPool(){ return (grade==='mid') ? [0,1,4] : [0,1,2,3,4]; }
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
    function potCtrl(i){
      var p=pots[i];
      function tg(act,lab,on,col){ return '<button class="pl-btn" data-act="'+act+'" data-i="'+i+'" style="font-size:19px;padding:9px 14px;border-radius:13px;border:3px solid '+col+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;background:'+(on?col:'#fff')+';color:'+(on?'#fff':col)+';">'+lab+'</button>'; }
      return '<div style="display:flex;gap:7px;align-items:center;">'
        +'<span style="font-size:18px;font-weight:800;color:'+C.sub+';">'+(i===0?'왼쪽':'오른쪽')+'</span>'
        + tg('water','💧 물',p.water,C.water) + tg('light','☀️ 빛',p.light,C.sun) + '</div>';
    }
    function ctrlRow(){
      return '<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
        + potCtrl(0)
        +'<button class="pl-btn" data-act="play" style="'+btn+(playing?'background:'+C.vio+';color:#fff;border-color:'+C.vio:'background:#fff;color:'+C.vio+';border-color:'+C.vio)+';">'+(playing?'⏸ 멈춤':'▶ 시간 흐르기')+'</button>'
        +'<button class="pl-btn" data-act="step" style="'+btn+'background:#fff;color:'+C.ink+';border-color:'+C.ink+';">+1일</button>'
        +'<span class="pl-day" style="font-size:23px;font-weight:800;color:'+C.ink+';min-width:74px;text-align:center;">'+day+'일째</span>'
        +'<button class="pl-btn" data-act="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 다시 심기</button>'
        + (G().compare ? potCtrl(1) : '')
        +'</div>';
    }
    function wowRow(){
      if(!(G().showWow && mode==='free')) return '';
      return '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:0 0 10px;">'
        +'<button class="pl-wow" data-wow="arm" style="'+btn+'background:#fff;color:'+C.water+';border-color:'+C.water+';">🌑 빛 없이도 싹이 틀까?</button>'
        +'<button class="pl-wow" data-wow="reveal" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">⏩ 며칠 지내보기</button>'
        +'</div>';
    }
    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=ctrlRow()+wowRow();
      el.innerHTML='<style>.pl-btn:active,.kl-choice:active,.pl-wow:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}@keyframes plPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="pl-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:linear-gradient(180deg,#E7F5FF 0%,#F4FCE3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="pl-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; disarm(); reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      bands.bind(el);
      drawStage(); bind(); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, dyn={};
    function drawStage(){
      stage=el.querySelector('.pl-stage'); stage.innerHTML=''; dyn={};
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      dyn.svg=svg; dyn.pot=[];
      var nPot=G().compare?2:1;
      var xs=(nPot===2)?[260,640]:[450];
      for(var i=0;i<nPot;i++){
        var g=svgEl('g',{}); svg.appendChild(g);
        dyn.pot.push({root:g,cx:xs[i],groundY:380});
      }
      stage.appendChild(svg);
    }

    function drawPlant(d,p){ // d=dyn.pot[i], p=pots[i]
      var g=d.root; g.innerHTML='';
      var cx=d.cx, gy=d.groundY, st2=stageOf(p);
      var paleK=p.etio/6, wiltK=p.wilt/5;
      function mix(a,b,k){ // hex 색 보간
        var pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16), o='#';
        for(var s=16;s>=0;s-=8){ var va=(pa>>s)&255, vb=(pb>>s)&255, v=Math.round(va+(vb-va)*k);
          o+=('0'+v.toString(16)).slice(-2); } return o; }
      var leafCol=mix(mix(C.green,C.pale,paleK),C.brown,wiltK);
      var stemCol=mix(mix('#37B24D',C.pale,paleK),C.brown,wiltK);
      // 해/구름 (빛 상태)
      if(p.light)g.appendChild(svgEl('circle',{cx:cx+120,cy:90,r:30,fill:C.sun,'fill-opacity':0.9}));
      else { g.appendChild(svgEl('ellipse',{cx:cx+120,cy:90,rx:46,ry:22,fill:'#ADB5BD'}));
             g.appendChild(svgEl('ellipse',{cx:cx+90,cy:100,rx:34,ry:18,fill:'#CED4DA'})); }
      // 물뿌리개/물방울 (물 상태)
      if(p.water){ for(var w2=0;w2<3;w2++){ var wy=gy-150+((frame*2+w2*40)%110);
        g.appendChild(svgEl('circle',{cx:cx-95+w2*16,cy:wy,r:5,fill:C.water,'fill-opacity':0.7})); }
        var wt=svgEl('text',{x:cx-92,y:gy-160,'font-size':26}); wt.textContent='💧'; g.appendChild(wt); }
      // 화분
      g.appendChild(svgEl('path',{d:'M '+(cx-78)+' '+gy+' L '+(cx+78)+' '+gy+' L '+(cx+58)+' '+(gy+58)+' L '+(cx-58)+' '+(gy+58)+' Z',fill:C.pot,stroke:'#A55A2A','stroke-width':3}));
      g.appendChild(svgEl('ellipse',{cx:cx,cy:gy,rx:78,ry:14,fill:C.soil,stroke:'#6E4226','stroke-width':3}));
      // 식물 본체
      var h = Math.min(p.g,24)/24*230*(1+paleK*0.45);      // 웃자람=더 길게
      var sw = 9*(1-paleK*0.45);                            // 웃자람=더 가늘게
      var bend = wiltK*42;                                  // 시들음=고개 숙임
      if(st2===0){ // 씨앗
        g.appendChild(svgEl('ellipse',{cx:cx,cy:gy-6,rx:11,ry:8,fill:'#B5651D',stroke:'#8B4513','stroke-width':2}));
      } else {
        var topX=cx+bend, topY=gy-h;
        g.appendChild(svgEl('path',{d:'M '+cx+' '+gy+' Q '+cx+' '+(gy-h*0.55)+' '+topX+' '+topY,fill:'none',stroke:stemCol,'stroke-width':sw,'stroke-linecap':'round'}));
        if(st2===1){ // 떡잎 2장
          g.appendChild(svgEl('ellipse',{cx:topX-16,cy:topY,rx:17,ry:11,fill:leafCol,transform:'rotate(-24 '+(topX-16)+' '+topY+')'}));
          g.appendChild(svgEl('ellipse',{cx:topX+16,cy:topY,rx:17,ry:11,fill:leafCol,transform:'rotate(24 '+(topX+16)+' '+topY+')'}));
        } else { // 본잎들 (g에 비례)
          var nL=Math.min(6,Math.floor(p.g/3));
          for(var L2=0;L2<nL;L2++){ var f2=(L2+1)/(nL+1), ly=gy-h*f2, side=(L2%2?1:-1);
            var lx=cx+bend*f2*f2;
            g.appendChild(svgEl('ellipse',{cx:lx+side*24,cy:ly,rx:24,ry:13,fill:leafCol,transform:'rotate('+(side*22)+' '+(lx+side*24)+' '+ly+')'}));
          }
          if(st2>=3){ // 꽃
            for(var pt=0;pt<5;pt++){ var an=pt/5*6.283;
              g.appendChild(svgEl('circle',{cx:topX+Math.cos(an)*15,cy:topY+Math.sin(an)*15,r:10,fill:'#FAA2C1'})); }
            g.appendChild(svgEl('circle',{cx:topX,cy:topY,r:9,fill:'#FFD43B'}));
          } else {
            g.appendChild(svgEl('ellipse',{cx:topX,cy:topY,rx:13,ry:9,fill:leafCol}));
          }
          if(st2>=4){ // 꼬투리
            for(var pd=0;pd<3;pd++){ var py=gy-h*(0.55+pd*0.12), px=cx+bend*0.4+(pd%2?28:-28);
              g.appendChild(svgEl('path',{d:'M '+px+' '+py+' q 9 26 0 44 q -9 -18 0 -44',fill:'#69B34C',stroke:'#4F8A36','stroke-width':2}));
              if(st2>=5){ for(var sd=0;sd<3;sd++)g.appendChild(svgEl('circle',{cx:px,cy:py+12+sd*11,r:4.5,fill:'#B5651D'})); }
            }
          }
          if(st2>=5){ var t5=svgEl('text',{x:cx,y:gy-h-34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':23,'font-weight':800,fill:C.good}); t5.textContent='🌱 다시 씨앗! 한살이 완성'; g.appendChild(t5); }
        }
      }
      // 단계 라벨
      var lb=svgEl('text',{x:cx,y:gy+88,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':21,'font-weight':800,fill:C.ink});
      lb.textContent=STAGES[st2][1]+(p.wilt>=2?' · 시들시들':'')+(p.etio>=3?' · 웃자람':''); g.appendChild(lb);
    }
    function renderScene(){
      if(!dyn.pot)return;
      for(var i=0;i<dyn.pot.length;i++)drawPlant(dyn.pot[i],pots[i]);
      var dEl=el.querySelector('.pl-day'); if(dEl)dEl.textContent=day+'일째';
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ frame++;
      if(mode!=='quiz' && playing && frame%28===0) tickDay();
      else if(mode!=='quiz' && frame%6===0) renderScene();   // 물방울 등 가벼운 애니
      raf=requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.pl-status'); if(!s)return;
      if(germArmed){
        if(germRevealed){
          s.innerHTML='<div style="font-size:24px;color:'+C.good+';">🌱 '+day+'일째 — 빛 없이도 싹이 텄어요!</div>'
            + holdPulse('빛 없이 자란 싹은 가늘고 노랗게 웃자라요 — 빛은 싹튼 뒤 자람에 필요해요');
        } else {
          s.innerHTML='<div style="font-size:24px;color:'+C.water+';">🌑 깜깜한 곳 · '+day+'일째 — 싹이 틀까요, 안 틀까요?</div>'
            + holdPulse('씨앗 속엔 싹틔울 양분이 들어 있어요 — 빛은 그 다음 이야기');
        }
        return;
      }
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">키워 본 걸 떠올리며 답을 골라요</div>'; return; }
      var p0=pots[0],p1=pots[1],h;
      if(!G().compare){
        // 저학년: 화분 1개·일상어 닻(웃자람/황화/비교실험 용어 없이)
        if(day===0)h='<div style="font-size:24px;color:'+C.ink+';">🌱 씨앗을 심었어요 — ▶로 시간을 흘려 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">💧물과 ☀️빛을 주면 씨앗이 무럭무럭 자라요.</div>';
        else if(!p0.water)h='<div style="font-size:24px;color:'+C.brown+';">물이 없으면 자라지 못해요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">💧를 다시 켜 주세요 — 식물에게 물은 꼭 필요해요.</div>';
        else if(!p0.light)h='<div style="font-size:24px;color:'+C.pale+';">빛이 없으면 잘 자라지 못해요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">☀️를 켜 주세요 — 식물은 빛을 받아야 튼튼하게 자라요.</div>';
        else { var stl=stageOf(p0);
          var tipsL=['곧 싹이 터요!','떡잎이 나왔어요 — 곧 잎이 더 나와요.','잎과 줄기가 쑥쑥 자라요!','예쁜 꽃이 피었어요!','꽃이 진 자리에 열매가 생겼어요.','씨앗에서 시작해 다시 씨앗으로 — 한살이를 다 봤어요! ↺로 새 씨앗을 심어 봐요.'];
          h='<div style="font-size:24px;color:'+C.good+';">'+day+'일째 — '+STAGES[stl][1]+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+tipsL[stl]+'</div>'; }
        s.innerHTML=h; return;
      }
      var diff=(p0.water!==p1.water)||(p0.light!==p1.light);
      if(day===0)h='<div style="font-size:24px;color:'+C.ink+';">🌱 씨앗을 심었어요 — ▶로 시간을 흘려 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">두 화분의 💧물·☀️빛을 다르게 해서 <b>비교 실험</b>도 할 수 있어요. 다르게 하는 조건은 꼭 한 가지만!</div>';
      else if(diff)h='<div style="font-size:24px;color:'+C.vio+';">🔬 비교 실험 중 — 두 화분이 어떻게 달라질까요?</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+(p0.light!==p1.light?'빛을 못 받는 쪽은 가늘고 길게 <b>웃자라고</b> 잎이 노래져요(황화).':'물을 못 받는 쪽은 자라지 못하고 <b>시들어요</b>. 다시 주면 살아나요!')+'</div>';
      else if(!p0.water)h='<div style="font-size:24px;color:'+C.brown+';">물이 없으면 자라지 못하고 시들어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">💧를 다시 켜면 천천히 살아나요. 식물에게 물은 꼭 필요해요.</div>';
      else if(!p0.light)h='<div style="font-size:24px;color:'+C.pale+';">빛이 없으면 가늘고 길게 웃자라요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">빛을 찾아 키만 커지고 잎은 노래져요. 꽃도 못 피워요 — ☀️를 켜 주세요!</div>';
      else { var st0=stageOf(p0);
        var tips=['곧 싹이 터요!','떡잎이 나왔어요 — 떡잎 사이에서 본잎이 나올 거예요.','잎과 줄기가 쑥쑥! 잎이 점점 많아져요.','꽃이 피었어요 — 꽃이 진 자리에 열매가 생겨요.','꼬투리(열매) 속에서 씨앗이 자라고 있어요.','씨앗에서 시작해 다시 씨앗으로 — 이게 <b>한살이</b>예요! ↺로 새 씨앗을 심어 봐요.'];
        h='<div style="font-size:24px;color:'+C.good+';">'+day+'일째 — '+STAGES[st0][1]+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'+tips[st0]+'</div>'; }
      s.innerHTML=h;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.pl-btn').forEach(function(b){ b.addEventListener('click',function(){
        var a=b.dataset.act, i=+b.dataset.i;
        if(a==='water'){ disarm(); pots[i].water=!pots[i].water; snd('select'); build(); }
        else if(a==='light'){ disarm(); pots[i].light=!pots[i].light; snd('select'); build(); }
        else if(a==='play'){ disarm(); playing=!playing; snd('select'); build(); }
        else if(a==='step'){ disarm(); tickDay(); snd('tap'); renderScene(); }
        else if(a==='reset'){ disarm(); reset(); snd('select'); build(); }
      }); });
      el.querySelectorAll('.pl-wow').forEach(function(b){ b.addEventListener('click',function(){
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
