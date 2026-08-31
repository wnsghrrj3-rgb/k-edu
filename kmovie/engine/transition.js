/* ============================================================
   케이무비 전환 (KMV_TRANSITION) — 설계서 v1 §2-3
   ------------------------------------------------------------
   V 클립 경계에만. 클립 c 의 transIn = { type, dur(프레임), dir }.
   t ∈ [c.at, c.at+dur) 동안 이전 클립(핸들: out 너머 프레임, 없으면 마지막 프레임)과 합성.
   첫 클립의 transIn 은 검정(또는 흰색)에서 시작하는 페이드가 된다.
   목록은 여기서 닫는다(분류별):
   기본     cut · dissolve · dipBlack · dipWhite
   움직임   push(밀기) · cover(덮기) · zoom(줌) · whip(휩 팬)
   닦기     wipe(와이프) · sweep(금선 스윕)
   빛·질감  lightleak(광누출) · blur(블러 디졸브)
   길이 프리셋 3: short 0.3s / normal 0.6s / long 1.0s
   결정적: 같은 (u, type) → 같은 합성.
   ============================================================ */
(function (g) {
  'use strict';
  const CATS = [
    { id: 'base',  name: '기본' },
    { id: 'dip',   name: '딥' },
    { id: 'light', name: '빛·질감' },
    { id: 'move',  name: '움직임' },
    { id: 'wipe',  name: '닦기' },
  ];
  const TYPES = [
    { id: 'cut',       name: '컷',          cat: 'base' },
    { id: 'dissolve',  name: '크로스 디졸브', cat: 'base' },
    { id: 'film',      name: '필름 디졸브',  cat: 'base' },
    { id: 'smooth',    name: '스무스 컷',    cat: 'base' },
    { id: 'dipBlack',  name: '딥 투 블랙',  cat: 'dip' },
    { id: 'dipWhite',  name: '딥 투 화이트', cat: 'dip' },
    { id: 'dipNavy',   name: '딥 투 네이비', cat: 'dip' },
    { id: 'warmDip',   name: '웜 딥',        cat: 'dip' },
    { id: 'exposure',  name: '노출 디졸브',  cat: 'light' },
    { id: 'luma',      name: '루마 와이프',  cat: 'light' },
    { id: 'glow',      name: '글로우 디졸브', cat: 'light' },
    { id: 'dirblur',   name: '방향 블러 디졸브', cat: 'move', dirs: ['ltr', 'rtl', 'ttb', 'btt'] },
    { id: 'push',      name: '밀기',        cat: 'move', dirs: ['ltr', 'rtl', 'ttb', 'btt'] },
    { id: 'cover',     name: '덮기',        cat: 'move', dirs: ['ltr', 'rtl', 'ttb', 'btt'] },
    { id: 'zoom',      name: '줌',          cat: 'move', dirs: ['in', 'out'] },
    { id: 'whip',      name: '휩 팬',       cat: 'move', dirs: ['ltr', 'rtl', 'ttb', 'btt'] },
    { id: 'wipe',      name: '와이프',      cat: 'wipe', dirs: ['ltr', 'rtl', 'ttb', 'btt'] },
    { id: 'sweep',     name: '금선 스윕',   cat: 'wipe', dirs: ['ltr', 'rtl'] },
    { id: 'lightleak', name: '광누출',      cat: 'light' },
    { id: 'blur',      name: '블러 디졸브', cat: 'light' },
  ];
  const DURS = [{ id: 'short', name: '짧게', f: 9 }, { id: 'normal', name: '보통', f: 18 }, { id: 'long', name: '길게', f: 30 }];
  const inOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const inCubic = t => t * t * t, outCubic = t => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  function durFrames(tr) { const d = DURS.find(x => x.id === tr.dur); return d ? d.f : (tr.dur | 0) || 18; }
  /* 클립 c 가 t 에서 전환 중인가 → u(0..1) 또는 null */
  function progress(c, t) {
    if (!c.transIn || c.transIn.type === 'cut') return null;
    const d = Math.min(durFrames(c.transIn), Math.max(1, c.dur));
    const k = t - c.at; if (k < 0 || k >= d) return null;
    return (k + 0.5) / d;
  }

  /* 화면 이동 + 프레임 누적 모션 블러 (휩 팬용). horiz: 이동 축, vel 0..1 */
  function drawShift(ctx, img, W, H, dx, dy, horiz, vel, alpha) {
    const n = 1 + Math.min(10, Math.round(vel * 10)), spread = vel * 0.12 * (horiz ? W : H);
    for (let i = 0; i < n; i++) { ctx.globalAlpha = alpha / (i + 1); const k = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread; ctx.drawImage(img, dx + (horiz ? k : 0), dy + (horiz ? 0 : k)); }   // 1/(i+1) 누적 = 균등 평균
  }

  /* ctx = 현재 클립 프레임(룩 적용됨). prev = 이전 클립 프레임 캔버스(룩 적용됨) 또는 null(검정). */
  function apply(ctx, prev, W, H, u, tr, theme) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
    const type = tr.type, dir = tr.dir || 'ltr';
    const prevOr = (fill) => { if (prev) ctx.drawImage(prev, 0, 0); else { ctx.fillStyle = fill; ctx.fillRect(0, 0, W, H); } };
    switch (type) {
      case 'dissolve': {
        ctx.globalAlpha = 1 - inOutCubic(u); prevOr('#000'); break;
      }
      case 'film': {                                    // 필름 디졸브 — 감마 보정 알파: 겹치는 중간이 어두워지지 않는다
        const e = inOutCubic(u), ga = Math.pow(1 - e, 0.6);
        ctx.globalAlpha = ga; prevOr('#000'); break;
      }
      case 'smooth': {                                  // 스무스 컷 — 짧은 블렌드 + 미세 줌 (점프컷 완화)
        const e = inOutCubic(u), z = 1 + 0.015 * (1 - e);
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
        ctx.globalAlpha = Math.pow(1 - e, 1.4); prevOr('#000'); ctx.restore(); break;
      }
      case 'dipNavy': case 'warmDip': {
        const col = type === 'dipNavy' ? ((theme && theme.primary) || '#0B2545') : '#E8C79A';
        if (u < 0.5) { ctx.globalAlpha = 1; prevOr(col); ctx.globalAlpha = outCubic(u * 2) * (type === 'warmDip' ? 0.92 : 1); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
        else { ctx.globalAlpha = (1 - inCubic((u - 0.5) * 2)) * (type === 'warmDip' ? 0.92 : 1); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
        if (type === 'warmDip') { const fl = Math.pow(Math.max(0, 1 - Math.abs(u - 0.5) / 0.5), 2); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fl * 0.35; ctx.fillStyle = '#fff1d0'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; }
        break;
      }
      case 'exposure': {                                // 노출 디졸브 — 밝아지며 겹침 (lighter 로 더한 뒤 가라앉힘)
        const e = inOutCubic(u), fl = Math.sin(Math.PI * u);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - e) * (1 + fl * 0.5); prevOr('#000');
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = fl * 0.22; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); break;
      }
      case 'luma': {                                    // 루마 와이프 — 이전 클립의 밝은 픽셀부터 다음 클립으로
        const e = inOutCubic(u);
        if (!prev) { ctx.globalAlpha = 1 - e; prevOr('#000'); break; }
        const tmp = apply._tmp4 || (apply._tmp4 = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
        if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
        const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.globalCompositeOperation = 'source-over'; tc.drawImage(prev, 0, 0);
        const id = tc.getImageData(0, 0, W, H), d = id.data, th = e * 1.1, soft = 0.12;      // 밝기 > 문턱이면 새 클립(투명)
        for (let i = 0; i < d.length; i += 4) { const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255; const a = 1 - Math.min(1, Math.max(0, (th - l) / soft + 1)); d[i + 3] = Math.round(255 * Math.max(0, 1 - a)); }
        tc.putImageData(id, 0, 0);
        ctx.globalAlpha = 1; ctx.drawImage(tmp, 0, 0); break;
      }
      case 'glow': {                                    // 글로우 디졸브 — 하이라이트 블룸 + 크로스
        const e = inOutCubic(u), bl = Math.sin(Math.PI * u);
        if ('filter' in ctx) {
          const tmp = apply._tmp5 || (apply._tmp5 = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
          if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
          const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.filter = 'none'; tc.clearRect(0, 0, W, H); tc.drawImage(ctx.canvas, 0, 0);
          ctx.globalAlpha = 1 - e; prevOr('#000');
          ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(' + (bl * 14 * W / 1920).toFixed(1) + 'px) brightness(1.15)'; ctx.globalAlpha = bl * 0.55; ctx.drawImage(tmp, 0, 0);
          ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
        } else { ctx.globalAlpha = 1 - e; prevOr('#000'); }
        break;
      }
      case 'dirblur': {                                 // 방향 블러 디졸브 — 4방향 모션 블러 + 크로스
        const horiz = dir === 'ltr' || dir === 'rtl', sgn = (dir === 'ltr' || dir === 'ttb') ? 1 : -1;
        const e = inOutCubic(u), vel = Math.sin(Math.PI * u) * 0.6;
        const tmp = apply._tmp6 || (apply._tmp6 = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
        if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
        const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.clearRect(0, 0, W, H); tc.drawImage(ctx.canvas, 0, 0);
        ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        const off = e * 0.08 * (horiz ? W : H) * sgn;
        if (prev) drawShift(ctx, prev, W, H, horiz ? off : 0, horiz ? 0 : off, horiz, vel, 1 - e); else { ctx.globalAlpha = 1 - e; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
        drawShift(ctx, tmp, W, H, horiz ? off - 0.08 * W * sgn : 0, horiz ? 0 : off - 0.08 * H * sgn, horiz, vel, e);
        break;
      }
      case 'dipBlack': case 'dipWhite': {
        const col = type === 'dipBlack' ? '#000' : '#fff';
        if (u < 0.5) { ctx.globalAlpha = 1; prevOr(col); ctx.globalAlpha = outCubic(u * 2); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
        else { ctx.globalAlpha = 1 - inCubic((u - 0.5) * 2); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
        break;
      }
      case 'lightleak': {
        if (u < 0.5) { ctx.globalAlpha = 1; prevOr('#000'); }
        ctx.globalAlpha = 1;
        if (g.KM_PARTS && g.KM_PARTS.get('lightleak')) g.KM_PARTS.frame('lightleak', ctx, W, H, u * 1.4, { tone: tr.tone || 'warm', dir: dir === 'rtl' ? 'rtl' : 'ltr' }, theme);
        else { const fl = Math.pow(Math.max(0, 1 - Math.abs(u - 0.5) / 0.3), 2); ctx.globalAlpha = fl * 0.85; ctx.fillStyle = '#fff3dc'; ctx.fillRect(0, 0, W, H); }
        break;
      }
      case 'sweep': {                                   // 이전 프레임을 아직 안 쓸린 쪽에만, 경계에 금선
        const e = inOutCubic(u), x = dir === 'rtl' ? W * (1 - e) : W * e;
        ctx.save(); ctx.globalAlpha = 1; ctx.beginPath();
        if (dir === 'rtl') ctx.rect(0, 0, x, H); else ctx.rect(x, 0, W - x, H);
        ctx.clip(); prevOr('#000'); ctx.restore();
        const gold = (theme && theme.accent) || '#D9B65C', soft = 48;
        const grd = ctx.createLinearGradient(dir === 'rtl' ? x + soft : x - soft, 0, x, 0);
        grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.globalAlpha = 1; ctx.fillStyle = grd; ctx.fillRect(dir === 'rtl' ? x : x - soft, 0, soft, H);
        ctx.fillStyle = gold; ctx.globalAlpha = 0.95; ctx.fillRect(x - 2, 0, 4, H);
        ctx.shadowColor = gold; ctx.shadowBlur = 24; ctx.fillRect(x - 1, 0, 2, H); ctx.shadowBlur = 0;
        break;
      }
      case 'whip': {
        const horiz = dir === 'ltr' || dir === 'rtl', sgn = (dir === 'ltr' || dir === 'ttb') ? 1 : -1;
        const e = inOutCubic(u), vel = Math.sin(Math.PI * u);           // 중간에서 가장 빠름
        const tmp = apply._tmp || (apply._tmp = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
        if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
        const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.drawImage(ctx.canvas, 0, 0);
        ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        const off = e * (horiz ? W : H) * sgn;
        if (prev) drawShift(ctx, prev, W, H, horiz ? off : 0, horiz ? 0 : off, horiz, vel, 1);
        drawShift(ctx, tmp, W, H, horiz ? off - W * sgn : 0, horiz ? 0 : off - H * sgn, horiz, vel, 1);
        break;
      }
      case 'push': case 'cover': {                      // 밀기: 둘이 같이 이동 / 덮기: 새 클립이 위로 미끄러져 들어옴
        const horiz = dir === 'ltr' || dir === 'rtl', sgn = (dir === 'ltr' || dir === 'ttb') ? 1 : -1;
        const e = inOutCubic(u), span = horiz ? W : H, off = e * span * sgn;
        const tmp = apply._tmp2 || (apply._tmp2 = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
        if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
        const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.clearRect(0, 0, W, H); tc.drawImage(ctx.canvas, 0, 0);
        ctx.globalAlpha = 1;
        if (type === 'push') {                          // 이전은 밀려 나가고
          ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
          if (prev) ctx.drawImage(prev, horiz ? off : 0, horiz ? 0 : off);
          else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
          ctx.drawImage(tmp, horiz ? off - span * sgn : 0, horiz ? 0 : off - span * sgn);
        } else {                                        // 덮기: 이전은 제자리, 새 것이 위로
          prevOr('#000');
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40;
          ctx.drawImage(tmp, horiz ? off - span * sgn : 0, horiz ? 0 : off - span * sgn);
          ctx.restore();
        }
        break;
      }
      case 'zoom': {                                    // 줌 디졸브: in = 이전이 커지며 새 것으로, out = 이전이 물러나며
        const e = inOutCubic(u), grow = dir === 'out' ? 1 / (1 + e * 0.35) : 1 + e * 0.35;
        ctx.globalAlpha = 1 - e;
        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(grow, grow); ctx.translate(-W / 2, -H / 2);
        prevOr('#000');
        ctx.restore();
        break;
      }
      case 'wipe': {                                    // 직선 와이프 — 부드러운 경계, 장식 없음
        const e = inOutCubic(u), horiz = dir === 'ltr' || dir === 'rtl', span = horiz ? W : H;
        const fwd = dir === 'ltr' || dir === 'ttb', edge = fwd ? span * e : span * (1 - e), soft = span * 0.06;
        ctx.save(); ctx.globalAlpha = 1; ctx.beginPath();
        if (horiz) { if (fwd) ctx.rect(edge, 0, W - edge, H); else ctx.rect(0, 0, edge, H); }
        else { if (fwd) ctx.rect(0, edge, W, H - edge); else ctx.rect(0, 0, W, edge); }
        ctx.clip(); prevOr('#000'); ctx.restore();
        const g0 = fwd ? edge - soft : edge, g1 = fwd ? edge : edge + soft;
        const grd = horiz ? ctx.createLinearGradient(g0, 0, g1, 0) : ctx.createLinearGradient(0, g0, 0, g1);
        grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(fwd ? 1 : 0, 'rgba(0,0,0,0.28)'); grd.addColorStop(fwd ? 0 : 1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = grd;
        if (horiz) ctx.fillRect(Math.min(g0, g1), 0, soft, H); else ctx.fillRect(0, Math.min(g0, g1), W, soft);
        break;
      }
      case 'blur': {                                    // 블러 디졸브 — 흐려지며 겹침 (ctx.filter 없으면 디졸브로)
        const e = inOutCubic(u), bl = Math.sin(Math.PI * u) * 18;
        const hasF = 'filter' in ctx;
        if (hasF) {
          const tmp = apply._tmp3 || (apply._tmp3 = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas'));
          if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
          const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.filter = 'none'; tc.clearRect(0, 0, W, H); tc.drawImage(ctx.canvas, 0, 0);
          ctx.globalAlpha = 1; ctx.filter = 'blur(' + bl.toFixed(1) + 'px)';
          ctx.drawImage(tmp, 0, 0);
          ctx.globalAlpha = 1 - e; prevOr('#000');
          ctx.filter = 'none';
        } else { ctx.globalAlpha = 1 - e; prevOr('#000'); }
        break;
      }
    }
    ctx.globalAlpha = 1;
  }

  g.KMV_TRANSITION = { CATS, TYPES, DURS, durFrames, progress, apply };
})(typeof window !== 'undefined' ? window : globalThis);
