/* ============================================================
   케이무비 자동 편집 (KMV_AUTO) — "노가다" 를 찾아 주는 계산기
   ------------------------------------------------------------
   순수 계산만 — DOM·타이머·프로젝트 접촉 0 (결정적, node 에서도 테스트).
   1) silences  : 음성 구간(A1 voice) 사이의 무음 → 잘라낼 타임라인 구간
   2) timeMap   : 구간을 잘라낸 뒤의 시각 대응(자막·부품·덧영상·마커가 따라오게)
   3) sceneCuts : 원본 프레임 차(diff 원값) 에서 장면 경계(하드 컷) — 한 프레임 솟구침 + 앞뒤 조용
   4) shakes    : 움직임(motion 정규화) 이 오래 높은 구간 — 흔들림·급한 팬 의심
   5) highlights: 움직임 + 소리가 같이 큰 창 — 쓸만한 구간 후보
   6) fillers   : 받아쓴 문장 안의 군소리("어", "음", "그", "저기" …) 위치
   판단은 전부 문턱·창 크기 인자로 열려 있다 — UI 는 프리셋만 고른다.
   ============================================================ */
(function (g) {
  'use strict';

  /* ---------- 1. 무음 ----------
     voice [{at,dur}] (타임라인 프레임, 정렬·비겹침) · total 프레임.
     pad  : 말소리 앞뒤에 남겨 둘 여유(프레임) — 숨·문장 끝 여운
     min  : 이보다 긴 무음만 (여유를 뺀 뒤 기준) — 너무 짧은 무음까지 자르면 말이 붙어 버린다
     edge : 처음·끝 무음도 자르나 (기본 true — 촬영 시작 전 기다리는 시간)
     → [{at,dur}] 잘라낼 구간(정렬·비겹침) */
  function silences(voice, total, o) {
    o = o || {};
    const pad = Math.max(0, Math.round(o.pad == null ? 9 : o.pad)), min = Math.max(1, Math.round(o.min == null ? 24 : o.min)), edge = o.edge !== false;
    const v = (voice || []).map(x => ({ at: Math.max(0, x.at | 0), end: Math.max(0, (x.at | 0) + (x.dur | 0)) })).filter(x => x.end > x.at).sort((a, b) => a.at - b.at);
    const out = [];
    let cur = 0, first = true;
    for (const s of v) {
      const a = cur + (first ? (edge ? 0 : Infinity) : pad), b = s.at - pad;   // 잘라낼 후보 [a,b)
      if (b - a >= min && b > a) out.push({ at: a, dur: b - a });
      cur = Math.max(cur, s.end); first = false;
    }
    if (edge && total > 0) {                                                    // 마지막 말 뒤
      const a = v.length ? cur + pad : 0, b = total;
      if (b - a >= min && b > a && !(v.length === 0 && total < min)) out.push({ at: a, dur: b - a });
    }
    return out.filter(r => r.dur > 0 && r.at < total).map(r => ({ at: r.at, dur: Math.min(r.dur, total - r.at) }));
  }
  const sum = ranges => (ranges || []).reduce((s, r) => s + r.dur, 0);

  /* ---------- 2. 시간 재매핑 ----------
     ranges 를 잘라낸 뒤 옛 시각 t → 새 시각. 잘린 구간 안의 t 는 그 구간 시작으로 붙는다. */
  function timeMap(ranges) {
    const rs = (ranges || []).slice().sort((a, b) => a.at - b.at);
    return t => {
      let cut = 0;
      for (const r of rs) {
        if (t < r.at) break;
        if (t < r.at + r.dur) { cut += t - r.at; break; }
        cut += r.dur;
      }
      return t - cut;
    };
  }
  /* 카드 [{at,dur}] → 잘라낸 뒤. 통째로 잘린 카드는 빠진다(null 아님, 목록에서 제외). keepDur 면 길이는 두고 시작만 옮김(음악). */
  function remapCards(cards, ranges, keepDur) {
    const f = timeMap(ranges), out = [];
    for (const c of cards || []) {
      const a = f(c.at), b = keepDur ? a + c.dur : f(c.at + c.dur);
      if (b - a <= 0) continue;
      out.push(Object.assign({}, c, { at: a, dur: b - a }));
    }
    return out;
  }
  /* 점(마커) — 잘린 구간 안의 점은 사라진다 */
  function remapPoints(pts, ranges) {
    const rs = (ranges || []).slice().sort((a, b) => a.at - b.at), f = timeMap(ranges), out = [];
    for (const p of pts || []) { if (rs.some(r => p.at >= r.at && p.at < r.at + r.dur)) continue; out.push(Object.assign({}, p, { at: f(p.at) })); }
    return out;
  }

  /* ---------- 3. 장면 경계 ----------
     diff: 원본 프레임별 이웃 차(0..1 원값). 하드 컷 = 한 프레임이 홀로 솟는다:
       diff[i] > max(absMin, med*k) 이고 양옆(±1..±3 창)의 최대가 diff[i]*iso 보다 작다(격리).
     빠른 팬·흔들림은 여러 프레임에 걸쳐 높아 격리 조건에 걸린다.
     → 컷 프레임 목록(그 프레임부터 새 장면). 서로 minGap 프레임 안이면 큰 쪽만. */
  function sceneCuts(diff, o) {
    o = o || {};
    const n = diff ? diff.length : 0; if (n < 3) return [];
    const absMin = o.absMin == null ? 0.10 : o.absMin, k = o.k == null ? 5 : o.k, iso = o.iso == null ? 0.45 : o.iso, minGap = o.minGap == null ? 12 : o.minGap, w = o.win == null ? 3 : o.win;
    const sorted = Array.from(diff).sort((a, b) => a - b), med = sorted[sorted.length >> 1] || 0;
    const th = Math.max(absMin, med * k);
    const cuts = [];
    for (let i = 1; i < n; i++) {
      const d = diff[i]; if (!(d > th)) continue;
      let nb = 0;
      for (let j = Math.max(1, i - w); j <= Math.min(n - 1, i + w); j++) if (j !== i && diff[j] > nb) nb = diff[j];
      if (nb > d * iso) continue;                                                // 격리되지 않음(움직임)
      const last = cuts[cuts.length - 1];
      if (last && i - last.i < minGap) { if (d > last.d) cuts[cuts.length - 1] = { i, d }; continue; }
      cuts.push({ i, d });
    }
    return cuts.map(c => c.i);
  }

  /* ---------- 4. 흔들림 ----------
     motion(정규화 0..1) 이 hi 이상으로 minLen 프레임 넘게 이어지면 흔들림·급한 팬 의심.
     gap 프레임 이하의 잠깐 내려앉음은 이어 붙인다. → [{at,dur,peak}] (원본 프레임) */
  function shakes(motion, o) {
    o = o || {};
    const n = motion ? motion.length : 0, hi = o.hi == null ? 0.7 : o.hi, minLen = o.minLen == null ? 15 : o.minLen, gap = o.gap == null ? 6 : o.gap;
    const out = []; let s = -1, peak = 0, low = 0, lastHi = -1;
    const close = () => { const e = lastHi + 1; if (e - s >= minLen) out.push({ at: s, dur: e - s, peak }); s = -1; };
    for (let i = 0; i < n; i++) {
      const v = motion[i];
      if (v >= hi) { if (s < 0) { s = i; peak = 0; } low = 0; lastHi = i; if (v > peak) peak = v; }
      else if (s >= 0 && ++low > gap) close();
    }
    if (s >= 0) close();
    return out;
  }

  /* ---------- 5. 하이라이트 ----------
     창(win 프레임) 안 움직임 평균 × 소리(peaks) 평균이 큰 순으로 top 개, 서로 안 겹치게. → [{at,dur,score}] (원본 프레임) */
  function highlights(motion, peaks, o) {
    o = o || {};
    const n = Math.min(motion ? motion.length : 0, peaks ? peaks.length : Infinity), win = Math.max(2, Math.round(o.win == null ? 60 : o.win)), top = o.top == null ? 5 : o.top;
    if (!n || n < win) return [];
    const pk = Array.from(peaks).slice(0, n), ps = pk.slice().sort((a, b) => a - b), p90 = ps[Math.floor(ps.length * 0.9)] || 1;
    const sc = new Float32Array(n - win + 1);
    let m = 0, a = 0;
    for (let i = 0; i < win; i++) { m += motion[i]; a += Math.min(1, pk[i] / p90); }
    sc[0] = (m / win) * (0.35 + 0.65 * (a / win));
    for (let i = 1; i + win <= n; i++) { m += motion[i + win - 1] - motion[i - 1]; a += Math.min(1, pk[i + win - 1] / p90) - Math.min(1, pk[i - 1] / p90); sc[i] = (m / win) * (0.35 + 0.65 * (a / win)); }
    const order = Array.from(sc.keys()).sort((x, y) => sc[y] - sc[x]);
    const out = [];
    for (const i of order) {
      if (out.length >= top) break;
      if (sc[i] <= 0) break;
      if (out.some(h => i < h.at + h.dur && i + win > h.at)) continue;
      out.push({ at: i, dur: win, score: sc[i] });
    }
    return out.sort((x, y) => x.at - y.at);
  }

  /* ---------- 6. 군소리(필러) ----------
     받아쓴 한국어 문장에서 말버릇을 찾는다. 단어 단위(앞뒤 공백·문장부호) 로만 잡는다 —
     "그 학교"의 "그" 처럼 뜻이 있는 관형사는 못 가려내므로 "표시" 까지만 하고 지우는 건 사람 몫. */
  const FILLERS = ['어', '어어', '음', '음음', '으음', '그', '그그', '저', '저기', '저기요', '이제', '뭐', '뭐지', '뭐랄까', '약간', '막', '아', '에', '에헤', '흠', '아니', '그니까', '그러니까', '그래서', '근데', '자', '네'];
  const FSET = new Set(FILLERS);
  const TOKEN = /[가-힣ㄱ-ㅎㅏ-ㅣ]+|[A-Za-z0-9]+/g;
  function fillers(text) {
    const s = String(text || ''), out = []; let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(s))) {
      const w = m[0];
      if (FSET.has(w) || /^(어|음|으|아|에)\1+$/.test(w)) out.push({ i0: m.index, i1: m.index + w.length, word: w });
    }
    return out;
  }
  /* 군소리·문장부호 뿐인가 (= 통째로 잘라도 되는 조각) */
  function fillerOnly(text) {
    const s = String(text || ''); let m, any = false;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(s))) { any = true; const w = m[0]; if (!(FSET.has(w) || /^(어|음|으|아|에)\1+$/.test(w))) return false; }
    return any;
  }
  /* 군소리를 지운 문장 (표시된 낱말 제거 + 공백 정리) */
  function stripFillers(text) {
    const s = String(text || ''), fs = fillers(s); if (!fs.length) return s.trim();
    let out = '', p = 0;
    for (const f of fs) { out += s.slice(p, f.i0); p = f.i1; }
    out += s.slice(p);
    return out.replace(/\s+/g, ' ').replace(/\s+([,.!?…])/g, '$1').trim();
  }

  g.KMV_AUTO = { silences, sum, timeMap, remapCards, remapPoints, sceneCuts, shakes, highlights, fillers, fillerOnly, stripFillers, FILLERS };
})(typeof window !== 'undefined' ? window : globalThis);
