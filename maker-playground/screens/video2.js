/* ============================================================
   screens/video2.js (R61) — Video 허브 v2: 템플릿 시작 화면
   ------------------------------------------------------------
   GPT 2단계 지시서 §13·§14 — 템플릿을 누르면 빈 편집기가 아니라
   「시작 화면」이 먼저 열린다.
   · 포토 슬라이드쇼: 미디어 목록(드래그·▲▼ 정렬), 미디어별 캡션,
     제목·마무리 문구, 실시간 예상치(미디어 N → 장면 M · 약 S초)
   · 비포 & 애프터: 전/후 쌍 입력(추가·삭제·정렬), 비교 방식 선택
     (비율별 실작동분만), 누락 쌍 경고 — 완성으로 위장하지 않음
   · 그 외 Composition: R53 즉시 흐름 그대로 존속
   video.js(R53)의 MK_VIDHUB API(st·select·startBuild·pick)는 무손상 —
   이 파일은 뒤에 로드되어 스테이징 계층과 화면 렌더만 확장한다.
   ============================================================ */
(() => {
  const H = window.MK_VIDHUB;
  if (!H) return;
  const C = () => window.MK_COMPOSE;
  const esc = H.esc;

  /* ---------------- 스테이징 상태 (add-only) ---------------- */
  H.st.stage = null;        /* null | 'media' | 'pairs' */
  H.st.medias = [];         /* [{name, kind, src, w, h, duration?}] */
  H.st.captions = [];       /* 미디어 순서와 동일 인덱스 */
  H.st.outro = '';
  H.st.pairs = [];          /* [{before, after, title}] */
  H.st.result = '';
  H.st.method = 'auto';

  const isPairComp = () => { const c = C() && C().getComposition(H.st.comp); return !!(c && c.pairMode); };
  const isPlanComp = () => { const c = C() && C().getComposition(H.st.comp); return !!(c && typeof c.mediaPlan === 'function'); };

  /* ---------------- 스테이징 조작 (전부 테스트 가능한 순수 조작) ---------------- */
  H.stageMedias = (medias) => {
    H.st.medias = H.st.medias.concat(medias || []);
    while (H.st.captions.length < H.st.medias.length) H.st.captions.push('');
    H.st.stage = 'media'; H.st.msg = '';
  };
  H.moveMedia = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= H.st.medias.length) return;
    [H.st.medias[i], H.st.medias[j]] = [H.st.medias[j], H.st.medias[i]];
    [H.st.captions[i], H.st.captions[j]] = [H.st.captions[j], H.st.captions[i]];
  };
  H.removeMedia = (i) => { H.st.medias.splice(i, 1); H.st.captions.splice(i, 1); };
  H.setCaption = (i, t) => { H.st.captions[i] = String(t || ''); };

  H.addPair = () => { H.st.pairs.push({ before: null, after: null, title: '' }); H.st.stage = 'pairs'; };
  H.setPairMedia = (i, side, m) => { if (H.st.pairs[i]) H.st.pairs[i][side] = m; };
  H.movePair = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= H.st.pairs.length) return;
    [H.st.pairs[i], H.st.pairs[j]] = [H.st.pairs[j], H.st.pairs[i]];
  };
  H.removePair = (i) => { H.st.pairs.splice(i, 1); };

  H.resetStage = () => { H.st.stage = null; H.st.medias = []; H.st.captions = []; H.st.outro = '';
    H.st.pairs = []; H.st.result = ''; H.st.method = 'auto'; };

  /* select 확장 — 구조 바꾸면 스테이징 초기화 */
  const baseSelect = H.select.bind(H);
  H.select = (compId) => { baseSelect(compId); H.resetStage(); };

  /* ---------------- 입력 조립 ---------------- */
  H.stagedInput = () => {
    const texts = {};
    if (H.st.title.trim()) texts.title = H.st.title.trim();
    if (H.st.sub.trim()) texts.subtitle = H.st.sub.trim();
    if (H.st.stage === 'pairs') {
      if (H.st.result.trim()) texts.result = H.st.result.trim();
      const pairs = H.st.pairs
        .filter((p) => p.before || p.after)
        .map((p) => ({ before: p.before, after: p.after, title: p.title || '' }));
      return { pairs, texts, ...(H.st.ratio ? { ratio: H.st.ratio } : {}),
        ...(H.st.method !== 'auto' ? { method: H.st.method } : {}) };
    }
    if (H.st.outro.trim()) texts.outro = H.st.outro.trim();
    return { medias: H.st.medias, mediaCaptions: H.st.captions.slice(), texts,
      ...(H.st.ratio ? { ratio: H.st.ratio } : {}) };
  };

  /* 실시간 예상치 — 지시서 §8-1: 만들기 전 미디어 N → 예상 장면 M · 약 S초 */
  H.estimateNow = () => {
    if (!C() || !H.st.comp) return null;
    return C().estimate(H.st.comp, H.st.theme, H.stagedInput());
  };

  /* 스테이징 → 실제 생성 (경고는 만들기 전에 정직하게) */
  H.buildStaged = () => {
    if (!C() || !H.st.comp) return { ok: false, why: 'no-selection' };
    const inp = H.stagedInput();
    const r = C().buildProject(H.st.comp, H.st.theme, inp);
    if (!r.ok) { H.st.msg = r.guide || '만들 수 없어요 — 입력을 확인해 주세요.'; return r; }
    const say = [].concat(r.warnings || [], r.notes || []);
    if (say.length && typeof window.alert === 'function') window.alert(say.join('\n'));
    window.MK_START.open(r.doc);
    return r;
  };

  /* 파일 읽기 — 다중(슬라이드쇼) / 단일(쌍의 전·후) */
  H.pickInto = (multiple, cb) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = !!multiple; inp.accept = 'image/*,video/*';
    inp.onchange = () => {
      if (!inp.files || !inp.files.length) return;
      window.MK_START.readFiles(inp.files, (medias, skipped) => {
        if (skipped.length && typeof window.alert === 'function') window.alert('건너뜀: ' + skipped.join(', '));
        cb(medias || []);
      });
    };
    inp.click();
  };

  /* ---------------- 화면 렌더 ---------------- */
  const thumb = (m, cls) => m
    ? (m.kind === 'video'
      ? `<span class="${cls} vh-thumb vh-thumb-vid">🎬</span>`
      /* R71 — 목록에 그리는 그림은 축소본이 있으면 그걸 쓴다(원본 src 는 빌드용으로 무손상)
         R73 — 축소본이 아직 없으면 원본을 화면으로 내보내지 않는다(video5 훅).
               훅이 없으면 종전과 완전 동일하다. */
      : (typeof H.thumbImg === 'function'
        ? H.thumbImg(m, cls)
        : `<img class="${cls} vh-thumb" src="${esc(m.thumb || m.src)}" alt="">`))
    : `<span class="${cls} vh-thumb vh-thumb-empty">＋</span>`;

  const estLine = () => {
    const e = H.estimateNow();
    if (!e) return '';
    if (!e.ok) return `<em class="vh-est vh-est-warn">${esc(e.guide || '내용을 추가해 주세요')}</em>`;
    const warn = (e.warnings || []).map((w) => `<em class="vh-est vh-est-warn">⚠ ${esc(w)}</em>`).join('');
    return `<em class="vh-est">예상: 장면 ${e.sceneCount}개 · 약 ${e.total}초</em>${warn}`;
  };

  H.renderStage = () => {
    if (H.st.stage === 'media') {
      const rows = H.st.medias.map((m, i) => `
        <div class="vh-row" draggable="true" data-vh-mrow="${i}">
          <span class="vh-grip">⋮⋮</span>
          ${thumb(m, '')}
          <input class="vh-cap" data-vh-cap="${i}" placeholder="이 사진 한 줄 (선택)" value="${esc(H.st.captions[i] || '')}" maxlength="24">
          <span class="vh-rowbtns">
            <button data-vh-mup="${i}" title="위로">▲</button>
            <button data-vh-mdn="${i}" title="아래로">▼</button>
            <button data-vh-mdel="${i}" title="빼기">✕</button>
          </span>
        </div>`).join('');
      return `<div class="vh-stage">
        <b style="font:var(--mk-t-h3)">사진 순서와 문구</b>
        <p class="ed-note" style="margin:6px 0 8px">끌어서(또는 ▲▼) 순서를 바꾸고, 원하는 사진에만 한 줄을 넣어요 — 문구가 있는 사진은 문구 자리가 있는 화면으로 자동 배치돼요.</p>
        <div class="vh-rows">${rows}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="vh-chip" data-vh-more>＋ 사진 더 추가</button>
        </div>
        <input class="vh-input" id="vhOutro" placeholder="마무리 문구 (선택 — 비우면 기본 인사)" value="${esc(H.st.outro)}" maxlength="20">
        ${estLine()}
        <button class="vh-go" data-vh-build>🎬 영상 만들기</button>
      </div>`;
    }
    if (H.st.stage === 'pairs') {
      const allow = (C() && C().METHODS_BY_RATIO[H.st.ratio || '16:9']) || [];
      const names = (C() && C().METHOD_NAMES) || {};
      const chips = ['auto'].concat(allow).map((m) =>
        `<button class="vh-chip${H.st.method === m ? ' on' : ''}" data-vh-method="${m}">${m === 'auto' ? '자동 추천' : esc(names[m] || m)}</button>`).join('');
      const rows = H.st.pairs.map((p, i) => `
        <div class="vh-pair" data-vh-prow="${i}">
          <span class="vh-pairn">${i + 1}</span>
          <button class="vh-slot" data-vh-pb="${i}">${thumb(p.before, '')}<small>전${p.before ? '' : ' 고르기'}</small></button>
          <span class="vh-arrow">→</span>
          <button class="vh-slot" data-vh-pa="${i}">${thumb(p.after, '')}<small>후${p.after ? '' : ' 고르기'}</small></button>
          <input class="vh-cap" data-vh-pt="${i}" placeholder="이 쌍 이름 (선택)" value="${esc(p.title || '')}" maxlength="16">
          <span class="vh-rowbtns">
            <button data-vh-pup="${i}">▲</button>
            <button data-vh-pdn="${i}">▼</button>
            <button data-vh-pdel="${i}">✕</button>
          </span>
        </div>`).join('');
      return `<div class="vh-stage">
        <b style="font:var(--mk-t-h3)">전 · 후 쌍 만들기</b>
        <p class="ed-note" style="margin:6px 0 8px">쌍마다 전(before)과 후(after)를 각각 골라요 — 순서를 섞어 놓고 추측하게 하지 않아요.</p>
        <div class="vh-rows">${rows}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="vh-chip" data-vh-padd>＋ 쌍 추가</button>
        </div>
        <div style="margin-top:10px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">비교 방식 (${esc(H.st.ratio || '16:9')} 기준 실작동분)</small>
          <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${chips}</div></div>
        <input class="vh-input" id="vhResult" placeholder="결과 문구 (선택 — 예: 이렇게 달라졌어요)" value="${esc(H.st.result)}" maxlength="24">
        ${estLine()}
        <button class="vh-go" data-vh-build>🎬 비교 영상 만들기</button>
      </div>`;
    }
    return '';
  };

  H.mountStage = (root, redraw) => {
    /* 공통 */
    const b = root.querySelector('[data-vh-build]');
    if (b) b.onclick = () => {
      /* 누락 쌍 = 만들기 전 확인 (지시서 §9-4) */
      if (H.st.stage === 'pairs') {
        const bad = H.st.pairs.filter((p) => (p.before || p.after) && (!p.before || !p.after)).length;
        if (bad && typeof window.confirm === 'function' &&
          !window.confirm(bad + '개 쌍이 아직 전·후가 다 없어요. 그 쌍은 비교 없이 한 장면으로만 들어가요 — 계속할까요?')) return;
      }
      const r = H.buildStaged();
      if (!r.ok) { const el = root.querySelector('#vhMsg'); if (el) el.textContent = H.st.msg; redraw(); }
    };
    /* 미디어 스테이지 */
    root.querySelectorAll('[data-vh-mup]').forEach((x) => x.onclick = () => { H.moveMedia(+x.dataset.vhMup, -1); redraw(); });
    root.querySelectorAll('[data-vh-mdn]').forEach((x) => x.onclick = () => { H.moveMedia(+x.dataset.vhMdn, 1); redraw(); });
    root.querySelectorAll('[data-vh-mdel]').forEach((x) => x.onclick = () => { H.removeMedia(+x.dataset.vhMdel); redraw(); });
    root.querySelectorAll('[data-vh-cap]').forEach((x) => {
      x.oninput = () => H.setCaption(+x.dataset.vhCap, x.value);
      x.onchange = () => redraw(); /* 캡션 유무가 예상 배치에 영향 — 확정 시 갱신 */
    });
    const more = root.querySelector('[data-vh-more]');
    if (more) more.onclick = () => H.pickInto(true, (ms) => { H.stageMedias(ms); redraw(); });
    /* 드래그 정렬 */
    let dragFrom = null;
    root.querySelectorAll('[data-vh-mrow]').forEach((row) => {
      row.ondragstart = (e) => { dragFrom = +row.dataset.vhMrow; if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; };
      row.ondragover = (e) => e.preventDefault();
      row.ondrop = (e) => {
        e.preventDefault();
        const to = +row.dataset.vhMrow;
        if (dragFrom == null || dragFrom === to) return;
        const m = H.st.medias.splice(dragFrom, 1)[0], c = H.st.captions.splice(dragFrom, 1)[0];
        H.st.medias.splice(to, 0, m); H.st.captions.splice(to, 0, c);
        dragFrom = null; redraw();
      };
    });
    const ot = root.querySelector('#vhOutro'); if (ot) { ot.oninput = () => { H.st.outro = ot.value; }; ot.onchange = () => redraw(); }
    /* 쌍 스테이지 */
    root.querySelectorAll('[data-vh-pb]').forEach((x) => x.onclick = () =>
      H.pickInto(false, (ms) => { if (ms[0]) H.setPairMedia(+x.dataset.vhPb, 'before', ms[0]); redraw(); }));
    root.querySelectorAll('[data-vh-pa]').forEach((x) => x.onclick = () =>
      H.pickInto(false, (ms) => { if (ms[0]) H.setPairMedia(+x.dataset.vhPa, 'after', ms[0]); redraw(); }));
    root.querySelectorAll('[data-vh-pt]').forEach((x) => x.oninput = () => { if (H.st.pairs[+x.dataset.vhPt]) H.st.pairs[+x.dataset.vhPt].title = x.value; });
    root.querySelectorAll('[data-vh-pup]').forEach((x) => x.onclick = () => { H.movePair(+x.dataset.vhPup, -1); redraw(); });
    root.querySelectorAll('[data-vh-pdn]').forEach((x) => x.onclick = () => { H.movePair(+x.dataset.vhPdn, 1); redraw(); });
    root.querySelectorAll('[data-vh-pdel]').forEach((x) => x.onclick = () => { H.removePair(+x.dataset.vhPdel); redraw(); });
    const pa = root.querySelector('[data-vh-padd]'); if (pa) pa.onclick = () => { H.addPair(); redraw(); };
    root.querySelectorAll('[data-vh-method]').forEach((x) => x.onclick = () => { H.st.method = x.dataset.vhMethod; redraw(); });
    const rs = root.querySelector('#vhResult'); if (rs) { rs.oninput = () => { H.st.result = rs.value; }; rs.onchange = () => redraw(); }
  };

  /* ---------------- 화면 승격 — R53 렌더를 감싼다 ---------------- */
  const base = window.MK_SCREENS.video;
  window.MK_SCREENS.video = {
    title: base.title, variants: base.variants,
    render() {
      let html = base.render.call(base);
      if (H.st.comp && H.st.stage) {
        /* 스테이징 중 = 시작 화면이 본체: 파일 고르기 버튼을 스테이지로 교체 */
        html = html.replace(/<button class="vh-go" data-vh-pick>[^<]*<\/button>/, H.renderStage());
      } else if (H.st.comp && (isPairComp() || isPlanComp())) {
        /* 슬라이드쇼·비포애프터는 즉시 생성 대신 시작 화면으로 진입 (§13: 빈 편집기 직행 금지) */
        const label = isPairComp() ? '전·후 쌍 만들러 가기' : '📁 사진·영상 고르고 순서 정하기';
        html = html.replace(/<button class="vh-go" data-vh-pick>[^<]*<\/button>/,
          `<button class="vh-go" data-vh-open-stage>${label}</button>`);
      }
      return html;
    },
    mount(root) {
      base.mount.call(base, root);
      const redraw = H.screenRedraw ? H.screenRedraw(root, this)   /* R75 */
        : () => { root.innerHTML = this.render(); this.mount(root); };
      const open = root.querySelector('[data-vh-open-stage]');
      if (open) open.onclick = () => {
        if (isPairComp()) { if (!H.st.pairs.length) H.addPair(); H.st.stage = 'pairs'; redraw(); }
        else H.pickInto(true, (ms) => { H.stageMedias(ms); redraw(); });
      };
      /* 스테이지 갱신 시 select/theme/ratio 버튼도 살아 있도록 base.mount 뒤에 스테이지 배선 */
      H.mountStage(root, redraw);
    },
  };
})();
