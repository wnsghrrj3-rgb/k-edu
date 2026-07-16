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
    if (ST.docRef) return ST.docRef;
    const cur = window.MK_PROJ.current();
    ST.docRef = cur ? cur.doc : JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES.find((t) => t.contentType === 'video')));
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
        return `<div class="an-el ${on}" data-mka data-an-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400}">${m.esc(el.text).replace(/\n/g, '<br>')}</div>`;
      }
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
      return `<button class="tl ${i === ST.sceneIdx ? 'on' : ''}" style="flex:${total}" data-an-sc="${i}">
        <span class="seg in" style="width:${inW}%" title="Enter"></span>
        <span class="seg idle" style="width:${Math.max(4, 100 - inW - outW)}%" title="Idle"></span>
        <span class="seg out" style="width:${outW}%" title="Exit"></span>
        <small>${i + 1} · ${total}s</small></button>`;
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
      const R = () => PG.render();
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

      /* Preset 적용 (현재 슬롯) */
      root.querySelectorAll('[data-an-preset]').forEach((b) => b.onclick = () => {
        stopPlay();
        scene().anim[ST.slot].preset = b.dataset.anPreset;
        R();
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

      /* Timeline 씬 선택 */
      root.querySelectorAll('[data-an-sc]').forEach((b) => b.onclick = () => { stopPlay(); ST.sceneIdx = +b.dataset.anSc; ST.selEl = null; R(); });
    },
  };
})();
