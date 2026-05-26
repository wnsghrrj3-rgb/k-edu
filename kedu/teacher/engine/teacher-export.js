/* ============================================================
   K-edu 티처 — 산출물 내보내기 (export)
   슬라이드 데이터(엔진과 동일 스키마) → 교사용 PPTX
   원칙: AI API 호출 없음. 조립된 데이터를 코드로 변환만 함(한계비용 0).
   환경: 브라우저(pptxgenjs CDN 전역) / Node(require) 양용.
   ============================================================ */
(function (root) {
  'use strict';

  // 세이지 그린 테마 (teacher-styles.css :root 토큰과 일치)
  var C = {
    text: '2A2D31', textLight: '5A6068', textMute: '8B919A',
    line: 'E5E2DC', bg: 'FAF8F3', card: 'FFFFFF',
    accent: '5B7A6E', accentSoft: 'E8EEEB', accentText: '3D5651',
    warm: 'B08B5C', warmSoft: 'F5EDE0'
  };
  var FONT = 'Gowun Dodum'; // 미설치 환경에선 자동 폴백

  // **굵게** → 리치 텍스트 런 배열
  function mdRuns(s, baseOpt) {
    s = String(s == null ? '' : s);
    var parts = s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map(function (p) {
      var bold = /^\*\*[^*]+\*\*$/.test(p);
      var txt = bold ? p.slice(2, -2) : p;
      var opt = Object.assign({}, baseOpt);
      if (bold) opt.bold = true;
      return { text: txt, options: opt };
    });
  }
  // 여러 줄(\n)을 breakLine 런으로
  function mdLines(s, baseOpt) {
    var lines = String(s == null ? '' : s).split('\n');
    var runs = [];
    lines.forEach(function (line, li) {
      var r = mdRuns(line, baseOpt);
      if (r.length === 0) r = [{ text: '', options: Object.assign({}, baseOpt) }];
      r[r.length - 1].options = Object.assign({}, r[r.length - 1].options, { breakLine: true });
      if (li === lines.length - 1) delete r[r.length - 1].options.breakLine;
      runs = runs.concat(r);
    });
    return runs;
  }
  function emojiRepeat(e, n) { var s = ''; for (var i = 0; i < (n || 0); i++) s += e; return s; }

  var W = 10, H = 5.625; // LAYOUT_16x9

  function addTitle(slide, t) {
    slide.addText(mdRuns(t, { fontFace: FONT, fontSize: 28, bold: true, color: C.accentText }),
      { x: 0.5, y: 0.35, w: W - 1, h: 0.9, align: 'left', valign: 'middle', margin: 0 });
  }
  var STAGE_OK = { '도입': 1, '전개': 1, '기본문제': 1, '응용문제': 1, '정리': 1, '마무리': 1 };
  function addStageTag(slide, stage) {
    if (!stage || !STAGE_OK[stage]) return;
    slide.addText(stage, { x: W - 2.0, y: 0.4, w: 1.5, h: 0.4, align: 'right', valign: 'middle',
      fontFace: FONT, fontSize: 11, color: C.textMute });
  }
  function centerText(slide, runsOrStr, opt) {
    opt = opt || {};
    var runs = typeof runsOrStr === 'string' ? mdLines(runsOrStr, { fontFace: FONT, fontSize: opt.fontSize || 20, color: opt.color || C.text }) : runsOrStr;
    slide.addText(runs, Object.assign({ x: 0.7, y: 1.5, w: W - 1.4, h: H - 2.0, align: 'center', valign: 'middle' }, opt.box || {}));
  }
  function bigEq(slide, str, y) {
    slide.addText(mdRuns(str, { fontFace: FONT, fontSize: 32, bold: true, color: C.accentText }),
      { x: 1.5, y: y == null ? 3.6 : y, w: W - 3, h: 0.9, align: 'center', valign: 'middle',
        fill: { color: C.accentSoft }, rectRadius: 0.12, shape: 'roundRect' });
  }
  function emojiBand(slide, str, y, fontSize) {
    slide.addText(str, { x: 0.6, y: y, w: W - 1.2, h: 1.4, align: 'center', valign: 'middle',
      fontFace: FONT, fontSize: fontSize || 40 });
  }

  // 블록별 슬라이드 그리기
  function drawSlide(pres, slide, s) {
    var d = s.data || {};
    var b = s.block;
    if (b !== 'cover') addStageTag(slide, s.stage);

    switch (b) {
      case 'cover': {
        slide.background = { color: C.accent };
        slide.addText(mdLines(d.title, { fontFace: FONT, fontSize: 40, bold: true, color: 'FFFFFF' }),
          { x: 0.8, y: 1.6, w: W - 1.6, h: 1.8, align: 'center', valign: 'middle' });
        if (d.subtitle) slide.addText(d.subtitle, { x: 0.8, y: 3.5, w: W - 1.6, h: 0.8, align: 'center', fontFace: FONT, fontSize: 18, color: C.accentSoft });
        return;
      }
      case 'objective':
      case 'summary': {
        addTitle(slide, d.title);
        var pts = d.bullets || d.points || [];
        slide.addText(pts.map(function (p, i) {
          return { text: p.replace(/\*\*/g, ''), options: { fontFace: FONT, fontSize: 20, color: C.text, bullet: { code: '2022' }, breakLine: i < pts.length - 1, paraSpaceAfter: 10 } };
        }), { x: 1.2, y: 1.5, w: W - 2.4, h: H - 2.0, align: 'left', valign: 'middle' });
        return;
      }
      case 'motivate': {
        addTitle(slide, d.scene_title || d.title);
        var y = 1.6;
        if (d.visual) { emojiBand(slide, d.visual, y, 44); y += 1.5; }
        if (d.kids) {
          var faces = d.kids.map(function (k) { return k.face + ' ' + (k.label || ''); }).join('    ');
          slide.addText(faces, { x: 0.6, y: y, w: W - 1.2, h: 1.2, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 24 }); y += 1.3;
        }
        if (d.question) slide.addText(mdRuns(d.question, { fontFace: FONT, fontSize: 22, color: C.accentText, bold: true }),
          { x: 1.0, y: Math.min(y, 4.2), w: W - 2, h: 0.9, align: 'center', valign: 'middle', fill: { color: C.accentSoft }, rectRadius: 0.12, shape: 'roundRect' });
        return;
      }
      case 'concept': {
        addTitle(slide, d.title);
        if (d.bidirect) { centerText(slide, d.bidirect.map(function (l) { return l === '=' ? '=' : l; }).join('\n'), { fontSize: 24 }); return; }
        var yy = 1.5;
        if (d.content) { slide.addText(mdLines(d.content, { fontFace: FONT, fontSize: 19, color: C.text }), { x: 0.8, y: yy, w: W - 1.6, h: 1.5, align: 'center', valign: 'middle' }); yy += 1.4; }
        if (d.equation) { bigEq(slide, d.equation, yy); yy += 1.0; }
        if (d.symbol_meanings) {
          var sm = d.symbol_meanings.map(function (m) { return m.symbol + '  ' + m.meaning; }).join('        ');
          slide.addText(sm, { x: 0.6, y: yy, w: W - 1.2, h: 0.8, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 18, color: C.warm, bold: true }); yy += 0.8;
        }
        if (d.visual) emojiBand(slide, d.visual, Math.min(yy, 4.0), 36);
        return;
      }
      case 'visual_demo':
      case 'compare': {
        addTitle(slide, d.title);
        var topY = 1.4;
        if (d.body) { slide.addText(mdLines(d.body, { fontFace: FONT, fontSize: 16, color: C.textLight }), { x: 0.7, y: topY, w: W - 1.4, h: 0.7, align: 'center', valign: 'middle' }); topY += 0.8; }
        // 십배열 단독 (count 0이면 라벨/설명 위주)
        if (d.ten_frame_solo) {
          var tf = d.ten_frame_solo;
          var yy2 = 1.6;
          if (tf.count > 0) { emojiBand(slide, emojiRepeat('🟦', tf.count), yy2, 40); yy2 += 1.4; }
          var cap = (tf.label || '') + (d.sub_text ? '\n' + d.sub_text : '');
          if (cap.trim()) slide.addText(mdLines(cap, { fontFace: FONT, fontSize: 20, color: C.text }), { x: 0.8, y: yy2, w: W - 1.6, h: H - yy2 - 0.4, align: 'center', valign: 'middle' });
          return;
        }
        // 연결모형 계단
        if (d.linking_cube_staircase) {
          var r2 = d.linking_cube_staircase.range || [1, 5];
          var stair = [];
          for (var sv = r2[0]; sv <= r2[1]; sv++) stair.push(emojiRepeat('🟩', sv));
          slide.addText(stair.join('\n'), { x: 0.6, y: 1.5, w: W - 1.2, h: H - 2.0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 20 });
          if (d.caption) slide.addNotes(d.caption);
          return;
        }
        // 좌우 두 상황 카드
        if (d.left && d.right) {
          drawCmpCard(slide, d.left, 0.9, 2.4); drawCmpCard(slide, d.right, 5.4, 2.4);
          slide.addText('vs', { x: 4.6, y: 3.0, w: 0.8, h: 0.6, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 18, color: C.textMute, bold: true });
          return;
        }
        // demo_type 구체물
        if (d.demo_type) { drawDemo(slide, d.demo_type, d.params, topY); return; }
        // 십배열 비교 items
        if (d.items) {
          var bandTxt = d.items.map(function (it) { return emojiRepeat('🟦', it.ten_frame != null ? it.ten_frame : it.num) + '  (' + it.num + ')'; }).join('\n');
          slide.addText(mdLines(bandTxt, { fontFace: FONT, fontSize: 24, color: C.text }), { x: 0.7, y: topY, w: W - 1.4, h: H - topY - 0.4, align: 'center', valign: 'middle' });
          return;
        }
        // 폴백: sub_text/caption/visual 중 있는 것
        var fb = d.sub_text || d.caption || d.visual || '';
        if (fb) slide.addText(mdLines(fb, { fontFace: FONT, fontSize: 20, color: C.text }), { x: 0.8, y: topY, w: W - 1.6, h: H - topY - 0.4, align: 'center', valign: 'middle' });
        return;
      }
      case 'basic_problem':
      case 'real_world':
      case 'advanced_problem': {
        addTitle(slide, d.title);
        var py = 1.5;
        var visual = d.visual || (d.scenario && d.scenario.icon);
        if (visual) { emojiBand(slide, visual, py, 40); py += 1.3; }
        var qtext = d.question || d.challenge || (d.scenario && d.scenario.body) || d.content || d.body || '';
        if (d.equation) { bigEq(slide, d.equation, py); py += 1.0; }
        if (qtext) { slide.addText(mdLines(qtext, { fontFace: FONT, fontSize: 22, color: C.text }), { x: 0.8, y: py, w: W - 1.6, h: 1.0, align: 'center', valign: 'middle' }); py += 1.0; }
        if (d.choices) {
          var chTxt = d.choices.map(function (c) { return '⃞ ' + String(c).replace(/\*\*/g, ''); }).join('     ');
          slide.addText(chTxt, { x: 0.6, y: Math.min(py, 4.3), w: W - 1.2, h: 0.7, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 18, color: C.text });
        }
        // 정답: 발표 노트로 (PPT 화면엔 노출 안 함 — 교사용)
        var ans = d.answer != null ? d.answer : (d.answers ? d.answers.join(', ') : (d.answer_indices && d.choices ? d.answer_indices.map(function (i) { return d.choices[i]; }).join(', ') : null));
        if (ans != null) slide.addNotes('정답: ' + ans);
        return;
      }
      case 'question': {
        addTitle(slide, d.title);
        var qy = 1.6;
        slide.addText(mdRuns(d.question || d.content || '', { fontFace: FONT, fontSize: 22, color: C.accentText, bold: true }),
          { x: 1.0, y: qy, w: W - 2, h: 0.9, align: 'center', valign: 'middle', fill: { color: C.accentSoft }, rectRadius: 0.12, shape: 'roundRect' });
        if (d.items) slide.addText(d.items.map(function (it, i) { return { text: String(it).replace(/\*\*/g, ''), options: { fontFace: FONT, fontSize: 18, color: C.text, bullet: { code: '2610' }, breakLine: i < d.items.length - 1, paraSpaceAfter: 8 } }; }),
          { x: 1.4, y: qy + 1.1, w: W - 2.8, h: 2.2, align: 'left', valign: 'top' });
        return;
      }
      case 'trace_symbol': {
        addTitle(slide, d.title);
        slide.addText(d.symbol || '', { x: 0, y: 1.4, w: W, h: 2.0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 120, bold: true, color: C.warm });
        if (d.body) slide.addText(mdLines(d.body, { fontFace: FONT, fontSize: 16, color: C.textLight }), { x: 0.8, y: 3.7, w: W - 1.6, h: 0.8, align: 'center', valign: 'middle' });
        return;
      }
      case 'trace': {
        addTitle(slide, d.title);
        var tn = (d.trace_numbers || []).join('   ');
        slide.addText(tn, { x: 0.5, y: 1.8, w: W - 1, h: 1.6, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 88, bold: true, color: C.warm });
        if (d.note) slide.addText(d.note, { x: 0.8, y: 3.8, w: W - 1.6, h: 0.7, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, color: C.textLight });
        return;
      }
      case 'match': {
        addTitle(slide, d.title);
        // 변종 A: 빈칸 채우기형 (left/right/options/answers)
        if (d.pairs == null && (d.left || d.right || d.options)) {
          var qy = 1.6;
          if (d.left) { slide.addText(mdRuns(d.left, { fontFace: FONT, fontSize: 24, color: C.text }), { x: 0.8, y: qy, w: W - 1.6, h: 0.8, align: 'center', valign: 'middle' }); qy += 0.9; }
          if (d.right) { slide.addText(mdRuns(d.right, { fontFace: FONT, fontSize: 24, color: C.text }), { x: 0.8, y: qy, w: W - 1.6, h: 0.8, align: 'center', valign: 'middle' }); qy += 0.9; }
          if (d.options) slide.addText(d.options.map(function (o) { return '⃞ ' + String(o); }).join('      '), { x: 0.6, y: Math.min(qy, 4.2), w: W - 1.2, h: 0.7, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 20, color: C.text });
          if (d.answers) slide.addNotes('정답: ' + d.answers.join(', '));
          return;
        }
        var pairs = d.pairs || [];
        // pairs 변종 통합: 왼쪽(시각/말)·오른쪽(수/읽기) 추출
        function leftOf(p) {
          if (p.emoji != null) return p.emoji;
          if (p.label != null) return p.label;
          if (p.ten_frame != null) return emojiRepeat('🟦', p.ten_frame);
          if (p.word != null) return p.word;
          if (p.ord != null) return p.ord;
          return '';
        }
        function rightOf(p) {
          if (p.num != null) return String(p.num);
          if (p.kind != null) return p.kind;
          if (p.n != null) return String(p.n);
          if (p.word != null && p.n != null) return p.word;
          return p.num != null ? String(p.num) : (p.n != null ? String(p.n) : '');
        }
        var rows = pairs.map(function (p) { return { l: leftOf(p), r: rightOf(p) }; });
        if (rows.length === 0) { slide.addText('(짝짓기 항목 없음)', { x: 0.8, y: 2.4, w: W - 1.6, h: 0.6, align: 'center', fontFace: FONT, fontSize: 16, color: C.textMute }); return; }
        var startY = 1.5, rowH = Math.min(0.65, (H - 2.0) / rows.length);
        rows.forEach(function (r, i) {
          var y = startY + i * rowH;
          slide.addText(String(r.l), { x: 1.0, y: y, w: 4.2, h: rowH, align: 'right', valign: 'middle', fontFace: FONT, fontSize: 24 });
          slide.addText('—', { x: 5.3, y: y, w: 0.5, h: rowH, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, color: C.textMute });
          slide.addText(String(r.r), { x: 5.85, y: y, w: 2.5, h: rowH, align: 'left', valign: 'middle', fontFace: FONT, fontSize: 24, bold: true, color: C.accentText });
        });
        return;
      }
      case 'multi': {
        addTitle(slide, d.title);
        var opts = d.options || [];
        var line = opts.map(function (o) { return o.emoji || ''; }).join('      ');
        slide.addText(line, { x: 0.6, y: 1.8, w: W - 1.2, h: 2.0, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 30 });
        if (d.note) slide.addText(mdLines(d.note, { fontFace: FONT, fontSize: 16, color: C.textLight }), { x: 0.8, y: 4.0, w: W - 1.6, h: 0.7, align: 'center', valign: 'middle' });
        var correct = opts.map(function (o, i) { return o.correct ? (i + 1) : null; }).filter(function (x) { return x; });
        if (correct.length) slide.addNotes('정답: ' + correct.join(', ') + '번');
        return;
      }
      case 'self_assessment': {
        addTitle(slide, d.title);
        var stars = '⭐'.repeat(d.stars || 3);
        slide.addText((d.items || []).map(function (it, i) {
          return { text: it.replace(/\*\*/g, '') + '   ' + stars, options: { fontFace: FONT, fontSize: 18, color: C.text, breakLine: i < d.items.length - 1, paraSpaceAfter: 12 } };
        }), { x: 1.2, y: 1.6, w: W - 2.4, h: H - 2.2, align: 'left', valign: 'middle' });
        return;
      }
      case 'arrow_flow': {
        addTitle(slide, d.title);
        if (d.flow) { centerText(slide, d.flow.map(function (f) { return f.num + ' ' + f.label; }).join('   →   '), { fontSize: 22 }); return; }
        if (d.pairs) {
          var fwd = (d.labels && d.labels.forward) || '모으면', bwd = (d.labels && d.labels.backward) || '가르면';
          var rows = d.pairs.map(function (p) { return p.left + '   →(' + fwd + ')→   ' + p.right + '   ←(' + bwd + ')←'; }).join('\n');
          centerText(slide, rows, { fontSize: 20 }); return;
        }
        if (d.steps) { centerText(slide, d.steps.join('\n'), { fontSize: 22 }); return; }
        if (d.body) centerText(slide, d.body, { fontSize: 20 });
        return;
      }
      case 'card_arrange': {
        addTitle(slide, d.title);
        var cy = 1.6;
        if (d.body) { slide.addText(mdLines(d.body, { fontFace: FONT, fontSize: 16, color: C.textLight }), { x: 0.7, y: cy, w: W - 1.4, h: 0.7, align: 'center', valign: 'middle' }); cy += 0.8; }
        if (d.cards) { slide.addText(d.cards.join('   '), { x: 0.6, y: cy, w: W - 1.2, h: 1.2, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 40, bold: true, color: C.accentText }); slide.addNotes('정답 순서: ' + (d.target || d.cards.slice().sort(function (a, b) { return a - b; })).join(', ')); }
        else if (d.equation) { bigEq(slide, d.equation, cy + 0.3); slide.addNotes('읽기: ' + (d.readings || []).join(' / ')); }
        else if (d.pairs) { slide.addText(d.pairs.map(function (p) { return p.join(' + '); }).join('\n'), { x: 0.6, y: cy, w: W - 1.2, h: 2.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 22, color: C.text }); slide.addNotes('합 = ' + d.total); }
        return;
      }
      case 'game': {
        addTitle(slide, d.title);
        slide.addText((d.steps || []).map(function (st, i) { return { text: String(st).replace(/\*\*/g, ''), options: { fontFace: FONT, fontSize: 18, color: C.text, bullet: { type: 'number' }, breakLine: i < d.steps.length - 1, paraSpaceAfter: 8 } }; }),
          { x: 1.2, y: 1.5, w: W - 2.4, h: H - 2.0, align: 'left', valign: 'middle' });
        return;
      }
      case 'misconception': {
        addTitle(slide, d.title);
        slide.addText([
          { text: (d.label || '오개념 주의') + '\n', options: { fontFace: FONT, fontSize: 16, color: C.warm, bold: true, breakLine: true } },
          { text: '✗ ' + (d.wrong || '') + '\n', options: { fontFace: FONT, fontSize: 20, color: 'B85042', breakLine: true } },
          { text: '✓ ' + (d.right || ''), options: { fontFace: FONT, fontSize: 20, color: C.accent } }
        ], { x: 1.0, y: 1.6, w: W - 2, h: 2.5, align: 'left', valign: 'middle', fill: { color: C.warmSoft }, rectRadius: 0.12, shape: 'roundRect' });
        return;
      }
      case 'next_lesson': {
        addTitle(slide, d.title);
        centerText(slide, (d.preview || '') + (d.body ? '\n\n' + d.body : ''), { fontSize: 22 });
        return;
      }
      case 'review': {
        addTitle(slide, d.title);
        centerText(slide, d.content || '', { fontSize: 20 });
        return;
      }
      case 'offline_activity': {
        addTitle(slide, d.title);
        var oy = 1.5;
        slide.addText((d.tag || '교실에서 함께 해요'), { x: 0.8, y: oy, w: W - 1.6, h: 0.5, align: 'center', fontFace: FONT, fontSize: 14, color: C.warm, bold: true }); oy += 0.6;
        if (d.icon) { slide.addText(d.icon, { x: 0, y: oy, w: W, h: 1.0, align: 'center', fontFace: FONT, fontSize: 48 }); oy += 1.1; }
        if (d.body) { slide.addText(mdLines(d.body, { fontFace: FONT, fontSize: 18, color: C.text }), { x: 0.9, y: oy, w: W - 1.8, h: 1.2, align: 'center', valign: 'middle' }); oy += 1.0; }
        if (d.materials) slide.addText('필요한 것: ' + d.materials, { x: 0.9, y: Math.min(oy, 4.6), w: W - 1.8, h: 0.5, align: 'center', fontFace: FONT, fontSize: 14, color: C.textLight });
        return;
      }
      // 인터랙티브 블록은 정적 스냅샷(시작 상태)으로
      case 'interactive_ten_frame': {
        addTitle(slide, d.title);
        emojiBand(slide, emojiRepeat('🟦', d.start_count || 0) || '(빈 십배열판)', 1.8, 40);
        if (d.question) slide.addText(mdRuns(d.question, { fontFace: FONT, fontSize: 20, color: C.accentText, bold: true }), { x: 1, y: 3.6, w: W - 2, h: 0.8, align: 'center', valign: 'middle', fill: { color: C.accentSoft }, rectRadius: 0.12, shape: 'roundRect' });
        return;
      }
      case 'interactive_cube_stairs': {
        addTitle(slide, d.title);
        emojiBand(slide, emojiRepeat('🟩', d.start_count || 3), 2.0, 40);
        return;
      }
      case 'interactive_number_line': {
        addTitle(slide, d.title);
        var r = d.range || [0, 10]; var nums = [];
        for (var n = r[0]; n <= r[1]; n++) nums.push(n === (d.start || 5) ? '【' + n + '】' : n);
        slide.addText(nums.join('  '), { x: 0.5, y: 2.4, w: W - 1, h: 0.8, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 22, color: C.text });
        return;
      }
      case 'number_line_demo': {
        addTitle(slide, d.title);
        var rr = (d.nl && d.nl.range) || [0, 10]; var ns = [];
        for (var m = rr[0]; m <= rr[1]; m++) ns.push(m);
        slide.addText(ns.join('  '), { x: 0.5, y: 2.4, w: W - 1, h: 0.8, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 22, color: C.text });
        if (d.caption) slide.addText(d.caption, { x: 0.8, y: 3.4, w: W - 1.6, h: 0.6, align: 'center', fontFace: FONT, fontSize: 14, color: C.textLight });
        return;
      }
      default: {
        addTitle(slide, d.title || s.block);
        if (d.content || d.body) centerText(slide, d.content || d.body, { fontSize: 18 });
        return;
      }
    }
  }

  function drawCmpCard(slide, sit, x, y) {
    slide.addShape('roundRect', { x: x, y: y, w: 3.6, h: 2.2, fill: { color: C.card }, line: { color: C.line, width: 1 }, rectRadius: 0.12 });
    if (sit.emoji) slide.addText(sit.emoji, { x: x, y: y + 0.15, w: 3.6, h: 0.7, align: 'center', fontFace: FONT, fontSize: 34 });
    slide.addText(sit.situation || '', { x: x + 0.2, y: y + 0.9, w: 3.2, h: 0.5, align: 'center', fontFace: FONT, fontSize: 14, color: C.textLight });
    slide.addText(mdRuns(sit.eq || '', { fontFace: FONT, fontSize: 22, bold: true, color: C.accentText }), { x: x + 0.2, y: y + 1.4, w: 3.2, h: 0.6, align: 'center', valign: 'middle' });
  }

  function drawDemo(slide, dt, p, topY) {
    if (!p) return;
    var y = topY + 0.2;
    function band(str, fs) { slide.addText(str, { x: 0.6, y: y, w: W - 1.2, h: 1.2, align: 'center', valign: 'middle', fontFace: FONT, fontSize: fs || 40 }); y += 1.3; }
    switch (dt) {
      case 'linking_cube_merge': band(emojiRepeat('🟦', p.left) + ' + ' + emojiRepeat('🟦', p.right) + ' = ' + emojiRepeat('🟦', p.total)); bigEq(slide, p.left + ' + ' + p.right + ' = ' + p.total, y); break;
      case 'addition_visual': band(emojiRepeat(p.emoji || '🔵', p.left) + ' + ' + emojiRepeat(p.emoji || '🔵', p.incoming) + ' = ' + emojiRepeat(p.emoji || '🔵', p.total), 34); bigEq(slide, p.left + ' + ' + p.incoming + ' = ' + p.total, y); break;
      case 'merge_visual': band(emojiRepeat(p.emoji || '🔵', p.left) + ' + ' + emojiRepeat(p.emoji || '🔵', p.right) + ' = ' + emojiRepeat(p.emoji || '🔵', p.total), 34); bigEq(slide, p.left + ' + ' + p.right + ' = ' + p.total, y); break;
      case 'subtraction_remove_visual': band(emojiRepeat(p.emoji || '🔵', p.initial) + '  →  ' + emojiRepeat(p.emoji || '🔵', p.remaining), 34); bigEq(slide, p.initial + ' − ' + p.removed + ' = ' + p.remaining, y); break;
      case 'subtraction_compare_visual': band(emojiRepeat(p.left_shape || '●', p.left) + '\n' + emojiRepeat(p.right_shape || '▲', p.right), 30); bigEq(slide, p.left + ' − ' + p.right + ' = ' + p.diff, y); break;
      case 'gather_split': bigEq(slide, p.total + '', y - 0.2); y += 0.9; band((p.examples || []).map(function (e) { return e[0] + ' · ' + e[1]; }).join('     '), 22); break;
      default: break;
    }
  }

  // 차시 데이터 → 인쇄용 학습지 HTML (문제·활동 추출)
  function buildWorksheetHTML(lesson) {
    var meta = lesson.meta || {};
    var slides = (lesson.slides || []).filter(function (s) { return s.included !== false; });
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function clean(s) { return esc(String(s == null ? '' : s).replace(/\*\*/g, '')); }

    var items = [];
    slides.forEach(function (s) {
      var d = s.data || {};
      if (s.block === 'basic_problem' || s.block === 'advanced_problem' || s.block === 'real_world') {
        var q = d.question || d.challenge || (d.scenario && d.scenario.body) || '';
        var eq = d.equation ? clean(d.equation) : '';
        if (q || eq) {
          var ans = d.answer != null ? d.answer : (d.answers ? d.answers.join(', ') : '');
          items.push({ type: 'q', visual: d.visual || (d.scenario && d.scenario.icon) || '', q: clean(q), eq: eq, choices: d.choices ? d.choices.map(clean) : null, ans: ans });
        }
      } else if (s.block === 'offline_activity') {
        items.push({ type: 'activity', title: clean(d.title), body: clean(d.body), materials: d.materials ? clean(d.materials) : '' });
      }
    });

    var qNum = 0;
    var body = items.map(function (it) {
      if (it.type === 'activity') {
        return '<div class="ws-activity"><div class="ws-act-title">🙋 ' + it.title + '</div><div class="ws-act-body">' + it.body + '</div>' + (it.materials ? '<div class="ws-mat">필요한 것: ' + it.materials + '</div>' : '') + '<div class="ws-write-area"></div></div>';
      }
      qNum++;
      var ch = it.choices ? '<div class="ws-choices">' + it.choices.map(function (c, i) { return '<span class="ws-choice">' + (i + 1) + '. ' + c + '</span>'; }).join('') + '</div>' : '';
      return '<div class="ws-q"><div class="ws-q-head"><span class="ws-q-num">' + qNum + '</span>'
        + (it.visual ? '<span class="ws-visual">' + esc(it.visual) + '</span>' : '')
        + '</div>' + (it.eq ? '<div class="ws-eq">' + it.eq + '</div>' : '') + (it.q ? '<div class="ws-q-text">' + it.q + '</div>' : '')
        + ch + '<div class="ws-answer-box"></div></div>';
    }).join('');

    var answers = items.filter(function (it) { return it.type === 'q' && it.ans !== '' && it.ans != null; });
    var ansKey = answers.length ? '<div class="ws-key"><div class="ws-key-title">✓ 정답 (교사용 — 자르거나 접어서 사용)</div><div class="ws-key-list">' + answers.map(function (it, i) { return (i + 1) + ') ' + clean(it.ans); }).join('　') + '</div></div>' : '';

    return '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">'
      + '<style>'
      + '@page { size: A4; margin: 18mm 16mm; }'
      + 'body { font-family: "Gowun Dodum", "Noto Sans KR", sans-serif; color: #2A2D31; line-height: 1.5; }'
      + '.ws-head { border-bottom: 2px solid #5B7A6E; padding-bottom: 10px; margin-bottom: 8px; }'
      + '.ws-title { font-size: 22px; font-weight: 800; color: #3D5651; }'
      + '.ws-sub { font-size: 13px; color: #5A6068; margin-top: 4px; }'
      + '.ws-namebar { display: flex; gap: 24px; font-size: 13px; color: #5A6068; margin: 10px 0 18px; }'
      + '.ws-namebar span { border-bottom: 1px solid #8B919A; padding: 0 40px 2px 4px; }'
      + '.ws-q { border: 1px solid #E5E2DC; border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; page-break-inside: avoid; }'
      + '.ws-q-head { display: flex; align-items: center; gap: 12px; }'
      + '.ws-q-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #5B7A6E; color: #fff; font-weight: 700; font-size: 14px; }'
      + '.ws-visual { font-size: 26px; }'
      + '.ws-eq { font-size: 24px; font-weight: 800; color: #3D5651; margin: 8px 0; }'
      + '.ws-q-text { font-size: 16px; margin: 6px 0; }'
      + '.ws-choices { display: flex; gap: 18px; flex-wrap: wrap; margin: 8px 0; font-size: 15px; }'
      + '.ws-answer-box { height: 44px; border: 1px dashed #B08B5C; border-radius: 8px; margin-top: 8px; background: #FAF8F3; }'
      + '.ws-activity { border: 1px solid #B08B5C; border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; background: #F5EDE0; page-break-inside: avoid; }'
      + '.ws-act-title { font-weight: 700; color: #B08B5C; margin-bottom: 6px; }'
      + '.ws-write-area { height: 60px; border-bottom: 1px solid #d8cdb8; margin-top: 8px; }'
      + '.ws-mat { font-size: 12px; color: #5A6068; margin-top: 6px; }'
      + '.ws-key { margin-top: 24px; border-top: 1px dashed #8B919A; padding-top: 10px; font-size: 12px; color: #5A6068; }'
      + '.ws-key-title { font-weight: 700; margin-bottom: 4px; }'
      + '</style></head><body>'
      + '<div class="ws-head"><div class="ws-title">' + esc(meta.title || '학습지') + '</div>'
      + '<div class="ws-sub">' + esc(meta.subtitle || '') + '</div></div>'
      + '<div class="ws-namebar"><span>이름</span><span>날짜</span><span>점수</span></div>'
      + (body || '<div class="ws-sub">이 차시에는 인쇄용 문제가 없습니다.</div>')
      + ansKey
      + '</body></html>';
  }

  // 공개 API: 차시 객체 → Pptx 인스턴스
  function buildPptx(PptxGen, lesson, opts) {
    opts = opts || {};
    var pres = new PptxGen();
    pres.defineLayout({ name: 'KEDU', width: W, height: H });
    pres.layout = 'KEDU';
    pres.author = 'K-edu 티처';
    pres.title = (lesson.meta && lesson.meta.title) || '수업 자료';
    var slides = (lesson.slides || []).filter(function (s) { return s.included !== false; });
    slides.forEach(function (s) {
      var slide = pres.addSlide();
      slide.background = { color: C.bg };
      try { drawSlide(pres, slide, s); }
      catch (e) { slide.addText('렌더 오류: ' + s.block + ' (' + (s.id || '') + ')', { x: 0.5, y: 2.5, w: 9, h: 0.6, fontFace: FONT, fontSize: 14, color: 'B85042' }); }
    });
    return pres;
  }

  var api = { buildPptx: buildPptx, buildWorksheetHTML: buildWorksheetHTML, _theme: C, _drawSlide: drawSlide };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TeacherExport = api;
})(typeof window !== 'undefined' ? window : this);
