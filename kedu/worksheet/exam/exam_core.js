/* ============================================================
   케이학습지 시험지 — 문항 고르기·바꾸기 엔진 (exam_core.js) · 2026-11-14
   ------------------------------------------------------------
   케이학습지 세트(data/*.json)의 문항을 학력경시 시험 문항으로 옮긴다.

   ① 학생에게 나간 문제와 똑같이 내지 않는다
      - 미리 써 둔 바꾼 문제(variant_rule.alt)가 있으면 그중 하나로 낸다  → 「바뀐 문제」
      - 없으면 말투(-요 → -시오/-습니까)·보기 순서를 바꾸고 「손볼 문제」로 표시한다(교사가 화면에서 고친다)
      - 교과서판(tb_)이 아닌 옛 세트(학생 화면에서 숨긴 응용 문항)를 먼저 고른다
   ② 시험 말씨: 교과서 쪽수 표시(『국어』 36쪽 …)는 지우고, 그 쪽수는 출제근거목록표 「교과서」 칸으로 모은다
   ③ 보기 수 = 교사가 4지·5지 중 고름(기본 5). 모자라면 수·분수는 계산으로, 글은 그 문항의 다른 오답 →
      같은 개념 다른 문항 오답(낱말 겹치는 것, 「않은 것」 물음엔 안 빌림 · 빌린 보기 표시) → 그래도 없으면 빈 보기(교사가 채움)
   ⑤ 보기 차례 = 글자 수가 짧은 것부터 ①→⑤ (준호 2026-11-14)
   ④ 분수 ⟨3/4⟩·⟨1 2/3⟩ 은 한글 수식 조각 {eq} 로 나눈다

   브라우저(window.KeduExam)·node(module.exports) 양쪽에서 돈다.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeduExam = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- 작은 도구 ---------- */
  function hash(str) { var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(seed); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  var CIRC = ['①', '②', '③', '④', '⑤', '⑥'];
  var SUBJ_KO = { kor: '국어', korean: '국어', math: '수학', soc: '사회', social: '사회', sci: '과학', science: '과학' };
  var DIFF_KO = { 1: '하', 2: '중', 3: '상', 4: '상' };

  /* ---------- ② 시험 말씨 ---------- */
  var BOOK = '(?:국어|국어활동|수학|수학 익힘|사회|사회과 부도|과학|실험 관찰|도덕|영어)';
  var RE_BOOK_SENT = new RegExp('『' + BOOK + '』\\s*\\d+(?:\\s*[~∼-]\\s*\\d+)?쪽[^.?!]*?(?:이에요|예요|입니다|이다)\\.\\s*', 'g');
  var RE_BOOK_INLINE = new RegExp('『' + BOOK + '』\\s*\\d+(?:\\s*[~∼-]\\s*\\d+)?쪽(?:\\s*\\d+번)?(?:\\s*\\(\\d+\\)번)?(?:의\\s*(?:둘째|첫째|셋째)?\\s*예시)?\\s*(?:에서|의|에|은|는|을|를)?\\s*', 'g');
  var RE_BOOK_PAGE = new RegExp('『(' + BOOK + ')』\\s*(\\d+)(?:\\s*[~∼-]\\s*(\\d+))?쪽', 'g');

  /* 교과서 쪽수 모으기 — 발문·풀이·자료 제목에서 */
  function bookPages(q) {
    var txt = [q.stem || ''].concat(q.explanation || []).concat(q.asset && q.asset.title ? [q.asset.title] : []).join(' ');
    var out = []; var m; RE_BOOK_PAGE.lastIndex = 0;
    while ((m = RE_BOOK_PAGE.exec(txt))) { out.push(+m[2]); if (m[3]) out.push(+m[3]); }
    return out;
  }
  /* 「…」 머리표·쪽수 표시 지우기 */
  function stripTags(s) {
    s = String(s || '');
    for (var k = 0; k < 3; k++) s = s.replace(/^\s*「(?:확인 문제|익힘|스스로 마무리하기|생각 열기|함께 해요|도전|탐구|정리|되돌아보기|문제 해결|놀이|활동|실험|개념|연습|기본|응용|심화)[^」]{0,10}」\s*/, '');
    s = s.replace(/^\s*빈칸을 채워요\.\s*/, '').replace(/^\s*이번(?:에는|엔)[^.?!]{0,20}(?:예요|이에요)\.\s*/, '');
    s = s.replace(RE_BOOK_SENT, '').replace(RE_BOOK_INLINE, '');
    return s.replace(/\s{2,}/g, ' ').trim();
  }
  /* 「주나요?」→「줍니까?」 · 「읽나요?」→「읽습니까?」 */
  var NAYO = /([가-힣])나요\?$/;
  function nayo(_, ch) { var c = ch.charCodeAt(0) - 0xAC00; return c % 28 ? ch + '습니까?' : String.fromCharCode(0xAC00 + c + 17) + '니까?'; }
  /* 물음 끝맺음 → 시험 말씨 */
  var ENDS = [
    [/인가요\?$/, '입니까?'], [/일까요\?$/, '입니까?'], [/할까요\?$/, '합니까?'], [/될까요\?$/, '됩니까?'],
    [/하나요\?$/, '합니까?'], [/되나요\?$/, '됩니까?'], [/있나요\?$/, '있습니까?'], [/없나요\?$/, '없습니까?'], [/(았|었|였)나요\?$/, '$1습니까?'], [NAYO, nayo],
    [/쓰세요\.?$/, '쓰시오.'], [/써 보세요\.?$/, '쓰시오.'], [/고르세요\.?$/, '고르시오.'], [/골라 보세요\.?$/, '고르시오.'],
    [/이으세요\.?$/, '이으시오.'], [/이어 보세요\.?$/, '이으시오.'], [/구하세요\.?$/, '구하시오.'], [/구해 보세요\.?$/, '구하시오.'],
    [/(\S)해 보세요\.?$/, '$1하시오.'], [/보세요\.?$/, '보시오.'], [/세요\.?$/, '시오.']
  ];
  function endOne(s) { for (var i = 0; i < ENDS.length; i++) if (ENDS[i][0].test(s)) return s.replace(ENDS[i][0], ENDS[i][1]); return s; }
  /* 문장마다(「…세요. ⟨식⟩」처럼 물음 뒤에 식이 붙은 것도) */
  function examEnding(s) {
    return String(s || '').trim().split(/(?<=[.?!])\s+/).map(function (x) { return /(세요\.?|요\?)$/.test(x) ? endOne(x) : x; }).join(' ');
  }
  /* OX 문장(…예요/…해요) → 평서문(…이다/…한다) */
  var DECL = [
    [/예요\.?$/, '이다.'], [/이에요\.?$/, '이다.'], [/(\S)해요\.?$/, '$1한다.'], [/있어요\.?$/, '있다.'], [/없어요\.?$/, '없다.'],
    [/돼요\.?$/, '된다.'], [/(\S)워요\.?$/, '$1웁다.'], [/아니에요\.?$/, '아니다.'], [/(\S)져요\.?$/, '$1진다.'], [/(\S)대요\.?$/, '$1댄다.']
  ];
  function declarative(s) {
    s = String(s || '').trim();
    for (var i = 0; i < DECL.length; i++) if (DECL[i][0].test(s)) return s.replace(DECL[i][0], DECL[i][1]);
    return s;
  }
  function examStem(s) { return examEnding(stripTags(s)); }

  /* ---------- ④ 분수 → 수식 조각 ---------- */
  /* '⟨1 2/3⟩' → {eq:'1{2} over {3}'} · 그 밖은 {t} */
  function splitMath(s) {
    var out = [], re = /⟨\s*(?:(\d+|□)\s+)?(\d+|□)\s*\/\s*(\d+|□)\s*⟩/g, last = 0, m;
    s = String(s == null ? '' : s);
    while ((m = re.exec(s))) {
      if (m.index > last) out.push({ t: s.slice(last, m.index) });
      out.push({ eq: (m[1] ? m[1] + ' ' : '') + '{' + m[2] + '} over {' + m[3] + '}', w: m[1] || '', n: m[2], d: m[3] });
      last = re.lastIndex;
    }
    if (last < s.length) out.push({ t: s.slice(last) });
    return out.length ? out : [{ t: '' }];
  }
  function plain(s) { return String(s == null ? '' : s).replace(/⟨\s*(?:(\d+|□)\s+)?(\d+|□)\s*\/\s*(\d+|□)\s*⟩/g, function (_, w, n, d) { return (w ? w + ' ' : '') + n + '/' + d; }); }

  /* ---------- 보기 글 ---------- */
  function optText(t) {
    if (t == null) return '';
    if (typeof t === 'object') { var ch = t.type === 'dots' ? '●' : (t.item || '●'); return new Array((+t.n || 0) + 1).join(ch); }
    return String(t);
  }

  /* ---------- 자료(asset) → 상자 줄 ---------- */
  function assetBox(a) {
    if (!a || typeof a !== 'object') return null;
    if (a.type === 'passage') return { title: a.title ? stripTags(a.title).replace(RE_BOOK_INLINE, '').replace(/\s*—\s*$/, '') : '', lines: (a.lines || []).map(function (x) { return String(x).replace(/^　/, '  '); }) };
    if (a.type === 'speech') return { title: '', lines: (a.turns || []).map(function (t) { return (t.who ? t.who + ': ' : '') + t.text; }) };
    if (a.type === 'diary' && a.lines) return { title: a.title || '', lines: a.lines };
    return null;
  }
  var BOX_TYPES = { passage: 1, speech: 1, diary: 1 };

  /* ---------- 세트 → 시험 문항 원본 ---------- */
  /* set 머리 + 문항 → 원본 카드 {id, set, seq, tb, unit, unitName, grade, sem, subject, q} */
  function cardsOf(doc) {
    var tb = /^tb_/.test(doc.set || '');
    return (doc.questions || []).map(function (q) {
      return { id: doc.set + '#' + q.seq, set: doc.set, seq: q.seq, tb: tb, kind: doc.kind, unit: doc.unit, unitName: doc.unitName,
        grade: doc.grade, sem: doc.semester || 1, subject: doc.subject, q: q };
    });
  }
  function usable(c) {
    var q = c.q; if (!q || !q.stem) return false;
    if (['mc', 'sa', 'ox', 'essay', 'match', 'blank', 'error'].indexOf(q.kind) < 0) return false;
    if (q.options && q.options.some(function (o) { return typeof o.t === 'object'; })) return false;   // 점 그림 보기(1학년)
    /* 「신문 ②에서」「소식지 ③」처럼 다른 자료를 가리키는데 그 자료가 문항에 없으면 시험지에서 풀 수 없다 */
    if (!q.asset && /(신문|소식지|일지|보고서|자료|글|그림|사진|표|지도|대화|안내문|만화)\s*[①-⑳㉮-㉳㉠-㉻]/.test(q.stem)) return false;
    return true;
  }
  function hasPicture(q) { return !!(q.asset && typeof q.asset === 'object' && !BOX_TYPES[q.asset.type]); }

  /* ---------- ① 바꾸기 ---------- */
  function variantOf(q, r) {
    var rule = q.variant_rule;
    if (!rule || !Array.isArray(rule.alt) || !rule.alt.length) return null;
    var piece = rule.alt[Math.floor(r() * rule.alt.length)], v = clone(q);
    ['stem', 'asset', 'options', 'answer', 'pairs', 'reason_options', 'explanation', 'answer_guide', 'kind'].forEach(function (k) { if (piece[k] !== undefined) v[k] = clone(piece[k]); });
    if (piece.asset === null) delete v.asset;
    delete v.variant_rule;
    return v;
  }

  /* ---------- ③ 다섯째 보기 ---------- */
  function numVal(s) { var t = plain(s).trim().replace(/,/g, ''); var m = t.match(/^(-?\d+(?:\.\d+)?)(\s*)(\D{0,6})$/); return m ? { v: +m[1], sep: m[2], unit: m[3], dec: (m[1].split('.')[1] || '').length } : null; }
  function fracVal(s) { var m = String(s).trim().match(/^⟨\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)\s*⟩(\s*[^\d⟨⟩\s]{0,4})$/); return m ? { w: m[1] ? +m[1] : 0, n: +m[2], d: +m[3], u: m[4] || '' } : null; }
  function fracStr(w, n, d, u) { return '⟨' + (w ? w + ' ' : '') + n + '/' + d + '⟩' + (u || ''); }
  var NEG = /(않은|아닌|틀린|잘못|옳지\s*않|없는)/;
  var KEYS = function (t) { var o = {}; plain(t).split(/[^가-힣A-Za-z0-9]+/).forEach(function (w) { if (w.length >= 2) o[w.slice(0, 2)] = 1; }); return o; };
  /* own = 이 문항(과 바꾼 문제들)에 미리 써 둔 오답 보기 — 없으면 빈칸으로 두고 교사가 채운다 */
  function fifthOption(opts, pool, r, own, ctx) {
    var have = {}; opts.forEach(function (o) { have[plain(o.t).replace(/\s/g, '')] = 1; });
    var fresh = function (t) { return t && !have[plain(t).replace(/\s/g, '')]; };
    /* 분수 보기 — 분모가 같으면 그 분모로, 다르면 정답의 분모로 분자 ±1 */
    var fr = opts.map(function (o) { return fracVal(o.t); });
    if (fr.every(Boolean)) {
      var ci = opts.findIndex(function (o) { return o.correct; }), base = fr[ci >= 0 ? ci : 0], d0 = base.d, same = fr.every(function (f) { return f.d === d0; });
      var group = same ? fr : [base], mixed = fr.some(function (f) { return f.w; }), u0 = base.u;
      var tot = group.map(function (f) { return f.w * d0 + f.n; }), mx = Math.max.apply(null, tot), mn = Math.min.apply(null, tot);
      var cs = [mx + 1, mn - 1, mx + 2, mn - 2, mx + 3];
      for (var k = 0; k < cs.length; k++) { var v = cs[k]; if (v <= 0) continue; var w = mixed ? Math.floor(v / d0) : 0, n = mixed ? v % d0 : v; if (mixed && n === 0) continue; var t0 = fracStr(w, n, d0, u0); if (fresh(t0)) return { t: t0, added: true }; }
    }
    var nums = opts.map(function (o) { return numVal(o.t); });
    if (nums.every(Boolean) && nums.every(function (n) { return n.unit === nums[0].unit; })) {
      var vals = nums.map(function (n) { return n.v; }), step = Math.pow(10, -Math.max.apply(null, nums.map(function (n) { return n.dec; })));
      var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), cand = [hi + step, lo - step, hi + 2 * step, lo - 2 * step, hi + 10 * step];
      for (var i = 0; i < cand.length; i++) {
        var c = +cand[i].toFixed(6); if (c < 0 && lo >= 0) continue; if (c === 0 && lo > 0 && nums[0].unit) continue;
        var t = String(c) + nums[0].sep + nums[0].unit; if (fresh(t)) return { t: t, added: true };
      }
    }
    if (fr.some(Boolean) || nums.some(Boolean)) return { t: '', added: true, blank: true };   // 식·수 보기는 글을 빌리지 않는다
    var avg = opts.reduce(function (s, o) { return s + plain(o.t).length; }, 0) / opts.length;
    var near = function (t) { return Math.abs(plain(t).length - avg) <= Math.max(5, avg * 0.7); };
    var PFX = /^(친구\s*[가-하]|[가-힣]{2,3})\s*—/, pfx = opts.every(function (o) { return PFX.test(o.t); });
    var shape = function (t) { return PFX.test(t) === pfx && !/[?？]$/.test(t); };
    var similar = function (t) { var kt = KEYS(t), n = 0, m = 0; for (var x in kt) { m++; } return opts.some(function (o) { var ko = KEYS(o.t), hit = 0; for (var y in kt) if (ko[y]) hit++; return m && hit / m >= 0.6; }); };
    var a = (own || []).filter(function (t) { return fresh(t) && near(t) && shape(t) && !similar(t); });
    if (a.length) return { t: a[Math.floor(r() * a.length)], added: true };
    /* 같은 개념 다른 문항의 오답 보기 — 낱말이 겹치는 것만, 빌린 보기는 표시(교사 확인).
       「알맞지 않은 것」처럼 틀린 것을 고르는 물음에는 빌리지 않는다 — 빌린 오답이 또 하나의 정답이 된다 */
    if (!NEG.test(ctx || '')) {
      var ck = KEYS([ctx || ''].concat(opts.map(function (o) { return o.t; })).join(' '));
      var b = (pool || []).filter(function (t) { return fresh(t) && near(t) && shape(t) && !similar(t); })
        .map(function (t) { var kk = KEYS(t), n = 0; for (var x in kk) if (ck[x]) n++; return { t: t, n: n, r: r() }; })
        .filter(function (x) { return x.n >= 1; }).sort(function (p, q) { return (q.n - p.n) || (p.r - q.r); });
      if (b.length) return { t: b[0].t, added: true, borrowed: true };
    }
    return { t: '', added: true, blank: true };      // 화면에서 교사가 채운다
  }

  /* ---------- 시험 문항 만들기 ---------- */
  /* opts: {seed, five:true, pool:[오답 글…]} → item */
  function toItem(card, opts) {
    opts = opts || {};
    var r = rng((opts.seed || 'k') + ':' + card.id + ':' + (opts.roll || 0));
    var v = variantOf(card.q, r), q = v || clone(card.q), changed = v ? 'alt' : (card.tb ? 'tone' : 'apply');
    var it = {
      id: card.id, set: card.set, seq: card.seq, unit: card.unit, unitName: card.unitName, grade: card.grade, subject: card.subject,
      kind: q.kind, diff: DIFF_KO[q.difficulty] || '중', difficulty: q.difficulty, changed: changed,
      pages: bookPages(card.q).concat(v ? bookPages(v) : []), picture: hasPicture(q) ? q.asset : null, img: null,
      box: assetBox(q.asset), stem: '', options: null, answer: '', essay: null, pairs: null, statement: ''
    };
    var stem = examStem(q.stem);
    if (q.kind === 'mc' || q.kind === 'blank' || q.kind === 'error') {
      var os = (q.options || []).map(function (o) { return { t: plain(optText(o.t)) === optText(o.t) ? optText(o.t) : optText(o.t), correct: !!o.correct }; });
      /* 보기 수 맞추기 — 4지·5지(교사가 고름, 기본 5) */
      var want = +opts.choices === 4 ? 4 : 5;
      while (os.length > want) { var wi = os.map(function (o, k) { return o.correct ? -1 : k; }).filter(function (k) { return k >= 0; }); os.splice(wi[Math.floor(r() * wi.length)], 1); }
      if (os.length >= 2 && os.length < want) {
        var own = [];
        ((card.q.variant_rule && card.q.variant_rule.alt) || []).concat([{ options: card.q.options }]).forEach(function (p) { (p.options || []).forEach(function (o) { if (!o.correct && typeof o.t === 'string') own.push(o.t); }); });
        var pool = (opts.pool && card.q.concept && opts.pool[card.q.concept]) || [];
        while (os.length < want) { os.push(fifthOption(os, pool, r, card.subject === 'math' ? [] : own, q.stem)); }
      }
      /* 글자 수가 짧은 보기부터 ①…⑤ (같으면 수 크기·처음 차례) — 빈 보기는 끝 */
      os = os.map(function (o, k) { o._k = k; return o; }).sort(function (a, b) {
        if (a.blank !== b.blank) return a.blank ? 1 : -1;
        var la = plain(a.t).replace(/\s/g, '').length, lb = plain(b.t).replace(/\s/g, '').length; if (la !== lb) return la - lb;
        var na = parseFloat(plain(a.t).replace(/[^\d.\/-]/g, '')), nb = parseFloat(plain(b.t).replace(/[^\d.\/-]/g, '')); if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
        return a._k - b._k;
      }).map(function (o) { delete o._k; return o; });
      it.options = os; it.kind = 'mc';
      var ci = os.findIndex(function (o) { return o.correct; });
      it.answer = ci >= 0 ? CIRC[ci] : '';
      it.type = '선택';
    } else if (q.kind === 'ox') {
      it.statement = declarative(stripTags(q.stem));
      stem = '다음 설명이 맞으면 ○표, 틀리면 ×표 하시오.';
      it.answer = String(q.answer).toUpperCase() === 'O' ? '○' : '×';
      it.type = '단답';
    } else if (q.kind === 'sa') {
      it.answer = (q.answer || []).map(plain).join(', ');
      it.type = '단답';
    } else if (q.kind === 'essay') {
      var g = q.answer_guide || {};
      it.essay = { answer: plain(typeof g === 'string' ? g : (g.answer || '')).replace(/^예:\s*/, ''), criteria: (g.scoring_points || []).map(plain) };
      it.answer = '(서술형 상세표 참고)';
      it.type = '서술';
    } else if (q.kind === 'match') {
      var L = (q.pairs || []).map(function (p) { return optText(p.l); }), R = (q.pairs || []).map(function (p) { return optText(p.r); });
      var order = shuffle(R.map(function (_, i) { return i; }), r);
      it.pairs = { left: L, right: order.map(function (i) { return R[i]; }) };
      var KO = ['㉠', '㉡', '㉢', '㉣', '㉤', '㉥'];
      it.answer = L.map(function (l, i) { return l.replace(/[「」]/g, '') + '-' + KO[order.indexOf(i)]; }).join(', ');
      it.type = '단답';
    }
    it.stem = stem;
    it.borrowed = (it.options || []).some(function (o) { return o.borrowed; });
    it.added = (it.options || []).some(function (o) { return o.added; });
    it.needFill = (it.options || []).some(function (o) { return o.blank; });
    return it;
  }

  /* 같은 단원 오답 보기 모음(다섯째 보기 빌려 오기용) */
  function wrongPool(cards) {
    var seen = {}, out = {};
    cards.forEach(function (c) { var k = c.q.concept || '_'; (c.q.options || []).forEach(function (o) { if (!o.correct && typeof o.t === 'string') { var t = o.t; if (!seen[k + t] && plain(t).length <= 40) { seen[k + t] = 1; (out[k] = out[k] || []).push(t); } } }); });
    return out;
  }

  /* ---------- 추천: 단원별 문항 수 · 유형 수 · 난이도 고르게 ---------- */
  /* 유형 = 시험지 갈래: 선택(mc·blank·error) · 단답(sa·ox·match) · 서술(essay) */
  function typeOf(q) { return q.kind === 'essay' ? '서술' : (q.kind === 'sa' || q.kind === 'ox' || q.kind === 'match') ? '단답' : '선택'; }
  /* 큰 나머지 방식으로 정수 나누기 */
  function share(total, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0) || 1, raw = weights.map(function (w) { return total * w / sum; }), out = raw.map(Math.floor), left = total - out.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (x, i) { return { i: i, f: x - Math.floor(x) }; }).sort(function (a, b) { return b.f - a.f; }).slice(0, left).forEach(function (x) { out[x.i]++; });
    return out;
  }
  /* plan = [{unit, n}] · opts.quota = {단답, 서술}(시험 전체) · 선택 = 나머지 · opts.report 에 모자란 것 */
  function recommend(cards, plan, opts) {
    opts = opts || {}; var r = rng('rec:' + (opts.seed || 'k')), used = {}, stems = {}, out = [], report = opts.report || {};
    (opts.keep || []).forEach(function (id) { used[id] = 1; });
    var qt = opts.quota || {}, ns = plan.map(function (p) { return p.n; });
    var essayBy = share(Math.max(0, +qt['서술'] || 0), ns), shortBy = share(Math.max(0, +qt['단답'] || 0), ns);
    var LV = { '선택': [1, 2, 3, 2, 1, 3, 2], '단답': [2, 1, 3, 2], '서술': [3, 2, 3, 2] };
    plan.forEach(function (p, pi) {
      var pool = cards.filter(function (c) { return c.unit === p.unit && usable(c) && !used[c.id] && (opts.allowPicture || !hasPicture(c.q)); });
      var want = { '서술': Math.min(essayBy[pi], p.n) }; want['단답'] = Math.min(shortBy[pi], p.n - want['서술']); want['선택'] = p.n - want['서술'] - want['단답'];
      var score = function (c) { return (c.q.variant_rule && c.q.variant_rule.alt ? 0 : 2) + (c.tb ? 1 : 0) + (c.kind === 'unit_review' ? -0.5 : 0) + (c.q.kind === 'ox' ? 1 : 0) + r() * 1.5; };
      var take = function (type, n) {
        var cand = pool.filter(function (c) { return typeOf(c.q) === type || type === '*'; }).map(function (c) { return { c: c, s: score(c) }; }).sort(function (a, b) { return a.s - b.s; });
        var got = 0, lv = LV[type] || LV['선택'], k = 0, tries = 0;
        while (got < n && tries < 400) {
          var d = lv[k++ % lv.length]; tries++;
          var pickOne = cand.find(function (x) { var c = x.c; return !used[c.id] && Math.min(c.q.difficulty || 2, 3) === d && !stems[examStem(c.q.stem).slice(0, 24)]; })
            || (tries > lv.length * 2 && cand.find(function (x) { return !used[x.c.id] && !stems[examStem(x.c.q.stem).slice(0, 24)]; }));
          if (!pickOne) { if (tries > lv.length * 3) break; continue; }
          used[pickOne.c.id] = 1; stems[examStem(pickOne.c.q.stem).slice(0, 24)] = 1; out.push(pickOne.c); got++;
        }
        return got;
      };
      ['서술', '단답', '선택'].forEach(function (t) {
        var got = take(t, want[t]);
        if (got < want[t]) { report[t] = (report[t] || 0) + (want[t] - got); var more = take(t === '선택' ? '*' : '선택', want[t] - got); if (more < want[t] - got) take('*', want[t] - got - more); }
      });
    });
    /* 단원 안에서 선택 → 단답 → 서술, 같은 갈래는 쉬운 것부터 */
    var TR = { '선택': 0, '단답': 10, '서술': 20 }, rank = function (c) { return TR[typeOf(c.q)] + (c.q.difficulty || 2); };
    var unitOrder = plan.map(function (p) { return p.unit; });
    out.sort(function (a, b) { return (unitOrder.indexOf(a.unit) - unitOrder.indexOf(b.unit)) || (rank(a) - rank(b)); });
    opts.report = report;
    return out;
  }
  /* 단원별 갈래마다 쓸 수 있는 문항 수 */
  function countTypes(cards, units) {
    var o = { '선택': 0, '단답': 0, '서술': 0 };
    cards.forEach(function (c) { if (units.indexOf(c.unit) >= 0 && usable(c)) o[typeOf(c.q)]++; });
    return o;
  }

  /* 같은 단원·난이도에서 다른 문항 하나 */
  function swapCandidate(cards, item, takenIds, seed) {
    var r = rng('swap:' + seed + ':' + item.id), tk = {}; takenIds.forEach(function (x) { tk[x] = 1; });
    var pool = cards.filter(function (c) { return c.unit === item.unit && usable(c) && !tk[c.id] && typeOf(c.q) === item.type && Math.min(c.q.difficulty, 3) === Math.min(item.difficulty, 3); });
    if (!pool.length) pool = cards.filter(function (c) { return c.unit === item.unit && usable(c) && !tk[c.id] && typeOf(c.q) === item.type; });
    return pool.length ? pool[Math.floor(r() * pool.length)] : null;
  }

  /* 단원별 교과서 쪽수 범위 */
  function pageRange(items, unit) {
    var ps = []; items.forEach(function (it) { if (it.unit === unit) ps = ps.concat(it.pages || []); });
    if (!ps.length) return '';
    var lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps);
    return lo === hi ? String(lo) : lo + '-' + hi;
  }

  return {
    CIRC: CIRC, SUBJ_KO: SUBJ_KO, DIFF_KO: DIFF_KO,
    rng: rng, hash: hash, shuffle: shuffle,
    stripTags: stripTags, examEnding: examEnding, declarative: declarative, examStem: examStem, bookPages: bookPages,
    splitMath: splitMath, plain: plain, assetBox: assetBox, hasPicture: hasPicture,
    cardsOf: cardsOf, usable: usable, variantOf: variantOf, fifthOption: fifthOption, toItem: toItem, wrongPool: wrongPool,
    recommend: recommend, countTypes: countTypes, typeOf: typeOf, swapCandidate: swapCandidate, pageRange: pageRange
  };
});
