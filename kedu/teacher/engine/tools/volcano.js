/* ============================================================================
   케이랩 도구 모듈 — 화산과 지진 (volcano) v1  [과학 12호 · 지구 영역]
   4학년 화산과 지진. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 위험해서 못 보는 화산 분출·지진을 땅속 단면째로 안전하게 체험.
   변수 → 현상 → 발견:
     ▸ 🌋 화산 — 🔥 버튼으로 마그마 방 압력을 키우면 분출! 분출물 3종
       (용암·화산재·화산 가스) 라벨을 클릭해 이름 확인.
       분출 후 🪨 빨리 식히기=현무암(구멍 송송) / 💎 천천히 식히기=화강암(알갱이 큼).
     ▸ 🌍 지진 — ➡️ 힘을 계속 가하면 땅이 휘다가 우지끈 끊어지며 흔들림.
       "땅이 큰 힘을 오래 받으면 끊어지면서 지진이 난다".
   미션 4종(분출/분출물 3종/암석 2종/지진) + 퀴즈 5문(마그마·용암·현무암·화강암·대처).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('volcano', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', hot:'#FA5252', lava:'#FF6B2C', lava2:'#FFD43B',
              rock:'#6E4226', rock2:'#8D6E63', sky:'#CDE8FF', ash:'#868E96',
              basalt:'#343A40', granite:'#E9D8C8', good:'#12B886', vio:'#7048E8' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    /* ───────────── 상태 ───────────── */
    var exp; // 'volcano' | 'quake'
    var vol, qk;
    function volReset(){ vol={ press:0, erupting:false, t:0, seen:{lava:false,ash:false,gas:false}, made:{basalt:false,granite:false} }; }
    function qkReset(){ qk={ stress:0, broken:false, t:0 }; }
    function resetAll(){ exp='volcano'; volReset(); qkReset(); }
    resetAll();

    function pump(){
      if(vol.erupting){ ui.toast(el,false,'이미 분출 중이에요! ↺ 새 화산으로'); return; }
      vol.press=Math.min(100,vol.press+20);
      if(vol.press>=100){ vol.erupting=true; vol.t=0; ui.toast(el,true,'🌋 콰과광! 화산이 분출했어요!'); }
      renderScene(); renderStatus(); checkMission();
    }
    function cool(kind){
      if(!vol.erupting){ ui.toast(el,false,'먼저 화산을 분출시켜야 해요!'); return; }
      vol.made[kind]=true;
      ui.toast(el,true, kind==='basalt' ? '🪨 표면에서 빨리 식어 현무암! 구멍이 송송'
                                        : '💎 땅속에서 천천히 식어 화강암! 알갱이가 커요');
      renderScene(); renderStatus(); checkMission();
    }
    function seeEjecta(k){
      vol.seen[k]=true;
      var M={ lava:'🔥 용암 — 마그마가 땅 위로 흘러나온 것!', ash:'🌫️ 화산재 — 잘게 부서진 돌가루가 하늘 높이!', gas:'💨 화산 가스 — 수증기 등 여러 기체!' };
      ui.toast(el,true,M[k]);
      renderScene(); renderStatus(); checkMission();
    }
    function push(){
      if(qk.broken){ ui.toast(el,false,'이미 끊어졌어요! ↺ 새 땅으로'); return; }
      qk.stress=Math.min(100,qk.stress+20);
      if(qk.stress>=100){ qk.broken=true; qk.t=0; ui.toast(el,true,'🌍 우지끈! 땅이 끊어지며 지진!'); }
      renderScene(); renderStatus(); checkMission();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { exp:'volcano', text:'🔥 <b style="color:#7048E8;">압력 키우기</b>를 눌러 마그마 방 압력을 100%로 — <b style="color:#7048E8;">화산 분출</b>!',
        check:function(){ return exp==='volcano' && vol.erupting; } },
      { exp:'volcano', text:'분출물 <b style="color:#7048E8;">용암·화산재·화산 가스</b> 라벨을 모두 눌러 이름을 확인해 봐요!',
        check:function(){ return exp==='volcano' && vol.erupting && vol.seen.lava && vol.seen.ash && vol.seen.gas; } },
      { exp:'volcano', text:'🪨 빨리 식혀 <b style="color:#7048E8;">현무암</b>, 💎 천천히 식혀 <b style="color:#7048E8;">화강암</b> — 둘 다 만들어 봐요!',
        check:function(){ return exp==='volcano' && vol.made.basalt && vol.made.granite; } },
      { exp:'quake', text:'➡️ <b style="color:#7048E8;">힘 가하기</b>를 계속 눌러 땅을 끊어 봐요 — <b style="color:#7048E8;">지진</b> 발생!',
        check:function(){ return exp==='quake' && qk.broken; } }
    ];
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){
            mStep++;
            var keep=(MISSIONS[mStep].exp===exp); // 1→2→3은 같은 화산 상태 유지
            exp=MISSIONS[mStep].exp;
            if(!keep){ volReset(); qkReset(); }
          } else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { pic:'volcano', q:'땅속 깊은 곳에서 암석이 녹아 있는 것을 무엇이라고 할까요?', ch:['마그마','용암','화산재'], a:0 },
      { pic:'volcano', q:'마그마가 땅 위로 흘러나온 것을 무엇이라고 할까요?', ch:['용암','마그마','화산 가스'], a:0 },
      { pic:'volcano', q:'표면에서 빨리 식어 구멍이 송송 뚫린 어두운 암석은?', ch:['현무암','화강암','대리암'], a:0 },
      { pic:'volcano', q:'땅속 깊은 곳에서 천천히 식어 알갱이가 큰 암석은?', ch:['화강암','현무암','석회암'], a:0 },
      { pic:'quake', q:'건물 안에서 지진이 났을 때 가장 올바른 행동은?', ch:['책상 아래로 들어가 머리 보호','창문 옆에 서 있기','엘리베이터 타고 내려가기'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:20px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function expTabs(){
      var L=[['volcano','🌋 화산'],['quake','🌍 지진']];
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + L.map(function(x){ var on=(exp===x[0]);
            return '<button class="vc-exp" data-e="'+x[0]+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.hot:'#fff')+';color:'+(on?'#fff':C.hot)+';">'+x[1]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      if(exp==='volcano'){
        var canCool=vol.erupting;
        return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="vc-btn" data-act="pump" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 압력 키우기</button>'
          +'<button class="vc-btn" data-act="basalt" style="'+btn+(canCool?'background:#fff;color:'+C.ink+';border-color:'+C.basalt:'background:#f1f3f5;color:#adb5bd;border-color:#dee2e6')+';">🪨 빨리 식히기 → 현무암</button>'
          +'<button class="vc-btn" data-act="granite" style="'+btn+(canCool?'background:#fff;color:'+C.ink+';border-color:#C9A227':'background:#f1f3f5;color:#adb5bd;border-color:#dee2e6')+';">💎 천천히 식히기 → 화강암</button>'
          +'<button class="vc-btn" data-act="volReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 화산</button></div>';
      }
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        +'<button class="vc-btn" data-act="push" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">➡️ 힘 가하기</button>'
        +'<button class="vc-btn" data-act="qkReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 땅</button></div>';
    }

    function build(){
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+ctrlRow();
      el.innerHTML='<style>.vc-btn:active,.vc-exp:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}@keyframes vcShake{0%,100%{transform:translate(0,0);}20%{transform:translate(-7px,3px);}40%{transform:translate(6px,-3px);}60%{transform:translate(-5px,2px);}80%{transform:translate(4px,-2px);}}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="vc-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="vc-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; resetAll();
        if(m==='mission')exp=MISSIONS[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bind(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    function renderScene(){
      var stage=el.querySelector('.vc-stage'); if(!stage)return;
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      if(pic==='volcano')drawVolcano(svg); else drawQuake(svg);
      stage.appendChild(svg);
    }

    function drawVolcano(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      g.innerHTML=
        // 하늘 + 땅 단면
        '<rect x="0" y="0" width="900" height="250" fill="'+C.sky+'"/>'
        +'<rect x="0" y="250" width="900" height="210" fill="'+C.rock2+'"/>'
        +'<rect x="0" y="250" width="900" height="14" fill="#5D8C3F"/>'
        // 화산 산체
        +'<path d="M 250 250 L 430 70 L 470 70 L 650 250 Z" fill="'+C.rock+'"/>'
        // 마그마 방 + 화도
        +'<ellipse cx="450" cy="395" rx="120" ry="52" fill="'+C.lava+'" opacity="0.95"/>'
        +'<rect x="436" y="92" width="28" height="310" fill="'+C.lava+'" opacity="'+(vol.press>=40?0.95:0.45)+'"/>'
        +'<text x="450" y="402" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="inherit">마그마 방</text>'
        // 압력 게이지
        +'<rect x="40" y="300" width="34" height="130" rx="10" fill="#fff" stroke="'+C.hot+'" stroke-width="3"/>'
        +'<rect x="44" y="'+(426-118*vol.press/100)+'" width="26" height="'+(118*vol.press/100)+'" rx="7" fill="'+C.hot+'"/>'
        +'<text x="57" y="290" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.hot+'" font-family="inherit">압력 '+vol.press+'%</text>';
      if(vol.erupting){
        var e=svgEl('g',{class:'vc-erupt'}); g.appendChild(e);
        var ashDots='';
        for(var i=0;i<26;i++){
          var a=(i*0.83)%1, x=450+Math.sin(i*2.7)*(30+a*120), y=70-a*64-Math.abs(Math.sin(i))*8;
          ashDots+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(4+(i%3)*2)+'" fill="'+C.ash+'" opacity="'+(0.85-a*0.5).toFixed(2)+'"/>';
        }
        e.innerHTML=
          // 화산 가스(연기 기둥) → 화산재 구름 → 용암 흐름
          '<ellipse cx="450" cy="34" rx="120" ry="26" fill="#ADB5BD" opacity="0.8"/>'
          + ashDots
          +'<path d="M 450 84 C 470 120 520 150 560 250 L 520 250 C 495 170 462 140 446 100 Z" fill="'+C.lava+'"/>'
          +'<path d="M 450 84 C 440 130 400 170 370 250 L 402 250 C 425 175 450 140 456 104 Z" fill="'+C.lava2+'"/>'
          // 분출물 라벨 칩 (클릭)
          + chip('lava', 600, 215, '🔥 용암')
          + chip('ash', 660, 60, '🌫️ 화산재')
          + chip('gas', 240, 30, '💨 화산 가스');
      }
      // 만든 암석 카드
      var cards='', cx=720;
      if(vol.made.basalt){
        cards+='<g><rect x="'+cx+'" y="290" width="150" height="74" rx="14" fill="#fff" stroke="'+C.basalt+'" stroke-width="3"/>'
          +'<circle cx="'+(cx+38)+'" cy="322" r="22" fill="'+C.basalt+'"/>'
          +'<circle cx="'+(cx+30)+'" cy="316" r="3" fill="#6c757d"/><circle cx="'+(cx+44)+'" cy="312" r="3" fill="#6c757d"/><circle cx="'+(cx+40)+'" cy="328" r="3" fill="#6c757d"/><circle cx="'+(cx+28)+'" cy="328" r="2.5" fill="#6c757d"/>'
          +'<text x="'+(cx+98)+'" y="318" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">현무암</text>'
          +'<text x="'+(cx+98)+'" y="344" text-anchor="middle" font-size="14" font-weight="800" fill="'+C.sub+'" font-family="inherit">구멍 송송</text></g>';
      }
      if(vol.made.granite){
        cards+='<g><rect x="'+cx+'" y="374" width="150" height="74" rx="14" fill="#fff" stroke="#C9A227" stroke-width="3"/>'
          +'<circle cx="'+(cx+38)+'" cy="406" r="22" fill="'+C.granite+'"/>'
          +'<rect x="'+(cx+28)+'" y="396" width="8" height="8" fill="#B0A8B9"/><rect x="'+(cx+42)+'" y="402" width="9" height="9" fill="#D9B45B"/><rect x="'+(cx+32)+'" y="412" width="8" height="8" fill="#9aa5b1"/>'
          +'<text x="'+(cx+98)+'" y="402" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">화강암</text>'
          +'<text x="'+(cx+98)+'" y="428" text-anchor="middle" font-size="14" font-weight="800" fill="'+C.sub+'" font-family="inherit">알갱이 큼</text></g>';
      }
      if(cards){ var cg=svgEl('g',{}); cg.innerHTML=cards; g.appendChild(cg); }
      function chip(k,x,y,label){
        var on=vol.seen[k];
        return '<g class="vc-chip" data-k="'+k+'" style="cursor:pointer;">'
          +'<rect x="'+(x-8)+'" y="'+(y-22)+'" width="'+(label.length*15+34)+'" height="34" rx="12" fill="'+(on?C.good:'#fff')+'" stroke="'+(on?C.good:C.vio)+'" stroke-width="3"/>'
          +'<text x="'+(x+label.length*7.5+9)+'" y="'+(y+2)+'" text-anchor="middle" font-size="18" font-weight="800" fill="'+(on?'#fff':C.vio)+'" font-family="inherit">'+label+(on?' ✓':'')+'</text></g>';
      }
    }

    function drawQuake(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      if(qk.broken) g.setAttribute('style','animation:vcShake 0.5s ease 2;');
      var bend=qk.broken?0:qk.stress*0.18;            // 휘는 정도
      var off=qk.broken?26:0;                          // 끊어진 뒤 어긋남
      g.innerHTML=
        '<rect x="0" y="0" width="900" height="460" fill="'+C.sky+'"/>'
        // 왼쪽 판
        +'<g'+(qk.broken?' transform="translate(0,'+off+')"':'')+'>'
        +'<path d="M 0 250 L 430 '+(250-bend)+' L 450 460 L 0 460 Z" fill="'+C.rock2+'"/>'
        +'<path d="M 0 250 L 430 '+(250-bend)+' L 432 '+(264-bend)+' L 0 264 Z" fill="#5D8C3F"/>'
        +'<text x="120" y="225" font-size="40" font-family="inherit">🏠</text><text x="280" y="'+(218-bend)+'" font-size="38" font-family="inherit">🌳</text>'
        +'</g>'
        // 오른쪽 판
        +'<g><path d="M 460 '+(250-bend)+' L 900 250 L 900 460 L 470 460 Z" fill="'+C.rock+'"/>'
        +'<path d="M 460 '+(250-bend)+' L 900 250 L 900 264 L 462 '+(264-bend)+' Z" fill="#6FA34B"/>'
        +'<text x="600" y="'+(220-bend*0.5)+'" font-size="40" font-family="inherit">🏫</text><text x="780" y="222" font-size="38" font-family="inherit">🌲</text></g>'
        // 단층선
        +(qk.broken
          ? '<path d="M 445 '+(248+off)+' L 452 300 L 442 350 L 455 410 L 446 460" stroke="#3E2723" stroke-width="7" fill="none" stroke-linecap="round"/>'
            +'<text x="450" y="80" text-anchor="middle" font-size="30" font-weight="800" fill="'+C.hot+'" font-family="inherit">우지끈! 지진 발생!</text>'
            +'<text x="450" y="118" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">땅이 끊어지면서 흔들려요</text>'
          : '<line x1="445" y1="'+(250-bend)+'" x2="445" y2="460" stroke="#3E2723" stroke-width="3" stroke-dasharray="10 8" opacity="0.5"/>')
        // 힘 화살표 + 게이지
        +(qk.broken?'':'<text x="60" y="320" font-size="44" font-family="inherit">➡️</text><text x="800" y="320" font-size="44" font-family="inherit">⬅️</text>')
        +'<rect x="40" y="30" width="200" height="30" rx="12" fill="#fff" stroke="'+C.vio+'" stroke-width="3"/>'
        +'<rect x="44" y="34" width="'+(192*qk.stress/100)+'" height="22" rx="9" fill="'+C.vio+'"/>'
        +'<text x="140" y="86" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.vio+'" font-family="inherit">쌓인 힘 '+qk.stress+'%</text>';
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.vc-status'); if(!s)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, msg;
      if(pic==='volcano'){
        if(vol.erupting) msg='<span style="color:'+C.hot+';font-size:19px;">🌋 분출 중! 분출물 라벨을 눌러 보고, 식혀서 암석도 만들어 봐요</span>';
        else if(vol.press>0) msg='<span style="color:'+C.ink+';font-size:19px;">압력 '+vol.press+'% — 100%가 되면 분출해요!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">땅속 마그마 방에 🔥 압력을 키워 봐요</span>';
      } else {
        if(qk.broken) msg='<span style="color:'+C.hot+';font-size:19px;">땅이 큰 힘을 오래 받으면 끊어지면서 지진이 나요</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">➡️ 양쪽에서 미는 힘을 계속 가해 봐요 (쌓인 힘 '+qk.stress+'%)</span>';
      }
      s.innerHTML=msg;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.vc-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; build(); });
      });
      el.querySelectorAll('.vc-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='pump')pump();
          else if(a==='basalt')cool('basalt');
          else if(a==='granite')cool('granite');
          else if(a==='volReset'){ volReset(); build(); }
          else if(a==='push')push();
          else if(a==='qkReset'){ qkReset(); build(); }
        });
      });
      el.addEventListener('click',function(ev){
        var c=ev.target.closest?ev.target.closest('.vc-chip'):null;
        if(c)seeEjecta(c.dataset.k);
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    build();
    return { destroy:function(){ if(raf)cancelAnimationFrame(raf); } };
  });
})();
