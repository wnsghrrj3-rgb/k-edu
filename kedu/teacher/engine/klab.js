/* ============================================================================
   K-edu 케이티처 — 케이랩(KLab) 통합 조작 교구 엔진
   - 전 과목 조작 도구의 단일 진입점. 도구를 이름으로 등록하고,
     차시 데이터의 설정대로 마운트한다.
   - 엔진(teacher-engine.js)은 이 파일의 mount() 하나만 안다.
     새 도구(분수·시계·자릿값·과학·사회)는 별도 모듈 파일에서 register()로
     자기를 등록하면 된다. 엔진은 안 건드린다.
   - 차시 데이터 형식:
       { block:"klab", data:{ tool:"shape3d", config:{...} } }
   ============================================================================ */
(function () {
  if (window.KLab) return;

  var registry = {};

  function register(name, mountFn) {
    if (typeof mountFn !== 'function') return;
    registry[name] = mountFn;
  }

  // el = 마운트할 컨테이너 element, toolName = 도구 이름, config = 차시별 설정
  // 반환: 도구가 정리(cleanup) 함수를 주면 그대로 반환(슬라이드 이동 시 호출용)
  function mount(el, toolName, config) {
    if (!el) return;
    el.innerHTML = '';
    var fn = registry[toolName];
    if (!fn) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#888;">'
        + '준비 중인 교구입니다: <b>' + (toolName || '(이름 없음)') + '</b></div>';
      return;
    }
    try {
      return fn(el, config || {});
    } catch (e) {
      el.innerHTML = '<div style="padding:24px;text-align:center;color:#c0392b;">'
        + '교구를 불러오지 못했어요.</div>';
      if (window.console) console.error('[KLab] mount 실패:', toolName, e);
    }
  }

  function has(name) { return !!registry[name]; }
  function list() { return Object.keys(registry); }

  window.KLab = { register: register, mount: mount, has: has, list: list };

  /* --------------------------------------------------------------------------
     KLab.sprite — 실사 에셋 공용 로더 (실사 트랙 표준 · states/melt 패턴 승급)
     도구 외형 PNG를 미리 로드. 파일 없음/로드 실패면 get()이 null → 도구는 기존
     코드 묘사로 폴백한다(절대 안 깨짐). PNG는 "있으면 더 멋진" 외형 레이어일 뿐,
     커지고·작아지고·돌리고·누르는 조작과 물성 모션·연출은 도구 코드가 그대로 처리.
     경로 규약: /kedu/teacher/engine/tools/assets/{tool}/{name}.png
     사용:  var SPR = KLab.sprite('dissolve', ['sugar','glass_clear','crystal_out'], redraw);
            var im = SPR.get('sugar');  if (im) { <image href> } else { 기존 코드 묘사 }
     -------------------------------------------------------------------------- */
  window.KLab.sprite = function (tool, names, onReady) {
    var base = '/kedu/teacher/engine/tools/assets/' + tool + '/';
    var map = {}, pending = (names || []).length;
    function done() { pending--; if (pending <= 0 && typeof onReady === 'function') onReady(); }
    (names || []).forEach(function (n) {
      var im = new Image();
      im.onload = function () { map[n] = im; done(); };
      im.onerror = function () { done(); };   // 파일 없음 → map[n] 비움 → get() null → 폴백
      im.src = base + n + '.png';
    });
    return {
      get: function (n) { var im = map[n]; return (im && im.complete && im.naturalWidth) ? im : null; },
      ready: function () { return pending <= 0; }
    };
  };

  /* --------------------------------------------------------------------------
     KLab.ui — 전 도구 공통 모드 시스템 헬퍼 (v2 깊이 표준)
     모든 도구는 mode: "free"(자유탐구) | "mission"(단계 미션) | "quiz"(문제)
     를 지원하는 것을 표준으로 한다. 아래 헬퍼로 UI를 통일한다.
     -------------------------------------------------------------------------- */
  var PRAISE = ['🎉 정답이에요! 멋져요!', '👏 잘했어요! 한 번에 척!', '🌟 완벽해요!', '🏆 대단해요! 바로 그거예요!', '💙 정확해요! 척척박사네요!'];
  var RETRY  = ['🤔 음… 다시 한번 생각해 봐요!', '💪 괜찮아요, 한 번 더!', '🔍 아깝다! 다시 살펴볼까요?'];

  window.KLab.ui = {
    /* ── 케이랩 2.0 공통 스타일 (2026-07-11 UI 헌법 v3) ──
       원칙: ①액센트는 과목당 1색(--kl-accent) ②크롬(탭·배너·독)은 중립 회색
             ③테두리 1.5px, 굵기 700 이하 ④조작 버튼은 하단 독 한 곳
       과목 액센트는 허브(klab.html)가 mount 시 --kl-accent로 주입한다. */
    ensureCss: function () {
      if (document.getElementById('klabUiV3')) return;
      var st = document.createElement('style'); st.id = 'klabUiV3';
      st.textContent =
        ':root{--kl-accent:#3D74D9;--kl-ink:#2A3442;--kl-mut:#7B8794;--kl-line:#E3E8EF;--kl-soft:#F1F4F8;}'
        + '.kl-grades{display:flex;gap:6px;justify-content:flex-end;margin:0 0 8px;flex-wrap:wrap;}'
        + '.kl-grade{font-size:13.5px;font-weight:700;font-family:inherit;line-height:1;padding:8px 12px;border-radius:999px;border:1.5px solid var(--kl-line);background:#fff;color:var(--kl-mut);cursor:pointer;transition:.15s;}'
        + '.kl-grade.on{border-color:var(--kl-accent);color:var(--kl-accent);background:#fff;box-shadow:inset 0 0 0 1px var(--kl-accent);}'
        + '.kl-modes{display:flex;justify-content:center;margin:0 0 12px;}'
        + '.kl-seg{display:inline-flex;background:#EAEFF5;border-radius:12px;padding:4px;gap:4px;flex-wrap:wrap;justify-content:center;}'
        + '.kl-mode{font-size:16px;font-weight:700;font-family:inherit;line-height:1;padding:10px 18px;border-radius:9px;border:0;background:transparent;color:var(--kl-mut);cursor:pointer;transition:.15s;}'
        + '.kl-mode.on{background:#fff;color:var(--kl-accent);box-shadow:0 1px 4px rgba(20,30,50,.12);}'
        + '.kl-bar{display:flex;align-items:center;gap:10px;justify-content:flex-start;flex-wrap:wrap;background:#fff;border:1.5px solid var(--kl-line);border-left:4px solid var(--kl-accent);border-radius:0 12px 12px 0;padding:11px 15px;margin-bottom:12px;}'
        + '.kl-chip{font-size:13px;font-weight:700;color:var(--kl-accent);background:var(--kl-soft);border-radius:7px;padding:5px 10px;white-space:nowrap;}'
        + '.kl-bar-text{font-size:18px;font-weight:700;color:var(--kl-ink);line-height:1.35;}'
        + '.kl-done{text-align:center;background:#EDFBF4;border:1.5px solid #9FE1CB;border-radius:12px;padding:14px;margin-bottom:12px;font-size:20px;font-weight:700;color:#0B7A5C;}'
        + '.kl-choices{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:12px;}'
        + '.kl-choice{font-size:24px;min-width:76px;padding:12px 20px;border-radius:13px;border:1.5px solid #D7DEE8;background:#fff;color:var(--kl-ink);font-weight:700;font-family:inherit;line-height:1.3;cursor:pointer;transition:transform .08s,border-color .15s,color .15s;}'
        + '.kl-choice:hover{border-color:var(--kl-accent);color:var(--kl-accent);}'
        + '.kl-choice:active{transform:scale(.96);}'
        + '.kl-dock{display:flex;gap:8px;justify-content:center;align-items:center;background:#fff;border:1.5px solid var(--kl-line);border-radius:14px;padding:8px;width:max-content;max-width:100%;flex-wrap:wrap;margin:14px auto 0;box-shadow:0 3px 12px rgba(20,30,50,.07);}'
        + '.kl-dock button{font-size:19px;font-weight:700;font-family:inherit;line-height:1;padding:12px 19px;border-radius:10px;border:1.5px solid transparent;background:var(--kl-soft);color:var(--kl-ink);cursor:pointer;transition:transform .08s;}'
        + '.kl-dock button:active{transform:scale(.95);}'
        + '.kl-dock button.pri{background:var(--kl-accent);color:#fff;}'
        + '.kl-dock button.ghost{background:transparent;color:var(--kl-mut);}';
      document.head.appendChild(st);
    },
    /* 하단 조작 독 — 도구별 조작 버튼을 담는 유일한 자리.
       items=[{act,label,kind:'pri'|'ghost'|undefined,cls:'추가클래스'}]
       버튼에는 data-act가 그대로 붙으므로 기존 바인딩 유지. 최대 3~4개 권장, pri는 1개만. */
    dock: function (items) {
      this.ensureCss();
      return '<div class="kl-dock">'
        + items.map(function (it) {
            return '<button class="' + (it.cls ? it.cls + ' ' : '') + (it.kind || '') + '" data-act="' + it.act + '">' + it.label + '</button>';
          }).join('')
        + '</div>';
    },
    // 모드 탭 HTML. modes=['free','mission','quiz',...] 중 도구가 지원하는 것만, cur=현재 모드
    // extraLabels(선택): { 커스텀모드키: '라벨' } — 도구별 확장 모드 탭(예: '🌀 만약에')
    modeTabs: function (modes, cur, extraLabels) {
      this.ensureCss();
      var L = { free: '자유탐구', mission: '미션', quiz: '퀴즈' };
      if (extraLabels) for (var k in extraLabels) L[k] = extraLabels[k];
      return '<div class="kl-modes"><div class="kl-seg">'
        + modes.map(function (m) {
            var on = (m === cur);
            return '<button class="kl-mode' + (on ? ' on' : '') + '" data-mode="' + m + '">' + (L[m] || m) + '</button>';
          }).join('')
        + '</div></div>';
    },
    // 모드 탭 클릭 바인딩. onChange(mode) 호출
    bindModeTabs: function (el, onChange) {
      el.querySelectorAll('.kl-mode').forEach(function (b) {
        b.addEventListener('click', function () { onChange(b.dataset.mode); });
      });
    },
    // 미션 배너 HTML. step은 0부터, total은 전체 미션 수
    missionBar: function (text, step, total) {
      this.ensureCss();
      return '<div class="kl-mission kl-bar">'
        + '<span class="kl-chip">미션 ' + (step + 1) + '/' + total + '</span>'
        + '<span class="kl-mission-text kl-bar-text">' + text + '</span></div>';
    },
    // 퀴즈 질문 배너 HTML
    quizBar: function (text, score, count) {
      this.ensureCss();
      return '<div class="kl-quiz kl-bar">'
        + '<span class="kl-chip">⭐ ' + score + ' / ' + count + '</span>'
        + '<span class="kl-quiz-text kl-bar-text">' + text + '</span></div>';
    },
    // 선택지 버튼 묶음 HTML. choices=[{v:값,label:표시}] / 클릭은 .kl-choice[data-v]로 바인딩
    choices: function (choices) {
      this.ensureCss();
      return '<div class="kl-choices">'
        + choices.map(function (c) { return '<button class="kl-choice" data-v="' + c.v + '">' + (c.label != null ? c.label : c.v) + '</button>'; }).join('')
        + '</div>';
    },
    praise: function () { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; },
    retry: function () { return RETRY[Math.floor(Math.random() * RETRY.length)]; },
    // 피드백 토스트 — el 안에 잠깐 떴다 사라짐. ok=true 정답, false 오답
    toast: function (el, ok, msg, snd) {
      // 와우 ③ 효과음 — snd 지정 시 그 음, false면 무음(도구가 직접 재생), 기본은 ok 기반
      if (window.KLab.sound && snd !== false) window.KLab.sound.play(snd || (ok ? 'success' : 'fail'));
      var old = el.querySelector('.kl-toast'); if (old) old.remove();
      var d = document.createElement('div');
      d.className = 'kl-toast';
      d.style.cssText = 'position:absolute;left:50%;top:18px;transform:translateX(-50%);z-index:30;'
        + 'font-size:21px;font-weight:700;font-family:inherit;padding:12px 22px;border-radius:12px;color:#fff;'
        + 'box-shadow:0 6px 18px rgba(0,0,0,.18);pointer-events:none;white-space:nowrap;'
        + 'background:' + (ok ? '#12B886' : '#FF8A3D') + ';animation:klToast 1.6s ease forwards;';
      d.textContent = msg || (ok ? this.praise() : this.retry());
      if (!document.getElementById('klToastCss')) {
        var st = document.createElement('style'); st.id = 'klToastCss';
        st.textContent = '@keyframes klToast{0%{opacity:0;transform:translateX(-50%) translateY(-8px) scale(.9);}12%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.04);}20%{transform:translateX(-50%) scale(1);}80%{opacity:1;}100%{opacity:0;transform:translateX(-50%) translateY(-6px);}}';
        document.head.appendChild(st);
      }
      var host = el.querySelector('.kl-stage-host') || el;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(d);
      setTimeout(function () { d.remove(); }, 1700);
    },
    /* ── 3층 깊이 공용 엔진 (골든 샘플 constellation v3 패턴 승급) ── */
    // 생각형 미션 선택지 — m={type:'think',ch:[..3],a,why}. 정답 시 이유 배너 → 2.4초 후 onPass()
    // sel = { foot:'.xx-foot', bar:'.xx-bars' }
    thinkFoot: function (el, sel, m, onPass) {
      var ui = window.KLab.ui;
      var fc = el.querySelector(sel.foot); if (!fc) return;
      if (!m || m.type !== 'think') { fc.innerHTML = ''; return; }
      var idx = [0, 1, 2].sort(function () { return Math.random() - 0.5; });
      fc.innerHTML = ui.choices(idx.map(function (i) { return { v: i, label: '<span style="font-size:19px;">' + m.ch[i] + '</span>' }; }));
      var lock = false;
      fc.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (lock) return;
          if (+b.dataset.v !== m.a) { ui.toast(el, false); return; }
          lock = true;
          var host = el.querySelector(sel.bar);
          if (host) host.innerHTML = '<div style="text-align:center;background:#E6FCF5;border:1.5px solid #12B886;border-radius:12px;padding:13px 16px;margin-bottom:12px;">'
            + '<span style="font-size:21px;font-weight:700;color:#0B7A5C;">✅ 정답! ' + m.why + '</span></div>';
          fc.innerHTML = '';
          setTimeout(onPass, 2400);
        });
      });
    },
    // 🌀 만약에 엔진 — 예측→실험→정리.
    // spec = { scenarios:{key:{icon,title,q,ch[3],a,reveal,tip}}, rebuild(), footEl(),
    //          onSelect(key)?, onPlay(key)?, onExit()? }
    whatifEngine: function (spec) {
      var ui = window.KLab.ui;
      var st = { key: null, phase: 'pick', choice: null };
      function active() { return !!st.key && (st.phase === 'play' || st.phase === 'reveal'); }
      function reset() { st.key = null; st.phase = 'pick'; st.choice = null; if (spec.onExit) spec.onExit(); }
      function barHTML() {
        var card = 'font-size:19px;padding:14px 18px;border-radius:12px;border:1.5px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:700;font-family:inherit;line-height:1.3;';
        if (st.phase === 'pick') {
          return '<div style="text-align:center;background:#E3FAFC;border:1.5px solid #0B7285;border-radius:12px;padding:12px 16px;margin-bottom:10px;">'
            + '<div style="font-size:22px;font-weight:700;color:#0B7285;">🌀 만약에… 상상해 보고, 직접 확인해요!</div></div>'
            + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
            + Object.keys(spec.scenarios).map(function (k) { var w = spec.scenarios[k];
                return '<button class="kl-wifcard" data-k="' + k + '" style="' + card + '">' + w.icon + ' ' + w.title + '</button>'; }).join('')
            + '</div>';
        }
        var w = spec.scenarios[st.key];
        if (st.phase === 'predict') {
          return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#F3F0FF;border:1.5px solid #7048E8;border-radius:12px;padding:12px 18px;margin-bottom:12px;">'
            + '<span style="font-size:17px;font-weight:700;color:#fff;background:#7048E8;border-radius:10px;padding:6px 12px;white-space:nowrap;">🔮 예측</span>'
            + '<span style="font-size:22px;font-weight:700;color:#4527A0;">' + w.icon + ' ' + w.q + '</span></div>';
        }
        if (st.phase === 'play') {
          return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#E3FAFC;border:1.5px solid #0B7285;border-radius:12px;padding:11px 16px;margin-bottom:10px;">'
            + '<span style="font-size:17px;font-weight:700;color:#fff;background:#0B7285;border-radius:10px;padding:6px 12px;white-space:nowrap;">🧪 실험 중</span>'
            + '<span style="font-size:20px;font-weight:700;color:#0B7285;">' + w.icon + ' ' + w.tip + '</span>'
            + '<button class="kl-wifreveal" style="font-size:18px;padding:9px 16px;border-radius:12px;border:1.5px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:700;font-family:inherit;">💡 정리 보기</button>'
            + '<button class="kl-wifback" style="font-size:16px;padding:8px 12px;border-radius:12px;border:1.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:700;font-family:inherit;">← 다른 만약에</button></div>';
        }
        var mine = w.ch[st.choice != null ? st.choice : 0], hit = (st.choice === w.a);
        return '<div style="background:#E6FCF5;border:1.5px solid #12B886;border-radius:12px;padding:14px 18px;margin-bottom:10px;text-align:center;">'
          + '<div style="font-size:21px;font-weight:700;color:#0B7A5C;">💡 ' + w.reveal + '</div>'
          + '<div style="font-size:17px;font-weight:700;color:' + (hit ? '#0B7A5C' : '#E8590C') + ';margin-top:8px;">네 예측: “' + mine + '” → '
          + (hit ? '정확했어요! 🎯' : '실제는 달랐죠? 예측이 빗나갈 때 더 크게 배워요! 💪') + '</div>'
          + '<div style="margin-top:10px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="kl-wifplay" style="font-size:17px;padding:9px 15px;border-radius:12px;border:1.5px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:700;font-family:inherit;">🔁 더 가지고 놀기</button>'
          + '<button class="kl-wifback" style="font-size:17px;padding:9px 15px;border-radius:12px;border:1.5px solid #0B7285;background:#0B7285;color:#fff;cursor:pointer;font-weight:700;font-family:inherit;">🌀 다른 만약에</button></div></div>';
      }
      function bind(el) {
        el.querySelectorAll('.kl-wifcard').forEach(function (b) {
          b.addEventListener('click', function () {
            st.key = b.dataset.k; st.phase = 'predict'; st.choice = null;
            if (spec.onSelect) spec.onSelect(st.key);
            spec.rebuild();
          });
        });
        var rv = el.querySelector('.kl-wifreveal'); if (rv) rv.addEventListener('click', function () { st.phase = 'reveal'; spec.rebuild(); });
        el.querySelectorAll('.kl-wifback').forEach(function (b) { b.addEventListener('click', function () { reset(); spec.rebuild(); }); });
        var pl = el.querySelector('.kl-wifplay'); if (pl) pl.addEventListener('click', function () { st.phase = 'play'; if (spec.onPlay) spec.onPlay(st.key); spec.rebuild(); });
        if (st.phase === 'predict') {
          var w = spec.scenarios[st.key], fc = spec.footEl();
          if (!fc) return;
          var idx = [0, 1, 2].sort(function () { return Math.random() - 0.5; });
          fc.innerHTML = ui.choices(idx.map(function (i) { return { v: i, label: '<span style="font-size:19px;">' + w.ch[i] + '</span>' }; }));
          fc.querySelectorAll('.kl-choice').forEach(function (b) {
            b.addEventListener('click', function () {
              st.choice = +b.dataset.v;
              ui.toast(el, true, '🔮 예측 완료! 이제 직접 확인해 봐요');
              setTimeout(function () { st.phase = 'play'; if (spec.onPlay) spec.onPlay(st.key); spec.rebuild(); }, 1200);
            });
          });
        }
      }
      return { state: st, active: active, reset: reset, barHTML: barHTML, bind: bind };
    },
    // 미션 전체 완료 배너
    doneBar: function () {
      this.ensureCss();
      return '<div class="kl-done">🏆 모든 미션 완료! 정말 멋져요!</div>';
    },
    /* ── 학년 칸 게이트 (헌법 3장 — 저/중/고 데이터 스왑 + 셀렉터) ──
       한 도구가 저(1~2)/중(3~4)/고(5~6) 세 칸을 가진다. 모드와 직교(한 겹 위 게이트).
       - config.grade가 박혀 오면 셀렉터 숨김(완성품 철학), 없으면 🌱🌿🌳 노출.
       spec = { grade:'low'|'mid'|'high'|null, locked:bool, onChange(g) }
       반환 = { current(), selectorHTML(), bind(el) } */
    gradeBands: function (spec) {
      var ORDER = ['low', 'mid', 'high'];
      var L = { low: '🌱 1~2학년', mid: '🌿 3~4학년', high: '🌳 5~6학년' };
      var cur = (ORDER.indexOf(spec.grade) >= 0) ? spec.grade : 'high';
      var locked = !!spec.locked;
      function selectorHTML() {
        if (locked) return '';
        window.KLab.ui.ensureCss();
        return '<div class="kl-grades">'
          + ORDER.map(function (g) {
              var on = (g === cur);
              return '<button class="kl-grade' + (on ? ' on' : '') + '" data-grade="' + g + '">' + L[g] + '</button>';
            }).join('')
          + '</div>';
      }
      function bind(el) {
        el.querySelectorAll('.kl-grade').forEach(function (b) {
          b.addEventListener('click', function () {
            var g = b.dataset.grade;
            if (g === cur) return;
            cur = g;
            if (spec.onChange) spec.onChange(g);
          });
        });
      }
      return { current: function () { return cur; }, selectorHTML: selectorHTML, bind: bind };
    }
  };

  // 옛 이름 호환 (혹시 남은 참조 대비) — 같은 객체를 가리킴
  window.MathTools = window.KLab;
})();

