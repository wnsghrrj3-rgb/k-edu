/* ============================================================
   MK_START (R43) — "고르면 바로 시작" 문서 빌더
   ------------------------------------------------------------
   Photo·Video 화면의 존재 이유 = 파일을 고르는 순간
   편집 가능한 문서가 열리는 것. 설명이 아니라 실행.
   · buildDoc(medias, opts) — 순수 함수(jsdom 완전 검증)
   · open(doc) — 프로젝트 생성 → Workspace/Editor (MK_TPL.load 동일 경로)
   · pickAndStart(mode) — 파일 선택 → fileToSrc → buildDoc → open
   ============================================================ */
window.MK_START = (() => {
  'use strict';

  /* medias: [{name, kind:'image'|'video', src}] · opts: {mode:'photo'|'video', title} */
  function buildDoc(medias, opts) {
    const o = opts || {};
    const mode = o.mode === 'video' ? 'video' : 'photo';
    if (!Array.isArray(medias) || !medias.length) return null;
    const scenes = medias.map((m, i) => {
      const kind = m.kind === 'video' ? 'video' : 'image';
      const els = [{
        kind: 'image', x: 0, y: 0, w: 100, h: 100, label: m.name || (kind === 'video' ? '영상' : '사진'),
        ...(m.src ? { src: m.src } : {}), ...(kind === 'video' ? { video: true } : {}),
        anim: { preset: 'fade', delay: 0.05, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 },
      }];
      if (i === 0) {
        els.push(
          { kind: 'image', x: 0, y: 74, w: 100, h: 26, label: '', fill: '#151B26',
            anim: { preset: 'slide', delay: 0.3, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } },
          { kind: 'text', x: 6, y: 79, w: 88, size: 5.2, text: o.title || (mode === 'video' ? '제목을 입력하세요' : '사진의 제목'), weight: 800, color: '#F5F7FA',
            anim: { preset: 'fade', delay: 0.55, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } },
          { kind: 'text', x: 6, y: 89, w: 88, size: 2.6, text: '한 줄 설명을 쓰세요', weight: 400, color: '#8E9AAC',
            anim: { preset: 'fade', delay: 0.7, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 } },
        );
      }
      return {
        id: 'st' + (i + 1), name: (kind === 'video' ? '영상 ' : '사진 ') + (i + 1),
        width: 1280, height: 720, duration: mode === 'video' ? 3 : 5,
        background: '#151B26', transition: 'fade', order: i,
        ...(mode === 'video' ? { music: { name: '신나는 비트', synth: 'beat' } } : {}),
        elements: els,
      };
    });
    return {
      templateId: null,
      title: o.title || (mode === 'video' ? '내 사진으로 만든 영상' : '내 사진 문서'),
      contentType: mode === 'video' ? 'video' : 'presentation',
      category: mode === 'video' ? '영상' : '발표자료',
      ratio: '16:9', scenes,
    };
  }

  /* MK_TPL.load와 동일 경로 — 프로젝트 생성 후 열기 */
  function open(doc) {
    if (!doc) return null;
    if (window.MK_PROJ) {
      const p = window.MK_PROJ.createFromDoc(doc, doc.title);
      window.MK_PROJ.open(p.projectId);
      return p.doc;
    }
    window.PG.openEditorDoc(doc);
    return doc;
  }

  /* 파일 여러 장 → dataURL 순차 읽기 (fileToSrc 재사용, 실패 파일은 건너뜀·정직 보고) */
  function readFiles(files, done, ReaderCls) {
    const list = [...files]; const out = []; const skipped = [];
    (function next(i) {
      if (i >= list.length) return done(out, skipped);
      const f = list[i];
      window.MK_LIVE.fileToSrc(f, (src, err) => {
        if (src) out.push({ name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image', src });
        else skipped.push(f.name + (err ? ' (' + err + ')' : ''));
        next(i + 1);
      }, ReaderCls);
    })(0);
  }

  function pickAndStart(mode, onMsg) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true;
    inp.accept = mode === 'video' ? 'image/*,video/*' : 'image/*';
    inp.onchange = () => {
      if (!inp.files || !inp.files.length) return;
      if (onMsg) onMsg('여는 중… ' + inp.files.length + '개');
      readFiles(inp.files, (medias, skipped) => {
        if (!medias.length) { if (onMsg) onMsg('열 수 있는 파일이 없어요' + (skipped.length ? ' — ' + skipped[0] : '')); return; }
        const doc = buildDoc(medias, { mode });
        open(doc);
        if (skipped.length && typeof alert === 'function') alert('건너뜀: ' + skipped.join(', '));
      });
    };
    inp.click();
  }

  return { buildDoc, open, readFiles, pickAndStart };
})();
