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
  function getExtraTypeLabel(e) {
    if (!e) return '';
    if (e.type === 'game') {
      return e.game_kind ? '게임' : '교실 활동';
    }
    return EXTRA_TYPE_FULL_LABEL[e.type] || e.type;
  }
  function getExtraIconFallback(e) {
    if (!e) return '';
    if (e.icon) return e.icon;
    if (e.type === 'game') return e.game_kind ? '🎮' : '🙋';
    return '';
  }
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

  // =================== 신규 렌더 헬퍼 ===================

  function renderEmojiCount(emoji, count) {
    const items = Array.from({length: count}, () => `<span class="big-emoji">${emoji}</span>`).join('');
    return `<div class="emoji-count">${items}</div>`;
  }

  function renderDots(count) {
    const dots = Array.from({length: count}, () => '<span class="dot-mark">●</span>').join('');
    return `<div class="dot-row">${dots}</div>`;
  }

  function renderTenFrameStrip(arr) {
    // arr 자리 = [1..9] 같은 수 자리 → 각 칸 자리 작은 ten_frame
    return `<div class="tf-strip">${arr.map(n => `<div class="tfs-item">${renderTenFrame(n, 'sm')}<div class="tfs-num">${n}</div></div>`).join('')}</div>`;
  }

  function renderLinkingCubeSingle(count) {
    const cubeSize = 28;
    let stack = '<div class="cube-stack-single">';
    for (let i = 0; i < count; i++) stack += `<div class="cube" style="width:${cubeSize}px;height:${cubeSize}px;"></div>`;
    stack += `<div class="cube-label">${count}</div></div>`;
    return stack;
  }

  function renderTraceNumber(n) {
    return `<div class="trace-num">
      <div class="trace-num-outline">${n}</div>
      <div class="trace-num-arrows">↘</div>
      <div class="trace-num-label">${n}</div>
    </div>`;
  }

  function renderSequenceNumbers(seq, highlight_pos) {
    return `<div class="seq-numbers">${seq.map((s, i) => {
      const isHighlight = highlight_pos !== undefined && i === highlight_pos;
      const isBlank = s === '?' || s === null || s === '';
      return `<span class="seq-cell ${isBlank ? 'blank' : ''} ${isHighlight ? 'highlight' : ''}">${isBlank ? '?' : s}</span>`;
    }).join('<span class="seq-arrow">→</span>')}</div>`;
  }

  function renderTableNumKorHan(table) {
    if (!table || !table.length) return '';
    const hasKorHan = table[0].kor !== undefined || table[0].han !== undefined;
    if (hasKorHan) {
      return `<table class="num-table">
        <thead><tr><th>수</th><th>우리말</th><th>한자어</th></tr></thead>
        <tbody>${table.map(r => `<tr><td class="nt-num">${r.num}</td><td>${r.kor || ''}</td><td>${r.han || ''}</td></tr>`).join('')}</tbody>
      </table>`;
    }
    // 일반 표 자리
    const keys = Object.keys(table[0]);
    return `<table class="num-table">
      <thead><tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr></thead>
      <tbody>${table.map(r => `<tr>${keys.map(k => `<td>${r[k]}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
  }

  // ===== 자리 자리 (수업 자리 정답 토글 자리) =====
  const MARKERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < (str || '').length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) || 1;
  }

  function seededShuffleIdx(n, seed) {
    let s = seed || 1;
    const arr = Array.from({length: n}, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderMatchLeft(p) {
    if (p.ten_frame !== undefined) return renderTenFrame(p.ten_frame, 'sm');
    if (p.emoji) return `<div class="mp-emoji">${p.emoji}</div>`;
    if (p.label) return `<div class="mp-text">${p.label}</div>`;
    return '';
  }

  function renderMatchRight(p) {
    if (p.num !== undefined) return `<div class="mp-num">${p.num}</div>`;
    if (p.kind) return `<div class="mp-kind">${p.kind}</div>`;
    return '';
  }

  function renderMatchPairs(pairs, type, revealed, seed) {
    if (!pairs || !pairs.length) return '';
    if (revealed) {
      return `<div class="match-pairs revealed">${pairs.map(p => {
        return `<div class="match-pair revealed"><div class="mp-left">${renderMatchLeft(p)}</div><div class="mp-arrow">↔</div><div class="mp-right">${renderMatchRight(p)}</div></div>`;
      }).join('')}</div>`;
    }
    // 자리 자리: 왼쪽 자리 자리 + 오른쪽 자리 섞임 (seed 자리 안정 자리)
    const shuf = seededShuffleIdx(pairs.length, seed);
    return `<div class="match-cols">
      <div class="match-col">
        <div class="match-col-label">사물</div>
        ${pairs.map(p => `<div class="match-cell">${renderMatchLeft(p)}</div>`).join('')}
      </div>
      <div class="match-col">
        <div class="match-col-label">숫자</div>
        ${shuf.map(i => `<div class="match-cell match-cell-right">${renderMatchRight(pairs[i])}</div>`).join('')}
      </div>
    </div>`;
  }

  function renderOptions(options, isMulti, revealed) {
    if (!options || !options.length) return '';
    return `<div class="options-grid ${isMulti ? 'multi' : ''} ${revealed ? 'revealed' : ''}">${options.map((opt, i) => {
      let body = '';
      if (opt.emoji && opt.count !== undefined) {
        body = `<div class="opt-emojis">${Array.from({length: opt.count}, () => opt.emoji).join('')}</div>`;
      } else if (opt.ten_frame !== undefined) {
        body = renderTenFrame(opt.ten_frame, 'sm');
      } else if (opt.label) {
        body = `<div class="opt-label">${md(opt.label)}</div>`;
      } else if (opt.num !== undefined) {
        body = `<div class="opt-num">${opt.num}</div>`;
      }
      const isCorrect = !!opt.correct;
      const cls = `opt-card${revealed && isCorrect ? ' correct' : ''}`;
      const marker = isMulti
        ? (revealed && isCorrect ? '☑' : '☐')
        : MARKERS[i] || (i + 1);
      return `<div class="${cls}" data-opt-idx="${i}" ${isCorrect ? 'data-correct="true"' : ''}>
        <div class="opt-marker">${marker}</div>
        ${body}
      </div>`;
    }).join('')}</div>`;
  }

  // =================== 슬라이드 본문 렌더링 ===================
  function slideHasAnswer(slide) {
    if (!slide || !slide.block) return false;
    return ['basic_problem', 'advanced_problem', 'match', 'multi', 'concept'].includes(slide.block) && hasAnswerData(slide);
  }

  function hasAnswerData(slide) {
    const d = slide.data || {};
    if (slide.block === 'basic_problem' || slide.block === 'advanced_problem') {
      return d.answer !== undefined || (d.answers && d.answers.length) || (d.options && d.options.some(o => o.correct));
    }
    if (slide.block === 'match') return !!(d.pairs && d.pairs.length);
    if (slide.block === 'multi') return !!(d.options && d.options.some(o => o.correct));
    if (slide.block === 'concept') return !!(d.pairs && d.pairs.length); // 짝짓기 자리 자리
    return false;
  }

  // =================== 국어 케이티처 블록 (교사주도, 로깅 없음) ===================
  // card_quiz — 동기유발 카드 뒤집기 (교사 클릭으로 정답 공개)
  function renderCardQuiz(d, sid) {
    const cards = d.cards || [];
    const st = getIState(sid, { flipped: cards.map(function () { return false; }) });
    const grid = cards.map(function (c, i) {
      const on = st.flipped[i];
      return '<div class="kt-cq-card' + (on ? ' flipped' : '') + '" data-action="kt-flip" data-slide-id="' + sid + '" data-ci="' + i + '">'
        + '<div class="kt-cq-inner">'
        + '<div class="kt-cq-face kt-cq-front"><div class="kt-cq-q">?</div><div class="kt-cq-clue">' + md(c.clue || '') + '</div></div>'
        + '<div class="kt-cq-face kt-cq-back"><div class="kt-cq-emoji">' + (c.emoji || '') + '</div><div class="kt-cq-name">' + md(c.name || '') + '</div></div>'
        + '</div></div>';
    }).join('');
    return '<h2>' + md(d.title || '') + '</h2>' + (d.sub ? '<p class="kt-sub">' + md(d.sub) + '</p>' : '')
      + '<div class="center" style="gap:22px;"><div class="kt-cq-grid">' + grid + '</div>'
      + (d.outro ? '<div class="kt-outro">' + md(d.outro) + '</div>' : '') + '</div>';
  }

  // read_aloud — 그림책/글 읽어주기 (교재 본문 미게재 · placeholder + 페이지 안내 · 저작권 안전선)
  function renderReadAloud(d, sid) {
    const pages = d.pages || [];
    const st = getIState(sid, { page: 0 });
    const p = Math.max(0, Math.min(st.page, pages.length - 1));
    const cur = pages[p] || {};
    const dots = pages.map(function (_, i) { return '<span class="kt-dot' + (i === p ? ' on' : '') + '"></span>'; }).join('');
    return '<h2>' + md(d.title || '') + '</h2>' + (d.author ? '<p class="kt-sub">' + md(d.author) + '</p>' : '')
      + '<div class="center" style="gap:14px;">'
      + '<div class="kt-ra-counter"><b>' + (p + 1) + '</b> / ' + pages.length + ' 쪽</div>'
      + '<div class="kt-ra-frame"><div class="image-placeholder" data-prompt="' + (cur.img_hint || '교재 그림') + '">📖 교재 그림 자리<br><span>교사가 교재 사진을 보여 주세요</span></div></div>'
      + (cur.quote ? '<div class="kt-ra-quote">' + md(cur.quote) + '</div>' : '')
      + '<div class="kt-ra-controls">'
      + '<button class="i-btn" data-action="kt-ra-prev" data-slide-id="' + sid + '"' + (p === 0 ? ' disabled' : '') + '>◀ 이전</button>'
      + '<div class="kt-dots">' + dots + '</div>'
      + '<button class="i-btn coral" data-action="kt-ra-next" data-slide-id="' + sid + '"' + (p === pages.length - 1 ? ' disabled' : '') + '>다음 ▶</button>'
      + '</div>'
      + (d.copyright ? '<div class="kt-copyright">' + md(d.copyright) + '</div>' : '')
      + '</div>';
  }

  // chosung_quiz — 초성 퀴즈 (교사 클릭으로 정답 공개, 문항 네비)
  function renderChosungQuiz(d, sid) {
    const items = d.items || [];
    const st = getIState(sid, { idx: 0, revealed: false });
    const i = Math.max(0, Math.min(st.idx, items.length - 1));
    const q = items[i] || {};
    return '<h2>' + md(d.title || '') + '</h2>' + (d.sub ? '<p class="kt-sub">' + md(d.sub) + '</p>' : '')
      + '<div class="center" style="gap:18px;">'
      + '<div class="kt-cz-counter"><b>' + (i + 1) + '</b> / ' + items.length + ' 문제</div>'
      + '<div class="kt-cz-chosung' + (st.revealed ? ' answered' : '') + '">' + (st.revealed ? (q.emoji || '') + ' ' + md(q.answer || '') : md(q.chosung || '')) + '</div>'
      + (q.hint ? '<div class="kt-cz-hint">' + md(q.hint) + '</div>' : '')
      + '<div class="kt-cz-controls">'
      + '<button class="i-btn coral" data-action="kt-cz-reveal" data-slide-id="' + sid + '">' + (st.revealed ? '🙈 다시 숨기기' : '정답 보기 ✨') + '</button>'
      + '<button class="i-btn" data-action="kt-cz-prev" data-slide-id="' + sid + '"' + (i === 0 ? ' disabled' : '') + '>◀ 이전</button>'
      + '<button class="i-btn" data-action="kt-cz-next" data-slide-id="' + sid + '"' + (i === items.length - 1 ? ' disabled' : '') + '>다음 ▶</button>'
      + '</div></div>';
  }

  // present — 호명 발표 (무작위 뽑기, 중복 방지). 반 명단은 교사가 data.names로 채우거나 번호 기본
  function renderPresent(d, sid) {
    const count = d.count || (d.names ? d.names.length : 24);
    const label = function (n) { return (d.names && d.names[n]) ? md(d.names[n]) : (n + 1) + '번 친구'; };
    const st = getIState(sid, { picked: [], current: null });
    const done = st.picked.length >= count;
    let card;
    if (done) {
      card = '<div class="kt-pr-end"><div class="kt-pr-big">🎉 모두 발표했어요! 🎉</div><div class="kt-pr-sub">' + md(d.end_msg || '우리 반 친구들 이야기를 모두 들어봤어요.') + '</div></div>';
    } else if (st.current === null) {
      card = '<div class="kt-pr-card"><div class="kt-pr-pl">🎤 발표할 친구</div><div class="kt-pr-name">?</div><div class="kt-pr-hint">' + md(d.hint || '버튼을 눌러 발표할 친구를 뽑아요') + '</div></div>';
    } else {
      card = '<div class="kt-pr-card on"><div class="kt-pr-pl">🎤 발표할 친구</div><div class="kt-pr-name pop">' + label(st.current) + '</div><div class="kt-pr-hint">' + md(d.hint || '') + '</div></div>';
    }
    return '<h2>' + md(d.title || '') + '</h2>' + (d.sub ? '<p class="kt-sub">' + md(d.sub) + '</p>' : '')
      + '<div class="center" style="gap:18px;">'
      + '<div class="kt-pr-counter"><b>' + st.picked.length + '</b> / ' + count + ' 명</div>'
      + card
      + '<div class="kt-pr-controls">'
      + (done ? '' : '<button class="i-btn coral" data-action="kt-pr-next" data-slide-id="' + sid + '" data-count="' + count + '">' + (st.current === null ? '첫 친구 뽑기 🎲' : '다음 친구 🎲') + '</button>')
      + '<button class="i-btn secondary" data-action="kt-pr-reset" data-slide-id="' + sid + '">처음부터</button>'
      + '</div></div>';
  }

  function renderSlide(slide) {
    const d = slide.data;
    const revealed = !!slide.revealed;
    const seed = hashSeed(slide.id || '');
    switch (slide.block) {
      case 'cover':
        return `<div class="center"><div class="center-text" style="font-size: clamp(28px, 4.4cqw, 44px);">${md(d.title)}</div></div>`;

      case 'review': {
        let body = '';
        if (d.content) body += `<div class="center-text">${md(d.content)}</div>`;
        if (d.desc) body += `<div class="center-text">${md(d.desc)}</div>`;
        // L0-① 전시학습 상기 문항형: d.items 있으면 탭→정답 카드(기존 kt-flip 재사용). from=출처 차시 계보(렌더 안 함).
        if (d.items) {
          const stRv = getIState(slide.id, { flipped: d.items.map(function () { return false; }) });
          body += `<div class="kt-rv-grid">${d.items.map((it, i) => {
            const on = !!(stRv.flipped && stRv.flipped[i]);
            return `<div class="kt-rv-card${on ? ' on' : ''}" data-action="kt-flip" data-slide-id="${slide.id}" data-ci="${i}"><div class="kt-rv-q">${md(it.q || '')}</div><div class="kt-rv-a">${on ? md(String(it.a !== undefined ? it.a : '')) : '❓ 눌러서 확인'}</div></div>`;
          }).join('')}</div>`;
        }
        if (d.table) body += renderTableNumKorHan(d.table);
        if (d.sequence) body += renderSequenceNumbers(d.sequence);
        if (d.ten_frame_strip) body += renderTenFrameStrip(d.ten_frame_strip);
        if (d.areas) body += `<div class="areas-list">${d.areas.map(a => `<div class="area-item">${md(a)}</div>`).join('')}</div>`;
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}</div>`;
      }

      case 'objective': {
        const main = d.content || d.desc || '';
        return `<h2>${md(d.title)}</h2><div class="center"><div class="objective-card">${md(main)}</div></div>`;
      }

      case 'motivate': {
        let body = '';
        if (d.img) body += `<div class="kt-scene-img"><img src="${d.img}" alt="" loading="lazy" onerror="var p=this.closest('.kt-scene-img'); if(p)p.style.display='none'"></div>`;
        if (d.desc) body += `<div class="motivate-desc">${md(d.desc)}</div>`;
        if (d.emojis) body += `<div class="emoji-row">${d.emojis.map(e => `<span class="big-emoji">${e}</span>`).join('')}</div>`;
        if (d.emoji && d.count !== undefined) body += renderEmojiCount(d.emoji, d.count);
        if (d.kids) body += `<div class="scene">${d.kids.map(k => `<div class="kid"><div class="face">${k.face}</div><div class="cards">${k.label || ''}</div></div>`).join('')}</div>`;
        if (d.scene) body += `<div class="scene-text">${md(d.scene)}</div>`;
        if (d.teams) body += `<div class="teams">${d.teams.map(t => `<div class="team"><div class="team-name">${md(t.name || '')}</div>${t.emoji && t.count !== undefined ? renderEmojiCount(t.emoji, t.count) : ''}</div>`).join('')}</div>`;
        if (d.number_panel) body += `<div class="number-panel">${d.number_panel.map(n => `<span class="np-cell">${n}</span>`).join('')}</div>`;
        if (d.question) body += `<div class="big-q">${md(d.question)}</div>`;
        return `<h2>${md(d.scene_title || d.title || '')}</h2><div class="center" style="gap:28px;">${body}</div>`;
      }

      case 'concept': {
        let body = '';
        if (d.img) body += `<div class="kt-scene-img"><img src="${d.img}" alt="" loading="lazy" onerror="var p=this.closest('.kt-scene-img'); if(p)p.style.display='none'"></div>`;
        if (d.content) body += `<div class="center-text">${md(d.content)}</div>`;
        if (d.kids_after) body += `<div class="scene">${d.kids_after.map(k => `<div class="kid ${k.dir || ''}"><div class="face">${k.face}</div><div class="cards">${k.label || ''}</div>${k.delta ? `<div class="delta">${k.delta}</div>` : ''}</div>`).join('')}</div>`;
        if (d.items) {
          body += `<div class="tf-row">${d.items.map(it => {
            let visual = '';
            if (it.ten_frame !== undefined) visual = renderTenFrame(it.ten_frame, 'md');
            else if (it.linking_cube !== undefined) visual = renderLinkingCubeSingle(it.linking_cube);
            else if (it.emoji && it.count !== undefined) visual = renderEmojiCount(it.emoji, it.count);
            else if (it.dots !== undefined) visual = renderDots(it.dots);
            return `<div class="tf-item">${visual}${it.num !== undefined ? `<div class="tf-num">${it.num}</div>` : ''}<div class="tf-caption">${md(it.label || '')}</div>${it.note ? `<div class="small-text">${md(it.note)}</div>` : ''}</div>`;
          }).join('')}</div>`;
        }
        if (d.bidirect) body += `<div class="bidirect-card">${d.bidirect.map(line => line === '=' ? '<span class="equals">=</span>' : md(line)).join('<br>')}</div>`;
        if (d.examples) body += `<div class="examples-grid">${d.examples.map(e => `<div class="ex-item">${md(typeof e === 'string' ? e : e.label || '')}</div>`).join('')}</div>`;
        if (d.pairs) body += renderMatchPairs(d.pairs, 'static', revealed, seed);
        if (d.ordinal_map) body += `<div class="ordinals-row">${d.ordinal_map.map(o => `<div class="ord-item"><span class="ord-num">${o.num || ''}</span><span class="ord-label">${md(o.label || '')}</span></div>`).join('')}</div>`;
        if (d.linking_cube_staircase) body += renderStaircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]);
        if (d.sequence) body += renderSequenceNumbers(d.sequence);
        if (d.expression) body += `<div class="big-q">${md(d.expression)}</div>`;
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:24px;">${body}</div>`;
      }

      case 'visual_demo': {
        let body = '';
        if (d.ten_frame_solo) {
          const tf = d.ten_frame_solo;
          body += `<div class="tf-item ${tf.is_anchor ? 'anchor' : ''}">${renderTenFrame(tf.count, 'xl')}<div class="tf-num">${tf.count}</div><div class="tf-caption">${md(tf.label || '')}</div></div>`;
        }
        if (d.linking_cube_staircase) body += renderStaircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]);
        if (d.left && d.right) body += `<div class="compare-cols"><div class="cmp-col">${md(typeof d.left === 'object' ? (d.left.label || '') : d.left)}</div><div class="cmp-sep">vs</div><div class="cmp-col">${md(typeof d.right === 'object' ? (d.right.label || '') : d.right)}</div></div>`;
        if (d.caption) body += `<div class="tf-caption" style="margin-top:8px;">${md(d.caption)}</div>`;
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:24px;">${body}</div>`;
      }

      case 'trace': {
        const traceN = d.trace_numbers || [];
        return `<h2>${md(d.title)}</h2><div class="center"><div class="trace-row">${traceN.map(n => renderTraceNumber(n)).join('')}</div>${d.note ? `<div class="small-text" style="margin-top:16px;">${md(d.note)}</div>` : ''}</div>`;
      }

      case 'interactive_ten_frame':
        return renderInteractiveTenFrame(d, slide.id);
      case 'interactive_cube_stairs':
        return renderInteractiveCubeStairs(d, slide.id);
      case 'interactive_number_line':
        return renderInteractiveNumberLine(d, slide.id);
      case 'klab':
      case 'math_tool':
        return (d.title ? `<h2>${md(d.title)}</h2>` : '') + `<div class="klab-mount" data-tool="${d.tool || ''}" data-config="${encodeURIComponent(JSON.stringify(d.config || {}))}" style="width:100%;"></div>`;
      case 'quiz_gen':
        return (d.title ? `<h2>${md(d.title)}</h2>` : '') + `<div class="kquiz-mount" data-lesson="${d.lesson || ''}" data-config="${encodeURIComponent(JSON.stringify({ n: d.count || 5, difficulty: d.difficulty || [1, 2] }))}" style="width:100%;"></div>`;
      case 'activity':
        return `<div class="kact-mount" data-config="${encodeURIComponent(JSON.stringify(d || {}))}" style="width:100%;"></div>`;
      case 'card_arrange':
        return renderCardArrange(d, slide.id);
      case 'offline_activity':
        return renderOfflineActivity(d);

      case 'compare': {
        let body = '';
        if (d.items) body += `<div class="tf-row">${d.items.map(it => `<div class="tf-item ${it.is_anchor ? 'anchor' : ''}">${it.ten_frame !== undefined ? renderTenFrame(it.ten_frame, 'md') : (it.emoji && it.count !== undefined ? renderEmojiCount(it.emoji, it.count) : '')}${it.num !== undefined ? `<div class="tf-num">${it.num}</div>` : ''}<div class="tf-caption">${md(it.caption || it.label || '')}</div></div>`).join('')}</div>`;
        if (d.left && d.right) body += `<div class="compare-cols"><div class="cmp-col">${md(typeof d.left === 'object' ? (d.left.label || '') : d.left)}</div><div class="cmp-sep">vs</div><div class="cmp-col">${md(typeof d.right === 'object' ? (d.right.label || '') : d.right)}</div></div>`;
        if (d.target !== undefined) body += `<div class="match-target"><span class="mt-label">기준</span><span class="mt-num">${d.target}</span></div>`;
        if (d.contrast) body += `<div class="center-text">${md(d.contrast)}</div>`;
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:24px;">${body}</div>`;
      }

      case 'basic_problem': {
        let body = '';
        if (d.ten_frame_anchor !== undefined) body += `<div class="tf-item anchor">${renderTenFrame(d.ten_frame_anchor, 'lg')}<div class="tf-num">${d.ten_frame_anchor}</div></div>`;
        if (d.ten_frame !== undefined) body += `<div class="tf-item anchor">${renderTenFrame(d.ten_frame, 'lg')}<div class="tf-num">${d.ten_frame}</div></div>`;
        if (d.linking_cube !== undefined) body += renderLinkingCubeSingle(d.linking_cube);
        if (d.emoji && d.count !== undefined) body += renderEmojiCount(d.emoji, d.count);
        if (d.items) body += `<div class="tf-row">${d.items.map(it => `<div class="tf-item">${it.ten_frame !== undefined ? renderTenFrame(it.ten_frame, 'md') : (it.emoji && it.count !== undefined ? renderEmojiCount(it.emoji, it.count) : '')}${it.num !== undefined ? `<div class="tf-num">${it.num}</div>` : ''}<div class="tf-caption">${md(it.label || '')}</div></div>`).join('')}</div>`;
        if (d.sequence) body += renderSequenceNumbers(d.sequence, d.highlight_pos);
        if (d.cards) body += `<div class="num-cards">${d.cards.map(c => `<span class="num-card">${c}</span>`).join('')}</div>`;
        if (d.scenario) body += `<div class="scenario-card"><div class="sc-icon">${d.scenario.icon || ''}</div><div class="sc-body">${md(d.scenario.body || '')}</div></div>`;
        if (d.question) body += `<div class="big-q">${md(d.question)}</div>`;
        if (d.input === 'count_input' && (d.answer !== undefined || d.answers)) {
          const ans = d.answer !== undefined ? d.answer : (d.answers && d.answers[0]);
          body += `<div class="answer-input ${revealed ? 'revealed' : ''}"><span class="ai-label">답</span><div class="ai-box">${revealed ? ans : '?'}</div></div>`;
        }
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:24px;">${body}</div>`;
      }

      case 'match': {
        let body = '';
        if (d.target !== undefined) body += `<div class="match-target"><span class="mt-label">기준</span><span class="mt-num">${d.target}</span></div>`;
        if (d.pairs) body += renderMatchPairs(d.pairs, d.type || 'touch_match', revealed, seed);
        if (d.options) body += renderOptions(d.options, false, revealed);
        if (d.left && d.right && Array.isArray(d.left)) {
          body += `<div class="match-cols"><div class="match-col">${d.left.map(l => `<div class="match-cell">${md(typeof l === 'string' ? l : l.label || '')}</div>`).join('')}</div><div class="match-col">${d.right.map(r => `<div class="match-cell">${md(typeof r === 'string' ? r : r.label || '')}</div>`).join('')}</div></div>`;
        }
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}</div>`;
      }

      case 'multi': {
        const body = renderOptions(d.options || [], true, revealed);
        const hint = `<div class="multi-hint">정답을 모두 골라요${d.expectedCount ? ` <span class="mh-count">${d.expectedCount}개</span>` : ''}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}${hint}${d.note ? `<div class="small-text">${md(d.note)}</div>` : ''}</div>`;
      }

      case 'real_world': {
        let body = '';
        if (d.scenario) body += `<div class="scenario-card"><div class="sc-icon">${d.scenario.icon || ''}</div><div class="sc-body">${md(d.scenario.body || '')}</div></div>`;
        if (d.desc) body += `<div class="center-text">${md(d.desc)}</div>`;
        if (d.content) body += `<div class="center-text">${md(d.content)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}</div>`;
      }

      case 'advanced_problem': {
        let body = '';
        if (d.context) body += `<div class="context-text">${md(d.context)}</div>`;
        if (d.card !== undefined) body += `<div class="num-card-big">${d.card}</div>`;
        if (d.options) body += renderOptions(d.options, false, revealed);
        if (d.sequence) body += renderSequenceNumbers(d.sequence);
        if (d.target !== undefined && d.component === 'ten_frame') body += `<div class="tf-target"><div class="tt-empty-frame">${renderTenFrame(0, 'lg')}</div><div class="tt-num">목표 ${d.target}</div></div>`;
        if (d.scenario) body += `<div class="scenario-card"><div class="sc-icon">${d.scenario.icon || ''}</div><div class="sc-body">${md(d.scenario.body || '')}</div></div>`;
        if (d.items) body += `<div class="tf-row">${d.items.map(it => `<div class="tf-item">${it.ten_frame !== undefined ? renderTenFrame(it.ten_frame, 'md') : ''}${it.num !== undefined ? `<div class="tf-num">${it.num}</div>` : ''}<div class="tf-caption">${md(it.label || '')}</div></div>`).join('')}</div>`;
        if (d.questions) body += `<div class="q-list">${d.questions.map(q => `<div class="big-q">${md(typeof q === 'string' ? q : q.q || '')}</div>`).join('')}</div>`;
        if (d.challenge) body += `<div class="big-q">${md(d.challenge)}</div>`;
        if (d.input === 'count_input' && (d.answer !== undefined || d.answers)) {
          const ans = d.answer !== undefined ? d.answer : (d.answers && d.answers[0]);
          body += `<div class="answer-input ${revealed ? 'revealed' : ''}"><span class="ai-label">답</span><div class="ai-box">${revealed ? ans : '?'}</div></div>`;
        }
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:24px;">${body}</div>`;
      }

      case 'game':
        return `<h2>${md(d.title)}</h2><div class="center"><ol class="steps-list">${(d.steps || []).map(s => `<li>${md(s)}</li>`).join('')}</ol></div>`;

      case 'summary': {
        let body = '';
        if (d.table) body += renderTableNumKorHan(d.table);
        if (d.ten_frame_strip) body += renderTenFrameStrip(d.ten_frame_strip);
        if (d.bidirect) body += `<div class="bidirect-card">${d.bidirect.map(line => line === '=' ? '<span class="equals">=</span>' : md(line)).join('<br>')}</div>`;
        if (d.linking_cube_staircase) body += renderStaircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]);
        if (d.sequence_asc) body += `<div class="seq-block"><div class="seq-label">작은 수 → 큰 수</div>${renderSequenceNumbers(d.sequence_asc)}</div>`;
        if (d.sequence_desc) body += `<div class="seq-block"><div class="seq-label">큰 수 → 작은 수</div>${renderSequenceNumbers(d.sequence_desc)}</div>`;
        if (d.sequence) body += renderSequenceNumbers(d.sequence);
        if (d.ordinals) body += `<div class="ordinals-row">${d.ordinals.map(o => `<div class="ord-item">${md(typeof o === 'string' ? o : o.label || '')}</div>`).join('')}</div>`;
        if (d.arrows) body += `<div class="arrow-flow-summary">${d.arrows.map((a, i) => `<span class="afs-item">${md(a)}</span>${i < d.arrows.length - 1 ? '<span class="afs-arr">→</span>' : ''}`).join('')}</div>`;
        if (d.points) body += `<div class="points-list">${d.points.map(p => `<div class="point-item"><span class="dot">·</span>${md(p)}</div>`).join('')}</div>`;
        if (d.questions) body += `<div class="q-list">${d.questions.map(q => `<div class="big-q">${md(typeof q === 'string' ? q : q.q || '')}</div>`).join('')}</div>`;
        if (d.legend) body += `<div class="small-text">${md(d.legend)}</div>`;
        if (d.desc) body += `<div class="center-text">${md(d.desc)}</div>`;
        if (d.note) body += `<div class="small-text">${md(d.note)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}</div>`;
      }

      case 'question':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="big-q">${md(d.content || '')}</div></div>`;

      case 'self_assessment': {
        const items = d.items || d.dimensions || [];
        const stars = d.starsPerDimension || d.stars || 3;
        let body = '';
        body += `<div class="sa-list">${items.map(it => `<div class="sa-row"><span class="sa-label">${md(typeof it === 'string' ? it : (it.label || ''))}</span><span class="sa-stars">${'☆'.repeat(stars)}</span></div>`).join('')}</div>`;
        if (d.prompts) body += `<div class="sa-prompts">${d.prompts.map(p => `<div class="sa-prompt">${md(p)}</div>`).join('')}</div>`;
        if (d.question) body += `<div class="big-q">${md(d.question)}</div>`;
        if (d.preview_slide) body += `<div class="small-text" style="margin-top:8px;">${md(d.preview_slide)}</div>`;
        if (d.desc) body += `<div class="center-text">${md(d.desc)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:20px;">${body}</div>`;
      }

      case 'next_lesson': {
        let body = '';
        if (d.preview) body += `<div class="big-q">${md(d.preview)}</div>`;
        if (d.desc) body += `<div class="center-text">${md(d.desc)}</div>`;
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:16px;">${body}</div>`;
      }

      case 'card_quiz':
        return renderCardQuiz(d, slide.id);
      case 'read_aloud':
        return renderReadAloud(d, slide.id);
      case 'chosung_quiz':
        return renderChosungQuiz(d, slide.id);
      case 'present':
        return renderPresent(d, slide.id);

      case 'arrow_flow': {
        const flowHtml = d.flow.map((f, i) => {
          const numCls = f.type === 'anchor' ? 'anchor' : (f.type === 'up' ? 'up' : '');
          return `<div class="af-item"><div class="af-num ${numCls}">${f.num}</div><div class="af-label">${md(f.label)}</div></div>${i < d.flow.length - 1 ? '<div class="af-arrow">→</div>' : ''}`;
        }).join('');
        return `<h2>${md(d.title)}</h2><div class="center"><div class="arrow-flow">${flowHtml}</div>${d.sub ? `<div class="small-text">${md(d.sub)}</div>` : ''}</div>`;
      }

      case 'misconception':
        return `<h2>${md(d.title)}</h2><div class="center"><div class="misconception-card"><div class="mc-label">${d.label || '오개념 주의'}</div><div class="mc-wrong">${md(d.wrong)}</div><div class="mc-right" style="margin-top:8px;">${md(d.right)}</div>${d.hint ? `<div style="margin-top:12px; font-size: 0.85em; color: var(--c-text-light);">${md(d.hint)}</div>` : ''}</div></div>`;

      case 'number_line_demo':
        return `<h2>${md(d.title)}</h2><div class="center">${renderNumberLine(d.nl.range, d.nl.anchor)}${d.caption ? `<div class="small-text">${md(d.caption)}</div>` : ''}</div>`;

      // L0-⑤ 수준별 문제층 (학년칸 사상 이식): 기본·도전·심화 탭 전환 + reveal. open:true=개방형.
      case 'leveled_problem': {
        const levels = d.levels || {};
        const keys = Object.keys(levels);
        const stLv = getIState(slide.id, { level: keys[0] || '기본', revealed: false });
        const curKey = levels[stLv.level] ? stLv.level : (keys[0] || '');
        const lv = levels[curKey] || {};
        const tone = { '기본': 'basic', '도전': 'chall', '심화': 'deep' };
        const tabs = keys.map(k => `<button class="kt-lv-tab kt-lv-${tone[k] || 'basic'}${k === curKey ? ' on' : ''}" data-action="kt-lv-tab" data-slide-id="${slide.id}" data-level="${k}">${md(k)}</button>`).join('');
        let ans = '';
        if (stLv.revealed) {
          if (lv.open) ans = `<div class="kt-lv-ans open">💡 여러 답이 가능해요${lv.a ? ' — ' + md(String(lv.a)) : ''}</div>`;
          else ans = `<div class="kt-lv-ans">✅ ${md(String(lv.a !== undefined ? lv.a : ''))}</div>`;
          if (lv.steps && lv.steps.length) ans += `<div class="kt-lv-steps">${lv.steps.map(s => `<span class="kt-lv-step">${md(s)}</span>`).join('<span class="kt-lv-arr">→</span>')}</div>`;
        }
        return `<h2>${md(d.title)}</h2><div class="center" style="gap:18px;"><div class="kt-lv-tabs">${tabs}</div><div class="kt-lv-body kt-lv-${tone[curKey] || 'basic'}"><div class="kt-lv-q">${md(lv.q || '')}</div>${ans}</div><button class="i-btn coral" data-action="kt-lv-reveal" data-slide-id="${slide.id}">${stLv.revealed ? '🙈 정답 숨기기' : '정답 보기 ✨'}</button>${d.note ? `<div class="small-text">${md(d.note)}</div>` : ''}</div>`;
      }

      // L0-⑥ 출구 퀴즈: 좌측 확인 3문(kt-flip 재사용) + 우측 신호등(손들기 진행용·집계/저장 없음, 집계는 3층 케이플 예약).
      case 'exit_ticket': {
        const items = d.items || [];
        const stEt = getIState(slide.id, { flipped: items.map(function () { return false; }) });
        const qs = items.map((it, i) => {
          const on = !!(stEt.flipped && stEt.flipped[i]);
          return `<div class="kt-et-card${on ? ' on' : ''}" data-action="kt-flip" data-slide-id="${slide.id}" data-ci="${i}"><div class="kt-et-q">${md(it.q || '')}</div><div class="kt-et-a">${on ? '✅ ' + md(String(it.a !== undefined ? it.a : '')) : '❓ 눌러서 확인'}</div></div>`;
        }).join('');
        const self = d.self || [];
        const lights = ['🟢', '🟡', '🔴'];
        const signal = self.length ? `<div class="kt-et-signal"><div class="kt-et-signal-t">지금 내 마음은?</div>${self.map((s, i) => `<div class="kt-et-light"><span class="kt-et-dot">${lights[i] || '⚪'}</span><span class="kt-et-lbl">${md(s)}</span></div>`).join('')}</div>` : '';
        return `<h2>${md(d.title || '오늘 확인해요')}</h2><div class="center"><div class="kt-et-wrap"><div class="kt-et-qs">${qs}</div>${signal}</div></div>`;
      }

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
    // L0-④ 짝·모둠 활동 표준: type/goal/steps/materials(칩)/minutes 확장. 기존 tag/icon/body/문자열 materials 경로 하위호환.
    const typeLabel = { pair: '👋 짝 활동', group: '👥 모둠 활동', whole: '🙌 다 함께 활동' };
    const typeIcon = { pair: '🤝', group: '👥', whole: '🙌' };
    const tag = d.tag || (d.type && typeLabel[d.type]) || '교실에서 함께 해요';
    let inner = `<div class="i-offline-tag">${md(tag)}</div>`;
    inner += `<div class="i-offline-icon">${d.icon || (d.type && typeIcon[d.type]) || '🙋'}</div>`;
    if (d.goal) inner += `<div class="kt-oa-goal">🎯 ${md(d.goal)}</div>`;
    if (d.body) inner += `<div class="i-offline-body">${md(d.body)}</div>`;
    if (d.steps && d.steps.length) inner += `<ol class="kt-oa-steps">${d.steps.map(s => `<li>${md(s)}</li>`).join('')}</ol>`;
    if (Array.isArray(d.materials) && d.materials.length) inner += `<div class="kt-oa-mats"><span class="kt-oa-mats-lbl">준비물</span>${d.materials.map(m => `<span class="kt-oa-chip">${md(m)}</span>`).join('')}</div>`;
    else if (typeof d.materials === 'string' && d.materials) inner += `<div class="i-offline-materials"><strong>필요한 것:</strong> ${md(d.materials)}</div>`;
    if (d.minutes) inner += `<button class="kt-oa-timer" data-action="kt-oa-timer" data-min="${d.minutes}">⏱ ${d.minutes}분 타이머 켜기</button>`;
    return `<h2>${md(d.title)}</h2><div class="center"><div class="i-offline-card">${inner}</div></div>`;
  }

  // =================== 사이드바 — 슬라이드/보조자료/블록 ===================
  function blockShortLabel(block) {
    return ({cover:'표지',review:'복습',motivate:'도입 상황',concept:'개념',visual_demo:'시각 자료',compare:'비교',basic_problem:'기본 문제',advanced_problem:'응용 문제',real_world:'생활 속',game:'활동·놀이',summary:'요약',question:'발문',next_lesson:'다음 차시',arrow_flow:'흐름',misconception:'오개념',number_line_demo:'수직선',interactive_ten_frame:'👆 십 배열판',interactive_cube_stairs:'👆 큐브 쌓기',interactive_number_line:'👆 수직선',klab:'🧊 케이랩',math_tool:'🧊 케이랩',quiz_gen:'🧩 케이퀴즈',card_arrange:'👆 카드 순서',offline_activity:'🙋 교실 활동',leveled_problem:'🎚 수준별 문제',exit_ticket:'🎫 출구 퀴즈'})[block] || block;
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
          <span class="extra-icon">${getExtraIconFallback(e)}</span>
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
          <span class="ext-icon">${getExtraIconFallback(e)}</span>
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
      // 인터랙티브 게임 분기
      if (e.type === 'game' && e.game_kind === 'memory_match') {
        return `<div id="kedu-game-mount" class="eo-game-mount"></div>`;
      }
      if (e.type === 'game' && e.game_kind === 'compare_pair') {
        return `<div id="kedu-game-mount" class="eo-game-mount"></div>`;
      }
      // 교실 활동 안내 (스텝/설명만)
      const guideHead = (e.type === 'game' && !e.game_kind)
        ? `<div class="eo-classroom-banner">🙋 교실에서 진행하는 활동입니다</div>` : '';
      if (Array.isArray(e.steps) && e.steps.length > 0) {
        const stepsHtml = e.steps.map(s => `<li>${md(s)}</li>`).join('');
        return `${guideHead}<div class="eo-label">진행 단계</div>
          <ol class="eo-steps">${stepsHtml}</ol>
          ${e.description ? `<div class="eo-divider"></div><div class="eo-medium-text" style="font-size:16px; color:var(--c-text-light);">${md(e.description)}</div>` : ''}`;
      }
      return `${guideHead}<div class="eo-big-text" style="text-align:left;">${md(e.content || e.description || '')}</div>`;
    }
    return `<div class="eo-big-text">${md(e.content || e.description || '')}</div>`;
  }

  function openExtraOverlay(extraId) {
    const e = getExtra(extraId);
    if (!e) return;
    const audience = EXTRA_TYPE_AUDIENCE[e.type] || 'student';
    const typeLabel = getExtraTypeLabel(e);
    document.getElementById('eo-icon').textContent = getExtraIconFallback(e);
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

    // 인터랙티브 게임 마운트
    if (e.type === 'game' && e.game_kind === 'memory_match' && window.KeduMemoryMatch) {
      const mountEl = document.getElementById('kedu-game-mount');
      if (mountEl) window.KeduMemoryMatch.mount(mountEl, e);
    }
    if (e.type === 'game' && e.game_kind === 'compare_pair' && window.KeduComparePair) {
      const mountEl = document.getElementById('kedu-game-mount');
      if (mountEl) window.KeduComparePair.mount(mountEl, e);
    }
  }

  function closeExtraOverlay() {
    if (window.KeduMemoryMatch && typeof window.KeduMemoryMatch.unmount === 'function') {
      window.KeduMemoryMatch.unmount();
    }
    if (window.KeduComparePair && typeof window.KeduComparePair.unmount === 'function') {
      window.KeduComparePair.unmount();
    }
    document.getElementById('ext-overlay').classList.remove('active');
    const canvas = document.getElementById('eo-canvas');
    if (canvas) canvas.innerHTML = '';
  }

  // =================== 현재 슬라이드·rebuild·이동 ===================
  function renderCurrentSlide() {
    const cur = slides[curIdx];
    if (renderCurrentSlide._cleanup) { try { renderCurrentSlide._cleanup(); } catch (e) {} renderCurrentSlide._cleanup = null; }
    // v3 C2: 블록 타입 훅(스킨 전용, classic 모드엔 대응 CSS 없어 무변화) + 풀다크 4종 마커
    const _blk = cur.block || '';
    const _dk = (_blk === 'cover' || _blk === 'summary' || _blk === 'next_lesson' || _blk === 'game') ? ' kt-dk' : '';
    document.getElementById('slide-content').innerHTML = `<div class="slide active blk-${_blk}${_dk} ${cur.user_added ? 'user-added' : ''}">${renderSlide(cur)}</div>`;
    const _mt = document.querySelector('#slide-content .klab-mount');
    if (_mt && window.KLab) {
      try {
        const _cfg = JSON.parse(decodeURIComponent(_mt.dataset.config || '%7B%7D'));
        renderCurrentSlide._cleanup = window.KLab.mount(_mt, _mt.dataset.tool, _cfg) || null;
      } catch (e) { _mt.textContent = '교구 로드 오류'; }
    }
    const _qz = document.querySelector('#slide-content .kquiz-mount');
    if (_qz && window.KQuiz) {
      const _qc = (() => { try { return JSON.parse(decodeURIComponent(_qz.dataset.config || '%7B%7D')); } catch (e) { return {}; } })();
      const _lesson = _qz.dataset.lesson;
      const _mountQuiz = () => {
        if (_lesson && window.KQuiz.core && window.KQuiz.core.has(_lesson)) {
          try {
            renderCurrentSlide._cleanup = window.KQuiz.mount(_qz, {
              mode: 'teacher', lesson: _lesson, n: _qc.n || 5, difficulty: _qc.difficulty,
              onAddToBox: window.KEDU_BOXBAR_ADDQUIZ || null
            }) || null;
          } catch (e) { _qz.textContent = '문제 로드 오류'; }
        } else {
          _qz.innerHTML = '<div style="padding:20px;color:#94A3B8;font-size:14px">아직 준비 중인 문제예요' + (_lesson ? ' (' + _lesson + ')' : '') + '</div>';
        }
      };
      // 템플릿 지연 로드: g1_math_u3_l05 → /kedu/quiz/templates/g1_math_u3.js
      if (_lesson && window.KQuiz.core && !window.KQuiz.core.has(_lesson)) {
        const _m = _lesson.match(/^(g\d+_[a-z]+_u\d+)/);
        if (_m) {
          const _s = document.createElement('script');
          _s.src = '/kedu/quiz/templates/' + _m[1] + '.js';
          _s.onload = _mountQuiz; _s.onerror = _mountQuiz;
          document.head.appendChild(_s);
        } else { _mountQuiz(); }
      } else { _mountQuiz(); }
    }
    const _ka = document.querySelector('#slide-content .kact-mount');
    if (_ka && window.KActivity) {
      try {
        const _kac = JSON.parse(decodeURIComponent(_ka.dataset.config || '%7B%7D'));
        const _kaCl = window.KActivity.mount(_ka, _kac);
        if (_kaCl) renderCurrentSlide._cleanup = _kaCl;
      } catch (e) { _ka.textContent = '활동 로드 오류'; }
    }
    const visibleSlides = slides.filter(s => s.included);
    const visIdx = visibleSlides.indexOf(cur);
    document.getElementById('cur-pos').textContent = visIdx + 1;
    document.getElementById('total-pos').textContent = visibleSlides.length;
    document.getElementById('current-stage').textContent = cur.stage;
    document.getElementById('delete-slide-btn').style.display = cur.user_added ? '' : 'none';
    const _editBtn = document.getElementById('edit-slide-btn');
    if (_editBtn) _editBtn.style.display = cur.user_added ? '' : 'none';
    document.getElementById('prev-btn').disabled = visIdx === 0;
    document.getElementById('next-btn').disabled = visIdx === visibleSlides.length - 1;

    // 정답 토글 버튼 자리 — 슬라이드 자리 정답 있을 때만 노출
    const revealBtn = document.getElementById('reveal-btn');
    if (revealBtn) {
      if (slideHasAnswer(cur)) {
        revealBtn.style.display = '';
        revealBtn.textContent = cur.revealed ? '👁 정답 보임' : '🙈 정답 가림';
        revealBtn.classList.toggle('revealed', !!cur.revealed);
      } else {
        revealBtn.style.display = 'none';
      }
    }
    // L0-⑦ 발문 바 동기화 — 토글 켜져 있을 때만 현재 슬라이드 tnote 갱신
    if (_tnoteOn) paintTnote();
  }

  function toggleReveal() {
    const cur = slides[curIdx];
    if (!slideHasAnswer(cur)) return;
    cur.revealed = !cur.revealed;
    renderCurrentSlide();
    saveState();
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
    clearAnnotationOnNav();
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
    const s = String(lesson);
    // 묶음 차시 "2~3" → "02_03"
    if (s.indexOf('~') >= 0) {
      return `u${unit}_l${s.split('~').map(x => x.trim().padStart(2, '0')).join('_')}`;
    }
    // 단일 차시 "1" → "01"
    return `u${unit}_l${s.padStart(2, '0')}`;
  }

  let inShow = false;
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

    if (window.KActivity) {
      const _m = (SUBJECT_INFO.slug || '').match(/^g(\d)_(\w+)$/);
      const _lk = key.match(/^u(\d+)_(.+)$/);
      window.KActivity.setContext({
        grade: _m ? parseInt(_m[1], 10) : null,
        subject: _m ? _m[2] : null,
        unit: _lk ? parseInt(_lk[1], 10) : null,
        lessons: _lk ? _lk[2].split('_').map(x => 'l' + x.replace(/^l/, '')) : []
      });
    }

    document.getElementById('home-view').classList.remove('active');
    document.getElementById('show-view').classList.add('active');
    if (!inShow) { try { history.pushState({ kt: 'lesson' }, ''); } catch (e) {} }
    inShow = true;

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
    inShow = false;
    progressToolsReset();
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
    const epBtn = document.getElementById('export-pptx-btn');
    if (epBtn) epBtn.addEventListener('click', exportPptx);
    const ewBtn = document.getElementById('export-ws-btn');
    if (ewBtn) ewBtn.addEventListener('click', exportWorksheet);
    document.getElementById('fs-exit-btn').addEventListener('click', toggleFullscreen);
    // '← 차시 목록' 버튼: 차시 진입 시 쌓은 history를 되돌려(popstate→backToHome) 뒤로가기와 동작 일치
    document.getElementById('back-to-home').addEventListener('click', function(){
      if (inShow) { history.back(); } else { backToHome(); }
    });
    // 브라우저/기기 뒤로가기: 차시 뷰면 차시 목록으로 한 단계만 복귀(케이에듀로 안 빠짐)
    window.addEventListener('popstate', function(){
      if (inShow) backToHome();
    });

    // 정답 토글 자리
    const revealBtn = document.getElementById('reveal-btn');
    if (revealBtn) revealBtn.addEventListener('click', toggleReveal);

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
      else if (e.key === 'a' || e.key === 'A') toggleReveal();
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
        openBlockEditor(curIdx); // 추가 직후 바로 내용 채우기
      });
    });

    // 활동 삽입 훅 (§6-3 카탈로그 탭 → activity-host.js가 호출)
    global.KEDU_INSERT_ACTIVITY = (data) => {
      slides.splice(curIdx + 1, 0, {
        stage: '응용문제', block: 'activity', data,
        id: 'u' + Date.now(), included: true,
        attached_extras: [], suggested_extras: [], user_added: true
      });
      curIdx++;
      rebuild();
    };

    // 사용자 추가 슬라이드 삭제
    document.getElementById('delete-slide-btn').addEventListener('click', () => {
      if (!slides[curIdx].user_added) return;
      if (!confirm('이 슬라이드를 삭제할까요?')) return;
      slides.splice(curIdx, 1);
      if (curIdx >= slides.length) curIdx = slides.length - 1;
      rebuild();
    });

    // 사용자 추가 슬라이드 수정
    const editBtn = document.getElementById('edit-slide-btn');
    if (editBtn) editBtn.addEventListener('click', () => {
      if (slides[curIdx] && slides[curIdx].user_added) openBlockEditor(curIdx);
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
      // 국어 동기유발 카드 뒤집기 (자식 요소 클릭도 카드로 위임)
      const _flipCard = t.closest && t.closest('[data-action="kt-flip"]');
      if (_flipCard) {
        const sid = _flipCard.dataset.slideId;
        const ci = parseInt(_flipCard.dataset.ci, 10);
        const s = global.interactiveState[sid] || { flipped: [] };
        const flipped = (s.flipped || []).slice();
        flipped[ci] = !flipped[ci];
        setIState(sid, { flipped: flipped });
        return;
      }
      // 국어 읽어주기 페이지 네비
      if (t.dataset.action === 'kt-ra-prev') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { page: 0 };
        if (s.page > 0) setIState(sid, { page: s.page - 1 });
        return;
      }
      if (t.dataset.action === 'kt-ra-next') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { page: 0 };
        setIState(sid, { page: s.page + 1 });
        return;
      }
      // 국어 초성퀴즈
      if (t.dataset.action === 'kt-cz-reveal') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { idx: 0, revealed: false };
        setIState(sid, { idx: s.idx, revealed: !s.revealed });
        return;
      }
      if (t.dataset.action === 'kt-cz-prev') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { idx: 0, revealed: false };
        if (s.idx > 0) setIState(sid, { idx: s.idx - 1, revealed: false });
        return;
      }
      if (t.dataset.action === 'kt-cz-next') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { idx: 0, revealed: false };
        setIState(sid, { idx: s.idx + 1, revealed: false });
        return;
      }
      // 국어 호명 발표 (무작위·중복방지)
      if (t.dataset.action === 'kt-pr-next') {
        const sid = t.dataset.slideId;
        const count = parseInt(t.dataset.count, 10);
        const s = global.interactiveState[sid] || { picked: [], current: null };
        const remaining = [];
        for (let k = 0; k < count; k++) if (s.picked.indexOf(k) < 0) remaining.push(k);
        if (remaining.length === 0) return;
        const pick = remaining[Math.floor(Math.random() * remaining.length)];
        // C4 호명 연출: 룰렛 감속 이징 → 이름 확정 팝 + 차임. (남은 1명·중복 클릭 시 즉시 확정)
        const d = (slides[curIdx] && slides[curIdx].data) || {};
        const nameEl = document.querySelector('.kt-pr-name');
        const labelOf = function (n) { return (d.names && d.names[n]) ? String(d.names[n]) : (n + 1) + '번 친구'; };
        if (!nameEl || remaining.length === 1 || t.dataset.spinning) {
          progressChime('pick');
          setIState(sid, { picked: s.picked.concat([pick]), current: pick });
          return;
        }
        t.dataset.spinning = '1'; t.disabled = true;
        const card = nameEl.closest('.kt-pr-card'); if (card) card.classList.add('spin');
        let elapsed = 0, delay = 55; const total = 1500;
        (function tick() {
          const r = remaining[Math.floor(Math.random() * remaining.length)];
          nameEl.textContent = labelOf(r);
          elapsed += delay;
          delay = 55 + Math.pow(Math.min(1, elapsed / total), 2.2) * 240; // 감속
          if (elapsed < total) { setTimeout(tick, delay); }
          else {
            nameEl.textContent = labelOf(pick);
            progressChime('pick');
            setIState(sid, { picked: s.picked.concat([pick]), current: pick }); // 재렌더 = .pop 등장
          }
        })();
        return;
      }
      if (t.dataset.action === 'kt-pr-reset') {
        resetIState(t.dataset.slideId, { picked: [], current: null });
        return;
      }
      // L0-④ 활동 타이머: C4 타이머(1호) 존재 감지 후 분 프리셋 설정 + HUD 표시. 미존재면 무동작(표기만).
      if (t.dataset.action === 'kt-oa-timer') {
        if (typeof ensureTimer === 'function' && typeof timerSet === 'function') {
          const min = parseInt(t.dataset.min, 10) || 5;
          ensureTimer(); timerSet(min * 60);
          const p = document.getElementById('pt-timer'); if (p) p.style.display = 'block';
        }
        return;
      }
      // L0-⑤ 수준별 문제: 탭 전환(정답 초기화) / 정답 공개 토글
      if (t.dataset.action === 'kt-lv-tab') {
        setIState(t.dataset.slideId, { level: t.dataset.level, revealed: false });
        return;
      }
      if (t.dataset.action === 'kt-lv-reveal') {
        const sid = t.dataset.slideId;
        const s = global.interactiveState[sid] || { level: '기본', revealed: false };
        setIState(sid, { level: s.level, revealed: !s.revealed });
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

  // =================== 테마 토글 (2026-05-17) ===================
  const THEME_KEY = 'kedu-teacher-theme';

  function loadThemeState() {
    try {
      const s = JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
      return { t: s.t || 'board', f: s.f || 'round' };
    } catch (e) { return { t: 'board', f: 'round' }; }
  }

  function saveThemeState(state) {
    try { localStorage.setItem(THEME_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function applyThemeState(state) {
    const body = document.body;
    body.classList.remove('t-board', 't-atlas', 't-paper', 't-spring', 't-night');
    body.classList.remove('f-round', 'f-myeong', 'f-hand');
    if (state.t !== 'board') body.classList.add('t-' + state.t);
    if (state.f !== 'round') body.classList.add('f-' + state.f);
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.t === state.t);
    });
    document.querySelectorAll('.theme-font').forEach(f => {
      f.classList.toggle('active', f.dataset.f === state.f);
    });
  }

  let _themeState = { t: 'board', f: 'round' };

  function initTheme() {
    if (document.getElementById('theme-toggle-btn')) return;

    _themeState = loadThemeState();

    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.id = 'theme-toggle-btn';
    btn.innerHTML = '<span aria-hidden="true">🎨</span><span>테마</span>';
    btn.setAttribute('aria-label', '테마 변경');

    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'theme-panel';
    panel.innerHTML = [
      '<div class="theme-section">',
      '  <div class="theme-section-label">색 테마</div>',
      '  <div class="theme-swatches">',
      '    <div class="theme-swatch" data-t="board" title="칠판 차콜"></div>',
      '    <div class="theme-swatch" data-t="atlas" title="누런 도감"></div>',
      '    <div class="theme-swatch" data-t="paper" title="흰 신문"></div>',
      '    <div class="theme-swatch" data-t="spring" title="봄 교실"></div>',
      '    <div class="theme-swatch" data-t="night" title="밤 칠판"></div>',
      '  </div>',
      '</div>',
      '<div class="theme-section">',
      '  <div class="theme-section-label">글씨체</div>',
      '  <div class="theme-fonts">',
      '    <button class="theme-font" data-f="round">굴림</button>',
      '    <button class="theme-font" data-f="myeong">명조</button>',
      '    <button class="theme-font" data-f="hand">손글씨</button>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    panel.querySelectorAll('.theme-swatch').forEach(s => {
      s.addEventListener('click', () => {
        _themeState.t = s.dataset.t;
        applyThemeState(_themeState);
        saveThemeState(_themeState);
      });
    });

    panel.querySelectorAll('.theme-font').forEach(f => {
      f.addEventListener('click', () => {
        _themeState.f = f.dataset.f;
        applyThemeState(_themeState);
        saveThemeState(_themeState);
      });
    });

    applyThemeState(_themeState);
  }

  // =================== 공개 API ===================
  // =================== 산출물 내보내기 ===================
  function currentLessonForExport() {
    const meta = (LESSONS[currentLessonKey] && LESSONS[currentLessonKey].meta) || {};
    return { meta: meta, slides: slides.filter(s => s.included !== false) };
  }
  function exportPptx() {
    if (typeof TeacherExport === 'undefined' || typeof PptxGenJS === 'undefined') {
      alert('PPT 생성 도구를 불러오는 중입니다. 잠시 후 다시 눌러 주세요.');
      return;
    }
    try {
      const pres = TeacherExport.buildPptx(PptxGenJS, currentLessonForExport());
      const name = (SUBJECT_INFO && SUBJECT_INFO.slug ? SUBJECT_INFO.slug : 'lesson') + '_' + (currentLessonKey || 'export') + '_교사용.pptx';
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
      setTimeout(() => { win.focus(); win.print(); }, 400);
    } catch (e) { console.error(e); alert('학습지 생성 중 오류가 발생했습니다.'); }
  }

  // =================== 블록 편집 (B안: 입력창 방식) ===================
  // 블록 타입별 편집 가능한 필드 정의
  const EDIT_SCHEMA = {
    motivate: [
      { key: 'scene_title', label: '장면 제목', type: 'text' },
      { key: 'question', label: '핵심 질문', type: 'text' }
    ],
    concept: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'content', label: '개념 설명', type: 'textarea' }
    ],
    question: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'content', label: '발문 내용', type: 'textarea' }
    ],
    basic_problem: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'question', label: '문제', type: 'textarea' },
      { key: 'answer', label: '정답 (선택)', type: 'text' }
    ],
    advanced_problem: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'challenge', label: '문제', type: 'textarea' },
      { key: 'answer', label: '정답 (선택)', type: 'text' }
    ],
    game: [
      { key: 'title', label: '활동 이름', type: 'text' },
      { key: 'steps', label: '활동 단계 (한 줄에 하나씩)', type: 'lines' }
    ],
    summary: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'points', label: '핵심 정리 (한 줄에 하나씩)', type: 'lines' }
    ],
    next_lesson: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'preview', label: '예고 내용', type: 'textarea' }
    ]
  };

  function openBlockEditor(slideIdx) {
    const slide = slides[slideIdx];
    if (!slide) return;
    const schema = EDIT_SCHEMA[slide.block];
    if (!schema) return; // 편집 스키마 없는 블록은 무시
    const d = slide.data || {};

    const overlay = document.createElement('div');
    overlay.className = 'block-editor-overlay';
    const fieldsHtml = schema.map((f, i) => {
      let cur = d[f.key];
      // 플레이스홀더 텍스트는 빈칸으로 시작
      if (typeof cur === 'string' && /^\(.*편집.*\)$|^새 |^단계 \d|^점 \d/.test(cur)) cur = '';
      if (f.type === 'lines') {
        const val = Array.isArray(cur) ? cur.filter(x => !/^단계 \d|^점 \d/.test(x)).join('\n') : '';
        return `<label class="be-field"><span>${f.label}</span><textarea data-key="${f.key}" data-type="lines" rows="4">${esc(val)}</textarea></label>`;
      }
      if (f.type === 'textarea') {
        return `<label class="be-field"><span>${f.label}</span><textarea data-key="${f.key}" rows="3">${esc(cur || '')}</textarea></label>`;
      }
      return `<label class="be-field"><span>${f.label}</span><input type="text" data-key="${f.key}" value="${esc(cur || '')}"></label>`;
    }).join('');

    overlay.innerHTML = `<div class="block-editor">
      <div class="be-head">✏️ 내용 채우기 <span class="be-blocktype">${blockLabel(slide.block)}</span></div>
      <div class="be-body">${fieldsHtml}</div>
      <div class="be-foot">
        <button class="be-cancel">취소</button>
        <button class="be-save">저장</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('.be-cancel').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.be-save').addEventListener('click', () => {
      overlay.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (el.dataset.type === 'lines') {
          const arr = el.value.split('\n').map(s => s.trim()).filter(Boolean);
          if (arr.length) slide.data[key] = arr;
        } else {
          const v = el.value.trim();
          if (key === 'answer' && v === '') { delete slide.data[key]; }
          else if (v !== '') slide.data[key] = v;
        }
      });
      close();
      rebuild();
    });
    // 첫 입력칸 포커스
    const first = overlay.querySelector('input, textarea');
    if (first) first.focus();
  }
  function blockLabel(type) {
    const m = { motivate: '도입 상황', concept: '개념 설명', question: '발문', basic_problem: '기본 문제', advanced_problem: '응용 문제', game: '활동·놀이', summary: '핵심 요약', next_lesson: '다음 차시' };
    return m[type] || type;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // =================== 케이랩 도크 (차시 → 교구 다리, 분리형) ===================
  // 케이랩은 별도 페이지(klab.html)로 분리 유지. 차시에서는 "이 차시 추천 교구"를
  // 골라 새 탭으로 바로 띄운다 (수업 화면·조립 상태는 그대로 남음).
  // 매핑 = 페이지가 로드하는 data/*_klab.js 의 window.KLAB_MAP.
  //   키: 정확한 차시 키("u4_l05") 또는 단원 키("u4" — 그 단원 모든 차시에 노출)
  //   값: [{ tool, label, desc, cfg }]
  const KLAB_PAGE_URL = 'klab.html';
  // C3(v3): 구형 klab.js 도구는 슬라이드 위 오버레이로 즉석 마운트한다. cleanup 훅 보관.
  let _klabOverlayCleanup = null;

  function klabRecsFor(key) {
    const map = global.KLAB_MAP || {};
    const out = [], seen = {};
    const addAll = arr => (arr || []).forEach(r => {
      const id = r.tool + '|' + (r.label || '');
      if (!seen[id]) { seen[id] = 1; out.push(r); }
    });
    if (key) {
      addAll(map[key]);
      const um = String(key).match(/^u(\d+)_/);
      if (um) addAll(map['u' + um[1]]);
    }
    return out;
  }

  function klabDeepUrl(rec) {
    let q = '?tool=' + encodeURIComponent(rec.tool) + '&from=kteacher';
    if (rec.cfg) q += '&cfg=' + encodeURIComponent(JSON.stringify(rec.cfg));
    if (rec.label) q += '&label=' + encodeURIComponent(rec.label);
    return KLAB_PAGE_URL + q;
  }

  function setupKlabDock() {
    if (document.getElementById('klab-dock-btn')) return;
    const fullBtn = document.getElementById('full-btn');
    if (!fullBtn || !fullBtn.parentNode) return;
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.id = 'klab-dock-btn';
    btn.title = '이 차시에 어울리는 케이랩 교구 열기';
    btn.textContent = '🧊 교구';
    fullBtn.parentNode.insertBefore(btn, fullBtn);

    const panel = document.createElement('div');
    panel.id = 'klab-dock-panel';
    panel.style.cssText = 'display:none;position:fixed;z-index:260;background:#fff;border-radius:18px;'
      + 'box-shadow:0 12px 40px rgba(0,0,0,.25);padding:14px;min-width:340px;max-width:480px;max-height:72vh;overflow:auto;';
    document.body.appendChild(panel);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (panel.style.display === 'none') openKlabDock(btn, panel);
      else panel.style.display = 'none';
    });
    document.addEventListener('click', e => {
      if (panel.style.display !== 'none' && !panel.contains(e.target) && e.target !== btn) panel.style.display = 'none';
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.style.display !== 'none') panel.style.display = 'none';
    });

    // C3(v3): 오버레이 레이어 1회 생성 (extras 오버레이와 같은 레이어 사상, 동적 주입 → html 4종 불변)
    // 기본 레이아웃은 인라인(classic 모드에서도 동작) + body.kt3일 때 teacher-v3.css가 유리 스킨만 얹음.
    if (!document.getElementById('klab-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'klab-overlay';
      ov.className = 'klab-overlay';
      ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:300;background:rgba(20,25,32,.62);flex-direction:column;';
      ov.innerHTML =
        '<div class="klab-overlay-bar" style="display:flex;align-items:center;gap:12px;padding:12px 20px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.12);">'
        + '<span class="ko-icon" style="font-size:22px;">🧊</span>'
        + '<span class="ko-title" id="klab-overlay-title" style="font-size:19px;font-weight:800;color:#1B3A57;flex:1;"></span>'
        + '<button class="ko-close" id="klab-overlay-close" style="font-size:16px;font-weight:800;font-family:inherit;border:none;border-radius:12px;padding:9px 18px;background:#EAF2FB;color:#1565C0;cursor:pointer;">닫기 (ESC)</button>'
        + '</div>'
        + '<div class="klab-overlay-body" style="flex:1;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:26px 20px;">'
        + '<div class="klab-overlay-mount" id="klab-overlay-mount" style="width:100%;max-width:960px;"></div></div>';
      document.body.appendChild(ov);
      document.getElementById('klab-overlay-close').addEventListener('click', closeKlabOverlay);
      ov.addEventListener('click', e => {
        if (e.target === ov || e.target.classList.contains('klab-overlay-body')) closeKlabOverlay();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && ov.style.display !== 'none') closeKlabOverlay();
      });
    }
  }

  // C3(v3): 구형 도구를 슬라이드 위 오버레이로 즉석 마운트. 수업 슬라이드 상태(slides·curIdx·조립)는
  // 건드리지 않음 → 닫으면 그대로. mount의 cleanup 반환값을 보관했다가 닫을 때 호출(누수 방지).
  function openKlabOverlay(rec) {
    if (!rec || !window.KLab) return;
    const ov = document.getElementById('klab-overlay');
    if (!ov) return;
    const mountEl = document.getElementById('klab-overlay-mount');
    const titleEl = document.getElementById('klab-overlay-title');
    if (titleEl) titleEl.textContent = rec.label || rec.tool || '케이랩 교구';
    if (_klabOverlayCleanup) { try { _klabOverlayCleanup(); } catch (e) {} _klabOverlayCleanup = null; }
    mountEl.innerHTML = '';
    ov.style.display = 'flex';
    try {
      _klabOverlayCleanup = window.KLab.mount(mountEl, rec.tool, rec.cfg || {}) || null;
    } catch (e) {
      mountEl.textContent = '교구를 불러오지 못했어요.';
    }
  }

  function closeKlabOverlay() {
    const ov = document.getElementById('klab-overlay');
    if (!ov) return;
    if (_klabOverlayCleanup) { try { _klabOverlayCleanup(); } catch (e) {} _klabOverlayCleanup = null; }
    ov.style.display = 'none';
    const mountEl = document.getElementById('klab-overlay-mount');
    if (mountEl) mountEl.innerHTML = '';
  }

  function openKlabDock(btn, panel) {
    const recs = klabRecsFor(currentLessonKey);
    let html = '<div style="font-size:19px;font-weight:800;color:#1B3A57;margin:2px 4px 10px;">🧊 케이랩 교구 — 이 차시 추천</div>';
    if (recs.length) {
      html += recs.map((r, i) => {
        const local = !!(window.KLab && window.KLab.has(r.tool));
        const badge = local
          ? '<span style="float:right;font-size:14px;color:#12B886;font-weight:800;">바로 열기 ▸</span>'
          : '<span style="float:right;font-size:15px;color:#8aa9c6;">새 탭 ↗</span>';
        return '<div class="klab-dock-item" data-i="' + i + '" data-local="' + (local ? '1' : '0') + '" style="cursor:pointer;border:3px solid #D7E6F5;border-radius:14px;padding:12px 14px;margin-bottom:8px;transition:border-color .15s,background .15s;">'
          + '<div style="font-size:19px;font-weight:800;color:#1565C0;">' + esc(r.label || r.tool) + ' ' + badge + '</div>'
          + (r.desc ? '<div style="font-size:15px;color:#5a7894;margin-top:3px;line-height:1.4;">' + esc(r.desc) + '</div>' : '')
          + '</div>';
      }).join('');
    } else {
      html += '<div style="font-size:16px;color:#5a7894;padding:6px 4px 10px;line-height:1.5;">이 차시에 등록된 추천 교구가 아직 없어요.<br>전체 목록에서 골라 쓸 수 있어요.</div>';
    }
    html += '<div class="klab-dock-all" style="cursor:pointer;text-align:center;border-radius:14px;padding:12px;background:#EAF2FB;color:#1565C0;font-size:17px;font-weight:800;">🧊 케이랩 전체 교구 보기 ↗</div>'
      + '<div style="font-size:13px;color:#9AB7D4;text-align:center;margin-top:8px;">새 탭에서 열려요 — 탭을 닫으면 수업 화면이 그대로 있어요</div>';
    panel.innerHTML = html;

    panel.querySelectorAll('.klab-dock-item').forEach(el => {
      el.addEventListener('mouseenter', () => { el.style.borderColor = '#1565C0'; el.style.background = '#F4F9FF'; });
      el.addEventListener('mouseleave', () => { el.style.borderColor = '#D7E6F5'; el.style.background = '#fff'; });
      el.addEventListener('click', () => {
        const r = recs[Number(el.dataset.i)];
        panel.style.display = 'none';
        if (!r) return;
        if (el.dataset.local === '1') openKlabOverlay(r);   // 구형 도구 = 슬라이드 위 오버레이 즉석 마운트
        else window.open(klabDeepUrl(r), '_blank', 'noopener');  // v3 재건 도구 = 새 탭 딥링크
      });
    });
    const allEl = panel.querySelector('.klab-dock-all');
    if (allEl) allEl.addEventListener('click', () => {
      window.open(KLAB_PAGE_URL, '_blank', 'noopener');
      panel.style.display = 'none';
    });

    // 버튼 아래에 위치
    const rect = btn.getBoundingClientRect();
    panel.style.display = 'block';
    panel.style.top = Math.min(rect.bottom + 8, window.innerHeight - 80) + 'px';
    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
  }


  /* ================= C4(v3): 진행 도구 4종 (타이머·스포트라이트·판서·호명 연출) =================
     순수 DOM. 엔진 코어·데이터 불가침. 저장 로직(STORAGE_KEY)과 무간섭.
     기능 CSS는 아래 _injectPTStyle이 #pt-style로 1회 주입(classic에서도 동작) — teacher-v3.css는 다크 유리 스킨만 얹음. */

  // 차임: KLab.sound 있으면 재사용(수학 페이지·정책 준수 공유), 없으면 인라인 합성(국어 페이지에서도 소리).
  let _ptAudio = null;
  function _ptTone(freq, dur, delay, peak) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!_ptAudio) _ptAudio = new AC();
      const c = _ptAudio; if (c.state === 'suspended') { try { c.resume(); } catch (e) {} }
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t0);
      const p = (peak == null ? 0.26 : peak);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(p, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.03);
    } catch (e) {}
  }
  function progressChime(kind) {
    if (window.KLab && window.KLab.sound) { window.KLab.sound.play(kind === 'pick' ? 'pop' : 'success'); return; }
    if (kind === 'pick') { _ptTone(520, 0.12, 0, 0.30); _ptTone(780, 0.10, 0.03, 0.24); }
    else { _ptTone(660, 0.10, 0, 0.28); _ptTone(880, 0.12, 0.10, 0.26); _ptTone(1175, 0.18, 0.20, 0.24); }
  }

  // 화면 펄스: 타이머 종료 신호(주변 글로우 1회).
  function screenPulse() {
    let el = document.getElementById('pt-pulse');
    if (!el) { el = document.createElement('div'); el.id = 'pt-pulse'; document.body.appendChild(el); }
    el.style.display = 'block'; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(screenPulse._t);
    screenPulse._t = setTimeout(function () { el.style.display = 'none'; el.classList.remove('on'); }, 1400);
  }

  // ---- ⏱ 타이머 (HUD, 슬라이드 이동에도 유지 — 슬라이드 상태와 무관한 고정 오버레이) ----
  let _tmId = null, _tmLeft = 0, _tmTotal = 0, _tmRun = false;
  function _tmFmt(s) { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function _tmPaint() {
    const el = document.getElementById('pt-time'); if (!el) return;
    el.textContent = _tmFmt(_tmLeft);
    el.classList.toggle('warn', _tmRun && _tmLeft <= 10 && _tmLeft > 0);
    const go = document.getElementById('pt-timer-go'); if (go) go.textContent = _tmRun ? '⏸ 멈춤' : '▶ 시작';
  }
  function _tmTick() {
    if (!_tmRun) return;
    _tmLeft -= 1;
    if (_tmLeft <= 0) {
      _tmLeft = 0; _tmRun = false; if (_tmId) { clearInterval(_tmId); _tmId = null; }
      const el = document.getElementById('pt-time');
      if (el) { el.classList.remove('warn'); el.classList.add('done'); setTimeout(function () { if (el) el.classList.remove('done'); }, 3200); }
      progressChime('end'); screenPulse();
    }
    _tmPaint();
  }
  function timerSet(sec) {
    _tmTotal = sec; _tmLeft = sec; _tmRun = false;
    if (_tmId) { clearInterval(_tmId); _tmId = null; }
    const el = document.getElementById('pt-time'); if (el) el.classList.remove('done', 'warn');
    _tmPaint();
  }
  function timerToggleRun() {
    if (_tmLeft <= 0) return;
    _tmRun = !_tmRun;
    if (_tmRun) { _tmId = setInterval(_tmTick, 1000); } else if (_tmId) { clearInterval(_tmId); _tmId = null; }
    _tmPaint();
  }
  function ensureTimer() {
    if (document.getElementById('pt-timer')) return;
    const p = document.createElement('div'); p.id = 'pt-timer'; p.className = 'pt-hud'; p.style.display = 'none';
    p.innerHTML =
      '<div class="pt-time" id="pt-time">00:00</div>'
      + '<div class="pt-presets">' + ['1', '3', '5', '10'].map(function (m) { return '<button class="pt-chip" data-min="' + m + '">' + m + '분</button>'; }).join('') + '</div>'
      + '<div class="pt-row"><input class="pt-custom" id="pt-custom" type="number" min="1" max="99" placeholder="분"><button class="pt-btn sec" id="pt-custom-set">맞춤</button></div>'
      + '<div class="pt-row" style="margin-top:8px;"><button class="pt-btn go" id="pt-timer-go">▶ 시작</button><button class="pt-btn sec" id="pt-timer-reset">되돌림</button><button class="pt-btn sec" id="pt-timer-close">✕</button></div>';
    document.body.appendChild(p);
    p.querySelectorAll('.pt-chip').forEach(function (b) { b.addEventListener('click', function () { timerSet(parseInt(b.dataset.min, 10) * 60); }); });
    p.querySelector('#pt-custom-set').addEventListener('click', function () { const v = parseInt(document.getElementById('pt-custom').value, 10); if (v > 0) timerSet(v * 60); });
    p.querySelector('#pt-timer-go').addEventListener('click', timerToggleRun);
    p.querySelector('#pt-timer-reset').addEventListener('click', function () { timerSet(_tmTotal || 0); });
    p.querySelector('#pt-timer-close').addEventListener('click', function () { p.style.display = 'none'; });
    timerSet(300);
  }
  function toggleTimer() { ensureTimer(); const p = document.getElementById('pt-timer'); p.style.display = (p.style.display === 'none') ? 'block' : 'none'; }

  // ---- 🔦 스포트라이트 (화면 어둡게 + 포인터 따라 하이라이트, 반경 2단계, ESC 해제) ----
  let _spotOn = false, _spotR = 150;
  function _spotMove(e) { if (!_spotOn) return; const ov = document.getElementById('pt-spot'); if (ov) { ov.style.setProperty('--pt-x', e.clientX + 'px'); ov.style.setProperty('--pt-y', e.clientY + 'px'); } }
  function ensureSpot() {
    if (document.getElementById('pt-spot')) return;
    const ov = document.createElement('div'); ov.id = 'pt-spot'; document.body.appendChild(ov);
    const bar = document.createElement('div'); bar.id = 'pt-spot-bar'; bar.className = 'pt-hud';
    bar.innerHTML = '<span class="pt-spot-lbl">🔦 스포트라이트</span> <button class="pt-btn sec" id="pt-spot-r">반경 ◑</button> <button class="pt-btn sec" id="pt-spot-x">닫기 (ESC)</button>';
    document.body.appendChild(bar);
    bar.querySelector('#pt-spot-r').addEventListener('click', function () { _spotR = (_spotR >= 150) ? 90 : 150; ov.style.setProperty('--pt-r', _spotR + 'px'); });
    bar.querySelector('#pt-spot-x').addEventListener('click', closeSpotlight);
    window.addEventListener('pointermove', _spotMove);
  }
  function openSpotlight() { ensureSpot(); _spotOn = true; _spotR = 150; const ov = document.getElementById('pt-spot'); ov.style.setProperty('--pt-r', '150px'); ov.style.display = 'block'; document.getElementById('pt-spot-bar').style.display = 'flex'; }
  function closeSpotlight() { _spotOn = false; const ov = document.getElementById('pt-spot'); if (ov) ov.style.display = 'none'; const b = document.getElementById('pt-spot-bar'); if (b) b.style.display = 'none'; }
  function toggleSpotlight() { _spotOn ? closeSpotlight() : openSpotlight(); }

  // ---- ✏️ 판서 (슬라이드 위 canvas, 펜 2색·형광펜·지우개·전체 지움, 슬라이드 이동 시 자동 클리어, 저장 안 함) ----
  let _drawOn = false, _drawCtx = null, _drawing = false, _drawTool = 'pen1', _drawLast = null, _drawLastIdx = -1;
  const _drawColors = { pen1: '#E03131', pen2: '#1565C0', hl: 'rgba(255,214,0,.42)' };
  function _sizeDraw() { const cv = document.getElementById('pt-draw'); if (!cv) return; cv.width = window.innerWidth; cv.height = window.innerHeight; if (_drawCtx) { _drawCtx.lineCap = 'round'; _drawCtx.lineJoin = 'round'; } }
  function _dPos(e) { return { x: e.clientX, y: e.clientY }; }
  function _dStart(e) { if (!_drawOn) return; _drawing = true; _drawLast = _dPos(e); e.preventDefault(); }
  function _dMove(e) {
    if (!_drawOn || !_drawing) return; const p = _dPos(e); const ctx = _drawCtx; if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(_drawLast.x, _drawLast.y); ctx.lineTo(p.x, p.y);
    if (_drawTool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 36; ctx.strokeStyle = 'rgba(0,0,0,1)'; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = _drawColors[_drawTool] || '#E03131'; ctx.lineWidth = (_drawTool === 'hl') ? 22 : 4; }
    ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; _drawLast = p;
  }
  function _dEnd() { _drawing = false; _drawLast = null; }
  function clearAnnotation() { if (_drawCtx) _drawCtx.clearRect(0, 0, _drawCtx.canvas.width, _drawCtx.canvas.height); }
  function _selectDrawTool(t, bar) { _drawTool = t; bar.querySelectorAll('[data-tool]').forEach(function (el) { el.classList.toggle('sel', el.dataset.tool === t); }); }
  function ensureDraw() {
    if (document.getElementById('pt-draw')) return;
    const cv = document.createElement('canvas'); cv.id = 'pt-draw'; document.body.appendChild(cv);
    _drawCtx = cv.getContext('2d'); _sizeDraw();
    window.addEventListener('resize', function () { if (document.getElementById('pt-draw')) _sizeDraw(); });
    cv.addEventListener('pointerdown', _dStart);
    cv.addEventListener('pointermove', _dMove);
    window.addEventListener('pointerup', _dEnd);
    const bar = document.createElement('div'); bar.id = 'pt-draw-bar'; bar.className = 'pt-toolbar';
    bar.innerHTML =
      '<span class="pt-swatch sel" data-tool="pen1" style="background:#E03131;"></span>'
      + '<span class="pt-swatch" data-tool="pen2" style="background:#1565C0;"></span>'
      + '<span class="pt-swatch" data-tool="hl" style="background:#FFD600;"></span>'
      + '<button class="pt-tool" data-tool="eraser" title="지우개">🧽</button>'
      + '<button class="pt-tool" id="pt-draw-clear" title="전체 지움">🗑</button>'
      + '<button class="pt-tool" id="pt-draw-x" title="닫기 (ESC)">✕</button>';
    document.body.appendChild(bar);
    bar.querySelectorAll('[data-tool]').forEach(function (el) { el.addEventListener('click', function () { _selectDrawTool(el.dataset.tool, bar); }); });
    bar.querySelector('#pt-draw-clear').addEventListener('click', clearAnnotation);
    bar.querySelector('#pt-draw-x').addEventListener('click', function () { setDrawActive(false); });
  }
  function setDrawActive(on) {
    ensureDraw(); _drawOn = !!on;
    const cv = document.getElementById('pt-draw'), bar = document.getElementById('pt-draw-bar');
    if (on) { cv.classList.add('on'); bar.classList.add('on'); _drawLastIdx = curIdx; }
    else { cv.classList.remove('on'); bar.classList.remove('on'); _drawing = false; }
  }
  function toggleDraw() { setDrawActive(!_drawOn); }
  // 슬라이드 이동 시 자동 클리어 (rebuild 훅). curIdx가 바뀐 경우에만 지움 → reveal·룰렛 재렌더엔 무동작.
  function clearAnnotationOnNav() { if (curIdx !== _drawLastIdx) { _drawLastIdx = curIdx; clearAnnotation(); } }
  // 차시 목록 복귀 시 진행 도구 정리(홈 화면에 잔존 방지). 켜져 있을 때만 동작 → 미사용 시 DOM 생성 안 함.
  function progressToolsReset() { if (_spotOn) closeSpotlight(); if (_drawOn) setDrawActive(false); if (_tnoteOn) { _tnoteOn = false; const b = document.getElementById('kt-tnote-bar'); if (b) b.style.display = 'none'; const btn = document.getElementById('pt-tnote-btn'); if (btn) btn.classList.remove('on'); } }

  // ---- 기능 스타일 1회 주입 (html·styles.css 불변, classic에서도 동작) ----
  function _injectPTStyle() {
    if (document.getElementById('pt-style')) return;
    const st = document.createElement('style'); st.id = 'pt-style';
    st.textContent =
      ".pt-hud,.pt-toolbar{font-family:inherit}"
      + ".pt-hud{position:fixed;z-index:420;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:14px}"
      + "#pt-timer{right:22px;bottom:22px;min-width:236px;text-align:center}"
      + ".pt-time{font-size:52px;font-weight:800;letter-spacing:1px;color:#1B3A57;line-height:1.1;font-variant-numeric:tabular-nums}"
      + ".pt-time.warn{color:#E8590C}.pt-time.done{color:#E03131;animation:pt-blink .5s steps(1) 6}"
      + "@keyframes pt-blink{50%{opacity:.15}}"
      + ".pt-presets{display:flex;gap:6px;justify-content:center;margin:10px 0 8px;flex-wrap:wrap}"
      + ".pt-chip{border:2px solid #D7E6F5;background:#F4F9FF;color:#1565C0;font-weight:800;font-size:15px;border-radius:10px;padding:7px 12px;cursor:pointer;font-family:inherit}"
      + ".pt-chip:hover{border-color:#1565C0}"
      + ".pt-row{display:flex;gap:6px;justify-content:center;align-items:center;margin-top:4px}"
      + ".pt-btn{border:none;border-radius:10px;padding:8px 15px;font-weight:800;font-size:15px;cursor:pointer;font-family:inherit}"
      + ".pt-btn.go{background:#1565C0;color:#fff}.pt-btn.sec{background:#EAF2FB;color:#1565C0}"
      + ".pt-custom{width:58px;text-align:center;border:2px solid #D7E6F5;border-radius:8px;padding:6px;font-size:15px;font-family:inherit}"
      + "#pt-spot-bar{left:50%;top:16px;transform:translateX(-50%);display:none;gap:8px;align-items:center;padding:10px 14px}"
      + ".pt-spot-lbl{font-weight:800;color:#1B3A57;font-size:15px}"
      + "#pt-spot{position:fixed;inset:0;z-index:320;pointer-events:none;display:none;background:radial-gradient(circle var(--pt-r,150px) at var(--pt-x,50%) var(--pt-y,50%),rgba(0,0,0,0) 0,rgba(0,0,0,0) var(--pt-r,150px),rgba(0,0,0,.80) calc(var(--pt-r,150px) + 64px))}"
      + "#pt-draw{position:fixed;inset:0;z-index:350;display:none;touch-action:none;cursor:crosshair}#pt-draw.on{display:block}"
      + ".pt-toolbar{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;z-index:420;display:none;gap:8px;align-items:center;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:10px 12px}"
      + ".pt-toolbar.on{display:flex}"
      + ".pt-swatch{width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #D7E6F5;cursor:pointer}.pt-swatch.sel{box-shadow:0 0 0 3px #1B3A57}"
      + ".pt-tool{border:2px solid #D7E6F5;background:#F4F9FF;border-radius:10px;padding:8px 10px;font-size:18px;cursor:pointer;font-family:inherit}.pt-tool.sel{border-color:#1B3A57;background:#E7F0FB}"
      + "#pt-pulse{position:fixed;inset:0;z-index:360;pointer-events:none;display:none}#pt-pulse.on{animation:pt-pulse 1.3s ease-out}"
      + "@keyframes pt-pulse{0%{box-shadow:inset 0 0 0 0 rgba(21,101,192,0)}18%{box-shadow:inset 0 0 130px 20px rgba(21,101,192,.55)}100%{box-shadow:inset 0 0 0 0 rgba(21,101,192,0)}}"
      + ".kt-pr-card.spin .kt-pr-name{opacity:.92;transform:scale(.98)}";
    document.head.appendChild(st);
  }

  // ---- 툴바 주입 + ESC 체인 ----
  function setupProgressTools() {
    if (document.getElementById('pt-timer-btn')) return;
    const fullBtn = document.getElementById('full-btn');
    if (!fullBtn || !fullBtn.parentNode) return;
    _injectPTStyle();
    const parent = fullBtn.parentNode;
    const anchor = document.getElementById('klab-dock-btn') || fullBtn; // 도크 옆(왼쪽)에 나란히
    function mk(id, txt, title, fn) { const b = document.createElement('button'); b.className = 'icon-btn'; b.id = id; b.textContent = txt; b.title = title; b.addEventListener('click', function (e) { e.stopPropagation(); fn(); }); return b; }
    parent.insertBefore(mk('pt-timer-btn', '⏱ 타이머', '수업 타이머 (1·3·5·10분)', toggleTimer), anchor);
    parent.insertBefore(mk('pt-spot-btn', '🔦 집중', '스포트라이트 — 화면 어둡게 + 포인터 하이라이트 (ESC 해제)', toggleSpotlight), anchor);
    parent.insertBefore(mk('pt-draw-btn', '✏️ 판서', '슬라이드 위 판서 — 펜·형광펜·지우개 (ESC 해제, 슬라이드 이동 시 지워짐)', toggleDraw), anchor);
    parent.insertBefore(mk('pt-tnote-btn', '👩‍🏫 발문', '교사 발문 메모 — 화면 하단에 표시 (학생 화면 가림 최소)', toggleTnote), anchor);
    // ESC 체인: 캡처 단계에서 스포트라이트 → 판서 순으로만 소비. 그 외(케이랩 오버레이·전체화면)는 기존 핸들러에 위임.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (_spotOn) { closeSpotlight(); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (_drawOn) { setDrawActive(false); e.preventDefault(); e.stopImmediatePropagation(); return; }
    }, true);
  }

  // ---- L0-⑦ 발문 토글: 툴바 👩‍🏫 → 화면 하단 얇은 HUD에 현재 슬라이드 tnote(즉석 발문). 세션 유지(메모리만·localStorage 무간섭). ----
  let _tnoteOn = false;
  function ensureTnoteBar() {
    if (document.getElementById('kt-tnote-bar')) return;
    const bar = document.createElement('div'); bar.id = 'kt-tnote-bar'; bar.style.display = 'none';
    document.body.appendChild(bar);
  }
  function paintTnote() {
    const bar = document.getElementById('kt-tnote-bar'); if (!bar) return;
    if (!_tnoteOn) { bar.style.display = 'none'; return; }
    const cur = slides[curIdx]; const tn = cur && cur.tnote;
    if (!tn || ((!tn.ask || !tn.ask.length) && !tn.watch)) {
      bar.innerHTML = '<span class="kt-tn-empty">이 슬라이드에는 발문 메모가 없어요</span>';
    } else {
      let html = '<span class="kt-tn-badge">👩‍🏫 발문</span>';
      if (tn.ask && tn.ask.length) html += tn.ask.map(function (a) { return '<span class="kt-tn-ask">' + md(a) + '</span>'; }).join('');
      if (tn.watch) html += '<span class="kt-tn-watch">⚠ ' + md(tn.watch) + '</span>';
      if (tn.min) html += '<span class="kt-tn-min">⏱ ' + tn.min + '분</span>';
      bar.innerHTML = html;
    }
    bar.style.display = 'flex';
  }
  function toggleTnote() {
    _tnoteOn = !_tnoteOn; ensureTnoteBar(); paintTnote();
    const b = document.getElementById('pt-tnote-btn'); if (b) b.classList.toggle('on', _tnoteOn);
  }

  // ---- L0(40분 수업 채움) 신설·확장 블록 기능 CSS 1회 주입 (teacher-styles.css·teacher-v3.css 불변, classic·v3 양쪽 동작) ----
  function _injectL0Style() {
    if (document.getElementById('kt-l0-style')) return;
    const st = document.createElement('style'); st.id = 'kt-l0-style';
    st.textContent =
      // ① review 문항형
      ".kt-rv-grid{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;width:100%}"
      + ".kt-rv-card{min-width:190px;max-width:340px;flex:1 1 230px;background:var(--c-card);border:2.5px solid var(--c-accent-soft);border-radius:16px;padding:18px 20px;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;box-shadow:0 4px 14px rgba(0,0,0,.06)}"
      + ".kt-rv-card:hover{transform:translateY(-2px);border-color:var(--c-accent);box-shadow:0 8px 22px rgba(0,0,0,.1)}"
      + ".kt-rv-card.on{border-color:var(--c-accent);background:var(--c-accent-soft)}"
      + ".kt-rv-q{font-size:clamp(17px,2.4cqw,23px);font-weight:800;color:var(--c-text);margin-bottom:10px;line-height:1.4}"
      + ".kt-rv-a{font-size:clamp(15px,2.1cqw,20px);font-weight:700;color:var(--c-accent-text);min-height:1.4em}"
      + ".kt-rv-card:not(.on) .kt-rv-a{color:var(--c-text-mute);font-weight:600}"
      // ② 실사 장면 이미지 (motivate·concept)
      + ".kt-scene-img{width:100%;max-width:720px;margin:0 auto}"
      + ".kt-scene-img img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.14);display:block}"
      // ④ 짝·모둠 활동 표준
      + ".kt-oa-goal{font-size:clamp(16px,2.1cqw,20px);font-weight:800;color:var(--c-accent-text);margin:2px 0 4px}"
      + ".kt-oa-steps{counter-reset:oa;list-style:none;padding:0;margin:6px 0;display:flex;flex-direction:column;gap:10px;width:100%;max-width:520px}"
      + ".kt-oa-steps li{counter-increment:oa;position:relative;padding:12px 16px 12px 52px;background:var(--c-card);border:2px solid var(--c-accent-soft);border-radius:12px;font-size:clamp(15px,2cqw,19px);font-weight:600;color:var(--c-text);text-align:left}"
      + ".kt-oa-steps li::before{content:counter(oa);position:absolute;left:12px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;background:var(--c-accent);color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:16px}"
      + ".kt-oa-mats{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin-top:6px}"
      + ".kt-oa-mats-lbl{font-weight:800;color:var(--c-text-light);font-size:14px}"
      + ".kt-oa-chip{background:var(--c-warm-soft);color:var(--c-warm);border-radius:999px;padding:6px 14px;font-weight:700;font-size:14px}"
      + ".kt-oa-timer{margin-top:12px;border:none;border-radius:12px;padding:11px 22px;background:var(--c-accent);color:#fff;font-weight:800;font-size:16px;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(0,0,0,.12)}"
      + ".kt-oa-timer:hover{filter:brightness(1.06)}"
      // ⑤ 수준별 문제층
      + ".kt-lv-tabs{display:flex;gap:8px;justify-content:center}"
      + ".kt-lv-tab{border:2.5px solid transparent;background:var(--c-accent-soft);color:var(--c-text-light);font-weight:800;font-size:clamp(15px,1.9cqw,18px);border-radius:12px 12px 0 0;padding:10px 22px;cursor:pointer;font-family:inherit;opacity:.6;transition:opacity .15s}"
      + ".kt-lv-tab.on{opacity:1}"
      + ".kt-lv-tab.kt-lv-basic.on{background:#E6F4EA;color:#2B8A3E;border-color:#2B8A3E}"
      + ".kt-lv-tab.kt-lv-chall.on{background:#E7F0FB;color:#1565C0;border-color:#1565C0}"
      + ".kt-lv-tab.kt-lv-deep.on{background:#F3EAFB;color:#7048C0;border-color:#7048C0}"
      + ".kt-lv-body{width:100%;max-width:640px;background:var(--c-card);border:2.5px solid var(--c-accent-soft);border-radius:0 16px 16px 16px;padding:24px 26px;box-shadow:0 6px 20px rgba(0,0,0,.07)}"
      + ".kt-lv-body.kt-lv-basic{border-color:#2B8A3E}.kt-lv-body.kt-lv-chall{border-color:#1565C0}.kt-lv-body.kt-lv-deep{border-color:#7048C0}"
      + ".kt-lv-q{font-size:clamp(19px,2.7cqw,27px);font-weight:800;color:var(--c-text);line-height:1.5}"
      + ".kt-lv-ans{margin-top:16px;font-size:clamp(18px,2.4cqw,24px);font-weight:800;color:#2B8A3E;background:#E6F4EA;border-radius:12px;padding:12px 18px}"
      + ".kt-lv-ans.open{color:#7048C0;background:#F3EAFB}"
      + ".kt-lv-steps{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center}"
      + ".kt-lv-step{background:var(--c-bg);border:1.5px solid var(--c-accent-soft);border-radius:8px;padding:6px 12px;font-weight:700;font-size:15px;color:var(--c-text)}"
      + ".kt-lv-arr{color:var(--c-text-mute);font-weight:800}"
      // ⑥ 출구 퀴즈
      + ".kt-et-wrap{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;align-items:stretch;width:100%}"
      + ".kt-et-qs{flex:1 1 340px;max-width:520px;display:flex;flex-direction:column;gap:12px}"
      + ".kt-et-card{background:var(--c-card);border:2.5px solid var(--c-accent-soft);border-radius:14px;padding:16px 20px;cursor:pointer;transition:border-color .15s,transform .15s;box-shadow:0 3px 12px rgba(0,0,0,.05)}"
      + ".kt-et-card:hover{transform:translateY(-2px);border-color:var(--c-accent)}"
      + ".kt-et-card.on{border-color:var(--c-accent);background:var(--c-accent-soft)}"
      + ".kt-et-q{font-size:clamp(16px,2.1cqw,21px);font-weight:800;color:var(--c-text);margin-bottom:8px}"
      + ".kt-et-a{font-size:clamp(15px,1.9cqw,19px);font-weight:700;color:var(--c-accent-text)}"
      + ".kt-et-card:not(.on) .kt-et-a{color:var(--c-text-mute);font-weight:600}"
      + ".kt-et-signal{flex:0 1 260px;background:var(--c-bg);border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:12px;justify-content:center}"
      + ".kt-et-signal-t{font-weight:800;color:var(--c-text-light);font-size:15px;text-align:center;margin-bottom:2px}"
      + ".kt-et-light{display:flex;align-items:center;gap:10px;background:var(--c-card);border-radius:12px;padding:10px 14px;font-weight:700;font-size:clamp(14px,1.8cqw,17px);color:var(--c-text)}"
      + ".kt-et-dot{font-size:22px}"
      // ⑦ 발문 하단 바
      + "#kt-tnote-bar{position:fixed;left:0;right:0;bottom:0;z-index:400;background:rgba(27,58,87,.96);color:#fff;padding:10px 18px;display:none;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px;box-shadow:0 -4px 20px rgba(0,0,0,.25)}"
      + ".kt-tn-badge{background:#fff;color:#1B3A57;font-weight:800;border-radius:8px;padding:4px 11px;font-size:13px;white-space:nowrap}"
      + ".kt-tn-ask{background:rgba(255,255,255,.16);border-radius:8px;padding:4px 12px;font-weight:600}"
      + ".kt-tn-watch{background:rgba(232,89,12,.92);border-radius:8px;padding:4px 12px;font-weight:600}"
      + ".kt-tn-min{background:rgba(255,255,255,.16);border-radius:8px;padding:4px 12px;font-weight:700;white-space:nowrap}"
      + ".kt-tn-empty{opacity:.7}"
      + "#pt-tnote-btn.on{background:#1B3A57;color:#fff}";
    document.head.appendChild(st);
  }

  global.Teacher = {
    init(config) {
      CURRICULUM = config.curriculum || [];
      LESSONS = config.lessons || {};
      SUBJECT_INFO = config.subject || {};
      _injectL0Style();
      renderHome();
      bindEvents();
      initTheme();
      setupKlabDock();
      setupProgressTools();
      // 딥링크(검수·공유용): ?unit=2&lesson=3 (u2/l03 접두도 허용) → 자동 차시 진입.
      // 무효·미준비 차시면 openShow 자체 가드(LESSONS 미존재 시 return)로 홈 유지. ?theme=classic과 공존.
      try {
        const q = new URLSearchParams(location.search);
        const u = q.get('unit'), l = q.get('lesson');
        if (u && l) openShow(String(u).replace(/^u/i, ''), String(l).replace(/^l/i, ''));
      } catch (e) { /* 딥링크 무시 — 홈 유지 */ }
    },
    // 디버그·외부 호출용
    openShow,
    backToHome,
    exportPptx,
    exportWorksheet,
    // 테마 외부 호출용 (디버그·확장)
    setTheme(t) { _themeState.t = t; applyThemeState(_themeState); saveThemeState(_themeState); },
    setFont(f) { _themeState.f = f; applyThemeState(_themeState); saveThemeState(_themeState); }
  };

})(window);
