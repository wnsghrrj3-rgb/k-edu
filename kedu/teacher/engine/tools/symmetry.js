/* ============================================================================
   케이랩 도구 모듈 — 대칭 (symmetry) v2
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — v1 자산(선대칭 세로/가로축·점대칭 토글, 즉각 반사) 유지.
     · 미션 — 선대칭 세로 3칸→가로 4칸→점대칭 3칸→양쪽 합치기 6칸 4단계.
     · 퀴즈 — 주어진 패턴이 선대칭/점대칭인지, 대칭 결과 모양 선택.
   - 의존: window.KLab
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('symmetry', function (el, config) {
    var ui = window.KLab.ui;
    var n = Math.max(4, Math.min(config.n || 8, 12));
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var symMode = (config.mode === 'point') ? 'point' : 'line';
    var axis = (config.axis === 'h') ? 'h' : 'v';
    var src = {};

    function mirror(c, r) {
      if (symMode === 'point') return [n-1-c, n-1-r];
      return (axis === 'v') ? [n-1-c, r] : [c, n-1-r];
    }
    function countSrc() { var n=0; for(var k in src) if(src[k]) n++; return n; }

    // ---- 미션 ----
    var MISSIONS = [
      { text: '<b style="color:#7048E8;">선대칭(세로축)</b> 모드에서 왼쪽에 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='v' && countSrc()>=3; } },
      { text: '<b style="color:#7048E8;">선대칭(가로축)</b> 모드로 바꾸고 위쪽에 <b style="color:#7048E8;">4칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='h' && countSrc()>=4; } },
      { text: '<b style="color:#7048E8;">점대칭</b> 모드로 바꾸고 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='point' && countSrc()>=3; } },
      { text: '자유탐구! <b style="color:#7048E8;">6칸 이상</b> 색칠해서 아름다운 대칭 도형을 만들어 봐요!',
        check: function() { return countSrc()>=6; } }
    ];
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 ----
    var QUIZ_POOL = [
      { q: '이 도형은 어떤 대칭인가요?', type:'classify', symMode:'line', axis:'v',
        preset:{'1,1':1,'1,2':1,'1,3':1}, answer:'선대칭', choices:['선대칭','점대칭','둘 다','대칭 아님'] },
      { q: '이 도형은 어떤 대칭인가요?', type:'classify', symMode:'point', axis:'v',
        preset:{'0,0':1,'1,1':1,'2,2':1}, answer:'점대칭', choices:['선대칭','점대칭','둘 다','대칭 아님'] },
      { q: '선대칭(세로축)에서 축의 역할은?', type:'concept', symMode:'line', axis:'v', preset:{'0,1':1,'0,2':1},
        answer:'접으면 겹침', choices:['접으면 겹침','뒤집어도 같음','가운데서 돌려도 같음','칸 수가 같음'] },
      { q: '점대칭의 중심은 어디인가요?', type:'concept', symMode:'point', axis:'v', preset:{'0,0':1,'1,0':1},
        answer:'격자 가운데', choices:['왼쪽 위','격자 가운데','오른쪽 아래','어느 칸이든'] },
      { q: '선대칭(가로축)으로 위쪽 칸을 색칠하면 반사 칸은?', type:'concept', symMode:'line', axis:'h', preset:{'2,0':1,'3,0':1},
        answer:'아래쪽', choices:['위쪽','왼쪽','아래쪽','오른쪽'] },
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = QUIZ_POOL.slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }
    function applyQuizState(q) {
      symMode = q.symMode; axis = q.axis || 'v'; src = {};
      if (q.preset) for(var k in q.preset) if(q.preset[k]) src[k]=true;
    }

    var tg = 'font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function build() {
      var top = ui.modeTabs(['free','mission','quiz'], mode);
      var bar = '', foot = '';

      var modeRow = '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + '<button class="sy-tg sy-mode" data-mode="line" style="'+tg+'">선대칭</button>'
        + '<button class="sy-tg sy-mode" data-mode="point" style="'+tg+'">점대칭</button>'
        + (symMode==='line'
          ? '<span style="width:10px;"></span><button class="sy-ax" data-axis="v" style="'+tg.replace('#7048E8','#0B7285')+'">세로축</button><button class="sy-ax" data-axis="h" style="'+tg.replace('#7048E8','#0B7285')+'">가로축</button>'
          : '')
        + '<span style="width:10px;"></span>'
        + '<button class="sy-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 지우기</button>'
        + '</div>';

      if (mode === 'mission') {
        bar = mDone ? ui.doneBar() : ui.missionBar(MISSIONS[mStep].text, mStep, MISSIONS.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        applyQuizState(q);
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v}; }));
      }

      el.innerHTML = '<style>.sy-btn:active,.sy-tg:active{transform:translateY(2px);}.sy-mode.sy-on{background:#7048E8 !important;color:#fff !important;}.sy-ax.sy-on{background:#0B7285 !important;color:#fff !important;border-color:#0B7285 !important;}.sy-cell{cursor:pointer;transition:fill .15s;}.kl-choice{min-width:120px !important;}</style>'
        + top + bar
        + (mode !== 'quiz' ? modeRow : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="sy-stage" style="width:100%;height:' + (mode==='quiz'?'38vh':'52vh') + ';min-height:300px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        + '</div>'
        + foot
        + '<div class="sy-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#5a7894;font-size:19px;"></div>';

      el.querySelectorAll('.sy-mode').forEach(function(b){ b.classList.toggle('sy-on', b.dataset.mode===symMode); });
      el.querySelectorAll('.sy-ax').forEach(function(b){ b.classList.toggle('sy-on', b.dataset.axis===axis); });

      ui.bindModeTabs(el, function(m) {
        mode = m; symMode = 'line'; axis = 'v'; src = {};
        mStep = 0; mDone = false; mLock = false;
        if (m === 'quiz') shuffleQuiz();
        build();
      });

      el.querySelectorAll('.sy-mode').forEach(function(b) {
        b.addEventListener('click', function() {
          if (symMode !== b.dataset.mode) { symMode = b.dataset.mode; src = {}; build(); }
        });
      });
      el.querySelectorAll('.sy-ax').forEach(function(b) {
        b.addEventListener('click', function() {
          axis = b.dataset.axis; src = {}; build();
          if (mode === 'mission') checkMission();
        });
      });
      var rs = el.querySelector('[data-act="reset"]');
      if (rs) rs.addEventListener('click', function() { src = {}; render(); });

      el.querySelectorAll('.kl-choice').forEach(function(b) {
        b.addEventListener('click', function() {
          if (qLock) return; qLock=true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function() {
            qIdx++; if(qIdx>=qList.length) shuffleQuiz();
            qLock=false; build();
          }, 1400);
        });
      });

      render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    function render() {
      var stage = el.querySelector('.sy-stage');
      if (!stage) return;
      stage.innerHTML = '';
      var VBW=440, VBH=440;
      var cell = Math.min(VBW,VBH)/(n+0.5), x0=(VBW-cell*n)/2, y0=(VBH-cell*n)/2;
      var svg = svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%',style:'max-height:46vh;display:block;margin:0 auto;'});
      var ref = {}; for(var k in src){ if(src[k]){ var p=k.split(','),m=mirror(+p[0],+p[1]); ref[m[0]+','+m[1]]=true; } }
      for(var r=0;r<n;r++) for(var c=0;c<n;c++){
        var key=c+','+r, isSrc=!!src[key], isRef=!!ref[key]&&!isSrc;
        var fill=isSrc?'#12B886':(isRef?'#FFB066':'#F4F9FF');
        var cellEl=svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:fill,stroke:'#B8CFE8','stroke-width':1.2,'data-c':c,'data-r':r,class:'sy-cell'});
        svg.appendChild(cellEl);
      }
      if (symMode === 'line') {
        if (axis === 'v') { var ax=x0+cell*n/2; svg.appendChild(svgEl('line',{x1:ax,y1:y0-6,x2:ax,y2:y0+cell*n+6,stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'10 7'})); }
        else { var ay=y0+cell*n/2; svg.appendChild(svgEl('line',{x1:x0-6,y1:ay,x2:x0+cell*n+6,y2:ay,stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'10 7'})); }
      } else {
        svg.appendChild(svgEl('circle',{cx:x0+cell*n/2,cy:y0+cell*n/2,r:8,fill:'#7048E8'}));
      }
      stage.appendChild(svg);

      if (mode !== 'quiz') {
        stage.querySelectorAll('.sy-cell').forEach(function(p){
          p.addEventListener('click', function() {
            var k=p.dataset.c+','+p.dataset.r; src[k]=!src[k]; render();
            if (mode === 'mission') checkMission();
          });
        });
      }

      var statusEl = el.querySelector('.sy-status');
      if (statusEl) {
        if (mode === 'quiz') {
          statusEl.textContent = '도형을 보고 아래에서 선택하세요!';
        } else {
          statusEl.textContent = (symMode==='line')
            ? '한쪽 칸을 누르면 '+(axis==='v'?'세로':'가로')+'축 반대편에 대칭으로 채워져요'
            : '칸을 누르면 가운데 점 기준 반대편에 채워져요';
        }
      }
    }

    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      if (MISSIONS[mStep].check()) {
        mLock = true;
        ui.toast(el, true);
        setTimeout(function() {
          mStep++;
          if (mStep >= MISSIONS.length) { mDone = true; build(); return; }
          // 미션 2: 가로축으로 전환, 미션 3: 점대칭으로 전환, 미션 4: 유지
          if (mStep === 1) { symMode='line'; axis='h'; src={}; }
          else if (mStep === 2) { symMode='point'; src={}; }
          else if (mStep === 3) { src={}; }
          mLock = false; build();
        }, 1500);
      }
    }

    shuffleQuiz();
    build();
    return function cleanup() {};
  });
})();
