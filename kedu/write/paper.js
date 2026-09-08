/* ============================================================
   케이글쓰기 종이 렌더러 (paper.js) — 설계 v2 §11. 학생 연습(index)·학생 과제(task)·교사 첨삭(teach) 이 같은 종이를 쓴다.
   순수 함수 + 얇은 배선. 엔진 결과(KWRITE.analyze) 위에 자동 표시(빨강)·선생님 표시(파랑)·메모(✎)를 겹쳐 그린다.
   사용:
     KWPAPER.css                                   // <style> 에 넣을 CSS 문자열
     KWPAPER.placeMemos(result, templates, feedback) // 카드·문장 물음을 종이 자리(before/after/sent)로 → {before:{p:[]}, after:{p:[]}, sent:{i:[]}, n}
     KWPAPER.key(mark)                             // 자동 표시 열쇠 'i:from:to:kind'
     KWPAPER.render(opt) → html                    // opt = {result, templates, corrections, feedback, memos, teacher:[], removed:[], pop, selectable}
     KWPAPER.applyTeacherMark / 학생 화면은 mark 를 누르면 popup 만 — 배선은 각 화면이 한다
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KWPAPER = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function key(m) { return m.i + ':' + m.from + ':' + m.to + ':' + m.kind; }

  var css = [
    '.kwp{background:#FFFDF9;border:1px solid #E6DFD3;border-radius:14px;padding:16px 14px 16px 12px;line-height:2.05;font-family:"Gowun Batang",serif;font-size:1.02em;background-image:repeating-linear-gradient(transparent 0 calc(2.05em - 1px),#efe9dd calc(2.05em - 1px) 2.05em);background-origin:content-box}',
    '.kwp .para{position:relative;padding-left:52px;margin-bottom:.6em}',
    '.kwp .role{position:absolute;left:0;top:.35em;font-family:"Gowun Dodum",sans-serif;font-size:.68em;color:#fff;background:#8B8378;border-radius:6px;padding:1px 7px;line-height:1.6}',
    '.kwp .role.first{background:#5B8EF8}.kwp .role.last{background:#8a5fc6}.kwp .role.middle{background:#a08a3a}',
    '.kwp .sx{cursor:pointer;border-radius:4px}.kwp .sx.on{background:#EEF4FF;outline:2px solid #5B8EF8;outline-offset:2px}',
    '.kwp .stamp{display:inline-block;font-family:"Gowun Dodum",sans-serif;font-size:.62em;color:#fff;border-radius:999px;padding:0 7px;margin-left:4px;vertical-align:.25em;line-height:1.6;opacity:.9}',
    '.kwp .tm{position:relative;border-radius:2px;cursor:pointer;padding:0 1px;--tc:#c0392b}',
    '.kwp .tm.hard{background:rgba(192,57,43,.09);border-bottom:2px solid var(--tc);text-decoration:underline wavy var(--tc);text-decoration-skip-ink:none;text-underline-offset:3px}',
    '.kwp .tm.soft{border-bottom:2px dotted var(--tc)}',
    '.kwp .tm.blue{--tc:#1f5fbf;background:rgba(31,95,191,.08);border-bottom:2px solid var(--tc)}',
    '.kwp .tm .fx{position:absolute;left:0;top:-1.05em;font-family:"Gowun Dodum",sans-serif;font-size:.66em;color:var(--tc);white-space:nowrap;line-height:1;font-weight:700;pointer-events:none}',
    '.kwp .tm.append{display:inline-block;min-width:.6em;color:var(--tc);font-weight:700;background:rgba(192,57,43,.09);border-radius:50%;text-align:center;line-height:1.2}',
    '.kwp .tm.on{outline:2px solid var(--tc);outline-offset:1px}',
    '.kwp .tm.gone{opacity:.35;text-decoration:line-through;border-bottom:0;background:none}.kwp .tm.gone .fx{display:none}',
    '.kwp .memo{margin:4px 0 8px 52px;font-family:"Gowun Dodum",sans-serif;font-size:.86em;color:#c0392b;line-height:1.55;display:flex;gap:6px;align-items:flex-start}',
    '.kwp .memo::before{content:"✎";flex:0 0 auto;font-size:1.05em}.kwp .memo.top{margin-top:0}',
    '.kwp .memo .m{background:#fff;border:1.5px dashed #c0392b;border-radius:10px;padding:6px 10px;flex:1}',
    '.kwp .memo.yellow{color:#a08a3a}.kwp .memo.yellow .m{border-color:#a08a3a}',
    '.kwp .memo.tidy{color:#8B8378}.kwp .memo.tidy .m{border-color:#8B8378;border-style:dotted}',
    '.kwp .memo.ask{color:#a08a3a}.kwp .memo.ask .m{border-color:#a08a3a}',
    '.kwp .memo.blue{color:#1f5fbf}.kwp .memo.blue .m{border-color:#1f5fbf;border-style:solid;background:#F3F7FF}.kwp .memo.blue::before{content:"✒"}',
    '.kwp .memo.gone .m{opacity:.35;text-decoration:line-through}',
    '.kwp .pop{margin:8px 0 10px 52px;background:#fff;border:1.5px solid var(--tc,#c0392b);border-radius:12px;padding:10px 12px;font-family:"Gowun Dodum",sans-serif;line-height:1.6;font-size:.9em}',
    '.kwp .pop b{color:var(--tc,#c0392b)}.kwp .pop .row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 0}',
    '.kwp .pop .pick{border:1.5px solid #E6DFD3;background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-size:.9em;cursor:pointer;color:#5B534A}',
    '.kwp .pop .pick.apply{border-color:var(--tc);color:var(--tc);font-weight:700}',
    '.kwp .pop input,.kwp .pop textarea{width:100%;font:inherit;font-size:.95em;padding:8px 10px;border:1px solid #E6DFD3;border-radius:10px;margin-top:6px;line-height:1.6}',
    '.kwp-legend{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:.78em;color:#5B534A;margin:10px 0 0}',
    '.kwp-legend i{display:inline-block;width:14px;height:0;border-bottom:3px solid var(--tc);margin-right:4px;vertical-align:middle}.kwp-legend i.s{border-bottom-style:dotted}'
  ].join('\n');

  /* 카드(다음에 넣어 볼 것)·문장 물음 → 종이 자리 */
  function placeMemos(r, T, F) {
    var lastP = r.structure.roles.length - 1, before = {}, after = {}, sent = {};
    function put(where, idx, card) { (where[idx] = where[idx] || []).push(card); }
    var order = T.types[r.type].order, firstOrder = order[0];
    var colors = T.colors;
    r.cards.forEach(function (k) {
      var code = k.code;
      if (k.kind === 'element') {
        if (code === firstOrder || code === 'F' || (code === 'G' && !r.sentences.some(function (x) { return x.i <= 1 && x.detected.G; }))) put(before, 0, k);
        else if (code === 'W') put(after, lastP, k);
        else { var c = r.elements[firstOrder] && r.elements[firstOrder].hits[0]; put(after, c != null ? r.sentences[c].para : 0, k); }
      }
      else if (k.kind === 'topic' || k.code === 'orderFirst' || k.code === 'topicSpread') put(before, 0, k);
      else if (k.code === 'wEarly') put(after, 0, k);
      else if (k.code === 'connective') put(before, Math.min(1, lastP), k);
      else if (k.code === 'rNoE' || k.code === 'dupR') { var rh = r.elements.R && r.elements.R.hits[0]; put(after, rh != null ? r.sentences[rh].para : lastP, k); }
      else if (k.kind === 'sentence' && k.i != null) put(sent, k.i, k);
      else put(after, lastP, k);
    });
    r.sentences.filter(function (x) { return x.agree === 'markedNoSignal' || x.agree === 'signalNotMarked'; }).slice(0, 2).forEach(function (x) {
      if (sent[x.i]) return;
      var code = x.agree === 'markedNoSignal' ? x.mark : x.suggest;
      var fill = function (str, map) { return String(str).replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ''; }); };
      put(sent, x.i, { kind: 'ask', status: 'ask', msg: fill(F.state[x.agree], { name: colors[code].name, hint: F.state.hints[code] }) });
    });
    var n = 0; [before, after, sent].forEach(function (m) { Object.keys(m).forEach(function (k) { n += m[k].length; }); });
    return { before: before, after: after, sent: sent, n: n };
  }

  /* 한 문장 안 표시들을 겹치지 않게 순서대로 — 선생님(파랑) 우선 */
  function spansFor(s, autoMarks, teacherMarks, removed, hideRemoved) {
    var out = [];
    (teacherMarks || []).forEach(function (m, idx) { if (m.i === s.i && m.from != null) out.push({ m: m, idx: idx, blue: true, from: m.from, to: m.to }); });
    (autoMarks || []).forEach(function (m, idx) {
      if (m.i !== s.i) return;
      var from = m.from, to = m.to;
      if (out.some(function (o) { return !(to <= o.from || from >= o.to) && !(m.append); })) return;
      var gone = !!(removed && removed.indexOf(key(m)) >= 0);
      if (gone && hideRemoved) return;
      out.push({ m: m, idx: idx, blue: false, from: from, to: to, gone: gone });
    });
    out.sort(function (a, b) { return a.from - b.from || (a.blue ? -1 : 1); });
    return out;
  }

  function render(opt) {
    var r = opt.result, T = opt.templates, KD = opt.corrections.kinds, F = opt.feedback, colors = T.colors;
    var memos = opt.memos || { before: {}, after: {}, sent: {} };
    var autoMarks = (r.teacher && r.teacher.marks) || opt.autoMarks || [];
    var teacherMarks = opt.teacher || [], removed = opt.removed || [];
    var pop = opt.pop || null; // {type:'auto'|'blue'|'sent', idx, i}
    var byPara = {}; r.sentences.forEach(function (s) { (byPara[s.para] = byPara[s.para] || []).push(s); });
    function memo(list, top, gone) { return (list || []).map(function (k) { return '<div class="memo ' + esc(k.status || 'yellow') + (top ? ' top' : '') + (k.blue ? ' blue' : '') + '"' + (k.tidx != null ? ' data-tmemo="' + k.tidx + '"' : '') + '><span class="m">' + esc(k.msg) + '</span></div>'; }).join(''); }
    function popHtml(s) {
      if (!pop || pop.i !== s.i || !opt.popHtml) return '';
      return opt.popHtml(pop, s);
    }
    var h = '<div class="kwp">' + r.structure.roles.map(function (role) {
      var ps = byPara[role.para] || [];
      return memo(memos.before[role.para], true) + '<div class="para"><span class="role ' + role.role + '">' + esc(role.name) + '</span>' + ps.map(function (s) {
        var spans = spansFor(s, autoMarks, teacherMarks, removed, opt.hideRemoved), out = '', posn = 0;
        spans.forEach(function (sp) {
          var m = sp.m, col = sp.blue ? '#1f5fbf' : (KD[m.kind] ? KD[m.kind].hex : '#c0392b');
          var on = pop && ((sp.blue && pop.type === 'blue' && pop.idx === sp.idx) || (!sp.blue && pop.type === 'auto' && pop.idx === sp.idx));
          out += esc(s.text.slice(posn, Math.max(posn, sp.from)));
          if (m.append) out += '<span class="tm append' + (on ? ' on' : '') + (sp.gone ? ' gone' : '') + '" data-a="' + sp.idx + '" style="--tc:' + col + '">' + esc(m.fix) + '</span>';
          else out += '<span class="tm ' + (sp.blue ? 'blue' : (m.soft ? 'soft' : 'hard')) + (on ? ' on' : '') + (sp.gone ? ' gone' : '') + '" ' + (sp.blue ? 'data-b="' + sp.idx + '"' : 'data-a="' + sp.idx + '"') + ' style="--tc:' + col + '">' + esc(s.text.slice(sp.from, sp.to)) + ((sp.blue || !m.soft) && m.fix ? '<span class="fx">' + esc(m.fix) + '</span>' : '') + '</span>';
          posn = Math.max(posn, sp.to);
        });
        out += esc(s.text.slice(posn));
        var st = s.role && colors[s.role] ? '<span class="stamp" style="background:' + colors[s.role].hex + '">' + esc(colors[s.role].name) + '</span>' : '';
        var sentMemos = (memos.sent[s.i] || []).slice();
        teacherMarks.forEach(function (m, idx) { if (m.i === s.i && m.from == null) sentMemos.push({ status: 'blue', blue: true, msg: m.memo, tidx: idx }); });
        var selOn = pop && pop.type === 'sent' && pop.i === s.i;
        return '<span class="sx' + (selOn ? ' on' : '') + '" data-i="' + s.i + '">' + out + '</span>' + st + ' ' + (sentMemos.length ? memo(sentMemos) : '') + popHtml(s);
      }).join('') + '</div>' + memo(memos.after[role.para]);
    }).join('') + '</div>';
    return h;
  }

  function legend(teacherResult, corrections, extra) {
    var KD = corrections.kinds, by = teacherResult.byKind || {};
    var h = Object.keys(KD).filter(function (k) { return by[k]; }).map(function (k) { return '<span style="--tc:' + KD[k].hex + '"><i></i>' + esc(KD[k].name) + ' ' + by[k] + '</span>'; }).join('');
    if (extra) h += '<span style="--tc:#1f5fbf"><i></i>' + esc(extra) + '</span>';
    return '<div class="kwp-legend">' + h + '</div>';
  }

  return { css: css, key: key, esc: esc, placeMemos: placeMemos, render: render, legend: legend };
});
