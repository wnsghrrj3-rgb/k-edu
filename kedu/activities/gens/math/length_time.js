/* gens/math/length_time.js — 길이와 시간 (3학년 수학 5단원)
 * 순수 함수·DOM 무관 (§9-3). 선다 대결·활동지 공유.
 *
 * params: { qmode: 'len'|'time'|'mix', est: 0|1 }
 *   qmode  len 길이만 / time 시간만 / mix 섞기
 *   est    1이면 어림·단위 고르기(len_estimate)를 섞는다
 * type (§21-3 확정): mm_cm · km_m · len_estimate · min_sec · time_add · time_sub · span
 *
 * ★ 이 단원의 정체 = **길이는 십진(10·1000)이고 시간은 60진법이다.**
 *   아이가 길이 환산을 다 맞히면서 시간에서 무너지는 것이 정상이고, 그게 진단이다.
 *   그래서 qmode로 두 축을 가를 수 있어야 한다 — 한 칸에 섞어두면 어디서 무너지는지 사라진다.
 *
 * ★ 오답 선택지 = 전형적 오류값 (#11 add_sub_3digit이 세운 규약). 이 단원의 오류값은
 *   차시 원본과 지도서에 실명으로 있다:
 *     "1분 25초 → 125초"    (자리를 이어 씀 — 60진법을 십진으로 읽음)
 *     "2km 63m → 263m"      (1000의 자릿수를 100으로 봄 — cm·mm에는 안 나타난다)
 *     "2분 80초"            (60이 넘었는데 받아올림을 안 함 — l07 본문 표기)
 *     "빌린 자리를 안 줄임"  (받아내림 — l08)
 *     끝난 **시각**을 걸린 **시간**으로 답함 (span — 이 단원 최대 오개념)
 *
 * 차시 근거(실측 2026-08-21): l02 cm보다 작은 단위 / l03 mm·cm 어림 / l04 m보다 큰 단위 /
 *   l05 m·km 어림 / l06 분보다 작은 단위 / l07 시간의 덧셈 / l08 시간의 뺄셈.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['length_time'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  /* §6-10 4·5항 — 조사 판정은 core/ko.js 한 곳에서. 못 찾으면 소리 내어 실패한다. */
  var KO = (typeof module === 'object' && module.exports)
    ? require('../../core/ko.js')
    : root.KEDU_KO;
  if (!KO) throw new Error('[gen] core/ko.js 가 먼저 로드돼야 합니다 (설계 §6-10 5항)');

  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  // ── 표기 ──────────────────────────────────────────────────────────
  // 단위가 여럿인 답은 항상 "큰 단위부터, 0인 자리는 생략". 교과서 표기 그대로다.
  function fmtLen(big, small, ub, us) {
    if (big && small) return big + ub + ' ' + small + us;
    if (big) return big + ub;
    return small + us;
  }
  function fmtTime(t) {                       // {h,m,s} — 0인 자리는 안 쓴다
    var out = [];
    if (t.h) out.push(t.h + '시간');
    if (t.m) out.push(t.m + '분');
    if (t.s) out.push(t.s + '초');
    return out.length ? out.join(' ') : '0초';
  }
  function fmtClock(t) {                      // 시각 — 시는 항상 쓴다 (0분이어도 "3시")
    var out = [t.h + '시'];
    if (t.m) out.push(t.m + '분');
    if (t.s) out.push(t.s + '초');
    return out.join(' ');
  }
  // 조사 — 표기가 '분(받침 O)·초(X)·시간(O)·m(X)·km(X)'로 끝나 매번 갈린다.
  // 문항 문장은 아이가 소리 내어 읽는 것이라 조사가 틀리면 그 자체로 판독을 방해한다 (§6-3).
  function josa(word, withJ, without) {
    var c = String(word).trim().slice(-1);
    var code = c.charCodeAt(0), has;
    if (code >= 0xAC00 && code <= 0xD7A3) has = ((code - 0xAC00) % 28) !== 0;
    else has = '1367890'.indexOf(c) >= 0;   // 숫자는 읽는 소리 기준(1 일·3 삼·6 육·7 칠·8 팔·9 구·0 영).
    // 단위는 전부 '…미터'로 읽혀 받침이 없다 — mm·cm·m·km 모두 '는'이다.
    return word + (has ? withJ : without);
  }
  var eun = function (w) { return josa(w, '은', '는'); };

  var toSec = function (t) { return (t.h || 0) * 3600 + (t.m || 0) * 60 + (t.s || 0); };
  function fromSec(v) { return { h: Math.floor(v / 3600), m: Math.floor(v / 60) % 60, s: v % 60 }; }

  // ── 선택지 조립 (공통) ────────────────────────────────────────────
  // 전형적 오류값을 먼저 넣고, 모자라면 흔들기로 채운다. 정답 위치는 섞는다.
  function options(ans, wrongs, filler, rng) {
    var opts = [ans];
    wrongs.forEach(function (w) {
      if (w && w !== ans && opts.indexOf(w) < 0 && opts.length < 4) opts.push(w);
    });
    var guard = 0;
    while (opts.length < 4 && guard++ < 60) {
      var f = filler(rng);
      if (f && f !== ans && opts.indexOf(f) < 0) opts.push(f);
    }
    for (var i = opts.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), x = opts[i]; opts[i] = opts[j]; opts[j] = x;
    }
    return opts;
  }

  // ── 길이: cm ↔ mm (l02) ───────────────────────────────────────────
  function makeMmCm(rng) {
    var c = ri(rng, 2, 19), m = ri(rng, 1, 9), total = c * 10 + m;
    if (rng() < 0.5) {
      // 큰 단위 → 작은 단위
      return {
        type: 'mm_cm', kind: 'conv',
        left: fmtLen(c, m, 'cm', 'mm'), rel: '1cm = 10mm',
        prompt: eun(fmtLen(c, m, 'cm', 'mm')) + ' 몇 mm일까요?',
        answer: total + 'mm',
        wrongs: [
          c + '' + String(m).padStart(2, '0') + 'mm',   // 자리를 이어 씀 (7cm3mm → 703mm)
          (total * 10) + 'mm',                          // 10을 한 번 더 곱함
          (c + m) + 'mm'                                // 그냥 더함
        ],
        filler: function (r) { return (total + ri(r, -3, 3) * 10) + 'mm'; },
        explain: c + 'cm는 10mm씩 ' + c + '묶음이니까 ' + (c * 10) + 'mm예요. 남은 ' + m +
                 'mm를 더하면 ' + total + 'mm.'
      };
    }
    // 작은 단위 → 큰 단위
    return {
      type: 'mm_cm', kind: 'conv',
      left: total + 'mm', rel: '10mm = 1cm',
      prompt: eun(total + 'mm') + ' 몇 cm 몇 mm일까요?',
      answer: fmtLen(c, m, 'cm', 'mm'),
      wrongs: [
        fmtLen(m, c, 'cm', 'mm'),        // 자리를 바꿔 읽음
        fmtLen(c, m * 10, 'cm', 'mm'),   // 남은 자리에 0을 덧붙임
        fmtLen(total, 0, 'cm', 'mm')     // 단위만 갈아 끼움
      ],
      filler: function (r) { return fmtLen(c + ri(r, -2, 2), ri(r, 1, 9), 'cm', 'mm'); },
      explain: total + 'mm에서 10mm씩 묶으면 ' + c + '묶음이 나오고 ' + m +
               'mm가 남아요. 그래서 ' + fmtLen(c, m, 'cm', 'mm') + '.'
    };
  }

  // ── 길이: km ↔ m (l04) ────────────────────────────────────────────
  // mm_cm과 가르는 이유: 지도서가 뽑은 오류가 서로 다르다. 1000의 자릿수 오류
  // (2km 63m → 263m)는 10진 한 칸짜리인 cm·mm에는 나타날 수가 없다.
  function makeKmM(rng) {
    var k = ri(rng, 1, 9);
    var m = pick(rng, [ri(rng, 1, 99), ri(rng, 100, 999)]);   // 세 자리 미만이 오류의 자리다
    var total = k * 1000 + m;
    if (rng() < 0.5) {
      return {
        type: 'km_m', kind: 'conv',
        left: fmtLen(k, m, 'km', 'm'), rel: '1km = 1000m',
        prompt: eun(fmtLen(k, m, 'km', 'm')) + ' 몇 m일까요?',
        answer: total + 'm',
        wrongs: [
          (k * 100 + m) + 'm',                 // ★ 1000을 100으로 — 지도서 실명 오류 (2km63m→263m)
          (k * 1000 + m * 10) + 'm',           // 남은 자리에 0을 덧붙임
          (k + m) + 'm'
        ],
        filler: function (r) { return (total + ri(r, 1, 9) * 100) + 'm'; },
        explain: '1km가 1000m니까 ' + k + 'km는 ' + (k * 1000) + 'm예요. 남은 ' + m +
                 'm를 더해서 ' + total + 'm. 1000은 자리가 **세 칸**이라는 걸 잊지 마세요.'
      };
    }
    return {
      type: 'km_m', kind: 'conv',
      left: total + 'm', rel: '1000m = 1km',
      prompt: eun(total + 'm') + ' 몇 km 몇 m일까요?',
      answer: fmtLen(k, m, 'km', 'm'),
      wrongs: [
        fmtLen(k, m * 10, 'km', 'm'),
        fmtLen(k * 10, m, 'km', 'm'),
        fmtLen(m, k, 'km', 'm')
      ],
      filler: function (r) { return fmtLen(k + ri(r, 1, 3), ri(r, 1, 999), 'km', 'm'); },
      explain: total + 'm를 1000m씩 묶으면 ' + k + '묶음, 남은 것이 ' + m + 'm예요. 그래서 ' +
               fmtLen(k, m, 'km', 'm') + '.'
    };
  }

  // ── 길이: 어림·알맞은 단위 (l03·l05) ──────────────────────────────
  // 계산이 아니라 **판단**을 묻는다. 수는 주고 단위만 고르게 한다 —
  // 그래야 "얼마쯤인지 몸으로 아는가"가 드러난다.
  var THINGS = [
    { t: '색연필의 길이', n: 12, u: 'cm' },
    { t: '한 뼘의 길이', n: 15, u: 'cm' },
    { t: '지우개의 두께', n: 9, u: 'mm' },
    { t: '동전의 두께', n: 2, u: 'mm' },
    { t: '교실 문의 높이', n: 2, u: 'm' },
    { t: '칠판의 긴 쪽', n: 4, u: 'm' },
    { t: '학교 운동장 한 바퀴', n: 200, u: 'm' },
    { t: '한라산의 높이', n: 1950, u: 'm' },
    { t: '학교에서 시청까지의 거리', n: 3, u: 'km' },
    { t: '서울에서 부산까지의 거리', n: 400, u: 'km' }
  ];
  function makeLenEst(rng) {
    var o = pick(rng, THINGS);
    var all = ['mm', 'cm', 'm', 'km'];
    return {
      type: 'len_estimate', kind: 'unit',
      left: o.t, rel: '얼마쯤일까요?', num: o.n,
      prompt: eun(o.t) + ' 약 ' + o.n + ' — 알맞은 단위는 무엇일까요?',
      answer: o.u,
      wrongs: all.filter(function (u) { return u !== o.u; }),
      filler: function () { return null; },
      explain: KO.j(o.t, '은/는') + ' 약 ' + o.n + o.u + '쯤이에요. 어림할 때는 앞에 **약**을 붙여 말해요.'
    };
  }

  // ── 시간: 분 ↔ 초 (l06) ───────────────────────────────────────────
  function makeMinSec(rng) {
    var m = ri(rng, 1, 6), s = ri(rng, 5, 55), total = m * 60 + s;
    if (rng() < 0.5) {
      return {
        type: 'min_sec', kind: 'conv',
        left: m + '분 ' + s + '초', rel: '1분 = 60초',
        prompt: eun(m + '분 ' + s + '초') + ' 몇 초일까요?',
        answer: total + '초',
        wrongs: [
          m + '' + String(s).padStart(2, '0') + '초',   // ★ 자리를 이어 씀 — 1분 25초 → 125초
          (m * 100 + s) + '초',
          (m * 10 + s) + '초'
        ],
        filler: function (r) { return (total + ri(r, 1, 5) * 10) + '초'; },
        explain: '1분이 60초니까 ' + m + '분은 ' + (m * 60) + '초예요. 남은 ' + s +
                 '초를 더하면 ' + total + '초. 시간은 10씩이 아니라 **60씩** 묶여요.'
      };
    }
    return {
      type: 'min_sec', kind: 'conv',
      left: total + '초', rel: '60초 = 1분',
      prompt: eun(total + '초') + ' 몇 분 몇 초일까요?',
      answer: m + '분 ' + s + '초',
      wrongs: [
        (m - 1 > 0 ? (m - 1) + '분 ' + (s + 60) + '초' : (m + 1) + '분 ' + s + '초'),  // 받아올림을 덜 함
        Math.floor(total / 10) + '분 ' + (total % 10) + '초',                          // 10씩 묶음 (십진 착각)
        s + '분 ' + m + '초'
      ],
      filler: function (r) { var mm = m + ri(r, -1, 2); return (mm > 0 ? mm : m + 2) + '분 ' + ri(r, 1, 59) + '초'; },
      explain: total + '초를 60씩 묶으면 ' + m + '묶음이 나오고 ' + s + '초가 남아요. 그래서 ' +
               m + '분 ' + s + '초.'
    };
  }

  // ── 시간의 덧셈 (l07) ─────────────────────────────────────────────
  function makeTimeAdd(rng) {
    var withH = rng() < 0.5;
    var carry = rng() < 0.7;                 // 받아올림이 이 차시의 학습요소다 — 기본으로 켠다
    var a, b;
    if (withH) {
      a = { h: ri(rng, 1, 4), m: ri(rng, 10, 45), s: 0 };
      b = { h: ri(rng, 1, 3), s: 0,
            m: carry ? ri(rng, 60 - a.m, 59) : ri(rng, 5, 59 - a.m) };
    } else {
      a = { h: 0, m: ri(rng, 1, 5), s: ri(rng, 10, 50) };
      b = { h: 0, m: ri(rng, 1, 4), s: carry ? ri(rng, 60 - a.s, 59) : ri(rng, 1, 59 - a.s) };
    }
    var sum = fromSec(toSec(a) + toSec(b));
    // 받아올림을 안 한 값 = 60이 넘은 채로 남긴 표기 (l07 본문의 "2분 80초")
    var raw = null;
    if (withH) {
      if (a.m + b.m >= 60) raw = (a.h + b.h) + '시간 ' + (a.m + b.m) + '분';
    } else if (a.s + b.s >= 60) raw = (a.m + b.m) + '분 ' + (a.s + b.s) + '초';
    return {
      type: 'time_add', kind: 'vert', unitH: withH,
      a: a, b: b, op: '+', res: sum,
      prompt: fmtTime(a) + ' + ' + eun(fmtTime(b)) + ' 얼마일까요?',
      answer: fmtTime(sum),
      wrongs: [
        raw,                                                    // ★ 받아올림을 안 함
        fmtTime(fromSec(toSec(a) + toSec(b) + (withH ? 3600 : 60))),   // 받아올림을 두 번 함
        fmtTime(fromSec(toSec(a) + toSec(b) - (withH ? 3600 : 60)))
      ],
      filler: function (r) { return fmtTime(fromSec(toSec(sum) + ri(r, 1, 5) * (withH ? 60 : 1))); },
      explain: '같은 단위끼리 더해요. ' + (withH
        ? (a.m + '분 + ' + b.m + '분 = ' + (a.m + b.m) + '분' +
           (a.m + b.m >= 60 ? ' → 60분이 넘었으니 1시간으로 **받아올림**! ' : ' → '))
        : (a.s + '초 + ' + b.s + '초 = ' + (a.s + b.s) + '초' +
           (a.s + b.s >= 60 ? ' → 60초가 넘었으니 1분으로 **받아올림**! ' : ' → '))) +
        '답은 ' + KO.ida(fmtTime(sum)) + '.'
    };
  }

  // ── 시간의 뺄셈 (l08) ─────────────────────────────────────────────
  function makeTimeSub(rng) {
    var withH = rng() < 0.5;
    var borrow = rng() < 0.7;
    var a, b;
    if (withH) {
      a = { h: ri(rng, 3, 8), m: borrow ? ri(rng, 5, 30) : ri(rng, 35, 55), s: 0 };
      b = { h: ri(rng, 1, 2), m: borrow ? ri(rng, a.m + 5, 55) : ri(rng, 5, a.m - 5), s: 0 };
    } else {
      a = { h: 0, m: ri(rng, 3, 8), s: borrow ? ri(rng, 5, 30) : ri(rng, 35, 55) };
      b = { h: 0, m: ri(rng, 1, 2), s: borrow ? ri(rng, a.s + 5, 55) : ri(rng, 5, a.s - 5) };
    }
    var diff = fromSec(toSec(a) - toSec(b));
    // ★ 빌려 왔는데 빌린 자리를 안 줄인 값 (l08 지도서 실명 오류)
    var noDec = null;
    if (withH && a.m < b.m) noDec = fmtTime({ h: a.h - b.h, m: a.m + 60 - b.m, s: 0 });
    if (!withH && a.s < b.s) noDec = fmtTime({ h: 0, m: a.m - b.m, s: a.s + 60 - b.s });
    // 큰 수에서 작은 수를 뺀 값 (자리마다 절댓값) — 받아내림 자체를 피한 오류
    var absW = withH ? fmtTime({ h: a.h - b.h, m: Math.abs(a.m - b.m), s: 0 })
                     : fmtTime({ h: 0, m: a.m - b.m, s: Math.abs(a.s - b.s) });
    return {
      type: 'time_sub', kind: 'vert', unitH: withH,
      a: a, b: b, op: '−', res: diff,
      prompt: fmtTime(a) + ' − ' + eun(fmtTime(b)) + ' 얼마일까요?',
      answer: fmtTime(diff),
      wrongs: [noDec, absW, fmtTime(fromSec(toSec(a) - toSec(b) + (withH ? 3600 : 60)))],
      filler: function (r) { return fmtTime(fromSec(toSec(diff) + ri(r, 1, 5) * (withH ? 60 : 1))); },
      explain: '같은 단위끼리 빼요. ' + (withH
        ? (a.m < b.m ? a.m + '분에서 ' + b.m + '분을 뺄 수 없으니 1시간을 60분으로 **빌려 와요** — 빌려 준 시간 자리는 ' +
           a.h + '에서 ' + (a.h - 1) + '로 **줄어듭니다**. ' : '')
        : (a.s < b.s ? a.s + '초에서 ' + b.s + '초를 뺄 수 없으니 1분을 60초로 **빌려 와요** — 빌려 준 분 자리는 ' +
           a.m + '에서 ' + (a.m - 1) + '로 **줄어듭니다**. ' : '')) +
        '답은 ' + KO.ida(fmtTime(diff)) + '.'
    };
  }

  // ── 시각과 시간 (l07·l08 관통) ────────────────────────────────────
  // 이 단원 최대 오개념. 계산 유형에 섞으면 진단이 사라진다 —
  // **두 계산을 다 맞히면서도 시각과 시간을 구별 못 하는 아이**가 표적이다.
  function makeSpan(rng) {
    var start = { h: ri(rng, 1, 8), m: pick(rng, [0, 10, 15, 20, 30, 40, 45, 50]), s: 0 };
    var dur = { h: ri(rng, 1, 3), m: pick(rng, [0, 10, 15, 20, 25, 30, 40, 45]), s: 0 };
    var end = fromSec(toSec(start) + toSec(dur));
    if (rng() < 0.5) {
      // (a) 시작 시각 + 걸린 시간 → 끝난 **시각**
      return {
        type: 'span', kind: 'span', ask: 'end',
        start: start, end: end, dur: dur,
        prompt: fmtClock(start) + '에 시작해서 ' + fmtTime(dur) + ' 동안 했어요. 끝난 **시각**은?',
        answer: fmtClock(end),
        wrongs: [
          fmtTime(dur),                                  // ★ 걸린 시간을 시각 자리에 답함
          fmtClock(fromSec(toSec(start) + toSec(dur) + 3600)),
          fmtClock(fromSec(toSec(start) + toSec(dur) - 3600))
        ],
        filler: function (r) { return fmtClock(fromSec(toSec(end) + ri(r, 1, 4) * 600)); },
        explain: '**시각**을 물었어요. 시작 시각 ' + fmtClock(start) + '에 걸린 시간 ' + fmtTime(dur) +
                 '을 더하면 ' + KO.ida(fmtClock(end)) + '.'
      };
    }
    // (b) 시작~끝 시각 → 걸린 **시간**
    return {
      type: 'span', kind: 'span', ask: 'dur',
      start: start, end: end, dur: dur,
      prompt: fmtClock(start) + '에 시작해서 ' + fmtClock(end) + '에 끝났어요. 걸린 **시간**은?',
      answer: fmtTime(dur),
      wrongs: [
        fmtClock(end),                                   // ★ 끝난 시각을 걸린 시간으로 답함
        fmtTime(fromSec(toSec(dur) + 3600)),             // 양 끝을 다 셈 (한 시간 더)
        fmtTime(fromSec(end.h * 3600 + end.m * 60))      // 끝 시각의 수를 그대로 시간으로 읽음
      ],
      filler: function (r) { return fmtTime(fromSec(toSec(dur) + ri(r, 1, 4) * 600)); },
      explain: '**시간**을 물었어요. 끝난 시각 ' + fmtClock(end) + '에서 시작 시각 ' + fmtClock(start) +
               '을 빼면 ' + KO.ida(fmtTime(dur)) + '. 시각은 **언제**고, 시간은 **얼마 동안**이에요.'
    };
  }

  var LEN = [makeMmCm, makeKmM], TIME = [makeMinSec, makeTimeAdd, makeTimeSub, makeSpan];

  return {
    id: 'length_time',
    title: '길이와 시간',
    create: function (params, rng) {
      var p = params || {};
      var qm = p.qmode || 'mix';
      var estOn = (+p.est === 1);

      return {
        next: function () {
          var pool;
          if (qm === 'len') pool = LEN.slice();
          else if (qm === 'time') pool = TIME.slice();
          else pool = LEN.concat(TIME);
          // 어림은 길이 쪽 유형이다 — 시간만 볼 때는 섞지 않는다.
          if (estOn && qm !== 'time' && rng() < 0.22) pool = [makeLenEst];

          var q = pick(rng, pool)(rng);
          return {
            type: q.type, kind: q.kind, prompt: q.prompt, answer: q.answer,
            left: q.left, rel: q.rel, num: q.num,
            a: q.a, b: q.b, op: q.op, res: q.res, unitH: q.unitH,
            start: q.start, end: q.end, dur: q.dur, ask: q.ask,
            options: options(q.answer, q.wrongs || [], q.filler, rng),
            explain: q.explain
          };
        },
        check: function (pick_, q) { return pick_ === q.answer; }
      };
    },
    printRender: function (q) {
      return '<span class="w-num">' + q.prompt.replace(/\*\*/g, '') + '</span><span class="w-box"> </span>';
    },
    printAnswer: function (q) { return q.answer; },
    printHead: '알맞은 답을 □ 안에 쓰세요.'
  };
}));
