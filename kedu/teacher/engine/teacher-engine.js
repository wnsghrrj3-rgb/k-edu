/* ========================================================
   케이티처 시스템 엔진 v1
   분리일: 2026-05-14 (slideshow.html v9 → 학년·과목 단위 분리)
   의존: kedu/teacher/표준_*.md (5종 + 산출물_표준.md)
   사용:
     script src="engine/teacher-engine.js"
     script:
       Teacher.init({
         subject: { grade: 1, subject: "수학", title: "1학년 1학기 수학", slug: "g1_math" },
         curriculum: CURRICULUM,
         lessons: LESSONS_DATA
       });
   ======================================================== */

(function(global) {
  'use strict';

  // ===== 시스템 상수 =====
  const TYPE_LABELS = {
    video: "영상", fun_question: "발문", game: "게임", real_world: "실생활",
    extension: "확장", book: "책", tip: "학습팁", misconception: "오개념", other_activity: "다른활동"
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
    motivate: {stage:'도입', block:'motivate', data:{scene_title:'새 도입 상황',kids:[{face:'🙂',label:'(편집)'}],question:'(질문 편집)'}},
    concept: {stage:'전개', block:'concept', data:{title:'새 개념', content:'(개념 설명 편집)'}},
    question: {stage:'전개', block:'question', data:{title:'새 발문', content:'(발문 편집)'}},
    basic_problem: {stage:'기본문제', block:'basic_problem', data:{title:'새 기본 문제', question:'(문제 편집)'}},
    advanced_problem: {stage:'응용문제', block:'advanced_problem', data:{title:'새 응용 문제', challenge:'(문제 편집)'}},
    game: {stage:'응용문제', block:'game', data:{title:'새 활동', steps:['단계 1','단계 2','단계 3']}},
    summary: {stage:'정리', block:'summary', data:{title:'요약', points:['점 1','점 2']}},
    next_lesson: {stage:'정리', block:'next_lesson', data:{title:'다음 시간에는', preview:'(편집)', emoji:''}}
  };
  const STORAGE_VERSION = 1;

  // ===== 외부 주입 자리 =====
  let CURRICULUM = [];
  let LESSONS = {};
  let SUBJECT_INFO = {};

  // ===== 차시별 런타임 자리 =====
  let SLIDES_DATA = [];
  let EXTRAS_DATA = [];
  let STORAGE_KEY = '';
  let currentLessonKey = null;
  let currentLessonMeta = null;
  let slides = [];
  let curIdx = 0;
  let extrasFilter = 'all';
  let saveStatusTimer = null;
  let dragState = null;

  global.interactiveState = global.interactiveState || {};

  // =================== 자동 저장 ===================
  function saveState() {
    if (!STORAGE_KEY) return;
    try {
      const data = {
        v: STORAGE_VERSION,
        ts: Date.now(),
        slides: slides,
        curIdx: curIdx,
        interactiveState: global.interactiveState || {}
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      showSaveStatus(data.ts);
    } catch (e) {
      console.warn('상태 저장 실패:', e);
    }
  }

  function loadState() {
    if (!STORAGE_KEY) return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.v !== STORAGE_VERSION) return false;
      if (!Array.isArray(data.slides) || data.slides.length === 0) return false;
      slides = data.slides;
      curIdx = (typeof data.curIdx === 'number' && data.curIdx >= 0 && data.curIdx < slides.length) ? data.curIdx : 0;
      global.interactiveState = data.interactiveState || {};
      showSaveStatus(data.ts, '이어서 작업');
      return true;
    } catch (e) {
      console.warn('상태 복원 실패:', e);
      return false;
    }
  }

  function clearState() {
    if (!STORAGE_KEY) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function showSaveStatus(ts, label) {
    const el = document.getElementById('save-status');
    const textEl = document.getElementById('save-status-text');
    if (!el || !textEl) return;
    textEl.textContent = label ? `${label} · ${formatTime(ts)}` : `저장됨 · ${formatTime(ts)}`;
    el.classList.add('just-saved');
    if (saveStatusTimer) clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => {
      el.classList.remove('just-saved');
    }, 1400);
  }

  // =================== 공통 유틸 ===================
  function md(text) {
    if (!text) return '';
    return String(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function getExtra(id) { return EXTRAS_DATA.find(e => e.id === id); }

  // =================== 비인터랙티브 시각 ===================
  function renderTenFrame(count, sizeKey = 'md') {
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
        cells += `<rect class="cell${filled}" x="${x}" y="${y}" width="${size}" height="${size}" rx="4"/>`;
      }
    }
    const dx = 2 * size + 1.5 * gap + gap/2;
    const divider = `<line class="divider" x1="${dx}" y1="0" x2="${dx}" y2="${h}"/>`;
    return `<div class="ten-frame"><svg width="${w}" height="${h}" viewBox="-1 -1 ${w+2} ${h+2}" xmlns="http://www.w3.org/2000/svg">${cells}${divider}</svg></div>`;
  }

  function renderStaircase(min, max) {
    const cubeSize = 26;
    let html = '<div class="cube-stairs">';
    for (let n = min; n <= max; n++) {
      let stack = '<div class="cube-stack">';
      for (let i = 0; i < n; i++) stack += `<div class="cube" style="width:${cubeSize}px;height:${cubeSize}px;"></div>`;
      stack += `<div class="cube-label">${n}</div></div>`;
      html += stack;
    }
    return html + '</div>';
  }

  function renderNumberLine(range, anchor) {
    const [min, max] = range;
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
      if (n === anchor - 1) arrow = `<div class="nl-arrow" style="left:${pct}%;">−1</div>`;
      else if (n === anchor + 1) arrow = `<div class="nl-arrow" style="left:${pct}%;">+1</div>`;
      html += `${arrow}<div class="nl-dot ${cls}" style="left:${pct}%;"></div><div class="nl-label" style="left:${pct}%;">${n}</div>`;
    }
    html += '</div></div>';
    return html;
  }

  // =================== 슬라이드 본문 렌더링 ===================
  function renderSlide(slide) {
    const d = slide.data;
    switch (slide.block) {
      case 'cover':
        return `<div class="center"><div class="center-text" style="font-size: clamp(28px, 4.4cqw, 44px);">${md(d.title)}</div></div>`;
      case 'review':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="center-text">${md(d.content)}</div></div>`;
      case 'motivate':
        let kidsHtml = '';
        if (d.kids) kidsHtml = `<div class="scene">${d.kids.map(k => `<div class="kid"><div class="face">${k.face}</div><div class="cards">${k.label}</div></div>`).join('')}</div>`;
        return `<h2>${md(d.scene_title || d.title || '')}</h2><div class="center" style="gap: 36px;">${kidsHtml}${d.question ? `<div class="big-q">${md(d.question)}</div>` : ''}</div>`;
      case 'concept':
        if (d.kids_after) {
          return `<h2>${md(d.title)}</h2><div class="center"><div class="scene">${d.kids_after.map(k => `<div class="kid ${k.dir}"><div class="face">${k.face}</div><div class="cards">${k.label}</div><div class="delta">${k.delta}</div></div>`).join('')}</div></div>`;
        }
        if (d.bidirect) {
          return `<h2>${md(d.title)}</h2><div class="center"><div class="bidirect-card">${d.bidirect.map(line => line === '=' ? '<span class="equals">=</span>' : md(line)).join('<br>')}</div></div>`;
        }
        return `<h2>${md(d.title)}</h2><div class="center"><div class="center-text">${md(d.content || '')}</div></div>`;
      case 'visual_demo':
        if (d.ten_frame_solo) {
          const tf = d.ten_frame_solo;
          return `<h2>${md(d.title)}</h2><div class="center"><div class="tf-item ${tf.is_anchor ? 'anchor' : ''}">${renderTenFrame(tf.count, 'xl')}<div class="tf-num">${tf.count}</div><div class="tf-caption">${md(tf.label || '')}</div></div></div>`;
        }
        if (d.linking_cube_staircase) {
          const [min, max] = d.linking_cube_staircase.range;
          return `<h2>${md(d.title)}</h2><div class="center">${renderStaircase(min, max)}${d.caption ? `<div class="tf-caption" style="margin-top: 16px;">${md(d.caption)}</div>` : ''}</div>`;
        }
        return `<h2>${md(d.title)}</h2>`;
      case 'interactive_ten_frame':
        return renderInteractiveTenFrame(d, slide.id);
      case 'interactive_cube_stairs':
        return renderInteractiveCubeStairs(d, slide.id);
      case 'interactive_number_line':
        return renderInteractiveNumberLine(d, slide.id);
      case 'card_arrange':
        return renderCardArrange(d, slide.id);
      case 'offline_activity':
        return renderOfflineActivity(d);
      case 'compare':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="tf-row">${d.items.map(it => `<div class="tf-item ${it.is_anchor ? 'anchor' : ''}">${renderTenFrame(it.ten_frame, 'md')}<div class="tf-num">${it.num}</div><div class="tf-caption">${md(it.caption)}</div></div>`).join('')}</div></div>`;
      case 'basic_problem':
        let tfHtml = '';
        if (d.ten_frame_anchor !== undefined) tfHtml = `<div class="tf-item anchor">${renderTenFrame(d.ten_frame_anchor, 'lg')}<div class="tf-num">${d.ten_frame_anchor}</div></div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap: 32px;">${tfHtml}<div class="big-q">${md(d.question || '')}</div></div>`;
      case 'real_world':
        if (d.scenario) {
          return `<h2>${md(d.title)}</h2><div class="center"><div class="scenario-card"><div class="sc-icon">${d.scenario.icon}</div><div class="sc-body">${md(d.scenario.body)}</div></div></div>`;
        }
        return `<h2>${md(d.title)}</h2><div class="center"><div class="center-text">${md(d.content || '')}</div></div>`;
      case 'advanced_problem':
        let body = '';
        if (d.context) body += `<div class="center-text" style="font-size: clamp(18px, 2.6cqw, 24px);">${md(d.context)}</div>`;
        if (d.questions) body += `<div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;">${d.questions.map(q => `<div class="big-q">${md(typeof q === 'string' ? q : q.q || '')}</div>`).join('')}</div>`;
        if (d.challenge) body = `<div class="big-q">${md(d.challenge)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap: 28px;">${body}</div>`;
      case 'game':
        return `<h2>${md(d.title)}</h2><div class="center"><ol class="steps-list">${d.steps.map(s => `<li>${md(s)}</li>`).join('')}</ol></div>`;
      case 'summary':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="points-list">${d.points.map(p => `<span class="dot">·</span>${md(p)}`).join('<br>')}</div></div>`;
      case 'question':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="points-list">${md(d.content || '')}</div></div>`;
      case 'next_lesson':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="big-q">${md(d.preview || '')}</div></div>`;
      case 'arrow_flow':
        const flowHtml = d.flow.map((f, i) => {
          const numCls = f.type === 'anchor' ? 'anchor' : (f.type === 'up' ? 'up' : '');
          return `<div class="af-item"><div class="af-num ${numCls}">${f.num}</div><div class="af-label">${md(f.label)}</div></div>${i < d.flow.length - 1 ? '<div class="af-arrow">→</div>' : ''}`;
        }).join('');
        return `<h2>${md(d.title)}</h2><div class="center"><div class="arrow-flow">${flowHtml}</div>${d.sub ? `<div class="small-text">${md(d.sub)}</div>` : ''}</div>`;
      case 'misconception':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="misconception-card"><div class="mc-label">${d.label || '오개념 주의'}</div><div class="mc-wrong">${md(d.wrong)}</div><div class="mc-right" style="margin-top:8px;">${md(d.right)}</div>${d.hint ? `<div style="margin-top:12px; font-size: 0.85em; color: var(--c-text-light);">${md(d.hint)}</div>` : ''}</div></div>`;
      case 'number_line_demo':
        return `<h2>${md(d.title)}</h2><div class="center">${renderNumberLine(d.nl.range, d.nl.anchor)}${d.caption ? `<div class="small-text">${md(d.caption)}</div>` : ''}</div>`;
      default:
        return `<h2>${md(d.title || '새 슬라이드')}</h2><div class="center"><div class="center-text">${md(d.content || '내용을 추가하세요')}</div></div>`;
    }
  }

  // =================== 인터랙티브 5종 ===================
  function getIState(id, initial) {
    if (!global.interactiveState[id]) global.interactiveState[id] = JSON.parse(JSON.stringify(initial));
    return global.interactiveState[id];
  }

  function setIState(id, value) {
    global.interactiveState[id] = value;
    renderCurrentSlide();
    saveState();
  }

  function resetIState(id, initial) {
    global.interactiveState[id] = JSON.parse(JSON.stringify(initial));
    renderCurrentSlide();
    saveState();
  }

  function renderInteractiveTenFrame(d, slideId) {
    const state = getIState(slideId, {count: d.start_count || 0});
    const cells = [];
    const cols = 5, rows = 2;
    const size = 64, gap = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const filled = idx < state.count;
        cells.push(`<div class="i-tf-cell ${filled ? 'filled' : ''}" data-idx="${idx}" style="width:${size}px;height:${size}px;"></div>`);
      }
    }
    const w = cols * size + (cols - 1) * gap;
    const tfWidth = w + 16;
    return `<h2>${md(d.title)}</h2>
      <div class="center">
        <div class="i-tf-grid" id="i-tf-${slideId}" data-slide-id="${slideId}" style="width:${tfWidth}px;">
          ${cells.join('')}
        </div>
        <div class="i-tf-num">${state.count}</div>
        <div class="i-controls">
          <button class="i-btn" data-action="i-tf-minus" data-slide-id="${slideId}">− 하나 빼기</button>
          <button class="i-btn" data-action="i-tf-plus" data-slide-id="${slideId}">+ 하나 더하기</button>
          <button class="i-btn secondary" data-action="i-tf-reset" data-slide-id="${slideId}" data-initial="${d.start_count || 0}">처음으로</button>
        </div>
        ${d.question ? `<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">${md(d.question)}</div>` : ''}
        <div class="small-text" style="font-size: 13px;">💡 칸을 직접 눌러도 되고, 버튼을 눌러도 돼요</div>
      </div>`;
  }

  function renderInteractiveCubeStairs(d, slideId) {
    const state = getIState(slideId, {count: d.start_count || 3});
    const cubeSize = 36;
    let stackHtml = '<div class="i-cube-stack">';
    for (let i = 0; i < state.count; i++) {
      stackHtml += `<div class="i-cube" data-idx="${i}" style="width:${cubeSize}px;height:${cubeSize}px;"></div>`;
    }
    stackHtml += `<div class="i-cube-label">${state.count}</div></div>`;
    return `<h2>${md(d.title)}</h2>
      <div class="center">
        <div class="i-cube-area" id="i-cube-${slideId}" style="min-height: 280px;">
          ${stackHtml}
        </div>
        <div class="i-controls">
          <button class="i-btn" data-action="i-cube-minus" data-slide-id="${slideId}">− 하나 빼기</button>
          <button class="i-btn" data-action="i-cube-plus" data-slide-id="${slideId}">+ 하나 쌓기</button>
          <button class="i-btn secondary" data-action="i-cube-reset" data-slide-id="${slideId}" data-initial="${d.start_count || 3}">처음으로</button>
        </div>
        ${d.question ? `<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">${md(d.question)}</div>` : ''}
      </div>`;
  }

  function renderInteractiveNumberLine(d, slideId) {
    const state = getIState(slideId, {position: d.start || 5});
    const [min, max] = d.range;
    const count = max - min + 1;
    let html = '<div class="i-number-line"><div class="i-nl-line">';
    for (let i = 0; i < count; i++) {
      const n = min + i;
      const pct = (i / (count - 1)) * 100;
      const isCur = n === state.position;
      html += `<div class="i-nl-dot ${isCur ? 'current' : ''}" data-n="${n}" data-slide-id="${slideId}" style="left:${pct}%;"></div>
               <div class="i-nl-label" style="left:${pct}%;">${n}</div>`;
    }
    html += '</div></div>';
    return `<h2>${md(d.title)}</h2>
      <div class="center">
        ${html}
        <div class="i-tf-num">현재 위치: ${state.position}</div>
        <div class="i-controls">
          <button class="i-btn" data-action="i-nl-minus" data-slide-id="${slideId}" data-min="${min}">← 1 작아짐</button>
          <button class="i-btn" data-action="i-nl-plus" data-slide-id="${slideId}" data-max="${max}">1 커짐 →</button>
          <button class="i-btn secondary" data-action="i-nl-reset" data-slide-id="${slideId}" data-initial="${d.start || 5}">처음으로</button>
        </div>
        ${d.question ? `<div class="big-q" style="font-size: clamp(18px, 2.6cqw, 24px); padding: 16px 24px;">${md(d.question)}</div>` : ''}
        <div class="small-text" style="font-size: 13px;">💡 점을 직접 눌러도 되고, 버튼을 눌러도 돼요</div>
      </div>`;
  }

  function renderCardArrange(d, slideId) {
    const initial = d.cards || [3, 1, 5, 2, 4];
    const target = d.target || [...initial].sort((a,b) => a-b);
    const state = getIState(slideId, {order: [...initial]});
    const isCorrect = JSON.stringify(state.order) === JSON.stringify(target);
    const cardsHtml = state.order.map((n, i) =>
      `<div class="i-card" draggable="true" data-n="${n}" data-pos="${i}" data-slide-id="${slideId}">${n}</div>`
    ).join('');
    return `<h2>${md(d.title)}</h2>
      <div class="center">
        <div class="small-text">${md(d.instruction || '카드를 드래그해서 작은 수부터 큰 수 순서로 놓아 보세요.')}</div>
        <div class="i-card-row" id="i-cards-${slideId}" data-slide-id="${slideId}">
          ${cardsHtml}
        </div>
        ${isCorrect ? `<div class="i-success">🎉 잘했어요! 작은 수 → 큰 수 순서로 잘 놓았어요.</div>` : ''}
        <div class="i-controls">
          <button class="i-btn secondary" data-action="i-card-reset" data-slide-id="${slideId}" data-initial='${JSON.stringify(initial)}'>다시 섞기</button>
        </div>
      </div>`;
  }

  function renderOfflineActivity(d) {
    return `<h2>${md(d.title)}</h2>
      <div class="center">
        <div class="i-offline-card">
          <div class="i-offline-tag">${d.tag || '교실에서 함께 해요'}</div>
          <div class="i-offline-icon">${d.icon || '🙋'}</div>
          <div class="i-offline-body">${md(d.body || '')}</div>
          ${d.materials ? `<div class="i-offline-materials"><strong>필요한 것:</strong> ${d.materials}</div>` : ''}
        </div>
      </div>`;
  }

  // =================== 사이드바 — 슬라이드/보조자료/블록 ===================
  function blockShortLabel(block) {
    return ({cover:'표지',review:'복습',motivate:'도입 상황',concept:'개념',visual_demo:'시각 자료',compare:'비교',basic_problem:'기본 문제',advanced_problem:'응용 문제',real_world:'생활 속',game:'활동·놀이',summary:'요약',question:'발문',next_lesson:'다음 차시',arrow_flow:'흐름',misconception:'오개념',number_line_demo:'수직선',interactive_ten_frame:'👆 십 배열판',interactive_cube_stairs:'👆 큐브 쌓기',interactive_number_line:'👆 수직선',card_arrange:'👆 카드 순서',offline_activity:'🙋 교실 활동'})[block] || block;
  }

  function renderSlidesPanel() {
    const panel = document.getElementById('slides-panel');
    let html = '';
    let lastStage = '';
    slides.forEach((s, idx) => {
      if (s.stage !== lastStage) { html += `<div class="stage-label">${s.stage}</div>`; lastStage = s.stage; }
      const cls = (idx === curIdx ? 'current ' : '') + (!s.included ? 'excluded' : '');
      html += `<div class="slide-list-item ${cls}" data-idx="${idx}">
        <div class="checkbox ${s.included ? 'checked' : ''}" data-toggle="1"></div>
        <div class="slide-num">${idx + 1}</div>
        <div class="slide-name">${blockShortLabel(s.block)}</div>
        ${s.attached_extras.length ? `<div class="extra-count">+${s.attached_extras.length}</div>` : ''}
      </div>`;
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.slide-list-item').forEach(el => {
      el.addEventListener('click', e => {
        const idx = parseInt(el.dataset.idx, 10);
        if (e.target.dataset.toggle) {
          slides[idx].included = !slides[idx].included;
        } else {
          if (slides[idx].included) curIdx = idx;
        }
        rebuild();
      });
    });
  }

  function renderExtrasPanel() {
    const filter = document.getElementById('extras-filter');
    const types = Object.keys(TYPE_LABELS);
    filter.innerHTML = `<button class="${extrasFilter === 'all' ? 'active' : ''}" data-type="all">전체</button>` +
      types.map(t => `<button class="${extrasFilter === t ? 'active' : ''}" data-type="${t}">${TYPE_LABELS[t]}</button>`).join('');
    filter.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => { extrasFilter = b.dataset.type; renderExtrasPanel(); });
    });

    const cur = slides[curIdx];
    const attachedIds = new Set(cur.attached_extras);
    const suggestedIds = new Set(cur.suggested_extras || []);
    let list = EXTRAS_DATA.filter(e => extrasFilter === 'all' || e.type === extrasFilter);
    list = [...list.filter(e => suggestedIds.has(e.id)), ...list.filter(e => !suggestedIds.has(e.id))];

    const listEl = document.getElementById('extras-list');
    listEl.innerHTML = list.map(e => {
      const isAttached = attachedIds.has(e.id);
      const isSuggested = suggestedIds.has(e.id);
      return `<div class="extra-card ${isAttached ? 'attached' : ''}" data-extra-id="${e.id}">
        <div class="extra-head">
          <span class="extra-icon">${e.icon}</span>
          <span class="extra-title">${e.title}${isSuggested ? '  ·' : ''}</span>
          <button class="extra-attach">${isAttached ? '뺌' : '끼움'}</button>
        </div>
        <div class="extra-desc">${e.description}</div>
      </div>`;
    }).join('');
    listEl.querySelectorAll('.extra-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.extraId;
        const cur = slides[curIdx];
        if (cur.attached_extras.includes(id)) cur.attached_extras = cur.attached_extras.filter(x => x !== id);
        else cur.attached_extras.push(id);
        rebuild();
      });
    });
  }

  function renderAttachedExtras() {
    const panel = document.getElementById('extras-panel');
    const cur = slides[curIdx];
    if (cur.attached_extras.length === 0) { panel.style.display = 'none'; return; }
    panel.style.display = 'flex';
    let html = '<div class="ep-label">보조자료</div>';
    cur.attached_extras.forEach(id => {
      const e = getExtra(id);
      if (!e) return;
      const previewText = (e.content || e.description || '');
      const preview = previewText.length > 60 ? previewText.slice(0, 60) + '…' : previewText;
      html += `<div class="extra-attached-card" data-extra-id="${id}">
        <div class="ext-head">
          <span class="ext-icon">${e.icon}</span>
          <span class="ext-title">${e.title}</span>
          <span class="ext-remove" data-remove="${id}">×</span>
        </div>
        <div class="ext-content">${preview}</div>
      </div>`;
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.extra-attached-card').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.dataset.remove) {
          const id = e.target.dataset.remove;
          slides[curIdx].attached_extras = slides[curIdx].attached_extras.filter(x => x !== id);
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
        return `<div class="eo-video-frame">
          <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
        </div>
        ${e.description ? `<div class="eo-medium-text" style="margin-top:24px; color:var(--c-text-light); font-size:16px;">${md(e.description)}</div>` : ''}`;
      }
      const searchHint = e.url && e.url.includes('search_query=') ?
        decodeURIComponent(e.url.split('search_query=')[1].replace(/\+/g, ' ')) : '';
      return `<div class="eo-video-search">
        <div class="vs-icon">🔍</div>
        <div class="vs-msg">
          ${e.description ? md(e.description) + '<br><br>' : ''}
          ${searchHint ? `유튜브 검색어: <strong>${searchHint}</strong>` : '유튜브에서 영상 찾기'}
        </div>
        ${e.url ? `<a class="vs-btn" href="${e.url}" target="_blank" rel="noopener">새 탭에서 유튜브 열기 →</a>` : ''}
      </div>`;
    }
    if (e.type === 'book') {
      return `<div class="eo-book">
        <div class="book-icon">📖</div>
        <div class="book-body">
          <div class="eo-medium-text">${md(e.content || e.description || '')}</div>
        </div>
      </div>`;
    }
    if (e.type === 'tip' || e.type === 'misconception') {
      const guideLabel = e.type === 'tip' ? '교사용 학습 가이드' : '교사용 오개념 주의';
      return `<div class="eo-guide">
        <div class="guide-label">${guideLabel}</div>
        <div class="eo-medium-text">${md(e.content || e.description || '')}</div>
      </div>`;
    }
    if (e.type === 'game' || e.type === 'other_activity') {
      if (Array.isArray(e.steps) && e.steps.length > 0) {
        const stepsHtml = e.steps.map(s => `<li>${md(s)}</li>`).join('');
        return `<div class="eo-label">진행 단계</div>
          <ol class="eo-steps">${stepsHtml}</ol>
          ${e.description ? `<div class="eo-divider"></div><div class="eo-medium-text" style="font-size:16px; color:var(--c-text-light);">${md(e.description)}</div>` : ''}`;
      }
      return `<div class="eo-big-text" style="text-align:left;">${md(e.content || e.description || '')}</div>`;
    }
    return `<div class="eo-big-text">${md(e.content || e.description || '')}</div>`;
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
      body += `<div class="eo-source"><span class="src-label">출처</span>${e.source}</div>`;
    }
    document.getElementById('eo-canvas').innerHTML = body;
    document.getElementById('ext-overlay').classList.add('active');
  }

  function closeExtraOverlay() {
    document.getElementById('ext-overlay').classList.remove('active');
    const canvas = document.getElementById('eo-canvas');
    if (canvas) canvas.innerHTML = '';
  }

  // =================== 현재 슬라이드·rebuild·이동 ===================
  function renderCurrentSlide() {
    const cur = slides[curIdx];
    document.getElementById('slide-content').innerHTML = `<div class="slide active ${cur.user_added ? 'user-added' : ''}">${renderSlide(cur)}</div>`;
    const visibleSlides = slides.filter(s => s.included);
    const visIdx = visibleSlides.indexOf(cur);
    document.getElementById('cur-pos').textContent = visIdx + 1;
    document.getElementById('total-pos').textContent = visibleSlides.length;
    document.getElementById('current-stage').textContent = cur.stage;
    document.getElementById('delete-slide-btn').style.display = cur.user_added ? '' : 'none';
    document.getElementById('prev-btn').disabled = visIdx === 0;
    document.getElementById('next-btn').disabled = visIdx === visibleSlides.length - 1;
  }

  function rebuild() {
    if (!slides[curIdx]?.included) {
      const next = slides.findIndex((s, i) => i >= curIdx && s.included);
      if (next >= 0) curIdx = next;
      else {
        const prev = [...slides].reverse().findIndex(s => s.included);
        if (prev >= 0) curIdx = slides.length - 1 - prev;
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
    const visible = slides.map((s, i) => s.included ? i : -1).filter(i => i >= 0);
    const curVisIdx = visible.indexOf(curIdx);
    const nextVisIdx = curVisIdx + delta;
    if (nextVisIdx < 0 || nextVisIdx >= visible.length) return;
    curIdx = visible[nextVisIdx];
    rebuild();
  }

  function toggleFullscreen() {
    document.body.classList.toggle('fullscreen');
  }

  // =================== 차시 선택 홈 ===================
  function renderHome() {
    // 학년·과목 헤더 (홈)
    const homeTitle = document.querySelector('#home-view .home-header h1');
    if (homeTitle && SUBJECT_INFO.title) homeTitle.textContent = SUBJECT_INFO.title;
    const homeSub = document.querySelector('#home-view .home-header .brand');
    if (homeSub && SUBJECT_INFO.brand) homeSub.textContent = SUBJECT_INFO.brand;

    const container = document.getElementById('units-container');
    container.innerHTML = CURRICULUM.map(unit => `
      <div class="unit-block">
        <div class="unit-header">
          <span class="unit-num">${unit.unit}단원</span>
          <h2>${unit.title}</h2>
          <span class="unit-meta">${unit.lesson_count}차시</span>
        </div>
        <div class="lesson-grid">
          ${unit.lessons.map(l => `
            <div class="lesson-card ${l.ready ? 'ready' : 'disabled'}" data-unit="${unit.unit}" data-lesson="${l.n}">
              <div class="lc-head">
                <span class="lc-num">${l.n}차시</span>
              </div>
              <div class="lc-title">${l.title}</div>
              <div class="lc-meta">
                <span class="lc-tag">${l.std}</span>
              </div>
              <div class="lc-concept">${l.concept}</div>
              <div class="lc-status">${l.ready ? '바로 시작' : '준비 중'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    container.querySelectorAll('.lesson-card.ready').forEach(card => {
      card.addEventListener('click', () => {
        openShow(card.dataset.unit, card.dataset.lesson);
      });
    });
  }

  function lessonKey(unit, lesson) {
    return `u${unit}_l${lesson}`;
  }

  function openShow(unit, lesson) {
    const key = lessonKey(unit, lesson);
    const lessonData = LESSONS[key];
    if (!lessonData) {
      console.warn('차시 데이터 없음:', key);
      return;
    }

    currentLessonKey = key;
    currentLessonMeta = lessonData.meta || {};
    SLIDES_DATA = lessonData.slides || [];
    EXTRAS_DATA = lessonData.extras || [];
    STORAGE_KEY = `kedu_teacher_state_${SUBJECT_INFO.slug || 'unknown'}_${key}`;

    updateSidebarHeader(currentLessonMeta);

    document.getElementById('home-view').classList.remove('active');
    document.getElementById('show-view').classList.add('active');

    if (!loadState()) {
      slides = SLIDES_DATA.map(s => ({...s, included: true, attached_extras: []}));
      curIdx = 0;
      global.interactiveState = {};
    }
    rebuild();
  }

  function updateSidebarHeader(meta) {
    const headerEl = document.querySelector('#aside header');
    if (!headerEl) return;
    const grade = meta.grade || SUBJECT_INFO.grade || '';
    const subject = meta.subject || SUBJECT_INFO.subject || '';
    const unit = meta.unit || '';
    const n = meta.n != null ? meta.n : '';
    const title = meta.title || '';
    const std = meta.std || '';
    const duration = meta.duration_min || 40;
    headerEl.innerHTML = `
      <h1>${grade}학년 ${subject} ${unit}단원 ${n}차시</h1>
      <div class="meta">${title}</div>
      <div>
        <span class="tag">${grade}학년</span>
        <span class="tag">${subject}</span>
        ${std ? `<span class="tag">${std}</span>` : ''}
        <span class="tag">${duration}분</span>
      </div>
    `;
  }

  function backToHome() {
    document.getElementById('show-view').classList.remove('active');
    document.getElementById('home-view').classList.add('active');
    if (document.body.classList.contains('fullscreen')) {
      document.body.classList.remove('fullscreen');
    }
  }

  // =================== 이벤트 바인딩 ===================
  function bindEvents() {
    // 사이드바·이동·전체화면
    document.getElementById('toggle-side').addEventListener('click', () => {
      document.getElementById('aside').classList.toggle('collapsed');
    });
    document.getElementById('prev-btn').addEventListener('click', () => go(-1));
    document.getElementById('next-btn').addEventListener('click', () => go(1));
    document.getElementById('full-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('fs-exit-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('back-to-home').addEventListener('click', backToHome);

    // 자료 오버레이 닫기
    document.getElementById('eo-close').addEventListener('click', closeExtraOverlay);
    document.getElementById('ext-overlay').addEventListener('click', e => {
      if (e.target.id === 'ext-overlay' || e.target.classList.contains('ext-overlay-body')) {
        closeExtraOverlay();
      }
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

    // 사이드바 탭
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tab.dataset.tab));
      });
    });

    // 블록 추가
    document.querySelectorAll('.block-card').forEach(c => {
      c.addEventListener('click', () => {
        const type = c.dataset.blockType;
        const template = BLOCK_TEMPLATES[type];
        if (!template) return;
        const newSlide = {
          ...JSON.parse(JSON.stringify(template)),
          id: 'u' + Date.now(),
          included: true,
          attached_extras: [],
          suggested_extras: [],
          user_added: true
        };
        slides.splice(curIdx + 1, 0, newSlide);
        curIdx++;
        rebuild();
      });
    });

    // 사용자 추가 슬라이드 삭제
    document.getElementById('delete-slide-btn').addEventListener('click', () => {
      if (!slides[curIdx].user_added) return;
      if (!confirm('이 슬라이드를 삭제할까요?')) return;
      slides.splice(curIdx, 1);
      if (curIdx >= slides.length) curIdx = slides.length - 1;
      rebuild();
    });

    // 인터랙티브 이벤트 (위임)
    document.addEventListener('click', e => {
      const t = e.target;
      if (t.classList.contains('i-tf-cell')) {
        const grid = t.closest('.i-tf-grid');
        const slideId = grid.dataset.slideId;
        const idx = parseInt(t.dataset.idx, 10);
        const state = global.interactiveState[slideId] || {count: 0};
        const newCount = idx < state.count ? idx : idx + 1;
        setIState(slideId, {count: newCount});
        return;
      }
      if (t.dataset.action === 'i-tf-plus') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || {count: 0};
        if (s.count < 10) setIState(sid, {count: s.count + 1});
        return;
      }
      if (t.dataset.action === 'i-tf-minus') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || {count: 0};
        if (s.count > 0) setIState(sid, {count: s.count - 1});
        return;
      }
      if (t.dataset.action === 'i-tf-reset') {
        resetIState(t.dataset.slideId, {count: parseInt(t.dataset.initial, 10)});
        return;
      }
      if (t.dataset.action === 'i-cube-plus') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || {count: 0};
        if (s.count < 9) setIState(sid, {count: s.count + 1});
        return;
      }
      if (t.dataset.action === 'i-cube-minus') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || {count: 0};
        if (s.count > 0) setIState(sid, {count: s.count - 1});
        return;
      }
      if (t.dataset.action === 'i-cube-reset') {
        resetIState(t.dataset.slideId, {count: parseInt(t.dataset.initial, 10)});
        return;
      }
      if (t.classList.contains('i-nl-dot')) {
        const sid = t.dataset.slideId;
        setIState(sid, {position: parseInt(t.dataset.n, 10)});
        return;
      }
      if (t.dataset.action === 'i-nl-plus') {
        const sid = t.dataset.slideId;
        const max = parseInt(t.dataset.max, 10);
        const s = global.interactiveState[sid] || {position: 5};
        if (s.position < max) setIState(sid, {position: s.position + 1});
        return;
      }
      if (t.dataset.action === 'i-nl-minus') {
        const sid = t.dataset.slideId;
        const min = parseInt(t.dataset.min, 10);
        const s = global.interactiveState[sid] || {position: 5};
        if (s.position > min) setIState(sid, {position: s.position - 1});
        return;
      }
      if (t.dataset.action === 'i-nl-reset') {
        resetIState(t.dataset.slideId, {position: parseInt(t.dataset.initial, 10)});
        return;
      }
      if (t.dataset.action === 'i-card-reset') {
        const initial = JSON.parse(t.dataset.initial);
        const shuffled = [...initial].sort(() => Math.random() - 0.5);
        resetIState(t.dataset.slideId, {order: shuffled});
        return;
      }
    });

    // 수 카드 드래그
    document.addEventListener('dragstart', e => {
      if (!e.target.classList.contains('i-card')) return;
      dragState = {
        slideId: e.target.dataset.slideId,
        fromPos: parseInt(e.target.dataset.pos, 10)
      };
      e.target.classList.add('dragging');
    });
    document.addEventListener('dragend', e => {
      if (e.target.classList.contains('i-card')) e.target.classList.remove('dragging');
    });
    document.addEventListener('dragover', e => {
      if (e.target.classList.contains('i-card')) {
        e.preventDefault();
      }
    });
    document.addEventListener('drop', e => {
      if (!dragState) return;
      if (!e.target.classList.contains('i-card')) return;
      e.preventDefault();
      const toPos = parseInt(e.target.dataset.pos, 10);
      const state = global.interactiveState[dragState.slideId];
      if (!state) return;
      const order = [...state.order];
      [order[dragState.fromPos], order[toPos]] = [order[toPos], order[dragState.fromPos]];
      setIState(dragState.slideId, {order});
      dragState = null;
    });

    // 초기화 버튼
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (!confirm('조립 상태를 처음 자리로 되돌릴까요?\n(끼운 보조자료·추가한 슬라이드·인터랙티브 상태 모두 초기화)')) return;
      clearState();
      slides = SLIDES_DATA.map(s => ({...s, included: true, attached_extras: []}));
      curIdx = 0;
      global.interactiveState = {};
      rebuild();
    });

    // 페이지 떠나기 전 안전망
    window.addEventListener('beforeunload', () => {
      if (document.getElementById('show-view').classList.contains('active')) {
        saveState();
      }
    });
  }

  // =================== 공개 API ===================
  global.Teacher = {
    init(config) {
      CURRICULUM = config.curriculum || [];
      LESSONS = config.lessons || {};
      SUBJECT_INFO = config.subject || {};
      renderHome();
      bindEvents();
    },
    // 디버그·외부 호출용
    openShow,
    backToHome
  };

})(window);
