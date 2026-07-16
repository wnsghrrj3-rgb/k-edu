/* ============================================================
   화면: Editor v1 — "가장 편하고 직관적인 제작 경험"
   구역 역할 고정: 좌 = 추가 · 중앙 = 편집 · 우 = 속성
   6구역 = 독립 렌더 함수 (Toolbar/MainMenu/DetailPanel/CanvasArea/
   PropsPanel/BottomBar) — GPT 시안 교체 시 함수 단위로 갈아입힘.
   Design 모드: 하단 Scene Strip / Video 모드: 길이 타임라인.
   ⚠ 더미 편집 — Scene 선택·텍스트 입력·이미지 교체·씬 조작·줌만 동작.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.editor = (() => {
  const M = () => window.MK;
  const ed = () => PG.state.editor;

  /* ================= Toolbar (뒤로·프로젝트명·실행취소·다시실행·저장·미리보기·공유·내보내기) ================= */
  const Toolbar = (mode) => {
    const e = ed();
    return `<div class="ed-toolbar">
      ${M().IconButton({ icon: '←', tip: '나가기', attrs: 'data-ed="back"' })}
      <span class="fname">${M().esc(e.doc.title)}</span>
      <span class="savestate" id="edSave">${e.savedAt ? '저장됨 · ' + e.savedAt : '저장 안 함'}</span>
      <span class="grow"></span>
      ${M().IconButton({ icon: '↺', tip: '실행 취소 (더미)' })}
      ${M().IconButton({ icon: '↻', tip: '다시 실행 (더미)' })}
      ${M().Button({ label: '저장', kind: 'secondary', size: 'sm', attrs: 'data-ed="save"' })}
      ${M().Tabs({ items: ['Design', 'Video'], on: mode === 'video' ? 'Video' : 'Design', attrs: 'data-ed="mode"' })}
      ${M().Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ed="preview"' })}
      ${M().Button({ label: '공유', kind: 'secondary', size: 'sm', attrs: 'data-ed="share"' })}
      ${M().Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ed="export"' })}
    </div>`;
  };

  /* ================= Left: Main Menu (추가) ================= */
  const MENUS = [['tpl', '📐', '템플릿'], ['ai', '✨', 'AI'], ['text', '가', '텍스트'], ['el', '⬡', '요소'],
    ['photo', '🖼', '사진'], ['video', '🎬', '영상'], ['audio', '🎵', '오디오'], ['bg', '🎨', '배경'], ['up', '⤴', '업로드']];
  const MainMenu = () => `<div class="ed-mainmenu"><small class="ed-zone-cap">추가</small>` +
    MENUS.map(([k, i, n]) => `<button class="${ed().menu === k ? 'on' : ''}" data-menu="${k}"><span class="ico">${i}</span>${n}</button>`).join('') + `</div>`;

  /* ================= Left: Detail Panel ================= */
  const DETAIL = {
    tpl: ['이 문서와 같은 유형의 템플릿', '스타일 바꾸기'], ai: ['발표자료 만들어줘', '문장을 짧게 바꿔줘', '1학년 수준으로 바꿔줘', '제목 추천'],
    text: ['제목 추가', '부제목 추가', '본문 추가', '글꼴 스타일 목록'], el: ['도형', '아이콘', '스티커', '표'],
    photo: ['사진 검색', '내 사진'], video: ['영상 클립 검색', '배경 영상'], audio: ['배경음악', '효과음'],
    bg: ['단색 배경', '이미지 배경', '움직이는 배경'], up: ['파일 올리기', '업로드 목록'],
  };
  const DetailPanel = () => {
    const name = (MENUS.find((m) => m[0] === ed().menu) || [])[2] || '';
    return `<div class="ed-detail"><h3>${name}</h3>
      <div class="ph-list">${(DETAIL[ed().menu] || []).map((d) => `<button class="ph-item">${d}</button>`).join('')}</div>
      <p style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin-top:12px">⚠ 자리표시 — 시안 반영 대상</p></div>`;
  };

  /* ================= Center: Canvas (편집) — 확대/축소 ================= */
  const BASE_W = 620;
  const CanvasArea = (scene) => {
    const e = ed(), CW = Math.round(BASE_W * e.zoom), CH = Math.round(CW * scene.height / scene.width);
    const els = scene.elements.map((el, i) => {
      const sel = e.selEl === i ? 'sel' : '';
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        return `<div class="ed-el ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight};line-height:1.25;color:${scene.background === '#1F2733' ? '#F2F5F9' : '#1F2733'};white-space:pre-wrap">${M().esc(el.text)}</div>`;
      }
      return `<div class="ed-el img-ph ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%">${M().esc(el.label)}</div>`;
    }).join('');
    return `<div class="ed-canvaswrap">
      <div class="ed-canvas" style="width:${CW}px;height:${CH}px;background:${scene.background}">${els}</div>
      <div class="ed-zoom">
        <button data-zoom="out">−</button>
        <button data-zoom="fit">${Math.round(e.zoom * 100)}%</button>
        <button data-zoom="in">＋</button>
      </div>
    </div>`;
  };

  /* ================= Right: Properties (속성) ================= */
  const fld = (label, control) => `<div class="fld"><label>${label}</label>${control}</div>`;
  const num = (v, attrs = '') => `<input class="mk-input" value="${v}" ${attrs}>`;
  const sel2 = (opts, cur) => `<select class="mk-input">${opts.map((o) => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`;

  const PropsPanel = (scene, mode) => {
    const e = ed(), s = e.selEl != null ? scene.elements[e.selEl] : null;
    let body;
    if (s && s.kind === 'text') {
      body = `<h3>텍스트 속성</h3>
        ${fld('내용', `<textarea class="mk-input" style="height:60px;padding:8px" data-ed="text-edit">${M().esc(s.text)}</textarea>`)}
        <div class="fld row2"><span><label>Font</label>${sel2(['기본 (임시)'], '기본 (임시)')}</span><span><label>Size</label>${num(s.size)}</span></div>
        <div class="fld row2"><span><label>Weight</label>${sel2(['보통', '굵게'], s.weight >= 700 ? '굵게' : '보통')}</span><span><label>Color</label>${num('자동')}</span></div>
        <div class="fld row2"><span><label>Align</label>${sel2(['왼쪽', '가운데', '오른쪽'], '왼쪽')}</span><span><label>Line Height</label>${num('1.25')}</span></div>
        ${fld('Letter Spacing', num('0'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>투명도</label>${num('100%')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">내용 입력만 실동작 — 나머지는 외형 검토용</p>`;
    } else if (s) {
      body = `<h3>이미지 속성</h3>
        ${fld('', M().Button({ label: '이미지 교체', kind: 'secondary', attrs: 'data-ed="img-swap" style="width:100%"' }))}
        <div class="fld row2"><span><label>Crop</label>${sel2(['원본', '정방형', '원형'], '원본')}</span><span><label>Brightness</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Contrast</label>${num('0')}</span><span><label>Saturation</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Opacity</label>${num('100%')}</span><span><label>Border Radius</label>${num('0')}</span></div>
        ${fld('Shadow', sel2(['없음', '은은하게', '뚜렷하게'], '없음'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>필터</label>${sel2(['없음', '흑백', '따뜻하게'], '없음')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">교체 버튼만 실동작(더미) — 나머지는 외형 검토용</p>`;
    } else {
      body = `<h3>Scene 속성</h3>
        <div class="fld row2"><span><label>배경</label>${num(scene.background)}</span><span><label>전환</label>${sel2(['fade', 'slide', 'none'], scene.transition)}</span></div>
        ${mode === 'video' ? fld('길이 (초)', num(scene.duration, 'data-ed="dur"')) : ''}
        <p class="hint">캔버스에서 요소를 클릭하면 해당 속성이 열립니다</p>`;
    }
    return `<div class="ed-props"><small class="ed-zone-cap">속성</small>${body}</div>`;
  };

  /* ================= Bottom: Scene Strip / Timeline ================= */
  const BottomBar = (mode) => {
    const e = ed(), doc = e.doc;
    if (mode === 'video') {
      const total = doc.scenes.reduce((a, s) => a + s.duration, 0);
      const blocks = doc.scenes.map((s, i) =>
        `<button class="ed-tl-block ${i === e.sceneIdx ? 'on' : ''}" data-scene="${i}" style="width:${Math.max(70, s.duration * 34)}px"><b>${i + 1}. ${M().esc(s.name)}</b><span class="dur">⏱ ${s.duration}초</span></button>` +
        (i < doc.scenes.length - 1 ? `<span class="ed-tl-trans">⇄ ${M().esc(s.transition)}</span>` : '')).join('');
      return `<div class="ed-bottom">
        <div class="ed-playbar">${M().IconButton({ icon: '▶', tip: '재생 (외형만)' })}<div class="track"><i></i></div><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">0:00 / 0:${String(total).padStart(2, '0')} · 총 ${doc.scenes.length}장면</span></div>
        <div class="ed-timeline">${blocks}<button class="ed-strip-add" data-ed="add" style="height:52px">＋</button></div></div>`;
    }
    return `<div class="ed-bottom"><div class="ed-strip">
      ${doc.scenes.map((s, i) => M().SceneCard(s, i, i === e.sceneIdx, `data-scene="${i}"`)).join('')}
      <button class="ed-strip-add" data-ed="add">＋<br>Scene</button></div></div>`;
  };

  /* ================= 화면 ================= */
  return {
    title: 'Editor', variants: ['Design', 'Video'], flush: true,
    render(v) {
      const e = ed();
      if (!e.doc) PG.loadEditorDoc('smp-pres-01');
      if (e.zoom == null) e.zoom = 1;
      e.mode = v === 'Video' ? 'video' : 'design';
      const scene = e.doc.scenes[e.sceneIdx];
      return `<div class="ed">${Toolbar(e.mode)}
        <div class="ed-mid">${MainMenu()}${DetailPanel()}${CanvasArea(scene)}${PropsPanel(scene, e.mode)}</div>
        ${BottomBar(e.mode)}</div>`;
    },
    mount(root) {
      const e = ed(), doc = e.doc, M2 = window.MK;
      root.querySelector('[data-ed="back"]').onclick = () => PG.go(PG.state.create && PG.state.create.tpl ? 'create' : 'templates');
      root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PG.state.variants.editor = b.dataset.tab; PG.render(); });
      root.querySelectorAll('[data-menu]').forEach((b) => b.onclick = () => { e.menu = b.dataset.menu; PG.render(); });
      root.querySelectorAll('[data-scene]').forEach((b) => b.onclick = () => { e.sceneIdx = +b.dataset.scene; e.selEl = null; PG.render(); });
      root.querySelectorAll('[data-el]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); e.selEl = +b.dataset.el; PG.render(); });
      root.querySelector('.ed-canvas').onclick = (ev) => { if (ev.target.classList.contains('ed-canvas')) { e.selEl = null; PG.render(); } };
      /* 줌 */
      root.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
        if (b.dataset.zoom === 'in') e.zoom = Math.min(1.6, +(e.zoom + 0.1).toFixed(2));
        else if (b.dataset.zoom === 'out') e.zoom = Math.max(0.4, +(e.zoom - 0.1).toFixed(2));
        else e.zoom = 1;
        PG.render();
      });
      /* Toolbar 동작 */
      root.querySelector('[data-ed="save"]').onclick = () => { e.savedAt = '방금'; document.getElementById('edSave').textContent = '저장됨 · 방금'; };
      root.querySelector('[data-ed="preview"]').onclick = () => M2.Modal.open(`<h2>미리보기</h2>
        <div style="border:1px solid var(--mk-border);border-radius:8px;overflow:hidden;margin:12px 0">${M2.sceneThumb(doc.scenes[e.sceneIdx])}</div>
        <p style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">전체 장면 재생은 후속 단계 (kmake 엔진 이식)</p>
        <div style="text-align:right;margin-top:10px">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      root.querySelector('[data-ed="share"]').onclick = () => M2.Modal.open(`<h2>공유</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">보기 전용 링크 (Placeholder)</p>
        <div style="display:flex;gap:8px;margin:12px 0"><input class="mk-input" value="kmaker.app/v/abc123" readonly>${M2.Button({ label: '복사', kind: 'secondary' })}</div>
        <div style="text-align:right">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      root.querySelector('[data-ed="export"]').onclick = () => M2.Modal.open(`<h2>내보내기</h2>
        <div class="ph-list" style="margin:12px 0">${['PNG 이미지', 'PDF 문서', 'PPT 파일', 'MP4 영상'].map((n) => `<button class="ph-item">${n}</button>`).join('')}</div>
        <p style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">실제 출력은 후속 단계 (kmake 내보내기 엔진 이식)</p>
        <div style="text-align:right;margin-top:10px">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      /* Scene 조작 */
      root.querySelectorAll('[data-op]').forEach((b) => b.onclick = (ev) => {
        ev.stopPropagation();
        const i = +b.dataset.i, sc = doc.scenes;
        if (b.dataset.op === 'dup') { const c = JSON.parse(JSON.stringify(sc[i])); c.name += ' 복제'; sc.splice(i + 1, 0, c); e.sceneIdx = i + 1; }
        else if (sc.length > 1) { sc.splice(i, 1); e.sceneIdx = Math.min(e.sceneIdx, sc.length - 1); }
        e.selEl = null; PG.render();
      });
      const add = root.querySelector('[data-ed="add"]');
      if (add) add.onclick = () => {
        const base = doc.scenes[doc.scenes.length - 1];
        doc.scenes.push({ ...JSON.parse(JSON.stringify(base)), name: '새 장면', elements: [{ kind: 'text', x: 10, y: 40, w: 80, size: 6, text: '내용을 입력하세요', weight: 700 }] });
        e.sceneIdx = doc.scenes.length - 1; e.selEl = null; PG.render();
      };
      /* 더미 편집 */
      const te = root.querySelector('[data-ed="text-edit"]');
      if (te) te.oninput = () => {
        doc.scenes[e.sceneIdx].elements[e.selEl].text = te.value;
        const cv = root.querySelector(`.ed-el[data-el="${e.selEl}"]`);
        if (cv) cv.textContent = te.value;
      };
      const sw = root.querySelector('[data-ed="img-swap"]');
      if (sw) sw.onclick = () => { doc.scenes[e.sceneIdx].elements[e.selEl].label = '교체된 이미지 ✓'; PG.render(); };
      const dur = root.querySelector('[data-ed="dur"]');
      if (dur) dur.onchange = () => { doc.scenes[e.sceneIdx].duration = Math.max(1, Math.min(30, +dur.value || 1)); PG.render(); };
    },
  };
})();
