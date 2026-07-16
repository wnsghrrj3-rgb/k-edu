/* ============================================================
   화면: My Projects — Project Dashboard (#/projects)
   ------------------------------------------------------------
   섹션 4: 최근 작업 · 즐겨찾기 · 공유됨 · 휴지통
   Project Card: 썸네일·이름·마지막 수정일·종류·Scene수·공유·즐겨찾기
   Detail(2단 대형 모달): 정보 / 사용 Template / Scene 목록 /
     사용 Asset / AI 기록 / Export 기록 + 액션 6종
     (열기·이름 변경·복제·공유·즐겨찾기·삭제)
   Editor 연결: 열기 → MK_PROJ.open → 작업본(doc) 그대로 탑재
   ⚠ 실DB 없음 — 세션 메모리 샘플.
   ============================================================ */
(() => {
  const M = () => window.MK, P = () => window.MK_PROJ;

  const S = { section: 'recent' };
  const SECTIONS = [['recent', '최근 작업'], ['fav', '☆ 즐겨찾기'], ['shared', '↗ 공유됨'], ['trash', '🗑 휴지통']];
  const typeName = (ct) => (window.MK_SAMPLE.TYPES.find((t) => t.key === ct) || {}).name || ct;

  /* ---------- Project Card ---------- */
  const card = (p) => {
    const m = M();
    return `<button class="pj-card ${p.trashed ? 'trashed' : ''}" data-pj="${p.projectId}">
      <div class="thumb">
        ${p.shared ? '<span class="shared">↗ 공유됨</span>' : ''}
        <span class="fav ${p.fav ? 'on' : ''}" data-pj-fav="${p.projectId}">${p.fav ? '★' : '☆'}</span>
        ${m.sceneThumb(p.doc.scenes[0])}
      </div>
      <div class="meta">
        <b title="${m.esc(p.name)}">${m.esc(p.name)}</b>
        <small>${m.esc(typeName(p.contentType))} · 장면 ${p.doc.scenes.length} · ${P().ago(p.updatedAt)}</small>
      </div>
    </button>`;
  };

  /* ---------- Project Detail (2단 모달) ---------- */
  function openDetail(pid) {
    const m = M(), p = P().get(pid);
    if (!p) return;
    const tpl = p.templateId ? window.MK_TPL.get(p.templateId) : null;
    const assets = (p.doc.engine?.assetIds || []).map((aid) => window.MK_ASSETS.ASSETS.find((a) => a.id === aid)).filter(Boolean);
    const draw = () => `<div class="pj-detail">
      <div class="left">
        <div class="stage">${m.sceneThumb(p.doc.scenes[0])}</div>
        <div class="sg"><h4>Scene 목록 (${p.doc.scenes.length})</h4>
          <div class="strip">${p.doc.scenes.map((s, i) => `<div class="th"><div class="fr">${m.sceneThumb(s)}</div><small>${i + 1}. ${m.esc(s.name)}</small></div>`).join('')}</div></div>
      </div>
      <div class="right">
        <h2>${m.esc(p.name)}</h2>
        <table class="info">
          <tr><th>종류</th><td>${m.esc(typeName(p.contentType))}</td></tr>
          <tr><th>만든 날</th><td>${P().ago(p.createdAt)}</td></tr>
          <tr><th>마지막 수정</th><td>${P().ago(p.updatedAt)}</td></tr>
          <tr><th>사용 Template</th><td>${tpl ? m.esc(tpl.title) : 'AI 생성 (템플릿 없음)'}</td></tr>
          <tr><th>사용 Asset</th><td>${assets.length ? assets.map((a) => m.esc(a.name)).join(', ') : '없음'}</td></tr>
          <tr><th>공유</th><td>${p.shared ? '공유 중 (뷰어 링크)' : '비공개'}</td></tr>
        </table>
        <div class="sg"><h4>AI 기록 (${p.aiHistory.length})</h4>
          ${p.aiHistory.length ? `<ul class="hist">${p.aiHistory.slice().reverse().map((h) => `<li><b>${m.esc(h.action)}</b> — 「${m.esc(h.prompt)}」 <small>${P().ago(h.at)}</small></li>`).join('')}</ul>` : '<p class="mut2">아직 없어요</p>'}</div>
        <div class="sg"><h4>Export 기록 (${p.exportHistory.length})</h4>
          ${p.exportHistory.length ? `<ul class="hist">${p.exportHistory.slice().reverse().map((h) => `<li><b>${m.esc(h.format)}</b> 내보냄 <small>${P().ago(h.at)}</small></li>`).join('')}</ul>` : '<p class="mut2">아직 없어요</p>'}</div>
        <div class="acts">
          ${p.trashed
            ? `${m.Button({ label: '복원', kind: 'accent', attrs: 'data-pj-restore' })}<div class="row">${m.Button({ label: '완전 삭제', kind: 'secondary', size: 'sm', attrs: 'data-pj-purge' })}</div>`
            : `${m.Button({ label: '열기', kind: 'accent', attrs: 'data-pj-open' })}
               <div class="row">
                 ${m.Button({ label: '이름 변경', kind: 'secondary', size: 'sm', attrs: 'data-pj-rename' })}
                 ${m.Button({ label: '⧉ 복제', kind: 'secondary', size: 'sm', attrs: 'data-pj-dup' })}
                 ${m.Button({ label: p.shared ? '공유 해제' : '↗ 공유', kind: 'secondary', size: 'sm', attrs: 'data-pj-share' })}
                 ${m.Button({ label: p.fav ? '★ 해제' : '☆ 즐겨찾기', kind: 'secondary', size: 'sm', attrs: 'data-pj-favbtn' })}
                 ${m.Button({ label: '🗑 삭제', kind: 'secondary', size: 'sm', attrs: 'data-pj-trash' })}
               </div>`}
        </div>
      </div>
    </div>`;
    m.Modal.open(draw());
    const back = document.getElementById('mkModal');
    back.querySelector('.mk-modal').classList.add('te-wide');
    const redraw = () => { back.querySelector('.mk-modal').innerHTML = draw(); wire(); };
    const refreshBehind = () => PG.render();
    function wire() {
      const on = (sel, fn) => { const b = back.querySelector(sel); if (b) b.onclick = fn; };
      on('[data-pj-open]', () => { m.Modal.close(); P().open(pid); });
      on('[data-pj-rename]', () => {
        const cur = P().get(pid).name;
        m.Modal.open(`<h2>이름 변경</h2>
          <input id="pjNm" type="text" value="${m.esc(cur)}" style="width:100%;margin:14px 0;height:40px;border:1px solid var(--mk-border);border-radius:var(--mk-r-small);padding:0 12px;font:var(--mk-t-body)">
          <div style="display:flex;gap:8px;justify-content:flex-end">
            ${m.Button({ label: '취소', kind: 'secondary', size: 'sm', attrs: 'data-nm-x' })}
            ${m.Button({ label: '저장', size: 'sm', attrs: 'data-nm-ok' })}
          </div>`);
        const b2 = document.getElementById('mkModal');
        b2.querySelector('[data-nm-x]').onclick = () => { m.Modal.close(); openDetail(pid); };
        b2.querySelector('[data-nm-ok]').onclick = () => {
          P().rename(pid, b2.querySelector('#pjNm').value);
          m.Modal.close(); refreshBehind(); openDetail(pid);
        };
      });
      on('[data-pj-dup]', () => { const c = P().duplicate(pid); m.Modal.close(); refreshBehind(); openDetail(c.projectId); });
      on('[data-pj-share]', () => { P().toggleShare(pid); refreshBehind(); redraw(); });
      on('[data-pj-favbtn]', () => { P().toggleFav(pid); refreshBehind(); redraw(); });
      on('[data-pj-trash]', () => { P().trash(pid); m.Modal.close(); refreshBehind(); });
      on('[data-pj-restore]', () => { P().restore(pid); m.Modal.close(); refreshBehind(); });
      on('[data-pj-purge]', () => {
        m.Modal.open(`<h2>완전히 삭제할까요?</h2>
          <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">「${m.esc(P().get(pid).name)}」 — 되돌릴 수 없어요.</p>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
            ${m.Button({ label: '취소', kind: 'secondary', size: 'sm', attrs: 'data-pg-x' })}
            ${m.Button({ label: '완전 삭제', size: 'sm', attrs: 'data-pg-ok style="background:var(--mk-danger)"' })}
          </div>`);
        const b3 = document.getElementById('mkModal');
        b3.querySelector('[data-pg-x]').onclick = () => { m.Modal.close(); openDetail(pid); };
        b3.querySelector('[data-pg-ok]').onclick = () => { P().purge(pid); m.Modal.close(); refreshBehind(); };
      });
    }
    wire();
  }

  /* ---------- 화면 ---------- */
  window.MK_SCREENS.projects = {
    title: 'My Projects', variants: ['v1'],
    render() {
      const m = M();
      const list = P().list(S.section);
      const cnt = (k) => P().list(k).length;
      return `<span class="pg-note">Project System v1 — K-MAKER 최상위 단위 · 실DB 없음(세션 샘플)</span>
        <div class="pj-tabs">${SECTIONS.map(([k, n]) => `<button class="pj-tab ${S.section === k ? 'on' : ''}" data-pj-sec="${k}">${n}<span class="cnt">${cnt(k)}</span></button>`).join('')}</div>
        ${list.length
          ? `<div class="pj-grid">${list.map(card).join('')}</div>`
          : `<div class="br-empty">${S.section === 'trash' ? '휴지통이 비어 있어요' : S.section === 'fav' ? '카드의 ☆로 즐겨찾기를 모아 보세요' : S.section === 'shared' ? '아직 공유한 프로젝트가 없어요' : 'Templates나 AI Studio에서 첫 프로젝트를 시작해 보세요'}</div>`}
        ${S.section === 'trash' && list.length ? '<p class="pj-trashnote">휴지통의 프로젝트는 카드를 눌러 복원하거나 완전 삭제할 수 있어요</p>' : ''}`;
    },
    mount(root) {
      root.querySelectorAll('[data-pj-sec]').forEach((b) => b.onclick = () => { S.section = b.dataset.pjSec; PG.render(); });
      root.querySelectorAll('[data-pj-fav]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); P().toggleFav(b.dataset.pjFav); PG.render(); });
      root.querySelectorAll('[data-pj]').forEach((b) => b.onclick = () => openDetail(b.dataset.pj));
    },
  };
})();
