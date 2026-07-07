/* ============================================================================
   케이랩 도구 모듈 — 전기 회로 (circuit) v5  [과학 1호 · 직렬/병렬 + 전지 방향 + 3모드]
   v4 추가 (준호 "남은 자세한 컨트롤까지"):
     ▸ [직렬]/[병렬] 작업판 토글 — 병렬 가지에 전구를 독립으로.
     ▸ 전지 방향(극): '전지' 도구로 전지를 탭하면 ＋－ 방향이 바뀜.
        직렬에서 전지를 거꾸로 섞으면 상쇄(netB)되어 약해지거나 꺼짐.
   v5: KLab.ui 3모드(자유탐구/미션4/퀴즈5) 증축 — 퀴즈는 켜진 회로를 보고 예측형.
   v3 자유 배치(팔레트로 놓기/빼기, 스위치 여닫기) 유지. config.circ='parallel'로 병렬 진입.
   물리:
     직렬: netB=|Σ전지방향|, 전구≥1, 열린 스위치 없음 → 흐름. 밝기 netB/전구수. 전구0=합선.
     병렬: 본선 전지·스위치 → 흐르면 각 가지 전구 독립 점등(밝기 netB). 가지 전구0=합선.
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={wire:'#7C93AD',wireOn:'#FF9500',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',warn:'#E03131'};
  var TOOLS=[{k:'battery',l:'🔋 전지'},{k:'bulb',l:'💡 전구'},{k:'switch',l:'⏻ 스위치'},{k:'erase',l:'✖ 지우기'}];

  window.KLab.register('circuit', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){if(window.KLab.sound&&window.KLab.sound.play)window.KLab.sound.play(n);}
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var circ=(config.mode==='parallel'||config.circ==='parallel')?'parallel':'series';
    function defS(){return [{t:'battery',dir:1},{t:'wire'},{t:'bulb'},{t:'wire'},{t:'switch',open:false},{t:'wire'},{t:'bulb'},{t:'wire'}];}
    function defP(){return [{t:'battery',dir:1},{t:'switch',open:false},{t:'bulb'},{t:'bulb'},{t:'wire'}];} // 0본선전지,1본선스위치,2~4가지
    var sSlots=defS(), pSlots=defP(), tool='bulb';
    var predictArmed=false;

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=470, lft=130,rgt=770,top=140,bot=360, midx=(lft+rgt)/2, midy=(top+bot)/2;
    var SSLOT=[[midx-185,top],[midx,top],[midx+185,top],[rgt,midy],[midx+185,bot],[midx,bot],[midx-185,bot],[lft,midy]];
    function pslot(i){ if(i===0)return [lft,midy-52]; if(i===1)return [lft,midy+52];
      var n=pSlots.length-2, k=i-2; return [lft+180+(rgt-lft-220)*(n<=1?0.5:k/(n-1)), midy]; }
    var btn='font-size:21px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function slots(){return circ==='series'?sSlots:pSlots;}
    // ── 해석
    function calc(){
      if(circ==='series'){
        var net=0,L=0,openSw=false;
        sSlots.forEach(function(s){if(s.t==='battery')net+=(s.dir||1);else if(s.t==='bulb')L++;else if(s.t==='switch'&&s.open)openSw=true;});
        net=Math.abs(net);
        var flow=net>=1&&L>=1&&!openSw;
        return {net:net,L:L,openSw:openSw,flow:flow,short:net>=1&&L===0&&!openSw,bright:flow?net/L:0};
      } else {
        var net=0,openSw=false,bb=0;
        if(pSlots[0].t==='battery')net+=(pSlots[0].dir||1);
        if(pSlots[1].t==='switch'&&pSlots[1].open)openSw=true;
        if(pSlots[0].t==='switch'&&pSlots[0].open)openSw=true;   // 본선 어느 자리든 스위치 열림
        if(pSlots[1].t==='battery')net+=(pSlots[1].dir||1);
        net=Math.abs(net);
        for(var i=2;i<pSlots.length;i++)if(pSlots[i].t==='bulb')bb++;
        var mainFlow=net>=1&&!openSw;
        return {net:net,openSw:openSw,mainFlow:mainFlow,bb:bb,bright:mainFlow?net:0,short:net>=1&&!openSw&&bb===0};
      }
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { circ:'series', text:'🔋 <b style="color:#7048E8;">전지를 한 개 더</b> 놓아 전구를 더 밝게 만들어 봐요!',
        check:function(r){ return circ==='series' && r.flow && r.net>=2; } },
      { circ:'series', text:'전지 하나를 <b style="color:#7048E8;">거꾸로(＋－ 바꾸기)</b> 끼우면 어떻게 되는지 봐요!',
        check:function(r){ if(circ!=='series')return false; var nb=0; sSlots.forEach(function(s){if(s.t==='battery')nb++;}); return nb>=2 && r.net===0; } },
      { circ:'parallel', text:'🔀 병렬 — <b style="color:#7048E8;">세 가지 모두 전구</b>를 놓아 다 켜 봐요!',
        check:function(r){ return circ==='parallel' && r.mainFlow && r.bb>=3; } },
      { circ:'parallel', text:'✖ 가지 전구 <b style="color:#7048E8;">하나를 빼도</b> 나머지가 켜져 있는지 확인해 봐요!',
        check:function(r){ return circ==='parallel' && r.mainFlow && r.bb===2; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 미션 재설계 ──
       저=불 켜기(닫힌 회로) / 중=스위치·끊긴 곳(직렬 전체 영향) / 고=직렬·병렬(밝기·독립성). 직병렬 토글은 고학년만. */
    var LOW_MISSIONS=[
      { circ:'series', setup:function(){ sSlots=defS(); sSlots[4]={t:'switch',open:true}; },
        text:'💡 <b style="color:#7048E8;">스위치를 닫아</b> 전구에 불을 켜 봐요! 전기가 도는 길이 빙 둘러 이어져야 불이 켜져요.',
        check:function(r){ return r.flow; } },
      { circ:'series', setup:function(){ sSlots=defS(); },
        text:'🔋 이번엔 <b style="color:#7048E8;">전구를 하나 더</b> 놓아 봐요 — 길 위에 전구가 둘이어도 불이 들어와요!',
        check:function(r){ return r.flow && r.L>=2; } }
    ];
    var MID_MISSIONS=[
      { circ:'series', setup:function(){ sSlots=defS(); },
        text:'🔌 <b style="color:#7048E8;">스위치를 열어</b> 불을 꺼 봐요! 직렬은 한 줄이라, 한 곳만 끊겨도 전구가 전부 꺼져요.',
        check:function(r){ return r.openSw && !r.flow; } },
      { circ:'series', setup:function(){ sSlots=defS(); sSlots[4]={t:'switch',open:true}; },
        text:'✅ 다시 <b style="color:#7048E8;">스위치를 닫아</b> 불을 켜 봐요 — 끊긴 길이 이어지면 전류가 다시 흘러요!',
        check:function(r){ return r.flow; } }
    ];
    var GRADES={
      low:  { showCirc:false, showWow:false, missions:LOW_MISSIONS, hint:'부품을 골라 빈 칸을 탭해 놓아요. 스위치를 탭하면 여닫을 수 있어요.' },
      mid:  { showCirc:false, showWow:false, missions:MID_MISSIONS, hint:'스위치를 탭해 여닫아 보세요. 직렬은 한 곳만 끊겨도 전부 꺼져요.' },
      high: { showCirc:true,  showWow:true,  missions:MISSIONS,     hint:'직렬·병렬을 바꿔 가며 밝기와 독립성을 비교해 보세요. 스위치 탭=여닫기, 전지 탭=＋－ 방향.' }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; circ='series'; sSlots=defS();pSlots=defP(); tool='bulb'; predictArmed=false; buildUI();
    }});
    function checkMission(r){
      if(mode!=='mission'||mDone||mLock)return;
      if(curMissions()[mStep].check(r)){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          var CM=curMissions();
          if(mStep<CM.length-1){
            mStep++;
            if(CM[mStep].circ!==circ){ circ=CM[mStep].circ; sSlots=defS(); pSlots=defP(); }
            if(CM[mStep].setup)CM[mStep].setup();
          } else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (켜져 있는 회로를 보고 예측) ───────────── */
    var QUIZ=[
      { circ:'series',   q:'켜져 있는 이 스위치를 열면 어떻게 될까요?', ch:['모든 전구가 꺼져요','전구 하나만 꺼져요','더 밝아져요'], a:0 },
      { circ:'series',   q:'이 직렬 회로에 전구를 더 놓으면 밝기는?', ch:['어두워져요','밝아져요','변화 없어요'], a:0 },
      { circ:'parallel', q:'가지 전구 한 개를 빼면 나머지 전구는?', ch:['그대로 켜져 있어요','모두 꺼져요','더 어두워져요'], a:0 },
      { circ:'series',   q:'전지를 한 개 더 같은 방향으로 놓으면?', ch:['전구가 더 밝아져요','전구가 꺼져요','어두워져요'], a:0 },
      { circ:'series',   q:'전구를 모두 빼고 전지만 한 줄로 이으면?', ch:['합선되어 위험해요','더 밝아져요','아무 일 없어요'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      circ=QUIZ[qIdx].circ; sSlots=defS(); pSlots=defP();
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    /* ── 와우(고학년) — '직렬에 전구를 더 달면 더 밝다?' 예측 빗나감형 ──
       ① 전구 1개 환하게 켜고 예측을 무장 ② 하나 더 달면 오히려 1/N로 어두워짐을 보여 줌. 반복 가능. */
    function clearCiFlash(){var h=el.querySelector('.kl-stage-host');if(!h)return;var f=h.querySelector('.ci-flash');if(f)f.remove();}
    function ciFlash(html,magic){
      var h=el.querySelector('.kl-stage-host'); if(!h)return; clearCiFlash();
      var d=document.createElement('div'); d.className='ci-flash'+(magic?' ci-flash-magic':'');
      d.innerHTML=html; h.appendChild(d);
      setTimeout(function(){if(d.parentNode)d.remove();}, magic?2800:2600);
    }
    function firstWire(){for(var i=0;i<sSlots.length;i++)if(sSlots[i].t==='wire')return i; return -1;}
    function wowSetup(){
      circ='series';
      sSlots=[{t:'battery',dir:1},{t:'wire'},{t:'bulb'},{t:'wire'},{t:'switch',open:false},{t:'wire'},{t:'wire'},{t:'wire'}];
      predictArmed=true; snd('tap'); render();
      ciFlash('🔭 전구 <b>1개</b>가 환하게 켜졌어요.<br>여기에 전구를 <b>하나 더</b> 달면… 더 밝아질까요? 예상해 봐요!', false);
    }
    function wowReveal(){
      if(!predictArmed){ snd('select'); ciFlash('먼저 <b>「전구 늘리면 더 밝다?」</b>를 눌러 예상해 봐요!', false); return; }
      var wi=firstWire();
      if(wi<0){ snd('select'); ciFlash('전구가 이미 가득해요. ↺ 처음을 눌러 다시 해 봐요.', false); return; }
      sSlots[wi]={t:'bulb'};
      snd('whoosh'); snd('success'); render();
      var L=calc().L;
      ciFlash('💡 전구를 하나 더 달았는데 <b>오히려 더 어두워졌어요!</b><br>직렬은 전압을 <b>나눠 써서</b>, 전구가 '+L+'개면 각 전구는 <b>1/'+L+' 밝기</b>예요.', true);
    }

    function buildUI(){
      var pal=TOOLS.map(function(t){return '<button class="cir-tool'+(t.k===tool?' on':'')+'" data-tool="'+t.k+'" style="'+btn+(t.k===tool?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">'+t.l+'</button>';}).join('');
      var top=bands.selectorHTML()+ui.modeTabs(['free','mission','quiz'],mode), bar='', mid='', foot='';
      var circRow=GRADES[grade].showCirc?('<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;">'
          +'<button class="cir-mode'+(circ==='series'?' on':'')+'" data-mode="series" style="'+mbtn+'">직렬</button>'
          +'<button class="cir-mode'+(circ==='parallel'?' on':'')+'" data-mode="parallel" style="'+mbtn+'">병렬</button>'
        +'</div>'):'';
      var wowRow=(GRADES[grade].showWow&&circ==='series')?('<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;flex-wrap:wrap;">'
          +'<button class="cir-wow" data-wow="setup" style="'+mbtn+'">🔭 전구 늘리면 더 밝다?</button>'
          +'<button class="cir-wow" data-wow="reveal" style="'+mbtn+'background:#7048E8;color:#fff;">💡 정말 전구 하나 더 달기</button>'
        +'</div>'):'';
      var palRow='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:5px;">'+pal
          +'<button class="cir-tool" data-tool="reset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 처음</button></div>';
      var hint='<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">'+GRADES[grade].hint+'</div>';
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); mid=palRow+hint; }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else mid=circRow+wowRow+palRow+hint;
      el.innerHTML='<style>'
        +'.cir-tool:active,.cir-mode:active,.cir-wow:active,.kl-choice:active{transform:translateY(2px);}'
        +'.cir-tool.on{background:#1565C0 !important;color:#fff !important;}.cir-mode.on{background:#7048E8 !important;color:#fff !important;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.cir-hit{cursor:pointer;}@keyframes cirFlow{to{stroke-dashoffset:-30;}}.cir-flow{stroke-dasharray:3 13;stroke-linecap:round;animation:cirFlow .55s linear infinite;}'
        +'.ci-flash{position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:88%;background:linear-gradient(135deg,#EAF2FF,#DCE8FF);color:#1B3A57;border:3px solid #7BA7E8;border-radius:16px;padding:12px 18px;font-size:18px;font-weight:800;line-height:1.45;text-align:center;box-shadow:0 8px 24px rgba(21,101,192,0.22);z-index:5;animation:ciPop .32s cubic-bezier(.34,1.56,.64,1);}'
        +'.ci-flash-magic{background:linear-gradient(135deg,#F3ECFF,#E7DBFF);border-color:#9B7BE8;color:#3A2A6B;box-shadow:0 10px 30px rgba(112,72,232,0.30);}'
        +'@keyframes ciPop{0%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(.9);}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}}'
        +'.ci-hold{display:inline-block;margin-top:5px;color:#7048E8;font-size:16px;font-weight:800;animation:ciHold 1.1s ease-in-out infinite;}'
        +'@keyframes ciHold{0%,100%{opacity:.55;}50%{opacity:1;}}'
        +'</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="cir-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'44vh')+';min-height:'+(mode==='quiz'?'250':'320')+'px;background:radial-gradient(120% 120% at 50% 30%,#FCFDFF 0%,#EAF1FA 70%,#DCE8F6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="cir-status" style="text-align:center;margin-top:9px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; sSlots=defS();pSlots=defP(); tool='bulb'; predictArmed=false;
        if(m==='mission'){ var fm=curMissions()[0]; circ=fm.circ; sSlots=defS();pSlots=defP(); if(fm.setup)fm.setup(); }
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      bind(); render(); bands.bind(el);
    }

    function defs(svg){var d=svgEl('defs',{});d.innerHTML=
      '<radialGradient id="cGlassOn" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FFFEF2"/><stop offset="45%" stop-color="#FFE98A"/><stop offset="100%" stop-color="#FFC53D"/></radialGradient>'
     +'<radialGradient id="cGlassOff" cx="42%" cy="36%" r="68%"><stop offset="0" stop-color="#FBFDFF"/><stop offset="100%" stop-color="#C9D7E6"/></radialGradient>'
     +'<radialGradient id="cHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE066" stop-opacity="0.95"/><stop offset="55%" stop-color="#FFD43B" stop-opacity="0.4"/><stop offset="100%" stop-color="#FFD43B" stop-opacity="0"/></radialGradient>'
     +'<linearGradient id="cBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7DEE7"/><stop offset="50%" stop-color="#A9B8C8"/><stop offset="100%" stop-color="#8497AA"/></linearGradient>';
      svg.appendChild(d);}

    function bulb(svg,x,y,br){
      var on=br>0,r=34;
      if(on){var ro=Math.min(0.4+br*0.25,1);for(var a=0;a<360;a+=45){var rad=a*Math.PI/180,r1=r+12,r2=r+12+16*Math.min(br,2);svg.appendChild(svgEl('line',{x1:x+r1*Math.cos(rad),y1:y+r1*Math.sin(rad),x2:x+r2*Math.cos(rad),y2:y+r2*Math.sin(rad),stroke:'#FFD43B','stroke-width':4,'stroke-linecap':'round','stroke-opacity':ro}));}svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r+26+br*9,fill:'url(#cHalo)'}));}
      var by=y+r-5;
      svg.appendChild(svgEl('path',{d:'M '+(x-14)+' '+by+' L '+(x+14)+' '+by+' L '+(x+11)+' '+(by+26)+' L '+(x-11)+' '+(by+26)+' Z',fill:'url(#cBase)',stroke:'#7E909F','stroke-width':1.5}));
      for(var s=0;s<3;s++)svg.appendChild(svgEl('line',{x1:x-13+s,y1:by+6+s*8,x2:x+13-s,y2:by+6+s*8,stroke:'#7E909F','stroke-width':2,'stroke-opacity':0.7}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:r,fill:on?'url(#cGlassOn)':'url(#cGlassOff)',stroke:on?'#F0A500':'#A9BACB','stroke-width':3}));
      var fil='M '+(x-8)+' '+(by-2)+' L '+(x-8)+' '+(y+2);for(var c=0;c<5;c++){var fx=x-8+c*4;fil+=' Q '+(fx+2)+' '+(y-11)+' '+(fx+4)+' '+(y+2);}fil+=' L '+(x+8)+' '+(by-2);
      svg.appendChild(svgEl('path',{d:fil,fill:'none',stroke:on?'#FF7A00':'#9AB0C5','stroke-width':on?3.5:2.5,'stroke-linecap':'round','stroke-linejoin':'round'}));
      svg.appendChild(svgEl('ellipse',{cx:x-11,cy:y-12,rx:6,ry:10,fill:'#fff','fill-opacity':on?0.55:0.4,transform:'rotate(-25 '+(x-11)+' '+(y-12)+')'}));
    }
    function batteryUnit(svg,x,y,dir){
      dir=dir||1; var w=66,h=42;
      svg.appendChild(svgEl('rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:6,fill:'#3A4A5C',stroke:'#15202B','stroke-width':3}));
      var redX=dir>0?(x-w/2):(x+w/2-15);
      svg.appendChild(svgEl('rect',{x:redX,y:y-h/2,width:15,height:h,rx:6,fill:'#C0392B'}));
      svg.appendChild(svgEl('rect',{x:x-w/2,y:y-5,width:w,height:10,fill:'#FFD43B'}));
      var plusX=dir>0?(x+w/2-2):(x-w/2-5);
      svg.appendChild(svgEl('rect',{x:plusX,y:y-9,width:7,height:18,rx:2,fill:'#D7DEE7',stroke:'#8497AA','stroke-width':1}));
      var tx=dir>0?(x+w/2-13):(x-w/2+13);
      var t=svgEl('text',{x:tx,y:y+7,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:'#fff'});t.textContent='＋';svg.appendChild(t);
    }
    function leverSwitch(svg,x,y,open){
      svg.appendChild(svgEl('rect',{x:x-32,y:y-7,width:64,height:14,rx:7,fill:'#E3EAF2',stroke:'#A9BACB','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:8,fill:'#C2CEDB',stroke:'#7E909F','stroke-width':2}));
      svg.appendChild(svgEl('circle',{cx:x+23,cy:y,r:8,fill:'#C2CEDB',stroke:'#7E909F','stroke-width':2}));
      var ex=open?x+11:x+23, ey=open?y-28:y;
      svg.appendChild(svgEl('line',{x1:x-23,y1:y,x2:ex,y2:ey,stroke:open?'#7E909F':C.wireOn,'stroke-width':9,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:x-23,cy:y,r:4,fill:C.ink}));
    }
    function part(svg,s,x,y,br){
      if(s.t==='bulb')bulb(svg,x,y,br);
      else if(s.t==='battery')batteryUnit(svg,x,y,s.dir);
      else if(s.t==='switch')leverSwitch(svg,x,y,s.open);
    }
    function hit(svg,x,y,i){svg.appendChild(svgEl('circle',{cx:x,cy:y,r:46,fill:'transparent',class:'cir-hit','data-slot':i}));}
    function emptyDot(svg,x,y){svg.appendChild(svgEl('circle',{cx:x,cy:y,r:7,fill:'#fff',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'3 3'}));}

    function render(){
      var stage=el.querySelector('.cir-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'}); defs(svg);
      var r=calc();
      if(circ==='series'){
        var flow=r.flow, rr=26;
        var d='M '+(lft+rr)+' '+top+' L '+(rgt-rr)+' '+top+' Q '+rgt+' '+top+' '+rgt+' '+(top+rr)+' L '+rgt+' '+(bot-rr)+' Q '+rgt+' '+bot+' '+(rgt-rr)+' '+bot+' L '+(lft+rr)+' '+bot+' Q '+lft+' '+bot+' '+lft+' '+(bot-rr)+' L '+lft+' '+(top+rr)+' Q '+lft+' '+top+' '+(lft+rr)+' '+top+' Z';
        svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#415062','stroke-width':12,'stroke-opacity':0.16,'stroke-linejoin':'round'}));
        svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:flow?C.wireOn:C.wire,'stroke-width':7,'stroke-linejoin':'round'}));
        if(flow)svg.appendChild(svgEl('path',{d:d,fill:'none',stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));
        sSlots.forEach(function(s,i){var x=SSLOT[i][0],y=SSLOT[i][1];part(svg,s,x,y,r.bright);});
        sSlots.forEach(function(s,i){var x=SSLOT[i][0],y=SSLOT[i][1];if(s.t==='wire')emptyDot(svg,x,y);hit(svg,x,y,i);});
        if(r.short)svg.appendChild(svgEl('text',{x:midx,y:midy,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':26,'font-weight':800,fill:C.warn})).textContent='⚠ 합선! 전구를 넣어요';
      } else {
        var mf=r.mainFlow;
        // 위·아래 버스
        svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:rgt,y2:top,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        svg.appendChild(svgEl('line',{x1:lft,y1:bot,x2:rgt,y2:bot,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        if(mf){svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:rgt,y2:top,stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));svg.appendChild(svgEl('line',{x1:lft,y1:bot,x2:rgt,y2:bot,stroke:'#FFF7E0','stroke-width':5,class:'cir-flow'}));}
        // 본선 왼쪽 세로 (전지·스위치 자리)
        svg.appendChild(svgEl('line',{x1:lft,y1:top,x2:lft,y2:bot,stroke:mf?C.wireOn:C.wire,'stroke-width':7,'stroke-linecap':'round'}));
        // 가지 세로선 (각 전구 자리)
        for(var i=2;i<pSlots.length;i++){var px=pslot(i)[0], bon=(pSlots[i].t==='bulb'&&mf);
          svg.appendChild(svgEl('line',{x1:px,y1:top,x2:px,y2:bot,stroke:bon?C.wireOn:C.wire,'stroke-width':6,'stroke-linecap':'round'}));
          if(bon)svg.appendChild(svgEl('line',{x1:px,y1:top,x2:px,y2:bot,stroke:'#FFF7E0','stroke-width':4,class:'cir-flow'}));
        }
        // 부품
        pSlots.forEach(function(s,i){var p=pslot(i);part(svg,s,p[0],p[1],r.bright);});
        pSlots.forEach(function(s,i){var p=pslot(i);if(s.t==='wire')emptyDot(svg,p[0],p[1]);hit(svg,p[0],p[1],i);});
        if(r.short)svg.appendChild(svgEl('text',{x:midx+120,y:midy,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':24,'font-weight':800,fill:C.warn})).textContent='⚠ 가지에 전구를 넣어요';
      }
      stage.appendChild(svg);
      renderStatus(r);
      checkMission(r);
    }
    function renderStatus(r){
      var s=el.querySelector('.cir-status'), msg, sub;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;color:'+C.sub+';">그림 속 회로를 보고 답을 골라요!</div>'; return; }
      if(circ==='series'){
        if(r.short){msg='합선됐어요';sub='전구 없이 전지만 이으면 위험해요.';}
        else if(r.net===0){msg='전류가 안 흘러요';sub='전지를 놓거나, 거꾸로 끼운 전지의 방향을 맞춰 보세요.';}
        else if(r.openSw){msg='스위치가 열렸어요';sub='직렬은 한 줄이라 스위치 하나만 열려도 전부 꺼져요.';}
        else if(r.L===0){msg='전구가 없어요';sub='전구를 놓아 보세요.';}
        else{msg='<span style="color:'+C.good+';">불이 들어왔어요 ✨</span>';sub='직렬 — 전지 '+r.net+'칸·전구 '+r.L+'개. 전지가 많으면 밝고, 전구가 많으면 나눠 써서 어두워요.';}
      } else {
        if(r.short){msg='합선됐어요';sub='가지에 전구를 넣어요.';}
        else if(r.net===0){msg='전류가 안 흘러요';sub='본선에 전지를 놓거나 방향을 맞춰 보세요.';}
        else if(r.openSw){msg='본선 스위치가 열렸어요';sub='본선이 끊기면 모든 가지가 함께 꺼져요.';}
        else if(r.bb===0){msg='가지에 전구가 없어요';sub='가지 자리에 전구를 놓아 보세요.';}
        else{msg='<span style="color:'+C.good+';">가지마다 따로 켜짐 ✨</span>';sub='병렬 — 가지가 독립이라 한 가지 전구를 빼도 나머지는 그대로 켜지고, 전구가 많아도 밝기가 유지돼요.';}
      }
      if(msg.indexOf('span')<0)msg='<span style="color:'+(r.short?C.warn:C.sub)+';">'+msg+'</span>';
      var holdHtml=(predictArmed&&circ==='series'&&r.flow&&r.L>=2)?'<div class="ci-hold">전구가 늘수록 각 전구는 1/전구수 밝기로 어두워져요</div>':'';
      s.innerHTML='<div style="font-size:25px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:5px;line-height:1.4;">'+sub+'</div>'+holdHtml;
    }

    function bind(){
      el.querySelectorAll('.cir-wow').forEach(function(b){b.addEventListener('click',function(){
        if(b.dataset.wow==='setup')wowSetup(); else wowReveal();
      });});
      el.querySelectorAll('.cir-mode').forEach(function(b){b.addEventListener('click',function(){if(circ!==b.dataset.mode){snd('select');circ=b.dataset.mode;predictArmed=false;clearCiFlash();buildUI();}});});
      el.querySelectorAll('.cir-tool').forEach(function(b){b.addEventListener('click',function(){
        var k=b.dataset.tool;
        if(k==='reset'){snd('select');sSlots=defS();pSlots=defP();tool='bulb';predictArmed=false;clearCiFlash();buildUI();return;}
        snd('select'); tool=k; el.querySelectorAll('.cir-tool').forEach(function(x){x.classList.toggle('on',x.dataset.tool===tool);});
      });});
      el.querySelector('.cir-stage').addEventListener('click',function(e){
        if(mode==='quiz')return;
        var h=e.target.closest?e.target.closest('.cir-hit'):null; if(!h)return;
        var i=+h.getAttribute('data-slot'), arr=slots(), s=arr[i];
        if(tool==='erase') {s.t='wire'; delete s.open; delete s.dir;}
        else if(tool==='switch'){ if(s.t==='switch') s.open=!s.open; else {s.t='switch';s.open=false;} }
        else if(tool==='battery'){ if(s.t==='battery') s.dir=(s.dir||1)*-1; else {s.t='battery';s.dir=1;} }
        else { s.t='bulb'; }
        snd('tap'); clearCiFlash(); render();
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
    return function cleanup(){};
  });
})();