/* ============================================================================
   KLab.sound — 와우 표준 ③ 효과음 공통 레이어 (2026-06-16 신설)
   - Web Audio로 짧은 효과음을 즉석 합성. 음원 파일 없음(엔진 가벼움 유지).
   - 전 도구가 ui.toast로 달성음(success)·안내음(fail)을 자동으로 얻는다.
   - 도구별로 KLab.sound.play(name) 직접 호출 가능 (예: 화산 charge/erupt).
   - 교실용: 우상단 🔊/🔇 토글이 첫 소리 때 1회 떠오름. 상태는 localStorage 기억.
   - 소리는 사용자의 첫 조작(클릭/탭) 이후에만 울림(브라우저 자동재생 정책 준수).
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var ctx = null, master = null, muted = false;
  try { muted = (localStorage.getItem('klab_muted') === '1'); } catch (e) {}

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  // 단음. freq=주파수, dur=초, type=파형, peak=최대게인, delay=시작딜레이, freqEnd=글라이드 끝주파수
  function tone(freq, dur, type, peak, delay, freqEnd) {
    var c = ensureCtx(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    var p = (peak == null ? 0.3 : peak);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(p, t0 + Math.min(0.012, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  // 감쇠 노이즈 버스트 (분출/럼블용). lowpass=저역통과 컷오프(Hz)
  function noise(dur, peak, lowpass) {
    var c = ensureCtx(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(); src.buffer = buf;
    var g = c.createGain(); g.gain.value = peak || 0.4;
    if (lowpass) { var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lowpass; src.connect(lp); lp.connect(g); }
    else src.connect(g);
    g.connect(master);
    src.start(c.currentTime);
  }

  var PRESETS = {
    tap:     function () { tone(660, 0.06, 'triangle', 0.28); },
    pop:     function () { tone(420, 0.11, 'sine', 0.34, 0, 780); },
    select:  function () { tone(540, 0.07, 'square', 0.16); },
    success: function () { tone(660, 0.10, 'sine', 0.30, 0); tone(880, 0.12, 'sine', 0.28, 0.10); tone(1175, 0.18, 'sine', 0.26, 0.20); },
    fail:    function () { tone(330, 0.18, 'sine', 0.20, 0, 250); },
    charge:  function () { tone(170, 0.40, 'sawtooth', 0.16, 0, 520); },
    erupt:   function () { noise(0.9, 0.5, 900); tone(85, 0.7, 'sawtooth', 0.30, 0, 55); tone(140, 0.5, 'square', 0.16, 0.04); },
    rumble:  function () { noise(0.6, 0.32, 380); tone(70, 0.6, 'sine', 0.22); },
    whoosh:  function () { noise(0.32, 0.28, 1800); }
  };

  function play(name) {
    if (muted) { ensureToggle(); return; }
    var fn = PRESETS[name]; if (!fn) return;
    var c = ensureCtx(); if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
    try { fn(); } catch (e) {}
    ensureToggle();
  }

  function ensureToggle() {
    if (document.getElementById('klab-mute')) { paintToggle(); return; }
    if (!document.body) return;
    var b = document.createElement('button');
    b.id = 'klab-mute';
    b.setAttribute('aria-label', '소리 켜기 또는 끄기');
    b.style.cssText = 'position:fixed;top:12px;right:14px;z-index:9999;width:42px;height:42px;border-radius:50%;'
      + 'border:2px solid #E2E8F0;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.12);cursor:pointer;'
      + 'font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;font-family:inherit;';
    b.onclick = function () { setMuted(!muted); };
    document.body.appendChild(b);
    paintToggle();
  }
  function paintToggle() {
    var b = document.getElementById('klab-mute'); if (!b) return;
    b.textContent = muted ? '🔇' : '🔊';
    b.style.opacity = muted ? '0.55' : '1';
  }
  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem('klab_muted', muted ? '1' : '0'); } catch (e) {}
    paintToggle();
  }

  window.KLab.sound = { play: play, setMuted: setMuted, isMuted: function () { return muted; }, ensureToggle: ensureToggle };
})();
