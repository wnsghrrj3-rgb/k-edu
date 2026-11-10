/* 모양 알아보기 — 손으로 그린 선 → 'circle' | 'triangle' | 'square' | null
 * 1학년 아이 그림은 삐뚤다: 꼭짓점(뾰족한 곳) 수 + 둥근 정도(원형도)를 함께 본다. */
(function(g){
  function resample(pts, n){ const d = []; let L = 0; for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y); d.push(s); L += s; }
    if (L < 1) return null; const step = L / n, out = [{ x: pts[0].x, y: pts[0].y }]; let acc = 0, i = 1, prev = { x: pts[0].x, y: pts[0].y };
    while (i < pts.length && out.length < n) { const cur = pts[i], s = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      if (acc + s >= step) { const t = (step - acc) / s, q = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) }; out.push(q); prev = q; acc = 0; } else { acc += s; prev = cur; i++; } }
    while (out.length < n) out.push({ ...pts[pts.length - 1] }); return { pts: out, L }; }
  function classify(raw){
    if (!raw || raw.length < 8) return null;
    // 끝과 시작 사이 틈: 크면 닫힌 모양이 아님(그래도 너그럽게)
    const xs = raw.map(p => p.x), ys = raw.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY, size = Math.max(w, h);
    if (size < 50) return null;
    const gap = Math.hypot(raw[0].x - raw[raw.length - 1].x, raw[0].y - raw[raw.length - 1].y);
    if (gap > size * .7) return null;
    const closed = raw.concat([raw[0]]);
    const r = resample(closed, 96); if (!r) return null; const P = r.pts, N = P.length;
    // 너무 길게 덧칠하면(같은 자리 여러 바퀴) 둘레가 커진다 — 한 바퀴만
    // 매끈하게(손 떨림 걸러 내기) — 둥근 정도도 매끈한 선으로 잰다
    const S = P.map((p, i) => { let x = 0, y = 0; for (let k = -3; k <= 3; k++) { const q = P[(i + k + N) % N]; x += q.x; y += q.y; } return { x: x / 7, y: y / 7 }; });
    let A = 0, L = 0; for (let i = 0; i < N; i++) { const a = S[i], b = S[(i + 1) % N]; A += a.x * b.y - b.x * a.y; L += Math.hypot(b.x - a.x, b.y - a.y); } A = Math.abs(A) / 2;
    const circ = 4 * Math.PI * A / (L * L);
    if (circ < .2) return null;          // 납작한 선·지그재그
    // 꺾인 정도(turning angle) — 앞뒤 k칸 벡터 사이 각
    const K = 6, turn = S.map((p, i) => { const a = S[(i - K + N) % N], b = S[(i + K) % N]; const v1 = Math.atan2(p.y - a.y, p.x - a.x), v2 = Math.atan2(b.y - p.y, b.x - p.x); let d = Math.abs(v2 - v1); if (d > Math.PI) d = 2 * Math.PI - d; return d; });
    const TH = .85;                       // 약 50° 넘게 꺾이면 꼭짓점 후보
    const corners = [];
    for (let i = 0; i < N; i++) { if (turn[i] < TH) continue; let isMax = true; for (let k = -K; k <= K; k++) { if (k && turn[(i + k + N) % N] > turn[i]) { isMax = false; break; } } if (isMax) corners.push(i); }
    // 너무 붙은 꼭짓점 합치기
    const cs = []; for (const c of corners) { if (cs.length && (c - cs[cs.length - 1]) < N / 12) continue; cs.push(c); }
    if (cs.length > 1 && (cs[0] + N - cs[cs.length - 1]) < N / 12) cs.pop();
    const total = turn.reduce((s, t) => s + t, 0) / K;   // 고르게 도는 동그라미는 꼭짓점이 없다
    let kind = null, n = cs.length;
    const sharp = cs.length ? cs.reduce((s, i) => s + turn[i], 0) / cs.length : 0;
    if (n <= 1 || (circ > .82 && sharp < 1.1)) kind = 'circle';
    else if (n === 2) kind = circ > .6 ? 'circle' : 'triangle';
    else if (n === 3) kind = 'triangle';
    else if (n === 4) kind = 'square';
    else kind = circ > .74 ? 'circle' : (n === 5 ? 'square' : 'circle');
    // 꼭짓점 위치(원래 크기) — 세모·네모는 아이가 그린 꼭짓점을 그대로 살린다
    let verts = cs.map(i => P[i]);
    if (kind === 'triangle' && verts.length !== 3) verts = pickFar(P, 3);
    if (kind === 'square' && verts.length !== 4) verts = pickFar(P, 4);
    const cx = P.reduce((s, p) => s + p.x, 0) / N, cy = P.reduce((s, p) => s + p.y, 0) / N;
    return { kind, cx, cy, w, h, size, circ, corners: n, verts, pts: P };
  }
  // 무게중심에서 먼 점 n개(각도 고르게)
  function pickFar(P, n){ const cx = P.reduce((s, p) => s + p.x, 0) / P.length, cy = P.reduce((s, p) => s + p.y, 0) / P.length; const out = [];
    for (let k = 0; k < n; k++) { let best = null, bd = -1; for (const p of P) { const ang = Math.atan2(p.y - cy, p.x - cx); if (out.some(q => { let d = Math.abs(Math.atan2(q.y - cy, q.x - cx) - ang); if (d > Math.PI) d = 2 * Math.PI - d; return d < Math.PI / n * .9; })) continue; const dd = Math.hypot(p.x - cx, p.y - cy); if (dd > bd) { bd = dd; best = p; } } if (best) out.push(best); }
    out.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)); return out; }
  g.ShapeRecog = { classify };
  if (typeof module !== 'undefined') module.exports = { classify };
})(typeof window !== 'undefined' ? window : globalThis);
