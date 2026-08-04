/* ============================================================
   screens/video4.js (R71) — 미리보기 비용 해소
   ------------------------------------------------------------
   R68 부터 3회 이월된 「미리보기 실빌드 비용 실브라우저 측정」을
   R71 에서 실행했고, 실크롬 실측이 이렇게 나왔다(12MP JPEG 30장·47.8MB):

     사진 30장 → ★ 한 번 누르면 화면이 1,980ms 얼어붙음
       · 실빌드(buildSmart)            275ms
       · render 문자열 생성            855ms  ← HTML 65MB
       · innerHTML 파싱 + 재장착      나머지

   범인은 엔진이 아니라 **원본 data URL 이 매 렌더마다 HTML 로 다시
   흘러가는 것**이었다. 사진 한 장이 1.7MB 인데 30장이면 51MB, 여기에
   목록·미리보기 마크업이 붙어 렌더 한 번에 65MB 짜리 문자열이 만들어지고
   브라우저는 그걸 다시 파싱하며 12MP 이미지 30장을 매번 새로 해독한다.

   두 갈래로 끊는다. 둘 다 **보여주는 값은 실빌드 결과 그대로**다 —
   추정치로 바꿔치기하지 않는다(R67 계약).

   ① 썸네일 1회 축소 — 목록에 그리는 그림만 320px 로 줄여 `m.thumb` 에
      담는다. 원본 `m.src` 는 손대지 않으므로 실제 만들어지는 영상 화질은
      그대로다(빌드는 언제나 원본을 쓴다). video2 의 thumb() 은
      `m.thumb || m.src` 로 한 갈래만 넓혔다 — thumb 이 없으면 종전과 같다.

   ② 결정론 캐시 — 같은 입력·같은 씨앗이면 buildSmart 는 언제나 같은 답을
      낸다(R66 T1 계약). 그러니 입력이 안 바뀐 재렌더에서 다시 돌릴 이유가
      없다. 캐시가 돌려주는 값은 **직전에 실제로 돌린 그 빌드 결과**이지
      어림한 숫자가 아니다. 서명은 사진마다 붙인 이름표(`_uid`)로 만든다 —
      2MB 짜리 data URL 을 해싱하면 아끼려던 비용을 그대로 다시 낸다.

   video.js(R53)·video2.js(R61)·video3.js(R67) API 무손상. 이 파일은
   뒤에서 감싸기만 한다.
   ============================================================ */
