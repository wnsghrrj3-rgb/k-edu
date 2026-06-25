/* ============================================================================
   케이랩 도구 모듈 — 대칭 (symmetry) v3
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
     · 자유탐구 — v1 자산(선대칭 세로/가로축·점대칭 토글, 즉각 반사) 유지.
     · 미션 — 선대칭 세로 3칸→가로 4칸→점대칭 3칸→양쪽 합치기 6칸 4단계.
     · 퀴즈 — 주어진 패턴이 선대칭/점대칭인지, 대칭 결과 모양 선택.
   v3: 와우 표준(F칸) — ①직접조작=칸 누르면 반대편 자동 채움(기존) ②물성=반사 채움
     ③효과음=KLab.sound(칸 tap·전환 select·접기 whoosh/success) ④마법모먼트=접어보기 도전.
     마법(예측 빗나감형) — 거의 닮은 모양을 두고 "접으면 딱 겹칠까?" 예측 → 접기 →
     짝이 없는 칸이 빨강으로 드러남("닮았다고 다 선대칭은 아니다"). 완전대칭/거의대칭을
     반반 섞어 진짜 예측이 필요하게. 저학년은 칸 채우기 닻이라 접어보기 도전 숨김(area 둘레와 동일).
   - 의존: window.KLab
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('symmetry', function (el, config) {
    var ui = window.KLab.ui;
    function snd(n) { if (window.KLab.sound && window.KLab.sound.play) window.KLab.sound.play(n); }

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes: ['free', 'mission'],         point: false, hAxis: false, quiz: false },
      mid:  { modes: ['free', 'mission', 'quiz'], point: false, hAxis: true,  quiz: true  },
      high: { modes: ['free', 'mission', 'quiz'], point: true,  hAxis: true,  quiz: true  }
    };
    var grade = (['low', 'mid', 'high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G() { return GRADES[grade]; }

    var n = Math.max(4, Math.min(config.n || 8, 12));
    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var symMode = (G().point && config.mode === 'point') ? 'point' : 'line';
    var axis = (G().hAxis && config.axis === 'h') ? 'h' : 'v';
    var src = {};

    /* ── 와우 ④마법모먼트 — 접어보기 도전 상태 ── */
    var foldOn = false;       // 접어보기 도전 진입 여부 (mid/high 자유탐구만)
    var foldCells = {};       // 도전 모양(자동 반사 없이 그대로 그림)
    var foldResult = 'ready'; // 'ready' | 'done'
    var missKeys = [];        // 접었을 때 짝이 없는 칸
    var foldFlash = false;    // 1회성 마법 배너 플래그

    var bands = ui.gradeBands({ grade: grade, locked: !!config.grade, onChange: function (g) {
      grade = g;
      if (G().modes.indexOf(mode) < 0) mode = 'free';
      symMode = 'line'; axis = 'v'; src = {};
      foldOn = false; foldResult = 'ready'; missKeys = []; foldFlash = false; foldCells = {};
      mStep = 0; mDone = false; mLock = false;
      if (mode === 'quiz') shuffleQuiz();
      build();
    } });

    function mirror(c, r) {
      if (symMode === 'point') return [n-1-c, n-1-r];
      return (axis === 'v') ? [n-1-c, r] : [c, n-1-r];
    }
    function countSrc() { var n=0; for(var k in src) if(src[k]) n++; return n; }

    /* ── 접어보기 도전: 모양 생성·접기 판정 ──
       대칭 씨앗 + (절반 확률) 짝 없는 한 칸 → 거의-대칭. 모두 자동 반사 OFF로 그대로 그림. */
    var FOLD_SEEDS = [
      [[1,1],[2,2],[1,3]],
      [[2,1],[1,2],[3,3]],
      [[1,2],[2,2],[1,4]],
      [[2,1],[2,2],[1,3],[3,4]],
      [[1,1],[1,2],[2,4]]
    ];
    var foldSym = true;
    function loadFold() {
      foldOn = true; foldResult = 'ready'; foldFlash = false; missKeys = []; foldCells = {};
      symMode = 'line'; axis = 'v';
      var seeds = FOLD_SEEDS[Math.floor(Math.random() * FOLD_SEEDS.length)];
      seeds.forEach(function (p) {
        var c = Math.min(p[0], n-1), r = Math.min(p[1], n-1);
        foldCells[c+','+r] = true;
        var m = mirror(c, r); foldCells[m[0]+','+m[1]] = true;
      });
      foldSym = Math.random() < 0.5; // true=완전 대칭(딱 겹침) / false=거의 대칭(한 칸 어긋남)
      if (!foldSym) {
        var placed = false, t = 0;
        while (t++ < 80 && !placed) {
          var c = Math.floor(Math.random()*n), r = Math.floor(Math.random()*n);
          var k = c+','+r, m = mirror(c, r), mk = m[0]+','+m[1];
          if (k === mk) continue;              // 축 위 칸(자기 자신이 짝)은 제외
          if (!foldCells[k] && !foldCells[mk]) { foldCells[k] = true; placed = true; }
        }
        if (!placed) foldSym = true;           // 빈 곳 못 찾으면 완전 대칭으로
      }
    }
    function doFold() {
      missKeys = [];
      for (var k in foldCells) {
        if (!foldCells[k]) continue;
        var p = k.split(','), m = mirror(+p[0], +p[1]), mk = m[0]+','+m[1];
        if (!foldCells[mk]) missKeys.push(k);  // 반대편에 짝이 없음
      }
      foldResult = 'done';
      foldFlash = missKeys.length > 0;         // 짝 없는 칸이 있을 때만 마법 배너
      snd(missKeys.length > 0 ? 'whoosh' : 'success');
      build();
    }
    function exitFold() {
      foldOn = false; foldResult = 'ready'; missKeys = []; foldFlash = false; foldCells = {}; src = {};
    }

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS = [
      { text: '<b style="color:#7048E8;">선대칭(세로축)</b>! 왼쪽에 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요 — 오른쪽이 똑같이 채워져요!',
        check: function() { return symMode==='line' && axis==='v' && countSrc()>=3; } },
      { text: '<b style="color:#7048E8;">5칸 이상</b> 색칠해서 양쪽이 똑같은 대칭 도형을 만들어 봐요!',
        check: function() { return countSrc()>=5; } }
    ];
    var MID_MISSIONS = [
      { text: '<b style="color:#7048E8;">선대칭(세로축)</b> 모드에서 왼쪽에 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='v' && countSrc()>=3; } },
      { text: '<b style="color:#7048E8;">선대칭(가로축)</b> 모드로 바꾸고 위쪽에 <b style="color:#7048E8;">4칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='h' && countSrc()>=4; } },
      { text: '자유탐구! <b style="color:#7048E8;">6칸 이상</b> 색칠해서 아름다운 대칭 도형을 만들어 봐요!',
        check: function() { return countSrc()>=6; } }
    ];
    var HIGH_MISSIONS = [
      { text: '<b style="color:#7048E8;">선대칭(세로축)</b> 모드에서 왼쪽에 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='v' && countSrc()>=3; } },
      { text: '<b style="color:#7048E8;">선대칭(가로축)</b> 모드로 바꾸고 위쪽에 <b style="color:#7048E8;">4칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='line' && axis==='h' && countSrc()>=4; } },
      { text: '<b style="color:#7048E8;">점대칭</b> 모드로 바꾸고 <b style="color:#7048E8;">3칸 이상</b> 색칠해 봐요!',
        check: function() { return symMode==='point' && countSrc()>=3; } },
      { text: '자유탐구! <b style="color:#7048E8;">6칸 이상</b> 색칠해서 아름다운 대칭 도형을 만들어 봐요!',
        check: function() { return countSrc()>=6; } }
    ];
    function curMissions() { return (grade==='low') ? LOW_MISSIONS : (grade==='mid') ? MID_MISSIONS : HIGH_MISSIONS; }
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 (중·고만) ----
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
    // 중학년 = 선대칭 관련만(점대칭 분류·중심 제외), 고학년 = 전체
    function quizPool() { return (grade==='mid') ? [QUIZ_POOL[0], QUIZ_POOL[2], QUIZ_POOL[4]] : QUIZ_POOL; }
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }
    function applyQuizState(q) {
      symMode = q.symMode; axis = q.axis || 'v'; src = {};
      if (q.preset) for(var k in q.preset) if(q.preset[k]) src[k]=true;
    }

    var tg = 'font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode);
      var bar = '', foot = '';

      var resetBtn = '<button class="sy-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 지우기</button>';
      // 와우 ④ 접어보기 도전 진입 버튼 — 중·고 자유탐구만(저학년은 채우기 닻이라 숨김)
      var foldBtn = (mode==='free' && G().hAxis)
        ? '<button class="sy-btn" data-act="foldenter" style="font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #E8590C;background:#FFF4E6;color:#E8590C;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🪞 접어보기 도전</button>'
        : '';

      var modeRow;
      if (foldOn) {
        modeRow = '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          + (foldResult==='ready'
              ? '<button class="sy-btn" data-act="dofold" style="font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #E8590C;background:#E8590C;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🪞 접기!</button>'
              : '<button class="sy-btn" data-act="foldnew" style="font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">🔄 새 도전</button>')
          + '<span style="width:8px;"></span>'
          + '<button class="sy-btn" data-act="foldout" style="font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↩ 나가기</button>'
          + '</div>';
      } else {
        modeRow = '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          + '<button class="sy-tg sy-mode" data-mode="line" style="'+tg+'">선대칭</button>'
          + (G().point ? '<button class="sy-tg sy-mode" data-mode="point" style="'+tg+'">점대칭</button>' : '')
          + (symMode==='line' && G().hAxis
            ? '<span style="width:10px;"></span><button class="sy-ax" data-axis="v" style="'+tg.replace('#7048E8','#0B7285')+'">세로축</button><button class="sy-ax" data-axis="h" style="'+tg.replace('#7048E8','#0B7285')+'">가로축</button>'
            : '')
          + '<span style="width:10px;"></span>'
          + resetBtn
          + (foldBtn ? '<span style="width:8px;"></span>'+foldBtn : '')
          + '</div>';
      }

      if (mode === 'mission') {
        var M = curMissions();
        bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        applyQuizState(q);
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v}; }));
      }

      el.innerHTML = '<style>.sy-btn:active,.sy-tg:active{transform:translateY(2px);}.sy-mode.sy-on{background:#7048E8 !important;color:#fff !important;}.sy-ax.sy-on{background:#0B7285 !important;color:#fff !important;border-color:#0B7285 !important;}.sy-cell{cursor:pointer;transition:fill .15s;}.sy-miss{animation:syMiss .6s ease;}@keyframes syMiss{0%,100%{opacity:1;}40%{opacity:.3;}}.sy-flash{animation:syFlash .5s ease;}@keyframes syFlash{from{transform:translateY(-6px);opacity:0;}to{transform:translateY(0);opacity:1;}}.sy-hold{animation:syHold .7s ease infinite;}@keyframes syHold{0%,100%{color:#E8590C;}50%{color:#FF8787;}}.kl-choice{min-width:120px !important;}</style>'
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
        foldOn = false; foldResult = 'ready'; missKeys = []; foldFlash = false; foldCells = {};
        mStep = 0; mDone = false; mLock = false;
        if (m === 'quiz') shuffleQuiz();
        build();
      });

      el.querySelectorAll('.sy-mode').forEach(function(b) {
        b.addEventListener('click', function() {
          if (symMode !== b.dataset.mode) { symMode = b.dataset.mode; src = {}; snd('select'); build(); }
        });
      });
      el.querySelectorAll('.sy-ax').forEach(function(b) {
        b.addEventListener('click', function() {
          axis = b.dataset.axis; src = {}; snd('select'); build();
          if (mode === 'mission') checkMission();
        });
      });
      var rs = el.querySelector('[data-act="reset"]');
      if (rs) rs.addEventListener('click', function() { src = {}; snd('tap'); render(); });

      // 와우 ④ 접어보기 도전 버튼 배선
      var fEnter = el.querySelector('[data-act="foldenter"]');
      if (fEnter) fEnter.addEventListener('click', function() { snd('pop'); loadFold(); build(); });
      var fDo = el.querySelector('[data-act="dofold"]');
      if (fDo) fDo.addEventListener('click', function() { doFold(); });
      var fNew = el.querySelector('[data-act="foldnew"]');
      if (fNew) fNew.addEventListener('click', function() { snd('pop'); loadFold(); build(); });
      var fOut = el.querySelector('[data-act="foldout"]');
      if (fOut) fOut.addEventListener('click', function() { snd('select'); exitFold(); build(); });

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
      bands.bind(el);
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    function render() {
      var stage = el.querySelector('.sy-stage');
      if (!stage) return;
      stage.innerHTML = '';
      var VBW=440, VBH=440;
      var cell = Math.min(VBW,VBH)/(n+0.5), x0=(VBW-cell*n)/2, y0=(VBH-cell*n)/2;
      var svg = svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%',style:'max-height:46vh;display:block;margin:0 auto;'});

      // ── 와우 ④ 접어보기 도전 화면 (자동 반사 없이 모양 그대로 + 접기 결과) ──
      if (foldOn) {
        var missSet = {}; for (var mi=0;mi<missKeys.length;mi++) missSet[missKeys[mi]] = true;
        for (var fr=0;fr<n;fr++) for (var fc=0;fc<n;fc++) {
          var fk = fc+','+fr, on = !!foldCells[fk];
          var ffill, isMiss = (foldResult==='done' && missSet[fk]);
          if (isMiss) ffill = '#FF5252';
          else if (on) ffill = (foldResult==='done') ? '#12B886' : '#9775FA';
          else ffill = '#F4F9FF';
          var fcell = svgEl('rect',{x:x0+fc*cell,y:y0+fr*cell,width:cell,height:cell,fill:ffill,stroke:'#B8CFE8','stroke-width':1.2});
          if (isMiss) fcell.setAttribute('class','sy-cell sy-miss');
          svg.appendChild(fcell);
        }
        var fax = x0+cell*n/2;
        svg.appendChild(svgEl('line',{x1:fax,y1:y0-6,x2:fax,y2:y0+cell*n+6,stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'10 7'}));
        stage.appendChild(svg);

        if (foldFlash) {
          var host = el.querySelector('.kl-stage-host');
          var fb = document.createElement('div');
          fb.className = 'sy-flash';
          fb.style.cssText = 'position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:5;background:#7048E8;color:#fff;font-weight:800;font-family:inherit;font-size:18px;padding:11px 18px;border-radius:16px;box-shadow:0 6px 18px rgba(112,72,232,.35);max-width:92%;text-align:center;line-height:1.35;';
          fb.innerHTML = '🔎 한 칸이 짝이 없어요! 거의 닮았지만 <b>선대칭이 아니에요</b>';
          if (host) host.appendChild(fb);
          foldFlash = false; // 1회성 — 다음 render에서 사라짐
        }

        var fStatus = el.querySelector('.sy-status');
        if (fStatus) {
          if (foldResult === 'ready') {
            fStatus.innerHTML = '접으면 양쪽이 <b>딱 겹칠까요?</b> 🤔 예상해 보고 <b style="color:#E8590C;">🪞 접기!</b>를 눌러요';
          } else if (missKeys.length > 0) {
            fStatus.innerHTML = '<span class="sy-hold">빨강 칸은 접어도 짝이 없어요</span> — 닮았다고 다 선대칭은 아니에요!';
          } else {
            fStatus.innerHTML = '✅ 딱 겹쳤어요! 이 모양은 <b style="color:#12B886;">선대칭이 맞아요</b>';
          }
        }
        return;
      }

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
            var k=p.dataset.c+','+p.dataset.r; src[k]=!src[k]; snd('tap'); render();
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
            ? (!G().hAxis
                ? '한쪽 칸을 누르면 반대편이 똑같이 채워져요 — 접으면 양쪽이 딱 맞아요!'
                : '한쪽 칸을 누르면 '+(axis==='v'?'세로':'가로')+'축 반대편에 대칭으로 채워져요')
            : '칸을 누르면 가운데 점 기준 반대편에 채워져요';
        }
      }
    }

    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var M = curMissions();
      if (M[mStep].check()) {
        mLock = true;
        ui.toast(el, true);
        setTimeout(function() {
          mStep++;
          if (mStep >= M.length) { mDone = true; build(); return; }
          // 다음 단계 진입 상태 — 학년칸별로 안전하게 전환
          if (grade === 'low') { src = {}; }                                  // 저: 선대칭 세로 유지
          else if (grade === 'mid') { if (mStep === 1) { symMode='line'; axis='h'; } src = {}; }  // 중: 가로축까지
          else { if (mStep === 1) { symMode='line'; axis='h'; src={}; } else if (mStep === 2) { symMode='point'; src={}; } else { src={}; } }
          mLock = false; build();
        }, 1500);
      }
    }

    shuffleQuiz();
    build();
    return function cleanup() {};
  });
})();
