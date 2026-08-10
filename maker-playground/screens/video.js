/* ============================================================
   screens/video.js (R53) — Video 허브
   ------------------------------------------------------------
   · 구조 템플릿(MK_COMPOSE Composition) 카드: 권장 미디어 수·
     예상 길이·기본 비율을 정직하게 표시
   · 카드 선택 → 테마 칩 + 제목/부제(선택) → 파일 선택 →
     MK_COMPOSE.buildProject → 에디터 (MK_START.open 동일 경로)
   · R43 「빠른 시작」(MK_START)·기존 템플릿 진입은 그대로 존속
   · misc.js의 video 화면을 로드 순서로 승격 대체 (add-only 파일)
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_VIDHUB = (() => {
  const st = { comp: null, theme: null, ratio: null, title: '', sub: '', msg: '', itemsRaw: '', extra: {} }; /* R97 — 구조별 재료 */

  const comps = () => (window.MK_COMPOSE ? window.MK_COMPOSE.listCompositions() : []);
  const themes = () => (window.MK_COMPOSE ? window.MK_COMPOSE.listThemes() : []);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 카드 메타 문구 — 지시서 §R53: 권장 미디어 수·예상 길이·비율 */
  const mediaText = (c) => {
    const m = c.recommendedMediaCount || {};
    if (!m.min && !m.max) return '사진 없이도 가능';
    const range = m.min === m.max ? `${m.min}장` : `${m.min}~${m.max}장`;
    return `사진·영상 ${range}` + (m.ideal ? ` (딱 좋아요: ${m.ideal}장)` : '');
  };
  const durText = (c) => {
    const d = c.recommendedDuration || {};
    return d.default ? `약 ${d.default}초` : '길이 자동';
  };

  /* 선택 초기화 — 테마 기본값은 첫 번째 */
  function select(compId) {
    st.comp = st.comp === compId ? null : compId;
    st.msg = '';
    st.itemsRaw = ''; st.extra = {}; /* R97 — 구조가 바뀌면 재료도 새로 */
    if (st.comp && !st.theme) { const t = themes(); st.theme = t.length ? t[0].id : null; }
    /* R54 — 비율 override: 선택 시 구조 기본 비율, 해제 시 초기화 */
    if (st.comp && window.MK_COMPOSE) {
      const c = window.MK_COMPOSE.listCompositions().find((x) => x.id === st.comp);
      st.ratio = c ? c.defaultRatio : null;
    } else st.ratio = null;
  }

  /* 본체 — 미디어 배열로 프로젝트 생성 후 에디터 진입 (테스트 시임) */
  function startBuild(medias) {
    if (!window.MK_COMPOSE || !st.comp) return { ok: false, why: 'no-selection' };
    const texts = {};
    if (st.title.trim()) texts.title = st.title.trim();
    if (st.sub.trim()) texts.subtitle = st.sub.trim();
    /* R97 — 구조별 재료: 추가 텍스트 필드 + 항목 줄글 파싱. 빈 입력 = 종전 동작. */
    const IK = window.MK_INTAKE, sp = IK ? IK.spec(st.comp) : null;
    if (sp && sp.texts) for (const f of sp.texts) {
      const v = String(st.extra[f.key] || '').trim();
      if (v) texts[f.key] = v;
    }
    let items = null;
    if (sp && sp.items && st.itemsRaw.trim()) {
      const parsed = IK.parseItems(sp.items.kind, st.itemsRaw);
      if (parsed.length) items = parsed;
    }
    const r = window.MK_COMPOSE.buildProject(st.comp, st.theme, { medias: medias || [], texts, ...(items ? { items } : {}), ...(st.ratio ? { ratio: st.ratio } : {}) });
    if (!r.ok) { st.msg = r.guide || '만들 수 없어요 — 입력을 확인해 주세요.'; return r; }
    /* 정직 안내 — 남은 미디어·자동 조정 내역을 열기 전에 알린다 */
    const notes = (r.notes || []).slice();
    if (r.unusedMedia > 0 && !notes.some((n) => /남/.test(n))) notes.push(`사진 ${r.unusedMedia}장은 이 구조에 자리가 없어 쓰이지 않았어요.`);
    /* R93 — 정직 안내는 차단형 alert 아님: 워크스페이스 상단 한 줄로 전달 */
    if (notes.length && window.MK_WS) window.MK_WS.pendingNotice = notes.join(' · ');
    else if (notes.length && typeof window.alert === 'function') window.alert(notes.join('\n'));
    window.MK_START.open(r.doc);
    return r;
  }

  /* 파일 선택 → dataURL → startBuild (MK_START.readFiles 재사용) */
  function pick(onMsg) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*,video/*';
    inp.onchange = () => {
      if (!inp.files || !inp.files.length) return;
      if (onMsg) onMsg('여는 중… ' + inp.files.length + '개');
      window.MK_START.readFiles(inp.files, (medias, skipped) => {
        if (!medias.length) { if (onMsg) onMsg('열 수 있는 파일이 없어요' + (skipped.length ? ' — ' + skipped[0] : '')); return; }
        const r = startBuild(medias);
        if (!r.ok && onMsg) onMsg(st.msg);
        if (skipped.length && typeof window.alert === 'function') window.alert('건너뜀: ' + skipped.join(', '));
      });
    };
    inp.click();
  }

  /* ---------------- R75 — 재렌더는 언제나 사슬 맨 바깥에서 ----------------
     영상 화면은 다섯 층이 겹쳐 있다(video → video2 → video3 → video4 → video5).
     각 층은 자기 mount 안에서 `this.render()` + `this.mount()` 로 다시 그렸다.
     `this` 는 그 층 자신이므로 **위 층의 render 가 얹은 것도, mount 가 건
     배선도 다시 안 걸린다.** 실브라우저에서 확인한 결과:

       · ▲▼✕·캡션 확정(video2 층) → 역할 칩 16개·자동 구성 줄·씨앗 입력이
         통째로 사라짐 (R67~R74 가 얹은 것 전부)
       · 사진 순서 드래그(video3 층) → 칩은 남지만 R71 부분 갱신 배선이 죽어
         이후 ★ 클릭이 전체 재렌더로 퇴화 (CPU 6배·30장에서 3.9ms → 2,966ms)

     그래서 다시 그릴 때는 지금 화면으로 등록된 **맨 바깥 객체**로 그린다.
     자기 자신(self)은 아직 승격이 안 끝난 경우의 안전망이다. */
  const screenRedraw = (root, self) => () => {
    const top = window.MK_SCREENS && window.MK_SCREENS.video;
    const s = (top && typeof top.render === 'function' && typeof top.mount === 'function') ? top : self;
    root.innerHTML = s.render();
    s.mount(root);
  };

  /* ---------------- R76 — 순서만 바뀌면 목록을 다시 그리지 않는다 ----------------
     R75 가 재렌더를 「사슬 맨 바깥에서」로 고쳐 사라지는 문제는 끝났다.
     남은 것은 **비용**이다. 사진 순서를 한 칸 옮기는 데 30행을 통째로
     다시 만든다 — 실크롬 CPU 6배·30장에서 2,985 ms.

     그런데 순서 변경이 실제로 바꾸는 것은 둘뿐이다.
       · 행이 놓인 자리
       · 행에 매겨진 번호
     썸네일·문구·역할 칩은 **그 행에 붙어 그대로 따라간다**. 다시 만들
     이유가 없다. 그래서 노드를 옮기고 번호만 다시 매긴다.

     번호를 다시 매기는 것으로 충분한 까닭: 배선은 전부 누를 때
     `+x.dataset.vh...` 를 읽는다(닫힘에 가둔 값이 아니다). 속성만
     고치면 다시 걸 필요가 없다.

     R76 의 범위는 순서까지였다. ✕(빼기)는 장면 수·「지금 뺀 사진 N장」처럼
     개수에 딸린 줄을 같이 바꾸므로 그때 얹지 않았고, R82 가 removeRow 로
     마저 얹는다 — 개수 줄의 정직한 갱신은 부르는 쪽(video4)의 계약이다.
     R82 에서 쌍 행(data-vh-prow)도 같은 원시함수를 쓰도록 kind 로 넓혔다.
     kind 생략 = 'media' — R76 이 건 자리와 하니스는 한 글자도 안 바뀐다. */
  const ROW_KINDS = {
    media: {
      row: 'data-vh-mrow', num: null,
      idx: [['[data-vh-cap]', 'data-vh-cap'], ['[data-vh-mup]', 'data-vh-mup'],
        ['[data-vh-mdn]', 'data-vh-mdn'], ['[data-vh-mdel]', 'data-vh-mdel'],
        ['[data-vh-role]', 'data-i']],
    },
    pair: {
      row: 'data-vh-prow', num: '.vh-pairn',   /* 쌍 행만 눈에 보이는 번호가 있다 */
      idx: [['[data-vh-pb]', 'data-vh-pb'], ['[data-vh-pa]', 'data-vh-pa'],
        ['[data-vh-pt]', 'data-vh-pt'], ['[data-vh-pup]', 'data-vh-pup'],
        ['[data-vh-pdn]', 'data-vh-pdn'], ['[data-vh-pdel]', 'data-vh-pdel'],
        ['[data-vh-prole]', 'data-i']],
    },
  };

  /* R84 — lo·hi 를 주면 그 구간만 다시 맨다(splice 이동·삭제에서 번호가
     바뀌는 행은 구간뿐이다). 구간 밖은 setAttribute 대신 getAttribute 로
     「이미 제자리인지」만 읽는다 — 쓰기보다 훨씬 싸고, 하나라도 어긋나
     있으면(구멍) 전량 재부여로 스스로 고친다. R76 의 「번호에 구멍이
     안 난다」 보장은 그대로다: 전엔 무조건 다시 써서 지켰고, 이젠 읽어서
     확인하고 어긋난 날에만 다시 쓴다. lo·hi 생략 = 종전 전량(하위 호환). */
  const reindexRows = (root, kind, lo, hi) => {
    const K = ROW_KINDS[kind || 'media'];
    if (!K) return 0;
    const rows = root.querySelectorAll('[' + K.row + ']');
    let full = !(lo >= 0) || !(hi >= 0);
    if (!full) {
      if (lo > hi) { const t = lo; lo = hi; hi = t; }
      if (hi > rows.length - 1) hi = rows.length - 1;
      for (let i = 0; i < rows.length && !full; i++) {
        if (i >= lo && i <= hi) continue;
        if (rows[i].getAttribute(K.row) !== String(i)) full = true;   /* 구멍 → 자가 치유 */
      }
    }
    const a = full ? 0 : lo, b = full ? rows.length - 1 : hi;
    for (let i = a; i <= b; i++) {
      const row = rows[i], s = String(i);
      row.setAttribute(K.row, s);
      if (K.num) { const n = row.querySelector(K.num); if (n) n.textContent = String(i + 1); }
      for (let k = 0; k < K.idx.length; k++) {
        const els = row.querySelectorAll(K.idx[k][0]);
        for (let j = 0; j < els.length; j++) els[j].setAttribute(K.idx[k][1], s);
      }
    }
    return rows.length;
  };

  /* 배열의 splice 이동과 같은 뜻으로 옮긴다: from 을 빼고 to 자리에 끼운다.
     못 옮기면 거짓을 돌려주고, 부르는 쪽이 종전대로 다시 그린다. */
  const reorderRows = (root, from, to, kind) => {
    if (!root || typeof root.querySelectorAll !== 'function') return false;
    if (!(from >= 0) || !(to >= 0) || from === to) return false;
    const K = ROW_KINDS[kind || 'media'];
    if (!K) return false;
    const rows = Array.prototype.slice.call(root.querySelectorAll('[' + K.row + ']'));
    const node = rows[from];
    if (!node || !node.parentNode || to >= rows.length) return false;
    const rest = rows.slice(0, from).concat(rows.slice(from + 1));
    node.parentNode.insertBefore(node, rest[to] || null);
    /* R84 — splice 이동에서 번호가 바뀌는 행은 [min,max] 구간뿐이다 */
    reindexRows(root, kind, Math.min(from, to), Math.max(from, to));
    return true;
  };

  /* R82 — 빼기는 행 하나를 지우고 남은 행 번호를 다시 맨다.
     배열의 splice(i,1) 과 같은 뜻. 못 지우면 거짓을 돌려주고
     부르는 쪽이 종전대로 다시 그린다(되돌아갈 길). */
  const removeRow = (root, i, kind) => {
    if (!root || typeof root.querySelectorAll !== 'function') return false;
    if (!(i >= 0)) return false;
    const K = ROW_KINDS[kind || 'media'];
    if (!K) return false;
    const node = root.querySelectorAll('[' + K.row + ']')[i];
    if (!node || !node.parentNode) return false;
    node.parentNode.removeChild(node);
    /* R84 — splice(i,1)에서 번호가 바뀌는 행은 i 부터 끝까지다.
       i 앞은 제자리 — reindexRows 가 읽기 검사로 확인한다. */
    reindexRows(root, kind, i, Number.MAX_SAFE_INTEGER);
    return true;
  };

  return { st, select, startBuild, pick, mediaText, durText, esc, screenRedraw, reorderRows, reindexRows, removeRow };
})();

