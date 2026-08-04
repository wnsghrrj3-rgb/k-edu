/* ============================================================
   screens/video5.js (R73) — 저사양·태블릿 실측이 지목한 한 자리

   R68 부터 다섯 라운드 이월된 「저사양/태블릿 실측」을 R73 에서 했다.
   CPU 4·6배 스로틀 + 1280×800@2x(학교 보급 태블릿 가로), 12MP JPEG
   30장(44.5MB) 실크롬 측정:

     CPU 6배 · 30장 → 업로드하고 목록이 뜨기까지 **28.7초** 화면이 멈춤
       · 얹기            4ms
       · render 문자열   4,654ms
       · innerHTML 장착  5,863ms
       · 첫 페인트      18,139ms   ← 12MP 30장을 여기서 전부 해독한다
       · 첫 렌더 HTML   60,761KB

   R71 이 고친 건 **안정 상태의 재렌더**였다(466KB · ★클릭 1,980ms→4.6ms,
   저사양에서도 그대로 유효). 구멍은 그 앞이다 — 축소본은 업로드 뒤에
   만들어지므로 **첫 렌더에는 아직 없고**, 없으면 목록이 원본을 그린다
   (video2 `m.thumb || m.src`). 원본 30장 59.3MB vs 축소본 0.43MB,
   **138배**가 첫 화면으로 통째로 흘러간 것이다.

   그래서 바꾸는 규칙은 하나다. **축소본이 아직 없으면 원본을 목록에
   그리지 않는다.** 대신

     ① 자리표시 — 같은 크기의 빈 칸(레이아웃 무변). 원본은 화면에
        안 나가고 `m.src` 는 손대지 않는다(빌드는 언제나 원본을 쓴다).
     ② 한 장씩 채우기 — 축소가 한 장 끝날 때마다 그 자리 `<img>` 하나만
        갈아 끼운다(R71 부분 갱신과 같은 계열). 전체 재렌더 없음.
     ③ 진행 고지 — 빈 칸만 보이면 「사진이 사라졌나」가 된다.
        「사진 준비 중 12/30」이라고 말하고, 끝나면 스스로 사라진다.

   축소가 불가능한 환경(canvas 없음 등)에서는 ①이 사진을 영영 못 보게
   만든다. 그래서 그때는 **종전 그대로 원본을 그린다** — 느린 게
   안 보이는 것보다 낫다.

   video.js(R53)·video2.js(R61)·video3.js(R67)·video4.js(R71) 무손상.
   video2 는 그림 한 줄만 훅으로 넓혔고(훅이 없으면 종전과 완전 동일),
   나머지는 이 파일이 뒤에서 감싼다.
   ============================================================ */
