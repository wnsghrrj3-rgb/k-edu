/* ============================================================
   K-MAKER Animation Engine v1  —  window.MK_ANIM
   ------------------------------------------------------------
   철학: Animation은 사용자가 만드는 게 아니라 **Template가 가진
   것을 교체·조절**하는 것. 사진 교체·문구 교체·애니 스타일 변경만으로
   결과물이 나오는 구조.
   ------------------------------------------------------------
   · PRESETS 9종 (지시서 고정: Fade·Slide·Scale·Zoom·Pop·Bounce·
     Wipe·Blur·Rotate) — CSS 키프레임으로 실재생(영상 렌더링 아님)
   · Scene Animation  = enter · idle · exit 3슬롯
   · Element Animation = delay · duration · direction · ease · repeat
   · ensure(scene)     = 스키마 기본값 주입 (템플릿 오버레이 승계)
   · play(stageEl, scene, opts) = enter→idle→exit 시퀀스 실행
   ⚠ Placeholder — 실영상 렌더링 없음. 스키마가 렌더 엔진 기준.
   ============================================================ */
window.MK_ANIM = (() => {

  /* ---------- Animation Preset 9종 ---------- */
  const PRESETS = [
    { key: 'fade',   name: 'Fade',   ko: '스르륵',   dir: false, desc: '투명도만 — 어디에나 어울려요' },
    { key: 'slide',  name: 'Slide',  ko: '밀려오기', dir: true,  desc: '방향에서 미끄러져 들어와요' },
    { key: 'scale',  name: 'Scale',  ko: '커지기',   dir: false, desc: '작게 시작해 제 크기로' },
    { key: 'zoom',   name: 'Zoom',   ko: '줌인',     dir: false, desc: '크게 시작해 착지해요' },
    { key: 'pop',    name: 'Pop',    ko: '팝',       dir: false, desc: '통통 튀며 등장 — 강조용' },
    { key: 'bounce', name: 'Bounce', ko: '바운스',   dir: false, desc: '떨어져 통통 — 아이들이 좋아해요' },
    { key: 'wipe',   name: 'Wipe',   ko: '닦아내기', dir: true,  desc: '가림막이 걷히듯' },
    { key: 'blur',   name: 'Blur',   ko: '초점',     dir: false, desc: '흐림에서 또렷하게' },
    { key: 'rotate', name: 'Rotate', ko: '기울여',   dir: false, desc: '살짝 돌며 자리를 잡아요' },
  ];
  /* Idle(머무는 동안)은 은은한 3종 — 과하면 산만 */
  const IDLES = [
    { key: 'none',  name: '없음',  desc: '정지' },
    { key: 'float', name: '부유',  desc: '위아래로 천천히' },
    { key: 'pulse', name: '맥동',  desc: '크기가 은은하게' },
  ];
  const EASES = [
    ['ease-out', '자연스럽게(기본)'], ['ease-in-out', '부드럽게'], ['linear', '일정하게'],
    ['cubic-bezier(.34,1.56,.64,1)', '통통하게'],
  ];
  const DIRECTIONS = [['up', '↑ 아래→위'], ['down', '↓ 위→아래'], ['left', '← 오른쪽→왼쪽'], ['right', '→ 왼쪽→오른쪽']];

  const preset = (k) => PRESETS.find((p) => p.key === k) || PRESETS[0];

  /* ---------- 기본값 (템플릿 animationId 승계) ---------- */
  const BASE_BY_ENGINE = {
    'an-none':  { enter: 'fade',  idle: 'none',  exit: 'fade' },
    'an-calm':  { enter: 'fade',  idle: 'none',  exit: 'fade' },
    'an-seq':   { enter: 'slide', idle: 'none',  exit: 'fade' },
    'an-slide': { enter: 'slide', idle: 'none',  exit: 'slide' },
    'an-pop':   { enter: 'pop',   idle: 'float', exit: 'zoom' },
  };
  const slot = (p, over = {}) => ({ preset: p, duration: 0.6, direction: 'up', ease: 'ease-out', ...over });

  /* Scene·Element에 애니 스키마 없으면 주입 (idempotent) */
  function ensure(scene, engineAnimId) {
    if (!scene.anim) {
      const base = BASE_BY_ENGINE[engineAnimId] || BASE_BY_ENGINE['an-calm'];
      scene.anim = { enter: slot(base.enter), idle: { preset: base.idle }, exit: slot(base.exit, { duration: 0.4 }) };
    }
    scene.elements.forEach((el, i) => {
      if (!el.anim) el.anim = { preset: 'inherit', delay: +(i * 0.15).toFixed(2), duration: 0.6, direction: 'up', ease: 'ease-out', repeat: 1 };
    });
    return scene;
  }

  /* ---------- 재생 시퀀서 ----------
     stageEl: 씬이 렌더된 DOM 컨테이너 (.mka-el 요소들 포함)
     scene:   ensure된 씬
     opts:    { onPhase(phase), idleMs } → cancel() 반환 */
  function play(stageEl, scene, opts = {}) {
    const timers = [];
    const els = [...stageEl.querySelectorAll('[data-mka]')];
    const A = scene.anim;
    const set = (el, spec, phase) => {
      const p = spec.preset === 'inherit' ? A.enter.preset : spec.preset;
      el.style.setProperty('--mka-dur', (spec.duration ?? A.enter.duration) + 's');
      el.style.setProperty('--mka-delay', (spec.delay ?? 0) + 's');
      el.style.setProperty('--mka-ease', spec.ease || A.enter.ease);
      el.style.setProperty('--mka-repeat', spec.repeat > 1 ? spec.repeat : 1);
      el.className = el.className.replace(/\bmka-(in|idle|out)-\S+/g, '').trim();
      el.classList.add(`mka-${phase}-${p}`, `mka-dir-${spec.direction || 'up'}`);
    };
    /* enter — 요소별 delay 반영 */
    els.forEach((el, i) => {
      const spec = scene.elements[i]?.anim || {};
      set(el, { ...A.enter, ...spec, preset: spec.preset === 'inherit' || !spec.preset ? A.enter.preset : spec.preset }, 'in');
    });
    opts.onPhase?.('enter');
    const maxIn = Math.max(...els.map((_, i) => (scene.elements[i]?.anim?.delay || 0) + (scene.elements[i]?.anim?.duration || A.enter.duration)), A.enter.duration);
    /* idle */
    timers.push(setTimeout(() => {
      if (A.idle.preset !== 'none') els.forEach((el) => { el.className = el.className.replace(/\bmka-(in|idle|out)-\S+/g, '').trim(); el.classList.add(`mka-idle-${A.idle.preset}`); });
      opts.onPhase?.('idle');
    }, maxIn * 1000 + 60));
    /* exit */
    const idleMs = opts.idleMs ?? Math.max(600, ((scene.duration || 3) - maxIn - A.exit.duration) * 1000);
    timers.push(setTimeout(() => {
      els.forEach((el) => set(el, A.exit, 'out'));
      opts.onPhase?.('exit');
    }, maxIn * 1000 + 60 + idleMs));
    timers.push(setTimeout(() => opts.onPhase?.('done'), maxIn * 1000 + 60 + idleMs + A.exit.duration * 1000 + 60));
    return () => timers.forEach(clearTimeout);
  }

  /* R57 — 단일 위상 즉시 데모: 프리셋 클릭 피드백용.
     phase: 'in' | 'out' | 'idle'. enter/exit는 duration 뒤 클래스 정리, idle은 루프 유지. */
  function playPhase(stageEl, scene, phase) {
    if (!stageEl) return () => {};
    const timers = [];
    const els = [...stageEl.querySelectorAll('[data-mka]')];
    const A = scene.anim;
    const clear = (el) => { el.className = el.className.replace(/\bmka-(in|idle|out)-\S+/g, '').trim(); };
    if (phase === 'idle') {
      els.forEach((el) => { clear(el); if (A.idle.preset !== 'none') el.classList.add(`mka-idle-${A.idle.preset}`); });
      return () => els.forEach(clear);
    }
    const slot = phase === 'in' ? A.enter : A.exit;
    els.forEach((el) => {
      el.style.setProperty('--mka-dur', slot.duration + 's');
      el.style.setProperty('--mka-delay', '0s');
      el.style.setProperty('--mka-ease', slot.ease || 'ease-out');
      el.style.setProperty('--mka-repeat', 1);
      clear(el);
      el.classList.add(`mka-${phase}-${slot.preset}`, `mka-dir-${slot.direction || 'up'}`);
    });
    timers.push(setTimeout(() => els.forEach(clear), slot.duration * 1000 + 120));
    return () => { timers.forEach(clearTimeout); els.forEach(clear); };
  }

  return { PRESETS, IDLES, EASES, DIRECTIONS, preset, ensure, play, playPhase };
})();