window.MK_SCREENS.video = {
  title: 'Video', variants: ['A'],
  render() {
    const H = window.MK_VIDHUB; const esc = H.esc;
    const cards = H.st && window.MK_COMPOSE ? window.MK_COMPOSE.listCompositions() : [];
    const cardHtml = cards.map((c) => `
      <button class="vh-card${H.st.comp === c.id ? ' on' : ''}" data-vh-comp="${c.id}">
        <b>${esc(c.name)}</b>
        <span class="vh-purpose">${esc(c.purpose || '')}</span>
        <span class="vh-meta">
          <span class="vh-badge">📷 ${esc(H.mediaText(c))}</span>
          <span class="vh-badge">⏱ ${esc(H.durText(c))}</span>
          <span class="vh-badge">${esc(c.defaultRatio)}</span>
        </span>
      </button>`).join('');

    let panel = '';
    if (H.st.comp) {
      const c = cards.find((x) => x.id === H.st.comp);
      const chips = (window.MK_COMPOSE.listThemes()).map((t) =>
        `<button class="vh-chip${H.st.theme === t.id ? ' on' : ''}" data-vh-theme="${t.id}">${esc(t.name)}</button>`).join('');
      /* R54 — 비율 칩: 기본 비율에 추천, 9:16에 쇼츠 라벨 정직 표기 */
      const ratioChips = (c ? c.supportedRatios : []).map((r) => {
        const label = r + (c.defaultRatio === r ? ' · 추천' : '') + (r === '9:16' ? ' · 쇼츠' : '');
        return `<button class="vh-chip${H.st.ratio === r ? ' on' : ''}" data-vh-ratio="${r}">${esc(label)}</button>`;
      }).join('');
      panel = `<div class="vh-panel" id="vhPanel">
        <b style="font:var(--mk-t-h3)">${esc(c ? c.name : '')} 만들기</b>
        <div style="margin-top:10px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">분위기</small><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${chips}</div></div>
        <div style="margin-top:10px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">화면 비율</small><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${ratioChips}</div></div>
        ${(() => { /* R97 — 구조별 재료 입력 */
          const IK = window.MK_INTAKE, sp = IK ? IK.spec(H.st.comp) : null;
          if (!sp) return '';
          let out = '';
          if (sp.note) out += `<p class="ed-note" style="margin-top:10px">${esc(sp.note)}</p>`;
          if (sp.items) out += `<div style="margin-top:10px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${esc(sp.items.label)}</small>
            <textarea class="vh-input" id="vhItems" rows="4" placeholder="${esc(sp.items.ph)}" style="margin-top:6px;resize:vertical;font:var(--mk-t-body-sm);line-height:1.5">${esc(H.st.itemsRaw)}</textarea>
            <small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${esc(sp.items.hint || '')}</small></div>`;
          if (sp.texts && sp.texts.length) out += `<div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:6px 8px">` + sp.texts.map((f) =>
            `<label style="display:flex;flex-direction:column;gap:3px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${esc(f.label)}</small>
             <input class="vh-input" data-vh-extra="${esc(f.key)}" placeholder="${esc(f.ph || '')}" value="${esc(H.st.extra[f.key] || '')}" maxlength="${f.max || 20}" style="margin-top:0"></label>`).join('') + `</div>`;
          return out;
        })()}
        <input class="vh-input" id="vhTitle" placeholder="제목 (비우면 제목 장면이 자동으로 빠져요)" value="${esc(H.st.title)}" maxlength="24">
        <input class="vh-input" id="vhSub" placeholder="부제 (선택)" value="${esc(H.st.sub)}" maxlength="30">
        <button class="vh-go" data-vh-pick>📁 사진·영상 고르고 만들기</button>
        <em id="vhMsg" style="display:block;margin-top:8px;font:var(--mk-t-body-sm);color:var(--mk-danger)">${esc(H.st.msg)}</em>
        <p class="ed-note" style="margin-top:8px">고른 사진 수에 맞춰 장면이 자동으로 늘고 줄어요 — 만들고 나서 글자·사진 전부 바꿀 수 있어요.</p>
      </div>`;
    }

    return `<span class="pg-note">구조를 고르면 사진 수에 맞춰 영상이 자동으로 짜여요 — 켄번즈·배경음까지 포함</span>
      <div class="vh-quick">
        <button class="ph-block st-act" data-st="vid-files" style="text-align:left;cursor:pointer">
          <b>⚡ 빠른 시작 — 내 사진·영상으로 15초</b>
          구조 없이 장당 1장면. 지금까지 방식 그대로.
          <em id="stMsgV" style="display:block;margin-top:6px;color:var(--mk-text-secondary)"></em></button>
        <button class="ph-block st-act" data-st="vid-tpl" style="text-align:left;cursor:pointer">
          <b>🎬 완성형 템플릿 — 행사 하이라이트 15초</b>
          사진 2장 + 문구 4개만 바꾸는 고정 구성.</button>
        <button class="ph-block st-act" data-st="go-projects" style="text-align:left;cursor:pointer">
          <b>▶ 하던 작업 이어서</b>
          내 프로젝트 목록에서 열어요.</button>
      </div>
      <h2 style="font:var(--mk-t-h2);margin:0 0 10px">구조 템플릿으로 만들기</h2>
      <div class="vh-grid">${cardHtml}</div>
      ${panel}
      <p class="ed-note" style="margin-top:12px">MP4 내보내기는 크롬·엣지에서 돼요 (소리 포함). 박자 맞춤(beatSync)은 아직 없어요 — 음악 길이 자동 맞춤·페이드아웃까지 돼요.</p>`;
  },
  mount(root) {
    const H = window.MK_VIDHUB;
    const redraw = H.screenRedraw(root, this);   /* R75 — 사슬 맨 바깥으로 */
    root.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => {
      if (b.dataset.st === 'vid-files') return window.MK_START.pickAndStart('video', (m) => { const el = root.querySelector('#stMsgV'); if (el) el.textContent = m; });
      if (b.dataset.st === 'vid-tpl') return window.MK_TPL.load('pk-vid-01');
      if (b.dataset.st === 'go-projects') return window.PG.go('projects');
    });
    root.querySelectorAll('[data-vh-comp]').forEach((b) => b.onclick = () => {
      H.select(b.dataset.vhComp); redraw();
      /* R88 — 패널은 카드 그리드 아래에 그려져 일반 노트북 높이에선 뷰포트 밖이다.
         선택이 됐는데 화면에 아무 변화가 안 보이면 사용자는 「반응이 없다」고 읽는다
         (준호 실기기 보고). 선택 즉시 다음 단계(분위기·비율·만들기)로 데려간다. */
      const p = root.querySelector('#vhPanel');
      if (p && p.scrollIntoView) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    root.querySelectorAll('[data-vh-theme]').forEach((b) => b.onclick = () => { H.st.theme = b.dataset.vhTheme; redraw(); });
    /* R99 — 구조 카드 호버 미리보기: 진짜 엔진 샘플 빌드를 진짜 렌더러로.
       마우스 전용(hover 가능 환경) — 터치는 탭=선택이 이미 미리보기 역할. */
    (() => {
      if (!window.MK_PREVIEW || !window.MK_PLAY) return;
      if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
      let pop = null, cycle = null, showT = null, curScenes = null, curIdx = 0;
      const kill = () => {
        if (showT) { clearTimeout(showT); showT = null; }
        if (cycle) { clearInterval(cycle); cycle = null; }
        if (pop) { pop.remove(); pop = null; }
        curScenes = null;
      };
      const AR = { '16:9': '16/9', '9:16': '9/16', '1:1': '1/1', '4:5': '4/5' };
      const renderScene = () => {
        if (!pop || !curScenes) return;
        const stage = pop.querySelector('.vh-pv-stage');
        if (stage) {
          stage.innerHTML = window.MK_PLAY.sceneHTML(curScenes[curIdx], { still: true });
          const dots = pop.querySelector('.vh-pv-dots');
          if (dots) dots.innerHTML = curScenes.map((_, i) => `<i class="${i === curIdx ? 'on' : ''}"></i>`).join('');
        }
      };
      const show = (card) => {
        const pv = window.MK_PREVIEW.build(card.dataset.vhComp, H.st.theme || null);
        if (!pv.ok || !pv.scenes.length) return;
        kill();
        curScenes = pv.scenes; curIdx = 0;
        pop = document.createElement('div');
        pop.className = 'vh-pv';
        pop.style.setProperty('--pv-ar', AR[pv.ratio] || '16/9');
        pop.innerHTML = `<div class="vh-pv-stage"></div><div class="vh-pv-dots"></div><small>미리보기 — 실제 빌드 그대로</small>`;
        const r = card.getBoundingClientRect();
        const w2 = pv.ratio === '16:9' ? 300 : 190;
        pop.style.width = w2 + 'px';
        const px = Math.max(8, Math.min(window.innerWidth - w2 - 8, r.left + r.width / 2 - w2 / 2));
        pop.style.left = px + 'px';
        pop.style.top = Math.max(8, r.top - 10) + 'px';
        pop.style.transform = 'translateY(-100%)';
        document.body.appendChild(pop);
        renderScene();
        if (curScenes.length > 1) cycle = setInterval(() => { curIdx = (curIdx + 1) % curScenes.length; renderScene(); }, 1100);
      };
      root.querySelectorAll('[data-vh-comp]').forEach((card) => {
        card.addEventListener('mouseenter', () => { kill(); showT = setTimeout(() => show(card), 160); });
        card.addEventListener('mouseleave', kill);
        card.addEventListener('click', kill, true);
      });
      window.addEventListener('hashchange', kill, { once: true });
    })();
    root.querySelectorAll('[data-vh-ratio]').forEach((b) => b.onclick = () => { H.st.ratio = b.dataset.vhRatio; redraw(); });
    const ti = root.querySelector('#vhTitle'); if (ti) ti.oninput = () => { H.st.title = ti.value; };
    const su = root.querySelector('#vhSub'); if (su) su.oninput = () => { H.st.sub = su.value; };
    /* R97 — 구조별 재료 입력 배선 */
    const it = root.querySelector('#vhItems'); if (it) it.oninput = () => { H.st.itemsRaw = it.value; };
    root.querySelectorAll('[data-vh-extra]').forEach((n) => n.oninput = () => { H.st.extra[n.dataset.vhExtra] = n.value; });
    const go = root.querySelector('[data-vh-pick]'); if (go) go.onclick = () => H.pick((m) => { const el = root.querySelector('#vhMsg'); if (el) el.textContent = m; });
  },
};
