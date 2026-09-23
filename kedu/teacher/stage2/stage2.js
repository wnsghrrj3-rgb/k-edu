/* ============================================================================
   stage2.js — 케이티처 2세대 무대 엔진 (2026-09-22 신설)
   · 1세대 데이터(data/g{g}_{과목}_u{N}.js 의 window.LESSONS)와 자료층(resources/)을
     그대로 읽는다. 데이터 형식은 한 글자도 안 바꾼다 — 481차시 7,723슬라이드가 그대로 선다.
   · 1600×900 캔버스 · 조각(fragment) 순차 공개 · 정답 공개 · 교사 HUD(타이머·뽑기·점수판·
     펜·스포트라이트·검은 화면·발문·자료·목차) · 단계별 40분 진행 막대.
   · 1세대 엔진(teacher-engine.js)과 파일·전역·저장 키를 공유하지 않는다.
   진입: stage.html?g=1&s=math&u=1&l=u1_l01   (l 은 LESSONS 키)
   ============================================================================ */
(function (global) {
  'use strict';
  const doc = global.document;
  const W = 1600, H = 900;
  const STAGES = ['도입', '전개', '기본문제', '응용문제', '정리'];
  // 차시_밀도_표준_v2 §1: 도입 5~8 · 전개 25 · 정리 7~10 → 40분
  const STAGE_MIN = { '도입': 7, '전개': 12, '기본문제': 7, '응용문제': 6, '정리': 8 };
  const SEVEN = ['①복습 문항', '②실사 장면', '③차시 서사', '④교실 활동', '⑤수준별 문제', '⑥출구 확인', '⑦발문 6슬↑'];
  const EDITABLE = '.kt2-title, .big-text, .center-text, .small-text, .big-q, .objective-card, .point > div, .steps li, .kid .bub, .kid .lbl, .flip .q, .flip .a, .mis-card, .offline .body, .offline .goal, .opt > div:not(.mk), .scenario > div:not(.ic), .lv-q, .ra-quote, .context-text, .bidirect, .tf-cap, .examples .ex, .areas div, .sa .lb, .light .lb, .cq .cl, .cq .nm, .legacy .t, .legacy .d, .kt2-cover-title, .kt2-sub';
  const STAGE_COLOR = { '도입': '#FF8A3D', '전개': '#4F8DF7', '기본문제': '#12B886', '응용문제': '#7C5CFF', '정리': '#2CB1D6' };
  const SUBJ_KO = { math: '수학', korean: '국어', science: '과학', social: '사회', english: '영어' };
  const NO_FRAG = new Set(['cover', 'objective', 'question', 'next_lesson', 'interactive_ten_frame', 'interactive_cube_stairs', 'interactive_number_line', 'klab', 'math_tool', 'quiz_gen', 'activity', 'card_arrange', 'card_quiz', 'chosung_quiz', 'present', 'read_aloud', 'leveled_problem', 'exit_ticket', 'trace', 'number_line_demo']);
  const TYPE_LABEL = { video: '영상', fun_question: '발문', game: '게임', real_world: '실생활', extension: '확장', book: '책', tip: '학습팁', misconception: '오개념', other_activity: '다른 활동', link: '자료', kedu: '케이에듀' };
  const TEACHER_TYPES = new Set(['tip', 'misconception']);
  const BLOCK_LABEL = { cover: '표지', review: '복습', objective: '목표', motivate: '도입 상황', concept: '개념', visual_demo: '시각 자료', compare: '비교', basic_problem: '기본 문제', advanced_problem: '응용 문제', real_world: '생활 속', game: '활동·놀이', summary: '요약', question: '발문', next_lesson: '다음 차시', arrow_flow: '흐름', misconception: '오개념', number_line_demo: '수직선', interactive_ten_frame: '십 배열판', interactive_cube_stairs: '큐브 쌓기', interactive_number_line: '수직선', klab: '케이랩', math_tool: '케이랩', quiz_gen: '케이퀴즈', card_arrange: '카드 순서', offline_activity: '교실 활동', leveled_problem: '수준별 문제', exit_ticket: '출구 퀴즈', card_quiz: '카드 퀴즈', read_aloud: '읽어 주기', chosung_quiz: '초성 퀴즈', present: '발표 뽑기', match: '짝짓기', multi: '여러 답', trace: '따라 쓰기', self_assessment: '자기 평가', activity: '활동' };

  // ───────────────────────── 유틸 ─────────────────────────
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function md(t) {
    if (t == null || t === '') return '';
    // 데이터가 쓰는 태그는 <br>·<b> 둘뿐(전수 497·12) — 그 둘만 되살리고 나머지는 글자로
    return esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/&lt;br\s*\/?&gt;/gi, '<br>').replace(/&lt;b&gt;/gi, '<strong>').replace(/&lt;\/b&gt;/gi, '</strong>').replace(/\n/g, '<br>');
  }
  function hashSeed(str) { let h = 0; for (let i = 0; i < (str || '').length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return Math.abs(h) || 1; }
  function seededShuffle(n, seed) { let s = seed || 1; const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtClock(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + pad2(sec % 60); }
  function lsGet(k, d) { try { const v = global.localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { global.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장 못 해도 수업은 간다 */ } }
  function isStr(x) { return typeof x === 'string'; }
  function lbl(x, k) { return isStr(x) ? x : (x && (x[k || 'label'] || x.label || x.text || x.q || '')) || ''; }

  // ───────────────────────── 시각 부품 ─────────────────────────
  function tenFrame(count, size) {
    if (global.KT2_ART) return global.KT2_ART.tenFrameChips(count, size);
    size = size || 46; const gap = 5, cols = 5, rows = 2;
    const w = cols * size + (cols - 1) * gap, h = rows * size + (rows - 1) * gap;
    let cells = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      cells += '<rect class="cell' + (i < count ? ' on' : '') + '" x="' + (c * (size + gap)) + '" y="' + (r * (size + gap)) + '" width="' + size + '" height="' + size + '" rx="7"/>';
    }
    return '<svg class="tenframe" width="' + (w + 4) + '" height="' + (h + 4) + '" viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '" xmlns="http://www.w3.org/2000/svg">' + cells + '</svg>';
  }
  function emojiCount(e, n, big) { return '<div class="emoji-row count' + (big ? ' big' : '') + '">' + Array.from({ length: Math.max(0, +n || 0) }, () => '<span>' + esc(e) + '</span>').join('') + '</div>'; }
  function dots(n) { return '<div class="dots">' + Array.from({ length: +n || 0 }, () => '<i></i>').join('') + '</div>'; }
  function stack(n, cls) { return '<div class="stack ' + (cls || '') + '">' + Array.from({ length: +n || 0 }, () => '<div class="cube"></div>').join('') + '<div class="lbl">' + n + '</div></div>'; }
  function staircase(a, b) { let h = '<div class="cubes">'; for (let n = a; n <= b; n++) h += stack(n); return h + '</div>'; }
  function sequence(seq, hl) {
    return '<div class="seq">' + seq.map((s, i) => {
      const blank = s === '?' || s === null || s === '';
      return '<span class="c' + (blank ? ' blank' : '') + (hl !== undefined && i === hl ? ' hl' : '') + '">' + (blank ? '?' : md(String(s))) + '</span>';
    }).join('<span class="a">→</span>') + '</div>';
  }
  function table(t) {
    if (!t || !t.length) return '';
    if (t[0].kor !== undefined || t[0].han !== undefined) return '<table class="num-table"><thead><tr><th>수</th><th>우리말</th><th>한자어</th></tr></thead><tbody>' + t.map(r => '<tr><td>' + esc(r.num) + '</td><td>' + md(r.kor) + '</td><td>' + md(r.han) + '</td></tr>').join('') + '</tbody></table>';
    const ks = Object.keys(t[0]);
    return '<table class="num-table"><thead><tr>' + ks.map(k => '<th>' + esc(k) + '</th>').join('') + '</tr></thead><tbody>' + t.map(r => '<tr>' + ks.map(k => '<td>' + md(r[k]) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  }
  function tfStrip(arr) { return '<div class="tf-strip">' + arr.map(n => '<div class="tfs">' + tenFrame(n, 26) + '<b>' + n + '</b></div>').join('') + '</div>'; }
  function numLine(range, anchor, cur) {
    const [min, max] = range; const n = max - min + 1; let h = '<div class="numline"><div class="ln"></div>';
    for (let i = 0; i < n; i++) {
      const v = min + i, p = (i / (n - 1)) * 100;
      let cls = ''; if (v === anchor) cls = 'anchor'; else if (anchor !== undefined && (v === anchor - 1 || v === anchor + 1)) cls = 'active'; if (v === cur) cls = 'cur';
      if (anchor !== undefined && v === anchor - 1) h += '<div class="ar" style="left:' + p + '%">−1</div>';
      if (anchor !== undefined && v === anchor + 1) h += '<div class="ar" style="left:' + p + '%">+1</div>';
      h += '<div class="dot ' + cls + '" style="left:' + p + '%" data-act="nl" data-n="' + v + '"></div><div class="lb" style="left:' + p + '%">' + v + '</div>';
    }
    return h + '</div>';
  }
  function tfItem(it) {
    let v = '';
    if (it.ten_frame !== undefined) v = tenFrame(it.ten_frame);
    else if (it.linking_cube !== undefined) v = stack(it.linking_cube, 'single');
    else if (it.emoji && it.count !== undefined) v = emojiCount(it.emoji, it.count);
    else if (it.dots !== undefined) v = dots(it.dots);
    return '<div class="tf-item' + (it.is_anchor ? ' anchor' : '') + '">' + v + (it.num !== undefined ? '<div class="tf-num">' + esc(it.num) + '</div>' : '') + ((it.label || it.caption) ? '<div class="tf-cap">' + md(it.label || it.caption) + '</div>' : '') + (it.note ? '<div class="small-text">' + md(it.note) + '</div>' : '') + '</div>';
  }
  function tfRow(items) { return '<div class="tf-row">' + items.map(tfItem).join('') + '</div>'; }
  function image(src, title) {
    if (!src) return '';
    const p = /^(https?:|\/)/.test(src) ? src : '../' + src;
    return '<div class="img-frame" data-title="' + esc(title || '') + '"><img src="' + esc(p) + '" alt="" loading="lazy" onerror="if(window.KT2&&KT2.imgFallback)KT2.imgFallback(this);else{var p=this.closest(\'.img-frame\');if(p)p.style.display=\'none\'}"></div>';
  }
  function imgFallback(img) { const f = img.closest('.img-frame'); if (!f) return; const A = global.KT2_ART; const body = f.closest('.kt2-body'); if (!A || (body && body.querySelector('.picture'))) { f.style.display = 'none'; f.classList.add('gone'); return; } f.classList.add('illus'); f.innerHTML = A.backdrop(A.kindOf(f.getAttribute('data-title'))); }
  // 인물 장면 = 그림책 무대 위에 선다
  function picture(sceneHtml, hint) { const A = global.KT2_ART; if (!A) return sceneHtml; return '<div class="picture ' + A.kindOf(hint) + '">' + A.backdrop(A.kindOf(hint)) + sceneHtml + '</div>'; }
  function isSpeech(t) { t = String(t || ''); return /["“”「」]/.test(t) || /[!?！？…~]$/.test(t.trim()); }
  function kidCard(k) {
    const A = global.KT2_ART, chr = A && A.character ? A.character(k.face) : '';
    const face = chr ? chr : esc(k.face || '🙂'), label = k.label || '';
    if (isSpeech(label)) { const m = String(label).match(/^\s*([^"“「]{1,8})\s*["“「](.+)["”」]\s*$/); const who = m ? m[1] : ''; const say = m ? m[2] : String(label).replace(/^["“「]|["”」]$/g, ''); return '<div class="kid talk"><div class="bub">' + md(say) + '</div><div class="face' + (chr ? ' chr' : '') + '">' + face + '</div>' + (who ? '<div class="who">' + md(who) + '</div>' : '') + (k.delta ? '<div class="delta">' + esc(k.delta) + '</div>' : '') + '</div>'; }
    return '<div class="kid"><div class="face' + (chr ? ' chr' : '') + '">' + face + '</div><div class="lbl">' + md(label) + '</div>' + (k.delta ? '<div class="delta">' + esc(k.delta) + '</div>' : '') + '</div>';
  }
  function scenario(sc) { return '<div class="scenario"><div class="ic">' + esc(sc.icon || '💬') + '</div><div>' + md(sc.body || '') + '</div></div>'; }
  function optionBody(o) {
    if (o.emoji && o.count !== undefined) return '<div class="em">' + Array.from({ length: o.count }, () => esc(o.emoji)).join('') + '</div>';
    if (o.ten_frame !== undefined) return tenFrame(o.ten_frame, 30);
    if (o.label) return '<div>' + md(o.label) + '</div>';
    if (o.num !== undefined) return '<div class="nm">' + esc(o.num) + '</div>';
    if (o.text) return '<div>' + md(o.text) + '</div>';
    return '';
  }
  function options(opts, multi, revealed) {
    if (!opts || !opts.length) return '';
    const M = ['A', 'B', 'C', 'D', 'E', 'F'];
    return '<div class="options n' + opts.length + (revealed ? ' revealed' : '') + '">' + opts.map((o, i) => {
      const ok = !!o.correct;
      return '<div class="opt' + (revealed && ok ? ' ok' : '') + '"><div class="mk">' + (multi ? (revealed && ok ? '☑' : '☐') : (M[i] || i + 1)) + '</div>' + optionBody(o) + '</div>';
    }).join('') + '</div>';
  }
  function pairL(p) { if (p.ten_frame !== undefined) return tenFrame(p.ten_frame, 26); if (p.emoji) return '<div class="em">' + esc(p.emoji) + '</div>'; return md(p.label || p.left || ''); }
  function pairR(p) { if (p.num !== undefined) return '<div class="nm">' + esc(p.num) + '</div>'; return md(p.kind || p.right || ''); }
  function pairs(ps, revealed, seed) {
    if (!ps || !ps.length) return '';
    if (revealed) return '<div class="pairs revealed">' + ps.map(p => '<div class="cell">' + pairL(p) + '</div><div class="ar">↔</div><div class="cell">' + pairR(p) + '</div>').join('') + '</div>';
    const sh = seededShuffle(ps.length, seed);
    return '<div class="pairs"><div class="lbl"><span>보기</span><span></span><span>짝</span></div>' + ps.map((p, i) => '<div class="cell">' + pairL(p) + '</div><div class="ar">·</div><div class="cell">' + pairR(ps[sh[i]]) + '</div>').join('') + '</div>';
  }
  function answerBox(d, revealed) {
    const ans = d.answer !== undefined ? d.answer : (d.answers && d.answers[0]);
    if (ans === undefined) return '';
    return '<div class="answer' + (revealed ? ' on' : '') + '"><span>답</span><div class="box">' + (revealed ? md(String(ans)) : '?') + '</div></div>';
  }
  function placeholder(hint) { return '<div class="placeholder">📖 ' + esc(hint || '교재 그림 자리') + '<small>교사가 교재 사진을 보여 주세요</small></div>'; }

  // ───────────────────────── 슬라이드 렌더 ─────────────────────────
  // 반환 { title, sub, body(HTML), cls, frag(순차 공개 여부), answerable }
  function renderSlide(slide, ctx) {
    let d = slide.data || {}; const rev = !!ctx.revealed; const S = ctx.state; const seed = hashSeed(slide.id || '');
    // 👉 로 시작하는 note 는 교사에게 주는 말이라 학생 화면(TV)에 안 띄우고 발문 띠(N)로 보낸다
    let teacherNote = '';
    if (isStr(d.note) && /^\s*👉/.test(d.note)) { teacherNote = d.note.replace(/^\s*👉\s*/, ''); d = Object.assign({}, d, { note: undefined }); }
    const b = []; let title = d.title || ''; let sub = d.sub || ''; let cls = ''; let answerable = false;
    const push = (h) => { if (h) b.push(h); };
    switch (slide.block) {
      case 'cover': {
        const lines = String(d.title || '').split('\n').filter(Boolean);
        const first = lines.shift() || '';
        return { cover: true, body: (d.emoji ? '<div class="kt2-cover-emoji">' + esc(d.emoji) + '</div>' : '') + '<div class="kt2-cover-unit">' + esc(ctx.unitTitle || '') + '</div><div class="kt2-cover-title">' + md(first) + (lines.length ? '<span class="l2">' + lines.map(md).join('<br>') + '</span>' : '') + '</div>' + '<div class="kt2-cover-meta"><span>' + esc(ctx.meta.subtitle || ctx.meta.title || '') + '</span><span>⏱ ' + (ctx.meta.duration || 40) + '분</span>' + (ctx.meta.std ? '<span>' + esc(ctx.meta.std) + '</span>' : '') + '</div>' };
      }
      case 'objective': push('<div class="objective-card">' + md(d.content || d.desc || '') + '</div>'); break;
      case 'question': push('<div class="big-q">' + md(d.content || d.question || '') + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>'); break;
      case 'next_lesson': push('<div class="big-q soft">' + md(d.preview || '') + '</div>'); if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>'); break;
      case 'review': {
        if (d.content) push('<div class="center-text">' + md(d.content) + '</div>');
        if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>');
        if (d.items) { const f = S.flipped || []; push('<div class="flipgrid n' + Math.min(4, d.items.length) + '">' + d.items.map((it, i) => '<div class="flip' + (f[i] ? ' on' : '') + '" data-act="flip" data-i="' + i + '"><div class="q">' + md(it.q) + '</div><div class="a">' + (f[i] ? md(String(it.a !== undefined ? it.a : '')) : '❓ 눌러서 확인') + '</div></div>').join('') + '</div>'); answerable = true; }
        if (d.table) push(table(d.table)); if (d.sequence) push(sequence(d.sequence)); if (d.ten_frame_strip) push(tfStrip(d.ten_frame_strip));
        if (d.areas) push('<div class="areas">' + d.areas.map(a => '<div>' + md(a) + '</div>').join('') + '</div>');
        if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'motivate': {
        title = d.scene_title || d.title || '';
        push(image(d.img, title + ' ' + (d.desc || ''))); if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>');
        if (d.emojis) push('<div class="emoji-row">' + d.emojis.map(e => '<span>' + esc(e) + '</span>').join('') + '</div>');
        if (d.emoji && d.count !== undefined) push(emojiCount(d.emoji, d.count, true));
        if (d.kids) push(picture('<div class="scene">' + d.kids.map(kidCard).join('') + '</div>', title + ' ' + (d.scene || '') + ' ' + (d.desc || '') + ' ' + (d.question || '')));
        if (d.scene) push('<div class="center-text">' + md(d.scene) + '</div>');
        if (d.teams) push('<div class="teams">' + d.teams.map(t => '<div class="team"><div class="team-name">' + md(t.name || '') + '</div>' + (t.emoji && t.count !== undefined ? emojiCount(t.emoji, t.count) : '') + '</div>').join('') + '</div>');
        if (d.number_panel) push('<div class="number-panel">' + d.number_panel.map(n => '<span>' + esc(n) + '</span>').join('') + '</div>');
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>');
        break;
      }
      case 'concept': {
        push(image(d.img, title + ' ' + (d.content || ''))); if (d.content) push('<div class="big-text">' + md(d.content) + '</div>');
        if (d.kids_after) push(picture('<div class="scene">' + d.kids_after.map(kidCard).join('') + '</div>', title + ' ' + (d.content || '')));
        if (d.items) push(tfRow(d.items));
        if (d.bidirect) push('<div class="bidirect">' + d.bidirect.map(l => l === '=' ? '<span class="eq">=</span>' : md(l)).join('<br>') + '</div>');
        if (d.examples) push('<div class="examples">' + d.examples.map(e => '<div class="ex">' + md(lbl(e)) + '</div>').join('') + '</div>');
        if (d.pairs) { push(pairs(d.pairs, rev, seed)); answerable = true; }
        if (d.ordinal_map) push('<div class="ordinals">' + d.ordinal_map.map(o => '<div class="ord"><b>' + esc(o.num || '') + '</b><span>' + md(o.label || '') + '</span></div>').join('') + '</div>');
        if (d.linking_cube_staircase) push(staircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]));
        if (d.sequence) push(sequence(d.sequence)); if (d.expression) push('<div class="big-q">' + md(d.expression) + '</div>');
        if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'visual_demo': {
        if (d.ten_frame_solo) { const t = d.ten_frame_solo; push('<div class="tf-item' + (t.is_anchor ? ' anchor' : '') + '">' + tenFrame(t.count, 70) + '<div class="tf-num">' + esc(t.count) + '</div><div class="tf-cap">' + md(t.label || '') + '</div></div>'); }
        if (d.linking_cube_staircase) push(staircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]));
        if (d.left && d.right) push('<div class="compare-cols"><div class="cmp">' + md(lbl(d.left)) + '</div><div class="cmp-sep">vs</div><div class="cmp">' + md(lbl(d.right)) + '</div></div>');
        if (d.items) push(tfRow(d.items)); if (d.content) push('<div class="center-text">' + md(d.content) + '</div>');
        if (d.caption) push('<div class="center-text">' + md(d.caption) + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'trace': push('<div class="trace-row">' + (d.trace_numbers || []).map(n => '<div class="trace"><div class="out">' + esc(n) + '</div><div class="ar">↘</div><div class="lb">' + esc(n) + '</div></div>').join('') + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>'); break;
      case 'compare': {
        if (d.items) push(tfRow(d.items));
        if (d.left && d.right) push('<div class="compare-cols"><div class="cmp">' + md(lbl(d.left)) + '</div><div class="cmp-sep">vs</div><div class="cmp">' + md(lbl(d.right)) + '</div></div>');
        if (d.target !== undefined) push('<div class="match-target"><span>기준</span><b>' + esc(d.target) + '</b></div>');
        if (d.contrast) push('<div class="center-text">' + md(d.contrast) + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'basic_problem': case 'advanced_problem': {
        if (d.context) push('<div class="context-text">' + md(d.context) + '</div>');
        if (d.ten_frame_anchor !== undefined) push('<div class="tf-item anchor">' + tenFrame(d.ten_frame_anchor, 56) + '<div class="tf-num">' + esc(d.ten_frame_anchor) + '</div></div>');
        if (d.ten_frame !== undefined) push('<div class="tf-item anchor">' + tenFrame(d.ten_frame, 56) + '<div class="tf-num">' + esc(d.ten_frame) + '</div></div>');
        if (d.linking_cube !== undefined) push(stack(d.linking_cube, 'single'));
        if (d.emoji && d.count !== undefined) push(emojiCount(d.emoji, d.count, true));
        if (d.card !== undefined) push('<div class="num-card-big">' + esc(d.card) + '</div>');
        if (d.items) push(tfRow(d.items));
        if (d.sequence) push(sequence(d.sequence, d.highlight_pos));
        if (d.cards) push('<div class="num-cards">' + d.cards.map(c => '<span>' + esc(c) + '</span>').join('') + '</div>');
        if (d.target !== undefined && d.component === 'ten_frame') push('<div class="tf-item">' + tenFrame(0, 56) + '<div class="tf-cap">목표 ' + esc(d.target) + '</div></div>');
        if (d.scenario) push(scenario(d.scenario));
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>');
        if (d.questions) push('<div class="q-list">' + d.questions.map(q => '<div class="big-q">' + md(lbl(q, 'q')) + '</div>').join('') + '</div>');
        if (d.challenge) push('<div class="big-q">' + md(d.challenge) + '</div>');
        if (d.options) { push(options(d.options, false, rev)); answerable = answerable || d.options.some(o => o.correct); }
        const ab = answerBox(d, rev); if (ab) { push(ab); answerable = true; }
        if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'match': {
        if (d.target !== undefined) push('<div class="match-target"><span>기준</span><b>' + esc(d.target) + '</b></div>');
        if (d.pairs) { push(pairs(d.pairs, rev, seed)); answerable = true; }
        if (d.options) { push(options(d.options, false, rev)); answerable = true; }
        if (Array.isArray(d.left) && Array.isArray(d.right)) push('<div class="pairs">' + d.left.map((l, i) => '<div class="cell">' + md(lbl(l)) + '</div><div class="ar">·</div><div class="cell">' + md(lbl(d.right[i] || '')) + '</div>').join('') + '</div>');
        if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'multi': push(options(d.options || [], true, rev)); answerable = true; push('<div class="multi-hint">정답을 모두 골라요' + (d.expectedCount ? ' <b>' + esc(d.expectedCount) + '개</b>' : '') + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>'); break;
      case 'real_world': if (d.scenario) push(scenario(d.scenario)); if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>'); if (d.content) push('<div class="center-text">' + md(d.content) + '</div>'); if (d.question) push('<div class="big-q">' + md(d.question) + '</div>'); break;
      case 'game': push('<ol class="steps">' + (d.steps || []).map(s => '<li>' + md(lbl(s)) + '</li>').join('') + '</ol>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>'); break;
      case 'summary': {
        if (d.table) push(table(d.table)); if (d.ten_frame_strip) push(tfStrip(d.ten_frame_strip));
        if (d.bidirect) push('<div class="bidirect">' + d.bidirect.map(l => l === '=' ? '<span class="eq">=</span>' : md(l)).join('<br>') + '</div>');
        if (d.linking_cube_staircase) push(staircase(d.linking_cube_staircase.range[0], d.linking_cube_staircase.range[1]));
        if (d.sequence_asc) push('<div class="seq-block"><div class="seq-label">작은 수 → 큰 수</div>' + sequence(d.sequence_asc) + '</div>');
        if (d.sequence_desc) push('<div class="seq-block"><div class="seq-label">큰 수 → 작은 수</div>' + sequence(d.sequence_desc) + '</div>');
        if (d.sequence) push(sequence(d.sequence));
        if (d.ordinals) push('<div class="ordinals">' + d.ordinals.map(o => '<div class="ord"><span>' + md(lbl(o)) + '</span></div>').join('') + '</div>');
        if (d.arrows) push('<div class="arrow-flow">' + d.arrows.map((a, i) => '<div class="af"><div class="l" style="font-size:30px">' + md(a) + '</div></div>' + (i < d.arrows.length - 1 ? '<div class="af-ar">→</div>' : '')).join('') + '</div>');
        if (d.points) push('<div class="points">' + d.points.map((p, i) => '<div class="point"><i>' + (i + 1) + '</i><div>' + md(lbl(p)) + '</div></div>').join('') + '</div>');
        if (d.questions) push('<div class="q-list">' + d.questions.map(q => '<div class="big-q">' + md(lbl(q, 'q')) + '</div>').join('') + '</div>');
        if (d.content) push('<div class="center-text">' + md(d.content) + '</div>');
        if (d.legend) push('<div class="legend">' + md(d.legend) + '</div>'); if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>'); if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        break;
      }
      case 'self_assessment': {
        const items = d.items || d.dimensions || []; const stars = d.starsPerDimension || d.stars || 3; const st = S.stars || {};
        push('<div class="sa">' + items.map((it, i) => '<div class="row"><div class="lb">' + md(lbl(it)) + '</div><div class="st">' + Array.from({ length: stars }, (_, k) => '<button data-act="star" data-i="' + i + '" data-k="' + k + '" class="' + ((st[i] || 0) > k ? 'on' : '') + '">★</button>').join('') + '</div></div>').join('') + '</div>');
        if (d.prompts) push('<div class="sa-prompts">' + d.prompts.map(p => '<div>' + md(p) + '</div>').join('') + '</div>');
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>'); if (d.desc) push('<div class="center-text">' + md(d.desc) + '</div>');
        break;
      }
      case 'arrow_flow': {
        let flow = Array.isArray(d.flow) ? d.flow : null;
        if (!flow && Array.isArray(d.steps)) flow = d.steps.map((s, i) => ({ num: i + 1, label: String(lbl(s)) }));
        if (!flow && Array.isArray(d.pairs)) { const f = (d.labels && d.labels.forward) || '모으면', bw = (d.labels && d.labels.backward) || '가르면'; push('<div class="points">' + d.pairs.map(p => '<div class="af-pair"><span class="sd">' + md(String(p.left)) + '</span><span class="ar">→ ' + esc(f) + ' →</span><span class="sd">' + md(String(p.right)) + '</span><span class="ar">← ' + esc(bw) + ' ←</span></div>').join('') + '</div>'); }
        else if (flow) push('<div class="arrow-flow">' + flow.map((f, i) => '<div class="af"><div class="n ' + (f.type === 'anchor' ? 'anchor' : f.type === 'up' ? 'up' : '') + '">' + esc(f.num) + '</div><div class="l">' + md(f.label) + '</div></div>' + (i < flow.length - 1 ? '<div class="af-ar">→</div>' : '')).join('') + '</div>');
        else if (d.body) push('<div class="center-text">' + md(d.body) + '</div>');
        if (d.sub) { push('<div class="small-text">' + md(d.sub) + '</div>'); sub = ''; }
        break;
      }
      case 'misconception': cls = 'row'; push('<div class="mis-card w"><div class="h"><i>✗</i>' + esc(d.label || '이렇게 생각하기 쉬워요') + '</div>' + md(d.wrong) + '</div>'); push('<div class="mis-card r"><div class="h"><i>✓</i>바르게 알기</div>' + md(d.right) + '</div>'); if (d.hint) push('<div class="mis-hint">' + md(d.hint) + '</div>'); break;
      case 'number_line_demo': push(numLine(d.nl.range, d.nl.anchor)); if (d.caption) push('<div class="center-text">' + md(d.caption) + '</div>'); break;
      case 'leveled_problem': {
        const levels = d.levels || {}; const keys = Object.keys(levels); const cur = levels[S.level] ? S.level : (keys[0] || ''); const lv = levels[cur] || {};
        push('<div class="lv-tabs">' + keys.map(k => '<button class="' + (k === cur ? 'on ' + esc(k) : '') + '" data-act="lv" data-k="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>');
        let ans = '';
        if (rev) { ans = lv.open ? '<div class="lv-a open">💡 여러 답이 가능해요' + (lv.a ? ' — ' + md(String(lv.a)) : '') + '</div>' : '<div class="lv-a">✅ ' + md(String(lv.a !== undefined ? lv.a : '')) + '</div>'; if (lv.steps && lv.steps.length) ans += '<div class="lv-steps">' + lv.steps.map(s => '<span>' + md(s) + '</span>').join('<i>→</i>') + '</div>'; }
        push('<div class="lv-body ' + esc(cur) + '"><div class="lv-q">' + md(lv.q || '') + '</div>' + ans + '</div>');
        push('<div class="ctrls"><button class="btn main" data-act="reveal">' + (rev ? '🙈 정답 숨기기' : '정답 보기 ✨') + '</button></div>');
        if (d.note) push('<div class="small-text">' + md(d.note) + '</div>');
        answerable = true; break;
      }
      case 'exit_ticket': {
        title = d.title || '오늘 확인해요'; const items = d.items || []; const f = S.flipped || []; const cnt = S.lights || [];
        push('<div class="flipgrid n' + Math.min(4, Math.max(2, items.length)) + '">' + items.map((it, i) => '<div class="flip' + (f[i] ? ' on' : '') + '" data-act="flip" data-i="' + i + '"><div class="q">' + md(it.q) + '</div><div class="a">' + (f[i] ? '✅ ' + md(String(it.a !== undefined ? it.a : '')) : '❓ 눌러서 확인') + '</div></div>').join('') + '</div>');
        const self = d.self || []; const L = ['🟢', '🟡', '🔴'];
        if (self.length) push('<div class="signal">' + self.map((s, i) => '<div class="light" data-act="light" data-i="' + i + '" title="손 든 수를 세요"><span class="dot">' + (L[i] || '⚪') + '</span><span class="lb">' + md(s) + '</span><span class="cnt">' + (cnt[i] || 0) + '</span></div>').join('') + '</div>');
        answerable = true; break;
      }
      case 'card_quiz': {
        const cards = d.cards || []; const f = S.flipped || [];
        push('<div class="cq-grid n' + Math.min(6, cards.length) + '">' + cards.map((c, i) => '<div class="cq' + (f[i] ? ' on' : '') + '" data-act="flip" data-i="' + i + '"><div class="in"><div class="f front"><div class="qm">?</div><div class="cl">' + md(c.clue || '') + '</div></div><div class="f back"><div class="em">' + esc(c.emoji || '') + '</div><div class="nm">' + md(c.name || '') + '</div></div></div></div>').join('') + '</div>');
        if (d.outro) push('<div class="outro">' + md(d.outro) + '</div>'); answerable = true; break;
      }
      case 'chosung_quiz': {
        const items = d.items || []; const i = Math.max(0, Math.min(S.idx || 0, items.length - 1)); const q = items[i] || {}; const on = !!S.on;
        push('<div class="counter"><b>' + (i + 1) + '</b> / ' + items.length + ' 문제</div>');
        push('<div class="cz' + (on ? ' on' : '') + '">' + (on ? esc(q.emoji || '') + ' ' + md(q.answer || '') : md(q.chosung || '')) + '</div>');
        if (q.hint) push('<div class="cz-hint">💡 ' + md(q.hint) + '</div>');
        push('<div class="ctrls"><button class="btn ghost" data-act="cz-prev"' + (i === 0 ? ' disabled' : '') + '>◀ 이전</button><button class="btn main" data-act="cz-reveal">' + (on ? '🙈 다시 숨기기' : '정답 보기 ✨') + '</button><button class="btn ghost" data-act="cz-next"' + (i >= items.length - 1 ? ' disabled' : '') + '>다음 ▶</button></div>');
        answerable = true; break;
      }
      case 'present': {
        const names = ctx.classNames && ctx.classNames.length ? ctx.classNames : (d.names || null);
        const count = names ? names.length : (d.count || 24);
        const label = n => names ? md(names[n]) : (n + 1) + '번 친구';
        const picked = S.picked || []; const cur = S.current; const done = picked.length >= count;
        push('<div class="counter"><b>' + picked.length + '</b> / ' + count + ' 명</div>');
        if (done) push('<div class="pr-card on"><div class="pr-end">🎉 모두 발표했어요!</div><div class="hint">' + md(d.end_msg || '우리 반 친구들 이야기를 모두 들어봤어요.') + '</div></div>');
        else if (cur == null) push('<div class="pr-card"><div class="pl">🎤 발표할 친구</div><div class="nm">?</div><div class="hint">' + md(d.hint || '버튼을 눌러 발표할 친구를 뽑아요') + '</div></div>');
        else push('<div class="pr-card on"><div class="pl">🎤 발표할 친구</div><div class="nm pop">' + label(cur) + '</div><div class="hint">' + md(d.hint || '') + '</div></div>');
        push('<div class="ctrls">' + (done ? '' : '<button class="btn main" data-act="pr-next" data-count="' + count + '">' + (cur == null ? '첫 친구 뽑기 🎲' : '다음 친구 🎲') + '</button>') + '<button class="btn ghost" data-act="pr-reset">처음부터</button></div>');
        break;
      }
      case 'read_aloud': {
        const pages = d.pages || []; const p = Math.max(0, Math.min(S.page || 0, pages.length - 1)); const cur = pages[p] || {};
        if (d.author) { sub = d.author; }
        push('<div class="counter"><b>' + (p + 1) + '</b> / ' + pages.length + ' 쪽</div>');
        push('<div class="ra-frame">' + placeholder(cur.img_hint) + '</div>');
        if (cur.quote) push('<div class="ra-quote">' + md(cur.quote) + '</div>');
        push('<div class="ctrls"><button class="btn ghost" data-act="ra-prev"' + (p === 0 ? ' disabled' : '') + '>◀ 이전</button><div class="dotsnav">' + pages.map((_, i) => '<i class="' + (i === p ? 'on' : '') + '"></i>').join('') + '</div><button class="btn main" data-act="ra-next"' + (p >= pages.length - 1 ? ' disabled' : '') + '>다음 ▶</button></div>');
        if (d.copyright) push('<div class="copyright">' + md(d.copyright) + '</div>');
        break;
      }
      case 'interactive_ten_frame': {
        const n = S.count !== undefined ? S.count : (d.start_count || 0);
        push('<div class="i-tf">' + Array.from({ length: 10 }, (_, i) => '<div class="' + (i < n ? 'on' : '') + '" data-act="tf-cell" data-i="' + i + '"></div>').join('') + '</div>');
        push('<div class="i-num">' + n + '</div>');
        push('<div class="ctrls"><button class="btn" data-act="tf-minus">− 하나 빼기</button><button class="btn acc" data-act="tf-plus">+ 하나 더하기</button><button class="btn ghost" data-act="tf-reset" data-init="' + (d.start_count || 0) + '">처음으로</button></div>');
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>');
        break;
      }
      case 'interactive_cube_stairs': {
        const n = S.count !== undefined ? S.count : (d.start_count || 3);
        push('<div class="i-cube-area">' + stack(n) + '</div>');
        push('<div class="ctrls"><button class="btn" data-act="cb-minus">− 하나 빼기</button><button class="btn acc" data-act="cb-plus">+ 하나 쌓기</button><button class="btn ghost" data-act="cb-reset" data-init="' + (d.start_count || 3) + '">처음으로</button></div>');
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>');
        break;
      }
      case 'interactive_number_line': {
        const pos = S.position !== undefined ? S.position : (d.start || 5);
        push(numLine(d.range, undefined, pos));
        push('<div class="i-num">' + pos + '</div>');
        push('<div class="ctrls"><button class="btn" data-act="nl-minus" data-min="' + d.range[0] + '">← 1 작아짐</button><button class="btn acc" data-act="nl-plus" data-max="' + d.range[1] + '">1 커짐 →</button><button class="btn ghost" data-act="nl-reset" data-init="' + (d.start || 5) + '">처음으로</button></div>');
        if (d.question) push('<div class="big-q">' + md(d.question) + '</div>');
        break;
      }
      case 'card_arrange': {
        const init = d.cards || [3, 1, 5, 2, 4]; const target = d.target || [...init].sort((a, b) => a - b);
        const order = S.order || init.slice(); const ok = JSON.stringify(order) === JSON.stringify(target);
        push('<div class="center-text">' + md(d.instruction || '카드 두 장을 차례로 눌러 자리를 바꿔요. 작은 수부터 큰 수 순서로!') + '</div>');
        push('<div class="i-cards">' + order.map((n, i) => '<div class="i-card' + (S.sel === i ? ' sel' : '') + (ok ? ' ok' : '') + '" data-act="ca" data-i="' + i + '">' + esc(n) + '</div>').join('') + '</div>');
        if (ok) push('<div class="success">🎉 잘했어요! 순서대로 잘 놓았어요.</div>');
        push('<div class="ctrls"><button class="btn ghost" data-act="ca-reset">다시 섞기</button></div>');
        break;
      }
      case 'offline_activity': {
        const TL = { pair: '👋 짝 활동', group: '👥 모둠 활동', whole: '🙌 다 함께 활동' }; const TI = { pair: '🤝', group: '👥', whole: '🙌' };
        let h = '<div class="offline"><div class="ic">' + esc(d.icon || TI[d.type] || '🙋') + '</div><div class="tag">' + md(d.tag || TL[d.type] || '교실에서 함께 해요') + '</div>';
        if (d.goal) h += '<div class="goal">🎯 ' + md(d.goal) + '</div>'; if (d.body) h += '<div class="body">' + md(d.body) + '</div>';
        if (d.steps && d.steps.length) h += '<ol class="steps">' + d.steps.map(s => '<li>' + md(lbl(s)) + '</li>').join('') + '</ol>';
        if (Array.isArray(d.materials) && d.materials.length) h += '<div class="mats"><span class="lb">준비물</span>' + d.materials.map(m => '<span>' + md(m) + '</span>').join('') + '</div>';
        else if (isStr(d.materials) && d.materials) h += '<div class="mats"><span class="lb">준비물</span><span>' + md(d.materials) + '</span></div>';
        if (d.minutes) h += '<div class="ctrls" style="justify-content:flex-start"><button class="btn main" data-act="timer" data-min="' + (+d.minutes) + '">⏱ ' + esc(d.minutes) + '분 타이머 켜기</button></div>';
        push(h + '</div>'); break;
      }
      case 'klab': case 'math_tool': push('<div class="klab-frame" data-klab="' + esc(d.tool || '') + '" data-config="' + esc(JSON.stringify(d.config || {})) + '"></div>'); break;
      case 'quiz_gen': push('<div class="legacy"><div class="t">🧩 케이퀴즈 — 즉석 문제 생성</div><div class="d">이 슬라이드는 아직 1세대 무대에서만 돌아가요. 2세대 옮김은 다음 사이클.</div>' + (d.lesson ? '<div class="small-text">' + esc(d.lesson) + '</div>' : '') + '</div>'); break;
      case 'activity': {
        // 활동 층(stage2-activity.js): activityId 가 있으면 카탈로그 활동 카드(▶ 활동 시작) · 없으면 1세대 교실 활동 꼴(goal·steps) 그대로
        if (d.activityId && global.KT2_ACTIVITY) { push(global.KT2_ACTIVITY.renderCard(d)); title = ''; break; }
        const TL = { pair: '👋 짝 활동', group: '👥 모둠 활동', whole: '🙌 다 함께 활동', individual: '🙋 혼자 활동' }; const TI = { pair: '🤝', group: '👥', whole: '🙌', individual: '🙋' };
        let h = '<div class="offline"><div class="ic">' + esc(d.icon || TI[d.type] || '🎲') + '</div><div class="tag">' + md(d.tag || TL[d.type] || '활동') + '</div>';
        if (d.goal) h += '<div class="goal">🎯 ' + md(d.goal) + '</div>'; if (d.body || d.desc) h += '<div class="body">' + md(d.body || d.desc) + '</div>';
        if (d.steps && d.steps.length) h += '<ol class="steps">' + d.steps.map(s => '<li>' + md(lbl(s)) + '</li>').join('') + '</ol>';
        if (Array.isArray(d.materials) && d.materials.length) h += '<div class="mats"><span class="lb">준비물</span>' + d.materials.map(m => '<span>' + md(m) + '</span>').join('') + '</div>';
        else if (isStr(d.materials) && d.materials) h += '<div class="mats"><span class="lb">준비물</span><span>' + md(d.materials) + '</span></div>';
        if (d.minutes) h += '<div class="ctrls" style="justify-content:flex-start"><button class="btn main" data-act="timer" data-min="' + (+d.minutes) + '">⏱ ' + esc(d.minutes) + '분 타이머 켜기</button></div>';
        push(h + '</div>'); break;
      }
      default: push('<div class="center-text">' + md(d.content || d.desc || d.body || '') + '</div>');
    }
    if (d.question && !['motivate', 'basic_problem', 'advanced_problem', 'real_world', 'self_assessment', 'question', 'interactive_ten_frame', 'interactive_cube_stairs', 'interactive_number_line'].includes(slide.block)) push('<div class="big-q">' + md(d.question) + '</div>');
    return { title, sub, body: b.join(''), cls, frag: !NO_FRAG.has(slide.block) && b.length > 1, answerable, teacherNote };
  }

  // ───────────────────────── 무대 ─────────────────────────
  function Stage(opts) {
    const self = this;
    const q = opts.params;
    const lessons = opts.lessons || {};
    self.key = q.l; self.slug = 'g' + q.g + '_' + q.s; self.g = +q.g; self.s = q.s; self.u = +q.u;
    const L = lessons[self.key]; self.lessonsRef = lessons;
    if (!L) { doc.getElementById('kt2-stage').innerHTML = '<div style="color:#fff;font-size:22px;text-align:center">차시를 찾지 못했어요: ' + esc(self.key) + '<br><a href="index.html" style="color:#9fb0c3">← 차시 목록</a></div>'; return; }
    self.meta = L.meta || {};
    self.unitTitle = opts.unitTitle || '';
    self.slides = (L.slides || []).map(s => Object.assign({}, s, { included: true }));
    // 자료 병합(1세대 mergeResources 규약 그대로)
    const bag = global.KT_RESOURCES && global.KT_RESOURCES[self.slug]; const res = bag && Array.isArray(bag[self.key]) ? bag[self.key] : [];
    self.extras = (L.extras || []).map(e => Object.assign({}, e));
    const seen = new Set();
    res.forEach(r => { if (!r || !r.id || seen.has(r.id)) return; seen.add(r.id); const i = self.extras.findIndex(e => e.id === r.id); if (i >= 0) self.extras[i] = Object.assign({}, self.extras[i], r); else self.extras.push(Object.assign({}, r)); const fits = Array.isArray(r.fit_slides) ? r.fit_slides : []; if (!fits.length) return; self.slides.forEach(s => { s.suggested_extras = (s.suggested_extras || []).slice(); if ((fits.includes(s.id) || fits.includes(s.block)) && !s.suggested_extras.includes(r.id)) s.suggested_extras.push(r.id); }); });
    self.planKey = 'kt2_plan_' + self.slug + '_' + self.key;
    self.plan = Object.assign({ order: null, skip: [], added: [], text: {}, imgs: {}, tnote: {}, res: {}, broken: {} }, lsGet(self.planKey, {}) || {});
    self.applyPlan();
    self.IS = {}; self.rev = {}; self.frag = {}; self.idx = 0; self.allAtOnce = !!lsGet('kt2_all_at_once', false);
    self.still = !!lsGet('kt2_still', false); self.sound = lsGet('kt2_sound', true) !== false;
    self.classNames = lsGet('kt2_names', []); self.rosterSrc = self.classNames.length ? 'manual' : 'none';
    self.loadRoster();
    self.started = Date.now(); self.stageEnter = {}; self.penStore = {};
    const hash = parseInt((global.location.hash || '').replace('#', ''), 10);
    if (!isNaN(hash)) self.idx = Math.max(0, Math.min(hash - 1, self.slides.length - 1));
    if (global.KT2_ACTIVITY) { try { global.KT2_ACTIVITY.attach(self); } catch (e) { /* 활동 층이 아파도 수업은 간다 */ } }
    self.build(); self.bindGlobal(); self.fit(); self.go(self.idx, 0, true);
  }
  // ───────────────────────── 우리 반 판(편집 층) ─────────────────────────
  Stage.prototype.applyPlan = function () {
    const p = this.plan; const base = this.slides.filter(s => !s._added);
    // 추가한 슬라이드(after = 앞 슬라이드 id)
    (p.added || []).forEach(a => { if (!base.some(s => s.id === a.id)) { const i = base.findIndex(s => s.id === a.after); const sl = Object.assign({}, a, { included: true, _added: true, suggested_extras: [] }); base.splice(i >= 0 ? i + 1 : base.length, 0, sl); } });
    let list = base;
    if (Array.isArray(p.order) && p.order.length) { const byId = new Map(base.map(s => [s.id, s])); list = p.order.map(id => byId.get(id)).filter(Boolean); base.forEach(s => { if (!list.includes(s)) list.push(s); }); }
    list.forEach(s => { s.included = !(p.skip || []).includes(s.id); });
    this.slides = list;
  };
  Stage.prototype.savePlan = function () { this.plan.updated = new Date().toISOString().slice(0, 16); lsSet(this.planKey, this.plan); this.paintPlanBadge(); };
  Stage.prototype.planDirty = function () { const p = this.plan; return !!((p.order && p.order.length) || (p.skip && p.skip.length) || (p.added && p.added.length) || Object.keys(p.text || {}).length || Object.keys(p.imgs || {}).length || Object.keys(p.tnote || {}).length || Object.keys(p.res || {}).length || Object.keys(p.broken || {}).length); };
  // 이 슬라이드에 맞는 자료 = 실측 자료층(fit_slides) ∪ 교사가 붙인 것 − 안 열리는 것
  Stage.prototype.fitFor = function (s) { const fit = new Set(s.suggested_extras || []); const mine = (this.plan.res && this.plan.res[s.id]) || []; const broken = this.plan.broken || {}; const list = this.extras.filter(e => fit.has(e.id) && !broken[e.id]); return list.concat(mine.filter(m => !broken[m.id])); };
  Stage.prototype.attachRes = function (url, title) {
    url = String(url || '').trim(); if (!/^https?:\/\//.test(url)) { this.toast('주소는 http 로 시작해야 해요'); return false; }
    const sid = this.cur().id; const yt = (url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
    const e = { id: 'my_' + Date.now().toString(36), type: yt ? 'video' : 'link', url, video_id: yt || undefined, title: (title || '').trim() || (yt ? '우리 반 영상' : url.replace(/^https?:\/\//, '').slice(0, 40)), source: '우리 반', mine: true, verified: new Date().toISOString().slice(0, 10) };
    this.plan.res[sid] = this.plan.res[sid] || []; this.plan.res[sid].push(e); this.savePlan(); this.toast((yt ? '영상' : '링크') + '을 이 슬라이드에 붙였어요'); return true;
  };
  Stage.prototype.markBroken = function (id) { this.plan.broken[id] = !this.plan.broken[id]; this.savePlan(); this.toast(this.plan.broken[id] ? '안 열리는 자료로 표시했어요 — 내보내기에 담겨요' : '다시 살렸어요'); };
  Stage.prototype.searchUrl = function () { const s = this.cur(); const t = ((s.data || {}).scene_title || (s.data || {}).title || this.meta.subtitle || ''); const q = (this.g + '학년 ' + (SUBJ_KO[this.s] || '') + ' ' + t).replace(/\*\*/g, ''); return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); };
  Stage.prototype.paintPlanBadge = function () { const b = doc.querySelector('#hud button[data-h="toc"]'); if (b) b.innerHTML = this.planDirty() ? '📑 목차 <small style="color:#FFD166">· 우리 반 판</small>' : '📑 목차'; };
  Stage.prototype.resetPlan = function () { this.plan = { order: null, skip: [], added: [], text: {}, imgs: {}, tnote: {} }; try { global.localStorage.removeItem(this.planKey); } catch (e) { } this.slides = this.slides.filter(s => !s._added); const L = this.lessonsRef && this.lessonsRef[this.key]; if (L) { const order = (L.slides || []).map(s => s.id); this.slides.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)); } this.slides.forEach(s => s.included = true); this.idx = Math.min(this.idx, this.slides.length - 1); this.paintPlanBadge(); this.paint(0, true); this.toast('원래 차시로 되돌렸어요'); };
  // 글자 덮어쓰기 경로 = .kt2-body 안 자식 순번 사슬. 제목은 'title'
  Stage.prototype.pathOf = function (el) { if (el.classList.contains('kt2-title') || el.classList.contains('kt2-cover-title')) return 'title'; if (el.classList.contains('kt2-sub')) return 'sub'; const body = el.closest('.kt2-body'); if (!body) return null; const path = []; let n = el; while (n && n !== body) { const par = n.parentNode; path.unshift(Array.prototype.indexOf.call(par.children, n)); n = par; } return 'b.' + path.join('.'); };
  Stage.prototype.byPath = function (path) { const paper = doc.getElementById('kt2-paper'); if (path === 'title') return paper.querySelector('.kt2-title, .kt2-cover-title'); if (path === 'sub') return paper.querySelector('.kt2-sub'); let n = paper.querySelector('.kt2-body'); if (!n) return null; const idx = path.slice(2).split('.').map(Number); for (const i of idx) { n = n && n.children[i]; } return n || null; };
  Stage.prototype.applyOverrides = function () {
    const sid = this.cur().id; const t = (this.plan.text || {})[sid] || {};
    Object.keys(t).forEach(path => { const el = this.byPath(path); if (el) el.innerHTML = t[path]; });
    const img = (this.plan.imgs || {})[sid]; const paper = doc.getElementById('kt2-paper');
    if (img) { const slot = paper.querySelector('.placeholder, .img-frame'); const html = '<div class="img-frame user"><img src="' + img + '" alt=""></div>'; if (slot) { if (slot.classList.contains('img-frame')) slot.innerHTML = '<img src="' + img + '" alt="">'; else slot.outerHTML = html; slot.classList && slot.classList.add('user'); } else { const body = paper.querySelector('.kt2-body'); if (body) { body.insertAdjacentHTML('afterbegin', html); const first = body.firstElementChild; if (this.fragMax) { first.classList.add('frag'); this.fragMax++; } } } }
    if (this.edit) this.paintEdit();
  };
  Stage.prototype.setEdit = function (on) { this.edit = on; this.hudBtn('edit', on); doc.body.classList.toggle('editing', on); if (on) this.toast('편집 — 글자를 눌러 고치고, 사진 자리에 사진을 끌어 놓아요 · 이 기기에만 저장'); this.paint(0, true); };
  Stage.prototype.paintEdit = function () {
    const paper = doc.getElementById('kt2-paper'); const self = this; const sid = this.cur().id;
    paper.querySelectorAll(EDITABLE).forEach(el => { if (el.closest('.klab-frame')) return; el.setAttribute('contenteditable', 'true'); el.classList.add('editable'); el.addEventListener('blur', () => { const path = self.pathOf(el); if (!path) return; self.plan.text[sid] = self.plan.text[sid] || {}; self.plan.text[sid][path] = el.innerHTML; self.savePlan(); }); el.addEventListener('keydown', e => { if (e.key === 'Escape') el.blur(); e.stopPropagation(); }); });
    // 사진 자리
    const body = paper.querySelector('.kt2-body');
    if (body && !this.curRender.cover) {
      const slot = paper.querySelector('.placeholder, .img-frame');
      const bar = doc.createElement('div'); bar.className = 'edit-bar';
      bar.innerHTML = '<button data-e="photo">📷 ' + (slot ? '사진 바꾸기' : '사진 넣기') + '</button>' + ((this.plan.imgs || {})[sid] ? '<button data-e="photo-del">사진 빼기</button>' : '') + (((this.plan.text || {})[sid] && Object.keys(this.plan.text[sid]).length) ? '<button data-e="text-reset">글자 원래대로</button>' : '') + '<span class="note">사진·글자는 이 기기에만 저장돼요 (교재 사진은 교실 수업 범위 안에서만)</span>';
      paper.appendChild(bar);
      bar.querySelector('[data-e="photo"]').addEventListener('click', () => self.pickPhoto());
      const del = bar.querySelector('[data-e="photo-del"]'); if (del) del.addEventListener('click', () => { delete self.plan.imgs[sid]; self.savePlan(); self.paint(0, true); });
      const tr = bar.querySelector('[data-e="text-reset"]'); if (tr) tr.addEventListener('click', () => { delete self.plan.text[sid]; self.savePlan(); self.paint(0, true); });
      if (slot) { slot.classList.add('drop'); slot.addEventListener('click', e => { e.stopPropagation(); self.pickPhoto(); }); }
    }
  };
  Stage.prototype.pickPhoto = function () { const self = this; let inp = doc.getElementById('kt2-file'); if (!inp) { inp = doc.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.id = 'kt2-file'; inp.style.display = 'none'; doc.body.appendChild(inp); } inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) self.loadPhoto(f); inp.value = ''; }; inp.click(); };
  Stage.prototype.loadPhoto = function (file) {
    const self = this; const sid = this.cur().id; if (!global.FileReader) return;
    const rd = new global.FileReader(); rd.onload = () => { const im = new global.Image(); im.onload = () => { const max = 1280; const k = Math.min(1, max / Math.max(im.width, im.height)); const c = doc.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const cx = c.getContext('2d'); cx.drawImage(im, 0, 0, c.width, c.height); let url; try { url = c.toDataURL('image/jpeg', 0.82); } catch (e) { url = rd.result; } if (url.length > 900000) { self.toast('사진이 너무 커요 — 더 작은 사진으로'); return; } self.plan.imgs[sid] = url; self.savePlan(); self.paint(0, true); self.toast('사진을 넣었어요 (이 기기에만)'); }; im.src = rd.result; }; rd.readAsDataURL(file);
  };
  Stage.prototype.addSlide = function (kind) {
    const cur = this.cur(); const id = 'add_' + Date.now().toString(36); const stage = cur.stage;
    const T = { ask: { block: 'question', data: { title: '생각해 봐요', content: '(발문을 적어요)' } }, act: { block: 'offline_activity', data: { title: '함께 해요', type: 'pair', goal: '(활동 목표)', steps: ['(1단계)', '(2단계)'], minutes: 3 } }, photo: { block: 'concept', data: { title: '함께 봐요', content: '(사진 설명)' } }, memo: { block: 'concept', data: { title: '(제목)', content: '(내용)' } } };
    const t = T[kind] || T.memo; const sl = Object.assign({ id, stage, after: cur.id }, t);
    this.plan.added.push(sl); this.savePlan(); this.applyPlanKeepIdx(); const i = this.slides.findIndex(s => s.id === id); this.go(i, 1); if (kind === 'photo') { this.setEdit(true); this.pickPhoto(); } else this.setEdit(true);
  };
  Stage.prototype.applyPlanKeepIdx = function () { const curId = this.cur() && this.cur().id; this.applyPlan(); const i = this.slides.findIndex(s => s.id === curId); this.idx = i >= 0 ? i : 0; };
  Stage.prototype.moveSlide = function (i, dir) { const j = i + dir; if (j < 0 || j >= this.slides.length) return; const a = this.slides[i]; this.slides[i] = this.slides[j]; this.slides[j] = a; this.plan.order = this.slides.map(s => s.id); this.savePlan(); };
  Stage.prototype.removeAdded = function (id) { this.plan.added = this.plan.added.filter(a => a.id !== id); if (this.plan.order) this.plan.order = this.plan.order.filter(x => x !== id); this.savePlan(); this.applyPlanKeepIdx(); };
  Stage.prototype.exportPlan = function () { return JSON.stringify(Object.assign({ v: 1, slug: this.slug, key: this.key }, this.plan)); };
  Stage.prototype.importPlan = function (txt) { try { const p = JSON.parse(txt); if (!p || p.key !== this.key) { this.toast('이 차시의 판이 아니에요'); return false; } this.plan = Object.assign({ order: null, skip: [], added: [], text: {}, imgs: {}, tnote: {} }, p); delete this.plan.v; delete this.plan.slug; delete this.plan.key; this.savePlan(); this.slides = this.slides.filter(s => !s._added); this.applyPlanKeepIdx(); this.paint(0, true); this.toast('우리 반 판을 가져왔어요'); return true; } catch (e) { this.toast('가져오기 실패 — 붙여 넣은 글을 확인'); return false; } };

  // 케이에듀 학급 명단 — 교사 계정의 활성 학급(class_codes) → student_seats(번호+이름). 있으면 뽑기·발표 뽑기가 이걸 쓴다.
  Stage.prototype.loadRoster = function () {
    const self = this; if (!global.supabase || typeof global.getKeduDb !== 'function') return Promise.resolve();
    let db; try { db = global.getKeduDb(); } catch (e) { return Promise.resolve(); }
    return db.auth.getUser().then(r => { const u = r && r.data && r.data.user; if (!u) return; return db.from('class_codes').select('id, label, grade').eq('teacher_id', u.id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).then(c => { const code = c && c.data && c.data[0]; if (!code) return; return db.from('student_seats').select('nickname, seat_no').eq('class_code_id', code.id).then(sr => { const seats = (sr && sr.data) || []; if (!seats.length) return; seats.sort((a, b) => ((a.seat_no == null ? 999 : a.seat_no) - (b.seat_no == null ? 999 : b.seat_no)) || String(a.nickname).localeCompare(String(b.nickname), 'ko')); self.roster = seats.map(x => (x.seat_no != null ? x.seat_no + '번 ' : '') + (x.nickname || '')); self.rosterName = code.label || ((code.grade ? code.grade + '학년 ' : '') + '우리 반'); if (!self.classNames.length) { self.classNames = self.roster.slice(); self.rosterSrc = 'kedu'; } if (self.cur() && self.cur().block === 'present') self.paint(0, true); }); }); }).catch(() => { });
  };
  Stage.prototype.state = function (sid) { if (!this.IS[sid]) this.IS[sid] = {}; return this.IS[sid]; };
  Stage.prototype.cur = function () { return this.slides[this.idx]; };
  Stage.prototype.build = function () {
    const st = doc.getElementById('kt2-stage');
    st.innerHTML = '<div class="kt2-canvas" id="kt2-canvas"><div class="kt2-paper" id="kt2-paper"></div><canvas id="fx" width="' + W + '" height="' + H + '"></canvas><canvas id="pen" width="' + W + '" height="' + H + '"></canvas></div>';
    doc.body.className = 'subj-' + this.s + (this.still ? ' still' : '') + ' tier-' + (this.g <= 2 ? 'low' : this.g <= 4 ? 'mid' : 'high');
    const t = doc.getElementById('hud-top'); if (t) t.querySelector('.ttl').textContent = (this.g + '학년 ' + (SUBJ_KO[this.s] || this.s) + ' · ' + (this.unitTitle ? this.unitTitle + ' · ' : '') + (this.meta.subtitle || this.meta.title || this.key));
    doc.title = (this.meta.subtitle || this.meta.title || this.key) + ' — 케이티처 2세대';
    this.buildHud();
  };
  Stage.prototype.fit = function () {
    const c = doc.getElementById('kt2-canvas'); if (!c) return;
    const vw = global.innerWidth, vh = global.innerHeight;
    const k = Math.min((vw - 24) / W, (vh - 24) / H);
    c.style.transform = 'translate(-50%,-50%) scale(' + k + ')'; this.scale = k;
  };
  // 슬라이드 그리기
  Stage.prototype.paint = function (dir, keepFrag) {
    const s = this.cur(); if (!s) return;
    const paper = doc.getElementById('kt2-paper');
    const r = renderSlide(s, { revealed: !!this.rev[s.id], state: this.state(s.id), meta: this.meta, unitTitle: this.unitTitle, classNames: this.classNames });
    this.curRender = r;
    const n = this.idx + 1, N = this.slides.length;
    const pos = this.slides.slice(0, this.idx + 1).filter(x => x.stage === s.stage).length, tot = this.slides.filter(x => x.stage === s.stage).length;
    if (r.cover) {
      paper.className = 'kt2-paper cover' + (dir ? ' enter' + (dir < 0 ? ' back' : '') : ''); paper.setAttribute('data-stage', s.stage);
      paper.innerHTML = r.body + '<div class="kt2-foot" style="position:absolute;left:84px;right:84px;bottom:48px"><span class="brand">케이티처</span><span class="sp"></span><span class="pg"><b>' + n + '</b> / ' + N + '</span></div>';
    } else {
      paper.className = 'kt2-paper' + (dir ? ' enter' + (dir < 0 ? ' back' : '') : ''); paper.setAttribute('data-stage', s.stage);
      const tl = (r.title || '').length; const tcls = tl > 34 ? ' xs' : tl > 22 ? ' small' : '';
      paper.innerHTML = '<div class="kt2-head"><span class="kt2-chip">' + esc(s.stage) + ' <small style="opacity:.6">' + pos + '/' + tot + '</small></span><span class="kt2-kicker">' + esc(this.meta.subtitle || this.meta.title || '') + '</span><span class="sp"></span>' + (r.answerable && this.rev[s.id] ? '<span class="kt2-answered">✔ 정답 공개</span>' : '') + '</div>'
        + (r.title ? '<h1 class="kt2-title' + tcls + '">' + md(r.title) + '</h1>' : '') + (r.sub ? '<div class="kt2-sub">' + md(r.sub) + '</div>' : '')
        + '<div class="kt2-body' + (r.cls ? ' ' + r.cls : '') + '">' + r.body + '</div>'
        + '<div class="kt2-foot"><span class="brand">케이티처</span>' + (function (fit) { return fit.length ? '<button class="kt2-res-badge" data-act="res-open" title="이 슬라이드에 맞는 자료 ' + fit.length + '개 (R)">📎 <b>' + fit.length + '</b></button>' : ''; })(this.fitFor(s)) + '<span class="kt2-progress"><i style="width:' + Math.round((n / N) * 100) + '%"></i></span><span class="sp"></span><span class="pg"><b>' + n + '</b> / ' + N + '</span></div>';
      // fragments
      if (r.frag && !this.allAtOnce) {
        const kids = Array.from(paper.querySelector('.kt2-body').children);
        const shown = keepFrag && this.frag[s.id] !== undefined ? this.frag[s.id] : (this.frag[s.id] !== undefined ? this.frag[s.id] : 0);
        this.frag[s.id] = Math.min(shown, kids.length - 1); this.fragMax = kids.length - 1;
        kids.forEach((el, i) => { el.classList.add('frag'); if (i > this.frag[s.id]) el.classList.add('hidden'); });
      } else this.fragMax = 0;
      // 케이랩 마운트
      const km = paper.querySelector('[data-klab]');
      if (km) { const tool = km.getAttribute('data-klab'); let cfg = {}; try { cfg = JSON.parse(km.getAttribute('data-config') || '{}'); } catch (e) { } if (global.KLab) this.klabCleanup = global.KLab.mount(km, tool, cfg); else km.innerHTML = '<div class="legacy"><div class="t">🧊 케이랩 ' + esc(tool) + '</div><div class="d">교구 엔진이 이 페이지에 실리지 않았어요.</div></div>'; }
    }
    this.decorate(paper, r); this.applyOverrides(); this.fitBody();
    { const self = this; paper.querySelectorAll('.img-frame img').forEach(im => { im.addEventListener('load', () => self.fitBody()); im.addEventListener('error', () => setTimeout(() => self.fitBody(), 0)); }); }
    this.paintPen(); this.paintHud(); this.paintTnote();
    { const b = doc.querySelector('#hud button[data-h="tnote"]'); if (b) b.textContent = (((s.data || {}).tnote || s.tnote || r.teacherNote) ? '👩‍🏫•' : '👩‍🏫'); }
    try { global.history.replaceState(null, '', '#' + n); } catch (e) { }
  };
  Stage.prototype.go = function (i, dir, first) {
    if (this.klabCleanup) { try { this.klabCleanup(); } catch (e) { } this.klabCleanup = null; }
    i = Math.max(0, Math.min(i, this.slides.length - 1));
    // 건너뛴 슬라이드는 지나간다
    let j = i; const step = dir < 0 ? -1 : 1;
    while (this.slides[j] && !this.slides[j].included && j + step >= 0 && j + step < this.slides.length) j += step;
    this.idx = this.slides[j] && this.slides[j].included ? j : i;
    const st = this.cur().stage; if (!this.stageEnter[st]) this.stageEnter[st] = Date.now();
    this.paint(first ? 0 : dir, false);
  };
  Stage.prototype.next = function () {
    if (this.fragMax && this.frag[this.cur().id] < this.fragMax) {
      this.frag[this.cur().id]++;
      const kids = Array.from(doc.querySelector('#kt2-paper .kt2-body').children);
      const el = kids[this.frag[this.cur().id]]; if (el) { el.classList.remove('hidden'); el.classList.add('just'); el.classList.add('anim'); this.pop(); } this.fitBody();
      this.paintHud(); return;
    }
    if (this.idx < this.slides.length - 1) this.go(this.idx + 1, 1);
    else this.toast('마지막 슬라이드예요');
  };
  Stage.prototype.prev = function () { if (this.idx > 0) this.go(this.idx - 1, -1); };
  Stage.prototype.revealAll = function () {
    const s = this.cur(); const id = s.id;
    if (this.fragMax && this.frag[id] < this.fragMax) { this.frag[id] = this.fragMax; this.paint(0, true); }
    if (this.curRender.answerable) {
      this.rev[id] = !this.rev[id];
      const S = this.state(id);
      if (['review', 'exit_ticket', 'card_quiz'].includes(s.block)) { const n = ((s.data || {}).items || (s.data || {}).cards || []).length; S.flipped = Array.from({ length: n }, () => this.rev[id]); }
      if (s.block === 'chosung_quiz') S.on = this.rev[id];
      this.paint(0, true);
      if (this.rev[id]) this.celebrate();
      this.toast(this.rev[id] ? '정답을 열었어요' : '정답을 숨겼어요');
    }
  };
  // 슬라이드 안 조작
  Stage.prototype.act = function (btn) {
    const a = btn.getAttribute('data-act'); const s = this.cur(); const S = this.state(s.id); const d = s.data || {}; const i = +btn.getAttribute('data-i');
    const rp = () => this.paint(0, true);
    switch (a) {
      case 'flip': S.flipped = S.flipped || []; S.flipped[i] = !S.flipped[i]; rp(); if (S.flipped[i]) this.pop(); break;
      case 'kact': if (global.KT2_ACTIVITY) global.KT2_ACTIVITY.startFromSlide(this, s); break;
      case 'light': S.lights = S.lights || []; S.lights[i] = (S.lights[i] || 0) + 1; rp(); break;
      case 'star': S.stars = S.stars || {}; { const k = +btn.getAttribute('data-k') + 1; S.stars[i] = S.stars[i] === k ? 0 : k; } rp(); break;
      case 'reveal': this.rev[s.id] = !this.rev[s.id]; rp(); if (this.rev[s.id]) this.celebrate(); break;
      case 'lv': S.level = btn.getAttribute('data-k'); this.rev[s.id] = false; rp(); break;
      case 'cz-reveal': S.on = !S.on; rp(); if (S.on) this.celebrate(); break;
      case 'cz-prev': S.idx = Math.max(0, (S.idx || 0) - 1); S.on = false; rp(); break;
      case 'cz-next': S.idx = Math.min((d.items || []).length - 1, (S.idx || 0) + 1); S.on = false; rp(); break;
      case 'pr-next': { const count = +btn.getAttribute('data-count'); S.picked = S.picked || []; const pool = []; for (let k = 0; k < count; k++) if (!S.picked.includes(k)) pool.push(k); if (!pool.length) break; const pick = pool[Math.floor(Math.random() * pool.length)]; S.picked.push(pick); S.current = pick; rp(); this.chime(1); break; }
      case 'pr-reset': S.picked = []; S.current = null; rp(); break;
      case 'ra-prev': S.page = Math.max(0, (S.page || 0) - 1); rp(); break;
      case 'ra-next': S.page = Math.min((d.pages || []).length - 1, (S.page || 0) + 1); rp(); break;
      case 'tf-cell': { const n = S.count !== undefined ? S.count : (d.start_count || 0); S.count = i < n ? i : i + 1; rp(); break; }
      case 'tf-plus': S.count = Math.min(10, (S.count !== undefined ? S.count : (d.start_count || 0)) + 1); rp(); break;
      case 'tf-minus': S.count = Math.max(0, (S.count !== undefined ? S.count : (d.start_count || 0)) - 1); rp(); break;
      case 'tf-reset': S.count = +btn.getAttribute('data-init'); rp(); break;
      case 'cb-plus': S.count = Math.min(20, (S.count !== undefined ? S.count : (d.start_count || 3)) + 1); rp(); break;
      case 'cb-minus': S.count = Math.max(0, (S.count !== undefined ? S.count : (d.start_count || 3)) - 1); rp(); break;
      case 'cb-reset': S.count = +btn.getAttribute('data-init'); rp(); break;
      case 'nl': if (s.block === 'interactive_number_line') { S.position = +btn.getAttribute('data-n'); rp(); } break;
      case 'nl-plus': S.position = Math.min(+btn.getAttribute('data-max'), (S.position !== undefined ? S.position : (d.start || 5)) + 1); rp(); break;
      case 'nl-minus': S.position = Math.max(+btn.getAttribute('data-min'), (S.position !== undefined ? S.position : (d.start || 5)) - 1); rp(); break;
      case 'nl-reset': S.position = +btn.getAttribute('data-init'); rp(); break;
      case 'ca': { S.order = S.order || (d.cards || [3, 1, 5, 2, 4]).slice(); if (S.sel === undefined || S.sel === null) S.sel = i; else if (S.sel === i) S.sel = null; else { const t = S.order[S.sel]; S.order[S.sel] = S.order[i]; S.order[i] = t; S.sel = null; } rp(); { const target = d.target || (d.cards || [3, 1, 5, 2, 4]).slice().sort((a, b) => a - b); if (JSON.stringify(S.order) === JSON.stringify(target)) this.celebrate(); } break; }
      case 'ca-reset': { const init = (d.cards || [3, 1, 5, 2, 4]).slice(); for (let k = init.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [init[k], init[j]] = [init[j], init[k]]; } S.order = init; S.sel = null; rp(); break; }
      case 'timer': this.timerStart((+btn.getAttribute('data-min') || 3) * 60); break;
      case 'res-open': this.openRes(); break;
    }
  };

  // ───────────────────────── 연출·소리·확대 ─────────────────────────
  const STAGGER = ['.tenframe .chip', '.picture .kid', 'svg.tenframe .cell.on', '.emoji-row span', '.stack .cube', '.seq > *', '.opt', '.point', '.steps li', '.examples .ex', '.ordinals .ord', '.tf-row .tf-item', '.tf-strip .tfs', '.flipgrid .flip', '.cq-grid .cq', '.scene .kid', '.arrow-flow > *', '.pairs > *', '.areas div', '.sa .row', '.signal .light', '.teams .team', '.trace-row .trace', '.num-table tr', '.num-cards span', '.number-panel span', '.numline .dot', '.dots i', '.i-tf div'];
  const ZOOMABLE = '.tf-item, .opt, .img-frame, .scenario, .kid, .mis-card, .point, .bidirect, .num-table, .flip, .ex, .cz, .big-q, .steps li, .offline, .pr-card';
  Stage.prototype.decorate = function (paper, r) {
    // 목록 부품에 순번(--i) — 등장 연출이 차례로 흐르게
    STAGGER.forEach(sel => { const groups = new Map(); paper.querySelectorAll(sel).forEach(el => { const p = el.parentNode; const n = groups.get(p) || 0; el.style.setProperty('--i', n); groups.set(p, n + 1); }); });
    // 큰 목록은 간격을 줄인다
    paper.querySelectorAll('.emoji-row, .seq, .tf-row, .options, .points, .steps, .flipgrid, .cq-grid, .num-table tbody, .dots, .numline').forEach(g => { const n = g.children.length; if (n > 12) g.style.setProperty('--stg', '30ms'); else if (n > 6) g.style.setProperty('--stg', '50ms'); });
    // 보이는 것만 연출 시작(숨은 조각은 공개될 때 next() 가 건다)
    if (r.cover) paper.classList.add('anim');
    else { const t = paper.querySelector('.kt2-title'); if (t) t.classList.add('anim'); Array.from(paper.querySelector('.kt2-body').children).forEach(el => { if (!el.classList.contains('hidden')) el.classList.add('anim'); }); }
    paper.querySelectorAll(ZOOMABLE).forEach(el => el.classList.add('zoomable'));
  };
  // 화면 넘침 방지 — 본문이 종이 안 자리보다 크면 통째로 줄인다(학년 등급 배율 위에 곱한다). 어떤 슬라이드도 종이 밖으로 못 나간다.
  Stage.prototype.fitBody = function () {
    const paper = doc.getElementById('kt2-paper'); const body = paper && paper.querySelector('.kt2-body'); if (!body) return;
    const base = this.g <= 2 ? 1.06 : this.g <= 4 ? 1 : 0.95; body.style.zoom = '';
    for (let i = 0; i < 4; i++) {
      const avail = body.clientHeight, need = body.scrollHeight, availW = body.clientWidth, needW = body.scrollWidth;
      if (!avail || !need) return;
      if (need <= avail + 2 && needW <= availW + 2) return;
      const cur = parseFloat(body.style.zoom) || base;
      const z = Math.max(0.45, cur * Math.min(avail / need, availW / needW) * 0.97);
      body.style.zoom = z; body.classList.add('shrunk');
      if (z <= 0.46) return;
    }
  };
  Stage.prototype.toggleZoom = function (el) { const on = el.classList.contains('zoomed'); doc.querySelectorAll('#kt2-paper .zoomed').forEach(x => x.classList.remove('zoomed')); if (!on) { el.classList.add('zoomed'); this.pop(); } };
  Stage.prototype.tone = function (f, dur, vol, type) { if (!this.sound) return; try { const AC = global.AudioContext || global.webkitAudioContext; if (!AC) return; this.ac = this.ac || new AC(); const ac = this.ac; const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.value = 0.0001; o.connect(g); g.connect(ac.destination); const t0 = ac.currentTime; o.start(t0); g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.12)); o.stop(t0 + (dur || 0.12) + 0.02); } catch (e) { } };
  Stage.prototype.pop = function () { this.tone(720, 0.09, 0.05, 'triangle'); };
  Stage.prototype.celebrate = function (x, y) {
    if (this.sound) { this.tone(660, 0.14, 0.07); setTimeout(() => this.tone(880, 0.14, 0.07), 110); setTimeout(() => this.tone(1320, 0.22, 0.07), 220); }
    if (this.still) return;
    const c = doc.getElementById('fx'); if (!c || !c.getContext) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const colors = ['#FF8A3D', '#4F8DF7', '#12B886', '#7C5CFF', '#F5B942', '#F05C8A'];
    const ps = Array.from({ length: 90 }, () => ({ x: x !== undefined ? x : W / 2, y: y !== undefined ? y : H * 0.45, vx: (Math.random() - 0.5) * 28, vy: -Math.random() * 22 - 6, r: 6 + Math.random() * 8, c: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * Math.PI, w: Math.random() * 0.3 - 0.15, life: 70 + Math.random() * 30 }));
    let t = 0; const raf = global.requestAnimationFrame || (fn => setTimeout(fn, 16));
    const step = () => { ctx.clearRect(0, 0, W, H); let alive = 0; ps.forEach(p => { if (t > p.life) return; alive++; p.vy += 0.55; p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.a += p.w; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - t / p.life); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r / 1.5); ctx.restore(); }); t++; if (alive && t < 130) raf(step); else ctx.clearRect(0, 0, W, H); };
    raf(step);
  };

  // ───────────────────────── HUD ─────────────────────────
  Stage.prototype.buildHud = function () {
    const hud = doc.getElementById('hud'); if (!hud) return;
    hud.innerHTML = '<button data-h="toc" title="목차 (G)">📑 목차</button><span class="sep"></span>'
      + '<button class="nav" data-h="prev" title="이전 (←)">‹</button><span class="pg" id="hud-pg"></span><button class="nav" data-h="next" title="다음 (→ / 스페이스)">›</button><span class="sep"></span>'
      + '<span class="stg" id="hud-stg"></span><span class="clock" id="hud-clock" title="수업 경과 시간 · 누르면 처음부터">0:00</span><span class="sep"></span>'
      + '<button data-h="answer" title="정답 공개 / 조각 모두 보이기 (A)">✅ 정답</button><button data-h="timer" title="타이머 (T)">⏱</button><button data-h="pick" title="뽑기 (D)">🎲</button><button data-h="score" title="점수판 (K)">🏆</button><button data-h="act" title="활동 — 이 차시 추천·⚡빠른 활동 (H)">🎲 활동</button><span class="sep"></span>'
      + '<button data-h="edit" title="편집 — 글자·사진·순서 (E)">✎ 편집</button><button data-h="pen" title="펜 (P)">✏️</button><button data-h="spot" title="스포트라이트 (S)">🔦</button><button data-h="black" title="검은 화면 (B)">🌑</button><span class="sep"></span>'
      + '<button data-h="tnote" title="교사 발문 (N)">👩‍🏫</button><button data-h="res" title="자료 (R)">📎</button><button data-h="allat" title="조각 순차 공개 끄기/켜기 (1)">' + (this.allAtOnce ? '▤ 한번에' : '▥ 차례로') + '</button><button data-h="still" title="움직임·연출 끄기/켜기 (0)">' + (this.still ? '🎬 연출 꺼짐' : '🎬') + '</button><button data-h="sound" title="효과음 (M)">' + (this.sound ? '🔊' : '🔇') + '</button><span class="sep"></span>'
      + '<button data-h="full" title="전체 화면 (F)">⛶</button><button data-h="help" title="단축키 (?)">?</button>';
    const self = this;
    hud.addEventListener('click', e => { const b = e.target.closest('button[data-h]'); if (b) self.hudAct(b.getAttribute('data-h'), b); });
    hud.querySelector('#hud-clock').addEventListener('click', () => { self.started = Date.now(); self.stageEnter = {}; self.stageEnter[self.cur().stage] = Date.now(); self.toast('수업 시계를 처음으로'); });
    const top = doc.getElementById('hud-top'); if (top) top.querySelector('.home').setAttribute('href', 'index.html?g=' + this.g + '&s=' + this.s);
    // 자동 숨김
    let tmr; const show = () => { hud.classList.remove('hide'); if (top) top.classList.remove('hide'); clearTimeout(tmr); tmr = setTimeout(() => { if (!self.pen && !self.hudPinned) { hud.classList.add('hide'); if (top) top.classList.add('hide'); } }, 3200); };
    doc.addEventListener('mousemove', show); doc.addEventListener('touchstart', show, { passive: true }); show();
    hud.addEventListener('mouseenter', () => { self.hudPinned = true; }); hud.addEventListener('mouseleave', () => { self.hudPinned = false; show(); });
    setInterval(() => self.tick(), 1000); this.paintPlanBadge();
  };
  Stage.prototype.paintHud = function () {
    const pg = doc.getElementById('hud-pg'); if (pg) pg.innerHTML = '<b>' + (this.idx + 1) + '</b>/' + this.slides.length + (this.fragMax ? ' <small style="color:#8fa3b8">·' + (this.frag[this.cur().id] + 1) + '/' + (this.fragMax + 1) + '</small>' : '');
    const stg = doc.getElementById('hud-stg'); if (!stg) return;
    const cur = this.cur().stage; const self = this;
    stg.innerHTML = STAGES.map(st => { const n = self.slides.filter(x => x.stage === st).length; if (!n) return ''; const done = self.slides.slice(0, self.idx + 1).filter(x => x.stage === st).length; return '<i title="' + st + ' ' + done + '/' + n + ' · 계획 ' + STAGE_MIN[st] + '분" data-st="' + st + '" class="' + (st === cur ? 'cur' : '') + '" style="width:' + (STAGE_MIN[st] * 5) + 'px;--c:' + STAGE_COLOR[st] + ';--p:' + Math.round((done / n) * 100) + '%"></i>'; }).join('');
    stg.querySelectorAll('i').forEach(el => el.addEventListener('click', () => { const st = el.getAttribute('data-st'); const i = self.slides.findIndex(x => x.stage === st); if (i >= 0) self.go(i, i > self.idx ? 1 : -1); }));
  };
  Stage.prototype.tick = function () {
    const c = doc.getElementById('hud-clock'); if (c) { const sec = (Date.now() - this.started) / 1000; c.textContent = fmtClock(sec); c.classList.toggle('over', sec > (this.meta.duration || 40) * 60); }
    if (this.timer) this.timerTick();
  };
  Stage.prototype.hudAct = function (h, btn) {
    switch (h) {
      case 'toc': this.openToc(); break; case 'prev': this.prev(); break; case 'next': this.next(); break; case 'answer': this.revealAll(); break;
      case 'timer': this.openTimer(); break; case 'pick': this.openPick(); break; case 'score': this.openScore(); break;
      case 'act': if (global.KT2_ACTIVITY) global.KT2_ACTIVITY.openLauncher(); else this.toast('활동 층이 아직 안 실렸어요'); break;
      case 'pen': this.setPen(!this.pen); break; case 'edit': this.setEdit(!this.edit); break; case 'spot': this.setSpot(!this.spot); break; case 'black': this.setBlack(!this.black); break;
      case 'tnote': this.setTnote(!this.tnoteOn); break; case 'res': this.openRes(); break;
      case 'allat': this.allAtOnce = !this.allAtOnce; lsSet('kt2_all_at_once', this.allAtOnce); btn.textContent = this.allAtOnce ? '▤ 한번에' : '▥ 차례로'; this.paint(0, true); this.toast(this.allAtOnce ? '조각을 한 번에 보여요' : '조각을 차례로 보여요'); break;
      case 'full': this.fullscreen(); break; case 'help': this.openOv('ov-help'); break;
      case 'still': this.still = !this.still; lsSet('kt2_still', this.still); doc.body.classList.toggle('still', this.still); btn.textContent = this.still ? '🎬 연출 꺼짐' : '🎬'; this.toast(this.still ? '움직임을 껐어요' : '움직임을 켰어요'); break;
      case 'sound': this.sound = !this.sound; lsSet('kt2_sound', this.sound); btn.textContent = this.sound ? '🔊' : '🔇'; if (this.sound) this.pop(); break;
    }
  };
  Stage.prototype.toast = function (m) { const t = doc.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), 1600); };
  Stage.prototype.openOv = function (id) { const o = doc.getElementById(id); if (o) o.classList.add('on'); };
  Stage.prototype.closeOv = function () { doc.querySelectorAll('.ov.on').forEach(o => o.classList.remove('on')); if (this.media) { this.media.innerHTML = ''; } };
  Stage.prototype.fullscreen = function () { const el = doc.documentElement; if (!doc.fullscreenElement) { if (el.requestFullscreen) el.requestFullscreen().catch(() => { }); } else if (doc.exitFullscreen) doc.exitFullscreen(); };
  Stage.prototype.setBlack = function (on) { this.black = on; const p = doc.getElementById('kt2-paper'); if (p) p.classList.toggle('black', on); this.hudBtn('black', on); };
  Stage.prototype.hudBtn = function (h, on) { const b = doc.querySelector('#hud button[data-h="' + h + '"]'); if (b) b.classList.toggle('on', !!on); };

  // 목차
  Stage.prototype.sevenOf = function () {
    const sl = this.slides; const has = f => sl.some(f);
    return [has(s => s.block === 'review' && s.data && Array.isArray(s.data.items) && s.data.items.length >= 2), has(s => (s.data && s.data.img) || (this.plan.imgs && this.plan.imgs[s.id])), has(s => s.block === 'motivate' && s.data && (s.data.kids || s.data.theme)), has(s => s.block === 'offline_activity'), has(s => s.block === 'leveled_problem'), has(s => s.block === 'exit_ticket'), sl.filter(s => (s.data && s.data.tnote) || s.tnote || (this.plan.tnote && this.plan.tnote[s.id])).length >= 6];
  };
  Stage.prototype.openToc = function () {
    const self = this; const box = doc.querySelector('#ov-toc .toc'); if (!box) return;
    const sv = this.sevenOf(); const head = doc.querySelector('#ov-toc .seven'); if (head) head.innerHTML = SEVEN.map((n, i) => '<span class="' + (sv[i] ? 'on' : '') + '" title="' + (sv[i] ? '있음' : '없음') + '">' + n + '</span>').join('') + '<span class="sum">' + sv.filter(Boolean).length + '/7</span>';
    const tools = doc.querySelector('#ov-toc .toc-tools'); if (tools) { tools.innerHTML = '<button class="btn" data-a="ask">＋ 발문</button><button class="btn" data-a="act">＋ 교실 활동</button><button class="btn" data-a="photo">＋ 사진 한 장</button><button class="btn" data-a="memo">＋ 빈 슬라이드</button>' + (global.KT2_ACTIVITY ? '<button class="btn" data-a="activity">＋ 활동</button>' : '') + '<span class="sp"></span>' + (this.planDirty() ? '<button class="btn" data-a="export">내보내기</button><button class="btn" data-a="reset">원래 차시로</button>' : '<button class="btn" data-a="import">가져오기</button>'); tools.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { const a = b.getAttribute('data-a'); if (a === 'activity') { self.closeOv(); global.KT2_ACTIVITY.openLauncher(null, { insert: true }); return; } if (a === 'reset') { self.closeOv(); self.resetPlan(); } else if (a === 'export') { const txt = self.exportPlan(); const ta = doc.createElement('textarea'); ta.value = txt; doc.body.appendChild(ta); ta.select(); try { doc.execCommand('copy'); self.toast('우리 반 판을 복사했어요 — 다른 기기에서 「가져오기」에 붙여 넣기'); } catch (e) { global.prompt('복사해서 다른 기기에 붙여 넣으세요', txt); } doc.body.removeChild(ta); } else if (a === 'import') { const txt = global.prompt('다른 기기에서 「내보내기」한 글을 붙여 넣어요'); if (txt) { self.importPlan(txt); self.openToc(); } } else { self.closeOv(); self.addSlide(a); } })); }
    let last = ''; box.innerHTML = this.slides.map((s, i) => { let h = ''; if (s.stage !== last) { h += '<div class="stg-l"><i style="--c:' + STAGE_COLOR[s.stage] + '"></i>' + esc(s.stage) + '</div>'; last = s.stage; } const r = renderSlide(s, { revealed: false, state: {}, meta: self.meta, unitTitle: self.unitTitle, classNames: [] }); const t = r.cover ? '표지' : (r.title || (s.data || {}).title || ''); const ed = (self.plan.text[s.id] || self.plan.imgs[s.id] || self.plan.tnote[s.id]) ? ' <em>✎</em>' : ''; return h + '<div class="it' + (i === self.idx ? ' cur' : '') + (s.included ? ' on' : ' skip') + (s._added ? ' added' : '') + '" data-i="' + i + '"><span class="ck" data-ck="1">' + (s.included ? '✓' : '') + '</span><span class="n">' + (i + 1) + '</span><span class="t">' + esc(t) + ed + '</span><span class="b">' + esc(BLOCK_LABEL[s.block] || s.block) + '</span><span class="mv"><button data-mv="-1" title="위로">▲</button><button data-mv="1" title="아래로">▼</button>' + (s._added ? '<button data-del="1" title="지우기">🗑</button>' : '') + '</span></div>'; }).join('');
    box.querySelectorAll('.it').forEach(el => el.addEventListener('click', e => { const i = +el.getAttribute('data-i'); const mv = e.target.getAttribute('data-mv'); if (mv) { self.moveSlide(i, +mv); self.idx = self.slides.findIndex(x => x.id === self.cur().id); self.openToc(); return; } if (e.target.getAttribute('data-del')) { self.removeAdded(self.slides[i].id); self.openToc(); self.paint(0, true); return; } if (e.target.getAttribute('data-ck')) { self.slides[i].included = !self.slides[i].included; self.plan.skip = self.slides.filter(x => !x.included).map(x => x.id); self.savePlan(); el.classList.toggle('on'); el.classList.toggle('skip'); el.querySelector('.ck').textContent = self.slides[i].included ? '✓' : ''; return; } self.closeOv(); self.go(i, i > self.idx ? 1 : -1); }));
    this.openOv('ov-toc');
  };
  // 자료
  Stage.prototype.openRes = function () {
    const self = this; const p = doc.querySelector('#ov-res .panel'); if (!p) return;
    const s = this.cur(); const filter = self.resFilter || 'all'; const broken = this.plan.broken || {};
    const mine = (this.plan.res && this.plan.res[s.id]) || []; const fitIds = new Set(s.suggested_extras || []);
    const types = ['all'].concat(Object.keys(TYPE_LABEL).filter(t => self.extras.some(e => e.type === t)));
    const ICON = { video: '🎥', link: '🔗', kedu: '🏠', book: '📚', game: '🎲', tip: '💡', misconception: '⚠️', fun_question: '❓', real_world: '🌍', extension: '➕', other_activity: '🧩' };
    const card = e => { const un = e.type === 'video' && !(e.video_id || /youtu\.?be.*(v=|\/)[\w-]{11}/.test(e.url || '')); const bk = !!broken[e.id]; return '<div class="res' + (fitIds.has(e.id) || e.mine ? ' fit' : '') + (bk ? ' broken' : '') + '" data-id="' + esc(e.id) + '"><div class="ic">' + esc(e.icon || ICON[e.type] || '📎') + '</div><div class="bd2"><div class="t">' + esc(e.title || '') + '</div>' + (e.description ? '<div class="d">' + esc(e.description) + '</div>' : '') + '<div class="m"><span>' + esc(TYPE_LABEL[e.type] || e.type) + '</span>' + (e.source ? '<span>' + esc(e.source) + '</span>' : '') + ((e.status === '미확보' || un) && e.type === 'video' ? '<span class="no">미확보 · 검색으로 열림</span>' : '') + ((e.audience === 'teacher' || TEACHER_TYPES.has(e.type)) ? '<span class="tch">교사용</span>' : '') + (bk ? '<span class="no">안 열림</span>' : '') + '</div></div><div class="ops"><button data-bk="' + esc(e.id) + '" title="' + (bk ? '다시 살리기' : '안 열려요 — 표시해 두면 내보내기에 담겨 준호가 고쳐요') + '">' + (bk ? '↺' : '⚠') + '</button>' + (e.mine ? '<button data-rm="' + esc(e.id) + '" title="떼기">🗑</button>' : '') + '</div></div>'; };
    const list = this.extras.filter(e => filter === 'all' || e.type === filter);
    const fits = list.filter(e => fitIds.has(e.id)), rest = list.filter(e => !fitIds.has(e.id));
    p.innerHTML = '<h3>📎 자료 <span style="font-size:12px;color:#8fa3b8;font-weight:600">' + (this.extras.length + mine.length) + '개</span><span class="sp"></span><button class="x" data-x="1">✕</button></h3>'
      + '<div class="res-attach"><input id="res-url" placeholder="영상·자료 주소를 붙여 넣어요 (유튜브면 무대에서 바로 재생)"><input id="res-title" placeholder="이름(선택)"><button class="btn main" data-at="1">＋ 이 슬라이드에 붙이기</button><a class="btn" href="' + esc(this.searchUrl()) + '" target="_blank" rel="noopener">🔍 이 슬라이드로 유튜브 찾기 ↗</a><div class="hint">붙인 자료는 우리 반 판(이 기기)에 저장돼요 · 링크만 저장하고 영상은 복제하지 않아요</div></div>'
      + '<div class="res-filter">' + types.map(t => '<button class="' + (t === filter ? 'on' : '') + '" data-f="' + t + '">' + (t === 'all' ? '전체' : esc(TYPE_LABEL[t])) + '</button>').join('') + '</div>'
      + (mine.length ? '<div class="res-sec">우리 반이 붙인 자료</div>' + mine.map(card).join('') : '')
      + (fits.length ? '<div class="res-sec">이 슬라이드에 맞는 자료</div>' + fits.map(card).join('') : '') + (rest.length ? '<div class="res-sec">' + (fits.length ? '나머지' : '이 차시의 자료') + '</div>' + rest.map(card).join('') : '') + (!list.length && !mine.length ? '<div class="res-sec">이 종류의 자료가 없어요 — 위에서 붙이거나 유튜브에서 찾아요</div>' : '');
    p.querySelector('[data-x]').addEventListener('click', () => self.closeOv());
    p.querySelector('[data-at]').addEventListener('click', () => { if (self.attachRes(p.querySelector('#res-url').value, p.querySelector('#res-title').value)) { self.openRes(); self.paint(0, true); } });
    p.querySelector('#res-url').addEventListener('keydown', e => { if (e.key === 'Enter') p.querySelector('[data-at]').click(); e.stopPropagation(); });
    p.querySelector('#res-title').addEventListener('keydown', e => e.stopPropagation());
    p.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { self.resFilter = b.getAttribute('data-f'); self.openRes(); }));
    p.querySelectorAll('[data-bk]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); self.markBroken(b.getAttribute('data-bk')); self.openRes(); self.paint(0, true); }));
    p.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = b.getAttribute('data-rm'); self.plan.res[s.id] = (self.plan.res[s.id] || []).filter(x => x.id !== id); if (!self.plan.res[s.id].length) delete self.plan.res[s.id]; self.savePlan(); self.openRes(); self.paint(0, true); }));
    p.querySelectorAll('.res .bd2, .res .ic').forEach(el => el.addEventListener('click', () => self.openExtra(el.parentNode.getAttribute('data-id'))));
    this.openOv('ov-res');
  };
  Stage.prototype.openExtra = function (id) {
    let e = this.extras.find(x => x.id === id); if (!e) { const mine = (this.plan.res && this.plan.res[this.cur().id]) || []; e = mine.find(x => x.id === id); } if (!e) return;
    const ytid = e.video_id || (String(e.url || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
    if (e.type === 'video' && ytid) {
      const src = 'https://www.youtube-nocookie.com/embed/' + ytid + '?autoplay=1&rel=0' + (e.start ? '&start=' + (+e.start) : '') + (e.end ? '&end=' + (+e.end) : '');
      this.showMedia('<iframe src="' + esc(src) + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>', e, 'https://www.youtube.com/watch?v=' + ytid, '유튜브에서 열기');
      return;
    }
    if (e.type === 'kedu' && e.url) { this.showMedia('<iframe src="' + esc(e.url) + '"></iframe>', e, e.url, '새 탭에서 열기'); return; }
    if (e.url) { global.open(e.url, '_blank', 'noopener'); return; }
    // 링크 없는 자료(발문·팁·오개념 등)는 카드로 보여 준다
    this.showMedia('<div style="padding:40px;font-size:26px;line-height:1.6;color:#fff;min-height:200px;display:grid;place-items:center;text-align:center"><div><div style="font-size:14px;color:#8fa3b8;letter-spacing:.14em;margin-bottom:12px">' + esc(TYPE_LABEL[e.type] || '') + '</div>' + md(e.title || '') + '<div style="font-size:20px;color:#c7d3e0;margin-top:18px">' + md(e.description || e.content || '') + '</div></div></div>', e, null);
  };
  Stage.prototype.showMedia = function (inner, e, href, hrefLabel) {
    this.closeOv(); const o = doc.getElementById('ov-media'); if (!o) return; this.media = o.querySelector('.frame'); this.media.innerHTML = inner;
    o.querySelector('.bar').innerHTML = '<span>' + esc(e.title || '') + '</span>' + (e.note ? '<span style="color:#8fa3b8">· ' + esc(e.note) + '</span>' : '') + '<span class="sp"></span><a href="#" data-bk="1" title="안 열리면 표시해 두세요">⚠ 안 열려요</a>' + (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(hrefLabel) + ' ↗</a>' : '') + '<a href="#" data-x="1">닫기 ✕</a>';
    o.querySelector('[data-x]').addEventListener('click', ev => { ev.preventDefault(); this.closeOv(); }); o.querySelector('[data-bk]').addEventListener('click', ev => { ev.preventDefault(); this.markBroken(e.id); this.closeOv(); this.paint(0, true); }); this.openOv('ov-media');
  };
  // 발문 띠
  Stage.prototype.setTnote = function (on) { this.tnoteOn = on; this.hudBtn('tnote', on); this.paintTnote(); };
  Stage.prototype.paintTnote = function () {
    const t = doc.getElementById('tnote'); if (!t) return; t.classList.toggle('on', !!this.tnoteOn); if (!this.tnoteOn) return;
    const sid = this.cur().id; const n0 = (this.cur().data || {}).tnote || this.cur().tnote; const n = (this.plan.tnote && this.plan.tnote[sid]) || n0; const memo = this.curRender && this.curRender.teacherNote;
    if (this.edit) { const self = this; t.innerHTML = '<span class="lb">발문 편집</span><textarea id="tn-edit" placeholder="한 줄에 발문 하나 · 마지막 줄이 👀 로 시작하면 유의점">' + esc(((n && n.ask) || []).join('\n') + (n && n.watch ? '\n👀 ' + n.watch : '')) + '</textarea><button class="btn" id="tn-save">저장</button>'; t.querySelector('#tn-save').addEventListener('click', () => { const lines = t.querySelector('#tn-edit').value.split('\n').map(x => x.trim()).filter(Boolean); const watch = lines.filter(x => x.startsWith('👀')).map(x => x.replace(/^👀\s*/, ''))[0] || ''; const ask = lines.filter(x => !x.startsWith('👀')); if (!ask.length && !watch) { delete self.plan.tnote[sid]; } else self.plan.tnote[sid] = { ask, watch, min: (n && n.min) || undefined }; self.savePlan(); self.toast('발문을 저장했어요'); }); return; }
    if (!n && !memo) { t.innerHTML = '<span class="none">이 슬라이드에는 교사 발문 메모가 없어요</span>'; return; }
    t.innerHTML = '<span class="lb">' + (n ? '발문' : '메모') + '</span><div>' + (n ? '<div class="ask">' + (n.ask || []).map(a => '<div>' + md(a) + '</div>').join('') + '</div>' + (n.watch ? '<div class="watch">👀 ' + md(n.watch) + '</div>' : '') : '') + (memo ? '<div class="watch">👉 ' + md(memo) + '</div>' : '') + '</div>' + (n && n.min ? '<span class="min">⏱ ' + esc(n.min) + '분</span>' : '');
  };
  // 타이머
  Stage.prototype.openTimer = function () {
    const self = this; const o = doc.getElementById('ov-timer'); if (!o) return;
    if (!o.dataset.built) {
      o.querySelector('.panel').innerHTML = '<h3>⏱ 타이머<span class="sp"></span><button class="x" data-x="1">✕</button></h3><div class="timer-ring" id="tring"><svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="86"/><circle class="fg" cx="100" cy="100" r="86" stroke-dasharray="540.4" stroke-dashoffset="0"/></svg><div class="t" id="ttxt">3:00</div></div><div class="timer-presets">' + [1, 2, 3, 5, 10, 15].map(m => '<button class="btn" data-m="' + m + '">' + m + '분</button>').join('') + '</div><div class="timer-ctl"><button class="btn main" data-t="start">▶ 시작</button><button class="btn" data-t="pause">⏸ 멈춤</button><button class="btn" data-t="reset">↺ 처음</button><button class="btn" data-t="hide">화면으로 (미니 표시)</button></div>';
      o.dataset.built = '1';
      o.querySelector('[data-x]').addEventListener('click', () => self.closeOv());
      o.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { self.timerSet(+b.getAttribute('data-m') * 60); }));
      o.querySelector('[data-t="start"]').addEventListener('click', () => self.timerStart());
      o.querySelector('[data-t="pause"]').addEventListener('click', () => { self.timerPause(); });
      o.querySelector('[data-t="reset"]').addEventListener('click', () => { self.timerSet(self.timer ? self.timer.total : 180); });
      o.querySelector('[data-t="hide"]').addEventListener('click', () => self.closeOv());
      doc.getElementById('timer-mini').addEventListener('click', () => self.openTimer());
    }
    if (!this.timer) this.timerSet(180);
    this.openOv('ov-timer');
  };
  Stage.prototype.timerSet = function (sec) { this.timer = { total: sec, left: sec, running: false, endAt: null }; this.timerPaint(); };
  Stage.prototype.timerStart = function (sec) { if (sec) this.timerSet(sec); if (!this.timer) this.timerSet(180); if (this.timer.left <= 0) this.timer.left = this.timer.total; this.timer.running = true; this.timer.endAt = Date.now() + this.timer.left * 1000; this.timerPaint(); doc.getElementById('timer-mini').classList.add('on'); this.hudBtn('timer', true); if (sec) this.toast('⏱ ' + fmtClock(sec) + ' 타이머 시작'); };
  Stage.prototype.timerPause = function () { if (!this.timer) return; this.timer.running = false; this.timerPaint(); };
  Stage.prototype.timerTick = function () { const t = this.timer; if (!t.running) return; t.left = Math.max(0, (t.endAt - Date.now()) / 1000); if (t.left <= 0) { t.running = false; this.chime(3); } this.timerPaint(); };
  Stage.prototype.timerPaint = function () {
    const t = this.timer; if (!t) return; const txt = fmtClock(Math.ceil(t.left)); const ratio = t.total ? t.left / t.total : 0; const cls = t.left <= 0 ? 'done' : (t.left <= 30 ? 'warn' : '');
    const ring = doc.getElementById('tring'); if (ring) { ring.className = 'timer-ring ' + cls; ring.querySelector('.fg').setAttribute('stroke-dashoffset', String(540.4 * (1 - ratio))); doc.getElementById('ttxt').textContent = txt; }
    const mini = doc.getElementById('timer-mini'); if (mini) { mini.textContent = '⏱ ' + txt; mini.className = 'timer-mini on ' + cls; if (!t.running && t.left === t.total) mini.classList.remove('on'); }
  };
  Stage.prototype.chime = function (n) {
    try { const AC = global.AudioContext || global.webkitAudioContext; if (!AC) return; this.ac = this.ac || new AC(); const ac = this.ac; for (let i = 0; i < n; i++) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 880 + i * 120; g.gain.value = 0.0001; o.connect(g); g.connect(ac.destination); const t0 = ac.currentTime + i * 0.28; o.start(t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25); o.stop(t0 + 0.27); } } catch (e) { }
  };
  // 뽑기
  Stage.prototype.openPick = function () {
    const self = this; const o = doc.getElementById('ov-pick'); if (!o) return; const p = o.querySelector('.panel');
    const names = this.classNames.length ? this.classNames : Array.from({ length: 24 }, (_, i) => (i + 1) + '번');
    this.pickDone = this.pickDone || [];
    const src = this.rosterSrc === 'kedu' ? '🏫 ' + esc(this.rosterName || '우리 반') + ' 명단 ' + names.length + '명 (케이에듀 학급)' : this.rosterSrc === 'manual' ? '✎ 직접 넣은 이름 ' + names.length + '명' + (this.roster ? ' · <a href="#" data-p="use-kedu">케이에듀 학급 명단 쓰기</a>' : '') : '번호 1~24 (학급 명단이 없어요' + (global.supabase ? '' : '') + ')';
    p.innerHTML = '<h3>🎲 뽑기<span class="sp"></span><button class="x" data-x="1">✕</button></h3><div class="pick-src">' + src + '</div><div class="pick-name" id="pick-name">' + (this.pickLast != null ? esc(names[this.pickLast]) : '?') + '</div><div class="pick-left">남은 사람 ' + (names.length - this.pickDone.length) + ' / ' + names.length + '</div><div class="pick-list">' + names.map((n, i) => '<span class="' + (self.pickDone.includes(i) ? 'done' : '') + '">' + esc(n) + '</span>').join('') + '</div><div class="timer-ctl"><button class="btn main" data-p="go">뽑기 🎲</button><button class="btn" data-p="reset">처음부터</button></div><div class="pick-set"><textarea id="pick-names" placeholder="' + (this.roster ? '케이에듀 학급 명단을 그대로 써요. 다른 이름을 쓰려면 여기에 한 줄에 한 명씩 (이 기기에만 저장 · 비우면 다시 학급 명단)' : '케이에듀에서 학급을 만들면 명단이 자동으로 와요. 지금은 한 줄에 한 명씩 붙여 넣기 (이 기기에만 저장)') + '">' + esc(this.rosterSrc === 'manual' ? this.classNames.join('\n') : '') + '</textarea><button class="btn" data-p="save">저장</button></div>';
    p.querySelector('[data-x]').addEventListener('click', () => self.closeOv());
    p.querySelector('[data-p="reset"]').addEventListener('click', () => { self.pickDone = []; self.pickLast = null; self.openPick(); });
    p.querySelector('[data-p="save"]').addEventListener('click', () => { self.classNames = p.querySelector('#pick-names').value.split(/\n|,/).map(x => x.trim()).filter(Boolean); lsSet('kt2_names', self.classNames); self.rosterSrc = self.classNames.length ? 'manual' : (self.roster ? 'kedu' : 'none'); if (!self.classNames.length && self.roster) self.classNames = self.roster.slice(); self.pickDone = []; self.pickLast = null; self.toast(self.classNames.length ? '이름 ' + self.classNames.length + '명 저장' : '직접 넣은 이름을 지웠어요'); self.openPick(); });
    const uk = p.querySelector('[data-p="use-kedu"]'); if (uk) uk.addEventListener('click', e => { e.preventDefault(); lsSet('kt2_names', []); self.classNames = self.roster.slice(); self.rosterSrc = 'kedu'; self.pickDone = []; self.pickLast = null; self.openPick(); });
    p.querySelector('[data-p="go"]').addEventListener('click', () => {
      const pool = names.map((_, i) => i).filter(i => !self.pickDone.includes(i)); if (!pool.length) { self.toast('모두 뽑았어요 — 처음부터를 누르세요'); return; }
      const el = p.querySelector('#pick-name'); el.classList.add('spin'); let k = 0; const iv = setInterval(() => { el.textContent = names[pool[Math.floor(Math.random() * pool.length)]]; if (++k > 14) { clearInterval(iv); const pick = pool[Math.floor(Math.random() * pool.length)]; self.pickDone.push(pick); self.pickLast = pick; self.chime(1); self.openPick(); const e2 = p.querySelector('#pick-name'); e2.classList.add('pop'); } }, 60);
    });
    this.openOv('ov-pick');
  };
  // 점수판
  Stage.prototype.openScore = function () {
    const self = this; const o = doc.getElementById('ov-score'); if (!o) return; const p = o.querySelector('.panel');
    this.score = this.score || lsGet('kt2_score', null) || { teams: ['1모둠', '2모둠', '3모둠', '4모둠'].map(n => ({ n, v: 0 })) };
    const max = Math.max.apply(null, this.score.teams.map(t => t.v));
    p.innerHTML = '<h3>🏆 점수판<span class="sp"></span><button class="btn" data-s="add">+ 모둠</button><button class="btn" data-s="del">− 모둠</button><button class="btn" data-s="zero">모두 0점</button><button class="btn" data-s="mini">' + (this.scoreMini ? '화면 표시 끄기' : '화면에 작게 표시') + '</button><button class="x" data-x="1">✕</button></h3><div class="score-grid">' + this.score.teams.map((t, i) => '<div class="sc"><input value="' + esc(t.n) + '" data-n="' + i + '"><div class="v' + (t.v === max && max > 0 ? ' lead' : '') + '">' + t.v + '</div><div class="b"><button data-d="-1" data-i="' + i + '">−</button><button class="p" data-d="1" data-i="' + i + '">+</button></div></div>').join('') + '</div>';
    const save = () => { lsSet('kt2_score', self.score); self.paintScoreMini(); };
    p.querySelector('[data-x]').addEventListener('click', () => self.closeOv());
    p.querySelector('[data-s="add"]').addEventListener('click', () => { if (self.score.teams.length < 8) { self.score.teams.push({ n: (self.score.teams.length + 1) + '모둠', v: 0 }); save(); self.openScore(); } });
    p.querySelector('[data-s="del"]').addEventListener('click', () => { if (self.score.teams.length > 2) { self.score.teams.pop(); save(); self.openScore(); } });
    p.querySelector('[data-s="zero"]').addEventListener('click', () => { self.score.teams.forEach(t => t.v = 0); save(); self.openScore(); });
    p.querySelector('[data-s="mini"]').addEventListener('click', () => { self.scoreMini = !self.scoreMini; save(); self.openScore(); });
    p.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { const i = +b.getAttribute('data-i'); self.score.teams[i].v = Math.max(0, self.score.teams[i].v + (+b.getAttribute('data-d'))); if (+b.getAttribute('data-d') > 0) self.chime(1); save(); self.openScore(); }));
    p.querySelectorAll('input[data-n]').forEach(inp => inp.addEventListener('change', () => { self.score.teams[+inp.getAttribute('data-n')].n = inp.value.trim() || inp.value; save(); }));
    this.openOv('ov-score');
  };
  Stage.prototype.paintScoreMini = function () { const m = doc.getElementById('score-mini'); if (!m) return; m.classList.toggle('on', !!this.scoreMini); if (this.scoreMini && this.score) m.innerHTML = this.score.teams.map(t => '<span>' + esc(t.n) + '<b>' + t.v + '</b></span>').join(''); };
  // 펜
  Stage.prototype.setPen = function (on) {
    this.pen = on; const c = doc.getElementById('pen'); const bar = doc.getElementById('pen-bar'); if (!c) return; c.classList.toggle('on', on); if (bar) bar.classList.toggle('on', on); this.hudBtn('pen', on);
    if (on && !this.penBound) this.bindPen();
    if (on) this.toast('펜 — 화면에 그려요 · Esc 로 끄기');
  };
  Stage.prototype.bindPen = function () {
    const self = this; const c = doc.getElementById('pen'); const ctx = c.getContext('2d'); this.penBound = true; this.penColor = '#F0506E'; this.penW = 6; this.erase = false;
    let drawing = false, last = null;
    const pt = ev => { const r = c.getBoundingClientRect(); const p = ev.touches ? ev.touches[0] : ev; return { x: (p.clientX - r.left) / r.width * W, y: (p.clientY - r.top) / r.height * H }; };
    const down = ev => { drawing = true; last = pt(ev); ev.preventDefault(); };
    const move = ev => { if (!drawing) return; const p = pt(ev); ctx.globalCompositeOperation = self.erase ? 'destination-out' : 'source-over'; ctx.strokeStyle = self.penColor; ctx.lineWidth = self.erase ? 40 : self.penW; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; ev.preventDefault(); };
    const up = () => { if (drawing) { drawing = false; self.penStore[self.cur().id] = c.toDataURL(); } };
    c.addEventListener('mousedown', down); c.addEventListener('mousemove', move); global.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: false }); c.addEventListener('touchmove', move, { passive: false }); c.addEventListener('touchend', up);
    const bar = doc.getElementById('pen-bar');
    if (bar) {
      bar.innerHTML = ['#F0506E', '#1F4DA8', '#12B886', '#F5B942', '#1c2430'].map(col => '<button class="c' + (col === self.penColor ? ' on' : '') + '" data-c="' + col + '" style="background:' + col + '"></button>').join('') + '<button data-w="4">가늘게</button><button data-w="8" class="on">보통</button><button data-w="16">굵게</button><button data-e="1">지우개</button><button data-clr="1">모두 지우기</button><button data-off="1">펜 끄기</button>';
      bar.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => { self.penColor = b.getAttribute('data-c'); self.erase = false; bar.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('on', x === b)); bar.querySelector('[data-e]').classList.remove('on'); }));
      bar.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { self.penW = +b.getAttribute('data-w'); bar.querySelectorAll('[data-w]').forEach(x => x.classList.toggle('on', x === b)); }));
      bar.querySelector('[data-e]').addEventListener('click', () => { self.erase = !self.erase; bar.querySelector('[data-e]').classList.toggle('on', self.erase); });
      bar.querySelector('[data-clr]').addEventListener('click', () => { ctx.clearRect(0, 0, W, H); delete self.penStore[self.cur().id]; });
      bar.querySelector('[data-off]').addEventListener('click', () => self.setPen(false));
    }
  };
  Stage.prototype.paintPen = function () { const c = doc.getElementById('pen'); if (!c || !c.getContext) return; const ctx = c.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, W, H); const d = this.penStore[this.cur().id]; if (d && global.Image) { const im = new global.Image(); im.onload = () => ctx.drawImage(im, 0, 0); im.src = d; } };
  // 스포트라이트
  Stage.prototype.setSpot = function (on) {
    this.spot = on; const s = doc.getElementById('spot'); if (!s) return; s.classList.toggle('on', on); this.hudBtn('spot', on);
    if (on && !this.spotBound) { this.spotBound = true; this.spotR = 220; doc.addEventListener('mousemove', e => { if (!this.spot) return; s.style.setProperty('--x', e.clientX + 'px'); s.style.setProperty('--y', e.clientY + 'px'); }); doc.addEventListener('wheel', e => { if (!this.spot) return; this.spotR = Math.max(80, Math.min(600, this.spotR - Math.sign(e.deltaY) * 30)); s.style.setProperty('--r', this.spotR + 'px'); e.preventDefault(); }, { passive: false }); }
    if (on) this.toast('스포트라이트 — 마우스를 따라가요 · 휠로 크기');
  };
  // 전역 입력
  Stage.prototype.bindGlobal = function () {
    const self = this;
    global.addEventListener('resize', () => self.fit());
    doc.getElementById('kt2-paper').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) { self.act(b); return; } if (self._lpDone) { self._lpDone = false; return; } if (self.edit) return; if (!self.pen && !e.target.closest('button, a, input, textarea, .klab-frame')) { const zd = doc.querySelector('#kt2-paper .zoomed'); if (zd) { zd.classList.remove('zoomed'); return; } const r = doc.getElementById('kt2-canvas').getBoundingClientRect(); if (e.clientX - r.left < r.width * 0.15) self.prev(); else self.next(); } });
    // 우클릭 / 길게 누르기 = 그 부품 크게 보기
    const paperEl = doc.getElementById('kt2-paper');
    paperEl.addEventListener('dragover', e => { if (self.edit) { e.preventDefault(); paperEl.classList.add('dragover'); } });
    paperEl.addEventListener('dragleave', () => paperEl.classList.remove('dragover'));
    paperEl.addEventListener('drop', e => { paperEl.classList.remove('dragover'); if (!self.edit) return; e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) self.loadPhoto(f); });
    paperEl.addEventListener('contextmenu', e => { const z = e.target.closest('.zoomable'); if (z) { e.preventDefault(); self.toggleZoom(z); } });
    let lp; paperEl.addEventListener('touchstart', e => { const z = e.target.closest('.zoomable'); if (!z) return; lp = setTimeout(() => { self.toggleZoom(z); self._lpDone = true; }, 520); }, { passive: true });
    paperEl.addEventListener('touchend', () => clearTimeout(lp)); paperEl.addEventListener('touchmove', () => clearTimeout(lp), { passive: true });
    doc.querySelectorAll('.ov').forEach(o => o.addEventListener('click', e => { if (e.target === o && o.id !== 'ov-res') self.closeOv(); if (e.target === o && o.id === 'ov-res') self.closeOv(); }));
    doc.addEventListener('keydown', e => {
      if (e.target && (/INPUT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable)) return;
      const k = e.key; const ov = doc.querySelector('.ov.on');
      if (global.KT2_ACTIVITY && global.KT2_ACTIVITY.session) { if (k === 'Escape') { e.preventDefault(); global.KT2_ACTIVITY.hostClose(); } return; }
      if (k === 'Escape') { if (ov) self.closeOv(); else if (self.pen) self.setPen(false); else if (self.spot) self.setSpot(false); else if (self.black) self.setBlack(false); return; }
      if (ov && ov.id !== 'ov-media') return;
      if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); self.next(); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); self.prev(); }
      else if (k === 'Home') self.go(0, -1); else if (k === 'End') self.go(self.slides.length - 1, 1);
      else if (k === 'a' || k === 'A') self.revealAll(); else if (k === 'f' || k === 'F') self.fullscreen(); else if (k === 'h' || k === 'H') self.hudAct('act'); else if (k === 'b' || k === 'B' || k === '.') self.setBlack(!self.black);
      else if (k === 'p' || k === 'P') self.setPen(!self.pen); else if (k === 's' || k === 'S') self.setSpot(!self.spot); else if (k === 't' || k === 'T') self.openTimer();
      else if (k === 'd' || k === 'D') self.openPick(); else if (k === 'k' || k === 'K') self.openScore(); else if (k === 'n' || k === 'N') self.setTnote(!self.tnoteOn);
      else if (k === 'r' || k === 'R') self.openRes(); else if (k === 'g' || k === 'G') self.openToc(); else if (k === '?') self.openOv('ov-help');
      else if (k === '1') self.hudAct('allat', doc.querySelector('#hud button[data-h="allat"]'));
      else if (k === 'e' || k === 'E') self.setEdit(!self.edit);
      else if (k === '0') self.hudAct('still', doc.querySelector('#hud button[data-h="still"]'));
      else if (k === 'm' || k === 'M') self.hudAct('sound', doc.querySelector('#hud button[data-h="sound"]'));
      else if (/^[2-9]$/.test(k)) { const st = STAGES[+k - 2]; if (st) { const i = self.slides.findIndex(x => x.stage === st); if (i >= 0) self.go(i, i > self.idx ? 1 : -1); } }
    });
    const help = doc.querySelector('#ov-help .keys');
    if (help) help.innerHTML = [['→ 스페이스', '다음 조각 / 다음 슬라이드'], ['←', '이전 슬라이드'], ['A', '정답 공개 · 조각 모두'], ['1', '조각 차례로 ↔ 한번에'], ['0', '움직임·연출 끄기/켜기'], ['E', '편집 — 글자·사진·순서(우리 반 판)'], ['M', '효과음'], ['우클릭 · 길게 누르기', '그 부품 크게 보기'], ['2~6', '도입·전개·기본·응용·정리로 점프'], ['G', '목차 (건너뛸 슬라이드 체크)'], ['T', '타이머'], ['D', '뽑기'], ['K', '점수판'], ['H', '활동 — 이 차시 추천 · ⚡빠른 활동'], ['P', '펜'], ['S', '스포트라이트'], ['B', '검은 화면'], ['N', '교사 발문 띠'], ['R', '자료 서랍'], ['F', '전체 화면'], ['Esc', '닫기 / 도구 끄기'], ['화면 클릭', '오른쪽 85% = 다음 · 왼쪽 15% = 이전']].map(x => '<div><span>' + x[1] + '</span><kbd>' + x[0] + '</kbd></div>').join('');
    const hx = doc.querySelector('#ov-help [data-x]'); if (hx) hx.addEventListener('click', () => self.closeOv());
  };

  // ───────────────────────── 부팅 ─────────────────────────
  function params() { const p = {}; (global.location.search || '').replace(/^\?/, '').split('&').forEach(kv => { if (!kv) return; const [k, v] = kv.split('='); p[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); }); return p; }
  function loadScript(src) { return new Promise((res, rej) => { const s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); doc.head.appendChild(s); }); }
  function boot() {
    const q = params(); if (!q.g || !q.s || !q.u || !q.l) { doc.getElementById('kt2-stage').innerHTML = '<div style="color:#fff;text-align:center;font-size:20px">주소에 g·s·u·l 이 필요해요.<br><a href="index.html" style="color:#9fb0c3">← 차시 목록</a></div>'; return; }
    global.LESSONS = global.LESSONS || {};
    const slug = 'g' + q.g + '_' + q.s;
    const man = global.KT2_MANIFEST; let unitTitle = ''; let resFile = null;
    if (man) { const sj = man.subjects.find(x => x.slug === slug); const un = sj && sj.units.find(x => x.unit === +q.u); if (un) { unitTitle = un.title; resFile = un.resources; } }
    const scripts = ['../data/' + slug + '_u' + q.u + '.js']; if (resFile) scripts.push('../' + resFile);
    scripts.push('../engine/klab.js', '../vendor/three.min.js', '../engine/tools/shape3d.js', '../engine/tools/place_value.js');
    (async () => {
      for (const s of scripts) { try { await loadScript(s); } catch (e) { if (s.indexOf('/data/') >= 0) { doc.getElementById('kt2-stage').innerHTML = '<div style="color:#fff;text-align:center;font-size:20px">데이터 파일을 못 읽었어요: ' + esc(s) + '</div>'; return; } } }
      global.KT2 = global.KT2 || {}; global.KT2.stage = new Stage({ params: q, lessons: global.LESSONS, unitTitle });
    })();
  }
  global.KT2 = { renderSlide, Stage, md, esc, STAGES, STAGE_MIN, BLOCK_LABEL, boot, imgFallback };
  if (doc && doc.getElementById && doc.getElementById('kt2-stage') && !global.KT2_NO_BOOT) { if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);
