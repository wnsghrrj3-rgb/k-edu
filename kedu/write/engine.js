/* ============================================================
   케이글쓰기 대조 엔진 (설계 v1 §4~§6) — 2026-09-08
   목적: 규칙(틀·신호어·문구)만으로 글의 「틀」을 본다. 내용 판단 0, 점수 0.
   순수 함수 — DOM·네트워크 없음. 브라우저(window.KWRITE)와 node(module.exports) 공용.
   사용:
     KWRITE.init({templates, signals, feedback})      // data/*.json 세 장 주입
     KWRITE.split(text)                               // → [{i, text, para}]
     KWRITE.analyze({text, type, band, topic, keywords, marks})
        marks: { "<문장 i>": "C" | "R" | ... }        // 학생이 칠한 색 (설계 §6 — 시스템 추정보다 학생 표시를 먼저 믿는다)
        → { sentences, elements, topic, length, paras, format, cards, allGreen }
   규칙 요약:
     · 요소 판정: 학생 표시 ∪ 강한 신호(w≥2) 를 셈 → need 이상이면 green
       need 미만이지만 약한 신호나 표시가 있으면 yellow, 아무것도 없으면 red
     · W(마무리)는 마지막 문단에 있어야 센다 (앞쪽 「그래서」는 이유 연결어일 뿐)
     · G(인사)는 첫·끝 문장 근처에서만 센다
     · 카드는 최대 3장: 요소 red → 논제 red → 요소 yellow → 논제 yellow → 형식 → 분량
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KWRITE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var T = null, S = null, F = null, RX = null;

  function init(d) {
    T = d.templates; S = d.signals; F = d.feedback;
    RX = {};
    Object.keys(S.elements).forEach(function (code) {
      RX[code] = S.elements[code].map(function (p) { return { re: new RegExp(p.re, 'u'), w: p.w }; });
    });
    RX._spelling = S.format.spelling.pairs.map(function (p) { return { re: new RegExp(p.re, 'u'), fix: p.fix, src: p.re }; });
    RX._da = new RegExp(S.format.endings.da, 'u');
    RX._yo = new RegExp(S.format.endings.yo, 'u');
    return true;
  }

  /* ---------- 1) 문장 나누기 — 마침표·물음표·느낌표·줄바꿈. 문단 = 빈 줄 또는 줄바꿈 ---------- */
  function split(text) {
    var out = [], i = 0;
    var paras = String(text || '').replace(/\r/g, '').split(/\n\s*\n|\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    paras.forEach(function (p, pi) {
      var parts = p.split(/(?<=[.!?。…])\s+|(?<=[.!?。…])(?=[가-힣A-Za-z"'‘“(])/u);
      parts.forEach(function (s) {
        s = s.trim();
        if (!s) return;
        out.push({ i: i++, text: s, para: pi });
      });
    });
    return out;
  }

  /* ---------- 2) 한 문장 신호어 대조 → {C:2, R:1, ...} (코드별 최대 가중치) ---------- */
  function detect(sentence) {
    var got = {};
    Object.keys(RX).forEach(function (code) {
      if (code[0] === '_') return;
      var best = 0;
      RX[code].forEach(function (p) { if (p.w > best && p.re.test(sentence)) best = p.w; });
      if (best) got[code] = best;
    });
    return got;
  }

  function fill(str, map) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ''; });
  }
  function bandOf(grade) {
    var g = parseInt(grade, 10);
    if (!g) return grade || 'mid';
    return g <= 2 ? 'low' : g <= 4 ? 'mid' : 'high';
  }
  function words(text) {
    // 조사 뗀 낱말 근사 — 2글자 이상 한글 덩어리에서 흔한 조사 꼬리를 뗀다
    return (text.match(/[가-힣]{2,}/g) || []).map(function (w) {
      return w.replace(/(에서는|에게는|으로는|에서|에게|으로|이랑|까지|부터|처럼|보다|에는|은|는|이|가|을|를|의|에|도|로|와|과|만)$/u, '');
    }).filter(function (w) { return w.length >= 2; });
  }

  /* ---------- 3) 전체 분석 ---------- */
  function analyze(opt) {
    if (!T) throw new Error('KWRITE.init 먼저');
    var type = T.types[opt.type] ? opt.type : 'argue';
    var band = bandOf(opt.band);
    var tpl = T.types[type], spec = tpl.bands[band];
    var text = String(opt.text || '');
    var marks = opt.marks || {};
    var sents = split(text);
    var lastPara = sents.length ? sents[sents.length - 1].para : 0;
    var paraCount = lastPara + 1;

    /* 3-1 문장별 감지 + 표시 대조 */
    sents.forEach(function (s) {
      s.detected = detect(s.text);
      // 위치 규칙
      if (s.detected.W && s.para !== lastPara) delete s.detected.W;
      if (s.detected.G && !(s.i <= 1 || s.i >= sents.length - 2)) delete s.detected.G;
      s.mark = marks[s.i] || marks[String(s.i)] || null;
      s.agree = null; // 'match' | 'markedNoSignal' | 'signalNotMarked'
      var strong = Object.keys(s.detected).filter(function (c) { return s.detected[c] >= 2; });
      if (s.mark) {
        s.agree = (s.detected[s.mark] >= 1) ? 'match' : 'markedNoSignal';
      } else if (strong.length) {
        s.agree = 'signalNotMarked';
        s.suggest = strong[0];
      }
    });

    /* 3-2 요소 판정 */
    var elements = {};
    Object.keys(spec.need).forEach(function (code) {
      var need = spec.need[code], strongN = 0, weakN = 0, hits = [];
      sents.forEach(function (s) {
        var byMark = s.mark === code;
        var byStrong = s.detected[code] >= 2;
        var byWeak = s.detected[code] === 1;
        if (byMark || byStrong) { strongN++; hits.push(s.i); }
        else if (byWeak) weakN++;
      });
      var status = strongN >= need ? 'green' : (strongN > 0 || weakN > 0) ? 'yellow' : 'red';
      var fb = (F.elements[type] && F.elements[type][code]) || F.elements.argue[code] || { green: '', yellow: '', red: '' };
      // yellow 문구 중 「하나 더」류는 need≥2 일 때만 뜻이 맞다 — need 1 이면 red/yellow 를 구분해 red 쪽 문구를 쓴다
      var msg = fb[status];
      if (status === 'yellow' && strongN === 0) msg = fb.red;
      elements[code] = { status: status, need: need, have: strongN, weak: weakN, hits: hits, msg: msg, name: (T.colors[code] || {}).name || code };
    });

    /* 3-3 논제 대조 */
    var topic = null;
    var kws = (opt.keywords || []).map(function (k) { return String(k).trim(); }).filter(Boolean);
    if (!kws.length && opt.topic) {
      kws = words(opt.topic).filter(function (w, i, a) { return a.indexOf(w) === i; }).slice(0, 3);
    }
    if (kws.length) {
      var body = text.replace(/\s+/g, '');
      var counts = kws.map(function (k) { return (body.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; });
      var maxN = Math.max.apply(null, counts);
      var st = maxN >= 2 ? 'green' : maxN === 1 ? 'yellow' : 'red';
      var missing = kws[counts.indexOf(Math.min.apply(null, counts))];
      topic = { status: st, keywords: kws, counts: counts, msg: fill(F.common.topic[st], { kw: st === 'green' ? kws[0] : missing }) };
    }

    /* 3-4 분량·문단 */
    var chars = text.replace(/\s+/g, '').length;
    var lenSt = chars < spec.length[0] ? 'short' : chars > spec.length[1] ? 'long' : 'green';
    var length = { chars: chars, range: spec.length, status: lenSt, msg: F.common.length[lenSt] };
    var paras = { count: paraCount, range: spec.paras, msg: null };
    if (band !== 'low' && paraCount < spec.paras[0] && chars >= spec.length[0]) paras.msg = F.common.para;
    else if (paraCount > spec.paras[1] + 2) paras.msg = F.common.paraMany;

    /* 3-5 형식 — 다듬기 카드 (감점 아님) */
    var format = [];
    var sp = S.format.spoken;
    if (sp.skipBands.indexOf(band) < 0) {
      Object.keys(sp.words).some(function (w) {
        if (text.indexOf(w) >= 0) { format.push({ kind: 'spoken', word: w, msg: fill(F.common.spoken, { word: w, fix: sp.words[w] }) }); return format.length >= 2; }
        return false;
      });
    }
    RX._spelling.some(function (p) {
      var m = text.match(p.re);
      if (m) { format.push({ kind: 'spelling', word: m[0], msg: fill(F.common.spelling, { word: m[0], fix: p.fix }) }); return true; }
      return false;
    });
    var lim = S.format.sentenceLength[band];
    sents.some(function (s) {
      if (s.text.replace(/\s+/g, '').length > lim) { format.push({ kind: 'sentence', i: s.i, msg: fill(F.common.sentence, { n: s.i + 1 }) }); return true; }
      return false;
    });
    var run = 1;
    for (var k = 1; k < sents.length; k++) {
      var a = (sents[k - 1].text.match(/^[가-힣]+/) || [''])[0], b = (sents[k].text.match(/^[가-힣]+/) || [''])[0];
      run = (a && a === b) ? run + 1 : 1;
      if (run >= S.format.sameStart) { format.push({ kind: 'sameStart', word: b, msg: fill(F.common.sameStart, { word: b }) }); break; }
    }
    var rw = S.format.repeatWord, freq = {};
    words(text).forEach(function (w) { if (w.length >= rw.minLen) freq[w] = (freq[w] || 0) + 1; });
    var threshold = Math.max(rw.minCount, Math.round(chars / rw.perChars) * rw.minCount);
    var top = Object.keys(freq).filter(function (w) { return kws.indexOf(w) < 0 && freq[w] >= threshold; }).sort(function (x, y) { return freq[y] - freq[x]; })[0];
    if (top) format.push({ kind: 'repeat', word: top, msg: fill(F.common.repeat, { word: top, n: freq[top] }) });
    if (S.format.endings.skipTypes.indexOf(type) < 0) {
      var da = 0, yo = 0;
      sents.forEach(function (s) { if (RX._da.test(s.text)) da++; else if (RX._yo.test(s.text)) yo++; });
      if (da && yo) format.push({ kind: 'endings', msg: F.common.endings });
    }

    /* 3-6 카드 — 최대 3장, 우선순위 */
    var cards = [];
    var order = tpl.order.concat(Object.keys(spec.need).filter(function (c) { return tpl.order.indexOf(c) < 0; }));
    order.forEach(function (c) { if (elements[c] && elements[c].status === 'red') cards.push({ kind: 'element', code: c, status: 'red', msg: elements[c].msg }); });
    if (topic && topic.status === 'red') cards.push({ kind: 'topic', status: 'red', msg: topic.msg });
    order.forEach(function (c) { if (elements[c] && elements[c].status === 'yellow') cards.push({ kind: 'element', code: c, status: 'yellow', msg: elements[c].msg }); });
    if (topic && topic.status === 'yellow') cards.push({ kind: 'topic', status: 'yellow', msg: topic.msg });
    if (paras.msg) cards.push({ kind: 'para', status: 'yellow', msg: paras.msg });
    format.forEach(function (f) { cards.push({ kind: f.kind, status: 'tidy', msg: f.msg, i: f.i }); });
    if (lenSt !== 'green') cards.push({ kind: 'length', status: 'tidy', msg: length.msg });
    cards = cards.slice(0, 3);

    var allGreen = Object.keys(elements).every(function (c) { return elements[c].status === 'green'; }) && (!topic || topic.status !== 'red');
    return {
      type: type, band: band, spec: spec, sentences: sents, elements: elements, topic: topic,
      length: length, paras: paras, format: format, cards: cards, allGreen: allGreen,
      notice: F.state.notice, done: allGreen && !cards.length ? F.state.allGreen : null
    };
  }

  return { init: init, split: split, detect: detect, analyze: analyze, bandOf: bandOf, fill: fill };
});
