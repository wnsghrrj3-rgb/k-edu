/* ============================================================================
   K-edu 케이티처 엔진 (teacher-engine.js)
   ----------------------------------------------------------------------------
   - 모든 학년·과목 공용 IIFE
   - 외부에서 Teacher.init({ subject, curriculum, lessons }) 호출
   - 시범 test_g1_math_u1_l08/slideshow.html (2696줄) 분해 — 데이터 의존 제거,
     STORAGE_KEY 동적화, DOM 이벤트 부착을 init 시점으로 이관
   ============================================================================ */

(function () {
  'use strict';

  // =================== 모듈 상태 ===================
  let _subject = null;        // { slug, label }
  let _curriculum = [];       // [{ unit, title, lesson_count, lessons:[{n,title,std,concept,ready}] }]
  let _lessons = {};          // { "u1_l08": { meta, slides:[...], extras:[...] }, ... }
  let _currentLessonKey = null;   // 진입한 차시 키
  let _slides = [];           // 현재 차시 슬라이드 (사용자 조립 상태 포함)
  let _extrasData = [];       // 현재 차시 보조자료
  let _curIdx = 0;
  let _extrasFilter = 'all';
  let _interactiveState = {};
  let _inited = false;
  let _saveStatusTimer = null;

  const STORAGE_VERSION = 1;
  const TYPE_LABELS = {
    video: '영상', fun_question: '발문', game: '게임', real_world: '실생활',
    extension: '확장', book: '책', tip: '학습팁', misconception: '오개념', other_activity: '다른활동'
  };
  const EXTRA_TYPE_AUDIENCE = {
    video: 'student', fun_question: 'student', game: 'student', real_world: 'student',
    extension: 'student', book: 'student', other_activity: 'student',
    tip: 'teacher', misconception: 'teacher'
  };
  const EXTRA_TYPE_FULL_LABEL = {
    video: '영상', fun_question: '재미있는 발문', game: '활동·게임', real_world: '실생활',
    extension: '심화 자료', book: '책 추천', tip: '학습 가이드', misconception: '오개념 주의',
    other_activity: '다른 활동'
  };
  const BLOCK_TEMPLATES = {
    motivate: { stage: '도입', block: 'motivate', data: { scene_title: '새 도입 상황', kids: [{ face: '🙂', label: '(편집)' }], question: '(질문 편집)' } },
    concept: { stage: '전개', block: 'concept', data: { title: '새 개념', content: '(개념 설명 편집)' } },
    question: { stage: '전개', block: 'question', data: { title: '새 발문', content: '(발문 편집)' } },
    basic_problem: { stage: '기본문제', block: 'basic_problem', data: { title: '새 기본 문제', question: '(문제 편집)' } },
    advanced_problem: { stage: '응용문제', block: 'advanced_problem', data: { title: '새 응용 문제', challenge: '(문제 편집)' } },
    game: { stage: '응용문제', block: 'game', data: { title: '새 활동', steps: ['단계 1', '단계 2', '단계 3'] } },
    summary: { stage: '정리', block: 'summary', data: { title: '요약', points: ['점 1', '점 2'] } },
    next_lesson: { stage: '정리', block: 'next_lesson', data: { title: '다음 시간에는', preview: '(편집)', emoji: '' } }
  };

  // =================== 차시 키 ===================
  function pad2(n) {
    const s = String(n);
    return s.length < 2 ? '0' + s : s;
  }
  function lessonKey(unit, lesson) {
    // 단일 숫자: u1_l08
    // 묶음 문자열("2~3"·"4~5"): u1_l02_03 (양쪽 zero-pad + "_" 연결)
    if (typeof lesson === 'number') {
      return 'u' + unit + '_l' + pad2(lesson);
    }
    const s = String(lesson);
    if (s.indexOf('~') !== -1) {
      const parts = s.split('~').map(p => pad2(parseInt(p, 10)));
      return 'u' + unit + '_l' + parts.join('_');
    }
    return 'u' + unit + '_l' + pad2(parseInt(s, 10));
  }
  function storageKey() {
    if (!_subject || !_currentLessonKey) return null;
    return 'kedu_teacher_state_' + _subject.slug + '_' + _currentLessonKey;
  }

  // =================== 자동 저장 ===================
  function saveState() {
    const key = storageKey();
    if (!key) return;
    try {
      const data = {
        v: STORAGE_VERSION,
        ts: Date.now(),
        slides: _slides,
        curIdx: _curIdx,
        interactiveState: _interactiveState
      };
      localStorage.setItem(key, JSON.stringify(data));
      showSaveStatus(data.ts);
    } catch (e) {
      console.warn('상태 저장 실패:', e);
    }
  }

  function loadState() {
    const key = storageKey();
    if (!key) return false;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.v !== STORAGE_VERSION) return false;
      if (!Array.isArray(data.slides) || data.slides.length === 0) return false;
      _slides = data.slides;
      _curIdx = (typeof data.curIdx === 'number' && data.curIdx >= 0 && data.curIdx < _slides.length) ? data.curIdx : 0;
      _interactiveState = data.interactiveState || {};
      showSaveStatus(data.ts, '이어서 작업');
      return true;
    } catch (e) {
      console.warn('상태 복원 실패:', e);
      return false;
    }
  }

  function clearState() {
    const key = storageKey();
    if (!key) return;
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }

  function showSaveStatus(ts, label) {
    const el = document.getElementById('save-status');
    const textEl = document.getElementById('save-status-text');
    if (!el || !textEl) return;
    textEl.textContent = label ? (label + ' · ' + formatTime(ts)) : ('저장됨 · ' + formatTime(ts));
    el.classList.add('just-saved');
    if (_saveStatusTimer) clearTimeout(_saveStatusTimer);
    _saveStatusTimer = setTimeout(() => {
      el.classList.remove('just-saved');
    }, 1400);
  }

  // =================== 마크다운(**굵게**) ===================
  function md(text) {
    if (!text) return '';
    return String(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  // =================== 십 배열판 / 큐브 계단 / 수직선 ===================
  function renderTenFrame(count, sizeKey) {
    sizeKey = sizeKey || 'md';
    const sizes = { sm: 22, md: 36, lg: 48, xl: 60 };
    const size = sizes[sizeKey] || 36;
    const gap = 4;
    const cols = 5, rows = 2;
    const w = cols * size + (cols - 1) * gap;
    const h = rows * size + (rows - 1) * gap;
    let cells = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = c * (size + gap);
        const y = r * (size + gap);
        const filled = idx < count ? ' filled' : '';
        cells += '<rect class="cell' + filled + '" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="4"/>';
      }
    }
    const dx = 2 * size + 1.5 * gap + gap / 2;
    const divider = '<line class="divider" x1="' + dx + '" y1="0" x2="' + dx + '" y2="' + h + '"/>';
    return '<div class="ten-frame"><svg width="' + w + '" height="' + h + '" viewBox="-1 -1 ' + (w + 2) + ' ' + (h + 2) + '" xmlns="http://www.w3.org/2000/svg">' + cells + divider + '</svg></div>';
  }

  function renderStaircase(min, max) {
    const cubeSize = 26;
    let html = '<div class="cube-stairs">';
    for (let n = min; n <= max; n++) {
      let stack = '<div class="cube-stack">';
      for (let i = 0; i < n; i++) stack += '<div class="cube" style="width:' + cubeSize + 'px;height:' + cubeSize + 'px;"></div>';
      stack += '<div class="cube-label">' + n + '</div></div>';
      html += stack;
    }
    return html + '</div>';
  }

  function renderNumberLine(range, anchor) {
    const min = range[0], max = range[1];
    const count = max - min + 1;
    let html = '<div class="number-line"><div class="nl-line">';
    for (let i = 0; i < count; i++) {
      const n = min + i;
      const pct = (i / (count - 1)) * 100;
      const isAnchor = n === anchor;
      const isActive = n === anchor - 1 || n === anchor + 1;
      let cls = '';
      if (isAnchor) cls = 'anchor';
      else if (isActive) cls = 'active';
      let arrow = '';
      if (n === anchor - 1) arrow = '<div class="nl-arrow" style="left:' + pct + '%;">−1</div>';
      else if (n === anchor + 1) arrow = '<div class="nl-arrow" style="left:' + pct + '%;">+1</div>';
      html += arrow + '<div class="nl-dot ' + cls + '" style="left:' + pct + '%;"></div><div class="nl-label" style="left:' + pct + '%;">' + n + '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // =================== 슬라이드 렌더 (블록 라우터) ===================
  // 정답 공개(reveal) — 교사용: 앞에서 끌고 가며 정답을 펼쳐 보이는 용도
  function isRevealed(id) {
    return !!(_interactiveState[id] && _interactiveState[id].revealed);
  }
  function revealUI(slideId, revealedHtml) {
    const on = isRevealed(slideId);
    return '<div class="i-controls"><button class="i-btn" data-action="reveal" data-slide-id="' + slideId + '">'
      + (on ? '🙈 정답 숨기기' : '👀 정답 보기') + '</button></div>'
      + (on ? '<div class="reveal-box">' + revealedHtml + '</div>' : '');
  }

  // 시각 시범(visual_demo) — demo_type별 구체물 그림
  function dvEmojis(emoji, n, struckFrom) {
    let h = '';
    for (let i = 0; i < n; i++) {
      const st = (struckFrom !== undefined && i >= struckFrom) ? ' struck' : '';
      h += '<span class="dv-emoji' + st + '">' + emoji + '</span>';
    }
    return h;
  }
  function dvGroup(inner, cls) { return '<div class="dv-group ' + (cls || '') + '">' + inner + '</div>'; }
  function dvOp(s) { return '<span class="dv-op">' + s + '</span>'; }
  function dvEq(s) { return '<div class="dv-eq">' + md(s) + '</div>'; }
  function renderDemoVisual(dt, p) {
    if (!p) return '';
    switch (dt) {
      case 'linking_cube_merge':
        return '<div class="dv-row">' + dvGroup(dvEmojis('🟦', p.left)) + dvOp('+') + dvGroup(dvEmojis('🟦', p.right)) + dvOp('=') + dvGroup(dvEmojis('🟦', p.total), 'total') + '</div>' + dvEq('**' + p.left + ' + ' + p.right + ' = ' + p.total + '**');
      case 'gather_split':
        return dvEq('**' + p.total + '**을 여러 방법으로 가르기')
          + '<div class="dv-splits">' + (p.examples || []).map(e => '<div class="dv-split"><span class="dv-pair">' + dvEmojis('🟦', e[0]) + '</span>' + dvOp('|') + '<span class="dv-pair">' + dvEmojis('🟦', e[1]) + '</span><span class="dv-cap">' + e[0] + ' · ' + e[1] + '</span></div>').join('') + '</div>';
      case 'addition_visual':
        return '<div class="dv-row">' + dvGroup(dvEmojis(p.emoji || '🔵', p.left)) + dvOp('+') + dvGroup(dvEmojis(p.emoji || '🔵', p.incoming), 'incoming') + dvOp('=') + dvGroup(dvEmojis(p.emoji || '🔵', p.total), 'total') + '</div>' + dvEq('**' + p.left + ' + ' + p.incoming + ' = ' + p.total + '**');
      case 'merge_visual':
        return '<div class="dv-row">'
          + '<div class="dv-labeled">' + dvGroup(dvEmojis(p.emoji || '🔵', p.left)) + '<div class="dv-label">' + md(p.left_label || '') + '</div></div>' + dvOp('+')
          + '<div class="dv-labeled">' + dvGroup(dvEmojis(p.emoji || '🔵', p.right)) + '<div class="dv-label">' + md(p.right_label || '') + '</div></div>' + dvOp('=')
          + dvGroup(dvEmojis(p.emoji || '🔵', p.total), 'total') + '</div>' + dvEq('**' + p.left + ' + ' + p.right + ' = ' + p.total + '**');
      case 'subtraction_remove_visual':
        return '<div class="dv-row">' + dvGroup(dvEmojis(p.emoji || '🔵', p.initial, p.remaining)) + dvOp('→') + dvGroup(dvEmojis(p.emoji || '🔵', p.remaining), 'total') + '</div>' + dvEq('**' + p.initial + ' − ' + p.removed + ' = ' + p.remaining + '**');
      case 'subtraction_compare_visual':
        return '<div class="dv-compare-rows"><div class="dv-row-line">' + dvEmojis(p.left_shape || '●', p.left) + '</div><div class="dv-row-line">' + dvEmojis(p.right_shape || '▲', p.right) + '</div></div>' + dvEq('**' + p.left + ' − ' + p.right + ' = ' + p.diff + '** (차)');
      default:
        return '';
    }
  }

  function renderSlide(slide) {
    const d = slide.data;
    const sid = slide.id;
    switch (slide.block) {
      case 'cover':
        return '<div class="center"><div class="center-text" style="font-size: clamp(28px, 4.4cqw, 44px);">' + md(d.title) + '</div>' + (d.subtitle ? '<div class="cover-sub">' + md(d.subtitle) + '</div>' : '') + '</div>';
      case 'review':
        return '<h2>' + md(d.title) + '</h2><div class="center"><div class="center-text">' + md(d.content) + '</div></div>';
      case 'motivate': {
        let inner = '';
        if (d.kids) inner += '<div class="scene">' + d.kids.map(k => '<div class="kid"><div class="face">' + k.face + '</div><div class="cards">' + k.label + '</div></div>').join('') + '</div>';
        if (d.visual) inner += '<div class="dv-scene">' + md(d.visual) + '</div>';
        return '<h2>' + md(d.scene_title || d.title || '') + '</h2><div class="center" style="gap: 28px;">' + inner + (d.question ? '<div class="big-q">' + md(d.question) + '</div>' : '') + '</div>';
      }
      case 'objective':
        return '<h2>' + md(d.title) + '</h2><div class="center"><div class="points-list">' + (d.bullets || []).map(p => '<span class="dot">·</span>' + md(p)).join('<br>') + '</div></div>';
      case 'concept': {
        if (d.kids_after) {
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="scene">' + d.kids_after.map(k => '<div class="kid ' + k.dir + '"><div class="face">' + k.face + '</div><div class="cards">' + k.label + '</div><div class="delta">' + k.delta + '</div></div>').join('') + '</div></div>';
        }
        if (d.bidirect) {
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="bidirect-card">' + d.bidirect.map(line => line === '=' ? '<span class="equals">=</span>' : md(line)).join('<br>') + '</div></div>';
        }
        let body = '';
        if (d.content) body += '<div class="center-text">' + md(d.content) + '</div>';
        if (d.equation) body += '<div class="dv-eq">' + md('**' + d.equation + '**') + '</div>';
        if (d.symbol_meanings) body += '<div class="sym-row">' + d.symbol_meanings.map(m => '<div class="sym-chip"><span class="sym-mark">' + m.symbol + '</span><span class="sym-mean">' + md(m.meaning) + '</span></div>').join('') + '</div>';
        if (d.visual) body += '<div class="dv-scene">' + md(d.visual) + '</div>';
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 20px;">' + body + '</div>';
      }
      case 'visual_demo':
        if (d.ten_frame_solo) {
          const tf = d.ten_frame_solo;
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="tf-item ' + (tf.is_anchor ? 'anchor' : '') + '">' + renderTenFrame(tf.count, 'xl') + '<div class="tf-num">' + tf.count + '</div><div class="tf-caption">' + md(tf.label || '') + '</div></div></div>';
        }
        if (d.linking_cube_staircase) {
          const r = d.linking_cube_staircase.range;
          return '<h2>' + md(d.title) + '</h2><div class="center">' + renderStaircase(r[0], r[1]) + (d.caption ? '<div class="tf-caption" style="margin-top: 16px;">' + md(d.caption) + '</div>' : '') + '</div>';
        }
        if (d.demo_type) {
          return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 20px;">' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + renderDemoVisual(d.demo_type, d.params) + '</div>';
        }
        return '<h2>' + md(d.title) + '</h2>' + (d.body ? '<div class="center"><div class="center-text">' + md(d.body) + '</div></div>' : '');
      case 'interactive_ten_frame':
        return renderInteractiveTenFrame(d, sid);
      case 'interactive_cube_stairs':
        return renderInteractiveCubeStairs(d, sid);
      case 'interactive_number_line':
        return renderInteractiveNumberLine(d, sid);
      case 'card_arrange':
        return renderCardArrange(d, sid);
      case 'offline_activity':
        return renderOfflineActivity(d);
      case 'compare':
        if (d.items) {
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="tf-row">' + d.items.map(it => '<div class="tf-item ' + (it.is_anchor ? 'anchor' : '') + '">' + renderTenFrame(it.ten_frame, 'md') + '<div class="tf-num">' + it.num + '</div><div class="tf-caption">' + md(it.caption) + '</div></div>').join('') + '</div></div>';
        }
        if (d.left && d.right) {
          const card = (s) => '<div class="cmp-card"><div class="cmp-emoji">' + (s.emoji || '') + '</div><div class="cmp-situation">' + md(s.situation) + '</div><div class="cmp-eq">' + md(s.eq) + '</div></div>';
          return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 20px;">' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + '<div class="cmp-row">' + card(d.left) + '<span class="cmp-vs">vs</span>' + card(d.right) + '</div></div>';
        }
        if (d.demo_type) {
          return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 20px;">' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + renderDemoVisual(d.demo_type, d.params) + '</div>';
        }
        return '<h2>' + md(d.title) + '</h2>' + (d.body ? '<div class="center"><div class="center-text">' + md(d.body) + '</div></div>' : '');
      case 'basic_problem': {
        let pre = '';
        if (d.ten_frame_anchor !== undefined) pre = '<div class="tf-item anchor">' + renderTenFrame(d.ten_frame_anchor, 'lg') + '<div class="tf-num">' + d.ten_frame_anchor + '</div></div>';
        else if (d.visual) pre = '<div class="dv-scene">' + md(d.visual) + '</div>';
        let choices = '';
        let revealHtml = '';
        if (d.choices) {
          const ai = d.answer_indices || [];
          const on = isRevealed(sid);
          choices = '<div class="choice-row">' + d.choices.map((c, i) => '<div class="choice-chip ' + (on && ai.indexOf(i) >= 0 ? 'correct' : '') + '">' + md(c) + '</div>').join('') + '</div>';
          revealHtml = revealUI(sid, '정답: ' + ai.map(i => md(d.choices[i])).join(', '));
        } else if (d.answer !== undefined) {
          revealHtml = revealUI(sid, '정답: <strong>' + d.answer + '</strong>');
        }
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 24px;">' + pre + '<div class="big-q">' + md(d.question || '') + '</div>' + choices + revealHtml + '</div>';
      }
      case 'real_world': {
        if (d.scenario) {
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="scenario-card"><div class="sc-icon">' + d.scenario.icon + '</div><div class="sc-body">' + md(d.scenario.body) + '</div></div></div>';
        }
        let inner = '';
        if (d.visual) inner += '<div class="dv-scene">' + md(d.visual) + '</div>';
        if (d.content || d.body) inner += '<div class="center-text">' + md(d.content || d.body) + '</div>';
        if (d.equation) inner += '<div class="dv-eq">' + md('**' + d.equation + '**') + '</div>';
        let revealHtml = '';
        if (d.answer !== undefined) revealHtml = revealUI(sid, '정답: <strong>' + d.answer + '</strong>');
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 20px;">' + inner + revealHtml + '</div>';
      }
      case 'advanced_problem': {
        let body = '';
        if (d.equation) body += '<div class="dv-eq">' + md('**' + d.equation + '**') + '</div>';
        if (d.visual) body += '<div class="dv-scene">' + md(d.visual) + '</div>';
        if (d.context) body += '<div class="center-text" style="font-size: clamp(18px, 2.6cqw, 24px);">' + md(d.context) + '</div>';
        if (d.questions) body += '<div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;">' + d.questions.map(q => '<div class="big-q">' + md(typeof q === 'string' ? q : q.q || '') + '</div>').join('') + '</div>';
        const main = d.challenge || d.question;
        if (main) body += '<div class="big-q">' + md(main) + '</div>';
        let revealHtml = '';
        if (d.answers) revealHtml = revealUI(sid, '정답: <strong>' + d.answers.join(', ') + '</strong>');
        else if (d.answer !== undefined) revealHtml = revealUI(sid, '정답: <strong>' + d.answer + '</strong>');
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 24px;">' + body + revealHtml + '</div>';
      }
      case 'game':
        return '<h2>' + md(d.title) + '</h2><div class="center"><ol class="steps-list">' + d.steps.map(s => '<li>' + md(s) + '</li>').join('') + '</ol></div>';
      case 'summary':
        return '<h2>' + md(d.title) + '</h2><div class="center"><div class="points-list">' + (d.points || d.bullets || []).map(p => '<span class="dot">·</span>' + md(p)).join('<br>') + '</div></div>';
      case 'question': {
        const q = d.question || d.content || '';
        let items = '';
        if (d.items) items = '<div class="check-list">' + d.items.map(it => '<div class="check-item"><span class="check-box">☐</span>' + md(it) + '</div>').join('') + '</div>';
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 18px;"><div class="big-q" style="font-size: clamp(18px, 2.8cqw, 26px);">' + md(q) + '</div>' + items + '</div>';
      }
      case 'next_lesson':
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 14px;"><div class="big-q">' + md(d.preview || '') + '</div>' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + '</div>';
      case 'trace_symbol':
        return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 24px;"><div class="trace-symbol">' + md(d.symbol || '') + '</div>' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + '</div>';
      case 'arrow_flow': {
        if (d.flow) {
          const flowHtml = d.flow.map((f, i) => {
            const numCls = f.type === 'anchor' ? 'anchor' : (f.type === 'up' ? 'up' : '');
            return '<div class="af-item"><div class="af-num ' + numCls + '">' + f.num + '</div><div class="af-label">' + md(f.label) + '</div></div>' + (i < d.flow.length - 1 ? '<div class="af-arrow">→</div>' : '');
          }).join('');
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="arrow-flow">' + flowHtml + '</div>' + (d.sub ? '<div class="small-text">' + md(d.sub) + '</div>' : '') + '</div>';
        }
        if (d.pairs) {
          const fwd = (d.labels && d.labels.forward) || '모으면';
          const bwd = (d.labels && d.labels.backward) || '가르면';
          const rows = d.pairs.map(p => '<div class="bidir-row"><span class="bidir-l">' + md(p.left) + '</span><span class="bidir-arrows"><span class="bidir-fwd">' + fwd + ' →</span><span class="bidir-bwd">← ' + bwd + '</span></span><span class="bidir-r">' + md(p.right) + '</span></div>').join('');
          return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 16px;">' + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '') + '<div class="bidir-list">' + rows + '</div></div>';
        }
        if (d.steps) {
          return '<h2>' + md(d.title) + '</h2><div class="center"><div class="flow-steps">' + d.steps.map(s => '<div class="flow-step">' + md(s) + '</div>').join('') + '</div></div>';
        }
        return '<h2>' + md(d.title) + '</h2>' + (d.body ? '<div class="center"><div class="center-text">' + md(d.body) + '</div></div>' : '');
      }
      case 'misconception':
        return '<h2>' + md(d.title) + '</h2><div class="center"><div class="misconception-card"><div class="mc-label">' + (d.label || '오개념 주의') + '</div><div class="mc-wrong">' + md(d.wrong) + '</div><div class="mc-right" style="margin-top:8px;">' + md(d.right) + '</div>' + (d.hint ? '<div style="margin-top:12px; font-size: 0.85em; color: var(--c-text-light);">' + md(d.hint) + '</div>' : '') + '</div></div>';
      case 'number_line_demo':
        return '<h2>' + md(d.title) + '</h2><div class="center">' + renderNumberLine(d.nl.range, d.nl.anchor) + (d.caption ? '<div class="small-text">' + md(d.caption) + '</div>' : '') + '</div>';
      default:
        return '<h2>' + md(d.title || '새 슬라이드') + '</h2><div class="center"><div class="center-text">' + md(d.content || '내용을 추가하세요') + '</div></div>';
    }
  }

  // =================== 인터랙티브 블록 5종 ===================
  function getIState(id, initial) {
    if (!_interactiveState[id]) _interactiveState[id] = JSON.parse(JSON.stringify(initial));
    return _interactiveState[id];
  }
  function setIState(id, value) {
    _interactiveState[id] = value;
    renderCurrentSlide();
    saveState();
  }
  function resetIState(id, initial) {
    _interactiveState[id] = JSON.parse(JSON.stringify(initial));
    renderCurrentSlide();
    saveState();
  }

  function renderInteractiveTenFrame(d, slideId) {
    const state = getIState(slideId, { count: d.start_count || 0 });
    const cells = [];
    const cols = 5, rows = 2;
    const size = 64, gap = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const filled = idx < state.count;
        cells.push('<div class="i-tf-cell ' + (filled ? 'filled' : '') + '" data-idx="' + idx + '" style="width:' + size + 'px;height:' + size + 'px;"></div>');
      }
    }
    const w = cols * size + (cols - 1) * gap;
    const tfWidth = w + 16;
    return '<h2>' + md(d.title) + '</h2>'
      + '<div class="center">'
      + '<div class="i-tf-grid" id="i-tf-' + slideId + '" data-slide-id="' + slideId + '" style="width:' + tfWidth + 'px;">' + cells.join('') + '</div>'
      + '<div class="i-tf-num">' + state.count + '</div>'
      + '<div class="i-controls">'
      + '<button class="i-btn" data-action="i-tf-minus" data-slide-id="' + slideId + '">− 하나 빼기</button>'
      + '<button class="i-btn" data-action="i-tf-plus" data-slide-id="' + slideId + '">+ 하나 더하기</button>'
      + '<button class="i-btn secondary" data-action="i-tf-reset" data-slide-id="' + slideId + '" data-initial="' + (d.start_count || 0) + '">처음으로</button>'
      + '</div>'
      + (d.question ? '<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">' + md(d.question) + '</div>' : '')
      + '<div class="small-text" style="font-size: 13px;">💡 칸을 직접 눌러도 되고, 버튼을 눌러도 돼요</div>'
      + '</div>';
  }

  function renderInteractiveCubeStairs(d, slideId) {
    const state = getIState(slideId, { count: d.start_count || 3 });
    const cubeSize = 36;
    let stackHtml = '<div class="i-cube-stack">';
    for (let i = 0; i < state.count; i++) {
      stackHtml += '<div class="i-cube" data-idx="' + i + '" style="width:' + cubeSize + 'px;height:' + cubeSize + 'px;"></div>';
    }
    stackHtml += '<div class="i-cube-label">' + state.count + '</div></div>';
    return '<h2>' + md(d.title) + '</h2>'
      + '<div class="center">'
      + '<div class="i-cube-area" id="i-cube-' + slideId + '" style="min-height: 280px;">' + stackHtml + '</div>'
      + '<div class="i-controls">'
      + '<button class="i-btn" data-action="i-cube-minus" data-slide-id="' + slideId + '">− 하나 빼기</button>'
      + '<button class="i-btn" data-action="i-cube-plus" data-slide-id="' + slideId + '">+ 하나 쌓기</button>'
      + '<button class="i-btn secondary" data-action="i-cube-reset" data-slide-id="' + slideId + '" data-initial="' + (d.start_count || 3) + '">처음으로</button>'
      + '</div>'
      + (d.question ? '<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">' + md(d.question) + '</div>' : '')
      + '</div>';
  }

  function renderInteractiveNumberLine(d, slideId) {
    const state = getIState(slideId, { position: d.start || 5 });
    const min = d.range[0], max = d.range[1];
    const count = max - min + 1;
    let html = '<div class="i-number-line"><div class="i-nl-line">';
    for (let i = 0; i < count; i++) {
      const n = min + i;
      const pct = (i / (count - 1)) * 100;
      const isCur = n === state.position;
      html += '<div class="i-nl-dot ' + (isCur ? 'current' : '') + '" data-n="' + n + '" data-slide-id="' + slideId + '" style="left:' + pct + '%;"></div>'
            + '<div class="i-nl-label" style="left:' + pct + '%;">' + n + '</div>';
    }
    html += '</div></div>';
    return '<h2>' + md(d.title) + '</h2>'
      + '<div class="center">'
      + html
      + '<div class="i-tf-num">현재 위치: ' + state.position + '</div>'
      + '<div class="i-controls">'
      + '<button class="i-btn" data-action="i-nl-minus" data-slide-id="' + slideId + '" data-min="' + min + '">← 1 작아짐</button>'
      + '<button class="i-btn" data-action="i-nl-plus" data-slide-id="' + slideId + '" data-max="' + max + '">1 커짐 →</button>'
      + '<button class="i-btn secondary" data-action="i-nl-reset" data-slide-id="' + slideId + '" data-initial="' + (d.start || 5) + '">처음으로</button>'
      + '</div>'
      + (d.question ? '<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">' + md(d.question) + '</div>' : '')
      + '<div class="small-text" style="font-size: 13px;">💡 점을 직접 눌러도 되고, 버튼을 눌러도 돼요</div>'
      + '</div>';
  }

  function renderCardArrange(d, slideId) {
    // 모드 1: 수 카드 정렬 (작은 수 → 큰 수) — 기존 동작
    if (d.cards) {
      const initial = d.cards;
      const target = d.target || [...initial].sort((a, b) => a - b);
      const state = getIState(slideId, { order: [...initial] });
      const isCorrect = JSON.stringify(state.order) === JSON.stringify(target);
      const cardsHtml = state.order.map((n, i) =>
        '<div class="i-card" draggable="true" data-n="' + n + '" data-pos="' + i + '" data-slide-id="' + slideId + '">' + n + '</div>'
      ).join('');
      return '<h2>' + md(d.title) + '</h2>'
        + '<div class="center">'
        + '<div class="small-text">' + md(d.instruction || '카드를 드래그해서 작은 수부터 큰 수 순서로 놓아 보세요.') + '</div>'
        + '<div class="i-card-row" id="i-cards-' + slideId + '" data-slide-id="' + slideId + '">' + cardsHtml + '</div>'
        + (isCorrect ? '<div class="i-success">🎉 잘했어요! 작은 수 → 큰 수 순서로 잘 놓았어요.</div>' : '')
        + '<div class="i-controls"><button class="i-btn secondary" data-action="i-card-reset" data-slide-id="' + slideId + '" data-initial=\'' + JSON.stringify(initial) + '\'>다시 섞기</button></div>'
        + '</div>';
    }
    // 모드 2: 식 ↔ 읽기 짝짓기 (읽기 공개형)
    if (d.readings) {
      const on = isRevealed(slideId);
      const reveal = revealUI(slideId, '<div class="match-reveal">' + (d.equation ? '<div class="dv-eq">' + md('**' + d.equation + '**') + '</div>' : '') + d.readings.map(r => '<div class="reading-line">📖 ' + md(r) + '</div>').join('') + '</div>');
      return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 18px;">'
        + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '')
        + (d.equation ? '<div class="dv-eq">' + md('**' + d.equation + '**') + '</div>' : '')
        + reveal + '</div>';
    }
    // 모드 3: 두 수를 모으면 N — 짝 공개형
    if (d.pairs && d.total !== undefined) {
      const flat = [];
      d.pairs.forEach(p => { flat.push(p[0]); flat.push(p[1]); });
      const cards = flat.map(n => '<div class="i-card static">' + n + '</div>').join('');
      const reveal = revealUI(slideId, '<div class="match-reveal">' + d.pairs.map(p => '<div class="pair-line"><span class="i-card mini">' + p[0] + '</span> + <span class="i-card mini">' + p[1] + '</span> = <strong>' + d.total + '</strong></div>').join('') + '</div>');
      return '<h2>' + md(d.title) + '</h2><div class="center" style="gap: 18px;">'
        + (d.body ? '<div class="small-text">' + md(d.body) + '</div>' : '')
        + '<div class="i-card-row">' + cards + '</div>'
        + reveal + '</div>';
    }
    // 폴백
    return '<h2>' + md(d.title) + '</h2>' + (d.body ? '<div class="center"><div class="center-text">' + md(d.body) + '</div></div>' : '');
  }

  function renderOfflineActivity(d) {
    return '<h2>' + md(d.title) + '</h2>'
      + '<div class="center">'
      + '<div class="i-offline-card">'
      + '<div class="i-offline-tag">' + (d.tag || '교실에서 함께 해요') + '</div>'
      + '<div class="i-offline-icon">' + (d.icon || '🙋') + '</div>'
      + '<div class="i-offline-body">' + md(d.body || '') + '</div>'
      + (d.materials ? '<div class="i-offline-materials"><strong>필요한 것:</strong> ' + d.materials + '</div>' : '')
      + '</div>'
      + '</div>';
  }

  // =================== 사이드바·보조자료 패널 ===================
  function getExtra(id) {
    return _extrasData.find(e => e.id === id);
  }

  function blockShortLabel(block) {
    return ({
      cover: '표지', review: '복습', motivate: '도입 상황', concept: '개념',
      visual_demo: '시각 자료', compare: '비교', basic_problem: '기본 문제',
      advanced_problem: '응용 문제', real_world: '생활 속', game: '활동·놀이',
      summary: '요약', question: '발문', next_lesson: '다음 차시',
      objective: '학습 목표', trace_symbol: '✍ 따라쓰기',
      arrow_flow: '흐름', misconception: '오개념', number_line_demo: '수직선',
      interactive_ten_frame: '👆 십 배열판', interactive_cube_stairs: '👆 큐브 쌓기',
      interactive_number_line: '👆 수직선', card_arrange: '👆 카드 순서',
      offline_activity: '🙋 교실 활동'
    })[block] || block;
  }

  function renderSlidesPanel() {
    const panel = document.getElementById('slides-panel');
    if (!panel) return;
    let html = '';
    let lastStage = '';
    _slides.forEach((s, idx) => {
      if (s.stage !== lastStage) { html += '<div class="stage-label">' + s.stage + '</div>'; lastStage = s.stage; }
      const cls = (idx === _curIdx ? 'current ' : '') + (!s.included ? 'excluded' : '');
      html += '<div class="slide-list-item ' + cls + '" data-idx="' + idx + '">'
        + '<div class="checkbox ' + (s.included ? 'checked' : '') + '" data-toggle="1"></div>'
        + '<div class="slide-num">' + (idx + 1) + '</div>'
        + '<div class="slide-name">' + blockShortLabel(s.block) + '</div>'
        + (s.attached_extras.length ? '<div class="extra-count">+' + s.attached_extras.length + '</div>' : '')
        + '</div>';
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.slide-list-item').forEach(el => {
      el.addEventListener('click', e => {
        const idx = parseInt(el.dataset.idx, 10);
        if (e.target.dataset.toggle) {
          _slides[idx].included = !_slides[idx].included;
        } else {
          if (_slides[idx].included) _curIdx = idx;
        }
        rebuild();
      });
    });
  }

  function renderExtrasPanel() {
    const filter = document.getElementById('extras-filter');
    if (!filter) return;
    const types = Object.keys(TYPE_LABELS);
    filter.innerHTML = '<button class="' + (_extrasFilter === 'all' ? 'active' : '') + '" data-type="all">전체</button>'
      + types.map(t => '<button class="' + (_extrasFilter === t ? 'active' : '') + '" data-type="' + t + '">' + TYPE_LABELS[t] + '</button>').join('');
    filter.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => { _extrasFilter = b.dataset.type; renderExtrasPanel(); });
    });

    const cur = _slides[_curIdx];
    const attachedIds = new Set(cur.attached_extras);
    const suggestedIds = new Set(cur.suggested_extras || []);
    let list = _extrasData.filter(e => _extrasFilter === 'all' || e.type === _extrasFilter);
    list = [...list.filter(e => suggestedIds.has(e.id)), ...list.filter(e => !suggestedIds.has(e.id))];

    const listEl = document.getElementById('extras-list');
    listEl.innerHTML = list.map(e => {
      const isAttached = attachedIds.has(e.id);
      const isSuggested = suggestedIds.has(e.id);
      return '<div class="extra-card ' + (isAttached ? 'attached' : '') + '" data-extra-id="' + e.id + '">'
        + '<div class="extra-head">'
        + '<span class="extra-icon">' + e.icon + '</span>'
        + '<span class="extra-title">' + e.title + (isSuggested ? '  ·' : '') + '</span>'
        + '<button class="extra-attach">' + (isAttached ? '뺌' : '끼움') + '</button>'
        + '</div>'
        + '<div class="extra-desc">' + (e.description || '') + '</div>'
        + '</div>';
    }).join('');
    listEl.querySelectorAll('.extra-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.extraId;
        const cur = _slides[_curIdx];
        if (cur.attached_extras.includes(id)) cur.attached_extras = cur.attached_extras.filter(x => x !== id);
        else cur.attached_extras.push(id);
        rebuild();
      });
    });
  }

  function renderAttachedExtras() {
    const panel = document.getElementById('extras-panel');
    if (!panel) return;
    const cur = _slides[_curIdx];
    if (!cur.attached_extras || cur.attached_extras.length === 0) { panel.style.display = 'none'; return; }
    panel.style.display = 'flex';
    let html = '<div class="ep-label">보조자료</div>';
    cur.attached_extras.forEach(id => {
      const e = getExtra(id);
      if (!e) return;
      const previewText = (e.content || e.description || '');
      const preview = previewText.length > 60 ? previewText.slice(0, 60) + '…' : previewText;
      html += '<div class="extra-attached-card" data-extra-id="' + id + '">'
        + '<div class="ext-head">'
        + '<span class="ext-icon">' + e.icon + '</span>'
        + '<span class="ext-title">' + e.title + '</span>'
        + '<span class="ext-remove" data-remove="' + id + '">×</span>'
        + '</div>'
        + '<div class="ext-content">' + preview + '</div>'
        + '</div>';
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.extra-attached-card').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.dataset.remove) {
          const id = e.target.dataset.remove;
          _slides[_curIdx].attached_extras = _slides[_curIdx].attached_extras.filter(x => x !== id);
          rebuild();
          return;
        }
        openExtraOverlay(el.dataset.extraId);
      });
    });
  }

  // =================== 자료 오버레이 ===================
  function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function renderExtraOverlayBody(e) {
    if (e.type === 'video') {
      const videoId = e.video_id || extractYouTubeId(e.url);
      if (videoId) {
        return '<div class="eo-video-frame">'
          + '<iframe src="https://www.youtube.com/embed/' + videoId + '?rel=0" allowfullscreen '
          + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>'
          + '</div>'
          + (e.description ? '<div class="eo-medium-text" style="margin-top:24px; color:var(--c-text-light); font-size:16px;">' + md(e.description) + '</div>' : '');
      }
      const searchHint = e.url && e.url.includes('search_query=') ?
        decodeURIComponent(e.url.split('search_query=')[1].replace(/\+/g, ' ')) : '';
      return '<div class="eo-video-search">'
        + '<div class="vs-icon">🔍</div>'
        + '<div class="vs-msg">'
        + (e.description ? md(e.description) + '<br><br>' : '')
        + (searchHint ? '유튜브 검색어: <strong>' + searchHint + '</strong>' : '유튜브에서 영상 찾기')
        + '</div>'
        + (e.url ? '<a class="vs-btn" href="' + e.url + '" target="_blank" rel="noopener">새 탭에서 유튜브 열기 →</a>' : '')
        + '</div>';
    }

    if (e.type === 'book') {
      return '<div class="eo-book">'
        + '<div class="book-icon">📖</div>'
        + '<div class="book-body">'
        + '<div class="eo-medium-text">' + md(e.content || e.description || '') + '</div>'
        + '</div>'
        + '</div>';
    }

    if (e.type === 'tip' || e.type === 'misconception') {
      const guideLabel = e.type === 'tip' ? '교사용 학습 가이드' : '교사용 오개념 주의';
      return '<div class="eo-guide">'
        + '<div class="guide-label">' + guideLabel + '</div>'
        + '<div class="eo-medium-text">' + md(e.content || e.description || '') + '</div>'
        + '</div>';
    }

    if (e.type === 'game' || e.type === 'other_activity') {
      if (Array.isArray(e.steps) && e.steps.length > 0) {
        const stepsHtml = e.steps.map(s => '<li>' + md(s) + '</li>').join('');
        return '<div class="eo-label">진행 단계</div>'
          + '<ol class="eo-steps">' + stepsHtml + '</ol>'
          + (e.description ? '<div class="eo-divider"></div><div class="eo-medium-text" style="font-size:16px; color:var(--c-text-light);">' + md(e.description) + '</div>' : '');
      }
      return '<div class="eo-big-text" style="text-align:left;">' + md(e.content || e.description || '') + '</div>';
    }

    return '<div class="eo-big-text">' + md(e.content || e.description || '') + '</div>';
  }

  function openExtraOverlay(extraId) {
    const e = getExtra(extraId);
    if (!e) return;
    const audience = EXTRA_TYPE_AUDIENCE[e.type] || 'student';
    const typeLabel = EXTRA_TYPE_FULL_LABEL[e.type] || e.type;
    document.getElementById('eo-icon').textContent = e.icon || '';
    document.getElementById('eo-type-tag').textContent = typeLabel;
    document.getElementById('eo-title').textContent = e.title || '';
    const audEl = document.getElementById('eo-audience');
    audEl.textContent = audience === 'teacher' ? '교사용' : '학생용';
    audEl.classList.toggle('teacher', audience === 'teacher');
    let body = renderExtraOverlayBody(e);
    if (e.source) {
      body += '<div class="eo-source"><span class="src-label">출처</span>' + e.source + '</div>';
    }
    document.getElementById('eo-canvas').innerHTML = body;
    document.getElementById('ext-overlay').classList.add('active');
  }

  function closeExtraOverlay() {
    document.getElementById('ext-overlay').classList.remove('active');
    const canvas = document.getElementById('eo-canvas');
    if (canvas) canvas.innerHTML = '';
  }

  // =================== 현재 슬라이드·rebuild ===================
  function renderCurrentSlide() {
    const cur = _slides[_curIdx];
    document.getElementById('slide-content').innerHTML = '<div class="slide active ' + (cur.user_added ? 'user-added' : '') + '">' + renderSlide(cur) + '</div>';
    const visibleSlides = _slides.filter(s => s.included);
    const visIdx = visibleSlides.indexOf(cur);
    document.getElementById('cur-pos').textContent = visIdx + 1;
    document.getElementById('total-pos').textContent = visibleSlides.length;
    document.getElementById('current-stage').textContent = cur.stage;
    document.getElementById('delete-slide-btn').style.display = cur.user_added ? '' : 'none';
    document.getElementById('prev-btn').disabled = visIdx === 0;
    document.getElementById('next-btn').disabled = visIdx === visibleSlides.length - 1;
  }

  function rebuild() {
    if (!_slides[_curIdx] || !_slides[_curIdx].included) {
      const next = _slides.findIndex((s, i) => i >= _curIdx && s.included);
      if (next >= 0) _curIdx = next;
      else {
        const prev = [..._slides].reverse().findIndex(s => s.included);
        if (prev >= 0) _curIdx = _slides.length - 1 - prev;
      }
    }
    renderSlidesPanel();
    renderExtrasPanel();
    renderAttachedExtras();
    renderCurrentSlide();
    const showView = document.getElementById('show-view');
    if (showView && showView.classList.contains('active')) saveState();
  }

  function go(delta) {
    const visible = _slides.map((s, i) => s.included ? i : -1).filter(i => i >= 0);
    const curVisIdx = visible.indexOf(_curIdx);
    const nextVisIdx = curVisIdx + delta;
    if (nextVisIdx < 0 || nextVisIdx >= visible.length) return;
    _curIdx = visible[nextVisIdx];
    rebuild();
  }

  function toggleFullscreen() {
    document.body.classList.toggle('fullscreen');
  }

  // =================== 홈 화면 ===================
  function renderHome() {
    const container = document.getElementById('units-container');
    if (!container) return;
    container.innerHTML = _curriculum.map(unit => {
      return '<div class="unit-block">'
        + '<div class="unit-header">'
        + '<span class="unit-num">' + unit.unit + '단원</span>'
        + '<h2>' + unit.title + '</h2>'
        + '<span class="unit-meta">' + unit.lesson_count + '차시</span>'
        + '</div>'
        + '<div class="lesson-grid">'
        + unit.lessons.map(l => {
          // ready 판단 — l.ready 우선, 없으면 lessons 객체에 키 존재 여부로 결정
          let ready = !!l.ready;
          // n은 단일 숫자(8) 또는 묶음 문자열("2~3"). lessonKey가 양쪽 처리.
          const k = lessonKey(unit.unit, l.n);
          if (_lessons[k]) ready = true;
          // data-lesson 속성에는 문자열 그대로 저장 (묶음 문자열·숫자 모두 지원)
          return '<div class="lesson-card ' + (ready ? 'ready' : 'disabled') + '" data-unit="' + unit.unit + '" data-lesson="' + l.n + '">'
            + '<div class="lc-head">'
            + '<span class="lc-num">' + l.n + '차시</span>'
            + '</div>'
            + '<div class="lc-title">' + l.title + '</div>'
            + '<div class="lc-meta">'
            + '<span class="lc-tag">' + l.std + '</span>'
            + '</div>'
            + '<div class="lc-concept">' + l.concept + '</div>'
            + '<div class="lc-status">' + (ready ? '바로 시작' : '준비 중') + '</div>'
            + '</div>';
        }).join('')
        + '</div>'
        + '</div>';
    }).join('');
    container.querySelectorAll('.lesson-card.ready').forEach(card => {
      card.addEventListener('click', () => {
        // 묶음 문자열("2~3") 그대로 / 숫자는 parseInt
        const raw = card.dataset.lesson;
        const lessonVal = (raw.indexOf('~') !== -1) ? raw : parseInt(raw, 10);
        openShow(parseInt(card.dataset.unit, 10), lessonVal);
      });
    });
  }

  // =================== 차시 진입 / 홈 복귀 ===================
  function openShow(unit, lesson) {
    const key = lessonKey(unit, lesson);
    const lessonObj = _lessons[key];
    if (!lessonObj) {
      console.warn('차시 데이터 없음:', key);
      return;
    }
    _currentLessonKey = key;
    _extrasData = lessonObj.extras || [];

    // 사이드바 헤더 메타 갱신
    if (lessonObj.meta) {
      const m = lessonObj.meta;
      const aside = document.getElementById('aside');
      if (aside) {
        const h1 = aside.querySelector('header h1');
        const metaDiv = aside.querySelector('header .meta');
        if (h1 && m.title) h1.textContent = m.title;
        if (metaDiv && m.subtitle) metaDiv.textContent = m.subtitle;
      }
    }

    document.getElementById('home-view').classList.remove('active');
    document.getElementById('show-view').classList.add('active');

    // 저장 자리 복원 시도
    if (!loadState()) {
      _slides = lessonObj.slides.map(s => Object.assign({}, s, { included: true, attached_extras: [] }));
      _curIdx = 0;
      _interactiveState = {};
    }
    rebuild();
  }

  function backToHome() {
    document.getElementById('show-view').classList.remove('active');
    document.getElementById('home-view').classList.add('active');
    if (document.body.classList.contains('fullscreen')) {
      document.body.classList.remove('fullscreen');
    }
    _currentLessonKey = null;
  }

  // =================== 전역 이벤트 부착 (init 1회) ===================
  function attachEvents() {
    document.getElementById('toggle-side').addEventListener('click', () => {
      document.getElementById('aside').classList.toggle('collapsed');
    });
    document.getElementById('prev-btn').addEventListener('click', () => go(-1));
    document.getElementById('next-btn').addEventListener('click', () => go(1));
    document.getElementById('full-btn').addEventListener('click', toggleFullscreen);
    const epBtn = document.getElementById('export-pptx-btn');
    if (epBtn) epBtn.addEventListener('click', exportPptx);
    const ewBtn = document.getElementById('export-ws-btn');
    if (ewBtn) ewBtn.addEventListener('click', exportWorksheet);
    document.getElementById('fs-exit-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('back-to-home').addEventListener('click', backToHome);
    document.getElementById('eo-close').addEventListener('click', closeExtraOverlay);

    // 자료 오버레이 — 바깥 클릭 닫기
    document.getElementById('ext-overlay').addEventListener('click', e => {
      if (e.target.id === 'ext-overlay' || e.target.classList.contains('ext-overlay-body')) {
        closeExtraOverlay();
      }
    });

    // 초기화 버튼
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (!confirm('조립 상태를 처음 자리로 되돌릴까요?\n(끼운 보조자료·추가한 슬라이드·인터랙티브 상태 모두 초기화)')) return;
      clearState();
      const lessonObj = _lessons[_currentLessonKey];
      if (lessonObj) {
        _slides = lessonObj.slides.map(s => Object.assign({}, s, { included: true, attached_extras: [] }));
        _curIdx = 0;
        _interactiveState = {};
      }
      rebuild();
    });

    // 탭 전환
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tab.dataset.tab));
      });
    });

    // 블록 추가 카드
    document.querySelectorAll('.block-card').forEach(c => {
      c.addEventListener('click', () => {
        const type = c.dataset.blockType;
        const template = BLOCK_TEMPLATES[type];
        if (!template) return;
        const newSlide = Object.assign(
          {},
          JSON.parse(JSON.stringify(template)),
          {
            id: 'u' + Date.now(),
            included: true,
            attached_extras: [],
            suggested_extras: [],
            user_added: true
          }
        );
        _slides.splice(_curIdx + 1, 0, newSlide);
        _curIdx++;
        rebuild();
      });
    });

    document.getElementById('delete-slide-btn').addEventListener('click', () => {
      if (!_slides[_curIdx].user_added) return;
      if (!confirm('이 슬라이드를 삭제할까요?')) return;
      _slides.splice(_curIdx, 1);
      if (_curIdx >= _slides.length) _curIdx = _slides.length - 1;
      rebuild();
    });

    // 키보드
    document.addEventListener('keydown', e => {
      if (!document.getElementById('show-view').classList.contains('active')) return;
      if (document.getElementById('ext-overlay').classList.contains('active')) {
        if (e.key === 'Escape') closeExtraOverlay();
        return;
      }
      const modal = document.querySelector('.modal.active');
      if (modal) {
        if (e.key === 'Escape') document.getElementById('modal').classList.remove('active');
        return;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { go(1); e.preventDefault(); }
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'Escape' && document.body.classList.contains('fullscreen')) toggleFullscreen();
    });

    // 인터랙티브 클릭 위임
    document.addEventListener('click', e => {
      const t = e.target;

      // 십 배열판 셀
      if (t.classList && t.classList.contains('i-tf-cell')) {
        const grid = t.closest('.i-tf-grid');
        const slideId = grid.dataset.slideId;
        const idx = parseInt(t.dataset.idx, 10);
        const state = _interactiveState[slideId] || { count: 0 };
        const newCount = idx < state.count ? idx : idx + 1;
        setIState(slideId, { count: newCount });
        return;
      }

      if (!t.dataset) return;
      // 십 배열판 버튼
      if (t.dataset.action === 'i-tf-plus') {
        const sid = t.dataset.slideId;
        const s = _interactiveState[sid] || { count: 0 };
        if (s.count < 10) setIState(sid, { count: s.count + 1 });
        return;
      }
      if (t.dataset.action === 'i-tf-minus') {
        const sid = t.dataset.slideId;
        const s = _interactiveState[sid] || { count: 0 };
        if (s.count > 0) setIState(sid, { count: s.count - 1 });
        return;
      }
      if (t.dataset.action === 'i-tf-reset') {
        resetIState(t.dataset.slideId, { count: parseInt(t.dataset.initial, 10) });
        return;
      }

      // 큐브
      if (t.dataset.action === 'i-cube-plus') {
        const sid = t.dataset.slideId;
        const s = _interactiveState[sid] || { count: 0 };
        if (s.count < 9) setIState(sid, { count: s.count + 1 });
        return;
      }
      if (t.dataset.action === 'i-cube-minus') {
        const sid = t.dataset.slideId;
        const s = _interactiveState[sid] || { count: 0 };
        if (s.count > 0) setIState(sid, { count: s.count - 1 });
        return;
      }
      if (t.dataset.action === 'i-cube-reset') {
        resetIState(t.dataset.slideId, { count: parseInt(t.dataset.initial, 10) });
        return;
      }

      // 수직선 점 클릭
      if (t.classList && t.classList.contains('i-nl-dot')) {
        const sid = t.dataset.slideId;
        setIState(sid, { position: parseInt(t.dataset.n, 10) });
        return;
      }
      if (t.dataset.action === 'i-nl-plus') {
        const sid = t.dataset.slideId;
        const max = parseInt(t.dataset.max, 10);
        const s = _interactiveState[sid] || { position: 5 };
        if (s.position < max) setIState(sid, { position: s.position + 1 });
        return;
      }
      if (t.dataset.action === 'i-nl-minus') {
        const sid = t.dataset.slideId;
        const min = parseInt(t.dataset.min, 10);
        const s = _interactiveState[sid] || { position: 5 };
        if (s.position > min) setIState(sid, { position: s.position - 1 });
        return;
      }
      if (t.dataset.action === 'i-nl-reset') {
        resetIState(t.dataset.slideId, { position: parseInt(t.dataset.initial, 10) });
        return;
      }

      // 카드 다시 섞기
      if (t.dataset.action === 'i-card-reset') {
        const initial = JSON.parse(t.dataset.initial);
        const shuffled = [...initial].sort(() => Math.random() - 0.5);
        resetIState(t.dataset.slideId, { order: shuffled });
        return;
      }

      // 정답 공개 토글 (교사용)
      if (t.dataset.action === 'reveal') {
        const sid = t.dataset.slideId;
        const s = _interactiveState[sid] || { revealed: false };
        setIState(sid, { revealed: !s.revealed });
        return;
      }
    });

    // 수 카드 드래그
    let dragState = null;
    document.addEventListener('dragstart', e => {
      if (!e.target.classList || !e.target.classList.contains('i-card')) return;
      dragState = {
        slideId: e.target.dataset.slideId,
        fromPos: parseInt(e.target.dataset.pos, 10)
      };
      e.target.classList.add('dragging');
    });
    document.addEventListener('dragend', e => {
      if (e.target.classList && e.target.classList.contains('i-card')) e.target.classList.remove('dragging');
    });
    document.addEventListener('dragover', e => {
      if (e.target.classList && e.target.classList.contains('i-card')) e.preventDefault();
    });
    document.addEventListener('drop', e => {
      if (!dragState) return;
      if (!e.target.classList || !e.target.classList.contains('i-card')) return;
      e.preventDefault();
      const toPos = parseInt(e.target.dataset.pos, 10);
      const state = _interactiveState[dragState.slideId];
      if (!state) return;
      const order = [...state.order];
      [order[dragState.fromPos], order[toPos]] = [order[toPos], order[dragState.fromPos]];
      setIState(dragState.slideId, { order });
      dragState = null;
    });

    // 페이지 떠나기 전 저장
    window.addEventListener('beforeunload', () => {
      if (document.getElementById('show-view').classList.contains('active')) saveState();
    });
  }

  // =================== Public API ===================
  // =================== 산출물 내보내기 ===================
  function currentLessonForExport() {
    const meta = (_lessons[_currentLessonKey] && _lessons[_currentLessonKey].meta) || {};
    return { meta: meta, slides: _slides.filter(s => s.included !== false) };
  }
  function exportPptx() {
    if (typeof TeacherExport === 'undefined' || typeof PptxGenJS === 'undefined') {
      alert('PPT 생성 도구를 불러오는 중입니다. 잠시 후 다시 눌러 주세요.');
      return;
    }
    try {
      const pres = TeacherExport.buildPptx(PptxGenJS, currentLessonForExport());
      const meta = currentLessonForExport().meta;
      const name = (_subject ? _subject.slug : 'lesson') + '_' + (_currentLessonKey || 'export') + '_교사용.pptx';
      pres.writeFile({ fileName: name });
    } catch (e) { console.error(e); alert('PPT 생성 중 오류가 발생했습니다.'); }
  }
  function exportWorksheet() {
    if (typeof TeacherExport === 'undefined') { alert('학습지 생성 도구를 불러오는 중입니다.'); return; }
    try {
      const html = TeacherExport.buildWorksheetHTML(currentLessonForExport());
      const win = window.open('', '_blank');
      if (!win) { alert('팝업이 차단되었습니다. 팝업을 허용해 주세요.'); return; }
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 400); // 브라우저 인쇄 → PDF 저장
    } catch (e) { console.error(e); alert('학습지 생성 중 오류가 발생했습니다.'); }
  }

  function init(config) {
    if (_inited) {
      console.warn('Teacher.init 중복 호출 — 데이터만 갱신');
      _subject = config.subject || _subject;
      _curriculum = config.curriculum || _curriculum;
      _lessons = config.lessons || _lessons;
      renderHome();
      return;
    }
    _subject = config.subject;        // { slug: 'g1_math', label: '1학년 수학' }
    _curriculum = config.curriculum || [];
    _lessons = config.lessons || {};
    _inited = true;
    attachEvents();
    renderHome();
  }

  // 노출
  window.Teacher = {
    init: init,
    openShow: openShow,
    backToHome: backToHome,
    exportPptx: exportPptx,
    exportWorksheet: exportWorksheet,
    // 디버깅·확인용 게터
    _debug: function () {
      return {
        subject: _subject,
        currentLessonKey: _currentLessonKey,
        lessonKeys: Object.keys(_lessons),
        slidesLen: _slides.length,
        curIdx: _curIdx
      };
    }
  };
})();
