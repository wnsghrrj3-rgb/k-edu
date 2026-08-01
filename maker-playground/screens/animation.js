/* ============================================================
   화면: Animation Studio  (#/animation)
   ------------------------------------------------------------
   "Template의 애니메이션을 교체하고 조절한다" — 만들지 않는다.
   좌: Animation Preset 갤러리 9종 (클릭 = 슬롯에 적용 + 데모 재생)
   중앙: Stage — ▶ Play로 enter→idle→exit 실재생(CSS), 진행 위상 표시
   우: Scene Animation 3슬롯(Enter·Idle·Exit) +
       선택 요소의 Element Animation 5속성(Delay·Duration·Direction·Ease·Repeat)
   하단: 간단 Scene Timeline (enter/idle/exit 구간 시각화 + 씬 선택)
   ⚠ 실영상 렌더링 없음 — CSS 재생은 미리보기용.
   ============================================================ */
(() => {
  const M = () => window.MK, AN = () => window.MK_ANIM;

  /* 대상 문서: 현재 프로젝트가 있으면 그것, 없으면 영상 샘플 사본 */
  const ST = { docRef: null, sceneIdx: 0, selEl: null, playing: false, phase: '—', slot: 'enter', cancel: null };
  function docd() {
    /* R59 — 항상 현재 프로젝트를 추적. 캐시 고정이 「편집이 반영 안 됨」의 원인이었다.
       프로젝트가 바뀌면 씬 인덱스·선택 초기화, 프로젝트가 없을 때만 샘플 사본. */
    const cur = window.MK_PROJ.current();
    if (cur) {
      if (ST.docRef !== cur.doc) { ST.docRef = cur.doc; ST.sceneIdx = 0; ST.selEl = null; }
      return ST.docRef;
    }
    if (!ST.docRef || ST.docRef.__sample !== true) {
      ST.docRef = JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES.find((t) => t.contentType === 'video')));
      ST.docRef.__sample = true;
      ST.sceneIdx = 0; ST.selEl = null;
    }
    return ST.docRef;
  }
  const scene = () => {
    const d = docd();
    const sc = d.scenes[ST.sceneIdx];
    AN().ensure(sc, d.engine?.animationId);
    return sc;
  };

  /* ---------- 좌: Preset 갤러리 ---------- */
  const Gallery = () => {
    const sc = scene();
    const cur = sc.anim[ST.slot]?.preset;
    const list = ST.slot === 'idle' ? AN().IDLES : AN().PRESETS;
    return `<div class="an-gallery">
      <h3>Preset</h3>
      <p class="mut">지금 고르는 슬롯: <b>${({ enter: 'Enter', idle: 'Idle', exit: 'Exit' })[ST.slot]}</b></p>
      <div class="cards">${list.map((p) => `<button class="pcard ${cur === p.key ? 'on' : ''}" data-an-preset="${p.key}">
        <span class="demo"><i class="mka-loop-${p.key}"></i></span>
        <b>${p.name}</b><small>${p.ko || ''} — ${p.desc}</small></button>`).join('')}</div>
    </div>`;
  };

  /* ---------- 중앙: Stage + Play ---------- */
  const BASE_W = 460;
  const Stage = () => {
    const m = M(), sc = scene();
    const CW = BASE_W, CH = Math.round(CW * sc.height / sc.width);
    const els = sc.elements.map((el, i) => {
      const on = ST.selEl === i ? 'sel' : '';
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        const ts = window.MK_TEXTSTYLE ? window.MK_TEXTSTYLE.css(el) : ''; /* R56 스타일 동률 */
        return `<div class="an-el ${on}" data-mka data-an-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400}${el.color ? `;color:${el.color}` : ''}${el.align ? `;text-align:${el.align}` : ''}${ts}">${m.esc(el.text).replace(/\n/g, '<br>')}</div>`;
      }
      if (el.src) { /* R57 — 실이미지·실영상 (R45 Workspace 동일) */
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video class="an-media" src="${el.src}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:${fit};display:block"></video>`
          : `<img class="an-media" src="${el.src}" alt="${m.esc(el.label || '')}" draggable="false" style="width:100%;height:100%;object-fit:${fit};display:block">`;
        return `<div class="an-el media ${on}" data-mka data-an-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden">${media}</div>`;
      }
      if (el.fill) return `<div class="an-el media ${on}" data-mka data-an-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;background:${el.fill}${el.radius ? `;border-radius:${el.radius > 100 ? '50%' : el.radius + 'px'}` : ''}"></div>`;
      return `<div class="an-el box ${on}" data-mka data-an-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%"><span>${m.esc(el.label || '요소')}</span></div>`;
    }).join('');
    return `<div class="an-stagewrap">
      <div class="an-stagehead">
        ${m.Button({ label: ST.playing ? '■ 정지' : '▶ Play', kind: 'accent', size: 'sm', attrs: 'data-an="play"' })}
        <span class="phase">위상: <b id="anPhase">${ST.phase}</b></span>
        <span class="grow"></span>
        <small class="mut">사진·문구 교체 + 스타일 변경만으로 완성 — 애니는 프리셋 교체·조절</small>
      </div>
      <div class="an-stagebg"><div class="an-stage" id="anStage" style="width:${CW}px;height:${CH}px;background:${sc.background}">${els}</div></div>
    </div>`;
  };

  /* ---------- 우: Scene 3슬롯 + Element 5속성 ---------- */
  const sfld = (label, inner) => `<label class="cx-field"><span>${label}</span>${inner}</label>`;
  const Panel = () => {
    const m = M(), sc = scene();
    const slotBtn = (k, n) => {
      const p = sc.anim[k].preset;
      const nm = k === 'idle' ? (AN().IDLES.find((x) => x.key === p) || {}).name : AN().preset(p).name;
      return `<button class="slot ${ST.slot === k ? 'on' : ''}" data-an-slot="${k}"><small>${n}</small><b>${nm || p}</b></button>`;
    };
    let elPanel = `<p class="mut" style="margin-top:10px">무대에서 요소를 누르면<br>요소별 세부 조절이 열려요</p>`;
    if (typeof ST.selEl === 'number' && sc.elements[ST.selEl]) {
      const a = sc.elements[ST.selEl].anim;
      const presetOpts = [['inherit', 'Scene 따라감'], ...AN().PRESETS.map((p) => [p.key, p.name])];
      const needDir = a.preset !== 'inherit' ? AN().preset(a.preset).dir : AN().preset(sc.anim.enter.preset).dir;
      elPanel = `<div class="an-elprops"><h4>선택 요소 — Element Animation</h4>
        ${sfld('Preset', `<select data-an-e="preset">${presetOpts.map(([k, n]) => `<option value="${k}" ${a.preset === k ? 'selected' : ''}>${n}</option>`).join('')}</select>`)}
        ${sfld('Delay (초)', `<input type="number" step="0.05" min="0" max="5" value="${a.delay}" data-an-e="delay">`)}
        ${sfld('Duration (초)', `<input type="number" step="0.1" min="0.1" max="4" value="${a.duration}" data-an-e="duration">`)}
        ${needDir ? sfld('Direction', `<select data-an-e="direction">${AN().DIRECTIONS.map(([k, n]) => `<option value="${k}" ${a.direction === k ? 'selected' : ''}>${n}</option>`).join('')}</select>`) : ''}
        ${sfld('Ease', `<select data-an-e="ease">${AN().EASES.map(([k, n]) => `<option value="${k}" ${a.ease === k ? 'selected' : ''}>${n}</option>`).join('')}</select>`)}
        ${sfld('Repeat', `<select data-an-e="repeat">${[1, 2, 3].map((r) => `<option value="${r}" ${a.repeat === r ? 'selected' : ''}>${r}회</option>`).join('')}</select>`)}
      </div>`;
    }
    return `<div class="ws-context an-panel"><small class="cap">Animation</small><h3>Scene Animation</h3>
      <div class="slots">${slotBtn('enter', 'Enter')}${slotBtn('idle', 'Idle')}${slotBtn('exit', 'Exit')}</div>
      <p class="mut">슬롯을 고른 뒤 왼쪽 Preset을 누르면 교체돼요</p>
      ${ST.slot !== 'idle' ? sfld('슬롯 Duration (초)', `<input type="number" step="0.1" min="0.1" max="3" value="${sc.anim[ST.slot].duration}" data-an-s="duration">`) : ''}
      ${elPanel}
    </div>`;
  };

  /* ---------- 하단: Scene Timeline (간단) ---------- */
  const Timeline = () => {
    const d = docd();
    return `<div class="an-timeline">${d.scenes.map((s, i) => {
      AN().ensure(s, d.engine?.animationId);
      const total = Math.max(s.duration || 3, 1);
      const inW = Math.min(90, s.anim.enter.duration / total * 100);
      const outW = Math.min(90 - inW, s.anim.exit.duration / total * 100);
      /* R58 — 선택 칩에는 그 자리 시간 조절(−/입력/+), 나머지는 클릭=선택 */
      const dur = i === ST.sceneIdx
        ? `<small>${i + 1} ·</small><span class="mk-durctl" data-stop>
             <button data-an-dm="${i}" title="0.5초 줄이기">−</button>
             <input type="number" step="0.5" min="1" max="30" value="${total}" data-an-dv="${i}">s
             <button data-an-dp="${i}" title="0.5초 늘리기">＋</button></span>`
        : `<small>${i + 1} · ${total}s</small>`;
      /* 선택 칩은 div — button 중첩은 HTML 파서가 분해한다 */
      const tag = i === ST.sceneIdx ? 'div' : 'button';
      return `<${tag} class="tl ${i === ST.sceneIdx ? 'on' : ''}" style="flex:${total}" data-an-sc="${i}">
        <span class="seg in" style="width:${inW}%" title="Enter"></span>
        <span class="seg idle" style="width:${Math.max(4, 100 - inW - outW)}%" title="Idle"></span>
        <span class="seg out" style="width:${outW}%" title="Exit"></span>
        ${dur}</${tag}>`;
    }).join('')}
    <div class="legend"><span class="k in"></span>Enter <span class="k idle"></span>Idle <span class="k out"></span>Exit</div></div>`;
  };

  /* ---------- 화면 ---------- */
  window.MK_SCREENS.animation = {
    title: 'Animation', variants: ['v1'],
    render() {
      return `<span class="pg-note">Animation Engine v1 — 프리셋 교체·조절(제작 아님) · CSS 실재생 미리보기 · 영상 렌더링은 후속</span>
        <div class="an-shell">${Gallery()}<div class="an-main">${Stage()}${Timeline()}</div>${Panel()}</div>`;
    },
    mount(root) {
      const R = () => {
        /* R59 — 편집 디바운스 자동 저장 (샘플 편집은 저장 대상 아님) */
        if (window.MK_LIVE && window.MK_PROJ.current()) window.MK_LIVE.autosave(docd());
        PG.render();
      };
      const stopPlay = () => { if (ST.cancel) { ST.cancel(); ST.cancel = null; } ST.playing = false; ST.phase = '—'; };

      /* Play */
      root.querySelectorAll('[data-an]').forEach((b) => b.onclick = () => {
        if (ST.playing) { stopPlay(); R(); return; }
        ST.playing = true; ST.phase = 'enter'; R();
        const stage = document.getElementById('anStage');
        ST.cancel = AN().play(stage, scene(), {
          onPhase(ph) {
            ST.phase = ph;
            const el = document.getElementById('anPhase');
            if (el) el.textContent = ph;
            if (ph === 'done') { stopPlay(); PG.render(); }
          },
        });
      });

      /* Preset 적용 (현재 슬롯) — R57: 적용 즉시 스테이지에서 데모 재생 */
      root.querySelectorAll('[data-an-preset]').forEach((b) => b.onclick = () => {
        stopPlay();
        scene().anim[ST.slot].preset = b.dataset.anPreset;
        R();
        setTimeout(() => {
          const stage = document.getElementById('anStage');
          if (!stage) return;
          if (ST.cancel) ST.cancel();
          ST.cancel = AN().playPhase(stage, scene(), ST.slot === 'idle' ? 'idle' : ST.slot === 'enter' ? 'in' : 'out');
        }, 30);
      });

      /* 슬롯 선택·슬롯 duration */
      root.querySelectorAll('[data-an-slot]').forEach((b) => b.onclick = () => { ST.slot = b.dataset.anSlot; R(); });
      const sd = root.querySelector('[data-an-s="duration"]');
      if (sd) sd.onchange = () => { scene().anim[ST.slot].duration = Math.max(0.1, +sd.value || 0.6); R(); };

      /* 요소 선택 + Element 5속성 */
      root.querySelectorAll('[data-an-el]').forEach((el) => el.onclick = () => { ST.selEl = +el.dataset.anEl; R(); });
      root.querySelectorAll('[data-an-e]').forEach((inp) => inp.onchange = () => {
        const a = scene().elements[ST.selEl].anim;
        const k = inp.dataset.anE;
        a[k] = (k === 'delay' || k === 'duration') ? Math.max(0, +inp.value || 0) : (k === 'repeat' ? +inp.value : inp.value);
        R();
      });

      /* Timeline 씬 선택 — 조절 컨트롤 클릭은 선택으로 번지지 않게 */
      root.querySelectorAll('[data-an-sc]').forEach((b) => b.onclick = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('[data-stop]')) return;
        stopPlay(); ST.sceneIdx = +b.dataset.anSc; ST.selEl = null; R();
      });
      /* R58 — 씬 길이 그 자리 조절 (0.5초 단위, 1~30초 클램프) */
      const setDur = (i, v) => {
        const sc2 = docd().scenes[i];
        sc2.duration = Math.round(Math.min(30, Math.max(1, v)) * 10) / 10;
        R();
      };
      root.querySelectorAll('[data-an-dm]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); const i = +b.dataset.anDm; setDur(i, (docd().scenes[i].duration || 3) - 0.5); });
      root.querySelectorAll('[data-an-dp]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); const i = +b.dataset.anDp; setDur(i, (docd().scenes[i].duration || 3) + 0.5); });
      root.querySelectorAll('[data-an-dv]').forEach((inp) => {
        inp.onclick = (ev) => ev.stopPropagation();
        inp.onchange = (ev) => { ev.stopPropagation(); setDur(+inp.dataset.anDv, +inp.value || 3); };
      });
    },
  };
})();
