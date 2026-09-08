/* ============================================================
   케이글쓰기 대조 엔진 v2 (설계 v1 §4~§6 + v2 §10) — 2026-09-08
   목적: 규칙(틀·신호어·문구·표시 사전)만으로 글의 「틀」과 「글자」를 본다. 내용 판단 0, 점수 0.
   순수 함수 — DOM·네트워크 없음. 브라우저(window.KWRITE)와 node(module.exports) 공용.
   사용:
     KWRITE.init({templates, signals, feedback, corrections})   // data/*.json 네 장 주입(corrections 없으면 표시 기능만 꺼짐)
     KWRITE.split(text)                                          // → [{i, text, para}]
     KWRITE.analyze({text, type, band, topic, keywords, marks})
        marks: { "<문장 i>": "C" | "R" | ... }   // 학생이 칠한 색 (§6 — 시스템 추정보다 학생 표시를 먼저 믿는다)
        → { sentences, elements, structure, topic, length, paras, format, cards, teacher, allGreen }
     KWRITE.correct({text, band, type, keywords})               // 「선생님 표시」만 따로 — 문장별 표시 [{i, from, to, kind, original, fix, why}]
     KWRITE.applyMark(text, sentenceText, mark)                 // 표시 하나를 글에 반영한 새 글
   v2 규칙 요약:
     · 감지 전 따옴표 속 남의 말은 뺀다(“…”, 「…」, '…')
     · 문단 역할: 첫 문단=처음, 마지막=끝, 나머지=가운데. 유형별 순서 어긋남(생각이 끝에만·마무리가 처음에)을 짚는다
     · 이유↔예시 짝(고), 거의 같은 이유 두 번, 논제 낱말이 한 문단에만 몰림, 가운데 문단 첫 문장의 이어 주는 말(고)
     · 선생님 표시: 맞춤법·띄어쓰기·토씨(받침 계산)·말하는 투·문장 부호·끝맺음·긴 문장·같은 말 — 밴드별로 짚는 종류가 다르다
     · 카드 ≤3: 요소 red → 논제 red → 순서 → 요소 yellow → 논제 yellow → 짝·중복·몰림 → 문단 → 형식 → 분량
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KWRITE = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var T = null, S = null, F = null, C = null, RX = null, CX = null;

  function rx(p) { return new RegExp(p, 'u'); }
  function rxg(p) { return new RegExp(p, 'gu'); }

  function init(d) {
    T = d.templates; S = d.signals; F = d.feedback; C = d.corrections || null;
    RX = {};
    Object.keys(S.elements).forEach(function (code) {
      RX[code] = S.elements[code].map(function (p) { return { re: rx(p.re), w: p.w }; });
    });
    RX._da = rx(S.format.endings.da);
    RX._yo = rx(S.format.endings.yo);
    if (C) {
      CX = { spelling: [], spacing: [], spoken: [] };
      ['spelling', 'spacing', 'spoken'].forEach(function (k) {
        (C[k] || []).forEach(function (e) {
          CX[k].push({ re: e.re ? rxg(e.re) : null, fix: e.fix, why: e.why, skip: e.skip ? rx(e.skip) : null, skipPrev: e.skipPrev ? rx('^(' + e.skipPrev + ')$') : null, rule: e.rule || null, soft: !!e.soft, map: e.map || null });
        });
      });
      CX.punct = {};
      Object.keys(C.punct).forEach(function (k) { var p = C.punct[k]; CX.punct[k] = { re: p.re ? rxg(p.re) : null, why: p.why, fix: p.fix, skip: p.skip ? rx(p.skip) : null }; });
      CX.splitAt = rxg(C.long.splitAt);
    }
    return true;
  }

  /* ---------- 한글 도우미 ---------- */
  function jong(ch) { var c = ch.charCodeAt(0) - 0xAC00; return (c < 0 || c > 11171) ? -1 : c % 28; } // 0=받침 없음, 8=ㄹ, 4=ㄴ, -1=한글 아님
  function hasBatchim(ch) { var j = jong(ch); return j > 0; }
  function noBatchim(ch) { return jong(ch) === 0; }

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

  /* ---------- 2) 한 문장 신호어 대조 → {C:2, R:1, ...} (코드별 최대 가중치) — 따옴표 속은 뺀다 ---------- */
  function unquote(s) {
    var t = s.replace(/“[^”]*”|「[^」]*」|"[^"]*"|‘[^’]*’/gu, ' ');
    return t.replace(/\s+/g, ' ').trim().length < 2 ? s : t; // 문장 전체가 따옴표면 그대로 본다
  }
  function detect(sentence) {
    var got = {}, s = unquote(sentence);
    Object.keys(RX).forEach(function (code) {
      if (code[0] === '_') return;
      var best = 0;
      RX[code].forEach(function (p) { if (p.w > best && p.re.test(s)) best = p.w; });
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
    return (text.match(/[가-힣]{2,}/g) || []).map(function (w) {
      return w.replace(/(에서는|에게는|으로는|에서|에게|으로|이랑|까지|부터|처럼|보다|에는|은|는|이|가|을|를|의|에|도|로|와|과|만)$/u, '');
    }).filter(function (w) { return w.length >= 2; });
  }
  function jaccard(a, b) {
    var A = {}, B = {}, inter = 0, uni = 0;
    a.forEach(function (w) { A[w] = 1; }); b.forEach(function (w) { B[w] = 1; });
    Object.keys(A).forEach(function (w) { uni++; if (B[w]) inter++; });
    Object.keys(B).forEach(function (w) { if (!A[w]) uni++; });
    return uni ? inter / uni : 0;
  }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- 3) 선생님 표시 — 글자 단위 ---------- */
  function subFix(fix, m, map) {
    return String(fix).replace(/\{map:\$(\d)\}/g, function (_, n) { return (map && map[m[+n]] != null) ? map[m[+n]] : m[+n]; })
      .replace(/\$(\d)/g, function (_, n) { return m[+n] != null ? m[+n] : ''; });
  }
  function pushMark(list, s, from, len, kind, original, fixed, why, soft) {
    if (!original) return;
    for (var k = 0; k < list.length; k++) { var o = list[k]; if (o.i === s.i && !(from + len <= o.from || from >= o.to)) return; } // 겹치면 먼저 것
    list.push({ i: s.i, from: from, to: from + len, kind: kind, original: original, fix: fixed, why: why, soft: !!soft });
  }
  function runList(list, s, kind, out, band) {
    list.forEach(function (e) {
      if (e.rule) { runRule(e, s, kind, out); return; }
      if (!e.re) return;
      e.re.lastIndex = 0; var m;
      while ((m = e.re.exec(s.text))) {
        if (!m[0].length) { e.re.lastIndex++; continue; }
        if (e.skip && e.skip.test(m[0])) continue;
        if (e.skipPrev && m[1] != null && e.skipPrev.test(m[1])) continue;
        var fixed = subFix(e.fix, m, e.map);
        if (fixed === m[0]) continue;
        pushMark(out, s, m.index, m[0].length, kind, m[0], fixed, e.why, e.soft);
      }
    });
  }
  function runRule(e, s, kind, out) {
    var t = s.text, m, re;
    if (e.rule === 'batchim' || e.rule === 'nobatchim') { // 예요/에요·읍니다 — $1 받침 검사
      re = rxg(e.re);
      while ((m = re.exec(t))) {
        var ch = m[1]; if (e.skipPrev && e.skipPrev.test(ch)) continue;
        if (e.rule === 'batchim' ? !hasBatchim(ch) : !noBatchim(ch)) continue;
        pushMark(out, s, m.index, m[0].length, kind, m[0], subFix(e.fix, m), e.why, e.soft);
      }
    } else if (e.rule === 'l_su') { // ㄹ받침 + 수/때/뿐/만큼/줄/듯 + 뒷말 붙음
      re = /([가-힣])(수|때|뿐|만큼|듯)(?=[\s.,!?]|$|(있|없|같|이|에|도|를|을|은|는|마다|까지|부터|처럼|밖에|가|다|만)[가-힣]?)/gu;
      while ((m = re.exec(t))) {
        if (jong(m[1]) !== 8) continue;
        pushMark(out, s, m.index, m[0].length, kind, m[0], m[1] + ' ' + m[2], e.why, false);
      }
    } else if (e.rule === 'n_geot') { // ㄴ/ㄹ받침 + 것 + 붙음
      re = /([가-힣])것(?=(같|이|은|을|도|에|처럼|보다|이다|입니다|이에요|이야)[가-힣]?)/gu;
      while ((m = re.exec(t))) {
        var j = jong(m[1]); if (j !== 4 && j !== 8) continue;
        pushMark(out, s, m.index, m[0].length, kind, m[0], m[1] + ' 것', e.why, false);
      }
    }
  }
  function nounStems(sents) { // 글 전체에서 토씨 붙은 낱말의 줄기 — 두 번 이상 보이면 이름씨로 본다(오탐 방지)
    var cnt = {};
    sents.forEach(function (s) { (s.text.match(/[가-힣]+/g) || []).forEach(function (w) {
      var m = w.match(/^([가-힣]{1,6}?)(은|는|이|가|을|를|에|의|도|에서|와|과|으로|로|에게|께|한테|이랑|랑|까지|부터|만|처럼|보다)$/u); if (m) cnt[m[1]] = (cnt[m[1]] || 0) + 1; }); });
    return cnt;
  }
  function runParticles(s, out, kws, stems) {
    (C.particle || []).forEach(function (e) {
      var re = new RegExp('([가-힣])(' + e.wrong + ')(?=[\\s.,!?]|$)', 'gu'), m;
      while ((m = re.exec(s.text))) {
        var ch = m[1];
        if (e.need === 'batchim' ? !hasBatchim(ch) : !noBatchim(ch)) continue;
        var word = (s.text.slice(0, m.index + 1).match(/[가-힣]+$/u) || [''])[0] + m[2];
        if (e.skip && new RegExp('(' + e.skip + ')$', 'u').test(word)) continue;
        var stem = word.slice(0, -m[2].length);
        var known = kws.some(function (k) { return stem === k; }) || (!e.onlyAfterNoun && (stems[stem] || 0) >= 2);
        if (!known) continue; // 이름씨라는 증거(논제 낱말이거나 글에 두 번 이상)가 없으면 넘긴다
        pushMark(out, s, m.index, m[0].length, 'particle', m[0], ch + e.right, e.why, false);
      }
    });
  }
  function correct(opt) {
    if (!C) return { marks: [], kinds: {}, byKind: {} };
    var band = bandOf(opt.band), type = opt.type || 'argue';
    var allow = C.bands[band] || [];
    var sents = opt.sentences || split(opt.text);
    var kws = (opt.keywords || []).slice();
    var out = [], stems = nounStems(sents);
    sents.forEach(function (s) {
      if (allow.indexOf('spelling') >= 0) runList(CX.spelling, s, 'spelling', out, band);
      if (allow.indexOf('spacing') >= 0) runList(CX.spacing, s, 'spacing', out, band);
      if (allow.indexOf('particle') >= 0) runParticles(s, out, kws, stems);
      if (allow.indexOf('spoken') >= 0) runList(CX.spoken, s, 'spoken', out, band);
      if (allow.indexOf('punct') >= 0) {
        var t = s.text, P = CX.punct, m;
        if (!/[.!?。…”’"]\s*$/u.test(t) && t.length > 5 && !(P.noEnd.skip && P.noEnd.skip.test(t))) out.push({ i: s.i, from: t.length, to: t.length, kind: 'punct', original: '', fix: P.noEnd.fix, why: P.noEnd.why, soft: false, append: true });
        ['question', 'question2', 'multi', 'spaceBefore', 'noSpaceAfterComma'].forEach(function (k) {
          var p = P[k]; if (!p.re) return; p.re.lastIndex = 0;
          while ((m = p.re.exec(t))) {
            var fx = (k === 'question' || k === 'question2') ? m[0].replace(/\.\s*$/, '?') : k === 'noSpaceAfterComma' ? ', ' : subFix(p.fix, m);
            if (k === 'noSpaceAfterComma') { pushMark(out, s, m.index, 1, 'punct', ',', fx, p.why, true); continue; }
            pushMark(out, s, m.index, m[0].length, 'punct', m[0], fx, p.why, k !== 'question' && k !== 'question2');
          }
        });
      }
    });
    /* 긴 문장 — 나눌 자리 하나 */
    if (allow.indexOf('long') >= 0) {
      var lim = S.format.sentenceLength[band];
      sents.forEach(function (s) {
        if (s.text.replace(/\s+/g, '').length <= lim) return;
        CX.splitAt.lastIndex = 0; var best = null, m, mid = s.text.length / 2;
        while ((m = CX.splitAt.exec(s.text))) { if (!best || Math.abs(m.index - mid) < Math.abs(best.index - mid)) best = { index: m.index, len: m[0].length, w: m[1] }; }
        if (best) pushMark(out, s, best.index, best.len, 'long', s.text.substr(best.index, best.len), best.w + '. ', C.long.why, true);
      });
    }
    /* 끝맺음 섞임 — 소수 쪽 문장 끝을 표시 */
    if (allow.indexOf('ending') >= 0 && S.format.endings.skipTypes.indexOf(type) < 0) {
      var da = [], yo = [];
      var endOf = function (s) { var t = unquote(s.text); if (/\?\s*$/.test(t) || /(시다|자|까)\s*[.!]?\s*$/u.test(t)) return null; return RX._da.test(t) ? 'da' : RX._yo.test(t) ? 'yo' : null; };
      sents.forEach(function (s) { var e = endOf(s); if (e === 'da') da.push(s); else if (e === 'yo') yo.push(s); });
      if (da.length && yo.length) {
        var minority = da.length < yo.length ? da : yo, majorityYo = da.length < yo.length;
        minority.forEach(function (s) {
          var m = s.text.match(majorityYo ? /(다|니다)(\s*[.!?]?)\s*$/u : /(요|죠)(\s*[.!?]?)\s*$/u);
          if (m) pushMark(out, s, m.index, m[1].length, 'ending', m[1], majorityYo ? '~요' : '~다', C.ending.why, true);
        });
      }
    }
    /* 같은 낱말 — 가장 많이 나온 것 하나, 나오는 자리 전부 */
    if (allow.indexOf('repeat') >= 0) {
      var rw = S.format.repeatWord, freq = {}, chars = sents.reduce(function (n, s) { return n + s.text.replace(/\s+/g, '').length; }, 0);
      sents.forEach(function (s) { words(s.text).forEach(function (w) { if (w.length >= rw.minLen) freq[w] = (freq[w] || 0) + 1; }); });
      var threshold = Math.max(rw.minCount, Math.round(chars / rw.perChars) * rw.minCount);
      var top = Object.keys(freq).filter(function (w) { return kws.indexOf(w) < 0 && freq[w] >= threshold; }).sort(function (x, y) { return freq[y] - freq[x]; })[0];
      if (top) {
        var why = fill(C.repeat.why, { word: top, n: freq[top] });
        sents.forEach(function (s) { var re = new RegExp(esc(top), 'gu'), m; while ((m = re.exec(s.text))) pushMark(out, s, m.index, top.length, 'repeat', top, '(다른 말)', why, true); });
      }
    }
    out.sort(function (a, b) { return a.i - b.i || a.from - b.from; });
    var byKind = {};
    out.forEach(function (m) { byKind[m.kind] = (byKind[m.kind] || 0) + 1; });
    return { marks: out, byKind: byKind, kinds: C.kinds, count: out.length, hard: out.filter(function (m) { return !m.soft; }).length };
  }
  /* 표시 하나를 글에 반영 — 문장 원문은 글 안에 그대로 있으므로(split 은 trim 만) 문장 단위로 바꾼다 */
  function applyMark(text, sentenceText, mark) {
    var s = sentenceText, ns;
    if (mark.append) ns = s + mark.fix;
    else if (mark.fix === '(빼기)') ns = (s.slice(0, mark.from) + s.slice(mark.to)).replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1');
    else if (mark.fix === '(다른 말)' || /^~/.test(mark.fix)) return text;
    else ns = s.slice(0, mark.from) + mark.fix + s.slice(mark.to);
    var at = text.indexOf(s);
    return at < 0 ? text : text.slice(0, at) + ns + text.slice(at + s.length);
  }

  /* ---------- 4) 전체 분석 ---------- */
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

    /* 4-1 문장별 감지 + 표시 대조 */
    sents.forEach(function (s) {
      s.detected = detect(s.text);
      // 「X는 Y이다」 명사문은 약한 신호지만, 첫 문단 앞머리에서는 곧 「무엇인지」 설명이다 → 강하게
      if (s.detected.F === 1 && s.para === 0 && s.i <= 2) s.detected.F = 2;
      // 「왜냐하면 … 했을 때 …」 는 이유 문장 — 그 안의 경험 표지는 예시로 세지 않는다
      if (s.detected.R >= 2 && s.detected.E >= 2 && /^\s*(왜냐하면|왜냐면|그 이유는|첫째|둘째|셋째)/u.test(s.text) && !/예를 들|예컨대/u.test(s.text)) s.detected.E = 1;
      s.rawW = !!s.detected.W;
      if (s.detected.W && s.para !== lastPara) delete s.detected.W;
      if (s.detected.G && !(s.i <= 1 || s.i >= sents.length - 2)) delete s.detected.G;
      s.mark = marks[s.i] || marks[String(s.i)] || null;
      s.agree = null;
      var strong = Object.keys(s.detected).filter(function (c) { return s.detected[c] >= 2; });
      if (s.mark) s.agree = (s.detected[s.mark] >= 1) ? 'match' : 'markedNoSignal';
      else if (strong.length) { s.agree = 'signalNotMarked'; s.suggest = strong[0]; }
      s.role = s.mark || strong[0] || null; // 여백 도장용 — 학생 표시 우선
    });

    /* 4-2 요소 판정 */
    var elements = {};
    Object.keys(spec.need).forEach(function (code) {
      var need = spec.need[code], strongN = 0, weakN = 0, hits = [];
      sents.forEach(function (s) {
        var byMark = s.mark === code, byStrong = s.detected[code] >= 2, byWeak = s.detected[code] === 1;
        if (byMark || byStrong) { strongN++; hits.push(s.i); }
        else if (byWeak) weakN++;
      });
      var status = strongN >= need ? 'green' : (strongN > 0 || weakN > 0) ? 'yellow' : 'red';
      var fb = (F.elements[type] && F.elements[type][code]) || F.elements.argue[code] || { green: '', yellow: '', red: '' };
      var msg = fb[status];
      if (status === 'yellow' && strongN === 0) msg = fb.red;
      elements[code] = { status: status, need: need, have: strongN, weak: weakN, hits: hits, msg: msg, name: (T.colors[code] || {}).name || code };
    });

    /* 4-3 논제 대조 + 문단별 분포 */
    var topic = null;
    var kws = (opt.keywords || []).map(function (k) { return String(k).trim(); }).filter(Boolean);
    if (!kws.length && opt.topic) kws = words(opt.topic).filter(function (w, i, a) { return a.indexOf(w) === i; }).slice(0, 3);
    if (kws.length) {
      var body = text.replace(/\s+/g, '');
      var counts = kws.map(function (k) { return (body.match(rxg(esc(k))) || []).length; });
      var maxN = Math.max.apply(null, counts);
      var st = maxN >= 2 ? 'green' : maxN === 1 ? 'yellow' : 'red';
      var missing = kws[counts.indexOf(Math.min.apply(null, counts))];
      var perPara = [];
      for (var p = 0; p < paraCount; p++) perPara.push(0);
      sents.forEach(function (s) { kws.forEach(function (k) { if (s.text.indexOf(k) >= 0) perPara[s.para]++; }); });
      topic = { status: st, keywords: kws, counts: counts, perPara: perPara, msg: fill(F.common.topic[st], { kw: st === 'green' ? kws[0] : missing }) };
    }

    /* 4-4 문단 역할·순서·짝 (구조) */
    var structure = { roles: [], issues: [] };
    var paras = [];
    for (var pi = 0; pi < paraCount; pi++) paras.push(sents.filter(function (s) { return s.para === pi; }));
    paras.forEach(function (ps, pi) {
      var codes = {};
      ps.forEach(function (s) { Object.keys(s.detected).forEach(function (c) { if (s.detected[c] >= 2 || s.mark === c) codes[c] = (codes[c] || 0) + 1; }); });
      var role = paraCount === 1 ? 'one' : pi === 0 ? 'first' : pi === paraCount - 1 ? 'last' : 'middle';
      structure.roles.push({ para: pi, role: role, name: F.structure.roleNames[role], codes: codes, first: ps[0] ? ps[0].text : '' });
    });
    var SI = F.structure.issues, primary = tpl.order[0];
    var firstHas = function (c) { return structure.roles[0] && structure.roles[0].codes[c]; };
    var lastHas = function (c) { return structure.roles[paraCount - 1] && structure.roles[paraCount - 1].codes[c]; };
    if (band !== 'low' && paraCount >= 2) {
      // 첫 요소(주장/설명/책/인사/언제어디)가 첫 문단에 없고 뒤에만 있다
      if (elements[primary] && elements[primary].status !== 'red' && !firstHas(primary) && (lastHas(primary) || elements[primary].have)) structure.issues.push({ code: 'orderFirst', el: primary, status: 'yellow', msg: fill(SI.orderFirst, { name: T.colors[primary].name }) });
      // 마무리 신호가 첫 문단에서 나옴(그래서·따라서로 시작)
      if (sents.some(function (s) { return s.rawW && s.para === 0 && /^\s*(그래서|따라서|그러므로|이처럼|결국)/u.test(s.text) && paraCount >= 3; })) structure.issues.push({ code: 'wEarly', status: 'yellow', msg: SI.wEarly });
    }
    // 이유가 있는데 예시 짝이 없다 (고학년 주장·편지) — 이유 문장 다음 두 문장 안에 E 없음
    if (band === 'high' && spec.need.R && spec.need.E) {
      var rs = sents.filter(function (s) { return s.detected.R >= 2 || s.mark === 'R'; });
      var unpaired = rs.filter(function (r) { return !sents.some(function (s) { return s.i > r.i && s.i <= r.i + 2 && (s.detected.E || s.mark === 'E'); }); });
      if (rs.length >= 2 && unpaired.length === rs.length) structure.issues.push({ code: 'rNoE', status: 'yellow', msg: SI.rNoE });
    }
    // 거의 같은 이유 두 번
    if (spec.need.R && (spec.need.R >= 2 || band !== 'low')) {
      var rr = sents.filter(function (s) { return s.detected.R >= 2 || s.mark === 'R'; });
      for (var a = 0; a < rr.length; a++) for (var b = a + 1; b < rr.length; b++) {
        if (jaccard(words(rr[a].text), words(rr[b].text)) >= 0.6) { structure.issues.push({ code: 'dupR', status: 'yellow', i: [rr[a].i, rr[b].i], msg: SI.dupR }); a = rr.length; break; }
      }
    }
    // 논제 낱말이 한 문단에만 몰림
    if (topic && topic.status === 'green' && paraCount >= 3) {
      var withKw = topic.perPara.filter(function (n) { return n > 0; }).length;
      if (withKw === 1) structure.issues.push({ code: 'topicSpread', status: 'yellow', msg: fill(SI.topicSpread, { kw: kws[0] }) });
    }
    // 가운데·끝 문단 첫 문장에 이어 주는 말이 하나도 없다(고)
    if (band === 'high' && paraCount >= 3) {
      var conn = rx(S.format.connectives || '^\\s*(그래서|따라서|그러므로|이처럼|이렇게|하지만|그렇지만|그러나|그런데|또한|또|그리고|먼저|다음으로|그다음|마지막으로|물론|첫째|둘째|셋째|왜냐하면|예를 들어|결국|앞으로|한편|게다가|반면에|즉|다시 말해)');
      var later = structure.roles.slice(1);
      if (later.length && !later.some(function (r) { return conn.test(r.first); })) structure.issues.push({ code: 'connective', status: 'tidy', msg: SI.connective });
    }

    /* 4-5 분량·문단 */
    var chars = text.replace(/\s+/g, '').length;
    var lenSt = chars < spec.length[0] ? 'short' : chars > spec.length[1] ? 'long' : 'green';
    var length = { chars: chars, range: spec.length, status: lenSt, msg: F.common.length[lenSt] };
    var parasInfo = { count: paraCount, range: spec.paras, msg: null };
    if (band !== 'low' && paraCount < spec.paras[0] && chars >= spec.length[0]) parasInfo.msg = F.common.para;
    else if (paraCount > spec.paras[1] + 2) parasInfo.msg = F.common.paraMany;

    /* 4-6 형식 — 다듬기 카드 (감점 아님). 선생님 표시가 있으면 그 요약을 쓴다 */
    var teacher = C ? correct({ sentences: sents, band: band, type: type, keywords: kws }) : null;
    var format = [];
    var firstOf = function (kind) { return teacher && teacher.marks.filter(function (m) { return m.kind === kind; })[0]; };
    if (teacher) {
      var sp = firstOf('spoken'); if (sp) format.push({ kind: 'spoken', word: sp.original, msg: fill(F.common.spoken, { word: sp.original, fix: sp.fix }) });
      var sl = firstOf('spelling') || firstOf('spacing') || firstOf('particle'); if (sl) format.push({ kind: 'spelling', word: sl.original, msg: fill(F.common.spelling, { word: sl.original, fix: sl.fix }) });
      var lg = firstOf('long'); if (lg) format.push({ kind: 'sentence', i: lg.i, msg: fill(F.common.sentence, { n: lg.i + 1 }) });
      var rp = firstOf('repeat'); if (rp) format.push({ kind: 'repeat', word: rp.original, msg: rp.why });
      if (firstOf('ending')) format.push({ kind: 'endings', msg: F.common.endings });
    }
    var run = 1;
    for (var k = 1; k < sents.length; k++) {
      var a1 = (sents[k - 1].text.match(/^[가-힣]+/) || [''])[0], b1 = (sents[k].text.match(/^[가-힣]+/) || [''])[0];
      run = (a1 && a1 === b1) ? run + 1 : 1;
      if (run >= S.format.sameStart) { format.push({ kind: 'sameStart', word: b1, msg: fill(F.common.sameStart, { word: b1 }) }); break; }
    }

    /* 4-7 카드 — 최대 3장 */
    var cards = [];
    var order = tpl.order.concat(Object.keys(spec.need).filter(function (c) { return tpl.order.indexOf(c) < 0; }));
    order.forEach(function (c) { if (elements[c] && elements[c].status === 'red') cards.push({ kind: 'element', code: c, status: 'red', msg: elements[c].msg }); });
    if (topic && topic.status === 'red') cards.push({ kind: 'topic', status: 'red', msg: topic.msg });
    structure.issues.filter(function (x) { return x.code === 'orderFirst' || x.code === 'wEarly'; }).forEach(function (x) { cards.push({ kind: 'structure', code: x.code, status: 'yellow', msg: x.msg }); });
    order.forEach(function (c) { if (elements[c] && elements[c].status === 'yellow') cards.push({ kind: 'element', code: c, status: 'yellow', msg: elements[c].msg }); });
    if (topic && topic.status === 'yellow') cards.push({ kind: 'topic', status: 'yellow', msg: topic.msg });
    structure.issues.filter(function (x) { return x.code === 'rNoE' || x.code === 'dupR' || x.code === 'topicSpread'; }).forEach(function (x) { cards.push({ kind: 'structure', code: x.code, status: 'yellow', msg: x.msg }); });
    if (parasInfo.msg) cards.push({ kind: 'para', status: 'yellow', msg: parasInfo.msg });
    structure.issues.filter(function (x) { return x.code === 'connective'; }).forEach(function (x) { cards.push({ kind: 'structure', code: x.code, status: 'tidy', msg: x.msg }); });
    format.forEach(function (f) { cards.push({ kind: f.kind, status: 'tidy', msg: f.msg, i: f.i }); });
    if (lenSt !== 'green') cards.push({ kind: 'length', status: 'tidy', msg: length.msg });
    cards = cards.slice(0, 3);

    var allGreen = Object.keys(elements).every(function (c) { return elements[c].status === 'green'; }) && (!topic || topic.status !== 'red');
    return {
      type: type, band: band, spec: spec, sentences: sents, elements: elements, structure: structure, topic: topic,
      length: length, paras: parasInfo, format: format, cards: cards, teacher: teacher, allGreen: allGreen,
      notice: F.state.notice, done: allGreen && !cards.length ? F.state.allGreen : null
    };
  }

  return { init: init, split: split, detect: detect, analyze: analyze, correct: correct, applyMark: applyMark, bandOf: bandOf, fill: fill, jong: jong };
});
