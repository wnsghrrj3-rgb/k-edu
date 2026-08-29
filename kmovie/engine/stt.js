/* ============================================================
   케이무비 받아쓰기 (KMV_STT) — whisper 구간 → 자막 카드
   ------------------------------------------------------------
   껍데기(whisper.cpp)가 원본(프록시 오디오) 전체를 받아쓴 구간
   [{t0,t1,text}] (초, 원본 시간축) 을 받아,
   1) tidy: 잡음 표기 제거 · 짧은 조각 이웃에 합치기 · 긴 문장 나누기
   2) build: 실제로 들리는 소리(A1 카드)의 원본 구간과 겹치는 부분만
      타임라인 프레임으로 옮겨 자막 카드 [{text,at,dur}] 로.
   순수 계산만 — DOM·타이머·프로젝트 접촉 0 (결정적, 어디서나 테스트).
   ============================================================ */
(function (g) {
  'use strict';

  const MIN_SEC = 0.6;      // 이보다 짧은 조각은 이웃에 합침
  const JOIN_GAP = 0.35;    // 합칠 수 있는 이웃과의 최대 틈 (초)
  const MAX_CHARS = 36;     // 이보다 길면 나눔 (두 줄 자동 줄바꿈이 감당하는 선)
  const MIN_OVERLAP = 0.2;  // 클립과 이만큼(초)도 안 겹치면 버림

  const plain = t => String(t == null ? '' : t).replace(/\{([^{}]*)\}/g, '$1');

  /* 문구 다듬기: 앞뒤 공백·♪·꾸밈 제거, 속공백 정리 */
  function clean(text) {
    return String(text == null ? '' : text)
      .replace(/\s+/g, ' ')
      .replace(/^[\s♪♬\-–—·.]+|[\s♪♬\-–—·]+$/g, '')
      .trim();
  }
  /* [음악]·(박수)·【웃음】 같은 잡음 표기만 있는 구간인가 */
  function noiseOnly(text) {
    const t = text.trim();
    if (!t) return true;
    if (/^[\[\(【〈<].*[\]\)】〉>]$/.test(t)) return true;
    if (!/[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ]/.test(t)) return true;   // 글자가 하나도 없음 (문장부호뿐)
    return false;
  }

  /* 긴 문장 → 가운데에 가장 가까운 공백에서 나누고, 시간은 글자 수 비례로 */
  function splitLong(seg, out) {
    const p = plain(seg.text);
    if (p.length <= MAX_CHARS) { out.push(seg); return; }
    const mid = seg.text.length / 2;
    let cut = -1, best = Infinity;
    for (let i = 1; i < seg.text.length - 1; i++) {
      if (seg.text[i] !== ' ') continue;
      const d = Math.abs(i - mid);
      if (d < best) { best = d; cut = i; }
    }
    if (cut < 0) cut = Math.floor(seg.text.length / 2);          // 공백이 없으면 글자 절반
    const a = clean(seg.text.slice(0, cut)), b = clean(seg.text.slice(cut));
    if (!a || !b) { out.push(seg); return; }
    const k = plain(a).length / (plain(a).length + plain(b).length);
    const tm = seg.t0 + (seg.t1 - seg.t0) * k;
    splitLong({ t0: seg.t0, t1: tm, text: a }, out);
    splitLong({ t0: tm, t1: seg.t1, text: b }, out);
  }

  /* whisper 원 구간 → 다듬은 구간 (원본 시간축 유지) */
  function tidy(segs) {
    let list = (segs || [])
      .map(s => ({ t0: +s.t0 || 0, t1: +s.t1 || 0, text: clean(s.text) }))
      .filter(s => s.t1 > s.t0 && s.text && !noiseOnly(s.text))
      .sort((a, b) => a.t0 - b.t0);

    /* 짧은 조각을 이웃에 합침 (앞이 우선, 틈이 좁을 때만) */
    const merged = [];
    for (const s of list) {
      const prev = merged[merged.length - 1];
      const short = (s.t1 - s.t0) < MIN_SEC;
      if (short && prev && (s.t0 - prev.t1) < JOIN_GAP && plain(prev.text).length + plain(s.text).length <= MAX_CHARS) {
        prev.text = clean(prev.text + ' ' + s.text);
        prev.t1 = Math.max(prev.t1, s.t1);
        continue;
      }
      merged.push(s);
    }
    /* 남은 짧은 조각을 뒤 이웃 앞에 붙임 */
    for (let i = merged.length - 2; i >= 0; i--) {
      const s = merged[i], next = merged[i + 1];
      if ((s.t1 - s.t0) < MIN_SEC && (next.t0 - s.t1) < JOIN_GAP && plain(s.text).length + plain(next.text).length <= MAX_CHARS) {
        next.text = clean(s.text + ' ' + next.text);
        next.t0 = Math.min(next.t0, s.t0);
        merged.splice(i, 1);
      }
    }
    /* 긴 문장 나누기 + 겹침 정리 */
    const out = [];
    for (const s of merged) splitLong(s, out);
    for (let i = 1; i < out.length; i++) if (out[i].t0 < out[i - 1].t1) out[i].t0 = out[i - 1].t1;
    return out.filter(s => s.t1 > s.t0);
  }

  /* 원본 구간 → 자막 카드.
     segsByMedia: { mediaId: tidy 된 구간 }
     ranges: 실제 들리는 소리 자리 [{ media, mfps, in, out, at, dur }]
             (in/out 원본 프레임 @ mfps · at/dur 타임라인 프레임 @ FPS — A1 카드 모양)
     반환: [{ text, at, dur }] (타임라인 프레임, at 순) */
  function build(segsByMedia, ranges, FPS) {
    const minDur = Math.max(1, FPS / 3 | 0);
    const cards = [];
    for (const r of ranges || []) {
      const segs = (segsByMedia && segsByMedia[r.media]) || [];
      const span = r.out - r.in;
      if (!(span > 0) || !(r.dur > 0) || !(r.mfps > 0)) continue;
      for (const s of segs) {
        const f0 = s.t0 * r.mfps, f1 = s.t1 * r.mfps;
        const o0 = Math.max(f0, r.in), o1 = Math.min(f1, r.out);
        if (o1 - o0 < MIN_OVERLAP * r.mfps) continue;            // 컷에 걸쳐 살짝만 남은 꼬리는 버림
        const at = r.at + (o0 - r.in) / span * r.dur;
        const dur = (o1 - o0) / span * r.dur;
        cards.push({ text: s.text, at: Math.max(0, Math.round(at)), dur: Math.max(minDur, Math.round(dur)) });
      }
    }
    cards.sort((a, b) => a.at - b.at || a.dur - b.dur);
    /* 같은 문구가 맞닿아 이어지면 하나로 (한 문장이 분할 지점에 걸렸던 것) */
    const out = [];
    for (const c of cards) {
      const prev = out[out.length - 1];
      if (prev && prev.text === c.text && c.at <= prev.at + prev.dur + 2) {
        prev.dur = Math.max(prev.dur, c.at + c.dur - prev.at);
        continue;
      }
      /* 같은 원본 구간을 두 클립이 겹쳐 쓴 완전 중복은 버리지 않음 — 화면에 그대로 두 번 나오는 게 맞다 */
      out.push(Object.assign({}, c));
    }
    return out;
  }

  g.KMV_STT = { tidy, build, MIN_SEC, JOIN_GAP, MAX_CHARS, MIN_OVERLAP };
})(typeof window !== 'undefined' ? window : globalThis);
