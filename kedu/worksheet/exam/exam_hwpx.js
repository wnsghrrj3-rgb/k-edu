/* ============================================================
   케이학습지 시험지 — 한글(.hwpx) 쓰개 (exam_hwpx.js) · 2026-11-14
   ------------------------------------------------------------
   금성초 학력경시 양식(tpl/exam_q.hwpx · tpl/exam_key.hwpx)에 문항을 채워 넣는다.
   - 글꼴·문단·테두리는 양식 header.xml 의 번호를 그대로 쓴다(본문 = 함초롬바탕 11pt · 상자 안 10pt)
   - 쪽 = 양식의 2단 표 한 장. 어느 문항이 어느 단에 갈지는 화면(index.html)이 높이를 재어 정한다(layout)
   - 줄 배치 정보(linesegarray)는 넣지 않는다 — 한글이 열 때 다시 배치한다
   - 분수는 한글 수식(hp:equation), 그림은 BinData PNG(hp:pic)

   blocks(item, no) → 문항 하나를 이루는 덩어리 목록. 화면 미리보기와 한글 파일이 같은 덩어리를 그린다.
     {p, runs, para}   문단 · runs = [{t, b}|{eq, w, n, d}] · para = 'body'|'ans'|'right'|'center'
     {box, title, lines}  테두리 상자(지문·<보기>·OX 문장)
     {match, left, right} 선 잇기
     {img, src, w, h}   그림(w·h = HWPUNIT)
     {essay, n}         서술 답칸(줄 n)
   브라우저(window.KeduExamHwpx)·node(module.exports)
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./exam_core.js'));
  else root.KeduExamHwpx = factory(root.KeduExam);
})(typeof self !== 'undefined' ? self : this, function (K) {
  'use strict';

  /* 양식 header.xml 번호 */
  var CP = { body: 32, bold: 33, box: 27, boxBold: 38 };
  var PP = { body: 11, ans: 50, center: 2, right: 54, hang1: 55, hang2: 56, opt: 57 };
  /* 내어쓰기(준호 2026-11-14: 둘째 줄이 첫 줄 글자 시작에 맞게) — 양식 header 에 문단 모양 셋을 더한다
     hang1 = 「1. 」 · hang2 = 「12. 」 · opt = 보기 「① 」(왼쪽 들여 600 + 내어쓰기). 값 = HWPUNIT(11pt 함초롬바탕 글자 폭 어림) */
  var HANG = { hang1: 1250, hang2: 1800, opt: 1400, optLeft: 600 };
  function hangParaPr(id, left, intent) {
    var m = function (k) { return '<hh:margin><hc:intent value="' + Math.round(intent * k) + '" unit="HWPUNIT"/><hc:left value="' + Math.round(left * k) + '" unit="HWPUNIT"/><hc:right value="0" unit="HWPUNIT"/><hc:prev value="0" unit="HWPUNIT"/><hc:next value="0" unit="HWPUNIT"/></hh:margin><hh:lineSpacing type="PERCENT" value="160" unit="HWPUNIT"/>'; };
    return '<hh:paraPr id="' + id + '" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="0" suppressLineNumbers="0" checked="0" textDir="AUTO"><hh:align horizontal="JUSTIFY" vertical="BASELINE"/><hh:heading type="NONE" idRef="0" level="0"/><hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="KEEP_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/><hh:autoSpacing eAsianEng="0" eAsianNum="0"/>' +
      '<hp:switch><hp:case hp:required-namespace="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar">' + m(0.5) + '</hp:case><hp:default>' + m(1) + '</hp:default></hp:switch><hh:border borderFillIDRef="4" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/></hh:paraPr>';
  }
  function addParaPrs(header) {
    var extra = hangParaPr(PP.hang1, HANG.hang1, -HANG.hang1) + hangParaPr(PP.hang2, HANG.hang2, -HANG.hang2) + hangParaPr(PP.opt, HANG.optLeft + HANG.opt, -HANG.opt);
    return header.replace(/<hh:paraProperties itemCnt="(\d+)">/, function (_, n) { return '<hh:paraProperties itemCnt="' + (+n + 3) + '">'; }).replace('</hh:paraProperties>', extra + '</hh:paraProperties>');
  }
  var BF = { box: 2, none: 11 };
  var COL_W = 24669;                       // 단 안쪽 너비(양식 상자 너비)
  var CAP = { first: 65200, next: 76100 }; // 단 안쪽 높이(셀 높이 − 여백)
  var CLOSING = '♣ 다시 한번 검토하기 바랍니다.';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var _id = 1900000000; function nid() { return String(_id++); }

  /* ---------- 문항 → 덩어리 ---------- */
  var BOLD_WORDS = /(적절하지\s*않은|알맞지\s*않은|옳지\s*않은|않은|아닌|틀린|잘못된|잘못|없는)/g;
  function textRuns(s, opt) {
    var out = [];
    K.splitMath(s).forEach(function (seg) {
      if (seg.eq) { out.push(seg); return; }
      if (opt && opt.noBold) { out.push({ t: seg.t }); return; }
      var last = 0, m; BOLD_WORDS.lastIndex = 0;
      while ((m = BOLD_WORDS.exec(seg.t))) { if (m.index > last) out.push({ t: seg.t.slice(last, m.index) }); out.push({ t: m[0], b: true }); last = BOLD_WORDS.lastIndex; }
      if (last < seg.t.length) out.push({ t: seg.t.slice(last) });
    });
    return out;
  }
  function widthOf(s) { var n = 0; K.plain(s).split('').forEach(function (ch) { n += /[가-힣ㄱ-ㅎ①-⑳㉠-㉻○●□△☆★]/.test(ch) ? 2 : 1; }); return n; }
  function pad(s, w) { var d = w - widthOf(s); return s + new Array(Math.max(1, d) + 1).join(' '); }

  function blocks(it, no) {
    var B = [];
    B.push({ p: true, para: no >= 10 ? 'hang2' : 'hang1', runs: [{ t: no + '. ' }].concat(textRuns(it.stem)) });
    if (it.kind === 'mc') B.push({ p: true, para: 'ans', runs: [{ t: '   -----------------------------(       )' }] });
    if (it.statement) B.push({ box: true, title: '', lines: [it.statement] });
    if (it.box) B.push({ box: true, title: it.box.title || '', lines: it.box.lines });
    if (it.img) B.push({ img: true, src: it.img.src, w: it.img.w, h: it.img.h });
    if (it.kind === 'mc' && it.options) {
      var ops = it.options.filter(function (o) { return o.t !== '' && o.t != null; });
      var short = ops.every(function (o) { return widthOf(o.t) <= 14; }) && ops.every(function (o) { return !/⟨/.test(o.t) || widthOf(o.t) <= 10; });
      if (short) {
        for (var i = 0; i < ops.length; i += 2) {
          var a = K.CIRC[i] + ' ', b = ops[i + 1] ? K.CIRC[i + 1] + ' ' : '';
          var runs = [{ t: a }].concat(textRuns(ops[i].t, { noBold: true }));
          if (ops[i + 1]) runs = runs.concat([{ t: new Array(Math.max(2, 18 - widthOf(ops[i].t)) + 1).join(' ') + b }]).concat(textRuns(ops[i + 1].t, { noBold: true }));
          B.push({ p: true, para: 'opt', runs: runs });
        }
      } else ops.forEach(function (o, k) { B.push({ p: true, para: 'opt', runs: [{ t: K.CIRC[k] + ' ' }].concat(textRuns(o.t, { noBold: true })) }); });
    }
    if (it.kind === 'ox') B.push({ p: true, para: 'ans', runs: [{ t: '   -----------------------------(       )' }] });
    if (it.kind === 'sa') B.push({ p: true, para: 'ans', runs: [{ t: '   답: (                              )' }] });
    if (it.kind === 'match' && it.pairs) B.push({ match: true, left: it.pairs.left, right: it.pairs.right });
    if (it.kind === 'essay') B.push({ essay: true, n: 4 });
    return B;
  }
  function closingBlocks(grade) {
    return [{ p: true, para: 'body', runs: [{ t: '' }] },
      { p: true, para: 'center', runs: [{ t: CLOSING, b: true }] },
      { box: true, name: true, title: '', lines: [' ' + grade + ' 학년 (       )반 (     )번', '      이름 [              ]'] }];
  }

  /* ---------- 덩어리 → hwpx XML ---------- */
  function eqXML(seg, cp) {
    /* 크기 = python-hwpx measure_equation 값에 맞춘 식(11pt: ⟨3/4⟩ 1067×2552 · 자리 하나 늘 때마다 +517) — 윈도 한글은 저장된 크기로 배치한다 */
    var digits = Math.max(String(seg.n).length, String(seg.d).length), wd = String(seg.w || '').length, bu = cp === CP.box || cp === CP.boxBold ? 1000 : 1100, k = bu / 1100;
    var w = Math.round((550 + 517 * (digits + wd)) * k), h = Math.round(2552 * k);
    return '<hp:equation id="' + nid() + '" zOrder="0" numberingType="EQUATION" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" version="Equation Version 60" baseLine="66" textColor="#000000" baseUnit="' + bu + '" lineMode="CHAR" font="HYhwpEQ">' +
      '<hp:sz width="' + w + '" widthRelTo="ABSOLUTE" height="' + h + '" heightRelTo="ABSOLUTE" protect="0"/>' +
      '<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>' +
      '<hp:outMargin left="56" right="56" top="0" bottom="0"/><hp:shapeComment>수식입니다.</hp:shapeComment>' +
      '<hp:script>' + esc(seg.eq) + '</hp:script></hp:equation>';
  }
  function runsXML(runs, small) {
    if (!runs.length) runs = [{ t: '' }];
    return runs.map(function (r) {
      var cp = small ? (r.b ? CP.boxBold : CP.box) : (r.b ? CP.bold : CP.body);
      if (r.eq) return '<hp:run charPrIDRef="' + cp + '">' + eqXML(r, cp) + '<hp:t/></hp:run>';
      return '<hp:run charPrIDRef="' + cp + '">' + (r.t === '' ? '' : '<hp:t>' + esc(r.t) + '</hp:t>') + '</hp:run>';
    }).join('');
  }
  function pXML(para, runs, small, inner) {
    return '<hp:p id="0" paraPrIDRef="' + (PP[para] || PP.body) + '" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">' + (inner != null ? inner : runsXML(runs, small)) + '</hp:p>';
  }
  function cellXML(col, row, w, h, bf, paras, vAlign, margin) {
    var mg = margin || [510, 510, 141, 141];
    return '<hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="' + bf + '"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="' + (vAlign || 'CENTER') + '" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">' +
      paras + '</hp:subList><hp:cellAddr colAddr="' + col + '" rowAddr="' + row + '"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="' + w + '" height="' + h + '"/><hp:cellMargin left="' + mg[0] + '" right="' + mg[1] + '" top="' + mg[2] + '" bottom="' + mg[3] + '"/></hp:tc>';
  }
  function tblXML(rows, cols, W, H, bf, trs) {
    return '<hp:tbl id="' + nid() + '" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="' + rows + '" colCnt="' + cols + '" cellSpacing="0" borderFillIDRef="' + bf + '" noAdjust="0">' +
      '<hp:sz width="' + W + '" widthRelTo="ABSOLUTE" height="' + H + '" heightRelTo="ABSOLUTE" protect="0"/>' +
      '<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>' +
      '<hp:outMargin left="141" right="141" top="141" bottom="141"/><hp:inMargin left="510" right="510" top="141" bottom="141"/>' + trs + '</hp:tbl>';
  }
  function inTable(tbl) { return '<hp:run charPrIDRef="' + CP.body + '">' + tbl + '<hp:t/></hp:run>'; }
  var LINE_H = 1760, BOX_LINE_H = 1600;     // 11pt·10pt × 160 %

  function boxXML(b) {
    var paras = '';
    if (b.title) paras += pXML('body', [{ t: ' ' + b.title, b: true }], true);
    b.lines.forEach(function (l) { paras += pXML('body', textRuns(' ' + l, { noBold: true }), true); });
    var h = (b.lines.length + (b.title ? 1 : 0)) * BOX_LINE_H + 282;
    var tr = '<hp:tr>' + cellXML(0, 0, COL_W, h, BF.box, paras, 'CENTER') + '</hp:tr>';
    return pXML('body', null, false, inTable(tblXML(1, 1, COL_W, h, BF.box, tr)));
  }
  function essayXML(b) {
    var paras = ''; for (var i = 0; i < b.n; i++) paras += pXML('body', [{ t: '' }]);
    var h = b.n * LINE_H + 282;
    return pXML('body', null, false, inTable(tblXML(1, 1, COL_W, h, BF.box, '<hp:tr>' + cellXML(0, 0, COL_W, h, BF.box, paras, 'TOP') + '</hp:tr>')));
  }
  function matchXML(b) {
    var W = [9200, 1300, 3000, 1300, COL_W - 9200 - 1300 - 3000 - 1300], KO = ['㉠', '㉡', '㉢', '㉣', '㉤', '㉥'];
    var n = Math.max(b.left.length, b.right.length), trs = '', rowH = 2200;
    for (var i = 0; i < n; i++) {
      var cells = [textRuns(b.left[i] || '', { noBold: true }), [{ t: b.left[i] != null ? '•' : '' }], [{ t: '' }], [{ t: b.right[i] != null ? '•' : '' }], textRuns(b.right[i] != null ? KO[i] + ' ' + b.right[i] : '', { noBold: true })];
      trs += '<hp:tr>' + cells.map(function (rs, c) { return cellXML(c, i, W[c], rowH, BF.none, pXML(c === 1 || c === 3 ? 'center' : 'body', rs), 'CENTER', [141, 141, 141, 141]); }).join('') + '</hp:tr>';
    }
    return pXML('body', null, false, inTable(tblXML(n, 5, COL_W, n * rowH, BF.none, trs)));
  }
  /* 그림 — python-hwpx(한컴 대조 검증본)가 쓰는 순서·속성 그대로 */
  function picXML(b, binId) {
    var w = b.w, h = b.h, id = nid();
    return pXML('center', null, false, '<hp:run charPrIDRef="' + CP.body + '"><hp:pic textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" reverse="0" id="' + id + '" zOrder="0" numberingType="PICTURE" lock="0" dropcapstyle="None" href="" groupLevel="0" instid="' + id + '">' +
      '<hp:offset x="0" y="0"/><hp:orgSz width="' + w + '" height="' + h + '"/><hp:curSz width="' + w + '" height="' + h + '"/><hp:flip horizontal="0" vertical="0"/>' +
      '<hp:rotationInfo angle="0" centerX="' + Math.round(w / 2) + '" centerY="' + Math.round(h / 2) + '" rotateimage="1"/>' +
      '<hp:renderingInfo><hc:transMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:scaMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/><hc:rotMatrix e1="1" e2="0" e3="0" e4="0" e5="1" e6="0"/></hp:renderingInfo>' +
      '<hp:imgRect><hc:pt0 x="0" y="0"/><hc:pt1 x="' + w + '" y="0"/><hc:pt2 x="' + w + '" y="' + h + '"/><hc:pt3 x="0" y="' + h + '"/></hp:imgRect>' +
      '<hp:imgClip left="0" right="' + w + '" top="0" bottom="' + h + '"/><hp:inMargin left="0" right="0" top="0" bottom="0"/><hp:imgDim dimwidth="' + w + '" dimheight="' + h + '"/>' +
      '<hc:img binaryItemIDRef="' + binId + '" bright="0" contrast="0" effect="REAL_PIC" alpha="0"/><hp:effects/>' +
      '<hp:sz width="' + w + '" height="' + h + '" widthRelTo="ABSOLUTE" heightRelTo="ABSOLUTE" protect="0"/>' +
      '<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>' +
      '<hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:shapeComment/></hp:pic><hp:t/></hp:run>');
  }
  /* bins = [{id, data(Uint8Array|base64)}] — 그림이 쌓인다 */
  function blocksXML(bs, bins) {
    return bs.map(function (b) {
      if (b.p) return pXML(b.para, b.runs);
      if (b.box) return boxXML(b);
      if (b.essay) return essayXML(b);
      if (b.match) return matchXML(b);
      if (b.img) { var id = 'BIN' + ('000' + (bins.length + 1)).slice(-4); bins.push({ id: id, src: b.src }); return picXML(b, id); }
      return '';
    }).join('');
  }
  function blankXML(n) { var s = ''; for (var i = 0; i < n; i++) s += pXML('body', [{ t: '' }]); return s; }

  /* ---------- 문항지 ---------- */
  /* layout = [{items:[{it, no, gapBefore}], closing?}] 단(列) 목록 — 왼쪽·오른쪽 번갈아, 쪽마다 두 단 */
  function buildExamSection(tpl, meta, layout, bins) {
    var cols = layout.map(function (col) {
      var x = '';
      col.items.forEach(function (c, k) {
        if (k > 0) x += blankXML(c.gap || 1);
        x += blocksXML(blocks(c.it, c.no), bins);
      });
      if (col.closing) x += blocksXML(closingBlocks(meta.grade), bins);
      return x || blankXML(1);
    });
    if (cols.length % 2) cols.push(blankXML(1));
    var sec = tpl.section.replace('{{ROUND}}', esc(meta.round)).replace('{{SUBJ}}', esc(meta.subject)).replace('{{GRADE}}', esc(meta.grade))
      .replace('{{COL_L}}', cols[0]).replace('{{COL_R}}', cols[1]);
    var more = '';
    for (var i = 2; i < cols.length; i += 2) more += tpl.next.replace('{{COL_L}}', cols[i]).replace('{{COL_R}}', cols[i + 1]).replace(/ id="(\d{6,})"/, function () { return ' id="' + nid() + '"'; });
    return sec.replace(/(<\/hp:p>)(<\/hs:sec>)$/, '$1' + more + '$2').replace(/(<\/hp:p>)\s*(<\/hs:sec>)\s*$/, function (m0) { return m0; });
  }

  /* ---------- 출제근거목록표 ---------- */
  function keyAnswerRuns(it) { return textRuns(it.answer, { noBold: true }); }
  function buildKeySection(tpl, meta, items, pagesOf) {
    var rows = items.map(function (it, i) {
      var t = i === 0 ? tpl.rowFirst : (i === items.length - 1 ? tpl.rowLast : tpl.rowMid);
      var unitNo = String(it.unit || '').replace(/\D/g, '');
      var vals = { NO: String(i + 1), UNIT: (unitNo ? unitNo + '단원' : ''), PAGE: pagesOf(it) || '', TYPE: it.type || '', DIFF: it.diff || '', PRE: 'X', ROW: String(i + 2) };
      var x = t.replace(/\{\{ROW\}\}/g, vals.ROW);
      ['NO', 'UNIT', 'PAGE', 'TYPE', 'DIFF', 'PRE'].forEach(function (k) { x = x.replace('{{' + k + '}}', esc(vals[k])); });
      /* 정답 칸 — 분수는 수식으로 */
      var ans = K.splitMath(it.answer || '');
      if (ans.some(function (s) { return s.eq; })) {
        x = x.replace(/<hp:run charPrIDRef="(\d+)"><hp:t>\{\{ANS\}\}<\/hp:t><\/hp:run>/, function (_, cp) {
          return ans.map(function (s) { return s.eq ? '<hp:run charPrIDRef="' + cp + '">' + eqXML(s, +cp) + '<hp:t/></hp:run>' : '<hp:run charPrIDRef="' + cp + '"><hp:t>' + esc(s.t) + '</hp:t></hp:run>'; }).join('');
        });
      }
      return x.replace('{{ANS}}', esc(K.plain(it.answer || '')));
    }).join('');
    var essays = items.map(function (it, i) { return it.essay ? { no: i + 1, it: it } : null; }).filter(Boolean).map(function (e) {
      var para = function (txt) { return tpl.cellPara.replace('{{RUNS}}', '<hp:t>' + esc(txt) + '</hp:t>'); };
      var crit = e.it.essay.criteria.length ? e.it.essay.criteria.map(function (c) { return '- ' + c; }) : ['- 핵심 내용을 바르게 쓰면 정답'];
      return tpl.essay.replace('{{ENO}}', e.no + '번').replace('{{EANS}}', para(e.it.essay.answer)).replace('{{ECRIT}}', crit.map(para).join(''))
        .replace(/ id="(\d{6,})"/g, function () { return ' id="' + nid() + '"'; });
    }).join('');
    return tpl.section.replace('{{ROUND}}', esc(meta.round)).replace('{{GRADE}}', esc(meta.grade)).replace('{{SUBJ}}', esc(meta.subject))
      .replace('{{AUTHOR}}', esc(meta.author)).replace('{{ROWCNT}}', String(items.length + 2)).replace('{{ROWS}}', rows).replace('{{ESSAYS}}', essays);
  }

  /* ---------- 묶기(JSZip) ---------- */
  function b64ToBytes(b64) { var bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary'); var u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  /* tplZip = JSZip 인스턴스(양식) · section = 새 section0 · bins · prv = 미리보기 글 */
  function pack(JSZip, tplZip, section, bins, prv) {
    var out = new JSZip(), names = Object.keys(tplZip.files).filter(function (n) { return !/^tpl_/.test(n) && !tplZip.files[n].dir; });
    return Promise.all(names.map(function (n) { return tplZip.file(n).async(n === 'Preview/PrvImage.png' ? 'uint8array' : 'string').then(function (d) { return [n, d]; }); })).then(function (pairs) {
      var map = {}; pairs.forEach(function (p) { map[p[0]] = p[1]; });
      out.file('mimetype', 'application/hwp+zip', { compression: 'STORE', createFolders: false });
      map['Contents/section0.xml'] = section;
      if (/paraPrIDRef="5[5-7]"/.test(section)) map['Contents/header.xml'] = addParaPrs(String(map['Contents/header.xml']));
      map['Preview/PrvText.txt'] = (prv || '').slice(0, 1000);
      map['settings.xml'] = String(map['settings.xml']).replace(/<ha:CaretPosition [^>]*\/>/, '<ha:CaretPosition listIDRef="0" paraIDRef="0" pos="0"/>');
      if (bins.length) {
        var items = bins.map(function (b) { return '<opf:item id="' + b.id + '" href="BinData/' + b.id + '.png" media-type="image/png" isEmbeded="1"/>'; }).join('');
        map['Contents/content.hpf'] = String(map['Contents/content.hpf']).replace('</opf:manifest>', items + '</opf:manifest>');
        var list = '<hh:binDataList itemCnt="' + bins.length + '">' + bins.map(function (b, i) { return '<hh:binItem id="' + i + '" Type="Embedding" BinData="' + b.id + '.png" Format="png"/>'; }).join('') + '</hh:binDataList>';
        map['Contents/header.xml'] = String(map['Contents/header.xml']).replace('</hh:styles>', '</hh:styles>' + list);
      }
      Object.keys(map).forEach(function (n) { if (n !== 'mimetype') out.file(n, map[n], { compression: n === 'Preview/PrvImage.png' ? 'STORE' : 'DEFLATE', createFolders: false }); });
      bins.forEach(function (b) { out.file('BinData/' + b.id + '.png', typeof b.src === 'string' ? b64ToBytes(b.src.replace(/^data:image\/png;base64,/, '')) : b.src, { compression: 'STORE', createFolders: false }); });
      return out;
    });
  }
  /* 양식 zip 에서 조각 꺼내기 */
  function readTpl(zip, kind) {
    var get = function (n) { return zip.file(n).async('string'); };
    if (kind === 'q') return Promise.all([get('Contents/section0.xml'), get('tpl_next_page.xml')]).then(function (a) { return { section: a[0], next: a[1] }; });
    return Promise.all(['Contents/section0.xml', 'tpl_row_first.xml', 'tpl_row_mid.xml', 'tpl_row_last.xml', 'tpl_essay.xml', 'tpl_cell_para.xml'].map(get))
      .then(function (a) { return { section: a[0], rowFirst: a[1], rowMid: a[2], rowLast: a[3], essay: a[4], cellPara: a[5] }; });
  }

  return { CP: CP, PP: PP, HANG: HANG, addParaPrs: addParaPrs, COL_W: COL_W, CAP: CAP, LINE_H: LINE_H, CLOSING: CLOSING,
    blocks: blocks, closingBlocks: closingBlocks, textRuns: textRuns, widthOf: widthOf,
    blocksXML: blocksXML, buildExamSection: buildExamSection, buildKeySection: buildKeySection, pack: pack, readTpl: readTpl, esc: esc };
});
