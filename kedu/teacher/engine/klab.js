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
     KLab.ui — 전 도구 공통 모드 시스템 헬퍼 (v2 깊이 표준)
     모든 도구는 mode: "free"(자유탐구) | "mission"(단계 미션) | "quiz"(문제)
     를 지원하는 것을 표준으로 한다. 아래 헬퍼로 UI를 통일한다.
     -------------------------------------------------------------------------- */
  var PRAISE = ['🎉 정답이에요! 멋져요!', '👏 잘했어요! 한 번에 척!', '🌟 완벽해요!', '🏆 대단해요! 바로 그거예요!', '💙 정확해요! 척척박사네요!'];
  var RETRY  = ['🤔 음… 다시 한번 생각해 봐요!', '💪 괜찮아요, 한 번 더!', '🔍 아깝다! 다시 살펴볼까요?'];

  window.KLab.ui = {
    // 모드 탭 HTML. modes=['free','mission','quiz',...] 중 도구가 지원하는 것만, cur=현재 모드
    // extraLabels(선택): { 커스텀모드키: '라벨' } — 도구별 확장 모드 탭(예: '🌀 만약에')
    modeTabs: function (modes, cur, extraLabels) {
      var L = { free: '🧭 자유탐구', mission: '🎯 미션', quiz: '❓ 퀴즈' };
      if (extraLabels) for (var k in extraLabels) L[k] = extraLabels[k];
      var base = 'font-size:21px;padding:11px 20px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
      return '<div class="kl-modes" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + modes.map(function (m) {
            var on = (m === cur);
            return '<button class="kl-mode" data-mode="' + m + '" style="' + base
              + 'background:' + (on ? '#7048E8' : '#fff') + ';color:' + (on ? '#fff' : '#7048E8') + ';">' + (L[m] || m) + '</button>';
          }).join('')
        + '</div>';
    },
    // 모드 탭 클릭 바인딩. onChange(mode) 호출
    bindModeTabs: function (el, onChange) {
      el.querySelectorAll('.kl-mode').forEach(function (b) {
        b.addEventListener('click', function () { onChange(b.dataset.mode); });
      });
    },
    // 미션 배너 HTML. step은 0부터, total은 전체 미션 수
    missionBar: function (text, step, total) {
      return '<div class="kl-mission" style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;'
        + 'background:#F3F0FF;border:3px solid #7048E8;border-radius:18px;padding:12px 18px;margin-bottom:12px;">'
        + '<span style="font-size:17px;font-weight:800;color:#fff;background:#7048E8;border-radius:10px;padding:6px 12px;white-space:nowrap;">미션 ' + (step + 1) + '/' + total + '</span>'
        + '<span class="kl-mission-text" style="font-size:22px;font-weight:800;color:#4527A0;">' + text + '</span></div>';
    },
    // 퀴즈 질문 배너 HTML
    quizBar: function (text, score, count) {
      return '<div class="kl-quiz" style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;'
        + 'background:#FFF4E6;border:3px solid #F59F00;border-radius:18px;padding:12px 18px;margin-bottom:12px;">'
        + '<span style="font-size:17px;font-weight:800;color:#fff;background:#F59F00;border-radius:10px;padding:6px 12px;white-space:nowrap;">⭐ ' + score + ' / ' + count + '</span>'
        + '<span class="kl-quiz-text" style="font-size:22px;font-weight:800;color:#9A6700;">' + text + '</span></div>';
    },
    // 선택지 버튼 묶음 HTML. choices=[{v:값,label:표시}] / 클릭은 .kl-choice[data-v]로 바인딩
    choices: function (choices) {
      var s = 'font-size:28px;min-width:84px;padding:14px 24px;border-radius:16px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
      return '<div class="kl-choices" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:12px;">'
        + choices.map(function (c) { return '<button class="kl-choice" data-v="' + c.v + '" style="' + s + '">' + (c.label != null ? c.label : c.v) + '</button>'; }).join('')
        + '</div>';
    },
    praise: function () { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; },
    retry: function () { return RETRY[Math.floor(Math.random() * RETRY.length)]; },
    // 피드백 토스트 — el 안에 잠깐 떴다 사라짐. ok=true 정답, false 오답
    toast: function (el, ok, msg) {
      var old = el.querySelector('.kl-toast'); if (old) old.remove();
      var d = document.createElement('div');
      d.className = 'kl-toast';
      d.style.cssText = 'position:absolute;left:50%;top:18px;transform:translateX(-50%);z-index:30;'
        + 'font-size:26px;font-weight:800;font-family:inherit;padding:14px 26px;border-radius:18px;color:#fff;'
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
          if (host) host.innerHTML = '<div style="text-align:center;background:#E6FCF5;border:3px solid #12B886;border-radius:18px;padding:13px 16px;margin-bottom:12px;">'
            + '<span style="font-size:21px;font-weight:800;color:#0B7A5C;">✅ 정답! ' + m.why + '</span></div>';
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
        var card = 'font-size:19px;padding:14px 18px;border-radius:16px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1.3;';
        if (st.phase === 'pick') {
          return '<div style="text-align:center;background:#E3FAFC;border:3px solid #0B7285;border-radius:18px;padding:12px 16px;margin-bottom:10px;">'
            + '<div style="font-size:22px;font-weight:800;color:#0B7285;">🌀 만약에… 상상해 보고, 직접 확인해요!</div></div>'
            + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
            + Object.keys(spec.scenarios).map(function (k) { var w = spec.scenarios[k];
                return '<button class="kl-wifcard" data-k="' + k + '" style="' + card + '">' + w.icon + ' ' + w.title + '</button>'; }).join('')
            + '</div>';
        }
        var w = spec.scenarios[st.key];
        if (st.phase === 'predict') {
          return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#F3F0FF;border:3px solid #7048E8;border-radius:18px;padding:12px 18px;margin-bottom:12px;">'
            + '<span style="font-size:17px;font-weight:800;color:#fff;background:#7048E8;border-radius:10px;padding:6px 12px;white-space:nowrap;">🔮 예측</span>'
            + '<span style="font-size:22px;font-weight:800;color:#4527A0;">' + w.icon + ' ' + w.q + '</span></div>';
        }
        if (st.phase === 'play') {
          return '<div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;background:#E3FAFC;border:3px solid #0B7285;border-radius:18px;padding:11px 16px;margin-bottom:10px;">'
            + '<span style="font-size:17px;font-weight:800;color:#fff;background:#0B7285;border-radius:10px;padding:6px 12px;white-space:nowrap;">🧪 실험 중</span>'
            + '<span style="font-size:20px;font-weight:800;color:#0B7285;">' + w.icon + ' ' + w.tip + '</span>'
            + '<button class="kl-wifreveal" style="font-size:18px;padding:9px 16px;border-radius:12px;border:3px solid #7048E8;background:#7048E8;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;">💡 정리 보기</button>'
            + '<button class="kl-wifback" style="font-size:16px;padding:8px 12px;border-radius:12px;border:2.5px solid #C9D7E6;background:#fff;color:#5a7894;cursor:pointer;font-weight:800;font-family:inherit;">← 다른 만약에</button></div>';
        }
        var mine = w.ch[st.choice != null ? st.choice : 0], hit = (st.choice === w.a);
        return '<div style="background:#E6FCF5;border:3px solid #12B886;border-radius:18px;padding:14px 18px;margin-bottom:10px;text-align:center;">'
          + '<div style="font-size:21px;font-weight:800;color:#0B7A5C;">💡 ' + w.reveal + '</div>'
          + '<div style="font-size:17px;font-weight:800;color:' + (hit ? '#0B7A5C' : '#E8590C') + ';margin-top:8px;">네 예측: “' + mine + '” → '
          + (hit ? '정확했어요! 🎯' : '실제는 달랐죠? 예측이 빗나갈 때 더 크게 배워요! 💪') + '</div>'
          + '<div style="margin-top:10px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
          + '<button class="kl-wifplay" style="font-size:17px;padding:9px 15px;border-radius:12px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;">🔁 더 가지고 놀기</button>'
          + '<button class="kl-wifback" style="font-size:17px;padding:9px 15px;border-radius:12px;border:3px solid #0B7285;background:#0B7285;color:#fff;cursor:pointer;font-weight:800;font-family:inherit;">🌀 다른 만약에</button></div></div>';
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
      return '<div style="text-align:center;background:#E6FCF5;border:3px solid #12B886;border-radius:18px;padding:16px;margin-bottom:12px;">'
        + '<span style="font-size:26px;font-weight:800;color:#0B7A5C;">🏆 모든 미션 완료! 정말 멋져요!</span></div>';
    }
  };

  // 옛 이름 호환 (혹시 남은 참조 대비) — 같은 객체를 가리킴
  window.MathTools = window.KLab;
})();