(() => {
  'use strict';
  const H = window.MK_VIDHUB;
  if (!H) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 1×1 투명 GIF. `<img>` 구조와 크기를 그대로 두므로 레이아웃이 안 흔들린다. */
  const PH = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  /* 축소를 만들 수 있는 환경인가 — video4 와 같은 판정.
     한 번 재고 기억한다(렌더마다 canvas 를 만들 이유가 없다). */
  let canThumb = null;
  const canMakeThumb = () => {
    if (canThumb !== null) return canThumb;
    try {
      if (typeof document === 'undefined' || typeof Image === 'undefined') { canThumb = false; return false; }
      const c = document.createElement('canvas');
      canThumb = !!(c && c.getContext && c.getContext('2d') && c.toDataURL && typeof H.makeThumb === 'function');
    } catch (e) { canThumb = false; }
    return canThumb;
  };

  /* 축소를 기다리는 중인가 — 아직 답이 안 난 사진만 참 */
  const waiting = (m) => !!(m && !m.thumb && m.kind !== 'video' && /^data:image\//.test(m.src || '') && canMakeThumb());
  H.thumbWaiting = waiting;

  /* ---------------- ① 목록에 그리는 그림 ----------------
     video2 가 이 함수가 있으면 이걸 쓴다. 없으면 종전(원본) 그대로다. */
  H.thumbImg = (m, cls) => {
    const id = typeof H.mediaUid === 'function' ? H.mediaUid(m) : '';
    if (m.thumb) return `<img class="${cls} vh-thumb" src="${esc(m.thumb)}" data-vh-th="${esc(id)}" alt="">`;
    if (!waiting(m)) return `<img class="${cls} vh-thumb" src="${esc(m.src)}" data-vh-th="${esc(id)}" alt="">`;
    /* 축소 전 — 원본은 화면으로 내보내지 않는다 */
    return `<img class="${cls} vh-thumb vh-thumb-wait" src="${PH}" data-vh-th="${esc(id)}" alt="사진 준비 중">`;
  };

  /* ---------------- ② 한 장씩 채우기 ---------------- */
  const drawn = () => {
    const out = (H.st.medias || []).slice();
    (H.st.pairs || []).forEach((p) => { if (p && p.before) out.push(p.before); if (p && p.after) out.push(p.after); });
    return out;
  };
  const rootEl = () => document.querySelector('#pgBody') || document.body;

  const fillOne = (m) => {
    if (!m || !m.thumb || typeof H.mediaUid !== 'function') return;
    const id = H.mediaUid(m);
    rootEl().querySelectorAll(`img[data-vh-th="${id}"].vh-thumb-wait`).forEach((img) => {
      img.src = m.thumb;
      img.classList.remove('vh-thumb-wait');
      img.alt = '';
    });
  };

  /* ---------------- ③ 진행 고지 ---------------- */
  const counts = () => {
    const all = drawn().filter((m) => m && m.kind !== 'video' && /^data:image\//.test(m.src || ''));
    return { total: all.length, left: all.filter(waiting).length };
  };

  H.thumbProgressHTML = () => {
    const c = counts();
    if (!c.left) return '';
    return `<p class="vh-thumbwait" id="vhThumbWait">사진 준비 중 ${c.total - c.left}/${c.total} — 준비된 사진부터 차례로 보여요</p>`;
  };

  const syncProgress = () => {
    const root = rootEl();
    const rows = root.querySelector('.vh-rows') || root.querySelector('.vh-stage');
    if (!rows) return;
    const c = counts();
    let el = root.querySelector('#vhThumbWait');
    if (!c.left) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('p');
      el.className = 'vh-thumbwait';
      el.id = 'vhThumbWait';
      rows.parentNode.insertBefore(el, rows);
    }
    el.textContent = `사진 준비 중 ${c.total - c.left}/${c.total} — 준비된 사진부터 차례로 보여요`;
  };
  H.thumbSyncProgress = syncProgress;

  /* ---------------- makeThumb 래핑 ----------------
     끝나면 반드시 답을 확정한다. 「축소하지 않기로 함」(원본이 이미 작음,
     축소 실패)을 미정으로 남기면 그 자리는 영영 빈 칸이 된다. */
  const baseMake = H.makeThumb;
  if (typeof baseMake === 'function') {
    H.makeThumb = (m) => baseMake(m).then((made) => {
      if (m && !m.thumb && m.src) m.thumb = m.src;   /* 확정 — 원본이 답인 경우 */
      fillOne(m);
      syncProgress();
      return made;
    }, (e) => {
      if (m && !m.thumb && m.src) m.thumb = m.src;
      fillOne(m); syncProgress();
      return false;
    });
  }

  /* ---------------- ensureThumbs 래핑 ----------------
     video4 는 다 끝나면 화면을 통째로 다시 그렸다. 이제 한 장씩 채웠으니
     그 재렌더는 낼 이유가 없는 비용이다(6배 스로틀·30장에서 1,418ms).
     다만 빈 칸이 남았다면(예상 밖) 한 번은 다시 그린다 — 안 보이는 채로
     끝나는 것보다 낫다. */
  const baseEnsure = H.ensureThumbs;
  if (typeof baseEnsure === 'function') {
    H.ensureThumbs = (after) => {
      const p = baseEnsure();
      syncProgress();
      return p.then((made) => {
        syncProgress();
        const left = counts().left;
        if (left && typeof after === 'function') after();
        else if (left && window.PG && typeof window.PG.render === 'function' && (location.hash || '').indexOf('video') >= 0) window.PG.render();
        return made;
      });
    };
  }

  /* ---------------- 화면 래퍼 ----------------
     장착 직후 진행 줄을 세우고, 이미 준비된 사진은 즉시 채운다
     (다른 화면에 갔다 돌아온 경우). */
  const wrapScreen = () => {
    const prev = window.MK_SCREENS && window.MK_SCREENS.video;
    if (!prev || prev.__r73) return;
    const next = {
      title: prev.title, variants: prev.variants, __r73: true, __r71: prev.__r71,
      render() { return prev.render.call(prev); },
      mount(root) {
        prev.mount.call(prev, root);
        try {
          drawn().forEach(fillOne);
          syncProgress();
          if (counts().left && typeof H.ensureThumbs === 'function') H.ensureThumbs();
        } catch (e) { /* 진행 고지는 부가 정보다 — 실패해도 화면은 산다 */ }
      },
    };
    window.MK_SCREENS.video = next;
  };
  wrapScreen();
})();
