/* ============================================================
   화면: Editor  — §6 골격 (Toolbar / Main Menu / Detail Panel /
   Canvas / Property Panel / Scene Strip↔Timeline)
   Design 모드: 하단 = Scene 목록(스트립)
   Video  모드: 하단 = 길이 표시 간이 타임라인 + 재생 UI(외형만)
   Scene 선택·제목 텍스트 변경·이미지 교체 버튼·추가·복제·삭제 동작.
   실제 렌더링·저장·드래그는 미구현 (외형과 흐름 검토용).
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.editor = {
  title: 'Editor', variants: ['Design', 'Video'], flush: true,

  render(v) {
    const M = window.MK, ed = PG.state.editor;
    if (!ed.doc) PG.loadEditorDoc('smp-pres-01');
    if (v === 'Video' && ed.mode !== 'video') ed.mode = 'video';
    if (v === 'Design' && ed.mode !== 'design') ed.mode = 'design';
    const doc = ed.doc, scene = doc.scenes[ed.sceneIdx];

    /* ---- 상단 Toolbar ---- */
    const toolbar = `<div class="ed-toolbar">
      ${M.IconButton({ icon: '←', tip: '나가기', attrs: 'data-ed="back"' })}
      <span class="fname">${M.esc(doc.title)}</span><span class="savestate">임시 문서 · 저장 안 함</span>
      <span class="grow"></span>
      ${M.IconButton({ icon: '↺', tip: '실행 취소' })}${M.IconButton({ icon: '↻', tip: '다시 실행' })}
      ${M.Tabs({ items: ['Design', 'Video'], on: ed.mode === 'video' ? 'Video' : 'Design', attrs: 'data-ed="mode"' })}
      ${M.Button({ label: '미리보기', kind: 'secondary', size: 'sm' })}
      ${M.Button({ label: '내보내기', kind: 'accent', size: 'sm' })}
    </div>`;

    /* ---- 좌측 Main Menu + Detail Panel ---- */
    const menus = [['tpl', '📐', '템플릿'], ['ai', '✨', 'AI'], ['text', '가', '텍스트'], ['el', '⬡', '요소'],
      ['photo', '🖼', '사진'], ['video', '🎬', '영상'], ['audio', '🎵', '오디오'], ['bg', '🎨', '배경'], ['up', '⤴', '업로드']];
    const mainmenu = `<div class="ed-mainmenu">${menus.map(([k, i, n]) =>
      `<button class="${ed.menu === k ? 'on' : ''}" data-menu="${k}"><span class="ico">${i}</span>${n}</button>`).join('')}</div>`;
    const detailBody = {
      tpl: ['이 문서와 같은 유형의 템플릿 목록', '스타일 바꾸기'], ai: ['발표자료 만들어줘', '문장을 짧게 바꿔줘', '1학년 수준으로 바꿔줘', '제목 추천'],
      text: ['제목 추가', '부제목 추가', '본문 추가', '글꼴 스타일 목록'], el: ['도형', '아이콘', '스티커', '표'],
      photo: ['사진 검색', '내 사진'], video: ['영상 클립 검색', '배경 영상'], audio: ['배경음악', '효과음'],
      bg: ['단색 배경', '이미지 배경', '움직이는 배경'], up: ['파일 올리기', '업로드 목록'],
    }[ed.menu] || [];
    const menuName = (menus.find((m) => m[0] === ed.menu) || [])[2] || '';
    const detail = `<div class="ed-detail"><h3>${menuName}</h3>
      <div class="ph-list">${detailBody.map((d) => `<button class="ph-item">${d}</button>`).join('')}</div>
      <p style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin-top:12px">⚠ 보조 패널 내용은 자리표시 — 시안 반영 대상</p></div>`;

    /* ---- 중앙 Canvas (Scene 요소를 스케일 렌더) ---- */
    const CW = 620, CH = Math.round(CW * scene.height / scene.width);
    const els = scene.elements.map((el, i) => {
      const sel = ed.selEl === i ? 'sel' : '';
      if (el.kind === 'text') {
        const fs = el.size / 100 * CH;
        return `<div class="ed-el ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight};line-height:1.25;color:${scene.background === '#1F2733' ? '#F2F5F9' : '#1F2733'};white-space:pre-wrap">${M.esc(el.text)}</div>`;
      }
      return `<div class="ed-el img-ph ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%">${M.esc(el.label)}</div>`;
    }).join('');
    const canvas = `<div class="ed-canvaswrap"><div class="ed-canvas" style="width:${CW}px;height:${CH}px;background:${scene.background}">${els}</div></div>`;

    /* ---- 우측 Property Panel (선택 요소에 따라) ---- */
    let props;
    const sel = ed.selEl != null ? scene.elements[ed.selEl] : null;
    if (sel && sel.kind === 'text') {
      props = `<h3>텍스트 속성</h3>
        <div class="fld"><label>내용</label><textarea class="mk-input" style="height:64px;padding:8px" data-ed="text-edit">${M.esc(sel.text)}</textarea></div>
        <div class="fld row2"><span><label>글꼴</label><select class="mk-input"><option>기본 (임시)</option></select></span><span><label>크기</label><input class="mk-input" value="${sel.size}"></span></div>
        <div class="fld row2"><span><label>굵기</label><select class="mk-input"><option ${sel.weight >= 700 ? 'selected' : ''}>굵게</option><option ${sel.weight < 700 ? 'selected' : ''}>보통</option></select></span><span><label>정렬</label><select class="mk-input"><option>왼쪽</option><option>가운데</option></select></span></div>
        <div class="fld row2"><span><label>색상</label><input class="mk-input" value="자동"></span><span><label>투명도</label><input class="mk-input" value="100%"></span></div>
        <p class="hint">내용 입력만 실동작 — 나머지 필드는 외형 검토용</p>`;
    } else if (sel) {
      props = `<h3>이미지 속성</h3>
        <div class="fld">${window.MK.Button({ label: '이미지 교체', kind: 'secondary', attrs: 'data-ed="img-swap" style="width:100%"' })}</div>
        <div class="fld row2"><span><label>자르기</label><select class="mk-input"><option>원본</option><option>원형</option></select></span><span><label>필터</label><select class="mk-input"><option>없음</option><option>흑백</option></select></span></div>
        <div class="fld row2"><span><label>밝기</label><input class="mk-input" value="0"></span><span><label>대비</label><input class="mk-input" value="0"></span></div>
        <div class="fld row2"><span><label>모서리</label><input class="mk-input" value="0"></span><span><label>그림자</label><select class="mk-input"><option>없음</option></select></span></div>
        <p class="hint">교체 버튼만 실동작(더미 교체) — 필드는 외형 검토용</p>`;
    } else {
      props = `<h3>Scene 속성</h3>
        <div class="fld row2"><span><label>배경</label><input class="mk-input" value="${scene.background}"></span><span><label>전환</label><select class="mk-input"><option ${scene.transition === 'fade' ? 'selected' : ''}>fade</option><option ${scene.transition === 'slide' ? 'selected' : ''}>slide</option><option ${scene.transition === 'none' ? 'selected' : ''}>none</option></select></span></div>
        ${ed.mode === 'video' ? `<div class="fld"><label>길이 (초)</label><input class="mk-input" value="${scene.duration}" data-ed="dur"></div>` : ''}
        <p class="hint">캔버스에서 요소를 클릭하면 해당 속성이 열립니다</p>`;
    }
    const propPanel = `<div class="ed-props">${props}</div>`;

    /* ---- 하단: Design=Scene Strip / Video=Timeline ---- */
    let bottom;
    if (ed.mode === 'video') {
      const total = doc.scenes.reduce((a, s) => a + s.duration, 0);
      const blocks = doc.scenes.map((s, i) =>
        `<button class="ed-tl-block ${i === ed.sceneIdx ? 'on' : ''}" data-scene="${i}" style="width:${Math.max(70, s.duration * 34)}px"><b>${i + 1}. ${M.esc(s.name)}</b><span class="dur">⏱ ${s.duration}초</span></button>` +
        (i < doc.scenes.length - 1 ? `<span class="ed-tl-trans">⇄ ${M.esc(s.transition)}</span>` : '')).join('');
      bottom = `<div class="ed-bottom">
        <div class="ed-playbar">${M.IconButton({ icon: '▶', tip: '재생 (외형만)' })}<div class="track"><i></i></div><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">0:00 / 0:${String(total).padStart(2, '0')} · 총 ${doc.scenes.length}장면</span></div>
        <div class="ed-timeline">${blocks}<button class="ed-strip-add" data-ed="add" style="height:52px">＋</button></div></div>`;
    } else {
      bottom = `<div class="ed-bottom"><div class="ed-strip">
        ${doc.scenes.map((s, i) => M.SceneCard(s, i, i === ed.sceneIdx, `data-scene="${i}"`)).join('')}
        <button class="ed-strip-add" data-ed="add">＋<br>Scene</button></div></div>`;
    }

    return `<div class="ed">${toolbar}<div class="ed-mid">${mainmenu}${detail}${canvas}${propPanel}</div>${bottom}</div>`;
  },

  mount(root) {
    const ed = PG.state.editor, doc = ed.doc;
    root.querySelector('[data-ed="back"]').onclick = () => PG.go('templates');
    root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PG.state.variants.editor = b.dataset.tab; PG.render(); });
    root.querySelectorAll('[data-menu]').forEach((b) => b.onclick = () => { ed.menu = b.dataset.menu; PG.render(); });
    root.querySelectorAll('[data-scene]').forEach((b) => b.onclick = () => { ed.sceneIdx = +b.dataset.scene; ed.selEl = null; PG.render(); });
    root.querySelectorAll('[data-el]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); ed.selEl = +b.dataset.el; PG.render(); });
    root.querySelector('.ed-canvas').onclick = (e) => { if (e.target.classList.contains('ed-canvas')) { ed.selEl = null; PG.render(); } };
    root.querySelectorAll('[data-op]').forEach((b) => b.onclick = (e) => {
      e.stopPropagation();
      const i = +b.dataset.i, scenes = doc.scenes;
      if (b.dataset.op === 'dup') { const c = JSON.parse(JSON.stringify(scenes[i])); c.name += ' 복제'; scenes.splice(i + 1, 0, c); ed.sceneIdx = i + 1; }
      else if (scenes.length > 1) { scenes.splice(i, 1); ed.sceneIdx = Math.min(ed.sceneIdx, scenes.length - 1); }
      ed.selEl = null; PG.render();
    });
    const add = root.querySelector('[data-ed="add"]');
    if (add) add.onclick = () => {
      const base = doc.scenes[doc.scenes.length - 1];
      doc.scenes.push({ ...JSON.parse(JSON.stringify(base)), name: '새 장면', elements: [{ kind: 'text', x: 10, y: 40, w: 80, size: 6, text: '내용을 입력하세요', weight: 700 }] });
      ed.sceneIdx = doc.scenes.length - 1; ed.selEl = null; PG.render();
    };
    const te = root.querySelector('[data-ed="text-edit"]');
    if (te) te.oninput = () => {
      doc.scenes[ed.sceneIdx].elements[ed.selEl].text = te.value;
      const cv = root.querySelector(`.ed-el[data-el="${ed.selEl}"]`);
      if (cv) cv.textContent = te.value;
    };
    const sw = root.querySelector('[data-ed="img-swap"]');
    if (sw) sw.onclick = () => {
      const el = doc.scenes[ed.sceneIdx].elements[ed.selEl];
      el.label = '교체된 이미지 ✓'; PG.render();
    };
    const dur = root.querySelector('[data-ed="dur"]');
    if (dur) dur.onchange = () => { doc.scenes[ed.sceneIdx].duration = Math.max(1, Math.min(30, +dur.value || 1)); PG.render(); };
  },
};
