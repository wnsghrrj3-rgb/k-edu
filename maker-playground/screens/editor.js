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
      ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14.5 5.5L8 12l6.5 6.5'/></svg>", tip: '나가기', attrs: 'data-ed="back"' })}
      <span class="ed-tb-file">
        <span class="fname">${M().esc(e.doc.title)}</span>
        <span class="savestate" id="edSave">${e.savedAt ? '저장됨 · ' + e.savedAt : '저장 안 함'}</span>
        ${M().Button({ label: '저장', kind: 'secondary', size: 'sm', attrs: 'data-ed="save"' })}
      </span>
      <span class="grow"></span>
      <span class="ed-tb-hist">
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M8 7L4.5 10.5 8 14'/><path d='M4.5 10.5H15a4.5 4.5 0 0 1 0 9h-3'/></svg>", tip: '실행 취소 (준비 중)', attrs: 'disabled' })}
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M16 7l3.5 3.5L16 14'/><path d='M19.5 10.5H9a4.5 4.5 0 0 0 0 9h-3'/></svg>", tip: '다시 실행 (준비 중)', attrs: 'disabled' })}
      </span>
      ${M().Tabs({ items: ['Design', 'Video'], on: mode === 'video' ? 'Video' : 'Design', attrs: 'data-ed="mode"' })}
      <span class="grow"></span>
      ${M().Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ed="preview"' })}
      ${M().Button({ label: '공유', kind: 'secondary', size: 'sm', attrs: 'data-ed="share"' })}
      ${M().Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ed="export"' })}
    </div>`;
  };

  /* ================= Left: Main Menu (추가) ================= */
  const MENUS = [['tpl', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 9.5h17M9.5 9.5v11'/></svg>", '템플릿'], ['ai', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7-4.7-1.8 4.7-1.8zM18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'/></svg>", 'AI'], ['text', '<span class="txtico">가</span>', '텍스트'], ['el', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='8' height='8' rx='1.5'/><circle cx='16.5' cy='16.5' r='4.2'/><path d='M12.5 7.5h4a3 3 0 0 1 3 3v1'/></svg>", '요소'],
    ['photo', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='4.5' width='17' height='15' rx='2.5'/><circle cx='9' cy='10' r='1.7'/><path d='M4.5 17l4.5-4.5 3.5 3.5 3-3 4 4'/></svg>", '사진'], ['video', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='5.5' width='13' height='13' rx='2.5'/><path d='M16 10l5-2.8v9.6L16 14z'/></svg>", '영상'], ['audio', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9.5 17.5V6.5l9-2v11'/><circle cx='7' cy='17.5' r='2.6'/><circle cx='16' cy='15.5' r='2.6'/></svg>", '오디오'], ['bg', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 14.5l5-5 6 6M13 12l3-3 4.5 4.5'/></svg>", '배경'], ['up', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 15.5v-11M7.5 8.5L12 4l4.5 4.5M4.5 19.5h15'/></svg>", '업로드']];
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
      <p class="ed-note">콘텐츠 연결 예정 — 외형 검토용</p></div>`;
  };

  /* ================= Center: Canvas (편집) — 확대/축소 ================= */
  const BASE_W = 680;
  const CanvasArea = (scene) => {
    const e = ed(), CW = Math.round(BASE_W * e.zoom), CH = Math.round(CW * scene.height / scene.width);
    const els = scene.elements.map((el, i) => {
      const sel = e.selEl === i ? 'sel' : '';
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        const hd = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
        const dark = scene.background === '#1F2733';
        const col = dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#C7CFDA') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A');
        return `<div class="ed-el ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight};line-height:1.3;color:${col};white-space:pre-wrap">${M().esc(el.text)}${hd}</div>`;
      }
      const hd2 = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
      const fillCls = el.fill ? 'has-fill' : '', fillSty = el.fill ? `;background:${el.fill}` : '';
      return `<div class="ed-el img-ph ${fillCls} ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${fillSty}">${M().esc(el.label)}${hd2}</div>`;
    }).join('');
    return `<div class="ed-canvaswrap">
      <div class="ed-canvas" style="width:${CW}px;height:${CH}px;background:${scene.background}">${els}</div>
      <div class="ed-zoom">
        <button data-zoom="out" aria-label="축소"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M5.5 12h13'/></svg></button>
        <button data-zoom="fit">${Math.round(e.zoom * 100)}%</button>
        <button data-zoom="in" aria-label="확대"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M12 5.5v13M5.5 12h13'/></svg></button>
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


  /* 실캔버스 축소 미리보기 — Strip·Timeline 공용 */
  const MiniScene = (scene, W = 108) => {
    const H = Math.round(W * scene.height / scene.width);
    const dark = scene.background === '#1F2733';
    const els = scene.elements.map((el) => {
      if (el.kind === 'text') {
        const fs = Math.max(3, el.size / 100 * H);
        const col = dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#C7CFDA') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A');
        return `<span style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400};color:${col}">${M().esc(el.text)}</span>`;
      }
      return `<i style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${el.fill ? ';background:' + el.fill + ';opacity:1' : ''}"></i>`;
    }).join('');
    return `<div class="ed-mini" style="background:${scene.background}" aria-hidden="true">${els}</div>`;
  };
  /* ================= Bottom: Scene Strip / Timeline ================= */
  const BottomBar = (mode) => {
    const e = ed(), doc = e.doc;
    if (mode === 'video') {
      const total = doc.scenes.reduce((a, s) => a + s.duration, 0);
      const done = doc.scenes.slice(0, e.sceneIdx).reduce((a, s) => a + s.duration, 0);
      const pct = total ? Math.round(done / total * 100) : 0;
      const blocks = doc.scenes.map((s, i) =>
        `<button class="ed-tl-block ${i === e.sceneIdx ? 'on' : ''}" data-scene="${i}" style="width:${Math.max(118, s.duration * 40)}px">${MiniScene(s, 132)}<span class="tx"><b>${i + 1}. ${M().esc(s.name)}</b><span class="dur">${s.duration}초</span></span></button>` +
        (i < doc.scenes.length - 1 ? `<span class="ed-tl-tr mk-tooltip" data-tip="전환: ${M().esc(s.transition)}" aria-label="전환 ${M().esc(s.transition)}"><svg viewBox='0 0 24 24' width='11' height='11' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 8.5h13M14 5l3.5 3.5L14 12M20 15.5H7M10 12l-3.5 3.5L10 19'/></svg></span>` : '')).join('');
      return `<div class="ed-bottom">
        <div class="ed-playbar">${M().IconButton({ icon: "<svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor' aria-hidden='true'><path d='M8 5.5v13l11-6.5z'/></svg>", tip: '재생 (외형만)' })}<div class="track"><i style="width:${pct}%"></i></div><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">0:${String(done).padStart(2, '0')} / 0:${String(total).padStart(2, '0')} · 총 ${doc.scenes.length}장면</span></div>
        <div class="ed-timeline">${blocks}<button class="ed-strip-add" data-ed="add" style="height:52px">＋</button></div></div>`;
    }
    return `<div class="ed-bottom"><div class="ed-strip-head"><span class="cap">장면</span><span class="prg"><b>${e.sceneIdx + 1}</b> / ${doc.scenes.length}</span></div><div class="ed-strip">
      ${doc.scenes.map((s, i) => `<div class="ed-sc ${i === e.sceneIdx ? 'on' : ''}">
        <button class="frame" data-scene="${i}" aria-label="장면 ${i + 1} ${M().esc(s.name)}">
          <span class="num">${i + 1}</span><span class="dur">${s.duration}초</span>${MiniScene(s, 148)}</button>
        <span class="nm">${M().esc(s.name)}</span>
        <div class="ed-sceneops">
          <button data-op="dup" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='8.5' y='8.5' width='12' height='12' rx='2'/><path d='M15.5 5.5h-10a2 2 0 0 0-2 2v10'/></svg> 복제</button>
          <button data-op="del" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13h9l1-13M10 10.5v5.5M14 10.5v5.5'/></svg> 삭제</button>
        </div>
      </div>`).join('')}
      <button class="ed-strip-add" data-ed="add" aria-label="장면 추가">＋</button></div></div>`;
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
        ${BottomBar(e.mode)}
        <div class="ed-mobile-guard" role="note">
          <b>K-MAKER Editor</b>
          <p>데스크톱 또는 태블릿 가로 화면에 최적화되어 있습니다.<br>PC에서 계속 작업해 주세요.</p>
          <button class="mk-btn accent" data-ed="guard-home">홈으로 이동</button>
        </div></div>`;
    },
    mount(root) {
      const e = ed(), doc = e.doc, M2 = window.MK;
      root.querySelector('[data-ed="back"]').onclick = () => PG.go(PG.state.create && PG.state.create.tpl ? 'create' : 'templates');
      const gh = root.querySelector('[data-ed="guard-home"]'); if (gh) gh.onclick = () => PG.go('home');
      root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PG.state.variants[PG.state.screen] = b.dataset.tab; PG.render(); });
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
      root.querySelector('[data-ed="save"]').onclick = () => { e.savedAt = '방금'; document.getElementById('edSave').textContent = '저장됨 · 방금'; const cur = window.MK_PROJ && window.MK_PROJ.current(); if (cur) window.MK_PROJ.rename(cur.projectId, cur.name); /* rename=touch 겸용 — 수정일 갱신 */ };
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

/* ============================================================
   Review Mode — #/review (디자인 검수 전용)
   무로그인·더미 데이터·읽기 전용(세션 내 조작 가능, 저장만 차단).
   샘플 자동 로드 + 전 패널 노출 + 요소 선택 상태로 시작 + 고급 펼침.
   ============================================================ */
window.MK_SCREENS.review = (() => {
  const E = () => window.MK_SCREENS.editor;
  return {
    title: 'Editor — Review Mode', variants: ['Design', 'Video'], flush: true, chromeless: true,
    render(v) {
      const e = PG.state.editor;
      if (!e.doc || !e.review) {
        PG.loadEditorDoc('smp-pres-01');
        e.review = true;
        const firstText = PG.state.editor.doc.scenes[0].elements.findIndex((el) => el.kind === 'text');
        e.selEl = firstText >= 0 ? firstText : 0;    /* 제목 선택 상태로 시작 — 우측 속성 폼 즉시 노출 */
        e.menu = e.menu || 'text';
      }
      return E().render(v);
    },
    mount(root) {
      E().mount(root);
      root.querySelector('.ed').classList.add('ed--review');
      /* 저장 차단 — 리뷰 모드의 유일한 제약 */
      const save = root.querySelector('[data-ed="save"]');
      const state = root.querySelector('#edSave');
      if (state) { state.textContent = '리뷰 모드 · 저장되지 않음'; state.style.color = 'var(--mk-coral)'; }
      if (save) save.onclick = () => { if (state) state.textContent = '리뷰 모드 — 저장하지 않습니다'; };
      /* 검수 편의 — 고급 섹션 펼침 */
      root.querySelectorAll('details.ed-adv').forEach((d) => { d.open = true; });
      /* 배지 */
      const tb = root.querySelector('.ed-toolbar');
      if (tb && !tb.querySelector('.ed-review-badge')) {
        const b = document.createElement('span');
        b.className = 'ed-review-badge';
        b.textContent = 'REVIEW';
        tb.insertBefore(b, tb.querySelector('.ed-tb-file'));
      }
      /* 나가기 → 리뷰 홈이 아닌 Home으로 (검수 동선 단순화) */
      const back = root.querySelector('[data-ed="back"]');
      if (back) back.onclick = () => PG.go('home');
    },
  };
})();