(() => {
  'use strict';
  const H = window.MK_VIDHUB;
  if (!H) return;

  /* ---------------- 사진 이름표 ----------------
     캐시 서명에 쓸 안정 식별자. 렌더 요소로는 나가지 않는다
     (compose.analyzeMedia 가 아는 필드만 추려 담으므로 doc 에 안 샌다). */
  let seq = 0;
  const uid = (m) => {
    if (!m || typeof m !== 'object') return '-';
    if (!m._uid) { try { Object.defineProperty(m, '_uid', { value: 'u' + (++seq), enumerable: false, writable: true }); } catch (e) { m._uid = 'u' + (++seq); } }
    return m._uid;
  };
  H.mediaUid = uid;

  /* ---------------- 입력 서명 ----------------
     buildSmart·estimate 의 답을 바꿀 수 있는 값 전부. 하나라도 빠지면
     바뀐 걸 안 바뀐 걸로 착각해 옛 숫자를 보여주게 된다 — 그건 거짓말이다. */
  H.costSig = () => {
    const s = H.st;
    const p = [s.comp || '', s.theme || '', s.ratio || '', s.title || '', s.sub || '',
      s.outro || '', s.result || '', s.method || '', s.stage || '', s.seed || '',
      /* R73 — 구성 형태도 답을 바꾼다. 빠뜨리면 형태를 바꿔도 옛 숫자가 그대로 남는다. */
      s.pairFormPick || 'auto'];
    if (s.stage === 'pairs') {
      p.push((s.pairs || []).map((x) => (x && x.before ? uid(x.before) : '-') + '>' + (x && x.after ? uid(x.after) : '-')
        + '|' + ((x && x.title) || '') + '|' + ((x && x.resultText) || '')).join(','));
      p.push((s.pairRoles || []).join(','));
    } else {
      p.push((s.medias || []).map(uid).join(','));
      p.push((s.captions || []).join('\u0001'));
      p.push((s.roles || []).join(','));
    }
    return p.join('\u0002');
  };

  /* ---------------- 캐시 (최근 8개) ---------------- */
  const CAP = 8;
  const box = new Map();
  let hit = 0, miss = 0;
  const cached = (kind, run) => {
    const k = kind + '\u0003' + H.costSig();
    if (box.has(k)) { hit++; const v = box.get(k); box.delete(k); box.set(k, v); return v; }
    miss++;
    const v = run();
    box.set(k, v);
    while (box.size > CAP) box.delete(box.keys().next().value);
    return v;
  };
  H.costStats = () => ({ hit, miss, size: box.size });
  /* 캐시가 못 보는 곳에서 값이 바뀌었을 때를 위한 비상구 */
  H.costFlush = () => { box.clear(); };

  const basePeek = H.smartPeek;
  H.smartPeek = () => cached('peek', () => basePeek());

  const baseEst = H.estimateNow;
  H.estimateNow = () => cached('est', () => baseEst());

  /* 실제로 만들 때는 캐시를 타지 않는다 — 만들기는 문서를 낳는 일이고,
     같은 문서 객체를 두 프로젝트가 나눠 갖게 두면 안 된다. */

  /* ---------------- 썸네일 1회 축소 ---------------- */
  const THUMB_W = 320;
  const canMakeThumb = () => {
    try {
      if (typeof document === 'undefined' || typeof Image === 'undefined') return false;
      const c = document.createElement('canvas');
      return !!(c && c.getContext && c.getContext('2d') && c.toDataURL);
    } catch (e) { return false; }
  };

  /* 축소 디코드(createImageBitmap)도 같은 사진으로 재 봤으나 이 환경에서 더 느렸다
     (10장 2,128ms vs 1,761ms) — 빠른 쪽만 남긴다. */
  H.makeThumb = (m) => new Promise((res) => {
    if (!m || m.thumb || m.kind === 'video' || !m.src || !/^data:image\//.test(m.src)) return res(false);
    const img = new Image();
    img.onload = () => {
      try {
        const w = Math.max(1, Math.min(THUMB_W, img.naturalWidth || THUMB_W));
        const h = Math.max(1, Math.round((img.naturalHeight || THUMB_W) * (w / (img.naturalWidth || THUMB_W))));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const url = c.toDataURL('image/jpeg', 0.72);
        /* 줄이려다 되레 커지면(작은 원본) 손대지 않는다 */
        if (url && url.length < m.src.length) m.thumb = url;
        res(!!m.thumb);
      } catch (e) { res(false); }
    };
    img.onerror = () => res(false);
    img.src = m.src;
  });

  /* 목록 사진 + 쌍(전·후) 자리 사진 — 화면에 그려지는 그림 전부 */
  const drawnMedias = () => {
    const out = (H.st.medias || []).slice();
    (H.st.pairs || []).forEach((p) => { if (p && p.before) out.push(p.before); if (p && p.after) out.push(p.after); });
    return out;
  };

  /* 진행 중이면 그 작업을 그대로 돌려준다 — 「이미 돌고 있으니 0장」이라고
     답하면 부르는 쪽은 끝난 줄 알고 다음 일을 시작한다. */
  let job = null;
  H.ensureThumbs = (after) => {
    if (job) return job;
    if (!canMakeThumb()) return Promise.resolve(0);
    const todo = drawnMedias().filter((m) => m && !m.thumb && m.kind !== 'video' && /^data:image\//.test(m.src || ''));
    if (!todo.length) return Promise.resolve(0);
    job = (async () => {
      let made = 0;
      for (const m of todo) {
        if (await H.makeThumb(m)) made++;
        /* 사진 한 장마다 손을 놓는다 — 30장을 한 호흡에 갈면 그동안 화면이 멈춘다 */
        await new Promise((r) => setTimeout(r, 0));
      }
      return made;
    })().then((made) => {
      job = null;
      if (made && typeof after === 'function') after();
      return made;
    }, (e) => { job = null; return 0; });
    return job;
  };
  H.thumbsPending = () => !!job;

  /* 사진이 올라오는 자리마다 축소를 걸어 둔다 — 끝나면 화면을 한 번만 다시 그린다.
     그리는 그림만 바뀌므로 사용자가 보던 내용은 그대로다. */
  const baseStage = H.stageMedias;
  H.stageMedias = (ms) => {
    baseStage(ms);
    H.ensureThumbs(() => {
      if (window.PG && typeof window.PG.render === 'function' && (location.hash || '').indexOf('video') >= 0) window.PG.render();
    });
  };

  /* ---------------- 역할 토글 = 부분 갱신 ----------------
     역할 하나 바꾸자고 목록을 통째로 다시 그리면 사진 30장을 매번 새로
     해독한다(실측 680ms). 바뀐 것은 칩 하나·행 하나·요약 한 줄뿐이므로
     그 셋만 고친다. 요약에 적히는 값은 여전히 실빌드 결과다 — 다만
     빌드가 도는 동안 옛 숫자를 그대로 두면 거짓이 되므로 「고쳐 세는 중」
     이라고 먼저 말하고, 끝나면 실제 숫자로 바꾼다. */

  const paintChips = (root, sel, list, i) => {
    root.querySelectorAll(`[${sel}][data-i="${i}"]`).forEach((b) => {
      const want = b.getAttribute(sel);
      b.classList.toggle('on', list[i] === want);
    });
  };

  let pend = null;
  const refreshLine = (root) => {
    const holder = root.querySelector('#vhEst');
    if (!holder || typeof H.smartLineHTML !== 'function') return;
    holder.innerHTML = '<em class="vh-est">구성을 다시 세는 중…</em>';
    if (pend) clearTimeout(pend);
    /* 손을 놓았다가 센다 — 연달아 누르는 동안 화면이 멈추지 않게 */
    pend = setTimeout(() => {
      pend = null;
      const live = root.querySelector('#vhEst');
      if (live && document.contains(live)) live.innerHTML = H.smartLineHTML();
    }, 0);
  };

  const wrapScreen = () => {
    const prev = window.MK_SCREENS && window.MK_SCREENS.video;
    if (!prev || prev.__r71) return;
    const next = {
      title: prev.title, variants: prev.variants, __r71: true,
      render() { return prev.render.call(prev); },
      mount(root) {
        prev.mount.call(prev, root);
        /* video3 가 걸어 둔 전체 재렌더 대신 부분 갱신을 다시 건다 */
        root.querySelectorAll('[data-vh-role]').forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            const i = +b.dataset.i;
            H.setRole(i, b.dataset.vhRole);
            paintChips(root, 'data-vh-role', H.st.roles, i);
            const row = root.querySelector(`[data-vh-mrow="${i}"]`);
            if (row) row.classList.toggle('vh-row-off', H.st.roles[i] === 'exclude');
            refreshLine(root);
          };
        });
        root.querySelectorAll('[data-vh-prole]').forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            const i = +b.dataset.i;
            H.setPairRoleAt(i, b.dataset.vhProle);
            paintChips(root, 'data-vh-prole', H.st.pairRoles, i);
            const row = root.querySelector(`[data-vh-prow="${i}"]`);
            if (row) row.classList.toggle('vh-row-off', H.st.pairRoles[i] === 'exclude');
            refreshLine(root);
          };
        });
        /* R73 — 형태 칩도 같은 대접. 바뀌는 것은 칩 3개와 요약 한 줄뿐이라
           목록(사진 30장)을 다시 그릴 이유가 없다. */
        root.querySelectorAll('[data-vh-pform]').forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            H.setPairForm(b.dataset.vhPform);
            const cur = H.st.pairFormPick || 'auto';
            root.querySelectorAll('[data-vh-pform]').forEach((x) => x.classList.toggle('on', x.dataset.vhPform === cur));
            refreshLine(root);
          };
        });
        /* 씨앗은 값만 바뀌므로 같은 대접 — 목록은 그대로 둔다 */
        const rs = root.querySelector('[data-vh-reseed]');
        if (rs) rs.onclick = () => {
          H.st.seed = window.MK_SVARX ? window.MK_SVARX.nextSeed(H.st.seed) : String(Date.now());
          const inp = root.querySelector('#vhSeed');
          if (inp) inp.value = H.st.seed;
          refreshLine(root);
        };
        const sd = root.querySelector('#vhSeed');
        if (sd) { sd.oninput = () => { H.st.seed = sd.value; }; sd.onchange = () => refreshLine(root); }
      },
    };
    window.MK_SCREENS.video = next;
  };
  wrapScreen();

  /* 쌍 자리에 꽂히는 사진도 같은 축소를 받는다 */
  const basePick = H.pickInto;
  if (typeof basePick === 'function') {
    H.pickInto = (multi, cb) => basePick(multi, (ms) => {
      const r = cb(ms);
      H.ensureThumbs(() => {
        if (window.PG && typeof window.PG.render === 'function' && (location.hash || '').indexOf('video') >= 0) window.PG.render();
      });
      return r;
    });
  }
})();
